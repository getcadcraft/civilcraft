/* SPDX-License-Identifier: Apache-2.0 */
/**
 * live-crypto.js — Studio Live's handshake and frame encryption, the JS end (owner: 0.5 session `live-relay`; spec
 * docs/STUDIO-LIVE-SPEC.md § 5, § 6, § 9; byte layout docs/LIVE-CRYPTO.md). The Rust end is desktop-shell's
 * `src-tauri/src/live/crypto.rs`; both produce the bytes in `tools/live-crypto/vectors.json`
 * (`node bin/test-live-crypto.mjs`).
 *
 * No `crypto.subtle`: a page Studio serves over plain http:// on the LAN is not a secure context. Everything comes from
 * the noble libraries (MIT), which a build maps in its manifest's import map:
 *   "@noble/curves/":  "/assets/vendor/noble-curves/current/",
 *   "@noble/hashes/":  "/assets/vendor/noble-hashes/current/",
 *   "@noble/ciphers/": "/assets/vendor/noble-ciphers/current/"
 * Randomness is `crypto.getRandomValues` (allowed outside secure contexts).
 *
 * Handshake (joiner = SPAKE2 side A, host = side B, the RustCrypto `spake2` crate's Ed25519 scheme byte for byte):
 *   const j = joinerHandshake(secret, context);  send(j.message)              // 1. A (33 bytes)
 *   const h = hostHandshake(secret, context);    send(h.receive(aMsg))        // 2. B (33 bytes)
 *   send(j.receive(bMsg))                                                      // 3. joiner's confirmation (32)
 *   const { confirm, session } = h.finish(cMsg); send(confirm)                // 4. host's confirmation (32)
 *   const session = j.finish(confirm)
 * `finish` throws LiveCryptoError code 'wrong_code' when the codes differ; on the host that is a wrong try to count.
 *
 * Session: `seal(body)` → frame, `open(frame)` → { kind: 'data', body } | { kind: 'rekey' }, `rekey()` (host only:
 * send the frame it returns; call it on every remaining connection when someone is removed), `exporter(label)`.
 * Any error from `open` means: close the connection.
 */
import { ed25519 } from '@noble/curves/ed25519.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hmac } from '@noble/hashes/hmac.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { chacha20poly1305 } from '@noble/ciphers/chacha.js';

export const VERSION = 1;
export const PAKE_LEN = 33;
export const CONFIRM_LEN = 32;
export const HEADER_LEN = 11;
export const TAG_LEN = 16;
export const CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const enc = new TextEncoder();
const LABEL = enc.encode('cadcraft-live/1');
const KIND_DATA = 0, KIND_REKEY = 1;
const DIR_JOINER = 0x4a, DIR_HOST = 0x48; // 'J', 'H'
const Point = ed25519.Point;
const L = 2n ** 252n + 27742317777372353535851937790883648493n;
// The spake2 crate's Ed25519 M and N (from python-spake2's ParamsEd25519).
const M = Point.fromBytes(hexBytes('15cfd18e385952982b6a8f8c7854963b58e34388c8e6dae891db756481a02312'));
const N = Point.fromBytes(hexBytes('f04f2e7eb734b2a8f8b472eaf9c3c632576ac64aea650b496a8a20ff00e583c3'));

export class LiveCryptoError extends Error {
  /** code: bad_message | wrong_code | bad_frame | order | role | exhausted | state */
  constructor(code) { super(code); this.name = 'LiveCryptoError'; this.code = code; }
}
const fail = (code) => { throw new LiveCryptoError(code); };

function hexBytes(h) {
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.substr(i * 2, 2), 16);
  return out;
}
function cat(...parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
const bytes = (v) => (typeof v === 'string' ? enc.encode(v) : v instanceof Uint8Array ? v : fail('bad_message'));
const beInt = (b) => b.reduce((n, x) => (n << 8n) | BigInt(x), 0n);
const leInt = (b) => b.reduceRight((n, x) => (n << 8n) | BigInt(x), 0n);
const derive = (ikm, info) => hkdf(sha256, ikm, LABEL, enc.encode(info), 32);
function same(x, y) {
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}
function random(n) {
  const b = new Uint8Array(n);
  globalThis.crypto.getRandomValues(b);
  return b;
}

/** The SPAKE2 identities bind the session's context ("lan:<tag>" or "relay:<room>"). */
function identities(context) {
  return [cat(LABEL, enc.encode(' joiner ' + context)), cat(LABEL, enc.encode(' host ' + context))];
}

function pwScalar(pw) {
  // spake2: HKDF-SHA256(salt "", info "SPAKE2 pw", 48 bytes) read big-endian, mod L.
  const s = beInt(hkdf(sha256, pw, new Uint8Array(0), enc.encode('SPAKE2 pw'), 48)) % L;
  return s === 0n ? fail('bad_message') : s;
}

/** side 'A' or 'B'; rng = 64 bytes (tests only), read little-endian mod L as curve25519-dalek's Scalar::random. */
function spakeStart(side, pw, rng) {
  const x = leInt(rng ? Uint8Array.from(rng) : random(64)) % L;
  if (x === 0n) fail('bad_message');
  const w = pwScalar(pw);
  const X = Point.BASE.multiply(x).add((side === 'A' ? M : N).multiply(w));
  return { x, w, msg: cat([side === 'A' ? 0x41 : 0x42], X.toBytes()) };
}

function spakeFinish(side, st, pw, idA, idB, other) {
  if (!(other instanceof Uint8Array) || other.length !== PAKE_LEN || other[0] !== (side === 'A' ? 0x42 : 0x41)) fail('bad_message');
  let Y;
  try { Y = Point.fromBytes(other.subarray(1)); } catch { fail('bad_message'); }
  const K = Y.add((side === 'A' ? N : M).multiply(L - st.w)).multiply(st.x).toBytes();
  const [first, second] = side === 'A' ? [st.msg.subarray(1), other.subarray(1)] : [other.subarray(1), st.msg.subarray(1)];
  return sha256(cat(sha256(pw), sha256(idA), sha256(idB), first, second, K));
}

function agreed(a, b, k) {
  // i18n-ignore: HKDF labels (LIVE-CRYPTO.md), not words
  const confirm = (role) => hmac(sha256, derive(k, role === 'joiner' ? 'confirm joiner' : 'confirm host'),
    cat(enc.encode(role), a, b));
  return {
    confirm,
    session: (role) => new Session(role, derive(k, 'frames j2h'), derive(k, 'frames h2j'), derive(k, 'resume')),
  };
}

/**
 * The joiner's side. `secret`: bytes or a string (a short code's 5 characters from `parseCode`, an invite link's
 * bytes from `parseLinkSecret`). `opts.rng`: 64 fixed bytes, tests only.
 */
export function joinerHandshake(secret, context, opts = {}) {
  const pw = bytes(secret);
  const [idA, idB] = identities(String(context));
  let st = spakeStart('A', pw, opts.rng), ag = null;
  return {
    message: st.msg,
    /** Takes the host's B message; returns the confirmation to send. */
    receive(hostMsg) {
      if (!st || ag) fail('state');
      const k = spakeFinish('A', st, pw, idA, idB, hostMsg);
      ag = agreed(st.msg, Uint8Array.from(hostMsg), k);
      return ag.confirm('joiner');
    },
    /** Checks the host's confirmation (throws 'wrong_code') and returns the session. */
    finish(hostConfirm) {
      if (!ag) fail('state');
      if (!(hostConfirm instanceof Uint8Array) || !same(hostConfirm, ag.confirm('host'))) fail('wrong_code');
      const s = ag.session('joiner');
      st = ag = null;
      return s;
    },
  };
}

/** The host's side, one per connection. */
export function hostHandshake(secret, context) {
  const pw = bytes(secret);
  const [idA, idB] = identities(String(context));
  let ag = null, done = false;
  return {
    /** Takes the joiner's A message; returns the B message to send. `opts.rng`: tests only. */
    receive(joinerMsg, opts = {}) {
      if (ag || done) fail('state');
      if (!(joinerMsg instanceof Uint8Array) || joinerMsg.length !== PAKE_LEN || joinerMsg[0] !== 0x41) fail('bad_message');
      const st = spakeStart('B', pw, opts.rng);
      const k = spakeFinish('B', st, pw, idA, idB, joinerMsg);
      ag = agreed(Uint8Array.from(joinerMsg), st.msg, k);
      return st.msg;
    },
    /** Checks the joiner's confirmation: throws 'wrong_code' (count it). Returns { confirm (send it), session }. */
    finish(joinerConfirm) {
      if (!ag || done) fail('state');
      done = true;
      if (!(joinerConfirm instanceof Uint8Array) || !same(joinerConfirm, ag.confirm('joiner'))) fail('wrong_code');
      return { confirm: ag.confirm('host'), session: ag.session('host') };
    },
  };
}

class Direction {
  constructor(key, dir, epoch = 0, counter = 0n) { this.key = key; this.dir = dir; this.epoch = epoch; this.counter = counter; }
  nonce() {
    const n = new Uint8Array(12);
    n[0] = this.dir; n[1] = this.epoch;
    new DataView(n.buffer).setBigUint64(4, this.counter);
    return n;
  }
  header(kind) {
    const h = new Uint8Array(HEADER_LEN);
    h[0] = VERSION; h[1] = kind; h[2] = this.epoch;
    new DataView(h.buffer).setBigUint64(3, this.counter);
    return h;
  }
  next() {
    if (this.epoch === 255) fail('exhausted');
    const k = derive(this.key, 'next');
    this.key.fill(0);
    this.key = k; this.epoch++; this.counter = 0n;
  }
  copy() { return new Direction(Uint8Array.from(this.key), this.dir, this.epoch, this.counter); }
}

export class Session {
  constructor(role, j2h, h2j, resume) {
    this.role = role;
    const joiner = role === 'joiner';
    this._send = new Direction(joiner ? j2h : h2j, joiner ? DIR_JOINER : DIR_HOST);
    this._recv = new Direction(joiner ? h2j : j2h, joiner ? DIR_HOST : DIR_JOINER);
    this._recvMax = 0; // host: the newest epoch it announced
    this._resume = resume;
  }
  /** How many rotations the send direction has had. */
  get epoch() { return this._send.epoch; }

  _seal(kind, body) {
    if (this._send.counter >= 1n << 63n) fail('exhausted');
    const header = this._send.header(kind);
    const ct = chacha20poly1305(this._send.key, this._send.nonce(), header).encrypt(body);
    this._send.counter++;
    return cat(header, ct);
  }
  /** Encrypts one frame body (a MessagePack envelope). */
  seal(body) { return this._seal(KIND_DATA, bytes(body)); }

  /** Host only: send the returned frame before any other; both directions move to the next keys. */
  rekey() {
    if (this.role !== 'host') fail('role');
    if (this._recvMax === 255) fail('exhausted');
    this._recvMax++;
    const frame = this._seal(KIND_REKEY, new Uint8Array(0));
    this._send.next();
    return frame;
  }

  /** Decrypts one frame → { kind: 'data', body } or { kind: 'rekey' }. Throws on anything else: close the connection. */
  open(frame) {
    if (!(frame instanceof Uint8Array) || frame.length < HEADER_LEN + TAG_LEN || frame[0] !== VERSION || frame[1] > KIND_REKEY) fail('bad_frame');
    const kind = frame[1], epoch = frame[2];
    const counter = new DataView(frame.buffer, frame.byteOffset, frame.byteLength).getBigUint64(3);
    if (kind === KIND_REKEY && this.role === 'host') fail('role');
    const d = this._recv.copy();
    if (epoch > d.epoch && epoch <= this._recvMax) while (d.epoch < epoch) d.next();
    if (epoch !== d.epoch || counter !== d.counter) fail('order');
    let body;
    try {
      body = chacha20poly1305(d.key, d.nonce(), frame.subarray(0, HEADER_LEN)).decrypt(frame.subarray(HEADER_LEN));
    } catch { fail('bad_frame'); }
    d.counter++;
    this._recv.key.fill(0);
    this._recv = d;
    if (kind === KIND_REKEY) {
      if (body.length) fail('bad_frame');
      this._recv.next();
      this._send.next();
      this._recvMax = this._recv.epoch;
      return { kind: 'rekey' };
    }
    return { kind: 'data', body };
  }

  /** A 32-byte secret for one purpose, the same on both ends and never sent (e.g. a reconnect ticket, LV.17). */
  exporter(label) { return derive(this._resume, String(label)); }
}

/**
 * A short code `TT-SSSSS` as typed (case, spaces and the dash don't matter; O reads as 0, I and L as 1) →
 * { tag, secret, context } or null. `secret` is the 5 normalized characters; `context` is "lan:<tag>".
 */
export function parseCode(code) {
  let s = '';
  for (const ch of String(code).toUpperCase()) {
    if (ch === ' ' || ch === '-') continue;
    const c = ch === 'O' ? '0' : ch === 'I' || ch === 'L' ? '1' : ch;
    if (!CODE_ALPHABET.includes(c)) return null;
    s += c;
  }
  if (s.length !== 7) return null;
  return { tag: s.slice(0, 2), secret: s.slice(2), context: 'lan:' + s.slice(0, 2) };
}

/** A new short code, e.g. "K7-Q4M2X". */
export function newCode() {
  const c = Array.from(random(7), (x) => CODE_ALPHABET[x & 31]).join('');
  return c.slice(0, 2) + '-' + c.slice(2);
}

/**
 * The LAN tag of an invite-link room (LV.26): 8 Crockford characters from SHA-256("cadcraft-live/1 room " + room). A host
 * with an open relay room also advertises `_ccstudio._tcp` under it, so a joiner holding the link finds the host on the
 * same network first, while nobody else there learns the room id.
 */
export function roomTag(room) {
  const d = sha256(cat(LABEL, enc.encode(' room ' + String(room))));
  const bits = d.subarray(0, 5).reduce((n, x) => (n << 8n) | BigInt(x), 0n);
  let t = '';
  for (let i = 0; i < 8; i++) t += CODE_ALPHABET[Number((bits >> BigInt(35 - 5 * i)) & 31n)];
  return t;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** base64url (no padding) → bytes, or null when it isn't. */
function fromB64url(s) {
  let bits = 0, n = 0;
  const out = [];
  for (const ch of String(s)) {
    const v = B64.indexOf(ch);
    if (v < 0) return null;
    bits = (bits << 6) | v; n += 6;
    if (n >= 8) { n -= 8; out.push((bits >> n) & 255); bits &= (1 << n) - 1; }
  }
  return bits !== 0 || String(s).length % 4 === 1 ? null : Uint8Array.from(out);
}

/**
 * Signed-in names (LV.19). getcadcraft.com's Ed25519 keys, pinned so a host can check a joiner's tick without reaching
 * the site (a LAN session may be offline). The site serves the same list at GET /api/v1/live/keys; a new key is added
 * here, released, and only then used by the site.
 */
export const ASSERTION_KEYS = [{ kid: 'a1f5b9cc', key: 'e2Bo1-R1Hnd9kDkp3I7LvT1kZWGMm1Ha2K_XRQVW6DY' }];
const ASSERTION_DOMAIN = enc.encode('cadcraft-live-assertion/1.');

/**
 * Checks a joiner's signed-in name (from POST /api/v1/live/assertion, sent in `hello`). `aud` = base64url of this
 * session's `exporter('assertion')` (both ends compute it). → { ok: true, name, sub, verified, pic } or
 * { ok: false, reason: format | key | signature | expired | audience }. Show the tick only on ok; approval stays the check.
 */
export function verifyAssertion(token, { aud, now = Date.now() / 1000, keys = ASSERTION_KEYS, skew = 60 } = {}) {
  const m = /^v1\.([A-Za-z0-9_-]{20,2000})\.([A-Za-z0-9_-]{86})$/.exec(String(token));
  if (!m) return { ok: false, reason: 'format' };
  const body = fromB64url(m[1]), sig = fromB64url(m[2]);
  let claims;
  try { claims = JSON.parse(new TextDecoder().decode(body)); } catch { return { ok: false, reason: 'format' }; }
  if (!sig || !claims || claims.v !== 1 || typeof claims.name !== 'string') return { ok: false, reason: 'format' };
  const k = keys.find((x) => x.kid === claims.kid);
  const pub = k && fromB64url(k.key);
  if (!pub || pub.length !== 32) return { ok: false, reason: 'key' };
  let good = false;
  try { good = ed25519.verify(sig, cat(ASSERTION_DOMAIN, enc.encode(m[1])), pub, { zip215: false }); } catch { good = false; }
  if (!good) return { ok: false, reason: 'signature' };
  if (!(claims.exp + skew > now) || !(claims.iat - skew <= now)) return { ok: false, reason: 'expired' };
  if (typeof aud !== 'string' || claims.aud !== aud) return { ok: false, reason: 'audience' };
  return { ok: true, name: claims.name, sub: claims.sub, verified: !!claims.verified, pic: claims.pic || null };
}

/** The `aud` for this session's assertions: base64url of exporter('assertion'). */
export function assertionAudience(session) {
  return toB64url(session.exporter('assertion'));
}

/** Does a picture that came with a joiner match the hash in their checked assertion (SI.8)? */
export function pictureMatches(bytes, pic) {
  if (!(bytes instanceof Uint8Array) || typeof pic !== 'string' || bytes.length > 16384) return false;
  return Array.from(sha256(bytes), (x) => x.toString(16).padStart(2, '0')).join('') === pic;
}

function toB64url(b) {
  let s = '';
  for (let i = 0; i < b.length; i += 3) {
    const chunk = b.subarray(i, i + 3);
    const v = (chunk[0] << 16) | ((chunk[1] ?? 0) << 8) | (chunk[2] ?? 0);
    for (let k = 0; k <= chunk.length; k++) s += B64[(v >> (18 - 6 * k)) & 63];
  }
  return s;
}

/** An invite link's fragment (base64url, no padding; a leading "#" is fine) → its 16–32 secret bytes, or null. */
export function parseLinkSecret(fragment) {
  const f = String(fragment).replace(/^#/, '');
  let bits = 0, n = 0;
  const out = [];
  for (const ch of f) {
    const v = B64.indexOf(ch);
    if (v < 0) return null;
    bits = (bits << 6) | v; n += 6;
    if (n >= 8) { n -= 8; out.push((bits >> n) & 255); bits &= (1 << n) - 1; }
  }
  if (bits !== 0 || f.length % 4 === 1 || out.length < 16 || out.length > 32) return null;
  return Uint8Array.from(out);
}

/** A new 128-bit invite secret as a link fragment (22 characters, no "#"). */
export function newLinkSecret() {
  const b = random(16);
  let s = '';
  for (let i = 0; i < b.length; i += 3) {
    const chunk = b.subarray(i, i + 3);
    const v = (chunk[0] << 16) | ((chunk[1] ?? 0) << 8) | (chunk[2] ?? 0);
    for (let k = 0; k <= chunk.length; k++) s += B64[(v >> (18 - 6 * k)) & 63];
  }
  return s;
}

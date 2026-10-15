/* SPDX-License-Identifier: Apache-2.0 */
/**
 * live-client.js — Studio Live's client (0.5 session live-core; spec docs/STUDIO-LIVE-SPEC.md, messages
 * docs/LIVE-PROTOCOL.md). A shared shell module: canonical here, byte-identical copies in every app's dev/ (only
 * `node tools/shell/sync.mjs` writes them). Import-free and DOM-free, so the same file runs in a page, a worker and Node.
 *
 * Part 1 — MessagePack (the frame body format). Own code, from the MessagePack spec; no library.
 * Part 2 — LiveClient: connect (WebSocket or an in-process transport), the handshake (the caller passes live-crypto.js
 *          in, so this file stays import-free and local clients never load it), hello / waiting / welcome, catch-up,
 *          a pending queue applied at once and rebased over incoming commits, rollback of refused edits, per-user
 *          undo / redo, holds, presence, pings, rejoin, host controls, the replica's validate / snapshot.
 *
 * The app side is the adapter (spec § 4): { app, schema, apply(ops, origin), invert(ops), touched(ops), load(bytes, q),
 * snapshot(), onLocalChange(cb), validate?(ops), presence?(), drawPresence?(peers), afterApply?(info) }.
 * - invert(ops) is called just before apply(ops) and must describe the CURRENT state (so the inverse stays right after
 *   a rebase); apply must skip ops on objects that don't exist (a refused create's dependants).
 * - onLocalChange(cb): the app reports each finished step as cb({ label, ops, inverse }) after applying it itself.
 *
 * Assistants as their own clients (0.5 LV.18, final sweep): an assistant connected to a person's window (Studio's control
 * channel) joins the session as a second LiveClient in that window — `new LiveClient({ person, assistantKey, … })`, made by
 * host.live.assistant() with a one-time key the person's client asked for (`requestAssistant()`). Both share ONE model,
 * which only the person's client changes: the assistant's client has no adapter of its own (it borrows the person's
 * `touched`), takes no catch-up, and its edits sit in BOTH pending lists (its own, for sending and re-sending; the
 * person's, so rebasing rolls back and re-applies every local edit in the order it was made). The person's client
 * applies every commit — the assistant's too, as its own — records the assistant's committed edits on the assistant's
 * undo stack, and takes back the ones refused (the assistant's client forwards its refusals). While `route(step)` names
 * the assistant's client (Studio: an assistant's edit call is running), a step the app reports goes to it instead, and so
 * do undo / redo (`undoClient()`). If the assistant's client ends, its edits still waiting are taken back here; any
 * already decided arrive as anyone else's.
 */

const te = new TextEncoder();
const td = new TextDecoder();

/** Encodes a value: null/undefined → nil, booleans, integers (safe range, and BigInt), other numbers → float64, strings,
 *  Uint8Array/ArrayBuffer → bin, arrays, Map and plain objects → map (string keys; undefined values left out). */
export function pack(value) {
  const w = new Writer();
  w.any(value);
  return w.done();
}

/** Decodes one value. Integers beyond 2^53 come back as BigInt; bin as Uint8Array; maps as plain objects (keys turned
 *  into strings). Throws on a truncated or malformed input, or trailing bytes. */
export function unpack(bytes) {
  // A plain Uint8Array view (a Node Buffer's slice() would alias instead of copy, and bin values must be Uint8Array).
  const u8 = ArrayBuffer.isView(bytes) ? new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength) : new Uint8Array(bytes);
  const r = new Reader(u8);
  const v = r.any(0);
  if (r.p !== u8.length) throw new Error('msgpack: trailing bytes'); // i18n-ignore: diagnostic
  return v;
}

class Writer {
  constructor() { this.buf = new Uint8Array(256); this.view = new DataView(this.buf.buffer); this.p = 0; }
  need(n) {
    if (this.p + n <= this.buf.length) return;
    let size = this.buf.length * 2;
    while (size < this.p + n) size *= 2;
    const nb = new Uint8Array(size); nb.set(this.buf.subarray(0, this.p));
    this.buf = nb; this.view = new DataView(nb.buffer);
  }
  u8(x) { this.need(1); this.buf[this.p++] = x; }
  u16(x) { this.need(2); this.view.setUint16(this.p, x); this.p += 2; }
  u32(x) { this.need(4); this.view.setUint32(this.p, x); this.p += 4; }
  bytes(b) { this.need(b.length); this.buf.set(b, this.p); this.p += b.length; }
  done() { return this.buf.slice(0, this.p); }
  any(v) {
    if (v === null || v === undefined) return this.u8(0xc0);
    switch (typeof v) {
      case 'boolean': return this.u8(v ? 0xc3 : 0xc2);
      case 'number': return Number.isInteger(v) && Number.isSafeInteger(v) ? this.int(v) : this.float(v);
      case 'bigint': return this.big(v);
      case 'string': return this.str(v);
      default: break;
    }
    if (v instanceof Uint8Array) return this.bin(v);
    if (v instanceof ArrayBuffer) return this.bin(new Uint8Array(v));
    if (ArrayBuffer.isView(v)) return this.bin(new Uint8Array(v.buffer, v.byteOffset, v.byteLength));
    if (Array.isArray(v)) {
      this.head(v.length, 0x90, 0xdc, 0xdd);
      for (const x of v) this.any(x);
      return;
    }
    if (v instanceof Map) {
      this.head(v.size, 0x80, 0xde, 0xdf);
      for (const [k, x] of v) { this.any(typeof k === 'number' ? k : String(k)); this.any(x); }
      return;
    }
    let n = 0;
    for (const k in v) if (Object.prototype.hasOwnProperty.call(v, k) && v[k] !== undefined) n++;
    this.head(n, 0x80, 0xde, 0xdf);
    for (const k in v) {
      if (!Object.prototype.hasOwnProperty.call(v, k) || v[k] === undefined) continue;
      this.str(k); this.any(v[k]);
    }
  }
  head(n, fix, b16, b32) {
    if (n < 16) this.u8(fix | n);
    else if (n < 0x10000) { this.u8(b16); this.u16(n); }
    else { this.u8(b32); this.u32(n); }
  }
  int(v) {
    if (v >= 0) {
      if (v < 128) return this.u8(v);
      if (v < 0x100) { this.u8(0xcc); return this.u8(v); }
      if (v < 0x10000) { this.u8(0xcd); return this.u16(v); }
      if (v < 0x100000000) { this.u8(0xce); return this.u32(v); }
      return this.big(BigInt(v));
    }
    if (v >= -32) return this.u8(v & 0xff);
    if (v >= -128) { this.u8(0xd0); this.need(1); this.view.setInt8(this.p, v); this.p += 1; return; }
    if (v >= -32768) { this.u8(0xd1); this.need(2); this.view.setInt16(this.p, v); this.p += 2; return; }
    if (v >= -2147483648) { this.u8(0xd2); this.need(4); this.view.setInt32(this.p, v); this.p += 4; return; }
    return this.big(BigInt(v));
  }
  big(v) {
    if (v >= 0n) {
      if (v < 0x100000000n) return this.int(Number(v));
      if (v > 0xffffffffffffffffn) throw new Error('msgpack: integer too large'); // i18n-ignore: diagnostic
      this.u8(0xcf); this.need(8); this.view.setBigUint64(this.p, v); this.p += 8; return;
    }
    if (v >= -2147483648n) return this.int(Number(v));
    if (v < -0x8000000000000000n) throw new Error('msgpack: integer too small'); // i18n-ignore: diagnostic
    this.u8(0xd3); this.need(8); this.view.setBigInt64(this.p, v); this.p += 8;
  }
  float(v) { this.u8(0xcb); this.need(8); this.view.setFloat64(this.p, v); this.p += 8; }
  str(s) {
    const len = s.length;
    if (len < 32) {
      // Short ASCII (keys, names, most values): written in place.
      let ascii = true;
      for (let i = 0; i < len; i++) if (s.charCodeAt(i) > 0x7f) { ascii = false; break; }
      if (ascii) {
        this.need(1 + len);
        const buf = this.buf; let p = this.p;
        buf[p++] = 0xa0 | len;
        for (let i = 0; i < len; i++) buf[p++] = s.charCodeAt(i);
        this.p = p;
        return;
      }
    }
    const b = te.encode(s);
    const n = b.length;
    if (n < 32) this.u8(0xa0 | n);
    else if (n < 0x100) { this.u8(0xd9); this.u8(n); }
    else if (n < 0x10000) { this.u8(0xda); this.u16(n); }
    else { this.u8(0xdb); this.u32(n); }
    this.bytes(b);
  }
  bin(b) {
    const n = b.length;
    if (n < 0x100) { this.u8(0xc4); this.u8(n); }
    else if (n < 0x10000) { this.u8(0xc5); this.u16(n); }
    else { this.u8(0xc6); this.u32(n); }
    this.bytes(b);
  }
}

const MAX_DEPTH = 512;

class Reader {
  constructor(u8) { this.u8 = u8; this.view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); this.p = 0; }
  need(n) { if (this.p + n > this.u8.length) throw new Error('msgpack: truncated'); } // i18n-ignore: diagnostic
  b() { this.need(1); return this.u8[this.p++]; }
  n16() { this.need(2); const v = this.view.getUint16(this.p); this.p += 2; return v; }
  n32() { this.need(4); const v = this.view.getUint32(this.p); this.p += 4; return v; }
  take(n) { this.need(n); const v = this.u8.subarray(this.p, this.p + n); this.p += n; return v; }
  any(depth) {
    if (depth > MAX_DEPTH) throw new Error('msgpack: too deep'); // i18n-ignore: diagnostic
    const t = this.b();
    if (t < 0x80) return t;
    if (t >= 0xe0) return t - 0x100;
    if ((t & 0xf0) === 0x80) return this.map(t & 0x0f, depth);
    if ((t & 0xf0) === 0x90) return this.arr(t & 0x0f, depth);
    if ((t & 0xe0) === 0xa0) return td.decode(this.take(t & 0x1f));
    const v = this.view;
    switch (t) {
      case 0xc0: return null;
      case 0xc2: return false;
      case 0xc3: return true;
      case 0xc4: return this.take(this.b()).slice();
      case 0xc5: return this.take(this.n16()).slice();
      case 0xc6: return this.take(this.n32()).slice();
      case 0xc7: { const n = this.b(); const type = this.b(); return { ext: type, data: this.take(n).slice() }; }
      case 0xc8: { const n = this.n16(); const type = this.b(); return { ext: type, data: this.take(n).slice() }; }
      case 0xc9: { const n = this.n32(); const type = this.b(); return { ext: type, data: this.take(n).slice() }; }
      case 0xca: { this.need(4); const x = v.getFloat32(this.p); this.p += 4; return x; }
      case 0xcb: { this.need(8); const x = v.getFloat64(this.p); this.p += 8; return x; }
      case 0xcc: return this.b();
      case 0xcd: return this.n16();
      case 0xce: return this.n32();
      case 0xcf: { this.need(8); const x = v.getBigUint64(this.p); this.p += 8; return x <= 9007199254740991n ? Number(x) : x; }
      case 0xd0: { this.need(1); const x = v.getInt8(this.p); this.p += 1; return x; }
      case 0xd1: { this.need(2); const x = v.getInt16(this.p); this.p += 2; return x; }
      case 0xd2: { this.need(4); const x = v.getInt32(this.p); this.p += 4; return x; }
      case 0xd3: { this.need(8); const x = v.getBigInt64(this.p); this.p += 8; return x >= -9007199254740991n && x <= 9007199254740991n ? Number(x) : x; }
      case 0xd4: return { ext: this.sb(), data: this.take(1).slice() };
      case 0xd5: return { ext: this.sb(), data: this.take(2).slice() };
      case 0xd6: return { ext: this.sb(), data: this.take(4).slice() };
      case 0xd7: return { ext: this.sb(), data: this.take(8).slice() };
      case 0xd8: return { ext: this.sb(), data: this.take(16).slice() };
      case 0xd9: return td.decode(this.take(this.b()));
      case 0xda: return td.decode(this.take(this.n16()));
      case 0xdb: return td.decode(this.take(this.n32()));
      case 0xdc: return this.arr(this.n16(), depth);
      case 0xdd: return this.arr(this.n32(), depth);
      case 0xde: return this.map(this.n16(), depth);
      case 0xdf: return this.map(this.n32(), depth);
      default: throw new Error('msgpack: unknown type 0x' + t.toString(16)); // i18n-ignore: diagnostic
    }
  }
  sb() { const x = this.b(); return x > 127 ? x - 256 : x; }
  arr(n, depth) {
    if (n > this.u8.length - this.p) throw new Error('msgpack: truncated'); // i18n-ignore: diagnostic
    const a = new Array(n);
    for (let i = 0; i < n; i++) a[i] = this.any(depth + 1);
    return a;
  }
  map(n, depth) {
    if (n * 2 > this.u8.length - this.p) throw new Error('msgpack: truncated'); // i18n-ignore: diagnostic
    const o = {};
    for (let i = 0; i < n; i++) {
      const k = this.any(depth + 1);
      const key = typeof k === 'string' ? k : String(k);
      if (key === '__proto__') { this.any(depth + 1); continue; }
      o[key] = this.any(depth + 1);
    }
    return o;
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Part 2 — the client

export const PROTOCOL = 1;
const PING_EVERY = 2000;
const GONE_AFTER = 6000;
const CONNECT_TIMEOUT = 1500;
const HOLD_REFRESH = 20000;
const PRESENCE_EVERY = 33;

/** A transport over a browser / Node WebSocket: `transport(handlers)` → { send(bytes), close() }. */
export function webSocketTransport(url, WS = globalThis.WebSocket) {
  return (h) => {
    const ws = new WS(url);
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => h.open();
    // Live frames are binary; text (the relay's {"t":"ready"} to a joiner) is not part of the protocol.
    ws.onmessage = (e) => { if (typeof e.data !== 'string') h.message(new Uint8Array(e.data)); };
    ws.onclose = (e) => h.close((e && e.reason) || '', (e && e.code) || 0);
    ws.onerror = () => {};
    return {
      send(b) { if (ws.readyState === 1) ws.send(b); },
      close() { try { ws.close(); } catch { /* already closed */ } },
      get connecting() { return ws.readyState === 0; },
    };
  };
}

const keyOf = (k, f) => k + '\u0000' + f;

export class LiveClient {
  /**
   * opts: { transport | url, WebSocket?, adapter, name, device?, hash?, proof?,
   *         code? ('K7-Q4M2X') | link? ({ room, secret }) | secure: false (in-process or a plain test server),
   *         crypto? (the live-crypto.js module; needed with code / link), role? ('host' | 'replica'), token?,
   *         now?, setTimeout?, clearTimeout?, schedule? (batching: requestAnimationFrame, else setTimeout 0), log?,
   *         signIn? (async (aud) → { assertion, picture? } | null: the signed-in name for `hello`, LV.19 / SI.8; asked once,
   *                  after the first handshake, with this connection's assertion audience; ≤ 4 s, else no tick),
   *         loadCrypto? (async () → live-crypto.js, when a host handoff needs a handshake and `crypto` wasn't given),
   *         relocate? ((url) → a transport to the new host after a handoff; default a WebSocket to the url),
   *         roomUrl? ((room) → the relay's join URL for a room: people who came through the relay follow the new host there),
   *         newRoom? (async () → room id | null: the new host opens a relay room of its own when people came through one),
   *         takeOver? (async (state bytes) → { addrs, port, transport, local? }: this window becomes the new host — Studio starts a
   *                    session server from the state and gives back its in-process transport, LV.17) }
   */
  constructor(opts) {
    this.o = opts;
    this.person = opts.person || null;           // LV.18: this client is that person's assistant (shares its model)
    this.assistants = new Set();                 // LV.18: on a person's client, its assistants' clients
    this.route = null;                           // LV.18: (step | {undo}) → an assistant's client to take it, or null
    this.adapter = this.person ? assistantAdapter(this.person.adapter) : opts.adapter;
    this.now = opts.now || (() => (globalThis.performance ? performance.now() : Date.now()));
    this.st = opts.setTimeout || ((f, ms) => setTimeout(f, ms));
    this.ct = opts.clearTimeout || ((t) => clearTimeout(t));
    this.schedule = opts.schedule || (globalThis.requestAnimationFrame ? (f) => requestAnimationFrame(f) : (f) => setTimeout(f, 0));
    this.transport = opts.transport || webSocketTransport(opts.url, opts.WebSocket);
    this.listeners = new Map();
    this.status = 'idle';
    this.c = 0; this.role = ''; this.prefix = ''; this.token = ''; this.session = '';
    this.q = 0;                    // last applied seq
    this.n = 0;                    // last edit counter used
    this.idCounter = 0;
    this.pending = [];             // own edits sent or waiting: {n, label, ops, inverse, touched, applied, kind, of}
    this.inbox = [];               // commits / refusals waiting for the next flush
    this.undoStack = [];           // own committed edits: {label, ops, inverse, touched, q, kind}
    this.redoStack = [];
    this.revs = new Map();         // key → seq of its last write
    this.propRevs = new Map();     // key\0field → [seq, client]
    this.peers = new Map();        // c → {c, name, role, via, state}
    this.presence = new Map();     // c → presence
    this.holds = new Map();        // key → c
    this.locks = new Set();
    this.myHolds = new Set();
    this.saved = { q: 0, hash: '' };
    this.welcomed = false;         // on the current connection
    this.everWelcomed = false;
    this.validated = new Set();    // replica: "c:n" applied through validate
    this.snap = null;              // snapshot being received
    this.loading = false;
    this.flushQueued = false;
    this.presenceDirty = false;
    this.presenceTimer = null;
    this.conn = null;
    this.keys = null;              // live-crypto Session of the current connection
    this.hs = null;
    this.timers = [];
    this.retryMs = 250;
    this.lastFrame = 0;
    this.ticket = null;            // exporter('ticket') of the last handshake
    this.key = null;               // { kid, secret, context }: our rejoin ticket (the first sealed connection's), used for every
                                   // reconnection once we were in — codes and links expire — and to reach a new host
    this.plainNext = false;        // the new host is this window's own in-process session: no handshake
    this.relocated = false;        // moved to a new host (no role claim in hello any more)
    this.move = null;              // { urls, i, tries } while looking for the new host
    this.hoParts = null;           // handover state chunks being received
    this.signedIn = null;          // { assertion, picture } from opts.signIn
    if (this.adapter && this.adapter.onLocalChange && !this.person) this.adapter.onLocalChange((step) => this.localChange(step));
  }

  on(type, cb) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(cb); return () => this.listeners.get(type).delete(cb); }
  emit(type, data) { for (const cb of this.listeners.get(type) || []) { try { cb(data); } catch (e) { this.log('listener', type, e); } } }
  log(...a) { if (this.o.log) this.o.log(...a); }
  setStatus(s, info) { if (this.status === s) return; this.status = s; this.emit('status', Object.assign({ status: s }, info || {})); }
  get secure() {
    if (this.plainNext) return false;
    if (this.everWelcomed && this.key) return true;
    return !this.relocated && this.o.secure !== false && !!(this.o.code || this.o.link || this.o.assistantKey);
  }
  get final() { return ['ended', 'denied', 'removed', 'lost', 'left', 'failed'].includes(this.status); }

  // ---- connection ------------------------------------------------------------------------------------------------

  connect() {
    if (this.final) return;
    this.setStatus(this.everWelcomed ? 'reconnecting' : 'connecting');
    this.welcomed = false; this.keys = null; this.hs = null;
    const conn = { t: null, opened: false, phase: 'open' };
    this.conn = conn;
    const guard = this.st(() => {
      if (this.conn === conn && !conn.opened) { conn.t.close(); this.dropped(conn, 'connect timeout'); } // i18n-ignore: diagnostic
    }, CONNECT_TIMEOUT);
    const open = () => {
      if (this.conn !== conn) return;
      if (!conn.t) return void Promise.resolve().then(open); // an in-process transport may open at once
      conn.opened = true; this.ct(guard); this.lastFrame = this.now(); this.opened();
    };
    conn.t = this.transport({
      open,
      message: (b) => { if (this.conn === conn) this.frame(b); },
      close: (why, code) => { this.ct(guard); if (this.conn === conn) this.dropped(conn, why, code); },
    });
    if (!this.pingTimer) this.pingTimer = this.every(1000, () => this.liveness());
  }

  every(ms, f) { let t; const loop = () => { f(); t = this.st(loop, ms); this.timers.push(t); }; t = this.st(loop, ms); this.timers.push(t); return true; }

  opened() {
    if (!this.secure) { this.conn.phase = 'hello'; return this.sendHello(); }
    const C = this.o.crypto;
    let secret, context, kid;
    if (this.everWelcomed && this.key) ({ secret, context, kid } = this.key);
    else if (this.o.assistantKey) {
      // LV.18: the one-time key the person's client was given for us; context names the session.
      const k = this.o.assistantKey;
      secret = k.secret; kid = k.kid; context = k.context || 'assistant:' + ((this.person && this.person.session) || '');
    } else if (this.o.code) {
      const p = C.parseCode(this.o.code);
      if (!p) return this.fail('bad-code');
      ({ secret, context } = p); kid = p.tag;
    } else {
      secret = this.o.link.secret instanceof Uint8Array ? this.o.link.secret : C.parseLinkSecret(this.o.link.secret);
      if (!secret) return this.fail('bad-link');
      context = 'relay:' + this.o.link.room; kid = this.o.link.kid || this.o.link.room;
    }
    this.hs = C.joinerHandshake(secret, context);
    this.conn.phase = 'pake2';
    this.raw({ t: 'pake', b: { kid, m: this.hs.message } });
  }

  sendHello() {
    const b = { v: PROTOCOL, app: this.adapter.app, schema: this.adapter.schema, name: this.o.name || '', device: this.o.device || '' };
    if (this.o.hash) b.hash = this.o.hash;
    if (this.o.proof) b.proof = this.o.proof;
    if (this.o.role && !this.relocated) { b.role = this.o.role; if (this.o.token) b.token = this.o.token; }
    if (this.signedIn && !this.everWelcomed) {
      if (typeof this.signedIn.assertion === 'string' && this.signedIn.assertion.length <= 2048) b.assertion = this.signedIn.assertion;
      if (this.signedIn.picture instanceof Uint8Array && this.signedIn.picture.length <= 16384) b.picture = this.signedIn.picture;
    }
    // LV.18: an assistant over an in-process (or plain test) connection, which has no handshake, shows its key here.
    if (this.o.assistantKey && !this.everWelcomed && !this.secure) b.assistant = { kid: this.o.assistantKey.kid, secret: this.o.assistantKey.secret };
    if (this.everWelcomed && this.token) {
      // n: the oldest edit still waiting for an answer — refusals from there on are sent again (one may have been lost).
      const own = this.pending.filter((p) => !p.by || p.by === this);
      b.resume = { c: this.c, token: this.token, q: this.q, n: own.length ? own[0].n : this.n + 1, holds: [...this.myHolds] };
    }
    this.send({ t: 'hello', b });
  }

  /** Plain envelope bytes (handshake only). */
  raw(env) { this.conn && this.conn.t.send(pack(env)); }

  send(env) {
    if (!this.conn || !this.conn.opened) return false;
    const bytes = pack(env);
    this.conn.t.send(this.keys ? this.keys.seal(bytes) : bytes);
    return true;
  }

  frame(bytes) {
    this.lastFrame = this.now();
    let body = bytes;
    if (this.keys) {
      let r;
      try { r = this.keys.open(bytes); } catch (e) { this.log('frame', e); return this.hangUp('bad frame'); } // i18n-ignore: diagnostic
      if (r.kind !== 'data') return;
      body = r.body;
    }
    let env;
    try { env = unpack(body); } catch (e) { this.log('decode', e); return this.hangUp('bad frame'); } // i18n-ignore: diagnostic
    if (this.conn.phase.startsWith('pake')) return this.pake(env);
    this.message(env);
  }

  pake(env) {
    if (env.t !== 'pake' || !(env.b && env.b.m instanceof Uint8Array)) return this.hangUp('handshake');
    try {
      if (this.conn.phase === 'pake2') {
        const confirm = this.hs.receive(env.b.m);
        this.conn.phase = 'pake4';
        this.raw({ t: 'pake', b: { m: confirm } });
      } else {
        this.keys = this.hs.finish(env.b.m);
        this.hs = null;
        if (typeof this.keys.exporter === 'function') this.ticket = this.keys.exporter('ticket');
        this.conn.phase = 'hello';
        if (this.o.signIn && !this.everWelcomed && !this.signedIn) return this.askSignIn();
        this.sendHello();
      }
    } catch (e) {
      this.log('handshake', e);
      this.fail(e && e.code === 'wrong_code' ? 'wrong-code' : 'handshake');
    }
  }

  /** LV.19: the signed-in name for hello, bound to this connection (aud); without an answer in 4 s, hello goes without. */
  askSignIn() {
    const conn = this.conn;
    const C = this.o.crypto;
    let aud = '';
    try { aud = C && typeof C.assertionAudience === 'function' ? C.assertionAudience(this.keys) : ''; } catch { aud = ''; }
    const go = (r) => {
      if (this.conn !== conn || conn.phase !== 'hello' || conn.helloSent) return;
      conn.helloSent = true;
      if (r && typeof r === 'object' && r.assertion) this.signedIn = { assertion: r.assertion, picture: r.picture instanceof Uint8Array ? r.picture : null };
      this.sendHello();
    };
    if (!aud) return go(null);
    this.timers.push(this.st(() => go(null), 4000));
    Promise.resolve().then(() => this.o.signIn(aud)).then(go, (e) => { this.log('signIn', e); go(null); });
  }

  /** The connection is gone: reconnect unless the session is over for us. */
  dropped(conn, why, code = 0) {
    if (this.conn !== conn) return;
    const phase = conn.phase;
    this.conn = null; this.keys = null; this.welcomed = false;
    for (const p of this.pending) if (!p.by || p.by === this) p.sent = false;
    // The host ended the session and the socket closed before the next flush: end now, never "reconnecting".
    if (this.inbox.some((x) => x.end) && !this.loading) this.flush();
    if (this.final) return;
    // Looking for the new host after a handoff: the next of its addresses.
    if (this.move && !this.welcomed) {
      // Every address tried three times and none answers: the new host is out of reach from here (another network, no
      // room through the relay). Keep the copy and say so.
      if (++this.move.tries >= this.move.urls.length * 3) { this.setStatus('lost', { reason: 'moved', moved: this.move.info }); return this.stop(); }
      this.move.i = (this.move.i + 1) % this.move.urls.length;
      this.transport = this.relocateTo(this.move.urls[this.move.i]);
    }
    // Closed during the handshake, after our confirmation: the host refused the code (through the relay that arrives
    // as "kicked").
    if (!this.everWelcomed && phase === 'pake4') return this.fail('wrong-code');
    if (code === 4010 && !this.everWelcomed) return this.fail('full');
    if (!this.everWelcomed && phase === 'pake2' && this.secure) return this.fail(code === 4004 || code === 4005 ? 'room-closed' : 'unknown-code');
    // The relay's close codes (docs/LIVE-RELAY.md): some mean there is nothing to come back to.
    if (code === 4004 || code === 4005) { this.setStatus('ended', { reason: why || 'room-closed', code }); this.emit('ended', { reason: why || 'room-closed' }); return this.stop(); }
    if (code === 4011) { this.setStatus('removed', { reason: 'host', code }); return this.stop(); }
    this.setStatus('reconnecting', { why });
    const wait = this.retryMs;
    this.retryMs = Math.min(2000, this.retryMs * 2);
    this.timers.push(this.st(() => this.connect(), wait));
  }

  hangUp(why) { const c = this.conn; if (c) { c.t.close(); this.dropped(c, why); } }

  fail(reason) {
    this.setStatus('failed', { reason });
    this.stop();
  }

  liveness() {
    const t = this.now();
    // Our own stall (a big snapshot loading, a slow frame) is not the network's silence: frames that arrived meanwhile
    // are still queued behind this timer.
    const stalled = this.lastTick && t - this.lastTick > 1500;
    this.lastTick = t;
    if (!this.conn || !this.conn.opened || this.final) return;
    if (stalled || this.loading || this.snap) this.lastFrame = Math.max(this.lastFrame, t - 1000);
    if (t - this.lastFrame > GONE_AFTER) return this.hangUp('silent');
    if (this.welcomed && (!this.lastPing || t - this.lastPing >= PING_EVERY)) { this.lastPing = t; this.send({ t: 'ping', n: Math.floor(t) || 1 }); }
    if (this.welcomed && this.myHolds.size && (!this.lastHold || t - this.lastHold >= HOLD_REFRESH)) {
      this.lastHold = t; this.send({ t: 'hold', b: { keys: [...this.myHolds] } });
    }
  }

  stop() {
    for (const t of this.timers) this.ct(t);
    this.timers = [];
    this.pingTimer = null;
    if (this.presenceTimer) { this.ct(this.presenceTimer); this.presenceTimer = null; }
    const c = this.conn; this.conn = null;
    if (c) c.t.close();
  }

  /** Leave the session (clean: holds released, no rejoin). The app keeps its copy. */
  leave() {
    if (this.conn && this.welcomed) this.send({ t: 'bye' });
    this.setStatus('left');
    this.stop();
  }

  // ---- messages --------------------------------------------------------------------------------------------------

  message(m) {
    const b = m.b || {};
    switch (m.t) {
      case 'waiting': this.setStatus('waiting'); break;
      case 'welcome': this.welcome(m); break;
      case 'deny': this.setStatus(this.everWelcomed && b.reason === 'resume' ? 'lost' : 'denied', { reason: b.reason }); this.stop(); break;
      case 'removed': this.setStatus('removed', { reason: b.reason }); this.stop(); break;
      case 'end': this.inbox.push({ end: true, reason: b.reason, q: b.q }); this.flushSoon(); break;
      case 'commit': this.inbox.push(Object.assign({ q: m.q }, b)); this.flushSoon(); break;
      case 'refuse': this.inbox.push({ refuse: true, n: b.n || m.n, reason: b.reason, by: b.by, byName: b.by_name }); this.flushSoon(); break;
      case 'snap': this.snapChunk(m); break;
      // Key versions as of the snapshot that follows (LIVE-PROTOCOL § 7): what a structural edit names as its base.
      case 'revs': for (const [k, r] of Object.entries(b.keys || {})) if (Number.isFinite(r) && r > (this.revs.get(k) || 0)) this.revs.set(k, r); break;
      case 'ping': this.send({ t: 'pong', n: m.n }); break;
      case 'peer': this.peer(b); break;
      case 'holds':
        for (const [k, c] of Object.entries(b.set || {})) this.holds.set(k, c);
        for (const k of b.clear || []) { this.holds.delete(k); }
        for (const k of b.clear || []) if (this.holds.get(k) === undefined) this.myHolds.delete(k);
        this.emit('holds', { holds: this.holds });
        break;
      case 'locks':
        for (const k of b.add || []) this.locks.add(k);
        for (const k of b.del || []) this.locks.delete(k);
        this.emit('locks', { locks: this.locks, add: b.add || [], del: b.del || [] });
        break;
      case 'presence':
        for (const [c, p] of Object.entries(b.peers || {})) this.presence.set(+c, p);
        this.presenceIn = true; this.flushSoon();
        break;
      case 'saved': this.saved = { q: b.q, hash: b.hash }; this.emit('saved', b); break;
      case 'warn': this.emit('warn', b); break;
      case 'rekey': this.emit('rekey', {}); break;
      // host
      case 'join': this.emit('join', b); break;
      case 'code': this.emit('code', b); break;
      case 'code-gone': this.emit('code-gone', b); break;
      case 'handover-off': this.emit('handover-off', b); break;
      case 'assistant-key': this.emit('assistant-key', b); break;
      // host handoff (LV.17, spec § 10)
      case 'handover': this.handoverChunk(b); break;
      case 'moved': this.moved(b); break;
      // replica / host window
      case 'validate': this.validate(m); break;
      case 'snapreq': this.makeSnapshot(b.for); break;
      default: break; // unknown types are ignored (LIVE-PROTOCOL.md § 2)
    }
  }

  welcome(m) {
    const b = m.b;
    const first = !this.everWelcomed;
    this.c = b.c; this.role = b.role; this.prefix = b.prefix; this.token = b.token; this.session = b.session;
    this.saved = b.saved || this.saved;
    this.holds = new Map(Object.entries(b.holds || {}).map(([k, c]) => [k, c]));
    this.locks = new Set(b.locks || []);
    if (first) this.peers = new Map();
    for (const p of b.peers || []) this.peers.set(p.c, Object.assign({ state: 'in' }, p));
    this.welcomed = true; this.everWelcomed = true; this.retryMs = 250; this.move = null;
    // In over a sealed connection for the first time: that handshake's ticket is our way back from now on (the server keeps
    // it as `h:<c>`), so a drop after the code or link expired still rejoins (LIVE-PROTOCOL § 8).
    if (!this.key && this.keys && this.ticket && b.session) this.key = { kid: 'h:' + b.c, secret: this.ticket, context: 'rejoin:' + b.session };
    if (b.catchup === 'snapshot') { this.snap = { parts: [], of: -1, q: 0 }; this.loading = true; }
    // In with the file the host saved (hello.hash = saved.hash, LIVE-PROTOCOL § 7): that save's seq is where we are, and
    // the commits after it follow. A linked assistant client (LV.18) takes no catch-up: it starts at the session's seq.
    else if (first && b.catchup === 'log' && b.saved && !this.q) this.q = b.saved.q || 0;
    else if (first && b.catchup === 'none' && this.person) this.q = m.q || 0;
    this.setStatus(b.catchup === 'snapshot' ? 'catching-up' : 'live', { first });
    this.emit('welcome', b);
    // Nothing went out on this connection before welcome; now the pending edits, in counter order (an assistant's go on
    // its own connection).
    for (const p of this.pending) if (!p.by || p.by === this) this.sendEdit(p);
    if (this.myHolds.size) this.send({ t: 'hold', b: { keys: [...this.myHolds] } });
    if (this.lastPresence) this.presenceDirty = true, this.pushPresence();
  }

  peer(b) {
    const p = this.peers.get(b.c) || { c: b.c };
    if (b.state === 'role') p.role = b.role;
    else p.state = b.state;
    if (b.name !== undefined) p.name = b.name;
    if (b.role !== undefined) p.role = b.role;
    if (b.via !== undefined) p.via = b.via;
    if (b.of !== undefined) p.of = b.of;          // an assistant's person (LV.18)
    if (b.c === this.c && b.state === 'role') this.role = b.role;
    this.peers.set(b.c, p);
    if (b.state === 'gone' || b.state === 'removed') this.presence.delete(b.c);
    this.emit('peer', p);
  }

  // ---- catch-up --------------------------------------------------------------------------------------------------

  snapChunk(m) {
    const b = m.b || {};
    if (!this.snap) this.snap = { parts: [], of: -1, q: 0 };
    const s = this.snap;
    if (b.i === 0) { s.parts = []; s.of = b.of; s.q = m.q || 0; s.enc = b.enc || ''; }
    if (b.of === 0) { this.snap = null; this.loading = false; this.q = m.q || 0; this.setStatus('live'); this.flushSoon(); return; }
    s.parts[b.i] = b.data;
    if (s.parts.filter(Boolean).length < s.of) return;
    this.snap = null;
    const total = s.parts.reduce((a, p) => a + p.length, 0);
    let bytes = new Uint8Array(total), at = 0;
    for (const p of s.parts) { bytes.set(p, at); at += p.length; }
    const done = (data) => {
      // Pending edits made before the snapshot ride on top of it again.
      for (let i = this.pending.length - 1; i >= 0; i--) this.pending[i].applied = false;
      this.adapter.load(data, s.q);
      this.q = s.q;
      this.reapplyPending();
      this.loading = false;
      this.emit('loaded', { q: s.q, bytes: data.length });
      this.setStatus('live');
      this.flushSoon();
    };
    if (s.enc === 'deflate') inflate(bytes).then(done, (e) => { this.log('snapshot', e); this.hangUp('bad snapshot'); }); // i18n-ignore: diagnostic
    else done(bytes);
  }

  // ---- incoming commits and refusals, once per frame ------------------------------------------------------------

  flushSoon() {
    if (this.flushQueued) return;
    this.flushQueued = true;
    this.schedule(() => { this.flushQueued = false; this.flush(); });
  }

  flush() {
    if (this.person) return this.flushLinked();
    if (this.loading) return;
    const batch = this.inbox.splice(0);
    let applied = 0;
    if (batch.length) {
      const fast = batch.every((x, i) => !x.refuse && !x.end && x.c === this.c && this.pending[i] && !this.pending[i].by && this.pending[i].n === x.n && this.pending[i].applied);
      if (fast) {
        for (const cm of batch) {
          if (!this.inOrder(cm)) continue;
          const p = this.pending.shift();
          this.track(cm);
          this.record(cm, p, p.inverse);
          applied++;
        }
      } else {
        this.rollbackPending();
        let ended = null;
        for (const x of batch) {
          if (x.end) { ended = x; continue; }
          if (x.refuse) { this.refused(x); continue; }
          if (!this.inOrder(x)) continue;
          if (this.role === 'replica' && this.validated.delete(x.c + ':' + x.n)) { this.track(x); continue; }
          // Ours, or one of our assistants' (LV.18: their edits are local edits of this window too).
          const owner = x.c === this.c ? this : this.assistantOf(x.c);
          const inv = this.adapter.invert(x.ops);
          this.adapter.apply(x.ops, owner ? 'own' : 'remote');
          this.track(x);
          applied++;
          if (owner) {
            const i = this.pending.findIndex((p) => p.n === x.n && (p.by || this) === owner);
            const p = i >= 0 ? this.pending.splice(i, 1)[0] : null;
            owner.record(x, p, inv);
          }
        }
        this.reapplyPending();
        if (ended) this.ended(ended);
      }
    }
    if (this.presenceIn && this.adapter.drawPresence) { this.presenceIn = false; this.adapter.drawPresence(this.presence); }
    if (applied || batch.length) {
      if (this.adapter.afterApply) this.adapter.afterApply({ commits: applied });
      this.emit('applied', { commits: applied, q: this.q });
    }
  }

  inOrder(cm) {
    if (cm.q <= this.q) return false; // already applied (a duplicate after a rejoin)
    if (cm.q !== this.q + 1) { this.log('gap', this.q, cm.q); this.hangUp('gap'); return false; }
    return true;
  }

  /** Key versions from a commit's touched list (LIVE-PROTOCOL.md § 6.2). */
  track(cm) {
    this.q = cm.q;
    for (const t of cm.touched || []) {
      if (t.m === 'r') continue;
      this.revs.set(t.k, cm.q);
      if (t.m === 'p' && t.f) this.propRevs.set(keyOf(t.k, t.f), [cm.q, cm.c]);
      if (t.m === 'c') for (const k of [...this.propRevs.keys()]) if (k.startsWith(t.k + '\u0000')) this.propRevs.delete(k);
      if (t.m === 'd') { this.myHolds.delete(t.k); }
    }
  }

  rollbackPending() {
    for (let i = this.pending.length - 1; i >= 0; i--) {
      const p = this.pending[i];
      if (!p.applied) continue;
      try { this.adapter.apply(p.inverse, 'rollback'); } catch (e) { this.log('rollback', e); }
      p.applied = false;
    }
  }

  reapplyPending() {
    for (const p of this.pending) {
      try {
        p.inverse = this.adapter.invert(p.ops);
        this.adapter.apply(p.ops, 'rebase');
        p.applied = true;
      } catch (e) {
        // It no longer applies here (it built on a refused edit); the host will refuse it too.
        this.log('rebase', e);
        p.applied = false;
      }
    }
  }

  refused(x) {
    const owner = x.via || this;            // an assistant's refusal, forwarded by its client (LV.18)
    const i = this.pending.findIndex((p) => p.n === x.n && (p.by || this) === owner);
    if (i < 0) return;
    const p = this.pending.splice(i, 1)[0];
    const by = x.by ? this.peers.get(x.by) : null;
    owner.emit('refused', { n: x.n, label: p.label, kind: p.kind, reason: x.reason, by: x.by, byName: x.byName || (by && by.name) || '' });
    if (p.kind === 'undo' || p.kind === 'redo') owner.emit('undo-skipped', { label: p.of ? p.of.label : p.label, reason: x.reason, by: x.by, byName: x.byName || '' });
  }

  record(cm, p, inverse) {
    const entry = { label: cm.label, ops: cm.ops, inverse, touched: cm.touched || [], q: cm.q };
    const kind = p ? p.kind : 'do';
    if (kind === 'undo') this.redoStack.push(Object.assign(entry, { label: p.of ? p.of.label : cm.label }));
    else {
      if (kind === 'redo') entry.label = p.of ? p.of.label : cm.label;
      this.undoStack.push(entry);
      if (this.undoStack.length > 500) this.undoStack.shift();
    }
  }

  ended(x) {
    this.setStatus('ended', { reason: x.reason, q: x.q });
    this.emit('ended', { reason: x.reason, q: x.q });
    this.stop();
  }

  // ---- local edits -----------------------------------------------------------------------------------------------

  /** The app finished a step: { label, ops, inverse }. Applied already; sent now (or when connected again). */
  localChange(step, kind = 'do', of = null) {
    if (!step || !step.ops) return null;
    // LV.18: a step made by an assistant goes on the assistant's own client.
    if (kind === 'do' && !this.person && this.route) {
      let a = null;
      try { a = this.route(step); } catch { a = null; }
      if (a && a !== this && a.person === this) return a.localChange(step, kind, of);
    }
    const model = this.person ? this.person.adapter : this.adapter;
    if (this.role === 'viewer' || (this.person && this.final)) {
      // Viewers can't edit (nor an assistant whose client was refused or has left): put it back at once and say so.
      try { model.apply(step.inverse, 'rollback'); } catch (e) { this.log('viewer rollback', e); } // i18n-ignore: diagnostic
      this.emit('refused', { n: 0, label: step.label, kind, reason: 'role' });
      return null;
    }
    const revs = this.person ? this.person.revs : this.revs;
    const touched = (this.adapter.touched(step.ops) || []).map((t) => Object.assign({}, t));
    for (const t of touched) {
      if (t.r === null) { delete t.r; continue; }
      if (t.r === undefined && t.m === 's') t.r = revs.get(t.k) || 0;
    }
    const p = { n: ++this.n, label: step.label || '', ops: step.ops, inverse: step.inverse, touched, applied: true, kind, of, sent: false };
    if (this.person) { p.by = this; this.person.pending.push(p); }
    this.pending.push(p);
    if (kind === 'do') this.redoStack = [];
    this.sendEdit(p);
    return p.n;
  }

  sendEdit(p) {
    if (!this.welcomed) return;
    p.sent = this.send({ t: 'edit', n: p.n, b: { label: p.label, ops: p.ops, touched: p.touched } });
  }

  /** An id no other client can make (spec § 5 point 6). */
  newId() { return (this.prefix || 'x') + ':' + (++this.idCounter); }

  // ---- undo / redo (per person, spec § 5 "Undo") -----------------------------------------------------------------

  canUndo() { return this.undoClient().undoStack.length > 0; }
  canRedo() { return this.undoClient().redoStack.length > 0; }
  undo() { const a = this.undoClient(); return a !== this ? a.undo() : this.reverse(this.undoStack, 'undo'); }
  redo() { const a = this.undoClient(); return a !== this ? a.redo() : this.reverse(this.redoStack, 'redo'); }
  /** Whose undo an undo / redo now is: an assistant's while it works (LV.18, `route`), else this client's own. */
  undoClient() {
    if (this.person || !this.route) return this;
    let a = null;
    try { a = this.route({ undo: true }); } catch { a = null; }
    return a && a.person === this && !a.final ? a : this;
  }

  reverse(stack, kind) {
    const e = stack.pop();
    if (!e) return false;
    // An assistant's client works on its person's model and versions (LV.18).
    const R = this.person || this;
    const model = this.person ? this.person.adapter : this.adapter;
    // A property I wrote that someone wrote over since: skip, and say who (spec § 5).
    for (const t of e.touched) {
      if (t.m !== 'p' || !t.f) continue;
      const cur = R.propRevs.get(keyOf(t.k, t.f));
      if (cur && cur[0] !== e.q) {
        const by = this.peers.get(cur[1]);
        this.emit('undo-skipped', { label: e.label, reason: 'changed', by: cur[1], byName: (by && by.name) || '' });
        return false;
      }
    }
    const ops = e.inverse;
    const touched = (this.adapter.touched(ops) || []).map((t) => Object.assign({}, t));
    const mine = new Set(e.touched.filter((t) => t.m !== 'r').map((t) => t.k));
    for (const t of touched) {
      if (t.r === null) { delete t.r; continue; }
      if (t.r !== undefined) continue;
      if (t.m === 'p') t.r = mine.has(t.k) ? e.q : undefined;
      else if (t.m === 's' || t.m === 'd') t.r = mine.has(t.k) ? e.q : (R.revs.get(t.k) || 0);
      if (t.r === undefined) delete t.r;
    }
    // Property conditions are per property: the one I wrote at e.q.
    for (const t of touched) if (t.m === 'p' && t.f && mine.has(t.k)) {
      const cur = R.propRevs.get(keyOf(t.k, t.f));
      t.r = cur ? cur[0] : 0;
    }
    let inverse;
    try {
      inverse = model.invert(ops);
      model.apply(ops, kind);
    } catch (err) {
      this.log(kind, err);
      this.emit('undo-skipped', { label: e.label, reason: 'apply' });
      return false;
    }
    const p = { n: ++this.n, label: (kind === 'undo' ? 'Undo ' : 'Redo ') + e.label, ops, inverse, touched, applied: true, kind, of: e, sent: false };
    if (this.person) { p.by = this; this.person.pending.push(p); }
    this.pending.push(p);
    this.sendEdit(p);
    if (model.afterApply) model.afterApply({ commits: 0, local: kind });
    return true;
  }

  // ---- holds, presence -------------------------------------------------------------------------------------------

  hold(keys) {
    const fresh = keys.filter((k) => !this.myHolds.has(k));
    for (const k of keys) this.myHolds.add(k);
    if (fresh.length && this.welcomed) this.send({ t: 'hold', b: { keys: fresh } });
  }
  release(keys) {
    const list = keys ? keys.filter((k) => this.myHolds.has(k)) : [...this.myHolds];
    for (const k of list) this.myHolds.delete(k);
    if (!this.welcomed || !list.length) return;
    this.send(keys ? { t: 'release', b: { keys: list } } : { t: 'release', b: { all: true } });
  }
  /** Who holds a key (a client id), if someone else does. */
  heldBy(key) { const c = this.holds.get(key); return c && c !== this.c ? c : 0; }
  isLocked(key) { return this.locks.has(key); }

  setPresence(p) {
    this.lastPresence = p;
    this.presenceDirty = true;
    if (!this.presenceTimer) this.pushPresence();
  }
  pushPresence() {
    if (!this.presenceDirty || !this.welcomed) return;
    this.presenceDirty = false;
    this.send({ t: 'presence', b: this.lastPresence });
    this.presenceTimer = this.st(() => { this.presenceTimer = null; if (this.presenceDirty) this.pushPresence(); }, PRESENCE_EVERY);
  }

  // ---- assistants as their own clients (LV.18) ---------------------------------------------------------------------

  /** A person's client: ask the session for a one-time key for this window's assistant → { kid, secret, context } or
   *  null (a viewer, too many assistants, an older server: the assistant then works on this person's connection). */
  requestAssistant(timeoutMs = 5000) {
    if (this.person || !this.welcomed || this.final || !['host', 'editor'].includes(this.role)) return Promise.resolve(null);
    return new Promise((resolve) => {
      let done = false;
      const finish = (v) => { if (done) return; done = true; off(); resolve(v); };
      const off = this.on('assistant-key', (b) => finish(b && typeof b.kid === 'string' && b.secret instanceof Uint8Array ? { kid: b.kid, secret: b.secret, context: String(b.context || '') } : null));
      this.timers.push(this.st(() => finish(null), timeoutMs));
      if (!this.send({ t: 'assistant', b: {} })) finish(null);
    });
  }

  /** A person's client: `a` (made with { person: this }) is one of ours now. When it ends, what it still had waiting is
   *  taken back here (its decided edits arrive like anyone else's). */
  linkAssistant(a) {
    this.assistants.add(a);
    a.on('status', () => { if (a.final) this.unlinkAssistant(a); });
    return a;
  }
  unlinkAssistant(a) {
    if (!this.assistants.delete(a)) return;
    const theirs = this.pending.filter((p) => p.by === a);
    if (!theirs.length) return;
    this.rollbackPending();
    this.pending = this.pending.filter((p) => p.by !== a);
    this.reapplyPending();
    for (const p of theirs) a.emit('refused', { n: p.n, label: p.label, kind: p.kind, reason: 'gone' });
    if (this.adapter.afterApply) this.adapter.afterApply({ commits: 0, local: 'assistant-gone' });
  }
  /** Our assistant whose client id is c, if any. */
  assistantOf(c) { for (const a of this.assistants) if (a.c === c && c) return a; return null; }

  /** An assistant's client: commits and refusals reach it too, but its person's client changes the model; here only the
   *  order (q), its own sent-list, and refusals forwarded to the person. */
  flushLinked() {
    const batch = this.inbox.splice(0);
    let ended = null;
    for (const x of batch) {
      if (x.end) { ended = x; continue; }
      if (x.refuse) {
        const i = this.pending.findIndex((p) => p.n === x.n);
        if (i < 0) continue;
        this.pending.splice(i, 1);
        const P = this.person;
        P.inbox.push({ refuse: true, n: x.n, reason: x.reason, by: x.by, byName: x.byName, via: this });
        P.flushSoon();
        continue;
      }
      if (!this.inOrder(x)) continue;
      this.q = x.q;
      if (x.c === this.c) { const i = this.pending.findIndex((p) => p.n === x.n); if (i >= 0) this.pending.splice(i, 1); }
    }
    if (ended) this.ended(ended);
  }

  // ---- host controls ---------------------------------------------------------------------------------------------

  approve(c, role = 'editor') { this.send({ t: 'approve', b: { c, role } }); }
  deny(c) { this.send({ t: 'deny', b: { c } }); }
  remove(c) { this.send({ t: 'remove', b: { c } }); }
  setRole(c, role) { this.send({ t: 'role', b: { c, role } }); }
  lock(keys) { this.send({ t: 'lock', b: { keys } }); }
  unlock(keys) { this.send({ t: 'unlock', b: { keys } }); }
  invite(opts = {}) { this.send({ t: 'invite', b: { one_time: !!opts.oneTime, ttl: opts.ttl } }); }
  addLink(kid, secret, room, opts = {}) { this.send({ t: 'key', b: { kid, secret, context: 'relay:' + room, one_time: !!opts.oneTime, ttl: opts.ttl } }); }
  stopInviting(kid) { this.send({ t: 'uninvite', b: kid ? { kid } : {} }); }
  /** The host wrote the file at the current seq (call after whenSettled(), so the file holds committed edits only).
   *  Also right after the host's window joins, with q 0 and the opened file's hash: joiners who have it skip the snapshot. */
  savedFile(hash, at = new Date().toISOString()) { this.send({ t: 'save', b: { q: this.q, hash, at } }); }

  /** Resolves when every own edit is decided and every received commit applied: the model is exactly the committed
   *  state, the moment for the host to write the file (spec § 7: only committed edits go into it). */
  whenSettled(timeoutMs = 10000) {
    const t0 = this.now();
    return new Promise((resolve, reject) => {
      const check = () => {
        if (!this.pending.length && !this.inbox.length && !this.loading && !this.flushQueued) return resolve(this.q);
        if (this.final) return reject(new Error('the session is over')); // i18n-ignore: diagnostic (callers decide what to say)
        if (this.now() - t0 > timeoutMs) return reject(new Error('edits still waiting')); // i18n-ignore: diagnostic (callers decide what to say)
        this.st(check, 10);
      };
      check();
    });
  }

  /** The host's name, for "copy of <file> from <host>" when the session ends (the words are the app's, in its
   *  language files). */
  hostName() {
    if (this.role === 'host') return this.o.name || '';
    for (const p of this.peers.values()) if (p.role === 'host') return p.name || '';
    return '';
  }
  end() { this.send({ t: 'end' }); }

  // ---- host handoff (LV.17, spec § 10) --------------------------------------------------------------------------
  // The host sends `handover {to}`; the server stops committing and hands `to` the whole state. That window starts a
  // session server from it (opts.takeOver), says `moved {addrs, port}`, and rejoins it in-process with its resume token.
  // Everyone else gets `moved` and rejoins the new host with the resume token and a ticket from their own handshake
  // (the old host's window gets its ticket in its `moved`): no code, no approval. Pending edits are re-sent there.

  /** Host: hand the session over to client `c` (an editor or viewer). 'handover-off' {to, reason} if it can't happen. */
  handover(c) { this.send({ t: 'handover', b: { to: c } }); }

  /** The state arrives in chunks ({from, i, of, data}; chunk 0 also {bytes, relay}) so no frame passes the relay's 2 MB. */
  handoverChunk(b) {
    if (b.i === 0 || !this.hoParts) this.hoParts = { parts: [], of: b.of, from: b.from, relay: !!b.relay };
    const h = this.hoParts;
    if (!(b.data instanceof Uint8Array) || !(b.i >= 0 && b.i < h.of)) return;
    h.parts[b.i] = b.data;
    if (h.parts.filter(Boolean).length < h.of) return;
    this.hoParts = null;
    const state = new Uint8Array(h.parts.reduce((n, p) => n + p.length, 0));
    let at = 0;
    for (const p of h.parts) { state.set(p, at); at += p.length; }
    this.takeOver({ from: h.from, state, relay: h.relay });
  }

  async takeOver(b) {
    this.emit('handover', { from: b.from, state: b.state, relay: b.relay });
    if (!(b.state instanceof Uint8Array) || typeof this.o.takeOver !== 'function') return;
    let r;
    try { r = await this.o.takeOver(b.state); } catch (e) { this.log('takeOver', e); r = null; }
    if (!r || !r.transport || !Array.isArray(r.addrs) || !r.port) { this.emit('handover-off', { to: this.c, reason: 'start' }); return this.hangUp('handover'); } // i18n-ignore: diagnostic
    // People came through the relay: open a room of our own first, so `moved` can send them there.
    let room = null;
    if (b.relay && typeof this.o.newRoom === 'function') {
      try { room = await this.o.newRoom(); } catch (e) { this.log('newRoom', e); room = null; }
    }
    this.send({ t: 'moved', b: Object.assign({ addrs: r.addrs.map(String), port: Number(r.port) }, room ? { room: String(room) } : {}) });
    // In-process (Studio): no handshake. A new host reached over the network (a test harness) uses our own ticket.
    this.relocated = true; this.move = null;
    this.plainNext = r.local !== false;
    this.transport = r.transport;
    this.emit('moved', { host: this.c, addrs: r.addrs, port: r.port, room, self: true });
    const c = this.conn; this.conn = null; if (c) c.t.close();
    this.connect();
  }

  relocateTo(url) {
    return typeof this.o.relocate === 'function' ? this.o.relocate(url) : webSocketTransport(url, this.o.WebSocket);
  }

  async moved(b) {
    const port = Number(b.port);
    // IPv6 in brackets; link-local ones (fe80::/10) need a zone id, which a WebSocket URL can't carry: skipped.
    const urls = (Array.isArray(b.addrs) ? b.addrs : []).map(String).filter((a) => /^[0-9A-Za-z.:-]{1,64}$/.test(a) && !/^fe[89ab]/i.test(a))
      .map((a) => 'ws://' + (a.includes(':') ? '[' + a + ']' : a) + ':' + port + '/live');
    if (!(port > 0 && port < 65536)) urls.length = 0;
    // Through the relay: the new host's room (if it opened one), after the LAN addresses.
    if (b.room && /^[0-9A-Z]{8}$/.test(String(b.room)) && typeof this.o.roomUrl === 'function') urls.push(this.o.roomUrl(String(b.room)));
    if (!urls.length) return;
    const c = this.conn; this.conn = null; this.welcomed = false;
    if (c) c.t.close();
    for (const p of this.pending) p.sent = false;
    if (b.ticket instanceof Uint8Array && this.session) this.key = { kid: 'h:' + this.c, secret: b.ticket, context: 'rejoin:' + this.session };
    if (this.key && !this.o.crypto && typeof this.o.loadCrypto === 'function') {
      try { this.o.crypto = await this.o.loadCrypto(); } catch (e) { this.log('loadCrypto', e); }
    }
    if (!this.o.crypto) this.key = null;
    this.relocated = true; this.plainNext = false;
    const info = { host: b.host, addrs: b.addrs, port, room: b.room || null };
    this.move = { urls, i: 0, tries: 0, info };
    this.transport = this.relocateTo(urls[0]);
    this.emit('moved', info);
    if (!this.final) this.connect();
  }

  // ---- the replica (and the host window when there is none) ------------------------------------------------------

  validate(m) {
    const b = m.b;
    let reason = null;
    try { reason = this.adapter.validate ? this.adapter.validate(b.ops) : null; } catch (e) { reason = 'invalid'; this.log('validate', e); }
    if (!reason) {
      try { this.adapter.apply(b.ops, 'remote'); } catch (e) { reason = 'invalid'; this.log('validate apply', e); } // i18n-ignore: diagnostic
    }
    if (!reason) this.validated.add(b.c + ':' + b.n);
    this.send({ t: 'valid', b: reason ? { c: b.c, n: b.n, ok: false, reason: String(reason) } : { c: b.c, n: b.n, ok: true } });
  }

  async makeSnapshot(forClient) {
    // Committed state only: the host window takes its pending edits off first.
    this.rollbackPending();
    let data;
    try { data = this.adapter.snapshot(); } finally { this.reapplyPending(); }
    const q = this.q + (this.role === 'replica' ? this.validated.size : 0);
    let enc = '';
    if (data.length > 64 * 1024 && globalThis.CompressionStream) { data = await deflate(data); enc = 'deflate'; }
    this.send({ t: 'snap', b: { for: forClient, q, data, enc } });
  }

  /** For tests and the status line. */
  state() {
    return { status: this.status, c: this.c, role: this.role, q: this.q, pending: this.pending.length, undo: this.undoStack.length, redo: this.redoStack.length, peers: this.peers.size, holds: this.holds.size, locks: this.locks.size };
  }
}

/** An assistant's client works on its person's model (LV.18): it borrows the adapter's identity and `touched`, and changes
 *  nothing itself (the person's client applies every commit). */
function assistantAdapter(a) {
  return {
    app: a.app, schema: a.schema,
    touched: (ops) => a.touched(ops),
    apply() {}, invert() { return []; }, load() {}, snapshot() { return new Uint8Array(0); },
  };
}

async function pipeThrough(bytes, stream) {
  const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}
function deflate(bytes) { return pipeThrough(bytes, new CompressionStream('deflate')); }
function inflate(bytes) { return pipeThrough(bytes, new DecompressionStream('deflate')); }

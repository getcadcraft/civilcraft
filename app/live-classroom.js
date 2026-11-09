/* SPDX-License-Identifier: Apache-2.0 */
/**
 * live-classroom.js — the class room in Studio Live (0.9 ED.3, session class-room-09; owner default 2026-11-06: each student works in
 * their OWN file). For every app. Canonical copy here; each app's dev/ carries a byte-identical copy (node tools/shell/sync.mjs).
 * Mounted by live-follow.js `attachFollow` (one line), which every one of the eight apps already calls when a Live client starts.
 *
 * What it is. The teacher's Studio hosts an ordinary Live session and switches it to a CLASS ROOM before anyone joins. Nobody shares a
 * model: each student keeps editing their own file, and their edits reach the teacher's window as a read-only copy of that file, kept in
 * memory there and never written anywhere by this module. The session server is not changed (one session per Studio window, spec § 3):
 * the class room rides on it as ordinary edits whose ops are opaque envelopes, so the relay and the server see exactly what Live always
 * sends (sealed frames, a MessagePack envelope per edit) and nothing they could read about a student's file.
 *
 * Who can read what. Every client of a session receives every commit, so a student's edits are sealed to the teacher before they leave
 * the student's window: an X25519 key pair per window (public half in presence, `cls.pk`), a pair key per student and direction
 * (HKDF-SHA-256 over the X25519 secret, the session id, the room and the direction), XChaCha20-Poly1305 with a fresh 24-byte nonce
 * (noble, the libraries live-crypto.js already uses). The other students receive the commit and cannot open it; they also cannot forge
 * one to the teacher or from the teacher. The teacher's public key comes in the host's own presence, which the server attributes to the
 * host. What is NOT hidden from other students: that a student sent something, when, and how big (the envelope); the room name `s<id>`.
 * While the teacher helps (below), the keys an edit touches (`s<id>/e:42`) are sent in the clear so the server can check versions.
 *
 * Roles. The teacher is the host (spec § 2). Looking in is read-only: the teacher's own edits are taken back (the Viewer rule). A student
 * is an editor of their own room only: nothing but sealed envelopes ever reaches another student's model, and the envelope for room X
 * opens only with the key of room X. "Help" is the teacher choosing to edit WITH one student: both windows then apply each other's
 * sealed edits to that one file, in the server's order, and the student sees who is in their file.
 *
 * The student is asked first. The host's snapshot of a class room is a marker, not a file (a student's own file is never replaced), and
 * the student's window holds everything back (nothing is sent, nothing of the model leaves) until the student reads the notice and joins.
 *
 *   attachClassroom(client, view, { t, clock?, setTimeout? … }) → ctl      (ctl.detach())
 *
 * Words are `live.cr.*` with English defaults below, so an app without the keys still reads right (rule 57: English only until the
 * language round).
 *
 * Limits, stated. A copy is a snapshot (the app's in-memory model, ≤ MAX_COPY bytes) plus the edits since; a file over the cap is shown
 * by thumbnail and edit time only (no Look in). Every student's envelope passes every other student's window: that is O(class²) bytes, which
 * is why the cap exists. The thumbnail is rendered by the STUDENT's window from its own view (the teacher's window has no way to draw an
 * app's file without loading it), at most one every THUMB_EVERY ms, and the teacher's window drops faster ones.
 */
import { pack, unpack } from './live-client.js';

export const CLASS_VERSION = 1;
export const THUMB_EVERY = 5000;       // ms: a student's window makes one picture at most this often
export const THUMB_MIN_GAP = 2500;     // ms: the teacher's window ignores a picture that comes sooner after the last one
export const THUMB_W = 192;
export const THUMB_H = 120;
export const MAX_THUMB = 32 * 1024;    // bytes
export const MAX_COPY = 3 * 1024 * 1024;   // bytes of a student's snapshot that may be sent
export const CHUNK = 400 * 1024;       // bytes per snapshot piece (an edit may carry 1 MB)
export const SNAP_EVERY = 100;         // edits between a student's fresh snapshots
export const OPS_KEEP = 1024 * 1024;   // bytes of edits kept after a snapshot before the teacher asks for a new one

// ---- words ---------------------------------------------------------------------------------------------------------------

const WORDS = {
  'live.cr.button': 'Class room',
  'live.cr.title': 'Class room',
  'live.cr.count': '{n} of {m} working',
  'live.cr.start': 'Start a class room',
  'live.cr.start.note': 'Each student works in their own file. You see when they last edited and a small picture of their work, and can look in or help. Start it before anyone joins.',
  'live.cr.start.busy': 'Someone has already joined this session. End it and start a new one, then start the class room before anyone joins.',
  'live.cr.privacy.teacher': 'Students are told, before they join and all the time, that you can look in. A student\'s file stays in this window\'s memory; nothing is saved unless you save it.',
  'live.cr.end': 'End the class room',
  'live.cr.none': 'Nobody has joined yet.',
  'live.cr.student.joined': 'Joined, has not accepted yet',
  'live.cr.student.away': 'Away',
  'live.cr.student.big': 'File too large to look in; picture and edit time only',
  'live.cr.student.nocopy': 'Waiting for the file',
  'live.cr.last': 'last edit {ago}',
  'live.cr.noedit': 'no edits yet',
  'live.cr.edits': '{n} edits',
  'live.cr.lookin': 'Look in',
  'live.cr.follow': 'Follow',
  'live.cr.help': 'Help',
  'live.cr.help.stop': 'Stop helping',
  'live.cr.back': 'Back to class',
  'live.cr.looking': 'Looking in on {name}\'s work. This is a read-only copy; your own file is set aside until you go back.',
  'live.cr.helping': 'Helping {name}: your edits go into their file, and they can see you are there.',
  'live.cr.nosave': 'Do not save while looking in: it would write over your own file. Go back to class first.',
  'live.cr.readonly': 'Read-only: you are looking in. Choose Help to edit with {name}.',
  'live.cr.ago.s': '{n} s ago',
  'live.cr.ago.m': '{n} min ago',
  'live.cr.ago.h': '{n} h ago',
  'live.cr.notice.title': 'Join {name}\'s class room?',
  'live.cr.notice.body': 'Your teacher can look in at your work while you are in the class room, and can join your file to help; you will see when they do. They see when you last edited and a small picture of your work. Your file stays yours: it is sent, encrypted, only to your teacher\'s computer, and other students cannot read it. Nothing is sent until you join. You can leave at any time.',
  'live.cr.notice.join': 'Join the class room',
  'live.cr.notice.leave': 'Leave',
  'live.cr.banner': 'Class room: {name} can look in at your work.',
  'live.cr.banner.leave': 'Leave the class room',
  'live.cr.helper': '{name} is helping in your file.',
  'live.cr.someone': 'Your teacher',
  'live.cr.how.title': 'How the class room works',
  'live.cr.how.body': 'Students keep their own files. Their edits come to your window as a read-only copy kept in memory. Look in opens a copy and follows the student\'s view; Help lets you edit with them. Over an invite link a room holds up to 20 people; a class on one network can be larger.',
};
const fmt = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, k) => (v && k in v ? String(v[k]) : m));

// ---- sealing (noble, loaded when a class room starts: a page without Live's import map never loads it) --------------------

let N = null;
/** Loads the crypto the class room needs: X25519, XChaCha20-Poly1305, HKDF-SHA-256 (the vendored noble libraries). */
export async function loadCrypto() {
  if (N) return N;
  const [c, ci, hk, sh] = await Promise.all([
    import('@noble/curves/ed25519.js'), import('@noble/ciphers/chacha.js'), import('@noble/hashes/hkdf.js'), import('@noble/hashes/sha2.js')]);
  N = { x25519: c.x25519, xchacha: ci.xchacha20poly1305, hkdf: hk.hkdf, sha256: sh.sha256 };
  return N;
}
const need = () => { if (!N) throw new Error('class room: crypto not loaded'); return N; };
const te = new TextEncoder();
const hex = (b) => [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
const unhex = (s) => { if (typeof s !== 'string' || s.length !== 64 || /[^0-9a-f]/.test(s)) return null; const o = new Uint8Array(32); for (let i = 0; i < 32; i++) o[i] = parseInt(s.substr(i * 2, 2), 16); return o; };
const rand = (n) => { const b = new Uint8Array(n); globalThis.crypto.getRandomValues(b); return b; };

/** A fresh key pair for this window and this class room. */
export function newKeyPair() { const k = need().x25519.keygen(); return { sk: k.secretKey, pk: k.publicKey }; }
/** The key for one room and one direction ('s' student to teacher, 't' teacher to student) between two key halves. */
export function pairKey(sk, otherPk, session, room, dir) {
  const n = need();
  return n.hkdf(n.sha256, n.x25519.getSharedSecret(sk, otherPk), te.encode('cadcraft-class-room/1'), te.encode(`${session}|${room}|${dir}`), 32);
}
export function seal(key, bytes) {
  const nonce = rand(24), ct = need().xchacha(key, nonce).encrypt(bytes);
  const out = new Uint8Array(24 + ct.length); out.set(nonce); out.set(ct, 24); return out;
}
/** The plain bytes, or null for anything that does not open (wrong key, altered, too short). */
export function open(key, data) {
  if (!(data instanceof Uint8Array) || data.length < 24 + 16) return null;
  try { return need().xchacha(key, data.subarray(0, 24)).decrypt(data.subarray(24)); } catch { return null; }
}

async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
const deflate = (b) => pipe(b, new CompressionStream('deflate'));
const inflate = (b) => pipe(b, new DecompressionStream('deflate'));

// ---- the envelope on the wire ----------------------------------------------------------------------------------------------

/** One class op as the server and every other client see it: opaque. `x` ties it to this window's own plain copy. */
export function wireOp(room, dir, kind, sealed, x) {
  const o = { op: 'cls', r: room, d: dir, k: kind, b: sealed };
  if (x) o.x = x;
  return o;
}
export const isClsOp = (o) => !!o && o.op === 'cls';
/** What the host's window refuses before it commits (adapter.validate): not a class op, or a malformed one. */
export function checkWireOps(ops) {
  if (!Array.isArray(ops) || !ops.length || ops.length > 8) return 'malformed';
  for (const o of ops) {
    if (!isClsOp(o) || typeof o.r !== 'string' || !/^s\d{1,9}$/.test(o.r) || (o.d !== 's' && o.d !== 't') || typeof o.k !== 'string' || o.k.length > 2) return 'malformed';
    const b = o.b; if (!(b instanceof Uint8Array) && !(b && typeof b === 'object' && 'length' in b)) return 'malformed';
    if (b.length > 900 * 1024) return 'too big';
  }
  return null;
}
/** The marker the host sends in place of a file (adapter.snapshot) and a student's window recognises (adapter.load). */
export function markerBytes() { return pack({ cls: CLASS_VERSION }); }
export function isMarker(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length > 64 || bytes.length < 3) return false;
  try { const v = unpack(bytes); return !!v && typeof v === 'object' && v.cls === CLASS_VERSION && Object.keys(v).length === 1; } catch { return false; }
}

// ---- the teacher's store: copies, times, pictures (memory only) ----------------------------------------------------------------

const sizeOfOps = (ops) => { try { return pack(ops).length; } catch { return 0; } };

export class ClassStore {
  constructor({ now = Date.now } = {}) { this.now = now; this.rooms = new Map(); }
  room(r, c = 0, name = '') {
    let x = this.rooms.get(r);
    if (!x) {
      x = { r, c, name, edits: 0, lastEdit: 0, thumb: null, thumbAt: 0, thumbs: 0, thumbsDropped: 0, snap: null, snapAt: 0, ops: [], opsBytes: 0,
        parts: null, tsent: 0, big: false, seenI: 0, wantSnap: false, gaps: 0 };
      this.rooms.set(r, x);
    }
    if (c) x.c = c;
    if (name) x.name = name;
    return x;
  }
  /** A student's edit: {i, ops}. Counted, timed, and kept after the snapshot it follows. */
  onOps(r, p) {
    const x = this.room(r);
    if (!p || !Array.isArray(p.ops) || !Number.isSafeInteger(p.i) || p.i <= 0) return false;
    if (p.i <= x.seenI) return false;                              // a repeat
    if (x.seenI && p.i !== x.seenI + 1) { x.gaps++; x.wantSnap = true; }   // an edit we did not see: the copy cannot be trusted, ask for a fresh snapshot
    x.seenI = p.i;
    const size = sizeOfOps(p.ops);
    x.ops.push({ i: p.i, ops: p.ops, size }); x.opsBytes += size;
    x.edits++; x.lastEdit = this.now();
    if (x.opsBytes > OPS_KEEP) x.wantSnap = true;
    return true;
  }
  /** The teacher's own edit while helping, kept so the copy has it: {ops}; j counts them for the room. */
  onTeacherOps(r, ops) {
    const x = this.room(r); x.tsent++;
    const size = sizeOfOps(ops);
    x.ops.push({ i: 0, j: x.tsent, ops, size }); x.opsBytes += size;
    return x.tsent;
  }
  /** One piece of a snapshot: {id, i, of, enc, upto, tj, data}. Returns the assembled snapshot ({bytes, enc, upto, tj}) when the last piece is in. */
  onSnapPiece(r, p) {
    const x = this.room(r);
    if (!p || !Number.isSafeInteger(p.of) || p.of < 1 || p.of > 64 || !Number.isSafeInteger(p.i) || p.i < 0 || p.i >= p.of || !(p.data instanceof Uint8Array)) return null;
    if (!x.parts || x.parts.id !== p.id) x.parts = { id: p.id, of: p.of, got: new Map(), enc: p.enc || '', upto: p.upto | 0, tj: p.tj | 0 };
    x.parts.got.set(p.i, p.data);
    if (x.parts.got.size < x.parts.of) return null;
    const parts = x.parts; x.parts = null;
    let total = 0; for (let i = 0; i < parts.of; i++) { const d = parts.got.get(i); if (!d) return null; total += d.length; }
    const bytes = new Uint8Array(total); let at = 0;
    for (let i = 0; i < parts.of; i++) { const d = parts.got.get(i); bytes.set(d, at); at += d.length; }
    return { bytes, enc: parts.enc, upto: parts.upto, tj: parts.tj };
  }
  /** A decoded snapshot replaces the copy; edits it already contains are dropped, later ones stay. */
  setSnapshot(r, raw, upto, tj) {
    const x = this.room(r);
    x.snap = raw; x.snapAt = this.now(); x.wantSnap = false;
    x.ops = x.ops.filter((o) => (o.j ? o.j > tj : o.i > upto));
    x.opsBytes = x.ops.reduce((n, o) => n + o.size, 0);
    x.big = false;
  }
  /** A picture: ignored if it follows the last one too soon, is too big, or is not an image we know. */
  onThumb(r, p) {
    const x = this.room(r);
    if (!p || !(p.img instanceof Uint8Array) || p.img.length > MAX_THUMB || p.img.length < 8) return false;
    const t = this.now();
    if (x.thumbAt && t - x.thumbAt < THUMB_MIN_GAP) { x.thumbsDropped++; return false; }
    const sig = p.img;
    const known = (sig[0] === 0xff && sig[1] === 0xd8) || (sig[0] === 0x89 && sig[1] === 0x50) || (sig[0] === 0x52 && sig[1] === 0x49 && sig[8] === 0x57);   // jpeg, png, webp
    if (!known) return false;
    x.thumb = { img: p.img, w: Math.min(p.w | 0, 512), h: Math.min(p.h | 0, 512), mime: sig[0] === 0xff ? 'image/jpeg' : sig[0] === 0x89 ? 'image/png' : 'image/webp' };
    x.thumbAt = t; x.thumbs++;
    return true;
  }
  /** The copy as the snapshot plus the edits after it (to load into a window), or null while no snapshot has come. */
  copy(r) { const x = this.rooms.get(r); return x && x.snap ? { snap: x.snap, ops: x.ops.map((o) => o.ops) } : null; }
  forget(r) { this.rooms.delete(r); }
  clear() { this.rooms.clear(); }
}

/** "3 min ago" from a number of ms. */
export function agoParts(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 90) return ['live.cr.ago.s', { n: s }];
  const m = Math.round(s / 60); if (m < 90) return ['live.cr.ago.m', { n: m }];
  return ['live.cr.ago.h', { n: Math.round(m / 60) }];
}

// ---- the controller ------------------------------------------------------------------------------------------------------------

const roomOf = (c) => 's' + c;
const MAX_KEEP = 4000;      // plain copies of this window's own sealed edits (so a rollback or undo can apply the plain ops)

export function attachClassroom(client, view, opts = {}) {
  if (!client || typeof client.on !== 'function') return Object.assign(() => {}, { api: null });
  const inner = client.adapter;
  if (!inner || inner.__cls) return Object.assign(() => {}, { api: null });
  const tr = typeof opts.t === 'function' ? opts.t : null;
  const T = (k, v = {}) => {
    let r = k;
    try { r = tr ? String(tr(k, v)) : k; } catch { r = k; }
    return r === k || !r ? fmt(WORDS[k] ?? k, v) : r;
  };
  const now = opts.clock || Date.now;
  const timers = opts.timers || { set: (f, ms) => setInterval(f, ms), clear: (h) => clearInterval(h) };
  const listeners = new Map();
  const emit = (ev, d) => { for (const f of listeners.get(ev) || []) { try { f(d); } catch { /* a listener's error is its own */ } } };
  const offs = [];
  const clean = (s, max = 40) => { s = String(s ?? '').replace(/[\u0000-\u001f\u007f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim(); return s.length > max ? s.slice(0, max - 1) + '…' : s; };
  const gone = (p) => !p || p.state === 'gone' || p.state === 'removed' || p.state === 'left';
  const rawPresence = (c) => { const m = client.presence; const p = m && m.get ? m.get(c) : null; return p && typeof p === 'object' ? p : null; };
  const nameOf = (c) => { const p = client.peers && client.peers.get(c); return clean(p && p.name, 24); };
  const hostPeer = () => { for (const [c, p] of client.peers || []) if (p && p.role === 'host' && !gone(p)) return { c, p }; return null; };

  // mode: 'off' (an ordinary Live session: everything passes), 'host', 'pending' (a student before joining), 'in' (a student in the class), 'left'
  let mode = 'off';
  let keys = null;                       // { sk, pk }
  const pairs = new Map();               // "c|dir" → key
  const store = new ClassStore({ now });
  const keep = new Map();                // x → { ops } the plain ops of this window's own sealed edits
  let xid = 0, opsSent = 0, tcount = 0, tApplied = 0, sinceSnap = 0, snapId = 0;
  let looking = null, helping = false, own = null, helperOn = false, hostName = '';
  let thumbDirty = true, thumbAt = 0, thumbBusy = false, lastThumbMs = 0;
  let big = false;
  const stash = new Map();               // room → sealed ops that arrived before the student's key did

  const modelOps = (ops) => ops.filter((o) => !isClsOp(o));
  const myRoom = () => roomOf(client.c);
  const teacherC = () => { const h = hostPeer(); return h ? h.c : 0; };

  // ---- keys ----------------------------------------------------------------------------------------------------------------------
  function keyFor(studentC, dir) {
    if (!keys) return null;
    const other = mode === 'host' ? unhex((rawPresence(studentC) || {}).cls && rawPresence(studentC).cls.pk) : unhex(((rawPresence(teacherC()) || {}).cls || {}).pk);
    if (!other) return null;
    const id = studentC + '|' + dir + '|' + hex(other);
    let k = pairs.get(id);
    if (!k) { k = pairKey(keys.sk, other, client.session || '', roomOf(studentC), dir); pairs.set(id, k); }
    return k;
  }
  const sealPayload = (studentC, dir, payload) => { const k = keyFor(studentC, dir === 's' ? 's2t' : 't2s'); return k ? seal(k, pack(payload)) : null; };
  const openPayload = (studentC, dir, bytes) => {
    const k = keyFor(studentC, dir === 's' ? 's2t' : 't2s'); if (!k) return undefined;       // undefined: no key yet
    const plain = open(k, bytes); if (!plain) return null;
    try { return unpack(plain); } catch { return null; }
  };

  // ---- sending -------------------------------------------------------------------------------------------------------------------
  // Streams that are not edits (snapshots, pictures, controls) go out as pending edits of kind 'cls': no undo entry, no redo reset.
  const origRecord = client.record;
  client.record = function record(cm, p, inv) { if (p && p.kind === 'cls') return undefined; return origRecord.call(this, cm, p, inv); };
  offs.push(() => { client.record = origRecord; });
  function sendQuiet(ops, touched) {
    const p = { n: ++client.n, label: '', ops, inverse: [], touched: touched || [{ k: 'room:' + (mode === 'host' ? looking || '' : myRoom()), m: 'r' }], applied: true, kind: 'cls', of: null, sent: false };
    client.pending.push(p); client.sendEdit(p);
  }
  const helpTouched = (room, ops) => {
    let t = []; try { t = (inner.touched(ops) || []).map((x) => Object.assign({}, x, { k: room + '/' + x.k })); } catch { t = []; }
    return t.length ? t : [{ k: 'room:' + room, m: 'r' }];
  };
  /** An edit of the model, sealed: plain ops kept here, sealed ones on the wire. Returns the wire op, or null (no key yet). */
  function sealedEdit(studentC, dir, innerOps, kind = 'O') {
    const x = ++xid;
    keep.set(x, { ops: innerOps, inv: null });
    if (keep.size > MAX_KEEP) keep.delete(keep.keys().next().value);
    const room = roomOf(studentC);
    const op = wireOp(room, dir, kind, undefined, x);
    // sealed when first read (an inverse that is never sent costs nothing); counters are fixed at that moment
    let sealedB = null;
    Object.defineProperty(op, 'b', { enumerable: true, get() {
      if (sealedB) return sealedB;
      const payload = dir === 's' ? { k: 'O', i: ++opsSent, ops: innerOps } : { k: 'O', j: ++tcount, ops: innerOps };
      sealedB = sealPayload(studentC, dir, payload) || new Uint8Array(0);
      if (dir === 't') store.onTeacherOps(room, innerOps);
      if (dir === 's') { sinceSnap++; thumbDirty = true; }
      return sealedB;
    } });
    return op;
  }

  // ---- the adapter wrapper -------------------------------------------------------------------------------------------------------
  const active = () => (mode === 'in' && !big) || (mode === 'in') || (mode === 'host' && looking && helping);
  const sharing = () => (mode === 'in') || (mode === 'host' && !!looking && helping);
  const sharedC = () => (mode === 'in' ? client.c : (store.rooms.get(looking) || {}).c || 0);
  const sharedDir = () => (mode === 'in' ? 's' : 't');
  const helpActive = () => (mode === 'in' ? helperOn : helping);

  function route(step) {
    if (mode === 'off') return client.localChange(step);
    if (mode === 'host') {
      if (!looking) return null;                                   // the teacher's own file during a class: local, never shared
      if (!helping) {                                              // the Viewer rule: looking in is read-only
        try { inner.apply(step.inverse, 'rollback'); } catch { /* already gone */ }
        emit('readonly', { room: looking });
        return null;
      }
    } else if (mode !== 'in') return null;                          // pending / left: stays in this window, shared with no one
    const c = sharedC(); if (!c) return null;
    const dir = sharedDir();
    const fwd = sealedEdit(c, dir, step.ops);
    const inv = sealedEdit(c, dir, step.inverse);
    keep.get(fwd.x).inv = inv;
    if (dir === 's') maybeSnapshot();
    return client.localChange({ label: '', ops: [fwd], inverse: [inv] });
  }

  // x numbers are per window: an op is ours only when its direction is the one this window sends
  const isOwn = (o) => !!(o.x && keep.has(o.x) && o.d === sharedDir());
  const wrapped = {
    __cls: true, app: inner.app, schema: inner.schema,
    onLocalChange() {},                                              // LiveClient registered with the app's adapter before we were here
    touched(ops) {
      const out = [];
      for (const o of ops) {
        if (!isClsOp(o)) { if (mode === 'off') { try { out.push(...(inner.touched([o]) || [])); } catch { /* skip */ } } continue; }
        if (isOwn(o) && helpActive()) { out.push(...helpTouched(o.r, keep.get(o.x).ops)); continue; }
        out.push({ k: 'room:' + o.r, m: 'r' });
      }
      return out.length ? out : [{ k: 'room:-', m: 'r' }];
    },
    invert(ops) {
      if (mode === 'off') return inner.invert(ops);
      const inv = [];
      for (const o of ops) {
        if (!isClsOp(o) || !isOwn(o)) continue;
        const e = keep.get(o.x);
        if (!helpActive() && e.inv) { inv.unshift(e.inv); continue; }       // nothing else touches this model: its inverse still holds
        let innerInv = []; try { innerInv = inner.invert(e.ops); } catch { innerInv = []; }
        const w = sealedEdit(o.r === myRoom() ? client.c : (store.rooms.get(o.r) || {}).c || 0, o.d, innerInv);
        e.inv = w; inv.unshift(w);
      }
      return inv;
    },
    apply(ops, origin) {
      if (mode === 'off') {
        const plain = modelOps(ops);
        // a class op reaching an ordinary session (a late joiner before the marker): never into the model
        return plain.length ? inner.apply(plain, origin) : undefined;
      }
      for (const o of ops) {
        if (!isClsOp(o)) continue;
        if (isOwn(o)) {                                               // one of ours
          const e = keep.get(o.x);
          if (origin === 'own') continue;                              // the commit of an edit already applied here
          if (!helpActive()) continue;                                 // nothing else changes this model: a rollback and a re-apply cancel out
          try { inner.apply(e.ops, origin); } catch { /* it no longer applies */ }
          continue;
        }
        foreign(o);
      }
      return undefined;
    },
    validate(ops) { return mode === 'off' && !ops.some(isClsOp) && inner.validate ? inner.validate(modelOps(ops)) : (ops.some(isClsOp) ? checkWireOps(ops) : (inner.validate ? inner.validate(ops) : null)); },
    snapshot() { return mode === 'host' ? markerBytes() : inner.snapshot(); },
    load(bytes, q) {
      if (isMarker(bytes)) { enterPending(); return undefined; }       // a class room's marker: this window keeps its own file
      if (mode !== 'off') return undefined;
      return inner.load(bytes, q);
    },
  };
  for (const k of Object.keys(inner)) {
    if (k in wrapped || k === 'onLocalChange') continue;
    const v = inner[k];
    if (typeof v === 'function') wrapped[k] = v.bind(inner);
    else Object.defineProperty(wrapped, k, { enumerable: true, get: () => inner[k], set: (x) => { inner[k] = x; } });
  }
  for (const k of ['afterApply', 'drawPresence', 'presence']) if (typeof inner[k] === 'function') wrapped[k] = inner[k].bind(inner);
  client.adapter = wrapped;
  if (typeof inner.onLocalChange === 'function') inner.onLocalChange((step) => route(step));
  offs.push(() => { if (client.adapter === wrapped) client.adapter = inner; if (typeof inner.onLocalChange === 'function') inner.onLocalChange((step) => client.localChange(step)); });

  // ---- what arrives from someone else ------------------------------------------------------------------------------------------
  function foreign(o) {
    if (mode === 'host') {
      if (o.d !== 's') return;
      const c = Number(String(o.r).slice(1));
      if (!c || c === client.c) return;
      ingest(o, c);
    } else if (mode === 'in' && o.d === 't' && o.r === myRoom()) {
      const plain = openPayload(client.c, 't', o.b);
      if (plain === undefined) { stashFor(o); return; }
      if (!plain) return;                                              // not sealed to us (a forgery or another room)
      fromTeacher(plain);
    }
  }
  function stashFor(o) { const l = stash.get(o.r) || []; if (l.length < 50) l.push(o); stash.set(o.r, l); }
  function ingest(o, c) {
    const plain = openPayload(c, 's', o.b);
    if (plain === undefined) { stashFor(o); return; }
    if (!plain || typeof plain !== 'object') return;                   // not from that student
    const room = store.room(o.r, c, nameOf(c));
    if (plain.k === 'O') {
      if (store.onOps(o.r, plain) && looking === o.r && Array.isArray(plain.ops)) {
        try { inner.apply(plain.ops, 'remote'); if (inner.afterApply) inner.afterApply({ commits: 1 }); } catch { /* the copy no longer takes it */ }
      }
      if (room.wantSnap) askSnapshot(c);
      emit('change');
    } else if (plain.k === 'S') {
      const done = store.onSnapPiece(o.r, plain);
      if (done) finishSnapshot(o.r, done);
    } else if (plain.k === 'T') {
      if (store.onThumb(o.r, plain)) emit('change');
    } else if (plain.k === 'B') {                                      // the student says the file is too large to copy
      room.big = true; room.snap = null; room.ops = []; room.opsBytes = 0; emit('change');   // a stale copy must not be looked at
    }
  }
  async function finishSnapshot(r, done) {
    let raw = done.bytes;
    if (done.enc === 'deflate') { try { raw = await inflate(raw); } catch { return; } }
    store.setSnapshot(r, raw, done.upto, done.tj);
    emit('change');
  }
  function askSnapshot(c) {
    const room = store.rooms.get(roomOf(c)); if (!room || room.asked && now() - room.asked < 5000) return;
    room.asked = now();
    const b = sealPayload(c, 't', { k: 'R' }); if (!b) return;
    sendQuiet([wireOp(roomOf(c), 't', 'R', b)], [{ k: 'room:' + roomOf(c), m: 'r' }]);
  }
  function fromTeacher(p) {
    if (p.k === 'O' && Array.isArray(p.ops) && Number.isSafeInteger(p.j) && p.j > tApplied) {
      tApplied = p.j;
      try { inner.apply(p.ops, 'remote'); thumbDirty = true; } catch { /* the file no longer takes it */ }
    } else if (p.k === 'H') { helperOn = !!p.on; emit('helper', { on: helperOn, name: hostName }); emit('change'); }
    else if (p.k === 'R') sendSnapshot();
  }
  function retryStash() {
    for (const [r, list] of [...stash]) {
      stash.delete(r);
      for (const o of list) foreign(o);
    }
  }

  // ---- presence ------------------------------------------------------------------------------------------------------------------
  let lastCls = '';
  function publish(force = false) {
    let cls = null;
    if (mode === 'host' && keys) cls = { pk: hex(keys.pk), on: 1 };
    else if ((mode === 'pending' || mode === 'in') && keys) cls = { pk: hex(keys.pk), ok: mode === 'in' ? 1 : 0, big: big ? 1 : 0 };
    const k = JSON.stringify(cls);
    const have = (client.lastPresence || {}).cls;
    if (!force && k === lastCls && JSON.stringify(have || null) === k) return;
    lastCls = k;
    try { client.setPresence({ ...(client.lastPresence || {}), cls, cr: (client.lastPresence && client.lastPresence.cr || 0) + (force ? 1 : 0) }); } catch { /* the session ended */ }
  }

  // ---- the student ----------------------------------------------------------------------------------------------------------------
  async function enterPending() {
    if (mode !== 'off') return;
    mode = 'pending'; inner.__pendingSince = now();
    const h = hostPeer(); hostName = h ? clean(h.p.name, 24) : '';
    emit('notice', { name: hostName || T('live.cr.someone') }); emit('change');
    try { await loadCrypto(); keys = newKeyPair(); publish(); } catch (e) { emit('error', e); }
  }
  async function accept() {
    if (mode !== 'pending') return false;
    if (!keys) { await loadCrypto(); keys = newKeyPair(); }
    mode = 'in'; opsSent = 0; tcount = 0; tApplied = 0; sinceSnap = 0; thumbDirty = true;
    publish();
    // the teacher's key may not have reached us yet: wait for it before the first sealed message
    let tries = 0;
    while (!keyFor(client.c, 't2s') && tries++ < 100) await new Promise((r) => setTimeout(r, 30));
    sendSnapshot(); sendThumb(true);
    emit('change');
    return true;
  }
  function leave() {
    mode = 'left'; emit('change');
    try { client.leave(); } catch { /* already over */ }
  }
  async function sendSnapshot() {
    if (mode !== 'in') return;
    let raw; try { raw = inner.snapshot(); } catch { return; }
    if (!(raw instanceof Uint8Array)) return;
    if (raw.length > MAX_COPY) {
      big = true; publish();
      const b = sealPayload(client.c, 's', { k: 'B' }); if (b) sendQuiet([wireOp(myRoom(), 's', 'B', b)]);
      return;
    }
    big = false;
    const upto = opsSent, tj = tApplied;
    let data = raw, enc = '';
    if (raw.length > 4096 && typeof CompressionStream !== 'undefined') { try { data = await deflate(raw); enc = 'deflate'; } catch { data = raw; enc = ''; } }
    sinceSnap = 0;
    const id = ++snapId, of = Math.max(1, Math.ceil(data.length / CHUNK));
    for (let i = 0; i < of; i++) {
      const b = sealPayload(client.c, 's', { k: 'S', id, i, of, enc, upto, tj, data: data.subarray(i * CHUNK, (i + 1) * CHUNK) });
      if (!b) return;
      sendQuiet([wireOp(myRoom(), 's', 'S', b)]);
    }
  }
  function maybeSnapshot() { if (sinceSnap >= SNAP_EVERY) { sinceSnap = 0; setTimeout(sendSnapshot, 0); } }

  // the picture: from this window's own view, never faster than THUMB_EVERY
  async function makeThumb() {
    if (typeof opts.thumb === 'function') return opts.thumb();
    const el = view && view.el; if (!el || typeof document === 'undefined') return null;
    const canvases = el.tagName === 'CANVAS' ? [el] : [...el.querySelectorAll('canvas')];
    const big = canvases.filter((c) => c.width > 8 && c.height > 8);
    if (!big.length) return null;
    const out = document.createElement('canvas'); out.width = THUMB_W; out.height = THUMB_H;
    const g = out.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, THUMB_W, THUMB_H);
    const s = Math.min(THUMB_W / big[0].width, THUMB_H / big[0].height);
    for (const c of big) { try { g.drawImage(c, 0, 0, c.width * s, c.height * s); } catch { /* a tainted or lost canvas */ } }
    const blob = await new Promise((res) => out.toBlob(res, 'image/webp', 0.6));
    if (!blob) return null;
    return { img: new Uint8Array(await blob.arrayBuffer()), w: THUMB_W, h: THUMB_H };
  }
  async function sendThumb(force = false) {
    if (mode !== 'in' || thumbBusy) return;
    if (!force && (!thumbDirty || now() - lastThumbMs < THUMB_EVERY)) return;
    thumbBusy = true;
    try {
      const t = await makeThumb();
      if (t && t.img && t.img.length <= MAX_THUMB) {
        const b = sealPayload(client.c, 's', { k: 'T', img: t.img, w: t.w, h: t.h });
        if (b) { sendQuiet([wireOp(myRoom(), 's', 'T', b)]); lastThumbMs = now(); thumbDirty = false; }
      }
    } catch { /* no picture this time */ } finally { thumbBusy = false; }
  }

  // ---- the teacher ----------------------------------------------------------------------------------------------------------------
  const others = () => {
    const out = [];
    for (const [c, p] of client.peers || []) if (c !== client.c && p && !gone(p) && !p.of && p.role !== 'host') out.push({ c, p });
    return out;
  };
  async function start() {
    if (mode === 'host') return { ok: true };
    if (client.role !== 'host') return { ok: false, reason: 'role' };
    if (others().length) return { ok: false, reason: 'busy' };
    await loadCrypto(); keys = newKeyPair();
    mode = 'host'; store.clear(); publish();
    emit('change');
    return { ok: true };
  }
  function end() {
    backToClass();
    try { client.end(); } catch { /* over */ }
    mode = 'off'; emit('change');
  }
  function roster() {
    const out = [];
    for (const { c, p } of others()) {
      const pr = (rawPresence(c) || {}).cls || null;
      const r = roomOf(c), room = store.rooms.get(r);
      const inClass = !!(pr && pr.ok === 1);
      out.push({
        r, c, name: clean(p.name, 24) || '?', state: p.state === 'gone' ? 'away' : inClass ? 'in' : 'joined',
        lastEdit: room ? room.lastEdit : 0, edits: room ? room.edits : 0, thumb: room ? room.thumb : null, big: !!(pr && pr.big) || !!(room && room.big),
        hasCopy: !!(room && room.snap), helping: helping && looking === r, looking: looking === r,
      });
    }
    out.sort((a, b) => a.name.localeCompare(b.name) || a.c - b.c);
    return out;
  }
  function counts() { const l = roster(); return { total: l.length, working: l.filter((x) => x.state === 'in').length }; }
  async function lookIn(r) {
    if (mode !== 'host') return { ok: false, reason: 'mode' };
    const room = store.rooms.get(r); const cp = store.copy(r);
    if (!room || room.big || !cp) return { ok: false, reason: room && room.big ? 'big' : 'nocopy' };
    if (looking && looking !== r) backToClass();
    if (!looking) { try { own = inner.snapshot(); } catch { return { ok: false, reason: 'own' }; } }
    try {
      inner.load(cp.snap, 0);
      for (const ops of cp.ops) inner.apply(ops, 'remote');
      if (inner.afterApply) inner.afterApply({ commits: 1 });
    } catch (e) { if (own) { try { inner.load(own, 0); } catch { /* nothing more to do */ } } own = null; return { ok: false, reason: 'load' }; }
    looking = r; helping = false;
    globalThis.ccClassLookIn = { room: r, name: room.name };
    const f = globalThis.ccLiveFollow; if (f && f.follow) f.follow(room.c);
    emit('change');
    return { ok: true };
  }
  function backToClass() {
    if (!looking) return;
    if (helping) helpOff();
    const f = globalThis.ccLiveFollow; if (f && f.stop) f.stop();
    looking = null; helping = false;
    if (own) { try { inner.load(own, 0); if (inner.afterApply) inner.afterApply({ commits: 1 }); } catch { /* the window keeps the copy */ } own = null; }
    globalThis.ccClassLookIn = null;
    emit('change');
  }
  function helpOn(r) {
    if (mode !== 'host' || looking !== r) return false;
    const room = store.rooms.get(r); if (!room) return false;
    helping = true;
    const b = sealPayload(room.c, 't', { k: 'H', on: 1 });
    if (b) sendQuiet([wireOp(r, 't', 'H', b)], [{ k: 'room:' + r, m: 'r' }]);
    emit('change');
    return true;
  }
  function helpOff() {
    if (!helping) return;
    const room = store.rooms.get(looking); helping = false;
    if (room) { const b = sealPayload(room.c, 't', { k: 'H', on: 0 }); if (b) sendQuiet([wireOp(looking, 't', 'H', b)], [{ k: 'room:' + looking, m: 'r' }]); }
    emit('change');
  }

  // ---- upkeep ---------------------------------------------------------------------------------------------------------------------
  function tick() {
    if (mode === 'off') {
      const h = hostPeer(), pr = h ? (rawPresence(h.c) || {}).cls : null;
      if (pr && pr.on === 1 && client.role !== 'host' && client.welcomed) enterPending();     // a log catch-up joiner never saw the marker
      return;
    }
    publish();
    if (stash.size) retryStash();
    if (mode === 'in') {
      const h = hostPeer(); if (h) hostName = clean(h.p.name, 24);
      sendThumb();
    }
    if (mode === 'host') emit('tick');
  }
  const h = timers.set(tick, 1000);
  offs.push(() => timers.clear(h));
  offs.push(client.on('welcome', ({ }) => {
    if (mode === 'in') { setTimeout(sendSnapshot, 0); }          // after a drop the teacher may have missed a stretch: a fresh copy
    emit('change');                                               // the role is known now: the teacher's button can show
  }));
  // the server hands a newcomer no earlier presence: the host says again, once, when someone arrives
  offs.push(client.on('peer', (p) => { if (mode === 'host' && p && p.state === 'in') publish(true); emit('change'); }));
  offs.push(client.on('ended', () => { if (mode === 'host') backToClassSilently(); mode = mode === 'off' ? 'off' : mode; emit('change'); }));
  function backToClassSilently() { if (looking) { looking = null; helping = false; if (own) { try { inner.load(own, 0); } catch { /* ended */ } own = null; } globalThis.ccClassLookIn = null; } }

  const api = {
    get mode() { return mode; },
    get looking() { return looking; },
    get helping() { return helping; },
    get helper() { return helperOn; },
    get hostName() { return hostName; },
    store, keep, T, clean,
    start, end, accept, leave, lookIn, backToClass, helpOn, helpOff, roster, counts, tick, publish, sendSnapshot, sendThumb,
    others,
    on(ev, f) { if (!listeners.has(ev)) listeners.set(ev, new Set()); listeners.get(ev).add(f); return () => listeners.get(ev).delete(f); },
    canStart: () => client.role === 'host' && mode !== 'host' && !others().length,
    detach() { for (const f of offs.reverse()) { try { f(); } catch { /* gone */ } } offs.length = 0; if (globalThis.ccClassroom === api) globalThis.ccClassroom = null; },
  };
  const detach = () => api.detach();
  detach.api = api;
  globalThis.ccClassroom = api;
  if (typeof document !== 'undefined' && opts.ui !== false) mountUi(api, client, view, T);
  return detach;
}

// ---- the screens ------------------------------------------------------------------------------------------------------------------------

function mountUi(ctl, client, view, T) {
  const mk = (tag, style, text) => { const n = document.createElement(tag); if (style) Object.assign(n.style, style); if (text !== undefined) n.textContent = text; return n; };
  const btnStyle = { font: 'inherit', cursor: 'pointer', border: '1px solid rgba(23,32,43,.35)', borderRadius: '3px', padding: '3px 8px',
    background: 'var(--ws-panel-bg, #ffffff)', color: 'var(--ws-ink, #17202b)', lineHeight: '1.2' };
  const btn = (text, fn, extra) => { const b = mk('button', { ...btnStyle, ...(extra || {}) }, text); b.type = 'button'; b.addEventListener('click', fn); return b; };
  const root = mk('div', { position: 'fixed', right: '12px', top: '56px', zIndex: '40', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px',
    font: '600 12px system-ui, sans-serif', maxWidth: 'min(26rem, 94vw)', pointerEvents: 'none' });
  root.dataset.liveClassroom = '';
  const toggle = mk('button', { ...btnStyle, pointerEvents: 'auto', display: 'none' }); toggle.type = 'button'; toggle.setAttribute('aria-expanded', 'false');
  const panel = mk('div', { pointerEvents: 'auto', display: 'none', width: '100%', maxHeight: '70vh', overflowY: 'auto', padding: '8px', borderRadius: '3px',
    background: 'var(--ws-panel-bg, #ffffff)', color: 'var(--ws-ink, #17202b)', border: '1px solid rgba(23,32,43,.35)', boxShadow: '0 4px 16px rgba(0,0,0,.18)', font: '400 12px system-ui, sans-serif' });
  panel.setAttribute('role', 'region'); panel.dataset.classPanel = '';
  const bar = mk('div', { pointerEvents: 'auto', display: 'none', padding: '6px 10px', borderRadius: '3px', color: '#fff', background: '#1f6fd1', font: '600 12px system-ui, sans-serif' });
  bar.setAttribute('role', 'status'); bar.dataset.classBar = '';
  root.append(toggle, bar, panel);
  let open = false, modal = null;
  const urls = new Map();
  toggle.addEventListener('click', () => { open = !open; render(); });
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { open = false; render(); toggle.focus(); } });

  function showNotice(info) {
    if (modal) return;
    const veil = mk('div', { position: 'fixed', inset: '0', zIndex: '60', background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' });
    const box = mk('div', { background: 'var(--ws-panel-bg, #ffffff)', color: 'var(--ws-ink, #17202b)', maxWidth: '30rem', width: '100%', padding: '16px', borderRadius: '4px',
      font: '400 14px/1.4 system-ui, sans-serif', boxShadow: '0 8px 32px rgba(0,0,0,.35)' });
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.dataset.classNotice = '';
    const title = mk('h2', { font: '700 16px system-ui, sans-serif', margin: '0 0 8px' }, T('live.cr.notice.title', { name: info.name }));
    box.setAttribute('aria-label', title.textContent);
    const body = mk('p', { margin: '0 0 12px' }, T('live.cr.notice.body'));
    const row = mk('div', { display: 'flex', gap: '8px', justifyContent: 'flex-end' });
    const join = btn(T('live.cr.notice.join'), async () => { join.disabled = true; const ok = await ctl.accept(); if (ok) close(); else join.disabled = false; }, { background: '#1f6fd1', color: '#fff', border: '1px solid #1f6fd1', padding: '6px 12px' });
    join.dataset.classJoin = '';
    const lv = btn(T('live.cr.notice.leave'), () => { close(); ctl.leave(); }, { padding: '6px 12px' }); lv.dataset.classLeave = '';
    row.append(lv, join); box.append(title, body, row); veil.append(box); document.body.append(veil); modal = veil;
    join.focus();
    function close() { if (modal) { modal.remove(); modal = null; } }
  }
  ctl.on('notice', showNotice);

  const ago = (ms) => { const [k, v] = agoParts(ms); return T(k, v); };
  function card(s) {
    const li = mk('li', { display: 'grid', gridTemplateColumns: '96px 1fr', gap: '2px 8px', padding: '6px 0', borderTop: '1px solid rgba(23,32,43,.15)' });
    li.dataset.room = s.r;
    const pic = mk('div', { width: '96px', height: '60px', background: 'rgba(23,32,43,.08)', borderRadius: '2px', overflow: 'hidden' });
    if (s.thumb) {
      let u = urls.get(s.r);
      if (!u || u.img !== s.thumb.img) { if (u) URL.revokeObjectURL(u.url); u = { img: s.thumb.img, url: URL.createObjectURL(new Blob([s.thumb.img], { type: s.thumb.mime })) }; urls.set(s.r, u); }
      const im = mk('img', { width: '96px', height: '60px', objectFit: 'contain', display: 'block' }); im.src = u.url; im.alt = s.name; pic.append(im);
    }
    const side = mk('div', { minWidth: '0' });
    side.append(mk('div', { fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, s.name));
    const bits = [];
    if (s.state === 'joined') bits.push(T('live.cr.student.joined'));
    else if (s.state === 'away') bits.push(T('live.cr.student.away'));
    else {
      bits.push(s.lastEdit ? T('live.cr.last', { ago: ago(Date.now() - s.lastEdit) }) : T('live.cr.noedit'));
      if (s.edits) bits.push(T('live.cr.edits', { n: s.edits }));
      if (s.big) bits.push(T('live.cr.student.big')); else if (!s.hasCopy) bits.push(T('live.cr.student.nocopy'));
    }
    side.append(mk('div', { opacity: '.8' }, bits.join(' · ')));
    const acts = mk('div', { display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' });
    if (s.state === 'in') {
      if (s.looking) {
        acts.append(btn(s.helping ? T('live.cr.help.stop') : T('live.cr.help'), () => (s.helping ? ctl.helpOff() : ctl.helpOn(s.r))), btn(T('live.cr.back'), () => ctl.backToClass()));
      } else {
        const l = btn(T('live.cr.lookin'), () => ctl.lookIn(s.r)); l.disabled = !s.hasCopy || s.big; l.dataset.classLook = s.r; acts.append(l);
        const f = btn(T('live.cr.follow'), () => { const a = globalThis.ccLiveFollow; if (a && a.follow) a.follow(s.c); }); acts.append(f);
      }
    }
    side.append(acts);
    li.append(pic, side);
    return li;
  }
  function render() {
    const m = ctl.mode;
    const showToggle = m === 'host' || (client.role === 'host' && m === 'off');
    toggle.style.display = showToggle ? 'block' : 'none';
    const cnt = ctl.counts();
    toggle.textContent = m === 'host' ? T('live.cr.button') + ' · ' + T('live.cr.count', { n: cnt.working, m: cnt.total }) : T('live.cr.button');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    // the bar: a student's reminder, or what the teacher is doing
    let text = '';
    if (m === 'in') text = ctl.helper ? T('live.cr.helper', { name: ctl.hostName || T('live.cr.someone') }) : T('live.cr.banner', { name: ctl.hostName || T('live.cr.someone') });
    else if (m === 'host' && ctl.looking) {
      const room = ctl.store.rooms.get(ctl.looking), nm = room ? room.name : '';
      text = ctl.helping ? T('live.cr.helping', { name: nm }) : T('live.cr.looking', { name: nm });
    }
    bar.style.display = text ? 'block' : 'none'; bar.textContent = '';
    if (text) {
      bar.append(mk('span', null, text));
      if (m === 'in') bar.append(' ', btn(T('live.cr.banner.leave'), () => ctl.leave(), { padding: '1px 6px', marginLeft: '6px' }));
      if (m === 'host' && ctl.looking) bar.append(mk('div', { fontWeight: '400', marginTop: '2px' }, T('live.cr.nosave')));
    }
    panel.style.display = open && showToggle ? 'block' : 'none';
    if (!open || !showToggle) return;
    panel.replaceChildren(); panel.setAttribute('aria-label', T('live.cr.title'));
    const head = mk('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' });
    head.append(mk('strong', null, T('live.cr.title')), btn('×', () => { open = false; render(); toggle.focus(); }, { padding: '0 8px' }));
    panel.append(head);
    if (m !== 'host') {
      panel.append(mk('p', { margin: '4px 0' }, T('live.cr.start.note')));
      const can = ctl.canStart();
      const b = btn(T('live.cr.start'), async () => { const r = await ctl.start(); if (!r.ok) render(); }); b.disabled = !can; b.dataset.classStart = ''; panel.append(b);
      if (!can) panel.append(mk('p', { margin: '4px 0', opacity: '.8' }, T('live.cr.start.busy')));
      return;
    }
    panel.append(mk('p', { margin: '4px 0', opacity: '.85' }, T('live.cr.privacy.teacher')));
    const list = ctl.roster();
    if (!list.length) panel.append(mk('p', { margin: '6px 0' }, T('live.cr.none')));
    const ul = mk('ul', { listStyle: 'none', margin: '0', padding: '0' });
    for (const s of list) ul.append(card(s));
    panel.append(ul);
    const det = mk('details', { margin: '6px 0' }); det.append(mk('summary', { cursor: 'pointer' }, T('live.cr.how.title')), mk('p', { margin: '4px 0' }, T('live.cr.how.body')));
    panel.append(det, btn(T('live.cr.end'), () => ctl.end(), { marginTop: '4px' }));
  }
  const dropOld = () => { for (const [r, u] of urls) if (!ctl.store.rooms.has(r)) { URL.revokeObjectURL(u.url); urls.delete(r); } };
  ctl.on('change', () => { render(); dropOld(); });
  ctl.on('helper', () => render());
  ctl.on('readonly', ({ room }) => { const rm = ctl.store.rooms.get(room); bar.style.display = 'block'; bar.textContent = T('live.cr.readonly', { name: rm ? rm.name : '' }); });
  const host = document.body;
  host.append(root);
  const h = setInterval(() => { if (ctl.mode === 'host' && open) render(); }, 2000);
  const prev = ctl.detach;
  ctl.detach = () => { clearInterval(h); root.remove(); if (modal) modal.remove(); for (const u of urls.values()) URL.revokeObjectURL(u.url); prev(); };
  render();
}

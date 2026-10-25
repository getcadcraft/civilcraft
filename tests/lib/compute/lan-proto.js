/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: protocol fields and error codes for the code that calls it; lan-ui.js turns codes into words */
/**
 * lan-proto.js — the wire between a page that renders and a LAN render node (0.7 CU.7). Both ends are pages (the requester's
 * app window and the node's Studio window); the Studio shells only find each other (mDNS `_ccrender._tcp`, only a random tag
 * advertised) and carry bytes. Everything after the handshake is end-to-end encrypted with Studio Live's own crypto
 * (live-crypto.js: SPAKE2 with the node's code as the password, then sealed frames), handed in by the app, so this file stays
 * import-free. DOM-free.
 *
 *   Transport (the app makes one: a WebSocket, Studio's bridge, or a test pair):
 *     { send(Uint8Array), close(), onmessage: (Uint8Array) => void, onclose: () => void }
 *   Handshake bytes (unsealed, the only ones): [0x01, tag (2 ASCII), A (33)] joiner → node · [0x02, B (33)] · [0x03, confirm
 *     (32)] · [0x04, confirm (32)]. The PAKE context is 'render:' + tag (never Live's 'lan:' + tag, so a Live code is useless
 *     here and the other way round). After that every message is [0x10, sealed frame].
 *   Message (inside a sealed frame): [u32 BE head length][head: UTF-8 JSON {type, …}][payload bytes]. A payload over
 *     CHUNK bytes travels as 'part' messages {id, i, n, type, head} + the last part; the receiver reassembles up to `maxBytes`.
 *
 *   encodeMessage(head, payload?) → Uint8Array · decodeMessage(bytes) → { head, payload }
 *   createChannel({ transport, session, maxBytes, onMessage(head, payload), onError(err) }) → { send(head, payload?), close() }
 *     session = live-crypto Session (seal/open). Any frame that fails to open, a malformed message or one over maxBytes
 *     closes the channel (onError with code 'bad_frame' | 'bad_message' | 'too_big').
 *   handshakeJoiner / handshakeNode: lan.js / lan-node.js drive them.
 */

export const VERSION = 1;
export const CHUNK = 4 * 1024 * 1024;
export const T = Object.freeze({ PAKE_A: 1, PAKE_B: 2, CONFIRM_J: 3, CONFIRM_N: 4, FRAME: 0x10 });
const enc = new TextEncoder(), dec = new TextDecoder('utf-8', { fatal: true });
const MAX_HEAD = 64 * 1024;

export function lanError(code, message) { const e = new Error(message || code); e.code = code; return e; }

export function encodeMessage(head, payload = null) {
  const h = enc.encode(JSON.stringify(head));
  if (h.length > MAX_HEAD) throw lanError('bad_message', 'head too large');
  const p = payload ? new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength) : new Uint8Array(0);
  const out = new Uint8Array(4 + h.length + p.length);
  new DataView(out.buffer).setUint32(0, h.length);
  out.set(h, 4); out.set(p, 4 + h.length);
  return out;
}

export function decodeMessage(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < 4) throw lanError('bad_message', 'short');
  const n = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0);
  if (n > MAX_HEAD || 4 + n > bytes.length) throw lanError('bad_message', 'head length');
  let head;
  try { head = JSON.parse(dec.decode(bytes.subarray(4, 4 + n))); } catch { throw lanError('bad_message', 'head is not JSON'); }
  if (!head || typeof head !== 'object' || Array.isArray(head) || typeof head.type !== 'string') throw lanError('bad_message', 'no type');
  return { head, payload: bytes.subarray(4 + n) };
}

const tagged = (t, body) => { const out = new Uint8Array(1 + body.length); out[0] = t; out.set(body, 1); return out; };

/** The encrypted message channel over a transport, once the handshake has given a live-crypto Session. */
export function createChannel({ transport, session, maxBytes = 512 * 1024 * 1024, onMessage, onError = () => {} }) {
  let closed = false, nextId = 1;
  const parts = new Map();   // id → { type, head, n, got, size, bufs }
  const fail = (code, why) => { if (closed) return; closed = true; try { transport.close(); } catch { /* gone */ } onError(lanError(code, why)); };
  const sendFrame = (msg) => { if (!closed) transport.send(tagged(T.FRAME, session.seal(msg))); };

  transport.onmessage = (bytes) => {
    if (closed) return;
    if (!(bytes instanceof Uint8Array) || bytes[0] !== T.FRAME) return fail('bad_frame', 'not a frame');
    let opened;
    try { opened = session.open(bytes.subarray(1)); } catch { return fail('bad_frame', 'frame did not open'); }
    if (opened.kind !== 'data') return;
    let m;
    try { m = decodeMessage(opened.body); } catch (e) { return fail('bad_message', e.message); }
    const { head, payload } = m;
    if (head.type === 'part') {
      const { id, i, n } = head;
      if (!Number.isInteger(id) || !Number.isInteger(i) || !Number.isInteger(n) || n < 2 || n > 1 + Math.ceil(maxBytes / CHUNK) || i < 0 || i >= n) return fail('bad_message', 'part');
      let p = parts.get(id);
      if (!p) { if (i !== 0 || !head.inner || typeof head.inner.type !== 'string') return fail('bad_message', 'first part'); p = { head: head.inner, n, got: 0, size: 0, bufs: [] }; parts.set(id, p); }
      if (i !== p.got || n !== p.n) return fail('bad_message', 'parts out of order');
      p.size += payload.length;
      if (p.size > maxBytes) return fail('too_big', 'message over ' + maxBytes + ' bytes');
      p.bufs.push(payload.slice()); p.got++;
      if (p.got === p.n) {
        parts.delete(id);
        const all = new Uint8Array(p.size);
        let o = 0;
        for (const b of p.bufs) { all.set(b, o); o += b.length; }
        try { onMessage(p.head, all); } catch (e) { fail('bad_message', 'handler: ' + (e?.message || e)); }
      }
      return;
    }
    if (payload.length > maxBytes) return fail('too_big', 'message over ' + maxBytes + ' bytes');
    try { onMessage(head, payload); } catch (e) { fail('bad_message', 'handler: ' + (e?.message || e)); }
  };
  transport.onclose = () => { if (!closed) { closed = true; onError(lanError('closed', 'the other end left')); } };

  return {
    get closed() { return closed; },
    send(head, payload = null) {
      if (closed) throw lanError('closed', 'channel closed');
      const p = payload ? new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength) : null;
      if (!p || p.length <= CHUNK) { sendFrame(encodeMessage(head, p)); return; }
      const id = nextId++, n = Math.ceil(p.length / CHUNK);
      for (let i = 0; i < n; i++) sendFrame(encodeMessage(i === 0 ? { type: 'part', id, i, n, inner: head } : { type: 'part', id, i, n }, p.subarray(i * CHUNK, Math.min(p.length, (i + 1) * CHUNK))));
    },
    close() { if (!closed) { closed = true; try { transport.close(); } catch { /* gone */ } } },
  };
}

/** Joiner side of the handshake → Promise<Session>. crypto = live-crypto.js (joinerHandshake, parseCode). */
export function handshakeJoiner(transport, code, crypto, { timeoutMs = 10000 } = {}) {
  const c = crypto.parseCode(code);
  if (!c) return Promise.reject(lanError('bad_code', 'not a code'));
  const context = 'render:' + c.tag;
  const j = crypto.joinerHandshake(c.secret, context);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { reject(lanError('timeout', 'no answer from the node')); try { transport.close(); } catch { /* gone */ } }, timeoutMs);
    let step = 0;
    transport.onclose = () => { clearTimeout(timer); reject(lanError(step >= 1 ? 'wrong_code' : 'closed', step >= 1 ? 'the node refused the code' : 'the node closed the connection')); };
    transport.onmessage = (b) => {
      try {
        if (step === 0 && b[0] === T.PAKE_B) { step = 1; transport.send(tagged(T.CONFIRM_J, j.receive(b.subarray(1)))); return; }
        if (step === 1 && b[0] === T.CONFIRM_N) { clearTimeout(timer); step = 2; transport.onclose = null; resolve(j.finish(b.subarray(1))); return; }
        throw lanError('bad_frame', 'unexpected handshake message');
      } catch (e) { clearTimeout(timer); try { transport.close(); } catch { /* gone */ } reject(e?.code === 'wrong_code' ? lanError('wrong_code', 'the node refused the code') : e); }
    };
    transport.send(tagged(T.PAKE_A, new Uint8Array([...enc.encode(c.tag.slice(0, 2).padEnd(2, '0')), ...j.message])));
  });
}

/** Node side → Promise<Session>. secret/tag = the node's current code; onWrong() counts a wrong try (3 in a row: new code). */
export function handshakeNode(transport, { secret, tag }, crypto, { timeoutMs = 10000, onWrong = () => {} } = {}) {
  const h = crypto.hostHandshake(secret, 'render:' + tag);
  return new Promise((resolve, reject) => {
    let step = 0;
    const timer = setTimeout(() => { if (step === 1) onWrong('timeout'); reject(lanError('timeout', 'the joiner stopped')); try { transport.close(); } catch { /* gone */ } }, timeoutMs);
    transport.onmessage = (b) => {
      try {
        if (step === 0 && b[0] === T.PAKE_A && b.length === 3 + 33) {
          if (dec.decode(b.subarray(1, 3)) !== tag) throw lanError('wrong_tag', 'another node');
          step = 1; transport.send(tagged(T.PAKE_B, h.receive(b.subarray(3)))); return;
        }
        if (step === 1 && b[0] === T.CONFIRM_J) {
          const { confirm, session } = h.finish(b.subarray(1));
          clearTimeout(timer); step = 2; transport.send(tagged(T.CONFIRM_N, confirm)); resolve(session); return;
        }
        throw lanError('bad_frame', 'unexpected handshake message');
      } catch (e) {
        clearTimeout(timer);
        if (e?.code === 'wrong_code') onWrong('wrong_code');
        try { transport.close(); } catch { /* gone */ }
        reject(e);
      }
    };
  });
}

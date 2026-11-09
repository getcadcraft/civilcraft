/* SPDX-License-Identifier: Apache-2.0 */
/**
 * mqtt.js — MQTT 3.1.1 subscriber codec, READ ONLY (0.8 XE.9). From OASIS "MQTT Version 3.1.1" (2014). A subscriber never publishes: there is no PUBLISH
 * encoder here, only what a reader needs (CONNECT, SUBSCRIBE, UNSUBSCRIBE, PUBACK, PINGREQ, DISCONNECT out; CONNACK, SUBACK, PUBLISH, PINGRESP in).
 * QoS 2 is not offered: a subscription asks for 0 or 1.
 */
import { u8, concat, utf8, unutf8, ProtocolError } from './bytes.js';
export const TYPES = { CONNECT: 1, CONNACK: 2, PUBLISH: 3, PUBACK: 4, SUBSCRIBE: 8, SUBACK: 9, UNSUBSCRIBE: 10, UNSUBACK: 11, PINGREQ: 12, PINGRESP: 13, DISCONNECT: 14 };
export const CONNACK_TEXT = { 0: 'accepted', 1: 'unacceptable protocol version', 2: 'identifier rejected', 3: 'server unavailable', 4: 'bad user name or password', 5: 'not authorized' };
export const LIMITS = { packet: 1 << 20, topic: 1024, filters: 100 };

export function encodeLength(n) { const o = []; do { let d = n % 128; n = Math.floor(n / 128); if (n > 0) d |= 128; o.push(d); } while (n > 0); return Uint8Array.from(o); }
const str = (s) => { const b = utf8(s); if (b.length > 65535) throw new ProtocolError('long', 'A text field is too long.'); return concat(Uint8Array.of(b.length >> 8, b.length & 255), b); };
const pkt = (first, body) => { if (body.length > 268435455) throw new ProtocolError('long', 'Too large.'); return concat(Uint8Array.of(first), encodeLength(body.length), body); };
const noNul = (s, what) => { if (typeof s !== 'string' || /\u0000/.test(s)) throw new ProtocolError('text', what + ' is not valid text.'); return s; };

export function connect({ clientId = '', keepAlive = 60, cleanSession = true, user = null, password = null } = {}) {
  noNul(clientId, 'The client id'); if (!Number.isInteger(keepAlive) || keepAlive < 0 || keepAlive > 65535) throw new ProtocolError('keepalive', 'Keep-alive is 0 to 65535 seconds.');
  if (!clientId && !cleanSession) throw new ProtocolError('clientid', 'An empty client id needs a clean session.');
  if (password != null && user == null) throw new ProtocolError('auth', 'A password needs a user name.');
  const flags = (cleanSession ? 2 : 0) | (user != null ? 0x80 : 0) | (password != null ? 0x40 : 0);
  return pkt(0x10, concat(str('MQTT'), Uint8Array.of(4, flags, keepAlive >> 8, keepAlive & 255), str(clientId), user != null ? str(noNul(user, 'The user name')) : new Uint8Array(0), password != null ? str(noNul(password, 'The password')) : new Uint8Array(0)));
}
/** A topic filter: levels separated by "/", "+" a whole level, "#" only last and whole. Topics starting with $ are server topics and read-only anyway. */
export function validFilter(f) {
  if (typeof f !== 'string' || !f.length || f.length > LIMITS.topic || /\u0000/.test(f)) return false;
  const lv = f.split('/'); return lv.every((l, i) => (l === '#' ? i === lv.length - 1 : l === '+' || !/[+#]/.test(l)));
}
export function subscribe(packetId, filters) {
  if (!Number.isInteger(packetId) || packetId < 1 || packetId > 65535) throw new ProtocolError('id', 'Packet id is 1 to 65535.');
  if (!Array.isArray(filters) || !filters.length || filters.length > LIMITS.filters) throw new ProtocolError('filters', `Give 1 to ${LIMITS.filters} topic filters.`);
  const parts = [Uint8Array.of(packetId >> 8, packetId & 255)];
  for (const f of filters) { const filter = typeof f === 'string' ? f : f.filter, qos = typeof f === 'string' ? 0 : f.qos ?? 0; if (!validFilter(filter)) throw new ProtocolError('filter', `"${String(filter).slice(0, 40)}" is not a valid topic filter.`); if (qos !== 0 && qos !== 1) throw new ProtocolError('qos', 'Only QoS 0 and 1 are offered.'); parts.push(str(filter), Uint8Array.of(qos)); }
  return pkt(0x82, concat(...parts));
}
export function unsubscribe(packetId, filters) { if (!filters.every(validFilter)) throw new ProtocolError('filter', 'A topic filter is not valid.'); return pkt(0xa2, concat(Uint8Array.of(packetId >> 8, packetId & 255), ...filters.map(str))); }
export const puback = (packetId) => Uint8Array.of(0x40, 2, packetId >> 8, packetId & 255);
export const pingreq = () => Uint8Array.of(0xc0, 0);
export const disconnect = () => Uint8Array.of(0xe0, 0);

/** Decode one packet's body (first byte + body). Returns a plain object or throws ProtocolError. */
export function decode(first, body) {
  const type = first >> 4, flags = first & 15;
  switch (type) {
    case TYPES.CONNACK: if (body.length !== 2) throw new ProtocolError('connack', 'Bad CONNACK.'); return { type: 'connack', sessionPresent: !!(body[0] & 1), code: body[1], text: CONNACK_TEXT[body[1]] || 'refused (' + body[1] + ')', ok: body[1] === 0 };
    case TYPES.SUBACK: { if (body.length < 3) throw new ProtocolError('suback', 'Bad SUBACK.'); const codes = Array.from(body.slice(2)); if (codes.some((c) => c !== 0 && c !== 1 && c !== 2 && c !== 0x80)) throw new ProtocolError('suback', 'Bad SUBACK code.'); return { type: 'suback', packetId: (body[0] << 8) | body[1], codes, refused: codes.map((c, i) => (c === 0x80 ? i : -1)).filter((i) => i >= 0) }; }
    case TYPES.UNSUBACK: return { type: 'unsuback', packetId: (body[0] << 8) | body[1] };
    case TYPES.PINGRESP: return { type: 'pingresp' };
    case TYPES.PUBACK: return { type: 'puback', packetId: (body[0] << 8) | body[1] };
    case TYPES.PUBLISH: {
      const qos = (flags >> 1) & 3, retain = !!(flags & 1); if (qos === 3) throw new ProtocolError('qos', 'QoS 3 does not exist.');
      if (body.length < 2) throw new ProtocolError('publish', 'Bad PUBLISH.'); const tl = (body[0] << 8) | body[1]; if (2 + tl > body.length || tl > LIMITS.topic) throw new ProtocolError('publish', 'Bad topic length.');
      let o = 2 + tl; const topic = unutf8(body.slice(2, o)); if (/[\u0000+#]/.test(topic)) throw new ProtocolError('topic', 'A published topic cannot hold a wildcard.');
      let packetId = null; if (qos > 0) { if (o + 2 > body.length) throw new ProtocolError('publish', 'Missing packet id.'); packetId = (body[o] << 8) | body[o + 1]; o += 2; }
      return { type: 'publish', topic, qos, retain, dup: !!(flags & 8), packetId, payload: body.slice(o) };
    }
    default: throw new ProtocolError('type', 'Unexpected packet type ' + type + ' for a subscriber.');
  }
}
/** Splits a TCP stream into packets and decodes them. */
export class PacketReader {
  constructor(max = LIMITS.packet) { this.buf = new Uint8Array(0); this.max = max; }
  push(chunk) {
    this.buf = concat(this.buf, u8(chunk)); const out = [];
    for (;;) {
      if (this.buf.length < 2) break;
      let mult = 1, len = 0, i = 1, done = false;
      for (; i < 5 && i < this.buf.length; i++) { const d = this.buf[i]; len += (d & 127) * mult; mult *= 128; if (!(d & 128)) { done = true; i++; break; } }
      if (!done) { if (i >= 5) { this.buf = new Uint8Array(0); throw new ProtocolError('length', 'Bad remaining length.'); } break; }
      if (len > this.max) { this.buf = new Uint8Array(0); throw new ProtocolError('big', 'A packet is larger than ' + this.max + ' bytes and was refused.'); }
      if (this.buf.length < i + len) break;
      const first = this.buf[0], body = this.buf.slice(i, i + len); this.buf = this.buf.slice(i + len); out.push(decode(first, body));
    }
    return out;
  }
}
/** Does a topic match a filter (MQTT 3.1.1 § 4.7)? "$" topics do not match a leading wildcard. */
export function topicMatches(filter, topic) {
  const f = filter.split('/'), t = topic.split('/'); if (t[0].startsWith('$') && (f[0] === '#' || f[0] === '+')) return false;
  for (let i = 0; i < f.length; i++) { if (f[i] === '#') return true; if (i >= t.length) return false; if (f[i] !== '+' && f[i] !== t[i]) return false; }
  return f.length === t.length;
}
/**
 * Payload → a value. mode 'number' (text "21.5"), 'json' with a path ("sensors.0.temp"), 'bool' (true/false/on/off/1/0), 'text'. Anything else is null, never a guess.
 */
export function readPayload(payload, { mode = 'number', path = '' } = {}) {
  const t = unutf8(payload).trim(); if (t.length > 65536) return null;
  if (mode === 'text') return t.slice(0, 2000);
  if (mode === 'bool') { const l = t.toLowerCase(); return ['true', 'on', '1'].includes(l) ? true : ['false', 'off', '0'].includes(l) ? false : null; }
  if (mode === 'json') { let o; try { o = JSON.parse(t); } catch { return null; } for (const k of String(path).split('.').filter(Boolean)) { if (o == null || typeof o !== 'object' || !Object.prototype.hasOwnProperty.call(o, k)) return null; o = o[k]; } return typeof o === 'number' && Number.isFinite(o) ? o : typeof o === 'boolean' || typeof o === 'string' ? o : null; }
  return /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(t) ? Number(t) : null;
}

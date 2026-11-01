/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bacnet.js — BACnet/IP (Annex J) reader codec, READ ONLY (0.8 XE.9). From ANSI/ASHRAE 135 clauses 6, 20 and 21 and Annex J as published in the
 * standard's structure; no BACnet stack was read. Supported: Who-Is, I-Am, ReadProperty request and ack, Error / Reject / Abort. There is no WriteProperty,
 * no ReinitializeDevice, no DeviceCommunicationControl encoder. Segmented answers and ReadPropertyMultiple are not decoded (named as `unsupported`).
 *
 *   whoIs({ low, high }) → bytes (broadcast)     parseIAm(bytes) → { device, maxApdu, segmentation, vendor }
 *   readProperty({ invoke, object: {type, instance}, property, index }) → bytes     parseReadAck(bytes) → { invoke, object, property, index, values[] } | { error | reject | abort }
 *   objectName / OBJECT_TYPES / PROPERTIES — only the names this reader needs
 */
import { u8, view, concat, unutf8, cleanText, ProtocolError } from './bytes.js';
export const OBJECT_TYPES = { 'analog-input': 0, 'analog-output': 1, 'analog-value': 2, 'binary-input': 3, 'binary-output': 4, 'binary-value': 5, device: 8, 'multi-state-input': 13, 'multi-state-output': 14, 'multi-state-value': 19 };
export const PROPERTIES = { 'object-name': 77, 'present-value': 85, 'status-flags': 111, units: 117, description: 28 };
const typeName = Object.fromEntries(Object.entries(OBJECT_TYPES).map(([k, v]) => [v, k]));
export const objectName = (o) => (typeName[o.type] || 'type-' + o.type) + ',' + o.instance;
export const ERROR_CLASS = { 0: 'device', 1: 'object', 2: 'property', 3: 'resources', 4: 'security', 5: 'services', 6: 'vt', 7: 'communication' };

const BVLC = 0x81;
const bvlc = (fn, npdu) => { const b = new Uint8Array(4 + npdu.length); b[0] = BVLC; b[1] = fn; view(b).setUint16(2, b.length); b.set(npdu, 4); return b; };
const oid = (o) => { const t = typeof o.type === 'string' ? OBJECT_TYPES[o.type] : o.type; if (!Number.isInteger(t) || t < 0 || t > 1023) throw new ProtocolError('object', 'Unknown object type.'); if (!Number.isInteger(o.instance) || o.instance < 0 || o.instance > 0x3fffff) throw new ProtocolError('object', 'Object instance is 0 to 4194303.'); return ((t << 22) | o.instance) >>> 0; };
const be = (n, len) => { const o = new Uint8Array(len); for (let i = len - 1; i >= 0; i--) { o[i] = n & 255; n = Math.floor(n / 256); } return o; };
const minLen = (n) => (n < 256 ? 1 : n < 65536 ? 2 : n < 1 << 24 ? 3 : 4);
const ctx = (tag, bytes) => concat(Uint8Array.of((tag << 4) | 8 | bytes.length), bytes);

export function whoIs({ low, high } = {}) {
  const apdu = [0x10, 0x08];
  let ext = new Uint8Array(0);
  if (low != null || high != null) {
    if (!Number.isInteger(low) || !Number.isInteger(high) || low < 0 || high > 0x3fffff || low > high) throw new ProtocolError('range', 'Give a low and a high device number, low first.');
    ext = concat(ctx(0, be(low, minLen(low))), ctx(1, be(high, minLen(high))));
  }
  // NPDU: version 1, control 0x20 (destination present), DNET 0xFFFF (global broadcast), DLEN 0, hop count 255
  return bvlc(0x0b, concat(Uint8Array.of(1, 0x20, 0xff, 0xff, 0, 0xff), Uint8Array.from(apdu), ext));
}
export function readProperty({ invoke = 1, object, property, index = null }) {
  const p = typeof property === 'string' ? PROPERTIES[property] : property; if (!Number.isInteger(p) || p < 0 || p > 4194303) throw new ProtocolError('property', 'Unknown property.');
  if (!Number.isInteger(invoke) || invoke < 0 || invoke > 255) throw new ProtocolError('invoke', 'Invoke id is 0 to 255.');
  const parts = [Uint8Array.of(0x00, 0x05, invoke, 12), ctx(0, be(oid(object), 4)), ctx(1, be(p, minLen(p)))];
  if (index != null) { if (!Number.isInteger(index) || index < 0 || index > 0xffffffff) throw new ProtocolError('index', 'Bad array index.'); parts.push(ctx(2, be(index, minLen(index)))); }
  return bvlc(0x0a, concat(Uint8Array.of(1, 0x04), ...parts));
}

/** Strip BVLC and NPDU. Returns the APDU bytes. Network-layer messages and routed replies carry no APDU for us. */
export function apduOf(bytes) {
  const b = u8(bytes); if (b.length < 7) throw new ProtocolError('short', 'The packet is too short.');
  if (b[0] !== BVLC) throw new ProtocolError('bvlc', 'Not BACnet/IP (first byte is not 0x81).');
  if (view(b).getUint16(2) !== b.length) throw new ProtocolError('length', 'The BVLC length does not match the packet.');
  let o = 4; if (b[1] === 0x04) o += 6; else if (b[1] !== 0x0a && b[1] !== 0x0b) throw new ProtocolError('bvlc', 'BVLC function 0x' + b[1].toString(16) + ' carries no message for a reader.');
  if (b[o] !== 1) throw new ProtocolError('npdu', 'Unknown NPDU version.');
  const c = b[o + 1]; o += 2; if (c & 0x80) throw new ProtocolError('network', 'A network-layer message, not an application one.');
  if (c & 0x20) { const dl = b[o + 2]; o += 3 + dl; } if (c & 0x08) { const sl = b[o + 2]; o += 3 + sl; }
  if (c & 0x20) o += 1; // hop count
  if (o >= b.length) throw new ProtocolError('short', 'No application data.');
  return b.slice(o);
}

/** One tag header at o: { cls: 'app'|'ctx', tag, len, open, close, next }. Extended lengths are read; lengths are bounds-checked. */
function tagAt(b, o) {
  if (o >= b.length) throw new ProtocolError('short', 'The data ends too soon.');
  const t = b[o++]; let tag = t >> 4; const cls = t & 8 ? 'ctx' : 'app'; let len = t & 7;
  if (tag === 15) { if (o >= b.length) throw new ProtocolError('short', 'The data ends too soon.'); tag = b[o++]; }
  if (cls === 'ctx' && len === 6) return { cls, tag, open: true, len: 0, next: o };
  if (cls === 'ctx' && len === 7) return { cls, tag, close: true, len: 0, next: o };
  if (len === 5) { if (o >= b.length) throw new ProtocolError('short', 'The data ends too soon.'); len = b[o++]; if (len === 254) { len = (b[o] << 8) | b[o + 1]; o += 2; } else if (len === 255) throw new ProtocolError('long', 'A value over 64 KB is refused.'); }
  return { cls, tag, len, next: o };
}
const uint = (b, o, n) => { let v = 0; for (let i = 0; i < n; i++) v = v * 256 + b[o + i]; return v; };
/** Decode application-tagged values from o until the closing tag 3 (or the end). Returns { values, end }. */
function values(b, o, until3) {
  const out = [];
  while (o < b.length) {
    const t = tagAt(b, o);
    if (t.close && until3 && t.tag === 3) return { values: out, end: t.next };
    if (t.cls !== 'app') { if (t.open || t.close) throw new ProtocolError('unsupported', 'Structured values are not decoded.'); throw new ProtocolError('tag', 'Unexpected context tag in a value.'); }
    const s = t.next, e = s + t.len; if (t.tag !== 1 && e > b.length) throw new ProtocolError('short', 'A value runs past the end of the packet.');
    switch (t.tag) {
      case 0: out.push({ type: 'null', value: null }); break;
      case 1: out.push({ type: 'boolean', value: t.len === 1 }); o = s; continue;
      case 2: if (t.len > 6) throw new ProtocolError('long', 'Unsigned too long.'); out.push({ type: 'unsigned', value: uint(b, s, t.len) }); break;
      case 3: { if (t.len > 6 || t.len < 1) throw new ProtocolError('long', 'Bad signed length.'); let v = uint(b, s, t.len); if (b[s] & 0x80) v -= 2 ** (8 * t.len); out.push({ type: 'signed', value: v }); break; }
      case 4: if (t.len !== 4) throw new ProtocolError('real', 'A Real is 4 bytes.'); out.push({ type: 'real', value: view(b).getFloat32(s) }); break;
      case 5: if (t.len !== 8) throw new ProtocolError('double', 'A Double is 8 bytes.'); out.push({ type: 'double', value: view(b).getFloat64(s) }); break;
      case 7: { if (t.len < 1) throw new ProtocolError('string', 'Empty string value.'); const enc = b[s]; out.push({ type: 'string', value: enc === 0 ? cleanText(unutf8(b.slice(s + 1, e)), 500) : enc === 5 ? cleanText(String.fromCharCode(...Array.from({ length: (t.len - 1) >> 1 }, (_, i) => (b[s + 1 + 2 * i] << 8) | b[s + 2 + 2 * i])), 500) : cleanText(String.fromCharCode(...b.slice(s + 1, e)), 500), encoding: enc }); break; }
      case 9: if (t.len > 4) throw new ProtocolError('long', 'Enumerated too long.'); out.push({ type: 'enumerated', value: uint(b, s, t.len) }); break;
      case 12: { if (t.len !== 4) throw new ProtocolError('object', 'An object id is 4 bytes.'); const v = uint(b, s, 4); out.push({ type: 'object', value: { type: v >>> 22, instance: v & 0x3fffff } }); break; }
      default: out.push({ type: 'tag' + t.tag, value: null, raw: b.length - s >= t.len ? Array.from(b.slice(s, Math.min(e, s + 16))) : [] });
    }
    o = e;
  }
  if (until3) throw new ProtocolError('short', 'The value list is not closed.');
  return { values: out, end: o };
}
export function parseIAm(bytes) {
  const a = apduOf(bytes); if (a[0] >> 4 !== 1 || a[1] !== 0) throw new ProtocolError('not-iam', 'Not an I-Am.');
  const { values: v } = values(a, 2, false); if (v.length < 4 || v[0].type !== 'object' || v[0].value.type !== 8) throw new ProtocolError('iam', 'Bad I-Am.');
  return { device: v[0].value.instance, maxApdu: v[1].value, segmentation: v[2].value, vendor: v[3].value };
}
/** The answer to a ReadProperty. Never throws for a device's refusal: that is returned as { error } / { reject } / { abort }. */
export function parseReadAck(bytes) {
  const a = apduOf(bytes), type = a[0] >> 4;
  if (type === 5) { const v = values(a, 3, false).values; return { invoke: a[1], error: { class: v[0]?.value, classText: ERROR_CLASS[v[0]?.value] || 'unknown', code: v[1]?.value } }; }
  if (type === 6) return { invoke: a[1], reject: a[2] };
  if (type === 7) return { invoke: a[1], abort: a[2] };
  if (type === 2) throw new ProtocolError('unsupported', 'A SimpleACK is not a ReadProperty answer.');
  if (type !== 3) throw new ProtocolError('apdu', 'Not a ReadProperty answer.');
  if (a[0] & 0x08) throw new ProtocolError('unsupported', 'Segmented answers are not read. Ask for one property at a time.');
  if (a[2] !== 12) throw new ProtocolError('service', 'The answer is for another service.');
  let o = 3, t = tagAt(a, o); if (!(t.cls === 'ctx' && t.tag === 0 && t.len === 4)) throw new ProtocolError('ack', 'Bad object id.');
  const ov = uint(a, t.next, 4); o = t.next + 4;
  t = tagAt(a, o); if (!(t.cls === 'ctx' && t.tag === 1 && t.len >= 1 && t.len <= 4)) throw new ProtocolError('ack', 'Bad property id.'); const property = uint(a, t.next, t.len); o = t.next + t.len;
  let index = null; t = tagAt(a, o); if (t.cls === 'ctx' && t.tag === 2) { index = uint(a, t.next, t.len); o = t.next + t.len; t = tagAt(a, o); }
  if (!(t.open && t.tag === 3)) throw new ProtocolError('ack', 'No value in the answer.');
  return { invoke: a[1], object: { type: ov >>> 22, instance: ov & 0x3fffff }, property, index, values: values(a, t.next, true).values };
}

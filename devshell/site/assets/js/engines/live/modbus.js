/* SPDX-License-Identifier: Apache-2.0 */
/**
 * modbus.js — Modbus TCP, READ ONLY (0.8 XE.9). From the "MODBUS Application Protocol Specification V1.1b3" and "MODBUS Messaging on TCP/IP
 * Implementation Guide V1.0b". Only the four read function codes exist here; there is no encoder for any write function.
 *
 *   readRequest({ tid, unit, fc, address, quantity }) → bytes        fc 1 coils, 2 discrete inputs, 3 holding registers, 4 input registers
 *   parseResponse(bytes, { fc, quantity }) → { tid, unit, fc, bits? | words? } or { exception, code, text }   (one ADU; use FrameReader for a stream)
 *   parseAddress("40001" | "hr:100" | "ir:5" | "co:0" | "di:7") → { fc, address }      Modicon numbers are 1-based, the wire is 0-based
 *   decodeWords(words, { type, wordOrder, byteOrder, scale, offset }) → number
 */
import { u8, view, concat, ProtocolError } from './bytes.js';
export const FUNCTIONS = { 1: 'coils', 2: 'discrete inputs', 3: 'holding registers', 4: 'input registers' };
export const LIMITS = { registers: 125, bits: 2000 };
export const EXCEPTIONS = { 1: 'illegal function', 2: 'illegal data address', 3: 'illegal data value', 4: 'server device failure', 5: 'acknowledge', 6: 'server device busy', 8: 'memory parity error', 10: 'gateway path unavailable', 11: 'gateway target failed to respond' };

export function readRequest({ tid = 1, unit = 1, fc, address, quantity }) {
  if (!FUNCTIONS[fc]) throw new ProtocolError('function', 'Only the read functions 1 to 4 exist here. There is no write.');
  const max = fc <= 2 ? LIMITS.bits : LIMITS.registers;
  if (!Number.isInteger(address) || address < 0 || address > 0xffff) throw new ProtocolError('address', 'The address must be 0 to 65535.');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > max) throw new ProtocolError('quantity', `Read 1 to ${max} at a time.`);
  if (address + quantity > 0x10000) throw new ProtocolError('range', 'The range runs past address 65535.');
  if (!Number.isInteger(unit) || unit < 0 || unit > 255) throw new ProtocolError('unit', 'The unit id must be 0 to 255.');
  const b = new Uint8Array(12), v = view(b);
  v.setUint16(0, tid & 0xffff); v.setUint16(2, 0); v.setUint16(4, 6); b[6] = unit; b[7] = fc; v.setUint16(8, address); v.setUint16(10, quantity);
  return b;
}
/** Modicon notation. 4xxxx = holding, 3xxxx = input, 1xxxx = discrete input, 0xxxx = coil (5 digits; 6 digits for 0..65535 ranges: 4xxxxx). */
export function parseAddress(text) {
  const t = String(text).trim().toLowerCase();
  let m = /^(hr|ir|co|di)[:\s]*(\d{1,5})$/.exec(t);
  if (m) { const fc = { co: 1, di: 2, hr: 3, ir: 4 }[m[1]], a = +m[2]; if (a > 65535) throw new ProtocolError('address', 'The address must be 0 to 65535.'); return { fc, address: a }; }
  m = /^([0134])(\d{4,5})$/.exec(t);
  if (!m) throw new ProtocolError('address', `"${String(text).slice(0, 20)}" is not a Modbus address. Use 40001 or hr:100.`);
  const n = +m[2]; if (n < 1 || n > 65536) throw new ProtocolError('address', 'Modicon addresses start at 1.');
  return { fc: { 0: 1, 1: 2, 3: 4, 4: 3 }[m[1]], address: n - 1 };
}
/** Parse exactly one ADU. Never trusts a length: every read is bounds-checked. */
export function parseResponse(bytes, { fc: wantFc, quantity } = {}) {
  const b = u8(bytes); if (b.length < 9) throw new ProtocolError('short', 'The answer is too short.');
  const v = view(b), tid = v.getUint16(0), pid = v.getUint16(2), len = v.getUint16(4), unit = b[6], fc = b[7];
  if (pid !== 0) throw new ProtocolError('protocol', 'Not a Modbus answer (protocol id is not 0).');
  if (len < 3 || len + 6 !== b.length) throw new ProtocolError('length', 'The length in the answer does not match its size.');
  if (fc & 0x80) { const code = b[8]; return { tid, unit, fc: fc & 0x7f, exception: true, code, text: EXCEPTIONS[code] || 'exception ' + code }; }
  if (wantFc && fc !== wantFc) throw new ProtocolError('function', 'The answer is for another function.');
  if (!FUNCTIONS[fc]) throw new ProtocolError('function', 'Unknown function ' + fc + '.');
  const n = b[8]; if (b.length !== 9 + n) throw new ProtocolError('length', 'The byte count does not match the answer.');
  if (fc <= 2) {
    if (quantity != null && n !== Math.ceil(quantity / 8)) throw new ProtocolError('count', 'The answer has the wrong number of bytes.');
    const q = quantity ?? n * 8, bits = []; for (let i = 0; i < q; i++) bits.push((b[9 + (i >> 3)] >> (i & 7)) & 1 ? true : false);
    return { tid, unit, fc, bits };
  }
  if (n % 2) throw new ProtocolError('count', 'Register data must be an even number of bytes.');
  if (quantity != null && n !== quantity * 2) throw new ProtocolError('count', 'The answer has the wrong number of registers.');
  const words = []; for (let i = 0; i < n; i += 2) words.push((b[9 + i] << 8) | b[10 + i]);
  return { tid, unit, fc, words };
}
/** Splits a TCP byte stream into whole ADUs. */
export class FrameReader {
  constructor(max = 260) { this.buf = new Uint8Array(0); this.max = max; }
  push(chunk) {
    this.buf = concat(this.buf, u8(chunk)); const out = [];
    while (this.buf.length >= 6) {
      const len = view(this.buf).getUint16(4);
      if (len < 2 || len > this.max - 6) { this.buf = new Uint8Array(0); throw new ProtocolError('length', 'The stream is not Modbus TCP (bad length).'); }
      if (this.buf.length < 6 + len) break;
      out.push(this.buf.slice(0, 6 + len)); this.buf = this.buf.slice(6 + len);
    }
    return out;
  }
}
export const TYPES = { u16: 1, s16: 1, u32: 2, s32: 2, f32: 2, bool: 1 };
/**
 * Registers → a number. wordOrder 'big' (AB CD: high word first) or 'little' (CD AB); byteOrder 'big' or 'little' swaps the bytes inside each word.
 * Vendors disagree, so the order is the person's choice per tag, never guessed.
 */
export function decodeWords(words, { type = 'u16', wordOrder = 'big', byteOrder = 'big', scale = 1, offset = 0 } = {}) {
  const n = TYPES[type]; if (!n) throw new ProtocolError('type', 'Unknown type "' + String(type).slice(0, 20) + '".');
  if (!Array.isArray(words) || words.length < n) throw new ProtocolError('count', 'Not enough registers for ' + type + '.');
  let w = words.slice(0, n).map((x) => x & 0xffff); if (byteOrder === 'little') w = w.map((x) => ((x & 0xff) << 8) | (x >> 8));
  if (wordOrder === 'little') w.reverse();
  const d = new DataView(new ArrayBuffer(4)); w.forEach((x, i) => d.setUint16(i * 2, x));
  let val;
  switch (type) { case 'u16': val = d.getUint16(0); break; case 's16': val = d.getInt16(0); break; case 'u32': val = d.getUint32(0); break; case 's32': val = d.getInt32(0); break; case 'f32': val = d.getFloat32(0); break; default: val = d.getUint16(0) ? 1 : 0; }
  if (type !== 'bool' && !Number.isFinite(val)) return NaN;
  return type === 'bool' ? val : val * scale + offset;
}

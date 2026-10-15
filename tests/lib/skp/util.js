/* SPDX-License-Identifier: Apache-2.0 */
/**
 * util.js — shared helpers for cc-skp (docs/SKP-LIB-SPEC.md). DOM-free, no dependencies.
 * Format knowledge in this library comes from OpenSKP (MIT, see NOTICE); the code is ours.
 *
 *   SkpError(code, message)   codes: not_skp | too_new | unsupported | damaged | too_big
 *   Reader(bytes, pos)        bounds-checked little-endian reader over a Uint8Array
 *   LIMITS                    caps for untrusted input
 * Messages a person reads come from messages.js (msg, keys ccskp.*).
 */
import { msg } from './messages.js';

export class SkpError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'SkpError';
    this.code = code;
  }
}

export const LIMITS = {
  fileBytes: 1024 * 1024 * 1024,
  entryBytes: 512 * 1024 * 1024,
  inflatedBytes: 2 * 1024 * 1024 * 1024,
  vertices: 5_000_000,
  depth: 64,
};

const damaged = (key) => new SkpError('damaged', msg('ccskp.damaged', { reason: msg(key) }));

export class Reader {
  constructor(bytes, pos = 0, end = bytes.length) {
    if (!(bytes instanceof Uint8Array)) throw new TypeError('Reader needs a Uint8Array');   // i18n-ignore: diagnostic (a caller's bug)
    this.b = bytes;
    this.dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    this.pos = pos;
    this.end = Math.min(end, bytes.length);
  }
  left() { return this.end - this.pos; }
  need(n, what = 'ccskp.damaged.past_end') {
    if (!(n >= 0) || this.pos + n > this.end) throw damaged(what);
  }
  skip(n) { this.need(n); this.pos += n; }
  u8() { this.need(1); return this.b[this.pos++]; }
  u16() { this.need(2); const v = this.dv.getUint16(this.pos, true); this.pos += 2; return v; }
  u32() { this.need(4); const v = this.dv.getUint32(this.pos, true); this.pos += 4; return v; }
  i32() { this.need(4); const v = this.dv.getInt32(this.pos, true); this.pos += 4; return v; }
  f32() { this.need(4); const v = this.dv.getFloat32(this.pos, true); this.pos += 4; return v; }
  f64() { this.need(8); const v = this.dv.getFloat64(this.pos, true); this.pos += 8; return v; }
  bytes(n) { this.need(n); const v = this.b.subarray(this.pos, this.pos + n); this.pos += n; return v; }
  /** UTF-16LE text of n code units. */
  utf16(n) {
    this.need(n * 2);
    let s = '';
    for (let i = 0; i < n; i++) s += String.fromCharCode(this.dv.getUint16(this.pos + i * 2, true));
    this.pos += n * 2;
    return s;
  }
  ascii(n) { const v = this.bytes(n); let s = ''; for (const c of v) s += String.fromCharCode(c); return s; }
}

/** Identity 4×4, column-major (ModelCraft's vec.js convention: m[12..14] = translation). */
export const ident = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/** Finite and within ±1e9 inches — anything else is a damaged file. */
export const okNum = (x) => Number.isFinite(x) && Math.abs(x) < 1e9;

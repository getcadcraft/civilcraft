/* SPDX-License-Identifier: Apache-2.0 */
/**
 * util.js — cc-exr's shared pieces: the error class, size limits, half-float conversion and a bounds-checked
 * little-endian reader / growing writer. DOM-free, imports only messages.js.
 *
 *   ExrError(code, message)   codes: not_exr | damaged | too_big | unsupported | bad_image
 *   LIMITS                    caps on untrusted input (pixels, channels, attributes, one block's size)
 *   halfToFloat(h) · floatToHalf(f)    IEEE 754 binary16 ↔ number (round to nearest even, overflow → ±Inf)
 *   new Reader(bytes) · new Writer()
 */
import { msg } from './messages.js';

export class ExrError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ExrError';
    this.code = code;
  }
}

export const damaged = (reason) => new ExrError('damaged', msg('ccexr.damaged', { reason }));

/** Caps for untrusted files. A caller may lower them (opts.limits); raising them is the caller's risk. */
export const LIMITS = {
  pixels: 1 << 28,          // width × height of one part (268 M: a 16K × 16K image)
  samples: 1 << 29,         // every channel's samples together, per part
  channels: 1024,
  attributes: 4096,
  attributeBytes: 1 << 26,  // one attribute's value (64 MB; a preview image is the largest legitimate one)
  chunkBytes: 1 << 30,      // one block of pixels, unpacked
  parts: 1024,
};

// ---------------------------------------------------------------- half floats

const F32 = new Float32Array(1);
const U32 = new Uint32Array(F32.buffer);
const HALF_TABLE = new Float32Array(65536);
for (let h = 0; h < 65536; h++) {
  const s = h & 0x8000 ? -1 : 1;
  const e = (h >> 10) & 0x1f;
  const m = h & 0x3ff;
  HALF_TABLE[h] = e === 0 ? s * m * 2 ** -24 : e === 31 ? (m ? NaN : s * Infinity) : s * (1 + m / 1024) * 2 ** (e - 15);
}

export function halfToFloat(h) { return HALF_TABLE[h & 0xffff]; }
export const HALF_TO_FLOAT = HALF_TABLE;

export function floatToHalf(f) {
  F32[0] = f;
  const x = U32[0];
  const sign = (x >>> 16) & 0x8000;
  const e = (x >>> 23) & 0xff;
  let m = x & 0x7fffff;
  if (e === 0xff) return sign | 0x7c00 | (m ? 0x200 | (m >>> 13) : 0);   // Inf, NaN (kept a NaN)
  let he = e - 127 + 15;
  if (he >= 31) return sign | 0x7c00;                                   // overflow → Inf
  if (he <= 0) {                                                        // subnormal half (or zero)
    if (he < -10) return sign;
    m |= 0x800000;
    const shift = 14 - he;
    let hm = m >>> shift;
    const rem = m & ((1 << shift) - 1);
    const half = 1 << (shift - 1);
    if (rem > half || (rem === half && (hm & 1))) hm++;
    return sign | hm;
  }
  let hm = m >>> 13;
  const rem = m & 0x1fff;
  if (rem > 0x1000 || (rem === 0x1000 && (hm & 1))) {
    hm++;
    if (hm === 0x400) { hm = 0; he++; if (he >= 31) return sign | 0x7c00; }
  }
  return sign | (he << 10) | hm;
}

// ---------------------------------------------------------------- reading and writing bytes

export class Reader {
  /** @param {Uint8Array} bytes */
  constructor(bytes, pos = 0) {
    this.b = bytes;
    this.dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    this.pos = pos;
    this.end = bytes.length;
  }
  left() { return this.end - this.pos; }
  need(n, why) { if (n < 0 || this.pos + n > this.end) throw damaged(why); }
  u8(why) { this.need(1, why); return this.b[this.pos++]; }
  i32(why) { this.need(4, why); const v = this.dv.getInt32(this.pos, true); this.pos += 4; return v; }
  u32(why) { this.need(4, why); const v = this.dv.getUint32(this.pos, true); this.pos += 4; return v; }
  f32(why) { this.need(4, why); const v = this.dv.getFloat32(this.pos, true); this.pos += 4; return v; }
  f64(why) { this.need(8, why); const v = this.dv.getFloat64(this.pos, true); this.pos += 8; return v; }
  /** uint64 as a Number; values past 2^53 come back as Infinity (an offset that large is never in a file we can hold). */
  u64(why) {
    this.need(8, why);
    const lo = this.dv.getUint32(this.pos, true);
    const hi = this.dv.getUint32(this.pos + 4, true);
    this.pos += 8;
    return hi >= 0x200000 ? Infinity : hi * 4294967296 + lo;
  }
  bytes(n, why) { this.need(n, why); const v = this.b.subarray(this.pos, this.pos + n); this.pos += n; return v; }
  /** A NUL-terminated name of at most `max` bytes (Latin-1 is enough for names; UTF-8 decoded when it is valid). */
  cstr(max, why) {
    const start = this.pos;
    const stop = Math.min(this.end, start + max + 1);
    let i = start;
    while (i < stop && this.b[i] !== 0) i++;
    if (i >= stop) throw damaged(why);
    this.pos = i + 1;
    return utf8(this.b.subarray(start, i));
  }
}

let dec = null;
export function utf8(bytes) {
  if (!dec && typeof TextDecoder === 'function') dec = new TextDecoder('utf-8', { fatal: false });
  if (dec) return dec.decode(bytes);
  let s = '';
  for (const c of bytes) s += String.fromCharCode(c);
  return s;
}

let enc = null;
export function utf8Bytes(s) {
  if (!enc) enc = new TextEncoder();
  return enc.encode(String(s));
}

/** A growing little-endian byte buffer. */
export class Writer {
  constructor(size = 1 << 16) { this.b = new Uint8Array(size); this.dv = new DataView(this.b.buffer); this.pos = 0; }
  room(n) {
    if (this.pos + n <= this.b.length) return;
    let size = this.b.length * 2;
    while (size < this.pos + n) size *= 2;
    const nb = new Uint8Array(size);
    nb.set(this.b.subarray(0, this.pos));
    this.b = nb;
    this.dv = new DataView(nb.buffer);
  }
  u8(v) { this.room(1); this.b[this.pos++] = v; }
  i32(v) { this.room(4); this.dv.setInt32(this.pos, v, true); this.pos += 4; }
  u32(v) { this.room(4); this.dv.setUint32(this.pos, v >>> 0, true); this.pos += 4; }
  f32(v) { this.room(4); this.dv.setFloat32(this.pos, v, true); this.pos += 4; }
  f64(v) { this.room(8); this.dv.setFloat64(this.pos, v, true); this.pos += 8; }
  u64(v) { this.room(8); this.dv.setUint32(this.pos, v % 4294967296, true); this.dv.setUint32(this.pos + 4, Math.floor(v / 4294967296), true); this.pos += 8; }
  bytes(a) { this.room(a.length); this.b.set(a, this.pos); this.pos += a.length; }
  cstr(s) { this.bytes(utf8Bytes(s)); this.u8(0); }
  done() { return this.b.slice(0, this.pos); }
}

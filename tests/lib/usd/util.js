/* SPDX-License-Identifier: Apache-2.0 */
/**
 * util.js — cc-usd's shared pieces: the error class, caps on untrusted files, half floats, and a bounds-checked
 * little-endian reader and a growing writer. DOM-free; imports only messages.js.
 *
 *   UsdError(code, message)   codes: not_usd | damaged | too_big | unsupported | missing | bad_scene
 *   LIMITS                    caps for untrusted input (a caller may lower them through opts.limits)
 *   halfToFloat(h) · floatToHalf(f)
 *   new ByteReader(bytes, limits) · new ByteWriter()
 */
import { msg } from './messages.js';

export class UsdError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'UsdError';
    this.code = code;
  }
}

export const damaged = (key, fills) => new UsdError('damaged', msg('ccusd.damaged', { reason: msg(key, fills) }));
export const unsupported = (key, fills) => new UsdError('unsupported', msg('ccusd.unsupported', { what: msg(key, fills) }));
export const tooBig = (key, fills) => new UsdError('too_big', msg('ccusd.too_big', { what: msg(key, fills) }));

/** Caps for untrusted files. */
export const LIMITS = {
  fileBytes: 2 ** 31,        // 2 GB: one layer
  tableCount: 1 << 26,       // tokens, strings, fields, paths, specs: 67 M entries each
  arrayCount: 1 << 28,       // elements in one array value (268 M)
  valueBytes: 1 << 30,       // one value, unpacked
  depth: 64,                 // nesting of values (dictionaries, VtValues) and of text blocks
  textBytes: 1 << 30,        // a .usda file
  specs: 1 << 24,            // prims + properties in one layer
  layers: 4096,              // layers one stage may open (references, payloads, sublayers)
  zipEntries: 100000,
};

export function limitsOf(opts) { return opts && opts.limits ? { ...LIMITS, ...opts.limits } : LIMITS; }

// ---------------------------------------------------------------- half floats

const F32 = new Float32Array(1);
const U32 = new Uint32Array(F32.buffer);
const HALF = new Float32Array(65536);
for (let h = 0; h < 65536; h++) {
  const s = h & 0x8000 ? -1 : 1, e = (h >> 10) & 0x1f, m = h & 0x3ff;
  HALF[h] = e === 0 ? s * m * 2 ** -24 : e === 31 ? (m ? NaN : s * Infinity) : s * (1 + m / 1024) * 2 ** (e - 15);
}
export function halfToFloat(h) { return HALF[h & 0xffff]; }
export function floatToHalf(f) {
  F32[0] = f;
  const x = U32[0], sign = (x >>> 16) & 0x8000, e = (x >>> 23) & 0xff;
  let m = x & 0x7fffff;
  if (e === 0xff) return sign | 0x7c00 | (m ? 0x200 | (m >>> 13) : 0);
  const he = e - 127 + 15;
  if (he >= 31) return sign | 0x7c00;
  if (he <= 0) {
    // subnormal half: the value in units of 2^-24, rounded to nearest even (exact: |f| < 2^-14 has few bits here)
    const u = Math.abs(F32[0]) * 16777216, r = Math.floor(u), rest = u - r;
    return sign | (rest > 0.5 || (rest === 0.5 && (r & 1)) ? r + 1 : r);
  }
  const r = m >>> 13, rest = m & 0x1fff;
  let out = sign | (he << 10) | r;
  if (rest > 0x1000 || (rest === 0x1000 && (r & 1))) out++;
  return out;
}

// ---------------------------------------------------------------- bytes

/** Little-endian reads with every position checked; a read past the end throws `damaged`. */
export class ByteReader {
  constructor(bytes, limits = LIMITS) {
    // a plain Uint8Array: Node's Buffer.slice() is a view, and raw arrays below need real copies
    this.b = bytes.constructor === Uint8Array ? bytes : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    bytes = this.b;
    this.dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    this.pos = 0;
    this.limits = limits;
  }
  get size() { return this.b.length; }
  seek(p) {
    if (!Number.isSafeInteger(p) || p < 0 || p > this.b.length) throw damaged('ccusd.damaged.value');
    this.pos = p;
  }
  need(n) { if (!(n >= 0) || this.pos + n > this.b.length) throw damaged('ccusd.damaged.value'); }
  u8() { this.need(1); return this.b[this.pos++]; }
  i8() { this.need(1); return this.dv.getInt8(this.pos++); }
  u16() { this.need(2); const v = this.dv.getUint16(this.pos, true); this.pos += 2; return v; }
  i16() { this.need(2); const v = this.dv.getInt16(this.pos, true); this.pos += 2; return v; }
  u32() { this.need(4); const v = this.dv.getUint32(this.pos, true); this.pos += 4; return v; }
  i32() { this.need(4); const v = this.dv.getInt32(this.pos, true); this.pos += 4; return v; }
  f32() { this.need(4); const v = this.dv.getFloat32(this.pos, true); this.pos += 4; return v; }
  f64() { this.need(8); const v = this.dv.getFloat64(this.pos, true); this.pos += 8; return v; }
  /** A 64-bit count or offset: must fit a safe integer (anything larger cannot be a real position or size). */
  u64() {
    this.need(8);
    const lo = this.dv.getUint32(this.pos, true), hi = this.dv.getUint32(this.pos + 4, true);
    this.pos += 8;
    if (hi >= 0x200000) throw damaged('ccusd.damaged.value');
    return hi * 4294967296 + lo;
  }
  i64() {
    this.need(8);
    const v = this.dv.getBigInt64(this.pos, true);
    this.pos += 8;
    if (v > BigInt(Number.MAX_SAFE_INTEGER) || v < BigInt(Number.MIN_SAFE_INTEGER)) throw damaged('ccusd.damaged.value');
    return Number(v);
  }
  /** The raw 64-bit word as a BigInt (value representations). */
  word() { this.need(8); const v = this.dv.getBigUint64(this.pos, true); this.pos += 8; return v; }
  bytes(n) { this.need(n); const v = this.b.subarray(this.pos, this.pos + n); this.pos += n; return v; }
  count(n) {
    if (!(n >= 0) || n > this.limits.tableCount) throw tooBig('ccusd.too_big.count', { n });
    return n;
  }
}

/** A growing little-endian buffer with seek (for patching offsets) and alignment. */
export class ByteWriter {
  constructor(size = 1 << 16) { this.b = new Uint8Array(size); this.dv = new DataView(this.b.buffer); this.pos = 0; this.len = 0; }
  grow(n) {
    if (this.pos + n <= this.b.length) return;
    let cap = this.b.length * 2;
    while (cap < this.pos + n) cap *= 2;
    const nb = new Uint8Array(cap);
    nb.set(this.b.subarray(0, this.len));
    this.b = nb;
    this.dv = new DataView(nb.buffer);
  }
  done(n) { this.pos += n; if (this.pos > this.len) this.len = this.pos; }
  tell() { return this.pos; }
  seek(p) { this.pos = p; }
  align(n) { while (this.pos % n) this.u8(0); return this.pos; }
  u8(v) { this.grow(1); this.b[this.pos] = v; this.done(1); }
  i8(v) { this.grow(1); this.dv.setInt8(this.pos, v); this.done(1); }
  u16(v) { this.grow(2); this.dv.setUint16(this.pos, v, true); this.done(2); }
  i16(v) { this.grow(2); this.dv.setInt16(this.pos, v, true); this.done(2); }
  u32(v) { this.grow(4); this.dv.setUint32(this.pos, v >>> 0, true); this.done(4); }
  i32(v) { this.grow(4); this.dv.setInt32(this.pos, v, true); this.done(4); }
  f32(v) { this.grow(4); this.dv.setFloat32(this.pos, v, true); this.done(4); }
  f64(v) { this.grow(8); this.dv.setFloat64(this.pos, v, true); this.done(8); }
  u64(v) { this.grow(8); this.dv.setBigUint64(this.pos, BigInt(v), true); this.done(8); }
  i64(v) { this.grow(8); this.dv.setBigInt64(this.pos, BigInt(v), true); this.done(8); }
  word(v) { this.grow(8); this.dv.setBigUint64(this.pos, v, true); this.done(8); }
  bytes(arr) { this.grow(arr.length); this.b.set(arr, this.pos); this.done(arr.length); }
  result() { return this.b.slice(0, this.len); }
}

export const utf8 = new TextEncoder();
const UTF8D = new TextDecoder('utf-8');
export const utf8decode = (b) => UTF8D.decode(b);

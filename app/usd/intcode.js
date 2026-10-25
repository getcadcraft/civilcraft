/* SPDX-License-Identifier: Apache-2.0 */
/**
 * intcode.js — the integer coding the binary USD format uses for its index tables and integer arrays: differences to
 * the previous value, the most common difference written once, a 2-bit code per value (common / small / medium /
 * large) and the small/medium/large values after the codes; the whole then packed with lz4.js's chunk wrapper.
 * Layout learned from the reference library's integerCoding.cpp (see NOTICE); our own code. DOM-free.
 *
 *   decodeInts(packed, n, {wide, unsigned})  → Int32Array | Uint32Array (wide: BigInt64Array | BigUint64Array)
 *   encodeInts(values, {wide})               → Uint8Array (packed)
 *
 * 32-bit: small = int8, medium = int16, large = int32. 64-bit (wide): small = int16, medium = int32, large = int64.
 */
import { lz4Decompress, packChunks } from './lz4.js';
import { damaged } from './util.js';

const encodedSize = (n, wide) => (n ? (wide ? 8 : 4) + ((n * 2 + 7) >> 3) + n * (wide ? 8 : 4) : 0);

export function decodeInts(packed, n, { wide = false, unsigned = false } = {}) {
  const out = wide ? (unsigned ? new BigUint64Array(n) : new BigInt64Array(n)) : (unsigned ? new Uint32Array(n) : new Int32Array(n));
  if (!n) return out;
  // the encoded data is at most this long; it may be shorter (small values)
  const max = encodedSize(n, wide);
  const buf = new Uint8Array(max);
  const raw = buf.subarray(0, unpackInto(packed, buf));
  const dv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
  const codesAt = wide ? 8 : 4, nCodes = (n * 2 + 7) >> 3;
  let v = codesAt + nCodes;
  const need = (k) => { if (v + k > raw.length) throw damaged('ccusd.damaged.section', { name: 'integers' }); };
  if (raw.length < codesAt + nCodes) throw damaged('ccusd.damaged.section', { name: 'integers' });
  if (wide) {
    const common = dv.getBigInt64(0, true);
    let prev = 0n;
    for (let i = 0; i < n; i++) {
      const code = (raw[codesAt + (i >> 2)] >> ((i & 3) * 2)) & 3;
      let d;
      if (code === 0) d = common;
      else if (code === 1) { need(2); d = BigInt(dv.getInt16(v, true)); v += 2; }
      else if (code === 2) { need(4); d = BigInt(dv.getInt32(v, true)); v += 4; }
      else { need(8); d = dv.getBigInt64(v, true); v += 8; }
      prev = BigInt.asIntN(64, prev + d);
      out[i] = unsigned ? BigInt.asUintN(64, prev) : prev;
    }
    return out;
  }
  const common = dv.getInt32(0, true);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const code = (raw[codesAt + (i >> 2)] >> ((i & 3) * 2)) & 3;
    let d;
    if (code === 0) d = common;
    else if (code === 1) { need(1); d = dv.getInt8(v); v += 1; }
    else if (code === 2) { need(2); d = dv.getInt16(v, true); v += 2; }
    else { need(4); d = dv.getInt32(v, true); v += 4; }
    prev = (prev + d) | 0;
    out[i] = prev;
  }
  return out;
}

/** The chunk wrapper's data into `out` (its size is only known as an upper bound here) → bytes written. */
function unpackInto(src, out) {
  if (!src.length) throw damaged('ccusd.damaged.lz4');
  const n = src[0];
  if (n === 0) return lz4Decompress(src.subarray(1), out);
  let s = 1, got = 0;
  const dv = new DataView(src.buffer, src.byteOffset, src.byteLength);
  for (let c = 0; c < n; c++) {
    if (s + 4 > src.length) throw damaged('ccusd.damaged.lz4');
    const len = dv.getInt32(s, true);
    s += 4;
    if (len < 0 || s + len > src.length) throw damaged('ccusd.damaged.lz4');
    got += lz4Decompress(src.subarray(s, s + len), out.subarray(got));
    s += len;
  }
  return got;
}

export function encodeInts(values, { wide = false } = {}) {
  const n = values.length;
  if (!n) return packChunks(new Uint8Array(0));
  // most common difference (ties → the larger, as the reference does)
  const counts = new Map();
  let common = wide ? 0n : 0, best = 0;
  let prev = wide ? 0n : 0;
  const deltas = wide ? new Array(n) : new Int32Array(n);
  for (let i = 0; i < n; i++) {
    let x = values[i];
    let d;
    if (wide) { x = BigInt.asIntN(64, BigInt(x)); d = BigInt.asIntN(64, x - prev); } else { x |= 0; d = (x - prev) | 0; }
    prev = x;
    deltas[i] = d;
    const c = (counts.get(d) || 0) + 1;
    counts.set(d, c);
    if (c > best || (c === best && d > common)) { best = c; common = d; }
  }
  const out = new Uint8Array(encodedSize(n, wide));
  const dv = new DataView(out.buffer);
  const codesAt = wide ? 8 : 4;
  if (wide) dv.setBigInt64(0, common, true); else dv.setInt32(0, common, true);
  let v = codesAt + ((n * 2 + 7) >> 3);
  for (let i = 0; i < n; i++) {
    const d = deltas[i];
    let code;
    if (d === common) code = 0;
    else if (wide) {
      if (d >= -32768n && d <= 32767n) { code = 1; dv.setInt16(v, Number(d), true); v += 2; }
      else if (d >= -2147483648n && d <= 2147483647n) { code = 2; dv.setInt32(v, Number(d), true); v += 4; }
      else { code = 3; dv.setBigInt64(v, d, true); v += 8; }
    } else if (d >= -128 && d <= 127) { code = 1; dv.setInt8(v, d); v += 1; }
    else if (d >= -32768 && d <= 32767) { code = 2; dv.setInt16(v, d, true); v += 2; }
    else { code = 3; dv.setInt32(v, d, true); v += 4; }
    out[codesAt + (i >> 2)] |= code << ((i & 3) * 2);
  }
  return packChunks(out.subarray(0, v));
}

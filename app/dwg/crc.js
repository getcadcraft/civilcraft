/* SPDX-License-Identifier: Apache-2.0 */
/**
 * crc.js — the checksums of the DWG format. cc-dwg (Apache-2.0), written from the ODA "Open Design
 * Specification for .dwg files" v5.4.1 only: 2.14.1 (the 16-bit table CRC the spec calls "8-bit CRC",
 * seed 0xC0C1 for objects/sections, 0 + XOR magic for the R13-R15 file header), 2.14.2 (CRC-32, R2004+
 * file header), 4.2 (R2004 section page checksum), 5.4.1 (R2007 data page checksum), 5.11 (CRC random
 * encoding), 5.12 (the two 64-bit CRCs of R2007 and the seed updaters).
 *
 * Shared by the reader and the writer — keep the exports stable:
 *   crc8(seed, bytes, from?, to?)            → 16-bit value (the spec's crc8: a 256 × 16-bit table)
 *   CRC8_SEED                                 0xC0C1
 *   R13_HEADER_XOR = {3:0xA598, 4:0x8101, 5:0x3CC4, 6:0x8461}   (file header CRC, by locator count)
 *   crc32(bytes, seed = 0, from?, to?)        → uint32 (2.14.2)
 *   pageChecksum(seed, bytes, from?, to?)     → uint32 (4.2, R2004/R2010+ section page checksum)
 *   r2007PageChecksum(seed, bytes, from?, to?) → uint32 (5.4.1)
 *   crc64Normal(bytes, seed) / crc64Mirrored(bytes, seed) → BigInt (5.12, with the spec's byte order)
 *   updateSeed1(seed, len) / updateSeed2(seed, len)       → BigInt (5.12)
 *   CrcRandom (5.11): new CrcRandom(seedBigInt) .next64() .encode(v) .decode(v64) .padding (Uint8Array 512)
 *   R2004_MAGIC(n)                            → Uint8Array, the 4.1 pseudo-random sequence (file header mask,
 *                                               page padding)
 */

// ---------------------------------------------------------------- 2.14.1 16-bit table CRC
const T16 = (() => {
  // The spec prints the table; it is the reflected 0xA001 polynomial table (0x0000, 0xC0C1, …), generated here
  // and checked against the printed values by tools/dwg-test/test.mjs (crc section).
  const t = new Uint16Array(256);
  for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xA001 : c >>> 1; t[i] = c; }
  return t;
})();
export const CRC8_SEED = 0xC0C1;
export const R13_HEADER_XOR = { 3: 0xA598, 4: 0x8101, 5: 0x3CC4, 6: 0x8461 };
export function crc8(seed, bytes, from = 0, to = bytes.length) {
  let dx = seed & 0xFFFF;
  for (let i = from; i < to; i++) dx = (dx >>> 8) ^ T16[(bytes[i] ^ dx) & 0xFF];
  return dx;
}
export const CRC8_TABLE = T16;

// ---------------------------------------------------------------- 2.14.2 CRC-32
const T32 = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1; t[i] = c >>> 0; }
  return t;
})();
export function crc32(bytes, seed = 0, from = 0, to = bytes.length) {
  let c = ~seed >>> 0;
  for (let i = from; i < to; i++) c = (c >>> 8) ^ T32[(c ^ bytes[i]) & 0xFF];
  return ~c >>> 0;
}

// ---------------------------------------------------------------- 4.2 section page checksum (Adler-like)
export function pageChecksum(seed, bytes, from = 0, to = bytes.length) {
  let s1 = seed & 0xFFFF, s2 = (seed >>> 16) & 0xFFFF;
  let i = from;
  while (i < to) {
    const end = Math.min(to, i + 0x15B0);
    for (; i < end; i++) { s1 += bytes[i]; s2 += s1; }
    s1 %= 0xFFF1; s2 %= 0xFFF1;
  }
  return ((s2 << 16) | (s1 & 0xFFFF)) >>> 0;
}

// ---------------------------------------------------------------- 5.4.1 R2007 data page checksum
export function r2007PageChecksum(seed, bytes, from = 0, to = bytes.length) {
  let length = to - from;
  // seed = (seed + length) * 0x343fd + 0x269ec3 — 64-bit in the spec, only the low 32 bits are used
  const s = BigInt.asUintN(64, (BigInt(seed) + BigInt(length)) * 0x343FDn + 0x269EC3n);
  let s1 = Number(s & 0xFFFFn), s2 = Number((s >> 16n) & 0xFFFFn);
  let p = from;
  const one = (k) => { s1 += bytes[k]; s2 += s1; };
  const two = (k) => { one(k); one(k + 1); };
  while (length !== 0) {
    const big = Math.min(0x15B0, length);
    length -= big;
    let small = big >> 3;
    while (small-- > 0) { two(p + 6); two(p + 4); two(p + 2); two(p); p += 8; }
    const rem = big & 7;
    switch (rem) {
      case 1: one(p); break;
      case 2: two(p); break;
      case 3: two(p); one(p + 2); break;
      case 4: two(p + 2); two(p); break;
      case 5: two(p + 2); two(p); one(p + 4); break;
      case 6: two(p + 2); two(p); two(p + 4); break;
      case 7: two(p + 2); two(p); two(p + 4); one(p + 6); break;
    }
    p += rem;
    s1 %= 0xFFF1; s2 %= 0xFFF1;
  }
  return ((s2 << 16) | (s1 & 0xFFFF)) >>> 0;
}

// ---------------------------------------------------------------- 5.12 64-bit CRCs
const M64 = (1n << 64n) - 1n;
const T64N = (() => {   // normal (ECMA-182, MSB first); table printed in 5.12.1
  const P = 0x42F0E1EBA9EA3693n, t = new Array(256);
  for (let i = 0n; i < 256n; i++) { let c = i << 56n; for (let k = 0; k < 8; k++) c = c & (1n << 63n) ? ((c << 1n) ^ P) & M64 : (c << 1n) & M64; t[Number(i)] = c; }
  return t;
})();
const T64M = (() => {   // mirrored; the table printed in 5.12.2 is the reflected table of 0x95AC9329AC4BC9B5 (checked entry by entry)
  const P = 0x95AC9329AC4BC9B5n, t = new Array(256);
  for (let i = 0n; i < 256n; i++) { let c = i; for (let k = 0; k < 8; k++) c = c & 1n ? (c >> 1n) ^ P : c >> 1n; t[Number(i)] = c; }
  return t;
})();
export const CRC64_TABLES = { normal: T64N, mirrored: T64M };
// byte order within a block of n bytes (5.12 table): 8 → 4[4],4[0]; 4 → 2[2],2[0]; …
function order(n) {
  switch (n) {
    case 1: return [0];
    case 2: return [0, 1];
    case 3: return [0, 1, 2];
    case 4: return [2, 3, 0, 1];
    case 5: return [2, 3, 0, 1, 4];
    case 6: return [2, 3, 0, 1, 4, 5];
    case 7: return [2, 3, 0, 1, 4, 5, 6];
    default: return [6, 7, 4, 5, 2, 3, 0, 1];
  }
}
function crc64(bytes, seed, mirrored) {
  let c = BigInt.asUintN(64, BigInt(seed));
  const n = bytes.length;
  let p = 0;
  const step = (b) => {
    if (mirrored) c = T64M[Number((c ^ BigInt(b)) & 0xFFn)] ^ (c >> 8n);
    else c = T64N[Number((BigInt(b) ^ (c >> 56n)) & 0xFFn)] ^ ((c << 8n) & M64);
  };
  while (n - p >= 8) { for (const k of order(8)) step(bytes[p + k]); p += 8; }
  if (n - p) { for (const k of order(n - p)) step(bytes[p + k]); }
  return mirrored ? c : ~c & M64;
}
export const crc64Normal = (bytes, seed) => crc64(bytes, seed, false);
export const crc64Mirrored = (bytes, seed) => crc64(bytes, seed, true);
export function updateSeed1(seed, len) {
  let s = BigInt.asUintN(64, (BigInt(seed) + BigInt(len)) * 0x343FDn + 0x269EC3n);
  s = BigInt.asUintN(64, s | (s * (0x343FDn << 32n) + (0x269EC3n << 32n)));
  return ~s & M64;
}
export function updateSeed2(seed, len) {
  let s = BigInt.asUintN(64, (BigInt(seed) + BigInt(len)) * 0x343FDn + 0x269EC3n);
  s = BigInt.asUintN(64, s * ((1n << 32n) + 0x343FDn) + (BigInt(len) + 0x269EC3n));
  return ~s & M64;
}

// ---------------------------------------------------------------- 5.11 CRC random encoding
export class CrcRandom {
  constructor(seed) {
    seed = BigInt.asUintN(64, BigInt(seed));
    const t = new Uint32Array(0x270);
    t[0] = mul32(Number(seed & 0xFFFFFFFFn), 0x343FD) + 0x269EC3 >>> 0;
    t[1] = mul32(Number((seed >> 32n) & 0xFFFFFFFFn), 0x343FD) + 0x269EC3 >>> 0;
    let v = t[1];
    for (let i = 2; i < 0x270; i++) { v = (mul32((v >>> 30) ^ v, 0x6C078965) + i) >>> 0; t[i] = v; }
    this.table = t; this.index = 0;
    const pad = new Uint32Array(0x80);
    for (let i = 0; i < 0x80; i++) { if (this.index >= 0x270) this.index = 0; pad[i] = t[this.index]; this.index++; }
    this.padding = new Uint8Array(pad.buffer);   // little-endian bytes on every platform we run on
  }
  next64() {
    this.index += 2;
    if (this.index >= 0x270) this.index = 0;
    // GetNextUInt64 reads table[index + 1]: the index is always even (0x80 after the padding, then +2), so
    // index + 1 stays inside the table; the modulo only guards against misuse.
    const lo = this.table[this.index], hi = this.table[(this.index + 1) % 0x270];
    return (BigInt(hi) << 32n) | BigInt(lo);
  }
  encode(value) {
    const r = this.next64();
    let lo = Number(r & 0xDF7DF7DFn) >>> 0, hi = Number((r >> 32n) & 0xF7DF7DF7n) >>> 0;
    if (value & 0x200) lo |= 0x20; if (value & 0x100) lo |= 0x800; if (value & 0x80) lo |= 0x20000;
    if (value & 0x40) lo |= 0x800000; if (value & 0x20) lo |= 0x20000000;
    if (value & 0x10) hi |= 0x08; if (value & 0x8) hi |= 0x200; if (value & 0x4) hi |= 0x8000;
    if (value & 0x2) hi |= 0x200000; if (value & 0x1) hi |= 0x8000000;
    return (BigInt(hi >>> 0) << 32n) | BigInt(lo >>> 0);
  }
  static decode(v) {
    v = BigInt.asUintN(64, BigInt(v));
    const hi = Number(v >> 32n), lo = Number(v & 0xFFFFFFFFn);
    let r = 0;
    if (hi & 0x8000000) r |= 1; if (hi & 0x200000) r |= 2; if (hi & 0x8000) r |= 4; if (hi & 0x200) r |= 8; if (hi & 0x8) r |= 0x10;
    if (lo & 0x20000000) r |= 0x20; if (lo & 0x800000) r |= 0x40; if (lo & 0x20000) r |= 0x80; if (lo & 0x800) r |= 0x100; if (lo & 0x20) r |= 0x200;
    return r;
  }
}
function mul32(a, b) { return Math.imul(a >>> 0, b >>> 0) >>> 0; }

// ---------------------------------------------------------------- 4.1 magic sequence (randseed LCG)
export function R2004_MAGIC(n = 0x100) {
  const out = new Uint8Array(n);
  let s = 1;
  for (let i = 0; i < n; i++) { s = (Math.imul(s, 0x343FD) + 0x269EC3) | 0; out[i] = (s >> 16) & 0xFF; }
  return out;
}

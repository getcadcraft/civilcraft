/* SPDX-License-Identifier: Apache-2.0 */
/**
 * laz.js — our own LAZ compressor and decompressor (0.9 PC.14). DOM-free, no app imports, no third-party code.
 *
 * Written from the public specification only: "LAZ Specification 1.4", Revision R1 (2025-11-15), published by LAStools LiDAR
 * Processing - rapidlasso GmbH (https://downloads.rapidlasso.de/doc/LAZ_Specification_1.4_R1.pdf; the document permits its use as
 * a specification with the publisher named). Clause numbers below are that document's. No LASzip, laz-perf or laz-rs source was
 * read or copied; laz-perf (Apache-2.0, vendored for reading) is used only by the tests, as an independent reader.
 *
 * Point formats: 0, 1, 2, 3 (items Point10, GPSTime11, RGB12 and Byte, all version 2; compressor 2 "pointwise and chunked",
 * clause 7.1 Table 9) in a LAS 1.4 header (clause 6.3). Formats 4 and 5 (waveform) and 6 to 10 (layered, clause 14) are not
 * written: `lazItems()` refuses them with code 'laz_format'.
 *
 *   lazVlrPayload(format, recordLength, { chunkSize }) → Uint8Array      the LAZ special VLR's data (clause 7.1 Table 8, 7.2)
 *   lazItems(format, recordLength) → [{ type, size, version }]           clause 7.2 Table 14
 *   new LazChunkWriter(format, recordLength, { chunkSize })              compresses records into chunks (clause 11.3, 11.7)
 *       .add(records Uint8Array, n) → Uint8Array[]   finished chunks (raw first record + one arithmetic stream each)
 *       .finish() → Uint8Array[]                      the last chunk, if any
 *       .chunkTable() → Uint8Array                    the chunk table (clause 11.6), placed after the chunks
 *       .chunkBytes [n] · .chunkCounts [n]
 *   readLaz(bytes) → { version, format, recordLength, count, offsetToPoints, items, chunkSize, chunks, records Uint8Array }
 *       our own reader: header, the special VLR, the chunk table and every point decoded to its uncompressed LAS record.
 *
 * Errors carry `.code` (PcError): laz_format, laz_record_length, laz_not_laz, laz_bad_vlr, laz_compressor, laz_item, laz_bad_table,
 * laz_truncated, laz_class_range.
 */
import { fail } from './util.js';

const TWO32 = 4294967296;
const AC_MIN = 0x01000000;        // clause 9.4: renormalise when length < 2^24
const DEFAULT_CHUNK = 50000;

// ---------------------------------------------------------------------------------------------------------------- arithmetic coder

/** Clause 9.2-9.5: base and length, bytes out, carry into bytes already written. */
export class ArithEncoder {
  constructor(size = 1 << 16) { this.buf = new Uint8Array(size); this.n = 0; this.base = 0; this.length = 0xFFFFFFFF; }   // 9.3.2
  put(b) {
    if (this.n === this.buf.length) { const nb = new Uint8Array(this.buf.length * 2); nb.set(this.buf); this.buf = nb; }
    this.buf[this.n++] = b;
  }
  /** Clause 9.4.2 Figure 4 propagate_carry(). */
  carry() {
    let p = this.n - 1;
    while (p >= 0 && this.buf[p] === 0xFF) { this.buf[p] = 0; p--; }
    if (p >= 0) this.buf[p]++;
  }
  /** Clause 9.4.2 Figure 3 renorm_enc_interval(). */
  renorm() {
    do { this.put(this.base >>> 24); this.base = (this.base << 8) >>> 0; this.length = (this.length << 8) >>> 0; } while (this.length < AC_MIN);
  }
  addBase(x) { let b = this.base + x; if (b >= TWO32) { b -= TWO32; this.carry(); } this.base = b; }
  /** Clause 10.2.5.1 Figure 9 encodeSymbol(). */
  encodeSymbol(m, s) {
    const l = this.length >>> 15, x = m.dist[s] * l;
    this.addBase(x);
    this.length = s === m.last ? this.length - x : m.dist[s + 1] * l - x;
    if (this.length < AC_MIN) this.renorm();
    m.count[s]++;
    if (--m.until === 0) m.update();
  }
  /** Clause 10.3.5 Figure 13 encodeBit(). */
  encodeBit(m, bit) {
    const x = m.p0 * (this.length >>> 13);
    if (bit === 0) { this.length = x; m.c0++; } else { this.addBase(x); this.length -= x; }
    if (this.length < AC_MIN) this.renorm();
    if (--m.until === 0) m.update();
  }
  /** Clause 10.4.3 Figure 15 writeBits(): over 19 bits, the low 16 first. bits ≤ 32. */
  writeBits(bits, sym) {
    if (bits > 19) { this.writeBits(16, sym & 0xFFFF); this.writeBits(bits - 16, Math.floor(sym / 65536)); return; }
    this.length = this.length >>> bits;
    this.addBase(sym * this.length);
    if (this.length < AC_MIN) this.renorm();
  }
  /** Clause 9.5.2 Figure 5 finalize_encoding_stream(). Returns the stream's bytes. */
  done() {
    let another = true;
    if (this.length > 2 * AC_MIN) { this.addBase(AC_MIN); this.length = AC_MIN >>> 1; }
    else { this.addBase(AC_MIN >>> 1); this.length = AC_MIN >>> 9; another = false; }
    this.renorm();
    this.put(0); this.put(0); if (another) this.put(0);
    return this.buf.subarray(0, this.n);
  }
}

/** Clause 9.3.1, 9.4.1: value and length, bytes in. Reading past the end gives zeros (a cut file is caught by the caller's counts). */
export class ArithDecoder {
  constructor(bytes, start = 0, end = bytes.length) {
    this.b = bytes; this.p = start; this.end = end;
    this.value = ((this.byte() << 24) | (this.byte() << 16) | (this.byte() << 8) | this.byte()) >>> 0;
    this.length = 0xFFFFFFFF;
  }
  byte() { return this.p < this.end ? this.b[this.p++] : (this.p++, 0); }
  /** Clause 9.4.1 Figure 2 renorm_dec_interval(). */
  renorm() {
    do { this.value = ((this.value << 8) | this.byte()) >>> 0; this.length = (this.length << 8) >>> 0; } while (this.length < AC_MIN);
  }
  /** Clause 10.2.4.1 Figure 8 decodeSymbol(): the last s with distribution[s]·⌊length/2^15⌋ ≤ value. */
  decodeSymbol(m) {
    const l = this.length >>> 15, d = m.dist, v = this.value;
    let lo = 0, hi = m.n;                       // d[lo]*l <= v < d[hi]*l (d[n] taken as beyond)
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (d[mid] * l > v) hi = mid; else lo = mid; }
    const s = lo, x = d[s] * l;
    this.value = v - x;
    this.length = s === m.last ? this.length - x : d[s + 1] * l - x;
    if (this.length < AC_MIN) this.renorm();
    m.count[s]++;
    if (--m.until === 0) m.update();
    return s;
  }
  /** Clause 10.3.4 Figure 12 decodeBit(). */
  decodeBit(m) {
    const x = m.p0 * (this.length >>> 13);
    let bit;
    if (this.value < x) { bit = 0; this.length = x; m.c0++; } else { bit = 1; this.value -= x; this.length -= x; }
    if (this.length < AC_MIN) this.renorm();
    if (--m.until === 0) m.update();
    return bit;
  }
  /** Clause 10.4.2 Figure 14 readBits(). */
  readBits(bits) {
    if (bits > 19) { const lo = this.readBits(16); return this.readBits(bits - 16) * 65536 + lo; }
    this.length = this.length >>> bits;
    const sym = Math.floor(this.value / this.length);
    if (sym >= 2 ** bits) fail('laz_truncated');
    this.value -= sym * this.length;
    if (this.length < AC_MIN) this.renorm();
    return sym;
  }
}

/** Clause 10.2 the generic symbol encoder's distribution: counts start at 1, update_distribution() (Figure 7). */
export class SymbolModel {
  constructor(n) {
    this.n = n; this.last = n - 1;
    this.count = new Uint32Array(n).fill(1);
    this.dist = new Uint32Array(n);
    this.total = 0; this.cycle = n;              // the first update() adds the n initial counts (10.2.2)
    this.update();
    this.until = this.cycle = (n + 6) >> 1;      // 10.2.2: set after the first update
  }
  update() {
    this.total += this.cycle;                    // = the sum of the counts (every coded symbol added one)
    if (this.total > 32768) {                    // halve above 2^15
      let t = 0;
      for (let k = 0; k < this.n; k++) { const c = (this.count[k] + 1) >>> 1; this.count[k] = c; t += c; }
      this.total = t;
    }
    const scale = Math.floor(2147483648 / this.total);
    let sum = 0;
    for (let k = 0; k < this.n; k++) { this.dist[k] = (scale * sum) >>> 16; sum += this.count[k]; }
    this.cycle = (5 * this.cycle) >> 2;
    const max = (this.n + 6) << 3;
    if (this.cycle > max) this.cycle = max;
    this.until = this.cycle;
  }
}

/** Clause 10.3 the single-bit encoder's distribution (Figures 10, 11). */
export class BitModel {
  constructor() { this.c0 = 1; this.total = 2; this.p0 = 4096; this.cycle = 4; this.until = 4; }
  update() {
    this.total += this.cycle;
    if (this.total > 8192) {
      this.total = (this.total + 1) >>> 1; this.c0 = (this.c0 + 1) >>> 1;
      if (this.c0 === this.total) this.total++;
    }
    this.p0 = (Math.floor(2147483648 / this.total) * this.c0) >>> 18;
    this.cycle = (5 * this.cycle) >> 2;
    if (this.cycle > 64) this.cycle = 64;
    this.until = this.cycle;
  }
}

/**
 * Clause 10.5 the Integer Compressor: k (n+1 symbols, one model per instance), the corrector (shared by the instances: a bit model
 * for k = 0, 2^k symbols up to k = 8, 256 above) and k−8 raw lower bits. Differences per clause 10.5.4 (IDiff/ISum 8, 16, 32).
 */
export class IntegerCoder {
  constructor(bits, contexts) {
    this.bits = bits;
    this.corrBits = bits < 32 ? bits : 32;
    this.range = bits < 32 ? 2 ** bits : 0;
    this.min = bits < 32 ? -(this.range / 2) : -2147483648;
    this.max = bits < 32 ? this.range / 2 - 1 : 2147483647;
    this.mBits = Array.from({ length: contexts }, () => new SymbolModel(this.corrBits + 1));
    this.corr = [new BitModel()];
    for (let k = 1; k <= this.corrBits; k++) this.corr.push(k < 32 ? new SymbolModel(k <= 8 ? 1 << k : 256) : null);   // k = 32 never stores a corrector
    this.k = 0;
  }
  /** IDiff (10.5.4 Figures 19-21) then the encoding of 10.5.5. pred and real: int32 for 32 bits, unsigned for 8 and 16. */
  compress(enc, pred, real, ctx) {
    let c;
    if (this.bits === 32) c = (real - pred) | 0;
    else { c = real - pred; if (c < this.min) c += this.range; else if (c > this.max) c -= this.range; }
    const c1 = c <= 0 ? -c : c - 1;
    const k = c1 === 0 ? 0 : 32 - Math.clz32(c1);   // tightest [−(2^k − 1), 2^k]
    this.k = k;
    enc.encodeSymbol(this.mBits[ctx], k);
    if (k === 0) { enc.encodeBit(this.corr[0], c); return; }
    if (k === 32) return;
    c = c < 0 ? c + (2 ** k - 1) : c - 1;          // map to [0, 2^k − 1]
    if (k <= 8) enc.encodeSymbol(this.corr[k], c);
    else {
      const k1 = k - 8;
      enc.encodeSymbol(this.corr[k], Math.floor(c / 2 ** k1));
      enc.writeBits(k1, c % 2 ** k1);
    }
  }
  /** Clause 10.5.3 then ISum (10.5.4 Figures 16-18). */
  decompress(dec, pred, ctx) {
    const k = dec.decodeSymbol(this.mBits[ctx]);
    this.k = k;
    let c;
    if (k === 0) c = dec.decodeBit(this.corr[0]);
    else if (k === 32) c = -2147483648;
    else {
      if (k <= 8) c = dec.decodeSymbol(this.corr[k]);
      else { const k1 = k - 8; c = dec.decodeSymbol(this.corr[k]) * 2 ** k1; c += dec.readBits(k1); }
      c = c >= 2 ** (k - 1) ? c + 1 : c - (2 ** k - 1);
    }
    let r = pred + c;
    if (this.bits === 32) r |= 0;
    else if (r < 0) r += this.range; else if (r >= this.range) r -= this.range;
    return r;
  }
}

/** Clause 13.1 Figure 24: the streaming median of five. */
class Median5 {
  constructor() { this.v = [0, 0, 0, 0, 0]; this.high = true; }
  get() { return this.v[2]; }
  add(x) {
    const v = this.v;
    if (this.high) {
      if (x < v[2]) {
        v[4] = v[3]; v[3] = v[2];
        if (x < v[0]) { v[2] = v[1]; v[1] = v[0]; v[0] = x; } else if (x < v[1]) { v[2] = v[1]; v[1] = x; } else v[2] = x;
      } else {
        if (x < v[3]) { v[4] = v[3]; v[3] = x; } else v[4] = x;
        this.high = false;
      }
    } else if (v[2] < x) {
      v[0] = v[1]; v[1] = v[2];
      if (v[4] < x) { v[2] = v[3]; v[3] = v[4]; v[4] = x; } else if (v[3] < x) { v[2] = v[3]; v[3] = x; } else v[2] = x;
    } else {
      if (v[1] < x) { v[0] = v[1]; v[1] = x; } else v[0] = x;
      this.high = true;
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------- items (clause 13)

/** Clause 13.1 Figure 23. */
const RETURN_MAP = [
  [15, 14, 13, 12, 11, 10, 9, 8], [14, 0, 1, 3, 6, 10, 10, 9], [13, 1, 2, 4, 7, 11, 11, 10], [12, 3, 4, 5, 8, 12, 12, 11],
  [11, 6, 7, 8, 9, 13, 13, 12], [10, 10, 11, 12, 13, 14, 14, 13], [9, 10, 11, 12, 13, 14, 15, 14], [8, 9, 10, 11, 12, 13, 14, 15],
];
const RETURN_LEVEL = [
  [0, 1, 2, 3, 4, 5, 6, 7], [1, 0, 1, 2, 3, 4, 5, 6], [2, 1, 0, 1, 2, 3, 4, 5], [3, 2, 1, 0, 1, 2, 3, 4],
  [4, 3, 2, 1, 0, 1, 2, 3], [5, 4, 3, 2, 1, 0, 1, 2], [6, 5, 4, 3, 2, 1, 0, 1], [7, 6, 5, 4, 3, 2, 1, 0],
];
const lazy = (arr, i, n) => arr[i] || (arr[i] = new SymbolModel(n));
const i32 = (b, o) => b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24);
const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const put32 = (b, o, v) => { b[o] = v; b[o + 1] = v >> 8; b[o + 2] = v >> 16; b[o + 3] = v >> 24; };
const put16 = (b, o, v) => { b[o] = v; b[o + 1] = v >> 8; };

/**
 * Point10 version 2 (clause 13.1 Tables 33-35): X, Y, Z int32, intensity, the bit byte (return 0-2, returns 3-5, scan direction 6,
 * edge 7), classification, scan angle rank, user data, point source ID. Field order in the stream: changed values, bit byte,
 * intensity, classification, scan angle, user data, point source, dX, dY, dZ.
 */
class Point10 {
  constructor(first, o) {
    this.last = first.slice(o, o + 20);
    this.lastInt = new Uint16Array(16);             // "as if it had had an intensity of 0"
    this.lastH = new Int32Array(8);                 // "treated as having had a value Z of 0"
    this.medX = Array.from({ length: 16 }, () => new Median5());
    this.medY = Array.from({ length: 16 }, () => new Median5());
    this.mChanged = new SymbolModel(64);
    this.mBB = []; this.mCls = []; this.mSa = []; this.mUd = [];
    this.icInt = new IntegerCoder(16, 4); this.icPsid = new IntegerCoder(16, 1);
    this.icDx = new IntegerCoder(32, 2); this.icDy = new IntegerCoder(32, 22); this.icZ = new IntegerCoder(32, 20);
  }
  write(enc, b, o) {
    const L = this.last, bb = b[o + 14], n = (bb >> 3) & 7, r = bb & 7, m = RETURN_MAP[n][r], l = RETURN_LEVEL[n][r];
    const inten = u16(b, o + 12), psid = u16(b, o + 18);
    const changed = ((L[14] !== bb) << 5) | ((this.lastInt[m] !== inten) << 4) | ((L[15] !== b[o + 15]) << 3) |
      ((L[16] !== b[o + 16]) << 2) | ((L[17] !== b[o + 17]) << 1) | (u16(L, 18) !== psid ? 1 : 0);
    enc.encodeSymbol(this.mChanged, changed);
    if (changed & 32) enc.encodeSymbol(lazy(this.mBB, L[14], 256), bb);
    if (changed & 16) { this.icInt.compress(enc, this.lastInt[m], inten, m < 3 ? m : 3); this.lastInt[m] = inten; }
    if (changed & 8) enc.encodeSymbol(lazy(this.mCls, L[15], 256), b[o + 15]);
    if (changed & 4) enc.encodeSymbol(lazy(this.mSa, (bb >> 6) & 1, 256), (b[o + 16] - L[16]) & 255);
    if (changed & 2) enc.encodeSymbol(lazy(this.mUd, L[17], 256), b[o + 17]);
    if (changed & 1) this.icPsid.compress(enc, u16(L, 18), psid, 0);
    const one = n === 1 ? 1 : 0;
    const dx = (i32(b, o) - i32(L, 0)) | 0;
    this.icDx.compress(enc, this.medX[m].get(), dx, one); this.medX[m].add(dx);
    const kx = this.icDx.k;
    const dy = (i32(b, o + 4) - i32(L, 4)) | 0;
    this.icDy.compress(enc, this.medY[m].get(), dy, one + (kx < 20 ? kx & ~1 : 20)); this.medY[m].add(dy);
    const kxy = (kx + this.icDy.k) >> 1, z = i32(b, o + 8);
    this.icZ.compress(enc, this.lastH[l], z, one + (kxy < 18 ? kxy & ~1 : 18)); this.lastH[l] = z;
    for (let i = 0; i < 20; i++) L[i] = b[o + i];
  }
  read(dec, b, o) {
    const L = this.last;
    const changed = dec.decodeSymbol(this.mChanged);
    const bb = changed & 32 ? dec.decodeSymbol(lazy(this.mBB, L[14], 256)) : L[14];
    const n = (bb >> 3) & 7, r = bb & 7, m = RETURN_MAP[n][r], l = RETURN_LEVEL[n][r];
    if (changed & 16) this.lastInt[m] = this.icInt.decompress(dec, this.lastInt[m], m < 3 ? m : 3);
    const inten = this.lastInt[m];
    const cls = changed & 8 ? dec.decodeSymbol(lazy(this.mCls, L[15], 256)) : L[15];
    const sa = changed & 4 ? (L[16] + dec.decodeSymbol(lazy(this.mSa, (bb >> 6) & 1, 256))) & 255 : L[16];
    const ud = changed & 2 ? dec.decodeSymbol(lazy(this.mUd, L[17], 256)) : L[17];
    const psid = changed & 1 ? this.icPsid.decompress(dec, u16(L, 18), 0) : u16(L, 18);
    const one = n === 1 ? 1 : 0;
    const dx = this.icDx.decompress(dec, this.medX[m].get(), one); this.medX[m].add(dx);
    const kx = this.icDx.k;
    const dy = this.icDy.decompress(dec, this.medY[m].get(), one + (kx < 20 ? kx & ~1 : 20)); this.medY[m].add(dy);
    const kxy = (kx + this.icDy.k) >> 1;
    const z = this.icZ.decompress(dec, this.lastH[l], one + (kxy < 18 ? kxy & ~1 : 18)); this.lastH[l] = z;
    put32(L, 0, (i32(L, 0) + dx) | 0); put32(L, 4, (i32(L, 4) + dy) | 0); put32(L, 8, z);
    put16(L, 12, inten); L[14] = bb; L[15] = cls; L[16] = sa; L[17] = ud; put16(L, 18, psid);
    for (let i = 0; i < 20; i++) b[o + i] = L[i];
  }
}

/** GPS times as signed 64-bit integers (clause 13.2): hi = int32 of the top word, lo = uint32 of the low word. */
const fitsDiff = (ahi, alo, bhi, blo) => {           // a − b as an int32, or null when it does not fit
  const dh = ahi - bhi;
  if (dh < -1 || dh > 1) return null;
  const d = dh * TWO32 + (alo - blo);
  return d >= -2147483648 && d <= 2147483647 ? d : null;
};
const MULTI = 500, MULTI_MINUS = -10, UNCHANGED = 511, CODE_FULL = 512;

/** GPSTime11 version 2 (clause 13.2 Tables 36-40): four reference frames, a delta per frame, cases 0-515 and case_0delta 0-5. */
class GpsTime11 {
  constructor(first, o) {
    this.hi = new Int32Array(4); this.lo = new Uint32Array(4);
    this.lo[0] = (first[o] | (first[o + 1] << 8) | (first[o + 2] << 16) | (first[o + 3] << 24)) >>> 0;
    this.hi[0] = i32(first, o + 4);
    this.delta = new Int32Array(4); this.counter = new Int32Array(4);
    this.last = 0; this.next = 0;
    this.mMulti = new SymbolModel(516); this.m0 = new SymbolModel(6);
    this.ic = new IntegerCoder(32, 9);
  }
  extreme(f, d) { if (++this.counter[f] > 3) { this.delta[f] = d; this.counter[f] = 0; } }
  newFrame(enc, hi, lo, code) {
    enc.encodeSymbol(code.m, code.s);
    this.ic.compress(enc, this.hi[this.last], hi, 8);
    enc.writeBits(32, lo);
    this.next = (this.next + 1) & 3; this.last = this.next;
    this.delta[this.last] = 0; this.counter[this.last] = 0;
  }
  write(enc, b, o) {
    const lo = (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0, hi = i32(b, o + 4);
    for (;;) {
      const f = this.last;
      const same = hi === this.hi[f] && lo === this.lo[f];
      if (this.delta[f] === 0) {
        if (same) { enc.encodeSymbol(this.m0, 0); return; }
        const d = fitsDiff(hi, lo, this.hi[f], this.lo[f]);
        if (d !== null) {
          enc.encodeSymbol(this.m0, 1);
          this.ic.compress(enc, 0, d, 0);
          this.delta[f] = d; this.counter[f] = 0;
        } else {
          let other = 0;
          for (let i = 1; i < 4 && !other; i++) { const g = (f + i) & 3; if (fitsDiff(hi, lo, this.hi[g], this.lo[g]) !== null) other = i; }
          if (other) { enc.encodeSymbol(this.m0, other + 2); this.last = (f + other) & 3; continue; }
          this.newFrame(enc, hi, lo, { m: this.m0, s: 2 });
        }
      } else {
        if (same) { enc.encodeSymbol(this.mMulti, UNCHANGED); return; }
        const d = fitsDiff(hi, lo, this.hi[f], this.lo[f]);
        if (d !== null) {
          const last = this.delta[f], q = Math.fround(Math.fround(d) / Math.fround(last));
          const multi = q >= 0 ? Math.trunc(q + 0.5) : Math.trunc(q - 0.5);
          if (multi === 1) { enc.encodeSymbol(this.mMulti, 1); this.ic.compress(enc, last, d, 1); this.counter[f] = 0; }
          else if (multi > 0) {
            if (multi < MULTI) { enc.encodeSymbol(this.mMulti, multi); this.ic.compress(enc, Math.imul(multi, last), d, multi < 10 ? 2 : 3); }
            else { enc.encodeSymbol(this.mMulti, MULTI); this.ic.compress(enc, Math.imul(MULTI, last), d, 4); this.extreme(f, d); }
          } else if (multi < 0) {
            if (multi > MULTI_MINUS) { enc.encodeSymbol(this.mMulti, MULTI - multi); this.ic.compress(enc, Math.imul(multi, last), d, 5); }
            else { enc.encodeSymbol(this.mMulti, MULTI - MULTI_MINUS); this.ic.compress(enc, Math.imul(MULTI_MINUS, last), d, 6); this.extreme(f, d); }
          } else { enc.encodeSymbol(this.mMulti, 0); this.ic.compress(enc, 0, d, 7); this.extreme(f, d); }
        } else {
          let other = 0;
          for (let i = 1; i < 4 && !other; i++) { const g = (f + i) & 3; if (fitsDiff(hi, lo, this.hi[g], this.lo[g]) !== null) other = i; }
          if (other) { enc.encodeSymbol(this.mMulti, CODE_FULL + other); this.last = (f + other) & 3; continue; }
          this.newFrame(enc, hi, lo, { m: this.mMulti, s: CODE_FULL });
        }
      }
      this.hi[this.last] = hi; this.lo[this.last] = lo;
      return;
    }
  }
  add(f, d) {                                        // the frame's time += d (int32), 64-bit
    const s = this.lo[f] + d;
    const carry = Math.floor(s / TWO32);
    this.lo[f] = s - carry * TWO32; this.hi[f] = (this.hi[f] + carry) | 0;
  }
  readFull(dec) {
    const hi = this.ic.decompress(dec, this.hi[this.last], 8), lo = dec.readBits(32);
    this.next = (this.next + 1) & 3; this.last = this.next;
    this.hi[this.last] = hi; this.lo[this.last] = lo;
    this.delta[this.last] = 0; this.counter[this.last] = 0;
  }
  read(dec, b, o) {
    for (;;) {
      const f = this.last;
      if (this.delta[f] === 0) {
        const s = dec.decodeSymbol(this.m0);
        if (s === 1) { const d = this.ic.decompress(dec, 0, 0); this.delta[f] = d; this.add(f, d); this.counter[f] = 0; }
        else if (s === 2) this.readFull(dec);
        else if (s > 2) { this.last = (f + s - 2) & 3; continue; }
      } else {
        const s = dec.decodeSymbol(this.mMulti), last = this.delta[f];
        if (s === 1) { this.add(f, this.ic.decompress(dec, last, 1)); this.counter[f] = 0; }
        else if (s < UNCHANGED) {
          let d;
          if (s === 0) { d = this.ic.decompress(dec, 0, 7); this.extreme(f, d); }
          else if (s < MULTI) d = this.ic.decompress(dec, Math.imul(s, last), s < 10 ? 2 : 3);
          else if (s === MULTI) { d = this.ic.decompress(dec, Math.imul(MULTI, last), 4); this.extreme(f, d); }
          else {
            const mu = MULTI - s;
            if (mu > MULTI_MINUS) d = this.ic.decompress(dec, Math.imul(mu, last), 5);
            else { d = this.ic.decompress(dec, Math.imul(MULTI_MINUS, last), 6); this.extreme(f, d); }
          }
          this.add(f, d);
        } else if (s === CODE_FULL) this.readFull(dec);
        else if (s > CODE_FULL) { this.last = (f + s - CODE_FULL) & 3; continue; }
      }
      break;
    }
    const lo = this.lo[this.last], hi = this.hi[this.last];
    b[o] = lo; b[o + 1] = lo >>> 8; b[o + 2] = lo >>> 16; b[o + 3] = lo >>> 24; put32(b, o + 4, hi);
  }
}

const clamp255 = (n) => (n < 0 ? 0 : n > 255 ? 255 : n);

/**
 * RGB12 version 2 (clause 13.3 Tables 41-43): which of the six bytes changed, red's change carried to green, the mean of red's and
 * green's to blue. Stream order red low, red high, green low, blue low, green high, blue high (each low byte's chain before the
 * high bytes').
 */
class Rgb12 {
  constructor(first, o) {
    this.last = [u16(first, o), u16(first, o + 2), u16(first, o + 4)];
    this.mUsed = new SymbolModel(128);
    this.m = Array.from({ length: 6 }, () => new SymbolModel(256));
  }
  write(enc, b, o) {
    const L = this.last, R = u16(b, o), G = u16(b, o + 2), B = u16(b, o + 4);
    let sym = ((L[0] & 255) !== (R & 255) ? 1 : 0) | ((L[0] & 0xFF00) !== (R & 0xFF00) ? 2 : 0) |
      ((L[1] & 255) !== (G & 255) ? 4 : 0) | ((L[1] & 0xFF00) !== (G & 0xFF00) ? 8 : 0) |
      ((L[2] & 255) !== (B & 255) ? 16 : 0) | ((L[2] & 0xFF00) !== (B & 0xFF00) ? 32 : 0);
    if ((R & 255) !== (G & 255) || (R & 255) !== (B & 255) || (R & 0xFF00) !== (G & 0xFF00) || (R & 0xFF00) !== (B & 0xFF00)) sym |= 64;
    enc.encodeSymbol(this.mUsed, sym);
    let dl = 0, dh = 0;
    if (sym & 1) { dl = (R & 255) - (L[0] & 255); enc.encodeSymbol(this.m[0], dl & 255); }
    if (sym & 2) { dh = (R >> 8) - (L[0] >> 8); enc.encodeSymbol(this.m[1], dh & 255); }
    if (sym & 64) {
      if (sym & 4) enc.encodeSymbol(this.m[2], ((G & 255) - clamp255(dl + (L[1] & 255))) & 255);
      if (sym & 16) { const d = Math.trunc((dl + (G & 255) - (L[1] & 255)) / 2); enc.encodeSymbol(this.m[4], ((B & 255) - clamp255(d + (L[2] & 255))) & 255); }
      if (sym & 8) enc.encodeSymbol(this.m[3], ((G >> 8) - clamp255(dh + (L[1] >> 8))) & 255);
      if (sym & 32) { const d = Math.trunc((dh + (G >> 8) - (L[1] >> 8)) / 2); enc.encodeSymbol(this.m[5], ((B >> 8) - clamp255(d + (L[2] >> 8))) & 255); }
    }
    L[0] = R; L[1] = G; L[2] = B;
  }
  read(dec, b, o) {
    const L = this.last, sym = dec.decodeSymbol(this.mUsed);
    let lo = sym & 1 ? (dec.decodeSymbol(this.m[0]) + (L[0] & 255)) & 255 : L[0] & 255;
    let hi = sym & 2 ? (dec.decodeSymbol(this.m[1]) + (L[0] >> 8)) & 255 : L[0] >> 8;
    const R = (hi << 8) | lo;
    let G, B;
    if (sym & 64) {
      const dl = lo - (L[0] & 255);
      const gl = sym & 4 ? (dec.decodeSymbol(this.m[2]) + clamp255(dl + (L[1] & 255))) & 255 : L[1] & 255;
      const bl = sym & 16 ? (dec.decodeSymbol(this.m[4]) + clamp255(Math.trunc((dl + gl - (L[1] & 255)) / 2) + (L[2] & 255))) & 255 : L[2] & 255;
      const dh = hi - (L[0] >> 8);
      const gh = sym & 8 ? (dec.decodeSymbol(this.m[3]) + clamp255(dh + (L[1] >> 8))) & 255 : L[1] >> 8;
      const bh = sym & 32 ? (dec.decodeSymbol(this.m[5]) + clamp255(Math.trunc((dh + gh - (L[1] >> 8)) / 2) + (L[2] >> 8))) & 255 : L[2] >> 8;
      G = (gh << 8) | gl; B = (bh << 8) | bl;
    } else { G = R; B = R; }
    L[0] = R; L[1] = G; L[2] = B;
    put16(b, o, R); put16(b, o + 2, G); put16(b, o + 4, B);
  }
}

/** BYTE version 2 (clause 13.4 Tables 44-45): each extra byte as its difference to the previous item's, one model per byte. */
class Bytes {
  constructor(first, o, n) { this.n = n; this.last = first.slice(o, o + n); this.m = Array.from({ length: n }, () => new SymbolModel(256)); }
  write(enc, b, o) { for (let i = 0; i < this.n; i++) { enc.encodeSymbol(this.m[i], (b[o + i] - this.last[i]) & 255); this.last[i] = b[o + i]; } }
  read(dec, b, o) { for (let i = 0; i < this.n; i++) { this.last[i] = (this.last[i] + dec.decodeSymbol(this.m[i])) & 255; b[o + i] = this.last[i]; } }
}

// ---------------------------------------------------------------------------------------------------------------- items, VLR

const BASE_LEN = { 0: 20, 1: 28, 2: 26, 3: 34 };
const ITEM = { BYTE: 0, POINT10: 6, GPSTIME11: 7, RGB12: 8 };

/** Clause 7.2 Table 14: the items of a point format (0-3), plus a Byte item for the extra bytes. */
export function lazItems(format, recordLength) {
  if (!(format in BASE_LEN)) fail('laz_format', { format });
  const base = BASE_LEN[format];
  if (!(recordLength >= base) || recordLength > 65535) fail('laz_record_length', { format, recordLength });
  const items = [{ type: ITEM.POINT10, size: 20, version: 2 }];
  if (format === 1 || format === 3) items.push({ type: ITEM.GPSTIME11, size: 8, version: 2 });
  if (format === 2 || format === 3) items.push({ type: ITEM.RGB12, size: 6, version: 2 });
  if (recordLength > base) items.push({ type: ITEM.BYTE, size: recordLength - base, version: 2 });
  return items;
}

/**
 * Clause 7.1 Table 8. Compressor 2 (pointwise and chunked), coder 0 (arithmetic). Version: the format version of the specification's
 * reference release, 3.4 revision 3 (clause 1: LASzip 3.4.3 and 3.4.4 are "identical in terms of specification"). Options 0;
 * special EVLRs −1, −1 ("reserved, shall be −1").
 */
export function lazVlrPayload(format, recordLength, { chunkSize = DEFAULT_CHUNK } = {}) {
  const items = lazItems(format, recordLength);
  const out = new Uint8Array(34 + 6 * items.length), dv = new DataView(out.buffer);
  dv.setUint16(0, 2, true); dv.setUint16(2, 0, true);
  out[4] = 3; out[5] = 4; dv.setUint16(6, 3, true);
  dv.setUint32(8, 0, true); dv.setUint32(12, chunkSize, true);
  dv.setBigInt64(16, -1n, true); dv.setBigInt64(24, -1n, true);
  dv.setUint16(32, items.length, true);
  items.forEach((it, i) => { dv.setUint16(34 + 6 * i, it.type, true); dv.setUint16(36 + 6 * i, it.size, true); dv.setUint16(38 + 6 * i, it.version, true); });
  return out;
}
export const LAZ_VLR = { user: 'laszip encoded', recordId: 22204 };   // clause 7.1   i18n-ignore: format names

function makeCoders(items, first, o0) {
  const out = []; let o = o0;
  for (const it of items) {
    if (it.type === ITEM.POINT10) out.push(new Point10(first, o));
    else if (it.type === ITEM.GPSTIME11) out.push(new GpsTime11(first, o));
    else if (it.type === ITEM.RGB12) out.push(new Rgb12(first, o));
    else if (it.type === ITEM.BYTE) out.push(new Bytes(first, o, it.size));
    else fail('laz_item', { type: it.type, version: it.version });
    out[out.length - 1].off = o - o0;
    o += it.size;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------- writer

/**
 * Clause 11.3 and 11.7: each chunk = the first record uncompressed, then one arithmetic stream for every other record of the chunk;
 * the models and previous items start again in every chunk. Chunk sizes go in the chunk table (clause 11.6).
 */
export class LazChunkWriter {
  constructor(format, recordLength, { chunkSize = DEFAULT_CHUNK } = {}) {
    if (!(chunkSize >= 1 && chunkSize < 0xFFFFFFFF)) fail('laz_chunk_size', { chunkSize });
    this.items = lazItems(format, recordLength);
    this.L = recordLength; this.chunkSize = chunkSize;
    this.chunkBytes = []; this.chunkCounts = [];
    this.enc = null; this.coders = null; this.inChunk = 0; this.head = null;
  }
  startChunk(b, o) {
    this.head = b.slice(o, o + this.L);
    this.coders = makeCoders(this.items, b, o);
    this.enc = new ArithEncoder(Math.max(1024, Math.min(1 << 22, this.chunkSize * 4)));
    this.inChunk = 1;
  }
  closeChunk() {
    const body = this.enc.done(), out = new Uint8Array(this.L + body.length);
    out.set(this.head, 0); out.set(body, this.L);
    this.chunkBytes.push(out.length); this.chunkCounts.push(this.inChunk);
    this.enc = null; this.coders = null; this.inChunk = 0;
    return out;
  }
  /** records: n uncompressed LAS records of recordLength bytes, back to back. Returns the chunks this call completed. */
  add(records, n) {
    const out = [], L = this.L;
    for (let i = 0; i < n; i++) {
      const o = i * L;
      if (!this.enc) this.startChunk(records, o);
      else { for (const c of this.coders) c.write(this.enc, records, o + c.off); this.inChunk++; }
      if (this.inChunk === this.chunkSize) out.push(this.closeChunk());
    }
    return out;
  }
  finish() { return this.enc ? [this.closeChunk()] : []; }
  /** Clause 11.6 Tables 27-29: version 0, the number of chunks, then each chunk's byte size against the previous one (instance 2). */
  chunkTable() {
    const n = this.chunkBytes.length, head = new Uint8Array(8), dv = new DataView(head.buffer);
    dv.setUint32(0, 0, true); dv.setUint32(4, n, true);
    if (!n) return head;
    const enc = new ArithEncoder(64 + 8 * n), ic = new IntegerCoder(32, 2);
    for (let i = 0; i < n; i++) ic.compress(enc, i ? this.chunkBytes[i - 1] : 0, this.chunkBytes[i], 1);
    const body = enc.done(), out = new Uint8Array(8 + body.length);
    out.set(head, 0); out.set(body, 8);
    return out;
  }
}

// ---------------------------------------------------------------------------------------------------------------- reader

const asciiz = (b, o, n) => { let s = ''; for (let i = 0; i < n && b[o + i]; i++) s += String.fromCharCode(b[o + i]); return s; };

/** Our own LAZ reader for formats 0-3 (the tests' round trip; the app reads LAZ through laz-perf). Whole file in memory. */
export function readLaz(bytes) {
  if (bytes.length < 227 || asciiz(bytes, 0, 4) !== 'LASF') fail('laz_not_laz');
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = bytes[24] + '.' + bytes[25], headerSize = dv.getUint16(94, true), offsetToPoints = dv.getUint32(96, true);
  const nVlr = dv.getUint32(100, true), fmtByte = bytes[104], recordLength = dv.getUint16(105, true);
  if (!(fmtByte & 0x80)) fail('laz_not_laz');
  const format = fmtByte & 0x3f;
  let count = dv.getUint32(107, true);
  if (bytes[25] >= 4 && headerSize >= 375) { const c64 = Number(dv.getBigUint64(247, true)); if (c64) count = c64; }
  let o = headerSize, vlr = null;
  for (let i = 0; i < nVlr; i++) {
    if (o + 54 > bytes.length) fail('laz_bad_vlr');
    const len = dv.getUint16(o + 20, true);
    if (asciiz(bytes, o + 2, 16) === LAZ_VLR.user && dv.getUint16(o + 18, true) === LAZ_VLR.recordId) vlr = { o: o + 54, len };
    o += 54 + len;
  }
  if (!vlr || vlr.len < 34) fail('laz_bad_vlr');
  const compressor = dv.getUint16(vlr.o, true), chunkSize = dv.getUint32(vlr.o + 12, true), nItems = dv.getUint16(vlr.o + 32, true);
  if (compressor !== 2) fail('laz_compressor', { compressor });
  if (vlr.len < 34 + 6 * nItems) fail('laz_bad_vlr');
  const items = [];
  for (let i = 0; i < nItems; i++) items.push({ type: dv.getUint16(vlr.o + 34 + 6 * i, true), size: dv.getUint16(vlr.o + 36 + 6 * i, true), version: dv.getUint16(vlr.o + 38 + 6 * i, true) });
  for (const it of items) if (it.version !== 2 || ![0, 6, 7, 8].includes(it.type)) fail('laz_item', it);
  if (items.reduce((s, it) => s + it.size, 0) !== recordLength) fail('laz_record_length', { format, recordLength });
  if (chunkSize === 0 || chunkSize === 0xFFFFFFFF) fail('laz_chunk_size', { chunkSize });
  // chunk table (clause 11.5, 11.6)
  let tablePos = Number(dv.getBigInt64(offsetToPoints, true));
  if (tablePos === -1) tablePos = Number(dv.getBigInt64(bytes.length - 8, true));
  if (!(tablePos >= offsetToPoints + 8 && tablePos + 8 <= bytes.length)) fail('laz_bad_table');
  const nChunks = dv.getUint32(tablePos + 4, true), sizes = [];
  if (nChunks) {
    const dec = new ArithDecoder(bytes, tablePos + 8), ic = new IntegerCoder(32, 2);
    let prev = 0;
    for (let i = 0; i < nChunks; i++) { prev = ic.decompress(dec, prev, 1); sizes.push(prev >>> 0); }
  }
  const records = new Uint8Array(count * recordLength);
  let pos = offsetToPoints + 8, done = 0;
  for (let c = 0; c < nChunks && done < count; c++) {
    const end = pos + sizes[c], m = Math.min(chunkSize, count - done);
    if (end > tablePos || pos + recordLength > end) fail('laz_truncated', { chunk: c });
    let ro = done * recordLength;
    records.set(bytes.subarray(pos, pos + recordLength), ro);
    const coders = makeCoders(items, bytes, pos);
    const dec = new ArithDecoder(bytes, pos + recordLength, end);
    for (let i = 1; i < m; i++) {
      ro += recordLength;
      for (const k of coders) k.read(dec, records, ro + k.off);
    }
    done += m; pos = end;
  }
  if (done < count) fail('laz_truncated', { read: done, count });
  return { version, format, recordLength, count, offsetToPoints, items, chunkSize, chunks: sizes, records };
}

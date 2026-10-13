/* SPDX-License-Identifier: Apache-2.0 */
/**
 * r2007-write.js — the R2007 (AC1021) container (cc-dwg, Apache-2.0): Reed-Solomon (255,239) and (255,251)
 * encoding with interleaving, the CRC random encoder, 64-bit CRCs (normal and mirrored), system pages (page map,
 * section map), data pages and the RS-coded file header.
 *
 * Written from the ODA "Open Design Specification for .dwg files" v5.4.1, ch. 5 (5.2–5.4, 5.11–5.13), with the
 * conventions the text leaves open settled by experiment on AutoCAD's own example_2007.dwg (throwaway probes
 * that recompute the stored parity, CRCs and seeds and compare):
 *
 * Spec gap: RS generator roots are α¹…α^(n−k) (Rockliff's convention); a codeword is stored as the k data bytes
 *   followed by the n−k parity bytes, lowest-degree parity first, with data byte i the coefficient of x^(n−k+i).
 * Spec gap: the literal-copy and CRC byte orders apply as tables (5.10.1, 5.12); the writer stores pages
 *   uncompressed (compressed size = uncompressed size), which AutoCAD itself does for pages that do not shrink.
 */
import { ByteWriter } from './bits-write.js';
import { crc64Normal, crc64Mirrored, updateSeed1, updateSeed2, CrcRandom, r2007PageChecksum } from './crc.js';

// ---------------------------------------------------------------- GF(256) and Reed-Solomon (5.13)
function galois(poly) {
  const exp = new Uint8Array(512), log = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) { exp[i] = x; log[x] = i; x <<= 1; if (x & 0x100) x ^= poly; }
  for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];
  return { exp, log };
}
function rsEncoder(poly, nk) {
  const G = galois(poly);
  const mul = (a, b) => (a && b ? G.exp[G.log[a] + G.log[b]] : 0);
  let g = [1];                                    // generator, low → high coefficients, roots α^1 … α^nk
  for (let i = 1; i <= nk; i++) {
    const r = G.exp[i % 255];
    const ng = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) { ng[j] ^= mul(g[j], r); ng[j + 1] ^= g[j]; }
    g = ng;
  }
  // multiplication tables per generator coefficient for speed
  const tab = g.slice(0, nk).map((c) => { const t = new Uint8Array(256); for (let v = 0; v < 256; v++) t[v] = mul(v, c); return t; });
  /** parity (nk bytes, lowest degree first) of k data bytes, data[i] ↔ x^(nk+i) */
  return (data, from, k) => {
    const rem = new Uint8Array(nk);               // rem[j] ↔ x^j
    for (let i = k - 1; i >= 0; i--) {
      const fb = data[from + i] ^ rem[nk - 1];
      for (let j = nk - 1; j > 0; j--) rem[j] = rem[j - 1] ^ tab[j][fb];
      rem[0] = tab[0][fb];
    }
    return rem;
  };
}
export const RS_SYS = { k: 239, nk: 16, enc: rsEncoder(0x169, 16) };   // system pages: (255,239), x^8+x^6+x^5+x^3+1
export const RS_DATA = { k: 251, nk: 4, enc: rsEncoder(0x11D, 4) };    // data pages: (255,251), x^8+x^4+x^3+x^2+1
/**
 * RS-encode `data` (its length a multiple of k after padding). Interleaved: codeword j's bytes go to positions
 * blocks·i + j; otherwise all data blocks then all parity blocks (5.13.1–2). Short last blocks are padded with
 * `pad()` bytes (the random padding of 5.11).
 */
export function rsEncode(data, code, interleaved, pad) {
  const { k, nk, enc } = code;
  const blocks = Math.max(1, Math.ceil(data.length / k));
  const full = new Uint8Array(blocks * k);
  full.set(data);
  for (let i = data.length; i < full.length; i++) full[i] = pad ? pad() : 0;
  const out = new Uint8Array(blocks * 255);
  for (let b = 0; b < blocks; b++) {
    const par = enc(full, b * k, k);
    if (interleaved) {
      for (let i = 0; i < k; i++) out[i * blocks + b] = full[b * k + i];
      for (let i = 0; i < nk; i++) out[(k + i) * blocks + b] = par[i];
    } else {
      out.set(full.subarray(b * k, b * k + k), b * k);
      out.set(par, blocks * k + b * nk);
    }
  }
  return out;
}

// ---------------------------------------------------------------- 64-bit CRCs (5.12), random encoder (5.11): builder R's crc.js
const M64 = (1n << 64n) - 1n;
export { crc64Normal, crc64Mirrored, updateSeed1, updateSeed2 };
/** The CRC random encoder plus a cycling reader over its padding table (5.11 "padding data"). */
export class RandomEncoder extends CrcRandom {
  constructor(seed) { super(seed); this.seed = BigInt.asUintN(64, BigInt(seed)); this.padPos = 0; }
  padByte() { const b = this.padding[this.padPos]; this.padPos = (this.padPos + 1) % this.padding.length; return b; }
}
/** The check-data Encode (5.2.1.1.5): rotate left by control & 0x1F. */
export function rot(value, control) {
  const s = BigInt(Number(control & 0x1Fn));
  value = BigInt.asUintN(64, value);
  return s ? ((value << s) | (value >> (64n - s))) & M64 : value;
}

// ---------------------------------------------------------------- data page checksum (5.4.1): crc.js
export const pageChecksum21 = (seed, data) => r2007PageChecksum(Number(BigInt.asUintN(32, BigInt(seed))), data);

// ---------------------------------------------------------------- R2007 compression (inverse of 5.10)
/** Literal copy order (5.10.1): out = concatenation of the listed [count, source offset] blocks. */
const LIT = { 1: [[1, 0]], 2: [[1, 1], [1, 0]], 3: [[1, 2], [1, 1], [1, 0]], 4: [[1, 0], [1, 1], [1, 2], [1, 3]], 5: [[1, 4], [4, 0]], 6: [[1, 5], [4, 1], [1, 0]],
  7: [[2, 5], [4, 1], [1, 0]], 8: [[4, 0], [4, 4]], 9: [[1, 8], [8, 0]], 10: [[1, 9], [8, 1], [1, 0]], 11: [[2, 9], [8, 1], [1, 0]], 12: [[4, 8], [8, 0]],
  13: [[1, 12], [4, 8], [8, 0]], 14: [[1, 13], [4, 9], [8, 1], [1, 0]], 15: [[2, 13], [4, 9], [8, 1], [1, 0]], 16: [[8, 8], [8, 0]], 17: [[8, 9], [1, 8], [8, 0]],
  18: [[1, 17], [16, 1], [1, 0]], 19: [[3, 16], [16, 0]], 20: [[4, 16], [16, 0]], 21: [[1, 20], [4, 16], [16, 0]], 22: [[2, 20], [4, 16], [16, 0]],
  23: [[3, 20], [4, 16], [16, 0]], 24: [[8, 16], [16, 0]], 25: [[8, 17], [1, 16], [16, 0]], 26: [[1, 25], [8, 17], [1, 16], [16, 0]],
  27: [[2, 25], [8, 17], [1, 16], [16, 0]], 28: [[4, 24], [8, 16], [16, 0]], 29: [[1, 28], [4, 24], [8, 16], [16, 0]], 30: [[2, 28], [4, 24], [8, 16], [16, 0]],
  31: [[1, 30], [4, 26], [8, 18], [16, 2], [2, 0]], 32: [[16, 16], [16, 0]] };
/** PERM[n][outIndex] = source index within an n-byte block. */
const PERM = (() => {
  const P = {};
  const build = (n) => { const out = []; for (const [k, off] of LIT[n]) { if (k === 1) out.push(off); else for (const s of (P[k] || build(k))) out.push(off + s); } return (P[n] = out); };
  for (let n = 1; n <= 32; n++) build(n);
  return P;
})();
export { PERM as LITERAL_ORDER };

/**
 * Compress `src` with the R2007 scheme (5.10, read in reverse): literals stored in the block order of 5.10.1,
 * matches as the four instruction forms, up to 7 following literals in an instruction's low bits.
 * Spec gap: a stream that starts with 1–7 literals begins 0x20 0x00 0x00 n (as AutoCAD writes it); the match
 * "offset" is the back distance (forms 0, 1 and the default form store distance − 1; the short form of 0x2x
 * stores the distance itself, the long form distance − 1).
 */
export function compressR2007(src) {
  const n = src.length;
  const out = new ByteWriter(n + (n >> 2) + 64);
  // matches (greedy, hash chains)
  const HB = 15, head = new Int32Array(1 << HB).fill(-1), prev = new Int32Array(n).fill(-1);
  const hash = (i) => (((src[i] << 16) | (src[i + 1] << 8) | src[i + 2]) * 2654435761 >>> (32 - HB));
  const insert = (i) => { if (i + 2 < n) { const h = hash(i); prev[i] = head[h]; head[h] = i; } };
  const tokens = [];
  let i = 0;
  while (i < n) {
    let bestLen = 0, bestDist = 0;
    if (i + 3 <= n) {
      let c = head[hash(i)], chain = 0;
      while (c >= 0 && chain++ < 48) {
        const d = i - c;
        if (d > 0xF000) break;
        if (src[c] === src[i] && src[c + bestLen] === src[i + bestLen]) {
          let l = 0; const max = Math.min(n - i, 0x100 + 0xFFFF);
          while (l < max && src[c + l] === src[i + l]) l++;
          if (l > bestLen) { bestLen = l; bestDist = d; }
        }
        c = prev[c];
      }
    }
    if (bestLen >= 3 && !(i === 0)) { tokens.push([i, bestLen, bestDist]); for (let k = i; k < i + bestLen; k++) insert(k); i += bestLen; }
    else { insert(i); i++; }
  }
  // emit
  // literals: the decoder maps source block bytes to output positions by PERM; write the inverse
  const literal = (a, b) => {
    let p = a;
    while (b - p >= 32) { const blk = new Uint8Array(32); PERM[32].forEach((s, o) => { blk[s] = src[p + o]; }); out.raw(blk); p += 32; }
    if (b - p) { const m = b - p; const blk = new Uint8Array(m); PERM[m].forEach((s, o) => { blk[s] = src[p + o]; }); out.raw(blk); }
  };
  const litLenOp = (len) => {           // len ≥ 8
    if (len <= 22) { out.RC(len - 8); return; }
    out.RC(0x0F);
    let r = len - 0x17;
    if (r < 0xFF) { out.RC(r); return; }
    out.RC(0xFF); r -= 0xFF;
    while (r >= 0xFFFF) { out.RS(0xFFFF); r -= 0xFFFF; }
    out.RS(r);
  };
  const firstEnd = tokens.length ? tokens[0][0] : n;
  if (firstEnd >= 8) { litLenOp(firstEnd); literal(0, firstEnd); }
  else { out.raw([0x20, 0, 0, firstEnd & 7]); literal(0, firstEnd); }
  let afterMatch = false;
  for (let t = 0; t < tokens.length; t++) {
    const [start, len, dist] = tokens[t];
    const next = t + 1 < tokens.length ? tokens[t + 1][0] : n;
    const lit = next - (start + len);
    const lit3 = lit >= 1 && lit <= 7 ? lit : 0;
    const d1 = dist - 1;
    // a default-form opcode 0xFx right after a match would read as the 0xF0 escape: length 15 only after a literal
    if ((len <= 14 || (len === 15 && !afterMatch)) && d1 < 512) {
      out.RC((len << 4) | (d1 & 15)); out.RC(((d1 >> 4) << 3) | lit3);
    } else if (len <= 18 && d1 < 8192) {
      out.RC(0x10 | (len - 3)); out.RC(d1 & 0xFF); out.RC(((d1 >> 8) << 3) | lit3);
    } else if (len >= 0x13 && len <= 0x32 && d1 < 4096) {
      let L = len - 0x13; const hi = L >= 16; if (hi) L -= 16;
      out.RC(afterMatch ? (0xF0 | L) : L); out.RC(d1 & 0xFF); out.RC(((d1 >> 8) << 3) | (hi ? 0x80 : 0) | lit3);
    } else if (len < 0x100 && dist <= 0xFFFF) {
      out.RC(0x20 | (len & 7)); out.RC(dist & 0xFF); out.RC(dist >> 8); out.RC((len & 0xF8) | lit3);
    } else {
      const L = len - 0x100;
      out.RC(0x28 | (L & 7)); out.RC(d1 & 0xFF); out.RC(d1 >> 8); out.RC((L >> 3) & 0xFF); out.RC(((L >> 11) << 3) | lit3);
    }
    if (lit >= 8) { litLenOp(lit); }
    literal(start + len, next);
    afterMatch = lit === 0;
  }
  return out.bytes();
}

/** The R2007 decompressor (5.10), for this module's tests. */
export function decompressR2007ForTest(src, outSize) {
  const out = new Uint8Array(outSize); let o = 0, i = 0;
  const end = src.length;
  const lit = (n) => {
    let k = 0;
    for (; k + 32 <= n; k += 32) { for (const s of PERM[32]) out[o++] = src[i + k + s]; }
    if (n - k) for (const s of PERM[n - k]) out[o++] = src[i + k + s];
    i += n;
  };
  const readLitLen = (op) => { let len = op + 8; if (len === 0x17) { let x = src[i++]; len += x; if (x === 0xFF) { do { x = src[i] | (src[i + 1] << 8); i += 2; len += x; } while (x === 0xFFFF); } } return len; };
  let op, len = 0, off;
  const instr = () => {
    switch (op >> 4) {
      case 0: len = (op & 0xF) + 0x13; off = src[i++]; op = src[i++]; len = ((op >> 3) & 0x10) + len; off = ((op & 0x78) << 5) + 1 + off; break;
      case 1: len = (op & 0xF) + 3; off = src[i++]; op = src[i++]; off = ((op & 0xF8) << 5) + 1 + off; break;
      case 2: off = src[i++]; off = ((src[i++] << 8) & 0xFF00) | off; len = op & 7;
        if ((op & 8) === 0) { op = src[i++]; len = (op & 0xF8) + len; } else { off++; len = (src[i++] << 3) + len; op = src[i++]; len = (((op & 0xF8) << 8) + len) + 0x100; } break;
      default: len = op >> 4; off = op & 15; op = src[i++]; off = (((op & 0xF8) << 1) + off) + 1; break;
    }
  };
  op = src[0];
  if ((op >> 4) === 2) { i = 3; len = src[i++] & 7; } else i = 1;
  while (i < end) {
    if (len === 0) len = readLitLen(op);
    lit(len);
    if (i >= end) break;
    op = src[i++];
    instr();
    for (;;) {
      for (let k = 0; k < len; k++, o++) out[o] = out[o - off];
      len = op & 7;
      if (len !== 0 || i >= end) break;
      op = src[i++];
      if ((op >> 4) === 0) break;
      if ((op >> 4) === 15) op &= 15;
      instr();
    }
  }
  return out.subarray(0, o);
}

// ---------------------------------------------------------------- the file
const HASH = {
  'AcDb:SummaryInfo': 0x717A060F, 'AcDb:Preview': 0x40AA0473, 'AcDb:RevHistory': 0x60A205B3, 'AcDb:AcDbObjects': 0x674C05A9,
  'AcDb:ObjFreeSpace': 0x77E2061F, 'AcDb:Template': 0x4A1404CE, 'AcDb:Handles': 0x3F6E0450, 'AcDb:Classes': 0x3F54045F,
  'AcDb:AuxHeader': 0x54F0050A, 'AcDb:Header': 0x32B803D9,
};
const concat = (a, b) => { const o = new Uint8Array(a.length + b.length); o.set(a); o.set(b, a.length); return o; };
const pad8 = (b) => { const n = (b.length + 7) & ~7; if (n === b.length) return b; const o = new Uint8Array(n); o.set(b); return o; };
const align20 = (n) => (n + 0x1F) & ~0x1F;
/** 5.3.1 */
export function systemPageSize(dataSize) {
  const aligned = (dataSize + 7) & ~7;
  const p = Math.floor((aligned * 2 + 239 - 1) / 239) * 255;
  return p < 0x400 ? 0x400 : align20(p);
}

/**
 * A system page (5.3): the data (stored uncompressed — "compressed" size = uncompressed size), padded to 8, repeated
 * as many times as fits, RS(255,239)-encoded interleaved, random padding to the page size.
 * Returns { bytes, size, crcUncompressed, crcCompressed, factor }.
 */
function systemPage(data, rnd) {
  const size = systemPageSize(data.length);
  const z = compressR2007(data);
  const stored = z.length < data.length ? z : data;
  const d8 = pad8(stored);
  const maxPre = Math.floor(size / 255) * 239;
  const factor = Math.max(1, Math.floor(maxPre / d8.length));
  const buf = new Uint8Array(d8.length * factor);
  for (let i = 0; i < factor; i++) buf.set(d8, i * d8.length);
  const rs = rsEncode(buf, RS_SYS, true, () => rnd.padByte());
  const out = new Uint8Array(size);
  out.set(rs);
  for (let i = rs.length; i < size; i++) out[i] = rnd.padByte();
  return {
    bytes: out, size, factor, compSize: stored.length,
    crcUncompressed: crc64Mirrored(data, updateSeed1(0n, data.length)),
    crcCompressed: crc64Mirrored(stored, updateSeed1(0n, stored.length)),
  };
}

/**
 * parts as in container-write.js (header, classes, objects, measurement, jd, handseed) plus the section bodies,
 * which it builds with the shared helpers passed in `helpers`.
 */
export function layoutR2007(parts, helpers) {
  const { headerSection, classesSection, objectMap, objFreeSpace, templateSection, auxHeader, summaryInfo, previewSection, revHistory, VERSION_INFO } = helpers;
  const version = 'AC1021', { code, maint } = VERSION_INFO[version];
  const rnd = new RandomEncoder(parts.randomSeed ?? 0x5A17C0DEn);
  // AcDb:AcDbObjects — RL 0x0DCA then the objects (as R2004)
  const ob = new ByteWriter(1 << 16);
  ob.RL(0x0DCA);
  const map = [];
  for (const o of parts.objects) { map.push([o.handle, ob.pos]); ob.raw(o.data); }
  // [name, data, encoding (1 = plain, 4 = RS interleaved), max page size]
  // Spec gap: encoding 1 pages are stored without Reed-Solomon coding (AutoCAD's SummaryInfo and AppInfo pages in
  // example_2007.dwg are the bare data followed by padding).
  const sections = [
    ['AcDb:SummaryInfo', summaryInfo(version, parts.jd), 1, 0x80],
    // Compatibility, found by experiment: LibreDWG 0.14's dwgread (a test-only black box; see PROVENANCE.md) reported
    // an overflow when it read our R2007 preview with no image; 32 zero bytes after the end sentinel keep it quiet.
    ['AcDb:Preview', concat(previewSection(), new Uint8Array(32)), 1, 0x400],
    ['AcDb:RevHistory', revHistory(version), 4, 0x1000],
    ['AcDb:AcDbObjects', ob.bytes(), 4, 0xF800],
    ['AcDb:ObjFreeSpace', objFreeSpace(map.length, parts.jd.updated, 0), 4, 0xF800],
    ['AcDb:Template', templateSection(parts.measurement, version), 4, 0x400],
    ['AcDb:Handles', objectMap(map), 4, 0xF800],
    ['AcDb:Classes', classesSection(parts.classes, version), 4, 0xF800],
    ['AcDb:AuxHeader', auxHeader(version, parts.jd, parts.handseed), 4, 0x800],
    ['AcDb:Header', headerSection(parts.header, version), 4, 0x800],
  ];
  if (sections[0][1].length > 0x80) sections[0][3] = (sections[0][1].length + 0x7F) & ~0x7F;
  // data pages
  const dataPages = [];                            // {id, bytes, size}
  const descs = [];
  let pid = 0;
  for (const [name, data, encoding, maxSize] of sections) {
    const desc = { name, size: data.length, maxSize, encoding, pages: [] };
    const addPage = (offset, chunk, comp, sizeField) => {
      const checksum = pageChecksum21(0n, chunk);
      const crc = crc64Mirrored(comp, updateSeed1(0n, comp.length));
      let stored;
      if (encoding === 4) stored = rsEncode(pad8(comp), RS_DATA, true, () => rnd.padByte());
      else { stored = new Uint8Array(maxSize + 0x20); stored.set(chunk); for (let i = (chunk.length + 7) & ~7; i < stored.length; i++) stored[i] = rnd.padByte(); }
      const size = align20(stored.length);
      const bytes = new Uint8Array(size); bytes.set(stored);
      const id = ++pid;
      dataPages.push({ id, bytes, size });
      desc.pages.push({ offset, size: sizeField, id, uncomp: chunk.length, comp: comp.length, checksum, crc });
    };
    for (let start = 0; start < data.length || (start === 0 && !data.length); start += maxSize) {
      const chunk = data.subarray(start, Math.min(data.length, start + maxSize));
      const z = encoding === 4 ? compressR2007(chunk) : chunk;
      if (encoding !== 4 || z.length < chunk.length || chunk.length <= 248) {
        // compressed when it shrinks (5.4); a page that does not is stored as it is
        addPage(start, chunk, z.length < chunk.length ? z : chunk, chunk.length === maxSize ? maxSize : Math.max(maxSize, chunk.length));
      } else {
        // Spec gap, found by experiment: with a stored (uncompressed) page of several RS blocks, LibreDWG's dwgread
        // and the ODA File Converter (test-only black boxes; see PROVENANCE.md) disagreed on our file — one reported a
        // CRC error whichever way the blocks lay. AutoCAD's own R2007 pages vary in size, so a stretch that does not
        // compress is split into pages of one RS block (248 bytes), which both read.
        for (let s0 = 0; s0 < chunk.length; s0 += 248) {
          const piece = chunk.subarray(s0, Math.min(chunk.length, s0 + 248));
          addPage(start + s0, piece, piece, piece.length);
        }
      }
      if (!data.length) break;
    }
    descs.push(desc);
  }
  const smId1 = pid + 1, smId2 = pid + 2, pmId1 = pid + 3, pmId2 = pid + 4;
  // section map (5.2): one entry per section, then an empty one ("number of sections + 1")
  const sm = new ByteWriter(4096);
  // Spec gap: AutoCAD ends the map with an empty section of no pages and counts it ("number of sections + 1").
  // Found by experiment with our files and the test-only black boxes (see PROVENANCE.md): LibreDWG's dwgread reported
  // that entry as an error ("Invalid num_pages 0"), libdxfrw's dwg2dxf failed without the count; so the entry is
  // left out and the header still says sections + 1, which all of them (and the ODA File Converter) accept.
  const entries = descs;
  for (const d of entries) {
    const nameLen = d.name ? (d.name.length + 1) * 2 : 0;
    sm.RLL(d.size); sm.RLL(d.maxSize); sm.RLL(0); sm.RLL(d.name ? HASH[d.name] : 0); sm.RLL(nameLen); sm.RLL(0); sm.RLL(d.encoding); sm.RLL(d.pages.length);
    if (d.name) { for (let i = 0; i < d.name.length; i++) sm.RS(d.name.charCodeAt(i)); sm.RS(0); }
    for (const p of d.pages) { sm.RLL(p.offset); sm.RLL(p.size); sm.RLL(p.id); sm.RLL(p.uncomp); sm.RLL(p.comp); sm.RLL(p.checksum); sm.RLL(p.crc); }
  }
  const smData = sm.bytes();
  const smPage1 = systemPage(smData, rnd), smPage2 = systemPage(smData, rnd);
  // page map: (size, id) pairs in file order — page map 1, page map 2, data pages, section maps
  const nPages = 4 + dataPages.length;
  const pmSize = systemPageSize(nPages * 16);
  const pm = new ByteWriter(nPages * 16);
  pm.RLL(pmSize); pm.RLL(pmId1); pm.RLL(pmSize); pm.RLL(pmId2);
  for (const p of dataPages) { pm.RLL(p.size); pm.RLL(p.id); }
  pm.RLL(smPage1.size); pm.RLL(smId1); pm.RLL(smPage2.size); pm.RLL(smId2);
  const pmData = pm.bytes();
  const pmPage1 = systemPage(pmData, rnd), pmPage2 = systemPage(pmData, rnd);
  if (pmPage1.size !== pmSize) throw new Error('R2007 page map size');

  // assemble: meta 0x80, header 0x400, page maps, data pages, section maps, header copy
  const out = new ByteWriter(0x480 + pmSize * 2 + dataPages.reduce((s, p) => s + p.size, 0) + smPage1.size * 2 + 0x400);
  out.zeros(0x480);
  out.raw(pmPage1.bytes); out.raw(pmPage2.bytes);
  const pageAt = new Map();
  for (const p of dataPages) { pageAt.set(p.id, out.pos); out.raw(p.bytes); }
  const sm1At = out.pos;
  out.raw(smPage1.bytes); out.raw(smPage2.bytes);
  const header2At = out.pos;
  const fileSize = header2At + 0x400;

  // the file header (5.2, 5.2.1): fields, CRCs, check data, RS
  const crcSeed = 0n;
  const fh = new ByteWriter(0x110);
  const sectionsMapCrcSeed = rnd.encode(Number(crcSeed));
  const pagesMapCrcSeed = rnd.encode(Number(crcSeed));
  const random1 = rnd.next64(), random2 = rnd.next64();
  const encodedCrcSeed = rnd.encode(Number(crcSeed));
  const b64 = (arr) => { const o = new ByteWriter(64); for (const v of arr) o.RLL(v); return o.bytes(); };
  const n0 = rot(random1, random2), n1 = rot(n0, n0), n2 = rot(random2, n1), n3 = rot(n2, n2), n4 = rot(random1, n3), n5 = rot(n4, n4), n6 = rot(n5, n5), n7 = rot(n6, n6);
  const normalCrc = crc64Normal(b64([n0, n1, n2, n3, n4, n5, n6, n7]), ~random2 & M64);
  const m0 = rot(random1, random2), m1 = rot(normalCrc, m0), m2 = rot(random2, m1), m3 = rot(normalCrc, m2), m4 = rot(random1, m3), m5 = rot(normalCrc, m4), m6 = rot(random2, m5), m7 = rot(m6, m6);
  const mirroredCrc = crc64Mirrored(b64([m0, m1, m2, m3, m4, m5, m6, m7]), ~random1 & M64);
  const crcSeedEncoded = rnd.encode(Number(crcSeed));
  fh.RLL(0x70); fh.RLL(fileSize);
  fh.RLL(pmPage1.crcCompressed); fh.RLL(pmPage1.factor); fh.RLL(pagesMapCrcSeed);
  fh.RLL(pmSize);                                  // page map 2 offset (relative to page map 1)
  fh.RLL(pmId2);
  fh.RLL(0);                                       // page map offset
  fh.RLL(pmId1);
  fh.RLL(header2At - 0x480);
  fh.RLL(pmPage1.compSize); fh.RLL(pmData.length);
  fh.RLL(nPages); fh.RLL(pmId2);
  fh.RLL(0x20); fh.RLL(0x40);
  fh.RLL(pmPage1.crcUncompressed);
  fh.RLL(0xF800); fh.RLL(4); fh.RLL(1);
  fh.RLL(entries.length + 1);                      // "number of sections + 1" (libdxfrw's dwg2dxf failed on our file without it)
  fh.RLL(smPage1.crcUncompressed); fh.RLL(smPage1.compSize);
  fh.RLL(smId2); fh.RLL(smId1);
  fh.RLL(smData.length); fh.RLL(smPage1.crcCompressed); fh.RLL(smPage1.factor); fh.RLL(sectionsMapCrcSeed);
  fh.RLL(0x60100);
  fh.RLL(crcSeed); fh.RLL(crcSeedEncoded); fh.RLL(rnd.seed);
  fh.RLL(0);                                       // header CRC placeholder
  const hd = fh.bytes();
  const hcrc = crc64Normal(hd, updateSeed2(0n, hd.length));
  new DataView(hd.buffer, hd.byteOffset).setBigUint64(0x108, hcrc, true);
  // 5.2.1.3–5: compressed (negated size when it does not shrink); the block repeated to fill 3 × 239 bytes
  const hz0 = compressR2007(hd);
  const hz = hz0.length < hd.length ? hz0 : hd;
  const dataCrc = crc64Normal(hz, updateSeed2(0n, hz.length));
  const seq0 = rnd.next64(), seq1 = rot(seq0, seq0);
  const seqBytes = b64([seq0, seq1]);
  const seqCrc = crc64Normal(seqBytes, updateSeed1(0n, 16));
  const blk = new ByteWriter(0x140);
  blk.RLL(seqCrc); blk.RLL(seq0); blk.RLL(dataCrc); blk.RL(hz === hd ? -hd.length : hz.length); blk.RL(0); blk.raw(hz);
  while (blk.pos % 8) blk.RC(rnd.padByte());
  const block = blk.bytes();
  const pre = new Uint8Array(3 * 239);
  let p = 0;
  while (p + block.length <= pre.length) { pre.set(block, p); p += block.length; }
  for (; p < pre.length; p++) pre[p] = rnd.padByte();
  const rsHdr = rsEncode(pre, RS_SYS, true, () => rnd.padByte());
  const page = new Uint8Array(0x400);
  page.set(rsHdr);
  for (let i = rsHdr.length; i < 0x3D8; i++) page[i] = rnd.padByte();
  const chk = b64([normalCrc, mirroredCrc, random1, random2, encodedCrcSeed]);
  page.set(chk.subarray(0, 0x28), 0x3D8);
  out.buf.set(page, 0x80);
  out.raw(page);                                   // the copy at the end (5.2.1.8)

  // meta data (5.2)
  const meta = new ByteWriter(0x80);
  meta.raw([...version].map((c) => c.charCodeAt(0)));
  meta.raw([0, 0, 0, 0, 0]); meta.RC(maint); meta.RC(3);
  meta.RL(pageAt.get(dataPages[1].id));            // preview address (the page)
  meta.RC(code); meta.RC(maint); meta.RS(30);
  meta.raw([0, 0, 0]);
  meta.RL(0); meta.RL(0);
  meta.RL(pageAt.get(dataPages[0].id));            // summary info address
  meta.RL(0); meta.RL(0x80); meta.RL(0);
  out.buf.set(meta.bytes(), 0);
  return out.bytes();
}

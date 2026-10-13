/* SPDX-License-Identifier: Apache-2.0 */
/**
 * r2007.js — the R2007 (AC1021) container: Reed-Solomon decoding, the R21 LZ77 variant, the file header,
 * the page map, the section map and data pages. cc-dwg (Apache-2.0), written from the ODA "Open Design
 * Specification for .dwg files" v5.4.1, chapter 5 (5.1–5.4, 5.10 decompression, 5.11/5.12 CRCs, 5.13
 * Reed-Solomon). The encoder side (RS encode, compression) belongs to r2007-write.js (writer).
 *
 *   readR2007Container(bytes, version, ver) → same shape as container-read.js readContainer()
 *   rsDecodeBlock(block255, k, sys) → { ok, corrected }   corrects up to (255-k)/2 byte errors in place
 *   rsSyndromesZero(block255, k, sys) → bool
 *   deinterleave(bytes, from, blocks, k) → Uint8Array(blocks * k)  the data bytes of interleaved codewords
 *   decompressR21(src, from, len, outSize) → Uint8Array
 *   GF tables: RS_SYSTEM (255,239) poly 0x169, RS_DATA (255,251) poly 0x11D  (5.13: (1,0,0,1,0,1,1,0) and
 *   (1,0,1,1,1,0,0,0) as the x^0..x^7 coefficients, x^8 implied)
 */

import { UnsupportedDwg, plausibleSize } from './container-util.js';

// ---------------------------------------------------------------- GF(256) and Reed-Solomon (5.13)
function makeField(poly) {
  const exp = new Uint8Array(512), log = new Int16Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) { exp[i] = x; log[x] = i; x <<= 1; if (x & 0x100) x ^= poly; }
  for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];
  log[0] = -1;
  return { exp, log, poly };
}
export const RS_SYSTEM = makeField(0x169);
export const RS_DATA = makeField(0x11D);
const mul = (F, a, b) => (a && b ? F.exp[F.log[a] + F.log[b]] : 0);

/**
 * Codeword layout. Spec gap: 5.13 points at an external implementation for the conventions. Found by
 * experiment on AutoCAD-saved R2007 files (all syndromes zero): each 255-byte codeword holds the k data
 * bytes first and the n-k parity bytes after them; byte j is the coefficient of x^j, and the generator
 * roots are alpha^1 … alpha^(n-k). The functions below work on the reversed word (byte j ↔ x^(254-j)).
 */
const rev = (c) => { const r = new Uint8Array(255); for (let i = 0; i < 255; i++) r[i] = c[254 - i]; return r; };
function syndromes(F, c, nk) {
  const S = new Uint8Array(nk + 1);
  let zero = true;
  for (let i = 1; i <= nk; i++) {
    const a = F.exp[i % 255];
    let s = 0;
    for (let j = 0; j < 255; j++) s = mul(F, s, a) ^ c[j];
    S[i] = s;
    if (s) zero = false;
  }
  return zero ? null : S;
}
export function rsSyndromesZero(block, k, sys = true) { return !syndromes(sys ? RS_SYSTEM : RS_DATA, rev(block), 255 - k); }

/** Berlekamp–Massey + Chien + Forney on one 255-byte codeword (positions as in `syndromes`). */
export function rsDecodeBlock(word, k, sys = true) {
  const c = rev(word);
  const r = rsDecodeReversed(c, k, sys);
  if (r.corrected) for (let i = 0; i < 255; i++) word[i] = c[254 - i];
  return r;
}
function rsDecodeReversed(c, k, sys) {
  const F = sys ? RS_SYSTEM : RS_DATA, nk = 255 - k;
  const S = syndromes(F, c, nk);
  if (!S) return { ok: true, corrected: 0 };
  // Berlekamp–Massey
  let Lam = [1], B = [1], L = 0, m = 1, b = 1;
  for (let n = 0; n < nk; n++) {
    let d = S[n + 1];
    for (let i = 1; i <= L; i++) d ^= mul(F, Lam[i] || 0, S[n + 1 - i]);
    if (!d) { m++; continue; }
    const coef = mul(F, d, F.exp[(255 - F.log[b]) % 255]);
    const T = Lam.slice();
    const need = B.length + m;
    while (Lam.length < need) Lam.push(0);
    for (let i = 0; i < B.length; i++) Lam[i + m] ^= mul(F, coef, B[i]);
    if (2 * L <= n) { L = n + 1 - L; B = T; b = d; m = 1; } else m++;
  }
  // Chien search: position j has locator X = alpha^(254-j)
  const errs = [];
  for (let j = 0; j < 255; j++) {
    const xinv = F.exp[(255 - (254 - j)) % 255];
    let v = 0;
    for (let i = Lam.length - 1; i >= 0; i--) v = mul(F, v, xinv) ^ (Lam[i] || 0);
    if (!v) errs.push(j);
  }
  if (errs.length !== L || L > nk / 2) return { ok: false, corrected: 0 };
  // Omega = S(x) * Lambda(x) mod x^nk
  const Om = new Array(nk).fill(0);
  for (let i = 0; i < nk; i++) for (let j = 0; j <= i && j < Lam.length; j++) Om[i] ^= mul(F, Lam[j] || 0, S[i - j + 1]);
  for (const j of errs) {
    const X = F.exp[254 - j], xinv = F.exp[(255 - (254 - j)) % 255];
    let num = 0;
    for (let i = nk - 1; i >= 0; i--) num = mul(F, num, xinv) ^ Om[i];
    let den = 0;   // Lambda'(xinv)
    for (let i = 1; i < Lam.length; i += 2) den ^= mul(F, Lam[i] || 0, F.exp[(F.log[xinv] * (i - 1)) % 255]);
    if (!den) return { ok: false, corrected: 0 };
    // first consecutive root alpha^1: e = X * Omega(X^-1) / Lambda'(X^-1) … with b=1 the X factor cancels
    const e = mul(F, num, F.exp[(255 - F.log[den]) % 255]);
    void X;
    c[j] ^= e;
  }
  return syndromes(F, c, nk) ? { ok: false, corrected: 0 } : { ok: true, corrected: errs.length };
}

/** Interleaved codewords: byte i of block b at position i*blocks + b. Returns the data bytes, block after block. */
export function deinterleave(src, from, blocks, k, sys, stats) {
  const out = new Uint8Array(blocks * k);
  const cw = new Uint8Array(255);
  for (let b = 0; b < blocks; b++) {
    for (let i = 0; i < 255; i++) cw[i] = src[from + i * blocks + b];
    if (stats) {
      const r = rsDecodeBlock(cw, k, sys);
      if (!r.ok) stats.bad++; else stats.corrected += r.corrected;
    }
    out.set(cw.subarray(0, k), b * k);
  }
  return out;
}

// ---------------------------------------------------------------- 5.10 decompression
const LIT_ORDER = (() => {
  // 5.10.1: the copy order of a literal run of 1..32 bytes, as [count, source offset] blocks in output order
  const T = {
    1: [[1, 0]], 2: [[1, 1], [1, 0]], 3: [[1, 2], [1, 1], [1, 0]], 4: [[1, 0], [1, 1], [1, 2], [1, 3]],
    5: [[1, 4], [4, 0]], 6: [[1, 5], [4, 1], [1, 0]], 7: [[2, 5], [4, 1], [1, 0]], 8: [[4, 0], [4, 4]],
    9: [[1, 8], [8, 0]], 10: [[1, 9], [8, 1], [1, 0]], 11: [[2, 9], [8, 1], [1, 0]], 12: [[4, 8], [8, 0]],
    13: [[1, 12], [4, 8], [8, 0]], 14: [[1, 13], [4, 9], [8, 1], [1, 0]], 15: [[2, 13], [4, 9], [8, 1], [1, 0]],
    16: [[8, 8], [8, 0]], 17: [[8, 9], [1, 8], [8, 0]], 18: [[1, 17], [16, 1], [1, 0]], 19: [[3, 16], [16, 0]],
    20: [[4, 16], [16, 0]], 21: [[1, 20], [4, 16], [16, 0]], 22: [[2, 20], [4, 16], [16, 0]],
    23: [[3, 20], [4, 16], [16, 0]], 24: [[8, 16], [16, 0]], 25: [[8, 17], [1, 16], [16, 0]],
    26: [[1, 25], [8, 17], [1, 16], [16, 0]], 27: [[2, 25], [8, 17], [1, 16], [16, 0]],
    28: [[4, 24], [8, 16], [16, 0]], 29: [[1, 28], [4, 24], [8, 16], [16, 0]], 30: [[2, 28], [4, 24], [8, 16], [16, 0]],
    31: [[1, 30], [4, 26], [8, 18], [16, 2], [2, 0]], 32: [[16, 16], [16, 0]],
  };
  // expand each block "k [i]" with the order of the k-byte copy itself (a k-byte block is copied as entry k)
  const expand = (n) => {
    if (n === 1) return [0];
    const out = [];
    for (const [k, i] of T[n]) {
      if (k === n) { for (let j = 0; j < k; j++) out.push(i + j); continue; }
      for (const j of expand(k)) out.push(i + j);
    }
    return out;
  };
  const R = [null];
  for (let n = 1; n <= 32; n++) R.push(expand(n));
  return R;
})();
export const R21_LITERAL_ORDER = LIT_ORDER;

export function decompressR21(src, from, len, outSize) {
  const out = new Uint8Array(outSize);
  const end = from + len;
  let ip = from, op = 0;
  const litCopy = (n) => {
    while (n > 0) {
      const k = Math.min(32, n);
      const ord = LIT_ORDER[k];
      for (let j = 0; j < k && op < outSize; j++) out[op++] = src[ip + ord[j]];
      ip += k; n -= k;
    }
  };
  const litLength = (oc) => {
    let length = oc + 8;
    if (length === 0x17) {
      let n = src[ip++];
      length += n;
      if (n === 0xFF) {
        do { n = src[ip] | (src[ip + 1] << 8); ip += 2; length += n; } while (n === 0xFFFF);
      }
    }
    return length;
  };
  let length = 0, oc = src[ip];
  // Spec gap: 5.10 says "advance 2 bytes, read the length byte (3 bytes in total)"; counted after the opcode
  // byte itself it is 3 + 1: the length is the 4th byte (found by decoding the R2007 file header).
  if ((oc >> 4) === 2) { ip += 3; length = src[ip++] & 7; }
  let pending = -1;
  while (ip < end && op < outSize) {
    if (length === 0) {
      const c = pending >= 0 ? pending : src[ip++];
      pending = -1;
      length = litLength(c);
    }
    litCopy(length);
    length = 0;
    if (ip >= end) break;
    oc = src[ip++];
    let offset, count;
    // ReadInstructions (5.10.2)
    const instr = () => {
      switch (oc >> 4) {
        case 0:
          count = (oc & 0xF) + 0x13; offset = src[ip++]; oc = src[ip++];
          count += (oc >> 3) & 0x10; offset += ((oc & 0x78) << 5) + 1;
          break;
        case 1:
          count = (oc & 0xF) + 3; offset = src[ip++]; oc = src[ip++];
          offset += ((oc & 0xF8) << 5) + 1;
          break;
        case 2:
          offset = src[ip++]; offset |= (src[ip++] << 8) & 0xFF00;
          count = oc & 7;
          if (!(oc & 8)) { oc = src[ip++]; count += oc & 0xF8; }
          else { offset++; count += src[ip++] << 3; oc = src[ip++]; count += ((oc & 0xF8) << 8) + 0x100; }
          break;
        default:
          count = oc >> 4; offset = oc & 15; oc = src[ip++];
          offset += ((oc & 0xF8) << 1) + 1;
      }
    };
    instr();
    for (;;) {
      let s = op - offset;
      if (s < 0) throw new Error('R2007 LZ back-reference before the start');
      for (let i = 0; i < count && op < outSize; i++) out[op++] = out[s++];
      length = oc & 7;
      if (length !== 0 || ip >= end) break;
      oc = src[ip++];
      if ((oc >> 4) === 0) { pending = oc; break; }
      if ((oc >> 4) === 15) oc &= 15;
      instr();
    }
  }
  return out;
}

// ---------------------------------------------------------------- 5.2 / 5.3 / 5.4 container
const dv = (b) => new DataView(b.buffer, b.byteOffset, b.byteLength);
const u64 = (d, at) => Number(d.getBigUint64(at, true));
const i64 = (d, at) => Number(d.getBigInt64(at, true));

export function readR2007Container(b, version, ver) {
  const notes = [];
  const d0 = dv(b);
  const maintenance = b[0x0B];
  const codepageNum = d0.getUint16(0x13, true);
  const security = d0.getUint32(0x18, true);
  if (security & 1) notes.push('The drawing is password-protected (encrypted data); its sections cannot be read.');
  if (b.length < 0x480) throw new UnsupportedDwg('R2007 file too short');
  // 5.2 file header: 0x3D8 bytes RS (255,239) interleaved over 3 blocks
  const stats = { bad: 0, corrected: 0 };
  const hdr = deinterleave(b, 0x80, 3, 239, true, stats);
  if (stats.bad) notes.push('The R2007 file header has uncorrectable errors.');
  else if (stats.corrected) notes.push('Corrected ' + stats.corrected + ' damaged byte(s) in the file header.');
  const hd = dv(hdr);
  const comprLen = hd.getInt32(0x18, true);
  let fh;
  if (comprLen < 0) fh = hdr.slice(0x20, 0x20 - comprLen);
  else fh = decompressR21(hdr, 0x20, comprLen, 0x110);
  const f = dv(fh);
  const H = {
    pagesMapCorrection: u64(f, 0x18), pagesMapOffset: u64(f, 0x38), pagesMapId: u64(f, 0x40),
    pagesMapSizeComp: u64(f, 0x50), pagesMapSizeUncomp: u64(f, 0x58), pagesMaxId: u64(f, 0x68),
    sectionsMapSizeComp: u64(f, 0xB0), sectionsMapId: u64(f, 0xC0), sectionsMapSizeUncomp: u64(f, 0xC8),
    sectionsMapCorrection: u64(f, 0xD8),
  };
  // page map (system page)
  const pm = loadSysPage(b, 0x480 + H.pagesMapOffset, H.pagesMapSizeComp, H.pagesMapSizeUncomp, H.pagesMapCorrection, notes, 'page map');
  const pmd = dv(pm);
  const pages = new Map();
  let offset = 0;
  for (let p = 0; p + 16 <= pm.length; p += 16) {
    const size = i64(pmd, p), id = i64(pmd, p + 8);
    pages.set(Math.abs(id), { offset, size, id });
    offset += size;
  }
  const smPage = pages.get(H.sectionsMapId);
  if (!smPage) throw new UnsupportedDwg('damaged R2007 file: no section map page');
  const sm = loadSysPage(b, 0x480 + smPage.offset, H.sectionsMapSizeComp, H.sectionsMapSizeUncomp, H.sectionsMapCorrection, notes, 'section map');
  const sd = dv(sm);
  const sections = {};
  let p = 0;
  while (p + 0x40 <= sm.length) {
    const dataSize = u64(sd, p), maxSize = u64(sd, p + 8), encryption = u64(sd, p + 0x10);
    const nameLen = u64(sd, p + 0x20), encoding = u64(sd, p + 0x30), numPages = u64(sd, p + 0x38);
    p += 0x40;
    // Spec gap: 5.2 says the name takes SectionNameLength × 2 (+ 2) bytes; the length is in bytes and
    // already counts the closing NUL ("AcDb:AppInfoHistory" → 40) — found by experiment.
    let name = '';
    for (let i = 0; i + 1 < nameLen; i += 2) name += String.fromCharCode(sd.getUint16(p + i, true));
    name = name.replace(/\0+$/, '');
    p += nameLen;
    const list = [];
    for (let k = 0; k < numPages && p + 56 <= sm.length; k++) {
      list.push({ offset: u64(sd, p), size: u64(sd, p + 8), id: u64(sd, p + 16), usize: u64(sd, p + 24), csize: u64(sd, p + 32) });
      p += 56;
    }
    if (!name) continue;
    if (encryption === 1) { notes.push('Section ' + name + ' is encrypted and was skipped.'); continue; }
    try {
      sections[name] = readDataSection21(b, pages, list, dataSize, maxSize, encoding, name, notes);
    } catch (e) { notes.push('Section ' + name + ' could not be read: ' + e.message); }
  }
  return { version, ver, maintenance, codepageNum, notes, sections, objectsAbsolute: false };
}

/** 5.3 system page: RS (255,239) interleaved, data repeated `factor` times, compressed when csize < usize. */
function loadSysPage(b, at, csize, usize, factor, notes, what) {
  plausibleSize(usize, b.length); plausibleSize(csize * factor, b.length);
  const aligned = (csize + 7) & ~7;
  const blocks = Math.ceil((aligned * factor) / 239);
  if (at + blocks * 255 > b.length) throw new UnsupportedDwg('damaged R2007 file: the ' + what + ' lies past the end');
  const stats = { bad: 0, corrected: 0 };
  const data = deinterleave(b, at, blocks, 239, true, stats);
  if (stats.bad) notes.push('The ' + what + ' has uncorrectable errors.');
  if (csize < usize) return decompressR21(data, 0, csize, usize);
  return data.slice(0, usize);
}

/** 5.4 data pages: RS (255,251), interleaved when encoding == 4, compressed when csize < usize. */
function readDataSection21(b, pages, list, size, maxSize, encoding, name, notes) {
  plausibleSize(size, b.length);
  const out = new Uint8Array(size);
  let bad = 0, pos = 0;
  for (const pg of list) {
    const loc = pages.get(pg.id);
    if (!loc) { bad++; continue; }
    const at = 0x480 + loc.offset;
    const aligned = (pg.csize + 7) & ~7;
    const blocks = Math.ceil(aligned / 251);
    let data;
    if (encoding === 4) data = deinterleave(b, at, blocks, 251, false);
    else {
      data = new Uint8Array(blocks * 251);
      for (let k = 0; k < blocks; k++) data.set(b.subarray(at + k * 255, at + k * 255 + 251), k * 251);
    }
    plausibleSize(pg.usize, b.length);
    const page = pg.csize < pg.usize ? decompressR21(data, 0, pg.csize, pg.usize) : data.subarray(0, pg.usize);
    const start = pg.offset ?? pos;
    if (start + page.length > size) out.set(page.subarray(0, Math.max(0, size - start)), start);
    else out.set(page, start);
    pos = start + page.length;
  }
  if (bad) notes.push(bad + ' page' + (bad === 1 ? '' : 's') + ' of ' + name + ' could not be found.');
  return out;
}

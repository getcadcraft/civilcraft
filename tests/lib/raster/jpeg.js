/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — marker names. */
/**
 * jpeg.js — a baseline JPEG decoder for scanned drawings (0.7 LC.6), from ITU-T T.81 (the JPEG standard). DOM-free, so the Node
 * tests and every app read the same pixels. Baseline and extended-sequential Huffman files with 1 (grey) or 3 (YCbCr) components,
 * any sampling, restart intervals. Progressive, arithmetic-coded, lossless and CMYK files are refused ('progressive', 'jpeg') —
 * the browser's own decoder (createImageBitmap) reads those; apps fall back to it. The file is untrusted.
 *
 *   jpegSize(bytes) → { w, h, components, progressive } | null        isJpeg(bytes)
 *   readJpeg(bytes) → { w, h, channels: 1 | 3, data }
 */
import { refuse, checkSize, bytesOf, MAX_BYTES } from './util.js';

export const isJpeg = (b) => { b = bytesOf(b); return b.length > 4 && b[0] === 0xff && b[1] === 0xd8; };

export function jpegSize(b) {
  b = bytesOf(b);
  if (!isJpeg(b)) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const m = b[i + 1];
    if (m === 0xff) { i++; continue; }
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7) || m === 0x01) { i += 2; continue; }
    const len = (b[i + 2] << 8) | b[i + 3];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: (b[i + 5] << 8) | b[i + 6], w: (b[i + 7] << 8) | b[i + 8], components: b[i + 9], progressive: m === 0xc2 };
    if (m === 0xda || len < 2) return null;
    i += 2 + len;
  }
  return null;
}

const ZZ = new Uint8Array([0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63]);
const COS = new Float64Array(64);   // COS[x*8+u] = c(u)/2 · cos((2x+1)uπ/16)
for (let x = 0; x < 8; x++) for (let u = 0; u < 8; u++) COS[x * 8 + u] = (u === 0 ? Math.SQRT1_2 : 1) / 2 * Math.cos((2 * x + 1) * u * Math.PI / 16);

function huff(counts, symbols) {   // canonical Huffman: lookup by (length, code)
  const maxcode = new Int32Array(18).fill(-1), valptr = new Int32Array(17), mincode = new Int32Array(17);
  let code = 0, k = 0;
  for (let l = 1; l <= 16; l++) { valptr[l] = k; mincode[l] = code; code += counts[l - 1]; k += counts[l - 1]; maxcode[l] = counts[l - 1] ? code - 1 : -1; code <<= 1; }
  return { maxcode, valptr, mincode, symbols };
}

export function readJpeg(bytes) {
  const b = bytesOf(bytes);
  if (b.length > MAX_BYTES) refuse('too_big');
  if (!isJpeg(b)) refuse('not_jpeg');
  const qt = [], dc = [], ac = [];
  let frame = null, ri = 0, adobe = -1, i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m === 0xff) { i++; continue; }
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
    if (m === 0xd9) break;
    const len = (b[i + 2] << 8) | b[i + 3], seg = b.subarray(i + 4, i + 2 + len);
    if (len < 2 || i + 2 + len > b.length) refuse('damaged');
    if (m === 0xdb) {
      for (let p = 0; p < seg.length;) {
        const pq = seg[p] >> 4, tq = seg[p] & 15; p++;
        const t = new Int32Array(64);
        for (let k = 0; k < 64; k++) { t[ZZ[k]] = pq ? (seg[p] << 8) | seg[p + 1] : seg[p]; p += pq ? 2 : 1; }
        qt[tq] = t;
      }
    } else if (m === 0xc4) {
      for (let p = 0; p + 17 <= seg.length;) {
        const tc = seg[p] >> 4, th = seg[p] & 15, counts = seg.subarray(p + 1, p + 17);
        let n = 0; for (let k = 0; k < 16; k++) n += counts[k];
        const h = huff(counts, seg.subarray(p + 17, p + 17 + n));
        (tc ? ac : dc)[th] = h; p += 17 + n;
      }
    } else if (m === 0xdd) ri = (seg[0] << 8) | seg[1];
    else if (m === 0xee && seg.length >= 12 && String.fromCharCode(...seg.subarray(0, 5)) === 'Adobe') adobe = seg[11];
    else if (m === 0xc2) refuse('progressive');
    else if (m >= 0xc3 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc && m !== 0xc0 && m !== 0xc1) refuse('jpeg', 'sof' + m.toString(16));
    else if (m === 0xc0 || m === 0xc1) {
      if (seg[0] !== 8) refuse('jpeg', 'precision');
      const h = (seg[1] << 8) | seg[2], w = (seg[3] << 8) | seg[4], nc = seg[5];
      checkSize(w, h);
      if (nc !== 1 && nc !== 3) refuse('jpeg', 'components');
      const comps = [];
      for (let c = 0; c < nc; c++) comps.push({ id: seg[6 + c * 3], hs: seg[7 + c * 3] >> 4, vs: seg[7 + c * 3] & 15, tq: seg[8 + c * 3] });
      if (comps.some((c) => !c.hs || !c.vs || c.hs > 4 || c.vs > 4)) refuse('damaged');
      frame = { w, h, comps };
    } else if (m === 0xda) {
      if (!frame) refuse('damaged');
      const ns = seg[0], scan = [];
      for (let c = 0; c < ns; c++) { const cc = frame.comps.find((x) => x.id === seg[1 + c * 2]); if (!cc) refuse('damaged'); cc.td = seg[2 + c * 2] >> 4; cc.ta = seg[2 + c * 2] & 15; scan.push(cc); }
      return decodeScan(b, i + 2 + len, frame, scan, qt, dc, ac, ri, adobe);
    }
    i += 2 + len;
  }
  return refuse('damaged');
}

function decodeScan(b, pos, frame, scan, qt, dc, ac, ri, adobe) {
  const { w, h, comps } = frame;
  const hmax = Math.max(...comps.map((c) => c.hs)), vmax = Math.max(...comps.map((c) => c.vs));
  const mcuW = 8 * hmax, mcuH = 8 * vmax, mx = Math.ceil(w / mcuW), my = Math.ceil(h / mcuH);
  for (const c of comps) { c.pw = mx * c.hs * 8; c.ph = my * c.vs * 8; c.plane = new Uint8Array(c.pw * c.ph); c.pred = 0; }
  let bitBuf = 0, bitCnt = 0, p = pos, marker = 0;
  const fill = () => {
    while (bitCnt <= 24) {
      let v = 0;
      if (!marker && p < b.length) {
        v = b[p++];
        if (v === 0xff) { const n = b[p]; if (n === 0) p++; else { marker = n; p--; v = 0; } }
      }
      bitBuf = (bitBuf << 8) | v; bitCnt += 8;
    }
  };
  const bits = (n) => { if (!n) return 0; fill(); const v = (bitBuf >>> (bitCnt - n)) & ((1 << n) - 1); bitCnt -= n; return v; };
  const sym = (t) => {
    let code = 0;
    for (let l = 1; l <= 16; l++) {
      code = (code << 1) | bits(1);
      if (t.maxcode[l] >= 0 && code <= t.maxcode[l] && code >= t.mincode[l]) return t.symbols[t.valptr[l] + code - t.mincode[l]];
    }
    return refuse('damaged');
  };
  const ext = (v, n) => (n && v < (1 << (n - 1)) ? v - (1 << n) + 1 : v);
  const blk = new Float64Array(64), tmp = new Float64Array(64), coef = new Int32Array(64);
  const decodeBlock = (c, bx, by) => {
    coef.fill(0);
    const td = dc[c.td], ta = ac[c.ta], q = qt[c.tq];
    if (!td || !ta || !q) refuse('damaged');
    const s = sym(td);
    c.pred += ext(bits(s), s);
    coef[0] = c.pred * q[0];
    for (let k = 1; k < 64;) {
      const rs = sym(ta), r = rs >> 4, sz = rs & 15;
      if (!sz) { if (r === 15) { k += 16; continue; } break; }
      k += r;
      if (k > 63) break;
      coef[ZZ[k]] = ext(bits(sz), sz) * q[ZZ[k]];
      k++;
    }
    // inverse DCT, rows then columns
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { let s2 = 0; for (let u = 0; u < 8; u++) s2 += COS[x * 8 + u] * coef[y * 8 + u]; tmp[y * 8 + x] = s2; }
    for (let x = 0; x < 8; x++) for (let y = 0; y < 8; y++) { let s2 = 0; for (let v = 0; v < 8; v++) s2 += COS[y * 8 + v] * tmp[v * 8 + x]; blk[y * 8 + x] = s2; }
    const o = by * 8 * c.pw + bx * 8;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const v = Math.round(blk[y * 8 + x] + 128); c.plane[o + y * c.pw + x] = v < 0 ? 0 : v > 255 ? 255 : v; }
  };
  const single = scan.length === 1;
  let todo = single ? Math.ceil(Math.ceil(w * scan[0].hs / hmax) / 8) * Math.ceil(Math.ceil(h * scan[0].vs / vmax) / 8) : mx * my;
  const sw = single ? Math.ceil(Math.ceil(w * scan[0].hs / hmax) / 8) : 0;
  let count = 0;
  const restart = () => {
    bitBuf = 0; bitCnt = 0;
    while (p < b.length && !(b[p] === 0xff && b[p + 1] >= 0xd0 && b[p + 1] <= 0xd7)) { if (b[p] === 0xff && b[p + 1] !== 0 && b[p + 1] !== 0xff) break; p++; }
    if (p < b.length && b[p] === 0xff && b[p + 1] >= 0xd0 && b[p + 1] <= 0xd7) p += 2;
    marker = 0;
    for (const c of comps) c.pred = 0;
  };
  for (let n = 0; n < todo; n++) {
    if (ri && n > 0 && n % ri === 0) restart();
    if (single) { const c = scan[0]; decodeBlock(c, n % sw, Math.floor(n / sw)); }
    else {
      const mxi = n % mx, myi = Math.floor(n / mx);
      for (const c of scan) for (let v = 0; v < c.vs; v++) for (let hh = 0; hh < c.hs; hh++) decodeBlock(c, mxi * c.hs + hh, myi * c.vs + v);
    }
    count++;
    if (marker && marker !== 0 && !(marker >= 0xd0 && marker <= 0xd7) && bitCnt <= 0 && n < todo - 1) break;   // the data ended early: the rest stays grey
  }
  void count;
  const nc = comps.length, data = new Uint8Array(w * h * (nc === 1 ? 1 : 3));
  const up = (c, x, y) => c.plane[Math.floor(y * c.vs / vmax) * c.pw + Math.floor(x * c.hs / hmax)];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (nc === 1) { data[y * w + x] = comps[0].plane[y * comps[0].pw + x]; continue; }
    const Y = up(comps[0], x, y), cb = up(comps[1], x, y) - 128, cr = up(comps[2], x, y) - 128, o = (y * w + x) * 3;
    if (adobe === 0) { data[o] = Y; data[o + 1] = up(comps[1], x, y); data[o + 2] = up(comps[2], x, y); continue; }
    const r = Y + 1.402 * cr, g = Y - 0.344136 * cb - 0.714136 * cr, bl = Y + 1.772 * cb;
    data[o] = r < 0 ? 0 : r > 255 ? 255 : r; data[o + 1] = g < 0 ? 0 : g > 255 ? 255 : g; data[o + 2] = bl < 0 ? 0 : bl > 255 ? 255 : bl;
  }
  return { w, h, channels: nc === 1 ? 1 : 3, data };
}

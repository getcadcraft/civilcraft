/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — tag numbers and field names. */
/**
 * tiff.js — our own TIFF 6.0 reader for scanned drawings (0.7 LC.6). DOM-free; the file is untrusted. From the TIFF 6.0
 * specification (Adobe, 1992) and ITU-T T.6: baseline files, uncompressed, PackBits, LZW (with the horizontal predictor),
 * and CCITT Group 4 (the usual black-and-white scan), 1/2/4/8/16 bits, grey, palette and RGB(A), strips, several pages.
 * Tiled files, BigTIFF, JPEG-in-TIFF, planar RGB, Group 3 and CMYK are refused with a key, never guessed.
 *
 *   tiffInfo(bytes)              → { pages: [{ w, h, bits, samples, compression, dpi? }] }   (reads directories only; capped)
 *   readTiff(bytes, page = 0)    → { w, h, channels: 1 | 3, data: Uint8Array (interleaved, 8 bit), bilevel: bool, dpi?: { x, y } }
 *   isTiff(bytes)                → true when the header says II*\0 or MM\0*
 */
import { MAX_BYTES, MAX_PAGES, refuse, checkSize, bytesOf } from './util.js';
import { decodeG4 } from './ccitt.js';

export function isTiff(b) {
  b = bytesOf(b);
  return b.length > 8 && ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 42 && b[3] === 0) || (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0 && b[3] === 42));
}

const TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8, 16: 8 };

function directories(b) {
  if (b.length > MAX_BYTES) refuse('too_big');
  if (!isTiff(b)) refuse('not_tiff');
  const le = b[0] === 0x49, dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const u16 = (o) => dv.getUint16(o, le), u32 = (o) => dv.getUint32(o, le);
  let off = u32(4);
  const out = [], seen = new Set();
  while (off && out.length < MAX_PAGES) {
    if (seen.has(off) || off + 2 > b.length) break;   // a loop, or a directory outside the file
    seen.add(off);
    const n = u16(off);
    if (n > 4096 || off + 2 + n * 12 + 4 > b.length) refuse('damaged');
    const tags = new Map();
    for (let i = 0; i < n; i++) {
      const e = off + 2 + i * 12, tag = u16(e), type = u16(e + 2), count = u32(e + 4), size = (TYPE_SIZE[type] || 0) * count;
      if (!TYPE_SIZE[type] || count > 1e8) continue;
      let at = e + 8;
      if (size > 4) { at = u32(e + 8); if (at + size > b.length) refuse('damaged'); }
      const vals = [];
      const cap = Math.min(count, 1 << 20);
      for (let k = 0; k < cap; k++) {
        const p = at + k * TYPE_SIZE[type];
        vals.push(type === 3 ? u16(p) : type === 4 || type === 13 ? u32(p) : type === 1 || type === 7 ? b[p] : type === 5 ? u32(p) / (u32(p + 4) || 1) : type === 8 ? dv.getInt16(p, le) : type === 9 ? dv.getInt32(p, le) : u32(p));
      }
      tags.set(tag, vals);
    }
    out.push(tags);
    off = u32(off + 2 + n * 12);
  }
  if (!out.length) refuse('damaged');
  return { dirs: out, le };
}

const one = (tags, k, d) => (tags.has(k) && tags.get(k).length ? tags.get(k)[0] : d);

function describe(t) {
  const w = one(t, 256, 0), h = one(t, 257, 0), bits = (t.get(258) || [1])[0], samples = one(t, 277, 1), comp = one(t, 259, 1);
  const unit = one(t, 296, 2), xr = one(t, 282, 0), yr = one(t, 283, 0);
  const dpi = xr > 0 && yr > 0 && unit !== 1 ? { x: unit === 3 ? xr * 2.54 : xr, y: unit === 3 ? yr * 2.54 : yr } : null;
  return { w, h, bits, samples, compression: comp, photometric: one(t, 262, 1), ...(dpi ? { dpi } : {}) };
}

export function tiffInfo(bytes) {
  const { dirs } = directories(bytesOf(bytes));
  return { pages: dirs.map(describe) };
}

function packBits(src, out, outLen) {
  let i = 0, o = 0;
  while (i < src.length && o < outLen) {
    const n = (src[i++] << 24) >> 24;
    if (n >= 0) { const c = Math.min(n + 1, src.length - i, outLen - o); out.set(src.subarray(i, i + c), o); i += n + 1; o += c; }
    else if (n !== -128) { const c = Math.min(1 - n, outLen - o); out.fill(src[i++] ?? 0, o, o + c); o += c; }
  }
  return o;
}

/** TIFF LZW (MSB first, "early change" at 511/1023/2047). Output is capped at outLen. */
const LZ_PFX = new Int32Array(4096), LZ_SFX = new Uint8Array(4096), LZ_LEN = new Int32Array(4096);
function lzw(src, out, outLen) {
  let bits = 0, nb = 0, ip = 0, o = 0, next = 258, width = 9, prev = -1;
  for (let i = 0; i < 256; i++) { LZ_PFX[i] = -1; LZ_SFX[i] = i; LZ_LEN[i] = 1; }
  while (o < outLen) {
    while (nb < width && ip < src.length) { bits = (bits << 8) | src[ip++]; nb += 8; if (nb > 24) { /* keep within 32 bits */ } }
    if (nb < width) break;
    const code = (bits >>> (nb - width)) & ((1 << width) - 1);
    nb -= width; bits &= (1 << nb) - 1;
    if (code === 257) break;
    if (code === 256) { next = 258; width = 9; prev = -1; continue; }
    let entry = code;
    if (code >= next) {
      if (prev < 0 || code > next) refuse('damaged');   // a code that was never defined
      entry = prev;
    }
    // write the string of `entry` (length LZ_LEN) backwards, then (for the new-code case) its first byte again
    const len = LZ_LEN[entry], extra = code >= next ? 1 : 0, total = len + extra;
    if (o + total > outLen) { const room = outLen - o; if (room <= 0) break; }
    let p = o + len - 1, c = entry;
    while (c >= 0 && p >= o) { if (p < outLen) out[p] = LZ_SFX[c]; p--; c = LZ_PFX[c]; }
    const first = out[o];
    if (extra && o + len < outLen) out[o + len] = first;
    if (prev >= 0 && next < 4096) { LZ_PFX[next] = prev; LZ_SFX[next] = first; LZ_LEN[next] = LZ_LEN[prev] + 1; next++; }
    o += total;
    prev = code >= next && !extra ? prev : code;
    if (extra) prev = next - 1;
    if (next >= 4095) width = 12; else if (next >= 2047) width = 12; else if (next >= 1023) width = 11; else if (next >= 511) width = 10; else width = 9;
  }
  return Math.min(o, outLen);
}

export function readTiff(bytes, page = 0) {
  const b = bytesOf(bytes);
  const { dirs, le } = directories(b);
  const t = dirs[page];
  if (!t) refuse('page', String(page));
  const d = describe(t), { w, h, bits, samples, compression, photometric } = d;
  checkSize(w, h);
  if (t.has(322) || t.has(324)) refuse('tiled');
  if (one(t, 284, 1) !== 1 && samples > 1) refuse('planar');
  if (![1, 2, 4, 8, 16].includes(bits)) refuse('bits', String(bits));
  if (![1, 2, 3, 4].includes(samples)) refuse('samples', String(samples));
  if (![0, 1, 2, 3].includes(photometric)) refuse('photometric', String(photometric));
  if (![1, 4, 5, 32773, 8, 32946].includes(compression)) refuse('compression', String(compression));
  if (compression === 8 || compression === 32946) refuse('compression', 'deflate');
  if (compression === 4 && (bits !== 1 || samples !== 1)) refuse('compression', 'g4');
  if (photometric === 3 && samples !== 1) refuse('photometric', 'palette');
  const rps = Math.max(1, Math.min(h, one(t, 278, h) || h));
  const offsets = t.get(273), counts = t.get(279);
  if (!offsets || !offsets.length) refuse('damaged');
  const rowBytes = Math.ceil((w * samples * bits) / 8);
  const need = Math.ceil(h / rps);
  if (offsets.length < need) refuse('damaged');
  const predictor = one(t, 317, 1), fill = one(t, 266, 1);
  const g4 = compression === 4 ? new Uint8Array(w * h) : null;
  const raw = new Uint8Array(compression === 4 ? 0 : rowBytes * h);   // the decoded rows, packed as the file has them
  let row = 0;
  for (let s = 0; s < need; s++) {
    const rows = Math.min(rps, h - s * rps);
    const start = offsets[s], len = counts?.[s] ?? Math.max(0, b.length - start);
    if (start > b.length || start + len > b.length) { if (start >= b.length) break; }
    let src = b.subarray(start, Math.min(b.length, start + len));
    if (fill === 2) { src = src.slice(); for (let i = 0; i < src.length; i++) { let v = src[i], r = 0; for (let k = 0; k < 8; k++) { r = (r << 1) | (v & 1); v >>= 1; } src[i] = r; } }
    const out = compression === 4 ? null : raw.subarray(row * rowBytes, (row + rows) * rowBytes);
    if (compression === 1) out.set(src.subarray(0, out.length));
    else if (compression === 32773) packBits(src, out, out.length);
    else if (compression === 5) lzw(src, out, out.length);
    else if (compression === 4) {   // coded black = a 1 bit, whatever the photometric says (as libtiff reads it): WhiteIsZero → black, BlackIsZero → white
      const g = decodeG4(src, w, rows);
      g4.set(g.data, row * w);
    }
    if (predictor === 2 && bits === 8 && compression !== 4) {
      for (let y = 0; y < rows; y++) { const o = y * rowBytes; for (let x = samples; x < rowBytes; x++) out[o + x] = (out[o + x] + out[o + x - samples]) & 0xff; }
    } else if (predictor === 2 && bits === 16) {
      for (let y = 0; y < rows; y++) {
        const o = y * rowBytes;
        for (let x = samples; x < w * samples; x++) {
          const p = o + x * 2, q = p - samples * 2;
          const a = le ? out[p] | (out[p + 1] << 8) : (out[p] << 8) | out[p + 1], c = le ? out[q] | (out[q + 1] << 8) : (out[q] << 8) | out[q + 1], v = (a + c) & 0xffff;
          if (le) { out[p] = v & 255; out[p + 1] = v >> 8; } else { out[p] = v >> 8; out[p + 1] = v & 255; }
        }
      }
    } else if (predictor !== 1 && compression !== 4) refuse('predictor', String(predictor));
    row += rows;
  }
  if (compression === 4) {
    const data = new Uint8Array(w * h);
    for (let i = 0; i < data.length; i++) data[i] = (g4[i] === 1) === (photometric === 0) ? 0 : 255;
    return { w, h, channels: 1, data, bilevel: true, ...(d.dpi ? { dpi: d.dpi } : {}) };
  }
  // to 8-bit interleaved: grey (1) or RGB (3); alpha dropped
  const cm = t.get(320);
  const rgb = photometric === 2 || (photometric === 3 && cm);
  const channels = rgb ? 3 : 1;
  const data = new Uint8Array(w * h * channels);
  const maxv = (1 << Math.min(bits, 8)) - 1;
  const sample = (y, x, c) => {   // sample c of pixel x in row y, scaled to 0–255
    const o = y * rowBytes;
    if (bits === 8) return raw[o + x * samples + c];
    if (bits === 16) return raw[o + (x * samples + c) * 2 + (le ? 1 : 0)];
    const bitPos = (x * samples + c) * bits;
    return (raw[o + (bitPos >> 3)] >> (8 - bits - (bitPos & 7))) & maxv;
  };
  const scale = bits === 8 || bits === 16 ? 1 : 255 / maxv;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (photometric === 3 && cm) {
        const idx = sample(y, x, 0), n = 1 << bits;
        const o = (y * w + x) * 3;
        data[o] = (cm[idx] ?? 0) >> 8; data[o + 1] = (cm[n + idx] ?? 0) >> 8; data[o + 2] = (cm[2 * n + idx] ?? 0) >> 8;
      } else if (rgb) {
        const o = (y * w + x) * 3;
        data[o] = sample(y, x, 0); data[o + 1] = sample(y, x, 1); data[o + 2] = sample(y, x, 2);
      } else {
        let v = Math.round(sample(y, x, 0) * scale);
        if (photometric === 0) v = 255 - v;
        data[y * w + x] = v;
      }
    }
  }
  return { w, h, channels, data, bilevel: bits === 1 && samples === 1, ...(d.dpi ? { dpi: d.dpi } : {}) };
}

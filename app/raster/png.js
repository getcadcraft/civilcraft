/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — chunk names. */
/**
 * png.js — PNG reading and writing for scanned drawings (0.7 LC.6), from the PNG specification (W3C, 2nd edition). DOM-free;
 * zlib goes through the platform's CompressionStream / DecompressionStream (browsers and Node). The file is untrusted.
 *
 *   isPng(bytes) · pngSize(bytes) → { w, h } | null
 *   await readPng(bytes)   → { w, h, channels: 1 | 3, data (8-bit, interleaved), bilevel, dpi? }   1, 2, 4, 8 and 16 bits, grey,
 *                            palette and RGB (+ alpha, composited on white); interlaced files are refused ('interlaced')
 *   await writePng({ w, h, channels, data }, { dpi? }) → Uint8Array   8-bit grey or RGB, filter per row (None / Sub / Up / best of)
 */
import { refuse, checkSize, bytesOf, MAX_BYTES } from './util.js';

const SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
export function isPng(b) { b = bytesOf(b); return b.length > 24 && SIG.every((v, i) => b[i] === v); }
export function pngSize(b) {
  b = bytesOf(b);
  if (!isPng(b)) return null;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength), w = dv.getUint32(16), h = dv.getUint32(20);
  return w > 0 && h > 0 ? { w, h } : null;
}

async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
const inflate = (b) => pipe(b, new DecompressionStream('deflate'));
const deflate = (b) => pipe(b, new CompressionStream('deflate'));

let CRC = null;
function crc32(b, init = 0xffffffff) {
  if (!CRC) { CRC = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c >>> 0; } }
  let c = init;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8);
  return c;
}

export async function readPng(bytes) {
  const b = bytesOf(bytes);
  if (b.length > MAX_BYTES) refuse('too_big');
  if (!isPng(b)) refuse('not_png');
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let i = 8, w = 0, h = 0, depth = 0, ct = 0, inter = 0, pal = null, trns = null, dpi = null;
  const idat = [];
  while (i + 12 <= b.length) {
    const len = dv.getUint32(i), type = String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]);
    if (i + 12 + len > b.length) refuse('damaged');
    const d = b.subarray(i + 8, i + 8 + len);
    if (type === 'IHDR') { w = dv.getUint32(i + 8); h = dv.getUint32(i + 12); depth = d[8]; ct = d[9]; inter = d[12]; }
    else if (type === 'PLTE') pal = d;
    else if (type === 'tRNS') trns = d;
    else if (type === 'pHYs' && len >= 9 && d[8] === 1) { const x = dv.getUint32(i + 8), y = dv.getUint32(i + 12); if (x && y) dpi = { x: x * 0.0254, y: y * 0.0254 }; }
    else if (type === 'IDAT') idat.push(d);
    else if (type === 'IEND') break;
    i += 12 + len;
  }
  checkSize(w, h);
  if (inter) refuse('interlaced');
  const okDepth = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] }[ct];
  if (!okDepth || !okDepth.includes(depth)) refuse('format', 'ct' + ct + ' depth' + depth);
  const chans = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ct], bitsPP = chans * depth, bpp = Math.max(1, bitsPP >> 3), stride = (w * bitsPP + 7) >> 3;
  let n = 0;
  for (const c of idat) n += c.length;
  const z = new Uint8Array(n);
  for (let k = 0, at = 0; k < idat.length; at += idat[k].length, k++) z.set(idat[k], at);
  let raw;
  try { raw = await inflate(z); } catch { refuse('damaged'); }
  if (raw.length < h * (stride + 1)) refuse('damaged');
  const px = new Uint8Array(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), out = px.subarray(y * stride, (y + 1) * stride);
    const up = y ? px.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[x - bpp] : 0, u = up ? up[x] : 0, c = up && x >= bpp ? up[x - bpp] : 0;
      let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += u; else if (f === 3) v += (a + u) >> 1;
      else if (f === 4) { const p = a + u - c, pa = Math.abs(p - a), pb = Math.abs(p - u), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? u : c; }
      else if (f !== 0) refuse('damaged');
      out[x] = v & 255;
    }
  }
  const colour = ct === 2 || ct === 6 || (ct === 3 && pal && Array.from(pal.subarray(0, Math.min(pal.length, 768))).some((v, k, arr) => k % 3 && v !== arr[k - (k % 3)]));
  const channels = colour ? 3 : 1;
  const data = new Uint8Array(w * h * channels);
  const maxv = (1 << Math.min(depth, 8)) - 1, step = depth === 16 ? 2 : 1;
  const get = (y, x, c) => {
    if (depth >= 8) return px[y * stride + (x * chans + c) * step];
    const bit = x * depth;
    return (px[y * stride + (bit >> 3)] >> (8 - depth - (bit & 7))) & maxv;
  };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let r, g, bl, a = 255;
    if (ct === 3) {
      const ix = get(y, x, 0);
      r = pal?.[ix * 3] ?? 0; g = pal?.[ix * 3 + 1] ?? 0; bl = pal?.[ix * 3 + 2] ?? 0;
      if (trns && ix < trns.length) a = trns[ix];
    } else if (ct === 0 || ct === 4) {
      r = g = bl = depth < 8 ? Math.round(get(y, x, 0) * 255 / maxv) : get(y, x, 0);
      if (ct === 4) a = get(y, x, 1);
    } else { r = get(y, x, 0); g = get(y, x, 1); bl = get(y, x, 2); if (ct === 6) a = get(y, x, 3); }
    if (a < 255) { r = (r * a + 255 * (255 - a)) / 255; g = (g * a + 255 * (255 - a)) / 255; bl = (bl * a + 255 * (255 - a)) / 255; }
    if (channels === 3) { const o = (y * w + x) * 3; data[o] = r; data[o + 1] = g; data[o + 2] = bl; }
    else data[y * w + x] = r;
  }
  return { w, h, channels, data, bilevel: depth === 1 && (ct === 0 || ct === 3), ...(dpi ? { dpi } : {}) };
}

function chunk(type, body) {
  const out = new Uint8Array(12 + body.length), dv = new DataView(out.buffer);
  dv.setUint32(0, body.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(body, 8);
  const c = crc32(out.subarray(4, 8 + body.length));
  dv.setUint32(8 + body.length, (c ^ 0xffffffff) >>> 0);
  return out;
}

export async function writePng({ w, h, channels = 1, data }, { dpi = null } = {}) {
  checkSize(w, h, channels);
  if (![1, 3].includes(channels) || data.length < w * h * channels) refuse('format');
  const stride = w * channels, raw = new Uint8Array(h * (stride + 1)), best = new Uint8Array(stride), tmp = new Uint8Array(stride);
  for (let y = 0; y < h; y++) {
    const row = data.subarray(y * stride, (y + 1) * stride), up = y ? data.subarray((y - 1) * stride, y * stride) : null;
    // pick the filter with the smallest sum of absolute differences: None, Sub, Up
    let bestF = 0, bestScore = Infinity;
    for (let f = 0; f < 3; f++) {
      if (f === 2 && !up) continue;
      let sc = 0;
      for (let x = 0; x < stride; x++) {
        const v = f === 0 ? row[x] : f === 1 ? (row[x] - (x >= channels ? row[x - channels] : 0)) & 255 : (row[x] - up[x]) & 255;
        tmp[x] = v; sc += v < 128 ? v : 256 - v;
      }
      if (sc < bestScore) { bestScore = sc; bestF = f; best.set(tmp); }
    }
    raw[y * (stride + 1)] = bestF;
    raw.set(best, y * (stride + 1) + 1);
  }
  const ihdr = new Uint8Array(13), dv = new DataView(ihdr.buffer);
  dv.setUint32(0, w); dv.setUint32(4, h); ihdr[8] = 8; ihdr[9] = channels === 1 ? 0 : 2;
  const parts = [new Uint8Array(SIG), chunk('IHDR', ihdr)];
  if (dpi && dpi.x > 0 && dpi.y > 0) { const p = new Uint8Array(9), pv = new DataView(p.buffer); pv.setUint32(0, Math.round(dpi.x / 0.0254)); pv.setUint32(4, Math.round(dpi.y / 0.0254)); p[8] = 1; parts.push(chunk('pHYs', p)); }
  parts.push(chunk('IDAT', await deflate(raw)), chunk('IEND', new Uint8Array(0)));
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

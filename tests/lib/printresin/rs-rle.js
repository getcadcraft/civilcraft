/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-rle.js — how a sliced resin layer is held in memory (roadmap RSN.1). A layer is a w × h picture of one byte a pixel (0 = dark, 255 = full light);
 * most of it is one value, so it is kept as runs and a plate of thousands of layers fits. No DOM, imports nothing.
 *
 *   encodeLayer(gray: Uint8Array, w, h, span?) → Uint8Array     (span: [first row, one past the last] that can be lit, as rasterize leaves on its answer as `.span`; rows outside are taken as dark) runs of (value, length) with the length as a LEB128 number, rows not broken
 *   decodeLayer(runs, w, h) → Uint8Array(w * h)          the picture again; throws when the runs do not fill exactly w × h
 *   Sliced (what rs-slice.js answers and every format writer takes):
 *     { w, h, layerHeight, count, layer(i) → Uint8Array(w * h), mm: [x, y], stats }   i from 0 (the bottom); layer(i) decodes on demand
 */
export function encodeLayer(gray, w, h, span = gray.span) {
  const n = w * h;
  if (gray.length !== n) throw new Error('layer size');
  const out = [];
  const put = (v, run) => { out.push(v); while (run >= 0x80) { out.push((run & 0x7f) | 0x80); run >>>= 7; } out.push(run); };
  // span = [first row, one past the last] that can hold light (rasterize says so); the rows around it are dark and are written as one run each
  const s0 = span ? Math.max(0, Math.min(h, span[0])) * w : 0, e0 = span ? Math.max(s0 / w, Math.min(h, span[1])) * w : n;
  if (s0 > 0) put(0, s0);
  const words = gray.byteOffset % 4 === 0 ? new Uint32Array(gray.buffer, gray.byteOffset, n >> 2) : null;
  let i = s0;
  while (i < e0) {
    const v = gray[i];
    let j = i + 1;
    if (words) {   // a long run is crossed four pixels at a time
      while (j < e0 && (j & 3) && gray[j] === v) j++;
      if (!(j & 3)) { const pat = (v * 0x01010101) >>> 0; while (j + 4 <= e0 && words[j >> 2] === pat) j += 4; }
    }
    while (j < e0 && gray[j] === v) j++;
    put(v, j - i);
    i = j;
  }
  if (e0 < n) put(0, n - e0);
  return Uint8Array.from(out);
}

export function decodeLayer(runs, w, h) {
  const n = w * h, gray = new Uint8Array(n);
  let at = 0, o = 0;
  while (at < runs.length) {
    const v = runs[at++];
    let run = 0, shift = 0, b;
    do { b = runs[at++]; run |= (b & 0x7f) << shift; shift += 7; } while (b & 0x80);
    if (o + run > n) throw new Error('layer runs overflow');
    if (v) gray.fill(v, o, o + run);
    o += run;
  }
  if (o !== n) throw new Error('layer runs short');
  return gray;
}

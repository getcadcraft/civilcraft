/* SPDX-License-Identifier: Apache-2.0 */
/**
 * laser-image.js — pictures for engraving (0.7 SU.772, session `make-07`): resample a grey picture to the engraving grid and turn
 * it into burn levels. DOM-free, import-free. A picture is grey values, 0 = black … 255 = white, row 0 at the top, `pw × ph`
 * pixels; the apps make it from a bitmap (a canvas, an image file) before the job is planned.
 *
 *   resample(gray, pw, ph, cols, rows) → Float32Array(cols × rows)   area average when shrinking, nearest when growing
 *   dither(values, cols, rows, { method, threshold, gamma, invert, levels }) → Uint8Array(cols × rows) of burn levels,
 *       0 = no burn … 255 = the layer's full power; row 0 is the top row
 *     methods: 'threshold' (burn where lighter-corrected grey < threshold), 'floyd' (Floyd–Steinberg error diffusion, rows
 *       alternate direction), 'atkinson' (diffuses 3/4 of the error: lighter, crisper), 'bayer' (ordered, 4 × 4 matrix),
 *       'gray' (variable power in `levels` steps, 2–256)
 *     gamma: grey = (value / 255)^gamma before the method (above 1 darkens, below 1 lightens); invert burns the light parts
 *   runs(levels, cols, rows, row) → [[c0, c1, level]] the runs of equal level along one row (c1 exclusive), zeros included
 */
export const DITHERS = ['threshold', 'floyd', 'atkinson', 'bayer', 'gray'];

export function resample(gray, pw, ph, cols, rows) {
  const out = new Float32Array(cols * rows);
  if (!(pw > 0 && ph > 0 && cols > 0 && rows > 0)) return out;
  const sx = pw / cols, sy = ph / rows;
  for (let r = 0; r < rows; r++) {
    const y0 = r * sy, y1 = (r + 1) * sy;
    for (let c = 0; c < cols; c++) {
      const x0 = c * sx, x1 = (c + 1) * sx;
      if (sx <= 1 && sy <= 1) { out[r * cols + c] = gray[Math.min(ph - 1, Math.floor((y0 + y1) / 2)) * pw + Math.min(pw - 1, Math.floor((x0 + x1) / 2))]; continue; }
      let sum = 0, wsum = 0;
      for (let j = Math.floor(y0); j < Math.min(ph, Math.ceil(y1)); j++) {
        const wy = Math.min(y1, j + 1) - Math.max(y0, j);
        for (let i = Math.floor(x0); i < Math.min(pw, Math.ceil(x1)); i++) {
          const w = wy * (Math.min(x1, i + 1) - Math.max(x0, i));
          sum += w * gray[j * pw + i]; wsum += w;
        }
      }
      out[r * cols + c] = wsum > 0 ? sum / wsum : 255;
    }
  }
  return out;
}

const BAYER4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

export function dither(values, cols, rows, { method = 'floyd', threshold = 128, gamma = 1, invert = false, levels = 16 } = {}) {
  const out = new Uint8Array(cols * rows);
  const g = Number.isFinite(gamma) && gamma > 0 ? gamma : 1;
  // darkness 0 (white) … 1 (black), after gamma and invert
  const dark = new Float64Array(cols * rows);
  for (let i = 0; i < dark.length; i++) {
    let l = Math.max(0, Math.min(1, values[i] / 255));
    if (invert) l = 1 - l;
    dark[i] = 1 - Math.pow(l, g);
  }
  if (method === 'threshold') {
    const t = 1 - Math.max(0, Math.min(255, threshold)) / 255;        // burn when the darkness exceeds this
    for (let i = 0; i < dark.length; i++) out[i] = dark[i] > t ? 255 : 0;
  } else if (method === 'bayer') {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out[r * cols + c] = dark[r * cols + c] > (BAYER4[r % 4][c % 4] + 0.5) / 16 ? 255 : 0;
  } else if (method === 'gray') {
    const n = Math.max(2, Math.min(256, Math.floor(levels) || 16));
    for (let i = 0; i < dark.length; i++) out[i] = Math.round(Math.round(dark[i] * (n - 1)) / (n - 1) * 255);
  } else {                                                              // 'floyd' or 'atkinson'
    const atk = method === 'atkinson';
    const e = Float64Array.from(dark);
    for (let r = 0; r < rows; r++) {
      const fwd = r % 2 === 0, d = fwd ? 1 : -1;
      for (let k = 0; k < cols; k++) {
        const c = fwd ? k : cols - 1 - k, i = r * cols + c;
        const v = e[i], o = v >= 0.5 ? 1 : 0;
        out[i] = o ? 255 : 0;
        const err = v - o;
        const add = (dc, dr, w) => { const cc = c + dc, rr = r + dr; if (cc >= 0 && cc < cols && rr < rows) e[rr * cols + cc] += err * w; };
        if (atk) { for (const [dc, dr] of [[d, 0], [2 * d, 0], [-d, 1], [0, 1], [d, 1], [0, 2]]) add(dc, dr, 1 / 8); }
        else { add(d, 0, 7 / 16); add(-d, 1, 3 / 16); add(0, 1, 5 / 16); add(d, 1, 1 / 16); }
      }
    }
  }
  return out;
}

export function runs(levels, cols, rows, row) {
  const out = [];
  const o = row * cols;
  let c0 = 0;
  for (let c = 1; c <= cols; c++) if (c === cols || levels[o + c] !== levels[o + c0]) { out.push([c0, c, levels[o + c0]]); c0 = c; }
  return out;
}

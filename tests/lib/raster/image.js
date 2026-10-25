/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — option names and data fields. */
/**
 * image.js — scan clean-up for scanned drawings (0.7 LC.6): grey, threshold to black and white, despeckle, deskew, crop, erase.
 * DOM-free, plain typed arrays, classic image processing only (no learning, nothing sent anywhere). Hot loops allocate nothing:
 * scratch comes from a `Workspace` that is reused between calls.
 *
 * A grey picture is { w, h, data: Uint8Array } (0 black … 255 paper). A bitmap is { w, h, data: Uint8Array } with 1 = ink, 0 = paper.
 * Pixel (x, y) has its top-left corner at (x, y) and its centre at (x + .5, y + .5); y runs down.
 *
 *   toGrey(img)                         → grey      (img = { w, h, channels, data })
 *   otsu(grey)                          → level 0–255 (ink = darker than the level)
 *   flatten(grey, { window }, ws)      → grey      the paper evened out (each pixel over the local mean)
 *   threshold(grey, { mode: 'auto' | 'otsu' | 'adaptive' | 'level', level, window, k }, ws) → bitmap   auto = flatten, then Otsu
 *                                         (the default); adaptive = Sauvola; otsu = one level for the whole sheet
 *   despeckle(bitmap, { maxArea }, ws)  → { removed, kept }   in place: ink pieces of at most maxArea pixels (8-connected) go
 *   findSkew(bitmap, { maxDeg }, ws)    → { deg, confidence, points }   the angle the sheet's long lines lie at (anticlockwise on
 *                                         screen, + = lines rise to the right); rotating by −deg squares them
 *   rotateGrey(grey, deg, { fill }, ws) → grey  same size, bilinear, about the middle; `deg` anticlockwise on screen
 *   rotateBitmap(bm, deg, ws)           → bitmap (rotated as grey, then cut at half)
 *   crop(img, x0, y0, x1, y1)           → the same kind of picture, the pixels [x0, x1) × [y0, y1)
 *   paintPolygon / paintRect(img, …, value) → pixels changed   (a picture of 1 or 3 channels; erase = paint 255)
 *   rotateImage(img, deg)               → the picture turned, each channel on its own
 *   eraseRect / erasePolygon(bm, pts, { paper = 0 })  → the number of pixels changed (even-odd polygon fill; a lasso is a polygon)
 *   bitmapToGrey(bm) · greyToBitmap(grey, level)
 */
import { Workspace, refuse, checkSize } from './util.js';

const DEFAULT_WS = new Workspace();

export function toGrey(img) {
  const { w, h, channels, data } = img;
  if (channels === 1) return { w, h, data };
  const g = new Uint8Array(w * h);
  for (let i = 0, o = 0; i < g.length; i++, o += 3) g[i] = (data[o] * 77 + data[o + 1] * 151 + data[o + 2] * 28) >> 8;
  return { w, h, data: g };
}

export function otsu(grey) {
  const hist = new Float64Array(256), d = grey.data;
  for (let i = 0; i < d.length; i++) hist[d[i]]++;
  const total = d.length;
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];
  let wB = 0, sumB = 0, best = 0, level = 127;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB, mF = (sum - sumB) / wF, between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best) { best = between; level = t; }
  }
  return level;   // ink: value <= level
}

/**
 * Even out the paper: each pixel is divided by the local mean of a large window (about 1/10 of the short side), so a
 * gradient or a shadow no longer changes where the ink is. → a new grey picture (paper ≈ 235, ink stays dark).
 */
export function flatten(grey, { window = 0 } = {}, ws = DEFAULT_WS) {
  const { w, h, data } = grey;
  checkSize(w, h);
  const r = Math.max(15, (window > 0 ? window : Math.round(Math.min(w, h) / 10)) >> 1), W1 = w + 1;
  const I = ws.f64('thrI', W1 * (h + 1));
  I.fill(0, 0, W1);
  for (let y = 0; y < h; y++) {
    let s = 0;
    I[(y + 1) * W1] = 0;
    for (let x = 0; x < w; x++) { s += data[y * w + x]; I[(y + 1) * W1 + x + 1] = I[y * W1 + x + 1] + s; }
  }
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1), n = (x1 - x0) * (y1 - y0);
      const mean = (I[y1 * W1 + x1] - I[y0 * W1 + x1] - I[y1 * W1 + x0] + I[y0 * W1 + x0]) / n;
      const v = data[y * w + x] * 235 / Math.max(40, mean);
      out[y * w + x] = v > 255 ? 255 : v;
    }
  }
  return { w, h, data: out };
}

export function threshold(grey, { mode = 'auto', level = 128, window = 0, k = 0.2 } = {}, ws = DEFAULT_WS) {
  const { w, h, data } = grey;
  checkSize(w, h);
  const out = new Uint8Array(w * h);
  if (mode === 'level') { for (let i = 0; i < out.length; i++) out[i] = data[i] <= level ? 1 : 0; return { w, h, data: out }; }
  if (mode === 'auto') { const f = flatten(grey, { window }, ws), t = otsu(f), o = new Uint8Array(w * h); for (let i = 0; i < o.length; i++) o[i] = f.data[i] <= t ? 1 : 0; return { w, h, data: o }; }
  if (mode === 'otsu') { const t = otsu(grey); for (let i = 0; i < out.length; i++) out[i] = data[i] <= t ? 1 : 0; return { w, h, data: out }; }
  // Sauvola: local mean and deviation from integral images; the window is odd, about 1/16 of the short side by default
  const r = Math.max(7, (window > 0 ? window : Math.round(Math.min(w, h) / 16)) >> 1);
  const W1 = w + 1;
  const I = ws.f64('thrI', W1 * (h + 1)), I2 = ws.f64('thrI2', W1 * (h + 1));
  I.fill(0, 0, W1); I2.fill(0, 0, W1);
  for (let y = 0; y < h; y++) {
    let s = 0, s2 = 0;
    I[(y + 1) * W1] = 0; I2[(y + 1) * W1] = 0;
    for (let x = 0; x < w; x++) { const v = data[y * w + x]; s += v; s2 += v * v; I[(y + 1) * W1 + x + 1] = I[y * W1 + x + 1] + s; I2[(y + 1) * W1 + x + 1] = I2[y * W1 + x + 1] + s2; }
  }
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1), n = (x1 - x0) * (y1 - y0);
      const sum = I[y1 * W1 + x1] - I[y0 * W1 + x1] - I[y1 * W1 + x0] + I[y0 * W1 + x0];
      const sum2 = I2[y1 * W1 + x1] - I2[y0 * W1 + x1] - I2[y1 * W1 + x0] + I2[y0 * W1 + x0];
      const mean = sum / n, sd = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
      out[y * w + x] = data[y * w + x] <= mean * (1 + k * (sd / 128 - 1)) ? 1 : 0;
    }
  }
  return { w, h, data: out };
}

export const bitmapToGrey = (bm) => { const g = new Uint8Array(bm.w * bm.h); for (let i = 0; i < g.length; i++) g[i] = bm.data[i] ? 0 : 255; return { w: bm.w, h: bm.h, data: g }; };
export const greyToBitmap = (grey, level = 128) => { const b = new Uint8Array(grey.w * grey.h); for (let i = 0; i < b.length; i++) b[i] = grey.data[i] <= level ? 1 : 0; return { w: grey.w, h: grey.h, data: b }; };

/**
 * Label the 8-connected ink pieces of a bitmap: fills `label` (Int32, 0 = paper, 1… = piece) and returns the count; per-piece
 * bounding boxes and areas go to the `info` arrays (Int32, 5 per piece: area, x0, y0, x1, y1 with 1-based index − 1).
 */
export function label(bm, ws = DEFAULT_WS) {
  const { w, h, data } = bm, n = w * h;
  const lab = ws.i32('lab', n, 0), stack = ws.i32('labStack', n);
  let count = 0, info = ws.i32('labInfo', 5 * 1024);
  for (let s = 0; s < n; s++) {
    if (!data[s] || lab[s]) continue;
    count++;
    if (count * 5 > info.length) { const g = new Int32Array(info.length * 2); g.set(info); info = g; ws.m.set('labInfo', g); }
    let sp = 0, area = 0, x0 = w, y0 = h, x1 = 0, y1 = 0;
    stack[sp++] = s; lab[s] = count;
    while (sp) {
      const p = stack[--sp], x = p % w, y = (p - x) / w;
      area++;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w || (!dx && !dy)) continue;
          const q = yy * w + xx;
          if (data[q] && !lab[q]) { lab[q] = count; stack[sp++] = q; }
        }
      }
    }
    const o = (count - 1) * 5;
    info[o] = area; info[o + 1] = x0; info[o + 2] = y0; info[o + 3] = x1; info[o + 4] = y1;
  }
  return count;
}

export function despeckle(bm, { maxArea = 6 } = {}, ws = DEFAULT_WS) {
  const count = label(bm, ws), lab = ws.i32('lab', bm.w * bm.h), info = ws.i32('labInfo', 5);
  let removed = 0, kept = 0;
  const drop = ws.u8('drop', count + 1, 0);
  for (let c = 0; c < count; c++) { if (info[c * 5] <= maxArea) { drop[c + 1] = 1; removed++; } else kept++; }
  if (removed) for (let i = 0; i < bm.data.length; i++) if (lab[i] && drop[lab[i]]) bm.data[i] = 0;
  return { removed, kept };
}

/**
 * The sheet's skew from its long lines: for each trial angle the ink points are projected across the lines' direction and the
 * rows and columns of that projection are counted; long straight lines make a few very full rows/columns, so the angle where the
 * sum of squares peaks is the skew. A coarse pass (0.25°) over ±maxDeg, then 0.02° around the best. Points are sampled (at most
 * 150 000) from the ink. `confidence` = peak over the median of the trial scores (≈ 1 for a sheet with no lines).
 */
export function findSkew(bm, { maxDeg = 10 } = {}, ws = DEFAULT_WS) {
  const { w, h, data } = bm;
  let ink = 0;
  for (let i = 0; i < data.length; i++) ink += data[i];
  if (ink < 50) return { deg: 0, confidence: 0, points: ink };
  const step = Math.max(1, Math.ceil(ink / 150000)), px = ws.f64('skx', Math.ceil(ink / step) + 1), py = ws.f64('sky', Math.ceil(ink / step) + 1);
  let n = 0, seen = 0;
  const cx = w / 2, cy = h / 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[y * w + x] && (seen++ % step === 0)) { px[n] = x - cx; py[n] = cy - y; n++; }   // y up
  const diag = Math.ceil(Math.hypot(w, h)) + 4, hist = ws.f64('skh', 2 * diag + 2), hist2 = ws.f64('skh2', 2 * diag + 2);
  const score = (deg) => {
    const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    hist.fill(0, 0, 2 * diag + 2); hist2.fill(0, 0, 2 * diag + 2);
    for (let i = 0; i < n; i++) {
      // rotate the points by −deg, so lines at +deg become level
      const xr = px[i] * c + py[i] * s, yr = -px[i] * s + py[i] * c;
      hist[(yr + diag) | 0]++; hist2[(xr + diag) | 0]++;
    }
    let sc = 0;
    for (let i = 0; i < 2 * diag + 2; i++) sc += hist[i] * hist[i] + hist2[i] * hist2[i];
    return sc;
  };
  const trial = [];
  let best = 0, bestS = -1;
  for (let d = -maxDeg; d <= maxDeg + 1e-9; d += 0.25) { const s = score(d); trial.push(s); if (s > bestS) { bestS = s; best = d; } }
  const fine0 = best;
  for (let d = fine0 - 0.25; d <= fine0 + 0.25 + 1e-9; d += 0.02) { const s = score(d); if (s > bestS) { bestS = s; best = d; } }
  trial.sort((p, q) => p - q);
  const med = trial[trial.length >> 1] || 1;
  return { deg: Math.round(best * 100) / 100, confidence: bestS / med, points: n };
}

export function rotateGrey(grey, deg, { fill = 255 } = {}) {
  const { w, h, data } = grey;
  checkSize(w, h);
  const out = new Uint8Array(w * h), a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), cx = (w - 1) / 2, cy = (h - 1) / 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    // the source point that lands on (x, y) when the picture turns anticlockwise on screen (y down)
    const dx = x - cx, dy = y - cy;
    const sx = cx + dx * c - dy * s, sy = cy + dx * s + dy * c;
    if (sx < -0.5 || sy < -0.5 || sx > w - 0.5 || sy > h - 0.5) { out[y * w + x] = fill; continue; }
    const x0 = Math.floor(sx), y0 = Math.floor(sy), fx = sx - x0, fy = sy - y0;
    const g = (xx, yy) => data[Math.min(h - 1, Math.max(0, yy)) * w + Math.min(w - 1, Math.max(0, xx))];
    out[y * w + x] = Math.round((g(x0, y0) * (1 - fx) + g(x0 + 1, y0) * fx) * (1 - fy) + (g(x0, y0 + 1) * (1 - fx) + g(x0 + 1, y0 + 1) * fx) * fy);
  }
  return { w, h, data: out };
}

export function rotateBitmap(bm, deg) {
  const g = rotateGrey(bitmapToGrey(bm), deg, { fill: 255 });
  return greyToBitmap(g, 127);
}

/** The pixels [x0, x1) × [y0, y1) of a picture ({ w, h, channels?, data }) as a new one. */
export function crop(img, x0, y0, x1, y1) {
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(img.w, Math.ceil(x1)); y1 = Math.min(img.h, Math.ceil(y1));
  if (x1 <= x0 || y1 <= y0) refuse('empty');
  const ch = img.channels || 1, w = x1 - x0, h = y1 - y0, out = new Uint8Array(w * h * ch);
  for (let y = 0; y < h; y++) out.set(img.data.subarray(((y + y0) * img.w + x0) * ch, ((y + y0) * img.w + x1) * ch), y * w * ch);
  return { ...img, w, h, data: out, x0, y0 };
}

/**
 * Paint a polygon of a picture ({ w, h, channels?, data }) with one value in every channel (paper = 255); a pixel is inside when its
 * centre is (even-odd). → the number of pixels that changed. pts: [[x, y], …] or [{ x, y }, …], pixel coordinates.
 */
export function paintPolygon(img, pts, value = 255) {
  const P = pts.map((p) => (Array.isArray(p) ? p : [p.x, p.y])), ch = img.channels || 1, { w, h, data } = img;
  if (P.length < 3) return 0;
  let ymin = Infinity, ymax = -Infinity;
  for (const p of P) { if (p[1] < ymin) ymin = p[1]; if (p[1] > ymax) ymax = p[1]; }
  const ay = Math.max(0, Math.floor(ymin)), by = Math.min(h - 1, Math.ceil(ymax));
  let n = 0;
  const xs = [];
  for (let y = ay; y <= by; y++) {
    const yc = y + 0.5;
    xs.length = 0;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const a = P[j], b = P[i];
      if ((a[1] <= yc) !== (b[1] <= yc)) xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.max(0, Math.ceil(xs[k] - 0.5)), x1 = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5));
      for (let x = x0; x <= x1; x++) {
        let changed = false;
        for (let c = 0; c < ch; c++) { const o = (y * w + x) * ch + c; if (data[o] !== value) { data[o] = value; changed = true; } }
        if (changed) n++;
      }
    }
  }
  return n;
}

export function paintRect(img, x0, y0, x1, y1, value = 255) {
  return paintPolygon(img, [[Math.min(x0, x1), Math.min(y0, y1)], [Math.max(x0, x1), Math.min(y0, y1)], [Math.max(x0, x1), Math.max(y0, y1)], [Math.min(x0, x1), Math.max(y0, y1)]], value);
}

/** A picture ({ w, h, channels, data }) turned `deg` degrees anticlockwise on screen about its middle, each channel on its own; same size. */
export function rotateImage(img, deg, { fill = 255 } = {}) {
  const ch = img.channels || 1;
  if (ch === 1) return { ...img, channels: 1, ...rotateGrey({ w: img.w, h: img.h, data: img.data }, deg, { fill }) };
  const planes = [];
  for (let c = 0; c < ch; c++) {
    const p = new Uint8Array(img.w * img.h);
    for (let i = 0; i < p.length; i++) p[i] = img.data[i * ch + c];
    planes.push(rotateGrey({ w: img.w, h: img.h, data: p }, deg, { fill }).data);
  }
  const out = new Uint8Array(img.w * img.h * ch);
  for (let c = 0; c < ch; c++) for (let i = 0; i < img.w * img.h; i++) out[i * ch + c] = planes[c][i];
  return { ...img, data: out };
}

export function eraseRect(bm, x0, y0, x1, y1, { paper = 0 } = {}) {
  const ax = Math.max(0, Math.floor(Math.min(x0, x1))), bx = Math.min(bm.w, Math.ceil(Math.max(x0, x1)));
  const ay = Math.max(0, Math.floor(Math.min(y0, y1))), by = Math.min(bm.h, Math.ceil(Math.max(y0, y1)));
  let n = 0;
  for (let y = ay; y < by; y++) for (let x = ax; x < bx; x++) if (bm.data[y * bm.w + x] !== paper) { bm.data[y * bm.w + x] = paper; n++; }
  return n;
}

/** pts: [[x, y], …] or [{x, y}, …] in pixel coordinates; a pixel is inside when its centre is (even-odd rule). */
export function erasePolygon(bm, pts, { paper = 0 } = {}) {
  const P = pts.map((p) => (Array.isArray(p) ? p : [p.x, p.y]));
  if (P.length < 3) return 0;
  let ymin = Infinity, ymax = -Infinity;
  for (const p of P) { if (p[1] < ymin) ymin = p[1]; if (p[1] > ymax) ymax = p[1]; }
  const ay = Math.max(0, Math.floor(ymin)), by = Math.min(bm.h - 1, Math.ceil(ymax));
  let n = 0;
  const xs = [];
  for (let y = ay; y <= by; y++) {
    const yc = y + 0.5;
    xs.length = 0;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const a = P[j], b = P[i];
      if ((a[1] <= yc) !== (b[1] <= yc)) xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.max(0, Math.ceil(xs[k] - 0.5)), x1 = Math.min(bm.w - 1, Math.floor(xs[k + 1] - 0.5));
      for (let x = x0; x <= x1; x++) if (bm.data[y * bm.w + x] !== paper) { bm.data[y * bm.w + x] = paper; n++; }
    }
  }
  return n;
}

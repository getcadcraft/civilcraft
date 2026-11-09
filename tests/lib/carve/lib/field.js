/* SPDX-License-Identifier: Apache-2.0 */
/**
 * field.js — a distance field over closed outlines (lib/carve). DOM-free. Millimetres.
 *   makeField(loops, { res, margin }) → F = { w, h, x0, y0, res, inside, dist, label, segs, max, ... }
 *     loops = [[ [x, y] … ]] closed outlines, filled by the even-odd rule (a hole is a loop inside a loop).
 *     Cell (i, j) is centred at (x0 + (i + 0.5) res, y0 + (j + 0.5) res).
 *     label[k] = the boundary segment nearest the cell (found with a labelled squared-distance transform to the cells the boundary touches,
 *       then checked against every segment in the 3 × 3 cells round that one), dist[k] = the exact distance to it, 0 outside.
 *   nearest(F, x, y) → { d, px, py, seg }   exact: the closest point of the outlines (looks only in the cells round the point)
 *   at(F, x, y) → the field's distance at a point (bilinear)
 */
import { bounds } from './geom.js';

export function makeField(loops, { res, margin = 3 } = {}) {
  const b = bounds(loops);
  const size = Math.max(b.x1 - b.x0, b.y1 - b.y0) || 1;
  res = res > 0 ? res : Math.max(0.05, size / 2000);
  const x0 = b.x0 - margin * res, y0 = b.y0 - margin * res;
  const w = Math.ceil((b.x1 - x0) / res) + margin + 1, h = Math.ceil((b.y1 - y0) / res) + margin + 1;
  if (w * h > 12e6) throw Object.assign(new Error('carve.err.big'), { key: 'carve.err.big' });
  // segments: [x1, y1, x2, y2, loop, s0 (arc length at the start), loop length]
  const segs = [];
  loops.forEach((l, li) => {
    let len = 0;
    for (let i = 0, n = l.length; i < n; i++) { const p = l[i], q = l[(i + 1) % n]; len += Math.hypot(q[0] - p[0], q[1] - p[1]); }
    let s = 0;
    for (let i = 0, n = l.length; i < n; i++) {
      const p = l[i], q = l[(i + 1) % n], L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (L > 0) segs.push([p[0], p[1], q[0], q[1], li, s, len]);
      s += L;
    }
  });
  const inside = new Uint8Array(w * h);
  const xs = [];
  for (let j = 0; j < h; j++) {   // even-odd scan fill at the cell centres
    const yc = y0 + (j + 0.5) * res;
    xs.length = 0;
    for (const s of segs) if ((s[1] <= yc) !== (s[3] <= yc)) xs.push(s[0] + ((yc - s[1]) / (s[3] - s[1])) * (s[2] - s[0]));
    xs.sort((m, n) => m - n);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const i0 = Math.max(0, Math.ceil((xs[k] - x0) / res - 0.5)), i1 = Math.min(w - 1, Math.floor((xs[k + 1] - x0) / res - 0.5));
      for (let i = i0; i <= i1; i++) inside[j * w + i] = 1;
    }
  }
  // the cells each segment touches → a compressed list per cell
  const counts = new Int32Array(w * h + 1);
  const touch = (si, fn) => {
    const s = segs[si], L = Math.hypot(s[2] - s[0], s[3] - s[1]), n = Math.max(1, Math.ceil(L / (res * 0.5)));
    let last = -1;
    for (let k = 0; k <= n; k++) {
      const x = s[0] + ((s[2] - s[0]) * k) / n, y = s[1] + ((s[3] - s[1]) * k) / n;
      const i = Math.floor((x - x0) / res), j = Math.floor((y - y0) / res);
      if (i < 0 || j < 0 || i >= w || j >= h) continue;
      const c = j * w + i;
      if (c !== last) { fn(c); last = c; }
    }
  };
  for (let si = 0; si < segs.length; si++) touch(si, (c) => { counts[c + 1]++; });
  for (let c = 0; c < w * h; c++) counts[c + 1] += counts[c];
  const list = new Int32Array(counts[w * h]), fill = counts.slice(0, w * h);
  for (let si = 0; si < segs.length; si++) touch(si, (c) => { list[fill[c]++] = si; });
  // the labelled squared-distance transform (Felzenszwalb and Huttenlocher): to the nearest touched cell, remembering which
  const INF = 1e20, m = Math.max(w, h);
  const g = new Float64Array(w * h), src = new Int32Array(w * h).fill(-1);
  for (let c = 0; c < w * h; c++) if (counts[c + 1] > counts[c]) { g[c] = 0; src[c] = c; } else g[c] = INF;
  const f = new Float64Array(m), v = new Int32Array(m), z = new Float64Array(m + 1), tmpG = new Float64Array(m), tmpS = new Int32Array(m), lab = new Int32Array(m);
  const pass = (n, get, getS, set) => {
    for (let q = 0; q < n; q++) { f[q] = get(q); lab[q] = getS(q); }
    let k = 0;
    v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      if (f[q] >= INF) continue;
      if (f[v[k]] >= INF) { v[k] = q; z[k] = -INF; z[k + 1] = INF; continue; }
      let s;
      for (;;) {
        const p = v[k];
        s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p);
        if (s <= z[k] && k > 0) k--; else break;
      }
      if (s <= z[k]) { v[0] = q; z[0] = -INF; z[1] = INF; k = 0; continue; }
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) {
      while (z[k + 1] < q) k++;
      const p = v[k];
      tmpG[q] = f[p] >= INF ? INF : (q - p) * (q - p) + f[p];
      tmpS[q] = f[p] >= INF ? -1 : lab[p];
    }
    for (let q = 0; q < n; q++) set(q, tmpG[q], tmpS[q]);
  };
  for (let i = 0; i < w; i++) pass(h, (q) => g[q * w + i], (q) => src[q * w + i], (q, val, s) => { g[q * w + i] = val; src[q * w + i] = s; });
  for (let j = 0; j < h; j++) pass(w, (q) => g[j * w + q], (q) => src[j * w + q], (q, val, s) => { g[j * w + q] = val; src[j * w + q] = s; });
  // the exact distance to the segments in the 3 x 3 cells round the nearest touched cell
  const dist = new Float32Array(w * h), label = new Int32Array(w * h).fill(-1);
  let max = 0;
  for (let c = 0; c < w * h; c++) {
    if (!inside[c] || src[c] < 0) continue;
    const i = c % w, j = (c - i) / w, px = x0 + (i + 0.5) * res, py = y0 + (j + 0.5) * res;
    const sc = src[c], si = sc % w, sj = (sc - si) / w;
    let best = Infinity, bs = -1;
    for (let dj = -1; dj <= 1; dj++) {
      const jj = sj + dj;
      if (jj < 0 || jj >= h) continue;
      for (let di = -1; di <= 1; di++) {
        const ii = si + di;
        if (ii < 0 || ii >= w) continue;
        const cc = jj * w + ii;
        for (let k = counts[cc]; k < counts[cc + 1]; k++) {
          const e = segs[list[k]], d2 = segDist2(px, py, e);
          if (d2 < best) { best = d2; bs = list[k]; }
        }
      }
    }
    if (bs >= 0) { dist[c] = Math.sqrt(best); label[c] = bs; if (dist[c] > max) max = dist[c]; }
  }
  return { w, h, x0, y0, res, inside, dist, label, segs, counts, list, max };
}

function segDist2(px, py, e) {
  const dx = e[2] - e[0], dy = e[3] - e[1], L2 = dx * dx + dy * dy;
  let t = L2 > 0 ? ((px - e[0]) * dx + (py - e[1]) * dy) / L2 : 0;
  t = Math.max(0, Math.min(1, t));
  const qx = e[0] + t * dx - px, qy = e[1] + t * dy - py;
  return qx * qx + qy * qy;
}

/** The closest point of the outlines to (x, y): { d, px, py, seg }, looking `reach` mm round (default 4 cells, widening until it finds one). */
export function nearest(F, x, y, reach = 4 * F.res) {
  const { w, h, res } = F;
  const i0 = Math.floor((x - F.x0) / res), j0 = Math.floor((y - F.y0) / res);
  for (let r = Math.ceil(reach / res); r <= Math.max(w, h); r = r * 2) {
    let best = Infinity, bs = -1;
    for (let j = Math.max(0, j0 - r); j <= Math.min(h - 1, j0 + r); j++) {
      for (let i = Math.max(0, i0 - r); i <= Math.min(w - 1, i0 + r); i++) {
        const c = j * w + i;
        for (let k = F.counts[c]; k < F.counts[c + 1]; k++) { const d2 = segDist2(x, y, F.segs[F.list[k]]); if (d2 < best) { best = d2; bs = F.list[k]; } }
      }
    }
    if (bs >= 0 && Math.sqrt(best) <= r * res) {
      const e = F.segs[bs], dx = e[2] - e[0], dy = e[3] - e[1], L2 = dx * dx + dy * dy;
      const t = Math.max(0, Math.min(1, L2 > 0 ? ((x - e[0]) * dx + (y - e[1]) * dy) / L2 : 0));
      return { d: Math.sqrt(best), px: e[0] + t * dx, py: e[1] + t * dy, seg: bs };
    }
  }
  return { d: Infinity, px: x, py: y, seg: -1 };
}

export function at(F, x, y) {
  const fx = (x - F.x0) / F.res - 0.5, fy = (y - F.y0) / F.res - 0.5;
  const i = Math.floor(fx), j = Math.floor(fy), tx = fx - i, ty = fy - j;
  const v = (a, c) => (a < 0 || c < 0 || a >= F.w || c >= F.h ? 0 : F.dist[c * F.w + a]);
  return v(i, j) * (1 - tx) * (1 - ty) + v(i + 1, j) * tx * (1 - ty) + v(i, j + 1) * (1 - tx) * ty + v(i + 1, j + 1) * tx * ty;
}

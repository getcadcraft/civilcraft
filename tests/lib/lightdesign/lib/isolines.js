/* SPDX-License-Identifier: Apache-2.0 */
/**
 * isolines.js — lines of equal illuminance and a 3D lux surface (0.11 IL.7, session `light-11`). DOM-free.
 *
 *   gridField(res)                    → { nx, ny, x0, y0, dx, dy, v: Float64Array(nx*ny, NaN where the point was left out) } from a result's grid (photometry gridPoints order)
 *   niceLevels(min, max, n)           → round levels (1, 2, 5 x 10^k) between min and max
 *   isolines(field, levels)           → [{ level, segments: [[[x, y], [x, y]], ...] }] mm, marching squares (linear along the edge)
 *   luxSurface(field, { scale })      → { positions: Float32Array (x, y, z mm), colours: Float32Array 0..1, indices: Uint32Array } a height-and-colour mesh of the lux over the plan
 * Source: marching squares (Lorensen and Cline 1987, the 2D case); nothing here reads a standard.
 */
import { colourAt } from './view.js';

export function gridField(res) {
  const { points, values, nx, ny } = res.grid;
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const poly = res.room.polygon, px = poly.map((p) => p[0]), py = poly.map((p) => p[1]);
  const X0 = Math.min(...px), X1 = Math.max(...px), Y0 = Math.min(...py), Y1 = Math.max(...py), dx = (X1 - X0) / nx, dy = (Y1 - Y0) / ny;
  const v = new Float64Array(nx * ny).fill(NaN);
  points.forEach((p, k) => { const i = Math.min(nx - 1, Math.max(0, Math.floor((p[0] - X0) / dx))), j = Math.min(ny - 1, Math.max(0, Math.floor((p[1] - Y0) / dy))); v[i * ny + j] = values[k]; });
  return { nx, ny, x0: X0 + dx / 2, y0: Y0 + dy / 2, dx, dy, v, xs: xs.length };
}
export function niceLevels(min, max, n = 6) {
  if (!(max > min) || !(max > 0)) return [];
  const raw = (max - min) / Math.max(1, n), p = 10 ** Math.floor(Math.log10(raw)), f = raw / p, step = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p, out = [];
  for (let l = Math.ceil(min / step) * step; l < max; l += step) if (l > min) out.push(Math.round(l / step) * step);
  return out;
}
export function isolines(f, levels) {
  const at = (i, j) => f.v[i * f.ny + j], X = (i) => f.x0 + i * f.dx, Y = (j) => f.y0 + j * f.dy, out = [];
  for (const level of levels) {
    const segs = [];
    for (let i = 0; i < f.nx - 1; i++) for (let j = 0; j < f.ny - 1; j++) {
      const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], v = c.map(([a, b]) => at(a, b));
      if (v.some(Number.isNaN)) continue;
      const pts = [];
      for (let k = 0; k < 4; k++) {
        const a = v[k], b = v[(k + 1) % 4];
        if ((a < level) !== (b < level)) { const t = (level - a) / (b - a), [ia, ja] = c[k], [ib, jb] = c[(k + 1) % 4]; pts.push([X(ia) + (X(ib) - X(ia)) * t, Y(ja) + (Y(jb) - Y(ja)) * t]); }
      }
      if (pts.length === 2) segs.push([pts[0], pts[1]]);
      else if (pts.length === 4) { const mid = (v[0] + v[1] + v[2] + v[3]) / 4; if ((mid < level) === (v[0] < level)) { segs.push([pts[0], pts[3]], [pts[1], pts[2]]); } else segs.push([pts[0], pts[1]], [pts[2], pts[3]]); }
    }
    out.push({ level, segments: segs });
  }
  return out;
}
export function luxSurface(f, { scale = 2, range = null } = {}) {
  let mn = Infinity, mx = 0;
  for (const v of f.v) if (!Number.isNaN(v)) { mn = Math.min(mn, v); mx = Math.max(mx, v); }
  const lo = range ? range.min : Math.max(mn, mx / 64, 1e-3), hi = range ? range.max : Math.max(mx, lo * 1.0001), l0 = Math.log10(lo), span = Math.log10(hi) - l0 || 1;
  const pos = [], col = [], idx = [], id = new Int32Array(f.nx * f.ny).fill(-1), h = Math.max(f.nx * f.dx, f.ny * f.dy) * 0.25 / (mx || 1) * scale;
  for (let i = 0; i < f.nx; i++) for (let j = 0; j < f.ny; j++) {
    const v = f.v[i * f.ny + j]; if (Number.isNaN(v)) continue;
    id[i * f.ny + j] = pos.length / 3; pos.push(f.x0 + i * f.dx, f.y0 + j * f.dy, v * h);
    const c = colourAt(v > 0 ? (Math.log10(v) - l0) / span : 0); col.push(c[0] / 255, c[1] / 255, c[2] / 255);
  }
  for (let i = 0; i < f.nx - 1; i++) for (let j = 0; j < f.ny - 1; j++) {
    const a = id[i * f.ny + j], b = id[(i + 1) * f.ny + j], c = id[(i + 1) * f.ny + j + 1], d = id[i * f.ny + j + 1];
    if (a < 0 || b < 0 || c < 0 || d < 0) continue;
    idx.push(a, b, c, a, c, d);
  }
  return { positions: new Float32Array(pos), colours: new Float32Array(col), indices: new Uint32Array(idx), range: { min: lo, max: hi }, heightPerLux: h };
}

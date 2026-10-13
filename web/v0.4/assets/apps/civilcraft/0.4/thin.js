/* SPDX-License-Identifier: Apache-2.0 */
/**
 * thin.js — thinning point clouds and grids to a spacing (docs/GIS-SPEC.md §3, builder B). No DOM.
 *
 *   const t = new Thinner({ cell, mode, origin: [x, y], classes: Set | null, region: box | null, max })
 *   t.add(x, y, z, cls) → bool        one point (project coordinates): kept in its cell or dropped
 *   t.count / t.capped / t.seen / t.filtered (by class) / t.outside (by region)
 *   t.points() → [{x, y, z}]          one point per occupied cell, cells in the order they were first used
 *     mode 'lowest'  — the lowest point in each cell (bare earth from unclassified data: the ground is under the trees)
 *          'nearest' — the point nearest the cell centre (keeps real survey points, no bias up or down)
 *          'average' — the mean x, y and z of the cell's points
 *     cells are squares of `cell` anchored at `origin`; a cell index is floor((x − ox) / cell).
 *     max: once that many cells hold points, points for new cells are dropped and `capped` is set (the import dialog
 *     keeps the estimate under the cap, so this only guards against a wrong estimate).
 *   class filter: `classes` = the LAS classes to keep (null = all). region: { minX, minY, maxX, maxY } in project units.
 *
 *   gridStep(spacing, cellSize) → n   keep every n-th node of a grid (nodes are never moved: their elevations stay exact)
 *   class Coverage                     a coarse count of points per class over the file's box (read in the class scan) to
 *                                      estimate how many points a thinning keeps: estimate({ cell, classes, box, toCoarse })
 */

import { t } from "./i18n.js";

export class Thinner {
  constructor({ cell, mode = 'nearest', origin = [0, 0], classes = null, region = null, max = Infinity } = {}) {
    if (!(cell > 0) || !Number.isFinite(cell)) throw new Error(t('thin.spacing'));
    if (!['lowest', 'nearest', 'average'].includes(mode)) throw new Error('Unknown thinning: ' + mode);   // i18n-ignore: developer error (impossible mode)
    this.cell = cell; this.mode = mode; this.ox = origin[0]; this.oy = origin[1];
    this.classes = classes; this.region = region; this.max = max;
    this.map = new Map();
    this.cap = 1024;
    this.X = new Float64Array(this.cap); this.Y = new Float64Array(this.cap); this.Z = new Float64Array(this.cap); this.W = new Float64Array(this.cap);
    this.count = 0; this.seen = 0; this.filtered = 0; this.outside = 0; this.capped = false; this.dropped = 0;
  }
  grow() {
    const n = this.cap * 2;
    for (const k of ['X', 'Y', 'Z', 'W']) { const a = new Float64Array(n); a.set(this[k]); this[k] = a; }
    this.cap = n;
  }
  add(x, y, z, cls) {
    this.seen++;
    if (this.classes && !this.classes.has(cls)) { this.filtered++; return false; }
    const r = this.region;
    if (r && (x < r.minX || x > r.maxX || y < r.minY || y > r.maxY)) { this.outside++; return false; }
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return false;
    const fx = (x - this.ox) / this.cell, fy = (y - this.oy) / this.cell;
    const ix = Math.floor(fx), iy = Math.floor(fy);
    if (Math.abs(ix) >= 2097152 || Math.abs(iy) >= 2147483647) { this.outside++; return false; }   // keys stay exact (origin near the data)
    const key = ix * 4294967296 + (iy + 2147483648);
    let k = this.map.get(key);
    if (k === undefined) {
      if (this.count >= this.max) { this.capped = true; this.dropped++; return false; }
      k = this.count++;
      if (k >= this.cap) this.grow();
      this.map.set(key, k);
      this.X[k] = x; this.Y[k] = y; this.Z[k] = z;
      this.W[k] = this.mode === 'average' ? 1 : this.mode === 'nearest' ? (fx - ix - 0.5) ** 2 + (fy - iy - 0.5) ** 2 : 0;
      return true;
    }
    if (this.mode === 'lowest') { if (z < this.Z[k]) { this.X[k] = x; this.Y[k] = y; this.Z[k] = z; } }
    else if (this.mode === 'nearest') {
      const d = (fx - ix - 0.5) ** 2 + (fy - iy - 0.5) ** 2;
      if (d < this.W[k]) { this.X[k] = x; this.Y[k] = y; this.Z[k] = z; this.W[k] = d; }
    } else { this.X[k] += x; this.Y[k] += y; this.Z[k] += z; this.W[k] += 1; }
    return true;
  }
  points() {
    const out = new Array(this.count), avg = this.mode === 'average';
    for (let k = 0; k < this.count; k++) out[k] = avg ? { x: this.X[k] / this.W[k], y: this.Y[k] / this.W[k], z: this.Z[k] / this.W[k] } : { x: this.X[k], y: this.Y[k], z: this.Z[k] };
    return out;
  }
}

export const gridStep = (spacing, cellSize) => (spacing > 0 && cellSize > 0 ? Math.max(1, Math.round(spacing / cellSize)) : 1);

/**
 * Coverage over a box (the file's own coordinates): N × N coarse cells, a count per class per cell. estimate() says how
 * many thinned points an import would keep: per coarse cell, min(points of the ticked classes, coarse cell area /
 * spacing²) — about right when points are spread evenly inside each coarse cell.
 */
export class Coverage {
  constructor(box, n = 128) {
    this.box = box; this.n = n;
    this.w = Math.max(box.maxX - box.minX, 1e-9) / n; this.h = Math.max(box.maxY - box.minY, 1e-9) / n;
    this.byClass = new Map();
    this.counts = new Map();   // class → total
    this.total = 0;
  }
  add(x, y, cls) {
    const i = Math.min(this.n - 1, Math.max(0, Math.floor((x - this.box.minX) / this.w))), j = Math.min(this.n - 1, Math.max(0, Math.floor((y - this.box.minY) / this.h)));
    let a = this.byClass.get(cls);
    if (!a) { a = new Uint32Array(this.n * this.n); this.byClass.set(cls, a); }
    a[j * this.n + i]++;
    this.counts.set(cls, (this.counts.get(cls) || 0) + 1);
    this.total++;
  }
  /**
   * spacing: thinning cell, in the file's units (convert first); classes: Set | null; box: the area in the file's
   * coordinates (null = all). Returns { points (to keep, about), inArea (points of those classes in the area) }.
   */
  estimate({ spacing, classes = null, box = null }) {
    const n = this.n, per = new Float64Array(n * n);
    for (const [c, a] of this.byClass) if (!classes || classes.has(c)) for (let k = 0; k < a.length; k++) per[k] += a[k];
    let keep = 0, inArea = 0;
    const cellArea = this.w * this.h;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const v = per[j * n + i];
      if (!v) continue;
      let f = 1;
      if (box) {
        const x0 = this.box.minX + i * this.w, y0 = this.box.minY + j * this.h;
        const ox = Math.max(0, Math.min(box.maxX, x0 + this.w) - Math.max(box.minX, x0)), oy = Math.max(0, Math.min(box.maxY, y0 + this.h) - Math.max(box.minY, y0));
        f = (ox * oy) / cellArea;
        if (!f) continue;
      }
      inArea += v * f;
      keep += Math.min(v * f, (cellArea * f) / (spacing * spacing) + 1);
    }
    return { points: Math.round(keep), inArea: Math.round(inArea) };
  }
}

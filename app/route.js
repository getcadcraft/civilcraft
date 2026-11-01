/* SPDX-License-Identifier: Apache-2.0 */
/**
 * route.js — best route across the terrain (0.8 EG.71): the least-cost path between two points on the ground, for a road, a pipe, a trail or a
 * power line, that keeps to a steepest grade and a tightest curve, goes round places you forbid, avoids places you dislike and counts the
 * earthwork its width would need. No DOM, no strings (the UI words the codes), no imports. Tested by bin/test-civilcraft-route.mjs.
 *
 * Method (textbook): A* search (Hart, Nilsson and Raphael 1968) over states (cell, heading). From a cell you may leave along any of the
 * primitive directions (dx, dy) with |dx|, |dy| ≤ K and no common factor — 8 for K = 1, 16 for K = 2, 32 for K = 3 — so the heading changes in
 * small steps. A turn between two steps is allowed only when the deflection angle is at most (l1 + l2) / (2R), the angle two chords of those lengths
 * turn through on a circle of radius R. K is chosen so the smallest turn the grid can make fits the radius you ask for. The grade of the
 * ground along a step is |Δz| / length and may not pass `maxGrade`; the cost of a step is its length × the area's factor, plus the cut and fill
 * the roadway's width would need across the slope, plus a penalty that grows as the grade nears the limit.
 *
 *   findRoute(ground, from, to, opts) → { found, reason?, path: [{ x, y, z }], length, cost, maxGrade, minRadius, earthwork, cut, fill, steps,
 *       snapped, cell, K, expanded }
 *   opts: cell (grid size, project units; default from the distance), maxGrade (rise/run, default 0.08), minRadius (0 = no limit), width (roadway, 0 = none),
 *         sideSlope (H per 1 V of cut/fill sides, default 3), unitCost (per unit length, default 1), earthCost (per cubic unit, default 0), gradeWeight
 *         (extra cost fraction at the limit, default 1), forbid [polygon], avoid [{ poly, factor }], prefer [{ poly, factor }] (factor < 1), bounds, maxStates
 *   routeProfile(path) → [{ d, z }]     routeCurves(path) → [{ at, radius, turn }]
 */

class Heap {
  constructor() { this.k = []; this.v = []; }
  get size() { return this.k.length; }
  push(key, val) {
    const K = this.k, V = this.v; let i = K.length; K.push(key); V.push(val);
    while (i > 0) { const p = (i - 1) >> 1; if (K[p] <= key) break; K[i] = K[p]; V[i] = V[p]; i = p; }
    K[i] = key; V[i] = val;
  }
  pop() {
    const K = this.k, V = this.v, rv = V[0], lk = K.pop(), lv = V.pop(), n = K.length;
    if (n) { let i = 0; for (;;) { let c = 2 * i + 1; if (c >= n) break; if (c + 1 < n && K[c + 1] < K[c]) c++; if (K[c] >= lk) break; K[i] = K[c]; V[i] = V[c]; i = c; } K[i] = lk; V[i] = lv; }
    return rv;
  }
}

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const inPoly = (poly, x, y) => { let k = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const p = poly[i], q = poly[j]; if ((p.y > y) !== (q.y > y) && x < ((q.x - p.x) * (y - p.y)) / (q.y - p.y) + p.x) k = !k; } return k; };

export function directions(K) {
  const out = [];
  for (let dy = -K; dy <= K; dy++) for (let dx = -K; dx <= K; dx++) if ((dx || dy) && gcd(dx, dy) === 1) out.push({ dx, dy, a: Math.atan2(dy, dx), n: Math.hypot(dx, dy) });
  out.sort((p, q) => p.a - q.a);
  return out;
}

export function findRoute(ground, from, to, opts = {}) {
  const o = {
    maxGrade: opts.maxGrade ?? 0.08, minRadius: opts.minRadius ?? 0, width: opts.width ?? 0, sideSlope: opts.sideSlope ?? 3, unitCost: opts.unitCost ?? 1,
    earthCost: opts.earthCost ?? 0, gradeWeight: opts.gradeWeight ?? 1, maxStates: opts.maxStates ?? 8e6,
  };
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  if (!(dist > 0)) return { found: false, reason: 'same' };
  let c = opts.cell > 0 ? opts.cell : dist / 120;
  // direction set: the smallest K whose finest turn fits the radius (K² ≥ R / c), within 1..6
  let K = o.minRadius > 0 ? Math.min(6, Math.max(1, Math.ceil(Math.sqrt(o.minRadius / c)))) : 2;
  const dirs = directions(K), H = dirs.length;
  const pad = Math.max(c * (K + 1), dist * 0.5);
  const b = opts.bounds || { minX: Math.min(from.x, to.x) - pad, minY: Math.min(from.y, to.y) - pad, maxX: Math.max(from.x, to.x) + pad, maxY: Math.max(from.y, to.y) + pad };
  let nx = Math.ceil((b.maxX - b.minX) / c), ny = Math.ceil((b.maxY - b.minY) / c);
  while (nx * ny * H > o.maxStates) { c *= 1.25; nx = Math.ceil((b.maxX - b.minX) / c); ny = Math.ceil((b.maxY - b.minY) / c); }
  const N = nx * ny, z = new Float32Array(N), fac = new Float32Array(N).fill(1);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = b.minX + (i + 0.5) * c, y = b.minY + (j + 0.5) * c, v = ground.elevationAt(x, y);
    z[j * nx + i] = v === null || v === undefined || !Number.isFinite(v) ? NaN : v;
  }
  const mark = (list, fn) => { for (const it of list || []) { const poly = it.poly || it; if (!poly || poly.length < 3) continue; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) if (inPoly(poly, b.minX + (i + 0.5) * c, b.minY + (j + 0.5) * c)) fn(j * nx + i, it); } };
  mark(opts.avoid, (k, it) => { fac[k] *= it.factor || 2; });
  mark(opts.prefer, (k, it) => { fac[k] *= it.factor || 0.5; });
  mark(opts.forbid, (k) => { fac[k] = Infinity; });
  const cellOf = (p) => { const i = Math.floor((p.x - b.minX) / c), j = Math.floor((p.y - b.minY) / c); return i >= 0 && j >= 0 && i < nx && j < ny ? j * nx + i : -1; };
  const s0 = cellOf(from), t0 = cellOf(to);
  if (s0 < 0 || t0 < 0 || Number.isNaN(z[s0]) || Number.isNaN(z[t0])) return { found: false, reason: 'off-ground' };
  if (!Number.isFinite(fac[s0]) || !Number.isFinite(fac[t0])) return { found: false, reason: 'forbidden-end' };
  // allowed turns per incoming heading
  const maxTurn = (l1, l2) => (o.minRadius > 0 ? (l1 + l2) / (2 * o.minRadius) + 1e-9 : Math.PI / 2 + 1e-9);
  const turns = dirs.map((d1) => {
    const list = [];
    dirs.forEach((d2, k) => {
      let da = Math.abs(d2.a - d1.a); if (da > Math.PI) da = 2 * Math.PI - da;
      if (da <= maxTurn(d1.n * c, d2.n * c)) list.push(k);
    });
    return list;
  });
  const minFac = Math.min(1, ...[...(opts.prefer || [])].map((p) => p.factor || 0.5));
  const tx = b.minX + ((t0 % nx) + 0.5) * c, ty = b.minY + (Math.floor(t0 / nx) + 0.5) * c;
  const hOf = (k) => o.unitCost * minFac * Math.hypot(b.minX + ((k % nx) + 0.5) * c - tx, b.minY + (Math.floor(k / nx) + 0.5) * c - ty);
  const g = new Float32Array(N * H).fill(Infinity), prev = new Int32Array(N * H).fill(-1), heap = new Heap();
  for (let h = 0; h < H; h++) { g[s0 * H + h] = 0; heap.push(hOf(s0), s0 * H + h); }
  const zAt = (x, y) => { const v = ground.elevationAt(x, y); return v === null || v === undefined ? NaN : v; };
  const endTol = K * c * 1.0001;
  let goal = -1, expanded = 0;
  while (heap.size) {
    const s = heap.pop(), cell = (s / H) | 0, h = s - cell * H, gs = g[s];
    const cx = b.minX + ((cell % nx) + 0.5) * c, cy = b.minY + (Math.floor(cell / nx) + 0.5) * c;
    if (Math.hypot(cx - to.x, cy - to.y) <= Math.max(endTol * 0.5, c * 0.75) && Number.isFinite(gs)) { goal = s; break; }
    expanded++;
    const ci = cell % nx, cj = (cell - ci) / nx;
    for (const k2 of turns[h]) {
      const d = dirs[k2], ni = ci + d.dx, nj = cj + d.dy;
      if (ni < 0 || nj < 0 || ni >= nx || nj >= ny) continue;
      const nc = nj * nx + ni;
      if (Number.isNaN(z[nc]) || !Number.isFinite(fac[nc])) continue;
      const len = d.n * c, grade = Math.abs(z[nc] - z[cell]) / len;
      if (grade > o.maxGrade) continue;
      const f = (fac[cell] + fac[nc]) / 2;
      let cost = len * o.unitCost * f * (1 + o.gradeWeight * (grade / o.maxGrade) ** 2);
      if (o.width > 0 && o.earthCost > 0) {   // cut and fill the roadway's width needs across the slope at the middle of the step
        const mx = (cx + b.minX + (ni + 0.5) * c) / 2, my = (cy + b.minY + (nj + 0.5) * c) / 2, ux = -d.dy / d.n, uy = d.dx / d.n, w = o.width / 2;
        const zl = zAt(mx + ux * w, my + uy * w), zr = zAt(mx - ux * w, my - uy * w);
        if (Number.isFinite(zl) && Number.isFinite(zr)) {
          const s = Math.abs(zl - zr) / o.width, den = 1 - o.sideSlope * s;
          const area = den > 0.05 ? (o.width * o.width * s) / 4 / den : (o.width * o.width * 0.05) / 4 / 0.05;   // a slope steeper than the sides can hold: cap, very costly
          cost += area * len * o.earthCost;
        }
      }
      const ns = nc * H + k2, ng = gs + cost;
      if (ng < g[ns]) { g[ns] = ng; prev[ns] = s; heap.push(ng + hOf(nc), ns); }
    }
  }
  if (goal < 0) return { found: false, reason: expanded >= N * H * 0.98 ? 'unreachable' : (o.minRadius > 0 ? 'unreachable-curve' : 'unreachable'), expanded, cell: c, K };
  const cells = [];
  for (let s = goal; s >= 0; s = prev[s]) cells.push((s / H) | 0);
  cells.reverse();
  const pts = [{ x: from.x, y: from.y }];
  for (let k = 1; k < cells.length - 1; k++) pts.push({ x: b.minX + ((cells[k] % nx) + 0.5) * c, y: b.minY + (Math.floor(cells[k] / nx) + 0.5) * c });
  const last = pts[pts.length - 1], snapped = Math.hypot(to.x - last.x, to.y - last.y);
  pts.push({ x: to.x, y: to.y });
  // tidy: drop points that lie on a straight line
  const path = [];
  for (const p of pts) {
    const zz = zAt(p.x, p.y), q = { x: p.x, y: p.y, z: Number.isFinite(zz) ? zz : z[cellOf(p)] };
    if (path.length >= 2) { const a = path[path.length - 2], m = path[path.length - 1]; if (Math.abs((m.x - a.x) * (q.y - a.y) - (m.y - a.y) * (q.x - a.x)) < 1e-9 * c * c) { path[path.length - 1] = q; continue; } }
    path.push(q);
  }
  const st = routeStats(path, ground, o);
  return { found: true, path, cost: g[goal], snapped, cell: c, K, expanded, ...st };
}

export function routeStats(path, ground, o = {}) {
  let length = 0, maxGrade = 0, cut = 0, fill = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], l = Math.hypot(b.x - a.x, b.y - a.y);
    length += l;
    if (l > 0) maxGrade = Math.max(maxGrade, Math.abs(b.z - a.z) / l);
    if (o.width > 0 && l > 0) {   // earthwork along the line: sample every ~ width
      const n = Math.max(1, Math.ceil(l / Math.max(o.width, l / 50))), ux = -(b.y - a.y) / l, uy = (b.x - a.x) / l, w = o.width / 2;
      for (let s = 0; s < n; s++) {
        const t = (s + 0.5) / n, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t, zl = ground.elevationAt(x + ux * w, y + uy * w), zr = ground.elevationAt(x - ux * w, y - uy * w), zc = ground.elevationAt(x, y);
        if (![zl, zr, zc].every((v) => v !== null && v !== undefined && Number.isFinite(v))) continue;
        const s2 = Math.abs(zl - zr) / o.width, den = Math.max(0.05, 1 - (o.sideSlope ?? 3) * s2), area = (o.width * o.width * s2) / 4 / den;
        // the roadway sits at the line's own profile (straight between the ends); the half of the cross-slope above it is cut, below it fill
        if (zc >= a.z + (b.z - a.z) * t) cut += (area * l) / n; else fill += (area * l) / n;
      }
    }
  }
  return { length, maxGrade, minRadius: minRadiusOf(path), earthwork: cut + fill, cut, fill };
}

export function routeCurves(path) {
  const out = [];
  let d = 0;
  for (let i = 1; i < path.length - 1; i++) {
    const a = path[i - 1], b = path[i], c = path[i + 1], l1 = Math.hypot(b.x - a.x, b.y - a.y), l2 = Math.hypot(c.x - b.x, c.y - b.y);
    d += l1;
    const t1 = Math.atan2(b.y - a.y, b.x - a.x), t2 = Math.atan2(c.y - b.y, c.x - b.x);
    let turn = t2 - t1; while (turn > Math.PI) turn -= 2 * Math.PI; while (turn < -Math.PI) turn += 2 * Math.PI;
    if (Math.abs(turn) < 1e-9) continue;
    out.push({ at: d, x: b.x, y: b.y, turn, radius: (l1 + l2) / (2 * Math.abs(turn)) });
  }
  return out;
}

export const minRadiusOf = (path) => { const cs = routeCurves(path); return cs.length ? Math.min(...cs.map((c) => c.radius)) : Infinity; };

export function routeProfile(path) {
  const out = []; let d = 0;
  for (let i = 0; i < path.length; i++) { if (i) d += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y); out.push({ d, z: path[i].z }); }
  return out;
}

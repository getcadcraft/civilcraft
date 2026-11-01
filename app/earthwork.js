/* SPDX-License-Identifier: Apache-2.0 */
/**
 * earthwork.js — the earthwork balancer (0.8 EG.70): find the level (and, if you allow it, the tilt) of a pad or a graded area so the
 * cut just fills the fill, then say how the dirt moves: which cut goes to which fill, how far, and what is left over to take away or
 * bring in. No DOM, no strings (the UI words the codes), no imports. Tested by bin/test-civilcraft-earthwork.mjs.
 *
 * Words: a CELL is a ground sample { x, y, zg } (project units, inside the area; each stands for `area` of ground). The design surface at a cell is
 * designOf(x, y, z0). dz = design − ground (+ = fill). `factor` is the cut's usable fraction after swell/shrink, as masshaul.js uses
 * it (0.9 = a tenth lost): balanced means cut × factor = fill.
 *
 *   cellsInside(ground, polygon, { cell }) → [{ x, y, zg }]                    ground = anything with elevationAt(x, y)
 *   volumes(cells, designOf, z0, { area, factor }) → { cut, fill, usable, net }    net = usable cut − fill (+ = spare dirt)
 *   balanceLevel(cells, designOf, { area, factor, lo, hi }) → { z0, cut, fill, net, ok }    bisection; net rises with z0 (more fill, less cut) so falls... see code
 *   planeOf({ cx, cy, gx, gy }) → designOf                                        a plane that rises gx in x and gy in y (rise/run)
 *   bestPlane(cells, { area, factor, maxGrade, minGrade, cx, cy, steps }) → { z0, gx, gy, cut, fill, net, haul, ... }
 *       the level AND tilt (each within ±maxGrade, total at most maxGrade) that balance with the least free-haul moment (|centroid cut − centroid fill| × volume)
 *   haulPlan(cells, designOf, z0, { area, factor, blocks, offsite }) → { flows: [{ from {x,y}, to {x,y}, vol, dist }], moved, haul (vol·dist), avg,
 *       spare (taken away), short (brought in), totals }
 *       cells are grouped into at most `blocks` blocks of cut and of fill; a minimum-cost transport (successive shortest paths, the textbook
 *       network-flow method) moves cut to fill by straight-line distance; leftovers go to a dummy "off site" at distance `offsite`
 */

export function cellsInside(ground, polygon, { cell } = {}) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of polygon) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  if (!(x1 > x0 && y1 > y0)) return [];
  const c = cell > 0 ? cell : Math.sqrt(((x1 - x0) * (y1 - y0)) / 20000);
  const inside = (x, y) => { let k = false; for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) { const p = polygon[i], q = polygon[j]; if ((p.y > y) !== (q.y > y) && x < ((q.x - p.x) * (y - p.y)) / (q.y - p.y) + p.x) k = !k; } return k; };
  const out = [];
  for (let y = y0 + c / 2; y < y1; y += c) for (let x = x0 + c / 2; x < x1; x += c) {
    if (!inside(x, y)) continue;
    const z = ground.elevationAt(x, y);
    if (z !== null && z !== undefined && Number.isFinite(z)) out.push({ x, y, zg: z });
  }
  out.cell = c;
  return out;
}

export function volumes(cells, designOf, z0, { area = 1, factor = 1 } = {}) {
  let cut = 0, fill = 0;
  for (const p of cells) { const dz = designOf(p.x, p.y, z0) - p.zg; if (dz > 0) fill += dz; else cut -= dz; }
  cut *= area; fill *= area;
  return { cut, fill, usable: cut * factor, net: cut * factor - fill };
}

/** net = usable cut − fill falls as z0 rises (less cut, more fill): bisection on the sign. */
export function balanceLevel(cells, designOf, { area = 1, factor = 1, lo = null, hi = null } = {}) {
  if (!cells.length) return { z0: 0, cut: 0, fill: 0, net: 0, ok: false };
  let a = lo, b = hi;
  if (a === null || b === null) {
    let mn = Infinity, mx = -Infinity;
    for (const p of cells) { const d = designOf(p.x, p.y, 0); mn = Math.min(mn, p.zg - d); mx = Math.max(mx, p.zg - d); }
    a = mn - 1; b = mx + 1;   // at a every cell is fill, at b every cell is cut
  }
  for (let k = 0; k < 80; k++) { const m = (a + b) / 2; if (volumes(cells, designOf, m, { area, factor }).net > 0) a = m; else b = m; }
  const z0 = (a + b) / 2, v = volumes(cells, designOf, z0, { area, factor });
  return { z0, cut: v.cut, fill: v.fill, net: v.net, ok: true };
}

export const planeOf = ({ cx = 0, cy = 0, gx = 0, gy = 0 } = {}) => (x, y, z0) => z0 + gx * (x - cx) + gy * (y - cy);

function moment(cells, designOf, z0, area, factor) {
  let cv = 0, cx = 0, cy = 0, fv = 0, fx = 0, fy = 0;
  for (const p of cells) { const dz = designOf(p.x, p.y, z0) - p.zg; if (dz < 0) { cv -= dz; cx -= dz * p.x; cy -= dz * p.y; } else if (dz > 0) { fv += dz; fx += dz * p.x; fy += dz * p.y; } }
  if (!(cv > 0 && fv > 0)) return { m: 0, vol: Math.min(cv, fv) * area };
  const d = Math.hypot(cx / cv - fx / fv, cy / cv - fy / fv), vol = Math.min(cv * factor, fv) * area;
  return { m: vol * d, vol };
}

export function bestPlane(cells, { area = 1, factor = 1, maxGrade = 0.05, steps = 9, cx = null, cy = null, minGrade = 0 } = {}) {
  if (!cells.length) return null;
  const mx = cx ?? cells.reduce((s, p) => s + p.x, 0) / cells.length, my = cy ?? cells.reduce((s, p) => s + p.y, 0) / cells.length;
  const score = (gx, gy) => {
    if (Math.hypot(gx, gy) > maxGrade + 1e-12) return null;
    const d = planeOf({ cx: mx, cy: my, gx, gy }), b = balanceLevel(cells, d, { area, factor });
    return { gx, gy, ...b, ...moment(cells, d, b.z0, area, factor), haulMoment: moment(cells, d, b.z0, area, factor).m };
  };
  let best = score(0, 0), step = maxGrade / ((steps - 1) / 2 || 1);
  for (let round = 0; round < 6 && maxGrade > 0; round++) {
    let moved = false;
    const base = best;
    for (let i = -Math.floor(steps / 2); i <= Math.floor(steps / 2); i++) for (let j = -Math.floor(steps / 2); j <= Math.floor(steps / 2); j++) {
      const s = score(base.gx + i * step, base.gy + j * step);
      if (s && s.haulMoment < best.haulMoment - 1e-12) { best = s; moved = true; }
    }
    step = moved ? step : step / 2;
    if (!moved && step < maxGrade * 1e-4) break;
    if (moved) step /= 2;
  }
  if (minGrade > 0 && Math.hypot(best.gx, best.gy) < minGrade) {   // drainage wants a fall: take the best of the allowed tilts at the least grade
    let b2 = null;
    for (let k = 0; k < 16; k++) { const a = (k * Math.PI) / 8, s = score(Math.cos(a) * minGrade, Math.sin(a) * minGrade); if (s && (!b2 || s.haulMoment < b2.haulMoment)) b2 = s; }
    if (b2) best = b2;
  }
  return { z0: best.z0, gx: best.gx, gy: best.gy, cx: mx, cy: my, cut: best.cut, fill: best.fill, net: best.net, haulMoment: best.haulMoment, grade: Math.hypot(best.gx, best.gy) };
}

// ---------------------------------------------------------------------------
// Haul plan: min-cost transport between blocks of cut and blocks of fill

function blocksOf(list, n) {
  if (list.length <= n) return list.map((p) => ({ x: p.x, y: p.y, v: p.v }));
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of list) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  const k = Math.max(1, Math.ceil(Math.sqrt(n * 1.3))), sx = (x1 - x0 || 1) / k, sy = (y1 - y0 || 1) / k, map = new Map();
  for (const p of list) {
    const i = Math.min(k - 1, Math.floor((p.x - x0) / sx)), j = Math.min(k - 1, Math.floor((p.y - y0) / sy)), key = j * k + i;
    let b = map.get(key); if (!b) map.set(key, (b = { x: 0, y: 0, v: 0 }));
    b.x += p.x * p.v; b.y += p.y * p.v; b.v += p.v;
  }
  return [...map.values()].filter((b) => b.v > 0).map((b) => ({ x: b.x / b.v, y: b.y / b.v, v: b.v }));
}

/** Transportation problem by successive shortest paths (Bellman-Ford on the residual network). supply[i], demand[j], cost[i][j]. */
export function transport(supply, demand, cost) {
  const n = supply.length, m = demand.length, N = n + m + 2, S = n + m, T = n + m + 1;
  const to = [], cap = [], cst = [], adj = Array.from({ length: N }, () => []);
  const add = (u, v, c, w) => { adj[u].push(to.length); to.push(v); cap.push(c); cst.push(w); adj[v].push(to.length); to.push(u); cap.push(0); cst.push(-w); };
  for (let i = 0; i < n; i++) add(S, i, supply[i], 0);
  for (let j = 0; j < m; j++) add(n + j, T, demand[j], 0);
  const first = to.length;
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) add(i, n + j, Infinity, cost[i][j]);
  let flow = 0, guard = 0;
  for (;;) {
    const dist = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), inq = new Uint8Array(N), q = [S];
    dist[S] = 0;
    while (q.length) {
      const u = q.shift(); inq[u] = 0;
      for (const e of adj[u]) if (cap[e] > 1e-12 && dist[u] + cst[e] < dist[to[e]] - 1e-12) { dist[to[e]] = dist[u] + cst[e]; prev[to[e]] = e; if (!inq[to[e]]) { inq[to[e]] = 1; q.push(to[e]); } }
    }
    if (!Number.isFinite(dist[T])) break;
    let f = Infinity;
    for (let v = T; v !== S; v = to[prev[v] ^ 1]) f = Math.min(f, cap[prev[v]]);
    for (let v = T; v !== S; v = to[prev[v] ^ 1]) { cap[prev[v]] -= f; cap[prev[v] ^ 1] += f; }
    flow += f;
    if (++guard > 50000) break;
  }
  const flows = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const e = first + 2 * (i * m + j), f = cap[e ^ 1]; if (f > 1e-9) flows.push({ i, j, vol: f }); }
  return { flows, flow };
}

export function haulPlan(cells, designOf, z0, { area = 1, factor = 1, blocks = 60, offsite = null } = {}) {
  const cuts = [], fills = [];
  for (const p of cells) { const dz = designOf(p.x, p.y, z0) - p.zg; if (dz < 0) cuts.push({ x: p.x, y: p.y, v: -dz * area * factor }); else if (dz > 0) fills.push({ x: p.x, y: p.y, v: dz * area }); }
  const C = blocksOf(cuts, blocks), F = blocksOf(fills, blocks);
  const cutV = C.reduce((s, b) => s + b.v, 0), fillV = F.reduce((s, b) => s + b.v, 0);
  let far = offsite;
  if (far === null) { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const p of cells) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); } far = 2 * Math.hypot(x1 - x0, y1 - y0); }
  // dummy sink takes spare cut, dummy source brings missing fill; both at distance `far` so on-site moves win
  const supply = C.map((b) => b.v), demand = F.map((b) => b.v);
  const spareTotal = Math.max(0, cutV - fillV), shortTotal = Math.max(0, fillV - cutV);
  if (spareTotal > 1e-9) demand.push(spareTotal);
  if (shortTotal > 1e-9) supply.push(shortTotal);
  const cost = supply.map((_, i) => demand.map((_, j) => {
    const a = i < C.length ? C[i] : null, b = j < F.length ? F[j] : null;
    if (a && b) return Math.hypot(a.x - b.x, a.y - b.y);
    return a || b ? far : 1e9;   // dummy to dummy never
  }));
  const r = transport(supply, demand, cost);
  const flows = [];
  let moved = 0, haul = 0, spare = 0, short = 0;
  for (const f of r.flows) {
    const a = f.i < C.length ? C[f.i] : null, b = f.j < F.length ? F[f.j] : null;
    if (a && b) { const d = Math.hypot(a.x - b.x, a.y - b.y); flows.push({ from: { x: a.x, y: a.y }, to: { x: b.x, y: b.y }, vol: f.vol, dist: d }); moved += f.vol; haul += f.vol * d; }
    else if (a) spare += f.vol; else if (b) short += f.vol;
  }
  flows.sort((p, q) => q.vol - p.vol);
  return { flows, moved, haul, avg: moved > 0 ? haul / moved : 0, spare, short, totals: { cut: cutV, fill: fillV }, blocks: { cut: C.length, fill: F.length } };
}

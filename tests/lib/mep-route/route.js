/* SPDX-License-Identifier: Apache-2.0 */
/**
 * route.js — an orthogonal pipe and duct router (0.7 LC.5 step 2, session plant-design; moved to lib/mep-route for 0.10 MEP.1,
 * suggestion #1556). DOM-free (tested in Node). The Plant add-on still carries its 0.7 copy (addons/plant/lib/route.js).
 * 0.10 MEP.2: `flat: true` keeps a route in one horizontal plane (no climbs, both nozzles face along X or Y at the same height): the plan
 * route of a gravity drain, which is given its fall afterwards (gravity.js).
 * 0.10 MEP.1: `clearance` may be [x, y, z] (a rectangular duct is wider than it is high: obstacles grow by the half width
 * across and the half height up and down), and `lead` (mm) is how far a route leaves a port straight before it may turn
 * (default minLeg; a number, or [from, to]), so a terminal just under a beam can still be reached.
 *
 * Finds a pipe route between two nozzles that runs only along X, Y and Z, keeps clear of obstacles (equipment, walls, other
 * pipes as boxes), leaves each nozzle straight out, never bends twice within a minimum leg, and prefers few bends and few
 * climbs. It searches a grid whose lines are the places a good route can turn: the nozzles' lines, every obstacle's faces
 * moved out by the clearance, the preferred levels and a line halfway between neighbours; the path is found with A* over
 * (node, direction, run so far), so the number of nodes stays small whatever the size of the plant. Same input → same route.
 *
 *   route({ from: { p, out }, to: { p, out }, obstacles: [{ min, max }], od, clearance?, minLeg?, levels?, bendCost?, climbCost?, maxNodes? })
 *     p = [x, y, z] mm, out = the unit direction the pipe leaves the nozzle in; od = outside diameter (mm)
 *     → { ok: true, points: [[x, y, z]…] (nozzle to nozzle), length, bends, climbs }
 *     | { ok: false, error: 'blocked-start' | 'blocked-end' | 'no-route' | 'too-big' | 'axis' }
 *   legsOf(points) → [{ a, b, axis: 'x'|'y'|'z', len }] · lengthOf(points) · hitsObstacle(points, obstacles, clear) → bool
 */

const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const axisOf = (d) => (d[0] ? 0 : d[1] ? 1 : 2);
const dirIndex = (v) => DIRS.findIndex((d) => Math.abs(d[0] - v[0]) < 1e-6 && Math.abs(d[1] - v[1]) < 1e-6 && Math.abs(d[2] - v[2]) < 1e-6);
const EPS = 1e-6;

const inside = (p, b) => p[0] > b.min[0] + EPS && p[0] < b.max[0] - EPS && p[1] > b.min[1] + EPS && p[1] < b.max[1] - EPS && p[2] > b.min[2] + EPS && p[2] < b.max[2] - EPS;
const grow = (b, c) => { const g = Array.isArray(c) ? c : [c, c, c]; return { min: b.min.map((v, k) => v - g[k]), max: b.max.map((v, k) => v + g[k]) }; };

export function legsOf(points) {
  const out = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ax = Math.abs(d[0]) > EPS ? 0 : Math.abs(d[1]) > EPS ? 1 : 2;
    out.push({ a, b, axis: 'xyz'[ax], len: Math.abs(d[ax]) });
  }
  return out;
}
export const lengthOf = (points) => legsOf(points).reduce((n, l) => n + l.len, 0);

/** Does a route's centre line come within `clear` of any obstacle's inside? (the router's own promise, tested). */
export function hitsObstacle(points, obstacles, clear = 0) {
  for (const l of legsOf(points)) for (const o of obstacles) {
    const g = grow(o, clear);
    for (let k = 0; k <= 20; k++) { const t = k / 20; if (inside([l.a[0] + (l.b[0] - l.a[0]) * t, l.a[1] + (l.b[1] - l.a[1]) * t, l.a[2] + (l.b[2] - l.a[2]) * t], g)) return true; }
  }
  return false;
}

class Heap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(f, v) { const a = this.a; a.push([f, v]); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } }
    return top;
  }
}

export function route(opt) {
  const od = Number(opt.od) > 0 ? Number(opt.od) : 60;
  const clearance = Array.isArray(opt.clearance) && opt.clearance.length === 3 && opt.clearance.every(Number.isFinite) ? opt.clearance : Number.isFinite(opt.clearance) ? opt.clearance : od / 2 + 25;
  const minLeg = Number.isFinite(opt.minLeg) ? opt.minLeg : Math.max(2 * od, 150);
  const bendCost = Number.isFinite(opt.bendCost) ? opt.bendCost : 4 * od + 200;
  const climbCost = Number.isFinite(opt.climbCost) ? opt.climbCost : 0.3;
  const maxNodes = opt.maxNodes || 400000;
  const flat = !!opt.flat;
  const obst = (opt.obstacles || []).map((o) => grow(o, clearance));
  const d0 = dirIndex(opt.from.out), d1 = dirIndex(opt.to.out);
  if (d0 < 0 || d1 < 0 || (flat && (d0 > 3 || d1 > 3 || Math.abs(opt.from.p[2] - opt.to.p[2]) > 1e-6))) return { ok: false, error: 'axis' };   // a nozzle must face along X, Y or Z (flat: X or Y, at one height)
  const leads = (Array.isArray(opt.lead) ? opt.lead : [opt.lead, opt.lead]).map((v) => (Number.isFinite(v) && v > 0 ? v : minLeg));
  const lead = (n, L) => n.p.map((v, k) => v + n.out[k] * L);
  const s = lead(opt.from, leads[0]), g = lead(opt.to, leads[1]);
  if (obst.some((b) => inside(s, b))) return { ok: false, error: 'blocked-start' };
  if (obst.some((b) => inside(g, b))) return { ok: false, error: 'blocked-end' };

  // the grid lines: the leads, every obstacle's inflated faces, preferred levels, and the middle between neighbours
  const lines = [0, 1, 2].map((k) => {
    const set = new Set([s[k], g[k], opt.from.p[k], opt.to.p[k]]);
    for (const b of obst) { set.add(b.min[k]); set.add(b.max[k]); }
    if (k === 2) for (const z of opt.levels || []) set.add(z);
    const sorted = [...set].sort((a, b) => a - b);
    const lo = sorted[0] - minLeg * 2, hi = sorted[sorted.length - 1] + minLeg * 2;   // room to go round the outside
    const all = new Set([...sorted, lo, hi]);
    const s2 = [...all].sort((a, b) => a - b);
    for (let i = 1; i < s2.length; i++) all.add((s2[i - 1] + s2[i]) / 2);
    return [...all].sort((a, b) => a - b);
  });
  const dims = lines.map((l) => l.length);
  if (dims[0] * dims[1] * dims[2] > maxNodes) return { ok: false, error: 'too-big' };
  const idx = (i, j, k) => (i * dims[1] + j) * dims[2] + k;
  const at = (i, j, k) => [lines[0][i], lines[1][j], lines[2][k]];
  const find = (arr, v) => { let lo = 0, hi = arr.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] < v - 1e-9) lo = m + 1; else hi = m; } return lo; };
  const si = [find(lines[0], s[0]), find(lines[1], s[1]), find(lines[2], s[2])], gi = [find(lines[0], g[0]), find(lines[1], g[1]), find(lines[2], g[2])];
  const blocked = new Map();
  const nodeBlocked = (i, j, k) => { const key = idx(i, j, k); let v = blocked.get(key); if (v === undefined) { const p = at(i, j, k); v = obst.some((b) => inside(p, b)); blocked.set(key, v); } return v; };
  const edgeBlocked = (a, b) => { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]; return obst.some((o) => inside(m, o)); };

  const cap = Math.ceil(minLeg - 1e-9);   // 0.10 MEP.4: ceil, not round (a run capped below a fractional minLeg could never turn)
  const key = (i, j, k, d, run) => ((idx(i, j, k) * 6 + d) * (cap + 1)) + Math.min(cap, Math.round(run));
  const best = new Map(), parent = new Map();
  const heap = new Heap();
  const goalDirIdx = dirIndex(opt.to.out.map((v) => -v));   // arriving at the lead the way back into the nozzle
  const h = (i, j, k) => { const p = at(i, j, k); return Math.abs(p[0] - g[0]) + Math.abs(p[1] - g[1]) + Math.abs(p[2] - g[2]); };
  const k0 = key(si[0], si[1], si[2], d0, minLeg);
  best.set(k0, 0);
  heap.push(h(si[0], si[1], si[2]), { i: si[0], j: si[1], k: si[2], d: d0, run: minLeg, g: 0, key: k0 });
  let found = null;
  while (heap.size) {
    const [, n] = heap.pop();
    if (n.g > (best.get(n.key) ?? Infinity) + 1e-9) continue;
    if (n.i === gi[0] && n.j === gi[1] && n.k === gi[2] && n.d === goalDirIdx) { found = n; break; }
    for (let d = 0; d < (flat ? 4 : 6); d++) {
      if (DIRS[d][0] === -DIRS[n.d][0] && DIRS[d][1] === -DIRS[n.d][1] && DIRS[d][2] === -DIRS[n.d][2]) continue;   // no doubling back
      const turn = d !== n.d;
      if (turn && n.run < minLeg - 1e-9) continue;   // a leg is at least minLeg before it bends
      const ni = n.i + DIRS[d][0], nj = n.j + DIRS[d][1], nk = n.k + DIRS[d][2];
      if (ni < 0 || nj < 0 || nk < 0 || ni >= dims[0] || nj >= dims[1] || nk >= dims[2]) continue;
      if (nodeBlocked(ni, nj, nk)) continue;
      const a = at(n.i, n.j, n.k), b = at(ni, nj, nk);
      if (edgeBlocked(a, b)) continue;
      const step = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]) + Math.abs(b[2] - a[2]);
      const cost = n.g + step * (axisOf(DIRS[d]) === 2 ? 1 + climbCost : 1) + (turn ? bendCost : 0);
      const run = turn ? step : n.run + step;
      const kk = key(ni, nj, nk, d, run);
      if (cost < (best.get(kk) ?? Infinity) - 1e-9) {
        best.set(kk, cost); parent.set(kk, n.key);
        heap.push(cost + h(ni, nj, nk), { i: ni, j: nj, k: nk, d, run: Math.min(cap, run), g: cost, key: kk, pk: n.key });
      }
    }
  }
  if (!found) return { ok: false, error: 'no-route' };
  // walk back through the parents
  const chain = [];
  let kcur = found.key;
  const decode = (kk) => { const run = kk % (cap + 1); let r = (kk - run) / (cap + 1); const d = r % 6; r = (r - d) / 6; const k = r % dims[2]; r = (r - k) / dims[2]; const j = r % dims[1]; const i = (r - j) / dims[1]; return { i, j, k, d }; };
  while (kcur !== undefined) { const n = decode(kcur); chain.push(at(n.i, n.j, n.k)); kcur = parent.get(kcur); }
  chain.reverse();
  // nozzle, lead, corners…, lead, nozzle; collinear points removed
  const raw = [opt.from.p.slice(), ...chain, opt.to.p.slice()];
  const pts = [];
  for (const p of raw) {
    const q = pts[pts.length - 1];
    if (q && Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < EPS) continue;
    pts.push(p);
    while (pts.length >= 3) {
      const a = pts[pts.length - 3], b = pts[pts.length - 2], c = pts[pts.length - 1];
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
      const cr = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      if (Math.hypot(...cr) < 1e-6 && u[0] * v[0] + u[1] * v[1] + u[2] * v[2] > 0) pts.splice(pts.length - 2, 1); else break;
    }
  }
  const legs = legsOf(pts);
  return { ok: true, points: pts, length: legs.reduce((n, l) => n + l.len, 0), bends: legs.length - 1, climbs: legs.filter((l) => l.axis === 'z').length };
}

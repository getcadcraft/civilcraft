/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ground-surface.js — one ground-surface builder for CivilCraft (0.8 SU.911 terrain from contour lines; shared with
 * SU.935 ground from a point cloud). No DOM, no strings (issues and notes are codes with data; the UI words them), no
 * dependencies but tin.js. Tested by bin/test-civilcraft-ground.mjs.
 *
 *   buildGround({ points, breaklines, boundary, maxEdge, spacing, mode, fixFlat, interval, maxPoints })
 *       → { surface, report, extra, thinned }
 *     spacing > 0 thins `points` first (thin.js Thinner, mode 'lowest' | 'nearest' | 'average'), then builds the TIN with the
 *     breaklines (tin.js). fixFlat (needs `interval`) adds points inside flat triangles (see fixFlatTriangles).
 *
 * Contours (SU.911):
 *   levelOf(line) → z | null         line.z, else the one elevation every vertex shares (0 everywhere = none: plan linework)
 *   assignPick(lines, picks, start, interval) → lines'   picks = line indexes in the order the person clicked them; the k-th
 *       pick gets start + k·interval (a repeated index keeps its first level)
 *   assignTyped(lines, { [index]: z }) → lines'
 *   checkContours(lines, { interval, base, tol }) → [{ code, a, b?, x?, y?, z?, zb? }]
 *       codes: short (< 2 points), noz (no elevation), duplicate (same shape as line b), crossing (line a crosses line b at
 *       x, y, at different elevations), samelevel (lines at the SAME elevation that cross: a self-crossing or a stray line),
 *       offgrid (elevation not on base + k·interval)
 *   groundFromContours(lines, opts) → { surface, report, issues, breaklines, used, dropped }
 *       opts: interval, base, simplify (Douglas–Peucker tolerance, 0 = off), dropCrossing (leave out the line that crosses the
 *       most others, then the next, until none cross), fixFlat (default true when interval is given), boundary, maxEdge, extraPoints
 *   simplifyLine(pts, tol) → pts       Douglas–Peucker on x, y; the kept vertices keep their z
 *   placeByTwoPoints(a, b, a2, b2) → { k, rot, tx, ty, apply(p) }   a similarity transform (scale, rotation, shift) taking the
 *       two picked points a, b (e.g. image or PDF coordinates) to their known real-world positions a2, b2
 *   fixFlatTriangles(surface, { interval, passes, constrained }) → [{ x, y, z }]   points to add
 */

import { buildSurface } from './tin.js';
import { Thinner } from './thin.js';

const finite = (v) => typeof v === 'number' && Number.isFinite(v);

// ---------------------------------------------------------------------------
// Levels

export function levelOf(line) {
  if (finite(line?.z)) return line.z;
  const pts = line?.pts || [];
  if (!pts.length || !pts.every((p) => finite(p.z))) return null;
  const z = pts[0].z;
  if (!pts.every((p) => Math.abs(p.z - z) < 1e-9)) return null;
  return z === 0 ? null : z;
}

export function assignPick(lines, picks, start, interval) {
  const lv = new Map();
  for (const i of picks) if (!lv.has(i) && i >= 0 && i < lines.length) lv.set(i, start + lv.size * interval);
  return lines.map((l, i) => (lv.has(i) ? { ...l, z: lv.get(i) } : l));
}

export function assignTyped(lines, byIndex) {
  return lines.map((l, i) => (finite(byIndex?.[i]) ? { ...l, z: byIndex[i] } : l));
}

// ---------------------------------------------------------------------------
// Checks

function segCross(p, q, r, s) {
  const d = (q.x - p.x) * (s.y - r.y) - (q.y - p.y) * (s.x - r.x);
  if (Math.abs(d) < 1e-14) return null;
  const t = ((r.x - p.x) * (s.y - r.y) - (r.y - p.y) * (s.x - r.x)) / d;
  const u = ((r.x - p.x) * (q.y - p.y) - (r.y - p.y) * (q.x - p.x)) / d;
  if (t <= 1e-9 || t >= 1 - 1e-9 || u <= 1e-9 || u >= 1 - 1e-9) return null;   // meeting at an end is not a crossing
  return { x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) };
}

const closedPts = (l) => (l.closed && l.pts.length > 2 && (l.pts[0].x !== l.pts[l.pts.length - 1].x || l.pts[0].y !== l.pts[l.pts.length - 1].y) ? [...l.pts, l.pts[0]] : l.pts);

export function checkContours(lines, { interval = 0, base = 0, tol = 1e-6, maxIssues = 500 } = {}) {
  const issues = [], push = (i) => { if (issues.length < maxIssues) issues.push(i); };
  const levels = lines.map(levelOf);
  lines.forEach((l, i) => {
    if ((l.pts || []).length < 2) push({ code: 'short', a: i });
    else if (levels[i] === null) push({ code: 'noz', a: i });
    else if (interval > 0) {
      const k = (levels[i] - base) / interval;
      if (Math.abs(k - Math.round(k)) > 1e-6) push({ code: 'offgrid', a: i, z: levels[i] });
    }
  });
  // duplicates: same vertex set (either direction)
  const sig = new Map();
  lines.forEach((l, i) => {
    if ((l.pts || []).length < 2) return;
    const r = (v) => Math.round(v / Math.max(tol, 1e-9));
    const f = l.pts.map((p) => r(p.x) + ',' + r(p.y)), b = f.slice().reverse();
    const key = (f.join(';') < b.join(';') ? f : b).join(';');
    if (sig.has(key)) push({ code: 'duplicate', a: i, b: sig.get(key) }); else sig.set(key, i);
  });
  // crossings: segments hashed on a grid
  const segs = [];
  lines.forEach((l, i) => {
    const pts = closedPts(l);
    for (let k = 0; k + 1 < (pts?.length || 0); k++) segs.push({ i, k, p: pts[k], q: pts[k + 1] });
  });
  if (segs.length) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, len = 0;
    for (const s of segs) { minX = Math.min(minX, s.p.x, s.q.x); minY = Math.min(minY, s.p.y, s.q.y); maxX = Math.max(maxX, s.p.x, s.q.x); maxY = Math.max(maxY, s.p.y, s.q.y); len += Math.hypot(s.q.x - s.p.x, s.q.y - s.p.y); }
    const cell = Math.max(len / segs.length * 2, (Math.max(maxX - minX, maxY - minY) || 1) / 2000, 1e-9);
    const grid = new Map();
    const cells = (s, f) => {
      const x0 = Math.floor((Math.min(s.p.x, s.q.x) - minX) / cell), x1 = Math.floor((Math.max(s.p.x, s.q.x) - minX) / cell);
      const y0 = Math.floor((Math.min(s.p.y, s.q.y) - minY) / cell), y1 = Math.floor((Math.max(s.p.y, s.q.y) - minY) / cell);
      if ((x1 - x0 + 1) * (y1 - y0 + 1) > 4096) { f('big'); return; }
      for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) f(x + ',' + y);
    };
    segs.forEach((s, n) => cells(s, (c) => { let a = grid.get(c); if (!a) grid.set(c, a = []); a.push(n); }));
    const seen = new Set(), pairSeen = new Set();
    for (const list of grid.values()) {
      for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) {
        const A = segs[list[a]], B = segs[list[b]];
        if (A.i === B.i && Math.abs(A.k - B.k) < 2) continue;   // neighbours on one line
        const pk = list[a] + '_' + list[b];
        if (seen.has(pk)) continue; seen.add(pk);
        const x = segCross(A.p, A.q, B.p, B.q);
        if (!x) continue;
        const lo = Math.min(A.i, B.i), hi = Math.max(A.i, B.i), key = lo + '_' + hi;
        if (pairSeen.has(key)) continue; pairSeen.add(key);
        const same = levels[A.i] !== null && levels[A.i] === levels[B.i];
        push({ code: same && A.i !== B.i ? 'samelevel' : 'crossing', a: lo, b: hi, x: x.x, y: x.y, z: levels[lo], zb: levels[hi] });
      }
    }
  }
  return issues;
}

// ---------------------------------------------------------------------------
// Line helpers

export function simplifyLine(pts, tol) {
  if (!(tol > 0) || pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [i, j] = stack.pop();
    let best = -1, bd = tol;
    const a = pts[i], b = pts[j], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
    for (let k = i + 1; k < j; k++) {
      const d = L > 0 ? Math.abs((pts[k].x - a.x) * dy - (pts[k].y - a.y) * dx) / L : Math.hypot(pts[k].x - a.x, pts[k].y - a.y);
      if (d > bd) { bd = d; best = k; }
    }
    if (best > 0) { keep[best] = 1; stack.push([i, best], [best, j]); }
  }
  return pts.filter((_, k) => keep[k]);
}

export function placeByTwoPoints(a, b, a2, b2) {
  const d1x = b.x - a.x, d1y = b.y - a.y, d2x = b2.x - a2.x, d2y = b2.y - a2.y;
  const l1 = Math.hypot(d1x, d1y), l2 = Math.hypot(d2x, d2y);
  if (!(l1 > 0) || !(l2 > 0)) return null;
  const k = l2 / l1, rot = Math.atan2(d2y, d2x) - Math.atan2(d1y, d1x), c = Math.cos(rot) * k, s = Math.sin(rot) * k;
  const tx = a2.x - (c * a.x - s * a.y), ty = a2.y - (s * a.x + c * a.y);
  return { k, rot, tx, ty, apply: (p) => ({ ...p, x: c * p.x - s * p.y + tx, y: s * p.x + c * p.y + ty }) };
}

// ---------------------------------------------------------------------------
// Flat triangles. Contours as breaklines leave flat triangles where a ridge, a valley or a hilltop lies between two stretches
// of the same level (every vertex at one elevation). Each such triangle gets a point at its centroid whose elevation continues
// the slope of the neighbour across a contour edge: z0 − g·h, g = the neighbour's slope toward the edge, h = the centroid's
// distance from that edge. Valley and hilltop come out the right way round because the neighbour is on the far side. Capped at
// half an interval from the contour (the next contour is a whole interval away).

export function fixFlatTriangles(surface, { interval = 0, constrained = null } = {}) {
  const { X, Y, Z, tris, ox, oy } = surface;
  const nT = tris.length / 3, eps = 1e-9;
  const key = (a, b) => (a < b ? a + '_' + b : b + '_' + a);
  const edgeTris = new Map();
  for (let t = 0; t < nT; t++) for (let e = 0; e < 3; e++) {
    const k = key(tris[3 * t + e], tris[3 * t + (e + 1) % 3]);
    const l = edgeTris.get(k); if (l) l.push(t); else edgeTris.set(k, [t]);
  }
  const con = new Set((constrained || surface.constrainedEdges || []).map(([a, b]) => key(a, b)));
  const flat = (t) => Math.abs(Z[tris[3 * t]] - Z[tris[3 * t + 1]]) < eps && Math.abs(Z[tris[3 * t + 1]] - Z[tris[3 * t + 2]]) < eps;
  const dist = (p, a, b) => { const dx = X[b] - X[a], dy = Y[b] - Y[a]; return Math.abs((X[p] - X[a]) * dy - (Y[p] - Y[a]) * dx) / (Math.hypot(dx, dy) || 1); };
  const out = [];
  for (let t = 0; t < nT; t++) {
    if (!flat(t)) continue;
    const v = [tris[3 * t], tris[3 * t + 1], tris[3 * t + 2]], z0 = Z[v[0]];
    const area2 = Math.abs((X[v[1]] - X[v[0]]) * (Y[v[2]] - Y[v[0]]) - (X[v[2]] - X[v[0]]) * (Y[v[1]] - Y[v[0]]));
    if (area2 < 1e-12) continue;
    const ests = [];
    for (let e = 0; e < 3; e++) {
      const a = v[e], b = v[(e + 1) % 3], c = v[(e + 2) % 3], k = key(a, b);
      if (!con.has(k)) continue;
      const other = (edgeTris.get(k) || []).find((u) => u !== t);
      if (other === undefined || flat(other)) continue;
      const apex = [tris[3 * other], tris[3 * other + 1], tris[3 * other + 2]].find((q) => q !== a && q !== b);
      const hn = dist(apex, a, b);
      if (!(hn > 0)) continue;
      ests.push(z0 - ((Z[apex] - z0) / hn) * (dist(c, a, b) / 3));
    }
    if (!ests.length) continue;
    let z = ests.reduce((s, q) => s + q, 0) / ests.length;
    if (interval > 0) z = Math.max(z0 - interval / 2, Math.min(z0 + interval / 2, z));
    out.push({ x: (X[v[0]] + X[v[1]] + X[v[2]]) / 3 + ox, y: (Y[v[0]] + Y[v[1]] + Y[v[2]]) / 3 + oy, z });
  }
  return out;
}

// ---------------------------------------------------------------------------
// The builder

export function buildGround({ points = [], breaklines = [], boundary = null, maxEdge = 0, spacing = 0, mode = 'nearest', fixFlat = false, interval = 0, passes = 3, maxPoints = Infinity } = {}) {
  let pts = points, thinned = null;
  if (spacing > 0 && points.length) {
    const th = new Thinner({ cell: spacing, mode, max: maxPoints });
    for (const p of points) th.add(p.x, p.y, p.z, p.cls);
    pts = th.points();
    thinned = { seen: th.seen, kept: th.count, capped: th.capped };
  }
  let r = buildSurface({ points: pts, breaklines, boundary, maxEdge });
  const extra = [];
  if (fixFlat && r.surface) {
    for (let pass = 0; pass < passes; pass++) {
      const add = fixFlatTriangles(r.surface, { interval });
      if (!add.length) break;
      extra.push(...add);
      r = buildSurface({ points: [...pts, ...extra], breaklines, boundary, maxEdge });
      if (!r.surface) break;
    }
  }
  r.report.flatPoints = extra.length;
  return { surface: r.surface, report: r.report, extra, thinned };
}

export function groundFromContours(lines, { interval = 0, base = 0, simplify = 0, dropCrossing = false, fixFlat = interval > 0, boundary = null, maxEdge = 0, extraPoints = [] } = {}) {
  const issues = checkContours(lines, { interval, base });
  const bad = new Set(issues.filter((i) => i.code === 'short' || i.code === 'noz').map((i) => i.a));
  for (const i of issues) if (i.code === 'duplicate') bad.add(i.a);
  if (dropCrossing) {   // leave out the line that crosses the most others, again, until none cross (one stray line, not every contour it cuts)
    const pairs = issues.filter((i) => (i.code === 'crossing' || i.code === 'samelevel') && !bad.has(i.a) && !bad.has(i.b)).map((i) => [i.a, i.b]);
    for (;;) {
      const deg = new Map();
      for (const [a, b] of pairs) if (!bad.has(a) && !bad.has(b)) { deg.set(a, (deg.get(a) || 0) + 1); deg.set(b, (deg.get(b) || 0) + 1); }
      let worst = -1, wd = 0;
      for (const [k, d] of deg) if (d > wd || (d === wd && k > worst)) { worst = k; wd = d; }
      if (worst < 0) break;
      bad.add(worst);
    }
  }
  const breaklines = [], used = [], dropped = [];
  lines.forEach((l, i) => {
    if (bad.has(i)) { dropped.push(i); return; }
    const z = levelOf(l), pts = simplifyLine(closedPts(l), simplify).map((p) => ({ x: p.x, y: p.y, z }));
    breaklines.push({ name: l.name || 'contour ' + (i + 1), pts });
    used.push(i);
  });
  const g = buildGround({ points: extraPoints, breaklines, boundary, maxEdge, fixFlat, interval });
  return { surface: g.surface, report: g.report, issues, breaklines, used, dropped, extra: g.extra };
}

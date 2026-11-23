/* SPDX-License-Identifier: Apache-2.0 */
/**
 * street.js — do the aisles of a parking layout reach a street? (SU.1815). Host-free, plain numbers. Input is what parking.js `layout()` returns (aisles: [{ poly }],
 * stalls: [{ poly }]) and the streets as polylines (alignments, edges of road, or any line the person picks).
 *
 *   streetAccess(layout, streets, { tol }) → { ok, aisles: [{ index, reaches, group }], groups, unreachableAisles, unreachableStalls, entrances: [{ x, y, street }] }
 *     Two aisles connect when their outlines come within `tol` (default 0.05 of the aisle width, at least 1e-6); an aisle reaches a street when its outline comes
 *     within `reach` (default the aisle's own width: a driveway cannot be wider than the gap it crosses) of a street line; a stall is reached when it touches
 *     (within tol) a reaching aisle. `ok` = every aisle that has stalls beside it reaches a street. An empty layout is ok (nothing to reach).
 */
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
function segDist(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
  const u = l2 > 0 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
  return Math.hypot(p.x - (a.x + u * dx), p.y - (a.y + u * dy));
}
const cross = (a, b, c, d) => {
  const o = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
};
const inside = (p, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c; } return c; };
/** Distance between two outlines (closed polygon or open polyline); 0 when they cross or one holds the other. */
function dist(A, closedA, B, closedB) {
  const na = closedA ? A.length : A.length - 1, nb = closedB ? B.length : B.length - 1;
  let best = Infinity;
  for (let i = 0; i < na; i++) {
    const a = A[i], b = A[(i + 1) % A.length];
    for (let j = 0; j < nb; j++) {
      const c = B[j], d = B[(j + 1) % B.length];
      if (cross(a, b, c, d)) return 0;
      best = Math.min(best, segDist(a, c, d), segDist(b, c, d), segDist(c, a, b), segDist(d, a, b));
    }
  }
  if (closedA && A.length >= 3 && B.length && inside(B[0], A)) return 0;
  if (closedB && B.length >= 3 && A.length && inside(A[0], B)) return 0;
  return best;
}
const width = (P) => { // the shorter side of the outline's bounding box: an aisle's width, near enough
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const p of P) { a = Math.min(a, p.x); b = Math.min(b, p.y); c = Math.max(c, p.x); d = Math.max(d, p.y); }
  return Math.min(c - a, d - b);
};

export function streetAccess(layout, streets, { tol = null, reach = null } = {}) {
  const A = (layout?.aisles || []).filter((x) => Array.isArray(x.poly) && x.poly.length >= 3), S = (layout?.stalls || []).filter((x) => Array.isArray(x.poly) && x.poly.length >= 3);
  const L = (streets || []).map((s) => (Array.isArray(s) ? s : s?.pts)).filter((p) => Array.isArray(p) && p.length >= 2 && p.every((q) => fin(q.x) && fin(q.y)));
  const out = { ok: true, aisles: [], groups: 0, unreachableAisles: [], unreachableStalls: 0, entrances: [] };
  if (!A.length) return out;
  const t = fin(tol) && tol >= 0 ? tol : Math.max(1e-6, 0.05 * Math.min(...A.map((x) => width(x.poly))));
  // union-find over aisles that touch
  const par = A.map((_, i) => i), find = (i) => (par[i] === i ? i : (par[i] = find(par[i])));
  for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) if (dist(A[i].poly, true, A[j].poly, true) <= t) par[find(i)] = find(j);
  const reachesBy = new Map();   // group root -> [{ street, at }]
  A.forEach((a, i) => {
    const r = fin(reach) && reach >= 0 ? reach : width(a.poly);
    L.forEach((line, si) => { const d = dist(a.poly, true, line, false); if (d <= r + 1e-9) { const k = find(i); if (!reachesBy.has(k)) reachesBy.set(k, []); reachesBy.get(k).push({ street: si, i, d }); } });
  });
  const roots = new Map(); let g = 0;
  A.forEach((_, i) => { const k = find(i); if (!roots.has(k)) roots.set(k, ++g); });
  out.groups = g;
  A.forEach((a, i) => {
    const k = find(i), reaches = reachesBy.has(k);
    out.aisles.push({ index: i, reaches, group: roots.get(k) });
    if (!reaches) out.unreachableAisles.push(i);
  });
  for (const [k, list] of reachesBy) { const best = list.sort((x, y) => x.d - y.d)[0]; const p = A[best.i].poly; out.entrances.push({ x: p.reduce((s, q) => s + q.x, 0) / p.length, y: p.reduce((s, q) => s + q.y, 0) / p.length, street: best.street, group: roots.get(k) }); }
  const goodIdx = A.map((_, i) => i).filter((i) => reachesBy.has(find(i)));
  for (const s of S) if (!goodIdx.some((i) => dist(s.poly, true, A[i].poly, true) <= t)) out.unreachableStalls++;
  // ok: every aisle that has a stall beside it reaches a street
  const used = (i) => S.some((s) => dist(s.poly, true, A[i].poly, true) <= t);
  out.ok = !out.unreachableAisles.some(used);
  return out;
}

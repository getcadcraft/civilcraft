/* SPDX-License-Identifier: Apache-2.0 */
/** 2-D geometry for lib/pcb: capsules, polygons, distances, point tests. Millimetres on boards, micrometres in layout; the functions do not care. */
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export function pointSegDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy; if (l2 === 0) return dist(p, a);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)); return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
const orient = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
export function segsIntersect(a, b, c, d) {
  const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
  if (((o1 > 0 && o2 < 0) || (o1 < 0 && o2 > 0)) && ((o3 > 0 && o4 < 0) || (o3 < 0 && o4 > 0))) return true;
  const on = (p, q, r) => Math.min(p[0], q[0]) <= r[0] && r[0] <= Math.max(p[0], q[0]) && Math.min(p[1], q[1]) <= r[1] && r[1] <= Math.max(p[1], q[1]);
  return (o1 === 0 && on(a, b, c)) || (o2 === 0 && on(a, b, d)) || (o3 === 0 && on(c, d, a)) || (o4 === 0 && on(c, d, b));
}
export function segSegDist(a, b, c, d) { if (segsIntersect(a, b, c, d)) return 0; return Math.min(pointSegDist(a, c, d), pointSegDist(b, c, d), pointSegDist(c, a, b), pointSegDist(d, a, b)); }
export function pointInPoly(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside; }
  return inside;
}
export const polyArea = (poly) => { let s = 0; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
export const bbox = (pts) => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const p of pts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); } return [x0, y0, x1, y1]; };
export function polyEdges(poly) { const e = []; for (let i = 0; i < poly.length; i++) e.push([poly[i], poly[(i + 1) % poly.length]]); return e; }
/** Distance between two closed polygons (0 if they touch, cross or one contains the other). */
export function polyPolyDist(P, Q) {
  if (pointInPoly(P[0], Q) || pointInPoly(Q[0], P)) return 0;
  let m = Infinity; for (const [a, b] of polyEdges(P)) for (const [c, d] of polyEdges(Q)) { const v = segSegDist(a, b, c, d); if (v < m) m = v; if (m === 0) return 0; } return m;
}
export function segPolyDist(a, b, Q) { if (pointInPoly(a, Q) || pointInPoly(b, Q)) return 0; let m = Infinity; for (const [c, d] of polyEdges(Q)) { const v = segSegDist(a, b, c, d); if (v < m) m = v; if (m === 0) return 0; } return m; }
export function pointPolyDist(p, Q) { if (pointInPoly(p, Q)) return 0; let m = Infinity; for (const [c, d] of polyEdges(Q)) m = Math.min(m, pointSegDist(p, c, d)); return m; }

/** A copper/solid primitive: {k:'cap', a, b, r} (a stadium; a = b is a circle) or {k:'poly', pts, r:0}. Gap between two primitives (edge to edge, negative never: 0 when touching). */
export function gap(s, t) {
  if (s.k === 'cap' && t.k === 'cap') return Math.max(0, segSegDist(s.a, s.b, t.a, t.b) - s.r - t.r);
  if (s.k === 'cap' && t.k === 'poly') return Math.max(0, segPolyDist(s.a, s.b, t.pts) - s.r);
  if (s.k === 'poly' && t.k === 'cap') return Math.max(0, segPolyDist(t.a, t.b, s.pts) - t.r);
  return polyPolyDist(s.pts, t.pts);
}
export function primBox(s) { if (s.k === 'cap') return [Math.min(s.a[0], s.b[0]) - s.r, Math.min(s.a[1], s.b[1]) - s.r, Math.max(s.a[0], s.b[0]) + s.r, Math.max(s.a[1], s.b[1]) + s.r]; return bbox(s.pts); }
/** Distance from a point to a primitive's edge (0 inside). */
export function pointPrimDist(p, s) { if (s.k === 'cap') return Math.max(0, pointSegDist(p, s.a, s.b) - s.r); return pointPolyDist(p, s.pts); }
export const rotPt = (p, deg) => { const c = Math.cos(deg * Math.PI / 180), s = Math.sin(deg * Math.PI / 180); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
export function rectPoly(cx, cy, w, h, deg = 0) { return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map((p) => { const r = rotPt(p, deg); return [cx + r[0], cy + r[1]]; }); }

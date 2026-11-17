// SPDX-License-Identifier: Apache-2.0
/**
 * curve.js — the curves a model line can be, in the coordinates of its plane (session bk-tools-b-10). Host-free, no DOM, no IFC.
 * Canonical in lib/workplane (tools/workplane/sync.mjs copies it to the hosts).
 *
 *   KINDS = ['line', 'polyline', 'arc']
 *   arcThrough(a, m, b) → { c, r, a0, a1, ccw, sweep } | null    the arc from a through m to b (null: the three are in line)
 *   arcPoints(arc, chord?) → [[u, v] …]     the arc as points, a → b, no chord further than `chord` from the arc (default 2)
 *   curvePoints(kind, pts, closed?) → [[u, v] …]   what to draw: the points themselves, or the arc's
 *   curveLength(kind, pts, closed?)         the true length (an arc's own, not its chords')
 *   curveProblem(kind, pts) → null | 'short' | 'inline'   why nothing can be made (under two points or no length; an arc's
 *                                           three points in one line)
 */
export const KINDS = ['line', 'polyline', 'arc'];
const d2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function arcThrough(a, m, b) {
  const ax = a[0], ay = a[1], bx = m[0], by = m[1], cx = b[0], cy = b[1];
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  const scale = Math.max(d2(a, m), d2(m, b), d2(a, b));
  if (Math.abs(d) < 1e-9 * scale * scale || scale < 1e-9) return null;
  const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
  const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
  const r = Math.hypot(ax - ux, ay - uy);
  const ang = (p) => Math.atan2(p[1] - uy, p[0] - ux);
  const a0 = ang(a), am = ang(m), ab = ang(b);
  const turn = (from, to) => { let t = to - from; while (t < 0) t += 2 * Math.PI; while (t >= 2 * Math.PI) t -= 2 * Math.PI; return t; };
  const ccw = turn(a0, am) < turn(a0, ab);   // going round counter-clockwise from a, m comes before b
  const sweep = ccw ? turn(a0, ab) : 2 * Math.PI - turn(a0, ab);
  return { c: [ux, uy], r, a0, a1: ccw ? a0 + sweep : a0 - sweep, ccw, sweep };
}
export function arcPoints(arc, chord = 2) {
  const step = 2 * Math.acos(Math.max(0, Math.min(1, 1 - Math.min(chord, arc.r * 0.5) / arc.r)));
  const n = Math.max(2, Math.min(720, Math.ceil(arc.sweep / (step || 0.1))));
  const out = [];
  for (let i = 0; i <= n; i++) { const t = arc.a0 + (arc.a1 - arc.a0) * (i / n); out.push([arc.c[0] + arc.r * Math.cos(t), arc.c[1] + arc.r * Math.sin(t)]); }
  return out;
}
export function curveProblem(kind, pts) {
  if (!Array.isArray(pts) || pts.length < (kind === 'arc' ? 3 : 2)) return 'short';
  if (kind === 'arc') return d2(pts[0], pts[2]) < 1e-6 ? 'short' : arcThrough(pts[0], pts[1], pts[2]) ? null : 'inline';
  let L = 0; for (let i = 1; i < pts.length; i++) L += d2(pts[i - 1], pts[i]);
  return L < 1e-6 ? 'short' : null;
}
export function curvePoints(kind, pts, closed = false) {
  if (kind === 'arc') { const a = arcThrough(pts[0], pts[1], pts[2]); return a ? arcPoints(a) : [pts[0], pts[2]]; }
  const p = pts.map((q) => [q[0], q[1]]);
  if (closed && kind === 'polyline' && p.length > 2) p.push([p[0][0], p[0][1]]);
  return p;
}
export function curveLength(kind, pts, closed = false) {
  if (kind === 'arc') { const a = arcThrough(pts[0], pts[1], pts[2]); return a ? a.r * a.sweep : d2(pts[0], pts[2]); }
  const p = curvePoints(kind, pts, closed);
  let L = 0; for (let i = 1; i < p.length; i++) L += d2(p[i - 1], p[i]);
  return L;
}

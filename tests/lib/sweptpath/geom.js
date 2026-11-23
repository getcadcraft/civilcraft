/* SPDX-License-Identifier: Apache-2.0 */
/** geom.js — plain 2D helpers of the swept path engine: points are {x, y}, polygons and polylines are arrays of them. DOM-free, no imports. */
export const fin = (v) => typeof v === 'number' && Number.isFinite(v);
export const D2R = Math.PI / 180;
export const len = (P) => { let s = 0; for (let i = 1; i < P.length; i++) s += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y); return s; };
export const bbox = (P) => { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const p of P) { if (p.x < a) a = p.x; if (p.y < b) b = p.y; if (p.x > c) c = p.x; if (p.y > d) d = p.y; } return { minX: a, minY: b, maxX: c, maxY: d }; };
export const polyArea = (P) => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a.x * b.y - b.x * a.y; } return s / 2; };

/** Distance from point p to segment a-b. */
export function distPointSeg(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
  let u = l2 > 0 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2 : 0;
  u = Math.max(0, Math.min(1, u));
  return Math.hypot(p.x - (a.x + u * dx), p.y - (a.y + u * dy));
}
/** Do segments a-b and c-d cross or touch? */
export function segsCross(a, b, c, d) {
  const o = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = o(a, b, c), d2 = o(a, b, d), d3 = o(c, d, a), d4 = o(c, d, b);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  const on = (p, q, r) => Math.min(p.x, q.x) <= r.x && r.x <= Math.max(p.x, q.x) && Math.min(p.y, q.y) <= r.y && r.y <= Math.max(p.y, q.y);
  return (d1 === 0 && on(a, b, c)) || (d2 === 0 && on(a, b, d)) || (d3 === 0 && on(c, d, a)) || (d4 === 0 && on(c, d, b));
}
/** Ray casting. */
export function inPoly(p, P) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const a = P[i], b = P[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}
/** Smallest distance between a closed polygon (the body) and a polyline or polygon; 0 when they cross or one holds the other. */
export function polyDist(body, line, closed = false) {
  const n = line.length; if (!n) return Infinity;
  const m = closed ? n : n - 1;
  let best = Infinity;
  if (n === 1) { if (inPoly(line[0], body)) return 0; for (let i = 0; i < body.length; i++) best = Math.min(best, distPointSeg(line[0], body[i], body[(i + 1) % body.length])); return best; }
  for (let i = 0; i < m; i++) {
    const a = line[i], b = line[(i + 1) % n];
    for (let k = 0; k < body.length; k++) {
      const c = body[k], d = body[(k + 1) % body.length];
      if (segsCross(a, b, c, d)) return 0;
      best = Math.min(best, distPointSeg(a, c, d), distPointSeg(b, c, d), distPointSeg(c, a, b), distPointSeg(d, a, b));
    }
  }
  if (closed && n >= 3 && (inPoly(body[0], line) || inPoly(line[0], body))) return 0;
  return best;
}
/** The point at arc length s along a polyline: {x, y, dir}. s is clamped to the line. */
export function pointAt(P, s, cum) {
  const c = cum || cumulative(P), L = c[c.length - 1];
  const t = Math.max(0, Math.min(L, s));
  let lo = 0, hi = c.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (c[mid] <= t) lo = mid; else hi = mid; }
  const a = P[lo], b = P[Math.min(lo + 1, P.length - 1)], seg = c[Math.min(lo + 1, c.length - 1)] - c[lo];
  const u = seg > 0 ? (t - c[lo]) / seg : 0;
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, dir: Math.atan2(b.y - a.y, b.x - a.x) };
}
export function cumulative(P) { const c = [0]; for (let i = 1; i < P.length; i++) c.push(c[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y)); return c; }
/** Chaikin corner cutting, `n` rounds, ends kept: a smooth path from a rough one. */
export function chaikin(P, n = 3) {
  let Q = P.map((p) => ({ x: p.x, y: p.y }));
  for (let r = 0; r < n && Q.length > 2; r++) {
    const R = [Q[0]];
    for (let i = 0; i < Q.length - 1; i++) { const a = Q[i], b = Q[i + 1]; R.push({ x: 0.75 * a.x + 0.25 * b.x, y: 0.75 * a.y + 0.25 * b.y }, { x: 0.25 * a.x + 0.75 * b.x, y: 0.25 * a.y + 0.75 * b.y }); }
    R.push(Q[Q.length - 1]); Q = R;
  }
  return Q;
}
/** A path with bulges ({x, y, b}) as straight pieces, an arc cut so no piece is further than `tol` from it. */
export function flattenBulge(path, tol = 0.01) {
  const out = [];
  for (let i = 0; i < path.length; i++) {
    const a = path[i]; out.push({ x: a.x, y: a.y });
    const b = path[i + 1], bb = a.b;
    if (!b || !fin(bb) || Math.abs(bb) < 1e-9) continue;
    const dx = b.x - a.x, dy = b.y - a.y, c = Math.hypot(dx, dy); if (!(c > 1e-12)) continue;
    const k = (1 - bb * bb) / (4 * bb), cx = (a.x + b.x) / 2 - k * dy, cy = (a.y + b.y) / 2 + k * dx;
    const r = (c * (1 + bb * bb)) / (4 * Math.abs(bb)), sweep = 4 * Math.atan(bb), a0 = Math.atan2(a.y - cy, a.x - cx);
    const step = r > tol ? 2 * Math.acos(1 - tol / r) : Math.PI, pieces = Math.max(1, Math.min(720, Math.ceil(Math.abs(sweep) / Math.min(step, 5 * D2R))));
    for (let s = 1; s < pieces; s++) { const th = a0 + (sweep * s) / pieces; out.push({ x: cx + r * Math.cos(th), y: cy + r * Math.sin(th) }); }
  }
  return out;
}
/** A circle or an arc as points: centre, radius, from/to angle (radians, + = counter-clockwise), pieces. */
export function arcPts(cx, cy, r, a0, a1, pieces = 0) {
  const sweep = a1 - a0, k = pieces || Math.max(2, Math.ceil(Math.abs(sweep) / (3 * D2R)));
  const out = []; for (let i = 0; i <= k; i++) { const t = a0 + (sweep * i) / k; out.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) }); }
  return out;
}
/** The smallest radius of curvature along a polyline (circle through each three points that are at least `minChord` apart), Infinity for a straight one. */
export function minRadius(P, minChord = 0) {
  let best = Infinity, i = 0;
  while (i < P.length - 2) {
    let j = i + 1; while (j < P.length - 1 && Math.hypot(P[j].x - P[i].x, P[j].y - P[i].y) < minChord) j++;
    let k = j + 1; while (k < P.length - 1 && Math.hypot(P[k].x - P[j].x, P[k].y - P[j].y) < minChord) k++;
    if (k >= P.length) break;
    const a = P[i], b = P[j], c = P[k], ab = Math.hypot(b.x - a.x, b.y - a.y), bc = Math.hypot(c.x - b.x, c.y - b.y), ca = Math.hypot(a.x - c.x, a.y - c.y);
    const area2 = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
    if (area2 > 1e-12) best = Math.min(best, (ab * bc * ca) / (2 * area2));
    i = j;
  }
  return best;
}

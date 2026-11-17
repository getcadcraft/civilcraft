/* SPDX-License-Identifier: Apache-2.0 */
/**
 * contour-smooth.js — smooth the traced contour lines of a surface without letting them cross (0.9.1, from /suggest #1500).
 * No DOM, no strings, no dependencies; works on any tin.js Surface (a triangulation, a gridded surface, a TIN read from a file).
 * Tested by bin/test-civilcraft-contour-smooth.mjs.
 *
 *   LEVELS                                   { none, light, strong } → { handle, band }
 *   smoothContours(surface, interval, { level, base, maxLevels }) → [{ z, pts:[{x,y}], closed }]   (same shape as surface.contours)
 *       level 'none' (or unknown) returns surface.contours(interval) itself: nothing changes.
 *
 * Method. A traced contour is a chain of straight pieces, one per triangle, whose corners sit on triangle edges. Each piece
 * is replaced by a cubic Bézier curve between the same two corners (the corners do not move, so the line still crosses every
 * triangle edge exactly where the surface is at that elevation). The curve leaves each corner along one shared tangent, so
 * the line has no kink there: the tangent is the Catmull–Rom one for uneven spacing (E. Catmull, R. Rom, "A class of local
 * interpolating splines", Computer Aided Geometric Design, 1974), written as Bézier handles (G. Farin, "Curves and Surfaces
 * for CAGD", ch. 4 and 8: Hermite to Bézier form, and the convex hull property).
 *
 * Why lines cannot cross. A Bézier curve lies inside the convex hull of its four control points (Farin). The two end points
 * are on the triangle; each handle is shortened (halved, at most four times, then dropped) until its control point is
 *   (1) inside the same triangle, and
 *   (2) at a surface elevation within `band` × interval of the contour's own elevation.
 * The surface is a plane over one triangle, so every point of the curve is then inside that triangle and within
 * band × interval of the contour's elevation. With band < 0.5 two contours of different elevations can never meet; two lines
 * of the same elevation never share a triangle, and a curve touches its triangle's edges only at its own two corners.
 *
 * Maximum movement (stated to the person in Help):
 *   light    handles 1/6 of the piece; never more than 10 % of the way to the next contour; never farther from the straight
 *            piece than 1/6 of that piece's length
 *   strong   handles 1/3 of the piece (the usual spline); never more than 25 % of the way to the next contour; never farther
 *            from the straight piece than 1/3 of that piece's length
 *   both     never outside the triangle the piece crosses
 *
 * Breaklines. A corner on a constrained edge (surface.constrainedEdges: breaklines and the boundary) keeps its kink: the two
 * pieces meeting there get no shared tangent.
 */

export const LEVELS = {
  none: null,
  light: { handle: 1 / 6, band: 0.10 },
  strong: { handle: 1 / 3, band: 0.25 },
};

const SHRINK = [1, 0.5, 0.25, 0.125, 0.0625, 0];
const INSIDE = 1e-9;        // a control point must be this far inside its triangle (barycentric)
const TURN = Math.PI / 22;  // one output segment per this much turning of the curve
const MAX_SEG = 8;

export function smoothContours(surface, interval, { level = 'none', base = 0, maxLevels = 2000 } = {}) {
  const L = typeof level === 'string' && Object.hasOwn(LEVELS, level) ? LEVELS[level] : null;
  if (!L) return surface.contours(interval, { base, maxLevels });
  const lines = surface.contours(interval, { base, maxLevels, keys: true });
  if (!lines) return lines;
  const hard = new Set();
  for (const [a, b] of surface.constrainedEdges || []) hard.add(a < b ? a + '_' + b : b + '_' + a);
  return lines.map((c) => smoothLine(surface, c, interval, L, hard));
}

function smoothLine(S, c, interval, L, hard) {
  const { X, Y, Z, ox, oy } = S;
  let V = c.pts.map((p) => ({ x: p.x - ox, y: p.y - oy, e: p.e }));
  const sameEdge = (p, q) => (p.e[0] === q.e[0] && p.e[1] === q.e[1]) || (p.e[0] === q.e[1] && p.e[1] === q.e[0]);
  const loop = c.closed && V.length > 3 && sameEdge(V[0], V[V.length - 1]);   // tin.js repeats the first point at the end of a closed line
  if (loop) V = V.slice(0, -1);
  const n = V.length;
  if (n < 3) return { z: c.z, pts: c.pts.map((p) => ({ x: p.x, y: p.y })), closed: c.closed };
  const at = (i) => (loop ? V[((i % n) + n) % n] : V[i]);
  const isHard = (p) => hard.has(p.e[0] < p.e[1] ? p.e[0] + '_' + p.e[1] : p.e[1] + '_' + p.e[0]);

  // one shared tangent per corner (unit vector), or null: an end of an open line, a corner on a breakline, a repeated point
  const tan = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (!loop && (i === 0 || i === n - 1)) continue;
    const p = at(i);
    if (isHard(p)) continue;
    const a = at(i - 1), b = at(i + 1);
    const ux = p.x - a.x, uy = p.y - a.y, vx = b.x - p.x, vy = b.y - p.y;
    const du = Math.hypot(ux, uy), dv = Math.hypot(vx, vy);
    if (!(du > 0) || !(dv > 0)) continue;
    // Catmull–Rom for uneven spacing: each chord's direction weighted by the other chord's length (the short side wins)
    const tx = (ux / du) * dv + (vx / dv) * du, ty = (uy / du) * dv + (vy / dv) * du, tl = Math.hypot(tx, ty);
    if (tl > 1e-12 * (du + dv)) tan[i] = [tx / tl, ty / tl];
  }

  const out = [{ x: V[0].x + ox, y: V[0].y + oy }];
  const pieces = loop ? n : n - 1;
  for (let i = 0; i < pieces; i++) {
    const p0 = at(i), p1 = at(i + 1);
    const tri = triangleOf(p0.e, p1.e);
    const len = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    let c1 = null, c2 = null;
    if (tri && len > 0) {
      const t0 = tan[i], t1 = tan[(i + 1) % n];
      const ok = bary(X, Y, Z, tri, c.z, L.band * interval);
      if (t0) c1 = handle(p0, t0[0], t0[1], L.handle * len, ok);
      if (t1) c2 = handle(p1, -t1[0], -t1[1], L.handle * len, ok);
    }
    if (!c1 && !c2) { out.push({ x: p1.x + ox, y: p1.y + oy }); continue; }
    const a = c1 || p0, b = c2 || p1;
    const turn = angle(a.x - p0.x, a.y - p0.y, b.x - a.x, b.y - a.y, p1.x - p0.x, p1.y - p0.y) + angle(b.x - a.x, b.y - a.y, p1.x - b.x, p1.y - b.y, p1.x - p0.x, p1.y - p0.y);
    const seg = Math.max(1, Math.min(MAX_SEG, Math.ceil(turn / TURN)));
    for (let k = 1; k < seg; k++) {
      const t = k / seg, m = 1 - t, w0 = m * m * m, w1 = 3 * m * m * t, w2 = 3 * m * t * t, w3 = t * t * t;
      out.push({ x: w0 * p0.x + w1 * a.x + w2 * b.x + w3 * p1.x + ox, y: w0 * p0.y + w1 * a.y + w2 * b.y + w3 * p1.y + oy });
    }
    out.push({ x: p1.x + ox, y: p1.y + oy });
  }
  if (!loop && c.closed) { /* a closed line whose ends did not repeat: left as tin.js gave it */ }
  return { z: c.z, pts: out, closed: c.closed };
}

/** The triangle two consecutive contour corners share: the three vertices their two edges have between them. */
function triangleOf(e0, e1) {
  const s = [e0[0], e0[1]];
  for (const v of e1) if (!s.includes(v)) s.push(v);
  return s.length === 3 ? s : null;
}

/** A test for one triangle: is (x, y) inside it, and is the plane there within `dz` of elevation `level`? */
function bary(X, Y, Z, [a, b, c], level, dz) {
  const d = (Y[b] - Y[c]) * (X[a] - X[c]) + (X[c] - X[b]) * (Y[a] - Y[c]);
  if (d === 0) return () => false;
  return (x, y) => {
    const w1 = ((Y[b] - Y[c]) * (x - X[c]) + (X[c] - X[b]) * (y - Y[c])) / d;
    const w2 = ((Y[c] - Y[a]) * (x - X[c]) + (X[a] - X[c]) * (y - Y[c])) / d;
    const w3 = 1 - w1 - w2;
    if (!(w1 >= INSIDE && w2 >= INSIDE && w3 >= INSIDE)) return false;
    return Math.abs(w1 * Z[a] + w2 * Z[b] + w3 * Z[c] - level) <= dz;
  };
}

/** The control point p + s·len·(dx, dy), with the largest s of SHRINK that passes the triangle test; null when none does. */
function handle(p, dx, dy, len, ok) {
  for (const s of SHRINK) {
    if (s === 0) return null;
    const x = p.x + dx * len * s, y = p.y + dy * len * s;
    if (ok(x, y)) return { x, y };
  }
  return null;
}

/** Angle between two directions (0 when either has no length: `fx, fy` is then the direction used). */
function angle(ax, ay, bx, by, fx, fy) {
  if (ax === 0 && ay === 0) { ax = fx; ay = fy; }
  if (bx === 0 && by === 0) { bx = fx; by = fy; }
  const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
  if (!(la > 0) || !(lb > 0)) return 0;
  return Math.abs(Math.atan2(ax * by - ay * bx, ax * bx + ay * by));
}

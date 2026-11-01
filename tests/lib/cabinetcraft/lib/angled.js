/* SPDX-License-Identifier: Apache-2.0 */
/**
 * angled.js — the geometry of angled and curved walls (0.8.2 DC.117, session `cabinetcraft_addon` round 3). DOM-free, pure, no imports but core.js.
 * Every number is geometry (angles, chords, sagittas); nothing here is a maker's size.
 *
 * Words used below:
 *   turn τ     the angle a room corner turns the wall by, in degrees: 90 for a right-angled convex corner, 0 for a straight wall, negative at an
 *              inside (reflex) corner. The corner's inside angle is 180 − τ.
 *   sweep      the angle an arc wall covers, in degrees, signed: POSITIVE bulges away from the room (a bay, the centre of the circle is in the room),
 *              NEGATIVE bulges into the room (a bow, the centre is outside the room).
 *
 *   rad(d) · deg(r) · rot(v, d) · turnBetween(u0, u1) → degrees, + = left turn
 *   edgeEnd(from, length, angleDeg) → [x, y]                          a wall typed as length + angle (angle counter-clockwise from +x)
 *   arcEnd(from, headingDeg, radius, sweepDeg) → [x, y]               an arc typed as radius + sweep: the chord's heading says where it goes
 *   arcFromThree(p0, pm, p1) → { r, sweep (signed for a room on the LEFT of p0→p1), cx, cy } | null    an arc picked as three points
 *   arcGeom(a, b, sweepDeg) → { r, cx, cy, chord, arcLen, sag, bay, a0, a1, t0, t1, sigma } | null     (sag = sagitta of the whole arc)
 *   arcPoints(a, b, sweepDeg, n) → [[x, y]…] from a to b (n segments)
 *   sagitta(r, w) → how far the middle of a straight chord w is from a circle of radius r
 *   stepArc(g, items, { from, to }) → { cells, wedges, overflow, used, invalid }
 *        straight cabinets (widths w, depths d) stepped along the arc; each cell = { i, frame: { o, u, n }, phi, back (radius of its back line),
 *        gap (largest distance between its back and the curve), gapAt ('middle' | 'corners'), corners: { bl, br, fl, fr } }, each wedge =
 *        { i (between i−1 and i), back, front (the two widths), poly }.
 *   cornerBlock(tau, depth) → how far a run must stop short of a convex corner of turn τ (τ ≤ 90: depth · sin τ; sharper: depth, flagged)
 *   wedgeCorner(tau, depth) → { leg1, leg2, hyp, area } the right-triangle void left by that stop (legs along the next wall and across the run's end)
 *   diagAt(tau, w, d) → the diagonal-front corner cabinet at a true corner turn τ (two mitred arm boards and an isosceles triangle)
 */
import { r6 } from './core.js';
import { overlap } from './footprint.js';

export const rad = (d) => (d * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;
export const rot = (v, d) => { const a = rad(d), c = Math.cos(a), s = Math.sin(a); return { x: r6(v.x * c - v.y * s), y: r6(v.x * s + v.y * c) }; };
export const turnBetween = (u0, u1) => deg(Math.atan2(u0.x * u1.y - u0.y * u1.x, u0.x * u1.x + u0.y * u1.y));

export function edgeEnd(from, length, angleDeg) {
  const a = rad(angleDeg);
  return [r6(from[0] + length * Math.cos(a)), r6(from[1] + length * Math.sin(a))];
}
export function arcEnd(from, headingDeg, radius, sweepDeg) {
  const half = Math.abs(rad(sweepDeg)) / 2;
  const chord = 2 * radius * Math.sin(half);
  return edgeEnd(from, chord, headingDeg);
}
export function sagitta(r, w) { return r - Math.sqrt(Math.max(0, r * r - (w * w) / 4)); }

export function arcFromThree(p0, pm, p1) {
  const [ax, ay] = p0, [bx, by] = pm, [cx, cy] = p1;
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-9) return null;
  const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
  const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
  const r = Math.hypot(ax - ux, ay - uy);
  // the arc runs p0 → pm → p1; its sweep is the angle it covers about the centre (< 180 when the middle point is on the minor arc)
  const ang = (x, y) => Math.atan2(y - uy, x - ux);
  let s0 = ang(ax, ay), sm = ang(bx, by), s1 = ang(cx, cy);
  const norm = (v) => { while (v < 0) v += 2 * Math.PI; while (v >= 2 * Math.PI) v -= 2 * Math.PI; return v; };
  // counter-clockwise about the centre from p0 to p1 passing pm?
  const ccw = norm(sm - s0) < norm(s1 - s0);
  const total = ccw ? norm(s1 - s0) : norm(s0 - s1);
  const sweep = deg(total);
  // is the middle point to the right of p0→p1 (a bulge away from a room on the left)?
  const cross = (cx - ax) * (by - ay) - (cy - ay) * (bx - ax);
  const outward = cross < 0;
  return { r: r6(r), sweep: r6(outward ? sweep : -sweep), cx: r6(ux), cy: r6(uy), sagMid: r6(Math.abs(cross) / Math.hypot(cx - ax, cy - ay)) };
}

export function arcGeom(a, b, sweepDeg) {
  const s = Number(sweepDeg);
  if (!Number.isFinite(s) || Math.abs(s) < 0.01 || Math.abs(s) > 179.99) return null;
  const dx = b[0] - a[0], dy = b[1] - a[1], chord = Math.hypot(dx, dy);
  if (chord < 1e-9) return null;
  const u = { x: dx / chord, y: dy / chord }, nl = { x: -u.y, y: u.x };   // nl: the room side (left)
  const half = Math.abs(rad(s)) / 2;
  const r = chord / (2 * Math.sin(half));
  const h = r * Math.cos(half);
  const bay = s > 0;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const sign = bay ? 1 : -1;       // a bay's centre is on the room side of the chord, a bow's on the far side
  const cx = mx + nl.x * h * sign, cy = my + nl.y * h * sign;
  const a0 = Math.atan2(a[1] - cy, a[0] - cx), a1 = Math.atan2(b[1] - cy, b[0] - cx);
  const rr = Math.abs(rad(s));
  return {
    r: r6(r), cx: r6(cx), cy: r6(cy), chord: r6(chord), arcLen: r6(r * rr), sag: r6(r * (1 - Math.cos(half))), bay, sweep: s, sigma: bay ? 1 : -1, a0, a1,
    t0: rot(u, -s / 2), t1: rot(u, s / 2), u, n: nl,
  };
}

export function arcPoints(a, b, sweepDeg, n = 16) {
  const g = arcGeom(a, b, sweepDeg);
  if (!g) return [a.slice(), b.slice()];
  const out = [];
  for (let i = 0; i <= n; i++) {
    const phi = g.a0 + g.sigma * (Math.abs(rad(g.sweep)) * i) / n;
    out.push([r6(g.cx + g.r * Math.cos(phi)), r6(g.cy + g.r * Math.sin(phi))]);
  }
  out[0] = [a[0], a[1]]; out[n] = [b[0], b[1]];
  return out;
}

/**
 * Straight cabinets stepped along an arc wall. `g` = arcGeom, `items` = [{ w, d }] in order from the arc's start, `from` / `to` = the run's span measured
 * along the arc (length units). Each cabinet is turned to the tangent at its own middle. A BAY (centre in the room): the back corners of a cabinet are
 * on the wall circle (so its back is a chord, the middle of it a sagitta inside the circle) and neighbours are spaced so their sides just clear where
 * they are closest (their fronts), which leaves a wedge-shaped void at the back. A BOW (centre outside the room): the middle of the back touches the circle
 * and neighbours are spaced so their sides just clear at the back, which leaves a wedge at the front (a wedge filler closes it).
 */
export function stepArc(g, items, { from = 0, to = null } = {}) {
  const R = g.r, sg = g.sigma;
  const cells = [];
  const out = { cells, wedges: [], overflow: 0, used: 0, invalid: [] };
  if (!items.length) return out;
  // a CURVED-front (made to order) cabinet is a sector of the ring: its back lies ON the wall circle and its sides are radial, its width is an arc length
  const Hb = items.map((it) => (it.curved ? R : g.bay ? Math.sqrt(Math.max(0, R * R - (it.w * it.w) / 4)) : R));
  for (let i = 0; i < items.length; i++) if (!(items[i].w < 2 * R - 1e-9)) out.invalid.push(i);
  const half = (it, r) => (it.curved ? it.w / (2 * R) : Math.atan2(it.w / 2, r));
  const off = items.map((it, i) => half(it, Hb[i]));
  const front = items.map((it, i) => Hb[i] - it.d);
  if (g.bay) for (let i = 0; i < items.length; i++) if (front[i] <= 1) out.invalid.push(i);
  if (out.invalid.length) return out;
  // where one item stands when its axis points at polar angle `ph`: its frame, its corners and its convex footprint pieces
  const place = (it, i, ph) => {
    const e = { x: Math.cos(ph), y: Math.sin(ph) };
    const u = g.bay ? { x: -e.y, y: e.x } : { x: e.y, y: -e.x };
    const n = { x: -u.y, y: u.x };
    const mx = g.cx + e.x * Hb[i], my = g.cy + e.y * Hb[i];
    const o = { x: r6(mx - u.x * it.w / 2), y: r6(my - u.y * it.w / 2) };
    const P = (s, y) => ({ x: o.x + u.x * s + n.x * y, y: o.y + u.y * s + n.y * y });
    let pieces;
    if (it.curved) {
      const psi = it.w / R, rF = g.bay ? R - it.d : R + it.d, nS = Math.max(3, Math.ceil(deg(psi) / 6));
      const at = (rad_, q) => [g.cx + rad_ * Math.cos(q), g.cy + rad_ * Math.sin(q)];
      pieces = [];
      for (let k = 0; k < nS; k++) {
        const a0 = ph - sg * psi / 2 + sg * psi * k / nS, a1 = ph - sg * psi / 2 + sg * psi * (k + 1) / nS;
        pieces.push([at(R, a0), at(R, a1), at(rF, a1), at(rF, a0)]);
      }
    } else pieces = [[P(0, 0), P(it.w, 0), P(it.w, it.d), P(0, it.d)].map((q) => [q.x, q.y])];
    return { e, u, n, o, P, pieces };
  };
  const clash = (A, B) => A.pieces.some((pa) => B.pieces.some((pb) => overlap(pa, pb) > 1e-7));
  // the first item's back-left corner starts at the arc's start (plus the run's own start); each next item is moved along just far enough that no piece of it
  // overlaps the one before (a search on the angle, so any mix of widths, depths and curved fronts is exact)
  let phi = g.a0 + sg * (from / R) + sg * off[0];
  const phis = [phi];
  let prev = place(items[0], 0, phi);
  for (let i = 1; i < items.length; i++) {
    let lo = 0, hi = Math.PI / 2;
    for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (clash(prev, place(items[i], i, phi + sg * mid))) lo = mid; else hi = mid; }
    phi += sg * hi;
    phis.push(phi);
    prev = place(items[i], i, phi);
  }
  items.forEach((it, i) => {
    const p = phis[i];
    const { u, n, o, P } = place(it, i, p);
    const gap = it.curved ? 0 : g.bay ? R - Hb[i] : Math.sqrt(R * R + (it.w * it.w) / 4) - R;
    const Pr = (s, y) => { const q = P(s, y); return { x: r6(q.x), y: r6(q.y) }; };
    cells.push({ i, frame: { o, u: { x: r6(u.x), y: r6(u.y) }, n: { x: r6(n.x), y: r6(n.y) }, ang: Math.atan2(u.y, u.x) }, phi: p, back: Hb[i], gap: r6(gap), gapAt: g.bay ? 'middle' : 'corners',
      corners: { bl: Pr(0, 0), br: Pr(it.w, 0), fl: Pr(0, it.d), fr: Pr(it.w, it.d) } });
    if (it.curved) {   // the ring sector in slices (world coordinates), and its radii
      const psi = it.w / R, rF = g.bay ? R - it.d : R + it.d;
      cells[cells.length - 1].curved = { rBack: r6(R), rFront: r6(rF), psi: r6(deg(psi)), arcLen: it.w, slices: place(it, i, p).pieces.map((pc) => pc.map((q) => [r6(q[0]), r6(q[1])])) };
    }
  });
  for (let i = 1; i < cells.length; i++) {
    const A = cells[i - 1].corners, B = cells[i].corners;
    const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
    out.wedges.push({ i, back: r6(dist(A.br, B.bl)), front: r6(dist(A.fr, B.fl)), poly: [A.br, B.bl, B.fl, A.fr].map((q) => [q.x, q.y]),
      angle: r6(Math.abs(deg(phis[i] - phis[i - 1]))) });
  }
  const last = items.length - 1;
  const endPhi = phis[last] + sg * off[last];
  const limit = g.a0 + sg * ((to === null ? g.arcLen : to) / R);
  out.overflow = r6(Math.max(0, sg * (endPhi - limit)) * R);   // length along the arc by which the last cabinet passes the end
  out.used = r6(sg * (endPhi - (g.a0 + sg * from / R)) * R);
  return out;
}

export function cornerBlock(tau, depth) {
  if (tau <= 0) return 0;
  return r6(tau <= 90 ? depth * Math.sin(rad(tau)) : depth);
}
export function wedgeCorner(tau, depth) {
  if (!(tau > 0 && tau <= 90)) return null;
  const leg1 = depth * Math.sin(rad(tau)), leg2 = depth * Math.cos(rad(tau));
  return { leg1: r6(leg1), leg2: r6(leg2), hyp: r6(depth), area: r6((leg1 * leg2) / 2) };
}

/**
 * The diagonal-front corner cabinet at a corner of turn τ (any convex τ from 1° to 179°; not 90: that one is corner.js). Frame: x along the first wall,
 * y out from it, the wall corner at (w, 0), the next wall leaving at turn τ. Arms of length w and depth d. The footprint is split into two mitred arm
 * boards (the mitre runs from the wall corner to the inside corner Q) and an isosceles triangle that closes the front.
 *   A = [(0,0), (w,0), Q, (0,d)]   B (in its own frame, x along the next wall from the wall corner, y out) = [(0,0), (w,0), (w,d), (d·tan(τ/2), d)]
 *   triangle legs ℓ = w − d·tan(τ/2), apex (at Q) 180° − τ, front length L = 2ℓ·cos(τ/2)
 */
export function diagAt(tau, w, d) {
  const t = rad(tau), th = Math.tan(t / 2);
  const ell = w - d * th;
  const Q = [r6(w - d * th), d];
  const uB = { x: Math.cos(t), y: Math.sin(t) }, nB = { x: -Math.sin(t), y: Math.cos(t) };
  const toA = (s, y) => [r6(w + uB.x * s + nB.x * y), r6(uB.y * s + nB.y * y)];   // a point in B's own frame → A's frame
  const P1 = [w, 0], P2 = toA(w, 0), FB = toA(w, d), FA = [0, d];
  const mitre = Math.hypot(Q[0] - w, Q[1]);
  const L = 2 * ell * Math.cos(t / 2);
  const gamma = 180 - tau;
  return {
    tau, w, d, ell: r6(ell), Q, P1, P2, FA, FB, front: r6(L), apex: r6(gamma), mitre: r6(mitre), mitreAngle: r6(90 - tau / 2),
    valid: ell > 1 && tau > 0 && tau < 180,
    A: [[0, 0], P1, Q, FA], B: [P1, P2, FB, Q],
    outline: [[0, 0], P1, P2, FB, FA],
    tri: [FA, Q, FB],
    area: r6(polyArea([[0, 0], P1, P2, FB, FA])),
    uB, nB,
  };
}
export function polyArea(pts) { return Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + (p[0] * q[1] - q[0] * p[1]); }, 0)) / 2; }

/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, energy: 150 more generation, renewable, distribution and oil and gas objects (new kinds; none repeated from round 6). Original geometry by type and size class; no maker, model or standard. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, TAU = m.PI * 2;
const R1 = (n) => m.round(n * 10) / 10;

// ------------------------------------------------------------------------------------------ helpers
/** extrude a convex polygon given as [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** extrude a convex polygon given as [x, z] points between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
const AXF = { x: (p, q, w) => [w, p, q], y: (p, q, w) => [p, w, q], z: (p, q, w) => [p, q, w] };
/** an annulus (or tapered ring) about the axis ax ('x','y','z') through (p, q): inner r0, outer rA at w0 and rB at w1 */
function ring(a, ax, p, q, r0, rA, w0, w1, rB = rA, seg = 24) {
  if (w0 > w1) { [w0, w1] = [w1, w0]; [rA, rB] = [rB, rA]; }
  const f = AXF[ax], flip = ax === 'y';
  const P = (r, k, w) => { const th = (k / seg) * TAU; return f(p + r * m.cos(th), q + r * m.sin(th), w); };
  const T = (A, B, C) => a.t.push(flip ? [A, C, B] : [A, B, C]);
  for (let k = 0; k < seg; k++) {
    const k2 = k + 1;
    T(P(rA, k, w0), P(rA, k2, w0), P(rB, k2, w1)); T(P(rA, k, w0), P(rB, k2, w1), P(rB, k, w1));
    T(P(r0, k, w0), P(r0, k2, w1), P(r0, k2, w0)); T(P(r0, k, w0), P(r0, k, w1), P(r0, k2, w1));
    T(P(r0, k, w1), P(rB, k, w1), P(rB, k2, w1)); T(P(r0, k, w1), P(rB, k2, w1), P(r0, k2, w1));
    T(P(r0, k, w0), P(rA, k2, w0), P(rA, k, w0)); T(P(r0, k, w0), P(r0, k2, w0), P(rA, k2, w0));
  }
  return a;
}
/** a solid cylinder about an axis from w0 to w1 */
function cylA(a, ax, p, q, w0, w1, r, seg = 12) { const f = AXF[ax]; return a.tube([f(p, q, w0), f(p, q, w1)], [r, r], seg); }
/** a flange on an axis: plate from w toward dir (+1/-1), outer ro, bore ri, nb bolts on circle rb of radius bolt, optional tapered hub of length hubL */
function flange(a, ax, p, q, w, dir, ro, t, ri, nb, rb, bolt, hubL = 0, plan = true) {
  const w1 = w + dir * t, lo = m.min(w, w1), hi = m.max(w, w1);
  ring(a, ax, p, q, ri, ro, lo, hi, ro, 28);
  for (let k = 0; k < nb; k++) {
    const th = (k / nb) * TAU + 0.2, bp = p + rb * m.cos(th), bq = q + rb * m.sin(th);
    cylA(a, ax, bp, bq, lo - bolt * 1.1, hi + bolt * 1.1, bolt * 0.5, 6);
    cylA(a, ax, bp, bq, lo - bolt * 0.9, lo, bolt * 0.9, 6); cylA(a, ax, bp, bq, hi, hi + bolt * 0.9, bolt * 0.9, 6);
  }
  if (hubL) ring(a, ax, p, q, ri, ri * 1.5, w1, w1 + dir * hubL, ri * 1.12, 20);
  if (plan) {
    const L = m.min(lo, w1 + dir * hubL, w1), H = m.max(hi, w1 + dir * hubL);
    if (ax === 'x') a.rect(L, p - ro, H, p + ro, 'EQUIP-DETAIL'); else if (ax === 'y') a.rect(p - ro, L, p + ro, H, 'EQUIP-DETAIL'); else { a.circ(p, q, ro, 'EQUIP-DETAIL'); a.circ(p, q, rb, 'EQUIP-DETAIL'); }
  }
  return a;
}
/** a horizontal hand wheel in the X-Y plane at height z: rim ring, spokes, hub, with a plan circle */
function handwheel(a, x, y, z, R, rim = 12, spokes = 4) {
  const pts = []; for (let k = 0; k <= 16; k++) { const th = (k / 16) * TAU; pts.push([x + R * m.cos(th), y + R * m.sin(th), z]); }
  a.tube(pts, pts.map(() => rim), 6);
  for (let k = 0; k < spokes; k++) { const th = (k / spokes) * TAU + 0.4; a.tube([[x, y, z], [x + R * m.cos(th), y + R * m.sin(th), z]], [rim * 0.55, rim * 0.5], 5); }
  a.cyl(x, y, z - rim * 1.6, z + rim * 1.6, rim * 1.7, 8); a.circ(x, y, R, 'EQUIP-DETAIL'); a.circ(x, y, rim * 1.7, 'EQUIP-DETAIL');
}
/** a wheel on a lateral axle */
function whl(a, x, y, r, w = 150, zc = null) { const z = zc ?? a.Z0 + r; a.xcyl(x - w / 2, x + w / 2, y, z, r, 16); a.xcyl(x - w / 2 - 4, x + w / 2 + 4, y, z, r * 0.45, 10); }
/** a post-and-rail from (x0,y0) to (x1,y1) */
function rail(a, x0, y0, x1, y1, z0, z1, t = 14, posts = 3) {
  a.tube([[x0, y0, z1], [x1, y1, z1]], [t, t], 6); a.tube([[x0, y0, (z0 + z1) / 2], [x1, y1, (z0 + z1) / 2]], [t * 0.7, t * 0.7], 5);
  for (let i = 0; i < posts; i++) { const f = posts === 1 ? 0 : i / (posts - 1); a.tube([[x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z0], [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z1]], [t * 0.8, t * 0.8], 6); }
  a.line(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
/** a ladder on the X-Z plane at y, centred on x, from z0 to z1 */
function ladderX(a, y, x, z0, z1, w = 400, rungs = 8) {
  for (const s of [-1, 1]) a.tube([[x + s * w / 2, y, z0], [x + s * w / 2, y, z1]], [12, 12], 5);
  for (let i = 0; i <= rungs; i++) { const z = z0 + ((z1 - z0) * i) / rungs; a.box(x - w / 2, y - 10, z - 8, x + w / 2, y + 10, z + 8); }
}
/** a porcelain bushing: base cup, n sheds, a cap */
function bushing(a, x, y, z0, hgt, r, n = 8) {
  a.cyl(x, y, z0, z0 + hgt * 0.1, r * 1.9, 12); a.cyl(x, y, z0 + hgt * 0.1, z0 + hgt, r, 10);
  for (let i = 0; i < n; i++) { const z = z0 + hgt * (0.16 + (0.78 * i) / n); a.cone(x, y, z, z + hgt * 0.03, r * 1.9, r * 1.5, 12); }
  a.cyl(x, y, z0 + hgt, z0 + hgt + r * 1.6, r * 0.9, 8); a.circ(x, y, r * 1.9, 'EQUIP-DETAIL');
}
/** a pressure gauge on a short stem facing the front */
function gauge(a, x, y, z, r = 50) { a.ycyl(y - 16, y, x, z, r, 12); a.ycyl(y, y + 30, x, z, r * 0.2, 6); }
/** horizontal louvres (slats) across the front face */
function louv(a, x0, x1, y, z0, z1, p = 40, t = 14) { for (let z = z0; z + t <= z1; z += p) a.box(x0, y - t * 0.8, z, x1, y, z + t * 0.5); }
/** a lever door handle on a front face at y (sticks toward -y) */
function lever(a, x, y, z, h = 90) { a.box(x - 8, y - 22, z - h / 2, x + 8, y, z + h / 2); a.box(x - 8, y - 22, z - 8, x + 40, y - 8, z + 8); }
/** a pipe stub with a flange: axis ax from w0 toward w1 */
function nozz(a, ax, p, q, w0, w1, r, fr = 1.85, t = 22) { cylA(a, ax, p, q, w0, w1, r, 12); flange(a, ax, p, q, w1, w1 > w0 ? -1 : 1, r * fr, t, r * 0.8, 8, r * fr * 0.78, m.max(10, r * 0.16), 0, true); }
/** an axial fan in the X-Y plane at height z: hub, n blades, guard ring */
function fanXY(a, x, y, z, R, nb = 5, guard = true) {
  a.cyl(x, y, z - 10, z + 10, R * 0.14, 10);
  for (let k = 0; k < nb; k++) { const th = (k / nb) * TAU + 0.3, c = m.cos(th), s = m.sin(th), n = [-s, c]; a.prism([[x + c * R * 0.12, y + s * R * 0.12], [x + c * R * 0.92 + n[0] * R * 0.14, y + s * R * 0.92 + n[1] * R * 0.14], [x + c * R * 0.95 - n[0] * R * 0.04, y + s * R * 0.95 - n[1] * R * 0.04], [x + c * R * 0.12 - n[0] * R * 0.05, y + s * R * 0.12 - n[1] * R * 0.05]], z - 6, z + 6); }
  if (guard) { const pts = []; for (let k = 0; k <= 20; k++) { const th = (k / 20) * TAU; pts.push([x + R * m.cos(th), y + R * m.sin(th), z + 40]); } a.tube(pts, pts.map(() => 7), 5); a.tube(pts.map(([px, py, pz]) => [x + (px - x) * 0.5, y + (py - y) * 0.5, pz + 8]), pts.map(() => 6), 5); for (let k = 0; k < 6; k++) { const th = (k / 6) * TAU; a.tube([[x, y, z + 44], [x + R * m.cos(th), y + R * m.sin(th), z + 40]], [6, 6], 4); } }
}
/** a base frame of channels: perimeter rails, cross members, in plan x0..x1, y0..y1 between z0 and z0+h */
function skidFrame(a, x0, x1, y0, y1, z0, h, n = 4, ch = 40) {
  a.box(x0, y0, z0, x1, y0 + ch, z0 + h); a.box(x0, y1 - ch, z0, x1, y1, z0 + h);
  for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0 - ch) * i / n; a.box(x, y0 + ch, z0, x + ch, y1 - ch, z0 + h * 0.8); }
}
/** a horizontal motor on the X axis: body with fin rings, fan cover end, terminal box */
function motor(a, x0, x1, y, z, r, fins = true) {
  a.xcyl(x0, x1, y, z, r, 20); if (fins) for (let x = x0 + r * 0.3; x < x1 - r * 0.6; x += r * 0.28) a.xcyl(x, x + r * 0.1, y, z, r * 1.06, 20);
  a.xcyl(x1, x1 + r * 0.55, y, z, r * 0.9, 18); a.ell(x1 + r * 0.55, y, z, r * 0.2, r * 0.9, r * 0.9, 12, 5);
  a.box((x0 + x1) / 2 - r * 0.4, y - r * 0.4, z + r, (x0 + x1) / 2 + r * 0.4, y + r * 0.4, z + r * 1.5);
  a.box(x0 + r * 0.2, y - r * 0.9, z - r - r * 0.3, x1 - r * 0.2, y + r * 0.9, z - r * 0.9);
}
/** thin rectangular slab-like PV panel centred on a tilt axis (x along the axis) : half-length hs along the slope, tilt radians about X */
function pvAt(a, x0, x1, yc, zc, hs, tilt, th = 36, off = 0) {
  const c = m.cos(tilt), s = m.sin(tilt), P = (sp, nn) => [yc + sp * c - nn * s, zc + sp * s + nn * c];
  prismX(a, [P(-hs, off), P(hs, off), P(hs, off - th), P(-hs, off - th)], x0, x1);
  const i = 34; if (x1 - x0 > 3 * i) prismX(a, [P(-hs + i, off), P(hs - i, off), P(hs - i, off + 8), P(-hs + i, off + 8)], x0 + i, x1 - i);
}

// ================================================================================== generation
/** a towable generator set: trailer frame, tandem axle option, fenders, drawbar with coupler, jack, enclosure with doors, louvres, stack */
function trailerGen(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, rw = v.rw * IN, zd = Z0 + rw * 1.55, fe = 11 * IN;
  const xs = v.tandem ? [cx + W * 0.04, cx + W * 0.04 + rw * 3.1] : [cx + W * 0.08];
  const dbx = X0 + 36 * IN, ex0 = dbx + 2 * IN, ex1 = X1 - 3 * IN, ey0 = YF + 11 * IN, ey1 = YB - 11 * IN;
  // frame rails, cross members, drawbar A-frame, coupler and screw jack
  for (const y of [ey0 + 4 * IN, ey1 - 4 * IN]) a.box(ex0 - 4 * IN, y - 2 * IN, zd - 5 * IN, ex1, y + 2 * IN, zd);
  for (let i = 0; i < 5; i++) { const x = ex0 + (ex1 - ex0) * i / 4; a.box(x - 1.5 * IN, ey0 + 4 * IN, zd - 4 * IN, x + 1.5 * IN, ey1 - 4 * IN, zd); }
  for (const s of [-1, 1]) a.tube([[ex0, cy + s * (ey1 - ey0) / 2 * 0.8, zd - 2.5 * IN], [X0 + 5 * IN, cy + s * 2 * IN, zd - 2.5 * IN]], [2 * IN, 2 * IN], 6);
  a.cyl(X0 + 5 * IN, cy, zd - 5 * IN, zd, 3.2 * IN, 12); a.ell(X0 + 5 * IN, cy, zd - 1.5 * IN, 3.5 * IN, 3 * IN, 2 * IN, 10, 5);
  a.tube([[dbx + 4 * IN, cy, zd - 3 * IN], [dbx + 4 * IN, cy, Z0 + 5 * IN]], [1.6 * IN, 1.4 * IN], 8); a.box(dbx + 4 * IN - 4 * IN, cy - 4 * IN, Z0, dbx + 4 * IN + 4 * IN, cy + 4 * IN, Z0 + 1 * IN);
  for (const x of xs) { a.ycyl(ey0 - 8 * IN, ey1 + 8 * IN, x, Z0 + rw, 1.6 * IN, 10); for (const [y0, y1] of [[YF + 1 * IN, YF + 9 * IN], [YB - 9 * IN, YB - 1 * IN]]) { a.ycyl(y0, y1, x, Z0 + rw, rw, 22); a.ycyl(y0 - 5, y1 + 5, x, Z0 + rw, rw * 0.5, 12); a.ycyl(y0 - 12, y0, x, Z0 + rw, rw * 0.22, 8); a.box(x - rw * 1.25, y0, Z0 + 2 * rw + 1 * IN, x + rw * 1.25, y1, Z0 + 2 * rw + 3.2 * IN); } }
  // enclosure on the deck
  const zr = Z1 - 24 * IN; a.box(ex0, ey0, zd, ex1, ey1, zr); prismX(a, [[ey0, zr], [ey1, zr], [ey1 - 4 * IN, zr + 4 * IN], [ey0 + 4 * IN, zr + 4 * IN]], ex0, ex1);
  for (let z = zd + 10 * IN; z < zr - 8 * IN; z += 2.6 * IN) a.box(ex1, ey0 + 6 * IN, z, ex1 + 1.2 * IN, ey1 - 6 * IN, z + 1 * IN);
  const nd = m.max(2, m.round((ex1 - ex0) / (46 * IN))), dw = (ex1 - ex0 - 6 * IN) / nd;
  for (let i = 0; i < nd; i++) { const x0 = ex0 + 3 * IN + i * dw + 8, x1 = ex0 + 3 * IN + (i + 1) * dw - 8; a.frame(x0, zd + 4 * IN, x1, zr - 3 * IN, ey0 - 0.8 * IN, ey0 + 0.2, 1.4 * IN); lever(a, x1 - 4 * IN, ey0 - 0.8 * IN, (zd + zr) / 2, 80); }
  const sx = ex0 + (ex1 - ex0) * 0.3; a.cyl(sx, cy, zr + 4 * IN, zr + 4 * IN + 14 * IN, 2.4 * IN, 14); a.cone(sx, cy, zr + 18 * IN, zr + 21 * IN, 3.6 * IN, 2 * IN, 14); a.box(sx - 9 * IN, cy - 5 * IN, zr + 4 * IN - 1, sx + 9 * IN, cy + 5 * IN, zr + 6 * IN);
  a.tube([[ex1 - 30 * IN, cy, zr + 4 * IN], [ex1 - 30 * IN, cy, zr + 8 * IN], [ex1 - 26 * IN, cy, zr + 9 * IN]], [1 * IN, 1 * IN, 1 * IN], 6);
  for (const y of [ey0 + 2 * IN, ey1 - 2 * IN]) a.box(ex1 - 1 * IN, y - 1.5 * IN, zd - 4 * IN, ex1 + 1 * IN, y + 1.5 * IN, zd - 1 * IN);
  a.outline('EQUIP-HIDDEN'); a.rect(ex0, ey0, ex1, ey1); for (const x of xs) { a.rect(x - rw, YF + 1 * IN, x + rw, YF + 9 * IN, 'EQUIP-DETAIL'); a.rect(x - rw, YB - 9 * IN, x + rw, YB - 1 * IN, 'EQUIP-DETAIL'); }
  a.line(X0 + 5 * IN, cy, ex0, ey0 + 4 * IN, 'EQUIP-DETAIL'); a.line(X0 + 5 * IN, cy, ex0, ey1 - 4 * IN, 'EQUIP-DETAIL'); a.circ(sx, cy, 2.4 * IN, 'EQUIP-DETAIL');
  a.log(`Added the trailer frame with ${v.tandem ? 'tandem' : 'a single'} axle, tyres, fenders, A-frame drawbar with coupler and jack, the sound enclosure with doors and louvres, roof stack with rain cap and the rear lights (plan and 3D).`);
}
/** a small open-frame portable generator in a tubular cradle with engine, alternator, tank, panel, muffler, handle and wheels */
function portableGen(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, t = 1 * IN, bz = Z0 + (v.wheels ? 4 * IN : 1.5 * IN);
  const rail = (x0, y0, z0, x1, y1, z1) => a.tube([[x0, y0, z0], [x1, y1, z1]], [t, t], 8);
  const xl = X0 + 1.5 * IN, xr = X1 - 1.5 * IN, y0 = YF + 1.5 * IN, y1 = YB - 1.5 * IN, zt = Z1 - 2 * IN;
  for (const y of [y0, y1]) { rail(xl, y, bz, xr, y, bz); rail(xl, y, zt, xr, y, zt); for (const x of [xl, xr]) rail(x, y, bz, x, y, zt); }
  for (const x of [xl, xr]) { rail(x, y0, bz, x, y1, bz); rail(x, y0, zt, x, y1, zt); }
  a.box(xl, y0, bz - 1 * IN, xr, y1, bz + 1 * IN);
  const ew = (xr - xl) * 0.5, ez = bz + 1 * IN; a.box(xl + 1.5 * IN, y0 + 3 * IN, ez, xl + ew, y1 - 3 * IN, ez + (zt - ez) * 0.7);
  for (let k = 0; k < 4; k++) a.box(xl + 2 * IN + k * ew * 0.22, y0 + 2 * IN, ez + (zt - ez) * 0.15, xl + 2 * IN + k * ew * 0.22 + 0.5 * IN, y1 - 2 * IN, ez + (zt - ez) * 0.65);
  a.cyl(xl + ew * 0.5, cy, ez + (zt - ez) * 0.7, ez + (zt - ez) * 0.7 + 3 * IN, 2.6 * IN, 12);
  const ar = (zt - ez) * 0.32; a.xcyl(xl + ew, xr - 1.5 * IN, cy, ez + ar + 1 * IN, ar, 20); a.xcyl(xl + ew, xl + ew + 1 * IN, cy, ez + ar + 1 * IN, ar * 1.08, 20); a.xcyl(xr - 1.5 * IN, xr - 0.5 * IN, cy, ez + ar + 1 * IN, ar * 0.9, 18);
  const tk = zt - (zt - ez) * 0.08; a.ell(xl + (xr - xl) * 0.55, cy, tk - 1.5 * IN, (xr - xl) * 0.22, D * 0.34, 3 * IN + (zt - ez) * 0.08, 16, 7); a.cyl(xl + (xr - xl) * 0.7, cy, tk + 0.5 * IN, tk + 2 * IN, 1.5 * IN, 12);
  a.box(xr - 5 * IN, y0 + 0.3 * IN, ez + 1 * IN, xr - 0.6 * IN, y0 + 1.2 * IN, zt - 3 * IN); for (let i = 0; i < 3; i++) a.ycyl(y0 - 1.2 * IN, y0 + 0.4 * IN, xr - 3.8 * IN + (i - 1) * 0, ez + (zt - ez) * (0.25 + i * 0.22), 0.6 * IN, 10);
  a.xcyl(xl + 1 * IN, xl + ew * 0.6, y1 - 4 * IN, ez + 2 * IN, 1.5 * IN, 12); a.box(xl + ew * 0.35, y1 - 6.5 * IN, ez, xl + ew * 0.65, y1 - 1.5 * IN, ez + 5 * IN);
  a.tube([[xl, y0, zt], [xl - 1.2 * IN, y0, zt - 1 * IN], [xl - 1.2 * IN, y1, zt - 1 * IN], [xl, y1, zt]], [t, t, t, t], 8);
  if (v.wheels) { for (const y of [y0, y1]) { a.ycyl(y - 1.5 * IN, y + 1.5 * IN, xr - 3 * IN, Z0 + 4 * IN, 4 * IN, 16); a.ycyl(y - 2 * IN, y + 2 * IN, xr - 3 * IN, Z0 + 4 * IN, 1.5 * IN, 8); } a.box(xl + 2 * IN, y0 - 0.5 * IN, Z0, xl + 4 * IN, y1 + 0.5 * IN, bz - 0.2 * IN); }
  a.outline(); a.rect(xl, y0, xr, y1, 'EQUIP-DETAIL'); a.rect(xl + 1.5 * IN, y0 + 3 * IN, xl + ew, y1 - 3 * IN, 'EQUIP-DETAIL'); a.circ(xl + (xr - xl) * 0.55, cy, 2.6 * IN, 'EQUIP-DETAIL');
  a.log(`Added the tubular cradle frame with its handle, engine block with cooling fins and cylinder head, alternator, tank with cap, outlet panel, muffler${v.wheels ? ' and two wheels with a stand' : ''} (plan and 3D).`);
}
/** a gas turbine generator package: inlet filter housing, turbine enclosure, generator, exhaust stack, on a base skid */
function gasTurbine(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bh = 1.4 * IN * 5, pad = 0.04 * W;
  a.box(X0, YF, Z0, X1, YB, Z0 + bh);
  const fx1 = X0 + W * 0.2, fh = H * 0.82; a.box(X0 + pad, YF + D * 0.08, Z0 + bh, fx1, YB - D * 0.08, Z0 + bh + fh);
  for (let z = Z0 + bh + fh * 0.08; z < Z0 + bh + fh * 0.7; z += 9 * IN) a.box(X0 + pad - 0.6 * IN, YF + D * 0.1, z, X0 + pad, YB - D * 0.1, z + 6 * IN);
  louv(a, X0 + pad + 10 * IN, fx1 - 10 * IN, YF + D * 0.08, Z0 + bh + fh * 0.1, Z0 + bh + fh * 0.75, 7 * IN, 4 * IN);
  prismX(a, [[YF + D * 0.08, Z0 + bh + fh], [YB - D * 0.08, Z0 + bh + fh], [cy + D * 0.2, Z0 + bh + fh + 14 * IN], [cy - D * 0.2, Z0 + bh + fh + 14 * IN]], X0 + pad, fx1);
  const th = H * 0.5, tx0 = fx1 + W * 0.03, tx1 = X0 + W * 0.56; a.box(fx1, cy - D * 0.2, Z0 + bh + 10 * IN, tx0, cy + D * 0.2, Z0 + bh + th * 0.9);
  a.box(tx0, YF + D * 0.1, Z0 + bh, tx1, YB - D * 0.1, Z0 + bh + th); prismX(a, [[YF + D * 0.1, Z0 + bh + th], [YB - D * 0.1, Z0 + bh + th], [cy + D * 0.1, Z0 + bh + th + 9 * IN], [cy - D * 0.1, Z0 + bh + th + 9 * IN]], tx0, tx1);
  for (let i = 0; i < 3; i++) { const x = tx0 + (tx1 - tx0) * (0.14 + i * 0.3); a.frame(x, Z0 + bh + 18 * IN, x + (tx1 - tx0) * 0.24, Z0 + bh + th - 12 * IN, YF + D * 0.1 - 1 * IN, YF + D * 0.1 + 0.4 * IN, 3 * IN); lever(a, x + (tx1 - tx0) * 0.22 - 3 * IN, YF + D * 0.1 - 1 * IN, Z0 + bh + th * 0.5, 70); }
  rail(a, tx0 + 8 * IN, YF + D * 0.1 + 6 * IN, tx1 - 8 * IN, YF + D * 0.1 + 6 * IN, Z0 + bh + th + 9 * IN, Z0 + bh + th + 9 * IN + 42 * IN, 12, 5);
  const gr = H * 0.17, gz = Z0 + bh + gr + 12 * IN; a.box(tx1, cy - gr * 1.2, Z0 + bh, X0 + W * 0.84, cy + gr * 1.2, gz - gr * 0.3);
  a.xcyl(tx1, X0 + W * 0.84, cy, gz, gr, 26); for (let x = tx1 + 12 * IN; x < X0 + W * 0.84 - 8 * IN; x += 18 * IN) a.xcyl(x, x + 2 * IN, cy, gz, gr * 1.05, 26);
  a.box(X0 + W * 0.7, cy - gr * 0.5, gz + gr, X0 + W * 0.8, cy + gr * 0.5, gz + gr + 14 * IN);
  const ex = X1 - W * 0.09, er = m.min(D * 0.2, H * 0.1); a.box(X0 + W * 0.84, cy - gr * 0.9, Z0 + bh, X1 - pad * 0.2, cy + gr * 0.9, Z0 + bh + gr * 2);
  a.tube([[X0 + W * 0.84, cy, gz], [ex, cy, gz], [ex, cy, Z0 + bh + H * 0.5], [ex, cy, Z1 - 12 * IN]], [er * 0.6, er * 0.9, er, er], 18); a.cyl(ex, cy, Z1 - 12 * IN, Z1, er * 1.1, 18); for (let z = Z0 + bh + H * 0.5; z < Z1 - 24 * IN; z += 26 * IN) a.cyl(ex, cy, z, z + 3 * IN, er * 1.1, 18);
  ladderX(a, cy - er - 1 * IN, ex, Z0 + bh, Z0 + bh + H * 0.7, 18 * IN, 12);
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + pad, YF + D * 0.08, fx1, YB - D * 0.08); a.rect(tx0, YF + D * 0.1, tx1, YB - D * 0.1); a.rect(tx1, cy - gr * 1.2, X0 + W * 0.84, cy + gr * 1.2, 'EQUIP-DETAIL'); a.circ(ex, cy, er, 'EQUIP-DETAIL');
  a.log('Added the base skid, the louvred inlet air filter housing, the turbine enclosure with doors and roof rail, the generator with cooling rings and terminal box, the exhaust duct and the stack with ladder (plan and 3D).');
}
/** a horizontal deaerator tank with a vertical column on top, on two saddles */
function deaerator(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.dia * IN / 2, zc = Z0 + 14 * IN + R, hd = R * 0.35, x0 = X0 + hd + 1 * IN, x1 = X1 - hd - 1 * IN;
  for (const f of [0.2, 0.78]) { const x = x0 + (x1 - x0) * f; a.box(x - 4 * IN, cy - R * 0.9, Z0, x + 4 * IN, cy + R * 0.9, Z0 + 3 * IN); a.prism([[x - 3 * IN, cy - R * 0.75], [x + 3 * IN, cy - R * 0.75], [x + 3 * IN, cy + R * 0.75], [x - 3 * IN, cy + R * 0.75]], Z0 + 3 * IN, zc - R * 0.35); }
  a.xcyl(x0, x1, cy, zc, R, 30); a.ell(x0, cy, zc, hd, R, R, 16, 8); a.ell(x1, cy, zc, hd, R, R, 16, 8); for (const f of [0.35, 0.5, 0.65]) a.xcyl(x0 + (x1 - x0) * f - 10, x0 + (x1 - x0) * f + 10, cy, zc, R + 6, 30);
  const cr = R * 0.55, cxp = x0 + (x1 - x0) * 0.42, ct = Z1 - 18 * IN; a.cyl(cxp, cy, zc + R * 0.7, ct, cr, 24); a.ell(cxp, cy, ct, cr, cr, cr * 0.36, 20, 6); for (const z of [zc + R * 0.9 + (ct - zc) * 0.3, zc + R * 0.9 + (ct - zc) * 0.62]) a.cyl(cxp, cy, z, z + 20, cr + 6, 24);
  a.cyl(cxp, cy, ct + cr * 0.3, Z1 - 4 * IN, cr * 0.18, 12); flange(a, 'z', cxp, cy, Z1 - 4 * IN, 1, cr * 0.38, 26, cr * 0.18, 8, cr * 0.3, 12, 0, true);
  for (const s of [-1, 1]) { const n = cr * 0.3; a.cyl(cxp + s * cr * 0.6, cy + cr * 0.55, zc + R * 0.8, zc + R * 0.8 + 6 * IN, n * 0.5, 10); a.box(cxp + s * cr * 0.7 - 5 * IN, cy - 3 * IN, zc + R * 0.8 + (ct - zc) * 0.3, cxp + s * cr * 0.7 + 5 * IN, cy + 3 * IN, zc + R * 0.8 + (ct - zc) * 0.3 + 4 * IN); }
  nozz(a, 'x', cy, zc - R * 0.3, x1 + hd * 0.5, X1 - 0.6 * IN, R * 0.18); a.cyl(x0 + (x1 - x0) * 0.8, cy, zc + R - 10, zc + R + 5 * IN, R * 0.12, 12);
  flange(a, 'x', cy, zc, X0 + 0.5 * IN, 1, R * 0.34, 20, R * 0.26, 12, R * 0.31, 12, 0, false); const lx = x0 + (x1 - x0) * 0.9; a.cyl(lx, YF + 2.4 * IN, zc - R * 0.5, zc + R * 0.5, 1.2 * IN, 8); a.tube([[lx, YF + 2.4 * IN, zc + R * 0.5], [lx, cy - R * 0.86, zc + R * 0.55]], [0.6 * IN, 0.6 * IN], 6); gauge(a, x0 + (x1 - x0) * 0.12, cy - R + 0.5 * IN, zc + R * 0.4, 60);
  a.outline('EQUIP-HIDDEN'); a.rect(x0, cy - R, x1, cy + R, 'EQUIP-DETAIL'); a.circ(cxp, cy, cr, 'EQUIP');
  a.log('Added the two saddles, dished heads with the manway, the vertical deaerating column with dished top and vent flange, the steam and water nozzles, the outlet flange, relief valve and the level gauge (plan and 3D).');
}
/** a multistage boiler feed pump skid: base, motor, coupling guard, pump barrel with suction and discharge */
function feedPump(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bh = 6 * IN;
  skidFrame(a, X0, X1, YF, YB, Z0, bh, 5, 3 * IN); a.box(X0 + 2 * IN, YF + 3 * IN, Z0 + bh, X1 - 2 * IN, YB - 3 * IN, Z0 + bh + 1.4 * IN);
  const mr = D * 0.24, mz = Z0 + bh + 3 * IN + mr, mx1 = X0 + W * 0.44; motor(a, X0 + 4 * IN, mx1, cy, mz, mr);
  const gx0 = mx1 + mr * 0.55 + 2 * IN, gx1 = gx0 + W * 0.1; a.xcyl(gx0 - 2 * IN, gx1 + 2 * IN, cy, mz, mr * 0.18, 10); a.box(gx0, cy - mr * 0.6, mz - mr * 0.6, gx1, cy + mr * 0.6, mz + mr * 0.6); a.rect(gx0, cy - mr * 0.6, gx1, cy + mr * 0.6, 'EQUIP-DETAIL');
  const pr = mr * 0.78, px0 = gx1 + 2 * IN, px1 = X1 - 6 * IN, pz = mz; a.xcyl(px0, px1, cy, pz, pr, 22); for (let i = 0; i < v.stg; i++) { const x = px0 + (px1 - px0) * (i + 0.5) / v.stg; a.xcyl(x - 0.8 * IN, x + 0.8 * IN, cy, pz, pr * 1.12, 22); }
  a.xcyl(px1, px1 + 3 * IN, cy, pz, pr * 1.25, 22); for (const [x, up] of [[px0 + 6 * IN, 1], [px1 - 4 * IN, 1]]) { const nr = pr * 0.4; a.cyl(x, cy, pz + pr * 0.6, pz + pr + 6 * IN, nr, 14); flange(a, 'z', x, cy, pz + pr + 6 * IN, 1, nr * 1.8, 20, nr * 0.8, 8, nr * 1.4, 12, 0, true); }
  a.box(px0 - 1 * IN, cy - pr * 1.3, Z0 + bh, px0 + 6 * IN, cy + pr * 1.3, pz - pr * 0.5); a.box(px1 - 6 * IN, cy - pr * 1.3, Z0 + bh, px1 + 1 * IN, cy + pr * 1.3, pz - pr * 0.5); gauge(a, px1 - 4 * IN, cy - pr - 1 * IN, pz + pr * 0.2, 36);
  a.cyl(X0 + 5 * IN, YF + 6 * IN, Z0 + bh, Z0 + bh + 3 * IN, 1.5 * IN, 8);
  a.outline(); a.rect(X0 + 4 * IN, cy - mr, mx1, cy + mr, 'EQUIP-DETAIL'); a.rect(px0, cy - pr, px1, cy + pr, 'EQUIP-DETAIL');
  a.log(`Added the channel base with drip plate, the ribbed motor with terminal box and fan cover, the coupling guard, the ${v.stg}-stage pump barrel with stage rings and the flanged suction and discharge nozzles (plan and 3D).`);
}
/** a wall-hung condensing boiler: casing, display, buttons, gauge, concentric flue, bottom pipe stubs and valves */
function wallBoiler(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pb = 4 * IN;
  a.box(X0, YF + 0.6 * IN, Z0 + 4 * IN, X1, YB - 0.4 * IN, Z1 - 3 * IN); a.box(X0 + 1 * IN, YB - 0.4 * IN, Z0 + 3 * IN, X1 - 1 * IN, YB, Z1 - 1 * IN);
  a.box(X0 + 0.8 * IN, YF + 0.2 * IN, Z0 + 4.8 * IN, X1 - 0.8 * IN, YF + 0.7 * IN, Z1 - 3.8 * IN);
  a.box(cx - W * 0.28, YF - 0.2 * IN, Z1 - 9 * IN, cx + W * 0.28, YF + 0.3 * IN, Z1 - 5.5 * IN); for (let i = 0; i < 3; i++) a.cyl(cx - W * 0.2 + i * W * 0.2, YF + 0.1 * IN, Z1 - 15 * IN, Z1 - 14 * IN, 0.7 * IN, 10); a.ycyl(YF - 0.4 * IN, YF + 0.3 * IN, cx + W * 0.28, Z1 - 12.5 * IN, 1.4 * IN, 14);
  a.box(cx - W * 0.4, YF - 0.1 * IN, Z0 + 5.5 * IN, cx + W * 0.4, YF + 0.5 * IN, Z0 + 7 * IN);
  const fr = 1.6 * IN; a.cyl(cx - W * 0.1, cy + (YF - cy) * 0.35, Z1 - 3 * IN, Z1 + 0, fr, 16); a.cyl(cx - W * 0.1, cy + (YF - cy) * 0.35, Z1 - 3 * IN, Z1, fr * 0.6, 12);
  for (let i = 0; i < 5; i++) { const x = X0 + W * (0.14 + 0.18 * i), pr = i < 2 ? 0.55 * IN : 0.45 * IN; a.cyl(x, YF + D * 0.55, Z0, Z0 + 4.2 * IN, pr, 8); a.cyl(x, YF + D * 0.55, Z0 + 0.6 * IN, Z0 + 1.8 * IN, pr * 1.5, 6); }
  a.box(X0 + W * 0.45 - 1.2 * IN, YF + D * 0.5 - 1.2 * IN, Z0 + 1 * IN, X0 + W * 0.45 + 1.2 * IN, YF + D * 0.5 + 1.2 * IN, Z0 + 2.2 * IN);
  a.outline(); a.rect(X0 + 0.8 * IN, YF + 0.2 * IN, X1 - 0.8 * IN, YF + 0.7 * IN, 'EQUIP-DETAIL'); a.circ(cx - W * 0.1, cy + (YF - cy) * 0.35, fr, 'EQUIP-DETAIL');
  for (let i = 0; i < 5; i++) a.circ(X0 + W * (0.14 + 0.18 * i), YF + D * 0.55, 0.5 * IN, 'EQUIP-DETAIL');
  a.log('Added the casing with front panel, display and control knobs, pressure gauge, concentric flue outlet on top, the wall plate and the five bottom pipe connections with valves (plan and 3D).');
}
/** a floor-standing sectional hot-water boiler with a front burner, control panel and a rear flue outlet */
function sectBoiler(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bh = 5 * IN, bd = D * 0.22;
  a.box(X0 + 2 * IN, YF + bd, Z0, X1 - 2 * IN, YB - 2 * IN, Z0 + bh);
  a.box(X0 + 4 * IN, YF + bd, Z0 + bh, X1 - 4 * IN, YB - 6 * IN, Z1 - 8 * IN);
  const ns = v.sec; for (let i = 0; i <= ns; i++) { const y = YF + bd + (YB - 6 * IN - YF - bd) * i / ns; a.box(X0 + 3 * IN, y - 0.4 * IN, Z0 + bh + 1 * IN, X1 - 3 * IN, y + 0.4 * IN, Z1 - 9 * IN); }
  a.box(X0 + 4 * IN, YF + bd, Z1 - 8 * IN, X1 - 4 * IN, YB - 6 * IN, Z1 - 6 * IN);
  a.box(cx - W * 0.3, YF + bd - 2 * IN, Z1 - 16 * IN, cx + W * 0.3, YF + bd, Z1 - 6 * IN); a.box(cx - W * 0.27, YF + bd - 2.4 * IN, Z1 - 14 * IN, cx - W * 0.05, YF + bd - 2 * IN, Z1 - 8 * IN); for (let i = 0; i < 3; i++) a.cyl(cx + W * (0.02 + 0.08 * i), YF + bd - 2.2 * IN, Z1 - 11 * IN, Z1 - 10.2 * IN, 0.8 * IN, 10);
  const door = W * 0.3, bz = Z0 + bh + (H - bh) * 0.38; a.frame(cx - door, bz - door, cx + door, bz + door, YF + bd - 2 * IN, YF + bd, 2.5 * IN); a.ycyl(YF + bd - 3 * IN, YF + bd - 2 * IN, cx, bz, door * 0.8, 24);
  a.box(cx - W * 0.2, YF + 2 * IN, bz - 7 * IN, cx + W * 0.2, YF + bd - 3 * IN, bz + 7 * IN); a.ell(cx + W * 0.28, YF + bd * 0.6, bz, 7 * IN, 6 * IN, 7 * IN, 12, 6);
  a.ycyl(YF + 0.8 * IN, YF + 2 * IN, cx, bz, 4 * IN, 14);
  const sr = 4.5 * IN; a.xcyl(X1 - 4 * IN, X1 - 0.5 * IN, YB - 12 * IN, Z0 + bh + (H - bh) * 0.62, sr, 16); a.ycyl(YB - 6 * IN, YB - 1 * IN, cx + W * 0.1, Z0 + bh + (H - bh) * 0.38, sr, 16); flange(a, 'y', cx + W * 0.1, Z0 + bh + (H - bh) * 0.38, YB - 1 * IN, -1, sr * 1.6, 20, sr * 0.9, 6, sr * 1.35, 10, 0, true);
  for (const [x, nm] of [[cx - W * 0.2, 0], [cx + W * 0.2, 1]]) { a.cyl(x, YB - 14 * IN, Z1 - 6 * IN, Z1 + 0, 2 * IN, 12); }
  gauge(a, cx - W * 0.36, YF + bd - 2 * IN, Z1 - 11 * IN, 50);
  a.outline(); a.rect(X0 + 4 * IN, YF + bd, X1 - 4 * IN, YB - 6 * IN, 'EQUIP-DETAIL'); a.rect(cx - W * 0.2, YF + 2 * IN, cx + W * 0.2, YF + bd - 3 * IN, 'EQUIP-DETAIL'); a.circ(cx + W * 0.1, YB - 3.5 * IN, sr, 'EQUIP-DETAIL');
  a.log(`Added the base, the ${ns}-section casing with its seams, the control panel with dials, the hinged burner door with the burner, blower and gas train, the flanged flow and return pipes on top and the rear flue collar (plan and 3D).`);
}
/** a cross-flow cooling tower in cells: basin, louvred fill faces, fan stacks with fans, deck rail, ladder and pipe connections */
function coolTower(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, nc = v.cells, cw = (W - 12 * IN) / nc, bh = 24 * IN, zt = Z1 - 36 * IN, x0 = X0 + 6 * IN, x1 = X1 - 6 * IN;
  a.box(X0, YF + 2 * IN, Z0, X1, YB - 2 * IN, Z0 + bh); a.box(X0 + 2 * IN, YF + 4 * IN, Z0 + bh, X1 - 2 * IN, YB - 4 * IN, Z0 + bh + 2 * IN);
  for (let i = 0; i <= nc; i++) { const x = x0 + i * cw; for (const [ya, yb] of [[YF + 5 * IN, YF + 9 * IN], [YB - 9 * IN, YB - 5 * IN]]) a.box(x - 2 * IN, ya, Z0 + bh, x + 2 * IN, yb, zt); }
  for (const y of [YF + 5 * IN, YB - 9 * IN]) for (const z of [Z0 + bh + 2 * IN, (Z0 + bh + zt) / 2, zt - 6 * IN]) a.box(x0 - 2 * IN, y, z, x1 + 2 * IN, y + 4 * IN, z + 3 * IN);
  for (const [y0, sg] of [[YF + 5 * IN, 1], [YB - 5 * IN, -1]]) for (let z = Z0 + bh + 6 * IN; z < zt - 8 * IN; z += 5 * IN) prismX(a, [[y0, z], [y0 + sg * 4 * IN, z + 3 * IN], [y0 + sg * 4 * IN, z + 4.4 * IN], [y0, z + 1.4 * IN]].map(([p, q]) => [p, q]), x0, x1);
  a.box(x0 - 1 * IN, YF + 9 * IN, zt, x1 + 1 * IN, YB - 9 * IN, zt + 5 * IN); a.box(x0 - 1 * IN, YF + 5 * IN, zt + 5 * IN, x1 + 1 * IN, YB - 5 * IN, zt + 7 * IN);
  const sr = m.min(cw, D - 12 * IN) * 0.42, sy = cy;
  for (let i = 0; i < nc; i++) { const x = x0 + (i + 0.5) * cw; a.cone(x, sy, zt + 7 * IN, Z1 - 2 * IN, sr * 1.25, sr, 28); a.cyl(x, sy, Z1 - 4 * IN, Z1, sr * 1.04, 28); fanXY(a, x, sy, Z1 - 14 * IN, sr * 0.92, 5, false); a.box(x - 6 * IN, sy - 1 * IN, Z1 - 17 * IN, x + 6 * IN, sy + 1 * IN, Z1 - 15 * IN); a.box(x - 1 * IN, sy - sr * 0.8, Z1 - 17 * IN, x + 1 * IN, sy + sr * 0.8, Z1 - 15 * IN); a.box(x - 11 * IN, sy - 6 * IN, zt + 7 * IN, x + 11 * IN, sy + 6 * IN, zt + 16 * IN); }
  rail(a, x0, YF + 6 * IN, x1, YF + 6 * IN, zt + 7 * IN, zt + 7 * IN + 36 * IN, 12, nc + 2); rail(a, x0, YB - 6 * IN, x1, YB - 6 * IN, zt + 7 * IN, zt + 7 * IN + 36 * IN, 12, nc + 2);
  ladderX(a, YF + 2 * IN, x1 - 8 * IN, Z0, zt + 36 * IN, 18 * IN, 22);
  for (const [x, yy] of [[x0 + 12 * IN, cy - 14 * IN], [x0 + 12 * IN, cy + 14 * IN]]) { a.ycyl(YB - 2 * IN, YB + 0, x, Z0 + 10 * IN, 5 * IN, 14); }
  nozz(a, 'x', cy - 12 * IN, Z0 + 10 * IN, X0 - 0 + 8 * IN, X0 + 0.4 * IN, 4 * IN, 1.7, 18); nozz(a, 'x', cy + 12 * IN, Z0 + 10 * IN, X0 + 8 * IN, X0 + 0.4 * IN, 4 * IN, 1.7, 18);
  a.outline(); for (let i = 0; i < nc; i++) { const x = x0 + (i + 0.5) * cw; a.circ(x, sy, sr, 'EQUIP-DETAIL'); a.circ(x, sy, sr * 0.14, 'EQUIP-DETAIL'); if (i) a.line(x0 + i * cw, YF + 2 * IN, x0 + i * cw, YB - 2 * IN, 'EQUIP-DETAIL'); }
  a.log(`Added the water basin with sump pipes and flanges, ${nc} cell${nc > 1 ? 's' : ''} with louvred fill faces front and back, the fan deck with a stack, fan blades and guard rail per cell and the access ladder (plan and 3D).`);
}
/** a tapered industrial stack with painted bands, ladder with cage, two platforms and a cleanout door */
function chimney(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, rb = v.dia * IN / 2, rt = rb * 0.52, rr = (z) => rb + (rt - rb) * ((z - Z0) / H);
  a.cyl(cx, cy, Z0, Z0 + 12 * IN, rb * 1.22, 28); a.cyl(cx, cy, Z0 + 12 * IN, Z0 + 20 * IN, rb * 1.1, 28);
  const pts = [], rads = []; for (let k = 0; k <= 8; k++) { const z = Z0 + 20 * IN + (H - 20 * IN) * k / 8; pts.push([cx, cy, z]); rads.push(rr(z)); } a.tube(pts, rads, 28);
  const nb = 6; for (let i = 0; i < nb; i++) { if (i % 2) continue; const z0 = Z1 - 4 * IN - (H * 0.16) * (i + 1) / 1.0 * 0.5, z1 = z0 + H * 0.08; a.cone(cx, cy, z0, z1, rr(z0) + 5, rr(z1) + 5, 28); }
  a.cyl(cx, cy, Z1 - 5 * IN, Z1, rt * 1.12, 28); a.cyl(cx, cy, Z1 - 12 * IN, Z1 - 5 * IN, rt * 1.05, 28);
  for (const f of [0.18, 0.42, 0.66, 0.85]) { const z = Z0 + H * f; a.cyl(cx, cy, z, z + 5 * IN, rr(z) + 8, 28); }
  a.box(cx - 13 * IN, cy - rb - 3 * IN, Z0 + 20 * IN, cx + 13 * IN, cy - rb + 4 * IN, Z0 + 62 * IN); a.box(cx - 10 * IN, cy - rb - 3.4 * IN, Z0 + 24 * IN, cx + 10 * IN, cy - rb - 3 * IN, Z0 + 58 * IN);
  const lxp = cx + rb * 0.0, ly = cy + rb + 12; for (const s of [-1, 1]) a.tube([[lxp + s * 8 * IN, ly + 3 * IN, Z0 + 20 * IN], [lxp + s * 8 * IN, ly + 3 * IN, Z1 - 16 * IN]], [0.8 * IN, 0.8 * IN], 6);
  for (let z = Z0 + 24 * IN; z < Z1 - 20 * IN; z += 12 * IN) a.tube([[lxp - 8 * IN, ly + 3 * IN, z], [lxp + 8 * IN, ly + 3 * IN, z]], [0.6 * IN, 0.6 * IN], 5);
  for (let z = Z0 + 112 * IN; z < Z1 - 40 * IN; z += 60 * IN) { const pts2 = []; for (let k = 0; k <= 12; k++) { const th = -m.PI * 0.5 + (k / 12) * m.PI; pts2.push([lxp + 12 * IN * m.cos(th) * 0.9, ly + 3 * IN + 12 * IN * m.sin(th) + 12 * IN, z]); } a.tube(pts2, pts2.map(() => 0.5 * IN), 4); }
  for (const f of [0.66, 0.97]) { const z = Z0 + H * f, r = rr(z) + 3 * IN; a.cyl(cx, cy, z - 1.5 * IN, z, r + 22 * IN, 28); const pts3 = []; for (let k = 0; k <= 24; k++) { const th = (k / 24) * TAU; pts3.push([cx + (r + 22 * IN) * m.cos(th), cy + (r + 22 * IN) * m.sin(th), z + 38 * IN]); } a.tube(pts3, pts3.map(() => 0.8 * IN), 4); for (let k = 0; k < 8; k++) { const th = (k / 8) * TAU; a.tube([[cx + (r + 22 * IN) * m.cos(th), cy + (r + 22 * IN) * m.sin(th), z], [cx + (r + 22 * IN) * m.cos(th), cy + (r + 22 * IN) * m.sin(th), z + 38 * IN]], [0.7 * IN, 0.7 * IN], 4); } }
  a.circ(cx, cy, rb); a.circ(cx, cy, rb * 1.22, 'EQUIP-DETAIL'); a.circ(cx, cy, rt, 'EQUIP-HIDDEN');
  a.log('Added the base plinth, the tapered shell with stiffening rings and painted bands, the cleanout door, the caged ladder, two platforms with railings and the rim at the top (plan and 3D).');
}
/** a rectangular double-wall fuel tank on a skid with lifting lugs, fill, vent, gauge and sump */
function fuelTank(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, sk = 5 * IN, rb = 1.5 * IN;
  a.box(X0 + 2 * IN, YF + 2 * IN, Z0, X0 + 8 * IN, YB - 2 * IN, Z0 + sk); a.box(X1 - 8 * IN, YF + 2 * IN, Z0, X1 - 2 * IN, YB - 2 * IN, Z0 + sk); a.box(cx - 3 * IN, YF + 2 * IN, Z0, cx + 3 * IN, YB - 2 * IN, Z0 + sk);
  a.box(X0, YF, Z0 + sk, X1, YB, Z1 - 3 * IN);
  for (let i = 1; i < v.ribs; i++) { const x = X0 + W * i / v.ribs; a.box(x - 1 * IN, YF - 1 * IN, Z0 + sk, x + 1 * IN, YF, Z1 - 3 * IN); a.box(x - 1 * IN, YB, Z0 + sk, x + 1 * IN, YB + 0.01, Z1 - 3 * IN); }
  a.box(X0 + 4 * IN, YF + 4 * IN, Z1 - 3 * IN, X1 - 4 * IN, YB - 4 * IN, Z1 - 1.5 * IN); a.box(X0, YF - 1 * IN, Z1 - 3 * IN - 4 * IN, X1, YF, Z1 - 3 * IN); 
  const hx = X0 + 6 * IN; for (const x of [X0 + 6 * IN, X1 - 6 * IN]) { a.tube([[x, cy, Z1 - 1.5 * IN], [x, cy, Z1 - 1.5 * IN + 3 * IN], [x + 0.001, cy, Z1 - 1.5 * IN]], [0.8 * IN, 0.8 * IN, 0.8 * IN], 8); a.ycyl(cy - 2 * IN, cy + 2 * IN, x, Z1 - 0.2 * IN, 0.8 * IN, 8); }
  a.cyl(cx - W * 0.25, cy, Z1 - 1.5 * IN, Z1 - 0.2 * IN, 3 * IN, 16); a.cyl(cx - W * 0.25, cy, Z1 - 0.2 * IN, Z1, 2.4 * IN, 12);
  a.cyl(cx + W * 0.1, cy, Z1 - 1.5 * IN, Z1 - 0.1 * IN, 2 * IN, 14); a.tube([[cx + W * 0.28, cy, Z1 - 1.5 * IN], [cx + W * 0.28, cy, Z1 - 0.2 * IN]], [1 * IN, 1 * IN], 8); 
  a.tube([[X1 - 12 * IN, cy - 8 * IN, Z1 - 1.5 * IN], [X1 - 12 * IN, cy - 8 * IN, Z1 - 0.5 * IN]], [0.8 * IN, 0.8 * IN], 8); a.cyl(X1 - 12 * IN, cy - 8 * IN, Z1 - 0.5 * IN, Z1, 1.6 * IN, 12);
  a.box(X0 + W * 0.55, YF + 3 * IN, Z1 - 1.5 * IN, X0 + W * 0.55 + 12 * IN, YF + 13 * IN, Z1 - 0.2 * IN); a.ycyl(YF - 2 * IN, YF, X0 + W * 0.8, Z0 + sk + (H - sk) * 0.55, 2 * IN, 12); a.ycyl(YF - 2 * IN, YF, X0 + W * 0.2, Z0 + sk + (H - sk) * 0.55, 1.4 * IN, 10); a.box(X0 + W * 0.45, YF - 0.6 * IN, Z0 + sk + 3 * IN, X0 + W * 0.45 + 8 * IN, YF, Z0 + sk + 12 * IN);
  a.outline(); a.rect(X0 + 4 * IN, YF + 4 * IN, X1 - 4 * IN, YB - 4 * IN, 'EQUIP-DETAIL'); a.circ(cx - W * 0.25, cy, 3 * IN, 'EQUIP-DETAIL'); a.circ(cx + W * 0.1, cy, 2 * IN, 'EQUIP-DETAIL'); a.circ(X0 + W * 0.8, YF - 1 * IN, 2 * IN, 'EQUIP-DETAIL');
  for (const x of [X0 + 8 * IN, X1 - 8 * IN]) a.line(x, YF, x, YB, 'EQUIP-HIDDEN');
  a.log('Added the skid runners, the ribbed double-wall tank, the raised containment sump with lid, lifting lugs, locking fill cap, vent with cap, emergency vent, gauge, supply and return connections and the side nameplate (plan and 3D).');
}
/** a steam distribution header: a horizontal drum with branch valves and handwheels, saddles and a drain pot */
function steamHeader(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.dia * IN / 2, zc = Z0 + 18 * IN + R, n = v.n, x0 = X0 + 2 * IN + R * 0.4, x1 = X1 - 2 * IN - R * 0.4, br = R * 0.42;
  a.xcyl(x0, x1, cy, zc, R, 24); a.ell(x0, cy, zc, R * 0.4, R, R, 14, 6); a.ell(x1, cy, zc, R * 0.4, R, R, 14, 6); for (let x = x0 + 4 * IN; x < x1; x += 14 * IN) a.xcyl(x, x + 1.4 * IN, cy, zc, R * 1.1, 24);
  for (const f of [0.1, 0.9]) { const x = x0 + (x1 - x0) * f; a.box(x - 3 * IN, cy - R * 0.9, Z0, x + 3 * IN, cy + R * 0.9, Z0 + 2 * IN); a.box(x - 2 * IN, cy - R * 0.1, Z0 + 2 * IN, x + 2 * IN, cy + R * 0.1, zc - R * 0.6); a.box(x - 2 * IN, cy - R * 0.7, Z0 + 2 * IN, x + 2 * IN, cy - R * 0.5, zc - R * 0.6); a.box(x - 2 * IN, cy + R * 0.5, Z0 + 2 * IN, x + 2 * IN, cy + R * 0.7, zc - R * 0.6); }
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * (i + 0.5) / n, z1 = zc + R + 5 * IN; a.cyl(x, cy, zc + R - 10, z1, br, 14); flange(a, 'z', x, cy, z1, 1, br * 1.8, 20, br * 0.8, 8, br * 1.4, 12, 0, true);
    const vz = z1 + 20 + br * 1.6; a.cyl(x, cy, z1 + 20, vz + br * 0.4, br * 1.35, 14); a.ell(x, cy, vz + br * 0.4, br * 1.35, br * 1.35, br * 0.9, 12, 5); a.cyl(x, cy, vz + br * 1.1, vz + br * 3.2, br * 0.2, 8); a.box(x - br * 0.6, cy - br * 0.4, vz + br * 2.2, x + br * 0.6, cy + br * 0.4, vz + br * 2.6); handwheel(a, x, cy, vz + br * 3.4, br * 1.5, 8, 4);
  }
  a.cyl(x0 + (x1 - x0) * 0.05, cy, zc - R - 18 * IN + 20, zc - R + 10, 2.2 * IN, 12); a.cyl(x0 + (x1 - x0) * 0.05, cy, Z0 + 2 * IN, zc - R - 18 * IN + 20, 3 * IN, 12);
  a.cyl(cx, cy - R * 0.6, zc + R - 10, zc + R + 4 * IN, 0.9 * IN, 8); gauge(a, cx, cy - R * 0.6, zc + R + 7 * IN, 45);
  a.outline('EQUIP-HIDDEN'); a.rect(x0, cy - R, x1, cy + R); for (let i = 0; i < n; i++) a.circ(x0 + (x1 - x0) * (i + 0.5) / n, cy, br * 1.8, 'EQUIP-DETAIL');
  a.log(`Added the ribbed header drum with dished ends on two saddles, ${n} flanged branch stubs each with a globe valve and handwheel, the drain pot and the pressure gauge (plan and 3D).`);
}

// ------------------------------------------------------------------------------------------ families: generation
const G = [
  fam({ cat: 'energy/generation', title: 'Generic towable diesel generator trailer',
    desc: (v) => `Trailer-mounted ${v.kva} kVA diesel generator set with a ${v.tandem ? 'tandem' : 'single'} axle: tyres and fenders, A-frame drawbar with coupler, a screw jack, a sound enclosure with doors, louvres, a roof stack and rear lights.`,
    vs: [[20, 12, 0, 110, 52, 70], [45, 13, 0, 144, 62, 82], [100, 14, 1, 190, 74, 94], [200, 15, 1, 244, 88, 108]].map(([k, rw, td, w, d, h]) => [`${k} kVA, single axle`.replace('single axle', td ? 'tandem axle' : 'single axle'), w, d, h, 0, { kva: k, rw, tandem: !!td }]),
    build: (a, v) => trailerGen(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic portable open-frame generator',
    desc: (v) => `Portable open-frame generator of ${v.kw} kW class in a tubular cradle: engine block with cooling fins, alternator, fuel tank with cap, an outlet panel, a muffler and a carry handle${v.wheels ? ', with two wheels and a stand' : ''}.`,
    vs: [[3, 0, 24, 18, 20], [7, 1, 30, 22, 26], [12, 1, 36, 26, 30], [20, 1, 46, 30, 36]].map(([k, w, W, d, h]) => [`${k} kW${w ? ', wheel kit' : ', hand carry'}`, W, d, h, 0, { kw: k, wheels: !!w }]),
    build: (a, v) => portableGen(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic gas turbine generator package',
    desc: (v) => `Gas turbine generator package of ${v.mw} MW class on a base skid: louvred inlet air filter housing, turbine enclosure with doors and roof rail, generator with cooling rings, exhaust duct and a stack with ladder.`,
    vs: [[5, 420, 112, 156], [20, 600, 150, 204], [50, 780, 190, 264]].map(([mw, w, d, h]) => [`${mw} MW, ${w / 12} ft long`, w, d, h, 0, { mw }]),
    build: (a, v) => gasTurbine(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic boiler deaerator tank',
    desc: (v) => `Deaerator: a ${v.dia} in storage tank on two saddles with dished heads and a manway, topped by a vertical deaerating column with a dished head and vent flange, steam and water nozzles, outlet flange and a level gauge.`,
    vs: [[48, 144, 132], [72, 216, 180], [96, 288, 230]].map(([dia, w, h]) => [`${dia} in tank, ${w / 12} ft long`, w, dia + 14, h, 0, { dia }]),
    build: (a, v) => deaerator(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic boiler feed pump skid',
    desc: (v) => `Boiler feed pump on a channel base with a drip plate: a ribbed electric motor with terminal box, a coupling guard, a ${v.stg}-stage pump barrel with stage rings and flanged suction and discharge nozzles.`,
    vs: [[3, 5, 64, 26, 34], [4, 20, 88, 32, 40], [6, 50, 112, 38, 46], [8, 100, 140, 46, 54]].map(([stg, hp, w, d, h]) => [`${hp} hp, ${stg} stages`, w, d, h, 0, { stg }]),
    build: (a, v) => feedPump(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic wall-hung condensing boiler',
    desc: 'Wall-hung condensing boiler: a casing with front panel, display, control knobs and pressure gauge, a concentric flue outlet on top and five pipe connections with valves along the bottom.',
    vs: [['24 kW class', 16, 11, 28, 40], ['35 kW class', 18, 13, 32, 40], ['70 kW class', 24, 16, 38, 36]].map(([l, w, d, h, z]) => [l, w, d, h, z, {}]),
    build: (a, v) => wallBoiler(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic sectional hot-water boiler',
    desc: (v) => `Floor-standing sectional hot-water boiler of ${v.sec} sections on a base, with a control panel and dials, a hinged burner door carrying the burner, blower and gas train, flow and return pipes on top and a rear flue collar.`,
    vs: [[5, 140, 28, 48, 50], [8, 300, 34, 62, 58], [12, 600, 42, 80, 66]].map(([sec, kw, w, d, h]) => [`${sec} sections, ${kw} kW class`, w, d, h, 0, { sec }]),
    build: (a, v) => sectBoiler(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic cross-flow cooling tower',
    desc: (v) => `Cross-flow cooling tower of ${v.cells} cell${v.cells > 1 ? 's' : ''} on a water basin: louvred fill faces front and back, a fan deck with a stack, fan and guard rail per cell, a ladder and flanged inlet and outlet pipes.`,
    vs: [[1, 84, 84, 130], [2, 168, 84, 134], [3, 252, 90, 140], [4, 336, 96, 146]].map(([c, w, d, h]) => [`${c} cell${c > 1 ? 's' : ''}, ${w / 12} ft`, w, d, h, 0, { cells: c }]),
    build: (a, v) => coolTower(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic industrial exhaust stack',
    desc: (v) => `Tapered industrial exhaust stack, ${v.dia} in at the base: plinth, stiffening rings, painted bands, a cleanout door, caged ladder, two platforms with railings and a rim at the top.`,
    vs: [[48, 600], [72, 1080], [108, 1680]].map(([dia, h]) => [`${h / 12} ft tall, ${dia} in base`, dia + 70, dia + 70, h, 0, { dia }]),
    build: (a, v) => chimney(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic double-wall fuel storage tank',
    desc: (v) => `Rectangular double-wall fuel tank of ${v.gal} gallons on skid runners: ribbed walls, a raised containment sump with lid, lifting lugs, locking fill cap, vent, emergency vent, gauge and supply and return connections.`,
    vs: [[500, 78, 36, 50, 4], [1000, 100, 44, 60, 5], [2000, 138, 52, 68, 6], [5000, 200, 70, 82, 8]].map(([g, w, d, h, r]) => [`${g} gal, ${w} in long`, w, d, h, 0, { gal: g, ribs: r }]),
    build: (a, v) => fuelTank(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic steam distribution header',
    desc: (v) => `Steam header: a ${v.dia} in ribbed drum with dished ends on two saddles, ${v.n} flanged branch stubs each with a globe valve and handwheel, a drain pot and a pressure gauge.`,
    vs: [[4, 10, 72], [6, 12, 104], [8, 14, 140]].map(([n, dia, w]) => [`${n} branches, ${dia} in header`, w, dia + 24, dia + 74, 0, { n, dia }]),
    build: (a, v) => steamHeader(a, v) }),
];

// ================================================================================== renewable
/** a single-axis tracker row: posts with bearings, a torque tube, a drive and modules tilted about the tube */
function tracker(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, tilt = 28 * m.PI / 180, mw = (W - 20 * IN) / v.n, hs = 39 * IN, zt = Z0 + 66 * IN, np = m.max(3, m.ceil(v.n / 4) + 1), x0 = X0 + 10 * IN;
  const post = (x) => { a.box(x - 5 * IN, cy - 5 * IN, Z0, x + 5 * IN, cy + 5 * IN, Z0 + 1 * IN); a.tube([[x, cy, Z0], [x, cy, zt - 4 * IN]], [2.4 * IN, 2.4 * IN], 10); a.box(x - 3 * IN, cy - 2.2 * IN, zt - 4 * IN, x + 3 * IN, cy + 2.2 * IN, zt - 1 * IN); a.box(x - 2 * IN, cy - 2.6 * IN, zt - 1 * IN, x + 2 * IN, cy + 2.6 * IN, zt + 1 * IN); };
  a.tube([[x0 - 4 * IN, cy, zt], [X1 - 6 * IN, cy, zt]], [2 * IN, 2 * IN], 8);
  for (let k = 0; k < np; k++) post(x0 + (W - 20 * IN) * k / (np - 1));
  for (let i = 0; i < v.n; i++) { const xa = x0 + i * mw + 1 * IN, xb = x0 + (i + 1) * mw - 1 * IN; pvAt(a, xa, xb, cy, zt + 1.5 * IN, hs, tilt, 1.4 * IN, 1.5 * IN); a.box(xa + mw * 0.3, cy - 2.5 * IN, zt - 1 * IN, xa + mw * 0.3 + 2 * IN, cy + 2.5 * IN, zt + 4 * IN); }
  const dx = x0 + (W - 20 * IN) * 0.5; a.box(dx - 5 * IN, cy - 6 * IN, zt - 18 * IN, dx + 5 * IN, cy + 6 * IN, zt - 4 * IN); a.cyl(dx, cy, zt - 22 * IN, zt - 18 * IN, 3 * IN, 12); a.ycyl(cy + 6 * IN, cy + 9 * IN, dx, zt - 11 * IN, 3 * IN, 12);
  a.tube([[dx, cy, zt - 18 * IN], [dx, cy, Z0 + 10 * IN]], [2.4 * IN, 2.4 * IN], 8); a.box(dx - 3 * IN, cy - 3 * IN, Z0 + 10 * IN, dx + 3 * IN, cy + 3 * IN, Z0 + 16 * IN);
  a.outline('EQUIP-HIDDEN'); const pw = hs * 2 * m.cos(tilt); a.rect(x0, cy - pw / 2, X1 - 10 * IN, cy + pw / 2); for (let i = 1; i < v.n; i++) a.line(x0 + i * mw, cy - pw / 2, x0 + i * mw, cy + pw / 2, 'EQUIP-DETAIL'); for (let k = 0; k < np; k++) a.circ(x0 + (W - 20 * IN) * k / (np - 1), cy, 2.4 * IN, 'EQUIP-DETAIL');
  a.log(`Added ${np} posts with base plates and bearings, the torque tube, ${v.n} framed modules tilted 28 degrees about it with clamps, and the drive motor with gearbox in a post-mounted housing (plan and 3D).`);
}
/** a low-tilt ballasted flat-roof array: roof pad, trays with legs, concrete ballast blocks, landscape modules */
function ballasted(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, tilt = 12 * m.PI / 180, c = m.cos(tilt), sn = m.sin(tilt), mw = (W - 8 * IN) / v.nx, ml = 40 * IN, row = ml * c + 14 * IN, rp = 3 * IN;
  a.box(X0, YF, Z0, X1, YB, Z0 + rp);
  for (let r = 0; r < v.nr; r++) { const yb = YF + 4 * IN + r * row + 1 * IN, zb = Z0 + rp + 2 * IN;
    for (let i = 0; i < v.nx; i++) { const xa = X0 + 4 * IN + i * mw + 0.6 * IN, xb = X0 + 4 * IN + (i + 1) * mw - 0.6 * IN; pvAt(a, xa, xb, yb + ml * c / 2, zb + ml * sn / 2 + 2.5 * IN, ml / 2, tilt, 1.4 * IN); }
    for (let i = 0; i <= v.nx; i += 2) { const x = X0 + 4 * IN + m.min(i, v.nx) * mw; a.tube([[x, yb + 1 * IN, zb], [x, yb + ml * c - 1 * IN, zb + ml * sn + 1.5 * IN]], [0.7 * IN, 0.7 * IN], 6); a.tube([[x, yb + ml * c - 2 * IN, zb], [x, yb + ml * c - 1 * IN, zb + ml * sn + 1.5 * IN]], [0.7 * IN, 0.7 * IN], 6); a.box(x - 1 * IN, yb, zb - 1, x + 1 * IN, yb + ml * c, zb + 1.5 * IN); }
    for (let i = 0; i < v.nx; i += 2) a.box(X0 + 4 * IN + i * mw + mw * 0.2, yb + ml * c * 0.5, zb + 1.6 * IN, X0 + 4 * IN + i * mw + mw * 0.75, yb + ml * c * 0.5 + 7 * IN, zb + 5.6 * IN);
    a.rect(X0 + 4 * IN, yb, X1 - 4 * IN, yb + ml * c); for (let i = 1; i < v.nx; i++) a.line(X0 + 4 * IN + i * mw, yb, X0 + 4 * IN + i * mw, yb + ml * c, 'EQUIP-DETAIL'); }
  a.outline('EQUIP-HIDDEN');
  a.log(`Added the roof pad, ${v.nr * v.nx} landscape modules tilted 12 degrees in ${v.nr} row${v.nr > 1 ? 's' : ''} on rear legs and rails, and the concrete ballast blocks on the trays (plan and 3D).`);
}
/** a solar street light: base plate with anchor nuts, tapered pole, arm with LED head, tilted PV panel, battery box and door */
function solarLamp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pr = 2.6 * IN, pz = Z1 - 10 * IN, tilt = 20 * m.PI / 180;
  a.box(cx - 8 * IN, cy - 8 * IN, Z0, cx + 8 * IN, cy + 8 * IN, Z0 + 1 * IN); for (const sx of [-1, 1]) for (const sy of [-1, 1]) { a.cyl(cx + sx * 6 * IN, cy + sy * 6 * IN, Z0 + 1 * IN, Z0 + 3 * IN, 0.5 * IN, 6); a.cyl(cx + sx * 6 * IN, cy + sy * 6 * IN, Z0 + 1.6 * IN, Z0 + 2.2 * IN, 0.9 * IN, 6); }
  a.cone(cx, cy, Z0 + 1 * IN, Z0 + 10 * IN, pr * 1.6, pr * 1.05, 14); a.tube([[cx, cy, Z0 + 10 * IN], [cx, cy, Z0 + (pz - Z0) * 0.5], [cx, cy, pz]], [pr * 1.05, pr * 0.85, pr * 0.62], 14);
  a.box(cx - 5 * IN, cy + pr, Z0 + 52 * IN, cx + 5 * IN, cy + pr + 6 * IN, Z0 + 70 * IN); a.box(cx - 4.4 * IN, cy + pr + 6 * IN, Z0 + 54 * IN, cx + 4.4 * IN, cy + pr + 6.4 * IN, Z0 + 68 * IN);
  const al = v.arm * IN; a.tube([[cx, cy, pz], [cx, cy - al * 0.4, pz + 4 * IN], [cx, cy - al, pz + 7 * IN]], [pr * 0.6, pr * 0.45, pr * 0.4], 8);
  prismY(a, [[cx - 7 * IN, pz + 3 * IN], [cx + 7 * IN, pz + 3 * IN], [cx + 5 * IN, pz + 8 * IN], [cx - 5 * IN, pz + 8 * IN]], cy - al - 12 * IN, cy - al + 8 * IN); a.box(cx - 5 * IN, cy - al - 10 * IN, pz + 1 * IN, cx + 5 * IN, cy - al + 6 * IN, pz + 3 * IN); a.rect(cx - 7 * IN, cy - al - 12 * IN, cx + 7 * IN, cy - al + 8 * IN, 'EQUIP');
  const pc = [cx, cy + 14 * IN, Z1 - 3 * IN]; a.tube([[cx, cy, pz + 2 * IN], [cx, cy + 6 * IN, Z1 - 7 * IN]], [pr * 0.4, pr * 0.4], 6); pvAt(a, cx - 17 * IN, cx + 17 * IN, cy + 12 * IN, Z1 - 5 * IN, 14 * IN, tilt, 1.4 * IN);
  a.rect(cx - 17 * IN, cy + 12 * IN - 13 * IN, cx + 17 * IN, cy + 12 * IN + 13 * IN, 'EQUIP-DETAIL'); a.circ(cx, cy, pr * 1.6);
  a.log('Added the base plate with anchor nuts, the tapered pole, the battery box with its door, the swept arm carrying the LED head and the tilted solar panel on its bracket (plan and 3D).');
}
/** a thermosiphon solar water heater: stand, tilted collector with risers, a tank on top, pipes */
function solarHeater(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, tilt = 35 * m.PI / 180, c = m.cos(tilt), sn = m.sin(tilt), cw = (W - 4 * IN) / v.n, ln = 74 * IN, yb = YF + (D - ln * c) / 2 + 2 * IN, zb = Z0 + 14 * IN;
  const P = (s, n) => [yb + s * c - n * sn, zb + s * sn + n * c];
  for (let i = 0; i < v.n; i++) { const xa = X0 + 2 * IN + i * cw + 0.5 * IN, xb = X0 + 2 * IN + (i + 1) * cw - 0.5 * IN; prismX(a, [P(0, 0), P(ln, 0), P(ln, -4 * IN), P(0, -4 * IN)], xa, xb); prismX(a, [P(2 * IN, 0), P(ln - 2 * IN, 0), P(ln - 2 * IN, 0.8 * IN), P(2 * IN, 0.8 * IN)], xa + 2 * IN, xb - 2 * IN);
    for (let k = 0; k < 7; k++) { const x = xa + 4 * IN + k * (xb - xa - 8 * IN) / 6, p0 = P(3 * IN, 0.9 * IN), p1 = P(ln - 3 * IN, 0.9 * IN); a.tube([[x, p0[0], p0[1]], [x, p1[0], p1[1]]], [0.35 * IN, 0.35 * IN], 4); } }
  const tr = 8 * IN, tz = P(ln, 0)[1] + 9 * IN, ty = P(ln, 0)[0] + 2 * IN; a.xcyl(X0 + 2.5 * IN, X1 - 2.5 * IN, ty, tz, tr, 20); a.ell(X0 + 2.5 * IN, ty, tz, 2 * IN, tr, tr, 12, 5); a.ell(X1 - 2.5 * IN, ty, tz, 2 * IN, tr, tr, 12, 5);
  for (let i = 0; i < v.n; i++) { const x = X0 + 2 * IN + (i + 0.5) * cw; for (const s of [-0.3, 0.3]) { const p = P(ln - 2 * IN, 3 * IN); a.tube([[x + s * cw * 0.3, p[0], p[1]], [x + s * cw * 0.3, ty, tz - tr]], [0.8 * IN, 0.8 * IN], 6); } }
  a.tube([[X0 + 3 * IN, ty, tz + tr], [X0 + 3 * IN, ty, tz + tr + 5 * IN], [X0 + 7 * IN, ty, tz + tr + 7 * IN]], [0.6 * IN, 0.6 * IN, 0.6 * IN], 6); a.cyl(X1 - 4 * IN, ty, tz + tr - 10, tz + tr + 4 * IN, 1 * IN, 8);
  const xs = [X0 + 3 * IN, X1 - 3 * IN]; for (const x of xs) { const pb = P(2 * IN, -4 * IN), pt = P(ln - 2 * IN, -4 * IN); a.tube([[x, pb[0] - 1 * IN, Z0], [x, pb[0], pb[1]]], [0.9 * IN, 0.9 * IN], 6); a.tube([[x, pt[0] + 2 * IN, Z0], [x, pt[0], pt[1]]], [0.9 * IN, 0.9 * IN], 6); a.tube([[x, pb[0], pb[1]], [x, pt[0], pt[1]]], [0.9 * IN, 0.9 * IN], 6); a.box(x - 3 * IN, pb[0] - 4 * IN, Z0, x + 3 * IN, pb[0] + 2 * IN, Z0 + 1 * IN); a.box(x - 3 * IN, pt[0] - 2 * IN, Z0, x + 3 * IN, pt[0] + 4 * IN, Z0 + 1 * IN); }
  a.box(X0 + 4 * IN, YB - 2 * IN - 0, Z0, X0 + 12 * IN, YB, Z0 + 3 * IN);
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + 2 * IN, yb, X1 - 2 * IN, yb + ln * c); a.xcyl; for (let i = 1; i < v.n; i++) a.line(X0 + 2 * IN + i * cw, yb, X0 + 2 * IN + i * cw, yb + ln * c, 'EQUIP-DETAIL'); a.rect(X0 + 1 * IN, ty - tr, X1 - 1 * IN, ty + tr, 'EQUIP-DETAIL');
  a.log(`Added the framed collector${v.n > 1 ? 's' : ''} with glass and riser tubes tilted 35 degrees on a stand, the horizontal storage tank with dished ends on top, the connecting pipes and the relief valve (plan and 3D).`);
}
/** a central inverter station: skid, enclosure with a double door, roof vents, a finned transformer on the side, a switchgear cabinet and stairs */
function invStation(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bh = 12 * IN, ew = W * 0.58, ex1 = X0 + ew + 4 * IN, yf = YF + 22 * IN;
  a.box(X0, YF + 6 * IN, Z0, X1, YB, Z0 + bh); a.box(X0 + 2 * IN, yf, Z0 + bh, ex1, YB - 2 * IN, Z1 - 3 * IN); prismX(a, [[yf, Z1 - 3 * IN], [YB - 2 * IN, Z1 - 3 * IN], [YB - 8 * IN, Z1], [yf + 6 * IN, Z1]], X0 + 2 * IN, ex1);
  const nd = 2, dw = (ew - 14 * IN) / nd; for (let i = 0; i < nd; i++) { const x0 = X0 + 8 * IN + i * dw, x1 = x0 + dw - 3 * IN; a.frame(x0, Z0 + bh + 6 * IN, x1, Z1 - 12 * IN, yf - 1.2 * IN, yf + 0.3, 2 * IN); a.box(x0 + 4 * IN, yf - 0.6 * IN, Z0 + bh + 10 * IN, x1 - 4 * IN, yf, Z1 - 16 * IN); lever(a, x1 - 4 * IN, yf - 1.2 * IN, (Z0 + Z1) / 2, 60); }
  louv(a, X0 + 14 * IN, ex1 - 14 * IN, yf, Z1 - 11 * IN, Z1 - 5 * IN, 1.6 * IN, 0.8 * IN);
  for (let i = 0; i < 4; i++) a.box(X0 + 14 * IN + i * (ew - 28 * IN) / 3 - 3 * IN, yf + 8 * IN, Z1, X0 + 14 * IN + i * (ew - 28 * IN) / 3 + 3 * IN, YB - 14 * IN, Z1 + 0);
  const tx0 = ex1 + 6 * IN, tx1 = X1 - 6 * IN - (W - ew) * 0.35, th = (Z1 - Z0 - bh) * 0.7; a.box(tx0, yf + 4 * IN, Z0 + bh, tx1, YB - 6 * IN, Z0 + bh + th);
  const nf = m.round((tx1 - tx0) / (3 * IN)); for (let i = 0; i < nf; i++) a.box(tx0 + i * (tx1 - tx0) / nf, YB - 6 * IN, Z0 + bh + 4 * IN, tx0 + i * (tx1 - tx0) / nf + 1 * IN, YB - 6 * IN + 6 * IN, Z0 + bh + th - 4 * IN);
  for (let i = 0; i < 3; i++) bushing(a, tx0 + (tx1 - tx0) * (0.2 + i * 0.3), (yf + YB) / 2 - 2 * IN, Z0 + bh + th, 14 * IN, 1.3 * IN, 5);
  a.cyl(tx0 + (tx1 - tx0) * 0.5, YF + 12 * IN, Z0 + bh, Z0 + bh + 1, 0.2, 4); 
  const sx0 = tx1 + 6 * IN; a.box(sx0, yf + 6 * IN, Z0 + bh, X1 - 4 * IN, YB - 4 * IN, Z0 + bh + (Z1 - Z0 - bh) * 0.85); a.frame(sx0 + 3 * IN, Z0 + bh + 6 * IN, X1 - 7 * IN, Z0 + bh + (Z1 - Z0 - bh) * 0.85 - 6 * IN, yf + 5 * IN, yf + 6.2 * IN, 1.5 * IN); lever(a, X1 - 9 * IN, yf + 5 * IN, Z0 + bh + 40 * IN, 40);
  for (let i = 0; i < 4; i++) { const y = YF + 6 * IN + i * 4.5 * IN, z = Z0 + bh - i * 3 * IN; a.box(cx - 40 * IN, y, z - 3 * IN, cx - 8 * IN + 0, y + 4.5 * IN, z); }
  a.box(X0 + 6 * IN, YF + 6 * IN, Z0 + bh - 1 * IN, X0 + 30 * IN, YF + 10 * IN, Z0 + bh); 
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + 2 * IN, yf, ex1, YB - 2 * IN); a.rect(tx0, yf + 4 * IN, tx1, YB - 6 * IN, 'EQUIP-DETAIL'); a.rect(sx0, yf + 6 * IN, X1 - 4 * IN, YB - 4 * IN, 'EQUIP-DETAIL'); a.rect(X0, YF + 6 * IN, X1, YB, 'EQUIP-DETAIL'); a.clear('Door clearance', X0, YF, ex1, yf, 80);
  a.log('Added the skid, the inverter enclosure with a double door, handles and roof louvres, the finned transformer with three bushings, the medium-voltage cabinet with its door and the entry steps (plan and 3D).');
}
/** a pad-mounted DC recombiner cabinet on a post frame with a sun shade, door, hinges, latch and conduit stubs */
function recombiner(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cz0 = Z0 + 26 * IN, ch = Z1 - cz0 - 5 * IN;
  for (const x of [X0 + 3 * IN, X1 - 3 * IN]) { a.tube([[x, cy, Z0], [x, cy, cz0 + ch * 0.8]], [1 * IN, 1 * IN], 8); a.box(x - 3 * IN, cy - 3 * IN, Z0, x + 3 * IN, cy + 3 * IN, Z0 + 0.6 * IN); }
  a.box(X0 + 1 * IN, YF + 1.5 * IN, cz0 - 1 * IN, X1 - 1 * IN, YB - 0.5 * IN, cz0); a.box(X0 + 2 * IN, YF + 2 * IN, cz0, X1 - 2 * IN, YB - 1 * IN, cz0 + ch);
  const nd = W > 36 * IN ? 2 : 1, dw = (W - 6 * IN) / nd; for (let i = 0; i < nd; i++) { const x0 = X0 + 3 * IN + i * dw + 0.4 * IN, x1 = X0 + 3 * IN + (i + 1) * dw - 0.4 * IN; a.box(x0, YF + 0.8 * IN, cz0 + 2 * IN, x1, YF + 2 * IN, cz0 + ch - 2 * IN); const hx = i === 0 ? x0 : x1; for (const z of [cz0 + 5 * IN, cz0 + ch - 5 * IN]) a.cyl(hx, YF + 0.8 * IN, z - 1.2 * IN, z + 1.2 * IN, 0.5 * IN, 8); a.box((i === 0 ? x1 - 3 * IN : x0 + 1 * IN), YF, cz0 + ch * 0.5 - 2 * IN, (i === 0 ? x1 - 1 * IN : x0 + 3 * IN), YF + 0.8 * IN, cz0 + ch * 0.5 + 2 * IN); }
  a.box(X0 + W * 0.3, YF + 0.5 * IN, cz0 + ch - 7 * IN, X0 + W * 0.3 + 5 * IN, YF + 0.9 * IN, cz0 + ch - 4 * IN);
  prismX(a, [[YF - 1 * IN, cz0 + ch + 1 * IN], [YB, cz0 + ch + 1 * IN], [YB, cz0 + ch + 3.5 * IN], [YF - 1 * IN, cz0 + ch + 2 * IN]], X0, X1);
  for (let i = 0; i < v.cond; i++) { const x = X0 + 5 * IN + i * (W - 10 * IN) / m.max(1, v.cond - 1); a.cyl(x, cy + 1 * IN, cz0 - 12 * IN, cz0 - 1 * IN, 0.7 * IN, 8); a.cyl(x, cy + 1 * IN, cz0 - 2.5 * IN, cz0 - 1 * IN, 1.1 * IN, 8); a.tube([[x, cy + 1 * IN, cz0 - 12 * IN], [x, cy + 1 * IN, Z0 + 4 * IN]], [0.7 * IN, 0.7 * IN], 6); }
  a.outline(); a.rect(X0 + 2 * IN, YF + 2 * IN, X1 - 2 * IN, YB - 1 * IN, 'EQUIP-DETAIL'); for (let i = 1; i < nd; i++) a.line(X0 + 3 * IN + i * dw, YF + 0.8 * IN, X0 + 3 * IN + i * dw, YF + 2 * IN, 'EQUIP-DETAIL');
  a.log(`Added the two posts with foot plates, the cabinet with ${nd > 1 ? 'two doors' : 'a door'}, hinges, latch and a padlock hasp, the sloping sun shade and ${v.cond} conduit stubs from the bottom (plan and 3D).`);
}
/** an open battery rack with trays: four posts, shelf rails, trays with handles and lamps, bus bars and a controller on top */
function battRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.trays, pw = 1.6 * IN, zb = Z0 + 3 * IN, ct = 6 * IN, th = (H - 3 * IN - ct) / n;
  for (const x of [X0 + 0.5 * IN, X1 - 0.5 * IN - pw]) for (const [y0, y1] of [[YF + 0.5 * IN, YF + 0.5 * IN + pw], [YB - 0.5 * IN - pw, YB - 0.5 * IN]]) a.box(x, y0, Z0, x + pw, y1, Z1);
  a.box(X0, YF, Z0 + 1 * IN, X1, YB, zb); for (const x of [X0 + 2 * IN, X1 - 4 * IN]) for (const y of [YF + 2 * IN, YB - 4 * IN]) a.box(x, y, Z0, x + 2 * IN, y + 2 * IN, Z0 + 1 * IN);
  for (let i = 0; i < n; i++) { const z0 = zb + i * th + 0.4 * IN, z1 = z0 + th - 0.9 * IN; a.box(X0 + 2.2 * IN, YF + 1 * IN, z0, X1 - 2.2 * IN, YB - 2 * IN, z1); a.box(X0 + 2.2 * IN, YF + 0.4 * IN, z0 + 0.2 * IN, X1 - 2.2 * IN, YF + 1 * IN, z1 - 0.2 * IN); a.box(cx - 3.2 * IN, YF - 0.4 * IN, (z0 + z1) / 2 - 0.3 * IN, cx + 3.2 * IN, YF + 0.4 * IN, (z0 + z1) / 2 + 0.3 * IN); a.cyl(X1 - 4.5 * IN, YF + 0.4 * IN, z1 - 1.4 * IN, z1 - 0.9 * IN, 0.35 * IN, 6); a.box(X0 + 3 * IN, YF + 0.1 * IN, z0 + 0.5 * IN, X0 + 5 * IN, YF + 0.5 * IN, z0 + 1.1 * IN); }
  a.box(X1 - 1.4 * IN, YB - 1.8 * IN, zb, X1 - 0.4 * IN, YB - 0.8 * IN, Z1 - ct); a.box(X0 + 0.4 * IN, YB - 1.8 * IN, zb, X0 + 1.4 * IN, YB - 0.8 * IN, Z1 - ct);
  a.box(X0 + 0.5 * IN, YF + 0.5 * IN, Z1 - ct, X1 - 0.5 * IN, YB - 0.5 * IN, Z1 - 0.5 * IN); a.box(X0 + 3 * IN, YF + 0.1 * IN, Z1 - ct + 1 * IN, X0 + 12 * IN, YF + 0.5 * IN, Z1 - 1.5 * IN); for (let i = 0; i < 3; i++) a.cyl(X1 - 12 * IN + i * 3 * IN, YF + 0.3 * IN, Z1 - 3 * IN, Z1 - 2.6 * IN, 0.6 * IN, 8);
  a.outline(); a.rect(X0 + 2.2 * IN, YF + 1 * IN, X1 - 2.2 * IN, YB - 2 * IN, 'EQUIP-DETAIL'); for (const x of [X0 + 0.5 * IN, X1 - 0.5 * IN - pw]) a.rect(x, YF + 0.5 * IN, x + pw, YF + 0.5 * IN + pw, 'EQUIP-DETAIL');
  a.log(`Added the four posts and feet, ${n} battery trays on shelf rails with handles, lamps and terminals, two bus bars at the back and the controller panel with display and indicators on top (plan and 3D).`);
}
/** an electrolyser skid: stack cabinet with a roof chiller, two vertical separators, a dryer column, a pipe rack and gas outlet */
function electrolyser(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bh = 8 * IN, cw = W * 0.5, ch = H * 0.62;
  skidFrame(a, X0, X1, YF, YB, Z0, bh, 6, 4 * IN);
  a.box(X0 + 4 * IN, YF + 8 * IN, Z0 + bh, X0 + cw, YB - 6 * IN, Z0 + bh + ch); prismX(a, [[YF + 8 * IN, Z0 + bh + ch], [YB - 6 * IN, Z0 + bh + ch], [YB - 10 * IN, Z0 + bh + ch + 3 * IN], [YF + 12 * IN, Z0 + bh + ch + 3 * IN]], X0 + 4 * IN, X0 + cw);
  const nd = 3, dw = (cw - 8 * IN) / nd; for (let i = 0; i < nd; i++) { const x0 = X0 + 6 * IN + i * dw, x1 = x0 + dw - 2 * IN; a.frame(x0, Z0 + bh + 6 * IN, x1, Z0 + bh + ch - 6 * IN, YF + 6.8 * IN, YF + 8.2 * IN, 1.6 * IN); louv(a, x0 + 3 * IN, x1 - 3 * IN, YF + 6.8 * IN, Z0 + bh + 12 * IN, Z0 + bh + 38 * IN, 3 * IN, 1.4 * IN); lever(a, x1 - 3 * IN, YF + 6.8 * IN, Z0 + bh + ch * 0.55, 44); }
  const ky = YB - 12 * IN, kz = Z0 + bh + ch + 4 * IN; a.box(X0 + 14 * IN, YF + 14 * IN, kz, X0 + cw - 10 * IN, YB - 14 * IN, kz + 16 * IN); for (let i = 0; i < 2; i++) { const fx = X0 + 14 * IN + (cw - 24 * IN) * (i + 0.5) / 2; a.cyl(fx, cy, kz + 16 * IN, kz + 18 * IN, 8 * IN, 16); fanXY(a, fx, cy, kz + 19 * IN, 7 * IN, 4, false); a.circ(fx, cy, 8 * IN, 'EQUIP-DETAIL'); }
  const vr = m.min(D * 0.2, 13 * IN), vh = H * 0.7;
  for (let i = 0; i < 2; i++) { const x = X0 + cw + 18 * IN + i * (vr * 2.6); a.cyl(x, cy + D * 0.1, Z0 + bh + 10 * IN, Z0 + bh + vh, vr, 20); a.ell(x, cy + D * 0.1, Z0 + bh + vh, vr, vr, vr * 0.4, 16, 5); a.ell(x, cy + D * 0.1, Z0 + bh + 10 * IN, vr, vr, vr * 0.25, 16, 5); for (const k of [0.3, 0.6]) a.ycyl(cy + D * 0.1 - vr - 1 * IN, cy + D * 0.1 - vr + 1 * IN, x, Z0 + bh + vh * k, 2.4 * IN, 10); for (const s of [-1, 1]) a.box(x + s * vr * 0.7 - 1 * IN, cy + D * 0.1 - 1 * IN, Z0 + bh, x + s * vr * 0.7 + 1 * IN, cy + D * 0.1 + 1 * IN, Z0 + bh + 10 * IN); a.circ(x, cy + D * 0.1, vr, 'EQUIP'); }
  const dxp = X1 - 20 * IN, dr = vr * 0.6; a.cyl(dxp, cy + D * 0.1, Z0 + bh + 4 * IN, Z0 + bh + H * 0.84, dr, 16); a.ell(dxp, cy + D * 0.1, Z0 + bh + H * 0.84, dr, dr, dr * 0.4, 12, 4); a.cyl(dxp, cy + D * 0.1, Z0 + bh, Z0 + bh + 4 * IN, dr * 1.3, 16); a.circ(dxp, cy + D * 0.1, dr, 'EQUIP');
  const pz = Z0 + bh + H * 0.74; a.tube([[X0 + cw, ky, pz], [X0 + cw + 16 * IN, ky, pz], [X0 + cw + 16 * IN, cy + D * 0.1, pz], [dxp, cy + D * 0.1, pz]], [1.2 * IN, 1.2 * IN, 1.2 * IN, 1.2 * IN], 8);
  for (const x of [X0 + cw + 3 * IN, X0 + cw + 16 * IN + 0]) a.cyl(x, ky, pz - 14 * IN, pz, 0.8 * IN, 6); a.tube([[X0 + cw + 16 * IN, cy + D * 0.1, pz], [X0 + cw + 16 * IN, cy + D * 0.1, Z0 + bh + 20 * IN]], [1 * IN, 1 * IN], 6);
  nozz(a, 'x', cy + D * 0.1, pz, dxp + dr, X1 - 1 * IN, 1.5 * IN); a.box(X1 - 14 * IN, YF + 6 * IN, Z0 + bh, X1 - 4 * IN, YF + 16 * IN, Z0 + bh + 40 * IN); a.box(X1 - 13 * IN, YF + 5.6 * IN, Z0 + bh + 26 * IN, X1 - 5 * IN, YF + 6 * IN, Z0 + bh + 36 * IN);
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + 4 * IN, YF + 8 * IN, X0 + cw, YB - 6 * IN, 'EQUIP');
  a.log('Added the base skid, the stack cabinet with three louvred doors and a roof chiller with two fans, two vertical gas-liquid separators, a dryer column, the elevated gas pipe run with its flanged outlet and the control box (plan and 3D).');
}
/** an air-source heat pump outdoor unit: casing, coil louvres, top fans with guards, feet, valve cover and pipe stubs */
function heatPump(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, ft = 3 * IN, nf = v.fans, fr = v.fr * IN / 2, cp = 1.2 * IN;
  for (const x of [X0 + 2 * IN, X1 - 6 * IN]) a.box(x, YF + 1 * IN, Z0, x + 4 * IN, YB - 1 * IN, Z0 + ft);
  a.box(X0, YF, Z0 + ft, X1, YB, Z1 - 3 * IN); a.box(X0 - 0.01, YF, Z1 - 3 * IN, X1, YB, Z1 - 1.2 * IN);
  for (const x of [X0, X1 - cp * 1.4]) for (const y of [YF, YB - cp * 1.4]) a.box(x, y, Z0 + ft, x + cp * 1.4, y + cp * 1.4, Z1 - 1.2 * IN);
  louv(a, X0 + cp * 2, X1 - cp * 2, YF, Z0 + ft + 3 * IN, Z1 - 7 * IN, 1.1 * IN, 0.7 * IN);
  for (let i = 0; i < nf; i++) { const x = X0 + W * (i + 0.5) / nf; a.cyl(x, cy, Z1 - 1.2 * IN, Z1, fr * 1.04, 28); a.circ(x, cy, fr, 'EQUIP-DETAIL'); const pts = []; for (let k = 0; k <= 24; k++) { const th = (k / 24) * TAU; pts.push([x + fr * m.cos(th), cy + fr * m.sin(th), Z1 + 0.6 * IN]); } a.tube(pts, pts.map(() => 0.25 * IN), 4); for (let r = 0.3; r < 0.95; r += 0.22) a.tube(pts.map(([px, py, pz]) => [x + (px - x) * r, cy + (py - cy) * r, pz]), pts.map(() => 0.2 * IN), 4); for (let k = 0; k < 8; k++) { const th = (k / 8) * TAU + 0.2; a.tube([[x, cy, Z1 + 0.6 * IN], [x + fr * m.cos(th), cy + fr * m.sin(th), Z1 + 0.6 * IN]], [0.2 * IN, 0.2 * IN], 4); } a.cyl(x, cy, Z1 - 0.5 * IN, Z1 + 0.6 * IN, 1.2 * IN, 10); }
  a.box(X1 - 0.01, YB - 7 * IN, Z0 + ft + 1 * IN, X1 + 0.01 * IN, YB - 1 * IN, Z0 + ft + 9 * IN); 
  a.rect(X0, YF, X1, YB); a.rect(X0 + cp * 2, YF + cp, X1 - cp * 2, YF + cp * 2, 'EQUIP-DETAIL');
  a.log(`Added the feet, corner posts, louvred coil guards on the front, ${nf} top fan${nf > 1 ? 's' : ''} with blade guard rings and spokes, the side valve cover and the pipe connections (plan and 3D).`);
}
/** a biogas digester: a cylindrical tank with a gas holder dome, ladder, mixer housing, relief and pipe */
function digester(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.dia * IN / 2, wh = H * 0.68;
  a.cyl(cx, cy, Z0, Z0 + 6 * IN, R * 1.02, 36); a.cyl(cx, cy, Z0 + 6 * IN, Z0 + wh, R, 36); for (let z = Z0 + wh * 0.2; z < Z0 + wh - 10; z += wh * 0.2) a.cyl(cx, cy, z, z + 1.2 * IN, R * 1.01, 36);
  a.cyl(cx, cy, Z0 + wh, Z0 + wh + 6 * IN, R * 1.02, 36); a.ell(cx, cy, Z0 + wh + 6 * IN, R * 0.98, R * 0.98, H - wh - 6 * IN, 32, 8);
  for (let k = 0; k < 16; k++) { const th = (k / 16) * TAU; a.tube([[cx + R * m.cos(th), cy + R * m.sin(th), Z0 + wh + 6 * IN], [cx + R * m.cos(th) * 0.9, cy + R * m.sin(th) * 0.9, Z0 + wh + 6 * IN + (H - wh - 6 * IN) * 0.43]], [0.7 * IN, 0.7 * IN], 4); }
  a.cyl(cx, cy, Z1 - 12 * IN, Z1, 5 * IN, 14); a.cyl(cx + R * 0.35, cy, Z1 - (H - wh) * 0.7, Z1 - (H - wh) * 0.7 + 8 * IN, 4 * IN, 12);
  a.tube([[cx - R * 0.5, cy, Z1 - (H - wh) * 0.82], [cx - R * 0.5, cy, Z1 - (H - wh) * 0.95]], [3 * IN, 3 * IN], 10);
  const mx = cx + R, my = cy; a.box(mx, my - 10 * IN, Z0 + wh * 0.5, mx + 18 * IN, my + 10 * IN, Z0 + wh * 0.5 + 20 * IN); a.cyl(mx + 9 * IN, my, Z0 + wh * 0.5 + 20 * IN, Z0 + wh * 0.5 + 28 * IN, 5 * IN, 14); a.box(mx - 1 * IN, my - 4 * IN, Z0 + wh * 0.5 - 4 * IN, mx + 18 * IN, my + 4 * IN, Z0 + wh * 0.5);
  const lx = cx - R * 0.5, ly = cy - R - 2 * IN; for (const s of [-1, 1]) a.tube([[lx + s * 7 * IN, ly, Z0], [lx + s * 7 * IN, ly, Z0 + wh]], [0.8 * IN, 0.8 * IN], 6); for (let z = Z0 + 8 * IN; z < Z0 + wh; z += 12 * IN) a.tube([[lx - 7 * IN, ly, z], [lx + 7 * IN, ly, z]], [0.6 * IN, 0.6 * IN], 5);
  a.box(cx + R * 0.2 - 5 * IN, cy - R - 3 * IN, Z0, cx + R * 0.2 + 5 * IN, cy - R, Z0 + 38 * IN); a.box(cx + R * 0.2 - 4 * IN, cy - R - 3.4 * IN, Z0 + 4 * IN, cx + R * 0.2 + 4 * IN, cy - R - 3 * IN, Z0 + 34 * IN);
  for (let k = 0; k < 28; k++) { const th = (k / 28) * TAU; } 
  nozz(a, 'y', cx - R * 0.8, Z0 + 20 * IN, cy + R * 0.2, cy + R + 14 * IN, 4 * IN); 
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.98, 'EQUIP-DETAIL'); a.circ(cx, cy, 5 * IN, 'EQUIP-DETAIL'); a.rect(mx, my - 10 * IN, mx + 18 * IN, my + 10 * IN, 'EQUIP-DETAIL');
  a.log('Added the base ring, the banded wall, the domed gas-holder cover held by straps, the roof gas outlet and relief, the side mixer housing, the ladder, a service door and a flanged pipe connection (plan and 3D).');
}
/** an electric vehicle charger pedestal (or a DC cabinet with a dispenser): base, body, screen, reader, holsters with cables, lamps */
function evPed(a, v) {
  const { X0, X1, YB, Z0, Z1, cx, cy, W, D, H } = a, YF = a.YF + 3.5 * IN, bs = 3 * IN, nh = v.heads;
  if (v.cab) { const cw = W * 0.55; a.box(X0, YF + 1 * IN, Z0, X0 + cw, YB, Z0 + bs); a.box(X0 + 1 * IN, YF + 2 * IN, Z0 + bs, X0 + cw - 1 * IN, YB - 1 * IN, Z1 - 3 * IN); louv(a, X0 + 4 * IN, X0 + cw - 4 * IN, YF + 2 * IN, Z0 + 30 * IN, Z1 - 20 * IN, 2 * IN, 1 * IN); a.box(X0, YF + 1 * IN, Z1 - 3 * IN, X0 + cw, YB, Z1 - 1 * IN); lever(a, X0 + cw - 5 * IN, YF + 2 * IN, Z0 + 40 * IN, 36); }
  const x0 = v.cab ? X0 + W * 0.62 : X0, x1 = X1, bw = x1 - x0;
  a.box(x0, YF + 1 * IN, Z0, x1, YB, Z0 + bs); a.box(x0 + 1 * IN, YF + 2 * IN, Z0 + bs, x1 - 1 * IN, YB - 1 * IN, Z1 - 5 * IN); prismX(a, [[YF + 1 * IN, Z1 - 5 * IN], [YB, Z1 - 5 * IN], [YB - 3 * IN, Z1 - 1 * IN], [YF + 4 * IN, Z1 - 1 * IN]], x0, x1);
  const sy = YF + 1.4 * IN; a.box(x0 + 2 * IN, sy, Z1 - 24 * IN - (v.cab ? 6 * IN : 0), x1 - 2 * IN, YF + 2 * IN, Z1 - 8 * IN); a.box(x0 + 3 * IN, sy - 0.5 * IN, Z1 - 22 * IN - (v.cab ? 6 * IN : 0), x1 - 3 * IN, sy, Z1 - 10 * IN);
  a.box(x1 - 6 * IN, YF + 0.5 * IN, Z0 + bs + 8 * IN, x1 - 2 * IN, YF + 2 * IN, Z0 + bs + 14 * IN); a.cyl(x0 + 4 * IN, YF + 1.5 * IN, Z1 - 4.5 * IN, Z1 - 4.2 * IN, 0.8 * IN, 8);
  for (let k = 0; k < nh; k++) { const hx = x0 + bw * (k + 0.5) / nh; if (nh > 1 || true) { const hz = Z0 + H * 0.42; a.box(hx - 2.5 * IN, YF - 0.4 * IN, hz - 6 * IN, hx + 2.5 * IN, YF + 2 * IN, hz + 6 * IN); a.ycyl(YF - 3 * IN, YF - 0.4 * IN, hx, hz + 1 * IN, 1.6 * IN, 10); a.cone(hx, YF - 3 * IN, hz + 1 * IN, hz + 1 * IN, 0.1, 0.1, 3); a.tube([[hx, YF - 1 * IN, hz - 6 * IN], [hx + 3 * IN, YF - 2 * IN, hz - 14 * IN], [hx - 3 * IN, YF - 2 * IN, hz - 22 * IN], [hx + 1 * IN, YF - 1 * IN, Z0 + bs + 22 * IN]], [0.7 * IN, 0.7 * IN, 0.7 * IN, 0.7 * IN], 6); } }
  a.box(x0 + 2 * IN, YF + 0.6 * IN, Z1 - 6.6 * IN, x1 - 2 * IN, YF + 1.8 * IN, Z1 - 5.6 * IN);
  a.outline('EQUIP-HIDDEN'); a.rect(x0, YF + 1 * IN, x1, YB); if (v.cab) a.rect(X0, YF + 1 * IN, X0 + W * 0.55, YB, 'EQUIP'); for (let k = 0; k < nh; k++) a.circ(x0 + bw * (k + 0.5) / nh, YF - 1 * IN, 1.6 * IN, 'EQUIP-DETAIL');
  a.log(`Added the base plate, the body with ${v.cab ? 'a separate louvred power cabinet, ' : ''}a screen and card reader, ${nh} cable holster${nh > 1 ? 's' : ''} with drooping charging cable${nh > 1 ? 's' : ''}, a status light bar and a label plate (plan and 3D).`);
}
/** a micro-hydro turbine skid: penstock inlet with valve, nozzle housing, wheel casing, generator, shaft guard, control box and tailrace */
function microHydro(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bh = 4 * IN, pr = D * 0.1;
  skidFrame(a, X0, X1, YF, YB, Z0, bh, 4, 3 * IN);
  const cw = W * 0.3, cx0 = X0 + W * 0.36, cz = Z0 + bh + 4 * IN; a.box(cx0, cy - D * 0.3, Z0 + bh, cx0 + cw, cy + D * 0.3, cz + H * 0.45); prismX(a, [[cy - D * 0.3, cz + H * 0.45], [cy + D * 0.3, cz + H * 0.45], [cy + D * 0.2, cz + H * 0.58], [cy - D * 0.2, cz + H * 0.58]], cx0, cx0 + cw);
  a.ycyl(cy - D * 0.3 - 0.8 * IN, cy - D * 0.3, cx0 + cw / 2, cz + H * 0.25, cw * 0.32, 20); a.ycyl(cy - D * 0.3 - 1.4 * IN, cy - D * 0.3 - 0.8 * IN, cx0 + cw / 2, cz + H * 0.25, cw * 0.14, 12);
  a.box(cx0 + 2 * IN, cy + D * 0.3, Z0 + bh, cx0 + cw - 2 * IN, cy + D * 0.4, Z0 + bh + 3 * IN);
  const px = X0 + 6 * IN; nozz(a, 'x', cy, cz + H * 0.3, px, px + 0.3 * IN, pr, 1.8, 18); a.xcyl(px + 0.3 * IN, X0 + W * 0.18, cy, cz + H * 0.3, pr, 16); a.cyl(X0 + W * 0.12, cy, cz + H * 0.3 + pr, cz + H * 0.3 + pr * 2.6, pr * 0.2, 8); handwheel(a, X0 + W * 0.12, cy, cz + H * 0.3 + pr * 2.7, pr * 1.1, 6, 4); a.box(X0 + W * 0.12 - pr * 0.8, cy - pr * 0.8, cz + H * 0.3 + pr * 0.6, X0 + W * 0.12 + pr * 0.8, cy + pr * 0.8, cz + H * 0.3 + pr * 1.6);
  a.cone(X0 + W * 0.18, cy, cz + H * 0.3, cz + H * 0.3 + 0.1, pr, pr * 0.4, 6); a.tube([[X0 + W * 0.18, cy, cz + H * 0.3], [cx0 - 0.5 * IN, cy, cz + H * 0.3]], [pr, pr * 0.45], 14); gauge(a, X0 + W * 0.15, cy - pr, cz + H * 0.3 + pr * 1.3, 24);
  const gr = H * 0.26, gx0 = cx0 + cw + 5 * IN; a.xcyl(cx0 + cw, X0 + W * 0.84, cy, cz + gr, 2 * IN, 10); a.box(cx0 + cw + 1 * IN, cy - gr * 0.5, cz + gr * 0.5, cx0 + cw + 5 * IN + 0, cy + gr * 0.5, cz + gr * 1.5);
  a.xcyl(gx0, X0 + W * 0.84, cy, cz + gr, gr, 20); for (let x = gx0 + 2 * IN; x < X0 + W * 0.84 - 2 * IN; x += 2.4 * IN) a.xcyl(x, x + 0.6 * IN, cy, cz + gr, gr * 1.07, 20);
  a.box(gx0 + 4 * IN, cy - gr * 0.5, cz + gr * 2, X0 + W * 0.84 - 4 * IN, cy + gr * 0.5, cz + gr * 2 + 5 * IN);
  a.box(X1 - W * 0.14, YF + 4 * IN, Z0 + bh, X1 - 3 * IN, YF + 4 * IN + D * 0.3, Z0 + bh + H * 0.7); a.box(X1 - W * 0.14 + 1 * IN, YF + 3.6 * IN, Z0 + bh + 10 * IN, X1 - 4 * IN, YF + 4 * IN, Z0 + bh + H * 0.6);
  a.outline(); a.rect(cx0, cy - D * 0.3, cx0 + cw, cy + D * 0.3, 'EQUIP-DETAIL'); a.rect(gx0, cy - gr, X0 + W * 0.84, cy + gr, 'EQUIP-DETAIL'); a.circ(X0 + W * 0.12, cy, pr * 1.1, 'EQUIP-DETAIL');
  a.log('Added the base frame, the flanged penstock inlet with gate valve and handwheel, the nozzle line to the wheel casing with its round inspection cover, the tailrace, the finned generator with its shaft coupling and the control box (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ families: renewable
const R = [
  fam({ cat: 'energy/renewable', title: 'Generic single-axis solar tracker row',
    desc: (v) => `Single-axis solar tracker row of ${v.n} modules: posts with base plates and bearings, a torque tube, framed modules tilted 28 degrees about it and a post-mounted drive with gearbox.`,
    vs: [[8, 8], [16, 16], [28, 28]].map(([n]) => [`${n} modules long`, n * 41 + 20, 100, 100, 0, { n }]),
    build: (a, v) => tracker(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic ballasted flat-roof solar array',
    desc: (v) => `Ballasted flat-roof solar array, ${v.nr} rows by ${v.nx} landscape modules tilted 12 degrees on rear legs and rails, with concrete ballast blocks on the trays and a roof pad.`,
    vs: [[2, 3], [3, 4], [4, 6]].map(([nr, nx]) => [`${nr} rows by ${nx} modules`, nx * 80 + 8, nr * 48 + 8, 20 + nr * 3, 0, { nr, nx }]),
    build: (a, v) => ballasted(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic solar street light',
    desc: (v) => `Solar street light, ${v.ft} ft pole: base plate with anchor nuts, tapered pole, battery box with a door, a swept arm carrying an LED head and a tilted solar panel on its bracket.`,
    vs: [[10, 36], [16, 48], [24, 60]].map(([ft, arm]) => [`${ft} ft pole`, 44, 28 + arm, ft * 12, 0, { ft, arm: arm * 0.5 }]),
    build: (a, v) => solarLamp(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic thermosiphon solar water heater',
    desc: (v) => `Thermosiphon solar water heater with ${v.n} flat collector${v.n > 1 ? 's' : ''} tilted 35 degrees on a stand, riser tubes under glass, a horizontal storage tank on top with dished ends, connecting pipes and a relief valve.`,
    vs: [[1, 44], [2, 88], [3, 132]].map(([n, w]) => [`${n} collector${n > 1 ? 's' : ''}`, w, 84, 82, 0, { n }]),
    build: (a, v) => solarHeater(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic solar inverter station skid',
    desc: 'Solar inverter station on a skid: an enclosure with a double door, handles and roof louvres, a finned transformer with three bushings, a medium-voltage cabinet and entry steps.',
    vs: [['1 MVA class, 18 ft', 216, 108, 108], ['2.5 MVA class, 24 ft', 288, 108, 114], ['4 MVA class, 30 ft', 360, 120, 120]],
    build: (a, v) => invStation(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic solar DC recombiner cabinet',
    desc: (v) => `Pole-mounted DC recombiner cabinet on two posts with foot plates: ${v.cond > 6 ? 'two doors' : 'a door'} with hinges, latch and a padlock hasp, a sloping sun shade and ${v.cond} conduit stubs.`,
    vs: [[4, 24, 10, 52], [6, 36, 12, 56], [8, 54, 14, 60]].map(([c, w, d, h]) => [`${c} circuits, ${w} in`, w, d, h, 0, { cond: c }]),
    build: (a, v) => recombiner(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic open battery rack',
    desc: (v) => `Open battery rack with ${v.trays} battery trays on shelf rails: handles, lamps and terminals on each tray, two bus bars at the back, feet and a controller panel with display on top.`,
    vs: [[4, 40], [8, 66], [12, 92]].map(([n, h]) => [`${n} trays, ${h} in`, 24, 34, h, 0, { trays: n }]),
    build: (a, v) => battRack(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic electrolyser skid',
    desc: 'Hydrogen electrolyser skid: a stack cabinet with three louvred doors and a roof chiller with two fans, two vertical gas-liquid separators, a dryer column, an elevated gas pipe run with a flanged outlet and a control box.',
    vs: [['small, 20 ft', 240, 90, 120], ['medium, 30 ft', 360, 96, 132], ['large, 40 ft', 480, 108, 144]],
    build: (a, v) => electrolyser(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic air-source heat pump outdoor unit',
    desc: (v) => `Outdoor heat pump unit with ${v.fans} top fan${v.fans > 1 ? 's' : ''} of ${v.fr} in: louvred coil guards, corner posts, feet, blade guard rings and spokes, a valve cover and pipe connections.`,
    vs: [[1, 18, 36, 16, 30, '1.5 ton'], [1, 24, 40, 18, 36, '3 ton'], [2, 24, 74, 34, 42, '8 ton'], [3, 28, 112, 40, 50, '15 ton']].map(([f, fr, w, d, h, t]) => [`${t}, ${f} fan${f > 1 ? 's' : ''}`, w, d, h, 0, { fans: f, fr }]),
    build: (a, v) => heatPump(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic biogas digester tank',
    desc: (v) => `Biogas digester of ${v.dia / 12} ft diameter: base ring, banded wall, a domed gas-holder cover held by straps, roof gas outlet and relief, a side mixer housing, a ladder, a service door and a flanged pipe.`,
    vs: [[240, 20], [420, 35], [720, 60]].map(([d, ft]) => [`${ft} ft diameter`, d + 70, d + 70, d * 0.55 + 66, 0, { dia: d }]),
    build: (a, v) => digester(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic electric vehicle charger pedestal',
    desc: (v) => `Electric vehicle charger with ${v.heads} cable holster${v.heads > 1 ? 's' : ''} and drooping cable${v.heads > 1 ? 's' : ''}: a body with a screen and card reader, a status light bar and a label plate${v.cab ? ', next to a separate louvred power cabinet' : ''}.`,
    vs: [['single connector, 7 kW', 14, 11, 52, 0, { heads: 1 }], ['dual connector, 22 kW', 24, 12, 56, 0, { heads: 2 }], ['fast charger, 60 kW', 30, 22, 78, 0, { heads: 1 }], ['fast charger with power cabinet, 150 kW', 96, 28, 84, 0, { heads: 2, cab: true }]].map(([l, w, d, h, z, p]) => [l, w, d, h, z, p]),
    build: (a, v) => evPed(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic micro-hydro turbine skid',
    desc: 'Micro-hydro turbine skid: a flanged penstock inlet with gate valve and handwheel, a nozzle line to a wheel casing with a round inspection cover, a tailrace, a finned generator with a shaft coupling and a control box.',
    vs: [['1 kW class', 48, 30, 30], ['10 kW class', 96, 48, 42], ['50 kW class', 144, 62, 58]],
    build: (a, v) => microHydro(a, v) }),
];

// ================================================================================== distribution
/** an insulator string hanging from (x,y,z) down by len: discs and an end clamp */
function istring(a, x, y, z, len, r) { const n = 9; for (let k = 0; k < n; k++) a.cone(x, y, z - len * k / n, z - len * (k + 0.75) / n, r, r * 0.9, 10); a.cyl(x, y, z - len - r * 1.4, z, r * 0.32, 6); a.box(x - r * 0.8, y - r * 0.5, z - len - r * 2.6, x + r * 0.8, y + r * 0.5, z - len - r * 1.2); }
/** a tapered tubular steel monopole with a base plate, tiers of braced crossarms with insulator strings */
function monopole(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, rb = v.rb * IN / 2, rt = rb * 0.42, tt = 3 * IN, zt = Z1 - 36 * IN;
  a.cyl(cx, cy, Z0, Z0 + 2 * IN, rb * 1.9, 24); for (let k = 0; k < 12; k++) { const th = (k / 12) * TAU; a.cyl(cx + rb * 1.55 * m.cos(th), cy + rb * 1.55 * m.sin(th), Z0 + 2 * IN, Z0 + 6 * IN, 1 * IN, 6); } a.cyl(cx, cy, Z0 + 2 * IN, Z0 + 24 * IN, rb * 1.25, 24);
  const pts = [], rds = []; for (let k = 0; k <= 8; k++) { const f = k / 8; pts.push([cx, cy, Z0 + 24 * IN + (zt - Z0 - 24 * IN) * f]); rds.push(rb * 1.15 + (rt - rb * 1.15) * f); } a.tube(pts, rds, 20);
  for (const f of [0.4, 0.7]) { const z = Z0 + (zt - Z0) * f; a.cyl(cx, cy, z - 1 * IN, z + 1 * IN, rb * 1.15 + (rt - rb * 1.15) * f + 0.8 * IN, 20); }
  a.box(cx - 8 * IN, cy - rb - 3 * IN, Z0 + 24 * IN, cx + 8 * IN, cy - rb * 1.1, Z0 + 56 * IN);
  const arms = v.tiers, span = W * 0.46;
  for (let i = 0; i < arms; i++) { const za = zt - i * (zt - Z0) * 0.14 - 6 * IN, ext = span * (1 - 0.2 * i);
    for (const s of [-1, 1]) { a.tube([[cx + s * rt * 1.1, cy, za + 2 * IN], [cx + s * ext, cy, za + 3 * IN]], [tt * 0.9, tt * 0.5], 10); a.tube([[cx + s * rt * 1.1, cy, za - 18 * IN], [cx + s * ext * 0.95, cy, za + 1 * IN]], [tt * 0.5, tt * 0.4], 6); istring(a, cx + s * ext, cy, za, v.sl * IN, 2.2 * IN); a.rect(cx + s * rt, cy - 1.5 * IN, cx + s * ext, cy + 1.5 * IN, 'EQUIP-DETAIL'); } }
  a.tube([[cx, cy, zt], [cx, cy, Z1 - 4 * IN]], [rt, rt * 0.6], 12); a.cone(cx, cy, Z1 - 4 * IN, Z1, rt * 0.6, 0.3 * IN, 10);
  a.circ(cx, cy, rb * 1.9); a.circ(cx, cy, rb * 1.15, 'EQUIP-DETAIL'); a.circ(cx, cy, rb * 1.55, 'EQUIP-HIDDEN');
  a.log(`Added the base plate with twelve anchor bolts, the tapered tubular pole with slip-joint bands, the pole-top peak, ${arms} tier${arms > 1 ? 's' : ''} of braced crossarms with insulator strings and a step plate (plan and 3D).`);
}
/** an H-frame structure: two wood poles, a crossarm and X braces, insulator strings, ground wire */
function hframe(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pr = 7 * IN, px = W * 0.32, zA = Z1 - 24 * IN;
  for (const s of [-1, 1]) { a.tube([[cx + s * px, cy, Z0], [cx + s * px, cy, Z0 + H * 0.5], [cx + s * px, cy, Z1 - 6 * IN]], [pr, pr * 0.82, 5.4 * IN], 14); a.cone(cx + s * px, cy, Z1 - 6 * IN, Z1, 5.4 * IN, 1 * IN, 14); a.circ(cx + s * px, cy, pr); a.cyl(cx + s * px, cy, Z0, Z0 + 4 * IN, pr * 1.3, 14); }
  a.box(cx - px - 8 * IN, cy - 2.5 * IN, zA - 4 * IN, cx + px + 8 * IN, cy + 2.5 * IN, zA + 4 * IN); a.box(cx - px - 8 * IN, cy - 3 * IN, zA - 0.5 * IN, cx + px + 8 * IN, cy + 3 * IN, zA + 0.5 * IN);
  const zb = Z0 + H * 0.45; for (const z of [zb, Z0 + H * 0.62]) a.box(cx - px, cy - 2.5 * IN, z - 3 * IN, cx + px, cy + 2.5 * IN, z + 3 * IN);
  a.tube([[cx - px, cy - 3 * IN, zb], [cx + px, cy - 3 * IN, Z0 + H * 0.62]], [1.2 * IN, 1.2 * IN], 6); a.tube([[cx + px, cy - 3 * IN, zb], [cx - px, cy - 3 * IN, Z0 + H * 0.62]], [1.2 * IN, 1.2 * IN], 6);
  for (const s of [-1, 1]) { a.tube([[cx + s * px, cy - 3 * IN, zA - 4 * IN], [cx + s * (px - 24 * IN), cy - 3 * IN, zA - 24 * IN]], [1.2 * IN, 1.2 * IN], 6); }
  for (const x of [cx - px - 6 * IN, cx, cx + px + 6 * IN]) istring(a, x, cy, zA - 4 * IN, v.sl * IN, 2.4 * IN);
  a.tube([[cx - px, cy + pr, Z1 - 10 * IN], [cx - px, cy + pr, Z0 + 6 * IN]], [0.5 * IN, 0.5 * IN], 5); a.tube([[cx + px, cy + pr, Z1 - 10 * IN], [cx + px, cy + pr, Z0 + 6 * IN]], [0.5 * IN, 0.5 * IN], 5);
  a.rect(cx - px - 8 * IN, cy - 2.5 * IN, cx + px + 8 * IN, cy + 2.5 * IN, 'EQUIP-DETAIL');
  a.log('Added the two tapered poles with butt plates and ground wires, the crossarm with braces, the lower X-braced cross members, the knee braces and three insulator strings (plan and 3D).');
}
/** a precast cable vault: box with a lid slab, two manhole necks with frames and covers, duct stubs and a ladder */
function vault(a, v) {
  const { Z0, Z1, cx, cy, H } = a, X0 = a.X0 + 6 * IN, X1 = a.X1 - 6 * IN, YF = a.YF + 1 * IN, YB = a.YB - 1 * IN, W = X1 - X0, D = YB - YF, th = 5 * IN, lid = 6 * IN;
  a.box(X0, YF, Z0, X1, YB, Z0 + 5 * IN); a.box(X0, YF, Z0 + 5 * IN, X0 + th, YB, Z1 - lid - 12 * IN); a.box(X1 - th, YF, Z0 + 5 * IN, X1, YB, Z1 - lid - 12 * IN); a.box(X0 + th, YF, Z0 + 5 * IN, X1 - th, YF + th, Z1 - lid - 12 * IN); a.box(X0 + th, YB - th, Z0 + 5 * IN, X1 - th, YB, Z1 - lid - 12 * IN);
  a.box(X0 - 1 * IN, YF - 1 * IN, Z1 - lid - 12 * IN, X1 + 1 * IN, YB + 1 * IN, Z1 - 12 * IN);
  const nk = 2, nr = 15 * IN; for (let i = 0; i < nk; i++) { const x = X0 + W * (i + 0.5) / nk; a.cyl(x, cy, Z1 - 12 * IN, Z1 - 4 * IN, nr + 3 * IN, 24); a.cyl(x, cy, Z1 - 4 * IN, Z1 - 1.2 * IN, nr + 4 * IN, 24); a.cyl(x, cy, Z1 - 1.8 * IN, Z1, nr, 24); for (let k = 0; k < 8; k++) { const th2 = (k / 8) * TAU; a.cyl(x + nr * 0.75 * m.cos(th2), cy + nr * 0.75 * m.sin(th2), Z1 - 0.2 * IN, Z1 + 0, 1 * IN, 6); } a.circ(x, cy, nr + 4 * IN); a.circ(x, cy, nr, 'EQUIP-DETAIL'); a.circ(x, cy, nr * 0.35, 'EQUIP-DETAIL'); }
  for (let k = 0; k < 6; k++) { const y = YF + D * (0.2 + 0.12 * (k % 3)); const z = Z0 + 18 * IN + (k > 2 ? 12 * IN : 0); a.xcyl(X0 - 5.5 * IN, X0, y, z, 2.4 * IN, 12); a.xcyl(X1, X1 + 5.5 * IN, y, z, 2.4 * IN, 12); }
  a.box(X0 + W * 0.45, YF - 1 * IN, Z1 - 16 * IN, X0 + W * 0.55, YF, Z1 - 12 * IN);
  a.rect(X0 - 1 * IN, YF - 1 * IN, X1 + 1 * IN, YB + 1 * IN); a.rect(X0, YF, X1, YB, 'EQUIP-HIDDEN');
  a.log('Added the base slab and four walls, the lid slab with two manhole necks, cast frames and bolted covers, six cable duct stubs each end and the lifting insert (plan and 3D).');
}
/** a dry-type transformer: base on wheels, laminated core, three cast coils, terminals, and a perforated cage */
function dryXfmr(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bh = 6 * IN, cr = D * 0.2, cz0 = Z0 + bh + 3 * IN, ch = H * 0.5;
  a.box(X0, YF, Z0 + 4 * IN, X1, YB, Z0 + bh); for (const sx of [-1, 1]) for (const sy of [-1, 1]) { a.ycyl(cy + sy * D * 0.4 - 1.5 * IN, cy + sy * D * 0.4 + 1.5 * IN, cx + sx * W * 0.38, Z0 + 2 * IN, 2 * IN, 12); }
  a.box(X0 + 4 * IN, cy - D * 0.3, Z0 + bh, X1 - 4 * IN, cy + D * 0.3, Z0 + bh + 3 * IN); a.box(X0 + 4 * IN, cy - D * 0.28, cz0 + ch, X1 - 4 * IN, cy + D * 0.28, cz0 + ch + 3 * IN);
  for (let i = 0; i < 3; i++) { const x = cx + (i - 1) * W * 0.27; a.box(x - 2.5 * IN, cy - D * 0.2, cz0, x + 2.5 * IN, cy + D * 0.2, cz0 + ch); a.cyl(x, cy, cz0, cz0 + ch, cr, 24); a.cyl(x, cy, cz0 + ch * 0.05, cz0 + ch * 0.95, cr * 0.8, 20); for (const z of [cz0 + ch * 0.2, cz0 + ch * 0.5, cz0 + ch * 0.8]) a.cyl(x, cy, z, z + 0.5 * IN, cr * 1.03, 24); a.cyl(x, cy + cr * 0.5, cz0 + ch, cz0 + ch + 7 * IN, 0.9 * IN, 8); a.box(x - 1.5 * IN, cy + cr * 0.2, cz0 + ch + 7 * IN, x + 1.5 * IN, cy + cr * 0.9, cz0 + ch + 8 * IN); a.circ(x, cy, cr, 'EQUIP-DETAIL'); a.box(x - 1.5 * IN, YF + D * 0.12, cz0 + 4 * IN, x + 1.5 * IN, YF + D * 0.12 + 1 * IN, cz0 + 14 * IN); }
  const t = 0.8 * IN; a.frame(X0 + 1 * IN, Z0 + bh, X1 - 1 * IN, Z1 - 3 * IN, YF + 0.5 * IN, YF + 0.5 * IN + t, 2 * IN); a.frame(X0 + 1 * IN, Z0 + bh, X1 - 1 * IN, Z1 - 3 * IN, YB - 0.5 * IN - t, YB - 0.5 * IN, 2 * IN);
  for (let x = X0 + 4 * IN; x < X1 - 3 * IN; x += 2.8 * IN) { a.box(x, YF + 0.5 * IN, Z0 + bh + 3 * IN, x + 0.6 * IN, YF + 0.5 * IN + t, Z1 - 5 * IN); }
  for (const x of [X0 + 5 * IN, X1 - 5 * IN]) { a.tube([[x, cy, Z1 - 3 * IN], [x, cy, Z1 + 0]], [1.6 * IN, 1.2 * IN], 8); a.cyl(x, cy, Z1 - 3 * IN, Z1 - 0.5 * IN, 2 * IN, 8); }
  a.box(X0 + 1 * IN, YF + 0.5 * IN, Z1 - 3 * IN, X1 - 1 * IN, YB - 0.5 * IN, Z1);
  a.outline(); a.rect(X0 + 1 * IN, YF + 0.5 * IN, X1 - 1 * IN, YB - 0.5 * IN, 'EQUIP-DETAIL');
  a.log('Added the wheeled base, the laminated core with its yokes, three cast-resin coils with taps and terminals, the slatted safety cage front and back and the roof lifting eyes (plan and 3D).');
}
/** a low-voltage switchboard lineup: sections with doors, vertical handle bars, meters, pilot lights, a plinth and lifting lugs */
function lvBoard(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.sec, sw = (W - 2 * IN) / n, bh = 4 * IN;
  a.box(X0, YF, Z0, X1, YB, Z0 + bh); a.box(X0 + 1 * IN, YF + 1 * IN, Z0 + bh, X1 - 1 * IN, YB, Z1 - 1.5 * IN); a.box(X0 + 1 * IN, YF + 1 * IN, Z1 - 1.5 * IN, X1 - 1 * IN, YB, Z1);
  for (let i = 0; i < n; i++) { const x0 = X0 + 1 * IN + i * sw, x1 = x0 + sw; a.box(x0 + 0.6 * IN, YF + 0.2 * IN, Z0 + bh + 1 * IN, x1 - 0.6 * IN, YF + 1.1 * IN, Z1 - 3 * IN); a.frame(x0 + 1.2 * IN, Z0 + bh + 4 * IN, x1 - 1.2 * IN, Z1 - 6 * IN, YF - 0.3 * IN, YF + 0.3 * IN, 0.6 * IN);
    const k = i % 3; if (k === 0) { a.ycyl(YF - 0.8 * IN, YF + 0.2 * IN, x0 + sw * 0.5, Z1 - 12 * IN, 2 * IN, 14); a.ycyl(YF - 0.9 * IN, YF - 0.8 * IN, x0 + sw * 0.5, Z1 - 12 * IN, 1.5 * IN, 14); for (let j = 0; j < 3; j++) a.ycyl(YF - 0.9 * IN, YF + 0.2 * IN, x0 + sw * (0.25 + 0.25 * j), Z1 - 20 * IN, 0.5 * IN, 8); }
    else for (let j = 0; j < 4; j++) { a.box(x0 + sw * 0.15, YF - 0.8 * IN, Z1 - 12 * IN - j * 11 * IN - 0, x0 + sw * 0.85, YF + 0.2 * IN, Z1 - 12 * IN - j * 11 * IN + 8 * IN); a.box(x0 + sw * 0.4, YF - 1.4 * IN, Z1 - 12 * IN - j * 11 * IN + 3 * IN, x0 + sw * 0.6, YF - 0.8 * IN, Z1 - 12 * IN - j * 11 * IN + 5 * IN); }
    a.box(x1 - 4 * IN, YF - 1 * IN, Z0 + 38 * IN, x1 - 3 * IN, YF + 0.3 * IN, Z0 + 62 * IN); a.box(x1 - 4.6 * IN, YF - 2 * IN, Z0 + 48 * IN, x1 - 2.4 * IN, YF - 1 * IN, Z0 + 52 * IN);
    if (i) a.line(x0, YF, x0, YF + 1 * IN, 'EQUIP-DETAIL'); a.box(x0 + sw * 0.2, YF + 0.5 * IN, Z1 - 1.5 * IN, x0 + sw * 0.2 + 2 * IN, YF + 0.5 * IN + 2 * IN, Z1 + 0); }
  a.outline(); a.rect(X0 + 1 * IN, YF + 1 * IN, X1 - 1 * IN, YB, 'EQUIP-DETAIL'); a.clear('Working clearance, front', X0, YF - 36 * IN, X1, YF, 80);
  a.log(`Added the plinth, ${n} sections with hinged doors, vertical handle bars, door-mounted dials and pilot lights or breaker handles, the lifting lugs and the roof cap (plan and 3D).`);
}
/** a compact ring main unit: plinth, panels with mimic plates, switch windows, handle sockets, cable-cover doors with bolts */
function rmu(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.ways, pl = 4 * IN, pw = (W - 2 * IN) / n;
  a.box(X0, YF, Z0, X1, YB, Z0 + pl); a.box(X0 + 1 * IN, YF + 1 * IN, Z0 + pl, X1 - 1 * IN, YB - 1 * IN, Z1 - 3 * IN); prismX(a, [[YF + 1 * IN, Z1 - 3 * IN], [YB - 1 * IN, Z1 - 3 * IN], [YB - 4 * IN, Z1], [YF + 5 * IN, Z1]], X0 + 1 * IN, X1 - 1 * IN);
  for (let i = 0; i < n; i++) { const x0 = X0 + 1 * IN + i * pw, x1 = x0 + pw, mz = Z0 + pl + (H - pl) * 0.62;
    a.box(x0 + 0.8 * IN, YF + 0.3 * IN, mz - 9 * IN, x1 - 0.8 * IN, YF + 1.2 * IN, Z1 - 5 * IN); a.box(x0 + 3 * IN, YF - 0.2 * IN, mz + 4 * IN, x1 - 3 * IN, YF + 0.3 * IN, mz + 12 * IN); a.box(x0 + 3.4 * IN, YF - 0.5 * IN, mz + 5 * IN, x1 - 3.4 * IN, YF - 0.2 * IN, mz + 11 * IN);
    a.ycyl(YF - 1.6 * IN, YF + 0.3 * IN, x0 + pw * 0.3, mz - 3 * IN, 0.9 * IN, 10); a.ycyl(YF - 1.6 * IN, YF + 0.3 * IN, x0 + pw * 0.7, mz - 3 * IN, 0.9 * IN, 10); a.box(x0 + pw * 0.25, YF - 0.4 * IN, mz - 7 * IN, x0 + pw * 0.75, YF + 0.3 * IN, mz - 5.5 * IN);
    a.box(x0 + 0.8 * IN, YF + 0.1 * IN, Z0 + pl + 2 * IN, x1 - 0.8 * IN, YF + 1.2 * IN, mz - 12 * IN); for (const [fx, fz] of [[0.12, 0.2], [0.88, 0.2], [0.12, 0.8], [0.88, 0.8]]) a.ycyl(YF - 0.5 * IN, YF + 0.1 * IN, x0 + pw * fx, Z0 + pl + 2 * IN + (mz - 12 * IN - Z0 - pl - 2 * IN) * fz, 0.4 * IN, 6);
    a.rect(x0 + 0.8 * IN, YF + 0.3 * IN, x1 - 0.8 * IN, YF + 1.2 * IN, 'EQUIP-DETAIL'); a.box(x0 + pw * 0.4, YF - 0.3 * IN, Z1 - 4.4 * IN, x0 + pw * 0.6, YF + 0.3 * IN, Z1 - 3.8 * IN); }
  a.outline(); a.rect(X0 + 1 * IN, YF + 1 * IN, X1 - 1 * IN, YB - 1 * IN, 'EQUIP-DETAIL');
  a.log(`Added the plinth, the ${n}-panel steel tank with sloped top, a switch-position window and mimic plate on each panel, two handle sockets with the interlock bar, the cable-compartment covers with bolts and the nameplates (plan and 3D).`);
}
/** a substation gantry: two lattice columns, a lattice beam, tension insulator strings, earth-wire peaks */
function gantry(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cw = D * 0.8, bz = Z1 - 50 * IN, t = 2.4 * IN, np = 8;
  const col = (x) => { for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.tube([[x + sx * cw / 2, cy + sy * cw / 2, Z0], [x + sx * cw * 0.36, cy + sy * cw * 0.36, bz]], [t, t * 0.8], 6);
    for (let k = 0; k < np; k++) { const f0 = k / np, f1 = (k + 1) / np, w0 = cw / 2 - (cw / 2 - cw * 0.36) * f0, w1 = cw / 2 - (cw / 2 - cw * 0.36) * f1, z0 = Z0 + (bz - Z0) * f0, z1 = Z0 + (bz - Z0) * f1;
      a.tube([[x - w0, cy - w0, z0], [x + w1, cy - w1, z1]], [t * 0.5, t * 0.5], 4); a.tube([[x + w0, cy - w0, z0], [x - w1, cy - w1, z1]], [t * 0.5, t * 0.5], 4); a.tube([[x - w0, cy + w0, z0], [x + w1, cy + w1, z1]], [t * 0.5, t * 0.5], 4); a.tube([[x - w0, cy - w0, z0], [x - w1, cy + w1, z1]], [t * 0.5, t * 0.5], 4); a.tube([[x + w0, cy - w0, z0], [x + w1, cy + w1, z1]], [t * 0.5, t * 0.5], 4);
      a.tube([[x - w1, cy - w1, z1], [x + w1, cy - w1, z1]], [t * 0.4, t * 0.4], 4); a.tube([[x - w1, cy - w1, z1], [x - w1, cy + w1, z1]], [t * 0.4, t * 0.4], 4); a.tube([[x + w1, cy - w1, z1], [x + w1, cy + w1, z1]], [t * 0.4, t * 0.4], 4); }
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(x + sx * cw / 2 - 5 * IN, cy + sy * cw / 2 - 5 * IN, Z0, x + sx * cw / 2 + 5 * IN, cy + sy * cw / 2 + 5 * IN, Z0 + 2 * IN); a.rect(x - cw / 2, cy - cw / 2, x + cw / 2, cy + cw / 2); a.line(x - cw / 2, cy - cw / 2, x + cw / 2, cy + cw / 2, 'EQUIP-DETAIL'); a.line(x - cw / 2, cy + cw / 2, x + cw / 2, cy - cw / 2, 'EQUIP-DETAIL'); };
  const xl = X0 + cw / 2 + 2 * IN, xr = X1 - cw / 2 - 2 * IN; col(xl); col(xr);
  const bw = cw * 0.72, nb = 10; for (const [y, z] of [[cy - bw / 2, bz + 6 * IN], [cy + bw / 2, bz + 6 * IN], [cy, bz + 38 * IN]]) a.tube([[xl - cw * 0.36, y, z], [xr + cw * 0.36, y, z]], [t * 0.9, t * 0.9], 6);
  for (let k = 0; k < nb; k++) { const x0 = xl - cw * 0.36 + (xr - xl + cw * 0.72) * k / nb, x1 = xl - cw * 0.36 + (xr - xl + cw * 0.72) * (k + 1) / nb; a.tube([[x0, cy - bw / 2, bz + 6 * IN], [x1, cy, bz + 38 * IN]], [t * 0.4, t * 0.4], 4); a.tube([[x0, cy + bw / 2, bz + 6 * IN], [x1, cy, bz + 38 * IN]], [t * 0.4, t * 0.4], 4); a.tube([[x0, cy - bw / 2, bz + 6 * IN], [x0, cy + bw / 2, bz + 6 * IN]], [t * 0.4, t * 0.4], 4); }
  for (let i = 0; i < 3; i++) { const x = cx + (i - 1) * (xr - xl) * 0.3; istring(a, x, cy, bz + 6 * IN, 44 * IN, 3 * IN); a.cyl(x, cy, bz + 5 * IN, bz + 7 * IN, 4 * IN, 8); }
  a.tube([[xl, cy, bz + 38 * IN], [xl, cy, Z1]], [t * 0.5, t * 0.3], 6); a.tube([[xr, cy, bz + 38 * IN], [xr, cy, Z1]], [t * 0.5, t * 0.3], 6);
  a.log(`Added two lattice columns with base plates and panel bracing, the lattice beam, three tension insulator strings with end clamps and the earth-wire peaks (plan and 3D).`);
}
/** an outdoor live-tank circuit breaker: frame, three post insulators with horizontal interrupter chambers, a mechanism cabinet */
function liveBreaker(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, fh = H * 0.28, ir = H * 0.07;
  for (const x of [X0 + 6 * IN, X1 - 6 * IN]) for (const y of [YF + 8 * IN, YB - 6 * IN]) { a.box(x - 4 * IN, y - 4 * IN, Z0, x + 4 * IN, y + 4 * IN, Z0 + 2 * IN); a.tube([[x, y, Z0 + 2 * IN], [x, y, Z0 + fh]], [2 * IN, 2 * IN], 8); }
  a.box(X0 + 2 * IN, YF + 4 * IN, Z0 + fh, X1 - 2 * IN, YB - 2 * IN, Z0 + fh + 4 * IN);
  for (let i = 0; i < 3; i++) { const x = cx + (i - 1) * (W - 24 * IN) / 2, z0 = Z0 + fh + 4 * IN; a.box(x - 5 * IN, cy - 5 * IN, z0, x + 5 * IN, cy + 5 * IN, z0 + 3 * IN); bushing(a, x, cy, z0 + 3 * IN, (H - fh - 4 * IN - 8 * IN) * 0.74, 2.6 * IN, 9);
    const cz = z0 + 3 * IN + (H - fh - 4 * IN - 8 * IN) * 0.74 + ir * 1.3; a.ycyl(cy - D * 0.36, cy + D * 0.36, x, cz, ir, 16); for (let k = 0; k < 6; k++) { const y = cy - D * 0.3 + k * D * 0.12; a.ycyl(y, y + 1.2 * IN, x, cz, ir * 1.35, 16); } a.ycyl(cy - D * 0.36 - 3 * IN, cy - D * 0.36, x, cz, ir * 0.8, 10); a.ycyl(cy + D * 0.36, cy + D * 0.36 + 3 * IN, x, cz, ir * 0.8, 10); a.box(x - 1 * IN, cy - D * 0.36 - 7 * IN, cz - 2 * IN, x + 1 * IN, cy - D * 0.36 - 3 * IN, cz + 2 * IN); a.box(x - 1 * IN, cy + D * 0.36 + 3 * IN, cz - 2 * IN, x + 1 * IN, cy + D * 0.36 + 7 * IN, cz + 2 * IN); a.circ(x, cy, 4 * IN, 'EQUIP-DETAIL'); }
  a.box(X0 + 3 * IN, YF + 5 * IN, Z0 + fh + 4 * IN, X0 + 20 * IN, YF + 16 * IN, Z0 + fh + 4 * IN + 26 * IN); a.frame(X0 + 4 * IN, Z0 + fh + 4 * IN + 3 * IN, X0 + 19 * IN, Z0 + fh + 4 * IN + 24 * IN, YF + 4 * IN, YF + 5.2 * IN, 1 * IN); lever(a, X0 + 17 * IN, YF + 4 * IN, Z0 + fh + 4 * IN + 14 * IN, 30);
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + 2 * IN, YF + 4 * IN, X1 - 2 * IN, YB - 2 * IN, 'EQUIP-DETAIL'); a.rect(X0 + 3 * IN, YF + 5 * IN, X0 + 20 * IN, YF + 16 * IN, 'EQUIP');
  a.log('Added the four-legged frame, three porcelain post insulators with sheds each carrying a horizontal interrupter chamber with grading rings and terminal pads, and the mechanism cabinet with door and handle (plan and 3D).');
}
/** a set of three surge arresters on a steel stand with grading rings and ground straps */
function arresters(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, sh = H * 0.3;
  for (const x of [X0 + 6 * IN, X1 - 6 * IN]) { a.tube([[x, cy - D * 0.3, Z0], [x, cy - D * 0.3, Z0 + sh]], [1.5 * IN, 1.5 * IN], 8); a.tube([[x, cy + D * 0.3, Z0], [x, cy + D * 0.3, Z0 + sh]], [1.5 * IN, 1.5 * IN], 8); a.tube([[x, cy - D * 0.3, Z0 + sh * 0.3], [x, cy + D * 0.3, Z0 + sh * 0.9]], [0.8 * IN, 0.8 * IN], 5); a.box(x - 4 * IN, cy - D * 0.3 - 4 * IN, Z0, x + 4 * IN, cy - D * 0.3 + 4 * IN, Z0 + 0.8 * IN); a.box(x - 4 * IN, cy + D * 0.3 - 4 * IN, Z0, x + 4 * IN, cy + D * 0.3 + 4 * IN, Z0 + 0.8 * IN); }
  a.box(X0 + 2 * IN, cy - D * 0.36, Z0 + sh, X1 - 2 * IN, cy - D * 0.24, Z0 + sh + 3 * IN); a.box(X0 + 2 * IN, cy + D * 0.24, Z0 + sh, X1 - 2 * IN, cy + D * 0.36, Z0 + sh + 3 * IN);
  for (let i = 0; i < 3; i++) { const x = cx + (i - 1) * (W - 20 * IN) / 2, z0 = Z0 + sh + 3 * IN, hh = H - sh - 3 * IN - 10 * IN; a.box(x - 4 * IN, cy - 4 * IN, z0, x + 4 * IN, cy + 4 * IN, z0 + 2 * IN); bushing(a, x, cy, z0 + 2 * IN, hh, 2.2 * IN, 14); const gz = z0 + 2 * IN + hh * 0.95; const pts = []; for (let k = 0; k <= 16; k++) { const th = (k / 16) * TAU; pts.push([x + 6.5 * IN * m.cos(th), cy + 6.5 * IN * m.sin(th), gz]); } a.tube(pts, pts.map(() => 0.7 * IN), 5); for (const s of [-1, 1]) a.tube([[x + s * 6.5 * IN, cy, gz], [x + s * 2.2 * IN, cy, gz - 2 * IN]], [0.5 * IN, 0.5 * IN], 4); a.box(x - 2.5 * IN, cy - 2.5 * IN, Z1 - 3 * IN, x + 2.5 * IN, cy + 2.5 * IN, Z1 - 0.5 * IN); a.circ(x, cy, 6.5 * IN, 'EQUIP-DETAIL');
    a.box(x - 1 * IN, cy - D * 0.3, z0 - 1 * IN, x + 1 * IN, cy + D * 0.3, z0); a.box(x - 1.6 * IN, YF + D * 0.08, Z0 + sh + 12 * IN, x + 1.6 * IN, YF + D * 0.08 + 1.2 * IN, Z0 + sh + 18 * IN); }
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + 2 * IN, cy - D * 0.36, X1 - 2 * IN, cy - D * 0.24, 'EQUIP-DETAIL'); a.rect(X0 + 2 * IN, cy + D * 0.24, X1 - 2 * IN, cy + D * 0.36, 'EQUIP-DETAIL');
  a.log('Added the four-legged steel stand with braces and base plates, three arresters with sheds, grading rings and line terminals, a ground strap each and a surge counter plate (plan and 3D).');
}
/** a shunt capacitor bank: a frame with three phase groups of rectangular capacitor cans with two bushings each, fuses and bus tubes */
function capBank(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.units, ig = 12 * IN, fz = Z0 + 14 * IN, rh = (H - 22 * IN) / 2;
  for (const x of [X0 + 4 * IN, X1 - 4 * IN]) for (const y of [YF + 4 * IN, YB - 4 * IN]) { a.tube([[x, y, Z0 + 2 * IN], [x, y, Z0 + 12 * IN]], [3 * IN, 3 * IN], 10); a.cone(x, y, Z0 + 2 * IN, Z0 + 6 * IN, 4 * IN, 3 * IN, 10); a.tube([[x, y, Z0 + 12 * IN], [x, y, Z1 - 3 * IN]], [1.6 * IN, 1.6 * IN], 8); a.box(x - 4 * IN, y - 4 * IN, Z0, x + 4 * IN, y + 4 * IN, Z0 + 2 * IN); }
  const rows = 2, cw = (W - 12 * IN) / n;
  for (let r = 0; r <= rows; r++) { const z = fz + r * rh; a.box(X0 + 3 * IN, YF + 3 * IN, z - 1.5 * IN, X1 - 3 * IN, YB - 3 * IN, z + 1.5 * IN); }
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) for (const side of [0, 1]) { const x0 = X0 + 6 * IN + i * cw + 0.8 * IN, x1 = x0 + cw - 1.6 * IN, y0 = side ? cy + 1 * IN : YF + 5 * IN, y1 = side ? YB - 5 * IN : cy - 1 * IN, z0 = fz + r * rh + 1.5 * IN, z1 = z0 + rh - 3.5 * IN; a.box(x0, y0, z0, x1, y1, z1); a.box(x0 + (x1 - x0) * 0.1, y0 - 0.0, z0 + (z1 - z0) * 0.3, x0 + (x1 - x0) * 0.9, y0 + 0.01, z0 + (z1 - z0) * 0.7); for (const bx of [0.28, 0.72]) { const x = x0 + (x1 - x0) * bx, y = (y0 + y1) / 2; a.cyl(x, y, z1, z1 + 2.2 * IN, 0.9 * IN, 8); a.cyl(x, y, z1 + 0.6 * IN, z1 + 1.2 * IN, 1.4 * IN, 8); } if (!side && r === 0) a.tube([[x0 + (x1 - x0) * 0.28, (y0 + y1) / 2, z1 + 2 * IN], [x0 + (x1 - x0) * 0.28 - 1 * IN, (y0 + y1) / 2, z1 + 6 * IN]], [0.3 * IN, 0.3 * IN], 4); }
  for (let r = 0; r < rows; r++) a.tube([[X0 + 6 * IN, cy, fz + (r + 1) * rh - 1.2 * IN + 2.8 * IN], [X1 - 6 * IN, cy, fz + (r + 1) * rh - 1.2 * IN + 2.8 * IN]], [0.9 * IN, 0.9 * IN], 6);
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + 6 * IN, YF + 5 * IN, X1 - 6 * IN, cy - 1 * IN, 'EQUIP'); a.rect(X0 + 6 * IN, cy + 1 * IN, X1 - 6 * IN, YB - 5 * IN, 'EQUIP'); for (let i = 1; i < n; i++) a.line(X0 + 6 * IN + i * cw, YF + 5 * IN, X0 + 6 * IN + i * cw, YB - 5 * IN, 'EQUIP-DETAIL');
  a.log(`Added the post insulators and frame with three tiers, ${n * rows * 2} rectangular capacitor cans with nameplates and two bushings each, the expulsion fuse links and the bus tubes (plan and 3D).`);
}
/** a street feeder pillar: plinth, cabinet with louvre strips, double doors with hinges, hasp and padlock */
function pillar(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pl = 6 * IN;
  a.box(X0, YF, Z0, X1, YB, Z0 + pl); a.box(X0 + 1 * IN, YF + 1 * IN, Z0 + pl, X1 - 1 * IN, YB - 1 * IN, Z1 - 2 * IN); prismX(a, [[YF + 0.5 * IN, Z1 - 2 * IN], [YB - 0.5 * IN, Z1 - 2 * IN], [YB - 2 * IN, Z1], [YF + 2 * IN, Z1]], X0, X1);
  const nd = W >= 30 * IN ? 2 : 1, dw = (W - 4 * IN) / nd; for (let i = 0; i < nd; i++) { const x0 = X0 + 2 * IN + i * dw + 0.3 * IN, x1 = X0 + 2 * IN + (i + 1) * dw - 0.3 * IN; a.frame(x0, Z0 + pl + 3 * IN, x1, Z1 - 5 * IN, YF + 0.2 * IN, YF + 1.2 * IN, 0.9 * IN); a.box(x0 + 1 * IN, YF - 0.2 * IN, Z0 + pl + 4 * IN, x1 - 1 * IN, YF + 0.2 * IN, Z0 + pl + 4 * IN + 3 * IN); louv(a, x0 + 2 * IN, x1 - 2 * IN, YF + 0.2 * IN, Z1 - 14 * IN, Z1 - 7 * IN, 1.4 * IN, 0.8 * IN); const hx = i ? x1 : x0; for (const z of [Z0 + pl + 6 * IN, Z1 - 8 * IN]) a.cyl(hx, YF + 0.5 * IN, z - 1.2 * IN, z + 1.2 * IN, 0.5 * IN, 8); }
  const lx = nd === 2 ? cx : X1 - 5 * IN, lz = Z0 + pl + (H - pl) * 0.45; a.box(lx - 1.5 * IN, YF - 1 * IN, lz - 2 * IN, lx + 1.5 * IN, YF + 0.2 * IN, lz + 2 * IN); a.cyl(lx, YF - 1.4 * IN, lz - 4.4 * IN, lz - 2 * IN, 0.9 * IN, 10); a.box(lx - 1.1 * IN, YF - 1.7 * IN, lz - 6.4 * IN, lx + 1.1 * IN, YF - 1 * IN, lz - 4 * IN); a.tube([[lx, YF - 1 * IN, lz - 2 * IN], [lx, YF - 1.4 * IN, lz - 4.4 * IN]], [0.3 * IN, 0.3 * IN], 4);
  a.box(X0 + 4 * IN, YF - 0.2 * IN, Z1 - 4.4 * IN, X0 + 4 * IN + 6 * IN, YF + 0.2 * IN, Z1 - 3 * IN + 0.1);
  for (const x of [X0 + 8 * IN, X1 - 8 * IN]) a.box(x - 3 * IN, YF + D * 0.3, Z0 - 0.0, x + 3 * IN, YF + D * 0.7, Z0 + 0.001);
  a.outline(); a.rect(X0 + 1 * IN, YF + 1 * IN, X1 - 1 * IN, YB - 1 * IN, 'EQUIP-DETAIL'); if (nd === 2) a.line(cx, YF, cx, YF + 1.2 * IN, 'EQUIP-DETAIL');
  a.log(`Added the plinth, the cabinet with sloped roof, ${nd === 2 ? 'double' : 'a single'} hinged door${nd === 2 ? 's' : ''} with louvre strips, hinge barrels, a hasp with padlock and a nameplate (plan and 3D).`);
}
/** a pedestal service cabinet with meter windows and a breaker door, on a post with a riser */
function servicePed(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.meters, cz0 = Z0 + 20 * IN, mw = (W - 4 * IN) / n;
  a.tube([[X0 + 4 * IN, cy, Z0], [X0 + 4 * IN, cy, cz0 + 4 * IN]], [1.6 * IN, 1.6 * IN], 8); a.tube([[X1 - 4 * IN, cy, Z0], [X1 - 4 * IN, cy, cz0 + 4 * IN]], [1.6 * IN, 1.6 * IN], 8); a.box(X0, cy - 6 * IN, Z0, X1, cy + 6 * IN, Z0 + 2.5 * IN);
  a.box(X0 + 1 * IN, YF + 1 * IN, cz0, X1 - 1 * IN, YB - 0.5 * IN, Z1 - 2 * IN); prismX(a, [[YF + 0.5 * IN, Z1 - 2 * IN], [YB - 0.5 * IN, Z1 - 2 * IN], [YB - 1 * IN, Z1], [YF + 1.5 * IN, Z1]], X0 + 1 * IN, X1 - 1 * IN);
  for (let i = 0; i < n; i++) { const x = X0 + 2 * IN + (i + 0.5) * mw, mz = Z1 - 12 * IN; a.box(x - mw * 0.42, YF + 0.5 * IN, cz0 + 3 * IN, x + mw * 0.42, YF + 1.2 * IN, Z1 - 4 * IN); a.ycyl(YF - 1.4 * IN, YF + 0.5 * IN, x, mz, 3.4 * IN, 20); a.ycyl(YF - 1.7 * IN, YF - 1.4 * IN, x, mz, 3.6 * IN, 20); a.ycyl(YF - 1.8 * IN, YF - 1.7 * IN, x, mz, 3 * IN, 20); a.ycyl(YF - 2.2 * IN, YF - 1.8 * IN, x, mz, 0.5 * IN, 8);
    a.box(x - mw * 0.32, YF - 0.2 * IN, cz0 + 4 * IN, x + mw * 0.32, YF + 0.5 * IN, cz0 + 12 * IN); a.box(x - 2 * IN, YF - 0.8 * IN, cz0 + 6.5 * IN, x + 2 * IN, YF - 0.2 * IN, cz0 + 9.5 * IN); a.box(x - 0.5 * IN, YF - 1.6 * IN, cz0 + 7 * IN, x + 0.5 * IN, YF - 0.8 * IN, cz0 + 9 * IN); a.circ(x, YF - 0.5 * IN, 3.4 * IN, 'EQUIP-DETAIL'); }
  a.tube([[X1 - 2.5 * IN, YB - 1 * IN, Z1 - 2 * IN], [X1 - 2.5 * IN, YB - 1 * IN, Z1 + 0]], [1 * IN, 1 * IN], 6);
  a.outline(); a.rect(X0 + 1 * IN, YF + 1 * IN, X1 - 1 * IN, YB - 0.5 * IN, 'EQUIP-DETAIL');
  a.log(`Added the footing bar with two posts, the weather cabinet with sloped roof, ${n} round meter window${n > 1 ? 's' : ''} with sealing rings and the breaker door${n > 1 ? 's' : ''} below with handle${n > 1 ? 's' : ''} (plan and 3D).`);
}

// ------------------------------------------------------------------------------------------ families: distribution
const Dst = [
  fam({ cat: 'energy/distribution', title: 'Generic tubular steel transmission monopole',
    desc: (v) => `Tapered tubular steel monopole with ${v.tiers} tier${v.tiers > 1 ? 's' : ''} of braced crossarms carrying insulator strings: base plate with anchor bolts, slip-joint bands, a step plate and an earth-wire peak.`,
    vs: [['69 kV class, 70 ft, one tier', 1, 30, 144, 60, 840], ['115 kV class, 90 ft, two tiers', 2, 36, 192, 84, 1080], ['230 kV class, 120 ft, three tiers', 3, 44, 264, 108, 1440]].map(([l, t, rb, w, sl, h]) => [l, w, w, h, 0, { tiers: t, rb, sl: sl * 0.5 }]),
    build: (a, v) => monopole(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic wood H-frame transmission structure',
    desc: 'H-frame structure of two tapered wood poles with butt plates and ground wires, a crossarm with braces, lower X-braced cross members, knee braces and three insulator strings.',
    vs: [['69 kV class, 50 ft', 600, 280, 50, 30], ['115 kV class, 65 ft', 780, 340, 52, 40], ['230 kV class, 80 ft', 960, 440, 54, 54]].map(([l, h, w, d, sl]) => [l, w, d, h, 0, { sl }]),
    build: (a, v) => hframe(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic precast cable vault',
    desc: 'Precast cable vault with base slab, four walls and a lid slab carrying two manhole necks with cast frames and bolted covers, cable duct stubs on both ends and a lifting insert.',
    vs: [['6 by 4 ft', 84, 50, 62], ['8 by 6 ft', 108, 74, 72], ['10 by 8 ft', 132, 98, 84]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: (a, v) => vault(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic dry-type indoor transformer',
    desc: 'Dry-type indoor transformer on a wheeled base: laminated core with yokes, three cast-resin coils with taps and terminals, slatted safety cages front and back and roof lifting eyes.',
    vs: [['150 kVA class', 36, 22, 46], ['500 kVA class', 56, 30, 64], ['1500 kVA class', 82, 40, 84]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: (a, v) => dryXfmr(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic low-voltage switchboard lineup',
    desc: (v) => `Low-voltage switchboard lineup of ${v.sec} sections on a plinth: hinged doors with vertical handle bars, door-mounted dials and pilot lights or breaker handles, lifting lugs and a roof cap.`,
    vs: [[3, 96], [5, 160], [7, 224]].map(([n, w]) => [`${n} sections, ${w} in`, w, 24, 90, 0, { sec: n }]),
    build: (a, v) => lvBoard(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic compact ring main unit',
    desc: (v) => `Compact ring main unit of ${v.ways} panels on a plinth: a steel tank with sloped top, a switch-position window and mimic plate on each panel, two handle sockets with an interlock bar and bolted cable-compartment covers.`,
    vs: [[2, 36], [3, 52], [4, 68]].map(([n, w]) => [`${n}-way, ${w} in`, w, 34, 56, 0, { ways: n }]),
    build: (a, v) => rmu(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic substation steel gantry',
    desc: 'Substation gantry of two lattice columns with base plates and panel bracing carrying a lattice beam, three tension insulator strings with end clamps and earth-wire peaks.',
    vs: [['69 kV class, 30 ft', 300, 60, 380], ['138 kV class, 40 ft', 420, 72, 500], ['230 kV class, 50 ft', 560, 84, 620]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: (a, v) => gantry(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic outdoor live-tank circuit breaker',
    desc: 'Outdoor circuit breaker: a four-legged frame, three porcelain post insulators with sheds each carrying a horizontal interrupter chamber with grading rings and terminal pads, and a mechanism cabinet with door and handle.',
    vs: [['72 kV class', 170, 78, 140], ['145 kV class', 230, 96, 190], ['245 kV class', 300, 110, 250]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: (a, v) => liveBreaker(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic surge arrester set on stand',
    desc: 'Three surge arresters with sheds, grading rings and line terminals on a steel stand with braces and base plates, a ground strap and counter plate for each.',
    vs: [['36 kV class', 84, 36, 108], ['72 kV class', 120, 44, 160], ['145 kV class', 164, 54, 220]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: (a, v) => arresters(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic shunt capacitor bank rack',
    desc: (v) => `Shunt capacitor bank on post insulators: a three-tier frame holding ${v.units * 4} rectangular capacitor cans with nameplates and two bushings each, expulsion fuse links and bus tubes.`,
    vs: [[2, 64], [3, 92], [4, 120]].map(([n, w]) => [`${n * 4} cans, ${w} in`, w, 56, 110, 0, { units: n }]),
    build: (a, v) => capBank(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic street feeder pillar',
    desc: (v) => `Street feeder pillar on a plinth: a cabinet with a sloped roof, ${v.w >= 30 ? 'double' : 'a single'} hinged door${v.w >= 30 ? 's' : ''} with louvre strips, hinge barrels, a hasp with padlock and a nameplate.`,
    vs: [[24, 14, 38], [36, 16, 44], [48, 18, 50], [60, 20, 54]].map(([w, d, h]) => [`${w} in wide, ${h} in tall`, w, d, h, 0, { w }]),
    build: (a, v) => pillar(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic pedestal service cabinet with meters',
    desc: (v) => `Pedestal service cabinet on two posts: a weather cabinet with ${v.meters} round meter window${v.meters > 1 ? 's' : ''} with sealing rings and breaker doors with handles below.`,
    vs: [[1, '100 A', 18, 12, 52], [2, '200 A', 28, 12, 52], [4, '400 A', 52, 14, 52]].map(([n, a2, w, d, h]) => [`${n} meter${n > 1 ? 's' : ''}, ${a2}`, w, d, h, 0, { meters: n }]),
    build: (a, v) => servicePed(a, v) }),
];

// ================================================================================== oil and gas
/** a vertical separator or scrubber on a skirt: dished heads, nozzles with flanges, manway, level column, relief valve, ladder */
function vertVessel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.dia * IN / 2, sk = 14 * IN, hd = R * 0.3, zt = Z1 - hd - 10 * IN;
  a.cyl(cx, cy, Z0, Z0 + 2 * IN, R * 1.28, 28); a.cyl(cx, cy, Z0 + 2 * IN, Z0 + sk, R * 0.98, 28); for (let k = 0; k < 8; k++) { const th = (k / 8) * TAU + 0.2; a.box(cx + R * 1.1 * m.cos(th) - 1.5 * IN, cy + R * 1.1 * m.sin(th) - 1.5 * IN, Z0 + 2 * IN, cx + R * 1.1 * m.cos(th) + 1.5 * IN, cy + R * 1.1 * m.sin(th) + 1.5 * IN, Z0 + 5 * IN); }
  a.cyl(cx, cy, Z0 + sk, zt, R, 28); a.ell(cx, cy, zt, R, R, hd, 24, 8); a.ell(cx, cy, Z0 + sk, R, R, hd * 0.7, 24, 8); for (const f of [0.35, 0.55, 0.75]) { const z = Z0 + sk + (zt - Z0 - sk) * f; a.cyl(cx, cy, z - 0.4 * IN, z + 0.4 * IN, R + 0.7 * IN, 28); }
  const nr = R * 0.17; a.cyl(cx, cy, zt + hd * 0.7, Z1 - 1 * IN, nr, 14); flange(a, 'z', cx, cy, Z1 - 1 * IN, 1, nr * 1.8, 1.2 * IN, nr * 0.8, 8, nr * 1.4, 0.7 * IN, 0, true);
  const zi = Z0 + sk + (zt - Z0 - sk) * 0.58, zl = Z0 + sk + (zt - Z0 - sk) * 0.12; nozz(a, 'y', cx - R * 0.45, zi, cy - R + 1 * IN, cy - R - 7 * IN, nr * 0.9, 1.8, 1.2 * IN); nozz(a, 'x', cy, zl, cx + R - 1 * IN, cx + R + 7 * IN, nr * 0.7, 1.8, 1.2 * IN);
  a.frame(cx + R * 0.15, Z0 + sk + 40 * IN * 0, cx + R * 0.15 + 0.1, Z0 + sk + 0.1, cy - R, cy - R + 0.1, 0.1);
  const mz = Z0 + sk + (zt - Z0 - sk) * 0.3; a.ycyl(cy + R, cy + R + 3.5 * IN, cx + R * 0.0, mz, 8 * IN, 18); a.ycyl(cy + R + 3.5 * IN, cy + R + 4.8 * IN, cx, mz, 9.4 * IN, 18); a.circ(cx, cy + R + 3 * IN, 0.1, 'EQUIP-DETAIL');
  const lx = cx - R * 0.6; a.cyl(lx, cy - R - 3 * IN, zl + 6 * IN, zl + (zt - zl) * 0.7, 1.2 * IN, 8); a.tube([[lx, cy - R - 3 * IN, zl + 6 * IN], [lx, cy - R, zl + 2 * IN]], [0.7 * IN, 0.7 * IN], 6); a.tube([[lx, cy - R - 3 * IN, zl + (zt - zl) * 0.7], [lx, cy - R, zl + (zt - zl) * 0.75]], [0.7 * IN, 0.7 * IN], 6);
  a.cyl(cx - R * 0.45, cy, zt + hd * 0.4, zt + hd * 0.4 + 9 * IN, 1.4 * IN, 10); a.cyl(cx - R * 0.45, cy, zt + hd * 0.4 + 9 * IN, zt + hd * 0.4 + 14 * IN, 2 * IN, 10);
  a.cyl(cx, cy, Z0 + 1 * IN, Z0 + 1.1 * IN, 1, 4); const ly = cy + R + 1 * IN, lw = 7 * IN; for (const s of [-1, 1]) a.tube([[cx + R * 0.7 + s * lw / 2, ly, Z0 + sk], [cx + R * 0.7 + s * lw / 2, ly, zt - 18 * IN]], [0.6 * IN, 0.6 * IN], 5); for (let z = Z0 + sk + 6 * IN; z < zt - 20 * IN; z += 11 * IN) a.tube([[cx + R * 0.7 - lw / 2, ly, z], [cx + R * 0.7 + lw / 2, ly, z]], [0.5 * IN, 0.5 * IN], 4);
  a.circ(cx, cy, R); a.circ(cx, cy, R * 1.28, 'EQUIP-HIDDEN'); a.circ(cx, cy, nr, 'EQUIP-DETAIL'); a.line(cx - R, cy, cx - R - 7 * IN + 0, cy, 'EQUIP-DETAIL');
  a.log('Added the skirt with base ring and anchor chairs, the shell with stiffener bands and dished heads, the top gas outlet and tangential inlet and side liquid outlet with flanges, the manway, the level gauge column, the relief valve and a side ladder (plan and 3D).');
}
/** a horizontal bullet tank: hemispherical heads, two saddles, manway, nozzle cluster on top, ladder, level column */
function bullet(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.dia * IN / 2, zc = Z0 + 20 * IN + R, x0 = X0 + R + 1 * IN, x1 = X1 - R - 1 * IN;
  for (const f of [0.18, 0.82]) { const x = x0 + (x1 - x0) * f; a.box(x - 5 * IN, cy - R * 0.92, Z0, x + 5 * IN, cy + R * 0.92, Z0 + 2 * IN); for (const s of [-1, 1]) a.box(x - 2 * IN, cy + s * R * 0.5 - 1.5 * IN, Z0 + 2 * IN, x + 2 * IN, cy + s * R * 0.5 + 1.5 * IN, zc - R * 0.5); a.prism([[x - 3 * IN, cy - R * 0.7], [x + 3 * IN, cy - R * 0.7], [x + 3 * IN, cy + R * 0.7], [x - 3 * IN, cy + R * 0.7]], Z0 + 20 * IN, zc - R * 0.6); }
  a.xcyl(x0, x1, cy, zc, R, 32); a.ell(x0, cy, zc, R, R, R, 24, 12); a.ell(x1, cy, zc, R, R, R, 24, 12);
  for (const f of [0.18, 0.82]) { const x = x0 + (x1 - x0) * f; a.xcyl(x - 2 * IN, x + 2 * IN, cy, zc, R + 0.8 * IN, 32); }
  const mr = 9 * IN, mx = x0 + (x1 - x0) * 0.35; a.cyl(mx, cy, zc + R - 4 * IN, zc + R + 5 * IN, mr, 18); a.cyl(mx, cy, zc + R + 5 * IN, zc + R + 7 * IN, mr * 1.2, 18); for (let k = 0; k < 12; k++) { const th = (k / 12) * TAU; a.cyl(mx + mr * 1.05 * m.cos(th), cy + mr * 1.05 * m.sin(th), zc + R + 7 * IN, zc + R + 8.4 * IN, 0.45 * IN, 6); } a.circ(mx, cy, mr * 1.2, 'EQUIP-DETAIL');
  const dx = x0 + (x1 - x0) * 0.62; for (let i = 0; i < 3; i++) { const x = dx + (i - 1) * 8 * IN, z = zc + R; a.cyl(x, cy, z - 3 * IN, z + 8 * IN, 1.6 * IN, 10); a.cyl(x, cy, z + 8 * IN, z + 14 * IN, 2.4 * IN, 10); a.cyl(x, cy, z + 14 * IN, z + 18 * IN, 0.5 * IN, 6); a.box(x - 1.4 * IN, cy - 0.6 * IN, z + 15 * IN, x + 1.4 * IN, cy + 0.6 * IN, z + 16.4 * IN); }
  a.box(dx - 12 * IN, cy - 2 * IN, zc + R + 9 * IN, dx + 12 * IN, cy + 2 * IN, zc + R + 10 * IN);
  const lx = x0 - R * 0.6, ly = YF + 1 * IN; for (const s of [-1, 1]) a.tube([[lx, cy + s * 7 * IN, Z0], [lx, cy + s * 7 * IN, zc + R * 0.5]], [0.6 * IN, 0.6 * IN], 5); for (let z = Z0 + 8 * IN; z < zc + R * 0.5; z += 12 * IN) a.tube([[lx, cy - 7 * IN, z], [lx, cy + 7 * IN, z]], [0.5 * IN, 0.5 * IN], 4);
  a.cyl(x1 - R * 0.2, YF + 2 * IN, zc - R * 0.6, zc + R * 0.3, 1.2 * IN, 8); a.tube([[x1 - R * 0.2, YF + 2 * IN, zc + R * 0.3], [x1 - R * 0.2, cy - R * 0.9, zc + R * 0.4]], [0.6 * IN, 0.6 * IN], 6); a.tube([[x1 - R * 0.2, YF + 2 * IN, zc - R * 0.6], [x1 - R * 0.2, cy - R * 0.95, zc - R * 0.6]], [0.6 * IN, 0.6 * IN], 6);
  nozz(a, 'z', x0 + (x1 - x0) * 0.2, cy, Z0 + 4 * IN, Z0 + 20 * IN, 2.4 * IN, 1.8, 1 * IN);
  a.outline('EQUIP-HIDDEN'); a.rect(x0, cy - R, x1, cy + R); a.circ(mx, cy, mr, 'EQUIP-DETAIL'); for (const f of [0.18, 0.82]) a.line(x0 + (x1 - x0) * f, cy - R, x0 + (x1 - x0) * f, cy + R, 'EQUIP-DETAIL');
  a.log('Added the hemispherical heads, two saddles with anchor plates, the top manway with bolt ring, a valve cluster with relief, gauge and filling stubs and a handrail, the end ladder, the level column and a bottom drain with flange (plan and 3D).');
}
/** a spherical storage tank on braced columns, with equator band, top platform, manway, stair and valves */
function sphere(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.dia * IN / 2, zc = Z0 + 14 * IN * 6 * 0 + (H - R - 30 * IN) , lz = Z0 + (zc - R) * 0.0;
  const nc = 8, cr = R * 0.82, zb = zc - R * 0.55; for (let k = 0; k < nc; k++) { const th = (k / nc) * TAU + 0.2, x = cx + cr * m.cos(th), y = cy + cr * m.sin(th), xs = cx + R * 0.85 * m.cos(th), ys = cy + R * 0.85 * m.sin(th); a.tube([[x, y, Z0 + 3 * IN], [xs, ys, zb]], [4 * IN, 4 * IN], 10); a.box(x - 9 * IN, y - 9 * IN, Z0, x + 9 * IN, y + 9 * IN, Z0 + 3 * IN); }
  for (let k = 0; k < nc; k++) { const th0 = (k / nc) * TAU + 0.2, th1 = ((k + 1) / nc) * TAU + 0.2; for (const f of [0.4]) { const z = Z0 + 3 * IN + (zb - Z0 - 3 * IN) * f, r = cr + (R * 0.85 - cr) * f; a.tube([[cx + r * m.cos(th0), cy + r * m.sin(th0), z], [cx + r * m.cos(th1), cy + r * m.sin(th1), z]], [1.3 * IN, 1.3 * IN], 5); } a.tube([[cx + cr * m.cos(th0), cy + cr * m.sin(th0), Z0 + 3 * IN + 12 * IN], [cx + (cr + (R * 0.85 - cr) * 0.4) * m.cos(th1), cy + (cr + (R * 0.85 - cr) * 0.4) * m.sin(th1), Z0 + 3 * IN + (zb - Z0) * 0.5]], [0.9 * IN, 0.9 * IN], 4); }
  a.ell(cx, cy, zc, R, R, R, 36, 18); const pts = []; for (let k = 0; k <= 36; k++) { const th = (k / 36) * TAU; pts.push([cx + (R + 0.6 * IN) * m.cos(th), cy + (R + 0.6 * IN) * m.sin(th), zc]); } a.tube(pts, pts.map(() => 1.6 * IN), 6);
  const px = cx, pz = zc + R; a.cyl(px, cy, pz - 3 * IN, pz + 3 * IN, 12 * IN, 18); a.cyl(px, cy, pz + 3 * IN, pz + 6 * IN, 9 * IN, 16); a.cyl(px + 3 * IN, cy, pz + 6 * IN, pz + 18 * IN, 1.5 * IN, 8); a.cone(px + 3 * IN, cy, pz + 18 * IN, pz + 22 * IN, 3 * IN, 1.2 * IN, 8);
  const sa = (th, z) => [cx + (R + 12 * IN) * m.cos(th), cy + (R + 12 * IN) * m.sin(th), z]; const spts = []; for (let k = 0; k <= 30; k++) { const f = k / 30, th = 0.4 + f * 1.15 * m.PI; const z = Z0 + 10 * IN + f * (zc + R * 0.55 - Z0 - 10 * IN), rr2 = (R * 0.82 + 12 * IN) + (R - R * 0.82) * f * 0.9; spts.push([cx + rr2 * m.cos(th), cy + rr2 * m.sin(th), z]); } a.tube(spts, spts.map(() => 1.8 * IN), 5); a.tube(spts.map(([x, y, z]) => [x * 0.985 + cx * 0.015, y * 0.985 + cy * 0.015, z + 34 * IN]), spts.map(() => 0.7 * IN), 4);
  nozz(a, 'z', cx + R * 0.0, cy + 0 , Z0 + 4 * IN, Z0 + 4 * IN + 0.1, 0.1 * IN);
  const bz = zc - R; a.cyl(cx + R * 0.15, cy, bz - 10 * IN, bz + 3 * IN, 3 * IN, 12); flange(a, 'z', cx + R * 0.15, cy, bz - 10 * IN, -1, 6 * IN, 1.2 * IN, 3 * IN, 8, 4.6 * IN, 0.6 * IN, 0, false);
  a.circ(cx, cy, R); a.circ(cx, cy, cr + 9 * IN, 'EQUIP-HIDDEN'); a.circ(cx, cy, 12 * IN, 'EQUIP-DETAIL');
  a.log(`Added ${nc} braced support columns with base plates, the welded sphere with an equator band, the top platform with manway and relief stack, a spiral stair with handrail up the side and a bottom drain stub (plan and 3D).`);
}
/** a tank truck loading rack: deck on columns, canopy, loading arms with articulated pipes, meter skids, stair */
function loadRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.arms, bw = (W - 24 * IN) / n, dz = Z0 + 52 * IN, py = YB - 36 * IN, cz = Z1 - 18 * IN;
  const cols = []; for (let i = 0; i <= n; i++) cols.push(X0 + 12 * IN + i * bw);
  for (const x of cols) for (const y of [py + 2 * IN, YB - 6 * IN]) { a.box(x - 4 * IN, y - 4 * IN, Z0, x + 4 * IN, y + 4 * IN, Z0 + 1 * IN); a.tube([[x, y, Z0 + 1 * IN], [x, y, cz]], [2.2 * IN, 2.2 * IN], 8); }
  a.box(X0 + 4 * IN, py - 4 * IN, dz - 3 * IN, X1 - 4 * IN, YB - 2 * IN, dz); a.box(X0 + 4 * IN, py - 4 * IN, dz - 8 * IN, X1 - 4 * IN, py - 2 * IN, dz - 3 * IN);
  rail(a, X0 + 4 * IN, py - 3 * IN, X1 - 4 * IN, py - 3 * IN, dz, dz + 40 * IN, 10, n + 1);
  a.box(X0 + 4 * IN, py - 4 * IN, cz - 2 * IN, X1 - 4 * IN, YB - 2 * IN, cz); prismX(a, [[py - 12 * IN, cz + 6 * IN], [YB, cz + 6 * IN], [YB, cz + 14 * IN], [py - 12 * IN, cz + 2 * IN]], X0, X1); for (const x of cols) a.tube([[x, py + 2 * IN, cz], [x, py - 8 * IN, cz + 3 * IN]], [1.2 * IN, 1.2 * IN], 6);
  for (let i = 0; i < n; i++) { const x = cols[i] + bw / 2, hz = dz + 80 * IN; a.cyl(x, py + 6 * IN, dz, hz, 2 * IN, 10); a.ell(x, py + 6 * IN, hz, 3 * IN, 3 * IN, 3 * IN, 10, 5);
    a.tube([[x, py + 6 * IN, hz], [x, py - 10 * IN, hz + 2 * IN], [x, py - 26 * IN, hz - 14 * IN], [x, py - 30 * IN, hz - 36 * IN]], [1.8 * IN, 1.8 * IN, 1.6 * IN, 1.6 * IN], 8); for (const p of [[py - 10 * IN, hz + 2 * IN], [py - 26 * IN, hz - 14 * IN]]) a.ell(x, p[0], p[1], 2.4 * IN, 2.4 * IN, 2.4 * IN, 8, 4);
    a.cyl(x, py - 30 * IN, hz - 46 * IN, hz - 36 * IN, 2.6 * IN, 10); a.cone(x, py - 30 * IN, hz - 50 * IN, hz - 46 * IN, 1.4 * IN, 2.6 * IN, 10); a.tube([[x, py - 14 * IN, hz + 2 * IN], [x + 10 * IN, py - 14 * IN, hz + 14 * IN], [x + 10 * IN, py + 6 * IN, hz + 10 * IN]], [0.5 * IN, 0.5 * IN, 0.5 * IN], 4);
    a.box(x - 12 * IN, YB - 20 * IN, dz, x + 12 * IN, YB - 8 * IN, dz + 22 * IN); a.box(x - 8 * IN, YB - 20.6 * IN, dz + 12 * IN, x + 8 * IN, YB - 20 * IN, dz + 20 * IN); a.circ(x, py - 30 * IN, 2.6 * IN, 'EQUIP-DETAIL'); a.rect(x - 12 * IN, YB - 20 * IN, x + 12 * IN, YB - 8 * IN, 'EQUIP-DETAIL'); }
  const sx = X0 + 2 * IN; for (const s of [-1, 1]) a.tube([[sx + s * 12 * IN, YF + 6 * IN, Z0], [sx + s * 12 * IN, py - 4 * IN, dz]], [0.8 * IN, 0.8 * IN], 5);
  for (let k = 1; k < 10; k++) { const f = k / 10; a.box(sx - 12 * IN, YF + 6 * IN + (py - 4 * IN - YF - 6 * IN) * f - 1 * IN, Z0 + (dz - Z0) * f - 0.5 * IN, sx + 12 * IN, YF + 6 * IN + (py - 4 * IN - YF - 6 * IN) * f + 5 * IN, Z0 + (dz - Z0) * f); }
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + 4 * IN, py - 4 * IN, X1 - 4 * IN, YB - 2 * IN); for (const x of cols) for (const y of [py + 2 * IN, YB - 6 * IN]) a.circ(x, y, 2.2 * IN, 'EQUIP');
  a.log(`Added the columns with base plates, the elevated deck with handrail and edge plate, the canopy roof on rafters, ${n} loading arms each with riser, swivel elbows, drop tube and vapour hose, the meter skids and the access stair (plan and 3D).`);
}
/** a blowout preventer stack: base spool, ram preventers with bonnets and handwheels, an annular unit, outlets with valves */
function bop(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.rams, br = D * 0.2, hw = W / 2 - 46 * IN, rh = 30 * IN, bz = Z0 + 14 * IN;
  a.box(X0, YF, Z0, X1, YB, Z0 + 6 * IN); for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.tube([[cx + sx * W * 0.4, cy + sy * D * 0.4, Z0 + 6 * IN], [cx + sx * br * 1.6, cy + sy * br * 1.6, bz + 10 * IN]], [1.6 * IN, 1.6 * IN], 6);
  a.cyl(cx, cy, Z0 + 6 * IN, bz, br * 1.1, 24); flange(a, 'z', cx, cy, bz, 1, br * 1.5, 2.4 * IN, br * 0.7, 16, br * 1.25, 1.2 * IN, 0, true); let z = bz + 2.4 * IN;
  for (let i = 0; i < n; i++) { const z0 = z, z1 = z + rh; a.cyl(cx, cy, z0, z1, br * 0.95, 24); a.box(cx - hw, cy - br * 0.85, z0 + 4 * IN, cx + hw, cy + br * 0.85, z1 - 4 * IN);
    for (const s of [-1, 1]) { const bx = cx + s * hw; a.xcyl(bx, bx + s * 22 * IN, cy, (z0 + z1) / 2, br * 0.62, 18); a.xcyl(bx + s * 22 * IN, bx + s * 26 * IN, cy, (z0 + z1) / 2, br * 0.5, 14); a.xcyl(bx + s * 26 * IN, bx + s * 44 * IN, cy, (z0 + z1) / 2, 1.8 * IN, 10); a.xcyl(bx + s * 44 * IN - 1 * IN, bx + s * 44 * IN + 1 * IN, cy, (z0 + z1) / 2, 6 * IN, 14); }
    a.rect(cx - hw, cy - br * 0.85, cx + hw, cy + br * 0.85, 'EQUIP-DETAIL'); flange(a, 'z', cx, cy, z1, 1, br * 1.5, 2.4 * IN, br * 0.7, 16, br * 1.25, 1.2 * IN, 0, false); z = z1 + 2.4 * IN; }
  const so = z - 12 * IN; for (const s of [-1, 1]) { nozz(a, 'x', cy, bz + 14 * IN, cx + s * br * 0.9, cx + s * (br * 0.9 + 26 * IN), 3 * IN, 1.8, 1.4 * IN); a.box(cx + s * (br * 0.9 + 28 * IN) - 3 * IN, cy - 3 * IN, bz + 14 * IN - 3 * IN, cx + s * (br * 0.9 + 28 * IN) + 3 * IN, cy + 3 * IN, bz + 14 * IN + 3 * IN); }
  const ah = H - (z - Z0) - 4 * IN; a.cyl(cx, cy, z, z + ah * 0.6, br * 1.15, 28); a.ell(cx, cy, z + ah * 0.6, br * 1.15, br * 1.15, ah * 0.4, 24, 6); a.cyl(cx, cy, z + ah, Z1, br * 0.7, 20); for (let k = 0; k < 4; k++) { const th = (k / 4) * TAU + 0.8; a.tube([[cx + br * 1.15 * m.cos(th), cy + br * 1.15 * m.sin(th), z + ah * 0.55], [cx + br * 1.35 * m.cos(th), cy + br * 1.35 * m.sin(th), z + ah * 0.7]], [1.2 * IN, 1.2 * IN], 6); }
  a.circ(cx, cy, br * 0.95); a.circ(cx, cy, br * 1.15, 'EQUIP-DETAIL');
  a.log(`Added the base frame with bracing, the base spool with flange, ${n} ram preventer${n > 1 ? 's' : ''} with side bonnets, operating cylinders and handwheel locks, the choke and kill outlets with valves, and the annular preventer with its dished top (plan and 3D).`);
}
/** a land drilling rig: substructure, drill floor with rails, tapered lattice mast, crown block, traveling block, doghouse, stairs */
function rig(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, fz = Z0 + v.floor * IN, mw = D * 0.34, mh = Z1 - 8 * IN - fz, mx = cx + W * 0.1, t = 3 * IN;
  for (const sx of [-1, 1]) { a.box(cx + sx * W * 0.4 - 6 * IN, YF + 6 * IN, Z0, cx + sx * W * 0.4 + 6 * IN, YB - 6 * IN, Z0 + 14 * IN); for (const y of [YF + 12 * IN, YB - 12 * IN]) a.box(cx + sx * W * 0.4 - 5 * IN, y - 5 * IN, Z0 + 14 * IN, cx + sx * W * 0.4 + 5 * IN, y + 5 * IN, fz - 8 * IN); }
  a.box(X0 + 6 * IN, YF + 8 * IN, fz - 8 * IN, X1 - 30 * IN * 0 - 6 * IN, YB - 8 * IN, fz); for (const [y0, y1] of [[YF + 8 * IN, YF + 14 * IN]]) a.box(X0 + 6 * IN, y0, fz, X1 - 6 * IN, y1, fz + 3 * IN);
  for (let i = 1; i < 5; i++) { const x = X0 + 6 * IN + (X1 - X0 - 12 * IN) * i / 5; for (const y of [YF + 12 * IN, YB - 12 * IN]) a.tube([[x, y, Z0 + 14 * IN], [x + (X1 - X0) * 0.08, y, fz - 8 * IN]], [1.6 * IN, 1.6 * IN], 6); }
  rail(a, X0 + 6 * IN, YF + 10 * IN, X1 - 6 * IN, YF + 10 * IN, fz, fz + 42 * IN, 8, 8); rail(a, X0 + 6 * IN, YB - 8 * IN, X1 - 6 * IN, YB - 8 * IN, fz, fz + 42 * IN, 8, 8);
  const np = 10; for (let k = 0; k < np; k++) { const f0 = k / np, f1 = (k + 1) / np, w0 = mw / 2 * (1 - 0.45 * f0), w1 = mw / 2 * (1 - 0.45 * f1), z0 = fz + mh * f0, z1 = fz + mh * f1;
    if (k === 0) for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.tube([[mx + sx * mw / 2, cy + sy * mw / 2, fz], [mx + sx * mw / 2 * 0.55, cy + sy * mw / 2 * 0.55, fz + mh]], [t, t * 0.8], 6);
    for (const [fixed, sg] of [['y', -1], ['y', 1], ['x', -1], ['x', 1]]) { const P = (z, w, s) => fixed === 'y' ? [mx + s * w, cy + sg * w, z] : [mx + sg * w, cy + s * w, z]; a.tube([P(z0, w0, -1), P(z1, w1, 1)], [t * 0.4, t * 0.4], 4); a.tube([P(z0, w0, 1), P(z1, w1, -1)], [t * 0.4, t * 0.4], 4); }
    for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const k2 = (dx === -1 && dy === -1) ? 0 : 0; } a.tube([[mx - w1, cy - w1, z1], [mx + w1, cy - w1, z1]], [t * 0.4, t * 0.4], 4); a.tube([[mx + w1, cy - w1, z1], [mx + w1, cy + w1, z1]], [t * 0.4, t * 0.4], 4); }
  const ct = mw / 2 * 0.55; a.box(mx - ct * 1.3, cy - ct * 1.3, fz + mh, mx + ct * 1.3, cy + ct * 1.3, fz + mh + 14 * IN); for (let k = 0; k < 4; k++) a.ycyl(cy - ct * 1.2, cy + ct * 1.2, mx - 9 * IN + k * 6 * IN, fz + mh + 20 * IN, 4 * IN, 12); a.box(mx - ct * 1.4, cy - ct * 1.4, fz + mh + 14 * IN, mx + ct * 1.4, cy + ct * 1.4, fz + mh + 16 * IN);
  const bz = fz + mh * 0.45; a.box(mx - 9 * IN, cy - 7 * IN, bz, mx + 9 * IN, cy + 7 * IN, bz + 28 * IN); a.cyl(mx, cy, bz - 20 * IN, bz, 2 * IN, 8); a.tube([[mx - 9 * IN, cy, bz + 24 * IN], [mx - 14 * IN, cy, bz + 36 * IN], [mx + 14 * IN, cy, bz + 36 * IN], [mx + 9 * IN, cy, bz + 24 * IN]], [1.2 * IN, 1.2 * IN, 1.2 * IN, 1.2 * IN], 6); a.tube([[mx, cy, bz + 28 * IN], [mx, cy, fz + mh + 8 * IN]], [0.5 * IN, 0.5 * IN], 5);
  a.box(X0 + 14 * IN, YF + 18 * IN, fz, X0 + 58 * IN, YB - 18 * IN, fz + 30 * IN); prismX(a, [[YF + 18 * IN, fz + 30 * IN], [YB - 18 * IN, fz + 30 * IN], [YB - 24 * IN, fz + 34 * IN], [YF + 24 * IN, fz + 34 * IN]], X0 + 14 * IN, X0 + 58 * IN); a.frame(X0 + 22 * IN, fz + 6 * IN, X0 + 34 * IN, fz + 22 * IN, YF + 17 * IN, YF + 18 * IN, 1 * IN);
  const stx = X1 - 12 * IN; for (let k = 1; k < 8; k++) { const f = k / 8; a.box(stx - 14 * IN, YF + 4 * IN + f * 0, Z0 + (fz - Z0) * f - 1 * IN, stx + 14 * IN, YF + 4 * IN + 6 * IN, Z0 + (fz - Z0) * f); }
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + 6 * IN, YF + 8 * IN, X1 - 6 * IN, YB - 8 * IN); a.rect(mx - mw / 2, cy - mw / 2, mx + mw / 2, cy + mw / 2, 'EQUIP-DETAIL'); a.rect(X0 + 14 * IN, YF + 18 * IN, X0 + 58 * IN, YB - 18 * IN, 'EQUIP-DETAIL');
  a.log('Added the two-box substructure with braces, the drill floor with rails and edge plate, the four-legged tapered lattice mast with panel bracing, the crown block with sheaves, the traveling block with its hook and bail, the doghouse and the access stair (plan and 3D).');
}
/** a drilling mud tank: skid, tank with lids, agitator motors on bridges, a shale shaker at one end, a walkway with rails, a ladder, manifold */
function mudTank(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bh = 8 * IN, th = H - bh - 6 * IN, ew = W * 0.74, x1 = X0 + ew, nc = v.cmp;
  a.box(X0, YF + 6 * IN, Z0, X1, YB - 6 * IN, Z0 + bh); a.box(X0 + 2 * IN, YF + 10 * IN, Z0 + bh, x1, YB - 10 * IN, Z0 + bh + th * 0.82); for (let i = 1; i < nc; i++) a.box(X0 + 2 * IN + ew * i / nc - 0.5 * IN, YF + 10 * IN, Z0 + bh + th * 0.82, X0 + 2 * IN + ew * i / nc + 0.5 * IN, YB - 10 * IN, Z0 + bh + th * 0.84);
  for (let i = 0; i < nc; i++) { const xa = X0 + 2 * IN + ew * i / nc, xb = X0 + 2 * IN + ew * (i + 1) / nc; a.box(xa + 2 * IN, YF + 12 * IN, Z0 + bh + th * 0.82, xb - 2 * IN, YB - 12 * IN, Z0 + bh + th * 0.82 + 1.2 * IN); a.box(xa + ew / nc * 0.2, YF + 24 * IN, Z0 + bh + th * 0.82 + 1.2 * IN, xa + ew / nc * 0.8, cy - 2 * IN, Z0 + bh + th * 0.82 + 3 * IN); if (i % 2 === 0) { const ax = (xa + xb) / 2; a.box(ax - 8 * IN, YF + 20 * IN, Z0 + bh + th * 0.82 + 1.2 * IN, ax + 8 * IN, YB - 20 * IN, Z0 + bh + th * 0.82 + 5 * IN); a.cyl(ax, cy, Z0 + bh + th * 0.82 + 5 * IN, Z0 + bh + th * 0.82 + 16 * IN, 5 * IN, 14); a.cyl(ax, cy, Z0 + bh + th * 0.82 + 16 * IN, Z0 + bh + th * 0.82 + 22 * IN, 6 * IN, 14); a.box(ax - 4 * IN, cy - 4 * IN, Z0 + bh + th * 0.82 + 22 * IN, ax + 4 * IN, cy + 4 * IN, Z0 + bh + th * 0.82 + 26 * IN); a.circ(ax, cy, 6 * IN, 'EQUIP-DETAIL'); } }
  rail(a, X0 + 2 * IN, YF + 11 * IN, x1, YF + 11 * IN, Z0 + bh + th * 0.82, Z0 + bh + th * 0.82 + 36 * IN, 8, nc + 2); rail(a, X0 + 2 * IN, YB - 11 * IN, x1, YB - 11 * IN, Z0 + bh + th * 0.82, Z0 + bh + th * 0.82 + 36 * IN, 8, nc + 2);
  const sz = Z0 + bh + th * 0.82 - 2 * IN; a.box(x1 + 2 * IN, YF + 14 * IN, Z0 + bh, X1 - 2 * IN, YB - 14 * IN, sz - 20 * IN); a.box(x1 + 3 * IN, YF + 10 * IN, sz - 20 * IN, X1 - 3 * IN, YB - 10 * IN, sz - 6 * IN);
  prismX(a, [[YF + 12 * IN, sz - 4 * IN], [YB - 12 * IN, sz - 4 * IN], [YB - 12 * IN, sz + 18 * IN], [YF + 12 * IN, sz + 12 * IN]], x1 + 6 * IN, X1 - 6 * IN); for (const x of [x1 + 12 * IN, X1 - 14 * IN]) a.box(x, YF + 8 * IN, sz + 8 * IN, x + 4 * IN, YB - 8 * IN, sz + 12 * IN); for (let k = 0; k < 4; k++) a.cyl(x1 + 16 * IN + k * 6 * IN * 0, YF + 8 * IN + k * 0, sz, sz + 0.1, 0.1, 3);
  for (const s of [-1, 1]) a.box(x1 + 6 * IN, cy + s * (YB - YF) * 0.25 - 4 * IN, sz + 18 * IN, X1 - 6 * IN, cy + s * (YB - YF) * 0.25 + 4 * IN, sz + 22 * IN);
  const mz = Z0 + bh + th * 0.3; a.xcyl(X0 + 6 * IN, x1, YF + 8 * IN, mz, 3 * IN, 12); for (let i = 0; i < nc; i++) { const x = X0 + 2 * IN + ew * (i + 0.5) / nc; a.cyl(x, YF + 8 * IN, mz + 3 * IN, mz + 12 * IN, 1.6 * IN, 8); a.cyl(x, YF + 8 * IN, mz + 6 * IN, mz + 7 * IN, 2.8 * IN, 8); a.box(x - 4 * IN, YF + 2 * IN, mz - 3 * IN, x + 4 * IN, YF + 8 * IN, mz + 3 * IN); }
  const lx = X0 + 6 * IN; for (const s of [-1, 1]) a.tube([[lx + s * 7 * IN, YF + 4 * IN, Z0 + bh], [lx + s * 7 * IN, YF + 11 * IN, Z0 + bh + th * 0.82]], [0.6 * IN, 0.6 * IN], 5);
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + 2 * IN, YF + 10 * IN, x1, YB - 10 * IN); a.rect(x1 + 2 * IN, YF + 14 * IN, X1 - 2 * IN, YB - 14 * IN, 'EQUIP-DETAIL'); for (let i = 1; i < nc; i++) a.line(X0 + 2 * IN + ew * i / nc, YF + 10 * IN, X0 + 2 * IN + ew * i / nc, YB - 10 * IN, 'EQUIP-DETAIL');
  a.log(`Added the skid, the ${nc}-compartment tank with lids and partition weirs, agitator motors with gearboxes on bridges, the walkway with handrails, the front suction manifold with valves, the ladder and the shale shaker with its box and tilted screen deck at the end (plan and 3D).`);
}
/** a glycol dehydrator: a tall contactor tower on a skirt, a reboiler kettle with firetube and still column, a pump box, on a skid */
function dehy(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bh = 6 * IN, tr = D * 0.17, tx = X0 + W * 0.2, tz1 = Z1 - 4 * IN;
  skidFrame(a, X0, X1, YF, YB, Z0, bh, 6, 4 * IN);
  a.cyl(tx, cy, Z0 + bh, Z0 + bh + 12 * IN, tr * 1.04, 22); a.cyl(tx, cy, Z0 + bh + 12 * IN, tz1 - tr * 0.3, tr, 24); a.ell(tx, cy, tz1 - tr * 0.3, tr, tr, tr * 0.34, 20, 6); for (const f of [0.3, 0.55, 0.8]) { const z = Z0 + bh + (tz1 - Z0 - bh) * f; a.cyl(tx, cy, z, z + 1 * IN, tr + 0.7 * IN, 24); }
  const nr = tr * 0.3; a.cyl(tx, cy, tz1 - tr * 0.1, Z1, nr, 12); flange(a, 'z', tx, cy, Z1, 1, nr * 1.8, 1.2 * IN, nr * 0.8, 8, nr * 1.4, 0.7 * IN, 0, true);
  nozz(a, 'y', tx + tr * 0.4, Z0 + bh + 26 * IN, cy - tr + 0.5 * IN, cy - tr - 6 * IN, nr * 0.8, 1.8, 1.2 * IN); nozz(a, 'x', cy, Z0 + bh + (tz1 - Z0 - bh) * 0.68, tx + tr - 0.5 * IN, tx + tr + 6 * IN, nr * 0.7, 1.8, 1.2 * IN);
  a.ycyl(cy + tr, cy + tr + 3 * IN, tx, Z0 + bh + (tz1 - Z0 - bh) * 0.35, 8 * IN, 16); a.ycyl(cy + tr + 3 * IN, cy + tr + 4.2 * IN, tx, Z0 + bh + (tz1 - Z0 - bh) * 0.35, 9.2 * IN, 16);
  const rr = D * 0.2, rx0 = X0 + W * 0.42, rx1 = X0 + W * 0.74, rz = Z0 + bh + 14 * IN + rr; for (const f of [0.15, 0.85]) { const x = rx0 + (rx1 - rx0) * f; a.box(x - 3 * IN, cy - rr * 0.8, Z0 + bh, x + 3 * IN, cy + rr * 0.8, rz - rr * 0.4); a.box(x - 4 * IN, cy - rr * 0.9, Z0 + bh, x + 4 * IN, cy + rr * 0.9, Z0 + bh + 1 * IN); }
  a.xcyl(rx0, rx1, cy, rz, rr, 22); a.ell(rx0, cy, rz, rr * 0.3, rr, rr, 14, 6); a.ell(rx1, cy, rz, rr * 0.3, rr, rr, 14, 6); a.xcyl(rx0 - rr * 0.1, rx0 + rr * 0.5, cy, rz + rr * 0.0, rr * 0.5, 16); a.xcyl(rx0 - rr * 0.2, rx0 - rr * 0.1, cy, rz, rr * 0.58, 16);
  const sx = (rx0 + rx1) / 2, sr = rr * 0.42; a.cyl(sx, cy, rz + rr * 0.6, rz + rr + (H * 0.34), sr, 16); a.ell(sx, cy, rz + rr + H * 0.34, sr, sr, sr * 0.4, 12, 4); a.cyl(rx0 + rr * 0.05, cy, rz + rr * 0.4, rz + rr + 40 * IN, rr * 0.26, 14); a.cone(rx0 + rr * 0.05, cy, rz + rr + 40 * IN, rz + rr + 48 * IN, rr * 0.3, rr * 0.2, 14);
  a.tube([[tx + tr, cy, Z0 + bh + 90 * IN], [rx0 - 8 * IN, cy, Z0 + bh + 90 * IN], [rx0 - 8 * IN, cy, rz + rr * 0.1]], [1.4 * IN, 1.4 * IN, 1.4 * IN], 8); a.tube([[tx + tr * 0.4, cy - tr, Z0 + bh + 26 * IN], [tx + tr * 0.4, cy - tr - 14 * IN, Z0 + bh + 14 * IN]], [1.4 * IN, 1.4 * IN], 8);
  a.box(X1 - 32 * IN, YF + 10 * IN, Z0 + bh, X1 - 8 * IN, YF + 10 * IN + 22 * IN, Z0 + bh + 26 * IN); a.box(X1 - 31 * IN, YF + 9.6 * IN, Z0 + bh + 6 * IN, X1 - 9 * IN, YF + 10 * IN, Z0 + bh + 22 * IN); a.box(X1 - 28 * IN, YB - 28 * IN, Z0 + bh, X1 - 8 * IN, YB - 10 * IN, Z0 + bh + 30 * IN); a.cyl(X1 - 18 * IN, YB - 19 * IN, Z0 + bh + 30 * IN, Z0 + bh + 40 * IN, 3 * IN, 12);
  a.outline('EQUIP-HIDDEN'); a.circ(tx, cy, tr); a.rect(rx0, cy - rr, rx1, cy + rr, 'EQUIP-DETAIL'); a.circ(sx, cy, sr, 'EQUIP-DETAIL'); a.rect(X1 - 32 * IN, YF + 10 * IN, X1 - 8 * IN, YF + 32 * IN, 'EQUIP-DETAIL');
  a.log('Added the channel skid, the contactor tower on a skirt with its dished top, gas outlet, inlet and glycol nozzles with flanges and a manway, the reboiler kettle with firetube housing and a still column with stack, the connecting lines, the pump box and the control box (plan and 3D).');
}
/** a pipeline block valve station: a large gate valve with gearbox and handwheel, two pipe runs with flanges, a bypass, a blowdown riser and vent stack, a pad and sign post */
function blockValve(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pr = v.nps * IN / 2 * 1.12, pz = Z0 + 18 * IN + pr, pad = 6 * IN;
  a.box(X0, YF, Z0, X1, YB, Z0 + pad * 0.5); 
  const x0 = X0 + 2 * IN, x1 = X1 - 2 * IN; a.xcyl(x0, x1, cy, pz, pr, 22);
  for (const f of [0.2, 0.8]) { const x = x0 + (x1 - x0) * f; a.box(x - 4 * IN, cy - pr * 1.1, Z0 + pad * 0.5, x + 4 * IN, cy + pr * 1.1, Z0 + pad * 0.5 + 6 * IN); a.prism([[x - 3 * IN, cy - pr * 0.8], [x + 3 * IN, cy - pr * 0.8], [x + 3 * IN, cy + pr * 0.8], [x - 3 * IN, cy + pr * 0.8]], Z0 + pad * 0.5 + 6 * IN, pz - pr * 0.4); }
  const vx = cx, vr = pr * 1.4; for (const s of [-1, 1]) { flange(a, 'x', cy, pz, vx + s * vr * 1.2, -s, pr * 1.5, 2.2 * IN, pr * 0.8, 12, pr * 1.28, 1.4 * IN, 0, true); }
  a.xcyl(vx - vr * 1.2, vx + vr * 1.2, cy, pz, pr * 1.2, 22); a.cyl(vx, cy, pz, pz + vr * 1.1, pr * 1.3, 22); a.ell(vx, cy, pz + vr * 1.1, pr * 1.3, pr * 1.3, pr * 0.3, 16, 5); a.cyl(vx, cy, pz + vr * 1.1, pz + vr * 1.4, pr * 0.55, 14);
  const gz = pz + vr * 1.4; a.box(vx - pr * 0.8, cy - pr * 0.6, gz, vx + pr * 0.8, cy + pr * 0.6, gz + pr * 1.2); a.xcyl(vx + pr * 0.8, vx + pr * 1.4, cy, gz + pr * 0.6, pr * 0.2, 8); handwheel(a, vx + pr * 1.4, cy, gz + pr * 0.6, pr * 0.6, 3, 5); a.cyl(vx, cy, gz + pr * 1.2, gz + pr * 2.0, pr * 0.14, 8); a.box(vx - pr * 0.3, cy - pr * 0.1, gz + pr * 1.8, vx + pr * 0.3, cy + pr * 0.1, gz + pr * 2.1);
  for (const f of [0.08, 0.92]) flange(a, 'x', cy, pz, x0 + (x1 - x0) * f, f < 0.5 ? 1 : -1, pr * 1.45, 2 * IN, pr * 0.85, 12, pr * 1.25, 1.2 * IN, 0, false);
  const br = pr * 0.28, by = cy - pr * 2.0; a.tube([[x0 + (x1 - x0) * 0.2, cy, pz - pr * 0.9], [x0 + (x1 - x0) * 0.2, by, pz - pr * 0.9], [x1 - (x1 - x0) * 0.2, by, pz - pr * 0.9], [x1 - (x1 - x0) * 0.2, cy, pz - pr * 0.9]], [br, br, br, br], 10); a.cyl(cx, by, Z0 + pad * 0.5, Z0 + pad * 0.5 + 0.1, 0.1, 3);
  a.cyl(cx, by, pz - pr * 0.9, pz - pr * 0.9 + br * 3, br * 1.6, 12); handwheel(a, cx, by, pz - pr * 0.9 + br * 4, br * 2, 3, 4);
  const bd = x0 + (x1 - x0) * 0.82, bz2 = pz + pr; a.cyl(bd, cy, pz + pr * 0.8, bz2 + 30 * IN, br * 1.1, 10); a.cyl(bd, cy, bz2 + 10 * IN, bz2 + 16 * IN, br * 1.9, 12); handwheel(a, bd, cy, bz2 + 20 * IN, br * 2.2, 2, 4); a.cyl(bd, cy, bz2 + 30 * IN, bz2 + 80 * IN, br * 1.3, 12); a.cone(bd, cy, bz2 + 80 * IN, bz2 + 88 * IN, br * 1.8, br * 0.8, 12);
  a.cyl(X0 + 6 * IN, YF + 6 * IN, Z0 + pad * 0.5, Z0 + 50 * IN, 1.4 * IN, 8); a.box(X0 + 6 * IN - 8 * IN, YF + 5 * IN, Z0 + 38 * IN, X0 + 6 * IN + 8 * IN, YF + 5.6 * IN, Z0 + 50 * IN);
  a.outline('EQUIP-HIDDEN'); a.rect(x0, cy - pr, x1, cy + pr); a.rect(vx - vr * 1.2, cy - pr * 1.3, vx + vr * 1.2, cy + pr * 1.3, 'EQUIP-DETAIL'); a.line(x0 + (x1 - x0) * 0.2, by, x1 - (x1 - x0) * 0.2, by, 'EQUIP-DETAIL');
  a.log(`Added the pad, the ${v.nps} in line pipe on two saddles with end flanges, the flanged gate valve with its bonnet, gearbox and handwheel, a bypass line with a small valve, the blowdown riser with a valve and a vent stack, and the marker sign (plan and 3D).`);
}
/** a gas pressure regulating skid: inlet and outlet headers, a filter vessel, two regulator runs with valves, vent stack and gauges */
function regSkid(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bh = 6 * IN, pr = v.nps * IN / 2 * 1.15, pz = Z0 + bh + 18 * IN, ys = [YF + D * 0.28, YF + D * 0.62];
  skidFrame(a, X0, X1, YF, YB, Z0, bh, 6, 4 * IN);
  a.xcyl(X0 + 4 * IN, X0 + W * 0.18, cy, pz, pr * 1.2, 18); nozz(a, 'x', cy, pz, X0 + 4 * IN, X0 - 0.01, pr * 1.2, 1.7, 1.6 * IN);
  const fx = X0 + W * 0.26, fr = D * 0.15; a.cyl(fx, cy, Z0 + bh, Z0 + bh + 34 * IN, fr, 20); a.ell(fx, cy, Z0 + bh + 34 * IN, fr, fr, fr * 0.4, 14, 5); a.cyl(fx, cy, Z0 + bh + 34 * IN + fr * 0.2, Z0 + bh + 34 * IN + fr * 0.5, fr * 0.3, 10); a.cyl(fx, cy, Z0 + bh, Z0 + bh + 5 * IN, fr * 1.2, 20); a.ycyl(cy - fr - 2 * IN, cy - fr, fx, Z0 + bh + 14 * IN, 3 * IN, 10);
  a.tube([[X0 + W * 0.18, cy, pz], [fx - fr, cy, pz]], [pr, pr], 12); a.tube([[fx + fr, cy, pz], [X0 + W * 0.36, cy, pz]], [pr, pr], 12);
  const hx = X0 + W * 0.36; a.cyl(hx, cy, pz - pr, pz + pr * 0.01, pr * 1.0, 12); a.ycyl(ys[0], ys[1], hx, pz, pr, 14);
  for (const y of ys) { const x0 = hx, xr = X0 + W * 0.84; a.xcyl(x0, xr, y, pz, pr * 0.8, 14);
    for (const [f, kind] of [[0.2, 'v'], [0.5, 'r'], [0.8, 'v']]) { const x = x0 + (xr - x0) * f; if (kind === 'v') { a.cyl(x, y, pz, pz + pr * 1.4, pr * 1.1, 14); a.cyl(x, y, pz + pr * 1.4, pz + pr * 2.2, pr * 0.2, 8); handwheel(a, x, y, pz + pr * 2.4, pr * 0.9, 3, 4); } else { a.cyl(x, y, pz, pz + pr * 1.0, pr * 1.1, 14); a.cyl(x, y, pz + pr * 1.0, pz + pr * 1.7, pr * 1.9, 20); a.cone(x, y, pz + pr * 1.7, pz + pr * 2.1, pr * 1.9, pr * 1.2, 20); a.cyl(x, y, pz + pr * 2.1, pz + pr * 2.4, pr * 0.4, 8); a.tube([[x + pr * 1.5, y, pz + pr * 1.2], [x + pr * 2.4, y, pz + pr * 0.2], [x + pr * 2.4, y, pz - pr * 0.6]], [0.6 * IN, 0.6 * IN, 0.6 * IN], 6); } }
    a.circ(x0 + (xr - x0) * 0.5, y, pr * 1.9, 'EQUIP-DETAIL'); }
  const ox = X0 + W * 0.84; a.ycyl(ys[0], ys[1], ox, pz, pr, 14); a.xcyl(ox, X1 - 4 * IN, cy, pz, pr * 1.2, 18); nozz(a, 'x', cy, pz, X1 - 4 * IN, X1 - 0.01, pr * 1.2, 1.7, 1.6 * IN);
  a.cyl(ox - 12 * IN, YB - 8 * IN, Z0 + bh, Z0 + bh + 60 * IN, pr * 0.6, 12); a.cone(ox - 12 * IN, YB - 8 * IN, Z0 + bh + 60 * IN, Z0 + bh + 66 * IN, pr * 0.9, pr * 0.4, 12); a.tube([[ox, ys[1], pz + pr], [ox - 12 * IN, YB - 8 * IN, pz + pr]], [pr * 0.4, pr * 0.4], 8);
  for (const x of [hx + pr * 3, ox - pr * 3]) gauge(a, x, cy - 6 * IN, pz + pr * 3, 28);
  a.outline('EQUIP-HIDDEN'); a.circ(fx, cy, fr, 'EQUIP-DETAIL'); for (const y of ys) a.rect(hx, y - pr * 0.8, X0 + W * 0.84, y + pr * 0.8, 'EQUIP');
  a.log(`Added the channel skid, the flanged inlet and outlet headers for ${v.nps} in line, the filter vessel with a quick-opening closure, two parallel runs each with block valves and a diaphragm regulator, the relief vent stack and the gauges (plan and 3D).`);
}
/** a reciprocating gas compressor package: crankcase with in-line cylinders and distance pieces, a motor, coolers, a scrubber, on a skid */
function compressor(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bh = 10 * IN, n = v.cyl, cr = D * 0.2, cz = Z0 + bh + cr + 10 * IN;
  skidFrame(a, X0, X1, YF, YB, Z0, bh, 7, 5 * IN);
  const mx1 = X0 + W * 0.26; motor(a, X0 + 6 * IN, mx1, cy, cz, cr * 1.1); a.xcyl(mx1 + cr * 0.6, mx1 + cr * 1.6, cy, cz, cr * 0.2, 10); a.box(mx1 + cr * 0.7, cy - cr * 0.7, cz - cr * 0.7, mx1 + cr * 1.5, cy + cr * 0.7, cz + cr * 0.7);
  const fx0 = mx1 + cr * 1.8, fx1 = fx0 + n * 12 * IN + 6 * IN; a.box(fx0, cy - cr * 0.9, Z0 + bh + 2 * IN, fx1, cy + cr * 0.9, cz + cr * 0.8); a.box(fx0 + 2 * IN, cy - cr * 0.95, cz + cr * 0.8, fx1 - 2 * IN, cy + cr * 0.95, cz + cr * 1.0); for (let k = 0; k < 4; k++) a.box(fx0 + 3 * IN + k * (fx1 - fx0 - 8 * IN) / 3, cy - cr * 0.9 - 0.5 * IN, cz - cr * 0.6, fx0 + 5 * IN + k * (fx1 - fx0 - 8 * IN) / 3, cy - cr * 0.9, cz + cr * 0.6);
  for (let i = 0; i < n; i++) { const x = fx0 + 6 * IN + i * 12 * IN, side = i % 2 ? 1 : -1; const yc = cy + side * cr * 1.5; a.ycyl(side < 0 ? cy - cr * 0.9 - 4 * IN * 0 : cy + cr * 0.9, side < 0 ? yc - cr * 0.6 : yc + cr * 0.6, x, cz, cr * 0.42, 14); const cy0 = side < 0 ? cy - cr * 0.9 : cy + cr * 0.9, cy1 = side < 0 ? cy - D * 0.3 : cy + D * 0.3; a.ycyl(m.min(cy0, cy1), m.max(cy0, cy1), x, cz, cr * 0.38, 16); a.ycyl(side < 0 ? cy1 - 2 * IN : cy1, side < 0 ? cy1 : cy1 + 2 * IN, x, cz, cr * 0.46, 16); a.box(x - cr * 0.32, side < 0 ? cy1 - 12 * IN : cy1 + 0, cz + cr * 0.0, x + cr * 0.32, side < 0 ? cy1 : cy1 + 12 * IN, cz + cr * 0.0 + 0.1); a.cyl(x, side < 0 ? cy1 - 3 * IN : cy1 + 3 * IN, cz + cr * 0.36, cz + cr * 0.36 + 10 * IN, cr * 0.17, 10); a.cyl(x, side < 0 ? cy1 - 3 * IN : cy1 + 3 * IN, cz - cr * 0.36 - 10 * IN, cz - cr * 0.36, cr * 0.17, 10); }
  const cx0 = X0 + W * 0.7, cw = W * 0.26; a.box(cx0, cy - D * 0.3, cz + cr * 1.4, X1 - 4 * IN, cy + D * 0.3, cz + cr * 1.4 + 14 * IN); for (let i = 0; i < 2; i++) { const fx = cx0 + cw * (i + 0.5) / 2; a.cyl(fx, cy, cz + cr * 1.4 + 14 * IN, cz + cr * 1.4 + 18 * IN, cw * 0.22, 18); fanXY(a, fx, cy, cz + cr * 1.4 + 19 * IN, cw * 0.2, 4, false); a.circ(fx, cy, cw * 0.22, 'EQUIP-DETAIL'); }
  for (const x of [cx0 + 6 * IN, X1 - 10 * IN]) for (const y of [cy - D * 0.3 + 3 * IN, cy + D * 0.3 - 3 * IN]) a.tube([[x, y, Z0 + bh], [x, y, cz + cr * 1.4]], [1.6 * IN, 1.6 * IN], 6);
  const sr = D * 0.12, sx = X0 + W * 0.58; a.cyl(sx, YB - sr - 6 * IN, Z0 + bh, Z0 + bh + 54 * IN, sr, 18); a.ell(sx, YB - sr - 6 * IN, Z0 + bh + 54 * IN, sr, sr, sr * 0.4, 14, 5); a.tube([[sx, YB - sr - 6 * IN, Z0 + bh + 30 * IN], [sx, cy + D * 0.3, Z0 + bh + 30 * IN]], [1.4 * IN, 1.4 * IN], 8);
  a.box(X0 + 6 * IN, YF + 4 * IN, Z0 + bh, X0 + 28 * IN, YF + 12 * IN, Z0 + bh + 50 * IN); a.box(X0 + 7 * IN, YF + 3.6 * IN, Z0 + bh + 22 * IN, X0 + 27 * IN, YF + 4 * IN, Z0 + bh + 46 * IN);
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + 6 * IN, cy - cr * 1.1, mx1, cy + cr * 1.1, 'EQUIP-DETAIL'); a.rect(fx0, cy - cr * 0.9, fx1, cy + cr * 0.9, 'EQUIP'); a.rect(cx0, cy - D * 0.3, X1 - 4 * IN, cy + D * 0.3, 'EQUIP-DETAIL'); a.circ(sx, YB - sr - 6 * IN, sr, 'EQUIP-DETAIL');
  a.log(`Added the channel skid, the ribbed electric motor with its coupling guard, the crankcase with ${n} in-line cylinders on alternate sides with distance pieces and valve covers, the roof cooler with two fans, the suction scrubber with a dished top and the control panel (plan and 3D).`);
}
/** an air-cooled heat exchanger: header boxes, tube bundle with fin slabs, fan rings with fans on top, legs, walkway and ladder */
function finFan(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, nb = v.bays, bw = (W - 20 * IN) / nb, lz = Z0 + 80 * IN, bt = 24 * IN, hy = 8 * IN;
  const legs = []; for (let i = 0; i <= nb; i++) legs.push(X0 + 10 * IN + i * bw); for (const x of legs) for (const y of [YF + 8 * IN, YB - 8 * IN]) { a.box(x - 5 * IN, y - 5 * IN, Z0, x + 5 * IN, y + 5 * IN, Z0 + 1 * IN); a.tube([[x, y, Z0 + 1 * IN], [x, y, lz]], [2 * IN, 2 * IN], 8); }
  for (const y of [YF + 8 * IN, YB - 8 * IN]) a.tube([[X0 + 10 * IN, y, Z0 + 30 * IN], [X1 - 10 * IN, y, Z0 + 30 * IN]], [1.2 * IN, 1.2 * IN], 5);
  for (let i = 0; i < nb; i++) { const xa = legs[i] + 1 * IN, xb = legs[i + 1] - 1 * IN; a.tube([[xa, YF + 8 * IN, lz - 2 * IN], [xb, YB - 8 * IN, Z0 + 30 * IN]], [1 * IN, 1 * IN], 4); a.tube([[xa, YB - 8 * IN, lz - 2 * IN], [xb, YF + 8 * IN, Z0 + 30 * IN]], [1 * IN, 1 * IN], 4); }
  a.box(X0 + 2 * IN, YF + 6 * IN, lz, X1 - 2 * IN, YB - 6 * IN, lz + 2 * IN); const hy0 = YF + 12 * IN, hy1 = YB - 12 * IN;
  for (const [ya, yb] of [[hy0, hy0 + hy], [hy1 - hy, hy1]]) { a.box(X0 + 4 * IN, ya, lz + 2 * IN, X1 - 4 * IN, yb, lz + 2 * IN + bt); for (let x = X0 + 10 * IN; x < X1 - 8 * IN; x += 16 * IN) { a.cyl(x, (ya + yb) / 2, lz + 2 * IN + bt, lz + 2 * IN + bt + 1.2 * IN, 2.4 * IN, 10); } }
  for (let z = lz + 4 * IN; z < lz + 2 * IN + bt - 2 * IN; z += 3.5 * IN) a.box(X0 + 4 * IN, hy0 + hy, z, X1 - 4 * IN, hy1 - hy, z + 1.2 * IN); a.box(X0 + 4 * IN, hy0 + hy, lz + 2 * IN, X1 - 4 * IN, hy1 - hy, lz + 3 * IN); a.box(X0 + 4 * IN, hy0 + hy, lz + bt - 1 * IN, X1 - 4 * IN, hy1 - hy, lz + bt + 2 * IN);
  nozz(a, 'x', hy0 + hy / 2, lz + 2 * IN + bt * 0.5, X0 + 4 * IN, X0 - 0.01, 3.4 * IN, 1.7, 1.2 * IN); nozz(a, 'x', hy1 - hy / 2, lz + 2 * IN + bt * 0.5, X1 - 4 * IN, X1 - 0.01, 3.4 * IN, 1.7, 1.2 * IN);
  const fz = lz + 2 * IN + bt + 6 * IN, fr = m.min(bw, hy1 - hy0) * 0.44; for (let i = 0; i < nb; i++) { const x = legs[i] + bw / 2; a.box(x - fr * 1.05, hy0, lz + 2 * IN + bt, x + fr * 1.05, hy1, fz); a.cone(x, cy, fz, fz + 22 * IN, fr * 1.25, fr, 24); a.cyl(x, cy, fz + 22 * IN, fz + 28 * IN, fr * 1.02, 24); a.circ(x, cy, fr, 'EQUIP-DETAIL'); fanXY(a, x, cy, fz + 10 * IN, fr * 0.9, 5, false); a.box(x - 10 * IN, cy - 1 * IN, fz + 6 * IN, x + 10 * IN, cy + 1 * IN, fz + 8 * IN); a.box(x - 5 * IN, cy - 5 * IN, fz + 2 * IN, x + 5 * IN, cy + 5 * IN, fz + 6 * IN); }
  ladderX(a, YF + 3 * IN, X0 + 14 * IN, Z0, lz, 16 * IN, 7); rail(a, X0 + 4 * IN, YF + 6 * IN, X1 - 4 * IN, YF + 6 * IN, lz + 2 * IN, lz + 2 * IN + 36 * IN, 8, nb + 2);
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + 4 * IN, hy0, X1 - 4 * IN, hy1); for (let i = 0; i < nb; i++) a.circ(legs[i] + bw / 2, cy, fr, 'EQUIP-DETAIL'); for (const x of legs) for (const y of [YF + 8 * IN, YB - 8 * IN]) a.circ(x, y, 2 * IN, 'EQUIP-DETAIL');
  a.log(`Added the braced legs, the two header boxes with plugs and flanged nozzles, the finned tube bundle with end plates, ${nb} fan bay${nb > 1 ? 's' : ''} with fan stacks, blades and guard hubs, the front walkway rail and a ladder (plan and 3D).`);
}

// ------------------------------------------------------------------------------------------ families: oil and gas
const O = [
  fam({ cat: 'energy/oilgas', title: 'Generic vertical gas scrubber vessel',
    desc: (v) => `Vertical scrubber vessel, ${v.dia} in diameter, on a skirt with base ring and anchor chairs: dished heads, top gas outlet, a tangential inlet and a liquid outlet with flanges, manway, level gauge column, relief valve and a side ladder.`,
    vs: [[24, 100], [36, 128], [48, 156], [60, 186]].map(([dia, h]) => [`${dia} in by ${h / 12 | 0} ft ${h % 12 ? ((h % 12)) + ' in ' : ''}tall`.replace(' tall', ''), dia * 1.28 + 36, dia * 1.28 + 40, h, 0, { dia }]),
    build: (a, v) => vertVessel(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic horizontal bullet gas tank',
    desc: (v) => `Horizontal bullet storage tank, ${v.dia} in diameter, with hemispherical heads on two saddles: a top manway with bolt ring, a valve cluster with relief, gauge and filling stubs and a handrail, an end ladder, a level column and a bottom drain with flange.`,
    vs: [[60, 300], [96, 480], [120, 720]].map(([dia, w]) => [`${dia} in by ${w / 12} ft`, w, dia + 30, dia + 78, 0, { dia }]),
    build: (a, v) => bullet(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic spherical pressure storage tank',
    desc: (v) => `Spherical storage tank, ${v.dia / 12} ft diameter, on eight braced columns with base plates: an equator band, a top platform with manway and relief stack, a spiral stair with handrail up the side and a bottom drain stub.`,
    vs: [[240, 20], [360, 30], [540, 45]].map(([d, ft]) => [`${ft} ft diameter`, d * 1.8 + 80, d * 1.8 + 80, d * 1.0 + 210, 0, { dia: d }]),
    build: (a, v) => sphere(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic tank truck loading rack',
    desc: (v) => `Tank truck loading rack with ${v.arms} loading arms: columns with base plates, an elevated deck with handrail, a canopy roof, an arm per bay with riser, swivel elbows, drop tube and vapour hose, meter skids and an access stair.`,
    vs: [[2, 192], [3, 288], [4, 384]].map(([n, w]) => [`${n} loading arms`, w, 150, 200, 0, { arms: n }]),
    build: (a, v) => loadRack(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic blowout preventer stack',
    desc: (v) => `Blowout preventer stack with ${v.rams} ram preventer${v.rams > 1 ? 's' : ''} and an annular unit on a base frame: side bonnets with operating cylinders and handwheel locks, a base spool with flange, choke and kill outlets with valves and a dished annular top.`,
    vs: [[1, 40, 36, 122], [2, 44, 40, 158], [3, 48, 44, 196]].map(([r, w, d, h]) => [`${r} ram${r > 1 ? 's' : ''} and annular`, w * 4.6, d * 1.4, h, 0, { rams: r }]),
    build: (a, v) => bop(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic land drilling rig',
    desc: 'Land drilling rig: a two-box substructure with braces, a drill floor with rails, a four-legged tapered lattice mast, a crown block with sheaves, a traveling block with hook and bail, a doghouse and an access stair.',
    vs: [['80 ft mast, shallow well', 960, 300, 540, 0, { floor: 96 }], ['110 ft mast, medium well', 1320, 360, 700, 0, { floor: 132 }], ['140 ft mast, deep well', 1680, 420, 860, 0, { floor: 180 }]].map(([l, h, w, d, z, p]) => [l, w * 1.4, d * 0.7, h, z, p]),
    build: (a, v) => rig(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic drilling mud tank with shaker',
    desc: (v) => `Drilling mud tank with ${v.cmp} compartments on a skid: lids and partition weirs, agitator motors with gearboxes on bridges, a handrailed walkway, a suction manifold with valves, a ladder and a shale shaker with box and tilted screen deck at the end.`,
    vs: [[3, 300], [4, 400], [6, 540]].map(([c, w]) => [`${c} compartments, ${w / 12} ft`, w, 100, 112, 0, { cmp: c }]),
    build: (a, v) => mudTank(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic glycol gas dehydrator skid',
    desc: 'Glycol dehydrator skid: a tall contactor tower on a skirt with dished top, gas outlet, inlet and glycol nozzles with flanges and a manway, a reboiler kettle with firetube housing and a still column with stack, connecting lines, a pump box and a control box.',
    vs: [['small, 10 ft skid', 120, 60, 240], ['medium, 14 ft skid', 168, 72, 300], ['large, 20 ft skid', 240, 90, 360]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: (a, v) => dehy(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic pipeline block valve station',
    desc: (v) => `Pipeline block valve station for ${v.nps} in line: a pad with the pipe on saddles and end flanges, a flanged gate valve with bonnet, gearbox and handwheel, a bypass with a small valve, a blowdown riser with a valve and a vent stack and a marker sign.`,
    vs: [[8, 144, 72, 120], [16, 192, 96, 148], [30, 264, 130, 190]].map(([n, w, d, h]) => [`${n} in line`, w, d, h, 0, { nps: n }]),
    build: (a, v) => blockValve(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic gas pressure regulating skid',
    desc: (v) => `Gas pressure regulating skid for ${v.nps} in line on a channel base: flanged inlet and outlet headers, a filter vessel with quick-opening closure, two parallel runs each with block valves and a diaphragm regulator, a relief vent stack and gauges.`,
    vs: [[4, 120, 60, 110], [8, 168, 78, 130], [12, 216, 96, 150]].map(([n, w, d, h]) => [`${n} in line, ${w / 12} ft`, w, d, h, 0, { nps: n }]),
    build: (a, v) => regSkid(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic reciprocating gas compressor package',
    desc: (v) => `Gas compressor package on a channel skid: a ribbed electric motor with coupling guard, a crankcase with ${v.cyl} in-line cylinders on alternate sides with distance pieces and valve covers, a roof cooler with two fans, a suction scrubber and a control panel.`,
    vs: [[2, 180, 84, 96], [4, 240, 96, 106], [6, 300, 108, 118]].map(([c, w, d, h]) => [`${c} cylinders, ${w / 12} ft`, w, d, h, 0, { cyl: c }]),
    build: (a, v) => compressor(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic air-cooled heat exchanger',
    desc: (v) => `Air-cooled heat exchanger of ${v.bays} fan bay${v.bays > 1 ? 's' : ''} on braced legs: two header boxes with plugs and flanged nozzles, a finned tube bundle, fan stacks with blades and hubs, a front walkway rail and a ladder.`,
    vs: [[1, 120, 96, 170], [2, 216, 96, 170], [3, 312, 96, 170]].map(([b, w, d, h]) => [`${b} fan bay${b > 1 ? 's' : ''}, ${w / 12} ft`, w, d, h, 0, { bays: b }]),
    build: (a, v) => finFan(a, v) }),
];
const FAMS = [...G, ...R, ...Dst, ...O];
export default FAMS;

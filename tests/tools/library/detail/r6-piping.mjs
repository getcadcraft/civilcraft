/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, piping: fittings, valves, supports, spools and skids. Original geometry by type and size class; no maker, model or standard. */
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
/** a pressure gauge on a short stem facing the front */
function gauge(a, x, y, z, r = 50) { a.ycyl(y - 16, y, x, z, r, 12); a.ycyl(y, y + 30, x, z, r * 0.2, 6); }

// nominal pipe size tables (inches): outside diameter, and flange [outside diameter, thickness, bolts, bolt circle, bolt diameter]
const OD = { 1: 1.315, 2: 2.375, 3: 3.5, 4: 4.5, 6: 6.625, 8: 8.625, 10: 10.75, 12: 12.75, 16: 16, 20: 20, 24: 24 };
const FLG = { 1: [4.25, 0.5, 4, 3.12, 0.5], 2: [6, 0.75, 4, 4.75, 0.62], 3: [7.5, 0.94, 4, 6, 0.62], 4: [9, 0.94, 8, 7.5, 0.62], 6: [11, 1, 8, 9.5, 0.75], 8: [13.5, 1.12, 8, 11.75, 0.75], 10: [16, 1.19, 12, 14.25, 0.88], 12: [19, 1.25, 12, 17, 0.88], 16: [23.5, 1.44, 16, 21.25, 1], 20: [27.5, 1.69, 20, 25, 1.12], 24: [32, 1.88, 20, 29.5, 1.25] };
const od = (n) => OD[n] * IN, fo = (n) => FLG[n][0] * IN / 2, ft = (n) => FLG[n][1] * IN;
/** a weld-neck style flange on pipe size n at the end w of an axis, plate toward dir; hub true adds the tapered neck */
function fl(a, n, ax, p, q, w, dir, hub = true) { const F = FLG[n]; flange(a, ax, p, q, w, dir, F[0] * IN / 2, F[1] * IN, OD[n] * IN / 2 * 0.86, F[2], F[3] * IN / 2, F[4] * IN, hub ? F[1] * IN * 1.7 : 0, true); }
/** a pipe along x */
function pipeX(a, x0, x1, y, z, n, seg = 20) { a.xcyl(x0, x1, y, z, OD[n] * IN / 2, seg); a.rect(x0, y - OD[n] * IN / 2, x1, y + OD[n] * IN / 2, 'EQUIP-DETAIL'); }
const hex = (a, x0, x1, y, z, r) => a.xcyl(x0, x1, y, z, r, 6);

/** a tube along a planar path with a fixed side axis u (no twist): pts [[x,y,z]...], one radius */
function sweep(a, pts, r, seg = 20, u = [0, 1, 0]) {
  const rings = pts.map((p, i) => {
    const pv = pts[m.max(0, i - 1)], nx = pts[m.min(pts.length - 1, i + 1)]; let t = [nx[0] - pv[0], nx[1] - pv[1], nx[2] - pv[2]]; const L = m.hypot(...t) || 1; t = t.map((c) => c / L);
    let w = [t[1] * u[2] - t[2] * u[1], t[2] * u[0] - t[0] * u[2], t[0] * u[1] - t[1] * u[0]]; const wl = m.hypot(...w) || 1; w = w.map((c) => c / wl);
    return Array.from({ length: seg }, (_, k) => { const th = (k / seg) * TAU, c = m.cos(th) * r, s2 = m.sin(th) * r; return [p[0] + u[0] * c + w[0] * s2, p[1] + u[1] * c + w[1] * s2, p[2] + u[2] * c + w[2] * s2]; });
  });
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < seg; k++) { const k2 = (k + 1) % seg; a.t.push([rings[i][k], rings[i + 1][k], rings[i + 1][k2]], [rings[i][k], rings[i + 1][k2], rings[i][k2]]); }
  for (const [ring, c, rev] of [[rings[0], pts[0], false], [rings[rings.length - 1], pts[pts.length - 1], true]]) for (let k = 0; k < seg; k++) a.t.push(rev ? [c, ring[k], ring[(k + 1) % seg]] : [c, ring[k], ring[(k + 1) % seg]]);
  return a;
}

// ------------------------------------------------------------------------------------------ fittings
/** dimensions of an elbow in inches: [width, depth, height] for size n, angle ang (deg), flanged flg */
function elbowDims(n, ang, flg) {
  const R = 1.5 * n, th = ang * m.PI / 180, tg = flg ? FLG[n][1] * 2.7 : 0, r0 = flg ? FLG[n][0] / 2 : OD[n] / 2;
  const ex = tg + R * m.sin(th) + tg * m.cos(th), ez = R * (1 - m.cos(th)) + tg * m.sin(th);
  return [m.ceil((ex + r0 * m.sin(th)) * 10) / 10 + 0.3, m.ceil(r0 * 20) / 10 + 0.1, m.ceil((r0 + 0.2 + ez + r0 * m.cos(th)) * 10) / 10 + 0.3];
}
/** an elbow standing in the X-Z plane: run in from the left, turning up by ang degrees; flanged or butt-weld */
function elbow(a, v) {
  const { X0, Z0, cy } = a, n = v.n, R = 1.5 * n * IN, th = v.ang * m.PI / 180, r = od(n) / 2, flg = v.fl, tg = flg ? FLG[n][1] * IN * 2.7 : 0, r0 = flg ? fo(n) : r, zc = Z0 + r0 + 5;
  const pts = [[X0 + 2, cy, zc], [X0 + tg, cy, zc]], cxc = X0 + tg, czc = zc + R;
  for (let k = 1; k <= 14; k++) { const f = (k / 14) * th; pts.push([cxc + R * m.sin(f), cy, czc - R * m.cos(f)]); }
  const last = pts[pts.length - 1]; pts.push([last[0] + tg * m.cos(th), cy, last[2] + tg * m.sin(th)]);
  sweep(a, pts, r, 22);
  const e = pts[pts.length - 1];
  if (flg) {
    fl(a, n, 'x', cy, zc, X0 + 2, 1);
    if (v.ang === 90) fl(a, n, 'z', e[0], cy, e[2], -1); else a.tube([[e[0] - m.cos(th) * ft(n), cy, e[2] - m.sin(th) * ft(n)], [e[0], cy, e[2]]], [fo(n), fo(n)], 24);
  } else { a.xcyl(X0 + 2, X0 + 2 + 0.2 * IN, cy, zc, r * 1.04, 22); a.tube([[e[0] - m.cos(th) * 0.2 * IN, cy, e[2] - m.sin(th) * 0.2 * IN], [e[0], cy, e[2]]], [r * 1.04, r * 1.04], 22); }
  a.outline(); a.line(X0, cy, e[0], cy, 'EQUIP-DETAIL'); a.circ(e[0], cy, r, 'EQUIP-DETAIL');
  a.log(`Added the ${v.ang} degree long-radius bend (1.5 pipe diameters) with ${flg ? 'flanges with bolts and weld necks' : 'bevelled weld ends'} (plan and 3D).`);
}
/** tee dimensions: run length (centre to end) per size */
const TEEM = { 2: 2.5, 3: 3.4, 4: 4.1, 6: 5.6, 8: 6.9, 10: 8.4, 12: 9.7, 16: 12, 20: 14.5 };
/** a butt-weld tee: a run along x, a branch of size nb rising from the centre; ends bevelled */
function tee(a, v) {
  const { X0, X1, Z0, cx, cy, W } = a, n = v.n, nb = v.nb ?? v.n, r = od(n) / 2, rb = od(nb) / 2, zc = Z0 + r + 5, hb = TEEM[n] * IN * (nb === n ? 1 : 0.9);
  a.xcyl(X0 + 2, X1 - 2, cy, zc, r, 22); a.cyl(cx, cy, zc, zc + hb, rb, 20);
  a.ell(cx, cy, zc, rb * 1.12, rb * 1.12, rb * 1.12, 16, 8);          // forged crotch
  for (const [x, s] of [[X0 + 2, 1], [X1 - 2, -1]]) a.xcyl(x, x + s * 0.2 * IN, cy, zc, r * 1.04, 22);
  a.cyl(cx, cy, zc + hb - 0.2 * IN, zc + hb, rb * 1.04, 20);
  a.outline(); a.circ(cx, cy, rb, 'EQUIP-DETAIL'); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
  a.log(`Added the run, the ${nb === n ? 'equal' : 'reduced'} branch with its forged crotch and bevelled weld ends (plan and 3D).`);
}
/** a reducer of size n down to nb, concentric or eccentric (flat on the bottom) */
function reducer(a, v) {
  const { X0, X1, Z0, cy } = a, r1 = od(v.n) / 2, r2 = od(v.nb) / 2, ecc = v.ecc, zc1 = Z0 + r1 + 5, zc2 = ecc ? zc1 - (r1 - r2) : zc1, cl = 0.12 * (X1 - X0), x0 = X0 + 2, x1 = X1 - 2;
  a.xcyl(x0, x0 + cl, cy, zc1, r1, 24); a.tube([[x0 + cl, cy, zc1], [x1 - cl, cy, zc2]], [r1, r2], 24); a.xcyl(x1 - cl, x1, cy, zc2, r2, 24);
  a.xcyl(x0, x0 + 0.2 * IN, cy, zc1, r1 * 1.04, 24); a.xcyl(x1 - 0.2 * IN, x1, cy, zc2, r2 * 1.04, 24);
  a.outline(); a.line(x0 + cl, cy - r1, x1 - cl, cy - r2, 'EQUIP-DETAIL'); a.line(x0 + cl, cy + r1, x1 - cl, cy + r2, 'EQUIP-DETAIL'); a.line(x0 + cl, cy - r1, x0 + cl, cy + r1, 'EQUIP-DETAIL'); a.line(x1 - cl, cy - r2, x1 - cl, cy + r2, 'EQUIP-DETAIL');
  a.log(`Added the large-end and small-end cylinders joined by a ${ecc ? 'flat-bottomed eccentric' : 'concentric'} taper with bevelled weld ends (plan and 3D).`);
}
/** a weld cap: a short cylinder with a dished end on the right */
function cap(a, v) {
  const { X0, X1, Z0, cy, W } = a, r = od(v.n) / 2, zc = Z0 + r + 5, cl = W * 0.45;
  a.xcyl(X0 + 2, X0 + cl, cy, zc, r, 24); a.ell(X0 + cl, cy, zc, W - cl - 2, r, r, 24, 10); a.xcyl(X0 + 2, X0 + 2 + 0.2 * IN, cy, zc, r * 1.04, 24);
  a.outline(); a.line(X0 + cl, cy - r, X0 + cl, cy + r, 'EQUIP-DETAIL'); a.ellp(X0 + cl, cy, W - cl, r, 'EQUIP-DETAIL');
  a.log('Added the straight skirt with a bevelled weld end and the elliptical dished head (plan and 3D).');
}
/** a weld-neck flange standing face-on with bolts and a short pipe stub behind */
function wnFlange(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, n = v.n, F = FLG[n], ro = F[0] * IN / 2, t = F[1] * IN, bd = F[4] * IN, zc = Z0 + ro;
  const y0 = YF + bd * 1.1;
  flange(a, 'y', cx, zc, y0, 1, ro, t, od(n) / 2 * 0.86, F[2], F[3] * IN / 2, bd, t * 1.7, false);
  if (v.blind) { a.ycyl(y0, y0 + t, cx, zc, od(n) / 2 * 0.9, 24); }
  a.ycyl(y0 + t * 2.7, YB, cx, zc, od(n) / 2, 24);
  a.rect(cx - ro, y0, cx + ro, y0 + t, 'EQUIP'); a.rect(cx - od(n) / 2, y0 + t, cx + od(n) / 2, YB, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
  a.log(`Added the face-on flange plate with ${F[2]} bolts and nuts on the bolt circle, the tapered weld neck and the pipe stub${v.blind ? ' and a closing disc' : ''} (plan and 3D).`);
}
/** a three-piece threaded union along x */
function union(a, v) {
  const { X0, X1, Z0, cy, W, D } = a, r = D / 2, zc = Z0 + r, p = v.pipe * IN;
  a.xcyl(X0, X0 + W * 0.28, cy, zc, p * 0.62, 18); a.xcyl(X1 - W * 0.28, X1, cy, zc, p * 0.62, 18);
  hex(a, X0 + W * 0.2, X0 + W * 0.36, cy, zc, r * 0.82); hex(a, X1 - W * 0.36, X1 - W * 0.2, cy, zc, r * 0.82);
  a.xcyl(X0 + W * 0.36, X0 + W * 0.44, cy, zc, r * 0.7, 18); a.xcyl(X1 - W * 0.44, X1 - W * 0.36, cy, zc, r * 0.7, 18);
  a.xcyl(X0 + W * 0.42, X1 - W * 0.42, cy, zc, r * 0.98, 6);
  for (let k = 0; k < 6; k++) { const x = X0 + W * 0.44 + k * W * 0.12 / 6 + 4; a.xcyl(x, x + 2, cy, zc, r * 1.0, 6); }
  a.outline(); a.rect(X0 + W * 0.42, cy - r, X1 - W * 0.42, cy + r, 'EQUIP-DETAIL'); a.line(X0 + W * 0.36, cy - r * 0.8, X0 + W * 0.36, cy + r * 0.8, 'EQUIP-DETAIL'); a.line(X1 - W * 0.36, cy - r * 0.8, X1 - W * 0.36, cy + r * 0.8, 'EQUIP-DETAIL');
  a.log('Added the two threaded tails with hex collars, the seat rings and the large hexagonal union nut (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ valves
/** the hand wheel, stem and yoke above a bonnet; the bonnet top is at zb, the wheel sits at the top of the body box */
function topWorks(a, cx, cy, zb, R, wr, yoke = true) {
  const Z1 = a.Z1, rim = m.max(5, wr * 0.07), zw = Z1 - rim * 2, zy = zw - rim * 4;
  a.cyl(cx, cy, zb - R * 0.1, zb + R * 0.2, R * 1.15, 20);                                         // bonnet flange
  if (yoke) { for (const s of [-1, 1]) a.tube([[cx + s * R * 0.7, cy, zb], [cx + s * R * 0.55, cy, zy]], [R * 0.22, R * 0.2], 8); a.box(cx - R * 0.8, cy - R * 0.4, zy - R * 0.2, cx + R * 0.8, cy + R * 0.4, zy + R * 0.2); }
  a.cyl(cx, cy, zb, zw, R * 0.17, 10); a.cyl(cx, cy, zy - R * 0.5, zy - R * 0.2 + R * 0.4, R * 0.34, 10);   // stem and gland
  handwheel(a, cx, cy, zw, wr, rim, 5); a.cyl(cx, cy, zw + rim, zw + rim * 2.4, R * 0.18, 6);
}
function gate(a, v) {
  const { X0, X1, Z0, cx, cy, W } = a, n = v.n, R = od(n) / 2, zc = Z0 + fo(n);
  a.xcyl(X0, X1, cy, zc, R * 1.05, 22); fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, zc, X1, -1);
  a.ell(cx, cy, zc, W * 0.3, R * 1.5, R * 1.55, 20, 10); a.cyl(cx, cy, zc, zc + R * 2.2, R * 1.0, 20);
  topWorks(a, cx, cy, zc + R * 2.2, R, fo(n) * 0.96);
  a.outline(); a.rect(cx - R * 1.5, cy - R * 1.5, cx + R * 1.5, cy + R * 1.5, 'EQUIP-DETAIL');
  a.log('Added the flanged body with bolted flanges, the bulged centre and bonnet, the yoke with rising stem and gland, and the hand wheel (plan and 3D).');
}
function globe(a, v) {
  const { X0, X1, Z0, cx, cy, W } = a, n = v.n, R = od(n) / 2, zc = Z0 + fo(n);
  a.xcyl(X0, X1, cy, zc, R * 1.05, 22); fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, zc, X1, -1);
  a.ell(cx, cy, zc + R * 0.2, W * 0.27, R * 1.95, R * 1.9, 22, 12); a.cyl(cx, cy, zc + R * 0.5, zc + R * 2.6, R * 1.0, 20); a.cyl(cx - W * 0.2, cy, zc, zc + R * 1.0, R * 0.55, 14);
  topWorks(a, cx, cy, zc + R * 2.6, R, fo(n) * 0.96);
  a.outline(); a.circ(cx, cy, R * 1.9, 'EQUIP-DETAIL');
  a.log('Added the flanged spherical body with a raised bonnet, the yoke with stem and gland, and the hand wheel (plan and 3D).');
}
function ball(a, v) {
  const { X0, Z0, cy } = a, n = v.n, ffm = v.ff * IN, X1 = X0 + ffm, cx = X0 + ffm / 2, W = ffm, R = od(n) / 2, zc = Z0 + fo(n);
  a.xcyl(X0, X1, cy, zc, R * 1.05, 22); fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, zc, X1, -1);
  a.xcyl(cx - W * 0.28, cx + W * 0.28, cy, zc, R * 1.35, 24); a.ell(cx, cy, zc, W * 0.2, R * 1.5, R * 1.5, 20, 10);
  a.xcyl(cx - W * 0.3, cx - W * 0.26, cy, zc, R * 1.42, 24); a.xcyl(cx + W * 0.26, cx + W * 0.3, cy, zc, R * 1.42, 24);
  const zn = zc + R * 1.5; a.cyl(cx, cy, zn - 5, zn + R * 0.8, R * 0.45, 12); a.box(cx - R * 0.35, cy - R * 0.35, zn + R * 0.8, cx + R * 0.35, cy + R * 0.35, zn + R * 1.05);
  const ll = R * 2.2 + 3 * IN, zl = zn + R * 1.05;           // lever with a grip sleeve and a stop plate
  a.box(cx - R * 0.5, cy - R * 0.22, zl, cx + ll * 0.86, cy + R * 0.22, zl + R * 0.28); a.xcyl(cx + ll * 0.5, cx + ll, cy, zl + R * 0.14, R * 0.3, 10); a.box(cx - R * 0.9, cy - R * 0.5, zl - R * 0.12, cx + R * 0.1, cy + R * 0.5, zl);
  a.outline(); a.rect(cx - R * 0.5, cy - R * 0.22, cx + ll, cy + R * 0.22, 'EQUIP-DETAIL'); a.rect(cx - W * 0.28, cy - R * 1.35, cx + W * 0.28, cy + R * 1.35, 'EQUIP-DETAIL');
  a.log('Added the flanged end pieces, the split ball body, the stem neck with stop plate and the lever with grip sleeve (plan and 3D).');
}
function butterfly(a, v) {
  const { X0, X1, Z0, cx, cy, W } = a, n = v.n, F = FLG[n], R = od(n) / 2, zc = Z0 + fo(n), st = F[1] * IN * 2.7 + 5 * IN, wt = (v.wt ?? (n * 0.18 + 1.4)) * IN, Rb = F[3] * IN / 2 + F[4] * IN * 0.9;
  a.xcyl(X0, cx - wt / 2, cy, zc, R, 22); a.xcyl(cx + wt / 2, X1, cy, zc, R, 22);
  fl(a, n, 'x', cy, zc, X0 + st - F[1] * IN * 2.7, 1); fl(a, n, 'x', cy, zc, X1 - st + F[1] * IN * 2.7, -1);
  ring(a, 'x', cy, zc, R * 0.78, Rb * 0.92, cx - wt / 2, cx + wt / 2, Rb * 0.92, 28); a.xcyl(cx - wt * 0.3, cx + wt * 0.3, cy, zc, R * 0.82, 24);
  for (let k = 0; k < F[2]; k++) { const th = (k / F[2]) * TAU + 0.2; cylA(a, 'x', cy + F[3] * IN / 2 * m.cos(th), zc + F[3] * IN / 2 * m.sin(th), X0 + st, X1 - st, F[4] * IN * 0.5, 6); }
  const zn = zc + Rb * 0.92; a.cyl(cx, cy, zn - 10, zn + R * 0.9, R * 0.3, 12); a.box(cx - R * 0.55, cy - R * 0.42, zn + R * 0.5, cx + R * 0.55, cy + R * 0.42, zn + R * 0.9);
  if (v.gear) { const gz = zn + R * 0.9, gh = R * 1.1; a.box(cx - R * 0.9, cy - R * 0.75, gz, cx + R * 0.9, cy + R * 0.75, gz + gh); a.cyl(cx, cy, gz + gh, gz + gh + R * 0.18, R * 0.26, 10); a.box(cx - R * 0.5, cy - R * 0.5, gz + gh, cx + R * 0.5, cy + R * 0.5, gz + gh + R * 0.18);
    const wr = R * 0.95; ring(a, 'y', cx, gz + gh * 0.5, wr * 0.88, wr, cy + R * 0.75 + R * 0.5, cy + R * 0.75 + R * 0.5 + 5, wr, 20); a.ycyl(cy + R * 0.75, cy + R * 0.75 + R * 0.5 + 5, cx, gz + gh * 0.5, R * 0.14, 8); a.tube([[cx - wr, cy + R * 1.3, gz + gh * 0.5], [cx + wr, cy + R * 1.3, gz + gh * 0.5]], [R * 0.06, R * 0.06], 5); a.tube([[cx, cy + R * 1.3, gz + gh * 0.5 - wr], [cx, cy + R * 1.3, gz + gh * 0.5 + wr]], [R * 0.06, R * 0.06], 5); }
  else { const ll = R * 2.2 + 2 * IN, zl = zn + R * 0.9; a.box(cx - R * 0.4, cy - R * 0.2, zl, cx + ll * 0.8, cy + R * 0.2, zl + R * 0.24); a.xcyl(cx + ll * 0.45, cx + ll, cy, zl + R * 0.12, R * 0.26, 10); a.box(cx - R * 0.6, cy - R * 0.9, zl - R * 0.1, cx + R * 0.6, cy + R * 0.9, zl); }
  a.outline(); a.rect(cx - wt / 2, cy - Rb, cx + wt / 2, cy + Rb, 'EQUIP');
  a.log(`Added the stub pipes with bolted flanges and long through-bolts, the lugged wafer body, the stem neck and ${v.gear ? 'the gear operator with its hand wheel' : 'the lever with grip sleeve and notched plate'} (plan and 3D).`);
}
function check(a, v) {
  const { X0, X1, Z0, cx, cy, W } = a, n = v.n, R = od(n) / 2, zc = Z0 + fo(n);
  a.xcyl(X0, X1, cy, zc, R * 1.05, 22); fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, zc, X1, -1);
  a.ell(cx, cy, zc, W * 0.3, m.min(R * 1.45, fo(n) * 0.98), m.min(R * 1.5, fo(n) * 0.98), 20, 10); a.ell(cx + W * 0.04, cy, zc + R * 0.9, W * 0.2, R * 1.3, R * 1.1, 18, 8);
  const zt = zc + R * 1.9; a.cyl(cx + W * 0.04, cy, zc + R * 0.9, zt, R * 1.2, 22); ring(a, 'z', cx + W * 0.04, cy, 0.01, R * 1.65, zt, zt + R * 0.28, R * 1.65, 24); a.cyl(cx + W * 0.04, cy, zt + R * 0.28, zt + R * 0.5, R * 0.9, 20);
  for (let k = 0; k < 8; k++) { const th = (k / 8) * TAU; a.cyl(cx + W * 0.04 + R * 1.4 * m.cos(th), cy + R * 1.4 * m.sin(th), zt + R * 0.28, zt + R * 0.5, R * 0.1, 6); }
  a.ycyl(cy - R * 1.6, cy - R * 1.25, cx - W * 0.12, zc + R * 0.5, R * 0.3, 10);               // hinge pin plug
  a.rect(cx + W * 0.04 - R * 1.65, cy - R * 1.65, cx + W * 0.04 + R * 1.65, cy + R * 1.65, 'EQUIP-DETAIL'); a.outline(); a.line(cx - W * 0.2, cy, cx + W * 0.1, cy, 'EQUIP-DETAIL');
  a.log('Added the flanged body, the bulged chamber with bolted cover and cover bolts, and the hinge-pin plug (plan and 3D).');
}
function relief(a, v) {
  const { X0, X1, YF, Z0, Z1, cx, cy, W } = a, ni = v.ni, no = v.no, Ri = od(ni) / 2, Ro = od(no) / 2, F = FLG[ni], zc = Z0 + F[1] * IN * 2.7 + 6 * IN, xi = X0 + fo(ni);
  fl(a, ni, 'z', xi, cy, Z0 + 2, 1); a.cyl(xi, cy, Z0 + 2, zc, Ri, 20); a.cyl(xi, cy, zc, zc + Ri * 1.3, Ri * 1.35, 20);
  const zo = zc + Ri * 0.6; a.xcyl(xi, X1 - FLG[no][1] * IN * 1.2, cy, zo, Ro, 20); fl(a, no, 'x', cy, zo, X1, -1);
  a.ell(xi, cy, zc + Ri * 0.5, Ri * 1.7, Ri * 1.7, Ri * 1.6, 18, 10);
  const bz0 = zc + Ri * 1.9, bz1 = Z1 - Ri * 1.6, br = m.max(Ri * 1.2, Ro * 0.78); a.cyl(xi, cy, zc + Ri * 1.2, bz0, br * 0.8, 20); a.cyl(xi, cy, bz0, bz1, br, 22); for (const f of [0.3, 0.55]) a.cyl(xi, cy, bz0 + (bz1 - bz0) * f - 6, bz0 + (bz1 - bz0) * f + 6, br * 1.06, 22);
  ring(a, 'z', xi, cy, 0.01, br * 1.12, bz1 - br * 0.12, bz1 + br * 0.12, br * 1.12, 22); a.cyl(xi, cy, bz1 + br * 0.12, Z1 - Ri * 0.5, br * 0.55, 6);
  a.cyl(xi, cy, Z1 - Ri * 0.5, Z1 - Ri * 0.3, br * 0.7, 8); a.tube([[xi, cy, Z1 - Ri * 0.4], [xi + br * 1.5, cy, Z1 - Ri * 0.5], [xi + br * 1.5, cy, Z1 - Ri * 0.9]], [br * 0.1, br * 0.1, br * 0.1], 5);
  a.circ(xi, cy, br, 'EQUIP-DETAIL'); a.outline(); a.circ(xi, cy, Ri * 1.7, 'EQUIP-DETAIL');
  a.log('Added the flanged inlet, the angle body, the flanged side outlet, the finned spring bonnet with adjusting cap and the lifting lever (plan and 3D).');
}
function control(a, v) {
  const { X0, Z0, Z1, cx, cy, W, D } = a, n = v.n, X1 = cx + v.ff * IN / 2, XL = cx - v.ff * IN / 2, R = od(n) / 2, zc = Z0 + fo(n);
  a.xcyl(XL, X1, cy, zc, R * 1.05, 22); fl(a, n, 'x', cy, zc, XL, 1); fl(a, n, 'x', cy, zc, X1, -1);
  a.ell(cx, cy, zc + R * 0.2, v.ff * IN * 0.27, R * 1.9, R * 1.8, 22, 12); a.cyl(cx, cy, zc + R * 0.5, zc + R * 2.4, R * 0.95, 20); a.cyl(cx, cy, zc + R * 2.4 - 6, zc + R * 2.4 + R * 0.3, R * 1.2, 20);
  const yb = zc + R * 2.7, zdi = Z1 - R * 3.2, dr = m.min(D / 2 - 3, R * 3.4);
  for (const s of [-1, 1]) a.tube([[cx + s * R * 0.8, cy, yb], [cx + s * R * 0.75, cy, zdi]], [R * 0.2, R * 0.18], 8);
  a.box(cx - R * 0.9, cy - R * 0.45, yb + (zdi - yb) * 0.4, cx + R * 0.9, cy + R * 0.45, yb + (zdi - yb) * 0.5); a.cyl(cx, cy, yb, zdi, R * 0.15, 8);       // stem and connector
  a.cyl(cx, cy, zdi, zdi + R * 0.5, dr * 0.95, 28); a.ell(cx, cy, zdi + R * 0.5, dr, dr, R * 0.9, 28, 8); ring(a, 'z', cx, cy, dr * 0.9, dr * 1.04, zdi + R * 0.5 - 8, zdi + R * 0.5 + 8, dr * 1.04, 28);
  for (let k = 0; k < 16; k++) { const th = (k / 16) * TAU; a.cyl(cx + dr * 0.97 * m.cos(th), cy + dr * 0.97 * m.sin(th), zdi + R * 0.5 - 12, zdi + R * 0.5 + 12, R * 0.07, 6); }
  a.cyl(cx, cy, zdi + R * 1.4, Z1 - R * 0.2, R * 0.22, 8); a.cyl(cx, cy, Z1 - R * 0.3, Z1, R * 0.34, 8);
  const px = cx + dr + R * 0.5; a.box(cx + R * 1.2, cy - R * 0.75 - 3, zdi - R * 0.3, cx + R * 2.4, cy + R * 0.75, zdi + R * 1.5); a.tube([[cx + R * 2.4, cy, zdi + R * 0.5], [cx + dr * 0.8, cy, zdi + R * 0.6]], [R * 0.08, R * 0.08], 5);
  a.outline(); a.circ(cx, cy, dr, 'EQUIP'); a.circ(cx, cy, dr * 0.9, 'EQUIP-DETAIL'); a.rect(cx + R * 1.2, cy - R * 0.75, cx + R * 2.4, cy + R * 0.75, 'EQUIP-DETAIL');
  a.log('Added the flanged globe body, the bonnet and yoke with stem connector, the round two-part diaphragm housing with rim bolts, the top stop and the positioner box with its tube (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ supports
/** an I-beam running along y: web, two flanges; section depth bd and flange width bw */
function ibeamY(a, x, y0, y1, z0, bd, bw) { a.box(x - bw / 2, y0, z0, x + bw / 2, y1, z0 + bd * 0.1); a.box(x - bw / 2, y0, z0 + bd * 0.9, x + bw / 2, y1, z0 + bd); a.box(x - bd * 0.04, y0, z0 + bd * 0.1, x + bd * 0.04, y1, z0 + bd * 0.9); }
function ibeamX(a, y, x0, x1, z0, bd, bw) { a.box(x0, y - bw / 2, z0, x1, y + bw / 2, z0 + bd * 0.1); a.box(x0, y - bw / 2, z0 + bd * 0.9, x1, y + bw / 2, z0 + bd); a.box(x0, y - bd * 0.04, z0 + bd * 0.1, x1, y + bd * 0.04, z0 + bd * 0.9); }
/** pipe shoe on a beam; guide variant adds guide stops either side */
function shoe(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = od(v.n) / 2, bd = v.bd * IN, sh = v.sh * IN, zp = Z0 + bd + sh + r;
  ibeamY(a, cx, YF, YB, Z0, bd, m.min(W * 0.7, 8 * IN + r * 0.8));
  pipeX(a, X0, X1, cy, zp, v.n, 24);
  const sw = r * 1.3; a.box(cx - W * 0.4, cy - sw / 2, Z0 + bd, cx + W * 0.4, cy + sw / 2, Z0 + bd + 6);        // slide plate
  a.box(cx - W * 0.36, cy - sw / 2, Z0 + bd + 6, cx + W * 0.36, cy + sw / 2, Z0 + bd + 6 + sh * 0.18);              // shoe base
  a.box(cx - W * 0.36, cy - 6, Z0 + bd + 6, cx + W * 0.36, cy + 6, zp - r * 0.7); for (const s of [-1, 1]) a.box(cx + s * W * 0.34 - 5, cy - sw / 2, Z0 + bd + 6, cx + s * W * 0.34 + 5, cy + sw / 2, zp - r * 0.5);
  a.box(cx - W * 0.36, cy - sw / 2, zp - r * 0.75, cx + W * 0.36, cy + sw / 2, zp - r * 0.65);
  if (v.guide) for (const s of [-1, 1]) { a.box(cx - W * 0.4, cy + s * (sw / 2 + 12) - 7, Z0 + bd, cx + W * 0.4, cy + s * (sw / 2 + 12) + 7, zp - r * 0.1); a.box(cx - W * 0.4, cy + s * (sw / 2 + 12) - 7 - s * 18, Z0 + bd, cx + W * 0.4, cy + s * (sw / 2 + 12) - 7, Z0 + bd + 10); }
  a.outline(); a.rect(cx - W * 0.36, cy - sw / 2, cx + W * 0.36, cy + sw / 2, 'EQUIP-DETAIL'); a.line(cx - W * 0.4, YF, cx - W * 0.4, YB, 'EQUIP-HIDDEN');
  a.log(v.guide ? 'Added the supporting beam, the welded shoe with slide plate and the two guide angles holding the pipe sideways (plan and 3D).' : 'Added the supporting beam, the welded T shoe with slide plate, web, stiffeners and the pipe on top (plan and 3D).');
}
function anchor(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = od(v.n) / 2, zp = Z0 + v.pl * IN + 5 * IN + r;
  const pl = v.pl * IN; a.box(X0, YF, Z0, X1, YB, Z0 + 25); for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const x = cx + sx * (W / 2 - 22 * 1.5 - 8), y = cy + sy * (D / 2 - 40); a.cyl(x, y, Z0 + 25, Z0 + 25 + 40, 12, 8); a.cyl(x, y, Z0 + 25, Z0 + 25 + 6, 20, 6); }
  pipeX(a, X0, X1, cy, zp, v.n, 24);
  for (const s of [-1, 1]) { const x = cx + s * r * 0.7; a.box(x - 6, cy - r * 1.2, Z0 + 25, x + 6, cy + r * 1.2, zp - r * 0.4); a.prism([[x - 6 + s * 0, cy - r * 1.2], [x + 6, cy - r * 1.2], [x + 6, cy + r * 1.2], [x - 6, cy + r * 1.2]], Z0 + 25, Z0 + 25 + 1); }
  a.tube([[cx - r * 1.35, cy - r * 1.35, zp + r * 0.1], [cx - r * 1.35, cy - r * 1.35, zp + r * 1.4], [cx + r * 1.35, cy - r * 1.35, zp + r * 1.4], [cx + r * 1.35, cy - r * 1.35, zp + r * 0.1]], [10, 10, 10, 10], 5);
  for (const sx of [-1, 1]) a.box(cx + sx * r * 0.7 - 8, cy - r * 1.4, zp - r * 0.2, cx + sx * r * 0.7 + 8, cy + r * 1.4, zp + r * 0.2);
  a.outline(); for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.circ(cx + sx * (W / 2 - 22 * 1.5 - 8), cy + sy * (D / 2 - 40), 12, 'EQUIP-DETAIL'); a.rect(cx - r * 0.7 - 6, cy - r * 1.2, cx + r * 0.7 + 6, cy + r * 1.2, 'EQUIP-DETAIL');
  a.log('Added the base plate with four anchor bolts, the two welded lug plates up to the pipe, the pipe and the restraining strap (plan and 3D).');
}
/** a clevis hanger: eye plate, rod with nuts, turnbuckle, a strap around the pipe with ears and bolt */
function clevis(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = od(v.n) / 2, rr = m.max(7, v.rod * IN / 2), zc = Z0 + r + rr * 2.4 + 4;
  pipeX(a, X0, X1, cy, zc, v.n, 24);
  ring(a, 'x', cy, zc, r + 2, r + rr * 2.2, cx - rr * 2, cx + rr * 2, r + rr * 2.2, 24);
  const ze = zc + r + rr * 0.6; a.box(cx - rr * 2, cy - rr * 2.2, ze, cx + rr * 2, cy - rr * 0.6, ze + rr * 2.6); a.box(cx - rr * 2, cy + rr * 0.6, ze, cx + rr * 2, cy + rr * 2.2, ze + rr * 2.6);
  a.ycyl(cy - rr * 3, cy + rr * 3, cx, ze + rr * 1.3, rr * 0.5, 8); a.ycyl(cy - rr * 3, cy - rr * 2.2, cx, ze + rr * 1.3, rr * 1.1, 6); a.ycyl(cy + rr * 2.2, cy + rr * 3, cx, ze + rr * 1.3, rr * 1.1, 6);
  const zb = ze + rr * 2.6; a.box(cx - rr * 3, cy - rr * 1.4, zb, cx + rr * 3, cy + rr * 1.4, zb + rr * 1.2); a.tube([[cx, cy, zb + rr * 1.2], [cx, cy, Z1 - 4 * IN]], [rr * 0.55, rr * 0.55], 8);
  a.cyl(cx, cy, zb + rr * 1.2, zb + rr * 5, rr * 1.1, 6); a.cyl(cx, cy, zb + rr * 7, zb + rr * 9, rr * 1.1, 6);
  a.box(cx - 5 * IN, cy - 2 * IN, Z1 - 4 * IN, cx + 5 * IN, cy + 2 * IN, Z1 - 3.4 * IN); a.box(cx - 5 * IN, cy - 2 * IN, Z1 - 0.6 * IN, cx + 5 * IN, cy + 2 * IN, Z1);
  a.outline('EQUIP-HIDDEN'); a.circ(cx, cy, rr * 0.7, 'EQUIP'); a.rect(cx - 5 * IN, cy - 2 * IN, cx + 5 * IN, cy + 2 * IN, 'EQUIP-DETAIL'); a.rect(X0, cy - r, X1, cy + r, 'EQUIP-DETAIL'); a.rect(cx - rr * 2, cy - r - rr * 2.2, cx + rr * 2, cy + r + rr * 2.2, 'EQUIP-DETAIL');
  a.log('Added the ceiling plate, the threaded rod with nuts and turnbuckle, the strap around the pipe with its ears and bolt, and the pipe it carries (plan and 3D).');
}
function springHanger(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = od(v.n) / 2, cr = v.can * IN / 2, rr = m.max(7, v.rod * IN / 2), zc = Z0 + r + 2, zcan = Z0 + (Z1 - Z0) * 0.34, ch = v.canh * IN;
  pipeX(a, X0, X1, cy, zc, v.n, 24);
  a.tube([[cx, cy, zc + r], [cx, cy, zcan]], [rr * 0.9, rr * 0.9], 8); a.box(cx - r - rr * 2, cy - rr, zc + r * 0.3, cx + r + rr * 2, cy + rr, zc + r * 0.3 + rr * 1.2);
  a.box(cx - r - rr * 2, cy - rr, zc - r * 0.1 + 0, cx - r - rr * 1.0, cy + rr, zc + r * 0.3);
  a.box(cx - cr * 1.05, cy - cr * 1.05, zcan, cx + cr * 1.05, cy + cr * 1.05, zcan + 8); a.cyl(cx, cy, zcan, zcan + ch, cr, 24); for (const f of [0.25, 0.5, 0.75]) a.cyl(cx, cy, zcan + ch * f - 4, zcan + ch * f + 4, cr * 1.03, 24);
  a.cyl(cx, cy, zcan + ch, zcan + ch + 10, cr * 1.08, 24); a.box(cx + cr * 0.6, cy - 12, zcan + ch * 0.3, cx + cr * 1.25, cy + 12, zcan + ch * 0.45); a.box(cx - cr * 1.25, cy - 12, zcan + ch * 0.3, cx - cr * 0.7, cy + 12, zcan + ch * 0.45);
  a.tube([[cx, cy, zcan + ch], [cx, cy, Z1 - 6 * IN]], [rr * 0.9, rr * 0.9], 8); hex(a, cx - rr * 1.4, cx + rr * 1.4, cy, zcan + ch + 40, rr * 1.1);
  a.box(cx - 6 * IN, cy - 3 * IN, Z1 - 6 * IN, cx + 6 * IN, cy + 3 * IN, Z1 - 5 * IN + 10); a.box(cx - 8 * IN, cy - 3 * IN, Z1 - 0.8 * IN, cx + 8 * IN, cy + 3 * IN, Z1); for (const s of [-1, 1]) a.box(cx + s * 7.2 * IN - 10, cy - 3 * IN, Z1 - 5 * IN, cx + s * 7.2 * IN + 10, cy + 3 * IN, Z1 - 0.8 * IN);
  a.outline('EQUIP-HIDDEN'); a.circ(cx, cy, cr, 'EQUIP'); a.circ(cx, cy, rr, 'EQUIP-DETAIL'); a.rect(X0, cy - r, X1, cy + r, 'EQUIP-DETAIL');
  a.log('Added the pipe with its lug and lower rod, the spring can with load plate, bands, travel stops and load scale, the upper rod and the beam attachment (plan and 3D).');
}
/** a pipe clamp (U-bolt) on a channel */
function uclamp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = od(v.n) / 2, ch = v.ch * IN, zc = Z0 + ch + r + 4;
  a.box(X0, cy - ch * 0.6, Z0, X1, cy + ch * 0.6, Z0 + 6); a.box(X0, cy - ch * 0.6, Z0 + 6, X1, cy - ch * 0.6 + 6, Z0 + ch); a.box(X0, cy + ch * 0.6 - 6, Z0 + 6, X1, cy + ch * 0.6, Z0 + ch);
  a.box(X0, cy - ch * 0.6 - 0, Z0 + ch - 6, X1, cy + ch * 0.6, Z0 + ch);
  pipeX(a, X0, X1, cy, zc, v.n, 24);
  for (const sx of [-1, 1]) { const x = cx + sx * m.max(W * 0.3, 2 * IN); const pts = []; for (let k = 0; k <= 12; k++) { const th = m.PI * k / 12; pts.push([x, cy + (r + 4) * m.cos(th), zc + (r + 4) * m.sin(th)]); } pts.unshift([x, cy + r + 4, Z0 + ch]); pts.push([x, cy - r - 4, Z0 + ch]);
    sweep(a, pts, 5 + r * 0.05, 6, [1, 0, 0]); for (const s of [-1, 1]) { hex(a, x - 8, x + 8, cy + s * (r + 4), Z0 + ch - 10, 11); a.box(x - 12, cy + s * (r + 4) - 14, Z0 + ch - 4, x + 12, cy + s * (r + 4) + 14, Z0 + ch); } }
  a.outline(); a.rect(X0, cy - r, X1, cy + r, 'EQUIP-DETAIL'); for (const sx of [-1, 1]) a.rect(cx + sx * m.max(W * 0.3, 2 * IN) - 6, cy - r - 4, cx + sx * m.max(W * 0.3, 2 * IN) + 6, cy + r + 4, 'EQUIP-DETAIL');
  a.log('Added the channel section, the pipe and two U-bolts with nuts and washers through the channel flange (plan and 3D).');
}
/** a pipe rack bent: two columns, beams on each tier, a row of pipes each on a shoe */
function rack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, tiers = v.tiers, np = v.np, bd = 8 * IN, cw = 8 * IN, tz = (k) => Z0 + (Z1 - Z0 - bd - 6 * IN) * (k + 1) / tiers;
  for (const sx of [-1, 1]) { const x = cx + sx * (W / 2 - cw / 2); ibeamY(a, x, cy - cw / 2, cy + cw / 2, Z0, 0.01, cw); a.box(x - cw / 2, cy - cw / 2, Z0, x + cw / 2, cy + cw / 2, Z0 + 12); a.box(x - cw / 2 - 4, cy - cw / 2 - 4, Z0, x + cw / 2 + 4, cy + cw / 2 + 4, Z0 + 14);
    a.box(x - cw / 2, cy - cw / 2, Z0 + 14, x + cw / 2, cy - cw / 2 + 5, Z1 - bd); a.box(x - cw / 2, cy + cw / 2 - 5, Z0 + 14, x + cw / 2, cy + cw / 2, Z1 - bd); a.box(x - cw * 0.04, cy - cw / 2 + 5, Z0 + 14, x + cw * 0.04, cy + cw / 2 - 5, Z1 - bd); }
  const ts = []; for (let k = 0; k < tiers; k++) ts.push(tz(k)); ts[tiers - 1] = Z1 - bd - 6 * IN;
  for (const z of ts) { ibeamX(a, cy, X0, X1, z, bd, 6 * IN); for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - cw) - 5 * IN, cy - 5 * IN, z - 5 * IN, cx + sx * (W / 2 - cw) + 5 * IN, cy + 5 * IN, z); }
  for (const z of ts) for (const sx of [-1, 1]) { const xc = cx + sx * (W / 2 - cw); a.tube([[xc - sx * cw / 2, cy, z - 26 * IN], [xc - sx * (cw / 2 + 24 * IN), cy, z]], [8, 8], 5); }
  for (let k = 0; k < tiers; k++) { const z = ts[k] + bd, per = np / tiers | 0, cnt = k === tiers - 1 ? np - per * (tiers - 1) : per, pitch = (W - 2 * cw - 14 * IN) / cnt;
    for (let i = 0; i < cnt; i++) { const x = X0 + cw + 7 * IN + pitch * (i + 0.5), n = [6, 4, 8, 3, 6, 10][(i + k * 2) % 6], r = od(n) / 2; const rm = m.min(r, pitch * 0.45); a.ycyl(YF + 2, YB - 2, x, z + 14 + rm, rm, 18); a.box(x - rm * 0.6, cy - 5 * IN, z, x + rm * 0.6, cy + 5 * IN, z + 14); a.circ(x, cy, rm, 'EQUIP-DETAIL'); } }
  a.outline(); for (const sx of [-1, 1]) a.rect(cx + sx * (W / 2 - cw / 2) - cw / 2, cy - cw / 2, cx + sx * (W / 2 - cw / 2) + cw / 2, cy + cw / 2, 'EQUIP'); a.rect(X0, cy - 3 * IN, X1, cy + 3 * IN, 'EQUIP-DETAIL');
  a.log(`Added the two steel columns on base plates with knee braces, ${tiers} beam tier${tiers > 1 ? 's' : ''} and ${np} pipes of mixed size each resting on a small shoe (plan and 3D).`);
}
function sleeper(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, sh = Z1 - Z0 - 0, bh = v.bh * IN;
  a.prism([[X0, YF + 1.5 * IN], [X1, YF + 1.5 * IN], [X1, YB - 1.5 * IN], [X0, YB - 1.5 * IN]], Z0, Z0 + bh); a.box(X0 + 1.5 * IN, YF, Z0, X1 - 1.5 * IN, YB, Z0 + 3 * IN);
  const np = v.np, pitch = (W - 8 * IN) / np;
  for (let i = 0; i < np; i++) { const n = v.sizes[i % v.sizes.length], r = od(n) / 2, x = X0 + 4 * IN + pitch * (i + 0.5), z = Z0 + bh + 0.4 * IN; a.box(x - r * 0.9, cy - 4 * IN, z, x + r * 0.9, cy + 4 * IN, z + 8); a.ycyl(YF + 3 * IN, YB - 3 * IN, x, z + 8 + r, r, 20); a.circ(x, cy, r, 'EQUIP-DETAIL'); }
  a.rect(X0, YF + 1.5 * IN, X1, YB - 1.5 * IN, 'EQUIP');
  a.log(`Added the concrete sleeper with chamfered edge and base, ${np} pipes of mixed size laid across it, each on a steel wear plate (plan and 3D).`);
}
function roller(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = od(v.n) / 2, rr = m.max(r * 0.35, 1.2 * IN), zr = Z0 + 2 * IN + rr, zp = zr + rr + r, bw = r * 0.9;
  a.box(X0, YF, Z0, X1, YB, Z0 + 1 * IN); a.box(X0 + 1 * IN, YF + 1 * IN, Z0 + 1 * IN, X1 - 1 * IN, YB - 1 * IN, Z0 + 2 * IN);
  a.ycyl(YF + 2, YB - 2, cx, zp, r, 24); a.ycyl(YF + 2, YF + 0.3 * IN, cx, zp, r * 1.04, 24);
  for (const y of [cy - D * 0.25, cy + D * 0.25]) { a.xcyl(cx - bw, cx + bw, y, zr, rr, 18); a.xcyl(cx - bw - 1.5 * IN, cx + bw + 1.5 * IN, y, zr, rr * 0.25, 8); a.rect(cx - bw, y - rr, cx + bw, y + rr, 'EQUIP'); }
  for (const s of [-1, 1]) { const x = cx + s * (bw + 0.75 * IN); a.box(x - 0.4 * IN, YF + 1 * IN, Z0 + 2 * IN, x + 0.4 * IN, YB - 1 * IN, zr + rr * 1.6); a.rect(x - 0.4 * IN, YF + 1 * IN, x + 0.4 * IN, YB - 1 * IN, 'EQUIP-DETAIL'); }
  a.outline(); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL');
  a.log('Added the base plate, two cheek plates, two support rollers on axles and the pipe resting on top of them (plan and 3D).');
}
function trapeze(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, np = v.np, ch = 1.625 * IN, rr = 0.375 * IN, zs = Z0 + 2 * IN * 0 + v.drop * IN;
  a.box(X0, cy - 3 * IN, Z1 - 0.6 * IN, X1, cy + 3 * IN, Z1);
  for (const sx of [-1, 1]) { const x = cx + sx * (W / 2 - 3 * IN); a.tube([[x, cy, Z1 - 0.6 * IN], [x, cy, zs + ch]], [rr, rr], 8); a.cyl(x, cy, zs + ch, zs + ch + 12, rr * 2.2, 6); a.cyl(x, cy, zs - 12, zs, rr * 2.2, 6); a.box(x - 1.5 * IN, cy - 1.5 * IN, Z1 - 0.8 * IN, x + 1.5 * IN, cy + 1.5 * IN, Z1 - 0.6 * IN); }
  a.box(X0, cy - ch / 2, zs, X1, cy + ch / 2, zs + 5); a.box(X0, cy - ch / 2, zs, X0 + 5, cy + ch / 2, zs + ch); a.box(X1 - 5, cy - ch / 2, zs, X1, cy + ch / 2, zs + ch); a.box(X0, cy - ch / 2, zs + ch - 5, X1, cy + ch / 2, zs + ch);
  const pitch = (W - 8 * IN) / np; for (let i = 0; i < np; i++) { const n = v.n, r = od(n) / 2, x = X0 + 4 * IN + pitch * (i + 0.5), zc = zs + ch + r; a.ycyl(YF + 4, YB - 4, x, zc, r, 20); a.box(x - r * 0.5, cy - 14, zs + ch, x + r * 0.5, cy + 14, zs + ch + 6); a.tube([[x - r * 0.9, cy - ch, zc - r * 0.2], [x, cy - ch * 0.5, zc + r * 1.2], [x + r * 0.9, cy - ch, zc - r * 0.2]], [5, 5, 5], 5); a.circ(x, cy, r, 'EQUIP-DETAIL'); }
  a.outline(); a.rect(X0, cy - ch / 2, X1, cy + ch / 2, 'EQUIP'); for (const sx of [-1, 1]) a.circ(cx + sx * (W / 2 - 3 * IN), cy, rr, 'EQUIP-DETAIL');
  a.log(`Added the ceiling channel, two threaded rods with nuts, the strut channel and ${np} pipes each held by a strap clamp (plan and 3D).`);
}

// ------------------------------------------------------------------------------------------ spools and skids
/** a flanged spool: a run along x, a 90 degree long-radius bend and a riser ending in a flange; a support trunnion under the run */
function spoolL(a, v) {
  const { X0, X1, Z0, Z1, cx, cy, W } = a, n = v.n, r = od(n) / 2, R = 1.5 * n * IN, zc = Z0 + fo(n), xv = X1 - fo(n), xe = xv - R;
  fl(a, n, 'x', cy, zc, X0, 1); a.xcyl(X0 + ft(n) * 2.7, xe, cy, zc, r, 22);
  const pts = []; for (let k = 0; k <= 14; k++) { const f = (k / 14) * m.PI / 2; pts.push([xe + R * m.sin(f), cy, zc + R - R * m.cos(f)]); } sweep(a, pts, r, 22);
  a.cyl(xv, cy, zc + R, Z1 - ft(n) * 2.7, r, 22); fl(a, n, 'z', xv, cy, Z1, -1);
  for (const t of [0.25 * W, 0.62 * W]) { a.cyl(X0 + t, cy, Z0, zc - r, r * 0.35, 10); a.box(X0 + t - r * 0.7, cy - r * 0.7, Z0, X0 + t + r * 0.7, cy + r * 0.7, Z0 + 10); a.rect(X0 + t - r * 0.7, cy - r * 0.7, X0 + t + r * 0.7, cy + r * 0.7, 'EQUIP-DETAIL'); }
  a.outline('EQUIP-HIDDEN'); a.line(X0, cy, xv, cy, 'EQUIP-DETAIL'); a.circ(xv, cy, r, 'EQUIP');
  a.log('Added the end flanges with bolts and weld necks, the straight run, the long-radius bend, the vertical leg and two floor trunnion supports (plan and 3D).');
}
/** a flanged run with a branch rising from the centre */
function spoolT(a, v) {
  const { X0, X1, Z0, Z1, cx, cy, W } = a, n = v.n, nb = v.nb, r = od(n) / 2, rb = od(nb) / 2, zc = Z0 + fo(n);
  fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, zc, X1, -1); a.xcyl(X0 + ft(n) * 2.7, X1 - ft(n) * 2.7, cy, zc, r, 22);
  a.cyl(cx, cy, zc, Z1 - ft(nb) * 2.7, rb, 20); a.ell(cx, cy, zc, rb * 1.2, rb * 1.2, rb * 1.2, 14, 7); fl(a, nb, 'z', cx, cy, Z1, -1);
  const rr = rb * 1.9; a.prism([[cx - rr, cy - rr * 0.3], [cx + rr, cy - rr * 0.3], [cx + rr, cy + rr * 0.3], [cx - rr, cy + rr * 0.3]], zc + r * 0.6, zc + r * 0.6 + 8);
  for (const t of [0.2 * W, 0.8 * W]) { a.cyl(X0 + t, cy, Z0, zc - r, r * 0.3, 10); a.box(X0 + t - r * 0.6, cy - r * 0.6, Z0, X0 + t + r * 0.6, cy + r * 0.6, Z0 + 10); }
  a.outline('EQUIP-HIDDEN'); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL'); a.circ(cx, cy, rb, 'EQUIP');
  a.log('Added the flanged run, the flanged branch with its welded-on reinforcing pad and the two floor supports (plan and 3D).');
}
function manifold(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, nh = v.nh, nb = v.nb, nbr = v.br, r = od(nh) / 2, rb = od(nb) / 2, zc = Z0 + 18 * IN;
  fl(a, nh, 'x', cy, zc, X0, 1); a.xcyl(X0 + ft(nh) * 2.7, X1 - ft(nh) * 0.4, cy, zc, r, 24);
  const F = FLG[nh]; a.xcyl(X1 - F[1] * IN, X1, cy, zc, F[0] * IN / 2, 28); for (let k = 0; k < F[2]; k++) { const th = (k / F[2]) * TAU; a.xcyl(X1 - F[1] * IN * 1.2, X1 + 0, cy + F[3] * IN / 2 * m.cos(th), zc + F[3] * IN / 2 * m.sin(th), F[4] * IN * 0.8, 6); }
  const x0 = X0 + fo(nh) * 1.8 + 6 * IN, x1 = X1 - fo(nh) * 1.8 - 4 * IN, pitch = nbr > 1 ? (x1 - x0) / (nbr - 1) : 0;
  for (let i = 0; i < nbr; i++) {
    const x = x0 + pitch * i, vz = zc + r + 5 * IN; a.cyl(x, cy, zc, vz, rb, 18); a.ell(x, cy, zc, rb * 1.15, rb * 1.15, rb * 1.15, 14, 6);
    const bw = rb * 1.6; a.box(x - bw, cy - bw * 0.8, vz, x + bw, cy + bw * 0.8, vz + rb * 2.6); a.cyl(x, cy, vz + rb * 2.6, vz + rb * 4.2, rb * 0.18, 8); handwheel(a, x, cy, vz + rb * 4.2, rb * 1.6, 5, 4);
    a.cyl(x, cy, vz + rb * 2.6, vz + rb * 3.4, rb * 0.5, 10); const tz = Z1 - ft(nb) * 2.7; a.cyl(x, cy, vz + rb * 2.6, tz, rb, 18); fl(a, nb, 'z', x, cy, Z1, -1);
    a.cyl(x, cy, Z0 + 4 * IN, zc - r, r * 0.25, 8); a.box(x - 3 * IN, cy - 2.5 * IN, Z0, x + 3 * IN, cy + 2.5 * IN, Z0 + 4 * IN * 0.5);
  }
  for (const t of [0.12, 0.88]) { const x = X0 + W * t; a.cyl(x, cy, Z0 + 3 * IN, zc - r, r * 0.45, 10); a.box(x - 5 * IN, cy - 5 * IN, Z0, x + 5 * IN, cy + 5 * IN, Z0 + 3 * IN); a.rect(x - 5 * IN, cy - 5 * IN, x + 5 * IN, cy + 5 * IN, 'EQUIP-DETAIL'); }
  a.outline(); for (let i = 0; i < nbr; i++) a.circ(x0 + pitch * i, cy, rb, 'EQUIP-DETAIL'); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
  a.log(`Added the flanged header with a blind end flange, ${nbr} branch risers each with an isolation valve, hand wheel and flange, and two floor supports (plan and 3D).`);
}
function strainerDims(n, ff) { const R = OD[n] / 2, Lb = R * 3.4, cr = R * 0.95, dz = Lb * 0.866 + cr * 0.5 + 1; return [ff, m.ceil(FLG[n][0] * 10) / 10 + 0.1, m.ceil((dz + FLG[n][0] / 2) * 10) / 10 + 0.5]; }
function strainer(a, v) {
  const { X0, X1, Z0, Z1, cx, cy, W } = a, n = v.n, R = od(n) / 2, Lb = R * 3.4 * IN / (IN), cr = R * 0.95, dz = Lb * 0.866 + cr * 0.5 + IN, zc = Z0 + dz + 3;
  a.xcyl(X0, X1, cy, zc, R * 1.05, 22); fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, zc, X1, -1);
  a.ell(cx, cy, zc, W * 0.24, R * 1.4, R * 1.4, 18, 8);
  const dx = 0.5, dzv = -0.866, bx = cx, bz = zc, ex = bx + dx * Lb * 1.0, ez = bz + dzv * Lb * 1.0;
  a.tube([[bx, cy, bz], [ex, cy, ez]], [R * 1.25, R * 1.0], 18); a.tube([[ex - dx * 0.3 * IN, cy, ez - dzv * 0.3 * IN], [ex + dx * R * 0.35, cy, ez + dzv * R * 0.35]], [cr * 1.35, cr * 1.35], 18);
  a.tube([[ex + dx * R * 0.35, cy, ez + dzv * R * 0.35], [ex + dx * R * 0.55, cy, ez + dzv * R * 0.55]], [R * 0.45, R * 0.45], 6);
  for (let k = 0; k < 6; k++) { const th = (k / 6) * TAU, ox = -dzv * 1, oz = dx; a.ycyl(cy + cr * 1.2 * m.cos(th) - 5, cy + cr * 1.2 * m.cos(th) + 5, ex + cr * 1.2 * m.sin(th) * ox * 0.5, ez + cr * 1.2 * m.sin(th) * oz * 0.5, 4, 6); }
  a.outline(); a.rect(cx - R * 1.4, cy - R * 1.4, cx + R * 1.4, cy + R * 1.4, 'EQUIP-DETAIL');
  a.log('Added the flanged body, the angled screen chamber with its bolted end cap and drain plug, and the bulged inlet chamber (plan and 3D).');
}
function duplex(a, v) {
  const { X0, X1, YF, Z0, Z1, cx, cy, W, D } = a, n = v.n, R = od(n) / 2, zc = Z0 + fo(n), br = R * 1.9;
  a.xcyl(X0, X1, cy, zc, R * 1.05, 22); fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, zc, X1, -1);
  const xs = [cx - W * 0.22, cx + W * 0.22];
  for (const x of xs) { a.cyl(x, cy, zc, Z1 - br * 0.5, br, 26); a.ell(x, cy, zc, br * 0.9, br * 0.9, br * 0.9, 16, 8);
    const zl = Z1 - br * 0.5; ring(a, 'z', x, cy, 0.01, br * 1.28, zl, zl + br * 0.28, br * 1.28, 26); for (let k = 0; k < 10; k++) { const th = (k / 10) * TAU; a.cyl(x + br * 1.12 * m.cos(th), cy + br * 1.12 * m.sin(th), zl + br * 0.28, zl + br * 0.46, br * 0.07, 6); }
    a.cyl(x, cy, zl + br * 0.28, zl + br * 0.7, br * 0.25, 8); a.tube([[x - br * 0.3, cy, zl + br * 0.7], [x - br * 0.3, cy, zl + br * 0.9], [x + br * 0.3, cy, zl + br * 0.9], [x + br * 0.3, cy, zl + br * 0.7]], [br * 0.06, br * 0.06, br * 0.06, br * 0.06], 5);
    a.cyl(x, cy, zc - br * 0.9, zc - br * 0.6, br * 0.2, 8); a.circ(x, cy, br * 1.28, 'EQUIP'); a.circ(x, cy, br * 0.6, 'EQUIP-DETAIL'); a.box(x - br * 0.8, cy - br * 0.4, Z0, x + br * 0.8, cy + br * 0.4, zc - br * 0.9); }
  a.box(cx - R * 0.9, cy - R * 0.9, zc + R * 1.0, cx + R * 0.9, cy + R * 0.9, zc + R * 1.9); a.cyl(cx, cy, zc + R * 1.9, zc + R * 2.6, R * 0.14, 8); a.box(cx - R * 2.0, cy - R * 0.14, zc + R * 2.6, cx + R * 2.0, cy + R * 0.14, zc + R * 2.78);
  a.tube([[cx, cy, zc], [cx, cy, zc + R * 1.0]], [R * 0.8, R * 0.8], 8);
  a.outline(); a.rect(X0, cy - R, X1, cy + R, 'EQUIP-DETAIL');
  a.log('Added the flanged through-body, two upright basket housings with bolted covers, vent plugs and lifting bails, the central changeover valve with its handle and the legs (plan and 3D).');
}
function pumpSkid(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, n = v.sn, nd = v.dn, bh = 6 * IN, zc = Z0 + bh + v.axis * IN, mw = W * 0.4, mr = v.mr * IN;
  // base frame: two channels and cross members with a drip lip
  for (const s of [-1, 1]) { a.box(X0, cy + s * (D * 0.4) - 3 * IN, Z0, X1, cy + s * (D * 0.4) + 3 * IN, Z0 + bh); } for (const f of [0.02, 0.3, 0.55, 0.85, 0.98]) a.box(X0 + W * f - 1.5 * IN, YF + D * 0.1, Z0, X0 + W * f + 1.5 * IN, YB - D * 0.1, Z0 + bh * 0.8);
  a.box(X0 + 1 * IN, YF + D * 0.1, Z0 + bh, X1 - 1 * IN, YB - D * 0.1, Z0 + bh + 6);
  // motor with feet, fan cowl, terminal box
  const mx0 = X0 + 4 * IN, mx1 = mx0 + mw; a.xcyl(mx0 + 2 * IN, mx1, cy, zc, mr, 24); a.xcyl(mx0, mx0 + 2 * IN, cy, zc, mr * 0.88, 22); a.box(mx0 + 4 * IN, cy - mr * 0.9, Z0 + bh + 6, mx1 - 3 * IN, cy + mr * 0.9, zc - mr * 0.7);
  for (let k = 0; k < 8; k++) a.xcyl(mx0 + 4 * IN + k * (mw - 8 * IN) / 8, mx0 + 4 * IN + k * (mw - 8 * IN) / 8 + 4, cy, zc, mr * 1.04, 24);
  a.box(mx0 + mw * 0.45, cy - mr * 0.35, zc + mr * 0.9, mx0 + mw * 0.75, cy + mr * 0.35, zc + mr * 1.4);
  // coupling guard, pump casing and nozzles
  const gx0 = mx1, gx1 = gx0 + W * 0.1; a.xcyl(gx0, gx1, cy, zc, mr * 0.6, 14); a.box(gx0, cy - mr * 0.5, zc - mr * 0.5, gx1, cy + mr * 0.5, zc + mr * 0.5 + 6);
  const px = gx1 + W * 0.18; a.ell(px, cy, zc, W * 0.16, mr * 1.2, mr * 1.25, 20, 10); a.ycyl(cy - mr * 1.2, cy + mr * 1.2, px, zc, mr * 1.1, 24);
  a.box(px - W * 0.1, cy - mr * 0.8, Z0 + bh + 6, px + W * 0.1, cy + mr * 0.8, zc - mr * 0.9);
  const sx = X1 - fo(n) * 0.3; a.xcyl(px + W * 0.1, sx - ft(n) * 1.4, cy, zc, od(n) / 2, 20); fl(a, n, 'x', cy, zc, sx, -1);
  const dxp = px - W * 0.02, dtop = Z1 - ft(nd) * 1.4; a.cyl(dxp, cy, zc + mr * 0.8, dtop, od(nd) / 2, 20); fl(a, nd, 'z', dxp, cy, Z1, -1);
  const bz = zc + mr * 0.8 + 5 * IN, bw = od(nd) / 2 * 1.5; a.box(dxp - bw, cy - bw * 0.8, bz, dxp + bw, cy + bw * 0.8, bz + od(nd) / 2 * 2.6); a.cyl(dxp, cy, bz + od(nd) / 2 * 2.6, bz + od(nd) / 2 * 4.2, od(nd) / 2 * 0.2, 8); handwheel(a, dxp, cy, bz + od(nd) / 2 * 4.2, od(nd) / 2 * 1.5, 5, 4);
  a.cyl(dxp, cy, bz, bz + od(nd) / 2 * 2.6, od(nd) / 2 * 1.2, 18);
  a.box(cx + W * 0.12, cy + D * 0.2, Z0 + bh, cx + W * 0.12 + 5 * IN, cy + D * 0.4, Z0 + bh + 3 * IN); gauge(a, dxp + 3 * IN, cy - od(nd) / 2 - 6, zc + mr * 2.2, 40);
  a.outline(); a.rect(mx0, cy - mr, mx1, cy + mr, 'EQUIP'); a.circ(px, cy, mr * 1.1, 'EQUIP-DETAIL'); a.circ(dxp, cy, od(nd) / 2, 'EQUIP-DETAIL'); a.line(sx, cy - od(n) / 2, sx - 6 * IN, cy - od(n) / 2, 'EQUIP-DETAIL');
  a.log('Added the channel base frame with drip lip, the finned motor with terminal box, coupling guard, the volute pump casing, the flanged suction and discharge, a block valve with hand wheel and a gauge (plan and 3D).');
}
function meterRun(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, n = v.n, r = od(n) / 2, zc = Z0 + 14 * IN + fo(n) * 0.0 + r;
  fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, zc, X1, -1); a.xcyl(X0 + ft(n) * 2.7, X1 - ft(n) * 2.7, cy, zc, r, 22);
  const ox = cx + W * 0.08; for (const s of [-1, 1]) { fl(a, n, 'x', cy, zc, ox + s * 1 * IN, -s); }
  a.xcyl(ox - 1.4 * IN, ox + 1.4 * IN, cy, zc, fo(n) * 0.96, 28);
  const fx = X0 + W * 0.28; a.xcyl(fx - 1 * IN, fx + 1 * IN, cy, zc, r * 1.12, 22); for (let k = 0; k < 4; k++) { const th = k * m.PI / 2 + 0.4; a.tube([[fx, cy, zc], [fx, cy + r * 0.9 * m.cos(th), zc + r * 0.9 * m.sin(th)]], [0.3 * IN, 0.3 * IN], 4); }
  // pressure taps, manifold block, transmitter
  for (const s of [-1, 1]) { const tx = ox + s * 1.8 * IN; a.tube([[tx, cy, zc + r], [tx, cy, zc + r + 7 * IN], [ox + s * 0.9 * IN, cy, zc + r + 11 * IN]], [0.35 * IN, 0.35 * IN, 0.35 * IN], 6); }
  const mz = zc + r + 11 * IN; a.box(ox - 2.2 * IN, cy - 1.2 * IN, mz, ox + 2.2 * IN, cy + 1.2 * IN, mz + 4 * IN); a.cyl(ox, cy, mz + 4 * IN, mz + 11 * IN, 3 * IN, 18); a.box(ox - 2.4 * IN, cy - 2.4 * IN, mz + 11 * IN, ox + 2.4 * IN, cy + 2.4 * IN, mz + 14 * IN);
  a.cyl(ox, cy, mz + 14 * IN, Z1 - 0.1, 2.2 * IN, 14); a.box(ox - 2 * IN, cy - 0.5 * IN, mz + 5 * IN, ox + 2 * IN, cy + 4 * IN, mz + 9 * IN);
  for (const t of [0.12, 0.5, 0.88]) { const x = X0 + W * t; a.cyl(x, cy, Z0 + 2 * IN, zc - r, r * 0.45, 12); a.box(x - 4 * IN, cy - 4 * IN, Z0, x + 4 * IN, cy + 4 * IN, Z0 + 2 * IN); a.box(x - r * 0.9, cy - r * 0.9, zc - r - 6, x + r * 0.9, cy + r * 0.9, zc - r); }
  a.outline(); a.circ(ox, cy, 3 * IN, 'EQUIP-DETAIL'); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
  a.log('Added the end flanges, the straight inlet pipe with a tube-bundle flow straightener, the orifice flange pair with plate carrier, the impulse tubes with a valve manifold and transmitter, the outlet pipe and three saddle supports (plan and 3D).');
}
function doseSkid(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, nt = v.tanks, tr = v.tr * IN, th = v.th * IN, np = v.pumps;
  a.box(X0, YF, Z0, X1, YB, Z0 + 3 * IN); a.box(X0 + 1.5 * IN, YF + 1.5 * IN, Z0 + 3 * IN, X1 - 1.5 * IN, YB - 1.5 * IN, Z0 + 3.5 * IN);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * (W / 2 - 3 * IN) - 1.5 * IN, cy + sy * (D / 2 - 3 * IN) - 1.5 * IN, Z0 + 3.5 * IN, cx + sx * (W / 2 - 3 * IN) + 1.5 * IN, cy + sy * (D / 2 - 3 * IN) + 1.5 * IN, Z1 - 20 * IN);
  const tx = []; for (let i = 0; i < nt; i++) tx.push(X0 + 4 * IN + tr + i * (2 * tr + 4 * IN));
  for (const x of tx) { const ty = YB - 4 * IN - tr; a.cyl(x, ty, Z0 + 3.5 * IN, Z0 + 3.5 * IN + th, tr, 28); a.ell(x, ty, Z0 + 3.5 * IN + th, tr, tr, tr * 0.22, 24, 5); a.cyl(x, ty, Z0 + 3.5 * IN + th + tr * 0.2, Z0 + 3.5 * IN + th + tr * 0.35, tr * 0.28, 12);
    for (const f of [0.3, 0.6, 0.85]) a.cyl(x, ty, Z0 + 3.5 * IN + th * f - 6, Z0 + 3.5 * IN + th * f + 6, tr * 1.02, 28); a.ycyl(ty - tr - 12, ty - tr + 4, x, Z0 + 3.5 * IN + th * 0.12, 1.5 * IN, 12); a.circ(x, ty, tr, 'EQUIP'); a.circ(x, ty, tr * 0.28, 'EQUIP-DETAIL'); }
  const px0 = tx[nt - 1] + tr + 6 * IN, pw = (X1 - 3 * IN - px0) / np;
  for (let i = 0; i < np; i++) { const x = px0 + pw * (i + 0.5); a.box(x - pw * 0.4, YB - 14 * IN, Z0 + 3.5 * IN, x + pw * 0.4, YB - 4 * IN, Z0 + 3.5 * IN + 16 * IN); a.ycyl(YB - 14 * IN - 3 * IN, YB - 14 * IN, x, Z0 + 3.5 * IN + 10 * IN, 3 * IN, 16); a.box(x - 2 * IN, YB - 14 * IN - 2.6 * IN, Z0 + 3.5 * IN + 1.5 * IN, x + 2 * IN, YB - 14 * IN, Z0 + 3.5 * IN + 6 * IN);
    a.tube([[x, YB - 14 * IN - 3 * IN, Z0 + 3.5 * IN + 10 * IN], [x, YF + D * 0.45, Z0 + 3.5 * IN + 24 * IN], [x, YF + 8 * IN, Z0 + 3.5 * IN + 24 * IN]], [0.5 * IN, 0.5 * IN, 0.5 * IN], 6); a.cyl(x, YF + D * 0.45, Z0 + 3.5 * IN + 24 * IN, Z0 + 3.5 * IN + 30 * IN, 1.2 * IN, 8); a.circ(x, YB - 9 * IN, 4 * IN, 'EQUIP-DETAIL'); }
  a.tube([[X0 + 6 * IN, YF + 8 * IN, Z0 + 3.5 * IN + 24 * IN], [X1 - 6 * IN, YF + 8 * IN, Z0 + 3.5 * IN + 24 * IN]], [0.8 * IN, 0.8 * IN], 8); a.cyl(X1 - 6 * IN, YF + 8 * IN, Z0 + 3.5 * IN + 24 * IN, Z0 + 3.5 * IN + 40 * IN, 0.8 * IN, 8); gauge(a, X0 + 12 * IN, YF + 8 * IN - 0.8 * IN, Z0 + 3.5 * IN + 32 * IN, 1.4 * IN);
  a.box(X1 - 18 * IN, YF + 4 * IN, Z1 - 24 * IN, X1 - 3 * IN, YF + 10 * IN, Z1 - 4 * IN); a.box(X1 - 17 * IN, YF + 3 * IN, Z1 - 22 * IN, X1 - 4 * IN, YF + 4 * IN, Z1 - 12 * IN);
  a.outline(); a.rect(X0 + 1.5 * IN, YF + 1.5 * IN, X1 - 1.5 * IN, YB - 1.5 * IN, 'EQUIP-DETAIL');
  a.log(`Added the drip-tray frame with corner posts, ${nt} chemical tank${nt > 1 ? 's' : ''} with lids and outlet fittings, ${np} metering pump${np > 1 ? 's' : ''} with heads and tubing, the discharge header with gauge and the control panel (plan and 3D).`);
}

// ------------------------------------------------------------------------------------------ families
const IN2 = (x) => R1(x);
const ev = (sizes, ang, flg) => sizes.map((n) => { const [w, d, h] = elbowDims(n, ang, flg); return [`${n} in${flg ? ', flanged ends' : ', weld ends'}`, w, d, h, 0, { n, ang, fl: flg }]; });
const teeRow = (n, nb) => { const hb = TEEM[n] * (nb === n ? 1 : 0.9); return [nb === n ? `${n} in equal` : `${n} by ${nb} in reducing`, R1(TEEM[n] * 2 + 0.2), R1(OD[n] + 0.2), R1(OD[n] / 2 + 0.2 + hb + 0.15), 0, { n, nb }]; };
const redRow = (n, nb, L, ecc) => [`${n} by ${nb} in, ${L} in long`, L, R1(OD[n] + 0.2), R1(OD[n] + 0.4), 0, { n, nb, ecc }];
const flRow = (n, blind) => { const F = FLG[n]; return [`${n} in, ${blind ? 'blind' : 'weld neck'}`, R1(F[0] + 0.1), R1(F[4] * 1.1 + F[1] * 2.7 + 1.5), R1(F[0] + 0.1), 0, { n, blind }]; };
const FAMS = [
  // ===================================================== fittings =====================================================
  fam({ cat: 'piping/fittings', title: 'Generic long-radius pipe elbow, 90 degree', desc: (v) => `${v.n} in long-radius 90 degree elbow standing in the vertical plane: a bend of 1.5 pipe diameters with ${v.fl ? 'raised-face flanges with bolts and weld necks on both ends' : 'bevelled weld ends'}.`,
    vs: [...ev([2, 4, 8, 16], 90, false), ...ev([3, 6, 10], 90, true)], build: (a, v) => elbow(a, v) }),
  fam({ cat: 'piping/fittings', title: 'Generic long-radius pipe elbow, 45 degree', desc: (v) => `${v.n} in long-radius 45 degree elbow standing in the vertical plane with bevelled weld ends.`,
    vs: ev([4, 12], 45, false), build: (a, v) => elbow(a, v) }),
  fam({ cat: 'piping/fittings', title: 'Generic butt-weld pipe tee', desc: (v) => `${v.n} in ${v.nb === v.n ? 'equal' : 'reducing'} tee: a run with a branch rising from the centre, forged crotch and bevelled weld ends.`,
    vs: [teeRow(3, 3), teeRow(8, 8), teeRow(4, 2), teeRow(12, 6)], build: (a, v) => tee(a, v) }),
  fam({ cat: 'piping/fittings', title: 'Generic pipe reducer', desc: (v) => `${v.n} by ${v.nb} in ${v.ecc ? 'eccentric reducer, flat on the bottom' : 'concentric reducer'}: large-end and small-end barrels joined by a taper with bevelled weld ends.`,
    vs: [redRow(6, 4, 7, false), redRow(12, 8, 10, false), redRow(8, 6, 8, true), redRow(16, 12, 14, true)], build: (a, v) => reducer(a, v) }),
  fam({ cat: 'piping/fittings', title: 'Generic weld pipe cap', desc: (v) => `${v.n} in pipe cap: a straight skirt with a bevelled weld end and an elliptical dished head.`,
    vs: [[4, 2.5], [12, 6]].map(([n, L]) => [`${n} in`, L, R1(OD[n] + 0.2), R1(OD[n] + 0.4), 0, { n }]), build: (a, v) => cap(a, v) }),
  fam({ cat: 'piping/fittings', title: 'Generic raised-face pipe flange', desc: (v) => `${v.n} in ${v.blind ? 'blind flange with a closing disc' : 'weld-neck flange'}, standing face-on: a plate with ${FLG[v.n][2]} bolts and nuts on the bolt circle, a tapered neck and a pipe stub.`,
    vs: [flRow(2, false), flRow(6, false), flRow(12, false), flRow(8, true)], build: (a, v) => wnFlange(a, v) }),
  fam({ cat: 'piping/fittings', title: 'Generic threaded pipe union', desc: (v) => `${v.pipe < 2 ? '1' : '2'} in three-piece union with two threaded tails, hex collars, seat rings and a large hexagonal nut.`,
    vs: [['1 in', 3.6, 2.3, 2.3, 0, { pipe: 1.315 }], ['2 in', 5.4, 3.6, 3.6, 0, { pipe: 2.375 }]], build: (a, v) => union(a, v) }),
  // ===================================================== valves =====================================================
  fam({ cat: 'piping/valves', title: 'Generic flanged gate valve', desc: (v) => `${v.n} in flanged gate valve: bolted flanges, a bulged body with bonnet, a yoke with rising stem and gland, and a hand wheel.`,
    vs: [[2, 7, 6, 15], [4, 9, 9.2, 22], [8, 11.5, 13.6, 39], [12, 14, 19.2, 58]].map(([n, w, d, h]) => [`${n} in`, w, d, h, 0, { n }]), build: (a, v) => gate(a, v) }),
  fam({ cat: 'piping/valves', title: 'Generic flanged globe valve', desc: (v) => `${v.n} in flanged globe valve: a spherical body with raised bonnet, yoke, stem and hand wheel.`,
    vs: [[2, 8, 6.1, 14], [4, 11.5, 9.2, 21], [8, 19.5, 17, 36]].map(([n, w, d, h]) => [`${n} in`, w, d, h, 0, { n }]), build: (a, v) => globe(a, v) }),
  fam({ cat: 'piping/valves', title: 'Generic flanged ball valve', desc: (v) => `${v.n} in flanged ball valve with a split body, a stem neck with stop plate and a lever with grip sleeve.`,
    vs: [[2, 7, 11, 6.1, 8], [4, 9, 12, 9.2, 12], [6, 15, 17, 11.2, 16]].map(([n, ff, w, d, h]) => [`${n} in`, w, d, h, 0, { n, ff }]), build: (a, v) => ball(a, v) }),
  fam({ cat: 'piping/valves', title: 'Generic wafer butterfly valve between flanges', desc: (v) => `${v.n} in butterfly valve between two bolted flanges on pipe stubs, with a lugged wafer body and ${v.gear ? 'a gear operator with hand wheel' : 'a lever with grip sleeve'}.`,
    vs: [[4, 17, 9.2, 13, false], [8, 24, 13.7, 20, false], [12, 21, 19.2, 35, true], [20, 25, 27.7, 52, true]].map(([n, w, d, h, g]) => [`${n} in, ${g ? 'gear operator' : 'lever'}`, w, d, h, 0, { n, gear: g }]), build: (a, v) => butterfly(a, v) }),
  fam({ cat: 'piping/valves', title: 'Generic flanged swing check valve', desc: (v) => `${v.n} in flanged swing check valve: a bulged body with a bolted cover and cover bolts and a hinge-pin plug.`,
    vs: [[3, 8, 7.8, 8.4], [6, 10.5, 11.3, 13.8], [10, 15.5, 18, 21.6], [16, 28, 26.6, 31.6]].map(([n, w, d, h]) => [`${n} in`, w, d, h, 0, { n }]), build: (a, v) => check(a, v) }),
  fam({ cat: 'piping/valves', title: 'Generic spring relief valve, flanged', desc: (v) => `Relief valve, ${v.ni} in inlet by ${v.no} in outlet: a flanged inlet and side outlet on an angle body, a spring bonnet with ribs and adjusting cap, and a lifting lever.`,
    vs: [[2, 3, 11, 8, 24], [4, 6, 15, 11.2, 40], [6, 8, 19, 13.8, 52]].map(([ni, no, w, d, h]) => [`${ni} by ${no} in`, w, d, h, 0, { ni, no }]), build: (a, v) => relief(a, v) }),
  fam({ cat: 'piping/valves', title: 'Generic diaphragm-actuated control valve', desc: (v) => `${v.n} in flanged globe control valve: bonnet and yoke, a stem connector, a round two-part diaphragm actuator with rim bolts and a positioner box with its tube.`,
    vs: [[2, 10, 10, 10, 16], [4, 12, 17, 17, 27], [6, 16, 24, 24, 38], [8, 20, 31, 31, 48]].map(([n, ff, w, d, h]) => [`${n} in`, w, d, h, 0, { n, ff }]), build: (a, v) => control(a, v) }),
  // ===================================================== supports =====================================================
  fam({ cat: 'piping/supports', title: 'Generic pipe shoe on beam', desc: (v) => `${v.n} in pipe on a welded T shoe with slide plate and stiffeners, resting on a steel beam.`,
    vs: [[4, 6, 3, 18, 24], [8, 8, 4, 24, 30]].map(([n, bd, sh, w, d]) => [`${n} in`, w, d, R1(bd + sh + OD[n] + 0.1), 0, { n, bd, sh }]), build: (a, v) => shoe(a, v) }),
  fam({ cat: 'piping/supports', title: 'Generic pipe guide on beam', desc: (v) => `${v.n} in pipe on a shoe held sideways by two guide angles, on a steel beam.`,
    vs: [[6, 8, 4, 24, 30], [12, 10, 5, 30, 36]].map(([n, bd, sh, w, d]) => [`${n} in`, w, d, R1(bd + sh + OD[n] + 0.1), 0, { n, bd, sh, guide: true }]), build: (a, v) => shoe(a, v) }),
  fam({ cat: 'piping/supports', title: 'Generic pipe anchor on base plate', desc: (v) => `${v.n} in pipe fixed to a base plate with four anchor bolts by two welded lug plates and a restraining strap.`,
    vs: [[6, 6, 24, 22], [12, 8, 36, 34]].map(([n, pl, w, d]) => [`${n} in`, w, d, R1(pl + 13.5 + (n > 8 ? 6 : 0)), 0, { n, pl }]), build: (a, v) => anchor(a, v) }),
  fam({ cat: 'piping/supports', title: 'Generic clevis hanger', desc: (v) => `${v.n} in pipe on a clevis hanger: a ceiling plate, threaded rod with nuts and turnbuckle, and a clevis strap with bolt.`,
    vs: [[2, 0.375, 10, 4.5, 24], [4, 0.5, 12, 5, 30], [8, 0.625, 14, 9.5, 36]].map(([n, rod, w, d, h]) => [`${n} in, ${h} in drop`, w, d, h, 0, { n, rod }]), build: (a, v) => clevis(a, v) }),
  fam({ cat: 'piping/supports', title: 'Generic spring hanger', desc: (v) => `${v.n} in pipe on a variable spring hanger: a spring can with load plate, bands, travel stops and scale between an upper and a lower rod, with a beam attachment.`,
    vs: [[4, 6.5, 8, 0.5, 12, 8, 36], [8, 9, 12, 0.625, 16, 12, 50], [12, 12, 15, 0.75, 20, 14.5, 66]].map(([n, can, canh, rod, w, d, h]) => [`${n} in, ${h} in tall`, w, d, h, 0, { n, can, canh, rod }]), build: (a, v) => springHanger(a, v) }),
  fam({ cat: 'piping/supports', title: 'Generic U-bolt pipe clamp on channel', desc: (v) => `${v.n} in pipe held down by two U-bolts with nuts and washers on a channel section.`,
    vs: [[2, 1.625, 12, 4], [4, 2.5, 16, 6], [8, 3.5, 24, 10]].map(([n, ch, w, d]) => [`${n} in`, w, d, R1(ch + OD[n] + 0.8), 0, { n, ch }]), build: (a, v) => uclamp(a, v) }),
  fam({ cat: 'piping/supports', title: 'Generic pipe rack bent', desc: (v) => `Pipe rack bent: two steel columns on base plates with knee braces, ${v.tiers} beam tier${v.tiers > 1 ? 's' : ''} and ${v.np} pipes of mixed size, each on a small shoe.`,
    vs: [['one tier, 3 pipes, 8 ft', 96, 10, 132, 1, 3], ['two tiers, 8 pipes, 10 ft', 120, 10, 180, 2, 8], ['three tiers, 12 pipes, 12 ft', 144, 10, 240, 3, 12]].map(([l, w, d, h, tiers, np]) => [l, w, d, h, 0, { tiers, np }]), build: (a, v) => rack(a, v) }),
  fam({ cat: 'piping/supports', title: 'Generic concrete pipe sleeper', desc: (v) => `Low concrete sleeper with a steel plate under each of ${v.np} pipes of mixed size laid across it.`,
    vs: [['3 pipes', 60, 16, 15.5, 8, 3, [6, 4, 3]], ['5 pipes', 108, 20, 19.5, 10, 5, [8, 6, 4, 3, 6]], ['6 pipes, high', 132, 24, 27.5, 14, 6, [12, 8, 6, 10, 4, 6]]].map(([l, w, d, h, bh, np, sizes]) => [l, w, d, h, 0, { bh, np, sizes }]), build: (a, v) => sleeper(a, v) }),
  fam({ cat: 'piping/supports', title: 'Generic pipe roller support', desc: (v) => `${v.n} in pipe on a roller support: a base plate, two cheek plates and two support rollers on axles under the pipe.`,
    vs: [[4, 11, 16], [8, 15, 22]].map(([n, w, d]) => { const rr = m.max(OD[n] / 2 * 0.35, 1.2); return [`${n} in`, w, d, R1(2 + 2 * rr + OD[n] + 0.6), 0, { n }]; }), build: (a, v) => roller(a, v) }),
  fam({ cat: 'piping/supports', title: 'Generic trapeze pipe hanger', desc: (v) => `Trapeze hanger carrying ${v.np} pipes of ${v.n} in on a strut channel with strap clamps, hung from a ceiling channel on two threaded rods.`,
    vs: [[2, 3, 24, 6.5, 14], [4, 4, 40, 8, 18]].map(([n, np, w, d, h]) => [`${np} pipes of ${n} in`, w, d, h, 0, { n, np, drop: 0.5 }]), build: (a, v) => trapeze(a, v) }),
  // ===================================================== spools =====================================================
  fam({ cat: 'piping/spools', title: 'Generic flanged pipe spool with bend', desc: (v) => `${v.n} in flanged spool: a run with a long-radius 90 degree bend and a vertical leg, a bolted flange on each end and two floor supports.`,
    vs: [[4, 48, 9.2, 36], [6, 66, 11.2, 48], [8, 84, 13.7, 60], [12, 108, 19.2, 78]].map(([n, w, d, h]) => [`${n} in, ${w} in long`, w, d, h, 0, { n }]), build: (a, v) => spoolL(a, v) }),
  fam({ cat: 'piping/spools', title: 'Generic flanged pipe spool with branch', desc: (v) => `${v.n} in flanged spool with a ${v.nb} in flanged branch rising from the centre on a reinforcing pad, and two floor supports.`,
    vs: [[4, 2, 36, 9.2, 22], [8, 4, 54, 13.7, 32], [12, 6, 72, 19.2, 44]].map(([n, nb, w, d, h]) => [`${n} by ${nb} in`, w, d, h, 0, { n, nb }]), build: (a, v) => spoolT(a, v) }),
  fam({ cat: 'piping/spools', title: 'Generic header manifold', desc: (v) => `Header manifold: a ${v.nh} in flanged header with a blind end flange and ${v.br} branch risers of ${v.nb} in, each with an isolation valve, hand wheel and flange, on two floor supports.`,
    vs: [[6, 2, 3, 84, 14, 48], [8, 3, 5, 132, 15, 56], [12, 4, 8, 192, 20, 66]].map(([nh, nb, br, w, d, h]) => [`${br} branches, ${nh} in header`, w, d, h, 0, { nh, nb, br }]), build: (a, v) => manifold(a, v) }),
  fam({ cat: 'piping/spools', title: 'Generic Y-type pipe strainer', desc: (v) => `${v.n} in flanged Y strainer: a through body with an angled screen chamber, a bolted end cap and a drain plug.`,
    vs: [[2, 10], [4, 14], [8, 26]].map(([n, ff]) => { const [w, d, h] = strainerDims(n, ff); return [`${n} in`, w, d, h, 0, { n }]; }), build: (a, v) => strainer(a, v) }),
  fam({ cat: 'piping/spools', title: 'Generic duplex basket strainer', desc: (v) => `${v.n} in duplex strainer: a flanged through body, two upright basket housings with bolted covers, vent plugs and lifting bails, and a central changeover valve with handle.`,
    vs: [[3, 28, 8.7, 24], [6, 44, 17, 34]].map(([n, w, d, h]) => [`${n} in`, w, d, h, 0, { n }]), build: (a, v) => duplex(a, v) }),
  fam({ cat: 'piping/spools', title: 'Generic pump skid with piping', desc: (v) => `Pump skid: a channel base frame, a finned motor with terminal box, coupling guard, a volute pump casing, a ${v.sn} in flanged suction, a ${v.dn} in flanged discharge riser with a block valve and hand wheel, and a gauge.`,
    vs: [[2, 1, 7, 4.5, 54, 20, 36], [3, 2, 8, 6, 72, 24, 42], [4, 3, 10, 8, 96, 30, 52], [6, 4, 13, 11, 132, 40, 68]].map(([sn, dn, axis, mr, w, d, h]) => [`${sn} in suction, ${w} in long`, w, d, h, 0, { sn, dn, axis, mr }]), build: (a, v) => pumpSkid(a, v) }),
  fam({ cat: 'piping/spools', title: 'Generic orifice meter run', desc: (v) => `${v.n} in meter run: flanged ends, an inlet pipe with a tube-bundle flow straightener, an orifice flange pair with plate carrier, impulse tubes with a valve manifold and transmitter, an outlet pipe and three saddle supports.`,
    vs: [[4, 96, 9.2, 50], [6, 132, 11.5, 53], [8, 168, 13.8, 56]].map(([n, w, d, h]) => [`${n} in, ${w} in long`, w, d, h, 0, { n }]), build: (a, v) => meterRun(a, v) }),
  fam({ cat: 'piping/spools', title: 'Generic chemical dosing skid', desc: (v) => `Dosing skid: a drip-tray frame with corner posts, ${v.tanks} chemical tank${v.tanks > 1 ? 's' : ''} with lids and outlet fittings, ${v.pumps} metering pumps with heads and tubing, a discharge header with gauge and a control panel.`,
    vs: [['1 tank, 2 pumps', 72, 38, 60, 1, 14, 36, 2], ['2 tanks, 2 pumps', 108, 40, 72, 2, 14, 44, 2], ['2 tanks, 3 pumps', 132, 48, 84, 2, 18, 48, 3]].map(([l, w, d, h, tanks, tr, th, pumps]) => [l, w, d, h, 0, { tanks, tr, th, pumps }]), build: (a, v) => doseSkid(a, v) }),
];
export default FAMS;

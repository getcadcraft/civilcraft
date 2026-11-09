/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, piping: 150 more fittings, valves, supports, spools and skids. Original geometry by type and size class; no maker, model or standard. */
import { fam, Acc } from './r4-kit.mjs';

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
Object.assign(OD, { 0.5: 0.84, 0.75: 1.05, 1.25: 1.66, 1.5: 1.9, 2.5: 2.875, 5: 5.563, 14: 14, 18: 18 });
Object.assign(FLG, { 1.5: [5, 0.69, 4, 3.88, 0.5], 2.5: [7, 0.88, 4, 5.5, 0.62], 5: [10, 0.94, 8, 8.5, 0.75], 14: [21, 1.38, 12, 18.75, 1], 18: [25, 1.56, 16, 22.75, 1.12] });

// ------------------------------------------------------------------------------------------ round-7 helpers
/** measure what a builder draws (it must start at X0 and Z0) and return [width, depth, height] in inches. mode 'sym' = centred on cy, 'back' = anchored on the back edge (y = 0) and drawn toward -y */
function fit(build, p, mode = 'sym') {
  const a = new Acc({ x: -4000, y: -4000, z: 0, w: 8000, d: 4000, h: 4000 }); build(a, p);
  let xm = 1e9, xM = -1e9, ym = 0, yM = -1e9, zm = 1e9, zM = -1e9, yn = 1e9;
  for (const t of a.t) for (const q of t) { xm = m.min(xm, q[0]); xM = m.max(xM, q[0]); ym = m.max(ym, m.abs(q[1] - a.cy)); yM = m.max(yM, q[1]); yn = m.min(yn, q[1]); zm = m.min(zm, q[2]); zM = m.max(zM, q[2]); }
  const lx = a.X0 - xm, lz = -zm;                      // parts that stick out left of the origin or below the floor: the builder is shifted by this much
  if (lx > 150 || lz > 150) throw new Error(`builder draws far left of X0 or below Z0 (${-lx}, ${-lz})`);
  if (mode === 'back' && yM > 1) throw new Error('back-anchored builder draws behind y = 0');
  const up = (mm, pad) => m.max(0.5, m.ceil((mm / IN + pad) * 10) / 10);
  return [up(xM - xm, 0.15), mode === 'back' ? up(-yn, 0.1) : up(2 * ym, 0.2), up(zM - zm, 0.15), lx, lz];
}
/** variant rows [label, w, d, h, 0, params] from [label, params] with measured size */
const rowsOf = (build, list, mode = 'sym') => list.map(([label, p]) => { try { const [w, d, h, lx, lz] = fit(build, p, mode); return [label, w, d, h, 0, { ...p, _lx: lx, _lz: lz }]; } catch (e) { throw new Error(`${build.name} ${label}: ${e.message}`); } });
/** points of a planar path in the X-Z plane at y: start (x, z), heading hd (deg, 0 = +x, 90 = up); ops ['L', len] or ['A', turn deg (+ turns left/up), radius] */
function pathPts(y, x, z, hd, ops, seg = 12) {
  const pts = [[x, y, z]]; let h = (hd * m.PI) / 180;
  for (const [k, p, R] of ops) {
    if (k === 'L') { x += p * m.cos(h); z += p * m.sin(h); pts.push([x, y, z]); } else {
      const t = (p * m.PI) / 180, s = m.sign(t), n = m.max(2, m.ceil((m.abs(p) / 90) * seg)), cxx = x - s * R * m.sin(h), czz = z + s * R * m.cos(h);
      for (let i = 1; i <= n; i++) { const hh = h + (t * i) / n; pts.push([cxx + s * R * m.sin(hh), y, czz - s * R * m.cos(hh)]); }
      h += t; x = pts[pts.length - 1][0]; z = pts[pts.length - 1][2];
    }
  }
  return pts;
}
/** threads as a row of thin raised bands */
function threads(a, x0, x1, y, z, r, k = 5) { const w = (x1 - x0) / (2 * k); for (let i = 0; i < k; i++) a.xcyl(x0 + 2 * i * w, x0 + (2 * i + 1) * w, y, z, r * 1.05, 14); }
const hexZ = (a, x, y, z0, z1, r) => a.cyl(x, y, z0, z1, r, 6);
/** a bolt standing on z with a nut on top and a head below */
function boltZ(a, x, y, z0, z1, r) { a.cyl(x, y, z0, z1, r * 0.5, 6); hexZ(a, x, y, z1, z1 + r * 1.1, r); hexZ(a, x, y, z0 - r * 1.1, z0, r); }
/** a floor stand: a post and a base plate under a pipe of radius r at height zc */
function stand(a, x, y, zc, r, Z0, bw = null) { const w = bw ?? r * 1.5; a.cyl(x, y, Z0 + 10, zc - r, r * 0.32, 10); a.box(x - w / 2, y - w / 2, Z0, x + w / 2, y + w / 2, Z0 + 10); a.box(x - r * 0.8, y - r * 0.8, zc - r - 6, x + r * 0.8, y + r * 0.8, zc - r); }
/** an I section along x: depth bd, flange width bw, top at ztop */
function beamX(a, y, x0, x1, ztop, bd, bw) { const z0 = ztop - bd; a.box(x0, y - bw / 2, z0, x1, y + bw / 2, z0 + bd * 0.1); a.box(x0, y - bw / 2, ztop - bd * 0.1, x1, y + bw / 2, ztop); a.box(x0, y - bd * 0.04, z0 + bd * 0.1, x1, y + bd * 0.04, ztop - bd * 0.1); }
/** an I section along y (toward the viewer) from y0 to y1 */
function beamY(a, x, y0, y1, ztop, bd, bw) { const z0 = ztop - bd; a.box(x - bw / 2, y0, z0, x + bw / 2, y1, z0 + bd * 0.1); a.box(x - bw / 2, y0, ztop - bd * 0.1, x + bw / 2, y1, ztop); a.box(x - bd * 0.04, y0, z0 + bd * 0.1, x + bd * 0.04, y1, ztop - bd * 0.1); }
/** the pipe, both flanges and bolts of a flanged run of size n along x from X0 for ff inches; returns the centre line */
function fbody(a, n, ff, up = 0) { const { X0, Z0, cy } = a, R = od(n) / 2, zc = Z0 + m.max(fo(n), R * up), X1 = X0 + ff * IN; a.xcyl(X0, X1, cy, zc, R * 1.05, 22); fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, zc, X1, -1); return { R, zc, X1, cx: (X0 + X1) / 2, cy, X0, Z0 }; }
/** a yoke, stem and hand wheel above a bonnet top zb: the wheel sits H above it */
function stemWheel(a, cx, cy, zb, H, R, wr, yoke = true, spokes = 5) {
  const rim = m.max(5, wr * 0.07), zw = zb + H, zy = zw - rim * 4;
  a.cyl(cx, cy, zb - R * 0.1, zb + R * 0.2, R * 1.15, 20);
  if (yoke) { for (const s of [-1, 1]) a.tube([[cx + s * R * 0.7, cy, zb], [cx + s * R * 0.55, cy, zy]], [R * 0.22, R * 0.2], 8); a.box(cx - R * 0.8, cy - R * 0.4, zy - R * 0.2, cx + R * 0.8, cy + R * 0.4, zy + R * 0.2); }
  a.cyl(cx, cy, zb, zw, R * 0.17, 10); a.cyl(cx, cy, zy - R * 0.5, zy + R * 0.2, R * 0.34, 10);
  handwheel(a, cx, cy, zw, wr, rim, spokes); a.cyl(cx, cy, zw + rim, zw + rim * 2.4, R * 0.18, 6);
}
/** a split pipe strap round the pipe on x at x: ring plus two bolted ears */
function strap(a, x, y, z, r, w = 0.7 * IN) { ring(a, 'x', y, z, r * 1.0, r + 0.32 * IN, x - w / 2, x + w / 2, r + 0.32 * IN, 22); for (const s of [-1, 1]) { a.box(x - w / 2, y + s * (r + 0.32 * IN) - 0.35 * IN, z - 0.45 * IN, x + w / 2, y + s * (r + 0.32 * IN) + 0.35 * IN + s * 0.5 * IN, z + 0.45 * IN); } }

// ------------------------------------------------------------------------------------------ fittings
/** forged threaded elbow: two bosses meeting in a round corner, end rings with bores */
function thrElbow(a, v) {
  const { X0, Z0, cy } = a, r0 = od(v.n) / 2, rb = r0 * 0.9 + 0.3 * IN, A = rb * 2.2, zc = Z0 + rb * 1.1, xc = X0 + A;
  a.xcyl(X0 + rb * 0.2, xc, cy, zc, rb, 20); a.cyl(xc, cy, zc, zc + A - rb * 0.2, rb, 20); a.ell(xc, cy, zc, rb * 1.02, rb * 1.02, rb * 1.02, 18, 10);
  ring(a, 'x', cy, zc, r0 * 0.78, rb * 1.1, X0, X0 + rb * 0.2, rb * 1.1, 20); ring(a, 'z', xc, cy, r0 * 0.78, rb * 1.1, zc + A - rb * 0.2, zc + A, rb * 1.1, 20);
  a.outline(); a.rect(X0, cy - rb, xc, cy + rb, 'EQUIP-DETAIL'); a.circ(xc, cy, rb, 'EQUIP-DETAIL'); a.circ(xc, cy, r0 * 0.78, 'EQUIP-DETAIL');
  a.log('Added the two forged bosses meeting in a round corner with banded ends and open bores, a threaded elbow (plan and 3D).');
}
function thrTee(a, v) {
  const { X0, Z0, cy } = a, r0 = od(v.n) / 2, rb = r0 * 0.9 + 0.3 * IN, A = rb * 2.2, zc = Z0 + rb * 1.1, xc = X0 + A;
  a.xcyl(X0 + rb * 0.2, X0 + 2 * A - rb * 0.2, cy, zc, rb, 20); a.cyl(xc, cy, zc, zc + A - rb * 0.2, rb, 20); a.ell(xc, cy, zc, rb * 1.05, rb * 1.05, rb * 1.05, 18, 10);
  for (const [x0, x1] of [[X0, X0 + rb * 0.2], [X0 + 2 * A - rb * 0.2, X0 + 2 * A]]) ring(a, 'x', cy, zc, r0 * 0.78, rb * 1.1, x0, x1, rb * 1.1, 20);
  ring(a, 'z', xc, cy, r0 * 0.78, rb * 1.1, zc + A - rb * 0.2, zc + A, rb * 1.1, 20);
  a.outline(); a.rect(X0, cy - rb, X0 + 2 * A, cy + rb, 'EQUIP-DETAIL'); a.circ(xc, cy, rb, 'EQUIP-DETAIL'); a.circ(xc, cy, r0 * 0.78, 'EQUIP-DETAIL');
  a.log('Added the forged run, the side branch rising from a rounded crotch and the three banded open ends, a threaded tee (plan and 3D).');
}
function hexNipple(a, v) {
  const { X0, Z0, cy } = a, r0 = od(v.n) / 2, L = v.L * IN, rh = r0 * 1.18 + 0.12 * IN, hl = m.max(0.9 * IN, rh * 1.2), zc = Z0 + rh, c = X0 + L / 2;
  ring(a, 'x', cy, zc, r0 * 0.78, r0, X0, X0 + L, r0, 18); hex(a, c - hl / 2, c + hl / 2, cy, zc, rh);
  threads(a, X0, c - hl / 2 - 0.1 * IN, cy, zc, r0, 4); threads(a, c + hl / 2 + 0.1 * IN, X0 + L, cy, zc, r0, 4);
  a.outline(); a.rect(c - hl / 2, cy - rh, c + hl / 2, cy + rh, 'EQUIP-DETAIL'); a.line(X0, cy - r0, X0 + L, cy - r0, 'EQUIP-DETAIL'); a.line(X0, cy + r0, X0 + L, cy + r0, 'EQUIP-DETAIL');
  a.log('Added the hollow pipe body with a hexagonal wrench section in the middle and a threaded band at each end (plan and 3D).');
}
function thrCoupling(a, v) {
  const { X0, Z0, cy } = a, r0 = od(v.n) / 2, rc = r0 * 1.2 + 0.12 * IN, L = r0 * 3.6 + 0.6 * IN, zc = Z0 + rc * 1.06, e = L * 0.14;
  ring(a, 'x', cy, zc, r0 * 0.88, rc * 0.9, X0, X0 + e, rc, 24); ring(a, 'x', cy, zc, r0 * 0.88, rc, X0 + e, X0 + L - e, rc, 24); ring(a, 'x', cy, zc, r0 * 0.88, rc, X0 + L - e, X0 + L, rc * 0.9, 24);
  a.xcyl(X0 + L / 2 - 0.12 * IN, X0 + L / 2 + 0.12 * IN, cy, zc, rc * 1.05, 24);
  a.outline(); a.rect(X0, cy - rc, X0 + L, cy + rc, 'EQUIP-DETAIL'); a.line(X0 + L / 2, cy - rc, X0 + L / 2, cy + rc, 'EQUIP-DETAIL');
  a.log('Added the sleeve with chamfered ends, the open threaded bore and the centre stop rib, a full coupling (plan and 3D).');
}
function hexPlug(a, v) {
  const { X0, Z0, cy } = a, r0 = od(v.n) / 2, tl = r0 * 2.4 + 0.4 * IN, rh = r0 * 1.0 + 0.2 * IN, hl = rh * 1.0, zc = Z0 + rh * 1.22, x1 = X0 + tl;
  a.xcyl(X0, x1, cy, zc, r0 * 0.96, 18); threads(a, X0 + 0.05 * IN, x1 - 0.1 * IN, cy, zc, r0 * 0.96, 5);
  a.xcyl(x1, x1 + 0.12 * IN, cy, zc, rh * 1.2, 22);
  if (v.head === 'square') a.box(x1 + 0.12 * IN, cy - rh * 0.85, zc - rh * 0.85, x1 + 0.12 * IN + hl, cy + rh * 0.85, zc + rh * 0.85); else hex(a, x1 + 0.12 * IN, x1 + 0.12 * IN + hl, cy, zc, rh);
  a.outline(); a.rect(x1, cy - rh * 1.2, x1 + 0.12 * IN + hl, cy + rh * 1.2, 'EQUIP-DETAIL'); a.circ(X0 + tl / 2, cy, r0 * 0.96, 'EQUIP-HIDDEN');
  a.log(`Added the threaded shank, the collar and the ${v.head === 'square' ? 'square' : 'hexagonal'} head of a pipe plug (plan and 3D).`);
}
/** a 180 degree long-radius return bend standing in the vertical plane with two parallel legs */
function returnBend(a, v) {
  const { X0, Z0, cy } = a, n = v.n, r = od(n) / 2, R = 1.5 * n * IN, leg = m.max(2.5 * IN, 1.1 * n * IN), z0 = Z0 + r + 4;
  sweep(a, pathPts(cy, X0, z0, 0, [['L', leg], ['A', 180, R], ['L', leg]]), r, 22);
  for (const z of [z0, z0 + 2 * R]) a.xcyl(X0, X0 + 0.2 * IN, cy, z, r * 1.04, 22);
  a.outline(); a.line(X0, cy, X0 + leg + R, cy, 'EQUIP-DETAIL'); a.circ(X0 + leg + R, cy, r, 'EQUIP-DETAIL');
  a.log('Added the two parallel legs joined by a half-circle long-radius bend with bevelled weld ends, a return bend (plan and 3D).');
}
/** a slip-on flange standing face-on on a base plate, with its pipe stub welded behind */
function slipOn(a, v) {
  const { X0, Z0, cy } = a, n = v.n, F = FLG[n], ro = F[0] * IN / 2, t = F[1] * IN, r = od(n) / 2, bd = F[4] * IN, S = r * 1.6 + 2 * IN, zc = Z0 + 0.5 * IN + ro, cx = X0 + ro, y1 = cy - (t + S) / 2;
  a.box(cx - ro * 0.7, y1 - 0.3 * IN, Z0, cx + ro * 0.7, y1 + t + S * 0.7, Z0 + 0.5 * IN);
  flange(a, 'y', cx, zc, y1, 1, ro, t, r * 1.02, F[2], F[3] * IN / 2, bd, 0, false);
  ring(a, 'y', cx, zc, r * 1.02, ro * 0.64, y1 - 0.07 * IN, y1, ro * 0.64, 28);
  a.ycyl(y1 + t * 0.3, y1 + t + S, cx, zc, r, 24); ring(a, 'y', cx, zc, r * 0.98, r * 1.3, y1 + t, y1 + t + 0.35 * IN, r, 24);
  a.rect(cx - ro, y1, cx + ro, y1 + t, 'EQUIP'); a.rect(cx - r, y1 + t, cx + r, y1 + t + S, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
  a.log(`Added the face-on slip-on plate with its raised face and ${F[2]} bolts and nuts, the pipe stub with a fillet weld behind it and a base plate (plan and 3D).`);
}
/** a stub end with a loose backing flange behind it, along x */
function lapJoint(a, v) {
  const { X0, Z0, cy } = a, n = v.n, F = FLG[n], ro = F[0] * IN / 2, t = F[1] * IN, r = od(n) / 2, bd = F[4] * IN, zc = Z0 + ro, L = (n * 0.9 + 6) * IN, X1 = X0 + L, lap = 0.5 * IN;
  a.xcyl(X0, X1 - lap, cy, zc, r, 24); a.xcyl(X0, X0 + 0.2 * IN, cy, zc, r * 1.04, 24);
  ring(a, 'x', cy, zc, r * 0.98, F[3] * IN / 2 - bd * 0.2, X1 - lap, X1, F[3] * IN / 2 - bd * 0.2, 28); a.xcyl(X1 - lap, X1, cy, zc, r * 1.1, 24);
  const xb = X1 - lap - t * 1.0;
  flange(a, 'x', cy, zc, xb, 1, ro, t, r * 1.04, F[2], F[3] * IN / 2, bd, 0, false);
  a.outline(); a.rect(X1 - lap - t, cy - ro, X1 - lap, cy + ro, 'EQUIP-DETAIL'); a.rect(X1 - lap, cy - F[3] * IN / 2, X1, cy + F[3] * IN / 2, 'EQUIP-DETAIL');
  a.log('Added the pipe with a flared lap stub end, and a loose backing flange with bolts and nuts sliding behind the lap (plan and 3D).');
}
/** a figure-eight spectacle blind: a solid disc and a ring joined by a web, on a base plate with chocks */
function spectacle(a, v) {
  const { X0, Z0, cy } = a, n = v.n, F = FLG[n], Rp = F[0] * IN * 0.39, tp = m.max(0.3 * IN, F[1] * IN * 0.6), r = od(n) / 2, wl = Rp * 0.5, zc = Z0 + 0.5 * IN + Rp, d1 = X0 + Rp, d2 = d1 + 2 * Rp + wl, y0 = cy - tp / 2;
  a.box(X0, y0 - 0.6 * IN, Z0, d2 + Rp, y0 + tp + 0.6 * IN, Z0 + 0.5 * IN);
  a.ycyl(y0, y0 + tp, d1, zc, Rp, 30); ring(a, 'y', d2, zc, r * 0.95, Rp, y0, y0 + tp, Rp, 30);
  a.box(d1 + Rp * 0.9, y0, zc - Rp * 0.18, d2 - Rp * 0.9, y0 + tp, zc + Rp * 0.18);
  a.box(d1 - Rp * 0.22, y0, zc + Rp * 0.96, d1 + Rp * 0.22, y0 + tp, zc + Rp * 1.4); ring(a, 'y', d1, zc + Rp * 1.22, Rp * 0.07, Rp * 0.14, y0, y0 + tp, Rp * 0.14, 12);
  for (const x of [X0 + Rp * 0.25, d2 + Rp * 0.8]) prismY(a, [[x - Rp * 0.2, Z0 + 0.5 * IN], [x + Rp * 0.2, Z0 + 0.5 * IN], [x + Rp * 0.1, Z0 + 0.5 * IN + Rp * 0.3]], y0, y0 + tp);
  a.outline(); a.rect(d1 - Rp, y0, d2 + Rp, y0 + tp, 'EQUIP-DETAIL'); a.circ(d2, cy, r * 0.95, 'EQUIP-HIDDEN');
  a.log('Added the solid blind disc and the open ring joined by a web, the lifting tab with its hole, the base plate and two chocks (plan and 3D).');
}
/** a butt-weld cross: a run with a branch up and a branch down */
function xCross(a, v) {
  const { X0, Z0, cy } = a, n = v.n, r = od(n) / 2, hb = TEEM[n] * IN, zc = Z0 + hb + 5, cx = X0 + hb;
  a.xcyl(X0 + 2, X0 + 2 * hb, cy, zc, r, 22); a.cyl(cx, cy, zc - hb, zc + hb, r, 22); a.ell(cx, cy, zc, r * 1.14, r * 1.14, r * 1.14, 16, 8);
  for (const x of [X0 + 2, X0 + 2 * hb]) a.xcyl(x, x + (x > cx ? -0.2 : 0.2) * IN, cy, zc, r * 1.04, 22);
  for (const z of [zc - hb, zc + hb]) a.cyl(cx, cy, z + (z > zc ? -0.2 * IN : 0), z + (z > zc ? 0 : 0.2 * IN), r * 1.04, 22);
  a.outline(); a.rect(X0, cy - r, X0 + 2 * hb, cy + r, 'EQUIP-DETAIL'); a.circ(cx, cy, r, 'EQUIP-DETAIL');
  a.log('Added the run with a forged centre and a branch rising and a branch dropping at right angles, with bevelled weld ends, a cross (plan and 3D).');
}
/** a 45 degree lateral: a run with a branch leaving at 45 degrees */
function lateral(a, v) {
  const { X0, Z0, cy } = a, n = v.n, r = od(n) / 2, L = TEEM[n] * 2.9 * IN, Lb = TEEM[n] * 1.9 * IN, zc = Z0 + r * 1.14 + 5, xb = X0 + L * 0.38, k = m.SQRT1_2;
  a.xcyl(X0 + 2, X0 + L, cy, zc, r, 22); a.tube([[xb, cy, zc], [xb + k * Lb, cy, zc + k * Lb]], [r, r], 22); a.ell(xb, cy, zc, r * 1.12, r * 1.12, r * 1.12, 16, 8);
  a.xcyl(X0 + 2, X0 + 2 + 0.2 * IN, cy, zc, r * 1.04, 22); a.xcyl(X0 + L - 0.2 * IN, X0 + L, cy, zc, r * 1.04, 22);
  a.tube([[xb + k * (Lb - 0.2 * IN), cy, zc + k * (Lb - 0.2 * IN)], [xb + k * Lb, cy, zc + k * Lb]], [r * 1.04, r * 1.04], 22);
  a.outline(); a.rect(X0, cy - r, X0 + L, cy + r, 'EQUIP-DETAIL'); a.line(xb, cy, xb + k * Lb, cy, 'EQUIP-DETAIL');
  a.log('Added the straight run and the branch leaving at 45 degrees from a forged crotch, with bevelled weld ends, a lateral (plan and 3D).');
}
/** a header pipe with a branch outlet fitting: weld (tapered saddle), thread (short boss) or socket (boss with a flat shoulder) */
function olet(a, v) {
  const { X0, Z0, cy } = a, rh = od(v.nh) / 2, rb = od(v.nb) / 2, LH = m.max(8 * IN, rh * 3.6), zc = Z0 + rh + 4, cx = X0 + LH / 2;
  ring(a, 'x', cy, zc, rh * 0.9, rh, X0, X0 + LH, rh, 24);
  if (v.kind === 'weld') { a.tube([[cx, cy, zc + rh * 0.8], [cx, cy, zc + rh + rb * 1.6]], [rb * 1.9, rb * 1.15], 22); a.cyl(cx, cy, zc + rh + rb * 1.6 - 0.2 * IN, zc + rh + rb * 1.6, rb * 1.2, 22); }
  else if (v.kind === 'thread') { const rt = rb * 1.35 + 0.15 * IN; a.tube([[cx, cy, zc + rh * 0.8], [cx, cy, zc + rh + rb * 1.5]], [rt * 1.25, rt], 20); ring(a, 'z', cx, cy, rb * 0.82, rt * 1.1, zc + rh + rb * 1.5 - 0.2 * IN, zc + rh + rb * 1.5, rt * 1.1, 20); }
  else { const rt = rb * 1.4 + 0.2 * IN; a.tube([[cx, cy, zc + rh * 0.8], [cx, cy, zc + rh + rb * 1.8]], [rt * 1.2, rt], 20); a.cyl(cx, cy, zc + rh + rb * 1.8, zc + rh + rb * 2.1, rt * 1.12, 6); ring(a, 'z', cx, cy, rb * 1.02, rt * 0.9, zc + rh + rb * 2.1, zc + rh + rb * 2.25, rt * 0.9, 20); }
  a.xcyl(X0, X0 + 0.2 * IN, cy, zc, rh * 1.04, 24); a.xcyl(X0 + LH - 0.2 * IN, X0 + LH, cy, zc, rh * 1.04, 24);
  a.outline(); a.circ(cx, cy, rb * 1.4, 'EQUIP-DETAIL'); a.circ(cx, cy, rb * 0.9, 'EQUIP-DETAIL'); a.rect(X0, cy - rh, X0 + LH, cy + rh, 'EQUIP-DETAIL');
  a.log(`Added the header pipe with a ${v.kind === 'weld' ? 'tapered weld-on' : v.kind === 'thread' ? 'threaded' : 'socket-weld'} branch outlet fitting and its open bore (plan and 3D).`);
}
/** a flanged expansion joint: a rubber arch or metal convolutions between two flanges with tie rods */
function expJoint(a, v) {
  const { X0, Z0, cy } = a, n = v.n, F = FLG[n], r = od(n) / 2, ro = F[0] * IN / 2, t = F[1] * IN, zc = Z0 + ro, L = v.L * IN, X1 = X0 + L, cx = X0 + L / 2, rbc = F[3] * IN / 2;
  fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, zc, X1, -1); a.xcyl(X0 + t, X1 - t, cy, zc, r * 1.0, 22);
  if (v.conv === 0) { a.ell(cx, cy, zc, (L - 2 * t) * 0.44, r * 1.6, r * 1.6, 24, 10); for (const s of [-1, 1]) ring(a, 'x', cy, zc, r * 0.9, r * 1.28, cx + s * L * 0.3 - 0.4 * IN, cx + s * L * 0.3 + 0.4 * IN, r * 1.28, 24); }
  else for (let k = 0; k < v.conv; k++) { const p = (L - 2 * t * 2.7) / v.conv, xk = X0 + t * 2.7 + p * (k + 0.5); a.ell(xk, cy, zc, p * 0.46, r * 1.32, r * 1.32, 22, 8); }
  for (let k = 0; k < 4; k++) { const th = (k / 4) * TAU + 0.2, y = cy + rbc * m.cos(th), z = zc + rbc * m.sin(th); a.xcyl(X0 + t, X1 - t, y, z, F[4] * IN * 0.45, 6); for (const x of [X0 + t, X1 - t]) hex(a, x - (x > cx ? 0 : 0.6 * IN), x + (x > cx ? 0.6 * IN : 0), y, z, F[4] * IN * 0.9); }
  a.outline(); a.rect(X0 + t * 2.7, cy - r * 1.4, X1 - t * 2.7, cy + r * 1.4, 'EQUIP-DETAIL'); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
  a.log(`Added the two bolted flanges, ${v.conv === 0 ? 'the single rubber arch with two reinforcing bands' : `${v.conv} metal convolutions`} and four tie rods with nuts (plan and 3D).`);
}
/** a grooved pipe coupling: two pipe ends with grooves and a two-piece housing with bolt lugs */
function grooved(a, v) {
  const { X0, Z0, cy } = a, n = v.n, r = od(n) / 2, hw = r * 0.7 + 0.8 * IN, rh = r * 1.22, zc = Z0 + rh, L = hw * 2 + r * 3.5 + 2 * IN, cx = X0 + L / 2, X1 = X0 + L;
  a.xcyl(X0, X1, cy, zc, r, 22); for (const x of [cx - hw * 0.8, cx + hw * 0.8]) a.xcyl(x - 0.15 * IN, x + 0.15 * IN, cy, zc, r * 1.03, 22);
  ring(a, 'x', cy, zc, r * 1.0, rh, cx - hw, cx + hw, rh, 28); ring(a, 'x', cy, zc, r * 1.0, rh * 1.06, cx - hw * 0.1, cx + hw * 0.1, rh * 1.06, 28);
  for (const s of [-1, 1]) { const y = cy + s * (rh + 0.5 * IN); a.box(cx - hw * 0.9, y - 0.55 * IN, zc - 0.5 * IN, cx + hw * 0.9, y + 0.55 * IN, zc + 0.5 * IN); for (const bx of [-0.5, 0.5]) boltZ(a, cx + bx * hw, y, zc - 0.5 * IN, zc + 0.5 * IN, 0.3 * IN); }
  a.outline(); a.rect(cx - hw, cy - rh, cx + hw, cy + rh, 'EQUIP-DETAIL'); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
  a.log('Added the two grooved pipe ends, the two-piece housing with its centre seal rib and two bolt lugs with bolts and nuts (plan and 3D).');
}
const TEEM = { 2: 2.5, 3: 3.4, 4: 4.1, 6: 5.6, 8: 6.9, 10: 8.4, 12: 9.7, 16: 12, 20: 14.5 };

// ------------------------------------------------------------------------------------------ valves
function plugValve(a, v) {
  const { cx, cy, zc, R } = fbody(a, v.n, v.ff, 1.95);
  a.tube([[cx, cy, zc - R * 1.3], [cx, cy, zc + R * 1.6]], [R * 1.2, R * 1.45], 24); a.cyl(cx, cy, zc - R * 1.75, zc - R * 1.3, R * 0.9, 18); a.cyl(cx, cy, zc - R * 1.95, zc - R * 1.75, R * 0.45, 8);
  const zt = zc + R * 1.6; a.cyl(cx, cy, zt, zt + R * 0.3, R * 1.75, 26);
  for (let k = 0; k < 6; k++) { const th = (k / 6) * TAU; a.cyl(cx + R * 1.55 * m.cos(th), cy + R * 1.55 * m.sin(th), zt + R * 0.3, zt + R * 0.5, R * 0.13, 6); }
  a.cyl(cx, cy, zt + R * 0.3, zt + R * 0.9, R * 0.42, 10); a.box(cx - R * 0.32, cy - R * 0.32, zt + R * 0.9, cx + R * 0.32, cy + R * 0.32, zt + R * 1.35);
  a.box(cx - R * 0.55, cy - R * 0.2, zt + R * 1.35, cx + R * 3.5, cy + R * 0.2, zt + R * 1.65); a.xcyl(cx + R * 3.1, cx + R * 3.9, cy, zt + R * 1.5, R * 0.36, 10);
  a.cyl(cx - R * 1.0, cy, zt + R * 0.3, zt + R * 0.8, R * 0.2, 8);
  a.outline(); a.circ(cx, cy, R * 1.45, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 1.75, 'EQUIP-DETAIL'); a.rect(cx, cy - R * 0.2, cx + R * 3.9, cy + R * 0.2, 'EQUIP-DETAIL');
  a.log('Added the flanged ends, the tapered plug body with a bottom cap, the bolted cover, a sealant screw, the square stem and the long wrench (plan and 3D).');
}
function needle(a, v) {
  const { X0, Z0, cy } = a, R = od(v.n) / 2, rb = R * 0.95 + 0.3 * IN, L = v.ff * IN, cx = X0 + L / 2, zc = Z0 + rb * 1.3;
  a.xcyl(X0, X0 + L, cy, zc, rb * 0.8, 18); threads(a, X0, X0 + L * 0.22, cy, zc, rb * 0.8, 4); threads(a, X0 + L * 0.78, X0 + L, cy, zc, rb * 0.8, 4);
  hex(a, X0 + L * 0.24, X0 + L * 0.34, cy, zc, rb * 1.0); hex(a, X0 + L * 0.66, X0 + L * 0.76, cy, zc, rb * 1.0); a.ell(cx, cy, zc, L * 0.2, rb * 1.3, rb * 1.3, 18, 10);
  const zb = zc + rb * 1.1; a.cyl(cx, cy, zb - rb * 0.3, zb + rb * 1.1, rb * 0.85, 6); a.cyl(cx, cy, zb + rb * 1.1, zb + rb * 1.5, rb * 0.62, 6); a.cyl(cx, cy, zb + rb * 1.5, zb + rb * 2.3, rb * 0.22, 8);
  const zh = zb + rb * 2.3; a.cyl(cx, cy, zh, zh + rb * 1.2, rb * 0.95, 16);
  for (let k = 0; k < 14; k++) { const th = (k / 14) * TAU; a.cyl(cx + rb * 0.97 * m.cos(th), cy + rb * 0.97 * m.sin(th), zh + rb * 0.05, zh + rb * 1.15, rb * 0.07, 4); }
  a.cyl(cx, cy, zh + rb * 1.2, zh + rb * 1.38, rb * 0.55, 12); a.cyl(cx, cy, zh + rb * 1.38, zh + rb * 1.6, rb * 0.25, 6);
  a.outline(); a.rect(X0, cy - rb * 0.8, X0 + L, cy + rb * 0.8, 'EQUIP-DETAIL'); a.circ(cx, cy, rb * 0.95, 'EQUIP-DETAIL');
  a.log('Added the threaded tails, the two hex collars, the globe-shaped body, the hex bonnet and packing nut, the slender stem and the knurled handle with its lock cap (plan and 3D).');
}
function diaphragmValve(a, v) {
  const { cx, cy, zc, R } = fbody(a, v.n, v.ff);
  a.ell(cx, cy, zc - R * 0.1, v.ff * IN * 0.3, R * 1.7, R * 1.6, 22, 12); a.cyl(cx, cy, zc, zc + R * 1.5, R * 1.3, 22);
  const zb = zc + R * 1.5, br = R * 2.0; a.cyl(cx, cy, zb, zb + R * 0.4, br * 1.08, 26);
  for (let k = 0; k < 10; k++) { const th = (k / 10) * TAU; boltZ(a, cx + br * 0.96 * m.cos(th), cy + br * 0.96 * m.sin(th), zb, zb + R * 0.4, R * 0.15); }
  a.cyl(cx, cy, zb + R * 0.4, zb + R * 1.5, br * 0.82, 26); a.ell(cx, cy, zb + R * 1.5, br * 0.82, br * 0.82, R * 0.7, 22, 8);
  const zi = zb + R * 2.0; a.cyl(cx, cy, zi - R * 0.2, zi + R * 1.9, R * 0.17, 10); a.cyl(cx, cy, zi + R * 0.6, zi + R * 1.9, R * 0.38, 10);
  handwheel(a, cx, cy, zi + R * 1.9, R * 2.2, m.max(R * 0.16, 6), 3); a.cyl(cx, cy, zi + R * 1.9, zi + R * 2.3, R * 0.3, 8);
  a.outline(); a.circ(cx, cy, br, 'EQUIP-DETAIL');
  a.log('Added the flanged weir body, the two-part bonnet with ring bolts and a domed cover, the stem with its position indicator and the round three-spoke hand wheel (plan and 3D).');
}
function knifeGate(a, v) {
  const { X0, Z0, cy } = a, n = v.n, R = od(n) / 2, F = FLG[n], wt = (n * 0.15 + 1.2) * IN, st = F[1] * IN * 2.7 + 2.5 * IN, X1 = X0 + 2 * st + wt, cx = (X0 + X1) / 2, zc = Z0 + fo(n), Rb = F[3] * IN / 2 - F[4] * IN * 0.7;
  a.xcyl(X0, X0 + st, cy, zc, R, 22); a.xcyl(X1 - st, X1, cy, zc, R, 22); fl(a, n, 'x', cy, zc, X0 + st, -1); fl(a, n, 'x', cy, zc, X1 - st, 1);
  for (let k = 0; k < F[2]; k++) { const th = (k / F[2]) * TAU + 0.2; cylA(a, 'x', cy + F[3] * IN / 2 * m.cos(th), zc + F[3] * IN / 2 * m.sin(th), X0 + st - F[1] * IN * 1.2, X1 - st + F[1] * IN * 1.2, F[4] * IN * 0.45, 6); }
  ring(a, 'x', cy, zc, R * 0.85, Rb, cx - wt / 2, cx + wt / 2, Rb, 28);
  const H = R * 3.6, ztop = zc + Rb + H;
  a.box(cx - wt * 0.2, cy - Rb * 0.95, zc, cx + wt * 0.2, cy + Rb * 0.95, zc + Rb * 0.9); a.box(cx - wt * 0.12, cy - Rb * 0.8, zc + Rb * 0.9, cx + wt * 0.12, cy + Rb * 0.8, ztop - R * 0.4);
  for (const s of [-1, 1]) a.box(cx - wt / 2, cy + s * Rb * 0.98 - R * 0.14, zc, cx + wt / 2, cy + s * Rb * 0.98 + R * 0.14, ztop);
  a.box(cx - wt / 2, cy - Rb * 1.12, ztop, cx + wt / 2, cy + Rb * 1.12, ztop + R * 0.35); a.box(cx - wt * 0.3, cy - R * 0.6, zc + Rb * 0.95, cx + wt * 0.3, cy + R * 0.6, zc + Rb * 1.4);
  a.cyl(cx, cy, zc + Rb * 1.4, ztop + R * 1.5, R * 0.14, 8); handwheel(a, cx, cy, ztop + R * 1.5, R * 1.2, m.max(R * 0.13, 6), 5); a.cyl(cx, cy, ztop + R * 0.35, ztop + R * 0.9, R * 0.34, 10);
  a.outline(); a.rect(cx - wt / 2, cy - Rb, cx + wt / 2, cy + Rb, 'EQUIP');
  a.log('Added the stub pipes with bolted flanges and through-bolts, the thin wafer body, the exposed knife blade, two yoke columns with a top bridge, the stem and the hand wheel (plan and 3D).');
}
function angleGlobe(a, v) {
  const { X0, Z0, cy } = a, n = v.n, R = od(n) / 2, F = FLG[n], A = (n * 0.9 + 4) * IN, xc = X0 + A, zc = Z0 + F[1] * IN * 2.7 + R * 1.6 + 2 * IN;
  fl(a, n, 'z', xc, cy, Z0, 1); a.cyl(xc, cy, Z0 + F[1] * IN * 2.7 - 1, zc, R * 1.05, 22);
  a.xcyl(X0 + F[1] * IN * 2.7 - 1, xc, cy, zc, R * 1.05, 22); fl(a, n, 'x', cy, zc, X0, 1);
  a.ell(xc, cy, zc, R * 1.75, R * 1.75, R * 1.7, 22, 12); a.cyl(xc, cy, zc + R * 0.7, zc + R * 2.5, R * 1.0, 20);
  stemWheel(a, xc, cy, zc + R * 2.5, R * 3.2, R, fo(n) * 0.96);
  a.outline(); a.circ(xc, cy, R * 1.75, 'EQUIP-DETAIL'); a.rect(X0, cy - R, xc, cy + R, 'EQUIP-DETAIL');
  a.log('Added the flanged side inlet, the flanged bottom outlet standing on its face, the round body, the bonnet, the yoke with stem and the hand wheel (plan and 3D).');
}
function thrBall(a, v) {
  const { X0, Z0, cy } = a, R = od(v.n) / 2, rb = R * 0.9 + 0.25 * IN, L = v.ff * IN, cx = X0 + L * 0.46, zc = Z0 + rb * 1.35, X1 = X0 + L;
  a.xcyl(X0, X1, cy, zc, rb * 0.82, 18); threads(a, X0, X0 + L * 0.2, cy, zc, rb * 0.82, 4); threads(a, X1 - L * 0.2, X1, cy, zc, rb * 0.82, 4);
  a.xcyl(cx - L * 0.22, cx + L * 0.2, cy, zc, rb * 1.3, 24); a.ell(cx, cy, zc, L * 0.18, rb * 1.34, rb * 1.34, 20, 10); hex(a, cx + L * 0.2, cx + L * 0.36, cy, zc, rb * 1.18); a.xcyl(cx + L * 0.19, cx + L * 0.23, cy, zc, rb * 1.36, 24);
  hex(a, X0 + L * 0.2, cx - L * 0.22, cy, zc, rb * 1.1);
  const zn = zc + rb * 1.34; a.cyl(cx, cy, zn - 5, zn + rb * 0.7, rb * 0.5, 10); hexZ(a, cx, cy, zn + rb * 0.1, zn + rb * 0.5, rb * 0.62); a.box(cx - rb * 0.5, cy - rb * 0.4, zn + rb * 0.7, cx + rb * 0.4, cy + rb * 0.4, zn + rb * 0.85);
  const ll = rb * 4.2, zl = zn + rb * 0.85; a.box(cx - rb * 0.4, cy - rb * 0.2, zl, cx + ll * 0.7, cy + rb * 0.2, zl + rb * 0.22); a.xcyl(cx + ll * 0.4, cx + ll, cy, zl + rb * 0.11, rb * 0.34, 10); a.box(cx - rb * 0.45, cy - rb * 0.4, zl - 0.0, cx - rb * 0.3, cy + rb * 0.4, zl + rb * 0.3);
  a.outline(); a.rect(cx - L * 0.22, cy - rb * 1.3, cx + L * 0.2, cy + rb * 1.3, 'EQUIP-DETAIL'); a.rect(cx - rb * 0.4, cy - rb * 0.2, cx + ll, cy + rb * 0.2, 'EQUIP-DETAIL');
  a.log('Added the threaded tails with hex ends, the round main body, the screwed end cap, the stem neck with packing nut and stop plate and the lever with its grip sleeve (plan and 3D).');
}
function dualCheck(a, v) {
  const { X0, Z0, cy } = a, n = v.n, R = od(n) / 2, F = FLG[n], t = F[1] * IN, st = t * 2.7 + 3 * IN, wt = (n * 0.14 + 1.2) * IN, X1 = X0 + 2 * st + wt, cx = (X0 + X1) / 2, zc = Z0 + fo(n), Rb = F[3] * IN / 2 - F[4] * IN * 0.8;
  a.xcyl(X0, X0 + st, cy, zc, R, 22); a.xcyl(X1 - st, X1, cy, zc, R, 22); fl(a, n, 'x', cy, zc, X0 + st, -1); fl(a, n, 'x', cy, zc, X1 - st, 1);
  for (let k = 0; k < F[2]; k++) { const th = (k / F[2]) * TAU + 0.2; cylA(a, 'x', cy + F[3] * IN / 2 * m.cos(th), zc + F[3] * IN / 2 * m.sin(th), X0 + st - t * 1.2, X1 - st + t * 1.2, F[4] * IN * 0.45, 6); }
  ring(a, 'x', cy, zc, R * 0.8, Rb, cx - wt / 2, cx + wt / 2, Rb, 28); a.xcyl(cx - wt * 0.2, cx + wt * 0.2, cy, zc, R * 0.85, 22);
  a.ycyl(cy - R * 0.9, cy + R * 0.9, cx, zc, R * 0.09, 8); a.box(cx - wt * 0.3, cy - R * 0.14, zc + R * 0.3, cx + wt * 0.3, cy + R * 0.14, zc + R * 0.8); a.xcyl(cx - wt * 0.5, cx + wt * 0.5, cy - Rb * 0.5, zc + Rb * 0.9, R * 0.12, 6);
  a.box(cx - wt * 0.3, cy - R * 0.25, zc + Rb * 0.96, cx + wt * 0.3, cy + R * 0.25, zc + Rb * 1.4); ring(a, 'y', cx, zc + Rb * 1.18, R * 0.07, R * 0.17, cy - R * 0.25, cy + R * 0.25, R * 0.17, 12);
  a.outline(); a.rect(cx - wt / 2, cy - Rb, cx + wt / 2, cy + Rb, 'EQUIP'); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
  a.log('Added the stub pipes with bolted flanges and long studs, the wafer body between them with its two hinged plates on a centre pin and a lifting lug (plan and 3D).');
}
function footValve(a, v) {
  const { X0, Z0, cy } = a, n = v.n, R = od(n) / 2, F = FLG[n], ro = F[0] * IN / 2, t = F[1] * IN, hs = v.hs * IN, cx = X0 + ro, zb = Z0 + 0.5 * IN, zv = zb + hs, nbar = 16, rs = R * 1.7;
  a.cyl(cx, cy, zb - 0.0, zb + 0.4 * IN, rs * 1.05, 28); a.cyl(cx, cy, zb + hs - 0.3 * IN, zb + hs, rs * 1.05, 28);
  for (let k = 0; k < nbar; k++) { const th = (k / nbar) * TAU; a.cyl(cx + rs * m.cos(th), cy + rs * m.sin(th), zb, zb + hs, R * 0.07, 4); }
  for (const f of [0.35, 0.7]) ring(a, 'z', cx, cy, rs * 0.97, rs * 1.03, zb + hs * f - 4, zb + hs * f + 4, rs * 1.03, 28);
  a.cyl(cx, cy, zv, zv + R * 1.6, R * 1.35, 22); a.ell(cx, cy, zv + R * 1.2, R * 1.45, R * 1.45, R * 0.7, 18, 6);
  a.cyl(cx, cy, zv + R * 1.6, zv + R * 1.6 + t * 1.7, R * 1.05, 22); flange(a, 'z', cx, cy, zv + R * 1.6 + t * 1.7, 1, ro, t, R * 0.85, F[2], F[3] * IN / 2, F[4] * IN, 0, true);
  a.box(cx - R * 0.15, cy - ro * 0.3, zv + R * 0.6, cx + R * 0.15, cy + ro * 0.3, zv + R * 0.75);
  a.outline(); a.circ(cx, cy, rs, 'EQUIP-DETAIL');
  a.log('Added the cylindrical strainer basket of vertical bars with two hoops and end rings, the lifting valve body above it and the bolted flange on top, a foot valve (plan and 3D).');
}
function prv(a, v) {
  const { cx, cy, zc, R } = fbody(a, v.n, v.ff);
  a.ell(cx, cy, zc + R * 0.2, v.ff * IN * 0.26, R * 1.8, R * 1.7, 22, 12); a.cyl(cx, cy, zc + R * 0.5, zc + R * 2.4, R * 1.0, 20);
  const zb = zc + R * 2.4, br = R * 1.45; a.cyl(cx, cy, zb, zb + R * 0.35, br * 1.2, 24);
  for (const s of [-1, 1]) a.tube([[cx + s * R * 0.85, cy, zb + R * 0.35], [cx + s * R * 0.85, cy, zb + R * 1.6]], [R * 0.2, R * 0.2], 8);
  a.cyl(cx, cy, zb + R * 0.35, zb + R * 3.0, br, 24); for (const f of [0.3, 0.55, 0.8]) a.cyl(cx, cy, zb + R * (0.35 + 2.65 * f) - 5, zb + R * (0.35 + 2.65 * f) + 5, br * 1.06, 24);
  a.cyl(cx, cy, zb + R * 3.0, zb + R * 3.25, br * 1.1, 24); a.cyl(cx, cy, zb + R * 3.25, zb + R * 3.9, R * 0.3, 8); hexZ(a, cx, cy, zb + R * 3.9, zb + R * 4.15, R * 0.45); hexZ(a, cx, cy, zb + R * 3.45, zb + R * 3.65, R * 0.5);
  const gx = cx + v.ff * IN * 0.3; a.tube([[gx, cy, zc + R * 0.9], [gx, cy, zc + R * 2.8]], [R * 0.2, R * 0.2], 8); gauge(a, gx, cy - R * 0.3, zc + R * 3.4, R * 0.9);
  a.outline(); a.circ(cx, cy, br, 'EQUIP-DETAIL');
  a.log('Added the flanged globe body, the yoke with two columns, the finned spring housing with its top cap, adjusting screw and lock nut and a pressure gauge on a tube (plan and 3D).');
}
function pneuBall(a, v) {
  const { cx, cy, zc, R, X0 } = fbody(a, v.n, v.ff), W = v.ff * IN;
  a.xcyl(cx - W * 0.26, cx + W * 0.26, cy, zc, R * 1.35, 24); a.ell(cx, cy, zc, W * 0.2, R * 1.5, R * 1.5, 20, 10);
  const zn = zc + R * 1.5; a.cyl(cx, cy, zn - 5, zn + R * 0.6, R * 0.5, 10); a.box(cx - R * 1.2, cy - R * 1.2, zn + R * 0.6, cx + R * 1.2, cy + R * 1.2, zn + R * 1.1);
  const ra = R * 1.5, za = zn + R * 1.1 + ra, len = R * 7; a.ycyl(cy - len / 2, cy + len / 2, cx, za, ra, 26);
  for (const s of [-1, 1]) { a.ycyl(cy + s * len / 2, cy + s * (len / 2 + R * 0.5), cx, za, ra * 1.12, 26); a.cyl(cx, cy + s * len * 0.4, za + ra, za + ra + R * 0.5, R * 0.2, 8); a.cyl(cx + ra * 0.55, cy + s * (len / 2 + 6), za - ra * 0.8, za + ra * 0.8, R * 0.08, 4); }
  a.box(cx - R * 0.8, cy - R * 0.8, za + ra * 0.8, cx + R * 0.8, cy + R * 0.8, za + ra + R * 0.5); a.cyl(cx, cy, za + ra + R * 0.5, za + ra + R * 0.9, R * 0.5, 12); a.ell(cx, cy, za + ra + R * 0.9, R * 0.5, R * 0.5, R * 0.3, 12, 5);
  const sx = cx + ra + R * 0.9; a.box(sx - R * 0.7, cy - len * 0.2, za - R * 1.0, sx + R * 0.7, cy + len * 0.2, za + R * 0.8); a.xcyl(sx + R * 0.7, sx + R * 1.5, cy, za - R * 0.1, R * 0.5, 14); a.box(sx - R * 0.7, cy - R * 0.5, za + R * 0.8, sx - R * 0.3, cy + R * 0.5, za + R * 1.0);
  a.line(X0, cy, X0 + W, cy, 'EQUIP-DETAIL'); a.outline(); a.rect(cx - R * 1.2, cy - len / 2, cx + R * 1.2, cy + len / 2, 'EQUIP-DETAIL');
  a.log('Added the flanged ball valve body, the bracket, a double-acting rack-and-pinion actuator with end caps and air ports, a position indicator with beacon dome and a solenoid block on the side (plan and 3D).');
}
function motorGate(a, v) {
  const { cx, cy, zc, R } = fbody(a, v.n, v.ff);
  a.ell(cx, cy, zc, v.ff * IN * 0.3, R * 1.5, R * 1.55, 20, 10); a.cyl(cx, cy, zc, zc + R * 2.2, R * 1.0, 20);
  const zb = zc + R * 2.2; a.cyl(cx, cy, zb - R * 0.1, zb + R * 0.2, R * 1.15, 20); for (const s of [-1, 1]) a.tube([[cx + s * R * 0.7, cy, zb], [cx + s * R * 0.55, cy, zb + R * 2.4]], [R * 0.22, R * 0.2], 8);
  const zg = zb + R * 2.4, gw = R * 1.25; a.box(cx - gw, cy - gw * 0.9, zg, cx + gw, cy + gw * 0.9, zg + R * 2.0); a.cyl(cx, cy, zg + R * 2.0, zg + R * 2.6, R * 0.9, 18); a.ell(cx, cy, zg + R * 2.6, R * 0.9, R * 0.9, R * 0.5, 16, 6);
  const mr = R * 0.95, mx0 = cx + gw, mx1 = mx0 + R * 3.2; a.xcyl(mx0, mx1, cy, zg + R * 1.0, mr, 22); for (let k = 0; k < 6; k++) a.xcyl(mx0 + (mx1 - mx0) * (k + 0.5) / 6, mx0 + (mx1 - mx0) * (k + 0.5) / 6 + 6, cy, zg + R * 1.0, mr * 1.1, 22);
  a.xcyl(mx1, mx1 + R * 0.4, cy, zg + R * 1.0, mr * 0.8, 16); a.box(mx0 + R * 1.0, cy - R * 0.5, zg + R * 1.0 + mr, mx0 + R * 2.0, cy + R * 0.5, zg + R * 1.0 + mr + R * 0.6);
  const wr = R * 1.0, yw = cy - gw * 0.9; ring(a, 'y', cx, zg + R * 1.0, wr * 0.88, wr, yw - R * 0.5 - 6, yw - R * 0.5, wr, 22); a.ycyl(yw - R * 0.5, yw, cx, zg + R * 1.0, R * 0.14, 8);
  a.tube([[cx - wr, yw - R * 0.5 + -3, zg + R * 1.0], [cx + wr, yw - R * 0.5 - 3, zg + R * 1.0]], [R * 0.07, R * 0.07], 5); a.tube([[cx, yw - R * 0.5 - 3, zg + R * 1.0 - wr], [cx, yw - R * 0.5 - 3, zg + R * 1.0 + wr]], [R * 0.07, R * 0.07], 5);
  a.outline(); a.rect(cx - gw, cy - gw * 0.9, cx + gw, cy + gw * 0.9, 'EQUIP-DETAIL'); a.rect(mx0, cy - mr, mx1, cy + mr, 'EQUIP-DETAIL');
  a.log('Added the flanged gate body, the yoke columns, an electric actuator gearbox with a finned motor and terminal box, a front hand wheel for manual override and the stem position dome (plan and 3D).');
}
function solenoid(a, v) {
  const { X0, Z0, cy } = a, R = od(v.n) / 2, rb = R * 0.95 + 0.3 * IN, L = v.ff * IN, cx = X0 + L / 2, zc = Z0 + rb * 1.2;
  a.xcyl(X0, X0 + L, cy, zc, rb * 0.8, 18); threads(a, X0, X0 + L * 0.2, cy, zc, rb * 0.8, 4); threads(a, X0 + L * 0.8, X0 + L, cy, zc, rb * 0.8, 4);
  a.box(cx - L * 0.28, cy - rb * 1.15, zc - rb * 1.15, cx + L * 0.28, cy + rb * 1.15, zc + rb * 1.0); hex(a, X0 + L * 0.2, cx - L * 0.28, cy, zc, rb * 1.0); hex(a, cx + L * 0.28, X0 + L * 0.8, cy, zc, rb * 1.0);
  const zb = zc + rb * 1.0, rc = rb * 1.2, ch = rb * 2.8; a.cyl(cx, cy, zb, zb + rb * 0.5, rb * 0.62, 12); a.cyl(cx, cy, zb + rb * 0.5, zb + rb * 0.5 + ch, rc, 22); a.cyl(cx, cy, zb + rb * 0.5, zb + rb * 0.75, rc * 1.06, 22); a.cyl(cx, cy, zb + rb * 0.5 + ch - rb * 0.25, zb + rb * 0.5 + ch, rc * 1.06, 22);
  a.cyl(cx, cy, zb + rb * 0.5 + ch, zb + rb * 0.5 + ch + rb * 0.4, rb * 0.42, 6);
  a.box(cx + rc * 0.9, cy - rb * 0.5, zb + rb * 1.3, cx + rc * 0.9 + rb * 1.1, cy + rb * 0.5, zb + rb * 2.3); a.cyl(cx + rc * 0.9 + rb * 0.55, cy, zb + rb * 2.3, zb + rb * 2.9, rb * 0.22, 8);
  a.outline(); a.rect(cx - L * 0.28, cy - rb * 1.15, cx + L * 0.28, cy + rb * 1.15, 'EQUIP-DETAIL'); a.circ(cx, cy, rc, 'EQUIP-DETAIL');
  a.log('Added the threaded tails, the square valve body, the bonnet nut, the round coil housing with its end caps and nut and the side plug-in connector with a cable gland (plan and 3D).');
}
function steamTrap(a, v) {
  const { X0, Z0, cy } = a, R = od(v.n) / 2, rb = R * 2.2 + 0.3 * IN, L = v.ff * IN, cx = X0 + L / 2, bd = rb * 1.2, zc = Z0 + rb + 1.0 * IN, X1 = X0 + L;
  a.ycyl(cy - bd / 2, cy + bd / 2, cx, zc, rb, 28); a.ell(cx, cy + bd * 0.1, zc, rb * 1.0, bd * 0.5, rb * 1.0, 20, 8);
  a.ycyl(cy - bd / 2 - 0.35 * IN, cy - bd / 2, cx, zc, rb * 1.12, 30); for (let k = 0; k < 8; k++) { const th = (k / 8) * TAU; a.ycyl(cy - bd / 2 - 0.35 * IN - 0.28 * IN, cy - bd / 2 - 0.35 * IN, cx + rb * 0.98 * m.cos(th), zc + rb * 0.98 * m.sin(th), 0.28 * IN, 6); }
  const zi = zc + rb * 0.45, zo = zc - rb * 0.45; a.xcyl(X0, cx, cy, zi, R * 0.95, 18); a.xcyl(cx, X1, cy, zo, R * 0.95, 18); threads(a, X0, X0 + L * 0.18, cy, zi, R * 0.95, 3); threads(a, X1 - L * 0.18, X1, cy, zo, R * 0.95, 3);
  hex(a, X0 + L * 0.2, X0 + L * 0.3, cy, zi, R * 1.2); hex(a, X1 - L * 0.3, X1 - L * 0.2, cy, zo, R * 1.2);
  for (const s of [-0.65, 0.65]) a.box(cx + s * rb - 0.35 * IN, cy - bd / 2, Z0, cx + s * rb + 0.35 * IN, cy + bd / 2, zc - rb * 0.5);
  a.cyl(cx, cy + bd / 2, zc + rb * 0.4, zc + rb * 0.95, R * 0.35, 8);
  a.outline(); a.circ(cx, cy, rb, 'EQUIP-HIDDEN'); a.rect(cx - rb, cy - bd / 2, cx + rb, cy + bd / 2, 'EQUIP-DETAIL');
  a.log('Added the cylindrical float chamber with a round bolted cover and eight bolts, the threaded high inlet and low outlet with hex ends, two support feet and a vent plug (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ supports
/** an adjustable pipe stanchion: base plate with anchor bolts, a stem with an adjusting collar and a cradle under a pipe along x */
function stanchion(a, v) {
  const { X0, Z0, cy } = a, r = od(v.n) / 2, pl = m.max(r * 5, 16 * IN), cx = X0 + pl / 2, bw = m.max(8 * IN, r * 2.2 + 4 * IN), rs = m.max(0.9 * IN, r * 0.3), h = v.h * IN, zs = Z0 + 0.5 * IN + h, zc = zs + 0.4 * IN + r * 0.92;
  a.box(cx - bw / 2, cy - bw / 2, Z0, cx + bw / 2, cy + bw / 2, Z0 + 0.5 * IN); for (const sx of [-1, 1]) for (const sy of [-1, 1]) boltZ(a, cx + sx * (bw / 2 - 1.1 * IN), cy + sy * (bw / 2 - 1.1 * IN), Z0 + 0.5 * IN, Z0 + 1.4 * IN, 0.35 * IN);
  a.cyl(cx, cy, Z0 + 0.5 * IN, Z0 + 0.5 * IN + h * 0.5, rs, 16); a.cyl(cx, cy, Z0 + 0.5 * IN + h * 0.4, zs, rs * 0.82, 16);
  a.cyl(cx, cy, Z0 + 0.5 * IN + h * 0.45, Z0 + 0.5 * IN + h * 0.55, rs * 1.6, 6); hexZ(a, cx, cy, Z0 + 0.5 * IN + h * 0.55, Z0 + 0.5 * IN + h * 0.55 + rs * 0.7, rs * 1.3);
  for (const s of [-1, 1]) a.tube([[cx, cy + s * rs * 0.9, Z0 + 0.5 * IN + h * 0.22], [cx, cy + s * bw * 0.35, Z0 + 0.5 * IN]], [rs * 0.28, rs * 0.28], 5);
  a.box(cx - r * 1.3, cy - 3 * IN, zs, cx + r * 1.3, cy + 3 * IN, zs + 0.4 * IN);
  for (const s of [-1, 1]) prismY(a, [[cx + s * r * 1.3, zs + 0.4 * IN], [cx + s * r * 0.55, zs + 0.4 * IN], [cx + s * r * 1.2, zs + 0.4 * IN + r * 0.5]], cy - 3 * IN, cy + 3 * IN);
  pipeX(a, X0, X0 + pl, cy, zc, v.n, 24); strap(a, cx, cy, zc, r);
  a.outline(); a.rect(cx - bw / 2, cy - bw / 2, cx + bw / 2, cy + bw / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, rs, 'EQUIP-DETAIL');
  a.log('Added the base plate with four anchor bolts, the stem with an adjusting collar and lock nut, three gusset legs, the cradle with wings, the pipe and its strap (plan and 3D).');
}
/** a roller hanger: ceiling plate, rod with turnbuckle, a yoke and one roller under the pipe */
function rollerHanger(a, v) {
  const { X0, Z0, cy } = a, r = od(v.n) / 2, rl = m.max(0.9 * IN, r * 0.28), pl = m.max(r * 5, 18 * IN), cx = X0 + pl / 2, rw = m.max(1.4 * IN, r * 0.5), zr = Z0 + 1.0 * IN + rl, zc = zr + rl + r, rod = m.max(0.35 * IN, r * 0.12), zt = zc + r + v.drop * IN;
  pipeX(a, X0, X0 + pl, cy, zc, v.n, 24);
  a.ycyl(cy - rw, cy + rw, cx, zr, rl, 18); a.ycyl(cy - rw - 0.3 * IN, cy + rw + 0.3 * IN, cx, zr, rl * 0.3, 8);
  for (const s of [-1, 1]) { a.box(cx - rl * 1.2, cy + s * (rw + 0.3 * IN) - 0.2 * IN, Z0, cx + rl * 1.2, cy + s * (rw + 0.3 * IN) + 0.2 * IN, zr + rl * 1.8); }
  a.box(cx - rl * 1.2, cy - rw - 0.5 * IN, zr + rl * 1.8, cx + rl * 1.2, cy + rw + 0.5 * IN, zr + rl * 1.8 + 0.4 * IN);
  const zy = zr + rl * 2.2 + 0.4 * IN; a.tube([[cx, cy, zy], [cx, cy, zt - 0.8 * IN]], [rod, rod], 8); hex(a, cx - 1.6 * IN, cx + 1.6 * IN, cy, zy + (zt - zy) * 0.4, rod * 2.2); hexZ(a, cx, cy, zy + (zt - zy) * 0.6, zy + (zt - zy) * 0.6 + 0.9 * IN, rod * 2.4);
  a.box(cx - 4 * IN, cy - 2 * IN, zt - 0.8 * IN, cx + 4 * IN, cy + 2 * IN, zt - 0.4 * IN); a.box(cx - 5 * IN, cy - 2.5 * IN, zt - 0.4 * IN, cx + 5 * IN, cy + 2.5 * IN, zt);
  a.outline('EQUIP-HIDDEN'); a.rect(X0, cy - r, X0 + pl, cy + r, 'EQUIP-DETAIL'); a.circ(cx, cy, rod, 'EQUIP'); a.rect(cx - rl, cy - rw, cx + rl, cy + rw, 'EQUIP-DETAIL');
  a.log('Added the ceiling plates, the threaded rod with a turnbuckle and nuts, the yoke with two side plates, a roller on its axle under the pipe and the pipe itself (plan and 3D).');
}
/** a vertical pipe held by a two-ear riser clamp resting on a floor slab */
function riserClamp(a, v) {
  const { X0, Z0, cy } = a, r = od(v.n) / 2, sw = r * 2 + 18 * IN, st = 6 * IN, cx = X0 + sw / 2, hp = v.hp * IN, zl = Z0 + st;
  a.box(X0, cy - sw / 2, Z0, X0 + sw, cy + sw / 2, Z0 + st); ring(a, 'z', cx, cy, r * 1.02, r + 0.9 * IN, Z0 + st - 0.0, Z0 + st + 0.3 * IN, r + 0.9 * IN, 26);
  a.cyl(cx, cy, Z0 + 1, Z0 + st + hp, r, 26); a.cyl(cx, cy, Z0 + st + hp - 0.2 * IN, Z0 + st + hp, r * 1.04, 26);
  ring(a, 'z', cx, cy, r * 0.99, r + 0.4 * IN, zl + 0.3 * IN, zl + 0.3 * IN + 3 * IN, r + 0.4 * IN, 26);
  for (const s of [-1, 1]) { const x = cx + s * (r + 0.4 * IN + 1.4 * IN); a.box(x - 1.4 * IN, cy - 1.5 * IN, zl + 0.3 * IN, x + 1.4 * IN, cy + 1.5 * IN, zl + 0.3 * IN + 0.8 * IN); boltZ(a, x, cy, zl + 0.3 * IN + 0.8 * IN, zl + 0.3 * IN + 2.2 * IN, 0.35 * IN); }
  a.outline(); a.circ(cx, cy, r, 'EQUIP'); a.circ(cx, cy, r + 0.4 * IN, 'EQUIP-DETAIL'); a.rect(cx - r - 3.2 * IN, cy - 1.5 * IN, cx + r + 3.2 * IN, cy + 1.5 * IN, 'EQUIP-DETAIL');
  a.log('Added the floor slab with a sleeve collar, the vertical pipe, the split riser clamp with two lugs and bolted ears resting on the slab (plan and 3D).');
}
/** a wall bracket with a gusset and a strap holding a pipe along x; the wall is the strip along the back (back-anchored) */
function wallBracket(a, v) {
  const { X0, Z0 } = a, r = od(v.n) / 2, tw = 6 * IN, da = r * 1.4 + 3.5 * IN, pl = m.max(r * 5, 20 * IN), cx = X0 + pl / 2, za = Z0 + 8 * IN, zc = za + 0.5 * IN + r, yp = -(tw + da * 0.55);
  a.box(X0, -tw, Z0, X0 + pl, 0, zc + r + 10 * IN);
  a.box(cx - 2.5 * IN, -tw - 0.4 * IN, za - 6 * IN, cx + 2.5 * IN, -tw, za + 7 * IN); for (const z of [za - 4.5 * IN, za + 5.5 * IN]) for (const s of [-1, 1]) a.ycyl(-tw - 0.7 * IN, -tw - 0.4 * IN, cx + s * 1.7 * IN, z, 0.4 * IN, 6);
  a.box(cx - 1.2 * IN, -tw - da, za, cx + 1.2 * IN, -tw, za + 0.5 * IN); prismX(a, [[-tw, za], [-tw - da * 0.9, za], [-tw, za - 5 * IN]], cx - 0.3 * IN, cx + 0.3 * IN);
  pipeX(a, X0, X0 + pl, yp, zc, v.n, 24); strap(a, cx, yp, zc, r);
  a.outline(); a.rect(cx - 1.2 * IN, -tw - da, cx + 1.2 * IN, -tw, 'EQUIP-DETAIL'); a.rect(X0, yp - r, X0 + pl, yp + r, 'EQUIP-DETAIL');
  a.log('Added the wall strip, the back plate with four bolts, the angle arm with its triangular gusset, the pipe and its strap (plan and 3D).');
}
/** an I-beam with a clamped rod and a ring hanger round a pipe */
function beamClamp(a, v) {
  const { X0, Z0, cy } = a, r = od(v.n) / 2, pl = m.max(r * 5, 16 * IN), cx = X0 + pl / 2, zc = Z0 + r + 1.6 * IN, rod = m.max(0.3 * IN, r * 0.1), zr = zc + r + 0.5 * IN, bd = 8 * IN, ztop = zr + v.drop * IN + bd;
  pipeX(a, X0, X0 + pl, cy, zc, v.n, 24); ring(a, 'x', cy, zc, r * 1.0, r + 0.4 * IN, cx - 0.5 * IN, cx + 0.5 * IN, r + 0.4 * IN, 24);
  a.box(cx - 0.5 * IN, cy - r - 1.2 * IN, zc - r - 0.1 * IN, cx + 0.5 * IN, cy + r + 1.2 * IN, zc - r + 0.4 * IN); for (const s of [-1, 1]) a.ycyl(cy + s * (r + 0.4 * IN) + (s > 0 ? 0 : -1.1 * IN), cy + s * (r + 0.4 * IN) + (s > 0 ? 1.1 * IN : 0), cx, zc - r + 0.15 * IN, 0.25 * IN, 6);
  a.cyl(cx, cy, zr - 0.2 * IN, zr + 0.6 * IN, rod * 2.2, 6); a.tube([[cx, cy, zr], [cx, cy, ztop - bd - 0.3 * IN]], [rod, rod], 8); hexZ(a, cx, cy, zr + (ztop - bd - zr) * 0.55, zr + (ztop - bd - zr) * 0.55 + 0.9 * IN, rod * 2.4);
  beamX(a, cy, X0, X0 + pl, ztop, bd, 4.5 * IN); const zb = ztop - bd;
  a.box(cx - 1.5 * IN, cy - 2.6 * IN, zb - 0.8 * IN, cx + 1.5 * IN, cy + 2.6 * IN, zb); for (const s of [-1, 1]) { a.box(cx - 0.3 * IN, cy + s * 2.2 * IN - 0.25 * IN, zb - 0.8 * IN, cx + 0.3 * IN, cy + s * 2.2 * IN + 0.25 * IN, zb + 0.5 * IN); }
  a.outline(); a.rect(X0, cy - 2.25 * IN, X0 + pl, cy + 2.25 * IN, 'EQUIP-DETAIL'); a.rect(X0, cy - r, X0 + pl, cy + r, 'EQUIP-HIDDEN'); a.circ(cx, cy, rod, 'EQUIP');
  a.log('Added the I-beam, the clamp jaws gripping its lower flange, the hanger rod with a lock nut, the split ring hanger with its bolt ears and the pipe it carries (plan and 3D).');
}
/** a saddle support: base plate, two web plates and an arc rib cradle under a large pipe along x */
function saddle(a, v) {
  const { X0, Z0, cy } = a, r = od(v.n) / 2, pl = r * 3.6 + 12 * IN, cx = X0 + pl / 2, bw = r * 2 + 8 * IN, bl = r * 1.5 + 8 * IN, hz = v.h * IN, zc = Z0 + 0.7 * IN + hz + r * 0.88;
  a.box(cx - bl / 2, cy - bw / 2, Z0, cx + bl / 2, cy + bw / 2, Z0 + 0.7 * IN); for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.cyl(cx + sx * (bl / 2 - 1.4 * IN), cy + sy * (bw / 2 - 1.4 * IN), Z0 + 0.7 * IN, Z0 + 1.3 * IN, 0.45 * IN, 6);
  pipeX(a, X0, X0 + pl, cy, zc, v.n, 26);
  for (const s of [-1, 1]) { const x = cx + s * bl * 0.3, arc = []; for (let k = 0; k <= 10; k++) { const th = ((215 + 110 * k / 10) * m.PI) / 180; arc.push([x, cy + (r + 0.35 * IN) * m.cos(th), zc + (r + 0.35 * IN) * m.sin(th)]); } sweep(a, arc, 0.45 * IN, 8, [1, 0, 0]); }
  for (const s of [-1, 1]) a.box(cx + s * bl * 0.3 - 0.3 * IN, cy - r * 0.5, Z0 + 0.7 * IN, cx + s * bl * 0.3 + 0.3 * IN, cy + r * 0.5, zc - r * 0.88);
  a.box(cx - bl * 0.3, cy - 0.3 * IN, Z0 + 0.7 * IN, cx + bl * 0.3, cy + 0.3 * IN, zc - r * 0.95);
  a.outline(); a.rect(cx - bl / 2, cy - bw / 2, cx + bl / 2, cy + bw / 2, 'EQUIP-DETAIL'); a.rect(X0, cy - r, X0 + pl, cy + r, 'EQUIP-DETAIL');
  a.log('Added the base plate with four anchor studs, two web plates with a centre rib, two curved cradle ribs and the large pipe lying in them (plan and 3D).');
}
/** a trunnion (dummy leg) under a pipe that turns up in a long-radius elbow */
function trunnion(a, v) {
  const { X0, Z0, cy } = a, n = v.n, r = od(n) / 2, R = 1.5 * n * IN, hz = v.h * IN, a0 = r * 3 + 6 * IN, zc = Z0 + 1.2 * IN + hz, rt = r * 0.6;
  sweep(a, pathPts(cy, X0, zc, 0, [['L', a0], ['A', 90, R], ['L', R * 0.9]]), r, 22); a.xcyl(X0, X0 + 0.2 * IN, cy, zc, r * 1.04, 22);
  const xt = X0 + a0 * 0.55; a.cyl(xt, cy, Z0 + 1.2 * IN, zc - r + 0.1 * IN, rt, 18); ring(a, 'z', xt, cy, rt * 0.98, rt * 1.5, zc - r - 1 * IN, zc - r + 0.5 * IN, rt * 1.0, 18);
  a.box(xt - rt * 1.9, cy - rt * 1.9, Z0 + 0.6 * IN, xt + rt * 1.9, cy + rt * 1.9, Z0 + 1.2 * IN); beamX(a, cy, xt - rt * 3.2, xt + rt * 3.2, Z0 + 0.6 * IN, 0.6 * IN, rt * 4);
  for (let k = 0; k < 4; k++) { const th = k * m.PI / 2 + m.PI / 4; a.box(xt + rt * 1.55 * m.cos(th) - 0.2 * IN, cy + rt * 1.55 * m.sin(th) - 0.2 * IN, Z0 + 1.2 * IN, xt + rt * 1.55 * m.cos(th) + 0.2 * IN, cy + rt * 1.55 * m.sin(th) + 0.2 * IN, zc - r - 0.6 * IN); }
  a.outline(); a.rect(X0, cy - r, X0 + a0 + R, cy + r, 'EQUIP-DETAIL'); a.circ(xt, cy, rt, 'EQUIP-DETAIL'); a.rect(xt - rt * 1.9, cy - rt * 1.9, xt + rt * 1.9, cy + rt * 1.9, 'EQUIP-DETAIL');
  a.log('Added the pipe run with its long-radius bend turning up, the dummy leg welded under the run with a bearing pad, four gussets and a base plate on a short steel section (plan and 3D).');
}
/** a constant-load spring hanger: a rectangular casing with a lever, a travel scale, an upper lug and a lower rod to a strap */
function constantHanger(a, v) {
  const { X0, Z0, cy } = a, r = od(v.n) / 2, cw = v.cw * IN, ch = v.ch * IN, cd = cw * 0.55, pl = m.max(r * 5, 18 * IN), cx = X0 + pl / 2, zc = Z0 + r + 1.5 * IN, rod = m.max(0.35 * IN, r * 0.1), zc0 = zc + r + 0.5 * IN + v.rod * IN;
  pipeX(a, X0, X0 + pl, cy, zc, v.n, 24); strap(a, cx, cy, zc, r);
  a.tube([[cx, cy, zc + r + 0.3 * IN], [cx, cy, zc0]], [rod, rod], 8); hexZ(a, cx, cy, zc + r + 1 * IN, zc + r + 1 * IN + 1.1 * IN, rod * 2.4);
  a.box(cx - cw / 2, cy - cd / 2, zc0, cx + cw / 2, cy + cd / 2, zc0 + ch); a.box(cx - cw / 2 - 0.2 * IN, cy - cd / 2 - 0.2 * IN, zc0 + ch * 0.5 - 0.15 * IN, cx + cw / 2 + 0.2 * IN, cy + cd / 2 + 0.2 * IN, zc0 + ch * 0.5 + 0.15 * IN);
  a.cyl(cx + cw * 0.25, cy, zc0 + ch, zc0 + ch + 0.6 * IN, cw * 0.08, 8); a.box(cx - cw * 0.12, cy - cd * 0.35, zc0 + ch, cx + cw * 0.12, cy + cd * 0.35, zc0 + ch + 1.2 * IN);
  a.box(cx + cw / 2, cy - cd * 0.4, zc0 + ch * 0.15, cx + cw / 2 + 0.3 * IN, cy + cd * 0.4, zc0 + ch * 0.85); for (let k = 0; k <= 8; k++) a.box(cx + cw / 2 + 0.3 * IN, cy - cd * 0.4 + (k % 2 ? 0.3 : 0) * IN, zc0 + ch * 0.18 + ch * 0.64 * k / 8 - 3, cx + cw / 2 + 0.8 * IN, cy + cd * 0.4, zc0 + ch * 0.18 + ch * 0.64 * k / 8 + 3);
  a.box(cx + cw * 0.5 - 0.1 * IN, cy - cd * 0.35, zc0 + ch * 0.5 - 0.3 * IN, cx + cw * 0.5 + 1.2 * IN, cy + cd * 0.35, zc0 + ch * 0.5 + 0.3 * IN);
  const zt = zc0 + ch + 1.2 * IN; a.tube([[cx, cy, zt], [cx, cy, zt + v.top * IN]], [rod * 1.1, rod * 1.1], 8); a.box(cx - 4 * IN, cy - 2 * IN, zt + v.top * IN, cx + 4 * IN, cy + 2 * IN, zt + v.top * IN + 0.5 * IN); a.box(cx - 5.5 * IN, cy - 2.5 * IN, zt + v.top * IN + 0.5 * IN, cx + 5.5 * IN, cy + 2.5 * IN, zt + v.top * IN + 1.0 * IN);
  a.outline('EQUIP-HIDDEN'); a.rect(cx - cw / 2, cy - cd / 2, cx + cw / 2, cy + cd / 2, 'EQUIP'); a.rect(X0, cy - r, X0 + pl, cy + r, 'EQUIP-DETAIL');
  a.log('Added the pipe and strap, the lower rod with a nut, the rectangular casing with its seam, lever arm and travel scale, the upper lug and rod to a beam attachment (plan and 3D).');
}
/** a multi-bay pipe rack: bents of two columns with cross beams per tier, longitudinal beams, bracing and pipes along y. Back-anchored, runs toward -y */
function bayRack(a, v) {
  const { X0, Z0 } = a, tiers = v.tiers, bays = v.bays, w = v.w * IN, bay = v.bay * IN, th = v.th * IN, cw = 8 * IN, bd = 10 * IN, H = tiers * th + bd, ytop = -2 * IN;
  const yb = (k) => ytop - cw / 2 - k * bay;
  for (let k = 0; k <= bays; k++) { const y = yb(k);
    for (const x of [X0 + cw / 2, X0 + w - cw / 2]) { a.box(x - cw / 2, y - cw / 2, Z0, x + cw / 2, y + cw / 2, Z0 + H - bd + 4); a.box(x - cw * 0.75, y - cw * 0.75, Z0, x + cw * 0.75, y + cw * 0.75, Z0 + 0.5 * IN); }
    for (let t = 1; t <= tiers; t++) beamX(a, y, X0, X0 + w, Z0 + t * th, bd * 0.8, 5 * IN); }
  for (let t = 1; t <= tiers; t++) for (const x of [X0 + cw / 2, X0 + w - cw / 2]) beamY(a, x, yb(bays) - cw / 2, yb(0) + cw / 2, Z0 + t * th - bd * 0.8, 6 * IN, 4 * IN);
  for (let k = 0; k < bays; k++) for (const x of [X0 + cw / 2, X0 + w - cw / 2]) { const y0 = yb(k), y1 = yb(k + 1); a.tube([[x, y0, Z0 + 4 * IN], [x, y1, Z0 + th - bd * 0.8]], [0.5 * IN, 0.5 * IN], 5); a.tube([[x, y1, Z0 + 4 * IN], [x, y0, Z0 + th - bd * 0.8]], [0.5 * IN, 0.5 * IN], 5); }
  for (let t = 1; t <= tiers; t++) { const ztb = Z0 + t * th, np = v.np, pitch = (w - 2 * cw - 6 * IN) / np; for (let i = 0; i < np; i++) { const n = [4, 3, 6, 2, 4, 8][(i + t) % 6], r = od(n) / 2, rm = m.min(r, pitch * 0.45), x = X0 + cw + 3 * IN + pitch * (i + 0.5);
      a.ycyl(yb(bays) - cw / 2 + 4 * IN, yb(0) + cw / 2 - 2 * IN, x, ztb + 0.5 * IN + rm, rm, 16); for (let k = 0; k <= bays; k++) a.box(x - rm * 0.55, yb(k) - 2.5 * IN, ztb, x + rm * 0.55, yb(k) + 2.5 * IN, ztb + 0.5 * IN); } }
  a.rect(X0, yb(bays) - cw / 2, X0 + w, yb(0) + cw / 2, 'EQUIP'); for (let k = 0; k <= bays; k++) a.line(X0, yb(k), X0 + w, yb(k), 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
  a.log(`Added ${bays + 1} bents of two columns on base plates with ${tiers} cross beam tier${tiers > 1 ? 's' : ''}, longitudinal beams, X bracing in the bays and ${v.np} pipes of mixed size a tier on shoes (plan and 3D).`);
}
/** a wall strut rack: two vertical struts on the wall with cantilever arms carrying pipes along x. Back-anchored */
function strutRack(a, v) {
  const { X0, Z0 } = a, w = v.w * IN, tw = 4 * IN, arm = v.np * 8 * IN + 4 * IN, th = 14 * IN, H = v.tiers * th + 10 * IN, sx = [X0 + 5 * IN, X0 + w - 5 * IN];
  a.box(X0, -tw, Z0, X0 + w, 0, Z0 + H + 6 * IN);
  for (const x of sx) { a.box(x - 0.8 * IN, -tw - 1.6 * IN, Z0 + 2 * IN, x + 0.8 * IN, -tw, Z0 + H); for (let k = 0; k < v.tiers * 3; k++) a.box(x - 0.5 * IN, -tw - 1.65 * IN, Z0 + 4 * IN + k * (H - 6 * IN) / (v.tiers * 3), x + 0.5 * IN, -tw - 1.6 * IN, Z0 + 4 * IN + k * (H - 6 * IN) / (v.tiers * 3) + 1 * IN); }
  for (let t = 0; t < v.tiers; t++) { const za = Z0 + 6 * IN + t * th; for (const x of sx) { a.box(x - 0.8 * IN, -tw - arm, za, x + 0.8 * IN, -tw - 1.6 * IN, za + 0.5 * IN); a.tube([[x, -tw - 1.6 * IN, za - 4 * IN], [x, -tw - arm * 0.7, za]], [0.3 * IN, 0.3 * IN], 5); a.box(x - 0.8 * IN, -tw - arm, za + 0.5 * IN, x + 0.8 * IN, -tw - arm + 0.4 * IN, za + 1.8 * IN); }
    for (let i = 0; i < v.np; i++) { const n = v.n, r = od(n) / 2, y = -tw - 1.6 * IN - 2 * IN - i * 8 * IN - r * 0.4; pipeX(a, X0 + 1 * IN, X0 + w - 1 * IN, y, za + 0.5 * IN + r, n, 20); for (const x of sx) a.box(x - 0.7 * IN, y - r * 0.7, za + 0.5 * IN, x + 0.7 * IN, y + r * 0.7, za + 0.5 * IN + 0.3 * IN); } }
  a.outline('EQUIP-HIDDEN'); for (const x of sx) a.rect(x - 0.8 * IN, -tw - arm, x + 0.8 * IN, -tw - 1.6 * IN, 'EQUIP-DETAIL'); a.rect(X0, -tw, X0 + w, 0, 'EQUIP');
  a.log(`Added the wall strip, two vertical slotted struts, ${v.tiers} tier${v.tiers > 1 ? 's' : ''} of cantilever arms with gussets and ${v.np} pipe${v.np > 1 ? 's' : ''} of ${v.n} in a tier lying across them (plan and 3D).`);
}
/** a sway brace: a pipe on a riser clamp braced diagonally to the ceiling plate */
function swayBrace(a, v) {
  const { X0, Z0, cy } = a, r = od(v.n) / 2, pl = r * 5 + 24 * IN, cx = X0 + pl * 0.3, zc = Z0 + r + 1.4 * IN, hz = v.rise * IN, zt = zc + r + hz, bx = X0 + pl * 0.3 + hz * 0.9;
  pipeX(a, X0, X0 + pl, cy, zc, v.n, 24); strap(a, cx, cy, zc, r, 1.2 * IN); a.box(cx - 0.6 * IN, cy - 0.5 * IN, zc + r, cx + 0.6 * IN, cy + 0.5 * IN, zc + r + 2 * IN);
  a.tube([[cx, cy, zc + r + 1.4 * IN], [bx, cy, zt - 1.2 * IN]], [1.0 * IN, 1.0 * IN], 4);
  for (const k of [0.25, 0.5, 0.75]) a.tube([[cx + (bx - cx) * k, cy - 0.9 * IN, zc + r + 1.4 * IN + (zt - 1.2 * IN - zc - r - 1.4 * IN) * k], [cx + (bx - cx) * k, cy + 0.9 * IN, zc + r + 1.4 * IN + (zt - 1.2 * IN - zc - r - 1.4 * IN) * k]], [0.15 * IN, 0.15 * IN], 4);
  a.box(bx - 1.6 * IN, cy - 1.6 * IN, zt - 1.2 * IN, bx + 1.6 * IN, cy + 1.6 * IN, zt - 0.8 * IN); a.box(bx - 3 * IN, cy - 3 * IN, zt - 0.8 * IN, bx + 3 * IN, cy + 3 * IN, zt);
  a.box(X0, cy - 4 * IN, zt - 0.8 * IN, X0 + pl, cy + 4 * IN, zt);
  a.outline('EQUIP-HIDDEN'); a.rect(X0, cy - r, X0 + pl, cy + r, 'EQUIP-DETAIL'); a.rect(bx - 3 * IN, cy - 3 * IN, bx + 3 * IN, cy + 3 * IN, 'EQUIP-DETAIL');
  a.log('Added the pipe with a bolted clamp and an upright lug, a diagonal strut channel with cross ties and the angled ceiling fitting on a strip of slab (plan and 3D).');
}
/** a step-over platform crossing a bundle of pipes along y: deck, two stringers, treads and handrails */
function stepOver(a, v) {
  const { X0, Z0, cy } = a, sp = v.s * IN, ph = v.ph * IN, sw = 36 * IN, rise = 7.5 * IN, nt = m.round(ph / rise), tr = ph / nt, run = 10 * IN, sl = nt * run, th = 0.4 * IN, xd0 = X0 + sl, xd1 = xd0 + sp;
  for (let k = 0; k < 4; k++) { const n = [8, 6, 4, 6][k], r = od(n) / 2; a.ycyl(cy - sw / 2 - 6 * IN, cy + sw / 2 + 6 * IN, xd0 + sp * (0.2 + 0.2 * k), Z0 + r, r, 18); }
  a.box(xd0, cy - sw / 2, Z0 + ph - 2 * th, xd1, cy + sw / 2, Z0 + ph); for (const s of [-1, 1]) a.box(xd0, cy + s * sw / 2 - 0.4 * IN, Z0 + ph - 4 * IN, xd1, cy + s * sw / 2 + 0.4 * IN, Z0 + ph);
  for (const s of [-1, 1]) { prismY(a, [[X0, Z0], [xd0, Z0 + ph - 4 * IN], [xd0, Z0 + ph - 8 * IN]], cy + s * sw / 2 - 0.3 * IN, cy + s * sw / 2 + 0.3 * IN); prismY(a, [[xd1 + sl, Z0], [xd1, Z0 + ph - 4 * IN], [xd1, Z0 + ph - 8 * IN]], cy + s * sw / 2 - 0.3 * IN, cy + s * sw / 2 + 0.3 * IN); }
  for (let k = 0; k < nt; k++) { a.box(X0 + k * run, cy - sw / 2, Z0 + (k + 1) * tr - th, X0 + (k + 1) * run, cy + sw / 2, Z0 + (k + 1) * tr); a.box(xd1 + sl - (k + 1) * run, cy - sw / 2, Z0 + (k + 1) * tr - th, xd1 + sl - k * run, cy + sw / 2, Z0 + (k + 1) * tr); }
  for (const s of [-1, 1]) { const y = cy + s * (sw / 2 - 0.4 * IN), hh = 36 * IN; a.tube([[X0 + run, y, Z0 + tr + hh], [xd0, y, Z0 + ph + hh], [xd1, y, Z0 + ph + hh], [xd1 + sl - run, y, Z0 + tr + hh]], [0.7 * IN, 0.7 * IN, 0.7 * IN, 0.7 * IN], 6);
    a.tube([[X0 + run, y, Z0 + tr + hh / 2], [xd0, y, Z0 + ph + hh / 2], [xd1, y, Z0 + ph + hh / 2], [xd1 + sl - run, y, Z0 + tr + hh / 2]], [0.5 * IN, 0.5 * IN, 0.5 * IN, 0.5 * IN], 5);
    for (const x of [xd0, xd0 + sp / 2, xd1]) a.tube([[x, y, Z0 + ph], [x, y, Z0 + ph + hh]], [0.5 * IN, 0.5 * IN], 5); for (const [x, z] of [[X0 + run, Z0 + tr], [xd1 + sl - run, Z0 + tr]]) a.tube([[x, y, z], [x, y, z + hh]], [0.5 * IN, 0.5 * IN], 5); }
  a.rect(X0, cy - sw / 2, xd1 + sl, cy + sw / 2, 'EQUIP'); a.rect(xd0, cy - sw / 2, xd1, cy + sw / 2, 'EQUIP-DETAIL'); for (let k = 1; k < nt; k++) { a.line(X0 + k * run, cy - sw / 2, X0 + k * run, cy + sw / 2, 'EQUIP-DETAIL'); a.line(xd1 + sl - k * run, cy - sw / 2, xd1 + sl - k * run, cy + sw / 2, 'EQUIP-DETAIL'); }
  a.log(`Added a deck with kick plates, two stairs of ${nt} treads on cut stringers, handrails with mid rails and posts, over a bundle of four pipes of mixed size (plan and 3D).`);
}
/** a steel sleeper: a beam on two posts and footings carrying pipes along y on wear plates with end stops */
function steelSleeper(a, v) {
  const { X0, Z0, cy } = a, sizes = v.sizes, gap = 5 * IN, ws = sizes.reduce((s, n) => s + od(n) + gap, gap), hz = v.h * IN, pw = m.max(ws, 36 * IN), bd = 6 * IN, zb = Z0 + 4 * IN + hz, yl = 22 * IN;
  for (const x of [X0 + 3 * IN, X0 + pw - 3 * IN]) { a.box(x - 3 * IN, cy - yl / 2 * 0.6, Z0, x + 3 * IN, cy + yl / 2 * 0.6, Z0 + 4 * IN); a.box(x - 2 * IN, cy - 2 * IN, Z0 + 4 * IN, x + 2 * IN, cy + 2 * IN, zb - bd); a.box(x - 3 * IN, cy - 3 * IN, zb - bd - 0.5 * IN, x + 3 * IN, cy + 3 * IN, zb - bd); a.box(x - 3 * IN, cy - 3 * IN, Z0 + 4 * IN, x + 3 * IN, cy + 3 * IN, Z0 + 4.5 * IN); }
  beamX(a, cy, X0, X0 + pw, zb, bd, 4 * IN);
  let x = X0 + gap; for (const n of sizes) { const r = od(n) / 2; x += r; a.box(x - r * 0.8, cy - 3.2 * IN, zb, x + r * 0.8, cy + 3.2 * IN, zb + 0.4 * IN); a.ycyl(cy - yl / 2, cy + yl / 2, x, zb + 0.4 * IN + r, r, 18); a.circ(x, cy, r, 'EQUIP-DETAIL'); x += r + gap; }
  for (const s of [-1, 1]) a.box(X0 + 0.5 * IN, cy + s * 3.4 * IN - 0.25 * IN, zb, X0 + pw - 0.5 * IN, cy + s * 3.4 * IN + 0.25 * IN, zb + 0.9 * IN);
  a.outline(); a.rect(X0, cy - 3 * IN, X0 + pw, cy + 3 * IN, 'EQUIP-DETAIL');
  a.log(`Added two footings with posts and base plates, the cross beam, ${sizes.length} pipes of mixed size lying along it on wear plates and the two edge stops (plan and 3D).`);
}

// ------------------------------------------------------------------------------------------ spools and skids: in-line parts
function miniBall(a, x, y, zc, R, len = R * 2.6) {
  a.xcyl(x - len / 2, x + len / 2, y, zc, R * 1.38, 24); a.xcyl(x - len / 2, x - len / 2 + R * 0.3, y, zc, R * 1.5, 24); a.xcyl(x + len / 2 - R * 0.3, x + len / 2, y, zc, R * 1.5, 24);
  const zn = zc + R * 1.38; a.cyl(x, y, zn - 4, zn + R * 0.6, R * 0.38, 10); a.box(x - R * 0.35, y - R * 0.35, zn + R * 0.6, x + R * 0.35, y + R * 0.35, zn + R * 0.8);
  a.box(x - R * 0.4, y - R * 0.18, zn + R * 0.8, x + R * 3.0, y + R * 0.18, zn + R * 1.02); a.xcyl(x + R * 2.2, x + R * 3.2, y, zn + R * 0.91, R * 0.3, 8);
}
function miniGate(a, x, y, zc, R, len = R * 2.6) {
  a.ell(x, y, zc, len * 0.5, R * 1.45, R * 1.5, 18, 8); a.cyl(x, y, zc, zc + R * 2.0, R * 0.95, 18); stemWheel(a, x, y, zc + R * 2.0, R * 2.6, R * 0.9, R * 1.3, true, 4);
}
function miniCheck(a, x, y, zc, R, len = R * 2.6) {
  a.ell(x, y, zc, len * 0.5, R * 1.4, R * 1.4, 18, 8); a.ell(x + len * 0.05, y, zc + R * 0.8, len * 0.3, R * 1.2, R * 1.1, 16, 8); a.cyl(x + len * 0.05, y, zc + R * 0.9, zc + R * 1.6, R * 1.2, 20); a.cyl(x + len * 0.05, y, zc + R * 1.6, zc + R * 1.85, R * 1.45, 20);
  for (let k = 0; k < 6; k++) { const th = (k / 6) * TAU; a.cyl(x + len * 0.05 + R * 1.25 * m.cos(th), y + R * 1.25 * m.sin(th), zc + R * 1.85, zc + R * 2.05, R * 0.1, 6); }
}
function miniStrainer(a, x, y, zc, R, len = R * 2.6) {
  a.ell(x, y, zc, len * 0.5, R * 1.4, R * 1.4, 18, 8); const B = R * 3.4; a.tube([[x, y, zc], [x + B * 0.5, y, zc - B * 0.866]], [R * 1.25, R * 1.1], 18); a.tube([[x + B * 0.52, y, zc - B * 0.9], [x + B * 0.62, y, zc - B * 1.07]], [R * 1.45, R * 1.45], 18);
}
function miniMeter(a, x, y, zc, R, len = R * 3) {
  a.xcyl(x - len / 2, x + len / 2, y, zc, R * 1.3, 26); a.ell(x, y, zc, len * 0.4, R * 1.5, R * 1.35, 20, 8); a.cyl(x, y, zc + R * 1.0, zc + R * 1.8, R * 0.95, 22); a.ell(x, y, zc + R * 1.8, R * 0.95, R * 0.95, R * 0.35, 16, 6);
  for (const s of [-1, 1]) a.xcyl(x + s * len * 0.42, x + s * len * 0.5, y, zc, R * 1.5, 24);
}
/** a drip-leg trap: a round body with cover and a threaded stub */
function miniTrap(a, x, y, zc, R) { a.ycyl(y - R * 0.9, y + R * 0.9, x, zc, R * 1.5, 22); a.ycyl(y - R * 1.0 - 4, y - R * 0.9, x, zc, R * 1.62, 22); for (let k = 0; k < 6; k++) { const th = (k / 6) * TAU; a.ycyl(y - R * 1.0 - 9, y - R * 1.0 - 4, x + R * 1.2 * m.cos(th), zc + R * 1.2 * m.sin(th), R * 0.18, 6); } }
/** a vertical block valve in a riser: a body, two yoke columns and a hand wheel */
function vValve(a, x, y, z, R) { a.cyl(x, y, z - R * 1.3, z + R * 1.3, R * 1.3, 20); stemWheel(a, x, y, z + R * 1.3, R * 2.4, R * 0.9, R * 1.2, true, 4); }

// ------------------------------------------------------------------------------------------ spools and skids
/** a flanged spool with two 45 degree bends offsetting the run */
function zSpool(a, v) {
  const { X0, Z0, cy } = a, n = v.n, r = od(n) / 2, R = 1.5 * n * IN, tg = ft(n) * 2.7, zc = Z0 + fo(n), diag = (v.off * IN - 2 * R * (1 - m.SQRT1_2)) / m.SQRT1_2;
  const pts = pathPts(cy, X0 + tg, zc, 0, [['L', v.a0 * IN], ['A', 45, R], ['L', diag], ['A', -45, R], ['L', v.a1 * IN]]); sweep(a, pts, r, 22);
  const e = pts[pts.length - 1], xe = e[0] + tg; fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, e[2], xe, -1);
  stand(a, X0 + tg + v.a0 * IN * 0.5, cy, zc, r, Z0); stand(a, e[0] - v.a1 * IN * 0.5, cy, e[2], r, Z0);
  a.outline('EQUIP-HIDDEN'); a.line(X0, cy, xe, cy, 'EQUIP-DETAIL'); a.circ(X0 + tg + v.a0 * IN * 0.5, cy, r * 0.5, 'EQUIP-DETAIL');
  a.log('Added the flanged ends with bolts, the straight legs joined through two 45 degree long-radius bends that lift the line, and two floor supports (plan and 3D).');
}
/** a flanged expansion loop: a run rising, crossing and dropping back */
function expLoop(a, v) {
  const { X0, Z0, cy } = a, n = v.n, r = od(n) / 2, R = 1.5 * n * IN, tg = ft(n) * 2.7, zc = Z0 + fo(n), hh = v.h * IN, w = v.w * IN;
  const pts = pathPts(cy, X0 + tg, zc, 0, [['L', v.a0 * IN], ['A', 90, R], ['L', hh], ['A', -90, R], ['L', w], ['A', -90, R], ['L', hh], ['A', 90, R], ['L', v.a0 * IN]]); sweep(a, pts, r, 22);
  const e = pts[pts.length - 1], xe = e[0] + tg; fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, zc, xe, -1);
  stand(a, X0 + tg + v.a0 * IN * 0.5, cy, zc, r, Z0); stand(a, e[0] - v.a0 * IN * 0.5, cy, zc, r, Z0);
  a.outline('EQUIP-HIDDEN'); a.line(X0, cy, xe, cy, 'EQUIP-DETAIL'); a.rect(X0 + tg + v.a0 * IN, cy - r, X0 + tg + v.a0 * IN + w + 4 * R, cy + r, 'EQUIP-DETAIL');
  a.log('Added the flanged ends, the straight legs and a rectangular expansion loop of four long-radius bends rising over the line, with two floor supports (plan and 3D).');
}
/** an electromagnetic flow meter between flanges with a compact transmitter */
function emag(a, v) {
  const { cx, cy, zc, R, X1, X0 } = fbody(a, v.n, v.ff), W = v.ff * IN;
  a.xcyl(cx - W * 0.22, cx + W * 0.22, cy, zc, R * 1.4, 28); for (const s of [-1, 1]) a.xcyl(cx + s * W * 0.22 - 6, cx + s * W * 0.22 + 6, cy, zc, R * 1.5, 28);
  a.cyl(cx, cy, zc + R * 1.2, zc + R * 2.0, R * 0.62, 14); a.cyl(cx, cy, zc + R * 1.9, zc + R * 2.05, R * 0.9, 14);
  const zt = zc + R * 2.05, bw = R * 1.0, bd = R * 0.8; a.box(cx - bw, cy - bd, zt, cx + bw, cy + bd, zt + R * 1.4); a.box(cx - bw * 0.7, cy - bd - 5, zt + R * 0.3, cx + bw * 0.7, cy - bd, zt + R * 1.1);
  for (const s of [-1, 1]) a.cyl(cx + s * bw * 0.55, cy + bd * 0.3, zt + R * 1.4, zt + R * 1.7, R * 0.2, 8);
  a.ycyl(cy - bd - 8, cy - bd, cx + bw * 0.9 - 4, zt + R * 0.2, R * 0.08, 6);
  a.outline(); a.circ(cx, cy, R * 1.4, 'EQUIP-DETAIL'); a.rect(cx - bw, cy - bd, cx + bw, cy + bd, 'EQUIP-DETAIL');
  a.log('Added the flanged lined tube with a wider electrode section, the neck, the compact transmitter box with a display window and two cable glands (plan and 3D).');
}
/** a cartridge filter skid: upright vessels with clamped lids on a channel base, with inlet and outlet headers. Back-anchored */
function filterSkid(a, v) {
  const { X0, Z0 } = a, nv = v.nv, vr = v.vr * IN, vh = v.vh * IN, hr = od(v.n) / 2, pitch = 2 * vr + 10 * IN, sl = nv * pitch + 22 * IN, sd = 2 * vr + 24 * IN, zs = Z0 + 6 * IN, yv = -(vr + 14 * IN), yh = -(3 * IN + hr);
  for (const y of [-3 * IN, -sd + 3 * IN]) a.box(X0, y - 3 * IN, Z0, X0 + sl, y + 3 * IN, zs); for (let k = 0; k <= nv + 1; k++) a.box(X0 + 3 * IN + k * (sl - 6 * IN) / (nv + 1) - 1.5 * IN, -sd + 3 * IN, Z0, X0 + 3 * IN + k * (sl - 6 * IN) / (nv + 1) + 1.5 * IN, -3 * IN, zs - 3 * IN);
  a.box(X0 + 1 * IN, -sd + 1 * IN, zs, X0 + sl - 1 * IN, -1 * IN, zs + 0.4 * IN);
  const zi = zs + vh * 0.12, zo = zs + vh * 0.82, rn = hr * 0.8;
  for (let k = 0; k < nv; k++) { const x = X0 + 14 * IN + vr + k * pitch;
    a.cyl(x, yv, zs, zs + vh, vr, 28); a.ell(x, yv, zs + vh, vr, vr, vr * 0.38, 24, 6); a.cyl(x, yv, zs + vh - 3 * IN, zs + vh, vr * 1.1, 28);
    for (let q = 0; q < 8; q++) { const th = (q / 8) * TAU; a.ycyl(yv + vr * 1.12 * m.sin(th) - 0.1 * IN, yv + vr * 1.12 * m.sin(th) + 0.1 * IN, x + vr * 1.12 * m.cos(th), zs + vh - 1.5 * IN, 0.3 * IN, 6); }
    a.cyl(x, yv, zs + vh + vr * 0.3, zs + vh + vr * 0.5, 0.5 * IN, 8); a.tube([[x - 1.5 * IN, yv, zs + vh + vr * 0.3], [x - 1.5 * IN, yv, zs + vh + vr * 0.3 + 2 * IN], [x + 1.5 * IN, yv, zs + vh + vr * 0.3 + 2 * IN], [x + 1.5 * IN, yv, zs + vh + vr * 0.3]], [0.2 * IN, 0.2 * IN, 0.2 * IN, 0.2 * IN], 5);
    for (const z of [zi, zo]) { a.ycyl(yv - 1, yh + 2, x, z, rn, 18); a.ycyl(yv - vr - 0.0, yv - vr + 0.5 * IN, x, z, rn * 1.5, 18); }
    a.cyl(x + vr * 0.4, yv - vr * 0.5, zs - 0.0, zs + 2 * IN, 0.6 * IN, 8); gauge(a, x, yv - vr - 0.4 * IN, zs + vh * 0.5, 1.6 * IN);
    a.circ(x, yv, vr, 'EQUIP'); a.circ(x, yv, vr * 0.7, 'EQUIP-DETAIL'); }
  a.xcyl(X0 + fo(v.n) * 0 + ft(v.n) * 2.7, X0 + sl - 1 * IN, yh, zi, hr, 22); a.xcyl(X0 + ft(v.n) * 0.0 + 1 * IN, X0 + sl - ft(v.n) * 2.7, yh, zo, hr, 22);
  fl(a, v.n, 'x', yh, zi, X0, 1); fl(a, v.n, 'x', yh, zo, X0 + sl, -1);
  a.cyl(X0 + 6 * IN, yh, zi, zo, hr, 20); a.cyl(X0 + sl - 6 * IN, yh, zi, zo, hr, 20);
  a.rect(X0, -sd, X0 + sl, 0, 'EQUIP'); a.line(X0, yh, X0 + sl, yh, 'EQUIP-DETAIL');
  a.log(`Added the channel skid base, ${nv} upright filter vessel${nv > 1 ? 's' : ''} with clamped lids, swing bolts, eye bolts and a gauge, the low inlet header and the high outlet header with flanges and branch stubs (plan and 3D).`);
}
/** a plate heat exchanger: fixed head with four flanged nozzles, plate pack, pressure plate, carrying and guide bars, tie bolts, rear column. Back-anchored */
function plateHX(a, v) {
  const { X0, Z0 } = a, pw = v.pw * IN, ph = v.ph * IN, pk = v.pk * IN, nn = v.nn, np = m.round(v.pk / 0.2), yc = -(pw / 2 + 8 * IN), zb = Z0 + 10 * IN, tp = 1.6 * IN, xf = X0 + 9 * IN, xp = xf + tp + 2 * IN + pk, xcol = xp + tp + 4 * IN, rN = od(nn) / 2, tg = ft(nn) * 2.7;
  a.box(xf, yc - pw / 2 - 2 * IN, zb - 2 * IN, xf + tp, yc + pw / 2 + 2 * IN, zb + ph + 2 * IN); a.box(xp, yc - pw / 2 - 2 * IN, zb - 2 * IN, xp + tp, yc + pw / 2 + 2 * IN, zb + ph + 2 * IN);
  const pitch = pk / np; for (let k = 0; k < np; k++) a.box(xf + tp + 1 * IN + k * pitch, yc - pw / 2, zb, xf + tp + 1 * IN + k * pitch + pitch * 0.62, yc + pw / 2, zb + ph);
  a.box(xf + tp + 1 * IN, yc - pw / 2 - 0.2 * IN, zb + ph * 0.3, xp - 1 * IN, yc - pw / 2, zb + ph * 0.7);
  a.box(xf - 3 * IN, yc - 2 * IN, zb + ph + 2 * IN, xcol + 3 * IN, yc + 2 * IN, zb + ph + 5 * IN); a.box(xf - 3 * IN, yc - 1.5 * IN, zb - 5 * IN, xcol + 3 * IN, yc + 1.5 * IN, zb - 2 * IN);
  a.box(xcol - 2 * IN, yc - 2 * IN, Z0, xcol + 2 * IN, yc + 2 * IN, zb + ph + 2 * IN); a.box(xcol - 4 * IN, yc - 4 * IN, Z0, xcol + 4 * IN, yc + 4 * IN, Z0 + 0.6 * IN);
  for (const s of [-1, 1]) { a.box(xf - 2 * IN, yc + s * (pw / 2 + 2 * IN) - 1.5 * IN, Z0, xf + tp + 2 * IN, yc + s * (pw / 2 + 2 * IN) + 1.5 * IN, zb - 2 * IN); a.box(X0 + 1 * IN, yc + s * (pw * 0.42) - 1.5 * IN, Z0, xcol + 4 * IN, yc + s * (pw * 0.42) + 1.5 * IN, Z0 + 3 * IN); }
  for (const sy of [-1, 1]) for (const sz of [0.22, 0.78]) { const y = yc + sy * (pw / 2 + 1.4 * IN), z = zb + ph * sz, rr = m.max(0.45 * IN, pw * 0.025); a.xcyl(xf - 1.2 * IN, xp + tp + 1.2 * IN, y, z, rr, 8); hex(a, xf - 1.2 * IN - rr * 2, xf - 1.2 * IN, y, z, rr * 1.7); hex(a, xp + tp + 1.2 * IN, xp + tp + 1.2 * IN + rr * 2, y, z, rr * 1.7); }
  for (const sy of [-1, 1]) for (const [sz, mz] of [[0.22, 1], [0.78, -1]]) { const y = yc + sy * pw * 0.2, z = zb + ph * (mz > 0 ? 0.84 : 0.16); a.xcyl(X0 + tg, xf, y, z, rN, 20); fl(a, nn, 'x', y, z, X0, 1); }
  a.rect(xf, yc - pw / 2 - 2 * IN, xp + tp, yc + pw / 2 + 2 * IN, 'EQUIP'); a.rect(xf + tp, yc - pw / 2, xp, yc + pw / 2, 'EQUIP-DETAIL'); a.rect(X0, yc - pw / 2, xf, yc + pw / 2, 'EQUIP-DETAIL'); a.rect(xcol - 4 * IN, yc - 4 * IN, xcol + 4 * IN, yc + 4 * IN, 'EQUIP-DETAIL');
  a.log(`Added the fixed head with four flanged nozzles, ${np} gasketed plates, the pressure plate, four tie bolts with nuts, the carrying and guide bars, the rear column and the base rails (plan and 3D).`);
}
/** a double block and bleed valve station: two ball valves with a bleed branch between them, flanged ends */
function dbbStation(a, v) {
  const { X0, Z0, cy } = a, n = v.n, r = od(n) / 2, tg = ft(n) * 2.7, sp = m.max(r * 5.2, 9 * IN), L = tg * 2 + sp * 3, X1 = X0 + L, zc = Z0 + fo(n) + 3 * IN, R1 = od(1) / 2;
  a.xcyl(X0 + tg, X1 - tg, cy, zc, r, 22); fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, zc, X1, -1);
  miniBall(a, X0 + tg + sp * 0.5, cy, zc, r, r * 3.2); miniBall(a, X0 + tg + sp * 2.5, cy, zc, r, r * 3.2);
  const xb = X0 + tg + sp * 1.5, zt = zc + r + 5 * IN; a.cyl(xb, cy, zc, zt, R1, 14); a.ell(xb, cy, zc, R1 * 1.15, R1 * 1.15, R1 * 1.15, 12, 6);
  a.cyl(xb, cy, zt, zt + R1 * 2.6, R1 * 1.4, 18); a.ycyl(cy - R1 * 1.4 - R1 * 0.5, cy - R1 * 1.4, xb, zt + R1 * 1.3, R1 * 0.38, 10); a.box(xb - R1 * 0.2, cy - R1 * 1.4 - R1 * 0.7, zt + R1 * 1.3 - R1 * 0.15, xb + R1 * 3.0, cy - R1 * 1.4 - R1 * 0.5, zt + R1 * 1.3 + R1 * 0.15);
  a.cyl(xb, cy, zt + R1 * 2.6, zt + R1 * 4.2, R1, 14); hexZ(a, xb, cy, zt + R1 * 4.2, zt + R1 * 4.8, R1 * 1.2);
  for (const x of [X0 + tg + sp * 1.0, X0 + tg + sp * 2.0]) stand(a, x, cy, zc, r, Z0, r * 1.4);
  a.outline(); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL'); a.circ(xb, cy, R1 * 1.4, 'EQUIP-DETAIL');
  a.log('Added the flanged ends, two welded ball valves with levers, a bleed branch between them with its own lever valve and plug, and two floor supports (plan and 3D).');
}
/** a pressure-reducing station: parallel runs each with block valves and a reducing valve, joined by an inlet and an outlet header. Back-anchored */
function prvStation(a, v) {
  const { X0, Z0 } = a, n = v.n, r = od(n) / 2, tg = ft(n) * 2.7, pitch = 2 * fo(n) * 1.15 + 3 * IN, zc = Z0 + 20 * IN, sp = r * 4.6, L = tg * 2 + sp * 4 + 26 * IN, yk = (k) => -(fo(n) + 6 * IN + k * pitch), xh0 = X0 + tg + 12 * IN, xh1 = X0 + L - tg - 12 * IN, ym = (yk(0) + yk(v.runs - 1)) / 2;
  a.ycyl(yk(v.runs - 1), yk(0), xh0, zc, r, 20); a.ycyl(yk(v.runs - 1), yk(0), xh1, zc, r, 20);
  a.xcyl(X0 + tg, xh0, ym, zc, r, 20); a.xcyl(xh1, X0 + L - tg, ym, zc, r, 20); fl(a, n, 'x', ym, zc, X0, 1); fl(a, n, 'x', ym, zc, X0 + L, -1);
  for (let k = 0; k < v.runs; k++) { const y = yk(k); a.xcyl(xh0, xh1, y, zc, r, 20); const x0 = xh0 + 5 * IN;
    miniGate(a, x0 + sp * 0.5, y, zc, r, sp * 0.7);
    if (k < v.runs - 1 || v.runs === 2) { a.ell(x0 + sp * 1.5, y, zc, sp * 0.3, r * 1.5, r * 1.5, 16, 8); a.cyl(x0 + sp * 1.5, y, zc, zc + r * 2.0, r * 0.95, 18); a.cyl(x0 + sp * 1.5, y, zc + r * 2.0, zc + r * 4.6, r * 1.3, 22); a.cyl(x0 + sp * 1.5, y, zc + r * 4.6, zc + r * 4.9, r * 1.5, 22); a.cyl(x0 + sp * 1.5, y, zc + r * 4.9, zc + r * 5.8, r * 0.3, 8); hexZ(a, x0 + sp * 1.5, y, zc + r * 5.8, zc + r * 6.1, r * 0.45); }
    else { a.ell(x0 + sp * 1.5, y, zc, sp * 0.3, r * 1.5, r * 1.5, 16, 8); a.cyl(x0 + sp * 1.5, y, zc, zc + r * 2.2, r, 18); stemWheel(a, x0 + sp * 1.5, y, zc + r * 2.2, r * 2.6, r, r * 1.4, true, 4); }
    miniGate(a, x0 + sp * 2.5, y, zc, r, sp * 0.7); stand(a, x0 + sp * 1.0, y, zc, r, Z0, r * 1.6); stand(a, x0 + sp * 2.0, y, zc, r, Z0, r * 1.6); }
  a.rect(X0, yk(v.runs - 1) - 4 * IN, X0 + L, yk(0) + 4 * IN, 'EQUIP-DETAIL'); a.outline(); for (let k = 0; k < v.runs; k++) a.line(xh0, yk(k), xh1, yk(k), 'EQUIP-DETAIL');
  a.log(`Added the flanged inlet and outlet, two cross headers and ${v.runs} parallel runs with a block valve each side of ${v.runs === 3 ? 'two reducing valves and a hand-operated bypass' : 'a spring-loaded reducing valve'} and floor stands (plan and 3D).`);
}
/** a flanged water meter assembly: gate valve, strainer, meter, check valve and gate valve in line */
function meterAssy(a, v) {
  const { X0, Z0, cy } = a, n = v.n, r = od(n) / 2, tg = ft(n) * 2.7, sp = m.max(r * 5.5, 9 * IN), L = tg * 2 + sp * 5, X1 = X0 + L, zc = Z0 + fo(n) + 4 * IN;
  a.xcyl(X0 + tg, X1 - tg, cy, zc, r, 22); fl(a, n, 'x', cy, zc, X0, 1); fl(a, n, 'x', cy, zc, X1, -1);
  const xs = [0, 1, 2, 3, 4].map((k) => X0 + tg + sp * (k + 0.5)); miniGate(a, xs[0], cy, zc, r, sp * 0.8); miniStrainer(a, xs[1], cy, zc, r, sp * 0.8); miniMeter(a, xs[2], cy, zc, r, sp * 0.9); miniCheck(a, xs[3], cy, zc, r, sp * 0.8); miniGate(a, xs[4], cy, zc, r, sp * 0.8);
  stand(a, X0 + tg + sp * 1.0, cy, zc, r, Z0, r * 1.6); stand(a, X0 + tg + sp * 3.0, cy, zc, r, Z0, r * 1.6);
  a.outline(); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL'); for (const x of xs) a.circ(x, cy, r * 0.9, 'EQUIP-DETAIL');
  a.log('Added the flanged run with a gate valve, a Y strainer, a meter with a register dome, a swing check valve and a second gate valve, and two floor stands (plan and 3D).');
}
/** a horizontal air receiver on saddles with its fittings, on a skid */
function receiver(a, v) {
  const { X0, Z0, cy } = a, d = v.d * IN, l = v.l * IN, r = d / 2, he = r * 0.45, zb = Z0 + 4 * IN, zc = zb + 3 * IN + r, sx = [X0 + l * 0.22, X0 + l * 0.78], c = X0 + l / 2;
  a.xcyl(X0 + he, X0 + l - he, cy, zc, r, 32); a.ell(X0 + he, cy, zc, he, r, r, 20, 10); a.ell(X0 + l - he, cy, zc, he, r, r, 20, 10);
  for (const x of sx) { a.box(x - 3 * IN, cy - r * 0.8, zb, x + 3 * IN, cy + r * 0.8, zb + 3 * IN); for (const s of [-1, 1]) prismY(a, [[x - 3 * IN, zb + 3 * IN], [x + 3 * IN, zb + 3 * IN], [x + 2 * IN, zc - r * 0.5], [x - 2 * IN, zc - r * 0.5]], cy + s * r * 0.55 - 0.3 * IN, cy + s * r * 0.55 + 0.3 * IN); a.box(x - 3 * IN, cy - r * 0.6, zc - r * 0.62, x + 3 * IN, cy + r * 0.6, zc - r * 0.5); }
  for (const s of [-1, 1]) a.box(X0 + 1 * IN, cy + s * r * 0.75 - 1.5 * IN, Z0, X0 + l - 1 * IN, cy + s * r * 0.75 + 1.5 * IN, zb);
  for (const x of [c - l * 0.12, c + l * 0.12]) { a.cyl(x, cy, zc + r * 0.9, zc + r + 4 * IN, 1.3 * IN, 14); } 
  ring(a, 'z', c, cy, r * 0.28, r * 0.42, zc + r - 0.2 * IN, zc + r + 1.2 * IN, r * 0.42, 22); a.cyl(c, cy, zc + r + 1.2 * IN, zc + r + 1.6 * IN, r * 0.46, 22);
  const xr = c - l * 0.12; a.cyl(xr, cy, zc + r + 4 * IN, zc + r + 7 * IN, 1.3 * IN, 12); a.cyl(xr, cy, zc + r + 7 * IN, zc + r + 11.5 * IN, 1.9 * IN, 14); a.cyl(xr, cy, zc + r + 11.5 * IN, zc + r + 12.5 * IN, 1.0 * IN, 10); a.xcyl(xr, xr + 3 * IN, cy, zc + r + 8 * IN, 0.4 * IN, 6);
  const xg = c + l * 0.12; a.cyl(xg, cy, zc + r + 4 * IN, zc + r + 6 * IN, 0.5 * IN, 8); gauge(a, xg, cy - 1.0 * IN, zc + r + 8 * IN, 2.2 * IN);
  for (const [x, s] of [[X0 - 0, -1], [X0 + l, 1]]) { a.xcyl(x + s * -he * 0.9, x + s * 3 * IN, cy, zc, 1.3 * IN, 14); a.xcyl(x + s * 2 * IN, x + s * 3 * IN, cy, zc, 2.0 * IN, 20); }
  a.cyl(c + l * 0.25, cy, zb + 3 * IN, zc - r * 0.9, 0.5 * IN, 8); a.cyl(c + l * 0.25, cy, zb + 1 * IN, zb + 3 * IN, 1.1 * IN, 10);
  a.outline(); a.rect(X0, cy - r, X0 + l, cy + r, 'EQUIP-DETAIL'); a.circ(c, cy, r * 0.42, 'EQUIP-DETAIL'); a.circ(xr, cy, 1.9 * IN, 'EQUIP-DETAIL');
  a.log('Added the horizontal shell with two dished heads on saddles over a channel base, the top manway with cover, a spring relief valve, a pressure gauge, end nozzles and a drain with its valve (plan and 3D).');
}
/** a duty and standby end-suction pump skid with a common suction header and discharge header. Back-anchored */
function duplexPump(a, v) {
  const { X0, Z0 } = a, mr = v.mr * IN, bh = 6 * IN, zc = Z0 + bh + v.axis * IN, pitch = 2 * mr + 16 * IN, mw = v.mw * IN, sn = v.sn, dn = v.dn, rs = od(sn) / 2, rd = od(dn) / 2, yk = (k) => -(mr + 8 * IN + k * pitch), sl = mw + v.gap * IN + 24 * IN, depth = 2 * mr + 16 * IN + pitch;
  for (const y of [-3 * IN, -depth + 3 * IN]) a.box(X0, y - 3 * IN, Z0, X0 + sl, y + 3 * IN, Z0 + bh); for (const f of [0.02, 0.35, 0.65, 0.98]) a.box(X0 + sl * f - 1.5 * IN, -depth + 3 * IN, Z0, X0 + sl * f + 1.5 * IN, -3 * IN, Z0 + bh * 0.8); a.box(X0 + 1 * IN, -depth + 1 * IN, Z0 + bh, X0 + sl - 1 * IN, -1 * IN, Z0 + bh + 6);
  const xs = X0 + sl - 4 * IN; a.ycyl(yk(1) - 4 * IN, -1 * IN, xs, zc, rs, 20); fl(a, sn, 'y', xs, zc, -1 * IN, -1);
  const zd = zc + mr * 0.8 + 16 * IN, xd = X0 + mw + v.gap * IN * 0.4;
  a.ycyl(yk(1) - 2 * IN, -1 * IN, xd + 4 * IN, zd, rd, 20); fl(a, dn, 'y', xd + 4 * IN, zd, -1 * IN, -1);
  for (let k = 0; k < 2; k++) { const y = yk(k), mx0 = X0 + 4 * IN, mx1 = mx0 + mw * 0.55;
    a.xcyl(mx0 + 2 * IN, mx1, y, zc, mr, 24); a.xcyl(mx0, mx0 + 2 * IN, y, zc, mr * 0.88, 22); a.box(mx0 + 4 * IN, y - mr * 0.9, Z0 + bh + 6, mx1 - 3 * IN, y + mr * 0.9, zc - mr * 0.7); for (let q = 0; q < 8; q++) a.xcyl(mx0 + 4 * IN + q * (mx1 - mx0 - 8 * IN) / 8, mx0 + 4 * IN + q * (mx1 - mx0 - 8 * IN) / 8 + 4, y, zc, mr * 1.04, 24);
    a.box(mx0 + (mx1 - mx0) * 0.45, y - mr * 0.35, zc + mr * 0.9, mx0 + (mx1 - mx0) * 0.75, y + mr * 0.35, zc + mr * 1.4);
    const gx0 = mx1, gx1 = gx0 + mw * 0.12; a.xcyl(gx0, gx1, y, zc, mr * 0.6, 14); a.box(gx0, y - mr * 0.5, zc - mr * 0.5, gx1, y + mr * 0.5, zc + mr * 0.5 + 6);
    const px = gx1 + mw * 0.2; a.ell(px, y, zc, mw * 0.17, mr * 1.2, mr * 1.25, 20, 10); a.box(px - mw * 0.1, y - mr * 0.8, Z0 + bh + 6, px + mw * 0.1, y + mr * 0.8, zc - mr * 0.9);
    a.xcyl(px + mw * 0.1, xs, y, zc, rs, 20); a.ell(xs, y, zc, rs * 1.15, rs * 1.15, rs * 1.15, 12, 6);
    a.cyl(px, y, zc + mr * 0.8, zd, rd, 20); a.ell(px, y, zd, rd * 1.2, rd * 1.2, rd * 1.2, 12, 6); vValve(a, px, y, zc + mr * 2.2 + 3 * IN, rd);
    a.xcyl(px, xd + 4 * IN, y, zd, rd, 20); a.circ(px, y, mr * 1.1, 'EQUIP-DETAIL'); a.rect(mx0, y - mr, mx1, y + mr, 'EQUIP'); }
  a.cyl(xd + 4 * IN, yk(1) - 0.5 * IN, zd + rd * 0.6, zd + rd + 4 * IN, 0.4 * IN, 6); gauge(a, xd + 4 * IN, yk(1) - 0.5 * IN, zd + rd + 5 * IN, 1.8 * IN);
  a.rect(X0, -depth, X0 + sl, 0, 'EQUIP-DETAIL'); a.line(xs, yk(1) - 4 * IN, xs, -1 * IN, 'EQUIP-DETAIL');
  a.log('Added the channel base, two finned motors with terminal boxes and coupling guards, two volute pumps, a common flanged suction header, discharge risers each with a block valve joined by a flanged discharge header and a gauge (plan and 3D).');
}
/** a steam header with drip legs, each ending in a strainer-less trap station, and a take-off riser */
function steamHeader(a, v) {
  const { X0, Z0, cy } = a, nh = v.nh, nd = v.nd, rh = od(nh) / 2, rd = od(nd) / 2, pitch = v.pitch * IN, zh = Z0 + v.hh * IN, L = (v.legs + 1) * pitch + 10 * IN;
  ring(a, 'x', cy, zh, rh * 0.88, rh, X0, X0 + L, rh, 24); a.ell(X0 + L, cy, zh, rh * 0.3, rh, rh, 16, 6); fl(a, nh, 'x', cy, zh, X0, 1);
  for (let k = 0; k < v.legs; k++) { const x = X0 + 8 * IN + (k + 0.7) * pitch, zb = Z0 + 14 * IN;
    a.cyl(x, cy, zb, zh, rd, 18); a.ell(x, cy, zh, rd * 1.12, rd * 1.12, rd * 1.12, 12, 6);
    a.cyl(x, cy, zb - 0.2 * IN, zb + 0.2 * IN, rd * 1.3, 18); a.xcyl(x, x + 8 * IN, cy, zb + 4 * IN, rd * 0.55, 12); miniTrap(a, x + 9.5 * IN, cy, zb + 4 * IN, rd * 0.85);
    a.cyl(x, cy, Z0 + 0.5 * IN, zb, rd * 0.6, 12); a.box(x - 2 * IN, cy - 2 * IN, Z0, x + 2 * IN, cy + 2 * IN, Z0 + 0.5 * IN); a.cyl(x, cy, Z0 + 4 * IN, Z0 + 5.2 * IN, rd * 0.95, 14); a.xcyl(x, x + 3.5 * IN, cy, Z0 + 6.4 * IN, 0.2 * IN, 6); }
  const xt = X0 + L - 6 * IN; a.cyl(xt, cy, zh, zh + 12 * IN, rh * 0.7, 18); a.ell(xt, cy, zh, rh * 0.82, rh * 0.82, rh * 0.82, 12, 6); a.cyl(xt, cy, zh + 12 * IN, zh + 12 * IN + ft(nh) * 0.5, rh * 0.74, 18);
  for (const x of [X0 + 4 * IN, X0 + L - 12 * IN]) { a.cyl(x, cy, Z0 + 6, zh - rh, rh * 0.3, 10); a.box(x - rh * 0.9, cy - rh * 0.9, Z0, x + rh * 0.9, cy + rh * 0.9, Z0 + 10); }
  a.outline(); a.line(X0, cy, X0 + L, cy, 'EQUIP-DETAIL'); for (let k = 0; k < v.legs; k++) a.circ(X0 + 8 * IN + (k + 0.7) * pitch, cy, rd, 'EQUIP-DETAIL');
  a.log(`Added the flanged header with a dished end, ${v.legs} drip legs each with a cap, a side trap with its cover bolts and a drain valve, a take-off riser and two floor posts (plan and 3D).`);
}
/** a utility stand: a standpipe on a base plate with side ports, each with a lever valve and a quick-coupling hose end */
function utilityStand(a, v) {
  const { X0, Z0, cy } = a, rs = od(2) / 2, rp = od(1) / 2, bw = 14 * IN, cx = X0 + bw / 2 + 10 * IN, hz = (6 + v.ports * 8.5) * IN, zt = Z0 + 0.5 * IN + hz;
  a.box(cx - bw / 2, cy - bw / 2, Z0, cx + bw / 2, cy + bw / 2, Z0 + 0.5 * IN); for (const sx of [-1, 1]) for (const sy of [-1, 1]) boltZ(a, cx + sx * (bw / 2 - 1.4 * IN), cy + sy * (bw / 2 - 1.4 * IN), Z0 + 0.5 * IN, Z0 + 1.3 * IN, 0.4 * IN);
  a.cyl(cx, cy, Z0 + 0.5 * IN, zt, rs, 20); a.cyl(cx, cy, Z0 + 0.5 * IN, Z0 + 1.5 * IN, rs * 1.5, 20); a.cyl(cx, cy, zt - 0.2 * IN, zt, rs * 1.12, 20);
  for (const s of [-1, 1]) prismY(a, [[cx + s * rs, Z0 + 0.5 * IN], [cx + s * bw * 0.4, Z0 + 0.5 * IN], [cx + s * rs, Z0 + 0.5 * IN + 6 * IN]], cy - 0.25 * IN, cy + 0.25 * IN);
  for (let k = 0; k < v.ports; k++) { const s = k % 2 ? 1 : -1, z = Z0 + 0.5 * IN + 5 * IN + k * 8.5 * IN, xe = cx + s * 9 * IN;
    a.xcyl(cx, xe, cy, z, rp, 16); a.ell(cx, cy, z, rp * 1.2, rp * 1.2, rp * 1.2, 12, 6);
    miniBall(a, cx + s * 3.6 * IN, cy, z, rp * 0.78, rp * 2.2); if (s < 0) { /* lever points outward: mirrored by drawing a short stub on the far side */ }
    const xc = xe; a.xcyl(xc - 0.1 * IN, xc + s * 1.0 * IN, cy, z, rp * 1.25, 6); a.xcyl(xc + s * 1.0 * IN, xc + s * 2.2 * IN, cy, z, rp * 0.95, 16); a.xcyl(xc + s * 2.2 * IN, xc + s * 3.0 * IN, cy, z, rp * 1.1, 16);
    for (const q of [-1, 1]) a.ycyl(cy + q * rp * 1.0, cy + q * rp * 1.0 + q * 0.5 * IN, xc + s * 2.6 * IN, z, 0.16 * IN, 6);
    a.box(cx + s * 5.6 * IN - 0.8 * IN, cy - 0.6 * IN - rp, z + rp * 1.2, cx + s * 5.6 * IN + 0.8 * IN, cy - rp, z + rp * 1.2 + 1.2 * IN); }
  a.cyl(cx, cy, zt, zt + 2.6 * IN, 0.6 * IN, 8); gauge(a, cx, cy - 1.0 * IN, zt + 4 * IN, 2.2 * IN); a.cyl(cx, cy, zt + 2.6 * IN, zt + 4 * IN, 0.5 * IN, 8);
  a.outline(); a.rect(cx - bw / 2, cy - bw / 2, cx + bw / 2, cy + bw / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, rs, 'EQUIP-DETAIL');
  a.log(`Added the base plate with four anchor bolts, the standpipe with two gussets, ${v.ports} side ports each with a lever ball valve and a cam-lock hose end with its cam arms, a gauge and a cap (plan and 3D).`);
}

// ------------------------------------------------------------------------------------------ families
const sz = (n) => `${n} in`;
const FAMS = [
  // ===================================================== fittings =====================================================
  fam({ cat: 'piping/fittings', title: 'Generic forged threaded pipe elbow', desc: (v) => `${v.n} in forged threaded 90 degree elbow: two thick round bosses meeting in a rounded corner, with banded ends and open bores.`,
    vs: rowsOf(thrElbow, [0.75, 1.5, 3].map((n) => [sz(n), { n }])), build: thrElbow }),
  fam({ cat: 'piping/fittings', title: 'Generic forged threaded pipe tee', desc: (v) => `${v.n} in forged threaded tee: a run and a side branch rising from a rounded crotch, with banded open ends.`,
    vs: rowsOf(thrTee, [1, 2, 4].map((n) => [sz(n), { n }])), build: thrTee }),
  fam({ cat: 'piping/fittings', title: 'Generic hex pipe nipple', desc: (v) => `${v.n} in by ${v.L} in hollow pipe nipple with a hexagonal wrench section in the middle and a threaded band at each end.`,
    vs: rowsOf(hexNipple, [[0.5, 3], [1, 4], [2, 6]].map(([n, L]) => [`${n} in by ${L} in`, { n, L }])), build: hexNipple }),
  fam({ cat: 'piping/fittings', title: 'Generic threaded pipe coupling sleeve', desc: (v) => `${v.n} in full coupling: a sleeve with chamfered ends, an open threaded bore and a centre stop rib.`,
    vs: rowsOf(thrCoupling, [0.75, 2].map((n) => [sz(n), { n }])), build: thrCoupling }),
  fam({ cat: 'piping/fittings', title: 'Generic threaded pipe plug', desc: (v) => `${v.n} in pipe plug lying on its side: a threaded shank, a collar and a ${v.head} head.`,
    vs: rowsOf(hexPlug, [[1, 'hex'], [3, 'square']].map(([n, head]) => [`${n} in, ${head} head`, { n, head }])), build: hexPlug }),
  fam({ cat: 'piping/fittings', title: 'Generic 180 degree return bend', desc: (v) => `${v.n} in long-radius 180 degree return bend standing in the vertical plane: two parallel legs joined by a half-circle with bevelled weld ends.`,
    vs: rowsOf(returnBend, [2, 6, 12].map((n) => [sz(n), { n }])), build: returnBend }),
  fam({ cat: 'piping/fittings', title: 'Generic slip-on pipe flange on base', desc: (v) => `${v.n} in slip-on flange standing face-on on a base plate: a raised face, ${FLG[v.n][2]} bolts with nuts and a pipe stub with a fillet weld behind it.`,
    vs: rowsOf(slipOn, [3, 8, 16].map((n) => [sz(n), { n }])), build: slipOn }),
  fam({ cat: 'piping/fittings', title: 'Generic lap-joint stub end with backing flange', desc: (v) => `${v.n} in pipe with a flared lap stub end and a loose backing flange with ${FLG[v.n][2]} bolts and nuts sliding behind the lap.`,
    vs: rowsOf(lapJoint, [3, 6, 12].map((n) => [sz(n), { n }])), build: lapJoint }),
  fam({ cat: 'piping/fittings', title: 'Generic spectacle blind on stand', desc: (v) => `${v.n} in figure-eight spectacle blind: a solid disc and an open ring joined by a web, with a lifting tab, standing on a base plate between two chocks.`,
    vs: rowsOf(spectacle, [4, 8, 12].map((n) => [sz(n), { n }])), build: spectacle }),
  fam({ cat: 'piping/fittings', title: 'Generic butt-weld pipe cross', desc: (v) => `${v.n} in equal cross: a run with a branch rising and a branch dropping from a forged centre, with bevelled weld ends.`,
    vs: rowsOf(xCross, [4, 10].map((n) => [sz(n), { n }])), build: xCross }),
  fam({ cat: 'piping/fittings', title: 'Generic 45 degree lateral pipe fitting', desc: (v) => `${v.n} in lateral: a straight run with a branch leaving at 45 degrees from a forged crotch, with bevelled weld ends.`,
    vs: rowsOf(lateral, [4, 8].map((n) => [sz(n), { n }])), build: lateral }),
  fam({ cat: 'piping/fittings', title: 'Generic branch outlet fitting on header', desc: (v) => `${v.nh} in header pipe with a ${v.nb} in ${v.kind === 'weld' ? 'tapered weld-on' : v.kind === 'thread' ? 'threaded' : 'socket-weld'} branch outlet fitting and its open bore.`,
    vs: rowsOf(olet, [[8, 2, 'weld'], [4, 1, 'thread'], [3, 0.75, 'sock']].map(([nh, nb, kind]) => [`${nb} in ${kind === 'sock' ? 'socket' : kind} outlet on ${nh} in`, { nh, nb, kind }])), build: olet }),
  fam({ cat: 'piping/fittings', title: 'Generic flanged expansion joint', desc: (v) => `${v.n} in flanged expansion joint: two bolted flanges, ${v.conv === 0 ? 'a single rubber arch with two reinforcing bands' : `${v.conv} metal convolutions`} and four tie rods with nuts.`,
    vs: rowsOf(expJoint, [[4, 8, 0, 'rubber arch'], [6, 14, 3, '3 convolutions'], [12, 20, 5, '5 convolutions']].map(([n, L, conv, t]) => [`${n} in, ${t}`, { n, L, conv }])), build: expJoint }),
  fam({ cat: 'piping/fittings', title: 'Generic grooved pipe coupling', desc: (v) => `${v.n} in grooved coupling: two grooved pipe ends joined by a two-piece housing with a centre seal rib and two bolted lugs.`,
    vs: rowsOf(grooved, [2, 4, 8].map((n) => [sz(n), { n }])), build: grooved }),
  // ===================================================== valves =====================================================
  fam({ cat: 'piping/valves', title: 'Generic flanged plug valve with wrench', desc: (v) => `${v.n} in flanged plug valve: a tapered body with a bottom cap, a bolted cover with a sealant screw, a square stem and a long wrench.`,
    vs: rowsOf(plugValve, [[2, 7], [4, 9], [8, 11.5]].map(([n, ff]) => [sz(n), { n, ff }])), build: plugValve }),
  fam({ cat: 'piping/valves', title: 'Generic threaded needle valve', desc: (v) => `${v.n} in threaded needle valve: hex collars, a globe-shaped body, a hex bonnet, a slender stem and a knurled handle with a lock cap.`,
    vs: rowsOf(needle, [[0.5, 3], [1, 3.8], [1.5, 4.8]].map(([n, ff]) => [sz(n), { n, ff }])), build: needle }),
  fam({ cat: 'piping/valves', title: 'Generic flanged diaphragm valve', desc: (v) => `${v.n} in flanged diaphragm valve: a weir body, a two-part bonnet with ring bolts and a domed cover, a stem with indicator and a round hand wheel.`,
    vs: rowsOf(diaphragmValve, [[2, 8], [4, 12], [6, 16]].map(([n, ff]) => [sz(n), { n, ff }])), build: diaphragmValve }),
  fam({ cat: 'piping/valves', title: 'Generic knife gate valve between flanges', desc: (v) => `${v.n} in knife gate valve between two bolted flanges: a thin wafer body, an exposed blade, two yoke columns with a top bridge and a hand wheel.`,
    vs: rowsOf(knifeGate, [4, 8, 12].map((n) => [sz(n), { n }])), build: knifeGate }),
  fam({ cat: 'piping/valves', title: 'Generic flanged angle globe valve', desc: (v) => `${v.n} in angle globe valve standing on its bottom flange: a side inlet, a round body, a bonnet, a yoke with stem and a hand wheel.`,
    vs: rowsOf(angleGlobe, [2, 4, 6].map((n) => [sz(n), { n }])), build: angleGlobe }),
  fam({ cat: 'piping/valves', title: 'Generic two-piece threaded ball valve', desc: (v) => `${v.n} in two-piece threaded ball valve: hex ends, a round body with a screwed end cap, a stem neck with stop plate and a lever with a grip sleeve.`,
    vs: rowsOf(thrBall, [[0.5, 2.6], [1, 3.4], [2, 4.8]].map(([n, ff]) => [sz(n), { n, ff }])), build: thrBall }),
  fam({ cat: 'piping/valves', title: 'Generic dual-plate wafer check valve', desc: (v) => `${v.n} in dual-plate check valve between two bolted flanges: a wafer body with two hinged plates on a centre pin and a lifting lug.`,
    vs: rowsOf(dualCheck, [4, 8, 12].map((n) => [sz(n), { n }])), build: dualCheck }),
  fam({ cat: 'piping/valves', title: 'Generic suction foot valve with strainer', desc: (v) => `${v.n} in foot valve standing on its strainer: a basket of vertical bars with hoops, a lifting valve body and a bolted flange on top.`,
    vs: rowsOf(footValve, [[3, 12], [6, 18], [10, 26]].map(([n, hs]) => [`${n} in, ${hs} in basket`, { n, hs }])), build: footValve }),
  fam({ cat: 'piping/valves', title: 'Generic spring-loaded pressure-reducing valve', desc: (v) => `${v.n} in flanged pressure-reducing valve: a globe body, a yoke, a finned spring housing with adjusting screw and lock nut and a gauge on a tube.`,
    vs: rowsOf(prv, [[2, 10], [4, 13], [6, 17]].map(([n, ff]) => [sz(n), { n, ff }])), build: prv }),
  fam({ cat: 'piping/valves', title: 'Generic pneumatic actuated ball valve', desc: (v) => `${v.n} in flanged ball valve with a double-acting pneumatic actuator across the stem, end caps, air ports, a beacon dome and a side solenoid block.`,
    vs: rowsOf(pneuBall, [[2, 10], [4, 12], [6, 15.9]].map(([n, ff]) => [sz(n), { n, ff }])), build: pneuBall }),
  fam({ cat: 'piping/valves', title: 'Generic electric actuated gate valve', desc: (v) => `${v.n} in flanged gate valve with an electric actuator: a gearbox, a finned motor with terminal box, a front hand wheel and a position dome.`,
    vs: rowsOf(motorGate, [[4, 9], [8, 11.5], [12, 14]].map(([n, ff]) => [sz(n), { n, ff }])), build: motorGate }),
  fam({ cat: 'piping/valves', title: 'Generic threaded solenoid valve', desc: (v) => `${v.n} in threaded solenoid valve: hex tails, a square body, a bonnet nut, a round coil housing and a side plug-in connector with a cable gland.`,
    vs: rowsOf(solenoid, [[0.5, 3], [1, 4], [2, 5.5]].map(([n, ff]) => [sz(n), { n, ff }])), build: solenoid }),
  fam({ cat: 'piping/valves', title: 'Generic threaded steam trap', desc: (v) => `${v.n} in steam trap: a cylindrical float chamber with a round bolted cover and eight bolts, a high inlet, a low outlet, two feet and a vent plug.`,
    vs: rowsOf(steamTrap, [[0.75, 5.5], [1.5, 8]].map(([n, ff]) => [sz(n), { n, ff }])), build: steamTrap }),
  // ===================================================== supports =====================================================
  fam({ cat: 'piping/supports', title: 'Generic adjustable pipe stanchion', desc: (v) => `${v.n} in pipe on an adjustable stanchion ${v.h} in tall: a base plate with anchor bolts, a stem with adjusting collar, gusset legs and a cradle with a strap.`,
    vs: rowsOf(stanchion, [[4, 10], [8, 16], [12, 24]].map(([n, h]) => [`${n} in, ${h} in tall`, { n, h }])), build: stanchion }),
  fam({ cat: 'piping/supports', title: 'Generic roller hanger', desc: (v) => `${v.n} in pipe on a roller hanger: ceiling plates, a threaded rod with turnbuckle, a yoke with side plates and a roller under the pipe.`,
    vs: rowsOf(rollerHanger, [[3, 20], [6, 26], [10, 32]].map(([n, drop]) => [`${n} in, ${drop} in drop`, { n, drop }])), build: rollerHanger }),
  fam({ cat: 'piping/supports', title: 'Generic riser clamp on floor slab', desc: (v) => `${v.n} in vertical pipe held by a split two-lug riser clamp that rests on a floor slab with a sleeve collar.`,
    vs: rowsOf(riserClamp, [[2, 24], [4, 30], [8, 36]].map(([n, hp]) => [`${n} in`, { n, hp }])), build: riserClamp }),
  fam({ cat: 'piping/supports', title: 'Generic wall bracket for pipe', desc: (v) => `${v.n} in pipe on a wall bracket: a bolted back plate, an angle arm with a triangular gusset and a strap, against a wall strip.`,
    vs: rowsOf(wallBracket, [2, 4, 6].map((n) => [sz(n), { n }]), 'back'), build: wallBracket }),
  fam({ cat: 'piping/supports', title: 'Generic beam clamp ring hanger', desc: (v) => `${v.n} in pipe on a split ring hanger with bolt ears, a rod with lock nut and a beam clamp gripping an I-beam flange.`,
    vs: rowsOf(beamClamp, [[1.5, 14], [3, 20], [5, 28]].map(([n, drop]) => [`${n} in, ${drop} in drop`, { n, drop }])), build: beamClamp }),
  fam({ cat: 'piping/supports', title: 'Generic pipe saddle support', desc: (v) => `${v.n} in pipe lying in a saddle support: a base plate with studs, two web plates with a centre rib and two curved cradle ribs.`,
    vs: rowsOf(saddle, [[10, 4], [16, 6], [24, 8]].map(([n, h]) => [`${n} in, ${h} in rise`, { n, h }])), build: saddle }),
  fam({ cat: 'piping/supports', title: 'Generic dummy leg pipe trunnion', desc: (v) => `${v.n} in pipe with a long-radius bend turning up and a dummy leg welded under the run with a bearing pad, four gussets and a base plate on a steel section.`,
    vs: rowsOf(trunnion, [[4, 12], [8, 18], [12, 24]].map(([n, h]) => [`${n} in, ${h} in leg`, { n, h }])), build: trunnion }),
  fam({ cat: 'piping/supports', title: 'Generic constant-load spring hanger', desc: (v) => `${v.n} in pipe on a constant-load hanger: a strap and lower rod, a rectangular casing with a lever arm and a travel scale, and an upper rod to a beam attachment.`,
    vs: rowsOf(constantHanger, [[6, 9, 10, 8, 12], [10, 12, 14, 10, 16], [16, 16, 18, 12, 20]].map(([n, cw, ch, rod, top]) => [`${n} in, ${cw} in casing`, { n, cw, ch, rod, top }])), build: constantHanger }),
  fam({ cat: 'piping/supports', title: 'Generic multi-bay pipe rack', desc: (v) => `Pipe rack of ${v.bays} bays: ${v.bays + 1} bents of two columns with ${v.tiers} cross beam tier${v.tiers > 1 ? 's' : ''}, longitudinal beams, X bracing and ${v.np} pipes of mixed size on every tier.`,
    vs: rowsOf(bayRack, [['1 tier, 2 bays, 8 ft wide', { tiers: 1, bays: 2, w: 96, bay: 120, th: 108, np: 4 }], ['2 tiers, 2 bays, 10 ft wide', { tiers: 2, bays: 2, w: 120, bay: 120, th: 96, np: 5 }], ['2 tiers, 3 bays, 12 ft wide', { tiers: 2, bays: 3, w: 144, bay: 144, th: 108, np: 6 }]], 'back'), build: bayRack }),
  fam({ cat: 'piping/supports', title: 'Generic wall strut pipe rack', desc: (v) => `Wall strut rack: two slotted vertical struts on a wall strip with ${v.tiers} tier${v.tiers > 1 ? 's' : ''} of cantilever arms carrying ${v.np} pipe${v.np > 1 ? 's' : ''} of ${v.n} in a tier.`,
    vs: rowsOf(strutRack, [['2 tiers, 1 pipe, 4 in', { tiers: 2, np: 1, n: 4, w: 72 }], ['3 tiers, 2 pipes, 3 in', { tiers: 3, np: 2, n: 3, w: 84 }], ['3 tiers, 3 pipes, 2 in', { tiers: 3, np: 3, n: 2, w: 96 }]], 'back'), build: strutRack }),
  fam({ cat: 'piping/supports', title: 'Generic pipe sway brace', desc: (v) => `${v.n} in pipe with a bolted clamp and lug, a diagonal strut channel with cross ties and an angled ceiling fitting on a strip of slab.`,
    vs: rowsOf(swayBrace, [[3, 16], [8, 24]].map(([n, rise]) => [`${n} in, ${rise} in rise`, { n, rise }])), build: swayBrace }),
  fam({ cat: 'piping/supports', title: 'Generic pipe step-over platform', desc: (v) => `Step-over platform crossing four pipes: a ${v.s} in deck with kick plates, two stairs on cut stringers and handrails with mid rails, ${v.ph} in above the ground.`,
    vs: rowsOf(stepOver, [[48, 30], [72, 42]].map(([s, ph]) => [`${s} in span, ${ph} in high`, { s, ph }])), build: stepOver }),
  fam({ cat: 'piping/supports', title: 'Generic steel pipe sleeper frame', desc: (v) => `Steel sleeper: two footings with posts and base plates, a cross beam, ${v.sizes.length} pipes of mixed size on wear plates and two edge stops.`,
    vs: rowsOf(steelSleeper, [['3 pipes, low', { sizes: [6, 4, 3], h: 10 }], ['4 pipes, medium', { sizes: [8, 6, 4, 4], h: 16 }], ['6 pipes, high', { sizes: [10, 8, 6, 4, 3, 6], h: 24 }]]), build: steelSleeper }),
  // ===================================================== spools =====================================================
  fam({ cat: 'piping/spools', title: 'Generic flanged offset pipe spool', desc: (v) => `${v.n} in flanged spool with two 45 degree long-radius bends lifting the line ${v.off} in, bolted flanges at each end and two floor supports.`,
    vs: rowsOf(zSpool, [[3, 8, 12, 12], [6, 12, 16, 16], [8, 16, 18, 18], [12, 22, 24, 24]].map(([n, off, a0, a1]) => [`${n} in, ${off} in offset`, { n, off, a0, a1 }])), build: zSpool }),
  fam({ cat: 'piping/spools', title: 'Generic flanged pipe expansion loop', desc: (v) => `${v.n} in flanged expansion loop: four long-radius bends carry the line up ${v.h} in, across ${v.w} in and back down, with two floor supports.`,
    vs: rowsOf(expLoop, [[4, 16, 24, 14], [8, 24, 36, 18], [16, 40, 60, 24]].map(([n, h, w, a0]) => [`${n} in, ${h} in rise`, { n, h, w, a0 }])), build: expLoop }),
  fam({ cat: 'piping/spools', title: 'Generic electromagnetic flow meter spool', desc: (v) => `${v.n} in flanged flow meter: a lined tube with a wider electrode section, a neck and a compact transmitter box with a display window and two cable glands.`,
    vs: rowsOf(emag, [[3, 10], [6, 12], [10, 16]].map(([n, ff]) => [sz(n), { n, ff }])), build: emag }),
  fam({ cat: 'piping/spools', title: 'Generic cartridge filter skid', desc: (v) => `Filter skid: a channel base, ${v.nv} upright cartridge filter vessel${v.nv > 1 ? 's' : ''} with clamped lids, swing bolts and gauge, a low inlet header and a high outlet header, ${v.n} in flanges.`,
    vs: rowsOf(filterSkid, [['1 vessel, 3 in', { nv: 1, vr: 6, vh: 40, n: 3 }], ['2 vessels, 4 in', { nv: 2, vr: 8, vh: 48, n: 4 }], ['3 vessels, 6 in', { nv: 3, vr: 10, vh: 60, n: 6 }]], 'back'), build: filterSkid }),
  fam({ cat: 'piping/spools', title: 'Generic plate heat exchanger on frame', desc: (v) => `Plate heat exchanger: a fixed head with four ${v.nn} in flanged nozzles, ${m.round(v.pk / 0.2)} gasketed plates, a pressure plate, four tie bolts, carrying and guide bars, a rear column and base rails.`,
    vs: rowsOf(plateHX, [['small, 12 by 30 in plates', { pw: 12, ph: 30, pk: 5, nn: 2 }], ['medium, 24 by 48 in plates', { pw: 24, ph: 48, pk: 12, nn: 4 }], ['large, 32 by 72 in plates', { pw: 32, ph: 72, pk: 22, nn: 6 }]], 'back'), build: plateHX }),
  fam({ cat: 'piping/spools', title: 'Generic double block and bleed valve station', desc: (v) => `${v.n} in flanged line with two welded ball valves with levers, a bleed branch between them with its own lever valve and plug, and two floor supports.`,
    vs: rowsOf(dbbStation, [2, 4, 8].map((n) => [sz(n), { n }])), build: dbbStation }),
  fam({ cat: 'piping/spools', title: 'Generic pressure-reducing station skid', desc: (v) => `${v.n} in reducing station: flanged inlet and outlet, two cross headers and ${v.runs} parallel runs with block valves and ${v.runs === 3 ? 'two reducing valves and a hand-operated bypass' : 'a spring-loaded reducing valve'} on floor stands.`,
    vs: rowsOf(prvStation, [[2, 2], [4, 3], [6, 3]].map(([n, runs]) => [`${n} in, ${runs} runs`, { n, runs }]), 'back'), build: prvStation }),
  fam({ cat: 'piping/spools', title: 'Generic water meter assembly', desc: (v) => `${v.n} in flanged meter assembly: a gate valve, a Y strainer, a meter with a register dome, a swing check valve and a second gate valve in line on two floor stands.`,
    vs: rowsOf(meterAssy, [2, 3, 4].map((n) => [sz(n), { n }])), build: meterAssy }),
  fam({ cat: 'piping/spools', title: 'Generic compressed-air receiver skid', desc: (v) => `${v.d} in by ${v.l} in horizontal air receiver: a shell with two dished heads on saddles over a channel base, a top manway, a relief valve, a gauge, end nozzles and a drain.`,
    vs: rowsOf(receiver, [[24, 64], [30, 80], [36, 118]].map(([d, l]) => [`${d} in by ${l} in`, { d, l }])), build: receiver }),
  fam({ cat: 'piping/spools', title: 'Generic duty and standby pump skid', desc: (v) => `Twin pump skid: two finned motors with coupling guards and volute pumps on a channel base, a common ${v.sn} in flanged suction header and a ${v.dn} in discharge header with a block valve on each riser.`,
    vs: rowsOf(duplexPump, [['2 in suction, 54 in long', { sn: 2, dn: 1.5, axis: 7, mr: 4.5, mw: 38, gap: 20 }], ['3 in suction, 72 in long', { sn: 3, dn: 2, axis: 8, mr: 6, mw: 48, gap: 24 }], ['4 in suction, 96 in long', { sn: 4, dn: 3, axis: 10, mr: 8, mw: 64, gap: 28 }]], 'back'), build: duplexPump }),
  fam({ cat: 'piping/spools', title: 'Generic steam header with drip legs', desc: (v) => `${v.nh} in steam header with a dished end and ${v.legs} drip legs, each with a cap, a side trap with a bolted cover and a drain valve, a take-off riser and floor posts.`,
    vs: rowsOf(steamHeader, [[4, 2, 2, 28, 40], [6, 3, 3, 34, 44], [8, 4, 4, 40, 48]].map(([nh, legs, nd, pitch, hh]) => [`${nh} in, ${legs} legs`, { nh, legs, nd, pitch, hh }])), build: steamHeader }),
  fam({ cat: 'piping/spools', title: 'Generic utility hose station stand', desc: (v) => `Utility stand: a standpipe on an anchored base plate with ${v.ports} side ports, each with a lever ball valve and a cam-lock hose end, a gauge and a cap.`,
    vs: rowsOf(utilityStand, [2, 3, 4].map((ports) => [`${ports} ports`, { ports }])), build: utilityStand }),
];
for (const f of FAMS) { const b = f.build; f.build = (a, v) => { a.X0 += v._lx || 0; a.Z0 += v._lz || 0; return b(a, v); }; }
export default FAMS;

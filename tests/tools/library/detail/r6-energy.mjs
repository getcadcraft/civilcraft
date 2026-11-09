/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, energy: generation, renewable, distribution and oil and gas. Original geometry by type and size class; no maker, model or standard. */
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

// ------------------------------------------------------------------------------------------ generation
/** an enclosed engine-generator set. o.chp adds a roof cooler and heat-recovery flanges */
function genset(a, v, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  const bh = m.max(8 * IN, H * 0.14), sil = m.max(4.5 * IN, H * 0.055), coolH = o.chp ? 18 * IN : 0, eh = H - bh - sil * 2 - 36 - 60 - coolH;
  // fuel-tank base with forklift pockets and lifting lugs
  a.box(X0, YF, Z0 + 40, X1, YB, Z0 + bh); a.box(X0 + 60, YF + 20, Z0, X0 + 160, YB - 20, Z0 + 40); a.box(X1 - 160, YF + 20, Z0, X1 - 60, YB - 20, Z0 + 40);
  for (const x of [X0 + W * 0.33, X0 + W * 0.66]) a.box(x - 60, YF + 6, Z0 + bh * 0.25, x + 60, YF + 18, Z0 + bh * 0.7);
  a.cyl(X0 + W * 0.2, YF + D * 0.5, Z0 + bh, Z0 + bh + 40, 36, 10);
  // enclosure body, sloped roof, terminal box at the alternator end
  const zb = Z0 + bh, zr = zb + eh, xe = X1 - 130;
  a.box(X0 + 14, YF + 60, zb, xe, YB - 18, zr);
  prismX(a, [[YF + 60, zr], [YB - 18, zr], [YB - 90, zr + 36], [YF + 90, zr + 36]], X0 + 14, xe);
  a.box(xe, YF + D * 0.2, zb + 80, X1 - 4, YB - D * 0.2, zb + eh * 0.7); a.rect(xe, YF + D * 0.2, X1 - 4, YB - D * 0.2, 'EQUIP-DETAIL');
  // radiator end louvres
  for (let z = zb + 80; z < zr - 80; z += 44) a.box(X0, YF + 90, z, X0 + 22, YB - 90, z + 12);
  a.frame(X0 + 4, zb + 40, X0 + 14, zr - 20, YF + 60, YB - 60, 20);
  // front doors with lever handles
  const nd = m.max(2, m.round(W / (48 * IN))), dw = (xe - X0 - 60) / nd;
  for (let i = 0; i < nd; i++) {
    const x0 = X0 + 30 + i * dw + 12, x1 = X0 + 30 + (i + 1) * dw - 12;
    a.frame(x0, zb + 50, x1, zr - 50, YF + 8, YF + 64, m.max(20, W / 45));
    a.box(x1 - 60, YF - 8, (zb + zr) / 2 - 90, x1 - 40, YF + 8, (zb + zr) / 2 + 90); a.box(x1 - 60, YF - 8, (zb + zr) / 2 - 10, x1 - 8, YF, (zb + zr) / 2 + 10);
  }
  a.box(X0 + 80 + 60, YF + 4, zr - 260, X0 + 80 + m.min(260, dw * 0.5), YF + 14, zr - 110); a.cyl(X0 + 60 + dw - 120, YF + 5, zb + eh * 0.72 - 20, zb + eh * 0.72, 18, 8);
  // exhaust: silencer on the roof, supports and rain cap
  const sr = sil, sz = zr + 36 + sr, sx0 = cx - W * 0.1, sx1 = cx + W * 0.22, sy = YF + D * 0.55;
  a.xcyl(sx0, sx1, sy, sz, sr, 16); a.ell(sx0, sy, sz, 30, sr, sr, 10, 5); a.ell(sx1, sy, sz, 40, sr, sr, 10, 5);
  for (const x of [sx0 + 80, sx1 - 80]) a.box(x - 30, sy - sr * 0.8, zr + 30, x + 30, sy + sr * 0.8, sz - sr * 0.6);
  a.cyl(sx1 - 100, sy, sz + sr * 0.8, sz + sr * 0.8 + 60, sr * 0.28, 10); a.cone(sx1 - 100, sy, sz + sr * 0.8 + 60, sz + sr * 0.8 + 100, sr * 0.45, sr * 0.2, 10);
  a.rect(sx0, sy - sr, sx1, sy + sr, 'EQUIP-DETAIL'); a.circ(sx1 - 100, sy, sr * 0.28, 'EQUIP-DETAIL');
  a.tube([[cx - W * 0.25, YF + D * 0.3, zr + 36], [cx - W * 0.25, YF + D * 0.3, zr + 90], [cx - W * 0.25 + 50, YF + D * 0.3, zr + 110]], [12, 12, 12], 6);
  if (o.chp) {
    const zc = zr + 36 + 60, nf = m.max(2, m.round(W / (60 * IN))), fw = (X1 - 160 - X0 - 120) / nf;
    a.box(X0 + 60, YF + 60, zr + 36, X1 - 160, YB - 60, zr + 36 + 60);
    for (let i = 0; i < nf; i++) { const fx = X0 + 60 + fw * (i + 0.5); a.cyl(fx, YF + D * 0.35, zc, zc + 60, fw * 0.42, 20); for (let k = 0; k < 4; k++) { const th = (k / 4) * TAU + 0.4; a.tube([[fx, YF + D * 0.35, zc + 70], [fx + fw * 0.4 * m.cos(th), YF + D * 0.35 + fw * 0.4 * m.sin(th), zc + 70]], [10, 10], 4); } a.circ(fx, YF + D * 0.35, fw * 0.42, 'EQUIP-DETAIL'); }
    const pr = m.max(3 * IN, W * 0.016); for (const dy of [-1, 1]) flange(a, 'x', YF + D * 0.5 + dy * D * 0.2, zb + eh * 0.45, X1 - 4, -1, pr * 1.8, 30, pr, 8, pr * 1.45, 14, 0, true);
  }
  a.outline(); a.rect(X0 + 14, YF + 60, xe, YB - 18, 'EQUIP-DETAIL');
  for (let i = 1; i < nd; i++) a.line(X0 + 30 + i * dw, YF + 8, X0 + 30 + i * dw, YF + 40, 'EQUIP-DETAIL');
  a.clear('Service access, front', X0, YF - 36 * IN, X1, YF, 80);
  a.log(o.chp ? 'Added the fuel-tank base, sound enclosure with doors and louvres, silencer, roof cooler with fans and the heat-recovery flanges (plan and 3D).' : 'Added the fuel-tank base with lugs, sound-attenuated enclosure with louvred radiator end, doors with handles, control window, emergency stop, roof silencer with rain cap and the terminal box (plan and 3D).');
}

/** horizontal fire-tube boiler on a skid */
function hboiler(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, R = v.dia * IN / 2, cy = YF + D / 2, bh = 8 * IN, zc = Z0 + bh + R + 30;
  const xs0 = X0 + 34 * IN, xs1 = X1 - 22 * IN;
  a.box(X0 + 10 * IN, cy - R * 0.7, Z0, X1 - 4 * IN, cy + R * 0.7, Z0 + 30); a.box(X0 + 20 * IN, cy - R * 0.95, Z0 + 30, X1 - 6 * IN, cy - R * 0.7, Z0 + bh); a.box(X0 + 20 * IN, cy + R * 0.7, Z0 + 30, X1 - 6 * IN, cy + R * 0.95, Z0 + bh);
  for (const f of [0.12, 0.85]) { const x = xs0 + (xs1 - xs0) * f; a.box(x - 120, cy - R * 0.75, Z0 + bh, x + 120, cy + R * 0.75, zc - R * 0.55); }
  a.xcyl(xs0, xs1, cy, zc, R, 28); for (const f of [0.18, 0.4, 0.62, 0.84]) a.xcyl(xs0 + (xs1 - xs0) * f - 14, xs0 + (xs1 - xs0) * f + 14, cy, zc, R + 6, 28);
  a.ell(xs1, cy, zc, R * 0.22, R, R, 16, 8);
  flange(a, 'x', cy, zc, xs0 - 20, -1, R * 1.02, 60, R * 0.62, 20, R * 0.84, 20, 0, false);
  const bx = xs0 - 30 * IN; a.xcyl(bx + 160, xs0 - 80, cy, zc, R * 0.34, 16); a.box(bx, cy - R * 0.42, zc - R * 0.42, bx + 160, cy + R * 0.42, zc + R * 0.42);
  a.box(bx - 4 * IN, cy - R * 0.28, zc + R * 0.42, bx + 14 * IN, cy + R * 0.28, zc + R * 0.42 + 12 * IN); a.cyl(bx + 5 * IN, cy, zc + R * 0.42 + 12 * IN, zc + R * 0.42 + 20 * IN, 5 * IN, 12);
  a.ell(bx + 16 * IN, cy - R * 0.5, zc + R * 0.12, 9 * IN, 8 * IN, 9 * IN, 12, 6);
  a.tube([[bx + 10 * IN, cy - R * 0.42, zc - R * 0.2], [bx + 10 * IN, cy - R * 0.7, zc - R * 0.2], [bx + 10 * IN, cy - R * 0.7, Z0 + bh + 30]], [30, 30, 30], 8);
  a.box(xs1 - 6 * IN, cy - R * 0.5, zc + R * 0.5, xs1 + 6 * IN, cy + R * 0.5, zc + R * 1.02); const sr = R * 0.3;
  a.cyl(xs1 - 1 * IN, cy, zc + R * 0.9, Z1 - 20, sr, 16); a.cyl(xs1 - 1 * IN, cy, Z1 - 44, Z1, sr * 1.12, 16);
  const zz = zc + R + (Z1 - zc - R) * 0.45; a.cyl(xs1 - 1 * IN, cy, zz - 20, zz + 20, sr * 1.18, 16);
  const nz = R * 0.3, zt = zc + R;
  a.cyl(cx + W * 0.04, cy, zt - 10, zt + R * 0.5, nz, 14); flange(a, 'z', cx + W * 0.04, cy, zt + R * 0.5, 1, nz * 1.85, 40, nz * 0.8, 8, nz * 1.4, 14, 0, true);
  for (const dx of [W * 0.16, W * 0.22]) { a.cyl(cx + dx, cy, zt - 10, zt + R * 0.55, nz * 0.45, 10); a.cyl(cx + dx, cy, zt + R * 0.55, zt + R * 0.8, nz * 0.6, 10); a.tube([[cx + dx, cy, zt + R * 0.8], [cx + dx - 6 * IN, cy, zt + R * 0.84], [cx + dx - 6 * IN, cy, zt + R * 0.9]], [10, 10, 10], 5); }
  a.cyl(cx - W * 0.1, cy - R * 0.3, zt - 10, zt + R * 0.35, 40, 8); gauge(a, cx - W * 0.1, cy - R * 0.3 - 20, zt + R * 0.4, 80);
  const lx = cx + W * 0.3; a.cyl(lx, YF + 40, zc - R * 0.35, zc + R * 0.35, 36, 8); a.tube([[lx, YF + 40, zc + R * 0.35], [lx, cy - R * 0.9, zc + R * 0.7]], [18, 18], 6); a.tube([[lx, YF + 40, zc - R * 0.35], [lx, cy - R * 0.97, zc - R * 0.35]], [18, 18], 6);
  a.box(cx - W * 0.28, YF + 10, zc - R * 0.2, cx - W * 0.28 + 14 * IN, YF + 10 + 6 * IN, zc + R * 0.55); a.box(cx - W * 0.28 + 20, YF + 4, zc + R * 0.1, cx - W * 0.28 + 14 * IN - 20, YF + 14, zc + R * 0.4);
  for (const f of [0.3, 0.5, 0.72]) a.ycyl(cy - R - 12, cy - R + 20, xs0 + (xs1 - xs0) * f, zc - R * 0.3, 70, 12);
  a.outline(); a.rect(xs0, cy - R, xs1, cy + R, 'EQUIP-DETAIL'); a.circ(xs1 - 1 * IN, cy, sr, 'EQUIP-DETAIL'); a.rect(bx, cy - R * 0.42, bx + 160, cy + R * 0.42, 'EQUIP-DETAIL');
  a.log('Added the skid and saddles, lagged shell, front door and burner with blower and gas train, rear smokebox with stack, steam nozzle, relief valves, gauge and level column (plan and 3D).');
}
/** a vertical boiler: cylinder, burner on the front, stack and trim */
function vboiler(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.dia * IN / 2, pad = 4 * IN;
  a.box(cx - R - pad, cy - R - pad, Z0, cx + R + pad, cy + R + pad, Z0 + 5 * IN);
  a.cyl(cx, cy, Z0 + 5 * IN, Z0 + H * 0.62, R, 28); a.ell(cx, cy, Z0 + H * 0.62, R, R, R * 0.28, 24, 6); a.cyl(cx, cy, Z0 + 5 * IN, Z0 + 18 * IN, R * 1.05, 28);
  for (const f of [0.22, 0.4, 0.55]) a.cyl(cx, cy, Z0 + H * f - 10, Z0 + H * f + 10, R + 6, 28);
  const sr = R * 0.2; a.cyl(cx, cy, Z0 + H * 0.62, Z1 - 20, sr, 14); a.cyl(cx, cy, Z1 - 40, Z1, sr * 1.12, 14);
  const bz = Z0 + H * 0.28; a.box(cx - R * 0.45, cy - R - 10 * IN, bz - R * 0.25, cx + R * 0.45, cy - R + 20, bz + R * 0.25); a.ell(cx + R * 0.62, cy - R - 8 * IN, bz, 7 * IN, 7 * IN, 7 * IN, 12, 6);
  a.box(cx - R * 0.35, cy - R - 12 * IN + 40, bz + R * 0.25, cx + R * 0.35, cy - R - 2 * IN, bz + R * 0.25 + 8 * IN);
  for (let k = 0; k < 3; k++) { const th = m.PI * (0.62 + 0.24 * k); a.ycyl(cy - R - 8, cy - R + 30, cx + R * m.cos(th) * 0.55, Z0 + H * 0.5 - 30, 50, 12); }
  const zt = Z0 + H * 0.62 + R * 0.28 * 0.9; a.cyl(cx - R * 0.35, cy, zt - 10, zt + 14 * IN, 2.5 * IN, 12); flange(a, 'z', cx - R * 0.35, cy, zt + 14 * IN, 1, 5 * IN, 30, 2.5 * IN, 4, 4 * IN, 12, 0, true);
  a.cyl(cx + R * 0.35, cy, zt - 10, zt + 10 * IN, 1.2 * IN, 10); a.cyl(cx + R * 0.35, cy, zt + 10 * IN, zt + 15 * IN, 2 * IN, 10);
  gauge(a, cx, cy - R + 10, Z0 + H * 0.5, 90); a.cyl(cx - R * 0.8, cy - R * 0.6, Z0 + H * 0.38, Z0 + H * 0.58, 30, 8);
  a.circ(cx, cy, R); a.circ(cx, cy, sr, 'EQUIP-DETAIL'); a.rect(cx - R * 0.45, cy - R - 10 * IN, cx + R * 0.45, cy - R, 'EQUIP-DETAIL'); a.rect(cx - R - pad, cy - R - pad, cx + R + pad, cy + R + pad, 'EQUIP-HIDDEN');
  a.log('Added the base, lagged vertical shell with dished top, front burner box with blower, stack, steam nozzle and relief valve, gauge and handholes (plan and 3D).');
}
/** a horizontal steam drum on two saddles */
function drum(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.dia * IN / 2, hd = R * 0.4, zc = Z0 + H - R - 12 * IN;
  const zb = zc - R, x0 = X0 + hd + 40, x1 = X1 - hd - 40;
  for (const [f, sl] of [[0.15, 0], [0.82, 1]]) { const x = x0 + (x1 - x0) * f; a.box(x - 5 * IN, cy - R * 0.85, Z0, x + 5 * IN, cy + R * 0.85, Z0 + 20); a.prism([[x - 4 * IN, cy - R * 0.75], [x + 4 * IN, cy - R * 0.75], [x + 4 * IN, cy + R * 0.75], [x - 4 * IN, cy + R * 0.75]], Z0 + 20, zb + R * 0.1); if (sl) a.box(x - 6 * IN, cy - R * 0.9, Z0 + 20, x + 6 * IN, cy + R * 0.9, Z0 + 34); }
  a.xcyl(x0, x1, cy, zc, R, 30); a.ell(x0, cy, zc, hd, R, R, 16, 8); a.ell(x1, cy, zc, hd, R, R, 16, 8);
  for (const f of [0.3, 0.5, 0.7]) a.xcyl(x0 + (x1 - x0) * f - 12, x0 + (x1 - x0) * f + 12, cy, zc, R + 6, 30);
  flange(a, 'x', cy, zc, X0 + 10, 1, R * 0.38, 40, R * 0.28, 12, R * 0.34, 14, 0, false); a.box(X0, cy - 30, zc + R * 0.18, X0 + 60, cy + 30, zc + R * 0.38);
  const nr = R * 0.12;
  for (const f of [0.3, 0.5, 0.7]) { const x = x0 + (x1 - x0) * f; a.cyl(x, cy, zc + R - 20, zc + R + 6 * IN, nr, 12); flange(a, 'z', x, cy, zc + R + 6 * IN, 1, nr * 1.9, 30, nr * 0.8, 8, nr * 1.45, 12, 0, true); }
  for (const f of [0.38, 0.62]) { const x = x0 + (x1 - x0) * f; a.cyl(x, cy, zc + R - 20, zc + R + 5 * IN, nr * 0.7, 10); a.cyl(x, cy, zc + R + 5 * IN, zc + R + 11 * IN, nr * 0.9, 10); }
  for (const f of [0.25, 0.75]) { const x = x0 + (x1 - x0) * f; a.cyl(x, cy, zb - 5 * IN, zb + 20, nr * 0.9, 12); }
  const lx = x0 + (x1 - x0) * 0.9; a.cyl(lx, YF + 30, zc - R * 0.5, zc + R * 0.5, 30, 8); a.tube([[lx, YF + 30, zc + R * 0.5], [lx, cy - R * 0.85, zc + R * 0.6]], [14, 14], 6); gauge(a, x0 + (x1 - x0) * 0.05 + R * 0.4, cy - R + 14, zc + R * 0.35, 70);
  a.outline(); a.rect(x0, cy - R, x1, cy + R, 'EQUIP-DETAIL'); for (const f of [0.15, 0.82]) { const x = x0 + (x1 - x0) * f; a.rect(x - 5 * IN, cy - R * 0.85, x + 5 * IN, cy + R * 0.85, 'EQUIP-HIDDEN'); }
  a.log('Added the two saddles (one sliding), dished heads with the manway, top nozzles with flanges, relief valves, downcomer stubs and the level gauge column (plan and 3D).');
}
/** oil-filled power transformer with conservator, bushings and radiators */
function ptx(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, rw = m.min(W * 0.22, 60 * IN);
  const tx0 = X0 + 6 * IN, tx1 = X1 - rw - 3 * IN, th = H * 0.5, bh = 12 * IN;
  for (const sx of [tx0 + 14 * IN, tx1 - 14 * IN]) for (const sy of [-1, 1]) whl(a, sx, cy + sy * (D * 0.3), 6 * IN, 3 * IN, Z0 + 6 * IN);
  a.box(tx0, YF + D * 0.1, Z0 + 10 * IN, tx1, YB - D * 0.1, Z0 + bh);
  a.box(tx0, YF + D * 0.1 + 2 * IN, Z0 + bh, tx1, YB - D * 0.1 - 2 * IN, Z0 + bh + th);
  a.box(tx0 - 2 * IN, YF + D * 0.1, Z0 + bh + th, tx1 + 2 * IN, YB - D * 0.1, Z0 + bh + th + 3 * IN);
  for (let i = 1; i < 6; i++) a.box(tx0 + (tx1 - tx0) * i / 6 - 3, YF + D * 0.1, Z0 + bh + 6, tx0 + (tx1 - tx0) * i / 6 + 3, YF + D * 0.1 + 4, Z0 + bh + th);
  a.box(tx0 + 14 * IN, YF + D * 0.1 - 10 * IN, Z0 + bh + th * 0.25, tx0 + 40 * IN, YF + D * 0.1, Z0 + bh + th * 0.8); a.box(tx0 + 16 * IN, YF + D * 0.1 - 10.8 * IN, Z0 + bh + th * 0.3, tx0 + 38 * IN, YF + D * 0.1 - 10 * IN, Z0 + bh + th * 0.75);
  const zt = Z0 + bh + th + 3 * IN, bhv = (H - (zt - Z0)) * 0.78, hvy = YB - D * 0.3, lvy = YF + D * 0.33;
  for (let i = 0; i < 3; i++) { bushing(a, tx0 + (tx1 - tx0) * (0.2 + i * 0.12), hvy, zt, bhv, 2.2 * IN + W / 600, 10); bushing(a, tx0 + (tx1 - tx0) * (0.58 + i * 0.1), lvy, zt, bhv * 0.55, 1.8 * IN + W / 700, 6); }
  bushing(a, tx0 + (tx1 - tx0) * 0.92, cy, zt, bhv * 0.4, 1.2 * IN, 4);
  const cr = m.max(7 * IN, th * 0.13), cz = zt + (H - (zt - Z0)) * 0.22 + cr;
  a.xcyl(tx0 + (tx1 - tx0) * 0.25, tx1 - (tx1 - tx0) * 0.08, cy, cz, cr, 18); a.ell(tx0 + (tx1 - tx0) * 0.25, cy, cz, 4 * IN, cr, cr, 10, 5); a.ell(tx1 - (tx1 - tx0) * 0.08, cy, cz, 4 * IN, cr, cr, 10, 5);
  for (const f of [0.3, 0.8]) a.box(tx0 + (tx1 - tx0) * f - 3 * IN, cy - cr * 0.5, zt, tx0 + (tx1 - tx0) * f + 3 * IN, cy + cr * 0.5, cz - cr * 0.7);
  a.ycyl(cy - cr - 20, cy - cr, tx0 + (tx1 - tx0) * 0.4, cz, cr * 0.5, 14); a.tube([[tx0 + (tx1 - tx0) * 0.5, cy, cz - cr], [tx0 + (tx1 - tx0) * 0.5, cy, zt + 4 * IN], [tx0 + (tx1 - tx0) * 0.55, cy, zt]], [2.5 * IN, 3 * IN, 3 * IN], 10);
  const nfin = m.round(rw / (3.5 * IN)), rz0 = Z0 + bh + 2 * IN, rz1 = Z0 + bh + th - 2 * IN;
  for (let i = 0; i < nfin; i++) { const x = tx1 + 3 * IN + i * ((rw - 3.2 * IN) / nfin); a.box(x, cy - 14 * IN, rz0, x + 1.3 * IN, cy + 14 * IN, rz1); }
  a.xcyl(tx1, X1 - 2 * IN, cy - 8 * IN, rz1 + 1 * IN, 2.5 * IN, 10); a.xcyl(tx1, X1 - 2 * IN, cy - 8 * IN, rz0 + 1 * IN, 2.5 * IN, 10);
  a.outline(); a.rect(tx0, YF + D * 0.1, tx1, YB - D * 0.1, 'EQUIP-DETAIL'); a.rect(tx1 + 3 * IN, cy - 14 * IN, X1 - 2 * IN, cy + 14 * IN, 'EQUIP-DETAIL');
  for (let i = 0; i < 3; i++) { a.circ(tx0 + (tx1 - tx0) * (0.2 + i * 0.12), hvy, 4 * IN, 'EQUIP-DETAIL'); a.circ(tx0 + (tx1 - tx0) * (0.58 + i * 0.1), lvy, 3 * IN, 'EQUIP-DETAIL'); }
  a.log('Added the wheeled base, ribbed tank and cover, three tall high-voltage and three short low-voltage bushings, conservator with sight gauge, control cabinet and the radiator bank (plan and 3D).');
}
/** a steam turbine and generator set on a base frame */
function steamset(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bh = 14 * IN;
  a.box(X0, YF, Z0, X1, YB, Z0 + bh); for (let i = 0; i < 6; i++) a.box(X0 + 6 * IN + i * (W - 12 * IN) / 5 - 2 * IN, YF + 6 * IN, Z0 + bh, X0 + 6 * IN + i * (W - 12 * IN) / 5 + 2 * IN, YB - 6 * IN, Z0 + bh + 4 * IN);
  const zc = Z0 + bh + H * 0.27, tr = H * 0.17;
  a.tube([[X0 + W * 0.06, cy, zc], [X0 + W * 0.14, cy, zc], [X0 + W * 0.3, cy, zc], [X0 + W * 0.38, cy, zc]], [tr * 0.55, tr * 0.9, tr, tr * 0.7], 24);
  a.box(X0 + W * 0.38, cy - tr * 1.2, zc - tr * 1.1, X0 + W * 0.5, cy + tr * 1.2, zc + tr * 1.1);
  a.xcyl(X0 + W * 0.5, X0 + W * 0.56, cy, zc, tr * 0.3, 12);
  a.xcyl(X0 + W * 0.56, X1 - W * 0.04, cy, zc, tr * 1.05, 28); a.ell(X1 - W * 0.04, cy, zc, W * 0.025, tr * 1.05, tr * 1.05, 14, 6); a.box(X1 - W * 0.12, cy - tr * 0.6, zc + tr * 1.05, X1 - W * 0.04, cy + tr * 0.6, zc + tr * 1.05 + 10 * IN);
  for (let i = 0; i < 7; i++) a.xcyl(X0 + W * 0.58 + i * W * 0.05 - 10, X0 + W * 0.58 + i * W * 0.05 + 10, cy, zc, tr * 1.1, 28);
  for (const sx of [X0 + W * 0.1, X0 + W * 0.3, X0 + W * 0.62, X1 - W * 0.12]) a.box(sx - 5 * IN, cy - tr * 0.8, Z0 + bh, sx + 5 * IN, cy + tr * 0.8, zc - tr * 0.6);
  const ir = 4 * IN + W / 200, ix = X0 + W * 0.22;
  a.cyl(ix, cy, zc + tr * 0.6, Z1 - 10 * IN, ir, 16); flange(a, 'z', ix, cy, Z1 - 10 * IN, 1, ir * 1.9, 40, ir * 0.7, 12, ir * 1.45, 16, 0, true);
  a.box(ix - ir * 1.6, cy - ir * 1.6, zc + tr + 3 * IN, ix + ir * 1.6, cy + ir * 1.6, zc + tr + 3 * IN + ir * 3); a.cyl(ix, cy, zc + tr + 3 * IN + ir * 3, zc + tr + 3 * IN + ir * 5, ir * 0.3, 8); handwheel(a, ix, cy, zc + tr + 3 * IN + ir * 5, ir * 1.1, 10, 4);
  flange(a, 'x', cy + D * 0.2, zc - tr * 0.3, X0 + W * 0.05, -1, ir * 2.2, 40, ir * 1.1, 12, ir * 1.7, 16, 0, true); a.xcyl(X0 + W * 0.05, X0 + W * 0.1, cy + D * 0.2, zc - tr * 0.3, ir * 1.1, 14);
  a.box(X1 - W * 0.3, YF + 4 * IN, Z0 + bh, X1 - W * 0.14, YF + 30 * IN, Z0 + bh + H * 0.28); a.box(X1 - W * 0.3 + 10, YF + 3 * IN, Z0 + bh + 10 * IN, X1 - W * 0.14 - 10, YF + 4 * IN, Z0 + bh + H * 0.2);
  a.outline(); a.rect(X0 + W * 0.06, cy - tr, X0 + W * 0.38, cy + tr, 'EQUIP-DETAIL'); a.rect(X0 + W * 0.56, cy - tr * 1.05, X1 - W * 0.04, cy + tr * 1.05, 'EQUIP-DETAIL'); a.rect(X0 + W * 0.38, cy - tr * 1.2, X0 + W * 0.5, cy + tr * 1.2, 'EQUIP-DETAIL'); a.circ(ix, cy, ir, 'EQUIP-DETAIL');
  a.log('Added the base frame, turbine casing with steam inlet, stop valve and exhaust flange, reduction gearbox, cooled generator with terminal box and the lube-oil console (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ renewable
/** a tilted PV module: frame prism plus a raised cell area. (s, n) are measured along the slope and normal from the low edge; tilt in radians */
function pvModule(a, x0, x1, ylow, zlow, s0, s1, tilt, th = 38) {
  const c = m.cos(tilt), s = m.sin(tilt), P = (sp, nn) => [ylow + sp * c - nn * s, zlow + sp * s + nn * c];
  prismX(a, [P(s0, 0), P(s1, 0), P(s1, -th), P(s0, -th)], x0, x1);
  const i = 36; if (x1 - x0 > 3 * i && s1 - s0 > 3 * i) prismX(a, [P(s0 + i, 0), P(s1 - i, 0), P(s1 - i, 8), P(s0 + i, 8)], x0 + i, x1 - i);
}
function solarRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, tilt = 25 * m.PI / 180, ml = 78 * IN, g = 20, nx = v.nx, nr = v.nr, slope = nr * (ml + g), clr = 30 * IN, c = m.cos(tilt), sn = m.sin(tilt);
  const pad = 6 * IN, x0 = X0 + pad, mod = (W - 2 * pad) / nx, ylow = YF + (D - slope * c) / 2, zl = Z0 + clr;
  for (let r = 0; r < nr; r++) for (let i = 0; i < nx; i++) pvModule(a, x0 + i * mod + g / 2, x0 + (i + 1) * mod - g / 2, ylow, zl, r * (ml + g), r * (ml + g) + ml, tilt);
  const Pt = (s, n) => [ylow + s * c - n * sn, zl + s * sn + n * c], nb = m.max(2, m.ceil(nx / 3) + 1), bay = (W - 2 * pad - 20 * IN) / (nb - 1), sf = 14 * IN, sr = slope - 14 * IN, nu = -80;
  for (let k = 0; k < nb; k++) {
    const x = X0 + pad + 10 * IN + k * bay, pf = Pt(sf, nu), pr = Pt(sr, nu);
    a.tube([[x, pf[0], Z0], [x, pf[0], pf[1]]], [38, 38], 8); a.tube([[x, pr[0], Z0], [x, pr[0], pr[1]]], [38, 38], 8);
    a.tube([[x, pf[0], pf[1]], [x, pr[0], pr[1]]], [26, 26], 6);
    a.tube([[x, pf[0] + (pr[0] - pf[0]) * 0.15, Z0 + 150], [x, pr[0] - 60, pr[1] - (pr[1] - Z0) * 0.55]], [14, 14], 5);
    a.box(x - 120, pf[0] - 120, Z0, x + 120, pf[0] + 120, Z0 + 16); a.box(x - 120, pr[0] - 120, Z0, x + 120, pr[0] + 120, Z0 + 16);
  }
  const pm = Pt(slope / 2, nu - 60); a.tube([[X0 + pad, pm[0], pm[1]], [X1 - pad, pm[0], pm[1]]], [34, 34], 8);
  a.outline('EQUIP-HIDDEN'); const y1 = ylow + slope * c; a.rect(x0, ylow, X1 - pad, y1);
  for (let i = 1; i < nx; i++) a.line(x0 + i * mod, ylow, x0 + i * mod, y1, 'EQUIP-DETAIL'); for (let r = 1; r < nr; r++) a.line(x0, ylow + r * (ml + g) * c, X1 - pad, ylow + r * (ml + g) * c, 'EQUIP-DETAIL');
  a.log(`Added ${nr * nx} framed modules in ${nr} rows tilted to the front with cell areas, the driven piles with base plates, rafters, braces and torque tube (plan and 3D).`);
}
function solarCarport(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, nb = v.bays, bayw = (W - 40 * IN) / nb, tilt = 7 * m.PI / 180, c = m.cos(tilt), sn = m.sin(tilt);
  const zlow = Z0 + 9.5 * 12 * IN, slope = (D - 4 * IN) / c, pad = 20 * IN, ylow = YF + 2 * IN, cy0 = YB - 12 * IN;
  const colx = []; for (let i = 0; i <= nb; i += v.span) colx.push(X0 + pad + i * bayw); if (colx[colx.length - 1] < X0 + pad + nb * bayw - 1) colx.push(X0 + pad + nb * bayw);
  const zcol = zlow + (cy0 - ylow) * m.tan(tilt) - 160;
  for (const x of colx) {
    a.box(x - 8 * IN, cy0 - 8 * IN, Z0, x + 8 * IN, cy0 + 8 * IN, Z0 + 3 * IN); a.cyl(x, cy0, Z0 + 3 * IN, zcol, 4.5 * IN, 12);
    a.tube([[x, cy0, zcol], [x, ylow, zlow - 120]], [3 * IN, 3 * IN], 8);
    a.tube([[x, ylow + 20, zlow - 140], [x, ylow + slope * c, zlow - 140 + slope * sn]], [3.5 * IN, 3.5 * IN], 10);
  }
  for (let i = 0; i < nb; i++) { const x0 = X0 + pad + i * bayw + 40, x1 = X0 + pad + (i + 1) * bayw - 40; pvModule(a, x0, x1, ylow, zlow, 0, slope * 0.5 - 10, tilt, 42); pvModule(a, x0, x1, ylow, zlow, slope * 0.5 + 10, slope * 0.99, tilt, 42); }
  for (let i = 0; i <= nb; i++) { const x = X0 + pad + i * bayw; a.box(x - 20, ylow + 40, zlow - 120, x + 20, ylow + slope * c - 40, zlow - 100 + slope * sn); }
  for (let i = 0; i < nb; i++) { const x = X0 + pad + (i + 0.5) * bayw; a.box(x - 15 * IN, cy - 3 * IN, zlow + 0.55 * (cy - ylow) * m.tan(tilt) - 200, x + 15 * IN, cy + 3 * IN, zlow + 0.55 * (cy - ylow) * m.tan(tilt) - 150); a.box(x - 24 * IN, YF + 16 * IN, Z0, x + 24 * IN, YF + 22 * IN, Z0 + 5 * IN); a.rect(x - 24 * IN, YF + 16 * IN, x + 24 * IN, YF + 22 * IN, 'EQUIP-DETAIL'); }
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + pad, ylow, X0 + pad + nb * bayw, YB - 2 * IN); for (let i = 1; i < nb; i++) a.line(X0 + pad + i * bayw, ylow, X0 + pad + i * bayw, YB - 2 * IN, 'EQUIP-DETAIL'); for (const x of colx) a.circ(x, cy0, 5 * IN, 'EQUIP');
  a.log(`Added the steel columns with base plates, raking rafters and purlins carrying two rows of modules per space on a monopitch roof, bay lights and wheel stops (plan and 3D).`);
}
function windTurbine(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, r = v.dia * 12 * IN / 2, hub = v.hub * 12 * IN, nl = r * 0.11 + 30 * IN, sp = r * 0.12, bd = hub * 0.045, ty = YF + sp + nl * 0.65, zh = Z0 + hub;
  const secs = 6, rad = (f) => (bd / 2) * (1 - 0.6 * f), tp = [], tr = []; for (let k = 0; k <= secs; k++) { const f = k / secs; tp.push([cx, ty, Z0 + hub * f]); tr.push(rad(f)); }
  a.tube(tp, tr, 20); for (let k = 1; k < secs; k++) { const f = k / secs; a.cyl(cx, ty, Z0 + hub * f - 10, Z0 + hub * f + 10, rad(f) * 1.1, 20); }
  a.cyl(cx, ty, Z0, Z0 + 12, bd / 2 * 1.35, 24); a.box(cx - bd * 0.18, ty - bd / 2 - 3, Z0 + 12, cx + bd * 0.18, ty - bd / 2 + 6, Z0 + 12 + bd * 0.7);
  const nh = nl * 0.52, nw = nl * 0.46; a.cyl(cx, ty, zh - 14, zh, rad(1) * 1.15, 20);
  a.box(cx - nw / 2, YF + sp, zh, cx + nw / 2, YF + sp + nl, zh + nh); prismX(a, [[YF + sp, zh + nh], [YF + sp + nl, zh + nh], [YF + sp + nl - nl * 0.1, zh + nh + nh * 0.14], [YF + sp + nl * 0.15, zh + nh + nh * 0.14]], cx - nw / 2, cx + nw / 2);
  const hz = zh + nh * 0.55; a.ycyl(YF + sp * 0.55, YF + sp, cx, hz, nw * 0.5, 16); a.ell(cx, YF + sp * 0.55, hz, nw * 0.5, sp * 0.8, nw * 0.5, 16, 8);
  for (const sx of [-1, 1]) a.box(cx + sx * nw / 2 - 2, YF + sp + nl * 0.45, zh + nh * 0.3, cx + sx * nw / 2 + sx * 2, YF + sp + nl * 0.8, zh + nh * 0.75);
  const mh = m.min(36 * IN, r * 0.05) + 30; a.tube([[cx + nw * 0.3, YF + sp + nl * 0.8, zh + nh * 1.14], [cx + nw * 0.3, YF + sp + nl * 0.8, zh + nh * 1.14 + mh]], [8, 8], 5); a.box(cx - nw * 0.2, YF + sp + nl * 0.4, zh + nh * 1.14, cx + nw * 0.2, YF + sp + nl * 0.6, zh + nh * 1.14 + 30);
  if (v.tail) { a.box(cx - 10, YF + sp + nl, hz - nw * 0.1, cx + 10, YB - 2, hz + nw * 0.55); a.rect(cx - 10, YF + sp + nl, cx + 10, YB - 2, 'EQUIP-DETAIL'); }
  const L = r - sp * 0.4, cr = r * 0.07, cm = r * 0.09, ct = r * 0.02, by0 = YF + sp * 0.2, thk = cm * 0.12;
  for (let i = 0; i < 3; i++) {
    const ph = (i / 3) * TAU + 0.35, c = m.cos(ph), s = m.sin(ph), ro = [[0.08 * L, -cr / 2], [0.22 * L, -cm * 0.42], [L, -ct * 0.4], [L, ct * 0.6], [0.22 * L, cm * 0.58], [0.08 * L, cr / 2]];
    prismY(a, ro.map(([sp2, cc]) => [cx + sp2 * s + cc * c, hz + sp2 * c - cc * s]), by0, by0 + thk);
  }
  a.outline('EQUIP-HIDDEN'); a.circ(cx, ty, bd / 2); a.rect(cx - nw / 2, YF + sp, cx + nw / 2, YF + sp + nl, 'EQUIP'); a.ellp(cx, YF + sp * 0.7, nw / 2, sp * 0.4, 'EQUIP-DETAIL'); a.line(cx - r, by0 + thk / 2, cx + r, by0 + thk / 2, 'EQUIP-DETAIL');
  a.log('Added the tapered tower in flanged sections with a base door, yaw ring, nacelle with vents and anemometer, hub spinner and three tapered blades (plan and 3D).');
}
function vawt(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, rr = W * 0.42, bz0 = Z0 + H * 0.2, bz1 = Z1 - H * 0.04;
  a.box(cx - 10 * IN, cy - 10 * IN, Z0, cx + 10 * IN, cy + 10 * IN, Z0 + H * 0.12); a.cyl(cx, cy, Z0 + H * 0.12, bz1, 2.4 * IN, 12);
  for (let i = 0; i < 3; i++) {
    const ph = (i / 3) * TAU + 0.3, bx = cx + rr * m.cos(ph), by = cy + rr * m.sin(ph), cd = rr * 0.17, tn = ph + m.PI / 2;
    const q = (u, w) => [bx + u * m.cos(tn) + w * m.cos(ph), by + u * m.sin(tn) + w * m.sin(ph)];
    a.prism([[0.0, -0.5], [0.45, -0.28], [0.45, 0.28], [0.0, 0.5], [-0.5, 0.0]].map(([u, w]) => q(u * cd, w * cd * 0.35)), bz0, bz1);
    for (const zz of [bz0 + (bz1 - bz0) * 0.15, bz1 - (bz1 - bz0) * 0.15]) a.tube([[cx, cy, zz], [bx, by, zz]], [10, 10], 5);
  }
  a.cyl(cx, cy, bz0 - 8, bz0 + 8, 22, 10); a.circ(cx, cy, rr, 'EQUIP-HIDDEN'); a.circ(cx, cy, 10 * IN); a.circ(cx, cy, 5, 'EQUIP-DETAIL');
  a.log('Added the base cabinet, mast, three vertical aerofoil blades each held by two struts and the lower hub (plan and 3D).');
}
/** a corrugated shipping-container-size battery enclosure; the cooling units stand 10 in proud of the front wall */
function battContainer(a, v) {
  const { X0, X1, YB, Z0, Z1, cx, cy, W, D, H } = a, YF = a.YF + 10 * IN;
  a.box(X0, YF, Z0, X1, YB, Z0 + 5 * IN); a.box(X0 + 1 * IN, YF + 1 * IN, Z0 + 5 * IN, X1 - 1 * IN, YB - 1 * IN, Z1 - 3 * IN);
  for (let x = X0 + 4 * IN; x < X1 - 6 * IN; x += 6 * IN) a.box(x, YF - 0.6 * IN, Z0 + 7 * IN, x + 3 * IN, YF + 1 * IN, Z1 - 5 * IN);
  a.box(X0, YF, Z1 - 3 * IN, X1, YB, Z1);
  for (const x of [X0, X1 - 7 * IN]) for (const y of [YF, YB - 7 * IN]) { a.box(x, y, Z0, x + 7 * IN, y + 7 * IN, Z0 + 5 * IN); a.box(x, y, Z1 - 5 * IN, x + 7 * IN, y + 7 * IN, Z1); }
  const nh = v.hvac, hw = 32 * IN, hz0 = Z1 - 36 * IN, sx0 = X0 + 14 * IN, sp = (W - 28 * IN - hw) / m.max(1, nh - 1);
  for (let i = 0; i < nh; i++) {
    const x = nh === 1 ? cx - hw / 2 : sx0 + i * sp, fx = x + hw * 0.5, fz = hz0 + 15 * IN;
    a.box(x, a.YF + 1 * IN, hz0, x + hw, YF, Z1 - 6 * IN); a.ycyl(a.YF + 0.2 * IN, a.YF + 1 * IN, fx, fz, 11 * IN, 20);
    for (let k = -3; k <= 3; k++) a.box(fx - 10.5 * IN, a.YF, fz + k * 3 * IN - 4, fx + 10.5 * IN, a.YF + 0.5 * IN, fz + k * 3 * IN + 4);
    a.rect(x, a.YF, x + hw, YF, 'EQUIP-DETAIL');
  }
  const dx = nh === 1 ? X1 - 42 * IN : cx - 17 * IN; a.frame(dx, Z0 + 8 * IN, dx + 34 * IN, Z0 + 86 * IN, YF - 3 * IN, YF + 2 * IN, 3 * IN); a.box(dx + 28 * IN, YF - 5 * IN, Z0 + 46 * IN, dx + 31 * IN, YF - 3 * IN, Z0 + 52 * IN);
  for (let z = Z0 + 14 * IN; z < Z0 + 44 * IN; z += 3 * IN) a.box(X0 + 6 * IN, YF - 0.9 * IN, z, X0 + 20 * IN, YF - 0.5 * IN, z + 1.2 * IN);
  a.cyl(dx - 8 * IN, YF - 2 * IN, Z0 + 52 * IN, Z0 + 53 * IN, 2 * IN, 8); a.ell(dx + 17 * IN, YF - 3 * IN, Z0 + 89 * IN, 3 * IN, 2 * IN, 2 * IN, 8, 4);
  a.rect(X0, YF, X1, YB); a.rect(X0 + 1 * IN, YF, X1 - 1 * IN, YB, 'EQUIP-DETAIL'); a.line(X1 - 3 * IN, YF, X1 - 3 * IN, YB, 'EQUIP-DETAIL');
  a.log(`Added the corner castings, corrugated walls, ${nh} wall-mounted cooling unit${nh > 1 ? 's' : ''} with fan grilles, a personnel door with handle, end louvres and a lamp (plan and 3D).`);
}
function homeBattery(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, n = v.mods;
  a.box(X0, YF + 1 * IN, Z0, X1, YB, Z1);
  for (let i = 0; i < n; i++) { const z0 = Z0 + 2 * IN + i * (H - 4 * IN) / n, z1 = z0 + (H - 4 * IN) / n - 3; a.box(X0 + 1 * IN, YF + 0.3 * IN, z0, X1 - 1 * IN, YF + 1 * IN, z1); a.box(cx - 5 * IN, YF, z0 + (z1 - z0) * 0.5, cx + 5 * IN, YF + 0.3 * IN, z0 + (z1 - z0) * 0.5 + 8); }
  a.box(cx - 3 * IN, YF, Z1 - 10 * IN, cx + 3 * IN, YF + 1 * IN, Z1 - 6 * IN); a.box(X0 + 2 * IN, YF, Z1 - 7 * IN, X0 + 4 * IN, YF + 0.3 * IN, Z1 - 3 * IN);
  if (v.floor) { a.box(X0 + 2 * IN, YF + 1 * IN, Z0, X0 + 5 * IN, YB - 1 * IN, Z0 + 0.01); } 
  for (let i = 0; i < 3; i++) a.cyl(cx - 4 * IN + i * 4 * IN, YB - 2.5 * IN, Z0 - 0.0, Z0 + 4 * IN, 0.4 * IN, 6);
  a.outline(); a.rect(X0 + 1 * IN, YF, X1 - 1 * IN, YF + 1 * IN, 'EQUIP-DETAIL');
  a.log(`Added the cabinet with ${n} stacked module fronts, handles, a status display and indicator, side lamp and cable entries at the base (plan and 3D).`);
}
function stringInverter(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.box(X0, YF + 3 * IN, Z0 + 3 * IN, X1, YB, Z1); a.box(X0 + 1 * IN, YF + 1 * IN, Z0 + 4 * IN, X1 - 1 * IN, YF + 3 * IN, Z1 - 1 * IN);
  for (let i = 0; i < m.round(W / (1.3 * IN)); i++) { const x = X0 + 0.5 * IN + i * 1.3 * IN; if (x < X1 - 1.6 * IN) a.box(x, YF + 3 * IN, Z0 + 3 * IN, x + 0.5 * IN, YB, Z1 - 1); }
  a.box(cx - 4 * IN, YF, Z1 - 8 * IN, cx + 4 * IN, YF + 1 * IN, Z1 - 4 * IN); for (let i = 0; i < 4; i++) a.cyl(X0 + 3 * IN + i * 1.4 * IN, YF + 0.5 * IN, Z1 - 12 * IN, Z1 - 11 * IN, 0.4 * IN, 6);
  a.ycyl(YF + 3 * IN, YF + 5 * IN, X1 - 3 * IN, Z0 + H * 0.45, 2 * IN, 14);
  for (let i = 0; i < 4; i++) { const x = X0 + 3 * IN + i * (W - 6 * IN) / 3; a.cyl(x, YF + 6 * IN, Z0, Z0 + 3 * IN, 0.7 * IN, 8); a.cyl(x, YF + 6 * IN, Z0, Z0 + 1.2 * IN, 1 * IN, 8); }
  a.outline(); for (let i = 0; i < 4; i++) a.circ(X0 + 3 * IN + i * (W - 6 * IN) / 3, YF + 6 * IN, 0.8 * IN, 'EQUIP-DETAIL');
  a.log('Added the cooling-fin body, front cover with display, indicator lights and the rotary DC disconnect, and four conduit entries underneath (plan and 3D).');
}
function evHub(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.bays, bw = (W - 20 * IN) / n, zr = Z0 + 14 * 12 * IN;
  const cols = [X0 + 14 * IN, X1 - 14 * IN]; for (let i = 2; i < n; i += 2) cols.splice(1, 0, X0 + 10 * IN + i * bw);
  for (const x of cols) { a.box(x - 8 * IN, YB - 22 * IN, Z0, x + 8 * IN, YB - 6 * IN, Z0 + 4 * IN); a.box(x - 5 * IN, YB - 19 * IN, Z0 + 4 * IN, x + 5 * IN, YB - 9 * IN, zr); a.circ(x, YB - 14 * IN, 5 * IN, 'EQUIP'); }
  a.box(X0, YB - 24 * IN, zr, X1, YB - 4 * IN, zr + 18 * IN); prismX(a, [[YB - 24 * IN, zr + 18 * IN], [YB - 4 * IN, zr + 18 * IN], [YB - 4 * IN, zr + 22 * IN], [YB - 24 * IN, zr + 22 * IN]], X0, X1);
  prismX(a, [[YF + 4 * IN, zr + 6 * IN], [YB - 24 * IN, zr + 14 * IN], [YB - 24 * IN, zr + 18 * IN], [YF + 4 * IN, zr + 10 * IN]], X0, X1);
  for (let i = 0; i < n; i++) {
    const x = X0 + 10 * IN + (i + 0.5) * bw;
    a.box(x - 8 * IN, YB - 36 * IN, Z0, x + 8 * IN, YB - 26 * IN, Z0 + 3 * IN); a.box(x - 7 * IN, YB - 35 * IN, Z0 + 3 * IN, x + 7 * IN, YB - 27 * IN, Z0 + 66 * IN);
    a.box(x - 5 * IN, YB - 36 * IN, Z0 + 42 * IN, x + 5 * IN, YB - 35 * IN, Z0 + 56 * IN); a.box(x + 7 * IN, YB - 35 * IN, Z0 + 30 * IN, x + 10 * IN, YB - 28 * IN, Z0 + 44 * IN);
    a.tube([[x + 8 * IN, YB - 32 * IN, Z0 + 38 * IN], [x + 13 * IN, YB - 32 * IN, Z0 + 22 * IN], [x + 4 * IN, YB - 33 * IN, Z0 + 14 * IN]], [0.9 * IN, 0.9 * IN, 0.9 * IN], 6);
    a.box(x - 24 * IN, YF + 6 * IN, Z0, x + 24 * IN, YF + 12 * IN, Z0 + 5 * IN);
    a.rect(x - 8 * IN, YB - 36 * IN, x + 8 * IN, YB - 26 * IN, 'EQUIP'); a.rect(x - 24 * IN, YF + 6 * IN, x + 24 * IN, YF + 12 * IN, 'EQUIP-DETAIL'); a.line(x - bw / 2, YF + 2 * IN, x - bw / 2, YB - 40 * IN, 'EQUIP-DETAIL');
  }
  a.line(X0 + 10 * IN + n * bw, YF + 2 * IN, X0 + 10 * IN + n * bw, YB - 40 * IN, 'EQUIP-DETAIL'); a.rect(X0, YB - 24 * IN, X1, YB - 4 * IN, 'EQUIP-HIDDEN');
  a.log(`Added ${n} charging posts with screens, holsters and drooping cables, wheel stops, bay lines and a flat canopy roof on columns (plan and 3D).`);
}
function hydroIntake(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pw = 28 * IN, bot = Z0 + 14 * IN, rackLow = YF + 6 * IN, rackHigh = YF + D * 0.38, tz = Z0 + H * 0.78, gy = YF + D * 0.42;
  a.box(X0, YF, Z0, X1, YB, bot);
  a.box(X0, YF + 2 * IN, bot, X0 + pw, YB, Z1 - 30 * IN); a.box(X1 - pw, YF + 2 * IN, bot, X1, YB, Z1 - 30 * IN);
  a.box(X0, gy + 10 * IN, bot, X1, YB, Z1 - 36 * IN); a.box(X0, YF + 2 * IN, Z1 - 36 * IN, X1, YB, Z1 - 30 * IN);
  const nb = m.round((W - 2 * pw) / (4 * IN)); for (let i = 1; i < nb; i++) { const x = X0 + pw + i * (W - 2 * pw) / nb; a.tube([[x, rackLow, bot + 4 * IN], [x, rackHigh, tz]], [0.7 * IN, 0.7 * IN], 5); }
  for (const f of [0.2, 0.5, 0.8]) a.tube([[X0 + pw, rackLow + (rackHigh - rackLow) * f, bot + 4 * IN + (tz - bot - 4 * IN) * f], [X1 - pw, rackLow + (rackHigh - rackLow) * f, bot + 4 * IN + (tz - bot - 4 * IN) * f]], [1.4 * IN, 1.4 * IN], 6);
  a.tube([[X0 + pw, rackHigh, tz], [X1 - pw, rackHigh, tz]], [2 * IN, 2 * IN], 8);
  const gw = W - 2 * pw; a.frame(X0 + pw + 5 * IN, bot, X1 - pw - 5 * IN, Z1 - 36 * IN, gy, gy + 8 * IN, 5 * IN);
  a.box(X0 + pw + 8 * IN, gy + 2 * IN, bot + 4 * IN, X1 - pw - 8 * IN, gy + 6 * IN, Z1 - 60 * IN);
  for (const x of [cx - gw * 0.3, cx + gw * 0.3]) { a.box(x - 2 * IN, gy - 2 * IN, Z1 - 30 * IN, x + 2 * IN, gy + 6 * IN, Z1 - 4 * IN); a.tube([[x, gy + 2 * IN, Z1 - 30 * IN], [x, gy + 2 * IN, Z1 - 60 * IN]], [0.5 * IN, 0.5 * IN], 5); }
  a.box(cx - gw * 0.34, gy - 2 * IN, Z1 - 4 * IN, cx + gw * 0.34, gy + 6 * IN, Z1); a.xcyl(cx - gw * 0.2, cx + gw * 0.2, gy + 2 * IN, Z1 - 12 * IN, 4 * IN, 14); a.box(cx - 8 * IN, gy + 10 * IN, Z1 - 30 * IN, cx + 8 * IN, gy + 22 * IN, Z1 - 20 * IN);
  const pr = m.min(gw, (Z1 - bot) * 0.5) * 0.28, pz = bot + (Z1 - bot) * 0.3; a.ycyl(gy + 8 * IN, YB - 3 * IN, cx, pz, pr, 24); flange(a, 'y', cx, pz, YB - 3 * IN, 1, pr * 1.2, 3 * IN, pr * 0.92, 24, pr * 1.07, 1.5 * IN, 0, true);
  rail(a, X0 + pw + 4 * IN, YF + 4 * IN, X1 - pw - 4 * IN, YF + 4 * IN, Z1 - 30 * IN, Z1 - 30 * IN + 40 * IN, 16, 4);
  a.outline(); a.rect(X0 + pw, rackLow, X1 - pw, rackHigh, 'EQUIP-DETAIL'); a.rect(X0 + pw + 5 * IN, gy, X1 - pw - 5 * IN, gy + 8 * IN, 'EQUIP-DETAIL'); a.line(cx, gy + 8 * IN, cx, YB, 'EQUIP-HIDDEN');
  a.log('Added the base slab, concrete piers and deck, the sloped trash rack with bars and rails, the gate frame and slide, the hoist gantry with winch and the penstock stub with its flange (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ distribution
/** a four-legged lattice transmission tower: tapered legs, panel bracing, crossarms with insulator strings. o: tiers, arm (mm), */
function lattice(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bw = D * 0.9, tw = D * 0.2, wz0 = Z0 + H * 0.0, zt = Z0 + H * 0.78, np = v.panels;
  const lx = (z, s) => s * (bw / 2 - (bw / 2 - tw / 2) * ((z - Z0) / (zt - Z0))), tt = m.max(60, H / 220);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.tube([[cx + lx(Z0, sx), cy + lx(Z0, sy), Z0], [cx + lx(zt, sx), cy + lx(zt, sy), zt]], [tt, tt * 0.8], 6);
  for (let k = 0; k < np; k++) {
    const z0 = Z0 + (zt - Z0) * k / np, z1 = Z0 + (zt - Z0) * (k + 1) / np, t2 = tt * 0.55;
    for (const [fixed, sg] of [['y', -1], ['y', 1], ['x', -1], ['x', 1]]) {
      const P = (z, s) => fixed === 'y' ? [cx + lx(z, s), cy + sg * lx(z, 1), z] : [cx + sg * lx(z, 1), cy + lx(z, s), z];
      a.tube([P(z0, -1), P(z1, 1)], [t2, t2], 4); a.tube([P(z0, 1), P(z1, -1)], [t2, t2], 4);
    }
    for (const z of [z1]) { a.tube([[cx - lx(z, 1), cy - lx(z, 1), z], [cx + lx(z, 1), cy - lx(z, 1), z], [cx + lx(z, 1), cy + lx(z, 1), z], [cx - lx(z, 1), cy + lx(z, 1), z], [cx - lx(z, 1), cy - lx(z, 1), z]], [t2, t2, t2, t2, t2], 4); }
  }
  // peak, crossarms (two sides) with hanging insulator strings and a conductor stub
  a.tube([[cx, cy, zt], [cx, cy, Z1 - tt]], [tt, tt * 0.6], 6); a.tube([[cx, cy, Z1 - tt], [cx, cy, Z1]], [tt * 0.5, tt * 0.3], 5);
  const arms = v.tiers, span = (W - 2 * 30) / 2;
  for (let i = 0; i < arms; i++) {
    const za = zt - (zt - Z0) * (0.05 + i * 0.2) * (arms === 1 ? 1.4 : 1) - (arms === 3 ? 0 : 0), ext = span * (1 - 0.18 * i), wid = lx(za, 1);
    for (const s of [-1, 1]) {
      a.tube([[cx + s * wid, cy, za + tt * 2.5], [cx + s * ext, cy, za + tt * 1.2]], [tt, tt * 0.8], 6); a.tube([[cx + s * wid, cy, za - tt * 1.2], [cx + s * ext, cy, za + tt * 0.4]], [tt * 0.7, tt * 0.7], 5);
      a.tube([[cx + s * wid * 0.6, cy, za + tt * 6], [cx + s * ext, cy, za + tt * 1.6]], [tt * 0.6, tt * 0.6], 4);
      const sl = H * 0.045; for (let k = 0; k < 9; k++) a.cone(cx + s * ext, cy, za - sl * k / 9 - 6, za - sl * (k + 0.7) / 9, tt * 1.9, tt * 1.9, 8); a.cyl(cx + s * ext, cy, za - sl, za - sl - tt * 2, tt * 0.8, 6);
      a.rect(cx + s * wid, cy - tt, cx + s * ext, cy + tt, 'EQUIP-DETAIL');
    }
    a.tube([[cx - 0, cy, za + tt * 1.2], [cx, cy, za + tt * 1.2]], [tt, tt], 4);
  }
  a.rect(cx - bw / 2, cy - bw / 2, cx + bw / 2, cy + bw / 2); a.rect(cx - tw / 2, cy - tw / 2, cx + tw / 2, cy + tw / 2, 'EQUIP-DETAIL'); a.line(cx - bw / 2, cy - bw / 2, cx + bw / 2, cy + bw / 2, 'EQUIP-DETAIL'); a.line(cx - bw / 2, cy + bw / 2, cx + bw / 2, cy - bw / 2, 'EQUIP-DETAIL');
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * bw / 2 - 150, cy + sy * bw / 2 - 150, Z0, cx + sx * bw / 2 + 150, cy + sy * bw / 2 + 150, Z0 + 50);
  a.log(`Added four tapered angle legs, ${np} braced panels with ring ties, ${arms} pair${arms > 1 ? 's' : ''} of crossarms with insulator strings, and the earth-wire peak (plan and 3D).`);
}
/** a wood utility pole with crossarm, pin insulators and optional pole-top transformer */
function pole(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pr = 7 * IN, arm = v.arm * IN, tp = 5.5 * IN;
  a.tube([[cx, cy, Z0], [cx, cy, Z0 + H * 0.5], [cx, cy, Z1 - 4 * IN]], [pr, pr * 0.85, tp], 14); a.cone(cx, cy, Z1 - 4 * IN, Z1, tp, tp * 0.3, 14);
  const za = Z1 - 18 * IN; if (v.three) { a.box(cx - arm / 2, cy - 2 * IN, za, cx + arm / 2, cy + 2 * IN, za + 4 * IN); a.box(cx - arm / 2, cy - 4 * IN, za - 1 * IN, cx + arm / 2, cy + 4 * IN, za); for (const s of [-1, 0, 1]) { const x = cx + s * arm * 0.4; a.cyl(x, cy, za + 4 * IN, za + 7 * IN, 0.8 * IN, 8); a.cone(x, cy, za + 5 * IN, za + 8 * IN, 2.4 * IN, 1.2 * IN, 10); a.cone(x, cy, za + 8 * IN, za + 10 * IN, 2 * IN, 1.1 * IN, 10); } for (const s of [-1, 1]) a.tube([[cx, cy + 5 * IN, za - 30 * IN], [cx + s * arm * 0.3, cy + 3 * IN, za]], [1.4 * IN, 1.2 * IN], 6); a.rect(cx - arm / 2, cy - 4 * IN, cx + arm / 2, cy + 4 * IN, 'EQUIP-DETAIL'); }
  else { for (const s of [-1, 1]) { const x = cx + s * arm * 0.4; a.box(x - 1.8 * IN, cy - 2 * IN, za, x + 1.8 * IN, cy + 2 * IN, za + 1.2 * IN); a.cyl(x, cy, za + 1.2 * IN, za + 4 * IN, 0.8 * IN, 8); a.cone(x, cy, za + 2 * IN, za + 5 * IN, 2.4 * IN, 1.2 * IN, 10); } a.box(cx - arm / 2, cy - 2 * IN, za - 4 * IN, cx + arm / 2, cy + 2 * IN, za); }
  if (v.xfmr) { const tr = v.xfmr * IN; a.cyl(cx + pr + tr * 1.1, cy, za - 52 * IN, za - 52 * IN + tr * 4.2, tr, 16); a.ell(cx + pr + tr * 1.1, cy, za - 52 * IN + tr * 4.2, tr, tr, tr * 0.5, 14, 5); a.box(cx + pr * 0.4, cy - 2 * IN, za - 52 * IN + tr, cx + pr + tr * 0.15, cy + 2 * IN, za - 52 * IN + tr * 1.6); a.cyl(cx + pr + tr * 1.1, cy, za - 52 * IN + tr * 4.7, za - 52 * IN + tr * 5.4, 0.9 * IN, 8); a.circ(cx + pr + tr * 1.1, cy, tr); }
  a.tube([[cx - pr * 1.1, cy, Z0 + 6 * IN], [cx - pr * 1.1, cy, za - 20 * IN]], [0.6 * IN, 0.6 * IN], 5); for (let z = Z0 + 120 * IN; z < za - 24 * IN; z += 36 * IN) a.box(cx - pr * 1.1 - 0.7 * IN, cy - 0.7 * IN, z, cx - pr * 0.4, cy + 0.7 * IN, z + 1.5 * IN);
  a.circ(cx, cy, pr); a.log('Added the tapered pole with its ground wire and steps, ' + (v.three ? 'a braced three-pin crossarm with pin insulators' : 'a short crossarm with pin insulators') + (v.xfmr ? ' and a pole-top transformer can with bushing' : '') + ' (plan and 3D).');
}
function padXfmr(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pl = 4 * IN, bh = H - pl;
  a.box(X0, YF, Z0, X1, YB, Z0 + pl); a.box(X0 + 1 * IN, YF + 1 * IN, Z0 + pl, X1 - 1 * IN, YB - 1 * IN, Z0 + pl + bh - 3 * IN);
  prismX(a, [[YF + 0.5 * IN, Z1 - 3 * IN], [YB - 0.5 * IN, Z1 - 3 * IN], [YB - 4 * IN, Z1], [YF + 4 * IN, Z1]], X0, X1);
  const comp = W * 0.46, dw = comp - 4 * IN;
  for (const s of [0, 1]) { const x0 = s === 0 ? X0 + 2 * IN : X1 - 2 * IN - dw; a.frame(x0, Z0 + pl + 2 * IN, x0 + dw, Z0 + pl + bh - 5 * IN, YF - 0.8 * IN, YF + 0.5 * IN, 1.2 * IN); a.box(x0 + dw * (s ? 0.12 : 0.88) - 1.2 * IN, YF - 2.2 * IN, Z0 + pl + bh * 0.45, x0 + dw * (s ? 0.12 : 0.88) + 1.2 * IN, YF - 0.8 * IN, Z0 + pl + bh * 0.55); a.box(x0 + dw * 0.4, YF - 1.2 * IN, Z0 + pl + bh * 0.3, x0 + dw * 0.6, YF - 0.8 * IN, Z0 + pl + bh * 0.45); a.ycyl(YF - 1.6 * IN, YF - 0.8 * IN, x0 + dw * (s ? 0.88 : 0.12), Z0 + pl + bh * 0.3, 0.6 * IN, 6); }
  a.box(cx - 10, YF - 0.3 * IN, Z0 + pl + 2 * IN, cx + 10, YF, Z1 - 4 * IN);
  if (v.fins) for (let i = 0; i < v.fins; i++) { const y = YB + 0 - 0; a.box(X0 + 6 * IN + i * ((W - 12 * IN) / v.fins), YB, Z0 + pl + 4 * IN, X0 + 6 * IN + i * ((W - 12 * IN) / v.fins) + 0.7 * IN, YB + 0.01, Z1 - 8 * IN); }
  for (const x of [X0 + 3 * IN, X1 - 3 * IN]) a.box(x - 1 * IN, YF + 1 * IN, Z1 - 2 * IN, x + 1 * IN, YF + 3 * IN, Z1 + 0.5 * IN * 0);
  a.outline(); a.rect(X0 + 1 * IN, YF + 1 * IN, X1 - 1 * IN, YB - 1 * IN, 'EQUIP-DETAIL'); a.line(cx, YF, cx, YF + 2 * IN, 'EQUIP-DETAIL'); a.clear('Operating clearance, front', X0, YF - 10 * 12 * IN, X1, YF, 80);
  a.log('Added the base, ' + (v.fins ? 'finned tank wall, ' : '') + 'the two front compartments with hinged doors, pentagon bolts, handles, nameplate and warning label, and the sloped lid (plan and 3D).');
}
function switchgear(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, n = v.sec, sw = W / n;
  a.box(X0, YF, Z0, X1, YB, Z0 + 4 * IN);
  for (let i = 0; i < n; i++) {
    const x0 = X0 + i * sw, x1 = x0 + sw, zl = Z0 + 4 * IN;
    a.box(x0 + 0.3 * IN, YF + 0.5 * IN, zl, x1 - 0.3 * IN, YB, Z1 - 12 * IN); a.box(x0, YF, Z1 - 12 * IN, x1, YB, Z1 - 5 * IN); prismX(a, [[YF + 1 * IN, Z1 - 5 * IN], [YB - 1 * IN, Z1 - 5 * IN], [YB - 4 * IN, Z1], [YF + 4 * IN, Z1]], x0, x1);
    // breaker door, window, handle, lower door
    a.frame(x0 + 3 * IN, zl + 30 * IN, x1 - 3 * IN, zl + 66 * IN, YF - 0.5 * IN, YF + 0.6 * IN, 1.2 * IN); a.box(x0 + 8 * IN, YF - 1 * IN, zl + 44 * IN, x1 - 8 * IN, YF - 0.3 * IN, zl + 58 * IN); a.cyl(x0 + sw * 0.5, YF - 0.5 * IN, zl + 36 * IN, zl + 36 * IN + 0.01, 1, 4);
    a.ycyl(YF - 2.5 * IN, YF - 0.5 * IN, x0 + sw * 0.5, zl + 38 * IN, 1.4 * IN, 10); a.box(x0 + sw * 0.5 - 4 * IN, YF - 2.5 * IN, zl + 37.5 * IN, x0 + sw * 0.5 + 4 * IN, YF - 1.5 * IN, zl + 38.5 * IN);
    a.frame(x0 + 3 * IN, zl + 2 * IN, x1 - 3 * IN, zl + 27 * IN, YF - 0.5 * IN, YF + 0.6 * IN, 1.2 * IN); a.box(x1 - 6 * IN, YF - 1.5 * IN, zl + 12 * IN, x1 - 5 * IN, YF - 0.5 * IN, zl + 18 * IN);
    a.frame(x0 + 3 * IN, zl + 68 * IN, x1 - 3 * IN, Z1 - 14 * IN, YF - 0.5 * IN, YF + 0.6 * IN, 1.2 * IN); for (let k = 0; k < 3; k++) a.cyl(x0 + sw * (0.25 + 0.25 * k), YF - 1 * IN, Z1 - 24 * IN - 0.05, Z1 - 24 * IN + 0.05, 1.5 * IN, 10);
    for (const f of [0.25, 0.5, 0.75]) a.ycyl(YF - 1.8 * IN, YF - 0.5 * IN, x0 + sw * f, Z1 - 22 * IN, 1.1 * IN, 8);
    a.box(x0 + 2 * IN, YB + 0, Z1 - 5 * IN, x1 - 2 * IN, YB + 0.01, Z1 - 4 * IN);
    a.rect(x0, YF, x1, YB, 'EQUIP-DETAIL'); a.rect(x0 + 3 * IN, YF - 0.5 * IN, x1 - 3 * IN, YF, 'EQUIP-DETAIL');
  }
  a.outline(); a.clear('Working space, front', X0, YF - 6 * 12 * IN, X1, YF, 80);
  a.log(`Added the base channel and ${n} breaker sections, each with a window door, racking handle, lower door, relay compartment with dials and a roof relief flap (plan and 3D).`);
}
function cableDrum(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.dia * IN / 2, fw = 2.2 * IN, core = R * 0.42, zc = Z0 + R;
  for (const [x0, x1] of [[X0, X0 + fw], [X1 - fw, X1]]) { ring(a, 'x', cy, zc, 1.4 * IN, R, x0, x1, R, 36); for (let k = 0; k < 8; k++) { const th = (k / 8) * TAU, pr = R * 0.78; cylA(a, 'x', cy + pr * m.cos(th), zc + pr * m.sin(th), x0 - 0.3 * IN, x1 + 0.3 * IN, 0.45 * IN, 6); } }
  const lag = (W - 2 * fw) / 14; for (let i = 0; i < 14; i++) a.xcyl(X0 + fw + i * lag, X0 + fw + (i + 1) * lag - 1, cy, zc, core, 24);
  a.xcyl(X0 + fw, X1 - fw, cy, zc, R * 0.8, 36); for (let i = 1; i < 14; i++) a.xcyl(X0 + fw + i * ((W - 2 * fw) / 14) - 4, X0 + fw + i * ((W - 2 * fw) / 14) + 4, cy, zc, R * 0.805, 36);
  a.xcyl(X0 - 0, X1, cy, zc, 1.4 * IN, 10); a.tube([[X1 - fw - 2 * IN, cy, zc + R * 0.8], [X1 - fw - 2 * IN, cy + R * 0.2, zc + R * 0.95], [X1 - fw - 2 * IN, cy + R * 0.5, zc + R * 0.9]], [1.2 * IN, 1.2 * IN, 1.2 * IN], 8);
  a.rect(X0, cy - R, X0 + fw, cy + R, 'EQUIP'); a.rect(X1 - fw, cy - R, X1, cy + R, 'EQUIP'); a.rect(X0 + fw, cy - R * 0.8, X1 - fw, cy + R * 0.8, 'EQUIP'); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
  a.log('Added the two flange discs with arbor hole and tie bolts, the barrel with layered cable winding and the cable end tail (plan and 3D).');
}
function meterBoard(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.n, cols = v.cols, rows = m.ceil(n / cols), cw = (W - 6 * IN) / cols, rh = (H - 16 * IN) / rows;
  a.box(X0, YF + 2.5 * IN, Z0, X1, YB, Z1); a.box(X0 + 1 * IN, YF + 1 * IN, Z0 + 1 * IN, X1 - 1 * IN, YF + 2.5 * IN, Z1 - 1 * IN);
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = m.floor(i / cols), x = X0 + 3 * IN + (c + 0.5) * cw, z = Z1 - 4 * IN - (r + 0.5) * rh;
    const rm = m.min(cw, rh) * 0.34; a.ycyl(YF + 0.6 * IN, YF + 2.5 * IN, x, z, rm * 1.18, 24); a.ell(x, YF + 0.6 * IN, z, rm, 1.4 * IN, rm, 20, 8); a.ycyl(YF + 0.2 * IN, YF + 0.6 * IN, x, z, rm * 0.55, 20);
    a.box(x - rm * 0.5, YF - 0.2 * IN, z - rm * 0.22, x + rm * 0.5, YF + 0.3 * IN, z + rm * 0.22); a.box(x - rm * 0.7, YF + 0.6 * IN, z - rm * 1.18 - 2.2 * IN, x + rm * 0.7, YF + 2.5 * IN, z - rm * 1.18); a.box(x - rm * 0.9, YF + 0.4 * IN, z - rm * 1.2, x + rm * 0.9, YF + 1 * IN, z - rm * 1.2 + 0.7 * IN);
    a.circ(x, YF + 1.5 * IN, rm, 'EQUIP-DETAIL');
  }
  const bz = Z0 + 4 * IN; a.box(X0 + 3 * IN, YF + 0.5 * IN, bz - 2 * IN, X0 + 10 * IN, YF + 2.5 * IN, bz + 5 * IN); a.cyl(X0 + 6.5 * IN, YF + 0.5 * IN, bz + 5 * IN, bz + 5 * IN + 0.01, 1, 4);
  for (let i = 0; i < 4; i++) a.cyl(X0 + 12 * IN + i * 3 * IN, YB - 1.2 * IN, Z0 - 0.3, Z0 + 0.3, 0.5, 4);
  a.outline(); a.rect(X0 + 1 * IN, YF + 1 * IN, X1 - 1 * IN, YF + 2.5 * IN, 'EQUIP-DETAIL');
  a.log(`Added the back board, ${n} meter bases each with a glass dome, dial window and sealing ring, a breaker and the terminal covers (plan and 3D).`);
}
function disconnect(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, sp = W / 3.4;
  a.box(X0, cy - 3 * IN, Z0, X1, cy + 3 * IN, Z0 + 10 * IN); for (const sx of [X0 + 4 * IN, X1 - 4 * IN]) a.box(sx - 3 * IN, cy - 3 * IN, Z0, sx + 3 * IN, cy + 3 * IN, Z0 + H * 0.12);
  for (const s of [-1, 0, 1]) {
    const x = cx + s * sp; a.cyl(x, cy, Z0 + 10 * IN, Z0 + H * 0.22, 3 * IN, 10);
    for (const dx of [-1, 1]) { const px = x + dx * (sp * 0.28), zz = Z0 + H * 0.22; a.cyl(px, cy, zz, zz + H * 0.3, 1.6 * IN, 10); for (let k = 0; k < 8; k++) a.cone(px, cy, zz + H * 0.3 * k / 8, zz + H * 0.3 * (k + 0.8) / 8, 3.6 * IN, 3.6 * IN, 10); a.box(px - 2 * IN, cy - 2 * IN, zz + H * 0.3, px + 2 * IN, cy + 2 * IN, zz + H * 0.3 + 2 * IN); }
    a.tube([[x - sp * 0.28, cy, Z0 + H * 0.22 + H * 0.3 + 2 * IN], [x + sp * 0.28, cy, Z0 + H * 0.22 + H * 0.3 + 2 * IN]], [1 * IN, 1 * IN], 6); a.tube([[x + sp * 0.28, cy, Z0 + H * 0.22 + H * 0.3 + 2 * IN], [x + sp * 0.28, cy, Z0 + H * 0.22 + H * 0.3 + 2 * IN]], [1, 1], 4);
    a.rect(x - sp * 0.4, cy - 3 * IN, x + sp * 0.4, cy + 3 * IN, 'EQUIP-DETAIL');
  }
  a.tube([[X0 + 6 * IN, cy, Z0 + 10 * IN], [X0 + 6 * IN, cy, Z0 + H * 0.42]], [0.8 * IN, 0.8 * IN], 6); a.box(X0 + 2 * IN, cy - 6 * IN, Z0 + 14 * IN, X0 + 8 * IN, cy + 6 * IN, Z0 + 28 * IN); handwheel(a, X0 + 6 * IN, cy, Z0 + H * 0.42, 4 * IN, 0.6 * IN, 3);
  a.outline(); a.log('Added the steel base on two posts, three insulator stacks per phase on pedestals, the switch blades and top terminals, the operating rod and handle (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ oil and gas
/** a gate valve block with bonnet and handwheel at height; ax 'x' or 'y' is the side the handwheel faces. returns nothing */
function xvalve(a, x, y, z, s, whz = 0) {
  a.box(x - s, y - s * 0.7, z - s, x + s, y + s * 0.7, z + s); a.cyl(x, y, z + s, z + s * 1.8, s * 0.55, 12); a.cyl(x, y, z + s * 1.8, z + s * 2.6, s * 0.14, 8); handwheel(a, x, y, z + s * 2.6, s * 1.15, m.max(4, s * 0.08), 4);
}
function wellhead(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, s = W * 0.085, pr = s * 0.55, w0 = Z0 + H * 0.12;
  a.box(cx - W * 0.28, cy - W * 0.28, Z0, cx + W * 0.28, cy + W * 0.28, Z0 + 3 * IN); a.cyl(cx, cy, Z0 + 3 * IN, w0, W * 0.2, 24); flange(a, 'z', cx, cy, w0, 1, W * 0.2 + 0, 24, pr, 12, W * 0.16, 12, 0, false);
  a.cyl(cx, cy, w0 + 24, w0 + H * 0.1, W * 0.14, 20); flange(a, 'z', cx, cy, w0 + H * 0.1, 1, W * 0.17, 28, pr, 12, W * 0.135, 12, 0, false);
  let z = w0 + H * 0.1 + 28; const nm = v.masters;
  for (let k = 0; k < nm; k++) { a.cyl(cx, cy, z, z + s * 2, pr, 12); a.box(cx - s * 0.9, cy - s * 0.9, z + s * 0.4, cx + s * 0.9, cy + s * 0.9, z + s * 1.6); a.cyl(cx, cy + s * 0.9, z + s, z + s * 1.0 + 0.01, 1, 4); a.xcyl(cx - s * 0.4, cx + s * 0.4, cy - s * 0.9 - s * 0.55, z + s, s * 0.5, 12); a.ycyl(cy - s * 0.9 - s * 1.6, cy - s * 0.9, cx, z + s, s * 0.14, 8); ring(a, 'y', cx, z + s, s * 0.7, s * 0.9, cy - s * 0.9 - s * 1.85, cy - s * 0.9 - s * 1.6, s * 0.9, 16); z += s * 2.1; }
  // tee with wing valves
  const zt = z + s; a.box(cx - s * 4.4, cy - pr, zt - pr, cx + s * 4.4, cy + pr, zt + pr); a.cyl(cx, cy, z, zt + pr, pr, 12);
  for (const sx of [-1, 1]) { const vx = cx + sx * s * 2.6; a.box(vx - s * 0.8, cy - s * 0.8, zt - s * 0.8, vx + s * 0.8, cy + s * 0.8, zt + s * 0.8); a.ycyl(cy - s * 0.8 - s * 1.0, cy - s * 0.8, vx, zt, s * 0.5, 12); a.ycyl(cy - s * 0.8 - s * 1.6, cy - s * 0.8 - s * 1.0, vx, zt, s * 0.12, 8); ring(a, 'y', vx, zt, s * 0.88, s * 1.05, cy - s * 0.8 - s * 1.7, cy - s * 0.8 - s * 1.5, s * 1.05, 16); a.xcyl(vx + sx * s * 0.8, cx + sx * s * 4.4, cy, zt, pr * 0.9, 12); flange(a, 'x', cy, zt, cx + sx * s * 4.4, -sx, s * 1.35, 24, pr * 0.9, 8, s * 1.0, 10, 0, true); }
  if (v.choke) { const vx = cx + s * 3.7; a.cyl(vx, cy, zt - pr, zt - s * 2.2, pr * 0.9, 10); a.box(vx - s * 0.6, cy - s * 0.6, zt - s * 2.8, vx + s * 0.6, cy + s * 0.6, zt - s * 2.2); a.cyl(vx, cy, zt - s * 3.6, zt - s * 2.8, pr * 0.9, 10); gauge(a, vx, cy - s * 0.7, zt - s * 3.2, s * 0.5); }
  const zs = zt + s * 1.4; a.cyl(cx, cy, zt, zs, pr, 12); a.box(cx - s * 0.7, cy - s * 0.7, zs, cx + s * 0.7, cy + s * 0.7, zs + s * 1.4); a.cyl(cx, cy, zs + s * 1.4, zs + s * 2.2, s * 0.14, 8); handwheel(a, cx, cy, zs + s * 2.2 < Z1 - 2 ? zs + s * 2.2 : Z1 - 2, s * 0.9, m.max(4, s * 0.07), 4);
  a.cyl(cx + s * 0.7, cy, zs + s * 0.6, zs + s * 1.0, pr * 0.4, 6); gauge(a, cx - s * 0.7, cy - s * 0.7 - 6, zs + s * 0.7, s * 0.45);
  a.circ(cx, cy, W * 0.28, 'EQUIP-HIDDEN'); a.circ(cx, cy, W * 0.14, 'EQUIP-DETAIL'); a.rect(cx - s * 4.4, cy - pr, cx + s * 4.4, cy + pr, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
  a.log(`Added the stacked casing and tubing spools with flanges, ${nm === 2 ? 'two master valves' : 'a master valve'}, the flow cross with wing valves and handwheels${v.choke ? ', a choke body' : ''} and the swab valve with gauge and cap (plan and 3D).`);
}
function pumpjack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, by = cy, pivot = [X0 + W * 0.5, Z0 + H * 0.66];
  // skid base rails and cross beams
  for (const dy of [-1, 1]) a.box(X0 + W * 0.04, by + dy * D * 0.3 - 3 * IN, Z0, X1 - W * 0.04, by + dy * D * 0.3 + 3 * IN, Z0 + 6 * IN); for (const f of [0.1, 0.5, 0.9]) a.box(X0 + W * f - 3 * IN, YF + D * 0.1, Z0, X0 + W * f + 3 * IN, YB - D * 0.1, Z0 + 5 * IN);
  // samson post (A-frame) and saddle bearing
  const sh = pivot[1] - 6 * IN; for (const dy of [-1, 1]) a.tube([[pivot[0] - W * 0.14, by + dy * D * 0.3, Z0 + 5 * IN], [pivot[0], by + dy * D * 0.06, sh]], [4 * IN, 3 * IN], 6), a.tube([[pivot[0] + W * 0.14, by + dy * D * 0.3, Z0 + 5 * IN], [pivot[0], by + dy * D * 0.06, sh]], [4 * IN, 3 * IN], 6);
  a.tube([[pivot[0] - W * 0.07, by - D * 0.1, Z0 + H * 0.3], [pivot[0] + W * 0.07, by - D * 0.1, Z0 + H * 0.3]], [2 * IN, 2 * IN], 5); a.box(pivot[0] - 5 * IN, by - D * 0.07, sh, pivot[0] + 5 * IN, by + D * 0.07, sh + 7 * IN);
  // walking beam tilted a little, horsehead at -x, tail at +x
  const ang = 0.06, bl = W * 0.46, px = pivot[0], pz = pivot[1] + 2 * IN, bx = (L, d) => [px + d * m.cos(ang) * L, pz - d * m.sin(ang) * L];
  const e0 = bx(bl, -1), e1 = bx(bl * 0.55, 1);
  for (const dy of [-1, 1]) a.tube([[e0[0], by + dy * 4 * IN, e0[1]], [px, by + dy * 4 * IN, pz], [e1[0], by + dy * 4 * IN, e1[1]]], [3 * IN, 3.4 * IN, 3 * IN], 6);
  a.box(px - 4 * IN, by - 4.5 * IN, pz - 7 * IN, px + 4 * IN, by + 4.5 * IN, pz + 1 * IN);
  // horsehead: curved cheek and bridle to the polished rod
  const hh = [[e0[0] - 2 * IN, pz + 12 * IN], [e0[0] + 14 * IN, pz + 7 * IN], [e0[0] + 18 * IN, pz - 13 * IN], [e0[0] - 2 * IN, pz - 16 * IN]]; prismY(a, hh, by - 4 * IN, by + 4 * IN);
  const rx = e0[0] + 1 * IN; a.tube([[rx, by, pz - 14 * IN], [rx, by, Z0 + H * 0.2]], [1 * IN, 1.4 * IN], 6); a.cyl(rx, by, Z0 + H * 0.2 - 1, Z0 + H * 0.2 + 1, 1.4 * IN, 6); a.cyl(rx, by, Z0 + 5 * IN, Z0 + H * 0.2, 4.5 * IN, 14); a.box(rx - 6 * IN, by - 6 * IN, Z0 + 5 * IN, rx + 6 * IN, by + 6 * IN, Z0 + 12 * IN);
  a.tube([[rx - 1 * IN, by - 3 * IN, pz - 12 * IN], [rx - 1 * IN, by - 3 * IN, Z0 + H * 0.26]], [0.4 * IN, 0.4 * IN], 4); a.tube([[rx - 1 * IN, by + 3 * IN, pz - 12 * IN], [rx - 1 * IN, by + 3 * IN, Z0 + H * 0.26]], [0.4 * IN, 0.4 * IN], 4);
  // gearbox, cranks with counterweights, pitman arms
  const gx = X0 + W * 0.74, gz = Z0 + H * 0.2; a.box(gx - 12 * IN, by - 14 * IN, Z0 + 6 * IN, gx + 12 * IN, by + 14 * IN, gz + 8 * IN); a.ell(gx, by, gz + 8 * IN, 12 * IN, 14 * IN, 6 * IN, 14, 5);
  const cr = H * 0.13; for (const dy of [-1, 1]) { const y = by + dy * 17 * IN; a.xcyl(gx - 1, gx + 1, y, gz, 3 * IN, 8); a.ycyl(y - 1.5 * IN, y + 1.5 * IN, gx, gz, 3 * IN, 10); const cw = [[gx - 3 * IN, gz + cr * 0.15], [gx + 3 * IN, gz + cr * 0.15], [gx + 7 * IN, gz + cr * 1.05 + 4 * IN], [gx - 7 * IN, gz + cr * 1.05 + 4 * IN]]; prismY(a, cw.map(([x, z]) => [x - 0, z]), y - 2.5 * IN, y + 2.5 * IN); a.tube([[gx, y + dy * 2.5 * IN, gz + cr * 1.1], [e1[0], by + dy * 4 * IN, e1[1]]], [1.3 * IN, 1.3 * IN], 6); }
  // motor with belt guard
  const mx = gx + 16 * IN; a.box(mx, by - 8 * IN, Z0 + 6 * IN, mx + 28 * IN, by + 8 * IN, Z0 + 20 * IN); a.xcyl(mx + 4 * IN, mx + 24 * IN, by, Z0 + 28 * IN, 8 * IN, 16); a.box(mx + 6 * IN, by - 8 * IN, Z0 + 20 * IN, mx + 22 * IN, by + 8 * IN, Z0 + 24 * IN);
  a.box(gx + 4 * IN, by + 9 * IN, gz - 4 * IN, mx + 4 * IN, by + 13 * IN, gz + 12 * IN);
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + W * 0.04, by - D * 0.3 - 3 * IN, X1 - W * 0.04, by + D * 0.3 + 3 * IN, 'EQUIP-DETAIL'); a.rect(e0[0], by - 4.5 * IN, e1[0], by + 4.5 * IN, 'EQUIP'); a.rect(gx - 12 * IN, by - 14 * IN, gx + 12 * IN, by + 14 * IN, 'EQUIP'); a.rect(mx, by - 8 * IN, mx + 28 * IN, by + 8 * IN, 'EQUIP'); a.circ(rx, by, 5 * IN, 'EQUIP-DETAIL');
  a.log('Added the skid with cross beams, A-frame samson post and bearing, the tilted walking beam with horsehead and bridle, polished rod and wellhead stub, the gearbox with two crank counterweights and pitman arms, and the motor with its belt guard (plan and 3D).');
}
function separator(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.dia * IN / 2, hd = R * 0.5, sh = 18 * IN, zc = Z0 + sh + R + 6 * IN, x0 = X0 + hd + 30 * IN, x1 = X1 - hd - 30 * IN;
  a.box(X0 + 20 * IN, cy - R * 0.9, Z0, X1 - 20 * IN, cy - R * 0.9 + 6 * IN, Z0 + sh * 0.6); a.box(X0 + 20 * IN, cy + R * 0.9 - 6 * IN, Z0, X1 - 20 * IN, cy + R * 0.9, Z0 + sh * 0.6);
  for (const f of [0.14, 0.86]) { const x = x0 + (x1 - x0) * f; a.prism([[x - 4 * IN, cy - R * 0.7], [x + 4 * IN, cy - R * 0.7], [x + 4 * IN, cy + R * 0.7], [x - 4 * IN, cy + R * 0.7]], Z0 + sh * 0.6, zc - R * 0.5); }
  a.xcyl(x0, x1, cy, zc, R, 28); a.ell(x0, cy, zc, hd, R, R, 14, 7); a.ell(x1, cy, zc, hd, R, R, 14, 7);
  flange(a, 'x', cy, zc, X0 + 20 * IN, 1, R * 0.4, 30, R * 0.3, 12, R * 0.35, 12, 0, false);
  const nr = m.max(3 * IN, R * 0.14);
  // inlet (left, top), gas outlet (top, right) with mist pad box, liquid outlet (bottom), drain
  const inx = x0 + (x1 - x0) * 0.12; a.cyl(inx, cy, zc + R - 10, zc + R + R * 0.45, nr, 14); a.tube([[inx, cy, zc + R + R * 0.45], [inx - R * 0.3, cy, zc + R + R * 0.7]], [nr, nr], 14); flange(a, 'x', cy, zc + R + R * 0.7, inx - R * 0.3, -1, nr * 1.9, 30, nr * 0.8, 8, nr * 1.45, 12, 0, true);
  const gx = x0 + (x1 - x0) * 0.8; a.cyl(gx, cy, zc + R - 10, zc + R + R * 0.8, nr * 0.9, 14); flange(a, 'z', gx, cy, zc + R + R * 0.8, 1, nr * 1.8, 30, nr * 0.75, 8, nr * 1.4, 12, 0, true);
  const ox = x0 + (x1 - x0) * 0.9; a.cyl(ox, cy, zc - R - R * 0.4, zc - R + 10, nr * 0.8, 12); flange(a, 'z', ox, cy, zc - R - R * 0.4, -1, nr * 1.7, 28, nr * 0.7, 8, nr * 1.35, 12, 0, true);
  a.cyl(x0 + (x1 - x0) * 0.2, cy, zc - R - R * 0.2, zc - R + 10, nr * 0.5, 10); a.cyl(x0 + (x1 - x0) * 0.2, cy, zc - R - R * 0.2 - 6 * IN, zc - R - R * 0.2, nr * 0.7, 10);
  // relief valve, gauge, level gauge, ladder
  const rv = x0 + (x1 - x0) * 0.45; a.cyl(rv, cy, zc + R - 10, zc + R + 10 * IN, nr * 0.5, 10); a.cyl(rv, cy, zc + R + 10 * IN, zc + R + 18 * IN, nr * 0.7, 10); a.tube([[rv, cy, zc + R + 18 * IN], [rv + 6 * IN, cy, zc + R + 20 * IN]], [3, 3], 4); gauge(a, x0 + (x1 - x0) * 0.62, cy - R + 2, zc + R * 0.5, 3.5 * IN);
  const lx = x0 + (x1 - x0) * 0.32; a.cyl(lx, YF + 3 * IN, zc - R * 0.55, zc + R * 0.55, 1.4 * IN, 10); a.tube([[lx, YF + 3 * IN, zc + R * 0.55], [lx, cy - R * 0.8, zc + R * 0.7]], [0.9 * IN, 0.9 * IN], 6); a.tube([[lx, YF + 3 * IN, zc - R * 0.55], [lx, cy - R * 0.97, zc - R * 0.55]], [0.9 * IN, 0.9 * IN], 6);
  a.outline('EQUIP-HIDDEN'); a.rect(x0, cy - R, x1, cy + R); a.rect(X0 + 20 * IN, cy - R * 0.9, X1 - 20 * IN, cy + R * 0.9, 'EQUIP-DETAIL'); for (const f of [0.14, 0.86]) a.line(x0 + (x1 - x0) * f, cy - R * 0.7, x0 + (x1 - x0) * f, cy + R * 0.7, 'EQUIP-DETAIL');
  a.log('Added the skid with saddles, the vessel with dished heads and manway, the flanged inlet, gas outlet, liquid outlet and drain, relief valve, gauge and the level gauge column (plan and 3D).');
}
function tankFixed(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.dia * 12 * IN / 2, sh = v.shell * 12 * IN, rh = H - sh - 8 * IN;
  a.cyl(cx, cy, Z0, Z0 + 6 * IN, R + 5 * IN, 36); a.cyl(cx, cy, Z0 + 6 * IN, Z0 + 6 * IN + sh, R, 36); for (let k = 1; k < 5; k++) a.cyl(cx, cy, Z0 + 6 * IN + sh * k / 5 - 5, Z0 + 6 * IN + sh * k / 5 + 5, R + 3, 36);
  a.cone(cx, cy, Z0 + 6 * IN + sh, Z1 - 2 * IN, R + 3 * IN, R * 0.1, 36); a.cyl(cx, cy, Z1 - 2 * IN, Z1, R * 0.12, 12);
  // roof hatch, vent, shell manway, nozzles
  const zr = Z0 + 6 * IN + sh; a.cyl(cx + R * 0.45, cy, zr + rh * 0.45, zr + rh * 0.45 + 12 * IN, 10 * IN, 14); a.cone(cx - R * 0.35, cy, zr + rh * 0.57, zr + rh * 0.57 + 20 * IN, 5 * IN, 4 * IN, 12);
  a.cyl(cx - R * 0.35, cy, zr + rh * 0.57 + 20 * IN, zr + rh * 0.57 + 24 * IN, 7 * IN, 12);
  a.ycyl(cy - R - 14 * IN, cy - R, cx - R * 0.22, Z0 + 38 * IN, 15 * IN, 20); a.ycyl(cy - R - 17 * IN, cy - R - 14 * IN, cx - R * 0.22, Z0 + 38 * IN, 18 * IN, 20);
  a.ycyl(cy - R - 14 * IN, cy - R, cx + R * 0.3, Z0 + 24 * IN, 4 * IN, 12); flange(a, 'y', cx + R * 0.3, Z0 + 24 * IN, cy - R - 14 * IN, -1, 8 * IN, 2 * IN, 3.2 * IN, 8, 6 * IN, 1 * IN, 0, true);
  a.tube([[cx + R * 0.55, cy - R * 0.84, Z0 + 6 * IN], [cx + R * 0.55, cy - R * 0.84, zr + 20 * IN]], [1.3 * IN, 1.3 * IN], 6);
  // spiral stair around the shell with a handrail, then a roof walkway rail
  const turns = 0.78, n = 28, wd = 22 * IN; let prev = null;
  for (let k = 0; k <= n; k++) { const th = m.PI * 0.5 + m.PI * 2 * turns * k / n * -1, z = Z0 + 6 * IN + (sh) * k / n, px = cx + (R + wd / 2 + 3 * IN) * m.cos(th), py = cy + (R + wd / 2 + 3 * IN) * m.sin(th); if (prev) { a.tube([[prev[0], prev[1], prev[2]], [px, py, z]], [wd / 2, wd / 2], 4); } prev = [px, py, z]; }
  const pts = [], rp = []; for (let k = 0; k <= n; k++) { const th = m.PI * 0.5 - m.PI * 2 * turns * k / n, z = Z0 + 6 * IN + sh * k / n + 36 * IN; pts.push([cx + (R + wd + 3 * IN) * m.cos(th), cy + (R + wd + 3 * IN) * m.sin(th), z]); rp.push(1.3 * IN); } a.tube(pts, rp, 5);
  a.circ(cx, cy, R + 5 * IN); a.circ(cx, cy, R * 0.12, 'EQUIP-DETAIL'); a.circ(cx, cy, R + wd + 3 * IN, 'EQUIP-HIDDEN'); a.circ(cx + R * 0.45, cy, 10 * IN, 'EQUIP-DETAIL');
  a.log('Added the base ring, banded shell, cone roof with gauge hatch, vent and centre vent, shell manway with cover, a flanged nozzle, the pipe stub and the spiral stair with handrail (plan and 3D).');
}
function pigLauncher(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.nps * IN * 0.5 * 1.1 + 0.5 * IN, R2 = R * 1.55, zc = Z0 + H * 0.3, x0 = X0 + 6 * IN;
  // barrel (large), eccentric reducer, neck pipe, closure door at the left
  const xb1 = X0 + W * 0.55; a.xcyl(x0 + 4 * IN, xb1, cy, zc, R2, 28); a.tube([[xb1, cy, zc], [xb1 + W * 0.14, cy, zc - (R2 - R)]], [R2, R], 24);
  const xn = xb1 + W * 0.14; a.xcyl(xn, X1 - 4 * IN, cy, zc - (R2 - R), R, 24); flange(a, 'x', cy, zc - (R2 - R), X1 - 4 * IN, -1, R * 1.6, 28, R * 0.9, 12, R * 1.28, 14, 0, true);
  a.ell(x0, cy, zc, 3 * IN, R2 * 1.02, R2 * 1.02, 16, 8); ring(a, 'x', cy, zc, R2 * 0.97, R2 * 1.22, x0 - 2 * IN, x0 + 4 * IN, R2 * 1.22, 28); for (let k = 0; k < 12; k++) { const th = (k / 12) * TAU; a.box(x0 - 3 * IN, cy + R2 * 1.22 * m.cos(th) - 0.7 * IN, zc + R2 * 1.22 * m.sin(th) - 0.7 * IN, x0 - 1 * IN, cy + R2 * 1.22 * m.cos(th) + 0.7 * IN, zc + R2 * 1.22 * m.sin(th) + 0.7 * IN); }
  a.tube([[x0 + 2 * IN, cy + R2 * 1.2, zc + R2 * 0.3], [x0 + 2 * IN, cy + R2 * 1.5, zc + R2 * 0.3], [x0 - 3 * IN, cy + R2 * 1.5, zc + R2 * 0.3]], [1 * IN, 1 * IN, 1 * IN], 6); a.cyl(x0 - 3 * IN, cy + R2 * 1.5, zc - R2 * 0.6, zc + R2 * 0.6, 0.8 * IN, 6);
  // kicker line with valve, balance line, vent and gauge on the barrel
  const kx = X0 + W * 0.3, kr = R * 0.4; a.cyl(kx, cy, zc + R2 - 4, zc + R2 + 8 * IN, kr, 12); a.cyl(kx, cy, zc + R2 + 8 * IN, zc + R2 + 14 * IN, kr * 1.5, 10); a.cyl(kx, cy, zc + R2 + 14 * IN, zc + R2 + 18 * IN, kr * 0.4, 8); handwheel(a, kx, cy, zc + R2 + 18 * IN, 4 * IN, 0.5 * IN, 4);
  const vx = X0 + W * 0.45; a.cyl(vx, cy, zc + R2 - 4, zc + R2 + 6 * IN, kr * 0.7, 10); gauge(a, vx + 6 * IN, cy - R2 + 2, zc + R2 * 0.3, 2.6 * IN);
  const dx = X0 + W * 0.62; a.cyl(dx, cy, zc - R2 - 6 * IN, zc - R2 + 4, kr * 0.7, 10);
  // supports
  for (const x of [X0 + W * 0.18, X0 + W * 0.5, X0 + W * 0.88]) { const r = x < xb1 ? R2 : R, zz = x < xb1 ? zc : zc - (R2 - R); a.box(x - 3 * IN, cy - r * 0.9, Z0, x + 3 * IN, cy + r * 0.9, Z0 + 3 * IN); a.box(x - 2.5 * IN, cy - r * 0.6, Z0 + 3 * IN, x + 2.5 * IN, cy + r * 0.6, zz - r * 0.85); }
  a.outline('EQUIP-HIDDEN'); a.rect(x0, cy - R2, xb1, cy + R2); a.rect(xn, cy - R, X1 - 4 * IN, cy + R); a.line(xb1, cy - R2, xn, cy - R, 'EQUIP-DETAIL'); a.line(xb1, cy + R2, xn, cy + R, 'EQUIP-DETAIL'); a.circ(kx, cy, kr * 1.5, 'EQUIP-DETAIL');
  a.log('Added the large barrel with a hinged quick-opening closure and bolt ring, the reducer and neck with end flange, the kicker connection with its valve, vent, gauge, drain and three saddle supports (plan and 3D).');
}
function flareStack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R0 = v.dia * IN / 2, hs = H * 0.9, pts = [], rs = [];
  a.cyl(cx, cy, Z0, Z0 + 4 * IN, W * 0.45, 24); ring(a, 'z', cx, cy, R0 * 0.8, R0 * 1.8, Z0 + 4 * IN, Z0 + 6 * IN, R0 * 1.8, 24);
  for (let k = 0; k <= 6; k++) { const f = k / 6; pts.push([cx, cy, Z0 + 6 * IN + (hs - 6 * IN) * f]); rs.push(R0 * (1 - 0.12 * f)); } a.tube(pts, rs, 20);
  for (let k = 1; k < 6; k++) { const f = k / 6; a.cyl(cx, cy, Z0 + 6 * IN + (hs - 6 * IN) * f - 1.5 * IN, Z0 + 6 * IN + (hs - 6 * IN) * f + 1.5 * IN, R0 * (1 - 0.12 * f) * 1.1, 20); }
  // ladder with cage hoops, lifting lug, platform with rail near the top and the tip
  ladderX(a, cy - R0 - 3 * IN, cx, Z0 + 2 * IN, Z0 + hs - 10 * IN, 16 * IN, m.round((hs - 12 * IN) / (12 * IN))); for (let z = Z0 + 90 * IN; z < Z0 + hs - 24 * IN; z += 30 * IN) { const pc = []; for (let k = 0; k <= 8; k++) { const th = m.PI + (k / 8) * m.PI; pc.push([cx + 14 * IN * m.cos(th) * 0.6, cy - R0 - 3 * IN + 14 * IN * m.sin(th) * -0.0 - 14 * IN * 0.0 - Math.abs(m.sin(th)) * 14 * IN, z]); } a.tube(pc, pc.map(() => 0.6 * IN), 4); }
  const pz = Z0 + hs - 8 * IN, pr = R0 * 2.4; ring(a, 'z', cx, cy, R0 * 1.05, pr, pz, pz + 1.2 * IN, pr, 24); a.tube(Array.from({ length: 17 }, (_, k) => [cx + pr * m.cos((k / 16) * TAU), cy + pr * m.sin((k / 16) * TAU), pz + 40 * IN]), Array(17).fill(0.8 * IN), 4); for (let k = 0; k < 12; k++) { const th = (k / 12) * TAU; a.cyl(cx + pr * m.cos(th), cy + pr * m.sin(th), pz, pz + 40 * IN, 0.6 * IN, 4); }
  const tip = Z0 + hs; a.cone(cx, cy, tip - 2 * IN, tip + 6 * IN, R0 * 0.88, R0 * 1.25, 20); a.cyl(cx, cy, tip + 6 * IN, Z1, R0 * 1.25, 20); for (let k = 0; k < 8; k++) { const th = (k / 8) * TAU; a.box(cx + R0 * 1.25 * m.cos(th) - 1 * IN, cy + R0 * 1.25 * m.sin(th) - 1 * IN, Z1 - 12 * IN, cx + R0 * 1.25 * m.cos(th) + 1 * IN, cy + R0 * 1.25 * m.sin(th) + 1 * IN, Z1); }
  a.tube([[cx + R0 * 0.8, cy, tip - 6 * IN], [cx + R0 * 1.0, cy, Z1 - 4 * IN]], [0.8 * IN, 0.8 * IN], 4);
  a.circ(cx, cy, R0); a.circ(cx, cy, pr, 'EQUIP-HIDDEN'); a.circ(cx, cy, W * 0.45, 'EQUIP-DETAIL');
  a.log('Added the base plate, tapering stack with flanged joints, a caged ladder, the top platform with railing, the tip with windshield ring and the pilot line (plan and 3D).');
}
function heaterTreater(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.dia * IN / 2, sk = 12 * IN, hx = X0 + W * 0.28, vx = X0 + W * 0.72;
  a.box(X0, YF, Z0, X1, YB, Z0 + sk * 0.5); for (const x of [X0 + 4 * IN, cx - 2 * IN, X1 - 8 * IN]) a.box(x, YF, Z0 + sk * 0.5, x + 4 * IN, YB, Z0 + sk);
  // horizontal treater vessel with fire-tube stack
  const zc = Z0 + sk + R + 6 * IN, x0 = X0 + 6 * IN, x1 = hx + R * 3.1; a.xcyl(x0 + R * 0.4, x1 - R * 0.4, cy - D * 0.12, zc, R, 24); a.ell(x0 + R * 0.4, cy - D * 0.12, zc, R * 0.45, R, R, 14, 7); a.ell(x1 - R * 0.4, cy - D * 0.12, zc, R * 0.45, R, R, 14, 7);
  for (const x of [x0 + R * 0.9, x1 - R * 0.9]) a.box(x - 3 * IN, cy - D * 0.12 - R * 0.6, Z0 + sk, x + 3 * IN, cy - D * 0.12 + R * 0.6, zc - R * 0.6);
  const fr = R * 0.34; a.xcyl(x0 - 2 * IN, x0 + R * 0.5, cy - D * 0.12, zc - R * 0.2, fr, 16); flange(a, 'x', cy - D * 0.12, zc - R * 0.2, x0 - 2 * IN, -1, fr * 1.2, 20, fr * 0.8, 12, fr * 1.05, 12, 0, false);
  const sx = x0 + R * 0.4; a.cyl(sx, cy - D * 0.12, zc + R - 4, Z1 - 2 * IN, R * 0.18, 16); a.cyl(sx, cy - D * 0.12, Z1 - 2 * IN - 18 * IN, Z1 - 2 * IN, R * 0.2, 16); a.cone(sx, cy - D * 0.12, Z1 - 2 * IN, Z1, R * 0.21, R * 0.12, 14);
  a.cyl(x1 - R * 1.3, cy - D * 0.12, zc + R - 4, zc + R + 22 * IN, 4 * IN, 12); flange(a, 'z', x1 - R * 1.3, cy - D * 0.12, zc + R + 22 * IN, 1, 7 * IN, 1.2 * IN, 3 * IN, 8, 5.5 * IN, 0.8 * IN, 0, true);
  gauge(a, x0 + R * 1.8, cy - D * 0.12 - R + 2, zc + R * 0.4, 3.5 * IN); a.cyl(x1 - R * 0.9, cy - D * 0.12, zc - R - 12 * IN, zc - R + 4, 2.2 * IN, 10);
  // small vertical scrubber tank beside it
  const vr = R * 0.62, zv = Z0 + sk; a.cyl(vx, cy, zv, zv + (H - sk) * 0.62, vr, 22); a.ell(vx, cy, zv + (H - sk) * 0.62, vr, vr, vr * 0.5, 16, 6); a.cyl(vx, cy, zv + (H - sk) * 0.62, zv + (H - sk) * 0.62 + 18 * IN, 2.5 * IN, 10); flange(a, 'z', vx, cy, zv + (H - sk) * 0.62 + 18 * IN, 1, 5 * IN, 1 * IN, 2.2 * IN, 8, 3.8 * IN, 0.6 * IN, 0, true);
  a.cyl(vx, cy - vr - 6 * IN, zv + 16 * IN, zv + 40 * IN, 1.2 * IN, 8); a.tube([[x1 - R * 1.3, cy - D * 0.12, zc + R + 22 * IN], [x1 - R * 1.3, cy, zc + R + 28 * IN], [vx, cy, zc + R + 28 * IN], [vx, cy, zv + (H - sk) * 0.62 + 4 * IN]], [3 * IN, 3 * IN, 3 * IN, 3 * IN], 10);
  // control panel on a post
  a.box(X1 - 28 * IN, YF + 6 * IN, Z0 + sk, X1 - 24 * IN, YF + 10 * IN, Z0 + sk + 40 * IN); a.box(X1 - 36 * IN, YF + 4 * IN, Z0 + sk + 40 * IN, X1 - 14 * IN, YF + 10 * IN, Z0 + sk + 64 * IN);
  a.outline(); a.rect(x0 + R * 0.4, cy - D * 0.12 - R, x1 - R * 0.4, cy - D * 0.12 + R, 'EQUIP-DETAIL'); a.circ(vx, cy, vr, 'EQUIP-DETAIL'); a.circ(sx, cy - D * 0.12, R * 0.18, 'EQUIP-DETAIL');
  a.log('Added the skid, the horizontal treater vessel on saddles with fire-tube housing and stack, the flanged gas outlet and gauge, the vertical scrubber with its connecting line, and the control panel on a post (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ families
const windRow = (label, hub, dia, tail) => { const r = dia * 6, nl = r * 0.11 + 30, sp = r * 0.12, bd = hub * 12 * 0.045; const d = m.ceil(m.max(sp + nl + 8, sp + 0.65 * nl + bd / 2 + 6)); return [label, dia * 12 + 4, d, hub * 12 + dia * 6 + 12, 0, { hub, dia, tail }]; };
const FAMS = [
  // ===================================================== generation =====================================================
  fam({ cat: 'energy/generation', title: 'Generic enclosed diesel generator set',
    desc: (v) => `Diesel generator set of ${v.kva} kVA class in a sound-attenuated enclosure on a fuel-tank base: louvred radiator end, front service doors with handles, a control window, emergency stop, roof silencer with rain cap, lifting eye and an alternator-end terminal box.`,
    vs: [[20, 66, 28, 46], [60, 90, 34, 58], [150, 126, 44, 70], [250, 156, 50, 82], [500, 204, 66, 102], [1000, 312, 92, 126]].map(([k, w, d, h]) => [`${k} kVA, ${w} in long`, w, d, h, 0, { kva: k }]),
    build: (a, v) => genset(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic combined heat and power unit',
    desc: (v) => `Combined heat and power module of ${v.kw} kW class: a sound enclosure with doors and louvres, roof silencer, a roof-mounted cooler with ${v.kw > 200 ? 'four' : 'two'} fans and flanged hot-water flow and return connections on the end.`,
    vs: [[100, 168, 60, 108], [400, 264, 84, 138]].map(([k, w, d, h]) => [`${k} kW, ${w} in long`, w, d, h, 0, { kw: k }]),
    build: (a, v) => genset(a, v, { chp: true }) }),
  fam({ cat: 'energy/generation', title: 'Generic horizontal fire-tube steam boiler',
    desc: (v) => `Horizontal fire-tube boiler of ${v.hp} boiler horsepower class: a lagged ${v.dia} in shell on saddles with a front door and burner with blower and gas train, a rear smokebox and stack, steam nozzle, two relief valves, gauge and level column.`,
    vs: [[50, 40, 120], [100, 48, 150], [200, 64, 190], [400, 80, 234], [600, 92, 270]].map(([hp, dia, L]) => [`${hp} hp, ${dia} in shell`, L + 56, dia + 26, R1(dia * 2.9), 0, { hp, dia }]),
    build: (a, v) => hboiler(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic vertical package boiler',
    desc: (v) => `Vertical package boiler with a ${v.dia} in lagged shell and dished top: a front burner box with blower, gauge and handholes, a steam nozzle with flange, a relief valve and a stack.`,
    vs: [[24, 60], [36, 84], [48, 108]].map(([dia, h]) => [`${dia} in shell, ${h} in tall`, dia + 16, dia + 26, h, 0, { dia }]),
    build: (a, v) => vboiler(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic horizontal steam drum on saddles',
    desc: (v) => `Horizontal steam drum, ${v.dia} in diameter by ${v.len} in long, on a fixed and a sliding saddle: dished heads, a manway, three flanged top nozzles, two relief valves, downcomer stubs and a level gauge column.`,
    vs: [[36, 120], [54, 180], [72, 260]].map(([dia, len]) => [`${dia} in diameter, ${len} in long`, R1(len + dia * 0.4 + 3.2), dia + 12, dia + 36, 0, { dia, len }]),
    build: (a, v) => drum(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic oil-filled power transformer',
    desc: (v) => `Oil-filled substation power transformer of ${v.mva} MVA class on a wheeled base: ribbed tank, three tall and three short bushings, conservator with sight gauge, a control cabinet and a radiator bank with header pipes.`,
    vs: [[5, 150, 90, 140], [10, 190, 110, 165], [25, 250, 140, 200], [60, 330, 180, 250]].map(([mva, w, d, h]) => [`${mva} MVA, ${w} in long`, w, d, h, 0, { mva }]),
    build: (a, v) => ptx(a, v) }),
  fam({ cat: 'energy/generation', title: 'Generic steam turbine generator set',
    desc: (v) => `Steam turbine generator set of ${v.mw} MW class on a base frame: turbine casing with a flanged steam inlet, stop valve with handwheel and exhaust flange, reduction gearbox, cooled generator with terminal box and a lube-oil console.`,
    vs: [[2, 240, 90, 110], [8, 360, 120, 150]].map(([mw, w, d, h]) => [`${mw} MW, ${w} in long`, w, d, h, 0, { mw }]),
    build: (a, v) => steamset(a, v) }),
  // ===================================================== renewable =====================================================
  fam({ cat: 'energy/renewable', title: 'Generic ground-mount solar array rack',
    desc: (v) => `Fixed-tilt ground-mount solar array, ${v.nr} rows by ${v.nx} modules, tilted 25 degrees to the front: framed modules with cell areas on rafters, piles with base plates, braces and a torque tube.`,
    vs: [[2, 4, 178, 147, 102], [2, 8, 342, 147, 102], [3, 6, 260, 218, 134], [4, 10, 424, 290, 168]].map(([nr, nx, w, d, h]) => [`${nr} high by ${nx} wide`, w, d, h, 0, { nr, nx }]),
    build: (a, v) => solarRack(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic solar parking canopy',
    desc: (v) => `Solar parking canopy over ${v.bays} spaces: steel columns with base plates, rafters and purlins carrying two rows of modules per space on a monopitch roof, lights under the roof and a wheel stop per space.`,
    vs: [[4, 2], [6, 3]].map(([n, s]) => [`${n} spaces`, n * 108 + 40, 216, 150, 0, { bays: n, span: s }]),
    build: (a, v) => solarCarport(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic horizontal-axis wind turbine',
    desc: (v) => `Three-blade horizontal-axis wind turbine on a tapered tower, ${v.hub} ft to the hub with a ${v.dia} ft rotor: flanged tower sections with a base door, yaw ring, nacelle with vents and anemometer, spinner and tapered blades${v.tail ? ' and a tail vane' : ''}.`,
    vs: [windRow('5 kW class, 60 ft hub', 60, 18, true), windRow('50 kW class, 100 ft hub', 100, 50, false), windRow('500 kW class, 160 ft hub', 160, 130, false), windRow('1.5 MW class, 260 ft hub', 262, 253, false), windRow('3 MW class, 330 ft hub', 330, 340, false)],
    build: (a, v) => windTurbine(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic vertical-axis wind turbine',
    desc: (v) => `Vertical-axis wind turbine with a ${v.dia} ft rotor on a mast: three vertical aerofoil blades each held by two struts, with a base cabinet.`,
    vs: [[6, 96, 120], [12, 180, 228]].map(([dia, w, h]) => [`${dia} ft rotor`, w, w, h, 0, { dia }]),
    build: (a, v) => vawt(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic battery storage container',
    desc: (v) => `Battery storage enclosure of container size, ${v.len} ft long: corrugated walls with corner castings, ${v.hvac} wall-mounted cooling unit${v.hvac > 1 ? 's' : ''} with fan grilles, a personnel door with handle, end louvres and a lamp.`,
    vs: [['10 ft', 120, 106, 102, 0, { len: 10, hvac: 1 }], ['20 ft', 240, 106, 102, 0, { len: 20, hvac: 2 }], ['40 ft high-cube', 480, 106, 114, 0, { len: 40, hvac: 4 }]],
    build: (a, v) => battContainer(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic residential battery cabinet',
    desc: (v) => `Home battery cabinet with ${v.mods} stacked module front${v.mods > 1 ? 's' : ''}, handles, a status display and lamp, ${v.floor ? 'floor feet' : 'a wall bracket'} and cable entries at the base.`,
    vs: [['wall mounted, 1 module', 24, 8, 36, 12, { mods: 1, floor: false }], ['floor standing, 3 modules', 26, 14, 60, 0, { mods: 3, floor: true }]],
    build: (a, v) => homeBattery(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic solar string inverter',
    desc: 'Wall-mounted solar string inverter with a finned back, a front cover with display and indicator lights, a rotary DC disconnect on the side and four conduit entries underneath.',
    vs: [['residential, 18 in', 18, 9, 24, 48], ['commercial, 28 in', 28, 11, 34, 48]],
    build: (a, v) => stringInverter(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic electric vehicle charging canopy',
    desc: (v) => `Vehicle charging canopy over ${v.bays} bays: a flat steel roof on columns, a charger post with screen, holster and drooping cable at the head of each bay, wheel stops and bay lines.`,
    vs: [2, 4, 6].map((n) => [`${n} bays`, n * 108 + 20, 288, 190, 0, { bays: n }]),
    build: (a, v) => evHub(a, v) }),
  fam({ cat: 'energy/renewable', title: 'Generic hydro power intake',
    desc: 'Run-of-river intake structure: base slab, two concrete piers and a deck, a sloped trash rack with bars and rails, a gate frame and slide, a hoist gantry with winch and the penstock stub with its flange.',
    vs: [['240 in wide', 240, 168, 200], ['360 in wide', 360, 216, 260]],
    build: (a, v) => hydroIntake(a, v) }),
  // ===================================================== distribution =====================================================
  fam({ cat: 'energy/distribution', title: 'Generic lattice transmission tower',
    desc: (v) => `Four-legged lattice steel tower with ${v.panels} braced panels, ${v.tiers} pair${v.tiers > 1 ? 's' : ''} of crossarms carrying insulator strings, ring ties and an earth-wire peak.`,
    vs: [['66 kV class, 70 ft', 220, 150, 840, 0, { tiers: 1, panels: 6 }], ['132 kV class, 90 ft', 300, 190, 1080, 0, { tiers: 3, panels: 8 }], ['220 kV class, 115 ft', 380, 240, 1380, 0, { tiers: 3, panels: 10 }], ['400 kV class, 150 ft', 520, 300, 1800, 0, { tiers: 3, panels: 12 }], ['400 kV class, 190 ft, two tiers', 600, 360, 2280, 0, { tiers: 2, panels: 14 }]],
    build: (a, v) => lattice(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic wood utility pole',
    desc: (v) => `Tapered wood utility pole with a ground wire and steps, ${v.three ? 'a braced three-pin crossarm' : 'a short crossarm'} with pin insulators${v.xfmr ? ' and a pole-top transformer can with bushing' : ''}.`,
    vs: [['35 ft, single phase', 40, 18, 420, 0, { arm: 40, three: false, xfmr: 0 }], ['40 ft, single phase with transformer', 66, 18, 480, 0, { arm: 48, three: false, xfmr: 7 }], ['45 ft, three-phase crossarm', 96, 18, 540, 0, { arm: 96, three: true, xfmr: 0 }], ['55 ft, three-phase with transformer', 120, 20, 660, 0, { arm: 120, three: true, xfmr: 8 }]],
    build: (a, v) => pole(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic pad-mounted distribution transformer',
    desc: 'Pad-mounted transformer cabinet on a base with two front compartments, hinged doors with pentagon bolts and handles, a nameplate and a sloped lid.',
    vs: [['75 kVA class, 40 in', 40, 36, 40], ['300 kVA class, 60 in', 60, 58, 48], ['750 kVA class, 76 in', 76, 66, 60], ['2500 kVA class, 108 in', 108, 84, 75]],
    build: (a, v) => padXfmr(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic medium-voltage switchgear lineup',
    desc: (v) => `Metal-clad switchgear lineup of ${v.sec} sections on a base channel, each with a window door, racking handle, lower door, relay compartment with dials and a roof relief flap.`,
    vs: [[2, 72], [3, 108], [4, 144], [6, 216]].map(([n, w]) => [`${n} sections, ${w} in`, w, 96, 95, 0, { sec: n }]),
    build: (a, v) => switchgear(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic cable drum',
    desc: (v) => `Timber-style cable drum, ${v.dia} in flange diameter: two flange discs with arbor hole and tie bolts, a barrel with layered cable winding and the cable end tail.`,
    vs: [[36, 24], [60, 36], [84, 50]].map(([dia, w]) => [`${dia} in flange, ${w} in wide`, w, dia, dia, 0, { dia }]),
    build: (a, v) => cableDrum(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic meter board',
    desc: (v) => `Meter board with ${v.n} meter bases, each with a glass dome, dial window and sealing ring, a main breaker and terminal covers.`,
    vs: [[2, 2, 26, 7, 24], [4, 2, 30, 7, 40], [6, 3, 44, 7, 40]].map(([n, c, w, d, h]) => [`${n} meters`, w, d, h, 36, { n, cols: c }]),
    build: (a, v) => meterBoard(a, v) }),
  fam({ cat: 'energy/distribution', title: 'Generic air-break disconnect switch',
    desc: 'Three-pole air-break disconnect switch on a steel base: three pedestals each with two insulator stacks and a switch blade, top terminals, an operating rod and a hand wheel.',
    vs: [['120 in wide', 120, 40, 130], ['168 in wide', 168, 48, 160]],
    build: (a, v) => disconnect(a, v) }),
  // ===================================================== oil and gas =====================================================
  fam({ cat: 'energy/oilgas', title: 'Generic wellhead production tree',
    desc: (v) => `Wellhead production tree: casing and tubing spools with flanges, ${v.masters === 2 ? 'two master valves' : 'a master valve'}, a flow cross with two wing valves and handwheels${v.choke ? ', a choke body' : ''} and a swab valve with gauge and cap.`,
    vs: [['low pressure, single master', 60, 40, 56, 0, { masters: 1 }], ['medium pressure, two masters', 72, 44, 84, 0, { masters: 2 }], ['high pressure, two masters, choke', 84, 48, 96, 0, { masters: 2, choke: true }], ['high pressure, large bore', 96, 56, 110, 0, { masters: 2, choke: true }]],
    build: (a, v) => wellhead(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic beam pumping unit',
    desc: 'Beam pumping unit on a skid: A-frame post with bearing, tilted walking beam with horsehead and bridle, polished rod and wellhead stub, a gearbox with two crank counterweights and pitman arms, and an electric motor with belt guard.',
    vs: [['small, 20 ft long', 240, 64, 190], ['medium, 25 ft long', 300, 76, 240], ['large, 30 ft long', 360, 90, 290], ['extra large, 37 ft long', 440, 100, 350]],
    build: (a, v) => pumpjack(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic horizontal production separator',
    desc: (v) => `Horizontal separator vessel, ${v.dia} in diameter, on a skid with saddles: dished heads, manway, flanged inlet, gas outlet and liquid outlet, drain, relief valve, gauge and a level gauge column.`,
    vs: [[36, 198, 86], [48, 264, 98], [60, 330, 114], [72, 396, 131]].map(([dia, w, h]) => [`${dia} in by ${(w - dia * 0.5 - 60) / 12 | 0} ft`, w, dia + 12, h, 0, { dia }]),
    build: (a, v) => separator(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic fixed-roof storage tank',
    desc: (v) => `Vertical storage tank, ${v.dia} ft diameter with a ${v.shell} ft shell: base ring, banded shell, cone roof with gauge hatch and vent, shell manway, a flanged nozzle and a spiral stair with handrail.`,
    vs: [[12, 16, 238], [15, 20, 290], [21, 24, 347], [30, 24, 361]].map(([dia, sh, h]) => [`${dia} ft diameter, ${sh} ft shell`, dia * 12 + 66, dia * 12 + 66, h, 0, { dia, shell: sh }]),
    build: (a, v) => tankFixed(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic pipeline pig launcher',
    desc: (v) => `Pig launcher for ${v.nps} in line pipe: a large barrel with a hinged quick-opening closure and bolt ring, an eccentric reducer and neck with end flange, kicker connection with valve and handwheel, vent, gauge, drain and three saddle supports.`,
    vs: [[6, 192, 36, 40], [12, 264, 56, 66], [20, 360, 80, 90]].map(([n, w, d, h]) => [`${n} in line, ${w / 12} ft`, w, d, h, 0, { nps: n }]),
    build: (a, v) => pigLauncher(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic flare stack',
    desc: (v) => `Self-supporting flare stack, ${v.dia} in diameter at the base: tapering stack with flanged joints, a caged ladder, a top platform with railing, a tip with windshield ring and a pilot line, on a base plate.`,
    vs: [[12, 40, 480, 40], [24, 60, 720, 64], [36, 90, 1080, 96]].map(([dia, ft, h, w]) => [`${ft} ft tall, ${dia} in`, w, w, h, 0, { dia }]),
    build: (a, v) => flareStack(a, v) }),
  fam({ cat: 'energy/oilgas', title: 'Generic oilfield heater treater skid',
    desc: (v) => `Heater treater skid: a ${v.dia} in horizontal vessel on saddles with a fire-tube housing and stack, a flanged gas outlet, gauge, a vertical scrubber with its connecting line and a control panel on a post.`,
    vs: [[36, 216, 84, 156], [48, 264, 96, 186], [60, 312, 108, 216]].map(([dia, w, d, h]) => [`${dia} in vessel, ${w / 12} ft skid`, w, d, h, 0, { dia }]),
    build: (a, v) => heaterTreater(a, v) }),
];
export default FAMS;

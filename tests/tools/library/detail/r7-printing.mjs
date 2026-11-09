/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, printing: more printer types (cantilever, polar, dual carriage, belt, tool changer, SLS, concrete, wash and cure, filament maker), printed parts, shop fixtures and calibration prints. Original geometry; generic shapes, no maker or model. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, TAU = m.PI * 2;
const mm = (n) => n / IN;

// ------------------------------------------------------------------------------------------ helpers (copied from round 6)
const MAP = { z: (u, v, w) => [u, v, w], y: (u, v, w) => [u, w, v], x: (u, v, w) => [w, u, v] };
/** a ring (or arc ring, or disc with ri = 0) about an axis, centred at (c1, c2), between axial positions l0 and l1 */
function ring(a, ax, c1, c2, l0, l1, ri, ro, seg = 12, a0 = 0, a1 = TAU) {
  const M = MAP[ax], full = m.abs(a1 - a0 - TAU) < 1e-6, n = full ? seg : m.max(2, m.ceil((seg * (a1 - a0)) / TAU));
  const P = (r, k, w) => { const t = a0 + ((a1 - a0) * k) / n; return M(c1 + r * m.cos(t), c2 + r * m.sin(t), w); };
  for (let k = 0; k < n; k++) {
    a.t.push([P(ro, k, l0), P(ro, k + 1, l0), P(ro, k + 1, l1)], [P(ro, k, l0), P(ro, k + 1, l1), P(ro, k, l1)]);
    if (ri > 0) a.t.push([P(ri, k, l0), P(ri, k + 1, l1), P(ri, k + 1, l0)], [P(ri, k, l0), P(ri, k, l1), P(ri, k + 1, l1)]);
    a.t.push([P(ri, k, l1), P(ro, k, l1), P(ro, k + 1, l1)], [P(ri, k, l1), P(ro, k + 1, l1), P(ri, k + 1, l1)]);
    a.t.push([P(ri, k, l0), P(ro, k + 1, l0), P(ro, k, l0)], [P(ri, k, l0), P(ri, k + 1, l0), P(ro, k + 1, l0)]);
  }
  if (!full) for (const k of [0, n]) a.t.push([P(ri, k, l0), P(ro, k, l0), P(ro, k, l1)], [P(ri, k, l0), P(ro, k, l1), P(ri, k, l1)]);
}
/** a plate (u0..u1, v0..v1, thickness w0..w1) with round holes */
function plateH(a, ax, u0, v0, u1, v1, w0, w1, holes = [], seg = 10) {
  const M = MAP[ax];
  const box = (p0, q0, r0, p1, q1, r1) => { const A = M(p0, q0, r0), C = M(p1, q1, r1); a.box(m.min(A[0], C[0]), m.min(A[1], C[1]), m.min(A[2], C[2]), m.max(A[0], C[0]), m.max(A[1], C[1]), m.max(A[2], C[2])); };
  const hs = holes.map((h) => ({ ...h, s: h.r * 1.15 }));
  const us = [u0, u1]; for (const h of hs) us.push(h.u - h.s, h.u + h.s);
  us.sort((p, q) => p - q);
  for (let i = 0; i < us.length - 1; i++) {
    const ua = us[i], ub = us[i + 1]; if (ub - ua < 0.01) continue;
    const um = (ua + ub) / 2, cov = hs.filter((h) => um > h.u - h.s && um < h.u + h.s).sort((p, q) => p.v - q.v);
    let v = v0;
    for (const h of cov) { if (h.v - h.s > v) box(ua, v, w0, ub, h.v - h.s, w1); v = h.v + h.s; }
    if (v1 > v) box(ua, v, w0, ub, v1, w1);
  }
  for (const h of hs) ring(a, ax, h.u, h.v, w0, w1, h.r, h.s * 1.45, seg);
}
const hole = (u, v, r) => ({ u, v, r });
/** extrude a convex polygon [x, z] between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** extrude a convex polygon [y, z] between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
function spoolX(a, x, y, z, r, w) {
  ring(a, 'x', y, z, x - w / 2, x - w / 2 + 4, 0, r, 18); ring(a, 'x', y, z, x + w / 2 - 4, x + w / 2, 0, r, 18);
  ring(a, 'x', y, z, x - w / 2 + 4, x + w / 2 - 4, r * 0.38, r * 0.8, 16);
  a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL');
}
function spoolY(a, x, y0, y1, z, r) {
  ring(a, 'y', x, z, y0, y0 + 4, 0, r, 18); ring(a, 'y', x, z, y1 - 4, y1, 0, r, 18);
  ring(a, 'y', x, z, y0 + 4, y1 - 4, r * 0.38, r * 0.8, 16);
  a.circ(x, (y0 + y1) / 2, 0.01, 'EQUIP-DETAIL');
}
function spoolZ(a, x, y, z0, r, h) {
  ring(a, 'z', x, y, z0, z0 + 4, 0, r, 18); ring(a, 'z', x, y, z0 + h - 4, z0 + h, 0, r, 18);
  ring(a, 'z', x, y, z0 + 4, z0 + h - 4, r * 0.38, r * 0.8, 16);
  a.circ(x, y, r, 'EQUIP-DETAIL'); a.circ(x, y, r * 0.38, 'EQUIP-DETAIL');
}
/** a hot end hanging from z (top) at (x, y); nozzle tip at z - 142 s */
function hotend(a, x, y, z, s = 1) {
  a.box(x - 30 * s, y - 14 * s, z - 70 * s, x + 30 * s, y + 14 * s, z); a.box(x - 22 * s, y - 50 * s, z - 70 * s, x + 22 * s, y - 14 * s, z - 28 * s);
  a.cyl(x, y - 30 * s, z - 105 * s, z - 70 * s, 12 * s, 10); a.box(x - 12 * s, y - 42 * s, z - 125 * s, x + 12 * s, y - 18 * s, z - 105 * s);
  a.cone(x, y - 30 * s, z - 142 * s, z - 125 * s, 1.5 * s, 7 * s, 8);
  a.rect(x - 30 * s, y - 50 * s, x + 30 * s, y + 14 * s, 'EQUIP-DETAIL');
}
const ext = (a, x0, y0, z0, x1, y1, z1) => a.box(x0, y0, z0, x1, y1, z1);
/** an open hinged hood at the back (as in round 6) */
function openLid(a, x0, x1, hy, hz, depth, height, theta) {
  const th = (theta * m.PI) / 180, f = [-m.cos(th), m.sin(th)], u = [m.sin(th), m.cos(th)];
  const P = (al, up) => [hy + al * f[0] + up * u[0], hz + al * f[1] + up * u[1]];
  prismX(a, [P(0, 0), P(depth, 0), P(depth, height), P(0, height)], x0, x0 + 8);
  prismX(a, [P(0, 0), P(depth, 0), P(depth, height), P(0, height)], x1 - 8, x1);
  prismX(a, [P(0, height - 8), P(depth, height - 8), P(depth, height), P(0, height)], x0, x1);
  prismX(a, [P(depth - 8, 0), P(depth, 0), P(depth, height), P(depth - 8, height)], x0, x1);
}
/** a hexagonal solid prism about z */
function hexZ(a, cx, cy, z0, z1, r) { a.prism([0, 1, 2, 3, 4, 5].map((i) => [cx + r * m.cos((i * m.PI) / 3), cy + r * m.sin((i * m.PI) / 3)]), z0, z1); }
/** four feet at the corners */
function feet(a, inset, h, r) { const { X0, X1, YF, YB, Z0 } = a; for (const x of [X0 + inset, X1 - inset]) for (const y of [YF + inset, YB - inset]) a.cyl(x, y, Z0, Z0 + h, r, 8); }
/** a rotated rectangle (length l along angle g, width w) at (x, y) as a convex prism */
function bar(a, x, y, g, l0, l1, w, z0, z1) {
  const c = m.cos(g), s = m.sin(g), P = (l, k) => [x + l * c - k * s, y + l * s + k * c];
  a.prism([P(l0, -w / 2), P(l1, -w / 2), P(l1, w / 2), P(l0, w / 2)], z0, z1);
}

// ------------------------------------------------------------------------------------------ printers
function cantilever(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, bed = v.bed * IN, bt = 56, tow = m.min(W * 0.42, 150), tz = Z1 - 100, tdep = 76;
  a.outline();
  a.box(X0 + 6, YF + 6, Z0 + 8, X1 - 6, YB - 6, Z0 + bt);
  for (const sx of [-1, 1]) for (const y of [YF + 22, YB - 22]) a.cyl(cx + sx * (W / 2 - 22), y, Z0, Z0 + 8, 9, 8);
  a.box(X1 - 90, YF + 6, Z0 + 12, X1 - 24, YF + 14, Z0 + 46);
  const bw = m.min(bed, W - 50), bd = m.min(bed, D * 0.5), by0 = YF + 22, bz = Z0 + bt + 22;
  a.box(cx - bw / 2 - 6, by0, bz - 14, cx + bw / 2 + 6, by0 + bd + 12, bz); a.box(cx - bw / 2, by0 + 6, bz, cx + bw / 2, by0 + 6 + bd, bz + 6);
  for (const sx of [-1, 1]) a.ycyl(YF + 10, by0 + bd + 40, cx + sx * bw * 0.3, Z0 + bt + 8, 4.5, 8);
  a.rect(cx - bw / 2, by0 + 6, cx + bw / 2, by0 + 6 + bd, 'EQUIP-DETAIL');
  const ty0 = YB - 10 - tdep;
  a.box(cx - tow / 2, ty0, Z0 + bt, cx + tow / 2, YB - 10, tz);
  for (const sx of [-1, 1]) a.cyl(cx + sx * tow * 0.3, ty0 - 6, Z0 + bt, tz, 4.5, 8);
  const ah = Z0 + bt + 22 + 6 + 114 + 14, hy = by0 + 6 + bd / 2 + 30;
  a.box(cx - 30, hy - 14, ah, cx + 30, ty0, ah + 34); hotend(a, cx, hy, ah, 0.8);
  prismX(a, [[ty0, ah], [ty0, ah - 70], [ty0 - 80, ah]], cx - 5, cx + 5);
  const r = m.min(95, W * 0.22), ycs = YB - r - 6;
  a.box(cx - r, ycs - r, tz, cx + r, ycs + r, tz + 8);
  for (const sx of [-1, 1]) prismX(a, [[ty0, tz], [ty0, tz - 40], [ycs - r + 4, tz]], cx + sx * tow * 0.3 - 3, cx + sx * tow * 0.3 + 3);
  spoolZ(a, cx, ycs, tz + 8, r, 70);
  a.rect(cx - tow / 2, ty0, cx + tow / 2, YB - 10, 'EQUIP-DETAIL');
  a.log('Added the plinth with feet and a control box, the heated bed on a Y carriage with rods, a single rear tower with two Z rails, a cantilever arm with a hot end and rib, and a spool platform on top with a filament spool (plan and 3D).');
}

function polar(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, R = W / 2, cyc = YF + R, bedR = v.bed * IN / 2, ah = Z0 + 84 + 114 + 14, ttop = ah + 34 + 30, spR = m.min(95, W * 0.2);
  a.outline(); a.circ(cx, cyc, R, 'EQUIP-DETAIL'); a.circ(cx, cyc, bedR, 'EQUIP-DETAIL');
  ring(a, 'z', cx, cyc, Z0 + 8, Z0 + 70, 0, R - 6, 28);
  a.box(cx - W * 0.3, cyc + R * 0.5, Z0 + 8, cx + W * 0.3, YB, Z0 + 70);
  for (const g of [90, 210, 330]) { const t = (g * m.PI) / 180; a.cyl(cx + (R - 24) * m.cos(t), cyc + (R - 24) * m.sin(t), Z0, Z0 + 8, 10, 8); }
  for (const x of [cx - W * 0.25, cx + W * 0.25]) a.cyl(x, YB - 20, Z0, Z0 + 8, 10, 8);
  ring(a, 'z', cx, cyc, Z0 + 70, Z0 + 78, 0, bedR + 8, 28); ring(a, 'z', cx, cyc, Z0 + 78, Z0 + 84, 0, bedR, 28);
  for (let i = 0; i < 12; i++) { const t = (i * TAU) / 12, x = cx + (bedR + 8) * m.cos(t), y = cyc + (bedR + 8) * m.sin(t); a.box(x - 2, y - 2, Z0 + 70, x + 2, y + 2, Z0 + 78); }
  const ty0 = YB - 70;
  a.box(cx - 60, ty0, Z0 + 70, cx + 60, YB - 10, ttop);
  for (const sx of [-1, 1]) a.cyl(cx + sx * 36, ty0 - 4, Z0 + 70, ttop, 4.5, 8);
  a.box(cx - 30, cyc + 14, ah, cx + 30, ty0, ah + 34); hotend(a, cx, cyc + 30, ah, 0.8);
  prismX(a, [[ty0, ah], [ty0, ah - 60], [ty0 - 60, ah]], cx - 5, cx + 5);
  a.box(cx - spR, YB - 2 * spR - 4, ttop, cx + spR, YB - 4, ttop + 6); spoolZ(a, cx, YB - spR - 4, ttop + 6, spR, 70);
  a.rect(cx - 60, ty0, cx + 60, YB - 10, 'EQUIP-DETAIL');
  void X0; void X1; void Z1;
  a.log('Added the round plinth with a rear extension and feet, the turntable with a ribbed rim and round build plate, a rear tower with two Z rails, a radial arm with a hot end and rib, and a flat spool on a platform on top (plan and 3D).');
}

function idex(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, p = 24, spR = m.min(90, W * 0.17), zt = Z1 - 2 * spR - 30, bed = v.bed * IN, bw = m.min(bed, W - 2 * p - 60), gy = YF + D * 0.5;
  a.outline();
  for (const [x, y] of [[X0, YF], [X1 - p, YF], [X0, YB - p], [X1 - p, YB - p]]) ext(a, x, y, Z0 + 20, x + p, y + p, zt);
  for (const z of [Z0 + 20, zt - p]) { ext(a, X0, YF, z, X1, YF + p, z + p); ext(a, X0, YB - p, z, X1, YB, z + p); ext(a, X0, YF, z, X0 + p, YB, z + p); ext(a, X1 - p, YF, z, X1, YB, z + p); }
  a.box(X0 + 10, YF + 10, Z0 + 8, X1 - 10, YB - 10, Z0 + 20); feet(a, 16, 8, 9);
  const bz = zt - p - 12 - 138 - 8;
  a.box(cx - bw / 2 - 10, gy - bw / 2 - 10, bz - 16, cx + bw / 2 + 10, gy + bw / 2 + 10, bz - 6); a.box(cx - bw / 2, gy - bw / 2, bz - 6, cx + bw / 2, gy + bw / 2, bz);
  for (const sx of [-1, 1]) a.cyl(cx + sx * (W / 2 - 50), YB - 40, Z0 + 20, bz - 16, 5, 6);
  a.box(cx - bw * 0.4, YB - 50, Z0 + 20, cx + bw * 0.4, YB - 30, bz - 16);
  a.rect(cx - bw / 2, gy - bw / 2, cx + bw / 2, gy + bw / 2, 'EQUIP-DETAIL');
  for (const sx of [-1, 1]) a.ycyl(YF + p, YB - p, cx + sx * (W / 2 - 50), zt - p - 20, 5, 8);
  ext(a, X0 + p, gy - 10, zt - p - 32, X1 - p, gy + 10, zt - p - 12);
  for (const sx of [-1, 1]) { hotend(a, cx + sx * W * 0.16, gy - 10, zt - p - 12, 0.9); a.rect(cx + sx * W * 0.16 - 27, gy - 55, cx + sx * W * 0.16 + 27, gy + 3, 'EQUIP-DETAIL'); }
  a.rect(X0 + p, gy - 10, X1 - p, gy + 10, 'EQUIP-DETAIL');
  for (const sx of [-1, 1]) { const x = cx + sx * W * 0.3; for (const k of [-1, 1]) a.ycyl(YB - 90, YB - 14, x + k * spR * 0.55, zt + 8, 8, 8); spoolY(a, x, YB - 86, YB - 16, zt + 8 + spR * 0.8 + 6, spR); }
  a.log('Added the extrusion frame with feet, a heated bed on lead screws, two Y rods, an X bar carrying two independent hot ends, and two filament spools resting on roller pairs on top (plan and 3D).');
}

function changerUnit(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a, n = v.n, r = 95, pitch = (W - 20) / n, zr = Z0 + 49;
  a.outline();
  a.box(X0, YF, Z0 + 10, X1, YB, Z0 + 40); feet(a, 14, 10, 9);
  for (const sy of [-1, 1]) a.xcyl(X0 + 10, X1 - 10, cy + sy * r * 0.6, zr, 9, 10);
  a.box(X0, YF, Z0 + 40, X0 + 10, YB, Z1 - 26); a.box(X1 - 10, YF, Z0 + 40, X1, YB, Z1 - 26);
  for (let i = 0; i < n; i++) {
    const x = X0 + 10 + pitch * (i + 0.5);
    spoolX(a, x, cy, zr + 0.8 * r, r, m.min(70, pitch - 8));
    if (i) a.box(X0 + 10 + pitch * i - 2, YF + 20, Z0 + 40, X0 + 10 + pitch * i + 2, YB - 20, Z0 + 40 + r * 0.8);
    a.tube([[x, cy + r * 0.4, zr + 0.8 * r + r * 0.7], [x, YB - 14, Z1 - 16]], [3, 3], 6);
  }
  a.box(X0, YB - 22, Z1 - 26, X1, YB, Z1);
  for (let i = 0; i < n; i++) ring(a, 'y', X0 + 10 + pitch * (i + 0.5), Z1 - 13, YB - 22, YB - 12, 3, 8, 8);
  a.log('Added the base with feet, two long rollers under ' + n + ' filament spools on their sides, thin dividers, tubes up to a guide bar with one ring per spool, and two end plates (plan and 3D).');
}

function washCure(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, uw = (W - 30) / 2, bh = H * 0.5, t = 8, wx0 = X0 + 10, cx0 = X1 - 10 - uw;
  a.outline();
  // wash bin
  a.box(wx0, YF + 10, Z0, wx0 + uw, YB - 10, Z0 + 12);
  a.box(wx0, YF + 10, Z0 + 12, wx0 + uw, YF + 10 + t, Z0 + bh); a.box(wx0, YB - 10 - t, Z0 + 12, wx0 + uw, YB - 10, Z0 + bh);
  a.box(wx0, YF + 10 + t, Z0 + 12, wx0 + t, YB - 10 - t, Z0 + bh); a.box(wx0 + uw - t, YF + 10 + t, Z0 + 12, wx0 + uw, YB - 10 - t, Z0 + bh);
  const wc = wx0 + uw / 2, wy = cy;
  a.box(wc - 20, wy - 20, Z0 + 12, wc + 20, wy + 20, Z0 + 30); a.cyl(wc, wy, Z0 + 30, Z0 + 38, 18, 10);
  a.frame(wc - uw * 0.3, Z0 + 46, wc + uw * 0.3, Z0 + bh - 6, wy - (D - 40) * 0.3, wy - (D - 40) * 0.3 + 6, 8);
  a.box(wc - uw * 0.3, wy - (D - 40) * 0.3, Z0 + bh - 14, wc + uw * 0.3, wy + (D - 40) * 0.3, Z0 + bh - 6);
  a.xcyl(wc - uw * 0.3, wc + uw * 0.3, YF + 10 + t + 6, Z0 + bh + 18, 5, 8); a.box(wc - uw * 0.3, YF + 10 + t + 4, Z0 + bh - 6, wc - uw * 0.3 + 8, YF + 10 + t + 8, Z0 + bh + 18); a.box(wc + uw * 0.3 - 8, YF + 10 + t + 4, Z0 + bh - 6, wc + uw * 0.3, YF + 10 + t + 8, Z0 + bh + 18);
  a.rect(wx0, YF + 10, wx0 + uw, YB - 10, 'EQUIP-DETAIL'); a.circ(wc, wy, 18, 'EQUIP-DETAIL');
  // cure box with turntable and open hood
  const cc = cx0 + uw / 2;
  a.box(cx0, YF + 10, Z0, cx0 + uw, YB - 10, Z0 + bh);
  ring(a, 'z', cc, cy, Z0 + bh, Z0 + bh + 6, 0, uw * 0.34, 20); ring(a, 'z', cc, cy, Z0 + bh + 6, Z0 + bh + 9, uw * 0.1, uw * 0.2, 12);
  for (const sx of [-1, 1]) a.box(cc + sx * (uw / 2 - 16), YF + 30, Z0 + bh, cc + sx * (uw / 2 - 16) + 6, YB - 30, Z0 + bh + 40);
  a.box(cx0 + uw * 0.1, YF + 10, Z0 + bh * 0.3, cx0 + uw * 0.4, YF + 16, Z0 + bh * 0.7); a.cyl(cx0 + uw * 0.7, YF + 18, Z0 + bh * 0.5, Z0 + bh * 0.5 + 6, 14, 12);
  openLid(a, cx0 + 6, cx0 + uw - 6, YB - 10 - 30 - 22, Z0 + bh, H * 0.46, 22, 96);
  a.circ(cc, cy, uw * 0.34, 'EQUIP-DETAIL'); a.rect(cx0, YF + 10, cx0 + uw, YB - 10, 'EQUIP-DETAIL');
  a.log('Added a wash bin with a stirrer base, a hanging basket frame and handle, and a cure box with a turntable, two lamp strips, a front control and a hood opened on its rear hinge (plan and 3D).');
}

function slsPrinter(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, p = 30, base = 100, ch = H * 0.36, cz0 = Z0 + H * 0.42 + base * 0.3, t = 14, uw = W * 0.2;
  a.outline();
  for (const [x, y] of [[X0, YF], [X1 - p, YF], [X0, YB - p], [X1 - p, YB - p]]) { ext(a, x, y, Z0 + base, x + p, y + p, cz0); a.caster(x + p / 2, y + p / 2, base); }
  for (const z of [Z0 + base, cz0 - p]) { ext(a, X0, YF, z, X1, YF + p, z + p); ext(a, X0, YB - p, z, X1, YB, z + p); ext(a, X0, YF, z, X0 + p, YB, z + p); ext(a, X1 - p, YF, z, X1, YB, z + p); }
  a.box(X0 + p, YB - 6, Z0 + base + p, X1 - p, YB, cz0 - p);
  for (const s of [-1, 1]) { const x0 = s < 0 ? X0 + p : cx + 2, x1 = s < 0 ? cx - 2 : X1 - p; a.frame(x0, Z0 + base + p, x1, cz0 - p, YF - 2, YF + 8, 22); a.box(cx + s * 24 - 5, YF - 18, (Z0 + base + cz0) / 2 - 50, cx + s * 24 + 5, YF - 2, (Z0 + base + cz0) / 2 + 50); }
  // process chamber with its front open
  a.box(X0, YF, cz0, X1, YB, cz0 + t); a.box(X0, YB - t, cz0 + t, X1, YB, cz0 + ch); a.box(X0, YF, cz0 + t, X0 + t, YB - t, cz0 + ch); a.box(X1 - t, YF, cz0 + t, X1, YB - t, cz0 + ch);
  a.box(X0, YF, cz0 + ch, X1, YB, cz0 + ch + t);
  a.frame(X0 + t, cz0 + t, X1 - t, cz0 + ch, YF, YF + 8, 10);
  for (const s of [-1, 1]) { const x = cx + s * uw * 1.1; ring(a, 'z', x, cy, cz0 + t, cz0 + t + 30, uw * 0.78, uw, 20); a.cyl(x, cy, cz0 + t, cz0 + t + 22, uw * 0.78, 20); a.circ(x, cy, uw, 'EQUIP-DETAIL'); }
  a.xcyl(X0 + t, X1 - t, cy + uw * 0.15, cz0 + t + 44, 9, 10);
  a.box(cx - uw * 0.9, cy - uw * 0.5, cz0 + ch - 12, cx + uw * 0.9, cy + uw * 0.5, cz0 + ch);
  // laser head on the roof
  a.box(cx - uw * 1.4, YB - D * 0.62, cz0 + ch + t, cx + uw * 1.4, YB - D * 0.14, cz0 + ch + t + (Z1 - cz0 - ch - t) * 0.7); a.cyl(cx, YB - D * 0.38, cz0 + ch + t + (Z1 - cz0 - ch - t) * 0.7, Z1, uw * 0.35, 14);
  a.box(X1 - 140, YF - 6, Z0 + base + p + 30, X1 - p - 20, YF + 2, Z0 + base + p + 100);
  a.rect(X0 + t, YF, X1 - t, YB - t, 'EQUIP-DETAIL'); a.rect(cx - uw * 1.4, YB - D * 0.62, cx + uw * 1.4, YB - D * 0.14, 'EQUIP-DETAIL');
  a.log('Added a frame on casters with two framed doors and handles, a process chamber with its front open showing the feed and build wells, a recoater roller and heater bar, and a laser head on the roof (plan and 3D).');
}

function concretePrinter(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, c = 100, ztip = Z0 + H * 0.5, zb = ztip + 170, ztop = zb + 110, ch = 60, ro = m.min(W, D) * 0.2, n = m.floor((ztip - 10 - Z0 - 60) / ch), hx = cx + ro * 0.8;
  a.outline();
  for (const [x, y] of [[X0, YF], [X1 - c, YF], [X0, YB - c], [X1 - c, YB - c]]) { ext(a, x, y, Z0 + 60, x + c, y + c, ztop); a.box(x - 20, y - 20 < YF ? YF : y - 20, Z0, x + c + 20 > X1 ? X1 : x + c + 20, y + c + 20 > YB ? YB : y + c + 20, Z0 + 60); }
  ext(a, X0, YF, Z0 + 60, X0 + c, YB, Z0 + 110); ext(a, X1 - c, YF, Z0 + 60, X1, YB, Z0 + 110);
  ext(a, X0, YF, ztop - 110, X0 + c, YB, ztop); ext(a, X1 - c, YF, ztop - 110, X1, YB, ztop);
  ext(a, X0, cy - 70, zb, X1, cy + 70, ztop - 20);
  for (let k = 0; k < n; k++) ring(a, 'z', cx - ro * 0.8, cy, Z0 + 60 + k * ch, Z0 + 60 + (k + 1) * ch - 2, ro - 60, ro, 24);
  a.circ(cx - ro * 0.8, cy, ro, 'EQUIP'); a.circ(cx - ro * 0.8, cy, ro - 60, 'EQUIP-DETAIL');
  const hxp = cx - ro * 0.8 + ro;
  a.box(hxp - 70, cy - 90, zb - 60, hxp + 70, cy + 90, zb); a.cyl(hxp, cy, ztip + 30, zb - 60, 22, 10); a.cone(hxp, cy, ztip, ztip + 30, 9, 22, 10); a.circ(hxp, cy, 22, 'EQUIP-DETAIL');
  a.rect(hxp - 70, cy - 90, hxp + 70, cy + 90, 'EQUIP-DETAIL');
  // pump skid with a hopper and a hose to the head
  const px = X1 - c - 380, py = YF + 40;
  a.box(px, py, Z0 + 60, px + 340, py + 220, Z0 + 150); a.box(px + 20, py + 20, Z0 + 150, px + 200, py + 200, Z0 + 330);
  a.cone(px + 110, py + 110, Z0 + 330, Z0 + 520, 40, 160, 14); a.cyl(px + 270, py + 110, Z0 + 150, Z0 + 260, 50, 12);
  a.tube([[px + 270, py + 110, Z0 + 260], [px + 270, cy - 40, zb + 40], [hxp, cy - 40, zb + 40], [hxp, cy, zb - 60]], [14, 14, 14, 14], 8);
  a.rect(px, py, px + 340, py + 220, 'EQUIP-DETAIL');
  a.log('Added four columns on foot plates with side beams and top rails, a bridge across, a print head with a ram, nozzle and supply hose, a pump skid with a mixer hopper, and a round printed wall of ' + n + ' courses in the middle (plan and 3D).');
}

function beltPrinter(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, sp = 14, ya = YF + 10, yb = YB - 10, zA = Z0 + H * 0.2, zB = Z0 + H * 0.74, zl = (y) => zA + ((y - ya) * (zB - zA)) / (yb - ya);
  a.outline();
  for (const [x0, x1] of [[X0, X0 + sp], [X1 - sp, X1]]) prismX(a, [[ya, Z0 + 12], [yb, Z0 + 12], [yb, zB], [ya, zA]], x0, x1);
  feet(a, 22, 12, 9);
  a.box(X0 + sp, ya, Z0 + 12, X1 - sp, ya + 30, Z0 + 12 + (zA - Z0) * 0.7); a.box(X0 + sp, yb - 40, Z0 + 12, X1 - sp, yb, zB - 50);
  const y0 = ya + 40, y1 = yb - 40;
  prismX(a, [[y0, zl(y0) - 40], [y1, zl(y1) - 40], [y1, zl(y1) - 46], [y0, zl(y0) - 46]], X0 + sp + 4, X1 - sp - 4);
  for (const y of [y0, y1]) a.xcyl(X0 + sp, X1 - sp, y, zl(y) - 43 - 2, 11, 10);
  for (let k = 1; k < 5; k++) { const y = y0 + ((y1 - y0) * k) / 5; a.box(X0 + sp + 4, y - 1.5, zl(y) - 40, X1 - sp - 4, y + 1.5, zl(y) - 39); }
  const ym = (y0 + y1) / 2 + 20, gz = zl(ym) + 176;
  for (const [x0, x1] of [[X0, X0 + sp], [X1 - sp, X1]]) ext(a, x0, ym - 14, zl(ym), x1, ym + 14, gz);
  ext(a, X0, ym - 14, gz - 24, X1, ym + 14, gz); hotend(a, cx + W * 0.1, ym, gz - 24, 0.8);
  const px0 = cx - 30, py0 = ym - 40;
  prismX(a, [[py0, zl(py0) - 40], [py0 + 50, zl(py0 + 50) - 40], [py0 + 50, zl(py0 + 50) - 40 + 26], [py0, zl(py0) - 40 + 26]], px0, px0 + 60);
  a.box(X0 + sp, ya - 6 < YF ? YF : ya - 6, Z0 + 20, X0 + sp + 70, ya + 4, Z0 + 20 + 50);
  a.rect(X0 + sp + 4, y0, X1 - sp - 4, y1, 'EQUIP-DETAIL'); a.rect(cx + W * 0.1 - 24, ym - 40, cx + W * 0.1 + 24, ym + 11, 'EQUIP-DETAIL');
  void Z1; void D;
  a.log('Added two sloped side plates on feet, a long inclined belt bed with two end rollers and cross marks, a gantry across the belt with a hot end, a printed block lying on the belt and a small control box (plan and 3D).');
}

function toolChanger(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, p = 22, zt = Z1 - 20, bw = W * 0.5, n = v.n, gy = YF + D * 0.4;
  a.outline();
  for (const [x, y] of [[X0, YF], [X1 - p, YF], [X0, YB - p], [X1 - p, YB - p]]) ext(a, x, y, Z0 + 14, x + p, y + p, zt);
  for (const z of [Z0 + 14, zt - p]) { ext(a, X0, YF, z, X1, YF + p, z + p); ext(a, X0, YB - p, z, X1, YB, z + p); ext(a, X0, YF, z, X0 + p, YB, z + p); ext(a, X1 - p, YF, z, X1, YB, z + p); }
  feet(a, 14, 14, 10);
  const bz = zt - p - 12 - 138 - 10;
  a.box(cx - bw / 2 - 10, YF + D * 0.2 - 10, bz - 16, cx + bw / 2 + 10, YF + D * 0.2 + bw * 0.9 + 10, bz - 6); a.box(cx - bw / 2, YF + D * 0.2, bz - 6, cx + bw / 2, YF + D * 0.2 + bw * 0.9, bz);
  for (const sx of [-1, 1]) a.cyl(cx + sx * (W / 2 - 50), YB - 55, Z0 + 14, bz - 16, 5, 6);
  for (const sx of [-1, 1]) a.ycyl(YF + p, YB - p, cx + sx * (W / 2 - 40), zt - p - 20, 5, 8);
  ext(a, X0 + p, gy - 10, zt - p - 32, X1 - p, gy + 10, zt - p - 12); hotend(a, cx - W * 0.1, gy - 10, zt - p - 12, 0.9);
  a.rect(X0 + p, gy - 10, X1 - p, gy + 10, 'EQUIP-DETAIL');
  // dock bar at the back holding parked heads
  const dw = (W - 2 * p - 20) / n, dz = zt - p - 12;
  ext(a, X0 + p, YB - p - 30, dz, X1 - p, YB - p, dz + 22);
  for (let i = 0; i < n; i++) {
    const x = X0 + p + 10 + dw * (i + 0.5); if (i === 1 && n > 2) { a.rect(x - 18, YB - p - 56, x + 18, YB - p - 30, 'EQUIP-HIDDEN'); continue; }
    a.box(x - 18, YB - p - 56, dz - 70, x + 18, YB - p - 26, dz); a.cyl(x, YB - p - 41, dz - 100, dz - 70, 9, 8); a.cone(x, YB - p - 41, dz - 118, dz - 100, 1.5, 6, 8); a.rect(x - 18, YB - p - 56, x + 18, YB - p - 26, 'EQUIP-DETAIL');
  }
  a.log('Added the extrusion frame with feet, a heated bed on lead screws, a gantry with one active hot end and a dock bar at the back with ' + (n > 2 ? n - 1 : n) + ' parked tool heads' + (n > 2 ? ' and one empty dock' : '') + ' (plan and 3D).');
}

function filamentMaker(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, bh = 90, zb = Z0 + bh + 55, mw = W * 0.13, bx0 = X0 + mw, bx1 = X0 + W * 0.4, spR = m.min(95, D * 0.3);
  a.outline();
  a.box(X0, YF, Z0 + 10, X1, YB, Z0 + bh); feet(a, 16, 10, 10);
  a.box(X0 + 10, cy - 70, Z0 + bh, X0 + mw, cy + 70, zb + 70); a.xcyl(X0 + mw, bx0 + 20, cy, zb, 30, 12);
  a.xcyl(bx0 + 20, bx1, cy, zb, 22, 12);
  for (let k = 0; k < 4; k++) { const x = bx0 + 60 + ((bx1 - bx0 - 90) * k) / 3; ring(a, 'x', cy, zb, x, x + 28, 22, 30, 12); }
  const hxp = bx0 + 70;
  a.cyl(hxp, cy, zb + 22, zb + 60, 16, 10); a.cone(hxp, cy, zb + 60, Z1 - 20, 16, 56, 14); ring(a, 'z', hxp, cy, Z1 - 20, Z1, 50, 60, 14);
  a.box(bx1, cy - 36, zb - 36, bx1 + W * 0.04, cy + 36, zb + 36); a.xcyl(bx1 + W * 0.04, X0 + W * 0.7, cy, zb, 5, 8);
  const tx0 = X0 + W * 0.46, tx1 = X0 + W * 0.66;
  a.box(tx0, cy - 60, Z0 + bh, tx1, cy + 60, Z0 + bh + 16); a.box(tx0, cy - 60, Z0 + bh + 16, tx1, cy - 52, zb + 16); a.box(tx0, cy + 52, Z0 + bh + 16, tx1, cy + 60, zb + 16);
  a.box(tx0, cy - 52, Z0 + bh + 16, tx0 + 8, cy + 52, zb + 16); a.box(tx1 - 8, cy - 52, Z0 + bh + 16, tx1, cy + 52, zb + 16);
  const px = X0 + W * 0.69;
  a.box(px, cy - 40, zb - 60, px + W * 0.05, cy + 40, zb + 60); a.xcyl(px - 2, px + W * 0.05 + 2, cy - 22, zb + 22, 16, 12);
  spoolY(a, X1 - spR - 6, cy - 35, cy + 35, zb + 60 > Z1 - spR ? Z1 - spR - 4 : zb + 60, spR); a.box(X1 - spR - 16, cy - 8, Z0 + bh, X1 - spR, cy + 8, zb + 60 > Z1 - spR ? Z1 - spR - 4 : zb + 60);
  a.rect(X0 + 10, cy - 70, X0 + mw, cy + 70, 'EQUIP-DETAIL'); a.rect(tx0, cy - 60, tx1, cy + 60, 'EQUIP-DETAIL'); a.circ(hxp, cy, 56, 'EQUIP-DETAIL'); a.circ(X1 - spR - 6, cy, spR, 'EQUIP-DETAIL');
  a.log('Added a bench base on feet, a motor and gearbox, a barrel with four heater bands and a feed hopper, a die block, a cooling trough with an open top, a puller with two rollers and a winding spool (plan and 3D).');
}

function printCart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, p = 22, base = 70, n = v.shelves, zs = Array.from({ length: n }, (_, i) => Z0 + base + ((H * 0.55 - base) * (i + 1)) / n);
  a.outline();
  for (const [x, y] of [[X0 + 6, YF + 6], [X1 - 6 - p, YF + 6], [X0 + 6, YB - 6 - p], [X1 - 6 - p, YB - 6 - p]]) { ext(a, x, y, Z0 + base, x + p, y + p, Z0 + H * 0.55); a.caster(x + p / 2, y + p / 2, base); }
  for (const z of zs) { a.box(X0 + 6, YF + 6, z, X1 - 6, YB - 6, z + 10); a.box(X0 + 6, YF + 6, z + 10, X1 - 6, YF + 12, z + 24); a.box(X0 + 6, YB - 12, z + 10, X1 - 6, YB - 6, z + 24); }
  if (v.drawer) { const z = zs[0] - 90; a.box(X0 + 12, YF + 6, z, X1 - 12, YB - 6, zs[0]); a.box(cx - 50, YF - 0, z + 20, cx + 50, YF + 6, z + 30); }
  const tz = zs[n - 1] + 10;
  a.tube([[X0 + 18, YB - 14, Z0 + H * 0.55], [X0 + 18, YB - 14, Z1 - 20], [X1 - 18, YB - 14, Z1 - 20], [X1 - 18, YB - 14, Z0 + H * 0.55]], [8, 8, 8, 8], 8);
  const pw = (W - 60) * 0.7;
  a.box(cx - pw / 2, YF + 40, tz, cx + pw / 2, YB - 60, tz + 14);
  for (const sx of [-1, 1]) ext(a, cx + sx * (pw / 2 - 12) - 10, YB - 90, tz + 14, cx + sx * (pw / 2 - 12) + 10, YB - 70, Z0 + H * 0.82 > Z1 - 30 ? Z1 - 30 : Z0 + H * 0.82);
  ext(a, cx - pw / 2, YB - 90, Z0 + H * 0.78, cx + pw / 2, YB - 70, Z0 + H * 0.82); hotend(a, cx, YB - 80, Z0 + H * 0.8, 0.6);
  a.rect(cx - pw / 2, YF + 40, cx + pw / 2, YB - 60, 'EQUIP-DETAIL');
  a.log('Added four corner posts on casters, ' + n + ' lipped shelves' + (v.drawer ? ', a drawer under the lower shelf' : '') + ', a push handle loop and a small printer shape (bed, two uprights, X beam and hot end) on the top shelf (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ printed parts
function pulley(a, v) {
  const { Z0, Z1, W, cx, cy } = a, N = v.n, fr = W / 2, tr = fr - 2, bore = v.bore * IN / 2, bw = v.belt, fl = 1.2, hubR = m.min(tr * 0.7, bore + 3.5);
  a.circ(cx, cy, fr); a.circ(cx, cy, tr, 'EQUIP-DETAIL'); a.circ(cx, cy, bore, 'EQUIP-DETAIL');
  ring(a, 'z', cx, cy, Z0, Z0 + fl, bore, fr, m.min(40, N * 2));
  ring(a, 'z', cx, cy, Z0 + fl, Z0 + fl + bw, bore, tr - 0.9, m.min(40, N * 2));
  for (let i = 0; i < N; i++) {
    const g = (i / N) * TAU, c = m.cos(g), s = m.sin(g), wb = (TAU * (tr - 0.4)) / N * 0.55, wt = wb * 0.6, P = (r, w) => [cx + r * c - w * s, cy + r * s + w * c];
    a.prism([P(tr - 1, -wb / 2), P(tr - 1, wb / 2), P(tr, wt / 2), P(tr, -wt / 2)], Z0 + fl, Z0 + fl + bw);
  }
  ring(a, 'z', cx, cy, Z0 + fl + bw, Z0 + 2 * fl + bw, bore, fr, m.min(40, N * 2));
  ring(a, 'z', cx, cy, Z0 + 2 * fl + bw, Z1, bore, hubR, 16); a.circ(cx, cy, hubR, 'EQUIP-DETAIL');
  a.box(cx + hubR - 0.5, cy - 1.6, Z0 + 2 * fl + bw, cx + hubR + 2.6, cy + 1.6, Z1);
  a.log('Added two flanges, a toothed belt ring with ' + N + ' teeth, a bore, a hub collar and a set-screw boss (plan and 3D).');
}

function rodClamp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, zc = Z0 + H / 2, ro = H / 2, bore = v.rod * IN / 2, et = 3.2, hr = v.screw * IN / 2, ew = (W - 2 * ro) / 2;
  a.outline();
  ring(a, 'y', cx, zc, YF, YB, bore, ro, 20, 0.05, m.PI - 0.05); ring(a, 'y', cx, zc, YF, YB, bore, ro, 20, m.PI + 0.05, TAU - 0.05);
  plateH(a, 'z', X0, YF, cx - ro + 1, YB, zc + 0.4, zc + 0.4 + et, [hole(X0 + ew / 2, (YF + YB) / 2, hr)]); plateH(a, 'z', cx + ro - 1, YF, X1, YB, zc + 0.4, zc + 0.4 + et, [hole(X1 - ew / 2, (YF + YB) / 2, hr)]);
  plateH(a, 'z', X0, YF, cx - ro + 1, YB, zc - 0.4 - et, zc - 0.4, [hole(X0 + ew / 2, (YF + YB) / 2, hr)]); plateH(a, 'z', cx + ro - 1, YF, X1, YB, zc - 0.4 - et, zc - 0.4, [hole(X1 - ew / 2, (YF + YB) / 2, hr)]);
  for (const x of [X0 + ew / 2, X1 - ew / 2]) { ring(a, 'z', x, (YF + YB) / 2, zc + 0.4 + et, zc + 0.4 + et + 1.6, 0, hr * 1.7, 10); a.circ(x, (YF + YB) / 2, hr * 1.7, 'EQUIP-DETAIL'); a.circ(x, (YF + YB) / 2, hr, 'EQUIP-DETAIL'); }
  a.circ(cx, (YF + YB) / 2, bore, 'EQUIP-DETAIL'); a.line(X0, (YF + YB) / 2, X1, (YF + YB) / 2, 'EQUIP-HIDDEN'); a.line(cx - ro, YF, cx - ro, YB, 'EQUIP-DETAIL'); a.line(cx + ro, YF, cx + ro, YB, 'EQUIP-DETAIL');
  void Z1; void D;
  a.log('Added two half rings around a rod bore with a thin split between them and screw ears on both sides with holes and screw heads on top (plan and 3D).');
}

function spoolAdapter(a, v) {
  const { Z0, Z1, W, cx, cy } = a, ro = W / 2 - 4, bore = v.bore * IN / 2, rim = 2.2, fl = 1.8, n = 3;
  a.circ(cx, cy, W / 2); a.circ(cx, cy, ro, 'EQUIP-DETAIL'); a.circ(cx, cy, bore, 'EQUIP-DETAIL');
  ring(a, 'z', cx, cy, Z0, Z0 + fl, ro - rim, W / 2, 28);
  ring(a, 'z', cx, cy, Z0 + fl, Z1, ro - rim, ro, 28);
  ring(a, 'z', cx, cy, Z0, Z1, bore, bore + 4, 16);
  for (let i = 0; i < n; i++) { const g = (i / n) * TAU + 0.5; bar(a, cx, cy, g, bore + 3, ro - rim + 0.5, 3, Z0, Z1 - 3); a.line(cx + (bore + 4) * m.cos(g), cy + (bore + 4) * m.sin(g), cx + (ro - rim) * m.cos(g), cy + (ro - rim) * m.sin(g), 'EQUIP-DETAIL'); }
  a.log('Added a rim that fits a spool core with an outer lip, a centre ring with the axle bore and three spokes joining them (plan and 3D).');
}

function flangeMount(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, t = v.base * IN, br = v.bore * IN / 2, hr = v.screw * IN / 2;
  a.outline();
  const hs = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => hole(cx + sx * W * 0.37, cy + sy * D * 0.37, hr));
  plateH(a, 'z', X0, YF, X1, YB, Z0, Z0 + t, hs.concat([hole(cx, cy, br + 1.2)]));
  ring(a, 'z', cx, cy, Z0 + t, Z1, br, br + 6.5, 20); ring(a, 'z', cx, cy, Z0 + t, Z0 + t + (Z1 - Z0 - t) * 0.4, br, br + 11, 20);
  for (const h of hs) a.circ(h.u, h.v, hr, 'EQUIP-DETAIL');
  a.circ(cx, cy, br, 'EQUIP-DETAIL'); a.circ(cx, cy, br + 6.5, 'EQUIP-DETAIL');
  a.log('Added a square flange plate with four bolt holes, a raised collar with a bearing bore and a thicker root ring (plan and 3D).');
}

function fanDuct(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, fs = v.fan, hr = 1.7, pt = 3, fr = fs * 0.43;
  a.outline();
  const hs = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => hole(cx + sx * fs * 0.4, cy + sy * fs * 0.4, hr));
  plateH(a, 'z', cx - fs / 2, cy - fs / 2, cx + fs / 2, cy + fs / 2, Z1 - pt, Z1, hs);
  ring(a, 'z', cx, cy, Z1 - pt - 8, Z1 - pt, fr * 0.84, fr, 20);
  a.cone(cx, cy, Z0 + H * 0.38, Z1 - pt - 8, fr * 0.5, fr, 20); ring(a, 'z', cx, cy, Z1 - pt - 8, Z1 - pt, 0, fr * 0.84, 20);
  // flattened mouth, bent toward the front
  prismY(a, [[cx - fs * 0.34, Z0 + H * 0.4], [cx + fs * 0.34, Z0 + H * 0.4], [cx + fs * 0.22, Z0 + H * 0.12], [cx - fs * 0.22, Z0 + H * 0.12]], cy - fs * 0.06 > YF ? cy - fs * 0.06 : YF, cy + fs * 0.06);
  prismY(a, [[cx - fs * 0.22, Z0 + H * 0.12], [cx + fs * 0.22, Z0 + H * 0.12], [cx + fs * 0.22, Z0], [cx - fs * 0.22, Z0]], cy - fs * 0.07, cy - fs * 0.02);
  for (const h of hs) a.circ(h.u, h.v, hr, 'EQUIP-DETAIL');
  a.circ(cx, cy, fr, 'EQUIP-DETAIL'); a.circ(cx, cy, fr * 0.5, 'EQUIP-DETAIL');
  void X0; void X1; void YB; void W; void D;
  a.log('Added a square fan plate with four screw holes, a round intake collar, a tapering duct and a flattened mouth with a lip (plan and 3D).');
}

function knob(a, v) {
  const { Z0, Z1, W, H, cx, cy } = a, ro = W / 2, n = v.flutes, ins = v.insert * IN / 2, z1 = Z1 - H * 0.1;
  a.circ(cx, cy, ro); a.circ(cx, cy, ro * 0.82, 'EQUIP-DETAIL'); a.circ(cx, cy, ins, 'EQUIP-DETAIL');
  ring(a, 'z', cx, cy, Z0, Z0 + H * 0.16, 0, ro, 28);
  ring(a, 'z', cx, cy, Z0 + H * 0.16, z1, ins, ro * 0.82, 24);
  for (let i = 0; i < n; i++) {
    const g = ((i + 0.5) / n) * TAU, c = m.cos(g), s = m.sin(g), w = ro * 0.55 / m.max(3, n / 2), P = (r, k) => [cx + r * c - k * s, cy + r * s + k * c];
    a.prism([P(ro * 0.78, -w), P(ro * 0.78, w), P(ro * 0.97, w * 0.7), P(ro * 0.97, -w * 0.7)], Z0 + H * 0.16, z1);
  }
  ring(a, 'z', cx, cy, z1, Z1 - 1.2, ins, ro * 0.9, 24);
  a.box(cx + ins + 1.5, cy - 1, Z1 - 1.2, cx + ro * 0.8, cy + 1, Z1); a.line(cx + ins, cy, cx + ro * 0.8, cy, 'EQUIP-DETAIL');
  a.log('Added a skirt, a body with ' + n + ' raised flutes, a top cap with a raised pointer line and a round insert hole (plan and 3D).');
}

function hoseAdapter(a, v) {
  const { X0, X1, W, H, cy, Z0 } = a, zc = Z0 + H / 2, r1 = v.od1 * IN / 2, r2 = v.od2 * IN / 2, w1 = W * 0.38, wc = W * 0.14;
  const barb = (x0, x1, r, dir) => { const L = (x1 - x0) / 3; for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) { const xa = x0 + L * k + (L * j) / 3, rr = r * (0.78 + 0.11 * (dir > 0 ? j : 2 - j)); ring(a, 'x', cy, zc, xa, xa + L / 3, r * 0.62, rr, 16); } };
  a.outline();
  barb(X0, X0 + w1, r1, 1);
  ring(a, 'x', cy, zc, X0 + w1, X0 + w1 + wc, m.min(r1, r2) * 0.62, m.max(r1, r2), 6);
  barb(X0 + w1 + wc, X1, r2, -1);
  for (const x of [X0 + w1, X0 + w1 + wc]) a.line(x, cy - H / 2, x, cy + H / 2, 'EQUIP-DETAIL');
  a.log('Added a barbed end with three ridges, a hexagonal collar, a second smaller barbed end and a through bore (plan and 3D).');
}

function cornerBracket(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H } = a, t = v.t * IN, hr = v.hole * IN / 2, g = m.min(W, D, H) * 0.5;
  const fx = X0 + t + (X1 - X0 - t) * 0.6, fy = YF + (YB - t - YF) * 0.5;
  a.outline();
  plateH(a, 'z', X0, YF, X1, YB, Z0, Z0 + t, [hole(fx, fy, hr)]);
  plateH(a, 'y', X0 + t, Z0 + t, X1, Z1, YB - t, YB, [hole(fx, Z0 + t + (Z1 - Z0 - t) * 0.6, hr)]);
  plateH(a, 'x', YF, Z0 + t, YB - t, Z1, X0, X0 + t, [hole(fy, Z0 + t + (Z1 - Z0 - t) * 0.6, hr)]);
  prismX(a, [[YB - t, Z0 + t + g], [YB - t, Z0 + t], [YB - t - g, Z0 + t]], X1 - t * 2.2, X1 - t * 1.2);
  prismY(a, [[X0 + t, Z0 + t + g], [X0 + t, Z0 + t], [X0 + t + g, Z0 + t]], YF + t * 1.2, YF + t * 2.2);
  a.prism([[X0 + t, YB - t], [X0 + t + g, YB - t], [X0 + t, YB - t - g]], Z0 + t, Z0 + t + g * 1.3);
  a.circ(fx, fy, hr, 'EQUIP-DETAIL');
  a.log('Added a floor plate, a back plate and a side plate meeting in one corner, each with a bolt hole, and three gussets along the inside edges (plan and 3D).');
}

function phoneStand(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cw = 5, pt = 6, A = [YF, Z0], B = [YB, Z0], C = [YF + H * 0.5, Z1];
  const dy = C[0] - A[0], dz = C[1] - A[1], L = m.hypot(dy, dz), ty = dy / L, tz = dz / L, ny = tz * pt, nz = -ty * pt, s0 = L * 0.12;
  a.outline();
  for (const [x0, x1] of [[X0, X0 + cw], [X1 - cw, X1]]) prismX(a, [A, B, C], x0, x1);
  prismX(a, [[A[0] + ty * s0, A[1] + tz * s0], [C[0], C[1]], [C[0] + ny, C[1] + nz], [A[0] + ty * s0 + ny, A[1] + tz * s0 + nz]], X0 + cw, X1 - cw);
  plateH(a, 'z', X0 + cw, YF, X1 - cw, YB, Z0, Z0 + 4, [hole(cx, YB - D * 0.25, 7)]);
  a.box(X0 + cw, YF, Z0 + 4, X1 - cw, YF + 8, Z0 + 16); a.box(X0 + cw, YB - 8, Z0 + 4, X1 - cw, YB, Z0 + 10);
  a.line(X0 + cw, YF + 8, X1 - cw, YF + 8, 'EQUIP-DETAIL'); a.line(X0 + cw, C[0], X1 - cw, C[0], 'EQUIP-DETAIL'); a.circ(cx, YB - D * 0.25, 7, 'EQUIP-DETAIL');
  a.log('Added two triangular side cheeks, a leaning rest plate on the slope, a front lip, a back rail and a base plate with a cable hole (plan and 3D).');
}

function wallHook(a, v) {
  const { X0, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 4, n = v.n, pr = v.rod * IN / 2, r = m.min(D * 0.22, 14);
  a.outline();
  plateH(a, 'y', a.X0, Z0, a.X1, Z1, YB - t, YB, [hole(cx, Z1 - 9, 2.2), hole(cx, Z0 + 9, 2.2)]);
  for (let i = 0; i < n; i++) {
    const x = n === 1 ? cx : X0 + W * (i + 0.5) / n, z0 = Z0 + H * 0.4, ym = YF + r + pr;
    a.tube([[x, YB - t, z0], [x, ym, z0]], [pr, pr], 8);
    const pp = []; for (let k = 0; k <= 8; k++) { const th = (k / 8) * m.PI * 0.95; pp.push([x, ym - r * m.sin(th), z0 + r - r * m.cos(th)]); }
    a.tube(pp, pp.map(() => pr), 8);
    prismX(a, [[YB - t, z0 + pr], [YB - t, z0 - pr - H * 0.18], [ym + 8, z0 - pr]], x - 2, x + 2);
    a.circ(x, ym, pr, 'EQUIP-DETAIL'); a.line(x, YB - t, x, ym, 'EQUIP-DETAIL');
  }
  void D;
  a.log('Added a wall plate with two screw holes and ' + n + ' round J hook' + (n > 1 ? 's' : '') + ' with a curved tip, each braced to the plate by a triangular rib (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ fixtures
function storageBin(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 1.6, fl = 1.8, gx = v.gx, gy = v.gy;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + fl);
  a.box(X0, YB - t, Z0 + fl, X1, YB, Z1); a.box(X0, YF, Z0 + fl, X0 + t, YB - t, Z1); a.box(X1 - t, YF, Z0 + fl, X1, YB - t, Z1);
  const sw = W * 0.22;
  a.box(X0 + t, YF, Z0 + fl, X0 + sw, YF + t, Z1); a.box(X1 - sw, YF, Z0 + fl, X1 - t, YF + t, Z1); a.box(X0 + sw, YF, Z0 + fl, X1 - sw, YF + t, Z0 + H * 0.45);
  a.box(X0 + sw + 1.5, YF + t, Z0 + H * 0.45 - 6, X1 - sw - 1.5, YF + t + 2.2, Z0 + H * 0.45);
  for (let i = 1; i < gx; i++) { const x = X0 + (W * i) / gx; a.box(x - 0.8, YF + t, Z0 + fl, x + 0.8, YB - t, Z0 + H * 0.82); a.line(x, YF + t, x, YB - t); }
  for (let j = 1; j < gy; j++) { const y = YF + (D * j) / gy; a.box(X0 + t, y - 0.8, Z0 + fl, X1 - t, y + 0.8, Z0 + H * 0.82); a.line(X0 + t, y, X1 - t, y); }
  for (const x of [X0 + 3, X1 - 3]) for (const y of [YF + 3, YB - 3]) a.cyl(x, y, Z0, Z0 + 0.01 + fl, 0.01, 3);
  a.rect(X0 + t, YF + t, X1 - t, YB - t, 'EQUIP-DETAIL');
  a.log('Added a floor, three full walls, a front wall with a scooped cut-out between two posts and a label ledge, and dividers making ' + gx * gy + ' compartment' + (gx * gy > 1 ? 's' : '') + ' (plan and 3D).');
}

function hexKeys(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, n = v.n, bt = H * 0.18, pw = (W - 12) / n;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bt);
  for (let i = 0; i < n; i++) {
    const x = X0 + 6 + pw * (i + 0.5), hh = H * (0.34 + 0.28 * (i / m.max(1, n - 1))), r = m.min(pw * 0.36, 4 + i * 0.35);
    a.box(x - pw / 2 + 0.4, YF + 4, Z0 + bt, x + pw / 2 - 0.4, YB - 4, Z0 + bt + hh * 0.5);
    ring(a, 'z', x, cy, Z0 + bt + hh * 0.5, Z0 + bt + hh, r * 0.62, r * 1.1, 6);
    hexZ(a, x, cy, Z0 + bt + hh, m.min(Z1, Z0 + bt + hh + (Z1 - Z0 - bt - hh) * 0.85 + 0.01), r * 0.58);
    a.circ(x, cy, r * 1.1, 'EQUIP-DETAIL');
  }
  a.log('Added a base and ' + n + ' stepped sockets growing in size, each with a hex collar and a hex key standing in it (plan and 3D).');
}

function spoolAxle(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, n = v.n, r = m.min(95, (D - 24) / 2, (H - 70) / 2), zc = Z0 + 36 + r, sw = 70, zr = zc;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 14);
  for (const [x0, x1] of [[X0, X0 + 12], [X1 - 12, X1]]) { prismX(a, [[YF + 6, Z0 + 14], [YB - 6, Z0 + 14], [cy + 14, zr + 8], [cy - 14, zr + 8]], x0, x1); }
  for (const [x0, x1] of [[X0, X0 + 12], [X1 - 12, X1]]) ring(a, 'x', cy, zr, x0, x1, 5, 14, 12);
  a.xcyl(X0 + 12, X1 - 12, cy, zr, 5, 10);
  for (let i = 0; i < n; i++) spoolX(a, X0 + 12 + (W - 24) * (i + 0.5) / n, cy, zr, r, m.min(sw, (W - 24) / n - 6));
  for (const x of [X0 + 3, X1 - 9]) a.cyl(x + 3, cy, zr + 6, zr + 14, 6, 8);
  void Z1;
  a.log('Added a base with two upright cheeks that cradle a thin axle rod with end knobs and carry ' + n + ' filament spool' + (n > 1 ? 's' : '') + ' side by side (plan and 3D).');
}

function dividerTray(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 1.6, fl = 1.8, cols = v.cols, rows = v.rows;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + fl);
  a.box(X0, YF, Z0 + fl, cx - W * 0.14, YF + t, Z1); a.box(cx + W * 0.14, YF, Z0 + fl, X1, YF + t, Z1); a.box(cx - W * 0.14, YF, Z0 + fl, cx + W * 0.14, YF + t, Z0 + fl + (Z1 - Z0 - fl) * 0.4); a.box(X0, YB - t, Z0 + fl, X1, YB, Z1); a.box(X0, YF + t, Z0 + fl, X0 + t, YB - t, Z1); a.box(X1 - t, YF + t, Z0 + fl, X1, YB - t, Z1);
  for (let i = 1; i < cols; i++) { const x = X0 + (W * i) / cols; a.box(x - 0.7, YF + t, Z0 + fl, x + 0.7, YB - t, Z0 + fl + (Z1 - Z0 - fl) * (i % 2 ? 0.8 : 1)); a.line(x, YF + t, x, YB - t); }
  for (let j = 1; j < rows; j++) { const y = YF + (D * j) / rows; a.box(X0 + t, y - 0.7, Z0 + fl, X1 - t, y + 0.7, Z0 + fl + (Z1 - Z0 - fl) * 0.8); a.line(X0 + t, y, X1 - t, y); }
  for (let k = 0; k < 3; k++) a.cyl(X0 + W * (0.25 + 0.25 * k), YB - 0.3 - D * 0.01 - t, Z0 + fl, Z0 + fl + 0.01, 0.01, 3);
  a.rect(X0 + t, YF + t, X1 - t, YB - t, 'EQUIP-DETAIL');
  a.log('Added a tray floor, four walls with a finger notch at the front and a grid of ' + cols * rows + ' compartments whose divider heights alternate (plan and 3D).');
}

function solderStand(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, hr = 3.2, ro = 7;
  a.outline();
  plateH(a, 'z', X0, YF, X1, YB, Z0, Z0 + 6, [hole(X0 + 12, YB - 12, hr), hole(X1 - 12, YB - 12, hr)]);
  const uz = Z0 + H * 0.62, ux = [X0 + W * 0.16, X0 + W * 0.16 + (v.cradles > 1 ? W * 0.2 : 0)];
  for (let i = 0; i < v.cradles; i++) {
    const x = ux[i];
    a.box(x - 6, YB - 24, Z0 + 6, x + 6, YB - 12, uz - 12); ring(a, 'y', x, uz, YB - 36, YB - 12, ro * 0.9, ro * 2.1, 14, 0, m.PI * 1.35);
    a.circ(x, YB - 24, ro * 1.4, 'EQUIP-DETAIL');
  }
  if (v.cup) { const x = X1 - W * 0.18; ring(a, 'z', x, cy, Z0 + 6, Z0 + H * 0.42, W * 0.1, W * 0.14, 16); a.cyl(x, cy, Z0 + 6, Z0 + H * 0.34, W * 0.1, 16); a.circ(x, cy, W * 0.14, 'EQUIP-DETAIL'); a.circ(x, cy, W * 0.1, 'EQUIP-DETAIL'); }
  if (v.reel) { const x = X0 + W * 0.5, rr = m.min(D * 0.3, W * 0.1); a.cyl(x, YF + D * 0.35, Z0 + 6, Z1 - 24, 3, 8); spoolZ(a, x, YF + D * 0.35, Z1 - 24, rr, 24); }
  a.line(X0 + W * 0.05, YB - 24, X1 - W * 0.05, YB - 24, 'EQUIP-HIDDEN');
  a.log('Added a base with two screw holes and ' + v.cradles + ' ring cradle' + (v.cradles > 1 ? 's' : '') + ' on posts' + (v.cup ? ', a round tip-cleaning cup' : '') + (v.reel ? ' and a solder reel on a pin' : '') + ' (plan and 3D).');
}

function softJaws(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, bt = 6, hr = 2.6, rr = m.min(H, D) * 0.22, bd = D * 0.5;
  a.outline();
  for (const s of [-1, 1]) {
    const xa = s < 0 ? X0 : cx + rr, xb = s < 0 ? cx - rr : X1, ox = (xa + xb) / 2 - s * (xb - xa) * 0.12;
    plateH(a, 'y', xa, Z0, xb, Z1, YB - bt, YB, [hole(ox, Z1 - H * 0.22, hr), hole(ox, Z0 + H * 0.22, hr)]);
    const fx = s < 0 ? xb : xa, zc = Z0 + H * 0.5, back = s < 0 ? xa : xb, set = fx - s * rr * 0.9, y0 = YB - bt - bd, y1 = YB - bt;
    a.box(xa, y0, Z0, xb, y1, zc - rr * 1.9); a.box(xa, y0, zc + rr * 1.9, xb, y1, Z1); a.box(m.min(back, set), y0, zc - rr * 1.9, m.max(back, set), y1, zc + rr * 1.9);
    a.rect(xa, YB - bt - bd, xb, YB, 'EQUIP-DETAIL');
  }
  a.ycyl(YB - bt - bd + 4, YB - bt - 4, cx, Z0 + H * 0.5, rr, 14);
  a.log('Added two backing plates with screw holes, two thick jaw blocks with a shaped seat on their inner faces and a round workpiece held between them (plan and 3D).');
}

function caliperHolder(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 4, cw = m.min(W * 0.42, 22), L = v.len * IN;
  a.outline();
  plateH(a, 'y', X0, Z0, X1, Z1, YB - t, YB, [hole(cx, Z1 - 10, 2.4), hole(cx, Z0 + 10, 2.4)]);
  const sz = Z0 + H * 0.2;
  a.box(X0 + 2, YF + 6, sz - 6, cx - cw / 2 - 1, YB - t, sz); a.box(cx + cw / 2 + 1, YF + 6, sz - 6, X1 - 2, YB - t, sz);
  prismX(a, [[YB - t, sz], [YB - t, sz - 30], [YF + D * 0.45, sz - 6]], X0 + 2, X0 + 6); prismX(a, [[YB - t, sz], [YB - t, sz - 30], [YF + D * 0.45, sz - 6]], X1 - 6, X1 - 2);
  // the caliper: a long bar, a slider block and two jaws, standing in the slot
  const bz0 = sz - 4, bz1 = m.min(Z1 - 4, bz0 + L);
  a.box(cx - cw / 2, YB - t - 16, bz0, cx + cw / 2, YB - t - 12, bz1);
  a.box(cx - cw / 2 - 2, YB - t - 18, bz0 + (bz1 - bz0) * 0.55, cx + cw / 2 + 2, YB - t - 8, bz0 + (bz1 - bz0) * 0.7);
  a.box(cx - cw / 2, YB - t - 24, bz1 - 22, cx + cw / 2 - 2, YB - t - 12, bz1); a.box(cx - cw / 2, YB - t - 24, bz0 + (bz1 - bz0) * 0.7, cx + cw / 2 - 2, YB - t - 12, bz0 + (bz1 - bz0) * 0.7 + 14);
  a.rect(X0 + 2, YF + 6, X1 - 2, YB - t, 'EQUIP-DETAIL');
  a.log('Added a wall plate with two screw holes, a slotted shelf with two side ribs and a long measuring tool standing in the slot, with its bar, slider and jaws (plan and 3D).');
}

function railHolder(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 5, n = v.n, rw = m.min(W * 0.5, 26), sl = [];
  a.outline();
  const nsl = m.max(3, m.round((H - 20) / 22)); for (let i = 0; i < nsl; i++) sl.push(hole(cx, Z0 + 12 + ((H - 24) * (i + 0.5)) / nsl, 3));
  plateH(a, 'y', cx - rw / 2, Z0, cx + rw / 2, Z1, YB - t, YB, sl, 8);
  a.box(cx - rw / 2 - 3, YB - t - 2, Z0, cx - rw / 2, YB, Z1); a.box(cx + rw / 2, YB - t - 2, Z0, cx + rw / 2 + 3, YB, Z1);
  const pitch = (H - 12) / n;
  for (let i = 0; i < n; i++) {
    const z = Z0 + 6 + pitch * (i + 0.5), kind = i % 2, ex = cx;
    a.box(ex - 6, YB - t - 12, z - 5, ex + 6, YB - t, z + 5);
    if (kind === 0) { ring(a, 'y', ex, z, YF + 4, YB - t - 12, 4.2, 8, 12, -0.4, m.PI + 0.4); a.cyl(ex, YF + 12, z - 3, z - 3, 0.01, 3); a.ycyl(YF + 18, YB - t - 14, ex, z - 0.5, 3.5, 8); }
    else { a.box(ex - 8, YF + 6, z - 3, ex + 8, YB - t - 12, z + 3); a.box(ex - 8, YF + 6, z + 3, ex - 5, YF + 14, z + 12); a.box(ex + 5, YF + 6, z + 3, ex + 8, YF + 14, z + 12); }
    a.circ(ex, YF + 10, 8, 'EQUIP-DETAIL');
  }
  void D;
  a.log('Added a slotted wall rail with side flanges and ' + n + ' clip-on holders alternating between a round ring clip with a tool handle in it and a forked rest (plan and 3D).');
}

function circuitMount(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, bt = 3, hr = 2.2, so = 8, bw = W - 22, bd = D - 22;
  a.outline();
  const hs = [[X0 + 7, YF + 7], [X1 - 7, YF + 7], [X0 + 7, YB - 7], [X1 - 7, YB - 7]].map(([x, y]) => hole(x, y, hr));
  plateH(a, 'z', X0, YF, X1, YB, Z0, Z0 + bt, hs);
  const px = [[cx - bw / 2 + 4, cy - bd / 2 + 4], [cx + bw / 2 - 4, cy - bd / 2 + 4], [cx - bw / 2 + 4, cy + bd / 2 - 4], [cx + bw / 2 - 4, cy + bd / 2 - 4]];
  for (const [x, y] of px) { ring(a, 'z', x, y, Z0 + bt, Z0 + bt + so, 1, 3.4, 10); a.circ(x, y, 3.4, 'EQUIP-DETAIL'); }
  a.box(cx - bw / 2, cy - bd / 2, Z0 + bt + so, cx + bw / 2, cy + bd / 2, Z0 + bt + so + 1.6);
  a.box(cx + bw * 0.15, cy - bd * 0.4, Z0 + bt + so + 1.6, cx + bw * 0.45, cy - bd * 0.1, Z1 - 0.5); a.box(cx - bw * 0.4, cy + bd * 0.1, Z0 + bt + so + 1.6, cx - bw * 0.05, cy + bd * 0.35, Z0 + bt + so + 6);
  a.box(X0 + 4, YF - 0, Z0 + bt, X0 + 4 + W * 0.2, YF + 3, Z0 + bt + 6);
  for (const h of hs) a.circ(h.u, h.v, hr, 'EQUIP-DETAIL');
  a.rect(cx - bw / 2, cy - bd / 2, cx + bw / 2, cy + bd / 2, 'EQUIP-DETAIL');
  a.log('Added a base plate with four screw holes, four round standoffs, a circuit-board shape on them with two component blocks and a cable tab at the front (plan and 3D).');
}

function cableChain(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, n = v.links, lw = (W - 36) / n, cw = D - 6, t = 2.2;
  a.outline();
  plateH(a, 'z', X0, YF, X0 + 18, YB, Z0, Z0 + 3, [hole(X0 + 9, cy, 2.2)]); plateH(a, 'z', X1 - 18, YF, X1, YB, Z0, Z0 + 3, [hole(X1 - 9, cy, 2.2)]);
  for (let i = 0; i < n; i++) {
    const x0 = X0 + 18 + i * lw + 0.4, x1 = x0 + lw - 0.8, zz = Z0 + 3 + (H - 3) * 0.0;
    a.box(x0, YF + 1, zz, x1, YF + 1 + t, Z1 - 0.01); a.box(x0, YB - 1 - t, zz, x1, YB - 1, Z1 - 0.01);
    a.box(x0, YF + 1, zz, x1, YB - 1, zz + t); a.box(x0 + (i % 2 ? 0 : lw * 0.2), YF + 1, Z1 - t, x1 - (i % 2 ? lw * 0.2 : 0), YB - 1, Z1);
    a.circ((x0 + x1) / 2, cy, 0.01, 'EQUIP-DETAIL'); a.line(x0, YF + 1, x0, YB - 1, 'EQUIP-DETAIL');
  }
  a.ycyl(YF + D * 0.3, YB - D * 0.3, X0 + 6, Z0 + 3 + 2.5, 2.5, 8); a.xcyl(X1 - 10, X1 - 2, cy, Z0 + 3 + 3.0, 2.5, 8);
  void cw;
  a.log('Added ' + n + ' chain links, each with two cheeks, a floor bar and a top bar closed on alternate links, between two end mounts with a screw hole each and a cable stub (plan and 3D).');
}

function bitRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cols = v.cols, tier = [Z0 + H * 0.3, Z0 + H * 0.52], pw = (W - 8) / cols, r = m.min(pw * 0.3, 3.2), hs = [];
  a.outline();
  a.box(X0, YF, Z0, X1, YB, tier[0] - 0.01);
  for (let k = 0; k < 2; k++) {
    const y0 = k ? YF + D * 0.5 : YF, y1 = k ? YB : YF + D * 0.5, z0 = k ? tier[0] : Z0 + 0.5, z1 = tier[k] + 0.01;
    void z0; void y1;
    const hh = []; for (let i = 0; i < cols; i++) hh.push(hole(X0 + 4 + pw * (i + 0.5), (y0 + (k ? YB : YF + D * 0.5)) / 2, r));
    if (k === 1) a.box(X0, YF + D * 0.5, tier[0], X1, YB, tier[1] - 6);
    plateH(a, 'z', X0, y0, X1, k ? YB : YF + D * 0.5, tier[k] - 6, tier[k], hh, 8);
    for (let i = 0; i < cols; i++) if ((i + k) % 5 !== 4) { const h = hh[i]; hexZ(a, h.u, h.v, tier[k], tier[k] + (k ? H * 0.2 : H * 0.14), r * 0.82); }
    hs.push(...hh); void z1;
  }
  for (const h of hs) a.circ(h.u, h.v, h.r, 'EQUIP-DETAIL');
  a.log('Added a stepped block with two tiers of ' + cols + ' hex holes each, most holding a screwdriver bit, with the back tier higher (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ calibration
function firstLayer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, bt = 3, pt = 3, py = YF + D * 0.5, rz = 1.2, zc = (Z0 + bt + Z1) / 2, hw = W / 2 - 3, hh = (Z1 - Z0 - bt) / 2 - 3;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bt);
  a.box(X0, py, Z0 + bt, X1, py + pt, Z1);
  for (const x of [X0 + W * 0.2, X1 - W * 0.2 - 3]) prismX(a, [[py + pt, Z0 + bt], [YB, Z0 + bt], [py + pt, Z0 + bt + H * 0.4]], x, x + 3);
  if (v.kind === 'squares') for (let k = 0; k < 4; k++) { const s = (k + 1) / 4, e = 0.04; a.frame(cx - hw * s, zc - hh * s, cx + hw * s, zc + hh * s, py - rz, py, m.max(1.4, hw * e)); }
  else if (v.kind === 'rings') { const rr = m.min(hw, hh); for (let k = 0; k < 4; k++) ring(a, 'y', cx, zc, py - rz, py, rr * ((k + 1) / 4) - m.max(1.4, rr * 0.05), rr * ((k + 1) / 4), 28); a.box(cx - 0.8, py - rz, zc - rr, cx + 0.8, py, zc + rr); a.box(cx - rr, py - rz, zc - 0.8, cx + rr, py, zc + 0.8); }
  else { const g = 5; for (let k = 0; k <= g; k++) { a.box(cx - hw + (2 * hw * k) / g - 0.9, py - rz, zc - hh, cx - hw + (2 * hw * k) / g + 0.9, py, zc + hh); a.box(cx - hw, py - rz, zc - hh + (2 * hh * k) / g - 0.9, cx + hw, py, zc - hh + (2 * hh * k) / g + 0.9); } }
  a.line(X0, py, X1, py, 'EQUIP-DETAIL'); a.rect(cx - hw, py - rz, cx + hw, py, 'EQUIP-DETAIL');
  a.log('Added a base plate, an upright test plate on two rear braces and a raised ' + (v.kind === 'squares' ? 'set of four nested square outlines' : v.kind === 'rings' ? 'set of four rings with a cross' : 'grid of lines') + ' on its face (plan and 3D).');
}

function flowWall(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, t = 1.2, bt = 1.6;
  a.outline();
  if (v.shape === 'square') {
    a.box(X0, YF, Z0, X1, YB, Z0 + bt); a.box(X0, YF, Z0 + bt, X1, YF + t, Z1); a.box(X0, YB - t, Z0 + bt, X1, YB, Z1); a.box(X0, YF + t, Z0 + bt, X0 + t, YB - t, Z1); a.box(X1 - t, YF + t, Z0 + bt, X1, YB - t, Z1);
    a.rect(X0 + t, YF + t, X1 - t, YB - t, 'EQUIP-DETAIL');
  } else {
    const R = m.min(W, D) / 2, sg = v.shape === 'hex' ? 6 : 32;
    ring(a, 'z', cx, cy, Z0, Z0 + bt, 0, R, sg); ring(a, 'z', cx, cy, Z0 + bt, Z1, R - t, R, sg);
    a.circ(cx, cy, R); a.circ(cx, cy, R - t, 'EQUIP-DETAIL');
  }
  a.log('Added a thin floor and a ' + v.shape + ' single-perimeter wall about one line wide, standing open at the top (plan and 3D).');
}

function ringingTest(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H } = a, st = 4, bh = H * 0.4, sh = (H - bh) / st;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bh);
  for (let k = 0; k < st; k++) { a.box(X0, YB - D * 0.34, Z0 + bh + k * sh, X0 + W * 0.5 * (1 - k / st), YB, Z0 + bh + (k + 1) * sh); a.line(X0 + W * 0.5 * (1 - k / st), YB - D * 0.34, X0 + W * 0.5 * (1 - k / st), YB, 'EQUIP-DETAIL'); }
  const rr = m.min(W, D) * 0.06;
  for (let k = 0; k < 5; k++) { const x = X0 + W * (0.12 + 0.18 * k); a.cyl(x, YF + D * 0.3, Z0 + bh, Z0 + bh + H * 0.14, rr * (0.6 + 0.15 * k), 10); a.circ(x, YF + D * 0.3, rr * (0.6 + 0.15 * k), 'EQUIP-DETAIL'); }
  void X1; void Z1;
  a.log('Added a base block, a wall rising in four sharp steps along the back and a front row of five round posts that grow in size (plan and 3D).');
}

function steppedBlock(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, n = v.steps, sh = H / n;
  a.outline();
  for (let k = 0; k < n; k++) { const i = (k * m.min(W, D) * 0.36) / n; a.box(X0 + i, YF + i, Z0 + k * sh, X1 - i, YB - i, Z0 + (k + 1) * sh); a.rect(X0 + i, YF + i, X1 - i, YB - i, 'EQUIP-DETAIL'); }
  a.cyl(cx, cy, Z1 - 0.01, Z1, 0.01, 3);
  a.log('Added ' + n + ' stacked square steps that shrink in size on all four sides, each step the same height (plan and 3D).');
}

function supportTest(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, bt = 2.5, tw = W * 0.14, zb = Z0 + H * 0.62;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bt);
  const lx = X0 + W * 0.2, rx = X1 - W * 0.2 - tw;
  a.box(lx, YF + 4, Z0 + bt, lx + tw, YB - 4, Z1); a.box(rx, YF + 4, Z0 + bt, rx + tw, YB - 4, Z1);
  a.box(lx + tw, YF + 4, zb, rx, YB - 4, zb + H * 0.12);
  a.box(X0 + 1, YF + 4, Z0 + H * 0.42, lx, YB - 4, Z0 + H * 0.42 + H * 0.07);
  prismY(a, [[rx + tw, Z0 + H * 0.5], [X1 - 1, Z0 + H * 0.5], [rx + tw, Z0 + H * 0.5 + (X1 - 1 - rx - tw) * 1.0]], YF + 4, YB - 4);
  ring(a, 'y', cx, zb, YF + 4, YB - 4, W * 0.07, W * 0.07 + 2.4, 18, m.PI, TAU);
  a.rect(lx, YF + 4, lx + tw, YB - 4, 'EQUIP-DETAIL'); a.rect(rx, YF + 4, rx + tw, YB - 4, 'EQUIP-DETAIL');
  a.log('Added a base plate, two towers, a bridge between them with an arch hanging under it, a flat overhang arm on one tower and a 45 degree wedge on the other (plan and 3D).');
}

function gapRings(a, v) {
  const { Z0, Z1, W, cx, cy } = a, n = v.n, R = W / 2, g = v.gap, rw = (R - g * n - 3) / (n + 0.4);
  a.circ(cx, cy, R);
  ring(a, 'z', cx, cy, Z0, Z0 + 1.2, 0, R, 36);
  let r1 = R - 0.5;
  for (let k = 0; k < n; k++) { const ri = r1 - rw; ring(a, 'z', cx, cy, Z0 + 1.2, Z1, ri, r1, 32); a.circ(cx, cy, r1, 'EQUIP-DETAIL'); r1 = ri - g; }
  a.cyl(cx, cy, Z0 + 1.2, Z1, m.max(1, r1), 16); a.circ(cx, cy, m.max(1, r1), 'EQUIP-DETAIL');
  a.log('Added a thin disc with ' + n + ' nested rings separated by ' + g + ' mm gaps and a solid core, all printed in place (plan and 3D).');
}

function threadTest(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cy } = a, r = v.dia / 2, pitch = v.pitch, bx = X0 + W * 0.28, nx = X1 - W * 0.28, bt = 1.6;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bt);
  const bl = H * 0.72;
  a.cyl(bx, cy, Z0 + bt, Z0 + bt + bl, r * 0.82, 14);
  for (let z = Z0 + bt; z + pitch * 0.55 <= Z0 + bt + bl; z += pitch) ring(a, 'z', bx, cy, z, z + pitch * 0.5, r * 0.8, r, 14);
  hexZ(a, bx, cy, Z0 + bt + bl, Z0 + bt + bl + H * 0.2 > Z1 ? Z1 : Z0 + bt + bl + H * 0.2, r * 1.5);
  const nh = H * 0.5;
  ring(a, 'z', nx, cy, Z0 + bt, Z0 + bt + nh, r * 0.82, r * 1.55, 12);
  for (let z = Z0 + bt + 0.3; z + pitch * 0.5 <= Z0 + bt + nh; z += pitch) ring(a, 'z', nx, cy, z, z + pitch * 0.5, r * 0.8, r * 0.95, 14);
  a.circ(bx, cy, r); a.circ(bx, cy, r * 1.5, 'EQUIP-DETAIL'); a.circ(nx, cy, r * 1.55); a.circ(nx, cy, r * 0.82, 'EQUIP-DETAIL');
  void Z1; void YF; void YB;
  a.log('Added a base plate, a bolt with a hex head and a ridged shank, and a round nut with a ridged bore, with thread pitch shown as stacked rings (plan and 3D).');
}

function spiralVase(a, v) {
  const { Z0, Z1, W, H, cx, cy } = a, R = W / 2, n = v.rings, hh = (H - 2) / n, wt = 1.0;
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.7, 'EQUIP-DETAIL');
  ring(a, 'z', cx, cy, Z0, Z0 + 2, 0, R * 0.78, 30);
  for (let k = 0; k < n; k++) { const f = (k + 0.5) / n, r = R * (0.72 + 0.28 * m.abs(m.sin(f * m.PI * (v.waves + 0.5)))) * (1 - 0.1 * f); ring(a, 'z', cx, cy, Z0 + 2 + k * hh, Z0 + 2 + (k + 1) * hh, r - wt, r, 28); }
  void Z1;
  a.log('Added a base disc and a single-wall vase made of ' + n + ' stacked rings whose radius swells and narrows ' + v.waves + ' times (plan and 3D).');
}

function starTest(a, v) {
  const { Z0, Z1, W, cx, cy } = a, n = v.points, R = W / 2 - 0.5, ri = R * 0.42, bt = 1.6, P = [];
  a.circ(cx, cy, W / 2, 'EQUIP-DETAIL');
  ring(a, 'z', cx, cy, Z0, Z0 + bt, 0, W / 2, 30);
  const zm = Z0 + bt + (Z1 - Z0 - bt) * 0.55;
  for (const [sc, za, zb2] of [[1, Z0 + bt, zm], [0.62, zm, Z1]]) {
    a.prism(Array.from({ length: n }, (_, i) => [cx + sc * ri * m.cos((i / n) * TAU + m.PI / n), cy + sc * ri * m.sin((i / n) * TAU + m.PI / n)]), za, zb2);
    for (let i = 0; i < n; i++) {
      const g = (i / n) * TAU, g0 = g - m.PI / n, g1 = g + m.PI / n;
      a.prism([[cx + sc * ri * m.cos(g0), cy + sc * ri * m.sin(g0)], [cx + sc * ri * m.cos(g1), cy + sc * ri * m.sin(g1)], [cx + sc * R * m.cos(g), cy + sc * R * m.sin(g)]], za, zb2);
    }
  }
  for (let i = 0; i < n; i++) {
    const g = (i / n) * TAU;
    P.push([cx + R * m.cos(g), cy + R * m.sin(g)], [cx + ri * 0.9 * m.cos(g + m.PI / n), cy + ri * 0.9 * m.sin(g + m.PI / n)]);
  }
  a.poly(P);
  a.log('Added a round base disc and a ' + n + ' pointed star in two tiers with sharp tips and inner corners, a test of corner sharpness (plan and 3D).');
}

function pillarTest(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cy } = a, n = v.n, bt = 2.5, ds = [3.2, 2.4, 1.8, 1.4, 1.1, 0.9, 0.7, 0.6, 0.5].slice(0, n), pw = (W - 4) / n;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bt);
  ds.forEach((d, i) => { const x = X0 + 2 + pw * (i + 0.5); for (const [yy, hh] of [[YF + D * 0.28, 1], [YB - D * 0.28, 0.55]]) { a.cyl(x, yy, Z0 + bt, Z0 + bt + (H - bt) * hh, d / 2, 10); a.circ(x, yy, d / 2, 'EQUIP-DETAIL'); } });
  a.box(X0 + 1, cy - 0.4, Z0 + bt, X1 - 1, cy + 0.4, Z0 + bt + 0.9);
  void Z1;
  a.log('Added a base plate and two rows of ' + n + ' round pillars that thin down from ' + ds[0] + ' to ' + ds[n - 1] + ' mm, one row tall and one row short (plan and 3D).');
}

function archTest(a, v) {
  const { X0, X1, YF, YB, Z0, W, D } = a, n = v.n, bt = 2.5, at = 3, rs = [], gap = 2;
  for (let k = 0; k < n; k++) rs.push(5 + k * 3.5);
  const tot = rs.reduce((s, r) => s + 2 * r + at * 2, 0) + gap * (n - 1);
  let x = X0 + (W - tot) / 2;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bt);
  for (const r of rs) {
    const c = x + at + r;
    ring(a, 'y', c, Z0 + bt, YF + D * 0.18, YB - D * 0.18, r, r + at, 20, 0, m.PI); a.box(c - r - at, YF + D * 0.18, Z0 + bt, c - r, YB - D * 0.18, Z0 + bt + 1); a.box(c + r, YF + D * 0.18, Z0 + bt, c + r + at, YB - D * 0.18, Z0 + bt + 1);
    a.rect(c - r - at, YF + D * 0.18, c + r + at, YB - D * 0.18, 'EQUIP-DETAIL'); x += 2 * r + 2 * at + gap;
  }
  a.log('Added a base plate and ' + n + ' half-round arches of growing radius standing side by side (plan and 3D).');
}

function shapeSet(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, n = v.n, bt = 2.5, cols = n === 4 ? 2 : 3, rows = n === 3 ? 1 : 2, cw = (W - 6) / cols, rd = (D - 6) / rows, s = m.min(cw, rd) * 0.38;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bt);
  const kinds = ['cube', 'sphere', 'cone', 'cyl', 'pyr', 'cross'];
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = m.floor(i / cols), x = X0 + 3 + cw * (c + 0.5), y = YF + 3 + rd * (r + 0.5), k = kinds[i], z0 = Z0 + bt, hh = Z1 - z0;
    if (k === 'cube') { a.box(x - s, y - s, z0, x + s, y + s, z0 + 2 * s); a.rect(x - s, y - s, x + s, y + s, 'EQUIP-DETAIL'); }
    if (k === 'sphere') { a.ell(x, y, z0 + s, s, s, s, 16, 10); a.circ(x, y, s, 'EQUIP-DETAIL'); }
    if (k === 'cone') { a.cone(x, y, z0, z0 + hh * 0.95, s, 0.4, 16); a.circ(x, y, s, 'EQUIP-DETAIL'); }
    if (k === 'cyl') { a.cyl(x, y, z0, z0 + 2 * s, s, 16); a.circ(x, y, s, 'EQUIP-DETAIL'); }
    if (k === 'pyr') { a.cone(x, y, z0, z0 + hh * 0.95, s * 1.25, 0.4, 4); a.circ(x, y, s, 'EQUIP-DETAIL'); }
    if (k === 'cross') { a.box(x - s, y - s * 0.3, z0, x + s, y + s * 0.3, z0 + 2 * s * 0.9); a.box(x - s * 0.3, y - s, z0, x + s * 0.3, y + s, z0 + 2 * s * 0.9); a.rect(x - s, y - s * 0.3, x + s, y + s * 0.3, 'EQUIP-DETAIL'); }
  }
  void cx; void cy;
  a.log('Added a base plate carrying ' + n + ' basic shapes: ' + kinds.slice(0, n).map((k) => ({ cube: 'a cube', sphere: 'a sphere', cone: 'a cone', cyl: 'a cylinder', pyr: 'a four-sided pyramid', cross: 'a cross' }[k])).join(', ') + ' (plan and 3D).');
}

const ONE = (arr) => arr.map(([l, w, d, h, z = 0, p = {}]) => [l, w, d, h, z, p]);
const FAMS = [
  // ===================================================== printers (37) =====================================================
  fam({ cat: 'printing/printers', title: 'Generic single-tower cantilever 3D printer',
    desc: (v) => `Cantilever 3D printer with a plinth on feet, a ${v.bed} in heated bed on a Y carriage with rods, one rear tower with two Z rails, an arm carrying the hot end and a spool platform on top with a filament spool.`,
    vs: [['5 in bed', 11.5, 12, 16, 0, { bed: 5 }], ['7 in bed', 13.5, 14, 17, 0, { bed: 7 }], ['9 in bed', 15.5, 16, 18, 0, { bed: 9 }], ['11 in bed', 17.5, 18, 19, 0, { bed: 11 }]],
    build: cantilever }),
  fam({ cat: 'printing/printers', title: 'Generic polar 3D printer with turntable bed',
    desc: (v) => `Polar 3D printer with a round plinth, a ${v.bed} in turntable bed with a ribbed rim, a rear tower with two Z rails, a radial arm with the hot end and a flat spool on a platform on top.`,
    vs: [['6 in turntable', 10.7, 13.5, 14, 0, { bed: 6 }], ['8 in turntable', 12.7, 15.5, 15, 0, { bed: 8 }], ['10 in turntable', 14.7, 17.5, 16, 0, { bed: 10 }]],
    build: polar }),
  fam({ cat: 'printing/printers', title: 'Generic dual-carriage open-frame 3D printer',
    desc: (v) => `Open-frame 3D printer with a ${v.bed} in bed on lead screws, an X bar carrying two independent hot ends and two filament spools on roller pairs on top of the frame.`,
    vs: [['8 in bed', 13, 13, 17, 0, { bed: 8 }], ['10 in bed', 15, 15, 19, 0, { bed: 10 }], ['12 in bed', 17, 17, 21, 0, { bed: 12 }], ['16 in bed', 21, 21, 24, 0, { bed: 16 }]],
    build: idex }),
  fam({ cat: 'printing/printers', title: 'Generic multi-spool filament feeder bay',
    desc: (v) => `Feeder bay with a base on feet, long rollers carrying ${v.n} filament spools on their sides, thin dividers, a tube from each spool up to a guide bar and two end plates.`,
    vs: [['2 spools', 6.8, 8.3, 10.2, 0, { n: 2 }], ['4 spools', 12.8, 8.3, 10.2, 0, { n: 4 }], ['6 spools', 18.7, 8.3, 10.2, 0, { n: 6 }]],
    build: changerUnit }),
  fam({ cat: 'printing/printers', title: 'Generic resin wash and cure station',
    desc: 'Resin finishing station with a wash bin holding a stirrer base and a hanging basket, beside a cure box with a turntable, lamp strips, a front control and a hood opened on its hinge.',
    vs: [['tabletop, 4 in vats', 16, 9, 9], ['bench, 6 in vats', 22, 12, 11], ['large, 9 in vats', 30, 16, 14], ['workshop, 12 in vats', 38, 20, 16]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: washCure }),
  fam({ cat: 'printing/printers', title: 'Generic powder-bed sintering printer',
    desc: 'Floor-standing powder-bed printer on casters with two framed doors, a process chamber open at the front showing the feed and build wells, a recoater roller and a laser head on the roof.',
    vs: [['compact, 28 in', 28, 24, 56], ['mid-size, 40 in', 40, 30, 70], ['large, 56 in', 56, 40, 76]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: slsPrinter }),
  fam({ cat: 'printing/printers', title: 'Generic gantry construction 3D printer',
    desc: (v) => 'Construction-scale printer with four columns on foot plates, side beams and top rails, a bridge with a print head and supply hose, a pump skid with a hopper and a round printed wall in the middle.',
    vs: [['small site, 8 x 6 ft', 96, 72, 84], ['house wall, 12 x 8 ft', 144, 96, 102], ['large site, 20 x 12 ft', 240, 144, 126]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: concretePrinter }),
  fam({ cat: 'printing/printers', title: 'Generic belt 3D printer with sloped bed',
    desc: (v) => `Belt printer with two sloped side plates on feet, a long inclined belt bed with end rollers, a gantry across the belt carrying a hot end and a ${v.bed} in wide printed block lying on the belt.`,
    vs: [['6 in belt', 10, 18, 19, 0, { bed: 6 }], ['8 in belt', 12, 22, 23.5, 0, { bed: 8 }], ['10 in belt', 14, 26, 28, 0, { bed: 10 }], ['12 in belt', 16, 30, 32, 0, { bed: 12 }]],
    build: beltPrinter }),
  fam({ cat: 'printing/printers', title: 'Generic tool-changer 3D printer',
    desc: (v) => `Open-frame printer with a heated bed on lead screws, a gantry with one active hot end and a dock bar at the back for ${v.n} tool heads.`,
    vs: [['2 tool docks', 17, 18, 18, 0, { n: 2 }], ['3 tool docks', 19, 18, 18, 0, { n: 3 }], ['4 tool docks', 22, 19, 19, 0, { n: 4 }], ['6 tool docks', 28, 20, 19, 0, { n: 6 }]],
    build: toolChanger }),
  fam({ cat: 'printing/printers', title: 'Generic desktop filament maker',
    desc: 'Filament extruder on a bench base with a motor and gearbox, a barrel with four heater bands and a feed hopper, a die block, an open cooling trough, a puller with rollers and a winding spool.',
    vs: [['30 in line', 30, 12, 12], ['40 in line', 40, 14, 12], ['52 in line', 52, 16, 12]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: filamentMaker }),
  fam({ cat: 'printing/printers', title: 'Generic printer trolley',
    desc: (v) => `Trolley with four posts on casters, ${v.shelves} lipped shelves${v.drawer ? ', a drawer' : ''}, a push handle loop and a small printer shape on the top shelf.`,
    vs: [['two shelves, 24 in', 24, 18, 36, 0, { shelves: 2, drawer: false }], ['three shelves with drawer, 30 in', 30, 20, 44, 0, { shelves: 3, drawer: true }]],
    build: printCart }),
  // ===================================================== parts (37) =====================================================
  fam({ cat: 'printing/parts', title: 'Generic printed timing pulley',
    desc: (v) => `Printed timing pulley with two flanges, a ring of ${v.n} teeth between them, a bore, a hub collar and a set-screw boss.`,
    vs: [['16 teeth', 16, 5, 14, 0.2], ['20 teeth', 20, 5, 17, 0.2], ['36 teeth', 36, 8, 27, 0.31], ['60 teeth', 60, 8, 42, 0.31]].map(([l, n, bm, fd, b]) => [l, mm(fd), mm(fd), mm(n > 40 ? 18 : 16.5), 0, { n, bore: b, belt: 6 }]),
    build: pulley }),
  fam({ cat: 'printing/parts', title: 'Generic printed fluted knob',
    desc: (v) => `Printed knob with a skirt, a body with ${v.flutes} raised flutes, a top cap with a pointer line and a round insert hole.`,
    vs: [['0.8 in, 6 flutes', 0.8, 0.8, 0.6, 0, { flutes: 6, insert: 0.2 }], ['1.2 in, 8 flutes', 1.2, 1.2, 0.75, 0, { flutes: 8, insert: 0.25 }], ['1.6 in, 10 flutes', 1.6, 1.6, 0.9, 0, { flutes: 10, insert: 0.3 }], ['2.2 in, 12 flutes', 2.2, 2.2, 1.1, 0, { flutes: 12, insert: 0.35 }]],
    build: knob }),
  fam({ cat: 'printing/parts', title: 'Generic printed stepped hose adapter',
    desc: 'Printed hose adapter with a barbed end of three ridges, a hexagonal collar, a second smaller barbed end and a through bore.',
    vs: [['for 1/4 to 3/8 in hose', 1.5, 0.44, 0.44, 0, { od1: 0.28, od2: 0.42 }], ['for 3/8 to 1/2 in hose', 1.8, 0.57, 0.57, 0, { od1: 0.42, od2: 0.55 }], ['for 1/2 to 3/4 in hose', 2.1, 0.82, 0.82, 0, { od1: 0.55, od2: 0.8 }], ['for 3/4 to 1 in hose', 2.6, 1.07, 1.07, 0, { od1: 0.8, od2: 1.05 }]],
    build: hoseAdapter }),
  fam({ cat: 'printing/parts', title: 'Generic printed three-way corner bracket',
    desc: 'Printed corner bracket with a floor plate, a back plate and a side plate meeting in one corner, each with a bolt hole, and three gussets along the inside edges.',
    vs: [['small, 1.2 in leg', 1.2, 1.2, 1.2, 0, { t: 0.1, hole: 0.12 }], ['medium, 2 in leg', 2, 2, 2, 0, { t: 0.14, hole: 0.16 }], ['heavy, 3 in leg', 3, 3, 3, 0, { t: 0.2, hole: 0.22 }]],
    build: cornerBracket }),
  fam({ cat: 'printing/parts', title: 'Generic printed split rod clamp',
    desc: 'Printed rod clamp with two half rings around a rod bore with a thin split between them and screw ears on both sides with holes and screw heads on top.',
    vs: [['for 8 mm rod', mm(46), mm(14), mm(18), 0, { rod: mm(8), screw: 0.12 }], ['for 12 mm rod', mm(52), mm(16), mm(22), 0, { rod: mm(12), screw: 0.16 }], ['for 20 mm rod', mm(62), mm(20), mm(30), 0, { rod: mm(20), screw: 0.2 }], ['for 32 mm rod', mm(78), mm(26), mm(42), 0, { rod: mm(32), screw: 0.24 }]],
    build: rodClamp }),
  fam({ cat: 'printing/parts', title: 'Generic printed spool core adapter',
    desc: 'Printed spool adapter with a rim that fits a spool core with an outer lip, a centre ring with an axle bore and three spokes joining them.',
    vs: [['for 30 mm spool core', mm(38), mm(38), mm(20), 0, { bore: 0.2 }], ['for 52 mm spool core', mm(60), mm(60), mm(20), 0, { bore: 0.315 }], ['for 70 mm spool core', mm(78), mm(78), mm(22), 0, { bore: 0.5 }]],
    build: spoolAdapter }),
  fam({ cat: 'printing/parts', title: 'Generic printed leaning device stand',
    desc: 'Printed stand with two triangular side cheeks, a leaning rest plate on the slope, a front lip, a back rail and a base plate with a cable hole.',
    vs: [['for a phone, 3 in wide', 3, 4.2, 3.6], ['for a large phone, 4.2 in wide', 4.2, 5, 4.4], ['for a small tablet, 7 in wide', 7, 6.5, 5.5], ['for a tablet, 9 in wide', 9, 7.5, 7]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: phoneStand }),
  fam({ cat: 'printing/parts', title: 'Generic printed J wall hook',
    desc: (v) => `Printed hook board with a wall plate with two screw holes and ${v.n} round J hook${v.n > 1 ? 's' : ''} with a curved tip, each braced to the plate by a triangular rib.`,
    vs: [['single, short', 1, 2.2, 3.2, 0, { n: 1, rod: 0.2 }], ['single, long reach', 1, 3.5, 4, 0, { n: 1, rod: 0.25 }], ['double', 3, 2.6, 3.4, 0, { n: 2, rod: 0.2 }], ['triple', 4.5, 2.6, 3.4, 0, { n: 3, rod: 0.2 }]],
    build: wallHook }),
  fam({ cat: 'printing/parts', title: 'Generic printed square flange bearing mount',
    desc: 'Printed bearing mount with a square flange plate with four bolt holes, a raised collar with a bearing bore and a thicker root ring.',
    vs: [['for 8 mm bearing', 1.5, 1.5, 0.5, 0, { base: 0.12, bore: 0.157, screw: 0.12 }], ['for 12 mm bearing', 2, 2, 0.65, 0, { base: 0.14, bore: 0.236, screw: 0.14 }], ['for 20 mm bearing', 2.6, 2.6, 0.8, 0, { base: 0.18, bore: 0.394, screw: 0.16 }]],
    build: flangeMount }),
  fam({ cat: 'printing/parts', title: 'Generic printed fan duct',
    desc: 'Printed duct with a square fan plate with four screw holes, a round intake collar, a tapering duct and a flattened mouth with a lip.',
    vs: [['for a 30 mm fan', 30, 28], ['for a 40 mm fan', 40, 32], ['for a 50 mm fan', 50, 38], ['for a 60 mm fan', 60, 44]].map(([l, f, h]) => [l, mm(f + 4), mm(f + 4), mm(h), 0, { fan: f }]),
    build: fanDuct }),
  // ===================================================== fixtures (38) =====================================================
  fam({ cat: 'printing/fixtures', title: 'Generic modular storage bin',
    desc: (v) => `Storage bin with a floor, three full walls, a front wall with a scooped cut-out between two posts and a label ledge, and dividers making ${v.gx * v.gy} compartment${v.gx * v.gy > 1 ? 's' : ''}.`,
    vs: [['1 x 1 unit, 3 high', 1, 1, 3], ['2 x 1 units, 3 high', 2, 1, 3], ['2 x 2 units, 4 high', 2, 2, 4], ['3 x 2 units, 5 high', 3, 2, 5], ['4 x 3 units, 6 high', 4, 3, 6]].map(([l, gx, gy, hz]) => [l, mm(gx * 42 - 0.5), mm(gy * 42 - 0.5), mm(hz * 7 + 4.5), 0, { gx, gy }]),
    build: storageBin }),
  fam({ cat: 'printing/fixtures', title: 'Generic printed hex key stand',
    desc: (v) => `Stand with a base and ${v.n} stepped sockets growing in size, each with a hex collar and a hex key standing in it.`,
    vs: [['7 keys', 7, 4.4], ['9 keys', 9, 5.6], ['13 keys', 13, 7.9]].map(([l, n, w]) => [l, w, 0.9, 2.4, 0, { n }]),
    build: hexKeys }),
  fam({ cat: 'printing/fixtures', title: 'Generic printed spool axle stand',
    desc: (v) => `Stand with a base and two upright cheeks that cradle a thin axle rod with end knobs and carry ${v.n} filament spool${v.n > 1 ? 's' : ''} side by side.`,
    vs: [['one spool', 4.1, 9, 10, 0, { n: 1 }], ['two spools', 7.2, 9, 10, 0, { n: 2 }], ['three spools', 10.3, 9, 10, 0, { n: 3 }], ['four spools', 13.4, 9, 10, 0, { n: 4 }]],
    build: spoolAxle }),
  fam({ cat: 'printing/fixtures', title: 'Generic printed divider tray',
    desc: (v) => `Tray with a floor, four walls with a finger notch at the front and a grid of ${v.cols * v.rows} compartments whose divider heights alternate.`,
    vs: [['3 x 2 compartments', 3, 2], ['4 x 3 compartments', 4, 3], ['6 x 3 compartments', 6, 3], ['6 x 4 compartments', 6, 4]].map(([l, cols, rows]) => [l, cols * 1.15, rows * 1.15, 0.9, 0, { cols, rows }]),
    build: dividerTray }),
  fam({ cat: 'printing/fixtures', title: 'Generic printed soldering stand',
    desc: (v) => `Stand with a base with two screw holes and ${v.cradles} ring cradle${v.cradles > 1 ? 's' : ''} on posts${v.cup ? ', a round tip-cleaning cup' : ''}${v.reel ? ' and a solder reel on a pin' : ''}.`,
    vs: [['one cradle', 3.4, 3, 3.2, 0, { cradles: 1, cup: false, reel: false }], ['two cradles with tip cup', 5.2, 3.4, 3.2, 0, { cradles: 2, cup: true, reel: false }], ['two cradles, cup and reel', 6.4, 3.6, 3.8, 0, { cradles: 2, cup: true, reel: true }]],
    build: solderStand }),
  fam({ cat: 'printing/fixtures', title: 'Generic printed soft vise jaw pair',
    desc: 'Pair of jaws with backing plates with screw holes, thick jaw blocks with a shaped seat on their inner faces and a round workpiece held between them.',
    vs: [['for a 3 in vise', 3.4, 1.5, 1.2], ['for a 4 in vise', 4.4, 1.8, 1.5], ['for a 6 in vise', 6.4, 2.2, 2]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: softJaws }),
  fam({ cat: 'printing/fixtures', title: 'Generic printed caliper holder',
    desc: (v) => `Holder with a wall plate with two screw holes, a slotted shelf with two side ribs and a ${v.len} in measuring tool standing in the slot with its bar, slider and jaws.`,
    vs: [['for a 6 in caliper', 1.6, 1.6, 8, 0, { len: 6 }], ['for an 8 in caliper', 1.6, 1.6, 10.5, 0, { len: 8 }], ['for a 12 in caliper', 1.6, 1.6, 15.5, 0, { len: 12 }]],
    build: caliperHolder }),
  fam({ cat: 'printing/fixtures', title: 'Generic printed slotted rail tool holder',
    desc: (v) => `Slotted wall rail with side flanges and ${v.n} clip-on holders alternating between a round ring clip with a tool handle in it and a forked rest.`,
    vs: [['2 holders', 1.6, 1.6, 4.5, 0, { n: 2 }], ['3 holders', 1.6, 1.6, 6.2, 0, { n: 3 }], ['4 holders', 1.6, 1.6, 8, 0, { n: 4 }], ['6 holders', 1.6, 1.6, 11.5, 0, { n: 6 }]],
    build: railHolder }),
  fam({ cat: 'printing/fixtures', title: 'Generic printed circuit board mount',
    desc: 'Base plate with four screw holes, four round standoffs, a circuit-board shape on them with two component blocks and a cable tab at the front.',
    vs: [['3 x 2.2 in board', 3, 2.2, 0.55], ['4 x 3 in board', 4, 3, 0.6], ['6 x 4 in board', 6, 4, 0.7]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: circuitMount }),
  fam({ cat: 'printing/fixtures', title: 'Generic printed cable chain run',
    desc: (v) => `Run of ${v.links} chain links, each with two cheeks, a floor bar and a top bar closed on alternate links, between two end mounts with a screw hole each and a cable stub.`,
    vs: [['10 links', 10, 7.7], ['16 links', 16, 11.6], ['24 links', 24, 16.6]].map(([l, links, w]) => [l, w, 1.1, 0.7, 0, { links }]),
    build: cableChain }),
  fam({ cat: 'printing/fixtures', title: 'Generic printed screwdriver bit rack',
    desc: (v) => `Stepped block with two tiers of ${v.cols} hex holes each, most holding a screwdriver bit, with the back tier higher.`,
    vs: [['12 bits', 6, 2.8], ['18 bits', 9, 4], ['30 bits', 15, 6.5]].map(([l, cols, w]) => [l, w, 1.4, 1.2, 0, { cols }]),
    build: bitRack }),
  // ===================================================== calibration (38) =====================================================
  fam({ cat: 'printing/calibration', title: 'Generic first-layer test plate',
    desc: (v) => `First-layer test with a base plate, an upright test plate on two rear braces and a raised ${v.kind === 'squares' ? 'set of four nested square outlines' : v.kind === 'rings' ? 'set of four rings with a cross' : 'grid of lines'} on its face.`,
    vs: [['nested squares, 3 in', 3, 2.5, 3.2, 0, { kind: 'squares' }], ['rings and cross, 4 in', 4, 2.5, 4.2, 0, { kind: 'rings' }], ['line grid, 6 in', 6, 2.5, 6.3, 0, { kind: 'grid' }]],
    build: firstLayer }),
  fam({ cat: 'printing/calibration', title: 'Generic single-wall flow test',
    desc: (v) => `Flow test with a thin floor and a ${v.shape} single-perimeter wall about one line wide, open at the top.`,
    vs: [['square, 20 mm', mm(20), mm(20), mm(20), 0, { shape: 'square' }], ['round, 30 mm', mm(30), mm(30), mm(30), 0, { shape: 'round' }], ['hexagon, 40 mm', mm(40), mm(40), mm(40), 0, { shape: 'hex' }]],
    build: flowWall }),
  fam({ cat: 'printing/calibration', title: 'Generic ringing test block',
    desc: 'Test block with a base, a wall rising in four sharp steps along the back and a front row of five round posts that grow in size.',
    vs: [['20 mm', 20], ['30 mm', 30], ['40 mm', 40]].map(([l, L]) => [l, mm(L), mm(L * 0.8), mm(L * 0.9), 0, {}]),
    build: ringingTest }),
  fam({ cat: 'printing/calibration', title: 'Generic stepped size-accuracy block',
    desc: (v) => `Size test with ${v.steps} stacked square steps that shrink on all four sides, each step the same height.`,
    vs: [['3 steps', 3, 24], ['4 steps', 4, 30], ['5 steps', 5, 36], ['6 steps', 6, 40]].map(([l, steps, w]) => [l, mm(w), mm(w), mm(steps * 5), 0, { steps }]),
    build: steppedBlock }),
  fam({ cat: 'printing/calibration', title: 'Generic support-removal test',
    desc: 'Support test with a base plate, two towers, a bridge between them with an arch hanging under it, a flat overhang arm on one tower and a 45 degree wedge on the other.',
    vs: [['30 mm', 30], ['45 mm', 45], ['60 mm', 60]].map(([l, L]) => [l, mm(L), mm(L * 0.3), mm(L * 0.7), 0, {}]),
    build: supportTest }),
  fam({ cat: 'printing/calibration', title: 'Generic nested clearance rings',
    desc: (v) => `Print-in-place test with a thin disc, ${v.n} nested rings separated by ${v.gap} mm gaps and a solid core.`,
    vs: [['2 rings, 0.3 mm gap', 2, 0.3, 24], ['3 rings, 0.4 mm gap', 3, 0.4, 32], ['4 rings, 0.5 mm gap', 4, 0.5, 40]].map(([l, n, gap, d]) => [l, mm(d), mm(d), mm(8), 0, { n, gap }]),
    build: gapRings }),
  fam({ cat: 'printing/calibration', title: 'Generic thread fit test',
    desc: 'Thread test with a base plate, a bolt with a hex head and a ridged shank, and a round nut with a ridged bore, with thread pitch shown as stacked rings.',
    vs: [['6 mm thread', 6, 1], ['8 mm thread', 8, 1.25], ['10 mm thread', 10, 1.5], ['12 mm thread', 12, 1.75]].map(([l, d, p]) => [l, mm(d * 6), mm(d * 3.4), mm(d * 3.4), 0, { dia: d, pitch: p }]),
    build: threadTest }),
  fam({ cat: 'printing/calibration', title: 'Generic spiral vase test',
    desc: (v) => `Vase test with a base disc and a single-wall vase made of ${v.rings} stacked rings whose radius swells and narrows ${v.waves} times.`,
    vs: [['60 mm, 2 waves', 60, 16, 2], ['80 mm, 3 waves', 80, 22, 3], ['100 mm, 4 waves', 100, 28, 4]].map(([l, h, rings, waves]) => [l, mm(50), mm(50), mm(h), 0, { rings, waves }]),
    build: spiralVase }),
  fam({ cat: 'printing/calibration', title: 'Generic sharp corner star test',
    desc: (v) => `Corner test with a round base disc and a ${v.points} pointed star in two tiers with sharp tips and inner corners.`,
    vs: [['5 points', 5], ['6 points', 6], ['8 points', 8]].map(([l, points]) => [l, mm(40), mm(40), mm(18), 0, { points }]),
    build: starTest }),
  fam({ cat: 'printing/calibration', title: 'Generic micro pillar test',
    desc: (v) => `Fine-detail test with a base plate and two rows of ${v.n} round pillars that thin down in diameter, one row tall and one row short.`,
    vs: [['5 pillars', 5], ['7 pillars', 7], ['9 pillars', 9]].map(([l, n]) => [l, mm(n * 8 + 4), mm(30), mm(20), 0, { n }]),
    build: pillarTest }),
  fam({ cat: 'printing/calibration', title: 'Generic arch curve test',
    desc: (v) => `Curve test with a base plate and ${v.n} half-round arches of growing radius standing side by side.`,
    vs: [['2 arches', 2, 46, 16], ['3 arches', 3, 78, 20], ['5 arches', 5, 165, 27]].map(([l, n, w, h]) => [l, mm(w), mm(24), mm(h), 0, { n }]),
    build: archTest }),
  fam({ cat: 'printing/calibration', title: 'Generic basic shapes test plate',
    desc: (v) => `Shape test with a base plate carrying ${v.n} basic solids.`,
    vs: [['3 shapes', 3, 75, 28], ['4 shapes', 4, 52, 52], ['6 shapes', 6, 78, 52]].map(([l, n, w, d]) => [l, mm(w), mm(d), mm(25), 0, { n }]),
    build: shapeSet }),
];
export default FAMS;

/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, printing: 3D printers by frame type, printed parts, jigs and holders, calibration prints. Original geometry; generic shapes, no maker or model. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, TAU = m.PI * 2;

// ------------------------------------------------------------------------------------------ helpers
/** map a (u, v, w) point onto the axis frame: 'z' = plate in plan (u=x, v=y, w=z), 'y' = plate in the front (u=x, v=z, w=y), 'x' = side plate (u=y, v=z, w=x) */
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
/** a plate (u0..u1, v0..v1, thickness w0..w1) with round holes; each hole is a square cut closed by a ring with a round bore */
function plateH(a, ax, u0, v0, u1, v1, w0, w1, holes = [], seg = 10) {
  const M = MAP[ax], B = (p, q, r, s, t, w) => a.box(...M(p, q, r).map((x, i) => x), ...M(s, t, w).map((x) => x));
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
  void B;
}
const hole = (u, v, r) => ({ u, v, r });
/** extrude a convex polygon given as [x, z] points between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** extrude a convex polygon given as [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** a filament spool with its axis along X (flanges, core, wound filament) */
function spoolX(a, x, y, z, r, w) {
  ring(a, 'x', y, z, x - w / 2, x - w / 2 + 4, 0, r, 18); ring(a, 'x', y, z, x + w / 2 - 4, x + w / 2, 0, r, 18);
  ring(a, 'x', y, z, x - w / 2 + 4, x + w / 2 - 4, r * 0.38, r * 0.8, 16);
  a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL');
}
/** a filament spool with its axis along Y */
function spoolY(a, x, y0, y1, z, r) {
  ring(a, 'y', x, z, y0, y0 + 4, 0, r, 18); ring(a, 'y', x, z, y1 - 4, y1, 0, r, 18);
  ring(a, 'y', x, z, y0 + 4, y1 - 4, r * 0.38, r * 0.8, 16);
  a.circ(x, (y0 + y1) / 2, 0.01, 'EQUIP-DETAIL');
}
/** a flat spool (axis vertical) at plan (x, y) from z0, height h */
function spoolZ(a, x, y, z0, r, h) {
  ring(a, 'z', x, y, z0, z0 + 4, 0, r, 18); ring(a, 'z', x, y, z0 + h - 4, z0 + h, 0, r, 18);
  ring(a, 'z', x, y, z0 + 4, z0 + h - 4, r * 0.38, r * 0.8, 16);
  a.circ(x, y, r, 'EQUIP-DETAIL'); a.circ(x, y, r * 0.38, 'EQUIP-DETAIL');
}
/** a hot end: carriage block, fan shroud, heat sink, heater block and nozzle, hanging from z (top) at (x, y) */
function hotend(a, x, y, z, s = 1) {
  a.box(x - 30 * s, y - 14 * s, z - 70 * s, x + 30 * s, y + 14 * s, z); a.box(x - 22 * s, y - 50 * s, z - 70 * s, x + 22 * s, y - 14 * s, z - 28 * s);
  a.cyl(x, y - 30 * s, z - 105 * s, z - 70 * s, 12 * s, 10); a.box(x - 12 * s, y - 42 * s, z - 125 * s, x + 12 * s, y - 18 * s, z - 105 * s);
  a.cone(x, y - 30 * s, z - 142 * s, z - 125 * s, 1.5 * s, 7 * s, 8);
  a.rect(x - 30 * s, y - 50 * s, x + 30 * s, y + 14 * s, 'EQUIP-DETAIL');
}
const ext = (a, x0, y0, z0, x1, y1, z1) => a.box(x0, y0, z0, x1, y1, z1);
/** an open hinged lid at the back: a hood of two cheeks, a top and a front, rotated by theta degrees about (hy, hz) */
function openLid(a, x0, x1, hy, hz, depth, height, theta) {
  const th = (theta * m.PI) / 180, f = [-m.cos(th), m.sin(th)], u = [m.sin(th), m.cos(th)];
  const P = (al, up) => [hy + al * f[0] + up * u[0], hz + al * f[1] + up * u[1]];
  prismX(a, [P(0, 0), P(depth, 0), P(depth, height), P(0, height)], x0, x0 + 8);
  prismX(a, [P(0, 0), P(depth, 0), P(depth, height), P(0, height)], x1 - 8, x1);
  prismX(a, [P(0, height - 8), P(depth, height - 8), P(depth, height), P(0, height)], x0, x1);
  prismX(a, [P(depth - 8, 0), P(depth, 0), P(depth, height), P(depth - 8, height)], x0, x1);
}

// ------------------------------------------------------------------------------------------ printers
const printerBase = (a, h = 55) => {
  const { X0, X1, YF, YB, Z0, cx } = a, t = 24;
  a.box(X0 + 12, YF + 12, Z0 + 12, X1 - 12, YF + 12 + t, Z0 + h); a.box(X0 + 12, YB - 12 - t, Z0 + 12, X1 - 12, YB - 12, Z0 + h);
  a.box(X0 + 12, YF + 12, Z0 + 12, X0 + 12 + t, YB - 12, Z0 + h); a.box(X1 - 12 - t, YF + 12, Z0 + 12, X1 - 12, YB - 12, Z0 + h);
  for (const sx of [-1, 1]) for (const y of [YF + 24, YB - 24]) a.cyl(cx + sx * (a.W / 2 - 24), y, Z0, Z0 + 12, 12, 8);
};

function cartesian(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, uw = 40, up = YB - D * 0.5, bedW = v.bed * IN, bedD = bedW * 1.0, spR = m.min(95, D * 0.2);
  printerBase(a, 70); a.outline();
  a.box(X0 + 50, YB - 160, Z0 + 12, X0 + 50 + 150, YB - 40, Z0 + 12 + 80);           // electronics box
  // y carriage + heated bed
  const bz = Z0 + 110, by0 = YF + D * 0.12;
  a.box(cx - bedW / 2 - 8, by0, bz - 18, cx + bedW / 2 + 8, by0 + bedD + 16, bz); a.box(cx - bedW / 2, by0 + 8, bz, cx + bedW / 2, by0 + 8 + bedD, bz + 6);
  a.box(cx - bedW / 2 + 4, by0 + 12, bz + 6, cx + bedW / 2 - 4, by0 + 4 + bedD, bz + 10);
  for (const sx of [-1, 1]) for (const y of [by0 + 20, by0 + bedD - 4]) a.cyl(cx + sx * (bedW / 2 - 20), y, bz - 70, bz - 18, 5, 6);
  for (const sx of [-1, 1]) a.ycyl(YF + 40, YB - 40, cx + sx * (bedW * 0.32), Z0 + 78, 5, 8);
  a.rect(cx - bedW / 2, by0, cx + bedW / 2, by0 + bedD, 'EQUIP-DETAIL');
  // uprights, top bar, x rail
  const zr = Z0 + H * 0.62;
  for (const sx of [-1, 1]) { const x = cx + sx * (W / 2 - 50); ext(a, x - uw / 2, up - uw / 2, Z0 + 70, x + uw / 2, up + uw / 2, Z1 - 20); a.box(x - 36, up - 26, Z0 + 70, x + 36, up + 26, Z0 + 100); }
  ext(a, X0 + 50 - uw / 2, up - uw / 2, Z1 - 20 - uw, X1 - 50 + uw / 2, up + uw / 2, Z1 - 20);
  ext(a, X0 + 50, up - uw / 2 - 6, zr, X1 - 50, up + uw / 2 + 6, zr + 30);
  a.xcyl(X0 + 50, X1 - 50, up - uw / 2 - 12, zr + 40, 5, 8);
  const hx = cx + (W * 0.1);
  a.box(hx - 34, up - uw / 2 - 20, zr - 15, hx + 34, up - uw / 2 - 5, zr + 55); hotend(a, hx, up - uw / 2 - 20, zr + 55);
  a.rect(X0 + 50, up - uw / 2, X1 - 50, up + uw / 2, 'EQUIP-DETAIL'); a.rect(hx - 34, up - 50, hx + 34, up - 10, 'EQUIP-DETAIL');
  // spool holder behind the uprights
  const sz = Z1 - spR - 10, sy = YB - spR - 10;
  for (const sx of [-1, 1]) a.tube([[cx + sx * (W / 2 - 50), up + uw / 2, sz], [cx + sx * (W / 2 - 50), sy, sz]], [8, 8], 6);
  a.xcyl(cx - (W / 2 - 50), cx + (W / 2 - 50), sy, sz, 5, 8); spoolX(a, cx, sy, sz, spR, 70);
  // lcd
  a.box(X1 - 50 - 55, YF + 12, Z0 + 12, X1 - 50, YF + 40, Z0 + 12 + 70); a.box(X1 - 100, YF + 4, Z0 + 30, X1 - 60, YF + 14, Z0 + 56);
  a.log('Added the base frame, electronics box, heated bed on its Y carriage with rods, two uprights with top bar, X rail with hot end carriage and a spool holder with a filament spool (plan and 3D).');
}

function corexy(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, p = 22, spR = m.min(95, W * 0.2), zt = Z1 - 2 * spR - 40;
  a.outline();
  for (const [x, y] of [[X0, YF], [X1 - p, YF], [X0, YB - p], [X1 - p, YB - p]]) ext(a, x, y, Z0 + 20, x + p, y + p, zt);
  for (const z of [Z0 + 20, zt - p]) { ext(a, X0, YF, z, X1, YF + p, z + p); ext(a, X0, YB - p, z, X1, YB, z + p); ext(a, X0, YF, z, X0 + p, YB, z + p); ext(a, X1 - p, YF, z, X1, YB, z + p); }
  a.box(X0 + 10, YF + 10, Z0, X1 - 10, YB - 10, Z0 + 22);
  for (const sx of [-1, 1]) for (const sy of [0, 1]) a.cyl(cx + sx * (W / 2 - 30), sy ? YB - 30 : YF + 30, Z0, Z0 + 20, 14, 8);
  // panels: back and sides solid, front door as a frame with a handle, top lid frame
  a.box(X0 + p, YB - 5, Z0 + 22 + p, X1 - p, YB, zt - p); a.box(X0 + p - 4, YF + p, Z0 + 22 + p, X0 + p, YB - p, zt - p); a.box(X1 - p, YF + p, Z0 + 22 + p, X1 - p + 4, YB - p, zt - p);
  a.frame(X0 + p, Z0 + 22 + 80, X1 - p, zt - p, YF - 0 + 2, YF + 10, 28);
  a.box(X1 - p - 30, YF - 10, Z0 + 22 + (zt - Z0) * 0.5, X1 - p - 22, YF + 2, Z0 + 22 + (zt - Z0) * 0.5 + 120);
  a.box(X0 + p, YF + 2, Z0 + 22, X1 - p, YF + 14, Z0 + 22 + 80);
  a.box(X1 - 140, YF - 6, Z0 + 28, X1 - 70, YF + 4, Z0 + 70);
  // inside: bed on two screws, gantry, hot end
  const bw = W * 0.58, bz = Z0 + 22 + (zt - Z0) * 0.35;
  a.box(cx - bw / 2, YF + D * 0.2, bz, cx + bw / 2, YF + D * 0.2 + bw * 0.95, bz + 10); a.box(cx - bw / 2 - 12, YF + D * 0.2 - 8, bz - 14, cx + bw / 2 + 12, YF + D * 0.2 + bw * 0.95 + 8, bz);
  for (const sx of [-1, 1]) a.cyl(cx + sx * (W / 2 - 55), YB - 55, Z0 + 22, zt - p, 5, 6);
  for (const sx of [-1, 1]) { a.ycyl(YF + p, YB - p, cx + sx * (W / 2 - 50), zt - p - 20, 5, 8); }
  const gy = YF + D * 0.5;
  ext(a, X0 + p, gy - 10, zt - p - 32, X1 - p, gy + 10, zt - p - 12); hotend(a, cx + W * 0.08, gy - 10, zt - p - 12);
  a.rect(X0 + p, gy - 10, X1 - p, gy + 10, 'EQUIP-DETAIL'); a.rect(cx - bw / 2, YF + D * 0.2, cx + bw / 2, YF + D * 0.2 + bw * 0.95, 'EQUIP-DETAIL');
  // spool holder and spool on top
  const sy = YB - spR - 20, sz = zt + spR + 14;
  for (const sx of [-1, 1]) a.box(cx + sx * 55 - 8, sy - 10, zt, cx + sx * 55 + 8, sy + 10, sz);
  a.xcyl(cx - 62, cx + 62, sy, sz, 5, 8); spoolX(a, cx, sy, sz, spR, 70);
  a.log('Added the extrusion frame with feet, back and side panels, a framed front door with handle, the bed on lead screws, the gantry with hot end and a spool on top (plan and 3D).');
}

function deltaPrinter(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, H, cx, cy } = a, R = W / 2 - 24, ang = [90, 210, 330].map((d) => (d * m.PI) / 180), bedR = v.bed * IN / 2, spR = m.min(95, W * 0.16), top = Z1 - 2 * spR - 40;
  a.circ(cx, cy, W / 2); a.circ(cx, cy, bedR, 'EQUIP-DETAIL');
  const hex = [0, 1, 2, 3, 4, 5].map((i) => [cx + (W / 2 - 2) * m.cos((i * m.PI) / 3 + 0.5236), cy + (W / 2 - 2) * m.sin((i * m.PI) / 3 + 0.5236)]);
  a.prism(hex, Z0 + 10, Z0 + 70); for (const q of [0, 2, 4]) a.cyl(hex[q][0] * 0.9 + cx * 0.1, hex[q][1] * 0.9 + cy * 0.1, Z0, Z0 + 10, 14, 8);
  ring(a, 'z', cx, cy, Z0 + 70, Z0 + 84, 0, bedR + 8, 24); ring(a, 'z', cx, cy, Z0 + 84, Z0 + 92, 0, bedR, 24);
  const T = ang.map((g) => [cx + R * m.cos(g), cy + R * m.sin(g)]);
  const zc = [0.78, 0.74, 0.7].map((f) => Z0 + (top - Z0) * f);
  T.forEach(([x, y], i) => {
    a.box(x - 11, y - 11, Z0 + 70, x + 11, y + 11, top); a.box(x - 26, y - 26, zc[i], x + 26, y + 26, zc[i] + 38); a.circ(x, y, 16, 'EQUIP-DETAIL');
    a.tube([[x, y, Z0 + 72], [x, y, Z0 + 72]].map((p) => p), [1, 1], 4);
    const nx = T[(i + 1) % 3];
    a.tube([[x, y, top - 10], [nx[0], nx[1], top - 10]], [10, 10], 6);
    const px = cx + 35 * m.cos(ang[i] + 0.3), py = cy + 35 * m.sin(ang[i] + 0.3), ez = Z0 + (top - Z0) * 0.5;
    for (const s of [-1, 1]) { a.tube([[x - s * 20 * -m.sin(ang[i]), y - s * 20 * m.cos(ang[i]), zc[i] + 19], [px + s * 12 * -m.sin(ang[i]), py + s * 12 * m.cos(ang[i]), ez + 12]], [4, 4], 5); }
  });
  const ez = Z0 + (top - Z0) * 0.5;
  ring(a, 'z', cx, cy, ez, ez + 24, 0, 52, 6); a.cone(cx, cy, ez - 40, ez, 2, 8, 8); a.cyl(cx, cy, ez + 24, ez + 60, 12, 8); a.circ(cx, cy, 52, 'EQUIP-DETAIL');
  for (const s of [-1, 1]) a.box(cx + s * 60 - 8, cy - 10, top, cx + s * 60 + 8, cy + 10, top + 14 + 0);
  const sz = top + spR + 14;
  for (const s of [-1, 1]) a.box(cx + s * 55 - 8, cy - 10, top - 10, cx + s * 55 + 8, cy + 10, sz);
  a.xcyl(cx - 62, cx + 62, cy, sz, 5, 8); spoolX(a, cx, cy, sz, spR, 70);
  a.log('Added the hexagonal base with round bed, three corner towers with carriages, the top ring, arm pairs to the effector with hot end, and a spool on a top bracket (plan and 3D).');
}

function resin(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, bh = H * 0.34, vw = W * 0.72, vd = D * 0.5;
  a.outline();
  prismX(a, [[YF, Z0 + 6], [YB, Z0 + 6], [YB, Z0 + bh], [YF + D * 0.1, Z0 + bh], [YF, Z0 + bh * 0.82]], X0 + 8, X1 - 8);
  for (const sx of [-1, 1]) for (const y of [YF + 40, YB - 40]) a.cyl(cx + sx * (W / 2 - 40), y, Z0, Z0 + 8, 14, 8);
  // vat with its frame and window
  const vy = YF + D * 0.3;
  a.box(cx - vw / 2, vy, Z0 + bh, cx + vw / 2, vy + vd, Z0 + bh + 22); a.box(cx - vw / 2 + 14, vy + 14, Z0 + bh + 22, cx + vw / 2 - 14, vy + vd - 14, Z0 + bh + 30);
  a.rect(cx - vw / 2, vy, cx + vw / 2, vy + vd, 'EQUIP-DETAIL'); a.rect(cx - vw / 2 + 14, vy + 14, cx + vw / 2 - 14, vy + vd - 14, 'EQUIP-DETAIL');
  for (const sx of [-1, 1]) a.cyl(cx + sx * (vw / 2 - 20), vy + 20, Z0 + bh + 22, Z0 + bh + 40, 7, 8);
  // z column at the back, arm and build plate
  a.box(cx - vw / 2 - 20, YB - 90, Z0 + bh, cx + vw / 2 + 20, YB - 10, Z1 - H * 0.12);
  a.box(cx - vw * 0.35, YB - 150, Z0 + bh + H * 0.2, cx + vw * 0.35, YB - 90, Z0 + bh + H * 0.2 + 36);
  a.box(cx - vw / 2 + 25, vy + 25, Z0 + bh + H * 0.2 - 4, cx + vw / 2 - 25, vy + vd - 25, Z0 + bh + H * 0.2 + 10);
  a.box(cx - 8, vy + vd - 25, Z0 + bh + H * 0.2 + 10, cx + 8, YB - 150, Z0 + bh + H * 0.2 + 36);
  a.rect(cx - vw / 2 + 25, vy + 25, cx + vw / 2 - 25, vy + vd - 25, 'EQUIP-DETAIL');
  // open hood hinged at the back
  openLid(a, cx - W / 2 + 10, cx + W / 2 - 10, YB - D * 0.05 - H * 0.2 - 30, Z0 + bh + 6, D * 0.55, H * 0.2, 96);
  // screen and button on the front
  a.box(cx + W * 0.1, YF - 0, Z0 + bh * 0.3, cx + W * 0.36, YF + 8, Z0 + bh * 0.7); a.cyl(cx - W * 0.25, YF + 14, Z0 + bh * 0.5, Z0 + bh * 0.5 + 6, 18, 12);
  a.log('Added the sloped base with screen, the resin vat with window frame, Z column with arm and build plate, and the tinted hood opened on its rear hinge (plan and 3D).');
}

function largeFormat(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, lw = 60, bw = W - 2 * lw - 90, bd = D - 2 * lw - 60, bz = Z0 + H * 0.3;
  a.outline();
  for (const [x, y] of [[X0, YF], [X1 - lw, YF], [X0, YB - lw], [X1 - lw, YB - lw]]) { ext(a, x, y, Z0 + 40, x + lw, y + lw, Z1); a.box(x - 4, y - 4, Z0, x + lw + 4, y + lw + 4, Z0 + 40); }
  for (const z of [Z0 + 40, Z0 + 40 + H * 0.12]) { ext(a, X0 + lw, YF, z, X1 - lw, YF + lw * 0.8, z + 40); ext(a, X0 + lw, YB - lw * 0.8, z, X1 - lw, YB, z + 40); ext(a, X0, YF + lw, z, X0 + lw * 0.8, YB - lw, z + 40); ext(a, X1 - lw * 0.8, YF + lw, z, X1, YB - lw, z + 40); }
  ext(a, cx - bw / 2 - 20, YF + lw + 20, bz - 40, cx + bw / 2 + 20, YB - lw - 20, bz - 10);
  a.box(cx - bw / 2, YF + lw + 30, bz - 10, cx + bw / 2, YB - lw - 30, bz + 14); a.rect(cx - bw / 2, YF + lw + 30, cx + bw / 2, YB - lw - 30, 'EQUIP-DETAIL');
  for (const sx of [-1, 1]) a.ycyl(YF + lw, YB - lw, cx + sx * (W / 2 - lw / 2), Z1 - 100, 12, 8);
  ext(a, X0, YF + lw, Z1 - 120, X0 + lw, YB - lw, Z1); ext(a, X1 - lw, YF + lw, Z1 - 120, X1, YB - lw, Z1);
  const gy = YF + D * 0.42;
  ext(a, X0 + lw, gy - 25, Z1 - 150, X1 - lw, gy + 25, Z1 - 70); a.xcyl(X0 + lw, X1 - lw, gy - 40, Z1 - 110, 10, 8);
  const hx = cx + W * 0.12;
  a.box(hx - 60, gy - 60, Z1 - 200, hx + 60, gy - 25, Z1 - 60);
  if (v.pellet) { a.cone(hx, gy - 70, Z1 - 260, Z1 - 200, 25, 70, 12); a.cyl(hx, gy - 70, Z1 - 200, Z1 - 60, 70, 14); a.cone(hx, gy - 70, Z1 - 60, Z1 - 5, 70, 110, 14); a.circ(hx, gy - 70, 110, 'EQUIP-DETAIL'); }
  else hotend(a, hx, gy - 40, Z1 - 140, 1.8);
  a.rect(X0 + lw, gy - 25, X1 - lw, gy + 25, 'EQUIP-DETAIL');
  a.log('Added four corner posts with feet and two rail levels, the large bed on a support frame, the overhead portal with side rails and the ' + (v.pellet ? 'pellet extruder with hopper' : 'heavy hot end') + ' (plan and 3D).');
}

function printerCabinet(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, p = 30, base = 100;
  a.outline();
  for (const [x, y] of [[X0, YF], [X1 - p, YF], [X0, YB - p], [X1 - p, YB - p]]) { ext(a, x, y, Z0 + base, x + p, y + p, Z1 - 20); a.caster(x + p / 2, y + p / 2, base); }
  for (const z of [Z0 + base, Z1 - 20 - p]) { ext(a, X0, YF, z, X1, YF + p, z + p); ext(a, X0, YB - p, z, X1, YB, z + p); ext(a, X0, YF, z, X0 + p, YB, z + p); ext(a, X1 - p, YF, z, X1, YB, z + p); }
  a.box(X0, YF, Z1 - 20, X1, YB, Z1);
  a.box(X0 + p, YB - 6, Z0 + base + p, X1 - p, YB, Z1 - 20 - p); a.box(X0 + p - 5, YF + p, Z0 + base + p, X0 + p, YB - p, Z1 - 20 - p); a.box(X1 - p, YF + p, Z0 + base + p, X1 - p + 5, YB - p, Z1 - 20 - p);
  a.box(X0 + p, YF + p, Z0 + base + p, X1 - p, YB - p, Z0 + base + p + 14);
  // doors: two framed leaves with handles
  const dz0 = Z0 + base + p + 14, dz1 = Z1 - 20 - p;
  for (const s of [-1, 1]) { const x0 = s < 0 ? X0 + p : cx + 2, x1 = s < 0 ? cx - 2 : X1 - p; a.frame(x0, dz0, x1, dz1, YF - 4, YF + 8, 26); a.box(cx + s * 22 - 6, YF - 22, (dz0 + dz1) / 2 - 70, cx + s * 22 + 6, YF - 4, (dz0 + dz1) / 2 + 70); a.arc(x0 + (s < 0 ? 0 : x1 - x0), YF, x1 - x0, s < 0 ? 0 : 180, s < 0 ? 90 : 270); }
  // a shelf with a small printer on it
  if (v.shelf) {
    const sz = Z0 + base + (Z1 - Z0 - base) * 0.45; a.box(X0 + p, YF + p, sz, X1 - p, YB - p, sz + 14);
    a.box(cx - W * 0.25, YB - D * 0.6, sz + 14, cx + W * 0.25, YB - D * 0.2, sz + 14 + H * 0.12); a.box(cx - W * 0.25, YB - D * 0.6, sz + 14 + H * 0.12, cx + W * 0.25, YB - D * 0.6 + 20, sz + 14 + H * 0.3);
  }
  // fan and filter on the roof
  a.cyl(cx + W * 0.25, YB - D * 0.3, Z1, Z1, 1, 4); a.rect(cx + W * 0.1, YB - D * 0.5, cx + W * 0.4, YB - D * 0.1, 'EQUIP-DETAIL');
  a.log('Added the corner posts on casters, top and base frames, back and side panels, two framed doors with handles' + (v.shelf ? ', a mid shelf with a printer on it' : '') + ' (plan and 3D).');
}

function farmRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, p = 30, n = v.tiers, gap = (H - 60) / n, pw = (W - 2 * p - 40) / v.across;
  a.outline();
  for (const [x, y] of [[X0, YF], [X1 - p, YF], [X0, YB - p], [X1 - p, YB - p]]) { ext(a, x, y, Z0, x + p, y + p, Z1); }
  for (let i = 0; i <= n; i++) {
    const z = Z0 + 30 + gap * i; a.box(X0, YF, z, X1, YB, z + 14);
    if (i === n) break;
    for (let j = 0; j < v.across; j++) {
      const x0 = X0 + p + 20 + j * pw + 8, x1 = x0 + pw - 16, ph = gap * 0.78, zz = z + 14;
      a.box(x0, YF + D * 0.18, zz, x1, YB - D * 0.1, zz + ph * 0.14);
      for (const x of [x0 + 12, x1 - 12]) a.box(x - 10, YB - D * 0.45, zz, x + 10, YB - D * 0.45 + 20, zz + ph);
      a.box(x0 + 8, YB - D * 0.45, zz + ph - 20, x1 - 8, YB - D * 0.45 + 20, zz + ph);
      a.box((x0 + x1) / 2 - 12, YF + D * 0.3, zz + ph * 0.5, (x0 + x1) / 2 + 12, YF + D * 0.3 + 20, zz + ph * 0.7);
    }
  }
  a.log('Added four posts, ' + (n + 1) + ' shelves and a small printer shape on each shelf place, each with a base, two uprights, an X beam and a hot end block (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ printed parts
function lBracket(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = v.t * IN, hr = v.hole * IN / 2;
  a.outline();
  const nh = v.holes, xs = Array.from({ length: nh }, (_, i) => X0 + W * ((i + 1) / (nh + 1)));
  plateH(a, 'z', X0, YF, X1, YB, Z0, Z0 + t, xs.map((x) => hole(x, YF + (D - t) * 0.5, hr)));
  plateH(a, 'y', X0, Z0 + t, X1, Z1, YB - t, YB, xs.map((x) => hole(x, Z0 + t + (H - t) * 0.58, hr)));
  for (const x of xs) a.circ(x, YF + (D - t) * 0.5, hr, 'EQUIP-DETAIL');
  const gs = m.min(D, H) * 0.7; // fillet chamfer strip and side gussets
  prismX(a, [[YB - t, Z0 + t + gs], [YB - t, Z0 + t], [YB - t - gs, Z0 + t]], X0 + W * 0.04 - 0.01, X0 + W * 0.04 + t);
  prismX(a, [[YB - t, Z0 + t + gs], [YB - t, Z0 + t], [YB - t - gs, Z0 + t]], X1 - W * 0.04 - t, X1 - W * 0.04);
  prismX(a, [[YB - t, Z0 + t + gs * 0.35], [YB - t, Z0 + t], [YB - t - gs * 0.35, Z0 + t]], X0 + 0.01, X1 - 0.01);
  a.log('Added the base plate and the upright plate with ' + nh + ' bolt holes each, a fillet along the inside corner and two side gussets (plan and 3D).');
}

function projBox(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = v.wall * IN, fl = t, lid = v.lid, bh = lid ? H - 3 * t : H;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + fl);
  a.box(X0, YF, Z0 + fl, X1, YF + t, Z0 + bh); a.box(X0, YB - t, Z0 + fl, X1, YB, Z0 + bh);
  a.box(X0, YF + t, Z0 + fl, X0 + t, YB - t, Z0 + bh); a.box(X1 - t, YF + t, Z0 + fl, X1, YB - t, Z0 + bh);
  const br = m.max(t * 1.5, 4.5);
  for (const sx of [-1, 1]) for (const [y, k] of [[YF + t + br + 1, 0], [YB - t - br - 1, 1]]) { ring(a, 'z', cx + sx * (W / 2 - t - br - 1), y, Z0 + fl, Z0 + bh - (lid ? 2 : 6), br * 0.4, br, 10); a.circ(cx + sx * (W / 2 - t - br - 1), y, br * 0.4, 'EQUIP-DETAIL'); void k; }
  if (!lid) { // vent slots shown as a row of ribs on the front wall and a connector cut on the back
    for (let i = 0; i < 6; i++) { const x = X0 + W * 0.2 + (W * 0.6 * i) / 5; a.box(x - 2, YF - 1.5, Z0 + bh * 0.3, x + 2, YF, Z0 + bh * 0.8); }
    for (const sx of [-0.25, 0.25]) a.xcyl(cx + sx * W - 1, cx + sx * W + 1, YB + 0, Z0 + bh * 0.5, 0.01, 4);
    a.box(cx - 5, YF + t + 10, Z0 + fl, cx + 5, YB - t - 10, Z0 + fl + 7);
    a.log('Added the tray with four screw posts, a vent rib set on the front wall and a rail inside for a circuit board; no lid shown (plan and 3D).');
  } else {
    a.box(X0 - 0, YF, Z0 + bh, X1, YB, Z0 + bh + 2 * t); a.box(X0 + t, YF + t, Z0 + bh - 2, X1 - t, YB - t, Z0 + bh);
    for (const sx of [-1, 1]) for (const y of [YF + t + br + 1, YB - t - br - 1]) { a.cyl(cx + sx * (W / 2 - t - br - 1), y, Z0 + bh + 2 * t, Z0 + bh + 2 * t + t * 0.7, br * 0.55, 8); a.circ(cx + sx * (W / 2 - t - br - 1), y, br * 0.55, 'EQUIP-DETAIL'); }
    if (v.slots) for (let i = 0; i < v.slots; i++) { const x = X0 + W * 0.25 + (W * 0.5 * i) / (v.slots - 1 || 1); a.box(x - 1.6, YB - D * 0.5, Z0 + bh + 2 * t, x + 1.6, YB - D * 0.5 + D * 0.3, Z0 + bh + 2 * t + t * 0.5); a.line(x, YB - D * 0.5, x, YB - D * 0.2, 'EQUIP-DETAIL'); }
    a.log('Added the tray with four screw posts, a lid with ' + 'four countersunk screw heads' + (v.slots ? ' and a row of raised vent ribs' : '') + ', seated on its lip (plan and 3D).');
  }
}

function printedHinge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, r = H / 2, t = m.max(3, H * 0.28), n = v.knuckles, kl = D / n, hr = v.hole * IN / 2, lw = (W - 2 * r) / 2;
  a.outline();
  a.cyl(cx, YF, Z0 + r, Z0 + r, 0.01, 3);
  for (let i = 0; i < n; i++) {
    const y0 = YF + i * kl + 0.5, y1 = YF + (i + 1) * kl - 0.5, left = i % 2 === 0;
    a.ycyl(y0, y1, cx, Z0 + r, r, 14);
    // leaf of this knuckle, with a web back to the leaf
    const xa = left ? X0 : cx + r * 0.2, xb = left ? cx - r * 0.2 : X1;
    a.box(xa, y0, Z0, xb, y1, Z0 + t);
  }
  // leaf extensions with holes: full-length strips with holes sitting on the leaf edge side
  const hy = (k, cnt) => YF + (D / (cnt + 1)) * (k + 1);
  for (const [xa, xb] of [[X0, X0 + lw * 0.0 + 1], [X1 - 1, X1]]) void xa, void xb;
  for (const sx of [-1, 1]) for (let k = 0; k < v.holeRows; k++) { a.circ(cx + sx * (W / 2 - lw * 0.55), hy(k, v.holeRows), hr, 'EQUIP-DETAIL'); a.cyl(cx + sx * (W / 2 - lw * 0.55), hy(k, v.holeRows), Z0 + t, Z0 + t + 0.6, hr * 0.7, 8); }
  a.ycyl(YF, YB, cx, Z0 + r, r * 0.35, 8);
  a.line(cx, YF, cx, YB, 'EQUIP-DETAIL');
  a.log('Added ' + n + ' interleaved knuckles around a through pin, two flat leaves and countersunk screw holes in each leaf (plan and 3D).');
}

function cableClip(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, ro = W * 0.42, ri = ro - m.max(2.2, W * 0.1), cyc = YF + ro + 1, t = m.min(H, 4);
  a.outline('EQUIP-DETAIL');
  ring(a, 'z', cx, cyc, Z0, Z1, ri, ro, 20, (-70 * m.PI) / 180 + m.PI / 2 * 0, (250 * m.PI) / 180);
  void t;
  const lw = (W - 2 * ro) / 2 + ro * 0.4;
  plateH(a, 'z', X0, YF + 2 * ro + 1, X1, YB, Z0, Z0 + m.min(H, 3.5), [hole(cx, YF + 2 * ro + 1 + (D - 2 * ro - 1) * 0.5, m.min(2.2, (D - 2 * ro - 1) * 0.28))]);
  a.box(cx - ro * 0.4, YF + 2 * ro - 2, Z0, cx + ro * 0.4, YF + 2 * ro + 2, Z1 * 0 + Z0 + H * 0.9);
  a.poly([[X0, YF + 2 * ro], [X1, YF + 2 * ro], [X1, YB], [X0, YB]]); a.circ(cx, cyc, ro, 'EQUIP'); a.circ(cx, cyc, ri, 'EQUIP-DETAIL');
  void lw;
  a.log('Added the open C ring that snaps over the cable and a flat tab with a screw hole behind it (plan and 3D).');
}

function gear(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, N = v.n, ro = W / 2, mod = W / (N + 2), rr = ro - 2.25 * mod, pitch = mod * N / 2, th = v.face * IN, bore = v.bore * IN / 2, hub = m.min(rr * 0.5, bore + 5);
  a.circ(cx, cy, ro); a.circ(cx, cy, rr, 'EQUIP-DETAIL'); a.circ(cx, cy, bore, 'EQUIP-DETAIL');
  ring(a, 'z', cx, cy, Z0, Z0 + th, bore, rr + 0.5, m.min(48, N * 2));
  for (let i = 0; i < N; i++) {
    const g = (i / N) * TAU, c = m.cos(g), s = m.sin(g), px = -s, py = c, wb = (TAU * pitch / N) * 0.55, wt = wb * 0.45;
    const P = (r, w) => [cx + r * c + w * px, cy + r * s + w * py];
    a.prism([P(rr, -wb / 2), P(rr, wb / 2), P(ro, wt / 2), P(ro, -wt / 2)], Z0, Z0 + th);
  }
  ring(a, 'z', cx, cy, Z0 + th, Z1, bore, hub + 4, 14); a.circ(cx, cy, hub + 4, 'EQUIP-DETAIL');
  a.box(cx + hub, cy - 2, Z0 + th, cx + hub + 4, cy + 2, Z1);
  a.log('Added the gear disc with ' + N + ' straight teeth, a raised hub, the bore and a set-screw boss (plan and 3D).');
}

function pillow(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, bt = v.base * IN, br = v.bore * IN / 2, bz = Z0 + bt + (H - bt) * 0.5;
  a.outline();
  const hr = v.screw * IN / 2;
  plateH(a, 'z', X0, YF, X1, YB, Z0, Z0 + bt, [hole(X0 + W * 0.1, YF + D / 2, hr), hole(X1 - W * 0.1, YF + D / 2, hr)]);
  const bx = W * 0.22;
  prismY(a, [[cx - bx, Z0 + bt], [cx + bx, Z0 + bt], [cx + bx * 0.82, Z1], [cx - bx * 0.82, Z1]].map(([x, z]) => [x, z]), YF + D * 0.12, YB - D * 0.12);
  ring(a, 'y', cx, bz, YF + D * 0.06, YB - D * 0.06, br, br + 7, 18);
  a.cyl(cx, YF + D * 0.5, Z1, Z1 + 0.01, 0.01, 3);
  a.rect(cx - bx, YF + D * 0.12, cx + bx, YB - D * 0.12, 'EQUIP-DETAIL'); a.circ(cx, YF + D / 2, br, 'EQUIP-DETAIL');
  for (const s of [-1, 1]) prismY(a, [[cx + s * bx, Z0 + bt], [cx + s * (bx + W * 0.1), Z0 + bt], [cx + s * bx * 0.9, Z0 + bt + (H - bt) * 0.5]], YF + D * 0.2, YB - D * 0.2);
  a.log('Added the base plate with two bolt holes, a tapered block with a ring-formed bearing seat and two side webs (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ fixtures
function wallSpool(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, r = W * 0.42, sd = (D - 22) / v.n, z = Z0 + H * 0.5, pr = 8;
  a.outline();
  plateH(a, 'y', X0 + W * 0.1, Z0, X1 - W * 0.1, Z1, YB - 8, YB, [hole(cx, Z0 + 20, 6), hole(cx, Z1 - 20, 6)]);
  a.ycyl(YF + 6, YB - 8, cx, z, pr, 12); a.ycyl(YF, YF + 6, cx, z, pr * 1.9, 12);
  for (let i = 0; i < v.n; i++) { const y0 = YB - 12 - (i + 1) * sd, y1 = y0 + sd - 4; spoolY(a, cx, y0, y1, z, r); }
  a.circ(cx, YF + D / 2, 0.01, 'EQUIP-DETAIL'); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL');
  a.log('Added the wall plate with two screw holes, a round arm with an end lip and ' + v.n + ' filament spool' + (v.n > 1 ? 's' : '') + ' stacked on it (plan and 3D).');
}

function dryBox(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 12, bh = H - 12, n = v.n;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 10); a.box(X0, YF, Z0 + 10, X1, YF + t, Z0 + bh); a.box(X0, YB - t, Z0 + 10, X1, YB, Z0 + bh); a.box(X0, YF + t, Z0 + 10, X0 + t, YB - t, Z0 + bh); a.box(X1 - t, YF + t, Z0 + 10, X1, YB - t, Z0 + bh);
  a.box(X0 - 2, YF - 2, Z0 + bh, X1 + 2, YF + 8, Z0 + bh + 10); a.box(X0 - 2, YF, Z0 + bh, X0 + 8, YB, Z0 + bh + 10); a.box(X1 - 8, YF, Z0 + bh, X1 + 2, YB, Z0 + bh + 10);
  const sr = m.min((D - 2 * t) * 0.46, (W - 2 * t) / n * 0.46, 95), sw = 70;
  for (let i = 0; i < n; i++) { const x = X0 + t + (W - 2 * t) * (i + 0.5) / n; spoolZ(a, x, YF + D * 0.5, Z0 + 10, sr, m.min(sw, bh - 14)); }
  a.cyl(X0 + W * 0.5, YF + D * 0.5, Z0 + 10, Z0 + 10, 0.1, 3);
  a.box(X1 - 90, YF - 5, Z0 + bh * 0.3, X1 - 40, YF, Z0 + bh * 0.3 + 50); a.cyl(X1 - 65, YF - 6, Z0 + bh * 0.3 + 12, Z0 + bh * 0.3 + 12, 0.1, 3);
  a.log('Added the tray with ' + n + ' flat filament spool' + (n > 1 ? 's' : '') + ', the rim, a front gauge plate and the lid opened on its rear hinge (plan and 3D).');
}

function nozzleRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, bt = H * 0.55, hr = m.min(W / (v.cols * 2.4), D / (v.rows * 2.4), 5.5), hs = [];
  a.outline();
  for (let i = 0; i < v.cols; i++) for (let j = 0; j < v.rows; j++) hs.push(hole(X0 + W * (i + 0.5) / v.cols, YF + D * (j + 0.5) / v.rows, hr));
  a.box(X0, YF, Z0, X1, YB, Z0 + bt * 0.3); plateH(a, 'z', X0, YF, X1, YB, Z0 + bt * 0.3, Z0 + bt, hs, 8);
  hs.forEach((h, k) => { if (k % 3 !== 0) { a.cyl(h.u, h.v, Z0 + bt * 0.3, Z1, hr * 0.8, 6); a.cone(h.u, h.v, Z1, Z1, 0.1, 0.1, 3); } a.circ(h.u, h.v, hr, 'EQUIP-DETAIL'); });
  for (let i = 0; i < v.cols; i++) a.box(X0 + W * (i + 0.5) / v.cols - 1.5, YF - 0.5, Z0 + bt * 0.3, X0 + W * (i + 0.5) / v.cols + 1.5, YF + 1, Z0 + bt * 0.3 + 3);
  a.log('Added a block with a grid of ' + v.cols * v.rows + ' hex-head nozzle holes, most filled with nozzles, on a stepped base (plan and 3D).');
}

function toolBoard(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, n = v.n;
  a.outline();
  plateH(a, 'y', X0, Z0, X1, Z1, YB - 8, YB, [hole(X0 + 14, Z1 - 14, 4), hole(X1 - 14, Z1 - 14, 4)]);
  // upper row of hooks
  for (let i = 0; i < n; i++) { const x = X0 + W * (i + 0.5) / n, z = Z0 + H * 0.78; a.ycyl(YB - 8 - D * 0.55, YB - 8, x, z, 3.5, 8); a.box(x - 3.5, YB - 8 - D * 0.55, z, x + 3.5, YB - 8 - D * 0.55 + 6, z + 10); a.circ(x, YB - 8 - D * 0.55, 3.5, 'EQUIP-DETAIL'); }
  // a shelf with slots for screwdriver shanks
  const sz = Z0 + H * 0.38, sh = [];
  for (let i = 0; i < n; i++) sh.push(hole(X0 + W * (i + 0.5) / n, YB - 8 - (D - 8) * 0.5, m.min(W / n * 0.28, 7)));
  plateH(a, 'z', X0, YF, X1, YB - 8, sz, sz + 8, sh, 8);
  for (let i = 0; i < n; i += 1) { const x = X0 + W * (i + 0.5) / n, y = YB - 8 - (D - 8) * 0.5; if (i % 4 === 3) continue; a.cyl(x, y, sz + 8, sz + 8 + H * 0.28, 4, 6); a.cyl(x, y, sz + 8 + H * 0.28, sz + 8 + H * 0.28 + 38, 11, 8); }
  a.box(X0, YF, Z0 + H * 0.06, X1, YB - 8, Z0 + H * 0.06 + 6); a.box(X0, YF, Z0 + H * 0.06, X1, YF + 5, Z0 + H * 0.06 + 22);
  a.log('Added the back board with two screw holes, ' + n + ' hooks, a shelf with ' + n + ' shank holes (three of every four filled with screwdriver shapes) and a lipped lower tray (plan and 3D).');
}

function cableComb(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, n = v.n, p = 6;
  a.outline();
  const hs = [hole(X0 + 10, YB - 8, 2.6), hole(X1 - 10, YB - 8, 2.6)];
  plateH(a, 'z', X0, YB - 16, X1, YB, Z0, Z0 + 5, hs);
  a.box(X0, YB - 14, Z0 + 5, X1, YB - 6, Z1);
  const fw = (W - 2 * p) / (2 * n - 1);
  for (let i = 0; i < n; i++) { const x0 = X0 + p + i * 2 * fw; a.box(x0, YF, Z0, x0 + fw, YB - 14, Z1); a.box(x0 - 1, YF, Z1 - 4, x0 + fw + 1, YF + 6, Z1); a.rect(x0, YF, x0 + fw, YB - 14, 'EQUIP-DETAIL'); }
  a.box(X0, YF, Z0, X0 + p, YB - 14, Z1); a.box(X1 - p, YF, Z0, X1, YB - 14, Z1);
  a.log('Added a back bar with two screw holes and ' + n + ' fingers with hooked tips that form ' + (n - 1) + ' cable slots (plan and 3D).');
}

function drillJig(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = H * 0.55, n = v.n, hr = v.hole * IN / 2;
  a.outline();
  const hs = Array.from({ length: n }, (_, i) => hole(X0 + W * (i + 1) / (n + 1), YF + D * 0.55, hr));
  plateH(a, 'z', X0, YF, X1, YB, Z0, Z0 + t, hs, 12);
  for (const h of hs) { ring(a, 'z', h.u, h.v, Z0 + t, Z1, hr, hr + 5, 12); a.circ(h.u, h.v, hr + 5, 'EQUIP-DETAIL'); a.circ(h.u, h.v, hr, 'EQUIP-DETAIL'); }
  a.box(X0, YB - 7, Z0 + t, X1, YB, Z0 + t + (H - t) * 0.6); a.box(X0, YF, Z0 + t, X0 + 7, YB, Z0 + t + (H - t) * 0.6);
  prismX(a, [[YB - 7, Z0 + t + (H - t) * 0.6], [YB - 7, Z0 + t], [YB - 7 - 14, Z0 + t]], X0 + W * 0.2, X0 + W * 0.2 + 5);
  a.log('Added the base block with ' + n + ' guide hole' + (n > 1 ? 's' : '') + ' fitted with raised bushings, a back fence and a side fence with a gusset (plan and 3D).');
}

function spoolRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cols = v.n / 2, rows = 2, r = m.min(95, W / cols / 2 - 4, (H - 20) / rows / 2 - 4), bt = 10;
  a.outline();
  plateH(a, 'y', X0, Z0, X1, Z1, YB - bt, YB, [hole(X0 + 12, Z1 - 12, 4), hole(X1 - 12, Z1 - 12, 4)]);
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = X0 + W * (i + 0.5) / cols, z = Z0 + (H) * (j + 0.5) / rows;
    a.ycyl(YF + 8, YB - bt, x, z, 9, 10); a.ycyl(YF + 2, YF + 8, x, z, 14, 10);
    spoolY(a, x, YB - bt - 4 - 62, YB - bt - 4, z, r);
  }
  a.box(X0, YF, Z0, X1, YB - bt, Z0 + 5);
  a.log('Added the back board with two screw holes and ' + v.n + ' dowels with end caps, each carrying a filament spool (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ calibration
function calCube(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, e = m.min(0.9, W * 0.04);
  a.outline();
  a.box(X0, YF + e, Z0, X1, YB, Z1);
  // raised X on the front face, Y on the left, Z on the top
  const s = W * 0.5, z0 = Z0 + H * 0.25, w = W * 0.1;
  prismY(a, [[cx - s / 2, z0], [cx - s / 2 + w, z0], [cx + s / 2, z0 + s], [cx + s / 2 - w, z0 + s]], YF, YF + e + 0.01);
  prismY(a, [[cx + s / 2 - w, z0], [cx + s / 2, z0], [cx - s / 2 + w, z0 + s], [cx - s / 2, z0 + s]], YF, YF + e + 0.01);
  a.line(cx - s / 2, YF + e, cx + s / 2, YF + e, 'EQUIP-DETAIL');
  a.log('Added the solid cube with a raised X on the front face, a mark that tells the printer axes apart (plan and 3D).');
}

function tempTower(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, n = v.tiers, th = (H - 3) / n, cw = D * 0.42, cy = YF + D * 0.5;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 3);
  a.box(cx - cw / 2, cy - cw / 2, Z0 + 3, cx + cw / 2, cy + cw / 2, Z1);
  for (let i = 0; i < n; i++) {
    const z = Z0 + 3 + i * th;
    a.box(cx - cw / 2 - 1, cy - cw / 2 - 1, z, cx + cw / 2 + 1, cy + cw / 2 + 1, z + 1.2);    // tier line
    // left: overhang wedge, right: bridge between the core and a post
    prismY(a, [[cx - cw / 2, z + 1.2], [cx - cw / 2, z + th - 0.01], [cx - W / 2 + 1, z + 1.2]], cy - cw / 2, cy + cw / 2);
    a.box(X1 - cw * 0.35, cy - cw / 2, z + 1.2, X1, cy + cw / 2, z + th); a.box(cx + cw / 2, cy - cw / 2, z + th - 1.6, X1 - cw * 0.35 + 0.01, cy + cw / 2, z + th);
  }
  a.rect(cx - cw / 2, cy - cw / 2, cx + cw / 2, cy + cw / 2, 'EQUIP-DETAIL'); a.rect(X1 - cw * 0.35, cy - cw / 2, X1, cy + cw / 2, 'EQUIP-DETAIL');
  a.log('Added the base plate, a central core with ' + n + ' tier marks, a left overhang wedge on every tier and a right bridge span to a post on every tier (plan and 3D).');
}

function testHull(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, hh = H * 0.42, layers = 7;
  a.outline('EQUIP');
  for (let k = 0; k < layers; k++) {
    const f0 = k / layers, f1 = (k + 1) / layers, wf = 0.5 + 0.5 * f0 ** 0.7, z0 = Z0 + hh * f0, z1 = Z0 + hh * f1, hw = (W / 2) * wf, bow = YF + D * (0.0 + 0.1 * (1 - f0)), stern = YB - D * 0.015 * (1 - f0);
    a.prism([[cx - hw * 0.12, bow], [cx + hw * 0.12, bow], [cx + hw * 0.7, YF + D * 0.28], [cx + hw, YF + D * 0.55], [cx + hw, stern], [cx - hw, stern], [cx - hw, YF + D * 0.55], [cx - hw * 0.7, YF + D * 0.28]], z0, z1);
  }
  a.poly([[cx, YF], [cx + W / 2, YF + D * 0.45], [cx + W / 2, YB], [cx - W / 2, YB], [cx - W / 2, YF + D * 0.45]], 'EQUIP-DETAIL');
  const dz = Z0 + hh, cw = W * 0.7;
  a.box(cx - cw / 2, YF + D * 0.5, dz, cx + cw / 2, YB - D * 0.12, dz + H * 0.24);                  // cabin
  a.box(cx - cw / 2 - 2, YF + D * 0.5 - 2, dz + H * 0.24, cx + cw / 2 + 2, YB - D * 0.12 + 2, dz + H * 0.27);   // roof
  a.box(cx - cw * 0.3, YF + D * 0.6, dz + H * 0.27, cx + cw * 0.3, YB - D * 0.3, dz + H * 0.36);          // wheelhouse
  a.cone(cx, YB - D * 0.42, dz + H * 0.27, dz + H * 0.55, W * 0.11, W * 0.085, 12);                             // chimney
  a.cone(cx, YB - D * 0.42, dz + H * 0.55, dz + H * 0.58, W * 0.085, W * 0.12, 12);
  for (const sx of [-1, 1]) { a.tube([[cx + sx * W * 0.44, YB - D * 0.1, dz], [cx + sx * W * 0.44, YB - D * 0.1, dz + H * 0.4]], [W * 0.03, W * 0.03], 6); }
  a.box(cx - W * 0.46, YB - D * 0.1 - W * 0.03, dz + H * 0.37, cx + W * 0.46, YB - D * 0.1 + W * 0.03, dz + H * 0.43);
  a.box(cx - W * 0.2, YF + D * 0.3, dz, cx + W * 0.2, YF + D * 0.5, dz + H * 0.06);
  a.rect(cx - cw / 2, YF + D * 0.5, cx + cw / 2, YB - D * 0.12, 'EQUIP-DETAIL'); a.circ(cx, YB - D * 0.42, W * 0.11, 'EQUIP-DETAIL');
  a.log('Added a layered pointed hull, a cabin with roof and wheelhouse, a round chimney, a stern arch and a bow deck, a test hull with overhangs, bridges and small round features (plan and 3D).');
}

function bridgeTest(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, sp = v.spans, pw = 8, st = 1.6, pillarH = H - st, bt = 3;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bt);
  let x = X0 + 4;
  const ph = pillarH - bt;
  a.box(x, YF + 6, Z0 + bt, x + pw, YB - 6, Z0 + bt + ph); x += pw;
  for (const s of sp) {
    const sc = s;
    a.box(x, YF + 6, Z0 + bt + ph, x + sc, YB - 6, Z1); a.line(x, YF + 6, x, YB - 6, 'EQUIP-DETAIL');
    x += sc; a.box(x, YF + 6, Z0 + bt, x + pw, YB - 6, Z0 + bt + ph); x += pw;
  }
  a.log('Added the base plate and ' + (sp.length + 1) + ' posts joined by ' + sp.length + ' bridge spans of growing length (plan and 3D).');
}

function overhangTest(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, n = v.angles.length, uw = (W - 4) / n, bt = 3, wallT = uw * 0.22;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bt);
  v.angles.forEach((deg, i) => {
    const x0 = X0 + 2 + i * uw, ex = uw - 3, ang = (deg * m.PI) / 180, dz = m.min(H - bt, ex * m.tan(ang) * 0 + (H - bt)), run = dz / m.tan(ang), xr = m.min(ex - wallT, run);
    a.box(x0, YF + 4, Z0 + bt, x0 + wallT, YB - 4, Z1);
    prismY(a, [[x0 + wallT, Z1], [x0 + wallT + xr, Z0 + bt + (H - bt) - xr * m.tan(ang)], [x0 + wallT, Z0 + bt + (H - bt) - xr * m.tan(ang) - 0.01 < Z0 + bt ? Z0 + bt : Z1 - xr * m.tan(ang)]].filter((p) => true), YF + 4, YB - 4);
    a.line(x0, YF + 4, x0 + wallT + xr, YF + 4, 'EQUIP-DETAIL');
  });
  a.log('Added the base plate and ' + n + ' posts, each with an underside sloped at its test angle (' + v.angles.join(', ') + ' degrees) that the printer must bridge (plan and 3D).');
}

function tolerancePlate(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, n = v.steps, hr = v.hole * IN / 2, cl = v.clear, hs = [], t = H;
  a.outline();
  for (let i = 0; i < n; i++) hs.push(hole(X0 + W * (i + 0.5) / n, YB - D * 0.28, hr + 0.15 + i * cl));
  plateH(a, 'z', X0, YF, X1, YB, Z0, Z0 + t, hs, 14);
  for (let i = 0; i < n; i++) { const x = X0 + W * (i + 0.5) / n; a.cyl(x, YF + D * 0.3, Z0 + t, Z1 + 0, hr, 12); a.circ(x, YF + D * 0.3, hr, 'EQUIP-DETAIL'); a.circ(x, YB - D * 0.28, hr + 0.15 + i * cl, 'EQUIP-DETAIL'); }
  a.box(X0, YF + D * 0.5 - 0.5, Z0 + t, X1, YF + D * 0.5 + 0.5, Z0 + t + 0.5);
  a.log('Added a plate with ' + n + ' holes of growing clearance and ' + n + ' matching pins standing on the same plate (plan and 3D).');
}

function stringTest(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, n = v.towers, r = m.min(D * 0.2, W / (2 * n) * 0.55), bt = 2.5;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bt);
  for (let i = 0; i < n; i++) { const x = X0 + W * (i + 0.5) / n; a.cone(x, YF + D * 0.5, Z0 + bt, Z1, r, r * 0.92, 14); a.circ(x, YF + D * 0.5, r, 'EQUIP-DETAIL'); }
  a.log('Added the base plate and ' + n + ' slim round towers at ' + (v.gap) + ' in spacing, used to check stringing and retraction (plan and 3D).');
}

const mm = (n) => n / IN;
const FAMS = [
  // ===================================================== printers =====================================================
  fam({ cat: 'printing/printers', title: 'Generic cartesian 3D printer',
    desc: (v) => `Open-frame cartesian 3D printer with a ${v.bed} in heated bed on a Y carriage, two uprights with a top bar, an X rail with a hot end and a spool holder with a filament spool.`,
    vs: [['6 in bed, compact', 6, 16, 17, 20], ['8 in bed', 8, 18, 19, 22], ['10 in bed', 10, 21, 22, 24], ['12 in bed, tall', 12, 24, 24, 28]].map(([l, bed, w, d, h]) => [l, w, d, h, 0, { bed }]),
    build: cartesian }),
  fam({ cat: 'printing/printers', title: 'Generic enclosed CoreXY 3D printer',
    desc: (v) => `Enclosed CoreXY 3D printer with an extrusion frame, panelled sides and back, a framed front door with handle, a bed on lead screws, an overhead gantry with hot end and a spool on top.`,
    vs: [['8 in build, desktop', 17, 17, 22], ['10 in build', 21, 20, 26], ['12 in build', 24, 24, 29], ['14 in build', 27, 27, 32]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: corexy }),
  fam({ cat: 'printing/printers', title: 'Generic delta 3D printer',
    desc: (v) => `Delta 3D printer with a hexagonal base, a round ${v.bed} in bed, three corner towers with carriages, a top ring, paired arms to the effector with hot end and a spool on a top bracket.`,
    vs: [['5 in bed', 11, 11, 24, 5], ['8 in bed', 15, 15, 33, 8], ['12 in bed, tall', 21, 21, 46, 12]].map(([l, w, d, h, bed]) => [l, w, d, h, 0, { bed }]),
    build: deltaPrinter }),
  fam({ cat: 'printing/printers', title: 'Generic resin 3D printer',
    desc: 'Resin 3D printer with a sloped base and screen, a resin vat with a window frame, a Z column with arm and build plate, and a tinted hood opened on its rear hinge.',
    vs: [['small, 5 in vat', 9, 9, 17], ['medium, 7 in vat', 11, 11, 20], ['large, 10 in vat', 15, 14, 26], ['floor standing, 16 in vat', 22, 20, 34]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: resin }),
  fam({ cat: 'printing/printers', title: 'Generic large-format 3D printer',
    desc: (v) => `Large-format gantry 3D printer on four corner posts with two rail levels, a big bed on its support frame, an overhead portal with side rails and a ${v.pellet ? 'pellet extruder with hopper' : 'heavy hot end'}.`,
    vs: [['24 in bed', 40, 40, 50], ['36 in bed', 52, 52, 60], ['48 in bed, pellet extruder', 64, 64, 68, 0, { pellet: true }], ['60 in bed', 76, 76, 72]].map(([l, w, d, h, z = 0, p = {}]) => [l, w, d, h, z, p]),
    build: largeFormat }),
  fam({ cat: 'printing/printers', title: 'Generic printer enclosure cabinet',
    desc: (v) => `Printer enclosure cabinet on casters with corner posts, top and base frames, back and side panels, two framed doors with handles${v.shelf ? ' and a mid shelf holding a small printer' : ''}.`,
    vs: [['small, 24 in', 24, 24, 30, 0, { shelf: false }], ['medium with shelf, 30 in', 30, 28, 36, 0, { shelf: true }], ['large, 40 in', 40, 32, 42, 0, { shelf: false }]],
    build: printerCabinet }),
  fam({ cat: 'printing/printers', title: 'Generic print farm rack',
    desc: (v) => `Print farm rack with four posts, ${v.tiers + 1} shelves and a small printer shape on each of ${v.tiers * v.across} places, each with a base, two uprights, an X beam and a hot end block.`,
    vs: [['3 tiers, 2 across', 40, 22, 54, 0, { tiers: 3, across: 2 }], ['4 tiers, 2 across', 40, 22, 70, 0, { tiers: 4, across: 2 }], ['4 tiers, 3 across', 58, 22, 70, 0, { tiers: 4, across: 3 }]],
    build: farmRack }),
  // ===================================================== parts =====================================================
  fam({ cat: 'printing/parts', title: 'Generic printed L bracket',
    desc: (v) => `Printed 90 degree bracket with a base plate and an upright plate with ${v.holes} bolt holes each, a fillet along the inside corner and two side gussets.`,
    vs: [['1 in leg, 1 hole', 1, 1, 1, 0, { t: 0.12, hole: 0.2, holes: 1 }], ['1.5 in leg, 2 holes', 1.8, 1.5, 1.5, 0, { t: 0.14, hole: 0.2, holes: 2 }], ['2 in leg, 2 holes', 2.2, 2, 2, 0, { t: 0.16, hole: 0.25, holes: 2 }], ['3 in leg, 3 holes', 3.6, 3, 3, 0, { t: 0.2, hole: 0.28, holes: 3 }], ['4 in leg, 3 holes, heavy', 4.4, 4, 4, 0, { t: 0.25, hole: 0.32, holes: 3 }]],
    build: lBracket }),
  fam({ cat: 'printing/parts', title: 'Generic printed electronics enclosure',
    desc: (v) => v.lid ? 'Printed electronics enclosure with four screw posts and a lid seated on its lip with four screw heads' + (v.slots ? ' and raised vent ribs' : '') + '.' : 'Printed electronics tray with four screw posts, a row of vent ribs on the front wall and a board rail; the lid is not shown.',
    vs: [['small, 3 x 2 in, lid on', 3, 2, 1.2, 0, { lid: true, wall: 0.08, slots: 0 }], ['medium, 4 x 3 in, open tray', 4, 3, 1.4, 0, { lid: false, wall: 0.08 }], ['medium, 4.5 x 3 in, vented lid', 4.5, 3, 1.5, 0, { lid: true, wall: 0.08, slots: 5 }], ['large, 6 x 4 in, open tray', 6, 4, 2, 0, { lid: false, wall: 0.1 }], ['large, 7 x 5 in, vented lid', 7, 5, 2.2, 0, { lid: true, wall: 0.1, slots: 7 }]],
    build: projBox }),
  fam({ cat: 'printing/parts', title: 'Generic print-in-place hinge',
    desc: (v) => `Flat hinge with ${v.knuckles} interleaved knuckles around a through pin, two leaves and ${v.holeRows * 2} screw holes.`,
    vs: [['1.5 in, 3 knuckles', 1.5, 1.5, 0.32, 0, { knuckles: 3, holeRows: 1, hole: 0.1 }], ['2 in, 5 knuckles', 2, 2, 0.34, 0, { knuckles: 5, holeRows: 1, hole: 0.12 }], ['3 in, 7 knuckles', 2.2, 3, 0.4, 0, { knuckles: 7, holeRows: 2, hole: 0.14 }], ['4 in, 9 knuckles', 2.6, 4, 0.44, 0, { knuckles: 9, holeRows: 3, hole: 0.15 }]],
    build: printedHinge }),
  fam({ cat: 'printing/parts', title: 'Generic printed cable clip',
    desc: 'Printed cable clip with an open C ring that snaps over the cable and a flat mounting tab with a screw hole behind it.',
    vs: [['for 0.25 in cable', 0.6, 0.95, 0.4], ['for 0.5 in cable', 0.85, 1.35, 0.5], ['for 0.75 in cable', 1.15, 1.75, 0.55], ['for 1 in cable', 1.45, 2.2, 0.6]].map(([l, w, d, h]) => [l, w, d, h, 0, {}]),
    build: cableClip }),
  fam({ cat: 'printing/parts', title: 'Generic printed spur gear',
    desc: (v) => `Printed spur gear with ${v.n} straight teeth, a raised hub, a ${v.bore} in bore and a set-screw boss.`,
    vs: [['16 teeth, 2 mm module', mm(36), mm(36), 0.55, 0, { n: 16, bore: 0.2, face: 0.3 }], ['24 teeth, 2 mm module', mm(52), mm(52), 0.6, 0, { n: 24, bore: 0.25, face: 0.3 }], ['36 teeth, 2 mm module', mm(76), mm(76), 0.62, 0, { n: 36, bore: 0.25, face: 0.35 }], ['48 teeth, 2 mm module', mm(100), mm(100), 0.7, 0, { n: 48, bore: 0.3, face: 0.4 }]],
    build: gear }),
  fam({ cat: 'printing/parts', title: 'Generic printed pillow block',
    desc: 'Printed bearing mount with a base plate with two bolt holes, a tapered block with a ring-formed bearing seat and two side webs.',
    vs: [['for 8 mm bearing', 2.2, 1.0, 1.2, 0, { base: 0.18, bore: 0.35, screw: 0.18 }], ['for 12 mm bearing', 3, 1.4, 1.7, 0, { base: 0.22, bore: 0.55, screw: 0.2 }], ['for 20 mm bearing', 4, 1.9, 2.4, 0, { base: 0.28, bore: 0.85, screw: 0.26 }]],
    build: pillow }),
  // ===================================================== fixtures =====================================================
  fam({ cat: 'printing/fixtures', title: 'Generic wall spool holder',
    desc: (v) => `Wall spool holder with a plate with two screw holes, a round arm with an end lip and ${v.n} filament spool${v.n > 1 ? 's' : ''} stacked on it.`,
    vs: [['single spool', 8.5, 4, 8.5, 0, { n: 1 }], ['two spools', 8.5, 6.5, 8.5, 0, { n: 2 }], ['three spools', 8.5, 9, 8.5, 0, { n: 3 }]],
    build: wallSpool }),
  fam({ cat: 'printing/fixtures', title: 'Generic filament dry box',
    desc: (v) => `Filament dry box with a tray holding ${v.n} flat spool${v.n > 1 ? 's' : ''}, a rim and a front gauge plate; the lid is not shown.`,
    vs: [['one spool', 9, 9, 4, 0, { n: 1 }], ['two spools', 17, 9, 4, 0, { n: 2 }], ['four spools', 17, 17, 4, 0, { n: 4 }]].map(([l, w, d, h, z, p]) => [l, w, d, 4, z, p]),
    build: dryBox }),
  fam({ cat: 'printing/fixtures', title: 'Generic nozzle rack',
    desc: (v) => `Block with a grid of ${v.cols * v.rows} nozzle holes, most filled with hex-head nozzles, on a stepped base.`,
    vs: [['10 nozzles', 3.4, 1.6, 0.9, 0, { cols: 5, rows: 2 }], ['20 nozzles', 3.4, 3.2, 0.9, 0, { cols: 5, rows: 4 }], ['30 nozzles', 5, 3.2, 0.9, 0, { cols: 6, rows: 5 }], ['40 nozzles', 5.2, 4.2, 0.9, 0, { cols: 8, rows: 5 }]],
    build: nozzleRack }),
  fam({ cat: 'printing/fixtures', title: 'Generic printed wall tool board',
    desc: (v) => `Wall tool board with a back board with two screw holes, ${v.n} hooks, a shelf with ${v.n} shank holes holding screwdriver shapes and a lipped lower tray.`,
    vs: [['4 slots', 5, 3, 9, 0, { n: 4 }], ['6 slots', 7.5, 3, 9, 0, { n: 6 }], ['8 slots', 10, 3, 9, 0, { n: 8 }], ['12 slots', 14.5, 3, 9, 0, { n: 12 }]],
    build: toolBoard }),
  fam({ cat: 'printing/fixtures', title: 'Generic cable comb',
    desc: (v) => `Cable comb with a back bar with two screw holes and ${v.n} hooked fingers that form ${v.n - 1} cable slots.`,
    vs: [['4 fingers', 1.4, 1.3, 0.7, 0, { n: 4 }], ['6 fingers', 2.2, 1.3, 0.7, 0, { n: 6 }], ['8 fingers', 3, 1.5, 0.8, 0, { n: 8 }], ['12 fingers', 4.4, 1.5, 0.8, 0, { n: 12 }]],
    build: cableComb }),
  fam({ cat: 'printing/fixtures', title: 'Generic drilling jig',
    desc: (v) => `Drilling jig with a base block with ${v.n} guide hole${v.n > 1 ? 's' : ''} fitted with raised bushings, a back fence and a side fence with a gusset.`,
    vs: [['one hole', 1.8, 1.8, 1.4, 0, { n: 1, hole: 0.2 }], ['two holes', 3, 1.8, 1.4, 0, { n: 2, hole: 0.2 }], ['three holes', 4.4, 2.2, 1.6, 0, { n: 3, hole: 0.25 }]],
    build: drillJig }),
  fam({ cat: 'printing/fixtures', title: 'Generic filament spool rack',
    desc: (v) => `Spool rack with a back board with two screw holes and ${v.n} dowels with end caps, each carrying a filament spool.`,
    vs: [['4 spools', 15, 3.2, 16, 0, { n: 4 }], ['6 spools', 22, 3.2, 16, 0, { n: 6 }], ['8 spools', 29, 3.2, 16, 0, { n: 8 }], ['10 spools', 36, 3.2, 16, 0, { n: 10 }]],
    build: spoolRack }),
  // ===================================================== calibration =====================================================
  fam({ cat: 'printing/calibration', title: 'Generic calibration cube',
    desc: 'Solid calibration cube with a raised X on the front face that tells the printer axes apart.',
    vs: [['10 mm', mm(10)], ['15 mm', mm(15)], ['20 mm', mm(20)], ['25 mm', mm(25)], ['30 mm', mm(30)]].map(([l, s]) => [l, s, s, s, 0, {}]),
    build: calCube }),
  fam({ cat: 'printing/calibration', title: 'Generic temperature tower',
    desc: (v) => `Temperature tower with a base plate, a central core with ${v.tiers} tier marks, a left overhang wedge and a right bridge span to a post on every tier.`,
    vs: [['5 tiers', mm(36), mm(24), mm(65)], ['7 tiers', mm(36), mm(24), mm(89)], ['9 tiers', mm(36), mm(24), mm(113)]].map(([l, w, d, h], i) => [l, w, d, h, 0, { tiers: [5, 7, 9][i] }]),
    build: tempTower }),
  fam({ cat: 'printing/calibration', title: 'Generic test hull',
    desc: 'Test hull print with a layered pointed hull, a cabin with roof and wheelhouse, a round chimney, a stern arch and a bow deck, giving overhangs, bridges and small round features.',
    vs: [['40 mm', mm(40)], ['60 mm', mm(60)], ['120 mm', mm(120)], ['180 mm', mm(180)]].map(([l, L]) => [l, L * 0.52, L, L * 0.8, 0, {}]),
    build: testHull }),
  fam({ cat: 'printing/calibration', title: 'Generic bridging test',
    desc: (v) => `Bridging test with a base plate and ${v.spans.length + 1} posts joined by ${v.spans.length} bridge spans of growing length.`,
    vs: [['spans to 30 mm', [5, 10, 15, 20, 30]], ['spans to 50 mm', [10, 20, 30, 40, 50]], ['spans to 100 mm', [20, 40, 60, 80, 100]]].map(([l, spans]) => [l, mm(spans.reduce((s, x) => s + x, 0) + 8 * (spans.length + 1) + 8), mm(20), mm(spans[spans.length - 1] > 60 ? 28 : 18), 0, { spans }]),
    build: bridgeTest }),
  fam({ cat: 'printing/calibration', title: 'Generic overhang test',
    desc: (v) => `Overhang test with a base plate and ${v.angles.length} posts, each with an underside sloped at its test angle (${v.angles.join(', ')} degrees) that the printer must bridge.`,
    vs: [['4 angles, 30 to 60 degrees', [30, 40, 50, 60]], ['6 angles, 20 to 70 degrees', [20, 30, 40, 50, 60, 70]], ['8 angles, 15 to 85 degrees', [15, 25, 35, 45, 55, 65, 75, 85]]].map(([l, angles]) => [l, mm(angles.length * 24 + 4), mm(18), mm(24), 0, { angles }]),
    build: overhangTest }),
  fam({ cat: 'printing/calibration', title: 'Generic tolerance test plate',
    desc: (v) => `Tolerance plate with ${v.steps} holes of growing clearance and ${v.steps} matching pins standing on the same plate.`,
    vs: [['5 steps', 5, 0.15], ['6 steps, fine', 6, 0.08], ['8 steps', 8, 0.12], ['10 steps', 10, 0.1]].map(([l, steps, clear]) => [l, mm(steps * 15 + 6), mm(34), mm(7), 0, { steps, clear: clear / 1.0, hole: mm(10) }]),
    build: (a, v) => { v.clear = v.clear; tolerancePlate(a, v); } }),
  fam({ cat: 'printing/calibration', title: 'Generic stringing and retraction test',
    desc: (v) => `Stringing test with a base plate and ${v.towers} slim round towers at ${v.gap} in spacing, used to check stringing and retraction.`,
    vs: [['2 towers, 1 in apart', 2, 1.0, 1.9, 1.6], ['2 towers, 2 in apart', 2, 2.0, 2.9, 1.6], ['3 towers, 1.5 in apart', 3, 1.5, 4.0, 1.6]].map(([l, towers, gap, w, h]) => [l, w, 1.1, h, 0, { towers, gap }]),
    build: stringTest }),
];
export default FAMS;

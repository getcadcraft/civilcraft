/* SPDX-License-Identifier: Apache-2.0 */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = m.PI;
// ------------------------------------------------------------------------------------------ helpers (copied patterns; mm, z up, front -Y)
/** extrude a convex polygon of [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
// ------------------------------------------------------------------------------------------ nature helpers
/** a small deterministic random generator */
function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
/** an irregular lump: an ellipsoid whose radius is displaced by smooth noise; flat cut at zmin (a buried base) */
function lump(a, cx, cy, cz, rx, ry, rz, seed = 1, amp = 0.16, nu = 16, nv = 9, zmin = null) {
  const R = rng(seed), ph = [R() * 6, R() * 6, R() * 6, R() * 6], f1 = 2 + m.floor(R() * 2), f2 = 3 + m.floor(R() * 3);
  const P = (u, v) => {
    const sx = m.sin(v) * m.cos(u), sy = m.sin(v) * m.sin(u), sz = m.cos(v);
    const n = m.sin(2.3 * sx + ph[0]) * m.cos(2.1 * sy + ph[1]) * 0.6 + m.sin(3.1 * sz + ph[2]) * 0.35 + m.sin(4.7 * sx + 3.3 * sy + ph[3]) * 0.4, k = 1 + amp * n;
    let z = cz + rz * k * sz; if (zmin !== null && z < zmin) z = zmin;
    return [cx + rx * k * sx, cy + ry * k * sy, z];
  };
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = i / nu * 2 * PI, u1 = (i + 1) / nu * 2 * PI, v0 = j / nv * PI, v1 = (j + 1) / nv * PI;
    const A = P(u0, v0), B = P(u1, v0), C = P(u1, v1), D = P(u0, v1);
    a.t.push([A, B, C], [A, C, D]);
  }
  return a;
}
/** a heightfield solid: top surface z = f(x, y) over [x0,x1] x [y0,y1] on an nx by ny grid, skirt down to zb */
function field(a, x0, x1, y0, y1, nx, ny, f, zb) {
  const X = (i) => x0 + (x1 - x0) * i / nx, Y = (j) => y0 + (y1 - y0) * j / ny, Pt = (i, j) => [X(i), Y(j), m.max(zb + 1, f(X(i), Y(j)))];
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const A = Pt(i, j), B = Pt(i + 1, j), C = Pt(i + 1, j + 1), D = Pt(i, j + 1); a.t.push([A, B, C], [A, C, D]); }
  for (let i = 0; i < nx; i++) { for (const j of [0, ny]) { const A = Pt(i, j), B = Pt(i + 1, j); a.t.push([A, B, [B[0], B[1], zb]], [A, [B[0], B[1], zb], [A[0], A[1], zb]]); } }
  for (let j = 0; j < ny; j++) { for (const i of [0, nx]) { const A = Pt(i, j), B = Pt(i, j + 1); a.t.push([A, B, [B[0], B[1], zb]], [A, [B[0], B[1], zb], [A[0], A[1], zb]]); } }
  a.t.push([[x0, y0, zb], [x1, y0, zb], [x1, y1, zb]], [[x0, y0, zb], [x1, y1, zb], [x0, y1, zb]]);
  return a;
}
/** an irregular outline polygon (for plan) around (cx, cy) with radii rx, ry and noise */
function blobPoly(cx, cy, rx, ry, seed = 1, n = 20, amp = 0.12) { const R = rng(seed), ph = [R() * 6, R() * 6]; return Array.from({ length: n }, (_, i) => { const u = i / n * 2 * PI, k = 1 + amp * (m.sin(3 * u + ph[0]) * 0.6 + m.sin(5 * u + ph[1]) * 0.4); return [cx + rx * k * m.cos(u), cy + ry * k * m.sin(u)]; }); }

/** a tapering trunk with a root flare and bark rings: base radius r0, top radius r1 */
function trunk(a, x, y, z0, z1, r0, r1, lean = [0, 0], seg = 12) {
  a.tube([[x, y, z0], [x, y, z0 + (z1 - z0) * 0.08], [x + lean[0] * 0.4, y + lean[1] * 0.4, z0 + (z1 - z0) * 0.5], [x + lean[0], y + lean[1], z1]], [r0 * 1.5, r0, (r0 + r1) / 2, r1], seg);
}
function quad(a, s) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, by = YF + D * s.by, ry = D * s.bl, rx = W * s.bw, rz = H * s.bh * 1.12, bz = Z0 + H * s.leg + rz * 0.92;
  const hl = D * s.hl, hw = W * s.hw, hh = H * s.hh, hy = YF + m.max(D * s.hy, hl * (0.9 + s.snout) + hw * 0.3 + 4), hz = Z0 + H * s.hz, ex = (k) => m.min(hw * k, W * 0.47);
  // legs: front pair under the chest, rear pair under the haunch with a bent hock
  const lr = W * s.lr * 1.7, lx = W * s.lx, fy = by - ry * 0.55, ryy = by + ry * 0.58;
  for (const sx of [-1, 1]) {
    const x = cx + sx * lx;
    a.tube([[x, fy, bz - rz * 0.2], [x, fy + D * 0.005, Z0 + H * s.leg * 0.5], [x, fy - D * 0.004, Z0 + H * 0.05], [x, fy - D * 0.004, Z0 + 3]], [lr * 1.5, lr * 1.1, lr * 0.8, lr * 0.9], 8);
    a.tube([[x, ryy, bz - rz * 0.1], [x, ryy - D * 0.025, Z0 + H * s.leg * 0.55], [x, ryy + D * 0.025, Z0 + H * s.leg * 0.28], [x, ryy + D * 0.02, Z0 + H * 0.05], [x, ryy + D * 0.02, Z0 + 3]], [lr * 1.7, lr * 1.1, lr * 0.8, lr * 0.75, lr * 0.85], 8);
    a.box(x - lr * (s.bigfoot ? 1.5 : 1), fy - D * 0.004 - lr * (s.bigfoot ? 2.4 : 1.6), Z0, x + lr * (s.bigfoot ? 1.5 : 1), fy - D * 0.004 + lr * 1.2, Z0 + H * 0.025); a.box(x - lr * (s.bigfoot ? 1.5 : 1), ryy + D * 0.02 - lr * 1.4, Z0, x + lr * (s.bigfoot ? 1.5 : 1), ryy + D * 0.02 + lr * (s.bigfoot ? 2.2 : 1.6), Z0 + H * 0.025);
    a.circ(x, fy, lr, 'EQUIP-DETAIL'); a.circ(x, ryy, lr, 'EQUIP-DETAIL');
  }
  // body, chest and haunch
  a.ell(cx, by, bz, rx, ry, rz, 16, 9);
  a.ell(cx, by - ry * 0.55, bz + rz * 0.06, rx * 0.98, ry * 0.5, rz * 1.02, 12, 8);
  a.ell(cx, by + ry * 0.6, bz + rz * 0.05, rx * 1.02, ry * 0.45, rz * 1.0, 12, 8);
  if (s.hump) a.ell(cx, by - ry * 0.4, bz + rz * 0.85, rx * 0.8, ry * 0.4, rz * 0.5, 10, 6);
  if (s.udder) a.ell(cx, by + ry * 0.55, bz - rz * 0.95, rx * 0.4, ry * 0.22, rz * 0.4, 8, 5);
  if (s.wool) for (let k = 0; k < 5; k++) for (const [ox, oz, q] of [[0, 0.55, 0.55], [-0.55, 0.25, 0.5], [0.55, 0.25, 0.5]]) a.ell(cx + ox * rx, by + (k - 2) * ry * 0.34, bz + rz * oz, rx * q, ry * 0.2, rz * q * 0.95, 8, 5);
  // neck and head
  a.tube([[cx, by - ry * 0.75, bz + rz * 0.35], [cx, (by - ry * 0.75 + hy) / 2, (bz + rz * 0.35 + hz) / 2 + hh * 0.2], [cx, hy + hl * 0.5, hz - hh * 0.1]], [W * s.neck, W * s.neck * 0.85, W * s.neck * 0.62], 10);
  a.ell(cx, hy, hz, hw, hl, hh, 12, 8);
  if (s.snout) a.ell(cx, hy - hl * 0.8, hz - hh * 0.25, hw * 0.72, hl * s.snout, hh * 0.62, 10, 6);
  a.ell(cx, hy - hl * (0.8 + s.snout * 1.0) * (s.snout ? 1 : 0.3), hz - hh * 0.2, hw * 0.28, hw * 0.2, hh * 0.22, 6, 4);   // nose
  for (const sx of [-1, 1]) { a.ell(cx + sx * hw * 0.78, hy - hl * 0.28, hz + hh * 0.35, hw * 0.12, hl * 0.12, hh * 0.15, 6, 4); }   // eyes
  for (const sx of [-1, 1]) {
    if (s.ear === 'pt') a.cone(cx + sx * hw * 0.65, hy + hl * 0.35, hz + hh * 0.75, hz + hh * 1.75, hw * 0.3, hw * 0.05, 6);
    else if (s.ear === 'long') a.tube([[cx + sx * hw * 0.55, hy + hl * 0.5, hz + hh * 0.8], [cx + sx * ex(1.9), hy + hl * 0.6, hz + hh * 1.3], [cx + sx * ex(2.7), hy + hl * 0.8, hz + hh * 1.05]], [hw * 0.34, hw * 0.3, hw * 0.1], 6);
    else if (s.ear === 'flop') a.tube([[cx + sx * hw * 0.7, hy + hl * 0.4, hz + hh * 0.7], [cx + sx * hw * 1.2, hy + hl * 0.5, hz + hh * 0.2], [cx + sx * hw * 1.3, hy + hl * 0.55, hz - hh * 0.5]], [hw * 0.3, hw * 0.35, hw * 0.12], 6);
    if (s.horns) a.tube([[cx + sx * hw * 0.7, hy + hl * 0.4, hz + hh * 0.8], [cx + sx * ex(1.7), hy + hl * 0.4, hz + hh * 1.3], [cx + sx * ex(1.9), hy + hl * 0.4, hz + hh * 2.1]], [hw * 0.18, hw * 0.13, hw * 0.04], 6);
    if (s.antlers) { const ah = H * 0.26; a.tube([[cx + sx * hw * 0.5, hy + hl * 0.4, hz + hh * 0.9], [cx + sx * W * 0.2, hy + hl * 0.1, hz + hh + ah * 0.5], [cx + sx * W * 0.28, hy - hl * 0.2, hz + hh + ah]], [hw * 0.14, hw * 0.11, hw * 0.05], 6); for (let k = 1; k <= 3; k++) { const f = k / 4; a.tube([[cx + sx * (hw * 0.5 + (W * 0.28 - hw * 0.5) * f), hy + hl * 0.4 - hl * 0.6 * f, hz + hh * 0.9 + (ah + hh * 0.1) * f], [cx + sx * (hw * 0.5 + (W * 0.28 - hw * 0.5) * f) + sx * W * 0.04, hy + hl * 0.4 - hl * 0.6 * f - hl * 0.4, hz + hh * 0.9 + (ah + hh * 0.1) * f + ah * 0.28]], [hw * 0.07, hw * 0.025], 5); } }
  }
  if (s.mane) for (let i = 0; i < 9; i++) { const f = i / 8, y = hy + hl * 0.8 + (by - ry * 0.6 - hy - hl * 0.8) * f, z = hz + hh * 0.5 + (bz + rz * 0.95 - hz - hh * 0.5) * f; a.box(cx - W * 0.015, y - D * 0.012, z - H * 0.03, cx + W * 0.015, y + D * 0.012, z + H * 0.05); }
  // tail
  const ty = by + ry * 0.98, tz = bz + rz * 0.3;
  if (s.tail === 'long') a.tube([[cx, ty - D * 0.01, tz], [cx, ty + D * 0.03, tz - H * 0.08], [cx, YB - D * 0.01, tz - H * 0.32]], [W * 0.03, W * 0.05, W * 0.035], 6);
  else if (s.tail === 'bushy') a.tube([[cx, ty - D * 0.01, tz], [cx, ty + D * 0.04, tz - H * 0.02], [cx, YB - D * 0.01, tz - H * 0.18]], [W * 0.05, W * 0.11, W * 0.07], 8);
  else if (s.tail === 'curl') a.tube([[cx, ty - D * 0.01, tz], [cx, ty + D * 0.03, tz + H * 0.1], [cx, ty + D * 0.05, tz + H * 0.03]], [W * 0.04, W * 0.03, W * 0.02], 6);
  else if (s.tail === 'short') a.tube([[cx, ty - D * 0.01, tz], [cx, YB - D * 0.015, tz - H * 0.07]], [W * 0.05, W * 0.035], 6);
  a.ellp(cx, by, rx, ry); a.ellp(cx, hy, hw, hl, 'EQUIP-DETAIL'); a.line(cx, hy + hl, cx, by - ry, 'EQUIP-DETAIL'); a.line(cx, ty, cx, YB - 2, 'EQUIP-DETAIL');
  a.log('Added the body with chest and haunch masses, four jointed legs with feet, the neck, the head with snout, eyes and ears' + (s.antlers ? ', branched antlers' : '') + (s.horns ? ', horns' : '') + (s.mane ? ', a mane' : '') + (s.udder ? ', an udder' : '') + (s.wool ? ', a wool coat' : '') + ' and a tail (plan and 3D).');
}
const base = { leg: 0.5, by: 0.52, bl: 0.28, bw: 0.4, bh: 0.2, hy: 0.09, hz: 0.88, hl: 0.08, hw: 0.2, hh: 0.075, snout: 0.8, neck: 0.15, lx: 0.26, lr: 0.05, ear: 'pt', tail: 'short' };
function bird(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, s = v.s, by = YF + D * s.by, bz = Z0 + H * s.leg + H * s.bh, rx = W * 0.4, ry = D * s.bl, rz = H * s.bh;
  const hr = H * s.hr, hy = YF + m.max(D * s.hy, hr * 2.2 + H * s.beak + 2), hz = Z0 + H * s.hz;
  a.ell(cx, by, bz, rx, ry, rz, 14, 8); a.ell(cx, by - ry * 0.6, bz + rz * 0.1, rx * 0.95, ry * 0.5, rz * 1.0, 10, 7);
  for (const sx of [-1, 1]) a.ell(cx + sx * rx * 0.78, by + ry * 0.1, bz + rz * 0.1, rx * 0.28, ry * 0.7, rz * 0.7, 8, 5);   // folded wings
  prismX(a, [[by + ry * 0.7, bz + rz * 0.3], [YB - 2, bz - rz * 0.5], [YB - 2, bz - rz * 0.8], [by + ry * 0.7, bz - rz * 0.3]], cx - W * 0.1, cx + W * 0.1);   // tail
  a.tube([[cx, by - ry * 0.7, bz + rz * 0.4], [cx, (by - ry * 0.7 + hy) / 2, (bz + hz) / 2 + (s.neck > 0.3 ? H * 0.04 : 0)], [cx, hy + hr * 0.6, hz - hr * 0.3]], [W * s.nr, W * s.nr * 0.75, W * s.nr * 0.6], 8);
  a.ell(cx, hy, hz, W * 0.17, hr * 1.1, hr, 10, 7);
  a.cone(cx, hy, hz, hz + 0.01, 1, 1, 3);
  a.tube([[cx, hy - hr, hz - hr * 0.1], [cx, hy - hr - H * s.beak, hz - hr * 0.3]], [hr * 0.55, hr * 0.12], 6);
  for (const sx of [-1, 1]) a.ell(cx + sx * W * 0.14, hy - hr * 0.3, hz + hr * 0.2, W * 0.025, hr * 0.2, hr * 0.2, 5, 4);
  for (const sx of [-1, 1]) { const x = cx + sx * W * 0.14, ly = by + ry * 0.1; a.tube([[x, ly, bz - rz * 0.6], [x, ly + 4, Z0 + H * s.leg * 0.5], [x, ly - 2, Z0 + 3]], [W * 0.035, W * 0.022, W * 0.02], 6); for (const f of [-1, 0, 1]) a.tube([[x, ly - 2, Z0 + 3], [x + f * W * 0.07, ly - W * 0.18, Z0 + 1.5]], [W * 0.012, W * 0.008], 4); }
  a.ellp(cx, by, rx, ry); a.ellp(cx, hy, W * 0.17, hr * 1.1, 'EQUIP-DETAIL'); a.line(cx, hy - hr, cx, hy - hr - H * s.beak, 'EQUIP-DETAIL'); a.poly([[cx - W * 0.1, by + ry * 0.7], [cx + W * 0.1, by + ry * 0.7], [cx, YB - 2]], 'EQUIP-DETAIL');
  a.log('Added the body with breast, folded wings and a tail, the neck, head with beak and eyes, and two legs with toes (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ round 7 helpers
/** a convex polygon of n points around (x, y), counter-clockwise, optional radius jitter */
const ngon = (x, y, rx, ry, n, rot = 0, R = null, j = 0) => Array.from({ length: n }, (_, i) => { const t = rot + i / n * 2 * PI, k = 1 + (R ? (R() - 0.5) * j : 0); return [x + m.cos(t) * rx * k, y + m.sin(t) * ry * k]; });
/** a closed solid made of stacked convex polygons (all CCW with the same point count): levels = [{ poly, z }] bottom to top */
function lofts(a, lv, capBottom = true) {
  const n = lv[0].poly.length;
  for (let k = 0; k < lv.length - 1; k++) {
    const p = lv[k].poly, q = lv[k + 1].poly, z0 = lv[k].z, z1 = lv[k + 1].z;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; a.t.push([[p[i][0], p[i][1], z0], [p[j][0], p[j][1], z0], [q[j][0], q[j][1], z1]], [[p[i][0], p[i][1], z0], [q[j][0], q[j][1], z1], [q[i][0], q[i][1], z1]]); }
  }
  const top = lv[lv.length - 1], bot = lv[0];
  for (let i = 1; i < n - 1; i++) { a.t.push([[top.poly[0][0], top.poly[0][1], top.z], [top.poly[i][0], top.poly[i][1], top.z], [top.poly[i + 1][0], top.poly[i + 1][1], top.z]]); if (capBottom) a.t.push([[bot.poly[0][0], bot.poly[0][1], bot.z], [bot.poly[i + 1][0], bot.poly[i + 1][1], bot.z], [bot.poly[i][0], bot.poly[i][1], bot.z]]); }
  return a;
}
/** a closed ring in the Y-Z plane at x (for wheels and hoops) as a tube */
function ringYZ(a, x, y, z, r, t, n = 20) { const pts = Array.from({ length: n + 1 }, (_, i) => [x, y + m.cos(i / n * 2 * PI) * r, z + m.sin(i / n * 2 * PI) * r]); a.tube(pts, pts.map(() => t), 5); }
/** a closed ring in the X-Z plane at y */
function ringXZ(a, x, y, z, r, t, n = 16) { const pts = Array.from({ length: n + 1 }, (_, i) => [x + m.cos(i / n * 2 * PI) * r, y, z + m.sin(i / n * 2 * PI) * r]); a.tube(pts, pts.map(() => t), 5); }
/** a curved tube from a to b bowing up by lift */
function arcTube(a, p, q, lift, rads, seg = 5, n = 4) { const pts = Array.from({ length: n + 1 }, (_, i) => { const f = i / n; return [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, p[2] + (q[2] - p[2]) * f + lift * 4 * f * (1 - f)]; }); a.tube(pts, rads.length === n + 1 ? rads : pts.map((_, i) => rads[0] + (rads[rads.length - 1] - rads[0]) * i / n), seg); }
/** a round basin: solid wall, water disc inside a raised coping of studs */
function roundBasin(a, cx, cy, z0, r, h, water = 0.82) {
  a.cyl(cx, cy, z0, z0 + h, r, 32); a.cyl(cx, cy, z0 + h, z0 + h + 4, r * water, 28);
  const ns = 24; for (let k = 0; k < ns; k++) { const th = k / ns * 2 * PI; a.box(cx + m.cos(th) * r * 0.93 - 7, cy + m.sin(th) * r * 0.93 - 7, z0 + h, cx + m.cos(th) * r * 0.93 + 7, cy + m.sin(th) * r * 0.93 + 7, z0 + h + 14); }
}
/** a rectangular basin / trough: solid body, four rim boxes, water box inset */
function boxBasin(a, x0, y0, x1, y1, z0, h, rim = 28, wall = 28) {
  a.box(x0, y0, z0, x1, y1, z0 + h); a.box(x0, y0, z0 + h, x1, y0 + wall, z0 + h + rim * 0.5); a.box(x0, y1 - wall, z0 + h, x1, y1, z0 + h + rim * 0.5); a.box(x0, y0, z0 + h, x0 + wall, y1, z0 + h + rim * 0.5); a.box(x1 - wall, y0, z0 + h, x1, y1, z0 + h + rim * 0.5);
  a.box(x0 + wall, y0 + wall, z0 + h, x1 - wall, y1 - wall, z0 + h + rim * 0.3);
}

// ------------------------------------------------------------------------------------------ rocks
/** A standing stone: a tall tapering slab of five stacked outlines, set in a small earth mound with stones at the foot. v.lean = fraction of the width the top leans. */
function menhir(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), w = W * 0.3, d = D * 0.19, lean = v.lean || 0;
  const ks = [1, 0.95, 0.88, 0.74, 0.46], fz = [0, 0.18, 0.5, 0.82, 1];
  const lv = ks.map((k, i) => ({ z: Z0 + H * fz[i] * (i === 0 ? 1 : 0.985) + (i === 4 ? H * 0.015 : 0), poly: ngon(cx + lean * W * fz[i] * fz[i] * 0.3 - w * 0.05 * (1 - fz[i]), cy, w * k, d * k, 6, 0.35, rng(v.seed + 40), 0.08) }));
  lofts(a, lv);
  lump(a, cx, cy, Z0 + 6, W * 0.46, D * 0.44, 22, v.seed, 0.15, 14, 5, Z0);
  for (let i = 0; i < 3; i++) { const th = i * 2.1 + R(), s = 0.06 + R() * 0.03; lump(a, cx + m.cos(th) * W * 0.34, cy + m.sin(th) * D * 0.34, Z0 + H * s * 0.4, W * s, W * s * 0.8, H * s * 0.5, v.seed + i, 0.25, 8, 5, Z0); }
  a.poly(lv[0].poly, 'EQUIP'); a.poly(lv[4].poly, 'EQUIP-DETAIL'); a.poly(blobPoly(cx, cy, W * 0.46, D * 0.44, v.seed, 18, 0.1), 'EQUIP-DETAIL');
  a.log('Added the tapering standing slab of five stacked outlines' + (lean ? ', leaning' : '') + ', an earth mound at its foot and three loose stones (plan and 3D).');
}
const menhirs = fam({ cat: 'nature/rocks', title: 'Generic standing stone', desc: (v) => `Standing stone, ${v.hf} ft high${v.lean ? ' and leaning' : ''}: a tapering irregular slab set in a small earth mound with loose stones at its foot.`, build: menhir, vs: [
  ['3 ft, upright', 28, 18, 36, 0, { seed: 2, hf: 3 }], ['5 ft, upright', 40, 24, 60, 0, { seed: 4, hf: 5 }], ['8 ft, upright', 60, 34, 96, 0, { seed: 6, hf: 8 }], ['12 ft, upright', 84, 44, 144, 0, { seed: 8, hf: 12 }], ['7 ft, leaning', 56, 30, 84, 0, { seed: 9, hf: 7, lean: 1 }] ] });

/** A dolmen: capstone resting on upright slabs. v.kind simple | chamber | backed */
function dolmen(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), uh = H * 0.8, up = (x, y, w, d, h = uh) => lofts(a, [{ z: Z0, poly: ngon(x, y, w, d, 4, PI / 4, R, 0.15) }, { z: Z0 + h * 0.6, poly: ngon(x, y, w * 0.96, d * 0.96, 4, PI / 4, R, 0.1) }, { z: Z0 + h, poly: ngon(x + (R() - 0.5) * w * 0.3, y, w * 0.8, d * 0.8, 4, PI / 4, R, 0.1) }]);
  const ys = v.kind === 'chamber' ? [cy - D * 0.24, cy + D * 0.24] : [cy];
  for (const y of ys) for (const sx of [-1, 1]) up(cx + sx * W * 0.34, y, W * 0.075, D * (v.kind === 'chamber' ? 0.1 : 0.2));
  if (v.kind === 'backed') up(cx, cy + D * 0.34, W * 0.3, D * 0.07, uh * 0.9);
  lump(a, cx, cy, Z0 + H * 0.88, W * 0.49, D * 0.47, H * 0.11, v.seed + 3, 0.1, 18, 7, Z0 + H * 0.77);
  lump(a, cx, cy, Z0 + 10, W * 0.49, D * 0.49, 30, v.seed + 5, 0.12, 14, 5, Z0);
  for (let i = 0; i < 4; i++) { const th = i * 1.7 + 0.5, s = 0.045; lump(a, cx + m.cos(th) * W * 0.42, cy + m.sin(th) * D * 0.4, Z0 + H * s * 0.4, W * s, W * s, H * s, v.seed + i, 0.2, 8, 5, Z0); }
  for (const y of ys) for (const sx of [-1, 1]) a.rect(cx + sx * W * 0.34 - W * 0.075, y - D * 0.14, cx + sx * W * 0.34 + W * 0.075, y + D * 0.14, 'EQUIP-DETAIL');
  a.poly(blobPoly(cx, cy, W * 0.49, D * 0.47, v.seed, 22, 0.08), 'EQUIP'); a.poly(blobPoly(cx, cy, W * 0.32, D * 0.3, v.seed + 2, 16, 0.1), 'EQUIP-DETAIL');
  a.log('Added ' + (ys.length * 2 + (v.kind === 'backed' ? 1 : 0)) + ' upright slabs, the broad capstone resting on them and a low earth mound with a few stones (plan and 3D).');
}
const dolmens = fam({ cat: 'nature/rocks', title: 'Generic dolmen', desc: (v) => `Dolmen, ${v.hf} ft high: a broad capstone resting on ${v.kind === 'chamber' ? 'four' : 'two'} upright slabs${v.kind === 'backed' ? ' and a back slab' : ''}, set in a low mound with loose stones.`, build: dolmen, vs: [
  ['two uprights, 4 ft', 72, 50, 48, 0, { seed: 1, hf: 4, kind: 'simple' }], ['backed chamber, 6 ft', 96, 66, 72, 0, { seed: 2, hf: 6, kind: 'backed' }], ['four uprights, 9 ft', 150, 110, 108, 0, { seed: 3, hf: 9, kind: 'chamber' }] ] });

/** A natural rock arch: a ring of wedge blocks over two piers on a rubble base. */
function rockArch(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), n = v.blocks, ri = W * 0.27, thick = W * 0.15, zc = Z0 + H - ri - thick * 1.1, dy = D * 0.42;
  const jr = Array.from({ length: n + 1 }, () => [1 + (R() - 0.5) * 0.12, 1 + (R() - 0.5) * 0.2]), ro = ri + thick, P = (t, r) => [cx + m.cos(t) * r, zc + m.sin(t) * r];
  for (let k = 0; k < n; k++) { const t0 = PI * k / n, t1 = PI * (k + 1) / n; prismY(a, [P(t0, ri * jr[k][0]), P(t1, ri * jr[k + 1][0]), P(t1, ro * jr[k + 1][1]), P(t0, ro * jr[k][1])], cy - dy * (0.9 + R() * 0.15), cy + dy * (0.9 + R() * 0.15)); }
  for (const s of [-1, 1]) {
    const x0 = cx + s * (ri + thick * 0.5);
    for (let j = 0; j < 3; j++) lump(a, x0, cy, Z0 + (zc - Z0) * (j * 0.36 + 0.2), thick * 0.78, dy * (0.95 - j * 0.04), (zc - Z0) * 0.22, v.seed + j * 3 + (s > 0 ? 9 : 0), 0.15, 12, 6, Z0 + (zc - Z0) * j * 0.34 - 2);
    lump(a, cx + s * W * 0.43, cy, Z0 + 16, W * 0.1, D * 0.46, 34, v.seed + 20 + s, 0.2, 10, 5, Z0);
  }
  for (let i = 0; i < 5; i++) { const x = cx + (R() - 0.5) * ri * 1.4, s = 0.04 + R() * 0.03; lump(a, x, cy + (R() - 0.5) * D * 0.5, Z0 + H * s * 0.5, W * s, W * s, H * s * 0.7, v.seed + i, 0.25, 8, 5, Z0); }
  a.rect(X0, cy - dy, X1, cy + dy, 'EQUIP'); a.arc(cx, cy, ri, 0, 360, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.line(cx + s * ri, cy - dy, cx + s * ri, cy + dy, 'EQUIP-DETAIL');
  a.log('Added ' + n + ' wedge blocks forming the arch ring, two stacked rock piers with rubble at their feet and loose stones in the opening (plan and 3D).');
}
const rockArches = fam({ cat: 'nature/rocks', title: 'Generic natural rock arch', desc: (v) => `Natural rock arch, ${v.sf} ft span: a ring of ${v.blocks} wedge blocks standing on two stacked rock piers with rubble at the feet.`, build: rockArch, vs: [
  ['4 ft opening, 8 ft high', 108, 40, 96, 0, { seed: 1, blocks: 9, sf: 4 }], ['7 ft opening, 14 ft high', 190, 66, 168, 0, { seed: 2, blocks: 11, sf: 7 }], ['12 ft opening, 24 ft high', 330, 110, 288, 0, { seed: 3, blocks: 13, sf: 12 }] ] });
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}

/** A hoodoo: a stack of eroded layers narrowing to a neck under a wider cap. */
function hoodoo(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), n = v.layers, th = H * 0.97 / (0.8 * n + 0.32);
  let z = Z0;
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1), r = i === n - 1 ? 0.46 : (0.46 - 0.2 * f) * (0.78 + 0.22 * m.abs(m.sin(f * PI * v.waves + 0.7))), ox = (R() - 0.5) * W * 0.04, oy = (R() - 0.5) * D * 0.04;
    lump(a, cx + ox, cy + oy, z + th * 0.5, W * r, D * r, th * (i === n - 1 ? 0.7 : 0.62), v.seed + i * 5, 0.1, 16, 6, z - 3);
    a.poly(blobPoly(cx + ox, cy + oy, W * r, D * r, v.seed + i, 16, 0.08), i === 0 ? 'EQUIP' : 'EQUIP-DETAIL');
    z += th * 0.8;
  }
  for (let i = 0; i < 4; i++) { const th2 = i * 1.6, s = 0.05 + R() * 0.03; lump(a, cx + m.cos(th2) * W * 0.4, cy + m.sin(th2) * D * 0.4, Z0 + H * s * 0.4, W * s, W * s, H * s * 0.7, v.seed + i, 0.25, 8, 5, Z0); }
  a.log('Added ' + n + ' eroded layers narrowing to a neck under a wider cap, with fallen stones around the foot (plan and 3D).');
}
const hoodoos = fam({ cat: 'nature/rocks', title: 'Generic hoodoo rock pillar', desc: (v) => `Eroded rock pillar, ${v.hf} ft: ${v.layers} banded layers with a narrow neck under a wide cap stone and fallen stones at the foot.`, build: hoodoo, vs: [
  ['6 ft, 5 layers', 48, 44, 72, 0, { seed: 1, layers: 5, waves: 1.5, hf: 6 }], ['12 ft, 7 layers', 84, 76, 144, 0, { seed: 2, layers: 7, waves: 2.5, hf: 12 }], ['20 ft, 9 layers', 130, 120, 240, 0, { seed: 3, layers: 9, waves: 3.5, hf: 20 }] ] });

/** A boulder retaining wall: staggered courses of rounded boulders. */
function boulderWall(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), rows = v.rows, h = H / (0.55 + 0.82 * (rows - 1) + 0.65);
  for (let r = 0; r < rows; r++) {
    const nr = m.round(W / (h * 1.35)) - (r % 2 ? 1 : 0), cw = W / (m.round(W / (h * 1.35)));
    for (let k = 0; k < nr; k++) { const x = X0 + cw * (k + (r % 2 ? 1 : 0.5)), inset = r * D * 0.03; lump(a, x, cy + (R() - 0.5) * D * 0.08 + inset, Z0 + h * (0.55 + r * 0.82), cw * 0.54, D * 0.47 - inset, h * (0.55 + R() * 0.12), v.seed + r * 9 + k, 0.14, 12, 6, r ? Z0 + h * (0.3 + r * 0.82) : Z0); }
  }
  a.rect(X0, YF, X1, YB, 'EQUIP'); const cw = W / m.round(W / (h * 1.35)); for (let k = 0; k < m.round(W / (h * 1.35)); k++) a.circ(X0 + cw * (k + 0.5), cy, cw * 0.4, 'EQUIP-DETAIL');
  a.log('Added ' + rows + ' staggered courses of rounded boulders, each course set back slightly from the one below (plan and 3D).');
}
const bwalls = fam({ cat: 'nature/rocks', title: 'Generic boulder retaining wall', desc: (v) => `Boulder retaining wall, ${v.lf} ft long and ${v.rows} courses high: staggered rounded boulders, each course stepped back from the one below.`, build: boulderWall, vs: [
  ['2 courses, 10 ft long', 120, 30, 36, 0, { seed: 1, rows: 2, lf: 10 }], ['3 courses, 16 ft long', 192, 40, 60, 0, { seed: 2, rows: 3, lf: 16 }], ['4 courses, 24 ft long', 288, 52, 84, 0, { seed: 3, rows: 4, lf: 24 }] ] });

/** A scree slope: a steep heap of broken rock that falls away to the front, with larger blocks scattered on it. */
function scree(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), ph = R() * 6;
  const f = (x, y) => { const t = (YB - y) / D, u = (x - cx) / (W / 2); return Z0 + H * m.pow(m.max(0, 1 - t), 1.5) * (1 - 0.35 * u * u) * (0.94 + 0.06 * m.sin(u * 7 + t * 3 + ph)); };
  field(a, X0, X1, YF, YB, 36, 16, f, Z0);
  for (let i = 0; i < v.blocks; i++) { const x = X0 + W * (0.06 + 0.88 * R()), y = YF + D * (0.05 + 0.85 * R()), s = 0.03 + R() * 0.04; lump(a, x, y, f(x, y) + H * s * 0.2, W * s, W * s * 0.8, H * s * 1.3, v.seed + i, 0.28, 8, 5, f(x, y) - 10); a.poly(blobPoly(x, y, W * s, W * s * 0.8, v.seed + i, 8, 0.2), 'EQUIP-DETAIL'); }
  a.poly([[X0, YB], [X1, YB], [X1, YF + D * 0.3], [cx, YF], [X0, YF + D * 0.3]], 'EQUIP');
  a.log('Added the steep scree heap with a rounded profile and ' + v.blocks + ' larger fallen blocks scattered on its face (plan and 3D).');
}
const screes = fam({ cat: 'nature/rocks', title: 'Generic scree slope', desc: (v) => `Scree slope of broken rock, ${v.hf} ft high: a steep heap that falls away to the front with ${v.blocks} larger blocks lying on it.`, build: scree, vs: [
  ['4 ft high, 12 ft wide', 144, 72, 48, 0, { seed: 1, blocks: 8, hf: 4 }], ['8 ft high, 24 ft wide', 288, 140, 96, 0, { seed: 2, blocks: 14, hf: 8 }], ['14 ft high, 40 ft wide', 480, 220, 168, 0, { seed: 3, blocks: 20, hf: 14 }] ] });

/** Basalt columns: a cluster of hexagonal prisms of different heights. v.rings or v.row */
function basalt(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed);
  if (v.row) {
    const n = v.row, rw = W / n;
    for (let i = 0; i < n; i++) { const f = i / (n - 1), h = H * (0.35 + 0.65 * m.sin(f * PI * 0.5 + 0.2) * (0.85 + R() * 0.15)), x = X0 + rw * (i + 0.5), r = m.min(rw, D) * 0.49; a.prism(ngon(x, cy, r, r, 6, PI / 6, R, 0.04), Z0, Z0 + m.min(H, h)); a.poly(ngon(x, cy, r, r, 6, PI / 6), 'EQUIP'); }
  } else {
    const rg = v.rings, Rh = W * 0.98 / ((2 * rg + 1) * m.sqrt(3));
    for (let q = -rg; q <= rg; q++) for (let r = -rg; r <= rg; r++) {
      if (m.abs(q + r) > rg) continue;
      const x = cx + Rh * m.sqrt(3) * (q + r / 2), y = cy + Rh * 1.5 * r, dist = (m.abs(q) + m.abs(r) + m.abs(q + r)) / 2 / m.max(1, rg), h = H * m.min(1, 0.5 + 0.38 * (1 - dist) + R() * 0.12 + (R() < 0.15 ? 0.1 : 0));
      a.prism(ngon(x, y, Rh * 0.93, Rh * 0.93, 6, PI / 6), Z0, Z0 + h); a.poly(ngon(x, y, Rh * 0.93, Rh * 0.93, 6, PI / 6), 'EQUIP');
    }
  }
  a.log('Added ' + (v.row ? v.row : '') + ' tightly packed hexagonal basalt columns of different heights with flat tops (plan and 3D).');
}
const basalts = fam({ cat: 'nature/rocks', title: 'Generic basalt column cluster', desc: (v) => v.row ? `Row of ${v.row} hexagonal basalt columns stepping up to a crest, ${v.hf} ft high.` : `Cluster of hexagonal basalt columns in ${v.rings} rings, up to ${v.hf} ft high, packed edge to edge with flat tops.`, build: basalt, vs: [
  ['7 columns, 4 ft', 60, 52, 48, 0, { seed: 1, rings: 1, hf: 4 }], ['19 columns, 8 ft', 108, 100, 96, 0, { seed: 2, rings: 2, hf: 8 }], ['37 columns, 12 ft', 168, 150, 144, 0, { seed: 3, rings: 3, hf: 12 }], ['stepped row of 10, 5 ft', 140, 14, 60, 0, { seed: 4, row: 10, hf: 5 }] ] });

/** A mesa or butte: a flat-topped hill with stepped terraces and steep sides. */
function mesa(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), ph = [R() * 6, R() * 6], st = v.steps;
  const f = (x, y) => { const u = (x - cx) / (W / 2), t = (y - cy) / (D / 2), th = m.atan2(t, u), r = m.sqrt(u * u + t * t) * (1 + 0.08 * m.sin(3 * th + ph[0]) + 0.05 * m.sin(7 * th + ph[1])); if (r > 1) return Z0 + 2; const s = (1 - r) * 3.2 * (v.steep || 1); const lv = m.min(st, m.floor(s * st / 1.2)); const apron = m.max(0, 1 - r) * H * 0.05; return Z0 + H * (lv / st) * 0.94 + apron + (lv >= st ? H * 0.04 + H * 0.004 * m.sin(x * 0.05 + y * 0.04) : 0); };
  field(a, X0, X1, YF, YB, 48, 36, f, Z0);
  for (let i = 0; i < 8; i++) { const th = R() * 6.28, x = cx + m.cos(th) * W * 0.46, y = cy + m.sin(th) * D * 0.46, s = 0.025 + R() * 0.02; lump(a, x, y, Z0 + H * s, W * s, W * s, H * s * 1.5, v.seed + i, 0.25, 8, 5, Z0); }
  for (let k = 1; k <= st; k++) a.poly(blobPoly(cx, cy, W * 0.48 * (1 - 0.22 * k / st * 1.4) * 0.96, D * 0.48 * (1 - 0.22 * k / st * 1.4) * 0.96, v.seed + k, 28, 0.06), k === 1 ? 'EQUIP' : 'EQUIP-DETAIL');
  a.log('Added the flat-topped hill with ' + st + ' stepped ledges, steep sides, a rubble apron and fallen blocks at the foot (plan and 3D).');
}
const mesas = fam({ cat: 'nature/rocks', title: 'Generic mesa butte', desc: (v) => `Mesa butte, ${v.hf} ft high: flat top, ${v.steps} stepped ledges, steep eroded sides and fallen blocks at the foot.`, build: mesa, vs: [
  ['10 ft butte, 3 ledges', 240, 200, 120, 0, { seed: 1, steps: 3, hf: 10 }], ['25 ft mesa, 4 ledges', 600, 420, 300, 0, { seed: 2, steps: 4, hf: 25, steep: 1.1 }], ['40 ft mesa, 5 ledges', 1000, 620, 480, 0, { seed: 3, steps: 5, hf: 40, steep: 1.2 }] ] });

/** A crystal cluster: tilted hexagonal prisms with pointed tips growing from a rock base. */
function crystals(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), n = v.n;
  lump(a, cx, cy, Z0 + H * 0.1, W * 0.46, D * 0.46, H * 0.16, v.seed, 0.2, 14, 6, Z0);
  for (let i = 0; i < n; i++) {
    const f = i / n, th = f * 6.28 * 2.3 + R(), rr = (i === 0 ? 0 : 0.12 + 0.28 * m.sqrt(R())), x = cx + m.cos(th) * W * rr, y = cy + m.sin(th) * D * rr, h = H * (i === 0 ? 0.95 : 0.4 + 0.5 * R() * (1 - rr)), tilt = (i === 0 ? 0.04 : 0.22) * W * 0.5 * (0.6 + R()), r = W * (0.05 + R() * 0.025) * (i === 0 ? 1.3 : 1), ax = m.cos(th) * tilt, ay = m.sin(th) * tilt;
    a.tube([[x, y, Z0 + H * 0.12], [x + ax * 0.8, y + ay * 0.8, Z0 + H * 0.12 + h * 0.72], [x + ax, y + ay, Z0 + H * 0.12 + h]], [r, r, r * 0.04], 6);
    a.circ(x, y, r, 'EQUIP-DETAIL');
  }
  a.poly(blobPoly(cx, cy, W * 0.46, D * 0.46, v.seed, 20, 0.12), 'EQUIP');
  a.log('Added the rock base and ' + n + ' hexagonal crystal prisms of different heights, tilted outwards and tapering to pointed tips (plan and 3D).');
}
const crystalF = fam({ cat: 'nature/rocks', title: 'Generic crystal cluster', desc: (v) => `Crystal cluster on a rock base, ${v.hf} in high: ${v.n} hexagonal prisms of different heights and tilts with pointed tips.`, build: crystals, vs: [
  ['5 crystals, 14 in', 16, 16, 14, 0, { seed: 1, n: 5, hf: 14 }], ['9 crystals, 30 in', 34, 32, 30, 0, { seed: 2, n: 9, hf: 30 }], ['15 crystals, 60 in', 66, 60, 60, 0, { seed: 3, n: 15, hf: 60 }] ] });

/** A grassy knoll: a smooth rounded hill with a few rocks and a worn path. */
function knoll(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), ph = R() * 6;
  const f = (x, y) => { const u = (x - cx) / (W / 2), t = (y - cy) / (D / 2), r2 = u * u + t * t; return Z0 + H * m.exp(-r2 * 2.6) * (1 + 0.06 * m.sin(u * 5 + ph) * m.cos(t * 4 + ph)) * (1 - 0.15 * u); };
  field(a, X0, X1, YF, YB, 36, 28, f, Z0);
  for (let i = 0; i < v.rocks; i++) { const x = cx + (R() - 0.5) * W * 0.6, y = cy + (R() - 0.5) * D * 0.6, s = 0.03 + R() * 0.03; lump(a, x, y, f(x, y) + H * 0.01, W * s, W * s * 0.9, H * s * 2.2, v.seed + i, 0.25, 8, 5, f(x, y) - 8); a.circ(x, y, W * s, 'EQUIP-DETAIL'); }
  a.poly(blobPoly(cx, cy, W * 0.5, D * 0.5, v.seed, 30, 0.05), 'EQUIP'); for (const k of [0.25, 0.5, 0.75]) a.poly(blobPoly(cx, cy, W * 0.5 * k, D * 0.5 * k, v.seed + 1, 22, 0.05), 'EQUIP-DETAIL');
  a.log('Added the smooth rounded hill with gentle undulation, contour rings on the plan and ' + v.rocks + ' rocks showing through the turf (plan and 3D).');
}
const knolls = fam({ cat: 'nature/rocks', title: 'Generic grassy knoll', desc: (v) => `Grassy knoll, ${v.hf} ft high: a smooth rounded hill with gentle undulation and ${v.rocks} rocks showing through the turf.`, build: knoll, vs: [
  ['3 ft high, 12 ft wide', 144, 120, 36, 0, { seed: 1, rocks: 3, hf: 3 }], ['6 ft high, 24 ft wide', 288, 240, 72, 0, { seed: 2, rocks: 6, hf: 6 }], ['10 ft high, 40 ft wide', 480, 400, 120, 0, { seed: 3, rocks: 9, hf: 10 }] ] });

/** A balanced stone stack: round stones, each smaller than the one below, offset a little. */
function zen(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), n = v.n;
  let z = Z0; const hs = Array.from({ length: n }, (_, i) => 1 - i * (0.62 / n)), tot = hs.reduce((s, h) => s + h * 0.7, 0), k = H / (tot + 0.25);
  lump(a, cx, cy, Z0 + 6, W * 0.46, D * 0.46, 14, v.seed, 0.1, 12, 4, Z0);
  for (let i = 0; i < n; i++) { const r = hs[i] * 0.45, th = hs[i] * k * 0.35; lump(a, cx + (R() - 0.5) * W * 0.06, cy + (R() - 0.5) * D * 0.06, z + th, W * r, D * r, th * 0.98, v.seed + i * 3, 0.1, 14, 7, z + 1); a.poly(blobPoly(cx, cy, W * r, D * r, v.seed + i, 14, 0.08), i === 0 ? 'EQUIP' : 'EQUIP-DETAIL'); z += th * 1.75 * 0.7 * 0.97; }
  a.log('Added a low base stone and ' + n + ' rounded stones balanced one on another, each smaller than the one below (plan and 3D).');
}
const zens = fam({ cat: 'nature/rocks', title: 'Generic balanced stone stack', desc: (v) => `Balanced stack of ${v.n} rounded stones on a low base stone, each smaller than the one below, ${v.hf} in high.`, build: zen, vs: [
  ['3 stones, 12 in', 12, 12, 12, 0, { seed: 1, n: 3, hf: 12 }], ['4 stones, 20 in', 18, 18, 20, 0, { seed: 2, n: 4, hf: 20 }], ['5 stones, 36 in', 28, 28, 36, 0, { seed: 3, n: 5, hf: 36 }], ['7 stones, 60 in', 40, 40, 60, 0, { seed: 4, n: 7, hf: 60 }] ] });

// ------------------------------------------------------------------------------------------ trees
/** Weeping willow: a leaning forked trunk, a domed crown and many hanging strands. */
function willow(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), cr = W * 0.3, zm = Z0 + H * 0.68;
  trunk(a, cx, cy, Z0, Z0 + H * 0.44, W * 0.04, W * 0.026, [W * 0.025, 0], 12);
  for (let i = 0; i < 4; i++) { const th = i * 1.6 + 0.5; a.tube([[cx + W * 0.01, cy, Z0 + H * 0.36], [cx + m.cos(th) * cr * 0.6, cy + m.sin(th) * cr * 0.6, zm - H * 0.04], [cx + m.cos(th) * cr * 1.0, cy + m.sin(th) * cr * 1.0, zm + H * 0.08]], [W * 0.016, W * 0.011, W * 0.005], 6); }
  for (let i = 0; i < v.blobs; i++) { const th = i / v.blobs * 6.28 + R(), f = i === 0 ? 0 : 0.3 + 0.6 * R(); lump(a, cx + m.cos(th) * cr * f, cy + m.sin(th) * cr * f, zm + H * (0.12 - f * 0.1) + (R() - 0.5) * H * 0.04, cr * 0.5, cr * 0.5, H * 0.11, v.seed + i, 0.15, 12, 6, zm - H * 0.1); }
  for (let i = 0; i < v.strands; i++) { const th = i / v.strands * 6.28 + R() * 0.3, r0 = cr * (0.55 + R() * 0.55), r1 = r0 + W * 0.08 + R() * W * 0.06, zt = zm + H * 0.01 - r0 * 0.1, zb = Z0 + H * (0.05 + R() * 0.2); a.tube([[cx + m.cos(th) * r0, cy + m.sin(th) * r0, zt], [cx + m.cos(th) * (r0 + r1) / 2, cy + m.sin(th) * (r0 + r1) / 2, (zt + zb) / 2 + H * 0.04], [cx + m.cos(th) * r1, cy + m.sin(th) * r1, zb]], [W * 0.007, W * 0.007, W * 0.002], 4); }
  a.poly(blobPoly(cx, cy, W * 0.46, W * 0.46, v.seed, 28, 0.1), 'EQUIP'); a.poly(blobPoly(cx, cy, cr, cr, v.seed + 2, 20, 0.12), 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.04, 'EQUIP-DETAIL');
  a.log('Added the leaning trunk with four crown limbs, a domed crown of ' + v.blobs + ' leaf masses and ' + v.strands + ' hanging strands that reach nearly to the ground (plan and 3D).');
}
const willows = fam({ cat: 'nature/trees', title: 'Generic weeping willow', desc: (v) => `Weeping willow, ${v.hf} ft: leaning trunk, four crown limbs, a domed crown and ${v.strands} long hanging strands.`, build: willow, vs: [
  ['15 ft', 156, 156, 180, 0, { seed: 1, hf: 15, blobs: 5, strands: 28 }], ['25 ft', 264, 264, 300, 0, { seed: 2, hf: 25, blobs: 6, strands: 36 }], ['40 ft', 420, 420, 480, 0, { seed: 3, hf: 40, blobs: 7, strands: 44 }], ['30 ft, lakeside spreading', 440, 440, 360, 0, { seed: 4, hf: 30, blobs: 8, strands: 48 }] ] });

/** Birch: slender pale stems with dark bands, thin branches and a light airy crown. */
function birch(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed);
  for (let s = 0; s < v.stems; s++) {
    const th = s / v.stems * 6.28 + 0.4, off = v.stems > 1 ? W * 0.07 : 0, lean = v.stems > 1 ? W * 0.14 : W * 0.02, bx = cx + m.cos(th) * off, by = cy + m.sin(th) * off, tx = bx + m.cos(th) * lean, ty = by + m.sin(th) * lean, zt = Z0 + H * (0.86 - s * 0.05), tw = W * 0.016;
    a.tube([[bx, by, Z0], [bx + m.cos(th) * lean * 0.2, by + m.sin(th) * lean * 0.2, Z0 + H * 0.3], [tx, ty, zt]], [tw * 1.4, tw, tw * 0.4], 8);
    for (let k = 1; k < 9; k++) { const f = k * 0.095 + R() * 0.03, z = Z0 + (zt - Z0) * f; a.cyl(bx + (tx - bx) * f * f * 0.9, by + (ty - by) * f * f * 0.9, z, z + 7 + R() * 8, tw * (1.1 - f * 0.5) + 1.8, 8); }
    for (let k = 0; k < 4; k++) { const f = 0.45 + k * 0.12, z = Z0 + (zt - Z0) * f, ph = th + k * 2.3; a.tube([[bx + (tx - bx) * f * f, by + (ty - by) * f * f, z], [bx + (tx - bx) * f * f + m.cos(ph) * W * 0.12, by + (ty - by) * f * f + m.sin(ph) * W * 0.12, z + H * 0.07]], [tw * 0.4, tw * 0.15], 4); }
    for (let k = 0; k < v.blobs; k++) { const ph = th + k * 2.4 + R(), f = 0.62 + 0.28 * (k / v.blobs), z = Z0 + (zt - Z0) * f + H * 0.04, rr = W * (0.12 + R() * 0.05); lump(a, bx + (tx - bx) * f * f + m.cos(ph) * W * 0.12 * (1 - f * 0.4), by + (ty - by) * f * f + m.sin(ph) * W * 0.12 * (1 - f * 0.4), z, rr, rr, rr * 0.95, v.seed + k + s * 9, 0.2, 10, 6, Z0 + H * 0.38); }
    a.circ(bx, by, tw * 1.4, 'EQUIP-DETAIL');
  }
  a.poly(blobPoly(cx, cy, W * 0.42, W * 0.42, v.seed, 24, 0.14), 'EQUIP'); a.poly(blobPoly(cx, cy, W * 0.25, W * 0.25, v.seed + 3, 16, 0.14), 'EQUIP-DETAIL');
  a.log('Added ' + v.stems + ' slender stem' + (v.stems > 1 ? 's' : '') + ' with dark bark bands, thin side branches and a light crown of leaf masses (plan and 3D).');
}
const birches = fam({ cat: 'nature/trees', title: 'Generic birch tree', desc: (v) => `Birch, ${v.hf} ft: ${v.stems === 1 ? 'a slender pale stem' : v.stems + ' leaning pale stems'} with dark bark bands, thin side branches and a light airy crown.`, build: birch, vs: [
  ['20 ft, single stem', 144, 144, 240, 0, { seed: 1, stems: 1, blobs: 5, hf: 20 }], ['30 ft, single stem', 204, 204, 360, 0, { seed: 2, stems: 1, blobs: 7, hf: 30 }], ['25 ft, three-stem clump', 252, 252, 300, 0, { seed: 3, stems: 3, blobs: 4, hf: 25 }] ] });

/** Umbrella pine: a bare curved trunk with a broad flat layered canopy. */
function umbrella(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), zt = Z0 + H * 0.66, cr = W * 0.46;
  trunk(a, cx, cy, Z0, zt, W * 0.03, W * 0.022, [W * 0.04, W * 0.01], 12);
  for (let i = 0; i < 5; i++) { const th = i / 5 * 6.28 + 0.3, reach = cr * (0.5 + R() * 0.3); a.tube([[cx + W * 0.04, cy + W * 0.01, zt - H * 0.1], [cx + m.cos(th) * reach * 0.5, cy + m.sin(th) * reach * 0.5, zt + H * 0.02], [cx + m.cos(th) * reach, cy + m.sin(th) * reach, zt + H * 0.1]], [W * 0.014, W * 0.009, W * 0.005], 6); }
  const layers = [[0, 0.14, 0.6], [0.09, 0.09, 0.92], [0.17, 0.05, 1]];
  for (const [dz, th, sc] of layers) for (let i = 0; i < 6; i++) { const ang = i / 6 * 6.28 + dz * 9, f = i === 0 ? 0 : 0.55; lump(a, cx + W * 0.04 + m.cos(ang) * cr * f * sc, cy + m.sin(ang) * cr * f * sc, zt + H * (0.1 + dz), cr * 0.42 * (sc * 0.6 + 0.5), cr * 0.42 * (sc * 0.6 + 0.5), H * th * 0.55, v.seed + i + dz * 20, 0.14, 12, 5, zt + H * (0.07 + dz)); }
  a.poly(blobPoly(cx + W * 0.04, cy, cr, cr * 0.96, v.seed, 28, 0.08), 'EQUIP'); a.poly(blobPoly(cx + W * 0.04, cy, cr * 0.6, cr * 0.6, v.seed + 3, 20, 0.1), 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.03, 'EQUIP-DETAIL');
  a.log('Added the bare curved trunk, five spreading limbs and a broad flat canopy built from three layers of leaf masses (plan and 3D).');
}
const umbrellas = fam({ cat: 'nature/trees', title: 'Generic umbrella pine', desc: (v) => `Umbrella pine, ${v.hf} ft: a tall bare curved trunk with five spreading limbs under a broad flat canopy.`, build: umbrella, vs: [
  ['20 ft', 168, 168, 240, 0, { seed: 1, hf: 20 }], ['35 ft', 288, 288, 420, 0, { seed: 2, hf: 35 }], ['50 ft', 400, 400, 600, 0, { seed: 3, hf: 50 }] ] });

/** Columnar cypress: a slender dense spindle of foliage. */
function cypress(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), n = v.n;
  a.tube([[cx, cy, Z0], [cx, cy, Z0 + H * 0.14]], [W * 0.05, W * 0.035], 8);
  for (let i = 0; i < n; i++) { const f = i / (n - 1), r = W * 0.46 * m.pow(m.sin(PI * (0.17 + 0.8 * f)), 0.8), hh = H * 0.8 / n, zc = Z0 + H * 0.12 + (H * 0.86 - hh * 1.25) * f; lump(a, cx + (R() - 0.5) * W * 0.02, cy, zc + hh * 0.2, r, r, hh * 1.05, v.seed + i, 0.1, 14, 6, Z0 + H * 0.08); }
  a.cone(cx, cy, Z1 - H * 0.07, Z1, W * 0.03, 0.5, 6);
  a.circ(cx, cy, W * 0.46, 'EQUIP'); a.circ(cx, cy, W * 0.3, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.05, 'EQUIP-DETAIL');
  a.log('Added the short trunk and a slender spindle of ' + n + ' stacked foliage masses tapering to a pointed top (plan and 3D).');
}
const cypresses = fam({ cat: 'nature/trees', title: 'Generic columnar cypress', desc: (v) => `Columnar cypress, ${v.hf} ft: a slender dense spindle of foliage on a short trunk, tapering to a point.`, build: cypress, vs: [
  ['12 ft, slim', 36, 36, 144, 0, { seed: 1, n: 6, hf: 12 }], ['25 ft', 60, 60, 300, 0, { seed: 2, n: 8, hf: 25 }], ['40 ft, tall', 84, 84, 480, 0, { seed: 3, n: 10, hf: 40 }] ] });

/** Bamboo clump: jointed culms leaning outwards with leaf tufts near the tops. */
function bamboo(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), n = v.n;
  a.cyl(cx, cy, Z0, Z0 + 6, W * 0.4, 18);
  for (let i = 0; i < n; i++) {
    const th = R() * 6.28, rr = m.sqrt(R()) * W * 0.18, bx = cx + m.cos(th) * rr, by = cy + m.sin(th) * rr, h = H * (0.7 + R() * 0.3), lean = W * (0.1 + R() * 0.2), lx = m.cos(th) * lean, ly = m.sin(th) * lean, tw = W * 0.011;
    const at = (f) => [bx + lx * f * f, by + ly * f * f, Z0 + 6 + (h - 6) * f];
    a.tube([at(0), at(0.35), at(0.7), at(1)], [tw * 1.2, tw, tw * 0.75, tw * 0.4], 6);
    const nn = 9; for (let k = 1; k < nn; k++) { const p = at(k / nn); a.cyl(p[0], p[1], p[2] - 3, p[2] + 3, tw * (1.15 - k / nn * 0.5) + 1, 6); if (k / nn > 0.55) for (const s of [-1, 1]) { const q = [p[0] + m.cos(th + s * 1.4) * W * 0.09, p[1] + m.sin(th + s * 1.4) * W * 0.09, p[2] - H * 0.03]; a.tube([p, q], [tw * 0.5, tw * 0.05], 4); } }
    a.circ(bx, by, tw * 1.2, 'EQUIP-DETAIL');
  }
  a.circ(cx, cy, W * 0.4, 'EQUIP'); a.circ(cx, cy, W * 0.22, 'EQUIP-DETAIL');
  a.log('Added a mulch pad and ' + n + ' jointed culms with node rings, leaning outwards, with paired leaf blades near the tops (plan and 3D).');
}
const bamboos = fam({ cat: 'nature/trees', title: 'Generic bamboo clump', desc: (v) => `Bamboo clump, ${v.hf} ft: ${v.n} jointed culms with node rings leaning outwards and paired leaf blades near the tops.`, build: bamboo, vs: [
  ['10 ft, 8 culms', 60, 60, 120, 0, { seed: 1, n: 8, hf: 10 }], ['20 ft, 14 culms', 96, 96, 240, 0, { seed: 2, n: 14, hf: 20 }], ['30 ft, 20 culms', 132, 132, 360, 0, { seed: 3, n: 20, hf: 30 }] ] });

/** Fruit tree: a short forked trunk, a spreading crown and fruit. */
function fruitTree(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), cr = W * 0.46, zm = Z0 + H * 0.66;
  trunk(a, cx, cy, Z0, Z0 + H * 0.4, W * 0.045, W * 0.035, [W * 0.02, 0], 12);
  for (let i = 0; i < 5; i++) { const th = i * 1.3 + 0.4; a.tube([[cx, cy, Z0 + H * 0.34], [cx + m.cos(th) * cr * 0.5, cy + m.sin(th) * cr * 0.5, zm - H * 0.05], [cx + m.cos(th) * cr * 0.85, cy + m.sin(th) * cr * 0.85, zm + H * 0.06]], [W * 0.02, W * 0.013, W * 0.006], 6); }
  for (let i = 0; i < 7; i++) { const th = i / 7 * 6.28 + R(), f = i === 0 ? 0 : 0.5 + 0.35 * R(); lump(a, cx + m.cos(th) * cr * f * 0.8, cy + m.sin(th) * cr * f * 0.8, zm + H * (0.08 - f * 0.05) + (R() - 0.5) * H * 0.05, cr * 0.46, cr * 0.46, H * 0.15, v.seed + i, 0.15, 12, 6, Z0 + H * 0.4); }
  for (let i = 0; i < v.fruit; i++) { const th = R() * 6.28, f = 0.5 + R() * 0.5; a.ell(cx + m.cos(th) * cr * f * 0.95, cy + m.sin(th) * cr * f * 0.95, zm + H * 0.02 - H * 0.08 * R(), W * 0.017, W * 0.017, W * 0.017, 6, 4); }
  a.poly(blobPoly(cx, cy, cr, cr, v.seed, 26, 0.1), 'EQUIP'); a.poly(blobPoly(cx, cy, cr * 0.65, cr * 0.65, v.seed + 3, 18, 0.12), 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.045, 'EQUIP-DETAIL');
  a.log('Added the short trunk with five crown limbs, a spreading crown of seven leaf masses and ' + v.fruit + ' fruits hanging in it (plan and 3D).');
}
const fruitTrees = fam({ cat: 'nature/trees', title: 'Generic fruit tree', desc: (v) => `Orchard fruit tree, ${v.hf} ft: short forked trunk, five crown limbs, a spreading crown and ${v.fruit} fruits.`, build: fruitTree, vs: [
  ['8 ft, young', 84, 84, 96, 0, { seed: 1, hf: 8, fruit: 10 }], ['12 ft', 132, 132, 144, 0, { seed: 2, hf: 12, fruit: 16 }], ['16 ft, mature', 180, 180, 192, 0, { seed: 3, hf: 16, fruit: 22 }] ] });

/** Saguaro-style cactus: a ribbed column with upturned arms. */
function saguaro(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), r = W * (v.arms ? 0.085 : 0.3), top = Z1 - r * 0.2;
  a.tube([[cx, cy, Z0], [cx, cy, Z0 + H * 0.05], [cx, cy, Z0 + H * 0.5], [cx, cy, top]], [r * 1.1, r, r, r * 0.9], 12); a.ell(cx, cy, top, r * 0.9, r * 0.9, r * 0.8, 12, 6);
  for (let i = 0; i < 8; i++) { const th = i / 8 * 6.28; a.cyl(cx + m.cos(th) * r * 0.98, cy + m.sin(th) * r * 0.98, Z0 + H * 0.05, top - r * 0.4, 3, 4); }
  const arms = [[-1, 0.45, 0.26], [1, 0.58, 0.22], [-1, 0.72, 0.14], [1, 0.34, 0.12]].slice(0, v.arms);
  arms.forEach(([s, f, up], i) => { const za = Z0 + H * f, y = cy + (i % 2 ? 1 : -1) * D * 0.06, rx = W * 0.36 * (1 - i * 0.12); a.tube([[cx + s * r * 0.7, cy, za], [cx + s * (r + rx * 0.5), y, za + r * 0.4], [cx + s * rx, y, za + r * 1.2], [cx + s * rx, y, za + H * up]], [r * 0.7, r * 0.62, r * 0.6, r * 0.55], 10); a.ell(cx + s * rx, y, za + H * up, r * 0.55, r * 0.55, r * 0.5, 10, 6); a.circ(cx + s * rx, y, r * 0.6, 'EQUIP-DETAIL'); });
  a.circ(cx, cy, r * 1.1, 'EQUIP'); a.circ(cx, cy, r * 0.5, 'EQUIP-DETAIL');
  a.log('Added the ribbed column with a rounded crown' + (v.arms ? ' and ' + v.arms + ' upturned arms that leave the trunk at different heights' : '') + ' (plan and 3D).');
}
const saguaros = fam({ cat: 'nature/trees', title: 'Generic columnar cactus', desc: (v) => `Columnar desert cactus, ${v.hf} ft: ribbed trunk with a rounded crown${v.arms ? ' and ' + v.arms + ' upturned arms' : ''}.`, build: saguaro, vs: [
  ['no arms, 5 ft', 14, 14, 60, 0, { seed: 1, arms: 0, hf: 5 }], ['two arms, 14 ft', 60, 30, 168, 0, { seed: 2, arms: 2, hf: 14 }], ['four arms, 24 ft', 100, 44, 288, 0, { seed: 3, arms: 4, hf: 24 }] ] });

/** Barrel cactus: a ribbed ball, alone or in a group, with a ring of flowers. */
function barrel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed);
  const one = (x, y, r, h) => {
    a.cyl(x, y, Z0, Z0 + 6, r * 1.15, 18);
    const fr = [0, 0.12, 0.3, 0.55, 0.78, 0.94, 1], rp = (f) => r * m.pow(m.sin(PI * (0.07 + 0.86 * f)), 0.55) * 0.95;
    a.tube(fr.map((f) => [x, y, Z0 + 6 + (h - 6) * f * 0.97]), fr.map((f) => rp(f) * 0.92), 18);
    for (let k = 0; k < 12; k++) { const th = k / 12 * 6.28; a.tube(fr.map((f) => [x + m.cos(th) * rp(f) * 0.98, y + m.sin(th) * rp(f) * 0.98, Z0 + 6 + (h - 6) * f * 0.97]), fr.map((f) => r * 0.05 * (0.3 + m.sin(PI * f))), 4); }
    for (let k = 0; k < 6; k++) { const th = k / 6 * 6.28 + 0.2; a.ell(x + m.cos(th) * r * 0.35, y + m.sin(th) * r * 0.35, Z0 + h * 0.97, r * 0.12, r * 0.12, r * 0.1, 6, 4); }
    a.circ(x, y, r, 'EQUIP'); a.circ(x, y, r * 0.3, 'EQUIP-DETAIL'); for (let k = 0; k < 6; k++) a.line(x, y, x + m.cos(k * 1.047) * r, y + m.sin(k * 1.047) * r, 'EQUIP-DETAIL');
  };
  if (v.n === 1) one(cx, cy, W * 0.46, H); else { const r = W * 0.26; one(cx, cy - D * 0.2, r * 1.15, H); one(cx - W * 0.22, cy + D * 0.2, r * 0.9, H * 0.76); one(cx + W * 0.22, cy + D * 0.2, r * 0.8, H * 0.68); }
  a.log('Added ' + (v.n === 1 ? 'a ribbed ball with twelve ribs' : 'a group of three ribbed balls of different sizes') + ', a ring of flowers on top and a stone collar at the foot (plan and 3D).');
}
const barrels = fam({ cat: 'nature/trees', title: 'Generic barrel cactus', desc: (v) => `Barrel cactus ${v.n === 1 ? '' : 'group '}, ${v.sz}: ribbed ball${v.n === 1 ? '' : 's of different sizes'} with a ring of flowers on top.`, build: barrel, vs: [
  ['single, 12 in', 12, 12, 13, 0, { seed: 1, n: 1, sz: '12 in' }], ['single, 24 in', 24, 24, 26, 0, { seed: 2, n: 1, sz: '24 in' }], ['group of three, 30 in', 44, 40, 30, 0, { seed: 3, n: 3, sz: '30 in' }] ] });

/** Ornamental grass: an arching fountain of blades, with plumes on the tall form. */
function grass(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed);
  a.cyl(cx, cy, Z0, Z0 + 6, W * 0.2, 14);
  for (let i = 0; i < v.n; i++) {
    const th = R() * 6.28, h = H * (v.plume ? 0.5 : 0.7) * (0.75 + R() * 0.25), L = W * (0.3 + R() * 0.15), rr = R() * W * 0.04, x = cx + m.cos(th) * rr, y = cy + m.sin(th) * rr;
    a.tube([[x, y, Z0 + 2], [x + m.cos(th) * L * 0.2, y + m.sin(th) * L * 0.2, Z0 + h * 0.65], [x + m.cos(th) * L * 0.65, y + m.sin(th) * L * 0.65, Z0 + h * 0.9], [x + m.cos(th) * L, y + m.sin(th) * L, Z0 + h * 0.5]], [W * 0.006 + 1.5, W * 0.006 + 1, W * 0.004 + 1, 0.8], 3);
  }
  if (v.plume) for (let i = 0; i < v.plume; i++) { const th = i / v.plume * 6.28 + 0.4, L = W * 0.1, x = cx + m.cos(th) * L, y = cy + m.sin(th) * L; a.tube([[cx, cy, Z0 + 2], [x * 0.5 + cx * 0.5, y * 0.5 + cy * 0.5, Z0 + H * 0.5], [x, y, Z0 + H * 0.9]], [W * 0.008, W * 0.006, W * 0.004], 4); a.ell(x, y, Z0 + H * 0.88, W * 0.03, W * 0.03, H * 0.11, 8, 5); }
  a.circ(cx, cy, W * 0.46, 'EQUIP'); a.circ(cx, cy, W * 0.25, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.05, 'EQUIP-DETAIL');
  a.log('Added the crown of ' + v.n + ' arching blades' + (v.plume ? ' and ' + v.plume + ' tall flower stems topped with feathery plumes' : '') + ' (plan and 3D).');
}
const grasses = fam({ cat: 'nature/trees', title: 'Generic ornamental grass clump', desc: (v) => `Ornamental grass clump, ${v.hf}: a fountain of ${v.n} arching blades${v.plume ? ' with ' + v.plume + ' plumed flower stems' : ''}.`, build: grass, vs: [
  ['2 ft, fine blades', 30, 30, 24, 0, { seed: 1, n: 36, hf: '2 ft' }], ['3.5 ft, arching', 48, 48, 42, 0, { seed: 2, n: 44, hf: '3.5 ft' }], ['6 ft, plumed pampas type', 72, 72, 72, 0, { seed: 3, n: 56, plume: 7, hf: '6 ft' }] ] });

/** Topiary: a pot, a clipped stem and a trimmed form. v.kind ball | spiral | poodle */
function topiary(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pr = W * 0.34, ph = H * 0.2;
  a.tube([[cx, cy, Z0], [cx, cy, Z0 + ph * 0.85], [cx, cy, Z0 + ph]], [pr * 0.72, pr * 1.0, pr * 1.04], 18); a.cyl(cx, cy, Z0 + ph, Z0 + ph + 3, pr * 0.9, 16);
  const zb = Z0 + ph;
  if (v.kind === 'ball') { a.cyl(cx, cy, zb, zb + H * 0.4, W * 0.02, 8); const r = (H - ph - H * 0.2) / 2; a.ell(cx, cy, Z1 - r, W * 0.45, W * 0.45, r, 20, 10); a.circ(cx, cy, W * 0.45, 'EQUIP'); }
  if (v.kind === 'poodle') { a.cyl(cx, cy, zb, Z1 - W * 0.1, W * 0.02, 8); const rs = [0.34, 0.26, 0.18], hs = [0.38, 0.62, 0.84]; rs.forEach((r, i) => a.ell(cx, cy, zb + (H - ph) * hs[i], W * r, W * r, W * r * 0.95, 14, 8)); a.circ(cx, cy, W * 0.34, 'EQUIP'); a.circ(cx, cy, W * 0.18, 'EQUIP-DETAIL'); }
  if (v.kind === 'spiral') { const n = 7; a.cyl(cx, cy, zb, zb + (H - ph) * 0.4, W * 0.02, 8); for (let i = 0; i < n; i++) { const f = i / n, z = zb + (H - ph) * (0.14 + 0.84 * f * 0.98), r = W * 0.45 * (1 - f * 0.88) + 2, h = (H - ph) * 0.2; a.cone(cx + m.cos(f * 12) * r * 0.1, cy + m.sin(f * 12) * r * 0.1, z - h * 0.2, z + h * 0.8, r, r * 0.55, 14); } a.circ(cx, cy, W * 0.45, 'EQUIP'); for (let k = 1; k < 4; k++) a.circ(cx, cy, W * 0.45 * k / 4, 'EQUIP-DETAIL'); }
  a.circ(cx, cy, pr, 'EQUIP-DETAIL');
  a.log('Added the tapered pot with soil, a clipped bare stem and ' + (v.kind === 'ball' ? 'a clipped ball' : v.kind === 'poodle' ? 'three clipped balls of falling size' : 'a spiral of seven stacked cones') + ' (plan and 3D).');
}
const topiaries = fam({ cat: 'nature/trees', title: 'Generic potted topiary', desc: (v) => `Potted topiary, ${v.hf} ft: tapered pot, clipped bare stem and ${v.kind === 'ball' ? 'a trimmed ball' : v.kind === 'poodle' ? 'three trimmed balls of falling size' : 'a spiral of stacked cones'}.`, build: topiary, vs: [
  ['ball on stem, 3 ft', 20, 20, 36, 0, { kind: 'ball', hf: 3 }], ['three-ball stack, 5 ft', 24, 24, 60, 0, { kind: 'poodle', hf: 5 }], ['spiral cone, 6 ft', 32, 32, 72, 0, { kind: 'spiral', hf: 6 }] ] });

/** A dead tree (snag): a bare weathered trunk with a broken top, branch stubs and bracket fungi. */
function snag(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), r = W * 0.09;
  a.tube([[cx, cy, Z0], [cx, cy, Z0 + H * 0.06], [cx + W * 0.01, cy, Z0 + H * 0.5], [cx + W * 0.03, cy, Z0 + H * 0.82], [cx + W * 0.02, cy, Z1 - 4]], [r * 1.7, r * 1.15, r * 0.9, r * 0.62, r * 0.3], 12);
  for (let i = 0; i < 5; i++) { const th = i / 5 * 6.28 + 0.4; a.tube([[cx, cy, Z0 + H * 0.04], [cx + m.cos(th) * r * 1.8, cy + m.sin(th) * r * 1.8, Z0 + 4]], [r * 0.6, r * 0.25], 6); }
  for (let i = 0; i < v.stubs; i++) { const f = 0.3 + 0.55 * i / v.stubs, th = i * 2.4 + 0.5, z = Z0 + H * f, L = W * (0.16 - f * 0.06) * (0.7 + R() * 0.6), x = cx + W * 0.03 * f; a.tube([[x, cy, z], [x + m.cos(th) * L * 0.6, cy + m.sin(th) * L * 0.6, z + L * 0.25], [x + m.cos(th) * L, cy + m.sin(th) * L, z + L * 0.55]], [r * 0.4, r * 0.28, r * 0.16], 6); }
  for (let i = 0; i < 8; i++) { const th = i / 8 * 6.28, f = 0.25 + R() * 0.45; a.box(cx + m.cos(th) * r * (1.1 - f * 0.2) - 4, cy + m.sin(th) * r * (1.1 - f * 0.2) - 4, Z0 + H * f * 0.95, cx + m.cos(th) * r * (1.15 - f * 0.2) + 4, cy + m.sin(th) * r * (1.15 - f * 0.2) + 4, Z0 + H * f * 0.95 + H * 0.12); }
  for (let i = 0; i < 2; i++) { const th = 0.9 + i * 3.1, z = Z0 + H * (0.3 + i * 0.15); a.ell(cx + m.cos(th) * r * 1.05, cy + m.sin(th) * r * 1.05, z, r * 0.55, r * 0.55, r * 0.14, 8, 4); }
  a.circ(cx, cy, r * 1.7, 'EQUIP'); a.circ(cx, cy, r * 0.9, 'EQUIP-DETAIL');
  a.log('Added the weathered trunk with a root flare and a broken top, ' + v.stubs + ' branch stubs, bark ridges and two bracket fungi (plan and 3D).');
}
const snags = fam({ cat: 'nature/trees', title: 'Generic dead tree snag', desc: (v) => `Standing dead tree, ${v.hf} ft: weathered trunk with a broken top, ${v.stubs} branch stubs, bark ridges and bracket fungi.`, build: snag, vs: [
  ['15 ft', 84, 36, 180, 0, { seed: 1, stubs: 4, hf: 15 }], ['25 ft', 120, 52, 300, 0, { seed: 2, stubs: 6, hf: 25 }], ['40 ft', 168, 72, 480, 0, { seed: 3, stubs: 8, hf: 40 }] ] });

/** Tree fern: a shaggy trunk with ring scars and a crown of arching fronds. */
function treeFern(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), zt = Z1 - H * 0.12, r = W * 0.05;
  a.tube([[cx, cy, Z0], [cx, cy, Z0 + H * 0.06], [cx + W * 0.012, cy, Z0 + H * 0.5], [cx + W * 0.02, cy, zt]], [r * 1.5, r * 1.1, r, r * 0.85], 12);
  for (let i = 1; i < 14; i++) { const z = Z0 + (zt - Z0) * i / 14; a.cyl(cx + W * 0.02 * (i / 14) * (i / 14), cy, z - 4, z + 4, r * 1.08 + 3, 12); }
  for (let i = 0; i < 24; i++) { const th = R() * 6.28, z = Z0 + (zt - Z0) * R() * 0.9, f = z / (zt - Z0); a.tube([[cx + m.cos(th) * r, cy + m.sin(th) * r, z], [cx + m.cos(th) * r * 1.9, cy + m.sin(th) * r * 1.9, z - 12]], [3, 1], 3); }
  const tx = cx + W * 0.02, n = v.fronds;
  for (let i = 0; i < n; i++) { const th = i / n * 6.28 + R() * 0.4, L = W * (0.38 + R() * 0.08), dz = H * 0.1 * (0.8 + R() * 0.4), up = H * 0.07; const c = [[tx, cy, zt], [tx + m.cos(th) * L * 0.4, cy + m.sin(th) * L * 0.4, zt + up], [tx + m.cos(th) * L * 0.75, cy + m.sin(th) * L * 0.75, zt + up * 0.7], [tx + m.cos(th) * L, cy + m.sin(th) * L, zt - dz]]; a.tube(c, [W * 0.008, W * 0.006, W * 0.004, W * 0.002], 5); a.tube([c[1], [(c[1][0] + c[2][0]) / 2, (c[1][1] + c[2][1]) / 2, (c[1][2] + c[2][2]) / 2 - H * 0.025], c[2], c[3]], [W * 0.012, W * 0.03, W * 0.024, W * 0.003], 6); }
  for (let i = 0; i < 4; i++) { const th = i * 1.6, rr = W * 0.025; a.ell(tx + m.cos(th) * rr, cy + m.sin(th) * rr, zt + H * 0.025, W * 0.018, W * 0.018, W * 0.03, 6, 4); }
  a.circ(cx, cy, r * 1.5, 'EQUIP-DETAIL'); a.circ(tx, cy, W * 0.5, 'EQUIP'); a.circ(tx, cy, W * 0.25, 'EQUIP-DETAIL'); for (let i = 0; i < n; i++) a.line(tx, cy, tx + m.cos(i / n * 6.28) * W * 0.46, cy + m.sin(i / n * 6.28) * W * 0.46, 'EQUIP-DETAIL');
  a.log('Added the fibrous trunk with ring scars and hairy roots, ' + n + ' arching fronds with broad feathery blades and the unfurling crown tips (plan and 3D).');
}
const treeFerns = fam({ cat: 'nature/trees', title: 'Generic tree fern', desc: (v) => `Tree fern, ${v.hf} ft: fibrous trunk with ring scars and ${v.fronds} arching feathery fronds around an unfurling crown.`, build: treeFern, vs: [
  ['6 ft', 84, 84, 72, 0, { seed: 1, fronds: 9, hf: 6 }], ['10 ft', 132, 132, 120, 0, { seed: 2, fronds: 11, hf: 10 }], ['16 ft', 180, 180, 192, 0, { seed: 3, fronds: 13, hf: 16 }] ] });

// ------------------------------------------------------------------------------------------ water
/** A hand pump over a stone trough. */
function handPump(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, th = H * 0.3, px = cx + (v.tl > 0.9 ? W * 0.3 : W * 0.12), py = YB - D * 0.3, ty1 = YF + D * 0.52;
  a.box(X0 + 2, YF + 2, Z0, X1 - 2, YB - 2, Z0 + 5);
  boxBasin(a, X0 + W * 0.04, YF + D * 0.06, X0 + W * 0.04 + W * v.tl * 0.92, ty1, Z0 + 5, th, 14, 24);
  a.box(px - D * 0.12, py - D * 0.12, Z0 + 5, px + D * 0.12, py + D * 0.12, Z0 + H * 0.12);
  a.tube([[px, py, Z0 + H * 0.12], [px, py, Z0 + H * 0.2], [px, py, Z0 + H * 0.62]], [D * 0.1, D * 0.075, D * 0.07], 12);
  a.tube([[px, py, Z0 + H * 0.58], [px, py, Z0 + H * 0.78]], [D * 0.095, D * 0.095], 12);
  a.ell(px, py, Z0 + H * 0.8, D * 0.1, D * 0.13, D * 0.09, 10, 6);
  a.tube([[px, py - D * 0.04, Z0 + H * 0.66], [px, py - D * 0.18, Z0 + H * 0.66], [px, py - D * 0.3, Z0 + H * 0.57], [px, ty1 - D * 0.18, Z0 + H * 0.5]], [D * 0.035, D * 0.032, D * 0.028, D * 0.024], 8);
  a.tube([[px, py - D * 0.12, Z0 + H * 0.84], [px, py + D * 0.04, Z0 + H * 0.87], [px, YB - 8, Z0 + H * 0.98]], [D * 0.022, D * 0.02, D * 0.02], 6);
  a.ell(px, YB - 14, Z0 + H * 0.97, D * 0.03, D * 0.055, D * 0.03, 6, 4); a.ell(px, py - D * 0.14, Z0 + H * 0.84, D * 0.04, D * 0.04, D * 0.04, 6, 4);
  a.rect(X0 + W * 0.04, YF + D * 0.06, X0 + W * 0.04 + W * v.tl * 0.92, ty1, 'EQUIP'); a.circ(px, py, D * 0.12, 'EQUIP'); a.line(px, py, px, ty1, 'EQUIP-DETAIL'); a.rect(px - D * 0.12, py - D * 0.12, px + D * 0.12, py + D * 0.12, 'EQUIP-DETAIL');
  a.log('Added the flagstone pad, the stone trough with rim and water, the pump base, barrel, head, curved spout, lever handle and handle grip (plan and 3D).');
}
const pumps = fam({ cat: 'nature/water', title: 'Generic hand pump and stone trough', desc: (v) => `Hand pump beside a ${v.lf} ft stone trough: flagstone pad, pump barrel with a head, curved spout and lever handle, and a trough with rim and water.`, build: handPump, vs: [
  ['3 ft trough, 40 in pump', 60, 40, 40, 0, { tl: 0.62, lf: 3 }], ['5 ft trough, 48 in pump', 84, 44, 48, 0, { tl: 0.78, lf: 5 }], ['7 ft trough, 54 in pump', 120, 48, 54, 0, { tl: 0.95, lf: 7 }] ] });

/** A wall fountain: a stone back wall with a spout mask, a falling sheet of water and a basin. v.tiers 1 or 2 */
function wallFountain(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, wt = D * 0.16, bh = H * 0.2, bd = D * 0.82;
  a.box(X0, YB - wt, Z0, X1, YB, Z1 - H * 0.04); a.box(X0 - 0, YB - wt - 4, Z1 - H * 0.04, X1, YB + 0, Z1); a.box(X0, YB - wt - 8, Z0, X0 + W * 0.07, YB, Z1 - H * 0.04); a.box(X1 - W * 0.07, YB - wt - 8, Z0, X1, YB, Z1 - H * 0.04);
  for (const s of [-1, 1]) { a.cyl(cx + s * W * 0.43, YB - wt - 12, Z1 - H * 0.04, Z1 + 0.01, 1, 3); }
  a.frame(X0 + W * 0.16, Z0 + H * 0.26, X1 - W * 0.16, Z1 - H * 0.12, YB - wt - 10, YB - wt, 34); a.box(cx - W * 0.05, YB - wt - 14, Z1 - H * 0.12 - 40, cx + W * 0.05, YB - wt, Z1 - H * 0.12);
  const bx0 = X0 + W * 0.1, bx1 = X1 - W * 0.1;
  boxBasin(a, bx0, YF, bx1, YB - wt, Z0, bh, 18, 28);
  const my = YB - wt - 6, mz = Z0 + H * (v.tiers > 1 ? 0.72 : 0.58);
  a.ell(cx, my - 10, mz + H * 0.1, W * 0.06, 14, W * 0.07, 12, 8);
  a.tube([[cx, my - 10, mz + H * 0.08], [cx, my - D * 0.12, mz + H * 0.07], [cx, my - D * 0.16, mz + H * 0.05]], [W * 0.018, W * 0.015, W * 0.012], 8);
  if (v.tiers > 1) { a.cyl(cx, my - D * 0.28, Z0 + bh + 4, Z0 + H * 0.38, W * 0.03, 10); a.tube([[cx, my - D * 0.28, Z0 + H * 0.38], [cx, my - D * 0.28, Z0 + H * 0.42], [cx, my - D * 0.28, Z0 + H * 0.5]], [W * 0.04, W * 0.13, W * 0.14], 20); a.cyl(cx, my - D * 0.28, Z0 + H * 0.5, Z0 + H * 0.515, W * 0.12, 18); a.tube([[cx, my - D * 0.16, mz + H * 0.05], [cx, my - D * 0.26, Z0 + H * 0.5]], [W * 0.01, W * 0.008], 4); a.box(cx - 3, my - D * 0.27, Z0 + bh + 4, cx + 3, my - D * 0.255, Z0 + H * 0.37); }
  else a.box(cx - W * 0.012, my - D * 0.2, Z0 + bh + 6, cx + W * 0.012, my - D * 0.15, mz + H * 0.06);
  a.rect(X0, YB - wt, X1, YB, 'EQUIP'); a.rect(bx0, YF, bx1, YB - wt, 'EQUIP'); a.rect(bx0 + 28, YF + 28, bx1 - 28, YB - wt - 28, 'EQUIP-DETAIL'); a.circ(cx, my - D * 0.1, W * 0.02, 'EQUIP-DETAIL');
  a.log('Added the stone back wall with pilasters and capping, the spout mask with a pipe, a falling water sheet' + (v.tiers > 1 ? ', an upper scallop bowl on a stem' : '') + ' and the basin with rim and water (plan and 3D).');
}
const wallFountains = fam({ cat: 'nature/water', title: 'Generic wall fountain', desc: (v) => `Wall fountain, ${v.wf} ft wide: stone back wall with pilasters and capping, a spout mask, a falling water sheet${v.tiers > 1 ? ', an upper bowl' : ''} and a rimmed basin.`, build: wallFountain, vs: [
  ['3 ft wide, single basin', 36, 24, 66, 0, { tiers: 1, wf: 3 }], ['4 ft wide, two tiers', 48, 30, 84, 0, { tiers: 2, wf: 4 }], ['6 ft wide, wide basin', 72, 30, 90, 0, { tiers: 1, wf: 6 }] ] });

/** A garden rill: a straight stone-edged channel in a flagged bed with weirs that step the water down. */
function rill(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cw = D * 0.34, sn = v.steps, sl = W / sn;
  for (let i = 0; i < sn; i++) {
    const x0 = X0 + sl * i, x1 = x0 + sl, top = Z0 + H * (1 - 0.62 * i / (sn - 1 || 1)), wl = top - H * 0.12;
    a.box(x0, YF, Z0, x1, cy - cw / 2, top); a.box(x0, cy + cw / 2, Z0, x1, YB, top); a.box(x0, cy - cw / 2, Z0, x1, cy + cw / 2, wl - 30);
    a.box(x0, cy - cw / 2 + 6, wl - 30, x1, cy + cw / 2 - 6, wl); a.box(x0, YF, top, x1, YF + D * 0.08, top + H * 0.03); a.box(x0, YB - D * 0.08, top, x1, YB, top + H * 0.03);
    if (i < sn - 1) { const nx = Z0 + H * (1 - 0.62 * (i + 1) / (sn - 1 || 1)) - H * 0.12; a.box(x1 - 10, cy - cw / 2 + 6, nx, x1 + 0, cy + cw / 2 - 6, wl); a.line(x1, cy - cw / 2, x1, cy + cw / 2, 'EQUIP-DETAIL'); }
  }
  for (const x of [X0 + W * 0.3, X0 + W * 0.7]) a.box(x - 80, cy - cw / 2 - 4, Z0 + H * 0.3, x + 80, cy + cw / 2 + 4, Z0 + H * 0.34);
  a.rect(X0, YF, X1, YB, 'EQUIP'); a.rect(X0, cy - cw / 2, X1, cy + cw / 2, 'EQUIP-DETAIL');
  a.log('Added ' + sn + ' stepped stone sections, each lower than the last, with coping, a narrow channel, weir lips between the water levels and two crossing slabs (plan and 3D).');
}
const rills = fam({ cat: 'nature/water', title: 'Generic stepped garden rill', desc: (v) => `Garden rill, ${v.lf} ft long: ${v.steps} stepped stone sections, each lower than the last, with coping, a narrow channel, weir lips and two crossing slabs.`, build: rill, vs: [
  ['8 ft, 3 steps', 96, 30, 24, 0, { steps: 3, lf: 8 }], ['16 ft, 5 steps', 192, 36, 36, 0, { steps: 5, lf: 16 }], ['30 ft, 8 steps', 360, 42, 56, 0, { steps: 8, lf: 30 }] ] });

/** A stone arch footbridge: an arch ring of blocks, filled spandrels, a deck and parapets, over a stream bed. */
function stoneBridge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), n = v.blocks, ri = W * 0.3, tk = W * 0.045, ro = ri + tk, par = H * 0.1, deck = Z1 - par, zc = deck - ro - H * 0.05, dy = D / 2 - D * 0.02;
  for (let k = 0; k < n; k++) { const t0 = PI * k / n, t1 = PI * (k + 1) / n, P = (t, r) => [cx + m.cos(t) * r, zc + m.sin(t) * r]; prismY(a, [P(t0, ri), P(t1, ri), P(t1, ro), P(t0, ro)], cy - dy, cy + dy); }
  const ns = 14; for (let i = 0; i < ns; i++) { const x0 = cx - ro + 2 * ro * i / ns, x1 = cx - ro + 2 * ro * (i + 1) / ns, xm = (x0 + x1) / 2, ze = zc + m.sqrt(m.max(0, ro * ro - (xm - cx) * (xm - cx))); a.box(x0, cy - dy, ze - 2, x1, cy + dy, deck); }
  a.box(X0, cy - dy, Z0, cx - ro, cy + dy, deck); a.box(cx + ro, cy - dy, Z0, X1, cy + dy, deck);
  a.box(cx - ri, cy - dy, Z0, cx + ri, cy + dy, Z0 + (zc - Z0) * 0.22);
  for (const s of [-1, 1]) { const y0 = s < 0 ? cy - dy : cy + dy - D * 0.12; a.box(X0, y0, deck, X1, y0 + D * 0.12, Z1 - 5); a.box(X0 - 0, y0 - 2, Z1 - 5, X1, y0 + D * 0.12 + 2, Z1); for (let k = 0; k < m.floor(W / 600); k++) a.line(X0 + (k + 1) * 600, y0, X0 + (k + 1) * 600, y0 + D * 0.12, 'EQUIP-DETAIL'); }
  a.rect(X0, cy - dy, X1, cy + dy, 'EQUIP'); a.rect(X0, cy - dy + D * 0.12, X1, cy + dy - D * 0.12, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.line(cx + s * ri, cy - dy, cx + s * ri, cy + dy, 'EQUIP-DETAIL');
  a.log('Added ' + n + ' arch ring blocks, the filled spandrels, the deck between two parapet walls with coping, the abutments and the stream bed under the arch (plan and 3D).');
}
const stoneBridges = fam({ cat: 'nature/water', title: 'Generic stone arch footbridge', desc: (v) => `Stone arch footbridge, ${v.sf} ft span: ${v.blocks} arch ring blocks, filled spandrels, a deck between two parapet walls with coping.`, build: stoneBridge, vs: [
  ['8 ft span', 168, 60, 84, 0, { seed: 1, blocks: 9, sf: 8 }], ['14 ft span', 288, 72, 132, 0, { seed: 2, blocks: 11, sf: 14 }], ['22 ft span', 440, 90, 192, 0, { seed: 3, blocks: 13, sf: 22 }] ] });

/** A plank footbridge: planks across two stringers on stone footings with posts and rails, optionally cambered. */
function plankBridge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cam = H * v.camber, zd = Z0 + H * 0.2 + cam * 0, wd = D * 0.82, np = m.round(W / 140), pw = (W - 80) / np;
  const zAt = (x) => Z0 + H * 0.3 + cam * (1 - m.pow((x - cx) / (W / 2 - 40), 2));
  for (const s of [-1, 1]) { const y = cy + s * wd * 0.42; arcTube(a, [X0 + 40, y, Z0 + H * 0.3 - 40], [X1 - 40, y, Z0 + H * 0.3 - 40], cam, [18, 18], 6, 10); }
  for (let i = 0; i < np; i++) { const x = X0 + 40 + pw * (i + 0.5); a.box(x - pw * 0.46, cy - wd / 2, zAt(x) - 36, x + pw * 0.46, cy + wd / 2, zAt(x) - 36 + 26); }
  for (const e of [X0, X1 - 90]) a.box(e, cy - D * 0.46, Z0, e + 90, cy + D * 0.46, Z0 + H * 0.26);
  if (v.rails) for (const s of [-1, 1]) { const y = cy + s * wd * 0.47, np2 = v.rails; for (let i = 0; i <= np2; i++) { const x = X0 + 60 + (W - 120) * i / np2; a.tube([[x, y, zAt(x) - 10], [x, y, zAt(x) + H * 0.55 * 0.6]], [12, 12], 6); } const pts = Array.from({ length: 9 }, (_, i) => { const x = X0 + 60 + (W - 120) * i / 8; return [x, y, zAt(x) + H * 0.33]; }); a.tube(pts, pts.map(() => 11), 6); const p2 = pts.map(([x, yy, z]) => [x, yy, z - H * 0.2]); a.tube(p2, p2.map(() => 8), 6); }
  a.rect(X0, cy - D * 0.46, X1, cy + D * 0.46, 'EQUIP-DETAIL'); a.rect(X0 + 40, cy - wd / 2, X1 - 40, cy + wd / 2, 'EQUIP'); for (let i = 1; i < np; i++) a.line(X0 + 40 + pw * i, cy - wd / 2, X0 + 40 + pw * i, cy + wd / 2, 'EQUIP-DETAIL');
  a.log('Added the stone footings, two stringers, ' + np + ' deck planks' + (v.camber ? ' on a gentle camber' : '') + (v.rails ? ' and posts with a top rail and a lower rail each side' : '') + ' (plan and 3D).');
}
const plankBridges = fam({ cat: 'nature/water', title: 'Generic plank footbridge', desc: (v) => `Plank footbridge, ${v.lf} ft long: stone end footings, two stringers and ${v.rails ? 'posts with a top and lower rail each side' : 'a plain plank deck'}${v.camber ? ', gently cambered' : ''}.`, build: plankBridge, vs: [
  ['8 ft, plain deck', 96, 36, 30, 0, { camber: 0, rails: 0, lf: 8 }], ['12 ft, with rails', 144, 40, 52, 0, { camber: 0, rails: 4, lf: 12 }], ['20 ft, cambered with rails', 240, 44, 60, 0, { camber: 0.14, rails: 6, lf: 20 }] ] });

/** A log footbridge: one or two hewn logs across the gap with a rope rail. */
function logBridge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.logs, r = D / (2 * n) * 0.96;
  for (let i = 0; i < n; i++) { const y = cy + (i - (n - 1) / 2) * r * 2.04, z = Z0 + H * 0.45; a.xcyl(X0 + W * 0.08, X1 - W * 0.08, y, z, r, 16); a.box(X0 + W * 0.08, y - r * 0.7, z + r * 0.55, X1 - W * 0.08, y + r * 0.7, z + r * 0.98); for (const x of [X0 + W * 0.08, X1 - W * 0.08]) a.xcyl(x, x + (x < cx ? 5 : -5), y, z, r * 0.6, 14); }
  for (const s of [-1, 1]) lump(a, cx + s * W * 0.46, cy, Z0 + H * 0.2, W * 0.07, D * 0.46, H * 0.3, v.seed + s + 3, 0.15, 12, 6, Z0);
  if (v.rail) { const y = cy - D * 0.45, z0 = Z0 + H * 0.45 + r; for (let i = 0; i < 3; i++) { const x = X0 + W * 0.12 + (W * 0.76) * i / 2; a.tube([[x, y, Z0 + H * 0.4], [x, y, Z1 - 6]], [11, 10], 6); } const pts = [[X0 + W * 0.12, y, Z1 - 12], [cx, y, Z1 - 30], [X1 - W * 0.12, y, Z1 - 12]]; a.tube(pts, [7, 7, 7], 6); }
  a.rect(X0 + W * 0.08, cy - D / 2, X1 - W * 0.08, cy + D / 2, 'EQUIP'); a.line(X0 + W * 0.08, cy, X1 - W * 0.08, cy, 'EQUIP-DETAIL'); a.circ(X0 + W * 0.08, cy, r * 0.5, 'EQUIP-DETAIL');
  a.log('Added ' + n + ' round log' + (n > 1 ? 's' : '') + ' with a hewn flat walking face and end grain, a bank stone at each end' + (v.rail ? ' and a rope rail on three posts' : '') + ' (plan and 3D).');
}
const logBridges = fam({ cat: 'nature/water', title: 'Generic log footbridge', desc: (v) => `Log footbridge, ${v.lf} ft: ${v.logs === 1 ? 'one round log' : 'two round logs side by side'} hewn flat on top, resting on bank stones${v.rail ? ', with a rope rail on posts' : ''}.`, build: logBridge, vs: [
  ['8 ft, single log', 96, 20, 36, 0, { seed: 1, logs: 1, lf: 8 }], ['14 ft, two logs, rope rail', 168, 36, 48, 0, { seed: 2, logs: 2, rail: 1, lf: 14 }], ['20 ft, two logs', 240, 40, 48, 0, { seed: 3, logs: 2, lf: 20 }] ] });

/** A sluice gate: two concrete piers, a gate panel raised on screw stems with a hand wheel, and a walkway. */
function sluice(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pw = W * 0.14, gw = W - pw * 2, gz = Z0 + H * 0.1, raise = H * v.raise, gh = H * 0.5;
  a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.1); a.box(X0, YF, Z0, X0 + pw, YB, Z0 + H * 0.78); a.box(X1 - pw, YF, Z0, X1, YB, Z0 + H * 0.78);
  a.box(X0 + pw, cy - 16, gz + raise, X1 - pw, cy + 16, gz + raise + gh);
  for (let i = 1; i < 5; i++) a.box(X0 + pw, cy - 20, gz + raise + gh * i / 5 - 3, X1 - pw, cy + 20, gz + raise + gh * i / 5 + 3);
  for (const s of [-1, 1]) { a.box(X0 + pw + (s > 0 ? gw - 18 : 0), cy - 28, gz, X0 + pw + (s > 0 ? gw : 18), cy + 28, Z0 + H * 0.78); const x = cx + s * gw * 0.3; a.tube([[x, cy, gz + raise + gh], [x, cy, Z0 + H * 0.86]], [9, 9], 8); }
  a.box(X0, cy - D * 0.2, Z0 + H * 0.78, X1, cy + D * 0.2, Z0 + H * 0.84); for (let i = 0; i <= 12; i++) a.line(X0 + W * i / 12, cy - D * 0.2, X0 + W * i / 12, cy + D * 0.2, 'EQUIP-DETAIL');
  for (const y of [cy - D * 0.2, cy + D * 0.2]) { a.tube([[X0 + 8, y, Z1 - H * 0.04], [X1 - 8, y, Z1 - H * 0.04]], [10, 10], 6); for (let i = 0; i < 4; i++) a.tube([[X0 + 8 + (W - 16) * i / 3, y, Z0 + H * 0.84], [X0 + 8 + (W - 16) * i / 3, y, Z1 - H * 0.04]], [8, 8], 5); }
  const hx = cx; a.tube([[hx, cy, Z0 + H * 0.84], [hx, cy, Z0 + H * 0.9]], [14, 18], 10); ringXZ(a, hx, cy, Z0 + H * 0.93, H * 0.1, 7, 18); a.tube([[hx - H * 0.1, cy, Z0 + H * 0.93], [hx + H * 0.1, cy, Z0 + H * 0.93]], [5, 5], 4); a.tube([[hx, cy, Z0 + H * 0.84], [hx, cy, Z0 + H * 0.93]], [6, 6], 4);
  a.box(X0 + pw, YF + 4, Z0 + H * 0.1, X1 - pw, cy - 40, Z0 + H * 0.1 + H * 0.12 + v.raise * 0 + 60); a.box(X0 + pw, cy + 40, Z0 + H * 0.1, X1 - pw, YB - 4, Z0 + H * 0.1 + 12);
  a.rect(X0, YF, X1, YB, 'EQUIP'); a.rect(X0 + pw, YF, X1 - pw, YB, 'EQUIP-DETAIL'); a.rect(X0 + pw, cy - 16, X1 - pw, cy + 16, 'EQUIP-DETAIL'); a.circ(cx, cy, H * 0.1, 'EQUIP-DETAIL');
  a.log('Added the concrete apron and two piers with gate guides, the slatted gate panel raised ' + m.round(v.raise * 100) + '% on two screw stems, the walkway with rails and the hand wheel (plan and 3D).');
}
const sluices = fam({ cat: 'nature/water', title: 'Generic sluice gate', desc: (v) => `Sluice gate, ${v.wf} ft opening: concrete apron and two piers with gate guides, a slatted gate panel on two screw stems, a walkway with rails and a hand wheel.`, build: sluice, vs: [
  ['3 ft opening, part raised', 60, 40, 72, 0, { raise: 0.18, wf: 3 }], ['5 ft opening, closed', 96, 50, 84, 0, { raise: 0.0, wf: 5 }], ['8 ft opening, raised', 144, 60, 96, 0, { raise: 0.3, wf: 8 }] ] });

/** A waterwheel: a paddled wheel on an axle between two stone piers, with a feed trough. */
function waterwheel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, Dw = H * 0.78, wr = Dw / 2, ww = W * 0.5, zc = Z0 + H * 0.12 + wr, yc = cy - D * 0.06, n = v.paddles;
  for (const s of [-1, 1]) { a.box(s < 0 ? X0 : X1 - W * 0.17, YF, Z0, s < 0 ? X0 + W * 0.17 : X1, YB, zc + wr * 0.25); }
  a.xcyl(X0 + 6, X1 - 6, yc, zc, wr * 0.07, 12);
  for (const s of [-1, 1]) { const x = cx + s * ww / 2; ringYZ(a, x, yc, zc, wr, wr * 0.05, 28); ringYZ(a, x, yc, zc, wr * 0.8, wr * 0.03, 24); for (let k = 0; k < 8; k++) { const th = k / 8 * 2 * PI + 0.2; a.tube([[x, yc + m.cos(th) * wr * 0.1, zc + m.sin(th) * wr * 0.1], [x, yc + m.cos(th) * wr * 0.97, zc + m.sin(th) * wr * 0.97]], [wr * 0.035, wr * 0.03], 5); } }
  a.xcyl(cx - ww * 0.55, cx + ww * 0.55, yc, zc, wr * 0.13, 14);
  for (let k = 0; k < n; k++) { const th = k / n * 2 * PI, rc = wr * 0.9, hr = wr * 0.1, ht = m.min(wr * 0.12, PI * wr / n * 0.9), u = [m.cos(th), m.sin(th)], t = [-m.sin(th), m.cos(th)], P = (a1, b1) => [yc + u[0] * (rc + a1) + t[0] * b1, zc + u[1] * (rc + a1) + t[1] * b1]; prismX(a, [P(-hr, -ht), P(hr, -ht), P(hr, ht), P(-hr, ht)], cx - ww / 2, cx + ww / 2); }
  const zt = zc + wr;
  prismX(a, [[yc - D * 0.04, zt - 6], [YB - 2, zt + H * 0.1], [YB - 2, zt + H * 0.1 + 36], [yc - D * 0.04, zt + 30]], cx - ww * 0.44, cx + ww * 0.44);
  for (const s of [-1, 1]) a.box(cx + s * ww * 0.44 - 6, yc - D * 0.04, zt + 28, cx + s * ww * 0.44 + 6, YB - 2, zt + H * 0.1 + 36 + 70);
  a.box(X0 + W * 0.17, YF + 2, Z0, X1 - W * 0.17, yc - wr * 0.2, Z0 + H * 0.06);
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.rect(cx - ww / 2, yc - wr, cx + ww / 2, yc + wr, 'EQUIP'); a.line(cx - ww / 2, yc, cx + ww / 2, yc, 'EQUIP-DETAIL'); a.rect(cx - ww * 0.44, yc, cx + ww * 0.44, YB - 2, 'EQUIP-DETAIL'); for (let k = 0; k < n; k++) a.line(cx - ww / 2, yc + wr * 0.8 * m.cos(k / n * 6.28), cx + ww / 2, yc + wr * 0.8 * m.cos(k / n * 6.28), 'EQUIP-DETAIL');
  a.log('Added two stone piers, the axle and hub, two rims with spokes, ' + n + ' paddles across the wheel, the wooden feed trough over the top and the tail pool (plan and 3D).');
}
const wheels = fam({ cat: 'nature/water', title: 'Generic overshot waterwheel', desc: (v) => `Overshot waterwheel, ${v.df} ft across: two stone piers, an axle with two spoked rims, ${v.paddles} paddles and a feed trough over the top.`, build: waterwheel, vs: [
  ['6 ft wheel', 84, 108, 100, 0, { paddles: 14, df: 6 }], ['10 ft wheel', 132, 160, 160, 0, { paddles: 18, df: 10 }], ['16 ft wheel', 192, 240, 250, 0, { paddles: 24, df: 16 }] ] });

/** A hot spring: stepped travertine pools, or a geyser mound with a vent and a steam plume. */
function hotSpring(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), ph = [R() * 6, R() * 6];
  const rad = (x, y) => { const u = (x - cx) / (W / 2), t = (y - cy) / (D / 2), th = m.atan2(t, u); return m.sqrt(u * u + t * t) * (1 + 0.09 * m.sin(3 * th + ph[0]) + 0.05 * m.sin(5 * th + ph[1])); };
  if (v.geyser) {
    const f = (x, y) => { const r = rad(x, y); return Z0 + H * 0.34 * m.exp(-r * r * 3.2) + (r > 0.12 && r < 0.2 ? H * 0.03 : 0); };
    field(a, X0, X1, YF, YB, 40, 32, f, Z0);
    a.cyl(cx, cy, Z0 + H * 0.31, Z0 + H * 0.345, W * 0.05, 14);
    a.tube([[cx, cy, Z0 + H * 0.34], [cx, cy, Z0 + H * 0.62], [cx, cy, Z0 + H * 0.88]], [W * 0.018, W * 0.03, W * 0.012], 10);
    for (let i = 0; i < 6; i++) a.ell(cx + (R() - 0.5) * W * 0.06, cy + (R() - 0.5) * W * 0.06, Z0 + H * (0.5 + i * 0.08), W * (0.04 + i * 0.012), W * (0.04 + i * 0.012), H * 0.05, 8, 5);
    for (let k = 1; k < 4; k++) a.poly(blobPoly(cx, cy, W * 0.5 * k / 4, D * 0.5 * k / 4, v.seed + k, 22, 0.08), k === 3 ? 'EQUIP' : 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.05, 'EQUIP-DETAIL');
    a.log('Added the sinter mound with a rim ring, the vent pool, a rising water column and six steam puffs above it (plan and 3D).');
  } else {
    const tr = v.tiers, f = (x, y) => { const r = rad(x, y); if (r > 1) return Z0 + 2; const s = (1 - r) * tr * 1.05, k = m.floor(s), fr = s - k; return Z0 + H * ((k + (fr < 0.12 ? 0.3 : fr < 0.25 ? 0.18 : 0.12)) / (tr + 0.5)); };
    const lvl = (x, y) => { const r = rad(x, y); if (r > 1) return Z0 - 60; const s = (1 - r) * tr * 1.05, k = m.floor(s), fr = s - k; return fr > 0.27 ? Z0 + H * ((k + 0.27) / (tr + 0.5)) : Z0 - 60; };
    field(a, X0, X1, YF, YB, 56, 44, f, Z0); field(a, X0 + 2, X1 - 2, YF + 2, YB - 2, 56, 44, lvl, Z0 + H * 0.06);
    for (let k = 1; k <= tr; k++) a.poly(blobPoly(cx, cy, W * 0.49 * (1 - (k - 1) / (tr * 1.05)), D * 0.49 * (1 - (k - 1) / (tr * 1.05)), v.seed + k, 30, 0.08), k === 1 ? 'EQUIP' : 'EQUIP-DETAIL');
    a.log('Added ' + tr + ' stepped terraces, each with a raised mineral rim, a shallow pool and a water sheet, narrowing towards the source at the top (plan and 3D).');
  }
}
const springs = fam({ cat: 'nature/water', title: 'Generic hot spring terraces', desc: (v) => v.geyser ? `Geyser mound, ${v.wf} ft across: low sinter mound with a vent pool, a rising water column and steam.` : `Hot spring terraces, ${v.wf} ft across: ${v.tiers} stepped travertine pools with raised rims and a water sheet in each.`, build: hotSpring, vs: [
  ['3 pools, 10 ft', 120, 100, 50, 0, { seed: 1, tiers: 3, wf: 10 }], ['5 pools, 18 ft', 216, 180, 90, 0, { seed: 2, tiers: 5, wf: 18 }], ['geyser mound, 12 ft', 144, 144, 120, 0, { seed: 3, geyser: 1, wf: 12 }] ] });

/** A jet fountain: a round basin with a ring of arcing jets and a centre jet. */
function jetFountain(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, r = W / 2 - 6, bh = H * 0.16, n = v.jets;
  roundBasin(a, cx, cy, Z0, r, bh, 0.86);
  a.cyl(cx, cy, Z0 + bh, Z0 + bh + H * 0.05, r * 0.05, 8);
  for (let i = 0; i < n; i++) { const th = i / n * 2 * PI, r0 = r * 0.8, r1 = r * 0.4, zt = Z0 + bh + H * 0.08; arcTube(a, [cx + m.cos(th) * r0, cy + m.sin(th) * r0, zt], [cx + m.cos(th) * r1, cy + m.sin(th) * r1, zt - H * 0.02], H * 0.3 * v.arc, [r * 0.022, r * 0.018, r * 0.016, r * 0.014, r * 0.012, r * 0.01, r * 0.01, r * 0.008, r * 0.006], 5, 8); a.cyl(cx + m.cos(th) * r0, cy + m.sin(th) * r0, Z0 + bh, zt, r * 0.02, 6); a.circ(cx + m.cos(th) * r0, cy + m.sin(th) * r0, r * 0.03, 'EQUIP-DETAIL'); }
  a.tube([[cx, cy, Z0 + bh + H * 0.05], [cx, cy, Z0 + bh + H * 0.4 * v.centre], [cx, cy, Z0 + bh + H * 0.78 * v.centre]], [r * 0.04, r * 0.026, r * 0.01], 8);
  a.ell(cx, cy, Z0 + bh + H * 0.79 * v.centre, r * 0.05, r * 0.05, r * 0.05, 6, 4);
  a.circ(cx, cy, r, 'EQUIP'); a.circ(cx, cy, r * 0.86, 'EQUIP-DETAIL'); a.circ(cx, cy, r * 0.4, 'EQUIP-DETAIL');
  a.log('Added the round basin with coping and water, a ring of ' + n + ' arcing jets from nozzles near the rim and a tall centre jet (plan and 3D).');
}
const jets = fam({ cat: 'nature/water', title: 'Generic jet fountain', desc: (v) => `Jet fountain, ${v.df} in basin: coping and water, a ring of ${v.jets} arcing jets and a centre jet.`, build: jetFountain, vs: [
  ['48 in basin, 6 jets', 50, 50, 54, 0, { jets: 6, arc: 0.7, centre: 0.7, df: 48 }], ['96 in basin, 10 jets', 100, 100, 100, 0, { jets: 10, arc: 0.8, centre: 0.8, df: 96 }], ['144 in basin, 14 jets, tall centre', 150, 150, 170, 0, { jets: 14, arc: 0.6, centre: 1.0, df: 144 }] ] });

/** A pebble fountain: a shallow basin with a core feature (pebble mound, drilled column or millstone) bubbling water. */
function pebbleFountain(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), r = W / 2 - 6, bh = H * 0.14;
  roundBasin(a, cx, cy, Z0, r, bh, 0.9);
  for (let i = 0; i < 30; i++) { const th = R() * 6.28, rr = r * (0.3 + 0.6 * R()); lump(a, cx + m.cos(th) * rr, cy + m.sin(th) * rr, Z0 + bh + H * 0.02, r * 0.1, r * 0.08, H * 0.03, v.seed + i, 0.2, 7, 4, Z0 + bh); }
  if (v.kind === 'mound') { for (let l = 0; l < 6; l++) { const rr = r * 0.62 * (1 - l / 6.5), nn = m.max(1, m.round(2 * PI * rr / (r * 0.2))), z = Z0 + bh + H * 0.14 * l + H * 0.03; for (let k = 0; k < nn; k++) { const th = k / nn * 6.28 + l; lump(a, cx + m.cos(th) * rr, cy + m.sin(th) * rr, z, r * 0.14, r * 0.12, H * 0.07, v.seed + k + l * 20, 0.2, 7, 4, z - H * 0.05); } } a.ell(cx, cy, Z0 + bh + H * 0.66, r * 0.1, r * 0.1, H * 0.05, 8, 5); }
  if (v.kind === 'column') { a.prism(ngon(cx, cy, r * 0.22, r * 0.22, 6, PI / 6), Z0 + bh, Z0 + bh + H * 0.8); a.cyl(cx, cy, Z0 + bh + H * 0.8, Z0 + bh + H * 0.8 + 3, r * 0.1, 10); for (let k = 0; k < 6; k++) { const th = k / 6 * 6.28 + 0.5; a.tube([[cx + m.cos(th) * r * 0.1, cy + m.sin(th) * r * 0.1, Z0 + bh + H * 0.82], [cx + m.cos(th) * r * 0.2, cy + m.sin(th) * r * 0.2, Z0 + bh + H * 0.7], [cx + m.cos(th) * r * 0.23, cy + m.sin(th) * r * 0.23, Z0 + bh + H * 0.3]], [3, 2.5, 2], 4); } }
  if (v.kind === 'millstone') { a.cyl(cx, cy, Z0 + bh, Z0 + bh + H * 0.7, r * 0.1, 10); a.cyl(cx, cy, Z0 + bh + H * 0.1, Z0 + bh + H * 0.1 + H * 0.12, r * 0.5, 24); a.cyl(cx, cy, Z0 + bh + H * 0.22, Z0 + bh + H * 0.7 + H * 0.02, r * 0.14, 12); for (let k = 0; k < 10; k++) { const th = k / 10 * 6.28; a.box(cx + m.cos(th) * r * 0.5 - 4, cy + m.sin(th) * r * 0.5 - 4, Z0 + bh + H * 0.1, cx + m.cos(th) * r * 0.5 + 4, cy + m.sin(th) * r * 0.5 + 4, Z0 + bh + H * 0.22); } }
  a.circ(cx, cy, r, 'EQUIP'); a.circ(cx, cy, r * 0.9, 'EQUIP-DETAIL'); a.circ(cx, cy, v.kind === 'column' ? r * 0.22 : v.kind === 'millstone' ? r * 0.5 : r * 0.55, 'EQUIP-DETAIL'); a.circ(cx, cy, r * 0.06, 'EQUIP-DETAIL');
  a.log('Added the shallow round basin with coping and water, scattered pebbles on the floor and ' + (v.kind === 'mound' ? 'a cone-shaped mound of stacked pebbles with a bubbling top' : v.kind === 'column' ? 'a drilled hexagonal stone column with water running down its sides' : 'a millstone disc with a central spout') + ' (plan and 3D).');
}
const pebbleF = fam({ cat: 'nature/water', title: 'Generic bubbling stone fountain', desc: (v) => `Bubbling fountain, ${v.df} in basin: shallow rimmed basin with scattered pebbles and ${v.kind === 'mound' ? 'a mound of stacked pebbles' : v.kind === 'column' ? 'a drilled hexagonal stone column' : 'a millstone disc with a central spout'}.`, build: pebbleFountain, vs: [
  ['pebble mound, 36 in', 38, 38, 20, 0, { seed: 1, kind: 'mound', df: 36 }], ['drilled column, 60 in', 62, 62, 48, 0, { seed: 2, kind: 'column', df: 60 }], ['millstone, 48 in', 50, 50, 30, 0, { seed: 3, kind: 'millstone', df: 48 }] ] });

/** A water lily tub: a tapered wooden tub with water, floating pads and flowers. */
function lilyTub(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), r = W / 2 - 4, wl = Z0 + H * 0.78;
  a.tube([[cx, cy, Z0], [cx, cy, Z0 + H * 0.5], [cx, cy, Z0 + H * 0.8]], [r * 0.82, r * 0.93, r], 26);
  for (let k = 0; k < 3; k++) { const z = Z0 + H * (0.14 + k * 0.28), rr = r * (0.84 + k * 0.07); a.tube([[cx, cy, z], [cx, cy, z + 9]], [rr + 3, rr + 3], 26); }
  a.cyl(cx, cy, Z0 + H * 0.8, wl + 2, r * 0.93, 26);
  for (let i = 0; i < v.pads; i++) { const th = i * 2.4 + R(), f = i === 0 ? 0.1 : 0.3 + 0.55 * R(), x = cx + m.cos(th) * r * f * 0.8, y = cy + m.sin(th) * r * f * 0.8; a.cyl(x, y, wl + 2, wl + 6, r * (0.17 + R() * 0.06), 12); a.circ(x, y, r * 0.2, 'EQUIP-DETAIL'); }
  for (let i = 0; i < v.flowers; i++) { const th = i * 3.1 + 0.8, x = cx + m.cos(th) * r * 0.35, y = cy + m.sin(th) * r * 0.35; for (let k = 0; k < 8; k++) { const ph = k / 8 * 6.28; a.cone(x + m.cos(ph) * r * 0.04, y + m.sin(ph) * r * 0.04, wl + 5, wl + 5 + H * 0.12, r * 0.045, 1.2, 4); } a.cyl(x, y, wl + 5, wl + 5 + H * 0.05, r * 0.025, 6); }
  a.circ(cx, cy, r, 'EQUIP'); a.circ(cx, cy, r * 0.93, 'EQUIP-DETAIL');
  a.log('Added the tapered tub with three hoops, the water surface, ' + v.pads + ' floating lily pads and ' + v.flowers + ' open flowers (plan and 3D).');
}
const lilyTubs = fam({ cat: 'nature/water', title: 'Generic water lily tub', desc: (v) => `Water lily tub, ${v.df} in across: tapered tub with three hoops, water, ${v.pads} lily pads and ${v.flowers} flowers.`, build: lilyTub, vs: [
  ['24 in tub', 25, 25, 16, 0, { seed: 1, pads: 3, flowers: 1, df: 24 }], ['36 in tub', 37, 37, 20, 0, { seed: 2, pads: 5, flowers: 2, df: 36 }], ['48 in tub', 49, 49, 22, 0, { seed: 3, pads: 7, flowers: 3, df: 48 }] ] });

/** A stone trough: a hollowed block with an end spout, on stone feet or a stand. */
function trough(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, lz = v.legs ? Z0 + H * 0.42 : Z0 + H * 0.12;
  if (!v.legs) { a.box(X0 + 50, YF + 40, Z0, X1 - 50, YB - 40, lz + 2); }
  if (v.legs) for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * W * 0.38 - 90, cy + sy * D * 0.3 - 70, Z0, cx + sx * W * 0.38 + 90, cy + sy * D * 0.3 + 70, lz);
  const nb = v.cells; for (let i = 0; i < nb; i++) { const x0 = X0 + W * i / nb + (i ? 0 : 0), x1 = X0 + W * (i + 1) / nb; boxBasin(a, x0, YF, x1 + (i < nb - 1 ? 0 : 0), YB, lz, H - (lz - Z0) - 40, 40, 44); }
  for (let i = 0; i < nb; i++) a.frame(X0 + W * i / nb + 90, lz + 60, X0 + W * (i + 1) / nb - 90, Z1 - 110, YF, YF + 10, 26);
  a.cyl(X1 + 0 - 40, cy, Z1 - 50, Z1 - 20, 8, 8);
  if (v.spout) { a.tube([[X0 + W * 0.04, cy, Z1 + 0], [X0 + W * 0.04, cy, Z1 - 60]], [14, 14], 8); }
  a.rect(X0, YF, X1, YB, 'EQUIP'); for (let i = 0; i < nb; i++) a.rect(X0 + W * i / nb + 44, YF + 44, X0 + W * (i + 1) / nb - 44, YB - 44, 'EQUIP-DETAIL');
  a.log('Added the hollowed stone body' + (v.legs ? ' on four stone feet' : '') + ' with ' + nb + ' water cell' + (nb > 1 ? 's divided by a thick wall' : '') + ', a rim and a spout pipe at one end (plan and 3D).');
}
const troughs = fam({ cat: 'nature/water', title: 'Generic stone water trough', desc: (v) => `Stone water trough, ${v.lf} ft long: hollowed rimmed body${v.legs ? ' on four stone feet' : ''} with ${v.cells > 1 ? v.cells + ' water cells' : 'one water cell'} and a spout pipe.`, build: trough, vs: [
  ['4 ft, one cell', 48, 20, 18, 0, { cells: 1, lf: 4, spout: 1 }], ['7 ft, two cells', 84, 24, 20, 0, { cells: 2, lf: 7, spout: 1 }], ['5 ft, raised on feet', 60, 24, 32, 0, { cells: 1, legs: 1, lf: 5, spout: 1 }] ] });

// ------------------------------------------------------------------------------------------ wildlife
const QS = (o) => ({ ...base, ...o });
const quadFam = (title, desc, vs) => fam({ cat: 'nature/wildlife', title, desc: (v) => desc.replace('{sx}', v.sx), build: (a, v) => quad(a, v.s), vs: vs.map(([label, w, d, h, sx, o]) => [label, w, d, h, 0, { sx, s: QS(o) }]) });
const pigs = quadFam('Generic pig', 'Pig scale shape, {sx}: heavy barrel body, short legs with trotters, a broad head with a flat snout and folded ears, and a curled tail.', [
  ['piglet, 10 in at the shoulder', 8, 26, 14, 'piglet', { leg: 0.28, bl: 0.32, bw: 0.42, bh: 0.3, hy: 0.09, hz: 0.66, hl: 0.11, hw: 0.24, hh: 0.14, snout: 0.5, neck: 0.2, lx: 0.27, lr: 0.05, ear: 'flop', tail: 'curl' }],
  ['sow, 30 in at the shoulder', 20, 60, 32, 'sow', { leg: 0.26, bl: 0.33, bw: 0.43, bh: 0.32, hy: 0.09, hz: 0.6, hl: 0.1, hw: 0.22, hh: 0.13, snout: 0.6, neck: 0.2, lx: 0.28, lr: 0.045, ear: 'flop', tail: 'curl' }],
  ['boar, 36 in at the shoulder', 22, 64, 38, 'boar', { leg: 0.3, bl: 0.32, bw: 0.4, bh: 0.28, hy: 0.09, hz: 0.66, hl: 0.11, hw: 0.2, hh: 0.12, snout: 0.9, neck: 0.22, lx: 0.26, lr: 0.04, ear: 'pt', tail: 'short', hump: true }]]);
const goats = quadFam('Generic goat', 'Goat scale shape, {sx}: slim body, four legs with hooves, a head with a short beard line, ears and curved horns, and a short upright tail.', [
  ['kid, 18 in at the shoulder', 8, 28, 24, 'kid', { leg: 0.42, bl: 0.28, bw: 0.4, bh: 0.2, hy: 0.09, hz: 0.82, hl: 0.1, hw: 0.2, hh: 0.09, snout: 0.7, neck: 0.15, lx: 0.26, lr: 0.035, ear: 'long', tail: 'short' }],
  ['horned goat, 32 in', 14, 50, 44, 'horned goat', { leg: 0.44, bl: 0.28, bw: 0.4, bh: 0.18, hy: 0.09, hz: 0.84, hl: 0.09, hw: 0.17, hh: 0.075, snout: 0.8, neck: 0.15, lx: 0.26, lr: 0.03, ear: 'long', tail: 'short', horns: true }]]);
const foxes = quadFam('Generic fox', 'Fox scale shape, {sx}: slim body, four slender legs with paws, a pointed muzzle with upright ears and a long bushy tail.', [
  ['small fox, 14 in at the shoulder', 8, 36, 17, 'small fox', { leg: 0.4, bl: 0.24, bw: 0.3, bh: 0.15, hy: 0.1, hz: 0.78, hl: 0.1, hw: 0.2, hh: 0.1, snout: 1.1, neck: 0.14, lx: 0.22, lr: 0.03, ear: 'pt', tail: 'bushy' }],
  ['large fox, 18 in', 10, 46, 22, 'large fox', { leg: 0.4, bl: 0.24, bw: 0.3, bh: 0.16, hy: 0.1, hz: 0.78, hl: 0.1, hw: 0.2, hh: 0.1, snout: 1.1, neck: 0.14, lx: 0.22, lr: 0.03, ear: 'pt', tail: 'bushy' }]]);
const rabbits = quadFam('Generic rabbit or hare', 'Rabbit scale shape, {sx}: round haunch, short front legs, a head with long upright ears and a short tail.', [
  ['rabbit, 9 in long', 5, 14, 9, 'rabbit', { leg: 0.2, bl: 0.3, bw: 0.42, bh: 0.32, hy: 0.08, hz: 0.78, hl: 0.14, hw: 0.28, hh: 0.16, snout: 0.5, neck: 0.12, lx: 0.24, lr: 0.05, ear: 'long', tail: 'short' }],
  ['hare, 14 in long', 6, 22, 15, 'hare', { leg: 0.3, bl: 0.28, bw: 0.4, bh: 0.26, hy: 0.08, hz: 0.82, hl: 0.12, hw: 0.24, hh: 0.14, snout: 0.7, neck: 0.12, lx: 0.22, lr: 0.04, ear: 'long', tail: 'short' }]]);
const donkeys = quadFam('Generic donkey', 'Donkey scale shape, {sx}: sturdy body, four legs with hooves, a long head with very long ears, a short upright mane and a tufted tail.', [
  ['miniature donkey, 34 in at the shoulder', 12, 44, 40, 'miniature donkey', { leg: 0.44, bl: 0.28, bw: 0.4, bh: 0.2, hy: 0.09, hz: 0.88, hl: 0.11, hw: 0.2, hh: 0.09, snout: 0.9, neck: 0.17, lx: 0.25, lr: 0.04, ear: 'long', tail: 'long', mane: true }],
  ['donkey, 48 in', 18, 64, 56, 'donkey', { leg: 0.46, bl: 0.28, bw: 0.38, bh: 0.18, hy: 0.09, hz: 0.88, hl: 0.1, hw: 0.19, hh: 0.085, snout: 0.9, neck: 0.16, lx: 0.25, lr: 0.035, ear: 'long', tail: 'long', mane: true }]]);
const moose = quadFam('Generic moose', 'Moose scale shape, {sx}: heavy body with a shoulder hump, long legs with hooves, a long drooping snout with ears' + ' and, on the bull, broad branched antlers.', [
  ['cow moose, 66 in at the shoulder', 26, 100, 84, 'cow', { leg: 0.5, bl: 0.28, bw: 0.4, bh: 0.2, hy: 0.08, hz: 0.82, hl: 0.12, hw: 0.19, hh: 0.095, snout: 1.0, neck: 0.18, lx: 0.26, lr: 0.035, ear: 'long', tail: 'short', hump: true }],
  ['bull moose with antlers, 72 in', 40, 110, 108, 'bull', { leg: 0.42, bl: 0.28, bw: 0.4, bh: 0.2, hy: 0.08, hz: 0.7, hl: 0.12, hw: 0.17, hh: 0.08, snout: 1.0, neck: 0.2, lx: 0.26, lr: 0.035, ear: 'long', tail: 'short', hump: true, antlers: true }]]);
const camels = quadFam('Generic camel', 'Camel scale shape, {sx}: deep body with a hump, long legs with broad feet, a long curved neck with a small head and a short tail.', [
  ['calf, 52 in at the shoulder', 14, 56, 62, 'calf', { leg: 0.5, bl: 0.28, bw: 0.4, bh: 0.2, hy: 0.07, hz: 0.88, hl: 0.1, hw: 0.2, hh: 0.075, snout: 0.9, neck: 0.12, lx: 0.24, lr: 0.04, ear: 'pt', tail: 'short', hump: true, bigfoot: true }],
  ['dromedary, 78 in', 28, 110, 100, 'dromedary', { leg: 0.5, bl: 0.28, bw: 0.4, bh: 0.19, hy: 0.07, hz: 0.9, hl: 0.1, hw: 0.17, hh: 0.065, snout: 0.9, neck: 0.12, lx: 0.24, lr: 0.035, ear: 'pt', tail: 'short', hump: true, bigfoot: true }]]);

/** A turtle: a domed shell with scutes, a head on a neck, and four legs or flippers. v.sea = flippers */
function turtle(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, by = cy + D * 0.08, rx = W * (v.sea ? 0.26 : 0.4), ry = D * 0.36, rz = H * 0.5, bz = Z0 + H * 0.45;
  a.ell(cx, by, bz, rx, ry, rz, 18, 8); a.ell(cx, by, Z0 + H * 0.28, rx * 1.02, ry * 1.02, H * 0.16, 16, 6);
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) a.ell(cx + s * rx * 0.46, by + (k - 2) * ry * 0.38, bz + rz * 0.62, rx * 0.2, ry * 0.15, rz * 0.4, 6, 4);
  for (let k = 0; k < 3; k++) a.ell(cx, by + (k - 1) * ry * 0.5, bz + rz * 0.9, rx * 0.2, ry * 0.16, rz * 0.15, 6, 4);
  a.tube([[cx, by - ry * 0.85, bz - rz * 0.1], [cx, by - ry * 1.02, bz], [cx, YF + D * 0.1, bz + rz * 0.1]], [W * 0.06, W * 0.05, W * 0.045], 8); a.ell(cx, YF + D * 0.1, bz + rz * 0.12, W * 0.06, D * 0.075, H * 0.1, 8, 5);
  for (const s of [-1, 1]) {
    if (v.sea) { a.tube([[cx + s * rx * 0.9, by - ry * 0.4, bz - rz * 0.4], [cx + s * W * 0.38, by - ry * 0.7, bz - rz * 0.6], [cx + s * W * 0.49, by - ry * 1.05, bz - rz * 0.7]], [W * 0.05, W * 0.06, W * 0.02], 6); a.tube([[cx + s * rx * 0.8, by + ry * 0.5, bz - rz * 0.5], [cx + s * W * 0.32, by + ry * 0.65, bz - rz * 0.55], [cx + s * W * 0.34, by + ry * 0.95, bz - rz * 0.55]], [W * 0.03, W * 0.04, W * 0.012], 6); }
    else { for (const k of [-0.5, 0.55]) a.cyl(cx + s * rx * 0.8, by + k * ry, Z0, Z0 + H * 0.3, W * 0.07, 8); }
  }
  a.tube([[cx, by + ry * 0.95, bz - rz * 0.4], [cx, YB - 3, bz - rz * 0.7]], [W * 0.03, W * 0.008], 5);
  a.ellp(cx, by, rx, ry); a.ellp(cx, by, rx * 0.65, ry * 0.65, 'EQUIP-DETAIL'); a.ellp(cx, YF + D * 0.1, W * 0.06, D * 0.075, 'EQUIP-DETAIL'); a.line(cx, by - ry, cx, by + ry, 'EQUIP-DETAIL');
  a.log('Added the domed shell with scutes and a lower rim, the neck and head, ' + (v.sea ? 'four paddle flippers' : 'four stout legs') + ' and a short tail (plan and 3D).');
}
const turtles = fam({ cat: 'nature/wildlife', title: 'Generic turtle', desc: (v) => `${v.sx[0].toUpperCase() + v.sx.slice(1)} scale shape: domed shell with scutes, a head on a neck, ${v.sea ? 'four paddle flippers' : 'four stout legs'} and a short tail.`, build: turtle, vs: [
  ['pond turtle, 8 in', 6, 8, 3, 0, { sx: 'pond turtle' }], ['tortoise, 24 in', 18, 24, 12, 0, { sx: 'tortoise' }], ['sea turtle, 40 in', 44, 40, 10, 0, { sx: 'sea turtle', sea: 1 }] ] });

/** A frog sitting on a lily pad. */
function frog(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pad = W * 0.5;
  a.cyl(cx, cy, Z0, Z0 + H * 0.08, pad - 2, 18);
  const by = cy + D * 0.08, bz = Z0 + H * 0.45, rx = W * 0.22, ry = D * 0.28, rz = H * 0.36;
  a.ell(cx, by, bz, rx, ry, rz, 12, 7); a.ell(cx, by - ry * 0.9, bz + rz * 0.35, rx * 0.95, ry * 0.5, rz * 0.9, 10, 6);
  for (const s of [-1, 1]) {
    a.ell(cx + s * rx * 0.5, by - ry * 1.2, bz + rz * 1.1, W * 0.06, W * 0.06, W * 0.06, 8, 5); a.ell(cx + s * rx * 0.5, by - ry * 1.3, bz + rz * 1.2, W * 0.025, W * 0.025, W * 0.025, 5, 4);
    a.tube([[cx + s * rx * 0.7, by + ry * 0.2, bz - rz * 0.1], [cx + s * W * 0.4, by + ry * 0.3, bz + rz * 0.5], [cx + s * W * 0.38, by + ry * 0.9, Z0 + H * 0.12]], [W * 0.07, W * 0.045, W * 0.03], 6);
    a.tube([[cx + s * W * 0.38, by + ry * 0.9, Z0 + H * 0.12], [cx + s * W * 0.43, by + ry * 1.2, Z0 + H * 0.1]], [W * 0.03, W * 0.012], 4);
    a.tube([[cx + s * rx * 0.8, by - ry * 0.8, bz - rz * 0.2], [cx + s * rx * 0.85, by - ry * 1.3, Z0 + H * 0.1]], [W * 0.035, W * 0.03], 5);
  }
  a.circ(cx, cy, pad, 'EQUIP'); a.ellp(cx, by, rx, ry, 'EQUIP-DETAIL'); a.circ(cx - rx * 0.5, by - ry * 1.2, W * 0.06, 'EQUIP-DETAIL'); a.circ(cx + rx * 0.5, by - ry * 1.2, W * 0.06, 'EQUIP-DETAIL');
  a.log('Added the lily pad, the squat body and head with two raised eyes, folded hind legs and short front legs (plan and 3D).');
}
const frogs = fam({ cat: 'nature/wildlife', title: 'Generic frog on a lily pad', desc: (v) => `Frog scale shape, ${v.sz} in, sitting on a lily pad: squat body with raised eyes, folded hind legs and short front legs.`, build: frog, vs: [['small, 3 in', 4, 4, 2, 0, { sz: 3 }], ['bullfrog, 6 in', 8, 8, 4, 0, { sz: 6 }]] });

/** A coiled snake: a tapering tube in a flat spiral with a raised head. */
function snake(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, c = v.coils, rO = W * 0.4, Rb = H * 0.07, rise = c * Rb * 1.7;
  const pts = [], rad = [], N = c * 14;
  for (let i = 0; i <= N; i++) { const t = i / N, th = t * c * 2 * PI, r = rO * (1 - 0.6 * t) + 1; pts.push([cx + m.cos(th) * r, cy + m.sin(th) * r, Z0 + Rb * 1.05 + rise * t]); rad.push(Rb * (0.15 + 0.85 * m.sin(m.min(1, t * 6) * PI / 2))); }
  const hx = cx, hy = cy - D * 0.02, hz = Z0 + rise + Rb * 5, last = pts[pts.length - 1];
  a.tube(pts, rad, 8);
  a.tube([last, [last[0] - 2, last[1], (last[2] + hz) / 2], [hx, hy, hz]], [Rb, Rb * 0.95, Rb * 0.9], 8);
  a.ell(hx, hy - Rb, hz + Rb * 0.2, Rb * 1.1, Rb * 1.6, Rb * 0.8, 10, 6); for (const s of [-1, 1]) a.ell(hx + s * Rb * 0.7, hy - Rb * 1.2, hz + Rb * 0.7, Rb * 0.22, Rb * 0.22, Rb * 0.22, 5, 4);
  a.tube([[hx, hy - Rb * 2.4, hz], [hx, hy - Rb * 3.6, hz - Rb * 0.2]], [Rb * 0.12, Rb * 0.05], 4);
  for (let i = 0; i < N; i++) { const p = pts[i], q = pts[i + 1]; a.line(p[0], p[1], q[0], q[1], i % 2 ? 'EQUIP' : 'EQUIP-DETAIL'); }
  a.log('Added the tapering body coiled in ' + c + ' turns, the raised neck and wedge-shaped head with eyes and a forked tongue (plan and 3D).');
}
const snakes = fam({ cat: 'nature/wildlife', title: 'Generic coiled snake', desc: (v) => `Snake scale shape, ${v.sz}: body tapering from the head to the tail, coiled in ${v.coils} turns with the neck raised and a wedge-shaped head.`, build: snake, vs: [['3 ft, two turns', 14, 14, 8, 0, { coils: 2, sz: '3 ft' }], ['6 ft, three turns', 22, 22, 12, 0, { coils: 3, sz: '6 ft' }]] });

/** An owl perched on a post: upright body, large round head with facial disc, ear tufts and folded wings. */
function owl(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, ph = H * 0.22, bz = Z0 + ph + (H - ph) * 0.38, br = W * 0.36;
  a.cyl(cx, cy, Z0, Z0 + ph, W * 0.28, 14); a.cyl(cx, cy, Z0 + ph, Z0 + ph + 3, W * 0.3, 14);
  a.ell(cx, cy, bz, br, D * 0.33, (H - ph) * 0.4, 14, 8);
  for (const s of [-1, 1]) { a.ell(cx + s * br * 0.82, cy + D * 0.05, bz - (H - ph) * 0.04, br * 0.24, D * 0.26, (H - ph) * 0.34, 8, 6); a.tube([[cx + s * W * 0.14, cy, Z0 + ph + 4], [cx + s * W * 0.14, cy - D * 0.12, Z0 + ph + 4]], [W * 0.045, W * 0.04], 5); }
  const hz = Z1 - (H - ph) * 0.2, hy = cy - D * 0.08; a.ell(cx, hy, hz, br * 0.95, D * 0.3, (H - ph) * 0.22, 14, 8);
  for (const s of [-1, 1]) { a.ell(cx + s * br * 0.42, hy - D * 0.24, hz + (H - ph) * 0.02, br * 0.38, D * 0.06, (H - ph) * 0.17, 10, 6); a.ell(cx + s * br * 0.42, hy - D * 0.29, hz + (H - ph) * 0.02, br * 0.2, D * 0.03, (H - ph) * 0.08, 8, 5); a.cone(cx + s * br * 0.72, hy + D * 0.02, hz + (H - ph) * 0.17, hz + (H - ph) * 0.3, W * 0.05, W * 0.01, 5); }
  a.tube([[cx, hy - D * 0.3, hz - (H - ph) * 0.02], [cx, hy - D * 0.38, hz - (H - ph) * 0.08]], [W * 0.04, W * 0.01], 5);
  a.tube([[cx, cy + D * 0.28, bz - (H - ph) * 0.2], [cx, YB - 3, Z0 + ph + (H - ph) * 0.05]], [W * 0.14, W * 0.1], 6);
  a.ellp(cx, cy, br, D * 0.33); a.ellp(cx, hy, br * 0.95, D * 0.3, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.28, 'EQUIP-DETAIL'); a.line(cx, hy - D * 0.3, cx, hy - D * 0.38, 'EQUIP-DETAIL');
  a.log('Added the post, the upright body with folded wings and tail, the round head with a facial disc, large eyes, ear tufts and a short beak, and two feet gripping the post (plan and 3D).');
}
const owls = fam({ cat: 'nature/wildlife', title: 'Generic owl on a post', desc: (v) => `Owl scale shape, ${v.sz}, perched on a post: upright body with folded wings, a round head with a facial disc, large eyes, ear tufts and a short beak.`, build: owl, vs: [['small owl, 8 in', 5, 5, 11, 0, { sz: '8 in' }], ['great owl, 22 in', 12, 12, 30, 0, { sz: '22 in' }]] });

/** A hen with a comb and wattle (uses the standing bird body). */
function hen(a, v) {
  bird(a, v);
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, s = v.s, hy = YF + m.max(D * s.hy, H * s.hr * 2.2 + H * s.beak + 2), hz = Z0 + H * s.hz;
  for (let i = 0; i < 3; i++) a.cone(cx, hy - H * 0.01 + (i - 1) * D * 0.03, hz + H * s.hr * 0.8, hz + H * s.hr * 0.8 + H * (0.06 - Math.abs(i - 1) * 0.015), W * 0.028, W * 0.012, 5);
  a.ell(cx, hy - H * s.hr * 1.2, hz - H * s.hr * 0.9, W * 0.018, W * 0.012, H * 0.05, 5, 4);
  if (v.rooster) for (let i = 0; i < 4; i++) a.tube([[cx, YB - D * 0.18, Z0 + H * 0.45], [cx, YB - D * 0.08, Z0 + H * (0.7 + i * 0.05)], [cx, YB - 2, Z0 + H * (0.55 + i * 0.12)]], [W * 0.03, W * 0.04, W * 0.01], 5);
  a.log('Added the plump body with folded wings, a neck, a head with a comb, beak and wattle, a tail and two legs with toes (plan and 3D).');
}
const hens = fam({ cat: 'nature/wildlife', title: 'Generic hen and rooster', desc: (v) => `${v.rooster ? 'Rooster' : 'Hen'} scale shape: plump body with folded wings, a head with a comb, beak and wattle, ${v.rooster ? 'a tall curved tail' : 'a short fanned tail'} and two legs with toes.`, build: hen, vs: [
  ['hen, 16 in', 7, 16, 14, 0, { rooster: 0, s: { leg: 0.2, bh: 0.28, by: 0.52, bl: 0.28, hy: 0.12, hz: 0.76, hr: 0.09, beak: 0.06, nr: 0.1 } }],
  ['rooster, 22 in', 8, 22, 24, 0, { rooster: 1, s: { leg: 0.28, bh: 0.24, by: 0.52, bl: 0.28, hy: 0.12, hz: 0.82, hr: 0.07, beak: 0.06, nr: 0.09 } }]] });
const waterfowl = fam({ cat: 'nature/wildlife', title: 'Generic swan and goose', desc: (v) => `Large waterfowl scale shape, ${v.sx}: rounded body with folded wings and a tail, a long arched neck, head with beak and eyes, and two legs with webbed feet.`, build: bird, vs: [
  ['goose, 30 in long', 10, 30, 22, 0, { sx: 'goose', s: { leg: 0.2, bh: 0.24, by: 0.55, bl: 0.28, hy: 0.14, hz: 0.82, hr: 0.06, beak: 0.1, nr: 0.08, neck: 0.4 } }],
  ['swan, 42 in long', 14, 42, 34, 0, { sx: 'swan', s: { leg: 0.12, bh: 0.2, by: 0.55, bl: 0.3, hy: 0.1, hz: 0.9, hr: 0.045, beak: 0.08, nr: 0.06, neck: 0.5 } }]] });

/** A termite mound: a tall earth spire with buttresses and a rough crust. */
function termite(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), n = v.spires;
  lump(a, cx, cy, Z0 + H * 0.06, W * 0.48, D * 0.48, H * 0.12, v.seed, 0.12, 16, 5, Z0);
  for (let s = 0; s < n; s++) {
    const th = n > 1 ? s / n * 6.28 + 0.4 : 0, off = n > 1 ? W * 0.2 : 0, x = cx + m.cos(th) * off, y = cy + m.sin(th) * off, h = H * (s === 0 ? 1 : 0.62 + R() * 0.25), r0 = W * (n > 1 ? 0.2 : 0.4);
    const lv = [0, 0.3, 0.62, 0.86, 1].map((f, i) => ({ z: Z0 + (h - 12) * f, poly: ngon(x + m.sin(f * 4) * r0 * 0.1, y, r0 * [1, 0.7, 0.5, 0.32, 0.12][i], r0 * [1, 0.7, 0.5, 0.32, 0.12][i], 10, 0, rng(v.seed + s * 9 + i), 0.18) }));
    lofts(a, lv);
    for (let k = 0; k < 5; k++) { const ph = k / 5 * 6.28 + s, z1 = Z0 + h * (0.3 + R() * 0.3); a.tube([[x + m.cos(ph) * r0 * 0.9, y + m.sin(ph) * r0 * 0.9, Z0 + 4], [x + m.cos(ph) * r0 * 0.5, y + m.sin(ph) * r0 * 0.5, z1]], [r0 * 0.14, r0 * 0.05], 5); }
    a.circ(x, y, r0, 'EQUIP'); a.circ(x, y, r0 * 0.4, 'EQUIP-DETAIL');
  }
  for (let i = 0; i < 5; i++) { const th = R() * 6.28; lump(a, cx + m.cos(th) * W * 0.44, cy + m.sin(th) * D * 0.44, Z0 + 4, 10, 10, 6, v.seed + i, 0.2, 6, 4, Z0); }
  a.log('Added the low earth apron, ' + n + ' tall tapering spire' + (n > 1 ? 's' : '') + ' with a rough crust and curved buttress ridges (plan and 3D).');
}
const termites = fam({ cat: 'nature/wildlife', title: 'Generic termite mound', desc: (v) => `Termite mound, ${v.hf} ft: a low earth apron and ${v.spires === 1 ? 'a tall tapering spire' : v.spires + ' spires of different heights'} with a rough crust and buttress ridges.`, build: termite, vs: [['single spire, 3 ft', 36, 36, 36, 0, { seed: 1, spires: 1, hf: 3 }], ['cathedral mound, 8 ft', 96, 96, 96, 0, { seed: 2, spires: 4, hf: 8 }]] });

/** A bird feeder: a pole with a platform, hopper or hanging tube. v.kind platform | hopper | tube */
function feeder(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.cyl(cx, cy, Z0, Z0 + 6, W * 0.2, 12);
  if (v.kind === 'tube') {
    a.tube([[cx, cy, Z0], [cx, cy, Z0 + H * 0.5], [cx, cy, Z1 - W * 0.4]], [W * 0.03, W * 0.025, W * 0.022], 8);
    arcTube(a, [cx, cy, Z1 - W * 0.4], [cx + W * 0.36, cy, Z1 - W * 0.5], W * 0.25, [W * 0.02, W * 0.016, W * 0.014, W * 0.012, W * 0.012], 6, 6);
    const hx = cx + W * 0.36; a.cyl(hx, cy, Z1 - W * 0.62, Z1 - W * 0.5, W * 0.01, 6); a.cyl(hx, cy, Z1 - H * 0.5, Z1 - W * 0.6, W * 0.07, 14); a.cone(hx, cy, Z1 - W * 0.6, Z1 - W * 0.5, W * 0.09, W * 0.02, 14);
    for (let k = 0; k < 3; k++) { a.cyl(hx, cy, Z1 - H * 0.5 + k * H * 0.08, Z1 - H * 0.5 + k * H * 0.08 + 4, W * 0.08, 14); a.tube([[hx, cy - W * 0.07, Z1 - H * 0.5 + k * H * 0.08 + 2], [hx, cy - W * 0.15, Z1 - H * 0.5 + k * H * 0.08 + 2]], [W * 0.012, W * 0.012], 4); }
    a.cyl(hx, cy, Z1 - H * 0.5 - 6, Z1 - H * 0.5, W * 0.09, 14);
  } else {
    a.tube([[cx, cy, Z0], [cx, cy, Z0 + H * 0.6]], [W * 0.035, W * 0.03], 8);
    a.box(cx - W * 0.46, cy - D * 0.46, Z0 + H * 0.6, cx + W * 0.46, cy + D * 0.46, Z0 + H * 0.6 + 8);
    for (const [x0, y0, x1, y1] of [[-0.46, -0.46, 0.46, -0.4], [-0.46, 0.4, 0.46, 0.46], [-0.46, -0.46, -0.4, 0.46], [0.4, -0.46, 0.46, 0.46]]) a.box(cx + W * x0, cy + D * y0, Z0 + H * 0.6 + 8, cx + W * x1, cy + D * y1, Z0 + H * 0.6 + 22);
    for (let i = 0; i < 10; i++) { const th = i * 2.4, rr = 0.1 + 0.3 * ((i * 7) % 10) / 10; a.ell(cx + m.cos(th) * W * rr, cy + m.sin(th) * D * rr, Z0 + H * 0.6 + 12, 8, 6, 4, 5, 4); }
    if (v.kind === 'hopper') { const zb = Z0 + H * 0.6 + 12; a.box(cx - W * 0.2, cy - D * 0.2, zb, cx + W * 0.2, cy + D * 0.2, zb + H * 0.22); a.box(cx - W * 0.2, cy - D * 0.2 - 2, zb + 12, cx + W * 0.2, cy - D * 0.2, zb + H * 0.2); prismY(a, [[cx + W * 0.3, zb + H * 0.22], [cx - W * 0.3, zb + H * 0.22], [cx, Z1]], cy - D * 0.3, cy + D * 0.3); a.rect(cx - W * 0.2, cy - D * 0.2, cx + W * 0.2, cy + D * 0.2, 'EQUIP-DETAIL'); }
  }
  a.rect(cx - W * 0.46, cy - D * 0.46, cx + W * 0.46, cy + D * 0.46, v.kind === 'tube' ? 'EQUIP-DETAIL' : 'EQUIP'); a.circ(cx, cy, W * 0.03, 'EQUIP-DETAIL'); if (v.kind === 'tube') a.circ(cx + W * 0.36, cy, W * 0.08, 'EQUIP');
  a.log('Added the ' + (v.kind === 'tube' ? 'pole with a curved hook and a hanging seed tube with three perches' : v.kind === 'hopper' ? 'pole, the seed tray with a rim and seeds, a seed hopper and a pitched roof' : 'pole and the seed tray with a low rim and scattered seed') + ' (plan and 3D).');
}
const feeders = fam({ cat: 'nature/wildlife', title: 'Generic garden bird feeder', desc: (v) => `Garden bird feeder, ${v.kind === 'tube' ? 'a pole with a curved hook and a hanging seed tube with perches' : v.kind === 'hopper' ? 'a pole with a seed tray, a seed hopper and a pitched roof' : 'a pole with a rimmed seed tray'}.`, build: feeder, vs: [
  ['platform tray on pole, 54 in', 16, 16, 54, 0, { kind: 'platform' }], ['hopper with roof, 66 in', 20, 16, 66, 0, { kind: 'hopper' }], ['hanging tube on hook, 72 in', 24, 8, 72, 0, { kind: 'tube' }]] });

/** A beaver lodge: a domed pile of sticks and mud in water. */
function lodge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), wl = Z0 + H * 0.18;
  a.cyl(cx, cy, Z0, wl, W * 0.5 - 2, 28); a.cyl(cx, cy, wl, wl + 3, W * 0.48, 28);
  lump(a, cx, cy, wl, W * 0.34, D * 0.34, H * 0.7, v.seed, 0.1, 18, 8, wl);
  for (let i = 0; i < v.sticks; i++) { const th = R() * 6.28, f = R(), el = R() * 1.2 + 0.1, rr = W * (0.1 + f * 0.26), x = cx + m.cos(th) * rr, y = cy + m.sin(th) * rr, h = wl + H * 0.68 * m.max(0.05, 1 - (rr / (W * 0.4)) ** 2) * 0.9, L = W * (0.1 + R() * 0.1), ph = th + (R() - 0.5) * 1.5; a.tube([[x - m.cos(ph) * L * 0.5, y - m.sin(ph) * L * 0.5, h - L * 0.1 * el], [x + m.cos(ph) * L * 0.5, y + m.sin(ph) * L * 0.5, h + L * 0.1 * el]], [W * 0.006, W * 0.006], 4); }
  a.cyl(cx + W * 0.3, cy - D * 0.05, wl, wl + H * 0.07, W * 0.05, 8); a.ell(cx + W * 0.34, cy - D * 0.2, wl + H * 0.01, W * 0.05, W * 0.05, H * 0.03, 6, 4);
  a.circ(cx, cy, W * 0.5, 'EQUIP'); a.poly(blobPoly(cx, cy, W * 0.34, D * 0.34, v.seed, 20, 0.1), 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.15, 'EQUIP-DETAIL');
  a.log('Added the round pool of water, the domed lodge with mud capping, ' + v.sticks + ' interwoven sticks and a stick-and-mud entrance ramp with a food cache (plan and 3D).');
}
const lodges = fam({ cat: 'nature/wildlife', title: 'Generic beaver lodge', desc: (v) => `Beaver lodge, ${v.wf} ft across: a domed pile of ${v.sticks} interwoven sticks and mud rising from a round pool, with an entrance ramp.`, build: lodge, vs: [['6 ft across', 72, 72, 40, 0, { seed: 1, sticks: 70, wf: 6 }], ['10 ft across', 120, 120, 66, 0, { seed: 2, sticks: 110, wf: 10 }]] });

/** A hedgehog: a rounded body of spines, a pointed face, small ears and short legs. */
function hedgehog(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), by = cy + D * 0.08, rx = W * 0.4, ry = D * 0.34, rz = H * 0.5, bz = Z0 + H * 0.4;
  a.ell(cx, by, bz, rx, ry, rz, 14, 8); a.ell(cx, YF + D * 0.2, Z0 + H * 0.3, W * 0.2, D * 0.2, H * 0.22, 10, 6); a.cone(cx, YF + D * 0.07, Z0 + H * 0.28, Z0 + H * 0.3, W * 0.05, W * 0.02, 6);
  a.ell(cx, YF + D * 0.05, Z0 + H * 0.28, W * 0.035, D * 0.03, H * 0.03, 6, 4);
  for (const s of [-1, 1]) { a.ell(cx + s * W * 0.14, YF + D * 0.3, Z0 + H * 0.46, W * 0.05, D * 0.03, H * 0.07, 6, 4); a.ell(cx + s * W * 0.1, YF + D * 0.14, Z0 + H * 0.36, W * 0.025, D * 0.02, H * 0.03, 5, 4); a.cyl(cx + s * W * 0.28, by - ry * 0.4, Z0, Z0 + H * 0.15, W * 0.06, 6); a.cyl(cx + s * W * 0.26, by + ry * 0.5, Z0, Z0 + H * 0.15, W * 0.06, 6); }
  for (let i = 0; i < v.spines; i++) { const u = R() * PI * 2, vv = m.acos(1 - R() * 0.95), x = cx + m.sin(vv) * m.cos(u) * rx * 0.98, y = by + m.sin(vv) * m.sin(u) * ry * 0.98 + ry * 0.1, z = bz + m.cos(vv) * rz * 0.95; if (y < YF + D * 0.28) continue; const L = H * 0.12; a.cone(x, y, z, z + L * m.cos(vv) * 0.8 + L * 0.3, W * 0.012, 0.5, 4); }
  a.ellp(cx, by, rx, ry); a.ellp(cx, YF + D * 0.2, W * 0.2, D * 0.2, 'EQUIP-DETAIL'); for (let i = 0; i < 12; i++) { const th = i / 12 * 6.28; a.line(cx + m.cos(th) * rx * 0.6, by + m.sin(th) * ry * 0.6, cx + m.cos(th) * rx, by + m.sin(th) * ry, 'EQUIP-DETAIL'); }
  a.log('Added the rounded body covered in ' + v.spines + ' spines, the pointed face with a nose and eyes, small ears and four short legs (plan and 3D).');
}
const hedgehogs = fam({ cat: 'nature/wildlife', title: 'Generic hedgehog', desc: (v) => `Hedgehog scale shape, ${v.sz}: rounded body covered in spines, a pointed face with a nose and eyes, small ears and four short legs.`, build: hedgehog, vs: [['juvenile, 5 in', 4, 6, 3, 0, { seed: 1, spines: 70, sz: '5 in' }], ['adult, 9 in', 6, 9, 4.5, 0, { seed: 2, spines: 110, sz: '9 in' }]] });

export default [menhirs, dolmens, rockArches, hoodoos, bwalls, screes, basalts, mesas, crystalF, knolls, zens,
  willows, birches, umbrellas, cypresses, bamboos, fruitTrees, saguaros, barrels, grasses, topiaries, snags, treeFerns,
  pumps, wallFountains, rills, stoneBridges, plankBridges, logBridges, sluices, wheels, springs, jets, pebbleF, lilyTubs, troughs,
  pigs, goats, foxes, rabbits, donkeys, moose, camels, turtles, frogs, snakes, owls, hens, waterfowl, termites, feeders, lodges, hedgehogs];

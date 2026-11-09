/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, household: 150 more kitchenware, cleaning, storage and decor pieces. Original geometry; generic sizes. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = m.PI;
const mmi = (n) => n * IN;
// ------------------------------------------------------------------------------------------ helpers
const quad = (a, p0, p1, p2, p3) => { a.t.push([p0, p1, p2], [p0, p2, p3]); return a; };
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
/** rounded rectangle outline, n points per corner */
function rrect(cx, cy, w, d, r, n = 4) {
  r = m.min(r, w / 2 - 0.01, d / 2 - 0.01); const pts = [];
  for (const [x, y, a0] of [[cx + w / 2 - r, cy + d / 2 - r, 0], [cx - w / 2 + r, cy + d / 2 - r, 90], [cx - w / 2 + r, cy - d / 2 + r, 180], [cx + w / 2 - r, cy - d / 2 + r, 270]])
    for (let i = 0; i <= n; i++) { const t = ((a0 + (90 * i) / n) * PI) / 180; pts.push([x + r * m.cos(t), y + r * m.sin(t)]); }
  return pts;
}
function ellPoly(cx, cy, rx, ry, n = 32) { const p = []; for (let i = 0; i < n; i++) { const t = (i / n) * 2 * PI; p.push([cx + rx * m.cos(t), cy + ry * m.sin(t)]); } return p; }
/** a hollow extrusion between two outlines with the same point count (walls inside and out, rim on top, floor underneath) */
function ringPoly(a, outer, inner, z0, z1) {
  const n = outer.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, o0 = outer[i], o1 = outer[j], i0 = inner[i], i1 = inner[j];
    quad(a, [...o0, z0], [...o1, z0], [...o1, z1], [...o0, z1]);
    quad(a, [...o0, z1], [...o1, z1], [...i1, z1], [...i0, z1]);
    quad(a, [...i1, z0], [...i0, z0], [...i0, z1], [...i1, z1]);
  }
  return a;
}
/** surface of revolution about a vertical axis through (cx, cy): prof = [[radius, z], …] in order; a closed profile makes a hollow solid */
function revolve(a, cx, cy, prof, seg = 20) {
  const rings = prof.map(([r, z]) => { const ring = []; for (let k = 0; k < seg; k++) { const t = (k / seg) * 2 * PI; ring.push([cx + r * m.cos(t), cy + r * m.sin(t), z]); } return ring; });
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < seg; k++) {
    const k2 = (k + 1) % seg, A = rings[i][k], B = rings[i + 1][k], C = rings[i + 1][k2], D = rings[i][k2];
    if (prof[i][0] < 0.01) a.t.push([A, C, B]); else if (prof[i + 1][0] < 0.01) a.t.push([A, C, D]); else quad(a, A, D, C, B);
  }
  return a;
}
/** surface of revolution about a horizontal axis along Y through (cx, cz): prof = [[radius, t]], t = distance out from y0 toward the front (−Y) */
function revolveY(a, cx, cz, y0, prof, seg = 20) {
  const rings = prof.map(([r, t]) => { const ring = []; for (let k = 0; k < seg; k++) { const u = (k / seg) * 2 * PI; ring.push([cx + r * m.cos(u), y0 - t, cz + r * m.sin(u)]); } return ring; });
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < seg; k++) {
    const k2 = (k + 1) % seg, A = rings[i][k], B = rings[i + 1][k], C = rings[i + 1][k2], D = rings[i][k2];
    if (prof[i][0] < 0.01) a.t.push([A, B, C]); else if (prof[i + 1][0] < 0.01) a.t.push([A, C, D]); else quad(a, A, B, C, D);
  }
  return a;
}
/** a closed loop of tube (a ring) in a horizontal plane at z */
function loop(a, cx, cy, r, z, tr, seg = 28, ts = 6) { const pts = []; for (let i = 0; i <= seg; i++) { const t = (i / seg) * 2 * PI; pts.push([cx + r * m.cos(t), cy + r * m.sin(t), z]); } return a.tube(pts, pts.map(() => tr), ts); }
/** a smooth tube through bezier-ish arc points */
function arcPts(p0, p1, p2, n = 10) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1], u * u * p0[2] + 2 * u * t * p1[2] + t * t * p2[2]]); } return o; }
/** a tube along a planar path with a fixed frame (no twisting where the path turns vertical); falls back to a.tube for straight or non-planar paths */
function sweep(a, pts, rads, seg = 8) {
  const n = pts.length, p0 = pts[0], pm = pts[n >> 1], pl = pts[n - 1];
  const A = [pm[0] - p0[0], pm[1] - p0[1], pm[2] - p0[2]], B = [pl[0] - p0[0], pl[1] - p0[1], pl[2] - p0[2]];
  let N = [A[1] * B[2] - A[2] * B[1], A[2] * B[0] - A[0] * B[2], A[0] * B[1] - A[1] * B[0]]; const nl = m.hypot(...N);
  if (n < 3 || nl < 1e-6 * m.hypot(...A) * m.hypot(...B) + 1e-9) return a.tube(pts, rads, seg);
  N = N.map((x) => x / nl);
  const rings = []; let bad = false;
  for (let i = 0; i < n; i++) {
    const pr = pts[m.max(0, i - 1)], nx = pts[m.min(n - 1, i + 1)];
    let t = [nx[0] - pr[0], nx[1] - pr[1], nx[2] - pr[2]]; const tl = m.hypot(...t) || 1; t = t.map((x) => x / tl);
    let w = [t[1] * N[2] - t[2] * N[1], t[2] * N[0] - t[0] * N[2], t[0] * N[1] - t[1] * N[0]]; const wl = m.hypot(...w);
    if (wl < 0.6) bad = true; w = w.map((x) => x / (wl || 1));
    const ring = []; for (let k = 0; k < seg; k++) { const u = (k / seg) * 2 * PI, c = m.cos(u) * rads[i], s = m.sin(u) * rads[i]; ring.push([pts[i][0] + N[0] * c + w[0] * s, pts[i][1] + N[1] * c + w[1] * s, pts[i][2] + N[2] * c + w[2] * s]); }
    rings.push(ring);
  }
  if (bad) return a.tube(pts, rads, seg);
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < seg; k++) { const k2 = (k + 1) % seg; a.t.push([rings[i][k], rings[i + 1][k], rings[i + 1][k2]], [rings[i][k], rings[i + 1][k2], rings[i][k2]]); }
  for (const [ring, c] of [[rings[0], pts[0]], [rings[n - 1], pts[n - 1]]]) for (let k = 0; k < seg; k++) a.t.push([c, ring[k], ring[(k + 1) % seg]]);
  return a;
}
const screwHead = (a, x, z, y, r = 4) => revolveY(a, x, z, y, [[0, 0], [r, 0], [r, 2], [0, 2.5]], 8);
/** a tapered hollow wall between two outline pairs (outer and inner at z0, outer and inner at z1); top = also the rim strip at z1 */
function ringLoft(a, o0, i0, z0, o1, i1, z1, top = false) {
  const n = o0.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    quad(a, [...o0[i], z0], [...o0[j], z0], [...o1[j], z1], [...o1[i], z1]);
    quad(a, [...i0[j], z0], [...i0[i], z0], [...i1[i], z1], [...i1[j], z1]);
    if (top) quad(a, [...o1[i], z1], [...o1[j], z1], [...i1[j], z1], [...i1[i], z1]);
  }
  return a;
}
/** a bowl shell: mk(s) is the outline at scale s; prof(t) the outer scale from the bottom (t = 0) to the rim (t = 1); th the wall as a scale fraction */
function shellLoft(a, mk, zA, zB, prof, th, n = 8, rim = true) {
  for (let k = 0; k < n; k++) {
    const t0 = k / n, t1 = (k + 1) / n, s0 = prof(t0), s1 = prof(t1);
    ringLoft(a, mk(s0), mk(s0 - th), zA + (zB - zA) * t0, mk(s1), mk(s1 - th), zA + (zB - zA) * t1, rim && k === n - 1);
  }
  return a;
}
/** a hollow vessel: outer = [[radius, z], …] from the base up; wall thickness; the base is solid for one wall thickness */
function vessel(a, cx, cy, outer, wall, seg = 28, closedTop = false) {
  const z0 = outer[0][1], inner = outer.slice().reverse().map(([r, z], i, arr) => [m.max(r - wall, 0.01), i === arr.length - 1 ? z0 + wall : z]);
  const prof = [[0.01, z0], ...outer, ...(closedTop ? [] : inner), [0.01, z0 + wall]];
  return revolve(a, cx, cy, closedTop ? [[0.01, z0], ...outer, [0.01, outer[outer.length - 1][1]]] : prof, seg);
}
/** a quarter-ellipse bowl profile from the base ring (rb) to the rim (r) over height h */
function bowlProf(rb, r, h, z0, n = 8) { const o = [[rb, z0]]; for (let i = 1; i <= n; i++) { const q = (i / n) * PI / 2; o.push([rb + (r - rb) * m.sin(q), z0 + h * (1 - m.cos(q))]); } return o; }
const handleLoop = (a, x, y0, y1, z0, z1, r = 9, bulge = 40) => a.tube(arcPts([x, y0, z0], [x, (y0 + y1) / 2 - bulge, (z0 + z1) / 2], [x, y1, z1], 10), new Array(11).fill(r), 8);


// ------------------------------------------------------------------------------------------ small shared parts
/** a ring in the X–Z plane (vertical) at y, as a thin tube */
const ringXZ = (a, cx, zc, y, r, tr = 2.5, seg = 28) => { const pts = []; for (let i = 0; i <= seg; i++) { const t = (i / seg) * 2 * PI; pts.push([cx + r * m.cos(t), y, zc + r * m.sin(t)]); } return a.tube(pts, pts.map(() => tr), 5); };
/** a hollow glass dome open at the bottom: rim at (r, zb), height dh, wall w */
function domeShell(a, cx, cy, zb, r, dh, w = 2.2, seg = 32) {
  const O = [[r, zb], [r, zb + dh * 0.45], [r * 0.9, zb + dh * 0.72], [r * 0.62, zb + dh * 0.92], [r * 0.25, zb + dh * 0.99], [0.01, zb + dh]];
  const I = O.slice(0, -1).map(([rr, z]) => [m.max(rr - w, 0.01), z - w]).reverse();
  revolve(a, cx, cy, [...O, ...I], seg);
  loop(a, cx, cy, r - w / 2, zb + 1.2, w * 0.7, seg, 4);
}
/** a planter pot with soil and a clump of leaf blades; r0 = base radius, r1 = rim radius */
function potPlant(a, cx, cy, z, r0, r1, h, n = 7, lh = 160) {
  vessel(a, cx, cy, [[r0, z], [r1, z + h]], 2.4, 20);
  loop(a, cx, cy, r1, z + h - 2, 3, 20, 4);
  a.cyl(cx, cy, z + h - 12, z + h - 10, r1 - 3, 18);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 2 * PI + 0.3, ux = m.cos(t), uy = m.sin(t), L = lh * (0.7 + 0.3 * ((i * 5) % 3) / 2);
    a.tube([[cx + 4 * ux, cy + 4 * uy, z + h - 11], [cx + r1 * 0.45 * ux, cy + r1 * 0.45 * uy, z + h + L * 0.55], [cx + r1 * 0.95 * ux, cy + r1 * 0.95 * uy, z + h + L * 0.85]], [3, 5, 1.5], 4);
  }
}
/** a hollow box open at the top: outer x0..x1, y0..y1, z0..z1, wall t, floor f */
function openBox(a, x0, y0, z0, x1, y1, z1, t = 3, f = 3) {
  a.box(x0, y0, z0, x1, y1, z0 + f);
  a.box(x0, y0, z0 + f, x0 + t, y1, z1); a.box(x1 - t, y0, z0 + f, x1, y1, z1);
  a.box(x0 + t, y0, z0 + f, x1 - t, y0 + t, z1); a.box(x0 + t, y1 - t, z0 + f, x1 - t, y1, z1);
}
/** a wall in the plane y = const (spanning x and z) with a rectangular hole */
function wallHoleY(a, y0, y1, x0, x1, z0, z1, hx0, hx1, hz0, hz1) {
  a.box(x0, y0, z0, x1, y1, hz0); a.box(x0, y0, hz1, x1, y1, z1);
  a.box(x0, y0, hz0, hx0, y1, hz1); a.box(hx1, y0, hz0, x1, y1, hz1);
}
const tiltPoly = (yp, zp, th, d0, d1, v0, v1) => [[d0, v0], [d1, v0], [d1, v1], [d0, v1]].map(([d, v]) => [yp + v * m.sin(th) - d * m.cos(th), zp + v * m.cos(th) + d * m.sin(th)]);

// ------------------------------------------------------------------------------------------ kitchenware
function colander(a, v) {
  const ear = 1.35 * IN, R = a.W / 2 - ear, cx = a.cx, cy = a.cy, z0 = a.Z0, h = a.H, foot = 16, rb = R * 0.42;
  vessel(a, cx, cy, bowlProf(rb, R, h - foot, z0 + foot, 8), 2.6, 32);
  ringPoly(a, ellPoly(cx, cy, rb + 5, rb + 5, 24), ellPoly(cx, cy, rb - 2, rb - 2, 24), z0, z0 + foot + 2);
  loop(a, cx, cy, R, z0 + h - 1.5, 2.8, 32, 5);
  for (const s of [-1, 1]) ringPoly(a, rrect(cx + s * (R + ear / 2 - 4), cy, ear + 8, 40, 14, 4), rrect(cx + s * (R + ear / 2 - 4), cy, ear - 14, 16, 6, 4), z0 + h - 9, z0 + h - 5);
  for (const [f, n] of [[0.18, 6], [0.4, 12], [0.62, 18], [0.84, 24]]) for (let i = 0; i < n; i++) { const t = (i / n) * 2 * PI + f; a.circ(cx + R * f * m.cos(t), cy + R * f * m.sin(t), 2.4, 'EQUIP-DETAIL'); }
  a.circ(cx, cy, R); a.circ(cx, cy, rb + 5, 'EQUIP-HIDDEN');
  for (const s of [-1, 1]) a.rect(cx + s * R + (s > 0 ? 0 : -ear), cy - 20, cx + s * R + (s > 0 ? ear : 0), cy + 20);
  a.log('Added the bowl on a pedestal ring with a rolled rim, two flat ear handles with hanging holes, and the hole pattern in the plan (plan and 3D).');
}
function teapot(a, v) {
  const R = m.min(a.D / 2 - 2, a.W / 3.2), bx = a.X0 + R * 1.62, cy = a.cy, z0 = a.Z0, H = a.H, hb = H * 0.7;
  a.cyl(bx, cy, z0, z0 + 6, R * 0.5, 24);
  revolve(a, bx, cy, [[0.01, z0 + 6], [R * 0.52, z0 + 6], [R * 0.8, z0 + hb * 0.12], [R, z0 + hb * 0.42], [R * 0.93, z0 + hb * 0.78], [R * 0.62, z0 + hb * 0.96], [R * 0.56, z0 + hb], [0.01, z0 + hb]], 32);
  revolve(a, bx, cy, [[R * 0.6, z0 + hb], [R * 0.5, z0 + hb + H * 0.06], [R * 0.2, z0 + hb + H * 0.1], [0.01, z0 + hb + H * 0.11]], 28);
  a.cyl(bx, cy, z0 + hb + H * 0.1, z0 + hb + H * 0.15, R * 0.07, 10); a.ell(bx, cy, z0 + hb + H * 0.19, R * 0.13, R * 0.13, H * 0.055, 10, 6);
  a.tube([[bx - R * 0.82, cy, z0 + hb * 0.22], [bx - R * 1.2, cy, z0 + hb * 0.5], [bx - R * 1.52, cy, z0 + hb * 0.88]], [R * 0.2, R * 0.15, R * 0.07], 14);
  sweep(a, arcPts([bx + R * 0.92, cy, z0 + hb * 0.86], [bx + R * 2.0, cy, z0 + hb * 0.55], [bx + R * 0.97, cy, z0 + hb * 0.18]), new Array(11).fill(R * 0.07), 8);
  a.circ(bx, cy, R); a.circ(bx, cy, R * 0.6, 'EQUIP-DETAIL'); a.circ(bx, cy, R * 0.13, 'EQUIP-DETAIL');
  a.poly([[bx - R * 0.7, cy - R * 0.2], [bx - R * 1.52, cy - R * 0.07], [bx - R * 1.52, cy + R * 0.07], [bx - R * 0.7, cy + R * 0.2]], 'EQUIP');
  a.rect(bx + R * 0.9, cy - R * 0.07, bx + R * 1.55, cy + R * 0.07, 'EQUIP');
  a.log('Added the round-bellied pot on a foot ring, the domed lid with a knob, a tapering spout and an arched handle (plan and 3D).');
}
function frenchPress(a, v) {
  const R = v.dia * IN / 2, bx = a.X0 + R + 8, cy = a.cy, z0 = a.Z0, hg = a.H - 2.8 * IN, zt = z0 + hg;
  vessel(a, bx, cy, [[R, z0 + 8], [R, zt]], 2.2, 32);
  ringPoly(a, ellPoly(bx, cy, R + 5, R + 5, 32), ellPoly(bx, cy, R - 1, R - 1, 32), z0, z0 + 12);
  ringPoly(a, ellPoly(bx, cy, R + 5, R + 5, 32), ellPoly(bx, cy, R - 0.5, R - 0.5, 32), zt - 12, zt);
  for (const g of [40, 140, 220, 320]) { const t = (g * PI) / 180; a.cyl(bx + (R + 3) * m.cos(t), cy + (R + 3) * m.sin(t), z0 + 10, zt - 10, 2.4, 6); }
  revolve(a, bx, cy, [[R + 4, zt], [R, zt + 9], [R * 0.35, zt + 15], [0.01, zt + 17]], 28);
  a.box(bx - R - 5, cy - 14, zt - 5, bx - R + 8, cy + 14, zt + 3);
  a.cyl(bx, cy, zt + 15, a.Z1 - 30, 4, 10); a.cyl(bx, cy, a.Z1 - 34, a.Z1 - 26, 12, 14); a.ell(bx, cy, a.Z1 - 14, 17, 17, 14, 12, 6);
  sweep(a, arcPts([bx + R + 3, cy, z0 + hg * 0.8], [bx + R + 1.8 * IN, cy, z0 + hg * 0.5], [bx + R + 3, cy, z0 + hg * 0.14]), new Array(11).fill(7), 8);
  a.circ(bx, cy, R + 5); a.circ(bx, cy, R - 1, 'EQUIP-DETAIL'); a.circ(bx, cy, 12, 'EQUIP-DETAIL'); a.rect(bx + R, cy - 7, a.X1, cy + 7);
  a.log('Added the glass beaker in a metal frame with a base ring and four straps, the lid, a plunger rod with a knob, a pouring notch and a side handle (plan and 3D).');
}
function wok(a, v) {
  const R = v.dia * IN / 2, cx = a.cx, cy = -(R + 34), z0 = a.Z0, BH = v.bh ? v.bh * IN : a.H, bz = z0 + BH * 0.14, hb = BH * 0.84;
  vessel(a, cx, cy, bowlProf(R * 0.26, R, hb, bz, 9), 3, 32);
  loop(a, cx, cy, R, bz + hb - 1, 3, 32, 5);
  ringPoly(a, ellPoly(cx, cy, R * 0.44, R * 0.44, 28), ellPoly(cx, cy, R * 0.41, R * 0.41, 28), z0, z0 + BH * 0.3);
  ringPoly(a, ellPoly(cx, cy, R * 0.5, R * 0.5, 28), ellPoly(cx, cy, R * 0.44, R * 0.44, 28), z0, z0 + 5);
  a.tube([[cx, cy - R + 8, z0 + BH * 0.85], [cx, cy - R - 50, z0 + BH * 0.87], [cx, -a.D + 6, z0 + BH * 0.89]], [8, 9, 10], 10);
  a.box(cx - 14, cy - R - 10, z0 + BH * 0.82, cx + 14, cy - R + 6, z0 + BH * 0.96);
  ringPoly(a, rrect(cx, cy + R + 14, 50, 30, 10, 4), rrect(cx, cy + R + 14, 28, 12, 5, 4), z0 + BH * 0.9, z0 + BH * 0.9 + 5);
  if (v.lid) { const rz = bz + hb; revolve(a, cx, cy, [[R + 3, rz], [R * 0.85, rz + 14], [R * 0.4, rz + 30], [0.01, rz + 38]], 32); a.cyl(cx, cy, rz + 36, rz + 46, 7, 10); a.ell(cx, cy, rz + 54, 16, 16, 10, 10, 6); }
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.44, 'EQUIP-HIDDEN'); a.rect(cx - 8, -a.D, cx + 8, cy - R); a.rect(cx - 25, cy + R, cx + 25, cy + R + 29, 'EQUIP-DETAIL');
  a.log('Added the round-bottomed bowl on a collar ring stand, a long handle on a bracket and a loop helper handle' + (v.lid ? ', with a domed lid and knob' : '') + ' (plan and 3D).');
}
function casserole(a, v) {
  const lug = 34, rx = (a.W - 2 * lug) / 2, ry = a.D / 2 - 2, cx = a.cx, cy = a.cy, z0 = a.Z0, H = a.H, hb = H * 0.7, mk = (s) => ellPoly(cx, cy, rx * s, ry * s, 36);
  a.prism(mk(0.9), z0, z0 + 8);
  shellLoft(a, mk, z0 + 4, z0 + hb, (t) => 0.9 + 0.1 * t, 0.06, 5);
  ringPoly(a, mk(1.03), mk(0.94), z0 + hb - 10, z0 + hb);
  for (const s of [-1, 1]) ringPoly(a, rrect(cx + s * (rx + lug / 2 - 2), cy, lug + 4, 46, 14, 4), rrect(cx + s * (rx + lug / 2 - 2), cy, lug - 16, 18, 6, 4), z0 + hb - 30, z0 + hb - 24);
  for (let k = 0; k < 6; k++) { const s = 0.99 * m.sqrt(1 - m.pow((k + 0.5) / 6, 2) * 0.88); a.prism(mk(s), z0 + hb + k * H * 0.033, z0 + hb + (k + 1) * H * 0.033); }
  a.cyl(cx, cy, z0 + hb + H * 0.19, z0 + hb + H * 0.23, ry * 0.09, 10); a.ell(cx, cy, z0 + hb + H * 0.265, ry * 0.15, ry * 0.15, H * 0.055, 12, 6);
  a.poly(mk(1.03)); a.poly(mk(0.94), 'EQUIP-DETAIL'); a.poly(mk(0.5), 'EQUIP-DETAIL'); a.circ(cx, cy, ry * 0.15, 'EQUIP-DETAIL');
  for (const s of [-1, 1]) a.rect(cx + s * (rx + lug / 2 - 2) - (lug + 4) / 2, cy - 23, cx + s * (rx + lug / 2 - 2) + (lug + 4) / 2, cy + 23, 'EQUIP');
  a.log('Added the oval dish with a rolled rim, two lug handles with finger holes, and a stepped domed lid with a knob (plan and 3D).');
}
function rollingPin(a, v) {
  const L = v.body * IN, hl = 4.4 * IN, r = 1.15 * IN, cx = a.cx, cy = a.cy, z0 = a.Z0, zc = z0 + 16 + r;
  a.box(cx - L * 0.45, cy - 40, z0, cx + L * 0.45, cy + 40, z0 + 8);
  for (const s of [-1, 1]) { const x = cx + s * L * 0.32; prismX(a, [[cy + 2, z0 + 8], [cy + 44, z0 + 8], [cy + 44, z0 + 30], [cy + 2, z0 + 17]], x - 14, x + 14); prismX(a, [[cy - 44, z0 + 8], [cy - 2, z0 + 8], [cy - 2, z0 + 17], [cy - 44, z0 + 30]], x - 14, x + 14); }
  a.xcyl(cx - L / 2, cx + L / 2, cy, zc, r, 28);
  for (const s of [-1, 1]) { const xe = cx + s * L / 2; a.tube([[xe, cy, zc], [xe + s * 14, cy, zc], [xe + s * hl * 0.55, cy, zc], [xe + s * hl, cy, zc]], [r * 0.5, r * 0.5, r * 0.6, r * 0.5], 14); a.cyl(xe + s * (hl * 0.7), cy, zc - 1, zc + 1, 1, 3); a.xcyl(xe + s * hl, xe + s * (hl + 4), cy, zc, r * 0.5, 14); a.xcyl(xe, xe + s * 4, cy, zc, r * 1.04, 28); }
  a.rect(cx - L / 2 - hl - 4, cy - r, cx + L / 2 + hl + 4, cy + r); a.rect(cx - L * 0.45, cy - 40, cx + L * 0.45, cy + 40, 'EQUIP-DETAIL');
  for (const s of [-1, 1]) a.line(cx + s * L / 2, cy - r, cx + s * L / 2, cy + r);
  a.log('Added the barrel with two turned handles and pins, lying on a base rail with two cradle blocks (plan and 3D).');
}
function crockTool(a, cx, cy, ang, rb, rt, zb, zt, kind) {
  const ux = m.cos(ang), uy = m.sin(ang), px = -uy, py = ux, B = [cx + rb * ux, cy + rb * uy, zb], T = [cx + rt * ux, cy + rt * uy, zt];
  const dx = T[0] - B[0], dy = T[1] - B[1], dz = T[2] - B[2], dl = m.hypot(dx, dy, dz), Dv = [dx / dl, dy / dl, dz / dl];
  const at = (t, s = 0) => [T[0] + Dv[0] * t + px * s, T[1] + Dv[1] * t + py * s, T[2] + Dv[2] * t];
  if (kind === 'tongs') { for (const s of [-1, 1]) a.tube([[B[0] + px * 6 * s, B[1] + py * 6 * s, B[2]], at(0, 6 * s), at(80, 14 * s)], [4.5, 4.5, 4.5], 6); return; }
  a.tube([B, T], [8, 8], 8);
  if (kind === 'spoon') a.tube([at(0), at(26), at(56), at(78)], [8, 20, 22, 6], 10);
  else if (kind === 'ladle') { a.tube([at(0), at(58)], [7, 7], 8); a.ell(at(72)[0], at(72)[1], at(72)[2], 30, 30, 20, 12, 6); }
  else if (kind === 'spatula') a.tube([at(10), at(84)], [24, 24], 4);
  else if (kind === 'whisk') for (let k = 0; k < 4; k++) { const f = (k * PI) / 4, s = [px * m.cos(f), py * m.cos(f), m.sin(f)]; for (const g of [-1, 1]) a.tube([at(0), [at(44)[0] + g * s[0] * 20, at(44)[1] + g * s[1] * 20, at(44)[2] + g * s[2] * 20], at(86)], [1.6, 1.6, 1.6], 4); }
}
function utensilCrock(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, hc = v.hc * IN, kinds = ['spoon', 'ladle', 'spatula', 'whisk', 'tongs', 'spoon', 'spatula'];
  vessel(a, cx, cy, [[R * 0.95, z0], [R, z0 + 10], [R, z0 + hc]], 5, 32);
  loop(a, cx, cy, R, z0 + hc - 2, 3.5, 32, 5); loop(a, cx, cy, R * 1.002, z0 + hc * 0.55, 2, 32, 4);
  for (let i = 0; i < v.n; i++) crockTool(a, cx, cy, (i / v.n) * 2 * PI + 0.4, R * 0.12, R * 0.4, z0 + 24, z0 + hc + 28, kinds[i]);
  a.circ(cx, cy, R); a.circ(cx, cy, R - 5, 'EQUIP-DETAIL');
  for (let i = 0; i < v.n; i++) { const t = (i / v.n) * 2 * PI + 0.4; a.circ(cx + R * 0.4 * m.cos(t), cy + R * 0.4 * m.sin(t), 7, 'EQUIP-DETAIL'); }
  a.log('Added the stoneware crock with a rim bead and a band, and ' + v.n + ' standing kitchen tools (spoons, a ladle, a spatula, a whisk, tongs) (plan and 3D).');
}
function dishRack(a, v) {
  const W = a.W, D = a.D, z0 = a.Z0, cx = a.cx, cy = a.cy, zg = z0 + 34;
  ringPoly(a, rrect(cx, cy, W, D, 28, 4), rrect(cx, cy, W - 8, D - 8, 24, 4), z0, z0 + 26); a.prism(rrect(cx, cy, W - 4, D - 4, 26, 4), z0, z0 + 8);
  for (const [x, y] of [[a.X0 + 25, a.YF + 25], [a.X1 - 25, a.YF + 25], [a.X0 + 25, -25], [a.X1 - 25, -25]]) a.cyl(x, y, z0 + 8, zg, 3, 6);
  for (let x = a.X0 + 25; x <= a.X1 - 24; x += 38) a.tube([[x, a.YF + 25, zg], [x, -25, zg]], [1.8, 1.8], 4);
  for (let y = a.YF + 25; y <= -24; y += (D - 50) / 5) a.tube([[a.X0 + 25, y, zg], [a.X1 - 25, y, zg]], [1.8, 1.8], 4);
  const n = m.floor((W * 0.62) / 32);
  for (let k = 0; k < n; k++) { const x = a.X0 + 40 + k * 32; a.tube([[x, a.YF + 30, zg], [x, a.YF + 60, zg + 110], [x, -60, zg + 110], [x, -30, zg]], [2, 2, 2, 2], 5); }
  const cxu = a.X1 - 72; openBox(a, cxu - 45, cy - 45, zg, cxu + 45, cy + 45, zg + 85, 3, 3);
  for (let i = 0; i < 3; i++) a.tube([[cxu - 20 + i * 20, cy, zg + 6], [cxu - 24 + i * 24, cy, zg + 122]], [4, 5], 6);
  a.rect(a.X0, a.YF, a.X1, a.YB); a.rect(a.X0 + 4, a.YF + 4, a.X1 - 4, a.YB - 4, 'EQUIP-DETAIL'); a.rect(cxu - 45, cy - 45, cxu + 45, cy + 45, 'EQUIP-DETAIL');
  for (let k = 0; k < n; k++) a.line(a.X0 + 40 + k * 32, a.YF + 30, a.X0 + 40 + k * 32, -30);
  a.log('Added the drip tray, the wire grid on posts, ' + n + ' plate dividers and a cutlery cup with handles standing in it (plan and 3D).');
}
function cakeStand(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, st = v.st * IN, zp = z0 + st;
  revolve(a, cx, cy, [[0.01, z0], [R * 0.42, z0], [R * 0.42, z0 + 6], [R * 0.2, z0 + 18], [R * 0.1, z0 + 32]], 28);
  a.tube([[cx, cy, z0 + 30], [cx, cy, zp]], [R * 0.1, R * 0.1], 14); a.ell(cx, cy, z0 + st * 0.55, R * 0.17, R * 0.17, R * 0.1, 14, 6);
  revolve(a, cx, cy, [[0.01, zp - 10], [R * 0.3, zp - 9], [R * 0.7, zp - 4], [R, zp - 1], [R, zp + 7], [0.01, zp + 7]], 36);
  loop(a, cx, cy, R, zp + 3, 3.5, 36, 5);
  if (v.dome) {
    const dh = a.Z1 - 22 - (zp + 7);
    domeShell(a, cx, cy, zp + 7, R * 0.88, dh, 2.4, 32); a.cyl(cx, cy, zp + 7 + dh - 2, zp + 7 + dh + 10, 6, 10); a.ell(cx, cy, a.Z1 - 9, 15, 15, 12, 10, 6);
  }
  a.circ(cx, cy, R); if (v.dome) a.circ(cx, cy, R * 0.88, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.42, 'EQUIP-HIDDEN'); a.circ(cx, cy, 14, 'EQUIP-DETAIL');
  a.log('Added the round foot, the turned stem with a node, the rimmed plate' + (v.dome ? ' and the glass dome with a knob' : '') + ' (plan and 3D).');
}
function mortar(a, v) {
  const R = v.dia * IN / 2, cx = a.X0 + R + 8, cy = a.cy, z0 = a.Z0, hm = R * 1.05;
  vessel(a, cx, cy, [[R * 0.62, z0], [R * 0.7, z0 + 8], ...bowlProf(R * 0.68, R, hm - 8, z0 + 8, 8).slice(1)], 8, 32);
  loop(a, cx, cy, R, z0 + hm - 1, 4, 32, 5);
  a.box(cx - R - 6, cy - 16, z0 + hm - 10, cx - R + 6, cy + 16, z0 + hm);
  const th = 25 * PI / 180, L = R * 2.6, B = [cx - R * 0.1, cy, z0 + 18], T = [B[0] + L * m.sin(th), cy, B[2] + L * m.cos(th)];
  a.ell(B[0], cy, B[2] + 4, 22, 22, 26, 12, 6); a.tube([B, [B[0] + L * 0.25 * m.sin(th), cy, B[2] + L * 0.25 * m.cos(th)], T], [14, 14, 17], 12); a.ell(T[0], cy, T[2], 19, 19, 19, 12, 6);
  a.circ(cx, cy, R); a.circ(cx, cy, R - 8, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.64, 'EQUIP-HIDDEN'); a.line(B[0], cy, T[0], cy, 'EQUIP-DETAIL'); a.circ(T[0], cy, 19, 'EQUIP-DETAIL');
  a.log('Added the thick stone-style bowl on a foot with a rolled rim and a pouring lip, and the pestle with a bulb head leaning in it (plan and 3D).');
}
function pepperMill(a, v) {
  const R = v.dia * IN / 2, cx = a.X0 + R + 4, cy = a.cy, z0 = a.Z0, H = a.H, zt = a.Z1 - 22, bt = zt - z0;
  revolve(a, cx, cy, [[0.01, z0], [R * 0.9, z0], [R, z0 + bt * 0.04], [R * 0.84, z0 + bt * 0.22], [R * 0.62, z0 + bt * 0.44], [R * 0.74, z0 + bt * 0.64], [R * 0.6, z0 + bt * 0.76], [R * 0.66, z0 + bt * 0.82], [R * 0.6, z0 + bt * 0.9], [0.01, z0 + bt]], 28);
  loop(a, cx, cy, R * 0.72, z0 + bt * 0.66, 2.4, 28, 5); loop(a, cx, cy, R * 0.62, z0 + bt * 0.86, 2.4, 28, 5);
  a.cyl(cx, cy, zt - 2, zt + 6, R * 0.34, 14);
  const xk = a.X1 - 14; a.tube([[cx, cy, zt + 8], [xk - 10, cy, zt + 8], [xk, cy, zt + 8]], [4, 4, 5], 8); a.cyl(xk, cy, zt + 4, a.Z1, 11, 10);
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.34, 'EQUIP-DETAIL'); a.line(cx, cy, xk, cy); a.circ(xk, cy, 11, 'EQUIP-DETAIL');
  a.log('Added the turned wooden body with grooves, the top nut, and a crank arm with an upright knob (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ cleaning
function robotVac(a, v) {
  const R = a.W / 2, cx = a.cx, z0 = a.Z0, hr = v.hr * IN, dd = v.dock ? 4.6 * IN : 0, cy = a.YF + R;
  revolve(a, cx, cy, [[0.01, z0 + 6], [R * 0.95, z0 + 6], [R, z0 + 14], [R, z0 + hr - 10], [R * 0.95, z0 + hr - 3], [R * 0.8, z0 + hr], [0.01, z0 + hr]], 36);
  const bp = []; for (let i = 0; i <= 16; i++) { const t = PI + (i / 16) * PI; bp.push([cx + R * 1.002 * m.cos(t), cy + R * 1.002 * m.sin(t), z0 + hr * 0.38]); }
  a.tube(bp, bp.map(() => 8), 6);
  a.cyl(cx, cy, z0 + hr - 1, z0 + hr + 1.5, R * 0.3, 20); a.cyl(cx + R * 0.45, cy - R * 0.15, z0 + hr - 1, z0 + hr + 1, 7, 8); a.cyl(cx + R * 0.45, cy + R * 0.15, z0 + hr - 1, z0 + hr + 1, 7, 8);
  if (v.lidar) { a.cyl(cx, cy + R * 0.18, z0 + hr, a.Z1 - 20, R * 0.2, 18); a.cyl(cx, cy + R * 0.18, a.Z1 - 20, a.Z1 - 14, R * 0.17, 18); a.cyl(cx, cy + R * 0.18, a.Z1 - 14, a.Z1, R * 0.12, 14); }
  for (const s of [-1, 1]) a.xcyl(cx + s * R * 0.93, cx + s * R * 0.78, cy + R * 0.1, z0 + 24, 22, 14);
  a.cyl(cx, cy - R * 0.78, z0 + 2, z0 + 18, 14, 10);
  a.cyl(cx + R * 0.7, cy - R * 0.55, z0 + 6, z0 + 11, 9, 10); for (let k = 0; k < 3; k++) { const t = (k * 2 * PI) / 3; a.tube([[cx + R * 0.7, cy - R * 0.55, z0 + 9], [cx + R * 0.7 + 28 * m.cos(t), cy - R * 0.55 + 28 * m.sin(t), z0 + 7]], [1.8, 1.4], 4); }
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.3, 'EQUIP-DETAIL'); a.circ(cx + R * 0.7, cy - R * 0.55, 28, 'EQUIP-DETAIL'); if (v.lidar) a.circ(cx, cy + R * 0.18, R * 0.2, 'EQUIP-DETAIL');
  if (v.dock) {
    prismX(a, [[-dd, z0 + 10], [-2, z0 + 10], [-2, a.Z1], [-dd * 0.45, a.Z1], [-dd * 0.8, z0 + (a.H) * 0.45]], cx - 75, cx + 75);
    a.box(cx - 105, -dd, z0, cx + 105, 0, z0 + 10); a.box(cx - 40, -dd - 0.01 + 6, z0 + 10, cx - 30, -dd + 20, z0 + 24); a.box(cx + 30, -dd + 6, z0 + 10, cx + 40, -dd + 20, z0 + 24);
    a.rect(cx - 105, -dd, cx + 105, 0); a.rect(cx - 75, -dd * 0.8, cx + 75, -2, 'EQUIP-DETAIL');
  }
  a.log('Added the disc body with a front bumper band, side wheels, a front caster, a spinning side brush and a top cover' + (v.lidar ? ', with a raised sensor turret' : '') + (v.dock ? ', parked against its charging dock with contacts' : '') + ' (plan and 3D).');
}
function stickVac(a, v) {
  const W = a.W, D = a.D, cx = a.cx, z0 = a.Z0, H = a.H, ym = -D * 0.4, Z1 = a.Z1;
  a.prism(rrect(cx, a.cy, W, D, 30, 4), z0, z0 + 14);
  a.cyl(cx, -45, z0 + 14, Z1 - 100, 15, 12); a.box(cx - 70, -75, z0 + 14, cx + 70, -15, z0 + 30);
  prismX(a, [[ym - 125, z0 + 14], [ym + 95, z0 + 14], [ym + 95, z0 + 55], [ym + 40, z0 + 70], [ym - 90, z0 + 60], [ym - 125, z0 + 38]], cx - 125, cx + 125);
  a.box(cx - 112, ym - 126, z0 + 24, cx + 112, ym - 120, z0 + 48);
  const zw = z0 + 60, zb = z0 + H * 0.6;
  a.tube([[cx, ym + 30, zw], [cx, ym + 6, zb]], [13, 13], 12);
  a.cyl(cx, ym + 6, zb, zb + 175, 42, 20); a.cyl(cx, ym + 6, zb + 175, zb + 205, 46, 20);
  a.box(cx - 55, ym - 40, zb + 205, cx + 55, ym + 60, zb + 330);
  a.box(cx - 40, ym + 60, zb + 150, cx + 40, ym + 110, zb + 330);
  sweep(a, arcPts([cx, ym - 40, zb + 330], [cx, ym - 150, zb + 360], [cx, ym - 70, zb + 190]), new Array(11).fill(14), 8);
  a.box(cx - 16, -80, zb + 20, cx + 16, ym + 14, zb + 36); a.tube([[cx, -45, Z1 - 100], [cx, -70, Z1 - 80], [cx, -80, Z1 - 60]], [15, 12, 10], 8);
  a.rect(cx - W / 2, a.YF, cx + W / 2, 0); a.circ(cx, ym + 6, 42, 'EQUIP-DETAIL'); a.rect(cx - 125, ym - 125, cx + 125, ym + 95, 'EQUIP-DETAIL'); a.circ(cx, -45, 15, 'EQUIP-DETAIL');
  a.log('Added the floor stand with a base plate and a rear post, the slim wand with a floor head, the dust bin, motor and battery block, and a hoop grip (plan and 3D).');
}
function steamIron(a, v) {
  const W = a.W, D = a.D, cx = a.cx, z0 = a.Z0, Wi = W - 0.7 * IN, L = D - 0.5 * IN, ys = a.YF + 0.25 * IN, ye = -0.25 * IN;
  const mk = (s, wsc) => [[cx, ys + (1 - s) * L * 0.06], [cx + 0.35 * Wi * wsc, ys + 0.2 * L], [cx + 0.5 * Wi * wsc, ys + 0.62 * L], [cx + 0.46 * Wi * wsc, ys + 0.92 * L], [cx + 0.3 * Wi * wsc, ye], [cx - 0.3 * Wi * wsc, ye], [cx - 0.46 * Wi * wsc, ys + 0.92 * L], [cx - 0.5 * Wi * wsc, ys + 0.62 * L], [cx - 0.35 * Wi * wsc, ys + 0.2 * L]];
  a.prism(rrect(cx, a.cy, W, D, 22, 4), z0, z0 + 5);
  a.prism(mk(1, 1), z0 + 5, z0 + 14);
  for (let k = 0; k < 7; k++) { const u = k / 7, ws = 0.96 - 0.3 * u * u, z1 = z0 + 14 + (a.H * 0.56 - 14) * ((k + 1) / 7); a.prism(mk(1 - 0.05 * u, ws), z0 + 14 + (a.H * 0.56 - 14) * (k / 7), z1); }
  const hz = z0 + a.H * 0.5;
  sweep(a, arcPts([cx, ye - L * 0.06, hz], [cx, ys + L * 0.12 + (ye - ys) * 0.2, 2 * (a.Z1 - 14) - hz], [cx, ys + L * 0.55, hz]), new Array(11).fill(13), 8);
  a.ell(cx, ys + L * 0.7, z0 + a.H * 0.62, Wi * 0.2, L * 0.12, a.H * 0.12, 12, 6);
  a.cyl(cx, ys + L * 0.22, z0 + a.H * 0.56, z0 + a.H * 0.64, 14, 14); a.cyl(cx + Wi * 0.14, ys + L * 0.36, z0 + a.H * 0.56, z0 + a.H * 0.6, 8, 10); a.cyl(cx, ys + 8, z0 + a.H * 0.18, z0 + a.H * 0.28, 6, 8);
  a.box(cx - 14, ye - 14, z0 + a.H * 0.22, cx + 14, ye, z0 + a.H * 0.38);
  a.poly(mk(1, 1)); a.poly(mk(1, 0.84), 'EQUIP-DETAIL'); a.rect(a.X0, a.YF, a.X1, 0, 'EQUIP-DETAIL'); a.circ(cx, ys + L * 0.22, 14, 'EQUIP-DETAIL'); a.ellp(cx, ys + L * 0.7, Wi * 0.2, L * 0.12, 'EQUIP-DETAIL');
  a.log('Added the tapered soleplate on a silicone rest mat, the body shell, an arched handle, a water tank, a dial, a button, a spray nozzle and the cord boot (plan and 3D).');
}
function rotaryAirer(a, v) {
  const cx = a.cx, cy = a.cy, z0 = a.Z0, Z1 = a.Z1, S = a.W / 2 - 14, tc = S / m.SQRT2, hz = Z1 - 34;
  a.cyl(cx, cy, z0, z0 + 8, 95, 20); a.cyl(cx, cy, z0 + 8, z0 + 70, 28, 14); a.cyl(cx, cy, z0 + 70, hz, 16, 14);
  a.cyl(cx, cy, hz - 18, hz + 8, 46, 16); a.cyl(cx, cy, hz + 8, Z1, 30, 14); a.ell(cx, cy, Z1 - 4, 22, 22, 8, 10, 4);
  for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    a.tube([[cx + sx * 30, cy + sy * 30, hz], [cx + sx * tc, cy + sy * tc, hz]], [7, 7], 8);
    a.tube([[cx, cy, hz - 260], [cx + sx * tc * 0.55, cy + sy * tc * 0.55, hz - 6]], [5, 5], 6);
    a.cyl(cx + sx * tc, cy + sy * tc, hz - 12, hz + 10, 10, 8);
    a.line(cx, cy, cx + sx * tc, cy + sy * tc);
  }
  for (let k = 0; k < v.lines; k++) {
    const f = 0.3 + (0.7 * k) / m.max(v.lines - 1, 1), e = tc * f;
    a.tube([[cx - e, cy - e, hz + 8], [cx + e, cy - e, hz + 8], [cx + e, cy + e, hz + 8], [cx - e, cy + e, hz + 8], [cx - e, cy - e, hz + 8]], [1.6, 1.6, 1.6, 1.6, 1.6], 4);
    a.rect(cx - e, cy - e, cx + e, cy + e, 'EQUIP-DETAIL');
  }
  a.circ(cx, cy, 95); a.circ(cx, cy, 46, 'EQUIP-DETAIL');
  a.log('Added the ground plate and socket, the pole and hub, four arms with braces and tip caps, and ' + v.lines + ' rows of washing line (plan and 3D).');
}
function laundrySorter(a, v) {
  const n = v.bags, W = a.W, D = a.D, z0 = a.Z0, H = a.H, base = z0 + 70, topz = a.Z1 - (v.shelf ? 160 : 40), bw = (W - 40) / n;
  const hy = D / 2 - 18;
  for (const sy of [-1, 1]) a.tube([[a.X0 + 16, a.cy + sy * hy, base], [a.X1 - 16, a.cy + sy * hy, base]], [10, 10], 8);
  for (const sx of [-1, 1]) a.tube([[sx * (W / 2 - 16), a.cy - hy, base], [sx * (W / 2 - 16), a.cy + hy, base]], [10, 10], 8);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.caster(sx * (W / 2 - 16), a.cy + sy * hy, 70);
  for (let k = 0; k <= n; k++) for (const sy of [-1, 1]) a.tube([[a.X0 + 16 + k * ((W - 32) / n), a.cy + sy * hy, base], [a.X0 + 16 + k * ((W - 32) / n), a.cy + sy * hy, topz]], [9, 9], 8);
  for (const sy of [-1, 1]) a.tube([[a.X0 + 16, a.cy + sy * hy, topz], [a.X1 - 16, a.cy + sy * hy, topz]], [8, 8], 8);
  for (let k = 0; k < n; k++) {
    const bx = a.X0 + 16 + (k + 0.5) * ((W - 32) / n), mk = (s) => rrect(bx, a.cy, (bw - 20) * s, (D - 50) * s, 40 * s, 4);
    a.prism(mk(1), base + 12, base + 18); shellLoft(a, mk, base + 14, topz - 20, () => 1, 0.04, 2, true);
    a.tube([...mk(1).slice(0, 5).map(([x, y]) => [x, y, topz - 20])].concat([[mk(1)[0][0], mk(1)[0][1], topz - 20]]), new Array(6).fill(3), 5);
    a.box(bx - 40, a.cy + hy - 8, topz - 150, bx + 40, a.cy + hy - 4, topz - 20);
    a.rect(bx - (bw - 20) / 2, a.cy - (D - 50) / 2, bx + (bw - 20) / 2, a.cy + (D - 50) / 2, 'EQUIP-DETAIL');
  }
  if (v.shelf) {
    ringPoly(a, rrect(a.cx, a.cy, W, D, 10, 4), rrect(a.cx, a.cy, W - 16, D - 16, 8, 4), topz, topz + 18); a.prism(rrect(a.cx, a.cy, W - 10, D - 10, 10, 4), topz, topz + 5);
    for (let i = 0; i < 3; i++) a.box(a.X0 + 40 + i * (W / 3.4), a.cy - 130, topz + 5, a.X0 + 40 + i * (W / 3.4) + W / 4, a.cy + 130, topz + 5 + 36 + i * 4);
  }
  a.rect(a.X0, a.YF, a.X1, 0);
  a.log('Added the tube frame on four casters, ' + n + ' fabric bags on hoops with carry straps' + (v.shelf ? ', and a rimmed top shelf holding folded towels' : '') + ' (plan and 3D).');
}
function cleanRail(a, v) {
  const n = v.n, z0 = a.Z0, Z1 = a.Z1, pitch = a.W / n, zr = z0 + a.H * 0.78, kinds = ['broom', 'mop', 'brush', 'squeegee'];
  a.box(a.X0, -38, zr, a.X1, 0, zr + 60); a.rect(a.X0, -38, a.X1, 0);
  for (let k = 0; k < n; k++) {
    const x = a.X0 + pitch * (k + 0.5), yc = -56, kind = kinds[k % 4], zt = Z1 - 8 - (k % 2) * 40;
    ringPoly(a, ellPoly(x, yc, 20, 20, 14), ellPoly(x, yc, 13, 13, 14), zr + 8, zr + 52); a.box(x - 8, -40, zr + 8, x + 8, -36, zr + 52);
    a.cyl(x, yc, z0 + (kind === 'mop' ? 130 : 95), zt, 11, 12); a.ell(x, yc, zt - 4, 11, 11, 14, 8, 4);
    if (kind === 'broom') { a.box(x - pitch * 0.4, yc - 34, z0 + 70, x + pitch * 0.4, yc + 34, z0 + 125); a.box(x - pitch * 0.38, yc - 32, z0, x + pitch * 0.38, yc + 32, z0 + 70); for (const f of [0.35, 0.7]) a.box(x - pitch * 0.39, yc - 33, z0 + 70 * f - 1.5, x + pitch * 0.39, yc + 33, z0 + 70 * f + 1.5); }
    if (kind === 'mop') { a.cyl(x, yc, z0 + 105, z0 + 140, 32, 12); a.ell(x, yc, z0 + 105, 40, 40, 20, 10, 5); for (let i = 0; i < 12; i++) { const t = (i / 12) * 2 * PI; a.tube([[x + 22 * m.cos(t), yc + 22 * m.sin(t), z0 + 100], [x + 42 * m.cos(t), yc + 42 * m.sin(t), z0 + 50], [x + 40 * m.cos(t), yc + 40 * m.sin(t), z0 + 6]], [2.4, 2.4, 2], 4); } }
    if (kind === 'brush') { a.box(x - pitch * 0.34, yc - 24, z0 + 36, x + pitch * 0.34, yc + 24, z0 + 95); a.box(x - pitch * 0.33, yc - 22, z0, x + pitch * 0.33, yc + 22, z0 + 36); }
    if (kind === 'squeegee') { a.box(x - pitch * 0.4, yc - 7, z0 + 25, x + pitch * 0.4, yc + 7, z0 + 70); a.box(x - pitch * 0.4, yc - 4, z0, x + pitch * 0.4, yc + 4, z0 + 25); a.box(x - 14, yc - 12, z0 + 70, x + 14, yc + 12, z0 + 95); }
    a.circ(x, yc, 11, 'EQUIP-DETAIL'); a.circ(x, yc, 20, 'EQUIP-DETAIL');
  }
  a.log('Added the wall rail with ' + n + ' spring grip clips and the standing tools it holds: a broom, a strand mop, a scrub brush and a squeegee (plan and 3D).');
}
function toiletSet(a, v) {
  const z0 = a.Z0, H = a.H;
  const holder = (cx, cy, R, hh, sq, lid) => {
    if (sq) { const mk = (s) => rrect(cx, cy, 2 * R * s, 2 * R * s, 16 * s, 3); a.prism(mk(0.96), z0, z0 + 6); shellLoft(a, mk, z0 + 4, z0 + hh, (t) => 0.96 + 0.04 * t, 0.06, 4, true); a.poly(mk(1)); a.poly(mk(0.88), 'EQUIP-DETAIL'); }
    else { vessel(a, cx, cy, [[R * 0.92, z0], [R, z0 + hh]], 3, 28); loop(a, cx, cy, R, z0 + hh, 3, 28, 5); a.circ(cx, cy, R); a.circ(cx, cy, R - 3, 'EQUIP-DETAIL'); }
    if (lid) { a.cyl(cx, cy, z0 + hh, z0 + hh + 8, R * 0.98, 28); a.cyl(cx, cy, z0 + hh + 8, z0 + hh + 10, R * 0.25, 12); }
  };
  const brush = (cx, cy, R, hh, lid) => {
    a.tube([[cx, cy, z0 + 20], [cx, cy, H * 0.0 + a.Z1 - 20]], [6, 6], 8); a.ell(cx, cy, a.Z1 - 12, 13, 13, 12, 10, 5);
    a.ell(cx, cy, z0 + 90, R * 0.5, R * 0.5, 70, 12, 6); for (let k = 0; k < 8; k++) { const t = (k / 8) * 2 * PI; a.tube([[cx, cy, z0 + 80 + (k % 3) * 18], [cx + R * 0.62 * m.cos(t), cy + R * 0.62 * m.sin(t), z0 + 75 + (k % 3) * 22]], [2, 1.5], 4); }
  };
  if (!v.twin) { const R = a.W / 2, cx = a.cx, cy = a.cy; holder(cx, cy, R, v.hh * IN, v.sq, v.lid); brush(cx, cy, R, v.hh * IN, v.lid); }
  else {
    const R1 = 2.4 * IN, x1 = a.X0 + R1 + 4, x2 = a.X1 - 2.7 * IN - 4, R2 = 2.7 * IN, cy = a.cy;
    holder(x1, cy, R1, 6.2 * IN, false, true); brush(x1, cy, R1, 6.2 * IN, true);
    holder(x2, cy, R2, 5.6 * IN, false, false);
    revolve(a, x2, cy, [[R2 * 0.95, z0 + 5.6 * IN - 40], [R2 * 0.95, z0 + 5.6 * IN - 36], [R2 * 0.6, z0 + 5.6 * IN - 10], [0.01, z0 + 5.6 * IN + 30]], 24);
    a.cyl(x2, cy, z0 + 5.6 * IN + 20, a.Z1 - 14, 11, 12); a.ell(x2, cy, a.Z1 - 8, 14, 14, 10, 8, 4);
  }
  a.log('Added the ' + (v.twin ? 'two holders, one with a bristle brush and one with a rubber plunger cup' : (v.sq ? 'square' : 'round') + ' holder' + (v.lid ? ' with a lid' : '') + ' and the bristle brush standing in it') + ' (plan and 3D).');
}
function cleanTrolley(a, v) {
  const W = a.W, D = a.D, z0 = a.Z0, H = a.H, bagW = v.bag ? 12 * IN : 0, fw = W - bagW, fx0 = a.X0, fx1 = a.X0 + fw, cy = a.cy;
  for (const [x, y] of [[fx0 + 18, cy - D / 2 + 18], [fx1 - 18, cy - D / 2 + 18], [fx0 + 18, cy + D / 2 - 18], [fx1 - 18, cy + D / 2 - 18]]) { a.caster(x, y, 70); a.tube([[x, y, z0 + 60], [x, y, z0 + H - 150]], [10, 10], 8); }
  const trays = [z0 + 110, z0 + H * 0.52];
  for (const z of trays) { ringPoly(a, rrect((fx0 + fx1) / 2, cy, fw, D, 14, 4), rrect((fx0 + fx1) / 2, cy, fw - 16, D - 16, 10, 4), z, z + 50); a.prism(rrect((fx0 + fx1) / 2, cy, fw - 8, D - 8, 12, 4), z, z + 8); }
  const bm = (s) => rrect(fx0 + fw * 0.35, cy, fw * 0.5 * s, D * 0.6 * s, 40 * s, 4);
  shellLoft(a, bm, trays[0] + 8, trays[0] + 8 + 150, (t) => 0.76 + 0.24 * t, 0.07, 4, true);
  for (let i = 0; i < 3; i++) { const bx = fx0 + fw * 0.6 + i * 60; a.cyl(bx, cy, trays[1] + 8, trays[1] + 150, 22, 12); a.cyl(bx, cy, trays[1] + 150, trays[1] + 172, 9, 8); a.box(bx - 4, cy - 38, trays[1] + 150, bx + 4, cy - 10, trays[1] + 168); }
  a.tube([[fx0 + 18, cy + D / 2 - 18, z0 + H - 150], [fx0 + 18, cy + D / 2 - 18 + 0.1, z0 + H - 20], [fx1 - 18, cy + D / 2 - 18, z0 + H - 20], [fx1 - 18, cy + D / 2 - 18, z0 + H - 150]], [10, 10, 10, 10], 8);
  if (v.bag) {
    const bxc = fx1 + bagW / 2, mk = (s) => rrect(bxc, cy, (bagW - 26) * s, D * 0.62 * s, 40 * s, 4);
    a.tube([[fx1 - 6, cy, z0 + H * 0.55], [bxc, cy, z0 + H * 0.58]], [6, 6], 6); loop(a, bxc, cy, (bagW - 26) / 2 + 0, z0 + H * 0.7, 4, 24, 5);
    shellLoft(a, (s) => ellPoly(bxc, cy, (bagW - 26) / 2 * s, (bagW - 26) / 2 * s, 20), z0 + H * 0.25, z0 + H * 0.7, (t) => 0.6 + 0.4 * t, 0.03, 4, true);
    for (const z of [z0 + H * 0.4, z0 + H * 0.55]) loop(a, bxc, cy, (bagW - 26) / 2 * (0.6 + 0.4 * ((z - (z0 + H * 0.25)) / (H * 0.45))) + 1, z, 2, 20, 4);
    a.circ(bxc, cy, (bagW - 26) / 2);
  }
  a.rect(fx0, cy - D / 2, fx1, cy + D / 2); a.rect(fx0 + 8, cy - D / 2 + 8, fx1 - 8, cy + D / 2 - 8, 'EQUIP-DETAIL');
  a.log('Added the four-post frame on casters, two rimmed trays, a mop-style bucket, spray bottles with triggers, a push handle' + (v.bag ? ' and a bag ring with a sack on an arm' : '') + ' (plan and 3D).');
}
function stepStool(a, v) {
  const n = v.n, W = a.W, D = a.D, z0 = a.Z0, H = a.H, hp = v.hp * IN, hx = W / 2 - 22, yfb = a.YF + 12, ybb = -12, ytf = -D * 0.62, ytb = -D * 0.3;
  for (const s of [-1, 1]) {
    a.tube([[s * hx, yfb, z0], [s * hx, ytf, z0 + hp]], [11, 11], 8); a.tube([[s * hx, ybb, z0], [s * hx, ytb, z0 + hp]], [11, 11], 8);
    a.box(s * hx - 18, yfb - 14, z0, s * hx + 18, yfb + 14, z0 + 8); a.box(s * hx - 18, ybb - 14, z0, s * hx + 18, ybb + 14, z0 + 8);
  }
  a.box(-hx - 6, ytf - 22, z0 + hp - 22, hx + 6, ytb + 20, z0 + hp);
  for (let k = 1; k < n; k++) { const z = (hp * k) / n, yf = yfb + (ytf - yfb) * (z / hp); a.box(-hx, yf - 8, z0 + z - 18, hx, yf + 130, z0 + z); }
  a.tube([[-hx, -D * 0.5, z0 + hp * 0.35], [hx, -D * 0.5, z0 + hp * 0.35]], [7, 7], 6);
  if (n >= 3) a.tube([[-hx, ytb + 14, z0 + hp], [-hx, ytb + 14, a.Z1 - 14], [hx, ytb + 14, a.Z1 - 14], [hx, ytb + 14, z0 + hp]], [11, 11, 11, 11], 8);
  a.rect(a.X0, a.YF, a.X1, 0); a.rect(-hx - 6, ytf - 22, hx + 6, ytb + 20, 'EQUIP-DETAIL');
  for (let k = 1; k < n; k++) { const z = (hp * k) / n, yf = yfb + (ytf - yfb) * (z / hp); a.line(-hx, yf + 60, hx, yf + 60); }
  a.log('Added the splayed front and back legs with feet, ' + (n > 1 ? (n - 1) + ' treads, ' : '') + 'the top platform, a cross brace' + (n >= 3 ? ' and a safety hoop' : '') + ' (plan and 3D).');
}
function flatMop(a, v) {
  const Wh = v.head * IN, hd = 4.6 * IN, cx = a.cx, z0 = a.Z0, yh = a.YF + hd / 2 + 10, J = [cx, yh, z0 + 80], T = [cx, -26, a.Z1 - 18];
  a.prism(rrect(cx, yh, Wh, hd, 20, 4), z0, z0 + 20); a.prism(rrect(cx, yh, Wh * 0.96, hd * 0.92, 16, 4), z0 + 20, z0 + 34);
  for (const k of [-1, 0, 1]) a.box(cx + k * Wh * 0.3 - 22, yh - hd * 0.3, z0 + 34, cx + k * Wh * 0.3 + 22, yh + hd * 0.3, z0 + 42);
  for (const s of [-1, 1]) a.tube([[cx + s * 44, yh, z0 + 42], [cx + s * 20, yh, z0 + 70], [cx, yh, z0 + 80]], [6, 6, 8], 8);
  a.ell(J[0], J[1], J[2], 20, 20, 20, 10, 6);
  const P = (t) => [J[0], J[1] + (T[1] - J[1]) * t, J[2] + (T[2] - J[2]) * t];
  a.tube([P(0), P(0.08), P(0.76), P(1)], [11, 10, 10, 10], 10); a.tube([P(0.78), P(1)], [15, 15], 12); a.ell(T[0], T[1], T[2], 15, 15, 16, 10, 5);
  if (v.spray) { const q = P(0.52); a.box(q[0] - 18, q[1] - 36, q[2] - 20, q[0] + 18, q[1] - 4, q[2] + 25); a.cyl(q[0], q[1] - 56, q[2] - 80, q[2] + 40, 30, 14); a.cyl(q[0], q[1] - 56, q[2] + 40, q[2] + 62, 10, 8); }
  a.rect(cx - Wh / 2, yh - hd / 2, cx + Wh / 2, yh + hd / 2); a.rect(cx - Wh * 0.48, yh - hd * 0.46, cx + Wh * 0.48, yh + hd * 0.46, 'EQUIP-DETAIL'); a.line(cx, yh, cx, T[1], 'EQUIP-DETAIL');
  a.log('Added the rounded mop pad and frame with a swivel fork and ball joint, and a handle that leans back with a grip' + (v.spray ? ', a trigger housing and a spray bottle on the handle' : '') + ' (plan and 3D).');
}
function garmentSteamer(a, v) {
  const cx = a.cx, cy = a.cy, z0 = a.Z0, Z1 = a.Z1, Rb = a.W / 2 - 20, zp = Z1 - 60;
  for (let k = 0; k < 5; k++) { const t = (k / 5) * 2 * PI + 0.3, ex = cx + Rb * m.cos(t), ey = cy + Rb * m.sin(t); a.tube([[cx, cy, z0 + 38], [ex, ey, z0 + 38]], [11, 11], 8); a.caster(ex, ey, 38); a.line(cx, cy, ex, ey); }
  a.cyl(cx, cy, z0 + 36, z0 + 52, 36, 16);
  vessel(a, cx, cy, [[R_(95), z0 + 54], [R_(100), z0 + 340]], 3, 24); a.cyl(cx, cy, z0 + 340, z0 + 356, 100, 24); a.cyl(cx, cy, z0 + 356, z0 + 366, 22, 12);
  a.cyl(cx, cy, z0 + 356, zp, 19, 14); a.cyl(cx, cy, z0 + (zp - z0) * 0.58, z0 + (zp - z0) * 0.58 + 40, 27, 14);
  a.xcyl(cx - 230, cx + 230, cy, Z1 - 24, 6, 8); a.cyl(cx, cy, zp, Z1 - 18, 12, 10); for (const s of [-1, 1]) { a.box(cx + s * 200 - 12, cy - 6, Z1 - 120, cx + s * 200 + 12, cy + 6, Z1 - 24); }
  a.tube(arcPts([cx + 100, cy, z0 + 345], [cx + 330, cy, z0 + 340], [cx + 40, cy, zp - 140], 10), new Array(11).fill(11), 8);
  a.ell(cx + 40, cy, zp - 190, 40, 70, 36, 10, 6); a.box(cx + 10, cy - 70, zp - 220, cx + 90, cy + 70, zp - 150);
  a.circ(cx, cy, Rb); a.circ(cx, cy, 100, 'EQUIP-DETAIL'); a.circ(cx, cy, 19, 'EQUIP-DETAIL');
  a.log('Added the five-arm base on casters, the water tank, the telescoping pole with a collar, a hanger bar with trouser clips, a hose and the hand steamer parked on the pole (plan and 3D).');
}
const R_ = (x) => x;

// ------------------------------------------------------------------------------------------ storage
function shoeCabinet(a, v) {
  const n = v.n, W = a.W, z0 = a.Z0, Z1 = a.Z1, legH = 4 * IN, cd = (a.D * 1) - 0.45 * ((Z1 - z0 - legH) / n) - 8, yf = -a.D + (a.D - cd), t = 16;
  const top = Z1 - (v.cush ? 2 * IN : 0), ch = top - (z0 + legH), fh = (ch - 2 * t) / n;
  for (const sx of [-1, 1]) for (const sy of [yf + 24, -24]) a.leg(sx * (W / 2 - 36), sy, z0, z0 + legH, 14);
  a.box(a.X0, yf, z0 + legH, a.X1, 0, z0 + legH + t); a.box(a.X0, yf, top - t, a.X1, 0, top);
  a.box(a.X0, yf, z0 + legH + t, a.X0 + t, 0, top - t); a.box(a.X1 - t, yf, z0 + legH + t, a.X1, 0, top - t); a.box(a.X0 + t, -8, z0 + legH + t, a.X1 - t, 0, top - t);
  for (let k = 0; k < n; k++) {
    const zb = z0 + legH + t + k * fh, hz = zb, open = k === 1 && n > 1 ? 1 : 0;
    if (open) { const th = 25 * PI / 180; prismX(a, tiltPoly(yf, zb, th, 0, 14, 0, fh - 4).map(([y, z]) => [y, z]), a.X0 + t + 4, a.X1 - t - 4); a.box(a.X0 + t, yf + 30, zb + 40, a.X1 - t, yf + 60, zb + 48); a.box(a.X0 + t, yf + 120, zb + fh * 0.5, a.X1 - t, yf + 150, zb + fh * 0.5 + 8); }
    else { a.box(a.X0 + t + 2, yf - 14, zb + 2, a.X1 - t - 2, yf, zb + fh - 2); a.box(a.cx - 90, yf - 20, zb + fh - 36, a.cx + 90, yf - 14, zb + fh - 26); }
    if (k > 0) a.box(a.X0 + t, yf, zb - 2, a.X1 - t, yf + 4, zb + 2);
  }
  if (v.cush) { for (let i = 0; i < 6; i++) { const s = m.cos((i / 6) * PI * 0.45); a.prism(rrect(a.cx, yf + cd / 2, W * (0.99 - 0.03 * i), cd * (0.99 - 0.02 * i), 40, 4), top + (i * 2 * IN) / 6, top + ((i + 1) * 2 * IN) / 6); } }
  a.rect(a.X0, yf, a.X1, 0); a.rect(a.X0 + t, yf + 4, a.X1 - t, -8, 'EQUIP-DETAIL');
  for (let k = 1; k < n; k++) a.line(a.X0 + t, yf + 4, a.X1 - t, yf + 4);
  a.log('Added the carcass on four legs with a back panel, ' + n + ' tip-out shoe flaps with finger grips (one shown ajar with its shelf rails)' + (v.cush ? ' and a padded bench top' : '') + ' (plan and 3D).');
}
function garmentRail(a, v) {
  const W = a.W, D = a.D, z0 = a.Z0, Z1 = a.Z1, hx = W / 2 - 24, rails = v.rails || 1, zr = [Z1 - 70, Z1 - 70 - (rails > 1 ? 36 * IN : 0)];
  for (const s of [-1, 1]) {
    a.tube([[s * hx, a.YF + 30, z0 + 50], [s * hx, -30, z0 + 50]], [11, 11], 8); a.tube([[s * hx, a.YF + 30, z0 + 50], [s * hx, a.YF + 30, Z1 - 20]], [10, 10], 8); a.tube([[s * hx, -30, z0 + 50], [s * hx, -30, Z1 - 20]], [10, 10], 8);
    a.tube([[s * hx, a.YF + 30, Z1 - 20], [s * hx, -30, Z1 - 20]], [10, 10], 8);
    for (const y of [a.YF + 30, -30]) a.caster(s * hx, y, 50);
  }
  a.tube([[-hx, a.cy, Z1 - 20], [hx, a.cy, Z1 - 20]], [0.1, 0.1], 3);
  for (const zrr of rails.length ? [] : zr.slice(0, rails)) a.xcyl(-hx, hx, a.cy, zrr, 9, 12);
  const gl = [780, 700, 820, 640, 760];
  zr.slice(0, rails).forEach((zrr, ri) => {
    a.xcyl(-hx, hx, a.cy, zrr, 9, 12);
    const ng = m.floor((2 * hx - 30) / 66);
    for (let g = 0; g < ng; g++) {
      const x = -hx + 34 + g * 66 + (ri ? 10 : 0), L = rails > 1 ? gl[g % 5] * 0.55 : gl[g % 5], zg = zrr - 6;
      a.tube([[x, a.cy, zrr + 3], [x, a.cy, zrr + 28], [x + 4, a.cy, zrr + 40]], [2.2, 2.2, 2.2], 5);
      a.tube([[x, a.cy - 150, zg - 55], [x, a.cy, zrr + 24], [x, a.cy + 150, zg - 55]], [2.2, 2.2, 2.2], 5);
      prismX(a, [[a.cy - 160, zg - 66], [a.cy + 160, zg - 66], [a.cy + 190, zg - 240], [a.cy + 170, zg - L], [a.cy - 170, zg - L], [a.cy - 190, zg - 240]], x - 14, x + 14);
    }
  });
  const zs = z0 + 190; for (let k = 0; k < 6; k++) a.box(-hx, a.YF + 40 + k * ((D - 80) / 5) - 15, zs, hx, a.YF + 40 + k * ((D - 80) / 5) + 15, zs + 12);
  for (const s of [-1, 1]) a.box(s * hx - 6, a.YF + 30, zs - 12, s * hx + 6, -30, zs);
  a.rect(a.X0, a.YF, a.X1, 0, 'EQUIP-DETAIL'); a.rect(-hx - 10, a.YF + 20, hx + 10, -20); a.line(-hx, a.cy, hx, a.cy, 'EQUIP-DETAIL');
  a.log('Added the two frame ends with feet and casters, ' + rails + ' hanging rail' + (rails > 1 ? 's' : '') + ' with a row of hangers and garments on each, and a slatted lower shelf (plan and 3D).');
}
function drawerTower(a, v) {
  const n = v.n, W = a.W, D = a.D, z0 = a.Z0, Z1 = a.Z1, t = 14, f = 90, top = Z1;
  for (const sx of [-1, 1]) for (const sy of [a.YF + 22, -22]) a.cyl(sx * (W / 2 - 22), sy, z0, z0 + 40, 10, 8);
  a.box(a.X0, a.YF, z0 + 40, a.X1, 0, z0 + 40 + t); a.box(a.X0, a.YF, top - t, a.X1, 0, top);
  a.box(a.X0, a.YF, z0 + 40 + t, a.X0 + t, 0, top - t); a.box(a.X1 - t, a.YF, z0 + 40 + t, a.X1, 0, top - t); a.box(a.X0 + t, -6, z0 + 40 + t, a.X1 - t, 0, top - t);
  const hh = (top - t - (z0 + 40 + t)) / n;
  for (let k = 0; k < n; k++) {
    const zb = z0 + 40 + t + k * hh;
    a.box(a.X0 + t + 2, a.YF - 6, zb + 3, a.X1 - t - 2, a.YF + 6, zb + hh - 3);
    a.box(a.X0 + t + 2, a.YF + 6, zb + 3, a.X0 + t + 5, -20, zb + hh - 8); a.box(a.X1 - t - 5, a.YF + 6, zb + 3, a.X1 - t - 2, -20, zb + hh - 8);
    a.box(a.cx - 55, a.YF - 22, zb + hh - 34, a.cx + 55, a.YF - 6, zb + hh - 22); a.box(a.cx - 55, a.YF - 22, zb + hh - 34, a.cx - 49, a.YF - 6, zb + hh - 14); a.box(a.cx + 49, a.YF - 22, zb + hh - 34, a.cx + 55, a.YF - 6, zb + hh - 14);
    a.box(a.cx - 30, a.YF - 8, zb + hh * 0.3, a.cx + 30, a.YF - 6, zb + hh * 0.3 + 26);
  }
  a.rect(a.X0, a.YF, a.X1, 0); a.rect(a.X0 + t + 2, a.YF - 22, a.X1 - t - 2, a.YF, 'EQUIP-DETAIL'); a.rect(a.X0 + t, a.YF + 6, a.X1 - t, -6, 'EQUIP-DETAIL');
  a.log('Added the frame on four feet with a back panel, ' + n + ' drawers with front panels, finger-pull bars and label windows (plan and 3D).');
}
function archiveBox(a, v) {
  const z0 = a.Z0, Z1 = a.Z1, t = 4, lh = 55, X0 = a.X0, X1 = a.X1, YF = a.YF, bx0 = X0 + 3, bx1 = X1 - 3, by0 = YF + 3, by1 = -3, hz = Z1 - lh - (a.H * 0.08 | 0);
  a.box(bx0, by0, z0, bx1, by1, z0 + t); a.box(bx0, by0, z0, bx0 + t, by1, Z1 - lh + 20); a.box(bx1 - t, by0, z0, bx1, by1, Z1 - lh + 20);
  const hx = 55;
  wallHoleY(a, by0, by0 + t, bx0 + t, bx1 - t, z0 + t, Z1 - lh + 20, a.cx - hx, a.cx + hx, z0 + a.H * 0.42, z0 + a.H * 0.62);
  wallHoleY(a, by1 - t, by1, bx0 + t, bx1 - t, z0 + t, Z1 - lh + 20, a.cx - hx, a.cx + hx, z0 + a.H * 0.42, z0 + a.H * 0.62);
  a.box(X0, YF, Z1 - 6, X1, 0, Z1); a.box(X0, YF, Z1 - lh, X0 + 3, 0, Z1 - 6); a.box(X1 - 3, YF, Z1 - lh, X1, 0, Z1 - 6); a.box(X0 + 3, YF, Z1 - lh, X1 - 3, YF + 3, Z1 - 6); a.box(X0 + 3, -3, Z1 - lh, X1 - 3, 0, Z1 - 6);
  a.box(a.cx - 70, YF - 1, z0 + a.H * 0.18, a.cx + 70, YF + 3, z0 + a.H * 0.3);
  a.rect(X0, YF, X1, 0); a.rect(bx0, by0, bx1, by1, 'EQUIP-DETAIL'); a.line(a.cx - hx, YF, a.cx + hx, YF, 'EQUIP-DETAIL'); a.line(a.cx - hx, 0, a.cx + hx, 0, 'EQUIP-DETAIL');
  a.log('Added the corrugated-style box with a front and back hand hole each, a label plate and a deep telescoping lid (plan and 3D).');
}
function spiceRack(a, v) {
  const n = v.n, W = a.W, z0 = a.Z0, rise = 55, stepd = 55, jr = 20;
  for (let k = 0; k < n; k++) {
    const zk = z0 + rise * (k + 1), yf = a.YF + k * stepd;
    a.box(a.X0, yf, zk - 12, a.X1, 0, zk); a.box(a.X0 + 12, yf, zk - rise, a.X1 - 12, yf + 6, zk - 12);
    a.box(a.X0, yf, zk - rise, a.X0 + 12, 0, zk - 12); a.box(a.X1 - 12, yf, zk - rise, a.X1, 0, zk - 12);
    a.box(a.X0 + 12, yf + 6, z0 + 0, a.X1 - 12, yf + 9, z0 + 1);
    const nj = m.floor((W - 24) / (2 * jr + 4));
    for (let j = 0; j < nj; j++) { const x = a.X0 + 12 + (W - 24) / nj * (j + 0.5), y = yf + 26; a.cyl(x, y, zk, zk + 47, jr, 14); a.cyl(x, y, zk + 47, zk + 54, jr * 0.92, 14); a.circ(x, y, jr, 'EQUIP-DETAIL'); }
  }
  a.box(a.X0, -6, z0 + 6, a.X1, 0, z0 + rise * n + 62);
  a.rect(a.X0, a.YF, a.X1, 0); for (let k = 0; k < n; k++) a.line(a.X0, a.YF + k * stepd, a.X1, a.YF + k * stepd);
  a.log('Added the stepped shelf with riser panels and end cheeks, a back rail and a row of capped spice jars on each of ' + n + ' tiers (plan and 3D).');
}
function underBed(a, v) {
  const W = a.W, D = a.D, z0 = a.Z0, H = a.H, cy = a.cy, lidz = a.Z1 - 14, mk = (s) => rrect(a.cx, cy, W * s, D * s, 30 * s, 4);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.caster(sx * (W / 2 - 50), cy + sy * (D / 2 - 40), 38);
  a.prism(mk(0.97), z0 + 36, z0 + 42); shellLoft(a, mk, z0 + 38, lidz, (t) => 0.97 + 0.03 * t, 0.045, 4, true);
  a.prism(mk(1.0), lidz, lidz + 9); ringPoly(a, mk(0.99), mk(0.9), lidz + 9, lidz + 14);
  for (const s of [-1, 1]) { a.box(a.cx + s * W * 0.3 - 22, a.YF - 2, lidz - 40, a.cx + s * W * 0.3 + 22, a.YF + 4, lidz + 8); a.box(a.cx + s * W * 0.3 - 14, a.YF - 8, lidz - 30, a.cx + s * W * 0.3 + 14, a.YF - 2, lidz - 12); }
  a.box(a.cx - 60, a.YF - 12, z0 + H * 0.45, a.cx + 60, a.YF, z0 + H * 0.45 + 22);
  a.poly(mk(1)); a.poly(mk(0.9), 'EQUIP-DETAIL');
  a.log('Added the low tray on four swivel casters, the stacking lid with rim, two latches and a front pull handle (plan and 3D).');
}
function clampJar(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, H = a.H, lh = H * 0.15, hb = H - lh;
  vessel(a, cx, cy, [[R * 0.9, z0], [R, z0 + 8], [R, z0 + hb * 0.82], [R * 0.88, z0 + hb * 0.9], [R * 0.72, z0 + hb * 0.96], [R * 0.7, z0 + hb]], 2.6, 32);
  loop(a, cx, cy, R * 0.72, z0 + hb, 2.4, 32, 5);
  domeShell(a, cx, cy, z0 + hb + 1, R * 0.76, lh * 0.9, 2.2, 28); a.cyl(cx, cy, z0 + H - 8, z0 + H - 2, 6, 8); a.ell(cx, cy, z0 + H - 3, 11, 11, 4, 8, 4);
  loop(a, cx, cy, R * 0.74, z0 + hb - 6, 1.8, 32, 4);
  a.tube([[cx - R * 0.74, cy, z0 + hb - 6], [cx - R * 0.8, cy, z0 + hb + lh * 0.5], [cx, cy, z0 + H - 1], [cx + R * 0.8, cy, z0 + hb + lh * 0.5], [cx + R * 0.74, cy, z0 + hb - 6]], [2, 2, 2, 2, 2], 6);
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.76, 'EQUIP-DETAIL'); a.line(cx - R * 0.8, cy, cx + R * 0.8, cy, 'EQUIP-DETAIL');
  a.log('Added the glass jar with a shouldered neck, a rubber ring, a glass dome lid and a wire bail clamp (plan and 3D).');
}
function wineRack(a, v) {
  const nx = v.nx, ny = v.ny, z0 = a.Z0, cw = 100, t = 14, x00 = a.X0 + 14, zb = z0 + 24;
  for (let k = 0; k <= nx; k++) a.box(x00 + k * cw - t / 2 + (k === 0 ? t / 2 : k === nx ? -t / 2 : 0), a.YF, zb, x00 + k * cw + t / 2 + (k === 0 ? t / 2 : k === nx ? -t / 2 : 0), 0, zb + ny * cw);
  for (let j = 0; j <= ny; j++) a.box(x00, a.YF, zb + j * cw - (j === ny ? t : 0), x00 + nx * cw, 0, zb + j * cw + (j === 0 ? t : 0));
  for (const sx of [0, 1]) a.box(x00 + sx * (nx * cw - 70), a.YF, z0, x00 + sx * (nx * cw - 70) + 70, 0, zb);
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    if ((i + 2 * j) % 5 === 4) continue;
    const x = x00 + i * cw + cw / 2, z = zb + j * cw + cw / 2;
    a.tube([[x, -4, z], [x, -225, z], [x, -290, z], [x, -330, z]], [36, 36, 13, 14], 12); a.ycyl(-318, -342, x, z, 15.5, 10);
  }
  a.rect(a.X0, a.YF, a.X1, 0); for (let k = 1; k < nx; k++) a.line(x00 + k * cw, a.YF, x00 + k * cw, 0, 'EQUIP-DETAIL');
  a.log('Added the framed ' + nx + ' by ' + ny + ' cubby rack on feet with bottles lying in most cubbies, necks out (plan and 3D).');
}
function ladderShelf(a, v) {
  const n = v.n, W = a.W, z0 = a.Z0, Z1 = a.Z1, sd = 9 * IN, hx = W / 2 - 18, ytop = -6;
  for (const s of [-1, 1]) prismX(a, [[a.YF, z0], [a.YF + 36, z0], [ytop, Z1], [ytop - 36, Z1]], s * hx - 18, s * hx + 18);
  const yfAt = (z) => a.YF + ((ytop - 36 - sd - a.YF + 36) ? 0 : 0) + (-sd - 36 - a.YF - 0) * 0 + ((ytop - 36 - a.YF) * (z - z0)) / (Z1 - z0);
  for (let k = 0; k < n; k++) {
    const z = z0 + 180 + (k * (Z1 - z0 - 180 - 20)) / (n - 1), yf = yfAt(z) + 18;
    a.box(-hx, yf - 6, z - 18, hx, yf - 6 + sd - 20 < -6 ? yf - 6 + sd - 20 : -6, z); a.box(-hx, yf - 12, z, hx, yf - 6, z + 26);
  }
  a.tube([[-hx, yfAt(z0 + 60) + 12, z0 + 60], [hx, yfAt(z0 + 60) + 12, z0 + 60]], [7, 7], 6);
  a.tube([[-hx, -12, z0 + (Z1 - z0) * 0.35], [hx, -12, z0 + (Z1 - z0) * 0.35]], [7, 7], 6);
  a.rect(a.X0, a.YF, a.X1, 0, 'EQUIP-HIDDEN'); for (const s of [-1, 1]) a.rect(s * hx - 18, a.YF, s * hx + 18, a.YF + 36); a.rect(-hx, a.YF + 20, hx, a.YF + 20 + sd - 20, 'EQUIP-DETAIL');
  a.log('Added the two leaning side rails, ' + n + ' shelf boards with front lips between them and two cross rails (plan and 3D).');
}
function hatBox(a, v) {
  const z0 = a.Z0, cx = a.cx, cy = a.cy; let z = z0;
  for (const [dia, h] of v.stack) {
    const R = dia * IN / 2, hh = h * IN, lh = hh * 0.3;
    vessel(a, cx, cy, [[R * 0.97, z], [R * 0.97, z + hh - lh + 4]], 2, 32); a.cyl(cx, cy, z, z + hh - lh + 4, R * 0.96, 32);
    a.cyl(cx, cy, z + hh - lh, z + hh, R * 1.02, 32); a.cyl(cx, cy, z + hh - 2, z + hh, R * 0.9, 32);
    loop(a, cx, cy, R * 1.03, z + hh - lh, 2.4, 32, 4); loop(a, cx, cy, R * 0.98, z + (hh - lh) * 0.5, 1.8, 32, 4);
    z += hh;
  }
  const R0 = v.stack[v.stack.length - 1][0] * IN / 2;
  a.tube(arcPts([cx - R0 * 0.28, cy, z], [cx, cy, z + (a.Z1 - z) * 2 - 6], [cx + R0 * 0.28, cy, z]), new Array(11).fill(3.5), 6); a.cyl(cx, cy, z, z + 3, R0 * 0.4, 20);
  a.circ(cx, cy, v.stack[0][0] * IN / 2); for (const [dia] of v.stack.slice(1)) a.circ(cx, cy, dia * IN / 2, 'EQUIP-DETAIL');
  a.log('Added ' + (v.stack.length > 1 ? 'three nested round boxes, each' : 'the round box') + ' with a deep lid, a band and a ribbon loop on the top lid (plan and 3D).');
}
function suitcase(a, v) {
  const W = a.W, D = a.D, cx = a.cx, cy = a.cy, z0 = a.Z0, Z1 = a.Z1, bz = z0 + 2 * IN, bt = z0 + 2 * IN + v.bh * IN, mk = (s) => rrect(cx, cy, W * s, D * s, 56 * s, 4);
  a.prism(mk(0.9), bz, bt);
  for (let i = -2; i <= 2; i++) { a.box(cx + i * W * 0.17 - 6, a.YF - 4, bz + 60, cx + i * W * 0.17 + 6, a.YF + 4, bt - 60); a.box(cx + i * W * 0.17 - 6, -4, bz + 60, cx + i * W * 0.17 + 6, 4, bt - 60); }
  a.tube([[cx - W * 0.45 + 28, cy, bz + 18], [cx + W * 0.45 - 28, cy, bz + 18], [cx + W * 0.45 - 28, cy, bt - 18], [cx - W * 0.45 + 28, cy, bt - 18], [cx - W * 0.45 + 28, cy, bz + 18]], new Array(5).fill(2.6), 5);
  for (const sx of [-1, 1]) { a.box(cx + sx * (W / 2 - 40) - 22, a.YF, bz - 2, cx + sx * (W / 2 - 40) + 22, a.YF + 40, bz + 44); a.box(cx + sx * (W / 2 - 40) - 22, -40, bz - 2, cx + sx * (W / 2 - 40) + 22, 0, bz + 44); }
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const x = cx + sx * (W / 2 - 55), y = cy + sy * (D / 2 - 55); a.cyl(x, y, z0 + 36, bz + 2, 9, 8); a.xcyl(x - 10, x + 10, y, z0 + 26, 26, 14); }
  sweep(a, arcPts([cx - 55, cy, bt - 2], [cx, cy, bt + 70], [cx + 55, cy, bt - 2]), new Array(11).fill(9), 8);
  for (const s of [-1, 1]) a.tube([[cx + s * W * 0.2, cy, bt - 40], [cx + s * W * 0.2, cy, Z1 - 24]], [8, 8], 8);
  a.xcyl(cx - W * 0.2 - 10, cx + W * 0.2 + 10, cy, Z1 - 14, 14, 12); for (const s of [-1, 1]) a.tube([[cx + s * W * 0.2, cy, bt - 2], [cx + s * W * 0.2, cy, bt + 24]], [11, 11], 8);
  a.box(cx - 30, a.YF - 5, bt - 110, cx + 30, a.YF, bt - 86);
  a.poly(mk(0.9)); a.poly(mk(0.82), 'EQUIP-DETAIL'); a.line(cx - W * 0.2, cy, cx + W * 0.2, cy, 'EQUIP-DETAIL');
  a.log('Added the rounded shell with ribs, a zip seam, four twin-wheel spinner casters, corner guards, a top carry handle, a lock plate and a telescoping handle pulled out to its grip bar (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ decor
function fruitBowl(a, v) {
  const R = a.W / 2, s = R / 127, cx = a.cx, cy = a.cy, z0 = a.Z0, hs = 90 * s, hbw = 60 * s, zb = z0 + hs;
  revolve(a, cx, cy, [[0.01, z0], [R * 0.4, z0], [R * 0.4, z0 + 5 * s], [R * 0.16, z0 + 20 * s], [R * 0.1, z0 + 34 * s]], 28);
  a.tube([[cx, cy, z0 + 30 * s], [cx, cy, zb]], [R * 0.09, R * 0.09], 14); a.ell(cx, cy, z0 + hs * 0.55, R * 0.15, R * 0.15, R * 0.09, 12, 6);
  vessel(a, cx, cy, bowlProf(R * 0.3, R, hbw, zb, 8), 3, 32); loop(a, cx, cy, R, zb + hbw - 1, 3, 32, 5);
  const fr = 34 * s, z1 = zb + 70 * s;
  for (let i = 0; i < v.nA; i++) { const t = (i / v.nA) * 2 * PI, rr = R * 0.58; a.ell(cx + rr * m.cos(t), cy + rr * m.sin(t), z1 + (i % 2) * 6, fr, fr, fr * 0.95, 10, 6); a.cyl(cx + rr * m.cos(t), cy + rr * m.sin(t), z1 + fr * 0.8, z1 + fr * 1.25 + (i % 2) * 6, 2, 4); }
  for (let i = 0; i < v.nB; i++) { const t = (i / v.nB) * 2 * PI + 0.5, rr = R * 0.26; a.ell(cx + rr * m.cos(t), cy + rr * m.sin(t), z1 + fr * 1.45, fr, fr, fr * 1.1, 10, 6); }
  a.ell(cx, cy, z1 + fr * 2.3, fr * 0.9, fr * 0.9, fr * 1.05, 10, 6);
  a.circ(cx, cy, R); a.circ(cx, cy, R - 4, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.4, 'EQUIP-HIDDEN');
  for (let i = 0; i < v.nA; i++) { const t = (i / v.nA) * 2 * PI; a.circ(cx + R * 0.58 * m.cos(t), cy + R * 0.58 * m.sin(t), fr, 'EQUIP-DETAIL'); }
  a.log('Added the round foot, the turned stem with a node, the shallow bowl with a rolled rim, and a heap of ' + (v.nA + v.nB + 1) + ' round fruit with stalks (plan and 3D).');
}
/** a pillow leaning back: nz bands from the bottom; w x h face, thick; lean = shift of the top toward +y (mm) */
function pillow(a, cx, ybase, zb, w, h, thick, lean, nz = 9, round = false) {
  for (let k = 0; k < nz; k++) {
    const u0 = (k / nz) * 2 - 1, u1 = ((k + 1) / nz) * 2 - 1, u = (u0 + u1) / 2, tz = m.max(m.pow(m.max(1 - u * u, 0.02), 0.6), 0.12), wk = w * (round ? m.sqrt(m.max(1 - u * u, 0.02)) : 1 - 0.1 * m.pow(m.abs(u), 5)), yc = ybase + (lean * (k + 0.5)) / nz;
    a.prism(rrect(cx, yc, wk, thick * tz, thick * tz * 0.5, 4), zb + (h * k) / nz, zb + (h * (k + 1)) / nz);
  }
  const yb = ybase + lean * 0.5 - thick * 0.5;
  a.ell(cx, yb - 1, zb + h * 0.5, 8, 8, 8, 8, 4);
}
function cushionSeat(a, v) {
  const W = a.W, D = a.D, z0 = a.Z0, st = 17 * IN, bk = 4 * IN;
  a.box(a.X0, a.YF, z0 + 4 * IN, a.X1, 0, z0 + st - 3 * IN); a.box(a.X0, a.YF, z0, a.X0 + 40, a.YF + 40, z0 + 4 * IN); a.box(a.X1 - 40, a.YF, z0, a.X1, a.YF + 40, z0 + 4 * IN);
  a.box(a.X0, a.YF, z0 + 4 * IN, a.X1, 0, z0 + 4 * IN); a.prism(rrect(a.cx, a.YF + (D - bk) / 2, W, D - bk, 40, 4), z0 + st - 3 * IN, z0 + st);
  a.box(a.X0, -bk, z0 + st, a.X1, 0, a.Z1 - 2 * IN);
  let x = a.X0 + 6 * IN;
  for (const c of v.cs) {
    const w = c.w * IN, h = c.h * IN, th = c.t * IN, cx = x + w / 2;
    if (c.bolster) { a.xcyl(cx - w / 2, cx + w / 2, -bk - th / 2 - 2, z0 + st + th / 2, th / 2, 20); for (const s of [-1, 1]) a.cyl(cx + s * w / 2, -bk - th / 2 - 2, z0 + st + th * 0.1, z0 + st + th * 0.9, 0.01, 4); a.xcyl(cx - w / 2 - 8, cx - w / 2, -bk - th / 2 - 2, z0 + st + th / 2, th * 0.4, 14); a.xcyl(cx + w / 2, cx + w / 2 + 8, -bk - th / 2 - 2, z0 + st + th / 2, th * 0.4, 14); a.rect(cx - w / 2, -bk - th - 2, cx + w / 2, -bk - 2, 'EQUIP-DETAIL'); }
    else { pillow(a, cx, -bk - th * 0.5 - 6, z0 + st + 4, w, h, th, 70, 16, c.round); a.rect(cx - w / 2, -bk - th - 6, cx + w / 2, -bk - 6, 'EQUIP-DETAIL'); }
    x += w + 3 * IN * (c.gap ?? 1) * 0.7;
  }
  a.rect(a.X0, a.YF, a.X1, 0); a.rect(a.X0, -bk, a.X1, 0, 'EQUIP-DETAIL');
  a.log('Added the low settee block with a plinth, a seat cushion and a back panel, and ' + v.cs.length + ' stuffed cushions with piping and button tufts propped against it (plan and 3D).');
}
function floorVase(a, v) {
  const R = a.W * 0.17, cx = a.cx, cy = a.cy, z0 = a.Z0, hv = v.hv * IN;
  vessel(a, cx, cy, [[R * 0.7, z0], [R * 0.78, z0 + 8], [R * 1.0, z0 + hv * 0.35], [R * 0.9, z0 + hv * 0.75], [R * 0.6, z0 + hv * 0.94], [R * 0.68, z0 + hv]], 4, 28);
  loop(a, cx, cy, R * 0.68, z0 + hv, 3.5, 28, 5); loop(a, cx, cy, R * 0.96, z0 + hv * 0.42, 2.2, 28, 4);
  for (let i = 0; i < v.n; i++) {
    const t = (i / v.n) * 2 * PI + 0.5, ux = m.cos(t), uy = m.sin(t), reach = (a.W * 0.4) * (0.45 + 0.55 * ((i * 7) % 5) / 4), top = a.Z1 - 8 - ((i * 13) % 5) * (a.H - hv) * 0.07;
    const P0 = [cx + R * 0.2 * ux, cy + R * 0.2 * uy, z0 + hv * 0.5], P1 = [cx + reach * 0.35 * ux, cy + reach * 0.35 * uy, z0 + hv + (top - z0 - hv) * 0.55], P2 = [cx + reach * 0.8 * ux, cy + reach * 0.8 * uy, top];
    a.tube([P0, [P0[0] * 0.5 + P1[0] * 0.5, P0[1] * 0.5 + P1[1] * 0.5, z0 + hv], P1, P2], [4.4, 3.8, 3, 1.8], 5);
    a.tube([P1, [P1[0] + ux * reach * 0.35, P1[1] + uy * reach * 0.35, P1[2] + (top - P1[2]) * 0.4]], [2, 1.2], 4);
    a.ell(P2[0], P2[1], P2[2] + 4, 7, 7, 9, 6, 4);
    a.ell(P1[0] + ux * reach * 0.35, P1[1] + uy * reach * 0.35, P1[2] + (top - P1[2]) * 0.4 + 4, 5, 5, 7, 6, 4);
  }
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.68, 'EQUIP-DETAIL'); a.circ(cx, cy, a.W * 0.4, 'EQUIP-HIDDEN');
  a.log('Added the tall waisted floor vase with a rim bead and a band, and ' + v.n + ' dried twig stems with side shoots and buds (plan and 3D).');
}
function chevalMirror(a, v) {
  const W = a.W, D = a.D, z0 = a.Z0, Z1 = a.Z1, th = 9 * PI / 180, mw = W - 4 * IN, ph = 24, fh = (Z1 - z0) * 0.78, zp = z0 + (Z1 - z0) * 0.55, yp = -D * 0.5;
  for (const s of [-1, 1]) {
    const x = s * (mw / 2 + 22);
    a.box(x - 20, a.YF, z0, x + 20, 0, z0 + 40); a.tube([[x, a.cy, z0 + 40], [x, a.cy, Z1 - 24]], [14, 14], 10); a.ell(x, a.cy, Z1 - 12, 17, 17, 17, 10, 6);
    a.xcyl(x - 4, x - s * (mw / 2 - mw / 2 + 8) + s * -26, yp, zp, 16, 12);
  }
  const bar = (x0, x1, d0, d1, v0, v1) => prismX(a, tiltPoly(yp, zp, th, d0, d1, v0, v1), x0, x1);
  const fw = 38, hv = fh / 2;
  bar(-mw / 2, mw / 2, -4, 22, hv - fw, hv); bar(-mw / 2, mw / 2, -4, 22, -hv, -hv + fw);
  for (const s of [-1, 1]) bar(s > 0 ? mw / 2 - fw : -mw / 2, s > 0 ? mw / 2 : -mw / 2 + fw, -4, 22, -hv, hv);
  bar(-mw / 2 + fw, mw / 2 - fw, 4, 8, -hv + fw, hv - fw);
  for (const s of [-1, 1]) for (const e of [-1, 1]) { const q = tiltPoly(yp, zp, th, 22, 22, 0, e * (hv - fw / 2))[0]; a.ell(s * (mw / 2 - fw / 2), q[0] - 4, q[1], 12, 12, 12, 8, 5); }
  a.rect(a.X0, a.YF, a.X1, 0); a.rect(-mw / 2, yp - 4, mw / 2, yp + 22, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.rect(s * (mw / 2 + 22) - 20, a.YF, s * (mw / 2 + 22) + 20, 0, 'EQUIP-DETAIL');
  a.log('Added the framed mirror on two pivot knobs, tilted back, with corner rosettes, on two posts with ball finials and end feet (plan and 3D).');
}
function hourglass(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, H = a.H, pl = H * 0.07, zb = z0 + pl, zt = z0 + H - pl, zm = (zb + zt) / 2, Rg = R * 0.62, hb = (zt - zb) / 2;
  a.cyl(cx, cy, z0, z0 + pl, R, 28); a.cyl(cx, cy, zt, z0 + H, R, 28); loop(a, cx, cy, R, z0 + pl, 2, 28, 4); loop(a, cx, cy, R, zt, 2, 28, 4);
  const prof = []; for (let i = 0; i <= 12; i++) { const t = i / 12; prof.push([Rg * (0.12 + 0.88 * m.sin(m.pow(t, 0.8) * PI * 0.5 * 0 + t * PI * 0.5 * 0 + m.sin(t * PI * 0.5) * PI * 0.5 * (1 - 0) * 1) * 0 + 0.12 + 0.88 * m.pow(m.sin(t * PI), 0.7) * (t < 0.5 ? 1 : 1)), zb + t * (zt - zb)]); }
  const bulb = (z0b, z1b, up) => { const p = []; for (let i = 0; i <= 10; i++) { const t = i / 10, r = Rg * (0.1 + 0.9 * m.sin(t * PI * 0.5)) ; p.push([up ? r : Rg * (0.1 + 0.9 * m.sin((1 - t) * PI * 0.5)), z0b + (z1b - z0b) * t]); } return p; };
  const lo = bulb(zb + 2, zm, false), hi = bulb(zm, zt - 2, true);
  const shell = (pr) => { const O = pr.map(([r, z]) => [r, z]), I = pr.map(([r, z]) => [m.max(r - 2.4, 0.5), z]).reverse(); return [...O, ...I]; };
  const lo2 = [...lo.map(([r, z]) => [r, z]), ...lo.map(([r, z]) => [m.max(r - 2.4, 0.5), z]).reverse()];
  revolve(a, cx, cy, [[0.5, zb + 2], ...lo.slice(0), ...lo.map(([r, z]) => [m.max(r - 2.4, 0.5), z]).reverse(), [0.5, zb + 2]], 28);
  revolve(a, cx, cy, [[0.5, zt - 2], ...hi.slice().reverse(), ...hi.map(([r, z]) => [m.max(r - 2.4, 0.5), z]), [0.5, zt - 2]], 28);
  a.cone(cx, cy, zb + 2, zb + 2 + hb * 0.55, Rg * 0.7, 0.01, 22); a.cyl(cx, cy, zm - hb * 0.1, zm + hb * 0.3, 0.8, 5); a.cone(cx, cy, zt - 2 - hb * 0.25, zt - 2, 0.01, Rg * 0.6, 20);
  for (let k = 0; k < 3; k++) { const t = (k / 3) * 2 * PI + 0.5, px = cx + (R - 10) * m.cos(t), py = cy + (R - 10) * m.sin(t); a.cyl(px, py, zb, zt, 5, 10); a.ell(px, py, zm, 8, 8, 6, 8, 4); a.ell(px, py, zb + hb * 0.3, 7, 7, 5, 8, 4); a.ell(px, py, zt - hb * 0.3, 7, 7, 5, 8, 4); }
  a.circ(cx, cy, R); a.circ(cx, cy, Rg, 'EQUIP-DETAIL'); for (let k = 0; k < 3; k++) { const t = (k / 3) * 2 * PI + 0.5; a.circ(cx + (R - 10) * m.cos(t), cy + (R - 10) * m.sin(t), 5, 'EQUIP-DETAIL'); }
  a.log('Added the two round end plates, three turned posts with beads, the two glass bulbs with a waist, and the sand heaps (plan and 3D).');
}
function terrarium(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, H = a.H, hw = H * 0.72, hc = [], rc = R * 0.88;
  for (let i = 0; i < 6; i++) { const t = (i / 6) * 2 * PI; hc.push([cx + rc * m.cos(t), cy + rc * m.sin(t)]); }
  const hx = (s) => hc.map(([x, y]) => [cx + (x - cx) * s, cy + (y - cy) * s]);
  a.prism(hx(1.06), z0, z0 + 14); a.prism(hx(0.99), z0 + 14, z0 + 28);
  for (let i = 0; i < 6; i++) { const p = hc[i], q = hc[(i + 1) % 6]; a.tube([[p[0], p[1], z0 + 28], [p[0], p[1], z0 + hw]], [3, 3], 6); a.tube([[p[0], p[1], z0 + hw], [cx, cy, z0 + H - 16]], [2.6, 1.6], 6); a.tube([[p[0], p[1], z0 + hw * 0.5], [q[0], q[1], z0 + hw * 0.5]], [1.8, 1.8], 5); a.tube([[p[0], p[1], z0 + hw], [q[0], q[1], z0 + hw]], [2.6, 2.6], 5); a.tube([[p[0], p[1], z0 + 28], [q[0], q[1], z0 + 28]], [2.6, 2.6], 5); }
  a.cyl(cx, cy, z0 + H - 18, z0 + H - 6, 6, 8); a.ell(cx, cy, z0 + H - 8, 9, 9, 8, 8, 5);
  a.prism(hx(0.9), z0 + 28, z0 + 44);
  for (let k = 0; k < 9; k++) { const t = k * 2.4, r = R * 0.55 * ((k % 4) / 4 + 0.2); a.ell(cx + r * m.cos(t), cy + r * m.sin(t), z0 + 46, 8 + (k % 3) * 2, 8 + (k % 3) * 2, 5, 6, 4); }
  for (const [px, py, sc] of [[0.3, 0.1, 1], [-0.35, -0.25, 0.8], [0.0, -0.45, 0.7], [-0.15, 0.4, 0.9]]) { const x = cx + px * R, y = cy + py * R, z = z0 + 44; for (let k = 0; k < 7; k++) { const t = (k / 7) * 2 * PI; a.ell(x + 12 * sc * m.cos(t), y + 12 * sc * m.sin(t), z + 14 * sc, 6 * sc, 6 * sc, 12 * sc, 6, 4); } a.ell(x, y, z + 12 * sc, 6 * sc, 6 * sc, 10 * sc, 6, 4); }
  a.poly(hx(1.06)); a.poly(hx(0.9), 'EQUIP-DETAIL'); for (let i = 0; i < 6; i++) a.line(cx, cy, hc[i][0], hc[i][1], 'EQUIP-DETAIL');
  a.log('Added the faceted metal frame with a base, a soil bed with pebbles and four succulent rosettes, and a pyramid roof with a finial (glass panes not drawn) (plan and 3D).');
}
function longcaseClock(a, v) {
  const W = a.W, D = a.D, z0 = a.Z0, H = a.H, cx = a.cx, hoodZ = z0 + H * 0.7, plinth = H * 0.1, trW = W * 0.78, trD = D * 0.88;
  a.box(a.X0, a.YF, z0, a.X1, 0, z0 + plinth); a.box(a.X0 + 8, a.YF + 8, z0 + plinth, a.X1 - 8, -8, z0 + plinth + 18);
  a.box(cx - trW / 2, a.YF + 12, z0 + plinth + 18, cx + trW / 2, -12, hoodZ);
  a.frame(cx - trW * 0.32, z0 + plinth + H * 0.1, cx + trW * 0.32, hoodZ - H * 0.06, a.YF + 5, a.YF + 12, 20);
  a.ycyl(a.YF + 8, a.YF + 14, cx, z0 + plinth + H * 0.3, trW * 0.18, 24); a.ycyl(a.YF + 8, a.YF + 14, cx, z0 + plinth + H * 0.3, trW * 0.07, 14);
  a.tube([[cx, a.YF + 10, hoodZ - H * 0.1], [cx, a.YF + 10, z0 + plinth + H * 0.18]], [1.6, 1.6], 4);
  a.box(a.X0 + 5, a.YF + 5, hoodZ, a.X1 - 5, -5, hoodZ + 12);
  const hz1 = hoodZ + H * 0.2;
  a.box(cx - trW * 0.5, a.YF + 20, hoodZ + 12, cx + trW * 0.5, -10, hz1);
  const dr = trW * 0.32, dz = hoodZ + 12 + (hz1 - hoodZ - 12) * 0.52;
  a.ycyl(a.YF + 16, a.YF + 22, cx, dz, dr, 32); ringXZ(a, cx, dz, a.YF + 14, dr, 3, 32);
  for (let k = 0; k < 12; k++) { const t = (k / 12) * 2 * PI; a.box(cx + dr * 0.82 * m.cos(t) - 3, a.YF + 12, dz + dr * 0.82 * m.sin(t) - 3, cx + dr * 0.82 * m.cos(t) + 3, a.YF + 16, dz + dr * 0.82 * m.sin(t) + 3); }
  a.tube([[cx, a.YF + 12, dz], [cx + dr * 0.55 * m.cos(0.5), a.YF + 12, dz + dr * 0.55 * m.sin(0.5)]], [2.5, 1.2], 4); a.tube([[cx, a.YF + 12, dz], [cx - dr * 0.35, a.YF + 12, dz + dr * 0.35]], [3, 1.5], 4);
  for (const s of [-1, 1]) { const x = cx + s * (trW * 0.5 + 8); a.cyl(x, a.YF + 30, hoodZ + 12, hz1, 8, 12); a.ell(x, a.YF + 30, hz1 + 4, 8, 8, 8, 8, 5); }
  if (v.hood === 'flat') { a.box(a.X0, a.YF, hz1, a.X1, 0, hz1 + 22); a.box(a.X0 + 14, a.YF + 10, hz1 + 22, a.X1 - 14, -10, hz1 + 34); }
  else if (v.hood === 'arch') { prismY(a, [[cx - trW / 2 - 6, hz1], [cx + trW / 2 + 6, hz1], [cx + trW * 0.4, hz1 + trW * 0.2], [cx, hz1 + trW * 0.26], [cx - trW * 0.4, hz1 + trW * 0.2]], a.YF + 10, -8); a.ell(cx, a.cy, a.Z1 - 12, 10, 10, 12, 8, 5); }
  else { for (const s of [-1, 1]) prismY(a, [[cx + s * 4, hz1], [cx + s * (trW / 2 + 12), hz1], [cx + s * (trW / 2 + 12), hz1 + 8], [cx + s * 4, hz1 + trW * 0.16]], a.YF + 6, -6); a.box(cx - 20, a.YF + 20, hz1 + 20, cx + 20, -20, hz1 + trW * 0.16 + 10); a.cyl(cx, a.cy, hz1 + trW * 0.16 + 10, a.Z1 - 14, 7, 10); a.ell(cx, a.cy, a.Z1 - 8, 9, 9, 8, 8, 5); }
  a.rect(a.X0, a.YF, a.X1, 0); a.rect(cx - trW / 2, a.YF + 12, cx + trW / 2, -12, 'EQUIP-DETAIL'); a.circ(cx - trW * 0.5 - 8, a.YF + 30, 8, 'EQUIP-DETAIL'); a.circ(cx + trW * 0.5 + 8, a.YF + 30, 8, 'EQUIP-DETAIL');
  a.log('Added the plinth, the waist case with a glazed door frame, a brass disc and pendulum rod, the hood with a dial, hour marks and hands, two turned columns and a ' + (v.hood === 'flat' ? 'flat cornice' : v.hood === 'arch' ? 'arched pediment' : 'broken pediment with a finial') + ' (plan and 3D).');
}
function alarmClock(a, v) {
  const r = a.H * 0.34, cx = a.cx, cy = a.cy, z0 = a.Z0, zc = z0 + a.H * 0.4 + r * 0.25 + 4, yf = a.YF + 6, yb = -a.D * 0.1;
  a.ycyl(yf, yb, cx, zc, r, 36);
  for (const s of [-1, 1]) a.tube([[cx + s * r * 0.5, cy, zc - r * 0.85], [cx + s * r * 0.62, cy, z0 + 4]], [6, 8], 8);
  a.cyl(cx, cy, z0, z0 + 6, 0.01, 4);
  ringXZ(a, cx, zc, yf, r, 3.2, 36);
  a.ycyl(yf - 3, yf, cx, zc, r - 5, 36);
  for (let k = 0; k < 12; k++) { const t = (k / 12) * 2 * PI; a.box(cx + r * 0.8 * m.cos(t) - 2.2, yf - 6, zc + r * 0.8 * m.sin(t) - 2.2, cx + r * 0.8 * m.cos(t) + 2.2, yf - 3, zc + r * 0.8 * m.sin(t) + 2.2); }
  a.tube([[cx, yf - 5, zc], [cx + r * 0.5 * m.cos(1.0), yf - 5, zc + r * 0.5 * m.sin(1.0)]], [2.4, 1.1], 4); a.tube([[cx, yf - 5, zc], [cx - r * 0.3, yf - 5, zc + r * 0.42]], [3, 1.4], 4); a.tube([[cx, yf - 5, zc], [cx + r * 0.62, yf - 5, zc - r * 0.5]], [0.9, 0.9], 4);
  a.cyl(cx, yf - 4, zc, zc + 0.01, 0.01, 3); a.ell(cx, yf - 5, zc, 3.5, 3.5, 3.5, 6, 4);
  for (const s of [-1, 1]) a.ell(cx + s * r * 0.52, cy - (yf - yb) * 0.0 + (yf + yb) / 2 - (yf + yb) / 2 + (yf + yb) / 2, zc + r * 0.98, r * 0.34, r * 0.34, r * 0.3, 14, 6);
  a.tube([[cx - r * 0.2, (yf + yb) / 2, zc + r * 1.2], [cx, (yf + yb) / 2, zc + r * 1.0], [cx + r * 0.2, (yf + yb) / 2, zc + r * 1.2]], [2, 2, 2], 5); a.cyl(cx, (yf + yb) / 2, zc + r * 0.95, zc + r * 1.2, 2.4, 6);
  a.cyl(cx + r * 0.62, yb - 6, zc - r * 0.4, zc - r * 0.1, 0.01, 3); a.ycyl(yb, yb + 0, cx, zc, 0.01, 3);
  a.circ(cx, cy, r, 'EQUIP-DETAIL'); a.rect(cx - r, yf, cx + r, yb);
  for (const s of [-1, 1]) a.circ(cx + s * r * 0.52, (yf + yb) / 2, r * 0.34, 'EQUIP-DETAIL');
  a.log('Added the round case with a bezel, dial, twelve hour marks and three hands, two bells with a hammer and a carry loop on top, and two feet (plan and 3D).');
}
function plantTower(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, n = v.n, zt = a.Z1 - 280;
  a.cyl(cx, cy, z0, z0 + 14, R * 0.72, 28); a.cyl(cx, cy, z0 + 14, zt, 16, 12);
  for (let k = 0; k < n; k++) {
    const z = z0 + 150 + (k * (zt - z0 - 150)) / (n - 1), Rt = R * (1 - 0.1 * k) * 0.92, rp = Rt * 0.62;
    revolve(a, cx, cy, [[0.01, z - 8], [Rt * 0.6, z - 6], [Rt, z - 2], [Rt, z + 8], [0.01, z + 8]], 28); loop(a, cx, cy, Rt, z + 4, 3, 28, 5);
    a.cyl(cx, cy, z - 40, z - 8, 24, 12);
    potPlant(a, cx, cy, z + 8, rp * 0.72, rp, rp * 1.0, 6 + (k % 2), 170 + (k % 3) * 20);
  }
  a.circ(cx, cy, R); for (let k = 0; k < n; k++) a.circ(cx, cy, R * (1 - 0.1 * k) * 0.92, 'EQUIP-DETAIL');
  a.log('Added the round base and pole with ' + n + ' round trays, each holding a potted plant with leaf blades (plan and 3D).');
}
function xmasTree(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, n = v.n, zb = z0 + 90, zt = a.Z1 - 70, ht = (zt - zb);
  a.cyl(cx, cy, z0 + 20, zb + 60, 14, 10);
  for (let k = 0; k < 4; k++) { const t = (k / 4) * 2 * PI + 0.4; a.tube([[cx, cy, z0 + 62], [cx + R * 0.52 * m.cos(t), cy + R * 0.52 * m.sin(t), z0 + 20]], [11, 9], 8); a.line(cx, cy, cx + R * 0.52 * m.cos(t), cy + R * 0.52 * m.sin(t)); }
  for (let k = 0; k < n; k++) {
    const f0 = k / n, f1 = (k + 1.6) / n, r0 = R * (1 - f0 * 0.92) * 0.98, za = zb + ht * f0 * 0.98, zc = m.min(zb + ht * f1, zt);
    a.cone(cx, cy, za, zc, r0, r0 * 0.14, 22);
    const nb = m.max(5, m.floor(r0 / 28));
    for (let j = 0; j < nb; j++) { const t = (j / nb) * 2 * PI + k * 0.7, rr = r0 * 0.86; a.ell(cx + rr * m.cos(t), cy + rr * m.sin(t), za + (zc - za) * 0.12, 9, 9, 10, 6, 4); }
    a.circ(cx, cy, r0, 'EQUIP-DETAIL');
  }
  a.cone(cx, cy, zt, a.Z1 - 16, 14, 0.01, 12); a.ell(cx, cy, a.Z1 - 12, 14, 14, 14, 10, 6); a.circ(cx, cy, R);
  a.log('Added the cross-legged stand, the trunk, ' + n + ' overlapping cone tiers with a ring of baubles on each, and a spire with a ball (plan and 3D).');
}
function gingerJar(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, H = a.H, hb = H * 0.8;
  revolve(a, cx, cy, [[0.01, z0], [R * 0.52, z0], [R * 0.58, z0 + 8], [R * 0.86, z0 + hb * 0.2], [R * 0.97, z0 + hb * 0.4], [R, z0 + hb * 0.58], [R * 0.93, z0 + hb * 0.74], [R * 0.72, z0 + hb * 0.89], [R * 0.52, z0 + hb * 0.97], [R * 0.48, z0 + hb]], 40);
  loop(a, cx, cy, R * 0.5, z0 + 6, 3, 32, 4); loop(a, cx, cy, R * 0.93, z0 + hb * 0.3, 2.2, 40, 4); loop(a, cx, cy, R * 0.95, z0 + hb * 0.72, 2.2, 40, 4); loop(a, cx, cy, R * 0.5, z0 + hb - 1, 3, 32, 4);
  revolve(a, cx, cy, [[R * 0.56, z0 + hb], [R * 0.5, z0 + hb + H * 0.05], [R * 0.26, z0 + hb + H * 0.14], [0.01, z0 + hb + H * 0.17]], 32);
  a.cyl(cx, cy, z0 + hb + H * 0.16, z0 + hb + H * 0.19, R * 0.07, 10); a.ell(cx, cy, z0 + H - H * 0.015, R * 0.14, R * 0.14, H * 0.015 + 4, 10, 5);
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.56, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.5, 'EQUIP-HIDDEN');
  a.log('Added the shouldered jar on a foot ring with bead bands, a collar, and a domed lid with a knob (plan and 3D).');
}
function birdCage(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, H = a.H, st = (v.st || 0) * IN, zc = z0 + st, zv = a.Z1 - (a.Z1 - zc) * 0.3 - 4, n = 20;
  if (st) { revolve(a, cx, cy, [[0.01, z0], [R * 0.7, z0], [R * 0.7, z0 + 10], [R * 0.16, z0 + 40], [R * 0.1, z0 + 90]], 28); a.tube([[cx, cy, z0 + 80], [cx, cy, zc - 20]], [R * 0.08, R * 0.08], 12); a.ell(cx, cy, z0 + st * 0.5, R * 0.14, R * 0.14, R * 0.1, 12, 6); a.ell(cx, cy, z0 + st * 0.75, R * 0.12, R * 0.12, R * 0.08, 12, 6); }
  else for (const t of [0.8, 2.4, 4.0, 5.5]) a.ell(cx + R * 0.7 * m.cos(t), cy + R * 0.7 * m.sin(t), z0 + 6, 9, 9, 8, 8, 5);
  revolve(a, cx, cy, [[0.01, zc - 14 + (st ? 0 : 10)], [R, zc - 12 + (st ? 0 : 10)], [R, zc + 8], [0.01, zc + 8]], 32);
  const Rr = R * 0.94, zb = zc + 8;
  for (let i = 0; i < n; i++) { const t = (i / n) * 2 * PI, x = cx + Rr * m.cos(t), y = cy + Rr * m.sin(t); a.tube([[x, y, zb], [x, y, zv], [cx + Rr * 0.62 * m.cos(t), cy + Rr * 0.62 * m.sin(t), zv + (a.Z1 - zv) * 0.55], [cx + Rr * 0.16 * m.cos(t), cy + Rr * 0.16 * m.sin(t), a.Z1 - 22]], [1.3, 1.3, 1.3, 1.3], 4); }
  for (const z of [zb + 2, zb + (zv - zb) * 0.5, zv]) loop(a, cx, cy, Rr, z, 1.8, 32, 4);
  loop(a, cx, cy, Rr * 0.62, zv + (a.Z1 - zv) * 0.55, 1.6, 28, 4); a.cyl(cx, cy, a.Z1 - 24, a.Z1 - 14, Rr * 0.17, 14);
  a.tube(arcPts([cx - 14, cy, a.Z1 - 14], [cx, cy, a.Z1 + 4 - 4], [cx + 14, cy, a.Z1 - 14], 8), new Array(9).fill(2.2), 5);
  a.tube([[cx - Rr * 0.9, cy, zb + (zv - zb) * 0.34], [cx + Rr * 0.9, cy, zb + (zv - zb) * 0.34]], [4, 4], 8);
  a.tube([[cx - 30, cy, zv - 10], [cx - 30, cy, zv - 70]], [1.2, 1.2], 4); a.ell(cx - 30, cy, zv - 78, 10, 10, 6, 8, 4);
  for (const s of [-1, 1]) { a.cyl(cx + s * Rr * 0.5, cy - Rr * 0.8, zb + 30, zb + 56, 12, 10); }
  a.tube([[cx - Rr * 0.34, cy - Rr * 0.94, zb + 14], [cx + Rr * 0.34, cy - Rr * 0.94, zb + 14], [cx + Rr * 0.34, cy - Rr * 0.94, zb + (zv - zb) * 0.62], [cx - Rr * 0.34, cy - Rr * 0.94, zb + (zv - zb) * 0.62], [cx - Rr * 0.34, cy - Rr * 0.94, zb + 14]], new Array(5).fill(2), 5);
  a.circ(cx, cy, R); a.circ(cx, cy, Rr, 'EQUIP-DETAIL'); for (let i = 0; i < n; i++) { const t = (i / n) * 2 * PI; a.circ(cx + Rr * m.cos(t), cy + Rr * m.sin(t), 1.6, 'EQUIP-DETAIL'); }
  a.log('Added the base tray' + (st ? ' on a turned pedestal with a foot' : ' on four bun feet') + ', ' + n + ' vertical wires with three rings, a domed top with a hanging loop, a front door frame, a perch, feed cups and a swing (plan and 3D).');
}
function bonsai(a, v) {
  const W = a.W, D = a.D, cx = a.cx, cy = a.cy, z0 = a.Z0, H = a.H, ph = H * 0.2, mk = (s) => rrect(cx, cy, W * 0.9 * s, D * 0.9 * s, 40 * s, 4);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * W * 0.34 - 14, cy + sy * D * 0.28 - 10, z0, cx + sx * W * 0.34 + 14, cy + sy * D * 0.28 + 10, z0 + 8);
  a.prism(mk(0.92), z0 + 8, z0 + 14); shellLoft(a, mk, z0 + 10, z0 + ph, (t) => 0.92 + 0.08 * t, 0.06, 4, true); ringPoly(a, mk(1.02), mk(0.95), z0 + ph - 10, z0 + ph);
  a.prism(mk(0.9), z0 + ph - 14, z0 + ph - 5); a.prism(mk(0.82), z0 + ph - 5, z0 + ph - 2);
  a.ell(cx + W * 0.28, cy - D * 0.12, z0 + ph + 2, W * 0.07, D * 0.09, 18, 8, 5); a.ell(cx + W * 0.34, cy + D * 0.14, z0 + ph, W * 0.04, D * 0.06, 10, 8, 4);
  const tx = cx - W * 0.12, ty = cy, tz = z0 + ph - 6, th = H - ph - 8;
  const trunk = [[tx, ty, tz], [tx - W * 0.03, ty, tz + th * 0.2], [tx + W * 0.02, ty, tz + th * 0.4], [tx - W * 0.03, ty, tz + th * 0.6], [tx + W * 0.01, ty, tz + th * 0.78]];
  a.tube(trunk, [W * 0.035, W * 0.03, W * 0.024, W * 0.017, W * 0.01], 10);
  const pads = [[tx - W * 0.2, ty, tz + th * 0.42, 0.17], [tx + W * 0.22, ty + D * 0.05, tz + th * 0.52, 0.17], [tx - W * 0.12, ty - D * 0.1, tz + th * 0.7, 0.15], [tx + W * 0.04, ty + D * 0.08, tz + th * 0.92, 0.15]];
  a.tube([trunk[2], [tx - W * 0.1, ty, tz + th * 0.43], [pads[0][0], ty, pads[0][2] - 4]], [W * 0.016, W * 0.012, W * 0.008], 6); a.tube([trunk[2], [tx + W * 0.12, ty, tz + th * 0.5], [pads[1][0], pads[1][1], pads[1][2] - 4]], [W * 0.016, W * 0.012, W * 0.008], 6); a.tube([trunk[3], [pads[2][0], pads[2][1], pads[2][2] - 4]], [W * 0.012, W * 0.008], 6);
  for (const [x, y, z, s] of pads) for (const [dx, dy, dz, k] of [[0, 0, 0, 1], [0.6, 0.2, -0.1, 0.7], [-0.6, -0.2, 0.05, 0.7], [0.1, 0.5, 0.15, 0.6]]) a.ell(x + dx * W * s * 0.5, y + dy * D * 0.2, z + dz * W * 0.06, W * s * k * 0.55, D * 0.28 * k, H * 0.055 * k + 6, 10, 5);
  a.poly(mk(1.02)); a.poly(mk(0.82), 'EQUIP-DETAIL'); a.circ(tx, ty, W * 0.035, 'EQUIP-DETAIL'); for (const [x, y] of pads) a.ellp(x, y, W * 0.12, D * 0.2, 'EQUIP-DETAIL');
  a.log('Added the glazed tray pot on four feet with a rolled rim, a soil bed with moss and two rocks, a bending tapered trunk with three branches and four foliage pads (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ families
export default [
  // ---- kitchenware
  fam({ cat: 'household/kitchenware', title: 'Generic pierced colander on pedestal', desc: (v) => `Pierced-pattern colander ${v.dia} in across on a pedestal ring, with a rolled rim and two flat ear handles with hanging holes.`,
    vs: [['8 in', 10.7, 8, 4, 0, { dia: 8 }], ['10 in', 12.7, 10, 5, 0, { dia: 10 }], ['12 in', 14.7, 12, 5.8, 0, { dia: 12 }], ['14 in, deep', 16.7, 14, 7, 0, { dia: 14 }]], build: colander }),
  fam({ cat: 'household/kitchenware', title: 'Generic round-bellied teapot', desc: 'Round-bellied teapot on a foot ring with a domed lid and knob, a tapering spout and an arched handle.',
    vs: [['2 cup', 7.6, 4.8, 4.8], ['4 cup', 9.6, 6, 6], ['6 cup', 11.2, 7, 7], ['8 cup', 12.8, 8, 7.8]], build: teapot }),
  fam({ cat: 'household/kitchenware', title: 'Generic plunger coffee press', desc: 'Glass beaker in a metal frame with straps and a base ring, a lid with a plunger rod and knob, a pouring notch and a side handle.',
    vs: [['3 cup, 12 oz', 5.6, 3.6, 7.6, 0, { dia: 3.4 }], ['8 cup, 34 oz', 6.9, 4.6, 10.4, 0, { dia: 4.4 }], ['12 cup, 51 oz', 7.6, 5.1, 12, 0, { dia: 5 }]], build: frenchPress }),
  fam({ cat: 'household/kitchenware', title: 'Generic round-bottom wok on ring stand', desc: (v) => `Round-bottomed wok ${v.dia} in across on a collar ring stand, with a long handle on a bracket and a loop helper handle${v.lid ? ', plus a domed lid with a knob' : ''}.`,
    vs: [['12 in', 12, 21.5, 5.4, 0, { dia: 12 }], ['14 in', 14, 23.5, 6, 0, { dia: 14 }], ['16 in', 16, 25.5, 6.6, 0, { dia: 16 }], ['14 in, with lid', 14, 23.5, 9, 0, { dia: 14, lid: true, bh: 6 }]], build: wok }),
  fam({ cat: 'household/kitchenware', title: 'Generic oval lidded casserole', desc: 'Oval casserole dish with a rolled rim and two lug handles with finger holes, under a stepped domed lid with a knob.',
    vs: [['2.5 qt', 14.6, 8.4, 6.6], ['4 qt', 16.6, 10, 7.6], ['6 qt', 18.6, 11.4, 8.6]], build: casserole }),
  fam({ cat: 'household/kitchenware', title: 'Generic cradled rolling pin', desc: (v) => `Rolling pin with a ${v.body} in barrel and two turned handles, lying in a cradle with two V blocks on a base rail.`,
    vs: [['10 in barrel', 19, 3.6, 3.7, 0, { body: 10 }], ['12 in barrel', 21, 3.6, 3.7, 0, { body: 12 }], ['15 in barrel', 24, 3.6, 3.7, 0, { body: 15 }]], build: rollingPin }),
  fam({ cat: 'household/kitchenware', title: 'Generic utensil crock with tools', desc: (v) => `Stoneware crock with a rim bead and a band, holding ${v.n} standing kitchen tools: spoons, a ladle, a spatula, a whisk and tongs.`,
    vs: [['4 tools, 4.5 in crock', 4.5, 4.5, 11, 0, { n: 4, hc: 5 }], ['5 tools, 5 in crock', 5, 5, 11.5, 0, { n: 5, hc: 5.5 }], ['6 tools, 6 in crock', 6, 6, 12.5, 0, { n: 6, hc: 6.5 }], ['7 tools, 7 in crock', 7, 7, 13.5, 0, { n: 7, hc: 7 }]], build: utensilCrock }),
  fam({ cat: 'household/kitchenware', title: 'Generic draining dish rack', desc: 'Drip tray with a wire grid on posts, a row of plate dividers and a cutlery cup with handles standing in it.',
    vs: [['compact, 16 in', 16, 12.5, 6.1], ['standard, 20 in', 20, 14, 6.1], ['large, 24 in', 24, 15, 6.1]], build: dishRack }),
  fam({ cat: 'household/kitchenware', title: 'Generic pedestal cake stand', desc: (v) => `Cake stand ${v.dia} in across with a round foot, a turned stem with a node and a rimmed plate${v.dome ? ', under a glass dome with a knob' : ''}.`,
    vs: [['9 in plate, low dome', 9.4, 9.4, 8.6, 0, { dia: 9, st: 3.4, dome: true }], ['11 in plate, tall dome', 11.4, 11.4, 13, 0, { dia: 11, st: 4, dome: true }], ['13 in plate, low dome', 13.4, 13.4, 10.4, 0, { dia: 13, st: 4.2, dome: true }], ['12 in plate, open', 12.4, 12.4, 5, 0, { dia: 12, st: 4.2, dome: false }]], build: cakeStand }),
  fam({ cat: 'household/kitchenware', title: 'Generic mortar and pestle', desc: (v) => `Thick bowl ${v.dia} in across on a foot with a rolled rim and a pouring lip, and a bulb-headed pestle leaning in it.`,
    vs: [['4 in', 6.4, 4, 6.6, 0, { dia: 4 }], ['6 in', 9.5, 6, 9.4, 0, { dia: 6 }], ['8 in', 12.5, 8, 12.4, 0, { dia: 8 }]], build: mortar }),
  fam({ cat: 'household/kitchenware', title: 'Generic hand-crank pepper mill', desc: 'Turned wooden mill with grooves and a top nut, and a crank arm with an upright knob.',
    vs: [['6 in', 3.8, 1.7, 6.2, 0, { dia: 1.7 }], ['8 in', 4.4, 2, 8.2, 0, { dia: 2 }], ['12 in', 5.2, 2.4, 12.2, 0, { dia: 2.4 }]], build: pepperMill }),
  // ---- cleaning
  fam({ cat: 'household/cleaning', title: 'Generic robot vacuum cleaner', desc: (v) => `Disc-shaped robot vacuum ${v.w} in across with a front bumper band, side wheels, a spinning side brush and a top cover${v.lidar ? ', a raised sensor turret' : ''}${v.dock ? ', parked against its charging dock' : ''}.`,
    vs: [['11 in disc, no dock', 11, 11, 3, 0, { hr: 3 }], ['12 in disc with dock', 12, 12 + 4.6, 7.5, 0, { hr: 3.1, dock: true }], ['13 in disc with sensor turret and dock', 13, 13 + 4.6, 7.5, 0, { hr: 3, dock: true, lidar: true }], ['14 in disc, tall turret, with dock', 14, 14 + 4.6, 8, 0, { hr: 3.3, dock: true, lidar: true }]], build: robotVac }),
  fam({ cat: 'household/cleaning', title: 'Generic cordless stick vacuum on stand', desc: 'Slim cordless stick vacuum parked on a floor stand with a base plate and a rear post, showing the floor head, wand, dust bin, motor and battery block, and a hoop grip.',
    vs: [['40 in', 13, 11, 40], ['44 in', 13, 11, 44], ['48 in', 14, 12, 48]], build: stickVac }),
  fam({ cat: 'household/cleaning', title: 'Generic steam iron on rest mat', desc: 'Steam iron with a tapered soleplate on a silicone rest mat, an arched handle, a water tank, a dial, a steam button, a spray nozzle and a cord boot.',
    vs: [['travel, 7 in', 4.2, 7.6, 4], ['standard, 11 in', 5.8, 11.8, 6], ['large, 12.5 in', 6.4, 13.2, 6.6]], build: steamIron }),
  fam({ cat: 'household/cleaning', title: 'Generic rotary washing line airer', desc: (v) => `Rotary airer with a ground plate and socket, a pole and hub, four braced arms with tip caps and ${v.lines} rows of washing line.`,
    vs: [['36 in span, 3 lines', 36, 36, 62], ['48 in span, 4 lines', 48, 48, 66], ['60 in span, 5 lines', 60, 60, 70], ['72 in span, 6 lines', 72, 72, 72]], build: rotaryAirer }),
  fam({ cat: 'household/cleaning', title: 'Generic wheeled laundry sorter', desc: (v) => `Tube frame on four casters carrying ${v.bags} fabric laundry bags on hoops with carry straps${v.shelf ? ', under a rimmed top shelf with folded towels' : ''}.`,
    vs: [['two bag, 24 in', 24, 16, 36, 0, { bags: 2 }], ['three bag, 36 in', 36, 16, 36, 0, { bags: 3 }], ['three bag with shelf, 36 in', 36, 16, 43, 0, { bags: 3, shelf: true }]], build: laundrySorter }),
  fam({ cat: 'household/cleaning', title: 'Generic wall rail with standing cleaning tools', desc: (v) => `Wall rail with ${v.n} spring grip clips holding standing tools: a broom, a strand mop, a scrub brush and a squeegee.`,
    vs: [['3 clips, 20 in', 20, 4.2, 60, 0, { n: 3 }], ['4 clips, 26 in', 26, 4.2, 60, 0, { n: 4 }], ['5 clips, 32 in', 32, 4.2, 60, 0, { n: 5 }], ['6 clips, 38 in', 38, 4.2, 60, 0, { n: 6 }]], build: cleanRail }),
  fam({ cat: 'household/cleaning', title: 'Generic toilet brush and plunger set', desc: (v) => v.twin ? 'Two holders side by side: a lidded round holder with a bristle brush and an open holder with a rubber plunger cup.' : `${v.sq ? 'Square' : 'Round'} holder${v.lid ? ' with a lid' : ''} with a bristle brush standing in it.`,
    vs: [['round holder, 15 in', 5, 5, 15, 0, { hh: 9 }], ['square holder, 16 in', 5.4, 5.4, 16, 0, { hh: 10, sq: true }], ['round holder with lid, 18 in', 5.2, 5.2, 18, 0, { hh: 9, lid: true }], ['twin holders, brush and plunger, 22 in', 11.4, 5.6, 22, 0, { twin: true }]], build: toiletSet }),
  fam({ cat: 'household/cleaning', title: 'Generic domestic cleaning trolley', desc: (v) => `Four-post frame on casters with two rimmed trays, a bucket on the lower tray, spray bottles with triggers on the upper tray and a push handle${v.bag ? ', plus a sack on a ring arm' : ''}.`,
    vs: [['compact, 22 in', 22, 14, 36], ['standard, 24 in with sack', 24 + 12, 15, 38, 0, { bag: true }], ['large, 34 in with sack', 34 + 12, 17, 40, 0, { bag: true }]], build: cleanTrolley }),
  fam({ cat: 'household/cleaning', title: 'Generic folding step stool', desc: (v) => `Folding step stool with splayed legs and feet, ${v.n > 1 ? (v.n - 1) + ' treads, ' : ''}a top platform and a cross brace${v.n >= 3 ? ', and a safety hoop' : ''}.`,
    vs: [['one step, 9 in', 13, 11, 9, 0, { n: 1, hp: 9 }], ['two step, 16 in', 16, 18, 16, 0, { n: 2, hp: 16 }], ['three step with hoop, 39 in', 18, 24, 39, 0, { n: 3, hp: 27 }], ['four step with hoop, 50 in', 19, 30, 50, 0, { n: 4, hp: 36 }]], build: stepStool }),
  fam({ cat: 'household/cleaning', title: 'Generic flat mop leaning on wall', desc: (v) => `Rounded mop pad and frame with a swivel fork and ball joint, and a handle that leans back with a grip${v.spray ? ', a trigger housing and a spray bottle on the handle' : ''}.`,
    vs: [['dust, 18 in head', 18, 17, 48, 0, { head: 18 }], ['wet, 14 in head', 14, 14, 50, 0, { head: 14 }], ['spray, 16 in head', 16, 16, 52, 0, { head: 16, spray: true }]], build: flatMop }),
  fam({ cat: 'household/cleaning', title: 'Generic garment steamer on wheeled stand', desc: 'Five-arm base on casters, a water tank, a telescoping pole with a collar, a hanger bar with trouser clips, a hose and the hand steamer parked on the pole.',
    vs: [['standard, 62 in', 24, 24, 62], ['compact, 50 in', 20, 20, 50]], build: garmentSteamer }),
  // ---- storage
  fam({ cat: 'household/storage', title: 'Generic tip-out shoe cabinet', desc: (v) => `Slim cabinet on four legs with a back panel and ${v.n} tip-out shoe flaps with finger grips, one shown ajar with its shelf rails${v.cush ? ', under a padded bench top' : ''}.`,
    vs: [['two flap, 30 in', 30, 10.5, 20, 0, { n: 2 }], ['three flap, 30 in', 30, 10.5, 33, 0, { n: 3 }], ['four flap, 30 in', 30, 10.5, 45, 0, { n: 4 }], ['three flap with bench cushion, 40 in', 40, 11, 36, 0, { n: 3, cush: true }]], build: shoeCabinet }),
  fam({ cat: 'household/storage', title: 'Generic wheeled clothes rail with shelf', desc: (v) => `Two frame ends on casters with ${v.rails || 1} hanging rail${(v.rails || 1) > 1 ? 's' : ''}, a row of hangers with garments on each and a slatted lower shelf.`,
    vs: [['36 in, single rail', 36, 17, 64], ['48 in, single rail', 48, 17, 64], ['60 in, single rail', 60, 18, 66], ['48 in, double rail', 48, 18, 72, 0, { rails: 2 }]], build: garmentRail }),
  fam({ cat: 'household/storage', title: 'Generic framed drawer tower', desc: (v) => `Frame on four feet with a back panel and ${v.n} drawers with front panels, finger-pull bars and label windows.`,
    vs: [['three drawer, 22 in', 12, 15, 23, 0, { n: 3 }], ['four drawer, 30 in', 12, 15, 31, 0, { n: 4 }], ['five drawer, 38 in', 13, 16, 39, 0, { n: 5 }], ['six drawer wide, 40 in', 24, 16, 40, 0, { n: 6 }]], build: drawerTower }),
  fam({ cat: 'household/storage', title: 'Generic lidded archive box', desc: 'Box with a front and back hand hole each, a label plate and a deep telescoping lid.',
    vs: [['letter size, 15 in deep', 10.5, 15.5, 10.2], ['legal size, 15 in deep', 12.5, 15.5, 10.2], ['tall, 16 in deep', 12.5, 16.5, 12.5]], build: archiveBox }),
  fam({ cat: 'household/storage', title: 'Generic tiered spice step rack', desc: (v) => `Stepped shelf with riser panels and end cheeks, a back rail and a row of capped spice jars on each of ${v.n} tiers.`,
    vs: [['two tier, 10 in', 10, 4.9, 6.9, 0, { n: 2 }], ['three tier, 14 in', 14, 7.1, 9.1, 0, { n: 3 }], ['four tier, 20 in', 20, 9.3, 11.3, 0, { n: 4 }]], build: spiceRack }),
  fam({ cat: 'household/storage', title: 'Generic wheeled under-bed storage box', desc: 'Low tray on four swivel casters with a stacking lid with a rim, two latches and a front pull handle.',
    vs: [['shallow, 34 in', 34, 17, 6], ['standard, 40 in', 40, 19, 7], ['deep, 42 in', 42, 22, 9]], build: underBed }),
  fam({ cat: 'household/storage', title: 'Generic clamp-lid pantry jar', desc: 'Glass jar with a shouldered neck, a rubber ring, a glass dome lid and a wire bail clamp.',
    vs: [['small, 4 in', 4.2, 4.2, 5.6], ['1 litre', 4.8, 4.8, 7.2], ['2 litre', 5.9, 5.9, 9.2], ['tall, 1.5 litre', 4.4, 4.4, 11.5]], build: clampJar }),
  fam({ cat: 'household/storage', title: 'Generic cubby wine rack', desc: (v) => `Framed ${v.nx} by ${v.ny} cubby rack on feet with bottles lying in most cubbies, necks out.`,
    vs: [['6 bottle, 3 by 2', 12.4, 14, 11.3, 0, { nx: 3, ny: 2 }], ['12 bottle, 4 by 3', 16.4, 14, 15.3, 0, { nx: 4, ny: 3 }], ['24 bottle, 6 by 4', 24.4, 14, 19.4, 0, { nx: 6, ny: 4 }]], build: wineRack }),
  fam({ cat: 'household/storage', title: 'Generic leaning ladder shelf', desc: (v) => `Two leaning side rails with ${v.n} shelf boards with front lips between them and two cross rails.`,
    vs: [['four shelf, 48 in', 24, 18, 48, 0, { n: 4 }], ['five shelf, 63 in', 26, 20, 63, 0, { n: 5 }], ['six shelf, 72 in', 28, 21, 72, 0, { n: 6 }]], build: ladderShelf }),
  fam({ cat: 'household/storage', title: 'Generic round hat box', desc: (v) => `${v.stack.length > 1 ? 'Three nested round boxes, each' : 'Round box'} with a deep lid, a band and a ribbon loop on the top lid.`,
    vs: [['single, 10 in', 10, 10, 8, 0, { stack: [[10, 6]] }], ['single, 14 in', 14, 14, 11, 0, { stack: [[14, 8.5]] }], ['nested stack of three', 16, 16, 18.5, 0, { stack: [[16, 7], [13, 6], [10, 5]] }]], build: hatBox }),
  fam({ cat: 'household/storage', title: 'Generic upright spinner suitcase', desc: 'Rounded shell with ribs and a zip seam on four twin-wheel casters, with corner guards, a carry handle, a lock plate and a telescoping handle pulled out to its grip bar.',
    vs: [['cabin, 20 in', 14, 9, 38, 0, { bh: 20 }], ['medium, 24 in', 16, 10.5, 42, 0, { bh: 24 }], ['large, 28 in', 18.5, 12, 46, 0, { bh: 28 }]], build: suitcase }),
  // ---- decor
  fam({ cat: 'household/decor', title: 'Generic pedestal fruit bowl', desc: (v) => `Fruit bowl ${v.dia} in across on a round foot and turned stem with a node, with a rolled rim, holding a heap of ${v.nA + v.nB + 1} round fruit with stalks.`,
    vs: [['10 in, with fruit', 10, 10, 11, 0, { dia: 10, nA: 7, nB: 4 }], ['12 in, with fruit', 12, 12, 13.2, 0, { dia: 12, nA: 9, nB: 5 }], ['14 in, with fruit', 14, 14, 15.4, 0, { dia: 14, nA: 11, nB: 6 }]], build: fruitBowl }),
  fam({ cat: 'household/decor', title: 'Generic cushions propped on a settee block', desc: (v) => `Low settee block with a plinth, a seat cushion and a back panel, with ${v.cs.length} stuffed cushions with button tufts propped against it.`,
    vs: [['two 18 in square cushions', 46, 28, 36, 0, { cs: [{ w: 18, h: 18, t: 6 }, { w: 18, h: 18, t: 6 }] }], ['three cushions, mixed sizes', 62, 28, 36, 0, { cs: [{ w: 20, h: 20, t: 6.5 }, { w: 17, h: 17, t: 5.5 }, { w: 14, h: 14, t: 5, round: true }] }], ['bolster and two squares', 66, 28, 36, 0, { cs: [{ w: 22, t: 8, bolster: true }, { w: 18, h: 18, t: 6 }, { w: 18, h: 18, t: 6 }] }], ['lumbar and square pair', 48, 28, 36, 0, { cs: [{ w: 22, h: 12, t: 5 }, { w: 20, h: 20, t: 6 }] }]], build: cushionSeat }),
  fam({ cat: 'household/decor', title: 'Generic floor vase with dried twigs', desc: (v) => `Tall waisted floor vase with a rim bead and a band, holding ${v.n} dried twig stems with side shoots and buds.`,
    vs: [['24 in vase, 40 in stems', 26, 26, 40, 0, { hv: 24, n: 7 }], ['30 in vase, 52 in stems', 30, 30, 52, 0, { hv: 30, n: 9 }], ['20 in vase, 60 in stems', 32, 32, 60, 0, { hv: 20, n: 11 }]], build: floorVase }),
  fam({ cat: 'household/decor', title: 'Generic pivoting cheval mirror', desc: 'Framed mirror tilted back on two pivot knobs, with corner rosettes, on two posts with ball finials and end feet.',
    vs: [['dressing, 48 in', 24, 20, 48], ['full length, 62 in', 26, 24, 62], ['tall, 70 in', 30, 26, 70]], build: chevalMirror }),
  fam({ cat: 'household/decor', title: 'Generic turned-post hourglass', desc: 'Two round end plates with three turned posts holding two glass bulbs with a waist and sand heaps.',
    vs: [['desk, 6 in', 3.2, 3.2, 6], ['mantel, 10 in', 4.8, 4.8, 10], ['large, 16 in', 7, 7, 16]], build: hourglass }),
  fam({ cat: 'household/decor', title: 'Generic faceted terrarium frame', desc: 'Six-sided metal frame on a base with a soil bed, pebbles and four succulent rosettes, under a pyramid roof with a finial; the glass panes are not drawn.',
    vs: [['small, 6 in', 6, 6, 7], ['medium, 9 in', 9, 9, 10], ['large, 12 in', 12, 12, 13]], build: terrarium }),
  fam({ cat: 'household/decor', title: 'Generic longcase clock', desc: (v) => `Case with a plinth and a waist with a glazed door frame, a brass disc and pendulum rod, a hood with a dial, hour marks and hands, and two columns under a ${v.hood === 'flat' ? 'flat cornice' : v.hood === 'arch' ? 'arched pediment' : 'broken pediment with a finial'}.`,
    vs: [['flat cornice, 72 in', 15, 9, 72, 0, { hood: 'flat' }], ['arched pediment, 80 in', 16, 10, 80, 0, { hood: 'arch' }], ['broken pediment, 88 in', 17, 10.5, 88, 0, { hood: 'broken' }]], build: longcaseClock }),
  fam({ cat: 'household/decor', title: 'Generic bedside twin-bell alarm clock', desc: 'Round case with a bezel, a dial with twelve hour marks and three hands, two bells with a hammer and a carry loop on top, and two feet.',
    vs: [['3.5 in face', 4, 2, 6], ['4.5 in face', 5.2, 2.4, 7.8], ['6 in face', 6.8, 3, 10]], build: alarmClock }),
  fam({ cat: 'household/decor', title: 'Generic round-tray plant tower', desc: (v) => `Round base and pole with ${v.n} round trays, each holding a potted plant with leaf blades.`,
    vs: [['three tier, 36 in', 15, 15, 40, 0, { n: 3 }], ['four tier, 48 in', 17, 17, 54, 0, { n: 4 }], ['five tier, 60 in', 18, 18, 68, 0, { n: 5 }]], build: plantTower }),
  fam({ cat: 'household/decor', title: 'Generic artificial fir tree on stand', desc: (v) => `Cross-legged stand, a trunk, ${v.n} overlapping cone tiers with a ring of baubles on each, and a spire with a ball.`,
    vs: [['4 ft, 5 tiers', 28, 28, 52, 0, { n: 5 }], ['6 ft, 7 tiers', 38, 38, 76, 0, { n: 7 }], ['7.5 ft, 9 tiers', 46, 46, 94, 0, { n: 9 }]], build: xmasTree }),
  fam({ cat: 'household/decor', title: 'Generic lidded ginger jar', desc: 'Shouldered jar on a foot ring with bead bands and a collar, under a domed lid with a knob.',
    vs: [['8 in', 6, 6, 8], ['12 in', 8.4, 8.4, 12], ['16 in', 11, 11, 16]], build: gingerJar }),
  fam({ cat: 'household/decor', title: 'Generic domed wire bird cage', desc: (v) => `Base tray ${v.st ? 'on a turned pedestal with a foot' : 'on four bun feet'}, twenty vertical wires with three rings, a domed top with a hanging loop, a front door frame, a perch, feed cups and a swing.`,
    vs: [['tabletop, 18 in', 12, 12, 18], ['floor stand, 56 in', 20, 20, 56, 0, { st: 30 }]], build: birdCage }),
  fam({ cat: 'household/decor', title: 'Generic bonsai in tray pot', desc: 'Glazed tray pot on four feet with a rolled rim, a soil bed with moss and two rocks, a bending tapered trunk with three branches and four foliage pads.',
    vs: [['small, 9 in', 9, 6, 9], ['medium, 14 in', 14, 9, 15]], build: bonsai }),
];

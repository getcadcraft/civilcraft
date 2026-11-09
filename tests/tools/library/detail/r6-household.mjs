/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, household: kitchenware, cleaning and laundry, storage, home accessories. Original geometry; generic sizes. */
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

// ------------------------------------------------------------------------------------------ kitchenware
const lidKnob = (a, cx, cy, z, r = 22) => { a.cyl(cx, cy, z, z + 12, r * 0.4, 10); a.ell(cx, cy, z + 12 + r * 0.45, r * 0.55, r * 0.55, r * 0.5, 10, 6); };
function saucepan(a, v) {
  const R = a.W / 2, cx = a.cx, cy = -R, hb = v.hb * IN, z0 = a.Z0;
  revolve(a, cx, cy, [[0.01, z0], [R * 0.92, z0], [R, z0 + 8], [R, z0 + hb], [0.01, z0 + hb]], 28);
  a.cyl(cx, cy, z0 + hb - 3, z0 + hb + 1, R + 3, 28);                       // rolled rim
  revolve(a, cx, cy, [[R + 2, z0 + hb], [R - 3, z0 + hb + 7], [R * 0.55, z0 + hb + 16], [R * 0.2, z0 + hb + 19], [0.01, z0 + hb + 19]], 28);   // lid
  lidKnob(a, cx, cy, z0 + hb + 19);
  const hz = z0 + hb - 22;
  a.tube([[cx, cy - R + 4, hz], [cx, cy - R - 30, hz + 6], [cx, -a.D + 70, hz + 16], [cx, -a.D + 12, hz + 12], [cx, -a.D, hz + 4]], [9, 9, 11, 13, 10], 10);
  a.box(cx - 16, cy - R - 24, hz - 18, cx + 16, cy - R, hz + 2);
  a.circ(cx, cy, R); a.circ(cx, cy, R - 6, 'EQUIP-DETAIL'); a.circ(cx, cy, 20, 'EQUIP-DETAIL'); a.rect(cx - 13, -a.D, cx + 13, cy - R, 'EQUIP'); a.circ(cx, -a.D + 25, 6, 'EQUIP-DETAIL');
  a.log('Added the straight-sided pot with rolled rim, domed lid and knob, and the long handle on a bracket (plan and 3D).');
}
function fryPan(a, v) {
  const R = a.W / 2, cx = a.cx, cy = -R, z0 = a.Z0, h = a.H - 20;
  vessel(a, cx, cy, [[R * 0.76, z0], [R * 0.82, z0 + 6], [R, z0 + h]], 3, 30);
  loop(a, cx, cy, R, z0 + h, 2.5, 32, 5);
  a.cyl(cx, cy, z0 - 1, z0 + 1, R * 0.7, 28);
  const hz = z0 + h - 12;
  a.tube([[cx, cy - R + 6, hz], [cx, cy - R - 40, hz + 20], [cx, -a.D + 60, hz + 28], [cx, -a.D, hz + 24]], [9, 8, 12, 11], 10);
  a.box(cx - 17, cy - R - 12, hz - 6, cx + 17, cy - R + 8, hz + 12);
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.78, 'EQUIP-DETAIL'); a.rect(cx - 12, -a.D, cx + 12, cy - R, 'EQUIP'); a.circ(cx, -a.D + 18, 5, 'EQUIP-DETAIL');
  a.log('Added the flared shallow pan with rim bead, base ring and a riveted handle with a hanging hole (plan and 3D).');
}
function stockpot(a, v) {
  const R = (a.W - 2 * 38) / 2, cx = a.cx, cy = -a.D / 2, hb = v.hb * IN, z0 = a.Z0;
  revolve(a, cx, cy, [[0.01, z0], [R * 0.96, z0], [R, z0 + 8], [R, z0 + hb], [0.01, z0 + hb]], 32);
  loop(a, cx, cy, R, z0 + hb, 3, 32, 5); loop(a, cx, cy, R + 1, z0 + 10, 3, 32, 5);
  revolve(a, cx, cy, [[R + 3, z0 + hb], [R - 4, z0 + hb + 8], [R * 0.5, z0 + hb + 17], [0.01, z0 + hb + 20]], 32);
  lidKnob(a, cx, cy, z0 + hb + 20, 26);
  for (const s of [-1, 1]) { const x0 = cx + s * (R - 2); sweep(a, arcPts([x0, cy, z0 + hb - 30], [x0 + s * 90, cy, z0 + hb - 30], [x0 + s * 76, cy, z0 + hb - 90]), new Array(11).fill(9), 8); a.box(x0 + s * 6 - 6, cy - 14, z0 + hb - 100, x0 + s * 6 + 6, cy + 14, z0 + hb - 22); a.rect(cx + s * R, cy - 12, cx + s * (R + 38), cy + 12); }
  a.circ(cx, cy, R); a.circ(cx, cy, R - 6, 'EQUIP-DETAIL'); a.circ(cx, cy, 26, 'EQUIP-DETAIL');
  a.log('Added the tall pot with base and rim rings, domed lid and knob, and two loop handles on riveted plates (plan and 3D).');
}
function stoveKettle(a, v) {
  const R = 4 * IN, bx = a.X0 + R + 6, cy = -a.D / 2, z0 = a.Z0, hb = 4.6 * IN;
  revolve(a, bx, cy, [[0.01, z0], [R * 0.95, z0], [R, z0 + 12], [R * 0.98, z0 + hb * 0.55], [R * 0.82, z0 + hb * 0.95], [R * 0.7, z0 + hb], [0.01, z0 + hb]], 32);
  revolve(a, bx, cy, [[R * 0.7, z0 + hb], [R * 0.58, z0 + hb + 14], [R * 0.2, z0 + hb + 22], [0.01, z0 + hb + 24]], 28);
  lidKnob(a, bx, cy, z0 + hb + 24, 24);
  const sx = a.X1 - 8, sz = z0 + hb * 0.82;
  a.tube([[bx + R * 0.7, cy, z0 + hb * 0.3], [bx + R * 1.05, cy, z0 + hb * 0.55], [sx - 40, cy, sz - 40], [sx, cy, sz]], [30, 24, 18, 12], 12);
  sweep(a, arcPts([bx, cy - R * 0.78, z0 + hb * 0.8], [bx, cy - R * 0.9, z0 + hb + 120], [bx, cy + R * 0.2, z0 + hb + 120], 8).concat([[bx, cy + R * 0.78, z0 + hb * 0.8]]), new Array(10).fill(9), 8);
  a.box(bx - 14, cy - R * 0.78 - 8, z0 + hb * 0.55, bx + 14, cy - R * 0.78 + 4, z0 + hb * 0.8);
  a.circ(bx, cy, R); a.circ(bx, cy, R * 0.7, 'EQUIP-DETAIL'); a.line(bx + R * 0.9, cy, sx, cy, 'EQUIP-DETAIL'); a.line(bx, cy - R * 0.78, bx, cy + R * 0.78, 'EQUIP-DETAIL');
  a.log('Added the bell body, domed lid with knob, tapering spout and an arching handle on brackets (plan and 3D).');
}
function jugKettle(a, v) {
  const R = (a.W - 20) / 2 - 4, cx = a.cx, cy = -(R * 1.85 + 6), z0 = a.Z0, h = a.H - 30;
  a.cyl(cx, cy, z0, z0 + 22, R * 1.1, 30);
  revolve(a, cx, cy, [[R * 1.02, z0 + 22], [R * 1.0, z0 + h * 0.5], [R * 0.9, z0 + h], [R * 0.84, z0 + h + 4], [0.01, z0 + h + 4]], 30);
  revolve(a, cx, cy, [[R * 0.86, z0 + h + 4], [R * 0.6, z0 + h + 16], [R * 0.2, z0 + h + 20], [0.01, z0 + h + 20]], 24);
  a.cyl(cx, cy, z0 + h + 20, z0 + h + 28, R * 0.18, 12);
  prismX(a, [[cy - R * 0.5, z0 + h * 0.7], [cy - R * 1.12, z0 + h * 0.92], [cy - R * 0.7, z0 + h * 0.98], [cy - R * 0.3, z0 + h * 0.94]], cx - R * 0.28, cx + R * 0.28);   // spout
  sweep(a, arcPts([cx, cy + R * 0.95, z0 + h * 0.86], [cx, cy + R * 1.8, z0 + h * 0.62], [cx, cy + R * 0.98, z0 + h * 0.2]), new Array(11).fill(11), 8);
  a.box(cx - 12, cy + R * 0.9, z0 + h * 0.2, cx + 12, cy + R * 1.05, z0 + h * 0.86);
  a.cyl(cx, cy - R * 0.2, z0 + h * 0.3, z0 + h * 0.95, 4, 6);
  a.circ(cx, cy, R * 1.1); a.circ(cx, cy, R, 'EQUIP-DETAIL'); a.poly([[cx - R * 0.3, cy - R * 0.9], [cx, cy - R * 1.12], [cx + R * 0.3, cy - R * 0.9]], 'EQUIP-DETAIL'); a.rect(cx - 12, cy + R * 0.9, cx + 12, cy + R * 1.8, 'EQUIP');
  a.log('Added the power base, tapered jug body, hinged lid with knob, pouring spout, gauge window and a rear loop handle (plan and 3D).');
}
function cuttingBoard(a, v) {
  const tab = 2.4 * IN, bw = a.W - tab, x0 = a.X0, cy = -a.D / 2, z0 = a.Z0, z1 = a.Z1;
  const mk = (ins) => rrect(x0 + bw / 2, cy, bw - 2 * ins, a.D - 2 * ins, 12 - m.min(ins, 10), 4);
  a.prism(mk(0), z0, z1 - 3);
  ringPoly(a, mk(0), mk(18), z1 - 3, z1); a.prism(mk(30), z1 - 3, z1);
  const to = rrect(x0 + bw + tab / 2 - 4, cy, tab + 8, 1.1 * IN * 1.15, 14, 4), ti = rrect(x0 + bw + tab / 2 - 4, cy, tab - 22, 1.1 * IN * 0.6, 8, 4);
  ringPoly(a, to, ti, z0, z1);
  a.poly(mk(0)); a.poly(mk(18), 'EQUIP-DETAIL'); a.poly(mk(30), 'EQUIP-DETAIL'); a.poly(to); a.poly(ti, 'EQUIP-DETAIL');
  a.log('Added the board with a raised border and a juice groove, and a handle tab with a hanging hole (plan and 3D).');
}
function mixBowl(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, h = a.H;
  a.cyl(cx, cy, z0, z0 + 9, R * 0.4, 24);
  vessel(a, cx, cy, [[R * 0.36, z0 + 8], ...bowlProf(R * 0.36, R, h - 10, z0 + 8, 8).slice(1)], 3, 32);
  loop(a, cx, cy, R, z0 + h - 1, 3, 32, 5);
  a.circ(cx, cy, R); a.circ(cx, cy, R - 4, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.4, 'EQUIP-HIDDEN');
  a.log('Added the hollow bowl with a foot ring and a rolled rim (plan and 3D).');
}
function jug(a, v) {
  const R = v.dia * IN / 2, cx = a.X0 + 0.7 * IN + R, cy = -a.D / 2, z0 = a.Z0, h = a.H;
  vessel(a, cx, cy, [[R * 0.88, z0], [R * 0.9, z0 + 6], [R, z0 + h * 0.5], [R * 0.97, z0 + h]], 3, 30);
  loop(a, cx, cy, R * 0.97, z0 + h, 2.5, 30, 5);
  a.box(cx - R - 20, cy - 10, z0 + h - 8, cx - R * 0.55, cy + 10, z0 + h);                   // pouring lip
  sweep(a, arcPts([cx + R * 0.95, cy, z0 + h * 0.92], [cx + R * 1.9 + 20, cy, z0 + h * 0.62], [cx + R * 0.96, cy, z0 + h * 0.18]), new Array(11).fill(9), 8);
  for (let i = 1; i <= 4; i++) a.box(cx - 3, cy + R * 0.93 - 4, z0 + 10 + (h - 20) * i / 5 - 1, cx + 14, cy + R * 0.95, z0 + 10 + (h - 20) * i / 5 + 1);
  a.circ(cx, cy, R); a.circ(cx, cy, R - 3, 'EQUIP-DETAIL'); a.poly([[cx - R * 0.5, cy - R * 0.85], [cx - R - 18, cy], [cx - R * 0.5, cy + R * 0.85]], 'EQUIP-DETAIL'); a.rect(cx + R, cy - 9, a.X1, cy + 9, 'EQUIP');
  a.log('Added the tapered hollow jug with rolled rim, pouring lip, scale marks and a looped handle (plan and 3D).');
}
function bakingSheet(a, v) {
  const z0 = a.Z0, z1 = a.Z1, mk = (i) => rrect(a.cx, a.cy, a.W - 2 * i, a.D - 2 * i, 14 - i, 4);
  ringLoft(a, mk(0), mk(3), z0, mk(0), mk(3), z1, true);
  a.prism(mk(2), z0, z0 + 3);
  a.tube(mk(1.2).concat([mk(1.2)[0]]).map(([x, y]) => [x, y, z1 + 0.5]), new Array(21).fill(2.4), 5);
  a.poly(mk(0)); a.poly(mk(3), 'EQUIP-DETAIL');
  a.log('Added the flat sheet with a straight rim and a rolled wire bead around the edge (plan and 3D).');
}
function cakeTin(a, v) {
  const R = v.dia * IN / 2, cx = a.cx, cy = -R, z0 = a.Z0, h = a.H;
  vessel(a, cx, cy, [[R, z0], [R, z0 + h]], 2.5, 36);
  loop(a, cx, cy, R, z0 + h, 2.5, 36, 5); loop(a, cx, cy, R + 0.5, z0 + 6, 2, 36, 5);
  a.cyl(cx, cy, z0 + 6, z0 + 8.5, R + 5, 36);                                                     // removable base lip
  const lx = cx + R;
  a.box(lx - 2, cy - 16, z0 + h * 0.5 - 12, lx + 14, cy + 16, z0 + h * 0.5 + 12); a.box(lx + 6, cy - 6, z0 + h * 0.5 + 12, lx + 18, cy + 6, z0 + h * 0.5 + 22);
  a.circ(cx, cy, R); a.circ(cx, cy, R - 3, 'EQUIP-DETAIL'); a.rect(lx - 2, cy - 16, lx + 18, cy + 16, 'EQUIP-DETAIL');
  a.log('Added the straight-sided tin with a rolled rim, a loose base and the springform clasp (plan and 3D).');
}
function muffinTray(a, v) {
  const nx = v.nx, ny = v.ny, pitch = 3.5 * IN, z0 = a.Z0, zp = z0 + 30;
  const x00 = a.cx - (nx * pitch) / 2, y00 = -(a.D - ny * pitch) / 2 - ny * pitch;
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const cx = x00 + pitch * (i + 0.5), cy = y00 + pitch * (j + 0.5), r = 31;
    vessel(a, cx, cy, [[r * 0.62, z0], [r, zp]], 2.2, 18);
    ringPoly(a, rrect(cx, cy, pitch, pitch, 8, 4), ellPoly(cx, cy, r, r, 20), zp - 1.5, zp);
    a.circ(cx, cy, r); a.circ(cx, cy, r * 0.62, 'EQUIP-DETAIL');
  }
  { const yc = y00 + (ny * pitch) / 2, ring = rrect(a.cx, yc, nx * pitch, ny * pitch, 8, 4); a.tube(ring.concat([ring[0]]).map(([x, y]) => [x, y, zp + 0.5]), new Array(ring.length + 1).fill(2.2), 5); }
  a.rect(x00, y00, x00 + nx * pitch, y00 + ny * pitch, 'EQUIP');
  a.log('Added ' + nx * ny + ' tapered cups with flanged tops joined into one tray with a rolled edge (plan and 3D).');
}
function toaster(a, v) {
  const z0 = a.Z0, zt = a.Z1 - 10, W = a.W, D = a.D, n = v.slots;
  const mk = (s) => rrect(a.cx, a.cy, W * s, D * s, D * 0.3 * s, 4);
  a.prism(mk(0.96), z0 + 12, z0 + 30);
  ringLoft(a, mk(0.96), mk(0.9), z0 + 30, mk(1), mk(0.94), z0 + (zt - z0) * 0.55, false);
  a.prism(mk(0.97), z0 + 30, zt - 6);
  ringLoft(a, mk(1), mk(0.94), z0 + (zt - z0) * 0.55, mk(0.98), mk(0.92), zt - 6, false);
  for (const sx of [-1, 1]) a.cyl(a.cx + sx * W * 0.38, a.cy + D * 0.3, z0, z0 + 14, 14, 8), a.cyl(a.cx + sx * W * 0.38, a.cy - D * 0.3, z0, z0 + 14, 14, 8);
  // top plate with slots
  const rows = n === 2 ? 1 : 2;
  const slotY = rows === 1 ? [a.cy] : [a.cy - D * 0.22, a.cy + D * 0.22];
  a.prism(mk(0.97), zt - 6, zt - 5);
  const sl = W * (n === 2 ? 0.78 : 0.78);
  const top = a.cy + D / 2, bot = a.cy - D / 2;
  const edges = [bot + 8]; for (const y of slotY) { edges.push(y - 4.5, y + 4.5); } edges.push(top - 8);
  for (let i = 0; i < edges.length; i += 2) a.box(a.cx - W / 2 + 6, edges[i], zt - 6, a.cx + W / 2 - 6, edges[i + 1], zt);
  for (const y of slotY) { a.box(a.cx - sl / 2, y - 4.5, zt - 6, a.cx - sl / 2 - 0.01 + 6, y + 4.5, zt); a.box(a.cx + sl / 2 - 6, y - 4.5, zt - 6, a.cx + sl / 2, y + 4.5, zt); a.box(a.cx - sl / 2, y - 4.5, zt - 6, a.cx + sl / 2, y + 4.5, zt - 5); }
  // front controls
  a.box(a.cx + W * 0.34 - 6, a.YF - 2, z0 + (zt - z0) * 0.42, a.cx + W * 0.34 + 6, a.YF + 4, z0 + (zt - z0) * 0.85);
  a.box(a.cx + W * 0.34 - 14, a.YF - 12, z0 + (zt - z0) * 0.62, a.cx + W * 0.34 + 14, a.YF - 1, z0 + (zt - z0) * 0.72);
  revolveY(a, a.cx - W * 0.3, z0 + (zt - z0) * 0.65, a.YF + 4, [[18, 0], [18, 12], [14, 14]], 18);
  a.box(a.cx - W * 0.3 - 1.5, a.YF - 8, z0 + (zt - z0) * 0.65, a.cx - W * 0.3 + 1.5, a.YF - 2, z0 + (zt - z0) * 0.65 + 16);
  a.cyl(a.cx + W * 0.12, a.YF + 3, z0 + (zt - z0) * 0.3, z0 + (zt - z0) * 0.3 + 0.01, 1, 3); a.ell(a.cx + W * 0.1, a.YF + 4, z0 + (zt - z0) * 0.32, 12, 3, 6, 8, 4);
  a.poly(mk(1)); a.poly(mk(0.94), 'EQUIP-DETAIL');
  for (const y of slotY) a.rect(a.cx - sl / 2, y - 4.5, a.cx + sl / 2, y + 4.5, 'EQUIP-DETAIL');
  a.log('Added the rounded body on feet, the top plate with ' + n + ' bread slots, a lever, a browning dial and a cancel button (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ cleaning
function broom(a, v) {
  const cx = a.cx, cy = -a.D / 2, z0 = a.Z0, hw = a.W / 2;
  if (v.push) {
    const bh = 2.6 * IN, bd = a.D - 14;
    a.box(cx - hw, cy - bd / 2, z0 + bh, cx + hw, cy + bd / 2, z0 + bh + 40);                  // wood block
    a.box(cx - hw + 3, cy - bd / 2 + 4, z0, cx + hw - 3, cy + bd / 2 - 4, z0 + bh);            // bristle mass
    for (const f of [0.25, 0.5, 0.75]) a.box(cx - hw + 2, cy - bd / 2 + 2, z0 + bh * f - 1.5, cx + hw - 2, cy + bd / 2 - 2, z0 + bh * f + 1.5);
    a.box(cx - 45, cy - 30, z0 + bh + 40, cx + 45, cy + 30, z0 + bh + 70);                    // socket plate
    for (const s of [-1, 1]) a.tube([[cx, cy, z0 + bh + 400], [cx + s * hw * 0.8, cy, z0 + bh + 40]], [8, 8], 8);
    a.cone(cx, cy, z0 + bh + 70, z0 + bh + 400, 26, 15, 12);
  } else {
    prismY(a, [[cx - hw + 4, z0 + 0], [cx + hw - 4, z0 + 75], [cx + hw - 4, z0 + 135], [cx - hw + 4, z0 + 135]], cy - 38, cy + 38);
    for (const f of [0.35, 0.75]) a.box(cx - hw + 3, cy - 40, z0 + 135 * f - 1.5 + 20, cx + hw - 3, cy + 40, z0 + 135 * f + 1.5 + 20);
    a.box(cx - hw, cy - 40, z0 + 135, cx + hw, cy + 40, z0 + 175);
    a.cone(cx, cy, z0 + 175, z0 + 330, 30, 15, 12);
  }
  a.cyl(cx, cy, z0 + (v.push ? 2.6 * IN + 400 : 330), a.Z1, 11, 12);
  a.ell(cx, cy, a.Z1 - 22, 13, 13, 22, 8, 5);
  a.rect(cx - hw, cy - (v.push ? (a.D - 14) / 2 : 38), cx + hw, cy + (v.push ? (a.D - 14) / 2 : 38)); a.circ(cx, cy, 11, 'EQUIP-DETAIL');
  a.log('Added the ' + (v.push ? 'wood block, bristle mass with bands, socket plate, two diagonal braces' : 'wood block, angled-cut bristles with bands, a socket') + ' and the handle with its hanging eye (plan and 3D).');
}
function mopBucket(a, v) {
  const W = a.W, D = a.D, cx = a.cx, cy = -D / 2, z0 = a.Z0, bh = v.bh * IN;
  const mk = (s) => rrect(cx, cy, W * s, D * s, 70 * s, 4);
  a.prism(mk(0.72), z0 + 20, z0 + 34);
  shellLoft(a, mk, z0 + 30, z0 + bh, (t) => 0.76 + 0.24 * t, 0.07, 6);
  ringPoly(a, mk(1.0), mk(0.9), z0 + bh - 14, z0 + bh);
  for (const sx of [-1, 1]) a.cyl(cx + sx * W * 0.3, cy + D * 0.28, z0, z0 + 24, 20, 10), a.cyl(cx + sx * W * 0.3, cy - D * 0.28, z0, z0 + 24, 20, 10);
  // wringer: two side plates, a press plate and a lever
  const wy = cy + D * 0.22;
  for (const s of [-1, 1]) a.box(cx + s * W * 0.27 - 5, wy - 60, z0 + bh, cx + s * W * 0.27 + 5, wy + 60, z0 + bh + 250);
  a.box(cx - W * 0.27, wy - 6, z0 + bh + 120, cx + W * 0.27, wy + 6, z0 + bh + 230);
  a.tube([[cx, wy + 70, z0 + bh + 60], [cx, wy + 120, z0 + bh + 380], [cx, wy + 60, z0 + bh + 520]], [8, 8, 8], 8);
  a.ell(cx, wy + 60, z0 + bh + 535, 14, 28, 12, 8, 5);
  // mop
  const mx = cx, my = cy - D * 0.12, zh = z0 + bh * 0.92;
  a.cyl(mx, my, zh + 60, a.Z1, 11, 12); a.cyl(mx, my, zh + 10, zh + 80, 30, 12); a.ell(mx, my, zh, 34, 34, 22, 10, 6);
  for (let i = 0; i < 14; i++) { const t = (i / 14) * 2 * PI; a.tube([[mx + 22 * m.cos(t), my + 22 * m.sin(t), zh], [mx + 55 * m.cos(t), my + 55 * m.sin(t), zh - 80], [mx + 70 * m.cos(t), my + 70 * m.sin(t), zh - 135]], [9, 8, 6], 5); }
  a.poly(mk(1)); a.poly(mk(0.9), 'EQUIP-DETAIL'); a.rect(cx - W * 0.27 - 5, wy - 60, cx + W * 0.27 + 5, wy + 60, 'EQUIP-DETAIL'); a.circ(mx, my, 34, 'EQUIP-DETAIL');
  a.log('Added the tapered bucket with rim and feet, the squeeze wringer with plates and a lever, and a strand mop on its handle (plan and 3D).');
}
function bucket(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, bh = v.bh * IN, mk = (s) => ellPoly(cx, cy, R * s, R * s, 32);
  a.cyl(cx, cy, z0, z0 + 8, R * 0.74, 28);
  shellLoft(a, mk, z0 + 6, z0 + bh, (t) => 0.76 + 0.24 * t, 0.04, 6);
  loop(a, cx, cy, R, z0 + bh, 4, 32, 5); loop(a, cx, cy, R * 0.8, z0 + 8, 4, 28, 5);
  const ah = a.Z1 - (z0 + bh) - 20, N = 14, pts = [];
  for (let i = 0; i <= N; i++) { const t = (i / N) * PI; pts.push([cx - R * 0.97 * m.cos(t), cy, z0 + bh + ah * m.sin(t)]); }
  a.tube(pts, new Array(N + 1).fill(4), 6);
  a.xcyl(cx - 55, cx + 55, cy, z0 + bh + ah, 14, 10);
  for (const s of [-1, 1]) a.box(cx + s * R * 0.97 - 9, cy - 14, z0 + bh - 40, cx + s * R * 0.97 + 9, cy + 14, z0 + bh);
  a.circ(cx, cy, R); a.circ(cx, cy, R - 4, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.76, 'EQUIP-HIDDEN'); a.line(cx - R, cy, cx + R, cy, 'EQUIP-DETAIL');
  a.log('Added the tapered pail with rim and base rings, side lugs, a wire bail and the grip (plan and 3D).');
}
function upright(a, v) {
  const W = a.W, cx = a.cx, z0 = a.Z0, Dn = 6 * IN, yF = a.YF;
  prismX(a, [[yF, z0 + 22], [yF + Dn, z0 + 20], [yF + Dn, z0 + 110], [yF + 70, z0 + 95], [yF, z0 + 55]], cx - W / 2, cx + W / 2);
  a.box(cx - W / 2 + 12, yF - 3, z0 + 28, cx + W / 2 - 12, yF + 1, z0 + 78);                      // brush roll window
  for (const s of [-1, 1]) a.xcyl(cx + s * (W / 2 - 30) - 14, cx + s * (W / 2 - 30) + 14, -a.D * 0.18, z0 + 55, 55, 14);
  const by = -a.D * 0.3;
  a.box(cx - 80, by - 85, z0 + 60, cx + 80, by + 85, z0 + 300);                                    // motor housing
  a.cyl(cx, by, z0 + 300, z0 + 720, 75, 24); a.cyl(cx, by, z0 + 720, z0 + 760, 82, 24);       // dust bin and lid
  a.box(cx - 30, by - 100, z0 + 300, cx + 30, by - 70, z0 + 700);                                  // bin release spine
  a.tube([[cx, by + 20, z0 + 760], [cx, by + 30, a.Z1 - 120], [cx, by + 10, a.Z1 - 40], [cx, by - 60, a.Z1 - 20]], [18, 16, 16, 16], 10);
  sweep(a, arcPts([cx, by - 60, a.Z1 - 20], [cx, by - 150, a.Z1 - 60], [cx, by - 80, a.Z1 - 180]), new Array(11).fill(15), 8);
  a.cyl(cx, by + 50, z0 + 560, z0 + 600, 16, 8);
  a.rect(cx - W / 2, yF, cx + W / 2, yF + Dn); a.circ(cx, by, 80); a.circ(cx, by, 75, 'EQUIP-DETAIL'); a.rect(cx - 80, by - 85, cx + 80, by + 85, 'EQUIP-DETAIL');
  a.log('Added the wedge nozzle with a roll window and wheels, the motor housing, the clear bin, handle and grip loop (plan and 3D).');
}
function canister(a, v) {
  const W = a.W, cx = a.cx, z0 = a.Z0, bd = 13 * IN, bcy = -bd / 2 - 20;
  a.ell(cx, bcy, z0 + 190, W / 2 - 10, bd / 2, 120, 24, 12);
  a.box(cx - W * 0.3, bcy - bd * 0.35, z0 + 250, cx + W * 0.3, bcy + bd * 0.35, z0 + 330);          // lid
  for (const s of [-1, 1]) { a.xcyl(cx + s * (W / 2 - 8), cx + s * (W / 2 + 12) - (s > 0 ? 0 : 0), bcy + bd * 0.28, z0 + 85, 85, 16); a.xcyl(cx + s * (W / 2 + 12) - s * 22, cx + s * (W / 2 - 12), bcy + bd * 0.28, z0 + 85, 85, 16); }
  a.xcyl(cx - 12, cx + 12, bcy - bd * 0.4, z0 + 40, 40, 10);
  const ye = bcy - bd / 2 + 10, zh = a.Z1 - 80, headY = a.YF + 2.2 * IN;
  sweep(a, arcPts([cx, ye, z0 + 260], [cx, ye - 180, z0 + 60], [cx, headY + 200, z0 + 200]), new Array(11).fill(22), 10);   // hose
  a.tube([[cx, headY + 200, z0 + 200], [cx, bcy, zh - 60], [cx, bcy - 60, zh]], [14, 14, 14], 10);                                // wand
  a.tube([[cx, bcy - 60, zh], [cx, bcy - 100, zh + 30]], [20, 20], 10);
  prismX(a, [[a.YF, z0 + 18], [a.YF + 2.6 * IN, z0 + 14], [a.YF + 2.6 * IN, z0 + 70], [a.YF + 80, z0 + 66], [a.YF, z0 + 40]], cx - W * 0.4, cx + W * 0.4);
  a.cone(cx, a.YF + 2.6 * IN + 30, z0 + 40, z0 + 130, 28, 14, 10);
  a.ellp(cx, bcy, W / 2 - 10, bd / 2); a.rect(cx - W * 0.4, a.YF, cx + W * 0.4, a.YF + 2.6 * IN); a.line(cx, bcy - bd / 2, cx, a.YF + 2.6 * IN, 'EQUIP-DETAIL');
  a.log('Added the domed body with lid, two rear wheels and a front caster, the hose, the wand with a handle and the floor head (plan and 3D).');
}
function ironBoard(a, v) {
  const W = a.W, D = a.D, cx = a.cx, cy = -D / 2, zt = a.Z1, th = 36;
  const poly = [[a.X0, a.YF + 40], [a.X0 + W * 0.58, a.YF], [a.X1 - W * 0.04, cy - D * 0.17], [a.X1 - W * 0.04, cy + D * 0.17], [a.X0 + W * 0.58, a.YB], [a.X0, a.YB - 40]];
  a.prism(poly, zt - th * 0.6, zt - 2);
  a.prism(poly.map(([x, y]) => [cx + (x - cx) * 0.97, cy + (y - cy) * 0.97]), zt - th, zt - th * 0.6);
  a.prism(poly.map(([x, y]) => [cx + (x - cx) * 0.95, cy + (y - cy) * 0.95]), zt - 6, zt);
  const lw = D * 0.34;
  for (const fx of [0.3, 0.72]) {
    const x = a.X0 + W * fx;
    for (const s of [-1, 1]) { a.tube([[x, cy + s * lw * 0.2, zt - th], [x, cy + s * D * 0.46, a.Z0 + 14]], [9, 9], 6); a.tube([[x, cy - s * lw * 0.2, zt - th], [x, cy - s * D * 0.46, a.Z0 + 14]], [9, 9], 6); }
    a.box(x - 10, cy - D * 0.46, a.Z0, x + 10, cy - D * 0.46 + 36, a.Z0 + 16); a.box(x - 10, cy + D * 0.46 - 36, a.Z0, x + 10, cy + D * 0.46, a.Z0 + 16);
    a.line(x, cy - D * 0.46, x, cy + D * 0.46, 'EQUIP-DETAIL');
  }
  a.tube([[a.X0 + W * 0.3, cy, zt - th - 40], [a.X0 + W * 0.72, cy, zt - th - 40]], [7, 7], 6);                // cross rail
  a.box(a.X1 - W * 0.14, cy - 55, zt - th - 20, a.X1 - 10, cy + 55, zt - th);                                // iron rest
  a.poly(poly); a.poly(poly.map(([x, y]) => [cx + (x - cx) * 0.9, cy + (y - cy) * 0.9]), 'EQUIP-DETAIL'); a.rect(a.X1 - W * 0.14, cy - 55, a.X1 - 10, cy + 55, 'EQUIP-DETAIL');
  a.log('Added the tapered padded top with a rest at the nose, two splayed leg frames with feet and a cross rail (plan and 3D).');
}
function laundryBasket(a, v) {
  const cx = a.cx, cy = a.cy, z0 = a.Z0, W = a.W, D = a.D;
  const mk = v.kind === 'rect' ? (s) => rrect(cx, cy, W * s, D * s, 60 * s, 4) : (s) => ellPoly(cx, cy, (W / 2) * s, (D / 2) * s, 32);
  const bh = v.bh * IN;
  a.prism(mk(0.76), z0, z0 + 12);
  shellLoft(a, mk, z0 + 10, z0 + bh, (t) => 0.78 + 0.22 * t, 0.035, 6);
  for (const f of [0.25, 0.5, 0.75]) a.tube(mk(0.78 + 0.22 * f).concat([mk(0.78 + 0.22 * f)[0]]).map(([x, y]) => [x, y, z0 + 10 + (bh - 10) * f]), new Array(mk(1).length + 1).fill(2.4), 4);
  a.tube(mk(1).concat([mk(1)[0]]).map(([x, y]) => [x, y, z0 + bh]), new Array(mk(1).length + 1).fill(4), 5);
  for (const s of [-1, 1]) { a.box(cx + s * (W / 2 - 14) - 12, cy - 55, z0 + bh - 90, cx + s * (W / 2 - 14) + 12, cy + 55, z0 + bh - 40); }
  if (v.lid) {
    revolve(a, cx, cy, [[W / 2 * 1.02, z0 + bh], [W / 2 * 0.9, z0 + bh + 40], [W / 2 * 0.4, z0 + bh + 80], [0.01, z0 + bh + 90]], 32);
    a.cyl(cx, cy, z0 + bh + 88, z0 + bh + 100, 22, 10); a.ell(cx, cy, z0 + bh + 112, 30, 30, 26, 10, 6);
  }
  a.poly(mk(1)); a.poly(mk(0.94), 'EQUIP-DETAIL'); a.poly(mk(0.76), 'EQUIP-HIDDEN');
  a.log('Added the tapered woven-style body with bands, base, top rim and moulded handle grips' + (v.lid ? ', plus a domed lid with a knob' : '') + ' (plan and 3D).');
}
function airer(a, v) {
  const W = a.W, D = a.D, n = v.tiers, z0 = a.Z0, H = a.H, cx = a.cx, cy = -D / 2;
  const lx = (z) => (1 - (z - z0) / H * 0.12);
  const xs = [a.X0 + 30, a.X1 - 30], ys = [-30, -D + 30];
  for (const x of xs) for (const y of ys) a.tube([[x, y, z0 + 6], [x, y, a.Z1 - 6]], [10, 10], 8);
  for (const y of ys) a.tube([[xs[0], y, z0 + 6], [xs[1], y, z0 + 6]], [8, 8], 6);
  for (const x of xs) a.tube([[x, ys[0], z0 + 6], [x, ys[1], z0 + 6]], [8, 8], 6);
  for (let i = 0; i < n; i++) {
    const z = z0 + 120 + ((H - 200) * i) / (n - 1);
    for (const y of ys) a.tube([[xs[0], y, z], [xs[1], y, z]], [7, 7], 6);
    a.tube([[xs[0], ys[0], z], [xs[0], ys[1], z]], [7, 7], 6); a.tube([[xs[1], ys[0], z], [xs[1], ys[1], z]], [7, 7], 6);
    for (let k = 1; k <= 3; k++) { const y = ys[0] + ((ys[1] - ys[0]) * k) / 4; a.tube([[xs[0], y, z], [xs[1], y, z]], [5.5, 5.5], 6); a.line(xs[0], y, xs[1], y, 'EQUIP-DETAIL'); }
  }
  for (const x of xs) for (const y of ys) a.circ(x, y, 10);
  a.rect(xs[0], ys[1], xs[1], ys[0], 'EQUIP-DETAIL');
  a.log('Added four corner uprights with a base frame and ' + n + ' tiers of drying rails (plan and 3D).');
}
function dustpan(a, v) {
  const z0 = a.Z0;
  if (!v.long) {
    const px = a.X0 + 5 * IN, cy = -a.D / 2;
    prismX(a, [[cy - 4 * IN, z0], [cy + 3.5 * IN, z0], [cy + 3.5 * IN, z0 + 36], [cy - 4 * IN, z0 + 4]], a.X0 + 4, a.X0 + 10 * IN - 4);
    a.box(a.X0 + 4, cy + 3.5 * IN - 2, z0, a.X0 + 10 * IN - 4, cy + 3.5 * IN + 2, z0 + 36);
    a.tube([[a.X0 + 5 * IN, cy + 3.5 * IN, z0 + 22], [a.X0 + 5 * IN, cy + 3.5 * IN + 60, z0 + 40], [a.X0 + 5 * IN, -4, z0 + 44]], [14, 12, 10], 8);
    const bx = a.X0 + 12.5 * IN;
    a.box(bx - 60, cy - 60, z0 + 4, bx + 100, cy + 60, z0 + 50);
    for (let i = 0; i < 6; i++) a.box(bx - 54 + i * 26, cy - 54, z0 + 0, bx - 34 + i * 26, cy + 54, z0 + 8);
    a.tube([[bx + 100, cy, z0 + 30], [a.X1 - 2, cy, z0 + 30]], [14, 14], 8);
    a.rect(a.X0 + 4, cy - 4.5 * IN, a.X0 + 10 * IN - 4, cy + 3.5 * IN); a.rect(bx - 60, cy - 60, a.X1, cy + 60);
  } else {
    const cx = a.X0 + 8 * IN, cy = -a.D / 2;
    prismX(a, [[a.YF + 6, z0], [a.YF + 9 * IN, z0], [a.YF + 9 * IN, z0 + 40], [a.YF + 6, z0 + 4]], a.X0 + 6, a.X0 + 10 * IN);
    a.box(a.X0 + 6, a.YF + 9 * IN - 2, z0, a.X0 + 10 * IN, a.YF + 9 * IN + 2, z0 + 40);
    a.tube([[a.X0 + 5 * IN, a.YF + 9 * IN, z0 + 22], [a.X0 + 5 * IN, a.YF + 9 * IN + 80, a.Z1 - 20]], [14, 12], 8);
    const bx = a.X1 - 5 * IN;
    a.box(bx - 100, a.YF + 40, z0, bx + 100, a.YF + 40 + 2.4 * IN, z0 + 60);
    a.tube([[bx, a.YF + 40 + 1.2 * IN, z0 + 60], [bx, a.YF + 40 + 1.2 * IN + 40, a.Z1 - 20]], [12, 11], 8);
    a.rect(a.X0 + 6, a.YF + 6, a.X0 + 10 * IN, a.YF + 9 * IN); a.rect(bx - 100, a.YF + 40, bx + 100, a.YF + 40 + 2.4 * IN);
  }
  a.log('Added the sloped dustpan with a rubber lip and handle, and a bristle brush with its handle (plan and 3D).');
}
function caddy(a, v) {
  const W = a.W, D = a.D, cx = a.cx, cy = -D / 2, z0 = a.Z0, bh = 8 * IN, n = v.bottles;
  const mk = (s) => rrect(cx, cy, W * s, D * s, 40 * s, 3);
  a.prism(mk(0.9), z0, z0 + 8);
  shellLoft(a, mk, z0 + 6, z0 + bh, (t) => 0.9 + 0.1 * t, 0.03, 4);
  a.box(cx - 3, cy - D * 0.45, z0 + 8, cx + 3, cy + D * 0.45, z0 + bh);
  sweep(a, arcPts([cx, cy - D * 0.5 + 12, z0 + bh], [cx, cy, z0 + bh + 300], [cx, cy + D * 0.5 - 12, z0 + bh]).map((p) => p), new Array(11).fill(9), 8);
  for (let i = 0; i < n; i++) {
    const bx = cx - W / 2 + 90 + ((W - 180) * i) / (n - 1), by = cy + (i % 2 ? -1 : 1) * D * 0.18, bz = z0 + 8;
    a.cyl(bx, by, bz, bz + 190, 36, 14); a.cone(bx, by, bz + 190, bz + 230, 36, 14, 14); a.cyl(bx, by, bz + 230, bz + 260, 15, 10);
    a.box(bx - 14, by - 40, bz + 250, bx + 14, by + 10, bz + 285); a.tube([[bx, by, bz + 278], [bx, by - 70, bz + 262]], [7, 6], 6);
    a.circ(bx, by, 36, 'EQUIP-DETAIL');
  }
  a.poly(mk(1)); a.line(cx, cy - D / 2, cx, cy + D / 2, 'EQUIP-DETAIL');
  a.log('Added the divided carry tray with a handle arch and ' + n + ' trigger spray bottles standing in it (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ storage
function pedalBin(a, v) {
  const R = a.W / 2, cx = a.cx, cy = -R, z0 = a.Z0, hb = a.H - 3.2 * IN;
  a.cyl(cx, cy, z0 + 10, z0 + 28, R * 0.96, 32);
  revolve(a, cx, cy, [[0.01, z0 + 28], [R, z0 + 28], [R * 0.98, z0 + hb], [0.01, z0 + hb]], 32);
  loop(a, cx, cy, R * 0.99, z0 + 30, 5, 32, 5); loop(a, cx, cy, R * 0.98, z0 + hb - 6, 4, 32, 5);
  revolve(a, cx, cy, [[R * 1.03, z0 + hb - 4], [R * 1.03, z0 + hb + 14], [R * 0.7, z0 + hb + 56], [R * 0.2, z0 + hb + 74], [0.01, z0 + hb + 78]], 32);   // lid
  a.cyl(cx, cy, z0 + hb + 76, z0 + hb + 90, R * 0.12, 10);
  a.box(cx - R * 0.35, cy + R * 0.95, z0 + hb - 10, cx + R * 0.35, cy + R * 1.02 + 10, z0 + hb + 30);   // rear hinge
  const py = cy - R, pz = z0 + 70;
  a.box(cx - 28, py - 4, pz - 10, cx + 28, py + 8, pz + 10);
  a.tube([[cx, py, pz], [cx, py - 70, pz - 20], [cx, py - 2.0 * IN + 20, z0 + 22]], [11, 11, 11], 8);
  a.box(cx - 70, py - 2.0 * IN + 34, z0 + 6, cx + 70, py - 2.0 * IN + 2 * 0 - 40 + 80, z0 + 30);
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.7, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.12, 'EQUIP-DETAIL'); a.rect(cx - 70, -a.D, cx + 70, py - 2.0 * IN + 80 - 40, 'EQUIP-DETAIL');
  a.log('Added the round body with base and rim bands, the domed lid with a knob and rear hinge, and the foot pedal with a pad (plan and 3D).');
}
function swingBin(a, v) {
  const W = a.W, D = a.D, cx = a.cx, cy = -D / 2, z0 = a.Z0, hb = a.H - 3.5 * IN, mk = (s) => rrect(cx, cy, W * s, D * s, 70 * s, 4);
  a.prism(mk(0.9), z0, z0 + 14);
  shellLoft(a, mk, z0 + 12, z0 + hb, (t) => 0.9 + 0.1 * t, 0.03, 5);
  a.prism(mk(1.02), z0 + hb - 6, z0 + hb + 40);
  ringPoly(a, mk(1.02), ellPoly(cx, cy, 0, 0, 20).map(([x, y], i) => [cx + (mk(1.02)[i][0] - cx) * 0.72, cy + (mk(1.02)[i][1] - cy) * 0.72]), z0 + hb + 40, z0 + hb + 90);
  const fr = D * 0.36;
  a.prism(ellPoly(cx, cy, W * 0.3, fr, 24), z0 + hb + 44, z0 + hb + 52);                    // swing flap
  a.xcyl(cx - W * 0.31, cx + W * 0.31, cy, z0 + hb + 62, 6, 8);                              // flap pivot
  for (const s of [-1, 1]) a.box(cx + s * W * 0.31 - 5, cy - 14, z0 + hb + 48, cx + s * W * 0.31 + 5, cy + 14, z0 + hb + 90);
  a.poly(mk(1.02)); a.poly(mk(0.72 * 1.02), 'EQUIP-DETAIL'); a.ellp(cx, cy, W * 0.3, fr, 'EQUIP-DETAIL'); a.line(cx - W * 0.31, cy, cx + W * 0.31, cy, 'EQUIP-DETAIL');
  a.log('Added the tapered body with base, the capped lid with an opening and the swing flap on its pivot pin (plan and 3D).');
}
function wovenBasket(a, v) {
  const R = v.dia * IN / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, bh = a.H - 70, mk = (s) => ellPoly(cx, cy, R * s, R * s, 32);
  a.cyl(cx, cy, z0, z0 + 10, R * 0.7, 28);
  shellLoft(a, mk, z0 + 8, z0 + bh, (t) => 0.7 + 0.3 * m.pow(t, 0.8), 0.04, 6);
  for (let k = 1; k <= 6; k++) { const f = k / 7, s = 0.7 + 0.3 * m.pow(f, 0.8); a.tube(mk(s + 0.005).concat([mk(s + 0.005)[0]]).map(([x, y]) => [x, y, z0 + 8 + (bh - 8) * f]), new Array(33).fill(3.2), 4); }
  loop(a, cx, cy, R, z0 + bh, 5, 32, 5);
  for (const s of [-1, 1]) { sweep(a, arcPts([cx + s * R * 0.98, cy, z0 + bh - 20], [cx + s * (R + 90), cy, z0 + bh + 10], [cx + s * R * 0.98, cy, z0 + bh - 120]), new Array(11).fill(7), 6); }
  a.circ(cx, cy, R); a.circ(cx, cy, R - 6, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.7, 'EQUIP-HIDDEN');
  a.log('Added the tapered woven-style basket with ' + 6 + ' weave bands, a bound rim and two loop handles (plan and 3D).');
}
function toteBox(a, v) {
  const W = a.W, D = a.D, cx = a.cx, cy = -D / 2, z0 = a.Z0, bh = a.H - 1.0 * IN, mk = (s) => rrect(cx, cy, W * s, D * s, 30 * s, 3);
  a.prism(mk(0.86), z0, z0 + 8);
  shellLoft(a, mk, z0 + 6, z0 + bh, (t) => 0.86 + 0.14 * t, 0.03, 5);
  a.prism(mk(1.0), z0 + bh, z0 + bh + 22);                                   // lid slab
  ringPoly(a, mk(1.0), mk(0.88), z0 + bh + 22, z0 + bh + 34);               // lid rim
  for (const s of [-1, 1]) { a.box(cx + s * (W * 0.1) - 40, cy - D / 2 - 3, z0 + bh + 22, cx + s * (W * 0.1) + 40, cy - D / 2 + 2, z0 + bh + 32); }
  for (const s of [-1, 1]) { const x = cx + s * W * 0.3; a.box(x - 16, cy - D / 2 - 14, z0 + bh - 54, x + 16, cy - D / 2 + 1, z0 + bh + 18); a.box(x - 10, cy - D / 2 - 17, z0 + bh - 20, x + 10, cy - D / 2 - 14, z0 + bh + 10); }
  for (const s of [-1, 1]) a.box(cx + s * (W / 2) - (s > 0 ? 3 : -3) * 0 - 3, cy - 40, z0 + bh - 70, cx + s * (W / 2) + 3, cy + 40, z0 + bh - 30);
  a.poly(mk(1)); a.poly(mk(0.88), 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.rect(cx + s * W * 0.3 - 16, cy - D / 2 - 14, cx + s * W * 0.3 + 16, cy - D / 2, 'EQUIP-DETAIL');
  a.log('Added the tapered tote with a base, a lid with a stacking rim, two side latches and the end grips (plan and 3D).');
}
function shoeRack(a, v) {
  const W = a.W, D = a.D, n = v.tiers, z0 = a.Z0, H = a.H, cx = a.cx;
  const xs = [a.X0 + 16, a.X1 - 16], ys = [-16, -D + 16];
  for (const x of xs) for (const y of ys) a.tube([[x, y, z0], [x, y, a.Z1]], [9, 9], 8);
  for (const x of xs) { a.tube([[x, ys[0], z0 + 30], [x, ys[1], z0 + 30]], [6, 6], 6); a.tube([[x, ys[0], a.Z1 - 12], [x, ys[1], a.Z1 - 12]], [6, 6], 6); }
  for (let i = 0; i < n; i++) {
    const zz = z0 + 60 + ((H - 80) * i) / (n - 1);
    const ns = 5;
    for (let k = 0; k < ns; k++) { const y = ys[0] + ((ys[1] - ys[0]) * k) / (ns - 1); a.box(xs[0] - 6, y - 14, zz - 6, xs[1] + 6, y + 14, zz + 6); }
    for (const x of xs) a.box(x - 6, ys[1] - 6, zz - 5, x + 6, ys[0] + 6, zz + 5);
    for (let k = 1; k < ns - 1; k++) a.line(xs[0], ys[0] + ((ys[1] - ys[0]) * k) / (ns - 1), xs[1], ys[0] + ((ys[1] - ys[0]) * k) / (ns - 1), 'EQUIP-DETAIL');
  }
  for (const x of xs) for (const y of ys) { a.circ(x, y, 9); a.cyl(x, y, z0, z0 + 6, 13, 8); }
  a.rect(a.X0 + 6, -D + 4, a.X1 - 6, -4, 'EQUIP-DETAIL');
  a.log('Added four posts with side rails and ' + n + ' slatted shelves with feet (plan and 3D).');
}
function coatStand(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, H = a.H, arms = v.arms;
  a.cyl(cx, cy, z0 + 60, z0 + 120, 40, 16);
  for (let i = 0; i < 4; i++) { const t = (i / 4) * 2 * PI + PI / 4; a.tube([[cx, cy, z0 + 130], [cx + R * 0.55 * m.cos(t), cy + R * 0.55 * m.sin(t), z0 + 60], [cx + R * 0.92 * m.cos(t), cy + R * 0.92 * m.sin(t), z0 + 16]], [20, 18, 16], 8); a.cyl(cx + R * 0.92 * m.cos(t), cy + R * 0.92 * m.sin(t), z0, z0 + 16, 24, 10); a.line(cx, cy, cx + R * 0.92 * m.cos(t), cy + R * 0.92 * m.sin(t), 'EQUIP-DETAIL'); }
  a.tube([[cx, cy, z0 + 60], [cx, cy, a.Z1 - 60]], [19, 19], 12);
  a.cyl(cx, cy, z0 + 110, z0 + 200, 28, 12);
  const tiers = arms > 4 ? [a.Z1 - 380, a.Z1 - 150] : [a.Z1 - 190];
  const per = arms > 4 ? arms / 2 : arms;
  tiers.forEach((zt, k) => { for (let i = 0; i < per; i++) { const t = (i / per) * 2 * PI + (k ? PI / per : 0), c = m.cos(t), s = m.sin(t), ar = R * 0.82; a.tube([[cx + 14 * c, cy + 14 * s, zt], [cx + ar * 0.6 * c, cy + ar * 0.6 * s, zt + 40], [cx + ar * c, cy + ar * s, zt + 90]], [12, 10, 9], 8); a.ell(cx + ar * c, cy + ar * s, zt + 100, 18, 18, 18, 8, 5); a.circ(cx + ar * c, cy + ar * s, 18, 'EQUIP-DETAIL'); } });
  a.ell(cx, cy, a.Z1 - 40, 30, 30, 40, 10, 6);
  a.circ(cx, cy, R); a.circ(cx, cy, 19, 'EQUIP-DETAIL');
  a.log('Added the four-footed base, pole with hub and finial, and ' + arms + ' upswept hook arms with ball tips (plan and 3D).');
}
function hookRail(a, v) {
  const n = v.hooks, z0 = a.Z0, W = a.W, bt = 20, bh = 3.4 * IN, zc = a.Z0 + a.H - bh / 2 - 6;
  prismY(a, rrect(a.cx, zc, W, bh, 22, 4), -bt, 0);
  for (let i = 0; i < n; i++) {
    const x = a.X0 + 70 + ((W - 140) * i) / (n - 1);
    a.ycyl(-bt - 4, -bt, x, zc, 20, 12);
    a.tube([[x, -bt - 3, zc], [x, -bt - 70, zc], [x, -bt - 92, zc + 18], [x, -bt - 94, zc + 55]], [7, 7, 7, 7], 8);
    a.ell(x, -bt - 94, zc + 66, 14, 14, 14, 8, 5);
    a.circ(x, -bt - 4, 14, 'EQUIP-DETAIL'); a.line(x, -bt, x, -bt - 94, 'EQUIP-DETAIL');
  }
  for (const s of [-1, 1]) screwHead(a, a.cx + s * (W / 2 - 30), zc, -bt, 5);
  a.rect(a.X0, -bt, a.X1, 0);
  a.log('Added the rounded back rail with screws and ' + n + ' curved hooks with ball tips on round bosses (plan and 3D).');
}
function trunk(a, v) {
  const W = a.W, D = a.D, cx = a.cx, cy = -D / 2, z0 = a.Z0, bh = v.bh * IN, lh = a.H - bh;
  a.box(a.X0, -D, z0 + 30, a.X1, 0, z0 + bh);
  a.box(a.X0 + 6, -D - 4, z0 + 40, a.X1 - 6, -D, z0 + bh - 20);                              // front panel
  const arch = []; for (let i = 0; i <= 10; i++) { const t = (i / 10) * PI; arch.push([cy - (D / 2) * m.cos(t), z0 + bh + lh * m.sin(t)]); }
  prismX(a, [[-D, z0 + bh], ...arch.slice(1, -1), [0, z0 + bh]], a.X0 + 3, a.X1 - 3);
  const arch2 = []; for (let i = 0; i <= 10; i++) { const t = (i / 10) * PI; arch2.push([cy - (D / 2 + 5) * m.cos(t), z0 + bh + (lh + 5) * m.sin(t)]); }
  for (const f of [0.14, 0.86]) { const x = a.X0 + W * f; a.box(x - 22, -D - 6, z0 + 30, x + 22, -D, z0 + bh); prismX(a, arch2, x - 22, x + 22); }
  for (const sx of [0, 1]) for (const sz of [0, 1]) a.box(sx ? a.X1 - 34 : a.X0, -D - 8, sz ? z0 + bh - 34 : z0 + 30, sx ? a.X1 : a.X0 + 34, -D, sz ? z0 + bh : z0 + 64);
  a.box(cx - 30, -D - 12, z0 + bh - 62, cx + 30, -D - 4, z0 + bh + 26);                       // lock plate and hasp
  a.cyl(cx, -D - 12, z0 + bh - 40, z0 + bh - 40.01, 1, 3); a.ell(cx, -D - 14, z0 + bh - 30, 8, 4, 8, 6, 4);
  for (const s of [-1, 1]) sweep(a, arcPts([a.X0 + (s < 0 ? 0 : W) + s * 0, -50, z0 + bh * 0.8], [a.X0 + (s < 0 ? -50 : W + 50), -D / 2 + 50, z0 + bh * 0.62], [a.X0 + (s < 0 ? 0 : W), -D + 50 - 0, z0 + bh * 0.8]).map((p) => [m.max(a.X0 - 12, m.min(a.X1 + 12, p[0])), p[1], p[2]]), new Array(11).fill(6), 6);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * (W / 2 - 40) - 18, cy + sy * (D / 2 - 40) - 18, z0, cx + sx * (W / 2 - 40) + 18, cy + sy * (D / 2 - 40) + 18, z0 + 32);
  a.rect(a.X0, -D, a.X1, 0); for (const f of [0.14, 0.86]) a.rect(a.X0 + W * f - 22, -D - 6, a.X0 + W * f + 22, -D, 'EQUIP-DETAIL'); a.line(a.X0, -D / 2, a.X1, -D / 2, 'EQUIP-DETAIL');
  a.log('Added the box with a front panel, the domed lid, two straps, corner plates, a lock plate and hasp, rope side handles and feet (plan and 3D).');
}
function cubeShelf(a, v) {
  const nx = v.nx, ny = v.ny, t = 16, z0 = a.Z0, cw = (a.W - (nx + 1) * t) / nx, ch = (a.H - (ny + 1) * t - 60) / ny;
  a.box(a.X0 + 6, a.YF + 6, z0, a.X1 - 6, a.YB - 6, z0 + 60);                                  // plinth
  for (let i = 0; i <= nx; i++) { const x = a.X0 + i * (cw + t); a.box(x, a.YF, z0 + 60, x + t, a.YB, a.Z1); }
  for (let j = 0; j <= ny; j++) { const z = z0 + 60 + j * (ch + t); a.box(a.X0, a.YF, z, a.X1, a.YB, z + t); }
  a.box(a.X0 + t, a.YB - 6, z0 + 60 + t, a.X1 - t, a.YB, a.Z1 - t);
  if (v.bins) for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) if ((i + j) % 2 === 0) {
    const x = a.X0 + t + i * (cw + t), z = z0 + 60 + t + j * (ch + t);
    a.box(x + 10, a.YF + 30, z + 10, x + cw - 10, a.YB - 10, z + ch - 10); a.box(x + cw * 0.3, a.YF + 22, z + ch * 0.62, x + cw * 0.7, a.YF + 30, z + ch * 0.74);
    a.rect(x + 10, a.YF + 30, x + cw - 10, a.YB - 10, 'EQUIP-DETAIL');
  }
  a.outline(); for (let i = 1; i < nx; i++) a.line(a.X0 + i * (cw + t) + t / 2, a.YF, a.X0 + i * (cw + t) + t / 2, a.YB, 'EQUIP-DETAIL');
  a.log('Added the plinth, ' + (nx + 1) + ' uprights, ' + (ny + 1) + ' shelves, a back panel' + (v.bins ? ' and fabric bins in alternate cubes' : '') + ' (plan and 3D).');
}
function umbrellaStand(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, h = 18 * IN;
  vessel(a, cx, cy, [[R * 0.92, z0], [R, z0 + 30], [R, z0 + h]], 4, 32);
  loop(a, cx, cy, R, z0 + h, 5, 32, 5); loop(a, cx, cy, R * 0.97, z0 + 30, 4, 32, 5); a.cyl(cx, cy, z0 + 4, z0 + 12, R * 0.8, 28);
  const us = [[-0.45, 0.3, 0], [0.4, -0.2, 0.06], [0.05, 0.5, -0.05]];
  us.forEach(([ox, oy, lean], i) => {
    const x = cx + ox * R, y = cy + oy * R, top = a.Z1 - 70 - i * 90;
    a.tube([[x, y, z0 + 60], [x + lean * 500, y, top - 80]], [8, 8], 8);
    a.cone(x + lean * 500, y, top - 380, top - 60, 30, 16, 10); a.cone(x + lean * 500, y, top - 60, top - 20, 16, 7, 10);
    sweep(a, arcPts([x + lean * 500, y, top - 20], [x + lean * 500, y + 50, top + 60], [x + lean * 500, y + 90, top - 10]), new Array(11).fill(9), 6);
  });
  a.circ(cx, cy, R); a.circ(cx, cy, R - 4, 'EQUIP-DETAIL');
  a.log('Added the tapered tub with rim and base rings, a drip tray and three umbrellas standing in it (plan and 3D).');
}
function magRack(a, v) {
  const W = a.W, D = a.D, n = v.pockets, z0 = a.Z0, H = a.H, t = 14;
  const prof = [[-D, z0], [0, z0], [0, a.Z1], [-D * 0.55, z0 + H * 0.78], [-D, z0 + H * 0.2]];
  prismX(a, prof, a.X0, a.X0 + t); prismX(a, prof, a.X1 - t, a.X1);
  a.box(a.X0, -D, z0, a.X1, -D + 30, z0 + 40); a.box(a.X0, -30, z0, a.X1, 0, z0 + 40);
  a.box(a.X0 + t, -10, z0 + 40, a.X1 - t, 0, a.Z1 - 20);                                       // back panel
  for (let i = 0; i < n; i++) {
    const zf = z0 + 60 + ((H * 0.62) * i) / n;
    prismX(a, [[-D + 20, zf], [-10, zf + 70 + (H * 0.5) / n * 0.5], [-10, zf + 80 + (H * 0.5) / n * 0.5], [-D + 20, zf + 10]], a.X0 + t, a.X1 - t);
    a.line(a.X0 + t, -D + 20 + i * 4, a.X1 - t, -D + 20 + i * 4, 'EQUIP-DETAIL');
  }
  a.outline(); a.rect(a.X0 + t, -D + 20, a.X1 - t, -10, 'EQUIP-DETAIL');
  a.log('Added two profiled sides, a back panel, front and rear rails and ' + n + ' slanted pockets (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ decor
function bottleVase(a, v) {
  const R = a.W / 2, h = a.H, cx = a.cx, cy = a.cy, z0 = a.Z0, P = (r, f) => [R * r, z0 + h * f];
  vessel(a, cx, cy, [P(0.55, 0), P(0.9, 0.06), P(1.0, 0.28), P(0.88, 0.5), P(0.4, 0.74), P(0.3, 0.84), P(0.3, 0.92), P(0.44, 1)], 4, 32);
  a.cyl(cx, cy, z0 - 0.01, z0 + 3, R * 0.5, 24);
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.44, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.3, 'EQUIP-DETAIL');
  a.log('Added the hollow bottle form with a foot, round belly, tapering neck and flared lip (plan and 3D).');
}
function cylVase(a, v) {
  const rt = a.W / 2, R = rt / (v.flare ?? 1), h = a.H, cx = a.cx, cy = a.cy, z0 = a.Z0;
  vessel(a, cx, cy, [[R, z0], [(R + rt) / 2 * 0.98, z0 + h * 0.5], [rt, z0 + h]], 5, 32);
  a.cyl(cx, cy, z0 + 5, z0 + 22, R * 0.86, 28);
  loop(a, cx, cy, rt, z0 + h, 3, 32, 5);
  a.circ(cx, cy, rt); a.circ(cx, cy, rt - 5, 'EQUIP-DETAIL'); a.circ(cx, cy, R, 'EQUIP-HIDDEN');
  a.log('Added the hollow ' + (v.flare ? 'flared' : 'straight') + ' glass-style vase with a thick base and a rim bead (plan and 3D).');
}
function urn(a, v) {
  const h = a.H, hw = 40, R = (a.W - 2 * hw) / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, P = (r, f) => [R * r, z0 + h * f];
  a.box(cx - R * 0.62, cy - R * 0.62, z0, cx + R * 0.62, cy + R * 0.62, z0 + h * 0.07);                        // square plinth
  vessel(a, cx, cy, [P(0.5, 0.07), P(0.34, 0.12), P(0.28, 0.2), P(0.7, 0.3), P(1.0, 0.5), P(0.92, 0.7), P(0.5, 0.84), P(0.42, 0.88), P(0.64, 0.95), P(0.68, 1)], 4, 32);
  for (const s of [-1, 1]) sweep(a, arcPts([cx + s * R * 0.62, cy, z0 + h * 0.8], [cx + s * (R + hw + 10), cy, z0 + h * 0.8], [cx + s * R * 0.98, cy, z0 + h * 0.52]), new Array(11).fill(9), 8);
  a.rect(cx - R * 0.62, cy - R * 0.62, cx + R * 0.62, cy + R * 0.62, 'EQUIP-DETAIL'); a.circ(cx, cy, R); a.circ(cx, cy, R * 0.66, 'EQUIP-DETAIL');
  for (const s of [-1, 1]) a.rect(cx + s * R, cy - 9, cx + s * (R + hw), cy + 9);
  a.log('Added the plinth, stem, rounded body with neck and flared lip, and two looped side handles (plan and 3D).');
}
function pictureFrame(a, v) {
  const W = a.W, H = a.H, d = v.table ? 19 : 22, t = v.t * IN, y1 = v.table ? -a.D + d : 0, y0 = y1 - d, z0 = a.Z0, z1 = a.Z1;
  a.frame(a.X0, z0, a.X1, z1, y0, y1, t);
  a.box(a.X0 + t, y0 + 4, z0 + t, a.X1 - t, y0 + 8, z1 - t);                                                  // mat board
  const mw = v.mat * IN;
  a.box(a.X0 + t + mw, y0 + 8, z0 + t + mw, a.X1 - t - mw, y0 + 10, z1 - t - mw);                              // picture
  a.box(a.X0 + t, y1 - 5, z0 + t, a.X1 - t, y1 - 3, z1 - t);                                                  // glass
  a.box(a.X0 + t, y1 - 3, z0 + t, a.X1 - t, y1, z1 - t);                                                      // backing board
  if (v.table) {
    a.tube([[a.cx, y1, z0 + H * 0.82], [a.cx, 0, z0 + 10]], [6, 6], 6); a.box(a.cx - 30, -8, z0, a.cx + 30, 0, z0 + 12);
  } else {
    a.tube([[a.X0 + W * 0.2, y1 - 2, z1 - t - 40], [a.cx, y1 - 2, z1 - 5], [a.X1 - W * 0.2, y1 - 2, z1 - t - 40]], [1.6, 1.6, 1.6], 4);
    a.box(a.cx - 14, y1 - 6, z1 - 12, a.cx + 14, y1, z1 - 4);
  }
  a.rect(a.X0, y0, a.X1, y1); a.rect(a.X0 + t, y0, a.X1 - t, y1, 'EQUIP-DETAIL'); if (v.table) a.line(a.cx, y1, a.cx, 0, 'EQUIP-DETAIL');
  a.log('Added the mitred frame, mat board, picture, glass and backing board, and ' + (v.table ? 'a hinged easel strut with a foot' : 'a hanging wire with a hook plate') + ' (plan and 3D).');
}
function wallClock(a, v) {
  const R = a.W / 2, cx = a.cx, cz = a.Z0 + a.H / 2, t = a.D, hr = R - 24;
  revolveY(a, cx, cz, 0, [[R - 1, 0], [R, t * 0.4], [R, t], [R - 18, t], [R - 18, t * 0.45], [R - 1, t * 0.4]].slice(0, 5), 48);
  revolveY(a, cx, cz, -t * 0.1, [[0.01, 0], [R - 18, 0], [R - 18, t * 0.2]], 48);                                     // dial
  revolveY(a, cx, cz, -t * 0.3, [[R - 16, 0], [R - 16, 5], [R - 20, 5]], 48);                                         // bezel ring
  for (let i = 0; i < 12; i++) { const q = (i / 12) * 2 * PI, c = m.cos(q), s = m.sin(q), r0 = i % 3 === 0 ? hr * 0.82 : hr * 0.9; a.tube([[cx + r0 * c, -t * 0.4 - 1.5, cz + r0 * s], [cx + hr * c, -t * 0.4 - 1.5, cz + hr * s]], [i % 3 === 0 ? 3.2 : 1.8, i % 3 === 0 ? 3.2 : 1.8], 4); }
  const ha = 1.05, ma = 2.4;
  a.tube([[cx, -t * 0.5, cz], [cx + hr * 0.5 * m.cos(ha), -t * 0.5, cz + hr * 0.5 * m.sin(ha)]], [4.5, 3], 5);
  a.tube([[cx, -t * 0.55, cz], [cx + hr * 0.78 * m.cos(ma), -t * 0.55, cz + hr * 0.78 * m.sin(ma)]], [3.6, 2], 5);
  a.cyl(cx, -t * 0.5, cz, cz + 0.01, 1, 3); revolveY(a, cx, cz, -t * 0.55, [[8, 0], [8, 3], [4, 4]], 12);
  a.box(cx - 8, -3, cz + R * 0.8, cx + 8, 0, cz + R * 0.8 + 14);
  a.circ(cx, -t / 2, R); a.circ(cx, -t / 2, R - 18, 'EQUIP-DETAIL'); a.rect(cx - R, -t, cx + R, 0, 'EQUIP-DETAIL');
  a.log('Added the round case with bezel, dial, twelve hour marks, hour and minute hands, a centre cap and a hanging tab (plan and 3D).');
}
function mantelClock(a, v) {
  const W = a.W, D = a.D, cx = a.cx, cy = -D / 2, z0 = a.Z0, bh = 0.9 * IN, cw = W * 0.8;
  a.box(a.X0, -D, z0 + 10, a.X1, 0, z0 + bh); a.box(a.X0 + 8, -D + 8, z0 + bh, a.X1 - 8, -8, z0 + bh + 14);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.ell(cx + sx * (W / 2 - 24), cy + sy * (D / 2 - 18), z0 + 6, 16, 16, 8, 8, 4);
  const arch = []; for (let i = 0; i <= 10; i++) { const q = (i / 10) * PI; arch.push([cx + (cw / 2) * m.cos(q), z0 + a.H * 0.64 + (cw / 2) * m.sin(q) * 0.95]); }
  prismY(a, [[cx - cw / 2, z0 + bh + 14], [cx + cw / 2, z0 + bh + 14], ...arch], cy - D * 0.38, cy + D * 0.38);
  const dz = z0 + a.H * 0.64, dr = cw * 0.38, yf = cy - D * 0.38;
  revolveY(a, cx, dz, yf, [[dr + 12, 0], [dr + 12, 10], [dr, 10], [dr, 2]], 36); revolveY(a, cx, dz, yf, [[0.01, 0], [dr, 0], [dr, 2]], 36);
  for (let i = 0; i < 12; i++) { const q = (i / 12) * 2 * PI; a.tube([[cx + dr * 0.8 * m.cos(q), yf - 4, dz + dr * 0.8 * m.sin(q)], [cx + dr * 0.92 * m.cos(q), yf - 4, dz + dr * 0.92 * m.sin(q)]], [2.6, 2.6], 4); }
  a.tube([[cx, yf - 6, dz], [cx + dr * 0.5 * m.cos(1.2), yf - 6, dz + dr * 0.5 * m.sin(1.2)]], [4, 3], 5); a.tube([[cx, yf - 7, dz], [cx + dr * 0.8 * m.cos(2.2), yf - 7, dz + dr * 0.8 * m.sin(2.2)]], [3, 2], 5);
  for (const sx of [-1, 1]) { a.cyl(cx + sx * (cw / 2 + 12), cy, z0 + bh + 14, z0 + bh + 14 + a.H * 0.45, 12, 10); a.ell(cx + sx * (cw / 2 + 12), cy, z0 + bh + 14 + a.H * 0.45 + 12, 15, 15, 15, 8, 5); }
  a.rect(a.X0, -D, a.X1, 0); a.rect(cx - cw / 2, yf - 1, cx + cw / 2, cy + D * 0.38, 'EQUIP-DETAIL');
  a.log('Added the moulded base on feet, the arched case with a dial ring, hour marks and hands, and two side pillars with ball tops (plan and 3D).');
}
function pillar(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, cr = v.cd * IN / 2, ch = v.ch * IN;
  vessel(a, cx, cy, [[R * 0.7, z0], [R, z0 + 8], [R, z0 + 14]], 3, 32);
  a.cyl(cx, cy, z0 + 6, z0 + 16, R * 0.9, 28);
  a.cyl(cx, cy, z0 + 16, z0 + 16 + ch, cr, 28);
  revolve(a, cx, cy, [[cr, z0 + 16 + ch], [cr * 0.92, z0 + 16 + ch + 0.01], [cr * 0.3, z0 + 16 + ch - 5], [0.01, z0 + 16 + ch - 5]], 24);   // melt pool
  a.tube([[cx, cy, z0 + 16 + ch - 5], [cx + 1.5, cy, z0 + 16 + ch + 14]], [1.6, 1.2], 5);
  a.ell(cx, cy, z0 + 16 + ch + 30, 5, 5, 16, 8, 6);
  a.circ(cx, cy, R); a.circ(cx, cy, cr, 'EQUIP-DETAIL'); a.circ(cx, cy, 2, 'EQUIP-DETAIL');
  a.log('Added the dish, the pillar candle with its melt pool, wick and flame (plan and 3D).');
}
function taperStick(a, v) {
  const R = a.W / 2, h = a.H, cx = a.cx, cy = a.cy, z0 = a.Z0, hs = 0.46 * h, P = (r, f) => [R * r, z0 + hs * f];
  revolve(a, cx, cy, [[0.01, z0], [R, z0], [R, z0 + 6], [R * 0.7, z0 + 14], [R * 0.2, z0 + hs * 0.18], [R * 0.34, z0 + hs * 0.26], [R * 0.16, z0 + hs * 0.38], [R * 0.3, z0 + hs * 0.5], [R * 0.14, z0 + hs * 0.62], [R * 0.3, z0 + hs * 0.74], [R * 0.2, z0 + hs * 0.84], [R * 0.52, z0 + hs * 0.88], [R * 0.52, z0 + hs * 0.94], [R * 0.24, z0 + hs * 0.96], [0.01, z0 + hs * 0.96]], 28);
  a.cone(cx, cy, z0 + hs * 0.88, z0 + hs * 0.88 + 8, R * 0.62, R * 0.62, 28);
  a.cone(cx, cy, z0 + hs * 0.96, z0 + h - 40, R * 0.17, R * 0.13, 14);
  a.tube([[cx, cy, z0 + h - 40], [cx, cy, z0 + h - 30]], [2, 1.5], 5); a.ell(cx, cy, z0 + h - 14, 5, 5, 16, 8, 6);
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.52, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.17, 'EQUIP-DETAIL');
  a.log('Added the round foot, turned stem with bobeche cup, the tapering candle, wick and flame (plan and 3D).');
}
function lantern(a, v) {
  const W = a.W, cx = a.cx, cy = a.cy, z0 = a.Z0, H = a.H, pr = 14, br = W * 0.06;
  a.box(a.X0, a.YF, z0, a.X1, a.YB, z0 + 18); a.box(a.X0 + 6, a.YF + 6, z0 + 18, a.X1 - 6, a.YB - 6, z0 + 28);
  const gh = H * 0.62, gr = W * 0.4;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { a.box(cx + sx * (W / 2 - 12) - 7, cy + sy * (W / 2 - 12) - 7, z0 + 28, cx + sx * (W / 2 - 12) + 7, cy + sy * (W / 2 - 12) + 7, z0 + 28 + gh + 10); }
  revolve(a, cx, cy, [[gr, z0 + 28], [gr, z0 + 28 + gh]], 28);
  revolve(a, cx, cy, [[gr - 1, z0 + 28 + gh], [gr - 1, z0 + 28]], 28);
  loop(a, cx, cy, gr, z0 + 28 + gh * 0.5, 2, 28, 4);
  a.cyl(cx, cy, z0 + 28, z0 + 28 + gh * 0.5, gr * 0.3, 20); a.ell(cx, cy, z0 + 28 + gh * 0.5 + 40, 6, 6, 18, 8, 6);
  const zc = z0 + 28 + gh + 10;
  a.box(a.X0 + 4, a.YF + 4, zc, a.X1 - 4, a.YB - 4, zc + 14);
  revolve(a, cx, cy, [[W * 0.5, zc + 14], [W * 0.3, zc + 14 + (H - 28 - gh - 24) * 0.55], [W * 0.1, z0 + H - 36], [0.01, z0 + H - 34]], 4);
  { const apex = z0 + H - 34, zb = zc + 14, hx = W * 0.12, zr = apex - (hx / (W * 0.5)) * (apex - zb) - 2; sweep(a, arcPts([cx - hx, cy, zr], [cx, cy, 2 * (z0 + H) - zr], [cx + hx, cy, zr]), new Array(11).fill(4), 6); }  a.rect(a.X0, a.YF, a.X1, a.YB); a.circ(cx, cy, gr, 'EQUIP-DETAIL'); a.circ(cx, cy, gr * 0.3, 'EQUIP-DETAIL');
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.rect(cx + sx * (W / 2 - 12) - 7, cy + sy * (W / 2 - 12) - 7, cx + sx * (W / 2 - 12) + 7, cy + sy * (W / 2 - 12) + 7, 'EQUIP-DETAIL');
  a.log('Added the plinth base, four corner posts, a glass cylinder, an inner pillar candle with flame, a pyramid cap and a ring handle (plan and 3D).');
}
function planter(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, ph = v.ph * IN, mk = (s) => ellPoly(cx, cy, R * s, R * s, 32);
  vessel(a, cx, cy, [[R * 0.9, z0], [R * 1.0, z0 + 30]], 3, 32);                                                // saucer
  a.cyl(cx, cy, z0 + 10, z0 + 20, R * 0.5, 24);
  const zA = z0 + 22;
  a.cyl(cx, cy, z0 + 3, zA, R * 0.52, 24);
  shellLoft(a, mk, zA, z0 + ph, (t) => 0.58 + 0.42 * t, 0.04, 5);
  loop(a, cx, cy, R * 1.0, z0 + ph, 6, 32, 5); loop(a, cx, cy, R * 0.99, z0 + ph - 40, 3, 32, 5);
  revolve(a, cx, cy, [[R * 0.94, z0 + ph - 20], [R * 0.9, z0 + ph - 14], [R * 0.4, z0 + ph - 4], [0.01, z0 + ph - 2]], 24);       // soil
  const N = 9;
  for (let i = 0; i < N; i++) { const t = (i / N) * 2 * PI + 0.3, c = m.cos(t), s = m.sin(t), rr = R * (0.15 + 0.5 * ((i % 3) / 2)), top = a.Z1 - (i % 3) * 40; a.tube([[cx + rr * 0.3 * c, cy + rr * 0.3 * s, z0 + ph - 8], [cx + rr * c, cy + rr * s, (z0 + ph + top) / 2 + 20], [cx + (rr + R * 0.35) * c, cy + (rr + R * 0.35) * s, top - 30]], [8, 5, 1.4], 5); a.ell(cx + (rr + R * 0.25) * c, cy + (rr + R * 0.25) * s, top - 24, R * 0.12, R * 0.12, 30, 6, 4); }
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.99, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.6, 'EQUIP-HIDDEN');
  a.log('Added the saucer, the tapered pot with a rim band and soil, and a clump of leaf blades (plan and 3D).');
}
function trough(a, v) {
  const W = a.W, D = a.D, cx = a.cx, cy = -D / 2, z0 = a.Z0, ph = a.H * 0.7, mk = (s) => rrect(cx, cy, W * s, D * s, 40 * s, 4);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * (W * 0.42) - 18, cy + sy * (D * 0.34) - 18, z0, cx + sx * (W * 0.42) + 18, cy + sy * (D * 0.34) + 18, z0 + 40);
  shellLoft(a, mk, z0 + 34, z0 + ph, (t) => 0.84 + 0.16 * t, 0.03, 5);
  a.prism(mk(0.82), z0 + 34, z0 + 44);
  ringPoly(a, mk(1.01), mk(0.94), z0 + ph - 20, z0 + ph);
  a.prism(mk(0.93), z0 + ph - 30, z0 + ph - 20);
  for (let i = 0; i < 14; i++) { const x = a.X0 + 40 + ((W - 80) * i) / 13, h = a.Z1 - 20 - (i % 3) * 90, y = cy + ((i % 2) ? 1 : -1) * D * 0.12; a.tube([[x, y, z0 + ph - 20], [x + (i % 2 ? 22 : -22), y, (z0 + ph + h) / 2], [x + (i % 2 ? 50 : -50), y, h]], [8, 5, 1.4], 5); }
  a.poly(mk(1.01)); a.poly(mk(0.94), 'EQUIP-DETAIL');
  a.log('Added four feet, the tapered trough with a rim and soil bed, and a row of leaf blades (plan and 3D).');
}
function sunburst(a, v) {
  const R = a.W / 2, cx = a.cx, cz = a.Z0 + a.H / 2, t = a.D, mr = R * 0.4;
  revolveY(a, cx, cz, 0, [[mr + 12, 0], [mr + 12, t * 0.7], [mr, t * 0.7], [mr, t * 0.2]], 40);
  revolveY(a, cx, cz, -t * 0.15, [[0.01, 0], [mr, 0], [mr, 3]], 40);
  const N = v.rays;
  for (let i = 0; i < N; i++) { const q = (i / N) * 2 * PI, c = m.cos(q), s = m.sin(q), r1 = i % 2 ? R * 0.84 : R * 0.97; a.tube([[cx + (mr + 6) * c, -t * 0.4, cz + (mr + 6) * s], [cx + r1 * c, -t * 0.4, cz + r1 * s]], [4, 2.6], 5); a.ell(cx + r1 * c, -t * 0.4, cz + r1 * s, 7, 7, 7, 6, 4); }
  a.box(cx - 10, -4, cz + R * 0.42, cx + 10, 0, cz + R * 0.42 + 16);
  a.circ(cx, -t / 2, R); a.circ(cx, -t / 2, mr, 'EQUIP-DETAIL'); a.rect(cx - R, -t, cx + R, 0, 'EQUIP-DETAIL');
  a.log('Added the round mirror in a raised frame with ' + N + ' alternating long and short rays and a hanging bracket (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ families
export default [
  // ---- kitchenware
  fam({ cat: 'household/kitchenware', title: 'Generic saucepan with lid', desc: (v) => `Round saucepan ${v.w} in across with a rolled rim, a domed lid with a knob and a long handle on a riveted bracket.`,
    vs: [['1.5 qt, 6 in', 6, 13.5, 5.5, 0, { hb: 3.5 }], ['2.5 qt, 7 in', 7, 14.5, 6.2, 0, { hb: 4.2 }], ['4 qt, 8.5 in', 8.5, 16.5, 6.4, 0, { hb: 4.2 }]], build: saucepan }),
  fam({ cat: 'household/kitchenware', title: 'Generic frying pan', desc: (v) => `Frying pan ${v.w} in across the top with flared sides, a rim bead, a base ring and a riveted handle with a hanging hole.`,
    vs: [['8 in', 8, 15, 2.4], ['10 in', 10, 18, 2.6], ['12 in', 12, 20.5, 2.8]], build: fryPan }),
  fam({ cat: 'household/kitchenware', title: 'Generic stockpot with lid', desc: (v) => `Tall stockpot with base and rim rings, a domed lid with a knob and two loop handles on riveted plates.`,
    vs: [['8 qt, 10 in', 13, 10, 9, 0, { hb: 6.8 }], ['12 qt, 11 in', 14, 11, 11.2, 0, { hb: 8.8 }]], build: stockpot }),
  fam({ cat: 'household/kitchenware', title: 'Generic stovetop kettle', desc: 'Bell-shaped kettle with a domed lid and knob, a tapering spout and an arching handle on brackets.',
    vs: [['2.5 qt', 10.5, 8.4, 9.5]], build: stoveKettle }),
  fam({ cat: 'household/kitchenware', title: 'Generic jug kettle', desc: (v) => `Cordless-style jug kettle on a power base with a hinged lid, a pouring spout, a gauge window and a rear loop handle.`,
    vs: [['1.5 litre', 6.5, 8.5, 9.5], ['1.7 litre', 7, 9, 10.5]], build: jugKettle }),
  fam({ cat: 'household/kitchenware', title: 'Generic cutting board', desc: (v) => `Board ${v.w - 2.4} in long with a raised border and a juice groove, plus a handle tab with a hanging hole.`,
    vs: [['small, 12 in', 14.4, 8, 0.6], ['medium, 16 in by 11 in', 18.4, 11, 0.75], ['large, 20 in by 14 in', 22.4, 14, 0.9]], build: cuttingBoard }),
  fam({ cat: 'household/kitchenware', title: 'Generic mixing bowl', desc: (v) => `Hollow bowl ${v.w} in across with a foot ring and a rolled rim.`,
    vs: [['6 in', 6, 6, 3.3], ['9 in', 9, 9, 4.8], ['12 in', 12, 12, 6.3]], build: mixBowl }),
  fam({ cat: 'household/kitchenware', title: 'Generic pouring jug', desc: 'Tapered hollow jug with a rolled rim, a pouring lip, scale marks and a looped handle.',
    vs: [['1 pint', 6.4, 4, 5.5, 0, { dia: 3.8 }], ['2 pint', 7.2, 4.6, 6.5, 0, { dia: 4.4 }]], build: jug }),
  fam({ cat: 'household/kitchenware', title: 'Generic baking sheet', desc: 'Flat baking sheet with a straight rim and a rolled wire bead around the edge.',
    vs: [['half size, 18 in by 13 in', 18, 13, 1]], build: bakingSheet }),
  fam({ cat: 'household/kitchenware', title: 'Generic springform cake tin', desc: 'Straight-sided round tin with a rolled rim, a loose base and a springform clasp.',
    vs: [['9 in round', 10.4, 9.1, 2.8, 0, { dia: 9 }]], build: cakeTin }),
  fam({ cat: 'household/kitchenware', title: 'Generic muffin tray', desc: (v) => `Tray of ${v.nx * v.ny} tapered cups with flanged tops joined into one sheet with a rolled edge.`,
    vs: [['six cup', 11, 7.4, 1.4, 0, { nx: 3, ny: 2 }], ['twelve cup', 14.4, 11, 1.4, 0, { nx: 4, ny: 3 }]], build: muffinTray }),
  fam({ cat: 'household/kitchenware', title: 'Generic bread toaster', desc: (v) => `Rounded toaster on feet with ${v.slots} slots in the top plate, a lever, a browning dial and a cancel button on the front.`,
    vs: [['two slot', 11.5, 6.5, 7.5, 0, { slots: 2 }], ['four slot', 15, 11, 7.5, 0, { slots: 4 }]], build: toaster }),

  // ---- cleaning
  fam({ cat: 'household/cleaning', title: 'Generic broom', desc: (v) => v.push ? `Push broom with a ${v.w} in wood block, a bristle mass with bands, a socket plate, two diagonal braces and a handle.` : 'Angled broom with a wood block, angle-cut bristles with bands, a socket and a handle with a hanging eye.',
    vs: [['angled, 54 in', 13, 2.6, 54], ['push, 18 in head', 18, 3.2, 58, 0, { push: true }], ['push, 24 in head', 24, 3.2, 58, 0, { push: true }]], build: broom }),
  fam({ cat: 'household/cleaning', title: 'Generic mop and wringer bucket', desc: 'Tapered rectangular bucket on feet with a squeeze wringer (side plates, press plate, lever) and a strand mop standing in it.',
    vs: [['12 qt', 16, 12, 46, 0, { bh: 9 }], ['20 qt', 18.5, 13.5, 48, 0, { bh: 11 }]], build: mopBucket }),
  fam({ cat: 'household/cleaning', title: 'Generic cleaning pail', desc: (v) => `Tapered round pail with rim and base rings, side lugs, a wire bail and a grip, ${v.bh} in deep.`,
    vs: [['2 gal', 9.5, 9.5, 12.5, 0, { bh: 8 }], ['3 gal', 10.5, 10.5, 14, 0, { bh: 9.5 }], ['5 gal', 12, 12, 18, 0, { bh: 14 }]], build: bucket }),
  fam({ cat: 'household/cleaning', title: 'Generic upright vacuum cleaner', desc: 'Upright vacuum with a wedge nozzle and roll window, wheels, a motor housing, a clear dust bin with lid, a handle and a grip loop.',
    vs: [['12 in nozzle', 12, 12, 44], ['15 in nozzle', 15, 12, 46]], build: upright }),
  fam({ cat: 'household/cleaning', title: 'Generic canister vacuum cleaner', desc: 'Canister vacuum with a domed body and lid, two rear wheels, a front caster, a hose, a wand with a handle and a floor head.',
    vs: [['compact', 11, 26, 36], ['large', 13, 30, 38]], build: canister }),
  fam({ cat: 'household/cleaning', title: 'Generic ironing board', desc: (v) => `Ironing board with a tapered padded top and an iron rest at the nose, two splayed leg frames with feet and a cross rail.`,
    vs: [['full size, 54 in', 54, 15, 36], ['compact, 48 in', 48, 13, 34], ['tabletop, 32 in', 32, 12, 12]], build: ironBoard }),
  fam({ cat: 'household/cleaning', title: 'Generic laundry basket', desc: (v) => v.lid ? 'Round hamper with a tapered woven-style body, bands, moulded grips and a domed lid with a knob.' : `${v.kind === 'rect' ? 'Rectangular' : 'Round'} laundry basket with a tapered woven-style body, bands, a bound rim and moulded handle grips.`,
    vs: [['round, 20 in', 20, 20, 15, 0, { kind: 'round', bh: 15 }], ['rectangular, 24 in by 16 in', 24, 16, 14, 0, { kind: 'rect', bh: 14 }], ['round hamper with lid, 18 in', 18, 18, 26.5, 0, { kind: 'round', bh: 21, lid: true }]], build: laundryBasket }),
  fam({ cat: 'household/cleaning', title: 'Generic clothes airer', desc: (v) => `Free-standing drying rack with four uprights, a base frame and ${v.tiers} tiers of drying rails.`,
    vs: [['two tier, 28 in', 26, 18, 28, 0, { tiers: 2 }], ['three tier, 40 in', 28, 20, 40, 0, { tiers: 3 }], ['five tier, 62 in', 30, 22, 62, 0, { tiers: 5 }]], build: airer }),
  fam({ cat: 'household/cleaning', title: 'Generic dustpan and brush', desc: (v) => v.long ? 'Long-handle dustpan with a rubber lip and a long-handle brush, shown side by side.' : 'Hand dustpan with a rubber lip and a hand brush with a bristle block, shown side by side.',
    vs: [['hand set', 21, 9, 2.2], ['long-handle set', 22, 12.5, 36, 0, { long: true }]], build: dustpan }),
  fam({ cat: 'household/cleaning', title: 'Generic cleaning caddy', desc: (v) => `Divided carry tray with a handle arch and ${v.bottles} trigger spray bottles standing in it.`,
    vs: [['three bottles', 12, 8, 14, 0, { bottles: 3 }], ['five bottles, large', 16, 9, 14, 0, { bottles: 5 }]], build: caddy }),

  // ---- storage
  fam({ cat: 'household/storage', title: 'Generic pedal bin', desc: (v) => `Round pedal bin with base and rim bands, a domed lid with a knob and rear hinge, and a foot pedal with a pad.`,
    vs: [['3 gal', 9.5, 11.9, 12.5], ['8 gal', 11.5, 13.9, 19.5], ['13 gal', 13.5, 15.9, 26]], build: pedalBin }),
  fam({ cat: 'household/storage', title: 'Generic swing-lid bin', desc: 'Rectangular tapered bin with a capped lid with an opening and a swing flap on its pivot pin.',
    vs: [['10 gal', 12, 9.5, 22]], build: swingBin }),
  fam({ cat: 'household/storage', title: 'Generic woven basket', desc: (v) => `Tapered ${v.dia} in round basket with weave bands, a bound rim and two loop handles.`,
    vs: [['12 in round', 15.8, 12, 10.5, 0, { dia: 12 }], ['16 in round', 19.8, 16, 13, 0, { dia: 16 }], ['20 in round', 23.8, 20, 15.5, 0, { dia: 20 }]], build: wovenBasket }),
  fam({ cat: 'household/storage', title: 'Generic lidded storage tote', desc: 'Tapered tote with a lid that has a stacking rim, two side latches and grips at the ends.',
    vs: [['12 qt', 15, 10.7, 7], ['30 qt', 19, 14.7, 10], ['60 qt', 24, 16.7, 13]], build: toteBox }),
  fam({ cat: 'household/storage', title: 'Generic shoe rack', desc: (v) => `Rack with four posts, side rails and ${v.tiers} slatted shelves on feet.`,
    vs: [['two tier, 24 in', 24, 10, 16, 0, { tiers: 2 }], ['three tier, 30 in', 30, 10, 24, 0, { tiers: 3 }], ['four tier, 36 in', 36, 10, 32, 0, { tiers: 4 }]], build: shoeRack }),
  fam({ cat: 'household/storage', title: 'Generic coat stand', desc: (v) => `Pole coat stand with a four-footed base, a hub, a finial and ${v.arms} upswept hook arms with ball tips.`,
    vs: [['four hook, 66 in', 20, 20, 66, 0, { arms: 4 }], ['eight hook, two tier, 72 in', 24, 24, 72, 0, { arms: 8 }]], build: coatStand }),
  fam({ cat: 'household/storage', title: 'Generic wall hook rail', desc: (v) => `Rounded back rail ${v.w} in long with screws and ${v.hooks} curved hooks with ball tips on round bosses.`,
    vs: [['three hook, 24 in', 24, 5, 6.2, 60, { hooks: 3 }], ['five hook, 36 in', 36, 5, 6.2, 60, { hooks: 5 }], ['seven hook, 48 in', 48, 5, 6.2, 60, { hooks: 7 }]], build: hookRail }),
  fam({ cat: 'household/storage', title: 'Generic storage trunk', desc: 'Trunk with a front panel, a domed lid, two straps, corner plates, a lock plate and hasp, rope side handles and feet.',
    vs: [['small, 30 in', 30, 17, 16, 0, { bh: 10 }], ['large, 36 in', 36, 20, 19, 0, { bh: 12 }]], build: trunk }),
  fam({ cat: 'household/storage', title: 'Generic cube organizer', desc: (v) => `Cube shelf ${v.nx} cubes wide and ${v.ny} high on a plinth, with a back panel${v.bins ? ' and fabric bins in alternate cubes' : ''}.`,
    vs: [['two by two cubes', 28, 15, 30, 0, { nx: 2, ny: 2 }], ['two by four cubes with bins', 28, 15, 56, 0, { nx: 2, ny: 4, bins: true }]], build: cubeShelf }),
  fam({ cat: 'household/storage', title: 'Generic umbrella stand', desc: 'Tapered tub with rim and base rings, a drip tray and three umbrellas standing in it.',
    vs: [['round, 32 in with umbrellas', 11, 11, 32]], build: umbrellaStand }),
  fam({ cat: 'household/storage', title: 'Generic magazine rack', desc: (v) => `Floor rack with two profiled sides, a back panel and ${v.pockets} slanted pockets.`,
    vs: [['three pocket, 16 in', 16, 12, 17, 0, { pockets: 3 }], ['five pocket, 24 in', 24, 12, 20, 0, { pockets: 5 }]], build: magRack }),

  // ---- decor
  fam({ cat: 'household/decor', title: 'Generic bottle vase', desc: 'Hollow bottle-form vase with a foot, a round belly, a tapering neck and a flared lip.',
    vs: [['8 in', 4.5, 4.5, 8], ['14 in', 6.5, 6.5, 14]], build: bottleVase }),
  fam({ cat: 'household/decor', title: 'Generic cylinder vase', desc: (v) => `Hollow ${v.flare ? 'flared' : 'straight'} vase with a thick base and a rim bead.`,
    vs: [['straight, 5 in by 10 in', 5, 5, 10], ['flared, 8 in by 14 in', 8, 8, 14, 0, { flare: 1.4 }]], build: cylVase }),
  fam({ cat: 'household/decor', title: 'Generic footed urn vase', desc: 'Urn with a square plinth, a stem, a rounded body with a neck and flared lip, and two looped side handles.',
    vs: [['12 in', 7.1, 6, 12, 0], ['18 in', 10.1, 9, 18, 0]], build: urn }),
  fam({ cat: 'household/decor', title: 'Generic picture frame', desc: (v) => `Mitred frame ${v.w} in by ${v.h} in with a mat board, picture, glass and backing, and ${v.table ? 'an easel strut with a foot' : 'a hanging wire with a hook plate'}.`,
    vs: [['tabletop, 5 in by 7 in', 5, 2.5, 7, 0, { table: true, t: 0.5, mat: 0.5 }], ['wall, 8 in by 10 in', 8, 0.9, 10, 54, { t: 0.6, mat: 1 }], ['wall, 16 in by 20 in', 16, 0.9, 20, 48, { t: 1, mat: 2 }], ['wall, 24 in by 36 in', 24, 1, 36, 40, { t: 1.25, mat: 3 }]], build: pictureFrame }),
  fam({ cat: 'household/decor', title: 'Generic round wall clock', desc: (v) => `Round clock ${v.w} in across with a bezel, a dial with twelve hour marks, hour and minute hands and a hanging tab.`,
    vs: [['10 in', 10, 2, 10, 72], ['14 in', 14, 2, 14, 70], ['20 in', 20, 2.5, 20, 66]], build: wallClock }),
  fam({ cat: 'household/decor', title: 'Generic mantel clock', desc: 'Mantel clock with a moulded base on feet, an arched case with a dial ring, hour marks and hands, and two side pillars with ball tops.',
    vs: [['arched case, 11 in by 13 in', 11, 4.5, 13]], build: mantelClock }),
  fam({ cat: 'household/decor', title: 'Generic pillar candle on dish', desc: (v) => `Pillar candle ${v.cd} in across and ${v.ch} in tall on a shallow dish, with a melt pool, wick and flame.`,
    vs: [['3 in by 4 in', 4, 4, 6.5, 0, { cd: 3, ch: 4 }], ['3 in by 9 in', 4, 4, 11.5, 0, { cd: 3, ch: 9 }]], build: pillar }),
  fam({ cat: 'household/decor', title: 'Generic taper candlestick', desc: 'Candlestick with a round foot, a turned stem and a bobeche cup holding a tapering candle with a wick and flame.',
    vs: [['10 in', 4, 4, 10]], build: taperStick }),
  fam({ cat: 'household/decor', title: 'Generic table lantern', desc: (v) => `Square-based lantern with four corner posts, a glass cylinder, an inner pillar candle with flame, a pyramid cap and a ring handle.`,
    vs: [['small, 6 in by 9 in', 6, 6, 9], ['large, 10 in by 18 in', 10, 10, 18]], build: lantern }),
  fam({ cat: 'household/decor', title: 'Generic round planter', desc: (v) => `Tapered ${v.w} in pot on a saucer with a rim band and soil, holding a clump of leaf blades.`,
    vs: [['6 in pot', 6, 6, 11, 0, { ph: 5.5 }], ['10 in pot', 10, 10, 19, 0, { ph: 9 }], ['14 in pot', 14, 14, 26, 0, { ph: 12.5 }]], build: planter }),
  fam({ cat: 'household/decor', title: 'Generic window trough planter', desc: 'Rectangular tapered trough on four feet with a rim and soil bed, holding a row of leaf blades.',
    vs: [['30 in', 30, 9, 17]], build: trough }),
  fam({ cat: 'household/decor', title: 'Generic sunburst wall mirror', desc: (v) => `Round mirror in a raised frame ringed by ${v.rays} alternating long and short rays, with a hanging bracket.`,
    vs: [['24 in, 16 rays', 24, 2, 24, 48, { rays: 16 }], ['32 in, 24 rays', 32, 2.5, 32, 44, { rays: 24 }]], build: sunburst }),
];

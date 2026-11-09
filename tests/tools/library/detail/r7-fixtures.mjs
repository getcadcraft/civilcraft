/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, fixtures: 150 more lighting, bath, hardware and fitting variants. Original geometry; generic sizes. */
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
function torus(a, cx, cy, cz, R, r, axis, seg = 24, ts = 6) {
  const P = (u, v) => { const c = m.cos(u), sn = m.sin(u), w = R + r * m.cos(v), h = r * m.sin(v); return axis === 'y' ? [cx + w * c, cy + h, cz + w * sn] : [cx + h, cy + w * c, cz + w * sn]; };
  for (let i = 0; i < seg; i++) for (let k = 0; k < ts; k++) { const u0 = (i / seg) * 2 * PI, u1 = ((i + 1) / seg) * 2 * PI, v0 = (k / ts) * 2 * PI, v1 = ((k + 1) / ts) * 2 * PI; quad(a, P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)); }
  return a;
}
const ringXZ = (a, x, y, z, r, tr, seg = 24, ts = 6) => torus(a, x, y, z, r, tr, 'y', seg, m.max(ts, 6));
const ringYZ = (a, x, y, z, r, tr, seg = 24, ts = 6) => torus(a, x, y, z, r, tr, 'x', seg, m.max(ts, 6));
/** square frustum from half-size s at z0 up to half-size ts at z1 */
function pyr(a, cx, cy, s, z0, z1, ts = 6) {
  const P = (h, z) => [[cx - h, cy - h, z], [cx + h, cy - h, z], [cx + h, cy + h, z], [cx - h, cy + h, z]];
  const b = P(s, z0), t = P(ts, z1);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; quad(a, b[i], b[j], t[j], t[i]); }
  return quad(a, t[0], t[1], t[2], t[3]);
}
/** a hollow shell of revolution from an outer profile (r, z) listed top to bottom */
function shellRev(a, cx, cy, outer, t, seg = 28) {
  const inner = outer.map(([r, z]) => [m.max(r - t, 0.5), z - t * 0.7]).reverse();
  return revolve(a, cx, cy, [...outer, ...inner], seg);
}
const bulb = (a, x, y, z, r = 32) => { a.cyl(x, y, z, z + r * 0.9, r * 0.45, 10); a.ell(x, y, z - r * 0.35, r, r, r * 1.15, 12, 7); };
function canopy(a, r = 58, zTop = a.Z1) { a.cyl(a.cx, a.cy, zTop - 20, zTop, r, 20); a.cyl(a.cx, a.cy, zTop - 26, zTop - 20, r * 0.35, 12); }

// ------------------------------------------------------------------------------------------ lighting
function linearPend(a, v) {
  const cy = a.cy, hz = a.Z0 + 58, xs = v.hang === 3 ? [a.X0 + a.W * 0.12, a.cx, a.X1 - a.W * 0.12] : [a.X0 + a.W * 0.2, a.X1 - a.W * 0.2];
  a.box(a.X0, a.YF, a.Z0 + 8, a.X1, a.YB, hz);
  a.box(a.X0 + 12, a.YF + 12, a.Z0, a.X1 - 12, a.YB - 12, a.Z0 + 8);
  for (const x of [a.X0, a.X1 - 7]) a.box(x, a.YF, a.Z0 + 4, x + 7, a.YB, hz + 6);
  for (let k = 1; k < 5; k++) a.box(a.X0 + (a.W * k) / 5 - 3, a.YF + 4, hz, a.X0 + (a.W * k) / 5 + 3, a.YB - 4, hz + 3);
  for (const x of xs) { a.cyl(x, cy, hz, hz + 14, 9, 10); a.tube([[x, cy, hz + 14], [x, cy, a.Z1 - 16]], [2.4, 2.4], 6); a.cyl(x, cy, a.Z1 - 14, a.Z1, 26, 14); a.circ(x, cy, 26, 'EQUIP-DETAIL'); }
  a.outline(); a.rect(a.X0 + 12, a.YF + 12, a.X1 - 12, a.YB - 12, 'EQUIP-DETAIL');
  a.log('Added the housing with end caps, the opal lens, top ribs, ' + xs.length + ' hanger wires with clamps and ceiling canopies (plan and 3D).');
}
function bellPend(a, v) {
  const R = a.W / 2, sh = v.sh * IN, zt = a.Z0 + sh, cx = a.cx, cy = a.cy;
  const pr = [[0.22, 1], [0.3, 0.86], [0.42, 0.66], [0.62, 0.36], [0.84, 0.12], [1, 0]];
  shellRev(a, cx, cy, pr.map(([r, h]) => [R * r, a.Z0 + sh * h]), 3.5, 28);
  loop(a, cx, cy, R - 1, a.Z0 + 2, 2.6, 32, 5);
  a.cyl(cx, cy, zt - 8, zt + 30, 20, 12); a.cyl(cx, cy, zt + 30, zt + 38, 26, 12);
  bulb(a, cx, cy, a.Z0 + sh * 0.3, R * 0.2);
  a.tube([[cx, cy, zt + 38], [cx, cy, a.Z1 - 20]], [2.6, 2.6], 6); canopy(a);
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.22, 'EQUIP-DETAIL'); a.circ(cx, cy, 58, 'EQUIP-DETAIL');
  a.log('Added the canopy, cord, socket collar, hollow flared bell shade with a rolled rim and the bulb (plan and 3D).');
}
function multiDrop(a, v) {
  const n = v.n, cy = a.cy, zr = a.Z1 - 44, sp = (a.W - 120) / (n - 1), r = m.min(70, sp * 0.4), hs = 130;
  a.box(a.X0 + 4, cy - 24, zr, a.X1 - 4, cy + 24, a.Z1 - 10); a.box(a.X0, cy - 30, a.Z1 - 10, a.X1, cy + 30, a.Z1);
  for (const x of [a.X0 + 40, a.X1 - 40]) a.cyl(x, cy, a.Z1 - 14, a.Z1 - 10, 8, 8);
  for (let i = 0; i < n; i++) {
    const x = a.X0 + 60 + sp * i, zs = a.Z0 + (i % 2) * 0.36 * (a.H - 190);
    revolve(a, x, cy, [[22, zs + hs], [r, zs], [r - 3, zs + 1.5], [19, zs + hs - 3]], 20);
    loop(a, x, cy, r - 1, zs + 1.5, 2, 20, 4);
    a.cyl(x, cy, zs + hs - 8, zs + hs + 16, 14, 10); bulb(a, x, cy, zs + 28, 18);
    a.tube([[x, cy, zs + hs + 16], [x, cy, zr + 4]], [2.2, 2.2], 5);
    a.circ(x, cy, r, 'EQUIP-DETAIL');
  }
  a.rect(a.X0, cy - 30, a.X1, cy + 30);
  a.log('Added the ceiling rail with its plate, ' + n + ' cords of alternating drop, conical shades and bulbs (plan and 3D).');
}
function pictureLight(a, v) {
  const zc = a.Z0 + a.H * 0.52, D = a.D, W = a.W, n = W > 590 ? 2 : 1;
  const xs = n === 1 ? [a.cx] : [a.cx - W * 0.28, a.cx + W * 0.28];
  for (const x of xs) {
    a.box(x - 24, -9, zc - 55, x + 24, 0, zc + 55); screwHead(a, x, zc + 38, -9, 3.2); screwHead(a, x, zc - 38, -9, 3.2);
    sweep(a, arcPts([x, -9, zc], [x, -D * 0.72, zc - 14], [x, -D + 34, zc + 10]), new Array(11).fill(8), 8);
    a.cyl(x, -D + 34, zc + 4, zc + 26, 13, 10);
    a.line(x, -9, x, -D + 34, 'EQUIP-DETAIL'); a.rect(x - 24, -9, x + 24, 0);
  }
  prismX(a, [[-D + 8, zc + 8], [-D, zc + 24], [-D + 4, zc + 44], [-D + 52, zc + 44], [-D + 60, zc + 14]], a.X0 + 8, a.X1 - 8);
  a.xcyl(a.X0 + 16, a.X1 - 16, -D + 32, zc + 24, 5, 10);
  for (const [x0, x1] of [[a.X0, a.X0 + 8], [a.X1 - 8, a.X1]]) prismX(a, [[-D + 6, zc + 6], [-D - 0 + 0.5, zc + 24], [-D + 6, zc + 46], [-D + 56, zc + 46], [-D + 62, zc + 10]], x0, x1);
  a.rect(a.X0 + 8, -D, a.X1 - 8, -D + 60); a.line(a.X0 + 16, -D + 32, a.X1 - 16, -D + 32, 'EQUIP-DETAIL');
  a.log('Added the wall plates with screws, ' + (n === 2 ? 'two' : 'one') + ' swan arm' + (n === 2 ? 's' : '') + ', the swivel and the half-round hood with end caps and tube lamp (plan and 3D).');
}
function vanityBar(a, v) {
  const n = v.n, zc = a.Z0 + a.H * 0.36, y = -48, sp = a.W / n, r = m.min(42, sp * 0.4);
  for (const x of [a.X0 + 30, a.X1 - 30]) { a.box(x - 24, -10, zc - 50, x + 24, 0, zc + 50); screwHead(a, x, zc + 34, -10, 3); screwHead(a, x, zc - 34, -10, 3); a.tube([[x, -10, zc], [x, y, zc]], [8, 8], 8); a.rect(x - 24, -10, x + 24, 0); }
  a.xcyl(a.X0 + 22, a.X1 - 22, y, zc, 10, 12);
  for (let i = 0; i < n; i++) {
    const x = a.X0 + sp * (i + 0.5);
    a.cyl(x, y, zc + 6, zc + 44, 15, 10); a.cyl(x, y, zc + 36, zc + 46, r * 0.7, 14);
    a.ell(x, y, zc + 44 + r * 1.1, r, r, r * 1.1, 16, 9); a.cyl(x, y, zc + 44, zc + 50, r * 0.78, 14);
    a.circ(x, y, r, 'EQUIP-DETAIL');
  }
  a.line(a.X0 + 22, y, a.X1 - 22, y, 'EQUIP-DETAIL');
  a.log('Added two wall plates with screws, a bracketed bar and ' + n + ' sockets with glass globes (plan and 3D).');
}
function flushDisc(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, z1 = a.Z1;
  a.cyl(cx, cy, z1 - 8, z1, R * 0.96, 36);
  revolve(a, cx, cy, [[R, z1 - 8], [R, z0 + 14], [R - 4, z0 + 14], [R - 4, z1 - 8]], 36);
  a.ell(cx, cy, z0 + 14, R - 5, R - 5, 14, 36, 8);
  loop(a, cx, cy, R - 2, z0 + 14, 3, 36, 5);
  a.cyl(cx, cy, z0, z0 + 3, 14, 12); a.ell(cx, cy, z0 + 3, 20, 20, 5, 12, 5);
  for (let i = 0; i < 3; i++) { const t = (i / 3) * 2 * PI + 0.4; a.cyl(cx + (R - 20) * m.cos(t), cy + (R - 20) * m.sin(t), z0 + 2, z0 + 6, 5, 8); }
  a.circ(cx, cy, R); a.circ(cx, cy, R - 4, 'EQUIP-DETAIL'); a.circ(cx, cy, 14, 'EQUIP-DETAIL');
  a.log('Added the ceiling plate, drum wall with rolled rim, opal lens, centre finial and three clips (plan and 3D).');
}
function troffer(a, v) {
  const b = 36, z0 = a.Z0, z1 = a.Z1;
  a.box(a.X0, a.YF, z0, a.X1, a.YF + b, z0 + 10); a.box(a.X0, a.YB - b, z0, a.X1, a.YB, z0 + 10); a.box(a.X0, a.YF, z0, a.X0 + b, a.YB, z0 + 10); a.box(a.X1 - b, a.YF, z0, a.X1, a.YB, z0 + 10);
  a.box(a.X0 + b, a.YF + b, z0 + 3, a.X1 - b, a.YB - b, z0 + 7);
  const nr = m.floor((a.W - 2 * b) / 30);
  for (let k = 1; k < nr; k++) { const x = a.X0 + b + ((a.W - 2 * b) * k) / nr; a.box(x - 1.3, a.YF + b, z0, x + 1.3, a.YB - b, z0 + 3.2); a.line(x, a.YF + b, x, a.YB - b, 'EQUIP-DETAIL'); }
  a.box(a.X0 + b + 8, a.YF + b + 8, z0 + 10, a.X1 - b - 8, a.YB - b - 8, z1 - 28);
  a.box(a.cx - 55, a.cy - 55, z1 - 30, a.cx + 55, a.cy + 55, z1);
  for (const sx of [-1, 1]) a.cyl(a.cx + sx * (a.W / 2 - b - 20), a.cy, z0 + 10, z1 - 28, 5, 8);
  a.outline(); a.rect(a.X0 + b, a.YF + b, a.X1 - b, a.YB - b, 'EQUIP-DETAIL');
  a.log('Added the flange frame, opal lens with ' + (nr - 1) + ' prism ribs, the housing and a junction box above the ceiling line (plan and 3D).');
}
function lantern(a, v) {
  const s = a.W, cx = a.cx, yb = -18, yf = yb - s, yc = (yb + yf) / 2, H = a.H, zb = a.Z0 + 6, zr = a.Z1 - 0.22 * H, ap = a.Z1 - 0.12 * H, zc = a.Z0 + H * 0.4;
  a.box(cx - 36, -12, zb + 20, cx + 36, 0, zr - 10); screwHead(a, cx, zr - 30, -12, 3.4); screwHead(a, cx, zb + 40, -12, 3.4);
  for (const z of [zb + 40, zr - 40]) a.tube([[cx, -12, z], [cx, yb + 6, z]], [7, 7], 8);
  a.box(cx - s / 2 - 6, yf - 6, zb, cx + s / 2 + 6, yb + 6, zb + 12);
  for (const sx of [-1, 1]) for (const sy of [yf, yb]) a.box(cx + sx * (s / 2 - 5) - 5, sy + (sy === yf ? 0 : -10), zb + 12, cx + sx * (s / 2 - 5) + 5, sy + (sy === yf ? 10 : 0), zr);
  for (const z of [zr - 6, zb + 12]) { a.box(cx - s / 2, yf, z, cx + s / 2, yf + 8, z + 6); a.box(cx - s / 2, yb - 8, z, cx + s / 2, yb, z + 6); a.box(cx - s / 2, yf, z, cx - s / 2 + 8, yb, z + 6); a.box(cx + s / 2 - 8, yf, z, cx + s / 2, yb, z + 6); }
  a.cyl(cx, yc, zb + 12, zc, 15, 12); bulb(a, cx, yc, zc, 20);
  a.box(cx - s / 2 - 10, yf - 10, zr, cx + s / 2 + 10, yb + 10, zr + 8);
  pyr(a, cx, yc, s / 2 + 8, zr + 8, ap, 10);
  a.cyl(cx, yc, ap, ap + 8, 6, 8); a.ell(cx, yc, ap + 12, 11, 11, 11, 10, 6);
  a.rect(cx - s / 2 - 6, yf - 6, cx + s / 2 + 6, yb + 6); a.rect(cx - s / 2 + 8, yf + 8, cx + s / 2 - 8, yb - 8, 'EQUIP-DETAIL'); a.rect(cx - 36, -12, cx + 36, 0); a.line(cx, -12, cx, yb, 'EQUIP-DETAIL');
  a.log('Added the wall plate and arms, base, four corner posts with top and bottom rails, candle and bulb, eave and pyramid cap with finial (plan and 3D).');
}
function barnLight(a, v) {
  const R = a.W / 2, cx = a.cx, ys = -(a.D - R), sh = R * 0.42, zt = a.Z0 + sh, zp = a.Z1 - 80;
  shellRev(a, cx, ys, [[14, zt], [R * 0.45, zt - sh * 0.05], [R * 0.8, a.Z0 + sh * 0.5], [R, a.Z0 + sh * 0.14], [R, a.Z0]], 3.5, 36);
  loop(a, cx, ys, R - 1, a.Z0 + 3, 3, 36, 5);
  a.cyl(cx, ys, zt - 6, zt + 26, 16, 12); bulb(a, cx, ys, a.Z0 + sh * 0.3, 30);
  sweep(a, arcPts([cx, -14, zp], [cx, ys * 0.5, a.Z1 - 8], [cx, ys, zt + 26]), new Array(11).fill(8), 8);
  a.ycyl(-12, 0, cx, zp, 64, 24); a.ycyl(-20, -12, cx, zp, 40, 18);
  a.circ(cx, ys, R); a.circ(cx, ys, R * 0.45, 'EQUIP-DETAIL'); a.rect(cx - 64, -12, cx + 64, 0); a.line(cx, -14, cx, ys, 'EQUIP-DETAIL');
  a.log('Added the round wall rosette, the gooseneck arm arching over, the socket neck, the metal dome shade with a rolled rim and the bulb (plan and 3D).');
}
function bollardLight(a, v) {
  const cx = a.cx, cy = a.cy, b = a.W / 2, z0 = a.Z0, z1 = a.Z1, hb = z1 - 250;
  a.box(cx - b, cy - b, z0, cx + b, cy + b, z0 + 10);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { a.cyl(cx + sx * (b - 16), cy + sy * (b - 16), z0 + 10, z0 + 20, 7, 8); a.circ(cx + sx * (b - 16), cy + sy * (b - 16), 7, 'EQUIP-DETAIL'); }
  a.cyl(cx, cy, z0 + 10, z0 + 40, 54, 24); a.cyl(cx, cy, z0 + 40, hb, 40, 24);
  a.cyl(cx, cy, hb, hb + 14, 56, 28);
  for (let k = 0; k < 3; k++) { const zk = hb + 30 + k * 56; a.cyl(cx, cy, zk - 20, zk, 46, 24); a.cone(cx, cy, zk, zk + 14, 64, 50, 28); }
  a.cyl(cx, cy, hb + 14, z1 - 34, 46, 24);
  a.cone(cx, cy, z1 - 34, z1, 72, 12, 28);
  a.rect(cx - b, cy - b, cx + b, cy + b); a.circ(cx, cy, 64, 'EQUIP-DETAIL'); a.circ(cx, cy, 40, 'EQUIP-DETAIL');
  a.log('Added the bolted base plate, post, collar, three louvre skirts over the light bands and the domed cap (plan and 3D).');
}
function underCab(a, v) {
  const D = a.D, z0 = a.Z0, z1 = a.Z1, poly = [[-3, z1 - 3], [-D + 3, z1 - 3], [-D + 3, z0 + 9], [-D * 0.8, z0 + 4], [-D * 0.2, z0 + 4], [-3, z0 + 9]];
  prismX(a, poly, a.X0 + 8, a.X1 - 8);
  a.box(a.X0 + 12, -D * 0.8, z0, a.X1 - 12, -D * 0.2, z0 + 4.5);
  for (const k of [-1, 0, 1]) a.box(a.X0 + 12, -D * 0.5 + k * D * 0.13 - 1, z0 - 0, a.X1 - 12, -D * 0.5 + k * D * 0.13 + 1, z0 + 5);
  for (const [x0, x1] of [[a.X0, a.X0 + 8], [a.X1 - 8, a.X1]]) prismX(a, [[-2, z1 - 2], [-D + 2, z1 - 2], [-D + 2, z0 + 8], [-D * 0.8, z0 + 2], [-D * 0.2, z0 + 2], [-2, z0 + 8]], x0, x1);
  for (const x of [a.X0 + 70, a.X1 - 70]) { a.box(x - 12, -D + 4, z1 - 3, x + 12, -4, z1); a.cyl(x, -D / 2, z1 - 4, z1, 3.5, 8); a.rect(x - 12, -D + 4, x + 12, -4, 'EQUIP-DETAIL'); }
  a.box(a.X1 - 70, -D * 0.5 - 9, z0 + 2, a.X1 - 40, -D * 0.5 + 9, z0 + 9);
  a.outline(); a.rect(a.X0 + 12, -D * 0.8, a.X1 - 12, -D * 0.2, 'EQUIP-DETAIL');
  a.log('Added the bevelled housing, opal lens with ribs, end caps, two mounting clips and the rocker switch (plan and 3D).');
}
function ceilFan(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, n = v.n, zb = a.Z0 + a.H * 0.26, hr = 150, k = R / 533;
  a.cyl(cx, cy, zb - 14, zb + 86, hr, 32); a.cone(cx, cy, zb + 86, zb + 124, hr, 56, 32);
  a.cone(cx, cy, zb - 30, zb - 14, hr * 0.8, hr, 32);
  a.cyl(cx, cy, zb - 70, zb - 30, 96, 28); a.ell(cx, cy, zb - 40, 100, 100, 62, 24, 8);
  a.tube([[cx, cy, zb + 124], [cx, cy, a.Z1 - 40]], [16, 16], 12); a.cone(cx, cy, a.Z1 - 42, a.Z1, 36, 88, 24);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 2 * PI + PI / n, u = [m.cos(t), m.sin(t)], p = [-m.sin(t), m.cos(t)], pt = (r, l) => [cx + r * u[0] + l * p[0], cy + r * u[1] + l * p[1]];
    const r0 = hr + 60, r1 = R - 12, w0 = 38 * k + 10, w1 = 52 * k + 10;
    a.prism([pt(r0, -w0), pt(r1, -w1), pt(r1 + 8, -w1 * 0.4), pt(r1 + 8, w1 * 0.4), pt(r1, w1), pt(r0, w0)], zb + 20, zb + 28);
    const q = pt(hr - 10, 0), q2 = pt(r0 + 60, 0); a.tube([[q[0], q[1], zb + 14], [q2[0], q2[1], zb + 22]], [8, 6], 8);
    a.line(cx, cy, ...pt(R, 0), 'EQUIP-DETAIL'); a.poly([pt(r0, -w0), pt(r1, -w1), pt(r1, w1), pt(r0, w0)], 'EQUIP-DETAIL');
  }
  a.circ(cx, cy, R); a.circ(cx, cy, hr, 'EQUIP-DETAIL'); a.circ(cx, cy, 96, 'EQUIP-DETAIL');
  a.log('Added the canopy, downrod, motor housing, ' + n + ' blades on iron arms and the light kit with its glass bowl (plan and 3D).');
}
function halfUplight(a, v) {
  const rx = a.W / 2, ry = a.D - 6, cx = a.cx, z0 = a.Z0, z1 = a.Z1, zc = z0 + a.H * 0.5;
  const half = (s, n = 16) => { const p = []; for (let i = 0; i <= n; i++) { const t = (i / n) * PI; p.push([cx + rx * s * m.cos(t), -ry * s * m.sin(t) - 0.01]); } return p; };
  a.box(cx - 40, -6, zc - 80, cx + 40, 0, zc + 80); screwHead(a, cx, zc + 55, -6, 3.2); screwHead(a, cx, zc - 55, -6, 3.2);
  shellLoft(a, half, z0 + 8, z1 - 22, (t) => 0.5 + 0.5 * t, 0.1, 6, false);
  a.prism(half(0.5), z0, z0 + 10);
  ringPoly(a, half(1), half(0.86), z1 - 22, z1);
  a.prism(half(0.86), z1 - 24, z1 - 20);
  a.ell(cx, -ry * 0.2, z1 - 24, rx * 0.26, ry * 0.2, 14, 12, 5);
  a.poly(half(1)); a.poly(half(0.86), 'EQUIP-DETAIL'); a.rect(cx - 40, -6, cx + 40, 0, 'EQUIP-DETAIL');
  a.log('Added the wall plate with screws, the half-round body and the rim around a glowing top lens (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ bath
function tap(a, x, y, zb, hgt, reach, lever = true) {
  a.cyl(x, y, zb, zb + 12, 24, 16);
  a.cyl(x, y, zb + 12, zb + hgt * 0.62, 15, 14);
  a.cyl(x, y, zb + hgt * 0.62, zb + hgt * 0.62 + 6, 17, 14);
  const zt = zb + hgt - 12, zs = zb + hgt * 0.62;
  sweep(a, [[x, y, zs], [x, y, zt - 20], [x, y - 14, zt], [x, y - reach * 0.55, zt + 8], [x, y - reach + 12, zt - 6], [x, y - reach, zt - 26]], [14, 14, 12, 12, 12, 12], 10);
  a.cyl(x, y - reach, zt - 40, zt - 20, 14, 10);
  if (lever) { a.tube([[x + 8, y, zs - 2], [x + 70, y, zs + 22]], [6.5, 6.5], 8); a.ell(x + 74, y, zs + 24, 12, 8, 6, 8, 5); }
  a.circ(x, y, 24); a.line(x, y, x, y - reach, 'EQUIP-DETAIL'); a.circ(x, y - reach, 8, 'EQUIP-DETAIL');
}
function dropIn(a, v) {
  const W = a.W, D = a.D, cx = a.cx, zd = a.Z0 + v.bowl * IN, bd = D - 150, bw = W - 90, bcy = -(D - 45) + bd / 2;
  a.prism(rrect(cx, -D / 2, W, D, 40, 4), zd - 8, zd);
  const mk = (s) => rrect(cx, bcy, bw * s, bd * s, 50 * s, 4);
  shellLoft(a, mk, a.Z0 + 10, zd, (t) => 0.6 + 0.4 * m.sin((t * PI) / 2), 0.1, 6);
  a.prism(mk(0.46), a.Z0, a.Z0 + 14);
  ringPoly(a, rrect(cx, -D / 2, W, D, 40, 4), mk(1.04), zd - 3, zd + 3);
  a.cyl(cx, bcy, a.Z0 + 14, a.Z0 + 20, 24, 14); a.box(cx - 26, bcy + bd / 2 - 8, zd - 90, cx + 26, bcy + bd / 2 - 1, zd - 20);
  tap(a, cx, -44, zd, a.Z1 - zd, 110);
  a.poly(rrect(cx, -D / 2, W, D, 40, 4)); a.poly(mk(1.0), 'EQUIP-DETAIL'); a.circ(cx, bcy, 24, 'EQUIP-DETAIL');
  a.log('Added the rim flange, hollow bowl with an overflow slot, drain and a deck tap at the back (plan and 3D).');
}
function showerEncl(a, v) {
  const W = a.W, D = a.D, cx = a.cx, z0 = a.Z0, z1 = a.Z1, gt = 5, rail = 20, yf = a.YF + 20;
  a.box(a.X0, a.YF, z0, a.X1, a.YB, z0 + 22);
  const out = [[a.X0, a.YF], [a.X1, a.YF], [a.X1, a.YB], [a.X0, a.YB]], inn = [[a.X0 + 40, a.YF + 40], [a.X1 - 40, a.YF + 40], [a.X1 - 40, a.YB - 40], [a.X0 + 40, a.YB - 40]];
  ringPoly(a, out, inn, z0 + 22, z0 + 56); a.cyl(cx, a.cy, z0 + 22, z0 + 26, 40, 16);
  const gz0 = z0 + 56, gz1 = z1 - 20;
  const pane = (x0, x1, y0, y1) => { a.frame(x0, gz0, x1, gz1, y0, y1, rail); a.box(x0 + rail, y0 + 2, gz0 + rail, x1 - rail, y1 - 2, gz0 + 560); a.box(x0 + rail, y0 + 3, gz0 + 560, x1 - rail, y1 - 3, gz0 + 590); };
    const fw = W * 0.38; pane(a.X0 + 2, a.X0 + 2 + fw, yf, yf + gt * 3); pane(a.X0 + 2 + fw, a.X1 - 2, yf, yf + gt * 3);
  for (const x of [a.X0 + 2 + gt, a.X1 - 2 - gt]) { a.frame(x - 0, gz0, x + 0.01, gz1, a.YF + 40, a.YB - 20, 1); a.box(x - gt / 2, a.YF + 40, gz0, x + gt / 2, a.YB - 20, gz0 + 560); a.box(x - gt / 2, a.YF + 40, gz1 - 20, x + gt / 2, a.YB - 20, gz1); a.box(x - gt / 2, a.YF + 40, gz0, x + gt / 2, a.YF + 60, gz1); a.box(x - gt / 2, a.YB - 40, gz0, x + gt / 2, a.YB - 20, gz1); }
  a.box(a.X0 + 2, a.YB - 24, gz1, a.X1 - 2, a.YB - 10, z1);
  const dx = a.X0 + 2 + fw; for (const z of [gz0 + 120, gz1 - 120]) a.cyl(dx, yf + 8, z - 30, z + 30, 6, 10);
  a.tube([[a.X1 - 70, yf - 10 + 14, gz0 + 380], [a.X1 - 70, yf - 10 + 14, gz1 - 380]], [10, 10], 8);
  for (const z of [gz0 + 380, gz1 - 380]) a.ycyl(yf, yf + 20, a.X1 - 70, z, 6, 8);
  const hz = z1 - 60; a.tube([[cx, a.YB - 8, hz], [cx, a.YB - 110, hz], [cx, a.YB - 140, hz - 10]], [9, 9, 9], 8); a.cyl(cx, a.YB - 150, hz - 24, hz - 10, 70, 24);
  a.rect(a.X0, a.YF, a.X1, a.YB); a.rect(a.X0 + 40, a.YF + 40, a.X1 - 40, a.YB - 40, 'EQUIP-DETAIL'); a.circ(cx, a.cy, 40, 'EQUIP-DETAIL'); a.arc(dx, yf + 8, W - fw - 20, 270, 360, 'EQUIP-SWING');
  a.log('Added the tray with a raised lip and drain, framed door and fixed panel with a frosted glass band, two side panels, a header rail, a pull bar and a rain head (plan and 3D).');
}
function urinal(a, v) {
  const D = a.D, cx = a.cx, bw = v.bowl * IN, zb = a.Z0, rim = zb + v.rim * IN, z1 = a.Z1;
  const mk = (s) => { const p = []; for (let i = 0; i <= 14; i++) { const t = (i / 14) * PI; p.push([cx + (bw / 2) * s * m.cos(t), -D * 0.9 * s * m.sin(t) - 0.01]); } return p; };
  shellLoft(a, mk, zb + 6, rim, (t) => 0.46 + 0.54 * m.sin((t * PI) / 2), 0.09, 7);
  a.prism(mk(0.4), zb, zb + 10);
  a.cyl(cx, -D * 0.34, zb + 10, zb + 16, 38, 14); a.ycyl(-70, 0, cx, zb + 42, 26, 12);
  const py = -60, zt = z1;
  a.tube([[cx, -6, zt - 60], [cx, py, zt - 60]], [19, 19], 12); a.tube([[cx, py, zt - 60], [cx, py, rim + 8]], [20, 20], 12);
  a.cyl(cx, py, zt - 110, zt - 12, 34, 16); a.cyl(cx, py, zt - 14, zt, 38, 16);
  a.cyl(cx, py, rim + 90, rim + 190, 40, 16); a.cyl(cx, py, rim + 60, rim + 90, 26, 16); a.ycyl(py - 40, py - 58, cx, rim + 140, 17, 12);
  a.cone(cx, py, rim - 26, rim + 6, 44, 16, 14);
  if (v.shield) for (const x0 of [a.X0, a.X1 - 24]) a.box(x0, -D * 0.95, zb + 40, x0 + 24, 0, rim + 340);
  a.poly(mk(1.0)); a.poly(mk(0.86), 'EQUIP-DETAIL'); a.circ(cx, -D * 0.34, 38, 'EQUIP-DETAIL'); a.circ(cx, py, 30, 'EQUIP-DETAIL');
  if (v.shield) for (const x0 of [a.X0, a.X1 - 24]) a.rect(x0, -D * 0.95, x0 + 24, 0);
  a.log('Added the half-oval bowl with a rolled rim, strainer, waste outlet, spreader and an exposed flush valve with push button' + (v.shield ? ' between two privacy screens' : '') + ' (plan and 3D).');
}
function tubFiller(a, v) {
  const cx = a.cx, D = a.D, rx = a.X0 + a.W * 0.36, ry = -D * 0.3, reach = D * 0.5, z0 = a.Z0, z1 = a.Z1;
  a.cyl(rx, ry, z0, z0 + 10, 100, 28); a.cone(rx, ry, z0 + 10, z0 + 40, 76, 24, 28);
  a.tube([[rx, ry, z0 + 40], [rx, ry, z1 - 70]], [24, 24], 14);
  a.tube([[rx, ry, z1 - 70], [rx, ry, z1 - 40], [rx, ry - 20, z1 - 10], [rx, ry - reach * 0.6, z1 - 4], [rx, ry - reach + 10, z1 - 30], [rx, ry - reach, z1 - 100]], [19, 19, 17, 15, 15, 15], 12);
  const zh = z0 + (z1 - z0) * 0.5;
  for (const s of [-1, 1]) { a.tube([[rx + s * 20, ry, zh], [rx + s * 80, ry, zh + 20]], [8, 8], 8); a.ell(rx + s * 90, ry, zh + 22, 18, 10, 8, 10, 6); a.cyl(rx + s * 20, ry, zh - 18, zh + 18, 20, 12); }
  if (v.hs) {
    const hx = rx + a.W * 0.22; a.cyl(hx, ry, zh - 60, zh - 20, 18, 12); a.tube([[hx, ry, zh - 20], [hx, ry, zh + 60]], [13, 13], 10); a.cone(hx, ry, zh + 60, zh + 96, 13, 34, 14);
    sweep(a, arcPts([hx, ry, zh - 60], [hx + 70, ry, z0 + 60], [rx + 36, ry, z0 + 60]), new Array(11).fill(6), 6);
  }
  a.circ(rx, ry, 100); a.circ(rx, ry, 24, 'EQUIP-DETAIL'); a.line(rx, ry, rx, ry - reach, 'EQUIP-DETAIL'); a.circ(rx, ry - reach, 14, 'EQUIP-DETAIL');
  a.log('Added the round floor plate, riser, arched spout, two lever handles' + (v.hs ? ' and a hand shower on its cradle with a hose' : '') + ' (plan and 3D).');
}
function showerSet(a, v) {
  const n = v.n, gw = a.W / n;
  a.box(a.X0, -3, a.Z0, a.X1, 0, a.Z1);
  for (let g = 0; g < n; g++) {
    const x = a.X0 + gw * (g + 0.5), z = a.Z0 + a.H / 2, R = m.min(46, gw * 0.38);
    revolveY(a, x, z, -3, [[R, 0], [R, 5], [R * 0.7, 12], [R * 0.45, 16]], 24); a.ycyl(-19, -16, x, z, R * 0.4, 14);
    a.tube([[x, -17, z], [x + R * 0.9, -26, z + 4]], [6, 5], 8); a.ell(x + R * 1.0, -27, z + 4, 9, 6, 6, 8, 5);
    a.circ(x, -5, R, 'EQUIP-DETAIL'); a.line(x, -10, x + R * 0.9, -10, 'EQUIP-DETAIL');
  }
  for (const x of [a.X0 + 12, a.X1 - 12]) { screwHead(a, x, a.Z0 + 10, -3, 2.6); screwHead(a, x, a.Z1 - 10, -3, 2.6); }
  a.rect(a.X0, -3, a.X1, 0);
  a.log('Added the wall plate with screws and ' + n + ' round trims, each with a dome and a side lever (plan and 3D).');
}
function handRail(a, v) {
  const cx = a.cx, L = v.rail * IN, z0 = a.Z0 + 20, z1 = z0 + L, zm = z0 + L * 0.58, yr = -44, ys = -74;
  a.tube([[cx, yr, z0 - 6], [cx, yr, z1 + 6]], [9, 9], 12);
  for (const z of [z0 - 6, z1 + 6]) { a.box(cx - 24, -6, z - 28, cx + 24, 0, z + 28); a.box(cx - 14, yr - 14, z - 14, cx + 14, -6, z + 14); screwHead(a, cx, z + 18, -6, 3); }
  a.box(cx - 22, yr - 22, zm - 36, cx + 22, yr + 22, zm + 36); a.ycyl(yr - 28, yr - 22, cx, zm, 10, 10);
  a.tube([[cx, ys, zm - 170], [cx, ys, zm + 40]], [13, 13], 10); a.tube([[cx, ys, zm + 40], [cx, -102, zm + 80]], [11, 12], 10);
  a.ycyl(-124, -104, cx, zm + 92, 44, 28); a.ycyl(-126, -124, cx, zm + 92, 36, 24); ringXZ(a, cx, -126, zm + 92, 18, 1.8, 16, 4);
  sweep(a, arcPts([cx, ys, zm - 170], [cx + 62, -100, z0 + 20], [cx + 46, -12, z0 + 40]), new Array(11).fill(5), 6);
  a.ycyl(-24, 0, cx + 46, z0 + 40, 15, 12);
  a.rect(cx - 24, -6, cx + 24, 0); a.circ(cx, yr, 9, 'EQUIP-DETAIL'); a.circ(cx, ys, 13, 'EQUIP-DETAIL'); a.circ(cx, -112, 44, 'EQUIP-DETAIL');
  a.log('Added the ' + v.rail + ' in slide rail with two wall brackets, the sliding holder, the handset docked on it and the hose to the wall elbow (plan and 3D).');
}
function rollHolder(a, v) {
  const cx = a.cx, rr = 57, y = -(rr + 14), n = v.n, rw = 114;
  for (let i = 0; i < n; i++) {
    const zc = a.Z0 + 82 + i * 150;
    for (const s of [-1, 1]) { const x = cx + s * (rw / 2 + 8); a.box(x - 12, -6, zc - 30, x + 12, 0, zc + 30); screwHead(a, x, zc + 18, -6, 2.8); a.tube([[x, -6, zc], [x, y, zc]], [5, 5], 8); }
    a.xcyl(cx - rw / 2 - 6, cx + rw / 2 + 6, y, zc, 5.5, 10);
    a.xcyl(cx - rw / 2, cx + rw / 2, y, zc, rr, 28); a.xcyl(cx - rw / 2 - 1, cx + rw / 2 + 1, y, zc, 19, 16);
    a.xcyl(cx - rw / 2 + 4, cx + rw / 2 - 4, y - 0, zc, rr + 0.8, 28);
    a.rect(cx - rw / 2 - 20, -6, cx - rw / 2 + 4, 0); a.rect(cx + rw / 2 - 4, -6, cx + rw / 2 + 20, 0);
  }
  a.rect(cx - rw / 2, y - rr, cx + rw / 2, y + rr, 'EQUIP-DETAIL');
  a.log('Added ' + (n > 1 ? 'two stacked ' : 'the ') + 'wall bracket pairs with arms and a spring spindle, each holding a paper roll with its core (plan and 3D).');
}
function grabBar(a, v) {
  const L = a.W, zc = a.Z0 + a.H / 2, y = -54, x0 = a.X0 + 38, x1 = a.X1 - 38, xs = L > 600 ? [x0, a.cx, x1] : [x0, x1];
  a.xcyl(x0 - 2, x1 + 2, y, zc, 16, 18);
  a.xcyl(a.cx - L * 0.22, a.cx + L * 0.22, y, zc, 16.8, 18);
  for (const x of xs) { a.ycyl(y, -8, x, zc, 12, 12); a.ycyl(-12, 0, x, zc, 38, 20); a.ycyl(-16, -12, x, zc, 30, 20); for (let k = 0; k < 3; k++) { const t = (k / 3) * 2 * PI; screwHead(a, x + 22 * m.cos(t), zc + 22 * m.sin(t), -16, 2.6); } a.circ(x, -6, 38, 'EQUIP-DETAIL'); }
  a.ell(x0 - 8, y, zc, 12, 16, 16, 10, 6); a.ell(x1 + 8, y, zc, 12, 16, 16, 10, 6);
  a.rect(x0 - 38, -12, x1 + 38, 0); a.line(x0, y, x1, y, 'EQUIP-DETAIL');
  a.log('Added the 1.25 in bar with a knurled grip band and ' + xs.length + ' wall flanges with cover caps and screws (plan and 3D).');
}
function towelBar(a, v) {
  const L = a.W, zc = a.Z0 + a.H / 2, y = -78, x0 = a.X0 + 30, x1 = a.X1 - 30;
  a.xcyl(x0, x1, y, zc, 10, 14);
  for (const x of [x0, x1]) { a.ycyl(-8, 0, x, zc, 30, 18); a.ycyl(-14, -8, x, zc, 24, 18); a.ycyl(y, -14, x, zc, 12, 12); a.cyl(x, y, zc - 22, zc + 22, 15, 12); screwHead(a, x, zc + 15, -14, 2.4); }
  a.rect(a.X0, -14, a.X1, 0); a.line(x0, y, x1, y, 'EQUIP-DETAIL'); for (const x of [x0, x1]) a.circ(x, y, 12, 'EQUIP-DETAIL');
  a.log('Added the ' + v.w + ' in bar between two posts with round base rosettes and cover caps (plan and 3D).');
}
function towelRing(a, v) {
  const cx = a.cx, R = v.dia * IN / 2 - 6, zr = a.Z1 - 34 - R, y = -50, zp = a.Z1 - 34;
  a.ycyl(-8, 0, cx, zp, 30, 18); a.ycyl(-14, -8, cx, zp, 22, 18); a.ycyl(y, -14, cx, zp, 8, 10);
  ringXZ(a, cx, y, zr, R, 6, 40, 8); a.ell(cx, y, zp, 11, 8, 11, 10, 6);
  a.rect(cx - 30, -8, cx + 30, 0); a.rect(cx - R - 6, y - 6, cx + R + 6, y + 6, 'EQUIP-DETAIL'); a.circ(cx, -4, 22, 'EQUIP-DETAIL');
  a.log('Added the wall rosette, the post and the ' + v.dia + ' in ring hanging from it (plan and 3D).');
}
function medCab(a, v) {
  const W = a.W, D = a.D, H = a.H, n = v.doors, t = 24;
  a.box(a.X0, -D + 36, a.Z0, a.X1, 0, a.Z1);
  a.box(a.X0 - 0 + 2, -D + 30, a.Z1 - 30, a.X1 - 2, -D + 36, a.Z1);
  const dw = (W - 12) / n;
  for (let i = 0; i < n; i++) {
    const x0 = a.X0 + 6 + dw * i, x1 = x0 + dw;
    a.frame(x0 + 1, a.Z0 + 8, x1 - 1, a.Z1 - 8, -D + 12, -D + 36, t);
    a.box(x0 + t, -D + 22, a.Z0 + 8 + t, x1 - t, -D + 26, a.Z1 - 8 - t);
    const hx = n === 1 ? x0 + 8 : (i === 0 ? x0 + 8 : x1 - 8);
    for (const z of [a.Z0 + 80, a.Z1 - 80]) a.cyl(hx, -D + 14, z - 26, z + 26, 5, 10);
    const px = n === 1 ? x1 - 22 : (i === 0 ? x1 - 22 : x0 + 22);
    a.tube([[px, -D + 2, a.cz ?? a.Z0 + H / 2 - 56], [px, -D + 2, a.Z0 + H / 2 + 56]], [6, 6], 8); for (const z of [-40, 40]) a.ycyl(-D + 2, -D + 14, px, a.Z0 + H / 2 + z, 4.5, 8);
    a.arc(hx, -D + 24, dw - 8, 270, 360, 'EQUIP-SWING');
  }
  a.rect(a.X0, -D + 12, a.X1, 0); a.rect(a.X0, -D + 36, a.X1, 0, 'EQUIP-DETAIL');
  for (const f of [0.35, 0.65]) a.line(a.X0 + 8, -D + 36 - 0, a.X1 - 8, -D + 36 - 0, 'EQUIP-HIDDEN');
  a.log('Added the carcass with crown, ' + (n > 1 ? 'two' : 'one') + ' mirror door' + (n > 1 ? 's' : '') + ' in bevelled frames with hinge knuckles and edge pulls, and the swing in plan (plan and 3D).');
}
function showerSeat(a, v) {
  const W = a.W, D = a.D, zs = a.Z0 + 17 * IN, cx = a.cx, ns = 7, sw = (D - 60) / ns;
  a.box(a.X0 + 10, -20, zs - 60, a.X0 + 50, 0, zs + 150); a.box(a.X1 - 50, -20, zs - 60, a.X1 - 10, 0, zs + 150);
  a.box(a.X0 + 10, -20, zs + 100, a.X1 - 10, 0, zs + 150);
  for (const x of [a.X0 + 30, a.X1 - 30]) { a.cyl(x, -26, zs - 20, zs + 16, 9, 10); screwHead(a, x, zs + 130, -20, 3); }
  for (let i = 0; i < ns; i++) { const y0 = -30 - sw * i; a.box(a.X0 + 10, y0 - sw + 6, zs - 4, a.X1 - 10, y0, zs + 16); }
  a.box(a.X0 + 10, -D, zs - 20, a.X1 - 10, -D + 22, zs + 14); a.box(a.X0 + 10, -30, zs - 20, a.X1 - 10, -10, zs + 14);
  for (const x of [a.X0 + 40, a.X1 - 40]) { a.tube([[x, -30, zs - 4], [x, -D + 40, a.Z0 + 20]], [11, 11], 10); a.cyl(x, -D + 40, a.Z0, a.Z0 + 22, 15, 10); a.circ(x, -D + 40, 15, 'EQUIP-DETAIL'); }
  a.tube([[a.X0 + 40, -(30 + D - 40) / 2 - 8, zs - 220], [a.X1 - 40, -(30 + D - 40) / 2 - 8, zs - 220]], [8, 8], 8);
  a.rect(a.X0 + 10, -D, a.X1 - 10, 0); for (let i = 1; i < ns; i++) a.line(a.X0 + 10, -30 - sw * i, a.X1 - 10, -30 - sw * i, 'EQUIP-DETAIL');
  a.log('Added the wall frame with hinge pins, ' + ns + ' slats on the seat, two folding legs with feet and a cross brace (plan and 3D).');
}
function magMirror(a, v) {
  const R = v.glass * IN / 2, D = a.D, zc = a.Z0 + a.H / 2, xm = a.cx + a.W * 0.12, yb = -(D - 24), xp = a.X0 + 36;
  a.box(xp - 24, -8, zc - 50, xp + 24, 0, zc + 50); screwHead(a, xp, zc + 34, -8, 3); screwHead(a, xp, zc - 34, -8, 3);
  const E = [xp + (xm - xp) * 0.45, -D * 0.5];
  a.tube([[xp, -10, zc], [E[0], E[1], zc]], [8, 8], 8); a.cyl(E[0], E[1], zc - 12, zc + 12, 11, 12); a.tube([[E[0], E[1], zc], [xm, yb + 8, zc]], [7, 7], 8);
  a.cyl(xp, -10, zc - 10, zc + 10, 12, 12);
  revolveY(a, xm, zc, yb, [[R + 12, 0], [R + 12, 22], [R - 2, 22], [R - 2, 0]], 40);
  revolveY(a, xm, zc, yb, [[R + 12, 0], [0.01, 0]], 40); revolveY(a, xm, zc, yb, [[0.01, 19], [R - 2, 19]], 40);
  a.cyl(xm, yb + 4, zc - R - 8, zc - R + 6, 0.01, 3);
  a.rect(xp - 24, -8, xp + 24, 0); a.line(xp, -10, E[0], E[1], 'EQUIP-DETAIL'); a.line(E[0], E[1], xm, yb, 'EQUIP-DETAIL'); a.circ(E[0], E[1], 11, 'EQUIP-DETAIL');
  a.circ(xm, yb - 11, R + 12, 'EQUIP-HIDDEN'); a.rect(xm - R - 12, -D, xm + R + 12, yb);
  a.log('Added the wall plate with screws, a two-link arm with an elbow and the round framed mirror with its back panel (plan and 3D).');
}
function robeHook(a, v) {
  const n = v.n, zc = a.Z0 + a.H * 0.3, W = a.W;
  if (n === 1) { a.ycyl(-9, 0, a.cx, zc, 34, 20); a.ycyl(-13, -9, a.cx, zc, 26, 20); screwHead(a, a.cx, zc, -13, 3.5); }
  else { a.box(a.X0, -10, zc - 30, a.X1, 0, zc + 30); a.box(a.X0 + 6, -13, zc - 24, a.X1 - 6, -10, zc + 24); }
  const xs = n === 1 ? [a.cx] : [a.X0 + W * 0.28, a.X1 - W * 0.28];
  for (const x of xs) { sweep(a, arcPts([x, -12, zc], [x, -D4(a) * 0.9, zc], [x, -D4(a) * 0.9, zc + 34]).concat([[x, -D4(a) * 0.9 + 0.01, zc + 36]]), new Array(12).fill(6), 8); a.ell(x, -D4(a) * 0.9, zc + 46, 8.5, 8.5, 8.5, 8, 5); a.circ(x, -D4(a) * 0.9, 8, 'EQUIP-DETAIL'); a.line(x, -12, x, -D4(a) * 0.9, 'EQUIP-DETAIL'); }
  a.rect(a.cx - W / 2, -13, a.cx + W / 2, 0);
  a.log('Added the ' + (n === 1 ? 'round rosette' : 'bar plate') + ' with screws and ' + n + ' curved hook' + (n > 1 ? 's' : '') + ' ending in ball tips (plan and 3D).');
}
const D4 = (a) => a.D - 10;

// ------------------------------------------------------------------------------------------ hardware
function doorPull(a, v) {
  const cx = a.cx, H = a.H, yb = -(a.D - 16), zs = m.max(60, H * 0.13);
  a.tube([[cx, yb, a.Z0 + 10], [cx, yb, a.Z1 - 10]], [15, 15], 14); a.ell(cx, yb, a.Z0 + 12, 15, 15, 14, 10, 6); a.ell(cx, yb, a.Z1 - 12, 15, 15, 14, 10, 6);
  for (const z of [a.Z0 + zs, a.Z1 - zs]) { a.ycyl(yb, -4, cx, z, 9, 12); a.ycyl(-6, 0, cx, z, 24, 16); a.ycyl(-9, -6, cx, z, 18, 16); }
  a.rect(cx - 24, -6, cx + 24, 0); a.circ(cx, yb, 15, 'EQUIP-DETAIL'); a.line(cx, yb, cx, -6, 'EQUIP-DETAIL');
  a.log('Added the ' + v.h + ' in round bar with ball ends on two standoffs with base rosettes (plan and 3D).');
}
function cupPull(a, v) {
  const W = a.W, r = v.r, zc = a.Z0 + a.H * 0.56, yc = -(r + 5), cx = a.cx;
  a.box(a.X0, -3, a.Z0, a.X1, 0, a.Z1); a.box(a.X0 + 3, -4, a.Z0 + 3, a.X1 - 3, -3, a.Z1 - 3);
  for (const x of [a.X0 + 8, a.X1 - 8]) screwHead(a, x, a.Z1 - 8, -4, 2.4);
  const o = [], i = []; for (let k = 0; k <= 10; k++) { const t = PI + (k / 10) * PI; o.push([yc + r * m.cos(t), zc + r * m.sin(t)]); i.push([yc + (r - 3) * m.cos(t), zc + (r - 3) * m.sin(t)]); }
  for (let k = 0; k < 10; k++) prismX(a, [o[k], o[k + 1], i[k + 1], i[k]], a.X0 + 6, a.X1 - 6);
  prismX(a, [o[0], [o[0][0] + 0.01, zc + 6], [i[0][0], zc + 6], i[0]], a.X0 + 6, a.X1 - 6);
  prismX(a, [[-4, zc], [-4, zc - r * 0.6], [-6, zc - r * 0.6], [-6, zc]], a.X0 + 6, a.X1 - 6);
  a.rect(a.X0, -4, a.X1, 0); a.rect(a.X0 + 6, -(2 * r + 5), a.X1 - 6, -4, 'EQUIP-DETAIL'); a.line(a.X0 + 6, yc, a.X1 - 6, yc, 'EQUIP-DETAIL');
  a.log('Added the screwed backplate and the half-round cup for the fingers, with its raised lip (plan and 3D).');
}
function gateLatch(a, v) {
  const L = a.W, zc = a.Z0 + a.H / 2, bl = L * 0.62;
  a.box(a.X0, -3, zc - 14, a.X0 + L * 0.7, 0, zc + 14); for (const x of [a.X0 + 12, a.X0 + L * 0.35, a.X0 + L * 0.7 - 12]) screwHead(a, x, zc, -3, 3);
  a.box(a.X0 + 8, -9, zc - 9, a.X0 + bl, -3, zc + 9);
  for (const x of [a.X0 + 16, a.X0 + bl - 10]) a.box(x - 8, -11, zc - 14, x + 8, -3, zc + 14);
  a.box(a.X0 + bl - 6, -9, zc - 6, a.X1 - L * 0.12, -4.5, zc + 6);
  prismY(a, [[a.X0 + 8, zc - 8], [a.X0 + 36, zc + 24], [a.X0 + 50, zc + 24], [a.X0 + 28, zc - 8]], -17, -9);
  sweep(a, arcPts([a.X0 + 12, -9, zc - 6], [a.X0 + 4, -a.D + 10, zc - 4], [a.X0 + 34, -a.D + 6, zc - 2]).map((p) => [p[0], p[1], m.min(p[2], a.Z1 - 4)]), new Array(11).fill(4.5), 8);
  const kx = a.X1 - L * 0.1; a.box(kx - 14, -3, a.Z0, kx + 14, 0, a.Z1); a.box(kx - 10, -3, zc - 12, kx + 10, -20 + 0, zc + 12);
  a.rect(a.X0, -3, a.X0 + L * 0.7, 0); a.rect(a.X0 + 8, -9, a.X0 + bl, -3, 'EQUIP-DETAIL'); a.rect(kx - 14, -20, kx + 14, 0);
  a.log('Added the slotted backplate, sliding latch bar in two staples, the thumb lever and pull ring, and the keeper (plan and 3D).');
}
function hookEye(a, v) {
  const L = a.W, zc = a.Z0 + a.H / 2, px = a.X0 + L * 0.27, ex = a.X1 - L * 0.17, y = -9;
  a.box(a.X0, -2.5, a.Z0, a.X0 + L * 0.38, 0, a.Z1); a.box(a.X1 - L * 0.28, -2.5, a.Z0, a.X1, 0, a.Z1);
  a.ycyl(y, -2.5, px, zc, 3.4, 10); a.cyl(px, y, zc - 5, zc + 5, 5.5, 10);
  a.tube([[px, y, zc], [a.X1 - L * 0.07, y, zc], [a.X1 - L * 0.04, y, zc - 9]], [2.6, 2.6, 2.6], 8);
  ringYZ(a, ex, y, zc, 7, 1.8, 14, 5); a.box(ex - 2, y - 2, a.Z0 + 2, ex + 2, -2.5, zc - 4);
  for (const x of [a.X0 + 8, a.X0 + L * 0.3, a.X1 - 8, a.X1 - L * 0.2]) for (const z of [a.Z0 + 5, a.Z1 - 5]) screwHead(a, x, z, -2.5, 2);
  a.rect(a.X0, -2.5, a.X0 + L * 0.38, 0); a.rect(a.X1 - L * 0.28, -2.5, a.X1, 0); a.line(px, y, a.X1 - L * 0.04, y, 'EQUIP-DETAIL'); a.circ(ex, y, 7, 'EQUIP-DETAIL');
  a.log('Added the hook plate with its pivot pin, the swinging hook rod with a bent tip, the eye plate with a ring and the screws (plan and 3D).');
}
function strapHinge(a, v) {
  const L = a.W, zc = a.Z0 + a.H / 2, r = 11, hh = a.H * 0.62, ty = -r - 1;
  a.cyl(a.X0 + r, ty, zc - hh / 2, zc + hh / 2, r, 16); a.cyl(a.X0 + r, ty, zc - hh / 2 - 4, zc + hh / 2 + 4, r * 0.5, 10);
  prismY(a, [[a.X0 + r, zc - hh / 2 + 2], [a.X1 - 18, zc - 9], [a.X1, zc], [a.X1 - 18, zc + 9], [a.X0 + r, zc + hh / 2 - 2]], -7, -1);
  const n = m.max(4, m.round(L / 90));
  for (let i = 0; i < n; i++) { const x = a.X0 + r * 2.4 + ((L - r * 5) * i) / (n - 1), hz = (zc - hh / 2 + 2 + (hh - 4) * 0) * 0; const zz = zc; a.ell(x, -7, zz, 4.5, 3, 4.5, 8, 5); }
  a.box(a.X0 + 2, -4, zc - hh / 2 - 6, a.X0 + 8, -1, zc + hh / 2 + 6);
  a.rect(a.X0, -2 * r - 1, a.X1, 0); a.circ(a.X0 + r, ty, r); a.rect(a.X0 + r, -7, a.X1, -1, 'EQUIP-DETAIL');
  a.log('Added the rolled eye with its pin, the tapered strap with a pointed end and ' + n + ' round bolt heads (plan and 3D).');
}
function pianoHinge(a, v) {
  const L = a.W, kr = 4.5, lw = 26, zb = a.Z0 + lw, y = -kr, th = 1.4;
  const n = m.round(L / 25.4); for (let i = 0; i < n; i++) a.xcyl(a.X0 + (L * i) / n + 0.3, a.X0 + (L * (i + 1)) / n - 0.3, y, zb, kr, 12);
  a.box(a.X0, -th, a.Z0, a.X1, 0, zb - 1); a.box(a.X0, -lw, zb - kr * 0.3, a.X1, y - kr * 0.3, zb + th - kr * 0.3);
  const ns = m.floor(L / 76); for (let i = 0; i < ns; i++) { const x = a.X0 + (L * (i + 0.5)) / ns; screwHead(a, x, a.Z0 + 10, -th, 2.4); a.ell(x, -lw + 9, zb + th * 0.4, 2.6, 2.6, 1.4, 8, 4); }
  a.rect(a.X0, -th, a.X1, 0); a.rect(a.X0, -lw, a.X1, y - kr * 0.3, 'EQUIP'); a.circ(a.X0, y, kr, 'EQUIP-DETAIL');
  a.log('Added ' + n + ' knuckles on a continuous pin, one leaf on the wall, the other swung open to 90 degrees, and ' + ns + ' screws per leaf (plan and 3D).');
}
function cupHinge(a, v) {
  const cr = 17.5, cx = a.X0 + cr + 4, zc = a.Z0 + a.H / 2, bend = v.bend ?? 0;
  a.ycyl(-8, 0, cx, zc, cr, 28); a.ycyl(-9, -8, cx, zc, cr - 2, 28); a.box(cx - cr - 3, -3, zc - 24, cx + cr + 3, 0, zc + 24); a.box(cx - cr - 1, -9 - 0, zc - 22, cx + cr + 1, -8, zc + 22);
  for (const z of [-17, 17]) { a.ycyl(-9, -8, cx + cr + 1, zc + z, 3, 8); a.cyl(cx + cr + 1, -9, zc + z - 3, zc + z + 3, 1, 4); }
  const ax = a.X1 - 22 - 18;
  a.box(cx + cr - 4, -9 - bend, zc - 8, ax, -5 - bend, zc + 8); a.cyl(cx + cr + 6, -7 - bend, zc - 8, zc + 8, 4, 8);
  if (bend) a.box(cx + cr + 2, -9 - bend, zc - 8, cx + cr + 8, -4, zc + 8);
  a.box(a.X1 - 40, -9, zc - 24, a.X1, -3, zc + 24); a.box(ax - 4, -9 - bend, zc - 8, a.X1 - 40, -7 - bend, zc + 8);
  for (const z of [-14, 14]) { screwHead(a, a.X1 - 14, zc + z, -9, 3); }
  a.circ(cx, -4, cr); a.rect(a.X0, -9 - bend, a.X1, 0, 'EQUIP-DETAIL');
  a.log('Added the 35 mm cup with its flange and screws, the ' + (bend ? 'cranked' : 'straight') + ' linkage arm and the wall mounting plate with screws (plan and 3D).');
}
function drawerSlide(a, v) {
  const L = a.W, z0 = a.Z0, z1 = a.Z1, zc = (z0 + z1) / 2;
  const oEnd = a.X0 + L * 0.6, mX0 = a.X0 + L * 0.2, mX1 = a.X0 + L * 0.8, iX0 = a.X0 + L * 0.4;
  a.box(a.X0, -2, z0, oEnd, 0, z1); a.box(a.X0, -9, z0, oEnd, -2, z0 + 3); a.box(a.X0, -9, z1 - 3, oEnd, -2, z1);
  a.box(mX0, -8.5, z0 + 3.5, mX1, -6.5, z1 - 3.5); a.box(mX0, -8.5, z0 + 3.5, mX1, -4, z0 + 6.5); a.box(mX0, -8.5, z1 - 6.5, mX1, -4, z1 - 3.5);
  a.box(iX0, -15, z0 + 7, a.X1, -13, z1 - 7); a.box(iX0, -15, z0 + 7, a.X1, -9.5, z0 + 10); a.box(iX0, -15, z1 - 10, a.X1, -9.5, z1 - 7);
  const nb = m.round(L / 90); for (let i = 0; i < nb; i++) { const x = mX0 + 20 + ((mX1 - mX0 - 40) * i) / (nb - 1); a.ell(x, -4.5, z0 + 5, 2.8, 2.8, 2.8, 8, 4); a.ell(x, -4.5, z1 - 5, 2.8, 2.8, 2.8, 8, 4); }
  for (let i = 0; i < 4; i++) screwHead(a, a.X0 + 30 + ((oEnd - a.X0 - 60) * i) / 3, zc, -2, 2.4);
  for (let i = 0; i < 3; i++) screwHead(a, iX0 + 30 + ((a.X1 - iX0 - 60) * i) / 2, zc, -15, 2.8);
  prismY(a, [[iX0 + 8, zc - 8], [iX0 + 38, zc - 8], [iX0 + 44, zc + 12], [iX0 + 12, zc + 12]], -19, -15);
  a.rect(a.X0, -9, oEnd, 0); a.rect(mX0, -8.5, mX1, -4, 'EQUIP-DETAIL'); a.rect(iX0, -15, a.X1, -9.5, 'EQUIP-DETAIL');
  a.log('Added the outer, middle and inner steel members partly extended, ball rows between them, the screws and the release lever (plan and 3D).');
}
function padlock(a, v) {
  const W = a.W, D = a.D, cx = a.cx, bh = a.H * 0.58, zb = a.Z0 + bh, tr = v.tr, sr = W * 0.3, leg = a.H - bh - sr - tr - 2;
  prismY(a, rrect(cx, a.Z0 + bh / 2, W, bh, W * 0.1, 4), -D + 1.4, 0); prismY(a, rrect(cx, a.Z0 + bh / 2, W - 5, bh - 5, W * 0.09, 4), -D, -D + 1.4);
  prismY(a, rrect(cx, a.Z0 + bh * 0.8, W * 0.8, 2, 0.4, 1).map(([x, z]) => [x, z]), -D - 0, -D + 1.6);
  a.ycyl(-D - 0.0, -D + 1.8, cx, a.Z0 + bh * 0.36, W * 0.13, 20); a.box(cx - 1.4, -D + 0.5, a.Z0 + bh * 0.36 - W * 0.07, cx + 1.4, -D + 2, a.Z0 + bh * 0.36 + W * 0.04);
  for (const x of [-1, 1]) for (const z of [0.88, 0.18]) screwHead(a, cx + x * W * 0.38, a.Z0 + bh * z, -D, 1.8);
  const pts = []; pts.push([cx - sr, -D / 2, zb - 8], [cx - sr, -D / 2, zb + leg]);
  for (let i = 1; i < 12; i++) { const t = PI - (i / 12) * PI; pts.push([cx + sr * m.cos(t), -D / 2, zb + leg + sr * m.sin(t)]); }
  pts.push([cx + sr, -D / 2, zb + leg], [cx + sr, -D / 2, zb - 8]);
  sweep(a, pts, pts.map(() => tr), 8);
  a.rect(cx - W / 2, -D, cx + W / 2, 0); a.circ(cx - sr, -D / 2, tr, 'EQUIP-DETAIL'); a.circ(cx + sr, -D / 2, tr, 'EQUIP-DETAIL');
  a.log('Added the laminated body with face plate and screws, the key plug with keyway and the shackle arching out of two holes (plan and 3D).');
}
function barnTrack(a, v) {
  const L = a.W, zr = a.Z1 - 40, y = -50, n = v.sup;
  a.xcyl(a.X0 + 4, a.X1 - 4, y, zr, 9, 12);
  for (let i = 0; i < n; i++) { const x = a.X0 + 40 + ((L - 80) * i) / (n - 1); a.ycyl(y, -6, x, zr, 10, 10); a.ycyl(-6, 0, x, zr, 30, 16); a.ycyl(y - 8, y, x, zr, 17, 14); screwHead(a, x, zr + 14, -6, 2.4); a.circ(x, -3, 30, 'EQUIP-DETAIL'); }
  for (const f of [0.28, 0.66]) {
    const x = a.X0 + L * f; for (const dx of [-26, 26]) { a.ycyl(y - 18, y - 8, x + dx, zr + 0, 24, 20); a.ycyl(y - 20, y - 18, x + dx, zr, 5, 8); }
    prismY(a, [[x - 38, zr + 22], [x + 38, zr + 22], [x + 62, zr - 40], [x + 62, zr - 176], [x - 62, zr - 176], [x - 62, zr - 40]], y - 31, y - 20);
    for (const z of [zr - 150, zr - 90]) for (const dx of [-38, 38]) screwHead(a, x + dx, z, y - 31, 3.4);
    a.rect(x - 62, y - 31, x + 62, y - 20, 'EQUIP-DETAIL');
  }
  for (const x of [a.X0 + 4, a.X1 - 4]) a.box(x - 6, y - 24, zr - 40, x + 6, y + 14, zr + 40);
  a.rect(a.X0, y - 24, a.X1, 0); a.line(a.X0, y, a.X1, y, 'EQUIP-DETAIL');
  a.log('Added the round rail on ' + n + ' wall standoffs with rosettes, two hangers each with twin wheels and a bolted strap, and the end stops (plan and 3D).');
}
function coatHook(a, v) {
  const n = v.n, zc = a.Z0 + a.H * 0.36, W = a.W, D = a.D;
  if (n === 1) { a.ycyl(-8, 0, a.cx, zc, 28, 18); screwHead(a, a.cx, zc, -8, 3); } else { prismY(a, rrect(a.cx, zc, W, 62, 18, 5), -9, 0); for (const x of [a.X0 + 14, a.X1 - 14]) screwHead(a, x, zc, -9, 3); }
  const xs = n === 1 ? [a.cx] : Array.from({ length: n }, (_, i) => a.X0 + (W * (i + 0.5)) / n);
  for (const x of xs) { sweep(a, arcPts([x, -8, zc], [x, -D + 24, zc - 6], [x, -D + 24, zc + 44]).concat([[x, -D + 24.01, zc + 46]]), new Array(12).fill(6.5), 8); a.ell(x, -D + 24, zc + 54, 9.5, 9.5, 9.5, 10, 6); a.line(x, -8, x, -D + 24, 'EQUIP-DETAIL'); a.circ(x, -D + 24, 9, 'EQUIP-DETAIL'); }
  a.rect(a.X0, -9, a.X1, 0);
  a.log('Added the screwed ' + (n === 1 ? 'rosette' : 'rail') + ' and ' + n + ' curved prong' + (n > 1 ? 's' : '') + ' with ball tips (plan and 3D).');
}
function doorStop(a, v) {
  const cx = a.cx, cy = a.cy, h = v.h * IN, z0 = a.Z0;
  a.cyl(cx, cy, z0, z0 + 6, a.W * 0.42, 24); a.cone(cx, cy, z0 + 6, z0 + 14, a.W * 0.42, a.W * 0.26, 24);
  if (v.spring) {
    a.cyl(cx, cy, z0 + 14, z0 + 30, 11, 14);
    for (let k = 0; k < 8; k++) loop(a, cx, cy, 10.5, z0 + 30 + k * ((h - 60) / 8), 1.8, 14, 4);
    a.tube([[cx, cy, z0 + 30], [cx, cy, a.Z1 - 20]], [3.5, 3.5], 8); a.ell(cx, cy, a.Z1 - 16, 16, 16, 14, 16, 8); a.cyl(cx, cy, a.Z1 - 30, a.Z1 - 14, 18, 16);
  } else { a.cyl(cx, cy, z0 + 14, z0 + 26, 14, 14); a.ell(cx, cy, z0 + 26, 20, 20, a.Z1 - z0 - 26, 18, 8); }
  for (let k = 0; k < 4; k++) { const t = (k / 4) * 2 * PI + 0.4; a.cyl(cx + a.W * 0.32 * m.cos(t), cy + a.W * 0.32 * m.sin(t), z0 + 6, z0 + 8, 2.6, 8); }
  a.circ(cx, cy, a.W * 0.42); a.circ(cx, cy, a.W * 0.26, 'EQUIP-DETAIL'); a.circ(cx, cy, 14, 'EQUIP-DETAIL');
  a.log('Added the round floor base with screws and ' + (v.spring ? 'a sprung post with a coil and a rubber bumper' : 'a low rubber dome') + ' (plan and 3D).');
}
function letterPlate(a, v) {
  const W = a.W, H = a.H, b = 20, zs = a.Z0 + (v.card ? H * 0.35 : H * 0.5), sh = 22;
  a.box(a.X0, -3, a.Z0, a.X1, 0, a.Z1);
  const ax0 = a.X0 + b + 6, ax1 = a.X1 - b - 6, az0 = zs - sh, az1 = zs + sh;
  a.box(a.X0 + 3, -9, a.Z0 + 3, ax0, -3, a.Z1 - 3); a.box(ax1, -9, a.Z0 + 3, a.X1 - 3, -3, a.Z1 - 3);
  a.box(ax0, -9, a.Z0 + 3, ax1, -3, az0 - 6); a.box(ax0, -9, az1 + 6, ax1, -3, v.card ? a.Z0 + H * 0.66 : a.Z1 - 3);
  a.box(ax0, -14, az1 - 4, ax1, -5, az1 + 12); a.box(ax0 + 6, -16, az0 + 6, ax1 - 6, -12, az1 - 4);
  a.xcyl(ax0 + 4, ax1 - 4, -14, az1 + 6, 4, 10);
  if (v.card) { a.box(ax0, -9, a.Z0 + H * 0.66, ax1, -3, a.Z1 - 3); a.frame(ax0 + 12, a.Z0 + H * 0.7, ax1 - 12, a.Z1 - 10, -10, -5, 5); a.box(ax0 + 17, -8, a.Z0 + H * 0.7 + 5, ax1 - 17, -7, a.Z1 - 15); }
  for (const x of [a.X0 + 10, a.X1 - 10]) for (const z of [a.Z0 + 8, a.Z1 - 8]) screwHead(a, x, z, -3, 2.6);
  a.rect(a.X0, -3, a.X1, 0); a.rect(ax0, -16, ax1, -3, 'EQUIP-DETAIL');
  a.log('Added the backplate with screws, a framed slot, the spring flap on a hinge rod with its lifting lip' + (v.card ? ' and the card window above' : '') + ' (plan and 3D).');
}
function doorChain(a, v) {
  const L = a.W, zc = a.Z0 + a.H / 2, y = -9;
  a.box(a.X0, -2.5, a.Z0, a.X0 + 40, 0, a.Z1); a.box(a.X0 + 4, -5, zc - 5, a.X0 + 36, -2.5, zc + 5); a.box(a.X1 - 26, -2.5, a.Z0 + 4, a.X1, 0, a.Z1 - 4);
  a.cyl(a.X1 - 12, -9, zc - 8, zc + 8, 7, 10); a.box(a.X0 + 8, -11, zc - 11, a.X0 + 22, -5, zc + 11); a.cyl(a.X0 + 15, -11, zc - 5, zc + 5, 4, 8);
  const n = v.links, x0 = a.X0 + 22, x1 = a.X1 - 18, pitch = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const x = x0 + pitch * (i + 0.5), pts = []; for (let k = 0; k <= 12; k++) { const t = (k / 12) * 2 * PI; pts.push(i % 2 ? [x + (pitch * 0.62) * m.cos(t), y + 3.6 * m.sin(t), zc] : [x + (pitch * 0.62) * m.cos(t), y, zc + 3.6 * m.sin(t)]); }
    a.tube(pts, pts.map(() => 1.3), 4);
  }
  for (const x of [a.X0 + 10, a.X0 + 30]) for (const z of [a.Z0 + 6, a.Z1 - 6]) screwHead(a, x, z, -2.5, 1.8);
  for (const z of [a.Z0 + 6, a.Z1 - 6]) screwHead(a, a.X1 - 12, z, -2.5, 1.8);
  a.rect(a.X0, -5, a.X0 + 40, 0); a.rect(a.X1 - 26, -2.5, a.X1, 0); a.line(x0, y, x1, y, 'EQUIP-DETAIL');
  a.log('Added the slotted track plate with a sliding knob, ' + n + ' alternating chain links and the knob plate with its stud on the door (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ fittings
function slotDiffuser(a, v) {
  const n = v.slots, W = a.W, D = a.D, z0 = a.Z0, z1 = a.Z1, sw = 20, pitch = (D - 2 * 30) / n, ys = [];
  for (let i = 0; i < n; i++) ys.push(-30 - pitch * (i + 0.5));
  const edges = [a.YF]; for (const y of ys) edges.push(y - sw / 2, y + sw / 2); edges.push(a.YB);
  for (let i = 0; i < edges.length; i += 2) a.box(a.X0, edges[i], z1 - 6, a.X1, edges[i + 1], z1);
  for (const y of ys) {
    a.box(a.X0 + 2, y - sw / 2 - 2, z0 + 24, a.X0 + 4, y + sw / 2 + 2, z1 - 6); a.box(a.X1 - 4, y - sw / 2 - 2, z0 + 24, a.X1 - 2, y + sw / 2 + 2, z1 - 6);
    a.box(a.X0, y - sw / 2 - 2, z0 + 24, a.X1, y - sw / 2, z1 - 6); a.box(a.X0, y + sw / 2, z0 + 24, a.X1, y + sw / 2 + 2, z1 - 6);
    for (let k = 0; k < 3; k++) { const x = a.X0 + (W * (k + 1)) / 4; prismY(a, [[x - 14, z1 - 18], [x + 14, z1 - 28], [x + 14, z1 - 26], [x - 14, z1 - 16]], y - sw / 2 + 2, y + sw / 2 - 2); }
    a.box(a.X0 + 4, y - sw / 2 - 2, z0, a.X1 - 4, y + sw / 2 + 2, z0 + 24);
    a.rect(a.X0, y - sw / 2, a.X1, y + sw / 2, 'EQUIP-DETAIL');
  }
  a.cyl(a.cx, ys[0], z0 + 4, z0 + 12, 4, 6);
  for (const x of [a.X0 + 10, a.X1 - 10]) for (const y of [a.YF + 10, a.YB - 10]) a.cyl(x, y, z1 - 7, z1, 3.4, 8);
  a.outline();
  a.log('Added the flange plate with ' + n + ' slot opening' + (n > 1 ? 's' : '') + ', the plenum sleeves below, angled deflector blades and the corner screws (plan and 3D).');
}
function floorRegister(a, v) {
  const W = a.W, D = a.D, z0 = a.Z0, z1 = a.Z1, b = 14, fl = 8, zf = z1 - 12;
  a.box(a.X0 - 0, a.YF, zf, a.X1, a.YF + b, z1); a.box(a.X0, a.YB - b, zf, a.X1, a.YB, z1); a.box(a.X0, a.YF, zf, a.X0 + b, a.YB, z1); a.box(a.X1 - b, a.YF, zf, a.X1, a.YB, z1);
  const nb = m.floor((W - 2 * b) / 12);
  for (let i = 0; i <= nb; i++) { const x = a.X0 + b + ((W - 2 * b - 6) * i) / nb; a.box(x, a.YF + b, zf - 6, x + 6, a.YB - b, z1 - 2); }
  const bx1 = a.X1 - b - 4 - 36; a.box(a.X0 + b + 4, a.YF + b + 4, z0, bx1, a.YB - b - 4, zf - 6); const cr = (a.D - 2 * b - 8) * 0.4, zm = z0 + (zf - 6 - z0) * 0.5; a.xcyl(bx1, a.X1 - b, a.cy, zm, cr, 18); a.xcyl(a.X1 - b - 8, a.X1 - b, a.cy, zm, cr + 5, 18);
  a.box(a.X0 + b, a.YF + b, zf - 10, a.X1 - b, a.YB - b, zf - 6);
  a.ycyl(a.YF + 1, a.YF + 9, a.X1 - 40, z1 - 6, 5, 8); a.box(a.X1 - 44, a.YF + 9, z1 - 9, a.X1 - 32, a.YF + 20, z1 - 3);
  a.cyl(a.cx, a.cy, z0 - 0.0, z0 + 0.01, 1, 3);
  a.outline(); a.rect(a.X0 + b, a.YF + b, a.X1 - b, a.YB - b, 'EQUIP-DETAIL'); a.rect(a.X0 + b + 4, a.YF + b + 4, a.X1 - b - 4, a.YB - b - 4, 'EQUIP-HIDDEN');
  for (let i = 1; i < nb; i++) a.line(a.X0 + b + ((W - 2 * b - 6) * i) / nb + 3, a.YF + b, a.X0 + b + ((W - 2 * b - 6) * i) / nb + 3, a.YB - b, 'EQUIP-DETAIL');
  a.log('Added the flanged frame, ' + (nb + 1) + ' walkable bars, a damper lever and the duct boot box below the floor line (plan and 3D).');
}
function gfci(a, v) {
  const n = v.gang, gw = a.W / n, ph = a.H;
  a.box(a.X0, -3, a.Z0, a.X1, 0, a.Z1); a.box(a.X0 + 1.5, -3.6, a.Z0 + 1.5, a.X1 - 1.5, -3, a.Z1 - 1.5);
  for (let g = 0; g < n; g++) {
    const gx = a.X0 + gw * (g + 0.5), gfci = g === 0, w = gw * 0.34;
    a.box(gx - w, -a.D + 1, a.Z0 + ph * 0.07, gx + w, -3.6, a.Z0 + ph * 0.93);
    for (const q of gfci ? [0.3, 0.72] : [0.28, 0.72]) { const zq = a.Z0 + ph * q; a.box(gx - 5.8, -a.D, zq - 1.2, gx - 4.2, -a.D + 1, zq + 5.2); a.box(gx + 4.2, -a.D, zq - 1.2, gx + 5.8, -a.D + 1, zq + 5.2); revolveY(a, gx, zq - 6, -a.D + 1, [[2.2, 0], [2.2, 0.4]], 10); }
    if (gfci) { a.box(gx - 6, -a.D - 0 + 0, a.Z0 + ph * 0.5 - 2, gx - 1, -a.D + 1.4, a.Z0 + ph * 0.5 + 6); a.box(gx + 1, -a.D, a.Z0 + ph * 0.5 - 2, gx + 6, -a.D + 1.4, a.Z0 + ph * 0.5 + 6); }
    else screwHead(a, gx, a.Z0 + ph * 0.5, -a.D + 1, 2.4);
    a.rect(gx - w, -a.D + 1, gx + w, -3.6, 'EQUIP-DETAIL');
  }
  for (const z of [a.Z0 + 4, a.Z1 - 4]) screwHead(a, a.cx, z, -3.6, 2.6);
  a.rect(a.X0, -3.6, a.X1, 0);
  a.log('Added the plate, ' + (n > 1 ? 'a GFCI receptacle with test and reset buttons beside a plain duplex' : 'a GFCI receptacle with its test and reset buttons') + ', blade slots and the fixing screws (plan and 3D).');
}
function dataPlate(a, v) {
  const n = v.ports, cols = n > 2 ? 2 : n, rows = m.ceil(n / cols);
  a.box(a.X0, -3, a.Z0, a.X1, 0, a.Z1); a.box(a.X0 + 1.5, -4, a.Z0 + 1.5, a.X1 - 1.5, -3, a.Z1 - 1.5);
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = m.floor(i / cols), x = a.X0 + (a.W * (c + 0.5)) / cols, z = a.Z0 + (a.H * (rows - r - 0.5)) / rows, kind = v.kinds[i % v.kinds.length];
    if (kind === 'rj') { a.box(x - 7.5, -9, z - 6.5, x + 7.5, -4, z + 6.5); a.box(x - 5.4, -9.2, z - 4.4, x + 5.4, -8, z + 4.4); a.box(x - 3.6, -10, z + 4.4, x + 3.6, -8.8, z + 5.6); a.rect(x - 7.5, -9, x + 7.5, -4, 'EQUIP-DETAIL'); }
    else if (kind === 'f') { revolveY(a, x, z, -4, [[8.5, 0], [8.5, 5], [6, 6]], 18); revolveY(a, x, z, -4, [[5.5, 4], [5.5, 9]], 14); a.ycyl(-13.2, -9, x, z, 1.8, 8); a.circ(x, -6, 8, 'EQUIP-DETAIL'); }
    else { a.box(x - 8, -8, z - 3.2, x + 8, -4, z + 3.2); a.box(x - 5.5, -8.4, z - 1.6, x + 5.5, -7.4, z + 1.6); a.rect(x - 8, -8, x + 8, -4, 'EQUIP-DETAIL'); }
  }
  for (const z of [a.Z0 + 5, a.Z1 - 5]) screwHead(a, a.cx, z, -4, 2.4);
  a.rect(a.X0, -4, a.X1, 0);
  a.log('Added the plate with ' + n + ' ports (' + [...new Set(v.kinds)].map((k) => k === 'rj' ? 'network jacks' : k === 'f' ? 'coax connectors' : 'media sockets').join(', ') + ') in their surrounds and two screws (plan and 3D).');
}
function dimmer(a, v) {
  const z0 = a.Z0, z1 = a.Z1, cx = a.cx, zc = (z0 + z1) / 2;
  a.box(a.X0, -3, z0, a.X1, 0, z1); a.box(a.X0 + 1.5, -4, z0 + 1.5, a.X1 - 1.5, -3, z1 - 1.5);
  if (v.dial) { revolveY(a, cx, zc + 8, -4, [[24, 0], [24, 10], [20, 16], [18, 18]], 28); revolveY(a, cx, zc + 8, -4, [[18, 18], [0.01, 19]], 28); a.box(cx - 1.5, -23, zc + 8 + 6, cx + 1.5, -19, zc + 8 + 17); a.rect(cx - 24, -22, cx + 24, -4, 'EQUIP-DETAIL'); a.circ(cx, -12, 24, 'EQUIP-DETAIL'); a.box(cx - 9, -6, z0 + 14, cx + 9, -4, z0 + 28); }
  else { a.box(cx - 5, -4.6, z0 + 18, cx + 5, -3.4, z1 - 34); a.box(cx - 8, -9, zc - 6 + 8, cx + 8, -4.6, zc + 6 + 8); a.box(cx - 15, -6, z0 + 8, cx + 15, -4, z0 + 15); prismX(a, [[-4, z0 + 6], [-4, z0 + 16], [-9, z0 + 15], [-9, z0 + 8]], cx - 4, cx + 4); a.rect(cx - 8, -9, cx + 8, -4, 'EQUIP-DETAIL'); }
  for (const z of [z0 + 5, z1 - 5]) screwHead(a, cx, z, -4, 2.6);
  a.rect(a.X0, -4, a.X1, 0);
  a.log('Added the plate and ' + (v.dial ? 'a round rotary knob with an index mark and a separate rocker below it' : 'a slide with its knob on a track and a bypass rocker') + ' (plan and 3D).');
}
function floorBox(a, v) {
  const z0 = a.Z0, z1 = a.Z1, cx = a.cx, cy = a.cy;
  if (v.round) {
    const R = a.W / 2 - 2; a.cyl(cx, cy, z0, z1 - 8, R * 0.82, 32); a.cyl(cx, cy, z1 - 8, z1 - 3, R, 32);
    revolve(a, cx, cy, [[R * 0.62, z1 - 3], [R * 0.62, z1 - 1], [R * 0.5, z1], [R * 0.5, z1 - 3]], 28);
    a.box(cx - R * 0.46, cy - R * 0.2, z1 - 4, cx + R * 0.46, cy + R * 0.2, z1 - 0.5); for (const s of [-1, 1]) a.cyl(cx + s * R * 0.7, cy, z1 - 3, z1, 3.4, 8);
    a.circ(cx, cy, R); a.circ(cx, cy, R * 0.62, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.82, 'EQUIP-HIDDEN');
  } else {
    const g = v.gang, bw = a.W - 20, bd = a.D - 20; a.box(a.X0 + 10, a.YF + 10, z0, a.X1 - 10, a.YB - 10, z1 - 8); a.box(a.X0, a.YF, z1 - 8, a.X1, a.YB, z1 - 3);
    for (let i = 0; i < g; i++) { const x = a.X0 + (a.W * (i + 0.5)) / g; a.box(x - a.W / g * 0.36, a.cy - bd * 0.28, z1 - 4, x + a.W / g * 0.36, a.cy + bd * 0.28, z1); a.rect(x - a.W / g * 0.36, a.cy - bd * 0.28, x + a.W / g * 0.36, a.cy + bd * 0.28, 'EQUIP-DETAIL'); }
    for (const x of [a.X0 + 8, a.X1 - 8]) for (const y of [a.YF + 8, a.YB - 8]) a.cyl(x, y, z1 - 3, z1, 3.2, 8);
    a.outline();
  }
  a.log('Added the sunk can, the cover flange with screws and ' + (v.round ? 'a round lid with a cable notch' : v.gang + ' hinged outlet lids') + ' (plan and 3D).');
}
function smokeDet(a, v) {
  const R = a.W / 2, cx = a.cx, cy = a.cy, z0 = a.Z0, z1 = a.Z1;
  a.cyl(cx, cy, z1 - 6, z1, R * 0.92, 36);
  revolve(a, cx, cy, [[R, z1 - 5], [R, z0 + 18], [R * 0.9, z0 + 8], [R * 0.6, z0 + 3], [R * 0.3, z0], [0.01, z0 - 0.0]], 36);
  for (let k = 0; k < 3; k++) loop(a, cx, cy, R * (0.55 + k * 0.14), z0 + 3 - k * 0 + (k === 2 ? 4 : 0) - 0, 1.8, 36, 4);
  for (let k = 0; k < 8; k++) { const t = (k / 8) * 2 * PI; a.box(cx + R * 0.74 * m.cos(t) - 2, cy + R * 0.74 * m.sin(t) - 2, z0 + 8, cx + R * 0.74 * m.cos(t) + 2, cy + R * 0.74 * m.sin(t) + 2, z0 + 14); }
  a.cyl(cx, cy, z0 - 0.0, z0 + 4, R * 0.2, 16); a.cyl(cx + R * 0.55, cy, z0 + 3, z0 + 6, 3.6, 8);
  a.circ(cx, cy, R); for (const f of [0.74, 0.56, 0.2]) a.circ(cx, cy, R * f, 'EQUIP-DETAIL');
  a.log('Added the mounting plate, the domed cover with vent rings and slots, the test button and the status light (plan and 3D).');
}
function sprinkler(a, v) {
  const cx = a.cx, cy = a.cy, z0 = a.Z0, z1 = a.Z1, kind = v.kind;
  if (kind === 'pendant') {
    a.cyl(cx, cy, z1 - 4, z1, 36, 24); a.cyl(cx, cy, z1 - 12, z1 - 4, 28, 24); a.cyl(cx, cy, z1 - 52, z1 - 12, 11, 12); a.cyl(cx, cy, z1 - 62, z1 - 52, 14, 6);
    for (const s of [-1, 1]) a.tube([[cx + s * 9, cy, z1 - 52], [cx + s * 24, cy, z0 + 14], [cx + s * 4, cy, z0 + 6]], [4, 3.5, 3.5], 6);
    a.cyl(cx, cy, z0 + 4, z0 + 7, 21, 20); a.cyl(cx, cy, z0 + 8, z1 - 70, 3.2, 8); a.ell(cx, cy, z1 - 72, 4.5, 4.5, 8, 10, 5);
    a.circ(cx, cy, 36); a.circ(cx, cy, 21, 'EQUIP-DETAIL'); a.circ(cx, cy, 11, 'EQUIP-DETAIL');
  } else if (kind === 'upright') {
    a.cyl(cx, cy, z0, z0 + 26, 14, 12); a.cyl(cx, cy, z0 + 26, z0 + 32, 16, 6); a.cyl(cx, cy, z0 + 32, z0 + 40, 11, 12);
    for (const s of [-1, 1]) a.tube([[cx + s * 9, cy, z0 + 40], [cx + s * 24, cy, z1 - 30], [cx + s * 6, cy, z1 - 8]], [4, 3.5, 3.5], 6);
    a.cyl(cx, cy, z1 - 8, z1 - 5, 22, 20); a.cyl(cx, cy, z0 + 40, z1 - 8, 3, 8); a.ell(cx, cy, z0 + 54, 4.5, 4.5, 9, 10, 5);
    a.circ(cx, cy, 22); a.circ(cx, cy, 14, 'EQUIP-DETAIL');
  } else {
    const zc = z0 + a.H * 0.52; a.box(cx - 36, a.YB - 5, zc - 36, cx + 36, a.YB, zc + 36); a.ycyl(-6, 0, cx, zc, 24, 20); a.ycyl(-16, -6, cx, zc, 14, 12); a.ycyl(-26, -16, cx, zc, 11, 12);
    for (const s of [-1, 1]) a.tube([[cx + s * 9, -26, zc], [cx + s * 26, -a.D + 22, zc + 5], [cx + s * 4, -a.D + 10, zc + 6]], [4, 3.5, 3.5], 6);
    a.ycyl(-a.D + 10, -a.D + 6, cx, zc + 8, 22, 20); a.ell(cx, -34, zc, 4.5, 8, 4.5, 8, 5);
    a.rect(cx - 36, -5, cx + 36, 0); a.circ(cx, -a.D + 20, 14, 'EQUIP-DETAIL');
  }
  a.log('Added the ' + (kind === 'sidewall' ? 'wall escutcheon' : 'ceiling escutcheon') + ', threaded body, two frame arms, the deflector and the glass bulb (plan and 3D).');
}
function curtainRod(a, v) {
  const L = a.W, zc = a.Z0 + a.H * 0.62, y = -70, nB = v.br, xsB = nB === 2 ? [a.X0 + L * 0.07, a.X1 - L * 0.07] : [a.X0 + L * 0.07, a.cx, a.X1 - L * 0.07];
  for (const x of xsB) { a.ycyl(-8, 0, x, zc, 30, 18); a.ycyl(-12, -8, x, zc, 20, 16); a.tube([[x, -10, zc - 6], [x, y, zc - 16]], [6, 6], 8); ringYZ(a, x, y, zc, 15, 2.8, 14, 5); a.circ(x, -4, 30, 'EQUIP-DETAIL'); }
  const x0 = a.X0 + 62, x1 = a.X1 - 62; a.xcyl(x0, x1, y, zc, 10, 14);
  for (const [xe, s] of [[a.X0 + 26, 1], [a.X1 - 26, -1]]) { a.xcyl(xe + s * 8, xe + s * 36, y, zc, 8, 10); a.ell(xe, y, zc, 24, 24, 24, 14, 8); a.ell(xe + s * 36, y, zc, 8, 12, 12, 8, 5); }
  const nr = m.max(4, m.floor((L - 240) / 127));
  for (let i = 0; i < nr; i++) { const x = x0 + 40 + ((x1 - x0 - 80) * i) / (nr - 1); ringYZ(a, x, y, zc, 21, 2.2, 14, 5); a.tube([[x, y, zc - 21], [x, y, zc - 36]], [1.3, 1.3], 5); a.box(x - 2, y - 3, zc - 40, x + 2, y + 3, zc - 35); a.circ(x, y, 21, 'EQUIP-DETAIL'); }
  a.rect(a.X0, -12, a.X1, 0); a.line(x0, y, x1, y, 'EQUIP-DETAIL');
  a.log('Added ' + nB + ' wall brackets with ring cups, the rod with turned ball finials and ' + nr + ' curtain rings with clips (plan and 3D).');
}
function rollerBlind(a, v) {
  const W = a.W, zr = a.Z1 - 36, y = -38, x0 = a.X0 + 34, x1 = a.X1 - 34, zb = a.Z0 + 40;
  for (const [xa, s] of [[a.X0, 1], [a.X1 - 18, 1]]) { a.box(xa, y - 26, zr - 30, xa + 18, y + 26, zr + 30); a.box(xa + (xa === a.X0 ? 0 : 0), -4, zr - 30, xa + 18, 0, zr + 30); }
  a.xcyl(x0, x1, y, zr, 22, 20); a.xcyl(x0 + 4, x1 - 4, y, zr, 29, 24);
  a.box(x0, y - 32, zb, x1, y - 28, zr - 6);
  a.box(x0 - 2, y - 36, zb - 18, x1 + 2, y - 24, zb); a.cyl(x1 + 2, y - 30, zb - 18, zb, 7, 10); a.cyl(x0 - 2, y - 30, zb - 18, zb, 7, 10);
  a.tube([[a.X1 - 30, y - 4, zr + 4], [a.X1 - 30, y - 44, zr + 4]], [4, 4], 6);
  for (const dy of [-44, -48]) a.tube([[a.X1 - 28, y + dy / 2 - 4, zr - 8], [a.X1 - 28, y + dy / 2 - 4, zb + 120]], [1.4, 1.4], 5);
  for (let k = 0; k < 7; k++) a.ell(a.X1 - 28, y - 26, zb + 120 + k * 16, 3, 3, 3, 6, 4);
  a.rect(a.X0, y - 36, a.X1, y + 26); a.rect(a.X0, -4, a.X1, 0, 'EQUIP-DETAIL'); a.line(x0, y - 30, x1, y - 30, 'EQUIP-DETAIL');
  a.log('Added the two end brackets, the roller tube with a wound fabric roll, the lowered fabric with a bottom bar and pull, and the bead chain (plan and 3D).');
}
function skirting(a, v) {
  const z0 = a.Z0, z1 = a.Z1, b = 16, tc = v.top, y0 = a.YF, y1 = a.YB, x0 = a.X0;   // the length runs along Y, the wall is at the left edge
  a.box(x0, y0, z0, x0 + b, y1, z1 - tc);
  prismY(a, [[x0, z1 - tc], [x0 + b, z1 - tc], [x0 + b, z1 - tc * 0.55], [x0 + b - 5, z1 - tc * 0.2], [x0 + b - 11, z1], [x0, z1]], y0, y1);
  a.ycyl(y0, y1, x0 + b + 1.6, z1 - tc - 1.6, 1.9, 8);
  prismY(a, [[x0 + b, z0], [x0 + b + 4, z0], [x0 + b, z0 + 13], [x0 + b + 4, z0 + 9]].sort((p, q) => m.atan2(p[1] - z0 - 6, p[0] - x0 - b - 2) - m.atan2(q[1] - z0 - 6, q[0] - x0 - b - 2)), y0, y1);
  a.rect(a.X0, y0, a.X1, y1); a.line(x0 + b, y0, x0 + b, y1, 'EQUIP-DETAIL'); a.line(x0 + b - 11, y0, x0 + b - 11, y1, 'EQUIP-DETAIL');
  a.log('Added the flat board, the ogee cap with its bead and the shoe at the floor line as a ' + v.h + ' in profile, ' + v.d + ' in long, standing on end so the profile shows (plan and 3D).');
}
function crown(a, v) {
  const x0 = a.X0, P = a.W, z0 = a.Z0, z1 = a.Z1, H = a.H, y0 = a.YF, y1 = a.YB;   // wall at the left edge, ceiling above, the length along Y
  prismY(a, [[x0, z0 + H * 0.12], [x0 + P * 0.25, z0 + H * 0.02], [x0 + P * 0.7, z0 + H * 0.5], [x0 + P, z1 - 8], [x0 + P, z1], [x0, z1]], y0, y1);
  a.ycyl(y0, y1, x0 + P * 0.27, z0 + 3, 3.4, 10);
  if (v.dentil) { const pitch = 22, nd = m.floor(a.D / pitch); for (let i = 0; i < nd; i++) { const y = y0 + 4 + i * pitch; a.box(x0, y, z0 + H * 0.12 - 12, x0 + P * 0.26, y + 11, z0 + H * 0.12 + 2); } }
  a.rect(a.X0, y0, a.X1, y1); a.line(x0 + P * 0.25, y0, x0 + P * 0.25, y1, 'EQUIP-DETAIL'); a.line(x0 + P * 0.7, y0, x0 + P * 0.7, y1, 'EQUIP-DETAIL');
  a.log('Added the sprung crown profile from wall to ceiling' + (v.dentil ? ', a row of dentil blocks under it' : '') + ' and a bead along the lower edge, standing on end so the profile shows (plan and 3D).');
}
function pegRail(a, v) {
  const n = v.pegs, bh = a.H, zc = a.Z0 + bh / 2, L = a.W, D = a.D;
  prismX(a, [[0, a.Z0], [-18, a.Z0 + 3], [-22, a.Z0 + 10], [-22, a.Z1 - 10], [-18, a.Z1 - 3], [0, a.Z1]], a.X0, a.X1);
  for (let i = 0; i < n; i++) {
    const x = a.X0 + (L * (i + 0.5)) / n;
    const Lp = D - 22; revolveY(a, x, zc, -22, [[9, 0], [9, Lp * 0.35], [7, Lp * 0.5], [6.5, Lp * 0.62], [11, Lp * 0.78], [14, Lp * 0.92], [10, Lp], [0.01, Lp]], 14);
    a.circ(x, -D * 0.5, 13, 'EQUIP-DETAIL');
  }
  a.rect(a.X0, -22, a.X1, 0); for (let i = 0; i < n; i++) a.line(a.X0 + (L * (i + 0.5)) / n, -22, a.X0 + (L * (i + 0.5)) / n, -D + 22, 'EQUIP-DETAIL');
  a.log('Added the chamfered rail and ' + n + ' turned pegs with a tapered shank, a neck and a rounded head (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ families
export default [
  // ---- lighting
  fam({ cat: 'fixtures/lighting', title: 'Generic suspended linear bar light', desc: (v) => `Ceiling-hung linear light ${v.w} in long with an opal lens, end caps, top ribs and ${v.hang} hanger wires with ceiling canopies.`,
    vs: [['24 in, two hangers', 24, 3, 30, 66, { hang: 2 }], ['48 in, two hangers', 48, 3, 30, 66, { hang: 2 }], ['72 in, three hangers', 72, 3, 36, 60, { hang: 3 }]], build: linearPend }),
  fam({ cat: 'fixtures/lighting', title: 'Generic flared bell pendant light', desc: (v) => `Ceiling-hung pendant with a canopy, cord, socket collar, a hollow flared bell shade ${v.w} in across with a rolled rim, and a bulb.`,
    vs: [['9 in bell', 9, 9, 28, 68, { sh: 7 }], ['13 in bell', 13, 13, 30, 66, { sh: 9 }], ['17 in bell', 17, 17, 32, 64, { sh: 11 }]], build: bellPend }),
  fam({ cat: 'fixtures/lighting', title: 'Generic multi-drop rail pendant light', desc: (v) => `Ceiling rail ${v.w} in long with ${v.n} cords of alternating drop, each ending in a conical shade over a bulb.`,
    vs: [['three drops, 36 in rail', 36, 8, 36, 60, { n: 3 }], ['four drops, 48 in rail', 48, 8, 38, 58, { n: 4 }], ['five drops, 60 in rail', 60, 8, 40, 56, { n: 5 }]], build: multiDrop }),
  fam({ cat: 'fixtures/lighting', title: 'Generic hooded picture light', desc: (v) => `Picture light ${v.w} in wide with screwed wall plates, swan arms, a swivel and a half-round hood with end caps over a tube lamp.`,
    vs: [['12 in', 12, 7, 5, 72], ['24 in', 24, 8, 5, 72], ['36 in', 36, 9, 5, 72]], build: pictureLight }),
  fam({ cat: 'fixtures/lighting', title: 'Generic glass globe vanity bar light', desc: (v) => `Wall light with two screwed plates, a bracketed bar and ${v.n} sockets, each carrying a glass globe.`,
    vs: [['two globes, 14 in', 14, 6, 9, 74, { n: 2 }], ['three globes, 22 in', 22, 6, 9, 74, { n: 3 }], ['four globes, 30 in', 30, 6, 9, 74, { n: 4 }]], build: vanityBar }),
  fam({ cat: 'fixtures/lighting', title: 'Generic flush ceiling disc light', desc: (v) => `Flush ceiling light ${v.w} in across with a ceiling plate, a drum wall with a rolled rim, an opal lens, a centre finial and three clips.`,
    vs: [['11 in', 11, 11, 4, 92], ['13 in', 13, 13, 4.5, 91.5], ['16 in', 16, 16, 5, 91]], build: flushDisc }),
  fam({ cat: 'fixtures/lighting', title: 'Generic recessed panel troffer', desc: (v) => `Recessed ceiling troffer ${v.w} in by ${v.d} in with a flange frame, an opal lens with prism ribs, a housing and a junction box above the ceiling line.`,
    vs: [['2 ft by 2 ft', 24, 24, 5, 91], ['2 ft by 4 ft', 48, 24, 5, 91], ['1 ft by 4 ft', 48, 12, 4.5, 91.5]], build: troffer }),
  fam({ cat: 'fixtures/lighting', title: 'Generic cage wall lantern', desc: (v) => `Outdoor wall lantern ${v.h} in tall with a wall plate and arms, a base, four corner posts with rails, a candle and bulb, an eave and a pyramid cap with a finial.`,
    vs: [['12 in tall', 6, 8.5, 12, 66], ['18 in tall', 8, 10.5, 18, 60], ['24 in tall', 10, 12.5, 24, 56]], build: lantern }),
  fam({ cat: 'fixtures/lighting', title: 'Generic gooseneck barn wall light', desc: (v) => `Wall light with a round rosette, a gooseneck arm arching over, and a metal dome shade ${v.w} in across with a rolled rim over a bulb.`,
    vs: [['12 in shade', 12, 14, 11, 70], ['16 in shade', 16, 18, 13, 70], ['20 in shade', 20, 22, 15, 68]], build: barnLight }),
  fam({ cat: 'fixtures/lighting', title: 'Generic louvred garden bollard light', desc: (v) => `Garden bollard ${v.h} in tall with a bolted base plate, a post, three louvre skirts over the light bands and a domed cap.`,
    vs: [['18 in', 7, 7, 18, 0], ['30 in', 7, 7, 30, 0], ['42 in, wide base', 9, 9, 42, 0]], build: bollardLight }),
  fam({ cat: 'fixtures/lighting', title: 'Generic under-cabinet strip light', desc: (v) => `Under-cabinet light ${v.w} in long with a bevelled housing, a ribbed opal lens, end caps, two clips and a rocker switch.`,
    vs: [['12 in', 12, 2.5, 1, 53], ['24 in', 24, 2.5, 1, 53], ['36 in', 36, 2.5, 1, 53]], build: underCab }),
  fam({ cat: 'fixtures/lighting', title: 'Generic ceiling fan with light kit', desc: (v) => `Ceiling fan ${v.w} in across with a canopy, downrod, motor housing, ${v.n} blades on iron arms and a light kit with a glass bowl.`,
    vs: [['42 in, three blades', 42, 42, 18, 78, { n: 3 }], ['52 in, four blades', 52, 52, 20, 76, { n: 4 }], ['60 in, five blades', 60, 60, 22, 74, { n: 5 }]], build: ceilFan }),
  fam({ cat: 'fixtures/lighting', title: 'Generic half-round wall uplight', desc: (v) => `Wall uplight ${v.w} in wide with a screwed plate, a half-round body and a rim around a glowing top lens.`,
    vs: [['8 in', 8, 4.5, 8, 72], ['12 in', 12, 6.5, 9, 72]], build: halfUplight }),

  // ---- bath
  fam({ cat: 'fixtures/bath', title: 'Generic countertop drop-in basin', desc: (v) => `Drop-in basin ${v.w} in wide with a rim flange, a hollow bowl with an overflow slot and drain, and a deck tap behind the bowl.`,
    vs: [['18 in', 18, 16, 11, 28, { bowl: 6 }], ['22 in', 22, 17, 11.5, 28, { bowl: 6.5 }], ['26 in', 26, 18, 12, 27.5, { bowl: 6.5 }]], build: dropIn }),
  fam({ cat: 'fixtures/bath', title: 'Generic framed shower enclosure', desc: (v) => `Shower enclosure ${v.w} in by ${v.d} in with a lipped tray and drain, a framed door and fixed panel with a frosted glass band, two side panels, a header rail, a pull bar and a rain head.`,
    vs: [['square, 32 in', 32, 32, 76, 0], ['square, 36 in', 36, 36, 78, 0], ['rectangular, 48 in by 36 in', 48, 36, 78, 0]], build: showerEncl }),
  fam({ cat: 'fixtures/bath', title: 'Generic wall-hung urinal', desc: (v) => v.shield ? 'Wall-hung urinal with a half-oval bowl, strainer, waste outlet, exposed flush valve with push button and a privacy screen on each side.' : 'Wall-hung urinal with a half-oval bowl, strainer, waste outlet, spreader and an exposed flush valve with push button.',
    vs: [['wall-hung, 14 in bowl', 14, 14, 34, 8, { bowl: 14, rim: 17 }], ['between two screens, 14 in bowl', 26, 14, 34, 8, { bowl: 14, rim: 17, shield: true }]], build: urinal }),
  fam({ cat: 'fixtures/bath', title: 'Generic freestanding tub filler', desc: (v) => v.hs ? `Floor-mounted tub filler ${v.h} in tall with a round floor plate, riser, arched spout, two lever handles and a hand shower on its cradle with a hose.` : `Floor-mounted tub filler ${v.h} in tall with a round floor plate, riser, arched spout and two lever handles.`,
    vs: [['floor-mounted, 30 in', 16, 14, 30, 0], ['with hand shower, 36 in', 18, 14, 36, 0, { hs: true }], ['with hand shower, 42 in', 20, 14, 42, 0, { hs: true }]], build: tubFiller }),
  fam({ cat: 'fixtures/bath', title: 'Generic wall shower control set', desc: (v) => `Wall plate with screws and ${v.n} round trim${v.n > 1 ? 's' : ''}, each with a dome and a side lever.`,
    vs: [['single lever, 5 in', 5, 3, 5, 48, { n: 1 }], ['two handle, 10 in', 10, 3, 5, 48, { n: 2 }], ['three handle, 14 in', 14, 3, 5, 48, { n: 3 }]], build: showerSet }),
  fam({ cat: 'fixtures/bath', title: 'Generic hand shower on slide rail', desc: (v) => `Slide rail ${v.rail} in long on two wall brackets with a sliding holder, a handset docked on it and a hose to the wall elbow.`,
    vs: [['24 in rail', 7, 6, 27, 34, { rail: 24 }], ['30 in rail', 7, 6, 33, 34, { rail: 30 }], ['36 in rail', 7, 6, 39, 34, { rail: 36 }]], build: handRail }),
  fam({ cat: 'fixtures/bath', title: 'Generic wall toilet roll holder', desc: (v) => `Wall holder with ${v.n > 1 ? 'two stacked' : 'one'} pair${v.n > 1 ? 's' : ''} of arms on screwed plates and a spring spindle, carrying ${v.n > 1 ? 'two paper rolls' : 'a paper roll'} on its core.`,
    vs: [['single roll', 6.5, 5.5, 6, 54, { n: 1 }], ['double roll, stacked', 6.5, 5.5, 12, 48, { n: 2 }]], build: rollHolder }),
  fam({ cat: 'fixtures/bath', title: 'Generic bathroom grab bar', desc: (v) => `Grab bar ${v.w} in long: a 1.25 in bar with a knurled grip band on wall flanges with cover caps and screws, standing 1.5 in off the wall.`,
    vs: [['12 in', 12, 3, 3.2, 33], ['18 in', 18, 3, 3.2, 33], ['24 in', 24, 3, 3.2, 33], ['36 in', 36, 3, 3.2, 33]], build: grabBar }),
  fam({ cat: 'fixtures/bath', title: 'Generic bathroom towel bar', desc: (v) => `Towel bar ${v.w} in long between two posts with round base rosettes and cover caps.`,
    vs: [['18 in', 18, 3.5, 3, 48], ['24 in', 24, 3.5, 3, 48], ['30 in', 30, 3.5, 3, 48], ['36 in', 36, 3.5, 3, 48]], build: towelBar }),
  fam({ cat: 'fixtures/bath', title: 'Generic bathroom towel ring', desc: (v) => `Towel ring with a wall rosette, a post and a ${v.dia} in ring hanging from it.`,
    vs: [['6 in ring', 6.5, 2.5, 7.2, 50, { dia: 6 }], ['8 in ring', 8.5, 2.5, 9.2, 50, { dia: 8 }]], build: towelRing }),
  fam({ cat: 'fixtures/bath', title: 'Generic surface medicine cabinet', desc: (v) => `Surface-mounted cabinet ${v.w} in wide with a crown, ${v.doors > 1 ? 'two mirror doors' : 'a mirror door'} in bevelled frames with hinge knuckles and edge pulls; the swing is shown in plan.`,
    vs: [['16 in, one door', 16, 5, 26, 42, { doors: 1 }], ['24 in, one door', 24, 5, 26, 42, { doors: 1 }], ['30 in, two doors', 30, 5, 26, 42, { doors: 2 }]], build: medCab }),
  fam({ cat: 'fixtures/bath', title: 'Generic folding shower seat', desc: (v) => `Wall-mounted seat ${v.w} in wide and ${v.d} in deep: a wall frame with hinge pins, seven slats, two folding legs with feet and a cross brace.`,
    vs: [['folding, 15 in deep', 20, 15, 23, 0], ['folding, 17 in deep', 24, 17, 23, 0]], build: showerSeat }),
  fam({ cat: 'fixtures/bath', title: 'Generic extending magnifying mirror', desc: (v) => `Wall mirror with a screwed plate, a two-link arm with an elbow and a round framed ${v.glass} in mirror with a back panel.`,
    vs: [['6 in glass', 10, 11, 10, 48, { glass: 6 }], ['8 in glass', 12, 13, 12, 48, { glass: 8 }]], build: magMirror }),
  fam({ cat: 'fixtures/bath', title: 'Generic bathroom robe hook', desc: (v) => v.n === 1 ? 'Wall hook with a round rosette and screw and one curved prong with a ball tip.' : 'Wall hooks on a screwed bar plate, two curved prongs with ball tips.',
    vs: [['single hook', 2.5, 3, 4.5, 66, { n: 1 }], ['double hook on bar, 6 in', 6.5, 3, 4.5, 66, { n: 2 }]], build: robeHook }),

  // ---- hardware
  fam({ cat: 'fixtures/hardware', title: 'Generic vertical door pull bar', desc: (v) => `Door pull ${v.h} in tall: a round bar with ball ends on two standoffs with base rosettes.`,
    vs: [['12 in', 2, 3, 12, 40], ['24 in', 2, 3, 24, 36], ['36 in', 2, 3, 36, 30]], build: doorPull }),
  fam({ cat: 'fixtures/hardware', title: 'Generic drawer bin cup pull', desc: (v) => `Drawer pull ${v.w} in wide: a screwed backplate with a half-round cup for the fingers and a raised lip.`,
    vs: [['3 in', 3, 1.8, 2, 30, { r: 14 }], ['4 in', 4, 2, 2.2, 30, { r: 16 }]], build: cupPull }),
  fam({ cat: 'fixtures/hardware', title: 'Generic gate thumb latch', desc: (v) => `Gate latch ${v.w} in long: a slotted backplate, a sliding bar in two staples, a thumb lever with a pull ring and a keeper plate.`,
    vs: [['6 in', 6, 1.6, 2.2, 44], ['8 in', 8, 1.6, 2.4, 44], ['10 in', 10, 1.8, 2.6, 44]], build: gateLatch }),
  fam({ cat: 'fixtures/hardware', title: 'Generic hook and eye latch', desc: (v) => `Hook-and-eye latch ${v.w} in long: a hook plate with a pivot pin and a bent rod, and an eye plate with a ring.`,
    vs: [['3 in', 3, 0.8, 1.1, 44], ['4 in', 4, 0.8, 1.2, 44], ['6 in', 6, 0.9, 1.4, 44]], build: hookEye }),
  fam({ cat: 'fixtures/hardware', title: 'Generic barn strap hinge', desc: (v) => `Strap hinge ${v.w} in long: a rolled eye with its pin, a tapered strap with a pointed end and round bolt heads.`,
    vs: [['12 in', 12, 1, 3, 36], ['18 in', 18, 1, 3.5, 36], ['24 in', 24, 1.1, 4, 36]], build: strapHinge }),
  fam({ cat: 'fixtures/hardware', title: 'Generic piano hinge length', desc: (v) => `Continuous hinge ${v.w} in long with a knuckle every inch on one pin, one leaf on the wall and the other swung open to 90 degrees, with screws in both.`,
    vs: [['12 in', 12, 1.1, 1.2, 40], ['24 in', 24, 1.1, 1.2, 40], ['36 in', 36, 1.1, 1.2, 40]], build: pianoHinge }),
  fam({ cat: 'fixtures/hardware', title: 'Generic concealed cup hinge', desc: (v) => `Cabinet hinge with a 35 mm cup, flange and screws, a ${v.bend ? 'cranked' : 'straight'} linkage arm and a screwed mounting plate.`,
    vs: [['full overlay', 3.2, 0.9, 1.9, 40, { bend: 0 }], ['half overlay, cranked', 3.2, 1.2, 1.9, 40, { bend: 6 }]], build: cupHinge }),
  fam({ cat: 'fixtures/hardware', title: 'Generic ball-bearing drawer slide', desc: (v) => `Side-mount slide ${v.w} in long, partly extended: outer, middle and inner steel members, ball rows between them, screws and a release lever.`,
    vs: [['12 in', 12, 0.75, 1.75, 20], ['18 in', 18, 0.75, 1.75, 20], ['22 in', 22, 0.75, 1.75, 20]], build: drawerSlide }),
  fam({ cat: 'fixtures/hardware', title: 'Generic body padlock', desc: (v) => `Padlock ${v.w} in wide with a laminated body and face plate, a key plug with keyway, screws and a shackle arching out of two holes.`,
    vs: [['1.5 in', 1.5, 0.8, 2.6, 40, { tr: 3.2 }], ['2 in', 2, 0.9, 3.4, 40, { tr: 4 }], ['2.5 in', 2.5, 1, 4.1, 40, { tr: 5 }]], build: padlock }),
  fam({ cat: 'fixtures/hardware', title: 'Generic sliding barn door track', desc: (v) => `Barn door hardware ${v.w} in long: a round rail on ${v.sup} wall standoffs with rosettes, two hangers each with twin wheels and a bolted strap, and end stops.`,
    vs: [['6 ft, three standoffs', 72, 3.5, 9, 80, { sup: 3 }], ['8 ft, four standoffs', 96, 3.5, 9, 80, { sup: 4 }], ['10 ft, five standoffs', 120, 3.5, 9, 80, { sup: 5 }]], build: barnTrack }),
  fam({ cat: 'fixtures/hardware', title: 'Generic wall coat hook', desc: (v) => `Coat hook with ${v.n === 1 ? 'a round rosette' : 'a screwed rail'} and ${v.n} curved prong${v.n > 1 ? 's' : ''} with ball tips.`,
    vs: [['single', 2.5, 3.5, 5, 64, { n: 1 }], ['double, 6 in rail', 6, 3.5, 5, 64, { n: 2 }], ['triple, 10 in rail', 10, 3.5, 5, 64, { n: 3 }]], build: coatHook }),
  fam({ cat: 'fixtures/hardware', title: 'Generic door stop', desc: (v) => v.spring ? 'Floor-screwed base with a sprung post, a coil spring and a rubber bumper.' : 'Floor-screwed round base with a low rubber dome.',
    vs: [['low dome, 1.5 in', 2.5, 2.5, 1.5, 0, { h: 1.5 }], ['sprung post, 3.5 in', 2.5, 2.5, 3.5, 0, { h: 3.5, spring: true }]], build: doorStop }),
  fam({ cat: 'fixtures/hardware', title: 'Generic door letter plate', desc: (v) => `Letter plate ${v.w} in wide with a screwed backplate, a framed slot and a spring flap on a hinge rod${v.card ? ', with a card window above' : ''}.`,
    vs: [['standard, 10 in', 10.5, 0.9, 3.6, 40], ['with card window, 12 in', 12.5, 0.9, 5, 40, { card: true }]], build: letterPlate }),
  fam({ cat: 'fixtures/hardware', title: 'Generic door chain guard', desc: (v) => `Door chain with a slotted track plate and sliding knob, ${v.links} alternating links and a knob plate with a stud.`,
    vs: [['short, 8 links', 4.5, 1, 1.8, 48, { links: 8 }], ['long, 12 links', 6.5, 1, 1.8, 48, { links: 12 }]], build: doorChain }),

  // ---- fittings
  fam({ cat: 'fixtures/fittings', title: 'Generic linear slot diffuser', desc: (v) => `Ceiling slot diffuser ${v.w} in long with a flange plate, ${v.slots} slot${v.slots > 1 ? 's' : ''}, plenum sleeves below, angled blades and corner screws.`,
    vs: [['24 in, one slot', 24, 4, 2.5, 93.5, { slots: 1 }], ['48 in, two slots', 48, 6, 2.5, 93.5, { slots: 2 }], ['72 in, three slots', 72, 8, 2.5, 93.5, { slots: 3 }]], build: slotDiffuser }),
  fam({ cat: 'fixtures/fittings', title: 'Generic floor register with duct boot', desc: (v) => `Floor register ${v.w} in by ${v.d} in with a flanged frame, walkable bars, a damper lever and the duct boot box below.`,
    vs: [['4 in by 10 in, on boot', 10, 4, 8, 0], ['4 in by 12 in, on boot', 12, 4, 8, 0], ['6 in by 14 in, on boot', 14, 6, 9, 0]], build: floorRegister }),
  fam({ cat: 'fixtures/fittings', title: 'Generic GFCI outlet plate', desc: (v) => `Wall plate with ${v.gang === 1 ? 'a GFCI receptacle with test and reset buttons' : 'a GFCI receptacle beside a plain duplex'}, blade slots and screws.`,
    vs: [['one gang', 2.8, 0.65, 4.5, 16, { gang: 1 }], ['two gang, GFCI and duplex', 4.6, 0.65, 4.5, 16, { gang: 2 }]], build: gfci }),
  fam({ cat: 'fixtures/fittings', title: 'Generic data and media wall plate', desc: (v) => `Wall plate with ${v.ports} ports in surrounds and two screws.`,
    vs: [['two network ports', 2.8, 0.6, 4.5, 16, { ports: 2, kinds: ['rj'] }], ['four ports, network and coax', 2.8, 0.6, 4.5, 16, { ports: 4, kinds: ['rj', 'f'] }], ['six ports, network, coax and media', 4.6, 0.6, 4.5, 16, { ports: 6, kinds: ['rj', 'f', 'm'] }]], build: dataPlate }),
  fam({ cat: 'fixtures/fittings', title: 'Generic dimmer wall plate', desc: (v) => v.dial ? 'Wall plate with a round rotary knob with an index mark and a separate rocker below.' : 'Wall plate with a slide on a track and a bypass rocker.',
    vs: [['rotary dial', 2.8, 0.9, 4.5, 44, { dial: true }], ['slide and rocker', 2.8, 0.4, 4.5, 44]], build: dimmer }),
  fam({ cat: 'fixtures/fittings', title: 'Generic floor outlet box', desc: (v) => v.round ? 'Floor box with a sunk can, a cover flange with screws and a round lid with a cable notch.' : `Floor box with a sunk can, a cover flange with screws and ${v.gang} hinged outlet lids.`,
    vs: [['round, 4.5 in', 4.5, 4.5, 3, 0, { round: true }], ['rectangular, two gang', 6.5, 5.5, 3, 0, { gang: 2 }], ['rectangular, four gang', 10.5, 5.5, 3, 0, { gang: 4 }]], build: floorBox }),
  fam({ cat: 'fixtures/fittings', title: 'Generic ceiling smoke detector', desc: (v) => `Smoke detector ${v.w} in across with a mounting plate, a domed cover with vent rings and slots, a test button and a status light.`,
    vs: [['5 in', 5, 5, 2.2, 93.8], ['6 in', 6, 6, 2.4, 93.6]], build: smokeDet }),
  fam({ cat: 'fixtures/fittings', title: 'Generic frame-arm sprinkler head', desc: (v) => `${v.kind === 'pendant' ? 'Pendant' : v.kind === 'upright' ? 'Upright' : 'Sidewall'} sprinkler with an escutcheon, a threaded body, two frame arms, a deflector and a glass bulb.`,
    vs: [['pendant', 3, 3, 3.2, 92.8, { kind: 'pendant' }], ['upright', 3, 3, 3, 80, { kind: 'upright' }], ['sidewall', 3, 3.5, 3, 84, { kind: 'sidewall' }]], build: sprinkler }),
  fam({ cat: 'fixtures/fittings', title: 'Generic curtain rod with rings', desc: (v) => `Curtain rod ${v.w} in long on ${v.br} wall brackets with ring cups, ball finials and curtain rings with clips.`,
    vs: [['3 ft, two brackets', 36, 4, 4, 70, { br: 2 }], ['4 ft, two brackets', 48, 4, 4, 70, { br: 2 }], ['6 ft, centre bracket', 72, 4, 4, 70, { br: 3 }], ['8 ft, centre bracket', 96, 4, 4, 70, { br: 3 }]], build: curtainRod }),
  fam({ cat: 'fixtures/fittings', title: 'Generic roller blind', desc: (v) => `Roller blind ${v.w} in wide with two end brackets, a roller tube with a fabric roll, the fabric lowered to a bottom bar, and a bead chain.`,
    vs: [['24 in wide, 48 in drop', 24, 3, 52, 40], ['36 in wide, 60 in drop', 36, 3, 64, 30], ['48 in wide, 72 in drop', 48, 3, 76, 20]], build: rollerBlind }),
  fam({ cat: 'fixtures/fittings', title: 'Generic moulded skirting board length', desc: (v) => `Skirting board ${v.d} in long, ${v.h} in high, shown on end: a flat board with an ogee cap and bead, and a shoe at the floor line.`,
    vs: [['4 in profile', 1, 48, 4, 0, { top: 40, h: 4 }], ['6 in profile', 1, 48, 6, 0, { top: 50, h: 6 }], ['8 in profile', 1, 48, 8, 0, { top: 62, h: 8 }]], build: skirting }),
  fam({ cat: 'fixtures/fittings', title: 'Generic crown moulding length', desc: (v) => `Crown moulding ${v.d} in long, ${v.h} in high, shown on end: a sprung profile from wall to ceiling${v.dentil ? ' with a row of dentil blocks under it' : ''} and a bead along the lower edge.`,
    vs: [['3.5 in crown, 8 ft', 2.5, 96, 3.5, 92.5], ['5.5 in crown with dentils, 8 ft', 3.5, 96, 5.5, 90.5, { dentil: true }], ['7 in crown with dentils, 8 ft', 4.5, 96, 7, 89, { dentil: true }]], build: crown }),
  fam({ cat: 'fixtures/fittings', title: 'Generic shaker peg rail', desc: (v) => `Peg rail ${v.w} in long with a chamfered rail and ${v.pegs} turned pegs with a tapered shank, a neck and a rounded head.`,
    vs: [['24 in, four pegs', 24, 3.5, 3.5, 60, { pegs: 4 }], ['36 in, six pegs', 36, 3.5, 3.5, 60, { pegs: 6 }], ['48 in, eight pegs', 48, 3.5, 3.5, 60, { pegs: 8 }]], build: pegRail }),
];

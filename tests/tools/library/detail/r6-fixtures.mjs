/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, fixtures: lighting, bath, door and cabinet hardware, wall and ceiling fittings. Original geometry; generic sizes. */
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

// ------------------------------------------------------------------------------------------ lighting
/** canopy, cord and the ceiling plan marks shared by the hanging lights */
function canopy(a, r = 58, zTop = a.Z1) { a.cyl(a.cx, a.cy, zTop - 20, zTop, r, 20); a.cyl(a.cx, a.cy, zTop - 26, zTop - 20, r * 0.35, 12); }
const bulb = (a, x, y, z, r = 32) => { a.cyl(x, y, z, z + r * 0.9, r * 0.45, 10); a.ell(x, y, z - r * 0.35, r, r, r * 1.15, 12, 7); };
function dome(a, v) {
  const R = a.W / 2, sh = R * (v.deep ?? 0.62), top = a.Z0 + sh, t = 4;
  const outer = [], inner = [];
  for (let i = 0; i <= 8; i++) { const q = (i / 8) * PI / 2; outer.push([R * m.cos(q) + 0.01, a.Z0 + sh * m.sin(q)]); inner.push([m.max(R * m.cos(q) - t, 0.01), a.Z0 + sh * m.sin(q) - t * 0.6]); }
  revolve(a, a.cx, a.cy, [...outer, [26, top], [22, top - 4], ...inner.reverse().slice(1), [R - t, a.Z0 + 0.1]], 28);
  a.cyl(a.cx, a.cy, top - 4, top + 70, 24, 12);           // neck / socket cup
  a.tube([[a.cx, a.cy, top + 70], [a.cx, a.cy, a.Z1 - 20]], [4.5, 4.5], 6);
  bulb(a, a.cx, a.cy, a.Z0 + sh * 0.2, R * 0.16);
  canopy(a);
  a.circ(a.cx, a.cy, R); a.circ(a.cx, a.cy, R - 8, 'EQUIP-DETAIL'); a.circ(a.cx, a.cy, 58, 'EQUIP-DETAIL'); a.circ(a.cx, a.cy, R * 0.16, 'EQUIP-DETAIL');
  a.log('Added the ceiling canopy, cord, socket cup, hollow dome shade and bulb (plan and 3D).');
}
function globe(a, v) {
  const R = a.W / 2, zc = a.Z0 + R;
  a.ell(a.cx, a.cy, zc, R, R, R, 24, 14);
  a.cyl(a.cx, a.cy, zc + R * 0.86, zc + R * 1.08, R * 0.2, 16);      // collar
  a.tube([[a.cx, a.cy, zc + R * 1.08], [a.cx, a.cy, a.Z1 - 20]], [4.5, 4.5], 6);
  if (v.cluster) for (const s of [-1, 1]) { sweep(a, arcPts([a.cx, a.cy, zc + R], [a.cx + s * R * 0.2, a.cy, zc + R * 1.5], [a.cx + s * R * 0.2, a.cy, a.Z1 - 20]), [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], 5); }
  canopy(a);
  a.circ(a.cx, a.cy, R); a.circ(a.cx, a.cy, R * 0.2, 'EQUIP-DETAIL'); a.circ(a.cx, a.cy, 58, 'EQUIP-DETAIL');
  a.log('Added the ceiling canopy, cord, collar and the opal globe (plan and 3D).');
}
function drum(a, v) {
  const R = a.W / 2, sh = v.sh * IN, zb = a.Z0, zt = zb + sh;
  revolve(a, a.cx, a.cy, [[R, zb], [R, zt], [R - 3, zt], [R - 3, zb + 3], [R, zb]], 32);
  a.cyl(a.cx, a.cy, zb + 4, zb + 9, R - 6, 32);                      // diffuser disc
  loop(a, a.cx, a.cy, R - 1.5, zt, 2.6, 32, 5); loop(a, a.cx, a.cy, R - 1.5, zb, 2.6, 32, 5);   // top and bottom rings
  for (let i = 0; i < 3; i++) { const t = (i / 3) * 2 * PI + 0.5; a.tube([[a.cx + (R - 4) * m.cos(t), a.cy + (R - 4) * m.sin(t), zt], [a.cx, a.cy, zt + 90], [a.cx, a.cy, a.Z1 - 20]], [2.6, 2.6, 2.6], 5); }
  bulb(a, a.cx, a.cy, zb + sh * 0.35, 30);
  canopy(a);
  a.circ(a.cx, a.cy, R); a.circ(a.cx, a.cy, R - 3, 'EQUIP-DETAIL'); a.circ(a.cx, a.cy, 58, 'EQUIP-DETAIL');
  a.log('Added the drum shade with diffuser, top and bottom rings, three hanger wires, canopy and bulb (plan and 3D).');
}
function cylSconce(a, v) {
  const r = a.W / 2, cz = a.Z0 + a.H / 2, y = -(r + 12);
  a.box(a.cx - r * 0.55, -12, a.Z0 + a.H / 2 - r * 0.9, a.cx + r * 0.55, 0, a.Z0 + a.H / 2 + r * 0.9);   // wall plate
  a.cyl(a.cx, y, a.Z0, a.Z1, r, 24);
  for (const zz of [a.Z0, a.Z1 - 10]) { a.cyl(a.cx, y, zz, zz + 10, r + 2, 24); a.cyl(a.cx, y, zz < a.Z0 + 1 ? a.Z0 - 0.5 : a.Z1, zz < a.Z0 + 1 ? a.Z0 : a.Z1 + 0.5, r * 0.7, 16); }
  a.box(a.cx - 5, -14, a.Z0 + a.H / 2 - 6, a.cx + 5, -r - 2, a.Z0 + a.H / 2 + 6);
  a.rect(a.cx - r * 0.55, -12, a.cx + r * 0.55, 0); a.circ(a.cx, y, r); a.circ(a.cx, y, r * 0.7, 'EQUIP-DETAIL');
  a.log('Added the wall plate, stem, cylinder body with end caps and the glow openings (plan and 3D).');
}
function armSconce(a, v) {
  const reach = a.D, zc = a.Z0 + a.H * 0.45, pl = 90;
  a.box(a.cx - 38, -10, zc - pl, a.cx + 38, 0, zc + pl);
  a.cyl(a.cx, -22, zc - 14, zc + 14, 22, 12);
  const ex = a.cx + (v.swing ? a.W * 0.0 : 0), ey = -reach * 0.82;
  if (v.swing) {
    a.cyl(a.cx, -22, zc - 30, zc + 30, 16, 12);
    a.tube([[a.cx, -22, zc], [a.cx + a.W * 0.12, -reach * 0.45, zc], [a.cx + a.W * 0.22, -reach * 0.62, zc + 6]], [11, 11, 11], 8);
    a.cyl(a.cx + a.W * 0.22, -reach * 0.62, zc - 22, zc + 22, 17, 12);
    a.tube([[a.cx + a.W * 0.22, -reach * 0.62, zc + 6], [a.cx + a.W * 0.1, -reach * 0.9, zc + 6]], [10, 10], 8);
    const sx = a.cx + a.W * 0.1, sy = -reach * 0.9;
    revolve(a, sx, sy, [[18, zc - 4], [58, zc + 100], [55, zc + 100], [15, zc - 4]], 20); bulb(a, sx, sy, zc + 20, 22);
    a.arc(a.cx, -22, reach * 0.55, 90, 270, 'EQUIP-SWING'); a.circ(sx, sy, 58); a.line(a.cx, -22, a.cx + a.W * 0.22, -reach * 0.62, 'EQUIP-DETAIL'); a.line(a.cx + a.W * 0.22, -reach * 0.62, sx, sy, 'EQUIP-DETAIL');
  } else {
    sweep(a, arcPts([a.cx, -22, zc], [a.cx, -reach * 0.8, zc - 10], [a.cx, ey, zc + 90]), new Array(11).fill(9), 8);
    revolve(a, a.cx, ey, [[16, zc + 90], [60, zc + 90 + 120], [57, zc + 90 + 120], [13, zc + 90]], 20); bulb(a, a.cx, ey, zc + 110, 22);
    a.circ(a.cx, ey, 60); a.line(a.cx, -22, a.cx, ey, 'EQUIP-DETAIL');
  }
  a.rect(a.cx - 38, -10, a.cx + 38, 0);
  a.log('Added the wall plate, arm' + (v.swing ? ' with a swing joint' : '') + ', shade and candle bulb (plan and 3D).');
}
function downlight(a, v) {
  const R = a.W / 2, fl = 12, z0 = a.Z0;
  if (v.sq) { a.box(a.cx - R, a.cy - R, z0, a.cx + R, a.cy + R, z0 + fl); } else { a.cyl(a.cx, a.cy, z0, z0 + fl, R, 36); }
  const rr = R * 0.8;
  revolve(a, a.cx, a.cy, [[rr, z0 + 0.5], [rr * 0.62, z0 + a.H * 0.55], [rr * 0.62 - 3, z0 + a.H * 0.55], [rr - 4, z0 + 0.5]], 28);
  a.cyl(a.cx, a.cy, z0 + a.H * 0.55, z0 + a.H * 0.95, rr * 0.7, 28);     // housing can above the ceiling
  a.cyl(a.cx, a.cy, z0 + 3, z0 + 6, rr * 0.6, 24);                          // lens
  if (v.sq) { a.rect(a.cx - R, a.cy - R, a.cx + R, a.cy + R); } else a.circ(a.cx, a.cy, R);
  a.circ(a.cx, a.cy, rr, 'EQUIP-DETAIL'); a.circ(a.cx, a.cy, rr * 0.6, 'EQUIP-DETAIL');
  a.log('Added the trim flange, reflector cone, lens and the housing above the ceiling (plan and 3D).');
}
function track(a, v) {
  const L = a.W, tw = 28, zt = a.Z1 - 14;
  a.box(a.X0, -tw / 2 - 20 + a.D / 2 * 0 - 0, zt, a.X1, tw / 2 - 20, a.Z1);          // the track
  a.box(a.X0 + 2, -tw / 2 - 20, zt - 6, a.X1 - 2, -tw / 2 - 20 + 8, zt);
  const y = -20;
  for (const x of [a.X0 + 12, a.X1 - 12]) a.box(x - 12, y - 18, zt - 4, x + 12, y + 18, a.Z1);
  const n = v.heads, gap = (L - 240) / n;
  for (let i = 0; i < n; i++) {
    const x = a.X0 + 120 + gap * (i + 0.5);
    a.cyl(x, y, zt - 40, zt, 18, 10);                                         // adapter
    a.box(x - 52, y - 7, zt - 52, x + 52, y + 7, zt - 40);                       // yoke bar
    a.box(x - 52, y - 7, zt - 150, x - 44, y + 7, zt - 40); a.box(x + 44, y - 7, zt - 150, x + 52, y + 7, zt - 40);
    const y1 = y - (v.tilt ?? 90) * 0.25, y2 = y - (v.tilt ?? 90) * 1.0;
    a.tube([[x, y1 + 40, zt - 100], [x, y2 - 40 + 10, zt - 190]], [40, 40], 16);
    a.tube([[x, y2 - 30, zt - 186], [x, y2 - 44, zt - 191]], [44, 44], 16);
    a.tube([[x, y2 + 40, zt - 120], [x, y2 + 100, zt - 70]], [24, 24], 12);
    a.circ(x, y - 40, 40, 'EQUIP-DETAIL'); a.ellp(x, y - 50, 22, 50, 'EQUIP-DETAIL');
  }
  a.outline('EQUIP-HIDDEN'); a.rect(a.X0, -tw / 2 - 20, a.X1, tw / 2 - 20);
  for (let i = 1; i < 4; i++) a.line(a.X0 + (L * i) / 4, -tw / 2 - 20, a.X0 + (L * i) / 4, tw / 2 - 20, 'EQUIP-DETAIL');
  a.log('Added the track with end caps, ' + n + ' adjustable heads on yokes with barrels and lenses (plan and 3D).');
}
function chandelier(a, v) {
  const R = a.W / 2, n = v.arms, zc = a.Z0 + a.H * 0.4;
  canopy(a, 70);
  a.tube([[a.cx, a.cy, a.Z1 - 20], [a.cx, a.cy, a.Z1 - 20 - (a.H * 0.36)]], [7, 7], 6);
  revolve(a, a.cx, a.cy, [[14, zc + 160], [34, zc + 120], [20, zc + 60], [46, zc], [24, zc - 70], [40, zc - 130], [0.5, zc - 190]], 16);
  loop(a, a.cx, a.cy, R * 0.82, zc + 20, 5, 36, 6);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 2 * PI + PI / n, c = m.cos(t), s = m.sin(t);
    const ax = a.cx + (R - 40) * c, ay = a.cy + (R - 40) * s;
    sweep(a, arcPts([a.cx + 30 * c, a.cy + 30 * s, zc - 10], [a.cx + R * 0.8 * c, a.cy + R * 0.8 * s, zc - 90], [ax, ay, zc + 60]), new Array(11).fill(6.5), 6);
    a.cyl(ax, ay, zc + 60, zc + 78, 26, 12); a.cyl(ax, ay, zc + 78, zc + 150, 13, 10);
    a.ell(ax, ay, zc + 170, 9, 9, 24, 8, 5);
    a.circ(ax, ay, 14, 'EQUIP-DETAIL'); a.line(a.cx, a.cy, ax, ay, 'EQUIP-DETAIL');
  }
  a.circ(a.cx, a.cy, R); a.circ(a.cx, a.cy, R * 0.82, 'EQUIP-DETAIL'); a.circ(a.cx, a.cy, 70, 'EQUIP-DETAIL');
  a.log('Added the canopy, chain, turned centre column, ring and ' + n + ' curved arms with cups and candle lamps (plan and 3D).');
}
function bulkhead(a, v) {
  const w = a.W, h = a.H, d = a.D, zc = a.Z0 + h / 2;
  const base = a.box(a.cx - w / 2, -14, a.Z0, a.cx + w / 2, 0, a.Z1);
  const rx = w / 2 - 14, rz = h / 2 - 14;
  // oval dome: a half ellipsoid built from rings
  const rings = [];
  for (let i = 0; i <= 6; i++) { const q = (i / 6) * PI / 2; rings.push([m.cos(q), m.sin(q)]); }
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < 24; k++) {
    const P = (ri, kk) => { const u = (kk / 24) * 2 * PI; return [a.cx + rx * rings[ri][0] * m.cos(u), -14 - (d - 14) * rings[ri][1], zc + rz * rings[ri][0] * m.sin(u)]; };
    quad(a, P(i, k), P(i + 1, k), P(i + 1, k + 1), P(i, k + 1));
  }
  for (let i = 0; i < 4; i++) { const sx = i % 2 ? 1 : -1, sz = i < 2 ? 1 : -1; a.cyl(a.cx + sx * (w / 2 - 8), -14, zc + sz * (h / 2 - 8) - 0, zc + sz * (h / 2 - 8), 1, 4); }
  for (const f of [0.55, 0.85]) a.tube(Array.from({ length: 25 }, (_, k) => { const u = (k / 24) * 2 * PI; return [a.cx + rx * f * m.cos(u) * 1.0, -14 - (d - 14) * m.sqrt(1 - f * f) * 1.0 - 1, zc + rz * f * m.sin(u)]; }), new Array(25).fill(2.6), 5);
  a.box(a.cx - rx, -d + 1, zc - 1.8, a.cx + rx, -d + 3, zc + 1.8);
  a.box(a.cx - 2, -d + 1, zc - rz, a.cx + 2, -d + 3, zc + rz);
  a.rect(a.cx - w / 2, -14, a.cx + w / 2, 0); a.ellp(a.cx, -7, rx, 7, 'EQUIP-DETAIL'); a.poly([[a.cx - rx, -14], [a.cx - rx * 0.7, -d * 0.8], [a.cx + rx * 0.7, -d * 0.8], [a.cx + rx, -14]], 'EQUIP-DETAIL');
  a.log('Added the wall base, oval guard dome with grille bars and the screw heads (plan and 3D).');
}
function floorLamp(a, v) {
  const bx = v.arc ? a.X0 + a.W * 0.12 : a.cx, by = a.cy;
  a.cyl(bx, by, a.Z0, a.Z0 + 30, v.arc ? a.D * 0.4 : a.W * 0.28, 24);
  if (v.kind === 'arc') {
    a.cyl(bx, by, a.Z0 + 30, a.Z0 + 260, 25, 12);
    sweep(a, arcPts([bx, by, a.Z0 + 240], [bx + 120, by, a.Z1 + 180], [a.X1 - 260, by, a.Z1 - 195]).map((p) => [p[0], p[1], m.min(p[2], a.Z1 - 20)]), new Array(11).fill(12), 8);
    const sx = a.X1 - 260;
    revolve(a, sx, by, [[22, a.Z1 - 180], [210, a.Z1 - 30], [200, a.Z1 - 30], [16, a.Z1 - 190]], 24);
    a.circ(sx, by, 210); a.line(bx, by, sx, by, 'EQUIP-DETAIL'); a.circ(bx, by, a.D * 0.4);
  } else if (v.kind === 'torch') {
    a.tube([[bx, by, a.Z0 + 30], [bx, by, a.Z1 - 200]], [15, 15], 10);
    revolve(a, bx, by, [[10, a.Z1 - 280], [60, a.Z1 - 230], [a.W * 0.4, a.Z1 - 80], [a.W * 0.4 + 2, a.Z1], [a.W * 0.4 - 14, a.Z1], [a.W * 0.38 - 20, a.Z1 - 70], [30, a.Z1 - 200], [10, a.Z1 - 205]], 28);
    a.circ(bx, by, a.W * 0.4); a.circ(bx, by, a.W * 0.28, 'EQUIP-DETAIL'); a.circ(bx, by, a.W * 0.28 * 1.0 + 0.1);
  } else {  // tripod
    const top = a.Z1 - 380;
    for (let i = 0; i < 3; i++) { const t = (i / 3) * 2 * PI + PI / 2; a.tube([[bx + (a.W * 0.36) * m.cos(t), by + (a.W * 0.36) * m.sin(t), a.Z0 + 20], [bx, by, top]], [12, 9], 8); a.circ(bx + a.W * 0.36 * m.cos(t), by + a.W * 0.36 * m.sin(t), 14, 'EQUIP-DETAIL'); }
    a.cyl(bx, by, top, top + 70, 20, 12);
    revolve(a, bx, by, [[a.W * 0.34, top + 80], [a.W * 0.34, a.Z1], [a.W * 0.34 - 3, a.Z1], [a.W * 0.34 - 3, top + 90], [a.W * 0.34, top + 80]], 30);
    a.cyl(bx, by, top + 70, top + 84, a.W * 0.33, 30);
    a.circ(bx, by, a.W * 0.36); a.circ(bx, by, a.W * 0.34, 'EQUIP-DETAIL');
  }
  a.log('Added the base, stem' + (v.kind === 'arc' ? ', arching arm' : v.kind === 'tripod' ? ', three splayed legs' : '') + ' and the ' + (v.kind === 'torch' ? 'upward-facing bowl' : 'shade') + ' (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ bath
/** a single-lever deck tap: base, body, arched spout and lever. y = base centre, hgt = overall height above zb, reach = spout reach from the body */
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
function pedestal(a, v) {
  const W = a.W, D = a.D, top = a.Z0 + v.rim * IN, cx = a.cx, cy = -D / 2;
  const o = rrect(cx, cy, W, D, D * 0.38, 5), i1 = rrect(cx, cy, W * 0.89, D * 0.89, D * 0.38 * 0.89, 5);
  const mk = (s) => rrect(cx, cy, W * s, D * s, D * 0.38 * s, 5);
  shellLoft(a, mk, top - 200, top, (t) => 0.58 + 0.42 * m.sin((t * PI) / 2), 0.11, 7);
  a.prism(mk(0.45), top - 205, top - 185);
  a.box(cx - W / 2, -28, top, cx + W / 2, 0, top + 85);                // backsplash
  revolve(a, cx, -D * 0.5 + 10, [[90, a.Z0], [66, a.Z0 + 120], [55, top - 440], [70, top - 240], [96, top - 180]], 22);
  a.cyl(cx, -D * 0.5 + 10, a.Z0, a.Z0 + 14, 120, 22);
  tap(a, cx, -D * 0.12 - 20, top, 150, 120);
  a.circ(cx, cy + 40, 16, 'EQUIP-DETAIL'); a.poly(o); a.poly(i1, 'EQUIP-DETAIL'); a.circ(cx, -D * 0.5 + 10, 60, 'EQUIP-HIDDEN'); a.rect(cx - W / 2, -28, cx + W / 2, 0);
  a.log('Added the basin with rolled rim and bowl, rear splash, pedestal column and deck tap (plan and 3D).');
}
function wallBasin(a, v) {
  const W = a.W, D = a.D, top = a.Z0 + v.rim * IN, cx = a.cx, cy = -D / 2;
  const o = rrect(cx, cy, W, D, D * 0.3, 5), i1 = rrect(cx, cy, W * 0.89, D * 0.89, D * 0.3 * 0.89, 5);
  const mk = (s) => rrect(cx, cy, W * s, D * s, D * 0.3 * s, 5);
  shellLoft(a, mk, top - 190, top, (t) => 0.6 + 0.4 * m.sin((t * PI) / 2), 0.11, 7);
  a.prism(mk(0.47), top - 195, top - 175);
  a.box(cx - W / 2, -24, top, cx + W / 2, 0, top + 70);
  tap(a, cx, -D * 0.2, top, 130, 110);
  // chrome bottle trap
  const dz = top - 170;
  a.cyl(cx, cy + 10, dz - 60, dz, 24, 12);
  a.tube([[cx, cy + 10, dz - 60], [cx, cy + 10, a.Z0 + 60], [cx, cy + 10 - 40, a.Z0 + 28], [cx, -22, a.Z0 + 28], [cx, -8, a.Z0 + 28]], [18, 18, 18, 18, 18], 10);
  a.cyl(cx, cy + 10, a.Z0 + 30, a.Z0 + 100, 36, 14);
  a.circ(cx, cy + 10, 18, 'EQUIP-DETAIL'); a.poly(o); a.poly(i1, 'EQUIP-DETAIL'); a.rect(cx - W / 2, -24, cx + W / 2, 0);
  a.log('Added the wall-hung basin with bowl, rear splash, deck tap and the exposed bottle trap (plan and 3D).');
}
function vessel(a, v) {
  const W = a.W, D = a.D, cx = a.cx, ts = 38, zt = 33 * IN, R = v.bowl * IN / 2, by = -D + R + 30;
  a.box(a.X0, -D, zt - ts, a.X1, 0, zt);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * (W / 2 - 40) - (sx > 0 ? 0 : 0) - 20, (sy > 0 ? -40 : -D + 40) - 20, a.Z0, cx + sx * (W / 2 - 40) + 20, (sy > 0 ? -40 : -D + 40) + 20, zt - ts);
  a.box(a.X0 + 20, -D + 60, a.Z0 + 190, a.X1 - 20, -D + 100, a.Z0 + 230);      // low front rail / towel bar
  a.box(a.X0 + 20, -100, a.Z0 + 190, a.X1 - 20, -60, a.Z0 + 230);
  const profO = [[R * 0.55, zt], [R * 0.9, zt + 34], [R, zt + 90], [R, zt + 130], [R * 0.99, zt + 148], [R - 12, zt + 148], [R - 14, zt + 120], [R * 0.9 - 14, zt + 50], [R * 0.45, zt + 22]];
  revolve(a, cx, by, profO, 32);
  a.cyl(cx, by, zt + 20, zt + 24, 22, 14);
  tap(a, cx, -46, zt, 290, 150, true);
  a.rect(a.X0, -D, a.X1, 0); a.circ(cx, by, R, 'EQUIP'); a.circ(cx, by, R - 14, 'EQUIP-DETAIL'); a.circ(cx, by, 22, 'EQUIP-DETAIL');
  a.log('Added the console top, four legs, rails, round vessel bowl, drain and tall deck tap (plan and 3D).');
}
function mixerTap(a, v) {
  tap(a, a.cx, -26, a.Z0, a.H, v.reach * IN, true);
  a.log('Added the base, body, arched spout and side lever (plan and 3D).');
}
function showerHead(a, v) {
  const R = a.W / 2, cx = a.cx;
  if (v.ceil) {
    const cy = a.cy;
    a.cyl(cx, cy, a.Z1 - 10, a.Z1, 55, 20); a.tube([[cx, cy, a.Z1 - 10], [cx, cy, a.Z0 + 60]], [15, 15], 12);
    a.cyl(cx, cy, a.Z0 + 50, a.Z0 + 70, 28, 14);
    a.cyl(cx, cy, a.Z0 + 16, a.Z0 + 50, R, 36);
    a.cyl(cx, cy, a.Z0, a.Z0 + 16, R - 6, 36);
    for (const f of [0.25, 0.5, 0.75]) loop(a, cx, cy, R * f, a.Z0 - 1, 1.8, 28, 4);
    a.circ(cx, cy, R); a.circ(cx, cy, R * 0.5, 'EQUIP-DETAIL'); a.circ(cx, cy, 55, 'EQUIP-DETAIL');
  } else {
    const reach = a.D - R - 10, zf = a.Z1 - 50, hz = a.Z0 + 30;
    revolveY(a, cx, zf, 0, [[48, 0], [48, 10], [30, 22], [14, 22]], 18);
    sweep(a, [[cx, -20, zf], [cx, -reach + 70, zf], [cx, -reach + 25, zf - 15], [cx, -reach, zf - 70], [cx, -reach, hz + 40]], [13, 13, 13, 13, 13], 10);
    a.cyl(cx, -reach - 10, hz + 30, hz + 52, 22, 14);
    const hy = -reach - 10;
    if (v.sq) { a.box(cx - R, hy - R, hz, cx + R, hy + R, hz + 20); a.box(cx - R + 5, hy - R + 5, hz - 4, cx + R - 5, hy + R - 5, hz); a.rect(cx - R, hy - R, cx + R, hy + R); a.rect(cx - R + 8, hy - R + 8, cx + R - 8, hy + R - 8, 'EQUIP-DETAIL'); }
    else { a.cyl(cx, hy, hz, hz + 20, R, 36); a.cyl(cx, hy, hz - 4, hz, R - 8, 36); a.circ(cx, hy, R); a.circ(cx, hy, R * 0.55, 'EQUIP-DETAIL'); }
    a.line(cx, 0, cx, hy, 'EQUIP-DETAIL'); a.circ(cx, -10, 48, 'EQUIP-DETAIL');
  }
  a.log('Added the ' + (v.ceil ? 'ceiling flange, dropper pipe' : 'wall flange and swan-neck arm') + ' and the ' + (v.sq ? 'square' : 'round') + ' rain head with its face nozzle rings (plan and 3D).');
}
function tub(a, v) {
  const W = a.W, D = a.D, H = a.H, cx = a.cx, cy = -D / 2, wall = 70;
  if (v.alcove) {
    const o = rrect(cx, cy, W, D, 90, 4), i1 = rrect(cx + 0, cy, W - 2 * wall, D - 2 * wall, 120, 4), i2 = rrect(cx, cy, W - 2 * wall - 130, D - 2 * wall - 130, 150, 4);
    a.prism(rrect(cx, cy, W, D, 60, 4), a.Z0 + 20, a.Z1 - 130);
    ringPoly(a, o, i1, a.Z1 - 130, a.Z1); a.prism(i2, a.Z0 + 60, a.Z1 - 120);
    a.box(cx - W / 2, -D - 0, a.Z0 + 20, cx + W / 2, -D + 8, a.Z1 - 130);
    a.cyl(cx + W / 2 - 150, cy, a.Z0 + 62, a.Z0 + 66, 26, 14);
    a.box(cx - W / 2, -wall * 0.9, a.Z1 - 120, cx + W / 2, -3, a.Z1 + 24);
    a.box(cx + W / 2 - 3, cy - 28, a.Z1 - 260, cx + W / 2 + 1, cy + 28, a.Z1 - 200);
    a.poly(o); a.poly(i1, 'EQUIP-DETAIL'); a.circ(cx + W / 2 - 150, cy, 26, 'EQUIP-DETAIL'); a.line(cx - W / 2, -D + 8, cx + W / 2, -D + 8, 'EQUIP-DETAIL');
    a.log('Added the alcove tub with rolled rim, apron, sloped floor, drain and overflow (plan and 3D).');
    return;
  }
  const rx = W / 2, ry = D / 2, ftz = 90, zr = a.Z1 - 125;
  const sc = (s, n = 44) => ellPoly(cx, cy, rx * s, ry * s, n), zA = a.Z0 + ftz + 60;
  a.prism(sc(0.72), a.Z0 + ftz, zA + 6);
  shellLoft(a, sc, zA, zr, (t) => 0.78 + 0.22 * m.pow(t, 0.7), 0.07, 8);
  a.prism(sc(0.68), zA, zA + 14);
  ringPoly(a, sc(1.0), sc(0.88), zr - 20, zr);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.ell(cx + sx * rx * 0.55, cy + sy * ry * 0.5, a.Z0 + 45, 42, 42, 45, 10, 6);
  tap(a, cx - rx * 0.88 + 0, cy, zr, 120, 150, true);
  a.cyl(cx + rx * 0.45, cy, a.Z0 + ftz + 66, a.Z0 + ftz + 72, 26, 14);
  a.ellp(cx, cy, rx, ry); a.ellp(cx, cy, rx * 0.9, ry * 0.9, 'EQUIP-DETAIL'); a.ellp(cx, cy, rx * 0.8, ry * 0.8, 'EQUIP-DETAIL'); a.circ(cx + rx * 0.45, cy, 26, 'EQUIP-DETAIL'); a.circ(cx - rx * 0.88, cy, 24, 'EQUIP-DETAIL');
  a.log('Added the flared oval shell with rolled rim, sloped floor, drain, ball feet and a rim-mounted filler (plan and 3D).');
}
function wc(a, v) {
  const W = a.W, D = a.D, cx = a.cx, bl = v.bowl * IN, cL = 7.5 * IN;
  const bcy = -D + bl / 2 + 10 - 0;           // bowl centre y (front of pan)
  const bcy2 = -(D - bl / 2) + 0 > -bl / 2 ? -bl / 2 : -D + bl / 2;
  const by = -D + bl / 2, rx = W / 2 * 0.98;
  const sc = (s, n = 36) => ellPoly(cx, by, rx * s, bl / 2 * s, n);
  if (v.hung) {
    const zb = a.Z0 + 150;
    a.prism(sc(0.5), zb, zb + 80);
    shellLoft(a, sc, zb + 40, a.Z0 + 395, (t) => 0.55 + 0.45 * m.pow(t, 0.6), 0.1, 8, false);
    a.box(cx - W * 0.3, -D * 0.5, zb + 60, cx + W * 0.3, 0, zb + 220);
    ringPoly(a, sc(1.02), sc(0.78), a.Z0 + 395, a.Z0 + 425);
    a.prism(sc(1.01), a.Z0 + 425, a.Z0 + 442);
    a.box(cx - 130, -22, 34 * IN, cx + 130, 0, 40 * IN);
    a.box(cx - 100, -26, 37 * IN - 28, cx - 15, -22, 37 * IN + 28); a.box(cx + 15, -26, 37 * IN - 40, cx + 100, -22, 37 * IN + 40);
    for (const s of [-1, 1]) a.cyl(cx + s * 70, -60, a.Z0 + 440, a.Z0 + 470, 14, 8);
    a.rect(cx - 130, -22, cx + 130, 0); a.poly(sc(1.02)); a.poly(sc(0.8), 'EQUIP-DETAIL'); a.poly(sc(0.7), 'EQUIP-DETAIL');
    a.log('Added the wall-hung pan, seat and lid, hinges and the flush plate with two buttons (plan and 3D).');
    return;
  }
  a.prism(sc(0.5), a.Z0, a.Z0 + 130);
  shellLoft(a, sc, a.Z0 + 110, a.Z0 + 395, (t) => 0.55 + 0.45 * m.pow(t, 0.6), 0.1, 8, false);
  ringPoly(a, sc(1.02), sc(0.78), a.Z0 + 395, a.Z0 + 425);     // seat ring
  a.prism(sc(1.01), a.Z0 + 425, a.Z0 + 442);                    // lid
  const cy0 = -cL, zc0 = a.Z0 + 395;
  a.box(cx - rx * 0.96, cy0, a.Z0 + 120, cx + rx * 0.96, 0, zc0);                       // tank
  a.box(cx - rx, cy0, zc0 - 140, cx + rx, 0, zc0); a.box(cx - rx * 0.95, cy0 + 8, zc0, cx + rx * 0.95, -8, a.Z1 - 22);
  a.box(cx - rx * 1.0, cy0 - 6, a.Z1 - 26, cx + rx * 1.0, 6, a.Z1 - 14);
  a.box(cx - rx * 0.99, cy0 - 3, a.Z1 - 14, cx + rx * 0.99, 3, a.Z1);                  // lid of tank
  a.cyl(cx, cy0 / 2, a.Z1, a.Z1 + 14, 20, 14);                                            // flush button
  for (const s of [-1, 1]) a.cyl(cx + s * 70, -cL - 10, a.Z0 + 442, a.Z0 + 470, 13, 8);
  a.rect(cx - rx * 0.96, cy0, cx + rx * 0.96, 0); a.poly(sc(1.02)); a.poly(sc(0.78), 'EQUIP-DETAIL'); a.poly(sc(0.88), 'EQUIP-DETAIL'); a.circ(cx, cy0 / 2, 20, 'EQUIP-DETAIL');
  a.log('Added the pan, seat ring and lid, hinges, close-coupled cistern with its lid and flush button (plan and 3D).');
}
function bidet(a, v) {
  const W = a.W, D = a.D, cx = a.cx, bl = D - 80, by = -D + bl / 2, rx = W / 2;
  const sc = (s, n = 36) => ellPoly(cx, by, rx * s, bl / 2 * s, n);
  a.prism(sc(0.5), a.Z0, a.Z0 + 130);
  shellLoft(a, sc, a.Z0 + 110, a.Z0 + 380, (t) => 0.55 + 0.45 * m.pow(t, 0.6), 0.1, 8, false);
  ringPoly(a, sc(1.02), sc(0.82), a.Z0 + 380, a.Z0 + 410);
  a.prism(sc(0.8), a.Z0 + 240, a.Z0 + 380);
  a.box(cx - rx, -90, a.Z0 + 190, cx + rx, 0, a.Z0 + 410);
  a.cyl(cx, by + 20, a.Z0 + 372, a.Z0 + 392, 22, 12);
  tap(a, cx, -48, a.Z0 + 410, 130, 60, true);
  a.rect(cx - rx, -90, cx + rx, 0); a.poly(sc(1.02)); a.poly(sc(0.82), 'EQUIP-DETAIL'); a.circ(cx, by + 20, 22, 'EQUIP-DETAIL');
  a.log('Added the floor-standing bowl with rolled rim, rear deck, drain and a deck mixer tap (plan and 3D).');
}
function towelRail(a, v) {
  const W = a.W, H = a.H, n = v.rungs, cx = a.cx, y = -58;
  for (const s of [-1, 1]) a.tube([[cx + s * (W / 2 - 22), y, a.Z0 + 4], [cx + s * (W / 2 - 22), y, a.Z1 - 4]], [20, 20], 12);
  for (let i = 0; i < n; i++) { const z = a.Z0 + 60 + ((H - 120) * i) / (n - 1); a.tube([[cx - W / 2 + 22, y, z], [cx + W / 2 - 22, y, z]], [12, 12], 10); }
  for (const s of [-1, 1]) for (const zz of [a.Z0 + 60, a.Z1 - 60]) { a.box(cx + s * (W / 2 - 22) - 14, -y * 0 - 40, zz - 14, cx + s * (W / 2 - 22) + 14, -4, zz + 14); a.box(cx + s * (W / 2 - 22) - 24, -6, zz - 24, cx + s * (W / 2 - 22) + 24, 0, zz + 24); }
  a.cyl(cx + W / 2 - 22, y, a.Z0, a.Z0 + 3, 16, 8);
  a.rect(a.X0, -80, a.X1, 0); for (const s of [-1, 1]) a.circ(cx + s * (W / 2 - 22), y, 20, 'EQUIP-DETAIL'); a.line(a.X0 + 22, y, a.X1 - 22, y, 'EQUIP-DETAIL');
  a.log('Added the two uprights, ' + n + ' horizontal bars and the wall brackets (plan and 3D).');
}
function bathMirror(a, v) {
  const cx = a.cx, cz = a.Z0 + a.H / 2, t = a.D;
  if (v.round) {
    const R = a.W / 2;
    revolveY(a, cx, cz, 0, [[R - 1, 0], [R, t * 0.6], [R, t], [R - 36, t], [R - 36, t * 0.45]], 48);
    revolveY(a, cx, cz, -t * 0.2, [[0.01, 0], [R - 34, 0], [R - 34, 4]], 48);
    a.box(cx - 90, -3, cz - 14, cx + 90, 0, cz + 14);
    a.rect(cx - R, -t, cx + R, 0); a.circ(cx, -t / 2, R); a.circ(cx, -t / 2, R - 36, 'EQUIP-DETAIL');
    a.ellp(cx, -t / 2, R, t / 2);
  } else {
    a.frame(a.X0, a.Z0, a.X1, a.Z1, -t, 0, 36);
    a.box(a.X0 + 36, -t * 0.4, a.Z0 + 36, a.X1 - 36, -t * 0.4 + 5, a.Z1 - 36);
    a.box(a.X0 + 36, -2, a.Z0 + 36, a.X1 - 36, 0, a.Z1 - 36);
    a.rect(a.X0, -t, a.X1, 0); a.rect(a.X0 + 36, -t, a.X1 - 36, 0, 'EQUIP-DETAIL');
  }
  a.log('Added the ' + (v.round ? 'round frame' : 'rectangular frame') + ', mirror glass and the back cleat (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ hardware
function lever(a, v) {
  const pw = 32, sx = a.X0 + pw, zc = a.Z0 + a.H * (v.key ? 0.62 : 0.5), L = a.W - pw - 4;
  a.box(a.X0, -6, a.Z0, a.X0 + 2 * pw, 0, a.Z1);                                   // plate
  a.box(a.X0 + 3, -8, a.Z0 + 3, a.X0 + 2 * pw - 3, -6, a.Z1 - 3);
  for (const zz of [a.Z0 + 14, a.Z1 - 14]) { screwHead(a, sx, zz, -8, 3.4); }
  revolveY(a, sx, zc, -8, [[25, 0], [25, 6], [20, 12], [14, 20], [12, 30]], 24);
  a.tube([[sx, -36, zc], [sx + 12, -48, zc], [sx + L * 0.45, -52, zc], [sx + L * 0.9, -50, zc - 2], [sx + L, -46, zc - 5]], [11, 10, 8, 7.5, 7], 12);
  a.ell(sx + L, -46, zc - 5, 7, 7, 7, 8, 5);
  if (v.key) { const kz = a.Z0 + a.H * 0.22; a.cyl(sx, -7, kz - 0, kz + 0.01, 1, 3); revolveY(a, sx, kz, -8, [[11, 0], [11, 5], [8, 6]], 16); a.box(sx - 1.4, -14, kz - 6, sx + 1.4, -11, kz + 6); a.rect(sx - 11, -14, sx + 11, -6, 'EQUIP-DETAIL'); }
  a.rect(a.X0, -6, a.X0 + 2 * pw, 0); a.circ(sx, -22, 25, 'EQUIP-DETAIL'); a.line(sx, -36, sx + L, -46, 'EQUIP-DETAIL'); a.rect(sx, -56, sx + L, -42, 'EQUIP-DETAIL');
  a.log('Added the backplate with screws, round rose, bent lever' + (v.key ? ' and the key cylinder' : '') + ' (plan and 3D).');
}
function knob(a, v) {
  const R = 32, cx = a.cx, cz = a.cz ?? (a.Z0 + a.H / 2), br = v.ball * IN / 2, fl = v.flat ?? 1;
  revolveY(a, cx, cz, 0, [[R, 0], [R, 5], [R - 4, 9], [18, 11], [14, 14]], 28);
  a.tube([[cx, -10, cz], [cx, -26, cz]], [11, 11], 12);
  const t0 = 24, prof = [];
  for (let i = 0; i <= 10; i++) { const q = (i / 10) * PI; prof.push([br * m.sin(q) + 0.01, t0 + (br * fl) * (1 - m.cos(q))]); }
  revolveY(a, cx, cz, 0, prof, 28);
  a.rect(cx - R, -t0 - 2 * br * fl, cx + R, 0, 'EQUIP-DETAIL'); a.circ(cx, -t0 - br * fl, br); a.circ(cx, -5, R);
  a.log('Added the round rose, neck and the ' + (fl < 1 ? 'flattened mushroom' : 'ball') + ' knob (plan and 3D).');
}
function hinge(a, v) {
  const kr = v.kr, H = a.H, n = v.knuckles, x = a.X0 + kr, y = -kr, lw = a.W - 2 * kr, th = 2.6;
  for (let i = 0; i < n; i++) { const z0 = a.Z0 + (H * i) / n + 0.4, z1 = a.Z0 + (H * (i + 1)) / n - 0.4; a.cyl(x, y, z0, z1, kr, 14); }
  a.cyl(x, y, a.Z1 - 1.2, a.Z1, kr * 1.12, 14); a.cyl(x, y, a.Z0, a.Z0 + 1.2, kr * 1.12, 14);
  a.box(x, -th, a.Z0 + 0.4, a.X1, 0, a.Z1 - 0.4);                                    // leaf one, against the frame
  a.box(a.X0, -a.D, a.Z0 + 0.4, a.X0 + th, y, a.Z1 - 0.4);                           // leaf two swung open to 90 degrees
  const nz = v.holes; for (let i = 0; i < nz; i++) { const z = a.Z0 + (H * (i + 0.5)) / nz; screwHead(a, a.X1 - lw * 0.45, z, -th, 3.2); a.cyl(a.X0 + th, -(a.D - lw * 0.45), z - 0, z + 0.01, 1, 3); a.box(a.X0 + th, -(a.D - lw * 0.45) - 3.2, z - 3.2, a.X0 + th + 2, -(a.D - lw * 0.45) + 3.2, z + 3.2); }
  a.circ(x, y, kr); a.rect(x, -th, a.X1, 0); a.rect(a.X0, -a.D, a.X0 + th, y, 'EQUIP');
  a.log('Added ' + n + ' knuckles with pin heads, both leaves (one swung open to 90 degrees) and the countersunk screw heads (plan and 3D).');
}
function barPull(a, v) {
  const L = v.cc * IN, r = 6.35, zc = a.Z0 + a.H / 2, yb = -(a.D - r), x0 = a.cx - L / 2, x1 = a.cx + L / 2;
  for (const x of [x0, x1]) { a.cyl(x, -r * 0.5 + yb / 2 * 0, a.Z0 + a.H / 2 - 0.001, a.Z0 + a.H / 2, 0.01, 3); a.ycyl(yb, -1, x, zc, 4.6, 10); a.ycyl(-1.5, 0, x, zc, 7.5, 12); }
  a.xcyl(x0 - r * 0.9, x1 + r * 0.9, yb, zc, r, 14);
  a.ell(x0 - r * 0.9, yb, zc, r * 0.8, r, r, 8, 5); a.ell(x1 + r * 0.9, yb, zc, r * 0.8, r, r, 8, 5);
  a.rect(x0 - r, yb - r, x1 + r, yb + r); for (const x of [x0, x1]) { a.circ(x, -r * 1.0, 7.5, 'EQUIP-DETAIL'); a.line(x, yb, x, 0, 'EQUIP-DETAIL'); }
  a.log('Added the bar with rounded ends, two posts and base rosettes at ' + v.cc + ' in centres (plan and 3D).');
}
function cabKnob(a, v) {
  const cx = a.cx, cz = a.Z0 + a.H / 2;
  if (v.sq) {
    const s = a.W / 2;
    a.cyl(cx, -1, cz, cz + 0.01, 1, 3); revolveY(a, cx, cz, 0, [[8, 0], [8, 8]], 12); revolveY(a, cx, cz, 0, [[10, 0], [10, 2]], 12);
    a.box(cx - s, -a.D, cz - s, cx + s, -a.D + 12, cz + s);
    a.box(cx - s + 3, -a.D + 12, cz - s + 3, cx + s - 3, -a.D + 18, cz + s - 3);
    a.box(cx - s + 2, -a.D + 8, cz - s + 2, cx + s - 2, -8, cz + s - 2);
    a.rect(cx - s, -a.D, cx + s, -8); a.circ(cx, -4, 10, 'EQUIP-DETAIL');
  } else {
    const R = a.W / 2;
    revolveY(a, cx, cz, 0, [[10, 0], [10, 2.5], [6.5, 3], [6.5, 9]], 14);
    const pr = [[0.01, 9]]; for (let i = 0; i <= 10; i++) { const q = (i / 10) * PI / 2; pr.push([R * m.sin(q) + 0.01, 9 + 4 + (a.D - 13) * (1 - m.cos(q)) * 0.9]); }
    pr.splice(0, 1, [R * 0.55, 9]); revolveY(a, cx, cz, 0, [[R * 0.55, 9], [R * 0.9, 9 + 3], ...pr.slice(1)], 24);
    a.rect(cx - R, -a.D, cx + R, 0, 'EQUIP-DETAIL'); a.circ(cx, -4, R);
  }
  a.log('Added the mounting stem and screw, rosette and the ' + (v.sq ? 'square' : 'round mushroom') + ' knob head (plan and 3D).');
}
function closer(a, v) {
  const bl = v.body * IN, bh = 2.4 * IN, bz = a.Z0 + a.H / 2, t0 = 5;
  const bd = 1.8 * IN, x0 = a.X0, bx1 = x0 + bl;
  a.box(x0, -bd - 4, a.Z0, bx1, -4, a.Z1);                             // body
  a.box(x0 + 3, -bd - 7, a.Z0 + 4, bx1 - 3, -bd - 3, a.Z1 - 4);
  a.box(x0, -4, a.Z0 + 3, bx1, 0, a.Z1 - 3);                           // mounting plate
  a.cyl(x0 + 20, -bd - 7, a.Z0 + 14, a.Z1 - 14, 7, 10); a.cyl(bx1 - 40, -bd - 10, a.Z0 + 14, a.Z1 - 14, 7, 10);
  a.box(bx1, -bd + 2, bz - 20, bx1 + 18, -8, bz + 20);               // end cap
  const sh = [bx1 + 12, -bd * 0.55], el = [bx1 + (a.X1 - bx1) * 0.45, -a.D + 22], sho = [a.X1 - 30, -26];
  a.cyl(sh[0], sh[1], a.Z0 + 10, a.Z1 - 10, 12, 10);
  a.tube([[sh[0], sh[1], bz + 8], [el[0], el[1], bz + 8]], [8, 8], 8); a.cyl(el[0], el[1], bz - 6, bz + 22, 11, 10);
  a.tube([[el[0], el[1], bz - 3], [sho[0], sho[1], bz - 3]], [7, 7], 8); a.cyl(sho[0], sho[1], bz - 16, bz + 16, 10, 10);
  a.box(sho[0] - 20, -8, bz - 22, sho[0] + 60 > a.X1 ? a.X1 : sho[0] + 60, 0, bz + 22);
  a.rect(x0, -bd - 4, bx1, 0); a.line(sh[0], sh[1], el[0], el[1], 'EQUIP-DETAIL'); a.line(el[0], el[1], sho[0], sho[1], 'EQUIP-DETAIL'); a.circ(el[0], el[1], 11, 'EQUIP-DETAIL'); a.rect(sho[0] - 20, -8, a.X1, 0);
  a.log('Added the closer body with cover and end cap, the spindle, a two-link arm with elbow and the frame shoe (plan and 3D).');
}
function deadbolt(a, v) {
  const R = 32, cx = a.cx, cz = a.Z0 + a.H / 2;
  revolveY(a, cx, cz, 0, [[R, 0], [R, 6], [R - 5, 10], [R - 9, 16], [R - 11, 26], [R - 13, 28]], 32);
  if (v.turn) {
    a.tube([[cx, -26, cz], [cx, -34, cz]], [8, 8], 10);
    a.box(cx - 24, -46, cz - 5, cx + 24, -34, cz + 5); a.ell(cx + 24, -40, cz, 4, 6, 8, 6, 4); a.ell(cx - 24, -40, cz, 4, 6, 8, 6, 4);
    a.rect(cx - 24, -46, cx + 24, -34, 'EQUIP-DETAIL');
  } else {
    revolveY(a, cx, cz, -26, [[18, 0], [18, 4], [14, 5], [14, 6]], 20);
    a.box(cx - 1.8, -33, cz - 11, cx + 1.8, -31, cz + 11);
    a.box(cx - 6, -33, cz - 8, cx - 3, -31, cz + 3);
  }
  a.circ(cx, -14, R); a.circ(cx, -26, v.turn ? 8 : 18, 'EQUIP-DETAIL'); a.circ(cx, -14, R - 9, 'EQUIP-DETAIL');
  a.log('Added the round rose with ' + (v.turn ? 'a thumbturn' : 'a key cylinder and keyway') + ' (plan and 3D).');
}
function barrel(a, v) {
  const L = a.W, pl = L * 0.78, pz = a.Z0, ph = a.H;
  a.box(a.X0, -3, a.Z0, a.X0 + pl, 0, a.Z1);                                            // base plate
  a.box(a.X1 - 34, -3, a.Z0, a.X1, 0, a.Z1);                                             // keep plate
  const zc = a.Z0 + ph / 2, n = v.guides, yb = -14;
  for (let i = 0; i < n; i++) { const x = a.X0 + 16 + ((pl - 32) * i) / (n - 1); a.box(x - 7, -22, zc - 15, x + 7, -3, zc + 15); a.box(x - 7, -22, zc - 15, x + 7, -17, zc + 15); a.cyl(x, -10, a.Z0 + 6, a.Z0 + 8, 1, 3); }
  a.xcyl(a.X0 + L * 0.06, a.X0 + pl + L * 0.15, -12, zc, 5.5, 12);
  a.box(a.X0 + pl * 0.45 - 4, -30, zc + 4, a.X0 + pl * 0.45 + 4, -10, zc + 14); a.ell(a.X0 + pl * 0.45, -34, zc + 8, 7, 7, 7, 8, 5);
  a.box(a.X1 - 28, -22, zc - 14, a.X1 - 8, -3, zc + 14); a.box(a.X1 - 28, -22, zc - 14, a.X1 - 24, -3, zc + 14); 
  for (const x of [a.X0 + 8, a.X0 + pl - 8, a.X1 - 17]) for (const z of [a.Z0 + 5, a.Z1 - 5]) screwHead(a, x, z, -3, 2.4);
  a.rect(a.X0, -3, a.X0 + pl, 0); a.rect(a.X1 - 34, -3, a.X1, 0); a.line(a.X0 + L * 0.06, -12, a.X0 + pl + L * 0.15, -12, 'EQUIP-DETAIL'); a.rect(a.X0 + 8, -22, a.X0 + pl - 8, -3, 'EQUIP-DETAIL');
  a.log('Added the base plate, ' + n + ' guide staples, the sliding bolt with a knob, and the keep plate (plan and 3D).');
}
function mortise(a, v) {
  const fw = 25.4, cw = 19, cd = v.case * IN, ch = v.caseh * IN, d = a.D, zc = a.Z0 + a.H / 2;
  a.box(a.cx - fw / 2, -d + 12, a.Z0, a.cx + fw / 2, -d + 15, a.Z1);                     // forend plate at the door edge
  a.box(a.cx - cw / 2, -d + 15, zc - ch / 2, a.cx + cw / 2, -d + 15 + cd - 8, zc + ch / 2);            // case
  a.box(a.cx - cw / 2 - 1, -d + 15 + cd - 8, zc - ch / 2 + 4, a.cx + cw / 2 + 1, -2, zc + ch / 2 - 4);   // back plate fills the depth
  prismX(a, [[-d + 12, zc + 14 + (v.dead ? 28 : 0)], [-d + 12, zc - 14 + (v.dead ? 28 : 0)], [-d, zc - 5 + (v.dead ? 28 : 0)], [-d, zc + 5 + (v.dead ? 28 : 0)]], a.cx - 8, a.cx + 8);   // latch bolt
  if (v.dead) a.box(a.cx - 8, -d + 8, zc - 52, a.cx + 8, -d + 12, zc - 22);                          // deadbolt
  if (v.dead) a.box(a.cx - 8, -d + 4, zc - 52, a.cx + 8, -d + 8, zc - 22);
  for (const z of [a.Z0 + 10, a.Z1 - 10]) { a.cyl(a.cx, -d + 12, z, z + 0.01, 1, 3); a.box(a.cx - 4, -d + 11, z - 4, a.cx + 4, -d + 12, z + 4); }
  a.cyl(a.cx - cw / 2 - 1, -d + 15 + cd * 0.7, zc + 6, zc + 7, 1, 3);
  a.xcyl(a.cx - cw / 2 - 1.5, a.cx + cw / 2 + 1.5, -d + 15 + cd * 0.55, zc + 12, 5.5, 8);
  a.rect(a.cx - fw / 2, -d + 12, a.cx + fw / 2, -d + 15); a.rect(a.cx - cw / 2, -d + 15, a.cx + cw / 2, -2, 'EQUIP-DETAIL'); a.rect(a.cx - 8, -d, a.cx + 8, -d + 12, 'EQUIP');
  a.log('Added the forend plate with screws, the case, the sprung latch bolt' + (v.dead ? ', the deadbolt' : '') + ' and the spindle bore (plan and 3D).');
}
function pivot(a, v) {
  const cx = a.cx, cy = a.cy, R = a.W / 2;
  a.box(a.X0 + 4, a.YF + 4, a.Z0, a.X1 - 4, a.YB - 4, a.Z0 + 6);                         // floor plate
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.cyl(cx + sx * (R - 14), cy + sy * (a.D / 2 - 14), a.Z0 + 6, a.Z0 + 8, 4.6, 8);
  a.cyl(cx, cy, a.Z0 + 6, a.Z0 + 22, 15, 16); a.cyl(cx, cy, a.Z0 + 22, a.Z0 + 30, 9, 16);
  a.box(a.X0 + 10, a.YF + 10, a.Z0 + 56, a.X1 - 10, a.YB - 10, a.Z0 + 62);                // door strap above
  a.cyl(cx, cy, a.Z0 + 30, a.Z0 + 56, 11, 16);
  a.box(cx - 8, a.YF + 10, a.Z0 + 62, cx + 8, a.YB - 10, a.Z1);
  a.rect(a.X0 + 4, a.YF + 4, a.X1 - 4, a.YB - 4); a.circ(cx, cy, 15, 'EQUIP-DETAIL'); a.circ(cx, cy, 9, 'EQUIP-DETAIL');
  a.log('Added the floor plate, pivot pin, door strap and upright (plan and 3D).');
}
function hasp(a, v) {
  const L = a.W, h = a.H, zc = a.Z0 + h / 2, hl = L * 0.52;
  a.box(a.X0, -2.5, a.Z0, a.X0 + hl, 0, a.Z1);                                          // hinged leaf (left)
  a.box(a.X0 + hl * 0.5, -5.5, a.Z0 + 3, a.X1 - 2, -2.5, a.Z1 - 3);
  a.box(a.X1 - L * 0.28, -2.5, a.Z0, a.X1, 0, a.Z1);                                    // staple plate (right)
  sweep(a, arcPts([a.X1 - L * 0.1, -2.5, zc - 9], [a.X1 - L * 0.1, -a.D - 6, zc], [a.X1 - L * 0.1, -2.5, zc + 9]), new Array(11).fill(3.6), 8);
  a.cyl(a.X0 + hl, -6, a.Z0 + 2, a.Z1 - 2, 4.6, 10);
  a.box(a.X1 - L * 0.28 + 2, -4.5, zc - 8, a.X1 - 2, -2.5, zc + 8);
  for (const x of [a.X0 + 10, a.X0 + hl - 12]) for (const z of [a.Z0 + 6, a.Z1 - 6]) screwHead(a, x, z, -2.5, 2.8);
  a.rect(a.X0, -2.5, a.X0 + hl, 0); a.rect(a.X1 - L * 0.28, -2.5, a.X1, 0); a.rect(a.X0 + hl * 0.5, -5.5, a.X1 - 2, -2.5, 'EQUIP-DETAIL'); a.circ(a.X1 - L * 0.1, -10, 3.6, 'EQUIP-DETAIL');
  a.log('Added the hinged leaf with its slot, the pin knuckle, the staple plate with eye loop and the screw heads (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ fittings
function louvreGrille(a, v) {
  const t = 18, d = a.D, n = v.slats;
  a.frame(a.X0, a.Z0, a.X1, a.Z1, -d, 0, t);
  a.box(a.X0 + t, -3, a.Z0 + t, a.X1 - t, 0, a.Z1 - t);
  const ih = a.H - 2 * t;
  for (let i = 0; i < n; i++) { const z = a.Z0 + t + (ih * (i + 0.5)) / n; prismX(a, [[-d * 0.25, z - 8], [-d * 0.55, z + 4], [-d * 0.55, z + 7], [-d * 0.25, z - 5]], a.X0 + t, a.X1 - t); }
  if (v.mull) for (let k = 1; k <= v.mull; k++) { const x = a.X0 + (a.W * k) / (v.mull + 1); a.box(x - 5, -d, a.Z0 + t, x + 5, -2, a.Z1 - t); }
  for (const x of [a.X0 + t / 2, a.X1 - t / 2]) for (const z of [a.Z0 + t / 2, a.Z1 - t / 2]) screwHead(a, x, z, -d, 3);
  a.rect(a.X0, -d, a.X1, 0); a.rect(a.X0 + t, -d, a.X1 - t, 0, 'EQUIP-DETAIL');
  for (let k = 1; k <= (v.mull ?? 0); k++) a.line(a.X0 + (a.W * k) / (v.mull + 1), -d, a.X0 + (a.W * k) / (v.mull + 1), 0, 'EQUIP-DETAIL');
  a.log('Added the frame, ' + n + ' angled fixed blades' + (v.mull ? ', centre mullions' : '') + ' and the corner screws (plan and 3D).');
}
function eggcrate(a, v) {
  const t = 14, cell = 19, z0 = a.Z0, z1 = a.Z1;
  a.frame(a.X0, z0, a.X1, z1, a.YF, a.YB, 0.01);
  a.box(a.X0, a.YF, z0, a.X1, a.YF + t, z1); a.box(a.X0, a.YB - t, z0, a.X1, a.YB, z1); a.box(a.X0, a.YF, z0, a.X0 + t, a.YB, z1); a.box(a.X1 - t, a.YF, z0, a.X1, a.YB, z1);
  const nx = m.floor((a.W - 2 * t) / cell), ny = m.floor((a.D - 2 * t) / cell);
  for (let i = 1; i < nx; i++) { const x = a.X0 + t + ((a.W - 2 * t) * i) / nx; a.box(x - 0.8, a.YF + t, z0, x + 0.8, a.YB - t, z1); }
  for (let j = 1; j < ny; j++) { const y = a.YF + t + ((a.D - 2 * t) * j) / ny; a.box(a.X0 + t, y - 0.8, z0, a.X1 - t, y + 0.8, z1); }
  a.outline(); a.rect(a.X0 + t, a.YF + t, a.X1 - t, a.YB - t, 'EQUIP-DETAIL');
  for (let i = 1; i < nx; i++) a.line(a.X0 + t + ((a.W - 2 * t) * i) / nx, a.YF + t, a.X0 + t + ((a.W - 2 * t) * i) / nx, a.YB - t, 'EQUIP-DETAIL');
  for (let j = 1; j < ny; j++) a.line(a.X0 + t, a.YF + t + ((a.D - 2 * t) * j) / ny, a.X1 - t, a.YF + t + ((a.D - 2 * t) * j) / ny, 'EQUIP-DETAIL');
  a.log('Added the border and the ' + nx + ' by ' + ny + ' grid of cell blades for the return face (plan and 3D).');
}
function diffuser(a, v) {
  const cx = a.cx, cy = a.cy, z1 = a.Z1, W = a.W;
  if (v.round) {
    const R = W / 2;
    revolve(a, cx, cy, [[R, z1], [R, z1 - 5], [R - 12, z1 - 5], [R - 12, z1]], 36);
    for (let k = 0; k < 4; k++) { const ro = (R - 12) * (1 - k * 0.2), ri = ro - 6, zb = z1 - 12 - k * 11; revolve(a, cx, cy, [[ro, z1 - 5], [ri, zb], [ri - 3, zb], [ro - 3, z1 - 5]], 32); }
    revolve(a, cx, cy, [[R * 0.2, z1 - 5], [R * 0.2, a.Z0 + 8], [0.1, a.Z0 + 5]], 20);
    a.circ(cx, cy, R); for (let k = 0; k < 4; k++) a.circ(cx, cy, (R - 12) * (1 - k * 0.2), 'EQUIP-DETAIL');
  } else {
    a.box(a.X0, a.YF, z1 - 5, a.X1, a.YB, z1);
    for (let k = 0; k < 4; k++) {
      const s0 = (W - 2 * 18) * (1 - k * 0.2) / 2, s1 = s0 - 8, zb = z1 - 14 - k * 11, cyv = cy;
      const o = [[cx - s0, cyv - s0], [cx + s0, cyv - s0], [cx + s0, cyv + s0], [cx - s0, cyv + s0]];
      ringPoly(a, o, [[cx - s0 + 5, cyv - s0 + 5], [cx + s0 - 5, cyv - s0 + 5], [cx + s0 - 5, cyv + s0 - 5], [cx - s0 + 5, cyv + s0 - 5]], zb, z1 - 5);
    }
    a.box(cx - W * 0.1, cy - W * 0.1, a.Z0 + 6, cx + W * 0.1, cy + W * 0.1, a.Z0 + 14);
    a.outline(); for (let k = 0; k < 4; k++) { const s = (W - 36) * (1 - k * 0.2) / 2; a.rect(cx - s, cy - s, cx + s, cy + s, 'EQUIP-DETAIL'); }
  }
  a.log('Added the ceiling plate and ' + (v.round ? 'four nested round cones' : 'four stepped square cones') + ' with the centre plate (plan and 3D).');
}
function access(a, v) {
  const b = 32, d = a.D;
  a.frame(a.X0, a.Z0, a.X1, a.Z1, -d * 0.5, 0, b);
  a.box(a.X0 + b + 2, -d, a.Z0 + b + 2, a.X1 - b - 2, -d * 0.5 + 1, a.Z1 - b - 2);                     // door leaf
  a.box(a.X0 + b - 4, -d * 0.5 + 2, a.Z0 + b - 4, a.X0 + b + 2, 0, a.Z1 - b + 4);
  a.cyl(a.X0 + b - 1, -d * 0.5 - 3, a.Z0 + b + 6, a.Z1 - b - 6, 4.4, 10);                             // piano hinge barrel
  const lz = a.cz ?? a.Z0 + a.H / 2, lx = a.X1 - b - 24;
  revolveY(a, lx, lz, -d, [[12, 0], [12, 4], [6, 5], [6, 7]], 16); a.box(lx - 1.5, -d - 7, lz - 7, lx + 1.5, -d - 4, lz + 7);
  a.box(lx - 24, -d - 1, lz - 3, lx - 14, -d, lz + 3);
  for (const x of [a.X0 + 10, a.X1 - 10]) for (const z of [a.Z0 + 10, a.Z1 - 10]) screwHead(a, x, z, -d * 0.5, 3);
  a.rect(a.X0, -d * 0.5, a.X1, 0); a.rect(a.X0 + b, -d, a.X1 - b, -d * 0.5, 'EQUIP-DETAIL'); a.line(a.X0 + b - 1, -d * 0.5, a.X0 + b - 1, -d * 0.5 - 6, 'EQUIP-DETAIL'); a.circ(lx, -d - 4, 12, 'EQUIP-DETAIL');
  a.log('Added the wall frame, flush door leaf, piano hinge, quarter-turn latch and the screws (plan and 3D).');
}
function outlet(a, v) {
  const pw = a.W, ph = a.H, n = v.gang, gw = pw / n;
  a.box(a.X0, -3, a.Z0, a.X1, 0, a.Z1);
  a.box(a.X0 + 1.5, -3.5, a.Z0 + 1.5, a.X1 - 1.5, -3, a.Z1 - 1.5);
  for (let g = 0; g < n; g++) {
    const gx = a.X0 + gw * (g + 0.5);
    a.box(gx - gw * 0.34, -a.D + 1, a.Z0 + ph * 0.1, gx + gw * 0.34, -3.5, a.Z0 + ph * 0.9);      // receptacle body
    for (const q of [0.28, 0.72]) {
      const zq = a.Z0 + ph * q;
      a.box(gx - 5.8, -a.D, zq - 1.2, gx - 4.2, -a.D + 1, zq + 5.2); a.box(gx + 4.2, -a.D, zq - 1.2, gx + 5.8, -a.D + 1, zq + 5.2);   // blade slots
      revolveY(a, gx, zq - 6, -a.D + 1, [[2.2, 0], [2.2, 0.4]], 10);
    }
    screwHead(a, gx, a.Z0 + ph * 0.5, -a.D + 1, 2.4);
    a.rect(gx - gw * 0.34, -a.D + 1, gx + gw * 0.34, -3.5, 'EQUIP-DETAIL');
  }
  for (const z of [a.Z0 + 4, a.Z1 - 4]) for (const x of [a.cx]) screwHead(a, x, z, -3.5, 2.6);
  a.rect(a.X0, -3.5, a.X1, 0);
  a.log('Added the wall plate, ' + n + ' duplex receptacle faces with blade slots and ground holes, and the fixing screws (plan and 3D).');
}
function switchPlate(a, v) {
  const n = v.gang, gw = a.W / n;
  a.box(a.X0, -3, a.Z0, a.X1, 0, a.Z1);
  for (let g = 0; g < n; g++) {
    const gx = a.X0 + gw * (g + 0.5), rw = 16, rh = 28;
    a.box(gx - rw - 3, -4.5, a.Z0 + a.H / 2 - rh - 3, gx + rw + 3, -3, a.Z0 + a.H / 2 + rh + 3);
    prismX(a, [[-4.5, a.Z0 + a.H / 2 - rh], [-9.5, a.Z0 + a.H / 2 - rh + 4], [-9.5, a.Z0 + a.H / 2 + rh], [-4.5, a.Z0 + a.H / 2 + rh]], gx - rw, gx + rw);
    a.rect(gx - rw - 3, -4.5, gx + rw + 3, -3, 'EQUIP-DETAIL');
  }
  for (const z of [a.Z0 + 6, a.Z1 - 6]) screwHead(a, a.cx, z, -3, 2.6);
  a.rect(a.X0, -3, a.X1, 0); a.rect(a.X0 + 3, -10, a.X1 - 3, -3, 'EQUIP-DETAIL');
  a.log('Added the wall plate, ' + n + ' rocker switch' + (n > 1 ? 'es' : '') + ' in their surrounds and the two screws (plan and 3D).');
}
function curtainTrack(a, v) {
  const L = a.W, d = a.D, y = -d / 2, zb = a.Z0 + 28;
  a.box(a.X0, y - 11, a.Z1 - 20, a.X1, y + 11, a.Z1);                                                // channel top
  a.box(a.X0, y - 11, zb, a.X0 + 0.01 + L, y - 8, a.Z1 - 20); a.box(a.X0, y + 8, zb, a.X1, y + 11, a.Z1 - 20);   // channel sides
  a.box(a.X0, y - 11, zb - 3, a.X1, y - 3, zb); a.box(a.X0, y + 3, zb - 3, a.X1, y + 11, zb);                  // lips
  for (const x of [a.X0 + 1, a.X1 - 1]) a.box(x - 2, y - 12, zb - 3, x + 2, y + 12, a.Z1);
  const clips = m.max(2, m.round(L / 500) + 1);
  for (let i = 0; i < clips; i++) { const x = a.X0 + 40 + ((L - 80) * i) / (clips - 1); a.box(x - 12, y - 14, a.Z1 - 2, x + 12, y + 14, a.Z1); }
  const g = v.gliders;
  for (let i = 0; i < g; i++) {
    const x = a.X0 + 40 + ((L - 80) * i) / (g - 1);
    a.xcyl(x - 6, x + 6, y, zb + 6, 5, 8); a.tube([[x, y, zb + 5], [x, y, zb - 9], [x, y, zb - 14]], [2.2, 2.2, 3], 6);
    loop(a, x, y, 5, zb - 16, 1.6, 8, 4);
  }
  a.rect(a.X0, y - 11, a.X1, y + 11); a.line(a.X0, y - 8, a.X1, y - 8, 'EQUIP-DETAIL'); a.line(a.X0, y + 8, a.X1, y + 8, 'EQUIP-DETAIL');
  for (let i = 0; i < g; i++) a.circ(a.X0 + 40 + ((L - 80) * i) / (g - 1), y, 4, 'EQUIP-DETAIL');
  a.log('Added the channel with lips and end stops, ceiling clips and ' + g + ' gliders with hooks (plan and 3D).');
}
function pictureRail(a, v) {
  const L = a.W, zt = a.Z1, n = v.hooks, rh = 51;
  prismX(a, [[0, zt - rh], [-9, zt - rh + 4], [-18, zt - rh + 14], [-19, zt - rh + 30], [-14, zt - 4], [-6, zt], [0, zt]], a.X0, a.X1);
  for (let i = 0; i < n; i++) {
    const x = a.X0 + L * (i + 0.5) / n, fw = v.fw[i % v.fw.length] * IN, fh = v.fh[i % v.fh.length] * IN, ft = a.D - 4 - 0.01;
    a.tube([[x, -4, zt + 2], [x, -10, zt + 10], [x, -21, zt - 0], [x, -23, zt - 24], [x, -23, zt - 40]], new Array(5).fill(2.2), 6);
    const fz1 = zt - rh - 90 - 0, fz0 = fz1 - fh;
    a.frame(x - fw / 2, fz0, x + fw / 2, fz1, -24 - 6, -23, 16);                       // picture frame hanging from the hook
    a.box(x - fw / 2 + 16, -27, fz0 + 16, x + fw / 2 - 16, -26, fz1 - 16);
    a.tube([[x, -23, zt - 40], [x - fw * 0.4, -24, fz1 - 6]], [1.4, 1.4], 4); a.tube([[x, -23, zt - 40], [x + fw * 0.4, -24, fz1 - 6]], [1.4, 1.4], 4);
    a.rect(x - fw / 2, -30, x + fw / 2, -23); a.circ(x, -14, 3, 'EQUIP-DETAIL');
  }
  a.line(a.X0, -19, a.X1, -19, 'EQUIP-DETAIL'); a.rect(a.X0, -19, a.X1, 0);
  a.log('Added the moulded rail, ' + n + ' hooks over the nose and hanging picture frames on cords (plan and 3D).');
}
function rBracket(a, v) {
  const pr = v.proj * IN, rr = 22, cz = a.Z1 - 28 - rr, cy = -pr, pw = 38;
  a.box(a.cx - pw / 2, -5, a.Z0, a.cx + pw / 2, 0, a.Z1);
  for (const z of [a.Z0 + 12, a.Z1 - 12]) screwHead(a, a.cx, z, -5, 3.5);
  a.box(a.cx - 8, cy, cz - rr - 14, a.cx + 8, -5, cz - rr - 4);                                   // arm out from the plate
  a.tube([[a.cx, -6, a.Z0 + 24], [a.cx, cy, cz - rr - 6]], [7, 7], 8);                           // diagonal brace
  a.xcyl(a.X0 + 1, a.X1 - 1, cy, cz, rr, 20);
  a.box(a.cx - 10, cy - 12, cz - rr - 6, a.cx + 10, cy + 12, cz - rr + 6);
  a.xcyl(a.cx - 11, a.cx + 11, cy, cz, rr + 3.5, 20); a.xcyl(a.cx - 11, a.cx + 11, cy, cz, rr + 0.1, 8);
  a.rect(a.cx - pw / 2, -5, a.cx + pw / 2, 0); a.rect(a.X0, cy - rr, a.X1, cy + rr, 'EQUIP-DETAIL'); a.line(a.cx, -5, a.cx, cy + rr, 'EQUIP-DETAIL'); a.circ(a.cx, cy, 8, 'EQUIP-DETAIL');
  a.log('Added the wall plate with screws, the arm, the cup holding a short length of round rail and its retaining bar (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ families
export default [
  // ---- lighting
  fam({ cat: 'fixtures/lighting', title: 'Generic dome pendant light', desc: (v) => `Ceiling-hung pendant with a canopy, cord, socket cup, bulb and a hollow dome shade ${v.w} in across.`,
    vs: [['10 in', 10, 10, 30, 66], ['14 in', 14, 14, 34, 62], ['18 in', 18, 18, 38, 58]], build: dome }),
  fam({ cat: 'fixtures/lighting', title: 'Generic globe pendant light', desc: (v) => `Ceiling-hung pendant with a canopy, cord, collar and an opal globe ${v.w} in across.`,
    vs: [['8 in globe', 8, 8, 30, 66], ['12 in globe', 12, 12, 34, 62]], build: globe }),
  fam({ cat: 'fixtures/lighting', title: 'Generic drum pendant light', desc: (v) => `Ceiling-hung drum shade ${v.w} in across and ${v.sh} in deep, with rings, a diffuser disc, three hanger wires and a canopy.`,
    vs: [['12 in drum', 12, 12, 24, 72, { sh: 7 }], ['20 in drum', 20, 20, 28, 68, { sh: 9 }]], build: drum }),
  fam({ cat: 'fixtures/lighting', title: 'Generic cylinder wall sconce', desc: (v) => `Wall sconce with a plate and a ${v.w} in cylinder ${v.h} in tall with capped ends and glow openings.`,
    vs: [['4 in by 10 in', 4, 5, 10, 60], ['6 in by 14 in', 6, 7, 14, 58]], build: cylSconce }),
  fam({ cat: 'fixtures/lighting', title: 'Generic arm wall sconce', desc: (v) => v.swing ? 'Wall sconce with a plate, a jointed swing arm, a conical shade and a candle bulb; the swing arc is shown in plan.' : 'Wall sconce with a plate, a curved fixed arm, a conical shade and a candle bulb.',
    vs: [['fixed arm, 10 in reach', 8, 10, 14, 60], ['swing arm, 16 in reach', 18, 17, 12, 60, { swing: true }]], build: armSconce }),
  fam({ cat: 'fixtures/lighting', title: 'Generic recessed downlight', desc: (v) => `Ceiling downlight with a ${v.sq ? 'square' : 'round'} trim flange, reflector cone, lens and housing can above the ceiling line.`,
    vs: [['4 in round', 4.5, 4.5, 6, 95], ['6 in round', 6.5, 6.5, 7, 95], ['6 in square', 6.5, 6.5, 7, 95, { sq: true }]], build: downlight }),
  fam({ cat: 'fixtures/lighting', title: 'Generic track light', desc: (v) => `Ceiling track with end caps and ${v.heads} adjustable heads, each with an adapter, yoke, barrel and lens.`,
    vs: [['2 ft, two heads', 24, 8, 9, 87, { heads: 2 }], ['4 ft, three heads', 48, 8, 9, 87, { heads: 3 }], ['8 ft, five heads', 96, 8, 9, 87, { heads: 5 }]], build: track }),
  fam({ cat: 'fixtures/lighting', title: 'Generic candle chandelier', desc: (v) => `Chandelier with a canopy, chain, turned column, ring and ${v.arms} curved arms ending in cups and candle lamps.`,
    vs: [['six arm, 24 in', 24, 24, 36, 60, { arms: 6 }], ['eight arm, 30 in', 30, 30, 42, 54, { arms: 8 }], ['twelve arm, 36 in', 36, 36, 48, 48, { arms: 12 }]], build: chandelier }),
  fam({ cat: 'fixtures/lighting', title: 'Generic bulkhead wall light', desc: 'Wall light with a base plate, an oval guard dome with grille bars and corner screws.',
    vs: [['round, 8 in', 8, 4.5, 8, 84], ['oval, 12 in', 12, 5, 8, 84]], build: bulkhead }),
  fam({ cat: 'fixtures/lighting', title: 'Generic floor lamp', desc: (v) => v.kind === 'arc' ? 'Floor lamp with a weighted disc base, a rising stem, a long arching arm and a dome shade at the end.' : v.kind === 'torch' ? 'Floor lamp with a disc base, a slim stem and an upward-facing bowl shade.' : 'Floor lamp with three splayed legs, a hub and a straight-sided drum shade.',
    vs: [['arc, 60 in reach', 60, 16, 78, 0, { kind: 'arc', arc: true }], ['torchiere, 72 in', 14, 14, 72, 0, { kind: 'torch' }], ['tripod, 62 in', 24, 24, 62, 0, { kind: 'tripod' }]], build: floorLamp }),

  // ---- bath
  fam({ cat: 'fixtures/bath', title: 'Generic pedestal basin', desc: (v) => `Basin ${v.w} in wide with a rolled rim, bowl, drain, rear splash, round pedestal and a single-lever deck tap.`,
    vs: [['18 in', 18, 16, 40, 0, { rim: 34 }], ['22 in', 22, 18, 40, 0, { rim: 34 }], ['24 in', 24, 20, 40, 0, { rim: 34 }]], build: pedestal }),
  fam({ cat: 'fixtures/bath', title: 'Generic wall-hung basin', desc: (v) => `Wall-hung basin ${v.w} in wide with a bowl, rear splash, deck tap and an exposed chrome bottle trap.`,
    vs: [['20 in', 20, 17, 18, 21, { rim: 12 }], ['30 in', 30, 19, 18, 21, { rim: 12 }]], build: wallBasin }),
  fam({ cat: 'fixtures/bath', title: 'Generic vessel basin console', desc: (v) => `Console with a ${v.w} in top, four legs and rails, a ${v.bowl} in round vessel bowl and a tall deck tap.`,
    vs: [['24 in top, 14 in bowl', 24, 18, 45, 0, { bowl: 14 }], ['30 in top, 16 in bowl', 30, 18, 45, 0, { bowl: 16 }]], build: vessel }),
  fam({ cat: 'fixtures/bath', title: 'Generic single-lever deck tap', desc: (v) => `Deck tap with a base, body, arched spout reaching ${v.reach} in and a side lever.`,
    vs: [['low spout', 3, 6, 5, 0, { reach: 4 }], ['mid-rise spout', 3, 8, 9, 0, { reach: 6 }]], build: mixerTap }),
  fam({ cat: 'fixtures/bath', title: 'Generic rain shower head', desc: (v) => v.ceil ? 'Ceiling-mounted rain head with a flange, dropper pipe and a round face with nozzle rings.' : `Wall-mounted rain head with a flange, swan-neck arm and a ${v.sq ? 'square' : 'round'} face with nozzle rings.`,
    vs: [['8 in round, wall arm', 8, 16, 8, 76], ['12 in square, wall arm', 12, 18, 8, 76, { sq: true }], ['10 in round, ceiling dropper', 10, 10, 16, 80, { ceil: true }]], build: showerHead }),
  fam({ cat: 'fixtures/bath', title: 'Generic bath tub', desc: (v) => v.alcove ? 'Alcove tub with a rolled rim, finished apron, sloped floor, drain, overflow plate and a back ledge.' : 'Freestanding oval tub with a flared shell, rolled rim, sloped floor, drain, ball feet and a rim-mounted filler.',
    vs: [['freestanding oval, 60 in', 60, 32, 28, 0], ['freestanding oval, 70 in', 70, 34, 29, 0], ['alcove, 60 in', 60, 30, 20, 0, { alcove: true }]], build: tub }),
  fam({ cat: 'fixtures/bath', title: 'Generic toilet', desc: (v) => v.hung ? 'Wall-hung toilet pan with a seat, lid and hinges, plus a wall flush plate with two buttons.' : `Close-coupled toilet with a ${v.round ? 'round' : 'elongated'} bowl, seat ring, lid, hinges and a cistern with a lid and flush button.`,
    vs: [['close-coupled, round bowl', 14, 26, 30, 0, { bowl: 17.5, round: true }], ['close-coupled, elongated bowl', 14.5, 29, 30, 0, { bowl: 20.5 }], ['wall-hung with flush plate', 14.5, 22, 40, 0, { bowl: 22, hung: true }]], build: wc }),
  fam({ cat: 'fixtures/bath', title: 'Generic bidet', desc: 'Floor-standing bidet with a rolled-rim bowl, rear deck, drain and a deck mixer tap.',
    vs: [['standard, 14 in', 14.5, 23, 21.5, 0], ['compact, 13 in', 13.5, 20, 21.5, 0]], build: bidet }),
  fam({ cat: 'fixtures/bath', title: 'Generic towel rail', desc: (v) => `Ladder-style towel rail with two uprights, ${v.rungs} horizontal bars and wall brackets, ${v.w} in wide.`,
    vs: [['ladder, 20 in by 30 in', 20, 3, 30, 10, { rungs: 5 }], ['ladder, 24 in by 40 in', 24, 3, 40, 10, { rungs: 7 }], ['ladder, 24 in by 52 in', 24, 3, 52, 10, { rungs: 9 }]], build: towelRail }),
  fam({ cat: 'fixtures/bath', title: 'Generic bathroom mirror', desc: (v) => v.round ? 'Round mirror with a raised frame, glass and a back cleat.' : 'Rectangular mirror with a frame, glass and a back cleat.',
    vs: [['round, 24 in', 24, 1.5, 24, 48, { round: true }], ['rectangular, 24 in by 36 in', 24, 1.5, 36, 46]], build: bathMirror }),

  // ---- hardware
  fam({ cat: 'fixtures/hardware', title: 'Generic lever handle on plate', desc: (v) => `Door lever on a ${v.h} in backplate: screws, round rose, bent lever${v.key ? ' and a key cylinder' : ''}.`,
    vs: [['short plate, 6 in', 6.2, 2.9, 6, 36], ['long plate, 8 in', 6.2, 2.9, 8, 34], ['long plate with key cylinder, 10 in', 6.6, 2.9, 10, 32, { key: true }]], build: lever }),
  fam({ cat: 'fixtures/hardware', title: 'Generic door knob', desc: (v) => `Door knob on a round rose with a neck and a ${v.flat ? 'flattened mushroom' : 'ball'} head ${v.ball} in across.`,
    vs: [['ball, 2.25 in', 2.6, 3.3, 2.6, 36, { ball: 2.25 }], ['mushroom, 2.5 in', 2.6, 2.8, 2.6, 36, { ball: 2.5, flat: 0.7 }]], build: knob }),
  fam({ cat: 'fixtures/hardware', title: 'Generic butt hinge', desc: (v) => `Butt hinge ${v.h} in tall with ${v.knuckles} knuckles, pin heads and countersunk screws, one leaf swung open to 90 degrees.`,
    vs: [['3 in', 1.6, 1.6, 3, 40, { kr: 5.5, knuckles: 5, holes: 3 }], ['4 in', 1.9, 1.9, 4, 40, { kr: 6.3, knuckles: 5, holes: 4 }], ['5 in', 2.2, 2.2, 5, 40, { kr: 7, knuckles: 5, holes: 4 }]], build: hinge }),
  fam({ cat: 'fixtures/hardware', title: 'Generic cabinet bar pull', desc: (v) => `Cabinet bar pull for ${v.cc} in hole centres: a round bar with rounded ends on two posts with base rosettes.`,
    vs: [['3 in centres', 4, 1.25, 0.75, 30, { cc: 3 }], ['5 in centres', 6, 1.25, 0.75, 30, { cc: 5 }], ['8 in centres', 9, 1.25, 0.75, 30, { cc: 8 }], ['12 in centres', 13, 1.25, 0.75, 30, { cc: 12 }]], build: barPull }),
  fam({ cat: 'fixtures/hardware', title: 'Generic cabinet knob', desc: (v) => `Cabinet knob with a stem and rosette and a ${v.sq ? 'square' : 'round mushroom'} head.`,
    vs: [['round, 1.25 in', 1.25, 1.15, 1.25, 30], ['square, 1.5 in', 1.5, 1.0, 1.5, 30, { sq: true }]], build: cabKnob }),
  fam({ cat: 'fixtures/hardware', title: 'Generic surface door closer', desc: (v) => `Surface closer with a ${v.body} in body, cover, end cap, spindle and a two-link arm with an elbow and frame shoe.`,
    vs: [['9 in body', 20, 4, 2.4, 80, { body: 9 }], ['11 in body', 24, 4, 2.6, 80, { body: 11 }]], build: closer }),
  fam({ cat: 'fixtures/hardware', title: 'Generic deadbolt', desc: (v) => `Deadbolt on a round rose with ${v.turn ? 'a thumbturn' : 'a key cylinder and keyway'}.`,
    vs: [['key cylinder side', 2.6, 1.9, 2.6, 42], ['thumbturn side', 2.6, 1.9, 2.6, 42, { turn: true }]], build: deadbolt }),
  fam({ cat: 'fixtures/hardware', title: 'Generic barrel bolt', desc: (v) => `Surface barrel bolt with a base plate, ${v.guides} guide staples, a sliding bolt with a knob and a keep plate.`,
    vs: [['4 in', 4, 1.4, 1.5, 48, { guides: 2 }], ['8 in', 8, 1.4, 1.6, 48, { guides: 3 }]], build: barrel }),
  fam({ cat: 'fixtures/hardware', title: 'Generic mortise lock case', desc: (v) => `Mortise lock with a screwed forend, case, sprung latch bolt${v.dead ? ', a deadbolt' : ''} and a spindle bore.`,
    vs: [['latch, 8 in forend', 1, 5, 8, 36, { case: 3.5, caseh: 5.5 }], ['latch and deadbolt, 9 in forend', 1, 5, 9, 36, { case: 3.5, caseh: 6, dead: true }]], build: mortise }),
  fam({ cat: 'fixtures/hardware', title: 'Generic floor pivot hinge', desc: 'Pivot hinge with a screwed floor plate, a pivot pin, a door strap above and an upright.',
    vs: [['offset, 3 in plate', 3, 3, 3.5, 0]], build: pivot }),
  fam({ cat: 'fixtures/hardware', title: 'Generic hasp and staple', desc: (v) => `Hinged hasp ${v.w} in long with a slotted leaf, pin knuckle, screws and a staple plate with an eye loop.`,
    vs: [['4 in', 4, 0.9, 1.25, 40], ['6 in', 6, 0.9, 1.5, 40]], build: hasp }),

  // ---- fittings
  fam({ cat: 'fixtures/fittings', title: 'Generic louvred wall grille', desc: (v) => `Wall grille ${v.w} in by ${v.h} in with a frame, ${v.slats} angled fixed blades${v.mull ? ' and centre mullions' : ''} and corner screws.`,
    vs: [['8 in by 4 in', 8, 0.8, 4, 78, { slats: 5 }], ['12 in by 6 in', 12, 0.8, 6, 78, { slats: 8 }], ['20 in by 8 in', 20, 0.8, 8, 78, { slats: 12, mull: 1 }], ['30 in by 10 in', 30, 0.8, 10, 78, { slats: 16, mull: 2 }]], build: louvreGrille }),
  fam({ cat: 'fixtures/fittings', title: 'Generic egg-crate return grille', desc: (v) => `Ceiling return grille ${v.w} in square with a border and a grid of cell blades, shown in plan as the grid.`,
    vs: [['16 in', 16, 16, 1.5, 94.5], ['24 in', 24, 24, 1.5, 94.5]], build: eggcrate }),
  fam({ cat: 'fixtures/fittings', title: 'Generic ceiling diffuser', desc: (v) => `Ceiling diffuser ${v.w} in across with a plate, four nested ${v.round ? 'round' : 'stepped square'} cones and a centre plate.`,
    vs: [['12 in square', 12, 12, 2.5, 93.5], ['24 in square', 24, 24, 2.5, 93.5], ['12 in round cones', 12, 12, 2.5, 93.5, { round: true }]], build: diffuser }),
  fam({ cat: 'fixtures/fittings', title: 'Generic wall access panel', desc: (v) => `Access panel with a wall frame, a flush door leaf ${v.w - 2.5} in square, a piano hinge, quarter-turn latch and screws.`,
    vs: [['12 in door', 14.5, 1.1, 14.5, 48], ['18 in door', 20.5, 1.1, 20.5, 48], ['24 in door', 26.5, 1.1, 26.5, 48]], build: access }),
  fam({ cat: 'fixtures/fittings', title: 'Generic receptacle plate', desc: (v) => `Wall plate with ${v.gang === 1 ? 'one duplex receptacle' : 'two duplex receptacles'}, blade slots, ground holes and screws.`,
    vs: [['one gang', 2.8, 0.65, 4.5, 16, { gang: 1 }], ['two gang', 4.6, 0.65, 4.5, 16, { gang: 2 }]], build: outlet }),
  fam({ cat: 'fixtures/fittings', title: 'Generic rocker switch plate', desc: (v) => `Wall plate with ${v.gang} rocker switch${v.gang > 1 ? 'es' : ''} in surrounds and two screws.`,
    vs: [['one gang', 2.8, 0.5, 4.5, 44, { gang: 1 }], ['two gang', 4.6, 0.5, 4.5, 44, { gang: 2 }], ['three gang', 6.4, 0.5, 4.5, 44, { gang: 3 }]], build: switchPlate }),
  fam({ cat: 'fixtures/fittings', title: 'Generic ceiling curtain track', desc: (v) => `Ceiling channel track with lips, end stops, ceiling clips and ${v.gliders} gliders with hooks.`,
    vs: [['5 ft', 60, 1, 2.5, 93.5, { gliders: 10 }], ['8 ft', 96, 1, 2.5, 93.5, { gliders: 16 }], ['12 ft', 144, 1, 2.5, 93.5, { gliders: 24 }]], build: curtainTrack }),
  fam({ cat: 'fixtures/fittings', title: 'Generic picture rail', desc: (v) => `Moulded rail ${v.w} in long with ${v.hooks} hooks over the nose and framed pictures hanging on cords.`,
    vs: [['4 ft, two pictures', 48, 1.25, 18, 66, { hooks: 2, fw: [8], fh: [10] }], ['8 ft, three pictures', 96, 1.25, 22, 62, { hooks: 3, fw: [8, 12, 8], fh: [10, 16, 10] }]], build: pictureRail }),
  fam({ cat: 'fixtures/fittings', title: 'Generic handrail bracket', desc: (v) => `Wall bracket with a screwed plate, arm and cup carrying a round rail stub, standing off ${v.proj} in from the wall.`,
    vs: [['3 in projection', 4, 3.9, 5, 60, { proj: 3 }], ['3.5 in projection', 4, 4.4, 5, 60, { proj: 3.5 }], ['5 in projection', 4, 5.9, 6, 58, { proj: 5 }]], build: rBracket }),
];

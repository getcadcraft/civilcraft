/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, speedrun (150 more: new families only). Original geometry; generic shapes, no franchise, character, brand or game. */
import { fam, cab, tbl, T } from './r4-kit.mjs';

const IN = 25.4, m = Math, TAU = m.PI * 2;
const C = (n, lo, hi) => m.max(lo, m.min(hi, n));

// ------------------------------------------------------------------------------------------ helpers
/** twice the signed area of a polygon (positive = counter-clockwise) */
function area2(p) { let s = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; s += p[i][0] * q[1] - q[0] * p[i][1]; } return s; }
/** extrude a convex polygon given as [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length; if (area2(poly) < 0) poly = poly.slice().reverse();
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** extrude a convex polygon given as [x, z] points between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length; if (area2(poly) > 0) poly = poly.slice().reverse();
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** extrude a star-shaped (not necessarily convex) polygon [x,y] between z0 and z1, fanned from its centre */
function prismS(a, poly, z0, z1) {
  const n = poly.length, cx = poly.reduce((s, p) => s + p[0], 0) / n, cy = poly.reduce((s, p) => s + p[1], 0) / n;
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[cx, cy, z0], [q[0], q[1], z0], [p[0], p[1], z0]], [[cx, cy, z1], [p[0], p[1], z1], [q[0], q[1], z1]], [[p[0], p[1], z0], [q[0], q[1], z0], [q[0], q[1], z1]], [[p[0], p[1], z0], [q[0], q[1], z1], [p[0], p[1], z1]]); }
  return a;
}
/** a star outline with n points, outer radius ro, inner ri */
function starPts(cx, cy, ro, ri, n = 5, rot = 0) { const o = []; for (let i = 0; i < n * 2; i++) { const r = i % 2 ? ri : ro, t = rot + (i * m.PI) / n; o.push([cx + r * m.cos(t), cy + r * m.sin(t)]); } return o; }
/** a body of revolution about the vertical axis at (cx, cy): prof = [[z above z0, radius], …] bottom to top */
function lathe(a, cx, cy, z0, prof, seg = 20) { a.tube(prof.map(([z]) => [cx, cy, z0 + z]), prof.map(([, r]) => m.max(r, 0.01)), seg); return a; }
/** a body of revolution about a lateral (x) axis */
function latheX(a, y, z, x0, prof, seg = 16) { a.tube(prof.map(([x]) => [x0 + x, y, z]), prof.map(([, r]) => m.max(r, 0.01)), seg); return a; }
/** a ring of n small boxes (merlons, studs, teeth) at radius r, half-size s, height h from z0 */
function ringOf(a, cx, cy, r, n, z0, h, s, rot = 0) { for (let i = 0; i < n; i++) { const t = rot + (i * TAU) / n, x = cx + r * m.cos(t), y = cy + r * m.sin(t); a.box(x - s, y - s, z0, x + s, y + s, z0 + h); } }
/** a cone along y from y0 (base radius r) to y1 (tip) at (x, z) */
function ycone(a, y0, y1, x, z, r) { a.tube([[x, y0, z], [x, y1, z]], [r, 0.01], 12); }
/** convex polyhedron from a point set: every plane with all points on one side becomes a (fan-triangulated) face */
function hull(a, P, sx = 1, ox = 0, oy = 0, oz = 0) {
  const n = P.length, seen = new Set(), faces = [], sub = (u, v) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]], cr = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], dt = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const cen = [0, 1, 2].map((k) => P.reduce((s, p) => s + p[k], 0) / n);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
    let nv = cr(sub(P[j], P[i]), sub(P[k], P[i])); const L = m.hypot(...nv); if (L < 1e-9) continue; nv = nv.map((x) => x / L);
    const d = dt(nv, P[i]); let pos = 0, neg = 0; const on = [];
    for (let q = 0; q < n; q++) { const e = dt(nv, P[q]) - d; if (e > 1e-6) pos++; else if (e < -1e-6) neg++; else on.push(q); }
    if (pos && neg) continue;
    const key = on.join(','); if (seen.has(key)) continue; seen.add(key);
    if (dt(nv, sub(cen, P[i])) > 0) nv = nv.map((x) => -x);
    const c0 = [0, 1, 2].map((q) => on.reduce((s, p) => s + P[p][q], 0) / on.length);
    const ref = m.abs(nv[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0], u0 = cr(nv, ref), ul = m.hypot(...u0), u = u0.map((x) => x / ul), w = cr(nv, u);
    on.sort((p, q) => m.atan2(dt(sub(P[p], c0), w), dt(sub(P[p], c0), u)) - m.atan2(dt(sub(P[q], c0), w), dt(sub(P[q], c0), u)));
    const T3 = (p) => [ox + P[p][0] * sx, oy + P[p][1] * sx, oz + P[p][2] * sx];
    for (let q = 1; q < on.length - 1; q++) a.t.push([T3(on[0]), T3(on[q]), T3(on[q + 1])]);
    faces.push({ c: [ox + c0[0] * sx, oy + c0[1] * sx, oz + c0[2] * sx], n: nv });
  }
  return faces;
}
/** a ball */
function ball(a, x, y, z, r, nu = 12, nv = 7) { a.ell(x, y, z, r, r, r, nu, nv); }
/** a wheel on a lateral axle at (x, y), radius r, centre height z, width w, with hub */
function whl(a, x, y, z, r, w) { a.xcyl(x - w / 2, x + w / 2, y, z, r, 16); a.xcyl(x - w / 2 - 3, x + w / 2 + 3, y, z, r * 0.45, 10); a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL'); }
/** a post-and-rail from (x0,y0) to (x1,y1) */
function rail(a, x0, y0, x1, y1, z0, z1, t = 14, posts = 3) {
  a.tube([[x0, y0, z1], [x1, y1, z1]], [t, t], 6);
  for (let i = 0; i < posts; i++) { const f = posts === 1 ? 0 : i / (posts - 1); a.tube([[x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z0], [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z1]], [t * 0.8, t * 0.8], 6); }
  a.line(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
/** seven-segment digit made of boxes in the X-Z plane facing -Y; x,z = lower left; w,h = size; t = bar width; y = front face */
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
function digit(a, ch, x, z, w, h, t, y) {
  const s = SEG[ch] || '', d = m.max(8, h * 0.06), bar = (x0, z0, x1, z1) => a.box(x0, y - d, z0, x1, y, z1), hh = h / 2;
  if (s.includes('a')) bar(x + t, z + h - t, x + w - t, z + h); if (s.includes('g')) bar(x + t, z + hh - t / 2, x + w - t, z + hh + t / 2); if (s.includes('d')) bar(x + t, z, x + w - t, z + t);
  if (s.includes('f')) bar(x, z + hh, x + t, z + h - t); if (s.includes('b')) bar(x + w - t, z + hh, x + w, z + h - t); if (s.includes('e')) bar(x, z + t, x + t, z + hh); if (s.includes('c')) bar(x + w - t, z + t, x + w, z + hh);
}
/** extrude a star-shaped polygon given as [x, z] points between y0 and y1 (facing -Y) */
function prismSY(a, poly, y0, y1) {
  const n = poly.length, cx = poly.reduce((s, p) => s + p[0], 0) / n, cz = poly.reduce((s, p) => s + p[1], 0) / n;
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[cx, y0, cz], [p[0], y0, p[1]], [q[0], y0, q[1]]], [[cx, y1, cz], [q[0], y1, q[1]], [p[0], y1, p[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [q[0], y0, q[1]]], [[p[0], y0, p[1]], [p[0], y1, p[1]], [q[0], y1, q[1]]]); }
  return a;
}
/** a curved band (annular sector) about centre (x0, y0) from radius r0 to r1 between angles t0..t1 (radians), z0..z1, in steps convex quads */
function arcBand(a, x0, y0, r0, r1, t0, t1, z0, z1, steps = 12) {
  for (let i = 0; i < steps; i++) {
    const s = t0 + ((t1 - t0) * i) / steps, e = t0 + ((t1 - t0) * (i + 1)) / steps, p = [[x0 + r0 * m.cos(s), y0 + r0 * m.sin(s)], [x0 + r1 * m.cos(s), y0 + r1 * m.sin(s)], [x0 + r1 * m.cos(e), y0 + r1 * m.sin(e)], [x0 + r0 * m.cos(e), y0 + r0 * m.sin(e)]];
    a.prism(area2(p) < 0 ? p.slice().reverse() : p, z0, z1);
  }
}
/** a one-piece wheel on a lateral axle: tyre, rim and hub */
function tyre(a, x, y, z, r, w) { a.xcyl(x - w / 2, x + w / 2, y, z, r, 18); a.xcyl(x - w / 2 - 2, x + w / 2 + 2, y, z, r * 0.55, 12); a.xcyl(x - w / 2 - 4, x + w / 2 + 4, y, z, r * 0.2, 8); a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL'); }
/** a monitor panel facing -Y: bezel frame, screen, from (x, z) lower left, width w, height h, front face y */
function panel(a, x, z, w, h, y, th) { a.box(x, y, z, x + w, y + th, z + h); a.frame(x - 2, z - 2, x + w + 2, z + h + 2, y - 2, y + 4, w * 0.012 + 2); a.box(x + w * 0.012, y - 3, z + w * 0.012, x + w - w * 0.012, y - 2, z + h - w * 0.012); }

/** a horizontal ring (torus-ish) about a vertical axis: centre (x, y, z), ring radius R, tube radius r */
function ringXY(a, x, y, z, R, r, seg = 20) { a.tube(Array.from({ length: seg + 1 }, (_, i) => [x + R * m.cos((i / seg) * TAU), y + R * m.sin((i / seg) * TAU), z]), Array(seg + 1).fill(r), 6); }
/** a ring in the X-Z plane (facing -Y) */
function ringXZ(a, x, y, z, R, r, seg = 24) { a.tube(Array.from({ length: seg + 1 }, (_, i) => [x + R * m.cos((i / seg) * TAU), y, z + R * m.sin((i / seg) * TAU)]), Array(seg + 1).fill(r), 6); }
/** a rounded dome (mouse, handheld body): rings of an ellipse stepping in, convex hull. top ring pushed back by hump (0..1) */
function dome(a, cx, cy, z0, rx, ry, h, hump = 0.25, n = 14) {
  const P = []; for (const [f, s, sh] of [[0, 1, 0], [0.45, 0.98, 0], [0.8, 0.82, hump * 0.5], [1, 0.5, hump]]) for (let i = 0; i < n; i++) { const t = (i / n) * TAU; P.push([cx + rx * s * m.cos(t), cy + ry * s * m.sin(t) + ry * sh, z0 + h * f]); } return hull(a, P);
}
/** three splayed tripod legs from (cx, cy, zTop) to a foot circle of radius R at z0 */
function legs3(a, cx, cy, zTop, z0, R, r = 12) { for (let i = 0; i < 3; i++) { const t = (i / 3) * TAU + m.PI / 2; a.tube([[cx, cy, zTop], [cx + R * m.cos(t), cy + R * m.sin(t), z0 + r]], [r, r * 0.8], 6); a.cyl(cx + R * m.cos(t), cy + R * m.sin(t), z0, z0 + r * 1.2, r * 1.1, 8); } }
/** star base of five feet with casters-ish bumps */
function star5(a, cx, cy, z0, R, r = 14) { for (let i = 0; i < 5; i++) { const t = (i / 5) * TAU + m.PI / 2, x = cx + R * m.cos(t), y = cy + R * m.sin(t); a.tube([[cx, cy, z0 + r * 1.6], [x, y, z0 + r * 1.2]], [r * 1.1, r * 0.8], 6); a.cyl(x, y, z0, z0 + r * 1.6, r * 0.9, 8); } }
/** a small cup for shelves: foot, stem, bowl, two ear handles */
function cup(a, x, y, z, h, rad) { lathe(a, x, y, z, [[0, rad * 0.5], [h * 0.06, rad * 0.5], [h * 0.1, rad * 0.14], [h * 0.38, rad * 0.14], [h * 0.46, rad * 0.4], [h * 0.82, rad * 0.55], [h, rad * 0.5]], 14); for (const s of [-1, 1]) a.tube([[x + s * rad * 0.5, y, z + h * 0.78], [x + s * rad * 0.9, y, z + h * 0.7], [x + s * rad * 0.75, y, z + h * 0.52]], [rad * 0.06, rad * 0.06, rad * 0.06], 5); }
const TC = (n) => n;

export default [
// ============================================================================================ speedrun/setups
fam({ cat: 'speedrun/setups', title: 'Generic rolling drawer pedestal, under-desk',
  desc: (v) => `Under-desk pedestal on four casters: a carcass with ${v.n} drawer fronts, a bar handle on each, a key lock on the top drawer${v.cush ? ' and a padded seat top' : ''}.`,
  vs: [
    ['2 drawers, 15 in wide', 15, 20, 17, 0, { n: 2 }],
    ['3 drawers, 15 in wide', 15, 20, 24, 0, { n: 3 }],
    ['3 drawers, 18 in wide and 24 in deep', 18, 24, 25, 0, { n: 3 }],
    ['4 drawers, 18 in wide', 18, 24, 30, 0, { n: 4 }],
    ['5 drawers, 18 in wide, tall', 18, 24, 36, 0, { n: 5 }],
    ['2 drawers with padded seat top', 16, 20, 20, 0, { n: 2, cush: true }],
    ['3 drawers, locking steel, 20 in wide', 20, 26, 28, 0, { n: 3, steel: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, t = 0.75 * IN, zb = Z0 + 2 * IN, zt = Z0 + H - (v.cush ? 2.5 * IN : 0), dh = (zt - zb - 0.5 * IN) / v.n;
    a.box(X0, YF + t, zb, X1, YB, zt); a.box(X0 - 0.3 * IN, YF + t, zt - 0.8 * IN, X1 + 0.3 * IN, YB, zt); a.outline(); a.rect(X0 + 0.5 * IN, YF + t, X1 - 0.5 * IN, YB - 0.5 * IN, 'EQUIP-HIDDEN');
    for (let i = 0; i < v.n; i++) { const z0 = zb + 0.3 * IN + i * dh, z1 = z0 + dh - 0.25 * IN; a.box(X0 + 0.25 * IN, YF, z0, X1 - 0.25 * IN, YF + t, z1); const zm = (z0 + z1) / 2 + (v.steel ? 0 : 0.2 * IN); for (const s of [-1, 1]) a.box(cx + s * W * 0.28 - 0.25 * IN, YF - 0.9 * IN, zm - 0.3 * IN, cx + s * W * 0.28 + 0.25 * IN, YF, zm + 0.3 * IN); a.box(cx - W * 0.28, YF - 1.1 * IN, zm - 0.3 * IN, cx + W * 0.28, YF - 0.8 * IN, zm + 0.3 * IN); }
    a.ycyl(YF - 0.5 * IN, YF, cx + W * 0.32, zb + 0.3 * IN + (v.n - 1) * dh + dh * 0.82, 0.35 * IN, 10);
    if (v.cush) a.ell(cx, (YF + YB) / 2, zt + 0.8 * IN, W * 0.46, D * 0.46, 1.6 * IN, 16, 6);
    for (const x of [X0 + 1.2 * IN, X1 - 1.2 * IN]) for (const y of [YF + 2 * IN, YB - 2 * IN]) { a.cyl(x, y, zb - 0.8 * IN, zb, 0.7 * IN, 8); a.xcyl(x - 0.25 * IN, x + 0.25 * IN, y, Z0 + 0.8 * IN, 0.8 * IN, 10); }
    for (let i = 0; i < v.n; i++) a.line(X0 + 0.25 * IN, YF + 0.1 * IN, X1 - 0.25 * IN, YF + 0.1 * IN, 'EQUIP-DETAIL');
    a.log('Added the carcass, drawer fronts with bar handles, lock, casters and the seat pad where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/setups', title: 'Generic legless floor gaming chair',
  desc: (v) => `Floor chair with no legs: a thick seat pad, a ${v.rock ? 'rocker base with two curved skids, ' : ''}reclined back with a headrest pillow, two arm pads on tube supports${v.kids ? ' and a lower back for small players' : ''}.`,
  vs: [
    ['standard, 20 in', 20, 24, 26, 0, {}],
    ['wide, 24 in', 24, 26, 28, 0, {}],
    ['with rocker base, 20 in', 20, 28, 26, 0, { rock: true }],
    ['kids size, 16 in', 16, 18, 20, 0, { kids: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, sb = v.rock ? 3 * IN : 0, sz = Z0 + sb + 4.5 * IN * (v.kids ? 0.8 : 1);
    if (v.rock) for (const s of [-1, 1]) { const x = cx + s * W * 0.36; a.tube([[x, YF + 1.5 * IN, Z0 + 2.2 * IN], [x, YF + D * 0.25, Z0 + 0.6 * IN], [x, yc, Z0 + 0.4 * IN], [x, YB - D * 0.25, Z0 + 0.6 * IN], [x, YB - 1.5 * IN, Z0 + 2.2 * IN]], Array(5).fill(1.1 * IN), 8); a.box(x - 0.9 * IN, YF + D * 0.3, Z0 + 1.2 * IN, x + 0.9 * IN, YB - D * 0.3, sb + Z0 + 2 * IN); }
    a.box(X0 + 1 * IN, YF + 1 * IN, Z0 + sb, X1 - 1 * IN, YB - 3.5 * IN, sz); a.ell(cx, yc - D * 0.05, sz, W * 0.44, D * 0.36, 1.1 * IN, 16, 5);
    prismX(a, [[YB - 7 * IN, Z0 + sb + 3 * IN], [YB, Z0 + sb + 3 * IN], [YB, Z0 + H - 4 * IN], [YB - 3 * IN, Z0 + H - 4 * IN]], X0 + 1.5 * IN, X1 - 1.5 * IN);
    a.ell(cx, YB - 2 * IN, Z0 + H - 2.2 * IN, W * 0.26, 2.6 * IN, 3.2 * IN, 14, 6);
    for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 1.2 * IN); a.box(x - 1.2 * IN, yc - D * 0.22, sz + 3 * IN, x + 1.2 * IN, yc + D * 0.1, sz + 4.3 * IN); a.tube([[x, yc - D * 0.05, sz + 3 * IN], [x, yc - D * 0.05, sz]], [0.5 * IN, 0.5 * IN], 6); }
    a.outline(); a.rect(X0 + 1 * IN, YB - 7 * IN, X1 - 1 * IN, YB - 3.5 * IN, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.rect(cx + s * (W / 2 - 1.2 * IN) - 1.2 * IN, yc - D * 0.22, cx + s * (W / 2 - 1.2 * IN) + 1.2 * IN, yc + D * 0.1, 'EQUIP-DETAIL');
    a.log('Added the seat pad, reclined back with headrest pillow, arm pads on supports and the rocker skids where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/setups', title: 'Generic clamp-on monitor arm, gas spring',
  desc: (v) => `Desk-edge clamp with a vertical pole and ${v.n === 1 ? 'one' : v.n === 2 ? 'two' : 'three'} two-link gas-spring arm${v.n > 1 ? 's' : ''}, each ending in a swivel head and a ${v.diag} in monitor panel with bezel and screen.`,
  vs: [
    ['single 24 in monitor', 22, 14, 21, 0, { n: 1, diag: 24 }],
    ['dual 24 in monitors', 46, 14, 21, 0, { n: 2, diag: 24 }],
    ['single 32 in monitor', 29, 14, 25, 0, { n: 1, diag: 32 }],
    ['dual 27 in monitors', 52, 14, 22, 0, { n: 2, diag: 27 }],
    ['triple 24 in monitors', 70, 14, 21, 0, { n: 3, diag: 24 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, mw = v.diag * 0.872 * IN, mh = v.diag * 0.49 * IN, zm = Z0 + H - mh, zc = zm + mh * 0.5, gap = (W - v.n * mw) / (v.n + 1), px = cx, py = YB - 2 * IN;
    a.box(px - 1.5 * IN, py - 1.5 * IN, Z0, px + 1.5 * IN, py + 1.5 * IN, Z0 + 1.2 * IN); a.box(px - 1.5 * IN, py - 1.5 * IN, Z0 + 4.2 * IN, px + 1.5 * IN, py + 1.5 * IN, Z0 + 5 * IN); a.box(px - 1.5 * IN, py + 0.8 * IN, Z0, px + 1.5 * IN, py + 1.5 * IN, Z0 + 5 * IN);
    a.cyl(px, py, Z0 + 1.2 * IN, Z0 + 4.2 * IN, 0.5 * IN, 8); a.cyl(px, py, Z0 + 3.1 * IN, Z0 + 3.6 * IN, 0.9 * IN, 10);
    a.tube([[px, py, Z0 + 5 * IN], [px, py, zc - 1 * IN]], [1 * IN, 0.9 * IN], 10);
    for (let i = 0; i < v.n; i++) {
      const xi = X0 + gap + mw / 2 + i * (mw + gap), za = zc + (i % 2 ? 1 : 0) * 0 - 0.5 * IN;
      a.tube([[px, py, za], [(px + xi) / 2, py - 2.5 * IN, za], [xi, YF + 3.5 * IN, za]], [0.9 * IN, 0.8 * IN, 0.7 * IN], 8); a.cyl(xi, YF + 3.5 * IN, za - 0.4 * IN, za + 0.4 * IN, 1.1 * IN, 10);
      a.box(xi - 2 * IN, YF + 1.2 * IN, za - 2 * IN, xi + 2 * IN, YF + 3 * IN, za + 2 * IN); panel(a, xi - mw / 2, zm, mw, mh, YF + 0.5 * IN, 0.9 * IN);
      a.rect(xi - mw / 2, YF + 0.5 * IN, xi + mw / 2, YF + 1.4 * IN, 'EQUIP-DETAIL'); a.line(px, py, xi, YF + 3.5 * IN, 'EQUIP-DETAIL');
    }
    a.rect(px - 1.5 * IN, py - 1.5 * IN, px + 1.5 * IN, py + 1.5 * IN); a.outline();
    a.log('Added the desk clamp, pole, gas-spring links, swivel heads and the monitor panels (plan and 3D).');
  } }),

fam({ cat: 'speedrun/setups', title: 'Generic tube TV on rolling cart, retro corner',
  desc: (v) => `${v.diag} in tube television (bezel, bulged screen, tapered rear housing, knobs and a speaker grille) on a two-shelf metal cart with four casters${v.cons ? ', a small game console and two controllers on the lower shelf' : ''}.`,
  vs: [
    ['14 in', 18, 18, 36, 0, { diag: 14 }],
    ['20 in', 24, 22, 42, 0, { diag: 20 }],
    ['20 in with console shelf', 24, 22, 42, 0, { diag: 20, cons: true }],
    ['27 in', 30, 28, 48, 0, { diag: 27 }],
    ['27 in with console shelf', 30, 28, 48, 0, { diag: 27, cons: true }],
    ['32 in', 36, 32, 52, 0, { diag: 32 }],
    ['36 in, wide cart', 42, 34, 58, 0, { diag: 36 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, ch = 24 * IN, zt = Z0 + ch, th = H - ch;
    for (const x of [X0 + 1 * IN, X1 - 1 * IN]) for (const y of [YF + 1 * IN, YB - 1 * IN]) { a.tube([[x, y, Z0 + 2 * IN], [x, y, zt]], [0.5 * IN, 0.5 * IN], 6); a.cyl(x, y, Z0 + 0.9 * IN, Z0 + 2 * IN, 0.5 * IN, 6); a.xcyl(x - 0.2 * IN, x + 0.2 * IN, y, Z0 + 0.8 * IN, 0.8 * IN, 10); }
    a.box(X0, YF, zt - 0.8 * IN, X1, YB, zt); a.box(X0, YF, Z0 + 9 * IN, X1, YB, Z0 + 9.8 * IN); a.outline();
    a.box(X0 + 0.5 * IN, YF + 0.4 * IN, zt, X1 - 0.5 * IN, YF + D * 0.28, zt + th); a.ell(cx, YF + D * 0.1, zt + th * 0.5, (W - 5 * IN) * 0.43, D * 0.1, th * 0.38, 18, 8);
    const f = [[X0 + 1.5 * IN, YF + D * 0.28, zt + th - 1.5 * IN], [X1 - 1.5 * IN, YF + D * 0.28, zt + th - 1.5 * IN], [X0 + 1.5 * IN, YF + D * 0.28, zt + 1.5 * IN], [X1 - 1.5 * IN, YF + D * 0.28, zt + 1.5 * IN]], r = [[cx - W * 0.2, YB - 1 * IN, zt + th * 0.7], [cx + W * 0.2, YB - 1 * IN, zt + th * 0.7], [cx - W * 0.2, YB - 1 * IN, zt + th * 0.3], [cx + W * 0.2, YB - 1 * IN, zt + th * 0.3]];
    hull(a, [...f, ...r]);
    for (let i = 0; i < 3; i++) a.ycyl(YF + 0.1 * IN, YF + 0.5 * IN, X1 - 1.6 * IN - i * 1.4 * IN, zt + 1 * IN, 0.4 * IN, 8);
    for (let i = 0; i < 4; i++) a.box(X0 + 1.2 * IN, YF + 0.2 * IN, zt + 1.5 * IN + i * 0.6 * IN, X0 + 4 * IN, YF + 0.5 * IN, zt + 1.8 * IN + i * 0.6 * IN);
    if (v.cons) { a.box(cx - 6 * IN, yc - 5 * IN, Z0 + 9.8 * IN, cx + 3 * IN, yc + 5 * IN, Z0 + 12.5 * IN); a.box(cx - 5 * IN, yc - 5.2 * IN, Z0 + 11 * IN, cx + 2 * IN, yc - 5 * IN, Z0 + 11.4 * IN); for (const s of [0, 1]) a.box(cx + 4.5 * IN + s * 1.8 * IN, yc - 3 * IN, Z0 + 9.8 * IN, cx + 5.8 * IN + s * 1.8 * IN, yc + 1 * IN, Z0 + 10.6 * IN); a.rect(cx - 6 * IN, yc - 5 * IN, cx + 3 * IN, yc + 5 * IN, 'EQUIP-DETAIL'); }
    a.rect(X0 + 0.5 * IN, YF + 0.4 * IN, X1 - 0.5 * IN, YF + D * 0.28, 'EQUIP-DETAIL');
    a.log('Added the cart frame, casters and shelves, the tube TV with bezel, screen bulge, tapered housing, knobs and grille, and the console where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/setups', title: 'Generic LAN party table with monitor row',
  desc: (v) => `Trestle table for ${v.n} players along one side: a thick top, two A-frame trestles with a foot bar, ${v.n} monitors on foot stands with keyboards and mice, a power strip along the back and ${v.n} backless stools tucked under the front edge.`,
  vs: [
    ['2 seats, 60 in', 60, 30, 46, 0, { n: 2 }],
    ['3 seats, 90 in', 90, 30, 46, 0, { n: 3 }],
    ['4 seats, 120 in', 120, 30, 46, 0, { n: 4 }],
    ['5 seats, 150 in', 150, 30, 46, 0, { n: 5 }],
    ['6 seats, 180 in', 180, 30, 46, 0, { n: 6 }],
    ['8 seats, 240 in', 240, 30, 46, 0, { n: 8 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, tz = Z0 + 29 * IN, yc = (YF + YB) / 2, pw = W / v.n;
    a.box(X0, YF + 4 * IN, tz - 1.2 * IN, X1, YB, tz); a.outline(); a.rect(X0, YF + 4 * IN, X1, YB, 'EQUIP-DETAIL');
    const tx = v.n > 5 ? [0.1, 0.5, 0.9] : [0.12, 0.88]; for (const f of tx) { const x = X0 + W * f; for (const s of [-1, 1]) a.tube([[x + s * 0.2 * IN, YF + 6 * IN, tz - 1.2 * IN], [x + s * 2.5 * IN, YF + 6.5 * IN, Z0], [x + s * 2.5 * IN, YB - 2 * IN, Z0]].slice(0, 2), [0.9 * IN, 0.7 * IN], 6); a.tube([[x - 2.5 * IN, YF + 6.5 * IN, Z0 + 0.7 * IN], [x + 2.5 * IN, YF + 6.5 * IN, Z0 + 0.7 * IN]], [0.7 * IN, 0.7 * IN], 6); a.tube([[x, YB - 2 * IN, tz - 1.2 * IN], [x, YB - 2 * IN, Z0]], [0.9 * IN, 0.7 * IN], 6); a.box(x - 2.5 * IN, YF + 6.5 * IN, Z0, x + 2.5 * IN, YB - 2 * IN, Z0 + 0.7 * IN); }
    a.box(X0 + 6 * IN, YB - 3 * IN, tz, X1 - 6 * IN, YB - 1.5 * IN, tz + 1.2 * IN);
    for (let i = 0; i < v.n; i++) {
      const x = X0 + pw * (i + 0.5); panel(a, x - 10.5 * IN, tz + 2.5 * IN, 21 * IN, 12 * IN, YB - 10 * IN, 0.9 * IN); a.box(x - 4 * IN, YB - 9 * IN, tz, x + 4 * IN, YB - 6 * IN, tz + 0.5 * IN); a.box(x - 1 * IN, YB - 9 * IN, tz + 0.5 * IN, x + 1 * IN, YB - 8.2 * IN, tz + 2.5 * IN);
      a.box(x - 8 * IN, YF + 8 * IN, tz, x + 4 * IN, YF + 13 * IN, tz + 0.8 * IN); a.box(x + 6 * IN, YF + 9 * IN, tz, x + 8 * IN, YF + 12 * IN, tz + 0.8 * IN);
      a.cyl(x, YF + 1.8 * IN, Z0 + 15 * IN, Z0 + 17 * IN, 6.5 * IN, 14); a.tube([[x - 4 * IN, YF + 1.8 * IN, Z0], [x - 4 * IN, YF + 1.8 * IN, Z0 + 15 * IN]], [0.6 * IN, 0.6 * IN], 6); a.tube([[x + 4 * IN, YF + 1.8 * IN, Z0], [x + 4 * IN, YF + 1.8 * IN, Z0 + 15 * IN]], [0.6 * IN, 0.6 * IN], 6); a.circ(x, YF + 1.8 * IN + 0, 6.5 * IN, 'EQUIP-DETAIL');
    }
    a.log('Added the table top and trestles, monitors with keyboards and mice, the power strip and the stools (plan and 3D).');
  } }),

fam({ cat: 'speedrun/setups', title: 'Generic ring light on tripod, stream corner',
  desc: (v) => `Ring light of ${v.ring} in diameter drawn as a tube ring with a diffuser band, on a ${v.ft} tripod with three splayed legs, a centre column and a ball head${v.phone ? ', with a phone clamp and a cold shoe bar across the ring' : ''}.`,
  vs: [
    ['10 in ring, desktop tripod', 14, 14, 24, 0, { ring: 10, ft: 'short', zb: 9, phone: true }],
    ['12 in ring, 4 ft stand', 26, 26, 62, 0, { ring: 12, ft: 'full-height', zb: 44 }],
    ['14 in ring with phone clamp', 28, 28, 68, 0, { ring: 14, ft: 'full-height', zb: 46, phone: true }],
    ['18 in ring, 6 ft stand', 32, 32, 84, 0, { ring: 18, ft: 'full-height', zb: 56 }],
    ['18 in ring with phone clamp', 32, 32, 84, 0, { ring: 18, ft: 'full-height', zb: 56, phone: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, R = v.ring * IN / 2, zc = Z0 + H - R - 0.8 * IN, zb = Z0 + v.zb * IN;
    legs3(a, cx, yc, zb, Z0, W / 2 - 1.5 * IN, 0.45 * IN + W * 0.004); a.tube([[cx, yc, zb], [cx, yc, zc - R * 0.4]], [0.7 * IN, 0.55 * IN], 8); a.ell(cx, yc, zb, 1 * IN, 1 * IN, 1 * IN, 10, 6);
    ringXZ(a, cx, yc, zc, R, 0.9 * IN); ringXZ(a, cx, yc - 0.5 * IN, zc, R * 0.97, 0.45 * IN); a.box(cx - 0.7 * IN, yc - 0.4 * IN, zc - R - 1.5 * IN, cx + 0.7 * IN, yc + 0.4 * IN, zc - R + 0.2 * IN); a.tube([[cx, yc, zc - R * 0.4], [cx, yc, zc - R]], [0.5 * IN, 0.5 * IN], 6);
    a.box(cx - 1 * IN, yc - 1 * IN, zc - R - 1.2 * IN, cx + 1 * IN, yc + 1 * IN, zc - R - 0.2 * IN);
    if (v.phone) { a.box(cx - 1.4 * IN, yc - 1.3 * IN, zc - 0.6 * IN, cx + 1.4 * IN, yc - 0.3 * IN, zc + 0.6 * IN); a.box(cx - R * 0.7, yc - 0.6 * IN, zc + 0.9 * IN, cx + R * 0.7, yc, zc + 1.5 * IN); }
    a.circ(cx, yc, W / 2 - 1.5 * IN, 'EQUIP-DETAIL'); a.rect(cx - R, yc - 0.8 * IN, cx + R, yc + 0.8 * IN); a.circ(cx, yc, 0.9 * IN, 'EQUIP-DETAIL');
    a.log('Added the tripod legs, column, ball head, ring tube with diffuser band and the phone clamp where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/setups', title: 'Generic softbox key light on stand, stream corner',
  desc: (v) => `${v.kind} softbox: a tapered fabric hood with a front diffuser frame and a rear speed ring, on a ${v.boom ? 'boom arm with a counterweight on a ' : ''}centre-column stand with a spread base and a tilt knob.`,
  vs: [
    ['square 16 in', 30, 30, 70, 0, { kind: 'Square', sw: 16, sh: 16, zc: 56 }],
    ['rectangle 20 x 28 in', 34, 34, 78, 0, { kind: 'Rectangle', sw: 20, sh: 28, zc: 56 }],
    ['strip 12 x 36 in', 34, 34, 84, 0, { kind: 'Strip', sw: 12, sh: 36, zc: 58 }],
    ['square 24 in on boom arm', 48, 36, 90, 0, { kind: 'Square', sw: 24, sh: 24, zc: 72, boom: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, zc = Z0 + v.zc * IN, sw = v.sw * IN / 2, sh = v.sh * IN / 2, hx = v.boom ? cx - W * 0.12 : cx;
    legs3(a, cx, yc, Z0 + 22 * IN, Z0, D / 2 - 1.5 * IN, 0.5 * IN); a.tube([[cx, yc, Z0 + 20 * IN], [cx, yc, v.boom ? Z0 + 62 * IN : zc - sh * 0.9]], [0.9 * IN, 0.7 * IN], 8); a.cyl(cx, yc, Z0 + 20 * IN, Z0 + 24 * IN, 1.4 * IN, 10);
    if (v.boom) { a.tube([[cx - W * 0.28, yc, Z0 + 60 * IN], [cx + W * 0.28, yc, Z0 + 70 * IN]], [0.7 * IN, 0.7 * IN], 8); a.cyl(cx - W * 0.28, yc, Z0 + 55 * IN, Z0 + 60 * IN, 2.2 * IN, 10); a.box(cx + W * 0.23, yc - 1 * IN, Z0 + 69 * IN, cx + W * 0.33, yc + 1 * IN, Z0 + 71 * IN); }
    const x1 = v.boom ? cx + W * 0.28 : hx, zy = v.boom ? Z0 + 70 * IN : zc; a.box(x1 - 1 * IN, yc - 1 * IN, zy - 1 * IN, x1 + 1 * IN, yc + 1 * IN, zy + 1 * IN);
    a.cyl(x1, yc, zy - sh - 0.5 * IN, zy - 0.5 * IN, 0.4 * IN, 6);
    const yb = YB - 1 * IN, yf = YF + 1 * IN, zz = v.boom ? zy : zc; hull(a, [[x1 - sw, yf, zz - sh], [x1 + sw, yf, zz - sh], [x1 - sw, yf, zz + sh], [x1 + sw, yf, zz + sh], [x1 - 3 * IN, yb, zz - 3 * IN], [x1 + 3 * IN, yb, zz - 3 * IN], [x1 - 3 * IN, yb, zz + 3 * IN], [x1 + 3 * IN, yb, zz + 3 * IN]]);
    a.frame(x1 - sw - 0.5 * IN, zz - sh - 0.5 * IN, x1 + sw + 0.5 * IN, zz + sh + 0.5 * IN, YF + 0.2 * IN, YF + 1.4 * IN, 0.6 * IN); a.box(x1 - sw, YF + 0.5 * IN, zz - sh, x1 + sw, YF + 0.9 * IN, zz + sh); a.ycyl(yb, yb + 0.9 * IN, x1, zz, 3.4 * IN, 12);
    a.circ(cx, yc, D / 2 - 1.5 * IN, 'EQUIP-DETAIL'); a.rect(x1 - sw, yf, x1 + sw, yb); a.line(cx, yc, x1, yc, 'EQUIP-DETAIL');
    a.log('Added the stand legs and column, boom and counterweight where fitted, the tapered hood, diffuser frame and speed ring (plan and 3D).');
  } }),

// ============================================================================================ speedrun/gear
fam({ cat: 'speedrun/gear', title: 'Generic gaming mouse, wired',
  desc: (v) => `${v.kind} mouse: a domed shell with a split left and right button, a scroll wheel with a groove, ${v.side ? 'two side buttons, ' : ''}${v.thumb ? 'a raised thumb rest, ' : ''}a skate pad at each corner and a short cable boot at the front.`,
  vs: [
    ['small, 2.2 in wide', 2.2, 3.9, 1.4, 0, { kind: 'Small', side: false }],
    ['medium with side buttons, 2.5 in wide', 2.5, 4.5, 1.6, 0, { kind: 'Medium', side: true }],
    ['large with side buttons, 2.8 in wide', 2.8, 5, 1.8, 0, { kind: 'Large', side: true }],
    ['ergonomic thumb rest, 3 in wide', 3, 5, 1.9, 0, { kind: 'Ergonomic', side: true, thumb: true }],
    ['ambidextrous light, 2.4 in wide', 2.4, 4.6, 1.5, 0, { kind: 'Ambidextrous', side: false }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2;
    dome(a, cx, yc, Z0 + 0.05 * IN, W * 0.5, D * 0.5, H - 0.05 * IN, 0.22); a.outline();
    for (const x of [X0 + W * 0.18, X1 - W * 0.18]) for (const y of [YF + D * 0.18, YB - D * 0.15]) a.cyl(x, y, Z0, Z0 + 0.06 * IN, 0.18 * IN, 8);
    a.box(cx - 0.02 * IN, YF + D * 0.05, Z0 + H * 0.84, cx + 0.02 * IN, yc - D * 0.05, Z0 + H * 0.97); a.box(cx - W * 0.28, YF + D * 0.08, Z0 + H * 0.88, cx - 0.04 * IN, yc, Z0 + H * 0.9);
    a.xcyl(cx - 0.12 * IN, cx + 0.12 * IN, yc - D * 0.2, Z0 + H * 0.93, 0.28 * IN, 12); a.line(cx, YF + D * 0.04, cx, yc + D * 0.02, 'EQUIP-DETAIL'); a.line(X0 + W * 0.1, yc, X1 - W * 0.1, yc, 'EQUIP-DETAIL'); a.rect(cx - 0.12 * IN, yc - D * 0.27, cx + 0.12 * IN, yc - D * 0.13, 'EQUIP-DETAIL');
    if (v.side) for (const i of [0, 1]) a.box(X0 - 0.03 * IN, yc - D * 0.28 + i * D * 0.14, Z0 + H * 0.4, X0 + 0.08 * IN, yc - D * 0.18 + i * D * 0.14, Z0 + H * 0.52);
    if (v.thumb) a.box(X0 + 0.02 * IN, yc - D * 0.05, Z0 + H * 0.12, X0 + W * 0.2, yc + D * 0.28, Z0 + H * 0.34);
    a.ycyl(YF, YF + 0.35 * IN, cx, Z0 + H * 0.4, 0.2 * IN, 8);
    a.log('Added the domed shell, split buttons, scroll wheel, side buttons or thumb rest, skates and the cable boot (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic boom arm for desk microphone',
  desc: (v) => `${v.kind} desk boom arm: a clamp and base post at the left, two arm links${v.spring ? ' braced by a coiled spring' : ''}, a swivel mount and a large-capsule microphone in a cradle with a round pop screen in front.`,
  vs: [
    ['low-profile, 24 in reach', 24, 8, 16, 0, { kind: 'Low-profile', len: 24 }],
    ['standard, 32 in reach', 32, 8, 22, 0, { kind: 'Standard', len: 32 }],
    ['long with pop filter, 40 in reach', 40, 9, 26, 0, { kind: 'Long-reach', len: 40 }],
    ['spring-braced, 28 in reach', 28, 8, 22, 0, { kind: 'Spring-braced', len: 28, spring: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, px = X0 + 2.5 * IN, zp = Z0 + H * 0.35, ze = Z0 + H - 2.5 * IN, mx = X1 - 3.5 * IN;
    a.box(px - 2 * IN, yc - 1.8 * IN, Z0, px + 2 * IN, yc + 1.8 * IN, Z0 + 1 * IN); a.box(px - 2 * IN, yc + 1 * IN, Z0, px + 2 * IN, yc + 1.8 * IN, Z0 + 5 * IN); a.box(px - 2 * IN, yc - 1.8 * IN, Z0 + 4 * IN, px + 2 * IN, yc + 1.8 * IN, Z0 + 5 * IN); a.cyl(px, yc - 0.4 * IN, Z0 + 1 * IN, Z0 + 4 * IN, 0.5 * IN, 8);
    a.tube([[px, yc, Z0 + 5 * IN], [px, yc, zp]], [0.9 * IN, 0.8 * IN], 8); a.cyl(px, yc, zp, zp + 0.8 * IN, 1.1 * IN, 10);
    const ex = px + (mx - px) * 0.5; a.tube([[px, yc, zp + 0.4 * IN], [ex, yc, ze]], [0.7 * IN, 0.7 * IN], 8); a.cyl(ex, yc, ze - 0.6 * IN, ze + 0.6 * IN, 1 * IN, 10);
    a.tube([[ex, yc, ze], [mx, yc, ze - 1.5 * IN]], [0.65 * IN, 0.6 * IN], 8);
    if (v.spring) { const pts = []; for (let i = 0; i <= 14; i++) { const f = i / 14; pts.push([px + (ex - px) * f + 0.5 * IN * (i % 2 ? 1 : -1) * 0.2, yc - 1.2 * IN + (i % 2 ? 0.6 : 0) * IN, zp + 0.4 * IN + (ze - zp - 0.4 * IN) * f]); } a.tube(pts, Array(15).fill(0.14 * IN), 5); }
    a.ycyl(yc - 1.2 * IN, yc + 0.8 * IN, mx, ze - 3.2 * IN, 1.1 * IN, 14); a.ell(mx, yc - 1.4 * IN, ze - 3.2 * IN, 1.1 * IN, 0.4 * IN, 1.1 * IN, 14, 6); a.tube([[mx, yc, ze - 1.5 * IN], [mx, yc, ze - 2.4 * IN]], [0.4 * IN, 0.4 * IN], 6);
    for (const s of [-1, 1]) a.tube([[mx + s * 1.4 * IN, yc - 0.6 * IN, ze - 4.6 * IN], [mx + s * 1.4 * IN, yc + 0.3 * IN, ze - 3.2 * IN]], [0.12 * IN, 0.12 * IN], 5);
    a.ycyl(YF + 0.2 * IN, YF + 0.5 * IN, mx, ze - 3.2 * IN, 2.2 * IN, 18);
    a.rect(px - 2 * IN, yc - 1.8 * IN, px + 2 * IN, yc + 1.8 * IN); a.line(px, yc, ex, yc, 'EQUIP-DETAIL'); a.line(ex, yc, mx, yc, 'EQUIP-DETAIL'); a.circ(mx, yc, 1.1 * IN, 'EQUIP-DETAIL'); a.rect(mx - 2.2 * IN, YF + 0.2 * IN, mx + 2.2 * IN, YF + 0.5 * IN, 'EQUIP-DETAIL');
    a.log('Added the clamp, base post, two arm links, spring where fitted, swivel, microphone cradle with capsule and the pop screen (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic controller charging dock, desk',
  desc: (v) => `Charging dock for ${v.n} hand controllers: a weighted base with rubber feet, ${v.n} angled cradles each holding a controller (body, two grips and a button cluster), and a charge light bar on the front edge.`,
  vs: [
    ['2 controllers, 7 in', 7, 6, 6, 0, { n: 2 }],
    ['3 controllers, 10 in', 10, 6, 6, 0, { n: 3 }],
    ['4 controllers, 13 in', 13, 6, 6, 0, { n: 4 }],
    ['4 controllers with light bar, 14 in', 14, 7, 6.5, 0, { n: 4, bar: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, pw = (W - 1 * IN) / v.n;
    a.box(X0, YF, Z0 + 0.3 * IN, X1, YB, Z0 + 1.2 * IN); a.outline(); for (const x of [X0 + 1 * IN, X1 - 1 * IN]) for (const y of [YF + 1 * IN, YB - 1 * IN]) a.cyl(x, y, Z0, Z0 + 0.3 * IN, 0.45 * IN, 8);
    for (let i = 0; i < v.n; i++) {
      const x = X0 + 0.5 * IN + pw * (i + 0.5), cw = pw * 0.44;
      prismX(a, [[yc - 1.6 * IN, Z0 + 1.2 * IN], [yc + 1.9 * IN, Z0 + 1.2 * IN], [yc + 1.9 * IN, Z0 + H * 0.88], [yc + 1.2 * IN, Z0 + H * 0.88]], x - pw * 0.4, x + pw * 0.4);
      a.box(x - pw * 0.38, yc - 1.8 * IN, Z0 + 1.2 * IN, x + pw * 0.38, yc - 1.2 * IN, Z0 + 2.4 * IN);
      a.ell(x, yc - 1.4 * IN, Z0 + 3.5 * IN, cw, 1 * IN, 0.7 * IN, 14, 6); for (const s of [-1, 1]) a.tube([[x + s * cw * 0.8, yc - 1.4 * IN, Z0 + 3.5 * IN], [x + s * cw * 0.95, yc - 1.4 * IN, Z0 + 2.5 * IN]], [0.4 * IN, 0.3 * IN], 6);
      a.cyl(x - cw * 0.5, yc - 1.4 * IN, Z0 + 4.15 * IN, Z0 + 4.4 * IN, 0.25 * IN, 8); for (let k = 0; k < 4; k++) { const t = k * TAU / 4; a.cyl(x + cw * 0.5 + 0.22 * IN * m.cos(t), yc - 1.4 * IN + 0.22 * IN * m.sin(t), Z0 + 4.15 * IN, Z0 + 4.3 * IN, 0.08 * IN, 6); }
      a.rect(x - pw * 0.4, yc - 1.6 * IN, x + pw * 0.4, yc + 1.9 * IN, 'EQUIP-DETAIL'); a.box(x - 0.3 * IN, YF + 0.1 * IN, Z0 + 0.5 * IN, x + 0.3 * IN, YF + 0.2 * IN, Z0 + 0.8 * IN);
    }
    if (v.bar) a.box(X0 + 1 * IN, YF - 0.2 * IN, Z0 + 0.35 * IN, X1 - 1 * IN, YF + 0.3 * IN, Z0 + 0.75 * IN);
    a.log('Added the base with feet, angled cradles, the controllers with grips and buttons and the charge lights (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic handheld game device on stand',
  desc: (v) => `${v.kind} handheld game device standing in a desk stand: a slim body with a framed screen, a direction pad and four face buttons, two shoulder bumpers, ${v.grips ? 'two moulded hand grips, ' : ''}a speaker slot and a charge port, held by a stand with a front lip.`,
  vs: [
    ['compact, 5.5 in wide', 6, 3.2, 3.4, 0, { kind: 'Compact', dw: 5.5, dh: 2.8 }],
    ['standard, 7 in wide', 7.5, 3.5, 4, 0, { kind: 'Standard', dw: 7, dh: 3.3 }],
    ['large screen, 9 in wide', 9.5, 3.8, 4.8, 0, { kind: 'Large-screen', dw: 9, dh: 4.2 }],
    ['with moulded grips, 10 in wide', 10.5, 3.8, 4.4, 0, { kind: 'Grip-style', dw: 10, dh: 3.8, grips: true }],
    ['clamshell, 6 in wide, open', 6.5, 4.2, 5.2, 0, { kind: 'Clamshell (open)', dw: 6, dh: 2.4, clam: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, dw = v.dw * IN, dh = v.dh * IN, zb = Z0 + 0.8 * IN;
    a.box(X0, YF, Z0, X1, YB, zb); a.box(X0 + 0.3 * IN, YF, zb, X1 - 0.3 * IN, YF + 0.5 * IN, zb + 0.6 * IN); a.outline();
    const y0 = yc - 0.35 * IN, y1 = yc + 0.35 * IN;
    if (v.clam) { a.box(cx - dw / 2, y0, zb + 0.3 * IN, cx + dw / 2, y1 + 0.3 * IN, zb + 0.3 * IN + dh); a.frame(cx - dw / 2 + 0.3 * IN, zb + 0.6 * IN, cx + dw / 2 - 0.3 * IN, zb + 0.3 * IN + dh - 0.3 * IN, y0 - 0.1 * IN, y0 + 0.2 * IN, 0.15 * IN); a.box(cx - dw / 2, YB - 1.2 * IN, zb, cx + dw / 2, YB - 0.4 * IN, zb + 0.3 * IN + dh * 0.0 + 2.2 * IN); a.box(cx - dw / 2, YB - 0.8 * IN, zb + 2.2 * IN, cx + dw / 2, YB, zb + 4.4 * IN); a.cyl(cx - dw * 0.3, YB - 0.3 * IN, zb + 2.6 * IN, zb + 2.8 * IN, 0.3 * IN, 8); }
    else {
      a.box(cx - dw / 2, y0, zb + 0.3 * IN, cx + dw / 2, y1, zb + 0.3 * IN + dh); const sw = dw * 0.5, sh = dh * 0.7; a.frame(cx - sw / 2 - 0.2 * IN, zb + 0.3 * IN + dh / 2 - sh / 2 - 0.2 * IN, cx + sw / 2 + 0.2 * IN, zb + 0.3 * IN + dh / 2 + sh / 2 + 0.2 * IN, y0 - 0.1 * IN, y0 + 0.15 * IN, 0.12 * IN); a.box(cx - sw / 2, y0 - 0.05 * IN, zb + 0.3 * IN + dh / 2 - sh / 2, cx + sw / 2, y0, zb + 0.3 * IN + dh / 2 + sh / 2);
      const zc = zb + 0.3 * IN + dh / 2, dx = dw * 0.34; a.box(cx - dx - 0.5 * IN, y0 - 0.12 * IN, zc - 0.12 * IN, cx - dx + 0.5 * IN, y0, zc + 0.12 * IN); a.box(cx - dx - 0.12 * IN, y0 - 0.12 * IN, zc - 0.5 * IN, cx - dx + 0.12 * IN, y0, zc + 0.5 * IN);
      for (let k = 0; k < 4; k++) { const t = k * TAU / 4; a.ycyl(y0 - 0.12 * IN, y0, cx + dx + 0.38 * IN * m.cos(t), zc + 0.38 * IN * m.sin(t), 0.17 * IN, 8); }
      for (const s of [-1, 1]) a.box(cx + s * (dw / 2 - 0.9 * IN) - 0.7 * IN, y0 + 0.05 * IN, zb + 0.3 * IN + dh, cx + s * (dw / 2 - 0.9 * IN) + 0.7 * IN, y1 - 0.05 * IN, zb + 0.3 * IN + dh + 0.25 * IN);
      if (v.grips) for (const s of [-1, 1]) a.tube([[cx + s * (dw / 2 - 0.4 * IN), yc, zb + 0.3 * IN + dh * 0.8], [cx + s * (dw / 2 + 0.25 * IN), yc, zb + 0.3 * IN + dh * 0.5], [cx + s * (dw / 2 - 0.1 * IN), yc, zb + 0.3 * IN + dh * 0.15]], [0.5 * IN, 0.55 * IN, 0.45 * IN], 8);
      a.box(cx + dw * 0.2, y1 - 0.02 * IN, zb + 0.3 * IN, cx + dw * 0.3, y1, zb + 0.4 * IN);
    }
    a.rect(cx - dw / 2, y0, cx + dw / 2, y1, 'EQUIP-DETAIL'); a.rect(X0 + 0.3 * IN, YF, X1 - 0.3 * IN, YF + 0.5 * IN, 'EQUIP-DETAIL');
    a.log('Added the stand, the slim body with framed screen, direction pad, face buttons, bumpers and grips or the open clamshell (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic macro key pad, sloped desk',
  desc: (v) => `Macro key pad with ${v.cols} by ${v.rows} separate square keys on a sloped wedge body, rubber feet and a short cable boot at the back${v.knob ? ', plus a rotary knob at the top left' : ''}.`,
  vs: [
    ['3 x 2 keys', 3.6, 3.4, 1.2, 0, { cols: 3, rows: 2 }],
    ['4 x 2 keys', 4.6, 3.4, 1.2, 0, { cols: 4, rows: 2 }],
    ['5 x 3 keys', 5.6, 4.6, 1.5, 0, { cols: 5, rows: 3 }],
    ['6 x 4 keys with knob', 6.6, 5.8, 1.8, 0, { cols: 6, rows: 4, knob: true }],
    ['8 x 4 keys with knob', 8.6, 5.8, 1.8, 0, { cols: 8, rows: 4, knob: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, zf = Z0 + 0.35 * IN, zbk = Z0 + H - 0.3 * IN, sl = (zbk - zf) / D, zs = (y) => zf + (y - YF) * sl, pitch = (W - 0.9 * IN) / v.cols, ph = (D - 1 * IN - (v.knob ? 0.9 * IN : 0)) / v.rows;
    prismX(a, [[YF, Z0 + 0.2 * IN], [YB, Z0 + 0.2 * IN], [YB, zbk], [YF, zf]], X0, X1); a.outline();
    for (let i = 0; i < v.cols; i++) for (let j = 0; j < v.rows; j++) { const x0 = X0 + 0.45 * IN + i * pitch + 0.05 * IN, x1 = x0 + pitch - 0.1 * IN, y0 = YF + 0.5 * IN + j * ph + 0.05 * IN, y1 = y0 + ph - 0.1 * IN; prismX(a, [[y0, zs(y0)], [y1, zs(y1)], [y1, zs(y1) + 0.22 * IN], [y0, zs(y0) + 0.22 * IN]], x0, x1); a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); }
    if (v.knob) { const ky = YB - 0.7 * IN; a.cyl(X0 + 0.9 * IN, ky, zs(ky), zs(ky) + 0.45 * IN, 0.4 * IN, 14); a.circ(X0 + 0.9 * IN, ky, 0.4 * IN, 'EQUIP-DETAIL'); }
    for (const x of [X0 + 0.5 * IN, X1 - 0.5 * IN]) for (const y of [YF + 0.5 * IN, YB - 0.5 * IN]) a.cyl(x, y, Z0, Z0 + 0.2 * IN, 0.25 * IN, 8);
    a.ycyl(YB - 0.3 * IN, YB, cx, Z0 + 0.6 * IN, 0.18 * IN, 8);
    a.log('Added the sloped wedge body, individual keys, the knob where fitted, feet and the cable boot (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic webcam with mount, stream desk',
  desc: (v) => `${v.kind} webcam: a round housing with a lens ring, glass and an activity light, ${v.mount === 'clip' ? 'on a hinged clip that hooks over a monitor top edge' : v.mount === 'tri' ? 'on a small three-leg tabletop tripod with a ball joint' : v.mount === 'neck' ? 'on a bendable gooseneck with a weighted round base' : 'a wide bar body with two microphone slots on a clip over a monitor top edge'}.`,
  vs: [
    ['clip mount, 3 in', 3.2, 2.6, 2.8, 0, { kind: 'Clip-mount', mount: 'clip' }],
    ['mini tripod, 6 in', 5, 5, 6, 0, { kind: 'Tripod-mount', mount: 'tri' }],
    ['gooseneck, 10 in', 4, 4, 10, 0, { kind: 'Gooseneck', mount: 'neck' }],
    ['wide bar with clip, 5 in', 5.5, 2.6, 1.8, 0, { kind: 'Wide-bar', mount: 'bar' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2;
    if (v.mount === 'bar') { a.box(X0, YF, Z0 + 0.7 * IN, X1, YF + 1.1 * IN, Z0 + H); for (const s of [-1, 1]) { a.ycyl(YF - 0.1 * IN, YF + 0.2 * IN, cx + s * W * 0.16, Z0 + 1.3 * IN, 0.35 * IN, 14); a.ycyl(YF - 0.05 * IN, YF + 0.1 * IN, cx + s * W * 0.34, Z0 + 1.3 * IN, 0.12 * IN, 8); } a.box(cx - 0.8 * IN, yc, Z0 + 0.4 * IN, cx + 0.8 * IN, YB, Z0 + 0.9 * IN); a.box(cx - 0.8 * IN, YB - 0.3 * IN, Z0, cx + 0.8 * IN, YB, Z0 + 0.5 * IN); a.box(cx - 1.4 * IN, yc + 0.3 * IN, Z0, cx + 1.4 * IN, YB, Z0 + 0.3 * IN); a.outline(); a.line(X0, YF + 1.1 * IN, X1, YF + 1.1 * IN, 'EQUIP-DETAIL'); a.circ(cx - W * 0.16, YF + 0.5 * IN, 0.35 * IN, 'EQUIP-DETAIL'); }
    else {
      const R = 0.95 * IN, zc = Z0 + H - R - 0.2 * IN; a.ycyl(yc - 0.5 * IN, yc + 0.5 * IN, cx, zc, R, 18); a.ycyl(YF + 0.55 * IN * 0, yc - 0.5 * IN, cx, zc, R * 0.55, 14); a.ycyl(yc - 0.55 * IN, yc - 0.5 * IN, cx, zc, R * 0.3, 10); a.ycyl(yc - 0.52 * IN, yc - 0.5 * IN, cx + R * 0.7, zc + R * 0.7, 0.07 * IN, 6);
      if (v.mount === 'clip') { a.box(cx - 0.8 * IN, yc + 0.4 * IN, Z0 + 0.2 * IN, cx + 0.8 * IN, YB, zc - R * 0.4); a.box(cx - 0.8 * IN, YB - 0.4 * IN, Z0, cx + 0.8 * IN, YB, Z0 + 0.8 * IN); a.box(cx - 0.8 * IN, yc - 0.6 * IN, Z0, cx + 0.8 * IN, YB, Z0 + 0.3 * IN); a.tube([[cx, yc, zc - R], [cx, yc, zc - R - 0.4 * IN]], [0.35 * IN, 0.3 * IN], 6); }
      else if (v.mount === 'tri') { a.ell(cx, yc, Z0 + 2.2 * IN, 0.45 * IN, 0.45 * IN, 0.45 * IN, 10, 6); a.tube([[cx, yc, Z0 + 2.2 * IN], [cx, yc, zc - R]], [0.3 * IN, 0.3 * IN], 6); legs3(a, cx, yc, Z0 + 2.2 * IN, Z0, W / 2 - 0.4 * IN, 0.16 * IN); a.circ(cx, yc, W / 2 - 0.4 * IN, 'EQUIP-DETAIL'); }
      else { a.cyl(cx, yc, Z0, Z0 + 0.5 * IN, 1.8 * IN, 18); const pts = []; for (let i = 0; i <= 10; i++) { const f = i / 10; pts.push([cx + 0.6 * IN * m.sin(f * 2.4), yc, Z0 + 0.5 * IN + (zc - R - Z0 - 0.5 * IN) * f]); } a.tube(pts, Array(11).fill(0.2 * IN), 6); a.circ(cx, yc, 1.8 * IN, 'EQUIP-DETAIL'); }
      a.circ(cx, yc, R); a.circ(cx, yc, R * 0.55, 'EQUIP-DETAIL'); a.outline();
    }
    a.log('Added the housing with lens ring, glass and activity light, and the clip, tripod, gooseneck or bar mount (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic sim pedal set with base plate',
  desc: (v) => `Floor pedal set on a base plate with raised ribs: ${v.n} angled pedals each with a ribbed face pad on a pivot arm, a travel stop at the rear${v.heel ? ', a heel plate and a side footrest' : ''} and four rubber feet.`,
  vs: [
    ['2 pedals, compact', 9, 12, 7, 0, { n: 2 }],
    ['3 pedals, steel', 13, 14, 8.5, 0, { n: 3 }],
    ['3 pedals with footrest and heel plate', 15, 16, 9, 0, { n: 3, heel: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, pw = (W - (v.heel ? 3 * IN : 1 * IN)) / v.n, bx0 = v.heel ? X0 + 3 * IN : X0;
    a.box(X0, YF, Z0 + 0.2 * IN, X1, YB, Z0 + 0.6 * IN); a.outline(); for (let i = 0; i < 4; i++) a.box(X0 + 0.5 * IN, YF + 0.6 * IN + i * D * 0.22, Z0 + 0.6 * IN, X1 - 0.5 * IN, YF + 0.9 * IN + i * D * 0.22, Z0 + 0.8 * IN);
    for (const x of [X0 + 0.5 * IN, X1 - 0.5 * IN]) for (const y of [YF + 0.5 * IN, YB - 0.5 * IN]) a.cyl(x, y, Z0, Z0 + 0.2 * IN, 0.3 * IN, 8);
    for (let i = 0; i < v.n; i++) { const x = bx0 + 0.5 * IN + pw * (i + 0.5), w2 = pw * 0.4, tall = i === 1 && v.n === 3 ? 1.1 : 1;
      prismX(a, [[YF + D * 0.1, Z0 + 1.2 * IN], [YF + D * 0.1 + 3 * IN, Z0 + 0.7 * IN], [YF + D * 0.1 + 3.4 * IN, Z0 + 0.7 * IN], [YF + D * 0.1 + 0.4 * IN, Z0 + H * tall]], x - w2, x + w2);
      a.tube([[x, YB - 1 * IN, Z0 + 1.6 * IN], [x, YF + D * 0.3, Z0 + H * 0.65 * tall]], [0.4 * IN, 0.35 * IN], 6); a.box(x - 0.9 * IN, YB - 2.2 * IN, Z0 + 0.6 * IN, x + 0.9 * IN, YB - 0.4 * IN, Z0 + 2.2 * IN); a.xcyl(x - w2, x + w2, YB - 1 * IN, Z0 + 1.6 * IN, 0.3 * IN, 8);
      a.rect(x - w2, YF + D * 0.1, x + w2, YF + D * 0.1 + 3.4 * IN, 'EQUIP-DETAIL'); for (let k = 0; k < 4; k++) a.line(x - w2, YF + D * 0.1 + 0.6 * IN * (k + 1), x + w2, YF + D * 0.1 + 0.6 * IN * (k + 1), 'EQUIP-DETAIL'); }
    if (v.heel) { prismX(a, [[YB - 5 * IN, Z0 + 0.6 * IN], [YB - 1 * IN, Z0 + 0.6 * IN], [YB - 1 * IN, Z0 + 1.2 * IN]], bx0, bx0 + pw * 0.7); a.box(X0 + 0.2 * IN, yc - 3 * IN, Z0 + 0.6 * IN, X0 + 2.6 * IN, yc + 4 * IN, Z0 + 1.4 * IN); a.rect(X0 + 0.2 * IN, yc - 3 * IN, X0 + 2.6 * IN, yc + 4 * IN, 'EQUIP-DETAIL'); }
    a.log('Added the base plate with ribs and feet, angled pedals with ribbed pads, pivot arms and stops, and the heel plate and footrest where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic sim steering wheel with desk clamp',
  desc: (v) => `${v.kind} steering wheel: ${v.shape === 'round' ? 'a round rim' : v.shape === 'flat' ? 'a flat-bottom rim' : 'a large truck-style rim'} with spokes and a hub, a button cluster and two paddle shifters on the back, on a motor housing with a desk clamp.`,
  vs: [
    ['round rim, 11 in', 12, 11, 12, 0, { kind: 'Round', shape: 'round', R: 5.5 }],
    ['open-wheel rim with grips, 11 in', 12, 11, 12, 0, { kind: 'Open-wheel', shape: 'flat', R: 5.5 }],
    ['truck rim, 15 in', 16, 12, 16, 0, { kind: 'Truck', shape: 'big', R: 7.5 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, R = v.R * IN, zc = Z0 + H - R - 0.5 * IN, y = YF + 2.5 * IN;
    if (v.shape === 'flat') { const pts = [[-1, 0.7], [-0.7, 0.9], [0.7, 0.9], [1, 0.7], [1, -0.2], [0.7, -0.7], [0.5, -0.9], [-0.5, -0.9], [-0.7, -0.7], [-1, -0.2], [-1, 0.7]]; a.tube(pts.map(([u, w]) => [cx + u * R, y, zc + w * R * 0.9]), Array(pts.length).fill(0.55 * IN), 6); }
    else ringXZ(a, cx, y, zc, R, v.shape === 'big' ? 0.8 * IN : 0.6 * IN, 28);
    for (let i = 0; i < 3; i++) { const t = (i * TAU) / 3 + m.PI / 2 - 0.0; if (i === 0 && v.shape === 'flat') continue; a.tube([[cx, y, zc], [cx + R * m.cos(t + 0), y, zc + R * 0.85 * m.sin(t)]], [0.5 * IN, 0.4 * IN], 6); }
    a.ycyl(y - 0.6 * IN, y + 0.8 * IN, cx, zc, 1.6 * IN, 16); for (let k = 0; k < 4; k++) { const t = k * TAU / 4 + 0.78; a.ycyl(y - 0.8 * IN, y - 0.6 * IN, cx + 0.8 * IN * m.cos(t), zc + 0.8 * IN * m.sin(t), 0.22 * IN, 8); }
    for (const s of [-1, 1]) a.box(cx + s * R * 0.72 - 0.3 * IN, y + 1 * IN, zc - 0.2 * IN, cx + s * R * 0.72 + 0.3 * IN, y + 1.5 * IN, zc + R * 0.55);
    a.cyl(cx, yc + 1 * IN, Z0 + 2.5 * IN, zc - 1 * IN, 2 * IN, 16); a.ycyl(y + 0.8 * IN, yc + 1 * IN, cx, zc, 1.5 * IN, 14); a.box(cx - 2.2 * IN, yc, Z0 + 0.3 * IN, cx + 2.2 * IN, YB, Z0 + 3 * IN); a.box(cx - 3 * IN, YB - 3 * IN, Z0, cx + 3 * IN, YB, Z0 + 0.8 * IN); a.box(cx - 3 * IN, YB - 3 * IN, Z0 + 3 * IN, cx + 3 * IN, YB, Z0 + 3.8 * IN); a.box(cx - 3 * IN, YB - 0.8 * IN, Z0, cx + 3 * IN, YB, Z0 + 3.8 * IN);
    a.cyl(cx, YB - 1.5 * IN, Z0 + 0.8 * IN, Z0 + 3 * IN, 0.4 * IN, 8);
    a.circ(cx, y, R, 'EQUIP-DETAIL'); a.rect(cx - 3 * IN, YB - 3 * IN, cx + 3 * IN, YB); a.rect(cx - R, y - 0.6 * IN, cx + R, y + 0.8 * IN); a.circ(cx, yc + 1 * IN, 2 * IN, 'EQUIP-DETAIL');
    a.log('Added the rim, spokes, hub with buttons, paddles, motor housing and the desk clamp (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic flight stick joystick, desk',
  desc: (v) => `${v.kind} desk joystick: a round weighted base with a rubber skirt and a gaiter, a leaning shaft with a moulded grip, a trigger, a hat switch and a thumb button${v.twist ? ', a twist ring under the grip' : ''}${v.throttle ? ' and a separate throttle quadrant with a sliding lever and a row of switches' : ''}.`,
  vs: [
    ['compact', 7, 7, 10, 0, { kind: 'Compact' }],
    ['with twist grip', 8, 8, 12, 0, { kind: 'Twist-grip', twist: true }],
    ['with throttle quadrant, 16 in', 17, 8, 12, 0, { kind: 'Stick-and-throttle', throttle: true }],
    ['heavy base with clamp', 9, 9, 13, 0, { kind: 'Heavy-base', twist: true, heavy: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, sx = v.throttle ? X0 + 3.8 * IN : cx, R = (v.throttle ? 3.6 : W / 2 - 0.3 * IN), bh = v.heavy ? 2.2 * IN : 1.6 * IN;
    lathe(a, sx, yc, Z0, [[0, R], [bh * 0.6, R], [bh, R * 0.8], [bh * 1.1, R * 0.35]], 22); lathe(a, sx, yc, Z0 + bh, [[0, R * 0.38], [0.8 * IN, R * 0.3], [1.4 * IN, R * 0.2]], 14);
    const g0 = [sx, yc, Z0 + bh + 1.2 * IN], g1 = [sx, yc + 0.5 * IN, Z0 + bh + 4.5 * IN], g2 = [sx, yc + 0.7 * IN, Z0 + H - 2.2 * IN];
    a.tube([g0, g1], [0.6 * IN, 0.55 * IN], 10); if (v.twist) a.tube([[sx, yc + 0.5 * IN, Z0 + bh + 4.5 * IN], [sx, yc + 0.5 * IN, Z0 + bh + 4.9 * IN]], [0.8 * IN, 0.8 * IN], 14);
    a.tube([g1, g2, [sx, yc + 0.8 * IN, Z0 + H - 0.3 * IN]], [0.9 * IN, 1 * IN, 0.65 * IN], 12); a.ell(sx, yc + 0.8 * IN, Z0 + H - 0.5 * IN, 0.7 * IN, 0.7 * IN, 0.5 * IN, 10, 5);
    a.box(sx - 0.15 * IN, yc - 0.6 * IN, Z0 + H - 4.2 * IN, sx + 0.15 * IN, yc, Z0 + H - 3.2 * IN); a.cyl(sx, yc + 0.8 * IN, Z0 + H - 0.4 * IN, Z0 + H - 0.1 * IN, 0.25 * IN, 8); a.ycyl(yc + 0.3 * IN - 0.7 * IN, yc, sx + 0.4 * IN, Z0 + H - 2.4 * IN, 0.2 * IN, 8);
    a.circ(sx, yc, R); a.circ(sx, yc, R * 0.38, 'EQUIP-DETAIL'); a.circ(sx, yc + 0.7 * IN, 0.8 * IN, 'EQUIP-DETAIL');
    if (v.heavy) { a.box(sx - 1.5 * IN, YB - 1.4 * IN, Z0, sx + 1.5 * IN, YB, Z0 + 2.4 * IN); a.cyl(sx, YB - 0.7 * IN, Z0 + 2.4 * IN, Z0 + 3 * IN, 0.35 * IN, 8); }
    if (v.throttle) { const tx = X1 - 4 * IN; a.box(tx - 3.5 * IN, YF + 1 * IN, Z0, tx + 3.5 * IN, YB - 1 * IN, Z0 + 1.2 * IN); prismX(a, [[YF + 1 * IN, Z0 + 1.2 * IN], [YB - 1 * IN, Z0 + 1.2 * IN], [YB - 1 * IN, Z0 + 3.2 * IN]], tx - 3.5 * IN, tx + 3.5 * IN); a.box(tx - 0.3 * IN, yc - 1 * IN, Z0 + 1.6 * IN, tx + 0.3 * IN, yc + 1 * IN, Z0 + 3 * IN); a.tube([[tx, yc - 1 * IN, Z0 + 2.2 * IN], [tx, yc, Z0 + 4.8 * IN], [tx, yc, Z0 + 6.2 * IN]], [0.5 * IN, 0.8 * IN, 0.7 * IN], 8); for (let k = 0; k < 4; k++) a.cyl(tx - 2.4 * IN + k * 1.6 * IN, YF + 2.4 * IN, Z0 + 1.2 * IN + (YB - YF) * 0, Z0 + 1.2 * IN + 0.6 * IN, 0.2 * IN, 6); a.rect(tx - 3.5 * IN, YF + 1 * IN, tx + 3.5 * IN, YB - 1 * IN); a.line(tx, YF + 1 * IN, tx, YB - 1 * IN, 'EQUIP-DETAIL'); }
    a.log('Added the weighted base, gaiter, leaning shaft and grip with trigger, hat switch and buttons, and the throttle quadrant or clamp where fitted (plan and 3D).');
  } }),

// ============================================================================================ speedrun/tracks
fam({ cat: 'speedrun/tracks', title: 'Generic long jump runway end and sand pit',
  desc: (v) => `${v.kind} long jump area: a timber-framed sand pit with a raked sand surface and two shallow mounds, a white take-off board and a plasticine indicator strip set into the runway end, a rubber runway apron, measuring tape marks along both sides, a leaning rake and a distance board on a post.`,
  vs: [
    ['club, 8 ft wide, 16 ft pit', 96, 288, 40, 0, { kind: 'Club', pit: 192 }],
    ['school, 9 ft wide, 20 ft pit', 108, 336, 40, 0, { kind: 'School', pit: 240 }],
    ['competition, 9 ft wide, 24 ft pit', 108, 384, 42, 0, { kind: 'Competition', pit: 288 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, pit = v.pit * IN / 12 * 1.0, py0 = YB - pit / 1, fr = 4 * IN;
    a.box(X0, py0, Z0, X1, YB, Z0 + 5 * IN); a.box(X0, YF, Z0, X1, py0, Z0 + 1.5 * IN); a.outline();
    a.box(X0 + 2 * IN, py0 + 2 * IN, Z0 + 5 * IN * 0.2, X1 - 2 * IN, YB - 2 * IN, Z0 + 4.4 * IN); for (const [f, g] of [[0.35, 0.3], [0.7, 0.25]]) a.ell(cx + (g - 0.3) * W * 0.4, py0 + pit * f, Z0 + 4.4 * IN, W * 0.28, 22 * IN, 3.2 * IN, 14, 5);
    for (const s of [-1, 1]) { a.box(s < 0 ? X0 : X1 - fr, py0, Z0 + 5 * IN, s < 0 ? X0 + fr : X1, YB, Z0 + 8.5 * IN); } a.box(X0, py0, Z0 + 5 * IN, X1, py0 + fr, Z0 + 8.5 * IN); a.box(X0, YB - fr, Z0 + 5 * IN, X1, YB, Z0 + 8.5 * IN);
    a.box(cx - 12 * IN, py0 - 20 * IN, Z0 + 1.5 * IN, cx + 12 * IN, py0 - 8 * IN, Z0 + 3 * IN); a.box(cx - 12 * IN, py0 - 8 * IN, Z0 + 1.5 * IN, cx + 12 * IN, py0, Z0 + 1.6 * IN); a.box(cx - W * 0.5, py0 - 20 * IN, Z0 + 1.5 * IN, X1, py0 - 8 * IN, Z0 + 3 * IN);
    a.rect(X0, py0 - 20 * IN, X1, py0 - 8 * IN, 'EQUIP-DETAIL'); a.rect(X0, py0 - 8 * IN, X1, py0, 'EQUIP-DETAIL'); for (let i = 1; i < 6; i++) a.line(X0 - 0 + 0.5 * IN, py0 + pit * i / 6, X0 + 5 * IN, py0 + pit * i / 6, 'EQUIP-DETAIL');
    for (const s of [-1, 1]) for (let i = 0; i < 12; i++) a.box(s < 0 ? X0 + 0.2 * IN : X1 - 0.8 * IN, py0 + 6 * IN + (pit - 12 * IN) * i / 11, Z0 + 8.5 * IN, s < 0 ? X0 + 0.8 * IN : X1 - 0.2 * IN, py0 + 7 * IN + (pit - 12 * IN) * i / 11, Z0 + 8.9 * IN);
    a.tube([[X1 + 0 - 12 * IN, py0 + pit * 0.2, Z0 + 5 * IN], [X1 - 14 * IN, py0 + pit * 0.2 + 4 * IN, Z0 + 5 * IN + 0.3 * IN]], [0.5 * IN, 0.5 * IN], 6);
    const rx = X0 + 14 * IN; a.tube([[rx, YB - fr / 2, Z0 + 8.5 * IN], [rx + 8 * IN, YB - fr / 2, Z0 + H - 2 * IN]], [0.55 * IN, 0.45 * IN], 6); a.box(rx - 7 * IN, YB - fr / 2 - 0.4 * IN, Z0 + 8.5 * IN, rx + 7 * IN, YB - fr / 2 + 0.4 * IN, Z0 + 9.5 * IN); for (let k = 0; k < 7; k++) a.box(rx - 6.6 * IN + k * 2.2 * IN, YB - fr / 2 - 0.2 * IN, Z0 + 9.5 * IN, rx - 6.2 * IN + k * 2.2 * IN, YB - fr / 2 + 0.2 * IN, Z0 + 12 * IN);
    const sx = X1 - 3 * IN; a.tube([[sx, YB - 2 * IN, Z0 + 8.5 * IN], [sx, YB - 2 * IN, Z0 + H - 8 * IN]], [0.6 * IN, 0.6 * IN], 6); a.box(sx - 8 * IN, YB - 2.6 * IN, Z0 + H - 22 * IN, sx + 3 * IN, YB - 1.6 * IN, Z0 + H - 8 * IN); digit(a, '8', sx - 6 * IN, Z0 + H - 20 * IN, 5 * IN, 10 * IN, 1.1 * IN, YB - 2.6 * IN); a.circ(sx, YB - 2 * IN, 0.6 * IN, 'EQUIP-DETAIL');
    a.log('Added the framed sand pit with mounds, take-off board, indicator strip, runway apron, tape marks, the leaning rake and the distance board on a post (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic high jump standards, bar and landing mat',
  desc: (v) => `${v.kind} high jump set: a foam landing mat with a cover and side flaps, two upright standards on weighted foot plates with a crank-height scale and bar supports, and a round crossbar${v.rain ? ', under a fitted rain cover with straps' : ''}.`,
  vs: [
    ['youth, 3.5 ft bar, 10 x 6 ft mat', 120, 108, 58, 0, { kind: 'Youth', bar: 42, mat: [120, 72, 16] }],
    ['school, 5 ft bar, 12 x 8 ft mat', 144, 120, 78, 0, { kind: 'School', bar: 60, mat: [144, 96, 22] }],
    ['competition, 7.5 ft bar, 16 x 10 ft mat', 216, 140, 114, 0, { kind: 'Competition', bar: 90, mat: [192, 120, 30] }],
    ['competition with rain cover, 6.5 ft bar', 216, 140, 100, 0, { kind: 'Competition', bar: 78, mat: [192, 120, 30], rain: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, [mw, md, mh] = v.mat.map((n) => n * IN), my0 = YB - md, bz = Z0 + v.bar * IN;
    a.box(cx - mw / 2, my0, Z0, cx + mw / 2, YB, Z0 + mh); a.ell(cx, (my0 + YB) / 2, Z0 + mh, mw * 0.48, md * 0.48, 1.5 * IN, 18, 5); a.outline(); a.rect(cx - mw / 2, my0, cx + mw / 2, YB, 'EQUIP-DETAIL');
    for (let i = 1; i < 4; i++) a.line(cx - mw / 2, my0 + md * i / 4, cx + mw / 2, my0 + md * i / 4, 'EQUIP-DETAIL'); a.box(cx - mw / 2 - 0.1 * IN, YB - 12 * IN, Z0 + 0.3 * IN, cx + mw / 2 + 0.1 * IN, YB - 1 * IN, Z0 + mh * 0.5);
    if (v.rain) { a.box(cx - mw / 2 - 1 * IN, my0 - 1 * IN, Z0 + mh, cx + mw / 2 + 1 * IN, YB + 0 * IN, Z0 + mh + 0.4 * IN); for (const x of [-0.3, 0.3]) a.box(cx + x * mw - 1 * IN, my0 - 1 * IN, Z0, cx + x * mw + 1 * IN, my0, Z0 + mh + 0.4 * IN); }
    const sx = [cx - W / 2 + 6 * IN, cx + W / 2 - 6 * IN], sy = YF + 8 * IN;
    for (const x of sx) { a.box(x - 5 * IN, sy - 8 * IN, Z0, x + 5 * IN, sy + 8 * IN, Z0 + 1.2 * IN); a.box(x - 1 * IN, sy - 1 * IN, Z0 + 1.2 * IN, x + 1 * IN, sy + 1 * IN, bz + 12 * IN); a.box(x - 0.8 * IN, sy - 1.8 * IN, Z0 + 12 * IN, x + 0.8 * IN, sy - 1 * IN, bz + 8 * IN); a.cyl(x, sy, bz + 12 * IN, bz + 13 * IN, 1.1 * IN, 10); a.box(x - 0.4 * IN, sy - 3 * IN, bz - 0.8 * IN, x + 0.4 * IN, sy - 1 * IN, bz); a.cyl(x + 2.2 * IN, sy - 0.5 * IN, Z0 + 20 * IN, Z0 + 21 * IN, 1.2 * IN, 8); for (let k = 1; k < 8; k++) a.box(x - 0.9 * IN, sy - 1.9 * IN, Z0 + 12 * IN + k * (bz - Z0 - 8 * IN) / 8, x + 0.9 * IN, sy - 1.8 * IN, Z0 + 12.3 * IN + k * (bz - Z0 - 8 * IN) / 8); a.rect(x - 5 * IN, sy - 8 * IN, x + 5 * IN, sy + 8 * IN, 'EQUIP-DETAIL'); }
    a.xcyl(sx[0] + 0.8 * IN, sx[1] - 0.8 * IN, sy - 3 * IN, bz + 0.5 * IN, 0.45 * IN, 8); a.line(sx[0], sy - 3 * IN, sx[1], sy - 3 * IN, 'EQUIP-DETAIL');
    a.log('Added the landing mat with cover and flaps, the foot plates, uprights with height scale and bar supports, the crossbar and the rain cover where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic scaffold tower for finish line photo camera',
  desc: (v) => `Four-post scaffold tower ${v.ft} ft high with diagonal braces on every face, a top platform with a toe board and rail, a wooden ladder rung set up one side, four adjustable screw feet and a camera box on a swivel head at the top.`,
  vs: [
    ['6 ft', 36, 36, 108, 0, { ft: 6 }],
    ['8 ft', 36, 36, 132, 0, { ft: 8 }],
    ['10 ft', 40, 40, 156, 0, { ft: 10 }],
    ['12 ft, wide base', 52, 52, 180, 0, { ft: 12 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, e = 3 * IN, pl = Z0 + v.ft * 12 * IN, px = [X0 + e, X1 - e], py = [YF + e, YB - e];
    for (const x of px) for (const y of py) { a.tube([[x, y, Z0 + 2 * IN], [x, y, pl]], [0.9 * IN, 0.9 * IN], 8); a.cyl(x, y, Z0, Z0 + 2.4 * IN, 1.4 * IN, 8); }
    const lv = [Z0 + 14 * IN, Z0 + (pl - Z0) * 0.5, pl - 8 * IN];
    for (const z of lv) { a.tube([[px[0], py[0], z], [px[1], py[0], z], [px[1], py[1], z], [px[0], py[1], z], [px[0], py[0], z]], Array(5).fill(0.55 * IN), 6); }
    for (let i = 0; i < lv.length - 1; i++) { const z0 = lv[i], z1 = lv[i + 1]; a.tube([[px[0], py[0], z0], [px[1], py[0], z1]], [0.4 * IN, 0.4 * IN], 5); a.tube([[px[1], py[1], z0], [px[0], py[1], z1]], [0.4 * IN, 0.4 * IN], 5); a.tube([[px[0], py[1], z0], [px[0], py[0], z1]], [0.4 * IN, 0.4 * IN], 5); a.tube([[px[1], py[0], z0], [px[1], py[1], z1]], [0.4 * IN, 0.4 * IN], 5); }
    a.box(X0, YF, pl, X1, YB, pl + 1.5 * IN); for (const s of [0, 1]) { a.box(X0, s ? YB - 1 * IN : YF, pl + 1.5 * IN, X1, s ? YB : YF + 1 * IN, pl + 6 * IN); a.box(s ? X1 - 1 * IN : X0, YF, pl + 1.5 * IN, s ? X1 : X0 + 1 * IN, YB, pl + 6 * IN); }
    for (let z = Z0 + 12 * IN; z < pl - 6 * IN; z += 12 * IN) a.tube([[px[0] + 1 * IN, py[0], z], [px[0] + 1 * IN, py[0] - 1.8 * IN, z]], [0.3 * IN, 0.3 * IN], 5);
    a.cyl(cx, yc, pl + 1.5 * IN, pl + 7 * IN, 1 * IN, 8); a.box(cx - 4 * IN, yc - 2.5 * IN, pl + 7 * IN, cx + 4 * IN, yc + 2.5 * IN, pl + 12 * IN); a.ycyl(yc - 4.5 * IN, yc - 2.5 * IN, cx, pl + 9.5 * IN, 1.6 * IN, 12);
    a.rect(X0, YF, X1, YB); for (const x of px) for (const y of py) a.circ(x, y, 1.2 * IN, 'EQUIP-DETAIL'); a.line(px[0], py[0], px[1], py[1], 'EQUIP-DETAIL'); a.line(px[0], py[1], px[1], py[0], 'EQUIP-DETAIL'); a.rect(cx - 4 * IN, yc - 2.5 * IN, cx + 4 * IN, yc + 2.5 * IN, 'EQUIP-DETAIL');
    a.log('Added the corner posts with screw feet, braced bays, platform with toe board, the camera box on a swivel head and the rungs (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic starter platform with steps and rail',
  desc: (v) => `Starting platform ${v.hh} in high: a decked top with a non-slip pattern of cross strips, a skirted frame, ${v.steps} steps up one side with side rails, a top safety rail on three sides, and a flag holder socket at one corner.`,
  vs: [
    ['24 in high, 2 steps', 48, 48, 66, 0, { hh: 24, steps: 2 }],
    ['36 in high, 3 steps', 54, 60, 78, 0, { hh: 36, steps: 3 }],
    ['48 in high, 4 steps', 54, 72, 90, 0, { hh: 48, steps: 4 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, hh = v.hh * IN, sd = v.steps * 11 * IN, px1 = X1 - 0, dk0 = YF + sd, dz = Z0 + hh;
    a.box(X0, dk0, dz - 2 * IN, X1, YB, dz); a.outline(); for (const x of [X0 + 2 * IN, X1 - 2 * IN]) for (const y of [dk0 + 2 * IN, YB - 2 * IN]) a.box(x - 1.5 * IN, y - 1.5 * IN, Z0, x + 1.5 * IN, y + 1.5 * IN, dz - 2 * IN);
    a.box(X0, dk0, Z0 + hh * 0.3, X1, dk0 + 0.8 * IN, dz - 2 * IN); a.box(X0, dk0, Z0 + hh * 0.3, X0 + 0.8 * IN, YB, dz - 2 * IN); a.box(X1 - 0.8 * IN, dk0, Z0 + hh * 0.3, X1, YB, dz - 2 * IN);
    for (let i = 0; i < 8; i++) a.box(X0 + 1 * IN, dk0 + 2 * IN + i * (YB - dk0 - 4 * IN) / 8, dz, X1 - 1 * IN, dk0 + 3 * IN + i * (YB - dk0 - 4 * IN) / 8, dz + 0.2 * IN);
    for (let i = 0; i < v.steps; i++) { const y0 = YF + (v.steps - 1 - i) * 11 * IN, zt = Z0 + hh * (i + 1) / (v.steps + 1) + hh * 0.1 * 0; a.box(cx - 18 * IN, y0, Z0, cx + 18 * IN, y0 + 11 * IN, Z0 + hh * (i + 1) / (v.steps + 1)); a.rect(cx - 18 * IN, y0, cx + 18 * IN, y0 + 11 * IN, 'EQUIP-DETAIL'); }
    for (const s of [-1, 1]) { a.tube([[cx + s * 18 * IN, YF + 1 * IN, Z0 + 30 * IN * 0.8 + hh / (v.steps + 1)], [cx + s * 18 * IN, dk0 - 1 * IN, dz + 30 * IN]].map(([x, y, z], i) => [x, y, i ? dz + 30 * IN : Z0 + hh / (v.steps + 1) + 28 * IN]), [0.6 * IN, 0.6 * IN], 6); a.tube([[cx + s * 18 * IN, YF + 1 * IN, Z0], [cx + s * 18 * IN, YF + 1 * IN, Z0 + hh / (v.steps + 1) + 28 * IN]], [0.5 * IN, 0.5 * IN], 6); }
    const rz = dz + 36 * IN; for (const [x, y] of [[X0 + 1 * IN, YB - 1 * IN], [X1 - 1 * IN, YB - 1 * IN], [X0 + 1 * IN, dk0 + 12 * IN], [X1 - 1 * IN, dk0 + 12 * IN]]) a.tube([[x, y, dz], [x, y, rz]], [0.5 * IN, 0.5 * IN], 6);
    a.tube([[X0 + 1 * IN, dk0 + 12 * IN, rz], [X0 + 1 * IN, YB - 1 * IN, rz], [X1 - 1 * IN, YB - 1 * IN, rz], [X1 - 1 * IN, dk0 + 12 * IN, rz]], Array(4).fill(0.55 * IN), 6); a.tube([[X0 + 1 * IN, dk0 + 12 * IN, dz + 18 * IN], [X0 + 1 * IN, YB - 1 * IN, dz + 18 * IN], [X1 - 1 * IN, YB - 1 * IN, dz + 18 * IN], [X1 - 1 * IN, dk0 + 12 * IN, dz + 18 * IN]], Array(4).fill(0.4 * IN), 6);
    a.cyl(X1 - 3 * IN, YB - 3 * IN, dz, dz + 3 * IN, 1.1 * IN, 8);
    a.log('Added the skirted frame and legs, the decked top with strips, steps with side rails, the safety rail and the flag socket (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic lap number flip board on frame',
  desc: (v) => `${v.kind} lap board: a framed panel showing the number ${v.num} in separate seven-segment bars${v.two ? ' on both faces' : ''}, a hand flip bar at the top, on ${v.two ? 'an A-frame' : 'a tube easel'} with two leg tubes, a cross brace and rubber feet.`,
  vs: [
    ['small, 24 x 18 in', 26, 24, 40, 0, { kind: 'Small', num: 5, pw: 24, ph: 18, two: false }],
    ['standard, 30 x 24 in, two faces', 34, 34, 56, 0, { kind: 'Standard', num: 3, pw: 30, ph: 24, two: true }],
    ['large, 36 x 30 in, two faces', 40, 40, 70, 0, { kind: 'Large', num: 8, pw: 36, ph: 30, two: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, pw = v.pw * IN, ph = v.ph * IN, zp = Z0 + H - ph - 2 * IN, ty = v.two ? yc - 1 * IN : YF + 3 * IN;
    a.box(cx - pw / 2, ty, zp, cx + pw / 2, ty + 1.2 * IN, zp + ph); a.frame(cx - pw / 2 - 0.5 * IN, zp - 0.5 * IN, cx + pw / 2 + 0.5 * IN, zp + ph + 0.5 * IN, ty - 0.4 * IN, ty + 1.6 * IN, 1 * IN);
    digit(a, String(v.num), cx - pw * 0.28, zp + ph * 0.12, pw * 0.56, ph * 0.76, pw * 0.1, ty); if (v.two) digit(a, String(v.num), cx - pw * 0.28, zp + ph * 0.12, pw * 0.56, ph * 0.76, pw * 0.1, ty); 
    if (v.two) { for (const s of [-1, 1]) { a.tube([[cx + s * pw * 0.42, yc, zp + ph * 0.7], [cx + s * pw * 0.45, YF + 2 * IN, Z0 + 1 * IN]], [0.8 * IN, 0.7 * IN], 6); a.tube([[cx + s * pw * 0.42, yc, zp + ph * 0.7], [cx + s * pw * 0.45, YB - 2 * IN, Z0 + 1 * IN]], [0.8 * IN, 0.7 * IN], 6); for (const y of [YF + 2 * IN, YB - 2 * IN]) a.cyl(cx + s * pw * 0.45, y, Z0, Z0 + 1.2 * IN, 1 * IN, 8); } a.tube([[cx - pw * 0.44, YF + 6 * IN, Z0 + 14 * IN], [cx + pw * 0.44, YF + 6 * IN, Z0 + 14 * IN]], [0.5 * IN, 0.5 * IN], 6); }
    else { for (const s of [-1, 1]) { a.tube([[cx + s * pw * 0.4, ty + 0.5 * IN, zp + 2 * IN], [cx + s * pw * 0.4, ty + 0.5 * IN, Z0 + 1 * IN]], [0.7 * IN, 0.7 * IN], 6); a.box(cx + s * pw * 0.4 - 1.2 * IN, ty - 2 * IN, Z0, cx + s * pw * 0.4 + 1.2 * IN, YB - 2 * IN, Z0 + 1.2 * IN); } a.tube([[cx, ty + 0.5 * IN, zp + 2 * IN], [cx, YB - 3 * IN, Z0 + 1.2 * IN]], [0.6 * IN, 0.6 * IN], 6); }
    a.tube([[cx - pw * 0.3, ty + 0.3 * IN, zp + ph + 0.5 * IN], [cx - pw * 0.3, ty + 0.3 * IN, zp + ph + 2.5 * IN], [cx + pw * 0.3, ty + 0.3 * IN, zp + ph + 2.5 * IN], [cx + pw * 0.3, ty + 0.3 * IN, zp + ph + 0.5 * IN]], Array(4).fill(0.4 * IN), 6);
    a.rect(cx - pw / 2, ty, cx + pw / 2, ty + 1.2 * IN); a.outline(); for (const s of [-1, 1]) a.circ(cx + s * pw * 0.45, v.two ? YF + 2 * IN : YB - 2 * IN, 1 * IN, 'EQUIP-DETAIL');
    a.log('Added the framed panel with seven-segment lap number, the flip bar, the legs with cross brace and the feet (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic relay baton rack with batons',
  desc: (v) => `Upright rack for ${v.n} relay batons: a weighted base with a wooden top rail drilled with ${v.n} holes, a lower guide rail, and ${v.n} hollow tube batons standing in it each with a coloured band near the top and a rubber end cap.`,
  vs: [
    ['4 batons', 12, 6, 14, 0, { n: 4 }],
    ['6 batons', 17, 6, 14, 0, { n: 6 }],
    ['8 batons, two-row', 20, 10, 14, 0, { n: 8, rows: 2 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, rows = v.rows || 1, per = v.n / rows, pitch = (W - 2 * IN) / per;
    a.box(X0, YF, Z0, X1, YB, Z0 + 1.2 * IN); a.outline(); for (const s of [-1, 1]) { a.box(s < 0 ? X0 + 0.5 * IN : X1 - 1.5 * IN, YF + 0.5 * IN, Z0 + 1.2 * IN, s < 0 ? X0 + 1.5 * IN : X1 - 0.5 * IN, YB - 0.5 * IN, Z0 + 8 * IN); }
    a.box(X0 + 0.5 * IN, YF + 0.5 * IN, Z0 + 7 * IN, X1 - 0.5 * IN, YB - 0.5 * IN, Z0 + 8 * IN); a.box(X0 + 0.5 * IN, YF + 0.5 * IN, Z0 + 3 * IN, X1 - 0.5 * IN, YB - 0.5 * IN, Z0 + 3.6 * IN);
    for (let r = 0; r < rows; r++) for (let i = 0; i < per; i++) { const x = X0 + 1 * IN + pitch * (i + 0.5), y = rows === 1 ? yc : (r ? YB - 2.4 * IN : YF + 2.4 * IN); a.cyl(x, y, Z0 + 1.2 * IN, Z0 + H, 0.55 * IN, 10); a.cyl(x, y, Z0 + H - 3 * IN, Z0 + H - 2 * IN, 0.6 * IN, 10); a.cyl(x, y, Z0 + 1.2 * IN, Z0 + 1.6 * IN, 0.62 * IN, 10); a.circ(x, y, 0.55 * IN, 'EQUIP-DETAIL'); a.circ(x, y, 0.25 * IN, 'EQUIP-HIDDEN'); }
    a.log('Added the base, side uprights, drilled top rail and guide rail, and the banded batons (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic tyre stack chicane barrier, kart track',
  desc: (v) => `${v.kind} barrier: ${v.rows > 1 ? `${v.rows} rows of ` : ''}${v.n} stacks of ${v.hi} tyres each (tyre rings with tread bands) tied with a strap band and bolted to a plank base${v.paint ? ', with a painted band on the top tyre' : ''}.`,
  vs: [
    ['3 stacks of 2 tyres', 66, 24, 24, 0, { kind: 'Low', n: 3, hi: 2, rows: 1 }],
    ['4 stacks of 3 tyres, painted top', 88, 24, 36, 0, { kind: 'Painted', n: 4, hi: 3, rows: 1, paint: true }],
    ['3 stacks of 2 tyres in two rows', 66, 48, 24, 0, { kind: 'Double-row', n: 3, hi: 2, rows: 2 }],
    ['5 stacks of 3 tyres, pyramid ends', 110, 24, 36, 0, { kind: 'Long', n: 5, hi: 3, rows: 1, paint: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, R = 11 * IN, r = 3.6 * IN, th = 7.2 * IN, bw = 2.4 * IN, pitch = (W - 2 * R) / (v.n - 1 || 1);
    a.box(X0, YF, Z0, X1, YB, Z0 + 1.5 * IN); a.outline();
    for (let rw = 0; rw < v.rows; rw++) for (let i = 0; i < v.n; i++) { const x = X0 + R + (v.n > 1 ? pitch * i : 0), y = v.rows === 1 ? yc : YF + R + rw * (D - 2 * R);
      for (let k = 0; k < v.hi; k++) { const z = Z0 + 1.5 * IN + r + k * th; ringXY(a, x, y, z, R - r, r, 18); a.cyl(x, y, z - 0.6 * IN, z + 0.6 * IN, R - 2 * r, 14); }
      a.tube([[x, y - R, Z0 + 1.5 * IN], [x, y - R, Z0 + 1.5 * IN + v.hi * th]], [0.3 * IN, 0.3 * IN], 5); a.box(x - R * 0.9, y - R - 0.5 * IN, Z0 + 1.5 * IN + th * v.hi * 0.45, x + R * 0.9, y - R + 0.1 * IN, Z0 + 1.5 * IN + th * v.hi * 0.45 + 1 * IN);
      if (v.paint) a.cyl(x, y, Z0 + 1.5 * IN + th * (v.hi - 1) + r * 1.6, Z0 + 1.5 * IN + th * v.hi - 0.3 * IN + 0.4 * IN, R * 0.99, 18);
      a.circ(x, y, R, 'EQUIP-DETAIL'); a.circ(x, y, R - 2 * r, 'EQUIP-DETAIL'); }
    a.log('Added the plank base, the stacked tyre rings with tread, the strap bands and the painted top where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic slot car pit garage building, scale',
  desc: (v) => `Scale pit garage with ${v.n} bays: a flat base, back and side walls, a roof slab with a name board, ${v.n} open bays split by pillars, a rolled-up door drum above each bay, a floor lamp each and a small workbench shelf in the end bay.`,
  vs: [
    ['2 bays', 12, 8, 6, 0, { n: 2 }],
    ['3 bays', 17, 8, 6, 0, { n: 3 }],
    ['4 bays, long', 22, 9, 6.5, 0, { n: 4 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, bw = (W - 1.2 * IN) / v.n, t = 0.4 * IN, hh = H - 1.2 * IN;
    a.box(X0, YF, Z0, X1, YB, Z0 + 0.3 * IN); a.outline(); a.box(X0, YB - t, Z0 + 0.3 * IN, X1, YB, Z0 + 0.3 * IN + hh); for (const s of [-1, 1]) a.box(s < 0 ? X0 : X1 - t, YF + 1 * IN, Z0 + 0.3 * IN, s < 0 ? X0 + t : X1, YB, Z0 + 0.3 * IN + hh);
    a.box(X0 - 0.0 * IN, YF + 0.6 * IN, Z0 + 0.3 * IN + hh, X1, YB, Z0 + H - 0.8 * IN); a.box(X0 + 0.5 * IN, YF + 0.4 * IN, Z0 + H - 0.8 * IN, X1 - 0.5 * IN, YF + 0.7 * IN, Z0 + H); a.rect(X0, YF + 0.6 * IN, X1, YB, 'EQUIP-DETAIL');
    for (let i = 0; i <= v.n; i++) { const x = X0 + 0.6 * IN + i * bw; if (i > 0 && i < v.n) a.box(x - 0.2 * IN, YF + 1.2 * IN, Z0 + 0.3 * IN, x + 0.2 * IN, YF + 1.6 * IN, Z0 + 0.3 * IN + hh); }
    for (let i = 0; i < v.n; i++) { const x = X0 + 0.6 * IN + bw * (i + 0.5); a.xcyl(x - bw * 0.4, x + bw * 0.4, YF + 1.4 * IN, Z0 + 0.3 * IN + hh - 0.4 * IN, 0.35 * IN, 8); a.tube([[x + bw * 0.3, YB - 0.6 * IN, Z0 + 0.3 * IN + hh], [x + bw * 0.3, YB - 0.6 * IN, Z0 + 0.3 * IN + hh - 0.5 * IN], [x + bw * 0.4, YB - 1 * IN, Z0 + 0.3 * IN + hh - 0.6 * IN]], [0.05 * IN, 0.05 * IN, 0.2 * IN], 5); a.rect(x - bw * 0.4, YF + 1 * IN, x + bw * 0.4, YF + 1.8 * IN, 'EQUIP-DETAIL'); }
    a.box(X1 - bw * 0.7, YB - 2 * IN, Z0 + 0.3 * IN + 1.6 * IN, X1 - 0.6 * IN, YB - t, Z0 + 0.3 * IN + 1.8 * IN); a.box(X1 - bw * 0.7, YB - 2 * IN, Z0 + 0.3 * IN, X1 - bw * 0.7 + 0.2 * IN, YB - 2 * IN + 0.2 * IN, Z0 + 0.3 * IN + 1.6 * IN);
    a.log('Added the base, walls, roof with name board, pillars, door drums, lamps and the bench shelf (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic slot car body with chassis and wheels',
  desc: (v) => `${v.kind} slot car: ${v.kind === 'Open-wheel' ? 'a narrow single-seat nose and tub with a rear engine cover, a front and rear wing on end plates and four exposed wheels' : v.kind === 'Saloon' ? 'a three-box saloon body with a windscreen, side glass and roof, four wheels under arches' : 'a low sports body with a sloped nose, bubble canopy and tail, four wheels under arches'}, a pickup guide blade under the nose and a rear axle with two gears.`,
  vs: [
    ['coupe, 5.5 in', 2.5, 5.5, 1.4, 0, { kind: 'Coupe', L: 5.5 }],
    ['open-wheel, 6 in', 3, 6, 1.7, 0, { kind: 'Open-wheel', L: 6 }],
    ['saloon, 5.8 in', 2.6, 5.8, 1.6, 0, { kind: 'Saloon', L: 5.8 }],
    ['large coupe, 7.5 in', 3.2, 7.5, 1.8, 0, { kind: 'Coupe', L: 7.5 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, wr = H * 0.26, ax = [YF + D * 0.2, YB - D * 0.2], bz = Z0 + wr * 0.8;
    if (v.kind === 'Open-wheel') {
      hull(a, [[cx - W * 0.12, YF, bz], [cx + W * 0.12, YF, bz], [cx - W * 0.1, YF + 0.5 * IN, bz + H * 0.3], [cx + W * 0.1, YF + 0.5 * IN, bz + H * 0.3], [cx - W * 0.22, yc, bz], [cx + W * 0.22, yc, bz], [cx - W * 0.2, yc, bz + H * 0.45], [cx + W * 0.2, yc, bz + H * 0.45], [cx - W * 0.16, YB - 1 * IN, bz], [cx + W * 0.16, YB - 1 * IN, bz], [cx - W * 0.14, YB - 1 * IN, bz + H * 0.6], [cx + W * 0.14, YB - 1 * IN, bz + H * 0.6]]);
      a.box(cx - W * 0.45, YF, bz + 0.05 * IN, cx + W * 0.45, YF + 0.5 * IN, bz + 0.1 * IN + 0.1 * IN); for (const s of [-1, 1]) { a.box(cx + s * W * 0.45 - 0.04 * IN, YF, bz, cx + s * W * 0.45 + 0.04 * IN, YF + 0.6 * IN, bz + 0.4 * IN); a.box(cx + s * W * 0.46 - 0.04 * IN, YB - 0.8 * IN, bz, cx + s * W * 0.46 + 0.04 * IN, YB, Z0 + H); }
      a.box(cx - W * 0.46, YB - 0.8 * IN, Z0 + H - 0.1 * IN, cx + W * 0.46, YB, Z0 + H); a.ell(cx, yc + D * 0.05, bz + H * 0.5, 0.3 * IN, 0.4 * IN, 0.3 * IN, 8, 5);
      for (const y of ax) for (const s of [-1, 1]) a.xcyl(cx + s * W * 0.34, cx + s * W * 0.5, y, Z0 + wr, wr, 14);
    } else {
      const tr = v.kind === 'Saloon'; hull(a, [[cx - W * 0.4, YF + 0.3 * IN, bz], [cx + W * 0.4, YF + 0.3 * IN, bz], [cx - W * 0.35, YF, bz + H * 0.35], [cx + W * 0.35, YF, bz + H * 0.35], [cx - W * 0.46, yc, bz], [cx + W * 0.46, yc, bz], [cx - W * 0.44, yc, bz + H * 0.45], [cx + W * 0.44, yc, bz + H * 0.45], [cx - W * 0.42, YB - 0.2 * IN, bz], [cx + W * 0.42, YB - 0.2 * IN, bz], [cx - W * 0.4, YB, bz + H * (tr ? 0.45 : 0.4)], [cx + W * 0.4, YB, bz + H * (tr ? 0.45 : 0.4)]]);
      const cy0 = tr ? yc - D * 0.2 : yc - D * 0.15, cy1 = tr ? yc + D * 0.25 : yc + D * 0.2; hull(a, [[cx - W * 0.34, cy0, bz + H * 0.44], [cx + W * 0.34, cy0, bz + H * 0.44], [cx - W * 0.34, cy1, bz + H * 0.44], [cx + W * 0.34, cy1, bz + H * 0.44], [cx - W * 0.26, cy0 + D * 0.08, Z0 + H], [cx + W * 0.26, cy0 + D * 0.08, Z0 + H], [cx - W * 0.26, cy1 - D * 0.08, Z0 + H], [cx + W * 0.26, cy1 - D * 0.08, Z0 + H]]);
      for (const y of ax) for (const s of [-1, 1]) a.xcyl(cx + s * W * 0.4, cx + s * W * 0.5, y, Z0 + wr, wr, 14);
    }
    a.box(cx - 0.05 * IN, YF + D * 0.04, Z0, cx + 0.05 * IN, YF + D * 0.2, bz); a.xcyl(cx - W * 0.4, cx + W * 0.4, ax[1], Z0 + wr, 0.05 * IN, 6); a.xcyl(cx - W * 0.1, cx + W * 0.1, ax[1], Z0 + wr, wr * 0.5, 10);
    a.outline(); a.rect(cx - W * 0.4, ax[0] - wr, cx - W * 0.5, ax[0] + wr, 'EQUIP-DETAIL'); a.rect(cx + W * 0.4, ax[0] - wr, cx + W * 0.5, ax[0] + wr, 'EQUIP-DETAIL'); a.rect(cx - W * 0.4, ax[1] - wr, cx - W * 0.5, ax[1] + wr, 'EQUIP-DETAIL'); a.rect(cx + W * 0.4, ax[1] - wr, cx + W * 0.5, ax[1] + wr, 'EQUIP-DETAIL');
    a.log('Added the hulled body and canopy or wings, four wheels with an axle and gears, and the guide blade (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic marshal shelter hut, trackside',
  desc: (v) => `${v.n}-person trackside marshal hut: four corner posts, a sloped roof with an eave overhang, three clad walls, an open front with a counter rail, ${v.n === 1 ? 'a stool' : 'two stools'}, a flag rack of three poles on the side wall and a roof beacon.`,
  vs: [
    ['one-person, 4 x 4 ft', 48, 48, 96, 0, { n: 1 }],
    ['two-person, 6 x 4 ft', 72, 48, 96, 0, { n: 2 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, e = 4 * IN;
    a.box(X0, YF, Z0, X1, YB, Z0 + 3 * IN); a.outline(); for (const x of [X0 + 2 * IN, X1 - 2 * IN]) for (const y of [YF + e, YB - 2 * IN]) a.box(x - 1.5 * IN, y - 1.5 * IN, Z0 + 3 * IN, x + 1.5 * IN, y + 1.5 * IN, Z0 + H - 14 * IN + (y === YB - 2 * IN ? 0 : 6 * IN));
    a.box(X0 + 0.5 * IN, YB - 1 * IN, Z0 + 3 * IN, X1 - 0.5 * IN, YB, Z0 + 84 * IN); for (const s of [-1, 1]) a.box(s < 0 ? X0 + 0.5 * IN : X1 - 1.5 * IN, YF + e, Z0 + 3 * IN, s < 0 ? X0 + 1.5 * IN : X1 - 0.5 * IN, YB, Z0 + 80 * IN);
    prismX(a, [[YF, Z0 + 86 * IN], [YB + 2 * IN, Z0 + 80 * IN], [YB + 2 * IN, Z0 + 83 * IN], [YF, Z0 + 89 * IN]], X0 - 3 * IN, X1 + 3 * IN - 0.0);
    a.box(X0 + 1.5 * IN, YF + e, Z0 + 38 * IN, X1 - 1.5 * IN, YF + e + 1 * IN, Z0 + 40 * IN); a.tube([[X0 + 1.5 * IN, YF + e + 0.5 * IN, Z0 + 3 * IN], [X0 + 1.5 * IN, YF + e + 0.5 * IN, Z0 + 38 * IN]], [0.4 * IN, 0.4 * IN], 5);
    for (let i = 0; i < v.n; i++) { const x = X0 + W * (i + 0.5) / v.n; a.cyl(x, yc + 4 * IN, Z0 + 3 * IN + 16 * IN, Z0 + 3 * IN + 17.5 * IN, 6 * IN, 12); for (let k = 0; k < 3; k++) { const t = k * TAU / 3 + 1; a.tube([[x, yc + 4 * IN, Z0 + 3 * IN + 16 * IN], [x + 5 * IN * m.cos(t), yc + 4 * IN + 5 * IN * m.sin(t), Z0 + 3 * IN]], [0.5 * IN, 0.4 * IN], 5); } }
    for (const [i, c] of [[0, 1], [1, 2], [2, 3]]) { const y = yc - 6 * IN + i * 6 * IN; a.tube([[X1 - 2.5 * IN, y, Z0 + 20 * IN], [X1 - 2.5 * IN, y, Z0 + 70 * IN]], [0.35 * IN, 0.35 * IN], 5); a.box(X1 - 6 * IN, y - 0.1 * IN, Z0 + 55 * IN + c * 3 * IN, X1 - 2.7 * IN, y + 0.1 * IN, Z0 + 68 * IN + c * 3 * IN * 0); }
    a.cyl(cx, YB - 6 * IN, Z0 + 89 * IN, Z0 + H - 4 * IN, 1.5 * IN, 10); a.ell(cx, YB - 6 * IN, Z0 + H - 3 * IN, 2 * IN, 2 * IN, 3 * IN, 10, 6);
    a.rect(X0 - 3 * IN, YF, X1 + 3 * IN, YB + 2 * IN, 'EQUIP-HIDDEN'); a.line(X0 + 2 * IN, YF + e, X1 - 2 * IN, YF + e, 'EQUIP-DETAIL');
    a.log('Added the floor, posts, three walls, the sloped roof, counter rail, stools, flag rack and the beacon (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic athletics wind gauge on tripod',
  desc: (v) => `${v.kind} wind gauge: a three-cup rotor with a vane on a vertical spindle, a body with a small display window and two buttons, on a three-leg tripod with a centre column${v.board ? ' and a stand-alone read-out board on its own post beside it' : ''}.`,
  vs: [
    ['handheld style on short tripod', 18, 18, 48, 0, { kind: 'Short', col: 30 }],
    ['full tripod, 4 ft', 28, 28, 64, 0, { kind: 'Full-height', col: 46 }],
    ['full tripod with read-out board', 40, 28, 64, 0, { kind: 'Full-height', col: 46, board: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, gx = v.board ? X0 + 14 * IN : cx, zc = Z0 + v.col * IN;
    legs3(a, gx, yc, zc, Z0, (v.board ? 12 * IN : W / 2 - 1.5 * IN), 0.45 * IN); a.tube([[gx, yc, zc - 6 * IN], [gx, yc, zc + 4 * IN]], [0.7 * IN, 0.6 * IN], 8); a.box(gx - 2.4 * IN, yc - 1.4 * IN, zc + 4 * IN, gx + 2.4 * IN, yc + 1.4 * IN, zc + 8 * IN);
    a.box(gx - 1.4 * IN, yc - 1.6 * IN, zc + 5 * IN, gx + 1.4 * IN, yc - 1.4 * IN, zc + 6.6 * IN); for (const s of [-1, 1]) a.cyl(gx + s * 0.8 * IN, yc - 1.6 * IN, zc + 4.5 * IN, zc + 4.7 * IN, 0.25 * IN, 6);
    a.tube([[gx, yc, zc + 8 * IN], [gx, yc, zc + 15 * IN]], [0.3 * IN, 0.25 * IN], 6); for (let i = 0; i < 3; i++) { const t = i * TAU / 3; a.tube([[gx, yc, zc + 13 * IN], [gx + 2.8 * IN * m.cos(t), yc + 2.8 * IN * m.sin(t), zc + 13 * IN]], [0.15 * IN, 0.15 * IN], 5); a.ell(gx + 3.4 * IN * m.cos(t), yc + 3.4 * IN * m.sin(t), zc + 13 * IN, 0.8 * IN, 0.8 * IN, 0.9 * IN, 8, 5); }
    a.box(gx - 0.1 * IN, yc, zc + 15 * IN, gx + 0.1 * IN, yc + 2.4 * IN, zc + 16.4 * IN);
    a.circ(gx, yc, (v.board ? 12 * IN : W / 2 - 1.5 * IN), 'EQUIP-DETAIL'); a.circ(gx, yc, 3.9 * IN, 'EQUIP-DETAIL'); a.rect(gx - 2.4 * IN, yc - 1.4 * IN, gx + 2.4 * IN, yc + 1.4 * IN);
    if (v.board) { const bx = X1 - 8 * IN; a.box(bx - 0.8 * IN, yc - 0.8 * IN, Z0, bx + 0.8 * IN, yc + 0.8 * IN, Z0 + 50 * IN); a.box(bx - 7 * IN, yc - 1 * IN, Z0 + 46 * IN, bx + 7 * IN, yc + 1 * IN, Z0 + 62 * IN); digit(a, '2', bx - 5.5 * IN, Z0 + 49 * IN, 4 * IN, 10 * IN, 0.8 * IN, yc - 1 * IN); digit(a, '4', bx + 0.5 * IN, Z0 + 49 * IN, 4 * IN, 10 * IN, 0.8 * IN, yc - 1 * IN); a.box(bx - 6 * IN, yc - 3 * IN, Z0, bx + 6 * IN, yc + 3 * IN, Z0 + 1 * IN); a.rect(bx - 7 * IN, yc - 1 * IN, bx + 7 * IN, yc + 1 * IN, 'EQUIP-DETAIL'); a.rect(bx - 6 * IN, yc - 3 * IN, bx + 6 * IN, yc + 3 * IN, 'EQUIP-DETAIL'); }
    a.log('Added the tripod legs and column, the body with display and buttons, the cup rotor and vane, and the read-out board where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic track measuring wheel with counter',
  desc: (v) => `Walking measuring wheel of ${v.circ} m circumference: a spoked wheel with a tyre and rim, a fork, a telescoping handle with a grip, a counter box with a reset button and a fold-down prop leg${v.stand ? ' and a stand bar so it stays upright' : ''}.`,
  vs: [
    ['1 m circumference', 28, 4, 40, 0, { circ: 1, r: 6.3, stand: true }],
    ['2 m circumference', 44, 5, 52, 0, { circ: 2, r: 12.5, stand: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, r = v.r * IN, zc = Z0 + r + 0.6 * IN, wx = X0 + r + 1 * IN;
    a.ycyl(yc - 0.5 * IN, yc + 0.5 * IN, wx, zc, r, 26); ringXZ(a, wx, yc, zc, r * 0.97, 0.4 * IN, 26); a.ycyl(yc - 0.8 * IN, yc + 0.8 * IN, wx, zc, r * 0.14, 12);
    for (let i = 0; i < 6; i++) { const t = i * TAU / 6; a.tube([[wx, yc, zc], [wx + r * 0.95 * m.cos(t), yc, zc + r * 0.95 * m.sin(t)]], [0.25 * IN, 0.2 * IN], 5); }
    a.tube([[wx, yc - 1 * IN, zc], [wx + r * 0.1, yc - 1 * IN, zc + r * 0.9], [wx + r * 0.1 + 2 * IN, yc - 1 * IN, Z0 + H * 0.7]], [0.4 * IN, 0.4 * IN, 0.45 * IN], 6); a.tube([[wx, yc + 1 * IN, zc], [wx + r * 0.1, yc + 1 * IN, zc + r * 0.9], [wx + r * 0.1 + 2 * IN, yc + 1 * IN, Z0 + H * 0.7]], [0.4 * IN, 0.4 * IN, 0.45 * IN], 6);
    a.tube([[wx + r * 0.1 + 2 * IN, yc, Z0 + H * 0.7], [X1 - 2 * IN, yc, Z0 + H - 3 * IN]], [0.4 * IN, 0.35 * IN], 8); a.tube([[X1 - 3.5 * IN, yc, Z0 + H - 2.4 * IN], [X1 - 0.5 * IN, yc, Z0 + H - 3.6 * IN]], [0.55 * IN, 0.55 * IN], 8);
    a.box(wx + r * 0.1 + 0.5 * IN, yc - 1.4 * IN, Z0 + H * 0.7 - 2.5 * IN, wx + r * 0.1 + 4.5 * IN, yc + 1.4 * IN, Z0 + H * 0.7 + 1 * IN); a.box(wx + r * 0.1 + 1 * IN, yc - 1.5 * IN, Z0 + H * 0.7 - 1.5 * IN, wx + r * 0.1 + 3.8 * IN, yc - 1.4 * IN, Z0 + H * 0.7 + 0.2 * IN); a.cyl(wx + r * 0.1 + 2 * IN, yc, Z0 + H * 0.7 + 1 * IN, Z0 + H * 0.7 + 1.5 * IN, 0.4 * IN, 8);
    if (v.stand) a.tube([[wx + r * 0.1 + 2 * IN, yc, Z0 + H * 0.5], [X1 - 1 * IN, yc, Z0 + 0.2 * IN]], [0.3 * IN, 0.3 * IN], 6);
    a.circ(wx, yc, 0.5 * IN, 'EQUIP-DETAIL'); a.rect(wx - 0.5 * IN, yc - r, wx + 0.5 * IN, yc + r); a.line(wx, yc, X1 - 2 * IN, yc, 'EQUIP-DETAIL');
    a.log('Added the spoked wheel and tyre, the fork, the telescoping handle with grip, the counter box and the prop leg (plan and 3D).');
  } }),

// ============================================================================================ speedrun/trophies
fam({ cat: 'speedrun/trophies', title: 'Generic perpetual shield on wooden plinth',
  desc: (v) => `${v.kind} shield award: a kite-shaped metal shield with a raised rim and a centre boss${v.wings ? ', two side wings of smaller shields' : ''}, on a stepped wooden plinth with ${v.pl} engraving plates on the front face.`,
  vs: [
    ['8 in shield', 9, 4, 12, 0, { kind: 'Small', sw: 8, pl: 1 }],
    ['12 in shield', 13, 5, 17, 0, { kind: 'Medium', sw: 12, pl: 2 }],
    ['16 in shield', 17, 6, 22, 0, { kind: 'Large', sw: 16, pl: 3 }],
    ['20 in shield with side wings', 36, 6, 24, 0, { kind: 'Winged', sw: 18, pl: 4, wings: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, bh = H * 0.28;
    a.box(X0, YF, Z0, X1, YB, Z0 + bh * 0.45); a.box(X0 + 0.5 * IN, YF + 0.5 * IN, Z0 + bh * 0.45, X1 - 0.5 * IN, YB - 0.5 * IN, Z0 + bh); a.outline();
    const sw = v.sw * IN / 2, zs = Z0 + bh, sh = H - bh - 0.3 * IN, ys = yc - 0.4 * IN, ts = 0.9 * IN;
    const shield = (x, k) => { const w = sw * k, h = sh * k, z0 = zs + (sh - h) * 0.0; prismY(a, [[x - w, z0 + h * 0.62], [x - w * 0.9, z0 + h], [x + w * 0.9, z0 + h], [x + w, z0 + h * 0.62], [x + w * 0.55, z0 + h * 0.2], [x, z0], [x - w * 0.55, z0 + h * 0.2]], ys, ys + ts); prismY(a, [[x - w * 0.75, z0 + h * 0.62], [x - w * 0.68, z0 + h * 0.9], [x + w * 0.68, z0 + h * 0.9], [x + w * 0.75, z0 + h * 0.62], [x + w * 0.4, z0 + h * 0.3], [x, z0 + h * 0.15], [x - w * 0.4, z0 + h * 0.3]], ys - 0.2 * IN, ys); a.cyl(x, ys - 0.3 * IN, z0 + h * 0.5, z0 + h * 0.5, 0.01, 4); a.ycyl(ys - 0.6 * IN, ys - 0.2 * IN, x, z0 + h * 0.55, w * 0.22, 14); };
    shield(cx, 1); if (v.wings) for (const s of [-1, 1]) { shield(cx + s * (sw + 4.2 * IN), 0.5); }
    for (const [x, z] of [[cx - sw * 0.7, zs + 0.2 * IN], [cx + sw * 0.7, zs + 0.2 * IN]]) a.box(x - 0.6 * IN, yc - 1.4 * IN, Z0 + bh, x + 0.6 * IN, yc + 1.4 * IN, z + 0.3 * IN);
    const pw = (W - 2 * IN) / v.pl; for (let i = 0; i < v.pl; i++) { const x = X0 + 1 * IN + pw * (i + 0.5), w2 = Math.min(pw * 0.4, 2.2 * IN); a.box(x - w2, YF - 0.15 * IN, Z0 + bh * 0.62, x + w2, YF + 0.05 * IN, Z0 + bh * 0.82); a.rect(x - w2, YF, x + w2, YF + 0.3 * IN, 'EQUIP-DETAIL'); }
    a.rect(cx - sw, ys, cx + sw, ys + ts, 'EQUIP-DETAIL'); a.circ(cx, ys + 0.2 * IN, sw * 0.22, 'EQUIP-DETAIL');
    a.log('Added the stepped plinth with engraving plates, the kite shield with rim and boss, the side wings where fitted and the back supports (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic crystal award obelisk on base',
  desc: (v) => `Award obelisk ${v.h} in tall: a four-sided tapered block (hulled) with a pyramid tip and a bevelled foot, on a thick square base with a stepped lip and an engraving plate on the front${v.star ? ', and a small star disc on the tip' : ''}.`,
  vs: [
    ['6 in', 3, 3, 6, 0, { h: 6 }],
    ['8 in', 3.5, 3.5, 8, 0, { h: 8 }],
    ['10 in', 4, 4, 10, 0, { h: 10 }],
    ['12 in with star', 4.5, 4.5, 12, 0, { h: 12, star: true }],
    ['15 in with star', 5.5, 5.5, 15, 0, { h: 15, star: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, bh = H * 0.16, bw = W * 0.5, tw = W * 0.34, zt = Z0 + H - W * 0.4;
    a.box(X0, YF, Z0, X1, YB, Z0 + bh * 0.6); a.box(X0 + W * 0.08, YF + D * 0.08, Z0 + bh * 0.6, X1 - W * 0.08, YB - D * 0.08, Z0 + bh); a.outline();
    const zb = Z0 + bh; hull(a, [[cx - bw * 0.5, yc - bw * 0.5, zb], [cx + bw * 0.5, yc - bw * 0.5, zb], [cx - bw * 0.5, yc + bw * 0.5, zb], [cx + bw * 0.5, yc + bw * 0.5, zb], [cx - tw * 0.5, yc - tw * 0.5, zt], [cx + tw * 0.5, yc - tw * 0.5, zt], [cx - tw * 0.5, yc + tw * 0.5, zt], [cx + tw * 0.5, yc + tw * 0.5, zt]]);
    hull(a, [[cx - tw * 0.5, yc - tw * 0.5, zt], [cx + tw * 0.5, yc - tw * 0.5, zt], [cx - tw * 0.5, yc + tw * 0.5, zt], [cx + tw * 0.5, yc + tw * 0.5, zt], [cx, yc, Z0 + H]]);
    hull(a, [[cx - bw * 0.58, yc - bw * 0.58, zb], [cx + bw * 0.58, yc - bw * 0.58, zb], [cx - bw * 0.58, yc + bw * 0.58, zb], [cx + bw * 0.58, yc + bw * 0.58, zb], [cx - bw * 0.5, yc - bw * 0.5, zb + 0.5 * IN], [cx + bw * 0.5, yc - bw * 0.5, zb + 0.5 * IN], [cx - bw * 0.5, yc + bw * 0.5, zb + 0.5 * IN], [cx + bw * 0.5, yc + bw * 0.5, zb + 0.5 * IN]]);
    a.box(cx - W * 0.2, YF - 0.12 * IN, Z0 + bh * 0.2, cx + W * 0.2, YF + 0.05 * IN, Z0 + bh * 0.5); a.rect(cx - W * 0.2, YF, cx + W * 0.2, YF + 0.2 * IN, 'EQUIP-DETAIL');
    if (v.star) prismY(a, starPts(0, 0, 1, 0.45, 5, m.PI / 2).map(([x, z]) => [cx + x * W * 0.14, Z0 + H + (z - 0.1) * W * 0.14 - W * 0.16]), yc - 0.2 * IN, yc + 0.2 * IN);
    a.rect(cx - bw * 0.5, yc - bw * 0.5, cx + bw * 0.5, yc + bw * 0.5, 'EQUIP-DETAIL'); a.rect(cx - tw * 0.5, yc - tw * 0.5, cx + tw * 0.5, yc + tw * 0.5, 'EQUIP-DETAIL'); a.line(cx - bw * 0.5, yc - bw * 0.5, cx, yc, 'EQUIP-DETAIL');
    a.log('Added the stepped base with plate, the tapered four-sided block, the pyramid tip, the bevelled foot and the star where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic medal cradle stand, desk award',
  desc: (v) => `${v.kind}: a wooden base with a back board, ${v.n} round medal disc${v.n > 1 ? 's' : ''} (rim, raised centre and a star) hanging on a ribbon loop from a top hook, shown ${v.n > 1 ? 'in a row' : 'centred'} on the back board${v.frame ? ', with a front frame bar and a name plate' : ''}.`,
  vs: [
    ['single medal, 2.75 in disc', 5, 3.5, 7, 0, { kind: 'Single medal cradle', n: 1, d: 2.75 }],
    ['three medals, 2.75 in discs', 11, 3.5, 7.5, 0, { kind: 'Three-medal cradle', n: 3, d: 2.75, frame: true }],
    ['single large medal, 4 in disc', 7, 4, 9.5, 0, { kind: 'Large single medal cradle', n: 1, d: 4, frame: true }],
    ['five medals, 2.25 in discs, on rail', 15, 3.5, 7, 0, { kind: 'Five-medal rail cradle', n: 5, d: 2.25 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, bd = v.d * IN, zt = Z0 + H;
    a.box(X0, YF, Z0, X1, YB, Z0 + 0.9 * IN); a.outline(); a.box(X0 + 0.4 * IN, YB - 0.7 * IN, Z0 + 0.9 * IN, X1 - 0.4 * IN, YB, zt - 0.2 * IN); a.box(X0 + 0.2 * IN, YF + 0.3 * IN, Z0 + 0.9 * IN, X1 - 0.2 * IN, YF + 0.7 * IN, Z0 + 1.5 * IN);
    a.tube([[X0 + 0.5 * IN, YB - 0.7 * IN, zt - 0.5 * IN], [X1 - 0.5 * IN, YB - 0.7 * IN, zt - 0.5 * IN]], [0.2 * IN, 0.2 * IN], 8); const pw = (W - 1 * IN) / v.n;
    for (let i = 0; i < v.n; i++) {
      const x = X0 + 0.5 * IN + pw * (i + 0.5), zc = zt - 0.5 * IN - 1.8 * IN - bd / 2, yy = YB - 1.2 * IN;
      a.ycyl(yy - 0.25 * IN, yy + 0.1 * IN, x, zc, bd / 2, 24); a.ycyl(yy - 0.35 * IN, yy - 0.25 * IN, x, zc, bd * 0.38, 24); prismY(a, starPts(x, zc, bd * 0.26, bd * 0.12, 5, m.PI / 2), yy - 0.5 * IN, yy - 0.35 * IN);
      a.tube([[x - 0.5 * IN, yy + 0.05 * IN, zt - 0.5 * IN], [x, yy - 0.1 * IN, zc + bd / 2 + 0.2 * IN], [x + 0.5 * IN, yy + 0.05 * IN, zt - 0.5 * IN]], [0.25 * IN, 0.15 * IN, 0.25 * IN], 6); a.cyl(x, yy, zc + bd / 2, zc + bd / 2 + 0.3 * IN, 0.15 * IN, 8);
      a.circ(x, yy, bd / 2, 'EQUIP-DETAIL');
    }
    if (v.frame) { a.box(cx - W * 0.25, YF - 0.1 * IN, Z0 + 0.9 * IN, cx + W * 0.25, YF + 0.3 * IN, Z0 + 1.4 * IN); a.rect(cx - W * 0.25, YF, cx + W * 0.25, YF + 0.3 * IN, 'EQUIP-DETAIL'); }
    a.log('Added the base, back board, rail hook, ribbon loops, medal discs with centre and star and the name plate where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic A-frame scoreboard sign, event floor',
  desc: (v) => `${v.kind} A-frame sign: two hinged leaning panels, a framed black writing face with ${v.rows} ruled lines and a column rule, a pen ledge across the bottom, a header board on top and a chain between the legs.`,
  vs: [
    ['small, 24 x 36 in', 24, 24, 36, 0, { kind: 'Small', rows: 6 }],
    ['standard, 30 x 42 in', 30, 28, 42, 0, { kind: 'Standard', rows: 8 }],
    ['large, 36 x 48 in', 36, 32, 48, 0, { kind: 'Large', rows: 10 }],
    ['tall leaderboard, 28 x 60 in', 28, 36, 60, 0, { kind: 'Tall leaderboard', rows: 12 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, t = 1.2 * IN;
    for (const s of [0, 1]) { const yb = s ? YB : YF, yt = yc + (s ? 0.5 : -0.5) * IN; prismX(a, s ? [[YB - t, Z0], [YB, Z0], [yc + 0.8 * IN, Z0 + H], [yc - 0.8 * IN, Z0 + H]] : [[YF, Z0], [YF + t, Z0], [yc + 0.8 * IN, Z0 + H], [yc - 0.8 * IN, Z0 + H]], X0 + 0.3 * IN, X1 - 0.3 * IN); }
    const fz0 = Z0 + H * 0.22, fz1 = Z0 + H * 0.86, f = 0.12; const yfz = (z) => YF + (z - Z0) / H * (D / 2 - 0.8 * IN) * 1;
    a.box(X0 + 2 * IN, yfz(fz0) - 0.4 * IN, fz0, X1 - 2 * IN, yfz(fz0) + 0.5 * IN, fz1); a.frame(X0 + 1.5 * IN, fz0 - 0.4 * IN, X1 - 1.5 * IN, fz1 + 0.4 * IN, yfz(fz0) - 0.7 * IN, yfz(fz0) + 0.7 * IN, 0.8 * IN);
    for (let i = 1; i < v.rows; i++) { const z = fz0 + (fz1 - fz0) * i / v.rows; a.box(X0 + 2.4 * IN, yfz(z) - 0.8 * IN, z - 0.05 * IN, X1 - 2.4 * IN, yfz(z) - 0.4 * IN, z + 0.05 * IN); }
    a.box(cx - W * 0.22, yfz(fz0) - 0.8 * IN, fz0 + 0.2 * IN, cx - W * 0.22 + 0.1 * IN, yfz(fz0) - 0.4 * IN, fz1 - 0.2 * IN);
    a.box(X0 + 1.5 * IN, yfz(fz0) - 1.8 * IN, fz0 - 1.2 * IN, X1 - 1.5 * IN, yfz(fz0) - 0.4 * IN, fz0 - 0.4 * IN); a.box(X0 + 0.6 * IN, yc - 0.6 * IN, Z0 + H - 4 * IN, X1 - 0.6 * IN, yc + 0.6 * IN, Z0 + H + 0 * IN - 0.0); a.box(X0 + 1.5 * IN, yfz(Z0 + H * 0.9) - 0.8 * IN, Z0 + H * 0.88, X1 - 1.5 * IN, yfz(Z0 + H * 0.9) + 0.3 * IN, Z0 + H - 0.2 * IN);
    a.tube([[X0 + 2.5 * IN, YF + 3 * IN, Z0 + H * 0.12], [cx, yc, Z0 + H * 0.06], [X1 - 2.5 * IN, YF + 3 * IN, Z0 + H * 0.12]], [0.2 * IN, 0.2 * IN, 0.2 * IN], 5);
    a.outline(); a.line(X0, yc, X1, yc, 'EQUIP-DETAIL'); a.rect(X0 + 0.3 * IN, YF, X1 - 0.3 * IN, YF + t, 'EQUIP-DETAIL'); a.rect(X0 + 0.3 * IN, YB - t, X1 - 0.3 * IN, YB, 'EQUIP-DETAIL');
    a.log('Added the two leaning panels, the ruled writing face with frame and column rule, the pen ledge, the header board and the chain (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic awards stage with backdrop frame',
  desc: (v) => `Portable awards stage ${v.ft} ft wide: a decked platform on skirted frames with a non-slip strip pattern, a three-step stair at one end with side rails, an edge trim, and a backdrop frame of two truss uprights with a header bar and a hung banner panel with a centre emblem disc.`,
  vs: [
    ['8 ft wide', 96, 48, 110, 0, { ft: 8 }],
    ['12 ft wide', 144, 48, 110, 0, { ft: 12 }],
    ['16 ft wide', 192, 60, 120, 0, { ft: 16 }],
    ['20 ft wide, two-step lower deck', 240, 72, 120, 0, { ft: 20, low: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, hh = 14 * IN, sd = 24 * IN, bk = YB - 3 * IN, dz = Z0 + hh, dx1 = X1 - 30 * IN;
    a.box(X0, YF + (v.low ? 0 : 0), dz - 2 * IN, X1 - 30 * IN, YB, dz); a.outline(); a.box(X0 + 1 * IN, YF + 1 * IN, Z0, X1 - 31 * IN, YB - 1 * IN, dz - 2 * IN); for (let i = 0; i < Math.floor(W / (12 * IN)); i++) a.box(X0 + 6 * IN + i * 12 * IN, YF + 2 * IN, dz, X0 + 12 * IN + i * 12 * IN - 4 * IN, YB - 2 * IN, dz + 0.2 * IN);
    for (let i = 0; i < 3; i++) { const x0 = X1 - 30 * IN + i * 10 * IN; a.box(x0, YF + 10 * IN, Z0, x0 + 10 * IN, YF + 40 * IN, Z0 + hh * (3 - i) / 3); a.rect(x0, YF + 10 * IN, x0 + 10 * IN, YF + 40 * IN, 'EQUIP-DETAIL'); }
    for (const y of [YF + 10 * IN, YF + 40 * IN]) { a.tube([[X1 - 30 * IN, y, dz], [X1 - 30 * IN, y, dz + 30 * IN], [X1, y, Z0 + hh / 3 + 30 * IN], [X1, y, Z0 + hh / 3]], Array(4).fill(0.5 * IN), 6); }
    a.box(X0, YF, dz, dx1, YF + 0.8 * IN, dz + 1.2 * IN);
    const ux = [X0 + 8 * IN, dx1 - 8 * IN], uz = Z0 + H;
    for (const x of ux) { a.box(x - 2 * IN, bk - 2 * IN, dz, x + 2 * IN, bk + 2 * IN, dz + 1 * IN); for (const dy of [-1, 1]) a.tube([[x + dy * 1.4 * IN, bk, dz + 1 * IN], [x + dy * 1.4 * IN, bk, uz]], [0.5 * IN, 0.5 * IN], 6); for (let k = 0; k < 6; k++) a.tube([[x - 1.4 * IN, bk, dz + 1 * IN + k * (uz - dz - 1 * IN) / 6], [x + 1.4 * IN, bk, dz + 1 * IN + (k + 1) * (uz - dz - 1 * IN) / 6]], [0.2 * IN, 0.2 * IN], 4); }
    a.tube([[ux[0], bk - 1.4 * IN, uz - 1 * IN], [ux[1], bk - 1.4 * IN, uz - 1 * IN]], [0.8 * IN, 0.8 * IN], 8); a.tube([[ux[0], bk + 1.4 * IN, uz - 1 * IN], [ux[1], bk + 1.4 * IN, uz - 1 * IN]], [0.8 * IN, 0.8 * IN], 8);
    a.box(ux[0] + 4 * IN, bk - 0.6 * IN, dz + 20 * IN, ux[1] - 4 * IN, bk + 0.1 * IN, uz - 4 * IN); a.ycyl(bk - 1.2 * IN, bk - 0.6 * IN, cx - 15 * IN, (dz + 20 * IN + uz - 4 * IN) / 2, 14 * IN, 24);
    a.rect(ux[0] - 2 * IN, bk - 2 * IN, ux[1] + 2 * IN, bk + 2 * IN, 'EQUIP-DETAIL'); a.rect(X1 - 30 * IN, YF + 10 * IN, X1, YF + 40 * IN, 'EQUIP-DETAIL');
    a.log('Added the decked platform with strips, the three-step stair with rails, edge trim, the truss uprights with header bars and the hung banner with emblem (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic tiered trophy riser shelf unit',
  desc: (v) => `Open display unit of ${v.n} stepped tiers: two side panels cut to the steps, a back panel, ${v.n} shelf boards each ${v.n === 2 ? 'stepping back' : 'stepping back one tier'}, a front lip on every shelf and ${v.cups} small cup trophies (foot, stem, bowl, handles) standing across the shelves.`,
  vs: [
    ['2 tiers, 36 in', 36, 18, 22, 0, { n: 2, cups: 5 }],
    ['3 tiers, 48 in', 48, 24, 34, 0, { n: 3, cups: 8 }],
    ['4 tiers, 60 in', 60, 30, 46, 0, { n: 4, cups: 12 }],
    ['5 tiers, 72 in', 72, 36, 58, 0, { n: 5, cups: 15 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, st = D / v.n, ts = (H - 9 * IN) / v.n, t = 1 * IN;
    for (const s of [0, 1]) { const poly = [[YB, Z0], [YF, Z0]]; for (let i = 0; i < v.n; i++) { poly.push([YF + i * st, Z0 + (i + 1) * ts - 0.0]); poly.push([YF + (i + 1) * st, Z0 + (i + 1) * ts]); } poly[2] = [YF, Z0]; const side = []; for (let i = 0; i < v.n; i++) { prismX(a, [[YF + i * st, Z0], [YB, Z0], [YB, Z0 + (i + 1) * ts - t], [YF + i * st, Z0 + (i + 1) * ts - t]].slice(0, 4), s ? X1 - t : X0, s ? X1 : X0 + t); } }
    a.box(X0, YB - 0.6 * IN, Z0, X1, YB, Z0 + H - 8.5 * IN + ts * 0 + 8.5 * IN); a.outline();
    for (let i = 0; i < v.n; i++) { const y0 = YF + i * st, zt = Z0 + (i + 1) * ts - t; a.box(X0, y0, zt, X1, YB, zt + t); a.box(X0, y0, zt + t, X1, y0 + 0.5 * IN, zt + t + 1.2 * IN); a.line(X0, y0, X1, y0, 'EQUIP-DETAIL'); }
    let c = 0; for (let i = 0; i < v.n && c < v.cups; i++) { const per = Math.ceil(v.cups / v.n), cnt = Math.min(per, v.cups - c), y = YF + i * st + st * 0.55, zt = Z0 + (i + 1) * ts; for (let k = 0; k < cnt; k++) { const ch = 6 * IN + (k % 3) * 1 * IN; cup(a, X0 + 3 * IN + (W - 6 * IN) * (cnt === 1 ? 0.5 : k / (cnt - 1)), y, zt + 0.0, ch, ch * 0.28); a.circ(X0 + 3 * IN + (W - 6 * IN) * (cnt === 1 ? 0.5 : k / (cnt - 1)), y, ch * 0.14, 'EQUIP-DETAIL'); c++; } }
    a.log('Added the stepped side panels, back panel, shelf boards with front lips and the cup trophies (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic runner statuette on round base',
  desc: (v) => `${v.h} in figure statuette: a stylised runner in a stride built from a head ball, torso tube, two arms bent at the elbow and two legs with knee and foot, standing on a round stepped base with a short column and an engraving plate.`,
  vs: [
    ['8 in', 4.5, 4, 8, 0, { h: 8 }],
    ['12 in', 6, 5.5, 12, 0, { h: 12 }],
    ['18 in', 8.5, 7.5, 18, 0, { h: 18 }],
    ['24 in on tall column', 11, 9.5, 24, 0, { h: 24, col: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, bh = H * (v.col ? 0.3 : 0.18), u = (H - bh) / 10, z0 = Z0 + bh, R = Math.min(W, D) / 2;
    a.cyl(cx, yc, Z0, Z0 + bh * 0.35, R, 24); a.cyl(cx, yc, Z0 + bh * 0.35, Z0 + bh, R * (v.col ? 0.55 : 0.8), 24); a.circ(cx, yc, R); a.circ(cx, yc, R * 0.8, 'EQUIP-DETAIL');
    a.box(cx - R * 0.3, YF - 0.05 * IN, Z0 + bh * 0.1, cx + R * 0.3, YF + 0.15 * IN, Z0 + bh * 0.3);
    const hip = [cx, yc, z0 + u * 4.6], sh = [cx + u * 0.35, yc - u * 0.2, z0 + u * 7.8], hd = [cx + u * 0.5, yc - u * 0.3, z0 + u * 9];
    a.tube([hip, sh], [u * 0.7, u * 0.85], 10); a.ell(hd[0], hd[1], z0 + u * 9.2, u * 0.6, u * 0.6, u * 0.7, 10, 6); a.tube([[cx, yc, z0 + u * 7.8], [cx, yc, z0 + u * 8.5]], [u * 0.3, u * 0.25], 6);
    a.tube([sh, [cx - u * 1.4, yc, z0 + u * 7], [cx - u * 1.8, yc - u * 1.8, z0 + u * 7.8]], [u * 0.35, u * 0.3, u * 0.28], 6); a.tube([sh, [cx + u * 1.5, yc, z0 + u * 6.8], [cx + u * 1.9, yc + u * 1.8, z0 + u * 7]], [u * 0.35, u * 0.3, u * 0.28], 6);
    a.tube([hip, [cx - u * 0.9, yc - u * 1.4, z0 + u * 2.4], [cx - u * 1.2, yc - u * 0.8, z0 + u * 0.4]], [u * 0.6, u * 0.45, u * 0.35], 7); a.tube([hip, [cx + u * 0.9, yc + u * 1.6, z0 + u * 3.5], [cx + u * 1.2, yc + u * 3, z0 + u * 1.6]], [u * 0.6, u * 0.45, u * 0.35], 7);
    a.box(cx - u * 1.6, yc - u * 0.4, z0, cx - u * 0.8, yc + u * 0.2, z0 + u * 0.3); a.tube([[cx + u * 1.2, yc + u * 3, z0 + u * 1.6], [cx + u * 1.2, yc + u * 3.4, z0 + u * 0.9]], [u * 0.3, u * 0.3], 6);
    a.cyl(cx - u * 1.2, yc, z0 + u * 0.0, z0 + u * 0.3, u * 0.01, 4); a.circ(cx, yc, u * 0.7, 'EQUIP-DETAIL'); a.line(cx - u * 1.8, yc - u * 1.8, cx + u * 1.9, yc + u * 1.8, 'EQUIP-DETAIL');
    a.log('Added the stepped round base with plate, the head, torso, bent arms and the striding legs with feet (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic flag pole cluster on weighted bases',
  desc: (v) => `Set of ${v.n} table flag${v.n > 1 ? 's' : ''} on separate poles${v.n > 1 ? ' fanned slightly' : ''}: a heavy round base with a pole socket, a pole with a ball finial and a cloth drawn as a thin hanging panel with two stripes and a corner field${v.shared ? ', all on one shared long base bar' : ''}.`,
  vs: [
    ['1 flag, desk', 8, 6, 18, 0, { n: 1 }],
    ['2 flags, desk', 14, 6, 18, 0, { n: 2 }],
    ['3 flags on shared base', 20, 6, 20, 0, { n: 3, shared: true }],
    ['5 flags on shared base, conference', 34, 7, 24, 0, { n: 5, shared: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, pw = W / v.n, fl = Math.min(pw * 0.55, 6 * IN), fh = fl * 0.62;
    if (v.shared) { a.box(X0, YF, Z0, X1, YB, Z0 + 1 * IN); a.box(X0 + 0.5 * IN, YF + 0.5 * IN, Z0 + 1 * IN, X1 - 0.5 * IN, YB - 0.5 * IN, Z0 + 1.5 * IN); a.outline(); }
    for (let i = 0; i < v.n; i++) {
      const xb = X0 + pw * (i + 0.5), x = xb - pw * 0.2, tz = Z0 + H - 0.3 * IN, lean = (i - (v.n - 1) / 2) * 0.02, zb = Z0 + (v.shared ? 1.5 * IN : 1 * IN);
      if (!v.shared) { a.cyl(xb, yc, Z0, Z0 + 0.7 * IN, Math.min(pw, D) * 0.45, 20); a.cyl(xb, yc, Z0 + 0.7 * IN, Z0 + 1 * IN, Math.min(pw, D) * 0.3, 16); a.circ(xb, yc, Math.min(pw, D) * 0.45); } else a.circ(x, yc, 0.9 * IN, 'EQUIP-DETAIL');
      a.cyl(x, yc, zb, zb + 1.2 * IN, 0.7 * IN, 10); a.tube([[x, yc, zb], [x + (tz - zb) * lean, yc, tz - 1 * IN]], [0.28 * IN, 0.22 * IN], 8); a.ell(x + (tz - zb) * lean, yc, tz - 0.4 * IN, 0.55 * IN, 0.55 * IN, 0.55 * IN, 10, 6);
      const fx = x + (tz - zb) * lean + 0.25 * IN, fz1 = tz - 1.6 * IN; a.box(fx, yc - 0.06 * IN, fz1 - fh, fx + fl, yc + 0.06 * IN, fz1);
      a.box(fx, yc - 0.12 * IN, fz1 - fh * 0.34, fx + fl, yc + 0.0, fz1 - fh * 0.34 + fh * 0.0 + 0.3 * IN); a.box(fx, yc - 0.12 * IN, fz1 - fh, fx + fl * 0.42, yc, fz1 - fh * 0.5); a.rect(fx, yc - 0.1 * IN, fx + fl, yc + 0.1 * IN, 'EQUIP-DETAIL');
    }
    if (!v.shared) a.outline();
    a.log('Added the weighted bases or shared bar, the pole sockets, poles with ball finials and the striped cloth panels with corner fields (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic event countdown clock tower, two-sided',
  desc: (v) => `${v.kind} two-sided event clock: a display head with a bezel and four seven-segment digits with a colon on the front (and a matching rear face), a mount collar, a ${v.truss ? 'lattice truss' : 'round steel'} post and a ${v.base} base with feet and a cable gland.`,
  vs: [
    ['4 ft post-mount', 30, 24, 52, 0, { kind: 'Compact', hw: 24, hh: 10, post: 38, truss: false, base: 'plate' }],
    ['6 ft with plinth', 36, 30, 80, 0, { kind: 'Standard', hw: 30, hh: 12, post: 62, truss: false, base: 'plinth' }],
    ['8 ft truss tower', 40, 40, 104, 0, { kind: 'Tall', hw: 34, hh: 14, post: 84, truss: true, base: 'cross-foot' }],
    ['10 ft truss tower, wide head', 54, 48, 124, 0, { kind: 'Wide-head', hw: 48, hh: 18, post: 102, truss: true, base: 'cross-foot' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, hw = v.hw * IN, hh = v.hh * IN, zh = Z0 + H - hh, bz = v.base === 'plate' ? 1 * IN : v.base === 'plinth' ? 6 * IN : 2 * IN;
    if (v.base === 'plate') a.box(cx - 10 * IN, yc - 10 * IN, Z0, cx + 10 * IN, yc + 10 * IN, bz); else if (v.base === 'plinth') { a.box(cx - 14 * IN, yc - 14 * IN, Z0, cx + 14 * IN, yc + 14 * IN, bz * 0.5); a.box(cx - 11 * IN, yc - 11 * IN, bz * 0.5 + Z0, cx + 11 * IN, yc + 11 * IN, Z0 + bz); } else { for (const s of [-1, 1]) { a.box(cx - 18 * IN, yc + s * 0 - 2 * IN, Z0, cx + 18 * IN, yc + 2 * IN, bz); a.box(cx - 2 * IN, yc - 18 * IN, Z0, cx + 2 * IN, yc + 18 * IN, bz); } }
    if (v.truss) { for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) a.tube([[cx + dx * 4 * IN, yc + dy * 4 * IN, Z0 + bz], [cx + dx * 4 * IN, yc + dy * 4 * IN, zh]], [0.7 * IN, 0.7 * IN], 6); for (let k = 0; k < (zh - Z0 - bz) / (12 * IN); k++) { const z = Z0 + bz + k * 12 * IN; a.tube([[cx - 4 * IN, yc - 4 * IN, z], [cx + 4 * IN, yc - 4 * IN, z + 12 * IN]], [0.3 * IN, 0.3 * IN], 4); a.tube([[cx + 4 * IN, yc + 4 * IN, z], [cx - 4 * IN, yc + 4 * IN, z + 12 * IN]], [0.3 * IN, 0.3 * IN], 4); } }
    else a.tube([[cx, yc, Z0 + bz], [cx, yc, zh]], [2.2 * IN, 2 * IN], 14);
    a.box(cx - 5 * IN, yc - 3 * IN, zh - 2 * IN, cx + 5 * IN, yc + 3 * IN, zh);
    a.box(cx - hw / 2, yc - 3 * IN, zh, cx + hw / 2, yc + 3 * IN, zh + hh); a.frame(cx - hw / 2 - 0.4 * IN, zh - 0.4 * IN, cx + hw / 2 + 0.4 * IN, zh + hh + 0.4 * IN, yc - 3.6 * IN, yc - 2 * IN, 0.8 * IN); a.frame(cx - hw / 2 - 0.4 * IN, zh - 0.4 * IN, cx + hw / 2 + 0.4 * IN, zh + hh + 0.4 * IN, yc + 2 * IN, yc + 3.6 * IN, 0.8 * IN);
    const dw = hw * 0.19, dh = hh * 0.72, gap = dw * 0.18, tot = 4 * dw + 3 * gap + dw * 0.5, x0 = cx - tot / 2; for (let i = 0; i < 4; i++) { const x = x0 + i * (dw + gap) + (i > 1 ? dw * 0.5 : 0); digit(a, String([1, 2, 3, 4][i]), x, zh + hh * 0.14, dw, dh, dw * 0.16, yc - 3 * IN); digit(a, String([1, 2, 3, 4][i]), x, zh + hh * 0.14, dw, dh, dw * 0.16, yc + 3.6 * IN - 0 * IN); }
    for (const z of [0.36, 0.64]) a.box(x0 + 2 * (dw + gap) - dw * 0.2, yc - 3.4 * IN, zh + hh * z, x0 + 2 * (dw + gap) - dw * 0.2 + dw * 0.14, yc - 3 * IN, zh + hh * z + dw * 0.14);
    a.cyl(cx + 3 * IN, yc + 3 * IN, Z0 + bz, Z0 + bz + 2.5 * IN, 0.4 * IN, 6);
    a.outline(); a.rect(cx - hw / 2, yc - 3 * IN, cx + hw / 2, yc + 3 * IN, 'EQUIP-DETAIL'); a.circ(cx, yc, v.truss ? 4 * IN : 2.2 * IN, 'EQUIP-DETAIL');
    a.log('Added the base, the round or lattice post, the mount collar, the two-faced display head with bezels and the seven-segment digits with colon (plan and 3D).');
  } }),
];

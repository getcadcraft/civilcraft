/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, fun. Original geometry; generic shapes, no franchise, character, brand or game. */
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
  const s = SEG[ch] || '', d = 8, bar = (x0, z0, x1, z1) => a.box(x0, y - d, z0, x1, y, z1), hh = h / 2;
  if (s.includes('a')) bar(x + t, z + h - t, x + w - t, z + h); if (s.includes('g')) bar(x + t, z + hh - t / 2, x + w - t, z + hh + t / 2); if (s.includes('d')) bar(x + t, z, x + w - t, z + t);
  if (s.includes('f')) bar(x, z + hh, x + t, z + h - t); if (s.includes('b')) bar(x + w - t, z + hh, x + w, z + h - t); if (s.includes('e')) bar(x, z + t, x + t, z + hh); if (s.includes('c')) bar(x + w - t, z + t, x + w, z + hh);
}
/** extrude a star-shaped polygon given as [x, z] points between y0 and y1 (facing -Y) */
function prismSY(a, poly, y0, y1) {
  const n = poly.length, cx = poly.reduce((s, p) => s + p[0], 0) / n, cz = poly.reduce((s, p) => s + p[1], 0) / n;
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[cx, y0, cz], [p[0], y0, p[1]], [q[0], y0, q[1]]], [[cx, y1, cz], [q[0], y1, q[1]], [p[0], y1, p[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [q[0], y0, q[1]]], [[p[0], y0, p[1]], [p[0], y1, p[1]], [q[0], y1, q[1]]]); }
  return a;
}

export default [

// ============================================================================================ fun/characters
fam({ cat: 'fun/characters', title: 'Generic penguin mascot figure',
  desc: (v) => `Round penguin mascot with a dark egg-shaped body, a pale belly patch, ${v.chick ? 'a fluffy oversized head, ' : 'a rounded head, '}an orange cone beak, two eyes, two flippers and two flat feet${v.scarf ? ', a wrapped scarf with a hanging end' : ''}${v.hat ? ' and a bobble hat' : ''}.`,
  vs: [
    ['standing, 24 in', 14, 12, 24, 0, {}],
    ['with scarf, 36 in', 20, 17, 36, 0, { scarf: true }],
    ['chick, 16 in', 12, 11, 16, 0, { chick: true }],
    ['with scarf and bobble hat, 48 in', 26, 22, 48, 0, { scarf: true, hat: true }],
    ['giant lobby size, 84 in', 44, 38, 84, 0, { scarf: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, hr = H * (v.chick ? 0.24 : 0.18), hz = Z0 + H * 0.97 - hr, bz = Z0 + H * 0.4, rx = W * 0.4, ry = D * 0.4;
    a.ell(cx, yc, bz, rx, ry, H * 0.35, 20, 12); a.ellp(cx, yc, rx, ry);
    a.ell(cx, yc - ry * 0.28, bz - H * 0.02, rx * 0.72, ry * 0.8, H * 0.3, 16, 10);
    a.ell(cx, yc, hz, hr * 1.1, hr * 1.05, hr, 16, 10); a.circ(cx, yc, hr * 1.05, 'EQUIP-DETAIL');
    for (const s of [-1, 1]) { ball(a, cx + s * hr * 0.42, yc - hr * 0.88, hz + hr * 0.2, hr * 0.14, 8, 5); a.ell(cx + s * (rx + W * 0.03), yc, bz + H * 0.03, W * 0.07, ry * 0.45, H * 0.18, 10, 6); a.ell(cx + s * rx * 0.45, yc - D * 0.18, Z0 + H * 0.025, W * 0.15, D * 0.2, H * 0.025, 10, 5); a.ellp(cx + s * rx * 0.45, yc - D * 0.18, W * 0.15, D * 0.2, 'EQUIP-DETAIL'); }
    ycone(a, yc - hr * 0.8, yc - hr * 1.25, cx, hz - hr * 0.15, hr * 0.22);
    if (v.scarf) { const sz = hz - hr * 0.8; a.tube([[cx - hr * 0.95, yc, sz], [cx, yc - hr * 0.95, sz - 2], [cx + hr * 0.95, yc, sz], [cx, yc + hr * 0.95, sz], [cx - hr * 0.95, yc, sz]], [hr * 0.2, hr * 0.2, hr * 0.2, hr * 0.2, hr * 0.2], 8); a.box(cx + hr * 0.5, yc - hr * 1.05, sz - hr * 1.5, cx + hr * 0.95, yc - hr * 0.8, sz); }
    if (v.hat) { a.ell(cx, yc, hz + hr * 0.75, hr * 0.98, hr * 0.95, hr * 0.55, 14, 8); a.cyl(cx, yc, hz + hr * 0.55, hz + hr * 0.7, hr * 1.04, 14); ball(a, cx, yc, Z0 + H - hr * 0.1, hr * 0.2, 8, 5); }
    a.outline('EQUIP-HIDDEN'); a.log('Added the body, belly, head, beak, eyes, flippers, feet and the scarf or hat (plan and 3D).');
  } }),

fam({ cat: 'fun/characters', title: 'Generic garden scarecrow figure',
  desc: (v) => `Scarecrow on a wooden pole with a crossbar, a stuffed shirt and sleeves ending in straw tufts, ${v.pumpkin ? 'a pumpkin head' : 'a sack head'}, a brimmed hat, two stuffed legs${v.crow ? ' and a crow perched on one arm' : ''}, on a round foot plate.`,
  vs: [
    ['field type, 72 in', 40, 18, 72, 0, {}],
    ['with crow, 78 in', 44, 20, 78, 0, { crow: true }],
    ['pumpkin head, 60 in', 34, 16, 60, 0, { pumpkin: true }],
    ['child size, 36 in', 22, 12, 36, 0, {}]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, pr = W * 0.018, bz = Z0 + H * 0.4, tz = Z0 + H * 0.7;
    a.cyl(cx, yc, Z0, Z0 + 3, D * 0.42, 14); a.circ(cx, yc, D * 0.42, 'EQUIP-DETAIL');
    a.tube([[cx, yc, Z0 + 3], [cx, yc, Z0 + H * 0.9]], [pr * 1.4, pr * 1.2], 8);
    a.tube([[cx - W * 0.46, yc, tz], [cx + W * 0.46, yc, tz]], [pr, pr], 8);
    a.tube([[cx, yc, bz], [cx, yc, bz + H * 0.12], [cx, yc, tz + H * 0.03]], [W * 0.11, W * 0.12, W * 0.1], 12);
    for (const s of [-1, 1]) { a.xcyl(cx + s * W * 0.08, cx + s * W * 0.38, yc, tz - 2, W * 0.055, 10); for (let i = 0; i < 4; i++) a.tube([[cx + s * W * 0.38, yc, tz - 2], [cx + s * (W * 0.46 + i * 1.5), yc + (i - 1.5) * D * 0.08, tz - H * 0.07 - i * 2]], [2, 1], 4);
      a.tube([[cx + s * W * 0.07, yc, bz + 4], [cx + s * W * 0.08, yc, Z0 + H * 0.08]], [W * 0.055, W * 0.05], 8); for (let i = 0; i < 4; i++) a.tube([[cx + s * W * 0.08, yc, Z0 + H * 0.08], [cx + s * (W * 0.08 + (i - 1.5) * 2), yc + (i - 1.5) * 2, Z0 + 4]], [2, 1], 4); a.circ(cx + s * W * 0.08, yc, W * 0.05, 'EQUIP-DETAIL'); }
    const hz = tz + H * 0.08;
    if (v.pumpkin) { a.ell(cx, yc, hz, H * 0.075, H * 0.075, H * 0.065, 14, 8); a.ell(cx, yc - H * 0.062, hz, H * 0.02, 3, H * 0.015, 6, 4); } else { a.ell(cx, yc, hz, H * 0.065, H * 0.065, H * 0.07, 12, 8); for (const s of [-1, 1]) ball(a, cx + s * H * 0.025, yc - H * 0.06, hz + H * 0.01, H * 0.01, 5, 4); }
    a.cyl(cx, yc, hz + H * 0.04, hz + H * 0.045, W * 0.19, 16); a.cone(cx, yc, hz + H * 0.045, Z0 + H, W * 0.1, W * 0.045, 14); a.circ(cx, yc, W * 0.19, 'EQUIP-DETAIL');
    if (v.crow) { const kx = cx + W * 0.3; a.ell(kx, yc, tz + H * 0.05, H * 0.03, H * 0.016, H * 0.026, 8, 5); ball(a, kx - H * 0.02, yc, tz + H * 0.08, H * 0.014, 6, 4); ycone(a, yc - 1, yc - H * 0.03, kx - H * 0.02, tz + H * 0.08, H * 0.006); a.tube([[kx + H * 0.02, yc, tz + H * 0.045], [kx + H * 0.06, yc, tz + H * 0.03]], [3, 1], 4); }
    a.rect(cx - W * 0.46, yc - 2, cx + W * 0.46, yc + 2, 'EQUIP'); a.log('Added the foot plate, pole and crossbar, shirt and sleeves, straw tufts, head, hat and legs (plan and 3D).');
  } }),

fam({ cat: 'fun/characters', title: 'Generic sheet ghost figure',
  desc: (v) => `Rounded sheet ghost with a bell-shaped body, a scalloped hem of eight lobes, two oval eyes, an open mouth${v.arms ? ', two raised stub arms' : ''}${v.chain ? ' and a ring of chain links around the waist' : ''}${v.bow ? ' and a bow tie' : ''}.`,
  vs: [
    ['little, 16 in', 11, 11, 16, 0, { arms: true }],
    ['tall, 36 in', 22, 22, 36, 0, { arms: true }],
    ['chained, 30 in', 22, 22, 30, 0, { chain: true }],
    ['with bow tie, 24 in', 16, 16, 24, 0, { bow: true, arms: true }],
    ['giant, 72 in', 44, 44, 72, 0, { arms: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2 * 0.95;
    lathe(a, cx, yc, Z0, [[H * 0.05, R * 0.92], [H * 0.25, R * 0.82], [H * 0.5, R * 0.68], [H * 0.7, R * 0.55], [H * 0.82, R * 0.62], [H * 0.9, R * 0.5], [H * 0.97, R * 0.28], [H, R * 0.05]], 20);
    for (let i = 0; i < 8; i++) { const t = (i * TAU) / 8; a.ell(cx + R * 0.74 * m.cos(t), yc + R * 0.74 * m.sin(t), Z0 + H * 0.06, R * 0.22, R * 0.22, H * 0.06, 10, 6); }
    a.circ(cx, yc, R, 'EQUIP'); a.circ(cx, yc, R * 0.5, 'EQUIP-DETAIL');
    const fy = yc - R * 0.55, ez = Z0 + H * 0.76;
    for (const s of [-1, 1]) a.ell(cx + s * R * 0.2, fy - 1, ez, R * 0.1, 3, H * 0.055, 8, 5);
    a.ell(cx, fy - 1, ez - H * 0.13, R * 0.1, 3, H * 0.05, 8, 5);
    if (v.arms) for (const s of [-1, 1]) a.tube([[cx + s * R * 0.5, yc, Z0 + H * 0.55], [cx + s * R * 0.95, yc - R * 0.1, Z0 + H * 0.68]], [R * 0.2, R * 0.12], 8);
    if (v.chain) { const cz = Z0 + H * 0.4; for (let i = 0; i < 14; i++) { const t = (i * TAU) / 14; a.xcyl(cx + R * 0.7 * m.cos(t) - 3, cx + R * 0.7 * m.cos(t) + 3, yc + R * 0.7 * m.sin(t), cz, R * 0.07, 6); } a.circ(cx, yc, R * 0.7, 'EQUIP-DETAIL'); }
    if (v.bow) { const bz = Z0 + H * 0.6; for (const s of [-1, 1]) prismY(a, [[cx, bz], [cx + s * R * 0.3, bz + R * 0.14], [cx + s * R * 0.3, bz - R * 0.14]], yc - R * 0.7, yc - R * 0.6); ball(a, cx, yc - R * 0.65, bz, R * 0.06, 6, 4); }
    a.outline('EQUIP-HIDDEN'); a.log('Added the sheet body, scalloped hem, face, arms and the chain or bow (plan and 3D).');
  } }),

fam({ cat: 'fun/characters', title: 'Generic seated teddy bear',
  desc: (v) => `Seated plush bear with a round body, a round head, a muzzle with nose, two round ears with inner pads, two arms, two legs with foot pads facing forward${v.bow ? ' and a bow tie' : ''}${v.scarf ? ' and a knitted scarf' : ''}.`,
  vs: [
    ['small, 12 in', 8, 8, 12, 0, {}],
    ['classic, 20 in', 13, 13, 20, 0, { bow: true }],
    ['with scarf, 28 in', 18, 18, 28, 0, { scarf: true }],
    ['large, 40 in', 26, 26, 40, 0, { bow: true }],
    ['giant, 72 in', 46, 46, 72, 0, { scarf: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2 + D * 0.05, br = W * 0.36, bz = Z0 + H * 0.32, hr = H * 0.2, hz = Z0 + H * 0.77;
    a.ell(cx, yc, bz, br, br * 0.92, H * 0.27, 18, 10); a.ell(cx, yc - br * 0.4, bz, br * 0.62, br * 0.5, H * 0.19, 12, 8);
    a.ell(cx, yc - 1, hz, hr, hr * 0.95, hr * 0.92, 18, 10);
    a.ell(cx, yc - hr * 0.8, hz - hr * 0.25, hr * 0.44, hr * 0.35, hr * 0.34, 12, 8); ball(a, cx, yc - hr * 1.1, hz - hr * 0.1, hr * 0.14, 8, 5);
    for (const s of [-1, 1]) { ball(a, cx + s * hr * 0.4, yc - hr * 0.82, hz + hr * 0.3, hr * 0.1, 6, 4); a.ell(cx + s * hr * 0.75, yc, hz + hr * 0.75, hr * 0.38, hr * 0.2, hr * 0.38, 10, 6); a.ell(cx + s * hr * 0.75, yc - hr * 0.12, hz + hr * 0.75, hr * 0.2, hr * 0.1, hr * 0.2, 8, 5);
      a.tube([[cx + s * br * 0.85, yc - br * 0.05, bz + H * 0.14], [cx + s * br * 1.12, yc - br * 0.35, bz + H * 0.03], [cx + s * br * 1.08, yc - br * 0.7, bz - H * 0.02]], [br * 0.28, br * 0.25, br * 0.22], 10);
      a.tube([[cx + s * br * 0.5, yc - br * 0.5, Z0 + H * 0.09], [cx + s * br * 0.6, yc - br * 1.05, Z0 + H * 0.085]], [br * 0.38, br * 0.34], 10); a.ell(cx + s * br * 0.6, yc - br * 1.12, Z0 + H * 0.085, br * 0.33, br * 0.12, br * 0.3, 8, 6); a.circ(cx + s * br * 0.6, yc - br * 1.0, br * 0.3, 'EQUIP-DETAIL'); a.circ(cx + s * hr * 0.75, yc, hr * 0.3, 'EQUIP-DETAIL'); }
    const nz = hz - hr * 0.9;
    if (v.bow) for (const s of [-1, 1]) { prismY(a, [[cx, nz], [cx + s * hr * 0.55, nz + hr * 0.2], [cx + s * hr * 0.55, nz - hr * 0.2]], yc - hr * 0.95, yc - hr * 0.82); ball(a, cx, yc - hr * 0.88, nz, hr * 0.1, 6, 4); }
    if (v.scarf) { a.tube([[cx - hr * 0.8, yc, nz], [cx, yc - hr * 0.85, nz - 2], [cx + hr * 0.8, yc, nz], [cx, yc + hr * 0.85, nz], [cx - hr * 0.8, yc, nz]], [hr * 0.18, hr * 0.18, hr * 0.18, hr * 0.18, hr * 0.18], 8); a.box(cx + hr * 0.3, yc - hr * 1.0, nz - hr * 1.4, cx + hr * 0.7, yc - hr * 0.8, nz); }
    a.circ(cx, yc, br, 'EQUIP'); a.circ(cx, yc, hr, 'EQUIP-DETAIL'); a.log('Added the body, head with muzzle and ears, arms, legs with pads and the bow or scarf (plan and 3D).');
  } }),

fam({ cat: 'fun/characters', title: 'Generic gingerbread cookie figure',
  desc: (v) => `Thick gingerbread figure on a round plinth with a round head, a body, two arms and two legs of rounded tubes, ${v.buttons} icing buttons, two eyes and a smiling mouth${v.scarf ? ', a scarf' : ''}.`,
  vs: [
    ['plain, 12 in', 8, 3, 12, 0, { buttons: 3 }],
    ['with scarf, 24 in', 16, 5, 24, 0, { buttons: 3, scarf: true }],
    ['display, 48 in', 32, 9, 48, 0, { buttons: 4, scarf: true }],
    ['shop sign size, 72 in', 48, 12, 72, 0, { buttons: 5 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, pl = H * 0.04, z0 = Z0 + pl, th = D * 0.42, hh = (H - pl);
    a.box(cx - W * 0.46, YF + D * 0.02, Z0, cx + W * 0.46, YB - D * 0.02, z0); a.rect(cx - W * 0.46, YF + D * 0.02, cx + W * 0.46, YB - D * 0.02);
    const hr = hh * 0.16, hz = z0 + hh * 0.82; a.ell(cx, yc, hz, hr, th, hr, 16, 10);
    a.ell(cx, yc, z0 + hh * 0.5, hh * 0.15, th, hh * 0.2, 14, 10);
    for (const s of [-1, 1]) { a.tube([[cx + s * hh * 0.08, yc, z0 + hh * 0.62], [cx + s * hh * 0.2, yc, z0 + hh * 0.66], [cx + s * hh * 0.27, yc, z0 + hh * 0.6]], [th * 0.85, th * 0.8, th * 0.7], 8); ball(a, cx + s * hh * 0.27, yc, z0 + hh * 0.6, th * 0.72, 8, 5);
      a.tube([[cx + s * hh * 0.1, yc, z0 + hh * 0.36], [cx + s * hh * 0.17, yc, z0 + hh * 0.18], [cx + s * hh * 0.2, yc, z0 + hh * 0.03]], [th * 0.95, th * 0.85, th * 0.8], 8); ball(a, cx + s * hh * 0.2, yc, z0 + hh * 0.03, th * 0.8, 8, 5);
      ball(a, cx + s * hr * 0.4, yc - th * 0.95, hz + hr * 0.2, th * 0.14, 6, 4); }
    a.tube([[cx - hr * 0.4, yc - th * 0.9, hz - hr * 0.4], [cx - hr * 0.15, yc - th * 1.0, hz - hr * 0.55], [cx + hr * 0.15, yc - th * 1.0, hz - hr * 0.55], [cx + hr * 0.4, yc - th * 0.9, hz - hr * 0.4]], [th * 0.1, th * 0.1, th * 0.1, th * 0.1], 5);
    for (let i = 0; i < v.buttons; i++) ball(a, cx, yc - th * 0.96, z0 + hh * 0.62 - i * hh * 0.5 / v.buttons * 1.3, th * 0.17, 6, 4);
    if (v.scarf) { const sz = hz - hr * 0.95; a.tube([[cx - hr * 0.85, yc, sz], [cx, yc - th * 0.95, sz], [cx + hr * 0.85, yc, sz]], [th * 0.3, th * 0.3, th * 0.3], 8); a.box(cx + hr * 0.4, yc - th * 1.15, sz - hh * 0.2, cx + hr * 0.8, yc - th * 0.6, sz); }
    a.ellp(cx, yc, hh * 0.45, th, 'EQUIP-DETAIL'); a.log('Added the plinth, thick head, body, arms, legs and the icing details (plan and 3D).');
  } }),

fam({ cat: 'fun/characters', title: 'Generic furry monster figure',
  desc: (v) => `Furry monster figure with a ${v.tall ? 'tall' : 'wide'} rounded body, ${v.eyes} eye${v.eyes > 1 ? 's' : ''} with pupils, ${v.horns ? 'two cone horns, ' : ''}${v.teeth ? 'a wide mouth with a row of teeth, ' : 'a small mouth, '}two arms with three-finger hands and ${v.legs === 4 ? 'four stubby legs' : 'two big feet'}.`,
  vs: [
    ['one-eyed, 30 in', 20, 16, 30, 0, { eyes: 1, horns: false, teeth: false, legs: 2 }],
    ['horned two-eyed, 40 in', 26, 20, 40, 0, { eyes: 2, horns: true, teeth: true, legs: 2, tall: true }],
    ['three-eyed, 36 in', 24, 20, 36, 0, { eyes: 3, horns: true, teeth: false, legs: 2 }],
    ['wide toothy four-legged, 28 in', 36, 24, 28, 0, { eyes: 2, horns: false, teeth: true, legs: 4 }],
    ['tiny desk size, 8 in', 6, 5, 8, 0, { eyes: 1, horns: true, teeth: false, legs: 2 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, bw = W * (v.legs === 4 ? 0.4 : 0.34), bd = D * 0.4, bz = Z0 + H * 0.5, bh = H * (v.tall ? 0.42 : 0.36);
    a.ell(cx, yc, bz, bw, bd, bh, 20, 12); a.ellp(cx, yc, bw, bd);
    for (let i = 0; i < 7; i++) { const t = (i - 3) * 0.4; ball(a, cx + bw * m.sin(t) * 0.95, yc + bd * 0.35, bz + bh * (0.95 - m.abs(t) * 0.25), bw * 0.1, 6, 4); }
    const fy = yc - bd * 0.9;
    for (let i = 0; i < v.eyes; i++) { const x = cx + (v.eyes === 1 ? 0 : (i - (v.eyes - 1) / 2) * bw * 0.5), z = bz + bh * (v.eyes === 1 ? 0.35 : 0.4), r = bw * (v.eyes === 1 ? 0.3 : v.eyes === 2 ? 0.22 : 0.16); ball(a, x, fy + 2, z, r, 10, 6); ball(a, x, fy - r * 0.5, z - r * 0.05, r * 0.45, 8, 5); }
    a.box(cx - bw * 0.5, fy - 3, bz - bh * 0.25, cx + bw * 0.5, fy + 3, bz - bh * 0.15);
    if (v.teeth) for (let i = 0; i < 6; i++) { const x = cx - bw * 0.45 + i * bw * 0.18; prismY(a, [[x, bz - bh * 0.15], [x + bw * 0.12, bz - bh * 0.15], [x + bw * 0.06, bz - bh * 0.3]], fy - 7, fy - 3); }
    if (v.horns) for (const s of [-1, 1]) a.cone(cx + s * bw * 0.55, yc, bz + bh * 0.8, bz + bh * 1.2, bw * 0.14, 0.5, 10);
    for (const s of [-1, 1]) { a.tube([[cx + s * bw * 0.95, yc, bz + bh * 0.1], [cx + s * bw * 1.2, yc - bd * 0.3, bz - bh * 0.2]], [bw * 0.17, bw * 0.14], 8); for (const t of [-1, 0, 1]) ball(a, cx + s * bw * 1.2 + t * bw * 0.08, yc - bd * 0.33, bz - bh * 0.27, bw * 0.06, 6, 4); }
    if (v.legs === 4) for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const lx = cx + sx * bw * 0.6, ly = yc + sy * bd * 0.45; a.cyl(lx, ly, Z0 + 4, bz - bh * 0.5, bw * 0.17, 10); a.ell(lx, ly - 2, Z0 + 4, bw * 0.22, bd * 0.2, 4, 8, 4); a.circ(lx, ly, bw * 0.2, 'EQUIP-DETAIL'); }
    else for (const s of [-1, 1]) { const lx = cx + s * bw * 0.4; a.cyl(lx, yc, Z0 + H * 0.1, bz - bh * 0.6, bw * 0.2, 10); a.ell(lx, yc - bd * 0.2, Z0 + H * 0.06, bw * 0.3, bd * 0.5, H * 0.06, 10, 6); a.ellp(lx, yc - bd * 0.2, bw * 0.3, bd * 0.5, 'EQUIP-DETAIL'); }
    a.log('Added the furry body, eyes, mouth, horns, arms and legs (plan and 3D).');
  } }),

fam({ cat: 'fun/characters', title: 'Generic cat statue figure',
  desc: (v) => `Cat statue ${v.pose === 'sleep' ? 'curled in a sleeping ring with the head resting on the front paws and a tail wrapped round' : v.pose === 'loaf' ? 'crouched in a loaf shape with tucked paws, a head with two ears and a tail along the side' : 'sitting upright with a chest, haunches, two front legs, a head with two pointed ears, whiskers and a tail curled round the feet'}, on a ${v.plinth ? 'square plinth' : 'flat base'}.`,
  vs: [
    ['sitting, 12 in', 7, 8, 12, 0, { pose: 'sit' }],
    ['sitting, 24 in', 12, 14, 24, 0, { pose: 'sit', plinth: true }],
    ['tall slim sitting, 36 in', 14, 16, 36, 0, { pose: 'sit', plinth: true }],
    ['loaf, 14 in', 10, 16, 14, 0, { pose: 'loaf' }],
    ['sleeping curl, 12 in', 18, 18, 12, 0, { pose: 'sleep' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, ph = v.plinth ? H * 0.1 : H * 0.03;
    a.box(cx - W * 0.48, YF + D * 0.02, Z0, cx + W * 0.48, YB - D * 0.02, Z0 + ph); a.rect(cx - W * 0.48, YF + D * 0.02, cx + W * 0.48, YB - D * 0.02);
    const z0 = Z0 + ph, hh = H - ph;
    if (v.pose === 'sleep') {
      const R = m.min(W, D) * 0.34; a.ell(cx, yc, z0 + hh * 0.35, R * 1.15, R * 1.1, hh * 0.35, 18, 8);
      a.ell(cx, yc - R * 1.1, z0 + hh * 0.3, R * 0.5, R * 0.45, hh * 0.3, 12, 8);
      for (const s of [-1, 1]) prismY(a, [[cx + s * R * 0.2, z0 + hh * 0.5], [cx + s * R * 0.55, z0 + hh * 0.5], [cx + s * R * 0.45, z0 + hh * 0.78]], yc - R * 1.2, yc - R * 1.0);
      a.tube([[cx + R * 0.9, yc - R * 0.2, z0 + hh * 0.2], [cx + R * 1.3, yc - R * 0.9, z0 + hh * 0.2], [cx + R * 0.6, yc - R * 1.4, z0 + hh * 0.18]], [R * 0.15, R * 0.13, R * 0.1], 8);
      a.ellp(cx, yc, R * 1.15, R * 1.1, 'EQUIP-DETAIL'); a.ellp(cx, yc - R * 1.1, R * 0.5, R * 0.45, 'EQUIP-DETAIL');
    } else if (v.pose === 'loaf') {
      a.ell(cx, yc + D * 0.1, z0 + hh * 0.3, W * 0.34, D * 0.34, hh * 0.3, 18, 8);
      a.ell(cx, yc - D * 0.3, z0 + hh * 0.52, W * 0.26, D * 0.16, hh * 0.26, 14, 8);
      for (const s of [-1, 1]) { prismY(a, [[cx + s * W * 0.08, z0 + hh * 0.65], [cx + s * W * 0.22, z0 + hh * 0.65], [cx + s * W * 0.2, z0 + hh * 0.92]], yc - D * 0.36, yc - D * 0.24); a.ell(cx + s * W * 0.15, yc - D * 0.42, z0 + hh * 0.08, W * 0.1, D * 0.08, hh * 0.08, 8, 5); }
      a.tube([[cx + W * 0.3, yc + D * 0.35, z0 + hh * 0.08], [cx + W * 0.4, yc, z0 + hh * 0.07], [cx + W * 0.3, yc - D * 0.3, z0 + hh * 0.08]], [W * 0.05, W * 0.045, W * 0.04], 8);
      a.ellp(cx, yc + D * 0.1, W * 0.34, D * 0.34, 'EQUIP-DETAIL'); a.ellp(cx, yc - D * 0.3, W * 0.26, D * 0.16, 'EQUIP-DETAIL');
    } else {
      a.ell(cx, yc + D * 0.1, z0 + hh * 0.3, W * 0.36, D * 0.34, hh * 0.3, 16, 10); a.ell(cx, yc - D * 0.04, z0 + hh * 0.46, W * 0.28, D * 0.22, hh * 0.3, 14, 8);
      const hz = z0 + hh * 0.8, hr = m.min(W * 0.28, hh * 0.17); a.ell(cx, yc - D * 0.06, hz, hr, hr * 0.9, hr * 0.85, 14, 8);
      for (const s of [-1, 1]) { prismY(a, [[cx + s * hr * 0.3, hz + hr * 0.6], [cx + s * hr * 0.95, hz + hr * 0.5], [cx + s * hr * 0.7, hz + hr * 1.35]], yc - D * 0.12, yc - D * 0.02);
        a.tube([[cx + s * W * 0.15, yc - D * 0.12, z0 + hh * 0.55], [cx + s * W * 0.15, yc - D * 0.25, z0 + hh * 0.05]], [W * 0.07, W * 0.055], 8); a.ell(cx + s * W * 0.15, yc - D * 0.3, z0 + hh * 0.03, W * 0.07, D * 0.1, hh * 0.03, 8, 5);
        ball(a, cx + s * hr * 0.4, yc - D * 0.06 - hr * 0.82, hz + hr * 0.15, hr * 0.14, 6, 4); for (const k of [-1, 1]) a.tube([[cx + s * hr * 0.55, yc - D * 0.06 - hr * 0.85, hz - hr * 0.2 + k * hr * 0.1], [cx + s * hr * 1.3, yc - D * 0.06 - hr * 0.9, hz - hr * 0.2 + k * hr * 0.25]], [1, 1], 4); }
      ball(a, cx, yc - D * 0.06 - hr * 0.9, hz - hr * 0.2, hr * 0.1, 6, 4);
      a.tube([[cx + W * 0.25, yc + D * 0.3, z0 + hh * 0.06], [cx + W * 0.46, yc, z0 + hh * 0.05], [cx + W * 0.4, yc - D * 0.3, z0 + hh * 0.06]], [W * 0.06, W * 0.05, W * 0.04], 8);
      a.ellp(cx, yc + D * 0.1, W * 0.36, D * 0.34, 'EQUIP-DETAIL'); a.circ(cx, yc - D * 0.06, hr, 'EQUIP-DETAIL');
    }
    a.log('Added the base, the body, head with ears and whiskers, paws and tail (plan and 3D).');
  } }),

fam({ cat: 'fun/characters', title: 'Generic toy dinosaur figure',
  desc: (v) => `Toy dinosaur with ${v.kind === 'long' ? 'a long neck and tail, a barrel body and four pillar legs' : v.kind === 'biped' ? 'a big head with a row of teeth, tiny arms, a heavy tail and two strong legs' : v.kind === 'plated' ? 'a row of back plates, spiked tail, small head and four short legs' : 'a bony head frill with three horns, a beaked face and four legs'}, standing on a flat plate.`,
  vs: [
    ['long-necked, 36 in', 14, 40, 26, 0, { kind: 'long' }],
    ['long-necked, 72 in', 28, 80, 54, 0, { kind: 'long' }],
    ['two-legged, 30 in', 14, 34, 24, 0, { kind: 'biped' }],
    ['plated, 24 in', 14, 30, 16, 0, { kind: 'plated' }],
    ['three-horned, 32 in', 16, 36, 18, 0, { kind: 'horned' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, Y = (f) => YB - f * D, pt = H * 0.04;
    a.box(cx - W * 0.48, YF + D * 0.01, Z0, cx + W * 0.48, YB - D * 0.01, Z0 + pt); a.rect(cx - W * 0.48, YF + D * 0.01, cx + W * 0.48, YB - D * 0.01);
    const z0 = Z0 + pt, hh = H - pt, bw = W * 0.34, leg = (f, s, r, hz) => { const x = cx + s * bw * 0.62; a.cyl(x, Y(f), z0, hz, r, 10); a.ell(x, Y(f) - r * 0.4, z0 + 2, r * 1.2, r * 1.3, 4, 8, 4); a.circ(x, Y(f), r, 'EQUIP-DETAIL'); };
    if (v.kind === 'long') {
      const bz = z0 + hh * 0.42; a.ell(cx, Y(0.45), bz, bw, D * 0.22, hh * 0.2, 16, 8); for (const f of [0.3, 0.6]) for (const s of [-1, 1]) leg(f, s, bw * 0.24, bz);
      a.tube([[cx, Y(0.58), bz + hh * 0.1], [cx, Y(0.76), bz + hh * 0.3], [cx, Y(0.88), z0 + hh * 0.78], [cx, Y(0.95), z0 + hh * 0.9]], [bw * 0.32, bw * 0.24, bw * 0.2, bw * 0.16], 10);
      a.ell(cx, Y(0.96), z0 + hh * 0.92, bw * 0.2, D * 0.045, hh * 0.07, 10, 6); for (const s of [-1, 1]) ball(a, cx + s * bw * 0.15, Y(0.985), z0 + hh * 0.94, bw * 0.045, 6, 4);
      a.tube([[cx, Y(0.3), bz], [cx, Y(0.12), z0 + hh * 0.25], [cx, Y(0.02), z0 + hh * 0.1]], [bw * 0.3, bw * 0.14, bw * 0.04], 8);
    } else if (v.kind === 'biped') {
      const bz = z0 + hh * 0.5; a.ell(cx, Y(0.45), bz, bw * 0.9, D * 0.2, hh * 0.22, 14, 8); for (const s of [-1, 1]) { a.tube([[cx + s * bw * 0.45, Y(0.4), bz - hh * 0.05], [cx + s * bw * 0.5, Y(0.35), z0 + hh * 0.22], [cx + s * bw * 0.5, Y(0.42), z0 + 2]], [bw * 0.38, bw * 0.28, bw * 0.2], 10); a.ell(cx + s * bw * 0.5, Y(0.5), z0 + 3, bw * 0.3, D * 0.1, 3, 8, 4); a.tube([[cx + s * bw * 0.4, Y(0.68), bz + hh * 0.05], [cx + s * bw * 0.45, Y(0.76), bz - hh * 0.06]], [bw * 0.1, bw * 0.07], 6); }
      a.tube([[cx, Y(0.3), bz], [cx, Y(0.12), z0 + hh * 0.35], [cx, Y(0.02), z0 + hh * 0.25]], [bw * 0.55, bw * 0.3, bw * 0.06], 8);
      a.tube([[cx, Y(0.62), bz + hh * 0.08], [cx, Y(0.72), bz + hh * 0.3]], [bw * 0.5, bw * 0.4], 8); a.ell(cx, Y(0.84), z0 + hh * 0.84, bw * 0.45, D * 0.13, hh * 0.14, 12, 8);
      for (let i = 0; i < 7; i++) { const x = cx - bw * 0.36 + i * bw * 0.12; prismY(a, [[x, z0 + hh * 0.7], [x + bw * 0.1, z0 + hh * 0.7], [x + bw * 0.05, z0 + hh * 0.64]], Y(0.97), Y(0.96) + 3); }
    } else {
      const bz = z0 + hh * 0.44; a.ell(cx, Y(0.5), bz, bw, D * 0.24, hh * 0.28, 16, 8); for (const f of [0.34, 0.66]) for (const s of [-1, 1]) leg(f, s, bw * 0.2, bz - hh * 0.05);
      a.tube([[cx, Y(0.3), bz], [cx, Y(0.12), z0 + hh * 0.3], [cx, Y(0.02), z0 + hh * 0.3]], [bw * 0.4, bw * 0.2, bw * 0.05], 8);
      if (v.kind === 'plated') { for (let i = 0; i < 7; i++) { const f = 0.3 + i * 0.07, z = bz + hh * (0.2 - m.abs(i - 3) * 0.015); prismX(a, [[Y(f) - D * 0.025, z], [Y(f) + D * 0.025, z], [Y(f), z + hh * (0.45 - m.abs(i - 3) * 0.09)]], cx - 2, cx + 2); } a.ell(cx, Y(0.84), z0 + hh * 0.3, bw * 0.35, D * 0.1, hh * 0.13, 10, 6); for (const s of [-1, 1]) prismY(a, [[cx + s * bw * 0.1, z0 + hh * 0.1], [cx + s * bw * 0.3, z0 + hh * 0.1], [cx + s * bw * 0.25, z0 + hh * 0.35]], Y(0.1) - 2, Y(0.1) + 2); }
      else { a.ell(cx, Y(0.82), z0 + hh * 0.42, bw * 0.45, D * 0.14, hh * 0.22, 12, 8); a.ycyl(Y(0.87), Y(0.83), cx, z0 + hh * 0.48, m.min(bw * 0.75, hh * 0.28), 18); a.ell(cx, Y(0.9), z0 + hh * 0.52, bw * 0.4, D * 0.07, hh * 0.18, 10, 6); a.cone(cx, Y(0.93), z0 + hh * 0.38, z0 + hh * 0.58, bw * 0.06, 0.3, 6); for (const s of [-1, 1]) a.cone(cx + s * bw * 0.35, Y(0.88), z0 + hh * 0.6, z0 + hh * 0.9, bw * 0.08, 0.3, 6); }
    }
    a.outline('EQUIP-HIDDEN'); a.log('Added the base plate, body, legs, neck or head, tail and the plates, teeth or horns (plan and 3D).');
  } }),

// ============================================================================================ fun/novelty
fam({ cat: 'fun/novelty', title: 'Generic lawn flamingo ornament',
  desc: (v) => `Lawn ornament bird with a rounded body, an S-curved neck, a head with a down-bent two-tone beak, a tail, one straight leg with a webbed foot and one folded leg${v.stake ? ', both legs on a ground stake plate' : ''}.`,
  vs: [
    ['garden, 24 in', 10, 14, 24, 0, { stake: false }],
    ['garden, 36 in', 14, 20, 36, 0, { stake: true }],
    ['tall, 48 in', 18, 26, 48, 0, { stake: true }],
    ['giant, 72 in', 26, 40, 72, 0, { stake: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, Y = (f) => YB - f * D, bz = Z0 + H * 0.44, lr = W * 0.035;
    a.cyl(cx, yc, Z0, Z0 + H * 0.02, m.min(W, D) * 0.45, 16); a.circ(cx, yc, m.min(W, D) * 0.45);
    a.ell(cx, Y(0.45), bz, W * 0.38, D * 0.28, H * 0.12, 16, 8); a.ellp(cx, Y(0.45), W * 0.38, D * 0.28, 'EQUIP-DETAIL');
    a.tube([[cx, Y(0.68), bz], [cx, Y(0.84), bz + H * 0.1], [cx, Y(0.82), bz + H * 0.3], [cx, Y(0.9), Z0 + H * 0.86]], [W * 0.1, W * 0.07, W * 0.06, W * 0.07], 10);
    a.ell(cx, Y(0.93), Z0 + H * 0.9, W * 0.09, D * 0.05, H * 0.035, 10, 6); a.tube([[cx, Y(0.95), Z0 + H * 0.91], [cx, Y(0.99), Z0 + H * 0.89], [cx, Y(1.0), Z0 + H * 0.84]], [W * 0.05, W * 0.045, W * 0.02], 8);
    a.tube([[cx, Y(0.2), bz], [cx, Y(0.04), bz + H * 0.08]], [W * 0.1, W * 0.02], 8);
    a.tube([[cx + W * 0.08, Y(0.45), bz - H * 0.08], [cx + W * 0.08, Y(0.45), Z0 + H * 0.02]], [lr, lr], 6); a.ell(cx + W * 0.08, Y(0.5), Z0 + H * 0.03, W * 0.1, D * 0.08, H * 0.012, 8, 4);
    a.tube([[cx - W * 0.08, Y(0.45), bz - H * 0.08], [cx - W * 0.08, Y(0.52), Z0 + H * 0.22], [cx - W * 0.08, Y(0.4), Z0 + H * 0.2]], [lr, lr, lr], 6);
    a.log('Added the base, body, S-curved neck, head and beak, tail and legs (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic wooden spinning top toy',
  desc: (v) => `Spinning top turned from a pointed tip, a wide round belly with ${v.bands} coloured bands, a flat cap ring and a short handle stem${v.rim ? ' with a knurled rim of small studs' : ''}.`,
  vs: [
    ['hand size, 3 in', 3, 3, 3.5, 0, { bands: 3 }],
    ['desk size, 6 in', 6, 6, 7, 0, { bands: 4, rim: true }],
    ['lobby size, 12 in', 12, 12, 14, 0, { bands: 5 }],
    ['giant, 24 in', 24, 24, 28, 0, { bands: 6, rim: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2;
    lathe(a, cx, yc, Z0, [[0, 0.01], [H * 0.04, R * 0.07], [H * 0.12, R * 0.2], [H * 0.25, R * 0.6], [H * 0.36, R * 0.92], [H * 0.42, R], [H * 0.5, R * 0.95], [H * 0.6, R * 0.55], [H * 0.66, R * 0.45], [H * 0.68, R * 0.55], [H * 0.72, R * 0.15], [H * 0.9, R * 0.12], [H * 0.96, R * 0.2], [H, R * 0.2]], 20);
    for (let i = 0; i < v.bands; i++) { const z = Z0 + H * (0.14 + 0.07 * i), r = R * (0.3 + 0.12 * i); if (i < 4) a.cyl(cx, yc, z, z + H * 0.012, r * (i < 3 ? 1.0 : 0.95), 20); }
    a.cyl(cx, yc, Z0 + H * 0.4, Z0 + H * 0.44, R * 1.02, 20);
    if (v.rim) ringOf(a, cx, yc, R * 0.99, 16, Z0 + H * 0.4, H * 0.04, R * 0.04, 0.1);
    a.circ(cx, yc, R); a.circ(cx, yc, R * 0.45, 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.15, 'EQUIP-DETAIL');
    a.log('Added the turned tip, belly with bands and rim, cap and handle stem (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic rocking horse toy',
  desc: (v) => `Rocking horse with two curved runners joined by cross bars, four turned legs, a body, a saddle, an arched neck with a mane, a head with ears, eyes and bridle, a tail${v.handles ? ' and two upright handles' : ''}.`,
  vs: [
    ['toddler, 24 in', 12, 30, 24, 0, { handles: true }],
    ['child, 32 in', 16, 40, 32, 0, { handles: true }],
    ['small plush style, 18 in', 10, 24, 18, 0, { handles: false }],
    ['display, 60 in', 26, 72, 60, 0, { handles: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, Y = (f) => YB - f * D, rk = (s, n = 9) => { const pts = []; for (let i = 0; i <= n; i++) { const f = 0.02 + 0.96 * i / n, u = (f - 0.5) * 2; pts.push([cx + s * W * 0.4, Y(f), Z0 + H * 0.045 + H * 0.1 * u * u]); } return pts; };
    for (const s of [-1, 1]) { a.tube(rk(s), rk(s).map(() => W * 0.045), 6); }
    for (const f of [0.28, 0.72]) a.box(cx - W * 0.4, Y(f) - 4, Z0 + H * 0.06 + H * 0.1 * ((f - 0.5) * 2) ** 2, cx + W * 0.4, Y(f) + 4, Z0 + H * 0.1 + H * 0.1 * ((f - 0.5) * 2) ** 2);
    const bz = Z0 + H * 0.5; a.ell(cx, Y(0.5), bz, W * 0.3, D * 0.27, H * 0.13, 16, 8);
    for (const f of [0.34, 0.66]) for (const s of [-1, 1]) a.tube([[cx + s * W * 0.3, Y(f), bz - H * 0.08], [cx + s * W * 0.38, Y(f), Z0 + H * 0.1 + H * 0.1 * ((f - 0.5) * 2) ** 2]], [W * 0.05, W * 0.04], 8);
    a.box(cx - W * 0.2, Y(0.55), bz + H * 0.1, cx + W * 0.2, Y(0.38), bz + H * 0.14); a.rect(cx - W * 0.2, Y(0.55), cx + W * 0.2, Y(0.38), 'EQUIP-DETAIL');
    a.tube([[cx, Y(0.7), bz + H * 0.04], [cx, Y(0.82), bz + H * 0.2], [cx, Y(0.88), Z0 + H * 0.82]], [W * 0.17, W * 0.14, W * 0.13], 10);
    a.ell(cx, Y(0.93), Z0 + H * 0.84, W * 0.14, D * 0.08, H * 0.1, 12, 8); a.ell(cx, Y(0.99) , Z0 + H * 0.76, W * 0.1, D * 0.03, H * 0.06, 10, 6);
    for (const s of [-1, 1]) { prismY(a, [[cx + s * W * 0.06, Z0 + H * 0.9], [cx + s * W * 0.13, Z0 + H * 0.9], [cx + s * W * 0.1, Z0 + H * 0.99]], Y(0.88), Y(0.9)); ball(a, cx + s * W * 0.14, Y(0.95), Z0 + H * 0.86, W * 0.025, 6, 4); }
    for (let i = 0; i < 5; i++) { const f = 0.72 + i * 0.035; a.box(cx - 2, Y(f) - 4, bz + H * (0.18 + i * 0.1 * 0.5) - 3, cx + 2, Y(f) + 4, bz + H * (0.3 + i * 0.1 * 0.5) + 6); }
    a.tube([[cx, Y(0.22), bz + H * 0.03], [cx, Y(0.08), bz - H * 0.05], [cx, Y(0.04), bz - H * 0.22]], [W * 0.07, W * 0.06, W * 0.03], 8);
    if (v.handles) for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.22, Y(0.8), bz + H * 0.17], [cx + s * W * 0.22, Y(0.82), bz + H * 0.3]], [W * 0.03, W * 0.03], 6); a.xcyl(cx + s * W * 0.22 - W * 0.04, cx + s * W * 0.22 + W * 0.04, Y(0.82), bz + H * 0.3, W * 0.04, 8); }
    for (const s of [-1, 1]) a.line(cx + s * W * 0.4, YF + 2, cx + s * W * 0.4, YB - 2, 'EQUIP-DETAIL'); a.outline();
    a.log('Added the curved runners and cross bars, legs, body, saddle, neck, head with mane and ears, tail and handles (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic bubbling lava lamp novelty',
  desc: (v) => `Novelty lamp with a turned base, a tall tapered glass capsule with ${v.blobs} wax blobs, a metal cap${v.ring ? ' and a ring of studs round the base' : ''}.`,
  vs: [
    ['table, 14 in', 5, 5, 14, 0, { blobs: 4 }],
    ['table, 17 in', 6, 6, 17, 0, { blobs: 5, ring: true }],
    ['floor, 36 in', 10, 10, 36, 0, { blobs: 7 }],
    ['giant lobby, 60 in', 16, 16, 60, 0, { blobs: 9, ring: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2;
    lathe(a, cx, yc, Z0, [[0, R * 0.95], [H * 0.03, R * 0.95], [H * 0.06, R * 0.7], [H * 0.2, R * 0.55], [H * 0.27, R * 0.42], [H * 0.3, R * 0.42]], 20);
    if (v.ring) ringOf(a, cx, yc, R * 0.9, 12, Z0 + H * 0.03, H * 0.03, R * 0.04);
    lathe(a, cx, yc, Z0 + H * 0.3, [[0, R * 0.38], [H * 0.1, R * 0.5], [H * 0.3, R * 0.58], [H * 0.5, R * 0.42], [H * 0.62, R * 0.3]], 20);
    for (let i = 0; i < v.blobs; i++) { const f = (i + 0.5) / v.blobs, z = Z0 + H * (0.34 + 0.54 * f * 0.9), x = cx + (i % 3 - 1) * R * 0.18 * (1 - f * 0.4); a.ell(x, yc + (i % 2 ? 1 : -1) * R * 0.1, z, R * (0.3 - f * 0.08), R * (0.28 - f * 0.08), H * (0.04 + (i % 3) * 0.012), 10, 6); }
    lathe(a, cx, yc, Z0 + H * 0.9, [[0, R * 0.3], [H * 0.03, R * 0.34], [H * 0.06, R * 0.22], [H * 0.09, R * 0.1], [H * 0.1, R * 0.01]], 14);
    ball(a, cx, yc, Z0 + H, R * 0.0 + 0.5, 4, 3); a.circ(cx, yc, R * 0.95); a.circ(cx, yc, R * 0.58, 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.3, 'EQUIP-DETAIL');
    a.log('Added the turned base, glass capsule with wax blobs, the cap and the stud ring (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic giant ice cream cone sculpture',
  desc: (v) => `${v.cup ? 'Sundae cup with a stem and foot, ' : 'Waffle cone with a grid pattern on a display base, '}${v.scoops} scoop${v.scoops > 1 ? 's' : ''} with drip skirts${v.cup ? ', a whipped-cream swirl' : ''} and a cherry on top.`,
  vs: [
    ['single scoop cone, 36 in', 16, 16, 36, 0, { scoops: 1 }],
    ['double scoop cone, 54 in', 18, 18, 54, 0, { scoops: 2 }],
    ['triple scoop cone, 84 in', 24, 24, 84, 0, { scoops: 3 }],
    ['sundae cup, 40 in', 22, 22, 40, 0, { scoops: 2, cup: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2, pt = H * 0.03;
    a.cyl(cx, yc, Z0, Z0 + pt, R * 0.95, 20); a.circ(cx, yc, R * 0.95);
    const sr = R * (v.cup ? 0.62 : 0.62), kz = v.cup ? Z0 + H * 0.4 : Z0 + H * 0.45;
    if (v.cup) { lathe(a, cx, yc, Z0 + pt, [[0, R * 0.55], [H * 0.02, R * 0.3], [H * 0.12, R * 0.1], [H * 0.2, R * 0.1], [H * 0.24, R * 0.4], [H * 0.34, R * 0.75], [H * 0.4, R * 0.85]], 20); a.circ(cx, yc, R * 0.85, 'EQUIP-DETAIL'); }
    else { a.cone(cx, yc, Z0 + pt, kz, 1.0, R * 0.7, 18); for (let i = 1; i < 6; i++) { const f = i / 6, z = Z0 + pt + (kz - Z0 - pt) * f, r = 1 + (R * 0.7 - 1) * f; a.cyl(cx, yc, z, z + 1.2, r + 0.8, 18); } for (let i = 0; i < 8; i++) { const t = (i * TAU) / 8; a.tube([[cx + 2 * m.cos(t), yc + 2 * m.sin(t), Z0 + pt + 2], [cx + R * 0.72 * m.cos(t), yc + R * 0.72 * m.sin(t), kz]], [0.9, 0.9], 4); } a.circ(cx, yc, R * 0.7, 'EQUIP-DETAIL'); }
    let z = kz;
    for (let i = 0; i < v.scoops; i++) { const r = sr * (1 - i * 0.12); a.cyl(cx, yc, z - 2, z + 6, r * 1.02, 18); ball(a, cx, yc, z + r * 0.8, r, 18, 10); a.circ(cx, yc, r, 'EQUIP-DETAIL'); for (let k = 0; k < 7; k++) { const t = (k * TAU) / 7 + i; a.ell(cx + r * 0.92 * m.cos(t), yc + r * 0.92 * m.sin(t), z + 2, r * 0.12, r * 0.12, r * (0.16 + 0.06 * (k % 3)), 6, 4); } z += r * 1.45; }
    if (v.cup) { a.tube([[cx, yc, z - 3], [cx + 3, yc, z + R * 0.15], [cx - 3, yc, z + R * 0.3], [cx, yc, z + R * 0.42]], [R * 0.36, R * 0.28, R * 0.2, R * 0.08], 12); z += R * 0.4; }
    ball(a, cx, yc, m.min(Z0 + H - R * 0.12, z + R * 0.1), R * 0.12, 8, 6);
    a.log('Added the display base, cone or cup, the scoops with drip skirts and the cherry (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic giant pencil sculpture',
  desc: (v) => `Giant pencil standing on its eraser end: a ferrule band, a ${v.sides}-sided painted shaft with a lettering stripe, a sharpened wood cone with shaving curls and a lead tip.`,
  vs: [
    ['six-sided, 48 in', 8, 8, 48, 0, { sides: 6 }],
    ['six-sided, 72 in', 12, 12, 72, 0, { sides: 6 }],
    ['round barrel, 96 in', 16, 16, 96, 0, { sides: 12 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2 * 0.98, n = v.sides, poly = (r, ph = 0) => { const o = []; for (let i = 0; i < n; i++) { const t = ph + (i * TAU) / n; o.push([cx + r * m.cos(t), yc + r * m.sin(t)]); } return o; };
    a.cyl(cx, yc, Z0, Z0 + H * 0.06, R * 0.85, 20); a.cyl(cx, yc, Z0 + H * 0.06, Z0 + H * 0.13, R * 0.95, 20);
    for (let i = 0; i < 3; i++) a.cyl(cx, yc, Z0 + H * (0.075 + i * 0.02), Z0 + H * (0.08 + i * 0.02), R * 0.97, 20);
    prismS(a, poly(R, 0.2), Z0 + H * 0.13, Z0 + H * 0.78);
    for (let i = 0; i < n; i += 2) a.box(cx - R * 0.5, yc - R * 0.98 - 0.0, Z0 + H * 0.3, cx + R * 0.5, yc - R * 0.9, Z0 + H * 0.56);
    a.cone(cx, yc, Z0 + H * 0.78, Z0 + H * 0.93, R * 0.99, R * 0.12, 20); a.cone(cx, yc, Z0 + H * 0.93, Z0 + H, R * 0.12, 0.3, 12);
    for (let i = 0; i < 3; i++) { const t = i * 2.1; a.tube([[cx + R * 0.95 * m.cos(t), yc + R * 0.95 * m.sin(t), Z0 + H * 0.78], [cx + R * 1.05 * m.cos(t), yc + R * 1.05 * m.sin(t), Z0 + H * 0.8], [cx + R * 1.1 * m.cos(t), yc + R * 1.1 * m.sin(t), Z0 + H * 0.77]], [2, 2, 1], 4); }
    a.outline(); a.poly(poly(R, 0.2), 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.85, 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.12, 'EQUIP-DETAIL');
    a.log('Added the eraser, ferrule bands, shaft with stripe, sharpened cone, shaving curls and lead (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic carnival strength tester',
  desc: (v) => `Carnival strength game with a base pad and lever, a tall twin-post tower with a scale of ${v.marks} rungs, a striped puck track, a bell on a bracket${v.sign ? ', a header sign board' : ''} and a wooden mallet lying at the front.`,
  vs: [
    ['tower, 96 in', 30, 24, 96, 0, { marks: 9 }],
    ['tower with header, 120 in', 34, 26, 120, 0, { marks: 11, sign: true }],
    ['tall, 156 in', 40, 30, 156, 0, { marks: 14, sign: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = YB - D * 0.3, bh = H * 0.05, pw = W * 0.045;
    a.box(cx - W * 0.46, YB - D * 0.66, Z0, cx + W * 0.46, YB - D * 0.02, Z0 + bh); a.rect(cx - W * 0.46, YB - D * 0.66, cx + W * 0.46, YB - D * 0.02);
    a.box(cx - W * 0.18, YB - D * 0.5, Z0 + bh, cx + W * 0.18, YB - D * 0.34, Z0 + bh * 1.5); a.rect(cx - W * 0.18, YB - D * 0.5, cx + W * 0.18, YB - D * 0.34, 'EQUIP-DETAIL');
    const tx = W * 0.13, top = Z0 + H * (v.sign ? 0.86 : 0.93);
    for (const s of [-1, 1]) a.box(cx + s * tx - pw, yc - pw, Z0 + bh, cx + s * tx + pw, yc + pw, top);
    a.box(cx - tx, yc - 2, Z0 + bh * 1.5, cx + tx, yc + 2, top);
    for (let i = 0; i < v.marks; i++) { const z = Z0 + bh * 2 + (top - Z0 - bh * 3) * i / (v.marks - 1); a.box(cx - tx - pw * 1.6, yc - pw * 1.6, z - 2, cx + tx + pw * 1.6, yc - pw, z + 2); }
    a.box(cx - tx * 0.35, yc - 5, Z0 + bh * 2, cx + tx * 0.35, yc - 1, Z0 + bh * 2 + H * 0.03);
    a.box(cx - tx - pw, yc - pw * 1.4, top, cx + tx + pw, yc + pw * 1.4, top + H * 0.02);
    const bz = top + H * 0.02; a.cyl(cx, yc, bz, bz + 3, W * 0.1, 14); lathe(a, cx, yc, bz + 3, [[0, W * 0.09], [H * 0.02, W * 0.08], [H * 0.04, W * 0.03]], 12);
    if (v.sign) { a.box(cx - W * 0.4, yc - pw, Z0 + H * 0.88, cx + W * 0.4, yc + pw, Z0 + H * 0.98); a.rect(cx - W * 0.4, yc - pw, cx + W * 0.4, yc + pw, 'EQUIP-DETAIL'); for (let i = 0; i < 6; i++) ball(a, cx - W * 0.33 + i * W * 0.132, yc - pw - 2, Z0 + H * 0.93, 3, 5, 4); }
    const mz = Z0 + bh + 5; a.tube([[cx - W * 0.3, YF + D * 0.2, Z0 + 4], [cx - W * 0.1, YF + D * 0.04, Z0 + 4]], [3, 3], 6); a.box(cx - W * 0.1, YF + D * 0.04 - 3, Z0, cx + W * 0.08, YF + D * 0.04 + 6, Z0 + 9); void mz;
    a.rect(cx - tx - pw, yc - pw, cx + tx + pw, yc + pw, 'EQUIP-DETAIL'); a.log('Added the base pad and lever, twin posts with rungs and puck track, bell, header and mallet (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic party pinata on hanging frame',
  desc: (v) => `${v.kind === 'ball' ? 'Round pinata with a fringe of paper tassels in four rings' : `Star pinata with ${v.pts} points, tassels at each tip and a paper fringe round the edge`}, hung by a rope from the crossbar of a wooden frame with two posts, foot bars and a crossbar.`,
  vs: [
    ['five-point star, 60 in', 40, 24, 60, 0, { kind: 'star', pts: 5 }],
    ['seven-point star, 84 in', 56, 28, 84, 0, { kind: 'star', pts: 7 }],
    ['round ball, 72 in', 40, 28, 72, 0, { kind: 'ball' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, pw = W * 0.025, top = Z0 + H * 0.97;
    for (const s of [-1, 1]) { const x = cx + s * W * 0.46; a.box(x - pw, yc - pw, Z0 + H * 0.02, x + pw, yc + pw, top); a.box(x - pw * 1.2, YF + D * 0.05, Z0, x + pw * 1.2, YB - D * 0.05, Z0 + H * 0.02); a.rect(x - pw * 1.2, YF + D * 0.05, x + pw * 1.2, YB - D * 0.05); }
    a.box(cx - W * 0.46 - pw, yc - pw, top - pw * 1.5, cx + W * 0.46 + pw, yc + pw, top + 0.5 * 0 + Z0 * 0 + (Z0 + H - top)); 
    const pz = Z0 + H * 0.42, pr = m.min(W * 0.32, H * 0.3); a.tube([[cx, yc, top - pw], [cx, yc, pz + pr * 0.95]], [2.5, 2.5], 6);
    if (v.kind === 'ball') { ball(a, cx, yc, pz, pr, 16, 10); for (let r = 0; r < 4; r++) { const z = pz + pr * (0.6 - r * 0.4), rr = pr * m.sqrt(1 - ((z - pz) / pr) ** 2) * 1.04; for (let i = 0; i < 12; i++) { const t = (i * TAU) / 12 + r * 0.3; a.tube([[cx + rr * m.cos(t), yc + rr * m.sin(t), z], [cx + rr * 1.12 * m.cos(t), yc + rr * 1.12 * m.sin(t), z - pr * 0.18]], [2, 1], 4); } } a.circ(cx, yc, pr * 1.1); }
    else { const pts = starPts(cx, pz, pr, pr * 0.5, v.pts, m.PI / 2); prismSY(a, pts, yc - D * 0.22, yc + D * 0.22); for (let i = 0; i < v.pts; i++) { const [x, z] = pts[i * 2]; a.tube([[x, yc - D * 0.22, z], [x + (x - cx) * 0.08, yc - D * 0.25, z + (z - pz) * 0.08 - pr * 0.12]], [3, 1.5], 5); } a.ell(cx, yc, pz, pr * 0.5, D * 0.26, pr * 0.5, 12, 8); a.rect(cx - pr, yc - D * 0.22, cx + pr, yc + D * 0.22, 'EQUIP-DETAIL'); }
    a.log('Added the frame, rope and the pinata with its tassels (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic novelty snow globe',
  desc: (v) => `Snow globe with a turned base, a glass sphere, a snowy hill with ${v.trees} small fir trees ${v.house ? 'and a cottage with a roof ' : ''}inside, and snowflake flecks.`,
  vs: [
    ['desk, 4 in', 3.5, 3.5, 5, 0, { trees: 2 }],
    ['mantel, 8 in', 6, 6, 9, 0, { trees: 3, house: true }],
    ['table, 12 in', 9, 9, 13, 0, { trees: 5, house: true }],
    ['giant display, 36 in', 28, 28, 40, 0, { trees: 8, house: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2, bh = H * 0.24, gr = (H - bh) * 0.5 / 1.0 > R * 0.85 ? R * 0.85 : (H - bh) / 2;
    lathe(a, cx, yc, Z0, [[0, R * 0.96], [bh * 0.18, R * 0.96], [bh * 0.3, R * 0.8], [bh * 0.65, R * 0.62], [bh * 0.85, R * 0.66], [bh, R * 0.64]], 22);
    a.cyl(cx, yc, Z0 + bh * 0.62, Z0 + bh * 0.7, R * 0.84, 22);
    const gz = Z0 + bh + gr * 0.95; a.ell(cx, yc, gz, gr, gr, gr, 22, 12);
    a.ell(cx, yc, Z0 + bh + gr * 0.2, gr * 0.78, gr * 0.78, gr * 0.22, 16, 6);
    for (let i = 0; i < v.trees; i++) { const t = i * 2.4, rr = gr * (v.trees > 3 ? 0.18 + 0.4 * ((i * 0.37) % 1) : 0.4), x = cx + rr * m.cos(t), y = yc + rr * m.sin(t), th = gr * (0.4 + 0.15 * (i % 3)); a.cone(x, y, Z0 + bh + gr * 0.28, Z0 + bh + gr * 0.28 + th, gr * 0.14, 0.4, 8); a.cone(x, y, Z0 + bh + gr * 0.28 + th * 0.4, Z0 + bh + gr * 0.28 + th * 1.2, gr * 0.1, 0.4, 8); }
    if (v.house) { const hx = cx + gr * 0.1, hy = yc - gr * 0.05; a.box(hx - gr * 0.17, hy - gr * 0.14, Z0 + bh + gr * 0.25, hx + gr * 0.17, hy + gr * 0.14, Z0 + bh + gr * 0.5); prismX(a, [[hy - gr * 0.17, Z0 + bh + gr * 0.5], [hy + gr * 0.17, Z0 + bh + gr * 0.5], [hy, Z0 + bh + gr * 0.7]], hx - gr * 0.19, hx + gr * 0.19); }
    for (let i = 0; i < 16; i++) { const t = i * 2.4, rr = gr * 0.75 * ((i * 0.618) % 1), zz = Z0 + bh + gr * (0.4 + 1.3 * ((i * 0.37) % 1)); ball(a, cx + rr * m.cos(t), yc + rr * m.sin(t), zz, m.max(0.8, gr * 0.025), 4, 3); }
    a.circ(cx, yc, R * 0.96); a.circ(cx, yc, gr, 'EQUIP-DETAIL'); a.log('Added the turned base, glass sphere, snowy hill, trees, cottage and snow flecks (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic compass-point weathervane',
  desc: (v) => `Weathervane on a base plate: a tall post with a ball, a compass cross of two arms with four letter blocks, ${v.fish ? 'a fish-shaped pointer' : 'an arrow pointer'} with a tail fin on a swivel above.`,
  vs: [
    ['arrow, 36 in', 20, 20, 36, 0, {}],
    ['arrow, 60 in', 30, 30, 60, 0, {}],
    ['fish pointer, 96 in', 44, 44, 96, 0, { fish: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2, pr = R * 0.045;
    a.cyl(cx, yc, Z0, Z0 + H * 0.03, R * 0.5, 20); a.circ(cx, yc, R * 0.5);
    a.tube([[cx, yc, Z0 + H * 0.03], [cx, yc, Z0 + H * 0.78]], [pr * 1.6, pr], 8);
    const cz = Z0 + H * 0.5; ball(a, cx, yc, cz, pr * 3, 10, 6);
    a.tube([[cx - R * 0.8, yc, cz], [cx + R * 0.8, yc, cz]], [pr, pr], 6); a.tube([[cx, yc - R * 0.8, cz], [cx, yc + R * 0.8, cz]], [pr, pr], 6);
    for (const [x, y] of [[0, -0.95], [0, 0.95], [0.95, 0], [-0.95, 0]]) a.box(cx + x * R - pr * 2, yc + y * R - pr * 2, cz - pr * 2, cx + x * R + pr * 2, yc + y * R + pr * 2, cz + pr * 2);
    a.line(cx - R * 0.8, yc, cx + R * 0.8, yc, 'EQUIP-DETAIL'); a.line(cx, yc - R * 0.8, cx, yc + R * 0.8, 'EQUIP-DETAIL');
    const az = Z0 + H * 0.8; a.cyl(cx, yc, Z0 + H * 0.76, az, pr * 2, 8);
    if (v.fish) { prismX(a, [[yc - R * 0.9, az + H * 0.05], [yc - R * 0.2, az + H * 0.12], [yc + R * 0.4, az + H * 0.1], [yc + R * 0.7, az + H * 0.04], [yc + R * 0.4, az + H * 0.02]], cx - 3, cx + 3); prismX(a, [[yc + R * 0.5, az + H * 0.07], [yc + R * 0.95, az + H * 0.16], [yc + R * 0.95, az - H * 0.02]], cx - 2, cx + 2); }
    else { a.tube([[cx, yc - R * 0.9, az + H * 0.1], [cx, yc + R * 0.9, az + H * 0.1]], [pr, pr], 6); prismX(a, [[yc - R * 1.0, az + H * 0.1], [yc - R * 0.7, az + H * 0.15], [yc - R * 0.7, az + H * 0.05]], cx - 2, cx + 2); prismX(a, [[yc + R * 0.55, az + H * 0.1], [yc + R * 0.95, az + H * 0.18], [yc + R * 0.95, az + H * 0.02]], cx - 2, cx + 2); a.tube([[cx, yc, az], [cx, yc, az + H * 0.1]], [pr, pr], 6); }
    a.log('Added the base plate, post, compass cross with letter blocks, swivel and pointer (plan and 3D).');
  } }),

// ============================================================================================ fun/puzzles
fam({ cat: 'fun/puzzles', title: 'Generic sliding tile puzzle on feet',
  desc: (v) => `Upright sliding tile puzzle: a frame with an inner lip, ${v.n * v.n - 1} raised numbered tiles in a ${v.n} by ${v.n} grid with one gap, and two foot blocks.`,
  vs: [
    ['3 by 3, 8 in', 8, 3, 9, 0, { n: 3 }],
    ['4 by 4, 10 in', 10, 3, 11, 0, { n: 4 }],
    ['5 by 5, 14 in', 14, 4, 15, 0, { n: 5 }],
    ['3 by 3, giant 24 in', 24, 7, 26, 0, { n: 3 }],
    ['4 by 4, giant 36 in', 36, 9, 38, 0, { n: 4 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, n = v.n, fw = W * 0.06, fh = H * 0.08, yc = (YF + YB) / 2, fy0 = yc - D * 0.3, fy1 = yc + D * 0.3, z0 = Z0 + fh, z1 = Z0 + H, bw = W;
    for (const s of [-1, 1]) a.box(cx + s * W * 0.34 - W * 0.1, YF + D * 0.05, Z0, cx + s * W * 0.34 + W * 0.1, YB - D * 0.05, z0); a.rect(cx - W * 0.44, YF + D * 0.05, cx + W * 0.44, YB - D * 0.05, 'EQUIP-DETAIL');
    a.box(cx - bw / 2, fy0, z0, cx - bw / 2 + fw, fy1, z1); a.box(cx + bw / 2 - fw, fy0, z0, cx + bw / 2, fy1, z1); a.box(cx - bw / 2 + fw, fy0, z0, cx + bw / 2 - fw, fy1, z0 + fw); a.box(cx - bw / 2 + fw, fy0, z1 - fw, cx + bw / 2 - fw, fy1, z1);
    a.box(cx - bw / 2 + fw, yc + D * 0.18, z0 + fw, cx + bw / 2 - fw, fy1 - 1, z1 - fw);
    const ix = bw - 2 * fw, iz = z1 - z0 - 2 * fw, tw = ix / n, th = iz / n, gap = tw * 0.06;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { if (r === n - 1 && c === n - 1) continue; const x0 = cx - bw / 2 + fw + c * tw + gap, zz = z1 - fw - (r + 1) * th + gap; a.box(x0, yc + D * 0.1, zz, x0 + tw - 2 * gap, yc + D * 0.18, zz + th - 2 * gap); a.box(x0 + tw * 0.28, yc + D * 0.05, zz + th * 0.28, x0 + tw * 0.62, yc + D * 0.1, zz + th * 0.6); }
    a.rect(cx - bw / 2, fy0, cx + bw / 2, fy1); a.line(cx - bw / 2 + fw, yc + D * 0.18, cx + bw / 2 - fw, yc + D * 0.18, 'EQUIP-DETAIL');
    a.log('Added the foot blocks, frame with back panel, the raised tiles with numerals and the empty slot (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic tower of discs puzzle',
  desc: (v) => `Three-peg disc puzzle: a long base board on feet with three pegs and ${v.discs} graded discs${v.moved ? ' split over two pegs' : ' stacked on the first peg'}.`,
  vs: [
    ['3 discs, 8 in', 8, 3, 5, 0, { discs: 3 }],
    ['5 discs, 12 in', 12, 4, 7, 0, { discs: 5 }],
    ['6 discs, 16 in, discs moved', 16, 5, 8, 0, { discs: 6, moved: true }],
    ['8 discs, 24 in', 24, 7, 10, 0, { discs: 8 }],
    ['8 discs, giant 60 in', 60, 18, 26, 0, { discs: 8, moved: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, bh = H * 0.1, z0 = Z0 + bh * 1.5, px = W * 0.3, rmax = m.min(W * 0.15, D * 0.46), pr = rmax * 0.09, dh = (H * 0.85 - bh * 1.5) / m.max(v.discs, 5) * 0.9;
    a.box(cx - W / 2, YF, Z0 + bh * 0.5, cx + W / 2, YB, z0); for (const s of [-1, 1]) for (const t of [-1, 1]) a.cyl(cx + s * W * 0.44, yc + t * D * 0.35, Z0, Z0 + bh * 0.5, W * 0.03, 8);
    a.rect(cx - W / 2, YF, cx + W / 2, YB);
    for (const i of [-1, 0, 1]) { a.cyl(cx + i * px, yc, z0, Z0 + H * 0.98, pr, 8); a.circ(cx + i * px, yc, rmax, 'EQUIP-DETAIL'); }
    const stack = [0, 0, 0]; for (let k = 0; k < v.discs; k++) { const idx = v.moved && k % 3 === 1 ? 1 : v.moved && k % 3 === 2 ? 2 : 0; const r = rmax * (1 - (k * 0.7) / v.discs * 0.8), zz = z0 + stack[idx] * dh; a.cyl(cx + (idx - 1) * px, yc, zz, zz + dh, r, 18); a.circ(cx + (idx - 1) * px, yc, r, 'EQUIP-DETAIL'); stack[idx]++; }
    a.log('Added the base board and feet, three pegs and the graded discs (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic stacked ball pyramid puzzle',
  desc: (v) => `Pyramid of ${(v.n * (v.n + 1) * (2 * v.n + 1)) / 6} spheres in ${v.n} square layers resting in a square wooden tray with a raised rim.`,
  vs: [
    ['3 layers, 7 in', 7, 7, 5.5, 0, { n: 3 }],
    ['4 layers, 11 in', 11, 11, 8.7, 0, { n: 4 }],
    ['5 layers, 16 in', 16, 16, 13, 0, { n: 5 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, n = v.n, tray = W * 0.05, R = (W - 2 * tray) / (2 * n) * 0.98, th = H * 0.06;
    a.box(cx - W / 2, YF, Z0, cx + W / 2, YB, Z0 + th); for (const s of [-1, 1]) { a.box(cx + s * (W / 2 - tray / 2) - tray / 2, YF, Z0 + th, cx + s * (W / 2 - tray / 2) + tray / 2, YB, Z0 + th * 2.2); a.box(cx - W / 2, yc + s * (D / 2 - tray / 2) - tray / 2, Z0 + th, cx + W / 2, yc + s * (D / 2 - tray / 2) + tray / 2, Z0 + th * 2.2); }
    a.rect(cx - W / 2, YF, cx + W / 2, YB); a.rect(cx - W / 2 + tray, YF + tray, cx + W / 2 - tray, YB - tray, 'EQUIP-DETAIL');
    for (let k = 0; k < n; k++) { const c = n - k, z = Z0 + th + R + k * R * 1.4142; for (let i = 0; i < c; i++) for (let j = 0; j < c; j++) ball(a, cx + (i - (c - 1) / 2) * 2 * R, yc + (j - (c - 1) / 2) * 2 * R, z, R, 8, 5); if (k === 0) for (let i = 0; i < c; i++) for (let j = 0; j < c; j++) a.circ(cx + (i - (c - 1) / 2) * 2 * R, yc + (j - (c - 1) / 2) * 2 * R, R, 'EQUIP-DETAIL'); }
    a.log('Added the tray with its rim and the layers of balls (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic peg solitaire board',
  desc: (v) => `Round wooden solitaire board on a turned foot ring with a raised rim, ${v.holes} holes in a cross pattern${v.pegs ? ' filled with peg-shaped pieces' : ' filled with glass marbles'} and one hole left open at the centre.`,
  vs: [
    ['33 holes, marbles, 10 in', 10, 10, 3, 0, { holes: 33, pegs: false }],
    ['37 holes, marbles, 12 in', 12, 12, 3.5, 0, { holes: 37, pegs: false }],
    ['33 holes, pegs, 8 in', 8, 8, 3, 0, { holes: 33, pegs: true }],
    ['33 holes, giant pegs, 30 in', 30, 30, 10, 0, { holes: 33, pegs: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2, bh = H * 0.25, dh = H * 0.2, st = R * 0.24;
    a.cyl(cx, yc, Z0, Z0 + bh, R * 0.78, 24); a.cyl(cx, yc, Z0 + bh, Z0 + bh + dh, R, 28); a.circ(cx, yc, R); a.circ(cx, yc, R * 0.78, 'EQUIP-HIDDEN');
    a.cyl(cx, yc, Z0 + bh + dh, Z0 + bh + dh + H * 0.04, R, 28); a.cyl(cx, yc, Z0 + bh + dh * 0.9, Z0 + bh + dh + H * 0.04, R * 0.9, 28);
    const fr = v.holes === 37 ? 2 : 3; let cnt = 0;
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const ok = (m.abs(i) <= 1 || m.abs(j) <= 1) || (v.holes === 37 && m.abs(i) <= 2 && m.abs(j) <= 2); if (!ok) continue; cnt++; const x = cx + i * st, y = yc + j * st, z = Z0 + bh + dh + H * 0.04; a.circ(x, y, st * 0.38, 'EQUIP-DETAIL'); if (i === 0 && j === 0) continue; if (v.pegs) { a.cyl(x, y, z, z + H * 0.4, st * 0.18, 8); ball(a, x, y, z + H * 0.4, st * 0.24, 6, 4); } else ball(a, x, y, z + st * 0.28, st * 0.34, 8, 5); }
    void fr; void cnt; a.log('Added the foot ring, board with rim, the cross pattern of holes and the marbles or pegs (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic garden hedge maze',
  desc: (v) => `Square garden hedge maze of ${v.rings} nested wall rings, each ring with one gap placed on alternating sides, an entrance gap in the front ring and a centre plinth with a ball finial.`,
  vs: [
    ['3 rings, 20 ft', 240, 240, 72, 0, { rings: 3 }],
    ['4 rings, 30 ft', 360, 360, 72, 0, { rings: 4 }],
    ['5 rings, 40 ft', 480, 480, 78, 0, { rings: 5 }],
    ['6 rings, 50 ft', 600, 600, 84, 0, { rings: 6 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, n = v.rings, hw = W * 0.045, step = (W / 2 - hw) / (n + 0.7), top = Z0 + H, seg = (x0, y0, x1, y1) => { a.box(m.min(x0, x1), m.min(y0, y1), Z0, m.max(x0, x1), m.max(y0, y1), top); a.rect(m.min(x0, x1), m.min(y0, y1), m.max(x0, x1), m.max(y0, y1)); };
    for (let k = 0; k < n; k++) {
      const h = W / 2 - hw - k * step, g = step * 0.55, gs = k % 4, hx0 = cx - h, hx1 = cx + h, hy0 = yc - h, hy1 = yc + h;
      const sides = [['f', hx0, hy0, hx1, hy0], ['r', hx1, hy0, hx1, hy1], ['b', hx1, hy1, hx0, hy1], ['l', hx0, hy1, hx0, hy0]];
      sides.forEach(([sd, x0, y0, x1, y1], si) => {
        const horiz = y0 === y1, gap = (si === gs) ? g : 0, mid = horiz ? (x0 + x1) / 2 : (y0 + y1) / 2;
        const ox = horiz ? [m.min(x0, x1) - hw, m.max(x0, x1) + hw] : [m.min(y0, y1) - hw, m.max(y0, y1) + hw];
        if (!gap) { if (horiz) seg(ox[0], y0 - hw, ox[1], y0 + hw); else seg(x0 - hw, ox[0], x0 + hw, ox[1]); }
        else if (horiz) { seg(ox[0], y0 - hw, mid - gap, y0 + hw); seg(mid + gap, y0 - hw, ox[1], y0 + hw); } else { seg(x0 - hw, ox[0], x0 + hw, mid - gap); seg(x0 - hw, mid + gap, x0 + hw, ox[1]); }
        void sd;
      });
    }
    const ch = W / 2 - hw - n * step; if (ch > 4) { a.cyl(cx, yc, Z0, Z0 + H * 0.35, ch * 0.5, 14); ball(a, cx, yc, Z0 + H * 0.35 + ch * 0.3, ch * 0.3, 10, 6); a.circ(cx, yc, ch * 0.5, 'EQUIP-DETAIL'); }
    a.log('Added the nested hedge walls with their gaps, the entrance and the centre plinth (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic domino run on a base board',
  desc: (v) => `${v.n} dominoes standing on edge along ${v.path === 'line' ? 'a straight line' : v.path === 'wave' ? 'an S-shaped wave' : 'an inward spiral'}, each with a centre divider and spots, on a framed base board.`,
  vs: [
    ['straight line, 12 dominoes', 28, 6, 3, 0, { n: 12, path: 'line' }],
    ['S wave, 20 dominoes', 28, 14, 3, 0, { n: 20, path: 'wave' }],
    ['spiral, 36 dominoes', 24, 24, 3, 0, { n: 36, path: 'spiral' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, bt = H * 0.1, dz = H * 0.9, dl = m.min(W, D) * 0.07 * (v.path === 'line' ? 1.6 : 1.0), fr = 6;
    a.box(cx - W / 2, YF, Z0, cx + W / 2, YB, Z0 + bt); a.rect(cx - W / 2, YF, cx + W / 2, YB); a.rect(cx - W / 2 + fr, YF + fr, cx + W / 2 - fr, YB - fr, 'EQUIP-DETAIL');
    const P = (i) => { const f = i / (v.n - 1); if (v.path === 'line') return [cx - W * 0.42 + f * W * 0.84, yc, 0]; if (v.path === 'wave') { const x = cx - W * 0.42 + f * W * 0.84; return [x, yc + m.sin(f * TAU) * D * 0.3, m.cos(f * TAU) * 0.0]; } const ang = f * TAU * 2.1, r = (m.min(W, D) * 0.42) * (1 - f * 0.8); return [cx + r * m.cos(ang), yc + r * m.sin(ang), 0]; };
    for (let i = 0; i < v.n; i++) {
      const p = P(i), q = P(m.min(i + 1, v.n - 1)), p0 = P(m.max(i - 1, 0)); const dx = q[0] - p0[0], dy = q[1] - p0[1], L = m.hypot(dx, dy) || 1, tx = dx / L, ty = dy / L, nx = -ty, ny = tx, hl = dl * 0.5, ht = dl * 0.12;
      const c = [[p[0] - nx * hl - tx * ht, p[1] - ny * hl - ty * ht], [p[0] + nx * hl - tx * ht, p[1] + ny * hl - ty * ht], [p[0] + nx * hl + tx * ht, p[1] + ny * hl + ty * ht], [p[0] - nx * hl + tx * ht, p[1] - ny * hl + ty * ht]];
      prismS(a, c, Z0 + bt, Z0 + bt + dz); a.poly(c, 'EQUIP-DETAIL');
      a.box(p[0] - 1, p[1] - 1, Z0 + bt + dz, p[0] + 1, p[1] + 1, Z0 + bt + dz + 0.01);
      for (const s of [-1, 1]) a.cyl(p[0] + nx * s * hl * 0.5 - tx * ht, p[1] + ny * s * hl * 0.5 - ty * ht, Z0 + bt + dz * 0.5, Z0 + bt + dz * 0.5 + 0.5 * 0, 0.5, 4);
    }
    a.log('Added the framed board and the standing dominoes along the path (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic dice tower with ramps',
  desc: (v) => `Square dice tower with a back wall, two side walls, a front rim, ${v.ramps} slanted baffles inside and an exit tray with a raised edge${v.turret ? ', topped with a row of battlement blocks' : ''}.`,
  vs: [
    ['compact, 6 in', 4, 7, 7, 0, { ramps: 2 }],
    ['standard, 9 in', 5, 9, 10, 0, { ramps: 3 }],
    ['battlement, 12 in', 6, 11, 13, 0, { ramps: 4, turret: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, t = W * 0.08, ty0 = YB - D * 0.5, trayz = H * 0.07, top = Z0 + H - (v.turret ? H * 0.1 : 0), xi0 = cx - W / 2 + t, xi1 = cx + W / 2 - t;
    a.box(cx - W / 2, YF, Z0, cx + W / 2, YF + D * 0.45, Z0 + trayz); a.box(cx - W / 2, YF, Z0 + trayz, cx + W / 2, YF + t, Z0 + trayz * 2); for (const s of [-1, 1]) a.box(cx + s * (W / 2 - t / 2) - t / 2, YF, Z0 + trayz, cx + s * (W / 2 - t / 2) + t / 2, YF + D * 0.45, Z0 + trayz * 2);
    a.box(cx - W / 2, YB - t, Z0 + trayz, cx + W / 2, YB, top); for (const s of [-1, 1]) a.box(cx + s * (W / 2 - t / 2) - t / 2, ty0, Z0 + trayz, cx + s * (W / 2 - t / 2) + t / 2, YB, top);
    a.box(cx - W / 2, ty0, top - H * 0.07, cx + W / 2, ty0 + t, top);
    a.box(cx - W / 2, ty0, Z0, cx + W / 2, YB, Z0 + trayz);
    const rd = YB - t - ty0; for (let i = 0; i < v.ramps; i++) { const zt = top - H * 0.16 - i * (top - Z0 - trayz - H * 0.32) / m.max(1, v.ramps - 1 + 0.6), dir = i % 2 ? 1 : 0, x0 = dir ? xi0 : xi0 + (xi1 - xi0) * 0.18, x1 = dir ? xi1 - (xi1 - xi0) * 0.18 : xi1; prismX(a, [[ty0 + t, zt], [YB - t, zt - H * 0.1], [YB - t, zt - H * 0.1 - 4], [ty0 + t, zt - 4]], x0, x1); void rd; }
    if (v.turret) for (let i = 0; i < 5; i++) a.box(cx - W / 2 + i * W * 0.2, ty0, top, cx - W / 2 + i * W * 0.2 + W * 0.12, YB, Z0 + H);
    a.rect(cx - W / 2, ty0, cx + W / 2, YB); a.rect(cx - W / 2, YF, cx + W / 2, YF + D * 0.45, 'EQUIP-DETAIL');
    a.log('Added the tower walls, internal ramps, the exit tray and its rim (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic counting frame abacus',
  desc: (v) => `Counting frame with two uprights, a top and bottom rail, ${v.rows} rods each holding ten round beads in two colours, on a pair of foot blocks${v.stand ? ' and floor stand legs' : ''}.`,
  vs: [
    ['4 rods, 8 in', 8, 3, 9, 0, { rows: 4 }],
    ['6 rods, 10 in', 10, 3, 11, 0, { rows: 6 }],
    ['8 rods, 14 in', 14, 4, 15, 0, { rows: 8 }],
    ['10 rods, 20 in', 20, 5, 22, 0, { rows: 10 }],
    ['10 rods, classroom floor stand, 48 in', 36, 18, 48, 0, { rows: 10, stand: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, fw = W * 0.05, fd = D * 0.5, fb = v.stand ? H * 0.3 : H * 0.06, z0 = Z0 + fb, z1 = Z0 + H;
    if (v.stand) { for (const s of [-1, 1]) { a.box(cx + s * W * 0.4 - W * 0.04, YF + D * 0.05, Z0, cx + s * W * 0.4 + W * 0.04, YB - D * 0.05, Z0 + H * 0.05); a.tube([[cx + s * W * 0.4, yc, Z0 + H * 0.05], [cx + s * W * 0.46, yc, z0]], [W * 0.025, W * 0.025], 6); } a.rect(cx - W * 0.46, YF + D * 0.05, cx + W * 0.46, YB - D * 0.05, 'EQUIP-DETAIL'); }
    else for (const s of [-1, 1]) a.box(cx + s * W * 0.38 - W * 0.1, yc - D * 0.45, Z0, cx + s * W * 0.38 + W * 0.1, yc + D * 0.45, z0 + 2);
    const fy0 = yc - fd / 2, fy1 = yc + fd / 2; for (const s of [-1, 1]) a.box(cx + s * (W / 2 - fw / 2) - fw / 2, fy0, z0, cx + s * (W / 2 - fw / 2) + fw / 2, fy1, z1);
    a.box(cx - W / 2, fy0, z0, cx + W / 2, fy1, z0 + fw); a.box(cx - W / 2, fy0, z1 - fw, cx + W / 2, fy1, z1);
    const iz0 = z0 + fw, iz1 = z1 - fw, gap = (iz1 - iz0) / (v.rows + 1), bw = (W - 2 * fw) / 11, br = m.min(gap * 0.46, D * 0.4);
    for (let r = 0; r < v.rows; r++) { const z = iz0 + gap * (r + 1); a.xcyl(cx - W / 2 + fw, cx + W / 2 - fw, yc, z, br * 0.12, 6); for (let b = 0; b < 10; b++) { const left = b < 5, x0 = left ? cx - W / 2 + fw + b * bw : cx + W / 2 - fw - (10 - b) * bw; a.xcyl(x0 + bw * 0.04, x0 + bw * 0.96, yc, z, br, 10); } }
    a.rect(cx - W / 2, fy0, cx + W / 2, fy1); a.line(cx - W / 2 + fw, yc, cx + W / 2 - fw, yc, 'EQUIP-DETAIL');
    a.log('Added the foot blocks or stand, frame rails, the rods and the beads (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic cup and ball skill toy',
  desc: (v) => `Skill toy turned from a handle with a flared big cup at one end, a small cup at the other, a wooden ball on a string tied below the cups and a lathe-turned ring grip, standing upright on its base.`,
  vs: [
    ['hand size, 6 in', 3, 3, 6, 0, {}],
    ['standard, 10 in', 4, 4, 10, 0, {}],
    ['giant, 24 in', 10, 10, 24, 0, {}]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2;
    lathe(a, cx, yc, Z0, [[0, R * 0.55], [H * 0.04, R * 0.6], [H * 0.1, R * 0.28], [H * 0.3, R * 0.2], [H * 0.34, R * 0.3], [H * 0.38, R * 0.2], [H * 0.55, R * 0.22], [H * 0.6, R * 0.28], [H * 0.63, R * 0.5], [H * 0.7, R * 0.78], [H * 0.78, R * 0.85]], 20);
    a.cyl(cx, yc, Z0 + H * 0.76, Z0 + H * 0.78, R * 0.88, 20);
    lathe(a, cx, yc, Z0 + H * 0.4, [[0, R * 0.34], [H * 0.02, R * 0.4], [H * 0.04, R * 0.3]], 14);
    const bx = cx + R * 0.85, bz = Z0 + H * 0.12; ball(a, bx, yc, bz, R * 0.34, 12, 8); a.tube([[cx + R * 0.2, yc, Z0 + H * 0.3], [cx + R * 0.7, yc, Z0 + H * 0.22], [bx, yc, bz + R * 0.33]], [1.2, 1.2, 1.2], 5);
    ball(a, cx, yc, Z0 + H * 0.85, R * 0.5, 12, 8); a.circ(cx, yc, R * 0.6); a.circ(bx, yc, R * 0.34, 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.85, 'EQUIP-DETAIL');
    a.log('Added the turned handle and base, the cups, the ball and the string (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic draughts board game table',
  desc: (v) => `Draughts table with a framed ${v.cells}-square board of ${v.cells * v.cells / 2} raised dark squares, four turned legs with an apron and 24 round pieces (${v.kings} stacked as kings).`,
  vs: [
    ['8 by 8 travel set, 12 in', 12, 12, 7, 0, { cells: 8, kings: 2 }],
    ['8 by 8 tabletop, 20 in', 20, 20, 12, 0, { cells: 8, kings: 4 }],
    ['8 by 8 giant plaza, 96 in', 96, 96, 18, 0, { cells: 8, kings: 3 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, fr = W * 0.06, lh = H * 0.55, bt = H * 0.08, z0 = Z0 + lh, n = v.cells;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const x = cx + sx * (W / 2 - W * 0.06), y = yc + sy * (D / 2 - D * 0.06); a.tube([[x, y, Z0], [x, y, Z0 + lh * 0.3], [x, y, Z0 + lh]], [W * 0.035, W * 0.03, W * 0.04], 8); }
    a.box(cx - W / 2, YF, z0 - H * 0.05, cx + W / 2, YB, z0); a.box(cx - W / 2, YF, z0, cx + W / 2, YB, z0 + bt);
    for (const s of [-1, 1]) { a.box(cx - W / 2, yc + s * (D / 2 - fr / 2) - fr / 2, z0 + bt, cx + W / 2, yc + s * (D / 2 - fr / 2) + fr / 2, z0 + bt * 1.8); a.box(cx + s * (W / 2 - fr / 2) - fr / 2, YF, z0 + bt, cx + s * (W / 2 - fr / 2) + fr / 2, YB, z0 + bt * 1.8); }
    const sw = (W - 2 * fr) / n, sd = (D - 2 * fr) / n, sx0 = cx - W / 2 + fr, sy0 = YF + fr, pr = m.min(sw, sd) * 0.4, ph = bt * 0.8;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if ((i + j) % 2) { a.box(sx0 + i * sw, sy0 + j * sd, z0 + bt, sx0 + (i + 1) * sw, sy0 + (j + 1) * sd, z0 + bt + 1); a.rect(sx0 + i * sw, sy0 + j * sd, sx0 + (i + 1) * sw, sy0 + (j + 1) * sd, 'EQUIP-DETAIL'); if (j < 3 || j > 4) { const x = sx0 + (i + 0.5) * sw, y = sy0 + (j + 0.5) * sd; a.cyl(x, y, z0 + bt + 1, z0 + bt + 1 + ph, pr, 14); a.cyl(x, y, z0 + bt + 1 + ph, z0 + bt + 1 + ph + 1, pr * 0.7, 14); if (j < 3 && v.kings > ((i * 3 + j) % 7) && i % 3 === 0) a.cyl(x, y, z0 + bt + 2 + ph, z0 + bt + 2 + ph * 2, pr, 14); } }
    a.rect(cx - W / 2, YF, cx + W / 2, YB); a.rect(cx - W / 2 + fr, YF + fr, cx + W / 2 - fr, YB - fr, 'EQUIP-DETAIL');
    a.log('Added the legs and apron, the framed board with raised squares and the pieces (plan and 3D).');
  } }),

// ============================================================================================ fun/fantasy
fam({ cat: 'fun/fantasy', title: 'Generic wizard tower',
  desc: (v) => `Round stone tower with a stepped base, ${v.floors} floors of arched windows, a balcony ring${v.stair ? ', an outside spiral stair' : ''}, an oak door and a tall pointed hat roof with ${v.stars} star studs and a top finial.`,
  vs: [
    ['small, 72 in', 30, 30, 72, 0, { floors: 2, stair: false, stars: 3 }],
    ['medium, 96 in', 40, 40, 96, 0, { floors: 3, stair: false, stars: 4 }],
    ['spiral stair, 120 in', 50, 50, 120, 0, { floors: 4, stair: true, stars: 5 }],
    ['tall, 156 in', 60, 60, 156, 0, { floors: 5, stair: true, stars: 6 }],
    ['giant, 216 in', 84, 84, 216, 0, { floors: 6, stair: true, stars: 8 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2, rr = R * 0.62, bh = H * 0.05, th = H * 0.62, rz = Z0 + bh + th;
    a.cyl(cx, yc, Z0, Z0 + bh, R * 0.98, 24); a.cyl(cx, yc, Z0 + bh, Z0 + bh * 1.6, R * 0.8, 24); a.circ(cx, yc, R * 0.98); 
    a.tube([[cx, yc, Z0 + bh], [cx, yc, rz]], [rr, rr * 0.8], 24); a.circ(cx, yc, rr, 'EQUIP-DETAIL');
    for (let i = 1; i < v.floors; i++) a.cyl(cx, yc, Z0 + bh + th * i / v.floors - 1, Z0 + bh + th * i / v.floors + 2, rr * (1 - 0.2 * i / v.floors) * 1.03, 24);
    for (let f = 0; f < v.floors; f++) { const z = Z0 + bh + th * (f + 0.5) / v.floors, rf = rr * (1 - 0.2 * (f + 0.5) / v.floors), n = f === 0 ? 0 : 3; for (let i = 0; i < n; i++) { const t = -m.PI / 2 + (i - 1) * 0.9 + (f % 2) * 0.45, x = cx + rf * m.cos(t), y = yc + rf * m.sin(t); a.box(x - rf * 0.06, y - 3, z - th / v.floors * 0.15, x + rf * 0.06, y + 3, z + th / v.floors * 0.1); a.cone(x, y, z + th / v.floors * 0.1, z + th / v.floors * 0.1 + rf * 0.04, rf * 0.06, 0.5, 8); } }
    a.box(cx - rr * 0.2, yc - rr * 1.02, Z0 + bh, cx + rr * 0.2, yc - rr * 0.9, Z0 + bh + th * 0.22); a.cone(cx, yc - rr * 0.95, Z0 + bh + th * 0.22, Z0 + bh + th * 0.22 + rr * 0.1, rr * 0.2, 0.5, 8);
    const bz = Z0 + bh + th * 0.55; a.cyl(cx, yc, bz, bz + 4, rr * 1.35, 24); for (let i = 0; i < 16; i++) { const t = (i * TAU) / 16; a.cyl(cx + rr * 1.3 * m.cos(t), yc + rr * 1.3 * m.sin(t), bz + 4, bz + 4 + H * 0.05, 1.2, 4); } a.tube([[cx + rr * 1.3, yc, bz + 4 + H * 0.05]].concat(Array.from({ length: 16 }, (_, i) => [cx + rr * 1.3 * m.cos(((i + 1) * TAU) / 16), yc + rr * 1.3 * m.sin(((i + 1) * TAU) / 16), bz + 4 + H * 0.05])), Array(17).fill(1.4), 4); a.circ(cx, yc, rr * 1.35, 'EQUIP-DETAIL');
    if (v.stair) { const pts = [], rds = []; for (let i = 0; i <= 28; i++) { const t = -m.PI / 2 + (i / 28) * TAU * 0.9; pts.push([cx + rr * 1.12 * m.cos(t), yc + rr * 1.12 * m.sin(t), Z0 + bh * 1.6 + (bz - Z0 - bh * 1.6) * i / 28]); rds.push(rr * 0.07); } a.tube(pts, rds, 6); a.tube(pts.map(([x, y, z]) => [x, y, z + rr * 0.3]), rds.map(() => 1), 4); }
    a.cone(cx, yc, rz, rz + H * 0.06, rr * 1.15, rr * 0.9, 24); a.cone(cx, yc, rz + H * 0.06, Z0 + H * 0.97, rr * 0.9, 1.5, 24);
    for (let i = 0; i < v.stars; i++) { const f = 0.15 + 0.7 * i / v.stars, z = rz + H * 0.06 + (Z0 + H * 0.97 - rz - H * 0.06) * f, r = rr * 0.9 * (1 - f) - 1, t = -m.PI / 2 + i * 1.5; if (r > 3) prismSY(a, starPts(cx + r * m.cos(t) * 1.0, z, rr * 0.07, rr * 0.03, 5, 0), yc + r * m.sin(t) - 2, yc + r * m.sin(t) + 2); }
    ball(a, cx, yc, Z0 + H - rr * 0.04, rr * 0.09, 8, 5); a.circ(cx, yc, rr * 1.15, 'EQUIP-DETAIL');
    a.log('Added the stepped base, round tower with windows and door, balcony ring, spiral stair, pointed roof with stars and finial (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic crystal ball on claw stand',
  desc: (v) => `Crystal ball set in a turned pedestal with ${v.claws} curved claw feet and a ring of studs${v.cloth ? ', on a draped cloth with a square edge' : ''}; the sphere carries a swirl of small flecks inside.`,
  vs: [
    ['table, 8 in', 5, 5, 8, 0, { claws: 3 }],
    ['fortune table, 14 in', 8, 8, 14, 0, { claws: 3, cloth: true }],
    ['large, 20 in', 11, 11, 20, 0, { claws: 4 }],
    ['giant display, 48 in', 26, 26, 48, 0, { claws: 4, cloth: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2, cl = v.cloth ? H * 0.015 : 0;
    if (v.cloth) { a.box(cx - R * 0.98, yc - R * 0.98, Z0, cx + R * 0.98, yc + R * 0.98, Z0 + cl); a.rect(cx - R * 0.98, yc - R * 0.98, cx + R * 0.98, yc + R * 0.98); }
    lathe(a, cx, yc, Z0 + cl, [[0, R * 0.6], [H * 0.03, R * 0.6], [H * 0.06, R * 0.42], [H * 0.14, R * 0.34], [H * 0.18, R * 0.46], [H * 0.2, R * 0.5]], 20);
    for (let i = 0; i < v.claws; i++) { const t = (i * TAU) / v.claws + 0.4, c = m.cos(t), s = m.sin(t); a.tube([[cx + R * 0.55 * c, yc + R * 0.55 * s, Z0 + cl + H * 0.02], [cx + R * 0.62 * c, yc + R * 0.62 * s, Z0 + cl + H * 0.14], [cx + R * 0.6 * c, yc + R * 0.6 * s, Z0 + cl + H * 0.24], [cx + R * 0.4 * c, yc + R * 0.4 * s, Z0 + cl + H * 0.34]], [R * 0.08, R * 0.07, R * 0.06, R * 0.03], 6); }
    const gr = (H - H * 0.22 - cl) / 2 * 0.98, gz = Z0 + cl + H * 0.2 + gr; ball(a, cx, yc, gz, m.min(gr, R * 0.62), 20, 12);
    for (let i = 0; i < 12; i++) { const t = i * 0.9, rr = gr * 0.35 * (i / 12 + 0.3); ball(a, cx + rr * m.cos(t), yc + rr * m.sin(t), gz + (i - 6) * gr * 0.08, m.max(0.8, gr * 0.04), 4, 3); }
    a.circ(cx, yc, m.min(gr, R * 0.62)); a.circ(cx, yc, R * 0.6, 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.4, 'EQUIP-DETAIL');
    a.log('Added the pedestal, claw feet, the sphere with flecks and the cloth (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic witch cauldron',
  desc: (v) => `Round-bellied cauldron with a rolled rim, three stubby legs, an arched wire handle, bubbling green liquid with ${v.bubbles} bubbles${v.fire ? ' and a crossed log fire with a ring of stones beneath' : ''}.`,
  vs: [
    ['small, 12 in', 12, 12, 11, 0, { bubbles: 4 }],
    ['kettle, 24 in', 24, 24, 22, 0, { bubbles: 6 }],
    ['on fire, 36 in', 40, 40, 40, 0, { bubbles: 7, fire: true }],
    ['giant on fire, 60 in', 66, 66, 64, 0, { bubbles: 9, fire: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2, fz = v.fire ? H * 0.2 : 0, pr = v.fire ? R * 0.62 : R * 0.95;
    if (v.fire) { ringOf(a, cx, yc, R * 0.9, 10, Z0, H * 0.1, R * 0.09, 0.2); for (let i = 0; i < 4; i++) { const t = i * 0.8 + 0.2; a.tube([[cx - R * 0.6 * m.cos(t), yc - R * 0.6 * m.sin(t), Z0 + H * 0.04], [cx + R * 0.6 * m.cos(t), yc + R * 0.6 * m.sin(t), Z0 + H * 0.06]], [R * 0.07, R * 0.07], 6); } for (let i = 0; i < 3; i++) { const t = i * 2.1; a.cone(cx + R * 0.3 * m.cos(t), yc + R * 0.3 * m.sin(t), Z0 + H * 0.06, Z0 + H * 0.2, R * 0.12, 0.5, 6); } a.circ(cx, yc, R * 0.9, 'EQUIP-DETAIL'); }
    for (let i = 0; i < 3; i++) { const t = (i * TAU) / 3 + 1.0; a.tube([[cx + pr * 0.6 * m.cos(t), yc + pr * 0.6 * m.sin(t), Z0 + fz + H * 0.2], [cx + pr * 0.7 * m.cos(t), yc + pr * 0.7 * m.sin(t), Z0 + fz]], [pr * 0.1, pr * 0.07], 6); }
    const bz = Z0 + fz, bh = H - fz;
    lathe(a, cx, yc, bz + bh * 0.1, [[0, pr * 0.55], [bh * 0.18, pr * 0.85], [bh * 0.42, pr], [bh * 0.62, pr * 0.9], [bh * 0.7, pr * 0.78], [bh * 0.72, pr * 0.84], [bh * 0.74, pr * 0.8]], 22);
    a.cyl(cx, yc, bz + bh * 0.8, bz + bh * 0.84, pr * 0.8, 22); a.circ(cx, yc, pr, 'EQUIP'); a.circ(cx, yc, pr * 0.8, 'EQUIP-DETAIL');
    const hp = []; for (let i = 0; i <= 10; i++) { const t = m.PI * i / 10; hp.push([cx + pr * 0.82 * m.cos(t), yc, bz + bh * 0.8 + bh * 0.18 * m.sin(t)]); } a.tube(hp, hp.map(() => pr * 0.025), 6);
    for (let i = 0; i < v.bubbles; i++) { const t = i * 2.3, rr = pr * 0.55 * (((i * 0.43) % 1) + 0.1); ball(a, cx + rr * m.cos(t), yc + rr * m.sin(t), bz + bh * 0.83 + pr * 0.04 * (i % 3), pr * (0.05 + 0.03 * (i % 3)), 8, 5); }
    a.log('Added the legs, belly and rim, handle arch, bubbling liquid and the fire ring (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic spell book on lectern',
  desc: (v) => `Wooden lectern on a turned post with a stepped foot, a tilted desk with a ledge, and an open ${v.thick} in thick spell book with covers, curved page blocks, a ribbon and a metal clasp${v.candle ? ', with a candle on a dish beside it' : ''}.`,
  vs: [
    ['table, 30 in', 16, 14, 30, 0, { thick: 2 }],
    ['standing, 48 in', 22, 20, 48, 0, { thick: 3, candle: true }],
    ['giant, 72 in', 34, 30, 72, 0, { thick: 5, candle: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2, dz = Z0 + H * 0.76;
    a.cyl(cx, yc, Z0, Z0 + H * 0.04, R * 0.8, 20); a.cyl(cx, yc, Z0 + H * 0.04, Z0 + H * 0.08, R * 0.6, 20); a.circ(cx, yc, R * 0.8);
    a.tube([[cx, yc, Z0 + H * 0.08], [cx, yc, Z0 + H * 0.3], [cx, yc, dz - H * 0.06]], [R * 0.2, R * 0.14, R * 0.22], 12); a.cyl(cx, yc, Z0 + H * 0.35, Z0 + H * 0.38, R * 0.3, 12);
    const dw = W * 0.88, dy0 = YF + D * 0.08, dy1 = YB - D * 0.08, lo = dz, hi = dz + H * 0.14;
    prismX(a, [[dy0, lo], [dy1, hi], [dy1, hi - H * 0.06], [dy0, lo - H * 0.06]], cx - dw / 2, cx + dw / 2); a.box(cx - dw / 2, dy0, lo - H * 0.06, cx + dw / 2, dy0 + D * 0.04, lo + H * 0.03);
    const sl = (hi - lo) / (dy1 - dy0), bt = v.thick * IN * (H / (48 * IN)) * 0.5; 
    const bk = (x0, x1, h) => prismX(a, [[dy0 + D * 0.08, lo + D * 0.08 * sl + 3], [dy1 - D * 0.08, hi - D * 0.08 * sl + 3], [dy1 - D * 0.08, hi - D * 0.08 * sl + 3 + h], [dy0 + D * 0.08, lo + D * 0.08 * sl + 3 + h]], x0, x1);
    bk(cx - dw * 0.44, cx - 1, bt * 0.5); bk(cx + 1, cx + dw * 0.44, bt * 0.5); bk(cx - dw * 0.46, cx + dw * 0.46, 3);
    a.rect(cx - dw / 2, dy0, cx + dw / 2, dy1, 'EQUIP'); a.rect(cx - dw * 0.44, dy0 + D * 0.08, cx + dw * 0.44, dy1 - D * 0.08, 'EQUIP-DETAIL'); a.line(cx, dy0 + D * 0.08, cx, dy1 - D * 0.08, 'EQUIP-DETAIL');
    a.tube([[cx + dw * 0.05, dy0 + D * 0.12, lo + D * 0.12 * sl + 3 + bt], [cx + dw * 0.07, dy0 + D * 0.04, lo - H * 0.03]], [1.5, 1.5], 4);
    if (v.candle) { const kx = cx + dw * 0.36, ky = dy1 - D * 0.08, kz = hi - D * 0.08 * sl + 3; a.cyl(kx, ky, kz, kz + 3, R * 0.14, 12); a.cyl(kx, ky, kz + 3, kz + H * 0.1, R * 0.06, 8); a.cone(kx, ky, kz + H * 0.1, kz + H * 0.13, R * 0.025, 0.3, 6); a.circ(kx, ky, R * 0.14, 'EQUIP-DETAIL'); }
    a.log('Added the foot, turned post, tilted desk with ledge, the open book with page blocks, ribbon and candle (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic wishing well with roof',
  desc: (v) => `Round stone wishing well with a ring of ${v.stones} wall blocks, a rim, two timber posts, a ${v.roof === 'gable' ? 'gable' : 'conical'} roof, a winch axle with crank, a hanging rope and a bucket.`,
  vs: [
    ['gable roof, 60 in', 44, 44, 60, 0, { roof: 'gable', stones: 14 }],
    ['conical roof, 72 in', 52, 52, 72, 0, { roof: 'cone', stones: 16 }],
    ['gable roof, 96 in', 66, 66, 96, 0, { roof: 'gable', stones: 18 }],
    ['conical roof garden, 48 in', 36, 36, 48, 0, { roof: 'cone', stones: 12 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2, wh = H * 0.32, wr = R * 0.8;
    for (let k = 0; k < 2; k++) ringOf(a, cx, yc, wr * (k ? 0.96 : 1), v.stones, Z0 + wh * 0.5 * k, wh * 0.5, wr * 0.19, k * 0.2);
    a.cyl(cx, yc, Z0 + wh - 2, Z0 + wh + 2, wr * 1.15, 24); a.cyl(cx, yc, Z0 + wh + 2, Z0 + wh + 4, wr * 0.8, 20); a.circ(cx, yc, wr * 1.15); a.circ(cx, yc, wr * 0.8, 'EQUIP-DETAIL');
    const pz1 = Z0 + H * 0.74, pw = R * 0.07; for (const s of [-1, 1]) a.box(cx + s * wr * 1.0 - pw, yc - pw, Z0 + wh, cx + s * wr * 1.0 + pw, yc + pw, pz1);
    a.xcyl(cx - wr * 1.0, cx + wr * 1.0, yc, Z0 + H * 0.58, R * 0.08, 10); a.tube([[cx + wr * 1.0, yc, Z0 + H * 0.58], [cx + wr * 1.2, yc, Z0 + H * 0.58], [cx + wr * 1.2, yc, Z0 + H * 0.46]], [3, 3, 3], 5); a.xcyl(cx + wr * 1.15, cx + wr * 1.3, yc, Z0 + H * 0.46, R * 0.04, 6);
    a.tube([[cx, yc, Z0 + H * 0.58], [cx, yc, Z0 + H * 0.4]], [1.5, 1.5], 4); a.cyl(cx, yc, Z0 + H * 0.3, Z0 + H * 0.4, R * 0.14, 10); a.tube([[cx - R * 0.14, yc, Z0 + H * 0.4], [cx, yc, Z0 + H * 0.45], [cx + R * 0.14, yc, Z0 + H * 0.4]], [1, 1, 1], 4);
    if (v.roof === 'gable') { prismX(a, [[yc - wr * 1.25, pz1], [yc + wr * 1.25, pz1], [yc, Z0 + H]], cx - wr * 1.2, cx + wr * 1.2); a.rect(cx - wr * 1.2, yc - wr * 1.25, cx + wr * 1.2, yc + wr * 1.25, 'EQUIP-DETAIL'); a.line(cx - wr * 1.2, yc, cx + wr * 1.2, yc, 'EQUIP-DETAIL'); }
    else { a.cone(cx, yc, pz1, Z0 + H, wr * 1.3, 1.5, 22); a.circ(cx, yc, wr * 1.3, 'EQUIP-DETAIL'); }
    a.log('Added the stone ring, rim, timber posts, roof, winch with crank, rope and bucket (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic fairy toadstool dwelling',
  desc: (v) => `Fairy dwelling built in a giant toadstool: a round stem with an arched door, ${v.windows} round windows and steps, a wide spotted cap with a ${v.chimney ? 'brick chimney' : 'small flag'}${v.ring ? ' and a ring of tiny toadstools round the base' : ''}.`,
  vs: [
    ['garden, 24 in', 20, 20, 24, 0, { windows: 1, ring: false }],
    ['cottage, 36 in', 30, 30, 36, 0, { windows: 2, chimney: true }],
    ['with toadstool ring, 60 in', 56, 56, 60, 0, { windows: 3, chimney: true, ring: true }],
    ['play size, 96 in', 80, 80, 96, 0, { windows: 3, chimney: true, ring: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2, cr = v.ring ? R * 0.62 : R * 0.95, sh = H * 0.52, sr = cr * 0.4;
    a.tube([[cx, yc, Z0], [cx, yc, Z0 + sh * 0.3], [cx, yc, Z0 + sh]], [sr * 1.1, sr, sr * 0.92], 18); a.circ(cx, yc, sr * 1.1);
    a.ell(cx, yc, Z0 + sh + H * 0.06, cr, cr, H * 0.26, 24, 12); a.cyl(cx, yc, Z0 + sh - 2, Z0 + sh + 3, cr * 0.97, 24); a.circ(cx, yc, cr, 'EQUIP-DETAIL');
    for (let i = 0; i < 9; i++) { const t = i * 0.7, r = cr * (0.25 + 0.5 * ((i * 0.37) % 1)), zz = Z0 + sh + H * 0.06 + H * 0.26 * m.sqrt(m.max(0.05, 1 - (r / cr) ** 2)); a.cyl(cx + r * m.cos(t), yc + r * m.sin(t), zz - 1, zz + 1.5, cr * 0.08, 8); }
    a.box(cx - sr * 0.33, yc - sr * 1.1, Z0, cx + sr * 0.33, yc - sr * 0.85, Z0 + sh * 0.5); a.cone(cx, yc - sr * 0.97, Z0 + sh * 0.5, Z0 + sh * 0.5 + sr * 0.12, sr * 0.33, 0.5, 8); for (let i = 0; i < 2; i++) a.box(cx - sr * 0.45, yc - sr * 1.4 + i * sr * 0.18, Z0, cx + sr * 0.45, yc - sr * 1.15 + i * sr * 0.18, Z0 + H * 0.02 * (2 - i));
    for (let i = 0; i < v.windows; i++) { const t = -m.PI / 2 + (i + 1) * (m.PI * 0.5 / (v.windows + 1)) * (i % 2 ? 1 : -1) * (m.floor(i / 2) + 1), x = cx + sr * 1.02 * m.cos(t), y = yc + sr * 1.02 * m.sin(t); a.ycyl(y - 2, y + 2, x, Z0 + sh * 0.7, sr * 0.14, 10); }
    if (v.chimney) { a.box(cx + cr * 0.4, yc + cr * 0.1, Z0 + sh + H * 0.18, cx + cr * 0.62, yc + cr * 0.32, Z0 + H); a.box(cx + cr * 0.38, yc + cr * 0.08, Z0 + H - 3, cx + cr * 0.64, yc + cr * 0.34, Z0 + H); a.rect(cx + cr * 0.4, yc + cr * 0.1, cx + cr * 0.62, yc + cr * 0.32, 'EQUIP-DETAIL'); }
    else { a.cyl(cx, yc, Z0 + sh + H * 0.3, Z0 + H, 1.2, 6); prismY(a, [[cx, Z0 + H], [cx + cr * 0.25, Z0 + H - H * 0.04], [cx, Z0 + H - H * 0.08]], yc - 1, yc + 1); }
    if (v.ring) for (let i = 0; i < 10; i++) { const t = (i * TAU) / 10 + 0.15, r = R * 0.9, x = cx + r * m.cos(t), y = yc + r * m.sin(t), s = R * (0.07 + 0.03 * (i % 3)); a.cyl(x, y, Z0, Z0 + s * 2, s * 0.35, 8); a.ell(x, y, Z0 + s * 2, s, s, s * 0.7, 8, 5); a.circ(x, y, s, 'EQUIP-DETAIL'); }
    a.log('Added the stem with door, steps and windows, the spotted cap, chimney or flag, and the toadstool ring (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic drawbridge gatehouse',
  desc: (v) => `Castle gatehouse with two round towers topped by ${v.merlons} battlement blocks and conical roofs, a wall with a gate opening and a lowered portcullis grid, a drawbridge deck on two chains${v.moat ? ' crossing a moat trench' : ''}.`,
  vs: [
    ['toy, 48 in', 44, 44, 48, 0, { merlons: 8 }],
    ['garden, 96 in', 90, 80, 96, 0, { merlons: 10, moat: true }],
    ['courtyard, 144 in', 130, 110, 144, 0, { merlons: 12, moat: true }],
    ['giant, 192 in', 170, 150, 192, 0, { merlons: 14, moat: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, tr = W * 0.14, ty = YB - D * 0.36 - 0, wy0 = ty - D * 0.12, wy1 = ty + D * 0.12, wh = H * 0.55, th = H * 0.72, gw = W * 0.17, bridgeD = D * 0.3;
    for (const s of [-1, 1]) { const x = cx + s * (W / 2 - tr * 1.05); a.cyl(x, ty, Z0, Z0 + th, tr, 20); a.cyl(x, ty, Z0 + th, Z0 + th + 4, tr * 1.15, 20); ringOf(a, x, ty, tr * 1.05, v.merlons, Z0 + th + 4, H * 0.05, tr * 0.12, 0.2); a.cone(x, ty, Z0 + th + 4, Z0 + H, tr * 0.8, 1.5, 20); a.circ(x, ty, tr); a.box(x - tr * 0.08, ty - tr * 1.0 - 2, Z0 + th * 0.55, x + tr * 0.08, ty - tr * 0.9, Z0 + th * 0.8); }
    for (const s of [-1, 1]) a.box(cx + s * gw - (s > 0 ? 0 : (W / 2 - tr * 1.05 - tr - gw)) , wy0, Z0, cx + s * gw + (s > 0 ? (W / 2 - tr * 1.05 - tr - gw) : 0), wy1, wh);
    a.box(cx - gw - 2, wy0, Z0 + wh * 0.72, cx + gw + 2, wy1, wh + H * 0.04); 
    for (let i = 0; i < 9; i++) a.box(cx - (W / 2 - tr * 1.05 - tr) + i * (W - 2 * tr * 2.05) / 8 - 3, wy0, wh + H * 0.04, cx - (W / 2 - tr * 1.05 - tr) + i * (W - 2 * tr * 2.05) / 8 + 3, wy1, wh + H * 0.09);
    for (let i = 0; i < 7; i++) a.tube([[cx - gw + i * gw / 3.4, wy0 - 1, Z0], [cx - gw + i * gw / 3.4, wy0 - 1, Z0 + wh * 0.72]], [1.5, 1.5], 4); for (let k = 1; k < 4; k++) a.tube([[cx - gw, wy0 - 1, Z0 + wh * 0.72 * k / 4], [cx + gw, wy0 - 1, Z0 + wh * 0.72 * k / 4]], [1.2, 1.2], 4);
    const bd0 = wy0 - bridgeD; a.box(cx - gw * 0.9, bd0, Z0, cx + gw * 0.9, wy0, Z0 + H * 0.03); a.rect(cx - gw * 0.9, bd0, cx + gw * 0.9, wy0, 'EQUIP'); for (let i = 1; i < 8; i++) a.line(cx - gw * 0.9, bd0 + bridgeD * i / 8, cx + gw * 0.9, bd0 + bridgeD * i / 8, 'EQUIP-DETAIL');
    for (const s of [-1, 1]) a.tube([[cx + s * gw * 0.9, bd0, Z0 + H * 0.03], [cx + s * gw * 0.9, wy0 - 2, Z0 + wh * 0.72]], [1.4, 1.4], 4);
    if (v.moat) { a.box(cx - W / 2, YF, Z0, cx - gw * 0.9 - 2, bd0 - 2, Z0 + 2); a.box(cx + gw * 0.9 + 2, YF, Z0, cx + W / 2, bd0 - 2, Z0 + 2); a.rect(cx - W / 2, YF, cx - gw * 0.9 - 2, bd0 - 2, 'EQUIP-DETAIL'); a.rect(cx + gw * 0.9 + 2, YF, cx + W / 2, bd0 - 2, 'EQUIP-DETAIL'); }
    a.rect(cx - W / 2 + tr * 0.1, wy0, cx + W / 2 - tr * 0.1, wy1, 'EQUIP-DETAIL'); a.log('Added the two towers with battlements and roofs, the gate wall and portcullis, the drawbridge deck with chains and the moat edges (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic floating island display',
  desc: (v) => `Floating island sculpture: a rock cone hanging point-down, a grassy top disc with ${v.trees} trees${v.house ? ', a cottage' : ''}${v.fall ? ' and a waterfall strip down one side' : ''}, mounted on a rod from a round display base.`,
  vs: [
    ['table, 36 in', 24, 24, 36, 0, { trees: 2 }],
    ['with cottage, 60 in', 40, 40, 60, 0, { trees: 3, house: true }],
    ['giant, 96 in', 64, 64, 96, 0, { trees: 5, house: true, fall: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2, bh = H * 0.05, rodTop = Z0 + H * 0.4, ir = R * 0.92, rt = Z0 + H * 0.78;
    a.cyl(cx, yc, Z0, Z0 + bh, R * 0.6, 20); a.circ(cx, yc, R * 0.6); a.tube([[cx, yc, Z0 + bh], [cx, yc, rodTop + 2]], [R * 0.08, R * 0.05], 8);
    lathe(a, cx, yc, rodTop, [[0, R * 0.08], [H * 0.05, R * 0.3], [H * 0.14, R * 0.65], [H * 0.25, R * 0.85], [H * 0.34, ir * 0.97], [rt - rodTop, ir]], 18);
    for (let i = 0; i < 6; i++) { const t = i * 1.1; a.cone(cx + ir * 0.6 * m.cos(t), yc + ir * 0.6 * m.sin(t), rodTop + H * 0.1 + (i % 3) * H * 0.04, rodTop + H * 0.02 + (i % 3) * H * 0.04, ir * 0.12, 1, 6); }
    a.cyl(cx, yc, rt - 1, rt + H * 0.04, ir, 24); a.circ(cx, yc, ir); a.circ(cx, yc, ir * 0.6, 'EQUIP-DETAIL');
    for (let i = 0; i < v.trees; i++) { const t = i * 2.2 + 0.5, r = ir * 0.55, x = cx + r * m.cos(t), y = yc + r * m.sin(t), z = rt + H * 0.04; a.cyl(x, y, z, z + H * 0.05, ir * 0.03, 6); a.cone(x, y, z + H * 0.03, z + H * 0.14, ir * 0.15, 1, 8); a.cone(x, y, z + H * 0.09, z + H * 0.19, ir * 0.11, 1, 8); }
    if (v.house) { const hx = cx - ir * 0.2, hy = yc + ir * 0.1, z = rt + H * 0.04; a.box(hx - ir * 0.14, hy - ir * 0.12, z, hx + ir * 0.14, hy + ir * 0.12, z + H * 0.07); prismX(a, [[hy - ir * 0.15, z + H * 0.07], [hy + ir * 0.15, z + H * 0.07], [hy, z + H * 0.12]], hx - ir * 0.16, hx + ir * 0.16); }
    if (v.fall) a.box(cx + ir - 3, yc - ir * 0.08, rodTop + H * 0.2, cx + ir + 1, yc + ir * 0.08, rt);
    a.log('Added the display base and rod, the hanging rock cone, grassy top, trees, cottage and waterfall (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic ornate magic mirror on stand',
  desc: (v) => `Oval standing mirror: a ${v.crown ? 'crown ornament, ' : ''}tubular oval frame with ${v.gems} gem studs, a glass face, two upright posts with pivot knobs and a pair of splayed feet.`,
  vs: [
    ['cheval, 48 in', 28, 14, 48, 0, { gems: 6 }],
    ['crowned, 72 in', 40, 20, 72, 0, { gems: 8, crown: true }],
    ['giant, 96 in', 54, 26, 96, 0, { gems: 10, crown: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, fh = H * 0.05, ez = Z0 + H * (v.crown ? 0.55 : 0.58), erx = W * 0.4, erz = H * (v.crown ? 0.34 : 0.36), tr = W * 0.035;
    for (const s of [-1, 1]) { a.box(cx + s * W * 0.44 - W * 0.04, YF + D * 0.03, Z0, cx + s * W * 0.44 + W * 0.04, YB - D * 0.03, Z0 + fh); a.box(cx + s * erx - W * 0.025, yc - W * 0.025, Z0 + fh, cx + s * erx + W * 0.025, yc + W * 0.025, ez); a.xcyl(cx + s * erx - W * 0.03, cx + s * erx + W * 0.06, yc, ez, W * 0.035, 8); }
    a.rect(cx - W * 0.48, YF + D * 0.03, cx + W * 0.48, YB - D * 0.03, 'EQUIP-DETAIL'); a.line(cx - erx, yc, cx + erx, yc, 'EQUIP');
    const pts = [], rd = []; for (let i = 0; i <= 28; i++) { const t = (i * TAU) / 28; pts.push([cx + erx * 0.92 * m.cos(t), yc, ez + erz * m.sin(t)]); rd.push(tr); } a.tube(pts, rd, 8);
    a.ell(cx, yc, ez, erx * 0.88, 1.2, erz * 0.94, 24, 12);
    for (let i = 0; i < v.gems; i++) { const t = (i * TAU) / v.gems + 0.2; ball(a, cx + erx * 0.92 * m.cos(t), yc - tr * 0.9, ez + erz * m.sin(t), tr * 0.6, 6, 4); }
    if (v.crown) { const tz = ez + erz + tr; for (let i = -2; i <= 2; i++) { const x = cx + i * W * 0.1, h = (3 - m.abs(i)) * H * 0.02 + H * 0.03; a.cone(x, yc, tz - 1, tz + h, W * 0.04, 0.8, 6); ball(a, x, yc, tz + h, W * 0.018, 5, 3); } a.cyl(cx, yc, tz - 3, tz, W * 0.22, 14); }
    a.log('Added the feet, posts with pivots, the oval tube frame with gem studs, the glass face and the crown (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic dragon egg nest',
  desc: (v) => `Nest of woven twig rings on a flat stone ring holding ${v.eggs} large egg${v.eggs > 1 ? 's' : ''} with ridged scale bands and a curved shell crack${v.crack ? ' showing an open split' : ''}.`,
  vs: [
    ['single egg, 18 in', 18, 18, 18, 0, { eggs: 1 }],
    ['pair, 24 in', 24, 24, 20, 0, { eggs: 2 }],
    ['clutch of three, 36 in', 36, 36, 24, 0, { eggs: 3, crack: true }],
    ['giant single, 60 in', 60, 60, 56, 0, { eggs: 1, crack: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2, nh = H * (v.eggs === 1 ? 0.28 : 0.3);
    a.cyl(cx, yc, Z0, Z0 + H * 0.03, R * 0.98, 26); a.circ(cx, yc, R * 0.98);
    for (let k = 0; k < 4; k++) { const r = R * (0.88 - k * 0.05), z = Z0 + H * 0.03 + nh * k * 0.28; for (let i = 0; i < 28; i++) { const t = (i * TAU) / 28 + k, t2 = t + 0.5; a.tube([[cx + r * m.cos(t), yc + r * m.sin(t), z], [cx + r * 0.95 * m.cos(t2), yc + r * 0.95 * m.sin(t2), z + nh * 0.12]], [R * 0.028, R * 0.025], 5); } }
    a.circ(cx, yc, R * 0.85, 'EQUIP-DETAIL');
    const er = v.eggs === 1 ? R * 0.42 : v.eggs === 2 ? R * 0.34 : R * 0.3, ez0 = Z0 + H * 0.03 + nh * 0.2, pos = v.eggs === 1 ? [[0, 0]] : v.eggs === 2 ? [[-0.4, 0], [0.4, 0.05]] : [[-0.42, 0.25], [0.42, 0.25], [0, -0.42]];
    pos.forEach(([px, py], ei) => { const x = cx + px * R, y = yc + py * R, eh = m.min(er * 1.35, (Z0 + H - ez0) / 2 * 0.98); a.ell(x, y, ez0 + eh, er, er, eh, 18, 12); a.circ(x, y, er, 'EQUIP-DETAIL');
      for (let b = 0; b < 3; b++) { const f = -0.45 + b * 0.45, rr = er * m.sqrt(1 - f * f) * 1.02; for (let i = 0; i < 10; i++) { const t = (i * TAU) / 10 + b * 0.3; ball(a, x + rr * m.cos(t), y + rr * m.sin(t), ez0 + eh + f * eh, er * 0.07, 5, 3); } }
      if (v.crack && ei === 0) a.tube([[x - er * 0.2, y - er * 0.95, ez0 + eh * 1.3], [x + er * 0.1, y - er * 1.0, ez0 + eh * 1.1], [x - er * 0.1, y - er * 1.0, ez0 + eh * 0.9], [x + er * 0.15, y - er * 0.98, ez0 + eh * 0.7]], [1.4, 1.4, 1.4, 1.4], 4); });
    a.log('Added the stone ring, the twig nest, and the eggs with scale bands and crack (plan and 3D).');
  } }),

];

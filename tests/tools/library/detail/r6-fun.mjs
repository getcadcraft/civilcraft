/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, fun. Original geometry; generic shapes, no franchise, character, brand or game. */
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
fam({ cat: 'fun/characters', title: 'Generic box robot figure',
  desc: (v) => `Blocky robot figure with ${v.head === 'dome' ? 'a domed' : v.head === 'round' ? 'a round' : 'a box'} head, two eye lenses, ear bolts and an antenna ball, a torso with a chest panel, three buttons and a belt band, ${v.tracks ? 'a pair of tank-style tracks with wheels' : v.legs === false ? 'a squat body on two foot pads' : 'two legs with foot pads'} and ${v.arms ? 'two jointed arms with claw hands' : 'no arms'}.`,
  vs: [
    ['tin-can style, 24 in', 14, 10, 24, 0, { head: 'box', arms: true, hh: 0.24 }],
    ['tall, 48 in', 22, 16, 48, 0, { head: 'box', arms: true, hh: 0.22 }],
    ['dome head helper, 36 in', 18, 14, 36, 0, { head: 'dome', arms: true, hh: 0.26 }],
    ['tracked, 30 in', 18, 18, 30, 0, { head: 'box', arms: true, tracks: true, hh: 0.24 }],
    ['round head desk size, 12 in', 7, 6, 12, 0, { head: 'round', arms: true, hh: 0.28 }],
    ['squat cube, 16 in', 12, 10, 16, 0, { head: 'box', arms: false, legs: false, squat: true, hh: 0.3 }],
    ['giant lawn size, 96 in', 44, 34, 96, 0, { head: 'box', arms: true, hh: 0.22 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, tw = W * 0.6, td = D * 0.6;
    const fh = v.tracks ? H * 0.15 : H * 0.06, lh = v.tracks || v.legs === false ? 0 : H * 0.16, z1 = Z0 + fh + lh, th = H * (v.squat ? 0.3 : 0.34);
    if (v.tracks) for (const s of [-1, 1]) { const x = cx + s * W * 0.38; a.box(x - W * 0.1, YF + D * 0.08, Z0 + fh * 0.2, x + W * 0.1, YB - D * 0.08, Z0 + fh); for (const y of [YF + D * 0.1, YB - D * 0.1]) a.xcyl(x - W * 0.1, x + W * 0.1, y, Z0 + fh * 0.5, fh * 0.5, 12); a.rect(x - W * 0.1, YF + D * 0.04, x + W * 0.1, YB - D * 0.04); a.box(x - W * 0.1, YF + D * 0.2, Z0 + fh, x + W * 0.1, YB - D * 0.2, Z0 + fh + 4); }
    else for (const s of [-1, 1]) { const x = cx + s * tw * 0.28; a.box(x - W * 0.13, yc - D * 0.38, Z0, x + W * 0.13, yc + D * 0.28, Z0 + fh); if (lh) a.cyl(x, yc, Z0 + fh, z1, W * 0.045, 10); a.rect(x - W * 0.13, yc - D * 0.38, x + W * 0.13, yc + D * 0.28); }
    a.box(cx - tw / 2, yc - td / 2, z1, cx + tw / 2, yc + td / 2, z1 + th); a.rect(cx - tw / 2, yc - td / 2, cx + tw / 2, yc + td / 2, 'EQUIP-DETAIL');
    a.box(cx - tw / 2 - 4, yc - td / 2 - 4, z1 + th * 0.08, cx + tw / 2 + 4, yc + td / 2 + 4, z1 + th * 0.18);
    a.box(cx - tw * 0.3, yc - td / 2 - 8, z1 + th * 0.4, cx + tw * 0.3, yc - td / 2, z1 + th * 0.85);
    for (let i = -1; i <= 1; i++) a.ycyl(yc - td / 2 - 18, yc - td / 2 - 8, cx + i * tw * 0.18, z1 + th * 0.7, tw * 0.06, 10);
    for (let i = 0; i < 3; i++) a.box(cx - tw * 0.24, yc - td / 2 - 12, z1 + th * 0.44 + i * th * 0.05, cx + tw * 0.24, yc - td / 2 - 8, z1 + th * 0.465 + i * th * 0.05);
    const nz = z1 + th, hz0 = nz + H * 0.03, hh = H * v.hh, hw = W * 0.56, hd = D * 0.58;
    a.cyl(cx, yc, nz, hz0 + 4, W * 0.07, 10);
    if (v.head === 'dome') { a.box(cx - hw / 2, yc - hd / 2, hz0, cx + hw / 2, yc + hd / 2, hz0 + hh * 0.3); a.ell(cx, yc, hz0 + hh * 0.3, hw / 2, hd / 2, hh * 0.7, 18, 8); }
    else if (v.head === 'round') a.ell(cx, yc, hz0 + hh / 2, hw / 2, hd / 2, hh / 2, 18, 10);
    else a.box(cx - hw / 2, yc - hd / 2, hz0, cx + hw / 2, yc + hd / 2, hz0 + hh);
    a.rect(cx - hw / 2, yc - hd / 2, cx + hw / 2, yc + hd / 2, 'EQUIP-DETAIL');
    const ez = hz0 + hh * 0.58, ey = yc - hd / 2 * (v.head === 'box' ? 1 : 0.92);
    for (const s of [-1, 1]) { a.ycyl(ey - 14, ey + 2, cx + s * hw * 0.22, ez, hw * 0.11, 12); a.xcyl(cx + s * hw / 2, cx + s * (hw / 2 + 10), yc, hz0 + hh * 0.5, hh * 0.1, 8); }
    for (let i = 0; i < 3; i++) a.box(cx - hw * 0.2, ey - 6, hz0 + hh * (0.12 + i * 0.07), cx + hw * 0.2, ey + 2, hz0 + hh * (0.15 + i * 0.07));
    a.cyl(cx + hw * 0.2, yc, hz0 + hh * (v.head === 'box' ? 1 : 0.9), hz0 + hh + H * 0.07, m.max(3, W * 0.012), 8); ball(a, cx + hw * 0.2, yc, hz0 + hh + H * 0.075, W * 0.035);
    a.circ(cx + hw * 0.2, yc, W * 0.035, 'EQUIP-DETAIL');
    if (v.arms) for (const s of [-1, 1]) {
      const sx = cx + s * tw / 2, ax = cx + s * W * 0.44, sz = z1 + th * 0.85;
      a.tube([[sx, yc, sz], [ax, yc, sz - th * 0.1], [ax, yc, z1 + th * 0.3]], [W * 0.04, W * 0.04, W * 0.035], 8); ball(a, ax, yc, sz - th * 0.1, W * 0.05, 8, 5);
      for (const t of [-1, 1]) a.box(ax - W * 0.015 + t * W * 0.03 - W * 0.012, yc - W * 0.02, z1 + th * 0.12, ax + t * W * 0.03 + W * 0.012, yc + W * 0.02, z1 + th * 0.32);
      a.circ(ax, yc, W * 0.045, 'EQUIP-DETAIL');
    }
    a.outline('EQUIP-HIDDEN'); a.log('Added the head, eyes, antenna, chest panel, belt, legs or tracks and arms (plan and 3D).');
  } }),

fam({ cat: 'fun/characters', title: 'Generic snowman',
  desc: (v) => `Snowman of ${v.balls} stacked snow balls with a ${v.hat === 'top' ? 'top hat' : v.hat === 'beanie' ? 'knit beanie' : 'bucket hat'}, coal eyes and mouth, a carrot nose, ${v.balls === 3 ? 'three buttons, ' : ''}a scarf with a hanging end${v.broom ? ', two twig arms and a broom' : ' and two twig arms'}.`,
  vs: [
    ['two balls, 24 in', 15, 15, 24, 0, { balls: 2, hat: 'bucket', broom: false }],
    ['three balls, 36 in', 20, 20, 36, 0, { balls: 3, hat: 'top', broom: false }],
    ['three balls with broom, 48 in', 28, 22, 48, 0, { balls: 3, hat: 'top', broom: true }],
    ['three balls, beanie, 60 in', 34, 34, 60, 0, { balls: 3, hat: 'beanie', broom: false }],
    ['giant three balls, 96 in', 50, 50, 96, 0, { balls: 3, hat: 'top', broom: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W } = a, yc = (YF + YB) / 2, hatH = H * (v.hat === 'top' ? 0.17 : 0.1), hs = H - hatH, k = v.balls === 3 ? [1, 0.72, 0.5] : [1, 0.68], sum = k.reduce((s, x) => s + x, 0);
    const cc = [k[0]]; for (let i = 1; i < k.length; i++) cc.push(cc[i - 1] + (k[i - 1] + k[i]) * 0.86);
    const unit = cc[cc.length - 1] + k[k.length - 1], r1 = m.min(hs / unit, W / 2 / 1.2), cs = k.map((kk, i) => [Z0 + cc[i] * r1, kk * r1]);
    cs.forEach(([z, r]) => ball(a, cx, yc, z, r, 18, 10));
    a.circ(cx, yc, r1, 'EQUIP'); const [hz, hr] = cs[cs.length - 1]; a.circ(cx, yc, cs[cs.length - 1][1], 'EQUIP-DETAIL');
    const fy = yc - hr * 0.93;
    for (const s of [-1, 1]) ball(a, cx + s * hr * 0.3, fy, hz + hr * 0.2, hr * 0.09, 8, 5);
    for (let i = -2; i <= 2; i++) ball(a, cx + i * hr * 0.16, yc - hr * m.sqrt(m.max(0.05, 1 - (0.4 * 0.4) - (i * 0.16) ** 2)) * 0.98, hz - hr * 0.3 + (i * i) * hr * 0.03, hr * 0.05, 6, 4);
    ycone(a, fy + hr * 0.1, fy - hr * 0.75, cx, hz, hr * 0.12);
    const sz = hz - hr * 0.85; a.tube([[cx - hr * 0.95, yc, sz + hr * 0.1], [cx, yc - hr * 0.95, sz], [cx + hr * 0.95, yc, sz + hr * 0.1], [cx, yc + hr * 0.95, sz + hr * 0.1], [cx - hr * 0.95, yc, sz + hr * 0.1]], [hr * 0.17, hr * 0.17, hr * 0.17, hr * 0.17, hr * 0.17], 8);
    a.box(cx + hr * 0.45, fy - 8, sz - hr * 1.2, cx + hr * 0.85, fy + 4, sz); a.circ(cx, yc, hr * 1.05, 'EQUIP-DETAIL');
    if (v.balls === 3) { const [bz, br] = cs[1]; for (let i = 0; i < 3; i++) ball(a, cx, yc - br * 0.96 * m.cos((i - 1) * 0.35) , bz + (1 - i) * br * 0.3, br * 0.07, 6, 4); }
    const [az, ar] = cs[1];
    for (const s of [-1, 1]) { const x0 = cx + s * ar * 0.95; a.tube([[x0, yc, az + ar * 0.2], [cx + s * (ar + r1 * 0.3), yc, az + ar * 0.7], [cx + s * (ar + r1 * 0.45), yc, az + ar * 1.1]], [5, 4, 3], 6); a.tube([[cx + s * (ar + r1 * 0.3), yc, az + ar * 0.7], [cx + s * (ar + r1 * 0.45), yc, az + ar * 0.55]], [3, 2], 5); }
    const hz0 = hz + hr * 0.78;
    if (v.hat === 'top') { a.cyl(cx, yc, hz0, hz0 + 8, hr * 0.85, 16); a.cyl(cx, yc, hz0, hz0 + hatH * 0.95, hr * 0.55, 16); a.cyl(cx, yc, hz0 + hatH * 0.18, hz0 + hatH * 0.35, hr * 0.58, 16); }
    else if (v.hat === 'beanie') { a.ell(cx, yc, hz0 + hatH * 0.1, hr * 0.8, hr * 0.8, hatH * 0.9, 16, 8); ball(a, cx, yc, hz0 + hatH * 0.9 , hr * 0.2, 8, 5); }
    else { a.cyl(cx, yc, hz0, hz0 + 6, hr * 0.95, 18); a.cone(cx, yc, hz0 + 6, hz0 + hatH, hr * 0.62, hr * 0.5, 16); }
    if (v.broom) { const bx = cx + W * 0.38; a.tube([[bx, yc, Z0 + 4], [bx, yc, az + ar * 1.1]], [6, 6], 6); a.box(bx - W * 0.1, yc - 12, Z0 + 4, bx + W * 0.1, yc + 12, Z0 + H * 0.12); a.rect(bx - W * 0.1, yc - 12, bx + W * 0.1, yc + 12); }
    a.log('Added the stacked snow balls, face, buttons, scarf, twig arms and hat (plan and 3D).');
  } }),

fam({ cat: 'fun/characters', title: 'Generic pumpkin character',
  desc: (v) => `${v.face ? 'Carved pumpkin with triangle eyes, a nose and a toothy mouth in relief' : 'Plain ribbed pumpkin'}, ${v.lobes} rounded lobes, a curled stem${v.vine ? ', a leaf and a vine' : ''} and a flat base.`,
  vs: [
    ['carved, 12 in', 12, 11, 13, 0, { face: true, lobes: 7 }],
    ['carved, 24 in', 24, 22, 26, 0, { face: true, lobes: 8 }],
    ['plain ribbed, 18 in', 18, 18, 17, 0, { face: false, lobes: 10, vine: true }],
    ['giant carved, 48 in', 48, 44, 50, 0, { face: true, lobes: 9, vine: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2 * (v.vine ? 0.8 : 0.95), bh = H * 0.82, zc = Z0 + bh / 2 + H * 0.02;
    a.ell(cx, yc, zc, R * 0.72, R * 0.72, bh / 2, 20, 10);
    for (let i = 0; i < v.lobes; i++) { const t = (i * TAU) / v.lobes; a.ell(cx + R * 0.4 * m.cos(t), yc + R * 0.4 * m.sin(t), zc, R * 0.5, R * 0.5, bh / 2 * 0.98, 12, 8); }
    a.circ(cx, yc, R * 0.95); a.circ(cx, yc, R * 0.6, 'EQUIP-DETAIL'); a.box(cx - R * 0.5, yc - R * 0.5, Z0, cx + R * 0.5, yc + R * 0.5, Z0 + H * 0.03);
    const tz = Z0 + bh * 0.97; a.tube([[cx, yc, tz], [cx + R * 0.05, yc, tz + H * 0.07], [cx + R * 0.14, yc, tz + H * 0.13], [cx + R * 0.22, yc, tz + H * 0.15]], [R * 0.16, R * 0.13, R * 0.11, R * 0.09], 8);
    if (v.face) {
      const fy = yc - R * 0.92, d = m.max(4, R * 0.04);
      for (const s of [-1, 1]) prismY(a, [[cx + s * R * 0.2, zc + bh * 0.1], [cx + s * R * 0.5, zc + bh * 0.1], [cx + s * R * 0.35, zc + bh * 0.3]], fy - d, fy + R * 0.3);
      prismY(a, [[cx - R * 0.08, zc - bh * 0.02], [cx + R * 0.08, zc - bh * 0.02], [cx, zc + bh * 0.07]], fy - d, fy + R * 0.3);
      for (let i = 0; i < 4; i++) { const x = cx - R * 0.5 + i * R * 0.3; a.box(x, fy - d, zc - bh * 0.28, x + R * 0.18, fy + R * 0.3, zc - bh * 0.15); }
      a.box(cx - R * 0.55, fy - d, zc - bh * 0.15, cx + R * 0.55, fy + R * 0.3, zc - bh * 0.1);
      a.line(cx - R * 0.5, yc - R * 0.93, cx + R * 0.5, yc - R * 0.93, 'EQUIP-DETAIL');
    }
    if (v.vine) { const vx = cx + R * 1.0; a.tube([[cx + R * 0.2, yc, tz + H * 0.05], [vx, yc + R * 0.2, Z0 + H * 0.2], [cx + W * 0.42, yc + R * 0.6, Z0 + H * 0.04]], [5, 4, 3], 6); prismS(a, starPts(cx - R * 1.05, yc + R * 0.1, R * 0.4, R * 0.28, 4, 0.6), Z0 + 2, Z0 + 6); a.circ(cx - R * 1.05, yc + R * 0.1, R * 0.35, 'EQUIP-DETAIL'); }
    a.log('Added the ribbed lobes, curled stem, carved face and vine (plan and 3D).');
  } }),

fam({ cat: 'fun/characters', title: 'Generic alien figure',
  desc: (v) => `Alien figure with an oversized egg-shaped head, ${v.eyes} large almond eyes, ${v.ant ? 'two antennae with ball tips, ' : ''}a slim body, thin arms and ${v.tri ? 'three jointed legs' : 'two legs with flat feet'}.`,
  vs: [
    ['big-head grey type, 36 in', 14, 10, 36, 0, { eyes: 2, ant: false, tri: false }],
    ['antenna type, 30 in', 14, 10, 30, 0, { eyes: 2, ant: true, tri: false }],
    ['three-eyed, 24 in', 12, 9, 24, 0, { eyes: 3, ant: true, tri: false }],
    ['tripod-legged, 60 in', 30, 26, 60, 0, { eyes: 2, ant: false, tri: true }],
    ['tiny desk size, 8 in', 4, 3.5, 8, 0, { eyes: 2, ant: true, tri: false }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, hr = H * 0.17, hz = Z0 + H * (v.ant ? 0.7 : 0.76), bz = Z0 + H * 0.32;
    a.ell(cx, yc, hz, m.min(W * 0.42, hr * 1.1), m.min(D * 0.42, hr * 1.1), hr * 1.25, 20, 12);
    a.ell(cx, yc, hz - hr * 1.1, hr * 0.45, hr * 0.4, hr * 0.5, 12, 7);
    a.tube([[cx, yc, hz - hr * 1.3], [cx, yc, bz + H * 0.17]], [hr * 0.25, hr * 0.3], 8);
    a.ell(cx, yc, bz + H * 0.07, W * 0.26, D * 0.28, H * 0.12, 14, 8);
    const ey = yc - m.min(D * 0.42, hr * 1.1) * 0.8;
    for (let i = 0; i < v.eyes; i++) { const s = v.eyes === 2 ? (i ? 1 : -1) : i - 1, big = v.eyes === 2 || i !== 1; a.ell(cx + s * hr * (v.eyes === 2 ? 0.5 : 0.5), ey, hz - hr * (v.eyes === 3 && i === 1 ? -0.5 : 0.1), hr * (big ? 0.38 : 0.22), hr * 0.14, hr * (big ? 0.26 : 0.2), 12, 6); }
    a.box(cx - hr * 0.1, ey - 2, hz - hr * 0.62, cx + hr * 0.1, ey + 2, hz - hr * 0.6);
    if (v.ant) for (const s of [-1, 1]) { a.tube([[cx + s * hr * 0.4, yc, hz + hr * 1.1], [cx + s * hr * 0.7, yc, hz + hr * 1.7]], [3, 2.5], 6); ball(a, cx + s * hr * 0.7, yc, hz + hr * 1.75, hr * 0.14, 8, 5); }
    for (const s of [-1, 1]) { const sx = cx + s * W * 0.24; a.tube([[sx, yc, bz + H * 0.15], [cx + s * W * 0.42, yc, bz + H * 0.02], [cx + s * W * 0.44, yc, bz - H * 0.12]], [5, 4, 3], 6); for (const t of [-1, 0, 1]) a.tube([[cx + s * W * 0.44, yc, bz - H * 0.12], [cx + s * W * 0.44 + t * W * 0.025, yc - 6, bz - H * 0.17]], [2, 1.5], 5); }
    if (v.tri) for (let i = 0; i < 3; i++) { const t = -m.PI / 2 + (i - 1) * 2.1, lx = cx + W * 0.42 * m.cos(t) * (i === 1 ? 0 : 1) + 0, ly = yc + (i === 1 ? -D * 0.4 : D * 0.3) ; const kx = cx + (lx - cx) * 0.7, ky = yc + (ly - yc) * 0.7; a.tube([[cx, yc, bz], [kx, ky, bz - H * 0.05], [lx, ly, Z0 + 6]], [8, 7, 5], 6); a.cyl(lx, ly, Z0, Z0 + 5, 18, 10); a.circ(lx, ly, 18, 'EQUIP-DETAIL'); }
    else for (const s of [-1, 1]) { const lx = cx + s * W * 0.14; a.tube([[lx, yc, bz], [lx, yc, bz - H * 0.15], [lx, yc, Z0 + 12]], [W * 0.05, W * 0.035, W * 0.03], 8); a.box(lx - W * 0.12, yc - D * 0.38, Z0, lx + W * 0.12, yc + D * 0.18, Z0 + 12); a.rect(lx - W * 0.12, yc - D * 0.38, lx + W * 0.12, yc + D * 0.18); }
    a.circ(cx, yc, m.min(W * 0.42, hr * 1.1), 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN'); a.log('Added the big head, eyes, antennae, body, arms and legs (plan and 3D).');
  } }),

fam({ cat: 'fun/characters', title: 'Generic round blob mascot',
  desc: (v) => `${v.kind === 'egg' ? 'Egg-shaped mascot with a lighter belly patch, two big eyes, a small beak, stub arms and flat feet' : v.kind === 'ears' ? 'Round mascot with two rounded ears, big eyes, a muzzle and nose, stub arms and flat feet' : v.kind === 'bird' ? 'Round bird-style mascot with a cone beak, eyes, wings, a head tuft and webbed feet' : 'Cloud-shaped mascot made of five joined puffs with a smiling face and two small feet'}.`,
  vs: [
    ['egg type, 20 in', 14, 11, 20, 0, { kind: 'egg' }],
    ['eared type, 24 in', 18, 14, 24, 0, { kind: 'ears' }],
    ['round bird type, 36 in', 26, 22, 36, 0, { kind: 'bird' }],
    ['cloud type, 30 in', 34, 14, 30, 0, { kind: 'cloud' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, fy = YF + D * 0.1;
    if (v.kind === 'cloud') {
      const bz = Z0 + H * 0.37, rz = H * 0.21, fy2 = yc - D * 0.45;
      a.ell(cx, yc, bz, W * 0.44, D * 0.45, rz, 20, 10);
      for (const [dx, dz, k] of [[-0.26, 0.55, 0.17], [0, 0.64, 0.2], [0.26, 0.55, 0.17], [-0.42, 0.4, 0.12], [0.42, 0.4, 0.12]]) a.ell(cx + dx * W, yc, Z0 + dz * H, H * k, D * 0.4, H * k, 14, 8);
      for (const s of [-1, 1]) { a.ell(cx + s * W * 0.13, fy2 + 2, bz + H * 0.04, H * 0.05, 6, H * 0.07, 8, 5); a.ell(cx + s * W * 0.13, fy2 - 2, bz + H * 0.05, H * 0.022, 4, H * 0.03, 6, 4); a.ell(cx + s * W * 0.27, fy2 + 4, bz - H * 0.04, H * 0.04, 4, H * 0.025, 8, 4); }
      a.tube([[cx - W * 0.09, fy2 + 1, bz - H * 0.07], [cx - W * 0.04, fy2 - 1, bz - H * 0.1], [cx + W * 0.04, fy2 - 1, bz - H * 0.1], [cx + W * 0.09, fy2 + 1, bz - H * 0.07]], [3, 3, 3, 3], 5);
      for (const s of [-1, 1]) { const x = cx + s * W * 0.2; a.ell(x, yc - D * 0.08, Z0 + H * 0.07, W * 0.09, D * 0.28, H * 0.075, 10, 6); a.ellp(x, yc - D * 0.08, W * 0.09, D * 0.28, 'EQUIP-DETAIL'); }
      a.ellp(cx, yc, W * 0.44, D * 0.45); a.ellp(cx, yc, W * 0.3, D * 0.3, 'EQUIP-DETAIL');
    } else {
      const bh = H * 0.82, zc = Z0 + H * 0.1 + bh / 2, rx = W * 0.38, ry = D * 0.42;
      a.ell(cx, yc, zc, rx, ry, bh / 2, 20, 12); a.ellp(cx, yc, rx, ry);
      a.ell(cx, fy + D * 0.08, zc - bh * 0.15, rx * 0.65, ry * 0.7, bh * 0.32, 14, 8);
      const ez = zc + bh * 0.25;
      for (const s of [-1, 1]) { a.ell(cx + s * rx * 0.36, fy + D * 0.03, ez, rx * 0.2, 12 + 0, bh * 0.1, 10, 6); a.ell(cx + s * rx * 0.36, fy - 3, ez - 4, rx * 0.09, 8, bh * 0.05, 8, 5); a.ell(cx + s * (rx + W * 0.06), yc, zc - bh * 0.05, W * 0.07, D * 0.12, bh * 0.14, 8, 5); a.box(cx + s * rx * 0.45 - W * 0.12, yc - D * 0.38, Z0, cx + s * rx * 0.45 + W * 0.12, yc + D * 0.1, Z0 + H * 0.1); a.rect(cx + s * rx * 0.45 - W * 0.12, yc - D * 0.38, cx + s * rx * 0.45 + W * 0.12, yc + D * 0.1); }
      if (v.kind === 'ears') { for (const s of [-1, 1]) { a.ell(cx + s * rx * 0.7, yc, zc + bh * 0.52, rx * 0.28, ry * 0.18, bh * 0.14, 10, 6); } a.ell(cx, fy - 2, zc + bh * 0.08, rx * 0.25, 14, bh * 0.08, 10, 6); a.ell(cx, fy - 9, zc + bh * 0.13, rx * 0.08, 6, bh * 0.04, 8, 5); }
      else { ycone(a, fy + 2, fy - D * 0.12, cx, zc + bh * 0.08, rx * 0.16); }
      if (v.kind === 'bird') { for (const s of [-1, 1]) { a.ell(cx + s * (rx * 0.95), yc, zc - bh * 0.05, W * 0.06, ry * 0.5, bh * 0.2, 10, 6); } for (const k of [-1, 0, 1]) a.tube([[cx + k * 8, yc, zc + bh * 0.5], [cx + k * 22, yc, zc + bh * 0.5 + H * 0.1]], [4, 2], 5); }
      if (v.kind === 'egg') a.tube([[cx, yc, zc + bh * 0.5], [cx + 10, yc, zc + bh * 0.5 + 25]], [8, 3], 6);
    }
    a.log('Added the body, face, limbs and feet (plan and 3D).');
  } }),

// ============================================================================================ fun/novelty
fam({ cat: 'fun/novelty', title: 'Generic giant chess piece',
  desc: (v) => `Giant lawn-size ${v.piece} turned from a flared round base${v.piece === 'knight' ? ' with a flat-sided horse-head profile, ears, mane and eye' : v.piece === 'rook' ? ' with a collar and a battlemented top of six merlons' : v.piece === 'bishop' ? ' with a collar, a pointed mitre head and a top ball' : v.piece === 'queen' ? ' with a collar, a flared head with a ring of eight crown beads and a top ball' : v.piece === 'king' ? ' with a collar, a flared head and a cross on top' : ', a collar and a ball head'}.`,
  vs: [
    ['pawn, 18 in', 9, 9, 18, 0, { piece: 'pawn' }],
    ['rook, 22 in', 11, 11, 22, 0, { piece: 'rook' }],
    ['knight, 26 in', 11, 11, 26, 0, { piece: 'knight' }],
    ['bishop, 28 in', 11, 11, 28, 0, { piece: 'bishop' }],
    ['queen, 32 in', 13, 13, 32, 0, { piece: 'queen' }],
    ['king, 36 in', 14, 14, 36, 0, { piece: 'king' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, R = m.min(W, D) / 2 * 0.98, P = (rows) => rows.map(([z, r]) => [z * H, r * R]);
    const base = [[0, 1], [0.035, 1], [0.05, 0.88], [0.08, 0.84], [0.1, 0.7]];
    const S = { pawn: [...base, [0.14, 0.52], [0.3, 0.3], [0.38, 0.27], [0.41, 0.52], [0.44, 0.52], [0.46, 0.3]],
      rook: [...base, [0.2, 0.55], [0.5, 0.5], [0.58, 0.68], [0.62, 0.82], [0.7, 0.82], [0.7, 0.62], [0.72, 0.62]],
      bishop: [...base, [0.18, 0.55], [0.42, 0.32], [0.47, 0.28], [0.5, 0.55], [0.53, 0.55], [0.56, 0.3], [0.62, 0.5], [0.72, 0.48], [0.82, 0.34], [0.9, 0.14], [0.92, 0.01]],
      queen: [...base, [0.17, 0.56], [0.5, 0.3], [0.55, 0.27], [0.58, 0.58], [0.61, 0.58], [0.65, 0.34], [0.72, 0.5], [0.82, 0.62], [0.86, 0.55], [0.87, 0.3]],
      king: [...base, [0.17, 0.56], [0.52, 0.3], [0.57, 0.27], [0.6, 0.58], [0.63, 0.58], [0.67, 0.34], [0.74, 0.5], [0.82, 0.6], [0.86, 0.5], [0.87, 0.2]],
      knight: [...base, [0.14, 0.72], [0.2, 0.86], [0.26, 0.86], [0.29, 0.6]] };
    lathe(a, cx, yc, Z0, P(S[v.piece]), 22);
    a.circ(cx, yc, R); a.circ(cx, yc, R * 0.7, 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.3, 'EQUIP-DETAIL');
    if (v.piece === 'pawn') ball(a, cx, yc, Z0 + H * 0.44 + R * 0.34, R * 0.42, 16, 10);
    if (v.piece === 'rook') { ringOf(a, cx, yc, R * 0.6, 6, Z0 + H * 0.72, H * 0.15, R * 0.17, 0.3); a.cyl(cx, yc, Z0 + H * 0.72, Z0 + H * 0.76, R * 0.62, 16); a.circ(cx, yc, R * 0.62, 'EQUIP-DETAIL'); }
    if (v.piece === 'bishop') { ball(a, cx, yc, Z0 + H * 0.95, R * 0.12, 10, 6); a.box(cx - R * 0.03, yc - R * 0.3, Z0 + H * 0.7, cx + R * 0.03, yc - R * 0.12, Z0 + H * 0.82); }
    if (v.piece === 'queen') { for (let i = 0; i < 8; i++) { const t = (i * TAU) / 8; ball(a, cx + R * 0.52 * m.cos(t), yc + R * 0.52 * m.sin(t), Z0 + H * 0.89, R * 0.1, 8, 5); } ball(a, cx, yc, Z0 + H * 0.93, R * 0.2, 12, 8); a.circ(cx, yc, R * 0.52, 'EQUIP-DETAIL'); }
    if (v.piece === 'king') { a.box(cx - R * 0.07, yc - R * 0.07, Z0 + H * 0.87, cx + R * 0.07, yc + R * 0.07, Z0 + H * 1.0); a.box(cx - R * 0.2, yc - R * 0.07, Z0 + H * 0.93, cx + R * 0.2, yc + R * 0.07, Z0 + H * 0.97); a.circ(cx, yc, R * 0.45, 'EQUIP-DETAIL'); }
    if (v.piece === 'knight') {
      const t = R * 0.42, X = (f) => cx + f * R, zz = (f) => Z0 + (0.28 + 0.66 * f) * H, pt = (x, f) => [X(x), zz(f)];
      prismY(a, [pt(-0.7, 0), pt(0.7, 0), pt(0.5, 0.45), pt(0.32, 0.82), pt(-0.1, 0.98), pt(-0.5, 0.72)], yc - t, yc + t);
      prismY(a, [pt(-0.1, 0.98), pt(-0.55, 0.93), pt(-1.0, 0.5), pt(-0.95, 0.36), pt(-0.62, 0.42), pt(-0.38, 0.66)], yc - t * 0.78, yc + t * 0.78);
      for (const s of [-1, 1]) prismY(a, [pt(-0.12, 0.95), pt(0.0, 1.07), pt(0.14, 0.92)], yc + s * t * 0.55 - t * 0.2, yc + s * t * 0.55 + t * 0.2);
      for (let i = 0; i < 5; i++) { const f = 0.12 + i * 0.17, x = 0.52 - f * 0.44; a.box(X(x + 0.04), yc - t * 0.2, zz(f) - 6, X(x + 0.2), yc + t * 0.2, zz(f + 0.13)); }
      for (const s of [-1, 1]) { ball(a, X(-0.42), yc + s * t * 0.8, zz(0.8), R * 0.06, 6, 4); a.ell(X(-0.97), yc + s * t * 0.4, zz(0.5), R * 0.05, R * 0.04, R * 0.05, 6, 4); }
      a.rect(cx - R * 1.0, yc - t, cx + R * 0.7, yc + t, 'EQUIP-DETAIL');
    }
    a.log('Added the turned body with its base flare and collar, and the head details of the piece (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic garden gnome',
  desc: (v) => `Garden gnome with a pointed hat, a long beard, a round nose, boots and ${v.kind === 'mush' ? 'a seat on a toadstool with a spotted cap' : v.kind === 'barrow' ? 'a wheelbarrow with a tub, one wheel, legs and two handles' : v.kind === 'lantern' ? 'one arm raised holding a lantern on a hook' : 'two arms at the sides'}.`,
  vs: [
    ['standing, 12 in', 7, 6, 12, 0, { kind: 'stand' }],
    ['standing, 24 in', 12, 10, 24, 0, { kind: 'stand' }],
    ['with lantern, 18 in', 12, 7, 18, 0, { kind: 'lantern' }],
    ['sitting on toadstool, 14 in', 9, 9, 14, 0, { kind: 'mush' }],
    ['with wheelbarrow, 18 in', 10, 24, 18, 0, { kind: 'barrow' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = v.kind === 'barrow' ? YB - D * 0.2 : (YF + YB) / 2, bw = v.kind === 'lantern' ? W * 0.26 : W * 0.38;
    let zb = Z0; const sit = v.kind === 'mush';
    if (sit) { const sh = H * 0.42; a.tube([[cx, yc, Z0], [cx, yc, Z0 + sh * 0.8], [cx, yc, Z0 + sh]], [W * 0.14, W * 0.12, W * 0.12], 12); a.ell(cx, yc, Z0 + sh, W * 0.48, D * 0.48, H * 0.1, 18, 8); for (const [x, y] of [[-0.25, -0.2], [0.2, 0.25], [0.3, -0.15], [-0.15, 0.3]]) ball(a, cx + x * W, yc + y * D, Z0 + sh + H * 0.085, W * 0.045, 6, 4); a.circ(cx, yc, W * 0.48); zb = Z0 + sh + H * 0.06; }
    const hh = H - (zb - Z0), bz0 = zb + hh * (sit ? 0.02 : 0.08);
    if (sit) { for (const s of [-1, 1]) { a.tube([[cx + s * bw * 0.4, yc - bw * 0.2, bz0 + hh * 0.1], [cx + s * bw * 0.4, yc - D * 0.38, bz0 + hh * 0.04]], [W * 0.06, W * 0.055], 8); a.ell(cx + s * bw * 0.4, yc - D * 0.4, bz0 + hh * 0.01, W * 0.08, D * 0.08, hh * 0.05, 8, 5); a.circ(cx + s * bw * 0.4, yc - D * 0.4, W * 0.07, 'EQUIP-DETAIL'); } }
    else for (const s of [-1, 1]) { a.ell(cx + s * bw * 0.42, yc - 4, Z0 + hh * 0.07, W * 0.13, D * (v.kind === 'barrow' ? 0.055 : 0.3), hh * 0.06, 10, 6); a.circ(cx + s * bw * 0.42, yc - 4, W * 0.11, 'EQUIP-DETAIL'); }
    const cz1 = bz0 + hh * 0.38;
    a.tube([[cx, yc, bz0], [cx, yc, bz0 + hh * 0.2], [cx, yc, cz1]], [bw * 0.95, bw * 0.95, bw * 0.78], 16);
    a.cyl(cx, yc, bz0 + hh * 0.34, bz0 + hh * 0.39, bw * 0.9, 16); a.box(cx - bw * 0.2, yc - bw * 0.93, bz0 + hh * 0.33, cx + bw * 0.2, yc - bw * 0.88, bz0 + hh * 0.4);
    const fz = cz1 + hh * 0.1;
    a.ell(cx, yc - 2, cz1 + hh * 0.05, bw * 0.75, bw * 0.55, hh * 0.19, 14, 8);
    a.ell(cx, yc - bw * 0.52, fz + hh * 0.06, bw * 0.12, bw * 0.12, bw * 0.12, 8, 6);
    for (const s of [-1, 1]) ball(a, cx + s * bw * 0.28, yc - bw * 0.5, fz + hh * 0.13, bw * 0.045, 6, 4);
    const hz = fz + hh * 0.06; a.tube([[cx, yc, hz], [cx, yc, hz + hh * 0.05]], [bw * 0.82, bw * 0.78], 16);
    a.tube([[cx, yc, hz + hh * 0.04], [cx + bw * 0.05, yc, hz + hh * 0.17], [cx + bw * 0.2, yc, hz + hh * 0.28], [cx + bw * 0.4, yc, Z0 + H - 2]], [bw * 0.75, bw * 0.5, bw * 0.22, 1], 14);
    a.circ(cx, yc, bw * 0.95); a.circ(cx, yc, bw * 0.75, 'EQUIP-DETAIL');
    const sz = bz0 + hh * 0.34;
    if (v.kind === 'stand' || v.kind === 'mush') for (const s of [-1, 1]) { a.tube([[cx + s * bw * 0.85, yc, sz], [cx + s * bw * 1.0, yc, sz - hh * 0.12], [cx + s * bw * 0.95, yc - bw * 0.2, sz - hh * 0.2]], [bw * 0.2, bw * 0.18, bw * 0.15], 8); ball(a, cx + s * bw * 0.95, yc - bw * 0.22, sz - hh * 0.22, bw * 0.17, 8, 5); }
    if (v.kind === 'lantern') { a.tube([[cx - bw * 0.85, yc, sz], [cx - bw * 1.0, yc, sz - hh * 0.12], [cx - bw * 0.95, yc - bw * 0.2, sz - hh * 0.2]], [bw * 0.2, bw * 0.18, bw * 0.15], 8); ball(a, cx - bw * 0.95, yc - bw * 0.22, sz - hh * 0.22, bw * 0.17, 8, 5);
      const lx = cx + bw * 1.5, lz = bz0 + hh * 0.25; a.tube([[cx + bw * 0.85, yc, sz], [cx + bw * 1.5, yc, sz + hh * 0.08]], [bw * 0.2, bw * 0.17], 8); ball(a, cx + bw * 1.5, yc, sz + hh * 0.08, bw * 0.17, 8, 5); a.tube([[lx, yc, sz + hh * 0.08], [lx, yc, lz + hh * 0.2]], [2, 2], 5); a.box(lx - bw * 0.22, yc - bw * 0.22, lz, lx + bw * 0.22, yc + bw * 0.22, lz + hh * 0.2); a.cone(lx, yc, lz + hh * 0.2, lz + hh * 0.26, bw * 0.28, 0.01, 6); a.circ(lx, yc, bw * 0.25); }
    if (v.kind === 'barrow') {
      const by = YF + D * 0.38, bz = Z0 + H * 0.2;
      for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.3, yc - bw * 0.5, sz - hh * 0.05], [cx + s * W * 0.42, by + D * 0.06, bz + H * 0.14]], [bw * 0.18, bw * 0.15], 8); a.tube([[cx + s * W * 0.42, yc + D * 0.05, bz + H * 0.12], [cx + s * W * 0.42, YF + D * 0.18, bz + H * 0.1]], [6, 6], 6); a.tube([[cx + s * W * 0.42, YB - D * 0.08, Z0 + 1], [cx + s * W * 0.42, YB - D * 0.08, bz + H * 0.12]], [5, 5], 6); }
      prismX(a, [[YF + D * 0.1, bz + H * 0.38], [YF + D * 0.5, bz + H * 0.2], [YF + D * 0.52, bz + H * 0.04], [YF + D * 0.18, bz + H * 0.04]], cx - W * 0.34, cx + W * 0.34);
      whl(a, cx, YF + D * 0.12, Z0 + H * 0.14, H * 0.14, W * 0.07); a.rect(cx - W * 0.34, YF + D * 0.1, cx + W * 0.34, YF + D * 0.52, 'EQUIP-DETAIL');
      a.tube([[cx - W * 0.42, by, bz + H * 0.08], [cx - W * 0.42, YF + D * 0.1, Z0 + H * 0.14]], [4, 4], 5);
    }
    a.outline('EQUIP-HIDDEN'); a.log('Added the boots, coat, belt, beard, nose, hat and hands, with the toadstool, lantern or wheelbarrow of this type (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic piggy bank',
  desc: (v) => `Piggy bank in side view: a round body, head with snout, eyes and two ears, four short legs, a curled tail, a coin slot on the back with a raised lip and a round stopper under the belly${v.wings ? ', plus two small wings' : ''}.`,
  vs: [
    ['classic, 6 in', 8, 5, 6, 0, {}],
    ['large, 14 in', 17, 10, 14, 0, {}],
    ['giant counter display, 24 in', 30, 17, 24, 0, {}],
    ['winged, 10 in', 12, 9, 10, 0, { wings: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, bz = Z0 + H * 0.5, dd = v.wings ? D * 0.5 : D;
    a.ell(cx + W * 0.05, yc, bz, W * 0.37, dd * 0.46, H * 0.36, 20, 12);
    a.ell(cx - W * 0.3, yc, bz + H * 0.04, H * 0.3, dd * 0.36, H * 0.3, 16, 10);
    a.xcyl(cx - W * 0.5, cx - W * 0.4, yc, bz - H * 0.02, H * 0.13, 14); a.xcyl(cx - W * 0.5 - 1, cx - W * 0.495, yc, bz - H * 0.02, H * 0.14, 14);
    for (const s of [-1, 1]) { ball(a, cx - W * 0.5 + 2, yc + s * H * 0.045, bz - H * 0.02, H * 0.018, 6, 4); a.ell(cx - W * 0.27, yc + s * dd * 0.27, bz + H * 0.33, W * 0.055, dd * 0.07, H * 0.12, 8, 5); ball(a, cx - W * 0.4, yc + s * dd * 0.2, bz + H * 0.12, H * 0.035, 8, 5); }
    for (const [x, y] of [[-0.2, -1], [-0.2, 1], [0.27, -1], [0.27, 1]]) { a.tube([[cx + x * W, yc + y * dd * 0.26, Z0 + H * 0.3], [cx + x * W, yc + y * dd * 0.26, Z0 + 2]], [W * 0.05, W * 0.042], 8); a.cyl(cx + x * W, yc + y * dd * 0.26, Z0, Z0 + 4, W * 0.045, 8); a.circ(cx + x * W, yc + y * dd * 0.26, W * 0.05, 'EQUIP-DETAIL'); }
    a.tube([[cx + W * 0.4, yc, bz + H * 0.05], [cx + W * 0.47, yc, bz + H * 0.18], [cx + W * 0.44, yc, bz + H * 0.28], [cx + W * 0.4, yc, bz + H * 0.24]], [H * 0.035, H * 0.028, H * 0.025, H * 0.02], 6);
    a.box(cx + W * 0.0, yc - dd * 0.03 - 4, bz + H * 0.35, cx + W * 0.16, yc - dd * 0.03, bz + H * 0.37); a.box(cx + W * 0.0, yc + dd * 0.03, bz + H * 0.35, cx + W * 0.16, yc + dd * 0.03 + 4, bz + H * 0.37);
    a.cyl(cx + W * 0.1, yc, Z0 + H * 0.12, Z0 + H * 0.22, H * 0.1, 12);
    if (v.wings) for (const s of [-1, 1]) { const y0 = yc + s * dd * 0.4, y1 = yc + s * (dd * 0.4 + D * 0.09); prismY(a, [[cx - W * 0.05, bz + H * 0.12], [cx - W * 0.02, bz + H * 0.4], [cx + W * 0.1, bz + H * 0.62], [cx + W * 0.3, bz + H * 0.58], [cx + W * 0.34, bz + H * 0.4], [cx + W * 0.28, bz + H * 0.2]], m.min(y0, y1), m.max(y0, y1)); a.rect(cx - W * 0.05, m.min(y0, y1), cx + W * 0.34, m.max(y0, y1), 'EQUIP-DETAIL'); }
    a.ellp(cx + W * 0.05, yc, W * 0.37, dd * 0.46); a.circ(cx - W * 0.3, yc, H * 0.3, 'EQUIP-DETAIL'); a.rect(cx, yc - dd * 0.03, cx + W * 0.16, yc + dd * 0.03, 'EQUIP-DETAIL'); a.circ(cx + W * 0.1, yc, H * 0.1, 'EQUIP-HIDDEN');
    a.log('Added the body, head, snout, ears, legs, tail, coin slot and stopper (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic novelty cup trophy',
  desc: (v) => `Cup trophy on a stepped square plinth with an engraving plate, a turned stem and knop, a flared bowl and two loop handles${v.lid ? ', a domed lid and a top finial' : ''}${v.tier ? ', and a second tier plinth' : ''}.`,
  vs: [
    ['two handles, 10 in', 5, 5, 10, 0, {}],
    ['two handles, 16 in', 7, 7, 16, 0, {}],
    ['lidded cup, 24 in', 9, 9, 24, 0, { lid: true }],
    ['on tiered plinth, 30 in', 11, 11, 30, 0, { tier: true, lid: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, ph = H * (v.tier ? 0.22 : 0.13);
    a.box(cx - W / 2, yc - D / 2, Z0, cx + W / 2, yc + D / 2, Z0 + ph * 0.55); a.box(cx - W * 0.42, yc - D * 0.42, Z0 + ph * 0.55, cx + W * 0.42, yc + D * 0.42, Z0 + ph);
    a.box(cx - W * 0.2, yc - D * 0.42 - 3, Z0 + ph * 0.62, cx + W * 0.2, yc - D * 0.42, Z0 + ph * 0.9);
    if (v.tier) { a.box(cx - W * 0.34, yc - D * 0.34, Z0 + ph, cx + W * 0.34, yc + D * 0.34, Z0 + ph + H * 0.05); }
    const z0 = Z0 + ph + (v.tier ? H * 0.05 : 0), rh = Z0 + H - z0, R = W * 0.3;
    const prof = [[0, R * 0.7], [0.03, R * 0.55], [0.08, R * 0.4], [0.2, R * 0.16], [0.3, R * 0.14], [0.34, R * 0.3], [0.38, R * 0.14], [0.42, R * 0.2], [0.46, R * 0.5], [0.56, R * 0.85], [0.68, R * 1.0], [v.lid ? 0.74 : 0.8, R * 1.0]];
    lathe(a, cx, yc, z0, prof.map(([f, r]) => [f * rh, r]), 20);
    if (v.lid) { const lz = z0 + rh * 0.74; a.tube([[cx, yc, lz], [cx, yc, lz + rh * 0.04], [cx, yc, lz + rh * 0.12], [cx, yc, lz + rh * 0.18]], [R * 1.02, R * 0.9, R * 0.45, R * 0.12], 20); ball(a, cx, yc, lz + rh * 0.2 + R * 0.1, R * 0.14, 10, 6); }
    const hz = z0 + rh * 0.56;
    for (const s of [-1, 1]) a.tube([[cx + s * R * 0.85, yc, hz + rh * 0.08], [cx + s * R * 1.35, yc, hz + rh * 0.1], [cx + s * R * 1.5, yc, hz - rh * 0.02], [cx + s * R * 1.2, yc, hz - rh * 0.1], [cx + s * R * 0.62, yc, hz - rh * 0.07]], [R * 0.09, R * 0.09, R * 0.09, R * 0.09, R * 0.09], 8);
    a.rect(cx - W / 2, yc - D / 2, cx + W / 2, yc + D / 2); a.rect(cx - W * 0.42, yc - D * 0.42, cx + W * 0.42, yc + D * 0.42, 'EQUIP-DETAIL'); a.circ(cx, yc, R, 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.16, 'EQUIP-DETAIL');
    a.log('Added the plinth, plate, stem, bowl, handles and lid (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic rubber duck',
  desc: 'Rubber duck in side view: a plump body with a lifted tail, a round head, a flat beak, two eyes and a wing on each side.',
  vs: [
    ['bath size, 3 in', 3.2, 2.4, 3, 0, {}],
    ['pool size, 14 in', 15, 11, 13.5, 0, {}],
    ['giant display, 48 in', 52, 38, 46, 0, {}]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2;
    a.ell(cx + W * 0.06, yc, Z0 + H * 0.31, W * 0.42, D * 0.45, H * 0.3, 22, 12);
    a.ell(cx + W * 0.4, yc, Z0 + H * 0.5, W * 0.1, D * 0.18, H * 0.16, 10, 6);
    a.ell(cx - W * 0.2, yc, Z0 + H * 0.74, W * 0.2, D * 0.28, H * 0.24, 18, 10);
    a.ell(cx - W * 0.38, yc, Z0 + H * 0.67, W * 0.12, D * 0.2, H * 0.06, 12, 6);
    for (const s of [-1, 1]) { ball(a, cx - W * 0.3, yc + s * D * 0.24, Z0 + H * 0.8, H * 0.04, 6, 4); a.ell(cx + W * 0.1, yc + s * D * 0.4, Z0 + H * 0.36, W * 0.22, D * 0.05, H * 0.15, 12, 6); }
    a.ellp(cx + W * 0.06, yc, W * 0.42, D * 0.45); a.ellp(cx - W * 0.2, yc, W * 0.2, D * 0.28, 'EQUIP-DETAIL'); a.ellp(cx - W * 0.38, yc, W * 0.12, D * 0.2, 'EQUIP-DETAIL');
    for (const s of [-1, 1]) a.ellp(cx + W * 0.1, yc + s * D * 0.4, W * 0.22, D * 0.05, 'EQUIP-DETAIL');
    a.log('Added the body, tail, head, beak, eyes and wings (plan and 3D).');
  } }),

fam({ cat: 'fun/novelty', title: 'Generic party balloon',
  desc: (v) => v.kind === 'star' ? 'Five-point foil star balloon with a raised centre, a tied neck, a ribbon string and a round weight.' : v.kind === 'cluster' ? 'Cluster of five round balloons of different heights with tied necks, strings gathered at one ring and a round weight.' : 'Single round balloon with a tied neck, a string and a round weight.',
  vs: [
    ['single round, 14 in', 14, 14, 60, 0, { kind: 'round' }],
    ['cluster of five, 11 in', 30, 30, 66, 0, { kind: 'cluster' }],
    ['foil star, 18 in', 20, 4, 66, 0, { kind: 'star' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, H, W, D } = a, yc = (YF + YB) / 2, wr = m.min(W, D) * 0.08;
    a.cyl(cx, yc, Z0, Z0 + wr * 0.9, wr * 1.4, 14); a.circ(cx, yc, wr * 1.4, 'EQUIP-DETAIL');
    if (v.kind === 'round') {
      const R = W / 2, bz = Z0 + H - R * 1.1;
      a.ell(cx, yc, bz, R, R, R * 1.1, 22, 12); a.cone(cx, yc, bz - R * 1.35, bz - R * 1.05, 0.01, R * 0.15, 8);
      a.tube([[cx, yc, Z0 + wr * 0.9], [cx + 6, yc, Z0 + H * 0.3], [cx - 5, yc, Z0 + H * 0.55], [cx, yc, bz - R * 1.34]], [1.6, 1.6, 1.6, 1.6], 5); a.circ(cx, yc, R); a.circ(cx, yc, R * 0.15, 'EQUIP-DETAIL');
    } else if (v.kind === 'cluster') {
      const R = W * 0.17, ring = Z0 + H * 0.42;
      a.tube([[cx, yc, Z0 + wr * 0.9], [cx, yc, ring]], [1.6, 1.6], 5); a.tube([[cx, yc, ring - 4], [cx, yc, ring + 4]], [7, 7], 10);
      [[-0.28, 0.1, 0.64], [0.28, -0.05, 0.7], [0, 0.0, 0.86], [-0.2, -0.2, 0.78], [0.2, 0.25, 0.8]].forEach(([dx, dy, f], i) => {
        const bx = cx + dx * W, by = yc + dy * D, bz = Z0 + f * H - (i === 2 ? 0 : 0);
        a.ell(bx, by, bz, R, R, R * 1.12, 16, 10); a.cone(bx, by, bz - R * 1.4, bz - R * 1.08, 0.01, R * 0.14, 8); a.tube([[cx, yc, ring + 4], [bx, by, bz - R * 1.4]], [1.4, 1.4], 4); a.circ(bx, by, R, 'EQUIP');
      });
    } else {
      const R = W * 0.5, cz = Z0 + H - R * 0.97;
      prismSY(a, starPts(cx, cz, R, R * 0.42, 5, m.PI / 2), yc - 3, yc + 3); a.ell(cx, yc, cz, R * 0.4, 6, R * 0.4, 12, 8);
      a.tube([[cx, yc, Z0 + wr * 0.9], [cx + 5, yc, Z0 + H * 0.3], [cx - 4, yc, Z0 + H * 0.55], [cx, yc, cz - R * 0.9]], [1.6, 1.6, 1.6, 1.6], 5);
      a.rect(cx - R * 0.95, yc - 3, cx + R * 0.95, yc + 3, 'EQUIP'); a.line(cx, yc - 3, cx, yc + 3, 'EQUIP-DETAIL');
    }
    a.log('Added the balloon bodies, tied necks, strings and weight (plan and 3D).');
  } }),

// ============================================================================================ fun/puzzles
fam({ cat: 'fun/puzzles', title: 'Generic twisty cube puzzle',
  desc: (v) => `${v.n} x ${v.n} x ${v.n} twisty cube made of ${v.n === 2 ? 8 : v.n ** 3 - (v.n - 2) ** 3} separate cubelets with a gap between them and a raised sticker plate on each visible face, around a centre cross core.`,
  vs: [
    ['2 x 2, 2 in', 2, 2, 2, 0, { n: 2 }],
    ['3 x 3, 2.25 in', 2.25, 2.25, 2.25, 0, { n: 3 }],
    ['5 x 5, 3 in', 3, 3, 3, 0, { n: 5 }],
    ['giant 3 x 3, 12 in', 12, 12, 12, 0, { n: 3 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, W, D, H } = a, yc = (YF + YB) / 2, n = v.n, s = W / n, g = m.max(1, s * 0.03), st = m.max(0.6, s * 0.012), e = (i) => i * s;
    const inset = s * 0.08;
    a.box(cx - W / 2 + s * 0.8, yc - D / 2 + s * 0.8, Z0 + s * 0.8, cx + W / 2 - s * 0.8, yc + D / 2 - s * 0.8, Z0 + H - s * 0.8);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
      const edge = i === 0 || i === n - 1 || j === 0 || j === n - 1 || k === 0 || k === n - 1; if (!edge) continue;
      const x0 = cx - W / 2 + e(i) + g / 2, x1 = cx - W / 2 + e(i + 1) - g / 2, y0 = yc - D / 2 + e(j) + g / 2, y1 = yc - D / 2 + e(j + 1) - g / 2, z0 = Z0 + e(k) + g / 2, z1 = Z0 + e(k + 1) - g / 2;
      a.box(x0, y0, z0, x1, y1, z1);
      if (j === 0) a.box(x0 + inset, y0 - st, z0 + inset, x1 - inset, y0, z1 - inset);
      if (k === n - 1) a.box(x0 + inset, y0 + inset, z1, x1 - inset, y1 - inset, z1 + st * 0.001 + 0.0);
    }
    a.outline(); for (let i = 1; i < n; i++) { a.line(cx - W / 2 + e(i), yc - D / 2, cx - W / 2 + e(i), yc + D / 2, 'EQUIP-DETAIL'); a.line(cx - W / 2, yc - D / 2 + e(i), cx + W / 2, yc - D / 2 + e(i), 'EQUIP-DETAIL'); }
    a.log('Added the cubelets with gaps, the sticker plates on the front faces and the core (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic marble maze',
  desc: (v) => v.hedge ? `Garden hedge maze, ${v.n} x ${v.n} cells, with an outer hedge, a one-way route generated through the cells, an entrance gap, a centre goal platform and a flag post.` : `Tabletop marble maze in a wooden tray: ${v.n} x ${v.n} cells with inner walls, an outer rim, a start cell with a marble and a goal cell with a hole ring.`,
  vs: [
    ['tabletop 5 x 5 cells, 10 in', 10, 10, 1.6, 0, { n: 5, seed: 3 }],
    ['tabletop 8 x 8 cells, 14 in', 14, 14, 1.6, 0, { n: 8, seed: 7 }],
    ['tabletop 12 x 12 cells, 20 in', 20, 20, 1.8, 0, { n: 12, seed: 11 }],
    ['garden hedge 10 x 10 cells, 20 ft', 240, 240, 72, 0, { n: 10, seed: 5, hedge: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, W, D, H } = a, n = v.n, cw = W / n, ch = D / n, x0 = cx - W / 2, y0 = YF;
    const tw = v.hedge ? cw * 0.32 : m.max(2.5, cw * 0.07), baseT = v.hedge ? 4 : H * 0.18, wallH = H;
    let seed = v.seed * 9301 + 49297; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const seen = Array.from({ length: n }, () => Array(n).fill(false)), openR = Array.from({ length: n }, () => Array(n).fill(false)), openD = Array.from({ length: n }, () => Array(n).fill(false));
    const stack = [[0, 0]]; seen[0][0] = true;
    while (stack.length) { const [i, j] = stack[stack.length - 1], nb = []; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const p = i + di, q = j + dj; if (p >= 0 && q >= 0 && p < n && q < n && !seen[p][q]) nb.push([p, q, di, dj]); }
      if (!nb.length) { stack.pop(); continue; } const [p, q, di, dj] = nb[m.floor(rnd() * nb.length)]; seen[p][q] = true; if (di === 1) openR[i][j] = true; if (di === -1) openR[p][q] = true; if (dj === 1) openD[i][j] = true; if (dj === -1) openD[p][q] = true; stack.push([p, q]); }
    a.box(x0, y0, Z0, x0 + W, YB, Z0 + baseT);
    const wall = (xa, ya, xb, yb) => { a.box(xa, ya, Z0 + baseT, xb, yb, Z0 + wallH); a.rect(xa, ya, xb, yb, 'EQUIP-DETAIL'); };
    for (let i = 0; i <= n; i++) for (let j = 0; j < n; j++) { const open = i > 0 && i < n && openR[i - 1][j]; if (!open) { const gx = x0 + i * cw, ya = y0 + j * ch; if (i === 0 && j === 0 && v.hedge) continue; wall(gx - tw / 2 < x0 ? x0 : gx - tw / 2, ya, m.min(gx + tw / 2, x0 + W), ya + ch); } }
    for (let j = 0; j <= n; j++) for (let i = 0; i < n; i++) { const open = j > 0 && j < n && openD[i][j - 1]; if (!open) { const gy = y0 + j * ch, xa = x0 + i * cw; if (j === n && i === n >> 1 && v.hedge) continue; wall(xa, gy - tw / 2 < y0 ? y0 : gy - tw / 2, xa + cw, m.min(gy + tw / 2, YB)); } }
    const sx = x0 + cw / 2, sy = y0 + ch / 2, ex = x0 + (n - 1) * cw + cw / 2, ey = y0 + (n - 1) * ch + ch / 2;
    if (v.hedge) { a.cyl(ex, ey, Z0 + baseT, Z0 + baseT + 8, cw * 0.4, 14); a.cyl(ex, ey, Z0, Z0 + 30, cw * 0.1, 8); a.box(ex, ey - 3, Z0 + 30 + 1, ex + cw * 0.3, ey + 3, Z0 + 55); }
    else { ball(a, sx, sy, Z0 + baseT + cw * 0.18, cw * 0.18, 14, 8); a.tube([[ex, ey, Z0 + baseT], [ex, ey, Z0 + baseT + 2]], [cw * 0.28, cw * 0.28], 16); a.circ(ex, ey, cw * 0.28, 'EQUIP-DETAIL'); a.circ(sx, sy, cw * 0.18, 'EQUIP-DETAIL'); }
    a.outline();
    a.log('Added the base, the outer walls, the generated inner walls and the start and goal marks (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic tangram set',
  desc: 'Seven flat tangram pieces (two large, one medium and two small right triangles, a square and a parallelogram) laid out in a shallow tray with a raised rim.',
  vs: [
    ['in tray, 6 in', 6, 3.5, 0.4, 0, {}],
    ['floor set, 36 in', 36, 21, 1.5, 0, {}]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, W, D, H } = a, rim = W * 0.025, u = (W - 2 * rim - W * 0.04) / 8.4, s2 = m.SQRT2, x0 = cx - W / 2 + rim + W * 0.02, y0 = YF + rim + W * 0.02, th = H * 0.5, bz = Z0 + H * 0.28;
    a.box(cx - W / 2, YF, Z0, cx + W / 2, YB, bz); a.box(cx - W / 2, YF, bz, cx + W / 2, YF + rim, Z0 + H); a.box(cx - W / 2, YB - rim, bz, cx + W / 2, YB, Z0 + H); a.box(cx - W / 2, YF, bz, cx - W / 2 + rim, YB, Z0 + H); a.box(cx + W / 2 - rim, YF, bz, cx + W / 2, YB, Z0 + H);
    const P = (ox, oy, pts) => pts.map(([x, y]) => [x0 + (ox + x) * u, y0 + (oy + y) * u]);
    const L = 2 * s2, M = 2, S = s2;
    const pieces = [P(0, 0, [[0, 0], [L, 0], [0, L]]), P(L + 0.4, 0, [[L, 0], [L, L], [0, L]]), P(2 * L + 0.8, 0, [[0, 0], [M, 0], [0, M]]),
      P(0, L + 0.4, [[0, 0], [S, 0], [0, S]]), P(S + 0.35, L + 0.4, [[S, 0], [S, S], [0, S]]), P(2 * S + 0.7, L + 0.4, [[0, 0], [S, 0], [S, S], [0, S]]), P(3 * S + 1.05, L + 0.4, [[0, 0], [2, 0], [3, 1], [1, 1]])];
    for (const p of pieces) { prismS(a, p, bz, bz + th); a.poly(p, 'EQUIP-DETAIL'); }
    a.outline(); a.rect(cx - W / 2 + rim, YF + rim, cx + W / 2 - rim, YB - rim, 'EQUIP-DETAIL');
    a.log('Added the tray with its rim and the seven tangram pieces (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic stacking ring tower puzzle',
  desc: (v) => `Tower puzzle on a long wooden base with three upright pegs and ${v.n} round discs stacked large to small on the first peg, each disc with a centre hole, and a ball cap on every peg.`,
  vs: [
    ['3 discs, 9 in', 9, 3.4, 4, 0, { n: 3 }],
    ['5 discs, 12 in', 12, 4.2, 6, 0, { n: 5 }],
    ['7 discs, 15 in', 15, 5.2, 7.5, 0, { n: 7 }],
    ['9 discs, 21 in', 21, 7.4, 10, 0, { n: 9 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, W, D, H } = a, yc = (YF + YB) / 2, n = v.n, bt = H * 0.07, sp = W / 3, pr = D * 0.04, dh = (H * 0.88 - bt) / (n + 0.8);
    a.box(cx - W / 2, YF, Z0 + bt * 0.35, cx + W / 2, YB, Z0 + bt); a.box(cx - W / 2 + D * 0.08, YF + D * 0.08, Z0, cx + W / 2 - D * 0.08, YB - D * 0.08, Z0 + bt * 0.35);
    for (let i = 0; i < 3; i++) { const px = cx + (i - 1) * sp; a.cyl(px, yc, Z0 + bt, Z0 + bt + dh * (n + 0.5), pr, 12); ball(a, px, yc, Z0 + bt + dh * (n + 0.5) + pr * 0.6, pr * 1.3, 10, 6); a.circ(px, yc, pr * 1.4, 'EQUIP-DETAIL'); }
    const maxR = sp * 0.46, minR = pr * 2.4;
    for (let k = 0; k < n; k++) { const r = maxR - (maxR - minR) * (k / m.max(1, n - 1)), z = Z0 + bt + k * dh; a.tube([[cx - sp, yc, z], [cx - sp, yc, z + dh * 0.94]], [r, r], 24); a.tube([[cx - sp, yc, z + dh * 0.94], [cx - sp, yc, z + dh * 0.94]], [r, r], 3); a.circ(cx - sp, yc, r, k === 0 ? 'EQUIP' : 'EQUIP-DETAIL'); }
    a.outline(); a.log('Added the base with its feet, three pegs with caps and the stack of graded discs (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic six-bar burr puzzle',
  desc: 'Interlocking puzzle of six square sticks in three crossed pairs, one pair along each axis, each stick with solid ends and a half-depth notched centre.',
  vs: [
    ['hand size, 3 in', 3, 3, 3, 0, {}],
    ['giant display, 12 in', 12, 12, 12, 0, {}]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, W, D, H } = a, yc = (YF + YB) / 2, u = W / 6, zc = Z0 + H / 2, g = u * 0.02;
    for (const s of [-1, 1]) {
      const o = s * u;   // x-bars at y = ±u, along x; y-bars at z = ±u, along y; z-bars at x = ±u, along z
      a.box(cx - 3 * u, yc + o - u + g, zc - u + g, cx - u, yc + o + u - g, zc + u - g); a.box(cx + u, yc + o - u + g, zc - u + g, cx + 3 * u, yc + o + u - g, zc + u - g);
      a.box(cx - u, yc + o - u + g, zc - u + g, cx + u, yc + o + u - g, zc);
      a.box(cx - u + g, yc - 3 * u, zc + o - u + g, cx + u - g, yc - u, zc + o + u - g); a.box(cx - u + g, yc + u, zc + o - u + g, cx + u - g, yc + 3 * u, zc + o + u - g);
      a.box(cx - u + g, yc - u, zc + o - u + g, cx + u - g, yc + u, zc + o);
      a.box(cx + o - u + g, yc - u + g, zc - 3 * u, cx + o + u - g, yc + u - g, zc - u); a.box(cx + o - u + g, yc - u + g, zc + u, cx + o + u - g, yc + u - g, zc + 3 * u);
      a.box(cx + o - u + g, yc - u + g, zc - u, cx + o, yc + u - g, zc + u);
      a.rect(cx - 3 * u, yc + o - u, cx + 3 * u, yc + o + u, 'EQUIP-DETAIL'); a.rect(cx + o - u, yc - 3 * u, cx + o + u, yc + 3 * u, 'EQUIP-DETAIL');
    }
    a.outline('EQUIP-HIDDEN'); a.log('Added the six notched sticks in three crossed pairs (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic block stacking tower game',
  desc: (v) => `Block tower game: ${v.layers} layers of three rectangular blocks, each layer turned a quarter turn from the one below${v.gap ? ', with one block missing from a middle layer and one pulled out half way' : ''}.`,
  vs: [
    ['hand size, 18 layers, 9 in', 2.4, 2.4, 9, 0, { layers: 18 }],
    ['hand size, part played, 18 layers, 9 in', 2.4, 2.4, 9, 0, { layers: 18, gap: true }],
    ['giant lawn size, 18 layers, 36 in', 9.6, 9.6, 36, 0, { layers: 18 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, W, D, H } = a, yc = (YF + YB) / 2, bw = W / 3, bh = H / v.layers, g = m.max(0.3, bw * 0.01);
    for (let k = 0; k < v.layers; k++) for (let b = -1; b <= 1; b++) {
      const z0 = Z0 + k * bh + g, z1 = Z0 + (k + 1) * bh - g;
      if (v.gap && k === 8 && b === 0) continue;
      let sh = 0; if (v.gap && k === 11 && b === 1) sh = bw * 0.5;
      if (k % 2 === 0) a.box(cx - W / 2, yc + b * bw - bw / 2 + g - sh * 0, z0, cx + W / 2, yc + b * bw + bw / 2 - g, z1);
      else a.box(cx + b * bw - bw / 2 + g, yc - D / 2 + (b === 1 && v.gap && k === 11 ? 0 : 0), z0, cx + b * bw + bw / 2 - g, yc + D / 2, z1);
    }
    a.rect(cx - W / 2, yc - D / 2, cx + W / 2, yc + D / 2); for (let b = -1; b <= 1; b++) a.rect(cx - W / 2, yc + b * bw - bw / 2, cx + W / 2, yc + b * bw + bw / 2, 'EQUIP-DETAIL');
    a.log('Added the alternating layers of three blocks each (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic six-sided dice',
  desc: (v) => `${v.pair ? 'Pair of six-sided dice' : 'Six-sided die'} with chamfered edges and raised round pips on every face (1 to 6, opposite faces adding to seven).`,
  vs: [
    ['pipped die, 0.63 in', 0.63, 0.63, 0.63, 0, { pair: false }],
    ['giant pipped die, 6 in', 6, 6, 6, 0, { pair: false }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, W, D, H } = a, yc = (YF + YB) / 2, s = H / 2, c = s * 0.13;
    const PIP = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    const one = (x, faces) => {
      const P = []; for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) { P.push([sx * s, sy * s, sz * (s - c)], [sx * s, sy * (s - c), sz * s], [sx * (s - c), sy * s, sz * s]); }
      const uniq = []; for (const p of P) if (!uniq.some((q) => q[0] === p[0] && q[1] === p[1] && q[2] === p[2])) uniq.push(p);
      hull(a, uniq, 1, x, yc, Z0 + s);
      const r = s * 0.11, d = s * 0.65 * 0.5, pd = r * 0.55;
      for (const [u, w] of PIP[faces.top]) a.ell(x + u * d, yc + w * d, Z0 + 2 * s, r, r, pd, 10, 4);
      for (const [u, w] of PIP[faces.front]) a.ell(x + u * d, yc - s, Z0 + s + w * d, r, pd, r, 10, 4);
      for (const [u, w] of PIP[faces.right]) a.ell(x + s, yc + u * d, Z0 + s + w * d, pd, r, r, 10, 4);
      for (const [u, w] of PIP[faces.left]) a.ell(x - s, yc + u * d, Z0 + s + w * d, pd, r, r, 10, 4);
      a.rect(x - s, yc - s, x + s, yc + s); for (const [u, w] of PIP[faces.top]) a.circ(x + u * d, yc + w * d, r, 'EQUIP-DETAIL');
    };
    if (v.pair) { one(cx - s * 1.2, { top: 6, front: 2, right: 3, left: 4 }); one(cx + s * 1.2, { top: 5, front: 1, right: 2, left: 5 }); }
    else one(cx, { top: 6, front: 2, right: 3, left: 4 });
    a.log('Added the chamfered cube and the raised pips on each face (plan and 3D).');
  } }),

fam({ cat: 'fun/puzzles', title: 'Generic polyhedral die',
  desc: (v) => `${v.k}-sided die cut as a ${v.shape}, with flat faces and sharp edges and a small raised dot at the centre of each face, resting on a ${v.rest}.`,
  vs: [
    ['four-sided, 1.2 in', 1.2, 1.04, 0.98, 0, { k: 4, shape: 'tetrahedron', rest: 'flat face' }],
    ['eight-sided, 1 in', 1, 1, 1, 0, { k: 8, shape: 'octahedron', rest: 'corner' }],
    ['twelve-sided, 1.1 in', 1.1, 1.1, 1.1, 0, { k: 12, shape: 'dodecahedron with pentagon faces', rest: 'corner' }],
    ['twenty-sided, 1.1 in', 1.1, 1.1, 1.1, 0, { k: 20, shape: 'icosahedron with triangle faces', rest: 'corner' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, W, D, H } = a, yc = (YF + YB) / 2, PHI = (1 + m.sqrt(5)) / 2;
    let P, sc, F;
    if (v.k === 4) { P = [[0, 0, 1.633]]; for (const t of [90, 210, 330]) P.push([1.1547 * m.cos((t * m.PI) / 180), 1.1547 * m.sin((t * m.PI) / 180), 0]); sc = W / 2; F = hull(a, P, sc, cx, yc - (1.1547 - 0.5774) / 2 * sc, Z0); }
    else if (v.k === 8) { P = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]; sc = W / 2; F = hull(a, P, sc, cx, yc, Z0 + H / 2); }
    else if (v.k === 12) { P = []; for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) P.push([x, y, z]); for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) P.push([0, s1 / PHI, s2 * PHI], [s1 / PHI, s2 * PHI, 0], [s2 * PHI, 0, s1 / PHI]); sc = W / 2 / PHI; F = hull(a, P, sc, cx, yc, Z0 + H / 2); }
    else { P = []; for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) P.push([0, s1, s2 * PHI], [s1, s2 * PHI, 0], [s2 * PHI, 0, s1]); sc = W / 2 / PHI; F = hull(a, P, sc, cx, yc, Z0 + H / 2); }
    for (const f of F) { const d = W * 0.045; a.ell(f.c[0] + f.n[0] * d * 0.3, f.c[1] + f.n[1] * d * 0.3, f.c[2] + f.n[2] * d * 0.3, d, d, d, 8, 5); }
    if (v.k === 4) { const sc2 = W / 2, oy = yc - (1.1547 - 0.5774) / 2 * sc2; a.poly([[cx, oy + 1.1547 * sc2], [cx - sc2, oy - 0.5774 * sc2], [cx + sc2, oy - 0.5774 * sc2]].reverse()); }
    else a.circ(cx, yc, W / 2 * 0.95, 'EQUIP'), a.circ(cx, yc, W / 2 * 0.5, 'EQUIP-DETAIL');
    a.log('Added the faceted body of the die (plan and 3D).');
  } }),

// ============================================================================================ fun/fantasy
fam({ cat: 'fun/fantasy', title: 'Generic fantasy castle',
  desc: (v) => v.layout === 'keep' ? 'Toy-scale castle keep: a square main block with a battlemented top, four round corner turrets with cone roofs and arrow slits, a gate arch with a raised portcullis and a flag.'
    : v.layout === 'gate' ? 'Castle front: a long curtain wall with a battlemented walk, two round towers with cone roofs, a central gatehouse with an arched gate, a lowered drawbridge and flag poles.'
    : 'Walled castle: four corner towers with cone roofs, curtain walls with battlements, a front gatehouse with a lowered drawbridge, and a central keep with a turret and flag inside the courtyard.',
  vs: [
    ['keep with four turrets, 36 in', 36, 36, 52, 0, { layout: 'keep' }],
    ['gatehouse and two towers, 60 in', 60, 22, 48, 0, { layout: 'gate' }],
    ['walled courtyard, 72 in', 72, 72, 64, 0, { layout: 'walled' }],
    ['playhouse castle, 120 in', 120, 120, 120, 0, { layout: 'walled' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, W, D, H, X0, X1 } = a, yc = (YF + YB) / 2;
    const merl = (x0, y0, x1, y1, z, s, h) => { const len = m.hypot(x1 - x0, y1 - y0), n = m.max(2, m.round(len / (s * 2.4))); for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; a.box(x - s, y - s, z, x + s, y + s, z + h); } };
    const tower = (x, y, r, h, rh, flag) => {
      a.cyl(x, y, Z0, Z0 + h, r, 20); a.cyl(x, y, Z0 + h - rh * 0.12, Z0 + h, r * 1.12, 20); ringOf(a, x, y, r * 1.05, 10, Z0 + h, rh * 0.1, r * 0.1);
      a.cone(x, y, Z0 + h + rh * 0.1, Z0 + h + rh, r * 1.15, 0.01, 20); if (flag) { a.cyl(x, y, Z0 + h + rh, Z0 + h + rh * 1.35, W * 0.004, 6); a.box(x, y - W * 0.003, Z0 + h + rh * 1.15, x + r * 0.7, y + W * 0.003, Z0 + h + rh * 1.35); }
      for (const z of [0.4, 0.7]) a.box(x - r * 0.07, y - r - 1, Z0 + h * z, x + r * 0.07, y - r + 4, Z0 + h * z + h * 0.1);
      a.circ(x, y, r); a.circ(x, y, r * 0.7, 'EQUIP-DETAIL');
    };
    const gate = (x, y, w, h, t) => { const p = w * 0.17; a.box(x - w / 2, y - t / 2, Z0, x - p, y + t / 2, Z0 + h); a.box(x + p, y - t / 2, Z0, x + w / 2, y + t / 2, Z0 + h); a.box(x - p, y - t / 2, Z0 + h * 0.55, x + p, y + t / 2, Z0 + h); a.box(x - p * 0.8, y - t / 2 - 1, Z0 + h * 0.4, x + p * 0.8, y - t / 2 + 1, Z0 + h * 0.56); for (let i = -2; i <= 2; i++) a.box(x + i * p * 0.35 - W * 0.003, y - t / 2 - W * 0.005, Z0, x + i * p * 0.35 + W * 0.003, y - t / 2, Z0 + h * 0.4); merl(x - w / 2, y - t / 2, x + w / 2, y - t / 2, Z0 + h, t * 0.09, h * 0.1); a.rect(x - w / 2, y - t / 2, x + w / 2, y + t / 2); a.rect(x - p, y - t / 2, x + p, y + t / 2, 'EQUIP-DETAIL'); };
    if (v.layout === 'keep') {
      const r = W * 0.1, kh = H * 0.62, kx = W * 0.32;
      a.box(cx - kx, yc - kx, Z0, cx + kx, yc + kx, Z0 + kh); a.box(cx - kx - 2, yc - kx - 2, Z0 + kh, cx + kx + 2, yc + kx + 2, Z0 + kh + H * 0.03);
      for (const [x0, y0, x1, y1] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) merl(cx + x0 * (kx + 1), yc + y0 * (kx + 1), cx + x1 * (kx + 1), yc + y1 * (kx + 1), Z0 + kh + H * 0.03, W * 0.012, H * 0.04);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) tower(cx + sx * (kx + 0.0), yc + sy * (kx + 0.0), r, H * 0.62 + H * 0.05, H * 0.28, true);
      gate(cx, yc - kx, W * 0.34, H * 0.28, 4); a.rect(cx - kx, yc - kx, cx + kx, yc + kx, 'EQUIP-DETAIL');
    } else if (v.layout === 'gate') {
      const r = D * 0.36, wh = H * 0.5, th = D * 0.2;
      a.box(X0 + r, yc - th / 2, Z0, X1 - r, yc + th / 2, Z0 + wh); merl(X0 + r, yc - th / 2, X1 - r, yc - th / 2, Z0 + wh, W * 0.006, H * 0.06); merl(X0 + r, yc + th / 2, X1 - r, yc + th / 2, Z0 + wh, W * 0.006, H * 0.06);
      tower(X0 + r, yc, r, H * 0.78, H * 0.22, true); tower(X1 - r, yc, r, H * 0.78, H * 0.22, true);
      const gw = W * 0.24; a.box(cx - gw / 2, yc - D * 0.32, Z0, cx + gw / 2, yc + D * 0.32, Z0 + H * 0.72); gate(cx, yc - D * 0.32, gw, H * 0.4, D * 0.1);
      a.box(cx - gw * 0.3, yc - D * 0.5, Z0, cx + gw * 0.3, yc - D * 0.32, Z0 + 3); a.rect(cx - gw * 0.3, yc - D * 0.5, cx + gw * 0.3, yc - D * 0.32, 'EQUIP-DETAIL');
      a.cyl(cx, yc - D * 0.32, Z0 + H * 0.72, Z0 + H * 0.9, W * 0.004, 6); a.box(cx, yc - D * 0.32 - W * 0.003, Z0 + H * 0.78, cx + gw * 0.4, yc - D * 0.32 + W * 0.003, Z0 + H * 0.9);
    } else {
      const r = W * 0.075, wh = H * 0.45, t = W * 0.03, ins = r * 0.9, th = H * 0.8;
      for (const [x0, y0, x1, y1] of [[-1, 1, 1, 1], [1, -1, 1, 1], [-1, -1, -1, 1]]) { a.box(cx + x0 * (W / 2 - ins) - (x0 === x1 ? t / 2 : 0), yc + y0 * (D / 2 - ins) - (y0 === y1 ? t / 2 : 0), Z0, cx + x1 * (W / 2 - ins) + (x0 === x1 ? t / 2 : 0), yc + y1 * (D / 2 - ins) + (y0 === y1 ? t / 2 : 0), Z0 + wh); merl(cx + x0 * (W / 2 - ins), yc + y0 * (D / 2 - ins), cx + x1 * (W / 2 - ins), yc + y1 * (D / 2 - ins), Z0 + wh, t * 0.28, H * 0.05); a.line(cx + x0 * (W / 2 - ins), yc + y0 * (D / 2 - ins), cx + x1 * (W / 2 - ins), yc + y1 * (D / 2 - ins), 'EQUIP'); }
      const fy = yc - (D / 2 - ins), gw = W * 0.26; a.box(X0 + ins, fy - t / 2, Z0, cx - gw / 2, fy + t / 2, Z0 + wh); a.box(cx + gw / 2, fy - t / 2, Z0, X1 - ins, fy + t / 2, Z0 + wh); merl(X0 + ins, fy, cx - gw / 2, fy, Z0 + wh, t * 0.28, H * 0.05); merl(cx + gw / 2, fy, X1 - ins, fy, Z0 + wh, t * 0.28, H * 0.05);
      a.line(X0 + ins, fy, cx - gw / 2, fy, 'EQUIP'); a.line(cx + gw / 2, fy, X1 - ins, fy, 'EQUIP');
      gate(cx, fy, gw, wh * 1.15, t * 2.2); a.box(cx - gw * 0.3, fy - t * 3.2, Z0, cx + gw * 0.3, fy - t * 1.1, Z0 + 3); a.rect(cx - gw * 0.3, fy - t * 3.2, cx + gw * 0.3, fy - t * 1.1, 'EQUIP-DETAIL');
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) tower(cx + sx * (W / 2 - ins), yc + sy * (D / 2 - ins), r, th * 0.8, H * 0.2, sx > 0 && sy > 0);
      const kk = W * 0.14; a.box(cx - kk, yc + D * 0.05 - kk, Z0, cx + kk, yc + D * 0.05 + kk, Z0 + H * 0.62); merl(cx - kk, yc + D * 0.05 - kk, cx + kk, yc + D * 0.05 - kk, Z0 + H * 0.62, kk * 0.07, H * 0.04); tower(cx, yc + D * 0.05, kk * 0.55, H * 0.8, H * 0.2, true); a.rect(cx - kk, yc + D * 0.05 - kk, cx + kk, yc + D * 0.05 + kk);
    }
    a.outline('EQUIP-HIDDEN'); a.log('Added the walls, battlements, round towers with cone roofs, gate with portcullis and the keep or drawbridge of this layout (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic dragon statue',
  desc: (v) => `Dragon built from simple shapes: a ${v.pose === 'sit' ? 'seated body on its haunches' : v.pose === 'wing' ? 'body with both wings raised' : 'standing body'}, a curved neck, a head with a snout, two horns and eyes, front legs with claws, a long tail ending in a spade${v.pose !== 'sit' ? ', and two ribbed bat wings with membrane' : ', and small folded wings'}${v.plinth ? ', on a stepped stone plinth' : ''}.`,
  vs: [
    ['seated, 30 in', 20, 24, 30, 0, { pose: 'sit' }],
    ['winged, 60 in', 66, 36, 60, 0, { pose: 'wing' }],
    ['guardian on plinth, 48 in', 36, 30, 48, 0, { pose: 'stand', plinth: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, W, D, H } = a, yc = (YF + YB) / 2, ph = v.plinth ? H * 0.14 : 0, z0 = Z0 + ph, h = H - ph;
    if (v.plinth) { a.box(cx - W / 2, YF, Z0, cx + W / 2, YB, Z0 + ph * 0.6); a.box(cx - W * 0.42, YF + D * 0.08, Z0 + ph * 0.6, cx + W * 0.42, YB - D * 0.08, Z0 + ph); a.rect(cx - W * 0.42, YF + D * 0.08, cx + W * 0.42, YB - D * 0.08, 'EQUIP-DETAIL'); }
    const sit = v.pose === 'sit', bw = W * (v.pose === 'wing' ? 0.1 : 0.17), by = yc + D * 0.12, bzc = z0 + h * (sit ? 0.32 : 0.36);
    a.ell(cx, by, bzc, bw, D * 0.24, h * (sit ? 0.3 : 0.2), 16, 10);
    a.ell(cx, by - D * 0.14, bzc + h * 0.02, bw * 0.85, D * 0.13, h * 0.2, 12, 8);
    for (const s of [-1, 1]) { const hx = cx + s * bw * 1.05; a.ell(hx, by + D * 0.1, z0 + h * 0.16, bw * 0.6, D * 0.14, h * 0.15, 10, 7); a.tube([[hx, by - D * 0.05, z0 + h * 0.42], [cx + s * bw * 0.85, by - D * 0.18, z0 + h * 0.26], [cx + s * bw * 0.7, by - D * 0.3, z0 + h * 0.04]], [bw * 0.28, bw * 0.22, bw * 0.2], 8); a.box(cx + s * bw * 0.7 - bw * 0.35, by - D * 0.38, z0, cx + s * bw * 0.7 + bw * 0.35, by - D * 0.26, z0 + h * 0.03); for (const k of [-1, 0, 1]) a.tube([[cx + s * bw * 0.7 + k * bw * 0.2, by - D * 0.36, z0 + h * 0.02], [cx + s * bw * 0.7 + k * bw * 0.25, by - D * 0.42, z0 + h * 0.0 + 1]], [3, 1.5], 5); a.circ(cx + s * bw * 0.7, by - D * 0.32, bw * 0.3, 'EQUIP-DETAIL'); a.ellp(hx, by + D * 0.1, bw * 0.6, D * 0.14, 'EQUIP-DETAIL'); }
    const nz0 = bzc + h * 0.14, hy = yc - D * 0.3, hz = z0 + h * (sit ? 0.86 : 0.82);
    a.tube([[cx, by - D * 0.18, nz0], [cx, yc - D * 0.05, nz0 + h * 0.2], [cx, hy + D * 0.06, hz - h * 0.06], [cx, hy, hz]], [bw * 0.55, bw * 0.42, bw * 0.38, bw * 0.38], 10);
    a.ell(cx, hy - D * 0.02, hz + h * 0.02, bw * 0.45, D * 0.07, h * 0.06, 12, 8); a.tube([[cx, hy - D * 0.02, hz], [cx, hy - D * 0.12, hz - h * 0.02]], [bw * 0.33, bw * 0.24], 8); a.box(cx - bw * 0.3, hy - D * 0.12, hz - h * 0.05, cx + bw * 0.3, hy - D * 0.03, hz - h * 0.03);
    for (const s of [-1, 1]) { a.tube([[cx + s * bw * 0.3, hy + D * 0.02, hz + h * 0.04], [cx + s * bw * 0.6, hy + D * 0.06, hz + h * 0.1], [cx + s * bw * 0.75, hy + D * 0.1, hz + h * 0.15]], [bw * 0.1, bw * 0.07, 0.8], 6); ball(a, cx + s * bw * 0.28, hy - D * 0.07, hz + h * 0.02, bw * 0.07, 6, 4); }
    a.circ(cx, hy, bw * 0.4, 'EQUIP-DETAIL');
    a.tube([[cx, YB - D * 0.1, z0 + h * 0.2], [cx + W * 0.1, YB - D * 0.02, z0 + h * 0.1], [cx + W * 0.28, YB - D * 0.04, z0 + h * 0.06], [cx + W * 0.4, yc, z0 + h * 0.08]], [bw * 0.45, bw * 0.32, bw * 0.18, 2.5], 8);
    prismS(a, [[cx + W * 0.4 - 1, yc + D * 0.0], [cx + W * 0.47, yc - D * 0.05], [cx + W * 0.46, yc + D * 0.06]], z0 + h * 0.06, z0 + h * 0.1);
    for (let i = 0; i < 5; i++) { const t = i / 4, yy = by - D * 0.1 + D * 0.3 * t, zz = bzc + h * (0.18 - 0.1 * t); prismX(a, [[yy - 5, zz], [yy + 5, zz], [yy, zz + h * 0.05]], cx - 1.2, cx + 1.2); }
    const wspan = W * (v.pose === 'wing' ? 0.5 : 0.28), wy = by - D * 0.02, wt = W * 0.012;
    for (const s of [-1, 1]) {
      const sx = cx + s * bw * 0.5, sz = bzc + h * 0.15, tip = [cx + s * wspan, z0 + h * (v.pose === 'wing' ? 0.96 : 0.62)], mid = [cx + s * wspan * 0.72, z0 + h * (v.pose === 'wing' ? 0.9 : 0.6)], lo = [cx + s * wspan * 0.82, z0 + h * (v.pose === 'wing' ? 0.55 : 0.42)], bt = [cx + s * bw * 0.6, bzc - h * 0.1];
      const sp = (p, q) => a.tube([[p[0], wy, p[1]], [q[0], wy, q[1]]], [bw * 0.07, bw * 0.05], 6);
      sp([sx, sz], tip); sp([sx, sz], lo); a.tube([[sx, wy, sz], [cx + s * wspan * 0.45, wy, z0 + h * (v.pose === 'wing' ? 0.78 : 0.55)]], [bw * 0.1, bw * 0.07], 6);
      for (const tri of [[[sx, sz], tip, mid], [[sx, sz], mid, lo], [[sx, sz], lo, bt]]) prismY(a, tri, wy - wt / 2, wy + wt / 2);
      a.rect(m.min(sx, tip[0]), wy - wt / 2, m.max(sx, tip[0]), wy + wt / 2, 'EQUIP-DETAIL');
    }
    a.log('Added the body, neck, head with horns, legs with claws, tail, spine plates and wings (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic treasure chest',
  desc: (v) => `Treasure chest with a ${v.open ? 'lid opened back on its hinges, ' : 'domed barrel lid, '}wooden body, three iron straps over body and lid, corner plates, a lock plate with keyhole and hasp, two side handles and four short feet${v.open ? ', and a heap of coins with a few gems inside' : ''}.`,
  vs: [
    ['trinket box, 8 in', 8, 5, 6, 0, { open: false }],
    ['standard, 24 in', 24, 14, 18, 0, { open: false }],
    ['large banded, 36 in', 36, 20, 26, 0, { open: false }],
    ['open with coins, 24 in', 24, 26, 30, 0, { open: true }]],
  build: (a, v) => {
    const { cx, YF, Z0, X0, X1, W, H } = a, ft = H * 0.04, bh = H * (v.open ? 0.34 : 0.5), lh = H * (v.open ? 0.3 : 0.4), YB = a.YB - (v.open ? lh * 0.98 : 0), D = YB - YF, yc = (YF + YB) / 2, bz0 = Z0 + ft, bz1 = bz0 + bh;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * (W / 2 - W * 0.06) - W * 0.03, yc + sy * (D / 2 - D * 0.08) - W * 0.03, Z0, cx + sx * (W / 2 - W * 0.06) + W * 0.03, yc + sy * (D / 2 - D * 0.08) + W * 0.03, bz0 + 1);
    a.box(X0, YF, bz0, X1, YB, bz1); a.box(X0 + W * 0.01, YF - 1, bz0 + bh * 0.02, X1 - W * 0.01, YF, bz1 - bh * 0.02);
    const arch = (ang0, ang1, x0, x1, rr = 1, rot = 0) => { const pts = []; for (let i = 0; i <= 10; i++) { const t = ang0 + ((ang1 - ang0) * i) / 10; pts.push([yc + (D / 2) * rr * m.cos(t), m.sin(t) * lh * rr]); } return pts; };
    const lidPoly = (rr) => arch(m.PI, 0, 0, 0, rr).map(([y, z]) => [y, z]);
    // lid: half barrel (arch in y-z, extruded along x), closed or rotated open about the back hinge
    const rot = v.open ? -1.75 : 0, hy = YB - 2, hz = bz1;
    const place = (y, z) => { const dy = y - hy, dz = z; return [hy + dy * m.cos(rot) - dz * m.sin(rot) * 1 * -1 * -1 + 0, hz + dy * m.sin(rot) * -1 * -1 + dz * m.cos(rot)]; };
    const Rot = (y, z) => { const dy = y - hy, dz = z; return [hy + dy * m.cos(rot) - dz * m.sin(rot), hz + dy * m.sin(rot) + dz * m.cos(rot)]; };
    const lid = (x0, x1, rr) => prismX(a, lidPoly(rr).map(([y, z]) => Rot(y, z)), x0, x1);
    lid(X0, X1, 1);
    for (const xf of [0.12, 0.5, 0.88]) { const x = X0 + W * xf; lid(x - W * 0.025, x + W * 0.025, 1.015); a.box(x - W * 0.025, YF - 2, bz0, x + W * 0.025, YF, bz1); a.box(x - W * 0.025, YB - 0, bz0, x + W * 0.025, YB + 0, bz1); a.rect(x - W * 0.025, YF, x + W * 0.025, YB, 'EQUIP-DETAIL'); }
    for (const sx of [-1, 1]) for (const z of [bz0, bz1 - W * 0.05]) a.box(cx + sx * (W / 2) - (sx > 0 ? W * 0.05 : 0), YF - 1.5, z, cx + sx * (W / 2) + (sx > 0 ? 0 : W * 0.05), YF + W * 0.05, z + W * 0.05);
    for (const sx of [-1, 1]) { a.tube([[cx + sx * W / 2, yc - D * 0.08, bz0 + bh * 0.6], [cx + sx * (W / 2 + 4), yc - D * 0.08, bz0 + bh * 0.6], [cx + sx * (W / 2 + 4), yc + D * 0.08, bz0 + bh * 0.6], [cx + sx * W / 2, yc + D * 0.08, bz0 + bh * 0.6]], [3, 3, 3, 3], 6); }
    const lw = W * 0.06; a.box(cx - lw, YF - 4, bz1 - bh * 0.42, cx + lw, YF, bz1 + 2); a.ycyl(YF - 5, YF - 4, cx, bz1 - bh * 0.2, lw * 0.3, 8); a.box(cx - lw * 0.12, YF - 5, bz1 - bh * 0.34, cx + lw * 0.12, YF - 4, bz1 - bh * 0.2);
    if (!v.open) a.box(cx - lw * 0.7, YF - 4, bz1, cx + lw * 0.7, YF + 1, bz1 + lh * 0.3);
    if (v.open) { const top = bz1 - 2; a.box(X0 + 2, YF + 2, top, X1 - 2, YB - 2, top + 1); for (let i = 0; i < 26; i++) { const t = i * 2.399, r = (W * 0.36) * m.sqrt((i + 1) / 26), x = cx + r * m.cos(t) * 0.9, y = yc + D * 0.28 * (r / (W * 0.36)) * m.sin(t) * 1.0; a.xcyl(x - W * 0.025, x + W * 0.025, y, bz1 + (1 - r / (W * 0.4)) * bh * 0.5 + 2, W * 0.03, 10); } for (const [x, y, z] of [[-0.12, -0.05, 0.3], [0.14, 0.02, 0.38], [0.02, 0.06, 0.34]]) a.ell(cx + x * W, yc + y * D, bz1 + bh * z, W * 0.025, W * 0.025, W * 0.03, 6, 4); a.circ(cx, yc, W * 0.32, 'EQUIP-DETAIL'); }
    a.rect(X0, YF, X1, YB); a.line(X0, yc, X1, yc, 'EQUIP-DETAIL'); a.log('Added the body, domed or opened lid, straps, corner plates, lock, handles, feet and the coin heap if open (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic toy spaceship',
  desc: (v) => v.kind === 'rocket' ? 'Retro rocket: a rounded fuselage with a pointed nose cone, three round portholes, four swept fins that act as landing legs, and a flared engine bell with a ring.'
    : v.kind === 'saucer' ? 'Flying saucer on three legs: a wide hull disc with a rim ring of lights, a clear dome on top, a belly pod and an antenna.'
    : 'Round pod ship: a ball-shaped crew pod with a front window, an equator ring, two side engine pods, a rear fin and three landing feet.',
  vs: [
    ['retro rocket, 60 in', 24, 24, 60, 0, { kind: 'rocket' }],
    ['flying saucer, 40 in', 40, 40, 20, 0, { kind: 'saucer' }],
    ['pod ship, 30 in', 36, 24, 28, 0, { kind: 'pod' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2;
    if (v.kind === 'rocket') {
      const R = W * 0.22, fz = H * 0.16;
      lathe(a, cx, yc, Z0 + fz, [[0, R * 0.8], [H * 0.03, R], [H * 0.5, R], [H * 0.66, R * 0.8], [H * 0.76, R * 0.42], [H * 0.82, R * 0.1], [H * 0.84, 0.01]].map(([z, r]) => [z, r]), 24);
      lathe(a, cx, yc, Z0 + H * 0.06, [[0, R * 0.5], [H * 0.04, R * 0.62], [H * 0.1, R * 0.78]], 20);
      for (const z of [0.3, 0.5]) a.ycyl(yc - R - 3, yc - R + 2, cx, Z0 + H * z, R * 0.28, 14), a.ycyl(yc - R - 4, yc - R - 3, cx, Z0 + H * z, R * 0.2, 14);
      a.ycyl(yc - R * 0.9 - 3, yc - R * 0.9, cx, Z0 + H * 0.64, R * 0.2, 12); for (const z of [0.22, 0.55]) a.cyl(cx, yc, Z0 + H * z, Z0 + H * z + H * 0.015, R * 1.04, 20);
      for (const s of [-1, 1]) { prismY(a, [[cx + s * R * 0.9, Z0 + H * 0.5], [cx + s * W / 2, Z0], [cx + s * W / 2, Z0 + H * 0.04], [cx + s * R * 0.9, Z0 + H * 0.2]], yc - 3, yc + 3); prismX(a, [[yc + s * R * 0.9, Z0 + H * 0.5], [yc + s * D / 2, Z0], [yc + s * D / 2, Z0 + H * 0.04], [yc + s * R * 0.9, Z0 + H * 0.2]], cx - 3, cx + 3); }
      a.circ(cx, yc, R); a.circ(cx, yc, R * 0.5, 'EQUIP-DETAIL'); a.line(cx - W / 2, yc, cx + W / 2, yc); a.line(cx, YF, cx, YB);
    } else if (v.kind === 'saucer') {
      const R = W / 2, hz = Z0 + H * 0.34;
      lathe(a, cx, yc, hz, [[-H * 0.12, R * 0.35], [-H * 0.06, R * 0.7], [0, R * 0.98], [H * 0.06, R], [H * 0.12, R * 0.6], [H * 0.18, R * 0.38]], 28);
      a.ell(cx, yc, hz + H * 0.17, R * 0.38, R * 0.38, H * 0.2, 20, 10); a.ell(cx, yc, hz - H * 0.13, R * 0.25, R * 0.25, H * 0.08, 14, 6);
      for (let i = 0; i < 12; i++) { const t = (i * TAU) / 12; ball(a, cx + R * 0.86 * m.cos(t), yc + R * 0.86 * m.sin(t), hz + H * 0.08, R * 0.04, 6, 4); }
      for (let i = 0; i < 3; i++) { const t = (i * TAU) / 3 - m.PI / 2, lx = cx + R * 0.6 * m.cos(t), ly = yc + R * 0.6 * m.sin(t); a.tube([[cx + R * 0.32 * m.cos(t), yc + R * 0.32 * m.sin(t), hz - H * 0.08], [lx, ly, Z0 + H * 0.03]], [R * 0.035, R * 0.03], 8); a.cyl(lx, ly, Z0, Z0 + H * 0.03, R * 0.1, 12); a.circ(lx, ly, R * 0.1, 'EQUIP-DETAIL'); }
      a.cyl(cx, yc, hz + H * 0.35, Z0 + H, R * 0.012, 6); ball(a, cx, yc, Z0 + H - 1, R * 0.03, 6, 4); a.circ(cx, yc, R); a.circ(cx, yc, R * 0.86, 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.38, 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.04, 'EQUIP-DETAIL');
    } else {
      const R = D * 0.38, zc = Z0 + H * 0.5;
      ball(a, cx, yc, zc, R, 24, 14); a.ycyl(yc - R - 2, yc - R * 0.6, cx, zc + R * 0.1, R * 0.45, 16);
      a.tube(Array.from({ length: 25 }, (_, i) => [cx + (R + 1) * m.cos((i / 24) * TAU), yc + (R + 1) * m.sin((i / 24) * TAU), zc]), Array(25).fill(R * 0.07), 8);
      for (const s of [-1, 1]) { a.tube([[cx + s * R * 0.95, yc, zc - R * 0.1], [cx + s * W * 0.34, yc, zc - R * 0.1]], [R * 0.1, R * 0.1], 8); a.xcyl(cx + s * W * 0.34 - (s > 0 ? 0 : R * 0.0) - R * 0.35, cx + s * W * 0.34 + R * 0.35, yc, zc - R * 0.1, R * 0.3, 14); a.ell(cx + s * W * 0.34, yc + R * 0.4, zc - R * 0.1, R * 0.25, R * 0.12, R * 0.25, 10, 6); a.rect(cx + s * W * 0.34 - R * 0.35, yc - R * 0.3, cx + s * W * 0.34 + R * 0.35, yc + R * 0.5, 'EQUIP-DETAIL'); }
      prismX(a, [[yc + R * 0.5, zc + R * 0.5], [YB, zc + R * 0.9], [YB, zc + R * 1.0], [yc + R * 0.9, zc + R * 0.2]], cx - 2.5, cx + 2.5);
      for (let i = 0; i < 3; i++) { const t = (i * TAU) / 3 - m.PI / 2, lx = cx + R * 0.7 * m.cos(t), ly = yc + R * 0.7 * m.sin(t); a.tube([[cx + R * 0.45 * m.cos(t), yc + R * 0.45 * m.sin(t), zc - R * 0.8], [lx, ly, Z0 + H * 0.03]], [R * 0.06, R * 0.05], 8); a.cyl(lx, ly, Z0, Z0 + H * 0.03, R * 0.16, 12); }
      a.circ(cx, yc, R); a.circ(cx, yc - R * 0.8, R * 0.45, 'EQUIP-DETAIL'); a.line(cx, yc, cx, YB); a.outline('EQUIP-HIDDEN');
    }
    a.log('Added the hull, window or portholes, engines, fins or legs and the ring or antenna details (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic crystal formation',
  desc: (v) => v.kind === 'single' ? 'Single six-sided crystal point with a pointed tip standing on a small rough rock base.' : v.kind === 'cluster' ? 'Cluster of crystal points of different lengths, leaning out from a shared rock base, each six-sided with a pointed tip.' : v.kind === 'geode' ? 'Half geode: an oval rock shell with a hollow-looking centre filled with many small six-sided crystals, standing on a short stand ring.' : 'Floating double-pointed crystal above a stone base ring, with three small shards circling it.',
  vs: [
    ['single point, 12 in', 5, 5, 12, 0, { kind: 'single' }],
    ['cluster of seven, 18 in', 14, 12, 18, 0, { kind: 'cluster', n: 7 }],
    ['half geode on stand, 14 in', 14, 8, 14, 0, { kind: 'geode' }],
    ['floating crystal on base, 30 in', 14, 14, 30, 0, { kind: 'float' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, W, D, H } = a, yc = (YF + YB) / 2;
    const xtal = (x, y, z, tx, ty, L, r) => { const len = m.hypot(tx, ty, 1), dx = tx / len * L, dy = ty / len * L, dz = L / len; a.tube([[x, y, z], [x + dx * 0.72, y + dy * 0.72, z + dz * 0.72], [x + dx, y + dy, z + dz]], [r, r, 0.01], 6); };
    if (v.kind === 'single') { a.ell(cx, yc, Z0 + H * 0.05, W * 0.48, D * 0.46, H * 0.06, 12, 6); xtal(cx, yc, Z0 + H * 0.06, 0.05, 0, H * 0.93, W * 0.17); xtal(cx + W * 0.2, yc + 5, Z0 + H * 0.07, 0.4, 0.1, H * 0.35, W * 0.09); a.circ(cx, yc, W * 0.17, 'EQUIP-DETAIL'); a.ellp(cx, yc, W * 0.48, D * 0.46); }
    else if (v.kind === 'cluster') {
      a.ell(cx, yc, Z0 + H * 0.06, W * 0.48, D * 0.46, H * 0.08, 14, 7);
      for (let i = 0; i < v.n; i++) { const t = i * 2.4 + 0.5, rr = i === 0 ? 0 : W * 0.2, k = i === 0 ? 1 : 0.55 + 0.4 * ((i * 37) % 10) / 10; const x = cx + rr * m.cos(t), y = yc + rr * 0.8 * m.sin(t), L = H * 0.9 * k; xtal(x, y, Z0 + H * 0.07, i === 0 ? 0 : 0.35 * m.cos(t), i === 0 ? 0 : 0.35 * m.sin(t) * 0.9, L, W * (i === 0 ? 0.11 : 0.07)); a.circ(x, y, W * 0.07, 'EQUIP-DETAIL'); }
      a.ellp(cx, yc, W * 0.48, D * 0.46);
    } else if (v.kind === 'geode') {
      const rz = H * 0.42, zc = Z0 + H * 0.4; a.ell(cx, yc, zc, W * 0.48, D * 0.46, rz, 20, 10);
      a.tube([[cx, yc, Z0], [cx, yc, Z0 + H * 0.1]], [W * 0.38, W * 0.34], 22); a.tube([[cx, yc, Z0 + H * 0.1], [cx, yc, Z0 + H * 0.14]], [W * 0.34, W * 0.33], 22);
      for (let i = 0; i < 14; i++) { const t = (i / 14) * TAU + 0.3, rr = W * 0.3 * (0.3 + 0.7 * ((i * 53) % 10) / 10), x = cx + rr * m.cos(t), z = zc + rz * 0.2 + rr * 0.3 * m.sin(t); xtal(x, yc - D * 0.3 + (rr / W) * 5, z, m.cos(t) * 0.6, -1, H * 0.2 * (0.6 + 0.4 * ((i * 31) % 10) / 10), W * 0.035); }
      a.ellp(cx, yc, W * 0.48, D * 0.46); a.ellp(cx, yc, W * 0.3, D * 0.28, 'EQUIP-DETAIL');
    } else {
      const bz = Z0 + H * 0.08; a.tube([[cx, yc, Z0], [cx, yc, bz]], [W * 0.46, W * 0.38], 24); a.tube([[cx, yc, bz], [cx, yc, bz + H * 0.02]], [W * 0.3, W * 0.3], 24);
      const zc = Z0 + H * 0.55, r = W * 0.15; a.tube([[cx, yc, zc - H * 0.34], [cx, yc, zc - H * 0.2], [cx, yc, zc + H * 0.2], [cx, yc, zc + H * 0.38]], [0.01, r, r, 0.01], 6);
      for (let i = 0; i < 3; i++) { const t = (i * TAU) / 3 + 0.5, x = cx + W * 0.36 * m.cos(t), y = yc + W * 0.36 * m.sin(t), z = Z0 + H * (0.35 + 0.18 * i); a.tube([[x, y, z - H * 0.06], [x, y, z], [x, y, z + H * 0.06]], [0.01, W * 0.04, 0.01], 5); a.circ(x, y, W * 0.04, 'EQUIP-DETAIL'); }
      a.circ(cx, yc, W * 0.46); a.circ(cx, yc, W * 0.3, 'EQUIP-DETAIL'); a.circ(cx, yc, r, 'EQUIP-DETAIL');
    }
    a.log('Added the six-sided crystal points, tips and rock or stone base (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic potion bottle',
  desc: (v) => `${v.kind === 'round' ? 'Round-bottom potion flask with a long neck, a cork stopper and a wax collar' : v.kind === 'cone' ? 'Conical potion flask with a short neck, a cork stopper and a ribbon tied round the neck' : 'Tall square-shouldered potion bottle with a ball stopper, a label plate on the front and a thick base'}, with a rounded liquid surface drawn inside the glass line.`,
  vs: [
    ['round flask, 6 in', 3.4, 3.4, 6, 0, { kind: 'round' }],
    ['conical flask, 8 in', 4.5, 4.5, 8, 0, { kind: 'cone' }],
    ['tall bottle, 12 in', 3.6, 3.6, 12, 0, { kind: 'tall' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, W, D, H } = a, yc = (YF + YB) / 2, R = W / 2 * 0.97;
    if (v.kind === 'round') {
      const br = R, bz = Z0 + br, nr = R * 0.25;
      ball(a, cx, yc, bz, br, 24, 14); a.tube([[cx, yc, bz + br * 0.85], [cx, yc, Z0 + H * 0.62], [cx, yc, Z0 + H * 0.82]], [nr * 1.8, nr * 1.1, nr * 1.05], 18); a.tube([[cx, yc, Z0 + H * 0.82], [cx, yc, Z0 + H * 0.84], [cx, yc, Z0 + H * 0.86]], [nr * 1.35, nr * 1.4, nr * 1.2], 18);
      a.tube([[cx, yc, Z0 + H * 0.84], [cx, yc, Z0 + H * 0.95]], [nr * 0.95, nr * 1.05], 14); a.cyl(cx, yc, Z0 + H * 0.88, Z0 + H * 0.9, nr * 1.25, 14); a.circ(cx, yc, br); a.circ(cx, yc, nr * 1.4, 'EQUIP-DETAIL'); a.circ(cx, yc, br * 0.85, 'EQUIP-DETAIL');
      a.cyl(cx, yc, Z0, Z0 + 3, br * 0.4, 12);
    } else if (v.kind === 'cone') {
      lathe(a, cx, yc, Z0, [[0, R * 0.92], [H * 0.02, R], [H * 0.55, R * 0.4], [H * 0.62, R * 0.22], [H * 0.8, R * 0.2], [H * 0.82, R * 0.26], [H * 0.84, R * 0.26]], 24);
      lathe(a, cx, yc, Z0 + H * 0.82, [[0, R * 0.19], [H * 0.12, R * 0.2], [H * 0.14, R * 0.17]], 14);
      a.tube([[cx, yc, Z0 + H * 0.7], [cx, yc, Z0 + H * 0.74]], [R * 0.28, R * 0.28], 14); a.box(cx + R * 0.2, yc - 3, Z0 + H * 0.6, cx + R * 0.42, yc + 3, Z0 + H * 0.72);
      a.circ(cx, yc, R); a.circ(cx, yc, R * 0.5, 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.2, 'EQUIP-DETAIL');
    } else {
      const w2 = R * 0.9; a.box(cx - w2, yc - w2, Z0, cx + w2, yc + w2, Z0 + H * 0.12); a.box(cx - w2 * 0.88, yc - w2 * 0.88, Z0 + H * 0.12, cx + w2 * 0.88, yc + w2 * 0.88, Z0 + H * 0.64);
      a.tube([[cx, yc, Z0 + H * 0.64], [cx, yc, Z0 + H * 0.7], [cx, yc, Z0 + H * 0.78]], [R * 0.62, R * 0.3, R * 0.27], 16); a.tube([[cx, yc, Z0 + H * 0.78], [cx, yc, Z0 + H * 0.8], [cx, yc, Z0 + H * 0.82]], [R * 0.34, R * 0.36, R * 0.3], 16);
      ball(a, cx, yc, Z0 + H * 0.88, H * 0.06, 14, 8); a.box(cx - w2 * 0.6, yc - w2 * 0.88 - 2, Z0 + H * 0.24, cx + w2 * 0.6, yc - w2 * 0.88, Z0 + H * 0.5);
      a.rect(cx - w2, yc - w2, cx + w2, yc + w2); a.rect(cx - w2 * 0.88, yc - w2 * 0.88, cx + w2 * 0.88, yc + w2 * 0.88, 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.27, 'EQUIP-DETAIL');
    }
    a.log('Added the glass body, neck, stopper and the collar, ribbon or label of this bottle (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic fantasy portal',
  desc: (v) => v.kind === 'ring' ? 'Standing stone ring portal: a round ring of twelve carved stone blocks on two base feet, a thin disc of film across the opening and a row of rune marks on the ring.' : 'Arch portal: two tall pillars with bases and capitals, a rounded lintel arch with a keystone, a stepped plinth and a thin film across the opening.',
  vs: [
    ['stone ring, 96 in', 96, 20, 108, 0, { kind: 'ring' }],
    ['arch, 84 in', 72, 16, 96, 0, { kind: 'arch' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2;
    if (v.kind === 'ring') {
      const R = W * 0.44, zc = Z0 + H * 0.5 + H * 0.03, t = D * 0.4;
      a.box(cx - W * 0.3, YF, Z0, cx + W * 0.3, YB, Z0 + H * 0.03); a.box(cx - W * 0.14, YF + 2, Z0 + H * 0.03, cx + W * 0.14, YB - 2, zc - R * 0.9);
      a.rect(cx - W * 0.3, YF, cx + W * 0.3, YB); a.rect(cx - W * 0.14, YF + 2, cx + W * 0.14, YB - 2, 'EQUIP-DETAIL');
      for (let i = 0; i < 12; i++) { const t0 = (i / 12) * TAU, t1 = ((i + 1) / 12) * TAU, p = (tt, rr) => [cx + rr * m.cos(tt), zc + rr * m.sin(tt)]; prismY(a, [p(t0 + 0.02, R - W * 0.05), p(t1 - 0.02, R - W * 0.05), p(t1 - 0.02, R + W * 0.05), p(t0 + 0.02, R + W * 0.05)], yc - t, yc + t); const tm = (t0 + t1) / 2; a.box(cx + (R + W * 0.05) * m.cos(tm) - 1.5, yc - t - 1, zc + (R + W * 0.05) * m.sin(tm) - 1.5, cx + (R + W * 0.05) * m.cos(tm) + 1.5, yc - t + 0, zc + (R + W * 0.05) * m.sin(tm) + 1.5); }
      a.tube([[cx, yc - 0.6, zc], [cx, yc + 0.6, zc]], [R - W * 0.05, R - W * 0.05], 36); a.rect(cx - W * 0.5, yc - t, cx + W * 0.5, yc + t, 'EQUIP-DETAIL');
    } else {
      const pw = W * 0.14, ph = H * 0.78, ih = H - 2 * 0, bz = Z0 + H * 0.06;
      a.box(cx - W / 2, YF, Z0, cx + W / 2, YB, bz); a.box(cx - W * 0.46, YF + 1, Z0 + H * 0.03, cx + W * 0.46, YB - 1, bz + 1);
      for (const s of [-1, 1]) { const x = cx + s * (W / 2 - pw * 0.9); a.box(x - pw * 0.7, YF + 1, bz, x + pw * 0.7, YB - 1, bz + H * 0.05); a.box(x - pw * 0.5, yc - D * 0.4, bz + H * 0.05, x + pw * 0.5, yc + D * 0.4, Z0 + ph); a.box(x - pw * 0.75, YF + 1, Z0 + ph, x + pw * 0.75, YB - 1, Z0 + ph + H * 0.04); a.rect(x - pw * 0.7, YF + 1, x + pw * 0.7, YB - 1, 'EQUIP-DETAIL'); }
      const ar = W / 2 - pw * 0.9 - pw * 0.7 + pw * 0.45, az = Z0 + ph + H * 0.04, pts = []; for (let i = 0; i <= 12; i++) { const t = m.PI - (m.PI * i) / 12; pts.push([cx + (W / 2 - pw * 0.9) * m.cos(t), az + (H - (az - Z0)) * 0.98 * m.sin(t)]); }
      for (let i = 0; i < 12; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], k = 0.9; prismY(a, [[x0, z0], [x1, z1], [cx + (x1 - cx) * k, az + (z1 - az) * k], [cx + (x0 - cx) * k, az + (z0 - az) * k]], yc - D * 0.38, yc + D * 0.38); }
      a.box(cx - pw * 0.4, yc - D * 0.45, Z0 + H - pw * 0.9, cx + pw * 0.4, yc + D * 0.45, Z0 + H);
      a.box(cx - (W / 2 - pw * 1.6), yc - 0.6, bz + H * 0.05, cx + (W / 2 - pw * 1.6), yc + 0.6, Z0 + ph + 2); a.rect(cx - W / 2 + pw * 1.6, yc - 0.6, cx + W / 2 - pw * 1.6, yc + 0.6, 'EQUIP-DETAIL'); a.outline();
    }
    a.log('Added the ring or arch stonework, base, film across the opening and the carved details (plan and 3D).');
  } }),

fam({ cat: 'fun/fantasy', title: 'Generic fantasy throne',
  desc: (v) => `${v.tall ? 'High-backed throne with a tall pointed back, two pointed finials, a row of studs along the back, ' : 'Low throne with a rounded-top back, '}padded seat, two armrests ending in ball caps, turned front legs, a footstool and ${v.steps} dais steps.`,
  vs: [
    ['high-back, 84 in', 40, 40, 84, 0, { tall: true, steps: 3 }],
    ['low, 54 in', 34, 34, 54, 0, { tall: false, steps: 2 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, U = IN; let z = Z0; const sdh = 5 * U;
    for (let i = 0; i < v.steps; i++) { const ins = i * D * 0.06; a.box(X0, YF + ins, z, X1, YB, z + sdh); z += sdh; a.rect(X0, YF + ins, X1, YB, i ? 'EQUIP-DETAIL' : 'EQUIP'); }
    const tw = W * 0.56, x0 = cx - tw / 2, x1 = cx + tw / 2, sy0 = yc - D * 0.08, sy1 = YB - D * 0.05, st = z + 18 * U * (H / (84 * U)) , bt = 3 * U;
    const legs = (sx) => { const x = cx + sx * (tw / 2 - 2 * U); a.tube([[x, sy0 + 2 * U, z], [x, sy0 + 2 * U, z + 5 * U], [x, sy0 + 2 * U, z + 6.5 * U], [x, sy0 + 2 * U, st - bt]], [2.2 * U, 3 * U, 2 * U, 2.6 * U], 10); a.box(x - 2.5 * U, sy1 - 5 * U, z, x + 2.5 * U, sy1, st - bt); a.circ(x, sy0 + 2 * U, 2.6 * U, 'EQUIP-DETAIL'); };
    legs(-1); legs(1);
    a.box(x0, sy0, st - bt, x1, sy1, st); a.ell(cx, (sy0 + sy1) / 2, st + 0.8 * U, tw * 0.47, (sy1 - sy0) / 2 * 0.96, 3 * U, 16, 6);
    const bz0 = st, bh = Z0 + H - bz0, by0 = sy1 - 4 * U;
    const bk = v.tall ? [[x0 - 2 * U, bz0], [x1 + 2 * U, bz0], [x1 + 2 * U, bz0 + bh * 0.62], [cx, bz0 + bh], [x0 - 2 * U, bz0 + bh * 0.62]] : [[x0 - 2 * U, bz0], [x1 + 2 * U, bz0], [x1 + 2 * U, bz0 + bh * 0.78], [cx + tw * 0.25, bz0 + bh * 0.97], [cx - tw * 0.25, bz0 + bh * 0.97], [x0 - 2 * U, bz0 + bh * 0.78]];
    prismY(a, bk, by0, sy1); prismY(a, bk.map(([x, zz]) => [cx + (x - cx) * 0.78, bz0 + 2 * U + (zz - bz0) * 0.84]), by0 - 1.5 * U, by0 + 0.2);
    if (v.tall) { for (const sx of [-1, 1]) { const fx = cx + sx * (tw / 2 + 1.2 * U); a.cyl(fx, sy1 - 2 * U, bz0 + bh * 0.58, bz0 + bh * 0.72, 1.6 * U, 10); a.cone(fx, sy1 - 2 * U, bz0 + bh * 0.72, bz0 + bh * 0.84, 2 * U, 0.01, 10); } for (let i = 0; i < 7; i++) { const t = m.PI * (0.12 + 0.76 * i / 6); ball(a, cx + tw * 0.4 * m.cos(t), by0 - 1.5 * U, bz0 + bh * 0.52 + bh * 0.36 * m.sin(t), 1.1 * U, 8, 5); } }
    for (const sx of [-1, 1]) { const ax = cx + sx * (tw / 2 + 1.2 * U); a.box(ax - 1.8 * U, sy0 + 1 * U, st + 8 * U, ax + 1.8 * U, sy1 - 3 * U, st + 10 * U); a.box(ax - 1.6 * U, sy1 - 6 * U, st, ax + 1.6 * U, sy1 - 3 * U, st + 10 * U); a.tube([[ax, sy0 + 2 * U, st], [ax, sy0 + 2 * U, st + 8 * U]], [1.2 * U, 1.2 * U], 8); ball(a, ax, sy0 + 1.4 * U, st + 11 * U, 2 * U, 10, 6); a.rect(ax - 1.8 * U, sy0, ax + 1.8 * U, sy1, 'EQUIP-DETAIL'); }
    a.box(cx - tw * 0.28, YF + D * 0.1, z, cx + tw * 0.28, YF + D * 0.26, z + 6 * U); a.rect(cx - tw * 0.28, YF + D * 0.1, cx + tw * 0.28, YF + D * 0.26, 'EQUIP-DETAIL');
    a.rect(x0, sy0, x1, sy1, 'EQUIP-DETAIL'); a.log('Added the dais steps, seat with cushion, back with finials, armrests with ball caps, legs and footstool (plan and 3D).');
  } }),
];

/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, speedrun. Original geometry; generic shapes, no franchise, character, brand or game. */
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

export default [
// ============================================================================================ speedrun/setups
fam({ cat: 'speedrun/setups', title: 'Generic gaming desk',
  desc: (v) => v.kind === 'L' ? 'L-shaped gaming desk: a main top with a return wing, two panel legs, an under-top cable tray, two cable grommets, a cup ring and a headphone hook.'
    : v.kind === 'stand' ? 'Sit-stand gaming desk raised to standing height: a one-piece top on two telescoping legs with foot bars and a cross brace, a front control paddle, a cable tray, grommets and a cup ring.'
    : `Straight gaming desk with a ${v.riser ? 'raised monitor shelf on two posts, ' : ''}thick top on two panel legs with foot bars, a rear cross rail, an under-top cable tray, two cable grommets, a cup ring and a headphone hook.`,
  vs: [
    ['straight, 48 in', 48, 24, 30, 0, { kind: 's' }],
    ['straight with monitor shelf, 60 in', 60, 27, 36, 0, { kind: 's', riser: true }],
    ['straight with monitor shelf, 72 in', 72, 30, 36, 0, { kind: 's', riser: true }],
    ['L-shaped corner, 60 x 48 in', 60, 48, 30, 0, { kind: 'L' }],
    ['sit-stand frame, 60 in, raised', 60, 28, 46, 0, { kind: 'stand' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, tt = (v.kind === 'stand' ? 1 : 1.2) * IN, ht = (v.kind === 'stand' ? 45 : 29.5) * IN, zt = Z0 + ht;
    const ret = 24 * IN;
    if (v.kind === 'L') { a.box(X0, YB - 24 * IN, zt - tt, X1, YB, zt); a.box(X1 - ret, YF, zt - tt, X1, YB - 24 * IN, zt); a.poly([[X0, YB], [X1, YB], [X1, YF], [X1 - ret, YF], [X1 - ret, YB - 24 * IN], [X0, YB - 24 * IN]]); a.line(X1 - ret, YB - 24 * IN, X1, YB - 24 * IN, 'EQUIP-DETAIL'); }
    else { a.box(X0, YF, zt - tt, X1, YB, zt); a.outline(); }
    a.rect(X0 + 1 * IN, YF + 1 * IN, X1 - 1 * IN, YB - 1 * IN, 'EQUIP-HIDDEN');
    const legX = [X0 + 4 * IN, X1 - 4 * IN];
    for (const x of legX) {
      if (v.kind === 'stand') { a.box(x - 1.6 * IN, YF + 3 * IN, Z0, x + 1.6 * IN, YB - 3 * IN, Z0 + 2.2 * IN); a.box(x - 1.5 * IN, yc - 1.5 * IN, Z0 + 2.2 * IN, x + 1.5 * IN, yc + 1.5 * IN, Z0 + ht * 0.62); a.box(x - 1.15 * IN, yc - 1.15 * IN, Z0 + ht * 0.62, x + 1.15 * IN, yc + 1.15 * IN, zt - tt); a.rect(x - 1.6 * IN, YF + 3 * IN, x + 1.6 * IN, YB - 3 * IN, 'EQUIP-HIDDEN'); }
      else if (v.kind === 'L' && x > cx) { a.box(x - 0.8 * IN, YF + 3 * IN, Z0 + 1.5 * IN, x + 0.8 * IN, YB - 3 * IN, zt - tt); a.box(x - 1.5 * IN, YF + 2 * IN, Z0, x + 1.5 * IN, YB - 2 * IN, Z0 + 1.5 * IN); }
      else { const y0 = v.kind === 'L' ? YB - 22 * IN : YF + D * 0.1, y1 = YB - (v.kind === 'L' ? 2 : D * 0.1 / IN) * (v.kind === 'L' ? IN : IN); a.box(x - 0.8 * IN, y0, Z0 + 1.5 * IN, x + 0.8 * IN, y1, zt - tt); a.box(x - 1.5 * IN, y0 - 1 * IN, Z0, x + 1.5 * IN, y1 + 1 * IN, Z0 + 1.5 * IN); }
    }
    a.box(legX[0], YB - 3 * IN, zt - tt - 5 * IN, legX[1], YB - 2 * IN, zt - tt); if (v.kind === 'stand') a.box(legX[0], yc - 1 * IN, zt - tt - 3 * IN, legX[1], yc + 1 * IN, zt - tt);
    const trayB = v.kind === 'L' ? YB : YB;
    a.box(X0 + 12 * IN, trayB - 7 * IN, zt - tt - 3.5 * IN, X1 - (v.kind === 'L' ? ret + 4 * IN : 12 * IN), trayB - 1 * IN, zt - tt - 3 * IN); a.box(X0 + 12 * IN, trayB - 7 * IN, zt - tt - 3.5 * IN, X0 + 12 * IN + 0.4 * IN, trayB - 1 * IN, zt - tt); a.box(X1 - (v.kind === 'L' ? ret + 4 * IN : 12 * IN) - 0.4 * IN, trayB - 7 * IN, zt - tt - 3.5 * IN, X1 - (v.kind === 'L' ? ret + 4 * IN : 12 * IN), trayB - 1 * IN, zt - tt);
    for (const s of [-1, 1]) a.circ(cx + s * W * 0.22, YB - 3 * IN, 1.2 * IN, 'EQUIP-DETAIL');
    a.cyl(X0 + 4 * IN, YF + 4 * IN, zt, zt + 0.3 * IN, 1.9 * IN, 16); a.cyl(X0 + 4 * IN, YF + 4 * IN, zt + 0.3 * IN, zt + 0.5 * IN, 1.5 * IN, 16); a.circ(X0 + 4 * IN, YF + 4 * IN, 1.9 * IN, 'EQUIP-DETAIL');
    a.tube([[X0 + 1.5 * IN, YF + 6 * IN, zt - tt], [X0 + 1.5 * IN, YF + 6 * IN, zt - tt - 2 * IN], [X0 + 3 * IN, YF + 6 * IN, zt - tt - 5 * IN], [X0 + 5 * IN, YF + 6 * IN, zt - tt - 4 * IN]], [0.45 * IN, 0.45 * IN, 0.4 * IN, 0.4 * IN], 8);
    if (v.riser) { const rw = W * 0.7; a.box(cx - rw / 2, YB - 10 * IN, zt + 5 * IN, cx + rw / 2, YB - 1 * IN, zt + 6 * IN); for (const s of [-1, 1]) a.box(cx + s * (rw / 2 - 1.5 * IN) - 0.9 * IN, YB - 9 * IN, zt, cx + s * (rw / 2 - 1.5 * IN) + 0.9 * IN, YB - 2 * IN, zt + 5 * IN); a.rect(cx - rw / 2, YB - 10 * IN, cx + rw / 2, YB - 1 * IN, 'EQUIP-DETAIL'); }
    if (v.kind === 'stand') a.box(cx + W * 0.25, YF + 0.5 * IN, zt - tt - 1.2 * IN, cx + W * 0.25 + 4 * IN, YF + 3 * IN, zt - tt);
    a.log('Added the top, panel or telescoping legs with foot bars, cable tray, grommets, cup ring, headphone hook and monitor shelf where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/setups', title: 'Generic monitor and capture setup',
  desc: (v) => `Desk-top setup on a mat: ${v.n} ${v.diag} in monitor${v.n > 1 ? 's' : ''} on ${v.arm ? 'a clamp pole with swivel arms' : 'foot stands'}, a light bar, a keyboard and mouse on a pad, a capture box with two ports, and a boom mic arm${v.rack ? ', plus a three-unit capture rack at the right end' : ''}.`,
  vs: [
    ['single 24 in monitor, 30 in', 30, 16, 24, 0, { n: 1, diag: 24, arm: false }],
    ['dual 24 in monitors, 52 in', 52, 16, 24, 0, { n: 2, diag: 24, arm: false }],
    ['triple 27 in monitors on arms, 84 in', 84, 18, 28, 0, { n: 3, diag: 27, arm: true }],
    ['dual 27 in monitors with capture rack, 64 in', 64, 18, 28, 0, { n: 2, diag: 27, arm: true, rack: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, mw = v.diag * 0.872 * IN, mh = v.diag * 0.49 * IN, gap = 1 * IN, tot = v.n * mw + (v.n - 1) * gap, rackW = v.rack ? 12 * IN : 0;
    const x0 = X0 + (W - rackW - tot) / 2, ypf = YB - 9 * IN, zb = Z0 + (v.arm ? 6.5 : 4) * IN;
    a.box(X0, YF, Z0, X1, YB, Z0 + 0.12 * IN); a.outline();
    for (let i = 0; i < v.n; i++) {
      const x = x0 + i * (mw + gap), mx = x + mw / 2;
      panel(a, x, zb, mw, mh, ypf, 1.2 * IN);
      if (v.arm) { a.tube([[mx, ypf + 1.2 * IN, zb + mh * 0.5], [mx, YB - 3 * IN, zb + mh * 0.5 - 1 * IN]], [0.7 * IN, 0.7 * IN], 8); a.box(mx - 1.2 * IN, ypf + 1.2 * IN, zb + mh * 0.5 - 1.5 * IN, mx + 1.2 * IN, ypf + 2.6 * IN, zb + mh * 0.5 + 1.5 * IN); }
      else { a.box(mx - 1.2 * IN, ypf + 0.4 * IN, Z0 + 0.12 * IN, mx + 1.2 * IN, ypf + 1.2 * IN, zb + 1 * IN); a.box(mx - 4.2 * IN, ypf - 3 * IN, Z0 + 0.12 * IN, mx + 4.2 * IN, ypf + 4 * IN, Z0 + 0.7 * IN); a.rect(mx - 4.2 * IN, ypf - 3 * IN, mx + 4.2 * IN, ypf + 4 * IN, 'EQUIP-DETAIL'); }
      a.rect(x, ypf, x + mw, ypf + 1.2 * IN, 'EQUIP-DETAIL');
    }
    if (v.arm) for (let i = 0; i < v.n; i++) { const px = x0 + i * (mw + gap) + mw / 2; a.cyl(px, YB - 3 * IN, Z0 + 0.12 * IN, zb + mh * 0.5, 0.8 * IN, 12); a.box(px - 1.2 * IN, YB - 4.2 * IN, Z0 + 0.12 * IN, px + 1.2 * IN, YB - 1.8 * IN, Z0 + 0.7 * IN); a.circ(px, YB - 3 * IN, 1 * IN, 'EQUIP-DETAIL'); }
    const lw = tot * 0.55, lz = zb + mh + 1.2 * IN; a.box(x0 + (tot - lw) / 2, ypf + 0.2 * IN, lz, x0 + (tot + lw) / 2, ypf + 1.4 * IN, lz + 0.9 * IN);
    const kx = x0 + tot / 2 - 8.75 * IN, ky = YF + 3 * IN;
    a.box(kx, ky, Z0 + 0.12 * IN, kx + 17.5 * IN, ky + 5.5 * IN, Z0 + 0.12 * IN + 0.9 * IN);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) a.box(kx + 0.3 * IN + c * 1.2 * IN, ky + 0.3 * IN + r * 1.0 * IN, Z0 + 1.02 * IN, kx + 0.3 * IN + c * 1.2 * IN + 1.0 * IN, ky + 0.3 * IN + r * 1.0 * IN + 0.8 * IN, Z0 + 1.3 * IN);
    a.rect(kx, ky, kx + 17.5 * IN, ky + 5.5 * IN, 'EQUIP-DETAIL');
    const mxp = kx + 20.5 * IN; a.box(mxp - 4.5 * IN, ky - 1 * IN, Z0 + 0.12 * IN, mxp + 4.5 * IN, ky + 8 * IN, Z0 + 0.2 * IN); a.ell(mxp, ky + 3 * IN, Z0 + 0.2 * IN + 0.6 * IN, 1.1 * IN, 1.9 * IN, 0.65 * IN, 12, 6); a.rect(mxp - 4.5 * IN, ky - 1 * IN, mxp + 4.5 * IN, ky + 8 * IN, 'EQUIP-DETAIL');
    const cxp = mxp + 8 * IN > X1 - rackW - 4 * IN ? X1 - rackW - 4 * IN - 3 * IN : mxp + 8 * IN;
    a.box(cxp - 3 * IN, ky + 1 * IN, Z0 + 0.12 * IN, cxp + 3 * IN, ky + 5 * IN, Z0 + 1.5 * IN); for (const s of [-1, 1]) { a.ycyl(ky + 0.2 * IN, ky + 1 * IN, cxp + s * 1.3 * IN, Z0 + 0.8 * IN, 0.3 * IN, 8); a.circ(cxp + s * 1.3 * IN, ky + 0.6 * IN, 0.3 * IN, 'EQUIP-DETAIL'); } a.rect(cxp - 3 * IN, ky + 1 * IN, cxp + 3 * IN, ky + 5 * IN, 'EQUIP-DETAIL');
    a.tube([[X0 + 3 * IN, YB - 3 * IN, Z0 + 0.12 * IN], [X0 + 3 * IN, YB - 3 * IN, Z0 + H * 0.78], [X0 + 8 * IN, yc, Z0 + H * 0.82], [X0 + 12 * IN, YF + 4 * IN, Z0 + H * 0.6]], [0.45 * IN, 0.45 * IN, 0.4 * IN, 0.4 * IN], 8); a.ell(X0 + 12 * IN, YF + 4 * IN, Z0 + H * 0.57, 0.7 * IN, 0.7 * IN, 1.4 * IN, 10, 6); a.circ(X0 + 3 * IN, YB - 3 * IN, 0.8 * IN, 'EQUIP-DETAIL');
    if (v.rack) { const rx = X1 - rackW + 1 * IN, rw = rackW - 2 * IN, ry = YB - 12 * IN; for (const s of [0, 1]) a.box(rx + s * (rw - 0.6 * IN), ry, Z0 + 0.12 * IN, rx + s * (rw - 0.6 * IN) + 0.6 * IN, YB - 1 * IN, Z0 + 18 * IN);
      for (let i = 0; i < 3; i++) { const z = Z0 + 0.8 * IN + i * 5.5 * IN; a.box(rx + 0.6 * IN, ry, z, rx + rw - 0.6 * IN, YB - 1 * IN, z + 4.5 * IN); for (let k = 0; k < 3; k++) a.ycyl(ry - 1.2 * IN, ry, rx + 2.2 * IN + k * 2.3 * IN, z + 2.2 * IN, 0.6 * IN, 10); }
      a.box(rx, ry, Z0 + 18 * IN, rx + rw, YB - 1 * IN, Z0 + 18.6 * IN); a.rect(rx, ry, rx + rw, YB - 1 * IN, 'EQUIP-DETAIL'); }
    a.log('Added the mat, monitors with stands or arms, light bar, keyboard, mouse and pad, capture box, boom mic and rack where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/setups', title: 'Generic gaming chair',
  desc: (v) => v.kind === 'mesh' ? 'Ergonomic gaming chair: a framed mesh back with a lumbar bar and a separate headrest plate, a padded seat, two height-adjustable arms, a gas column and a five-star base on casters.'
    : `${v.kind === 'bucket' ? 'Racing-style bucket gaming chair' : 'Gaming chair with a pull-out footrest'}: a high shaped back with side wings, a head pillow and a lumbar pillow, a bolstered seat, two padded arms, a gas column and a five-star base on casters${v.kind === 'foot' ? ', and a folding footrest platform on a support arm at the front' : ''}.`,
  vs: [
    ['racing bucket, 52 in tall', 28, 28, 52, 0, { kind: 'bucket' }],
    ['ergonomic mesh back, 50 in tall', 27, 28, 50, 0, { kind: 'mesh' }],
    ['with footrest, 54 in tall', 28, 40, 54, 0, { kind: 'foot' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = v.kind === 'foot' ? YB - 14 * IN : (YF + YB) / 2, sz = Z0 + 17 * IN;
    a.cyl(cx, yc, Z0 + 5 * IN, Z0 + 7 * IN, 2.2 * IN, 14); a.cyl(cx, yc, Z0 + 7 * IN, sz - 0.5 * IN, 1.5 * IN, 12); a.cyl(cx, yc, Z0 + 8 * IN, Z0 + 12 * IN, 1.9 * IN, 12);
    for (let k = 0; k < 5; k++) { const t = m.PI / 2 + (k * TAU) / 5, ex = cx + 13 * IN * m.cos(t), ey = yc + 13 * IN * m.sin(t); a.tube([[cx, yc, Z0 + 5.5 * IN], [ex, ey, Z0 + 3.2 * IN]], [1.1 * IN, 0.7 * IN], 8); a.cyl(ex, ey, Z0 + 1.8 * IN, Z0 + 3.4 * IN, 0.3 * IN, 6); a.xcyl(ex - 0.5 * IN, ex + 0.5 * IN, ey, Z0 + 1 * IN, 1 * IN, 10); a.circ(ex, ey, 1 * IN, 'EQUIP-DETAIL'); a.line(cx, yc, ex, ey, 'EQUIP-DETAIL'); }
    a.box(cx - 10 * IN, yc - 10.5 * IN, sz, cx + 10 * IN, yc + 10 * IN, sz + 3 * IN); a.ell(cx, yc - 0.5 * IN, sz + 3 * IN, 9.5 * IN, 10 * IN, 1 * IN, 16, 6);
    if (v.kind !== 'mesh') for (const s of [-1, 1]) prismY(a, [[cx + s * 8.8 * IN, sz + 3 * IN], [cx + s * 11 * IN, sz + 3 * IN], [cx + s * 11.6 * IN, sz + 5.5 * IN], [cx + s * 9.4 * IN, sz + 5 * IN]], yc - 9 * IN, yc + 8 * IN);
    a.rect(cx - 10 * IN, yc - 10.5 * IN, cx + 10 * IN, yc + 10 * IN);
    const by = yc + 9 * IN;
    if (v.kind === 'mesh') {
      a.frame(cx - 9.5 * IN, sz + 4 * IN, cx + 9.5 * IN, sz + 26 * IN, by - 1.5 * IN, by + 0.5 * IN, 1.1 * IN); a.box(cx - 8.4 * IN, by - 0.3 * IN, sz + 5 * IN, cx + 8.4 * IN, by + 0.1 * IN, sz + 25 * IN);
      a.box(cx - 8 * IN, by - 2.4 * IN, sz + 9 * IN, cx + 8 * IN, by - 1.4 * IN, sz + 12 * IN); a.box(cx - 1 * IN, by - 1 * IN, sz, cx + 1 * IN, by + 0.5 * IN, sz + 8 * IN);
      a.box(cx - 6 * IN, by - 1 * IN, sz + 27 * IN, cx + 6 * IN, by + 0.8 * IN, sz + 33 * IN); a.box(cx - 0.8 * IN, by - 0.5 * IN, sz + 26 * IN, cx + 0.8 * IN, by + 0.5 * IN, sz + 27.2 * IN);
    } else {
      prismY(a, [[cx - 10 * IN, sz + 3 * IN], [cx + 10 * IN, sz + 3 * IN], [cx + 14.2 * IN, sz + 20 * IN], [cx + 10.5 * IN, sz + 29 * IN], [cx + 6 * IN, sz + 33 * IN], [cx - 6 * IN, sz + 33 * IN], [cx - 10.5 * IN, sz + 29 * IN], [cx - 14.2 * IN, sz + 20 * IN]], by - 2.6 * IN, by + 1.4 * IN);
      for (const s of [-1, 1]) prismX(a, [[by - 2.6 * IN, sz + 8 * IN], [by - 5.2 * IN, sz + 12 * IN], [by - 5 * IN, sz + 20 * IN], [by - 2.6 * IN, sz + 24 * IN]], cx + s * 11 * IN - 1.1 * IN, cx + s * 11 * IN + 1.1 * IN);
      a.ell(cx, by - 3.8 * IN, sz + 27 * IN, 5.5 * IN, 2.4 * IN, 3.4 * IN, 14, 8); a.ell(cx, by - 4 * IN, sz + 12 * IN, 5 * IN, 1.6 * IN, 3 * IN, 12, 6);
      a.line(cx - 14 * IN, by, cx + 14 * IN, by, 'EQUIP-DETAIL');
    }
    for (const s of [-1, 1]) { const ax = cx + s * 11.8 * IN; a.box(ax - 0.9 * IN, yc - 1.5 * IN, sz + 3 * IN, ax + 0.9 * IN, yc + 0.5 * IN, sz + 9.5 * IN); a.box(ax - 1.7 * IN, yc - 7 * IN, sz + 9.5 * IN, ax + 1.7 * IN, yc + 3 * IN, sz + 10.8 * IN); a.rect(ax - 1.7 * IN, yc - 7 * IN, ax + 1.7 * IN, yc + 3 * IN, 'EQUIP-DETAIL'); }
    if (v.kind === 'foot') { a.tube([[cx, yc - 6 * IN, Z0 + 12 * IN], [cx, YF + 9 * IN, Z0 + 9 * IN]], [0.8 * IN, 0.8 * IN], 8); a.box(cx - 8 * IN, YF + 0.5 * IN, Z0 + 8 * IN, cx + 8 * IN, YF + 11 * IN, Z0 + 9.3 * IN); a.rect(cx - 8 * IN, YF + 0.5 * IN, cx + 8 * IN, YF + 11 * IN, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.tube([[cx + s * 6 * IN, YF + 11 * IN, Z0 + 9.3 * IN], [cx + s * 6 * IN, YF + 11 * IN, Z0 + 12.5 * IN]], [0.5 * IN, 0.5 * IN], 6); }
    a.log('Added the five-star base on casters, gas column, seat, back, head and lumbar supports, arms and footrest where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/setups', title: 'Generic streaming booth',
  desc: (v) => `Open-front streaming booth on a raised floor: a back wall and two side walls lined with ${v.slats} vertical acoustic slats each, a ceiling panel, a ring light on a post, a desk with a boom mic arm and a monitor${v.green ? ', and a green backdrop panel hung on the back wall' : ''}${v.two ? ', for two seats with two desks and two mic arms' : ''}.`,
  vs: [
    ['one person, 60 in', 60, 48, 84, 0, { slats: 14, two: false }],
    ['two person, 96 in', 96, 60, 84, 0, { slats: 20, two: true }],
    ['with green backdrop, 72 in', 72, 54, 90, 0, { slats: 12, two: false, green: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, fh = 4 * IN, t = 3 * IN, wallTop = Z0 + H - 4 * IN;
    a.box(X0, YF, Z0, X1, YB, Z0 + fh);
    a.box(X0, YB - t, Z0 + fh, X1, YB, wallTop); a.box(X0, YF + 6 * IN, Z0 + fh, X0 + t, YB - t, wallTop); a.box(X1 - t, YF + 6 * IN, Z0 + fh, X1, YB - t, wallTop); a.box(X0, YF + 6 * IN, wallTop, X1, YB, Z0 + H);
    a.rect(X0, YB - t, X1, YB); a.rect(X0, YF + 6 * IN, X0 + t, YB - t); a.rect(X1 - t, YF + 6 * IN, X1, YB - t);
    const sl = (x0, x1, y, n, axis) => { for (let i = 0; i < n; i++) { const f = (i + 0.5) / n; if (axis === 'x') a.box(x0 + (x1 - x0) * f - 1.1 * IN, y - 1.6 * IN, Z0 + fh + 4 * IN, x0 + (x1 - x0) * f + 1.1 * IN, y, wallTop - 4 * IN); else a.box(y - 1.6 * IN, x0 + (x1 - x0) * f - 1.1 * IN, Z0 + fh + 4 * IN, y, x0 + (x1 - x0) * f + 1.1 * IN, wallTop - 4 * IN); } };
    sl(X0 + t, X1 - t, YB - t, v.slats, 'x');
    const ns = m.max(6, m.round(v.slats * 0.5)); sl(YF + 6 * IN + 1.5 * IN, YB - t - 1.5 * IN, X0 + t + 1.6 * IN, ns, 'y'); a.add([]); sl(YF + 6 * IN + 1.5 * IN, YB - t - 1.5 * IN, X1 - t, ns, 'y');
    if (v.green) a.box(X0 + t + 2 * IN, YB - t - 2.4 * IN, Z0 + fh + 2 * IN, X1 - t - 2 * IN, YB - t - 1.6 * IN, wallTop - 3 * IN);
    const seats = v.two ? [-1, 1] : [0];
    for (const s of seats) {
      const dx = cx + s * W * 0.25, dw = v.two ? W * 0.36 : W * 0.55, dz = Z0 + fh + 29 * IN;
      a.box(dx - dw / 2, YB - t - 24 * IN, dz - 1.2 * IN, dx + dw / 2, YB - t - 1 * IN, dz); for (const e of [-1, 1]) a.box(dx + e * (dw / 2 - 2 * IN) - 0.8 * IN, YB - t - 22 * IN, Z0 + fh, dx + e * (dw / 2 - 2 * IN) + 0.8 * IN, YB - t - 3 * IN, dz - 1.2 * IN); a.rect(dx - dw / 2, YB - t - 24 * IN, dx + dw / 2, YB - t - 1 * IN, 'EQUIP-DETAIL');
      const mw = 20.9 * IN; panel(a, dx - mw / 2, dz + 4 * IN, mw, 11.8 * IN, YB - t - 12 * IN, 1.2 * IN); a.box(dx - 1.2 * IN, YB - t - 11 * IN, dz, dx + 1.2 * IN, YB - t - 10 * IN, dz + 4.5 * IN); a.box(dx - 4 * IN, YB - t - 14 * IN, dz, dx + 4 * IN, YB - t - 8 * IN, dz + 0.5 * IN);
      a.tube([[dx + dw / 2 - 3 * IN, YB - t - 3 * IN, dz], [dx + dw / 2 - 3 * IN, YB - t - 3 * IN, dz + 20 * IN], [dx + 6 * IN, YB - t - 12 * IN, dz + 22 * IN], [dx + 5 * IN, YB - t - 20 * IN, dz + 17 * IN]], [0.45 * IN, 0.45 * IN, 0.4 * IN, 0.4 * IN], 8); a.ell(dx + 5 * IN, YB - t - 20 * IN, dz + 15.5 * IN, 0.8 * IN, 0.8 * IN, 1.6 * IN, 10, 6);
    }
    const rx = X0 + t + 8 * IN, ry = YF + 16 * IN, rz = Z0 + fh + 62 * IN; a.cyl(rx, ry, Z0 + fh, rz - 6 * IN, 0.6 * IN, 8); a.box(rx - 5 * IN, ry - 5 * IN, Z0 + fh, rx + 5 * IN, ry + 5 * IN, Z0 + fh + 1 * IN);
    a.tube(Array.from({ length: 21 }, (_, i) => [rx + 6.5 * IN * m.cos((i / 20) * TAU), ry - 1 * IN, rz + 6.5 * IN * m.sin((i / 20) * TAU)]), Array(21).fill(0.8 * IN), 8); a.circ(rx, ry, 0.9 * IN, 'EQUIP-DETAIL');
    a.line(X0, YF + 6 * IN, X1, YF + 6 * IN, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN'); a.log('Added the raised floor, three slatted walls, ceiling, desk or desks with monitor and mic arm, ring light and green backdrop where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/setups', title: 'Generic retro console station',
  desc: (v) => `Console station: a ${v.flat ? 'flat screen on a low media cabinet' : `${v.crt} in tube TV with a tapered back on a ${v.heavy ? 'heavy two-shelf stand' : 'wheeled two-shelf cart'}`}, a game console box with a cartridge slot and power button on the middle shelf, two controllers with cords, a row of cartridges on the lower shelf and a cable bundle.`,
  vs: [
    ['tube TV 14 in on cart', 24, 22, 40, 0, { crt: 14 }],
    ['tube TV 20 in on stand', 30, 26, 46, 0, { crt: 20 }],
    ['tube TV 27 in on heavy stand', 36, 28, 54, 0, { crt: 27, heavy: true }],
    ['flat 32 in screen on low cabinet', 44, 18, 40, 0, { flat: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, legH = (v.flat ? 14 : v.heavy ? 22 : 16) * IN, sh = legH + (v.flat ? 4 : 1.5) * IN;
    if (v.flat) { a.box(X0, YF, Z0 + 4 * IN, X1, YB, Z0 + 16 * IN); a.box(X0, YF, Z0 + 16 * IN, X1, YB, Z0 + 17 * IN); a.box(X0 + 2 * IN, YF + 0.5 * IN, Z0 + 4.5 * IN, cx - 1 * IN, YF + 1 * IN, Z0 + 15.5 * IN); a.box(cx + 1 * IN, YF + 0.5 * IN, Z0 + 4.5 * IN, X1 - 2 * IN, YF + 1 * IN, Z0 + 15.5 * IN); for (const s of [-1, 1]) a.box(cx + s * (W / 2 - 3 * IN) - 1 * IN, yc - 4 * IN, Z0, cx + s * (W / 2 - 3 * IN) + 1 * IN, yc + 4 * IN, Z0 + 4 * IN); a.outline(); a.line(X0, YF + 1 * IN, X1, YF + 1 * IN, 'EQUIP-DETAIL');
      a.box(cx - 2 * IN, YB - 7 * IN, Z0 + 17 * IN, cx + 2 * IN, YB - 5 * IN, Z0 + 21 * IN); const sw = 27.9 * IN, sh2 = 15.7 * IN; panel(a, cx - sw / 2, Z0 + 21 * IN, sw, sh2, YB - 7 * IN, 1 * IN); a.box(cx - 8 * IN, YB - 10 * IN, Z0 + 17 * IN, cx + 8 * IN, YB - 3 * IN, Z0 + 17.8 * IN);
      a.box(X0 + 4 * IN, yc - 7 * IN, Z0 + 17 * IN, X0 + 17 * IN, yc + 5 * IN, Z0 + 19.4 * IN); a.box(X0 + 8 * IN, YF + 0.5 * IN, Z0 + 5 * IN, X0 + 15 * IN, YF + 6 * IN, Z0 + 7 * IN);
    } else {
      const sw2 = 11 * IN * (v.crt / 14), sd = 14 * IN * (v.crt / 14) * 0.95, shw = W - 2 * IN;
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const lx = cx + sx * (shw / 2 - 1 * IN), ly = yc + sy * (D / 2 - 1 * IN); a.box(lx - 0.8 * IN, ly - 0.8 * IN, Z0 + (v.heavy ? 0 : 2 * IN), lx + 0.8 * IN, ly + 0.8 * IN, Z0 + sh); if (!v.heavy) { a.cyl(lx, ly, Z0 + 1.5 * IN, Z0 + 2.2 * IN, 0.3 * IN, 6); a.xcyl(lx - 0.4 * IN, lx + 0.4 * IN, ly, Z0 + 1 * IN, 1 * IN, 10); } }
      for (const z of [legH * 0.2 + (v.heavy ? 0 : 2 * IN), legH * 0.6]) a.box(cx - shw / 2, YF, Z0 + z, cx + shw / 2, YB, Z0 + z + 1.1 * IN);
      a.box(cx - shw / 2, YF, Z0 + sh - 1.5 * IN, cx + shw / 2, YB, Z0 + sh); a.rect(cx - shw / 2, YF, cx + shw / 2, YB);
      const tz = Z0 + sh, tw = 16.8 * IN * (v.crt / 14) * 0.9 * 1.0, th = 12.5 * IN * (v.crt / 14), tdp = D * 0.78;
      a.box(cx - tw / 2, YF + 3 * IN, tz, cx + tw / 2, YF + 3 * IN + tdp * 0.38, tz + th); prismX(a, [[YF + 3 * IN + tdp * 0.38, tz + th * 0.02], [YF + 3 * IN + tdp * 0.98, tz + th * 0.2], [YF + 3 * IN + tdp * 0.98, tz + th * 0.8], [YF + 3 * IN + tdp * 0.38, tz + th * 0.98]], cx - tw * 0.36, cx + tw * 0.36);
      a.frame(cx - tw / 2, tz, cx + tw / 2, tz + th, YF + 2.2 * IN, YF + 4 * IN, 1.2 * IN); a.ell(cx, YF + 2.6 * IN, tz + th * 0.52, tw * 0.4, 0.5 * IN, th * 0.4, 18, 8);
      for (let i = 0; i < 3; i++) a.ycyl(YF + 1.4 * IN, YF + 2.2 * IN, cx + tw * 0.34 + i * 1.2 * IN * 0 + 0 + (i - 1) * 0 * 1, tz + th * (0.78 - i * 0.18), 0.5 * IN, 10);
      a.rect(cx - tw / 2, YF + 3 * IN, cx + tw / 2, YF + 3 * IN + tdp * 0.38, 'EQUIP-DETAIL'); a.rect(cx - tw * 0.36, YF + 3 * IN + tdp * 0.38, cx + tw * 0.36, YF + 3 * IN + tdp * 0.98, 'EQUIP-DETAIL');
      a.box(cx - shw * 0.38, yc - 6 * IN, Z0 + legH * 0.6 + 1.1 * IN, cx + shw * 0.18, yc + 5 * IN, Z0 + legH * 0.6 + 4.2 * IN); a.box(cx - shw * 0.2, YF + 1 * IN, Z0 + legH * 0.6 + 2.6 * IN, cx + shw * 0.05, yc - 5 * IN, Z0 + legH * 0.6 + 3.4 * IN);
      for (let i = 0; i < 6; i++) a.box(cx - shw * 0.4 + i * 1.6 * IN, yc - 3 * IN, Z0 + legH * 0.2 + (v.heavy ? 0 : 2 * IN) + 1.1 * IN, cx - shw * 0.4 + i * 1.6 * IN + 1.2 * IN, yc + 1.5 * IN, Z0 + legH * 0.2 + (v.heavy ? 0 : 2 * IN) + 4.4 * IN);
      for (const s of [-1, 1]) { a.ell(cx + shw * 0.32 + s * 3 * IN, yc - 2 * IN, Z0 + legH * 0.6 + 1.9 * IN, 1.6 * IN, 2.4 * IN, 0.8 * IN, 10, 5); a.tube([[cx + shw * 0.32 + s * 3 * IN, yc - 4.2 * IN, Z0 + legH * 0.6 + 1.9 * IN], [cx + shw * 0.25, YF + 1 * IN, Z0 + legH * 0.6 + 1.2 * IN]], [0.2 * IN, 0.2 * IN], 5); }
    }
    a.log('Added the stand with shelves and wheels or legs, TV, console box, controllers, cartridges and cables (plan and 3D).');
  } }),

fam({ cat: 'speedrun/setups', title: 'Generic chroma backdrop stand',
  desc: (v) => v.ring ? 'Round collapsible chroma panel: a ring frame with a stretched fabric disc, two clamp arms on a single telescoping pole and a three-leg base.' : `Backdrop stand with a ${v.span} in cross bar carried on two telescoping poles, a three-leg tripod foot under each pole, locking collars and a stretched fabric panel clamped across the bar.`,
  vs: [
    ['stand and cross bar, 60 in', 84, 30, 78, 0, { span: 60 }],
    ['stand and cross bar, 96 in', 120, 30, 84, 0, { span: 96 }],
    ['round collapsible panel, 60 in', 60, 26, 78, 0, { ring: true, span: 60 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, legR = 13 * IN;
    const tri = (px) => { a.cyl(px, yc, Z0 + 4 * IN, Z0 + 5.5 * IN, 1.4 * IN, 12); for (let k = 0; k < 3; k++) { const t = -m.PI / 2 + (k * TAU) / 3 + (k === 1 ? 0 : 0), ex = px + legR * m.cos(t) * (v.ring ? 0.85 : 1), ey = yc + legR * m.sin(t) * 0.95; a.tube([[px, yc, Z0 + 5 * IN], [ex, ey, Z0 + 1.2 * IN]], [0.7 * IN, 0.6 * IN], 8); a.xcyl(ex - 0.5 * IN, ex + 0.5 * IN, ey, Z0 + 0.8 * IN, 0.8 * IN, 8); a.line(px, yc, ex, ey, 'EQUIP-DETAIL'); } };
    if (v.ring) {
      tri(cx); const rz = Z0 + H * 0.62, R = W / 2 * 0.97; a.cyl(cx, yc, Z0 + 5 * IN, Z0 + H * 0.45, 0.9 * IN, 10); a.cyl(cx, yc, Z0 + H * 0.45, rz - R * 0.3, 0.7 * IN, 10); a.cyl(cx, yc, Z0 + H * 0.3, Z0 + H * 0.32, 1.3 * IN, 10);
      a.tube(Array.from({ length: 25 }, (_, i) => [cx + R * m.cos((i / 24) * TAU), yc, rz + R * m.sin((i / 24) * TAU)]), Array(25).fill(0.55 * IN), 8); a.tube([[cx, yc - 0.2 * IN, rz], [cx, yc + 0.2 * IN, rz]], [R * 0.985, R * 0.985], 40);
      for (const s of [-1, 1]) a.box(cx + s * R * 0.7 - 1 * IN, yc - 1 * IN, rz - R * 0.7 - 1 * IN, cx + s * R * 0.7 + 1 * IN, yc + 1 * IN, rz - R * 0.7 + 1 * IN);
      a.circ(cx, yc, R, 'EQUIP-DETAIL');
    } else {
      const sp = v.span * IN, px = [cx - sp / 2 + 3 * IN, cx + sp / 2 - 3 * IN], bz = Z0 + H - 6 * IN;
      for (const x of px) { tri(x); a.cyl(x, yc, Z0 + 5 * IN, Z0 + H * 0.6, 0.95 * IN, 10); a.cyl(x, yc, Z0 + H * 0.6, bz + 1 * IN, 0.7 * IN, 10); a.cyl(x, yc, Z0 + H * 0.58, Z0 + H * 0.62, 1.25 * IN, 10); a.cyl(x, yc, bz - 2 * IN, bz + 2 * IN, 1.2 * IN, 10); }
      a.xcyl(px[0] - 2 * IN, px[1] + 2 * IN, yc, bz, 0.7 * IN, 10); a.box(px[0] - 1 * IN, yc - 0.3 * IN, bz - H * 0.62, px[1] + 1 * IN, yc + 0.3 * IN, bz - 0.7 * IN);
      for (let i = 0; i < 8; i++) a.box(px[0] + (px[1] - px[0]) * i / 7 - 0.6 * IN, yc - 1.2 * IN, bz - 1.2 * IN, px[0] + (px[1] - px[0]) * i / 7 + 0.6 * IN, yc + 1.2 * IN, bz + 0.4 * IN);
      a.rect(px[0] - 1 * IN, yc - 0.3 * IN, px[1] + 1 * IN, yc + 0.3 * IN, 'EQUIP');
    }
    a.log('Added the tripod feet, telescoping poles, cross bar or ring, clamps and the stretched fabric (plan and 3D).');
  } }),

fam({ cat: 'speedrun/setups', title: 'Generic racing sim rig',
  desc: (v) => `Racing sim rig: a ${v.mon ? 'tube-frame cockpit with a triple monitor stand, ' : 'tube-frame cockpit '}in profile bars with a bucket seat on side mounts, a wheel deck at the front with a wheel and column, a pedal tray with three pedals, a shifter post, and a base with four feet.`,
  vs: [
    ['compact cockpit, 56 in', 22, 56, 40, 0, { mon: false }],
    ['full cockpit, 62 in', 24, 62, 44, 0, { mon: false }],
    ['cockpit with triple monitor stand, 64 in', 62, 64, 52, 0, { mon: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, rw = v.mon ? 22 * IN : W, bar = 1.6 * IN, ft = 1 * IN;
    const bx = (x0, y0, z0, x1, y1, z1) => a.box(x0, y0, z0, x1, y1, z1);
    for (const s of [-1, 1]) { const x = cx + s * (rw / 2 - bar / 2); bx(x - bar / 2, YF + 6 * IN, Z0 + 2 * IN, x + bar / 2, YB - 2 * IN, Z0 + 2 * IN + bar); }
    for (const y of [YF + 6 * IN, (YF + YB) / 2, YB - 4 * IN]) bx(cx - rw / 2, y, Z0 + 2 * IN, cx + rw / 2, y + bar, Z0 + 2 * IN + bar);
    for (const s of [-1, 1]) for (const y of [YF + 6 * IN, YB - 4 * IN]) bx(cx + s * (rw / 2 - bar / 2) - bar / 2, y, Z0, cx + s * (rw / 2 - bar / 2) + bar / 2, y + bar, Z0 + 2 * IN);
    const sy = YB - 22 * IN, sz = Z0 + 2 * IN + bar + 7 * IN;
    for (const s of [-1, 1]) { const x = cx + s * (rw / 2 - bar / 2); bx(x - bar / 2, sy - 2 * IN, Z0 + 2 * IN + bar, x + bar / 2, sy - 2 * IN + bar, sz + 3 * IN); }
    a.box(cx - 8.5 * IN, sy, sz, cx + 8.5 * IN, sy + 14 * IN, sz + 2.5 * IN); for (const s of [-1, 1]) prismY(a, [[cx + s * 8.5 * IN, sz + 2.5 * IN], [cx + s * 10.5 * IN, sz + 2.5 * IN], [cx + s * 10.8 * IN, sz + 7 * IN], [cx + s * 8.5 * IN, sz + 6 * IN]], sy + 2 * IN, sy + 12 * IN);
    prismY(a, [[cx - 8.5 * IN, sz + 2.5 * IN], [cx + 8.5 * IN, sz + 2.5 * IN], [cx + 10.5 * IN, sz + 24 * IN], [cx - 10.5 * IN, sz + 24 * IN]], YB - 8 * IN, YB - 4 * IN); a.ell(cx, YB - 9 * IN, sz + 23 * IN, 5 * IN, 1.4 * IN, 3 * IN, 12, 6);
    a.rect(cx - 8.5 * IN, sy, cx + 8.5 * IN, sy + 14 * IN, 'EQUIP-DETAIL'); a.rect(cx - 10.5 * IN, YB - 8 * IN, cx + 10.5 * IN, YB - 4 * IN, 'EQUIP-DETAIL');
    const dy = YF + 14 * IN, dz = Z0 + 2 * IN + bar + 18 * IN; a.tube([[cx, YF + 6 * IN, Z0 + 2 * IN + bar], [cx, dy, dz - 6 * IN]], [bar * 0.5, bar * 0.5], 8); a.box(cx - 7 * IN, dy - 6 * IN, dz - 6 * IN, cx + 7 * IN, dy + 6 * IN, dz - 4 * IN);
    a.tube([[cx, dy - 2 * IN, dz - 5 * IN], [cx, dy + 4 * IN, dz + 2 * IN]], [1.6 * IN, 1.2 * IN], 10);
    a.tube(Array.from({ length: 21 }, (_, i) => [cx + 5.5 * IN * m.cos((i / 20) * TAU), dy + 4 * IN + 0.5 * IN, dz + 2 * IN + 5.5 * IN * m.sin((i / 20) * TAU)]), Array(21).fill(0.6 * IN), 8);
    a.circ(cx, dy + 4 * IN, 5.5 * IN, 'EQUIP-DETAIL');
    const py = YF + 1 * IN; prismX(a, [[py, Z0 + 2 * IN + bar], [py + 10 * IN, Z0 + 2 * IN + bar + 4 * IN], [py + 10 * IN, Z0 + 2 * IN + bar + 5 * IN], [py, Z0 + 2 * IN + bar + 1 * IN]], cx - 6.5 * IN, cx + 6.5 * IN);
    for (const i of [-1, 0, 1]) { a.box(cx + i * 3.3 * IN - 1.2 * IN, py + 2 * IN, Z0 + 2 * IN + bar + 2.6 * IN, cx + i * 3.3 * IN + 1.2 * IN, py + 7 * IN, Z0 + 2 * IN + bar + 4.5 * IN); a.rect(cx + i * 3.3 * IN - 1.2 * IN, py + 2 * IN, cx + i * 3.3 * IN + 1.2 * IN, py + 7 * IN, 'EQUIP-DETAIL'); }
    const px = cx + rw / 2 - bar - 2 * IN; a.tube([[px, sy + 4 * IN, Z0 + 2 * IN + bar], [px, sy + 4 * IN, sz + 4 * IN]], [0.5 * IN, 0.5 * IN], 6); ball(a, px, sy + 4 * IN, sz + 4.8 * IN, 1.1 * IN, 10, 6);
    if (v.mon) { const mw = 20.9 * IN, mz = Z0 + 24 * IN; a.tube([[cx, YF + 8 * IN, Z0 + 2 * IN + bar], [cx, YF + 8 * IN, mz]], [bar * 0.5, bar * 0.5], 8); a.box(cx - 0.6 * IN, YF + 8 * IN - 0.6 * IN, Z0 + 2 * IN, cx + 0.6 * IN, YF + 8 * IN + 0.6 * IN, mz); for (const s of [-1, 0, 1]) { const x = cx + s * (mw + 1.2 * IN) - mw / 2; panel(a, x, mz + 2 * IN, mw, 11.8 * IN, YF + 6 * IN + 1.2 * IN * (s ? 4 : 0) - (s ? 0 : 0), 1.2 * IN); } a.rect(cx - mw * 1.5 - 1.2 * IN, YF + 5 * IN, cx + mw * 1.5 + 1.2 * IN, YF + 8 * IN, 'EQUIP-DETAIL'); }
    a.outline('EQUIP-HIDDEN'); a.rect(cx - rw / 2, YF + 6 * IN, cx + rw / 2, YB - 2 * IN); a.log('Added the tube frame, bucket seat, wheel deck with wheel and column, pedal tray, shifter and the monitor stand where fitted (plan and 3D).');
  } }),

// ============================================================================================ speedrun/gear
fam({ cat: 'speedrun/gear', title: 'Generic game controller',
  desc: (v) => v.kind === 'dual' || v.kind === 'mini' ? `${v.kind === 'mini' ? 'Compact' : 'Dual-grip'} hand controller: a domed body with two rounded grips, a cross-shaped direction pad, four face buttons in a diamond, ${v.kind === 'mini' ? 'one thumb stick, ' : 'two thumb sticks with caps, '}two bumpers on the front edge, two small centre buttons and a cord stub.`
    : v.kind === 'slab' ? 'Flat retro controller: a rectangular slab body with a cross-shaped direction pad, two round action buttons, two small pill buttons and a cord leaving the front edge.'
    : 'Six-button pad: a flat wide body with a cross-shaped direction pad, a two-row layout of six round buttons, two small centre buttons and a cord leaving the front edge.',
  vs: [
    ['dual-grip, 6 in', 6, 4, 2.4, 0, { kind: 'dual' }],
    ['compact one-stick, 4.5 in', 4.5, 3.1, 1.9, 0, { kind: 'mini' }],
    ['flat two-button, 5 in', 5, 2.3, 0.9, 0, { kind: 'slab' }],
    ['six-button flat, 6.2 in', 6.2, 3.4, 1.1, 0, { kind: 'fight' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, round = v.kind === 'dual' || v.kind === 'mini';
    let top = Z0 + H * 0.78, surf = () => top;
    if (round) {
      const zc = Z0 + H * 0.55, rx = W * 0.36, ry = D * 0.3, rz = H * 0.4, cy0 = yc - D * 0.1;
      a.ell(cx, cy0, zc, rx, ry, rz, 24, 12);
      for (const s of [-1, 1]) { a.ell(cx + s * W * 0.34, yc + D * 0.17, Z0 + H * 0.45, W * 0.15, D * 0.3, H * 0.44, 14, 9); a.ellp(cx + s * W * 0.34, yc + D * 0.17, W * 0.15, D * 0.3, 'EQUIP'); }
      a.ellp(cx, cy0, rx, ry, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN'); surf = (x, y) => zc + rz * m.sqrt(m.max(0.02, 1 - ((x - cx) / rx) ** 2 - ((y - cy0) / ry) ** 2));
    } else {
      a.box(X0 + D * 0.5, YF, Z0, X1 - D * 0.5, YB, Z0 + H * 0.82); a.xcyl(X0 + D * 0.5 - 0.0, X0 + D * 0.5 + 0.01, yc, Z0 + H * 0.41, 0.01, 4);
      for (const s of [-1, 1]) a.cyl(cx + s * (W / 2 - D * 0.5), yc, Z0, Z0 + H * 0.82, D / 2, 18);
      { const pts = []; for (let i = 0; i <= 12; i++) { const t = -m.PI / 2 + (m.PI * i) / 12; pts.push([cx + W / 2 - D / 2 + (D / 2) * m.cos(t), yc + (D / 2) * m.sin(t)]); } for (let i = 0; i <= 12; i++) { const t = m.PI / 2 + (m.PI * i) / 12; pts.push([cx - W / 2 + D / 2 + (D / 2) * m.cos(t), yc + (D / 2) * m.sin(t)]); } a.poly(pts); } top = Z0 + H * 0.82; surf = () => top;
    }
    const cap = (x, y, r, hh = H * 0.1) => { const z = surf(x, y) - 1; a.cyl(x, y, z, z + hh, r, 14); a.circ(x, y, r, 'EQUIP-DETAIL'); };
    const dpx = cx - W * (round ? 0.2 : 0.3), dpy = round ? yc - D * 0.13 : yc, L = W * (round ? 0.075 : 0.06), th = W * 0.028;
    a.box(dpx - L, dpy - th, surf(dpx, dpy) - 1, dpx + L, dpy + th, surf(dpx, dpy) + H * 0.09); a.box(dpx - th, dpy - L, surf(dpx, dpy) - 1, dpx + th, dpy + L, surf(dpx, dpy) + H * 0.09); a.line(dpx - L, dpy, dpx + L, dpy, 'EQUIP-DETAIL'); a.line(dpx, dpy - L, dpx, dpy + L, 'EQUIP-DETAIL');
    const fx = cx + W * (round ? 0.2 : 0.22), fy = round ? yc - D * 0.13 : yc, fd = W * 0.05, br = W * 0.026 + (round ? 0.5 : 0);
    if (round) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) cap(fx + dx * fd, fy + dy * fd, br);
    else if (v.kind === 'slab') for (const s of [-1, 1]) cap(fx + s * fd * 0.8, fy, br * 1.5);
    else for (const [dx, dy] of [[-1, 0.5], [0, 0.5], [1, 0.5], [-1, -0.5], [0, -0.5], [1, -0.5]]) cap(fx + dx * fd * 1.1, fy + dy * fd * 1.1, br * 0.95);
    if (round) { const stx = v.kind === 'mini' ? [cx - W * 0.1] : [cx - W * 0.12, cx + W * 0.12]; for (const x of stx) { const y = yc + D * 0.07, z = surf(x, y); a.cyl(x, y, z - 1, z + H * 0.1, W * 0.045, 14); a.cyl(x, y, z + H * 0.1, z + H * 0.14, W * 0.062, 14); a.circ(x, y, W * 0.062, 'EQUIP-DETAIL'); }
      for (const s of [-1, 1]) { a.box(cx + s * W * 0.25 - W * 0.09, yc - D * 0.38, Z0 + H * 0.62, cx + s * W * 0.25 + W * 0.09, yc - D * 0.2, Z0 + H * 0.95); a.rect(cx + s * W * 0.25 - W * 0.09, yc - D * 0.38, cx + s * W * 0.25 + W * 0.09, yc - D * 0.2, 'EQUIP-DETAIL'); } }
    for (const s of [-1, 1]) { const x = cx + s * W * 0.05, y = round ? yc - D * 0.16 : yc + D * 0.18, z = surf(x, y); a.box(x - W * 0.025, y - W * 0.012, z - 1, x + W * 0.025, y + W * 0.012, z + H * 0.05); a.rect(x - W * 0.025, y - W * 0.012, x + W * 0.025, y + W * 0.012, 'EQUIP-DETAIL'); }
    a.tube([[cx, YF + 2, Z0 + H * 0.4], [cx, YF - 0.0 + 1, Z0 + H * 0.4]], [W * 0.012, W * 0.012], 6); a.ycyl(YF, YF + D * 0.04, cx, Z0 + H * 0.4, W * 0.02, 8);
    a.log('Added the body, grips, direction pad, buttons, sticks or bumpers and the cord stub (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic arcade stick',
  desc: (v) => v.leverless ? `Leverless arcade controller: a low slanted case with a top panel of ${v.nb} full-size round buttons in two groups (four direction buttons and eight action buttons), two small start buttons and a cord stub.` : `Arcade stick: a slanted case with a ball-top lever on the left, ${v.nb} round action buttons in two rows, two small start buttons, a recessed hand rest at the front and a cord stub.`,
  vs: [
    ['six-button, 12 in', 12, 8, 3.3, 0, { nb: 6 }],
    ['eight-button, 14 in', 14, 9, 3.6, 0, { nb: 8 }],
    ['leverless twelve-button, 12 in', 12, 8.5, 2.2, 0, { nb: 12, leverless: true }],
    ['compact mini, 9 in', 9, 6, 2.8, 0, { nb: 4 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, hf = H * 0.62, hb = H * 0.9;
    prismX(a, [[YF, Z0], [YB, Z0], [YB, Z0 + hb], [YF, Z0 + hf]], X0, X1);
    const zt = (y) => Z0 + hf + (hb - hf) * ((y - YF) / D); a.outline(); a.rect(X0 + W * 0.02, YF + D * 0.04, X1 - W * 0.02, YB - D * 0.04, 'EQUIP-DETAIL');
    if (v.leverless) {
      const bx = X0 + W * 0.2, by = YF + D * 0.55, r = W * 0.045;
      [[-1, 0], [0, 0], [1, 0], [1.6, 1.15]].forEach(([dx, dy], i) => { const x = bx + dx * r * 2.35 + (i === 3 ? 0 : 0), y = by + dy * r * 2.35 - (i === 3 ? r * 0.3 : 0); a.cyl(x, y, zt(y) - 1, zt(y) + H * 0.12, r, 16); a.circ(x, y, r, 'EQUIP-DETAIL'); });
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const x = cx + W * 0.08 + i * r * 2.4 + j * r * 0.8, y = YF + D * 0.52 + j * r * 2.4; a.cyl(x, y, zt(y) - 1, zt(y) + H * 0.12, r, 16); a.circ(x, y, r, 'EQUIP-DETAIL'); }
    } else {
      const sx = X0 + W * 0.22, sy = YF + D * 0.55, z = zt(sy); a.cyl(sx, sy, z - 1, z + H * 0.05, W * 0.06, 16); a.cyl(sx, sy, z, z + H * 0.55, W * 0.014, 8); ball(a, sx, sy, z + H * 0.62, W * 0.04, 14, 9); a.circ(sx, sy, W * 0.06, 'EQUIP-DETAIL'); a.circ(sx, sy, W * 0.022, 'EQUIP-DETAIL');
      const cols = m.ceil(v.nb / 2), r = W * 0.034;
      for (let i = 0; i < v.nb; i++) { const row = i < cols ? 1 : 0, c = row ? i : i - cols, x = cx + W * 0.0 + c * r * 2.55 + row * r * 0.9, y = YF + D * (row ? 0.65 : 0.4) + (c * r * 0.15); a.cyl(x, y, zt(y) - 1, zt(y) + H * 0.1, r, 16); a.circ(x, y, r, 'EQUIP-DETAIL'); }
      a.box(X0 + W * 0.1, YF, Z0 + hf - H * 0.12, X1 - W * 0.1, YF + D * 0.18, Z0 + hf);
    }
    for (const s of [-1, 1]) { const x = cx + s * W * 0.04 + W * 0.08, y = YB - D * 0.12; a.cyl(x, y, zt(y) - 1, zt(y) + H * 0.05, W * 0.016, 10); a.circ(x, y, W * 0.016, 'EQUIP-DETAIL'); }
    a.ycyl(YB - 1, YB + 0.01, cx, Z0 + hb * 0.4, 2, 6); a.log('Added the slanted case, lever or direction buttons, round action buttons, start buttons and hand rest (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic video capture device',
  desc: (v) => v.kind === 'ext' ? 'External capture box: an aluminium-style case with chamfered ends, an input and an output port frame and a USB socket on the front, a status light, ribs on top and four rubber feet.'
    : v.kind === 'card' ? 'Internal capture card: a circuit board with a vertical bracket carrying two port frames, a heat spreader with fins, a row of edge fingers along the lower edge and a small chip array.'
    : 'Dual-input capture dock: a wider case with two input and two output port frames, four status lights, a recessed top and rubber feet.',
  vs: [
    ['external box, 3 in', 3.2, 2.4, 0.8, 0, { kind: 'ext' }],
    ['internal card, 6.6 in', 6.6, 4.4, 0.9, 0, { kind: 'card' }],
    ['dual-input dock, 7 in', 7, 4.5, 1.5, 0, { kind: 'dock' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2;
    if (v.kind === 'card') {
      const pz = Z0 + H * 0.4, bw = W * 0.07; a.box(X0 + bw, YF, pz, X1, YB, pz + 0.06 * IN * 1.0); a.box(X0, YF, Z0, X0 + bw * 0.5, YB, Z0 + H);
      for (const k of [-1, 1]) { a.box(X0 + bw * 0.5, yc + k * D * 0.2 - D * 0.1, Z0 + H * 0.45, X0 + bw, yc + k * D * 0.2 + D * 0.1, Z0 + H * 0.85); a.frame(X0 - 1, Z0 + H * 0.5, X0 + bw * 0.5, Z0 + H * 0.8, yc + k * D * 0.2 - D * 0.1, yc + k * D * 0.2 + D * 0.1, 1.5); }
      a.box(X0 + W * 0.28, YF + D * 0.2, pz + 0.06 * IN, X0 + W * 0.78, YB - D * 0.2, pz + H * 0.55); for (let i = 0; i < 8; i++) a.box(X0 + W * 0.3 + i * W * 0.06, YF + D * 0.2, pz + H * 0.55, X0 + W * 0.3 + i * W * 0.06 + W * 0.03, YB - D * 0.2, pz + H * 0.9);
      for (let i = 0; i < 4; i++) a.box(X0 + W * 0.15 + i * 0.03 * W, YB - D * 0.82 + i * D * 0.1, pz + 0.06 * IN, X0 + W * 0.15 + i * 0.03 * W + W * 0.05, YB - D * 0.72 + i * D * 0.1, pz + H * 0.14);
      for (let i = 0; i < 28; i++) a.box(X0 + W * 0.25 + i * W * 0.025, YF, pz - 0.05 * IN, X0 + W * 0.25 + i * W * 0.025 + W * 0.014, YF + D * 0.05, pz + 0.01);
      a.rect(X0 + bw, YF, X1, YB); a.rect(X0, YF, X0 + bw * 0.5, YB, 'EQUIP-DETAIL'); a.rect(X0 + W * 0.28, YF + D * 0.2, X0 + W * 0.78, YB - D * 0.2, 'EQUIP-DETAIL');
    } else {
      const ch = H * 0.12, nr = v.kind === 'dock' ? 2 : 1;
      prismY(a, [[X0, Z0 + H * 0.1 + ch], [X0 + ch, Z0 + H * 0.1], [X1 - ch, Z0 + H * 0.1], [X1, Z0 + H * 0.1 + ch], [X1, Z0 + H - ch], [X1 - ch, Z0 + H], [X0 + ch, Z0 + H], [X0, Z0 + H - ch]], YF, YB);
      for (const [x, y] of [[X0 + W * 0.1, YF + D * 0.12], [X1 - W * 0.1, YF + D * 0.12], [X0 + W * 0.1, YB - D * 0.12], [X1 - W * 0.1, YB - D * 0.12]]) { a.cyl(x, y, Z0, Z0 + H * 0.12, W * 0.025, 8); a.circ(x, y, W * 0.025, 'EQUIP-HIDDEN'); }
      for (let i = 0; i < nr; i++) for (const s of [-1, 1]) { const px = cx + s * W * (nr > 1 ? 0.2 : 0.17) + (nr > 1 ? (i ? 0 : 0) : 0); a.frame(px - W * 0.075, Z0 + H * 0.3, px + W * 0.075, Z0 + H * 0.7, YF - 0.8, YF + 1.2, W * 0.013); a.box(px - W * 0.055, YF + 0.5, Z0 + H * 0.38, px + W * 0.055, YF + 1.5, Z0 + H * 0.62); if (nr === 1) break; }
      if (nr === 1) { a.frame(cx - W * 0.075, Z0 + H * 0.3, cx + W * 0.075, Z0 + H * 0.7, YF - 0.8, YF + 1.2, W * 0.013); } 
      a.box(cx + W * 0.34, YF - 0.8, Z0 + H * 0.4, cx + W * 0.44, YF + 1.2, Z0 + H * 0.58); for (let i = 0; i < (nr > 1 ? 4 : 1); i++) a.ycyl(YF - 1, YF, X0 + W * 0.12 + i * W * 0.045, Z0 + H * 0.82, W * 0.012, 6);
      for (let i = 0; i < (nr > 1 ? 9 : 6); i++) a.box(X0 + W * (0.2 + i * (nr > 1 ? 0.07 : 0.09)), YF + D * 0.2, Z0 + H, X0 + W * (0.2 + i * (nr > 1 ? 0.07 : 0.09)) + W * 0.02, YB - D * 0.2, Z0 + H + 0.03 * IN);
      a.outline(); a.rect(X0 + W * 0.2, YF + D * 0.2, X1 - W * 0.2, YB - D * 0.2, 'EQUIP-DETAIL');
    }
    a.log('Added the case or circuit board, port frames, status lights, ribs or heat spreader and feet (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic mechanical keyboard',
  desc: (v) => `${v.name} mechanical keyboard: a tapered case on its two rear feet with ${v.keys} individual keycaps in stepped rows${v.split ? ', split into two halves with a gap and a palm rest in front of each' : ''}${v.cluster ? ', with a function row, a navigation cluster and arrow keys' : ''}${v.numpad ? ' and a number pad' : ''}.`,
  vs: [
    ['compact 60 percent, 12 in', 12, 4.4, 1.3, 0, { name: 'Compact', keys: 61, mode: '60' }],
    ['tenkeyless, 14.5 in', 14.5, 6.2, 1.3, 0, { name: 'Tenkeyless', keys: 87, mode: 'tkl', cluster: true }],
    ['full size, 18 in', 18, 6.2, 1.3, 0, { name: 'Full-size', keys: 104, mode: 'full', cluster: true, numpad: true }],
    ['split ergonomic, 15 in', 15, 7.2, 1.5, 0, { name: 'Split ergonomic', keys: 62, mode: 'split', split: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, u = 0.75 * IN, g = 0.06 * IN, margin = 0.3 * IN;
    const main = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5], [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25], [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75], [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25]];
    const baseTop = (y) => Z0 + 0.5 * IN + (H - 0.5 * IN - 0.45 * IN - 0.35 * IN) * ((y - YF) / D);
    prismX(a, [[YF, Z0 + 0.15 * IN], [YB, Z0 + 0.15 * IN], [YB, Z0 + H * 0.62], [YF, Z0 + H * 0.38]], X0, X1);
    for (const s of [-1, 1]) { a.box(cx + s * W * 0.4 - 0.5 * IN, YB - 1.2 * IN, Z0, cx + s * W * 0.4 + 0.5 * IN, YB - 0.4 * IN, Z0 + 0.2 * IN); a.circ(cx + s * W * 0.4, YB - 0.8 * IN, 0.5 * IN, 'EQUIP-HIDDEN'); }
    const zk = (y) => Z0 + H * 0.38 + (H * 0.62 - H * 0.38) * ((y - YF) / D), cap = (x0, y0, w, d, z) => { a.box(x0, y0, z, x0 + w, y0 + d, z + H * 0.34); a.rect(x0, y0, x0 + w, y0 + d, 'EQUIP-DETAIL'); };
    let rowY0 = v.cluster ? YB - margin - 6 * u - 0.5 * u : YB - margin - 5 * u;
    const row = (x0, widths, ry, nrow) => { let x = x0; for (const w of widths) { cap(x, ry, w * u - g, u - g, zk(ry) + 0.0); x += w * u; } return x; };
    if (v.mode === 'split') {
      for (const s of [-1, 1]) { const x0 = s < 0 ? X0 + margin : cx + 1.4 * IN; for (let r = 0; r < 5; r++) { const ry = YB - margin - (r + 1) * u; const n = [6, 6, 6, 6, 5][r]; const wd = Array(n).fill(1); if (r === 4) { wd[n - 1] = 1.5; } let x = x0 + (r === 1 ? 0.25 * u : r === 2 ? 0.5 * u : r === 3 ? 0.75 * u : r === 4 ? 1 * u : 0); if (s > 0) x = X1 - margin - (6 * u) + (r === 1 ? -0.25 * u : r === 2 ? -0.5 * u : r === 3 ? -0.75 * u : r === 4 ? -1 * u : 0); for (const w of wd) { cap(x, ry, w * u - g, u - g, zk(ry)); x += w * u; } }
        for (let i = 0; i < 3; i++) { const ry = YB - margin - 5.9 * u; cap(s < 0 ? X0 + margin + 3.2 * u + i * 1.2 * u : X1 - margin - 6.8 * u + i * 1.2 * u + 0, ry - 0.1 * u, 1.15 * u - g, u - g, zk(ry)); } a.rect(s < 0 ? X0 : cx + 1.0 * IN, YF + 0.2 * IN, s < 0 ? cx - 1.0 * IN : X1, YB, 'EQUIP-DETAIL'); a.box(s < 0 ? X0 + 0.5 * IN : cx + 1.2 * IN, YF, Z0 + H * 0.1, s < 0 ? cx - 1.2 * IN : X1 - 0.5 * IN, YF + 1.2 * IN, Z0 + H * 0.4); }
    } else {
      const yRow = (r) => YB - margin - (v.cluster ? 1.5 * u : 0) - (r + 1) * u, kx0 = X0 + margin;
      if (v.cluster) { const fy = YB - margin - u; let x = kx0; cap(x, fy, u - g, u - g, zk(fy)); x += 2 * u; for (let k = 0; k < 12; k++) { cap(x, fy, u - g, u - g, zk(fy)); x += u * (k % 4 === 3 ? 1.5 : 1); } }
      main.forEach((wd, r) => row(kx0, wd, yRow(r), r));
      if (v.cluster) { const nx = kx0 + 15.5 * u; for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) cap(nx + c * u, yRow(r), u - g, u - g, zk(yRow(r))); cap(nx + u, yRow(3), u - g, u - g, zk(yRow(3))); for (let c = 0; c < 3; c++) cap(nx + c * u, yRow(4), u - g, u - g, zk(yRow(4)));
      }
      if (v.numpad) { const nx = kx0 + 19 * u; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) cap(nx + c * u, yRow(r), u - g, u - g, zk(yRow(r))); cap(nx, yRow(4), 2 * u - g, u - g, zk(yRow(4))); cap(nx + 2 * u, yRow(4), u - g, u - g, zk(yRow(4))); }
      a.outline(); a.rect(X0 + margin * 0.5, YF + 0.2 * IN, X1 - margin * 0.5, YB - 0.2 * IN, 'EQUIP-DETAIL');
    }
    a.log('Added the tapered case, rear feet and the keycaps in their stepped rows (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic gaming headset',
  desc: (v) => v.kind === 'stand' ? 'Over-ear headset resting on a desk stand: a headband with a padded top, two ear cups with cushions and yokes, a boom mic with a capsule, a round weighted base and a pole with a curved cradle.'
    : `Over-ear headset: a curved headband with a padded top, two ear cups with cushions and fork yokes${v.boom ? ', and a boom mic on the left cup with a foam capsule' : ' and a cable stub on the left cup'}.`,
  vs: [
    ['over-ear, 8 in', 8, 3.4, 8.5, 0, { kind: 'plain', boom: false }],
    ['over-ear with boom mic, 8 in', 8, 7, 8.5, 0, { kind: 'boom', boom: true }],
    ['on desk stand, 11 in', 9, 8, 11, 0, { kind: 'stand', boom: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = v.kind === 'plain' ? (YF + YB) / 2 : YB - 1.7 * IN, st = v.kind === 'stand' ? 3 * IN : 0, hz = Z0 + st + (H - st) * 0.4, hr = W * 0.38, ht = H - st - (H - st) * 0.4 - 0.5 * IN;
    if (v.kind === 'stand') { a.cyl(cx, yc, Z0, Z0 + 0.5 * IN, 3.4 * IN, 24); a.cyl(cx, yc, Z0 + 0.5 * IN, Z0 + st + 4 * IN, 0.7 * IN, 12); a.circ(cx, yc, 3.4 * IN); a.tube([[cx - 2.2 * IN, yc, Z0 + st + 4.4 * IN], [cx, yc, Z0 + st + 5.2 * IN], [cx + 2.2 * IN, yc, Z0 + st + 4.4 * IN]], [0.6 * IN, 0.6 * IN, 0.6 * IN], 8); }
    const arc = Array.from({ length: 17 }, (_, i) => { const t = (i / 16) * m.PI; return [cx + hr * m.cos(t), yc, hz + ht * m.sin(t)]; });
    a.tube(arc, Array(17).fill(0.38 * IN), 8); a.tube(arc.slice(5, 12), Array(7).fill(0.5 * IN), 8); a.tube([[arc[5][0], yc, arc[5][2] - 0.1 * IN], [arc[11][0], yc, arc[11][2] - 0.1 * IN]], [0.01, 0.01], 3);
    for (const s of [-1, 1]) {
      const x = cx + s * hr, cr = H * 0.27 * (v.kind === 'stand' ? 0.8 : 1);
      a.tube([[x, yc, hz + 0.3 * IN], [x, yc, hz - 0.6 * IN], [x - s * 0.0, yc, hz - cr * 0.9]], [0.4 * IN, 0.4 * IN, 0.4 * IN], 8);
      a.xcyl(x - s * 0.1 * IN, x + s * 1.2 * IN, yc, hz - cr * 0.55, cr, 20); a.xcyl(x - s * 0.9 * IN, x - s * 0.1 * IN, yc, hz - cr * 0.55, cr * 0.9, 20); a.ell(x - s * 0.7 * IN, yc, hz - cr * 0.55, 0.3 * IN, cr * 0.8, cr * 0.8, 8, 6);
      a.circ(x, yc, cr * 0.9, 'EQUIP-DETAIL');
    }
    a.rect(cx - hr - 0.3 * IN, yc - 0.45 * IN, cx + hr + 0.3 * IN, yc + 0.45 * IN, 'EQUIP');
    if (v.boom) { const cr = H * 0.27 * (v.kind === 'stand' ? 0.8 : 1), mx = cx - hr; a.tube([[mx - 1.2 * IN, yc, hz - cr * 0.55], [mx - 1.2 * IN, yc - 1 * IN, hz - cr * 0.7], [mx - 0.2 * IN, YF + 1.2 * IN, hz - cr * 1.1], [mx + 1 * IN, YF + 0.6 * IN, hz - cr * 1.25]], [0.18 * IN, 0.18 * IN, 0.16 * IN, 0.16 * IN], 8); a.ell(mx + 1.2 * IN, YF + 0.7 * IN, hz - cr * 1.28, 0.55 * IN, 0.55 * IN, 0.4 * IN, 10, 6); a.circ(mx + 1.2 * IN, YF + 0.7 * IN, 0.55 * IN, 'EQUIP-DETAIL'); }
    else { const cr = H * 0.27; a.tube([[cx - hr - 1 * IN, yc, hz - cr * 0.55], [cx - hr - 1 * IN, yc + 0.7 * IN, hz - cr * 1.2]], [0.15 * IN, 0.12 * IN], 6); }
    a.log('Added the headband, padded top, ear cups with cushions and yokes, the mic or cable and the stand where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic stopwatch',
  desc: (v) => v.kind === 'digital' ? 'Hand-held digital stopwatch: a rounded case with a framed display window, three buttons on the top edge, a lanyard loop, and a slim row of small ribs on each side.'
    : 'Analog stopwatch: a round case facing front with a bezel ring, twelve dial ticks, a minute hand and a second hand, a crown and top button, a side button at two o\'clock and a pull-ring loop at the top.',
  vs: [
    ['analog, 2.2 in', 2.2, 0.8, 3.1, 0, { kind: 'analog' }],
    ['analog large, 3.5 in', 3.5, 1.2, 4.9, 0, { kind: 'analog' }],
    ['digital hand-held, 3 in', 3, 1, 2.4, 0, { kind: 'digital' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2;
    if (v.kind === 'digital') {
      prismY(a, [[X0 + 0.2 * IN, Z0], [X1 - 0.2 * IN, Z0], [X1, Z0 + 0.3 * IN], [X1, Z0 + H - 0.9 * IN], [X1 - 0.4 * IN, Z0 + H - 0.5 * IN], [X0 + 0.4 * IN, Z0 + H - 0.5 * IN], [X0, Z0 + H - 0.9 * IN], [X0, Z0 + 0.3 * IN]], YF, YB);
      a.frame(X0 + W * 0.1, Z0 + H * 0.34, X1 - W * 0.1, Z0 + H * 0.78, YF - 1.5, YF + 1, W * 0.025); a.box(X0 + W * 0.13, YF - 1, Z0 + H * 0.38, X1 - W * 0.13, YF, Z0 + H * 0.74);
      for (const [i, w] of [[-1, 0.2], [0, 0.26], [1, 0.2]]) a.box(cx + i * W * 0.3 - W * w / 2, yc - D * 0.2, Z0 + H - 0.5 * IN, cx + i * W * 0.3 + W * w / 2, yc + D * 0.2, Z0 + H - 0.5 * IN + 0.34 * IN);
      for (let i = 0; i < 4; i++) { a.box(X0 - 0.5, YF + D * 0.2, Z0 + H * 0.12 + i * H * 0.06, X0, YB - D * 0.2, Z0 + H * 0.14 + i * H * 0.06); a.box(X1, YF + D * 0.2, Z0 + H * 0.12 + i * H * 0.06, X1 + 0.5, YB - D * 0.2, Z0 + H * 0.14 + i * H * 0.06); }
      a.tube(Array.from({ length: 13 }, (_, i) => [cx + 0.35 * IN * m.cos((i / 12) * TAU) + 0, YB - D * 0.1, Z0 + H - 0.1 * IN + 0.0 * i]).map(([x, y, z], i) => [x, y, z]), Array(13).fill(0.01), 3);
      a.outline(); a.rect(X0 + W * 0.1, YF, X1 - W * 0.1, YF + 1, 'EQUIP-DETAIL');
    } else {
      const R = W / 2, zc = Z0 + R, y0 = YF, y1 = YB;
      a.ycyl(y0, y1, cx, zc, R, 32); a.ycyl(y0 - 1, y0 + 2, cx, zc, R * 1.02, 32); a.ell(cx, y0 + D * 0.1, zc, R * 0.9, D * 0.22, R * 0.9, 20, 8); a.ycyl(y0 - 3, y0 - 2, cx, zc, R * 0.84, 32);
      for (let i = 0; i < 12; i++) { const t = (i * TAU) / 12, x = cx + R * 0.8 * m.sin(t), z = zc + R * 0.8 * m.cos(t); a.box(x - R * 0.025, y0 - 4.5, z - R * 0.05, x + R * 0.025, y0 - 3, z + R * 0.05); }
      a.tube([[cx, y0 - 5, zc], [cx + R * 0.45 * m.sin(0.9), y0 - 5, zc + R * 0.45 * m.cos(0.9)]], [R * 0.035, R * 0.02], 6); a.tube([[cx, y0 - 6.5, zc], [cx + R * 0.7 * m.sin(3.6), y0 - 6.5, zc + R * 0.7 * m.cos(3.6)]], [R * 0.02, R * 0.012], 6); a.ycyl(y0 - 8, y0 - 6, cx, zc, R * 0.06, 10);
      a.cyl(cx, yc, zc + R * 0.97, zc + R * 1.2, R * 0.13, 12); a.cyl(cx, yc, zc + R * 1.2, zc + R * 1.32, R * 0.2, 14);
      const tx = cx + R * 0.74 * m.sin(m.PI * 0.35), tz = zc + R * 0.74 * m.cos(m.PI * 0.35); a.tube([[tx, yc, tz], [cx + R * 0.92 * m.sin(m.PI * 0.35), yc, zc + R * 0.92 * m.cos(m.PI * 0.35)], [cx + R * 1.06 * m.sin(m.PI * 0.35), yc, zc + R * 1.06 * m.cos(m.PI * 0.35)]], [R * 0.07, R * 0.07, R * 0.1], 8);
      const lr = R * 0.38; a.tube(Array.from({ length: 17 }, (_, i) => [cx + lr * m.cos((i / 16) * TAU), yc, zc + R * 1.32 + lr + lr * m.sin((i / 16) * TAU)]), Array(17).fill(R * 0.055), 6);
      a.circ(cx, yc, R); a.circ(cx, yc, R * 0.84, 'EQUIP-DETAIL'); a.rect(cx - R * 0.8, y0, cx + R * 0.8, y1, 'EQUIP-DETAIL');
    }
    a.log('Added the case, display or dial with ticks and hands, buttons, crown and the loop (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic wall timer display',
  desc: (v) => `Wall-mounted run timer: a slim case with a bezel and ${v.digits} large seven-segment digits made of separate segments${v.digits === 6 ? ' with two colon dot pairs' : ' with one colon dot pair and a decimal dot'}, two mounting tabs with screw holes and a cable gland at the bottom.`,
  vs: [
    ['four-digit, 14 in', 14, 2.2, 5, 0, { digits: 4, txt: '5948' }],
    ['six-digit hours minutes seconds, 36 in', 36, 2.6, 10, 0, { digits: 6, txt: '012345' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, n = v.digits, dw = (W * 0.84) / (n + (n === 6 ? 1.2 : 0.7)), t = dw * 0.17, dh = H * 0.66;
    a.box(X0, YF + 0.45 * IN, Z0, X1, YB, Z0 + H); a.frame(X0, Z0, X1, Z0 + H, YF, YF + 0.45 * IN, H * 0.07); a.rect(X0, YF, X1, YB);
    let x = X0 + W * 0.08; const z = Z0 + (H - dh) / 2;
    for (let i = 0; i < n; i++) { digit(a, v.txt[i], x, z, dw * 0.86, dh, t, YF + 0.45 * IN); x += dw + ((n === 6 ? (i === 1 || i === 3) : i === 1) ? dw * 0.35 : 0); if ((n === 6 && (i === 1 || i === 3)) || (n === 4 && i === 1)) { for (const f of [0.34, 0.66]) a.box(x - dw * 0.3, YF + 0.45 * IN - m.max(8, dh * 0.06), z + dh * f - t * 0.5, x - dw * 0.3 + t, YF + 0.45 * IN, z + dh * f + t * 0.5); } }
    for (const s of [-1, 1]) { a.box(cx + s * (W / 2 - 0.5 * IN) - 0.4 * IN, YB - 0.2 * IN, Z0 + H * 0.5 - 0.4 * IN, cx + s * (W / 2 - 0.5 * IN) + 0.4 * IN, YB + 0.01, Z0 + H * 0.5 + 0.4 * IN); a.circ(cx + s * (W / 2 - 0.5 * IN), YB - 0.1 * IN, 0.2 * IN, 'EQUIP-DETAIL'); }
    a.cyl(cx, YB - 0.8 * IN, Z0 - 0.0 + 0.01, Z0 + 0.01, 0.01, 3); a.ycyl(YB - 1.4 * IN, YB - 0.4 * IN, cx, Z0 + 0.3 * IN, 0.28 * IN, 10); a.rect(X0 + 0.1 * IN, YF + 0.45 * IN, X1 - 0.1 * IN, YB - 0.1 * IN, 'EQUIP-DETAIL');
    a.log('Added the case and bezel, the segment digits, colon dots, mounting tabs and cable gland (plan and 3D).');
  } }),

fam({ cat: 'speedrun/gear', title: 'Generic cartridge rack',
  desc: (v) => v.kind === 'wall' ? `Wall rack for game cartridges: a back board, two shelves, ${v.cols} slot dividers per shelf and ${v.cols * 2} cartridges standing in the slots, each with a raised label plate and a notched top edge.`
    : `Floor cabinet rack for game cartridges and cases: two side panels, a back, a plinth, ${v.shelves} shelves with slot dividers and ${v.shelves * v.cols} cartridges standing upright, each with a raised label plate.`,
  vs: [
    ['wall rack, 16 slots, 24 in', 24, 4, 12, 0, { kind: 'wall', cols: 8, shelves: 2 }],
    ['floor cabinet, 6 shelves, 48 in', 18, 8, 48, 0, { kind: 'floor', cols: 6, shelves: 6 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, t = 0.5 * IN, sh = (v.kind === 'wall' ? 5.5 : 7) * IN, cw = 2.2 * IN, cd = 0.6 * IN;
    const wall = v.kind === 'wall';
    a.box(X0, YB - t, Z0, X1, YB, Z0 + H);
    if (!wall) { a.box(X0, YF, Z0, X0 + t, YB, Z0 + H); a.box(X1 - t, YF, Z0, X1, YB, Z0 + H); a.box(X0, YF, Z0, X1, YB, Z0 + 2 * IN); a.rect(X0, YF, X0 + t, YB, 'EQUIP-DETAIL'); a.rect(X1 - t, YF, X1, YB, 'EQUIP-DETAIL'); } else { a.box(X0, YF, Z0, X0 + t, YB, Z0 + H); a.box(X1 - t, YF, Z0, X1, YB, Z0 + H); }
    a.box(X0, YF, Z0 + H - t, X1, YB, Z0 + H);
    const iw = W - (wall ? 2 : 2) * t, pitch = iw / v.cols;
    for (let s = 0; s < v.shelves; s++) {
      const z = Z0 + (wall ? 0.5 * IN : 2 * IN) + s * ((H - (wall ? 1 : 2.5) * IN - t) / v.shelves) * (wall ? 1 : 1), zt = z + 0.4 * IN;
      a.box(X0 + t, YF, z, X1 - t, YB - t, zt);
      for (let c = 0; c <= v.cols; c++) { const x = X0 + t + c * pitch; if (c > 0 && c < v.cols) a.box(x - 0.1 * IN, YF + D * 0.35, zt, x + 0.1 * IN, YB - t, zt + sh * 0.7); }
      for (let c = 0; c < v.cols; c++) { const x0 = X0 + t + c * pitch + (pitch - cw) / 2, y0 = YF + D * 0.45; a.box(x0, y0, zt, x0 + cw, y0 + cd, zt + sh * 0.5); a.box(x0 + cw * 0.15, y0 - 0.04 * IN, zt + sh * 0.12, x0 + cw * 0.85, y0, zt + sh * 0.38); a.box(x0 + cw * 0.2, y0, zt + sh * 0.5, x0 + cw * 0.8, y0 + cd * 0.7, zt + sh * 0.56); }
    }
    a.outline(); for (let c = 1; c < v.cols; c++) a.line(X0 + t + c * pitch, YF + D * 0.35, X0 + t + c * pitch, YB - t, 'EQUIP-DETAIL'); a.rect(X0 + t, YF, X1 - t, YB - t, 'EQUIP-HIDDEN');
    a.log('Added the back board, side panels, shelves, slot dividers and the standing cartridges with labels (plan and 3D).');
  } }),

// ============================================================================================ speedrun/tracks
fam({ cat: 'speedrun/tracks', title: 'Generic sprint track section',
  desc: (v) => `Straight athletics sprint section, ${v.lanes} lanes of 48 in with a rubber-style surface, raised white lane lines, a start line across the lanes, distance ticks every 10 ft, a finish line at the far end, an inner kerb and a drainage gutter grating along the outer edge.`,
  vs: [
    ['4 lanes, 20 ft', 192 + 12, 240, 3, 0, { lanes: 4 }],
    ['6 lanes, 30 ft', 288 + 12, 360, 3, 0, { lanes: 6 }],
    ['8 lanes, 40 ft', 384 + 12, 480, 3, 0, { lanes: 8 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, lw = 48 * IN, tw = v.lanes * lw, tx0 = X0 + 6 * IN, tx1 = tx0 + tw, ls = 2 * IN, ln = 0.12 * IN;
    a.box(tx0, YF, Z0, tx1, YB, Z0 + 1.5 * IN); a.rect(tx0, YF, tx1, YB);
    for (let i = 0; i <= v.lanes; i++) { const x = tx0 + i * lw; a.box(x - ls / 2 + (i === 0 ? ls / 2 : 0) - (i === v.lanes ? ls / 2 : 0), YF, Z0 + 1.5 * IN, x + ls / 2 + (i === 0 ? ls / 2 : 0) - (i === v.lanes ? ls / 2 : 0), YB, Z0 + 1.5 * IN + ln); a.line(x, YF, x, YB, 'EQUIP-DETAIL'); }
    a.box(tx0, YF + 6 * IN, Z0 + 1.5 * IN, tx1, YF + 8 * IN, Z0 + 1.5 * IN + ln); a.box(tx0, YB - 8 * IN, Z0 + 1.5 * IN, tx1, YB - 6 * IN, Z0 + 1.5 * IN + ln); a.line(tx0, YF + 7 * IN, tx1, YF + 7 * IN, 'EQUIP-DETAIL'); a.line(tx0, YB - 7 * IN, tx1, YB - 7 * IN, 'EQUIP-DETAIL');
    for (let y = YF + 10 * 12 * IN; y < YB - 12 * IN; y += 10 * 12 * IN) for (let i = 0; i < v.lanes; i++) { a.box(tx0 + i * lw + lw * 0.4, y - 0.6 * IN, Z0 + 1.5 * IN, tx0 + i * lw + lw * 0.6, y + 0.6 * IN, Z0 + 1.5 * IN + ln); a.line(tx0 + i * lw + lw * 0.4, y, tx0 + i * lw + lw * 0.6, y, 'EQUIP-DETAIL'); }
    a.box(tx0 - 3 * IN, YF, Z0, tx0, YB, Z0 + 3 * IN); a.rect(tx0 - 3 * IN, YF, tx0, YB, 'EQUIP-DETAIL');
    a.box(tx1, YF, Z0, tx1 + 5 * IN, YB, Z0 + 1.2 * IN); for (let y = YF + 2 * IN; y < YB - 3 * IN; y += 3 * IN) a.box(tx1 + 0.4 * IN, y, Z0 + 1.2 * IN, tx1 + 4.6 * IN, y + 1.2 * IN, Z0 + 1.5 * IN); a.rect(tx1, YF, tx1 + 5 * IN, YB, 'EQUIP-DETAIL');
    a.log('Added the track surface, lane lines, start and finish lines, distance ticks, inner kerb and gutter grating (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic athletics starting block set',
  desc: (v) => `${v.n === 1 ? 'Single starting block' : v.n === 2 ? 'Pair of starting blocks on a shared base rail' : 'Row of four starting blocks, one per lane'}: each block is a flat rail with a toothed adjustment track, a front and a rear foot plate set at different angles on sliding carriages, rubber pads and two ground spikes.`,
  vs: [
    ['single block, 24 in', 8, 24, 5, 0, { n: 1 }],
    ['pair on shared rail, 24 in', 22, 24, 5, 0, { n: 2 }],
    ['four-lane row, 48 in spacing', 152, 24, 5, 0, { n: 4, sp: 48 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a;
    const one = (x, bw) => {
      a.box(x - bw * 0.2, YF, Z0, x + bw * 0.2, YB, Z0 + 0.7 * IN); a.rect(x - bw * 0.2, YF, x + bw * 0.2, YB);
      for (let i = 0; i < 14; i++) { const y = YF + 2 * IN + i * 1.5 * IN; a.box(x - bw * 0.15, y, Z0 + 0.7 * IN, x + bw * 0.15, y + 0.4 * IN, Z0 + 0.85 * IN); }
      for (const [y0, ang, hh] of [[YF + 5 * IN, 1, 4.4 * IN], [YF + 13 * IN, 1, 5 * IN]]) {
        a.box(x - bw * 0.3, y0, Z0 + 0.7 * IN, x + bw * 0.3, y0 + 3.5 * IN, Z0 + 1.6 * IN);
        prismX(a, y0 < YF + 8 * IN ? [[y0 + 3.5 * IN, Z0 + 1.6 * IN], [y0 + 3.5 * IN, Z0 + 1.6 * IN + hh], [y0 + 3.5 * IN - hh * 0.9 + 1.3 * IN, Z0 + 1.6 * IN + hh], [y0 + 1.5 * IN, Z0 + 1.6 * IN]] : [[y0 + 3.5 * IN, Z0 + 1.6 * IN], [y0 + 3.5 * IN, Z0 + 1.6 * IN + hh * 0.9], [y0 + 3.5 * IN - hh * 0.55, Z0 + 1.6 * IN + hh * 0.95], [y0 + 1.5 * IN, Z0 + 1.6 * IN]], x - bw * 0.3, x + bw * 0.3);
        a.rect(x - bw * 0.3, y0, x + bw * 0.3, y0 + 3.5 * IN, 'EQUIP-DETAIL');
      }
      for (const y of [YF + 1 * IN, YB - 1 * IN]) { a.tube([[x, y, Z0 + 0.5 * IN], [x, y, Z0 - 0.0 + 0.01]], [0.35 * IN, 0.15 * IN], 6); a.circ(x, y, 0.35 * IN, 'EQUIP-DETAIL'); }
    };
    if (v.n === 1) one(cx, 8 * IN * 1.0);
    else if (v.n === 2) { one(cx - 5.2 * IN, 8 * IN); one(cx + 5.2 * IN, 8 * IN); a.box(cx - 10 * IN, YB - 2.5 * IN, Z0, cx + 10 * IN, YB - 1 * IN, Z0 + 0.5 * IN); }
    else for (let i = 0; i < 4; i++) one(cx + (i - 1.5) * v.sp * IN, 8 * IN);
    a.outline('EQUIP-HIDDEN'); a.log('Added the rail with adjustment teeth, the two angled foot plates on carriages and the ground spikes (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic timing gate',
  desc: (v) => `Photocell timing gate for a ${v.lanes === 1 ? 'single lane' : v.lanes + ' lanes'}: two posts on weighted base plates, a sensor head with lens on the first post, a reflector disc on the second, an adjustable-height clamp collar, a thin beam rod between them and a signal cable on the ground${v.disp ? ', and a three-digit display box on the first post' : ''}.`,
  vs: [
    ['single lane, 48 in', 56, 8, 44, 0, { lanes: 1, span: 48 }],
    ['two lanes, 96 in', 104, 8, 44, 0, { lanes: 2, span: 96 }],
    ['three lanes with display, 144 in', 152, 12, 54, 0, { lanes: 3, span: 144, disp: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, sp = v.span * IN, px = [cx - sp / 2, cx + sp / 2], bz = Z0 + H * 0.82;
    for (const [i, x] of px.entries()) {
      a.box(x - 3.5 * IN, yc - 3.5 * IN, Z0, x + 3.5 * IN, yc + 3.5 * IN, Z0 + 0.7 * IN); a.rect(x - 3.5 * IN, yc - 3.5 * IN, x + 3.5 * IN, yc + 3.5 * IN);
      a.box(x - 1.2 * IN, yc - 1.2 * IN, Z0 + 0.7 * IN, x + 1.2 * IN, yc + 1.2 * IN, Z0 + H * 0.78); a.box(x - 1.6 * IN, yc - 1.6 * IN, Z0 + H * 0.5, x + 1.6 * IN, yc + 1.6 * IN, Z0 + H * 0.56); a.circ(x, yc, 1.2 * IN, 'EQUIP-DETAIL');
      if (i === 0) { a.box(x - 2 * IN, yc - 2 * IN, Z0 + H * 0.78, x + 2 * IN, yc + 2 * IN, Z0 + H * 0.96); a.xcyl(x + 2 * IN, x + 3.4 * IN, yc, Z0 + H * 0.87, 0.9 * IN, 14); a.xcyl(x + 3.4 * IN, x + 3.6 * IN, yc, Z0 + H * 0.87, 0.6 * IN, 12); ball(a, x, yc - 2 * IN, Z0 + H * 0.94, 0.3 * IN, 6, 4); }
      else { a.box(x - 1.8 * IN, yc - 2 * IN, Z0 + H * 0.78, x + 1.8 * IN, yc + 2 * IN, Z0 + H * 0.96); a.xcyl(x - 2.4 * IN, x - 1.8 * IN, yc, Z0 + H * 0.87, 1.7 * IN, 18); }
    }
    a.tube([[px[0] + 3.6 * IN, yc, Z0 + H * 0.87], [px[1] - 2.4 * IN, yc, Z0 + H * 0.87]], [0.06 * IN, 0.06 * IN], 4); a.line(px[0], yc, px[1], yc, 'EQUIP-DETAIL');
    a.tube([[px[0], yc + 3 * IN, Z0 + 0.5 * IN], [px[0] + sp * 0.3, yc + 5 * IN, Z0 + 0.3 * IN], [px[1], yc + 3 * IN, Z0 + 0.5 * IN]], [0.2 * IN, 0.2 * IN, 0.2 * IN], 6);
    if (v.disp) { const x = px[0]; a.box(x - 4 * IN, yc - 3.2 * IN, Z0 + H * 0.56, x + 4 * IN, yc - 1.6 * IN, Z0 + H * 0.74); for (let i = 0; i < 3; i++) digit(a, String(i + 4), x - 3.5 * IN + i * 2.4 * IN, Z0 + H * 0.58, 2 * IN, H * 0.14, 0.4 * IN, yc - 3.2 * IN); }
    a.log('Added the base plates, posts, sensor head with lens, reflector disc, beam rod and signal cable (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic finish line post and gantry',
  desc: (v) => v.kind === 'post' ? 'Finish line post: a square post on a weighted base plate with two diagonal braces, a slit camera head with a lens barrel at the top, a chequer panel of squares on the front face and a signal cable.'
    : `Photo-finish gantry for ${v.lanes} lanes: two square legs on base plates, an overhead box beam, a camera pod hung over the finish line with a lens, two lamp heads, a banner board across the beam${v.clock ? ' and a four-digit clock board hung from two rods at the centre' : ''}.`,
  vs: [
    ['post, 60 in', 18, 18, 62, 0, { kind: 'post' }],
    ['gantry, 6 lanes', 300, 26, 132, 0, { kind: 'gantry', lanes: 6 }],
    ['gantry with clock, 8 lanes', 396, 26, 144, 0, { kind: 'gantry', lanes: 8, clock: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2;
    if (v.kind === 'post') {
      a.box(cx - 9 * IN, yc - 9 * IN, Z0, cx + 9 * IN, yc + 9 * IN, Z0 + 1.5 * IN); a.rect(cx - 9 * IN, yc - 9 * IN, cx + 9 * IN, yc + 9 * IN); a.box(cx - 1.6 * IN, yc - 1.6 * IN, Z0 + 1.5 * IN, cx + 1.6 * IN, yc + 1.6 * IN, Z0 + H - 6 * IN); a.rect(cx - 1.6 * IN, yc - 1.6 * IN, cx + 1.6 * IN, yc + 1.6 * IN, 'EQUIP-DETAIL');
      for (const s of [-1, 1]) a.tube([[cx + s * 1.6 * IN, yc, Z0 + H * 0.5], [cx + s * 8 * IN, yc, Z0 + 1.5 * IN]], [0.4 * IN, 0.4 * IN], 6);
      a.box(cx - 3 * IN, yc - 2.4 * IN, Z0 + H - 6 * IN, cx + 3 * IN, yc + 2.4 * IN, Z0 + H); a.ycyl(yc - 5.2 * IN, yc - 2.4 * IN, cx, Z0 + H - 3 * IN, 1.1 * IN, 14); a.ycyl(yc - 5.5 * IN, yc - 5.2 * IN, cx, Z0 + H - 3 * IN, 0.8 * IN, 12);
      for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) if ((r + c) % 2 === 0) a.box(cx - 1.4 * IN + c * 1.4 * IN, yc - 1.8 * IN, Z0 + H * 0.2 + r * 3.5 * IN, cx - 0.1 * IN + c * 1.4 * IN, yc - 1.6 * IN, Z0 + H * 0.2 + r * 3.5 * IN + 3.2 * IN);
      a.tube([[cx + 1.6 * IN, yc + 1 * IN, Z0 + 4 * IN], [cx + 5 * IN, yc + 4 * IN, Z0 + 0.4 * IN], [cx + 8 * IN, yc + 7 * IN, Z0 + 0.3 * IN]], [0.2 * IN, 0.2 * IN, 0.2 * IN], 6); a.circ(cx, yc - 5.3 * IN, 1.1 * IN, 'EQUIP-DETAIL');
    } else {
      const lx = [X0 + 6 * IN, X1 - 6 * IN], bz = Z0 + H - 14 * IN;
      for (const x of lx) { a.box(x - 6 * IN, yc - 6 * IN, Z0, x + 6 * IN, yc + 6 * IN, Z0 + 1 * IN); a.box(x - 3.5 * IN, yc - 3.5 * IN, Z0 + 1 * IN, x + 3.5 * IN, yc + 3.5 * IN, bz); a.rect(x - 6 * IN, yc - 6 * IN, x + 6 * IN, yc + 6 * IN); a.rect(x - 3.5 * IN, yc - 3.5 * IN, x + 3.5 * IN, yc + 3.5 * IN, 'EQUIP-DETAIL'); }
      a.box(X0, yc - 5 * IN, bz, X1, yc + 5 * IN, Z0 + H); a.rect(X0, yc - 5 * IN, X1, yc + 5 * IN, 'EQUIP-DETAIL');
      a.box(X0 + 8 * IN, yc - 6 * IN, bz + 2 * IN, X1 - 8 * IN, yc - 5 * IN, Z0 + H - 2 * IN); const n = v.lanes * 4; for (let i = 0; i < n; i++) for (let r = 0; r < 2; r++) if ((i + r) % 2 === 0) { const x0 = X0 + 8 * IN + (W - 16 * IN) * i / n, x1 = X0 + 8 * IN + (W - 16 * IN) * (i + 1) / n; a.box(x0, yc - 7 * IN, bz + 2 * IN + r * 5 * IN, x1, yc - 6 * IN, bz + 2 * IN + r * 5 * IN + 5 * IN); }
      a.box(cx - 7 * IN, yc - 3.5 * IN, bz - 9 * IN, cx + 7 * IN, yc + 3.5 * IN, bz); a.ycyl(yc - 7 * IN, yc - 3.5 * IN, cx, bz - 4.5 * IN, 2 * IN, 14); a.circ(cx, yc, 7 * IN, 'EQUIP-DETAIL');
      for (const s of [-1, 1]) { const x = cx + s * W * 0.3; a.box(x - 3 * IN, yc - 3 * IN, bz - 5 * IN, x + 3 * IN, yc + 3 * IN, bz); a.xcyl(x - 3 * IN, x + 3 * IN, yc - 3.2 * IN, bz - 2.5 * IN, 1.5 * IN, 12); }
      if (v.clock) { const cw = 60 * IN; for (const s of [-1, 1]) a.tube([[cx + s * 26 * IN, yc, bz], [cx + s * 26 * IN, yc, bz - 12 * IN]], [0.5 * IN, 0.5 * IN], 6); a.box(cx - cw / 2, yc - 2 * IN, bz - 40 * IN, cx + cw / 2, yc + 2 * IN, bz - 12 * IN); for (let i = 0; i < 4; i++) digit(a, String([1, 0, 4, 7][i]), cx - cw / 2 + 5 * IN + i * 13 * IN + (i > 1 ? 3 * IN : 0), bz - 37 * IN, 11 * IN, 22 * IN, 2 * IN, yc - 2 * IN); for (const f of [0.35, 0.65]) a.box(cx - 0.8 * IN, yc - 2.4 * IN, bz - 40 * IN + 22 * IN * f + 4.5 * IN - 1 * IN, cx + 0.8 * IN, yc - 2 * IN, bz - 40 * IN + 22 * IN * f + 4.5 * IN + 1 * IN); }
    }
    a.log('Added the base plates, posts or legs, overhead beam, camera head with lens, lamps, banner or clock board and braces (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic soap-box racer',
  desc: (v) => `Wooden soap-box racer, ${v.seats === 1 ? 'one seat' : 'two seats'}: a floor board, two shaped side panels, ${v.seats === 1 ? 'a seat back' : 'two seat backs'}, a pivoting front axle with a steering wheel and rope, a fixed rear axle, four small pneumatic wheels with hubs and a brake lever${v.fair ? ', a rounded nose fairing and a tail fin' : ''}.`,
  vs: [
    ['one seat, 60 in', 32, 60, 28, 0, { seats: 1 }],
    ['two seat, 84 in', 32, 84, 28, 0, { seats: 2 }],
    ['one seat with fairing, 72 in', 32, 72, 32, 0, { seats: 1, fair: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, fr = 5 * IN, wx = W / 2 - 1.6 * IN, fy = YF + (v.fair ? 18 : 10) * IN, ry = YB - 8 * IN, fz = Z0 + 7 * IN;
    a.box(cx - 10 * IN, YF + (v.fair ? 14 : 8) * IN, fz, cx + 10 * IN, YB - 4 * IN, fz + 1.4 * IN);
    for (const s of [-1, 1]) { prismX(a, [[YB - 4 * IN, fz], [YB - 4 * IN, fz + 16 * IN], [YB - D * 0.5, fz + 15 * IN], [YF + (v.fair ? 24 : 20) * IN, fz + 11 * IN], [YF + (v.fair ? 14 : 8) * IN, fz + 6 * IN], [YF + (v.fair ? 14 : 8) * IN, fz]], s < 0 ? cx - 11.6 * IN : cx + 10 * IN, s < 0 ? cx - 10 * IN : cx + 11.6 * IN); a.rect(s < 0 ? cx - 11.6 * IN : cx + 10 * IN, YF + 8 * IN, s < 0 ? cx - 10 * IN : cx + 11.6 * IN, YB - 4 * IN, 'EQUIP-DETAIL'); }
    for (let k = 0; k < v.seats; k++) { const y = YB - 4 * IN - k * 30 * IN; a.box(cx - 10 * IN, y - 1.2 * IN, fz + 1.4 * IN, cx + 10 * IN, y, fz + 18 * IN); a.rect(cx - 10 * IN, y - 1.2 * IN, cx + 10 * IN, y, 'EQUIP-DETAIL'); }
    a.box(cx - wx, fy - 1.5 * IN, Z0 + 3.2 * IN, cx + wx, fy + 1.5 * IN, Z0 + 4.6 * IN); a.cyl(cx, fy, Z0 + 4.6 * IN, fz, 0.7 * IN, 10); a.circ(cx, fy, 0.9 * IN, 'EQUIP-DETAIL');
    a.xcyl(cx - wx - 1 * IN, cx + wx + 1 * IN, ry, Z0 + fr, 0.6 * IN, 10); for (const s of [-1, 1]) { tyre(a, cx + s * wx, fy, Z0 + fr, fr, 3 * IN); tyre(a, cx + s * wx, ry, Z0 + fr, fr, 3 * IN); }
    a.rect(cx - wx, fy - 1.5 * IN, cx + wx, fy + 1.5 * IN, 'EQUIP-DETAIL'); a.line(cx - wx, ry, cx + wx, ry, 'EQUIP-DETAIL');
    for (const s of [-1, 1]) a.tube([[cx + s * wx * 0.9, fy - 1 * IN, Z0 + 4 * IN], [cx + s * 6 * IN, YB - 20 * IN, fz + 7 * IN]], [0.12 * IN, 0.12 * IN], 5);
    const sy = YB - 22 * IN; a.tube([[cx, YF + 20 * IN, fz + 1.4 * IN], [cx, sy, fz + 10 * IN]], [0.7 * IN, 0.7 * IN], 8);
    a.tube(Array.from({ length: 17 }, (_, i) => [cx + 5 * IN * m.cos((i / 16) * TAU), sy - 1 * IN + 5 * IN * m.sin((i / 16) * TAU) * 0.25, fz + 10 * IN + 5 * IN * m.sin((i / 16) * TAU)]), Array(17).fill(0.4 * IN), 6);
    a.tube([[cx + 11.6 * IN, YB - 12 * IN, fz + 3 * IN], [cx + 11.6 * IN, YB - 12 * IN, fz + 10 * IN]], [0.35 * IN, 0.35 * IN], 6); a.box(cx + 11.4 * IN, YB - 16 * IN, fz + 10 * IN, cx + 12.4 * IN, YB - 9 * IN, fz + 11 * IN);
    if (v.fair) { a.ell(cx, YF + 16 * IN, fz + 4 * IN, 11.5 * IN, 14 * IN, 6.5 * IN, 18, 10); prismX(a, [[YB - 4 * IN, fz + 16 * IN], [YB, fz + 24 * IN], [YB, fz + 25 * IN], [YB - 8 * IN, fz + 16 * IN]], cx - 0.5 * IN, cx + 0.5 * IN); }
    a.outline('EQUIP-HIDDEN'); a.log('Added the floor board, side panels, seat backs, pivoting front axle with steering, rear axle, four wheels and brake lever (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic soap-box start ramp',
  desc: (v) => `Soap-box start ramp, ${v.ft} ft run: a thick sloped deck with a toothed non-slip top, two side guard rails, a drop-bar starting gate with two posts at the top, a landing apron at the foot and an A-frame of legs and cross braces under the deck.`,
  vs: [
    ['8 ft run', 60, 96 + 24, 40, 0, { ft: 8 }],
    ['12 ft run', 72, 144 + 24, 52, 0, { ft: 12 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, rh = H - 18 * IN, y0 = YF + 24 * IN;
    a.box(X0, YF, Z0, X1, y0, Z0 + 1.5 * IN); a.rect(X0, YF, X1, y0, 'EQUIP-DETAIL');
    prismX(a, [[y0, Z0 + 1.5 * IN], [YB, Z0 + rh], [YB, Z0 + rh + 3 * IN], [y0, Z0 + 4.5 * IN]], X0, X1);
    const zd = (y) => Z0 + 1.5 * IN + (rh - 1.5 * IN) * ((y - y0) / (YB - y0)) + 3 * IN;
    for (let y = y0 + 6 * IN; y < YB - 12 * IN; y += 6 * IN) a.box(X0 + 6 * IN, y, zd(y), X1 - 6 * IN, y + 1 * IN, zd(y) + 0.5 * IN);
    for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 1.5 * IN); prismX(a, [[y0, Z0 + 4.5 * IN], [YB, Z0 + rh + 3 * IN], [YB, Z0 + rh + 11 * IN], [y0, Z0 + 12.5 * IN]], x - 1.5 * IN, x + 1.5 * IN); a.rect(x - 1.5 * IN, y0, x + 1.5 * IN, YB, 'EQUIP'); }
    for (const t of [0.35, 0.7, 0.95]) { const y = y0 + (YB - y0) * t, z = Z0 + 4.5 * IN + (rh - 1.5 * IN) * t; for (const s of [-1, 1]) a.box(cx + s * (W / 2 - 4 * IN) - 1.5 * IN, y - 1.5 * IN, Z0, cx + s * (W / 2 - 4 * IN) + 1.5 * IN, y + 1.5 * IN, z); a.box(cx - W / 2 + 4 * IN, y - 0.8 * IN, z - 3 * IN, cx + W / 2 - 4 * IN, y + 0.8 * IN, z - 1.5 * IN); }
    a.tube([[X0 + 4 * IN, y0 + 12 * IN, Z0 + 4 * IN], [X0 + 4 * IN, YB - 12 * IN, Z0 + rh * 0.8]], [0.4 * IN, 0.4 * IN], 6); a.tube([[X1 - 4 * IN, y0 + 12 * IN, Z0 + 4 * IN], [X1 - 4 * IN, YB - 12 * IN, Z0 + rh * 0.8]], [0.4 * IN, 0.4 * IN], 6);
    const gy = YB - 8 * IN, gz = Z0 + rh + 3 * IN; for (const s of [-1, 1]) a.box(cx + s * (W / 2 - 6 * IN) - 1.2 * IN, gy - 1.2 * IN, gz, cx + s * (W / 2 - 6 * IN) + 1.2 * IN, gy + 1.2 * IN, gz + 14 * IN); a.tube([[cx - W / 2 + 6 * IN, gy, gz + 12 * IN], [cx + W / 2 - 6 * IN, gy, gz + 12 * IN]], [0.7 * IN, 0.7 * IN], 8); a.tube([[cx + W / 2 - 6 * IN, gy, gz + 12 * IN], [cx + W / 2 - 6 * IN, gy + 6 * IN, gz + 14 * IN]], [0.35 * IN, 0.35 * IN], 6);
    a.line(X0, y0, X1, y0, 'EQUIP-DETAIL'); a.line(cx - W / 2 + 6 * IN, gy, cx + W / 2 - 6 * IN, gy, 'EQUIP'); a.outline(); a.log('Added the deck with non-slip slats, guard rails, A-frame legs and braces, landing apron and the drop-bar gate (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic slot car track piece',
  desc: (v) => `${v.kind === 'straight' ? 'Straight' : v.kind === 'change' ? 'Lane-change straight' : v.kind === 'bridge' ? 'Humpback bridge' : 'Start and finish'} piece of a two-lane toy slot track: a base plate, two lanes each with a centre slot, braid strips beside the slot and raised guard curbs at both edges${v.kind === 'change' ? ', with two crossing switch flaps in the middle' : v.kind === 'bridge' ? ', with an arched deck rising to a crest on four piers' : v.kind === 'start' ? ', a chequer line across the lanes, and an arch gantry with a lap counter' : ''}.`,
  vs: [
    ['straight, 18 in', 6, 18, 1, 0, { kind: 'straight' }],
    ['lane change, 18 in', 6, 18, 1, 0, { kind: 'change' }],
    ['humpback bridge, 36 in', 6, 36, 6, 0, { kind: 'bridge' }],
    ['start and finish with lap counter, 18 in', 8, 18, 8, 0, { kind: 'start' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, pw = 6 * IN, px0 = cx - pw / 2, lc = [cx - 1.5 * IN, cx + 1.5 * IN], sl = 0.075 * IN, bt = 0.5 * IN, sf = bt + 0.15 * IN;
    const hump = v.kind === 'bridge' ? 4.5 * IN : 0, zdeck = (y) => (hump ? hump * m.sin(m.PI * (y - YF) / D) : 0);
    const segs = hump ? 14 : 1;
    for (let k = 0; k < segs; k++) {
      const ya = YF + (D * k) / segs, yb = YF + (D * (k + 1)) / segs, za = zdeck(ya), zb = zdeck(yb), P = (x0, x1, t0, t1) => prismX(a, [[ya, Z0 + za + t0], [yb, Z0 + zb + t0], [yb, Z0 + zb + t1], [ya, Z0 + za + t1]], x0, x1);
      P(px0, px0 + pw, 0, bt); for (const c of lc) { P(c - 1.4 * IN, c - sl, bt, sf); P(c + sl, c + 1.4 * IN, bt, sf); P(c - 1.4 * IN + 0.0, c - 1.25 * IN, sf, sf + 0.02 * IN); }
      P(px0, px0 + 0.25 * IN, bt, bt + 0.45 * IN); P(px0 + pw - 0.25 * IN, px0 + pw, bt, bt + 0.45 * IN);
    }
    if (hump) for (const y of [YF + 3 * IN, YB - 3 * IN]) for (const s of [-1, 1]) a.box(cx + s * 2.2 * IN - 0.5 * IN, y - 0.5 * IN, Z0, cx + s * 2.2 * IN + 0.5 * IN, y + 0.5 * IN, Z0 + zdeck(y) + 0.1 * IN);
    if (v.kind === 'change') for (const [ya, yb, s] of [[YF + 6 * IN, YB - 6 * IN, 1], [YF + 6 * IN, YB - 6 * IN, -1]]) { prismS(a, [[lc[s > 0 ? 0 : 1] - 0.7 * IN, ya], [lc[s > 0 ? 0 : 1] + 0.7 * IN, ya], [lc[s > 0 ? 1 : 0] + 0.7 * IN, yb], [lc[s > 0 ? 1 : 0] - 0.7 * IN, yb]], Z0 + sf, Z0 + sf + 0.05 * IN); a.line(lc[s > 0 ? 0 : 1], ya, lc[s > 0 ? 1 : 0], yb, 'EQUIP-DETAIL'); }
    if (v.kind === 'start') { a.box(px0, ((a.YF + a.YB) / 2) - 0.7 * IN, Z0 + sf, px0 + pw, ((a.YF + a.YB) / 2) + 0.7 * IN, Z0 + sf + 0.03 * IN); for (const s of [-1, 1]) a.box(cx + s * 3.7 * IN - 0.3 * IN, ((a.YF + a.YB) / 2) - 0.5 * IN, Z0, cx + s * 3.7 * IN + 0.3 * IN, ((a.YF + a.YB) / 2) + 0.5 * IN, Z0 + H - 1.5 * IN); a.box(cx - 4 * IN, ((a.YF + a.YB) / 2) - 0.7 * IN, Z0 + H - 1.5 * IN, cx + 4 * IN, ((a.YF + a.YB) / 2) + 0.7 * IN, Z0 + H); a.box(cx - 2 * IN, ((a.YF + a.YB) / 2) - 1 * IN, Z0 + H - 2.7 * IN, cx + 2 * IN, ((a.YF + a.YB) / 2) - 0.7 * IN + 1.4 * IN, Z0 + H - 1.5 * IN); for (let i = 0; i < 2; i++) digit(a, String(i + 3), cx - 1.6 * IN + i * 1.8 * IN, Z0 + H - 2.4 * IN, 1.3 * IN, 0.85 * IN, 0.18 * IN, ((a.YF + a.YB) / 2) - 1 * IN); a.rect(cx - 4 * IN, ((a.YF + a.YB) / 2) - 0.7 * IN, cx + 4 * IN, ((a.YF + a.YB) / 2) + 0.7 * IN, 'EQUIP-DETAIL'); }
    a.rect(px0, YF, px0 + pw, YB); for (const c of lc) { a.line(c, YF, c, YB, 'EQUIP-DETAIL'); a.line(c - 1.4 * IN, YF, c - 1.4 * IN, YB, 'EQUIP-HIDDEN'); a.line(c + 1.4 * IN, YF, c + 1.4 * IN, YB, 'EQUIP-HIDDEN'); }
    a.log('Added the base plate, two lanes with slots and braid strips, edge curbs and the switch flaps, bridge deck or lap counter gantry of this piece (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic slot car track curve',
  desc: (v) => `${v.kind === 'hair' ? 'Hairpin half-turn' : 'Ninety-degree curve'} piece of a two-lane toy slot track, centre radius ${v.R} in: a curved base plate, two lanes each with a centre slot and braid strips, an outer and an inner guard curb and a flat tab at each end.`,
  vs: [
    ['90 degree curve, 9 in radius', 12, 12, 1, 0, { kind: 'quarter', R: 9 }],
    ['half-turn hairpin, 6 in radius', 18, 9, 1, 0, { kind: 'hair', R: 6 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, R = v.R * IN, ox = v.kind === 'hair' ? cx : X0, oy = YB, t0 = v.kind === 'hair' ? -m.PI : -m.PI / 2, t1 = 0, st = v.kind === 'hair' ? 24 : 14, bt = 0.5 * IN, sf = bt + 0.15 * IN, sl = 0.075 * IN;
    arcBand(a, ox, oy, R - 3 * IN, R + 3 * IN, t0, t1, Z0, Z0 + bt, st);
    for (const rc of [R - 1.5 * IN, R + 1.5 * IN]) { arcBand(a, ox, oy, rc - 1.4 * IN, rc - sl, t0, t1, Z0 + bt, Z0 + sf, st); arcBand(a, ox, oy, rc + sl, rc + 1.4 * IN, t0, t1, Z0 + bt, Z0 + sf, st); for (const [rr, ly] of [[rc, 'EQUIP-DETAIL'], [rc - 1.4 * IN, 'EQUIP-HIDDEN'], [rc + 1.4 * IN, 'EQUIP-HIDDEN']]) for (let i = 0; i < st; i++) { const ta = t0 + ((t1 - t0) * i) / st, tb = t0 + ((t1 - t0) * (i + 1)) / st; a.line(ox + rr * m.cos(ta), oy + rr * m.sin(ta), ox + rr * m.cos(tb), oy + rr * m.sin(tb), ly); } }
    arcBand(a, ox, oy, R - 3 * IN, R - 2.75 * IN, t0, t1, Z0 + bt, Z0 + bt + 0.45 * IN, st); arcBand(a, ox, oy, R + 2.75 * IN, R + 3 * IN, t0, t1, Z0 + bt, Z0 + bt + 0.45 * IN, st);
    for (const [r0, r1] of [[R - 3 * IN, R + 3 * IN]]) { const pts = []; for (let i = 0; i <= st; i++) { const t = t0 + ((t1 - t0) * i) / st; pts.push([ox + r1 * m.cos(t), oy + r1 * m.sin(t)]); } for (let i = st; i >= 0; i--) { const t = t0 + ((t1 - t0) * i) / st; pts.push([ox + r0 * m.cos(t), oy + r0 * m.sin(t)]); } a.poly(pts); }
    for (const t of v.kind === 'hair' ? [t0, t1] : [t0, t1]) { const tx = ox + R * m.cos(t), ty = oy + R * m.sin(t); a.box(tx - 0.6 * IN, ty - 0.2 * IN, Z0, tx + 0.6 * IN, ty + 0.0, Z0 + 0.2 * IN); }
    a.log('Added the curved base plate, two lanes with slots and braid strips, outer and inner curbs and the end tabs (plan and 3D).');
  } }),

fam({ cat: 'speedrun/tracks', title: 'Generic athletics hurdle',
  desc: (v) => `Adjustable athletics hurdle, ${v.h} in high: two L-shaped weighted foot bars, two upright posts with height sleeves, a top rail board made of alternating bands, and an adjustable counterweight block on each foot.`,
  vs: [
    ['30 in', 48, 26, 30, 0, { h: 30 }],
    ['42 in', 48, 26, 42, 0, { h: 42 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, hx = [cx - W / 2 + 6 * IN, cx + W / 2 - 6 * IN];
    for (const x of hx) { a.box(x - 1 * IN, YF + 1 * IN, Z0, x + 1 * IN, YB - 1 * IN, Z0 + 1 * IN); a.rect(x - 1 * IN, YF + 1 * IN, x + 1 * IN, YB - 1 * IN); a.box(x - 1.8 * IN, YB - 10 * IN, Z0 + 1 * IN, x + 1.8 * IN, YB - 5 * IN, Z0 + 3.5 * IN); a.rect(x - 1.8 * IN, YB - 10 * IN, x + 1.8 * IN, YB - 5 * IN, 'EQUIP-DETAIL'); a.box(x - 0.7 * IN, yc - 0.7 * IN, Z0 + 1 * IN, x + 0.7 * IN, yc + 0.7 * IN, Z0 + H - 4 * IN); a.box(x - 1 * IN, yc - 1 * IN, Z0 + H * 0.45, x + 1 * IN, yc + 1 * IN, Z0 + H * 0.55); a.box(x - 1.1 * IN, yc - 1 * IN, Z0 + H - 4.5 * IN, x + 1.1 * IN, yc + 1 * IN, Z0 + H); }
    const n = 8, x0 = hx[0], x1 = hx[1]; for (let i = 0; i < n; i++) a.box(x0 + (x1 - x0) * i / n + 0.1, yc - 0.9 * IN, Z0 + H - 4 * IN, x0 + (x1 - x0) * (i + 1) / n - 0.1, yc + 0.9 * IN, Z0 + H);
    a.rect(x0, yc - 0.9 * IN, x1, yc + 0.9 * IN, 'EQUIP-DETAIL'); a.log('Added the foot bars with counterweights, upright posts with sleeves and the banded top rail (plan and 3D).');
  } }),

// ============================================================================================ speedrun/trophies
fam({ cat: 'speedrun/trophies', title: 'Generic winners podium',
  desc: (v) => `Winners podium of ${['one', 'two', 'three', 'four', 'five'][v.hs.length - 1]} ${v.hs.length === 1 ? 'block' : 'blocks'} with ${v.hs.length === 1 ? 'a grip-ribbed top and a raised numeral on the front face' : 'the tallest block for the winner, the others stepping down beside it, and raised numerals on the front faces'}, an overhanging top slab with a grip-ribbed surface and a recessed plinth under each block.`,
  vs: [
    ['three-step, 72 in', 72, 24, 16, 0, { hs: [12, 16, 8], ns: [2, 1, 3] }],
    ['three-step large, 108 in', 108, 30, 24, 0, { hs: [18, 24, 12], ns: [2, 1, 3] }],
    ['two-step, 48 in', 48, 24, 12, 0, { hs: [8, 12], ns: [2, 1] }],
    ['single winner step, 24 in', 24, 24, 14, 0, { hs: [14], ns: [1] }],
    ['five-place, 150 in', 150, 30, 20, 0, { hs: [8, 14, 20, 12, 4], ns: [4, 2, 1, 3, 5] }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, n = v.hs.length, bw = W / n, ts = 1.5 * IN;
    v.hs.forEach((h, i) => {
      const x0 = X0 + i * bw, x1 = x0 + bw, z1 = Z0 + h * IN, nh = m.min(h * IN * 0.45, bw * 0.5), dd = m.max(8, nh * 0.06), yf = YF + dd + 2;
      a.box(x0 + 1.5 * IN, yf + 1.5 * IN, Z0, x1 - 1.5 * IN, YB - 1.5 * IN, z1 - ts); a.box(x0, yf, z1 - ts, x1, YB, z1);
      for (let k = 1; k < 8; k++) a.box(x0 + 2 * IN, yf + (YB - yf) * k / 8 - 0.3 * IN, z1, x1 - 2 * IN, yf + (YB - yf) * k / 8 + 0.3 * IN, z1 + 0.15 * IN);
      digit(a, String(v.ns[i]), x0 + bw / 2 - nh * 0.3, Z0 + (h * IN - ts) * 0.28, nh * 0.6, nh, nh * 0.16, yf + 1.5 * IN);
      a.rect(x0, yf, x1, YB); a.rect(x0 + 1.5 * IN, yf + 1.5 * IN, x1 - 1.5 * IN, YB - 1.5 * IN, 'EQUIP-HIDDEN');
    });
    a.log('Added the blocks with their top slabs, grip ribs, recessed plinths and place numerals (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic leaderboard board',
  desc: (v) => `${v.wall ? 'Wall-mounted' : 'Free-standing'} leaderboard: a header bar, ${v.rows} ranked rows each with a seven-segment rank number, a name plate and ${v.score ? 'three score digits' : 'a score block'}, a frame around the panel${v.wall ? ' and a wall cleat on the back' : ', two upright legs with foot bars and a rear brace'}.`,
  vs: [
    ['5 rows, standing, 36 in', 36, 14, 60, 0, { rows: 5, score: true }],
    ['10 rows, standing, 48 in', 48, 14, 72, 0, { rows: 10, score: true }],
    ['20 rows, wall panel, 60 in', 60, 3, 84, 0, { rows: 20, score: false, wall: true }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, zb = Z0 + (v.wall ? 0 : 6 * IN), ph = H - (v.wall ? 0 : 6 * IN), t = 1.2 * IN, fy = v.wall ? YF + 1 * IN : YB - 4 * IN;
    if (!v.wall) for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 2 * IN); a.box(x - 1.2 * IN, YF + 1 * IN, Z0, x + 1.2 * IN, YB - 1 * IN, Z0 + 1.5 * IN); a.box(x - 1 * IN, YB - 5 * IN, Z0 + 1.5 * IN, x + 1 * IN, YB - 3 * IN, zb + 4 * IN); a.tube([[x, YB - 3 * IN, Z0 + 2 * IN], [x, YF + 1.5 * IN, Z0 + 2 * IN]], [0.01, 0.01], 3); a.tube([[x, YB - 4 * IN, zb + 6 * IN], [x, YF + 3 * IN, Z0 + 1.5 * IN]], [0.5 * IN, 0.5 * IN], 6); a.rect(x - 1.2 * IN, YF + 1 * IN, x + 1.2 * IN, YB - 1 * IN, 'EQUIP-DETAIL'); }
    a.box(X0, fy, zb, X1, fy + (v.wall ? 1.4 * IN : 2 * IN), zb + ph); a.frame(X0, zb, X1, zb + ph, fy - 0.8 * IN, fy + 0.8 * IN, t); a.rect(X0, fy - 0.8 * IN, X1, fy + 1.4 * IN);
    const hh = ph * 0.09, rh = (ph - hh - 2 * t) / v.rows, y = fy;
    a.box(X0 + t, y - 1.4 * IN, zb + ph - t - hh, X1 - t, y, zb + ph - t); for (let i = 0; i < 7; i++) a.box(X0 + W * 0.18 + i * W * 0.09, y - 1.9 * IN, zb + ph - t - hh * 0.75, X0 + W * 0.18 + i * W * 0.09 + W * 0.06, y - 1.4 * IN, zb + ph - t - hh * 0.25);
    for (let r = 0; r < v.rows; r++) {
      const z = zb + ph - t - hh - (r + 1) * rh, dh = rh * 0.6, dw = dh * 0.55, dep = m.max(8, dh * 0.06), yy = y - 0.35 * IN;
      a.box(X0 + t, y - 0.35 * IN, z + rh * 0.04, X1 - t, y, z + rh * 0.96);
      const rank = String(r + 1); const rx = X0 + W * 0.06 + (rank.length < 2 && v.rows >= 10 ? dw * 1.2 : 0);
      for (let k = 0; k < rank.length; k++) digit(a, rank[k], rx + k * dw * 1.3, z + rh * 0.2, dw, dh, dh * 0.15, yy);
      a.box(X0 + W * 0.2, y - 0.9 * IN, z + rh * 0.18, X0 + W * 0.62, y - 0.35 * IN, z + rh * 0.82);
      if (v.score) for (let k = 0; k < 3; k++) digit(a, String((r * 3 + k * 2 + 1) % 10), X0 + W * 0.68 + k * dw * 1.3, z + rh * 0.2, dw, dh, dh * 0.15, yy); else a.box(X0 + W * 0.68, y - 0.9 * IN, z + rh * 0.22, X1 - W * 0.07, y - 0.35 * IN, z + rh * 0.78);
    }
    if (v.wall) { a.box(X0 + W * 0.1, YB - 0.6 * IN, Z0 + H * 0.2, X1 - W * 0.1, YB, Z0 + H * 0.2 + 2.5 * IN); }
    a.log('Added the frame, header bar, ranked rows with rank numerals, name plates and scores, and the legs or wall cleat (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic speed trophy',
  desc: (v) => v.kind === 'cup' ? 'Winner cup: a turned cup with a flared bowl and two ear handles on a stepped square base with an engraving plate.'
    : v.kind === 'lid' ? 'Lidded winner cup: a turned cup with two ear handles, a domed lid and a five-point star finial, on a stepped square base with an engraving plate.'
    : v.kind === 'column' ? 'Column trophy: a fluted round column on a stepped square base with an engraving plate and a five-point star on the top.'
    : 'Stopwatch trophy: a square base with an engraving plate and two posts carrying a large stopwatch with a crown, a bezel and two hands.',
  vs: [
    ['winner cup, 12 in', 6, 6, 12, 0, { kind: 'cup' }],
    ['lidded winner cup, 20 in', 8, 8, 20, 0, { kind: 'lid' }],
    ['column with star, 16 in', 6, 6, 16, 0, { kind: 'column' }],
    ['stopwatch on posts, 14 in', 8, 5, 14, 0, { kind: 'watch' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, ph = H * (v.kind === 'watch' ? 0.14 : 0.16);
    a.box(X0, YF, Z0, X1, YB, Z0 + ph * 0.55); a.box(X0 + W * 0.08, YF + D * 0.08, Z0 + ph * 0.55, X1 - W * 0.08, YB - D * 0.08, Z0 + ph); a.box(cx - W * 0.2, YF + D * 0.08 - 2, Z0 + ph * 0.6, cx + W * 0.2, YF + D * 0.08, Z0 + ph * 0.92);
    a.rect(X0, YF, X1, YB); a.rect(X0 + W * 0.08, YF + D * 0.08, X1 - W * 0.08, YB - D * 0.08, 'EQUIP-DETAIL');
    const z0 = Z0 + ph, rh = H - ph;
    if (v.kind === 'cup' || v.kind === 'lid') {
      const R = W * 0.3, top = v.kind === 'lid' ? 0.62 : 0.92;
      lathe(a, cx, yc, z0, [[0, R * 0.6], [rh * 0.04, R * 0.5], [rh * 0.1, R * 0.2], [rh * 0.28, R * 0.14], [rh * 0.32, R * 0.3], [rh * 0.35, R * 0.14], [rh * 0.4, R * 0.22], [rh * 0.5, R * 0.6], [rh * 0.65, R * 0.95], [rh * top, R * 1.0]], 22);
      const hz = z0 + rh * 0.55; for (const s of [-1, 1]) a.tube([[cx + s * R * 0.9, yc, hz + rh * 0.1], [cx + s * R * 1.3, yc, hz + rh * 0.12], [cx + s * R * 1.42, yc, hz], [cx + s * R * 1.15, yc, hz - rh * 0.1], [cx + s * R * 0.7, yc, hz - rh * 0.06]], Array(5).fill(R * 0.09), 8);
      if (v.kind === 'lid') { const lz = z0 + rh * 0.62; a.tube([[cx, yc, lz], [cx, yc, lz + rh * 0.04], [cx, yc, lz + rh * 0.12], [cx, yc, lz + rh * 0.17]], [R * 1.02, R * 0.9, R * 0.42, R * 0.1], 22); prismSY(a, starPts(cx, lz + rh * 0.17 + R * 0.62, R * 0.65, R * 0.28, 5, m.PI / 2), yc - R * 0.07, yc + R * 0.07); }
      a.circ(cx, yc, R, 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.14, 'EQUIP-DETAIL');
    } else if (v.kind === 'column') {
      const R = W * 0.2; lathe(a, cx, yc, z0, [[0, R * 1.5], [rh * 0.05, R * 1.5], [rh * 0.07, R * 1.1], [rh * 0.1, R], [rh * 0.7, R * 0.88], [rh * 0.74, R * 1.05], [rh * 0.78, R * 1.05]], 14);
      for (let k = 0; k < 8; k++) { const t = (k * TAU) / 8; a.box(cx + R * 0.95 * m.cos(t) - 0.25 * IN, yc + R * 0.95 * m.sin(t) - 0.25 * IN, z0 + rh * 0.12, cx + R * 0.95 * m.cos(t) + 0.25 * IN, yc + R * 0.95 * m.sin(t) + 0.25 * IN, z0 + rh * 0.68); }
      prismSY(a, starPts(cx, z0 + rh * 0.78 + R * 1.35, R * 1.4, R * 0.58, 5, m.PI / 2), yc - R * 0.18, yc + R * 0.18); a.circ(cx, yc, R * 1.5, 'EQUIP-DETAIL'); a.circ(cx, yc, R, 'EQUIP-DETAIL');
    } else {
      const R = H * 0.27, zc = z0 + rh * 0.5 + R * 0.2; for (const s of [-1, 1]) a.box(cx + s * W * 0.32 - 0.5 * IN, yc - 0.6 * IN, z0, cx + s * W * 0.32 + 0.5 * IN, yc + 0.6 * IN, zc + R * 0.4);
      a.ycyl(yc - D * 0.14, yc + D * 0.14, cx, zc, R, 28); a.ycyl(yc - D * 0.14 - 1, yc - D * 0.14 + 2, cx, zc, R * 1.06, 28); a.ycyl(yc - D * 0.14 - 3, yc - D * 0.14 - 1, cx, zc, R * 0.88, 28);
      for (let i = 0; i < 12; i++) { const t = (i * TAU) / 12; a.box(cx + R * 0.76 * m.sin(t) - 0.12 * IN, yc - D * 0.14 - 4, zc + R * 0.76 * m.cos(t) - 0.18 * IN, cx + R * 0.76 * m.sin(t) + 0.12 * IN, yc - D * 0.14 - 3, zc + R * 0.76 * m.cos(t) + 0.18 * IN); }
      a.tube([[cx, yc - D * 0.14 - 5, zc], [cx + R * 0.45 * m.sin(0.8), yc - D * 0.14 - 5, zc + R * 0.45 * m.cos(0.8)]], [0.1 * IN, 0.06 * IN], 6); a.tube([[cx, yc - D * 0.14 - 6, zc], [cx + R * 0.65 * m.sin(3.5), yc - D * 0.14 - 6, zc + R * 0.65 * m.cos(3.5)]], [0.06 * IN, 0.04 * IN], 6);
      a.cyl(cx, yc, zc + R * 0.98, zc + R * 1.2, R * 0.12, 10); a.cyl(cx, yc, zc + R * 1.2, zc + R * 1.3, R * 0.2, 12); a.circ(cx, yc, R * 0.14, 'EQUIP-DETAIL'); a.rect(cx - R, yc - D * 0.14, cx + R, yc + D * 0.14, 'EQUIP-DETAIL');
    }
    a.log('Added the stepped base with plate and the cup, column or stopwatch of this trophy (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic medal display stand',
  desc: (v) => `Medal stand with ${v.tiers} ${v.tiers === 1 ? 'rod' : 'tiered rods'} held on a slanted back board between two uprights with foot bars, carrying ${v.n} medals: each a round disc with a raised centre boss and a short ribbon hanging from the rod.`,
  vs: [
    ['6 medals, 20 in', 20, 8, 16, 0, { tiers: 1, n: 6 }],
    ['12 medals, 22 in', 22, 9, 24, 0, { tiers: 2, n: 12 }],
    ['24 medals, 36 in', 36, 10, 38, 0, { tiers: 3, n: 24 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, per = v.n / v.tiers, bw = W - 4 * IN;
    for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 1 * IN); a.box(x - 0.9 * IN, YF + 0.5 * IN, Z0, x + 0.9 * IN, YB - 0.5 * IN, Z0 + 1.2 * IN); a.rect(x - 0.9 * IN, YF + 0.5 * IN, x + 0.9 * IN, YB - 0.5 * IN, 'EQUIP-DETAIL'); prismX(a, [[YB - 3 * IN, Z0 + 1.2 * IN], [YB - 1 * IN, Z0 + 1.2 * IN], [YB - 1 * IN, Z0 + H], [YB - 3 * IN, Z0 + H - 1 * IN]], x - 0.7 * IN, x + 0.7 * IN); }
    a.box(cx - W / 2 + 1.5 * IN, YB - 1.6 * IN, Z0 + 2 * IN, cx + W / 2 - 1.5 * IN, YB - 0.8 * IN, Z0 + H - 0.5 * IN);
    for (let t = 0; t < v.tiers; t++) {
      const rz = Z0 + H - 3.5 * IN - t * ((H - 8 * IN) / v.tiers), ry = YB - 3.5 * IN - t * 0.2 * IN;
      a.xcyl(cx - bw / 2, cx + bw / 2, ry, rz, 0.3 * IN, 8); for (const s of [-1, 1]) a.tube([[cx + s * bw / 2, YB - 1.6 * IN, rz], [cx + s * bw / 2, ry, rz]], [0.25 * IN, 0.25 * IN], 6);
      for (let i = 0; i < per; i++) { const x = cx - bw / 2 + (bw * (i + 0.5)) / per; a.box(x - 0.4 * IN, ry - 0.1 * IN, rz - 5 * IN, x + 0.4 * IN, ry + 0.1 * IN, rz); a.ycyl(ry - 0.45 * IN, ry - 0.15 * IN, x, rz - 6.3 * IN, 1.3 * IN, 20); a.ycyl(ry - 0.6 * IN, ry - 0.45 * IN, x, rz - 6.3 * IN, 0.5 * IN, 12); a.circ(x, ry - 0.3 * IN, 1.3 * IN, 'EQUIP-DETAIL'); }
    }
    a.rect(cx - W / 2 + 1.5 * IN, YB - 1.6 * IN, cx + W / 2 - 1.5 * IN, YB - 0.8 * IN); a.log('Added the uprights with foot bars, slanted back board, rods and the hanging medals with ribbons and centre bosses (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic run scoreboard',
  desc: (v) => v.kind === 'table' ? 'Tabletop scoreboard: a case with a bezel, two groups of two seven-segment digits with a divider, two rear support feet and a cable gland.'
    : v.kind === 'clock' ? 'Wall clock scoreboard: a long case with a bezel, four large seven-segment digits with a colon, two mounting tabs and a cable gland.'
    : 'Standing event scoreboard: a large case on two posts with foot bars, a four-digit timer row on top, two groups of two score digits below, a horn on top and a rear brace on each post.',
  vs: [
    ['tabletop two-score, 24 in', 24, 6, 12, 0, { kind: 'table', txt: '0712' }],
    ['wall clock, 48 in', 48, 4, 14, 0, { kind: 'clock', txt: '0359' }],
    ['standing event board, 96 in', 96, 20, 78, 0, { kind: 'stand', txt: '0245' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, st = v.kind === 'stand', zb = Z0 + (st ? 24 * IN : v.kind === 'table' ? 1.5 * IN : 0), bh = Z0 + H - zb - (st ? 6 * IN : 0), cd = st ? 6 * IN : D, fy = st ? YB - 7 * IN : YF + 0.45 * IN;
    if (st) { for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 4 * IN); a.box(x - 1.5 * IN, YB - 10 * IN, Z0, x + 1.5 * IN, YB - 2 * IN, Z0 + 1.2 * IN); a.box(x - 1.2 * IN, YB - 8 * IN, Z0 + 1.2 * IN, x + 1.2 * IN, YB - 4 * IN, zb + 2 * IN); a.tube([[x, YB - 4 * IN, zb - 6 * IN], [x, YF + 1 * IN, Z0 + 1 * IN]], [0.5 * IN, 0.5 * IN], 6); a.rect(x - 1.5 * IN, YF + 1 * IN, x + 1.5 * IN, YB - 2 * IN, 'EQUIP-DETAIL'); } a.box(X0 + 4 * IN, YB - 7 * IN, zb, X1 - 4 * IN, YB - 1 * IN, zb + bh); a.rect(X0 + 4 * IN, YB - 7 * IN, X1 - 4 * IN, YB - 1 * IN); a.cyl(cx, YB - 4 * IN, zb + bh, zb + bh + 5 * IN, 2 * IN, 14); a.cone(cx, YB - 4 * IN, zb + bh + 5 * IN, zb + bh + 9 * IN, 2 * IN, 3.2 * IN, 14); }
    else { a.box(X0, YB - D + 0.45 * IN, zb, X1, YB, zb + bh); a.frame(X0, zb, X1, zb + bh, YF, YB - D + 0.45 * IN + 0.01, bh * 0.08); a.rect(X0, YF, X1, YB); }
    const tx0 = st ? X0 + 4 * IN : X0, tw = st ? W - 8 * IN : W;
    const fz = st ? zb : zb;
    if (v.kind === 'table') { for (const s of [-1, 1]) { prismX(a, [[YB - 1.5 * IN, Z0], [YB, Z0 + 1.5 * IN], [YB, zb + 3 * IN], [YB - 1.5 * IN, zb + 3 * IN]], cx + s * W * 0.4 - 0.7 * IN, cx + s * W * 0.4 + 0.7 * IN); } for (let i = 0; i < 4; i++) digit(a, v.txt[i], X0 + W * 0.08 + i * W * 0.21 + (i > 1 ? W * 0.08 : 0), zb + bh * 0.18, W * 0.17, bh * 0.64, W * 0.035, fy); a.box(cx - 0.4 * IN, fy - 0.35 * IN, zb + bh * 0.1, cx + 0.4 * IN, fy, zb + bh * 0.9); }
    else if (v.kind === 'clock') { for (let i = 0; i < 4; i++) digit(a, v.txt[i], X0 + W * 0.08 + i * W * 0.2 + (i > 1 ? W * 0.1 : 0), zb + bh * 0.16, W * 0.17, bh * 0.68, W * 0.034, fy); for (const f of [0.34, 0.62]) a.box(cx - 0.5 * IN, fy - 0.35 * IN, zb + bh * f, cx + 0.5 * IN, fy, zb + bh * f + 1 * IN); for (const s of [-1, 1]) { a.box(cx + s * (W / 2 - 1 * IN) - 0.5 * IN, YB - 0.3 * IN, zb + bh * 0.5 - 0.5 * IN, cx + s * (W / 2 - 1 * IN) + 0.5 * IN, YB + 0.01, zb + bh * 0.5 + 0.5 * IN); } a.ycyl(YB - 1.2 * IN, YB - 0.2 * IN, cx, zb + 0.4 * IN, 0.28 * IN, 10); }
    else { for (let i = 0; i < 4; i++) digit(a, v.txt[i], tx0 + tw * 0.2 + i * tw * 0.15 + (i > 1 ? tw * 0.08 : 0), zb + bh * 0.58, tw * 0.12, bh * 0.28, tw * 0.025, fy); for (let i = 0; i < 4; i++) digit(a, String((i * 3 + 1) % 10), tx0 + tw * 0.08 + i * tw * 0.19 + (i > 1 ? tw * 0.2 : 0), zb + bh * 0.1, tw * 0.16, bh * 0.36, tw * 0.032, fy); for (const f of [0.66, 0.8]) a.box(cx - 1 * IN, fy - 0.4 * IN, zb + bh * f, cx + 1 * IN, fy, zb + bh * f + 2 * IN); a.box(cx - 0.5 * IN, fy - 0.4 * IN, zb + bh * 0.14, cx + 0.5 * IN, fy, zb + bh * 0.46); a.rect(tx0, fy, tx0 + tw, YB - 1 * IN, 'EQUIP-DETAIL'); }
    a.log('Added the case or posts, bezel, the seven-segment digit groups, divider or colon, feet or tabs and horn where fitted (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic event banner stand',
  desc: (v) => v.kind === 'roll' ? 'Roll-up banner stand: a cassette base with end caps and two foot plates, a telescoping pole behind the printed panel, a top bar with two clips and a panel hanging from the bar.'
    : v.kind === 'xframe' ? 'X-frame banner stand: two crossed tubes with a lower and an upper cross bar and four corner pegs holding a stretched banner panel, standing on two rubber foot tubes.'
    : 'Feather flag: a flexible curved pole with a feather-shaped sail sleeved on its length, a cross-shaped ground base with a socket and a short stabiliser tube.',
  vs: [
    ['roll-up, 33 in wide', 34, 12, 88, 0, { kind: 'roll' }],
    ['X-frame, 24 in wide', 28, 14, 66, 0, { kind: 'xframe' }],
    ['feather flag, 12 ft', 44, 44, 144, 0, { kind: 'flag' }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2;
    if (v.kind === 'roll') {
      a.box(X0, yc - 2.5 * IN, Z0 + 0.6 * IN, X1, yc + 2.5 * IN, Z0 + 5 * IN); a.xcyl(X0 - 0.01, X1 + 0.01, yc, Z0 + 3.2 * IN, 2.2 * IN, 16); for (const s of [-1, 1]) { a.box(cx + s * W * 0.4 - 1.5 * IN, YF + 0.5 * IN, Z0, cx + s * W * 0.4 + 1.5 * IN, YB - 0.5 * IN, Z0 + 0.8 * IN); a.rect(cx + s * W * 0.4 - 1.5 * IN, YF + 0.5 * IN, cx + s * W * 0.4 + 1.5 * IN, YB - 0.5 * IN, 'EQUIP-DETAIL'); }
      a.box(X0 + 0.5 * IN, yc - 0.15 * IN, Z0 + 5 * IN, X1 - 0.5 * IN, yc + 0.15 * IN, Z0 + H - 1.5 * IN); a.tube([[cx, yc + 0.8 * IN, Z0 + 5 * IN], [cx, yc + 0.8 * IN, Z0 + H - 0.4 * IN]], [0.5 * IN, 0.4 * IN], 8); a.xcyl(X0 + 0.5 * IN, X1 - 0.5 * IN, yc, Z0 + H - 0.9 * IN, 0.5 * IN, 8); for (const s of [-1, 1]) a.box(cx + s * W * 0.38 - 0.7 * IN, yc - 0.5 * IN, Z0 + H - 2.2 * IN, cx + s * W * 0.38 + 0.7 * IN, yc + 0.5 * IN, Z0 + H - 0.4 * IN);
      a.rect(X0, yc - 2.5 * IN, X1, yc + 2.5 * IN); a.rect(X0 + 0.5 * IN, yc - 0.15 * IN, X1 - 0.5 * IN, yc + 0.15 * IN, 'EQUIP-DETAIL');
    } else if (v.kind === 'xframe') {
      const x0 = X0 + 1 * IN, x1 = X1 - 1 * IN, zb = Z0 + 3 * IN, zt = Z0 + H - 2 * IN; a.tube([[x0, yc, zb], [x1, yc, zt]], [0.4 * IN, 0.4 * IN], 8); a.tube([[x1, yc, zb], [x0, yc, zt]], [0.4 * IN, 0.4 * IN], 8);
      a.tube([[x0, yc, zb - 0.01], [x1, yc, zb]], [0.01, 0.01], 3); for (const [x, z] of [[x0, zb], [x1, zb], [x0, zt], [x1, zt]]) a.ycyl(yc - 1.2 * IN, yc + 0.2 * IN, x, z, 0.35 * IN, 8);
      a.box(x0 + 0.5 * IN, yc - 1.4 * IN, zb - 0.5 * IN, x1 - 0.5 * IN, yc - 1.1 * IN, zt + 0.5 * IN); for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 0.8 * IN, YF + 1 * IN, Z0, cx + s * W * 0.4 + 0.8 * IN, YB - 1 * IN, Z0 + 1 * IN); a.box(x0, yc - 0.4 * IN, zb + (zt - zb) * 0.3 - 0.3 * IN, x1, yc + 0.4 * IN, zb + (zt - zb) * 0.3 + 0.3 * IN);
      a.rect(x0, yc - 1.4 * IN, x1, yc - 1.1 * IN); a.rect(X0, YF + 1 * IN, X1, YB - 1 * IN, 'EQUIP-HIDDEN');
    } else {
      const arm = 20 * IN; a.cyl(cx, yc, Z0, Z0 + 5 * IN, 2.2 * IN, 14); for (const k of [0, 1, 2, 3]) { const t = (k * m.PI) / 2 + m.PI / 4; a.box(cx + (k % 2 ? 0 : 0) - 1.2 * IN, yc - 1.2 * IN, Z0, cx + 1.2 * IN, yc + 1.2 * IN, Z0 + 1.5 * IN); const ex = cx + arm * m.cos(t) * 0.98, ey = yc + arm * m.sin(t) * 0.98; a.tube([[cx, yc, Z0 + 0.8 * IN], [ex, ey, Z0 + 0.8 * IN]], [0.9 * IN, 0.9 * IN], 6); a.cyl(ex, ey, Z0, Z0 + 1.3 * IN, 1.1 * IN, 8); a.line(cx, yc, ex, ey, 'EQUIP'); }
      a.circ(cx, yc, 2.2 * IN, 'EQUIP-DETAIL'); a.tube([[cx, yc, Z0 + 5 * IN], [cx, yc, Z0 + H * 0.5], [cx + 1.5 * IN, yc, Z0 + H * 0.8], [cx + 5 * IN, yc, Z0 + H - 3 * IN]], [0.7 * IN, 0.45 * IN, 0.35 * IN, 0.3 * IN], 8);
      prismY(a, [[cx + 0.8 * IN, Z0 + H * 0.22], [cx + 1.3 * IN, Z0 + H * 0.72], [cx + 4.5 * IN, Z0 + H - 3.5 * IN], [cx + 15 * IN, Z0 + H * 0.74], [cx + 17 * IN, Z0 + H * 0.5], [cx + 13 * IN, Z0 + H * 0.3]], yc - 0.15 * IN, yc + 0.15 * IN);
      a.rect(cx, yc - 0.15 * IN, cx + 17 * IN, yc + 0.15 * IN, 'EQUIP-DETAIL');
    }
    a.log('Added the base or cassette, pole or crossed tubes, clips and the banner panel or feather sail (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic trophy display cabinet',
  desc: (v) => `Glazed trophy cabinet: a plinth, two side panels, a back, a cornice, ${v.doors} framed ${v.doors === 1 ? 'door' : 'doors'} with a stile and a mid rail and a bar pull each, ${v.shelves} shelves and ${v.shelves * v.cups} small cups with plinths standing on the shelves.`,
  vs: [
    ['one door, 36 in', 36, 14, 72, 0, { doors: 1, shelves: 3, cups: 4 }],
    ['two doors, 60 in', 60, 16, 78, 0, { doors: 2, shelves: 4, cups: 6 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, t = 1 * IN, ph = 4 * IN, ch = 4 * IN, top = Z0 + H - ch;
    a.box(X0, YF + 0.5 * IN, Z0, X1, YB, Z0 + ph); a.box(X0, YF, Z0 + ph, X0 + t, YB, top); a.box(X1 - t, YF, Z0 + ph, X1, YB, top); a.box(X0 + t, YB - 0.5 * IN, Z0 + ph, X1 - t, YB, top); a.box(X0 - 0.01, YF, top, X1 + 0.01, YB, Z0 + H); a.box(X0 + t, YF + 0.5 * IN, Z0 + ph, X1 - t, YB - 0.5 * IN, Z0 + ph + 0.6 * IN);
    a.rect(X0, YF, X1, YB); a.rect(X0 + t, YF + 0.5 * IN, X1 - t, YB - 0.5 * IN, 'EQUIP-HIDDEN');
    const ih = top - Z0 - ph - 0.6 * IN;
    for (let s = 0; s < v.shelves; s++) { const sz = Z0 + ph + 0.6 * IN + ((s) * ih) / v.shelves; if (s) a.box(X0 + t, YF + 1.5 * IN, sz, X1 - t, YB - 0.5 * IN, sz + 0.4 * IN);
      const sw = (W - 2 * t) / v.cups, cz = sz + (s ? 0.4 * IN : 0.01);
      for (let c = 0; c < v.cups; c++) { const x = X0 + t + sw * (c + 0.5), y = YF + D * 0.5, ch2 = ih / v.shelves * 0.62 * (0.8 + 0.2 * ((c * 3 + s) % 3) / 2); a.box(x - sw * 0.25, y - 1.2 * IN, cz, x + sw * 0.25, y + 1.2 * IN, cz + 0.7 * IN); lathe(a, x, y, cz + 0.7 * IN, [[0, 0.5 * IN], [ch2 * 0.1, 0.25 * IN], [ch2 * 0.45, 0.2 * IN], [ch2 * 0.6, 0.7 * IN], [ch2, 1.0 * IN]], 12); a.circ(x, y, 1.0 * IN, 'EQUIP-DETAIL'); } }
    const dw = (W - 2 * t) / v.doors;
    for (let d = 0; d < v.doors; d++) { const x0 = X0 + t + d * dw + 0.1 * IN, x1 = X0 + t + (d + 1) * dw - 0.1 * IN; a.frame(x0, Z0 + ph + 0.8 * IN, x1, top - 0.2 * IN, YF - 0.3 * IN, YF + 0.7 * IN, 1.3 * IN); a.box(x0 + 1.3 * IN, YF - 0.2 * IN, Z0 + ph + ih * 0.5 - 0.3 * IN, x1 - 1.3 * IN, YF + 0.5 * IN, Z0 + ph + ih * 0.5 + 0.3 * IN); const px = v.doors === 1 ? x1 - 2 * IN : (d === 0 ? x1 - 1 * IN : x0 + 1 * IN); a.box(px - 0.25 * IN, YF - 1.2 * IN, Z0 + H * 0.4, px + 0.25 * IN, YF - 0.3 * IN, Z0 + H * 0.58); }
    a.log('Added the plinth, sides, back, cornice, framed doors with pulls, shelves and the small cups on plinths (plan and 3D).');
  } }),

fam({ cat: 'speedrun/trophies', title: 'Generic finish arch',
  desc: (v) => `Inflatable-style finish arch, ${v.span} ft span: two ribbed round columns on square weight bases, a curved top beam as a thick tube, a banner board on the front face with chequer squares, and four guy lines to ground stakes.`,
  vs: [
    ['20 ft span', 270, 40, 150, 0, { span: 20 }],
    ['30 ft span', 400, 54, 180, 0, { span: 30 }]],
  build: (a, v) => {
    const { cx, YF, YB, Z0, X0, X1, W, D, H } = a, yc = (YF + YB) / 2, sp = v.span * 12 * IN, r = H * 0.062, bz = H * 0.8;
    for (const s of [-1, 1]) { const x = cx + s * sp / 2; a.box(x - 12 * IN, yc - 12 * IN, Z0, x + 12 * IN, yc + 12 * IN, Z0 + 4 * IN); a.rect(x - 12 * IN, yc - 12 * IN, x + 12 * IN, yc + 12 * IN); const prof = []; for (let i = 0; i <= 16; i++) prof.push([i / 16 * (bz - 4 * IN), r * (1 + 0.12 * m.sin(i * m.PI))]); lathe(a, x, yc, Z0 + 4 * IN, prof.map(([z, rr]) => [z, rr]), 18); a.circ(x, yc, r, 'EQUIP-DETAIL'); }
    const pts = [], rs = []; for (let i = 0; i <= 18; i++) { const f = i / 18; pts.push([cx - sp / 2 + sp * f, yc, Z0 + bz + m.sin(f * m.PI) * H * 0.14]); rs.push(r * 0.95); } a.tube(pts, rs, 14);
    a.line(cx - sp / 2, yc, cx + sp / 2, yc, 'EQUIP-DETAIL');
    const bx0 = cx - sp / 2 + r * 1.4, bx1 = cx + sp / 2 - r * 1.4, bh = H * 0.1, bzz = Z0 + bz - H * 0.17; a.box(bx0, yc - r * 0.95 - 3 * IN, bzz, bx1, yc - r * 0.95, bzz + bh);
    const nq = m.round((bx1 - bx0) / bh / 1.0); for (let i = 0; i < nq; i++) for (let k = 0; k < 2; k++) if ((i + k) % 2 === 0) a.box(bx0 + ((bx1 - bx0) * i) / nq, yc - r * 0.95 - 4.5 * IN, bzz + (bh / 2) * k, bx0 + ((bx1 - bx0) * (i + 1)) / nq, yc - r * 0.95 - 3 * IN, bzz + (bh / 2) * (k + 1));
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const x = cx + sx * sp / 2, ex = cx + sx * (W / 2 - 2 * IN), ey = yc + sy * (D / 2 - 3 * IN); a.tube([[x, yc, Z0 + bz * 0.9], [ex, ey, Z0 + 2 * IN]], [0.35 * IN, 0.3 * IN], 5); a.cyl(ex, ey, Z0, Z0 + 5 * IN, 0.7 * IN, 6); a.line(x, yc, ex, ey, 'EQUIP-DETAIL'); }
    a.log('Added the ribbed columns on weight bases, the curved top beam, the chequer banner board and the guy lines with stakes (plan and 3D).');
  } }),
];

/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, toys: more building toys, toy vehicles and track, playsets and animals, games, instruments and ride-ons. Original geometry; generic by type and size class. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = m.PI;

// ------------------------------------------------------------------------------------------ helpers
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
/** a solid of revolution about a vertical axis at (cx, cy): prof is [[radius, height above z0], ...] bottom to top */
function lathe(a, cx, cy, z0, prof, seg = 16, cap = true) {
  const P = (r, z, j) => { const t = (2 * PI * j) / seg; return [cx + r * m.cos(t), cy + r * m.sin(t), z0 + z]; };
  for (let i = 0; i < prof.length - 1; i++) for (let j = 0; j < seg; j++) {
    const [r0, h0] = prof[i], [r1, h1] = prof[i + 1];
    a.t.push([P(r0, h0, j), P(r0, h0, j + 1), P(r1, h1, j + 1)], [P(r0, h0, j), P(r1, h1, j + 1), P(r1, h1, j)]);
  }
  if (cap) {
    const [rb, hb] = prof[0], [rt, ht] = prof[prof.length - 1];
    for (let j = 0; j < seg; j++) { if (rb > 0.01) a.t.push([[cx, cy, z0 + hb], P(rb, hb, j + 1), P(rb, hb, j)]); if (rt > 0.01) a.t.push([[cx, cy, z0 + ht], P(rt, ht, j), P(rt, ht, j + 1)]); }
  }
  return a;
}
/** a flat horizontal ring (tube loop) */
function ring(a, cx, cy, z, R, r, n = 18, seg = 6) { const pts = []; for (let i = 0; i <= n; i++) { const t = (2 * PI * i) / n; pts.push([cx + R * m.cos(t), cy + R * m.sin(t), z]); } a.tube(pts, pts.map(() => r), seg); }
/** a ring standing in the X-Z plane (faces -Y) */
function xzring(a, x, y, z, R, r, n = 14, seg = 5) { const pts = []; for (let i = 0; i <= n; i++) { const t = (2 * PI * i) / n; pts.push([x + R * m.cos(t), y, z + R * m.sin(t)]); } a.tube(pts, pts.map(() => r), seg); }
/** a ring standing in the Y-Z plane (faces the side) */
function vring(a, x, y, z, R, r, n = 14, seg = 5) { const pts = []; for (let i = 0; i <= n; i++) { const t = (2 * PI * i) / n; pts.push([x, y + R * m.cos(t), z + R * m.sin(t)]); } a.tube(pts, pts.map(() => r), seg); }
function sph(a, x, y, z, r, nu = 12, nv = 7) { a.ell(x, y, z, r, r, r, nu, nv); }
/** a toy wheel: tyre, rim and hub on a lateral axle */
function tw(a, x, y, R, w, z = null) { const zc = z ?? a.Z0 + R; a.xcyl(x - w / 2, x + w / 2, y, zc, R, 14); a.xcyl(x - w / 2 - 1.5, x + w / 2 + 1.5, y, zc, R * 0.55, 10); a.xcyl(x - w / 2 - 3, x + w / 2 + 3, y, zc, R * 0.15, 6); a.rect(x - w / 2, y - R, x + w / 2, y + R, 'EQUIP-DETAIL'); }
/** a thin sloped pane over the segment A->B (y,z) offset outward by off, across x0..x1 */
function pane(a, A, B, off, x0, x1, th = 2) { const dy = B[0] - A[0], dz = B[1] - A[1], L = m.hypot(dy, dz) || 1; let ny = -dz / L, nz = dy / L; if (ny > 0) { ny = -ny; nz = -nz; } prismX(a, [[A[0] + ny * off, A[1] + nz * off], [B[0] + ny * off, B[1] + nz * off], [B[0] + ny * (off + th), B[1] + nz * (off + th)], [A[0] + ny * (off + th), A[1] + nz * (off + th)]], x0, x1); }
/** a double-sided flat quad */
function quad(a, p, q, r, s) { a.t.push([p, q, r], [p, r, s], [p, r, q], [p, s, r]); }
/** a rotated rectangle (plan polygon) centred at (x, y), length l along heading th, width w */
function rrect(x, y, th, l, w) { const c = m.cos(th), s = m.sin(th), P = (u, v) => [x + u * c - v * s, y + u * s + v * c]; return [P(-l / 2, -w / 2), P(l / 2, -w / 2), P(l / 2, w / 2), P(-l / 2, w / 2)]; }
const HEAD = (a, f) => a.YF + f * a.D;

// ------------------------------------------------------------------------------------------ blocks and building toys
/** an interlocking brick as a cube of cells, studs on top */
function stud(a, x, y, z, r, h) { a.cyl(x, y, z, z + h, r, 6); }
/** model description: bricks [ix, iy, layer, nx, ny, nlayers] on a plate np x mp studs */
function bricks(a, np, mp, list) {
  const P = 8, bh = 9.6, pt = 3.2, x0 = a.X0, y0 = a.YF;
  a.box(x0, y0, a.Z0, x0 + np * P, y0 + mp * P, a.Z0 + pt); a.rect(x0, y0, x0 + np * P, y0 + mp * P);
  const hm = Array.from({ length: np }, () => new Array(mp).fill(0));
  for (const [ix, iy, l, nx, ny, nl = 1] of list) {
    a.box(x0 + ix * P + 0.2, y0 + iy * P + 0.2, a.Z0 + pt + l * bh, x0 + (ix + nx) * P - 0.2, y0 + (iy + ny) * P - 0.2, a.Z0 + pt + (l + nl) * bh);
    for (let i = ix; i < ix + nx; i++) for (let j = iy; j < iy + ny; j++) hm[i][j] = m.max(hm[i][j], l + nl);
    a.rect(x0 + ix * P, y0 + iy * P, x0 + (ix + nx) * P, y0 + (iy + ny) * P, 'EQUIP-DETAIL');
  }
  for (let i = 0; i < np; i++) for (let j = 0; j < mp; j++) stud(a, x0 + (i + 0.5) * P, y0 + (j + 0.5) * P, a.Z0 + pt + hm[i][j] * bh, 2.4, 1.7);
}
const BP = (np, mp, layers) => [np * 8 / IN, mp * 8 / IN, (3.2 + layers * 9.6 + 1.7) / IN];
const ring4 = (ix, iy, nx, ny, l, nl = 1) => [[ix, iy, l, nx, 1, nl], [ix, iy + ny - 1, l, nx, 1, nl], [ix, iy + 1, l, 1, ny - 2, nl], [ix + nx - 1, iy + 1, l, 1, ny - 2, nl]];
const MODELS = {
  tower: (() => { const L = []; for (let l = 0; l < 10; l++) L.push([4, 4, l, 4, 4]); L.push([3, 3, 10, 6, 6, 2]); return { np: 12, mp: 12, layers: 12, L }; })(),
  house: (() => { const L = []; for (let l = 0; l < 4; l++) { if (l < 3) { L.push([2, 2, l, 3, 1], [5, 2, l, 3, 1]); } else L.push([2, 2, l, 6, 1]); L.push([2, 7, l, 6, 1], [2, 3, l, 1, 4], [7, 3, l, 1, 4]); } L.push([2, 2, 4, 6, 6], [3, 3, 5, 4, 4], [4, 4, 6, 2, 2]); return { np: 12, mp: 10, layers: 7, L }; })(),
  bridge: (() => { const L = []; for (let l = 0; l < 6; l++) L.push([3, 3, l, 2, 4], [11, 3, l, 2, 4]); L.push([1, 3, 6, 14, 4, 2]); return { np: 16, mp: 10, layers: 8, L }; })(),
  pyramid: (() => { const L = []; for (let k = 0; k < 6; k++) L.push([k, k, k * 2, 12 - 2 * k, 12 - 2 * k, 2]); return { np: 12, mp: 12, layers: 12, L }; })(),
  gate: (() => { const L = []; for (let l = 0; l < 4; l++) { if (l < 3) L.push([2, 5, l, 4, 2], [8, 5, l, 4, 2]); else L.push([2, 5, l, 10, 2]); } for (const x of [0, 12]) for (let l = 0; l < 7; l++) L.push([x, 4, l, 2, 4]); for (const x of [0, 12]) L.push([x - 0, 4, 7, 2, 4]); return { np: 14, mp: 12, layers: 8, L }; })(),
  keep: (() => { const L = []; for (let l = 0; l < 14; l++) L.push([5, 5, l, 4, 4]); L.push([4, 4, 14, 6, 6]); for (const [x, y] of [[0, 0], [11, 0], [0, 11], [11, 11]]) for (let l = 0; l < 8; l++) L.push([x, y, l, 3, 3]); return { np: 14, mp: 14, layers: 15, L }; })(),
};
const blocks = [
  fam({ cat: 'toys/blocks', title: 'Generic wooden counting frame',
    desc: (v) => `Counting frame with ${v.rods} horizontal rods of ${v.beads} beads each, two side posts with feet, a top bar and a bottom bar; half of each row of beads is pushed to the right.`,
    vs: [['5 rods, 8 in', 8, 3, 7, 0, { rods: 5, beads: 10 }], ['7 rods, 10 in', 10, 3.5, 9, 0, { rods: 7, beads: 10 }], ['10 rods, 12 in', 12, 4, 11, 0, { rods: 10, beads: 10 }], ['10 rods, 18 in desktop', 18, 5, 14, 0, { rods: 10, beads: 10 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy, W, H, D } = a, t = W * 0.05, foot = H * 0.06, bd = D * 0.5, y0 = cy - bd / 2, y1 = cy + bd / 2;
      a.outline('EQUIP-HIDDEN'); a.box(X0, y0, Z0 + foot, X0 + t, y1, Z1); a.box(X1 - t, y0, Z0 + foot, X1, y1, Z1);
      a.box(X0, y0, Z1 - t, X1, y1, Z1); a.box(X0, y0, Z0 + foot, X1, y1, Z0 + foot + t);
      for (const x of [X0, X1 - t * 1.8]) a.box(x, YF, Z0, x + t * 1.8, YB, Z0 + foot);
      const zs = Z0 + foot + t, ze = Z1 - t, pitch = (ze - zs) / v.rods, iw = X1 - X0 - 2 * t, bt = iw / (v.beads + 1.4), half = v.beads / 2;
      for (let i = 0; i < v.rods; i++) {
        const z = zs + (i + 0.5) * pitch; a.xcyl(X0 + t, X1 - t, cy, z, 1.6, 6);
        for (let k = 0; k < v.beads; k++) { const x = k < half ? X0 + t + (k + 0.5) * bt : X1 - t - (v.beads - k - 0.5) * bt; a.ell(x, cy, z, bt / 2, m.min(bd * 0.42, pitch * 0.4), pitch * 0.4, 8, 4); }
      }
      a.rect(X0, y0, X1, y1, 'EQUIP-DETAIL'); a.rect(X0, YF, X0 + t * 1.8, YB); a.rect(X1 - t * 1.8, YF, X1, YB);
      a.log('Added the posts with feet, top and bottom bars, rods and the beads (plan and 3D).');
    } }),
  fam({ cat: 'toys/blocks', title: 'Generic bead maze toy',
    desc: (v) => `Wire bead maze: a wooden base on four feet with ${v.n} curved wires looping up and down on posts, each carrying two sliding beads.`,
    vs: [['3 wires, 8 in', 8, 6, 7, 0, { n: 3 }], ['4 wires, 10 in', 10, 7, 9, 0, { n: 4 }], ['5 wires, 12 in', 12, 8, 11, 0, { n: 5 }], ['6 wires, 14 in', 14, 9, 13, 0, { n: 6 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, bh = 16, bz = Z0 + 8 + bh;
      a.box(X0, YF, Z0 + 8, X1, YB, bz); a.outline(); for (const x of [X0 + 12, X1 - 12]) for (const y of [YF + 12, YB - 12]) a.cyl(x, y, Z0, Z0 + 8, 6, 8);
      const r = m.min(W / 22, D / (v.n * 3.2)), top = Z1 - r - 2;
      for (let i = 0; i < v.n; i++) {
        const y = YF + (D * (i + 0.5)) / v.n, ph = i * 1.3, pts = [];
        for (let j = 0; j <= 14; j++) { const f = j / 14; pts.push([X0 + 18 + f * (W - 36), y + m.sin(ph + f * 5) * D / v.n * 0.18, bz + (top - bz) * (0.28 + 0.72 * m.abs(m.sin(ph + f * 3.6 + 0.5)))]); }
        a.tube(pts, pts.map(() => 1.7), 5); for (const j of [0, 14]) a.cyl(pts[j][0], pts[j][1], bz, pts[j][2], 2.6, 6);
        for (const k of [4, 10]) sph(a, pts[k][0], pts[k][1], pts[k][2], r, 10, 6);
        a.line(pts[0][0], pts[0][1], pts[14][0], pts[14][1], 'EQUIP-DETAIL');
      }
      a.log('Added the base with feet, the looping wires on posts and the sliding beads (plan and 3D).');
    } }),
  fam({ cat: 'toys/blocks', title: 'Generic pounding bench',
    desc: (v) => `Toddler pounding bench: a top with ${v.pegs} round pegs standing at different heights over holes, two end panels, a lower shelf, a mallet with a round head resting across the front${v.ball ? ' and a ball ramp along the back' : ''}.`,
    vs: [['3 pegs, 10 in', 10, 6, 6, 0, { pegs: 3, rows: 1 }], ['4 pegs, 12 in', 12, 6, 6, 0, { pegs: 4, rows: 1 }], ['6 pegs, 16 in', 16, 9, 7, 0, { pegs: 6, rows: 2 }], ['8 pegs with ball ramp, 20 in', 20, 10, 8, 0, { pegs: 8, rows: 2, ball: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, zt = Z0 + H * 0.42, tt = 14, t = 14;
      a.outline(); a.box(X0, YF, zt, X1, YB, zt + tt); a.box(X0, YF, Z0, X0 + t, YB, zt); a.box(X1 - t, YF, Z0, X1, YB, zt); a.box(X0 + t, YF + D * 0.1, Z0 + H * 0.12, X1 - t, YB - D * 0.1, Z0 + H * 0.12 + 8);
      const per = v.pegs / v.rows, ztp = zt + tt;
      for (let r = 0; r < v.rows; r++) for (let i = 0; i < per; i++) {
        const x = X0 + (W * (i + 0.5)) / per, y = v.rows === 1 ? cy : YF + (D * (r + 1)) / (v.rows + 1) - (v.ball ? D * 0.03 : 0), k = (i * 3 + r) % 3, up = [H * 0.3, H * 0.14, 2][k], pr = m.min(W / per * 0.22, 11);
        a.cyl(x, y, ztp, ztp + up, pr, 10); a.cyl(x, y, ztp + up, ztp + up + 5, pr * 1.25, 10); ring(a, x, y, ztp + 0.6, pr * 1.3, 1.2, 12, 4); a.circ(x, y, pr, 'EQUIP-DETAIL');
      }
      const mz = ztp + 7; a.xcyl(X0 + W * 0.2, X0 + W * 0.2 + H * 0.5, YF + 14, mz, 4, 8); a.ycyl(YF + 3, YF + 25, X0 + W * 0.2 + H * 0.5, mz, 10, 10);
      if (v.ball) { a.tube([[X1 - t - 4, YB - 14, ztp + 30], [X0 + t + 6, YB - 14, ztp + 4]], [3, 3], 6); a.tube([[X1 - t - 4, YB - 26, ztp + 30], [X0 + t + 6, YB - 26, ztp + 4]], [3, 3], 6); sph(a, X0 + W * 0.3, YB - 20, ztp + 14, 8, 10, 6); }
      a.log('Added the top with pegs and holes, end panels, shelf, mallet' + (v.ball ? ' and the ball ramp' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'toys/blocks', title: 'Generic graded block tower',
    desc: (v) => `${v.n} graded wooden blocks stacked into a tapering tower, each with a raised front border, a rounded cap on top and a wide base block.`,
    vs: [['4 blocks, 6 in', 4, 4, 6, 0, { n: 4 }], ['5 blocks, 8 in', 5, 5, 8, 0, { n: 5 }], ['6 blocks, 10 in', 6, 6, 10, 0, { n: 6 }], ['8 blocks, 14 in', 7.5, 7.5, 14, 0, { n: 8 }], ['10 blocks, 20 in', 9, 9, 20, 0, { n: 10 }]],
    build: (a, v) => {
      const { cx, cy, Z0, W, H } = a, r = 0.86, S = []; let sum = 0; for (let i = 0; i < v.n; i++) { S.push(r ** i); sum += r ** i; }
      const cap = H * 0.07, usable = H - cap; let z = Z0;
      for (let i = 0; i < v.n; i++) {
        const s = W * 0.96 * S[i], h = (usable * S[i]) / sum;
        a.box(cx - s / 2, cy - s / 2, z, cx + s / 2, cy + s / 2, z + h); a.frame(cx - s * 0.36, z + h * 0.16, cx + s * 0.36, z + h * 0.84, cy - s / 2 - 1.2, cy - s / 2 + 0.4, s * 0.06);
        a.rect(cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2, i === 0 ? 'EQUIP' : 'EQUIP-DETAIL'); z += h;
      }
      const top = W * 0.96 * S[v.n - 1] * 0.4; a.ell(cx, cy, z + cap * 0.3, top, top, cap * 0.7, 12, 5); a.log('Added the graded blocks with front borders and the cap (plan and 3D).');
    } }),
  fam({ cat: 'toys/blocks', title: 'Generic domino run',
    desc: (v) => `${v.n} standing dominoes ${v.kind === 'line' ? 'in a straight row' : v.kind === 'arc' ? 'in a quarter curve' : v.kind === 'wave' ? 'in an S-shaped wave' : 'in a closed ring'}, each a slab with a centre divider and two pips on the front face, set about half a tile apart.`,
    vs: [['straight row, 12 tiles', 1.3, 7.4, 2.1, 0, { n: 12, kind: 'line' }], ['straight row, 24 tiles', 1.3, 14, 2.1, 0, { n: 24, kind: 'line' }], ['quarter curve, 16 tiles', 6, 6, 2.1, 0, { n: 16, kind: 'arc' }], ['S-shaped wave, 20 tiles', 4.2, 12, 2.1, 0, { n: 20, kind: 'wave' }], ['ring, 18 tiles', 4.6, 4.6, 2.1, 0, { n: 18, kind: 'ring' }]],
    build: (a, v) => {
      const { cx, cy, Z0, H, W, D } = a, tl = 25, tw0 = 8, th = H, pit = 14.5, pts = [];
      for (let i = 0; i < v.n; i++) {
        const f = i / (v.n - 1);
        if (v.kind === 'line') pts.push([0, i * pit, m.PI / 2]);
        else if (v.kind === 'arc') { const R = (v.n * pit) / (PI / 2), t = PI - f * (PI / 2); pts.push([R * m.cos(t), R * m.sin(t), t - PI / 2]); }
        else if (v.kind === 'wave') { const y = f * (v.n - 1) * pit * 0.94, x = m.sin(f * 2 * PI) * 38, dx = m.cos(f * 2 * PI) * 38 * 2 * PI / ((v.n - 1) * pit * 0.94); pts.push([x, y, m.atan2(1, dx)]); }
        else { const R = (v.n * pit) / (2 * PI), t = (2 * PI * i) / v.n; pts.push([R * m.cos(t), R * m.sin(t), t + PI / 2]); }
      }
      const xs = pts.flatMap(([x, y, h]) => rrect(x, y, h - PI / 2 + PI / 2, tw0, tl).map((p) => p[0])), ys = pts.flatMap(([x, y, h]) => rrect(x, y, h, tw0, tl).map((p) => p[1]));
      const ox = cx - (m.min(...xs) + m.max(...xs)) / 2, oy = cy - (m.min(...ys) + m.max(...ys)) / 2;
      for (const [x, y, h] of pts) {
        const poly = rrect(x + ox, y + oy, h, tw0, tl).map(([px, py]) => [px, py]); // heading h: slab is tw0 thick along h, tl wide across
        const P = rrect(x + ox, y + oy, h, tw0, tl); a.prism(P, Z0, Z0 + th); a.poly(P);
        const nx = -m.sin(h) * 0, c = m.cos(h), s = m.sin(h), fx = x + ox - c * (tw0 / 2 + 0.2), fy = y + oy - s * (tw0 / 2 + 0.2);
        const dv = rrect(fx, fy, h, 0.8, tl * 0.8); a.prism(dv, Z0 + th * 0.48, Z0 + th * 0.52);
        for (const k of [-1, 1]) for (const zz of [0.27, 0.74]) { const px = fx + (-s) * (k * tl * 0.22), py = fy + c * (k * tl * 0.22); if (k === 1 || zz > 0.5) a.cyl(px, py, Z0 + th * zz - 1, Z0 + th * zz + 1, 1.6, 6); }
      }
      a.log('Added the dominoes with their dividers and pips along the run (plan and 3D).');
    } }),
  fam({ cat: 'toys/blocks', title: 'Generic brick baseplate model',
    desc: (v) => `Interlocking-brick baseplate (${v.np} by ${v.mp} studs, 8 mm pitch) with a built ${v.kind}: stacked bricks with studs on every exposed top and open plate studs around it.`,
    vs: [[`tower, 12 x 12 plate`, ...BP(12, 12, 12), 0, { kind: 'tower', model: 'tower' }], [`cottage, 12 x 10 plate`, ...BP(12, 10, 7), 0, { kind: 'cottage with a door gap and stepped roof', model: 'house' }], [`bridge, 16 x 10 plate`, ...BP(16, 10, 8), 0, { kind: 'bridge on two piers', model: 'bridge' }], [`step pyramid, 12 x 12 plate`, ...BP(12, 12, 12), 0, { kind: 'stepped pyramid', model: 'pyramid' }], [`wall and gate, 14 x 12 plate`, ...BP(14, 12, 8), 0, { kind: 'wall with a gate and two end towers', model: 'gate' }], [`keep with turrets, 14 x 14 plate`, ...BP(14, 14, 15), 0, { kind: 'keep with four turrets', model: 'keep' }]].map((r) => { r[1] = +r[1].toFixed(2); r[2] = +r[2].toFixed(2); r[3] = +r[3].toFixed(2); return r; }),
    build: (a, v) => { const M = MODELS[v.model]; bricks(a, M.np, M.mp, M.L); a.log('Added the baseplate, the stacked bricks and their studs (plan and 3D).'); } }),
  fam({ cat: 'toys/blocks', title: 'Generic rod and ball construction frame',
    desc: (v) => `Construction-toy frame, ${v.shape}: ${v.nodes} ball joints joined by round rods along the edges${v.brace ? ', with diagonal braces across the faces' : ''}.`,
    vs: [['cube, 4 in', 4, 4, 4, 0, { shape: 'cube', nodes: 8 }], ['cube with braces, 8 in', 8, 8, 8, 0, { shape: 'cube', nodes: 8, brace: true }], ['cuboid, 8 x 4 x 4 in', 8, 4, 4, 0, { shape: 'cuboid', nodes: 8 }], ['square pyramid, 6 in', 6, 6, 5, 0, { shape: 'pyramid', nodes: 5 }], ['triangular prism, 8 in', 5, 8, 5, 0, { shape: 'prism', nodes: 6 }]],
    build: (a, v) => {
      const { X0, YF, Z0, W, D, H } = a, r = m.min(W, D, H) * 0.05, P = (u, w, h) => [X0 + r + u * (W - 2 * r), YF + r + w * (D - 2 * r), Z0 + r + h * (H - 2 * r)];
      let N, E;
      if (v.shape === 'pyramid') { N = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0.5, 0.5, 1]]; E = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4]]; }
      else if (v.shape === 'prism') { N = [[0, 0, 0], [1, 0, 0], [0.5, 0, 1], [0, 1, 0], [1, 1, 0], [0.5, 1, 1]]; E = [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3], [0, 3], [1, 4], [2, 5]]; }
      else { N = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]; E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]; if (v.brace) E.push([0, 5], [1, 6], [2, 7], [3, 4], [0, 2], [4, 6]); }
      const Q = N.map((n) => P(...n));
      for (const [i, j] of E) { a.tube([Q[i], Q[j]], [r * 0.38, r * 0.38], 7); a.line(Q[i][0], Q[i][1], Q[j][0], Q[j][1], 'EQUIP-DETAIL'); }
      for (const q of Q) { sph(a, q[0], q[1], q[2], r, 10, 6); a.circ(q[0], q[1], r); }
      a.log('Added the ball joints and the connecting rods (plan and 3D).');
    } }),
  fam({ cat: 'toys/blocks', title: 'Generic wooden arch bridge set',
    desc: (v) => `Stacking bridge set: two stepped piers, an arch of ${v.n} wedge-shaped blocks with a raised keystone, two end fill blocks, a thin back plate behind the arch and a long deck plank on top.`,
    vs: [['7 wedges, 6 in', 6, 1.8, 3.4, 0, { n: 7 }], ['9 wedges, 8 in', 8, 2.4, 4.5, 0, { n: 9 }], ['11 wedges, 10 in', 10, 3, 5.6, 0, { n: 11 }], ['13 wedges, 12 in', 12, 3.6, 6.7, 0, { n: 13 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, cx, W } = a, ro = W * 0.34, ri = ro * 0.6, zs = Z0 + ro * 0.45, dk = ro * 0.2, ok = ro * 1.06;
      a.outline('EQUIP-HIDDEN'); a.box(X0, YF, Z0, cx - ri, YB, zs); a.box(cx + ri, YF, Z0, X1, YB, zs);
      for (let i = 0; i < v.n; i++) { const a0 = PI - (PI * i) / v.n, a1 = PI - (PI * (i + 1)) / v.n, k = i === (v.n - 1) / 2 ? ok : ro; prismY(a, [[cx + ro * m.cos(a0), zs + ro * m.sin(a0)], [cx + k * m.cos(a1), zs + k * m.sin(a1)], [cx + ri * m.cos(a1), zs + ri * m.sin(a1)], [cx + ri * m.cos(a0), zs + ri * m.sin(a0)]], YF + 6, YB - 6); }
      a.box(X0, YF, zs, cx - ro, YB, zs + ro); a.box(cx + ro, YF, zs, X1, YB, zs + ro); a.box(X0, YF, zs + ro, X1, YB, zs + ro + dk); a.box(cx - ro, YB - 6, zs, cx + ro, YB, zs + ro);
      a.rect(X0, YF, X1, YB, 'EQUIP'); a.line(cx - ro, YF, cx - ro, YB, 'EQUIP-DETAIL'); a.line(cx + ro, YF, cx + ro, YB, 'EQUIP-DETAIL');
      a.log('Added the piers, the wedge blocks of the arch with keystone, end fill and the deck (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ toy vehicles
function trailer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, y = (f) => YF + f * D, R = H * 0.24, bz = Z0 + R * 1.35, bw = W * 0.4, rw = W * 0.13;
  a.outline('EQUIP-HIDDEN'); a.box(cx - bw, y(0.22), bz, cx + bw, y(0.99), bz + 8); a.rect(cx - bw, y(0.22), cx + bw, y(0.99));
  for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.1, y(0.26), bz + 2], [cx, YF + 6, bz + H * 0.04]], [3, 3], 6); tw(a, cx + s * (W / 2 - rw / 2 - 1), y(0.74), R, rw); a.tube([[cx + s * bw * 0.8, y(0.74), bz - 2], [cx + s * (W / 2 - rw), y(0.74), Z0 + R]], [3, 3], 6); }
  ring(a, cx, YF + 5, bz + H * 0.04 + 3, 5, 1.8, 10, 5); a.xcyl(cx - bw * 0.8, cx + bw * 0.8, y(0.74), bz - 2, 2.4, 6); a.cyl(cx, y(0.3), Z0, bz, 3, 6);
  const t = 4, top = Z1 - 4;
  if (v.kind === 'hay') {
    for (const f of [0.26, 0.5, 0.74, 0.97]) for (const s of [-1, 1]) a.cyl(cx + s * (bw - 3), y(f), bz + 8, bz + H * 0.3, 2.2, 6);
    for (const s of [-1, 1]) a.box(cx + s * (bw - 3) - 1.5, y(0.26), bz + H * 0.18, cx + s * (bw - 3) + 1.5, y(0.97), bz + H * 0.2);
    const bh = (top - bz - 8) / 3.2; let k = 0;
    for (let lay = 0; lay < 2; lay++) for (let i = 0; i < 2 - lay * 0 ; i++) for (let c = 0; c < 3 - lay; c++) { const yy0 = y(0.24) + c * (D * 0.25), x0 = cx - bw + 3 + i * (bw - 3); if (lay && i) continue; const xw = lay ? bw * 1.0 : bw - 4; a.box(lay ? cx - xw / 2 : x0 + 1, yy0 + 2, bz + 8 + lay * bh, lay ? cx + xw / 2 : x0 + xw, yy0 + D * 0.23, bz + 8 + (lay + 1) * bh); for (const f of [0.3, 0.7]) a.box(lay ? cx - xw / 2 - 0.6 : x0 + 0.4, yy0 + D * 0.23 * f, bz + 8 + lay * bh, lay ? cx + xw / 2 + 0.6 : x0 + xw + 0.6, yy0 + D * 0.23 * f + 1.4, bz + 8 + (lay + 1) * bh + 0.6); k++; }
  } else if (v.kind === 'tip') {
    for (const s of [-1, 1]) a.box(cx + s * bw - (s > 0 ? t : 0), y(0.22), bz + 8, cx + s * bw + (s > 0 ? 0 : t), y(0.99), top); a.box(cx - bw, y(0.22), bz + 8, cx + bw, y(0.22) + t, top); a.box(cx - bw, y(0.99) - t, bz + 8, cx + bw, y(0.99), top - 6);
    a.ycyl(y(0.28), y(0.44), cx, bz - 6, 4, 8); a.box(cx - bw - 1, y(0.22), top - 2, cx + bw + 1, y(0.99), top); a.line(cx - bw, y(0.22), cx + bw, y(0.99), 'EQUIP-DETAIL');
  } else {
    const tr = (top - bz - 12) / 2; a.ycyl(y(0.26), y(0.98), cx, bz + 8 + tr, tr, 16); for (const f of [0.34, 0.62, 0.9]) a.box(cx - bw * 0.8, y(f), bz + 8, cx + bw * 0.8, y(f) + 3, bz + 8 + tr); for (const f of [0.26, 0.98]) a.ycyl(y(f) - 1, y(f) + 1, cx, bz + 8 + tr, tr * 1.04, 16);
    a.cyl(cx, y(0.5), bz + 8 + tr * 1.7, top, tr * 0.38, 10); a.cyl(cx, y(0.5), top, top + 0.01, tr * 0.38, 10); a.ycyl(y(0.98), YB - 2, cx, bz + 8 + tr * 0.4, 2.4, 6); a.circ(cx, y(0.5), tr * 0.38, 'EQUIP-DETAIL');
  }
}
function drawn(a, o) { /* shared cab and chassis for the heavy trucks */
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, y = (f) => YF + f * D, wr = H * o.wr, ch = Z0 + wr * 1.2, cw = W * 0.44, ct = Z0 + H * o.cabH;
  a.outline('EQUIP-HIDDEN'); a.box(cx - W * 0.34, YF + 4, ch, cx + W * 0.34, YB - 4, ch + H * 0.07);
  prismX(a, [[y(0), ch], [y(o.cabL), ch], [y(o.cabL), ct], [y(0.07), ct], [y(0), Z0 + H * o.cabH * 0.62]], cx - cw, cx + cw);
  pane(a, [y(0), Z0 + H * o.cabH * 0.62], [y(0.07), ct], 0.5, cx - cw * 0.8, cx + cw * 0.8, 2);
  for (const s of [-1, 1]) { a.box(cx + s * cw * 0.7 - 6, YF, Z0 + H * o.cabH * 0.3, cx + s * cw * 0.7 + 6, YF + 3, Z0 + H * o.cabH * 0.4); a.box(cx + s * cw - (s > 0 ? 0 : 1.2), y(0.09), Z0 + H * o.cabH * 0.5, cx + s * cw + (s > 0 ? 1.2 : 0), y(o.cabL - 0.03), ct - H * 0.04); }
  a.box(cx - cw - 2, YF, ch, cx + cw + 2, YF + 3, Z0 + H * o.cabH * 0.28);
  for (const f of o.ax) for (const s of [-1, 1]) tw(a, cx + s * (W / 2 - W * 0.07), y(f), wr, W * 0.14);
  for (const f of o.ax) a.xcyl(cx - W * 0.36, cx + W * 0.36, y(f), Z0 + wr, 3, 8);
  return { y, wr, ch, ct, cw };
}
const vehicles = [
  fam({ cat: 'toys/vehicles', title: 'Generic toy farm vehicle',
    desc: (v) => ({ tractor: 'Toy farm tractor: a hood with grille, lamps and exhaust stack, an open cab with four posts, a roof, a seat and steering wheel, large rear tyres under fenders, small front tyres and a rear hitch.', loader: 'Toy farm tractor with a front loader: hood, cab with roof, big rear tyres, two lifting arms with rams and a scoop bucket with a lip.', hay: 'Toy hay trailer: a flat bed with stake rails, a drawbar with a ring, two large wheels and a load of strapped bales in two layers.', tip: 'Toy tipping trailer: a bed with side walls, headboard and tailgate, a lifting ram under the front, a drawbar with a ring and two large wheels.', tank: 'Toy slurry tanker trailer: a round tank on a frame with cross bands, a filler dome, a rear outlet pipe, a drawbar with a ring and two large wheels.' })[v.kind],
    vs: [['tractor, 8 in', 4.4, 8, 5, 0, { kind: 'tractor' }], ['tractor, 14 in', 7.4, 14, 8.6, 0, { kind: 'tractor' }], ['tractor with front loader, 12 in', 5.6, 13, 7.2, 0, { kind: 'loader' }], ['hay trailer, 10 in', 4.6, 10, 4, 0, { kind: 'hay' }], ['tipping trailer, 12 in', 5, 12, 5, 0, { kind: 'tip' }], ['slurry tanker trailer, 10 in', 4.4, 10, 4.6, 0, { kind: 'tank' }]],
    build: (a, v) => {
      if (['hay', 'tip', 'tank'].includes(v.kind)) { trailer(a, v); a.log('Added the bed, drawbar, wheels and the ' + v.kind + ' body (plan and 3D).'); return; }
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, off = v.kind === 'loader' ? 0.28 : 0, ty = (f) => YF + D * (off + (1 - off) * f), Rr = H * 0.29, Rf = H * 0.18, cz = Z0 + Rf * 1.5, rw = W * 0.2, post = m.max(2, W * 0.02);
      a.outline('EQUIP-HIDDEN'); a.box(cx - W * 0.16, ty(0.04), cz, cx + W * 0.16, YB - 2, cz + H * 0.07);
      prismX(a, [[ty(0.02), cz + H * 0.07], [ty(0.46), cz + H * 0.07], [ty(0.46), cz + H * 0.33], [ty(0.1), cz + H * 0.32], [ty(0.02), cz + H * 0.2]], cx - W * 0.15, cx + W * 0.15);
      a.box(cx - W * 0.11, ty(0.0), cz + H * 0.1, cx + W * 0.11, ty(0.02), cz + H * 0.28); for (let i = 0; i < 3; i++) a.box(cx - W * 0.09, ty(0.0) - 0.8, cz + H * 0.13 + i * H * 0.05, cx + W * 0.09, ty(0.0), cz + H * 0.15 + i * H * 0.05);
      for (const s of [-1, 1]) sph(a, cx + s * W * 0.13, ty(0.02), cz + H * 0.2, W * 0.03, 8, 5);
      a.cyl(cx + W * 0.09, ty(0.36), cz + H * 0.33, Z0 + H * 0.74, post * 1.2, 6); a.cone(cx + W * 0.09, ty(0.36), Z0 + H * 0.74, Z0 + H * 0.78, post * 1.2, post * 1.9, 6);
      a.box(cx - W * 0.24, ty(0.46), cz + H * 0.07, cx + W * 0.24, ty(0.95), cz + H * 0.12);
      for (const f of [0.5, 0.92]) for (const s of [-1, 1]) a.cyl(cx + s * W * 0.22, ty(f), cz + H * 0.12, Z1 - 4, post, 6);
      a.box(cx - W * 0.27, ty(0.46), Z1 - 5, cx + W * 0.27, ty(0.97), Z1); a.box(cx - W * 0.1, ty(0.7), cz + H * 0.12, cx + W * 0.1, ty(0.82), cz + H * 0.2); a.box(cx - W * 0.1, ty(0.8), cz + H * 0.2, cx + W * 0.1, ty(0.83), cz + H * 0.36);
      a.cyl(cx, ty(0.56), cz + H * 0.12, cz + H * 0.28, 1.6, 6); ring(a, cx, ty(0.56), cz + H * 0.29, W * 0.07, 1.4, 12, 5);
      for (const s of [-1, 1]) { tw(a, cx + s * (W / 2 - rw / 2), ty(0.78), Rr, rw); a.box(cx + s * (W / 2 - rw / 2) - rw / 2 - 1, ty(0.78) - Rr * 1.0, Z0 + Rr * 2, cx + s * (W / 2 - rw / 2) + rw / 2 + 1, ty(0.78) + Rr * 1.0, Z0 + Rr * 2 + 2); tw(a, cx + s * W * 0.38, ty(0.14), Rf, W * 0.11); }
      a.xcyl(cx - W * 0.4, cx + W * 0.4, ty(0.78), Z0 + Rr, 3, 8); a.xcyl(cx - W * 0.36, cx + W * 0.36, ty(0.14), Z0 + Rf, 3, 8); a.box(cx - W * 0.08, YB - 8, cz - 2, cx + W * 0.08, YB, cz + H * 0.06);
      if (v.kind === 'loader') {
        const bw = W * 0.33;
        for (const s of [-1, 1]) { const x = cx + s * W * 0.27; a.tube([[x, ty(0.52), cz + H * 0.3], [x, YF + D * 0.1, Z0 + H * 0.2]], [3, 3], 6); a.tube([[x, ty(0.46), cz + H * 0.1], [x, YF + D * 0.2, Z0 + H * 0.3]], [2.2, 2.2], 6); prismX(a, [[YF + 2, Z0 + 3], [YF + D * 0.19, Z0 + 3], [YF + D * 0.19, Z0 + H * 0.3], [YF + 2, Z0 + H * 0.16]], s > 0 ? cx + bw - 2 : cx - bw, s > 0 ? cx + bw : cx - bw + 2); }
        a.box(cx - bw, YF + 2, Z0 + 2, cx + bw, YF + D * 0.19, Z0 + 5); a.box(cx - bw, YF + D * 0.17, Z0 + 2, cx + bw, YF + D * 0.19, Z0 + H * 0.3); a.box(cx - bw, YF + 2, Z0 + 2, cx + bw, YF + 4, Z0 + 9); a.rect(cx - bw, YF + 2, cx + bw, YF + D * 0.19, 'EQUIP');
      }
      a.rect(cx - W * 0.16, ty(0.02), cx + W * 0.16, YB, 'EQUIP-DETAIL'); a.log('Added the hood, cab with roof, seat and steering wheel, tyres, hitch' + (v.kind === 'loader' ? ' and the loader arms with bucket' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy helicopter',
    desc: (v) => ({ light: 'Toy helicopter: a rounded pod with a nose window, a tail boom with fin, tailplane and tail rotor, a mast with a four-blade rotor and a pair of skids on struts.', rescue: 'Toy rescue helicopter: a deep pod with a side door rail, a winch arm with a cable and hook, a tail boom with fin and tail rotor, a four-blade rotor and skids on struts.', tandem: 'Toy twin-rotor helicopter: a long fuselage with a nose, a front mast and a taller rear mast each with a two-blade rotor, a rear ramp, and wheel pairs under the nose and tail.' })[v.kind],
    vs: [['light, 9 in', 7, 9, 3.2, 0, { kind: 'light' }], ['light, 14 in', 11, 14, 5, 0, { kind: 'light' }], ['rescue with winch, 12 in', 9.5, 12, 4.4, 0, { kind: 'rescue' }], ['twin-rotor, 16 in', 7.6, 16, 4.8, 0, { kind: 'tandem' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, y = (f) => YF + f * D, rr = W * 0.48;
      if (v.kind === 'tandem') {
        const zc = Z0 + H * 0.4, fr = H * 0.2;
        a.ell(cx, y(0.45), zc, W * 0.22, D * 0.4, fr, 14, 8); a.ell(cx, y(0.12), zc + fr * 0.15, W * 0.16, D * 0.08, fr * 0.8, 10, 6);
        for (const [f, hh] of [[0.24, 0.78], [0.78, 0.94]]) { a.cyl(cx, y(f), zc + fr * 0.7, Z0 + H * hh, W * 0.04, 8); a.box(cx - rr, y(f) - 5, Z0 + H * hh, cx + rr, y(f) + 5, Z0 + H * hh + 2); sph(a, cx, y(f), Z0 + H * hh + 1, 5, 8, 5); a.circ(cx, y(f), rr, 'EQUIP-DETAIL'); }
        prismX(a, [[y(0.82), zc - fr * 0.6], [y(0.99), zc - fr * 0.9], [y(0.99), zc - fr * 0.5], [y(0.9), zc + fr * 0.4]], cx - W * 0.12, cx + W * 0.12);
        for (const [f, r] of [[0.14, 0.09], [0.84, 0.09]]) for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.18, y(f), zc - fr * 0.6], [cx + s * W * 0.2, y(f), Z0 + H * 0.1]], [2.4, 2.4], 6); tw(a, cx + s * W * 0.2, y(f), H * r, 7, Z0 + H * r); }
        for (const f of [0.35, 0.5, 0.65]) for (const s of [-1, 1]) a.box(cx + s * W * 0.22 - (s > 0 ? 0 : 1), y(f), zc, cx + s * W * 0.22 + (s > 0 ? 1 : 0), y(f + 0.05), zc + fr * 0.5);
        a.ellp(cx, y(0.45), W * 0.22, D * 0.4);
      } else {
        const ym = YF + m.max(rr, D * 0.36), zc = Z0 + H * 0.42, big = v.kind === 'rescue', fr = H * (big ? 0.26 : 0.2), fw = W * (big ? 0.15 : 0.12), ry = D * (big ? 0.2 : 0.17);
        a.ell(cx, ym, zc, fw, ry, fr, 16, 9); a.ell(cx, ym - ry * 0.55, zc + fr * 0.1, fw * 0.92, ry * 0.5, fr * 0.85, 12, 7);
        a.tube([[cx, ym + ry * 0.75, zc + fr * 0.15], [cx, y(0.96), zc + fr * 0.7]], [fr * 0.45, fr * 0.14], 8);
        prismX(a, [[y(0.88), zc + fr * 0.6], [y(0.99), zc + fr * 0.7], [y(0.98), zc + fr * 2.3], [y(0.93), zc + fr * 2.3]], cx - 1.8, cx + 1.8); a.box(cx - W * 0.1, y(0.9), zc + fr * 0.55, cx + W * 0.1, y(0.96), zc + fr * 0.6 + 2);
        vring(a, cx + 4, y(0.975), zc + fr * 1.5, fr * 0.8, 1.1, 12, 4); a.box(cx + 3, y(0.975) - 1, zc + fr * 0.7, cx + 5, y(0.975) + 1, zc + fr * 2.3);
        a.cyl(cx, ym, zc + fr * 0.8, Z1 - 4, 3, 8); sph(a, cx, ym, Z1 - 3, 5, 8, 5); a.box(cx - rr, ym - 5, Z1 - 4, cx + rr, ym + 5, Z1 - 2); a.box(cx - 5, ym - rr, Z1 - 4, cx + 5, ym + rr, Z1 - 2);
        for (const s of [-1, 1]) { a.ycyl(ym - ry * 0.9, ym + ry * 0.95, cx + s * W * 0.17, Z0 + H * 0.05, 2.6, 8); for (const f of [-0.5, 0.5]) a.tube([[cx + s * W * 0.17, ym + ry * f, Z0 + H * 0.05], [cx + s * fw * 0.8, ym + ry * f * 0.8, zc - fr * 0.6]], [2, 2], 6); }
        if (big) { for (const s of [1]) { a.box(cx + fw - 1, ym - ry * 0.2, zc - fr * 0.3, cx + fw + 2, ym + ry * 0.55, zc + fr * 0.45); a.box(cx + fw - 1, ym - ry * 0.2, zc - fr * 0.3, cx + fw + 2.4, ym + ry * 0.55, zc - fr * 0.25); } a.tube([[cx + fw * 0.8, ym, zc + fr * 0.85], [cx + fw + W * 0.14, ym, zc + fr * 0.95]], [2.2, 2], 6); a.tube([[cx + fw + W * 0.14, ym, zc + fr * 0.9], [cx + fw + W * 0.14, ym, Z0 + H * 0.34]], [0.9, 0.9], 5); sph(a, cx + fw + W * 0.14, ym, Z0 + H * 0.32, 3, 8, 5); }
        a.ellp(cx, ym, fw, ry); a.circ(cx, ym, rr, 'EQUIP-DETAIL'); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL');
      }
      a.log('Added the fuselage, rotors, tail, skids or wheels and the ' + v.kind + ' details (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy cement mixer',
    desc: (v) => `Toy cement mixer truck, ${v.len} in long: a cab with sloped glass, a chassis, a drum tilted up toward the cab with two raised bands, a rear chute and a ladder, on six wheels.`,
    vs: [['6 in', 3, 6, 3.6, 0, { len: 6 }], ['10 in', 4.6, 10, 5.6, 0, { len: 10 }], ['16 in', 7, 16, 8.4, 0, { len: 16 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, B = drawn(a, { wr: 0.15, cabH: 0.5, cabL: 0.28, ax: [0.16, 0.7, 0.86] }), y = B.y, R = W * 0.36;
      const p0 = [cx, y(0.97), B.ch + H * 0.18], p1 = [cx, y(0.34), Z0 + H * 0.62], P = (t) => [0, 1, 2].map((i) => p0[i] + (p1[i] - p0[i]) * t);
      a.tube([P(0), P(0.1), P(0.78), P(1)], [R * 0.3, R, R, R * 0.5], 16); for (const t of [0.3, 0.55]) a.tube([P(t - 0.03), P(t + 0.03)], [R * 1.07, R * 1.07], 16);
      for (const f of [0.5, 0.82]) a.box(cx - W * 0.28, y(f) - 3, B.ch + H * 0.07, cx + W * 0.28, y(f) + 3, B.ch + H * 0.07 + (p0[2] + (p1[2] - p0[2]) * ((0.97 - f) / 0.63) - B.ch - H * 0.07) * 0.8);
      a.tube([[cx, YB - 4, B.ch + H * 0.12], [cx, YB - 2, B.ch + H * 0.02]], [R * 0.3, R * 0.25], 8); prismX(a, [[YB - 2, B.ch + H * 0.02], [YB, B.ch - H * 0.04], [YB, B.ch], [YB - 3, B.ch + H * 0.1]], cx - W * 0.08, cx + W * 0.08);
      for (const s of [-1, 1]) a.tube([[cx + s * W * 0.26, YB - 1, B.ch + H * 0.05], [cx + s * W * 0.26, YB - 1, Z0 + H * 0.58]], [1.2, 1.2], 5); for (let i = 0; i < 4; i++) a.box(cx - W * 0.26, YB - 3, B.ch + H * 0.1 + i * H * 0.1, cx + W * 0.26, YB - 1, B.ch + H * 0.1 + i * H * 0.1 + 1.6);
      a.circ(cx, y(0.7), R, 'EQUIP-DETAIL'); a.rect(cx - W * 0.28, y(0.28), cx + W * 0.28, YB, 'EQUIP-DETAIL'); a.log('Added the cab, chassis, tilted drum with bands, chute, ladder and six wheels (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy mobile crane',
    desc: (v) => `Toy mobile crane, ${v.len} in long: a cab with sloped glass, a chassis, four outriggers with pads, a turntable with a counterweight, a two-section boom raised over the cab, a cable and a hook block.`,
    vs: [['8 in', 3.4, 8, 5.4, 0, { len: 8 }], ['12 in', 4.8, 12, 7.6, 0, { len: 12 }], ['18 in', 7, 18, 11, 0, { len: 18 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, B = drawn(a, { wr: 0.12, cabH: 0.38, cabL: 0.24, ax: [0.14, 0.7, 0.86] }), y = B.y, tz = B.ch + H * 0.07;
      a.cyl(cx, y(0.68), tz, tz + H * 0.07, W * 0.26, 16); a.box(cx - W * 0.22, y(0.58), tz + H * 0.07, cx + W * 0.22, y(0.97), tz + H * 0.2); a.box(cx - W * 0.2, y(0.86), tz + H * 0.2, cx + W * 0.2, y(0.97), tz + H * 0.3);
      a.box(cx - W * 0.17, y(0.6), tz + H * 0.2, cx + W * 0.17, y(0.74), tz + H * 0.33);
      const p0 = [cx, y(0.64), tz + H * 0.27], p1 = [cx, y(0.36), tz + H * 0.27 + (y(0.64) - y(0.36)) * 0.9 * 0 + H * 0.34], pm = [cx, y(0.3), Z1 - H * 0.04], pe = [cx, y(0.04), Z1 - H * 0.03];
      a.tube([p0, p1, pm], [W * 0.06, W * 0.055, W * 0.05], 8); a.tube([[cx, y(0.3), Z1 - H * 0.04], pe], [W * 0.04, W * 0.035], 8); sph(a, cx, pe[1], pe[2], W * 0.04, 8, 5);
      a.tube([[cx, y(0.6), tz + H * 0.17], [cx, y(0.5), tz + H * 0.27]], [W * 0.018, W * 0.018], 6);
      a.tube([pe, [cx, pe[1], Z0 + H * 0.34]], [0.9, 0.9], 5); a.box(cx - W * 0.035, pe[1] - 4, Z0 + H * 0.28, cx + W * 0.035, pe[1] + 4, Z0 + H * 0.34); a.tube([[cx, pe[1], Z0 + H * 0.28], [cx + 4, pe[1], Z0 + H * 0.23], [cx, pe[1], Z0 + H * 0.22]], [1.2, 1.2, 1.2], 5);
      for (const f of [0.34, 0.86]) for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.34, y(f), tz], [cx + s * (W / 2 - W * 0.05), y(f), tz]], [W * 0.025, W * 0.025], 6); a.cyl(cx + s * (W / 2 - W * 0.05), y(f), Z0, tz, W * 0.02, 6); a.cyl(cx + s * (W / 2 - W * 0.05), y(f), Z0, Z0 + 3, W * 0.05, 8); a.circ(cx + s * (W / 2 - W * 0.05), y(f), W * 0.05, 'EQUIP-DETAIL'); }
      a.circ(cx, y(0.68), W * 0.26, 'EQUIP-DETAIL'); a.line(cx, y(0.62), cx, y(0.04), 'EQUIP-DETAIL'); a.log('Added the cab, chassis, outriggers, turntable, counterweight, two-section boom, cable and hook (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy service van',
    desc: (v) => ({ ambulance: 'Toy ambulance-style van: a tall box body with a sloped windscreen, side window, rear doors, a roof light bar, a plain side stripe, bumpers and four wheels.', patrol: 'Toy patrol car: a low body with a cabin, sloped glass, a roof light bar, a bonnet, bumpers, lamps and four wheels.', delivery: 'Toy delivery van: a tall box body with a sloped windscreen, a sliding door line, roof rails, rear doors, bumpers and four wheels.', ice: 'Toy ice-cream style van: a box body with a sloped windscreen, a serving hatch with an awning, a roof cone sign, bumpers and four wheels.' })[v.kind],
    vs: [['ambulance-style, 9 in', 3.6, 9, 4.2, 0, { kind: 'ambulance' }], ['patrol car, 7 in', 3.2, 7, 2.6, 0, { kind: 'patrol' }], ['delivery van, 9 in', 3.6, 9, 4.2, 0, { kind: 'delivery' }], ['ice-cream style van, 10 in', 3.8, 10, 5.4, 0, { kind: 'ice' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, y = (f) => YF + f * D, wr = H * 0.14, zb = Z0 + wr * 0.7, bw = W * 0.44, belt = Z0 + H * (v.kind === 'patrol' ? 0.5 : 0.38), top = Z1 - (v.kind === 'ice' ? H * 0.12 : v.kind === 'ambulance' ? 5 : 0);
      a.outline('EQUIP-HIDDEN'); prismX(a, [[y(0), zb], [y(1), zb], [y(1), belt], [y(0.02), belt], [y(0), belt - H * 0.08]], cx - bw, cx + bw);
      if (v.kind === 'patrol') {
        prismX(a, [[y(0.34), belt], [y(0.84), belt], [y(0.8), top - 6], [y(0.46), top - 6]], cx - bw * 0.84, cx + bw * 0.84); pane(a, [y(0.34), belt], [y(0.46), top - 6], 0.5, cx - bw * 0.74, cx + bw * 0.74, 2); pane(a, [y(0.84), belt], [y(0.8), top - 6], 0.5, cx - bw * 0.74, cx + bw * 0.74, 2);
        a.box(cx - bw * 0.3, y(0.55), top - 6, cx + bw * 0.3, y(0.65), top); for (const s of [-1, 1]) a.box(cx + s * bw * 0.84 - (s > 0 ? 0 : 1.4), y(0.5), belt + H * 0.04, cx + s * bw * 0.84 + (s > 0 ? 1.4 : 0), y(0.76), top - H * 0.12);
      } else {
        prismX(a, [[y(0.2), belt], [y(1), belt], [y(1), top], [y(0.33), top], [y(0.25), belt + (top - belt) * 0.45]], cx - bw, cx + bw); pane(a, [y(0.2), belt], [y(0.33), top], 0.5, cx - bw * 0.88, cx + bw * 0.88, 2);
        for (const s of [-1, 1]) a.box(cx + s * bw - (s > 0 ? 0 : 1.4), y(0.26), belt + H * 0.04, cx + s * bw + (s > 0 ? 1.4 : 0), y(0.36), top - H * 0.06);
        a.box(cx - 0.8, y(1) - 0.6, belt - H * 0.1, cx + 0.8, y(1) + 0.01 - 0.0, top - 3); a.box(cx - bw * 0.9, YB - 1, belt - H * 0.08, cx + bw * 0.9, YB, belt - H * 0.07);
        if (v.kind === 'ambulance') { a.box(cx - bw * 0.5, y(0.34), top, cx + bw * 0.5, y(0.42), top + 5); for (const s of [-1, 1]) a.box(cx + s * bw - (s > 0 ? 0 : 1.6), y(0.4), belt - H * 0.04, cx + s * bw + (s > 0 ? 1.6 : 0), y(0.98), belt + H * 0.01); }
        if (v.kind === 'delivery') { for (const s of [-1, 1]) a.box(cx + s * bw * 0.84 - 1, y(0.36), top, cx + s * bw * 0.84 + 1, y(0.98), top + 2); for (const s of [-1, 1]) a.box(cx + s * bw - (s > 0 ? 0 : 1.4), y(0.5), belt - H * 0.1, cx + s * bw + (s > 0 ? 1.4 : 0), y(0.51), top - 3), a.box(cx + s * bw - (s > 0 ? 0 : 1.4), y(0.78), belt - H * 0.1, cx + s * bw + (s > 0 ? 1.4 : 0), y(0.79), top - 3); }
        if (v.kind === 'ice') { const hx = cx + bw; a.box(hx, y(0.5), belt + H * 0.02, hx + 1.6, y(0.82), belt + H * 0.15); prismX(a, [[y(0.46), belt + H * 0.2], [y(0.86), belt + H * 0.2], [y(0.86), belt + H * 0.2 + 3], [y(0.46), belt + H * 0.2 + 3]], hx - 1, hx + 8); a.cone(cx, y(0.7), top, Z1 - H * 0.05, W * 0.14, W * 0.05, 12); sph(a, cx, y(0.7), Z1 - H * 0.03, W * 0.07, 10, 6); a.cone(cx, y(0.7), top, top + 0.01, W * 0.14, W * 0.14, 12); }
      }
      for (const s of [-1, 1]) { a.box(cx + s * bw * 0.7 - 7, YF, belt - H * 0.1, cx + s * bw * 0.7 + 7, YF + 3, belt - H * 0.04); tw(a, cx + s * (W / 2 - W * 0.07), y(0.22), wr, W * 0.13); tw(a, cx + s * (W / 2 - W * 0.07), y(0.78), wr, W * 0.13); }
      a.box(cx - bw, YF, zb - 3, cx + bw, YF + 6, zb + H * 0.07); a.box(cx - bw, YB - 6, zb - 3, cx + bw, YB, zb + H * 0.07); a.rect(cx - bw, YF, cx + bw, YB, 'EQUIP'); a.line(cx - bw, y(0.3), cx + bw, y(0.3), 'EQUIP-DETAIL');
      a.log('Added the body, glass, bumpers, wheels and the ' + v.kind + ' details (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy rocket on launch stand',
    desc: (v) => ({ plain: `Toy rocket, ${v.h} in tall: a rounded body with a nose cone and a nozzle, two porthole rings and a stripe band, four fins and a round stand plate.`, tower: 'Toy rocket on a launch tower: a rounded body with nose cone, nozzle, porthole ring, four fins, a round stand plate and a lattice tower with a swing arm and a ladder.', shuttle: 'Toy shuttle-style stack: a round fuel tank with two side boosters, a winged orbiter with a tail fin and a nose on the front, on a stand plate.' })[v.kind],
    vs: [['10 in', 5, 5, 10, 0, { kind: 'plain', h: 10 }], ['24 in', 11, 11, 24, 0, { kind: 'plain', h: 24 }], ['with launch tower, 16 in', 11, 8, 16, 0, { kind: 'tower' }], ['shuttle-style, 12 in', 8, 6.5, 12, 0, { kind: 'shuttle' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pt = m.max(6, H * 0.025);
      if (v.kind === 'shuttle') {
        const R = W * 0.14, z0 = Z0 + pt + 4, h = H - pt - 4, oy = cy + D * 0.12;
        a.cyl(cx, cy + D * 0.1, Z0, Z0 + pt, W * 0.46, 24); lathe(a, cx, cy + D * 0.14, z0, [[R * 0.6, 0], [R, h * 0.04], [R, h * 0.82], [R * 0.7, h * 0.92], [0.01, h * 0.98]], 16);
        for (const s of [-1, 1]) { lathe(a, cx + s * R * 1.5, cy + D * 0.14, z0, [[R * 0.4, 0], [R * 0.55, h * 0.03], [R * 0.55, h * 0.62], [R * 0.2, h * 0.74], [0.01, h * 0.78]], 12); }
        const ry = R * 0.8, oyc = cy + D * 0.14 - R - ry * 0.95; a.ell(cx, oyc, z0 + h * 0.38, R * 0.6, ry, h * 0.34, 12, 8); a.cone(cx, oyc - ry * 0.4, z0 + h * 0.64, z0 + h * 0.74, R * 0.4, 0.5, 10);
        for (const s of [-1, 1]) a.prism(s > 0 ? [[cx + R * 0.3, oyc + ry * 0.9], [cx + W * 0.42, oyc + ry * 0.9], [cx + R * 0.4, oyc - ry * 0.2]] : [[cx - R * 0.4, oyc - ry * 0.2], [cx - W * 0.42, oyc + ry * 0.9], [cx - R * 0.3, oyc + ry * 0.9]], z0 + 4, z0 + 7);
        prismX(a, [[oyc + ry * 0.9, z0 + h * 0.18], [oyc + ry * 1.1, z0 + h * 0.5], [oyc + ry * 0.9, z0 + h * 0.52]], cx - 1.6, cx + 1.6);
        for (const s of [-1, 1]) a.cyl(cx + s * R * 1.5, cy + D * 0.14 - 0, Z0 + pt, z0, 3, 6); a.circ(cx, cy + D * 0.14, R); for (const s of [-1, 1]) a.circ(cx + s * R * 1.5, cy + D * 0.14, R * 0.55); a.circ(cx, oyc, R * 0.6, 'EQUIP-DETAIL'); a.circ(cx, cy + D * 0.1, W * 0.46, 'EQUIP-HIDDEN');
      } else {
        const tower = v.kind === 'tower', rc = tower ? cx - W * 0.2 : cx, R = (tower ? W * 0.09 : W * 0.17), z0 = Z0 + pt + 3, h = H - pt - 3, fl = R * 1.35;
        a.cyl(tower ? cx : cx, cy, Z0, Z0 + pt, tower ? W * 0.5 - 1 : W / 2, 28); if (tower) a.box(X0, YF, Z0, X1, YB, Z0 + pt);
        lathe(a, rc, cy, z0, [[R * 0.45, 0], [R * 0.62, h * 0.03], [R, h * 0.08], [R, h * 0.62], [R * 0.7, h * 0.82], [R * 0.32, h * 0.94], [0.01, h * 0.99]], 18);
        for (const q of [0, 1, 2, 3]) { const t = q * PI / 2, dx = m.cos(t), dy = m.sin(t); const P0 = [rc + dx * R * 0.9, cy + dy * R * 0.9], P1 = [rc + dx * (R + fl), cy + dy * (R + fl)]; if (dx) prismY(a, [[P0[0], z0 + h * 0.34], [P1[0], z0], [P1[0], z0 + h * 0.07], [P0[0], z0 + h * 0.3]].map(([x, z]) => [x, z]).reverse(), cy - 1.6, cy + 1.6); else prismX(a, [[P0[1], z0 + h * 0.34], [P1[1], z0], [P1[1], z0 + h * 0.07], [P0[1], z0 + h * 0.3]], rc - 1.6, rc + 1.6); }
        for (const z of [h * 0.5, h * 0.66]) { xzring(a, rc, cy - R - 0.4, z0 + z, R * 0.26, 1.3, 12, 4); }
        ring(a, rc, cy, z0 + h * 0.4, R + 0.4, 1.4, 20, 4); ring(a, rc, cy, z0 + h * 0.44, R + 0.4, 1.4, 20, 4); a.circ(rc, cy, R); for (const q of [0, 1, 2, 3]) a.line(rc, cy, rc + m.cos(q * PI / 2) * (R + fl), cy + m.sin(q * PI / 2) * (R + fl), 'EQUIP-DETAIL');
        if (!tower) a.circ(cx, cy, W / 2, 'EQUIP-HIDDEN');
        if (tower) {
          const tx = cx + W * 0.32, tz = Z0 + pt, tt = H - pt - 2, ty = [cy - D * 0.15, cy + D * 0.15];
          for (const sx of [-1, 1]) for (const yy of ty) a.cyl(tx + sx * W * 0.07, yy, tz, tz + tt, 2.4, 6);
          for (let i = 1; i <= 7; i++) { const z = tz + tt * i / 7.6; for (const sx of [-1, 1]) a.tube([[tx + sx * W * 0.07, ty[0], z], [tx + sx * W * 0.07, ty[1], z]], [1.1, 1.1], 4); for (const yy of ty) a.tube([[tx - W * 0.07, yy, z], [tx + W * 0.07, yy, z]], [1.1, 1.1], 4); }
          for (let i = 0; i < 7; i++) { const z0b = tz + tt * i / 7.6, z1b = tz + tt * (i + 1) / 7.6; a.tube([[tx - W * 0.07, ty[0], i % 2 ? z1b : z0b], [tx - W * 0.07, ty[1], i % 2 ? z0b : z1b]], [0.9, 0.9], 4); }
          a.tube([[tx - W * 0.07, cy, tz + tt * 0.68], [rc + R + 2, cy, tz + tt * 0.68]], [2.2, 2.2], 6); a.box(rc + R, cy - 4, tz + tt * 0.68 - 4, rc + R + 4, cy + 4, tz + tt * 0.68 + 4); a.box(tx - W * 0.09, ty[0] - 3, tz + tt, tx + W * 0.09, ty[1] + 3, tz + tt + 2); a.rect(tx - W * 0.09, ty[0], tx + W * 0.09, ty[1], 'EQUIP-DETAIL');
        }
      }
      a.outline('EQUIP-HIDDEN'); a.log('Added the stand plate, body, nose, fins, portholes' + (v.kind === 'tower' ? ', the lattice tower with swing arm' : v.kind === 'shuttle' ? ', boosters and the winged orbiter' : '') + ' (plan and 3D).');
    } }),
];
// track pieces: samples {x, y, h, z}
function trackRun(a, S) {
  const g = 14, sl = 40, sw = 5;
  for (const s of S) { const P = rrect(s.x, s.y, s.h, sw, sl); a.prism(P, s.z, s.z + 3); a.poly(P, 'EQUIP-DETAIL'); }
  for (const k of [-1, 1]) { const pts = S.map((s) => [s.x - k * g * m.sin(s.h), s.y + k * g * m.cos(s.h), s.z + 5]); a.tube(pts, pts.map(() => 2), 6); for (let i = 0; i < pts.length - 1; i++) a.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 'EQUIP'); }
}
const lineS = (a, cx, f0, f1, zf = () => a.Z0, n = null) => { const L = (f1 - f0) * a.D, N = n ?? m.max(2, m.round(L / 10)), S = []; for (let i = 0; i <= N; i++) { const f = f0 + (f1 - f0) * i / N; S.push({ x: cx, y: a.YF + f * a.D, h: PI / 2, z: zf(f) }); } return S; };
const tracks = [
  fam({ cat: 'toys/vehicles', title: 'Generic toy railway track piece',
    desc: (v) => ({ straight: 'Toy railway straight: sleepers at even spacing with two rails on top.', curve: 'Toy railway quarter curve: sleepers fanned along the arc with two curved rails.', bridge: 'Toy railway bridge: a ramp up, a level span and a ramp down, two side girders on trestle posts, sleepers and two rails.', station: 'Toy railway station piece: a straight with a raised platform beside it, four canopy posts with a roof, a bench and a name board on a post.', tunnel: 'Toy railway tunnel: a straight with an arch of wedge blocks over the track and a wider portal ring at each end.', crossing: 'Toy railway level crossing: a straight with a road slab across the track, two barrier posts with striped arms and a cross-buck warning sign.' })[v.kind],
    vs: [['straight, 6 in', 1.8, 6, 0.4, 0, { kind: 'straight', f: 1 }], ['straight, 12 in', 1.8, 12, 0.4, 0, { kind: 'straight', f: 1 }], ['quarter curve, 6 in radius', 7, 7.8, 0.4, 0, { kind: 'curve' }], ['bridge, 12 in', 2.4, 12, 3, 0, { kind: 'bridge' }], ['station platform, 12 in', 4.2, 12, 3, 0, { kind: 'station' }], ['tunnel, 8 in', 4.4, 8, 2.5, 0, { kind: 'tunnel' }], ['level crossing, 8 in', 4.4, 8, 3, 0, { kind: 'crossing' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, y = (f) => YF + f * D, tx = v.kind === 'station' ? X0 + 22 : cx;
      if (v.kind === 'straight') { trackRun(a, lineS(a, cx, 0, 1)); a.outline('EQUIP-HIDDEN'); }
      if (v.kind === 'curve') {
        const R = W - 26, S = [], hw = 21, Cx = X0 + hw + R, Cy = YF + hw, N = 24; for (let i = 0; i <= N; i++) { const t = PI - (PI / 2) * i / N; S.push({ x: Cx + R * m.cos(t), y: Cy + R * m.sin(t), h: t - PI / 2, z: Z0 }); } trackRun(a, S); a.outline('EQUIP-HIDDEN');
      }
      if (v.kind === 'bridge') {
        const hd = H * 0.5, zf = (f) => Z0 + (f < 0.25 ? hd * f / 0.25 : f < 0.75 ? hd : hd * (1 - f) / 0.25); trackRun(a, lineS(a, cx, 0, 1, zf, 36));
        for (const k of [-1, 1]) { const gx = cx + k * 25; for (const [f0, f1] of [[0, 0.25], [0.25, 0.75], [0.75, 1]]) prismX(a, [[y(f0), zf(f0) - 7], [y(f1), zf(f1) - 7], [y(f1), zf(f1) - 1], [y(f0), zf(f0) - 1]], gx - 1.5, gx + 1.5); for (let i = 1; i < 10; i++) { const f = i / 10, yy = y(f); a.box(gx - 2, yy - 2, Z0, gx + 2, yy + 2, zf(f) - 7); } }
        for (const f of [0.3, 0.7]) a.box(cx - 25, y(f) - 3, Z0 + 4, cx + 25, y(f) + 3, zf(f) - 7);
        a.outline('EQUIP-HIDDEN');
      }
      if (v.kind === 'station') {
        trackRun(a, lineS(a, tx, 0, 1)); const px0 = tx + 26, ph = 14; a.box(px0, y(0.08), Z0, X1, y(0.92), Z0 + ph); a.rect(px0, y(0.08), X1, y(0.92));
        for (const f of [0.2, 0.8]) for (const x of [px0 + 6, X1 - 6]) a.cyl(x, y(f), Z0 + ph, Z0 + ph + H * 0.5, 2.4, 6);
        a.box(px0 + 2, y(0.18), Z0 + ph + H * 0.5, X1 - 2, y(0.82), Z0 + ph + H * 0.5 + 4); a.box(X1 - 14, y(0.4), Z0 + ph, X1 - 4, y(0.6), Z0 + ph + 8); a.box(X1 - 15, y(0.4), Z0 + ph + 8, X1 - 13, y(0.6), Z0 + ph + 16);
        a.cyl(px0 + 10, y(0.92) - 10, Z0 + ph, Z0 + ph + H * 0.33, 1.5, 6); a.box(px0 + 2, y(0.92) - 16, Z0 + ph + H * 0.26, px0 + 18, y(0.92) - 14, Z0 + ph + H * 0.36); a.outline('EQUIP-HIDDEN');
      }
      if (v.kind === 'tunnel') {
        trackRun(a, lineS(a, cx, 0, 1)); const rf = W / 2, ro = rf - 8, ri = 33, N = 11, fl = 6;
        for (const [ya, yb, R2] of [[YF, YF + fl, rf], [YF + fl, YB - fl, ro], [YB - fl, YB, rf]]) for (let i = 0; i < N; i++) { const a0 = PI - PI * i / N, a1 = PI - PI * (i + 1) / N; prismY(a, [[cx + R2 * m.cos(a0), Z0 + R2 * m.sin(a0)], [cx + R2 * m.cos(a1), Z0 + R2 * m.sin(a1)], [cx + ri * m.cos(a1), Z0 + ri * m.sin(a1)], [cx + ri * m.cos(a0), Z0 + ri * m.sin(a0)]], ya, yb); }
        a.box(cx - rf, YF, Z0, cx - ro + 0, YB, Z0 + 3); a.rect(cx - ro, YF, cx + ro, YB, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      }
      if (v.kind === 'crossing') {
        trackRun(a, lineS(a, cx, 0, 1)); const ym = y(0.5); a.box(X0, ym - 24, Z0, X1, ym + 24, Z0 + 5.5); a.rect(X0, ym - 24, X1, ym + 24); a.line(X0, ym, X1, ym, 'EQUIP-DETAIL');
        for (const [s, yy] of [[-1, ym - 34], [1, ym + 34]]) { const px = s < 0 ? X0 + 8 : X1 - 8; a.cyl(px, yy, Z0, Z0 + H * 0.5, 3, 8); const bx0 = s < 0 ? px : cx - 4, bx1 = s < 0 ? cx + 4 : px; for (let i = 0; i < 6; i++) a.box(bx0 + (bx1 - bx0) * i / 6, yy - 1.6, Z0 + H * 0.46, bx0 + (bx1 - bx0) * (i + 1) / 6, yy + 1.6, Z0 + H * 0.46 + (i % 2 ? 4 : 5)); }
        const sx = X0 + 8, sy = ym - 34; a.cyl(sx, ym + 34 + 0, Z0 + H * 0.5, Z0 + H * 0.78, 1.6, 6); a.tube([[sx - 8, ym + 34 - 1, Z0 + H * 0.66], [sx + 8, ym + 34 - 1, Z0 + H * 0.9]], [1.4, 1.4], 5); a.tube([[sx - 8, ym + 34 - 1, Z0 + H * 0.9], [sx + 8, ym + 34 - 1, Z0 + H * 0.66]], [1.4, 1.4], 5); a.outline('EQUIP-HIDDEN');
      }
      a.log('Added the ' + v.kind + ' track with sleepers and rails' + (v.kind === 'straight' || v.kind === 'curve' ? '' : ' and its structure') + ' (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy submarine on cradle',
    desc: (v) => `Toy submarine, ${v.len} in long, on a two-saddle cradle: a rounded hull, a conning tower with a periscope, bow dive planes, cross fins and a rudder at the stern, a three-blade propeller and a row of portholes on each side.`,
    vs: [['8 in', 2.4, 8, 3.2, 0, { len: 8 }], ['12 in', 3.4, 12, 4.4, 0, { len: 12 }], ['16 in', 4.4, 16, 5.6, 0, { len: 16 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, y = (f) => YF + f * D, hr = W * 0.34, zc = Z0 + H * 0.3 + hr * 0.2;
      for (const f of [0.3, 0.7]) { prismY(a, [[cx - W * 0.4, Z0], [cx + W * 0.4, Z0], [cx + hr * 0.75, zc - hr * 0.2], [cx - hr * 0.75, zc - hr * 0.2]], y(f) - 6, y(f) + 6); }
      a.ell(cx, y(0.47), zc, hr, D * 0.44, hr, 18, 9); a.cone(cx, y(0.47), zc + hr * 0.7, zc + hr * 1.25, hr * 0.48, hr * 0.4, 12); a.cyl(cx, y(0.5), zc + hr * 1.2, zc + hr * 1.3, hr * 0.46, 12);
      a.tube([[cx, y(0.56), zc + hr * 1.2], [cx, y(0.56), Z1 - 4], [cx, y(0.56) - 8, Z1 - 4]], [1.8, 1.8, 1.8], 6); a.box(cx - 3, y(0.48), zc + hr * 1.2, cx + 3, y(0.54), zc + hr * 1.55);
      for (const s of [-1, 1]) { a.box(cx + s * hr - (s > 0 ? 0 : hr * 0.7), y(0.24), zc - 1.2, cx + s * hr + (s > 0 ? hr * 0.7 : 0), y(0.3), zc + 1.2); a.box(cx + s * hr * 0.2 - (s > 0 ? 0 : hr * 0.9), y(0.9), zc - 1.2, cx + s * hr * 0.2 + (s > 0 ? hr * 0.9 : 0), y(0.96), zc + 1.2); for (let i = 0; i < 4; i++) sph(a, cx + s * hr * 0.99, y(0.34 + i * 0.08), zc + hr * 0.1, hr * 0.09, 8, 5); }
      prismX(a, [[y(0.86), zc], [y(0.98), zc + hr * 1.0], [y(0.98), zc + hr * 0.1], [y(0.9), zc - hr * 0.1]], cx - 1.4, cx + 1.4); prismX(a, [[y(0.86), zc], [y(0.98), zc - hr * 0.9], [y(0.98), zc - hr * 0.1], [y(0.9), zc + hr * 0.1]], cx - 1.4, cx + 1.4);
      a.ycyl(y(0.92), y(0.995), cx, zc, hr * 0.12, 8); for (const [dx, dz] of [[1, 0], [-0.5, 0.87], [-0.5, -0.87]]) a.box(cx + dx * hr * 0.28 - 1, y(0.985), zc + dz * hr * 0.28 - 1, cx + dx * hr * 0.28 + 1, y(0.995), zc + dz * hr * 0.28 + 1 + 0);
      a.ellp(cx, y(0.47), hr, D * 0.44); a.rect(cx - W * 0.4, y(0.3) - 6, cx + W * 0.4, y(0.3) + 6, 'EQUIP-DETAIL'); a.rect(cx - W * 0.4, y(0.7) - 6, cx + W * 0.4, y(0.7) + 6, 'EQUIP-DETAIL'); a.circ(cx, y(0.5), hr * 0.46, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the cradle, hull, conning tower with periscope, dive planes, fins, propeller and portholes (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy double-decker bus',
    desc: (v) => `Toy double-decker bus, ${v.len} in long: a lower and an upper deck with ${v.open ? 'an open top with a rail and rows of seat backs' : 'a roof'}, a window band on each deck, a front windscreen on each deck, a destination box, bumpers, lamps and four wheels.`,
    vs: [['closed, 8 in', 2.8, 8, 4.4, 0, { len: 8, open: false }], ['closed, 12 in', 3.8, 12, 6, 0, { len: 12, open: false }], ['open-top, 12 in', 3.8, 12, 5.8, 0, { len: 12, open: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, y = (f) => YF + f * D, wr = H * 0.1, zb = Z0 + wr * 0.9, bw = W * 0.4, d1 = Z0 + H * 0.47, d2 = Z1 - 3;
      a.outline('EQUIP-HIDDEN'); a.box(cx - bw, y(0.01), zb, cx + bw, y(0.99), d1);
      const n = v.len > 10 ? 8 : 6;
      for (const s of [-1, 1]) for (let i = 0; i < n; i++) { const f0 = 0.14 + i * (0.8 / n), f1 = f0 + 0.8 / n - 0.015; a.box(cx + s * bw - (s > 0 ? 0 : 1.2), y(f0), zb + H * 0.2, cx + s * bw + (s > 0 ? 1.2 : 0), y(f1), d1 - H * 0.05); }
      for (const s of [-1, 1]) a.box(cx + s * bw - (s > 0 ? 0 : 1.2), y(0.03), zb + H * 0.04, cx + s * bw + (s > 0 ? 1.2 : 0), y(0.12), d1 - H * 0.04);
      a.frame(cx - bw * 0.85, zb + H * 0.18, cx + bw * 0.85, d1 - H * 0.04, YF - 1, YF + 1, 3);
      if (!v.open) {
        a.box(cx - bw, y(0.01), d1, cx + bw, y(0.99), d2); for (const s of [-1, 1]) for (let i = 0; i < n; i++) { const f0 = 0.05 + i * (0.9 / n), f1 = f0 + 0.9 / n - 0.015; a.box(cx + s * bw - (s > 0 ? 0 : 1.2), y(f0), d1 + H * 0.12, cx + s * bw + (s > 0 ? 1.2 : 0), y(f1), d2 - H * 0.07); }
        a.frame(cx - bw * 0.85, d1 + H * 0.1, cx + bw * 0.85, d2 - H * 0.06, YF - 1, YF + 1, 3); a.box(cx - bw * 0.5, YF - 1, d2 - H * 0.06, cx + bw * 0.5, YF + 1, d2 - 1); a.box(cx - bw * 0.3, y(0.35), d2, cx + bw * 0.3, y(0.45), d2 + 0.01); a.box(cx - bw, y(0.01), d2 - 1, cx + bw, y(0.99), d2 + 0.5);
      } else {
        a.box(cx - bw, y(0.01), d1, cx + bw, y(0.99), d1 + 3); for (const s of [-1, 1]) { a.box(cx + s * bw - 1.2, y(0.01), d1 + H * 0.12, cx + s * bw + 1.2, y(0.99), d1 + H * 0.15); for (let i = 0; i <= 10; i++) a.cyl(cx + s * bw, y(0.02 + i * 0.096), d1 + 3, d1 + H * 0.15, 1.2, 5); }
        for (let r = 0; r < 4; r++) for (const s of [-1, 1]) a.box(cx + s * bw * 0.42 - bw * 0.3, y(0.2 + r * 0.17), d1 + 3, cx + s * bw * 0.42 + bw * 0.3, y(0.2 + r * 0.17) + 2, d1 + H * 0.2); a.box(cx - bw * 0.1, y(0.01), d1 + H * 0.15, cx + bw * 0.1, y(0.03), d1 + H * 0.2);
        a.cyl(cx + bw * 0.7, y(0.9), d1 + 3, d1 + H * 0.2, 3, 6);
      }
      for (const s of [-1, 1]) { a.box(cx + s * bw * 0.6 - 6, YF - 1, zb + H * 0.05, cx + s * bw * 0.6 + 6, YF + 2, zb + H * 0.1); tw(a, cx + s * (W / 2 - W * 0.07), y(0.2), wr, W * 0.13); tw(a, cx + s * (W / 2 - W * 0.07), y(0.8), wr, W * 0.13); }
      a.box(cx - bw, YF, zb - 2, cx + bw, YF + 4, zb + H * 0.04); a.box(cx - bw, YB - 4, zb - 2, cx + bw, YB, zb + H * 0.04); a.rect(cx - bw, YF, cx + bw, YB); a.line(cx - bw, y(0.5), cx + bw, y(0.5), 'EQUIP-DETAIL');
      a.log('Added the two decks, window bands, windscreens, ' + (v.open ? 'the open top with rail and seat backs' : 'the roof') + ', bumpers and wheels (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ figures and playsets
function animal(a, k) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, y = (f) => YF + f * D, eye = (x, yy, z, r = 1.8) => sph(a, x, yy, z, r, 6, 4), post = (x, yy, z0, z1, r) => a.tube([[x, yy, z0], [x, yy, z1]], [r * 0.85, r], 8);
  a.outline('EQUIP-HIDDEN');
  if (k === 'cow' || k === 'horse' || k === 'pig' || k === 'sheep') {
    const P = { cow: { hl: 0.3, rz: 0.2, rx: 0.3, ry: 0.3, by: 0.62, lr: 0.07 }, horse: { hl: 0.44, rz: 0.13, rx: 0.2, ry: 0.28, by: 0.64, lr: 0.045 }, pig: { hl: 0.16, rz: 0.27, rx: 0.34, ry: 0.32, by: 0.6, lr: 0.08 }, sheep: { hl: 0.28, rz: 0.2, rx: 0.3, ry: 0.28, by: 0.6, lr: 0.045 } }[k];
    const hl = H * P.hl, rz = H * P.rz, bz = Z0 + hl + rz * 0.75, by = y(P.by), ry = D * P.ry, rx = W * P.rx;
    a.ell(cx, by, bz, rx, ry, rz, 16, 8);
    if (k === 'sheep') for (const [dx, dy, dz] of [[-0.5, -0.4, 0.5], [0.5, -0.4, 0.5], [0, 0.1, 0.8], [-0.7, 0.3, 0.2], [0.7, 0.3, 0.2], [-0.4, 0.7, 0.4], [0.4, 0.7, 0.4]]) a.ell(cx + dx * rx, by + dy * ry, bz + dz * rz, rx * 0.5, ry * 0.4, rz * 0.5, 8, 5);
    for (const sx of [-1, 1]) for (const fy of [by - ry * 0.55, by + ry * 0.6]) { post(cx + sx * rx * 0.62, fy, Z0 + 4, bz, W * P.lr); a.cyl(cx + sx * rx * 0.62, fy, Z0, Z0 + 5, W * P.lr * 1.2, 8); a.circ(cx + sx * rx * 0.62, fy, W * P.lr, 'EQUIP-DETAIL'); }
    const hz = k === 'horse' ? Z0 + H * 0.88 : bz + rz * 0.75, hy = k === 'horse' ? y(0.13) : y(0.13);
    a.tube([[cx, by - ry * 0.7, bz + rz * 0.4], [cx, hy + D * 0.06, hz - H * 0.06]], [W * (k === 'horse' ? 0.1 : 0.13), W * (k === 'horse' ? 0.07 : 0.11)], 10);
    const hr = { cow: [0.15, 0.1, 0.14], horse: [0.07, 0.13, 0.08], pig: [0.15, 0.1, 0.14], sheep: [0.11, 0.08, 0.11] }[k];
    a.ell(cx, hy, hz, W * hr[0], D * hr[1], H * hr[2], 12, 7);
    if (k === 'cow') { a.ell(cx, y(0.04), hz - H * 0.04, W * 0.12, D * 0.04, H * 0.07, 10, 6); for (const sx of [-1, 1]) { a.cone(cx + sx * W * 0.1, hy + D * 0.03, hz + H * 0.1, hz + H * 0.2, W * 0.02, 0.5, 6); a.ell(cx + sx * W * 0.2, hy + D * 0.03, hz + H * 0.06, W * 0.07, D * 0.03, H * 0.03, 8, 5); eye(cx + sx * W * 0.1, y(0.06), hz + H * 0.04); } a.ell(cx, by + ry * 0.35, Z0 + hl - H * 0.02, W * 0.1, D * 0.06, H * 0.05, 8, 5); }
    if (k === 'horse') { a.ell(cx, y(0.04), hz - H * 0.05, W * 0.06, D * 0.05, H * 0.05, 8, 5); for (const sx of [-1, 1]) { a.cone(cx + sx * W * 0.04, hy + D * 0.04, hz + H * 0.06, hz + H * 0.12, W * 0.025, 0.5, 6); eye(cx + sx * W * 0.07, y(0.1), hz + H * 0.02, 1.4); } a.box(cx - 1.5, y(0.17), hz - H * 0.1, cx + 1.5, y(0.3), Z0 + H * 0.74); }
    if (k === 'pig') { a.cyl(cx, y(0.02), hz - H * 0.02, hz - H * 0.02 + 0.01, W * 0.08, 8); a.ycyl(YF, hy - D * 0.05, cx, hz - H * 0.03, W * 0.08, 10); for (const sx of [-1, 1]) { a.ell(cx + sx * W * 0.12, hy + D * 0.04, hz + H * 0.12, W * 0.07, D * 0.03, H * 0.07, 8, 5); eye(cx + sx * W * 0.08, y(0.07), hz + H * 0.03); } }
    if (k === 'sheep') for (const sx of [-1, 1]) { a.ell(cx + sx * W * 0.14, hy + D * 0.02, hz + H * 0.02, W * 0.08, D * 0.03, H * 0.03, 8, 5); eye(cx + sx * W * 0.07, y(0.07), hz + H * 0.02); }
    if (k === 'pig') { const pts = []; for (let i = 0; i <= 10; i++) { const t = i * 0.9; pts.push([cx + 0 * t, YB - 2 + Math.sin(t) * 0, bz + rz * 0.5 + Math.cos(t) * W * 0.07 + (i * 1.2)]); } vring(a, cx, YB - W * 0.08, bz + rz * 0.5, W * 0.07, 1.6, 10, 4); }
    else if (k === 'horse') { a.tube([[cx, by + ry * 0.9, bz + rz * 0.6], [cx, YB - 2, bz - rz * 0.2], [cx, YB - 1, Z0 + H * 0.2]], [W * 0.05, W * 0.06, W * 0.02], 8); }
    else a.tube([[cx, by + ry * 0.9, bz + rz * 0.3], [cx, YB - 2, bz - rz * 0.5]], [W * 0.035, W * 0.02], 6);
  } else if (k === 'hen') {
    const bz = Z0 + H * 0.4; a.ell(cx, y(0.58), bz, W * 0.3, D * 0.3, H * 0.28, 14, 8); sph(a, cx, y(0.2), bz + H * 0.32, W * 0.15, 10, 6); a.cone(cx, y(0.08), bz + H * 0.32, bz + H * 0.32 + 0.01, 1, 1, 3); a.tube([[cx, y(0.1), bz + H * 0.31], [cx, YF + 1, bz + H * 0.3]], [W * 0.05, 0.5], 6); a.ell(cx, y(0.2), bz + H * 0.5, W * 0.03, D * 0.08, H * 0.07, 8, 5); a.ell(cx, y(0.12), bz + H * 0.2, W * 0.025, D * 0.02, H * 0.06, 6, 4);
    a.tube([[cx, y(0.3), bz + H * 0.1], [cx, y(0.35), bz + H * 0.22]], [W * 0.12, W * 0.1], 8); prismX(a, [[y(0.82), bz + H * 0.05], [y(0.99), bz + H * 0.5], [y(0.96), bz + H * 0.52], [y(0.8), bz + H * 0.25]], cx - 1.5, cx + 1.5); for (const sx of [-1, 1]) { eye(cx + sx * W * 0.1, y(0.15), bz + H * 0.35, 1.2); post(cx + sx * W * 0.1, y(0.55), Z0 + 2, bz - H * 0.1, 1.6); for (const q of [-1, 0, 1]) a.box(cx + sx * W * 0.1 + q * 2 - 0.5, y(0.55) - 8, Z0, cx + sx * W * 0.1 + q * 2 + 0.5, y(0.55) + 1, Z0 + 1.5); }
  } else {
    const bz = Z0 + H * 0.32; a.ell(cx, y(0.62), bz, W * 0.32, D * 0.32, H * 0.2, 14, 8); a.tube([[cx, y(0.4), bz + H * 0.1], [cx, y(0.3), bz + H * 0.4], [cx, y(0.26), Z0 + H * 0.78]], [W * 0.1, W * 0.07, W * 0.06], 8); sph(a, cx, y(0.24), Z0 + H * 0.82, W * 0.13, 10, 6); a.ell(cx, y(0.08), Z0 + H * 0.78, W * 0.09, D * 0.1, H * 0.025, 8, 4);
    for (const sx of [-1, 1]) { eye(cx + sx * W * 0.08, y(0.17), Z0 + H * 0.86, 1.3); post(cx + sx * W * 0.12, y(0.6), Z0 + 4, bz - H * 0.1, 1.6); a.box(cx + sx * W * 0.12 - 5, y(0.6) - 9, Z0, cx + sx * W * 0.12 + 5, y(0.6) + 2, Z0 + 1.4); } prismX(a, [[y(0.88), bz], [y(0.99), bz + H * 0.14], [y(0.9), bz + H * 0.02]], cx - 2, cx + 2);
  }
  a.ellp(cx, y(0.58), W * 0.3, D * 0.32);
}
function carton(a, x0, y0, x1, y1, z0, z1) { a.box(x0, y0, z0, x1, y1, z1); }
function tower(a, x, y, r, z0, h, roof = true) {
  a.cyl(x, y, z0, z0 + h, r, 16); a.circ(x, y, r);
  const n = 8; for (let i = 0; i < n; i++) { if (!roof && i % 2) continue; const t = 2 * PI * i / n, bx = x + (r - 2) * m.cos(t), by = y + (r - 2) * m.sin(t); a.box(bx - r * 0.18, by - r * 0.18, z0 + h, bx + r * 0.18, by + r * 0.18, z0 + h + r * 0.35); }
  for (const z of [0.4, 0.7]) a.box(x - 1.2, y - r - 1, z0 + h * z, x + 1.2, y - r + 1, z0 + h * z + r * 0.45);
  if (roof) a.cone(x, y, z0 + h + r * 0.35, z0 + h + r * 1.5, r * 0.8, 0.5, 12);
}
function helix(a, x, y, z0, z1, R, r, turns = 6, pp = 10) { const pts = [], N = turns * pp; for (let i = 0; i <= N; i++) { const t = (2 * PI * i) / pp; pts.push([x + R * m.cos(t), y + R * m.sin(t), z0 + ((z1 - z0) * i) / N]); } a.tube(pts, pts.map(() => r), 5); }
const dolls = [
  fam({ cat: 'toys/dolls', title: 'Generic play kitchen unit',
    desc: (v) => `Play kitchen, ${v.w} in wide, in ${v.mods.length} module${v.mods.length > 1 ? 's' : ''} (${v.mods.join(', ')}) with a back upstand and rail${v.hood ? ', a hood and vent pipe' : ''}: a cooker with four hobs, oven door and knobs, a sink with rim and tap, a fridge with two doors.`,
    vs: [['cooker only, 18 in', 18, 12, 30, 0, { w: 18, mods: ['cooker'] }], ['cooker and sink, 30 in', 30, 14, 34, 0, { w: 30, mods: ['cooker', 'sink'] }], ['cooker, sink and fridge, 42 in', 42, 15, 38, 0, { w: 42, mods: ['fridge', 'cooker', 'sink'] }], ['with shelf and hood, 48 in', 48, 16, 48, 0, { w: 48, mods: ['fridge', 'cooker', 'sink', 'cupboard'], hood: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, n = v.mods.length, mw = W / n, zc = Z0 + (v.hood ? H * 0.46 : H * 0.66), cf = YF + 3, up = Z0 + (v.hood ? H * 0.58 : H * 0.8);
      a.outline(); a.box(X0, YB - 8, Z0, X1, YB, up); a.tube([[X0 + 4, YB - 10, up - 6], [X1 - 4, YB - 10, up - 6]], [1.4, 1.4], 5); for (let i = 0; i < 4; i++) a.cyl(X0 + 10 + i * mw * 0.3, YB - 11, up - 12, up - 6, 0.8, 4);
      v.mods.forEach((k, i) => {
        const x0 = X0 + i * mw, x1 = x0 + mw, mc = (x0 + x1) / 2, tall = k === 'fridge', top = tall ? Z0 + H * (v.hood ? 0.58 : 0.78) : zc;
        a.box(x0, cf, Z0 + 3, x1, YB - 8, top); a.rect(x0, YF, x1, YB, 'EQUIP-DETAIL');
        a.box(x0 + 1, YF, Z0 + 3, x1 - 1, cf, top - 1); a.frame(x0 + 3, Z0 + 6, x1 - 3, top - 4, YF - 0.5, YF + 1.5, 1.4);
        if (k === 'cooker') {
          a.box(x0, YF, zc, x1, YB - 8, zc + 3); for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { a.cyl(mc + dx * mw * 0.22, (YF + YB) / 2 + dy * D * 0.2, zc + 3, zc + 4.5, mw * 0.14, 14); ring(a, mc + dx * mw * 0.22, (YF + YB) / 2 + dy * D * 0.2, zc + 4.5, mw * 0.09, 0.8, 12, 4); a.circ(mc + dx * mw * 0.22, (YF + YB) / 2 + dy * D * 0.2, mw * 0.14, 'EQUIP-DETAIL'); }
          a.box(x0 + 6, YF - 0.4, Z0 + (zc - Z0) * 0.28, x1 - 6, YF + 1.6, Z0 + (zc - Z0) * 0.78); a.tube([[x0 + 8, YF - 4, Z0 + (zc - Z0) * 0.86], [x1 - 8, YF - 4, Z0 + (zc - Z0) * 0.86]], [1.6, 1.6], 6); for (const dx of [-1, 0, 1]) a.ycyl(YF - 4, YF, mc + dx * mw * 0.22, zc - (zc - Z0) * 0.08 + 0, 2.4, 8);
          if (v.hood) { a.box(x0 + 2, cf + 12, up + 16, x1 - 2, YB - 8, up + 38); a.cone(mc, YB - 14, up + 38, Z1 - 2, mw * 0.12, mw * 0.12, 8); a.box(x0, cf + 2, up + 12, x1, YB - 8, up + 16); }
          a.cyl(mc - mw * 0.22, (YF + YB) / 2 - D * 0.2, zc + 4.5, zc + 4.5 + 20, mw * 0.14, 14); a.cyl(mc - mw * 0.22, (YF + YB) / 2 - D * 0.2, zc + 24, zc + 26, mw * 0.15, 14); a.tube([[mc - mw * 0.4, (YF + YB) / 2 - D * 0.2, zc + 16], [mc - mw * 0.55, (YF + YB) / 2 - D * 0.2, zc + 16]], [1.5, 1.5], 5);
        }
        if (k === 'sink') {
          a.box(x0, YF, zc, x1, YB - 8, zc + 3); const bx0 = x0 + mw * 0.15, bx1 = x1 - mw * 0.15, by0 = YF + D * 0.2, by1 = YB - D * 0.3; for (const [ax, ay, bx, by] of [[bx0, by0, bx1, by0 + 3], [bx0, by1 - 3, bx1, by1], [bx0, by0, bx0 + 3, by1], [bx1 - 3, by0, bx1, by1]]) a.box(ax, ay, zc + 3, bx, by, zc + 8); a.box(bx0 + 3, by0 + 3, zc + 3, bx1 - 3, by1 - 3, zc + 4);
          a.tube([[mc, YB - 14, zc + 3], [mc, YB - 14, zc + 24], [mc, YB - 28, zc + 30], [mc, YB - 36, zc + 24]], [3, 2.2, 2.2, 2.2], 8); for (const s of [-1, 1]) a.cyl(mc + s * 12, YB - 14, zc + 3, zc + 10, 2.6, 8); a.circ(mc, (by0 + by1) / 2, (bx1 - bx0) * 0.3, 'EQUIP-DETAIL'); a.ycyl(YF - 4, YF, mc, zc * 0.55 + Z0 * 0.45, 2.4, 8);
        }
        if (k === 'fridge') { a.box(x0, YF - 0.4, Z0 + (top - Z0) * 0.72, x1, YF + 1.6, Z0 + (top - Z0) * 0.73); a.box(x1 - 9, YF - 5, Z0 + (top - Z0) * 0.55, x1 - 6, YF, Z0 + (top - Z0) * 0.68); a.box(x1 - 9, YF - 5, Z0 + (top - Z0) * 0.78, x1 - 6, YF, Z0 + (top - Z0) * 0.9); }
        if (k === 'sink' || k === 'cupboard') { a.box(mc - 9, YF - 4, top - 20, mc + 9, YF, top - 17); a.line(mc, YF, mc, YB, 'EQUIP-DETAIL'); }
      });
      a.log('Added the counter carcass, upstand, ' + v.mods.join(', ') + ' modules with doors, hobs, knobs and tap' + (v.hood ? ', shelf and hood' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic play market stall',
    desc: (v) => ({ stall: 'Toy market stall: a counter with a sloped front, two tall posts with a striped awning, three crates holding fruit balls and a hanging scale.', shop: 'Toy shop counter: a counter with a till, a hinged flap, a back wall with three shelves of jars and boxes, a sign board across the top and a striped awning.', front: 'Toy shop front: a counter, a two-level back shelf unit, a striped awning, a sign board and a window frame on each side.' })[v.kind],
    vs: [['fruit stall, 24 in', 24, 14, 40, 0, { kind: 'stall' }], ['shop counter with till, 30 in', 30, 14, 42, 0, { kind: 'shop' }], ['shop front, 36 in', 36, 16, 52, 0, { kind: 'front' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, ch = H * 0.42, pc = 28; a.outline();
      a.box(X0 + 4, YF + 3, Z0, X1 - 4, YB - 6, ch); a.frame(X0 + 10, Z0 + 8, X1 - 10, ch - 8, YF - 0.5, YF + 3, 2); a.box(X0, YF, ch, X1, YB - 4, ch + 4);
      for (const s of [-1, 1]) a.cyl(s < 0 ? X0 + 6 : X1 - 6, YF + 6, ch + 4, Z1 - 4, 2.6, 8);
      const zt = Z1 - 4, zl = ch + H * 0.5, ns = 8; for (let i = 0; i < ns; i++) { const x0 = X0 + (W * i) / ns, x1 = X0 + (W * (i + 1)) / ns, o = i % 2 ? 1.5 : 0; prismX(a, [[YB - 6, zt + o], [YB - 6, zt + 3 + o], [YF, zl + 3 + o], [YF, zl + o]], x0, x1); }
      a.box(X0 + 4, YB - 8, ch + 4, X1 - 4, YB, Z1 - 2);
      if (v.kind === 'stall') { for (let i = 0; i < 3; i++) { const x = X0 + W * (0.2 + 0.3 * i); a.box(x - 24, YF + 20, ch + 4, x + 24, YF + 70, ch + 30); for (let q = 0; q < 6; q++) sph(a, x - 16 + (q % 3) * 16, YF + 32 + m.floor(q / 3) * 24, ch + 36, 9, 8, 5); a.rect(x - 24, YF + 20, x + 24, YF + 70, 'EQUIP-DETAIL'); } a.tube([[cx, YF + 10, zl - 2], [cx, YF + 10, zl - 40]], [0.8, 0.8], 4); a.cyl(cx, YF + 10, zl - 48, zl - 40, 14, 12); }
      if (v.kind === 'shop' || v.kind === 'front') { const lv = v.kind === 'front' ? 3 : 3; for (let i = 0; i < lv; i++) { const z = ch + 16 + i * (zl - ch - 50) / lv; a.box(X0 + 8, YB - 24, z, X1 - 8, YB - 8, z + 2); for (let q = 0; q < 6; q++) { const x = X0 + 16 + q * (W - 32) / 6; if (q % 2) a.cyl(x + 10, YB - 16, z + 2, z + 14 + (q % 3) * 2, 5, 8); else a.box(x, YB - 22, z + 2, x + 18, YB - 10, z + 12); } } if (v.kind === 'shop') { a.box(X0 + W * 0.6, YF + 14, ch + 4, X0 + W * 0.6 + 34, YF + 44, ch + 16); a.box(X0 + W * 0.6 + 4, YF + 14, ch + 16, X0 + W * 0.6 + 30, YF + 20, ch + 26); a.box(X0 + 4, YF + 3, ch + 4, X0 + W * 0.24, YF + 6, ch + 7); } a.box(X0 + 6, YB - 10, zl + 4, X1 - 6, YB - 6, Z1 - 2); }
      if (v.kind === 'front') for (const s of [-1, 1]) a.frame(s < 0 ? X0 + 2 : X1 - 30, ch + 16, s < 0 ? X0 + 30 : X1 - 2, zl - 6, YB - 8, YB - 4, 2.6);
      a.log('Added the counter, posts, striped awning and the ' + v.kind + ' fittings (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic toy farm building',
    desc: (v) => ({ barn: 'Toy barn: a floor, back and side walls, a front wall with a wide opening and two open door leaves, a hay loft hatch above and a gambrel roof of four sloping panels with gable ends.', house: 'Toy farm dwelling: four walls with a door and two windows with frames, a gabled roof of two sloping panels with gable ends and a chimney on a base.', stable: 'Toy stable: a long low building with three stalls fronted by half doors with latches, partitions between the stalls and a mono-pitch roof overhanging the front.', silo: 'Toy barn with a silo: a gambrel-roofed barn with an open front and a cylindrical silo beside it with hoops and a domed top.' })[v.kind],
    vs: [['barn, 16 in', 16, 12, 14, 0, { kind: 'barn' }], ['farmhouse, 14 in', 14, 10, 14, 0, { kind: 'house' }], ['stable, 18 in', 18, 8, 9, 0, { kind: 'stable' }], ['barn with silo, 22 in', 22, 12, 18, 0, { kind: 'silo' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, t = 6, base = 6, panel = (xa, za, xb, zb, y0, y1) => prismY(a, [[xa, za], [xb, zb], [xb, zb + 4], [xa, za + 4]], y0, y1);
      a.outline();
      if (v.kind === 'barn' || v.kind === 'silo') {
        const bx1 = v.kind === 'silo' ? X0 + W * 0.7 : X1, bw = bx1 - X0, bc = (X0 + bx1) / 2, wt = Z0 + H * (v.kind === 'silo' ? 0.5 : 0.5), zk = wt + H * 0.2, zr = Z1 - 2;
        a.box(X0, YF, Z0, bx1, YB, Z0 + base); a.box(X0, YB - t, Z0 + base, bx1, YB, wt); a.box(X0, YF, Z0 + base, X0 + t, YB, wt); a.box(bx1 - t, YF, Z0 + base, bx1, YB, wt);
        const dw = bw * 0.36; a.box(X0, YF, Z0 + base, bc - dw / 2, YF + t, wt); a.box(bc + dw / 2, YF, Z0 + base, bx1, YF + t, wt); a.box(X0, YF, Z0 + base + (wt - Z0 - base) * 0.78, bx1, YF + t, wt);
        for (const s of [-1, 1]) a.box(s < 0 ? bc - dw / 2 - dw * 0.5 : bc + dw / 2, YF - 3, Z0 + base, s < 0 ? bc - dw / 2 : bc + dw / 2 + dw * 0.5, YF, Z0 + base + (wt - Z0 - base) * 0.78 - 2);
        a.frame(bc - bw * 0.1, Z0 + base + (wt - Z0 - base) * 0.82, bc + bw * 0.1, wt - 2, YF - 0.5, YF + t, 2);
        const sl = bw * 0.1; panel(X0, wt, X0 + sl, zk, YF, YB); panel(X0 + sl, zk, bc, zr - 4, YF, YB); panel(bx1, wt, bx1 - sl, zk, YF, YB); panel(bx1 - sl, zk, bc, zr - 4, YF, YB);
        for (const [y0, y1] of [[YF, YF + 3], [YB - 3, YB]]) prismY(a, [[X0, wt], [bx1, wt], [bx1 - sl, zk], [bc, zr - 4], [X0 + sl, zk]], y0, y1);
        for (let i = 1; i < 4; i++) a.line(X0, YF + D * i / 4, bx1, YF + D * i / 4, 'EQUIP-DETAIL');
        if (v.kind === 'silo') { const sr = W * 0.13, sx = X1 - sr - 2, sy = YF + D * 0.5; a.cyl(sx, sy, Z0, Z1 - sr * 1.2, sr, 18); lathe(a, sx, sy, Z1 - sr * 1.2, [[sr, 0], [sr * 0.9, sr * 0.4], [sr * 0.55, sr * 0.9], [0.01, sr * 1.15]], 18); for (const z of [0.2, 0.4, 0.6, 0.8]) ring(a, sx, sy, Z0 + (Z1 - sr * 1.2 - Z0) * z, sr + 0.6, 1.2, 18, 4); a.box(sx - 3, sy - sr - 2, Z0, sx + 3, sy - sr + 1, Z0 + H * 0.3); a.circ(sx, sy, sr); }
      }
      if (v.kind === 'house') {
        const wt = Z0 + H * 0.56, zr = Z1 - H * 0.1; a.box(X0, YF, Z0, X1, YB, Z0 + base); a.box(X0, YB - t, Z0 + base, X1, YB, wt); a.box(X0, YF, Z0 + base, X0 + t, YB, wt); a.box(X1 - t, YF, Z0 + base, X1, YB, wt);
        const dw = W * 0.16, dx = X0 + W * 0.3; a.box(X0, YF, Z0 + base, dx - dw / 2, YF + t, wt); a.box(dx + dw / 2, YF, Z0 + base, X1, YF + t, wt); a.box(dx - dw / 2, YF, Z0 + base + (wt - Z0) * 0.65, dx + dw / 2, YF + t, wt); a.box(dx + dw / 2 - 3, YF - 3, Z0 + base, dx + dw / 2, YF, Z0 + base + (wt - Z0) * 0.62);
        for (const x of [X0 + W * 0.62, X0 + W * 0.84]) { a.frame(x - 22, Z0 + H * 0.2, x + 22, Z0 + H * 0.45, YF - 1, YF + t, 3); a.box(x - 1, YF - 1, Z0 + H * 0.2, x + 1, YF + t, Z0 + H * 0.45); }
        a.box(X0 - 3, YF - 8, wt - 2, X1 + 0, YF + t, wt); panel(X0 - 3, wt, cx, zr - 4, YF - 6, YB + 3); panel(X1 + 3, wt, cx, zr - 4, YF - 6, YB + 3); for (const [y0, y1] of [[YF + 0, YF + 3], [YB - 3, YB]]) prismY(a, [[X0, wt], [X1, wt], [cx, zr - 4]], y0, y1);
        a.box(X1 - W * 0.22, YB - W * 0.12 - 6, wt + 20, X1 - W * 0.22 + W * 0.1, YB - 6, Z1 - 2); a.box(X1 - W * 0.22 - 2, YB - W * 0.12 - 8, Z1 - 4, X1 - W * 0.22 + W * 0.1 + 2, YB - 4, Z1);
      }
      if (v.kind === 'stable') {
        const wt = Z0 + H * 0.62; a.box(X0, YF, Z0, X1, YB, Z0 + base); a.box(X0, YB - t, Z0 + base, X1, YB, wt); a.box(X0, YF, Z0 + base, X0 + t, YB, wt); a.box(X1 - t, YF, Z0 + base, X1, YB, wt);
        for (const f of [1 / 3, 2 / 3]) a.box(X0 + W * f - 2, YF + t, Z0 + base, X0 + W * f + 2, YB - t, wt - 4);
        for (let i = 0; i < 3; i++) { const x0 = X0 + W * i / 3, x1 = X0 + W * (i + 1) / 3; a.box(x0 + 3, YF, Z0 + base, x1 - 3, YF + t - 2, Z0 + base + (wt - Z0) * 0.55); a.box(x0 + 3, YF, Z0 + base + (wt - Z0) * 0.58, x1 - 3, YF + t - 2, wt - 4); a.box((x0 + x1) / 2 + 12, YF - 3, Z0 + base + (wt - Z0) * 0.55, (x0 + x1) / 2 + 22, YF, Z0 + base + (wt - Z0) * 0.6); a.rect(x0, YF, x1, YB, 'EQUIP-DETAIL'); }
        prismX(a, [[YF - 6, wt], [YB, wt + H * 0.02], [YB, Z1], [YF - 6, Z1 - H * 0.12]], X0 - 2, X1 + 2);
        for (let i = 0; i < 3; i++) { const x0 = X0 + W * i / 3; a.box(x0 + W / 6 - 3, YF + t + 6, Z0 + base, x0 + W / 6 + 3, YF + t + 14, Z0 + base + 6); }
      }
      a.log('Added the walls, openings, roof and the ' + v.kind + ' details (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic wooden farm animal',
    desc: (v) => ({ cow: 'Toy cow: a barrel body with four legs and hooves, a neck and head with muzzle, two horns and ears, an udder and a tail with a tuft.', horse: 'Toy horse: a slim body on four long legs with hooves, an arched neck, a long head, two ears, a mane strip and a tail.', pig: 'Toy pig: a round body on four short legs, a head with a flat snout, two ears, a curled tail ring and eyes.', sheep: 'Toy sheep: a body covered in wool lumps on four thin legs, a small head with ears and a short tail.', hen: 'Toy hen: a rounded body, a head with a beak, a comb and a wattle, a fanned tail and two legs with toes.', duck: 'Toy duck: a low rounded body, a curved neck, a head with a flat bill, a pointed tail and two feet.' })[v.kind],
    vs: [['cow, 6 in', 2.8, 6.5, 4.4, 0, { kind: 'cow' }], ['horse, 8 in', 2.4, 8, 7, 0, { kind: 'horse' }], ['pig, 5 in', 2.8, 5.5, 3, 0, { kind: 'pig' }], ['sheep, 5 in', 2.8, 5, 4, 0, { kind: 'sheep' }], ['hen, 3 in', 2.2, 3.6, 3.6, 0, { kind: 'hen' }], ['duck, 3 in', 2.2, 3.8, 3.4, 0, { kind: 'duck' }]],
    build: (a, v) => { animal(a, v.kind); a.log('Added the body, legs, head and the ' + v.kind + ' features (plan and 3D).'); } }),
  fam({ cat: 'toys/dolls', title: 'Generic toy castle playset',
    desc: (v) => `Toy castle: a base board with ${v.towers} round towers with battlements and cone roofs, ${v.walls} with battlements, ${v.gate ? 'a gatehouse with a pointed passage, a portcullis and a lowered drawbridge on two chains' : 'an arched door'}${v.keep ? ' and a central keep with a flag' : ''}.`,
    vs: [['keep and wall, 18 in', 18, 12, 16, 0, { towers: 2, walls: 'one long wall', keep: true, gate: false }], ['gatehouse with drawbridge, 24 in', 24, 14, 18, 0, { towers: 2, walls: 'a wall each side', keep: false, gate: true }], ['fortress with four towers, 30 in', 30, 26, 22, 0, { towers: 4, walls: 'four walls round a courtyard', keep: true, gate: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bt = 8, wh = H * 0.36, wt = 7, z0 = Z0 + bt; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + bt);
      const wall = (x0, y0, x1, y1) => { a.box(x0, y0, z0, x1, y1, z0 + wh); const horiz = Math.abs(x1 - x0) > Math.abs(y1 - y0), L = horiz ? x1 - x0 : y1 - y0, n = m.floor(L / 22); for (let i = 0; i < n; i += 2) { const f0 = (L * i) / n, f1 = (L * (i + 1)) / n; if (horiz) a.box(x0 + f0, y0, z0 + wh, x0 + f1, y1, z0 + wh + 9); else a.box(x0, y0 + f0, z0 + wh, x1, y0 + f1, z0 + wh + 9); } a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); };
      const tr = m.min(W, D) * (v.towers === 4 ? 0.085 : 0.1), th = H * 0.6;
      if (v.towers === 2 && !v.gate) { wall(X0 + tr * 1.4, YF + D * 0.5 - wt / 2, X1 - tr * 1.2, YF + D * 0.5 + wt / 2); tower(a, X0 + tr * 1.2, YF + D * 0.5, tr, z0, th); tower(a, X1 - tr * 1.2, YF + D * 0.5, tr, z0, th); }
      if (v.keep) { const kw = W * (v.towers === 4 ? 0.2 : 0.26), kd = D * (v.towers === 4 ? 0.22 : 0.4), kc = v.towers === 4 ? cx : cx, ky = v.towers === 4 ? cy : YF + D * 0.7, kh = H * 0.55; a.box(kc - kw / 2, ky - kd / 2, z0, kc + kw / 2, ky + kd / 2, z0 + kh); for (let i = 0; i < 5; i++) a.box(kc - kw / 2 + (kw * i) / 5, ky - kd / 2, z0 + kh, kc - kw / 2 + (kw * (i + 0.5)) / 5, ky - kd / 2 + 4, z0 + kh + 8); a.frame(kc - 12, z0 + kh * 0.5, kc + 12, z0 + kh * 0.8, ky - kd / 2 - 1, ky - kd / 2 + 2, 2.6); a.tube([[kc, ky, z0 + kh], [kc, ky, Z1 - 2]], [1.4, 1.2], 6); prismX(a, [[ky, Z1 - 2], [ky + 28, Z1 - 12], [ky, Z1 - 22]], kc - 0.8, kc + 0.8); a.rect(kc - kw / 2, ky - kd / 2, kc + kw / 2, ky + kd / 2); }
      if (v.gate && v.towers === 2) {
        const gw = W * 0.2, gt = YF + D * 0.45, gd = D * 0.28, gh = H * 0.55; for (const s of [-1, 1]) { wall(s < 0 ? X0 + tr * 1.2 : cx + gw / 2 + tr * 0.6, gt, s < 0 ? cx - gw / 2 - tr * 0.6 : X1 - tr * 1.2, gt + wt); tower(a, cx + s * (gw / 2 + tr * 0.9), gt + wt / 2, tr, z0, th); a.box(cx + s * (gw / 2 + tr * 0.9) - tr * 0.4, gt - 3, z0, cx + s * (gw / 2 + tr * 0.9) + tr * 0.4, gt + wt + 3, z0 + wh * 1.0); }
        a.box(cx - gw / 2 - tr * 0.2, gt - 3, z0 + wh * 0.78, cx + gw / 2 + tr * 0.2, gt + wt + 3, z0 + wh * 1.0 + 8); for (let i = 0; i < 6; i++) a.tube([[cx - gw / 2 + (gw * (i + 0.5)) / 6, gt - 1, z0 + 2], [cx - gw / 2 + (gw * (i + 0.5)) / 6, gt - 1, z0 + wh * 0.78]], [1, 1], 4); for (const z of [0.25, 0.5]) a.tube([[cx - gw / 2, gt - 1, z0 + wh * z], [cx + gw / 2, gt - 1, z0 + wh * z]], [0.9, 0.9], 4);
        prismX(a, [[gt - 3, z0 + wh * 0.72], [YF + 8, z0 + 2], [YF + 8, z0], [gt - 3, z0 + wh * 0.66]], cx - gw / 2 + 2, cx + gw / 2 - 2); for (const s of [-1, 1]) a.tube([[cx + s * (gw / 2 - 2), gt - 2, z0 + wh * 0.74], [cx + s * (gw / 2 - 2), YF + 8, z0 + 4]], [0.8, 0.8], 4); a.rect(cx - gw / 2, YF + 8, cx + gw / 2, gt, 'EQUIP-DETAIL');
      }
      if (v.towers === 4) {
        const ins = tr * 1.3; for (const [x, y] of [[X0 + ins, YF + ins], [X1 - ins, YF + ins], [X0 + ins, YB - ins], [X1 - ins, YB - ins]]) tower(a, x, y, tr, z0, th);
        wall(X0 + ins, YB - ins - wt / 2, X1 - ins, YB - ins + wt / 2); wall(X0 + ins - wt / 2, YF + ins, X0 + ins + wt / 2, YB - ins); wall(X1 - ins - wt / 2, YF + ins, X1 - ins + wt / 2, YB - ins);
        const gw = W * 0.14, gy = YF + ins; wall(X0 + ins, gy - wt / 2, cx - gw / 2, gy + wt / 2); wall(cx + gw / 2, gy - wt / 2, X1 - ins, gy + wt / 2); a.box(cx - gw / 2 - 2, gy - wt / 2, z0 + wh * 0.72, cx + gw / 2 + 2, gy + wt / 2, z0 + wh); for (let i = 0; i < 6; i++) a.tube([[cx - gw / 2 + (gw * (i + 0.5)) / 6, gy - wt / 2 - 1, z0 + 2], [cx - gw / 2 + (gw * (i + 0.5)) / 6, gy - wt / 2 - 1, z0 + wh * 0.72]], [1, 1], 4);
        prismX(a, [[gy - wt / 2, z0 + wh * 0.7], [YF + 4, z0 + 2], [YF + 4, z0], [gy - wt / 2, z0 + wh * 0.64]], cx - gw / 2 + 2, cx + gw / 2 - 2);
      }
      a.log('Added the base board, towers with battlements and roofs, walls, ' + (v.gate ? 'gate with portcullis and drawbridge' : 'door') + (v.keep ? ' and the keep with flag' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic play tent',
    desc: (v) => ({ tipi: `Cone-shaped play tent: a cloth cone over ${v.poles} poles that cross above the top, a door slit with two tie flaps, a floor disc and a ring of ties near the base.`, aframe: 'A-frame play tent: two sloping cloth panels meeting at a ridge pole, front and back poles, a front opening with two tied flaps, end panels, a floor and a small pennant on the ridge.' })[v.kind],
    vs: [['tipi, 4 poles, 40 in', 40, 40, 52, 0, { kind: 'tipi', poles: 4 }], ['tipi, 6 poles, 48 in', 48, 48, 60, 0, { kind: 'tipi', poles: 6 }], ['A-frame, 48 in', 48, 36, 42, 0, { kind: 'aframe' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
      if (v.kind === 'tipi') {
        const R = W * 0.47, top = Z1 - H * 0.12; a.cyl(cx, cy, Z0, Z0 + 3, R, 24); a.cone(cx, cy, Z0 + 3, top, R * 0.96, R * 0.1, v.poles * 2); a.circ(cx, cy, R); a.circ(cx, cy, R * 0.1, 'EQUIP-DETAIL');
        for (let i = 0; i < v.poles; i++) { const t = (2 * PI * i) / v.poles + PI / v.poles, ex = cx + R * 0.98 * m.cos(t), ey = cy + R * 0.98 * m.sin(t); a.tube([[ex, ey, Z0 + 2], [cx + (ex - cx) * 0.06, cy + (ey - cy) * 0.06, top], [cx - (ex - cx) * 0.12, cy - (ey - cy) * 0.12, Z1 - 1]], [1.8, 1.8, 1.6], 6); a.line(cx, cy, ex, ey, 'EQUIP-DETAIL'); }
        ring(a, cx, cy, Z0 + H * 0.2, R * 0.8, 1.3, 24, 4); const dh = H * 0.55, dw = R * 0.5, ya = cy - R * 0.8; prismX(a, [[ya - 2, Z0 + 3], [ya + 4, Z0 + 3], [ya + 8, Z0 + dh], [ya - 4, Z0 + dh]].map(([y, z]) => [y - 4, z]), cx - dw * 0.12, cx + dw * 0.12);
        for (const s of [-1, 1]) { quad(a, [cx + s * dw * 0.14, ya - 8, Z0 + 3], [cx + s * dw * 0.55, ya - 5, Z0 + 3], [cx + s * dw * 0.4, ya + 2, Z0 + dh * 0.9], [cx + s * dw * 0.14, ya - 2, Z0 + dh]); }
      } else {
        const hw = W * 0.46, d = D * 0.92, y0 = cy - d / 2, y1 = cy + d / 2, rz = Z1 - 3; a.box(cx - hw, y0, Z0, cx + hw, y1, Z0 + 3);
        for (const s of [-1, 1]) prismX(a, s < 0 ? [[y0, Z0 + 3], [y1, Z0 + 3], [y1, Z0 + 6], [y0, Z0 + 6]] : [[y0, Z0 + 3], [y1, Z0 + 3], [y1, Z0 + 6], [y0, Z0 + 6]], cx + s * hw - 3, cx + s * hw + 3);
        for (const s of [-1, 1]) { quad(a, [cx + s * hw, y0, Z0 + 3], [cx + s * hw, y1, Z0 + 3], [cx, y1, rz], [cx, y0, rz]); quad(a, [cx + s * (hw - 1.5), y0, Z0 + 3], [cx + s * (hw - 1.5), y1, Z0 + 3], [cx, y1, rz - 1.5], [cx, y0, rz - 1.5]); }
        for (const y of [y0, y1]) { a.tube([[cx - hw, y, Z0 + 3], [cx, y, rz], [cx + hw, y, Z0 + 3]], [1.8, 1.8, 1.8], 6); }
        a.tube([[cx, y0 - 3, rz + 1], [cx, y1 + 3, rz + 1]], [2, 2], 6); quad(a, [cx - hw * 0.0, y1, rz], [cx - hw, y1, Z0 + 3], [cx + hw, y1, Z0 + 3], [cx, y1, rz]);
        quad(a, [cx, y0, rz], [cx - hw * 0.12, y0, Z0 + H * 0.5], [cx - hw * 0.5, y0, Z0 + 3], [cx - hw, y0, Z0 + 3]); quad(a, [cx, y0, rz], [cx + hw * 0.12, y0, Z0 + H * 0.5], [cx + hw * 0.5, y0, Z0 + 3], [cx + hw, y0, Z0 + 3]);
        a.tube([[cx, y0 - 3, rz + 1], [cx, y0 - 3, Z1]], [1, 1], 4); quad(a, [cx, y0 - 3, Z1], [cx, y0 - 3 - 14, Z1 - 4], [cx, y0 - 3, Z1 - 8], [cx, y0 - 3, Z1]);
        a.rect(cx - hw, y0, cx + hw, y1); a.line(cx, y0, cx, y1, 'EQUIP-DETAIL');
      }
      a.log('Added the floor, cloth, poles, door flaps and ties (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic jack-in-the-box',
    desc: (v) => `Spring toy: a cube box with a side crank handle and a corner edge strip, a hinged lid thrown open, a coiled spring with ${v.turns} turns and a jester head with a ruff, face dots and a two-point hat ending in bobbles.`,
    vs: [['small, 8 in', 4, 4, 8, 0, { turns: 5 }], ['medium, 12 in', 6, 6, 12, 0, { turns: 6 }], ['large with crank, 16 in', 8, 8, 16, 0, { turns: 7 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, s = W * 0.88, bx0 = cx - s / 2, bx1 = cx + s / 2, by0 = cy - s / 2, by1 = cy + s / 2, bz = Z0 + s * 0.88;
      a.outline('EQUIP-HIDDEN'); a.box(bx0, by0, Z0, bx1, by1, bz); for (const [x, y] of [[bx0, by0], [bx1 - 4, by0], [bx0, by1 - 4], [bx1 - 4, by1 - 4]]) a.box(x, y, Z0, x + 4, y + 4, bz + 1);
      for (const k of [0.3, 0.7]) a.box(bx0, by0 - 0.6, Z0 + s * 0.15 * 0 + s * (k - 0.15), bx1, by0 + 0.4, Z0 + s * (k - 0.1)); a.ycyl(by1, by1 + s * 0.05, bx1, Z0 + s * 0.4, 0.1, 4);
      a.xcyl(bx1, bx1 + s * 0.12, cy, Z0 + s * 0.45, s * 0.035, 8); a.tube([[bx1 + s * 0.12, cy, Z0 + s * 0.45], [bx1 + s * 0.12, cy, Z0 + s * 0.62]], [s * 0.03, s * 0.03], 6); sph(a, bx1 + s * 0.12, cy, Z0 + s * 0.64, s * 0.06, 8, 5);
      quad(a, [bx0, by1, bz], [bx1, by1, bz], [bx1, by1 + s * 0.1, bz + s * 0.3], [bx0, by1 + s * 0.1, bz + s * 0.3]);
      const sz1 = Z0 + H * 0.58; helix(a, cx, cy, bz, sz1, s * 0.16, 1.3, v.turns, 10);
      const hr = s * 0.28; sph(a, cx, cy, sz1 + hr, hr, 14, 8); lathe(a, cx, cy, sz1 - 2, [[hr * 0.7, 0], [hr * 1.05, 4], [hr * 0.7, 8]], 12);
      for (const sx of [-1, 1]) { sph(a, cx + sx * hr * 0.4, cy - hr * 0.85, sz1 + hr * 1.1, 1.6, 6, 4); } sph(a, cx, cy - hr * 0.98, sz1 + hr * 0.9, 2.2, 6, 4); a.ell(cx, cy - hr * 0.9, sz1 + hr * 0.5, hr * 0.3, 1.5, 1, 8, 4);
      for (const sx of [-1, 1]) { a.tube([[cx + sx * hr * 0.2, cy, sz1 + hr * 1.7], [cx + sx * hr * 0.9, cy, sz1 + hr * 2.3], [cx + sx * hr * 1.2, cy, sz1 + hr * 1.7]], [hr * 0.38, hr * 0.28, hr * 0.12], 8); sph(a, cx + sx * hr * 1.2, cy, sz1 + hr * 1.6, 3.2, 6, 4); }
      a.circ(cx, cy, hr, 'EQUIP-DETAIL'); a.rect(bx0, by0, bx1, by1); a.log('Added the box with crank, the open lid, the spring and the jester head with hat and ruff (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic toy dinosaur',
    desc: (v) => ({ long: 'Toy long-necked dinosaur: a barrel body on four columnar legs, a long neck rising to a small head and a long tapering tail.', biped: 'Toy two-legged dinosaur: a heavy body on two large legs with clawed feet, a big head with a row of teeth, two small arms and a long counterbalancing tail.', plated: 'Toy plated dinosaur: a low body on four legs, a row of upright back plates, a small head and a tail with two spikes.', horned: 'Toy three-horned dinosaur: a bulky body on four legs, a large neck frill, two long brow horns and a short nose horn on a beaked head, and a short tail.' })[v.kind],
    vs: [['long-neck, 14 in', 4, 14, 9, 0, { kind: 'long' }], ['two-legged, 12 in', 3.4, 12, 8, 0, { kind: 'biped' }], ['plated, 10 in', 4, 10, 5, 0, { kind: 'plated' }], ['three-horned, 12 in', 4.4, 12, 5.4, 0, { kind: 'horned' }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, y = (f) => YF + f * D, leg = (x, yy, z1, r, h = Z0 + 2) => { a.tube([[x, yy, h + 4], [x, yy, z1]], [r * 0.9, r], 8); a.ell(x, yy - r * 0.4, Z0 + 4, r * 1.2, r * 1.6, 4, 8, 4); };
      a.outline('EQUIP-HIDDEN');
      if (v.kind === 'long') { const bz = Z0 + H * 0.34; a.ell(cx, y(0.58), bz, W * 0.34, D * 0.22, H * 0.2, 14, 8); for (const sx of [-1, 1]) for (const f of [0.5, 0.68]) leg(cx + sx * W * 0.22, y(f), bz, W * 0.1); a.tube([[cx, y(0.4), bz + H * 0.05], [cx, y(0.28), bz + H * 0.35], [cx, y(0.16), Z0 + H * 0.84]], [W * 0.14, W * 0.1, W * 0.07], 10); a.ell(cx, y(0.1), Z0 + H * 0.88, W * 0.09, D * 0.05, H * 0.05, 10, 6); a.tube([[cx, y(0.76), bz], [cx, y(0.9), bz - H * 0.1], [cx, YB - 1, Z0 + H * 0.12]], [W * 0.16, W * 0.08, W * 0.015], 10); for (const sx of [-1, 1]) sph(a, cx + sx * W * 0.06, y(0.08), Z0 + H * 0.9, 1.5, 6, 4); }
      if (v.kind === 'biped') { const bz = Z0 + H * 0.5; a.ell(cx, y(0.56), bz, W * 0.28, D * 0.2, H * 0.2, 14, 8); for (const sx of [-1, 1]) { a.tube([[cx + sx * W * 0.2, y(0.56), bz - H * 0.05], [cx + sx * W * 0.22, y(0.58), Z0 + H * 0.12]], [W * 0.14, W * 0.07], 8); a.tube([[cx + sx * W * 0.22, y(0.58), Z0 + H * 0.12], [cx + sx * W * 0.22, y(0.5), Z0 + 3]], [W * 0.06, W * 0.07], 8); a.ell(cx + sx * W * 0.22, y(0.46), Z0 + 4, W * 0.1, D * 0.06, 4, 8, 4); for (const q of [-1, 0, 1]) a.cone(cx + sx * W * 0.22 + q * 4, y(0.4), Z0 + 3, Z0 + 4, 1.6, 0.4, 4); a.tube([[cx + sx * W * 0.2, y(0.4), bz + H * 0.06], [cx + sx * W * 0.2, y(0.34), bz - H * 0.04]], [W * 0.04, W * 0.03], 6); }
        a.tube([[cx, y(0.4), bz + H * 0.08], [cx, y(0.3), Z0 + H * 0.78]], [W * 0.18, W * 0.14], 10); a.ell(cx, y(0.2), Z0 + H * 0.82, W * 0.17, D * 0.14, H * 0.1, 12, 7); a.box(cx - W * 0.12, YF, Z0 + H * 0.74, cx + W * 0.12, y(0.14), Z0 + H * 0.76); for (let i = -2; i <= 2; i++) a.cone(cx + i * W * 0.05, y(0.04), Z0 + H * 0.76, Z0 + H * 0.72, 1.4, 0.3, 4); a.tube([[cx, y(0.7), bz], [cx, y(0.88), bz - H * 0.1], [cx, YB - 1, Z0 + H * 0.2]], [W * 0.2, W * 0.1, W * 0.02], 10); }
      if (v.kind === 'plated') { const bz = Z0 + H * 0.4; a.ell(cx, y(0.52), bz, W * 0.34, D * 0.28, H * 0.22, 14, 8); for (const sx of [-1, 1]) for (const f of [0.38, 0.66]) leg(cx + sx * W * 0.22, y(f), bz, W * 0.1); a.tube([[cx, y(0.26), bz], [cx, y(0.14), bz - H * 0.02]], [W * 0.14, W * 0.1], 8); a.ell(cx, y(0.1), bz - H * 0.02, W * 0.1, D * 0.06, H * 0.08, 10, 6); for (let i = 0; i < 6; i++) { const f = 0.3 + i * 0.09, zh = H * (i < 3 ? 0.22 + i * 0.08 : 0.4 - (i - 3) * 0.08); a.prism([[cx - 2, y(f)], [cx + 2, y(f)], [cx + 2, y(f) + D * 0.07], [cx - 2, y(f) + D * 0.07]], bz + H * 0.18, bz + H * 0.18 + zh * 0.8); } a.tube([[cx, y(0.74), bz], [cx, y(0.9), bz - H * 0.1], [cx, YB - 1, Z0 + H * 0.2]], [W * 0.12, W * 0.07, W * 0.02], 8); for (const f of [0.9, 0.96]) for (const sx of [-1, 1]) a.cone(cx + sx * 3, y(f), Z0 + H * 0.25, Z0 + H * 0.4, 1.8, 0.4, 5); }
      if (v.kind === 'horned') { const bz = Z0 + H * 0.4; a.ell(cx, y(0.58), bz, W * 0.36, D * 0.26, H * 0.24, 14, 8); for (const sx of [-1, 1]) for (const f of [0.46, 0.74]) leg(cx + sx * W * 0.24, y(f), bz, W * 0.1); a.ell(cx, y(0.2), bz + H * 0.02, W * 0.15, D * 0.12, H * 0.16, 12, 7); a.ell(cx, y(0.08), bz - H * 0.04, W * 0.07, D * 0.05, H * 0.07, 8, 5); a.cone(cx, y(0.05), bz + H * 0.04, bz + H * 0.14, W * 0.03, 0.4, 6); for (const sx of [-1, 1]) a.tube([[cx + sx * W * 0.08, y(0.16), bz + H * 0.14], [cx + sx * W * 0.1, y(0.07), bz + H * 0.3]], [W * 0.03, W * 0.008], 6); a.prism([[cx - W * 0.3, y(0.34)], [cx + W * 0.3, y(0.34)], [cx + W * 0.26, y(0.3)], [cx - W * 0.26, y(0.3)]], bz + H * 0.1, bz + H * 0.38); a.tube([[cx, y(0.82), bz], [cx, YB - 1, Z0 + H * 0.2]], [W * 0.12, W * 0.03], 8); }
      a.log('Added the body, legs, head, tail and the ' + v.kind + ' features (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic doll pram',
    desc: (v) => ({ single: 'Doll pram: a tray body with side walls, head and foot boards, an undercarriage with cross braces, four spoked wheels and a handle bar with a grip.', hood: 'Doll pram with a folding hood: a tray body, a canopy of three ribs over cloth, an undercarriage with braces, four spoked wheels and a high handle bar.', twin: 'Twin doll pram: a wide double tray body with a centre divider, two hood sections over three ribs each, an undercarriage with braces, four spoked wheels and a handle bar.' })[v.kind],
    vs: [['single, 14 in', 10, 18, 22, 0, { kind: 'single' }], ['with hood, 20 in', 11, 22, 26, 0, { kind: 'hood' }], ['twin, 24 in', 16, 26, 26, 0, { kind: 'twin' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, y = (f) => YF + f * D, R = H * 0.15, bz = Z0 + R * 2 + 12, bw = W * 0.4, bh = H * 0.18; a.outline('EQUIP-HIDDEN');
      a.box(cx - bw, y(0.12), bz, cx + bw, y(0.78), bz + 4); for (const s of [-1, 1]) { a.box(cx + s * bw - (s > 0 ? 3 : 0), y(0.12), bz, cx + s * bw + (s > 0 ? 0 : 3), y(0.78), bz + bh); } a.box(cx - bw, y(0.12), bz, cx + bw, y(0.12) + 3, bz + bh); a.box(cx - bw, y(0.78) - 3, bz, cx + bw, y(0.78), bz + bh * 1.3);
      if (v.kind === 'twin') a.box(cx - 1.5, y(0.12), bz, cx + 1.5, y(0.78), bz + bh);
      for (const s of [-1, 1]) { for (const f of [0.2, 0.7]) { a.tube([[cx + s * bw * 0.8, y(f), bz], [cx + s * (W * 0.38), y(f), Z0 + R]], [2, 2], 6); tw(a, cx + s * W * 0.43, y(f), R, 5); for (let i = 0; i < 4; i++) { const t = i * PI / 4; a.tube([[cx + s * W * 0.43, y(f) + R * 0.9 * m.cos(t), Z0 + R + R * 0.9 * m.sin(t)], [cx + s * W * 0.43, y(f) - R * 0.9 * m.cos(t), Z0 + R - R * 0.9 * m.sin(t)]], [0.5, 0.5], 4); } } }
      for (const f of [0.2, 0.7]) a.xcyl(cx - W * 0.43, cx + W * 0.43, y(f), Z0 + R, 1.8, 6);
      a.tube([[cx - bw * 0.8, y(0.2), bz - 3], [cx + bw * 0.8, y(0.7), bz - 3]], [1.4, 1.4], 5); a.tube([[cx + bw * 0.8, y(0.2), bz - 3], [cx - bw * 0.8, y(0.7), bz - 3]], [1.4, 1.4], 5);
      if (v.kind !== 'single') { const nh = v.kind === 'twin' ? 2 : 1, hz = bz + bh, hr = bw / nh * 0.92; for (let h = 0; h < nh; h++) { const hc = nh === 1 ? cx : cx + (h ? 1 : -1) * bw * 0.5; for (const f of [0.14, 0.26, 0.4]) { const pts = []; for (let i = 0; i <= 8; i++) { const t = PI * i / 8; pts.push([hc + hr * m.cos(t), y(f), hz + hr * 0.9 * m.sin(t) * (f > 0.3 ? 0.7 : 1)]); } a.tube(pts, pts.map(() => 1.3), 5); } for (let i = 0; i < 8; i++) { const t0 = PI * i / 8, t1 = PI * (i + 1) / 8; quad(a, [hc + hr * m.cos(t0), y(0.14), hz + hr * 0.9 * m.sin(t0)], [hc + hr * m.cos(t1), y(0.14), hz + hr * 0.9 * m.sin(t1)], [hc + hr * m.cos(t1), y(0.4), hz + hr * 0.63 * m.sin(t1)], [hc + hr * m.cos(t0), y(0.4), hz + hr * 0.63 * m.sin(t0)]); } } }
      a.tube([[cx - bw * 0.9, y(0.78), bz + bh * 0.4], [cx - bw * 0.9, y(0.86), Z1 - 4], [cx + bw * 0.9, y(0.86), Z1 - 4], [cx + bw * 0.9, y(0.78), bz + bh * 0.4]], [2, 2, 2, 2], 6); a.tube([[cx - bw * 0.9, y(0.86), Z1 - 4], [cx + bw * 0.9, y(0.86), Z1 - 4]], [3, 3], 8); a.rect(cx - bw, y(0.12), cx + bw, y(0.78)); a.log('Added the tray body, undercarriage, spoked wheels' + (v.kind !== 'single' ? ', the hood ribs with cloth' : '') + ' and the handle bar (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic doll bunk bed',
    desc: (v) => v.loft ? 'Doll loft bed: four tall posts, a mattress on a slatted platform with a guard rail and a side ladder, with a small desk, a stool and a shelf underneath.' : 'Doll bunk bed: four posts, two mattresses on slatted bases with pillows, a guard rail on the upper bunk and a side ladder with rungs.',
    vs: [['bunk, 12 in', 8, 14, 14, 0, { loft: false }], ['loft with desk, 14 in', 9, 16, 16, 0, { loft: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, pr = 3.6, bx0 = X0 + 4, bx1 = X1 - 4, y0 = YF + 4, y1 = YB - 4; a.outline('EQUIP-HIDDEN');
      for (const x of [bx0, bx1]) for (const y of [y0, y1]) a.cyl(x, y, Z0, Z1, pr, 8);
      const bunks = v.loft ? [Z0 + H * 0.58] : [Z0 + H * 0.2, Z0 + H * 0.6];
      bunks.forEach((z, i) => { a.box(bx0, y0, z, bx1, y1, z + 4); for (let k = 0; k < 8; k++) a.box(bx0, y0 + 6 + k * (y1 - y0 - 12) / 7 - 1.5, z + 4, bx1, y0 + 6 + k * (y1 - y0 - 12) / 7 + 1.5, z + 6); a.box(bx0 + 2, y0 + 2, z + 6, bx1 - 2, y1 - 2, z + 6 + H * 0.06); a.ell(cx, y1 - 18, z + 6 + H * 0.1, W * 0.28, 12, H * 0.025, 10, 5); a.box(bx0, y0, z + 4, bx1, y0 + 2, z + H * 0.1); a.box(bx0, y1 - 2, z + 4, bx1, y1, z + H * 0.16); if (i === bunks.length - 1) { a.box(bx0, y0, z + H * 0.12, bx1, y0 + 2, z + H * 0.16); a.box(bx0, y1 - 2, z + H * 0.16, bx1, y1, z + H * 0.22); a.tube([[bx1 + 0, y0, z + H * 0.16], [bx1, y1, z + H * 0.16]], [1.4, 1.4], 5); } });
      const lx = bx1 + 0; for (const y of [y0 + 18, y0 + 38]) a.tube([[bx1 + 3, y, Z0 + 2], [bx1 + 3, y, bunks[bunks.length - 1] + 6]], [1.4, 1.4], 5); for (let i = 1; i <= 5; i++) a.tube([[bx1 + 3, y0 + 18, Z0 + (bunks[bunks.length - 1] - Z0) * i / 5.6], [bx1 + 3, y0 + 38, Z0 + (bunks[bunks.length - 1] - Z0) * i / 5.6]], [1.1, 1.1], 5);
      if (v.loft) { a.box(bx0 + 4, y0 + 8, Z0 + H * 0.3, bx0 + W * 0.45, y0 + 8 + D * 0.4, Z0 + H * 0.33); a.box(bx0 + 4, y0 + 8, Z0, bx0 + 8, y0 + 12, Z0 + H * 0.3); a.box(bx0 + W * 0.45 - 4, y0 + 8, Z0, bx0 + W * 0.45, y0 + 12, Z0 + H * 0.3); a.box(bx0 + 4, y0 + 8 + D * 0.4 - 4, Z0, bx0 + 8, y0 + 8 + D * 0.4, Z0 + H * 0.3); a.box(bx0 + W * 0.45 - 4, y0 + 8 + D * 0.4 - 4, Z0, bx0 + W * 0.45, y0 + 8 + D * 0.4, Z0 + H * 0.3); a.cyl(bx0 + W * 0.3, y1 - 28, Z0, Z0 + H * 0.17, 4, 8); a.cyl(bx0 + W * 0.3, y1 - 28, Z0 + H * 0.17, Z0 + H * 0.19, 8, 10); a.box(bx0 + 2, y1 - 10, Z0 + H * 0.16, bx0 + W * 0.4, y1 - 2, Z0 + H * 0.17); }
      a.rect(bx0, y0, bx1, y1, 'EQUIP-DETAIL'); a.log('Added the posts, slatted bunks with mattresses and pillows, guard rail and ladder' + (v.loft ? ', and the desk, stool and shelf' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic marionette on stand',
    desc: (v) => `Marionette on a display stand: a round base with a post and crossed control bars, strings to the head, both hands and both knees, and a jointed wooden figure ${v.skirt ? 'in a flared skirt ' : ''}${v.hat ? 'with a pointed hat ' : ''}standing on the base.`.replace('  ', ' '),
    vs: [['figure, 18 in', 10, 8, 18, 0, {}], ['figure in skirt, 24 in', 12, 10, 24, 0, { skirt: true }], ['figure with hat, 24 in', 12, 10, 24, 0, { hat: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bz = 8, fz = Z0 + bz, s = (H - bz - 12) / 100, post = YB - W * 0.1;
      a.cyl(cx, cy, Z0, Z0 + bz, W * 0.46, 24); a.circ(cx, cy, W * 0.46); a.cyl(cx, post, Z0 + bz, Z1 - 3, 2.4, 8); a.cyl(cx, post, Z0 + bz, Z0 + bz + 6, 5, 8);
      const ty = fz + 96 * s, hz = fz + 82 * s; a.tube([[cx - W * 0.4, post, Z1 - 3], [cx + W * 0.4, post, Z1 - 3]], [2.2, 2.2], 6); a.tube([[cx, post, Z1 - 3], [cx, cy, Z1 - 3]], [2.2, 2.2], 6); a.tube([[cx - W * 0.3, cy, Z1 - 3], [cx + W * 0.3, cy, Z1 - 3]], [2.2, 2.2], 6); sph(a, cx, post, Z1 - 1, 3.4, 8, 5);
      const str = (p, q) => a.tube([p, q], [0.45, 0.45], 3);
      sph(a, cx, cy, hz, 7 * s, 12, 7); a.ell(cx, cy, fz + 62 * s, 8.5 * s, 5 * s, 18 * s, 10, 6); a.cone(cx, cy, fz + 45 * s, fz + 49 * s, 5 * s, 5 * s, 10);
      if (v.skirt) lathe(a, cx, cy, fz + 26 * s, [[W * 0.34, 0], [W * 0.3, 6 * s], [W * 0.14, 22 * s], [W * 0.09, 30 * s]], 16, false);
      if (v.hat) a.cone(cx, cy, hz + 5 * s, hz + 22 * s, 6 * s, 0.6, 10);
      for (const sx of [-1, 1]) {
        a.tube([[cx + sx * 8 * s, cy, fz + 74 * s], [cx + sx * W * 0.32, cy, fz + 58 * s], [cx + sx * W * 0.36, cy, fz + 44 * s]], [2.2 * s, 2 * s, 2 * s], 6); sph(a, cx + sx * W * 0.36, cy, fz + 43 * s, 2.8 * s, 6, 4);
        a.tube([[cx + sx * 4 * s, cy, fz + 46 * s], [cx + sx * 5 * s, cy, fz + 22 * s], [cx + sx * 5 * s, cy, fz + 5 * s]], [3 * s, 2.4 * s, 2.2 * s], 7); a.ell(cx + sx * 5 * s, cy - 3 * s, fz + 3 * s, 3 * s, 6 * s, 2.6 * s, 8, 5);
        str([cx + sx * W * 0.36, cy, fz + 44 * s], [cx + sx * W * 0.3, cy, Z1 - 3]); str([cx + sx * 5 * s, cy, fz + 24 * s], [cx + sx * W * 0.28 * 0.4, post * 0 + cy, Z1 - 3]);
      }
      str([cx, cy, hz + (v.hat ? 20 : 7) * s], [cx, cy, Z1 - 3]); a.circ(cx, cy, 8 * s, 'EQUIP-DETAIL'); a.log('Added the base, post, control bars, strings and the jointed figure (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ games, music and ride-ons
function keys(a, x0, x1, y0, y1, z, nW, kh) {
  const w = (x1 - x0) / nW, bw = w * 0.58;
  for (let i = 0; i < nW; i++) { a.box(x0 + i * w + 0.4, y0, z, x0 + (i + 1) * w - 0.4, y1, z + kh); a.line(x0 + i * w, y0, x0 + i * w, y1, 'EQUIP-DETAIL'); }
  for (let i = 0; i < nW - 1; i++) if ([0, 1, 3, 4, 5].includes(i % 7)) a.box(x0 + (i + 1) * w - bw / 2, y0 + (y1 - y0) * 0.38, z + kh, x0 + (i + 1) * w + bw / 2, y1, z + kh * 1.75);
}
function bagq(a, x, y0, y1, zf, zb, sl, wd, th) { prismX(a, [[y0, zf + 1], [y1, zb + 1], [y1, zb + 1 + th], [y0, zf + 1 + th]], x - wd / 2, x + wd / 2); }
const games = [
  fam({ cat: 'toys/games', title: 'Generic toy pinball table',
    desc: (v) => `Pinball table, ${v.l} in long${v.legs ? ' on four tubular legs' : ' for a tabletop'}: a cabinet with two side rails, a sloping playfield under a glass pane, three round bumpers, two flippers with a post each, an outlane rail, a ball and plunger, a front lock bar and a tall back box with a display panel.`,
    vs: [['tabletop, 20 in', 12, 20, 9, 0, { l: 20, legs: false }], ['child size on legs, 36 in', 16, 36, 30, 0, { l: 36, legs: true }], ['full size, 56 in', 22, 56, 40, 0, { l: 56, legs: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, y = (f) => YF + f * D, lh = v.legs ? H * 0.55 : 0, zf = Z0 + lh + H * 0.2 * (v.legs ? 1.2 : 1), zb = zf + H * (v.legs ? 0.12 : 0.2), gh = H * 0.14, sw = 12, zp = (yy) => zf + (zb - zf) * (yy - YF) / (y(0.78) - YF);
      a.outline();
      for (const s of [-1, 1]) prismX(a, [[YF, Z0 + lh], [y(0.78), Z0 + lh], [y(0.78), zb + gh], [YF, zf + gh]], s < 0 ? X0 : X1 - sw, s < 0 ? X0 + sw : X1);
      a.box(X0 + sw, YF, Z0 + lh, X1 - sw, y(0.78), Z0 + lh + 6); prismX(a, [[YF, zf - 5], [y(0.78), zb - 5], [y(0.78), zb], [YF, zf]], X0 + sw, X1 - sw);
      prismX(a, [[YF + 2, zf + gh], [y(0.78), zb + gh], [y(0.78), zb + gh + 2], [YF + 2, zf + gh + 2]], X0 + sw, X1 - sw); a.box(X0 + sw, YF, zf - 5, X1 - sw, YF + 4, zf + gh * 0.5);
      const br = W * 0.06, pf = (xx, f, h) => { const yy = y(f); a.cyl(xx, yy, zp(yy), zp(yy) + h, br, 14); a.cyl(xx, yy, zp(yy) + h, zp(yy) + h + 1.5, br * 1.15, 14); a.circ(xx, yy, br); };
      pf(cx - W * 0.16, 0.5, H * 0.05); pf(cx + W * 0.16, 0.5, H * 0.05); pf(cx, 0.64, H * 0.05);
      for (const s of [-1, 1]) { const fy = y(0.2), fx = cx + s * W * 0.12; a.prism([[fx - s * W * 0.02, fy], [fx + s * W * 0.2 * -1 * -1, fy - 6], [fx + s * W * 0.2, fy + 0], [fx - s * W * 0.02, fy + 6]].map(([px, py]) => [px, py]).reverse(), zp(fy), zp(fy) + 5); a.cyl(fx - s * W * 0.02, fy, zp(fy), zp(fy) + 8, 3, 8); a.prism([[X0 + sw, y(0.26)], [cx + s * W * 0.3 * 0 + (s < 0 ? X0 + sw + W * 0.1 : X1 - sw - W * 0.1), y(0.22)], [s < 0 ? X0 + sw + W * 0.1 : X1 - sw - W * 0.1, y(0.3)]].map(([px, py]) => [px, py]), zp(y(0.25)), zp(y(0.25)) + 4); }
      for (const s of [-1, 1]) a.box(s < 0 ? X0 + sw + 3 : X1 - sw - 6, y(0.32), zp(y(0.32)), s < 0 ? X0 + sw + 6 : X1 - sw - 3, y(0.74), zp(y(0.74)) + 4);
      sph(a, cx, y(0.35), zp(y(0.35)) + 8, 6, 10, 6); a.ycyl(YF - 0.01 + 0, YF + D * 0.12, X1 - sw - W * 0.07, zp(YF + 20) + 4, 3, 8); a.box(cx - W * 0.2, YF, zf - H * 0.12, cx + W * 0.2, YF + 4, zf - 4);
      const bb = zb + gh; a.box(X0 + 2, y(0.78), Z0 + lh, X1 - 2, YB, Z1); a.frame(X0 + W * 0.1, bb + (Z1 - bb) * 0.15, X1 - W * 0.1, Z1 - (Z1 - bb) * 0.12, y(0.78) - 1.2, y(0.78) + 1, 3);
      if (v.legs) for (const x of [X0 + 8, X1 - 8]) for (const yy of [YF + 8, YB - 8]) a.tube([[x, yy, Z0], [x, yy, Z0 + lh]], [3, 3.4], 8);
      a.line(X0 + sw, y(0.78), X1 - sw, y(0.78), 'EQUIP-DETAIL'); a.log('Added the cabinet, sloping playfield with glass, bumpers, flippers, rails, ball, plunger, lock bar and back box' + (v.legs ? ' on legs' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic toy kite on stand',
    desc: (v) => ({ diamond: `Display kite on a floor stand: a diamond sail on a vertical and a cross spar with edge cords, ${v.bows} bows on a waving tail, a round base with a post and a cradle at the bottom point, leaning back slightly.`, delta: 'Display kite on a floor stand: a triangular delta sail on a centre spar and two leading-edge spars, a keel line, a round base with a post and a cradle, leaning back slightly.', box: 'Display box kite on a floor stand: two open square cells joined by four corner spars, a round base with a post and a cradle, leaning back.' })[v.kind],
    vs: [['diamond, 16 in', 16, 12, 42, 0, { kind: 'diamond', bows: 5, tail: 14 }], ['diamond with long tail, 20 in', 20, 14, 56, 0, { kind: 'diamond', bows: 8, tail: 20 }], ['delta, 30 in', 30, 14, 40, 0, { kind: 'delta' }], ['box kite, 20 in', 14, 20, 46, 0, { kind: 'box' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, th = 14 * PI / 180, ya = YF + D * 0.3, bz = 8, zk = v.kind === 'diamond' ? Z0 + (v.tail + 6) * IN * 0.3 + 40 : v.kind === 'delta' ? Z0 + H * 0.1 : Z0 + H * 0.05;
      a.cyl(cx, ya, Z0, Z0 + bz, m.min(W, D) * 0.4, 24); a.circ(cx, ya, m.min(W, D) * 0.4); a.cyl(cx, ya, Z0 + bz, zk - 6, 3, 8);
      const P = (x, h) => [cx + x, ya + h * m.sin(th), zk + h * m.cos(th)], cord = (p, q, r = 1.1) => a.tube([p, q], [r, r], 5);
      a.tube([[cx - 12, ya, zk - 10], [cx, ya + 2, zk - 3], [cx + 12, ya, zk - 10]], [2, 2, 2], 6);
      if (v.kind === 'diamond') {
        const w = W * 0.92, hK = (Z1 - zk - 4) / m.cos(th), B = P(0, 0), L = P(-w / 2, hK * 0.28), T = P(0, hK), R = P(w / 2, hK * 0.28), C = P(0, hK * 0.28);
        quad(a, B, L, C, C); quad(a, B, L, T, R); cord(B, T, 1.4); cord(L, R, 1.4); for (const [p, q] of [[B, L], [L, T], [T, R], [R, B]]) cord(p, q); a.line(cx - w / 2, ya, cx + w / 2, ya + 3, 'EQUIP-DETAIL');
        const tl = zk - Z0 - bz - 4, pts = []; for (let i = 0; i <= 12; i++) pts.push([cx + m.sin(i * 0.9) * W * 0.1, ya + 4 + (i % 2) * 2, zk - 2 - tl * i / 12]); a.tube(pts, pts.map(() => 0.9), 4);
        for (let i = 1; i <= v.bows; i++) { const p = pts[m.round(i * 12 / (v.bows + 0.5))]; quad(a, p, [p[0] - 9, p[1], p[2] - 6], [p[0] - 9, p[1], p[2] + 6], p); quad(a, p, [p[0] + 9, p[1], p[2] - 6], [p[0] + 9, p[1], p[2] + 6], p); }
      }
      if (v.kind === 'delta') {
        const w = W * 0.92, hK = (Z1 - zk - 4) / m.cos(th), A = P(0, hK), L = P(-w / 2, 0), R = P(w / 2, 0), K = P(0, hK * 0.25);
        quad(a, A, L, K, K); quad(a, A, R, K, K); cord(A, P(0, 0), 1.4); cord(A, L, 1.4); cord(A, R, 1.4); cord(L, R); cord(K, P(0, -4), 0.8); cord(L, K, 0.8); cord(R, K, 0.8); for (let i = 1; i < 6; i++) { const p = P(0, -i * 2 - 4); }
        const pts = []; for (let i = 0; i <= 8; i++) pts.push([cx + m.sin(i * 1.1) * W * 0.08, ya + 6, zk - 4 - (zk - Z0 - bz - 6) * i / 8]); a.tube(pts, pts.map(() => 0.9), 4); for (const i of [2, 4, 6]) { const p = pts[i]; quad(a, p, [p[0] - 8, p[1], p[2] - 5], [p[0] - 8, p[1], p[2] + 5], p); quad(a, p, [p[0] + 8, p[1], p[2] - 5], [p[0] + 8, p[1], p[2] + 5], p); }
      }
      if (v.kind === 'box') {
        const s = W * 0.4, Q = (h, sx, sn) => [cx + sx * s / 2, ya + h * m.sin(th) + sn * (s / 2) * m.cos(th), zk + h * m.cos(th) - sn * (s / 2) * m.sin(th)], bl = (Z1 - zk - 6) / m.cos(th), cl = bl * 0.32;
        for (const [h0, h1] of [[0, cl], [bl - cl, bl]]) for (const [[a0, b0], [a1, b1]] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) { quad(a, Q(h0, a0, b0), Q(h0, a1, b1), Q(h1, a1, b1), Q(h1, a0, b0)); }
        for (const [sx, sn] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) cord(Q(0, sx, sn), Q(bl, sx, sn), 1.4); for (const h of [0, cl, bl - cl, bl]) for (const [[a0, b0], [a1, b1]] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) cord(Q(h, a0, b0), Q(h, a1, b1), 0.8);
      }
      a.circ(cx, ya, m.min(W, D) * 0.4, 'EQUIP'); a.outline('EQUIP-HIDDEN'); a.log('Added the base, post and cradle, the ' + v.kind + ' sail with spars and edge cords' + (v.kind === 'box' ? ' and corner spars' : ' and a bowed tail') + ' (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic prize wheel game',
    desc: (v) => `Spinning prize wheel, ${v.dia} in across: a round wheel face with ${v.seg} raised segment dividers, a ring of ${v.seg * 2} rim pegs, a centre hub with cap, a flexible pointer at the top and ${v.stand}.`,
    vs: [['tabletop, 12 in', 12, 5, 14, 0, { dia: 12, seg: 8, stand: 'a short post on a round foot' }], ['floor stand, 24 in', 24, 9, 40, 0, { dia: 24, seg: 12, stand: 'a tall post on two splayed feet' }], ['large floor stand, 36 in', 36, 12, 56, 0, { dia: 36, seg: 16, stand: 'a tall post on two splayed feet with a cross brace' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = W * 0.46, wz = Z1 - R - H * 0.05, tab = H < 20; a.outline('EQUIP-HIDDEN');
      if (tab) { a.cyl(cx, cy, Z0, Z0 + 6, D * 0.45, 20); a.cyl(cx, cy, Z0 + 6, wz, 3, 8); } else { for (const s of [-1, 1]) { a.tube([[cx, cy, Z0 + H * 0.3], [cx + s * W * 0.32, cy, Z0 + 3]], [3, 3.4], 8); a.box(cx + s * W * 0.32 - 8, YF + 2, Z0, cx + s * W * 0.32 + 8, YB - 2, Z0 + 4); } a.cyl(cx, cy, Z0 + H * 0.28, wz, 3.4, 8); if (H > 50) a.tube([[cx - W * 0.2, cy, Z0 + H * 0.08], [cx + W * 0.2, cy, Z0 + H * 0.08]], [2, 2], 6); }
      a.ycyl(cy - 4, cy + 4, cx, wz, R, 40); a.cyl(cx, cy, Z0 + 0, Z0 + 0.01, 0.1, 3);
      for (let i = 0; i < v.seg; i++) { const t = (2 * PI * i) / v.seg; prismY(a, [[cx + 6 * m.cos(t) - 1.2 * m.sin(t), wz + 6 * m.sin(t) + 1.2 * m.cos(t)], [cx + R * 0.93 * m.cos(t) - 1.2 * m.sin(t), wz + R * 0.93 * m.sin(t) + 1.2 * m.cos(t)], [cx + R * 0.93 * m.cos(t) + 1.2 * m.sin(t), wz + R * 0.93 * m.sin(t) - 1.2 * m.cos(t)], [cx + 6 * m.cos(t) + 1.2 * m.sin(t), wz + 6 * m.sin(t) - 1.2 * m.cos(t)]], cy - 7, cy - 4); }
      for (let i = 0; i < v.seg * 2; i++) { const t = (2 * PI * (i + 0.5)) / (v.seg * 2); a.ycyl(cy - 8, cy - 3, cx + (R - 2) * m.cos(t), wz + (R - 2) * m.sin(t), 1.4, 6); }
      xzring(a, cx, cy - 7, wz, R * 0.95, 1.4, 28, 4); a.ycyl(cy - 12, cy - 4, cx, wz, R * 0.09, 14); a.ycyl(cy - 13, cy - 12, cx, wz, R * 0.06, 12); a.ycyl(cy + 4, cy + 10, cx, wz, R * 0.07, 10);
      prismX(a, [[cy - 10, wz + R + 1], [cy - 4, wz + R + 1], [cy - 7, wz + R * 0.8]], cx - 2, cx + 2); a.box(cx - 5, cy - 12, wz + R, cx + 5, cy - 4, wz + R + 4); a.circ(cx, cy, 5, 'EQUIP-DETAIL'); a.log('Added the wheel face with dividers and rim pegs, hub, pointer and the stand (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic toddler trampoline',
    desc: (v) => `Round toddler trampoline, ${v.dia} in across: a tubular ring frame, a jumping mat inside a ring of ${v.sp} springs, six splayed legs with feet, a T-bar handle on two posts${v.net ? ' and an enclosure net on eight poles between two rings' : ''}.`,
    vs: [['mini with handle, 36 in', 36, 38, 38, 0, { dia: 36, sp: 24, net: false, leg: 10 }], ['rebounder with handle, 40 in', 40, 44, 42, 0, { dia: 40, sp: 32, net: false, leg: 12 }], ['with safety net, 60 in', 60, 60, 66, 0, { dia: 60, sp: 40, net: true, leg: 14 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = m.min(W, D) * 0.46 * (v.net ? 1 : 0.95), zr = Z0 + v.leg * IN * 0.9 + 6, rr = m.max(W * 0.012, 2.4);
      a.outline('EQUIP-HIDDEN'); ring(a, cx, cy, zr, R, rr, 32, 6); a.cyl(cx, cy, zr - 2, zr, R - 22, 28); ring(a, cx, cy, zr - 1, R - 22, 1.2, 28, 4);
      for (let i = 0; i < v.sp; i++) { const t = (2 * PI * i) / v.sp; a.tube([[cx + (R - 2) * m.cos(t), cy + (R - 2) * m.sin(t), zr - 1], [cx + (R - 22) * m.cos(t), cy + (R - 22) * m.sin(t), zr - 1]], [1.1, 1.1], 4); }
      for (let i = 0; i < 6; i++) { const t = (2 * PI * i) / 6 + PI / 6, lx = cx + R * m.cos(t), ly = cy + R * m.sin(t), fx = cx + (R + 10) * m.cos(t), fy = cy + (R + 10) * m.sin(t); a.tube([[lx, ly, zr], [fx, fy, Z0 + 3]], [rr * 0.9, rr * 0.9], 6); a.box(fx - 5, fy - 5, Z0, fx + 5, fy + 5, Z0 + 3); a.circ(fx, fy, 5, 'EQUIP-DETAIL'); }
      if (!v.net) { const hy = cy + R * 0.98, hx = R * 0.5, ht = Z1 - 3; for (const s of [-1, 1]) a.tube([[cx + s * hx, hy - (R - m.sqrt(R * R - hx * hx)) * 0 - R * 0.02, zr], [cx + s * hx, hy - R * 0.08, ht]], [rr * 0.8, rr * 0.8], 6); a.tube([[cx - hx, hy - R * 0.08, ht], [cx + hx, hy - R * 0.08, ht]], [rr * 0.9, rr * 0.9], 6); for (const s of [-1, 1]) a.cyl(cx + s * hx * 0.8, hy - R * 0.08, ht - 1, ht + 3, rr * 1.4, 8); }
      else { for (let i = 0; i < 8; i++) { const t = (2 * PI * i) / 8, px = cx + R * m.cos(t), py = cy + R * m.sin(t); a.tube([[px, py, zr], [px, py, Z1 - 4]], [rr * 0.7, rr * 0.7], 6); a.tube([[px, py, Z1 - 4], [px, py, Z1 - 2]], [rr * 1.1, rr * 1.1], 8); } ring(a, cx, cy, Z1 - 4, R, rr * 0.6, 32, 5); ring(a, cx, cy, zr + (Z1 - zr) * 0.5, R, rr * 0.3, 32, 4); for (let i = 0; i < 32; i++) { const t = (2 * PI * (i + 0.5)) / 32; a.tube([[cx + R * m.cos(t), cy + R * m.sin(t), zr], [cx + R * m.cos(t), cy + R * m.sin(t), Z1 - 4]], [0.4, 0.4], 3); } }
      a.circ(cx, cy, R); a.circ(cx, cy, R - 22, 'EQUIP-DETAIL'); a.log('Added the ring frame, mat, springs, legs with feet' + (v.net ? ', the net poles and netting' : ' and the T-bar handle') + ' (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic pedal go-kart for children',
    desc: (v) => `Pedal go-kart, ${v.len} in long: a tubular frame with side rails and cross tubes, a floor pan, a bucket seat with side bolsters, a steering column with a ring wheel, two pedals, a front bumper loop, a rear axle with a chain guard and four wheels${v.hoop ? ', and a roll hoop behind the seat' : ''}.`,
    vs: [['child, 40 in', 22, 40, 18, 0, { len: 40 }], ['junior, 48 in', 26, 48, 20, 0, { len: 48 }], ['with roll hoop, 54 in', 28, 54, 32, 0, { len: 54, hoop: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, y = (f) => YF + f * D, zh = v.hoop ? 0.55 : 1, Rr = H * 0.26 * (v.hoop ? 1.7 : 1) * 0.86, Rf = Rr * 0.9, fz = Z0 + Rr * 1.15, ww = W * 0.17; a.outline('EQUIP-HIDDEN');
      for (const s of [-1, 1]) a.tube([[cx + s * W * 0.28, y(0.05), fz], [cx + s * W * 0.28, y(0.2), fz + 2], [cx + s * W * 0.28, y(0.98), fz + 2]], [2.4, 2.4, 2.4], 6);
      for (const f of [0.1, 0.4, 0.6, 0.9]) a.tube([[cx - W * 0.28, y(f), fz + 2], [cx + W * 0.28, y(f), fz + 2]], [2, 2], 6); a.box(cx - W * 0.28, y(0.12), fz + 4, cx + W * 0.28, y(0.62), fz + 6);
      a.tube([[cx - W * 0.28, y(0.05), fz], [cx - W * 0.2, YF + 2, fz], [cx + W * 0.2, YF + 2, fz], [cx + W * 0.28, y(0.05), fz]], [2, 2, 2, 2], 6);
      const sy0 = y(0.6), sy1 = y(0.84), sz = fz + 6; a.box(cx - W * 0.2, sy0, sz, cx + W * 0.2, sy1, sz + 4); prismX(a, [[sy1 - 6, sz + 4], [sy1, sz + 4], [sy1 + 2, sz + H * 0.4 * zh + 6], [sy1 - 4, sz + H * 0.4 * zh + 6]], cx - W * 0.2, cx + W * 0.2); for (const s of [-1, 1]) prismX(a, [[sy0, sz + 4], [sy1, sz + 4], [sy1 + 2, sz + H * 0.32 * zh + 6], [sy1, sz + 14 + 0]], s < 0 ? cx - W * 0.22 : cx + W * 0.18, s < 0 ? cx - W * 0.18 : cx + W * 0.22);
      a.tube([[cx, y(0.2), fz + 8], [cx, y(0.34), fz + H * 0.4 * zh + 2]], [1.8, 1.8], 6); xzring(a, cx, y(0.34), fz + H * 0.4 * zh + 5, W * 0.14, 1.8, 14, 5); a.line(cx - W * 0.14, y(0.34), cx + W * 0.14, y(0.34), 'EQUIP-DETAIL');
      for (const s of [-1, 1]) a.box(cx + s * W * 0.1 - 5, y(0.14), fz + 6, cx + s * W * 0.1 + 5, y(0.22), fz + 10);
      for (const s of [-1, 1]) { tw(a, cx + s * (W / 2 - ww / 2), y(0.84), Rr, ww); tw(a, cx + s * (W / 2 - ww / 2), y(0.12), Rf, ww * 0.8); a.tube([[cx + s * W * 0.28, y(0.12), fz], [cx + s * (W / 2 - ww), y(0.12), Z0 + Rf]], [2, 2], 6); }
      a.xcyl(cx - W * 0.4, cx + W * 0.4, y(0.84), Z0 + Rr, 2.4, 8); a.box(cx + W * 0.28, y(0.78), fz + 2, cx + W * 0.4, y(0.9), fz + 12); a.circ(cx + W * 0.34, y(0.84), 6, 'EQUIP-DETAIL');
      if (v.hoop) { for (const s of [-1, 1]) a.tube([[cx + s * W * 0.28, y(0.86), fz + 2], [cx + s * W * 0.28, y(0.88), Z1 - 3]], [2.2, 2.2], 6); a.tube([[cx - W * 0.28, y(0.88), Z1 - 3], [cx + W * 0.28, y(0.88), Z1 - 3]], [2.2, 2.2], 6); a.tube([[cx - W * 0.28, y(0.88), Z1 - 3], [cx - W * 0.28, y(0.97), fz + 4]], [1.6, 1.6], 5); a.tube([[cx + W * 0.28, y(0.88), Z1 - 3], [cx + W * 0.28, y(0.97), fz + 4]], [1.6, 1.6], 5); }
      a.rect(cx - W * 0.28, y(0.02), cx + W * 0.28, y(0.98), 'EQUIP-DETAIL'); a.log('Added the tube frame, floor pan, bucket seat, steering column and wheel, pedals, bumper, axle and four wheels' + (v.hoop ? ' and the roll hoop' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic spring rider',
    desc: (v) => ({ horse: 'Spring rider: a flat base plate, two coiled springs and a seated horse body with a neck, head, ears, mane strip, saddle, two grip handles, a tail and two footrests.', duck: 'Spring rider: a flat base plate, two coiled springs and a duck body with a long neck and head, a flat bill, two wing shapes, a tail, two grip handles on the neck and two footrests.', car: 'Spring rider: a flat base plate, two coiled springs and a small car body with a bonnet, a windscreen, a seat, a steering wheel, lamps and two footrests.' })[v.kind],
    vs: [['horse, 26 in', 12, 26, 28, 0, { kind: 'horse' }], ['duck, 24 in', 12, 24, 26, 0, { kind: 'duck' }], ['car-style, 28 in', 14, 28, 24, 0, { kind: 'car' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, y = (f) => YF + f * D, bt = 5, sz0 = Z0 + bt, sz1 = Z0 + H * 0.34; a.outline('EQUIP-HIDDEN'); a.box(cx - W * 0.4, y(0.1), Z0, cx + W * 0.4, y(0.92), Z0 + bt);
      for (const f of [0.3, 0.68]) helix(a, cx, y(f), sz0, sz1, W * 0.1, 1.5, 6, 10); for (const s of [-1, 1]) a.box(cx + s * W * 0.36 - 5, y(0.4), Z0 + bt, cx + s * W * 0.36 + 5, y(0.7), Z0 + bt + 12);
      const bz = Z0 + H * 0.5;
      if (v.kind === 'horse') {
        a.ell(cx, y(0.52), bz, W * 0.22, D * 0.3, H * 0.12, 14, 8); a.tube([[cx, y(0.3), bz + H * 0.04], [cx, y(0.18), Z0 + H * 0.78]], [W * 0.14, W * 0.1], 10); a.ell(cx, y(0.12), Z0 + H * 0.84, W * 0.11, D * 0.08, H * 0.09, 10, 6); for (const s of [-1, 1]) { a.cone(cx + s * W * 0.05, y(0.15), Z0 + H * 0.9, Z0 + H * 0.97, W * 0.03, 0.5, 6); a.tube([[cx + s * W * 0.3, y(0.22), Z0 + H * 0.78], [cx + s * W * 0.3, y(0.18), Z0 + H * 0.82]], [1.6, 1.6], 6); sph(a, cx + s * W * 0.3, y(0.22), Z0 + H * 0.78, 3, 6, 4); } a.tube([[cx - W * 0.3, y(0.2), Z0 + H * 0.8], [cx + W * 0.3, y(0.2), Z0 + H * 0.8]], [1.6, 1.6], 5);
        a.box(cx - 1.5, y(0.2), Z0 + H * 0.84, cx + 1.5, y(0.34), Z0 + H * 0.88); a.box(cx - W * 0.16, y(0.46), bz + H * 0.11, cx + W * 0.16, y(0.62), bz + H * 0.15); a.tube([[cx, y(0.8), bz + H * 0.04], [cx, y(0.96), bz - H * 0.1], [cx, YB - 1, Z0 + H * 0.28]], [W * 0.05, W * 0.06, W * 0.015], 8);
        for (const s of [-1, 1]) a.tube([[cx + s * W * 0.2, y(0.4), bz - H * 0.05], [cx + s * W * 0.3, y(0.4), Z0 + H * 0.3]], [1.6, 1.6], 5);
      } else if (v.kind === 'duck') {
        a.ell(cx, y(0.58), bz, W * 0.3, D * 0.3, H * 0.15, 14, 8); a.tube([[cx, y(0.34), bz + H * 0.06], [cx, y(0.22), Z0 + H * 0.78], [cx, y(0.16), Z0 + H * 0.88]], [W * 0.1, W * 0.07, W * 0.06], 10); sph(a, cx, y(0.14), Z0 + H * 0.9, W * 0.12, 10, 6); a.ell(cx, y(0.05), Z0 + H * 0.86, W * 0.09, D * 0.06, H * 0.02, 10, 5); for (const s of [-1, 1]) { sph(a, cx + s * W * 0.07, y(0.1), Z0 + H * 0.94, 1.8, 6, 4); a.ell(cx + s * W * 0.31, y(0.6), bz + H * 0.02, W * 0.05, D * 0.16, H * 0.07, 8, 5); a.tube([[cx + s * W * 0.22, y(0.3), Z0 + H * 0.76], [cx + s * W * 0.32, y(0.3), Z0 + H * 0.78]], [1.6, 1.6], 5); } prismX(a, [[y(0.82), bz + H * 0.05], [y(0.98), bz + H * 0.16], [y(0.85), bz - H * 0.02]], cx - 2, cx + 2);
      } else {
        const bw = W * 0.4; prismX(a, [[y(0.05), bz - H * 0.12], [y(0.95), bz - H * 0.12], [y(0.95), bz + H * 0.08], [y(0.45), bz + H * 0.08], [y(0.05), bz]], cx - bw, cx + bw); a.box(cx - bw * 0.8, y(0.52), bz + H * 0.08, cx + bw * 0.8, y(0.84), bz + H * 0.2); pane(a, [y(0.36), bz + H * 0.08], [y(0.4), bz + H * 0.3], 0.5, cx - bw * 0.7, cx + bw * 0.7, 2); a.tube([[cx, y(0.4), bz + H * 0.1], [cx, y(0.44), bz + H * 0.18]], [1.6, 1.6], 5); xzring(a, cx, y(0.44), bz + H * 0.22, W * 0.12, 1.6, 12, 5); for (const s of [-1, 1]) sph(a, cx + s * bw * 0.7, y(0.06), bz - H * 0.02, W * 0.05, 8, 5); a.box(cx - bw, y(0.9), bz + H * 0.08, cx + bw, y(0.95), bz + H * 0.14);
      }
      a.ellp(cx, y(0.52), W * 0.25, D * 0.3, 'EQUIP-DETAIL'); a.log('Added the base plate, springs, footrests and the ' + v.kind + ' body with its details (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic push walker',
    desc: (v) => ({ cart: `Push walker for a toddler: a box bed with four walls on four wheels, a tubular handle with a cross grip${v.blocks ? ' and three lettered blocks in the bed' : ''}.`, sit: 'Sit-in baby walker: a round base ring with four casters, four tilted posts to a ring tray with three activity blocks and a seat sling in the middle.' })[v.kind],
    vs: [['push wagon, 16 in', 11, 16, 20, 0, { kind: 'cart' }], ['push wagon with blocks, 20 in', 12, 20, 24, 0, { kind: 'cart', blocks: true }], ['sit-in, 26 in', 26, 26, 20, 0, { kind: 'sit' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, y = (f) => YF + f * D; a.outline('EQUIP-HIDDEN');
      if (v.kind === 'cart') {
        const R = H * 0.1, bz = Z0 + R * 2, bh = H * 0.24, bw = W * 0.4, y0 = y(0.04), y1 = y(0.8); a.box(cx - bw, y0, bz, cx + bw, y1, bz + 5); for (const s of [-1, 1]) a.box(cx + s * bw - (s > 0 ? 4 : 0), y0, bz, cx + s * bw + (s > 0 ? 0 : 4), y1, bz + bh); a.box(cx - bw, y0, bz, cx + bw, y0 + 4, bz + bh); a.box(cx - bw, y1 - 4, bz, cx + bw, y1, bz + bh);
        for (const f of [0.18, 0.66]) for (const s of [-1, 1]) { a.xcyl(cx - bw - 2, cx + bw + 2, y(f), Z0 + R, 1.6, 6); tw(a, cx + s * (bw + 3), y(f), R, 6); }
        for (const s of [-1, 1]) a.tube([[cx + s * bw * 0.8, y1 - 2, bz + bh * 0.8], [cx + s * bw * 0.8, y(0.96), Z1 - 8]], [2, 2], 6); a.tube([[cx - bw * 0.8, y(0.96), Z1 - 6], [cx + bw * 0.8, y(0.96), Z1 - 6]], [2.6, 2.6], 8); a.tube([[cx - bw * 0.8, y(0.96), Z1 - 8], [cx - bw * 0.8, y(0.96), Z1 - 4]], [2.8, 2.8], 6);
        if (v.blocks) for (let i = 0; i < 3; i++) { const bx = cx - bw * 0.55 + i * bw * 0.55, bs = bw * 0.42; a.box(bx - bs / 2, y(0.22), bz + 5, bx + bs / 2, y(0.22) + bs, bz + 5 + bs); a.frame(bx - bs * 0.35, bz + 5 + bs * 0.15, bx + bs * 0.35, bz + 5 + bs * 0.85, y(0.22) - 0.8, y(0.22) + 0.4, 1.4); }
        a.rect(cx - bw, y0, cx + bw, y1); a.line(cx - bw * 0.8, y(0.96), cx + bw * 0.8, y(0.96), 'EQUIP-DETAIL');
      } else {
        const R = W * 0.46, bz = Z0 + 14, tz = Z1 - 8; ring(a, cx, cy, Z0 + 12, R, 3, 28, 6);
        for (let i = 0; i < 4; i++) { const t = (2 * PI * i) / 4 + PI / 4, bx = cx + R * m.cos(t), by = cy + R * m.sin(t), tx = cx + R * 0.62 * m.cos(t), ty = cy + R * 0.62 * m.sin(t); a.cyl(bx, by, Z0 + 4, Z0 + 12, 4.6, 8); a.cyl(bx, by, Z0, Z0 + 4, 6, 8); a.tube([[bx, by, Z0 + 12], [tx, ty, tz]], [2.6, 2.6], 6); a.circ(bx, by, 6, 'EQUIP-DETAIL'); }
        lathe(a, cx, cy, tz, [[R * 0.45, 0], [R * 0.72, 0], [R * 0.72, 8], [R * 0.45, 8], [R * 0.45, 0]], 28, false);
        a.ell(cx, cy, Z0 + H * 0.42, R * 0.36, R * 0.36, H * 0.12, 14, 6); for (const [dx, dy, k] of [[-0.6, 0.1, 0], [0.55, 0.3, 1], [0.1, -0.62, 2]]) { const px = cx + dx * R * 0.68, py = cy + dy * R * 0.68; if (k === 0) a.box(px - 8, py - 8, tz + 8, px + 8, py + 8, tz + 24); else if (k === 1) a.cyl(px, py, tz + 8, tz + 22, 8, 12); else sph(a, px, py, tz + 17, 9, 10, 6); }
        a.circ(cx, cy, R); a.circ(cx, cy, R * 0.72, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.45, 'EQUIP-DETAIL');
      }
      a.log('Added the ' + (v.kind === 'cart' ? 'bed, wheels, handle' + (v.blocks ? ' and blocks' : '') : 'base ring, casters, posts, ring tray, seat sling and blocks') + ' (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic toy piano',
    desc: (v) => ({ kb: `Toy keyboard, ${v.nw} white keys with black keys, on a wedge case with a control panel of four knobs and a speaker grille and two feet.`, stand: `Toy keyboard on a stand: ${v.nw} white keys with black keys on a wedge case, a control panel of four knobs and a grille, and a crossed-leg stand with a stretcher bar.`, upright: `Toy upright piano: a case with a top lid, a slanted music desk, ${v.nw} white keys with black keys on a key slip, a lower panel with two pedals and four feet.`, grand: `Toy grand piano: a curved case with a propped lid and prop stick, ${v.nw} white keys with black keys at the front, a music desk, three round legs and a pedal lyre.` })[v.kind],
    vs: [['keyboard, 16 in', 16, 6, 3.5, 0, { kind: 'kb', nw: 15 }], ['keyboard on stand, 28 in', 28, 10, 30, 0, { kind: 'stand', nw: 22 }], ['upright, 20 in', 20, 10, 22, 0, { kind: 'upright', nw: 15 }], ['grand, 24 in', 24, 28, 20, 0, { kind: 'grand', nw: 15 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, y = (f) => YF + f * D;
      if (v.kind === 'kb' || v.kind === 'stand') {
        const kz = v.kind === 'stand' ? Z0 + H * 0.8 : Z0 + 6, ch = v.kind === 'stand' ? H * 0.17 : H - 6 - 6; a.outline();
        prismX(a, [[YF, kz], [YB, kz], [YB, kz + ch], [YF + D * 0.45, kz + ch * 0.62], [YF, kz + ch * 0.45]], X0, X1); keys(a, X0 + W * 0.04, X1 - W * 0.4, YF + 2, YF + D * 0.45, kz + ch * 0.45, v.nw, 3);
        for (let i = 0; i < 4; i++) a.ycyl(YF + D * 0.55, YF + D * 0.55 + 3, X1 - W * 0.32 + i * W * 0.07, kz + ch * 0.8, 2.6, 8); for (let i = 0; i < 6; i++) a.box(X1 - W * 0.36 + 2, YF + D * 0.7 + i * 2.6, kz + ch * 0.62, X1 - W * 0.05, YF + D * 0.7 + i * 2.6 + 0.8, kz + ch * 0.7);
        if (v.kind === 'kb') for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 8, YF + 6, Z0, cx + s * W * 0.4 + 8, YB - 6, Z0 + 6);
        else { for (const f of [0.25, 0.75]) { a.tube([[X0 + 24, y(f), kz], [X1 - 24, y(f), Z0 + 4]], [2, 2], 6); a.tube([[X1 - 24, y(f), kz], [X0 + 24, y(f), Z0 + 4]], [2, 2], 6); a.box(X0 + 12, y(f) - 5, Z0, X0 + 36, y(f) + 5, Z0 + 3); a.box(X1 - 36, y(f) - 5, Z0, X1 - 12, y(f) + 5, Z0 + 3); } a.tube([[cx, y(0.25), Z0 + H * 0.4], [cx, y(0.75), Z0 + H * 0.4]], [1.6, 1.6], 5); }
      }
      if (v.kind === 'upright') {
        const ks = Z0 + H * 0.46; a.outline(); a.box(X0, YF + 30, Z0 + 14, X1, YB, Z1 - 8); a.box(X0 - 0, YF + 26, Z1 - 8, X1, YB, Z1); a.box(X0 + 4, YF + 24, Z0 + 14, X1 - 4, YF + 32, ks); a.box(X0, YF, ks - 2, X1, YF + 34, ks + 2); keys(a, X0 + W * 0.06, X1 - W * 0.06, YF + 4, YF + 32, ks + 2, v.nw, 3);
        prismX(a, [[YF + 32, ks + 14], [YF + 38, ks + 14], [YF + 44, ks + 14 + H * 0.2], [YF + 36, ks + 14 + H * 0.2]], X0 + 8, X1 - 8); a.box(X0 + 8, YF + 32, ks + 2, X1 - 8, YF + 36, ks + 14); a.box(X0 + 8, YF + 34, ks + 14, X1 - 8, YF + 38, ks + 17);
        a.box(X0 + 12, YF + 31, Z0 + 18, X1 - 12, YF + 33, ks - 6); for (const s of [-1, 1]) a.box(cx + s * W * 0.12 - 5, YF + 22, Z0 + 4, cx + s * W * 0.12 + 5, YF + 32, Z0 + 10); for (const x of [X0 + 6, X1 - 6]) for (const yy of [YF + 38, YB - 6]) a.cyl(x, yy, Z0, Z0 + 14, 5, 8);
      }
      if (v.kind === 'grand') {
        const zt = Z0 + H * 0.58, th = H * 0.08, poly = [[X0 + 6, y(0.3)], [X1 - 6, y(0.3)], [X1 - 6, y(0.52)], [X1 - W * 0.14, y(0.76)], [cx + W * 0.14, YB - 2], [X0 + W * 0.3, YB - 2], [X0 + 6, y(0.72)]];
        a.prism(poly, zt, zt + th); a.poly(poly); a.box(X0 + W * 0.12, YF + D * 0.1, zt - 4, X1 - W * 0.12, y(0.3), zt + th * 0.5); keys(a, X0 + W * 0.16, X1 - W * 0.16, YF + D * 0.04, y(0.3) - 2, zt + th * 0.5, v.nw, 3);
        a.box(X0 + W * 0.2, y(0.3) + 0, zt + th, X1 - W * 0.2, y(0.33), zt + th + H * 0.12); quad(a, [X0 + 6, y(0.34), zt + th], [X0 + 6, y(0.7), zt + th], [X0 + W * 0.45, y(0.7), Z1 - 2], [X0 + W * 0.45, y(0.34), Z1 - 2]); a.tube([[X0 + W * 0.2, y(0.5), zt + th], [X0 + W * 0.36, y(0.5), Z1 - H * 0.12]], [1.2, 1.2], 5);
        for (const [x, yy] of [[X0 + W * 0.14, y(0.22)], [X1 - W * 0.14, y(0.22)], [cx + W * 0.1, y(0.78)]]) { lathe(a, x, yy, Z0, [[5, 0], [5.5, 4], [3.4, zt - Z0 - 6], [4.4, zt - Z0]], 10); }
        a.box(cx - W * 0.12, y(0.14), Z0 + H * 0.12, cx + W * 0.12, y(0.2), zt - 10); for (const s of [-1, 0, 1]) a.box(cx + s * W * 0.07 - 4, y(0.1), Z0 + 1, cx + s * W * 0.07 + 4, y(0.2), Z0 + 5); a.outline('EQUIP-HIDDEN');
      }
      a.log('Added the case, keys with black keys, ' + (v.kind === 'kb' || v.kind === 'stand' ? 'control panel with knobs and grille' : v.kind === 'upright' ? 'music desk, pedals and feet' : 'propped lid, music desk, legs and pedal lyre') + (v.kind === 'stand' ? ' and the crossed-leg stand' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic toy guitar on stand',
    desc: (v) => v.kind === 'solid' ? 'Toy solid-body guitar on an A-frame stand: a double-cut body with two pickups, a bridge and three knobs, a neck with frets, a headstock with six tuning pegs and six strings.' : `Toy ${v.kind === 'uke' ? 'four-string' : 'six-string'} guitar on an A-frame stand: a figure-eight body with a sound hole ring and a bridge, a neck with frets and a headstock with ${v.kind === 'uke' ? 'four' : 'six'} tuning pegs and strings.`,
    vs: [['ukulele-style, 21 in', 9, 7, 24, 0, { kind: 'uke', ns: 4 }], ['acoustic-style, 30 in', 12, 9, 34, 0, { kind: 'acoustic', ns: 6 }], ['solid-body, 34 in', 13, 9, 38, 0, { kind: 'solid', ns: 6 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, yc = cy + 4, th = D * 0.22, bz0 = Z0 + H * 0.12, L = H * 0.86, nz = bz0 + L * (v.kind === 'uke' ? 0.34 : 0.36), top = Z0 + H * 0.12 + L, rL = W * 0.38, rU = W * 0.28; a.outline('EQUIP-HIDDEN');
      for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.34, cy, Z0 + 3], [cx + s * W * 0.06, cy + D * 0.3, bz0 + L * 0.5]], [1.8, 1.8], 6); a.box(cx + s * W * 0.34 - 8, YF + 2, Z0, cx + s * W * 0.34 + 8, YB - 2, Z0 + 3); } a.tube([[cx - W * 0.34, cy, Z0 + 3], [cx + W * 0.34, cy, Z0 + 3]], [1.6, 1.6], 5); a.tube([[cx - W * 0.2, cy + D * 0.1, bz0 + L * 0.3], [cx + W * 0.2, cy + D * 0.1, bz0 + L * 0.3]], [1.6, 1.6], 5);
      if (v.kind === 'solid') { prismY(a, [[cx - rL, bz0 + L * 0.12], [cx - rL * 0.8, bz0 + L * 0.02], [cx + rL * 0.8, bz0 + L * 0.02], [cx + rL, bz0 + L * 0.12], [cx + rL * 0.7, bz0 + L * 0.22], [cx + rL * 0.55, bz0 + L * 0.34], [cx + rU * 0.7, bz0 + L * 0.4], [cx - rU * 0.7, bz0 + L * 0.4], [cx - rL * 0.55, bz0 + L * 0.34], [cx - rL * 0.7, bz0 + L * 0.22]], yc - th / 2, yc + th / 2); for (const z of [0.2, 0.28]) a.box(cx - rL * 0.5, yc - th / 2 - 1.5, bz0 + L * z, cx + rL * 0.5, yc - th / 2 + 0.2, bz0 + L * z + 4); a.box(cx - rL * 0.45, yc - th / 2 - 1.5, bz0 + L * 0.09, cx + rL * 0.45, yc - th / 2 + 0.2, bz0 + L * 0.11); for (let i = 0; i < 3; i++) a.ycyl(yc - th / 2 - 4, yc - th / 2, cx + rL * 0.5 - i * 8, bz0 + L * 0.14 + (i % 2) * 5 - 6, 2.6, 8); }
      else { a.ell(cx, yc, bz0 + L * 0.17, rL, th / 2, L * 0.17, 16, 9); a.ell(cx, yc, bz0 + L * 0.38, rU, th / 2, L * 0.12, 16, 9); xzring(a, cx, yc - th / 2 - 0.4, bz0 + L * 0.35, rU * 0.5, 1.4, 14, 4); a.box(cx - rL * 0.4, yc - th / 2 - 1.8, bz0 + L * 0.1, cx + rL * 0.4, yc - th / 2 + 0.2, bz0 + L * 0.13); }
      const nw = W * 0.09; a.box(cx - nw, yc - 4, bz0 + L * 0.42, cx + nw, yc + 2, top - L * 0.1); a.box(cx - nw * 0.9, yc - 5.2, bz0 + L * 0.42, cx + nw * 0.9, yc - 4, top - L * 0.1); for (let i = 0; i < 8; i++) a.box(cx - nw * 0.9, yc - 6.2, bz0 + L * 0.44 + i * (L * 0.44) / 8, cx + nw * 0.9, yc - 5.2, bz0 + L * 0.44 + i * (L * 0.44) / 8 + 0.9);
      prismY(a, [[cx - nw * 1.4, top - L * 0.1], [cx + nw * 1.4, top - L * 0.1], [cx + nw * 1.2, top], [cx - nw * 1.2, top]], yc - 4, yc + 2); for (let i = 0; i < v.ns; i++) { const sx = cx + (i - (v.ns - 1) / 2) * nw * 0.45; a.tube([[sx, yc - th / 2 - 1.2, bz0 + L * 0.11], [sx * 0.7 + cx * 0.3, yc - 6, top - L * 0.05]], [0.45, 0.45], 3); const side = i < v.ns / 2 ? -1 : 1, k = v.ns / 2 | 0, j = i % k; a.xcyl(cx + side * nw * 1.4, cx + side * (nw * 1.4 + 6), yc - 1, top - L * 0.03 - j * (L * 0.07 / k) * 1.6, 1.4, 6); }
      a.log('Added the body, neck with frets, headstock with pegs, strings and the A-frame stand (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic ring toss game',
    desc: (v) => v.kind === 'single' ? `Ring toss: a round weighted base, a tapered post with a ball finial and ${v.rings} rings, some on the post and some resting on the base.` : `Ring toss board: a flat wooden base on four feet with ${v.pegs} round-topped pegs of different heights and ${v.rings} rings, some on pegs and some lying on the base.`,
    vs: [['single post, 3 rings, 10 in', 8, 8, 10, 0, { kind: 'single', rings: 3 }], ['five-peg board, 5 rings, 18 in', 18, 12, 10, 0, { kind: 'board', pegs: 5, rings: 5 }], ['seven-peg floor board, 8 rings, 30 in', 30, 18, 14, 0, { kind: 'board', pegs: 7, rings: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
      if (v.kind === 'single') { const R = W * 0.46, rr = R * 0.7; lathe(a, cx, cy, Z0, [[R, 0], [R, 8], [R * 0.7, 18], [R * 0.2, 22]], 24); a.cone(cx, cy, Z0 + 22, Z1 - 10, R * 0.16, R * 0.08, 10); sph(a, cx, cy, Z1 - 6, R * 0.14, 10, 6); for (let i = 0; i < 2; i++) ring(a, cx, cy, Z0 + 26 + i * 14, rr * (1 - 0.0 * i), 3, 20, 6); ring(a, cx + R * 0.1, cy + R * 0.5, Z0 + 20, rr * 0.5, 2.6, 16, 5); a.circ(cx, cy, R); a.circ(cx, cy, rr, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN'); }
      else {
        const bt = 14, np = v.pegs, pr = m.min(W / np * 0.1, 7), pts = []; a.box(X0, YF, Z0 + 5, X1, YB, Z0 + 5 + bt); for (const x of [X0 + 8, X1 - 8]) for (const y of [YF + 8, YB - 8]) a.cyl(x, y, Z0, Z0 + 5, 6, 8); a.rect(X0, YF, X1, YB);
        for (let i = 0; i < np; i++) { const x = X0 + (W * (i + 0.5)) / np, y = YF + D * (i % 2 ? 0.7 : 0.3), h = [H * 0.5, H * 0.65, H * 0.4][i % 3]; a.cone(x, y, Z0 + 5 + bt, Z0 + 5 + bt + h, pr * 1.3, pr * 0.8, 10); sph(a, x, y, Z0 + 5 + bt + h, pr * 0.9, 8, 5); pts.push([x, y, h]); a.circ(x, y, pr * 1.3, 'EQUIP-DETAIL'); }
        for (let i = 0; i < v.rings; i++) { const [x, y, h] = pts[i % np]; if (i < np) ring(a, x, y, Z0 + 5 + bt + h * (0.25 + 0.2 * (i % 2)), pr * 3.2, 2.2, 16, 5); else ring(a, x + W / np * 0.5, y + (i % 2 ? -1 : 1) * D * 0.2, Z0 + 5 + bt + 2.4, pr * 3.2, 2.2, 16, 5); }
      }
      a.log('Added the base, ' + (v.kind === 'single' ? 'tapered post with finial' : 'pegs of different heights') + ' and the rings (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic bean bag toss board',
    desc: (v) => `Bean bag toss board, ${v.l} in long: a sloping board with ${v.holes} square hole${v.holes > 1 ? 's' : ''} built from separate strips, a front rest and two back legs, and three flat bags lying on the surface.`,
    vs: [['one hole, 24 in', 24, 20, 10, 0, { l: 24, holes: 1 }], ['three holes, 36 in', 36, 26, 12, 0, { l: 36, holes: 3 }], ['tabletop, two holes, 30 in', 30, 14, 8, 0, { l: 30, holes: 2 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, zf = Z0 + 5, zb = Z1 - 8, th = 5, Y = (s) => YF + 4 + s * (D - 8), Zs = (s) => zf + s * (zb - zf), hw = W * 0.085, hs = 0.12;
      const hole = v.holes === 1 ? [[cx - hw, cx + hw, 0.45, 0.45 + hs * (v.l > 30 ? 1 : 1)]] : v.holes === 2 ? [[cx - W * 0.2 - hw * 0.8, cx - W * 0.2 + hw * 0.8, 0.5, 0.5 + hs], [cx + W * 0.2 - hw * 0.8, cx + W * 0.2 + hw * 0.8, 0.5, 0.5 + hs]] : [[cx - hw, cx + hw, 0.22, 0.22 + hs], [cx - W * 0.25 - hw, cx - W * 0.25 + hw, 0.55, 0.55 + hs], [cx + W * 0.25 - hw, cx + W * 0.25 + hw, 0.55, 0.55 + hs]];
      const xs = [X0, ...hole.flatMap((h) => [h[0], h[1]]), X1].sort((p, q) => p - q);
      for (let i = 0; i < xs.length - 1; i++) { const x0 = xs[i], x1 = xs[i + 1]; if (x1 - x0 < 0.5) continue; const blocked = hole.filter((h) => h[0] <= x0 + 0.01 && h[1] >= x1 - 0.01).map((h) => [h[2], h[3]]).sort((p, q) => p[0] - q[0]); let s0 = 0; for (const [b0, b1] of [...blocked, [1, 1]]) { if (b0 > s0 + 0.001) prismX(a, [[Y(s0), Zs(s0)], [Y(b0), Zs(b0)], [Y(b0), Zs(b0) + th], [Y(s0), Zs(s0) + th]], x0, x1); s0 = b1; } }
      for (const [x0, x1, s0, s1] of hole) { a.rect(x0, Y(s0), x1, Y(s1), 'EQUIP-DETAIL'); a.line(x0, Y(s0), x1, Y(s0), 'EQUIP'); }
      a.outline('EQUIP-HIDDEN'); a.box(X0, YF, Z0, X1, YF + 6, zf + th); for (const s of [-1, 1]) a.tube([[cx + s * W * 0.4, Y(0.9), Zs(0.9)], [cx + s * W * 0.4, Y(0.98) + 2, Z0 + 1]], [3, 3], 8); a.box(X0, YB - 6, Z0, X1, YB, Z0 + 2);
      for (let i = 0; i < 3; i++) { const bx = cx + (i - 1) * W * 0.28, s0 = 0.62 - (i % 2) * 0.25; bagq(a, bx, Y(s0), Y(s0 + 0.1), Zs(s0), Zs(s0 + 0.1), 0, W * 0.12, 4); a.rect(bx - W * 0.06, Y(s0), bx + W * 0.06, Y(s0 + 0.1), 'EQUIP-DETAIL'); }
      a.log('Added the sloping board built round its ' + v.holes + ' hole' + (v.holes > 1 ? 's' : '') + ', front rest, back legs and bags (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic swinging ball desk toy',
    desc: (v) => `Swinging-ball desk toy: ${v.balls} steel-style balls each hung by two strings from two top rails on four posts, a base, and the end ball lifted out and held up to the side.`,
    vs: [['5 balls, 6 in', 7, 4, 6, 0, { balls: 5 }], ['7 balls, 8 in', 9, 5, 8, 0, { balls: 7 }], ['5 balls on wide base, 10 in', 10, 6, 10, 0, { balls: 5 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bt = 8, pr = 2.6, zt = Z1 - 6, r = m.min(W / (v.balls + 3.2), H * 0.2) * 0.5, L = zt - Z0 - bt - r * 1.1, pitch = r * 2 + 0.4, x0 = cx - (v.balls - 1) / 2 * pitch, dy = D * 0.3;
      a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + bt); for (const x of [X0 + 8, X1 - 8]) for (const y of [cy - dy, cy + dy]) a.cyl(x, y, Z0 + bt, zt, pr, 8);
      for (const y of [cy - dy, cy + dy]) a.tube([[X0 + 8, y, zt], [X1 - 8, y, zt]], [pr * 0.9, pr * 0.9], 8);
      const th = m.min(52 * PI / 180, m.asin(m.min(0.78, (x0 - X0 - r - 3) / L)));
      for (let i = 0; i < v.balls; i++) { const px = x0 + i * pitch; let bx = px, bz = zt - L; if (i === 0) { bx = px - L * m.sin(th); bz = zt - L * m.cos(th); } sph(a, bx, cy, bz, r, 14, 8); for (const y of [cy - dy, cy + dy]) a.tube([[px, y, zt], [bx, cy, bz + r * 0.9]], [0.5, 0.5], 3); a.circ(bx, cy, r, 'EQUIP-DETAIL'); }
      a.rect(X0 + 8, cy - dy, X1 - 8, cy + dy, 'EQUIP-DETAIL'); a.log('Added the base, four posts, two rails and the balls on V strings with one raised (plan and 3D).');
    } }),
];
export default [...blocks, ...vehicles, ...tracks, ...dolls, ...games];

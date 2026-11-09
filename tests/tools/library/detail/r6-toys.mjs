/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, toys: building blocks, toy vehicles, dolls and playsets, games and ride-ons. Original geometry; generic by type and size class. */
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
/** a solid of revolution about a vertical axis at (cx, cy): prof is [[radius, height above z0], …] bottom to top; optional end caps */
function lathe(a, cx, cy, z0, prof, seg = 16, a0 = 0, a1 = 2 * PI, cap = true) {
  const P = (r, z, j) => { const t = a0 + ((a1 - a0) * j) / seg; return [cx + r * m.cos(t), cy + r * m.sin(t), z0 + z]; };
  for (let i = 0; i < prof.length - 1; i++) for (let j = 0; j < seg; j++) {
    const [r0, h0] = prof[i], [r1, h1] = prof[i + 1];
    a.t.push([P(r0, h0, j), P(r0, h0, j + 1), P(r1, h1, j + 1)], [P(r0, h0, j), P(r1, h1, j + 1), P(r1, h1, j)]);
  }
  if (cap) {
    const [rb, hb] = prof[0], [rt, ht] = prof[prof.length - 1];
    for (let j = 0; j < seg; j++) {
      if (rb > 0.01) a.t.push([[cx, cy, z0 + hb], P(rb, hb, j + 1), P(rb, hb, j)]);
      if (rt > 0.01) a.t.push([[cx, cy, z0 + ht], P(rt, ht, j), P(rt, ht, j + 1)]);
    }
  }
  return a;
}
/** a flat horizontal ring (tube loop) */
function ring(a, cx, cy, z, R, r, n = 18, seg = 6) { const pts = []; for (let i = 0; i <= n; i++) { const t = (2 * PI * i) / n; pts.push([cx + R * m.cos(t), cy + R * m.sin(t), z]); } a.tube(pts, pts.map(() => r), seg); }
function sph(a, x, y, z, r, nu = 14, nv = 8) { a.ell(x, y, z, r, r, r, nu, nv); }
function whl(a, x, y, r, w = 20, z = null) { const zc = z ?? a.Z0 + r; a.xcyl(x - w / 2, x + w / 2, y, zc, r, 16); a.xcyl(x - w / 2 - 2, x + w / 2 + 2, y, zc, r * 0.45, 10); a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL'); }
/** a circle standing in the Y-Z plane at x (a tyre or a hoop) */
function vring(a, x, y, z, R, r, n = 16, seg = 6) { const pts = []; for (let i = 0; i <= n; i++) { const t = (2 * PI * i) / n; pts.push([x, y + R * m.cos(t), z + R * m.sin(t)]); } a.tube(pts, pts.map(() => r), seg); }
/** a toy wheel: tyre, rim and hub on a lateral axle */
function tw(a, x, y, R, w, z = null) { const zc = z ?? a.Z0 + R; a.xcyl(x - w / 2, x + w / 2, y, zc, R, 14); a.xcyl(x - w / 2 - 2, x + w / 2 + 2, y, zc, R * 0.55, 10); a.xcyl(x - w / 2 - 4, x + w / 2 + 4, y, zc, R * 0.15, 6); a.rect(x - w / 2, y - R, x + w / 2, y + R, 'EQUIP-DETAIL'); }
/** a thin sloped pane over the segment A->B (y,z) offset outward by off, across x0..x1 */
function pane(a, A, B, off, x0, x1, th = 2) { const dy = B[0] - A[0], dz = B[1] - A[1], L = m.hypot(dy, dz) || 1; let ny = -dz / L, nz = dy / L; if (ny > 0) { ny = -ny; nz = -nz; } prismX(a, [[A[0] + ny * off, A[1] + nz * off], [B[0] + ny * off, B[1] + nz * off], [B[0] + ny * (off + th), B[1] + nz * (off + th)], [A[0] + ny * (off + th), A[1] + nz * (off + th)]], x0, x1); }

// ------------------------------------------------------------------------------------------ blocks
const blocks = [
  fam({ cat: 'toys/blocks', title: 'Generic alphabet block',
    desc: (v) => `Wooden cube, ${v.w} in edge, with a raised border and a raised letter ${v.letter} on the front face, and small raised letters on the top and right faces.`,
    vs: [['letter A, 1.5 in', 1.6, 1.6, 1.6, 0, { letter: 'A' }], ['letter H, 2 in', 2.1, 2.1, 2.1, 0, { letter: 'H' }], ['letter T, 3 in', 3.1, 3.1, 3.1, 0, { letter: 'T' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx } = a, e = a.W * 0.025, s = a.W - 2 * e, x0 = X0 + e, x1 = X1 - e, y0 = YF + e, z0 = Z0 + 0, z1 = Z1 - e;
      a.box(x0, y0, z0, x1, -e, z1); a.rect(x0, y0, x1, -e);
      a.frame(x0 + s * 0.08, z0 + s * 0.08, x1 - s * 0.08, z1 - s * 0.08, YF, y0 + 0.6, s * 0.05);
      const t = s * 0.1, zc = (z0 + z1) / 2, hh = s * 0.55, hw = s * 0.4;
      if (v.letter === 'A') { prismY(a, [[cx - hw / 2 - t * 0.6, zc - hh / 2], [cx - hw / 2 + t * 0.4, zc - hh / 2], [cx + t * 0.5, zc + hh / 2], [cx - t * 0.5, zc + hh / 2]], YF, y0 + 0.6); prismY(a, [[cx + hw / 2 + t * 0.6, zc - hh / 2], [cx + hw / 2 - t * 0.4, zc - hh / 2], [cx - t * 0.5, zc + hh / 2], [cx + t * 0.5, zc + hh / 2]], YF, y0 + 0.6); a.box(cx - hw * 0.28, YF, zc - hh * 0.12, cx + hw * 0.28, y0 + 0.6, zc - hh * 0.12 + t * 0.7); }
      if (v.letter === 'H') { a.box(cx - hw / 2, YF, zc - hh / 2, cx - hw / 2 + t, y0 + 0.6, zc + hh / 2); a.box(cx + hw / 2 - t, YF, zc - hh / 2, cx + hw / 2, y0 + 0.6, zc + hh / 2); a.box(cx - hw / 2, YF, zc - t / 2, cx + hw / 2, y0 + 0.6, zc + t / 2); }
      if (v.letter === 'T') { a.box(cx - hw / 2, YF, zc + hh / 2 - t, cx + hw / 2, y0 + 0.6, zc + hh / 2); a.box(cx - t / 2, YF, zc - hh / 2, cx + t / 2, y0 + 0.6, zc + hh / 2); }
      a.box(cx - s * 0.12, a.cy * 0 + y0 + s * 0.3, z1, cx + s * 0.12, y0 + s * 0.3 + s * 0.3, Z1); a.box(x1, y0 + s * 0.3, zc - s * 0.12, X1, y0 + s * 0.6, zc + s * 0.12);
      a.line(x0, y0, x1, -e); a.log('Added the cube, the raised border and the raised letters on three faces (plan and 3D).');
    } }),
  fam({ cat: 'toys/blocks', title: 'Generic stacking ring tower',
    desc: (v) => `Toddler stacking toy: a round base, a tapered post, ${v.n} rings graded in diameter and thickness and a ball on top.`,
    vs: [['5 rings, 6 in', 6, 6, 7, 0, { n: 5 }], ['7 rings, 8 in', 8, 8, 10, 0, { n: 7 }], ['10 rings, 10 in', 10, 10, 13, 0, { n: 10 }]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W } = a, R = W / 2, bh = 26, post = a.H - 40;
      lathe(a, cx, cy, Z0, [[R, 0], [R, 10], [R * 0.85, bh], [R * 0.3, bh + 4]], 24); a.circ(cx, cy, R);
      a.cone(cx, cy, Z0 + bh, Z0 + bh + post, R * 0.16, R * 0.07, 12); a.circ(cx, cy, R * 0.16, 'EQUIP-DETAIL');
      const rh = (post - 20) / (v.n + 2.2);
      for (let i = 0; i < v.n; i++) { const ro = R * (0.96 - (0.66 * i) / v.n), z = Z0 + bh + 8 + i * rh * 1.0; lathe(a, cx, cy, z, [[R * 0.17, 0], [ro, 0], [ro, rh * 0.9], [R * 0.17, rh * 0.9], [R * 0.17, 0]], 20, 0, 2 * PI, false); a.circ(cx, cy, ro, 'EQUIP-DETAIL'); }
      sph(a, cx, cy, Z1 - R * 0.14, R * 0.14, 12, 8); a.log('Added the base, tapered post, graded rings and the ball (plan and 3D).');
    } }),
  fam({ cat: 'toys/blocks', title: 'Generic interlocking brick',
    desc: (v) => `${v.nx} by ${v.ny} stud interlocking brick (${v.pitch} mm stud pitch): a body with ${v.nx * v.ny} round studs on top and a hollow underside with a rim.`,
    vs: [['standard 2 x 2', 0.64, 0.64, 0.45, 0, { nx: 2, ny: 2, pitch: 8 }], ['standard 2 x 4', 1.26, 0.64, 0.45, 0, { nx: 4, ny: 2, pitch: 8 }], ['standard 2 x 8', 2.52, 0.64, 0.45, 0, { nx: 8, ny: 2, pitch: 8 }], ['large preschool 2 x 4', 2.52, 1.26, 0.9, 0, { nx: 4, ny: 2, pitch: 16 }], ['large preschool 4 x 4', 2.52, 2.52, 0.9, 0, { nx: 4, ny: 4, pitch: 16 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1 } = a, p = v.pitch, st = p * 0.32, sh = p * 0.22, bt = a.H - sh;
      a.outline(); a.box(X0, YF, Z0 + bt * 0.78, X1, 0, Z0 + bt);
      const w = p * 0.12; a.box(X0, YF, Z0, X1, YF + w, Z0 + bt * 0.78); a.box(X0, -w, Z0, X1, 0, Z0 + bt * 0.78); a.box(X0, YF, Z0, X0 + w, 0, Z0 + bt * 0.78); a.box(X1 - w, YF, Z0, X1, 0, Z0 + bt * 0.78);
      for (let i = 1; i < v.nx; i++) for (let j = 1; j < v.ny; j++) { const x = X0 + i * p, y = YF + j * p; a.cyl(x, y, Z0, Z0 + bt * 0.78, p * 0.3, 10); a.circ(x, y, p * 0.3, 'EQUIP-HIDDEN'); }
      for (let i = 0; i < v.nx; i++) for (let j = 0; j < v.ny; j++) { const x = X0 + (i + 0.5) * p, y = YF + (j + 0.5) * p; a.cyl(x, y, Z0 + bt, Z1, st, 12); a.circ(x, y, st, 'EQUIP-DETAIL'); }
      a.log('Added the hollow body, underside tubes and the studs (plan and 3D).');
    } }),
  fam({ cat: 'toys/blocks', title: 'Generic wooden play block',
    desc: (v) => `Plain wooden building block, ${v.label}: a ${v.kind} shape with softly eased edges, one of a set.`,
    vs: [['cube, 2 in', 2, 2, 2, 0, { kind: 'cube' }], ['arch, 4 x 2 in', 4, 2, 2, 0, { kind: 'arch' }], ['cylinder, 2 x 4 in', 2, 2, 4, 0, { kind: 'cyl' }], ['roof triangle, 4 x 2 in', 4, 2, 2, 0, { kind: 'tri' }], ['plank, 8 x 2 x 1 in', 8, 2, 1, 0, { kind: 'plank' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W } = a;
      if (v.kind === 'cube' || v.kind === 'plank') { a.box(X0, YF, Z0, X1, 0, Z1); a.rect(X0, YF, X1, 0); a.rect(X0 + 12, YF + 12, X1 - 12, -12, 'EQUIP-DETAIL'); if (v.kind === 'plank') for (const x of [X0 + 20, X1 - 20]) a.box(x - 3, YF, Z0 + 3, x + 3, YF + 2, Z1 - 3); }
      if (v.kind === 'cyl') { a.cyl(cx, cy, Z0, Z1, W / 2, 24); a.circ(cx, cy, W / 2); a.circ(cx, cy, W / 2 - 12, 'EQUIP-DETAIL'); }
      if (v.kind === 'tri') { a.box(X0, YF, Z0, X1, 0, Z0 + 5); prismY(a, [[X0 + 3, Z0 + 5], [X1 - 3, Z0 + 5], [cx, Z1]], YF + 3, -3); a.outline(); a.line(cx, YF, cx, 0, 'EQUIP-DETAIL'); }
      if (v.kind === 'arch') {
        const leg = W * 0.2, ri = W / 2 - leg, zs = Z0 + a.H * 0.42; a.outline();
        a.box(X0, YF, Z0, X0 + leg, 0, zs); a.box(X1 - leg, YF, Z0, X1, 0, zs);
        let px = cx - ri, pz = zs; for (let i = 1; i <= 14; i++) { const t = PI - (PI * i) / 14, x = cx + ri * m.cos(t), z = zs + ri * m.sin(t); prismY(a, [[px, pz], [x, z], [x, Z1], [px, Z1]], YF, 0); px = x; pz = z; }
        prismY(a, [[X0, zs], [cx - ri, zs], [cx - ri, Z1], [X0, Z1]], YF, 0); prismY(a, [[cx + ri, zs], [X1, zs], [X1, Z1], [cx + ri, Z1]], YF, 0);
        a.rect(X0 + 10, YF + 10, X1 - 10, -10, 'EQUIP-DETAIL');
      }
      a.log('Added the ' + v.kind + ' block with its eased edges (plan and 3D).');
    } }),
  fam({ cat: 'toys/blocks', title: 'Generic shape sorter box',
    desc: (v) => `Toddler shape sorter: a lidded box with ${v.holes} raised-rim openings in the lid, a hinged back door and three loose shapes (cylinder, cube and triangle) standing in front.`,
    vs: [['4 openings, 6 in', 8, 9, 7, 0, { holes: 4 }], ['6 openings, 10 in wide', 11, 10, 8, 0, { holes: 6 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx } = a, bd = a.D * 0.62, y0 = YF + a.D - bd, bh = a.H - 8;
      a.outline(); a.box(X0, y0, Z0, X1, 0, Z0 + bh); a.rect(X0, y0, X1, 0, 'EQUIP-DETAIL');
      a.box(X0 - 0, y0 - 2, Z0 + bh, X1, 0, Z0 + bh + 4); a.frame(cx - a.W * 0.3, Z0 + 20, cx + a.W * 0.3, Z0 + bh * 0.8, y0 - 3, y0 + 0.5, 6); a.box(cx + a.W * 0.2 - 6, y0 - 8, Z0 + bh * 0.4, cx + a.W * 0.2 + 6, y0 - 3, Z0 + bh * 0.4 + 20);
      const cols = v.holes / 2, sx = a.W / (cols + 1);
      for (let i = 0; i < cols; i++) for (let j = 0; j < 2; j++) {
        const x = X0 + sx * (i + 1), y = y0 + bd * (0.3 + 0.4 * j), r = m.min(sx, bd / 4) * 0.34, z = Z0 + bh + 4, k = (i * 2 + j) % 3;
        if (k === 0) { ring(a, x, y, z + 2, r, 2, 18, 5); a.circ(x, y, r, 'EQUIP-DETAIL'); } else if (k === 1) { a.frame(x - r, z - 2, x + r, z + 2, y - r, y + r, 4); a.rect(x - r, y - r, x + r, y + r, 'EQUIP-DETAIL'); } else { a.tube([[x - r, y - r, z + 1], [x + r, y - r, z + 1], [x, y + r, z + 1], [x - r, y - r, z + 1]], [2, 2, 2, 2], 4); a.poly([[x - r, y - r], [x + r, y - r], [x, y + r]], 'EQUIP-DETAIL'); }
      }
      const fy = YF + (y0 - YF) / 2, sr = m.min((y0 - YF) * 0.36, a.W * 0.09);
      a.cyl(X0 + sr * 1.3, fy, Z0, Z0 + sr * 1.7, sr, 16); a.box(cx - sr, fy - sr, Z0, cx + sr, fy + sr, Z0 + sr * 2); a.prism([[X1 - sr * 2.3, fy - sr], [X1 - sr * 0.3, fy - sr], [X1 - sr * 1.3, fy + sr]], Z0, Z0 + sr * 1.8);
      a.circ(X0 + sr * 1.3, fy, sr); a.rect(cx - sr, fy - sr, cx + sr, fy + sr); a.log('Added the box, lid openings with raised rims, back door and the three loose shapes (plan and 3D).');
    } }),
  fam({ cat: 'toys/blocks', title: 'Generic nesting cup tower',
    desc: (v) => `${v.n} nesting cups of graded size built into a tower upside down, each with a small lip at the mouth and a raised ring on the base.`,
    vs: [['4 cups, 6 in', 5, 5, 6, 0, { n: 4 }], ['6 cups, 8 in', 6, 6, 8, 0, { n: 6 }], ['8 cups, 10 in', 7, 7, 10, 0, { n: 8 }]],
    build: (a, v) => {
      const { cx, cy, Z0, W } = a, R = W / 2, ch = a.H / (v.n * 0.62 + 0.45);
      for (let i = 0; i < v.n; i++) {
        const ro = R * (1 - (0.6 * i) / v.n), rt = ro * 0.82, z = Z0 + i * ch * 0.62, ri = rt * 0.7, rr = ro * 0.7;
        lathe(a, cx, cy, z, [[ro + 3, 0], [ro, 10], [rt, ch]], 20); lathe(a, cx, cy, z, [[ro * 0.9, 12], [rt * 0.9, ch - 4]], 20, 0, 2 * PI, false);
        a.cone(cx, cy, z + ch - 4, z + ch, rt, rt * 0.9, 20); a.circ(cx, cy, ro, 'EQUIP-DETAIL');
        if (i === v.n - 1) { ring(a, cx, cy, z + ch, rt * 0.55, 3, 16, 5); }
      }
      a.log('Added the graded cups with lips and base rings stacked into a tower (plan and 3D).');
    } }),
  fam({ cat: 'toys/blocks', title: 'Generic marble run set',
    desc: (v) => `Tabletop marble run: a base plate, ${v.posts} posts and ${v.levels} sloped channels with side walls running in alternate directions, a hopper at the top and a marble.`,
    vs: [['12 in, 4 channels', 10, 8, 12, 0, { levels: 4, posts: 3 }], ['24 in tower, 8 channels', 12, 10, 24, 0, { levels: 8, posts: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy } = a;
      a.outline(); a.box(X0, YF, Z0, X1, 0, Z0 + 14);
      const ys = [YF + 40, cy, -40, cy + 0], px = [X0 + 20, X1 - 20];
      for (let i = 0; i < v.posts; i++) { const y = YF + 40 + (i * (a.D - 80)) / (v.posts - 1 || 1); for (const x of px) { a.cyl(x, y, Z0 + 14, Z1 - 20, 8, 8); a.circ(x, y, 8, 'EQUIP-DETAIL'); } }
      const lh = (a.H - 60) / v.levels;
      for (let i = 0; i < v.levels; i++) {
        const dir = i % 2 ? -1 : 1, y = YF + 40 + ((i % v.posts) * (a.D - 80)) / (v.posts - 1 || 1) + 0, zt = Z1 - 40 - i * lh, zb = zt - lh * 0.8, xa = dir > 0 ? X0 + 14 : X1 - 14, xb = dir > 0 ? X1 - 14 : X0 + 14;
        prismY(a, [[xa, zt], [xb, zb], [xb, zb + 5], [xa, zt + 5]], y - 18, y + 18); for (const s of [-1, 1]) prismY(a, [[xa, zt + 5], [xb, zb + 5], [xb, zb + 30], [xa, zt + 30]], y + s * 18 - (s > 0 ? 0 : 5), y + s * 18 + (s > 0 ? 5 : 0));
        a.rect(X0 + 10, y - 18, X1 - 10, y + 18, 'EQUIP-DETAIL');
      }
      a.cone(cx - a.W * 0.3, YF + 40, Z1 - 40, Z1 - 4, 10, 40, 14); sph(a, X0 + 40, YF + 40, Z1 - 60, 12, 10, 6);
      a.log('Added the base, posts, sloped channels with side walls, the hopper and a marble (plan and 3D).');
    } }),
  fam({ cat: 'toys/blocks', title: 'Generic wooden tumbling tower',
    desc: (v) => `Stacking tower of ${v.n} rectangular wooden blocks, three to a layer with alternating direction, one block in the fourth layer pushed part way out.`,
    vs: [['18 blocks', 3.5, 3.5, 3.7, 0, { n: 18 }], ['54 blocks', 3.5, 3.5, 11.1, 0, { n: 54 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, cx, cy } = a, L = 76.2, Wd = 25.4, bh = (a.H - 0) / (v.n / 3), g = 0.7, c = [cx, cy];
      a.outline('EQUIP-HIDDEN');
      for (let l = 0; l < v.n / 3; l++) for (let k = -1; k <= 1; k++) {
        const z0 = Z0 + l * bh, z1 = z0 + bh - 0.7, o = k * (Wd + g);
        if (l % 2 === 0) a.box(cx - L / 2, cy + o - Wd / 2, z0, cx + L / 2, cy + o + Wd / 2, z1); else { const out = l === 3 && k === 0 ? -(Wd * 0.5 + 0) : 0; a.box(cx + o - Wd / 2, cy - L / 2 + out, z0, cx + o + Wd / 2, cy + L / 2 + out, z1); }
      }
      a.rect(cx - L / 2, cy - L / 2, cx + L / 2, cy + L / 2); a.log('Added the layered blocks with one pushed out (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ vehicles
function car(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, wr = o.wr, zb = Z0 + wr * 0.7, hb = o.hb, cw = W / 2 * 0.8;
  const y = (f) => YF + f * L;
  prismX(a, [[y(0.03), zb], [y(0.97), zb], [y(1), zb + hb * 0.6], [y(0.96), zb + hb], [y(0.04), zb + hb], [y(0), zb + hb * 0.55]], X0 + W * 0.06, X1 - W * 0.06);
  const cab = o.cab;
  if (cab) {
    const c0 = o.c0 ?? 0.3, c1 = o.c1 ?? 0.78, top = Z1 - (o.hz ?? 0), z0 = zb + hb;
    prismX(a, [[y(c0), z0], [y(c1), z0], [y(c1 - 0.08), top], [y(c0 + 0.12), top]], cx - cw, cx + cw);
    pane(a, [y(c0), z0], [y(c0 + 0.12), top], 0.5, cx - cw * 0.85, cx + cw * 0.85, 2); pane(a, [y(c1), z0], [y(c1 - 0.08), top], 0.5, cx - cw * 0.85, cx + cw * 0.85, 2);
    for (const s of [-1, 1]) prismX(a, [[y(c0 + 0.16), z0 + (top - z0) * 0.2], [y(c1 - 0.14), z0 + (top - z0) * 0.2], [y(c1 - 0.18), top - (top - z0) * 0.15], [y(c0 + 0.2), top - (top - z0) * 0.15]], s > 0 ? cx + cw + 0.01 : cx - cw - 2, s > 0 ? cx + cw + 2 : cx - cw - 0.01);
  }
  for (const s of [-1, 1]) { a.box(cx + s * W * 0.3 - 22, YF, zb + hb * 0.35, cx + s * W * 0.3 + 22, YF + 5, zb + hb * 0.7); a.box(cx + s * W * 0.3 - 22, YB - 5, zb + hb * 0.35, cx + s * W * 0.3 + 22, YB, zb + hb * 0.7); }
  a.box(cx - W * 0.2, YF, zb + hb * 0.15, cx + W * 0.2, YF + 8, zb + hb * 0.45); a.box(X0 + W * 0.04, YF, zb - 2, X1 - W * 0.04, YF + 10, zb + hb * 0.15);
  for (const [fy] of [[o.fy ?? 0.2], [o.ry ?? 0.8]]) for (const s of [-1, 1]) tw(a, cx + s * (W / 2 - o.ww / 2 - 2), y(fy), wr, o.ww);
  a.rect(X0 + W * 0.06, YF, X1 - W * 0.06, YB); a.rect(cx - cw, y(0.3), cx + cw, y(0.78), 'EQUIP-DETAIL');
}
const vehicles = [
  fam({ cat: 'toys/vehicles', title: 'Generic toy car',
    desc: (v) => `Toy ${v.kind}, ${v.len} in long: a body with a cabin and sloped glass, front and rear lamps, a bumper and four wheels with hubs${v.kind === 'pickup' ? ', and an open load bed' : v.kind === 'racing car' ? ', a low cockpit with a rear wing' : ''}.`,
    vs: [['sedan, 4 in', 1.8, 4, 1.5, 0, { kind: 'sedan', len: 4 }], ['pickup, 6 in', 2.6, 6, 2.3, 0, { kind: 'pickup', len: 6 }], ['racing car, 8 in', 3, 8, 2, 0, { kind: 'racing car', len: 8 }], ['plastic ride-on style car, 12 in', 4.8, 12, 4.6, 0, { kind: 'sedan', len: 12 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, wr = a.H * 0.2, L = a.D;
      if (v.kind === 'sedan') car(a, { wr, hb: a.H * 0.36, cab: true, ww: W * 0.14, hz: 0 });
      if (v.kind === 'pickup') {
        car(a, { wr: wr * 0.95, hb: a.H * 0.34, cab: true, c0: 0.12, c1: 0.5, ww: W * 0.15, hz: 0 });
        const zb = Z0 + wr * 0.95 * 0.7 + a.H * 0.34, y = (f) => YF + f * L; for (const s of [-1, 1]) a.box(cx + s * (W / 2 - W * 0.06) - 6, y(0.52), zb, cx + s * (W / 2 - W * 0.06) + 6, y(0.99), zb + a.H * 0.18); a.box(cx - W / 2 + W * 0.06, y(0.97), zb, cx + W / 2 - W * 0.06, y(0.99), zb + a.H * 0.18); a.box(cx - W / 2 + W * 0.06, y(0.52), zb, cx + W / 2 - W * 0.06, y(0.54), zb + a.H * 0.18);
      }
      if (v.kind === 'racing car') {
        const y = (f) => YF + f * L, zb = Z0 + wr * 0.8;
        prismX(a, [[y(0.0), zb], [y(1), zb], [y(0.96), zb + a.H * 0.35], [y(0.45), zb + a.H * 0.42], [y(0.14), zb + a.H * 0.2]], cx - W * 0.2, cx + W * 0.2);
        a.ell(cx, y(0.52), zb + a.H * 0.55, W * 0.11, L * 0.07, a.H * 0.14, 10, 6);
        a.box(cx - W * 0.45, y(0.0), zb - 2, cx + W * 0.45, y(0.06), zb + a.H * 0.12); a.box(cx - W * 0.4, y(0.9), Z1 - a.H * 0.12, cx + W * 0.4, y(0.98), Z1 - a.H * 0.1);
        for (const s of [-1, 1]) { a.box(cx + s * W * 0.34 - 6, y(0.92), zb + a.H * 0.3, cx + s * W * 0.34 + 6, y(0.96), Z1 - a.H * 0.1); tw(a, cx + s * (W / 2 - W * 0.09), y(0.2), wr * 0.95, W * 0.17); tw(a, cx + s * (W / 2 - W * 0.09), y(0.8), wr * 1.05, W * 0.17); }
        a.rect(cx - W * 0.2, YF, cx + W * 0.2, YB); a.rect(cx - W * 0.45, YF, cx + W * 0.45, y(0.06), 'EQUIP-DETAIL');
      }
      a.log('Added the body, cabin and glass, lamps, bumper and wheels (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy dump truck',
    desc: (v) => `Toy dump truck, ${v.len} in long: a chassis, a cab with sloped glass, a tipping bed with raised sides and tailgate, a hinge at the rear, a lifting ram and six wheels.`,
    vs: [['6 in', 3, 6, 3.2, 0, { len: 6 }], ['10 in', 4.6, 10, 5, 0, { len: 10 }], ['16 in', 7, 16, 7.6, 0, { len: 16 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, y = (f) => YF + f * L, wr = a.H * 0.15, ch = Z0 + wr * 1.2, cw = W * 0.44;
      a.outline();
      a.box(cx - W * 0.35, YF + 4, ch, cx + W * 0.35, YB - 4, ch + a.H * 0.08);
      prismX(a, [[y(0.0), ch], [y(0.3), ch], [y(0.3), Z0 + a.H * 0.72], [y(0.1), Z0 + a.H * 0.72], [y(0.0), Z0 + a.H * 0.45]], cx - cw, cx + cw);
      pane(a, [y(0.0), Z0 + a.H * 0.45], [y(0.1), Z0 + a.H * 0.72], 0.5, cx - cw * 0.8, cx + cw * 0.8, 2);
      a.box(cx - cw - 2, y(0.0), Z0 + a.H * 0.3, cx + cw + 2, y(0.02), Z0 + a.H * 0.4); for (const s of [-1, 1]) a.box(cx + s * cw * 0.7 - 6, YF, Z0 + a.H * 0.34, cx + s * cw * 0.7 + 6, YF + 3, Z0 + a.H * 0.4);
      const hz = ch + a.H * 0.08, bt = Z1 - 8;
      prismX(a, [[y(0.34), hz + 6], [y(0.98), hz + 30], [y(0.98), bt - a.H * 0.2], [y(0.34), bt - a.H * 0.2]], cx - cw, cx + cw);
      for (const s of [-1, 1]) prismX(a, [[y(0.34), hz + 6], [y(0.98), hz + 30], [y(0.98), bt], [y(0.34), bt]].map(([yy, zz], i) => [yy, i < 2 ? zz + (a.H * 0.2) * 0 + 4 : zz]), s > 0 ? cx + cw - 6 : cx - cw, s > 0 ? cx + cw : cx - cw + 6);
      a.box(cx - cw, y(0.34) - 6, hz + 6, cx + cw, y(0.34), bt); a.box(cx - cw, y(0.98) - 4, hz + 30, cx + cw, y(0.98), bt - 10);
      a.ycyl(y(0.42), y(0.62), cx, hz - 4, W * 0.04, 8); a.xcyl(cx - cw, cx + cw, y(0.98) + 0 - 4, hz + 26, 4, 8);
      for (const f of [0.18, 0.64, 0.84]) for (const s of [-1, 1]) tw(a, cx + s * (W / 2 - W * 0.07), y(f), wr, W * 0.14);
      a.rect(cx - cw, y(0.34), cx + cw, YB, 'EQUIP-DETAIL'); a.rect(cx - cw, YF, cx + cw, y(0.3), 'EQUIP');
      a.log('Added the chassis, cab with glass, tipping bed with tailgate and hinge, ram and six wheels (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy train piece',
    desc: (v) => ({ engine: 'Toy steam-style locomotive: a round boiler, a chimney, a dome, a cab with roof, a cow-catcher, a headlamp, coupled wheels with side rods and a front coupling.', tender: 'Toy tender: a sloped fuel box on a frame with four wheels and couplings at each end.', wagon: 'Toy open wagon: a floor with four low side walls, drop-style end boards, four wheels and couplings.', tank: 'Toy tank wagon: a round tank on a frame with two straps, a filler dome, a ladder, four wheels and couplings.', coach: 'Toy passenger coach: a body with a window row on each side, a curved roof, end doors, four wheels and couplings.' })[v.kind],
    vs: [['steam-style engine, 8 in', 2.4, 8, 3.6, 0, { kind: 'engine' }], ['tender, 5 in', 2.4, 5, 2.4, 0, { kind: 'tender' }], ['open wagon, 6 in', 2.4, 6, 2.4, 0, { kind: 'wagon' }], ['tank wagon, 6 in', 2.4, 6, 3, 0, { kind: 'tank' }], ['passenger coach, 8 in', 2.4, 8, 3, 0, { kind: 'coach' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, y = (f) => YF + f * L, wr = a.H * 0.11, ch = Z0 + wr * 1.5, fw = W * 0.8;
      a.box(cx - fw / 2, YF + 8, ch - 8, cx + fw / 2, YB - 8, ch + 6); a.rect(cx - fw / 2, YF + 8, cx + fw / 2, YB - 8);
      const axles = v.kind === 'engine' ? [0.2, 0.42, 0.62] : [0.2, 0.8];
      for (const f of axles) for (const s of [-1, 1]) { tw(a, cx + s * (fw / 2 + 2), y(f), wr * (v.kind === 'engine' && f > 0.55 ? 1.25 : 1), 10); }
      if (v.kind === 'engine') for (const s of [-1, 1]) a.box(cx + s * (fw / 2 + 4) - 3, y(0.2), ch - 10, cx + s * (fw / 2 + 4) + 3, y(0.62), ch + 2);
      a.box(cx - 5, YF - 0, ch - 4, cx + 5, YF + 10, ch + 6); a.box(cx - 5, YB - 10, ch - 4, cx + 5, YB, ch + 6);
      if (v.kind === 'engine') {
        const br = W * 0.33, bz = ch + 6 + br;
        a.ycyl(YF + 18, y(0.62), cx, bz, br, 18); a.cone(cx, y(0.1), bz + br - 2, Z0 + a.H * 0.88, W * 0.09, W * 0.06, 10); a.cone(cx, y(0.1), Z0 + a.H * 0.88, Z1, W * 0.06, W * 0.12, 10);
        sph(a, cx, y(0.36), bz + br * 0.9, br * 0.3, 10, 6); a.ycyl(YF, YF + 18, cx, bz, br * 0.9, 14); a.ell(cx, YF + 3, bz + br * 0.5, br * 0.25, 5, br * 0.25, 8, 5);
        prismX(a, [[YF, ch], [YF + 40, ch + 40], [YF + 40, ch + 6], [YF, ch - 8]], cx - fw * 0.4, cx + fw * 0.4);
        a.box(cx - W * 0.4, y(0.64), ch + 6, cx + W * 0.4, YB - 10, Z1 - 10); a.box(cx - W * 0.45, y(0.62), Z1 - 12, cx + W * 0.45, YB - 6, Z1); for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 2, y(0.72), ch + a.H * 0.35, cx + s * W * 0.4 + 2, y(0.9), ch + a.H * 0.6);
        a.circ(cx, y(0.1), W * 0.06, 'EQUIP-DETAIL'); a.line(cx, YF, cx, y(0.62), 'EQUIP-DETAIL');
      }
      if (v.kind === 'tender') { prismX(a, [[y(0.05), ch + 6], [y(0.95), ch + 6], [y(0.95), Z1 - 4], [y(0.4), Z1 - 4], [y(0.05), Z0 + a.H * 0.5]], cx - W * 0.4, cx + W * 0.4); a.rect(cx - W * 0.4, y(0.05), cx + W * 0.4, y(0.95), 'EQUIP-DETAIL'); }
      if (v.kind === 'wagon') { const t = 6; a.box(cx - fw / 2, y(0.05), ch + 6, cx + fw / 2, y(0.95), ch + 14); for (const s of [-1, 1]) a.box(cx + s * fw / 2 - (s > 0 ? t : 0), y(0.05), ch + 6, cx + s * fw / 2 + (s > 0 ? 0 : t), y(0.95), Z1 - 6); a.box(cx - fw / 2, y(0.05), ch + 6, cx + fw / 2, y(0.05) + t, Z1 - 6); a.box(cx - fw / 2, y(0.95) - t, ch + 6, cx + fw / 2, y(0.95), Z1 - 6); a.rect(cx - fw / 2 + t, y(0.05) + t, cx + fw / 2 - t, y(0.95) - t, 'EQUIP-DETAIL'); }
      if (v.kind === 'tank') { const tr = (Z1 - ch - 14) / 2; a.ycyl(y(0.08), y(0.92), cx, ch + 8 + tr, tr, 18); for (const f of [0.25, 0.75]) a.ycyl(y(f) - 4, y(f) + 4, cx, ch + 8 + tr, tr + 3, 16); a.cyl(cx, y(0.5), Z1 - 6, Z1, tr * 0.35, 10); a.box(cx + tr - 2, y(0.45), ch + 10, cx + tr + 2, y(0.55), Z1 - tr * 0.4); a.circ(cx, y(0.5), tr * 0.35, 'EQUIP-DETAIL'); }
      if (v.kind === 'coach') {
        a.box(cx - W * 0.4, y(0.05), ch + 6, cx + W * 0.4, y(0.95), Z1 - 18); a.ycyl(y(0.05), y(0.95), cx, Z1 - 18 - 0, W * 0.4 * 0.9, 16);
        for (let i = 0; i < 6; i++) for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - (s > 0 ? 0 : 2), y(0.14 + i * 0.12), ch + a.H * 0.35, cx + s * W * 0.4 + (s > 0 ? 2 : 0), y(0.14 + i * 0.12 + 0.07), Z1 - a.H * 0.22);
        a.box(cx - W * 0.1, YF + 8, ch + 8, cx + W * 0.1, YF + 14, ch + a.H * 0.45); a.rect(cx - W * 0.4, y(0.05), cx + W * 0.4, y(0.95), 'EQUIP-DETAIL');
      }
      a.log('Added the chassis, wheels, couplings and the ' + v.kind + ' body (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy fire engine',
    desc: (v) => `Toy fire engine, ${v.len} in long: a cab with sloped glass, a light bar, a rear body with side lockers, a ladder of two rails and ${v.rungs} rungs on a turntable, a hose reel and six wheels.`,
    vs: [['8 in', 3, 8, 4, 0, { len: 8, rungs: 8 }], ['14 in', 5, 14, 6.6, 0, { len: 14, rungs: 14 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, y = (f) => YF + f * L, wr = a.H * 0.13, ch = Z0 + wr * 1.2, cw = W * 0.45;
      a.outline(); a.box(cx - W * 0.38, YF + 4, ch, cx + W * 0.38, YB - 4, ch + a.H * 0.08);
      prismX(a, [[y(0), ch], [y(0.28), ch], [y(0.28), Z0 + a.H * 0.62], [y(0.08), Z0 + a.H * 0.62], [y(0), Z0 + a.H * 0.4]], cx - cw, cx + cw);
      pane(a, [y(0), Z0 + a.H * 0.4], [y(0.08), Z0 + a.H * 0.62], 0.5, cx - cw * 0.8, cx + cw * 0.8, 2);
      for (const s of [-1, 1]) { sph(a, cx + s * cw * 0.5, y(0.14), Z0 + a.H * 0.66, W * 0.04, 8, 5); a.box(cx + s * cw * 0.65 - 8, YF, Z0 + a.H * 0.28, cx + s * cw * 0.65 + 8, YF + 3, Z0 + a.H * 0.35); }
      a.box(cx - cw * 0.6, y(0.1), Z0 + a.H * 0.62, cx + cw * 0.6, y(0.18), Z0 + a.H * 0.68);
      const bz = ch + a.H * 0.08, bt = Z0 + a.H * 0.58;
      a.box(cx - cw, y(0.3), bz, cx + cw, YB - 2, bt); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) a.box(cx + s * cw - (s > 0 ? 0 : 1.5), y(0.34 + i * 0.2), bz + a.H * 0.06, cx + s * cw + (s > 0 ? 1.5 : 0), y(0.34 + i * 0.2 + 0.16), bt - a.H * 0.04);
      a.cyl(cx, y(0.62), bt, bt + a.H * 0.05, W * 0.12, 12);
      const lz = bt + a.H * 0.05, ly0 = y(0.3), ly1 = y(0.94);
      for (const s of [-1, 1]) a.tube([[cx + s * W * 0.14, ly0 - 0, lz + a.H * 0.2 * 0 + a.H * 0.12], [cx + s * W * 0.14, ly1, lz + 4]], [3, 3], 6);
      for (let i = 0; i <= v.rungs; i++) { const f = i / v.rungs; a.box(cx - W * 0.14, ly0 + (ly1 - ly0) * f - 1.5, lz + a.H * 0.12 + (4 - a.H * 0.12) * f - 1.5, cx + W * 0.14, ly0 + (ly1 - ly0) * f + 1.5, lz + a.H * 0.12 + (4 - a.H * 0.12) * f + 1.5); }
      a.line(cx - W * 0.14, ly0, cx - W * 0.14, ly1, 'EQUIP-DETAIL'); a.line(cx + W * 0.14, ly0, cx + W * 0.14, ly1, 'EQUIP-DETAIL');
      for (const f of [0.15, 0.66, 0.84]) for (const s of [-1, 1]) tw(a, cx + s * (W / 2 - W * 0.07), y(f), wr, W * 0.14);
      a.log('Added the chassis, cab with glass and lights, body with lockers, turntable, ladder, hose reel and six wheels (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy aeroplane',
    desc: (v) => ({ prop: 'Toy propeller aeroplane: a turned fuselage, a straight wing, a tailplane and fin, a two-blade propeller with a spinner and three wheels on struts.', jet: 'Toy jet aeroplane: a slim fuselage, swept wings with two engine pods, a tailplane and fin, a cockpit canopy and three small wheels.', bi: 'Toy biplane: a fuselage, two wings joined by struts and wires, a tailplane and fin, a front engine with a two-blade propeller and fixed wheels.' })[v.kind],
    vs: [['propeller, 8 in', 9, 8, 3, 0, { kind: 'prop' }], ['jet, 10 in', 8, 10, 2.6, 0, { kind: 'jet' }], ['biplane, 12 in', 12, 11, 4.6, 0, { kind: 'bi' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, y = (f) => YF + f * L, gz = Z0 + a.H * 0.2, zc = Z0 + a.H * 0.45, fr = a.H * (v.kind === 'bi' ? 0.11 : 0.09);
      a.tube([[cx, y(0.04), zc], [cx, y(0.12), zc], [cx, y(0.5), zc], [cx, y(0.85), zc + fr * 0.4], [cx, y(0.98), zc + fr * 0.7]], [fr * 0.5, fr * 0.95, fr, fr * 0.6, fr * 0.2], 14);
      a.ellp(cx, (YF + YB) / 2, fr, L / 2, 'EQUIP'); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL');
      const wing = (zz, f0, f1, sw, half) => { for (const s of [-1, 1]) { const pts = [[cx + s * fr * 0.8, y(f0)], [cx + s * half, y(f0 + sw)], [cx + s * half, y(f1 + sw)], [cx + s * fr * 0.8, y(f1)]]; a.prism(s > 0 ? pts : pts.slice().reverse(), zz, zz + 8); a.poly(pts); } };
      if (v.kind === 'prop') { wing(zc - fr * 0.6, 0.3, 0.5, 0, W / 2); } else if (v.kind === 'jet') { wing(zc - fr * 0.5, 0.35, 0.55, 0.14, W / 2); for (const s of [-1, 1]) { a.ycyl(y(0.3), y(0.52), cx + s * W * 0.2, zc - fr * 0.9, fr * 0.7, 12); a.circ(cx + s * W * 0.2, y(0.3), fr * 0.7, 'EQUIP-DETAIL'); } } else { wing(zc + fr * 1.8, 0.2, 0.42, 0, W / 2); wing(zc - fr * 0.9, 0.22, 0.4, 0, W / 2 * 0.9); for (const s of [-1, 1]) for (const f of [0.26, 0.38]) a.tube([[cx + s * W * 0.32, y(f), zc - fr * 0.9 + 8], [cx + s * W * 0.32, y(f), zc + fr * 1.8]], [3, 3], 6); for (const f of [0.28, 0.4]) a.tube([[cx - fr * 0.4, y(f), zc + fr * 0.5], [cx - W * 0.32, y(f), zc + fr * 1.8]], [2, 2], 4), a.tube([[cx + fr * 0.4, y(f), zc + fr * 0.5], [cx + W * 0.32, y(f), zc + fr * 1.8]], [2, 2], 4); }
      const sy = y(0.88); for (const s of [-1, 1]) { const pts = [[cx + s * fr * 0.3, sy], [cx + s * W * 0.22, sy + L * 0.03], [cx + s * W * 0.22, sy + L * 0.09], [cx + s * fr * 0.3, sy + L * 0.1]]; a.prism(s > 0 ? pts : pts.slice().reverse(), zc + fr * 0.4, zc + fr * 0.4 + 6); a.poly(pts); }
      prismX(a, [[y(0.84), zc + fr * 0.5], [y(0.99), zc + fr * 0.6], [y(0.99), Z1 - 4], [y(0.9), Z1 - 4]], cx - 4, cx + 4);
      if (v.kind !== 'jet') { const pr = a.H * 0.36; a.cone(cx, YF + 6, zc, zc + 0.01, 1, 1, 3); a.ell(cx, YF + 14, zc, fr * 0.45, 12, fr * 0.45, 10, 6); a.box(cx - 4, YF + 2, zc - pr, cx + 4, YF + 8, zc + pr); a.line(cx - 4, YF + 4, cx + 4, YF + 4, 'EQUIP-DETAIL'); } else { a.ell(cx, y(0.26), zc + fr * 0.8, fr * 0.6, L * 0.08, fr * 0.5, 12, 6); }
      const wh = v.kind === 'jet' ? a.H * 0.08 : a.H * 0.12;
      for (const s of [-1, 1]) { a.tube([[cx + s * W * (v.kind === 'bi' ? 0.14 : 0.16), y(0.3), zc - fr * 0.5], [cx + s * W * (v.kind === 'bi' ? 0.14 : 0.16), y(0.3), Z0 + wh]], [3, 3], 6); tw(a, cx + s * W * (v.kind === 'bi' ? 0.14 : 0.16), y(0.3), wh, 8); }
      a.tube([[cx, y(0.12), zc - fr * 0.6], [cx, y(0.12), Z0 + wh * 0.8]], [3, 3], 6); tw(a, cx, y(0.12), wh * 0.8, 6);
      a.log('Added the fuselage, wing' + (v.kind === 'bi' ? 's with struts' : '') + ', tail, ' + (v.kind === 'jet' ? 'engine pods and canopy' : 'propeller') + ' and wheels (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy boat',
    desc: (v) => ({ tug: 'Toy tugboat: a pointed hull, a wheelhouse with windows, a tall funnel, a rubbing rail and a ring buoy.', sail: 'Toy sailboat: a hull with a keel and rudder, a mast, a mainsail and a jib, and a small cabin.', ferry: 'Toy ferry: a wide flat hull, two decks with a window band, a bridge, two funnels and deck rails.' })[v.kind],
    vs: [['tugboat, 8 in', 3.4, 8, 6, 0, { kind: 'tug' }], ['sailboat, 10 in', 4, 10, 12, 0, { kind: 'sail' }], ['ferry, 14 in', 5, 14, 6, 0, { kind: 'ferry' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, y = (f) => YF + f * L, hh = a.H * (v.kind === 'sail' ? 0.12 : 0.22);
      const hull = [[cx - W * 0.1, y(0.0)], [cx + W * 0.1, y(0.0)], [cx + W * 0.42, y(0.2)], [cx + W * 0.5, y(0.6)], [cx + W * 0.42, y(0.98)], [cx - W * 0.42, y(0.98)], [cx - W * 0.5, y(0.6)], [cx - W * 0.42, y(0.2)]];
      const kz = Z0 + (v.kind === 'sail' ? a.H * 0.18 : 0);
      a.prism(hull, kz, kz + hh); a.poly(hull); a.prism(hull.map(([x, yy]) => [cx + (x - cx) * 1.0, yy]), kz + hh, kz + hh + 4);
      a.outline('EQUIP-HIDDEN');
      if (v.kind === 'tug') {
        const dz = kz + hh + 4; a.box(cx - W * 0.28, y(0.4), dz, cx + W * 0.28, y(0.86), dz + a.H * 0.32); a.box(cx - W * 0.3, y(0.4) - 4, dz + a.H * 0.3, cx + W * 0.3, y(0.86) + 4, dz + a.H * 0.34);
        for (let i = 0; i < 3; i++) a.box(cx - W * 0.2 + i * W * 0.15, y(0.4) - 3, dz + a.H * 0.14, cx - W * 0.2 + i * W * 0.15 + W * 0.1, y(0.4), dz + a.H * 0.26);
        a.cyl(cx, y(0.7), dz + a.H * 0.34, Z1 - 6, W * 0.1, 14); a.cone(cx, y(0.7), Z1 - 6, Z1, W * 0.1, W * 0.11, 14); ring(a, cx, y(0.15), dz + 14, W * 0.07, 3, 12, 5);
        a.circ(cx, y(0.7), W * 0.1, 'EQUIP-DETAIL'); a.rect(cx - W * 0.28, y(0.4), cx + W * 0.28, y(0.86), 'EQUIP-DETAIL');
      } else if (v.kind === 'sail') {
        const dz = kz + hh + 4; a.box(cx - W * 0.2, y(0.45), dz, cx + W * 0.2, y(0.75), dz + a.H * 0.07); a.tube([[cx, y(0.5), dz], [cx, y(0.5), Z1]], [4, 3], 8);
        prismX(a, [[y(0.55), dz + 10], [y(0.93), dz + 10], [y(0.5) + 4, Z1 - 4]], cx - 1.5, cx + 1.5); prismX(a, [[y(0.46), dz + 10], [y(0.1), dz + 10], [y(0.48), Z1 - a.H * 0.2]], cx - 1.5, cx + 1.5);
        prismX(a, [[y(0.5), Z0], [y(0.62), kz], [y(0.4), kz]], cx - 3, cx + 3); prismX(a, [[y(0.94), kz + hh * 0.9], [y(0.98), kz + hh * 0.9], [y(0.98), kz - a.H * 0.08], [y(0.95), kz - a.H * 0.08]], cx - 2, cx + 2);
        a.line(cx, y(0.1), cx, y(0.93), 'EQUIP-DETAIL');
      } else {
        const dz = kz + hh + 4; a.box(cx - W * 0.4, y(0.12), dz, cx + W * 0.4, y(0.92), dz + a.H * 0.25); a.box(cx - W * 0.3, y(0.3), dz + a.H * 0.25, cx + W * 0.3, y(0.8), dz + a.H * 0.45); a.box(cx - W * 0.2, y(0.5), dz + a.H * 0.45, cx + W * 0.2, y(0.7), dz + a.H * 0.62);
        for (const s of [-1, 1]) { for (let i = 0; i < 8; i++) a.box(cx + s * W * 0.4 - (s > 0 ? 0 : 2), y(0.15 + i * 0.09), dz + a.H * 0.08, cx + s * W * 0.4 + (s > 0 ? 2 : 0), y(0.15 + i * 0.09 + 0.05), dz + a.H * 0.18); a.cyl(cx + s * W * 0.14, y(0.62), dz + a.H * 0.62, Z1 - 4, W * 0.07, 12); }
        for (const s of [-1, 1]) a.tube([[cx + s * W * 0.42, y(0.15), dz + a.H * 0.25], [cx + s * W * 0.42, y(0.15), dz + a.H * 0.25 + 18]], [1.5, 1.5], 5);
        a.rect(cx - W * 0.4, y(0.12), cx + W * 0.4, y(0.92), 'EQUIP-DETAIL');
      }
      a.log('Added the hull, deck and the ' + v.kind + ' fittings (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy digger',
    desc: (v) => `Toy excavator, ${v.len} in long: two track units with rollers, a turntable and cab with sloped glass, a two-part boom with a stick, a toothed bucket and two lifting rams.`,
    vs: [['8 in', 3.2, 8, 4.4, 0, { len: 8 }], ['14 in', 5.4, 14, 7.4, 0, { len: 14 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, y = (f) => YF + f * L, th = a.H * 0.2, tw0 = W * 0.2;
      a.outline('EQUIP-HIDDEN');
      for (const s of [-1, 1]) { const x = cx + s * (W * 0.37); const pts = [[y(0.42), Z0 + th * 0.4], [y(0.54), Z0], [y(0.94), Z0], [y(1), Z0 + th * 0.4], [y(0.94), Z0 + th], [y(0.54), Z0 + th]]; prismX(a, pts, x - tw0 / 2, x + tw0 / 2); a.rect(x - tw0 / 2, y(0.42), x + tw0 / 2, YB, 'EQUIP'); for (const f of [0.5, 0.62, 0.74, 0.86]) a.xcyl(x - tw0 / 2 - 2, x + tw0 / 2 + 2, y(f), Z0 + th * 0.5, th * 0.22, 8); }
      a.box(cx - W * 0.4, y(0.5), Z0 + th, cx + W * 0.4, y(0.92), Z0 + th + 8); a.cyl(cx, y(0.72), Z0 + th, Z0 + th + 14, W * 0.3, 18);
      const bz = Z0 + th + 14; a.box(cx - W * 0.34, y(0.5), bz, cx + W * 0.34, YB - 4, bz + a.H * 0.2); a.box(cx - W * 0.24, y(0.42), bz, cx + W * 0.24, y(0.5), bz + a.H * 0.12);
      const cb = bz + a.H * 0.2; prismX(a, [[y(0.52), cb - 4], [y(0.78), cb - 4], [y(0.78), cb + a.H * 0.3], [y(0.58), cb + a.H * 0.3]], cx - W * 0.3, cx + W * 0.1); pane(a, [y(0.52), cb - 4], [y(0.58), cb + a.H * 0.3], 0.5, cx - W * 0.26, cx + W * 0.06, 2);
      const px = cx + W * 0.22, p0 = [y(0.5), bz + a.H * 0.1], p1 = [y(0.12), bz + a.H * 0.42], p2 = [y(0.02), bz + a.H * 0.08];
      a.tube([[px, p0[0], p0[1]], [px, p1[0], p1[1]]], [W * 0.05, W * 0.04], 8); a.tube([[px, p1[0], p1[1]], [px, p2[0] + 0, p2[1] + a.H * 0.08]], [W * 0.035, W * 0.03], 8);
      prismX(a, [[YF + 0, Z0 + 8], [YF + L * 0.1, Z0 + 8], [YF + L * 0.1, Z0 + a.H * 0.2], [YF, Z0 + a.H * 0.2 + a.H * 0.08]], px - W * 0.12, px + W * 0.12);
      for (let i = -1; i <= 1; i++) a.box(px + i * W * 0.08 - 2, YF, Z0, px + i * W * 0.08 + 2, YF + 5, Z0 + 10);
      a.tube([[px - W * 0.07, y(0.46), bz + a.H * 0.02], [px - W * 0.07, y(0.2), bz + a.H * 0.34]], [W * 0.018, W * 0.018], 6); a.tube([[px - W * 0.07, y(0.14), bz + a.H * 0.4], [px - W * 0.07, y(0.04), Z0 + a.H * 0.24]], [W * 0.016, W * 0.016], 6);
      a.log('Added the tracks with rollers, turntable, cab, boom, stick, toothed bucket and rams (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy pull-along wagon',
    desc: (v) => `Wagon for a child, ${v.len} in long: a slatted bed with ${v.slats} side slats and corner posts, four wheels on two axles with a pivoting front axle and a bent tube drawbar with a grip.`,
    vs: [['12 in', 7, 20, 7, 0, { len: 12, slats: 3 }], ['24 in', 14, 40, 13, 0, { len: 24, slats: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, bl = L * 0.64, y0 = YF + L - bl, wr = a.H * 0.17, bz = Z0 + wr * 1.7;
      a.outline('EQUIP-HIDDEN'); a.box(X0 + W * 0.08, y0, bz, X1 - W * 0.08, YB, bz + 10);
      const wx0 = X0 + W * 0.08, wx1 = X1 - W * 0.08, top = Z1 - 4;
      for (const [x, y] of [[wx0, y0], [wx1 - 8, y0], [wx0, YB - 8], [wx1 - 8, YB - 8]]) a.box(x, y, bz, x + 8, y + 8, top);
      for (const k of [0, 1, 2, 3].slice(0, v.slats)) { const z = bz + 10 + k * ((top - bz - 10) / v.slats) + 6; for (const sx of [[wx0, wx0 + 6], [wx1 - 6, wx1]]) a.box(sx[0], y0, z, sx[1], YB, z + (top - bz - 10) / v.slats - 12); a.box(wx0, y0, z, wx1, y0 + 6, z + (top - bz - 10) / v.slats - 12); a.box(wx0, YB - 6, z, wx1, YB, z + (top - bz - 10) / v.slats - 12); }
      a.box(X0 + W * 0.04, y0 + 10, bz - 8, X1 - W * 0.04, y0 + 40, bz); a.box(X0 + W * 0.04, YB - 40, bz - 8, X1 - W * 0.04, YB - 10, bz - 0.01);
      for (const [yy, ww] of [[y0 + (YB - y0) * 0.2, 1], [YB - (YB - y0) * 0.2, 1]]) { a.xcyl(X0 + W * 0.1, X1 - W * 0.1, yy, bz - 14, 5, 8); for (const s of [-1, 1]) tw(a, cx + s * (W / 2 - W * 0.06), yy, wr, W * 0.08, Z0 + wr); }
      const hd = [[cx, y0 + 20, bz - 10], [cx, YF + L * 0.18, bz + 20], [cx, YF + 20, Z0 + a.H * 0.55]]; a.tube(hd, [6, 6, 6], 8); a.tube([[cx - W * 0.18, YF + 6, Z0 + a.H * 0.55], [cx + W * 0.18, YF + 6, Z0 + a.H * 0.55]], [8, 8], 8);
      a.line(cx, y0, cx, YF + 6, 'EQUIP-DETAIL'); a.rect(wx0, y0, wx1, YB); a.log('Added the slatted bed, posts, axles with wheels and the bent drawbar with its grip (plan and 3D).');
    } }),
  fam({ cat: 'toys/vehicles', title: 'Generic toy school-bus style coach',
    desc: () => 'Toy bus, 10 in long: a boxy body with a bonnet, a sloped windscreen, a row of side windows, a door at the front, a roof lamp bar, front and rear bumpers and four wheels.',
    vs: [['10 in', 3.6, 10, 4.2, 0, {}]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, y = (f) => YF + f * L, wr = a.H * 0.12, zb = Z0 + wr * 0.9;
      a.outline('EQUIP-HIDDEN'); prismX(a, [[y(0), zb + 10], [y(0.14), zb + 10], [y(0.14), zb + a.H * 0.45], [y(0), zb + a.H * 0.42]], cx - W * 0.44, cx + W * 0.44);
      prismX(a, [[y(0.14), zb + 10], [y(1), zb + 10], [y(1), Z1 - 6], [y(0.18), Z1 - 6], [y(0.14), Z0 + a.H * 0.8]], cx - W * 0.46, cx + W * 0.46); pane(a, [y(0.14), Z0 + a.H * 0.4], [y(0.18), Z1 - 6], 0.5, cx - W * 0.4, cx + W * 0.4, 2);
      for (let i = 0; i < 6; i++) for (const s of [-1, 1]) a.box(cx + s * W * 0.46 - (s > 0 ? 0 : 2), y(0.26 + i * 0.115), Z0 + a.H * 0.5, cx + s * W * 0.46 + (s > 0 ? 2 : 0), y(0.26 + i * 0.115 + 0.08), Z1 - a.H * 0.2);
      a.box(cx - W * 0.46 - 1, y(0.16), Z0 + a.H * 0.22, cx - W * 0.46 + 1, y(0.24), Z1 - a.H * 0.2); a.box(cx - W * 0.2, y(0.2), Z1 - 6, cx + W * 0.2, y(0.26), Z1 - 2);
      a.box(cx - W * 0.46, YF, zb - 4, cx + W * 0.46, YF + 8, zb + 22); a.box(cx - W * 0.46, YB - 8, zb - 4, cx + W * 0.46, YB, zb + 22);
      for (const s of [-1, 1]) { a.box(cx + s * W * 0.3 - 10, YF, zb + 24, cx + s * W * 0.3 + 10, YF + 3, zb + 40); tw(a, cx + s * (W / 2 - W * 0.05), y(0.2), wr, W * 0.11); tw(a, cx + s * (W / 2 - W * 0.05), y(0.8), wr, W * 0.11); }
      a.rect(cx - W * 0.46, y(0), cx + W * 0.46, YB); a.log('Added the bonnet, body, windscreen, window row, door, bumpers and wheels (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ dolls and playsets
/** a seated plush animal facing -Y; o: head, ear ('round'|'long'|'floppy'|'elephant'), snout, tail, trunk */
function plush(a, o) {
  const { cx, cy, Z0, Z1, W } = a, s = a.H / (o.ear === 'long' ? 140 : 105);
  const bz = Z0 + 34 * s, hz = Z0 + 78 * s, by = cy + 4 * s, hy = cy - 4 * s;
  a.ell(cx, by, bz, W * 0.3, a.D * 0.3, 30 * s, 16, 9); a.ell(cx, hy, hz, W * 0.24, a.D * 0.23, 20 * s, 16, 9);
  a.circ(cx, by, W * 0.3, 'EQUIP-DETAIL');
  for (const sx of [-1, 1]) {
    const lx = cx + sx * W * 0.2;
    a.tube([[lx, by - 4 * s, Z0 + 18 * s], [lx, a.YF + a.D * 0.18, Z0 + 12 * s]], [W * 0.1, W * 0.085], 10); a.ell(lx, a.YF + a.D * 0.16, Z0 + 12 * s, W * 0.095, 9 * s, 10 * s, 10, 6);
    a.tube([[cx + sx * W * 0.28, by, bz + 16 * s], [cx + sx * W * 0.36, a.YF + a.D * 0.3, bz - 4 * s]], [W * 0.075, W * 0.06], 8);
    a.circ(lx, a.YF + a.D * 0.16, W * 0.09, 'EQUIP-DETAIL');
  }
  const eh = o.ear;
  for (const sx of [-1, 1]) {
    const ex = cx + sx * W * (eh === 'elephant' ? 0.3 : 0.17);
    if (eh === 'round') a.ell(ex, hy + 3 * s, hz + 18 * s, W * 0.07, 6 * s, 8 * s, 10, 6);
    else if (eh === 'long') a.ell(ex * 0.6 + cx * 0.4, hy + 2 * s, hz + 34 * s, W * 0.045, 5 * s, 20 * s, 10, 6);
    else if (eh === 'floppy') a.ell(cx + sx * W * 0.27, hy, hz + 4 * s, W * 0.045, 6 * s, 14 * s, 10, 6);
    else a.ell(ex, hy + 3 * s, hz + 4 * s, W * 0.07, 4 * s, 20 * s, 12, 6);
  }
  const eyez = hz + 4 * s; for (const sx of [-1, 1]) sph(a, cx + sx * W * 0.1, a.YF + a.D * 0.3 + 2, eyez, 2.2 * s + 1, 8, 5);
  if (o.trunk) { a.tube([[cx, hy - a.D * 0.18, hz - 4 * s], [cx, a.YF + a.D * 0.1, hz - 14 * s], [cx, a.YF + a.D * 0.06, Z0 + 38 * s]], [W * 0.05, W * 0.04, W * 0.03], 10); }
  else { a.ell(cx, a.YF + a.D * 0.18, hz - 6 * s, W * 0.1, 7 * s, 7 * s, 10, 6); sph(a, cx, a.YF + a.D * 0.12, hz - 2 * s, 2.6 * s + 1, 8, 5); }
  if (o.tail) sph(a, cx, -7 * s, bz - 8 * s, 6 * s, 8, 5);
  a.outline('EQUIP-HIDDEN');
}
const dolls = [
  fam({ cat: 'toys/dolls', title: 'Generic rag doll',
    desc: (v) => `Soft rag doll, ${v.h} in tall: a round head with face dots, yarn hair with two bunches, a body in a flared dress with a collar, outstretched arms with hand mitts, short legs and rounded shoes.`,
    vs: [['12 in', 7, 3, 12, 0, {}], ['18 in', 10, 4, 18, 0, {}], ['24 in', 13, 5, 24, 0, {}]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W } = a, s = a.H / 100, hr = 15 * s;
      for (const sx of [-1, 1]) { a.tube([[cx + sx * 8 * s, cy, Z0 + 20 * s], [cx + sx * 9 * s, cy, Z0 + 4 * s]], [4.4 * s, 4.2 * s], 8); a.ell(cx + sx * 9 * s, cy - 3 * s, Z0 + 4 * s, 4.8 * s, 7 * s, 3.6 * s, 10, 5); a.circ(cx + sx * 9 * s, cy, 4 * s, 'EQUIP-DETAIL'); }
      lathe(a, cx, cy, Z0 + 18 * s, [[W * 0.36, 0], [W * 0.34, 4 * s], [W * 0.2, 24 * s], [W * 0.11, 36 * s]], 18); a.circ(cx, cy, W * 0.36);
      a.cone(cx, cy, Z0 + 54 * s, Z0 + 58 * s, W * 0.12, W * 0.14, 14);
      for (const sx of [-1, 1]) { a.tube([[cx + sx * W * 0.12, cy, Z0 + 52 * s], [cx + sx * W * 0.45, cy, Z0 + 55 * s]], [4.5 * s, 3.8 * s], 8); sph(a, cx + sx * W * 0.47, cy, Z0 + 55 * s, 4.6 * s, 8, 5); }
      sph(a, cx, cy, Z0 + 71 * s, hr, 16, 10); a.ell(cx, cy + 3 * s, Z0 + 76 * s, hr * 1.12, hr * 1.0, hr * 0.85, 14, 7);
      for (const sx of [-1, 1]) { a.tube([[cx + sx * hr * 0.9, cy, Z0 + 76 * s], [cx + sx * hr * 1.15, cy, Z0 + 60 * s]], [3.4 * s, 2.8 * s], 8); sph(a, cx + sx * hr * 1.15, cy, Z0 + 59 * s, 3.6 * s, 8, 5); sph(a, cx + sx * hr * 0.35, a.YF + a.D * 0.5 - hr * 0.9, Z0 + 71 * s, 1.5 * s + 0.8, 6, 4); }
      sph(a, cx, cy - hr * 0.95, Z0 + 68 * s, 1.8 * s + 0.6, 6, 4); a.circ(cx, cy, hr, 'EQUIP-DETAIL'); a.log('Added the head with yarn hair, flared dress, arms, legs and shoes (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic teddy bear',
    desc: (v) => `Seated teddy bear, ${v.h} in tall: a round body and head, two round ears, a muzzle with a nose, eye beads, arms and legs with foot pads${v.bow ? ' and a bow tie' : ''}.`,
    vs: [['8 in', 6, 5, 8, 0, {}], ['14 in with bow tie', 10, 8, 14, 0, { bow: true }], ['24 in', 16, 13, 24, 0, {}]],
    build: (a, v) => {
      plush(a, { ear: 'round', tail: true });
      if (v.bow) { const s = a.H / 100, z = a.Z0 + 66 * s; for (const sx of [-1, 1]) a.cone(a.cx + sx * 4 * s, a.YF + a.D * 0.3, z, z + 0.01, 1, 1, 3), a.ell(a.cx + sx * 6 * s, a.YF + a.D * 0.3, z, 6 * s, 3 * s, 4 * s, 8, 5); sph(a, a.cx, a.YF + a.D * 0.3, z, 2.4 * s, 8, 5); }
      a.log('Added the body, head, ears, muzzle, arms, legs and foot pads (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic plush animal',
    desc: (v) => `Seated soft toy ${v.kind}, ${v.h} in tall: a round body and head, ${v.kind === 'rabbit' ? 'two tall ears and a tail' : v.kind === 'elephant' ? 'two broad ears and a curled trunk' : 'floppy ears, a snout and a tail'}, eye beads and foot pads.`,
    vs: [['rabbit, 12 in', 7, 7, 12, 0, { kind: 'rabbit' }], ['elephant, 12 in', 9, 8, 12, 0, { kind: 'elephant' }], ['dog, 10 in', 7, 8, 10, 0, { kind: 'dog' }]],
    build: (a, v) => { plush(a, v.kind === 'rabbit' ? { ear: 'long', tail: true } : v.kind === 'elephant' ? { ear: 'elephant', trunk: true } : { ear: 'floppy', tail: true }); a.log('Added the body, head, ears, limbs and features (plan and 3D).'); } }),
  fam({ cat: 'toys/dolls', title: 'Generic open-front dollhouse',
    desc: (v) => `Dollhouse, ${v.stories} stor${v.stories > 1 ? 'ies' : 'y'}, open at the front: a base, back and side walls with window frames, ${v.stories} floor${v.stories > 1 ? 's' : ''}, ${v.rooms} rooms with a doorway wall, a front door, a stair, a gabled roof and ${v.chim} chimney${v.chim > 1 ? 's' : ''}.`,
    vs: [['cottage, 1 storey', 20, 12, 20, 0, { stories: 1, rooms: 2, chim: 1 }], ['2 storey, 26 in wide', 26, 14, 32, 0, { stories: 2, rooms: 4, chim: 1 }], ['3 storey, 30 in wide', 30, 16, 42, 0, { stories: 3, rooms: 6, chim: 1 }], ['mansion with attic, 40 in wide', 40, 18, 38, 0, { stories: 2, rooms: 6, chim: 2, attic: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, W } = a, t = 14, base = 30, roofH = a.H * (v.stories === 1 ? 0.28 : 0.2), wallTop = Z1 - roofH, sh = (wallTop - Z0 - base) / v.stories;
      a.outline(); a.box(X0, YF, Z0, X1, 0, Z0 + base); a.box(X0, -t, Z0 + base, X1, 0, wallTop); a.box(X0, YF + 20, Z0 + base, X0 + t, 0, wallTop); a.box(X1 - t, YF + 20, Z0 + base, X1, 0, wallTop);
      for (let f = 0; f <= v.stories; f++) { const z = Z0 + base + f * sh; if (f > 0) a.box(X0, YF + 20, z - t * 0.6, X1, -t, z + t * 0.4); }
      const nr = v.rooms / v.stories;
      for (let f = 0; f < v.stories; f++) {
        const z0 = Z0 + base + f * sh + t * 0.4, z1 = Z0 + base + (f + 1) * sh - t * 0.6;
        for (let k = 1; k < nr; k++) { const x = X0 + t + (k * (W - 2 * t)) / nr; a.box(x - 5, YF + 20 + (a.D - 20) * 0.3, z0, x + 5, -t, z1); a.box(x - 5, YF + 20, z0 + (z1 - z0) * 0.78, x + 5, YF + 20 + (a.D - 20) * 0.3, z1); a.line(x, YF + 20, x, -t, 'EQUIP-DETAIL'); }
        for (let k = 0; k < nr; k++) { const x0 = X0 + t + (k * (W - 2 * t)) / nr, x1 = X0 + t + ((k + 1) * (W - 2 * t)) / nr, mx = (x0 + x1) / 2, ww = m.min((x1 - x0) * 0.3, 140); a.frame(mx - ww / 2, z0 + (z1 - z0) * 0.35, mx + ww / 2, z0 + (z1 - z0) * 0.8, -t - 6, -t, 8); a.box(mx - 3, -t - 6, z0 + (z1 - z0) * 0.35, mx + 3, -t, z0 + (z1 - z0) * 0.8); if (f === 0 && k === 0) { a.frame(x0 + 30, z0, x0 + 30 + ww * 0.8, z0 + (z1 - z0) * 0.7, -t - 8, -t, 8); } }
      }
      for (let i = 0; i < 6; i++) a.box(X1 - t - 220 + i * 28, YF + 40, Z0 + base + i * (sh / 7), X1 - t - 190 + i * 28 + 2, YF + 40 + 130, Z0 + base + (i + 1) * (sh / 7) + 0);
      prismY(a, [[X0 - 6, wallTop], [X1 + 6, wallTop], [cx, Z1]], -t - 2, 0 - 0.01); a.box(X0 - 6, YF, wallTop, X0, 0, wallTop + 14);
      for (const s of [-1, 1]) prismY(a, [[cx + s * (W / 2 + 14), wallTop - 6], [cx + s * 0, Z1 + 0.01 - 0.01], [cx + s * 0, Z1 - 12], [cx + s * (W / 2 + 14), wallTop - 18]], YF + 20, -4);
      a.box(X0 - 12, YF + 14, wallTop - 14, X0 + 6, -4, wallTop - 2); a.box(X1 - 6, YF + 14, wallTop - 14, X1 + 12 > X1 ? X1 : X1, -4, wallTop - 2);
      for (let i = 0; i < v.chim; i++) { const x = cx + (v.chim === 1 ? W * 0.28 : (i ? 1 : -1) * W * 0.3); a.box(x - 25, -t - 40, Z1 - roofH * 0.75, x + 25, -t, Z1 - 2); }
      if (v.attic) a.frame(cx - 80, wallTop + 10, cx + 80, wallTop + roofH * 0.6, -t - 6, -t, 8);
      a.rect(X0 + t, YF + 20, X1 - t, -t, 'EQUIP-DETAIL'); a.log('Added the base, walls, floors, room partitions, windows, door, stair, gabled roof and chimney (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic peg doll set',
    desc: (v) => `${v.n} wooden peg figures standing on bases: each a tapered turned body, a round head and a hat or hair cap, in two heights (adult and child).`,
    vs: [['pair, 3 in', 3, 1.6, 3.2, 0, { n: 2 }], ['family of four, 3 in', 6, 1.6, 3.2, 0, { n: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, cx, cy } = a;
      for (let i = 0; i < v.n; i++) {
        const child = i >= 2 || (v.n === 2 && false), hh = child ? a.H * 0.72 : a.H, x = X0 + (i + 0.5) * (a.W / v.n), r = child ? 18 : 22, bh = hh * 0.62;
        lathe(a, x, cy, Z0, [[r * 0.8, 0], [r, 4], [r * 0.78, bh * 0.4], [r * 0.5, bh]], 14); sph(a, x, cy, Z0 + bh + r * 0.45, r * 0.52, 12, 8);
        if (i % 2) { a.cone(x, cy, Z0 + hh - r * 0.9, Z0 + hh, r * 0.65, 1, 12); a.circ(x, cy, r * 0.65, 'EQUIP-DETAIL'); } else { a.ell(x, cy + 2, Z0 + hh - r * 0.35, r * 0.58, r * 0.5, r * 0.3, 10, 5); }
        sph(a, x, cy - r * 0.45, Z0 + bh + r * 0.4, 1.4, 6, 4); a.circ(x, cy, r);
      }
      a.outline('EQUIP-HIDDEN'); a.log('Added the turned bodies, heads, hats and bases (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic dollhouse furniture',
    desc: (v) => ({ bed: 'Dollhouse bed: a frame with a headboard and footboard, four turned legs, a mattress and a pillow.', sofa: 'Dollhouse sofa: a base, a back, two arms and two seat cushions.', dining: 'Dollhouse dining set: a table on four legs and two chairs with backs.', wardrobe: 'Dollhouse wardrobe: a two-door cabinet with knobs, a cornice, a plinth and a drawer.' })[v.kind],
    vs: [['bed, 1:12 scale', 4.5, 6.5, 4.5, 0, { kind: 'bed' }], ['sofa, 1:12 scale', 7, 3.3, 3.2, 0, { kind: 'sofa' }], ['dining table and two chairs, 1:12 scale', 6, 4.5, 3.4, 0, { kind: 'dining' }], ['wardrobe, 1:12 scale', 3.5, 1.6, 6.8, 0, { kind: 'wardrobe' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W } = a;
      a.outline();
      if (v.kind === 'bed') { a.box(X0, YF, Z0 + 20, X1, 0, Z0 + 20 + 14); a.box(X0 + 6, YF + 6, Z0 + 34, X1 - 6, -10, Z0 + 56); a.box(X0, -10, Z0 + 6, X1, 0, Z1); a.box(X0, YF, Z0 + 6, X1, YF + 8, Z0 + 56 + 6); for (const [x, y] of [[X0 + 6, YF + 6], [X1 - 6, YF + 6]]) a.cyl(x, y, Z0, Z0 + 20, 5, 8); for (const x of [X0 + 6, X1 - 6]) a.cyl(x, -5, Z0, Z0 + 20, 5, 8); a.ell(cx, -40, Z0 + 62, W * 0.34, 20, 8, 12, 5); }
      if (v.kind === 'sofa') { a.box(X0, YF + 12, Z0 + 14, X1, 0, Z0 + 38); a.box(X0, -22, Z0 + 38, X1, 0, Z1); for (const s of [-1, 1]) a.box(s > 0 ? X1 - 18 : X0, YF + 6, Z0 + 14, s > 0 ? X1 : X0 + 18, 0, Z0 + 56); for (const s of [-1, 1]) { a.box(cx + s * W * 0.22 - W * 0.19, YF + 14, Z0 + 38, cx + s * W * 0.22 + W * 0.19, -22, Z0 + 52); } for (const x of [X0 + 8, X1 - 8]) for (const y of [YF + 10, -8]) a.cyl(x, y, Z0, Z0 + 14, 4, 6); }
      if (v.kind === 'dining') { const ty = a.cy; a.box(cx - W * 0.28, ty - 40, Z0 + 56, cx + W * 0.28, ty + 40, Z0 + 62); for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.cyl(cx + sx * (W * 0.28 - 8), ty + sy * 32, Z0, Z0 + 56, 3.5, 6); for (const sy of [-1, 1]) { const y = ty + sy * 62; a.box(cx - 20, y - 14, Z0 + 36, cx + 20, y + 14, Z0 + 40); for (const sx of [-1, 1]) for (const yy of [-12, 12]) a.cyl(cx + sx * 16, y + yy, Z0, Z0 + 36, 2.6, 6); a.box(cx - 20, y + (sy > 0 ? 12 : -14), Z0 + 40, cx + 20, y + (sy > 0 ? 14 : -12), Z1 - 4); } }
      if (v.kind === 'wardrobe') { a.box(X0 + 4, YF + 4, Z0 + 8, X1 - 4, 0, Z1 - 12); a.box(X0, YF, Z0, X1, 0, Z0 + 8); a.box(X0, YF, Z1 - 12, X1, 0, Z1); a.box(X0 + 8, YF - 2, Z0 + 16, cx - 2, YF + 4, Z1 - 30); a.box(cx + 2, YF - 2, Z0 + 16, X1 - 8, YF + 4, Z1 - 30); a.box(X0 + 8, YF - 2, Z1 - 26, X1 - 8, YF + 4, Z1 - 16); sph(a, cx - 10, YF - 4, Z0 + 80, 3, 6, 4); sph(a, cx + 10, YF - 4, Z0 + 80, 3, 6, 4); }
      a.log('Added the ' + v.kind + ' parts (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic puppet theatre',
    desc: (v) => `${v.floor ? 'Floor-standing' : 'Tabletop'} puppet theatre: a frame with a proscenium opening, a valance, two gathered side curtains, a backdrop panel and a ledge${v.floor ? ', on two side frames with a cross brace' : ''}.`,
    vs: [['tabletop, 24 in', 24, 12, 26, 0, { floor: false }], ['floor standing, 48 in', 48, 24, 66, 0, { floor: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, W } = a, t = 14, st = v.floor ? 640 : 0, fz = Z0 + st;
      a.outline();
      if (v.floor) { for (const x of [X0 + 20, X1 - 20]) { a.box(x - 20, YF + 40, Z0, x + 20, YF + 80, fz + 40); a.box(x - 20, -80, Z0, x + 20, -40, fz + 40); a.box(x - 20, YF + 20, Z0, x + 20, 0, Z0 + 30); } a.box(X0 + 20, -60, Z0 + 300, X1 - 20, -50, Z0 + 330); a.box(X0, YF + 20, fz, X1, 0, fz + 18); }
      a.box(X0 + 8, -t, fz + 18, X1 - 8, 0, Z1 - 70); a.frame(X0, fz + 18, X1, Z1, YF + a.D * 0.55, YF + a.D * 0.55 + t, a.W * 0.16);
      a.box(X0, YF + a.D * 0.55, Z1 - 120, X1, YF + a.D * 0.55 + t, Z1); for (let i = 0; i < 9; i++) a.cyl(X0 + 10 + i * (W - 20) / 8, YF + a.D * 0.55 - 6, Z1 - 120, Z1 - 70, W * 0.03, 8);
      for (const s of [-1, 1]) for (let i = 0; i < 4; i++) a.cyl(cx + s * (W * 0.34 + i * -W * 0.04) - (s * 0), YF + a.D * 0.55 - 14, fz + 40, Z1 - 120, W * 0.025, 8);
      a.box(X0 + W * 0.08, YF + a.D * 0.55 + t, fz + 18, X1 - W * 0.08, YF + a.D * 0.55 + t + 6, fz + 40);
      a.box(X0, YF + 4, fz + 18, X1, YF + a.D * 0.55 - 20, fz + 30); a.rect(X0 + W * 0.16, YF + a.D * 0.55, X1 - W * 0.16, YF + a.D * 0.55 + t, 'EQUIP-DETAIL'); a.log('Added the frame, proscenium, valance, gathered curtains, backdrop and ledge (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic toy robot',
    desc: (v) => `Boxy toy robot, ${v.h} in tall: a head with an antenna, eye lamps and a grille, a chest panel with dials and buttons, jointed arms with pincer hands and block legs with wide feet.`,
    vs: [['8 in', 4, 3, 8, 0, {}], ['14 in', 7, 5, 14, 0, {}]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W } = a, s = a.H / 100, yF = a.YF;
      a.outline('EQUIP-HIDDEN');
      for (const sx of [-1, 1]) { a.box(cx + sx * W * 0.17 - W * 0.09, cy - a.D * 0.2, Z0, cx + sx * W * 0.17 + W * 0.09, cy + a.D * 0.2, Z0 + 5 * s); a.box(cx + sx * W * 0.17 - W * 0.07, cy - a.D * 0.12, Z0 + 5 * s, cx + sx * W * 0.17 + W * 0.07, cy + a.D * 0.12, Z0 + 32 * s); a.rect(cx + sx * W * 0.17 - W * 0.09, cy - a.D * 0.2, cx + sx * W * 0.17 + W * 0.09, cy + a.D * 0.2); }
      a.box(cx - W * 0.28, cy - a.D * 0.3, Z0 + 32 * s, cx + W * 0.28, cy + a.D * 0.3, Z0 + 66 * s); a.box(cx - W * 0.3, cy - a.D * 0.32, Z0 + 32 * s, cx + W * 0.3, cy + a.D * 0.32, Z0 + 36 * s);
      for (let i = 0; i < 3; i++) { sph(a, cx - W * 0.15 + i * W * 0.15, yF + a.D * 0.18 - 1, Z0 + 58 * s, 2.6 * s + 1, 8, 5); a.box(cx - W * 0.2 + i * W * 0.14 + 1, yF + a.D * 0.19, Z0 + 44 * s, cx - W * 0.2 + i * W * 0.14 + W * 0.1, yF + a.D * 0.2 + 2, Z0 + 50 * s); }
      a.box(cx - W * 0.18, yF + a.D * 0.18, Z0 + 38 * s, cx + W * 0.18, yF + a.D * 0.19 + 2, Z0 + 42 * s);
      for (const sx of [-1, 1]) { const ax = cx + sx * W * 0.4; a.box(cx + sx * W * 0.28, cy - 4, Z0 + 56 * s, ax - sx * 0.1, cy + 4, Z0 + 62 * s); a.tube([[ax, cy, Z0 + 62 * s], [ax + sx * W * 0.04, cy, Z0 + 30 * s]], [3.2 * s, 3.2 * s], 8); sph(a, ax, cy, Z0 + 62 * s, 4.4 * s, 8, 5); a.box(ax + sx * W * 0.04 - 4 * s, cy - 2 * s, Z0 + 24 * s, ax + sx * W * 0.04 + 4 * s, cy + 2 * s, Z0 + 28 * s); }
      a.box(cx - W * 0.2, cy - a.D * 0.22, Z0 + 66 * s, cx + W * 0.2, cy + a.D * 0.22, Z1 - 12 * s); for (const sx of [-1, 1]) { sph(a, cx + sx * W * 0.1, yF + a.D * 0.28 - 1, Z0 + 80 * s, 3 * s + 1, 8, 5); } a.box(cx - W * 0.1, yF + a.D * 0.28, Z0 + 71 * s, cx + W * 0.1, yF + a.D * 0.285 + 2, Z0 + 74 * s);
      a.cyl(cx, cy, Z1 - 12 * s, Z1 - 3 * s, 1.5, 6); sph(a, cx, cy, Z1 - 2 * s, 2.6 * s + 0.8, 8, 5); a.log('Added the head, antenna, chest dials, jointed arms with pincers, legs and feet (plan and 3D).');
    } }),
  fam({ cat: 'toys/dolls', title: 'Generic doll cradle with baby doll',
    desc: (v) => `Rocking cradle for a ${v.len} in doll: two curved rockers, a flared basket with slatted sides, a half hood at the head end, a mattress, and a swaddled baby doll with a head and cap lying in it.`,
    vs: [['18 in', 11, 18, 14, 0, {}], ['24 in', 14, 24, 18, 0, {}]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, y = (f) => YF + f * L;
      a.outline('EQUIP-HIDDEN');
      for (const s of [-1, 1]) { const pts = []; for (let i = 0; i <= 14; i++) { const t = -0.55 + (1.1 * i) / 14; pts.push([cx + s * W * 0.34, y(0.5) + t * L * 0.9, Z0 + 18 + (1 - m.cos(t * 1.5)) * -0 + (m.cos(t * 1.9) - 1) * L * -0.12 * 0 + (t * t) * L * 0.24]); } a.tube(pts, pts.map(() => 11), 8); a.line(cx + s * W * 0.34, YF, cx + s * W * 0.34, YB, 'EQUIP-DETAIL'); a.tube([[cx + s * W * 0.34, y(0.26), Z0 + 40], [cx + s * W * 0.4, y(0.28), Z0 + a.H * 0.35]], [8, 8], 6); a.tube([[cx + s * W * 0.34, y(0.78), Z0 + 40], [cx + s * W * 0.4, y(0.76), Z0 + a.H * 0.35]], [8, 8], 6); }
      const bz = Z0 + a.H * 0.34; prismY(a, [[cx - W * 0.4, bz + a.H * 0.34], [cx + W * 0.4, bz + a.H * 0.34], [cx + W * 0.32, bz], [cx - W * 0.32, bz]], y(0.14), y(0.9));
      a.box(cx - W * 0.4, y(0.14), bz + a.H * 0.3, cx + W * 0.4, y(0.9), bz + a.H * 0.34); a.box(cx - W * 0.3, y(0.18), bz + a.H * 0.18, cx + W * 0.3, y(0.86), bz + a.H * 0.2);
      a.box(cx - W * 0.4, y(0.14), bz + a.H * 0.3 - 0.01, cx - W * 0.4 + 6, y(0.9), bz + a.H * 0.34 + 0.01);
      for (let i = 0; i < 8; i++) for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 3 - 0, y(0.18 + i * 0.1), bz + a.H * 0.04, cx + s * W * 0.4 + 3, y(0.18 + i * 0.1) + 8, bz + a.H * 0.3);
      for (const i of [0, 1, 2, 3]) a.box(cx - W * 0.4, y(0.2 + i * 0.2), bz + a.H * 0.04, cx + W * 0.4, y(0.2 + i * 0.2) + 4, bz + a.H * 0.08);
      a.ell(cx, y(0.55), bz + a.H * 0.28, W * 0.18, L * 0.22, a.H * 0.1, 12, 6); sph(a, cx, y(0.2), bz + a.H * 0.3, W * 0.12, 12, 8); a.ell(cx, y(0.2), bz + a.H * 0.36, W * 0.125, L * 0.05, W * 0.06, 10, 5);
      a.ell(cx, y(0.14) + 10, bz + a.H * 0.36, W * 0.4, 12, a.H * 0.3, 14, 6);
      a.log('Added the rockers, basket with slats, hood, mattress and the baby doll (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ games and ride-ons
const games = [
  fam({ cat: 'toys/games', title: 'Generic rocking horse',
    desc: (v) => `Child's rocking horse, ${v.len} in long: two curved rockers, a barrel body, four tapered legs braced to the rockers, a neck with mane, a head with ears and muzzle, a saddle and two handles${v.tail ? ', and a tail' : ''}.`.replace("Child's rocking horse", 'Rocking horse'),
    vs: [['small, 32 in', 14, 32, 24, 0, { tail: true }], ['medium, 40 in', 16, 40, 30, 0, { tail: true }], ['large, 52 in', 18, 52, 38, 0, { tail: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, y = (f) => YF + f * L, rz = Z0 + 24, bz = Z0 + a.H * 0.5, S = a.H / 100;
      a.outline('EQUIP-HIDDEN');
      for (const s of [-1, 1]) { const x = cx + s * W * 0.3, pts = []; for (let i = 0; i <= 16; i++) { const t = -1 + (2 * i) / 16; pts.push([x, y(0.5) + t * L * 0.48, Z0 + 14 + t * t * a.H * 0.12]); } a.tube(pts, pts.map(() => 14), 8); a.line(x, YF, x, YB, 'EQUIP-DETAIL');
        for (const f of [0.34, 0.66]) { const yy = y(f); const zr = Z0 + 14 + (((f - 0.5) * 2) ** 2) * a.H * 0.12; a.tube([[x, yy + (f < 0.5 ? -8 : 8), zr], [cx + s * W * 0.14, yy + (f < 0.5 ? 14 : -14) * 0 + (f < 0.5 ? -20 : 20), bz - 6 * S]], [12, 10], 8); a.circ(x, yy, 12, 'EQUIP-HIDDEN'); }
        a.tube([[x, y(0.34), Z0 + 30], [x, y(0.66), Z0 + 30]], [8, 8], 6); }
      a.ell(cx, y(0.5), bz + 8 * S, W * 0.26, L * 0.26, 14 * S, 14, 8); a.ell(cx, y(0.5), bz + 24 * S, W * 0.18, L * 0.22, 6 * S, 12, 6);
      a.tube([[cx, y(0.3), bz + 22 * S], [cx, y(0.18), bz + 40 * S], [cx, y(0.14), Z1 - 14 * S]], [W * 0.1, W * 0.085, W * 0.07], 10);
      a.ell(cx, y(0.08), Z1 - 18 * S, W * 0.1, L * 0.09, 11 * S, 12, 7); a.ell(cx, y(0.02), Z1 - 22 * S, W * 0.08, L * 0.05, 8 * S, 10, 6);
      for (const s of [-1, 1]) a.ell(cx + s * W * 0.07, y(0.13), Z1 - 4 * S, W * 0.025, 5, 9 * S, 8, 5);
      for (let i = 0; i < 4; i++) sph(a, cx, y(0.26 - i * 0.045), bz + (34 + i * 3) * S, 4.5 * S, 8, 5);
      for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.08, y(0.22), bz + 40 * S], [cx + s * W * 0.36, y(0.22), bz + 40 * S]], [4, 4], 6); a.ycyl(y(0.22) - 25, y(0.22) + 25, cx + s * W * 0.36, bz + 40 * S, 6, 8); }
      if (v.tail) a.tube([[cx, YB - 14, bz + 16 * S], [cx, YB - 4, bz - 6 * S]], [7, 5], 8);
      a.log('Added the rockers, legs, body, neck with mane, head, saddle and handles' + (v.tail ? ', tail' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic toddler tricycle',
    desc: (v) => `Toddler tricycle for a ${v.age}: a big front wheel with fork, pedals and cranks, a handlebar with grips, a frame tube, a moulded seat and two small rear wheels on an axle${v.push ? ', with a rear push handle' : ''}.`,
    vs: [['age 2, 20 in', 16, 28, 22, 0, { age: '2 year old', fr: 7, push: true }], ['age 3, 26 in', 18, 32, 26, 0, { age: '3 year old', fr: 8, push: false }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, y = (f) => YF + f * L, fr = v.fr * IN, rr = fr * 0.5;
      a.outline('EQUIP-HIDDEN');
      vring(a, cx - 15, y(0.12), Z0 + fr * 0, fr * 0, 1, 4, 3);
      a.xcyl(cx - 14, cx + 14, y(0.14), Z0 + fr, fr * 0.97, 18); a.xcyl(cx - 26, cx + 26, y(0.14), Z0 + fr, fr * 0.2, 10); a.rect(cx - 14, y(0.14) - fr, cx + 14, y(0.14) + fr, 'EQUIP-DETAIL');
      for (const s of [-1, 1]) { a.tube([[cx + s * 30, y(0.14), Z0 + fr], [cx + s * 30, y(0.2), Z0 + fr * 1.7]], [8, 8], 6); a.tube([[cx + s * 40, y(0.14) + 0, Z0 + fr + 30], [cx + s * 40, y(0.14) + 80, Z0 + fr * 0.4]], [7, 7], 6); a.box(cx + s * 40 - 18, y(0.14) + 70, Z0 + fr * 0.4 - 8, cx + s * 40 + 18, y(0.14) + 150, Z0 + fr * 0.4); }
      a.tube([[cx, y(0.2), Z0 + fr * 1.7], [cx, y(0.2), Z1 - 10 * IN * 0.3]].map(([x, yy, z]) => [x, yy, m.min(z, Z1 - 30)]), [12, 12], 8);
      a.tube([[cx - W * 0.32, y(0.2), Z1 - 20], [cx + W * 0.32, y(0.2), Z1 - 20]], [7, 7], 6); for (const s of [-1, 1]) a.ycyl(y(0.2) - 20, y(0.2) + 40, cx + s * W * 0.34, Z1 - 20, 11, 8);
      a.tube([[cx, y(0.22), Z0 + fr * 1.6], [cx, y(0.7), Z0 + fr * 1.4]], [13, 13], 8);
      a.box(cx - W * 0.22, y(0.58), Z0 + fr * 1.5, cx + W * 0.22, y(0.86), Z0 + fr * 1.5 + 26); a.box(cx - W * 0.2, y(0.82), Z0 + fr * 1.5 + 26, cx + W * 0.2, y(0.88), Z0 + fr * 1.5 + 120);
      a.xcyl(cx - W * 0.36, cx + W * 0.36, y(0.88), Z0 + rr, 5, 8); for (const s of [-1, 1]) a.xcyl(cx + s * W * 0.36 - 15, cx + s * W * 0.36 + 15, y(0.88), Z0 + rr, rr, 16);
      a.tube([[cx, y(0.7), Z0 + fr * 1.4], [cx, y(0.88), Z0 + rr]], [10, 10], 8);
      if (v.push) { a.tube([[cx, y(0.88), Z0 + fr * 1.5], [cx, YB - 8, Z1 - 120]], [8, 8], 6); a.tube([[cx - 50, YB - 8, Z1 - 120], [cx + 50, YB - 8, Z1 - 120]], [8, 8], 6); }
      a.circ(cx, y(0.14), 14, 'EQUIP-DETAIL'); a.log('Added the front wheel and fork, pedals, handlebar, frame, seat and rear wheels (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic kick scooter for children',
    desc: (v) => `Two-wheel kick scooter for children: a deck with grip strips, a front fork and a steering column with ${v.fold ? 'a fold clamp and ' : ''}a T-bar with grips, a rear fender brake and two wheels.`,
    vs: [['small, 26 in bar', 9, 26, 26, 0, { fold: false, r: 3 }], ['large, 34 in bar, folding', 12, 34, 34, 0, { fold: true, r: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, y = (f) => YF + f * L, r = v.r * IN * 0.5 * 1.0, dz = Z0 + r * 1.6;
      a.outline('EQUIP-HIDDEN');
      a.box(cx - W * 0.28, y(0.3), dz, cx + W * 0.28, y(0.9), dz + 22); for (let i = 0; i < 5; i++) a.box(cx - W * 0.24, y(0.34 + i * 0.1), dz + 22, cx + W * 0.24, y(0.34 + i * 0.1) + 14, dz + 25); a.rect(cx - W * 0.28, y(0.3), cx + W * 0.28, y(0.9), 'EQUIP-DETAIL');
      a.xcyl(cx - W * 0.3, cx + W * 0.3, y(0.1), Z0 + r, 4, 8); for (const s of [-1, 1]) { a.xcyl(cx + s * W * 0.26 - 9, cx + s * W * 0.26 + 9, y(0.1), Z0 + r, r, 16); a.xcyl(cx + s * W * 0.26 - 10, cx + s * W * 0.26 + 10, y(0.1), Z0 + r, r * 0.5, 8); a.rect(cx + s * W * 0.26 - 9, y(0.1) - r, cx + s * W * 0.26 + 9, y(0.1) + r, 'EQUIP-DETAIL'); a.tube([[cx + s * W * 0.26, y(0.1), Z0 + r], [cx + s * W * 0.1, y(0.18), Z0 + r * 2.5]], [5, 5], 6); }
      a.xcyl(cx - W * 0.1, cx + W * 0.1, y(0.18), Z0 + r * 2.5, 9, 8); a.tube([[cx, y(0.18), Z0 + r * 2.5], [cx, y(0.16), Z1 - 30]], [11, 10], 10);
      if (v.fold) a.cyl(cx, y(0.17), Z0 + a.H * 0.45, Z0 + a.H * 0.45 + 70, 17, 10);
      a.tube([[cx - W * 0.42, y(0.15), Z1 - 20], [cx + W * 0.42, y(0.15), Z1 - 20]], [10, 10], 8); for (const s of [-1, 1]) a.ycyl(y(0.15) - 20, y(0.15) + 20, cx + s * W * 0.42, Z1 - 20, 14, 8);
      for (const s of [-1, 1]) { a.xcyl(cx + s * W * 0.05 - 6, cx + s * W * 0.05 + 6, y(0.97), Z0 + r * 0.9, r, 16); a.rect(cx + s * W * 0.05 - 6, y(0.97) - r, cx + s * W * 0.05 + 6, y(0.97) + r, 'EQUIP-DETAIL'); }
      prismX(a, [[y(0.88), dz + 14], [y(0.98), dz + 40], [y(0.98), dz + 46], [y(0.86), dz + 26]], cx - W * 0.2, cx + W * 0.2);
      a.log('Added the deck, wheels, fork, steering column' + (v.fold ? ' with fold clamp' : '') + ', T-bar and rear brake (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic balance bike for toddlers',
    desc: () => 'Pedal-free toddler balance bike: two spoked wheels, a low frame tube, a fork with a handlebar and grips, a padded saddle on a post and foot rests.',
    vs: [['12 in wheels', 14, 33, 22, 0, {}]],
    build: (a) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, y = (f) => YF + f * L, r = 6 * IN;
      a.outline('EQUIP-HIDDEN');
      for (const f of [0.15, 0.85]) { a.xcyl(cx - 12, cx + 12, y(f), Z0 + r, r, 18); a.xcyl(cx - 22, cx + 22, y(f), Z0 + r, 24, 10); a.rect(cx - 12, y(f) - r, cx + 12, y(f) + r, 'EQUIP-DETAIL'); }
      for (const s of [-1, 1]) a.tube([[cx + s * 20, y(0.15), Z0 + r], [cx + s * 10, y(0.2), Z0 + r * 2.2]], [5, 5], 6);
      a.tube([[cx, y(0.2), Z0 + r * 2.2], [cx, y(0.22), Z1 - 40]], [11, 10], 8); a.tube([[cx - W * 0.4, y(0.22), Z1 - 30], [cx + W * 0.4, y(0.22), Z1 - 30]], [8, 8], 6); for (const s of [-1, 1]) a.ycyl(y(0.22) - 25, y(0.22) + 25, cx + s * W * 0.4, Z1 - 30, 12, 8);
      a.tube([[cx, y(0.22), Z0 + r * 2], [cx, y(0.6), Z0 + r * 1.6], [cx, y(0.85), Z0 + r]], [14, 13, 11], 8);
      a.tube([[cx, y(0.6), Z0 + r * 1.6], [cx, y(0.62), Z0 + r * 2.7]], [10, 10], 8); a.ell(cx, y(0.64), Z0 + r * 2.8, W * 0.2, L * 0.1, 22, 12, 6);
      for (const s of [-1, 1]) a.box(cx + s * 40 - 18, y(0.46), Z0 + r * 0.7, cx + s * 40 + 18, y(0.56), Z0 + r * 0.7 + 12);
      a.log('Added the two wheels, fork, handlebar, frame, saddle and foot rests (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic table football table',
    desc: (v) => `Table football (foosball) table, ${v.w} in long: a playing box with end walls and two goal openings, ${v.rods} rods through the sides with handles, turned players on each rod, a ball return and four legs with levelling feet.`,
    vs: [['48 in, 8 rods', 48, 26, 34, 0, { rods: 8 }], ['56 in, 8 rods', 56, 30, 35, 0, { rods: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, pz = Z0 + a.H * 0.58, top = pz + a.H * 0.17;
      a.outline(); a.box(X0 + 20, YF + 60, pz, X1 - 20, -60, pz + 18);
      a.box(X0 + 10, YF + 40, pz - 80, X1 - 10, -40, pz); a.box(X0 + 10, YF + 40, pz + 18, X1 - 10, YF + 70, top); a.box(X0 + 10, -70, pz + 18, X1 - 10, -40, top);
      for (const s of [-1, 1]) { a.box(s > 0 ? X1 - 40 : X0 + 10, YF + 40, pz + 18, s > 0 ? X1 - 10 : X0 + 40, -40, top); a.cyl(s > 0 ? X1 - 50 : X0 + 50, cy, pz + 40, pz + 41, 0.01, 3); }
      for (const [x, y] of [[X0 + 50, YF + 60], [X1 - 50, YF + 60], [X0 + 50, -60], [X1 - 50, -60]]) { a.tube([[x, y, Z0 + 14], [x, y, pz - 70]], [34, 30], 10); a.cyl(x, y, Z0, Z0 + 14, 38, 10); a.circ(x, y, 34, 'EQUIP-HIDDEN'); }
      a.box(X0 + 60, YF + 70, pz - 120, X1 - 60, -70, pz - 100);
      for (let i = 0; i < v.rods; i++) {
        const x = X0 + 120 + (i * (W - 240)) / (v.rods - 1), pl = [1, 2, 3, 2, 2, 3, 2, 1][i] ?? 2;
        a.ycyl(YF, -2, x, pz + 70, 9, 8);
        for (const [yy] of [[YF - 5]]) { a.ycyl(YF - 0, YF + 0.01, x, pz + 70, 9, 6); }
        for (let k = 0; k < pl; k++) { const y = cy + ((k - (pl - 1) / 2) * (a.D - 190)) / (pl + 0.4); a.box(x - 12, y - 14, pz + 20, x + 12, y + 14, pz + 70 + 40); sph(a, x, y, pz + 24, 14, 8, 5); a.line(x, y - 14, x, y + 14, 'EQUIP-DETAIL'); }
        a.ycyl(YF, YF + 55, x, pz + 70, 13, 8); a.ycyl(YF, YF + 4, x, pz + 70, 15, 8);
        a.line(x, YF + 70, x, -70, 'EQUIP-DETAIL');
      }
      sph(a, cx, cy, pz + 18 + 12, 12, 8, 5); a.rect(X0 + 40, YF + 70, X1 - 40, -70, 'EQUIP-DETAIL'); a.log('Added the playing box, goals, rods with handles and players, legs and feet (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic air hockey table',
    desc: (v) => `Air hockey table, ${v.w} in long: a surface with a raised rim, two goal slots, a centre line and centre circle, two mallets and a puck, a score counter box at each end and four legs with a stretcher.`,
    vs: [['tabletop, 40 in', 40, 20, 8, 0, { tabletop: true }], ['full size, 84 in', 84, 44, 32, 0, { tabletop: false }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, pz = v.tabletop ? Z0 + 60 : Z0 + a.H * 0.72, rim = 30, gw = a.D * 0.3;
      a.outline(); a.box(X0, YF, pz - 36, X1, 0, pz);
      a.box(X0, YF, pz, X1, YF + 26, pz + rim); a.box(X0, -26, pz, X1, 0, pz + rim);
      for (const s of [-1, 1]) { const xa = s > 0 ? X1 - 26 : X0, xb = s > 0 ? X1 : X0 + 26; a.box(xa, YF + 26, pz, xb, cy - gw / 2, pz + rim); a.box(xa, cy + gw / 2, pz, xb, -26, pz + rim); a.box(xa - (s > 0 ? 0 : 0), cy - gw / 2 - 4, pz, xb, cy - gw / 2, pz + rim + 8); }
      ring(a, cx, cy, pz + 2, a.D * 0.12, 2, 24, 4); a.line(cx, YF + 26, cx, -26, 'EQUIP-DETAIL'); a.circ(cx, cy, a.D * 0.12, 'EQUIP-DETAIL');
      for (const s of [-1, 1]) { const x = cx + s * W * 0.3; a.cyl(x, cy + s * 40, pz, pz + 34, 28, 14); a.cyl(x, cy + s * 40, pz + 34, pz + 52, 12, 10); a.circ(x, cy + s * 40, 28, 'EQUIP-DETAIL'); }
      a.cyl(cx, cy, pz, pz + 6, 20, 14); a.circ(cx, cy, 20, 'EQUIP-DETAIL');
      if (!v.tabletop) { for (const s of [-1, 1]) a.box(s > 0 ? X1 - 90 : X0 + 6, YF + 100, pz + rim, s > 0 ? X1 - 6 : X0 + 90, YF + 100 + 40, pz + rim + 160); for (const [x, y] of [[X0 + 70, YF + 70], [X1 - 70, YF + 70], [X0 + 70, -70], [X1 - 70, -70]]) { a.tube([[x, y, Z0 + 12], [x, y, pz - 36]], [34, 30], 10); a.cyl(x, y, Z0, Z0 + 12, 40, 10); a.circ(x, y, 34, 'EQUIP-HIDDEN'); } a.box(X0 + 70, YF + 60, Z0 + 150, X1 - 70, YF + 80, Z0 + 180); }
      else for (const [x, y] of [[X0 + 20, YF + 20], [X1 - 20, YF + 20], [X0 + 20, -20], [X1 - 20, -20]]) a.cyl(x, y, Z0, pz - 36, 18, 8);
      a.log('Added the surface with rim, goal slots, centre markings, mallets, puck' + (v.tabletop ? '' : ', score boxes') + ' and legs (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic draughts board and discs',
    desc: (v) => `Draughts (checkers) set: a ${v.w} in board with a frame and 32 dark squares raised in a chequer pattern, and 24 round playing discs set out on the first three rows each side.`,
    vs: [['12 in board', 13, 13, 1, 0, { n: 8 }], ['18 in board', 19, 19, 1.3, 0, { n: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, fr = a.W * 0.045, n = v.n, sq = (a.W - 2 * fr) / n, bt = a.H * 0.4;
      a.outline(); a.box(X0, YF, Z0, X1, 0, Z0 + bt);
      a.frame(X0, Z0 + bt * 0.6, X1, Z0 + bt, YF, YF + 0.01, 0.01); a.box(X0, YF, Z0 + bt, X0 + fr, 0, Z0 + bt + 2); a.box(X1 - fr, YF, Z0 + bt, X1, 0, Z0 + bt + 2); a.box(X0, YF, Z0 + bt, X1, YF + fr, Z0 + bt + 2); a.box(X0, -fr, Z0 + bt, X1, 0, Z0 + bt + 2);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if ((i + j) % 2) { a.box(X0 + fr + i * sq, YF + fr + j * sq, Z0 + bt, X0 + fr + (i + 1) * sq, YF + fr + (j + 1) * sq, Z0 + bt + 1.5); a.rect(X0 + fr + i * sq, YF + fr + j * sq, X0 + fr + (i + 1) * sq, YF + fr + (j + 1) * sq, 'EQUIP-DETAIL'); if (j < 3 || j > 4) { const x = X0 + fr + (i + 0.5) * sq, y = YF + fr + (j + 0.5) * sq; a.cyl(x, y, Z0 + bt + 1.5, Z1, sq * 0.36, 14); a.circ(x, y, sq * 0.36, 'EQUIP-DETAIL'); a.cyl(x, y, Z1 - 0.5, Z1 - 0.2, sq * 0.2, 10); } }
      a.log('Added the board, frame, dark squares and 24 discs (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic chess set on board',
    desc: () => 'Chess set: a 14 in board with frame and 32 raised dark squares and 32 turned pieces (pawns, rooks with crenellated tops, knights, bishops with slit crowns, queens and kings with crosses) in starting position.',
    vs: [['14 in board, 32 pieces', 15, 15, 3.5, 0, {}]],
    build: (a) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, fr = a.W * 0.04, sq = (a.W - 2 * fr) / 8, bt = 18, Z = Z0 + bt + 1.5;
      a.outline(); a.box(X0, YF, Z0, X1, 0, Z0 + bt); a.box(X0, YF, Z0 + bt, X1, YF + fr, Z0 + bt + 3); a.box(X0, -fr, Z0 + bt, X1, 0, Z0 + bt + 3); a.box(X0, YF, Z0 + bt, X0 + fr, 0, Z0 + bt + 3); a.box(X1 - fr, YF, Z0 + bt, X1, 0, Z0 + bt + 3);
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2 === 0) a.box(X0 + fr + i * sq, YF + fr + j * sq, Z0 + bt, X0 + fr + (i + 1) * sq, YF + fr + (j + 1) * sq, Z0 + bt + 1.5);
      const prof = (kind) => { const r = sq * 0.32; return ({ P: [[r, 0], [r * 0.5, 7], [r * 0.4, 18], [r * 0.7, 20], [r * 0.4, 24]], R: [[r, 0], [r * 0.7, 6], [r * 0.6, 22], [r * 0.85, 26], [r * 0.85, 32]], N: [[r, 0], [r * 0.6, 8], [r * 0.5, 22], [r * 0.7, 32]], B: [[r, 0], [r * 0.6, 8], [r * 0.4, 26], [r * 0.65, 36]], Q: [[r, 0], [r * 0.6, 8], [r * 0.45, 30], [r * 0.8, 38], [r * 0.3, 42]], K: [[r, 0], [r * 0.6, 8], [r * 0.48, 32], [r * 0.8, 40], [r * 0.4, 44]] })[kind]; };
      const back = 'RNBQKBNR';
      for (let i = 0; i < 8; i++) for (const [row, kinds] of [[0, back[i]], [1, 'P'], [6, 'P'], [7, back[i]]]) {
        const x = X0 + fr + (i + 0.5) * sq, y = YF + fr + (row + 0.5) * sq, k = kinds, p = prof(k);
        lathe(a, x, y, Z, p, 10); if (k === 'K') { a.box(x - 1.2, y - 1.2, Z + 44, x + 1.2, y + 1.2, Z + 52); a.box(x - 4, y - 1.2, Z + 48, x + 4, y + 1.2, Z + 50); } if (k === 'N') a.box(x - sq * 0.12, y - sq * 0.28, Z + 22, x + sq * 0.12, y + sq * 0.06, Z + 36);
        a.circ(x, y, sq * 0.3, 'EQUIP-DETAIL');
      }
      a.log('Added the board, dark squares and the 32 turned pieces (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic six-sided dice',
    desc: (v) => `Six-sided die, ${v.w} in edge, with eased corners and round pips on the front (5), top (6) and right (3) faces; the opposite faces are plain.`,
    vs: [['0.6 in', 0.65, 0.65, 0.65, 0, {}], ['1 in', 1.05, 1.05, 1.05, 0, {}], ['2 in', 2.1, 2.1, 2.1, 0, {}]],
    build: (a) => {
      const { X0, X1, YF, Z0, Z1, cx, cy } = a, e = a.W * 0.03, pr = a.W * 0.07, ph = 0.8 + a.W * 0.006;
      a.box(X0 + e, YF + e, Z0, X1 - e, -e, Z1 - e); a.box(X0, YF + e * 2, Z0 + e, X1, -e * 2, Z1 - e * 2); a.box(X0 + e * 2, YF, Z0 + e, X1 - e * 2, 0, Z1 - e * 2); a.box(X0 + e * 2, YF + e * 2, Z0, X1 - e * 2, -e * 2, Z1);
      const g = a.W * 0.27, zc = (Z0 + Z1) / 2;
      for (const [dx, dz] of [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]]) a.ycyl(YF - ph + 0.01, YF + 0.3, cx + dx * g, zc + dz * g, pr, 8);
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]) a.cyl(cx + dx * g, cy + dy * g, Z1 - 0.3, Z1 + 0.01 > Z1 ? Z1 : Z1, pr, 8);
      for (const [dy, dz] of [[-1, -1], [0, 0], [1, 1]]) a.xcyl(X1 - 0.3, X1, cy + dy * g, zc + dz * g, pr, 8);
      a.rect(X0 + e, YF + e, X1 - e, -e); for (const dx of [-1, 1]) for (const dy of [-1, 0, 1]) a.circ(cx + dx * g, cy + dy * g, pr, 'EQUIP-DETAIL'); a.log('Added the cube with eased corners and the pips (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic spinning top',
    desc: (v) => `Wooden spinning top, ${v.h} in tall: a turned body with a broad shoulder and a pointed tip, a stem with a grip knob and a pull-cord groove, and a decorative ring groove.`,
    vs: [['2 in', 1.6, 1.6, 2.2, 0, {}], ['4 in', 3.2, 3.2, 4.2, 0, {}]],
    build: (a) => {
      const { cx, cy, Z0, Z1, W } = a, R = W / 2, H = a.H;
      lathe(a, cx, cy, Z0, [[1, 0], [R * 0.2, H * 0.08], [R * 0.7, H * 0.22], [R, H * 0.4], [R * 0.98, H * 0.46], [R * 0.7, H * 0.6], [R * 0.34, H * 0.66], [R * 0.14, H * 0.7]], 22);
      a.cyl(cx, cy, Z0 + H * 0.7, Z1 - H * 0.08, R * 0.13, 10); sph(a, cx, cy, Z1 - H * 0.06, H * 0.06, 10, 6); ring(a, cx, cy, Z0 + H * 0.43, R * 0.99, 0.8, 24, 4);
      a.circ(cx, cy, R); a.circ(cx, cy, R * 0.34, 'EQUIP-DETAIL'); a.log('Added the turned body, tip, stem and grip knob (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic skittles bowling set',
    desc: (v) => `Toy bowling set: ${v.n} turned pins with a base, a belly, a neck and a head with a ring, set out in a triangle, and a ball with finger-grip bumps.`,
    vs: [['6 pins, 8 in', 14, 11, 8.5, 0, { n: 6 }], ['10 pins, 12 in', 24, 20, 12.5, 0, { n: 10 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, cx, cy } = a, ph = a.H, pr = ph * 0.11, rows = v.n === 6 ? 3 : 4, sp = pr * 2.9;
      let k = 0;
      for (let r = 0; r < rows; r++) for (let c = 0; c <= r; c++) { if (k >= v.n) break; k++; const x = cx + (c - r / 2) * sp, y = YB - pr * 1.6 - (rows - 1 - r) * sp * 0.9 - 0; lathe(a, x, y, Z0, [[pr * 0.7, 0], [pr * 0.8, 4], [pr * 1.1, ph * 0.28], [pr * 0.75, ph * 0.55], [pr * 0.42, ph * 0.72], [pr * 0.5, ph * 0.86], [pr * 0.2, ph * 0.99]], 14); ring(a, x, y, Z0 + ph * 0.72, pr * 0.46, 1, 12, 4); a.circ(x, y, pr * 1.1, 'EQUIP-DETAIL'); }
      const br = ph * 0.2; sph(a, cx, YF + br + 2, Z0 + br, br, 16, 10); for (const [dx, dz] of [[-0.3, 0.3], [0.3, 0.3], [0, -0.1]]) a.ell(cx + dx * br, YF + 2 + br * 0.15, Z0 + br + dz * br, br * 0.1, br * 0.1, br * 0.1, 6, 4);
      a.circ(cx, YF + br + 2, br, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN'); a.log('Added the turned pins with rings in a triangle and the ball (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic toy xylophone',
    desc: (v) => `Child's xylophone with ${v.keys} bars of graded length on a sloped frame with two rails and end blocks, rubber feet and two mallets with round heads.`.replace("Child's xylophone", 'Xylophone'),
    vs: [['8 bars, 12 in', 9, 12, 4, 0, { keys: 8 }], ['12 bars, 18 in', 12, 18, 5, 0, { keys: 12 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, h = a.H;
      a.outline('EQUIP-HIDDEN');
      for (const s of [-1, 1]) { const x = cx + s * W * 0.3; prismY(a, [[x - 5, Z0 + 6], [x + 5, Z0 + 6], [x + 5, Z0 + h * 0.5], [x - 5, Z0 + h * 0.5]], YF + a.D * 0.06, YB - 6); a.box(x - 6, YF + a.D * 0.04, Z0, x + 6, YF + a.D * 0.1, Z0 + 8); a.box(x - 6, YB - 14, Z0, x + 6, YB - 4, Z0 + 8); }
      const n = v.keys, bh = 7;
      for (let i = 0; i < n; i++) {
        const f = i / (n - 1), len = W * (0.9 - 0.45 * f) * 0.72, y0 = YF + a.D * 0.08 + (a.D * 0.84 * i) / n, th = (a.D * 0.84) / n - 3, z = Z0 + h * 0.5 + 0;
        a.box(cx - len / 2, y0, z, cx + len / 2, y0 + th, z + bh); a.cyl(cx - len / 2 + 8, y0 + th / 2, z + bh, z + bh + 0.5, 1.3, 6); a.cyl(cx + len / 2 - 8, y0 + th / 2, z + bh, z + bh + 0.5, 1.3, 6); a.rect(cx - len / 2, y0, cx + len / 2, y0 + th, 'EQUIP-DETAIL');
      }
      for (const x of [cx - W * 0.1, cx + W * 0.1]) { a.box(x - 3, YF + a.D * 0.06, Z0 + h * 0.5 - 6, x + 3, YB - 10, Z0 + h * 0.5); }
      for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.42, YF + 6, Z0 + 4], [cx + s * W * 0.34, YF + a.D * 0.3, Z0 + 4]], [2.4, 2.4], 6); sph(a, cx + s * W * 0.42, YF + 8, Z0 + 6, 5, 8, 5); }
      a.log('Added the sloped frame, graded bars with fixing dots, feet and mallets (plan and 3D).');
    } }),
  fam({ cat: 'toys/games', title: 'Generic toy snare drum',
    desc: () => 'Toy snare-style drum on a folding stand: a shell with top and bottom hoops, eight tension rods with lugs, a drum head, a strap loop, two sticks on the head and a cross-braced stand of three legs.',
    vs: [['on stand, 20 in', 14, 14, 20, 0, {}]],
    build: (a) => {
      const { cx, cy, Z0, Z1, W } = a, R = W * 0.4, sz = Z0 + a.H * 0.5, sh = a.H * 0.2;
      lathe(a, cx, cy, sz, [[R, 0], [R, sh]], 24); ring(a, cx, cy, sz + 2, R + 1.5, 2.4, 24, 5); ring(a, cx, cy, sz + sh - 2, R + 1.5, 2.4, 24, 5); a.cyl(cx, cy, sz + sh, sz + sh + 2.5, R, 24); a.circ(cx, cy, R);
      for (let i = 0; i < 8; i++) { const t = (2 * PI * i) / 8, x = cx + (R + 5) * m.cos(t), y = cy + (R + 5) * m.sin(t); a.tube([[x, y, sz + 2], [x, y, sz + sh - 2]], [1.4, 1.4], 5); a.cyl(x, y, sz + sh * 0.4, sz + sh * 0.6, 3, 6); }
      a.tube([[cx - R, cy + 4, sz + sh + 3], [cx + R * 0.5, cy - R * 0.3, sz + sh + 6]], [2.2, 2.2], 6); a.tube([[cx - R * 0.5, cy - R * 0.5, sz + sh + 6], [cx + R * 0.6, cy + R * 0.4, sz + sh + 6]], [2.2, 2.2], 6); sph(a, cx - R, cy + 4, sz + sh + 3, 4, 6, 4);
      for (let i = 0; i < 3; i++) { const t = (2 * PI * i) / 3 + PI / 2, x = cx + W * 0.46 * m.cos(t), y = cy + W * 0.46 * m.sin(t); a.tube([[cx, cy, sz - 6], [cx, cy, sz]], [2, 2], 4); a.tube([[cx + R * 0.4 * m.cos(t), cy + R * 0.4 * m.sin(t), sz - 4], [x, y, Z0 + 4]], [3.2, 3.2], 6); a.cyl(x, y, Z0, Z0 + 5, 6, 8); a.circ(x, y, 6, 'EQUIP-HIDDEN'); }
      a.cyl(cx, cy, sz - 14, sz, 10, 10); a.circ(cx, cy, R * 0.4, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN'); a.log('Added the shell, hoops, tension rods, head, sticks and the three-leg stand (plan and 3D).');
    } }),
];

export default [...blocks, ...vehicles, ...dolls, ...games];

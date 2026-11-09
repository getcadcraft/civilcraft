/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, interior design: more lamps and lighting, soft furnishings, accessories and decor, wall and ceiling features. Original geometry; generic decor pieces by type and size. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = Math.PI;
const area2 = (p) => p.reduce((s, q, i) => { const r = p[(i + 1) % p.length]; return s + q[0] * r[1] - r[0] * q[1]; }, 0);
function prismX(a, poly, x0, x1) {
  if (area2(poly) < 0) poly = poly.slice().reverse();
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
function prismY(a, poly, y0, y1) {
  if (area2(poly) > 0) poly = poly.slice().reverse();
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** a turned (lathe) body: samples [dz, r] above z0 */
function lathe(a, cx, cy, z0, prof, seg = 20) { a.tube(prof.map(([dz]) => [cx, cy, z0 + dz]), prof.map(([, r]) => r), seg); }
/** a closed loop tube round a circle or ellipse in the horizontal plane */
function hoop(a, cx, cy, z, rx, ry, t, seg = 24, tseg = 6) { const p = []; for (let k = 0; k <= seg; k++) { const th = (k / seg) * 2 * PI; p.push([cx + rx * m.cos(th), cy + ry * m.sin(th), z]); } a.tube(p, p.map(() => t), tseg); }
/** a loop in the X-Z plane at y */
function vhoop(a, cx, y, cz, rx, rz, t, seg = 24, tseg = 6) { const p = []; for (let k = 0; k <= seg; k++) { const th = (k / seg) * 2 * PI; p.push([cx + rx * m.cos(th), y, cz + rz * m.sin(th)]); } a.tube(p, p.map(() => t), tseg); }
/** a puffy slab (pillow, cushion, mattress top): superellipse sides, layered, inside x0..x1 y0..y1 z0..z1 */
function puff(a, x0, y0, x1, y1, z0, z1, c, n = 6) {
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n, tm = (t0 + t1) / 2, k = 1 - m.pow(1 - m.pow(m.abs(2 * tm - 1), 4), 0.25), ins = c * k;
    a.box(x0 + ins, y0 + ins, z0 + (z1 - z0) * t0, x1 - ins, y1 - ins, z0 + (z1 - z0) * t1);
  }
}
const rectLoop = (a, x0, y0, x1, y1, z, t) => a.tube([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [x0, y0, z]], [t, t, t, t, t], 5);
/** a moulding/profile strip along x: samples [v, u] */
function profile(a, pts, x0, x1, D, z0, H) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [va, ua] = pts[i], [vb, ub] = pts[i + 1];
    if (vb - va < 0.0005) continue;
    prismX(a, [[0, z0 + va * H], [-ua * D, z0 + va * H], [-ub * D, z0 + vb * H], [0, z0 + vb * H]], x0, x1);
  }
}
const frameXZ = (a, x0, z0, x1, z1, y0, y1, t) => a.frame(x0, z0, x1, z1, y0, y1, t);

/** a slab leaning back (top toward the wall at y = 0): u up the slope, n out toward the viewer, th = tilt from vertical */
function slab(a, yb, x0, x1, u0, u1, n0, n1, th, zb) {
  const P = (u, n) => [yb + u * m.sin(th) - n * m.cos(th), zb + u * m.cos(th) + n * m.sin(th)];
  prismX(a, [P(u0, n0), P(u1, n0), P(u1, n1), P(u0, n1)], a.X0 + x0, a.X0 + x1);
}
/** a tube along y (out from the wall): ys = distance in front of the wall (positive), rs radii */
const ytube = (a, x, z, ys, rs, seg = 20) => a.tube(ys.map((y) => [x, -y, z]), rs, seg);
/** a ring of identical vertical strands round an axis */
function ring(n, r, f) { for (let k = 0; k < n; k++) { const th = (k / n) * 2 * PI; f(th, r * m.cos(th), r * m.sin(th), k); } }
const flame = (a, x, y, z) => { a.ell(x, y, z, 6, 6, 14, 8, 6); };

// ================================================================================== LIGHTING
function sconce(a, v) {
  const { cx, Z0, Z1, W, D } = a, sh = (v.sh || 8) * IN, sr = m.min(W / 2 - 4, (v.sr || 4) * IN);
  const zc = Z1 - (v.type === 'candle' ? 140 : v.type === 'dome' ? a.H / 2 : sh * 0.6 + 10);
  if (v.type === 'swing') {
    const yc = D - sr - 4;
    a.box(cx - 44, -14, m.max(Z0, zc - sh * 0.4 - 60), cx + 44, 0, zc + 70); a.ycyl(-22, -14, cx, zc, 30, 18);
    a.tube([[cx, -14, zc], [cx, -yc * 0.5, zc + 6], [cx, -yc, zc + 4]], [8, 8, 8], 6);
    a.cone(cx, -yc, zc - sh * 0.4, zc + sh * 0.6, sr * 0.8, sr, 28); a.cyl(cx, -yc, zc - sh * 0.4 - 6, zc - sh * 0.4, sr * 0.76, 20);
    a.rect(cx - 50, -14, cx + 50, 0, 'EQUIP'); a.circ(cx, -yc, sr, 'EQUIP'); a.circ(cx, -yc, sr * 0.8, 'EQUIP-DETAIL'); a.line(cx, -14, cx, -yc, 'EQUIP-DETAIL');
  } else if (v.type === 'dome') {
    const r = m.min(W / 2 - 4, a.H / 2 - 4), pts = [], rs = [];
    for (let k = 0; k <= 10; k++) { const t = (k / 10) * 0.97; pts.push([cx, -t * D, zc]); rs.push(r * m.sqrt(1 - t * t) + 2); }
    a.tube(pts, rs, 28); a.ycyl(-D, -D + 14, cx, zc, r * 0.32, 14);
    a.circ(cx, -D / 2, r, 'EQUIP-DETAIL'); a.rect(cx - r, -D, cx + r, 0, 'EQUIP'); a.circ(cx, -D * 0.5, r * 0.3, 'EQUIP-DETAIL');
  } else if (v.type === 'candle') {
    const yc = D * 0.78;
    a.ycyl(-14, 0, cx, zc - 120, 46, 20);
    a.tube([[cx, -14, zc - 120], [cx, -D * 0.45, zc - 150], [cx, -D * 0.7, zc - 110], [cx, -yc, zc - 80]], [9, 8, 8, 8], 8);
    a.cyl(cx, -yc, zc - 80, zc - 40, 30, 16); a.cyl(cx, -yc, zc - 44, zc - 36, 40, 18); a.cyl(cx, -yc, zc - 36, zc + 70, 13, 12); flame(a, cx, -yc, zc + 82);
    hoop(a, cx, -yc, zc - 38, 38, 38, 3, 16, 4);
    a.rect(cx - 46, -14, cx + 46, 0, 'EQUIP'); a.circ(cx, -yc, 38, 'EQUIP'); a.circ(cx, -yc, 13, 'EQUIP-DETAIL'); a.line(cx, -14, cx, -yc, 'EQUIP-DETAIL');
  } else {
    const yc = D - 10 - sr * 0.85, s = sr * 0.85, bot = zc - sh * 0.45, top = zc + sh * 0.35;
    a.box(cx - 40, -14, zc - 90, cx + 40, 0, zc + 90);
    a.tube([[cx, -14, zc], [cx, -yc, zc]], [9, 9], 6);
    for (const dx of [-1, 1]) for (const dy of [-1, 1]) a.cyl(cx + dx * s, -yc + dy * s, bot, top, 5, 6);
    a.box(cx - s - 6, -yc - s - 6, bot - 8, cx + s + 6, -yc + s + 6, bot); a.box(cx - s - 6, -yc - s - 6, top, cx + s + 6, -yc + s + 6, top + 8);
    a.cone(cx, -yc, top + 8, top + sh * 0.2, s * 1.3, 14, 4); a.ell(cx, -yc, bot + sh * 0.2, 14, 14, 24, 10, 6);
    a.rect(cx - 44, -14, cx + 44, 0, 'EQUIP'); a.rect(cx - s - 6, -yc - s - 6, cx + s + 6, -yc + s + 6, 'EQUIP'); a.line(cx, -14, cx, -yc + s, 'EQUIP-DETAIL');
  }
  a.log('Added the wall plate, ' + (v.type === 'swing' ? 'a swing arm and a drum shade' : v.type === 'dome' ? 'a half-dome shade and its centre boss' : v.type === 'candle' ? 'a curved arm, a drip pan, a candle and its flame' : 'an arm and a four-post lantern with caps') + ' (plan and 3D).');
}
function pictureLight(a, v) {
  const { X0, X1, cx, Z0, Z1, W, D } = a, fh = Z1 - Z0 - 150, ft = 34;
  a.frame(X0, Z0, X1, Z0 + fh, -26, 0, ft); a.box(X0 + ft, -14, Z0 + ft, X1 - ft, -8, Z0 + fh - ft);
  a.box(X0 + ft + 30, -18, Z0 + ft + 30, X1 - ft - 30, -12, Z0 + fh - ft - 30);
  for (let k = 0; k < 4; k++) a.box(X0 + ft + 60 + k * (W - 2 * ft - 160) / 4, -24, Z0 + ft + 70, X0 + ft + 60 + k * (W - 2 * ft - 160) / 4 + (W - 2 * ft - 160) / 6, -18, Z0 + fh * (0.4 + 0.12 * ((k * 5) % 4)));
  const L = m.min(W - 120, v.len * IN), zl = Z1 - 50, yl = D - 40;
  a.box(cx - 26, -10, zl - 26, cx + 26, 0, zl + 26); a.tube([[cx, -10, zl], [cx, -yl, zl]], [8, 8], 6);
  if (v.style === 'bar') { a.xcyl(cx - L / 2, cx + L / 2, -yl, zl, 22, 14); for (const s of [-1, 1]) a.ell(cx + s * L / 2, -yl, zl, 14, 24, 24, 8, 6); }
  else if (v.style === 'hood') { const pts = [[-yl + 40, zl - 28], [-yl + 40, zl + 36], [-yl - 26, zl + 36], [-yl - 40, zl + 6], [-yl - 28, zl - 26]]; prismX(a, pts.map(([y, z]) => [y, z]), cx - L / 2, cx + L / 2); }
  else { a.box(cx - L / 2, -yl - 18, zl - 14, cx + L / 2, -yl + 18, zl + 14); for (const s of [-1, 1]) a.box(cx + s * L / 2 - 6, -yl - 22, zl - 20, cx + s * L / 2 + 6, -yl + 22, zl + 20); }
  a.rect(X0, -26, X1, 0, 'EQUIP'); a.rect(cx - L / 2, -yl - 20, cx + L / 2, -yl + 20, 'EQUIP-DETAIL'); a.line(cx, -10, cx, -yl, 'EQUIP-DETAIL');
  a.log('Added the framed print, a wall plate and arm and a ' + v.style + ' picture light above the frame (plan and 3D).');
}
function chandelier(a, v) {
  const { cx, cy, Z0, Z1, W } = a, R0 = W / 2 - 40, n = v.tiers;
  a.cyl(cx, cy, Z1 - 30, Z1, 70, 18); a.circ(cx, cy, 70, 'EQUIP-DETAIL');
  const chainBot = Z1 - v.chain * IN; a.tube([[cx, cy, Z1 - 30], [cx, cy, chainBot]], [6, 6], 6);
  for (let k = 0; k < 7 && v.chain > 6; k++) a.ell(cx, cy, Z1 - 30 - k * ((Z1 - 30 - chainBot) / 7) - 20, 10, 4, 14, 8, 5);
  const zTop = chainBot, zBot = Z0 + 60;
  a.tube([[cx, cy, zTop], [cx, cy, zBot + 40]], [14, 10], 10); a.ell(cx, cy, zBot + 20, 46, 46, 46, 14, 8); a.cone(cx, cy, zBot - 4, zBot + 4, 10, 4, 8);
  for (let t = 0; t < n; t++) {
    const f = n === 1 ? 1 : 1 - t * 0.32, r = R0 * f, z = zTop - 40 - t * ((zTop - zBot - 160) / m.max(1, n - 1)) * (n === 1 ? 0 : 1) - (n === 1 ? 140 : 0), na = v.arms + t * 2;
    hoop(a, cx, cy, z, r, r, 6, 36, 5); a.circ(cx, cy, r, t === 0 ? 'EQUIP' : 'EQUIP-DETAIL');
    for (let k = 0; k < 4; k++) { const th = k * PI / 2 + PI / 4; a.tube([[cx, cy, zTop - 30 - t * 20], [cx + r * 0.5 * m.cos(th), cy + r * 0.5 * m.sin(th), z + 40], [cx + r * m.cos(th), cy + r * m.sin(th), z]], [5, 4, 4], 5); }
    for (let k = 0; k < na; k++) {
      const th = (k / na) * 2 * PI, x = cx + r * m.cos(th), y = cy + r * m.sin(th);
      a.cyl(x, y, z, z + 22, 17, 12); a.cyl(x, y, z + 22, z + 96, 11, 10); a.cyl(x, y, z + 96, z + 106, 15, 10); flame(a, x, y, z + 116);
      a.ell(x + (r > 0 ? 0 : 0), y, z - 38, 8, 8, 26, 8, 6);
    }
    for (let k = 0; k < na * 2; k++) { const th = ((k + 0.5) / (na * 2)) * 2 * PI; a.ell(cx + r * m.cos(th), cy + r * m.sin(th), z - 20, 7, 7, 20, 8, 5); }
  }
  a.log('Added the canopy, a chain, a centre column with a finial drop and ' + n + ' ring tier' + (n > 1 ? 's' : '') + ' carrying candle cups, flames and hanging crystal drops (plan and 3D).');
}
function linearSuspension(a, v) {
  const { X0, X1, cx, cy, Z0, Z1, W, D } = a, bz = Z0 + 40, bh = v.bh * IN, ds = D / 2;
  const cords = v.cords, xs = []; for (let k = 0; k < cords; k++) xs.push(X0 + 90 + ((W - 180) * k) / (cords - 1));
  for (const x of xs) { a.cyl(x, cy, Z1 - 20, Z1, 34, 14); a.tube([[x, cy, Z1 - 20], [x, cy, bz + bh]], [3, 3], 4); a.circ(x, cy, 34, 'EQUIP-DETAIL'); }
  if (v.kind === 'bar') { a.box(X0, cy - ds + 4, bz, X1, cy + ds - 4, bz + bh); a.box(X0 + 6, cy - ds + 14, bz - 6, X1 - 6, cy + ds - 14, bz); for (const s of [X0, X1 - 10]) a.box(s, cy - ds, bz - 4, s + 10, cy + ds, bz + bh + 4); a.outline(); a.rect(X0 + 6, cy - ds + 14, X1 - 6, cy + ds - 14, 'EQUIP-DETAIL'); }
  else if (v.kind === 'twin') { for (const s of [-1, 1]) { a.xcyl(X0 + 20, X1 - 20, cy + s * ds * 0.5, bz + bh / 2, bh / 2, 14); a.circ(X0 + 20, cy + s * ds * 0.5, bh / 2, 'EQUIP-DETAIL'); a.line(X0 + 20, cy + s * ds * 0.5, X1 - 20, cy + s * ds * 0.5, 'EQUIP'); } a.box(X0 + 10, cy - ds, bz + bh / 2 - 4, X0 + 40, cy + ds, bz + bh / 2 + 4); a.box(X1 - 40, cy - ds, bz + bh / 2 - 4, X1 - 10, cy + ds, bz + bh / 2 + 4); }
  else { a.frame(X0, bz, X1, bz + bh, cy - ds, cy + ds, 16); for (const x of xs.slice(0, -1)) a.box(x + 30, cy - ds + 4, bz + bh * 0.35, x + 60, cy + ds - 4, bz + bh * 0.65); a.outline(); a.rect(X0 + 16, cy - ds + 16, X1 - 16, cy + ds - 16, 'EQUIP-DETAIL'); }
  a.log('Added ' + cords + ' ceiling canopies with thin cords and a ' + (v.kind === 'bar' ? 'long bar with a diffuser strip and end caps' : v.kind === 'twin' ? 'pair of parallel tube lights with cross links' : 'rectangular open frame with cross bars') + ' (plan and 3D).');
}
function woven(a, v) {
  const { cx, cy, Z0, Z1, W } = a, R = W / 2 - 16, h = v.shadeH * IN;
  const rf = (t) => (v.shape === 'dome' ? R * m.cos(t * PI / 2 * 0.95) : v.shape === 'bell' ? R * (1 - 0.7 * m.pow(t, 0.9)) : R * m.sin(PI * (0.12 + 0.76 * t))) + 6;
  a.cyl(cx, cy, Z1 - 24, Z1, 60, 16); a.tube([[cx, cy, Z1 - 24], [cx, cy, Z0 + h]], [4, 4], 5); a.circ(cx, cy, R + 6, 'EQUIP'); a.circ(cx, cy, 60, 'EQUIP-DETAIL');
  const N = 12, prof = []; for (let k = 0; k <= N; k++) prof.push([h * k / N, rf(k / N)]);
  lathe(a, cx, cy, Z0, prof, 28);
  for (let k = 1; k < 6; k++) { const t = k / 6, rr = rf(t) + 4; hoop(a, cx, cy, Z0 + h * t, rr, rr, 3, 28, 4); }
  hoop(a, cx, cy, Z0 + 3, rf(0) + 5, rf(0) + 5, 5, 28, 5);
  a.cyl(cx, cy, Z0 + h - 20, Z0 + h, 26, 12);
  a.log('Added the canopy, a drop rod, a ' + v.shape + ' woven shade in lathe form with rib bands and a rim ring (plan and 3D).');
}
function paperLantern(a, v) {
  const { cx, cy, Z0, Z1, W } = a, R = W / 2 - 6, h = v.shadeH * IN, zc = Z0 + h / 2, shape = v.shape;
  a.cyl(cx, cy, Z1 - 24, Z1, 50, 16); a.tube([[cx, cy, Z1 - 24], [cx, cy, Z0 + h]], [3, 3], 4); a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, 50, 'EQUIP-DETAIL');
  if (shape === 'drum') { a.cyl(cx, cy, Z0 + 6, Z0 + h - 6, R, 28); a.cyl(cx, cy, Z0, Z0 + 6, R * 0.55, 20); a.cyl(cx, cy, Z0 + h - 6, Z0 + h, R * 0.55, 20); for (let k = 0; k < 9; k++) hoop(a, cx, cy, Z0 + 6 + (h - 12) * (k / 8), R + 2, R + 2, 3, 28, 4); }
  else { const rz = shape === 'oval' ? h / 2 : R; a.ell(cx, cy, zc, R, R, m.min(rz, h / 2 - 2), 24, 14); for (let k = 0; k < 7; k++) { const t = (k - 3) / 3.6, rr = R * m.sqrt(1 - t * t * 0.9); hoop(a, cx, cy, zc + m.min(rz, h / 2 - 2) * t * 0.93, rr + 2, rr + 2, 2.5, 28, 4); } a.cyl(cx, cy, zc - m.min(rz, h / 2 - 2) - 2, zc - m.min(rz, h / 2 - 2) + 8, R * 0.18, 12); a.cyl(cx, cy, zc + m.min(rz, h / 2 - 2) - 8, zc + m.min(rz, h / 2 - 2) + 2, R * 0.18, 12); }
  a.log('Added the canopy, a wire drop rod and a ' + shape + ' paper shade with its stiffening rings (plan and 3D).');
}
function hurricane(a, v) {
  const { cx, cy, Z0, Z1, W, D } = a, R = W / 2 - 4, H = a.H, bh = 22;
  if (v.kind === 'round') {
    a.circ(cx, cy, R, 'EQUIP'); a.cyl(cx, cy, Z0, Z0 + bh, R, 28); a.cyl(cx, cy, Z0 + bh, Z0 + bh + 10, R * 0.9, 24);
    const gz1 = Z1 - 36, ch = []; for (let k = 0; k <= 8; k++) { const t = k / 8; ch.push([Z0 + bh + 10 + (gz1 - Z0 - bh - 10) * t, R * (0.9 - 0.14 * m.sin(PI * t) * -1 - 0.0) * (1 - 0.0)]); }
    for (let k = 0; k < 14; k++) { const th = k * PI / 7; a.tube([[cx + R * 0.88 * m.cos(th), cy + R * 0.88 * m.sin(th), Z0 + bh + 10], [cx + R * 0.88 * m.cos(th), cy + R * 0.88 * m.sin(th), gz1]], [2.5, 2.5], 4); }
    hoop(a, cx, cy, gz1, R * 0.88, R * 0.88, 4, 28, 5); hoop(a, cx, cy, Z0 + bh + 14, R * 0.88, R * 0.88, 3, 28, 4); a.cyl(cx, cy, Z0 + bh + 10, Z0 + bh + (gz1 - Z0) * 0.5, R * 0.3, 14); flame(a, cx, cy, Z0 + bh + (gz1 - Z0) * 0.5 + 14);
    a.cone(cx, cy, gz1, Z1 - 6, R * 0.95, R * 0.3, 24); a.cyl(cx, cy, Z1 - 6, Z1, 8, 8);
    a.circ(cx, cy, R * 0.88, 'EQUIP-DETAIL');
  } else if (v.kind === 'square') {
    const s = W / 2 - 4; a.rect(cx - s, cy - s, cx + s, cy + s, 'EQUIP'); a.box(cx - s, cy - s, Z0, cx + s, cy + s, Z0 + bh);
    for (const dx of [-1, 1]) for (const dy of [-1, 1]) a.cyl(cx + dx * (s - 8), cy + dy * (s - 8), Z0 + bh, Z1 - 60, 5, 6);
    a.box(cx - s + 2, cy - s + 2, Z1 - 60, cx + s - 2, cy + s - 2, Z1 - 50); a.cone(cx, cy, Z1 - 50, Z1 - 12, s * 1.1, 10, 4); a.cyl(cx, cy, Z1 - 12, Z1, 8, 8);
    a.cyl(cx, cy, Z0 + bh, Z0 + bh + (H - 80) * 0.45, s * 0.3, 14); flame(a, cx, cy, Z0 + bh + (H - 80) * 0.45 + 14); a.rect(cx - s + 8, cy - s + 8, cx + s - 8, cy + s - 8, 'EQUIP-DETAIL');
    for (const z of [0.33, 0.66]) a.box(cx - s + 4, cy - s + 4, Z0 + bh + (H - 80) * z, cx + s - 4, cy - s + 8, Z0 + bh + (H - 80) * z + 4);
  } else { // tapered metal
    a.circ(cx, cy, R, 'EQUIP'); a.cone(cx, cy, Z0, Z1 - 40, R, R * 0.55, 8); a.cyl(cx, cy, Z0, Z0 + 14, R, 8);
    for (let k = 0; k < 8; k++) { const th = k * PI / 4; a.tube([[cx + R * m.cos(th), cy + R * m.sin(th), Z0 + 14], [cx + R * 0.55 * m.cos(th), cy + R * 0.55 * m.sin(th), Z1 - 40]], [3, 3], 4); }
    a.cone(cx, cy, Z1 - 40, Z1 - 8, R * 0.62, 12, 8); a.cyl(cx, cy, Z1 - 8, Z1, 10, 8);
    a.circ(cx, cy, R * 0.55, 'EQUIP-DETAIL');
  }
  a.log('Added the base, ' + (v.kind === 'round' ? 'a glass chimney drawn as ribs and rings' : v.kind === 'square' ? 'four corner posts with glass rails' : 'a tapered cage of eight ribs') + ', the candle and a cap (plan and 3D).');
}

// ================================================================================== SOFT
function roman(a, v) {
  const { X0, X1, Z0, Z1, W, D } = a, rail = 44, zt = Z1 - rail, hem = 22, fh = v.fold * IN, stackH = v.stack * IN;
  a.outline('EQUIP-DETAIL'); a.rect(X0, -62, X1, 0, 'EQUIP');
  a.box(X0, -62, Z1 - rail, X1, 0, Z1); a.box(X0 - 0 + 6, -66, Z1 - rail + 6, X1 - 6, -62, Z1 - 6);
  const nS = m.max(0, m.round(stackH / (fh * 0.5))), flatTop = zt - (nS ? stackH : 0), bandH = nS ? stackH / nS : 0;
  for (let k = 0; k < nS; k++) a.box(X0 + 12, -(14 + ((k % 2) ? 70 : 38)), zt - (k + 1) * bandH, X1 - 12, -10, zt - k * bandH - 3);
  a.box(X0 + 12, -20, Z0 + hem, X1 - 12, -10, flatTop);
  for (let z = flatTop - fh; z > Z0 + hem + 40; z -= fh) a.box(X0 + 12, -26, z - 6, X1 - 12, -20, z + 6);
  a.box(X0 + 6, -34, Z0, X1 - 6, -14, Z0 + hem);
  for (const x of [X0 + W * 0.22, X1 - W * 0.22]) a.tube([[x, -30, zt], [x, -30, Z0 + hem]], [2.5, 2.5], 4);
  a.tube([[X1 - 18, -40, zt - 20], [X1 - 18, -40, zt - 200]], [3, 3], 4); a.ell(X1 - 18, -40, zt - 215, 10, 10, 18, 8, 6);
  a.line(X0, -10, X1, -10, 'EQUIP');
  a.log('Added the headrail, ' + (nS ? nS + ' stacked folds under the rail and ' : '') + 'the flat panel with rod pockets, a weighted hem bar, lift cords and a cord with a tassel (plan and 3D).');
}
function roller(a, v) {
  const { X0, X1, Z0, Z1, W, D } = a, r = m.min(D / 2 - 2, 36), yc = -(r + 4), zr = Z1 - r - 4, hem = 16, len = (zr - r - Z0 - hem) * v.drop;
  a.outline('EQUIP-DETAIL'); a.circ(X0 + 6, yc, r, 'EQUIP'); a.rect(X0, yc - r, X1, yc + r, 'EQUIP');
  a.xcyl(X0 + 6, X1 - 6, yc, zr, r, 20); for (const s of [X0, X1 - 12]) a.box(s, yc - r - 4, zr - r - 4, s + 12, yc + r + 4, Z1);
  const fx0 = X0 + 22, fx1 = X1 - 22, ztop = zr - r + 2, zb = ztop - len, yf = yc - r + 1;
  a.box(fx0, yf - 3, zb, fx1, yf, ztop);
  if (v.zebra) for (let z = ztop - 30; z > zb + 20; z -= 40) a.box(fx0, yf - 5, z - 12, fx1, yf - 3, z + 12);
  a.box(fx0 - 4, yf - 18, zb - hem, fx1 + 4, yf + 4, zb);
  const cx0 = X1 - 34, cz1 = zr - r - 10, cz0 = m.max(Z0 + 10, cz1 - len * 0.7 - 40);
  a.tube([[cx0, yc - r - 8, cz1], [cx0, yc - r - 8, cz0]], [2, 2], 4); a.tube([[cx0 + 8, yc - r - 8, cz1], [cx0 + 8, yc - r - 8, cz0 + 20]], [2, 2], 4);
  for (let z = cz1 - 12; z > cz0; z -= 14) a.ell(cx0, yc - r - 8, z, 3.5, 3.5, 3.5, 6, 4);
  a.cyl(cx0 + 4, yc - r - 8, cz0 - 8, cz0 + 8, 9, 8);
  a.log('Added the roller tube with end brackets, a ' + (v.zebra ? 'banded day-and-night fabric' : 'plain fabric') + ' drop with a hem bar and a ball chain with its tensioner (plan and 3D).');
}
function ellPoly(cx, cy, rx, ry, rot, n = 22, jit = 0) { const p = []; for (let k = 0; k < n; k++) { const th = (k / n) * 2 * PI, q = 1 + jit * m.sin(th * 7 + rot * 3); const x = rx * m.cos(th) * q, y = ry * m.sin(th) * q; p.push([cx + x * m.cos(rot) - y * m.sin(rot), cy + x * m.sin(rot) + y * m.cos(rot)]); } return p; }
function cowhide(a, v) {
  const { cx, cy, Z0, W, D } = a, T = 12;
  const parts = [[cx, cy, W * 0.27, D * 0.3, 0, 0.05], ...(v.legs ? [[cx - W * 0.3, cy - D * 0.28, W * 0.12, D * 0.14, -0.5, 0.06], [cx - W * 0.3, cy + D * 0.28, W * 0.12, D * 0.14, 0.5, 0.06], [cx + W * 0.3, cy - D * 0.26, W * 0.12, D * 0.14, 0.5, 0.06], [cx + W * 0.3, cy + D * 0.26, W * 0.12, D * 0.14, -0.5, 0.06], [cx + W * 0.39, cy + D * 0.0, W * 0.08, D * 0.1, 0, 0.05], [cx - W * 0.42, cy + D * 0.03, W * 0.06, D * 0.05, 0.2, 0.04]] : [[cx + W * 0.31, cy, W * 0.14, D * 0.24, 0, 0.07], [cx - W * 0.33, cy, W * 0.13, D * 0.22, 0, 0.07]])];
  parts.forEach(([x, y, rx, ry, rot, j], i) => { const p = ellPoly(x, y, rx, ry, rot, 22, j); a.prism(p, Z0, Z0 + T - (i ? 1 : 0)); a.poly(p, 'EQUIP'); });
  for (let k = 0; k < v.spots; k++) { const th = k * 2.4, p = ellPoly(cx + W * 0.22 * m.cos(th) * (1 - k * 0.04), cy + D * 0.24 * m.sin(th * 1.3), W * (0.05 + 0.02 * ((k * 3) % 4)), D * (0.06 + 0.02 * ((k * 5) % 3)), th, 14, 0.12); a.prism(p, Z0 + T - 1, Z0 + T + 2); a.poly(p, 'EQUIP-DETAIL'); }
  if (v.roll) { const rx0 = a.X1 - 70, r = 48; a.ycyl(cy - D * 0.22, cy + D * 0.22, rx0, Z0 + T + r, r, 18); a.ycyl(cy - D * 0.22, cy - D * 0.22 + 4, rx0, Z0 + T + r, r * 0.55, 12); for (const y of [cy - D * 0.12, cy + D * 0.12]) vhoop(a, rx0, y, Z0 + T + r, r + 3, r + 3, 3, 16, 4); a.circ(rx0, cy, r, 'EQUIP-DETAIL'); }
  a.log('Added the hide body from overlapping lobes' + (v.legs ? ' with four leg flaps, a neck and a tail' : ' with a head and a tail end') + (v.spots ? ' and ' + v.spots + ' raised patches' : '') + (v.roll ? ', plus a second hide rolled and tied with two straps at one end' : '') + ' (plan and 3D).');
}
function beanbag(a, v) {
  const { cx, cy, Z0, Z1, W, D } = a, R = W / 2 - 4, h = a.H;
  if (v.kind === 'lounger') {
    const rx = W / 2 - 4, ry = D / 2 - 4; a.ell(cx, cy - ry * 0.1, Z0 + h * 0.3, rx, ry * 0.9, h * 0.3, 28, 12); a.ell(cx, cy + ry * 0.4, Z0 + h * 0.5, rx * 0.92, ry * 0.58, h * 0.5, 26, 12);
    a.ellp(cx, cy, rx, ry, 'EQUIP'); a.ellp(cx, cy + ry * 0.38, rx * 0.9, ry * 0.42, 'EQUIP-DETAIL'); a.line(cx - rx * 0.9, cy + ry * 0.05, cx + rx * 0.9, cy + ry * 0.05, 'EQUIP-DETAIL');
    a.tube([[cx - 50, cy + ry * 0.7, Z0 + h * 0.9], [cx, cy + ry * 0.6, Z0 + h * 0.96], [cx + 50, cy + ry * 0.7, Z0 + h * 0.9]], [6, 6, 6], 6);
  } else {
    const prof = []; for (let k = 0; k <= 14; k++) { const t = k / 14, f = v.kind === 'pear' ? (0.52 + 0.48 * m.sin(PI * m.pow(t, 0.75))) * (1 - 0.72 * m.pow(t, 2.4)) : (0.6 + 0.4 * m.sin(PI * m.min(1, t * 1.12))) * (1 - 0.5 * m.pow(t, 3)); prof.push([(h - 6) * t, R * f]); }
    lathe(a, cx, cy, Z0, prof, 28); a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 0.28, 'EQUIP-DETAIL');
    for (const t of [0.3, 0.6]) { const i = m.round(t * 14); hoop(a, cx, cy, Z0 + prof[i][0], prof[i][1] + 2, prof[i][1] + 2, 3, 28, 4); }
    a.tube([[cx - 40, cy, Z1 - 12], [cx - 40, cy, Z1 - 6], [cx, cy, Z1 - 2], [cx + 40, cy, Z1 - 6], [cx + 40, cy, Z1 - 12]], [7, 7, 7, 7, 7], 6);
    for (let k = 0; k < 6; k++) { const th = (k / 6) * 2 * PI; a.line(cx, cy, cx + R * 0.95 * m.cos(th), cy + R * 0.95 * m.sin(th), 'EQUIP-DETAIL'); }
  }
  a.log('Added the ' + (v.kind === 'lounger' ? 'low seat and raised back from two stuffed forms with a carry handle' : v.kind === 'pear' ? 'pear-shaped stuffed body with seams and a carry handle' : 'round slumped body with seams and a carry handle') + ' (plan and 3D).');
}
function floorStack(a, v) {
  const { X0, X1, YF, YB, cx, cy, Z0, Z1, W, D } = a, n = v.n, t = (a.H) / n;
  if (v.round) {
    for (let k = 0; k < n; k++) { const R = (W / 2 - 4) * (1 - k * 0.1), z0 = Z0 + k * t, off = k * 6; a.ell(cx + off, cy, z0 + t / 2, R, R, t / 2, 26, 10); hoop(a, cx + off, cy, z0 + t / 2, R * 0.99, R * 0.99, 4, 26, 5); a.ell(cx + off, cy, z0 + t - 2, 12, 12, 5, 8, 5); a.circ(cx + off, cy, R, k ? 'EQUIP-DETAIL' : 'EQUIP'); }
  } else {
    for (let k = 0; k < n; k++) {
      const f = 1 - k * 0.07, hx = (W / 2 - 6) * f, hy = (D / 2 - 6) * f, ox = (k % 2 ? 1 : -1) * k * 5, oy = (k % 2 ? -1 : 1) * k * 4, z0 = Z0 + k * t;
      puff(a, cx + ox - hx, cy + oy - hy, cx + ox + hx, cy + oy + hy, z0, z0 + t - 1, 60, 6); rectLoop(a, cx + ox - hx + 6, cy + oy - hy + 6, cx + ox + hx - 6, cy + oy + hy - 6, z0 + t * 0.5, 5);
      a.cyl(cx + ox, cy + oy, z0 + t - 12, z0 + t - 2, 13, 8); for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.cyl(cx + ox + sx * hx * 0.88, cy + oy + sy * hy * 0.88, z0 + t - 8, z0 + t - 1, 6, 6);
      a.rect(cx + ox - hx, cy + oy - hy, cx + ox + hx, cy + oy + hy, k ? 'EQUIP-DETAIL' : 'EQUIP');
    }
  }
  a.log('Added ' + n + (v.round ? ' round pillows' : ' square floor cushions') + ' stacked with a small offset, each with piping, a centre button' + (v.round ? '' : ' and corner tufts') + ' (plan and 3D).');
}
function blanketLadder(a, v) {
  const { X0, X1, cx, Z0, Z1, W, D } = a, yf = -(D - 16), yt = -16, zb = Z0 + 6, zt = Z1 - 8, L = m.hypot(yt - yf, zt - zb), th = m.atan2(yt - yf, zt - zb);
  const rx = [X0 + 24, X1 - 24];
  for (const x of rx) a.tube([[x, yf, zb], [x, yt, zt]], [20, 16], 8);
  a.circ(rx[0], yf, 20, 'EQUIP'); a.circ(rx[1], yf, 20, 'EQUIP'); a.rect(X0, -D, X1, 0, 'EQUIP-DETAIL'); a.line(rx[0], yf, rx[0], yt, 'EQUIP-DETAIL'); a.line(rx[1], yf, rx[1], yt, 'EQUIP-DETAIL');
  const ur = []; for (let k = 0; k < v.rungs; k++) ur.push(L * (0.18 + 0.7 * k / (v.rungs - 1 || 1)));
  for (const u of ur) { const y = yf + u * m.sin(th), z = zb + u * m.cos(th); a.xcyl(rx[0], rx[1], y, z, 12, 10); }
  ur.forEach((u, k) => { if (k % 2 === 1 && v.rungs > 3 && k !== v.rungs - 1) return; const len = m.min(300 + ((k * 7) % 3) * 90, u - 30), x0 = 52 + (k % 2) * 8, x1 = W - 52 - ((k + 1) % 2) * 8; slab(a, yf, x0, x1, u - len, u + 12, 17, 30, th, zb); slab(a, yf, x0 + 8, x1 - 8, u - len * 0.4, u + 10, -28, -17, th, zb); slab(a, yf, x0, x1, u - 4, u + 16, -17, 30, th, zb); a.line(X0 + x0, yf + (u - len) * m.sin(th) - 22, X0 + x1, yf + (u - len) * m.sin(th) - 22, 'EQUIP-DETAIL'); });
  a.log('Added two leaning rails, ' + v.rungs + ' round rungs and folded throws hung over the rungs at different drops (plan and 3D).');
}
function ottoman(a, v) {
  const { X0, X1, YF, YB, cx, cy, Z0, Z1, W, D } = a, legH = v.legs * IN, top = Z1 - (v.tray ? 22 : 0);
  if (v.kind === 'round') {
    const R = W / 2 - 4; a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 0.8, 'EQUIP-DETAIL');
    for (let k = 0; k < 4; k++) { const th = k * PI / 2 + PI / 4; a.tube([[cx + R * 0.6 * m.cos(th), cy + R * 0.6 * m.sin(th), Z0 + legH], [cx + R * 0.72 * m.cos(th), cy + R * 0.72 * m.sin(th), Z0 + 4]], [18, 11], 8); }
    const prof = []; for (let k = 0; k <= 8; k++) { const t = k / 8; prof.push([legH + (top - Z0 - legH) * t, R * (0.94 + 0.06 * m.sin(PI * t))]); } lathe(a, cx, cy, Z0, prof, 28);
    hoop(a, cx, cy, top - 6, R * 0.97, R * 0.97, 4, 28, 5);
    if (v.tray) { hoop(a, cx, cy, top + 6, R * 0.82, R * 0.82, 8, 28, 5); a.cyl(cx, cy, top, top + 6, R * 0.82, 28); a.cyl(cx, cy, Z1 - 4, Z1, R * 0.7, 28); }
  } else {
    a.outline();
    const lid = v.kind === 'cube';
    if (!lid) { for (const [px, py] of [[X0 + 36, YF + 36], [X1 - 36, YF + 36], [X0 + 36, YB - 36], [X1 - 36, YB - 36]]) a.tube([[px, py, Z0 + legH], [px, py, Z0 + 4]], [20, 12], 8); }
    puff(a, X0, YF, X1, YB, Z0 + legH, top, 55, 7);
    rectLoop(a, X0 + 5, YF + 5, X1 - 5, YB - 5, Z0 + legH + 20, 4);
    if (!v.tray) for (let i = 1; i <= v.nx; i++) for (let j = 1; j <= v.ny; j++) { const bx = X0 + W * i / (v.nx + 1), by = YF + D * j / (v.ny + 1); a.ell(bx, by, top - 4, 12, 12, 7, 8, 5); }
    if (lid) { a.box(X0 + 14, YF + 14, top, X1 - 14, YB - 14, top + 6); a.tube([[cx - 70, cy, top + 6], [cx - 70, cy, top + 36], [cx + 70, cy, top + 36], [cx + 70, cy, top + 6]], [7, 7, 7, 7], 6); }
    if (v.tray) { const t0 = top; a.box(X0 + 20, YF + 20, t0, X1 - 20, YB - 20, t0 + 6); a.frame(X0 + 20, t0, X1 - 20, Z1, YF + 20, YF + 30, 8); a.frame(X0 + 20, t0, X1 - 20, Z1, YB - 30, YB - 20, 8); a.box(X0 + 20, YF + 20, t0, X0 + 30, YB - 20, Z1); a.box(X1 - 30, YF + 20, t0, X1 - 20, YB - 20, Z1); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL'); }
    else a.rect(X0 + 14, YF + 14, X1 - 14, YB - 14, 'EQUIP-DETAIL');
  }
  a.log('Added the ' + (v.kind === 'cube' ? 'lidded storage body with a carry strap' : 'upholstered body') + (v.legs && v.kind !== 'cube' ? ' on four tapered legs' : '') + (v.tray ? ' and a raised tray top' : v.kind === 'round' ? '' : ' with a button grid') + ' (plan and 3D).');
}
function sheerCanopy(a, v) {
  const { cx, cy, Z0, Z1, W } = a, R = v.hoopR * IN, n = v.strands, flare = W / 2 - 14 - R;
  a.cyl(cx, cy, Z1 - 16, Z1, 36, 14); a.circ(cx, cy, 36, 'EQUIP-DETAIL');
  hoop(a, cx, cy, Z1 - 70, R, R, 9, 36, 6);
  ring(4, R * 0.98, (th, x, y) => a.tube([[cx, cy, Z1 - 16], [cx + x, cy + y, Z1 - 70]], [3, 3], 4));
  ring(n, R, (th, x, y, k) => {
    const amp = 18 * m.sin(k * 1.9), pts = [], rs = [];
    for (let j = 0; j <= 6; j++) { const t = j / 6, rr = R + flare * m.pow(t, 1.6) * (1 + 0.12 * m.sin(k * 2.7)) + amp * m.sin(t * PI) * 0.4; pts.push([cx + (R + (rr - R)) * m.cos(th), cy + rr * m.sin(th), Z1 - 70 - (Z1 - 70 - Z0 - 4) * t]); rs.push(5 + 3 * t); }
    a.tube(pts, rs, 5);
  });
  hoop(a, cx, cy, Z0 + 6, R + flare, R + flare, 6, 36, 5); a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R + flare, 'EQUIP-DETAIL');
  a.log('Added the ceiling hook and canopy, a hoop on four cords and ' + n + ' flowing sheer strands flaring to the floor with a pooled hem (plan and 3D).');
}

// ================================================================================== ACCESSORIES
function candlestick(a, v) {
  const { X0, Z0, W, D, cy } = a, n = v.hs.length;
  v.hs.forEach((hin, i) => {
    const x = X0 + (W * (i + 0.5)) / n, h = hin * IN, br = m.min(W / (2 * n) - 4, D / 2 - 4, h * 0.2), hh = h * 0.56, r = br;
    a.circ(x, cy, br, 'EQUIP'); a.circ(x, cy, br * 0.32, 'EQUIP-DETAIL');
    if (v.style === 'baluster') lathe(a, x, cy, Z0, [[0, br], [hh * 0.05, br], [hh * 0.1, br * 0.55], [hh * 0.22, br * 0.3], [hh * 0.38, br * 0.5], [hh * 0.5, br * 0.28], [hh * 0.7, br * 0.38], [hh * 0.8, br * 0.3], [hh * 0.88, br * 0.6], [hh, br * 0.55]], 22);
    else if (v.style === 'column') { a.box(x - br, cy - br, Z0, x + br, cy + br, Z0 + hh * 0.1); a.box(x - br * 0.45, cy - br * 0.45, Z0 + hh * 0.1, x + br * 0.45, cy + br * 0.45, Z0 + hh * 0.86); a.box(x - br * 0.8, cy - br * 0.8, Z0 + hh * 0.86, x + br * 0.8, cy + br * 0.8, Z0 + hh); }
    else { a.cyl(x, cy, Z0, Z0 + hh * 0.06, br, 22); lathe(a, x, cy, Z0 + hh * 0.06, [[0, br * 0.3], [hh * 0.78, br * 0.22]], 14); lathe(a, x, cy, Z0 + hh * 0.84, [[0, br * 0.2], [hh * 0.08, br * 0.6], [hh * 0.16, br * 0.6]], 18); }
    a.cyl(x, cy, Z0 + hh, Z0 + h - 18, br * 0.3, 12); flame(a, x, cy, Z0 + h - 8);
  });
  a.log('Added ' + (n === 1 ? 'a ' : n + ' ') + v.style + ' candlestick' + (n > 1 ? 's' : '') + ' with a round foot, a stem, a cup, a candle and a flame (plan and 3D).');
}
function pedBowl(a, v) {
  const { cx, cy, Z0, Z1, W } = a, R = W / 2 - 4;
  a.circ(cx, cy, R, 'EQUIP');
  if (v.kind === 'tier') {
    const n = v.plates, st = (a.H - 40) / n; a.cyl(cx, cy, Z0, Z0 + 14, R * 0.5, 22); a.cyl(cx, cy, Z0, Z1 - 20, 7, 8);
    for (let k = 0; k < n; k++) { const r = R * (1 - k * 0.3), z = Z0 + 40 + k * st; lathe(a, cx, cy, z, [[0, r * 0.2], [6, r], [14, r], [22, r * 0.96]], 28); hoop(a, cx, cy, z + 22, r * 0.96, r * 0.96, 3, 28, 4); if (k === 0) a.circ(cx, cy, r, 'EQUIP-DETAIL'); ring(5, r * 0.5, (th, x, y) => a.ell(cx + x, cy + y, z + 36, 28, 28, 14, 8, 5)); }
    a.cyl(cx, cy, Z1 - 20, Z1 - 4, 10, 8); a.ell(cx, cy, Z1 - 4, 14, 14, 12, 8, 6);
  } else {
    const fh = v.foot * IN, bh = a.H - fh - (v.kind === 'empty' ? 0 : 60); a.cyl(cx, cy, Z0, Z0 + 10, R * 0.5, 24); a.cyl(cx, cy, Z0 + 10, Z0 + fh, 14, 12); a.ell(cx, cy, Z0 + fh * 0.55, 26, 26, 22, 10, 6);
    lathe(a, cx, cy, Z0 + fh, [[0, 18], [bh * 0.12, R * 0.45], [bh * 0.45, R * 0.85], [bh * 0.82, R * 0.97], [bh, R]], 28); hoop(a, cx, cy, Z0 + fh + bh, R, R, 4, 28, 5); a.circ(cx, cy, R * 0.9, 'EQUIP-DETAIL');
    const zt = Z0 + fh + bh;
    if (v.kind === 'fruit') ring(7, R * 0.55, (th, x, y, k) => a.ell(cx + x, cy + y, zt + 6 + (k % 2) * 14, 36, 36, 34, 10, 7)), a.ell(cx, cy, zt + 24, 38, 38, 36, 10, 7);
    if (v.kind === 'orbs') ring(5, R * 0.5, (th, x, y, k) => a.ell(cx + x, cy + y, zt + 10 + (k % 2) * 12, 28, 28, 28, 10, 7)), a.ell(cx, cy, zt + 24, 30, 30, 30, 10, 7);
    if (v.kind === 'pebbles') for (let k = 0; k < 9; k++) { const th = k * 2.2; a.ell(cx + R * 0.6 * m.cos(th) * (k / 9 + 0.2), cy + R * 0.6 * m.sin(th) * (k / 9 + 0.2), zt - 6 + (k % 3) * 8, 26, 22, 14, 8, 5); }
  }
  a.log('Added the ' + (v.kind === 'tier' ? v.plates + ' stacked plates on a centre rod with a top handle' : 'footed pedestal, stem and flared bowl') + (v.kind === 'fruit' ? ' filled with fruit shapes' : v.kind === 'orbs' ? ' holding decorative orbs' : v.kind === 'pebbles' ? ' holding pebbles' : '') + ' (plan and 3D).');
}
function photoFrame(a, v) {
  const { X0, X1, cx, Z0, Z1, W, D } = a, th = 0.2, ft = v.ft * IN, t = 22, Hf = (a.H - 16) / m.cos(th), yb = -D + t * m.cos(th) + 10;
  slab(a, yb, 0, W, 0, Hf, -10, 0, th, Z0);
  slab(a, yb, 0, ft, 0, Hf, 0, t, th, Z0); slab(a, yb, W - ft, W, 0, Hf, 0, t, th, Z0); slab(a, yb, ft, W - ft, 0, ft, 0, t, th, Z0); slab(a, yb, ft, W - ft, Hf - ft, Hf, 0, t, th, Z0);
  slab(a, yb, ft, W - ft, ft, Hf - ft, 0, t * 0.35, th, Z0);
  const mw = (W - 2 * ft) * 0.14; slab(a, yb, ft + mw, W - ft - mw, ft + mw, Hf - ft - mw, t * 0.35, t * 0.5, th, Z0);
  for (let k = 0; k < 3; k++) slab(a, yb, ft + mw + k * (W - 2 * ft - 2 * mw) / 3.3, ft + mw + (k + 1) * (W - 2 * ft - 2 * mw) / 3.3 - 8, ft + mw, ft + mw + (Hf - 2 * ft - 2 * mw) * (0.5 + 0.15 * ((k * 2) % 3)), t * 0.5, t * 0.62, th, Z0);
  const sy = yb + 0.6 * Hf * m.sin(th), sz = Z0 + 0.6 * Hf * m.cos(th), ey = m.min(-8, sy + 100); a.tube([[cx, sy, sz], [cx, ey, Z0 + 6]], [6, 8], 6);
  a.box(X0 + 20, yb - t * m.cos(th) - 2, Z0, X1 - 20, yb - t * m.cos(th) + 14, Z0 + 4);
  a.rect(X0, yb - 20, X1, yb + 4, 'EQUIP'); a.line(cx, sy, cx, ey, 'EQUIP-DETAIL'); a.rect(X0 + ft, yb - 14, X1 - ft, yb, 'EQUIP-DETAIL');
  a.log('Added a frame leaning on a rear strut, with a back board, a border, a mat and a print with a few stripes (plan and 3D).');
}
function cloche(a, v) {
  const { cx, cy, Z0, Z1, W } = a, R = W / 2 - 10, bh = 26, dh = a.H - bh - 18;
  a.circ(cx, cy, R + 8, 'EQUIP'); a.circ(cx, cy, R, 'EQUIP-DETAIL');
  a.cyl(cx, cy, Z0, Z0 + bh, R + 8, 32); a.cyl(cx, cy, Z0 + bh, Z0 + bh + 6, R + 3, 32);
  const zb = Z0 + bh + 6, pr = (t) => v.shape === 'bell' ? [R * m.cos(t * PI / 2 * 0.98), t * dh] : v.shape === 'cyl' ? [R, t < 0.9 ? t * dh : dh * (0.9 + 0.1 * (1 - (t - 0.9) * 10 * 0.0))] : [R * m.cos(t * PI / 2 * 0.98), t * dh];
  const merid = v.shape === 'cyl' ? 10 : 8;
  for (let k = 0; k < merid; k++) { const th = (k / merid) * 2 * PI, pts = [], rs = []; for (let j = 0; j <= 10; j++) { const t = j / 10, [rr, zz] = v.shape === 'cyl' ? [R, t * dh] : pr(t); pts.push([cx + rr * m.cos(th), cy + rr * m.sin(th), zb + zz]); rs.push(2.6); } a.tube(pts, rs, 4); }
  for (const t of [0.0, 0.33, 0.66, 0.95]) { const rr = v.shape === 'cyl' ? R : R * m.cos(t * PI / 2 * 0.98); if (rr > 8) hoop(a, cx, cy, zb + t * dh * (v.shape === 'cyl' ? 1 : 1), rr, rr, 3, 28, 4); }
  if (v.shape === 'cyl') a.cyl(cx, cy, zb + dh - 3, zb + dh, R, 28);
  a.cyl(cx, cy, zb + dh, zb + dh + 8, 14, 10); a.ell(cx, cy, zb + dh + 12, 14, 14, 10, 8, 6);
  const top = zb + dh * 0.6;
  if (v.inside === 'pear') { a.ell(cx, cy, zb + 40, 40, 40, 40, 12, 8); a.ell(cx, cy, zb + 92, 28, 28, 36, 12, 8); a.tube([[cx, cy, zb + 124], [cx + 6, cy, zb + 150]], [3, 3], 4); }
  else if (v.inside === 'plant') { a.cyl(cx, cy, zb, zb + 60, R * 0.3, 14); ring(7, R * 0.2, (th, x, y, k) => a.ell(cx + x * 1.4, cy + y * 1.4, zb + 80 + (k % 3) * 22, 9, 9, 40, 8, 6)); }
  else if (v.inside === 'stones') { for (let k = 0; k < 3; k++) a.ell(cx, cy, zb + 20 + k * 34 - 0, (60 - k * 12), (52 - k * 10), 18, 14, 6); }
  else { a.cyl(cx, cy, zb, zb + 52, R * 0.45, 20); a.cyl(cx, cy, zb + 52, zb + 98, R * 0.32, 18); a.ell(cx, cy, zb + 104, 16, 16, 8, 8, 5); }
  a.log('Added the turned base, a glass dome drawn as ribs and rings with a knob, and a ' + v.inside + ' inside (plan and 3D).');
}
function hangPlanter(a, v) {
  const { cx, cy, Z0, Z1, W } = a, pr = v.potR * IN, zp = Z0 + a.H * v.at, ph = pr * 1.15;
  a.cyl(cx, cy, Z1 - 14, Z1, 40, 14); a.circ(cx, cy, 40, 'EQUIP-DETAIL'); a.ell(cx, cy, Z1 - 40, 20, 20, 20, 8, 6);
  const pots = v.two ? [[zp + ph + (a.H * 0.2), pr * 0.8], [zp, pr]] : [[zp, pr]];
  pots.forEach(([zz, r], idx) => {
    const h = r * 1.1; lathe(a, cx, cy, zz, [[0, r * 0.62], [h * 0.8, r * 0.95], [h, r]], 24); hoop(a, cx, cy, zz + h - 4, r + 3, r + 3, 6, 24, 5); a.cyl(cx, cy, zz + h, zz + h + 4, r * 0.92, 24);
    ring(8, r * 0.45, (th, x, y, k) => a.ell(cx + x * 1.8, cy + y * 1.8, zz + h + 50 + (k % 3) * 26, 18, 18, 62, 8, 6));
    ring(4, r * 1.05, (th, x, y) => { a.tube([[cx, cy, idx ? zz + h + 180 : Z1 - 40], [cx + x, cy + y, zz + h]], [3, 3], 4); a.tube([[cx + x, cy + y, zz + h], [cx + x * 0.5, cy + y * 0.5, zz - 34]], [3, 3], 4); });
    a.ell(cx, cy, zz - 40, 18, 18, 16, 8, 6);
    if (idx === pots.length - 1) ring(12, 16, (th, x, y) => a.tube([[cx + x, cy + y, zz - 44], [cx + x * 1.8, cy + y * 1.8, m.max(Z0 + 4, zz - 190)]], [4, 3], 4));
  });
  a.circ(cx, cy, pr + 3, 'EQUIP'); a.circ(cx, cy, pr * 0.62, 'EQUIP-DETAIL');
  a.log('Added the ceiling hook, cords knotted into a sling, ' + (v.two ? 'two pots, ' : 'a pot with a rim band, ') + 'leaves and a fringe below the knot (plan and 3D).');
}
function magRack(a, v) {
  const { X0, X1, cx, Z0, Z1, W, D } = a, t = 20;
  const side = (x0) => prismX(a, [[-D, Z0], [0, Z0], [0, Z1], [-D * 0.42, Z1], [-D, Z0 + a.H * 0.34]], x0, x0 + t);
  a.rect(X0, -D, X1, 0, 'EQUIP');
  if (v.kind === 'sling') {
    side(X0); side(X1 - t); const cv = []; for (let k = 0; k <= 8; k++) { const f = k / 8; cv.push([-D * 0.9 + f * D * 0.82, Z0 + a.H * (0.42 + 0.48 * f - 0.22 * m.sin(PI * f))]); }
    for (let k = 0; k < 8; k++) { const [y0, z0] = cv[k], [y1, z1] = cv[k + 1]; prismX(a, [[y0, z0], [y1, z1], [y1, z1 + 7], [y0, z0 + 7]], X0 + t, X1 - t); }
    a.rect(X0 + t, -D * 0.9, X1 - t, -D * 0.08, 'EQUIP-DETAIL');
  } else if (v.kind === 'wire') {
    a.box(X0, -D, Z0, X1, 0, Z0 + 8); for (const x of [X0 + 5, X1 - 5]) { a.tube([[x, -D + 6, Z0 + 6], [x, -D + 6, Z0 + a.H * 0.34], [x, -D * 0.5, Z0 + a.H * 0.7], [x, -6, Z1 - 6]], [4, 4, 4, 4], 6); a.tube([[x, -6, Z1 - 6], [x, -6, Z0 + 6]], [4, 4], 6); }
    for (let k = 0; k < 9; k++) { const x = X0 + 5 + ((W - 10) * k) / 8; a.tube([[x, -D + 6, Z0 + 6], [x, -D + 6, Z0 + a.H * 0.3]], [2.5, 2.5], 4); a.tube([[x, -6, Z0 + 6], [x, -6, Z1 - 20]], [2.5, 2.5], 4); }
    a.xcyl(X0 + 5, X1 - 5, -D + 6, Z0 + a.H * 0.3, 3, 6); a.xcyl(X0 + 5, X1 - 5, -6, Z1 - 8, 4, 8);
    a.tube([[X0 + 5, -D * 0.5, Z0 + a.H * 0.7], [cx, -D * 0.5, Z0 + a.H * 0.7 + 30], [X1 - 5, -D * 0.5, Z0 + a.H * 0.7]], [5, 5, 5], 8);
  } else {
    side(X0); side(X1 - t); a.box(X0 + t, -D, Z0, X1 - t, 0, Z0 + 18); a.box(X0 + t, -22, Z0 + 18, X1 - t, 0, Z0 + 150); a.box(X0 + t, -D, Z0 + 18, X1 - t, -D + 18, Z0 + a.H * 0.2);
    if (v.divider) a.box(cx - 8, -D, Z0 + 18, cx + 8, -20, Z0 + a.H * 0.34);
  }
  const nm = v.nm, cw = (W - 2 * t - 40) / nm, th = 0.16, sling = v.kind === 'sling', zb = sling ? Z0 + a.H * 0.44 : Z0 + (v.kind === 'wire' ? 24 : 40), yb = sling ? -D * 0.5 : -D * (v.kind === 'wire' ? 0.6 : 0.7);
  for (let k = 0; k < nm * 2; k++) { const col = k % nm, lay = m.floor(k / nm), sx = X0 + t + 20 + col * cw; slab(a, yb + lay * 70, sx - X0 + 8, sx - X0 + cw - 8, 0, a.H * (sling ? 0.4 : 0.55) - ((k * 37) % 5) * 12, 0, 8, th, zb); }
  a.log('Added the ' + (v.kind === 'wire' ? 'wire frame with a carry arch' : v.kind === 'sling' ? 'two side frames and a draped sling' : 'sloped side panels, a base, a back rail' + (v.divider ? ' and a centre divider' : '')) + ' and a few leaning magazines (plan and 3D).');
}
function bookStack(a, v) {
  const { X0, X1, YF, YB, cx, cy, Z0, Z1, W, D } = a; let z = Z0;
  v.books.forEach(([w, d, h], i) => {
    const bw = w * IN, bd = d * IN, bh = h * IN, ox = ((i * 29) % 7 - 3) * 6, oy = ((i * 17) % 5 - 2) * 5, x0 = cx + ox - bw / 2, x1 = cx + ox + bw / 2, y0 = cy + oy - bd / 2, y1 = cy + oy + bd / 2, c = 4;
    a.box(x0, y0, z, x1, y1, z + c); a.box(x0, y0, z + bh - c, x1, y1, z + bh); a.box(x0, y0, z + c, x0 + 7, y1, z + bh - c);
    a.box(x0 + 7, y0 + 3, z + c, x1 - 3, y1 - 3, z + bh - c);
    a.rect(x0, y0, x1, y1, i ? 'EQUIP-DETAIL' : 'EQUIP'); a.line(x0 + 7, y0, x0 + 7, y1, 'EQUIP-DETAIL');
    z += bh;
  });
  if (v.top === 'bowl') { lathe(a, cx, cy, z, [[0, 30], [12, 70], [40, 105], [56, 118]], 22); a.circ(cx, cy, 118, 'EQUIP-DETAIL'); }
  else if (v.top === 'plant') { a.cyl(cx, cy, z, z + 70, 48, 16); ring(7, 18, (th, x, y, k) => a.ell(cx + x * 1.6, cy + y * 1.6, z + 90 + (k % 3) * 20, 16, 16, 52, 8, 6)); }
  else if (v.top === 'orb') a.ell(cx, cy, z + 50, 52, 52, 50, 14, 8);
  a.log('Added ' + v.books.length + ' hardcover books stacked with a slight offset, each with covers, a spine and page blocks' + (v.top && v.top !== 'none' ? ', topped with a ' + v.top : '') + ' (plan and 3D).');
}
function umbrellaStand(a, v) {
  const { cx, cy, Z0, Z1, W, D } = a, R = W / 2 - 4, bh = a.H * 0.62;
  if (v.kind === 'square') { a.rect(cx - R, cy - R, cx + R, cy + R, 'EQUIP'); a.box(cx - R, cy - R, Z0, cx + R, cy + R, Z0 + bh); a.box(cx - R - 0, cy - R, Z0 + bh - 14, cx + R, cy + R, Z0 + bh); a.box(cx - R + 12, cy - R + 12, Z0 + bh, cx + R - 12, cy - R + 18, Z0 + bh + 4); }
  else { a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R - 12, 'EQUIP-DETAIL'); lathe(a, cx, cy, Z0, v.kind === 'tapered' ? [[0, R * 0.72], [bh * 0.5, R * 0.88], [bh, R]] : [[0, R * 0.98], [bh, R * 0.98]], 28); hoop(a, cx, cy, Z0 + bh - 8, R + 2, R + 2, 6, 28, 5); hoop(a, cx, cy, Z0 + 20, R * (v.kind === 'tapered' ? 0.75 : 1) + 2, R * (v.kind === 'tapered' ? 0.75 : 1) + 2, 4, 28, 4); }
  for (let k = 0; k < v.n; k++) {
    const th = (k / v.n) * 2 * PI + 0.6, rr = R * 0.38 * (v.n > 1 ? 1 : 0), x = cx + rr * m.cos(th), y = cy + rr * m.sin(th), hz = Z1 - 8 - (k % 2) * 40, d = (k % 2 ? 1 : -1);
    a.tube([[x, y, Z0 + bh * 0.3], [x, y, hz - 40]], [8, 7], 8);
    if (v.cane && k === 0) { a.tube([[x, y, hz - 40], [x, y, hz - 14], [x + 22 * d, y, hz]], [8, 8, 8], 6); } else a.tube([[x, y, hz - 40], [x, y, hz - 30], [x + d * 8, y, hz - 14], [x + d * 28, y, hz - 12], [x + d * 44, y, hz - 34]], [8, 9, 9, 9, 9], 7);
    a.cyl(x, y, Z0 + bh * 0.3 - 40, Z0 + bh * 0.3, 11, 8);
  }
  a.cyl(cx, cy, Z0, Z0 + 10, R * (v.kind === 'tapered' ? 0.78 : 1.02), 28);
  a.log('Added the ' + v.kind + ' stand body with a rim band and base, and ' + v.n + ' umbrellas standing in it with curved handles (plan and 3D).');
}

// ================================================================================== FINISHES
function beam(a, v) {
  const { X0, X1, cx, Z0, Z1, W, D } = a, blk = v.kind === 'hewn' || v.kind === 'box' ? 76 : 0, zb = Z0 + blk;
  if (blk) for (const [x0, x1] of [[X0, X0 + 150], [X1 - 150, X1]]) { a.box(x0, -D, Z0, x1, 0, zb); a.box(x0 - 0, -D, Z0 + blk - 14, x1, 0, zb); }
  if (v.kind === 'hewn') {
    const c = 36, bz0 = zb, bz1 = Z1; prismX(a, [[-D, bz0 + c], [-D + c, bz0], [-c, bz0], [0, bz0 + c], [0, bz1 - c], [-c, bz1], [-D + c, bz1], [-D, bz1 - c]], X0, X1);
    for (const x of [X0 + W * 0.12, X1 - W * 0.12]) { a.box(x - 22, -D - 0.0, bz0 + 14, x + 22, -D + 6, bz1 - 14); for (const z of [bz0 + 40, bz1 - 40]) a.ycyl(-D, -D + 14, x, z, 11, 8); }
    for (let k = 0; k < 7; k++) a.box(X0 + 120 + ((k * 211) % (W - 300)), -D - 0.0, bz0 + 30 + (k * 37) % 120, X0 + 160 + ((k * 211) % (W - 300)), -D + 3, bz0 + 36 + (k * 37) % 120);
  } else if (v.kind === 'box') {
    const t = 22; a.box(X0, -D, zb, X1, -D + t, Z1); a.box(X0, -D, zb, X1, 0, zb + t); a.box(X0, -t, zb, X1, 0, Z1);
    a.box(X0 + t, -D + t, Z1 - t, X1 - t, -t, Z1); for (const x of [X0, X1 - 30]) a.box(x, -D, zb, x + 30, 0, Z1);
    a.box(X0 + 30, -D + t, zb, X1 - 30, -t, zb + t * 0.5);
    a.box(X0 + 30, -D, zb + (Z1 - zb) * 0.5 - 3, X1 - 30, -D + 5, zb + (Z1 - zb) * 0.5 + 3);
  } else if (v.kind === 'corbel') {
    const bh = (Z1 - Z0) * 0.62, bz = Z1 - bh; a.box(X0, -D, bz, X1, 0, Z1);
    for (const x of [X0 + 40, X1 - 40 - 150]) { const w = 150; for (let k = 0; k < 4; k++) a.box(x + k * 4, -D * (0.35 + 0.18 * k), bz - 40 * (k + 1), x + w - k * 4, 0, bz - 40 * k); a.ycyl(-D * 0.78, -D * 0.5, x + w / 2, bz - 60, 14, 10); }
    a.box(X0, -D + 3, bz + 30, X1, -D + 9, bz + 38);
  } else {
    const tb = 120, zt = Z0 + tb;
    prismX(a, [[-D, Z0 + 22], [-D + 22, Z0], [-22, Z0], [0, Z0 + 22], [0, zt - 12], [-D, zt - 12]], X0, X1);
    a.box(cx - 70, -D * 0.8, zt - 12, cx + 70, -D * 0.2, zt + 14);
    a.box(cx - 55, -D * 0.78, zt + 14, cx + 55, -D * 0.22, Z1 - 50);
    for (const s of [-1, 1]) a.tube([[cx + s * 40, -D * 0.5, Z1 - 80], [cx + s * W * 0.36, -D * 0.5, zt + 10]], [38, 38], 4);
    for (const s of [-1, 1]) a.box(cx + s * W * 0.36 - 60, -D * 0.78, zt - 12, cx + s * W * 0.36 + 60, -D * 0.22, zt + 40);
    a.box(cx - 90, -D * 0.82, Z1 - 60, cx + 90, -D * 0.18, Z1);
    a.box(cx - 16, -D * 0.85, zt + 30, cx + 16, -D * 0.15, zt + 150);
  }
  a.rect(X0, -D, X1, 0, 'EQUIP'); a.rect(X0, -D * 0.82, X1, -D * 0.18, 'EQUIP-DETAIL');
  a.log('Added the ' + (v.kind === 'hewn' ? 'chamfered hewn beam on end blocks with two iron straps, bolt heads and adze marks' : v.kind === 'box' ? 'boxed beam shell on end blocks with end returns and a groove line' : v.kind === 'corbel' ? 'beam with two stepped corbels beneath its ends' : 'tie beam with a king post, two angled struts and iron plates') + ' (plan and 3D).');
}
function coffer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, bw = v.bw * IN, tp = 30, rim = 70;
  a.box(X0, YF, Z1 - tp, X1, YB, Z1); a.outline();
  const nx = v.nx, ny = v.ny, cw = (W - 2 * rim) / nx, cd = (D - 2 * rim) / ny;
  a.box(X0, YF, Z1 - tp - 50, X1, YF + rim, Z1 - tp); a.box(X0, YB - rim, Z0, X1, YB, Z1 - tp); a.box(X0, YF + rim, Z0, X0 + rim, YB - rim, Z1 - tp); a.box(X1 - rim, YF + rim, Z0, X1, YB - rim, Z1 - tp);
  for (let i = 1; i < nx; i++) { const x = X0 + rim + i * cw; a.box(x - bw / 2, YF + rim, Z0, x + bw / 2, YB - rim, Z1 - tp); a.line(x, YF, x, YB, 'EQUIP-DETAIL'); }
  for (let j = 1; j < ny; j++) { const y = YF + rim + j * cd; a.box(X0 + rim, y - bw / 2, Z0 + 12, X1 - rim, y + bw / 2, Z1 - tp); a.line(X0, y, X1, y, 'EQUIP-DETAIL'); }
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const x = X0 + rim + (i + 0.5) * cw, y = YF + rim + (j + 0.5) * cd;
    a.box(x - cw / 2 + bw / 2 + 14, y - cd / 2 + bw / 2 + 14, Z1 - tp - 12, x + cw / 2 - bw / 2 - 14, y + cd / 2 - bw / 2 - 14, Z1 - tp);
    if (v.lights) { a.cyl(x, y, Z1 - tp - 22, Z1 - tp - 12, 80, 18); a.cyl(x, y, Z1 - tp - 26, Z1 - tp - 22, 62, 18); a.circ(x, y, 80, 'EQUIP-DETAIL'); } else { a.ell(x, y, Z1 - tp - 12, 60, 60, 12, 14, 5); a.circ(x, y, 60, 'EQUIP-DETAIL'); }
  }
  a.rect(X0 + rim, YF + rim, X1 - rim, YB - rim, 'EQUIP-DETAIL');
  a.log('Added the ceiling deck, the border beams, ' + (nx - 1) + ' cross beams one way and ' + (ny - 1) + ' the other, stepped panel ledges and a ' + (v.lights ? 'recessed downlight' : 'rosette') + ' in each of the ' + nx * ny + ' coffers (plan and 3D).');
}
function medallion(a, v) {
  const { cx, cy, Z0, Z1, W } = a, R = W / 2 - 4, H = a.H;
  a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 0.84, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.58, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.2, 'EQUIP-DETAIL');
  a.cyl(cx, cy, Z1 - H * 0.35, Z1, R, 40); hoop(a, cx, cy, Z1 - H * 0.35, R - 4, R - 4, H * 0.18, 40, 6);
  a.cyl(cx, cy, Z1 - H * 0.6, Z1 - H * 0.3, R * 0.8, 36); hoop(a, cx, cy, Z1 - H * 0.6, R * 0.8, R * 0.8, H * 0.1, 36, 6);
  const n = v.petals; for (let k = 0; k < n; k++) { const th = (k / n) * 2 * PI, rr = R * 0.52; a.ell(cx + rr * m.cos(th), cy + rr * m.sin(th), Z1 - H * 0.62, R * 0.15, R * 0.06, H * 0.2, 10, 6); const x = cx + rr * m.cos(th), y = cy + rr * m.sin(th); a.tube([[cx + R * 0.3 * m.cos(th), cy + R * 0.3 * m.sin(th), Z1 - H * 0.55], [x, y, Z1 - H * 0.7], [cx + R * 0.74 * m.cos(th), cy + R * 0.74 * m.sin(th), Z1 - H * 0.62]], [4, 5, 3], 5); a.line(cx + R * 0.3 * m.cos(th), cy + R * 0.3 * m.sin(th), cx + R * 0.8 * m.cos(th), cy + R * 0.8 * m.sin(th), 'EQUIP-DETAIL'); }
  a.cyl(cx, cy, Z1 - H * 0.8, Z1 - H * 0.55, R * 0.24, 24); a.ell(cx, cy, Z1 - H * 0.8, R * 0.2, R * 0.2, H * 0.2, 14, 8);
  hoop(a, cx, cy, Z1 - H * 0.55, R * 0.24, R * 0.24, 4, 24, 5);
  a.log('Added the outer rim bead, two stepped raised bands, ' + n + ' leaf petals with centre ribs and a domed centre boss (plan and 3D).');
}
function radCover(a, v) {
  const { X0, X1, YF, YB, cx, Z0, Z1, W, D } = a, pl = 4 * IN, top = 24, st = 55;
  a.outline(); a.rect(X0 + 20, YF + 10, X1 - 20, YB - 10, 'EQUIP-DETAIL');
  a.box(X0, YF, Z0, X1, YB, Z0 + pl); a.box(X0 + 8, YF + 8, Z0 + pl, X0 + st, YB, Z1 - top); a.box(X1 - st, YF + 8, Z0 + pl, X1 - 8, YB, Z1 - top); a.box(X0 + st, YF + 8, Z0 + pl, X1 - st, YB, Z0 + pl + 40); a.box(X0 + st, YF + 8, Z1 - top - 40, X1 - st, YB, Z1 - top); a.box(X0 + st, YB - 20, Z0 + pl + 40, X1 - st, YB, Z1 - top - 40);
  a.box(X0, YF, Z1 - top, X1, YB, Z1); a.box(X0 - 0, YF + 4, Z1 - top - 8, X1, YB, Z1 - top);
  const gx0 = X0 + st, gx1 = X1 - st, gz0 = Z0 + pl + 40, gz1 = Z1 - top - 40;
  // the radiator behind the grille
  for (let k = 0; k < 9; k++) { const x = gx0 + 20 + ((gx1 - gx0 - 60) * k) / 8; a.box(x, YB - 100, gz0 + 30, x + 30, YB - 20, gz1 - 20); }
  a.xcyl(gx0 + 10, gx1 - 10, YB - 60, gz0 + 22, 10, 8); a.xcyl(gx0 + 10, gx1 - 10, YB - 60, gz1 - 10, 10, 8);
  const fy0 = YF + 8, fy1 = YF + 22; a.frame(gx0, gz0, gx1, gz1, fy0, fy1, 36);
  if (v.grille === 'slat') { const n = m.floor((gx1 - gx0) / 40); for (let k = 0; k < n; k++) a.box(gx0 + 36 + k * (gx1 - gx0 - 72) / n + 4, fy0 + 3, gz0 + 36, gx0 + 36 + k * (gx1 - gx0 - 72) / n + 20, fy1 - 3, gz1 - 36); }
  else if (v.grille === 'lattice') { const n = m.floor((gx1 - gx0) / 46), q = m.floor((gz1 - gz0) / 46); for (let k = 1; k < n; k++) a.box(gx0 + k * (gx1 - gx0) / n - 7, fy0 + 3, gz0 + 36, gx0 + k * (gx1 - gx0) / n + 7, fy0 + 11, gz1 - 36); for (let k = 1; k < q; k++) a.box(gx0 + 36, fy0 + 11, gz0 + k * (gz1 - gz0) / q - 7, gx1 - 36, fy1 - 3, gz0 + k * (gz1 - gz0) / q + 7); }
  else { const q = m.floor((gz1 - gz0 - 60) / 34); for (let k = 0; k < q; k++) { const z = gz0 + 40 + k * (gz1 - gz0 - 80) / q; prismX(a, [[fy0, z], [fy1 + 8, z + 18], [fy1 + 8, z + 25], [fy0, z + 8]], gx0 + 36, gx1 - 36); } }
  a.log('Added the plinth, the carcass with a framed ' + v.grille + ' grille, the radiator fins and pipes behind it and an overhanging top shelf (plan and 3D).');
}
function pilaster(a, v) {
  const { X0, X1, cx, Z0, Z1, W, D } = a, H = a.H;
  const one = (x, pw) => {
    const pd = D, bz = H * 0.07, pz = H * 0.07, cz = H * 0.1, sz0 = Z0 + bz + pz, sz1 = Z1 - cz - 24;
    a.box(x - pw / 2, -pd, Z0, x + pw / 2, 0, Z0 + bz); a.box(x - pw * 0.44, -pd * 0.92, Z0 + bz, x + pw * 0.44, 0, Z0 + bz + pz);
    a.rect(x - pw / 2, -pd, x + pw / 2, 0, 'EQUIP');
    if (v.kind === 'round') {
      const r = pw * 0.4; a.circ(x, -r - 20, r, 'EQUIP-DETAIL'); lathe(a, x, -r - 20, sz0, [[0, r * 1.06], [60, r], [(sz1 - sz0) * 0.5, r * 0.94], [sz1 - sz0, r * 0.88]], 28);
      ring(12, r * 0.94, (th, px, py) => a.tube([[x + px, -r - 20 + py, sz0 + 60], [x + px * 0.94, -r - 20 + py * 0.94, sz1]], [3.5, 3.5], 4));
      hoop(a, x, -r - 20, sz0 + 40, r * 1.06, r * 1.06, 14, 28, 5); hoop(a, x, -r - 20, sz1 - 10, r * 0.9, r * 0.9, 10, 28, 5); a.cyl(x, -r - 20, sz1, sz1 + 24, r * 1.04, 28);
      a.cyl(x, -r - 20, Z1 - cz, Z1 - cz + 30, r * 1.3, 28); a.box(x - r * 1.36, -r * 1.36 - 6, Z1 - cz + 30, x + r * 1.36, r * 1.36 - 6 > 0 ? -2 : r * 1.36 - 6, Z1);
      return;
    }
    const sw = pw * 0.78, sd = pd * 0.78, nf = v.kind === 'fluted' ? m.max(3, m.round(sw / 55) * 2 + 1) : 1, fw = sw / nf;
    if (v.kind === 'fluted') for (let k = 0; k < nf; k++) a.box(x - sw / 2 + k * fw + 2, -sd * (k % 2 ? 0.86 : 1), sz0, x - sw / 2 + (k + 1) * fw - 2, 0, sz1);
    else { a.box(x - sw / 2, -sd * 0.8, sz0, x + sw / 2, 0, sz1); a.box(x - sw * 0.3, -sd, sz0 + (sz1 - sz0) * 0.12, x + sw * 0.3, -sd * 0.8, sz1 - (sz1 - sz0) * 0.12); a.rect(x - sw * 0.3, -sd, x + sw * 0.3, -sd * 0.8, 'EQUIP-DETAIL'); }
    a.box(x - sw * 0.54, -sd * 1.0, sz1, x + sw * 0.54, 0, sz1 + 24); a.box(x - pw * 0.5, -pd * 0.96, sz1 + 24, x + pw * 0.5, 0, Z1 - 28); a.box(x - pw * 0.5, -pd * 0.1, sz1 + 24, x + pw * 0.5, 0, Z1 - 28);
    for (const s of [-1, 1]) { a.ycyl(-pd * 0.96, -pd * 0.3, x + s * pw * 0.36, sz1 + 24 + (Z1 - 28 - sz1 - 24) * 0.55, m.min((Z1 - 28 - sz1 - 24) * 0.34, pw * 0.15), 14); }
    a.box(x - pw * 0.52, -pd, Z1 - 28, x + pw * 0.52, 0, Z1);
  };
  if (v.n === 2) { const pw = v.pw * IN; one(X0 + pw / 2, pw); one(X1 - pw / 2, pw); a.rect(X0 + pw, -D * 0.1, X1 - pw, 0, 'EQUIP-DETAIL'); a.box(X0 + pw, -22, Z0 + a.H * 0.14, X1 - pw, 0, Z1 - a.H * 0.12); a.box(X0 + pw - 6, -30, Z1 - a.H * 0.12 - 8, X1 - pw + 6, 0, Z1 - a.H * 0.12); }
  else one(cx, v.pw * IN);
  a.log('Added the ' + (v.n === 2 ? 'two ' : '') + v.kind + ' ' + (v.kind === 'round' ? 'engaged column' : 'pilaster') + (v.n === 2 ? 's with a recessed wall panel and a header between them' : '') + ' with a plinth, base moulding, shaft and a scrolled capital under an abacus (plan and 3D).');
}
function archNiche(a, v) {
  const { X0, X1, cx, Z0, Z1, W, D } = a, jw = W * 0.12, ro = W / 2, ri = ro - jw, zs = Z1 - ro, N = 14;
  a.rect(X0, -D, X1, 0, 'EQUIP'); a.rect(X0 + jw, -D, X1 - jw, -30, 'EQUIP-DETAIL');
  const sil = [[X0, Z0], [X1, Z0], [X1, zs]]; for (let k = 1; k < N; k++) { const th = (k / N) * PI; sil.push([cx + ro * m.cos(th), zs + ro * m.sin(th)]); } sil.push([X0, zs]);
  const bz = Z0 + 90; prismY(a, sil.map(([x, z]) => [x, z]), -30, 0);
  a.box(X0, -D, Z0, X1, 0, bz); a.box(X0 + 6, -D - 0, bz, X1 - 6, -D + 18 > 0 ? 0 : -D + 18, bz + 14);
  for (const [x0, x1] of [[X0, X0 + jw], [X1 - jw, X1]]) a.box(x0, -D, bz, x1, 0, zs);
  for (let k = 0; k < N; k++) { const t0 = (k / N) * PI, t1 = ((k + 1) / N) * PI; prismY(a, [[cx + ri * m.cos(t0), zs + ri * m.sin(t0)], [cx + ro * m.cos(t0), zs + ro * m.sin(t0)], [cx + ro * m.cos(t1), zs + ro * m.sin(t1)], [cx + ri * m.cos(t1), zs + ri * m.sin(t1)]], -D, 0); }
  if (v.key) a.box(cx - 36, -D - 0, Z1 - jw - 30, cx + 36, 0, Z1);
  const ns = v.shelves, sh0 = bz + 14, sh1 = zs + ri * 0.3;
  for (let k = 0; k < ns; k++) { const z = sh0 + 60 + ((sh1 - sh0 - 120) * (k + 0.5)) / ns; a.box(X0 + jw, -D + 14, z, X1 - jw, -30, z + 18); a.box(X0 + jw, -D + 14, z - 3, X1 - jw, -D + 22, z); if (v.display) { const x = cx + (k % 2 ? 1 : -1) * W * 0.12; lathe(a, x, -D * 0.55, z + 18, [[0, 20], [30, 40], [80, 30], [120, 14], [150, 22]], 16); a.ell(cx - (k % 2 ? 1 : -1) * W * 0.12, -D * 0.5, z + 18 + 34, 34, 28, 34, 10, 6); } }
  a.line(X0 + jw, -30, X1 - jw, -30, 'EQUIP-DETAIL');
  a.log('Added the plinth, two jambs, a segmental archivolt, an arched back panel' + (v.key ? ', a keystone' : '') + ' and ' + ns + ' shelf' + (ns > 1 ? 'ves' : '') + (v.display ? ' with a vase and an orb on each' : '') + ' (plan and 3D).');
}
function windowSeat(a, v) {
  const { X0, X1, YF, YB, cx, Z0, Z1, W, D } = a, bh = 17 * IN, cush = 3.2 * IN, endsW = v.ends ? 14 * IN : 0, sx0 = X0 + endsW, sx1 = X1 - endsW, dr = v.drawers;
  a.outline(); a.rect(sx0, YF, sx1, YB, 'EQUIP-DETAIL');
  a.box(sx0, YF + 20, Z0, sx1, YB, Z0 + 90); a.box(sx0, YF + 14, Z0 + 90, sx1, YB, Z0 + bh - 20); a.box(sx0, YF + 8, Z0 + bh - 20, sx1, YB, Z0 + bh);
  const dw = (sx1 - sx0 - 40) / dr;
  for (let k = 0; k < dr; k++) { const x0 = sx0 + 20 + k * dw + 6, x1 = sx0 + 20 + (k + 1) * dw - 6; a.frame(x0, Z0 + 110, x1, Z0 + bh - 40, YF + 2, YF + 16, 30); a.box(x0 + 30, YF + 10, Z0 + 140, x1 - 30, YF + 14, Z0 + bh - 70); a.box((x0 + x1) / 2 - 40, YF, Z0 + bh * 0.55, (x0 + x1) / 2 + 40, YF + 14, Z0 + bh * 0.55 + 14); a.line(x0, YF, x0, YB, 'EQUIP-DETAIL'); }
  puff(a, sx0 + 4, YF + 20, sx1 - 4, YB - 40, Z0 + bh, Z0 + bh + cush, 50, 6);
  for (const s of [-1, 1]) a.xcyl(s < 0 ? sx0 + 8 : sx1 - 150, s < 0 ? sx0 + 150 : sx1 - 8, YB - 130, Z0 + bh + cush + 70, 70, 16);
  for (let k = 0; k < 2; k++) { const x = cx + (k ? 1 : -1) * 150; puff(a, x - 150, YB - 170, x + 150, YB - 60, Z0 + bh + cush, Z0 + bh + cush + 300, 90, 5); }
  const wz0 = Z0 + bh + cush + 20, wz1 = Z1, wx0 = sx0 + 60, wx1 = sx1 - 60;
  a.frame(wx0, wz0 + 60, wx1, wz1, -60, 0, 50); a.box(wx0 - 50, -90, wz0 + 20, wx1 + 50, 0, wz0 + 60);
  const nm = m.max(1, m.round((wx1 - wx0) / 520)); for (let k = 1; k < nm; k++) a.box(wx0 + k * (wx1 - wx0) / nm - 15, -50, wz0 + 60, wx0 + k * (wx1 - wx0) / nm + 15, -10, wz1);
  a.box(wx0, -45, (wz0 + 60 + wz1) / 2 - 12, wx1, -15, (wz0 + 60 + wz1) / 2 + 12);
  if (v.ends) for (const [x0, x1] of [[X0, sx0], [sx1, X1]]) { a.box(x0, YF, Z0, x1, YB, Z1); for (let k = 1; k < 5; k++) a.box(x0 + 14, YF + 14, Z0 + k * (a.H / 5) - 8, x1 - 14, YF + 24, Z0 + k * (a.H / 5) + 8); a.rect(x0, YF, x1, YB, 'EQUIP'); }
  a.log('Added the base with ' + dr + ' drawers and pulls, a seat cushion, two bolsters, back pillows, a mullioned window above' + (v.ends ? ' and a tall shelf unit at each end' : '') + ' (plan and 3D).');
}
function acoustic(a, v) {
  const { X0, X1, YF, YB, cx, Z0, Z1, W, D } = a, sw = 30, pitch = 56, back = 22, foot = v.stand;
  if (foot) {
    a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); const py0 = -D / 2 - 11, py1 = -D / 2 + 11;
    a.box(X0, py0, Z0 + 100, X1, py1, Z1); a.box(X0 + 4, py0 - 7, Z0 + 104, X1 - 4, py0, Z1 - 4); for (const x of [X0 + 60, X1 - 60 - 40]) { a.box(x - 20, YF, Z0, x + 60, YB, Z0 + 40); a.box(x, py0, Z0 + 40, x + 40, py1, Z0 + 110); }
    const n = m.floor((W - 40) / pitch); for (let k = 0; k < n; k++) a.box(X0 + 20 + k * pitch + (W - 40 - n * pitch) / 2, py0 - 28, Z0 + 130, X0 + 20 + k * pitch + sw + (W - 40 - n * pitch) / 2, py0 - 7, Z1 - 30);
    a.box(X0, py0 - 28, Z1 - 30, X1, py1 + 0, Z1); a.box(X0, py0 - 28, Z0 + 100, X1, py1, Z0 + 130);
  } else {
    a.outline(); a.box(X0, -back, Z0, X1, 0, Z1); const n = m.floor((W - 20) / pitch); for (let k = 0; k < n; k++) a.box(X0 + 10 + k * pitch + (W - 20 - n * pitch) / 2, -back - 20, Z0 + 10, X0 + 10 + k * pitch + sw + (W - 20 - n * pitch) / 2, -back, Z1 - 10);
    a.box(X0, -back - 14, Z1 - 10, X1, -back, Z1); a.box(X0, -back - 14, Z0, X1, -back, Z0 + 10); for (let k = 0; k < n; k++) a.line(X0 + 10 + k * pitch + (W - 20 - n * pitch) / 2, -back, X0 + 10 + k * pitch + (W - 20 - n * pitch) / 2, -back - 20, 'EQUIP-DETAIL');
  }
  a.log('Added ' + (foot ? 'a free-standing screen on two feet' : 'a felt backing panel') + ' faced with a row of vertical wood slats and a top and bottom rail (plan and 3D).');
}

export default [
  // ---------------------------------------------------------------- lighting (37)
  fam({ cat: 'interior/lighting', title: 'Generic wall sconce', desc: (v) => v.type === 'swing' ? 'Wall sconce with a round back plate, a swing arm and a drum shade.' : v.type === 'dome' ? 'Half-dome wall sconce on the wall with a centre boss.' : v.type === 'candle' ? 'Wall sconce with a curved arm, a drip pan, a candle and a flame.' : 'Wall sconce with an arm and a four-post lantern with caps.',
    vs: [['swing arm, drum shade, 9 in', 9, 14, 12, 54, { type: 'swing', sh: 8, sr: 4 }], ['swing arm, drum shade, 12 in', 12, 18, 16, 52, { type: 'swing', sh: 11, sr: 5.5 }], ['candle arm, 6 in', 6, 11, 13, 56, { type: 'candle' }], ['half-dome, 8 in', 8, 5, 8, 58, { type: 'dome' }], ['half-dome, 12 in', 12, 6, 12, 56, { type: 'dome' }], ['four-post lantern, 8 in', 8, 10, 12, 54, { type: 'lantern', sh: 9, sr: 3.5 }]], build: sconce }),
  fam({ cat: 'interior/lighting', title: 'Generic framed picture with picture light', desc: (v) => `Framed print hung on the wall with a ${v.style} picture light on an arm above it.`,
    vs: [['bar light, 20 in frame', 20, 10, 22, 48, { style: 'bar', len: 12 }], ['hood light, 30 in frame', 30, 10, 30, 48, { style: 'hood', len: 18 }], ['slim box light, 40 in frame', 40, 10, 32, 48, { style: 'box', len: 28 }], ['bar light, 48 in frame', 48, 10, 36, 44, { style: 'bar', len: 30 }]], build: pictureLight }),
  fam({ cat: 'interior/lighting', title: 'Generic tiered ceiling chandelier', desc: (v) => `Chandelier with a canopy, a chain, a centre column and ${v.tiers} ring tier${v.tiers > 1 ? 's' : ''} carrying candle cups, flames and hanging drops.`,
    vs: [['single ring, 24 in', 24, 24, 26, 70, { tiers: 1, arms: 6, chain: 6 }], ['single ring, 18 in', 18, 18, 22, 74, { tiers: 1, arms: 4, chain: 4 }], ['two tiers, 30 in', 30, 30, 34, 62, { tiers: 2, arms: 6, chain: 8 }], ['two tiers, 36 in', 36, 36, 38, 58, { tiers: 2, arms: 8, chain: 10 }], ['three tiers, 36 in', 36, 36, 46, 50, { tiers: 3, arms: 6, chain: 10 }], ['three tiers, 44 in', 44, 44, 52, 44, { tiers: 3, arms: 8, chain: 12 }]], build: chandelier }),
  fam({ cat: 'interior/lighting', title: 'Generic linear suspension light', desc: (v) => `Ceiling-hung light on ${v.cords} cords: ${v.kind === 'bar' ? 'a long bar with a diffuser strip and end caps' : v.kind === 'twin' ? 'a pair of parallel tube lights with cross links' : 'an open rectangular frame with cross bars'}.`,
    vs: [['bar, 48 in, 2 cords', 48, 5, 36, 60, { cords: 2, kind: 'bar', bh: 2 }], ['bar, 72 in, 3 cords', 72, 5, 40, 56, { cords: 3, kind: 'bar', bh: 2.4 }], ['bar, 96 in, 4 cords', 96, 6, 48, 48, { cords: 4, kind: 'bar', bh: 2.5 }], ['twin tubes, 60 in', 60, 8, 36, 60, { cords: 2, kind: 'twin', bh: 2 }], ['open frame, 48 in', 48, 10, 40, 56, { cords: 2, kind: 'frame', bh: 6 }]], build: linearSuspension }),
  fam({ cat: 'interior/lighting', title: 'Generic woven basket pendant', desc: (v) => `Ceiling pendant with a canopy, a drop rod and a ${v.shape} woven shade with rib bands.`,
    vs: [['dome, 16 in', 16, 16, 26, 70, { shape: 'dome', shadeH: 10 }], ['dome, 24 in', 24, 24, 32, 64, { shape: 'dome', shadeH: 14 }], ['bell, 18 in', 18, 18, 34, 62, { shape: 'bell', shadeH: 16 }], ['bell, 30 in', 30, 30, 38, 58, { shape: 'bell', shadeH: 18 }], ['barrel, 14 in', 14, 14, 30, 66, { shape: 'barrel', shadeH: 12 }]], build: woven }),
  fam({ cat: 'interior/lighting', title: 'Generic paper lantern pendant', desc: (v) => `Ceiling pendant with a canopy, a wire rod and a ${v.shape} paper shade with stiffening rings.`,
    vs: [['sphere, 12 in', 12, 12, 26, 70, { shape: 'sphere', shadeH: 12 }], ['sphere, 24 in', 24, 24, 36, 60, { shape: 'sphere', shadeH: 24 }], ['sphere, 36 in', 36, 36, 48, 48, { shape: 'sphere', shadeH: 36 }], ['oval, 14 x 24 in', 14, 14, 36, 60, { shape: 'oval', shadeH: 24 }], ['drum, 16 in', 16, 16, 30, 66, { shape: 'drum', shadeH: 12 }]], build: paperLantern }),
  fam({ cat: 'interior/lighting', title: 'Generic hurricane lantern, candle', desc: (v) => `Candle lantern with a base, ${v.kind === 'round' ? 'a glass chimney drawn as ribs and rings' : v.kind === 'square' ? 'four corner posts and glass rails' : 'a tapered cage of eight ribs'}, a candle and a cap.`,
    vs: [['round glass, 8 in', 8, 8, 10, 0, { kind: 'round' }], ['round glass, 12 in', 12, 12, 16, 0, { kind: 'round' }], ['floor lantern, round, 36 in', 16, 16, 36, 0, { kind: 'round' }], ['square frame, 10 in', 10, 10, 14, 0, { kind: 'square' }], ['square frame, 16 in', 16, 16, 24, 0, { kind: 'square' }], ['tapered cage, 14 in', 12, 12, 14, 0, { kind: 'tapered' }]], build: hurricane }),
  // ---------------------------------------------------------------- soft (37)
  fam({ cat: 'interior/soft', title: 'Generic roman blind', desc: (v) => `Roman blind with a headrail, ${v.stack ? 'stacked folds under the rail, ' : ''}a flat panel with rod pockets, a hem bar, lift cords and a tassel cord.`,
    vs: [['lowered, 30 in wide', 30, 4, 60, 12, { fold: 6, stack: 0 }], ['half raised, 36 in wide', 36, 4, 60, 12, { fold: 6, stack: 12 }], ['fully raised, 48 in wide', 48, 4, 64, 10, { fold: 8, stack: 14 }], ['lowered, 60 in wide', 60, 4, 72, 8, { fold: 9, stack: 0 }], ['half raised, 72 in wide', 72, 4, 72, 8, { fold: 9, stack: 18 }]], build: roman }),
  fam({ cat: 'interior/soft', title: 'Generic roller blind', desc: (v) => `Roller blind with a tube and end brackets, ${v.zebra ? 'banded day-and-night' : 'plain'} fabric, a hem bar and a ball chain with a tensioner.`,
    vs: [['plain, 30 in wide', 30, 4, 60, 12, { drop: 1, zebra: false }], ['plain, 48 in wide', 48, 4, 72, 8, { drop: 1, zebra: false }], ['half drawn, 42 in wide', 42, 4, 66, 10, { drop: 0.55, zebra: false }], ['day-night bands, 36 in wide', 36, 4, 72, 8, { drop: 1, zebra: true }], ['day-night bands, 60 in wide', 60, 4, 72, 8, { drop: 1, zebra: true }]], build: roller }),
  fam({ cat: 'interior/soft', title: 'Generic cowhide rug', desc: (v) => `Hide-shaped rug from overlapping lobes${v.legs ? ' with four leg flaps, a neck and a tail' : ' with a head and a tail end'}${v.spots ? ' and ' + v.spots + ' raised patches' : ''}${v.roll ? ', plus a second hide rolled and tied with two straps at one end' : ''}.`,
    vs: [['legs and patches, 84 x 72 in, rolled hide', 84, 72, 4.5, 0, { legs: true, spots: 7, roll: true }], ['legs and patches, 60 x 48 in', 60, 48, 0.6, 0, { legs: true, spots: 5 }], ['plain, 72 x 60 in', 72, 60, 0.6, 0, { legs: false, spots: 0 }], ['patched, 96 x 72 in, rolled hide', 96, 72, 4.5, 0, { legs: true, spots: 11, roll: true }]], build: cowhide }),
  fam({ cat: 'interior/soft', title: 'Generic bean bag', desc: (v) => v.kind === 'lounger' ? 'Bean bag lounger from a low seat form and a raised back form with a carry handle.' : `${v.kind === 'pear' ? 'Pear-shaped' : 'Round slumped'} bean bag with seams and a carry handle.`,
    vs: [['round, 36 in', 36, 36, 22, 0, { kind: 'round' }], ['round, 44 in', 44, 44, 26, 0, { kind: 'round' }], ['pear, 34 in', 34, 34, 34, 0, { kind: 'pear' }], ['pear, 40 in tall', 40, 40, 44, 0, { kind: 'pear' }], ['lounger, 60 x 40 in', 60, 40, 30, 0, { kind: 'lounger' }]], build: beanbag }),
  fam({ cat: 'interior/soft', title: 'Generic floor cushion stack', desc: (v) => `${v.n} ${v.round ? 'round' : 'square'} floor cushion${v.n > 1 ? 's' : ''}${v.n > 1 ? ' stacked with a small offset' : ''}, with piping and a centre button${v.round ? '' : ' and corner tufts'}.`,
    vs: [['square, 2 stacked, 24 in', 24, 24, 10, 0, { n: 2, round: false }], ['square, 3 stacked, 30 in', 30, 30, 15, 0, { n: 3, round: false }], ['square oversized, 36 in', 36, 36, 8, 0, { n: 1, round: false }], ['round, 2 stacked, 20 in', 20, 20, 9, 0, { n: 2, round: true }], ['round meditation, 16 in', 16, 16, 5, 0, { n: 1, round: true }]], build: floorStack }),
  fam({ cat: 'interior/soft', title: 'Generic blanket ladder with throws', desc: (v) => `Leaning ladder with two rails, ${v.rungs} round rungs and folded throws hung over the rungs.`,
    vs: [['3 rungs, 60 in', 20, 10, 60, 0, { rungs: 3 }], ['4 rungs, 66 in', 24, 11, 66, 0, { rungs: 4 }], ['5 rungs, 72 in', 28, 12, 72, 0, { rungs: 5 }], ['4 rungs, wide, 66 in', 34, 11, 66, 0, { rungs: 4 }], ['5 rungs, tall, 76 in', 32, 13, 76, 0, { rungs: 5 }]], build: blanketLadder }),
  fam({ cat: 'interior/soft', title: 'Generic tufted ottoman', desc: (v) => v.kind === 'cube' ? 'Lidded cube ottoman with a padded body, a lid and a carry strap.' : v.kind === 'round' ? 'Round upholstered ottoman on four legs with piping.' : `Rectangular upholstered ottoman on four legs${v.tray ? ' with a raised tray top' : ' with a button grid'}.`,
    vs: [['rectangular, buttoned, 36 x 18 in', 36, 18, 17, 0, { kind: 'rect', legs: 3, nx: 4, ny: 2 }], ['rectangular, tray top, 48 x 20 in', 48, 20, 18, 0, { kind: 'rect', legs: 4, tray: true, nx: 0, ny: 0 }], ['round, 30 in', 30, 30, 17, 0, { kind: 'round', legs: 3 }], ['storage cube, 20 in', 20, 20, 18, 0, { kind: 'cube', legs: 0, nx: 0, ny: 0 }]], build: ottoman }),
  fam({ cat: 'interior/soft', title: 'Generic sheer bed canopy', desc: (v) => `Round ceiling canopy: a hook, a hoop on four cords and ${v.strands} flowing sheer strands flaring to a pooled hem.`,
    vs: [['24 in hoop, 96 in drop', 60, 60, 96, 0, { hoopR: 12, strands: 20 }], ['36 in hoop, 100 in drop', 72, 72, 100, 0, { hoopR: 18, strands: 24 }], ['48 in hoop, 108 in drop', 84, 84, 108, 0, { hoopR: 24, strands: 28 }], ['60 in hoop, 108 in drop', 96, 96, 108, 0, { hoopR: 30, strands: 32 }]], build: sheerCanopy }),
  // ---------------------------------------------------------------- accessories (38)
  fam({ cat: 'interior/accessories', title: 'Generic candlestick holder', desc: (v) => `${v.hs.length === 1 ? 'One' : v.hs.length} ${v.style} candlestick${v.hs.length > 1 ? 's' : ''} with a round foot, a stem, a cup, a candle and a flame.`,
    vs: [['single baluster, 6 in', 3, 3, 6, 0, { hs: [6], style: 'baluster' }], ['single taper, 10 in', 4, 4, 10, 0, { hs: [10], style: 'taper' }], ['pair of columns, 8 in', 8, 4, 8, 0, { hs: [8, 8], style: 'column' }], ['pair of tapers, 12 in', 10, 5, 12, 0, { hs: [12, 12], style: 'taper' }], ['graduated trio, 6 8 10 in', 14, 4, 10, 0, { hs: [6, 8, 10], style: 'baluster' }], ['tall floor column, 24 in', 8, 8, 24, 0, { hs: [24], style: 'column' }]], build: candlestick }),
  fam({ cat: 'interior/accessories', title: 'Generic pedestal bowl and tiered stand', desc: (v) => v.kind === 'tier' ? `Stand of ${v.plates} stacked plates on a centre rod with a top handle.` : `Footed pedestal bowl with a stem and flared bowl${v.kind === 'fruit' ? ' filled with fruit shapes' : v.kind === 'orbs' ? ' holding decorative orbs' : ' holding pebbles'}.`,
    vs: [['fruit bowl, 12 in', 12, 12, 10, 0, { kind: 'fruit', foot: 3 }], ['orb bowl, 16 in', 16, 16, 12, 0, { kind: 'orbs', foot: 4 }], ['pebble compote, 8 in', 8, 8, 6, 0, { kind: 'pebbles', foot: 2 }], ['2 plate stand, 10 in', 10, 10, 10, 0, { kind: 'tier', plates: 2 }], ['3 plate stand, 14 in', 14, 14, 16, 0, { kind: 'tier', plates: 3 }]], build: pedBowl }),
  fam({ cat: 'interior/accessories', title: 'Generic tabletop photo frame', desc: 'Photo frame leaning back on a rear strut with a back board, a border, a mat and a print with a few stripes.',
    vs: [['portrait 5 x 7 in', 7, 5, 9, 0, { ft: 0.5 }], ['portrait 8 x 10 in', 10, 6, 12, 0, { ft: 0.75 }], ['landscape 10 x 8 in', 12, 6, 10, 0, { ft: 0.75 }], ['portrait 11 x 14 in', 14, 8, 17, 0, { ft: 1 }], ['panorama 6 x 18 in', 20, 5, 9, 0, { ft: 0.5 }]], build: photoFrame }),
  fam({ cat: 'interior/accessories', title: 'Generic glass cloche display', desc: (v) => `Turned base with a glass dome drawn as ribs and rings with a knob and ${v.inside === 'pear' ? 'a pear' : v.inside === 'plant' ? 'a small plant' : v.inside === 'stones' ? 'three flat stones' : 'a two-tier cake'} inside.`,
    vs: [['bell with pear, 9 x 14 in', 9, 9, 14, 0, { shape: 'bell', inside: 'pear' }], ['bell with plant, 8 x 11 in', 8, 8, 11, 0, { shape: 'bell', inside: 'plant' }], ['cylinder with cake, 10 x 12 in', 10, 10, 12, 0, { shape: 'cyl', inside: 'cake' }], ['tall bell with stones, 7 x 16 in', 7, 7, 16, 0, { shape: 'bell', inside: 'stones' }], ['wide low bell, 14 x 9 in', 14, 14, 9, 0, { shape: 'bell', inside: 'stones' }]], build: cloche }),
  fam({ cat: 'interior/accessories', title: 'Generic hanging planter, cord sling', desc: (v) => `Ceiling hook, cords knotted into a sling, ${v.two ? 'two pots' : 'a pot with a rim band'}, leaves and a fringe below the knot.`,
    vs: [['4 in pot, 36 in drop', 12, 12, 36, 60, { potR: 4, at: 0.3 }], ['5 in pot, 30 in drop', 14, 14, 30, 66, { potR: 5, at: 0.34 }], ['6 in pot, 42 in drop', 16, 16, 42, 54, { potR: 6, at: 0.32 }], ['5 in pot, 60 in drop', 14, 14, 60, 36, { potR: 5, at: 0.22 }], ['two tiers, 54 in drop', 16, 16, 54, 42, { potR: 5, at: 0.2, two: true }]], build: hangPlanter }),
  fam({ cat: 'interior/accessories', title: 'Generic magazine rack, floor', desc: (v) => `Floor magazine rack with ${v.kind === 'wire' ? 'a wire frame and a carry arch' : v.kind === 'sling' ? 'two side frames and a draped sling' : 'sloped side panels, a base and a back rail'} and leaning magazines.`,
    vs: [['wood sides, 16 in', 16, 12, 16, 0, { kind: 'wood', nm: 2 }], ['wood with divider, 20 in', 20, 12, 16, 0, { kind: 'wood', nm: 2, divider: true }], ['sling, 18 in', 18, 14, 20, 0, { kind: 'sling', nm: 2 }], ['wire basket, 14 in', 14, 10, 18, 0, { kind: 'wire', nm: 1 }]], build: magRack }),
  fam({ cat: 'interior/accessories', title: 'Generic stacked books', desc: (v) => `${v.books.length} hardcover books stacked with a slight offset, each with covers, a spine and a page block${v.top && v.top !== 'none' ? ', topped with a ' + v.top : ''}.`,
    vs: [['three books, 11 in', 11, 8, 3.6, 0, { books: [[11, 8, 1.5], [10, 7.5, 1.1], [9, 6, 0.8]] }], ['seven books, 13 in', 13, 10, 9, 0, { books: [[13, 10, 1.8], [12, 9, 1.6], [11, 8.5, 1.4], [10.5, 8, 1.2], [10, 7.5, 1.1], [9, 7, 0.9], [8, 6, 0.8]] }], ['five books with a bowl, 12 in', 12, 9, 11, 0, { books: [[12, 9, 1.6], [11, 8.5, 1.4], [10, 8, 1.2], [9.5, 7, 1], [9, 6.5, 0.9]], top: 'bowl' }], ['four books with a plant, 10 in', 10, 8, 12, 0, { books: [[10, 8, 1.4], [9, 7.5, 1.2], [8.5, 7, 1], [8, 6, 0.8]], top: 'plant' }]], build: bookStack }),
  fam({ cat: 'interior/accessories', title: 'Generic umbrella stand', desc: (v) => `${v.kind} stand body with a rim band and base, and ${v.n} umbrellas with curved handles standing in it.`,
    vs: [['round, 3 umbrellas, 28 in', 10, 10, 28, 0, { kind: 'round', n: 3 }], ['square, 2 umbrellas, 26 in', 9, 9, 26, 0, { kind: 'square', n: 2 }], ['tapered, 4 umbrellas, 30 in', 11, 11, 30, 0, { kind: 'tapered', n: 4 }], ['slim round with a cane, 32 in', 8, 8, 32, 0, { kind: 'round', n: 2, cane: true }]], build: umbrellaStand }),
  // ---------------------------------------------------------------- finishes (38)
  fam({ cat: 'interior/finishes', title: 'Generic exposed ceiling beam', desc: (v) => v.kind === 'hewn' ? 'Chamfered hewn beam on two end blocks with two iron straps, bolt heads and adze marks.' : v.kind === 'box' ? 'Boxed faux beam shell on two end blocks, with end returns and a groove line.' : v.kind === 'corbel' ? 'Beam with two stepped corbels beneath its ends.' : 'Tie beam with a king post, two angled struts and iron plates.',
    vs: [['hewn, 8 x 10 in on end blocks, 96 in long', 96, 8, 13, 83, { kind: 'hewn' }], ['hewn, 8 x 12 in on end blocks, 144 in long', 144, 8, 15, 81, { kind: 'hewn' }], ['boxed, 6 x 8 in on end blocks, 120 in long', 120, 6, 11, 85, { kind: 'box' }], ['on corbels, 96 in long', 96, 8, 18, 78, { kind: 'corbel' }], ['king post truss, 144 in span', 144, 10, 48, 48, { kind: 'truss' }]], build: beam }),
  fam({ cat: 'interior/finishes', title: 'Generic coffered ceiling section', desc: (v) => `Coffered ceiling section with border beams, cross beams, stepped panel ledges and a ${v.lights ? 'recessed downlight' : 'rosette'} in each of ${v.nx * v.ny} coffers.`,
    vs: [['3 x 2 rosettes, 72 x 48 in', 72, 48, 8, 88, { nx: 3, ny: 2, bw: 3, lights: false }], ['4 x 3 downlights, 96 x 72 in', 96, 72, 9, 87, { nx: 4, ny: 3, bw: 3.5, lights: true }], ['4 x 4 rosettes, 96 x 96 in', 96, 96, 10, 86, { nx: 4, ny: 4, bw: 4, lights: false }], ['6 x 4 downlights, 144 x 96 in', 144, 96, 10, 86, { nx: 6, ny: 4, bw: 4, lights: true }]], build: coffer }),
  fam({ cat: 'interior/finishes', title: 'Generic ceiling medallion', desc: (v) => `Round ceiling rosette with an outer rim bead, two stepped bands, ${v.petals} leaf petals and a domed centre boss.`,
    vs: [['12 in, 6 petals', 12, 12, 2, 94, { petals: 6 }], ['18 in, 8 petals', 18, 18, 2.5, 93.5, { petals: 8 }], ['24 in, 12 petals', 24, 24, 3, 93, { petals: 12 }], ['30 in, 12 petals', 30, 30, 3.5, 92.5, { petals: 12 }], ['36 in, 16 petals', 36, 36, 4, 92, { petals: 16 }]], build: medallion }),
  fam({ cat: 'interior/finishes', title: 'Generic radiator cover cabinet', desc: (v) => `Radiator cover with a plinth, a framed ${v.grille} grille with the radiator fins and pipes behind it and an overhanging top shelf.`,
    vs: [['slatted grille, 36 x 32 in', 36, 9, 32, 0, { grille: 'slat' }], ['lattice grille, 48 x 32 in', 48, 9, 32, 0, { grille: 'lattice' }], ['louvre grille, 60 x 30 in', 60, 9, 30, 0, { grille: 'louvre' }], ['slatted grille, 72 x 32 in', 72, 9, 32, 0, { grille: 'slat' }], ['low lattice sill unit, 48 x 20 in', 48, 10, 20, 0, { grille: 'lattice' }]], build: radCover }),
  fam({ cat: 'interior/finishes', title: 'Generic wall pilaster and engaged column', desc: (v) => `${v.n === 2 ? 'Two ' : 'One '}${v.kind} ${v.kind === 'round' ? 'engaged column' : 'pilaster'}${v.n === 2 ? 's with a recessed wall panel between them' : ''} with a plinth, base, shaft and capital.`,
    vs: [['fluted pilaster, 8 in, 96 in tall', 8, 3, 96, 0, { kind: 'fluted', n: 1, pw: 8 }], ['panelled pilaster, 10 in, 108 in tall', 10, 4, 108, 0, { kind: 'plain', n: 1, pw: 10 }], ['fluted pilaster pair, 40 in apart, 108 in', 64, 4, 108, 0, { kind: 'fluted', n: 2, pw: 12 }], ['engaged round column, 12 in, 108 in', 12, 12, 108, 0, { kind: 'round', n: 1, pw: 12 }], ['engaged round column pair, 96 in tall', 56, 10, 96, 0, { kind: 'round', n: 2, pw: 10 }]], build: pilaster }),
  fam({ cat: 'interior/finishes', title: 'Generic arched wall niche unit', desc: (v) => `Arched niche unit with a plinth, two jambs, an arch ring, a back panel${v.key ? ', a keystone' : ''} and ${v.shelves} shelf${v.shelves > 1 ? 'ves' : ''}${v.display ? ' with a vase and an orb on each' : ''}.`,
    vs: [['18 x 48 in, 1 shelf', 18, 6, 48, 36, { shelves: 1 }], ['24 x 60 in, 2 shelves', 24, 8, 60, 30, { shelves: 2 }], ['24 x 60 in, keystone', 24, 8, 60, 30, { shelves: 2, key: true }], ['30 x 72 in, 3 shelves, display', 30, 10, 72, 24, { shelves: 3, display: true }], ['36 x 84 in, keystone, display', 36, 12, 84, 12, { shelves: 2, display: true, key: true }]], build: archNiche }),
  fam({ cat: 'interior/finishes', title: 'Generic built-in window seat', desc: (v) => `Window seat with a drawer base with ${v.drawers} drawers, a cushion, two bolsters, back pillows and a mullioned window above${v.ends ? ', with a tall shelf unit at each end' : ''}.`,
    vs: [['48 in, 2 drawers', 48, 22, 72, 0, { drawers: 2 }], ['60 in, 3 drawers', 60, 22, 76, 0, { drawers: 3 }], ['72 in, 4 drawers', 72, 22, 80, 0, { drawers: 4 }], ['96 in with shelf ends', 96, 22, 84, 0, { drawers: 4, ends: true }], ['120 in with shelf ends', 120, 22, 84, 0, { drawers: 5, ends: true }]], build: windowSeat }),
  fam({ cat: 'interior/finishes', title: 'Generic slatted acoustic wall panel', desc: (v) => `${v.stand ? 'Free-standing screen on two feet' : 'Felt backing panel'} faced with vertical wood slats and a top and bottom rail.`,
    vs: [['wall mounted, 24 x 96 in', 24, 2.5, 96, 12, { stand: false }], ['wall mounted, 48 x 48 in', 48, 2.5, 48, 36, { stand: false }], ['standing screen, 36 x 72 in', 36, 14, 72, 0, { stand: true }], ['standing screen, 60 x 72 in', 60, 14, 72, 0, { stand: true }]], build: acoustic }),
];

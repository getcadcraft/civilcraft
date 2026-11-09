/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, interior design: lamps and lighting, soft furnishings, accessories and decor, wall and floor features. Original geometry; generic decor pieces by type and size. */
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

// ================================================================================== LIGHTING
function shade(a, cx, cy, z0, z1, r0, r1, type) {
  a.cone(cx, cy, z0, z1, r0, r1, 28);
  if (type === 'pleat') for (let k = 0; k < 16; k++) { const th = (k / 16) * 2 * PI; a.tube([[cx + r0 * m.cos(th), cy + r0 * m.sin(th), z0], [cx + r1 * m.cos(th), cy + r1 * m.sin(th), z1]], [4, 4], 4); }
  a.cyl(cx, cy, z0 - 0.01 + 1, z0 + 8, r0 * 0.9, 20);
}
function tableLamp(a, v) {
  const { cx, cy, Z0, Z1, W } = a, H = a.H, sh = v.shadeH * IN, sr0 = W / 2 - 6, sr1 = sr0 * (v.type === 'empire' ? 0.7 : v.type === 'cone' ? 0.5 : 1), br = v.baseR * IN, bz1 = Z1 - sh + 30;
  a.circ(cx, cy, sr0, 'EQUIP'); a.circ(cx, cy, br, 'EQUIP-DETAIL'); a.circ(cx, cy, 12, 'EQUIP-DETAIL');
  a.tube([[cx, cy + br, Z0 + 12], [cx, cy + br + 40, Z0 + 6], [cx, -8, Z0 + 5]], [4, 4, 4], 5);     // cord to the back
  switch (v.base) {
    case 'gourd': lathe(a, cx, cy, Z0, [[0, br * 0.6], [bz1 * 0.0 + 8, br * 0.65], [(bz1 - Z0) * 0.12, br * 0.95], [(bz1 - Z0) * 0.4, br], [(bz1 - Z0) * 0.7, br * 0.55], [(bz1 - Z0) * 0.88, br * 0.2], [bz1 - Z0, br * 0.17]], 22); break;
    case 'column': a.cyl(cx, cy, Z0, Z0 + 30, br * 1.3, 24); a.cyl(cx, cy, Z0 + 30, bz1, br * 0.35, 16); lathe(a, cx, cy, Z0 + 30, [[0, br * 0.6], [60, br * 0.5], [100, br * 0.36]], 16); a.cyl(cx, cy, Z0 + 30 + (bz1 - Z0) * 0.5, Z0 + 30 + (bz1 - Z0) * 0.5 + 12, br * 0.55, 16); break;
    case 'tripod': for (let k = 0; k < 3; k++) { const th = k * 2 * PI / 3 + PI / 2; a.tube([[cx + br * m.cos(th), cy + br * m.sin(th), Z0 + 4], [cx + br * 0.12 * m.cos(th), cy + br * 0.12 * m.sin(th), bz1 - 40]], [11, 7], 6); } a.cyl(cx, cy, bz1 - 70, bz1, br * 0.2, 12); hoop(a, cx, cy, Z0 + (bz1 - Z0) * 0.35, br * 0.6, br * 0.6, 3, 18, 4); break;
    case 'disc': a.cyl(cx, cy, Z0, Z0 + 14, br, 28); a.cyl(cx, cy, Z0 + 14, bz1 - br * 0.5, 9, 10); a.ell(cx, cy, bz1 - br * 0.5, br * 0.5, br * 0.5, br * 0.5, 14, 8); break;
    default: for (let k = 0; k < 3; k++) a.ell(cx, cy, Z0 + br * (0.8 + k * 1.5) * (1 - k * 0.12), br * (1 - k * 0.2), br * (1 - k * 0.2), br * 0.8, 16, 8); a.cyl(cx, cy, Z0, bz1, 10, 8); break;
  }
  a.cyl(cx, cy, bz1 - 6, bz1 + 40, 12, 8);
  shade(a, cx, cy, Z1 - sh, Z1 - 20, sr0, sr1, v.pleat ? 'pleat' : v.type);
  a.cyl(cx, cy, Z1 - 20, Z1, 12, 8);
  a.log('Added the ' + v.base + ' base, stem, cord, ' + v.type + ' shade with a finial and a plan ring for the shade and the base (plan and 3D).');
}
function floorLamp(a, v) {
  const { cx, cy, Z0, Z1, W, D } = a, H = a.H, br = v.baseR * IN;
  a.circ(cx, cy, br, 'EQUIP');
  switch (v.style) {
    case 'column': { const sr = W / 2 - 4; a.cyl(cx, cy, Z0, Z0 + 20, br, 28); a.cyl(cx, cy, Z0 + 20, Z1 - 330, 16, 12); a.cyl(cx, cy, Z0 + 700, Z0 + 730, 26, 12); shade(a, cx, cy, Z1 - 330, Z1 - 12, sr, sr * 0.82, 'drum'); a.cyl(cx, cy, Z1 - 12, Z1, 10, 8); a.circ(cx, cy, sr, 'EQUIP-DETAIL'); break; }
    case 'tripod': { const sr = W / 2 - 4; for (let k = 0; k < 3; k++) { const th = k * 2 * PI / 3 + 0.5; a.tube([[cx + br * m.cos(th), cy + br * m.sin(th), Z0], [cx + 24 * m.cos(th), cy + 24 * m.sin(th), Z1 - 420]], [16, 10], 8); } a.cyl(cx, cy, Z1 - 440, Z1 - 380, 24, 12); shade(a, cx, cy, Z1 - 420, Z1 - 12, sr, sr * 0.6, 'empire'); a.cyl(cx, cy, Z1 - 12, Z1, 9, 8); a.circ(cx, cy, sr, 'EQUIP-DETAIL'); break; }
    case 'tree': {
      a.cyl(cx, cy, Z0, Z0 + 18, br, 28); a.cyl(cx, cy, Z0 + 18, Z1 - 80, 13, 10);
      const arms = [[-1, 0.62, 0.78], [1, 0.74, 0.86], [0, 0.86, 1.0]];
      for (const [d, f, g] of arms) {
        const zs = Z0 + (H) * f, x = cx + d * (W / 2 - 160), ze = Z0 + H * g - 90;
        a.tube([[cx, cy, zs], [cx + d * W * 0.14, cy, zs + 20], [x, cy, ze - 110]], [9, 9, 9], 6);
        shade(a, x, cy, ze - 110, ze + 70, 130, 85, 'drum'); a.circ(x, cy, 130, 'EQUIP-DETAIL');
      }
      break; }
    case 'torch': { const bw = W / 2 - 6; a.cyl(cx, cy, Z0, Z0 + 20, br, 28); a.cyl(cx, cy, Z0 + 20, Z1 - 260, 14, 10); a.cone(cx, cy, Z1 - 260, Z1 - 20, 40, bw, 24); a.cone(cx, cy, Z1 - 20, Z1 - 0.01 + 0.02, bw, bw, 24); a.circ(cx, cy, bw, 'EQUIP-DETAIL'); hoop(a, cx, cy, Z1 - 20, bw, bw, 6, 24, 5); break; }
    default: { // reading lamp with a boom
      const px = cx - W / 2 + br + 10, sx = cx + W / 2 - 170;
      a.cyl(px, cy, Z0, Z0 + 20, br, 28); a.cyl(px, cy, Z0 + 20, Z0 + H * 0.78, 12, 10);
      a.tube([[px, cy, Z0 + H * 0.78], [px + 100, cy, Z0 + H * 0.97], [(px + sx) / 2, cy, Z1 - 90], [sx, cy, Z1 - 330]], [10, 10, 10, 10], 6);
      shade(a, sx, cy, Z1 - 330, Z1 - 70, 170, 95, 'drum'); a.circ(sx, cy, 170, 'EQUIP-DETAIL'); a.line(px, cy, sx, cy, 'EQUIP-DETAIL');
    }
  }
  a.log('Added the base, a ' + v.style + ' support and shade (plan and 3D).');
}
function arcLamp(a, v) {
  const { X0, X1, cx, cy, Z0, Z1, W, D } = a, bw = v.baseW * IN, bd = D - 20;
  a.outline();
  a.box(X0, cy - bd / 2, Z0, X0 + bw, cy + bd / 2, Z0 + v.baseH * IN); a.rect(X0, cy - bd / 2, X0 + bw, cy + bd / 2, 'EQUIP-DETAIL');
  const top = Z1 - Z0 - 280, xb = X0 + bw / 2, xs = X1 - 190, pts = [];
  for (let k = 0; k <= 16; k++) { const t = k / 16; pts.push([xb + (xs - xb) * t, cy, Z0 + v.baseH * IN + (top - v.baseH * IN) * m.sin(PI * 0.5 * (t * 1.15 + 0.05) * (1 - 0.0) - 0.0) * (t < 0.7 ? 1 : 1 - (t - 0.7) * 0.45)]); }
  a.tube(pts, pts.map((_, i) => (i < 3 ? 24 : 15)), 8);
  const e = pts[pts.length - 1];
  a.tube([[e[0], cy, e[2]], [e[0], cy, e[2] - 70]], [9, 9], 6);
  a.cone(e[0], cy, e[2] - 240, e[2] - 60, 190, 40, 24);
  a.circ(e[0], cy, 190, 'EQUIP-DETAIL'); a.line(xb, cy, e[0], cy, 'EQUIP-DETAIL');
  a.log('Added the ' + v.base + ' base block, a long overhanging arm of tube and a dome shade (plan and 3D).');
}
function pendantCluster(a, v) {
  const { cx, cy, Z0, Z1, W } = a, n = v.n, R = W / 2 - 130;
  a.cyl(cx, cy, Z1 - 30, Z1, W * 0.2, 20); a.circ(cx, cy, W * 0.2, 'EQUIP-DETAIL');
  for (let i = 0; i < n; i++) {
    const th = (i / n) * 2 * PI, rr = i === 0 && n % 2 ? 0 : R * (0.45 + 0.55 * ((i * 5) % 3) / 2), x = cx + rr * m.cos(th), y = cy + rr * m.sin(th) * 0.0 + rr * m.sin(th);
    const drop = (H0) => H0;
    const gz = Z0 + 110 + ((i * 2) % n) * ((a.H - 520) / n) * 0.9, g = 115 + ((i * 3) % 3) * 22;
    a.tube([[cx + (x - cx) * 0.15, cy + (y - cy) * 0.15, Z1 - 30], [x, y, gz + g * 2]], [3, 3], 4);
    a.ell(x, y, gz + g, g, g, g, 16, 10); a.cyl(x, y, gz + g * 1.9, gz + g * 2.1, 14, 8); a.circ(x, y, g, 'EQUIP-DETAIL');
  }
  a.circ(cx, cy, R + 150, 'EQUIP-DETAIL', 0.0);
  a.log('Added the ceiling canopy, ' + n + ' cords of different drops and a glass globe on each (plan and 3D).');
}
function pendantShade(a, v) {
  const { cx, cy, Z0, Z1, W } = a, sr = W / 2 - 6, sh = v.shadeH * IN;
  a.cyl(cx, cy, Z1 - 24, Z1, 70, 16); a.cyl(cx, cy, Z0 + sh, Z1 - 24, 6, 6); a.circ(cx, cy, sr, 'EQUIP'); a.circ(cx, cy, 70, 'EQUIP-DETAIL');
  if (v.type === 'dome') { const prof = []; for (let k = 0; k <= 10; k++) { const t = (k / 10) * PI / 2 * 0.96; prof.push([sh * m.sin(t), sr * m.cos(t) + 10]); } lathe(a, cx, cy, Z0, prof, 28); a.cyl(cx, cy, Z0, Z0 + 6, sr * 0.98, 28); }
  else if (v.type === 'drum') { a.cone(cx, cy, Z0, Z0 + sh, sr, sr, 28); a.cyl(cx, cy, Z0 - 0.01 + 1, Z0 + 8, sr * 0.92, 24); }
  else a.cone(cx, cy, Z0, Z0 + sh, sr, 60, 28);
  a.cyl(cx, cy, Z0 - 0.01 + 4, Z0 + sh * 0.3, 40, 12);
  a.log('Added the ceiling canopy, a drop cord, a ' + v.type + ' shade and its bulb holder (plan and 3D).');
}
function deskLamp(a, v) {
  const { X0, X1, cx, cy, Z0, Z1, W } = a, br = v.baseR * IN, px = X0 + br + 6;
  a.cyl(px, cy, Z0, Z0 + 22, br, 24); a.circ(px, cy, br, 'EQUIP'); a.cyl(px, cy, Z0 + 22, Z0 + 60, 18, 12);
  const j1 = [px, cy, Z0 + 70], j2 = [px + W * 0.18, cy, Z1 - 250], j3 = [X1 - 210, cy, Z1 - 170];
  a.tube([j1, j2], [8, 8], 6); a.tube([[j1[0] + 20, j1[1], j1[2] + 30], [j2[0] + 20, j2[1], j2[2] + 20]], [3, 3], 4); a.tube([j2, j3], [8, 8], 6);
  a.ell(...j1, 22, 22, 22, 10, 6); a.ell(...j2, 20, 20, 20, 10, 6); a.ell(...j3, 20, 20, 20, 10, 6);
  { const hr = m.min(190, a.D / 2 - 6); a.cone(j3[0], cy, j3[2] - 170, j3[2] - 20, hr, 40, 22); a.circ(j3[0], cy, hr, 'EQUIP-DETAIL'); } a.line(px, cy, j3[0], cy, 'EQUIP-DETAIL');
  a.tube([[px, cy - 20, Z0 + 10], [px, -10, Z0 + 5]], [3, 3], 4);
  a.log('Added the weighted base, two arms with joints and a balance spring, and a conical head (plan and 3D).');
}

// ================================================================================== SOFT
function rug(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, fr = v.fringe ? 70 : 0, T = 8, bw = v.border * IN;
  a.outline();
  a.box(X0, YF + fr, Z0, X1, YB - fr, Z0 + T);
  a.box(X0 + bw, YF + fr + bw, Z0 + T, X1 - bw, YB - fr - bw, Z0 + T + 4);
  a.box(X0 + bw * 1.9, YF + fr + bw * 1.9, Z0 + T + 4, X1 - bw * 1.9, YB - fr - bw * 1.9, Z0 + T + 7);
  const mw = (W - bw * 4) * 0.5, md = (D - fr * 2 - bw * 4) * (v.runner ? 0.9 : 0.5);
  a.prism([[cx - mw / 2, cy], [cx, cy - md / 2], [cx + mw / 2, cy], [cx, cy + md / 2]], Z0 + T + 7, Z0 + T + 10);
  if (v.fringe) for (const e of [-1, 1]) for (let x = X0 + 30; x < X1 - 15; x += 38) a.box(x, e < 0 ? YF : YB - fr, Z0, x + 18, e < 0 ? YF + fr : YB, Z0 + 4);
  a.rect(X0 + bw, YF + fr + bw, X1 - bw, YB - fr - bw, 'EQUIP-DETAIL'); a.rect(X0 + bw * 1.9, YF + fr + bw * 1.9, X1 - bw * 1.9, YB - fr - bw * 1.9, 'EQUIP-DETAIL');
  a.poly([[cx - mw / 2, cy], [cx, cy - md / 2], [cx + mw / 2, cy], [cx, cy + md / 2]], 'EQUIP-DETAIL');
  a.log('Added the woven slab, a raised border band, an inner field and a centre medallion' + (v.fringe ? ', with fringe along both short ends' : '') + ' (plan and 3D).');
}
function roundRug(a, v) {
  const { cx, cy, Z0, W } = a, R = W / 2;
  a.circ(cx, cy, R, 'EQUIP'); a.cyl(cx, cy, Z0, Z0 + 8, R, 40);
  for (let k = 0; k < v.rings; k++) { const r = R * (1 - (k + 1) * 0.16); a.cyl(cx, cy, Z0 + 8, Z0 + 8 + (k + 1) * 2.5, r, 40); a.circ(cx, cy, r, 'EQUIP-DETAIL'); }
  for (let k = 0; k < 8; k++) { const th = k * PI / 4; a.tube([[cx + R * 0.15 * m.cos(th), cy + R * 0.15 * m.sin(th), Z0 + 8 + v.rings * 2.5 + 0.5], [cx + R * 0.4 * m.cos(th), cy + R * 0.4 * m.sin(th), Z0 + 8 + v.rings * 2.5 + 0.5]], [3, 3], 4); }
  a.log('Added the round pile disc and ' + v.rings + ' stepped bands with a petal motif at the centre (plan and 3D).');
}
function cushion(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a;
  a.outline();
  if (v.kind === 'bolster') {
    const r = D / 2 - 4; a.xcyl(X0 + 60, X1 - 60, cy, Z0 + r + 4, r, 18); for (const s of [-1, 1]) { a.xcyl(s < 0 ? X0 + 20 : X1 - 40, s < 0 ? X0 + 40 : X1 - 20, cy, Z0 + r + 4, r * 0.88, 14); a.xcyl(s < 0 ? X0 : X1 - 20, s < 0 ? X0 + 20 : X1, cy, Z0 + r + 4, r * 0.55, 12); a.xcyl(s < 0 ? X0 + 40 : X1 - 60, s < 0 ? X0 + 60 : X1 - 40, cy, Z0 + r + 4, r * 1.04, 16); }
    a.circ(X0 + 30, cy, r * 0.7, 'EQUIP-DETAIL'); a.circ(X1 - 30, cy, r * 0.7, 'EQUIP-DETAIL');
  } else {
    puff(a, X0, YF, X1, YB, Z0, Z1, v.round * IN, 7);
    if (v.piping) rectLoop(a, X0 + 8, YF + 8, X1 - 8, YB - 8, Z0 + (Z1 - Z0) * 0.5, 5);
    a.cyl(cx, cy, Z1 - 12, Z1 - 0.01 + 4 > Z1 ? Z1 : Z1 - 4, 14, 8);
    for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.cyl(cx + px * W * 0.2, cy + py * D * 0.2, Z1 - 14, Z1 - 4, 5, 6);
    a.rect(X0 + 12, YF + 12, X1 - 12, YB - 12, 'EQUIP-DETAIL'); a.line(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.line(X0, YB, X1, YF, 'EQUIP-DETAIL');
  }
  a.log('Added the ' + (v.kind === 'bolster' ? 'cylindrical bolster with gathered ends' : 'plump square form with ' + (v.piping ? 'piping, ' : '') + 'centre button and corner tufts') + ' (plan and 3D).');
}
function curtain(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, ztop = Z1 - 40, rodZ = Z1 - 24;
  a.outline('EQUIP-HIDDEN');
  a.xcyl(X0 + 10, X1 - 10, cy, rodZ, 10, 8); for (const s of [-1, 1]) { a.ell(s < 0 ? X0 + 14 : X1 - 14, cy, rodZ, 24, 24, 24, 10, 6); }
  const np = v.panels, pw = np === 2 ? (W - 80) / 2 : W - 80, amp = v.amp ?? 55, seg = m.round(pw / 70);
  const panelsAt = np === 2 ? [[X0 + 30, X0 + 30 + pw], [X1 - 30 - pw, X1 - 30]] : [[X0 + 40, X0 + 40 + pw]];
  for (const [px0, px1] of panelsAt) {
    for (let k = 0; k < seg; k++) {
      const xa = px0 + ((px1 - px0) * k) / seg, xb = px0 + ((px1 - px0) * (k + 1)) / seg, ph = (k / seg) * 2 * PI * (pw / 380), y = cy + amp * m.sin(ph) * 0.9;
      const tie = v.tie ? 1 : 0, zb = Z0 + 6;
      if (tie) { const zt = Z0 + (ztop - Z0) * 0.42; a.box(xa, y - 14, zb, xb, y + 14, zt - 90); a.box(xa + (px0 === X0 + 30 ? 0 : 0) + (xb - xa) * 0.2 * (px0 < cx ? 1 : -1), y - 8, zt - 90, xb + (xb - xa) * 0.2 * (px0 < cx ? 1 : -1), y + 8, zt + 90); a.box(xa, y - 14, zt + 90, xb, y + 14, ztop); }
      else a.box(xa, y - 14, zb, xb, y + 14, ztop);
      a.tube([[(xa + xb) / 2, cy, rodZ - 8], [(xa + xb) / 2, y, ztop - 2]], [5, 5], 4);
      if (k < seg) a.line(xa, y + 14, xb, cy + amp * m.sin(((k + 1) / seg) * 2 * PI * (pw / 380)) * 0.9 + 14, 'EQUIP');
    }
    if (v.tie) { a.tube([[px0 < cx ? px1 : px0, cy - 50, Z0 + (ztop - Z0) * 0.42], [px0 < cx ? px1 : px0, YB - 20, Z0 + (ztop - Z0) * 0.42]], [8, 8], 5); }
  }
  a.line(X0 + 10, cy, X1 - 10, cy, 'EQUIP-DETAIL');
  a.log('Added the rod with finials, ' + (np === 2 ? 'two' : 'one') + ' gathered panel' + (np === 2 ? 's' : '') + ' hung on rings with folds' + (v.tie ? ' and tie-backs' : '') + ' (plan and 3D).');
}
function pouf(a, v) {
  const { cx, cy, Z0, Z1, W, D, X0, X1, YF, YB } = a, R = W / 2 - 4, legH = v.legs ? v.legs * IN : 0;
  if (v.kind === 'round') {
    a.circ(cx, cy, R, 'EQUIP');
    const prof = []; const h = Z1 - Z0 - legH; for (let k = 0; k <= 12; k++) { const t = k / 12; prof.push([legH + h * t, R * (0.66 + 0.34 * m.pow(1 - m.pow(m.abs(2 * t - 1), 4), 0.25)) * (0.9 + 0.1 * m.sin(PI * t)) + 4]); }
    lathe(a, cx, cy, Z0, prof, 28);
    hoop(a, cx, cy, Z0 + legH + h * 0.5, R + 3, R + 3, 5, 28, 5); hoop(a, cx, cy, Z0 + legH + h * 0.12, R * 0.9, R * 0.9, 4, 28, 5); hoop(a, cx, cy, Z1 - h * 0.12, R * 0.9, R * 0.9, 4, 28, 5);
    a.ell(cx, cy, Z1 - 4, 14, 14, 8, 8, 5);
    for (let k = 0; k < 8; k++) { const th = k * PI / 4; a.tube([[cx + 14 * m.cos(th), cy + 14 * m.sin(th), Z1 - 2], [cx + R * 0.88 * m.cos(th), cy + R * 0.88 * m.sin(th), Z1 - h * 0.08]], [3, 3], 4); a.line(cx, cy, cx + R * m.cos(th), cy + R * m.sin(th), 'EQUIP-DETAIL'); }
    if (v.legs) for (let k = 0; k < 4; k++) { const th = k * PI / 2 + PI / 4; a.tube([[cx + R * 0.55 * m.cos(th), cy + R * 0.55 * m.sin(th), Z0 + legH], [cx + R * 0.72 * m.cos(th), cy + R * 0.72 * m.sin(th), Z0 + 4]], [18, 11], 8); }
  } else if (v.kind === 'drum') {
    a.circ(cx, cy, R, 'EQUIP'); a.cyl(cx, cy, Z0 + 6, Z1 - 6, R, 28); a.cyl(cx, cy, Z0, Z0 + 12, R * 0.97, 28); a.cyl(cx, cy, Z1 - 12, Z1, R * 0.97, 28);
    hoop(a, cx, cy, Z1 - 8, R, R, 4, 28, 5); hoop(a, cx, cy, Z0 + 8, R, R, 4, 28, 5);
    for (let k = 0; k < 10; k++) { const th = k * PI / 5; a.tube([[cx + R * m.cos(th), cy + R * m.sin(th), Z0 + 12], [cx + R * m.cos(th), cy + R * m.sin(th), Z1 - 12]], [3, 3], 4); }
    a.cyl(cx, cy, Z1 - 3, Z1, 40, 12);
  } else {
    a.outline(); puff(a, X0, YF, X1, YB, Z0 + legH, Z1, 70, 8);
    rectLoop(a, X0 + 6, YF + 6, X1 - 6, YB - 6, Z0 + legH + (Z1 - Z0 - legH) * 0.5, 5);
    for (const [px, py] of [[X0 + 70, YF + 70], [X1 - 70, YF + 70], [X0 + 70, YB - 70], [X1 - 70, YB - 70]]) { a.cyl(px, py, Z1 - 12, Z1 - 3, 6, 6); if (legH) a.tube([[px, py, Z0 + legH], [px, py, Z0 + 4]], [20, 14], 8); }
    a.ell(cx, cy, Z1 - 5, 20, 20, 8, 8, 5);
    a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL');
  }
  a.log('Added the ' + (v.kind === 'drum' ? 'drum with top and bottom piping' : 'padded body with a seam and tufted centre') + (v.legs ? ' on four tapered legs' : '') + ' (plan and 3D).');
}
function bedding(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, bh = 6 * IN, mh = v.matt * IN, hbT = 100, hbTop = Z1;
  a.outline();
  a.box(X0, YF + 40, Z0 + 150, X1, YB - 0, Z0 + bh); for (const sx of [-1, 1]) for (const sy of [YF + 120, YB - 120]) a.box(cx + sx * (W / 2 - 100) - 40, sy - 40, Z0, cx + sx * (W / 2 - 100) + 40, sy + 40, Z0 + 150);
  a.box(X0 + 20, YF + 60, Z0 + bh, X1 - 20, YB - 40, Z0 + bh + mh);                     // mattress
  const dz = Z0 + bh + mh; puff(a, X0 - 0, YF + 40, X1, YB - 130, dz, dz + 90, 60, 5);   // duvet
  a.box(X0, YF + 40, dz - 400, X1, YF + 140, dz + 40); a.box(X0 + 0, YF + 40, dz - 20, X1, YF + 40 + 500, dz + 100); a.line(X0, YF + 540, X1, YF + 540, 'EQUIP-DETAIL');   // drop and folded cuff
  const np = v.pillows;
  for (let i = 0; i < np; i++) { const x = X0 + (W * (i + 0.5)) / np, pw = (W / np) * 0.46; a.ell(x, YB - 300, dz + 150, pw, 230, 140, 14, 8); a.ellp(x, YB - 300, pw, 230, 'EQUIP-DETAIL'); }
  a.box(X0, YB - 90, Z0, X1, YB, hbTop); a.box(X0 - 0, YB - 130, hbTop - 120, X1, YB, hbTop);
  for (let k = 1; k < 4; k++) a.box(X0 + 40, YB - 100, Z0 + bh + mh + 100 + (hbTop - bh - mh - 220) * k / 4 - 12, X1 - 40, YB - 90, Z0 + bh + mh + 100 + (hbTop - bh - mh - 220) * k / 4 + 12);
  a.rect(X0 + 20, YF + 60, X1 - 20, YB - 40, 'EQUIP-DETAIL');
  a.log('Added the base on legs, mattress, a duvet with a folded cuff, ' + np + ' pillows and a padded headboard (plan and 3D).');
}
function throwStack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a;
  a.outline();
  if (v.kind === 'rolled') { const r = D / 2 - 4; a.xcyl(X0 + 10, X1 - 10, cy, Z0 + r, r, 18); a.ell(X0 + 10, cy, Z0 + r, 8, r * 0.9, r * 0.9, 6, 6); for (const x of [cx - W * 0.28, cx + W * 0.28]) { a.tube([[x, cy - r - 4, Z0 + r], [x, cy, Z0 + r + r + 4], [x, cy + r + 4, Z0 + r]], [4, 4, 4], 5); hoop(a, x, cy, Z0 + r, 0.1, 0.1, 1, 6, 3); } hoop(a, cx - W * 0.28, cy, Z0 + r, 1, 1, 1, 4, 3); a.circ(X0 + 20, cy, r, 'EQUIP-DETAIL'); }
  else {
    const n = v.layers, lh = (Z1 - Z0) / n;
    for (let i = 0; i < n; i++) { const ins = (i % 2) * 14; puff(a, X0 + ins, YF + ins * 0.5, X1 - ins, YB - ins * 0.5, Z0 + i * lh, Z0 + (i + 1) * lh, 18, 3); a.box(X0 + ins - 0.0, YF + 30, Z0 + i * lh + lh * 0.45, X0 + ins + 14, YB - 30, Z0 + i * lh + lh * 0.55); }
    for (let x = X0 + 30; x < X1 - 20; x += 36) { a.box(x, YF - 0.0, Z0 + 6, x + 9, YF + 0.01 + 14, Z0 + (Z1 - Z0) * 0.5); }
    a.line(X0 + 14, YF, X0 + 14, YB, 'EQUIP-DETAIL');
  }
  a.log('Added ' + (v.kind === 'rolled' ? 'a rolled blanket with two ties' : v.layers + ' folded layers with a fringe along the front edge') + ' (plan and 3D).');
}

// ================================================================================== ACCESSORIES
function vase(a, v) {
  const { cx, cy, Z0, Z1, W, H } = a, R = W / 2 - 6;
  a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * v.neck, 'EQUIP-DETAIL');
  const pf = { bottle: [[0, 0.5], [0.02, 0.78], [0.2, 0.98], [0.5, 1], [0.7, 0.7], [0.8, 0.28], [0.9, 0.26], [1, 0.32]], urn: [[0, 0.45], [0.04, 0.55], [0.1, 0.4], [0.2, 0.75], [0.5, 1], [0.78, 0.8], [0.88, 0.5], [0.94, 0.62], [1, 0.68]], cylinder: [[0, 0.95], [0.02, 1], [0.96, 1], [1, 0.97]], bowl: [[0, 0.4], [0.1, 0.6], [0.35, 0.92], [0.7, 1], [1, 0.98]], amphora: [[0, 0.3], [0.04, 0.4], [0.2, 0.9], [0.45, 1], [0.7, 0.55], [0.82, 0.3], [0.9, 0.28], [0.95, 0.4], [1, 0.5]], bud: [[0, 0.7], [0.1, 1], [0.3, 0.85], [0.5, 0.25], [0.9, 0.2], [1, 0.35]] }[v.shape];
  lathe(a, cx, cy, Z0, pf.map(([t, r]) => [t * H, r * R]), 26);
  if (v.shape === 'urn') { a.cone(cx, cy, Z1 - 4, Z1, R * 0.68, 0, 18); }
  if (v.shape === 'amphora') for (const s of [-1, 1]) { const p = []; for (let k = 0; k <= 8; k++) { const t = k / 8; p.push([cx + s * R * (0.3 + 0.55 * m.sin(t * PI)), cy, Z0 + H * (0.82 - 0.35 * t)]); } a.tube(p, p.map(() => 8), 6); a.line(cx + s * R * 0.3, cy, cx + s * R, cy, 'EQUIP-DETAIL'); }
  a.log('Added the turned ' + v.shape + ' profile' + (v.shape === 'amphora' ? ' with two handles' : v.shape === 'urn' ? ' with a lid and knob' : '') + ' (plan and 3D).');
}
function sculpture(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline();
  const pl = H * 0.12; a.box(X0, YF, Z0, X1, YB, Z0 + pl); a.box(X0 + 10, YF + 10, Z0 + pl, X1 - 10, YB - 10, Z0 + pl + 14);
  if (v.kind === 'stones') { const rs = [0.34, 0.26, 0.19]; let z = Z0 + pl + 14; rs.forEach((r, i) => { const rr = W * r; a.ell(cx + (i - 1) * 14, cy, z + rr * 0.55, rr, rr * 0.9, rr * 0.55, 16, 9); a.ellp(cx + (i - 1) * 14, cy, rr, rr * 0.9, 'EQUIP-DETAIL'); z += rr * 0.95; }); }
  else if (v.kind === 'ring') { vhoop(a, cx, cy, Z0 + pl + 14 + (H - pl) * 0.5, W * 0.38, (H - pl - 14) * 0.45, W * 0.06, 28, 10); a.rect(cx - W * 0.44, cy - W * 0.06, cx + W * 0.44, cy + W * 0.06, 'EQUIP-DETAIL'); a.cyl(cx - W * 0.3, cy, Z0 + pl, Z0 + pl + (H - pl) * 0.1 + 14, 20, 8); }
  else if (v.kind === 'arches') { for (let i = 0; i < 3; i++) { const p = []; const x0 = cx - W * 0.34 + i * W * 0.22, rw = W * 0.22, hh = (H - pl - 20) * (0.62 + i * 0.16); for (let k = 0; k <= 10; k++) { const t = (k / 10) * PI; p.push([x0 + rw * (1 - m.cos(t)) * 0.5 + rw * 0.0, cy + (i - 1) * 20, Z0 + pl + 14 + hh * m.sin(t)]); } a.tube(p, p.map(() => W * 0.035), 7); a.circ(x0 + rw / 2, cy + (i - 1) * 20, W * 0.05, 'EQUIP-DETAIL'); } }
  else { const pos = [[0, 0, 0.55], [-0.28, 0.1, 0.3], [0.26, -0.08, 0.34], [0.05, 0.12, 0.88], [-0.18, -0.1, 0.62]]; for (const [dx, dy, f] of pos) { const r = W * (0.13 + (1 - f) * 0.1); a.ell(cx + dx * W, cy + dy * D, Z0 + pl + 14 + r + (H - pl - 40 - r * 2) * f * 0.7, r, r, r, 14, 9); a.circ(cx + dx * W, cy + dy * D, r, 'EQUIP-DETAIL'); } }
  a.log('Added the plinth and a ' + (v.kind === 'stones' ? 'cairn of three balanced stones' : v.kind === 'ring' ? 'thick ring standing on a post' : v.kind === 'arches' ? 'row of three rising arches' : 'cluster of five spheres') + ' (plan and 3D).');
}
function bookends(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, pw = 8 * IN * 0.2;
  a.outline();
  const L = v.books ? W * 0.12 : W * 0.5, ph = Z1 - Z0;
  const plate = (x, s) => { a.box(x - 6, YF + 10, Z0, x + 6, YB - 10, Z0 + ph); a.box(x < cx ? x - 6 : x - 6 - 0, YF + 10, Z0, x < cx ? x + 90 : x + 6, YB - 10, Z0 + 8); };
  if (v.kind === 'arc') { for (const s of [-1, 1]) { const x = s < 0 ? X0 + 10 : X1 - 10, pts = []; for (let k = 0; k <= 8; k++) { const t = (k / 8) * PI / 2; pts.push([x + (s < 0 ? 1 : -1) * 0, 0, 0]); } const pol = []; for (let k = 0; k <= 8; k++) { const t = (k / 8) * PI / 2; pol.push([(s < 0 ? X0 + 8 : X1 - 8) + s * 0 + (s < 0 ? 1 : -1) * (ph * 0.5) * (1 - m.cos(t)) * 0.0 + (s < 0 ? 1 : -1) * ph * 0.42 * (1 - m.cos(t)) * 0, Z0 + ph * m.sin(t)]); } }
  }
  for (const s of [-1, 1]) {
    const xs = s < 0 ? X0 : X1;
    a.box(s < 0 ? xs : xs - 12, YF + 8, Z0, s < 0 ? xs + 12 : xs, YB - 8, Z0 + ph);
    a.box(s < 0 ? xs : xs - 110, YF + 8, Z0, s < 0 ? xs + 110 : xs, YB - 8, Z0 + 10);
    if (v.kind === 'arc') a.cone(s < 0 ? xs + 6 : xs - 6, cy, Z0 + ph - 0.01 - 60, Z0 + ph, 30, 0, 8); else a.box(s < 0 ? xs + 12 : xs - 40, cy - 25, Z0 + ph * 0.5, s < 0 ? xs + 40 : xs - 12, cy + 25, Z0 + ph * 0.5 + 12);
  }
  if (v.books) { let x = X0 + 18; let i = 0; const hs = [0.82, 0.92, 0.78, 0.9, 0.86, 0.95, 0.8, 0.88]; while (x < X1 - 30 && i < v.books) { const bw = 20 + (i * 7) % 18, bh = ph * hs[i % hs.length]; a.box(x, YF + 24, Z0 + 10, x + bw, YB - 20, Z0 + 10 + bh - 10); a.box(x + bw * 0.3, YF + 20, Z0 + 10 + bh * 0.62, x + bw * 0.7, YF + 24, Z0 + 10 + bh * 0.7); a.line(x, YF + 24, x, YB - 20, 'EQUIP-DETAIL'); x += bw + 2; i++; } }
  a.line(X0 + 12, cy, X1 - 12, cy, 'EQUIP-DETAIL');
  a.log('Added two weighted L-shaped ends' + (v.books ? ' and a row of ' + v.books + ' books of mixed heights between them' : '') + ' (plan and 3D).');
}
function tray(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy, H } = a, rim = H * 0.5;
  if (v.round) {
    const R = W / 2 - 2; a.circ(cx, cy, R, 'EQUIP'); a.cyl(cx, cy, Z0, Z0 + 8, R, 36); a.cone(cx, cy, Z0 + 8, Z0 + 8 + rim, R, R * 1.0, 36); a.cyl(cx, cy, Z0 + 8, Z0 + 8 + rim, R * 0.93, 36); hoop(a, cx, cy, Z0 + 8 + rim, R, R, 5, 36, 5); a.circ(cx, cy, R * 0.93, 'EQUIP-DETAIL');
    a.cyl(cx, cy, Z0, Z0 + 3, R * 0.5, 24);
  } else {
    a.outline(); a.box(X0 + 10, YF + 10, Z0, X1 - 10, YB - 10, Z0 + 10);
    for (const s of [0, 1]) { a.box(X0 + 10, s ? YB - 22 : YF + 10, Z0, X1 - 10, s ? YB - 10 : YF + 22, Z0 + rim); a.box(s ? X1 - 22 : X0 + 10, YF + 10, Z0, s ? X1 - 10 : X0 + 22, YB - 10, Z0 + rim); }
    a.rect(X0 + 22, YF + 22, X1 - 22, YB - 22, 'EQUIP-DETAIL');
    if (v.handles) for (const s of [-1, 1]) { const x = s < 0 ? X0 + 8 : X1 - 8; a.tube([[x + s * 0, cy - 50, Z0 + rim - 4], [x + s * -0 - s * 0, cy - 50, Z0 + rim + 0], [s < 0 ? X0 : X1, cy - 50, Z0 + rim], [s < 0 ? X0 : X1, cy + 50, Z0 + rim], [x, cy + 50, Z0 + rim - 4]], [7, 7, 7, 7, 7], 6); a.box(s < 0 ? X0 : X1 - 14, cy - 60, Z0 + rim * 0.25, s < 0 ? X0 + 14 : X1, cy + 60, Z0 + rim); }
    for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 40], [X1 - 40, YB - 40]]) if (v.feet) a.cyl(x, y, Z0 - 0.01, Z0 + 3, 12, 6);
  }
  a.log('Added the base, a raised rim' + (v.handles ? ' and two cut-out end handles' : '') + ' (plan and 3D).');
}
function mirror(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy, H } = a, y0 = YB - 40;
  a.outline();
  const fw = v.frame * IN;
  if (v.kind === 'round') {
    const R = W / 2 - 4, zc = Z0 + H / 2; vhoop(a, cx, y0 + 20, zc, R - fw / 2, R - fw / 2, fw / 2, 36, 8); a.ycyl(y0 + 10, y0 + 26, cx, zc, R - fw, 36); a.ycyl(y0 + 26, y0 + 30, cx, zc, R - fw * 1.1, 36); a.circ(cx, y0 + 20, R, 'EQUIP-DETAIL'); a.cyl(cx, YB - 10, Z1 - 30, Z1 - 20, 10, 6);
  } else if (v.kind === 'sun') {
    const R = W * 0.3, zc = Z0 + H / 2; a.ycyl(y0 + 10, y0 + 24, cx, zc, R, 30); vhoop(a, cx, y0 + 20, zc, R + 8, R + 8, 9, 30, 6);
    for (let k = 0; k < 20; k++) { const th = (k / 20) * 2 * PI, r2 = k % 2 ? W / 2 - 10 : W / 2 - 4 - W * 0.07; a.tube([[cx + (R + 12) * m.cos(th), y0 + 20, zc + (R + 12) * m.sin(th)], [cx + r2 * m.cos(th), y0 + 20, zc + r2 * m.sin(th)]], [8, 3], 5); }
  } else if (v.kind === 'arch') {
    a.frame(X0, Z0, X1, Z0 + H * 0.7, y0, y0 + 36, fw); const R = W / 2, zc = Z0 + H * 0.7;
    for (let k = 0; k < 10; k++) { const t0 = (k / 10) * PI, t1 = ((k + 1) / 10) * PI; prismY(a, [[cx - (R - 0) * m.cos(t0), zc + R * m.sin(t0)], [cx - R * m.cos(t1), zc + R * m.sin(t1)], [cx - (R - fw) * m.cos(t1), zc + (R - fw) * m.sin(t1)], [cx - (R - fw) * m.cos(t0), zc + (R - fw) * m.sin(t0)]], y0, y0 + 36); }
    for (let k = 0; k < 10; k++) { const t0 = (k / 10) * PI, t1 = ((k + 1) / 10) * PI; prismY(a, [[cx - (R - fw) * m.cos(t0), zc + (R - fw) * m.sin(t0)], [cx - (R - fw) * m.cos(t1), zc + (R - fw) * m.sin(t1)], [cx, zc]], y0 + 12, y0 + 18); }
    a.box(X0 + fw, y0 + 12, Z0 + fw, X1 - fw, y0 + 18, zc);
  } else {   // leaning floor mirror
    a.frame(X0, Z0, X1, Z1 - 150, y0 + 40, y0 + 90, fw); a.box(X0 + fw, y0 + 62, Z0 + fw, X1 - fw, y0 + 70, Z1 - 150 - fw);
    a.tube([[cx, y0 + 90, Z1 - 450], [cx, YB - 4, Z0 + 40]], [14, 14], 6); a.box(X0, y0 + 40, Z0, X1, y0 + 90, Z0 + 20);
    for (const s of [-1, 1]) a.tube([[cx + s * W * 0.34, y0 + 40, Z0 + 30], [cx + s * W * 0.34, YF + 4, Z0]], [10, 10], 6);
  }
  a.rect(X0, YB - 40 - 0.01, X1, YB - 0.01 + 0.01, 'EQUIP-DETAIL');
  a.log('Added the ' + v.kind + ' frame and a mirror plate set in it' + (v.kind === 'floor' ? ', with a rear prop' : '') + ' (plan and 3D).');
}
function wallArt(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy, H } = a, y1 = YB - 10, y0 = YB - 60;
  a.outline();
  const one = (x0, z0, x1, z1, mt) => { a.frame(x0, z0, x1, z1, y0, y1, 28); a.box(x0 + 28, y0 + 14, z0 + 28, x1 - 28, y0 + 22, z1 - 28); a.frame(x0 + 28, z0 + 28, x1 - 28, z1 - 28, y0 + 22, y0 + 30, mt); a.box(x0 + 28 + mt, y0 + 30, z0 + 28 + mt, x1 - 28 - mt, y0 + 34, z1 - 28 - mt); a.tube([[(x0 + x1) / 2 - 70, y1, z1 - 40], [(x0 + x1) / 2, y1 + 0.01, z1 - 4], [(x0 + x1) / 2 + 70, y1, z1 - 40]], [2, 2, 2], 4); };
  if (v.kind === 'single') one(X0, Z0, X1, Z1, v.mat * IN);
  else if (v.kind === 'triptych') { const g = 30, w = (W - 2 * g) / 3; for (let i = 0; i < 3; i++) one(X0 + i * (w + g), Z0, X0 + i * (w + g) + w, Z1, 40); }
  else { const g = 26, cols = 3, rows = 2, w = (W - (cols - 1) * g) / cols, h = (H - (rows - 1) * g) / rows; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x0 = X0 + c * (w + g), z0 = Z0 + r * (h + g); one(x0, z0, x0 + w, z0 + h, 30); } }
  a.line(X0, y1, X1, y1, 'EQUIP-DETAIL');
  a.log('Added ' + (v.kind === 'single' ? 'a frame with a mat and a print and a hanging wire' : v.kind === 'triptych' ? 'three matching frames with mats and prints' : 'six frames in a grid, each with a mat') + ' (plan and 3D).');
}
function clock(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy, H } = a;
  a.outline();
  if (v.kind === 'wall') {
    const R = W / 2 - 4, zc = Z0 + H / 2, y = YB - D * 0.5;
    a.ycyl(YB - D, YB, cx, zc, R, 36); vhoop(a, cx, YB - D, zc, R - 10, R - 10, 12, 36, 6); a.ycyl(YB - D - 4, YB - D, cx, zc, R - 22, 36);
    for (let k = 0; k < 12; k++) { const th = (k / 12) * 2 * PI, big = k % 3 === 0, r1 = R - 28 - (big ? 56 : 30); a.box(cx + (R - 26) * m.sin(th) - (big ? 7 : 3), YB - D - 10, zc + (R - 26) * m.cos(th) - (big ? 7 : 3), cx + (R - 26) * m.sin(th) + (big ? 7 : 3), YB - D - 4, zc + (R - 26) * m.cos(th) + (big ? 7 : 3)); a.tube([[cx + (R - 30) * m.sin(th), YB - D - 8, zc + (R - 30) * m.cos(th)], [cx + (R - 30 - (big ? 50 : 26)) * m.sin(th), YB - D - 8, zc + (R - 30 - (big ? 50 : 26)) * m.cos(th)]], [big ? 5 : 3, big ? 5 : 3], 4); }
    a.tube([[cx, YB - D - 14, zc], [cx + (R - 90) * m.sin(2.1), YB - D - 14, zc + (R - 90) * m.cos(2.1)]], [7, 3], 4); a.tube([[cx, YB - D - 18, zc], [cx + (R - 36) * m.sin(0.35), YB - D - 18, zc + (R - 36) * m.cos(0.35)]], [6, 2], 4); a.ell(cx, YB - D - 20, zc, 12, 8, 12, 8, 5);
    a.circ(cx, cy, R, 'EQUIP-DETAIL');
  } else {   // mantel clock, arch top case
    const w = W, bh = H * 0.1, zc = Z0 + bh + (H - bh) * 0.45, R = W * 0.36;
    a.box(X0, YF, Z0 + 12, X1, YB, Z0 + bh); for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.cyl(cx + sx * (W / 2 - 30), cy + sy * (D / 2 - 30), Z0, Z0 + 14, 18, 8);
    const hh = H - bh;
    a.box(X0 + 20, YF + 20, Z0 + bh, X1 - 20, YB - 20, Z0 + bh + hh * 0.7);
    for (let k = 0; k < 8; k++) { const t0 = (k / 8) * PI, t1 = ((k + 1) / 8) * PI, rr = (W - 40) / 2; prismY(a, [[cx - rr * m.cos(t0), Z0 + bh + hh * 0.7 + (Z1 - Z0 - bh - hh * 0.7) * m.sin(t0)], [cx - rr * m.cos(t1), Z0 + bh + hh * 0.7 + (Z1 - Z0 - bh - hh * 0.7) * m.sin(t1)], [cx, Z0 + bh + hh * 0.7]], YF + 20, YB - 20); }
    a.ycyl(YF + 2, YF + 24, cx, zc, R, 30); vhoop(a, cx, YF + 6, zc, R + 6, R + 6, 8, 30, 6);
    for (let k = 0; k < 12; k++) { const th = (k / 12) * 2 * PI; a.box(cx + (R - 24) * m.sin(th) - 5, YF - 0.01 + 1, zc + (R - 24) * m.cos(th) - 5, cx + (R - 24) * m.sin(th) + 5, YF + 4, zc + (R - 24) * m.cos(th) + 5); }
    a.tube([[cx, YF - 0.01, zc], [cx + (R - 50) * m.sin(1.0), YF - 0.01, zc + (R - 50) * m.cos(1.0)]], [6, 3], 4);
    a.circ(cx, YF + 14, R, 'EQUIP-DETAIL');
  }
  a.log('Added the ' + v.kind + ' clock ' + (v.kind === 'wall' ? 'case with a bezel, dial, twelve hour marks and hands' : 'case on feet with an arched top, a dial and hands') + ' (plan and 3D).');
}

// ================================================================================== FINISHES
function wainscot(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H } = a, rail = 100, sk = 130;
  a.outline();
  a.box(X0, YB - 12, Z0, X1, YB, Z1);
  a.box(X0, YB - D * 0.55, Z0, X1, YB - 12, Z0 + sk); a.box(X0, YB - D * 0.65, Z0 + sk, X1, YB - D * 0.45, Z0 + sk + 14); a.line(X0, YB - D * 0.55, X1, YB - D * 0.55);
  a.box(X0 - 0.01 + 0.02, YB - D * 0.8, Z1 - 70, X1, YB - 12, Z1 - 40); a.box(X0, YB - D, Z1 - 40, X1, YB - 12, Z1);
  const top = Z1 - 70;
  if (v.kind === 'beadboard') { const n = m.round(W / 85); for (let i = 0; i < n; i++) { const x = X0 + (W * i) / n; a.box(x + 1, YB - D * 0.4, Z0 + sk + 14, x + W / n - 1, YB - 12, top - 80); a.box(x + W / n / 2 - 5, YB - D * 0.4 - 6, Z0 + sk + 14, x + W / n / 2 + 5, YB - D * 0.4, top - 80); } a.box(X0, YB - D * 0.5, top - 80, X1, YB - 12, top);
    a.box(X0, YB - D * 0.58, Z0 + sk + 14, X1, YB - D * 0.4, Z0 + sk + 14 + 40); }
  else if (v.kind === 'slat') { const n = m.round(W / 60); a.box(X0, YB - D * 0.3, Z0 + sk, X1, YB - 12, top); for (let i = 0; i < n; i++) { const x = X0 + (W * i) / n + 6; a.box(x, YB - D * 0.9, Z0 + sk, x + W / n - 18, YB - D * 0.3, top); a.line(x, YB - D * 0.9, x, YB - 12); } }
  else {
    const np = v.panels, pw = (W - rail * (np + 1)) / np, ph = top - (Z0 + sk + 14) - rail * 2;
    a.box(X0, YB - D * 0.55, Z0 + sk + 14, X1, YB - 12, top);
    for (let i = 0; i < np; i++) {
      const x0 = X0 + rail + i * (pw + rail), x1 = x0 + pw, z0 = Z0 + sk + 14 + rail, z1 = z0 + ph;
      if (v.kind === 'raised') { a.box(x0, YB - D * 0.55 - 0.0, z0, x1, YB - D * 0.65, z1); a.frame(x0, z0, x1, z1, YB - D * 0.65 - 18, YB - D * 0.55, 34); a.box(x0 + 60, YB - D * 0.82, z0 + 60, x1 - 60, YB - D * 0.65 - 18, z1 - 60); }
      else { a.frame(x0, z0, x1, z1, YB - D * 0.8, YB - D * 0.55, 28); a.box(x0 + 28, YB - D * 0.55 - 6, z0 + 28, x1 - 28, YB - 14, z1 - 28); }
      a.rect(x0, YB - D * 0.7, x1, YB - 12, 'EQUIP-DETAIL');
    }
  }
  a.log('Added the backer, skirting with a cap, ' + (v.kind === 'beadboard' ? 'vertical beaded boards' : v.kind === 'slat' ? 'vertical slats' : v.panels + ' ' + (v.kind === 'raised' ? 'raised' : 'flat-recessed') + ' panels between rails') + ' and a top rail and cap (plan and 3D).');
}
function featureWall(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H } = a;
  a.outline();
  a.box(X0, YB - 40, Z0, X1, YB, Z1);
  if (v.kind === 'stone') {
    const rows = v.rows, rh = (Z1 - Z0) / rows; let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let r = 0; r < rows; r++) { let x = X0 - (r % 2) * 150; while (x < X1) { const w = 220 + rnd() * 380, d = D * (0.35 + rnd() * 0.45); const xa = m.max(X0, x + 4), xb = m.min(X1, x + w - 4); if (xb - xa > 40) a.box(xa, YB - 40 - d, Z0 + r * rh + 4, xb, YB - 40, Z0 + (r + 1) * rh - 4); x += w; } }
    a.line(X0, YF, X1, YF, 'EQUIP-DETAIL');
  } else if (v.kind === 'tile') {
    const n = v.cols, rows = v.rows, w = W / n, h = (Z1 - Z0) / rows, dd = D * 0.8;
    for (let r = 0; r < rows; r++) for (let c = 0; c < n; c++) { const x0 = X0 + c * w + 3, x1 = x0 + w - 6, z0 = Z0 + r * h + 3, z1 = z0 + h - 6, ap = [(x0 + x1) / 2, YB - 40 - dd * (0.7 + 0.3 * ((c + r) % 2)), (z0 + z1) / 2], bz = YB - 40; const cs = [[x0, bz, z0], [x1, bz, z0], [x1, bz, z1], [x0, bz, z1]]; for (let k = 0; k < 4; k++) a.t.push([cs[k], cs[(k + 1) % 4], ap]); }
    a.line(X0, YF + D * 0.2, X1, YF + D * 0.2, 'EQUIP-DETAIL');
  } else {
    const n = m.round(W / 100); for (let i = 0; i < n; i++) { const x = X0 + (W * i) / n + 8, h2 = (i % 3 === 0 ? 1 : 0.985); a.box(x, YB - 40 - D * 0.85, Z0 + 40, x + W / n - 16, YB - 40, Z1 - 40); }
    a.box(X0, YB - 40 - D * 0.85, Z0, X1, YB - 40, Z0 + 40); a.box(X0, YB - 40 - D * 0.85, Z1 - 40, X1, YB - 40, Z1); a.tube([[X0 + 40, YB - 36, Z0 + 60], [X1 - 40, YB - 36, Z0 + 60]], [4, 4], 4);
  }
  a.rect(X0, YB - 40, X1, YB, 'EQUIP-DETAIL');
  a.log('Added the backing wall and ' + (v.kind === 'stone' ? 'courses of ledge stone of mixed lengths and depths' : v.kind === 'tile' ? 'pyramid tiles with alternating relief' : 'deep timber battens between top and bottom rails') + ' (plan and 3D).');
}
function fireplace(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy, H } = a, lw = v.leg * IN, mt = 90, fbW = W - 2 * lw, fbH = v.open * IN;
  a.outline();
  a.box(X0 - 0.0, YF, Z0, X1, YF + D * 0.45, Z0 + 55);   // hearth slab at the front
  const sy = YF + D * 0.35;
  for (const s of [0, 1]) a.box(s ? X1 - lw : X0, sy, Z0 + 55, s ? X1 : X0 + lw, YB, Z0 + 55 + fbH + 140);
  a.box(X0, sy, Z0 + 55 + fbH, X1, YB, Z0 + 55 + fbH + 140);
  a.box(X0 + lw, YB - 60, Z0 + 55, X1 - lw, YB, Z0 + 55 + fbH);                           // firebrick back
  a.box(X0 + lw, sy + 20, Z0 + 55, X1 - lw, YB - 60, Z0 + 61);
  a.box(X0 - 80 < X0 ? X0 : X0, YF + D * 0.28, Z0 + 55 + fbH + 140, X1, YB, Z0 + 55 + fbH + 140 + mt);   // mantel shelf
  a.box(X0 + 60, YF + D * 0.22, Z0 + 55 + fbH + 140 + 0, X1 - 60, YF + D * 0.28, Z0 + 55 + fbH + 140 + mt - 10);
  if (v.breast) a.box(X0 + lw * 0.8, sy + 40, Z0 + 55 + fbH + 140 + mt, X1 - lw * 0.8, YB, Z1);
  else a.box(X0 + lw * 1.1, sy + 60, Z0 + 55 + fbH + 140 + mt, X1 - lw * 1.1, YB, m.min(Z1, Z0 + 55 + fbH + 140 + mt + 300));
  if (v.kind === 'stove') { a.box(X0 + lw + 60, sy + 100, Z0 + 61, X1 - lw - 60, YB - 120, Z0 + 61 + fbH - 160); a.frame(X0 + lw + 100, Z0 + 61 + 40, X1 - lw - 100, Z0 + 61 + fbH - 220, sy + 80, sy + 110, 26); a.cyl(cx, YB - 200, Z0 + 61 + fbH - 160, Z0 + 55 + fbH + 140, 60, 12); }
  else {
    for (let i = 0; i < 3; i++) a.xcyl(cx - fbW * 0.3, cx + fbW * 0.3, sy + 80 + i * 55, Z0 + 61 + 90 + (i % 2) * 20, 28, 10);
    for (const s of [-1, 1]) { a.tube([[cx + s * fbW * 0.34, sy + 100, Z0 + 61], [cx + s * fbW * 0.34, sy + 100, Z0 + 61 + 330]], [14, 14], 6); a.tube([[cx + s * fbW * 0.34, sy + 100, Z0 + 61 + 330], [cx + s * fbW * 0.34, YB - 120, Z0 + 61 + 280]], [9, 9], 6); }
    a.tube([[cx - fbW * 0.34, sy + 100, Z0 + 61 + 250], [cx + fbW * 0.34, sy + 100, Z0 + 61 + 250]], [8, 8], 6);
  }
  a.rect(X0 + lw, sy, X1 - lw, YB - 60, 'EQUIP-DETAIL'); a.rect(X0, YF, X1, YF + D * 0.45, 'EQUIP-DETAIL');
  a.log('Added the hearth slab, two legs, a lintel and mantel shelf, the firebrick opening with ' + (v.kind === 'stove' ? 'a glazed stove and flue' : 'a log grate and fire irons') + (v.breast ? ' and a chimney breast up to the ceiling' : '') + ' (plan and 3D).');
}
function niche(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, t = 40, ft = 70;
  a.outline('EQUIP-HIDDEN');
  a.box(X0, YB - 20, Z0, X1, YB, Z1);
  for (const s of [0, 1]) a.box(s ? X1 - ft : X0, YF, Z0, s ? X1 : X0 + ft, YB - 20, Z1);
  a.box(X0, YF, Z1 - ft, X1, YB - 20, Z1); a.box(X0, YF, Z0, X1, YB - 20, Z0 + ft);
  const n = v.shelves, iz0 = Z0 + ft, iz1 = Z1 - ft;
  for (let i = 1; i <= n; i++) { const z = iz0 + ((iz1 - iz0) * i) / (n + 1); a.box(X0 + ft, YF + 30, z - t / 2, X1 - ft, YB - 20, z + t / 2); a.tube([[X0 + ft + 20, YF + 40, z - t / 2 - 4], [X1 - ft - 20, YF + 40, z - t / 2 - 4]], [3, 3], 4); a.line(X0 + ft, YF + 30, X1 - ft, YF + 30, 'EQUIP-DETAIL'); }
  if (v.display) { for (let i = 0; i <= n; i++) { const z = iz0 + ((iz1 - iz0) * i) / (n + 1) + (i ? t / 2 : 0); a.ell(cx - (i % 2 ? 1 : -1) * W * 0.12, YB - 130, z + 70, 60, 60, 70, 10, 6); } }
  a.rect(X0 + ft, YF + 30, X1 - ft, YB - 20, 'EQUIP-DETAIL');
  a.log('Added the recessed surround frame, back panel, ' + n + ' glass-edge shelves with strip lights' + (v.display ? ' and a vase on each shelf' : '') + ' (plan and 3D).');
}
function divider(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy, H } = a;
  a.outline();
  if (v.kind === 'fold') {
    const n = v.panels, pw = (W - 0) / n, zz = 14, run = pw * 0.97, amp = D / 2 - 20;
    for (let i = 0; i < n; i++) {
      const xa = X0 + i * pw, xb = xa + pw, ya = cy + (i % 2 ? amp : -amp), yb = cy + (i % 2 ? -amp : amp);
      const pts = [[xa, ya], [xb, yb]];
      for (const [z0, z1] of [[Z0 + 50, Z0 + 110], [Z1 - 110, Z1 - 50]]) a.prism([[xa, ya - 18], [xb, yb - 18], [xb, yb + 18], [xa, ya + 18]], z0, z1);
      for (const s of [0, 1]) a.prism([[s ? xb - 40 : xa, (s ? yb : ya) - 18], [s ? xb : xa + 40, (s ? yb : ya) - 18], [s ? xb : xa + 40, (s ? yb : ya) + 18], [s ? xb - 40 : xa, (s ? yb : ya) + 18]].map((p, k) => [p[0], k < 2 ? p[1] : p[1]]), Z0 + 50, Z1 - 50);
      const ns = v.slats; for (let k = 1; k < ns; k++) { const f = k / ns, x = xa + (xb - xa) * f, y = ya + (yb - ya) * f; a.tube([[x, y, Z0 + 110], [x, y, Z1 - 110]], [6, 6], 4); }
      a.box(xa + (xb - xa) * 0.15, ya + (yb - ya) * 0.15 - 3, Z0 + 110, xb - (xb - xa) * 0.15, yb - (yb - ya) * 0.15 + 3, Z1 - 110);
      a.line(xa, ya, xb, yb, 'EQUIP');
      a.tube([[xa, ya, Z0 + 20], [xa, ya, Z1 - 20]], [8, 8], 5);
      a.cyl(xa, ya, Z0, Z0 + 14, 22, 8);
    }
    a.cyl(X1, cy + (n % 2 ? -amp : amp), Z0, Z0 + 14, 22, 8);
  } else if (v.kind === 'slat') {
    const n = m.round(W / 70); a.box(X0, YF + 20, Z0 + 120, X1, YB - 20, Z0 + 170); a.box(X0, YF + 20, Z1 - 70, X1, YB - 20, Z1);
    for (let i = 0; i < n; i++) { const x = X0 + (W * i) / n + 5; a.box(x, cy - 25, Z0 + 170, x + W / n - 10, cy + 25, Z1 - 70); a.rect(x, cy - 25, x + W / n - 10, cy + 25, 'EQUIP-DETAIL'); }
    for (const s of [-1, 1]) a.box(cx + s * (W / 2 - 100) - 40, YF + 10, Z0, cx + s * (W / 2 - 100) + 40, YB - 10, Z0 + 120);
  } else {   // cube bookcase divider
    const cols = v.cols, rows = v.rows, t = 24, cw = (W - t) / cols, ch = (H - 60 - t) / rows;
    a.box(X0, YF, Z0, X1, YB, Z0 + 60);
    for (let c = 0; c <= cols; c++) a.box(X0 + c * cw, YF, Z0 + 60, X0 + c * cw + t, YB, Z1);
    for (let r = 0; r <= rows; r++) a.box(X0, YF, Z0 + 60 + r * ch, X1, YB, Z0 + 60 + r * ch + t);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if ((r + c) % 3 === 1) a.box(X0 + c * cw + t + 30, YF + 40, Z0 + 60 + r * ch + t, X0 + c * cw + t + 30 + 70, YB - 40, Z0 + 60 + r * ch + t + ch * 0.7);
    for (let c = 1; c < cols; c++) a.line(X0 + c * cw, YF, X0 + c * cw, YB, 'EQUIP-DETAIL');
  }
  a.log('Added ' + (v.kind === 'fold' ? v.panels + ' hinged frames in a zigzag with slatted infill and feet' : v.kind === 'slat' ? 'vertical timber slats between a top rail and a base rail on two feet' : 'an open cube grid with a plinth and a few objects in the cubes') + ' (plan and 3D).');
}
function skirting(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, D, H } = a;
  a.outline();
  const sm = (n, f, v0, v1) => Array.from({ length: n + 1 }, (_, i) => [v0 + (v1 - v0) * (i / n), f(i / n)]);
  const P = { skirt: [[0, 0.5], [0.1, 0.5], [0.12, 0.62], [0.55, 0.62], [0.58, 0.8], [0.62, 0.84], [0.75, 0.84], [0.86, 0.72], [0.92, 0.7], [0.96, 0.9], [1, 1]].map(([vv, u]) => [vv, u]),
    plain: [[0, 0.55], [0.8, 0.55], [0.86, 0.5], [0.92, 0.7], [1, 0.8]],
    cove: [[0, 0], ...sm(10, (t) => 1 - m.cos(t * PI / 2), 0.02, 1).map(([vv, u]) => [1 - (vv - 0.02) / 0.98, 1 - u]).reverse().map(([vv, u]) => [vv, u]), [1, 0]],
    cornice: [[0, 0.3], [0.1, 0.3], [0.1, 0.5], [0.2, 0.5], [0.2, 0.62], [0.25, 0.62], [0.25, 0.5], [0.45, 0.5], [0.45, 0.6], [0.55, 0.8], [0.62, 0.8], [0.7, 0.95], [0.78, 1], [1, 1]] }[v.kind];
  let pts = P;
  if (v.kind === 'cove') { pts = [[0.0, 0.0]]; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([0.2 + 0.8 * t, m.sin((t) * PI / 2) * 1.0]); } pts.push([1, 0]); pts = pts.filter((p, i) => i === 0 || true); }
  profile(a, pts, X0, X1, D, Z0, H);
  if (v.kind === 'cornice') for (let x = X0 + 30; x < X1 - 20; x += 60) a.box(x, YB - D * 0.5, Z0 + H * 0.2, x + 28, YB - D * 0.5 + 0.01 - 0.0 - 4 > YF ? YB - D * 0.5 + 2 : YB, Z0 + H * 0.45);
  a.line(X0, YF + D * 0.1, X1, YF + D * 0.1, 'EQUIP-DETAIL');
  a.log('Added the ' + v.kind + ' profile as a stepped extrusion along the length, shown against a wall (plan and 3D).');
}
function inlay(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, T = Z1 - Z0;
  if (v.kind === 'compass') {
    const R = W / 2 - 4; a.circ(cx, cy, R, 'EQUIP'); a.cyl(cx, cy, Z0, Z0 + T * 0.4, R, 48); a.cyl(cx, cy, Z0, Z0 + T * 0.7, R * 0.82, 48); a.cyl(cx, cy, Z0, Z1, R * 0.62, 48);
    for (let k = 0; k < 8; k++) { const th = k * PI / 4 + PI / 8, long = k % 2 === 0 ? 0.96 : 0.74; const p = [[cx + R * 0.12 * m.cos(th - 0.3), cy + R * 0.12 * m.sin(th - 0.3)], [cx + R * long * m.cos(th), cy + R * long * m.sin(th)], [cx + R * 0.12 * m.cos(th + 0.3), cy + R * 0.12 * m.sin(th + 0.3)], [cx, cy]]; a.prism(p, Z0 + T * 0.4, Z1 - 0.01 + 0.01); a.poly(p, 'EQUIP-DETAIL'); }
    a.circ(cx, cy, R * 0.82, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.62, 'EQUIP-DETAIL');
  } else if (v.kind === 'border') {
    a.outline(); const bw = v.band * IN;
    for (const [x0, y0, x1, y1] of [[X0, YF, X1, YF + bw], [X0, YB - bw, X1, YB], [X0, YF + bw, X0 + bw, YB - bw], [X1 - bw, YF + bw, X1, YB - bw]]) a.box(x0, y0, Z0, x1, y1, Z0 + T * 0.6);
    for (const [x, y] of [[X0, YF], [X1 - bw, YF], [X0, YB - bw], [X1 - bw, YB - bw]]) a.box(x, y, Z0, x + bw, y + bw, Z1);
    a.box(X0 + bw * 0.4, YF + bw * 0.4, Z0 + T * 0.6, X1 - bw * 0.4, YF + bw * 0.55, Z1); a.box(X0 + bw * 0.4, YB - bw * 0.55, Z0 + T * 0.6, X1 - bw * 0.4, YB - bw * 0.4, Z1);
    a.rect(X0 + bw, YF + bw, X1 - bw, YB - bw, 'EQUIP-DETAIL'); a.rect(X0 + bw * 0.4, YF + bw * 0.4, X1 - bw * 0.4, YB - bw * 0.4, 'EQUIP-DETAIL');
  } else if (v.kind === 'herringbone') {
    a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + T * 0.3);
    const pl = 150, pw = 38; const nx = m.floor(W / (pw * 2)), ny = m.floor(D / (pw * 2));
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = X0 + 8 + i * pw * 2, y = YF + 8 + j * pw * 2; if (x + pw * 2 > X1 || y + pw * 2 > YB) continue; a.box(x, y, Z0 + T * 0.3, x + pw * 2 - 4, y + pw - 3, Z1); a.box(x, y + pw, Z0 + T * 0.3, x + pw - 3, y + pw * 2 - 4, Z0 + T * 0.3 + (Z1 - Z0 - T * 0.3) * 0.7); }
    a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  } else {   // checker
    a.outline(); const n = v.n, w = W / n, d = D / n; a.box(X0, YF, Z0, X1, YB, Z0 + T * 0.5);
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { const hh = (r + c) % 2 ? Z1 : Z0 + T * 0.75; a.box(X0 + c * w + 2, YF + r * d + 2, Z0 + T * 0.5, X0 + (c + 1) * w - 2, YF + (r + 1) * d - 2, hh); a.rect(X0 + c * w, YF + r * d, X0 + (c + 1) * w, YF + (r + 1) * d, 'EQUIP-DETAIL'); }
  }
  a.log('Added the ' + v.kind + ' floor inlay in raised levels: ' + (v.kind === 'compass' ? 'banded disc and an eight-point star' : v.kind === 'border' ? 'banded frame with corner squares' : v.kind === 'herringbone' ? 'herringbone planks in a patch' : v.n + ' by ' + v.n + ' alternating tiles') + ' (plan and 3D).');
}

export default [
  // ---------------------------------------------------------------- lighting (25)
  fam({ cat: 'interior/lighting', title: 'Generic table lamp', desc: (v) => `Table lamp with a ${v.base} base, stem, cord and a ${v.type} shade${v.pleat ? ' with pleats' : ''}.`,
    vs: [['gourd base, drum shade, 24 in', 16, 16, 24, 0, { base: 'gourd', type: 'drum', baseR: 3.6, shadeH: 9 }], ['column base, empire shade, 26 in', 16, 16, 26, 0, { base: 'column', type: 'empire', baseR: 3, shadeH: 11, pleat: true }], ['tripod base, drum shade, 28 in', 18, 18, 28, 0, { base: 'tripod', type: 'drum', baseR: 6, shadeH: 10 }], ['disc base, cone shade, 20 in', 12, 12, 20, 0, { base: 'disc', type: 'cone', baseR: 3.8, shadeH: 8 }], ['stacked globes, drum shade, 30 in', 18, 18, 30, 0, { base: 'stack', type: 'drum', baseR: 3.2, shadeH: 11 }], ['gourd base, empire shade, 30 in', 20, 20, 30, 0, { base: 'gourd', type: 'empire', baseR: 4.4, shadeH: 12, pleat: true }]], build: tableLamp }),
  fam({ cat: 'interior/lighting', title: 'Generic floor lamp', desc: (v) => `Floor lamp with a round base and a ${v.style} support${v.style === 'tree' ? ' branching to three shaded lights' : v.style === 'torch' ? ' carrying an uplight bowl' : v.style === 'reading' ? ' with a curved boom over a shade' : ' with a shade'}.`,
    vs: [['column, drum shade, 62 in', 18, 18, 62, 0, { style: 'column', baseR: 6 }], ['tripod, empire shade, 64 in', 20, 20, 64, 0, { style: 'tripod', baseR: 9 }], ['tree, 3 lights, 66 in', 26, 26, 66, 0, { style: 'tree', baseR: 7 }], ['torch uplight, 70 in', 16, 16, 70, 0, { style: 'torch', baseR: 6 }], ['reading boom, 60 in', 32, 16, 60, 0, { style: 'reading', baseR: 5 }]], build: floorLamp }),
  fam({ cat: 'interior/lighting', title: 'Generic arc floor lamp', desc: (v) => `Arc lamp with a ${v.base} base block, a long overhanging arm and a dome shade.`,
    vs: [['marble base, 70 in reach', 66, 14, 80, 0, { baseW: 12, baseH: 8, base: 'marble' }], ['stone base, 84 in reach', 80, 16, 90, 0, { baseW: 14, baseH: 10, base: 'stone' }], ['slim base, 56 in reach', 54, 12, 72, 0, { baseW: 10, baseH: 5, base: 'steel' }]], build: arcLamp }),
  fam({ cat: 'interior/lighting', title: 'Generic pendant cluster', desc: (v) => `Cluster of ${v.n} glass globe pendants hung from one canopy on cords of different drops.`,
    vs: [['3 globes', 20, 20, 42, 66, { n: 3 }], ['5 globes', 28, 28, 54, 54, { n: 5 }], ['7 globes, long drop', 36, 36, 72, 36, { n: 7 }]], build: pendantCluster }),
  fam({ cat: 'interior/lighting', title: 'Generic pendant shade', desc: (v) => `Ceiling pendant with a canopy, a drop cord and a ${v.type} shade over a bulb holder.`,
    vs: [['dome, 16 in', 16, 16, 30, 66, { type: 'dome', shadeH: 9 }], ['dome, 24 in', 24, 24, 34, 62, { type: 'dome', shadeH: 12 }], ['drum, 20 in', 20, 20, 32, 64, { type: 'drum', shadeH: 10 }], ['cone, 14 in', 14, 14, 36, 60, { type: 'cone', shadeH: 12 }]], build: pendantShade }),
  fam({ cat: 'interior/lighting', title: 'Generic articulated desk lamp', desc: 'Desk lamp with a weighted round base, two jointed arms with a balance spring and a conical head.',
    vs: [['compact, 18 in', 20, 8, 18, 0, { baseR: 3.5 }], ['standard, 24 in', 26, 10, 24, 0, { baseR: 4.5 }], ['tall, 30 in', 30, 12, 30, 0, { baseR: 5.5 }]], build: deskLamp }),
  // ---------------------------------------------------------------- soft (25)
  fam({ cat: 'interior/soft', title: 'Generic area rug', desc: (v) => `Rectangular rug with a raised border band, an inner field and a centre medallion${v.fringe ? ', with fringe on both short ends' : ''}.`,
    vs: [['3 x 5 ft', 36, 60, 0.4, 0, { border: 3, fringe: true }], ['5 x 8 ft', 60, 96, 0.4, 0, { border: 4, fringe: true }], ['8 x 10 ft', 96, 120, 0.5, 0, { border: 6, fringe: true }], ['runner, 2.5 x 8 ft', 30, 96, 0.4, 0, { border: 3, fringe: true, runner: true }]], build: rug }),
  fam({ cat: 'interior/soft', title: 'Generic round rug', desc: (v) => `Round pile rug with ${v.rings} stepped bands and a petal motif at the centre.`,
    vs: [['4 ft, 2 bands', 48, 48, 0.5, 0, { rings: 2 }], ['6 ft, 3 bands', 72, 72, 0.5, 0, { rings: 3 }], ['8 ft, 3 bands', 96, 96, 0.5, 0, { rings: 3 }]], build: roundRug }),
  fam({ cat: 'interior/soft', title: 'Generic scatter cushion', desc: (v) => v.kind === 'bolster' ? 'Cylindrical bolster cushion with gathered, piped ends.' : `Cushion in a plump square form${v.piping ? ' with piping' : ''}, a centre button and corner tufts.`,
    vs: [['square, 18 in', 18, 18, 6, 0, { kind: 'square', round: 3.2, piping: false }], ['square piped, 22 in', 22, 22, 7, 0, { kind: 'square', round: 3.6, piping: true }], ['lumbar, 12 x 22 in', 22, 12, 5, 0, { kind: 'square', round: 2.6, piping: true }], ['bolster, 8 x 20 in', 20, 8, 8, 0, { kind: 'bolster' }]], build: cushion }),
  fam({ cat: 'interior/soft', title: 'Generic curtain panels', desc: (v) => `Curtain ${v.panels === 2 ? 'pair' : 'panel'} on a rod with finials, hung on rings in gathered folds${v.tie ? ' and held by tie-backs' : ''}.`,
    vs: [['pair, 96 in wide, 96 in drop', 96, 6, 100, 0, { panels: 2 }], ['pair, sheer, 60 in wide, 84 in drop', 60, 4, 88, 0, { panels: 2, amp: 40 }], ['single panel, 48 in wide, 96 in drop', 48, 5, 100, 0, { panels: 1 }], ['pair, tied back, 144 in wide, 108 in drop', 144, 7, 112, 0, { panels: 2, tie: true, amp: 70 }]], build: curtain }),
  fam({ cat: 'interior/soft', title: 'Generic upholstered pouf', desc: (v) => `Upholstered ${v.kind} pouf with ${v.kind === 'drum' ? 'piped edges' : 'a seam and a tufted centre'}${v.legs ? ' on four legs' : ''}.`,
    vs: [['round, 16 in', 16, 16, 14, 0, { kind: 'round' }], ['round on legs, 20 in', 20, 20, 17, 0, { kind: 'round', legs: 4 }], ['square, 20 in', 20, 20, 15, 0, { kind: 'square' }], ['drum, 14 x 20 in', 14, 14, 20, 0, { kind: 'drum' }]], build: pouf }),
  fam({ cat: 'interior/soft', title: 'Generic made bed', desc: (v) => `Bed made up with a padded headboard, a mattress, a duvet with a folded cuff and ${v.pillows} pillows.`,
    vs: [['twin, 39 x 75 in', 39, 80, 44, 0, { matt: 9, pillows: 1 }], ['full, 54 x 75 in', 54, 80, 46, 0, { matt: 10, pillows: 2 }], ['queen, 60 x 80 in', 62, 84, 48, 0, { matt: 11, pillows: 2 }], ['king, 76 x 80 in', 78, 84, 48, 0, { matt: 11, pillows: 3 }]], build: bedding }),
  fam({ cat: 'interior/soft', title: 'Generic folded throw', desc: (v) => v.kind === 'rolled' ? 'Rolled throw blanket held by two ties.' : `Stack of ${v.layers} folded throws with a fringed front edge.`,
    vs: [['stack of 3, 20 x 14 in', 20, 14, 8, 0, { layers: 3 }], ['rolled, 18 x 7 in', 18, 7, 7, 0, { kind: 'rolled' }]], build: throwStack }),
  // ---------------------------------------------------------------- accessories (25)
  fam({ cat: 'interior/accessories', title: 'Generic decor vase', desc: (v) => `Turned ${v.shape} vase with a neck, a body and a footed base${v.shape === 'amphora' ? ', plus two handles' : v.shape === 'urn' ? ', plus a lid and knob' : ''}.`,
    vs: [['bottle, 14 in', 6, 6, 14, 0, { shape: 'bottle', neck: 0.3 }], ['urn with lid, 18 in', 9, 9, 18, 0, { shape: 'urn', neck: 0.6 }], ['cylinder, 12 in', 5, 5, 12, 0, { shape: 'cylinder', neck: 0.9 }], ['low bowl, 6 in', 12, 12, 6, 0, { shape: 'bowl', neck: 0.9 }], ['amphora, 22 in', 10, 10, 22, 0, { shape: 'amphora', neck: 0.3 }], ['bud vase, 9 in', 4, 4, 9, 0, { shape: 'bud', neck: 0.2 }]], build: vase }),
  fam({ cat: 'interior/accessories', title: 'Generic tabletop sculpture', desc: (v) => `Sculpture on a plinth: ${v.kind === 'stones' ? 'a cairn of three balanced stones' : v.kind === 'ring' ? 'a thick ring on a post' : v.kind === 'arches' ? 'a row of three rising arches' : 'a cluster of five spheres'}.`,
    vs: [['stacked stones, 14 in', 8, 8, 14, 0, { kind: 'stones' }], ['ring, 16 in', 10, 4, 16, 0, { kind: 'ring' }], ['arches, 12 in', 12, 5, 12, 0, { kind: 'arches' }], ['sphere cluster, 10 in', 9, 9, 10, 0, { kind: 'spheres' }]], build: sculpture }),
  fam({ cat: 'interior/accessories', title: 'Generic bookends', desc: (v) => `Pair of weighted bookends${v.books ? ' with ' + v.books + ' books of mixed heights between them' : ' as upright plates on foot plates'}.`,
    vs: [['pair, 6 in', 8, 5, 6, 0, { kind: 'plate' }], ['pair with 8 books, 10 in', 12, 7, 10, 0, { kind: 'plate', books: 8 }], ['pointed pair, 8 in', 9, 5, 8, 0, { kind: 'arc' }]], build: bookends }),
  fam({ cat: 'interior/accessories', title: 'Generic serving tray', desc: (v) => v.round ? 'Round tray with a raised rim and a base ring.' : `Rectangular tray with a raised rim${v.handles ? ' and two cut-out end handles' : ''}.`,
    vs: [['rectangular, 18 x 12 in', 18, 12, 2.5, 0, { handles: false, feet: true }], ['rectangular with handles, 24 x 16 in', 24, 16, 3.5, 0, { handles: true }], ['round, 14 in', 14, 14, 2.5, 0, { round: true }]], build: tray }),
  fam({ cat: 'interior/accessories', title: 'Generic decor mirror', desc: (v) => `${v.kind === 'round' ? 'Round wall mirror in a ring frame' : v.kind === 'sun' ? 'Sunburst wall mirror with tapered rays round a round plate' : v.kind === 'arch' ? 'Arch-top wall mirror in a frame' : 'Tall leaning mirror in a frame with a rear prop'}.`,
    vs: [['round, 30 in', 30, 2, 30, 48, { kind: 'round', frame: 1.2 }], ['sunburst, 36 in', 36, 2, 36, 48, { kind: 'sun', frame: 0.6 }], ['arch top, 30 x 60 in', 30, 2, 60, 24, { kind: 'arch', frame: 1.5 }], ['leaning floor mirror, 24 x 72 in', 24, 18, 72, 0, { kind: 'floor', frame: 1.5 }]], build: mirror }),
  fam({ cat: 'interior/accessories', title: 'Generic wall art', desc: (v) => `Wall art: ${v.kind === 'single' ? 'one frame with a mat and a print and a hanging wire' : v.kind === 'triptych' ? 'three matching frames with mats and prints' : 'six frames in a grid, each with a mat'}.`,
    vs: [['single frame, 24 x 36 in', 24, 2.5, 36, 48, { kind: 'single', mat: 2.5 }], ['triptych, 54 x 24 in', 54, 2.5, 24, 54, { kind: 'triptych' }], ['gallery grid, 54 x 36 in', 54, 2.5, 36, 48, { kind: 'grid' }]], build: wallArt }),
  fam({ cat: 'interior/accessories', title: 'Generic decor clock', desc: (v) => v.kind === 'wall' ? 'Round wall clock with a bezel, dial, twelve hour marks and hands.' : 'Mantel clock with an arched case on four feet, a dial and hands.',
    vs: [['wall, 18 in', 18, 2.5, 18, 66, { kind: 'wall' }], ['wall, 24 in', 24, 2.5, 24, 60, { kind: 'wall' }], ['mantel, 10 x 14 in', 10, 4, 14, 0, { kind: 'mantel' }]], build: clock }),
  // ---------------------------------------------------------------- finishes (25)
  fam({ cat: 'interior/finishes', title: 'Generic wainscot panelling', desc: (v) => `Wall panelling with a skirting, a top rail and cap and ${v.kind === 'beadboard' ? 'beaded boards' : v.kind === 'slat' ? 'vertical slats' : v.panels + ' ' + (v.kind === 'raised' ? 'raised' : 'flat recessed') + ' panels'}.`,
    vs: [['raised panels, 96 x 36 in', 96, 3, 36, 0, { kind: 'raised', panels: 4 }], ['shaker panels, 72 x 48 in', 72, 2.5, 48, 0, { kind: 'shaker', panels: 3 }], ['beadboard, 60 x 42 in', 60, 2.5, 42, 0, { kind: 'beadboard' }], ['slat panelling, 96 x 48 in', 96, 3, 48, 0, { kind: 'slat' }]], build: wainscot }),
  fam({ cat: 'interior/finishes', title: 'Generic feature wall', desc: (v) => `Feature wall section with ${v.kind === 'stone' ? 'courses of ledge stone of mixed length and depth' : v.kind === 'tile' ? 'pyramid tiles with alternating relief' : 'deep timber battens between rails'}.`,
    vs: [['ledge stone, 96 x 96 in', 96, 4, 96, 0, { kind: 'stone', rows: 12 }], ['pyramid tile, 72 x 72 in', 72, 3, 72, 0, { kind: 'tile', cols: 9, rows: 9 }], ['timber battens, 96 x 96 in', 96, 4, 96, 0, { kind: 'slat' }]], build: featureWall }),
  fam({ cat: 'interior/finishes', title: 'Generic fireplace surround', desc: (v) => `Fireplace surround with a hearth slab, two legs, a mantel shelf and a firebrick opening with ${v.kind === 'stove' ? 'a glazed stove and flue' : 'a log grate and fire irons'}${v.breast ? ' under a chimney breast to the ceiling' : ''}.`,
    vs: [['open fire, 54 in wide', 54, 14, 48, 0, { kind: 'grate', leg: 7, open: 28 }], ['open fire with chimney breast, 66 in wide', 66, 16, 96, 0, { kind: 'grate', leg: 9, open: 32, breast: true }], ['stove, 48 in wide', 48, 16, 54, 0, { kind: 'stove', leg: 6, open: 30 }], ['slim, 40 in wide', 40, 12, 42, 0, { kind: 'grate', leg: 5, open: 24 }]], build: fireplace }),
  fam({ cat: 'interior/finishes', title: 'Generic shelving niche', desc: (v) => `Recessed niche with a surround frame, ${v.shelves} shelves with strip lights${v.display ? ' and a vase on each shelf' : ''}.`,
    vs: [['2 shelves, 24 x 48 in', 24, 8, 48, 36, { shelves: 2 }], ['3 shelves with display, 36 x 60 in', 36, 8, 60, 30, { shelves: 3, display: true }], ['wide single shelf, 48 x 36 in', 48, 8, 36, 40, { shelves: 1, display: true }]], build: niche }),
  fam({ cat: 'interior/finishes', title: 'Generic room divider', desc: (v) => v.kind === 'fold' ? `Folding screen of ${v.panels} hinged frames with slatted infill and feet.` : v.kind === 'slat' ? 'Standing divider of vertical timber slats between a top and a base rail.' : 'Open cube-shelf divider with a plinth and a few objects.',
    vs: [['folding screen, 3 panels', 54, 12, 66, 0, { kind: 'fold', panels: 3, slats: 4 }], ['folding screen, 4 panels', 72, 14, 72, 0, { kind: 'fold', panels: 4, slats: 5 }], ['slatted divider, 60 in', 60, 6, 78, 0, { kind: 'slat' }], ['cube shelf divider, 48 x 72 in', 48, 14, 72, 0, { kind: 'cube', cols: 3, rows: 4 }]], build: divider }),
  fam({ cat: 'interior/finishes', title: 'Generic skirting and coving length', desc: (v) => `Four-foot ${v.kind} length with its profile extruded along the run, shown against a wall.`,
    vs: [['skirting, 7 in', 48, 1, 7, 0, { kind: 'skirt' }], ['coving, 4 in', 48, 4, 4, 96, { kind: 'cove' }], ['plaster cornice, 6 in', 48, 5, 6, 96, { kind: 'cornice' }]], build: skirting }),
  fam({ cat: 'interior/finishes', title: 'Generic floor inlay', desc: (v) => `Floor inlay: ${v.kind === 'compass' ? 'a banded disc with an eight-point star' : v.kind === 'border' ? 'a banded frame with corner squares' : v.kind === 'herringbone' ? 'a herringbone plank patch' : 'a checker of alternately raised tiles'}.`,
    vs: [['compass medallion, 36 in', 36, 36, 0.5, 0, { kind: 'compass' }], ['border band, 48 in square', 48, 48, 0.5, 0, { kind: 'border', band: 5 }], ['herringbone patch, 36 in square', 36, 36, 0.5, 0, { kind: 'herringbone' }], ['checker, 4 x 4 tiles, 48 in square', 48, 48, 0.5, 0, { kind: 'checker', n: 4 }]], build: inlay }),
];

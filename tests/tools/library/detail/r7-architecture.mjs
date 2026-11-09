/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, architecture: more facade and envelope elements, circulation, architectural details and massing models. Original geometry; generic building parts, not particular buildings. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = Math.PI;
const area2 = (p) => p.reduce((s, q, i) => { const r = p[(i + 1) % p.length]; return s + q[0] * r[1] - r[0] * q[1]; }, 0);
const ccw = (p) => (area2(p) < 0 ? p.slice().reverse() : p);
/** extrude a convex polygon of [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  if (area2(poly) < 0) poly = poly.slice().reverse();
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** extrude a convex polygon of [x, z] points between y0 and y1 */
function prismY(a, poly, y0, y1) {
  if (area2(poly) > 0) poly = poly.slice().reverse();
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** a convex [x,y] polygon between two heights */
const pr = (a, poly, z0, z1) => a.prism(ccw(poly), z0, z1);
/** loft two convex polygons of the same point count: A at height za, B at height zb */
function loft(a, A, za, B, zb) {
  if (area2(A) < 0) { A = A.slice().reverse(); B = B.slice().reverse(); }
  const n = A.length;
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; a.t.push([[...A[i], za], [...A[j], za], [...B[j], zb]], [[...A[i], za], [...B[j], zb], [...B[i], zb]]); }
  for (let i = 1; i < n - 1; i++) a.t.push([[...A[0], za], [...A[i + 1], za], [...A[i], za]], [[...B[0], zb], [...B[i], zb], [...B[i + 1], zb]]);
}
/** pyramid over a convex CCW [x,y] polygon, apex [x,y,z] */
function pyramid(a, poly, z, apex) { poly = ccw(poly); const n = poly.length; for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[...p, z], [...q, z], apex]); } for (let i = 1; i < n - 1; i++) a.t.push([[...poly[0], z], [...poly[i + 1], z], [...poly[i], z]]); }
/** a lathe-turned part: [dz, r] samples above z0 */
function lathe(a, cx, cy, z0, prof, seg = 16) { a.tube(prof.map(([dz]) => [cx, cy, z0 + dz]), prof.map(([, r]) => r), seg); }
/** a straight flight along y (ori 'y') or x (ori 'x'): c = cross-axis centre, w width, ua to ub the run (ub < ua descends), za the floor level below the first riser */
function flightG(a, ori, c, w, ua, ub, za, n, r, o = {}) {
  const dir = ub > ua ? 1 : -1, g = m.abs(ub - ua) / n, sl = o.stringer ?? 220, th = o.tread ?? 45;
  const B = (u0, s0, z0, u1, s1, z1) => (ori === 'y' ? a.box(s0, m.min(u0, u1), z0, s1, m.max(u0, u1), z1) : a.box(m.min(u0, u1), s0, z0, m.max(u0, u1), s1, z1));
  const PR = (poly, s0, s1) => (ori === 'y' ? prismX(a, poly, s0, s1) : prismY(a, poly, s0, s1));
  const TB = (p, q, rr, sg = 8) => a.tube([p, q].map(([u, s, z]) => (ori === 'y' ? [s, u, z] : [u, s, z])), [rr, rr], sg);
  const uo = (f) => ua + dir * g * f;
  if (o.stringers !== false) for (const sx of [-1, 1]) {
    const s0 = sx > 0 ? c + w / 2 : c - w / 2 - 40, s1 = s0 + 40;
    PR([[uo(0), m.max(a.Z0, za + r - sl)], [uo(0), za + r - 25], [uo(n), za + r * n - 25], [uo(n), za + r * n - sl]], s0, s1);
  }
  for (let i = 0; i < n; i++) {
    const u0 = uo(i) - dir * (i ? 25 : 0), u1 = uo(i + 1), z = za + r * (i + 1);
    B(u0, c - w / 2, z - th, u1, c + w / 2, z);
    if (o.risers !== false) B(u0, c - w / 2, z - r, u0 + dir * 12, c + w / 2, z - th);
  }
  if (o.rail !== false) for (const sx of [-1, 1]) {
    const s = c + sx * (w / 2 + 20), hr = o.hr ?? 900;
    TB([uo(0.5), s, za + r + hr], [uo(n - 0.5), s, za + r * n + hr], 22);
    const nb = m.max(2, m.round(n / 2));
    for (let i = 0; i <= nb; i++) { const f = (i / nb) * (n - 1) + 0.5; TB([uo(f), s, za + r * (f + 0.5)], [uo(f), s, za + r * (f + 0.5) + hr - 25], 9, 6); }
  }
  const s0 = c - w / 2 - 40, s1 = c + w / 2 + 40;
  if (ori === 'y') { a.rect(s0, m.min(uo(0), uo(n)), s1, m.max(uo(0), uo(n)), 'EQUIP-DETAIL'); for (let i = 1; i < n; i++) a.line(c - w / 2, uo(i), c + w / 2, uo(i), 'EQUIP-DETAIL'); a.line(c, uo(0.3), c, uo(n - 0.3), 'EQUIP-DETAIL'); }
  else { a.rect(m.min(uo(0), uo(n)), s0, m.max(uo(0), uo(n)), s1, 'EQUIP-DETAIL'); for (let i = 1; i < n; i++) a.line(uo(i), c - w / 2, uo(i), c + w / 2, 'EQUIP-DETAIL'); a.line(uo(0.3), c, uo(n - 0.3), c, 'EQUIP-DETAIL'); }
}
/** an elliptical or circular plan polygon of k points */
const ring = (cx, cy, rx, ry, k = 24, a0 = 0) => Array.from({ length: k }, (_, i) => [cx + rx * m.cos(a0 + (2 * PI * i) / k), cy + ry * m.sin(a0 + (2 * PI * i) / k)]);

// ================================================================================== ENVELOPE
function shopfront(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, n = v.bays, fa = v.fascia * IN, rs = v.riser * IN, tr = v.transom * IN, zt = Z1 - fa;
  const y0 = YF + D * 0.3, y1 = YF + D * 0.7, gy = (y0 + y1) / 2, pw = 140, bw = (W - 2 * pw) / n;
  a.outline();
  a.box(X0, YF, Z1 - 80, X1, YF + D * 0.45, Z1); a.box(X0 + 20, YF + D * 0.12, zt, X1 - 20, YB, Z1 - 80);
  a.box(X0 + 160, YF + D * 0.06, zt + 70, X1 - 160, YF + D * 0.12, Z1 - 150);
  for (const x of [X0, X1 - pw]) { a.box(x, YF + D * 0.08, Z0, x + pw, YB, zt); a.box(x, YF, Z0, x + pw, YF + D * 0.45, Z0 + 160); a.box(x + 15, YF + D * 0.04, zt - 130, x + pw - 15, YF + D * 0.4, zt); }
  for (let i = 0; i < n; i++) {
    const bx0 = X0 + pw + i * bw, bx1 = bx0 + bw;
    if (i > 0) a.box(bx0 - 30, y0, Z0 + (i === v.door || i - 1 === v.door ? 0 : rs), bx0 + 30, y1, zt);
    a.box(bx0, y0, zt - 40, bx1, y1, zt); a.box(bx0, y0, zt - tr, bx1, y1, zt - tr + 55); a.box(bx0 + 45, gy - 5, zt - tr + 55, bx1 - 45, gy + 5, zt - 40);
    if (i === v.door) {
      const dx0 = bx0 + 80, dx1 = bx1 - 80, dw = dx1 - dx0, zl = Z0 + 30, zh = zt - tr - 10;
      a.box(bx0, y0, Z0, bx0 + 80, y1, zt - tr); a.box(bx1 - 80, y0, Z0, bx1, y1, zt - tr); a.box(bx0, y0 - 30, Z0, bx1, y1, Z0 + 20);
      a.frame(dx0, zl, dx1, zh, y0 + 40, y0 + 130, 95); a.box(dx0 + 95, y0 + 80, zl + 360, dx1 - 95, y0 + 90, zh - 95); a.box(dx0 + 95, y0 + 40, zl + 95, dx1 - 95, y0 + 130, zl + 360);
      a.ycyl(y0 - 70, y0 + 40, dx1 - 130, zl + 850, 12, 8); a.ycyl(y0 - 70, y0 + 40, dx1 - 130, zl + 1350, 12, 8); a.cyl(dx1 - 130, y0 - 70, zl + 800, zl + 1400, 14, 8);
      a.line(dx0, y0, dx0, y0 - dw, 'EQUIP-SWING'); a.arc(dx0, y0, dw, 270, 360);
    } else {
      a.box(bx0, y0, Z0, bx1, y1, Z0 + rs); a.box(bx0 + 80, y0 - 14, Z0 + 80, bx1 - 80, y0, Z0 + rs - 80); a.box(bx0, y0 - 30, Z0 + rs, bx1, y1, Z0 + rs + 35);
      a.box(bx0 + 45, gy - 5, Z0 + rs + 35, bx1 - 45, gy + 5, zt - tr);
    }
    a.rect(bx0, y0, bx1, y1, 'EQUIP-DETAIL');
  }
  a.line(X0, gy, X1, gy, 'EQUIP-DETAIL');
  a.log('Added the fascia with a cornice and sign panel, end pilasters on plinths, ' + n + ' bays of glass with a transom' + (v.door >= 0 ? ', a glazed entrance door with a pull bar and swing' : '') + ' and stall risers (plan and 3D).');
}
function rollerShutter(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, bx = v.box * IN, gd = 100, zTop = Z1 - bx, gy = YF + D * 0.5;
  a.outline();
  prismX(a, [[YB, Z1], [YB, zTop], [YF + D * 0.35, zTop], [YF, zTop + bx * 0.45], [YF, Z1 - bx * 0.2], [YF + D * 0.1, Z1]], X0, X1);
  a.box(X0 + 40, YF + D * 0.1, zTop - 40, X1 - 40, YB - 20, zTop);
  for (const x of [X0, X1 - gd]) { a.box(x, YF + D * 0.2, Z0, x + gd, YF + D * 0.32, zTop); a.box(x, YB - D * 0.32, Z0, x + gd, YB - D * 0.2, zTop); a.box(x + (x === X0 ? 0 : gd - 25), YF + D * 0.32, Z0, x + (x === X0 ? 25 : gd), YB - D * 0.32, zTop); }
  const zBot = zTop - (zTop - Z0 - 70) * v.drop;
  if (v.slat === 'grille') {
    const nr = m.max(8, m.round((W - 2 * gd) / 85));
    for (let i = 0; i <= nr; i++) { const x = X0 + gd + 30 + ((W - 2 * gd - 60) * i) / nr; a.tube([[x, gy, zBot], [x, gy, zTop]], [6, 6], 5); }
    const rr = m.max(2, m.round((zTop - zBot) / 300)); for (let i = 0; i <= rr; i++) { const z = zBot + ((zTop - zBot) * i) / rr; a.box(X0 + gd, gy - 9, z - 8, X1 - gd, gy + 9, z + 8); }
  } else {
    const ns = m.floor((zTop - zBot) / 76); for (let i = 0; i < ns; i++) a.box(X0 + gd, gy - 9, zTop - 76 * (i + 1) + 6, X1 - gd, gy + 9, zTop - 76 * i);
  }
  a.box(X0 + gd, gy - 28, zBot - 55, X1 - gd, gy + 28, zBot); a.box(X0 + W * 0.5 - 120, gy - 36, zBot - 40, X0 + W * 0.5 + 120, gy - 28, zBot - 5);
  a.line(X0 + gd, gy, X1 - gd, gy, 'EQUIP-DETAIL'); a.rect(X0, YF + D * 0.2, X0 + gd, YB - D * 0.2, 'EQUIP-DETAIL'); a.rect(X1 - gd, YF + D * 0.2, X1, YB - D * 0.2, 'EQUIP-DETAIL');
  a.log('Added the coil head box, two C-section guide rails, the ' + (v.slat === 'grille' ? 'open grille of rods and rails' : 'interlocking slats') + ' lowered to ' + m.round(v.drop * 100) + ' percent, the bottom bar and lock (plan and 3D).');
}
function dormer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, wh = v.wall * IN, zw = Z0 + wh, ck = 100, zs = Z0 + wh * 0.85;
  a.outline();
  for (const [x0, x1] of [[X0, X0 + ck], [X1 - ck, X1]]) prismX(a, [[YF, Z0], [YF, zw], [YB, zw], [YB, zs]], x0, x1);
  const ow = W * 0.5, ox0 = cx - ow / 2, ox1 = cx + ow / 2, oz0 = Z0 + wh * 0.3, oz1 = zw - wh * 0.12;
  a.box(X0 + ck, YF, Z0, ox0, YF + 110, zw); a.box(ox1, YF, Z0, X1 - ck, YF + 110, zw); a.box(ox0, YF, Z0, ox1, YF + 110, oz0); a.box(ox0, YF, oz1, ox1, YF + 110, zw);
  a.box(ox0 - 40, YF, oz0 - 35, ox1 + 40, YF + 150, oz0); a.frame(ox0, oz0, ox1, oz1, YF + 30, YF + 95, 55);
  a.box(ox0 + 55, YF + 55, oz0 + 55, ox1 - 55, YF + 65, oz1 - 55); a.box(cx - 20, YF + 40, oz0 + 55, cx + 20, YF + 80, oz1 - 55); a.box(ox0 + 55, YF + 40, (oz0 + oz1) / 2 - 20, ox1 - 55, YF + 80, (oz0 + oz1) / 2 + 20);
  const A = [X0, YF, zw], B = [X1, YF, zw], C = [X1, YB, zw], Dd = [X0, YB, zw];
  if (v.roof === 'gable') { prismY(a, [[X0, zw], [X1, zw], [cx, Z1]], YF, YB); a.box(X0, YF, zw - 60, X1, YF + 90, zw); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL'); }
  else if (v.roof === 'hip') {
    const P = [cx, YF + D * 0.3, Z1], Q = [cx, YB, Z1], t = (p, q, r) => a.t.push([p, q, r]);
    t(A, B, P); t(B, C, Q); t(B, Q, P); t(Dd, A, P); t(Dd, P, Q); t(C, Dd, Q); t(A, Dd, C); t(A, C, B); a.line(cx, YF + D * 0.3, cx, YB, 'EQUIP-DETAIL');
  } else if (v.roof === 'shed') { prismX(a, [[YF, zw], [YB, zw], [YB, Z1], [YF, zw + (Z1 - zw) * 0.25]], X0, X1); a.line(X0, YF + D * 0.5, X1, YF + D * 0.5, 'EQUIP-DETAIL'); }
  else if (v.roof === 'arched') { const pts = [[X0, zw]]; for (let k = 0; k <= 12; k++) { const t = (PI * k) / 12; pts.push([cx - (W / 2) * m.cos(t), zw + (Z1 - zw) * m.sin(t)]); } pts.push([X1, zw]); prismY(a, pts, YF, YB); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL'); }
  else { a.box(X0, YF, zw, X1, YB, Z1); a.box(X0, YF, Z1 - 70, X1, YF + 70, Z1); }
  a.rect(X0, YF, X0 + ck, YB, 'EQUIP-DETAIL'); a.rect(X1 - ck, YF, X1, YB, 'EQUIP-DETAIL'); a.rect(ox0, YF, ox1, YF + 110, 'EQUIP-DETAIL');
  a.log('Added the cheek walls on the roof slope, the front wall with a sill, window frame, glass and glazing bars under a ' + v.roof + ' roof (plan and 3D).');
}
function bayWindow(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, ow = W * 0.86, th = 90, zs = Z0 + v.sill * IN, zh = Z1 - v.head * IN;
  let P;
  if (v.shape === 'box') P = [[cx - ow / 2, YB], [cx - ow / 2, YF], [cx + ow / 2, YF], [cx + ow / 2, YB]];
  else if (v.shape === 'canted') { const w1 = ow * 0.2; P = [[cx - ow / 2, YB], [cx - ow / 2 + w1, YF], [cx + ow / 2 - w1, YF], [cx + ow / 2, YB]]; }
  else { P = []; for (let k = 0; k <= 5; k++) { const t = (PI * k) / 5; P.push([cx - (ow / 2) * m.cos(t), YB + (YF - YB) * m.sin(t)]); } }
  const cen = [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  for (const [x0, x1] of [[X0, cx - ow / 2], [cx + ow / 2, X1]]) if (x1 - x0 > 5) a.box(x0, YB - 150, Z0, x1, YB, Z1);
  a.outline('EQUIP-DETAIL'); a.poly(P, 'EQUIP');
  if (v.oriel) loft(a, P.map(([x, y]) => [cx + (x - cx) * 0.3, YB + (y - YB) * 0.3]), Z0, P, zs - 60); else pr(a, P, Z0, zs - 60);
  pr(a, P, zs - 60, zs);
  for (let i = 0; i < P.length - 1; i++) {
    const p = P[i], q = P[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], L = m.hypot(dx, dy);
    let nx = -dy / L, ny = dx / L; if ((cen[0] - p[0]) * nx + (cen[1] - p[1]) * ny < 0) { nx = -nx; ny = -ny; }
    const Q = (o0, o1, z0, z1) => pr(a, [[p[0] + nx * o0, p[1] + ny * o0], [q[0] + nx * o0, q[1] + ny * o0], [q[0] + nx * o1, q[1] + ny * o1], [p[0] + nx * o1, p[1] + ny * o1]], z0, z1);
    Q(0, th, zs, zs + 55); Q(0, th, zh - 55, zh); Q(th / 2 - 5, th / 2 + 5, zs + 55, zh - 55);
    if (L > 800) { const k = m.round(L / 700), mx = (j) => [p[0] + dx * (j / k) + nx * th / 2, p[1] + dy * (j / k) + ny * th / 2]; for (let j = 1; j < k; j++) a.box(mx(j)[0] - 20, mx(j)[1] - 20, zs + 55, mx(j)[0] + 20, mx(j)[1] + 20, zh - 55); }
  }
  for (const p of P) { a.box(p[0] - 40, p[1] - 40, zs, p[0] + 40, p[1] + 40, zh); a.line(p[0], p[1], cen[0], cen[1], 'EQUIP-DETAIL'); }
  pr(a, P, zh, zh + 120);
  if (v.roof === 'hip') pyramid(a, P, zh + 120, [cen[0], cen[1], Z1]); else pr(a, P, zh + 120, Z1);
  a.log('Added the ' + (v.oriel ? 'tapered corbelled underside, ' : 'apron, ') + 'seat, ' + (P.length - 1) + ' glazed facets with mullions, head and a ' + (v.roof === 'hip' ? 'hipped' : 'flat') + ' roof, with wall returns either side (plan and 3D).');
}
function awning(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, vh = 200, zf = Z0, zT = Z1, bx = m.round(W / 400);
  a.outline();
  if (v.type === 'hood') {
    const k = 9, pt = (s) => [YB + (YF - YB) * s, zT - (zT - zf - vh) * m.pow(s, 1.8)];
    for (let i = 0; i < k; i++) { const p = pt(i / k), q = pt((i + 1) / k); prismX(a, [[p[0], p[1]], [q[0], q[1]], [q[0], q[1] - 14], [p[0], p[1] - 14]], X0, X1); }
    for (const x of [X0, X1 - 14]) { const pts = [[YB, zT]]; for (let i = 0; i <= k; i++) pts.push(pt(i / k)); pts.push([YB, zf + vh]); /* side ribs */ for (let i = 0; i < k; i++) { const p = pt(i / k), q = pt((i + 1) / k); prismX(a, [[p[0], p[1]], [q[0], q[1]], [q[0], q[1] - 20], [p[0], p[1] - 20]], x, x + 14); } }
  } else {
    prismX(a, [[YB, zT], [YB, zT - 14], [YF, zf + vh - 14], [YF, zf + vh]], X0, X1);
    if (v.type === 'dutch') for (const x of [X0, X1 - 14]) prismX(a, [[YB, zT], [YF, zf + vh], [YF, zf], [YB, zf]], x, x + 14);
  }
  a.box(X0, YF, zf + 20, X1, YF + 12, zf + vh);
  if (v.type !== 'dutch') for (let i = 0; i < bx; i++) { const x0 = X0 + (W * i) / bx, x1 = X0 + (W * (i + 1)) / bx; prismY(a, [[x0, zf + vh], [x1, zf + vh], [(x0 + x1) / 2, zf]], YF, YF + 12); }
  a.box(X0, YB - 30, zT - 60, X1, YB, zT + 0); a.xcyl(X0, X1, YB - 50, zT - 30, 28, 10);
  if (v.type === 'lean' || v.type === 'dutch') { for (const x of [X0 + 30, X1 - 30, cx]) a.tube([[x, YB - 50, zT - 30], [x, YF + 30, zf + vh - 30]], [10, 10], 6); a.xcyl(X0, X1, YF + 30, zf + vh - 30, 14, 8); }
  if (v.type === 'retract') for (const x of [X0 + W * 0.15, X1 - W * 0.15]) { a.tube([[x, YB - 50, zT - 40], [x, YB - D * 0.55, zT - (zT - zf - vh) * 0.45], [x, YF + 30, zf + vh - 40]], [14, 12, 12], 8); a.box(x - 25, YB - 120, zT - 160, x + 25, YB, zT - 60); }
  a.line(X0, YF + 6, X1, YF + 6, 'EQUIP-DETAIL');
  for (let i = 1; i < bx; i++) a.line(X0 + (W * i) / bx, YF, X0 + (W * i) / bx, YB, 'EQUIP-DETAIL');
  a.log('Added the wall rail, ' + (v.type === 'hood' ? 'curved fabric hood in strips with side ribs' : v.type === 'retract' ? 'folding arms, spring boxes and sloped fabric' : v.type === 'dutch' ? 'sloped fabric with closed end panels' : 'sloped fabric on a frame') + ' and a scalloped valance (plan and 3D).');
}
function windowShutters(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, lw = v.leaf * IN, th = 45, y0 = YB - 120, y1 = YB - 75, ow = v.closed ? W * 0.76 : W - 2 * lw, wx0 = cx - ow / 2, wx1 = cx + ow / 2, sz0 = Z0 + 250, sz1 = Z1 - 150;
  a.outline();
  a.box(X0, YB - 75, Z0, wx0, YB, Z1); a.box(wx1, YB - 75, Z0, X1, YB, Z1); a.box(wx0, YB - 75, Z0, wx1, YB, sz0); a.box(wx0, YB - 75, sz1, wx1, YB, Z1);
  a.box(wx0 - 20, y1, sz0 - 40, wx1 + 20, YB - 40, sz0); a.frame(wx0, sz0, wx1, sz1, YB - 70, YB - 30, 50); a.box(wx0 + 50, YB - 55, sz0 + 50, wx1 - 50, YB - 45, sz1 - 50);
  const leaves = v.closed ? [[cx - lw, cx], [cx, cx + lw]] : [[X0, X0 + lw], [X1 - lw, X1]];
  leaves.forEach(([x0, x1], li) => {
    const st = 70, z0 = Z0 + 120, z1 = Z1 - 120;
    a.frame(x0, z0, x1, z1, y0, y1, st);
    if (v.kind === 'louvred') { const n = m.floor((z1 - z0 - 2 * st) / 52); for (let i = 0; i < n; i++) { const z = z0 + st + 20 + 52 * i; prismX(a, [[y0 + 8, z], [y1 - 8, z + 30], [y1 - 8, z + 38], [y0 + 8, z + 8]], x0 + st, x1 - st); } a.box((x0 + x1) / 2 - 6, y0 + 14, z0 + st, (x0 + x1) / 2 + 6, y0 + 22, z1 - st); }
    else if (v.kind === 'panelled') { const k = 3, ph = (z1 - z0 - 2 * st - (k - 1) * 50) / k; for (let i = 0; i < k; i++) { const pz = z0 + st + i * (ph + 50); a.box(x0 + st, y0 + 10, pz, x1 - st, y1 - 10, pz + ph); a.box(x0 + st + 25, y0 - 6, pz + 25, x1 - st - 25, y0 + 10, pz + ph - 25); if (i) a.box(x0 + st, y0, pz - 50, x1 - st, y1, pz); } }
    else { const nb = 5, bw = (x1 - x0) / nb; for (let i = 0; i < nb; i++) a.box(x0 + i * bw + 3, y0 + 8, z0, x0 + (i + 1) * bw - 3, y1, z1); for (const z of [z0 + 250, z1 - 250 - 100]) a.box(x0, y0 - 14, z, x1, y0 + 8, z + 100); prismY(a, [[x0, z0 + 250], [x1, z1 - 250 - 100], [x1, z1 - 250], [x0, z0 + 350]], y0 - 18, y0 - 12); }
    const hx = li === 0 ? (v.closed ? x0 : x0) : x1;
    for (const z of [z0 + 300, z1 - 300]) { a.box(hx - 18, y0 - 8, z - 18, hx + 18, y1, z + 18); a.box(li === 0 ? x0 : x1 - 150, y0 - 8, z - 12, li === 0 ? x0 + 150 : x1, y0 + 4, z + 12); }
    a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL');
  });
  a.rect(wx0, YB - 70, wx1, YB - 30, 'EQUIP-DETAIL');
  a.log('Added the wall with a window, sill and glass and a pair of ' + v.kind + ' leaves ' + (v.closed ? 'closed over the opening' : 'folded back against the wall') + ' on strap hinges (plan and 3D).');
}
function chimney(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, potH = v.pot * IN, capH = 330, zc = Z1 - potH - capH, ins = 70;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 60);
  a.box(X0 + ins, YF + ins, Z0 + 60, X1 - ins, YB - ins, zc);
  if (v.type === 'octa') {
    const nx = v.pots;
    for (let i = 0; i < nx; i++) { const x = X0 + (W * (i + 0.5)) / nx, R = m.min(W / nx, D) * 0.42; a.cone(x, cy, Z0 + 60, zc + 700 - 700, R, R, 8); a.cone(x, cy, zc - 600, zc + 340, R, R, 8); a.cone(x, cy, zc + 340, zc + 420, R * 1.35, R * 1.35, 8); a.cone(x, cy, zc + 420, Z1 - 120, R * 0.8, R * 0.8, 8); a.cone(x, cy, Z1 - 120, Z1, R * 1.1, R * 1.1, 8); a.circ(x, cy, R, 'EQUIP-DETAIL'); }
    a.box(X0 + ins, YF + ins, zc - 700, X1 - ins, YB - ins, zc - 600);
  } else {
    for (let k = 0; k < 3; k++) { const o = ins - 25 * (k + 1); a.box(X0 + m.max(0, o), YF + m.max(0, o), zc + k * 90, X1 - m.max(0, o), YB - m.max(0, o), zc + (k + 1) * 90); }
    a.box(X0, YF, zc + 270, X1, YB, zc + 340); prismY(a, [[X0 + 20, zc + 340], [X1 - 20, zc + 340], [X1 - 150, zc + 420], [X0 + 150, zc + 420]], YF + 20, YB - 20);
    const nx = v.pots, ny = v.rows ?? 1;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const x = X0 + (W * (i + 0.5)) / nx, y = YF + (D * (j + 0.5)) / ny, R = m.min(W / nx, D / ny) * 0.3;
      lathe(a, x, y, zc + 420, [[0, R * 1.05], [potH * 0.55, R * 0.92], [potH * 0.82, R * 0.9], [potH * 0.85, R * 1.08], [potH, R * 1.08]], 14);
      if (v.type === 'cowl') a.cone(x, y, zc + 420 + potH - 20, zc + 420 + potH, R * 1.3, R * 0.3, 14); a.circ(x, y, R, 'EQUIP-DETAIL');
    }
  }
  a.rect(X0 + ins, YF + ins, X1 - ins, YB - ins, 'EQUIP-DETAIL'); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.log('Added the lead flashing base, brick shaft, three corbelled courses, a capping slab with flaunching and ' + (v.type === 'octa' ? v.pots + ' octagonal shafts with moulded caps' : v.pots * (v.rows ?? 1) + ' turned flue pots' + (v.type === 'cowl' ? ' with cowls' : '')) + ' (plan and 3D).');
}
function downpipe(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, r = (v.dia * IN) / 2, py = YB - r - 35, hh = v.hopper ? 360 : 0, neck = v.hopper ? 220 : 0, zt = Z1 - hh - neck;
  a.outline();
  if (v.hopper) {
    const bw = W * 0.5 - 10, hd = D * 0.5 - 10;
    loft(a, [[cx - bw, YB - 2 * hd], [cx + bw, YB - 2 * hd], [cx + bw, YB], [cx - bw, YB]], Z1 - hh, [[cx - r * 1.2, py - r * 1.2], [cx + r * 1.2, py - r * 1.2], [cx + r * 1.2, py + r * 1.2], [cx - r * 1.2, py + r * 1.2]], zt);
    a.box(cx - bw - 15, YB - 2 * hd - 15, Z1 - hh, cx + bw + 15, YB, Z1 - hh + 35); for (const sx of [-1, 1]) a.box(cx + sx * (bw + 15) - 10, YB - 2 * hd - 15, Z1 - hh, cx + sx * (bw + 15) + 10, YB, Z1 - hh + 90);
    a.box(cx - 30, YB - 2 * hd - 18, Z1 - hh + 40, cx + 30, YB - 2 * hd - 6, Z1 - 60); a.rect(cx - bw, YB - 2 * hd, cx + bw, YB, 'EQUIP-DETAIL');
  }
  const shoe = 330;
  if (v.square) { a.box(cx - r, py - r, Z0 + shoe, cx + r, py + r, zt); a.box(cx - r - 10, py - r - 10, zt - 60, cx + r + 10, py + r + 10, zt); a.box(cx - r, py - r - 5, Z0 + 60, cx + r, py + r, Z0 + shoe); a.box(cx - r, py - r - 260, Z0, cx + r, py - r, Z0 + 140); }
  else { a.cyl(cx, py, Z0 + shoe, zt, r, 14); a.tube([[cx, py, Z0 + shoe], [cx, py, Z0 + shoe - 40], [cx, py - r * 0.5, Z0 + 190], [cx, py - r * 1.9, Z0 + 110], [cx, py - r * 4, Z0 + 80]], [r, r, r, r, r], 14); }
  const nc = m.max(1, m.floor((zt - Z0 - 300) / 1100));
  for (let i = 0; i < nc; i++) { const z = Z0 + 500 + ((zt - Z0 - 700) * i) / m.max(1, nc - 1 || 1); if (v.square) a.box(cx - r - 14, py - r - 14, z, cx + r + 14, py + r + 14, z + 30); else a.cyl(cx, py, z, z + 30, r + 14, 14); a.box(cx - 25, py + r, z, cx + 25, YB, z + 30); }
  a.circ(cx, py, r, 'EQUIP-DETAIL'); a.rect(cx - 25, py, cx + 25, YB, 'EQUIP-DETAIL');
  a.log('Added the ' + (v.square ? 'square' : 'round') + ' pipe, ' + nc + ' wall clips on stand-off brackets, a ' + (v.hopper ? 'hopper head with a tapered neck and ears, ' : '') + 'and a bend to a shoe at the foot (plan and 3D).');
}
function cladding(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, yo = YB - 140, zb = Z0 + 80;
  a.outline('EQUIP-DETAIL');
  a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0, YB - 70, Z0 + 60, X1, YB, Z1);
  const nr = m.round(W / 600);
  for (let i = 0; i <= nr; i++) { const x = X0 + 25 + ((W - 50) * i) / nr; a.box(x - 22, YB - 120, zb, x + 22, YB - 70, Z1); }
  a.box(X0 + 60, YB - 118, zb + 200, X1 - 60, YB - 72, Z1 - 400);
  if (v.type === 'seam') {
    a.box(X0, yo - 2, zb, X1, yo + 14, Z1); const np = m.round(W / 400);
    for (let i = 0; i <= np; i++) { const x = X0 + 25 + ((W - 50) * i) / np; a.box(x - 20, yo - 30, zb, x + 20, yo - 2, Z1); a.box(x - 12, yo - 55, zb, x + 12, yo - 30, Z1); }
  } else if (v.type === 'shiplap') {
    const bh = 170, n = m.floor((Z1 - zb) / (bh - 20));
    for (let i = 0; i < n; i++) { const z = zb + i * (bh - 20); prismX(a, [[YB - 125, z], [YB - 190, z + 12], [YB - 190, z + bh], [YB - 125, z + bh - 12]], X0, X1); }
  } else if (v.type === 'cassette') {
    const tw = v.tile * IN, th = 600, gx = m.round(W / tw), gz = m.floor((Z1 - zb) / (th + 14));
    for (let i = 0; i < gx; i++) for (let j = 0; j < gz; j++) { const x0 = X0 + (W * i) / gx + 7, x1 = X0 + (W * (i + 1)) / gx - 7, z0 = zb + j * (th + 14); a.box(x0, YB - 175, z0, x1, YB - 130, z0 + th); a.box(x0, YB - 175, z0, x1, YB - 160, z0 + th); for (const [fx, fz] of [[x0 + 40, z0 + 40], [x1 - 40, z0 + 40], [x0 + 40, z0 + th - 40], [x1 - 40, z0 + th - 40]]) a.ycyl(YB - 182, YB - 175, fx, fz, 9, 6); }
  } else {
    a.box(X0, yo, zb, X1, yo + 8, Z1); const sw = 70, gp = 24, n = m.floor(W / (sw + gp));
    for (let i = 0; i < n; i++) { const x = X0 + (W - n * (sw + gp) + gp) / 2 + i * (sw + gp); a.box(x, YB - 215, zb, x + sw, YB - 130, Z1); }
  }
  a.line(X0, YB - 120, X1, YB - 120, 'EQUIP-DETAIL'); a.rect(X0, YB - 70, X1, YB, 'EQUIP-DETAIL');
  a.log('Added the ground starter on a base, the sheathing, vertical rails, an insulation layer and the ' + (v.type === 'seam' ? 'standing-seam sheet with raised ribs' : v.type === 'shiplap' ? 'lapped boards' : v.type === 'cassette' ? 'cassette tiles with open joints and rivets' : 'timber slats on a dark backing') + ' (plan and 3D).');
}
function balcony(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, un = v.under * IN, zs = Z0 + un, st = 200, gh = 1050;
  a.outline();
  a.box(X0, YB - 150, Z0, X1, YB, Z1); a.box(X0, YF, zs, X1, YB - 150, zs + st); a.box(X0 + 60, YF + 30, zs + st, X1 - 60, YB - 150, zs + st + 25);
  a.box(cx - W * 0.2, YB - 150 - 15, zs + st + 25, cx + W * 0.2, YB - 150, zs + st + 25 + 2000 > Z1 ? Z1 - 80 : zs + st + 2025);
  a.box(X0 + 60, YB - 150 - 120, zs + st, X1 - 60, YB - 150, zs + st + 45);
  a.box(X0, YF, zs - 30, X1, YF + 40, zs); a.box(cx - 60, YF - 0.0, zs - 60, cx + 60, YF + 50, zs);
  if (v.support === 'brackets') for (const x of [X0 + 220, X1 - 220]) prismX(a, [[YB - 150, zs], [YF + 150, zs], [YB - 150, Z0]], x - 40, x + 40);
  else if (v.support === 'posts') for (const x of [X0 + 120, X1 - 120]) { a.cyl(x, YF + 120, Z0, zs, 70, 12); a.box(x - 120, YF + 20, zs - 40, x + 120, YF + 220, zs); }
  const gz0 = zs + st + 25, gz1 = gz0 + gh, lines = [[X0 + 60, YF + 70, X1 - 60, YF + 70], [X0 + 60, YF + 70, X0 + 60, YB - 150], [X1 - 60, YF + 70, X1 - 60, YB - 150]];
  for (const [x0, y0, x1, y1] of lines) {
    const L = m.hypot(x1 - x0, y1 - y0), k = m.max(1, m.round(L / 1100));
    for (let i = 0; i <= k; i++) { const x = x0 + ((x1 - x0) * i) / k, y = y0 + ((y1 - y0) * i) / k; if (v.guard === 'glass') a.box(x - 25, y - 25, gz0, x + 25, y + 25, gz1 - 40); }
    if (v.guard === 'glass') { for (let i = 0; i < k; i++) { const xa = x0 + ((x1 - x0) * i) / k, ya = y0 + ((y1 - y0) * i) / k, xb = x0 + ((x1 - x0) * (i + 1)) / k, yb = y0 + ((y1 - y0) * (i + 1)) / k; a.box(m.min(xa, xb) + (x1 === x0 ? -8 : 40), m.min(ya, yb) + (y1 === y0 ? -8 : 40), gz0 + 70, m.max(xa, xb) - (x1 === x0 ? -8 : 40), m.max(ya, yb) + (y1 === y0 ? 8 : -40), gz1 - 60); } }
    else if (v.guard === 'rail') { const nb = m.floor(L / 110); for (let i = 1; i < nb; i++) a.cyl(x0 + ((x1 - x0) * i) / nb, y0 + ((y1 - y0) * i) / nb, gz0, gz1 - 40, 9, 6); a.tube([[x0, y0, gz0 + 100], [x1, y1, gz0 + 100]], [11, 11], 6); for (const [px, py] of [[x0, y0], [x1, y1]]) a.cyl(px, py, gz0, gz1 - 40, 20, 8); }
    else { a.box(m.min(x0, x1) - 70, m.min(y0, y1) - 70, gz0, m.max(x0, x1) + 70, m.max(y0, y1) + 70, gz1 - 80); }
    a.tube([[x0, y0, gz1 - 20], [x1, y1, gz1 - 20]], [24, 24], 8);
  }
  a.rect(X0, YF, X1, YB - 150, 'EQUIP-DETAIL'); a.rect(X0 + 60, YF + 70, X1 - 60, YB - 150, 'EQUIP-DETAIL'); a.rect(cx - W * 0.2, YB - 165, cx + W * 0.2, YB - 150, 'EQUIP-DETAIL');
  a.log('Added the wall, a ' + (v.support === 'cantilever' ? 'cantilevered slab with a drip edge' : v.support === 'brackets' ? 'slab on two corbel brackets' : 'slab on two round posts') + ', a door threshold and a ' + (v.guard === 'glass' ? 'glass guard on posts' : v.guard === 'rail' ? 'balustrade of round bars' : 'solid parapet guard') + ' with a handrail (plan and 3D).');
}
const ENV = [
  fam({ cat: 'architecture/envelope', title: 'Generic shopfront glazing bay', desc: (v) => `Shopfront of ${v.bays} glazed ${v.bays > 1 ? 'bays' : 'bay'} with a transom, ${v.door >= 0 ? 'a glazed entrance door with pull bar, ' : ''}stall risers, end pilasters on plinths and a fascia with cornice and sign panel.`,
    vs: [['one bay with door, 54 in', 54, 8, 102, 0, { bays: 1, door: 0, fascia: 14, riser: 0, transom: 12 }], ['two bays, door left, 108 in', 108, 8, 110, 0, { bays: 2, door: 0, fascia: 16, riser: 20, transom: 14 }], ['three bays, centre door, 168 in', 168, 8, 120, 0, { bays: 3, door: 1, fascia: 20, riser: 24, transom: 16 }], ['four display bays, 192 in', 192, 8, 120, 0, { bays: 4, door: -1, fascia: 20, riser: 26, transom: 16 }]],
    build: shopfront }),
  fam({ cat: 'architecture/envelope', title: 'Generic roller shutter unit', desc: (v) => `Security roller shutter with a coil head box, C-section guide rails, ${v.slat === 'grille' ? 'an open grille of rods and rails' : 'interlocking slats'}, a bottom bar and a lock.`,
    vs: [['slat, fully closed, 72 x 84 in', 72, 8, 84, 0, { slat: 'slat', box: 12, drop: 1 }], ['slat, half raised, 96 x 96 in', 96, 8, 96, 0, { slat: 'slat', box: 14, drop: 0.5 }], ['grille, closed, 120 x 96 in', 120, 8, 96, 0, { slat: 'grille', box: 14, drop: 1 }], ['slat, wide, 144 x 120 in', 144, 9, 120, 0, { slat: 'slat', box: 16, drop: 0.8 }]],
    build: rollerShutter }),
  fam({ cat: 'architecture/envelope', title: 'Generic roof dormer', desc: (v) => `Dormer window on a sloping roof with two cheek walls, a front wall with sill, frame, glass and glazing bars under a ${v.roof} roof.`,
    vs: [['gabled, 42 in wide', 42, 40, 62, 0, { roof: 'gable', wall: 42 }], ['hipped, 48 in wide', 48, 44, 66, 0, { roof: 'hip', wall: 44 }], ['shed roof, 60 in wide', 60, 40, 60, 0, { roof: 'shed', wall: 44 }], ['arched, 42 in wide', 42, 40, 62, 0, { roof: 'arched', wall: 42 }]],
    build: dormer }),
  fam({ cat: 'architecture/envelope', title: 'Generic bay window', desc: (v) => `${v.shape === 'box' ? 'Box' : v.shape === 'canted' ? 'Three-sided canted' : 'Five-facet bow'} bay with ${v.oriel ? 'a tapered corbelled underside, ' : 'an apron, '}a seat, glazed facets with mullions, a head and a ${v.roof === 'hip' ? 'hipped' : 'flat'} roof.`,
    vs: [['canted, 72 in wide', 72, 24, 90, 24, { shape: 'canted', sill: 18, head: 14, roof: 'flat' }], ['box, 84 in wide, hipped roof', 84, 24, 96, 20, { shape: 'box', sill: 20, head: 14, roof: 'hip' }], ['bow, five facets, 96 in wide', 96, 30, 96, 20, { shape: 'bow', sill: 22, head: 14, roof: 'hip' }], ['oriel on corbel, 60 in wide', 60, 24, 108, 70, { shape: 'canted', sill: 40, head: 14, roof: 'hip', oriel: true }]],
    build: bayWindow }),
  fam({ cat: 'architecture/envelope', title: 'Generic fabric awning', desc: (v) => `Wall-mounted awning with ${v.type === 'hood' ? 'a curved hood in strips and side ribs' : v.type === 'retract' ? 'folding arms, spring boxes and sloped fabric' : v.type === 'dutch' ? 'sloped fabric and closed end panels' : 'sloped fabric on a frame'} and a scalloped valance.`,
    vs: [['fixed lean-to, 72 x 36 in', 72, 36, 30, 84, { type: 'lean' }], ['retractable on arms, 120 x 60 in', 120, 60, 36, 84, { type: 'retract' }], ['closed ends, 84 x 36 in', 84, 36, 36, 84, { type: 'dutch' }], ['curved hood, 60 x 30 in', 60, 30, 30, 84, { type: 'hood' }]],
    build: awning }),
  fam({ cat: 'architecture/envelope', title: 'Generic hinged window shutters', desc: (v) => `Pair of ${v.kind} shutter leaves on strap hinges ${v.closed ? 'closed over' : 'folded back beside'} a window set in a wall, with sill and glass.`,
    vs: [['louvred pair, open, 60 x 60 in', 60, 6, 60, 30, { kind: 'louvred', leaf: 14 }], ['panelled pair, open, 72 x 72 in', 72, 6, 72, 30, { kind: 'panelled', leaf: 18 }], ['board and batten, closed, 40 x 60 in', 40, 6, 60, 30, { kind: 'batten', leaf: 20, closed: true }]],
    build: windowShutters }),
  fam({ cat: 'architecture/envelope', title: 'Generic masonry chimney stack', desc: (v) => `Brick chimney stack on a lead flashing base with three corbelled courses, a capping slab and ${v.type === 'octa' ? v.pots + ' octagonal shafts' : v.pots * (v.rows ?? 1) + ' turned flue pots' + (v.type === 'cowl' ? ' with cowls' : '')}.`,
    vs: [['one pot, 18 x 18 in', 18, 18, 60, 0, { type: 'pots', pots: 1, pot: 14 }], ['two pots, 36 x 18 in', 36, 18, 66, 0, { type: 'pots', pots: 2, pot: 14 }], ['four pots, 36 x 36 in, cowls', 36, 36, 72, 0, { type: 'cowl', pots: 2, rows: 2, pot: 16 }], ['twin octagonal shafts, 40 x 20 in', 40, 20, 96, 0, { type: 'octa', pots: 2, pot: 12 }]],
    build: chimney }),
  fam({ cat: 'architecture/envelope', title: 'Generic rainwater downpipe', desc: (v) => `${v.square ? 'Square' : 'Round'} downpipe on wall clips${v.hopper ? ', with a hopper head and tapered neck' : ''}, with a bend and shoe at the foot.`,
    vs: [['round 3 in, 96 in tall', 12, 14, 96, 0, { dia: 3, hopper: false }], ['square 4 in, 120 in tall', 12, 16, 120, 0, { dia: 4, square: true, hopper: false }], ['round 4 in with hopper head, 168 in tall', 14, 16, 168, 0, { dia: 4, hopper: true }]],
    build: downpipe }),
  fam({ cat: 'architecture/envelope', title: 'Generic rainscreen cladding sample', desc: (v) => `Cladding sample on a base: sheathing, vertical rails, insulation and ${v.type === 'seam' ? 'a standing-seam sheet with raised ribs' : v.type === 'shiplap' ? 'lapped boards' : v.type === 'cassette' ? 'cassette tiles with open joints and rivets' : 'timber slats on a dark backing'}.`,
    vs: [['standing seam, 48 x 96 in', 48, 9, 96, 0, { type: 'seam' }], ['lapped boards, 48 x 96 in', 48, 9, 96, 0, { type: 'shiplap' }], ['cassette tiles, 48 x 96 in', 48, 9, 96, 0, { type: 'cassette', tile: 24 }], ['timber slats, 36 x 96 in', 36, 9, 96, 0, { type: 'slats' }]],
    build: cladding }),
  fam({ cat: 'architecture/envelope', title: 'Generic projecting balcony', desc: (v) => `Balcony against a wall: a ${v.support === 'cantilever' ? 'cantilevered slab' : v.support === 'brackets' ? 'slab on two corbel brackets' : 'slab on two round posts'}, a door threshold and a ${v.guard === 'glass' ? 'glass' : v.guard === 'rail' ? 'bar' : 'solid parapet'} guard with a handrail.`,
    vs: [['cantilever, glass guard, 72 x 48 in', 72, 48, 144, 96, { support: 'cantilever', guard: 'glass', under: 0 }], ['on corbels, bar guard, 84 x 40 in', 84, 40, 150, 60, { support: 'brackets', guard: 'rail', under: 14 }], ['on posts, solid parapet, 96 x 60 in', 96, 60, 190, 0, { support: 'posts', guard: 'solid', under: 96 }]],
    build: balcony }),
];

// ================================================================================== CIRCULATION
function quarterStair(a, v) {
  const { X0, X1, YF, YB, Z0, W, D } = a, w = v.w * IN, ws = w + 80, n1 = v.n1, n2 = v.n2, ex = v.winder ? 3 : 1, r = (a.H - 960) / (n1 + n2 + ex);
  const ym = YB - ws, xm = X0 + ws, zl = Z0 + r * (n1 + 1);
  a.outline('EQUIP-HIDDEN');
  flightG(a, 'y', X0 + 40 + w / 2, w, YF, ym, Z0, n1, r);
  flightG(a, 'x', YB - 40 - w / 2, w, xm, X1, Z0 + r * (n1 + ex), n2, r);
  const post = (x, y, z1) => { a.box(x - 50, y - 50, Z0, x + 50, y + 50, z1); a.box(x - 62, y - 62, z1, x + 62, y + 62, z1 + 40); };
  if (!v.winder) {
    a.box(X0, ym, zl - 120, xm, YB, zl); a.rect(X0, ym, xm, YB, 'EQUIP-DETAIL');
    for (const [x, y] of [[X0 + 20, ym + 50], [X0 + 20, YB - 50], [xm - 50, YB - 50]]) post(x, y, zl + 960);
    a.tube([[X0 + 20, ym, zl + 900], [X0 + 20, YB - 20, zl + 900], [xm, YB - 20, zl + 900]], [22, 22, 22], 8);
  } else {
    const P0 = [X0, ym], P1 = [X0, ym + (ws * 2) / 3], Qc = [X0, YB], P2 = [X0 + ws / 3, YB], P3 = [xm, YB], C = [xm, ym];
    [[C, P0, P1], [C, P1, Qc, P2], [C, P2, P3]].forEach((poly, k) => { const z = Z0 + r * (n1 + k + 1); pr(a, poly, z - 70, z); a.poly(ccw(poly), 'EQUIP-DETAIL'); });
    post(X0 + 20, YB - 20, Z0 + r * (n1 + 2) + 960); post(xm - 50, ym + 50, Z0 + r * (n1 + 2) + 960);
    a.tube([[X0 + 20, ym, Z0 + r * (n1 + 1) + 900], [X0 + 20, YB - 20, Z0 + r * (n1 + 2) + 900], [xm, YB - 20, Z0 + r * (n1 + 3) + 900]], [22, 22, 22], 8);
  }
  a.log('Added a ' + n1 + '-tread flight, ' + (v.winder ? 'three winder treads turning the corner' : 'a square landing slab') + ', a ' + n2 + '-tread flight at right angles, newel posts, balusters and handrails (plan and 3D).');
}
function sweepStair(a, v) {
  const { X0, YF, YB, Z0, W, D, cx } = a, n = v.steps, r = (a.H - 960) / n, sw = (v.sweep * PI) / 180, quarter = v.sweep === 90;
  const Ro = quarter ? W : W / 2, Ri = Ro - v.w * IN, c0 = quarter ? [X0, YB] : [cx, YB], th0 = quarter ? -PI / 2 : -PI, dth = sw / n;
  const q = (rho, t) => [c0[0] + rho * m.cos(t), c0[1] + rho * m.sin(t)];
  a.outline('EQUIP-HIDDEN');
  a.arc(c0[0], c0[1], Ro, quarter ? 270 : 180, quarter ? 360 : 360, 'EQUIP'); a.arc(c0[0], c0[1], Ri, quarter ? 270 : 180, 360, 'EQUIP');
  const pO = [], pI = [];
  for (let i = 0; i < n; i++) {
    const ta = th0 + i * dth, tb = ta + dth + 0.01, z = Z0 + r * (i + 1), tm = (ta + tb) / 2;
    const poly = [q(Ri, ta), q(Ro - 20, ta), q(Ro - 20, tm), q(Ro - 20, tb), q(Ri, tb)];
    pr(a, poly, z - 60, z); pr(a, [q(Ri, ta), q(Ro - 20, ta), q(Ro - 20, ta + 0.02), q(Ri, ta + 0.02)], z - r, z - 60);
    a.poly(ccw([q(Ri, ta), q(Ro - 20, ta), q(Ro - 20, tb), q(Ri, tb)]), 'EQUIP-DETAIL');
    const [ox, oy] = q(Ro - 50, ta + dth / 2), [ix, iy] = q(Ri + 30, ta + dth / 2);
    if (i % 2 === 0) { a.tube([[ox, oy, z], [ox, oy, z + 880]], [8, 8], 6); a.tube([[ix, iy, z], [ix, iy, z + 880]], [8, 8], 6); }
    pO.push([ox, oy, z + 900]); pI.push([ix, iy, z + 900]);
  }
  a.tube(pO, pO.map(() => 24), 8); a.tube(pI, pI.map(() => 24), 8);
  const sO = [], sI = []; for (let i = 0; i <= n; i++) { const t = th0 + i * dth; const o = q(Ro - 30, t), ii = q(Ri + 10, t); sO.push([o[0], o[1], Z0 + r * (i + 0.2)]); sI.push([ii[0], ii[1], Z0 + r * (i + 0.2)]); }
  a.tube(sO, sO.map(() => 30), 8); a.tube(sI, sI.map(() => 30), 8);
  a.log('Added ' + n + ' wedge treads with risers sweeping ' + v.sweep + ' degrees, curved stringers, balusters and handrails on the outer and inner edges (plan and 3D).');
}
function floatStair(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, n = v.steps, r = (a.H - 1000) / n, g = W / n, th = v.th, wallSide = v.type === 'wall', yw = wallSide ? YB - 120 : YB;
  a.outline();
  if (wallSide) { a.box(X0, YB - 120, Z0, X1, YB, Z1); a.line(X0, YB - 120, X1, YB - 120, 'EQUIP-DETAIL'); }
  const ym = (YF + yw) / 2;
  for (let i = 0; i < n; i++) {
    const z = Z0 + r * (i + 1), x0 = X0 + g * i, x1 = m.min(X1, X0 + g * (i + 1) + 25);
    a.box(x0, YF, z - th, x1, yw, z); a.rect(x0, YF, x1, yw, 'EQUIP-DETAIL');
    if (wallSide) a.box(x0 + 40, yw - 10, z - th + 15, x1 - 40, yw + 90, z - 15);
  }
  if (!wallSide) prismY(a, [[X0, Z0 + r - 160], [X1, Z0 + r * n - 160], [X1, Z0 + r * n - 360], [X0, Z0 + r - 360]], ym - 60, ym + 60);
  const ys = wallSide ? [YF + 30] : [YF + 30, YB - 30];
  for (const y of ys) {
    if (v.guard === 'glass') { prismY(a, [[X0 + 30, Z0 + r + 100], [X1 - 30, Z0 + r * n + 100], [X1 - 30, Z0 + r * n + 960], [X0 + 30, Z0 + r + 960]], y - 6, y + 6); for (let k = 0; k <= 4; k++) { const f = 0.5 + ((n - 1) * k) / 4; a.ycyl(y - 18, y + 18, X0 + g * f, Z0 + r * (f + 0.5) + 40, 18, 8); } }
    else for (let i = 0; i < n; i += 2) a.tube([[X0 + g * (i + 0.5), y, Z0 + r * (i + 1)], [X0 + g * (i + 0.5), y, Z0 + r * (i + 1) + 880]], [7, 7], 5);
    a.tube([[X0 + g * 0.5, y, Z0 + r + 960], [X1 - g * 0.5, y, Z0 + r * n + 960]], [24, 24], 8); a.line(X0, y, X1, y, 'EQUIP-DETAIL');
  }
  a.line(X0 + g * 0.3, ym, X1 - g * 0.3, ym, 'EQUIP-DETAIL');
  a.log('Added ' + n + ' open-riser ' + (v.th > 70 ? 'timber' : 'steel plate') + ' treads ' + (wallSide ? 'cantilevered from a wall with anchor plates' : 'carried on a central spine stringer') + ', ' + (v.guard === 'glass' ? 'a sloped glass guard on stand-offs' : 'vertical rods') + ' and a handrail (plan and 3D).');
}
function escalator(a, v) {
  const { X0, X1, YF, YB, Z0, W, D } = a, nu = v.units, pit = v.ang ? 900 : 300, bal = 1000, flat = !v.ang;
  const rise = flat ? 0 : a.H - pit - bal, run = flat ? W - 2000 : rise / m.tan((v.ang * PI) / 180), lb = (W - run) / 2, x1 = X0 + lb, x2 = x1 + run, zf0 = Z0 + pit, zf1 = zf0 + rise;
  a.outline();
  a.box(X0, YF, Z0, x1, YB, zf0); a.box(x2, YF, Z0, X1, YB, zf1); a.rect(X0, YF, x1, YB, 'EQUIP-DETAIL'); a.rect(x2, YF, X1, YB, 'EQUIP-DETAIL');
  const uw = D / nu, sw = uw - 400, ns = m.max(6, m.round(run / (flat ? 500 : 400))), zs = (x) => zf0 + (rise * (x - x1)) / run;
  for (let u = 0; u < nu; u++) {
    const c = YF + uw * (u + 0.5), ys0 = c - sw / 2, ys1 = c + sw / 2, up = u % 2 === 0;
    prismY(a, [[x1, Z0], [x2, zf1 - 900], [x2, zf1 - 80], [x1, zf0 - 80]], ys0 - 40, ys1 + 40);
    for (let i = 0; i < ns; i++) {
      const xa = x1 + (run * i) / ns, xb = x1 + (run * (i + 1)) / ns, za = zs(xb);
      if (flat) a.box(xa + 4, ys0, zf0 - 40, xb - 4, ys1, zf0 + 5); else a.box(xa, ys0, za - 40, xb, ys1, za);
      a.line(xa, ys0, xa, ys1, 'EQUIP-DETAIL');
    }
    for (const [y0, y1] of [[ys0 - 90, ys0], [ys1, ys1 + 90]]) {
      prismY(a, [[x1, zf0 + 30], [x2, zf1 + 30], [x2, zf1 + 230], [x1, zf0 + 230]], y0, y1);
      prismY(a, [[x1, zf0 + 230], [x2, zf1 + 230], [x2, zf1 + 880], [x1, zf0 + 880]], y0 + 30, y1 - 30);
      const yh = (y0 + y1) / 2;
      a.tube([[x1 - 700, yh, zf0 + 1000], [x1 - 100, yh, zf0 + 1000], [x2 + 100, yh, zf1 + 1000], [x2 + 700, yh, zf1 + 1000]], [30, 30, 30, 30], 8);
      for (const [xx, zz] of [[x1 - 100, zf0], [x2 + 100, zf1]]) a.box(xx - 80, y0 - 30, zz, xx + 80, y1 + 30, zz + 1000);
      a.line(x1 - 700, yh, x2 + 700, yh, 'EQUIP-DETAIL');
    }
    const dx = up ? 1 : -1, xm = (x1 + x2) / 2; a.line(xm - dx * 600, c, xm + dx * 600, c, 'EQUIP-DETAIL'); a.line(xm + dx * 300, c - 120, xm + dx * 600, c, 'EQUIP-DETAIL'); a.line(xm + dx * 300, c + 120, xm + dx * 600, c, 'EQUIP-DETAIL');
  }
  a.log('Added the landings, a ' + (flat ? 'flat belt of pallets' : 'sloped truss with ' + ns + ' steps') + ', skirt and glass balustrade panels and moving handrails with curved ends' + (nu > 1 ? ' for two opposing units' : '') + ' (plan and 3D).');
}
function rakeBalustrade(a, v) {
  const { X0, X1, YF, YB, Z0, W, D } = a, n = v.steps, r = (a.H - 1100) / n, g = W / n, w = D - 80 - 130, c = YB - 40 - w / 2, yg = c - w / 2 - 100;
  a.outline('EQUIP-HIDDEN');
  flightG(a, 'x', c, w, X0, X1, Z0, n, r, { rail: false });
  const zt = (f) => Z0 + r * (f + 1), xa = X0 + g * 0.35, xb = X1 - g * 0.35;
  const nw = (x, z1) => { a.box(x - 55, yg - 55, Z0, x + 55, yg + 55, z1); a.box(x - 70, yg - 70, z1, x + 70, yg + 70, z1 + 45); a.ell(x, yg, z1 + 100, 55, 55, 55, 10, 6); };
  nw(xa, zt(0) + 900); nw(xb, zt(n - 1) + 900);
  a.tube([[xa, yg, zt(0) + 960], [xb, yg, zt(n - 1) + 960]], [30, 30], 8); a.tube([[xa, yg, zt(0) + 85], [xb, yg, zt(n - 1) + 85]], [22, 22], 8);
  const nb = m.round(n * 2.5);
  for (let i = 1; i < nb; i++) {
    const x = xa + ((xb - xa) * i) / nb, z = zt(0) + ((zt(n - 1) - zt(0)) * i) / nb + 85;
    if (v.bal === 'turned') lathe(a, x, yg, z, [[0, 12], [80, 20], [170, 12], [260, 24], [380, 11], [560, 22], [700, 12], [800, 15]], 8);
    else if (v.bal === 'square') a.box(x - 14, yg - 14, z, x + 14, yg + 14, z + 800); else a.box(x - 18, yg - 4, z, x + 18, yg + 4, z + 800);
  }
  a.rect(xa - 70, yg - 70, xa + 70, yg + 70, 'EQUIP-DETAIL'); a.rect(xb - 70, yg - 70, xb + 70, yg + 70, 'EQUIP-DETAIL'); a.line(xa, yg, xb, yg, 'EQUIP-DETAIL');
  a.log('Added the stair flight, two newel posts with cap and ball, a sloped handrail and base rail and ' + (v.bal === 'turned' ? 'turned' : v.bal === 'square' ? 'square' : 'flat steel') + ' balusters (plan and 3D).');
}

function loftLadder(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, hw = 330, hd = 800, hx0 = cx - hw, hx1 = cx + hw, ys = YB - 100 - hd;
  a.outline();
  a.box(X0, YF, Z1 - 100, X1, ys, Z1); a.box(X0, ys, Z1 - 100, hx0, YB, Z1); a.box(hx1, ys, Z1 - 100, X1, YB, Z1); a.box(X0, YB - 100, Z1 - 100, X1, YB, Z1);
  a.box(hx0 - 40, ys - 0, Z1 - 160, hx0, YB - 100, Z1 - 100); a.box(hx1, ys, Z1 - 160, hx1 + 40, YB - 100, Z1 - 100);
  a.box(hx0, YB - 112, Z1 - 100 - 900, hx1, YB - 100, Z1 - 160); a.box(hx0 + 30, YB - 130, Z1 - 1100, hx1 - 30, YB - 112, Z1 - 100 - 900);
  const top = [ys + hd / 2 - 0, Z1 - 160], bot = [top[0] - (top[1] - Z0 - 20) * 0.42, Z0 + 20];
  const sx = hw - 40, n = v.rungs;
  for (const s of [-1, 1]) {
    const x = cx + s * sx;
    if (v.stile === 'tube') a.tube([[x, top[0], top[1]], [x, bot[0], bot[1]]], [18, 18], 8); else prismX(a, [[top[0] - 20, top[1]], [top[0] + 20, top[1] - 20], [bot[0] + 20, bot[1]], [bot[0] - 20, bot[1] + 20]], x - 22, x + 22);
    a.box(x - 30, bot[0] - 30, Z0, x + 30, bot[0] + 30, Z0 + 20);
  }
  for (let i = 0; i < n; i++) { const f = (i + 0.7) / (n + 0.2), y = top[0] + (bot[0] - top[0]) * f, z = top[1] + (bot[1] - top[1]) * f; a.xcyl(cx - sx, cx + sx, y, z, 14, 8); a.line(cx - sx, y, cx + sx, y, 'EQUIP-DETAIL'); }
  a.rect(hx0, ys, hx1, YB - 100, 'EQUIP-DETAIL'); a.line(cx - sx, top[0], cx - sx, bot[0], 'EQUIP-DETAIL'); a.line(cx + sx, top[0], cx + sx, bot[0], 'EQUIP-DETAIL');
  a.log('Added the ceiling with a framed hatch, the open hatch panel and a ladder of two ' + (v.stile === 'tube' ? 'tube' : 'timber') + ' stiles with ' + n + ' rungs sloping to the floor (plan and 3D).');
}

function fireEscape(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, nF = v.storeys * 2, hf = (a.H - 1100) / nF, n = m.round(hf / 190), r = hf / n, Lw = v.land * IN, yw = YB - 100, w = yw - YF - 200, c = (YF + yw) / 2;
  a.outline('EQUIP-HIDDEN'); a.box(X0, yw, Z0, X1, YB, Z1); a.rect(X0, yw, X1, YB, 'EQUIP-DETAIL');
  for (let k = 0; k < nF; k++) {
    const right = k % 2 === 0, za = Z0 + k * hf;
    flightG(a, 'x', c, w, right ? X0 + Lw : X1 - Lw, right ? X1 - Lw : X0 + Lw, za, n, r, { risers: false, stringer: 200, tread: 35 });
    const z = Z0 + (k + 1) * hf, x0 = right ? X1 - Lw : X0, x1 = right ? X1 : X0 + Lw;
    a.box(x0, YF, z - 70, x1, yw, z);
    for (let i = 1; i < 6; i++) a.line(x0 + ((x1 - x0) * i) / 6, YF, x0 + ((x1 - x0) * i) / 6, yw, 'EQUIP-DETAIL');
    a.box(x0, YF, z, x1, YF + 15, z + 100);
    const ex = right ? X1 - 20 : X0 + 20;
    a.tube([[x0 + 20, YF + 20, z + 1050], [x1 - 20, YF + 20, z + 1050]], [20, 20], 8); a.tube([[x0 + 20, YF + 20, z + 520], [x1 - 20, YF + 20, z + 520]], [12, 12], 6);
    a.tube([[ex, YF + 20, z + 1050], [ex, yw, z + 1050]], [20, 20], 8); a.tube([[ex, YF + 20, z + 520], [ex, yw, z + 520]], [12, 12], 6);
    for (const [px, py] of [[x0 + 20, YF + 20], [x1 - 20, YF + 20], [ex, yw - 20], [(x0 + x1) / 2, YF + 20]]) a.cyl(px, py, z, z + 1050, 14, 6);
    a.cyl(right ? X1 - 70 : X0 + 70, YF + 70, Z0, z - 70, 55, 10); a.tube([[right ? X1 - 70 : X0 + 70, yw - 60, z - 70], [right ? X1 - 70 : X0 + 70, yw - 60, z - 700]], [30, 30], 6);
  }
  a.rect(X0, YF, X1, yw, 'EQUIP-DETAIL');
  a.log('Added ' + nF + ' zigzag flights of ' + n + ' open treads, a landing with grating, toe plate and guard at the end of each flight, support columns and the building wall behind (plan and 3D).');
}
function wallRail(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, zc = (Z0 + Z1) / 2, r = 21, yc = YB - 55 - r;
  a.outline();
  if (v.type === 'timber') {
    const ya = YB - 55, hh = 45; prismX(a, [[ya, zc - hh], [ya - 30, zc - hh], [ya - 55, zc - hh * 0.4], [ya - 55, zc + hh * 0.4], [ya - 30, zc + hh], [ya, zc + hh]], X0, X1);
  } else {
    const pts = v.returns ? [[X0 + 10, YB - 20, zc], [X0 + 10, yc, zc], [X0 + 90, yc, zc], [X1 - 90, yc, zc], [X1 - 10, yc, zc], [X1 - 10, YB - 20, zc]] : [[X0, yc, zc], [X1, yc, zc]];
    a.tube(pts, pts.map(() => r), 10);
  }
  const k = m.max(1, m.ceil((W - 200) / 1200)), nb = k + 1;
  for (let i = 0; i < nb; i++) { const x = X0 + 120 + ((W - 240) * i) / (nb - 1 || 1); a.box(x - 25, YB - 10, zc - 70, x + 25, YB, zc + 70); a.ycyl(YB - 55, YB - 8, x, zc - (v.type === 'timber' ? 0 : 0), 8, 6); a.box(x - 22, YB - 90, zc - 55, x + 22, YB - 50, zc - (v.type === 'timber' ? 40 : 15) + 0); a.rect(x - 25, YB - 10, x + 25, YB, 'EQUIP-DETAIL'); }
  a.line(X0, YB - 55 - r, X1, YB - 55 - r, 'EQUIP-DETAIL');
  a.log('Added the ' + (v.type === 'timber' ? 'D-section timber rail extruded along its length' : v.returns ? 'round tube rail with returns to the wall' : 'round tube rail') + ' on ' + nb + ' wall brackets with back plates, arms and cradles (plan and 3D).');
}

function platformLift(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, rise = v.rise * IN, zp = Z0 + 80 + rise * 0.5, pw = 90;
  a.outline();
  a.box(X0, YF, Z0, X1, YF + 600, Z0 + 60); a.box(X0, YB - 500, Z0 + 60, X1, YB, Z0 + 60 + rise + 0 > Z1 ? Z1 : Z0 + 60 + rise); a.box(X0 + 20, YB - 500, Z0 + 60 + rise, X1 - 20, YB, Z0 + 80 + rise);
  for (const x of [X0 + 40, X1 - 40]) for (const y of [YF + 60, YB - 560]) a.box(x - pw / 2, y - pw / 2, Z0 + 60, x + pw / 2, y + pw / 2, v.enclosed ? Z1 : Z0 + 60 + rise + 1100);
  a.box(X0 + 60, YB - 560 - pw / 2, Z0 + 60, X1 - 60, YB - 560 + pw / 2, v.enclosed ? Z1 : Z0 + 60 + rise + 1100);
  const mx = X1 - 140; a.box(mx - 90, YB - 540, Z0 + 60, mx + 90, YB - 400, Z0 + 60 + rise + 600); a.box(mx - 110, YB - 560, Z0 + 60 + rise + 600, mx + 110, YB - 380, Z0 + 60 + rise + 760);
  a.box(X0 + 90, YF + 140, zp, X1 - 90, YB - 620, zp + 80);
  for (const [x0, y0, x1, y1] of [[X0 + 90, YB - 640, X1 - 90, YB - 620], [X0 + 90, YF + 140, X0 + 110, YB - 620], [X1 - 110, YF + 140, X1 - 90, YB - 620]]) a.box(x0, y0, zp + 80, x1, y1, zp + 80 + 1050);
  a.box(X0 + 90, YF + 140, zp + 80, X0 + 400, YF + 160, zp + 80 + 1050);
  a.box(X1 - 160, YF + 100, Z0 + 60, X1 - 60, YF + 180, Z0 + 60 + 1100); a.cyl(X1 - 110, YF + 100, Z0 + 60 + 900, Z0 + 60 + 950, 24, 8);
  if (v.enclosed) { for (const [x0, x1] of [[X0 + 40, X1 - 40]]) a.box(x0, YF + 55, Z0 + 2100, x1, YF + 65, Z1 - 100); for (const x of [X0 + 40, X1 - 40]) a.box(x - 5, YF + 60, Z0 + 60, x + 5, YB - 560, Z1 - 100); }
  a.line(X0 + 90, YF + 140, X1 - 90, YF + 140, 'EQUIP-SWING'); a.rect(X0 + 90, YF + 140, X1 - 90, YB - 620, 'EQUIP-DETAIL'); a.rect(X0, YB - 500, X1, YB, 'EQUIP-DETAIL');
  a.log('Added the lower landing ramp plate, four posts' + (v.enclosed ? ' with glazed shaft panels' : '') + ', a drive mast, the raised platform with three guard walls and an open gate, an upper landing and a control post (plan and 3D).');
}
function gantry(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, zd = Z0 + v.deck * IN, nb = m.max(1, m.round(W / 3000)), bw = W / nb, yl = YF + 200, yr = YB - 200;
  a.outline();
  for (let i = 0; i <= nb; i++) { const x = X0 + 100 + ((W - 200) * i) / nb; for (const y of [yl, yr]) { a.box(x - 80, y - 80, Z0, x + 80, y + 80, zd - 300); a.box(x - 140, y - 140, Z0, x + 140, y + 140, Z0 + 20); } a.box(x - 40, yl, zd - 300, x + 40, yr, zd - 40); }
  for (const y of [yl, yr]) a.box(X0, y - 60, zd - 300, X1, y + 60, zd - 40);
  a.box(X0, YF + 60, zd - 40, X1, YB - 60, zd);
  for (let i = 1; i < m.floor(W / 300); i++) a.line(X0 + i * 300, YF + 60, X0 + i * 300, YB - 60, 'EQUIP-DETAIL');
  if (v.brace) for (let i = 0; i < nb; i++) for (const y of [yl, yr]) { const xa = X0 + 100 + ((W - 200) * i) / nb, xb = X0 + 100 + ((W - 200) * (i + 1)) / nb; a.tube([[xa, y, Z0 + 400], [xb, y, zd - 400]], [22, 22], 6); a.tube([[xa, y, zd - 400], [xb, y, Z0 + 400]], [22, 22], 6); }
  for (const y of [YF + 40, YB - 40]) {
    a.box(X0, y - 3, zd, X1, y + 3, zd + 100);
    a.tube([[X0, y, zd + 1100], [X1, y, zd + 1100]], [24, 24], 8); a.tube([[X0, y, zd + 550], [X1, y, zd + 550]], [14, 14], 6);
    const np = m.round(W / 1100); for (let i = 0; i <= np; i++) a.cyl(X0 + 20 + ((W - 40) * i) / np, y, zd, zd + 1100, 20, 6);
  }
  a.rect(X0, yl - 80, X1, yl + 80, 'EQUIP-DETAIL'); a.rect(X0, yr - 80, X1, yr + 80, 'EQUIP-DETAIL');
  a.log('Added ' + (nb + 1) + ' column pairs on base plates, side beams, cross beams, a grating deck, toe plates and a two-rail guard on both sides' + (v.brace ? ', with X bracing in every bay' : '') + ' (plan and 3D).');
}
function switchRamp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, Ld = 1500, rise = v.rise * IN, h1 = rise / 2, rw = (W - 400) / 2, xi = cx;
  a.outline();
  prismX(a, [[YF, Z0], [YB - Ld, Z0], [YB - Ld, Z0 + h1], [YF, Z0 + 20]], X0 + 100, X0 + 100 + rw);
  prismX(a, [[YB - Ld, Z0], [YF, Z0], [YF, Z0 + rise], [YB - Ld, Z0 + h1]], X1 - 100 - rw, X1 - 100);
  a.box(X0 + 100, YB - Ld, Z0, X1 - 100, YB, Z0 + h1); a.box(X0 + 100, YB - Ld, Z0 + h1, X1 - 100, YB, Z0 + h1 + 20);
  const rails = (x, ya, za, yb, zb) => { for (const hz of [900, 650]) a.tube([[x, ya, za + hz], [x, yb, zb + hz]], [18, 18], 8); const np = m.max(3, m.round(m.abs(yb - ya) / 1200)); for (let i = 0; i <= np; i++) { const f = i / np; a.cyl(x, ya + (yb - ya) * f, za + (zb - za) * f, za + (zb - za) * f + 900, 11, 6); } };
  rails(X0 + 120, YF + 40, Z0 + 20, YB - Ld, Z0 + h1); rails(X1 - 120, YB - Ld, Z0 + h1, YF + 40, Z0 + rise); rails(cx, YB - Ld, Z0 + h1, YF + 40, Z0 + rise * 0 + h1 * 1.0 + 0);
  a.tube([[X0 + 120, YB - Ld, Z0 + h1 + 900], [X0 + 120, YB - 20, Z0 + h1 + 900], [X1 - 120, YB - 20, Z0 + h1 + 900], [X1 - 120, YB - Ld, Z0 + h1 + 900]], [18, 18, 18, 18], 8);
  a.rect(X0 + 100, YF, X0 + 100 + rw, YB - Ld, 'EQUIP-DETAIL'); a.rect(X1 - 100 - rw, YF, X1 - 100, YB - Ld, 'EQUIP-DETAIL'); a.rect(X0 + 100, YB - Ld, X1 - 100, YB, 'EQUIP-DETAIL');
  const ax = (x, up) => { a.line(x, YF + 300, x, YB - Ld - 300, 'EQUIP-DETAIL'); const y = up ? YB - Ld - 300 : YF + 300, s = up ? 200 : -200; a.line(x - 150, y - s, x, y, 'EQUIP-DETAIL'); a.line(x + 150, y - s, x, y, 'EQUIP-DETAIL'); };
  ax(X0 + 100 + rw / 2, true); ax(X1 - 100 - rw / 2, false);
  a.log('Added two sloped runs of ' + v.rise / 2 + ' in rise joined by a level landing, two-line handrails on posts along the outer edges and the centre, and landing guards, with slope arrows (plan and 3D).');
}
function kerbRamp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, kh = 140, rw = v.ramp * IN, fw = 1000, yg = YF + 300, yf = YB - fw, fl = (W - rw) / 2;
  a.outline();
  a.box(X0, YF, Z0, X1, yg, Z0 + 12); a.box(X0, yf, Z0, X1, YB, Z0 + kh);
  a.box(X0, yg, Z0, cx - rw / 2 - fl * 0.0, yf, Z0 + kh * 0.0 + 1 > 0 ? Z0 + kh : Z0 + kh); a.box(cx + rw / 2, yg, Z0, X1, yf, Z0 + kh);
  prismX(a, [[yg, Z0], [yf, Z0], [yf, Z0 + kh], [yg, Z0 + 12]], cx - rw / 2, cx + rw / 2);
  for (const sx of [-1, 1]) { const xa = cx + sx * rw / 2, xb = cx + sx * (rw / 2 + fl * 0.5); a.box(m.min(xa, xb), yg, Z0, m.max(xa, xb), yf, Z0 + kh); }
  for (let j = 0; j < 8; j++) for (let i = 0; i < m.floor(rw / 60) - 1; i++) { const x = cx - rw / 2 + 60 + i * 60, y = yg + 60 + j * 60, z = Z0 + 12 + ((kh - 12) * (y - yg)) / (yf - yg); a.cyl(x, y, z, z + 10, 12, 6); }
  a.rect(cx - rw / 2, yg, cx + rw / 2, yf, 'EQUIP-DETAIL'); a.line(X0, yg, X1, yg, 'EQUIP-DETAIL'); a.line(X0, yf, X1, yf, 'EQUIP-DETAIL');
  for (let j = 0; j < 8; j++) a.line(cx - rw / 2, yg + 60 + j * 60, cx + rw / 2, yg + 60 + j * 60, 'EQUIP-DETAIL');
  a.log('Added the road gutter strip, the footway slab, a sloped ramp wedge with a blister of truncated tactile domes, and raised flank kerbs (plan and 3D).');
}
const CIRC = [
  fam({ cat: 'architecture/circulation', title: 'Generic quarter-turn stair', desc: (v) => `Stair of ${v.n1} treads, ${v.winder ? 'three winder treads turning the corner' : 'a square landing'}, then ${v.n2} treads at right angles, with newel posts, balusters and handrails.`,
    vs: [['landing, 12 risers, 122 in tall', 99, 89, 122, 0, { w: 36, n1: 5, n2: 6 }], ['landing, 15 risers, 143 in tall', 109, 109, 143, 0, { w: 36, n1: 7, n2: 7 }], ['landing, 9 risers, 101 in tall', 79, 79, 101, 0, { w: 36, n1: 4, n2: 4 }], ['winders, 12 risers, 122 in tall', 89, 79, 122, 0, { w: 36, n1: 4, n2: 5, winder: true }], ['winders, 15 risers, 143 in tall', 99, 99, 143, 0, { w: 36, n1: 6, n2: 6, winder: true }], ['winders, 10 risers, 108 in tall', 79, 69, 108, 0, { w: 36, n1: 3, n2: 4, winder: true }]],
    build: quarterStair }),
  fam({ cat: 'architecture/circulation', title: 'Generic curved sweep stair', desc: (v) => `Sweeping stair of ${v.steps} wedge treads with risers turning ${v.sweep} degrees, curved stringers, balusters and handrails on both edges.`,
    vs: [['quarter sweep, 12 treads, 72 in radius', 72, 72, 122, 0, { steps: 12, sweep: 90, w: 38 }], ['half sweep, 20 treads, 144 in span', 144, 72, 178, 0, { steps: 20, sweep: 180, w: 40 }], ['quarter sweep, 8 treads, 60 in radius', 60, 60, 94, 0, { steps: 8, sweep: 90, w: 34 }]],
    build: sweepStair }),
  fam({ cat: 'architecture/circulation', title: 'Generic floating stair', desc: (v) => `Open-riser stair of ${v.steps} ${v.th > 70 ? 'timber' : 'steel plate'} treads ${v.type === 'wall' ? 'cantilevered from a wall' : 'on a central spine stringer'}, with ${v.guard === 'glass' ? 'a sloped glass guard' : 'vertical rods'} and a handrail.`,
    vs: [['timber on wall, glass guard, 12 steps', 120, 40, 123, 0, { steps: 12, th: 90, type: 'wall', guard: 'glass' }], ['steel on wall, rod guard, 14 steps', 140, 36, 137, 0, { steps: 14, th: 40, type: 'wall', guard: 'rods' }], ['spine, rods both sides, 12 steps', 120, 44, 123, 0, { steps: 12, th: 60, type: 'spine', guard: 'rods' }]],
    build: floatStair }),
  fam({ cat: 'architecture/circulation', title: 'Generic loft hatch ladder', desc: (v) => `Ceiling with a framed hatch and an open hatch panel, with a ladder of two ${v.stile === 'tube' ? 'tube' : 'timber'} stiles and ${v.rungs} rungs sloping to the floor.`,
    vs: [['timber, 8 rungs, 96 in ceiling', 32, 56, 100, 0, { rungs: 8, stile: 'timber' }], ['aluminium tube, 9 rungs, 108 in ceiling', 32, 62, 112, 0, { rungs: 9, stile: 'tube' }], ['timber, 11 rungs, 120 in ceiling', 32, 68, 124, 0, { rungs: 11, stile: 'timber' }]],
    build: loftLadder }),
  fam({ cat: 'architecture/circulation', title: 'Generic shopping-centre escalator', desc: (v) => `Escalator with landings, a sloped truss, steps, skirts, glass balustrades and moving handrails${v.units > 1 ? ', two units running opposite ways' : ''}.`,
    vs: [['single, 10 ft rise, 32 in step', 288, 47, 195, 0, { units: 1, ang: 30 }], ['single, 15 ft rise, 40 in step', 392, 55, 255, 0, { units: 1, ang: 30 }], ['opposing pair, 12 ft rise', 329, 95, 219, 0, { units: 2, ang: 30 }]],
    build: escalator }),
  fam({ cat: 'architecture/circulation', title: 'Generic moving walkway', desc: (v) => `Moving walkway with landings, ${v.ang ? 'sloped at ' + v.ang + ' degrees, ' : 'level, '}pallets, skirts, glass balustrades and moving handrails.`,
    vs: [['level, 30 ft long', 440, 55, 51, 0, { units: 1, ang: 0 }], ['inclined 12 degrees, 6 ft rise', 419, 55, 146, 0, { units: 1, ang: 12 }]],
    build: escalator }),
  fam({ cat: 'architecture/circulation', title: 'Generic external fire escape', desc: (v) => `Zigzag steel stair of ${v.storeys * 2} flights of open treads against a wall, with a grated landing, toe plate and guard at each turn and support columns.`,
    vs: [['one storey, 9 ft', 150, 52, 151, 0, { storeys: 1, land: 40 }], ['two storeys, 18 ft', 150, 52, 259, 0, { storeys: 2, land: 40 }], ['three storeys, 27 ft', 150, 52, 367, 0, { storeys: 3, land: 40 }]],
    build: fireEscape }),
  fam({ cat: 'architecture/circulation', title: 'Generic wall handrail', desc: (v) => `Wall handrail: ${v.type === 'timber' ? 'a D-section timber rail' : v.returns ? 'a round tube rail with returns to the wall' : 'a round tube rail'} on wall brackets with back plates, arms and cradles.`,
    vs: [['round tube, 48 in', 48, 4, 7, 34, { type: 'round' }], ['round tube with returns, 120 in', 120, 4, 7, 34, { type: 'round', returns: true }], ['timber D-section, 96 in', 96, 4, 7, 34, { type: 'timber' }]],
    build: wallRail }),
  fam({ cat: 'architecture/circulation', title: 'Generic raked stair guard', desc: (v) => `Stair flight with a raked guard: two newel posts with cap and ball, a sloped handrail and base rail and ${v.bal === 'turned' ? 'turned' : v.bal === 'square' ? 'square' : 'flat steel'} balusters.`,
    vs: [['turned balusters, 8 treads', 80, 44, 100, 0, { steps: 8, bal: 'turned' }], ['square balusters, 12 treads', 120, 44, 128, 0, { steps: 12, bal: 'square' }], ['flat steel balusters, 14 treads', 140, 44, 141, 0, { steps: 14, bal: 'flat' }]],
    build: rakeBalustrade }),
  fam({ cat: 'architecture/circulation', title: 'Generic vertical platform lift', desc: (v) => `Platform lift for a ${v.rise} in rise: ${v.enclosed ? 'four posts with glazed shaft panels, ' : 'four posts, '}a drive mast, the raised platform with three guard walls and an open gate, landings and a control post.`,
    vs: [['open, 48 in rise', 60, 72, 100, 0, { rise: 48 }], ['enclosed shaft, 96 in rise', 66, 80, 186, 0, { rise: 96, enclosed: true }]],
    build: platformLift }),
  fam({ cat: 'architecture/circulation', title: 'Generic steel access gantry', desc: (v) => `Elevated steel walkway on column pairs with base plates, side and cross beams, a grating deck, toe plates and two-rail guards${v.brace ? ' and X bracing in every bay' : ''}.`,
    vs: [['10 ft long, 8 ft deck', 120, 54, 139, 0, { deck: 96 }], ['20 ft long, braced, 10 ft deck', 240, 54, 163, 0, { deck: 120, brace: true }], ['30 ft long, braced, 12 ft deck', 360, 54, 187, 0, { deck: 144, brace: true }]],
    build: gantry }),
  fam({ cat: 'architecture/circulation', title: 'Generic switchback ramp', desc: (v) => `Two sloped runs of ${v.rise / 2} in rise joined by a level landing, with two-line handrails on posts and landing guards.`,
    vs: [['30 in rise, two runs', 112, 240, 70, 0, { rise: 30 }], ['48 in rise, two runs', 112, 348, 88, 0, { rise: 48 }]],
    build: switchRamp }),
  fam({ cat: 'architecture/circulation', title: 'Generic dropped kerb ramp', desc: (v) => `Dropped kerb: a road gutter strip, a footway slab, a ${v.ramp} in wide sloped ramp with tactile domes and flank kerbs.`,
    vs: [['perpendicular, 48 in ramp', 96, 96, 6, 0, { ramp: 48 }], ['wide, 72 in ramp', 120, 96, 6, 0, { ramp: 72 }]],
    build: kerbRamp }),
];

// ================================================================================== DETAILS
/** a moulding profile [v, u] (v up 0..1, u out from the wall 0..1), extruded along x; the wall is at y = 0 */
function profile(a, pts, x0, x1, D, z0, H) {
  for (let i = 0; i < pts.length - 1; i++) { const [va, ua] = pts[i], [vb, ub] = pts[i + 1]; if (vb - va < 0.0005) continue; prismX(a, [[0, z0 + va * H], [-ua * D, z0 + va * H], [-ub * D, z0 + vb * H], [0, z0 + vb * H]], x0, x1); }
}
/** a column drum with entasis, [x, y] centre, from z0 to z1, base radius r */
function drum(a, x, y, z0, z1, r, seg = 16) { lathe(a, x, y, z0, [[0, r], [(z1 - z0) * 0.3, r * 1.0], [(z1 - z0) * 0.7, r * 0.94], [z1 - z0, r * 0.84]], seg); }
function pilaster(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, H = a.H, bh = H * 0.1, ch = H * 0.09, s0 = Z0 + bh, s1 = Z1 - ch;
  a.outline();
  if (v.type === 'engaged') {
    const R = W * 0.38, cy = YB - R;
    a.box(X0, YB - 2 * R - 60, Z0, X1, YB, Z0 + bh * 0.45); a.box(X0 + 30, YB - 2 * R - 30, Z0 + bh * 0.45, X1 - 30, YB, Z0 + bh * 0.7);
    lathe(a, cx, cy, Z0 + bh * 0.7, [[0, R * 1.22], [bh * 0.15, R * 1.14], [bh * 0.2, R * 1.2], [bh * 0.3, R * 1.0]], 20);
    drum(a, cx, cy, s0, s1, R, 20);
    lathe(a, cx, cy, s1, [[0, R * 0.86], [ch * 0.2, R * 1.0], [ch * 0.5, R * 1.18], [ch * 0.6, R * 1.28]], 20);
    a.box(cx - R * 1.4, cy - R * 1.4, Z1 - ch * 0.4, cx + R * 1.4, YB, Z1); a.circ(cx, cy, R, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 1.22, 'EQUIP-DETAIL');
  } else {
    a.box(X0, YF, Z0, X1, YB, Z0 + bh * 0.5); a.box(X0 + W * 0.04, YF + D * 0.05, Z0 + bh * 0.5, X1 - W * 0.04, YB, Z0 + bh);
    const sx0 = X0 + W * 0.1, sx1 = X1 - W * 0.1, sy = YF + D * 0.2;
    a.box(sx0, sy, s0, sx1, YB, s1);
    if (v.type === 'fluted') { const k = 5, fw = (sx1 - sx0) / (2 * k + 1); for (let i = 0; i < k; i++) a.box(sx0 + fw * (2 * i + 1), sy - D * 0.06, s0 + 40, sx0 + fw * (2 * i + 2), sy, s1 - 40); for (let i = 0; i < k; i++) a.line(sx0 + fw * (2 * i + 1), sy, sx0 + fw * (2 * i + 2), sy, 'EQUIP-DETAIL'); }
    a.box(sx0 - W * 0.02, sy - D * 0.05, s1, sx1 + W * 0.02, YB, s1 + ch * 0.3); a.box(X0 + W * 0.04, YF + D * 0.06, s1 + ch * 0.3, X1 - W * 0.04, YB, Z1 - ch * 0.3); a.box(X0, YF, Z1 - ch * 0.3, X1, YB, Z1);
    a.rect(sx0, sy, sx1, YB, 'EQUIP-DETAIL');
  }
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.log('Added the plinth and moulded base, ' + (v.type === 'engaged' ? 'a round half-engaged shaft with entasis' : v.type === 'fluted' ? 'a shaft with five raised flutes' : 'a plain square shaft') + ', and a capital with abacus projecting from the wall (plan and 3D).');
}
function timberPost(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, ps = v.post * IN, pad = 200, bd = v.beam * IN, bl = v.brace * IN, bt = ps * 0.6;
  a.outline();
  a.box(cx - ps * 0.9, cy - ps * 0.9, Z0, cx + ps * 0.9, cy + ps * 0.9, Z0 + pad);
  a.box(cx - ps / 2 - 15, cy - ps / 2 - 15, Z0 + pad, cx + ps / 2 + 15, cy + ps / 2 + 15, Z0 + pad + 160); a.box(cx - ps / 2 - 15, cy - 4, Z0 + pad + 160, cx + ps / 2 + 15, cy + 4, Z0 + pad + 360);
  a.box(cx - ps / 2, cy - ps / 2, Z0 + pad + 160, cx + ps / 2, cy + ps / 2, Z1 - bd);
  a.box(X0, cy - ps / 2 - 20, Z1 - bd, X1, cy + ps / 2 + 20, Z1); a.box(cx - ps / 2 - 30, cy - ps / 2 - 40, Z1 - bd - 30, cx + ps / 2 + 30, cy + ps / 2 + 40, Z1 - bd);
  for (const s of [-1, 1]) {
    const xp = cx + s * ps / 2, xe = cx + s * (ps / 2 + bl);
    prismY(a, [[xp, Z1 - bd - bl], [xe, Z1 - bd], [xe - s * bt * 1.4, Z1 - bd], [xp, Z1 - bd - bl - bt * 1.4]], cy - ps * 0.2, cy + ps * 0.2);
    if (v.braces === 4) prismX(a, [[cy + s * ps / 2, Z1 - bd - bl * 0.8], [cy + s * (ps / 2 + bl * 0.8), Z1 - bd - 20], [cy + s * (ps / 2 + bl * 0.8 - bt), Z1 - bd - 20], [cy + s * ps / 2, Z1 - bd - bl * 0.8 - bt * 1.2]], cx - ps * 0.2, cx + ps * 0.2);
  }
  for (const s of [-1, 1]) for (const z of [Z0 + pad + 600, Z1 - bd - 400]) a.ycyl(cy - ps / 2 - 30, cy + ps / 2 + 30, cx + s * ps * 0.25, z, 12, 6);
  a.rect(cx - ps / 2, cy - ps / 2, cx + ps / 2, cy + ps / 2, 'EQUIP-DETAIL'); a.rect(X0, cy - ps / 2 - 20, X1, cy + ps / 2 + 20, 'EQUIP-DETAIL');
  a.log('Added the stone pad, a steel shoe, the square post, a head beam with a bearing cap and ' + (v.braces === 4 ? 'four' : 'two') + ' angled braces with pegs (plan and 3D).');
}
function niche(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, ow = v.ow * IN, nd = D * 0.6, sill = Z0 + 900, zs = sill + v.straight * IN, R = ow / 2;
  a.outline();
  a.box(X0, YF, Z0, cx - R, YB, Z1); a.box(cx + R, YF, Z0, X1, YB, Z1); a.box(cx - R, YF, Z0, cx + R, YB, sill); a.box(cx - R - 40, YF, sill - 60, cx + R + 40, YF + nd + 60, sill + 20);
  a.box(cx - R, YF + nd, sill, cx + R, YB, Z1);
  const ns = 22;
  for (let k = 0; k < ns; k++) {
    const xa = cx - R + (ow * k) / ns, xb = cx - R + (ow * (k + 1)) / ns, xm = (xa + xb) / 2, zb = v.head === 'flat' ? zs : zs + m.sqrt(m.max(0, R * R - (xm - cx) * (xm - cx)));
    if (Z1 - zb > 5) a.box(xa, YF, zb, xb, YF + nd, Z1);
  }
  if (v.head === 'shell') { const zc = zs; for (let k = -4; k <= 4; k++) { const th = PI / 2 + (k / 4) * (PI / 2) * 0.92; a.tube([[cx, YF + nd - 25, zc - 40], [cx + R * 0.95 * m.cos(th), YF + nd - 25, zc + R * 0.95 * m.sin(th)]], [14, 12], 6); } a.cone(cx, YF + nd - 25, zc - 120, zc - 40, 30, 60, 8); }
  lathe(a, cx, YF + nd + (D - nd) * 0.4, sill + 20, [[0, 90], [60, 110], [260, 150], [420, 120], [520, 60], [600, 90], [680, 30]], 14);
  a.rect(cx - R, YF, cx + R, YF + nd, 'EQUIP-DETAIL'); a.circ(cx, YF + nd + (D - nd) * 0.4, 90, 'EQUIP-DETAIL');
  a.log('Added the wall block with a recessed niche, a sill ledge, a ' + (v.head === 'shell' ? 'half-round head with radiating shell ribs' : v.head === 'flat' ? 'flat head' : 'half-round head') + ' and an urn standing inside (plan and 3D).');
}
function quoins(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, t = v.t * IN, ch = v.course * IN, L = v.long * IN, S = L * 0.5, n = m.floor(a.H / ch);
  a.outline();
  a.box(X0, YF + 25, Z0, X1, YF + t, Z1); a.box(X0 + 25, YF + t, Z0, X0 + t, YB, Z1);
  for (let k = 0; k < n; k++) {
    const z0 = Z0 + k * ch + 8, z1 = Z0 + (k + 1) * ch - 8, big = k % 2 === 0;
    const lf = big ? L : S, ls = big ? S : L;
    a.box(X0, YF, z0, X0 + lf - 8, YF + t, z1);
    a.box(X0, YF + t + 4, z0, X0 + t, YF + t + ls - 4, z1);
  }
  a.rect(X0, YF, X0 + L, YF + t, 'EQUIP-DETAIL'); a.rect(X0, YF + t, X0 + t, YF + t + L, 'EQUIP-DETAIL'); a.line(X0 + L, YF, X0 + L, YF + t, 'EQUIP-DETAIL');
  a.log('Added ' + n + ' courses of alternating long and short corner stones on both faces over recessed walls (plan and 3D).');
}
function finial(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, H = a.H, R = W / 2;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.12); a.box(X0 + W * 0.06, YF + D * 0.06, Z0 + H * 0.12, X1 - W * 0.06, YB - D * 0.06, Z0 + H * 0.22);
  const zb = Z0 + H * 0.22;
  if (v.type === 'ball') { lathe(a, cx, cy, zb, [[0, R * 0.55], [H * 0.04, R * 0.62], [H * 0.08, R * 0.4], [H * 0.12, R * 0.34]], 14); a.ell(cx, cy, zb + H * 0.12 + R * 0.55, R * 0.62, R * 0.62, R * 0.62, 16, 10); a.cone(cx, cy, zb + H * 0.12 + R * 1.12, Z1, R * 0.12, R * 0.03, 8); }
  else if (v.type === 'urn') { lathe(a, cx, cy, zb, [[0, R * 0.5], [H * 0.03, R * 0.56], [H * 0.06, R * 0.3], [H * 0.12, R * 0.26], [H * 0.2, R * 0.62], [H * 0.34, R * 0.74], [H * 0.46, R * 0.52], [H * 0.5, R * 0.6], [H * 0.53, R * 0.3]], 16); a.ell(cx, cy, Z1 - H * 0.12, R * 0.22, R * 0.22, H * 0.12, 10, 8); for (const s of [-1, 1]) a.tube([[cx + s * R * 0.7, cy, zb + H * 0.3], [cx + s * R * 0.95, cy, zb + H * 0.36], [cx + s * R * 0.62, cy, zb + H * 0.44]], [R * 0.06, R * 0.06, R * 0.06], 6); }
  else { const r0 = R * 0.62; loft(a, [[cx - r0, cy - r0], [cx + r0, cy - r0], [cx + r0, cy + r0], [cx - r0, cy + r0]], zb, [[cx - r0 * 0.2, cy - r0 * 0.2], [cx + r0 * 0.2, cy - r0 * 0.2], [cx + r0 * 0.2, cy + r0 * 0.2], [cx - r0 * 0.2, cy + r0 * 0.2]], Z1 - H * 0.08); pyramid(a, [[cx - r0 * 0.2, cy - r0 * 0.2], [cx + r0 * 0.2, cy - r0 * 0.2], [cx + r0 * 0.2, cy + r0 * 0.2], [cx - r0 * 0.2, cy + r0 * 0.2]], Z1 - H * 0.08, [cx, cy, Z1]); }
  a.rect(X0 + W * 0.06, YF + D * 0.06, X1 - W * 0.06, YB - D * 0.06, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.55, 'EQUIP-DETAIL');
  a.log('Added the stepped plinth and a ' + (v.type === 'ball' ? 'turned neck, sphere and spike' : v.type === 'urn' ? 'turned urn with handles and a flame' : 'tapering four-sided obelisk with a pyramid tip') + ' (plan and 3D).');
}
function dentil(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H } = a, h = (f) => Z0 + f * H, u = (f) => YB - f * D;
  a.outline();
  a.box(X0, YB - 100, Z0, X1, YB, Z1);
  prismX(a, [[YB, h(0)], [u(0.2), h(0)], [u(0.3), h(0.12)], [YB, h(0.2)]], X0, X1);
  if (v.type === 'dentil') {
    a.box(X0, u(0.3), h(0.2), X1, YB, h(0.38)); const k = m.floor(W / 70);
    for (let i = 0; i < k; i++) { const x = X0 + (W * (i + 0.5)) / k; a.box(x - 20, u(0.45), h(0.2), x + 20, u(0.3), h(0.37)); a.line(x, u(0.3), x, u(0.45), 'EQUIP-DETAIL'); }
    prismX(a, [[u(0.3), h(0.38)], [u(0.8), h(0.38)], [u(0.8), h(0.6)], [u(0.35), h(0.62)]], X0, X1);
  } else {
    a.box(X0, u(0.3), h(0.2), X1, YB, h(0.4)); const k = m.floor(W / 190);
    for (let i = 0; i < k; i++) { const x = X0 + (W * (i + 0.5)) / k; prismX(a, [[u(0.32), h(0.4)], [u(0.8), h(0.4)], [u(0.8), h(0.34)], [u(0.6), h(0.2)], [u(0.4), h(0.2)]], x - 35, x + 35); a.line(x, u(0.32), x, u(0.8), 'EQUIP-DETAIL'); }
    prismX(a, [[u(0.32), h(0.4)], [u(0.92), h(0.4)], [u(0.92), h(0.62)], [u(0.4), h(0.64)]], X0, X1);
  }
  prismX(a, [[u(0.4), h(0.62)], [u(0.95), h(0.62)], [u(0.98), h(0.72)], [u(0.95), h(0.8)], [u(0.8), h(0.88)], [u(0.55), h(0.96)], [u(0.4), h(1)], [YB, h(1)]], X0, X1);
  a.line(X0, u(0.3), X1, u(0.3), 'EQUIP-DETAIL'); a.line(X0, u(0.95), X1, u(0.95), 'EQUIP-DETAIL');
  a.log('Added the wall panel, a bed moulding, a band of ' + (v.type === 'dentil' ? 'dentil blocks' : 'scrolled modillion brackets') + ', the projecting corona and a crown moulding (plan and 3D).');
}
function doorSurround(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, pw = v.pil * IN, ph = v.ph * IN, eh = v.ent * IN, zE = Z1 - ph - eh, ow = W - 2 * pw, Zp = Z1 - ph;
  a.outline();
  a.box(X0 + pw, YB - 120, Z0, X1 - pw, YB, zE);
  for (const x of [X0, X1 - pw]) { a.box(x - 10 < X0 ? x : x - 10, YF, Z0, x + pw, YB, Z0 + 260); a.box(x, YF + D * 0.1, Z0 + 260, x + pw, YB, zE - 180); a.box(x, YF, zE - 180, x + pw, YB, zE); if (v.stl) a.box(x + pw * 0.3, YF + D * 0.04, Z0 + 400, x + pw * 0.7, YF + D * 0.1, zE - 300); }
  a.box(X0, YF + D * 0.1, zE, X1, YB, zE + eh * 0.34); a.box(X0 + 30, YF + D * 0.16, zE + eh * 0.34, X1 - 30, YB, zE + eh * 0.68);
  if (v.type === 'hood') {
    a.box(X0, YF, zE + eh * 0.68, X1, YB, Z1); a.box(X0 - 0, YF, Z1 - 60, X1, YF + 60, Z1);
    for (const x of [X0 + pw * 0.2, X1 - pw * 0.8]) prismX(a, [[YB, zE + eh * 0.68], [YF + 40, zE + eh * 0.68], [YF + 40, zE + eh * 0.4], [YB - 40, zE - 260]], x, x + pw * 0.6);
  } else {
    a.box(X0, YF, zE + eh * 0.68, X1, YB, zE + eh);
    if (v.type === 'tri') { prismY(a, [[X0, Zp], [X1, Zp], [cx, Z1]], YF, YF + D * 0.3); prismY(a, [[X0 + 80, Zp], [X1 - 80, Zp], [cx, Z1 - 120]], YF + D * 0.3, YB); }
    else if (v.type === 'seg') { const pts = [[X0, Zp]]; for (let k = 0; k <= 12; k++) { const t = (PI * k) / 12; pts.push([cx - (W / 2) * m.cos(t), Zp + (Z1 - Zp) * m.sin(t)]); } pts.push([X1, Zp]); prismY(a, pts, YF, YF + D * 0.3); const p2 = [[X0 + 80, Zp]]; for (let k = 0; k <= 12; k++) { const t = (PI * k) / 12; p2.push([cx - (W / 2 - 80) * m.cos(t), Zp + (Z1 - Zp - 100) * m.sin(t)]); } p2.push([X1 - 80, Zp]); prismY(a, p2, YF + D * 0.3, YB); }
    else { const g = W * 0.1, hh = (Z1 - Zp) * (1 - g / (W / 2)); for (const s of [-1, 1]) prismY(a, [[s < 0 ? X0 : cx + g, Zp], [s < 0 ? cx - g : X1, Zp], [s < 0 ? cx - g : cx + g, Zp + hh]], YF, YB - 20); lathe(a, cx, YF + D * 0.5, Zp, [[0, 140], [80, 150], [260, 90], [420, 200], [520, 130], [600, 60]], 12); a.box(cx - 150, YF + D * 0.2, Zp, cx + 150, YB - 40, Zp + 120); }
  }
  const lx0 = X0 + pw + 20, lx1 = X1 - pw - 20, lz1 = zE - 120;
  a.frame(lx0, Z0 + 20, lx1, lz1, YB - 220, YB - 130, 90);
  for (const [px0, px1, pz0, pz1] of [[lx0 + 90, (lx0 + lx1) / 2 - 15, lz1 - 700, lz1 - 90], [(lx0 + lx1) / 2 + 15, lx1 - 90, lz1 - 700, lz1 - 90], [lx0 + 90, (lx0 + lx1) / 2 - 15, Z0 + 110, lz1 - 760], [(lx0 + lx1) / 2 + 15, lx1 - 90, Z0 + 110, lz1 - 760]]) { a.box(px0, YB - 205, pz0, px1, YB - 130, pz1); a.box(px0 + 40, YB - 220, pz0 + 40, px1 - 40, YB - 205, pz1 - 40); }
  a.cyl(lx1 - 140, YB - 250, (Z0 + lz1) / 2 - 20, (Z0 + lz1) / 2 + 20, 24, 8);
  a.rect(X0 + pw, YB - 120, X1 - pw, YB, 'EQUIP-DETAIL'); a.rect(lx0, YB - 220, lx1, YB - 130, 'EQUIP-DETAIL');
  a.log('Added the plinths, pilasters with capitals, the entablature, ' + (v.type === 'hood' ? 'a flat hood on two console brackets' : v.type === 'tri' ? 'a triangular pediment with a recessed tympanum' : v.type === 'seg' ? 'a segmental pediment' : 'a broken pediment with an urn') + ' and a four-panel door leaf set back in the opening (plan and 3D).');
}
function windowSurround(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, cw = v.cw * IN, lh = v.lintel * IN, hd = v.head * IN, ow = W - 2 * cw, z0o = Z0 + 280, zLt = Z1 - hd - lh, Zp = Z1 - hd;
  a.outline();
  a.box(X0 + cw * 0.2, YF, Z0 + 120, X1 - cw * 0.2, YB, z0o); for (const x of [X0 + cw * 0.3, X1 - cw * 0.3 - 150]) a.box(x, YF + D * 0.2, Z0, x + 150, YB, Z0 + 120);
  for (const x of [X0, X1 - cw]) { a.box(x, YF + D * 0.1, z0o, x + cw, YB, zLt); if (v.ears) a.box(x - 0, YF, zLt - 150, x + cw, YF + D * 0.2, zLt); }
  a.box(X0, YF + D * 0.1, zLt, X1, YB, zLt + lh);
  if (v.key) a.box(cx - cw * 0.45, YF, zLt - 100, cx + cw * 0.45, YB, zLt + lh + 0 + 60);
  if (hd > 0) { if (v.head_t === 'tri') { prismY(a, [[X0, Zp], [X1, Zp], [cx, Z1]], YF + D * 0.1, YB); prismY(a, [[X0 + 60, Zp], [X1 - 60, Zp], [cx, Z1 - 100]], YF, YF + D * 0.1); } else { const pts = [[X0, Zp]]; for (let k = 0; k <= 12; k++) { const t = (PI * k) / 12; pts.push([cx - (W / 2) * m.cos(t), Zp + hd * m.sin(t)]); } pts.push([X1, Zp]); prismY(a, pts, YF + D * 0.1, YB); } }
  const gx0 = cx - ow / 2, gx1 = cx + ow / 2;
  a.frame(gx0, z0o, gx1, zLt, YB - 260, YB - 170, 55); const zm = (z0o + zLt) / 2;
  a.box(gx0 + 55, YB - 230, z0o + 55, gx1 - 55, YB - 220, zLt - 55); a.box(gx0 + 55, YB - 265, zm - 25, gx1 - 55, YB - 170, zm + 25); a.box(cx - 20, YB - 265, z0o + 55, cx + 20, YB - 170, zLt - 55);
  a.rect(gx0, YB - 260, gx1, YB - 170, 'EQUIP-DETAIL'); a.rect(X0, YF + D * 0.1, X1, YB, 'EQUIP-DETAIL'); a.line(X0, YF + D * 0.1, X1, YF + D * 0.1, 'EQUIP-DETAIL');
  a.log('Added the sill on corbel blocks, the casing, a lintel' + (v.key ? ' with a keystone' : '') + (v.ears ? ', projecting ears' : '') + (hd > 0 ? ', a ' + (v.head_t === 'tri' ? 'triangular' : 'segmental') + ' pediment' : '') + ' and a framed double-hung sash with glass (plan and 3D).');
}
function mantel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, hd = v.hearth * IN, ys = YF + hd * 0.7, lw = v.leg * IN, oh = v.oh * IN, ow = W - 2 * lw, zo = Z0 + 80, zh = zo + oh, sh = 90, zs = zh + v.frieze * IN;
  a.outline();
  a.box(X0 + 20, YF, Z0, X1 - 20, YF + hd, Z0 + 80); a.line(X0 + 20, YF + hd, X1 - 20, YF + hd, 'EQUIP-DETAIL');
  for (const x of [X0, X1 - lw]) { a.box(x, ys, Z0, x + lw, YB, zs); a.box(x - 25, ys - 20, Z0, x + lw + 25, YB, Z0 + 240); a.box(x + lw * 0.2, ys - 20, Z0 + 260, x + lw * 0.8, ys, zs - 40); }
  a.box(cx - ow / 2, YB - 120, Z0 + 80, cx + ow / 2, YB, zh + 400); a.box(cx - ow / 2, ys + 60, Z0, cx + ow / 2, ys + 140, zo - 0.0);
  if (v.arch) { const R = ow / 2, ns = 18; for (let k = 0; k < ns; k++) { const xa = cx - R + (2 * R * k) / ns, xb = cx - R + (2 * R * (k + 1)) / ns, xm = (xa + xb) / 2, zb = zh - R * 0.5 + m.sqrt(m.max(0, R * R - (xm - cx) * (xm - cx))) * 0.5; if (zs - zb > 5) a.box(xa, ys, m.min(zb, zs - 5), xb, YB, zs); } }
  else a.box(cx - ow / 2, ys, zh, cx + ow / 2, YB, zs);
  if (v.insert) { a.frame(cx - ow / 2 + 20, zo, cx + ow / 2 - 20, zh - 40, ys + 80, ys + 160, 70); a.box(cx - ow / 2 + 90, ys + 100, zo + 600, cx + ow / 2 - 90, ys + 110, zh - 110); }
  const bx0 = cx - ow / 2 + (v.insert ? 110 : 0), bx1 = cx + ow / 2 - (v.insert ? 110 : 0);
  const ym = (ys + YB) / 2; a.box(bx0, ym - 150, zo, bx1, YB, zo + 40);
  for (let i = 0; i <= 6; i++) a.tube([[bx0 + ((bx1 - bx0) * i) / 6, ym - 100, zo + 40], [bx0 + ((bx1 - bx0) * i) / 6, ym - 100, zo + 340]], [9, 9], 5);
  a.xcyl(bx0, bx1, ym - 100, zo + 340, 10, 6); a.xcyl(bx0, bx1, ym - 100, zo + 130, 10, 6);
  for (let i = 0; i < 3; i++) a.xcyl(bx0 + (bx1 - bx0) * (0.22 + 0.3 * i), bx0 + (bx1 - bx0) * (0.52 + 0.3 * i), ym + i * 20 - 20, zo + 200 + (i % 2) * 40, 45, 8);
  a.box(X0, ys - 60, zs, X1, YB, zs + sh);
  if (v.corbels) for (const x of [X0 + 40, X1 - 40 - 110]) prismX(a, [[YB, zs], [ys - 60, zs], [ys - 60, zs - 120], [YB - 80, zs - 330]], x, x + 110);
  if (v.over) { const ow2 = W * 0.6; a.box(cx - ow2 / 2, YB - 120, zs + sh, cx + ow2 / 2, YB, Z1); a.frame(cx - ow2 / 2 + 60, zs + sh + 140, cx + ow2 / 2 - 60, Z1 - 140, ys + 250, ys + 330, 60); a.box(cx - ow2 / 2 + 120, ys + 270, zs + sh + 200, cx + ow2 / 2 - 120, ys + 285, Z1 - 200); a.box(cx - ow2 / 2 - 30, ys + 100, Z1 - 100, cx + ow2 / 2 + 30, YB, Z1); }
  a.rect(X0, ys, X1, YB, 'EQUIP-DETAIL'); a.rect(cx - ow / 2, ys, cx + ow / 2, YB, 'EQUIP-DETAIL');
  a.log('Added the hearth slab, two jambs on plinths, a ' + (v.arch ? 'masonry arched' : 'square') + ' opening' + (v.insert ? ' with an iron insert frame' : '') + ', a firebox with a grate and logs, a mantel shelf' + (v.corbels ? ' on corbels' : '') + (v.over ? ' and a framed overmantel' : '') + ' (plan and 3D).');
}
function entablatureBay(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, H = a.H, eh = v.ent * IN, zE = Z1 - eh, R = v.shaft * IN / 2, fh = eh * 0.42, zf = zE + eh * 0.33;
  a.outline();
  for (const x of [X0 + W * 0.14, X1 - W * 0.14]) {
    a.box(x - R * 1.4, cy - R * 1.4, Z0, x + R * 1.4, cy + R * 1.4, Z0 + 90);
    if (v.order === 'ionic') lathe(a, x, cy, Z0 + 90, [[0, R * 1.25], [60, R * 1.1], [90, R * 1.2], [140, R * 1.02]], 18);
    drum(a, x, cy, Z0 + 90 + (v.order === 'ionic' ? 140 : 0), zE - 160, R, 18);
    lathe(a, x, cy, zE - 160, [[0, R * 0.84], [50, R * 0.9], [90, R * 1.15], [130, R * 1.25]], 18); a.box(x - R * 1.4, cy - R * 1.4, zE - 30, x + R * 1.4, cy + R * 1.4, zE);
    if (v.order === 'ionic') for (const s of [-1, 1]) a.ycyl(cy - R * 1.2, cy + R * 1.2, x + s * R * 1.1, zE - 100, 70, 12);
    a.circ(x, cy, R, 'EQUIP-DETAIL');
  }
  a.box(X0, cy - R * 1.2, zE, X1, cy + R * 1.2, zE + eh * 0.33); a.box(X0 + 15, cy - R * 1.1, zE + eh * 0.33 - 0, X1 - 15, cy + R * 1.1, zE + eh * 0.33 + fh);
  if (v.order === 'doric') {
    const s = fh * 1.5, k = m.floor((W - 200) / s), x0 = X0 + (W - k * s) / 2;
    for (let i = 0; i < k; i++) { const xm = x0 + s * (i + 0.5), tw = fh * 0.55; for (let j = 0; j < 3; j++) a.box(xm - tw / 2 + (j * tw) / 3 + 3, cy - R * 1.1 - 30, zf, xm - tw / 2 + ((j + 1) * tw) / 3 - 3, cy - R * 1.1, zf + fh); for (let g = 0; g < 6; g++) a.cyl(xm - tw / 2 + (g + 0.5) * tw / 6, cy - R * 1.1 - 20, zf - 30, zf, 7, 5); a.line(xm - tw / 2, cy - R * 1.1, xm + tw / 2, cy - R * 1.1, 'EQUIP-DETAIL'); }
  } else { const k = m.floor(W / 80); a.box(X0, cy - R * 1.2, zE + eh * 0.75, X1, cy + R * 1.2, zE + eh * 0.82); for (let i = 0; i < k; i++) { const x = X0 + (W * (i + 0.5)) / k; a.box(x - 18, cy - R * 1.2 - 25, zE + eh * 0.75, x + 18, cy - R * 1.2, zE + eh * 0.82); } }
  a.box(X0 - 0, cy - R * 1.5, zE + eh * 0.82, X1, cy + R * 1.5, Z1);
  a.rect(X0, cy - R * 1.2, X1, cy + R * 1.2, 'EQUIP-DETAIL');
  a.log('Added two columns with bases and capitals under an entablature: architrave, a ' + (v.order === 'doric' ? 'frieze of triglyphs with guttae' : 'plain frieze with a dentil course') + ' and a projecting cornice (plan and 3D).');
}
function stoop(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, n = v.steps, up = a.H - 900, r = up / n, R = W / 2;
  a.outline();
  const rxi = (i) => R - ((R - 400) * i) / n, ryi = (i) => D - ((D - 380) * i) / n;
  const half = (rx, ry, k) => { const P = []; for (let i = 0; i <= k; i++) { const t = (PI * i) / k; P.push([cx + rx * m.cos(t), YB - ry * m.sin(t)]); } return P; };
  for (let i = 0; i < n; i++) { pr(a, half(rxi(i), ryi(i), 24), Z0, Z0 + r * (i + 1)); a.line(cx - rxi(i), YB, cx + rxi(i), YB, 'EQUIP-DETAIL'); }
  for (let i = 0; i < n; i++) { const P = half(rxi(i), ryi(i), 24); for (let k = 0; k < 24; k++) a.line(P[k][0], P[k][1], P[k + 1][0], P[k + 1][1], 'EQUIP-DETAIL'); }
  a.box(cx - 400, YB - 70, Z0 + up, cx + 400, YB, Z0 + up + 30);
  for (const s of [-1, 1]) { const px = cx + s * rxi(n - 1) * 0.85, py = YB - 200; a.box(px - 110, py - 110, Z0 + up, px + 110, py + 110, Z0 + up + 460); a.box(px - 135, py - 135, Z0 + up + 460, px + 135, py + 135, Z0 + up + 520); a.ell(px, py, Z0 + up + 640, 120, 120, 120, 12, 8); }
  a.log('Added ' + n + ' concentric half-round steps rising to a landing with a door threshold and two ball pedestals (plan and 3D).');
}
function gatePier(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, ps = v.pier * IN, H = a.H, px0 = X0, px1 = X0 + ps, pcx = X0 + ps / 2, wh = H * 0.42;
  a.outline();
  a.box(px0, YF, Z0, px1, YB, Z0 + H * 0.1); a.box(px0 + 25, YF + 25, Z0 + H * 0.1, px1 - 25, YB - 25, Z0 + H * 0.16);
  a.box(px0 + 50, YF + 50, Z0 + H * 0.16, px1 - 50, YB - 50, Z1 - H * 0.2 - H * 0.12);
  a.frame(px0 + 100, Z0 + H * 0.26, px1 - 100, Z1 - H * 0.42 - 0.01 + 0.4, YF + 30, YF + 50, 30);
  const zc = Z1 - H * 0.2 - H * 0.12; a.box(px0 + 25, YF + 25, zc, px1 - 25, YB - 25, zc + H * 0.04); a.box(px0, YF, zc + H * 0.04, px1, YB, zc + H * 0.1); a.box(px0 + 25, YF + 25, zc + H * 0.1, px1 - 25, YB - 25, zc + H * 0.12);
  const zt = zc + H * 0.12, cyc = cy;
  if (v.cap === 'ball') { a.ell(pcx, cyc, zt + ps * 0.4, ps * 0.4, ps * 0.4, ps * 0.4, 16, 10); a.cyl(pcx, cyc, zt, zt + 60, ps * 0.3, 12); }
  else if (v.cap === 'pyramid') pyramid(a, [[px0 + 25, YF + 25], [px1 - 25, YF + 25], [px1 - 25, YB - 25], [px0 + 25, YB - 25]], zt, [pcx, cyc, Z1]);
  else lathe(a, pcx, cyc, zt, [[0, ps * 0.3], [H * 0.02, ps * 0.34], [H * 0.05, ps * 0.2], [H * 0.09, ps * 0.2], [H * 0.14, ps * 0.4], [H * 0.2, ps * 0.4], [H * 0.24, ps * 0.2], [H * 0.27, ps * 0.26]], 14);
  a.box(px1, YF + D * 0.15, Z0, X1, YB - D * 0.15, wh); a.box(px1, YF + D * 0.1, wh, X1, YB - D * 0.1, wh + 80);
  for (const z of [Z0 + H * 0.3, Z0 + H * 0.62]) { a.box(px1, cyc - 15, z - 20, px1 + 110, cyc + 15, z + 20); a.ycyl(cyc - 30, cyc + 30, px1 + 90, z, 14, 8); }
  a.rect(px0 + 50, YF + 50, px1 - 50, YB - 50, 'EQUIP-DETAIL'); a.rect(px1, YF + D * 0.15, X1, YB - D * 0.15, 'EQUIP-DETAIL'); a.circ(pcx, cyc, ps * 0.3, 'EQUIP-DETAIL');
  a.log('Added the stepped base, a shaft with a raised panel, a stepped cap, a ' + (v.cap === 'ball' ? 'ball' : v.cap === 'pyramid' ? 'pyramid' : 'turned urn') + ' finial, hinge pintles and a coped wing wall (plan and 3D).');
}
function coffered(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, nx = v.nx, ny = v.ny, th = 100, dp = 180, zc = Z1 - th - dp, rw = 120;
  a.outline();
  a.box(X0, YF, Z1 - th, X1, YB, Z1);
  for (let i = 0; i <= nx; i++) { const x = X0 + rw / 2 + ((W - rw) * i) / nx; a.box(x - rw / 2, YF, zc, x + rw / 2, YB, Z1 - th); a.box(x - rw / 2 + 20, YF + 0, zc - 25, x + rw / 2 - 20, YB, zc); }
  for (let j = 0; j <= ny; j++) { const y = YF + rw / 2 + ((D - rw) * j) / ny; a.box(X0, y - rw / 2, zc, X1, y + rw / 2, Z1 - th); a.box(X0, y - rw / 2 + 20, zc - 25, X1, y + rw / 2 - 20, zc); }
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const x = X0 + rw / 2 + ((W - rw) * (i + 0.5)) / nx, y = YF + rw / 2 + ((D - rw) * (j + 0.5)) / ny; a.cyl(x, y, Z1 - th - 40, Z1 - th, m.min((W - rw) / nx, (D - rw) / ny) * 0.16, 12); a.circ(x, y, m.min((W - rw) / nx, (D - rw) / ny) * 0.16, 'EQUIP-DETAIL'); }
  const R = 130; for (const x of [X0 + 220, X1 - 220]) for (const y of [YF + 220, YB - 220]) { a.box(x - R * 1.3, y - R * 1.3, Z0, x + R * 1.3, y + R * 1.3, Z0 + 70); drum(a, x, y, Z0 + 70, zc - 160, R, 14); a.box(x - R * 1.4, y - R * 1.4, zc - 160, x + R * 1.4, y + R * 1.4, zc); a.circ(x, y, R, 'EQUIP-DETAIL'); }
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.log('Added a ' + nx + ' by ' + ny + ' grid of coffers between moulded ribs, a rosette in each coffer, the top slab and four columns on bases (plan and 3D).');
}
const DET = [
  fam({ cat: 'architecture/details', title: 'Generic wall pilaster', desc: (v) => `Pilaster projecting from a wall: plinth and moulded base, ${v.type === 'engaged' ? 'a round half-engaged shaft with entasis' : v.type === 'fluted' ? 'a shaft with five raised flutes' : 'a plain square shaft'}, a capital and an abacus.`,
    vs: [['flat Tuscan, 12 in, 96 in', 12, 4, 96, 0, { type: 'flat' }], ['fluted, 16 in, 120 in', 16, 5, 120, 0, { type: 'fluted' }], ['engaged half column, 20 in, 132 in', 20, 16, 132, 0, { type: 'engaged' }]],
    build: pilaster }),
  fam({ cat: 'architecture/details', title: 'Generic timber post and braces', desc: (v) => `Square timber post on a stone pad with a steel shoe, a head beam with a bearing cap and ${v.braces === 4 ? 'four' : 'two'} angled braces with pegs.`,
    vs: [['6 x 6 in post, 96 in, two braces', 60, 12, 96, 0, { post: 6, beam: 8, brace: 18, braces: 2 }], ['8 x 8 in post, 120 in, four braces', 84, 48, 120, 0, { post: 8, beam: 10, brace: 24, braces: 4 }], ['10 x 10 in post, 144 in, long braces', 108, 24, 144, 0, { post: 10, beam: 12, brace: 30, braces: 2 }]],
    build: timberPost }),
  fam({ cat: 'architecture/details', title: 'Generic wall niche', desc: (v) => `Wall block with a recessed niche: sill ledge, ${v.head === 'shell' ? 'half-round head with radiating shell ribs' : 'half-round head'} and an urn standing inside.`,
    vs: [['round head, 24 in opening, 84 in block', 48, 14, 84, 0, { ow: 24, head: 'round', straight: 24 }], ['shell head, 30 in opening, 96 in block', 54, 16, 96, 0, { ow: 30, head: 'shell', straight: 30 }]],
    build: niche }),
  fam({ cat: 'architecture/details', title: 'Generic quoined corner', desc: 'Wall corner with alternating long and short dressed quoin stones on both faces over recessed walls.',
    vs: [['dressed, 24 in, 96 in tall', 24, 24, 96, 0, { t: 8, course: 12, long: 14 }], ['fine, 18 in, 72 in tall', 18, 18, 72, 0, { t: 6, course: 9, long: 11 }], ['heavy, 30 in, 120 in tall', 30, 30, 120, 0, { t: 10, course: 15, long: 18 }]],
    build: quoins }),
  fam({ cat: 'architecture/details', title: 'Generic gate finial', desc: (v) => `Stone finial on a stepped plinth: ${v.type === 'ball' ? 'a turned neck, sphere and spike' : v.type === 'urn' ? 'a turned urn with handles and a flame' : 'a tapering four-sided obelisk with a pyramid tip'}.`,
    vs: [['ball, 18 in', 12, 12, 18, 0, { type: 'ball' }], ['urn, 30 in', 14, 14, 30, 0, { type: 'urn' }], ['obelisk, 42 in', 14, 14, 42, 0, { type: 'obelisk' }]],
    build: finial }),
  fam({ cat: 'architecture/details', title: 'Generic bracketed eaves cornice', desc: (v) => `Cornice on a wall panel: bed moulding, a band of ${v.type === 'dentil' ? 'dentil blocks' : 'scrolled modillion brackets'}, a projecting corona and a crown moulding.`,
    vs: [['dentil, 8 in tall, 48 in', 48, 8, 8, 96, { type: 'dentil' }], ['dentil, 12 in tall, 72 in', 72, 12, 12, 96, { type: 'dentil' }], ['modillion, 16 in tall, 72 in', 72, 16, 16, 96, { type: 'modillion' }]],
    build: dentil }),
  fam({ cat: 'architecture/details', title: 'Generic doorcase surround', desc: (v) => `Door surround with plinths, pilasters and an entablature, ${v.type === 'hood' ? 'a flat hood on two console brackets' : v.type === 'tri' ? 'a triangular pediment' : v.type === 'seg' ? 'a segmental pediment' : 'a broken pediment with an urn'} and a four-panel door leaf.`,
    vs: [['triangular pediment, 48 x 108 in', 48, 14, 108, 0, { type: 'tri', pil: 7, ph: 14, ent: 9 }], ['segmental pediment, 54 x 114 in', 54, 14, 114, 0, { type: 'seg', pil: 8, ph: 14, ent: 9 }], ['flat hood on brackets, 42 x 100 in', 42, 16, 100, 0, { type: 'hood', pil: 6, ph: 0, ent: 14 }], ['broken pediment with urn, 60 x 126 in', 60, 16, 126, 0, { type: 'broken', pil: 8, ph: 22, ent: 10 }]],
    build: doorSurround }),
  fam({ cat: 'architecture/details', title: 'Generic window casing and head', desc: (v) => `Window casing on a corbelled sill with a lintel${v.key ? ' and keystone' : ''}${v.ears ? ', projecting ears' : ''}${v.head > 0 ? ', a ' + (v.head_t === 'tri' ? 'triangular' : 'segmental') + ' pediment' : ''} and a double-hung sash with glass.`,
    vs: [['keystone and sill, 36 x 72 in', 36, 10, 72, 0, { cw: 6, lintel: 10, head: 0, key: true }], ['triangular pediment, 40 x 84 in', 40, 12, 84, 0, { cw: 6, lintel: 8, head: 10, head_t: 'tri' }], ['segmental pediment with ears, 44 x 90 in', 44, 12, 90, 0, { cw: 7, lintel: 8, head: 10, head_t: 'seg', ears: true, key: true }]],
    build: windowSurround }),
  fam({ cat: 'architecture/details', title: 'Generic mantelpiece and hearth', desc: (v) => `Hearth slab, two jambs on plinths, a ${v.arch ? 'masonry arched' : 'square'} opening${v.insert ? ' with an iron insert frame' : ''}, a grate with logs, a mantel shelf${v.corbels ? ' on corbels' : ''}${v.over ? ' and a framed overmantel' : ''}.`,
    vs: [['timber, corbels, 60 x 54 in', 60, 22, 54, 0, { hearth: 14, leg: 9, oh: 32, frieze: 8, corbels: true }], ['masonry arch, overmantel, 72 x 84 in', 72, 24, 84, 0, { hearth: 16, leg: 12, oh: 34, frieze: 8, arch: true, over: true }], ['iron insert in surround, 54 x 46 in', 54, 20, 46, 0, { hearth: 12, leg: 8, oh: 28, frieze: 6, insert: true }]],
    build: mantel }),
  fam({ cat: 'architecture/details', title: 'Generic colonnade bay entablature', desc: (v) => `Two columns with bases and capitals under an entablature: architrave, a ${v.order === 'doric' ? 'frieze of triglyphs with guttae' : 'plain frieze with a dentil course'} and a projecting cornice.`,
    vs: [['Doric, 72 in bay', 72, 20, 96, 0, { order: 'doric', ent: 22, shaft: 12 }], ['Doric, 120 in bay', 120, 28, 150, 0, { order: 'doric', ent: 32, shaft: 18 }], ['Ionic, 96 in bay', 96, 24, 126, 0, { order: 'ionic', ent: 26, shaft: 14 }]],
    build: entablatureBay }),
  fam({ cat: 'architecture/details', title: 'Generic round entrance stoop', desc: (v) => `Concentric half-round steps (${v.steps}) rising to a landing with a door threshold and two ball pedestals.`,
    vs: [['3 steps, 96 in wide', 96, 48, 40, 0, { steps: 3 }], ['4 steps, 120 in wide', 120, 60, 48, 0, { steps: 4 }]],
    build: stoop }),
  fam({ cat: 'architecture/details', title: 'Generic gate pier with wing wall', desc: (v) => `Gate pier on a stepped base with a panelled shaft, a stepped cap, a ${v.cap === 'ball' ? 'ball' : v.cap === 'pyramid' ? 'pyramid' : 'turned urn'} finial, hinge pintles and a coped wing wall.`,
    vs: [['ball cap, 18 in sq, 72 in', 42, 18, 72, 0, { pier: 18, cap: 'ball' }], ['pyramid cap, 24 in sq, 84 in', 52, 24, 84, 0, { pier: 24, cap: 'pyramid' }], ['urn cap, 30 in sq, 108 in', 66, 30, 108, 0, { pier: 30, cap: 'urn' }]],
    build: gatePier }),
  fam({ cat: 'architecture/details', title: 'Generic coffered ceiling bay', desc: (v) => `${v.nx} by ${v.ny} grid of coffers between moulded ribs with a rosette in each, a top slab and four columns on bases.`,
    vs: [['3 x 3 coffers, 72 in square', 72, 72, 120, 0, { nx: 3, ny: 3 }], ['4 x 4 coffers, 96 in square', 96, 96, 132, 0, { nx: 4, ny: 4 }], ['2 x 4 coffers, 60 x 120 in', 120, 60, 120, 0, { nx: 4, ny: 2 }]],
    build: coffered }),
];

// ================================================================================== MASSING
/** glazed facets along an open plan chain P (inward side toward the centre of P): sill and head rails, glass, mullions at the vertices */
function facets(a, P, zs, zh, th) {
  const cen = [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  for (let i = 0; i < P.length - 1; i++) {
    const p = P[i], q = P[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], L = m.hypot(dx, dy);
    let nx = -dy / L, ny = dx / L; if ((cen[0] - p[0]) * nx + (cen[1] - p[1]) * ny < 0) { nx = -nx; ny = -ny; }
    const Q = (o0, o1, z0, z1) => pr(a, [[p[0] + nx * o0, p[1] + ny * o0], [q[0] + nx * o0, q[1] + ny * o0], [q[0] + nx * o1, q[1] + ny * o1], [p[0] + nx * o1, p[1] + ny * o1]], z0, z1);
    Q(0, th, zs, zs + 50); Q(0, th, zh - 50, zh); Q(th / 2 - 4, th / 2 + 4, zs + 50, zh - 50);
    const k = m.max(1, m.round(L / 800)); for (let j = 1; j < k; j++) { const x = p[0] + (dx * j) / k + (nx * th) / 2, y = p[1] + (dy * j) / k + (ny * th) / 2; a.box(x - 18, y - 18, zs + 50, x + 18, y + 18, zh - 50); }
  }
  for (const p of P) a.box(p[0] - 35, p[1] - 35, zs, p[0] + 35, p[1] + 35, zh);
}
function cylTower(a, v) {
  const { Z0, Z1, W, D, cx, cy } = a, fl = v.floor * IN, n = v.floors, R0 = m.min(W, D) / 2 - 30, R1 = R0 * v.taper, top = Z0 + n * fl, rz = (z) => R0 + (R1 - R0) * ((z - Z0) / (n * fl));
  a.outline('EQUIP-DETAIL');
  a.cyl(cx, cy, Z0, Z0 + 300, R0 * 1.03, 28); a.tube([[cx, cy, Z0 + 300], [cx, cy, top]], [R0 * 0.96, R1 * 0.96], 28);
  for (let f = 1; f <= n; f++) { const z = Z0 + f * fl; a.cyl(cx, cy, z - 45, z + 45 > top ? top : z + 45, rz(z) * 1.03, 28); }
  const nf = 24; for (let k = 0; k < nf; k++) { const th = (2 * PI * k) / nf; a.tube([[cx + R0 * 1.0 * m.cos(th), cy + R0 * 1.0 * m.sin(th), Z0 + 300], [cx + R1 * 1.0 * m.cos(th), cy + R1 * 1.0 * m.sin(th), top - 45]], [16, 16], 5); }
  a.cyl(cx, cy, top, top + 450, R1 * 0.9, 28); a.cyl(cx, cy, top + 450, Z1 - 1800 > top + 450 ? top + 1800 : top + 900, R1 * 0.45, 16); a.cone(cx, cy, top + 900 > Z1 ? Z1 - 200 : top + 900, Z1, 30, 8, 8);
  a.box(cx - 800, cy - R0 - 0, Z0, cx + 800, cy - R0 + 400, Z0 + 420);
  for (const f of [0.5, 0.75, 1]) a.circ(cx, cy, R0 * (1 + (v.taper - 1) * 0) * f, 'EQUIP-DETAIL'); a.circ(cx, cy, R1, 'EQUIP-DETAIL');
  for (let k = 0; k < 12; k++) { const th = (2 * PI * k) / 12; a.line(cx + R1 * m.cos(th), cy + R1 * m.sin(th), cx + R0 * m.cos(th), cy + R0 * m.sin(th), 'EQUIP-DETAIL'); }
  a.log('Added a round ' + n + '-storey tower' + (v.taper < 1 ? ' tapering to ' + m.round(v.taper * 100) + ' percent' : '') + ' with floor bands, 24 vertical fins, an entrance canopy, a roof plant drum and a mast (plan and 3D).');
}
function pilotisSlab(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, fl = 144 * IN, gh = v.ground * IN, n = v.floors, top = Z0 + gh + n * fl, nc = v.cols;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 30);
  for (const y of [YF + D * 0.28, YB - D * 0.28]) for (let i = 0; i < nc; i++) { const x = X0 + 300 + ((W - 600) * i) / (nc - 1); a.cyl(x, y, Z0 + 30, Z0 + gh, 260, 14); a.circ(x, y, 260, 'EQUIP-DETAIL'); }
  a.box(X0, YF, Z0 + gh - 250, X1, YB, Z0 + gh);
  a.box(cx - W * 0.06, YF + 200, Z0 + 30, cx + W * 0.06, YB - 200, Z0 + gh - 250); a.rect(cx - W * 0.06, YF + 200, cx + W * 0.06, YB - 200, 'EQUIP-DETAIL');
  a.box(X0 + 20, YF + 260, Z0 + gh, X1 - 20, YB - 260, top);
  for (let f = 0; f <= n; f++) { const z = Z0 + gh + f * fl; a.box(X0, YF, z - 40 < Z0 + gh - 250 ? Z0 + gh - 250 : z - 40, X1, YB, m.min(z + 40, top)); }
  const nb = m.round(W / 1500);
  for (let f = 0; f < n; f++) for (let b = 0; b < nb; b++) { const x0 = X0 + 150 + ((W - 300) * b) / nb + 120, x1 = X0 + 150 + ((W - 300) * (b + 1)) / nb - 120, z = Z0 + gh + f * fl; { a.box(x0, YF + 80, z + 500, x1, YF + 260, z + fl - 550); a.box(x0, YB - 260, z + 500, x1, YB - 80, z + fl - 550); a.box(x0 - 40, YF + 40, z + 440, x1 + 40, YF + 80, z + 500); } }
  a.box(X0, YF, top, X1, YB, top + 300); a.box(X0 + 80, YF + 80, top + 300, X0 + 80 + W * 0.25, YB - 80, top + 1500);
  a.rect(X0 + 20, YF + 260, X1 - 20, YB - 260, 'EQUIP-DETAIL');
  a.log('Added ' + nc * 2 + ' round columns under a raised ' + n + '-storey slab block, a central core, floor bands, window bays on both long faces, a roof parapet and a plant room (plan and 3D).');
}
function terraced(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, fl = 144 * IN, sb = v.setback * IN, n = v.floors;
  a.outline();
  for (let f = 0; f < n; f++) {
    const y0 = YF + f * sb, z = Z0 + f * fl, zt = z + fl;
    a.box(X0, y0 + 220, z, X1, YB, zt - 40); a.box(X0 - 0, y0, zt - 40, X1, YB, zt);
    const nb = m.round(W / 1200); for (let b = 0; b < nb; b++) { const x0 = X0 + 100 + ((W - 200) * b) / nb + 100, x1 = X0 + 100 + ((W - 200) * (b + 1)) / nb - 100; a.box(x0, y0 + 60, z + 450, x1, y0 + 220, zt - 650); a.box(x0 - 60, y0 + 30, zt - 700, x1 + 60, y0 + 220, zt - 650); }
    if (f < n - 1) {
      const yt = y0 + sb;
      a.box(X0, y0, zt, X1, y0 + 160, zt + 300); a.box(X0 + 100, y0 + 40, zt + 300, X1 - 100, y0 + 160, zt + 600);
      for (let i = 0; i <= m.round(W / 1200); i++) a.cyl(X0 + 60 + ((W - 120) * i) / m.round(W / 1200), y0 + 20, zt, zt + 1000, 16, 6);
      a.tube([[X0 + 60, y0 + 20, zt + 1000], [X1 - 60, y0 + 20, zt + 1000]], [20, 20], 8);
      a.line(X0, y0, X1, y0, 'EQUIP-DETAIL');
    }
  }
  const zt = Z0 + n * fl, yt = YF + (n - 1) * sb;
  a.box(X0, yt, zt, X1, YB, zt + 300);
  if (v.pergola) { for (const x of [X0 + 300, cx, X1 - 300]) for (const y of [yt + 300, YB - 300]) a.box(x - 60, y - 60, zt + 300, x + 60, y + 60, zt + 2600); for (let i = 0; i < 9; i++) a.box(X0 + 200 + ((W - 400) * i) / 8 - 40, yt + 240, zt + 2600, X0 + 200 + ((W - 400) * i) / 8 + 40, YB - 240, zt + 2700); a.box(X0 + 200, yt + 240, zt + 2700, X1 - 200, yt + 340, zt + 2800); a.box(X0 + 200, YB - 340, zt + 2700, X1 - 200, YB - 240, zt + 2800); a.rect(X0 + 200, yt + 240, X1 - 200, YB - 240, 'EQUIP-DETAIL'); }
  else a.box(X0 + 100, YB - 1500, zt + 300, X0 + 100 + W * 0.2, YB - 100, zt + 1700);
  for (let f = 1; f < n; f++) a.line(X0, YF + f * sb, X1, YF + f * sb, 'EQUIP-DETAIL');
  a.log('Added ' + n + ' floors each set back ' + v.setback + ' in from the one below, with floor bands, window bays on the front, planter and rail edges on each terrace' + (v.pergola ? ' and a timber pergola on the top terrace' : ' and a roof stair housing') + ' (plan and 3D).');
}
function chapel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, bw = v.nave * IN, tw = bw * 0.55, td = v.tower ? tw : 0, wh = v.wall * IN, rr = v.rise * IN, ar = v.apse ? bw / 2 : 0, bt = 450;
  const yN0 = YF + td, yN1 = YB - ar, nx0 = cx - bw / 2, nx1 = cx + bw / 2;
  a.outline('EQUIP-DETAIL');
  a.box(nx0, yN0, Z0, nx1, yN1, Z0 + wh); prismY(a, [[nx0, Z0 + wh], [nx1, Z0 + wh], [cx, Z0 + wh + rr]], yN0, yN1);
  a.box(nx0 - 20, yN0, Z0 + wh - 30, nx0 + 0, yN1, Z0 + wh);
  const nbut = m.max(3, m.round((yN1 - yN0) / 3000));
  for (let i = 0; i <= nbut; i++) { const y = yN0 + 200 + ((yN1 - yN0 - 400) * i) / nbut; for (const x0 of [nx0 - bt, nx1]) prismX(a, [[y - 160, Z0], [y + 160, Z0], [y + 160, Z0 + wh * 0.55], [y - 160, Z0 + wh * 0.8]], x0, x0 + bt); a.rect(nx0 - bt, y - 160, nx0, y + 160, 'EQUIP-DETAIL'); a.rect(nx1, y - 160, nx1 + bt, y + 160, 'EQUIP-DETAIL'); }
  for (let i = 0; i < nbut; i++) { const y = yN0 + 200 + ((yN1 - yN0 - 400) * (i + 0.5)) / nbut, ww = 550, wz0 = Z0 + wh * 0.3, wz1 = Z0 + wh * 0.72; for (const [xa, xb] of [[nx0 - 25, nx0 + 5], [nx1 - 5, nx1 + 25]]) prismX(a, [[y - ww / 2, wz0], [y + ww / 2, wz0], [y + ww / 2, wz1], [y, wz1 + ww * 0.95], [y - ww / 2, wz1]], xa, xb); }
  if (v.apse) { const P = []; for (let k = 0; k <= 10; k++) { const t = (PI * k) / 10; P.push([cx + ar * m.cos(t), yN1 + ar * m.sin(t)]); } pr(a, P, Z0, Z0 + wh); pyramid(a, P, Z0 + wh, [cx, yN1 + ar * 0.3, Z0 + wh + rr * 0.8]); a.arc(cx, yN1, ar, 0, 180, 'EQUIP'); }
  if (v.tower) {
    const tz = Z0 + wh + rr * 1.1 + 1400, tx0 = cx - tw / 2, tx1 = cx + tw / 2;
    a.box(tx0, YF, Z0, tx1, YF + td, tz); for (const z of [Z0 + wh * 0.5, Z0 + wh + rr * 0.8, tz - 1000]) a.box(tx0 - 30, YF - 30, z, tx1 + 30, YF + td + 30, z + 80);
    prismY(a, [[cx - 500, Z0], [cx + 500, Z0], [cx + 500, Z0 + 2400], [cx, Z0 + 3300], [cx - 500, Z0 + 2400]], YF - 30, YF + 30);
    a.box(cx - 330, YF - 20, Z0 + 2400 + 1100, cx + 330, YF, Z0 + 2400 + 1700); a.cyl(cx, YF - 10, Z0 + wh * 0.8 + 400, Z0 + wh * 0.8 + 400 + 1, 1, 6);
    for (const s of [0, 1]) for (const [fx, fy] of [[tx0, YF], [tx1, YF]]) a.box(fx + (fx === tx0 ? -250 : 0), fy - 250, Z0, fx + (fx === tx0 ? 0 : 250), fy, tz - 1500);
    for (const k of [0, 1, 2, 3]) { const side = k % 2, ax = side ? tx1 : tx0; if (k < 2) prismY(a, [[cx - 260 + (k ? 0 : 0), tz - 1000 + 150], [cx + 260, tz - 1000 + 150], [cx + 260, tz - 350], [cx, tz - 350 + 0 + 200], [cx - 260, tz - 350]], YF - 20, YF + 10); }
    pyramid(a, [[tx0, YF], [tx1, YF], [tx1, YF + td], [tx0, YF + td]], tz, [cx, YF + td / 2, Z1]);
    a.rect(tx0, YF, tx1, YF + td, 'EQUIP-DETAIL');
  } else { a.box(cx - 450, yN0 - 60, Z0 + wh + rr - 300, cx + 450, yN0 + 120, Z0 + wh + rr + 900); prismY(a, [[cx - 450, Z0 + wh + rr + 900], [cx + 450, Z0 + wh + rr + 900], [cx, Z0 + wh + rr + 1600]], yN0 - 60, yN0 + 120); a.ycyl(yN0 - 70, yN0 + 130, cx, Z0 + wh + rr + 350, 150, 12); prismY(a, [[cx - 400, Z0], [cx + 400, Z0], [cx + 400, Z0 + 2200], [cx, Z0 + 2900], [cx - 400, Z0 + 2200]], yN0 - 20, yN0 + 10); }
  a.rect(nx0, yN0, nx1, yN1, 'EQUIP-DETAIL'); a.line(cx, yN0, cx, yN1, 'EQUIP-DETAIL');
  a.log('Added the nave with a gabled roof, buttresses and pointed side windows' + (v.apse ? ', a semicircular apse with a conical roof' : '') + (v.tower ? ', and a front tower with a belfry stage, a pointed door and a pyramid spire' : ', and a front bell gable with a pointed door') + ' (plan and 3D).');
}
function rotunda(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, R = W / 2, cy = YB - R, Rd = R * v.drum, dh = v.dh * IN, ps = v.portico ? D - W : 0;
  a.outline('EQUIP-DETAIL');
  a.cyl(cx, cy, Z0, Z0 + 150, R * 0.98, 32); a.cyl(cx, cy, Z0 + 150, Z0 + 300, R * 0.93, 32);
  a.cyl(cx, cy, Z0 + 300, Z0 + 300 + dh, Rd, 32);
  const zE = Z0 + 300 + dh;
  if (v.ring) { const nc = 16, rc = Rd + (R * 0.93 - Rd) * 0.55; for (let k = 0; k < nc; k++) { const th = (2 * PI * k) / nc; const x = cx + rc * m.cos(th), y = cy + rc * m.sin(th); drum(a, x, y, Z0 + 300, zE - 120, 90, 10); a.box(x - 130, y - 130, zE - 120, x + 130, y + 130, zE); a.circ(x, y, 90, 'EQUIP-DETAIL'); } a.cyl(cx, cy, zE - 0, zE + 280, rc + 160, 32); }
  else { for (let k = 0; k < 8; k++) { const th = (2 * PI * k) / 8 + PI / 8; a.box(cx + Rd * m.cos(th) - 40, cy + Rd * m.sin(th) - 40, Z0 + 300 + dh * 0.25, cx + Rd * m.cos(th) + 40, cy + Rd * m.sin(th) + 40, Z0 + 300 + dh * 0.75); } a.cyl(cx, cy, zE, zE + 220, Rd * 1.05, 32); }
  const zd = zE + (v.ring ? 280 : 220), rd = (Z1 - zd) - 1200;
  const pr2 = []; for (let k = 0; k <= 9; k++) { const t = (k / 9) * (PI / 2) * 0.99; pr2.push([rd * m.sin(t), Rd * (v.ring ? 0.92 : 1.0) * m.cos(t) + 8]); } lathe(a, cx, cy, zd, pr2, 32);
  a.cyl(cx, cy, zd + rd - 40, zd + rd + 500, Rd * 0.16, 14); a.cone(cx, cy, zd + rd + 500, Z1 - 120, Rd * 0.19, Rd * 0.06, 14); a.ell(cx, cy, Z1 - 80, 80, 80, 80, 10, 6);
  for (let k = 1; k < 8; k++) { const th = (PI * k) / 8; a.tube([[cx + Rd * 0.9 * m.cos(th), cy + Rd * 0.9 * m.sin(th), zd + 20], [cx, cy, zd + rd]], [10, 10], 4); }
  if (v.portico) { const pw = R * 0.9, py0 = YF, py1 = YF + ps + 400; a.box(cx - pw, py0, Z0, cx + pw, py1, Z0 + 300); for (let i = 0; i < 4; i++) { const x = cx - pw * 0.8 + (pw * 1.6 * i) / 3; drum(a, x, py0 + 380, Z0 + 300, zE - 150, 120, 12); a.box(x - 160, py0 + 380 - 160, zE - 150, x + 160, py0 + 380 + 160, zE); a.circ(x, py0 + 380, 120, 'EQUIP-DETAIL'); } a.box(cx - pw, py0 + 160, zE, cx + pw, py1, zE + 360); prismY(a, [[cx - pw, zE + 360], [cx + pw, zE + 360], [cx, zE + 360 + pw * 0.3]], py0 + 160, py1); }
  a.circ(cx, cy, Rd, 'EQUIP'); a.circ(cx, cy, Rd * 0.2, 'EQUIP-DETAIL');
  a.log('Added the stepped base, a drum' + (v.ring ? ' ringed by 16 columns under an entablature' : ' with pilaster strips') + ', a ribbed dome with a lantern' + (v.portico ? ' and a four-column portico with a pediment' : '') + ' (plan and 3D).');
}
function warehouse(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, wh = v.wall * IN, dk = 1200, n = v.docks, ow = v.office ? 2200 : 0, zr = Z0 + dk + wh;
  a.outline();
  a.box(X0, YF, Z0, X1, YF + 300, Z0 + 120); a.box(X0, YF + 300, Z0, X1, YB, Z0 + dk); a.box(X0 - 0, YF + 300, Z0 + dk, X1, YB, zr);
  if (v.roof === 'flat') { a.box(X0, YF, zr, X1, YB, Z1); a.box(X0 + 80, YF + 80, Z1, X1 - 80, YB - 80, Z1 + 0.01); } else { prismX(a, [[YF, zr], [YB, zr], [YB, Z1], [(YF + YB) / 2, Z1], [YF, zr + (Z1 - zr) * 0.3]].slice(0, 4), X0, X1); a.line(X0, YB, X1, YB, 'EQUIP-DETAIL'); }
  const aw = W - ow - 400, dw = aw / n;
  for (let i = 0; i < n; i++) {
    const dcx = X0 + ow + 200 + (i + 0.5) * dw, hwid = m.min(dw * 0.4, 1500), x0 = dcx - hwid, x1 = dcx + hwid, dz = 3000 > wh - 300 ? wh - 400 : 3000;
    a.frame(x0 - 40, Z0 + dk - 20, x1 + 40, Z0 + dk + dz + 40, YF + 180, YF + 300, 130);
    for (let k = 0; k < 6; k++) a.box(x0, YF + 230, Z0 + dk + k * (dz / 6) + 8, x1, YF + 290, Z0 + dk + (k + 1) * (dz / 6) - 8);
    a.box(x0 + 200, YF + 120, Z0 + dk - 900, x1 - 200, YF + 300, Z0 + dk - 20); a.box(x0 - 30, YF + 200, Z0 + dk - 1050, x0 + 160, YF + 300, Z0 + dk - 650); a.box(x1 - 160, YF + 200, Z0 + dk - 1050, x1 + 30, YF + 300, Z0 + dk - 650);
    a.box(x0 - 60, YF + 20, Z0 + dk + dz + 300, x1 + 60, YF + 300, Z0 + dk + dz + 380); a.box((x0 + x1) / 2 - 100, YF + 220, Z0 + dk + dz + 100, (x0 + x1) / 2 + 100, YF + 300, Z0 + dk + dz + 200);
    a.rect(x0, YF + 180, x1, YF + 300, 'EQUIP-DETAIL'); a.rect(x0 + 200, YF + 120, x1 - 200, YF + 300, 'EQUIP-DETAIL');
  }
  if (v.office) { const oz = Z0 + dk + 2 * 3300 - 300; a.box(X0, YF - 0.0, Z0 + dk, X0 + ow, YF + 1000 > YB ? YB : YF + 1400, oz); for (let f = 0; f < 2; f++) a.box(X0 + 200, YF + 6, Z0 + dk + 700 + f * 3000, X0 + ow - 200, YF + 40, Z0 + dk + 2300 + f * 3000 > oz - 300 ? oz - 300 : Z0 + dk + 2300 + f * 3000); a.box(X0, YF, oz, X0 + ow, YF + 1400, oz + 150); }
  a.box(X1 - 1200, YF + 200, Z0 + dk, X1 - 200, YF + 300, Z0 + dk + 2200);
  for (let i = 1; i < 6; i++) a.line(X0 + (W * i) / 6, YF, X0 + (W * i) / 6, YB, 'EQUIP-DETAIL');
  a.log('Added the dock-height plinth, ' + n + ' sectional dock doors with frames, bumpers and canopies, ' + (v.office ? 'a two-storey office block at the corner, ' : '') + 'a side door and a ' + (v.roof === 'flat' ? 'flat roof' : 'pitched roof') + ' (plan and 3D).');
}
function lBlock(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, fl = 144 * IN, n = v.floors, ww = v.wing * IN, top = Z0 + n * fl;
  const rects = v.shape === 'U' ? [[X0, YB - ww, X1, YB], [X0, YF, X0 + ww, YB - ww], [X1 - ww, YF, X1, YB - ww]] : [[X0, YB - ww, X1, YB], [X0, YF, X0 + ww, YB - ww]];
  a.outline('EQUIP-DETAIL');
  for (const [x0, y0, x1, y1] of rects) {
    a.box(x0 + 300, y0 + 300, Z0, x1 - 300, y1 - 300, top); a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL');
    for (let f = 1; f <= n; f++) a.box(x0 - 0, y0, Z0 + f * fl - 40, x1, y1, m.min(Z0 + f * fl + 40, top + 40 > Z1 ? Z1 : top + 40));
    a.box(x0, y0, top, x1, y1, top + 220);
    const wn = (xa, ya, xb, yb, ax) => { const L = ax === 'x' ? xb - xa : yb - ya, k = m.max(1, m.round(L / 1500)); for (let f = 0; f < n; f++) for (let b = 0; b < k; b++) { const f0 = (b + 0.2) / k, f1 = (b + 0.8) / k, z = Z0 + f * fl + 480; if (ax === 'x') a.box(xa + L * f0, yb - 0, z, xa + L * f1, yb + 0 + 0.01 + 0, z + 1400); } };
    const k1 = m.max(1, m.round((x1 - x0) / 1500)), k2 = m.max(1, m.round((y1 - y0) / 1500));
    for (let f = 0; f < n; f++) { const z = Z0 + f * fl + 480; for (let b = 0; b < k1; b++) { const xa = x0 + ((x1 - x0) * (b + 0.2)) / k1, xb = x0 + ((x1 - x0) * (b + 0.8)) / k1; a.box(xa, y0, z, xb, y0 + 300, z + 1400); a.box(xa, y1 - 300, z, xb, y1, z + 1400); } for (let b = 0; b < k2; b++) { const ya = y0 + ((y1 - y0) * (b + 0.2)) / k2, yb = y0 + ((y1 - y0) * (b + 0.8)) / k2; a.box(x0, ya, z, x0 + 300, yb, z + 1400); a.box(x1 - 300, ya, z, x1, yb, z + 1400); } }
  }
  const ex = v.shape === 'U' ? cx : X0 + ww / 2; a.box(ex - 700, YB - ww - 5, Z0, ex + 700, YB - ww + 0.01 + 5, Z0 + 1) ;
  a.box(cx - 900, YB - ww - 700 > YF ? YB - ww - 700 : YF, Z0 + 2600, cx + 900, YB - ww, Z0 + 2800);
  a.box(X0, YF, Z0, X1, YB, Z0 + 0.01 + 0);
  a.log('Added ' + rects.length + ' wings of ' + n + ' floors around a ' + (v.shape === 'U' ? 'courtyard open to the front' : 'corner court') + ', with floor bands, window bays on every face, roof parapets and an entrance canopy (plan and 3D).');
}
function viaduct(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, n = v.n, pw = v.pier * IN, sp = (W - (n + 1) * pw) / n, R = sp / 2, zs = Z0 + v.spring * IN, zdk = Z1 - 360, ph = 300;
  a.outline();
  const slice = (xa, xb, zb) => { if (zdk - zb > 5) a.box(xa, YF, zb, xb, YB, zdk); };
  for (let i = 0; i <= n; i++) { const x0 = X0 + i * (pw + sp); slice(x0, x0 + pw, Z0); a.box(x0 - 30, YF - 0, Z0, x0 + pw + 30, YB, Z0 + 200); if (i > 0 && i < n) { a.box(x0 + pw * 0.2, YF, zs, x0 + pw * 0.8, YB, zdk); } }
  for (let i = 0; i < n; i++) {
    const xs = X0 + pw + i * (pw + sp), c = xs + R, ns = 14;
    for (let k = 0; k < ns; k++) { const xa = xs + (sp * k) / ns, xb = xs + (sp * (k + 1)) / ns, xm = (xa + xb) / 2, zb = zs + m.sqrt(m.max(0, R * R - (xm - c) * (xm - c))); slice(xa, xb, zb); }
    slice(xs, xs + sp, zs);
    const pts = []; for (let k = 0; k <= 16; k++) { const t = PI - (PI * k) / 16; pts.push([c + R * m.cos(t), YF + 15, zs + R * m.sin(t)]); } a.tube(pts, pts.map(() => 22), 6);
    a.line(xs, YF, xs, YB, 'EQUIP-DETAIL'); a.line(xs + sp, YF, xs + sp, YB, 'EQUIP-DETAIL');
  }
  a.box(X0, YF - 0, zdk - 120, X1, YB, zdk); a.box(X0, YF, zdk, X1, YF + 250, zdk + ph); a.box(X0, YB - 250, zdk, X1, YB, zdk + ph); a.box(X0, YF, zdk + ph, X1, YF + 300, zdk + ph + 60); a.box(X0, YB - 300, zdk + ph, X1, YB, zdk + ph + 60);
  a.rect(X0, YF, X1, YF + 250, 'EQUIP-DETAIL'); a.rect(X0, YB - 250, X1, YB, 'EQUIP-DETAIL');
  a.log('Added ' + (n + 1) + ' piers with base courses, ' + n + ' round arches with ring lines, spandrel walls, a string course and coped parapets along the deck (plan and 3D).');
}
function suspBridge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, zd = Z0 + v.under * IN, yl = YF + 150, yr = YB - 150;
  a.outline();
  a.box(X0, YF + 60, zd, X1, YB - 60, zd + 220); a.box(X0, YF, Z0, X0 + 700, YB, zd); a.box(X1 - 700, YF, Z0, X1, YB, zd);
  const xt = [X0 + W * 0.16, X1 - W * 0.16], ztop = Z1 - 150;
  if (v.type === 'susp') {
    const half = (xt[1] - xt[0]) / 2, zmid = zd + 1100;
    for (const x of xt) { for (const y of [yl, yr]) a.box(x - 130, y - 130, Z0, x + 130, y + 130, ztop); a.box(x - 130, yl, ztop - 500, x + 130, yr, ztop - 300); a.box(x - 130, yl, zd - 300, x + 130, yr, zd); a.rect(x - 130, yl - 130, x + 130, yr + 130, 'EQUIP-DETAIL'); }
    for (const y of [yl, yr]) {
      const pts = [[X0 + 100, y, zd + 1000], [xt[0], y, ztop]]; for (let k = 1; k < 12; k++) { const x = xt[0] + (2 * half * k) / 12; pts.push([x, y, zmid + (ztop - zmid) * m.pow((x - cx) / half, 2)]); } pts.push([xt[1], y, ztop], [X1 - 100, y, zd + 1000]);
      a.tube(pts, pts.map(() => 30), 7);
      for (let x = xt[0] + 700; x < xt[1] - 400; x += 1200) a.tube([[x, y, zmid + (ztop - zmid) * m.pow((x - cx) / half, 2)], [x, y, zd + 220]], [8, 8], 5);
      a.tube([[X0, y, zd + 1100], [X1, y, zd + 1100]], [16, 16], 6); a.line(X0, y, X1, y, 'EQUIP-DETAIL');
    }
  } else {
    const xp = X0 + W * 0.34, n = 7;
    a.box(xp - 220, yl - 100, Z0, xp + 220, yr + 100, ztop - 400); prismX(a, [[yl - 100, ztop - 400], [yr + 100, ztop - 400], [cy, ztop]], xp - 120, xp + 120);
    for (let i = 0; i < n; i++) for (const y of [yl, yr]) { const xa = xp + 1500 + ((X1 - xp - 2500) * i) / (n - 1); a.tube([[xp, cy + (y > cy ? 150 : -150), ztop - 150 - i * 60], [xa, y, zd + 220]], [12, 12], 5); }
    for (let i = 0; i < 4; i++) for (const y of [yl, yr]) { const xa = X0 + 800 + ((xp - X0 - 1800) * i) / 3; a.tube([[xp, cy + (y > cy ? 150 : -150), ztop - 150 - i * 60], [xa, y, zd + 220]], [12, 12], 5); }
    for (const y of [yl, yr]) { a.tube([[X0, y, zd + 1100], [X1, y, zd + 1100]], [16, 16], 6); for (let x = X0 + 400; x < X1; x += 1200) a.cyl(x, y, zd + 220, zd + 1100, 9, 5); }
    a.rect(xp - 220, yl - 100, xp + 220, yr + 100, 'EQUIP-DETAIL'); a.line(X0, yl, X1, yl, 'EQUIP-DETAIL'); a.line(X0, yr, X1, yr, 'EQUIP-DETAIL');
  }
  a.log('Added the deck, two abutments, ' + (v.type === 'susp' ? 'two H-frame towers, side cables that follow a parabola, vertical hangers and handrails' : 'a single A-frame pylon with fan stays to both sides of the deck and handrails') + ' (plan and 3D).');
}
function conservatory(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, dw = 650, ge = v.eave * IN, th = 90, ap = v.apse ? D * 0.8 : 0, xe = X1 - ap;
  a.outline();
  const mull = (x, y, z0, z1) => a.box(x - 30, y - 30, z0, x + 30, y + 30, z1);
  const front = (x0, x1, yy) => { const k = m.max(1, m.round((x1 - x0) / 800)); for (let i = 0; i <= k; i++) mull(x0 + ((x1 - x0) * i) / k, yy, Z0 + dw, Z0 + ge); a.box(x0, yy - 25, Z0 + dw, x1, yy + 25, Z0 + dw + 50); a.box(x0, yy - 30, Z0 + ge - 60, x1, yy + 30, Z0 + ge); a.box(x0, yy - 4, Z0 + dw + 50, x1, yy + 4, Z0 + ge - 60); a.box(x0, yy - 120, Z0, x1, yy + 120, Z0 + dw); };
  front(X0, v.apse ? xe : X1, YF + 120);
  if (v.type === 'leanto') { a.box(X0, YB - 100, Z0, X1, YB, Z1); const zE = Z0 + ge; prismX(a, [[YF + 40, zE + 120], [YB - 100, Z1 - 150], [YB - 100, Z1 - 180], [YF + 40, zE + 90]], X0, X1); const k = m.round(W / 700); for (let i = 0; i <= k; i++) { const x = X0 + 30 + ((W - 60) * i) / k; a.tube([[x, YF + 40, zE + 100], [x, YB - 100, Z1 - 160]], [14, 14], 6); } for (const x of [X0 + 40, X1 - 40]) { a.box(x - 40, YF + 80, Z0 + dw, x + 40, YB - 100, Z0 + ge); a.box(x - 40, YF + 80, Z0, x + 40, YB - 100, Z0 + dw); } a.box(X0, YF + 20, Z0 + ge, X1, YF + 80, Z0 + ge + 120); }
  else {
    const zE = Z0 + ge, zr = Z1;
    for (const x of [X0, X1 - 80]) { a.box(x, YF, Z0, x + 80, YB, Z0 + dw); a.box(x, YF + 30, Z0 + dw, x + 80, YB - 30, Z0 + ge); }
    a.box(X0, YB - 120, Z0, X1 - (v.apse ? ap : 0), YB, Z0 + dw); a.box(X0, YB - 40, Z0 + dw, xe, YB, zE);
    for (const y of [YF + 40, YB - 40]) a.box(X0, y - 40, zE, xe, y + 40, zE + 100);
    prismX(a, [[YF + 40, zE + 100], [cy, zr], [cy, zr - 30], [YF + 40, zE + 70]], X0, xe); prismX(a, [[YB - 40, zE + 100], [cy, zr], [cy, zr - 30], [YB - 40, zE + 70]], X0, xe);
    a.box(X0, cy - 30, zr - 40, xe, cy + 30, zr + 0); a.tube([[X0, cy, zr + 0], [xe, cy, zr]], [26, 26], 6);
    const k = m.round((xe - X0) / 750); for (let i = 0; i <= k; i++) { const x = X0 + ((xe - X0) * i) / k; a.tube([[x, YF + 40, zE + 110], [x, cy, zr - 20]], [12, 12], 5); a.tube([[x, YB - 40, zE + 110], [x, cy, zr - 20]], [12, 12], 5); }
    prismX(a, [[YF + 40, zE], [YB - 40, zE], [cy, zr]], X0, X0 + 25); a.ell(X0 + 60, cy, zr + 60, 50, 50, 70, 8, 6);
    if (v.apse) { const P = [[xe, YF + 120], [X1 - 80, cy - D * 0.22], [X1 - 80, cy + D * 0.22], [xe, YB - 120]]; facets(a, P, Z0 + dw, zE, 70); pr(a, [[xe, YF + 40], [X1 - 40, cy - D * 0.26], [X1 - 40, cy + D * 0.26], [xe, YB - 40]], zE, zE + 110); pyramid(a, [[xe, YF + 40], [X1 - 40, cy - D * 0.26], [X1 - 40, cy + D * 0.26], [xe, YB - 40]], zE + 110, [xe + ap * 0.4, cy, zr - 20]); a.poly(P, 'EQUIP-DETAIL'); for (const p of P.slice(0, 3)) a.box(p[0] - 40, p[1] - 40, Z0, p[0] + 40, p[1] + 40, Z0 + dw); }
    else a.rect(X0, YF + 40, X1, YB - 40, 'EQUIP-DETAIL');
    a.box(cx - 450, YF + 90, Z0 + dw, cx + 450, YF + 150, Z0 + ge);
  }
  a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
  a.log('Added a brick dwarf wall, glazed walls between mullions, ' + (v.type === 'leanto' ? 'a sloped glazed roof with rafters against the back wall' : 'a glazed gable roof with a ridge, rafters and finials' + (v.apse ? ' and a three-sided glazed end under a hipped roof' : '')) + ' and a door (plan and 3D).');
}
function stadium(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, K = v.tiers, N = 40, Hm = a.H, sIn = 0.5;
  a.outline('EQUIP-DETAIL');
  const rg = (s) => ring(cx, cy, (W / 2) * s * 0.99, (D / 2) * s * 0.99, N);
  a.box(cx - (W / 2) * sIn * 0.9, cy - (D / 2) * sIn * 0.9, Z0, cx + (W / 2) * sIn * 0.9, cy + (D / 2) * sIn * 0.9, Z0 + 60);
  for (let t = 0; t < K; t++) {
    const s0 = sIn + ((0.93 - sIn) * t) / K, s1 = sIn + ((0.93 - sIn) * (t + 1)) / K, h = Z0 + 120 + ((Hm * 0.62) * (t + 1)) / K, A = rg(s0), B = rg(s1);
    for (let i = 0; i < N; i++) { const j = (i + 1) % N; pr(a, [A[i], B[i], B[j], A[j]], Z0, h); }
    a.poly(B.slice(), 'EQUIP-DETAIL');
  }
  const A = rg(0.93), B = rg(0.99); for (let i = 0; i < N; i++) { const j = (i + 1) % N; pr(a, [A[i], B[i], B[j], A[j]], Z0, Z0 + Hm * 0.7); }
  const ri = rg(0.72), ro = rg(0.99);
  for (let i = 0; i < N; i++) { const j = (i + 1) % N; pr(a, [ri[i], ro[i], ro[j], ri[j]], Z0 + Hm * 0.9, Z0 + Hm * 0.94); }
  for (let i = 0; i < N; i += 2) { const c = ring(cx, cy, (W / 2) * 0.97, (D / 2) * 0.97, N)[i]; a.cyl(c[0], c[1], Z0 + Hm * 0.7, Z0 + Hm * 0.9, 90, 8); }
  for (let i = 0; i < N; i += 2) { const c = ring(cx, cy, (W / 2) * 0.985, (D / 2) * 0.985, N)[i]; a.cyl(c[0], c[1], Z0, Z0 + Hm * 0.7, 70, 6); }
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const x = cx + sx * (W / 2) * 0.9, y = cy + sy * (D / 2) * 0.9; a.cyl(x, y, Z0, Z1 - 150, 55, 8); a.box(x - 220, y - 60, Z1 - 150, x + 220, y + 60, Z1); }
  a.rect(cx - (W / 2) * sIn * 0.8, cy - (D / 2) * sIn * 0.8, cx + (W / 2) * sIn * 0.8, cy + (D / 2) * sIn * 0.8, 'EQUIP-DETAIL'); a.line(cx, cy - (D / 2) * sIn * 0.8, cx, cy + (D / 2) * sIn * 0.8, 'EQUIP-DETAIL'); a.circ(cx, cy, (D / 2) * sIn * 0.25, 'EQUIP-DETAIL');
  a.log('Added the pitch slab, ' + K + ' stepped stand tiers around an oval, an outer wall, a roof ring on columns and four floodlight masts (plan and 3D).');
}
function rowHouses(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, n = v.n, hw = W / n, fl = 118 * IN, nf = v.floors, wh = nf * fl, ry = Z1 - Z0 - wh;
  a.outline();
  for (let i = 0; i < n; i++) {
    const x0 = X0 + i * hw, x1 = x0 + hw, c = (x0 + x1) / 2;
    a.box(x0, YF + 300, Z0, x1, YB, Z0 + wh); prismY(a, [[x0 + 30, Z0 + wh], [x1 - 30, Z0 + wh], [c, Z0 + wh + ry * 0.85]], YF + 300, YB - 300);
    for (let f = 1; f <= nf; f++) a.box(x0, YF, Z0 + f * fl - 35, x1, YF + 40, m.min(Z0 + f * fl + 35, Z0 + wh));
    const odd = i % 2;
    for (let f = 0; f < nf; f++) { const z0 = Z0 + f * fl + 700; for (const wx of [c - hw * 0.28, c + hw * 0.28]) { if (f === 0 && ((odd && wx > c) || (!odd && wx < c))) { a.frame(wx - 450, Z0 + 150, wx + 450, Z0 + 2100, YF + 120, YF + 300, 90); a.box(wx - 360, YF + 200, Z0 + 240, wx + 360, YF + 215, Z0 + 2010); a.box(wx - 520, YF, Z0, wx + 520, YF + 300, Z0 + 150); a.box(wx - 560, YF + 40, Z0 + 2150, wx + 560, YF + 300, Z0 + 2260); continue; } a.frame(wx - 450, z0, wx + 450, z0 + 1300, YF + 120, YF + 300, 90); a.box(wx - 360, YF + 200, z0 + 90, wx + 360, YF + 215, z0 + 1210); a.box(wx - 520, YF + 40, z0 - 60, wx + 520, YF + 300, z0); } }
    a.box(x1 - 280, YF + 600, Z0 + wh + ry * 0.55, x1 - 30, YF + 1000, Z0 + wh + ry * 0.55 + 700 > Z1 ? Z1 : Z0 + wh + ry * 0.55 + 700);
    a.rect(x0, YF, x1, YB, 'EQUIP-DETAIL');
  }
  for (let i = 0; i <= n; i++) { const x = X0 + i * hw; a.box(x - 30 < X0 ? X0 : x - 30, YF + 100, Z0 + wh, x + 30 > X1 ? X1 : x + 30, YB - 100, Z0 + wh + (i % 1 ? 0 : 0) + 120); }
  a.log('Added ' + n + ' ' + nf + '-storey houses sharing party walls, each with its own gable, a door with a canopy step, sash windows with sills and a chimney (plan and 3D).');
}
function gazebo(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, R = W / 2 * 0.97, Rv = R / m.cos(PI / 8), fh = v.floor * IN, post = 70;
  a.outline();
  const P = ring(cx, cy, Rv, Rv, 8, PI / 8);
  pr(a, ring(cx, cy, Rv * 1.02, Rv * 1.02, 8, PI / 8), Z0, Z0 + fh);
  const zf = Z0 + fh, rh = Z1 - zf - 2100;
  for (let i = 0; i < 8; i++) {
    const p = P[i], q = P[(i + 1) % 8];
    a.box(p[0] - post, p[1] - post, zf, p[0] + post, p[1] + post, zf + 2100);
    const front = i === 5 || i === 6; if (front && i === 5) continue;
    for (const hz of [900, 450]) a.tube([[p[0], p[1], zf + hz], [q[0], q[1], zf + hz]], [18, 18], 6);
    const kb = 6; for (let k = 1; k < kb; k++) a.cyl(p[0] + ((q[0] - p[0]) * k) / kb, p[1] + ((q[1] - p[1]) * k) / kb, zf + 60, zf + 900, 12, 6);
    if (v.bench && i % 2 === 0) { const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, ux = (cx - mx) * 0.12, uy = (cy - my) * 0.12; a.box(mx - 450 + ux * 0, my - 200 + uy * 0, zf + 400, mx + 450, my + 200, zf + 450); }
  }
  const eave = ring(cx, cy, Rv * 1.02, Rv * 1.02, 8, PI / 8);
  pr(a, eave, zf + 2100, zf + 2250);
  pyramid(a, eave, zf + 2250, [cx, cy, Z1 - 120]); a.cone(cx, cy, Z1 - 140, Z1 - 40, 70, 40, 8); a.ell(cx, cy, Z1 - 40, 55, 55, 55, 8, 6);
  const ez = Z0 + (v.steps || 0) * 0; a.box(cx - 700, YF, Z0, cx + 700, YF + 400, Z0 + fh * 0.5); if (fh > 600) a.box(cx - 700, YF + 400, Z0, cx + 700, YF + 800, Z0 + fh * 0.75);
  a.poly(P, 'EQUIP'); a.circ(cx, cy, Rv * 0.2, 'EQUIP-DETAIL'); for (const p of P) a.line(p[0], p[1], cx, cy, 'EQUIP-DETAIL');
  a.log('Added the eight-sided floor, eight posts, rails with balusters (the front bay left open with steps)' + (v.bench ? ', bench seats' : '') + ' and a pyramidal roof with a finial (plan and 3D).');
}
function lighthouse(a, v) {
  const { Z0, Z1, W, D, cx, cy } = a, R0 = W / 2 * 0.9, R1 = R0 * v.taper, gz = Z1 - 2600, th = gz - Z0, band = v.bands, rt = (z) => R0 + (R1 - R0) * ((z - Z0) / th);
  a.outline('EQUIP-DETAIL');
  a.cyl(cx, cy, Z0, Z0 + 250, R0 * 1.08, 24);
  for (let b = 0; b < band; b++) { const z0 = Z0 + 250 + ((th - 250) * b) / band, z1 = Z0 + 250 + ((th - 250) * (b + 1)) / band; a.tube([[cx, cy, z0], [cx, cy, z1]], [rt(z0), rt(z1)], 24); a.tube([[cx, cy, z1 - 60], [cx, cy, z1 + 0.01]], [rt(z1) * 1.04, rt(z1) * 1.04], 24); }
  a.box(cx - 450, cy - R0 - 120, Z0 + 250, cx + 450, cy - R0 + 220, Z0 + 2300); a.box(cx - 330, cy - R0 - 140, Z0 + 250, cx + 330, cy - R0 - 120, Z0 + 2000);
  for (let k = 1; k < 5; k++) { const z = Z0 + 250 + ((th - 250) * k) / 5.2, th2 = -PI / 2 + (k % 2 ? 0.0 : 0.0); a.box(cx - 120, cy - rt(z) - 10, z, cx + 120, cy - rt(z) + 80, z + 650); }
  a.cyl(cx, cy, gz, gz + 160, R1 * 1.5, 24); a.cyl(cx, cy, gz + 160, gz + 200, R1 * 1.35, 24);
  const nr = 20; for (let k = 0; k < nr; k++) { const t = (2 * PI * k) / nr; a.cyl(cx + R1 * 1.45 * m.cos(t), cy + R1 * 1.45 * m.sin(t), gz + 160, gz + 1160, 14, 5); }
  const rp = []; for (let k = 0; k <= nr; k++) { const t = (2 * PI * k) / nr; rp.push([cx + R1 * 1.45 * m.cos(t), cy + R1 * 1.45 * m.sin(t), gz + 1160]); } a.tube(rp, rp.map(() => 20), 6);
  const ly = gz + 200, lh = 1500; a.cyl(cx, cy, ly, ly + 120, R1 * 1.0, 20);
  for (let k = 0; k < 8; k++) { const t = (2 * PI * k) / 8; a.tube([[cx + R1 * 0.95 * m.cos(t), cy + R1 * 0.95 * m.sin(t), ly + 120], [cx + R1 * 0.95 * m.cos(t), cy + R1 * 0.95 * m.sin(t), ly + 120 + lh]], [14, 14], 5); }
  a.ell(cx, cy, ly + 120 + lh * 0.5, R1 * 0.35, R1 * 0.35, 230, 12, 8); a.cyl(cx, cy, ly + 120 + lh, ly + 180 + lh, R1 * 1.05, 20); a.cone(cx, cy, ly + 180 + lh, Z1 - 160, R1 * 1.05, R1 * 0.12, 20); a.ell(cx, cy, Z1 - 120, 70, 70, 70, 8, 6); a.tube([[cx, cy, Z1 - 60], [cx, cy, Z1]], [8, 4], 5);
  a.circ(cx, cy, R0, 'EQUIP'); a.circ(cx, cy, R1 * 1.5, 'EQUIP-DETAIL'); a.circ(cx, cy, R1 * 0.95, 'EQUIP-DETAIL'); a.rect(cx - 450, cy - R0 - 120, cx + 450, cy - R0 + 220, 'EQUIP-DETAIL');
  a.log('Added the base ring, a tapering shaft in ' + band + ' banded sections with slit windows and a door porch, a gallery with a 20-post rail, an eight-post lantern with a lens and a conical cap with a ball and vane (plan and 3D).');
}
const MASS = [
  fam({ cat: 'architecture/massing', title: 'Generic round tower massing', desc: (v) => `Round ${v.floors}-storey tower${v.taper < 1 ? ' tapering to ' + m.round(v.taper * 100) + ' percent' : ''} with floor bands, 24 vertical fins, an entrance canopy, a roof drum and a mast.`,
    vs: [['10 storeys, 80 ft diameter', 960, 960, 1560, 0, { floor: 144, floors: 10, taper: 1 }], ['20 storeys, 90 ft diameter', 1080, 1080, 3040, 0, { floor: 144, floors: 20, taper: 1 }], ['30 storeys tapered, 100 ft diameter', 1200, 1200, 4600, 0, { floor: 144, floors: 30, taper: 0.7 }]],
    build: cylTower }),
  fam({ cat: 'architecture/massing', title: 'Generic slab block on pilotis', desc: (v) => `${v.floors}-storey slab block raised on ${v.cols * 2} round columns over an open ground floor, with a central core, floor bands, window bays on the long faces and a roof plant room.`,
    vs: [['5 storeys, 150 x 50 ft, 12 columns', 1800, 600, 920, 0, { ground: 168, floors: 5, cols: 6 }], ['8 storeys, 180 x 60 ft, 16 columns', 2160, 720, 1360, 0, { ground: 168, floors: 8, cols: 8 }], ['4 storeys, 120 x 45 ft, 8 columns', 1440, 540, 780, 0, { ground: 144, floors: 4, cols: 4 }]],
    build: pilotisSlab }),
  fam({ cat: 'architecture/massing', title: 'Generic stepped terrace block', desc: (v) => `${v.floors}-storey block with each floor set back ${v.setback} in, window bays, planter and rail edges on every terrace${v.pergola ? ' and a timber pergola on the top terrace' : ''}.`,
    vs: [['5 storeys, 96 in setbacks', 1200, 720, 780, 0, { floors: 5, setback: 96 }], ['6 storeys, 96 in setbacks, 120 ft wide', 1440, 800, 930, 0, { floors: 6, setback: 96 }], ['4 storeys with roof pergola', 960, 600, 640, 0, { floors: 4, setback: 96, pergola: true }]],
    build: terraced }),
  fam({ cat: 'architecture/massing', title: 'Generic parish chapel massing', desc: (v) => `Chapel with a gabled nave, buttresses and pointed side windows${v.apse ? ', a semicircular apse' : ''}${v.tower ? ', and a front tower with a belfry and pyramid spire' : ', and a front bell gable'}.`,
    vs: [['bell gable, 24 ft nave', 324, 576, 400, 0, { nave: 288, wall: 240, rise: 96 }], ['tower and spire, 30 ft nave', 396, 1100, 780, 0, { nave: 360, wall: 264, rise: 120, tower: true }], ['apse and bell gable, 28 ft nave', 372, 900, 420, 0, { nave: 336, wall: 252, rise: 108, apse: true }]],
    build: chapel }),
  fam({ cat: 'architecture/massing', title: 'Generic domed rotunda massing', desc: (v) => `Domed hall: stepped base, a drum${v.ring ? ' ringed by 16 columns under an entablature' : ' with pilaster strips'}, a ribbed dome with a lantern${v.portico ? ' and a four-column portico with a pediment' : ''}.`,
    vs: [['ring colonnade, 44 ft', 528, 528, 470, 0, { drum: 0.78, dh: 140, ring: true }], ['portico, 50 ft', 600, 780, 520, 0, { drum: 0.9, dh: 160, portico: true }], ['plain drum, 60 ft', 720, 720, 540, 0, { drum: 0.95, dh: 180 }]],
    build: rotunda }),
  fam({ cat: 'architecture/massing', title: 'Generic loading dock warehouse massing', desc: (v) => `Warehouse on a dock-height plinth with ${v.docks} sectional dock doors with frames, bumpers and canopies${v.office ? ', a two-storey office block' : ''}, a side door and a ${v.roof === 'flat' ? 'flat' : 'pitched'} roof.`,
    vs: [['6 docks, 120 x 80 ft', 1440, 960, 440, 0, { docks: 6, wall: 336, roof: 'flat' }], ['10 docks and office, 200 x 100 ft', 2400, 1200, 500, 0, { docks: 10, wall: 360, roof: 'flat', office: true }], ['4 docks, 80 x 60 ft, pitched', 960, 720, 440, 0, { docks: 4, wall: 300, roof: 'pitched' }]],
    build: warehouse }),
  fam({ cat: 'architecture/massing', title: 'Generic wing block around a court', desc: (v) => `${v.floors}-storey ${v.shape === 'U' ? 'U-shaped' : 'L-shaped'} block with floor bands, window bays on every face, roof parapets and an entrance canopy.`,
    vs: [['U-shaped, 3 storeys, 120 x 100 ft', 1440, 1200, 450, 0, { shape: 'U', floors: 3, wing: 300 }], ['L-shaped, 4 storeys, 140 x 100 ft', 1680, 1200, 620, 0, { shape: 'L', floors: 4, wing: 330 }]],
    build: lBlock }),
  fam({ cat: 'architecture/massing', title: 'Generic masonry viaduct', desc: (v) => `Viaduct of ${v.n} round arches on ${v.n + 1} piers with ring lines, spandrel walls, a string course and coped parapets along the deck.`,
    vs: [['4 arches, 20 ft spans', 1200, 96, 312, 0, { n: 4, pier: 48, spring: 120 }], ['6 arches, 24 ft spans, tall piers', 2150, 120, 420, 0, { n: 6, pier: 60, spring: 190 }], ['5 arches, 16 ft spans, low', 1040, 84, 250, 0, { n: 5, pier: 36, spring: 84 }]],
    build: viaduct }),
  fam({ cat: 'architecture/massing', title: 'Generic cable footbridge model', desc: (v) => `Footbridge with a deck and two abutments, ${v.type === 'susp' ? 'two H-frame towers, parabolic side cables, vertical hangers and handrails' : 'a single A-frame pylon with fan stays to both sides of the deck and handrails'}.`,
    vs: [['suspension, 120 ft', 1440, 84, 340, 0, { type: 'susp', under: 72 }], ['cable-stayed, 140 ft', 1680, 72, 330, 0, { type: 'stayed', under: 60 }]],
    build: suspBridge }),
  fam({ cat: 'architecture/massing', title: 'Generic glazed conservatory model', desc: (v) => `Conservatory on a brick dwarf wall with glazed walls between mullions, ${v.type === 'leanto' ? 'a sloped glazed roof with rafters against the back wall' : 'a glazed gable roof with a ridge, rafters and finials' + (v.apse ? ' and a three-sided glazed end under a hipped roof' : '')} and a door.`,
    vs: [['lean-to, 12 x 8 ft', 144, 96, 108, 0, { type: 'leanto', eave: 84 }], ['gabled, 15 x 10 ft', 180, 120, 132, 0, { type: 'gable', eave: 84 }], ['three-sided end, 18 x 11 ft', 216, 132, 140, 0, { type: 'gable', eave: 84, apse: true }]],
    build: conservatory }),
  fam({ cat: 'architecture/massing', title: 'Generic oval stadium bowl', desc: (v) => `Oval stadium bowl with a pitch slab, ${v.tiers} stepped stand tiers, an outer wall, a roof ring on columns and four floodlight masts.`,
    vs: [['small bowl, 360 x 270 ft, 4 tiers', 4320, 3240, 600, 0, { tiers: 4 }], ['large bowl, 600 x 480 ft, 6 tiers', 7200, 5760, 960, 0, { tiers: 6 }]],
    build: stadium }),
  fam({ cat: 'architecture/massing', title: 'Generic row of terraced houses', desc: (v) => `Row of ${v.n} ${v.floors}-storey houses sharing party walls, each with its own gable, a door with a step, sash windows and a chimney.`,
    vs: [['4 two-storey, 80 ft long', 960, 432, 340, 0, { n: 4, floors: 2 }], ['6 three-storey, 120 ft long', 1440, 480, 460, 0, { n: 6, floors: 3 }]],
    build: rowHouses }),
  fam({ cat: 'architecture/massing', title: 'Generic octagonal garden gazebo', desc: (v) => `Eight-sided gazebo on a floor ${v.floor} in high: eight posts, rails with balusters (the front bay open with steps)${v.bench ? ', bench seats' : ''} and a pyramidal roof with a finial.`,
    vs: [['10 ft across', 120, 120, 150, 0, { floor: 6 }], ['14 ft across, benches', 168, 168, 170, 0, { floor: 8, bench: true }], ['bandstand, 18 ft across, raised floor', 216, 216, 190, 0, { floor: 36, bench: true }]],
    build: gazebo }),
  fam({ cat: 'architecture/massing', title: 'Generic masonry lighthouse tower', desc: (v) => `Tapering banded tower with slit windows and a door porch, a gallery with a 20-post rail, an eight-post lantern with a lens and a conical cap.`,
    vs: [['coastal tower, 60 ft', 288, 288, 840, 0, { taper: 0.62, bands: 4 }], ['tall coastal tower, 90 ft', 336, 336, 1280, 0, { taper: 0.58, bands: 6 }]],
    build: lighthouse }),
];
export default [...ENV, ...CIRC, ...DET, ...MASS];

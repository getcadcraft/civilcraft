/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, robotics: arms and grippers, mobile robots, robot parts and sensors, work cells and guarding. Original geometry; generic scale shapes, not particular robots. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, TAU = Math.PI * 2, m = Math;
const R3 = (n) => m.round(n * 1000) / 1000;
const mi = (mm) => R3(mm / IN);
// ------------------------------------------------------------------ geometry helpers
function prismX(a, poly, x0, x1) {   // poly of [y, z]
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
function prismY(a, poly, y0, y1) {   // poly of [x, z]
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
const ptsC = (cx, cy, r, n, rot = 0) => Array.from({ length: n }, (_, i) => [cx + r * m.cos(rot + (i * TAU) / n), cy + r * m.sin(rot + (i * TAU) / n)]);
/** A ring (annulus) around an axis. ax 'z' (c1,c2 = x,y), 'y' (x,z) or 'x' (y,z); p0..p1 along the axis; ri number or (sliceIndex)=>r; ro number or (angle)=>r. */
function ring(a, ax, c1, c2, p0, p1, ri, ro, n = 24, rot = 0, span = TAU) {
  const rif = typeof ri === 'function' ? ri : () => ri, rof = typeof ro === 'function' ? ro : () => ro;
  for (let i = 0; i < n; i++) {
    const t0 = rot + (i * span) / n, t1 = rot + ((i + 1) * span) / n, r0 = rif(i);
    const P = (t, r) => [c1 + r * m.cos(t), c2 + r * m.sin(t)];
    const poly = r0 > 0.01 ? [P(t0, r0), P(t0, rof(t0, i)), P(t1, rof(t1, i)), P(t1, r0)] : [[c1, c2], P(t0, rof(t0, i)), P(t1, rof(t1, i))];
    if (ax === 'z') a.prism(poly, p0, p1); else if (ax === 'y') prismY(a, poly, p0, p1); else prismX(a, poly, p0, p1);
  }
  return a;
}
const hexRo = (ap) => (t) => { const d = (((t % (TAU / 6)) + TAU / 6) % (TAU / 6)) - TAU / 12; return ap / m.cos(d); };
const sqRo = (h) => (t) => h / m.max(m.abs(m.cos(t)), m.abs(m.sin(t)));
/** a thread drawn as a zigzag of rings between rMin and rMaj */
function thread(a, cx, cy, z0, z1, rMaj, rMin, p, maxN = 14, seg = 12) {
  const n = m.max(1, m.min(maxN, m.floor((z1 - z0) / p))), st = (z1 - z0) / n, pts = [], rd = [];
  for (let i = 0; i <= 2 * n; i++) { pts.push([cx, cy, z0 + (i * st) / 2]); rd.push(i % 2 ? rMaj : rMin); }
  a.tube(pts, rd, seg);
}
/** a rod (bar) between two points in a plane. pl 'z' (xy plane, extruded z0..z1), 'x' (yz plane, extruded between x0..x1), 'y' (xz plane) */
function bar(a, pl, p, q, w, e0, e1, round = true) {
  const dx = q[0] - p[0], dy = q[1] - p[1], L = m.hypot(dx, dy) || 1, nx = (-dy / L) * (w / 2), ny = (dx / L) * (w / 2);
  const poly = [[p[0] + nx, p[1] + ny], [q[0] + nx, q[1] + ny], [q[0] - nx, q[1] - ny], [p[0] - nx, p[1] - ny]];
  if (pl === 'z') a.prism(poly, e0, e1); else if (pl === 'x') prismX(a, poly, e0, e1); else prismY(a, poly, e0, e1);
  if (round) for (const c of [p, q]) { if (pl === 'z') a.cyl(c[0], c[1], e0, e1, w / 2, 10); else if (pl === 'x') a.xcyl(e0, e1, c[0], c[1], w / 2, 10); else a.ycyl(e0, e1, c[0], c[1], w / 2, 10); }
}
/** a flat plate x0..x1, y0..y1, z0..z1 with round or slotted holes cut through: holes [{x,y,rx,ry}] (rx > ry gives a slot with round ends) */
function plateHoles(a, x0, y0, x1, y1, z0, z1, holes, bands = 4, pl = 'z') {
  const bx = (xa, ya, xb, yb) => (pl === 'z' ? a.box(xa, ya, z0, xb, yb, z1) : a.box(xa, z0, ya, xb, z1, yb));
  const ys = new Set([y0, y1]);
  for (const h of holes) for (let i = 0; i <= bands; i++) ys.add(m.round((h.y - h.ry + (2 * h.ry * i) / bands) * 10) / 10);
  const yl = [...ys].filter((y) => y >= y0 && y <= y1).sort((p, q) => p - q);
  for (let k = 0; k < yl.length - 1; k++) {
    const ya = yl[k], yb = yl[k + 1]; if (yb - ya < 0.3) continue; const ym = (ya + yb) / 2, iv = [];
    for (const h of holes) { const dy = m.abs(ym - h.y); if (dy >= h.ry) continue; const s = m.sqrt(1 - (dy / h.ry) ** 2); iv.push([h.x - (h.rx - h.ry) - h.ry * s, h.x + (h.rx - h.ry) + h.ry * s]); }
    iv.sort((p, q) => p[0] - q[0]);
    let cur = x0;
    for (const [s0, s1] of iv) { if (s0 > cur) bx(cur, ya, m.min(s0, x1), yb); cur = m.max(cur, s1); }
    if (cur < x1) bx(cur, ya, x1, yb);
  }
  if (pl === 'z') for (const h of holes) { if (h.rx > h.ry) { a.line(h.x - (h.rx - h.ry), h.y - h.ry, h.x + (h.rx - h.ry), h.y - h.ry, 'EQUIP-DETAIL'); a.line(h.x - (h.rx - h.ry), h.y + h.ry, h.x + (h.rx - h.ry), h.y + h.ry, 'EQUIP-DETAIL'); a.arc(h.x - (h.rx - h.ry), h.y, h.ry, 90, 270, 'EQUIP-DETAIL'); a.arc(h.x + (h.rx - h.ry), h.y, h.ry, -90, 90, 'EQUIP-DETAIL'); } else a.circ(h.x, h.y, h.ry, 'EQUIP-DETAIL'); }
}
/** gear or sprocket teeth around a z axis */
function teeth(a, cx, cy, z0, z1, N, rb, rt, hb, ht) {
  for (let i = 0; i < N; i++) { const th = (TAU * i) / N + 0.0001; const P = (r, d) => [cx + r * m.cos(th + d), cy + r * m.sin(th + d)]; a.prism([P(rb, -hb), P(rt, -ht), P(rt, ht), P(rb, hb)], z0, z1); }
}
/** spokes from a hub to a rim in the XY plane */
function spokes(a, cx, cy, z0, z1, rIn, rOut, n, w) { for (let i = 0; i < n; i++) { const th = (TAU * i) / n + 0.3; bar(a, 'z', [cx + rIn * m.cos(th), cy + rIn * m.sin(th)], [cx + rOut * m.cos(th), cy + rOut * m.sin(th)], w, z0, z1, false); } }

/** extrude a convex polygon [[u,v],...] through a mapper map(u, v, t) between t0 and t1 */
function extrude(a, map, poly, t0, t1) {
  const n = poly.length, M = (p, t) => map(p[0], p[1], t);
  for (let i = 1; i < n - 1; i++) a.t.push([M(poly[0], t0), M(poly[i + 1], t0), M(poly[i], t0)], [M(poly[0], t1), M(poly[i], t1), M(poly[i + 1], t1)]);
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([M(p, t0), M(q, t0), M(q, t1)], [M(p, t0), M(q, t1), M(p, t1)]); }
}
/** a T-slot aluminium profile of size S (mm) along axis ax between p0 and p1, centred on (c1, c2). Slot opening s. */
function extrusion(a, ax, c1, c2, p0, p1, S, s) {
  const map = ax === 'y' ? (u, v, t) => [c1 + u, t, c2 + v] : ax === 'x' ? (u, v, t) => [t, c1 + u, c2 + v] : (u, v, t) => [c1 + u, c2 + v, t];
  const h = S / 2, c = S * 0.2, dC = S * 0.3, t = S * 0.1;
  const rot = (u, v, f) => { for (let i = 0; i < f; i++) [u, v] = [-v, u]; return [u, v]; };
  const FP = (poly, f) => poly.map(([u, d]) => rot(u, h - d, f));
  for (let f = 0; f < 4; f++) {
    extrude(a, map, FP([[s / 2, 0], [h, 0], [h, t], [s / 2, t]], f), p0, p1); extrude(a, map, FP([[-h, 0], [-s / 2, 0], [-s / 2, t], [-h, t]], f), p0, p1);
    extrude(a, map, FP([[h - c, t], [h, t], [h, c], [h - c, c]], f), p0, p1);
    const A = [S * 0.34, h - S * 0.34], B = [h - dC, dC], dx = B[0] - A[0], dy = B[1] - A[1], L = m.hypot(dx, dy), nx = (-dy / L) * t * 0.45, ny = (dx / L) * t * 0.45;
    extrude(a, map, FP([[A[0] + nx, A[1] + ny], [B[0] + nx, B[1] + ny], [B[0] - nx, B[1] - ny], [A[0] - nx, A[1] - ny]], f), p0, p1);
  }
  ring(a, ax, c1, c2, p0, p1, S * 0.085, sqRo(h - dC), 16, 0.0);
  const w = S * 0.0; 
}

// ------------------------------------------------------------------ robot helpers
const limb = (a, p, q, r0, r1, seg = 14) => a.tube([p, q], [r0, r1], seg);
/** a rotary joint housing: a cylinder along x (or z) with a cap */
const jointX = (a, x0, x1, y, z, r, seg = 18) => { a.xcyl(x0, x1, y, z, r, seg); a.xcyl(x0 - r * 0.04, x0, y, z, r * 0.8, seg); a.xcyl(x1, x1 + r * 0.04, y, z, r * 0.8, seg); };
/** a 4-bolt flange face disc pointing down at (x, y, z) */
const flangeDown = (a, x, y, z, r) => { a.cyl(x, y, z - r * 0.28, z, r, 20); a.cyl(x, y, z - r * 0.36, z - r * 0.28, r * 0.5, 14); for (let i = 0; i < 4; i++) { const t = (TAU * i) / 4 + 0.78; a.cyl(x + r * 0.72 * m.cos(t), y + r * 0.72 * m.sin(t), z - r * 0.34, z - r * 0.28, r * 0.09, 6); } };
/** a wheel on a lateral axle (x) at (x, y), radius r resting at height zc */
function whl(a, x, y, r, w, zc, spokes = 0) {
  a.xcyl(x - w / 2, x + w / 2, y, zc, r, 20); a.xcyl(x - w / 2 - 2, x + w / 2 + 2, y, zc, r * 0.5, 14); a.xcyl(x - w / 2 - 4, x + w / 2 + 4, y, zc, r * 0.2, 8);
  a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL');
}
/** a lidar puck: base, spinning head with a window band, top cap */
function puck(a, x, y, z, r, h) { a.cyl(x, y, z, z + h * 0.3, r, 20); a.cyl(x, y, z + h * 0.3, z + h * 0.75, r * 0.88, 20); a.cyl(x, y, z + h * 0.75, z + h, r * 0.8, 20); a.circ(x, y, r, 'EQUIP-DETAIL'); }
const beaconAt = (a, x, y, z, r = 25, h = 55) => { a.cyl(x, y, z, z + h * 0.25, r * 0.7, 10); a.cyl(x, y, z + h * 0.25, z + h * 0.9, r, 14); a.ell(x, y, z + h * 0.9, r, r, r * 0.35, 12, 4); a.circ(x, y, r, 'EQUIP-DETAIL'); };
const estop = (a, x, y, z, r = 14) => { a.cyl(x, y, z, z + 5, r * 1.5, 14); a.cyl(x, y, z + 5, z + 5 + r, r, 14); a.circ(x, y, r, 'EQUIP-DETAIL'); };

// ============================================================================================= ARMS
/** an articulated arm posed with the upper arm up and the forearm reaching to the front, wrist down. */
function arm6(a, R, cob) {
  const cx = a.cx, yB = a.YB - 0.13 * R, z0 = a.Z0, rb = (cob ? 0.085 : 0.105) * R, hb = (cob ? 0.1 : 0.12) * R;
  const zS = z0 + hb + 0.12 * R, L1 = 0.42 * R, L2 = 0.38 * R, zE = zS + L1;
  a.cyl(cx, yB, z0, z0 + 0.02 * R, rb * 1.3, 28); for (let i = 0; i < 4; i++) { const t = (TAU * i) / 4 + 0.78; a.prism(ptsC(cx + rb * 1.1 * m.cos(t), yB + rb * 1.1 * m.sin(t), 0.02 * R, 6), z0 + 0.02 * R, z0 + 0.03 * R); }
  a.cyl(cx, yB, z0 + 0.02 * R, z0 + hb, rb, 24); a.cyl(cx, yB, z0 + hb, zS + 0.05 * R, rb * 0.88, 24);
  if (cob) {
    a.ell(cx, yB, zS, rb * 0.88, rb * 0.88, 0.07 * R, 16, 8); jointX(a, cx - 0.07 * R, cx + 0.07 * R, yB, zS, 0.06 * R);
    limb(a, [cx, yB, zS], [cx, yB, zE], 0.052 * R, 0.048 * R, 18); jointX(a, cx - 0.06 * R, cx + 0.06 * R, yB, zE, 0.055 * R);
    limb(a, [cx, yB, zE], [cx, yB - L2, zE - 0.02 * R], 0.045 * R, 0.04 * R, 18); jointX(a, cx - 0.045 * R, cx + 0.045 * R, yB - L2, zE - 0.02 * R, 0.042 * R);
    const wy = yB - L2 - 0.02 * R, wz = zE - 0.04 * R; a.cyl(cx, wy, wz - 0.1 * R, wz, 0.04 * R, 16); a.ell(cx, wy, wz - 0.01 * R, 0.042 * R, 0.042 * R, 0.04 * R, 12, 6);
    flangeDown(a, cx, wy, wz - 0.1 * R, 0.035 * R);
    a.circ(cx, yB, rb); a.rect(cx - 0.045 * R, yB - L2, cx + 0.045 * R, yB, 'EQUIP-DETAIL'); a.circ(cx, wy, 0.04 * R, 'EQUIP-DETAIL');
  } else {
    a.box(cx - rb * 0.9, yB - rb * 0.9, z0 + hb, cx + rb * 0.9, yB + rb * 0.9, zS + 0.02 * R);
    jointX(a, cx - 0.1 * R, cx + 0.1 * R, yB, zS, 0.075 * R, 20); a.box(cx + 0.1 * R, yB - 0.05 * R, zS - 0.05 * R, cx + 0.1 * R + 0.03 * R, yB + 0.05 * R, zS + 0.05 * R);
    limb(a, [cx, yB - 0.01 * R, zS], [cx, yB - 0.03 * R, zE], 0.07 * R, 0.05 * R, 16); a.box(cx - 0.04 * R, yB + 0.05 * R, zS + 0.05 * R, cx + 0.04 * R, yB + 0.08 * R, zE - 0.05 * R);
    jointX(a, cx - 0.07 * R, cx + 0.07 * R, yB - 0.03 * R, zE, 0.058 * R, 18);
    const ey = yB - 0.03 * R; limb(a, [cx, ey, zE], [cx, ey - L2, zE - 0.02 * R], 0.052 * R, 0.034 * R, 16);
    const wy = ey - L2, wz = zE - 0.02 * R; jointX(a, cx - 0.04 * R, cx + 0.04 * R, wy, wz, 0.036 * R, 14); a.cyl(cx, wy, wz - 0.08 * R, wz, 0.03 * R, 14); flangeDown(a, cx, wy, wz - 0.08 * R, 0.03 * R);
    if (R >= 1400) { a.ycyl(yB + 0.04 * R, yB + 0.125 * R, cx, zS + 0.06 * R, 0.03 * R, 12); limb(a, [cx + 0.045 * R, yB + 0.11 * R, zS + 0.03 * R], [cx + 0.045 * R, yB + 0.08 * R, zE - 0.06 * R], 0.018 * R, 0.018 * R, 8); }
    a.circ(cx, yB, rb); a.circ(cx, yB, rb * 1.3, 'EQUIP-DETAIL'); a.rect(cx - 0.05 * R, ey - L2, cx + 0.05 * R, yB, 'EQUIP-DETAIL'); a.circ(cx, wy, 0.036 * R, 'EQUIP-DETAIL');
  }
}
const grip = {
  flange: (a, cx, cy, zt, r) => { a.cyl(cx, cy, zt - r * 0.2, zt, r, 22); a.cyl(cx, cy, zt - r * 0.32, zt - r * 0.2, r * 0.62, 16); for (let i = 0; i < 4; i++) { const t = (TAU * i) / 4 + 0.78; a.cyl(cx + r * 0.78 * m.cos(t), cy + r * 0.78 * m.sin(t), zt - 0.1, zt + 0.5, r * 0.09, 6); } a.circ(cx, cy, r, 'EQUIP-DETAIL'); },
};
const arms = [
  fam({ cat: 'robotics/arms', title: 'Generic six-axis industrial robot arm',
    desc: (v) => `Six-axis articulated robot arm, ${v.R} mm reach, posed with the upper arm raised and the forearm reaching forward: a bolted base plate, a turning column, shoulder, elbow and wrist housings, tapered links and a tool flange facing down${v.R >= 1400 ? ', with a balancer cylinder and cable guide' : ''}.`,
    vs: [500, 900, 1400, 2000].map((R) => [`${R} mm reach`, mi(0.28 * R), mi(0.58 * R), mi(0.74 * R), 0, { R }]),
    build: (a, v) => { arm6(a, v.R, false); a.log('Added the base, turning column, shoulder, elbow and wrist housings, tapered links and the tool flange (plan and 3D).'); } }),
  fam({ cat: 'robotics/arms', title: 'Generic collaborative robot arm',
    desc: (v) => `Collaborative robot arm for ${v.kg} kg, ${v.R} mm reach, posed with the upper arm raised: a slim base, cylindrical joint housings with rounded caps, tube links and a tool flange facing down.`,
    vs: [[3, 500], [10, 900], [16, 1300]].map(([kg, R]) => [`${kg} kg payload, ${R} mm reach`, mi(0.24 * R), mi(0.58 * R), mi(0.7 * R), 0, { kg, R }]),
    build: (a, v) => { arm6(a, v.R, true); a.log('Added the slim base, the cylindrical joint housings, the tube links and the tool flange (plan and 3D).'); } }),
  fam({ cat: 'robotics/arms', title: 'Generic SCARA robot arm',
    desc: (v) => `SCARA arm, ${v.R} mm reach: a base column, two horizontal links turning about vertical joints, a vertical quill with a cable guide and a tool flange at its lower end, posed with the links at a right angle.`,
    vs: [350, 500, 700].map((R) => [`${R} mm reach`, mi(0.7 * R), mi(0.7 * R), mi(0.8 * R), 0, { R }]),
    build: (a, v) => {
      const R = v.R, z0 = a.Z0, r1 = 0.09 * R, bx = a.X0 + r1, by = a.YB - r1, ex = bx, ey = by - 0.5 * R, wx = bx + 0.5 * R, wy = ey, hc = 0.42 * R, lt = 0.09 * R;
      a.box(bx - r1 * 1.5, by - r1 * 1.5, z0, bx + r1 * 1.5, by + r1 * 1.5, z0 + 0.03 * R); a.cyl(bx, by, z0 + 0.03 * R, z0 + hc, r1 * 1.15, 24);
      a.cyl(bx, by, z0 + hc, z0 + hc + lt, r1 * 1.05, 20); a.box(bx - r1 * 0.5, ey, z0 + hc, bx + r1 * 0.5, by, z0 + hc + lt); a.cyl(ex, ey, z0 + hc, z0 + hc + lt, r1 * 0.5, 16);
      const z2 = z0 + hc + lt; a.cyl(ex, ey, z2, z2 + lt * 1.05, r1 * 0.95, 20); bar(a, 'z', [ex, ey], [wx, wy], r1 * 0.9, z2, z2 + lt, true);
      a.cyl(wx, wy, z2, z2 + lt, r1 * 0.55, 16); a.cyl(wx, wy, z0 + 0.12 * R, z0 + 0.78 * R, r1 * 0.32, 14); a.cyl(wx, wy, z0 + 0.7 * R, z0 + 0.8 * R, r1 * 0.5, 14); a.cyl(wx, wy, z0 + 0.1 * R, z0 + 0.12 * R, r1 * 0.45, 14);
      a.cyl(wx + r1 * 0.5, wy, z0 + 0.25 * R, z0 + 0.65 * R, r1 * 0.08, 6); flangeDown(a, wx, wy, z0 + 0.1 * R, r1 * 0.5);
      a.circ(bx, by, r1 * 1.15); a.circ(bx, by, r1 * 1.5, 'EQUIP-DETAIL'); bar(a, 'z', [bx, by], [ex, ey], r1 * 0.9, 0, 0, true); a.line(bx, by, ex, ey, 'EQUIP-DETAIL'); a.line(ex, ey, wx, wy, 'EQUIP-DETAIL'); a.circ(wx, wy, r1 * 0.5, 'EQUIP-DETAIL'); a.circ(ex, ey, r1 * 0.95, 'EQUIP-DETAIL');
      a.log('Added the base column, the two links with their vertical joints, the quill with cable guide and the tool flange (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic delta robot',
    desc: (v) => `Three-axis delta robot in a ${v.S} mm frame: three posts and a top plate carrying three motors, three upper arms, paired parallel forearm rods with ball joints and a small travelling plate with a tool hub underneath.`,
    vs: [600, 900, 1200].map((S) => [`${S} mm frame`, S, mi(S * 0.9), mi(S * 0.95), 0, { S }]).map(([l, S, d, h, z, p]) => [l, mi(S), d, h, z, p]),
    build: (a, v) => {
      const S = v.S, R0 = (S * 0.9) / 2 * 0.58, H = a.H, z0 = a.Z0, zt = a.Z1 - S * 0.05, cx = a.cx, cy = a.cy + S * 0.02, ang = [-m.PI / 2, -m.PI / 2 + TAU / 3, -m.PI / 2 + (2 * TAU) / 3].map((t) => t + m.PI);
      const P = (t, r) => [cx + r * m.cos(t), cy + r * m.sin(t)];
      const rf = S * 0.46; const pts = ang.map((t) => P(t + 0.0, rf));
      for (let i = 0; i < 3; i++) { const p = pts[i], q = pts[(i + 1) % 3]; bar(a, 'z', p, q, S * 0.035, zt, zt + S * 0.035, false); a.cyl(p[0], p[1], z0, zt, S * 0.017, 8); a.box(p[0] - S * 0.04, p[1] - S * 0.04, z0, p[0] + S * 0.04, p[1] + S * 0.04, z0 + S * 0.012); }
      a.prism(ptsC(cx, cy, S * 0.1, 3, ang[0] + m.PI), zt, zt + S * 0.02);
      const pz = z0 + H * 0.34, pr = S * 0.045; a.cyl(cx, cy, pz - S * 0.008, pz + S * 0.01, pr * 2.2, 18); a.cyl(cx, cy, pz - S * 0.04, pz - S * 0.008, pr * 0.8, 12);
      for (let i = 0; i < 3; i++) {
        const t = ang[i] + m.PI / 3 * 0 + m.PI / 3 * 0 , mp = P(ang[i] + m.PI / 3 + m.PI / 3 * 0 + 0, 0);
        const th = ang[i] + m.PI, mt = th; const mx = cx + (rf * 0.55) * m.cos(th + m.PI / 3), my = cy + (rf * 0.55) * m.sin(th + m.PI / 3);
        const mo = [cx + rf * 0.6 * m.cos(th + m.PI / 3), cy + rf * 0.6 * m.sin(th + m.PI / 3)];
        const dir = [m.cos(th + m.PI / 3), m.sin(th + m.PI / 3)];
        const el = [mo[0] + dir[0] * S * 0.18, mo[1] + dir[1] * S * 0.18, zt - S * 0.2];
        a.ycyl(0, 0.01, 0, 0, 0.1, 3);
        a.cyl(mo[0], mo[1], zt, zt + S * 0.07, S * 0.04, 14); a.tube([[mo[0], mo[1], zt + S * 0.03], [el[0], el[1], el[2]]], [S * 0.018, S * 0.014], 8); a.ell(el[0], el[1], el[2], S * 0.02, S * 0.02, S * 0.02, 8, 5);
        const tp = [cx + pr * 1.4 * m.cos(th + m.PI / 3), cy + pr * 1.4 * m.sin(th + m.PI / 3), pz + S * 0.0], side = [-dir[1] * S * 0.035, dir[0] * S * 0.035];
        for (const s of [-1, 1]) a.tube([[el[0] + s * side[0], el[1] + s * side[1], el[2]], [tp[0] + s * side[0] * 0.6, tp[1] + s * side[1] * 0.6, tp[2]]], [S * 0.007, S * 0.007], 6);
        a.line(mo[0], mo[1], el[0], el[1], 'EQUIP-DETAIL'); a.line(el[0], el[1], cx, cy, 'EQUIP-DETAIL'); a.circ(mo[0], mo[1], S * 0.04, 'EQUIP-DETAIL');
      }
      a.poly(pts); a.circ(cx, cy, pr * 2.2, 'EQUIP-DETAIL');
      a.log('Added the three posts and top plate, three motors with upper arms, the paired forearm rods and the travelling plate with a tool hub (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic cartesian gantry robot',
    desc: (v) => `Cartesian gantry robot, ${v.kind}: ${v.legs ? 'four posts carrying two overhead rails' : 'two base rails with carriages'}, a cross beam on carriages, a vertical Z axis with a motor and a tool plate, a cable chain and a work table.`,
    vs: [['tabletop, 40 x 30 in', 40, 30, 32, false, 'tabletop'], ['portal on floor rails, 80 x 48 in', 80, 48, 56, false, 'floor portal'], ['overhead on four posts, 120 x 72 in', 120, 72, 96, true, 'overhead']].map(([l, w, d, h, legs, kind]) => [l, w, d, h, 0, { legs, kind }]),
    build: (a, v) => {
      const W = a.W, D = a.D, H = a.H, z0 = a.Z0, cx = a.cx, ts = m.min(W, D) * 0.05, rz = v.legs ? z0 + H * 0.8 : z0 + H * 0.6;
      if (v.legs) {
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) { a.box(cx + sx * (W / 2 - ts) - ts, a.cy + sy * (D / 2 - ts) - ts, z0, cx + sx * (W / 2 - ts) + ts, a.cy + sy * (D / 2 - ts) + ts, rz + ts); a.box(cx + sx * (W / 2 - ts) - ts * 1.8, a.cy + sy * (D / 2 - ts) - ts * 1.8, z0, cx + sx * (W / 2 - ts) + ts * 1.8, a.cy + sy * (D / 2 - ts) + ts * 1.8, z0 + 10); }
        for (const sx of [-1, 1]) { a.box(cx + sx * (W / 2 - ts) - ts, a.YF + ts * 0.2, rz, cx + sx * (W / 2 - ts) + ts, a.YB - ts * 0.2, rz + ts * 2); }
        for (const sy of [-1, 1]) a.box(cx - W / 2 + ts * 2, a.cy + sy * (D / 2 - ts) - ts * 0.8, rz - ts * 0.5, cx + W / 2 - ts * 2, a.cy + sy * (D / 2 - ts) + ts * 0.8, rz + ts * 1.2);
        a.rect(a.X0, a.YF, a.X1, a.YB);
      } else {
        a.box(a.X0 + W * 0.04, a.YF + D * 0.04, z0, a.X1 - W * 0.04, a.YB - D * 0.04, z0 + H * 0.12); a.rect(a.X0 + W * 0.04, a.YF + D * 0.04, a.X1 - W * 0.04, a.YB - D * 0.04);
        for (const sx of [-1, 1]) { a.box(cx + sx * (W * 0.44) - ts, a.YF + D * 0.02, z0 + H * 0.12, cx + sx * (W * 0.44) + ts, a.YB - D * 0.02, rz); a.rect(cx + sx * (W * 0.44) - ts, a.YF + D * 0.02, cx + sx * (W * 0.44) + ts, a.YB - D * 0.02, 'EQUIP-DETAIL'); }
      }
      const by = a.cy, bw = ts * 2.2, bz = rz + (v.legs ? -ts * 1.5 : ts * 0.0);
      const cw = W * (v.legs ? 0.92 : 0.9);
      a.box(cx - cw / 2, by - bw / 2, bz + ts, cx + cw / 2, by + bw / 2, bz + ts * 3.4);
      for (const sx of [-1, 1]) a.box(cx + sx * (W * (v.legs ? 0.44 : 0.44)) - ts * 1.3, by - bw * 0.8, bz, cx + sx * (W * 0.44) + ts * 1.3, by + bw * 0.8, bz + ts * 1.1);
      const zx = cx + W * 0.1, zlow = z0 + H * 0.2 + ts * 1.6;
      a.box(zx - ts * 1.2, by - bw / 2 - ts, bz + ts, zx + ts * 1.2, by - bw / 2, bz + ts * 3.4);
      a.box(zx - ts * 0.8, by - bw / 2 - ts * 2.2, zlow, zx + ts * 0.8, by - bw / 2 - ts, bz + ts * 3.4); a.box(zx - ts * 1.4, by - bw / 2 - ts * 3.6, zlow, zx + ts * 1.4, by - bw / 2 - ts * 2.2, zlow + ts * 0.8);
      a.cyl(zx, by - bw / 2 - ts * 1.6, bz + ts * 3.4, bz + ts * 5.4, ts * 1.0, 14); a.cyl(zx, by - bw / 2 - ts * 3.0, zlow - ts * 1.6, zlow, ts * 0.3, 10);
      for (let i = 0; i < 9; i++) a.box(cx - cw / 2 + ts * 2 + i * ts * 1.6, by + bw / 2, bz + ts * 1.2, cx - cw / 2 + ts * 3.3 + i * ts * 1.6, by + bw / 2 + ts * 1.4, bz + ts * 3.2);
      a.rect(cx - cw / 2, by - bw / 2, cx + cw / 2, by + bw / 2, 'EQUIP-DETAIL'); a.circ(zx, by - bw / 2 - ts * 1.6, ts, 'EQUIP-DETAIL');
      a.log('Added the rails or posts, the cross beam on carriages, the Z axis with motor and tool plate and the cable chain (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic parallel gripper',
    desc: (v) => `Parallel jaw gripper, ${v.st} mm stroke, shown open: a tool flange, a rectangular body with rail cover, two sliding jaws with replaceable finger pads and two air ports.`,
    vs: [[20, 55, 40], [60, 100, 60], [160, 230, 110]].map(([st, w, h]) => [`${st} mm stroke`, mi(w), mi(w * 0.62), mi(h + w * 0.2), 0, { st, w0: w, h0: h }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, w = v.w0, bd = a.D * 0.78, bh = v.h0 * 0.5, zt = a.Z1, fr = m.min(w * 0.3, 40), by = cy;
      grip.flange(a, cx, cy, zt, fr); a.box(cx - w * 0.3, by - bd / 2, zt - fr * 0.32 - bh, cx + w * 0.3, by + bd / 2, zt - fr * 0.32);
      a.box(cx - w / 2, by - bd / 2, zt - fr * 0.32 - bh, cx + w / 2, by + bd / 2, zt - fr * 0.32 - bh * 0.45); a.box(cx - w * 0.28, by - bd * 0.46, zt - fr * 0.32, cx + w * 0.28, by + bd * 0.46, zt - fr * 0.32 + 1);
      const fz0 = a.Z0, fz1 = zt - fr * 0.32 - bh * 0.45, jt = w * 0.1;
      for (const s of [-1, 1]) { a.box(cx + s * (w / 2 - jt) - jt * 0.5, by - bd * 0.46, fz0 + (fz1 - fz0) * 0.0, cx + s * (w / 2 - jt) + jt * 0.5 + 0, by + bd * 0.46, fz1); a.box(cx + s * (w / 2 - jt * 2.0) - jt * 0.5, by - bd * 0.46, fz0, cx + s * (w / 2 - jt * 2.0) + jt * 0.5, by + bd * 0.46, fz0 + (fz1 - fz0) * 0.55); }
      for (const s of [-1, 1]) { a.cyl(cx + s * w * 0.2, by - bd / 2 - 2, zt - fr * 0.32 - bh * 0.7, zt - fr * 0.32 - bh * 0.7 + 0.01, 0.01, 3); a.ycyl(by - bd / 2 - 8, by - bd / 2, cx + s * w * 0.18, zt - fr * 0.32 - bh * 0.7, w * 0.035, 8); }
      a.rect(cx - w / 2, by - bd / 2, cx + w / 2, by + bd / 2); a.circ(cx, cy, fr, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.rect(cx + s * (w / 2 - jt * 2.0) - jt * 0.5, by - bd * 0.46, cx + s * (w / 2 - jt * 2.0) + jt * 0.5, by + bd * 0.46, 'EQUIP-DETAIL');
      a.log('Added the tool flange, the body with rail cover, the two jaws with finger pads and the air ports (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic vacuum gripper',
    desc: (v) => `Vacuum gripper with ${v.n} suction cup${v.n > 1 ? 's' : ''}: a tool flange, a ${v.n > 1 ? 'manifold plate with a vacuum port' : 'stem with a spring plunger'} and bellows cups with lips drawn as stepped cones.`,
    vs: [['one bellows cup, 40 mm', 1, 50, 120], ['four cups on a cross plate, 300 mm', 4, 300, 150], ['twelve cups on a plate, 600 mm', 12, 600, 170]].map(([l, n, w, h]) => [l, mi(n === 12 ? w : w), mi(n === 12 ? w * 0.5 : n === 4 ? w : w), mi(h), 0, { n, w }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, zt = a.Z1, n = v.n, cup = (x, y, zb, r) => { a.cyl(x, y, zb, zb + r * 0.4, r * 0.35, 10); a.cone(x, y, zb - r * 0.1, zb + r * 0.1, r, r * 0.8, 14); a.cone(x, y, zb + r * 0.1, zb + r * 0.35, r * 0.8, r * 0.5, 14); a.cone(x, y, zb + r * 0.35, zb + r * 0.6, r * 0.5, r * 0.75, 14); a.cone(x, y, zb + r * 0.6, zb + r * 0.85, r * 0.75, r * 0.4, 14); a.circ(x, y, r, 'EQUIP-DETAIL'); };
      if (n === 1) { grip.flange(a, cx, cy, zt, 25); a.cyl(cx, cy, a.Z0 + 20, zt - 8, 11, 12); a.cyl(cx, cy, zt - 75, zt - 60, 16, 14); a.ycyl(cy, cy + 16, cx + 15, zt - 40, 3.5, 8); cup(cx, cy, a.Z0 + 4, 20); a.circ(cx, cy, 25); }
      else {
        const pw = v.w, pd = n === 4 ? v.w : v.w * 0.5, th = 20, cr0 = n === 4 ? 36 * 1.3 : 36 * 0.9, zp = a.Z0 + cr0 * 0.85 + th;
        grip.flange(a, cx, cy, zt, 40); a.cyl(cx, cy, zp, zt - 10, 25, 14); a.box(cx - pw / 2, cy - pd / 2, zp - th, cx + pw / 2, cy + pd / 2, zp);
        if (n === 4) { a.box(cx - pw * 0.5, cy - 14, zp, cx + pw * 0.5, cy + 14, zp + 10); a.box(cx - 14, cy - pd * 0.5, zp, cx + 14, cy + pd * 0.5, zp + 10); a.ycyl(cy + 14, cy + 40, cx + 40, zp + 25, 8, 8); }
        const cols = n === 4 ? 2 : 6, rows = n === 4 ? 2 : 2, cr = n === 4 ? 36 : 36;
        const pos = n === 4 ? [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => [cx + sx * pw * 0.36, cy + sy * pd * 0.36]) : Array.from({ length: 12 }, (_, i) => [cx - pw / 2 + (pw * (i % 6 + 0.5)) / 6, cy + (i < 6 ? -1 : 1) * pd * 0.22]);
        for (const [px, py] of pos) cup(px, py, a.Z0, cr * (n === 4 ? 1.3 : 0.9)); 
        a.rect(cx - pw / 2, cy - pd / 2, cx + pw / 2, cy + pd / 2); a.circ(cx, cy, 40, 'EQUIP-DETAIL');
      }
      a.log('Added the tool flange, the ' + (n > 1 ? 'manifold plate with port' : 'plunger stem') + ' and the bellows cups (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic robot end effector',
    desc: (v) => v.k === 0 ? 'Automatic tool changer: a master plate with a bolt circle and a ring of locking balls, an air ring, and a tool plate with a pilot pin, shown mated.' : v.k === 1 ? 'Welding torch on a robot flange: a mounting collar, a swan-neck tube, a gas nozzle and a wire feed conduit with a clamp.' : 'Screwdriving spindle: a flange, a motor body with a cable gland, a bit holder and a bit with a hex shank.',
    vs: [['tool changer, 90 mm', 0, 90, 100], ['welding torch, angled neck', 1, 90, 340], ['screwdriving spindle', 2, 70, 260]].map(([l, k, w, h]) => [l, mi(k === 1 ? 260 : w), mi(k === 1 ? 110 : w), mi(h), 0, { k, w }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, zt = a.Z1;
      if (v.k === 0) { const r = 45; grip.flange(a, cx, cy, zt, r); a.cyl(cx, cy, zt - 40, zt - 8, r * 0.95, 24); for (let i = 0; i < 8; i++) { const t = (TAU * i) / 8; a.ell(cx + r * 0.95 * m.cos(t), cy + r * 0.95 * m.sin(t), zt - 26, 4, 4, 4, 6, 4); } a.cyl(cx, cy, zt - 46, zt - 40, r * 1.02, 24); a.cyl(cx, cy, zt - 80, zt - 46, r * 0.9, 24); a.cyl(cx, cy, a.Z0, zt - 80, r * 0.5, 16); for (let i = 0; i < 3; i++) { const t = (TAU * i) / 3; a.cyl(cx + r * 0.55 * m.cos(t), cy + r * 0.55 * m.sin(t), zt - 92, zt - 80, 5, 8); } a.circ(cx, cy, r); a.circ(cx, cy, r * 0.5, 'EQUIP-DETAIL'); }
      else if (v.k === 1) { const r = 34; a.cyl(cx - 90, cy, zt - 25, zt, r, 20); a.cyl(cx - 90, cy, zt - 55, zt - 25, r * 0.7, 16); const p0 = [cx - 90, cy, zt - 55], p1 = [cx - 60, cy, zt - 130], p2 = [cx + 20, cy, zt - 215], p3 = [cx + 70, cy, a.Z0 + 55]; a.tube([p0, p1, p2, p3], [14, 15, 15, 14], 10); a.cone(p3[0], p3[1], a.Z0 + 20, a.Z0 + 55, 12, 17, 12); a.cone(p3[0], p3[1], a.Z0 + 2, a.Z0 + 20, 8, 12, 12); a.cyl(cx - 85, cy, zt - 30, zt - 12, 0.01 + 8, 8); a.tube([[cx - 100, cy + 15, zt - 20], [cx - 112, cy + 30, zt - 60], [cx - 100, cy + 40, zt - 100], [cx - 40, cy + 40, zt - 170]], [4, 4, 4, 4], 6); a.rect(cx - 90 - r, cy - r, cx - 90 + r, cy + r); a.line(cx - 90, cy, cx + 70, cy, 'EQUIP-DETAIL'); a.circ(cx + 70, cy, 17, 'EQUIP-DETAIL'); }
      else { const r = 32; grip.flange(a, cx, cy, zt, r); a.cyl(cx, cy, zt - 160, zt - 14, r * 0.85, 20); a.cyl(cx + r * 0.7, cy, zt - 100, zt - 70, 8, 8); a.cyl(cx, cy, zt - 200, zt - 160, r * 0.55, 16); a.cyl(cx, cy, zt - 240, zt - 200, 7, 10); a.prism(ptsC(cx, cy, 5, 6), a.Z0, zt - 240); a.circ(cx, cy, r); a.circ(cx, cy, 7, 'EQUIP-DETAIL'); a.circ(cx, cy, 5, 'EQUIP-DETAIL'); }
      a.log('Added ' + (v.k === 0 ? 'the master and tool plates, the locking balls and the pilot pin' : v.k === 1 ? 'the collar, swan-neck tube, nozzle and wire conduit' : 'the flange, motor body, bit holder and bit') + ' (plan and 3D).');
    } }),
];

// ============================================================================================= MOBILE
const wheelY = (a, x, y, zc, r, w, hub = true) => { a.xcyl(x - w / 2, x + w / 2, y, zc, r, 20); if (hub) { a.xcyl(x - w / 2 - 2, x + w / 2 + 2, y, zc, r * 0.55, 14); a.xcyl(x - w / 2 - 4, x + w / 2 + 4, y, zc, r * 0.18, 8); } a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL'); };
const mobile = [
  fam({ cat: 'robotics/mobile', title: 'Generic automated tugger vehicle',
    desc: (v) => `Automated tugger vehicle, ${v.L} mm long, towing carts: a low chassis with a sloped body, a bumper with a safety scanner, two e-stop buttons, a beacon, side skirts over four wheels and a rear hitch plate with a pin.`,
    vs: [['small, 1000 mm', 1000, 600, 560], ['large, 1600 mm', 1600, 850, 820]].map(([l, L, W, H]) => [l, mi(W), mi(L), mi(H), 0, { L, W, H }]),
    build: (a, v) => {
      const { L, W, H } = v, cx = a.cx, yf = a.YF, yb = a.YB, z0 = a.Z0, gc = H * 0.08, wr = H * 0.17;
      a.box(a.X0 + W * 0.06, yf + L * 0.06, z0 + gc, a.X1 - W * 0.06, yb - L * 0.08, z0 + gc + H * 0.1);
      prismX(a, [[yf + L * 0.02, z0 + H * 0.2], [yb - L * 0.1, z0 + H * 0.2], [yb - L * 0.1, z0 + H * 0.66], [yb - L * 0.38, z0 + H * 0.74], [yf + L * 0.26, z0 + H * 0.52], [yf + L * 0.02, z0 + H * 0.4]], a.X0 + W * 0.05, a.X1 - W * 0.05);
      a.box(a.X0 + W * 0.02, yf, z0 + H * 0.13, a.X1 - W * 0.02, yf + L * 0.04, z0 + H * 0.34); a.box(cx - W * 0.3, yf - 0.0, z0 + H * 0.2, cx + W * 0.3, yf + L * 0.02, z0 + H * 0.25);
      for (const sx of [-1, 1]) for (const yy of [yf + L * 0.22, yb - L * 0.28]) { a.box(cx + sx * W * 0.5 - (sx > 0 ? 8 : 0), yy - wr * 1.3, z0 + gc, cx + sx * W * 0.5 + (sx > 0 ? 0 : 8), yy + wr * 1.3, z0 + H * 0.33); wheelY(a, cx + sx * (W * 0.5 - 2), yy, z0 + wr, wr, W * 0.1); }
      puck(a, cx, yf + L * 0.04, z0 + H * 0.34, W * 0.06, H * 0.12); beaconAt(a, cx, yb - L * 0.3, z0 + H * 0.74, W * 0.04, H * 0.2);
      for (const sx of [-1, 1]) estop(a, cx + sx * W * 0.28, yf + L * 0.3, z0 + H * 0.5, W * 0.025);
      a.box(cx - W * 0.3, yb - L * 0.08, z0 + H * 0.12, cx + W * 0.3, yb, z0 + H * 0.28); a.cyl(cx, yb - L * 0.03, z0 + H * 0.28, z0 + H * 0.4, W * 0.025, 8);
      a.rect(a.X0 + W * 0.05, yf, a.X1 - W * 0.05, yb - L * 0.08); a.rect(cx - W * 0.3, yb - L * 0.08, cx + W * 0.3, yb, 'EQUIP-DETAIL'); a.circ(cx, yb - L * 0.03, W * 0.025, 'EQUIP-DETAIL'); for (const sx of [-1, 1]) for (const yy of [yf + L * 0.22, yb - L * 0.28]) a.rect(cx + sx * W * 0.5 - W * 0.05, yy - wr, cx + sx * W * 0.5 + W * 0.05, yy + wr, 'EQUIP-HIDDEN');
      a.log('Added the chassis, sloped body, bumper with scanner, e-stops, beacon, wheels and the rear hitch (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic autonomous mobile robot',
    desc: (v) => `Autonomous mobile robot, ${v.L} mm long, ${v.top}: a low body with chamfered corners and a bumper skirt, two scanners on opposite corners, a light strip, an e-stop and a top deck${v.top.includes('roller') ? ' of cross rollers in a frame' : v.top.includes('lift') ? ' with a round lift plate' : ''}.`,
    vs: [['low platform with lift plate, 800 mm', 800, 600, 300, 'with a lift plate'], ['flat deck, 1100 mm', 1100, 700, 350, 'with a flat deck'], ['flat deck with rails, 1400 mm', 1400, 900, 400, 'with a railed deck'], ['roller top, 1000 mm', 1000, 700, 420, 'with a roller deck'], ['roller top, 1500 mm', 1500, 900, 480, 'with a roller deck']].map(([l, L, W, H, top]) => [l, mi(W), mi(L), mi(H), 0, { L, W, H, top }]),
    build: (a, v) => {
      const { L, W, H, top } = v, cx = a.cx, yf = a.YF, yb = a.YB, z0 = a.Z0, c = W * 0.1, gc = H * 0.06, zb = z0 + gc, zk = z0 + H * 0.62;
      const oct = (x0, y0, x1, y1, c) => [[x0 + c, y0], [x1 - c, y0], [x1, y0 + c], [x1, y1 - c], [x1 - c, y1], [x0 + c, y1], [x0, y1 - c], [x0, y0 + c]];
      a.prism(oct(a.X0, yf, a.X1, yb, c), zb, zk); a.prism(oct(a.X0 - 0 + 6, yf + 6, a.X1 - 6, yb - 6, c), zk, z0 + H * 0.7);
      a.prism(oct(a.X0, yf, a.X1, yb, c), zb, zb + H * 0.12); 
      a.box(cx - W * 0.3, yf - 0, z0 + H * 0.4, cx + W * 0.3, yf + 4, z0 + H * 0.46); a.box(cx - W * 0.3, yb - 4, z0 + H * 0.4, cx + W * 0.3, yb, z0 + H * 0.46);
      const zd = z0 + H * 0.7;
      if (top.includes('roller')) { a.box(a.X0 + 12, yf + 20, zd, a.X0 + 30, yb - 20, a.Z1 - 20); a.box(a.X1 - 30, yf + 20, zd, a.X1 - 12, yb - 20, a.Z1 - 20); const n = m.floor((L - 80) / 70); for (let i = 0; i < n; i++) a.xcyl(a.X0 + 30, a.X1 - 30, yf + 40 + (i * (L - 80)) / (n - 1 || 1), a.Z1 - 28, 18, 10); for (let i = 0; i < n; i++) a.line(a.X0 + 30, yf + 40 + (i * (L - 80)) / (n - 1 || 1), a.X1 - 30, yf + 40 + (i * (L - 80)) / (n - 1 || 1), 'EQUIP-DETAIL'); }
      else if (top.includes('lift')) { a.cyl(cx, a.cy, zd, zd + H * 0.12, W * 0.28, 24); a.cyl(cx, a.cy, zd + H * 0.12, zd + H * 0.16, W * 0.3, 24); a.circ(cx, a.cy, W * 0.3, 'EQUIP-DETAIL'); }
      else { a.box(a.X0 + 20, yf + 20, zd, a.X1 - 20, yb - 20, zd + 6); if (top.includes('rail')) for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 24) - 8, yf + 30, zd + 6, cx + sx * (W / 2 - 24) + 8, yb - 30, a.Z1); a.rect(a.X0 + 20, yf + 20, a.X1 - 20, yb - 20, 'EQUIP-DETAIL'); }
      puck(a, a.X0 + c * 0.8, yf + c * 0.8, z0 + H * 0.3, W * 0.05, H * 0.1); puck(a, a.X1 - c * 0.8, yb - c * 0.8, z0 + H * 0.3, W * 0.05, H * 0.1);
      estop(a, a.X1 - W * 0.2, yf + L * 0.12, z0 + H * 0.7, W * 0.022); a.box(a.X0 + W * 0.1, yf + L * 0.02, z0 + H * 0.58, a.X1 - W * 0.1, yf + L * 0.04 + 2, z0 + H * 0.62);
      a.poly(oct(a.X0, yf, a.X1, yb, c)); a.poly(oct(a.X0 + 6, yf + 6, a.X1 - 6, yb - 6, c), 'EQUIP-DETAIL'); a.circ(a.X0 + c * 0.8, yf + c * 0.8, W * 0.05, 'EQUIP-DETAIL'); a.circ(a.X1 - c * 0.8, yb - c * 0.8, W * 0.05, 'EQUIP-DETAIL'); a.circ(a.X1 - W * 0.2, yf + L * 0.12, W * 0.022, 'EQUIP-DETAIL');
      a.log('Added the chamfered body with skirt, two scanners, the light strip, the e-stop and the top deck (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic autonomous forklift vehicle',
    desc: (v) => `Autonomous pallet forklift vehicle, ${v.cap} t class: a rear power body with a beacon and scanner, a two-upright mast with a carriage and backrest, two forks and load wheels under the fork tips, a steering wheel at the rear and a mast scanner.`,
    vs: [['1.0 t class', 1.0, 2000, 900, 2100], ['1.6 t class', 1.6, 2400, 1100, 2400]].map(([l, cap, L, W, H]) => [l, mi(W), mi(L), mi(H), 0, { cap, L, W, H }]),
    build: (a, v) => {
      const { L, W, H } = v, cx = a.cx, yf = a.YF, yb = a.YB, z0 = a.Z0, mastY = yf + L * 0.42;
      a.box(a.X0 + W * 0.05, mastY, z0 + H * 0.06, a.X1 - W * 0.05, yb, z0 + H * 0.38);
      prismX(a, [[mastY, z0 + H * 0.38], [yb, z0 + H * 0.38], [yb - L * 0.04, z0 + H * 0.5], [mastY + L * 0.12, z0 + H * 0.5]], a.X0 + W * 0.08, a.X1 - W * 0.08);
      for (const sx of [-1, 1]) { a.box(cx + sx * W * 0.34 - 38, mastY - 60, z0 + H * 0.06, cx + sx * W * 0.34 + 38, mastY, a.Z1 - H * 0.04); a.box(cx + sx * W * 0.34 - 25, mastY - 10, z0 + H * 0.06, cx + sx * W * 0.34 + 25, mastY + 60, a.Z1 - H * 0.04); }
      a.box(cx - W * 0.36, mastY - 70, a.Z1 - H * 0.05 - 30, cx + W * 0.36, mastY - 20, a.Z1 - H * 0.05); a.box(cx - W * 0.36, mastY - 66, z0 + H * 0.16, cx + W * 0.36, mastY - 20, z0 + H * 0.16 + 90);
      for (let i = 0; i < 4; i++) a.box(cx - W * 0.36, mastY - 86, z0 + H * 0.16 + 90 + i * H * 0.07, cx + W * 0.36, mastY - 70, z0 + H * 0.16 + 90 + i * H * 0.07 + 30);
      for (const sx of [-1, 1]) { a.box(cx + sx * W * 0.26 - 50, yf, z0 + H * 0.06, cx + sx * W * 0.26 + 50, mastY - 66, z0 + H * 0.06 + 55); a.box(cx + sx * W * 0.26 - 50, mastY - 86, z0 + H * 0.06, cx + sx * W * 0.26 + 50, mastY - 66, z0 + H * 0.28); wheelY(a, cx + sx * W * 0.26, yf + L * 0.3, z0 + H * 0.035, H * 0.035, 60, false); a.box(cx + sx * W * 0.26 - 50, yf, z0 + H * 0.06 + 55, cx + sx * W * 0.26 + 50, yf + 60, z0 + H * 0.06 + 40); a.rect(cx + sx * W * 0.26 - 50, yf, cx + sx * W * 0.26 + 50, mastY - 66); }
      wheelY(a, cx, yb - L * 0.12, z0 + H * 0.06 + 0, H * 0.06, W * 0.12); a.cyl(cx, yb - L * 0.12, z0 + H * 0.06, z0 + H * 0.38, H * 0.045, 12);
      puck(a, cx, mastY + L * 0.04, a.Z1 - H * 0.04, W * 0.05, H * 0.04); beaconAt(a, cx + W * 0.3, yb - L * 0.1, z0 + H * 0.5, W * 0.035, H * 0.08); puck(a, cx, yf + 90, z0 + H * 0.12, W * 0.04, H * 0.03);
      a.rect(a.X0 + W * 0.05, mastY, a.X1 - W * 0.05, yb); a.rect(cx - W * 0.36, mastY - 86, cx + W * 0.36, mastY - 20, 'EQUIP-DETAIL'); for (const sx of [-1, 1]) a.rect(cx + sx * W * 0.34 - 38, mastY - 60, cx + sx * W * 0.34 + 38, mastY + 60, 'EQUIP-DETAIL');
      a.log('Added the power body, the mast with carriage and backrest, the two forks with load wheels, the steering wheel, the scanners and the beacon (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic tracked robot',
    desc: (v) => `Tracked robot, ${v.L} mm long: two track units each with a drive sprocket, an idler, road wheels and a lugged belt outline, a body deck, a mast with a camera head, two lamps and an antenna.`,
    vs: [['compact, 500 mm', 500, 380, 330, 3], ['medium, 900 mm', 900, 600, 520, 4], ['heavy, 1400 mm', 1400, 880, 760, 5]].map(([l, L, W, H, n]) => [l, mi(W), mi(L), mi(H), 0, { L, W, H, n }]),
    build: (a, v) => {
      const { L, W, H, n } = v, cx = a.cx, yf = a.YF, yb = a.YB, z0 = a.Z0, th = W * 0.24, th2 = H * 0.36, rr = th2 / 2;
      for (const sx of [-1, 1]) {
        const x0 = sx < 0 ? a.X0 : a.X1 - th, x1 = x0 + th, xc = (x0 + x1) / 2;
        prismX(a, [[yf + rr * 2.2, z0], [yb - rr * 2.2, z0], [yb - rr * 0.2, z0 + rr * 0.8], [yb - rr * 0.05, z0 + rr * 1.2], [yb - rr * 0.3, z0 + th2 + 0], [yb - rr * 1.5, z0 + th2 * 1.02], [yf + rr * 1.5, z0 + th2 * 1.02], [yf + rr * 0.3, z0 + th2], [yf + rr * 0.05, z0 + rr * 1.2], [yf + rr * 0.2, z0 + rr * 0.8]], x0, x1);
        for (let i = 0; i < 2 * n + 2; i++) { const yy = yf + rr * 2.2 + (i * (L - rr * 4.4)) / (2 * n + 1); a.box(x0 - 3, yy - 6, z0, x1 + 3, yy + 6, z0 + 12); }
        for (const [y, r] of [[yf + rr * 1.1, rr * 0.9], [yb - rr * 1.1, rr * 0.9]]) { a.xcyl(x0 - 6, x1 + 6, y, z0 + rr + 6, r * 0.85, 18); a.xcyl(x0 - 10, x1 + 10, y, z0 + rr + 6, r * 0.35, 10); }
        for (let i = 0; i < n; i++) { const y = yf + rr * 2.2 + (i * (L - rr * 4.4)) / (n - 1 || 1); a.xcyl(x0 - 4, x1 + 4, y, z0 + rr * 0.55, rr * 0.5, 14); }
        a.rect(x0, yf, x1, yb); for (let i = 0; i < 2 * n; i++) a.line(x0, yf + (i * L) / (2 * n), x1, yf + (i * L) / (2 * n), 'EQUIP-DETAIL');
      }
      const bx0 = a.X0 + th, bx1 = a.X1 - th, zk = z0 + th2 * 0.55;
      a.box(bx0 - 2, yf + L * 0.1, zk, bx1 + 2, yb - L * 0.08, zk + H * 0.22); prismX(a, [[yf + L * 0.1, zk + H * 0.22], [yb - L * 0.08, zk + H * 0.22], [yb - L * 0.12, zk + H * 0.3], [yf + L * 0.25, zk + H * 0.3]], bx0, bx1);
      a.cyl(cx, yb - L * 0.25, zk + H * 0.3, a.Z1 - H * 0.1, W * 0.025, 10); a.box(cx - W * 0.1, yb - L * 0.25 - W * 0.07, a.Z1 - H * 0.1, cx + W * 0.1, yb - L * 0.25 + W * 0.07, a.Z1 - H * 0.02); a.ycyl(yb - L * 0.25 - W * 0.07 - 8, yb - L * 0.25 - W * 0.07, cx, a.Z1 - H * 0.06, W * 0.035, 10);
      for (const sx of [-1, 1]) a.cyl(cx + sx * W * 0.16, yf + L * 0.28, zk + H * 0.29, zk + H * 0.29 + H * 0.08, W * 0.03, 10); a.tube([[cx - W * 0.17, yb - L * 0.15, zk + H * 0.28], [cx - W * 0.17, yb - L * 0.15, a.Z1]], [W * 0.012, W * 0.006], 6);
      a.circ(cx - W * 0.17, yb - L * 0.15, W * 0.012, 'EQUIP-DETAIL'); a.rect(bx0, yf + L * 0.1, bx1, yb - L * 0.08, 'EQUIP-DETAIL'); a.rect(cx - W * 0.1, yb - L * 0.25 - W * 0.07, cx + W * 0.1, yb - L * 0.25 + W * 0.07, 'EQUIP-DETAIL');
      a.log('Added the two track units with sprockets, idlers, road wheels and lugs, the body deck, the camera mast, lamps and antenna (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic six-wheel rover',
    desc: (v) => `Six-wheel rover, ${v.L} mm long: a body box with a top solar panel, a rocker arm and bogie on each side carrying three wheels with hubs and cleats, a mast with a camera head and a dish antenna.`,
    vs: [['small, 700 mm', 700, 520, 520], ['large, 1200 mm', 1200, 900, 880]].map(([l, L, W, H]) => [l, mi(W), mi(L), mi(H), 0, { L, W, H }]),
    build: (a, v) => {
      const { L, W, H } = v, cx = a.cx, yf = a.YF, yb = a.YB, z0 = a.Z0, wr = H * 0.17, ww = W * 0.12, zb = z0 + H * 0.34;
      a.box(cx - W * 0.3, yf + L * 0.2, zb, cx + W * 0.3, yb - L * 0.2, zb + H * 0.22); a.box(cx - W * 0.33, yf + L * 0.18, zb + H * 0.22, cx + W * 0.33, yb - L * 0.18, zb + H * 0.24); a.rect(cx - W * 0.33, yf + L * 0.18, cx + W * 0.33, yb - L * 0.18);
      a.box(cx - W * 0.28, yf + L * 0.22, zb + H * 0.24, cx + W * 0.28, yb - L * 0.22, zb + H * 0.255); for (let i = 1; i < 4; i++) a.line(cx - W * 0.28, yf + L * 0.22 + ((yb - yf - L * 0.44) * i) / 4, cx + W * 0.28, yf + L * 0.22 + ((yb - yf - L * 0.44) * i) / 4, 'EQUIP-DETAIL');
      for (const sx of [-1, 1]) {
        const xw = cx + sx * (W / 2 - ww / 2), yF = yf + wr * 1.1, yB = yb - wr * 1.1;
        a.tube([[cx + sx * W * 0.3, yf + L * 0.5, zb + H * 0.12], [xw, yf + L * 0.5, z0 + H * 0.3]], [W * 0.025, W * 0.025], 8);
        a.tube([[xw, yf + L * 0.3, z0 + H * 0.3], [xw, yf + L * 0.5, z0 + H * 0.3], [xw, yb - L * 0.1, z0 + H * 0.26]], [W * 0.022, W * 0.022, W * 0.022], 8);
        a.tube([[xw, yf + wr * 1.1, z0 + wr], [xw, yf + L * 0.3, z0 + H * 0.3]], [W * 0.02, W * 0.02], 8); a.tube([[xw, yb - L * 0.1, z0 + H * 0.26], [xw, yb - wr * 1.1, z0 + wr], [xw, yb - wr * 1.1, z0 + wr]], [W * 0.02, W * 0.02, W * 0.02], 8); a.tube([[xw, yb - L * 0.1, z0 + H * 0.26], [xw, yf + L * 0.5, z0 + wr]], [W * 0.02, W * 0.02], 8);
        for (const y of [yF, yf + L * 0.5, yB]) { whl(a, xw, y, wr, ww, z0 + wr); for (let i = 0; i < 10; i++) { const t = (TAU * i) / 10; a.box(xw - ww / 2, y + (wr - 1) * m.sin(t) - 5, z0 + wr + (wr - 1) * m.cos(t) - 5, xw + ww / 2, y + (wr + 5) * m.sin(t) + 5, z0 + wr + (wr + 5) * m.cos(t) + 5); } }
        a.line(xw, yF, xw, yB, 'EQUIP-DETAIL');
      }
      const mx = cx + W * 0.16, my = yb - L * 0.3; a.cyl(mx, my, zb + H * 0.255, a.Z1 - H * 0.08, W * 0.018, 10); a.box(mx - W * 0.08, my - W * 0.05, a.Z1 - H * 0.08, mx + W * 0.08, my + W * 0.05, a.Z1 - H * 0.01); a.ycyl(my - W * 0.05 - 8, my - W * 0.05, mx - W * 0.03, a.Z1 - H * 0.045, W * 0.025, 10); a.ycyl(my - W * 0.05 - 8, my - W * 0.05, mx + W * 0.03, a.Z1 - H * 0.045, W * 0.025, 10);
      a.cone(cx - W * 0.15, yf + L * 0.3, zb + H * 0.255, zb + H * 0.255 + H * 0.12, W * 0.015, W * 0.09, 14); a.cyl(cx - W * 0.15, yf + L * 0.3, zb + H * 0.255 + H * 0.12, zb + H * 0.255 + H * 0.125, W * 0.09, 14); a.circ(cx - W * 0.15, yf + L * 0.3, W * 0.09, 'EQUIP-DETAIL'); a.circ(mx, my, W * 0.02, 'EQUIP-DETAIL');
      a.log('Added the body with solar panel, the rocker and bogie arms, six cleated wheels, the camera mast and the dish (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic quadruped robot',
    desc: (v) => `Four-legged robot, ${v.L} mm long, standing: a body with a sensor head and a top lidar dome, four legs each with a hip joint, a thigh, a knee joint, a shin and a rubber foot.`,
    vs: [['small, 400 mm', 400], ['medium, 800 mm', 800], ['large, 1200 mm', 1200]].map(([l, L]) => [l, mi(L * 0.5), mi(L), mi(L * 0.62), 0, { L }]),
    build: (a, v) => {
      const L = v.L, cx = a.cx, yf = a.YF, yb = a.YB, z0 = a.Z0, W = a.W, bz = z0 + L * 0.36, bh = L * 0.17, bw = W * 0.58, by0 = yf + L * 0.14, by1 = yb - L * 0.14;
      a.box(cx - bw / 2, by0, bz, cx + bw / 2, by1, bz + bh); prismX(a, [[by0, bz + bh], [by1, bz + bh], [by1 - L * 0.04, bz + bh + L * 0.03], [by0 + L * 0.04, bz + bh + L * 0.03]], cx - bw * 0.45, cx + bw * 0.45);
      a.box(cx - bw * 0.42, yf, bz + bh * 0.15, cx + bw * 0.42, by0, bz + bh * 0.95); a.ycyl(yf - 4, yf + 2, cx - bw * 0.15, bz + bh * 0.6, L * 0.02, 10); a.ycyl(yf - 4, yf + 2, cx + bw * 0.15, bz + bh * 0.6, L * 0.02, 10); a.box(cx - bw * 0.3, yf + 2, bz + bh * 0.85, cx + bw * 0.3, by0, bz + bh * 1.05);
      a.cyl(cx, cx * 0 + (by0 + by1) / 2 + L * 0.05, bz + bh + L * 0.03, bz + bh + L * 0.08, L * 0.04, 16);
      for (const sx of [-1, 1]) for (const [yy, kd] of [[by0 + L * 0.08, 1], [by1 - L * 0.08, -1]]) {
        const hx = cx + sx * (bw / 2 + L * 0.02), hz = bz + bh * 0.5, kx = hx + sx * L * 0.02, ky = yy + kd * -L * 0.1, kz = z0 + L * 0.2, fx = hx + sx * L * 0.02, fy = yy, fz = z0 + L * 0.03;
        a.xcyl(hx - sx * L * 0.03, hx + sx * L * 0.03, yy, hz, L * 0.04, 14); limb(a, [hx, yy, hz], [kx, ky, kz + L * 0.02], L * 0.032, L * 0.026, 10); a.xcyl(kx - L * 0.02, kx + L * 0.02, ky, kz, L * 0.03, 12);
        limb(a, [kx, ky, kz], [fx, fy, fz + L * 0.01], L * 0.024, L * 0.016, 10); a.ell(fx, fy, fz, L * 0.024, L * 0.024, L * 0.024, 10, 6); a.circ(fx, fy, L * 0.024, 'EQUIP-DETAIL'); a.line(hx, yy, kx, ky, 'EQUIP-DETAIL');
      }
      a.rect(cx - bw / 2, by0, cx + bw / 2, by1); a.rect(cx - bw * 0.42, yf, cx + bw * 0.42, by0, 'EQUIP-DETAIL'); a.circ(cx, (by0 + by1) / 2 + L * 0.05, L * 0.04, 'EQUIP-DETAIL');
      a.log('Added the body with sensor head and lidar dome, and four legs with hips, thighs, knees, shins and feet (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic hexapod robot',
    desc: (v) => `Six-legged walking robot, ${v.S} mm across: a hexagonal body plate with a top deck and a front sensor, six legs each with a hip, a raised femur and a tibia ending in a foot.`,
    vs: [['small, 300 mm', 300], ['large, 600 mm', 600]].map(([l, S]) => [l, mi(S), mi(S), mi(S * 0.36), 0, { S }]),
    build: (a, v) => {
      const S = v.S, cx = a.cx, cy = a.cy, z0 = a.Z0, bz = z0 + S * 0.2, br = S * 0.17;
      a.prism(ptsC(cx, cy, br * 1.2, 6, 0.0), bz, bz + S * 0.04); a.prism(ptsC(cx, cy, br * 1.0, 6, 0.0), bz + S * 0.04, bz + S * 0.09); a.prism(ptsC(cx, cy, br * 0.8, 6, 0.0), bz - S * 0.025, bz); a.box(cx - S * 0.04, cy - br * 1.2 - S * 0.03, bz + S * 0.01, cx + S * 0.04, cy - br * 1.1, bz + S * 0.07); a.ycyl(cy - br * 1.2 - S * 0.04, cy - br * 1.2 - S * 0.03, cx, bz + S * 0.04, S * 0.02, 10);
      for (let i = 0; i < 6; i++) {
        const t = (TAU * i) / 6 + TAU / 12, ux = m.cos(t), uy = m.sin(t), hp = [cx + ux * br * 1.1, cy + uy * br * 1.1, bz + S * 0.02], kn = [cx + ux * S * 0.36, cy + uy * S * 0.36, bz + S * 0.12], ft = [cx + ux * S * 0.46, cy + uy * S * 0.46, z0 + S * 0.015];
        a.ell(hp[0], hp[1], hp[2], S * 0.035, S * 0.035, S * 0.035, 8, 5); limb(a, hp, kn, S * 0.022, S * 0.019, 8); a.ell(kn[0], kn[1], kn[2], S * 0.027, S * 0.027, S * 0.027, 8, 5); limb(a, kn, ft, S * 0.017, S * 0.01, 8); a.cyl(ft[0], ft[1], z0, z0 + S * 0.02, S * 0.014, 8);
        a.line(hp[0], hp[1], kn[0], kn[1], 'EQUIP-DETAIL'); a.line(kn[0], kn[1], ft[0], ft[1], 'EQUIP-DETAIL'); a.circ(ft[0], ft[1], S * 0.014, 'EQUIP-DETAIL');
      }
      a.poly(ptsC(cx, cy, br * 1.2, 6, 0.0));
      a.log('Added the hexagonal body plate and deck, the front sensor and six legs with hips, femurs, tibias and feet (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic quadcopter drone',
    desc: (v) => `Quadcopter drone, ${v.wb} mm motor-to-motor: a body with a battery on top, four arms to motors with two-blade propellers drawn as flat discs and blades, two landing skids and a camera gimbal under the nose.`,
    vs: [['250 mm class', 250], ['450 mm class', 450], ['800 mm class', 800]].map(([l, wb]) => [l, mi(wb * 1.27), mi(wb * 1.27), mi(wb * 0.34), 0, { wb }]),
    build: (a, v) => {
      const wb = v.wb, cx = a.cx, cy = a.cy, z0 = a.Z0, rp = wb * 0.28, d = wb * 0.3536, bz = z0 + wb * 0.17, bh = wb * 0.07, br = wb * 0.11;
      a.prism(ptsC(cx, cy, br * 1.2, 8, 0.39), bz, bz + bh); a.box(cx - br * 0.8, cy - br * 1.0, bz + bh, cx + br * 0.8, cy + br * 1.0, bz + bh + wb * 0.05); a.box(cx - br * 0.5, cy - br * 1.5, bz + bh * 0.2, cx + br * 0.5, cy - br * 1.0, bz + bh * 0.9);
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const mx = cx + sx * d, my = cy + sy * d, mz = bz + bh * 0.65;
        a.tube([[cx + sx * br * 0.5, cy + sy * br * 0.5, bz + bh * 0.5], [mx, my, mz]], [wb * 0.014, wb * 0.012], 6); a.cyl(mx, my, mz - wb * 0.01, mz + wb * 0.055, wb * 0.034, 14); a.cyl(mx, my, mz + wb * 0.055, mz + wb * 0.065, wb * 0.014, 8);
        const bl = rp, ang = sx * sy > 0 ? 0.55 : -0.55; for (const k of [0, 1]) { const th = ang + k * m.PI; bar(a, 'z', [mx - bl * m.cos(th) * 0.0, my], [mx + bl * m.cos(th), my + bl * m.sin(th)], wb * 0.03, mz + wb * 0.065, mz + wb * 0.072, false); }
        a.circ(mx, my, rp, 'EQUIP-DETAIL'); a.circ(mx, my, wb * 0.034, 'EQUIP');
      }
      for (const sx of [-1, 1]) { const lx = cx + sx * br * 1.1; a.tube([[lx, cy - wb * 0.2, z0 + wb * 0.012], [lx, cy - wb * 0.2, z0 + wb * 0.012]], [wb * 0.008, wb * 0.008], 6); a.tube([[lx, cy - wb * 0.2, z0 + wb * 0.012], [lx, cy + wb * 0.2, z0 + wb * 0.012]], [wb * 0.008, wb * 0.008], 6); for (const yy of [-0.12, 0.12]) a.tube([[lx, cy + wb * yy * 1.2, z0 + wb * 0.012], [cx + sx * br * 0.8, cy + wb * yy, bz]], [wb * 0.008, wb * 0.008], 6); a.line(lx, cy - wb * 0.2, lx, cy + wb * 0.2, 'EQUIP-DETAIL'); }
      a.ell(cx, cy - br * 1.25, bz - wb * 0.01, wb * 0.035, wb * 0.035, wb * 0.035, 10, 6); a.ycyl(cy - br * 1.25 - wb * 0.05, cy - br * 1.25 - wb * 0.03, cx, bz - wb * 0.01, wb * 0.016, 10);
      a.poly(ptsC(cx, cy, br * 1.2, 8, 0.39)); a.circ(cx, cy - br * 1.25, wb * 0.035, 'EQUIP-DETAIL');
      a.log('Added the body with battery, four arms with motors, the propeller discs and blades, the landing skids and the camera gimbal (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic humanoid robot',
    desc: (v) => `Humanoid robot scale shape, ${v.Hm} mm tall, standing with arms slightly out: a head with a visor, neck, chest and pelvis blocks, shoulder, elbow and wrist joints, hands, hip, knee and ankle joints and flat feet.`,
    vs: [['hobby, 500 mm', 500], ['mid, 1200 mm', 1200], ['full, 1750 mm', 1750]].map(([l, Hm]) => [l, mi(Hm * 0.42), mi(Hm * 0.2), mi(Hm), 0, { Hm }]),
    build: (a, v) => {
      const H = v.Hm, cx = a.cx, cy = a.cy, z0 = a.Z0, Z = (f) => z0 + f * H, sw = H * 0.115, hw = H * 0.055;
      for (const sx of [-1, 1]) {
        const hx = cx + sx * hw, kx = hx + sx * H * 0.005, ax = kx; limb(a, [hx, cy, Z(0.5)], [kx, cy + H * 0.005, Z(0.285)], H * 0.032, H * 0.026, 10); a.ell(kx, cy, Z(0.285), H * 0.03, H * 0.03, H * 0.03, 10, 6); limb(a, [kx, cy + H * 0.005, Z(0.285)], [ax, cy, Z(0.06)], H * 0.025, H * 0.018, 10);
        a.ell(hx, cy, Z(0.5), H * 0.036, H * 0.036, H * 0.036, 10, 6); a.xcyl(ax - H * 0.018, ax + H * 0.018, cy, Z(0.045), H * 0.02, 10); a.box(ax - H * 0.03, cy - H * 0.1, z0, ax + H * 0.03, cy + H * 0.05, Z(0.035)); a.rect(ax - H * 0.03, cy - H * 0.1, ax + H * 0.03, cy + H * 0.05); 
        const shx = cx + sx * sw, ex = shx + sx * H * 0.05, hnx = ex + sx * H * 0.02; a.ell(shx, cy, Z(0.805), H * 0.036, H * 0.036, H * 0.036, 10, 6); limb(a, [shx, cy, Z(0.805)], [ex, cy, Z(0.62)], H * 0.027, H * 0.023, 10); a.ell(ex, cy, Z(0.62), H * 0.024, H * 0.024, H * 0.024, 10, 6); limb(a, [ex, cy, Z(0.62)], [hnx, cy - H * 0.02, Z(0.46)], H * 0.021, H * 0.016, 10); a.box(hnx - H * 0.016, cy - H * 0.05, Z(0.4), hnx + H * 0.016, cy + H * 0.01, Z(0.46)); a.circ(shx, cy, H * 0.036, 'EQUIP-DETAIL'); a.circ(hnx, cy - H * 0.02, H * 0.018, 'EQUIP-DETAIL');
      }
      a.box(cx - H * 0.075, cy - H * 0.045, Z(0.48), cx + H * 0.075, cy + H * 0.05, Z(0.54)); a.box(cx - H * 0.09, cy - H * 0.06, Z(0.54), cx + H * 0.09, cy + H * 0.06, Z(0.83)); a.box(cx - H * 0.06, cy - H * 0.068, Z(0.66), cx + H * 0.06, cy - H * 0.06, Z(0.78)); a.cyl(cx, cy, Z(0.83), Z(0.87), H * 0.022, 10);
      a.ell(cx, cy, Z(0.93), H * 0.062, H * 0.058, H * 0.068, 14, 8); a.box(cx - H * 0.045, cy - H * 0.07, Z(0.915), cx + H * 0.045, cy - H * 0.052, Z(0.955));
      a.rect(cx - sw - H * 0.04, cy - H * 0.06, cx + sw + H * 0.04, cy + H * 0.06, 'EQUIP-DETAIL'); a.circ(cx, cy, H * 0.06, 'EQUIP-DETAIL');
      a.log('Added the head with visor, the chest and pelvis, both arms with joints and hands, both legs with joints and flat feet (plan and 3D).');
    } }),
];

// ============================================================================================= PARTS
const parts = [
  fam({ cat: 'robotics/parts', title: 'Generic hobby servo',
    desc: (v) => `${v.cls} servo, ${v.L} mm case: a rectangular case with a mounting ear on each end with two holes, a stepped top cover, an output boss with a splined hub and a round horn with a screw, and a wire leaving the side.`,
    vs: [['micro, 23 mm', 23, 12, 24, 'Micro'], ['standard, 40 mm', 40, 20, 37, 'Standard'], ['large, 65 mm', 65, 30, 48, 'Large']].map(([l, L, Wd, H, cls]) => [l, mi(L * 1.36), mi(Wd), mi(H + L * 0.12), 0, { L, Wd, H, cls }]),
    build: (a, v) => {
      const { L, Wd, H } = v, cx = a.cx, y = a.cy, z0 = a.Z0, ear = L * 0.18, ez = z0 + H * 0.68, et = H * 0.07;
      a.box(cx - L / 2, y - Wd / 2, z0, cx + L / 2, y + Wd / 2, z0 + H * 0.78); a.box(cx - L / 2 + 1, y - Wd / 2 + 1, z0 + H * 0.78, cx + L / 2 - 1, y + Wd / 2 - 1, z0 + H * 0.86);
      for (const s of [-1, 1]) plateHoles(a, s < 0 ? cx - L / 2 - ear : cx + L / 2, y - Wd / 2, s < 0 ? cx - L / 2 : cx + L / 2 + ear, y + Wd / 2, ez - et, ez, [{ x: s < 0 ? cx - L / 2 - ear * 0.5 : cx + L / 2 + ear * 0.5, y, rx: Wd * 0.11, ry: Wd * 0.11 }], 4);
      const bx = cx + L * 0.22; a.cyl(bx, y, z0 + H * 0.86, z0 + H * 0.97, Wd * 0.34, 18); a.cyl(cx - L * 0.1, y, z0 + H * 0.86, z0 + H * 0.92, Wd * 0.22, 14);
      a.cyl(bx, y, z0 + H * 0.97, z0 + H * 1.04 + 0, Wd * 0.17, 16); a.cyl(bx, y, z0 + H * 1.04, a.Z1 - 1, Wd * 0.38, 20); bar(a, 'z', [bx, y], [bx - L * 0.28, y], Wd * 0.2, a.Z1 - 1.6, a.Z1 - 0.2, true); a.cyl(bx, y, a.Z1 - 0.2, a.Z1, Wd * 0.07, 6);
      a.tube([[cx - L / 2, y, z0 + H * 0.25], [cx - L / 2 - L * 0.1, y, z0 + H * 0.2], [cx - L / 2 - L * 0.1, y, z0 + H * 0.05]], [Wd * 0.07, Wd * 0.07, Wd * 0.07], 6);
      a.rect(cx - L / 2, y - Wd / 2, cx + L / 2, y + Wd / 2); a.rect(cx - L / 2 - ear, y - Wd / 2, cx - L / 2, y + Wd / 2, 'EQUIP-DETAIL'); a.rect(cx + L / 2, y - Wd / 2, cx + L / 2 + ear, y + Wd / 2, 'EQUIP-DETAIL'); a.circ(bx, y, Wd * 0.38, 'EQUIP-DETAIL'); a.circ(bx, y, Wd * 0.17, 'EQUIP-DETAIL');
      a.log('Added the case with its mounting ears and holes, the stepped cover, the output boss, the horn with its screw and the wire (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic stepper motor',
    desc: (v) => `Stepper motor, ${v.S} mm square frame and ${v.L} mm long, shaft up: a square body with chamfered corners and lamination ribs, a front flange with four mounting holes, a round pilot boss, a shaft with a flat and a cable exit at the back.`,
    vs: [['small, 42 mm frame', 42, 40, 22, 5, 24], ['medium, 57 mm frame', 57, 56, 38, 6.35, 21], ['large, 86 mm frame', 86, 80, 73, 12.7, 32]].map(([l, S, L, P, sh, shl]) => [l, mi(S), mi(S), mi(L + 2 + shl), 0, { S, L, P, sh, shl }]),
    build: (a, v) => {
      const { S, L, P, sh, shl } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, c = S * 0.1, ft = S * 0.06, zt = z0 + L;
      a.prism([[cx - S / 2 + c, cy - S / 2], [cx + S / 2 - c, cy - S / 2], [cx + S / 2, cy - S / 2 + c], [cx + S / 2, cy + S / 2 - c], [cx + S / 2 - c, cy + S / 2], [cx - S / 2 + c, cy + S / 2], [cx - S / 2, cy + S / 2 - c], [cx - S / 2, cy - S / 2 + c]], z0, zt - ft);
      const hp = S * 0.37, hr = S * 0.065;
      plateHoles(a, cx - S / 2, cy - S / 2, cx + S / 2, cy + S / 2, zt - ft, zt, [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => ({ x: cx + sx * hp * 0.84, y: cy + sy * hp * 0.84, rx: hr, ry: hr })), 4);
      for (let i = 1; i < 5; i++) a.box(cx - S / 2 - 0.6, cy - S / 2 - 0.6, z0 + ((L - ft) * i) / 5 - 0.6, cx + S / 2 + 0.6, cy + S / 2 + 0.6, z0 + ((L - ft) * i) / 5 + 0.6);
      ring(a, 'z', cx, cy, zt, zt + 2, sh / 2, P / 2, 24); a.cyl(cx, cy, zt, a.Z1, sh / 2, 14); a.box(cx - sh * 0.45, cy + sh * 0.3, zt + shl * 0.35, cx + sh * 0.45, cy + sh / 2 + 0.2, a.Z1 - 0.5);
      a.box(cx + S * 0.1, cy + S / 2, z0 + L * 0.1, cx + S * 0.4, cy + S / 2 + 0.01, z0 + L * 0.35);
      a.rect(cx - S / 2, cy - S / 2, cx + S / 2, cy + S / 2); a.circ(cx, cy, P / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, sh / 2, 'EQUIP-DETAIL'); for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.circ(cx + sx * hp * 0.84, cy + sy * hp * 0.84, hr, 'EQUIP-DETAIL');
      a.log('Added the chamfered body with ribs, the flange with four holes, the pilot boss and the shaft with its flat (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic gear motor with encoder',
    desc: (v) => `Brushed gear motor with encoder, ${v.D} mm gearbox diameter, lying on its side: a motor can with end terminals, a gearbox housing with mounting face holes, a D-flat output shaft and a magnetic encoder cap with a ribbon connector.`,
    vs: [['25 mm', 25, 50, 22, 12, 10], ['37 mm', 37, 68, 30, 20, 14]].map(([l, D, Lm, Lg, Ls, Le]) => [l, mi(Lm + Lg + Ls + Le), mi(D), mi(D), 0, { D, Lm, Lg, Ls, Le }]),
    build: (a, v) => {
      const { D, Lm, Lg, Ls, Le } = v, zc = a.Z0 + D / 2, y = a.cy, x0 = a.X0 + Le, r = D / 2;
      a.xcyl(x0, x0 + Lm, y, zc, r, 24); a.xcyl(x0 + Lm, x0 + Lm + Lg, y, zc, r * 0.98, 24); a.xcyl(x0 + Lm + Lg, x0 + Lm + Lg + 1.5, y, zc, r * 0.55, 16); a.xcyl(x0 + Lm + Lg, x0 + Lm + Lg + Ls, y, zc, D * 0.15, 14); a.box(x0 + Lm + Lg + Ls * 0.2, y + D * 0.1, zc + D * 0.1, x0 + Lm + Lg + Ls, y + D * 0.15 + 0.0, zc + D * 0.15);
      for (let i = 0; i < 4; i++) { const t = (TAU * i) / 4 + 0.78; a.xcyl(x0 + Lm + Lg - 0.5, x0 + Lm + Lg + 0.8, y + r * 0.7 * m.cos(t), zc + r * 0.7 * m.sin(t), r * 0.07, 6); }
      a.xcyl(a.X0 + 2, x0, y, zc, r * 0.82, 20); a.xcyl(a.X0, a.X0 + 2, y, zc, r * 0.5, 14); a.box(a.X0 + 1, y - D * 0.25, zc + r * 0.7, a.X0 + Le * 0.8, y + D * 0.25, zc + r * 0.7 + D * 0.12);
      a.xcyl(x0 - 0.01, x0, y, zc, r, 6); a.box(x0 + Lm - 3, y - 0.1, zc + r * 0.9, x0 + Lm - 3, y + 0.1, zc + r * 0.9); a.xcyl(x0 + Lm * 0.5, x0 + Lm * 0.5 + 0.01, y, zc, r * 0.2, 4);
      a.rect(x0, y - r, x0 + Lm + Lg, y + r); a.rect(a.X0, y - r * 0.82, x0, y + r * 0.82, 'EQUIP-DETAIL'); a.rect(x0 + Lm + Lg, y - D * 0.15, x0 + Lm + Lg + Ls, y + D * 0.15, 'EQUIP-DETAIL'); a.line(x0 + Lm, y - r, x0 + Lm, y + r, 'EQUIP-DETAIL');
      a.log('Added the motor can, the gearbox with face holes, the D-flat shaft and the encoder cap with its connector (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic lidar sensor',
    desc: (v) => v.k === 0 ? `Two-dimensional scanning lidar, ${v.D} mm across: a fixed base with a connector and mounting feet and a spinning head with a window band.` : v.k === 1 ? `Spinning three-dimensional lidar, ${v.D} mm across: a ribbed base, a tall window barrel with horizontal bands, a domed top and a cable.` : `Solid-state lidar, ${v.D} mm wide: a rectangular housing with a window, two mounting ears with holes and a connector on the back.`,
    vs: [['2D scanning, 98 mm', 0, 98, 60], ['3D spinning, 104 mm', 1, 104, 120], ['solid state, 105 mm', 2, 105, 45]].map(([l, k, D, H]) => [l, mi(k === 2 ? D + 30 : D), mi(k === 2 ? 80 : D), mi(H), 0, { k, D, H }]),
    build: (a, v) => {
      const { k, D, H } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, r = D / 2;
      if (k === 0) { a.cyl(cx, cy, z0, z0 + H * 0.35, r, 28); a.cyl(cx, cy, z0 + H * 0.35, z0 + H * 0.72, r * 0.84, 28); a.cyl(cx, cy, z0 + H * 0.72, z0 + H * 0.78, r * 0.9, 28); a.cyl(cx, cy, z0 + H * 0.78, z0 + H, r * 0.6, 24); a.box(cx - r * 0.35, cy + r * 0.84, z0 + H * 0.1, cx + r * 0.35, cy + r * 1.0, z0 + H * 0.3); a.box(cx - r * 0.25, cy - r * 0.84, z0 + H * 0.4, cx + r * 0.25, cy - r * 0.94, z0 + H * 0.68); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.84, 'EQUIP-DETAIL'); a.circ(cx, cy, r * 0.6, 'EQUIP-DETAIL'); }
      else if (k === 1) { a.cyl(cx, cy, z0, z0 + H * 0.12, r, 28); for (let i = 0; i < 12; i++) { const t = (TAU * i) / 12; a.box(cx + r * 0.98 * m.cos(t) - 1.2, cy + r * 0.98 * m.sin(t) - 1.2, z0 + H * 0.02, cx + r * 0.98 * m.cos(t) + 1.2, cy + r * 0.98 * m.sin(t) + 1.2, z0 + H * 0.12); } a.cyl(cx, cy, z0 + H * 0.12, z0 + H * 0.2, r * 0.92, 28); for (let i = 0; i < 8; i++) a.cyl(cx, cy, z0 + H * (0.2 + i * 0.095), z0 + H * (0.2 + i * 0.095 + 0.06), r * 0.9, 28); a.cyl(cx, cy, z0 + H * 0.2, z0 + H * 0.96, r * 0.8, 24); a.tube([[cx, cy, z0 + H * 0.93], [cx, cy, z0 + H * 0.97], [cx, cy, z0 + H * 0.99], [cx, cy, a.Z1]], [r * 0.86, r * 0.78, r * 0.5, r * 0.1], 20); a.box(cx - 8, cy + r * 0.9, z0 + H * 0.03, cx + 8, cy + r * 1.05, z0 + H * 0.1); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.8, 'EQUIP-DETAIL'); }
      else { const w = D, d = 80, x0 = cx - w / 2; a.box(x0, cy - d / 2, z0, x0 + w, cy + d / 2 - 12, a.Z1); a.box(x0 + 6, cy - d / 2 - 0.0, z0 + 6, x0 + w - 6, cy - d / 2 + 4, a.Z1 - 6); a.box(x0 + w * 0.2, cy + d / 2 - 12, z0 + 12, x0 + w * 0.8, cy + d / 2, a.Z1 - 12);
        for (const s of [-1, 1]) plateHoles(a, s < 0 ? x0 - 15 : x0 + w, cy - 5, s < 0 ? x0 : x0 + w + 15, cy + 15, z0, z0 + 6, [{ x: s < 0 ? x0 - 7.5 : x0 + w + 7.5, y: cy + 5, rx: 3.2, ry: 3.2 }], 4);
        a.rect(x0, cy - d / 2, x0 + w, cy + d / 2 - 12); a.rect(x0 + 6, cy - d / 2, x0 + w - 6, cy - d / 2 + 4, 'EQUIP-DETAIL'); a.rect(x0 + w * 0.2, cy + d / 2 - 12, x0 + w * 0.8, cy + d / 2, 'EQUIP-DETAIL'); a.rect(x0 - 15, cy - 5, x0, cy + 15, 'EQUIP-DETAIL'); a.rect(x0 + w, cy - 5, x0 + w + 15, cy + 15, 'EQUIP-DETAIL'); }
      a.log('Added ' + (k === 2 ? 'the housing with window, mounting ears and the rear connector' : k === 1 ? 'the ribbed base, the banded window barrel, the dome and the cable' : 'the base with connector and feet, the window band and the head') + ' (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic robot camera',
    desc: (v) => v.k === 0 ? `Depth camera, ${v.L} mm wide: a flat bar with an infrared emitter and two sensor lenses behind a dark glass front, a status light and a rear mounting socket.` : v.k === 1 ? `Wide stereo depth camera, ${v.L} mm wide: a long bar with two widely spaced lenses, a central emitter, a cable at the back and a tripod socket.` : `Machine vision camera, ${v.L} mm cube body with a threaded lens barrel, a focus ring and a locking nut, and a rear connector.`,
    vs: [['depth bar, 90 mm', 0, 90, 25, 25], ['wide stereo, 175 mm', 1, 175, 30, 32], ['machine vision with lens', 2, 29, 29, 29]].map(([l, k, L, D, H]) => [l, mi(L), mi(k === 2 ? 29 + 60 : D), mi(H), 0, { k, L, D: k === 2 ? 89 : D, H }]),
    build: (a, v) => {
      const { k, L, D, H } = v, cx = a.cx, z0 = a.Z0, yf = a.YF, yb = a.YB, zc = z0 + H / 2;
      if (k < 2) { a.box(a.X0, yf + 2, z0, a.X1, yb, a.Z1); a.box(a.X0 + 2, yf, z0 + 2, a.X1 - 2, yf + 2, a.Z1 - 2); const lens = k === 0 ? [[-0.38], [0.0], [0.38]] : [[-0.4], [0.0], [0.4]]; for (const [f] of lens) { a.ycyl(yf - 1.2, yf + 2, cx + f * L, zc, H * (f === 0 ? 0.2 : 0.3), 14); a.circ(cx + f * L, (yf + yb) / 2, H * 0.3, 'EQUIP-DETAIL'); } a.cyl(cx + L * 0.46, yf + 6, zc - H * 0.2, zc + H * 0.0, 0.01, 3); a.cyl(cx, yb - 5, z0 - 0.0, z0 + 0.01, 0.01, 3);
        a.cyl(cx, (yf + yb) / 2, z0 - 0.0 + 0.0, z0 + 0.01, 0.01, 3); a.box(cx - 4, yb - D * 0.5, z0 + 3, cx + 4, yb, z0 + H - 3); a.rect(a.X0, yf, a.X1, yb); a.rect(cx - 4, yb - D * 0.5, cx + 4, yb, 'EQUIP-DETAIL'); }
      else { const s = 29; a.box(cx - s / 2, yb - 29, z0, cx + s / 2, yb, a.Z1); a.ycyl(yb - 29 - 4, yb - 29, cx, zc, 10, 16); a.ycyl(yb - 29 - 30, yb - 29 - 4, cx, zc, 12.5, 20); a.ycyl(yb - 29 - 52, yb - 29 - 30, cx, zc, 13.5, 20); for (let i = 0; i < 8; i++) a.ycyl(yb - 29 - 28 - i * 2.4, yb - 29 - 28 - i * 2.4 + 1.2, cx, zc, 14, 20); a.ycyl(yb - 29 - 60, yb - 29 - 52, cx, zc, 12, 20); a.ycyl(yb - 29 - 56, yb - 29 - 55, cx, zc, 11, 12); a.box(cx - 6, yb - 6, z0 + 6, cx + 6, yb + 0.0, a.Z1 - 6); a.rect(cx - s / 2, yb - 29, cx + s / 2, yb); a.rect(cx - 13.5, yb - 29 - 60, cx + 13.5, yb - 29, 'EQUIP'); a.circ(cx, yb - 29 - 60, 12, 'EQUIP-DETAIL'); }
      a.log('Added the ' + (k === 2 ? 'camera body, the threaded lens barrel with focus ring and lock nut and the connector' : 'bar housing with the lens openings, the status light and the rear socket') + ' (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic ultrasonic distance sensor',
    desc: (v) => v.k === 0 ? 'Ultrasonic ranging module: a small circuit board with two round transducer cans facing forward, a crystal, and a four-pin header on the back edge.' : 'Waterproof ultrasonic probe: a cylindrical housing with a sensing face, a hex mounting nut, a thread and a cable leaving the back through a strain relief.',
    vs: [['two-can module, 45 mm', 0, 45, 20, 17], ['probe, 18 mm', 1, 60, 24, 24]].map(([l, k, L, W, H]) => [l, mi(k === 0 ? 45 : 24), mi(k === 0 ? 30 : 60), mi(k === 0 ? 17 : 24), 0, { k }]),
    build: (a, v) => {
      if (v.k === 0) { const cx = a.cx, z0 = a.Z0, yb = a.YB, yf = a.YF; a.box(cx - 22.5, yb - 20, z0 + 4, cx + 22.5, yb - 18.4, z0 + 5.6); a.box(cx - 22.5, yb - 20, z0 + 4, cx + 22.5, yb, z0 + 5.6); for (const s of [-1, 1]) { a.ycyl(yb - 12, yb - 20, cx + s * 10.5, z0 + 12, 8.2, 18); a.ycyl(yf + 0.0 + 8, yb - 12, cx + s * 10.5, z0 + 12, 8.0, 18); a.circ(cx + s * 10.5, yb - 12, 8.2, 'EQUIP-DETAIL'); } a.box(cx - 3, yb - 6, z0 + 5.6, cx + 3, yb - 3, z0 + 8.6); for (let i = 0; i < 4; i++) a.box(cx - 5 + i * 2.5 - 0.3, yb - 1.8, z0 + 2, cx - 5 + i * 2.5 + 0.3, yb - 1.2, z0 + 5.6 + 8); a.box(cx - 5.5, yb - 2, z0 + 5.6, cx + 5.5, yb - 0.0, z0 + 8.4); a.rect(cx - 22.5, yb - 20, cx + 22.5, yb); }
      else { const cx = a.cx, cy = a.cy, z0 = a.Z0, y0 = a.YF, y1 = a.YB; a.ycyl(y0, y0 + 14, cx, z0 + 12, 12, 24); a.ycyl(y0 + 14, y1 - 12, cx, z0 + 12, 10.5, 22); for (let i = 0; i < 6; i++) a.ycyl(y0 + 18 + i * 1.5, y0 + 18 + i * 1.5 + 0.6, cx, z0 + 12, 11.2, 22); a.ycyl(y0 + 22, y0 + 30, cx, z0 + 12, 12.4, 6); a.ycyl(y1 - 12, y1 - 4, cx, z0 + 12, 5, 12); a.ycyl(y1 - 4, y1, cx, z0 + 12, 3.5, 10); a.rect(cx - 12, y0, cx + 12, y1 - 12); a.circ(cx, y0 + 7, 8, 'EQUIP-DETAIL'); }
      a.log('Added the ' + (v.k === 0 ? 'board, two transducer cans, the crystal and the pin header' : 'probe housing, sensing face, mounting nut and cable strain relief') + ' (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic robot controller',
    desc: (v) => v.k === 0 ? 'Rack-mount robot controller, 2U: a 19 in front panel with two handles, a vent grille, a row of connectors, an e-stop and a power switch, over a ventilated case.' : 'Compact motion controller box: a ribbed heat-sink top, a front row of terminal blocks and connectors, two LEDs and a DIN rail clip on the back.',
    vs: [['rack mount, 2U', 0, 483, 300, 88], ['compact box, 160 mm', 1, 160, 120, 55]].map(([l, k, W, D, H]) => [l, mi(W), mi(D), mi(H), 0, { k }]),
    build: (a, v) => {
      const cx = a.cx, z0 = a.Z0, yf = a.YF, yb = a.YB, W = a.W, H = a.H;
      if (v.k === 0) { a.box(cx - W * 0.46, yf + 3, z0 + 1, cx + W * 0.46, yb, z0 + H - 1); a.box(a.X0, yf, z0, a.X1, yf + 3, a.Z1); for (const s of [-1, 1]) { a.box(cx + s * W * 0.46 - 6, yf - 22, z0 + H * 0.2, cx + s * W * 0.46 + 6, yf, z0 + H * 0.28); a.box(cx + s * W * 0.46 - 6, yf - 22, z0 + H * 0.72, cx + s * W * 0.46 + 6, yf, z0 + H * 0.8); a.box(cx + s * W * 0.46 - 6, yf - 22, z0 + H * 0.2, cx + s * W * 0.46 + 6, yf - 16, z0 + H * 0.8); a.ycyl(yf - 4, yf, cx + s * W * 0.485, z0 + H * 0.5, 4, 8); } for (let i = 0; i < 10; i++) a.box(cx - W * 0.4 + i * 9, yf - 1, z0 + H * 0.15, cx - W * 0.4 + i * 9 + 5, yf, z0 + H * 0.85); for (let i = 0; i < 5; i++) a.box(cx + W * 0.0 + i * 24, yf - 5, z0 + H * 0.3, cx + W * 0.0 + i * 24 + 18, yf, z0 + H * 0.7); estop(a, cx + W * 0.38, yf - 0, z0 + H * 0.5, 7); a.ycyl(yf - 5, yf, cx + W * 0.3, z0 + H * 0.5, 5, 10); a.rect(a.X0, yf, a.X1, yf + 3); a.rect(cx - W * 0.46, yf + 3, cx + W * 0.46, yb, 'EQUIP'); for (const s of [-1, 1]) a.rect(cx + s * W * 0.46 - 6, yf - 22, cx + s * W * 0.46 + 6, yf, 'EQUIP-DETAIL'); }
      else { a.box(a.X0, yf, z0, a.X1, yb, z0 + H * 0.72); for (let i = 0; i < 9; i++) a.box(a.X0 + 8 + i * 16, yf + 8, z0 + H * 0.72, a.X0 + 8 + i * 16 + 6, yb - 8, a.Z1); for (let i = 0; i < 6; i++) a.box(a.X0 + 10 + i * 10, yf - 5, z0 + H * 0.15, a.X0 + 10 + i * 10 + 8, yf, z0 + H * 0.55); for (const s of [0, 1]) a.cyl(a.X1 - 14 - s * 10, yf + 0.0, z0 + H * 0.6, z0 + H * 0.6 + 0.01, 0.01, 3); a.box(cx - 20, yb, z0 + H * 0.1, cx + 20, yb + 0.0, z0 + H * 0.6); a.rect(a.X0, yf, a.X1, yb); for (let i = 0; i < 9; i++) a.line(a.X0 + 11 + i * 16, yf + 8, a.X0 + 11 + i * 16, yb - 8, 'EQUIP-DETAIL'); a.rect(a.X0 + 10, yf - 5, a.X0 + 68, yf, 'EQUIP-DETAIL'); }
      a.log('Added the ' + (v.k === 0 ? 'front panel with handles, vent grille, connector row, e-stop and switch over the case' : 'case with a ribbed heat-sink top and a front row of terminals') + ' (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic robot battery pack',
    desc: (v) => v.k === 0 ? 'Flat lithium battery pack with a heat-shrink wrap line, a balance lead and a power lead with a connector, two retaining strap grooves.' : v.k === 1 ? 'Rack battery pack: a rectangular case with a carrying handle, a charge indicator, a power connector, a breaker switch and vent slots on the side.' : 'Cylindrical cell pack of eight cells in a holder: two rows of four cells with a nickel bus strip and a power lead.',
    vs: [['flat pack, 150 mm', 0, 150, 50, 35], ['rack pack, 300 mm', 1, 300, 180, 120], ['eight cell holder, 4S2P', 2, 142, 75, 66]].map(([l, k, W, D, H]) => [l, mi(W), mi(D), mi(H), 0, { k }]),
    build: (a, v) => {
      const cx = a.cx, z0 = a.Z0, yf = a.YF, yb = a.YB, W = a.W, H = a.H, D = a.D;
      if (v.k === 0) { a.box(a.X0 + 4, yf + 3, z0, a.X1 - 4, yb - 3, a.Z1 - 2); for (const s of [-1, 1]) a.box(cx + s * W * 0.2 - 2, yf + 2, z0 - 0.0, cx + s * W * 0.2 + 2, yb - 2, a.Z1); a.box(a.X0, cy0(a), z0 + 4, a.X0 + 4, cy0(a) + 12, z0 + 24); a.tube([[a.X1 - 4, cy0(a) + 8, z0 + H * 0.5], [a.X1, cy0(a) + 8, z0 + H * 0.5]], [3.5, 3.5], 8); a.box(a.X1 - 3, yb - 14, z0 + 6, a.X1, yb - 6, z0 + 20); a.rect(a.X0 + 4, yf + 3, a.X1 - 4, yb - 3); for (const s of [-1, 1]) a.line(cx + s * W * 0.2, yf + 3, cx + s * W * 0.2, yb - 3, 'EQUIP-DETAIL'); a.rect(a.X1 - 4, yb - 14, a.X1, yb - 6, 'EQUIP-DETAIL'); }
      else if (v.k === 1) { a.box(a.X0, yf, z0, a.X1, yb, z0 + H * 0.86); a.box(a.X0 + 4, yf + 4, z0 + H * 0.86, a.X1 - 4, yb - 4, a.Z1 - 14); a.tube([[cx - W * 0.2, (yf + yb) / 2, a.Z1 - 14], [cx - W * 0.2, (yf + yb) / 2, a.Z1 - 2], [cx + W * 0.2, (yf + yb) / 2, a.Z1 - 2], [cx + W * 0.2, (yf + yb) / 2, a.Z1 - 14]], [7, 7, 7, 7], 8); for (let i = 0; i < 4; i++) a.box(cx - W * 0.35 + i * 6, yf - 0.8, z0 + H * 0.4, cx - W * 0.35 + i * 6 + 2, yf, z0 + H * 0.75); a.box(a.X0 + 20, yf - 3, z0 + H * 0.18, a.X0 + 70, yf, z0 + H * 0.34); a.cyl(cx + W * 0.28, yf - 6, z0 + H * 0.3, z0 + H * 0.3 + 0.01, 0.01, 3); a.ycyl(yf - 14, yf, cx + W * 0.3, z0 + H * 0.3, 15, 16); a.box(cx - 10, yf - 8, z0 + H * 0.42, cx + 10, yf, z0 + H * 0.74); for (let i = 0; i < 12; i++) a.box(a.X0 - 0.8, yf + 20 + i * 12, z0 + H * 0.3, a.X0, yf + 20 + i * 12 + 4, z0 + H * 0.7); a.rect(a.X0, yf, a.X1, yb); a.rect(cx - W * 0.2 - 7, (yf + yb) / 2 - 7, cx + W * 0.2 + 7, (yf + yb) / 2 + 7, 'EQUIP-DETAIL'); a.circ(cx + W * 0.3, yf - 7, 15, 'EQUIP-DETAIL'); }
      else { a.box(a.X0, yf, z0, a.X1, yb, z0 + 3); for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { const x = a.X0 + 18 + c * 35.5, y = yf + 18 + r * 36; a.cyl(x, y, z0 + 3, a.Z1 - 4, 9, 18); a.cyl(x, y, a.Z1 - 4, a.Z1 - 3.4, 9.2, 18); a.cyl(x, y, a.Z1 - 3.4, a.Z1 - 2.6, 4, 12); a.circ(x, y, 9, 'EQUIP-DETAIL'); } a.box(a.X0 + 10, yf + 25, a.Z1 - 2.6, a.X1 - 10, yf + 29, a.Z1 - 1.6); a.box(a.X0 + 10, yf + 61, a.Z1 - 2.6, a.X1 - 10, yf + 65, a.Z1 - 1.6); for (const s of [0, 1]) a.box(a.X0 + s * 35.5 * 3 + 10, yf, z0 + 3, a.X0 + s * 35.5 * 3 + 26, yf + 2, a.Z1 - 4); a.tube([[a.X1, yb - 18, a.Z1 - 2], [a.X1 + 0.0, yb - 18, a.Z1 - 2]], [3, 3], 6); a.rect(a.X0, yf, a.X1, yb); }
      a.log('Added the ' + (v.k === 0 ? 'pack body with wrap lines, leads and connector' : v.k === 1 ? 'case, handle, indicator, connector, breaker and vent slots' : 'cell holder tray, the eight cells, the bus strips and the lead') + ' (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic robot wheel',
    desc: (v) => v.k === 0 ? `Mecanum wheel, ${v.D} mm: two hub plates with a bore and four bolt holes and ten angled barrel rollers around the rim, standing on edge.` : v.k === 1 ? `Omni wheel, ${v.D} mm: a hub with a bore and a double row of small rollers around the rim, standing on edge.` : `Rubber drive wheel, ${v.D} mm: a tyre with a tread band, a rim with six spokes, a hub with a bore and a keyed boss, standing on edge.`,
    vs: [['mecanum, 100 mm', 0, 100, 50], ['omni, 60 mm', 1, 60, 30], ['rubber drive, 150 mm', 2, 150, 40]].map(([l, k, D, W]) => [l, mi(D), mi(W), mi(D), 0, { k, D, Wd: W }]),
    build: (a, v) => {
      const { k, D, Wd } = v, cx = a.cx, y = a.cy, zc = a.Z0 + D / 2, r = D / 2;
      if (k === 0) { ring(a, 'y', cx, zc, y - Wd * 0.4, y - Wd * 0.3, 8, r * 0.78, 24); ring(a, 'y', cx, zc, y + Wd * 0.3, y + Wd * 0.4, 8, r * 0.78, 24); ring(a, 'y', cx, zc, y - Wd * 0.45, y + Wd * 0.45, 8, 12, 14);
        for (let i = 0; i < 10; i++) { const t = (TAU * i) / 10, px = cx + r * 0.82 * m.cos(t), pz = zc + r * 0.82 * m.sin(t), tx = -m.sin(t), tz = m.cos(t), L2 = r * 0.34, dy = Wd * 0.4; const dir = [tx * m.cos(0.785), m.sin(0.785) * 1, tz * m.cos(0.785)]; a.tube([[px - dir[0] * L2, y - dir[1] * L2 * 0.55, pz - dir[2] * L2], [px, y, pz], [px + dir[0] * L2, y + dir[1] * L2 * 0.55, pz + dir[2] * L2]], [r * 0.07, r * 0.13, r * 0.07], 8); } a.circ(cx, y, r); a.circ(cx, y, r * 0.78, 'EQUIP-DETAIL'); }
      else if (k === 1) { ring(a, 'y', cx, zc, y - Wd * 0.5, y + Wd * 0.5, 6, r * 0.7, 20); for (const s of [-1, 1]) for (let i = 0; i < 12; i++) { const t = (TAU * i) / 12 + (s > 0 ? TAU / 24 : 0); a.tube([[cx + r * 0.78 * m.cos(t) + 0, y + s * Wd * 0.2, zc + r * 0.78 * m.sin(t)]], [1], 3); const px = cx + r * 0.8 * m.cos(t), pz = zc + r * 0.8 * m.sin(t); a.ell(px, y + s * Wd * 0.22, pz, r * 0.17, Wd * 0.2, r * 0.17, 8, 5); } a.circ(cx, y, r); a.circ(cx, y, r * 0.7, 'EQUIP-DETAIL'); }
      else { ring(a, 'y', cx, zc, y - Wd / 2, y + Wd / 2, r * 0.72, r, 36); for (let i = 0; i < 36; i++) { const t = (TAU * i) / 36; a.box(cx + r * 0.97 * m.cos(t) - 1.5, y - Wd / 2 - 0.8, zc + r * 0.97 * m.sin(t) - 1.5, cx + r * 0.97 * m.cos(t) + 1.5, y + Wd / 2 + 0.8, zc + r * 0.97 * m.sin(t) + 1.5); }
        ring(a, 'y', cx, zc, y - Wd * 0.35, y + Wd * 0.35, r * 0.62, r * 0.74, 24); ring(a, 'y', cx, zc, y - Wd * 0.45, y + Wd * 0.45, 8, r * 0.26, 20);
        for (let i = 0; i < 6; i++) { const t = (TAU * i) / 6; bar(a, 'y', [cx + r * 0.22 * m.cos(t), zc + r * 0.22 * m.sin(t)], [cx + r * 0.66 * m.cos(t), zc + r * 0.66 * m.sin(t)], r * 0.12, y - Wd * 0.25, y + Wd * 0.25, false); }
        a.circ(cx, y, r); a.circ(cx, y, r * 0.72, 'EQUIP-DETAIL'); a.circ(cx, y, r * 0.26, 'EQUIP-DETAIL'); }
      a.rect(cx - r, y - Wd / 2, cx + r, y + Wd / 2, 'EQUIP-DETAIL'); a.circ(cx, y, 8, 'EQUIP-DETAIL');
      a.log('Added the hub, bore and ' + (k === 2 ? 'spokes, rim and tyre tread' : 'rim with its rollers') + ' (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic robot joint actuator',
    desc: (v) => `Robot joint actuator module, ${v.D} mm: a round body with a rotating output flange with eight bolt holes, a fixed mounting flange, a cable port and a ring of cooling slots, standing on its mounting flange.`,
    vs: [['80 mm module', 80, 62]].map(([l, D, H]) => [l, mi(D * 1.12), mi(D * 1.12), mi(H), 0, { D, H }]),
    build: (a, v) => {
      const { D, H } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, r = D / 2;
      ring(a, 'z', cx, cy, z0, z0 + 6, r * 0.34, r * 1.12, 32); a.cyl(cx, cy, z0 + 6, z0 + H * 0.78, r, 32); for (let i = 0; i < 16; i++) { const t = (TAU * i) / 16; a.box(cx + r * 1.0 * m.cos(t) - 2, cy + r * 1.0 * m.sin(t) - 2, z0 + H * 0.3, cx + r * 1.02 * m.cos(t) + 2, cy + r * 1.02 * m.sin(t) + 2, z0 + H * 0.55); }
      ring(a, 'z', cx, cy, z0 + H * 0.78, a.Z1 - 2, r * 0.32, r * 0.9, 32); ring(a, 'z', cx, cy, a.Z1 - 2, a.Z1, r * 0.32, r * 0.78, 32); for (let i = 0; i < 8; i++) { const t = (TAU * i) / 8 + 0.2; a.cyl(cx + r * 0.6 * m.cos(t), cy + r * 0.6 * m.sin(t), a.Z1 - 2.4, a.Z1, r * 0.06, 8); }
      a.box(cx + r * 0.9, cy - 8, z0 + H * 0.3, cx + r * 1.1, cy + 8, z0 + H * 0.6);
      for (let i = 0; i < 6; i++) { const t = (TAU * i) / 6 + 0.5; a.circ(cx + r * 1.0 * m.cos(t), cy + r * 1.0 * m.sin(t), 2.5, 'EQUIP-DETAIL'); }
      a.circ(cx, cy, r * 1.12); a.circ(cx, cy, r, 'EQUIP-DETAIL'); a.circ(cx, cy, r * 0.9, 'EQUIP-DETAIL'); a.circ(cx, cy, r * 0.32, 'EQUIP-DETAIL');
      a.log('Added the mounting flange, the body with cooling slots, the output flange with bolt holes and the cable port (plan and 3D).');
    } }),
];
function cy0(a) { return a.YF + a.D / 2 - 6; }

// ============================================================================================= CELLS
/** a mesh fence run along x (at y = f) or along y (at x = f) between c0 and c1, with posts, rails and vertical bars; gaps [[g0, g1]] left open */
function fence(a, axis, f, c0, c1, z0, h, gaps = [], post = 60, step = 100) {
  const P = (u, v0, v1, w = post) => (axis === 'x' ? [u - w / 2, f - w / 2, v0, u + w / 2, f + w / 2, v1] : [f - w / 2, u - w / 2, v0, f + w / 2, u + w / 2, v1]);
  const open = (u) => gaps.some(([g0, g1]) => u > g0 && u < g1);
  const B = (u0, u1, v0, v1, t) => (axis === 'x' ? a.box(u0, f - t / 2, v0, u1, f + t / 2, v1) : a.box(f - t / 2, u0, v0, f + t / 2, u1, v1));
  const segs = []; let cur = c0; for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) { if (g0 > cur) segs.push([cur, g0]); cur = g1; } if (cur < c1) segs.push([cur, c1]);
  for (const [s0, s1] of segs) {
    const n = m.max(1, m.round((s1 - s0) / 1200)), pw = (s1 - s0) / n;
    for (let i = 0; i <= n; i++) a.box(...P(s0 + i * pw, z0, z0 + h));
    for (let i = 0; i < n; i++) {
      const u0 = s0 + i * pw + post / 2, u1 = s0 + (i + 1) * pw - post / 2; B(u0, u1, z0 + h - 40, z0 + h, 40); B(u0, u1, z0 + h * 0.07, z0 + h * 0.07 + 40, 40); B(u0, u1, z0 + h * 0.5 - 15, z0 + h * 0.5 + 15, 30);
      const k = m.max(2, m.floor((u1 - u0) / step)); for (let j = 1; j < k; j++) { const u = u0 + ((u1 - u0) * j) / k; B(u - 2.5, u + 2.5, z0 + h * 0.07 + 40, z0 + h - 40, 5); }
    }
    if (axis === 'x') a.rect(s0, f - post / 2, s1, f + post / 2); else a.rect(f - post / 2, s0, f + post / 2, s1);
  }
}
const cells = [
  fam({ cat: 'robotics/cells', title: 'Generic fenced robot cell',
    desc: (v) => `Fenced robot cell, ${v.Lx} x ${v.Ly} mm inside: mesh fence panels on posts with a bottom gap, a ${v.dw} mm door with a handle and an interlock switch, a corner beacon, a robot arm on a pedestal and ${v.tables > 1 ? 'two work tables' : 'a work table'} inside.`,
    vs: [['2.4 x 2.4 m, one table', 2400, 2400, 900, 1], ['3.6 x 3.0 m, one table', 3600, 3000, 1400, 1], ['5.0 x 3.6 m, two tables', 5000, 3600, 2000, 2]].map(([l, Lx, Ly, R, tables]) => [l, mi(Lx + 120), mi(Ly + 120), mi(2300), 0, { Lx, Ly, R, tables, dw: Lx > 3000 ? 1200 : 1000 }]),
    build: (a, v) => {
      const { Lx, Ly, R, tables, dw } = v, cx = a.cx, z0 = a.Z0, y0 = a.YF + 60, y1 = a.YB - 60, x0 = cx - Lx / 2, x1 = cx + Lx / 2, fh = 2000, fz = z0 + 150, dc = cx - Lx * 0.2;
      fence(a, 'x', y1, x0, x1, fz, fh); fence(a, 'y', x0, y0, y1, fz, fh); fence(a, 'y', x1, y0, y1, fz, fh); fence(a, 'x', y0, x0, x1, fz, fh, [[dc - dw / 2, dc + dw / 2]]);
      for (const s of [-1, 1]) { const dx0 = s < 0 ? dc - dw / 2 : dc, dx1 = s < 0 ? dc : dc + dw / 2; a.box(dx0 + 20, y0 - 18, fz, dx1 - 20, y0 + 18, fz + 40); a.box(dx0 + 20, y0 - 18, fz + fh - 40, dx1 - 20, y0 + 18, fz + fh); a.box(dx0 + 20, y0 - 18, fz, dx0 + 55, y0 + 18, fz + fh); a.box(dx1 - 55, y0 - 18, fz, dx1 - 20, y0 + 18, fz + fh); for (let i = 1; i < 8; i++) a.box(dx0 + 55 + ((dx1 - dx0 - 110) * i) / 8 - 2, y0 - 2, fz + 40, dx0 + 55 + ((dx1 - dx0 - 110) * i) / 8 + 2, y0 + 2, fz + fh - 40); }
      a.box(dc - 25, y0 - 40, fz + fh * 0.45, dc + 25, y0 - 15, fz + fh * 0.45 + 60); a.box(dc + 60, y0 - 42, fz + fh * 0.5, dc + 85, y0 - 15, fz + fh * 0.5 + 220); a.box(dc - 14 - dw / 2 + 0 + 100, y0 - 30, fz + fh * 0.5, dc - 14 - dw / 2 + 125, y0 - 15, fz + fh * 0.5 + 220);
      a.line(dc - dw / 2, y0, dc - dw / 2, y0 - dw / 2, 'EQUIP-SWING'); a.arc(dc - dw / 2, y0, dw / 2, 270, 360, 'EQUIP-SWING'); a.line(dc + dw / 2, y0, dc + dw / 2, y0 - dw / 2, 'EQUIP-SWING'); a.arc(dc + dw / 2, y0, dw / 2, 180, 270, 'EQUIP-SWING');
      beaconAt(a, x1 - 40, y1 - 40, fz + fh, 45, 110); a.clear('Cell door swing', dc - dw, y0 - dw / 2, dc + dw, y0, 50);
      const ph = 300, ry = a.cy + Ly * 0.1, rx = cx;
      a.box(rx - 250, ry - 250, z0, rx + 250, ry + 250, z0 + 20); a.box(rx - 160, ry - 160, z0 + 20, rx + 160, ry + 160, z0 + ph); a.circ(rx, ry, 160, 'EQUIP-DETAIL'); a.rect(rx - 250, ry - 250, rx + 250, ry + 250, 'EQUIP-DETAIL');
      const sub = Object.assign(Object.create(a), { cx: rx, YB: ry + 0.13 * R, Z0: z0 + ph, D: 0.58 * R, W: 0.28 * R });
      arm6(sub, R, false);
      for (let i = 0; i < tables; i++) { const tx = tables > 1 ? cx + (i ? 1 : -1) * Lx * 0.28 : cx + Lx * 0.25, ty = ry - R * 0.55 - 100; a.box(tx - 350, ty - 250, z0 + 700, tx + 350, ty + 250, z0 + 740); for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(tx + sx * 320 - 20, ty + sy * 220 - 20, z0, tx + sx * 320 + 20, ty + sy * 220 + 20, z0 + 700); a.rect(tx - 350, ty - 250, tx + 350, ty + 250, 'EQUIP-DETAIL'); a.box(tx - 120, ty - 90, z0 + 740, tx + 120, ty + 90, z0 + 820); }
      a.log('Added the mesh fence panels with posts and rails, the interlocked door, the corner beacon, the robot on its pedestal and the work table' + (tables > 1 ? 's' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic safety light curtain',
    desc: (v) => `Safety light curtain, ${v.H} mm protected height and ${v.S} mm between posts: an emitter post and a receiver post on base plates with bolt holes, a lens strip down the inner face, end caps with a status light and a cable gland, and a dashed beam zone in plan.`,
    vs: [['600 mm high, 1 m span', 600, 1000], ['1200 mm high, 2 m span', 1200, 2000], ['1800 mm high, 3 m span', 1800, 3000]].map(([l, H, S]) => [l, mi(S), mi(70), mi(H + 120), 0, { H, S }]),
    build: (a, v) => {
      const { H, S } = v, y = a.cy, z0 = a.Z0;
      for (const s of [0, 1]) {
        const x = s ? a.X1 - 25 : a.X0 + 25, dir = s ? -1 : 1;
        plateHoles(a, x - 35, y - 35, x + 35, y + 35, z0, z0 + 8, [{ x: x - 20, y: y - 20, rx: 4, ry: 4 }, { x: x + 20, y: y - 20, rx: 4, ry: 4 }, { x: x - 20, y: y + 20, rx: 4, ry: 4 }, { x: x + 20, y: y + 20, rx: 4, ry: 4 }], 4);
        a.box(x - 15, y - 15, z0 + 8, x + 15, y + 15, z0 + 60); a.box(x - 15, y - 15, z0 + 60, x + 15, y + 15, z0 + 60 + H + 20); a.box(x + dir * 15, y - 8, z0 + 70, x + dir * 17, y + 8, z0 + 60 + H + 10); a.cyl(x, y, z0 + 60 + H + 20, a.Z1 - 20, 15, 12); a.cyl(x, y, a.Z1 - 20, a.Z1 - 14, 8, 10); a.cyl(x + 0, y + 15, z0 + 60 + H * 0.0, z0 + 60 + H * 0.0 + 0.01, 0.01, 3); a.ycyl(y + 15, y + 24, x, a.Z1 - 70, 6, 8); a.circ(x, y, 15, 'EQUIP');
      }
      a.line(a.X0 + 25, y, a.X1 - 25, y, 'EQUIP-HIDDEN'); a.clear('Protected zone', a.X0 + 40, y - 150, a.X1 - 40, y + 150, 30);
      a.log('Added the emitter and receiver posts on bolted base plates, the lens strips, the end caps, the status light and cable glands (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic cell belt conveyor',
    desc: (v) => `Belt conveyor, ${v.L} mm long and ${v.Wd} mm belt width: two side frames with a belt on top, end rollers with a guard, a drive motor and gearbox at one end, six legs with braces and adjustable feet and cleats on the belt.`,
    vs: [['1.5 m, 300 mm belt', 1500, 300, 800], ['3.0 m, 450 mm belt', 3000, 450, 850], ['4.5 m, 600 mm belt', 4500, 600, 900]].map(([l, L, Wd, H]) => [l, mi(L), mi(Wd + 200), mi(H), 0, { L, Wd, H }]),
    build: (a, v) => {
      const { L, Wd, H } = v, y = a.cy, z0 = a.Z0, bh = 120, zt = z0 + H - 20, zf = zt - bh, nl = L > 2500 ? 4 : 3;
      for (const s of [-1, 1]) { a.box(a.X0, y + s * (Wd / 2 + 20) - 15, zf, a.X1 - 120, y + s * (Wd / 2 + 20) + 15, zt); a.box(a.X0, y + s * (Wd / 2 + 20) - 15 + (s > 0 ? 0 : 0), zt - 8, a.X1 - 120, y + s * (Wd / 2 + 20) + (s > 0 ? 38 : -38), zt); }
      a.box(a.X0 + 20, y - Wd / 2, zt - 14, a.X1 - 140, y + Wd / 2, zt - 8); a.box(a.X0 + 20, y - Wd / 2, zt - 8, a.X1 - 140, y + Wd / 2, zt - 4);
      for (let i = 1; i < m.floor(L / 250); i++) a.box(a.X0 + 20 + i * 250, y - Wd / 2 + 10, zt - 4, a.X0 + 20 + i * 250 + 6, y + Wd / 2 - 10, zt + 22);
      for (const x of [a.X0 + 20, a.X1 - 140]) { a.xcyl(0, 0, 0, 0, 0.001, 3); a.ycyl(y - Wd / 2 - 20, y + Wd / 2 + 20, x, zt - 55, 38, 18); }
      a.box(a.X1 - 130, y - Wd / 2 - 40, zf, a.X1 - 40, y + Wd / 2 + 40, zt); a.xcyl(a.X1 - 120, a.X1 - 10, y + Wd / 2 + 60, zt - 55, 55, 18); a.box(a.X1 - 110, y + Wd / 2 + 30, zt - 105, a.X1 - 20, y + Wd / 2 + 90, zt - 5); a.xcyl(a.X1 - 130, a.X1 - 120, y + Wd / 2 + 60, zt - 55, 18, 10);
      for (let i = 0; i < nl; i++) { const x = a.X0 + 70 + (i * (L - 340)) / (nl - 1); for (const s of [-1, 1]) { const yy = y + s * (Wd / 2 + 20); a.box(x - 20, yy - 20, z0 + 30, x + 20, yy + 20, zf); a.cyl(x, yy, z0 + 4, z0 + 30, 12, 8); a.cyl(x, yy, z0, z0 + 6, 32, 14); } if (i > 0 && i < nl - 1) { a.box(x - 15, y - Wd / 2 - 20, z0 + H * 0.4, x + 15, y + Wd / 2 + 20, z0 + H * 0.4 + 25); } }
      a.rect(a.X0, y - Wd / 2 - 35, a.X1 - 120, y + Wd / 2 + 35); a.rect(a.X0 + 20, y - Wd / 2, a.X1 - 140, y + Wd / 2, 'EQUIP-DETAIL'); a.rect(a.X1 - 130, y - Wd / 2 - 40, a.X1 - 40, y + Wd / 2 + 40); a.circ(a.X1 - 65, y + Wd / 2 + 60, 55, 'EQUIP-DETAIL');
      a.log('Added the side frames, belt with cleats, end rollers, the motor and gearbox, the legs with braces and feet (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic vibratory bowl feeder',
    desc: (v) => `Vibratory bowl feeder, ${v.Bd} mm bowl: a round bowl with a spiral track climbing the inside wall to an exit chute, a base drive block with four leaf-spring posts and rubber feet, and a straight linear track on its own drive.`,
    vs: [['200 mm bowl', 200, 480], ['350 mm bowl', 350, 700], ['500 mm bowl', 500, 900]].map(([l, Bd, W]) => [l, mi(W), mi(Bd * 1.25), mi(Bd * 0.7), 0, { Bd, W }]),
    build: (a, v) => {
      const Bd = v.Bd, r = Bd / 2, bx = a.X0 + Bd * 0.65, y = a.cy, z0 = a.Z0, rb = r * 0.62;
      a.cyl(bx, y, z0, z0 + Bd * 0.07, rb, 24); a.cyl(bx, y, z0 + Bd * 0.07, z0 + Bd * 0.18, rb * 0.8, 24); for (let i = 0; i < 4; i++) { const t = (TAU * i) / 4 + 0.78; a.tube([[bx + rb * 0.7 * m.cos(t), y + rb * 0.7 * m.sin(t), z0 + Bd * 0.18], [bx + rb * 0.6 * m.cos(t + 0.3), y + rb * 0.6 * m.sin(t + 0.3), z0 + Bd * 0.27]], [Bd * 0.015, Bd * 0.015], 6); a.cyl(bx + rb * 0.9 * m.cos(t), y + rb * 0.9 * m.sin(t), z0 - 0.0, z0 + 6, Bd * 0.035, 8); }
      const zf = z0 + Bd * 0.27; a.cyl(bx, y, zf, zf + 8, r * 0.98, 32); ring(a, 'z', bx, y, zf + 8, z0 + Bd * 0.7, r * 0.93, r, 32); a.cyl(bx, y, zf + 8, zf + 14, r * 0.9, 32);
      const turns = 2.2, n = 44, pts = [], rd = []; for (let i = 0; i <= n; i++) { const f = i / n, t = f * turns * TAU + 0.5; pts.push([bx + r * 0.78 * m.cos(t), y + r * 0.78 * m.sin(t), zf + 16 + f * (Bd * 0.3)]); rd.push(Bd * 0.028); } a.tube(pts, rd, 6);
      const ex = bx + r * 0.78 * m.cos(turns * TAU + 0.5), ey = y + r * 0.78 * m.sin(turns * TAU + 0.5);
      a.box(bx + r * 0.9, y - Bd * 0.07, zf + Bd * 0.3 + 5, a.X1 - 20, y + Bd * 0.07, zf + Bd * 0.3 + 20); a.box(bx + r * 0.9, y - Bd * 0.07, zf + Bd * 0.3 + 20, a.X1 - 20, y - Bd * 0.07 + 4, zf + Bd * 0.3 + 30); a.box(bx + r * 0.9, y + Bd * 0.07 - 4, zf + Bd * 0.3 + 20, a.X1 - 20, y + Bd * 0.07, zf + Bd * 0.3 + 30);
      a.box(bx + r * 0.95, y - Bd * 0.08, zf + 12, a.X1 - 60, y + Bd * 0.08, zf + Bd * 0.3 - 5); a.box(a.X1 - 150, y - Bd * 0.12, z0, a.X1 - 60, y + Bd * 0.12, zf + 12);
      a.circ(bx, y, r); a.circ(bx, y, rb, 'EQUIP-HIDDEN'); a.circ(bx, y, r * 0.78, 'EQUIP-DETAIL'); a.rect(bx + r * 0.9, y - Bd * 0.07, a.X1 - 20, y + Bd * 0.07); a.rect(a.X1 - 150, y - Bd * 0.12, a.X1 - 60, y + Bd * 0.12, 'EQUIP-DETAIL');
      a.log('Added the drive block with leaf-spring posts and feet, the bowl with its spiral track, the exit chute and the linear track with its drive (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic cell work bench',
    desc: (v) => `Steel work bench for a robot cell, ${v.L} mm long: a perforated top with a grid of holes, four legs with a lower shelf, side braces, adjustable feet and a rear lip.`,
    vs: [['1.2 m', 1200, 600], ['1.8 m', 1800, 800]].map(([l, L, D]) => [l, mi(L), mi(D), mi(900), 0, { L, D }]),
    build: (a, v) => {
      const { L, D } = v, z0 = a.Z0, th = 30, zt = a.Z1 - 60, nx = L > 1500 ? 8 : 6, ny = L > 1500 ? 4 : 3, holes = [];
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) holes.push({ x: a.X0 + ((i + 0.5) * L) / nx, y: a.YF + ((j + 0.5) * D) / ny, rx: 14, ry: 14 });
      plateHoles(a, a.X0, a.YF, a.X1, a.YB, zt, zt + th, holes, 3); a.box(a.X0, a.YB - 20, zt + th, a.X1, a.YB, a.Z1);
      a.frame(a.X0 + 20, zt - 50, a.X1 - 20, zt, a.YF + 20, a.YB - 20, 30);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const lx = a.cx + sx * (L / 2 - 50), ly = a.cy + sy * (D / 2 - 50); a.box(lx - 25, ly - 25, z0 + 40, lx + 25, ly + 25, zt - 50); a.cyl(lx, ly, z0, z0 + 40, 12, 10); a.cyl(lx, ly, z0 + 4, z0 + 12, 30, 12); }
      a.box(a.X0 + 70, a.YF + 70, z0 + 220, a.X1 - 70, a.YB - 70, z0 + 240); for (const sx of [-1, 1]) a.box(a.cx + sx * (L / 2 - 50) - 8, a.YF + 75, z0 + 80, a.cx + sx * (L / 2 - 50) + 8, a.YB - 75, z0 + 100);
      a.rect(a.X0, a.YF, a.X1, a.YB); a.rect(a.X0 + 70, a.YF + 70, a.X1 - 70, a.YB - 70, 'EQUIP-HIDDEN');
      a.log('Added the perforated top, the legs with feet, the lower shelf, the braces and the rear lip (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic teach pendant stand',
    desc: (v) => v.k === 0 ? 'Floor stand for a teach pendant: a round base plate, a pole, a cradle bracket and a pendant with a screen, an e-stop button, an enabling switch and a coiled cable.' : 'Mobile pendant trolley: a four-caster base frame, a pole, a cradle bracket with a pendant (screen, e-stop, enabling switch) and a cable hook.',
    vs: [['floor stand, 1.2 m', 0, 380, 380, 1200], ['mobile trolley, 1.4 m', 1, 500, 460, 1400]].map(([l, k, W, D, H]) => [l, mi(W), mi(D), mi(H), 0, { k }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, z0 = a.Z0, H = a.H, pz = z0 + H * 0.78;
      if (v.k === 0) { a.cyl(cx, cy, z0, z0 + 14, 180, 28); a.cyl(cx, cy, z0 + 14, z0 + 30, 60, 16); a.circ(cx, cy, 180); a.circ(cx, cy, 30, 'EQUIP-DETAIL'); }
      else { a.frame(a.X0 + 20, z0 + 90, a.X1 - 20, z0 + 130, a.YF + 20, a.YB - 20, 30); a.box(cx - 15, a.YF + 20, z0 + 90, cx + 15, a.YB - 20, z0 + 130); for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const px = cx + sx * (a.W / 2 - 40), py = cy + sy * (a.D / 2 - 40); a.cyl(px, py, z0 + 75, z0 + 90, 15, 8); a.cyl(px, py, z0 + 50, z0 + 75, 6, 8); a.xcyl(px - 12, px + 12, py, z0 + 30, 30, 12); a.circ(px, py, 30, 'EQUIP-DETAIL'); } a.rect(a.X0 + 20, a.YF + 20, a.X1 - 20, a.YB - 20); a.rect(a.X0 + 20, a.YF + 20, a.X1 - 20, a.YB - 20, 'EQUIP-DETAIL'); }
      a.cyl(cx, cy, z0 + (v.k ? 130 : 30), pz, 22, 14); a.box(cx - 60, cy - 30, pz - 5, cx + 60, cy + 30, pz + 15); a.box(cx - 120, cy - 45, pz + 15, cx + 120, cy - 5, pz + 25);
      a.box(cx - 140, cy - 45, pz + 25, cx + 140, cy - 5, pz + 36 + 0); a.box(cx - 140, cy - 45, pz + 25, cx + 140, cy - 40, pz + 215 + 0 - 10); a.box(cx - 140, cy - 10, pz + 25, cx + 140, cy - 5, pz + 215 - 10);
      a.box(cx - 140, cy - 45, pz + 25, cx - 125, cy - 5, pz + 215 - 10); a.box(cx + 125, cy - 45, pz + 25, cx + 140, cy - 5, pz + 215 - 10); a.box(cx - 140, cy - 45, pz + 200 - 10, cx + 140, cy - 5, pz + 215 - 10); a.box(cx - 125, cy - 38, pz + 36, cx + 125, cy - 36, pz + 195);
      estop(a, cx + 100, cy - 25, pz + 205, 14); a.box(cx - 120, cy - 5, pz + 60, cx + 120, cy + 15, pz + 140); a.tube([[cx + 130, cy - 10, pz + 30], [cx + 190, cy - 40, pz - 60], [cx + 120, cy - 60, pz - 150], [cx + 0, cy - 40, pz - 220]], [6, 6, 6, 6], 6);
      if (v.k) { a.box(cx + 40, cy + 22, pz - 100, cx + 80, cy + 70, pz - 85); a.cyl(cx + 60, cy + 55, pz - 85, pz - 40, 5, 6); }
      a.rect(cx - 140, cy - 45, cx + 140, cy + 15, 'EQUIP-DETAIL'); a.circ(cx + 100, cy - 25, 14, 'EQUIP-DETAIL');
      a.log('Added the base, the pole, the cradle bracket, the pendant with screen, e-stop and enabling switch, and the cable' + (v.k ? ' hook and casters' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic robot pedestal',
    desc: (v) => `Steel robot pedestal, ${v.Hp} mm tall: a square base plate with four anchor bolts, a box column with four corner gussets, and a top plate with a bolt circle and a cable hole for the robot base.`,
    vs: [['300 mm', 300, 500], ['600 mm', 600, 600], ['1000 mm', 1000, 700]].map(([l, Hp, S]) => [l, mi(S), mi(S), mi(Hp), 0, { Hp, S }]),
    build: (a, v) => {
      const { Hp, S } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, bt = 20, tt = 25, cw = S * 0.5, hr = 14;
      plateHoles(a, a.X0, a.YF, a.X1, a.YB, z0, z0 + bt, [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => ({ x: cx + sx * (S / 2 - 40), y: cy + sy * (S / 2 - 40), rx: hr, ry: hr })), 4);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const bx = cx + sx * (S / 2 - 40), by = cy + sy * (S / 2 - 40); a.cyl(bx, by, z0 + bt, z0 + bt + 18, 8, 8); a.prism(ptsC(bx, by, 16, 6), z0 + bt + 12, z0 + bt + 22); }
      a.box(cx - cw / 2, cy - cw / 2, z0 + bt, cx + cw / 2, cy + cw / 2, a.Z1 - tt);
      for (const sx of [-1, 1]) { prismX(a, [[cy - cw / 2, z0 + bt], [cy - S / 2 + 20, z0 + bt], [cy - cw / 2, z0 + bt + Hp * 0.3]], cx + sx * cw / 2 - 5 + (sx > 0 ? 5 : -5) - 5, cx + sx * cw / 2 + 5 + (sx > 0 ? 5 : -5) - 5); prismX(a, [[cy + cw / 2, z0 + bt], [cy + S / 2 - 20, z0 + bt], [cy + cw / 2, z0 + bt + Hp * 0.3]], cx + sx * cw / 2 - 5 + (sx > 0 ? 5 : -5) - 5, cx + sx * cw / 2 + 5 + (sx > 0 ? 5 : -5) - 5); }
      const bc = S * 0.3, holes = Array.from({ length: 8 }, (_, i) => ({ x: cx + bc * m.cos((TAU * i) / 8 + 0.39), y: cy + bc * m.sin((TAU * i) / 8 + 0.39), rx: 9, ry: 9 })); holes.push({ x: cx, y: cy, rx: 45, ry: 45 });
      plateHoles(a, a.X0 + 30, a.YF + 30, a.X1 - 30, a.YB - 30, a.Z1 - tt, a.Z1, holes, 6);
      a.rect(a.X0, a.YF, a.X1, a.YB); a.rect(cx - cw / 2, cy - cw / 2, cx + cw / 2, cy + cw / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, bc, 'EQUIP-HIDDEN');
      a.log('Added the base plate with anchor bolts, the box column with gussets and the top plate with bolt circle and cable hole (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic safety fence section',
    desc: (v) => v.door ? `Interlocked access door section, ${v.L} mm wide: two posts on base plates, a mesh door leaf on three hinges with a handle, a safety interlock switch and a latch.` : `Safety fence mesh panel section, ${v.L} mm wide and ${v.Hf} mm high: two posts on base plates with bolt holes, a top rail, a middle rail, a bottom rail and a mesh of vertical bars.`,
    vs: [['mesh panel, 1.0 m', 1000, 2000, false], ['mesh panel, 1.5 m', 1500, 2000, false], ['interlocked door, 1.0 m', 1000, 2000, true]].map(([l, L, Hf, door]) => [l, mi(L + 40), mi(150), mi(Hf), 0, { L, Hf, door }]),
    build: (a, v) => {
      const { L, Hf, door } = v, y = a.cy, z0 = a.Z0, x0 = a.X0 + 20, x1 = a.X1 - 20, fz = z0 + 150, fh = Hf - 150;
      for (const x of [x0 + 30, x1 - 30]) { a.box(x - 30, y - 30, z0 + 8, x + 30, y + 30, a.Z1); plateHoles(a, x - 70, y - 70, x + 70, y + 70, z0, z0 + 8, [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => ({ x: x + sx * 48, y: y + sy * 48, rx: 8, ry: 8 })), 4); }
      const u0 = x0 + 60, u1 = x1 - 60, B = (ua, ub, va, vb, t) => a.box(ua, y - t / 2, va, ub, y + t / 2, vb);
      if (!door) { B(u0, u1, fz + fh - 40, fz + fh, 40); B(u0, u1, fz, fz + 40, 40); B(u0, u1, fz + fh / 2 - 15, fz + fh / 2 + 15, 30); const k = m.floor((u1 - u0) / 100); for (let j = 1; j < k; j++) { const u = u0 + ((u1 - u0) * j) / k; B(u - 2.5, u + 2.5, fz + 40, fz + fh - 40, 5); } }
      else { B(u0 + 20, u1 - 20, fz + fh - 40, fz + fh, 36); B(u0 + 20, u1 - 20, fz + 10, fz + 50, 36); B(u0 + 20, u0 + 55, fz + 10, fz + fh, 36); B(u1 - 55, u1 - 20, fz + 10, fz + fh, 36); const k = m.floor((u1 - u0 - 80) / 100); for (let j = 1; j < k; j++) { const u = u0 + 40 + ((u1 - u0 - 80) * j) / k; B(u - 2.5, u + 2.5, fz + 50, fz + fh - 40, 5); } for (const f of [0.15, 0.5, 0.85]) a.box(u0 - 5, y - 20, fz + fh * f - 30, u0 + 25, y + 20, fz + fh * f + 30);
        a.box(u1 - 100, y - 38, fz + fh * 0.5 - 50, u1 - 80, y - 20, fz + fh * 0.5 + 130); a.box(x1 - 90, y + 30, fz + fh * 0.55, x1 - 30, y + 62, fz + fh * 0.55 + 90); a.box(x1 - 70, y + 62, fz + fh * 0.55 + 20, x1 - 55, y + 70, fz + fh * 0.55 + 70);
        a.line(u0, y, u0, y - (u1 - u0), 'EQUIP-SWING'); a.arc(u0, y, u1 - u0, 270, 360, 'EQUIP-SWING'); a.clear('Door swing', u0, y - (u1 - u0), u1, y, 50); }
      for (const x of [x0 + 30, x1 - 30]) a.rect(x - 30, y - 30, x + 30, y + 30); a.rect(u0, y - 20, u1, y + 20, 'EQUIP-DETAIL');
      a.log('Added the posts on bolted base plates, the rails and mesh' + (door ? ', the hinged door leaf with handle, the interlock switch and latch' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic robot control cabinet',
    desc: (v) => `Robot control cabinet, ${v.Wc} x ${v.Dc} x ${v.Hc} mm: a steel enclosure on a plinth with ${v.dbl ? 'a pair of doors' : 'a single door'}, a three-point handle, vent louvres, a roof cable entry plate, an e-stop and a pendant hook.`,
    vs: [['single door, 600 x 400 x 1200 mm', 600, 400, 1200, false], ['single door, 800 x 600 x 1800 mm', 800, 600, 1800, false], ['double door, 1200 x 600 x 1800 mm', 1200, 600, 1800, true]].map(([l, Wc, Dc, Hc, dbl]) => [l, mi(Wc), mi(Dc), mi(Hc), 0, { Wc, Dc, Hc, dbl }]),
    build: (a, v) => {
      const { Wc, Dc, Hc, dbl } = v, cx = a.cx, z0 = a.Z0, yf = a.YF, yb = a.YB, pl = 100;
      a.box(a.X0 + 10, yf + 10, z0, a.X1 - 10, yb - 10, z0 + pl); a.box(a.X0, yf + 20, z0 + pl, a.X1, yb, a.Z1 - 25); a.box(a.X0 + 10, yf + 10, a.Z1 - 25, a.X1 - 10, yb - 10, a.Z1); a.box(cx - Wc * 0.2, yf + Dc * 0.3, a.Z1, cx + Wc * 0.2, yf + Dc * 0.7, a.Z1);
      const dw = dbl ? Wc / 2 - 10 : Wc - 20, leaves = dbl ? [[a.X0 + 10, a.X0 + 10 + dw], [cx + 5, cx + 5 + dw]] : [[a.X0 + 10, a.X1 - 10]];
      for (const [d0, d1] of leaves) { a.box(d0, yf, z0 + pl + 15, d1, yf + 20, a.Z1 - 40); a.box(d0 + 20, yf - 3, z0 + pl + 35, d1 - 20, yf, a.Z1 - 60); }
      for (const [d0, d1] of leaves) { const hx = (dbl && d0 === leaves[0][0]) ? d1 - 25 : (dbl ? d0 + 25 : d1 - 30); a.box(hx - 8, yf - 30, z0 + pl + (a.Z1 - z0 - pl) * 0.5 - 90, hx + 8, yf, z0 + pl + (a.Z1 - z0 - pl) * 0.5 + 90); }
      for (let i = 0; i < 8; i++) a.box(leaves[0][0] + 60 + i * 20, yf - 4, z0 + pl + 60 + 0, leaves[0][0] + 70 + i * 20, yf, z0 + pl + 150); 
      estop(a, a.X1 - 70, yf, a.Z1 - 110, 14); a.cyl(a.X0 + 60, yf - 10, a.Z1 - 120, a.Z1 - 100, 6, 6); a.box(a.X0 + 40, yf - 25, a.Z1 - 170, a.X0 + 80, yf, a.Z1 - 160);
      beaconAt(a, cx, (yf + yb) / 2, a.Z1, 40, 90);
      a.rect(a.X0, yf + 20, a.X1, yb); a.rect(a.X0, yf, a.X1, yf + 20, 'EQUIP-DETAIL'); for (const [d0, d1] of leaves) { a.line(d0, yf, d0, yf - (d1 - d0), 'EQUIP-SWING'); a.arc(d0, yf, d1 - d0, 270, 360, 'EQUIP-SWING'); }
      a.clear('Door swing', a.X0, yf - Wc * 0.6, a.X1, yf, 50);
      a.log('Added the plinth, the enclosure, the door' + (dbl ? 's' : '') + ' with handle and louvres, the roof plate, the e-stop, the pendant hook and the beacon (plan and 3D).');
    } }),
];
export default [...arms, ...mobile, ...parts, ...cells];

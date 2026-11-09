/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, robotics: more arms, grippers and tooling, mobile robots and drones, robot parts and sensors, cell equipment. Original geometry; generic scale shapes, not particular robots. */
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
const V = (l, W, D, H, p = {}) => [l, mi(W), mi(D), mi(H), 0, p];
const grip = { flange: (a, cx, cy, zt, r) => { a.cyl(cx, cy, zt - r * 0.2, zt, r, 22); a.cyl(cx, cy, zt - r * 0.32, zt - r * 0.2, r * 0.62, 16); for (let i = 0; i < 4; i++) { const t = (TAU * i) / 4 + 0.78; a.cyl(cx + r * 0.78 * m.cos(t), cy + r * 0.78 * m.sin(t), zt - 0.1, zt + 0.5, r * 0.09, 6); } a.circ(cx, cy, r, 'EQUIP-DETAIL'); } };

// ============================================================================================= ARMS
const arms = [
  fam({ cat: 'robotics/arms', title: 'Generic palletizing robot',
    desc: (v) => `Four-axis palletizing robot, ${v.R} mm reach, on a bolted base plate: a turning column, a lower arm on twin plates with a parallelogram tie bar, a long horizontal upper arm with a rear counterweight, and a vertical wrist shaft ending in a tool flange.`,
    vs: [2000, 2500, 3200, 3600].map((R) => V(`4-axis, ${R} mm reach`, 0.34 * R, 0.92 * R, 0.8 * R, { R })),
    build: (a, v) => {
      const R = v.R, cx = a.cx, yB = a.YB - 0.19 * R, z0 = a.Z0, zS = z0 + 0.34 * R, yE = yB - 0.08 * R, zE = zS + 0.38 * R, yW = yE - 0.58 * R;
      a.box(cx - 0.16 * R, yB - 0.16 * R, z0, cx + 0.16 * R, yB + 0.16 * R, z0 + 0.025 * R);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.cyl(cx + sx * 0.13 * R, yB + sy * 0.13 * R, z0 + 0.025 * R, z0 + 0.04 * R, 0.014 * R, 8);
      a.box(cx - 0.1 * R, yB - 0.12 * R, z0 + 0.025 * R, cx + 0.1 * R, yB + 0.12 * R, z0 + 0.3 * R); a.cyl(cx, yB, z0 + 0.3 * R, z0 + 0.34 * R, 0.11 * R, 22);
      a.xcyl(cx - 0.14 * R, cx + 0.14 * R, yB, zS, 0.055 * R, 18);
      for (const s of [-1, 1]) { const x0 = cx + s * 0.085 * R - 0.02 * R, x1 = x0 + 0.04 * R; bar(a, 'x', [yB, zS], [yE, zE], 0.06 * R, x0, x1); bar(a, 'x', [yB + 0.11 * R, zS], [yE + 0.11 * R, zE], 0.03 * R, x0 + 0.01 * R, x1 - 0.01 * R); }
      a.xcyl(cx - 0.12 * R, cx + 0.12 * R, yE, zE, 0.05 * R, 18); a.box(cx - 0.04 * R, yW, zE - 0.04 * R, cx + 0.04 * R, yE + 0.11 * R, zE + 0.04 * R); a.box(cx - 0.07 * R, yE + 0.11 * R, zE - 0.05 * R, cx + 0.07 * R, yE + 0.17 * R, zE + 0.06 * R);
      a.tube([[cx, yW, zE + 0.03 * R], [cx, yW, zE - 0.3 * R]], [0.046 * R, 0.04 * R], 14); a.xcyl(cx - 0.05 * R, cx + 0.05 * R, yW + 0.0, zE, 0.045 * R, 14); flangeDown(a, cx, yW, zE - 0.3 * R, 0.042 * R);
      a.circ(cx, yB, 0.16 * R, 'EQUIP-DETAIL'); a.rect(cx - 0.04 * R, yW, cx + 0.04 * R, yE + 0.17 * R, 'EQUIP-DETAIL'); a.circ(cx, yW, 0.046 * R, 'EQUIP-DETAIL'); a.outline();
      a.log('Added the base plate, the column, the lower arm plates with tie bar, the upper arm with counterweight and the wrist with flange (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic robot seventh-axis track',
    desc: (v) => `Floor track for a robot, ${v.L} mm of travel: two steel base beams with cross ties and levelling feet, ground rails, a toothed rack, a carriage with a round robot mounting plate and bolt circle, a cable chain trough along the back and end stops.`,
    vs: [3000, 5000, 8000, 12000].map((L) => V(`${L / 1000} m, floor mounted`, L, 640, 330, { L })),
    build: (a, v) => {
      const { L } = v, z0 = a.Z0, x0 = a.X0, x1 = a.X1, cy = a.cy, ry = 210;
      for (const s of [-1, 1]) { a.box(x0, cy + s * ry - 55, z0 + 40, x1, cy + s * ry + 55, z0 + 140); a.box(x0 + 5, cy + s * ry - 15, z0 + 140, x1 - 5, cy + s * ry + 15, z0 + 170); }
      const nT = m.max(3, m.round(L / 700)); for (let i = 0; i <= nT; i++) { const x = x0 + 60 + ((L - 120) * i) / nT; a.box(x - 35, cy - ry, z0 + 60, x + 35, cy + ry, z0 + 100); for (const s of [-1, 1]) { a.cyl(x, cy + s * ry, z0, z0 + 40, 25, 8); a.cyl(x, cy + s * ry, z0 + 40, z0 + 50, 38, 8); } }
      a.box(x0 + 5, cy - 18, z0 + 140, x1 - 5, cy + 18, z0 + 160); for (let i = 0; i < 24; i++) a.box(x0 + 40 + ((L - 80) * i) / 24, cy - 16, z0 + 160, x0 + 40 + ((L - 80) * i) / 24 + 14, cy + 16, z0 + 168);
      a.box(x0 + 40, cy + ry + 80, z0 + 40, x1 - 40, cy + ry + 110, z0 + 150); a.box(x0 + 40, cy + ry + 80, z0 + 40, x1 - 40, cy + ry + 88, z0 + 190);
      const cxx = x0 + 420; a.box(cxx - 330, cy - ry - 50, z0 + 170, cxx + 330, cy + ry + 50, z0 + 240); a.cyl(cxx, cy, z0 + 240, z0 + 265, 230, 28);
      for (let i = 0; i < 8; i++) { const t = (TAU * i) / 8; a.cyl(cxx + 190 * m.cos(t), cy + 190 * m.sin(t), z0 + 265, z0 + 272, 12, 8); }
      for (const s of [-1, 1]) { a.box(x0, cy - ry - 55, z0 + 40, x0 + 30, cy + ry + 55, z0 + 230); a.box(x1 - 30, cy - ry - 55, z0 + 40, x1, cy + ry + 55, z0 + 230); a.box(cxx + s * 330 - 20, cy + ry + 50, z0 + 170, cxx + s * 330 + 20, cy + ry + 95, z0 + 215); }
      for (const s of [-1, 1]) a.rect(x0, cy + s * ry - 55, x1, cy + s * ry + 55, 'EQUIP-DETAIL'); a.circ(cxx, cy, 230, 'EQUIP-DETAIL'); a.rect(cxx - 330, cy - ry - 50, cxx + 330, cy + ry + 50, 'EQUIP-DETAIL'); a.rect(x0 + 40, cy + ry + 80, x1 - 40, cy + ry + 110, 'EQUIP-DETAIL'); a.outline();
      a.log('Added the base beams, cross ties, feet, rails, rack, the carriage with robot plate, the cable trough and the end stops (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic three-finger gripper',
    desc: (v) => `Three-finger centric gripper, ${v.D0} mm body: a tool flange, a round housing with a cable gland and three two-segment fingers 120 degrees apart, each with a knuckle and a rubber fingertip pad, shown open.`,
    vs: [[80, 'small'], [120, 'medium'], [200, 'large']].map(([D0, l]) => V(`${l}, ${D0} mm body`, D0 * 1.7, D0 * 1.7, D0 * 1.5, { D0 })),
    build: (a, v) => {
      const D0 = v.D0, cx = a.cx, cy = a.cy, zt = a.Z1, r = D0 / 2;
      grip.flange(a, cx, cy, zt, r * 0.6); a.cyl(cx, cy, zt - D0 * 0.62, zt - r * 0.2, r, 24); a.cyl(cx, cy, zt - D0 * 0.72, zt - D0 * 0.62, r * 0.8, 24); a.ycyl(cy + r * 0.9, cy + r * 1.1, cx + r * 0.3, zt - D0 * 0.35, r * 0.1, 8);
      for (let i = 0; i < 3; i++) { const t = (TAU * i) / 3 + 1.571, ux = m.cos(t), uy = m.sin(t), p0 = [cx + ux * r * 0.8, cy + uy * r * 0.8, zt - D0 * 0.72], p1 = [cx + ux * r * 1.45, cy + uy * r * 1.45, zt - D0 * 0.9], p2 = [cx + ux * r * 1.3, cy + uy * r * 1.3, a.Z0 + D0 * 0.1];
        a.ell(p0[0], p0[1], p0[2], r * 0.2, r * 0.2, r * 0.2, 8, 5); a.tube([p0, p1], [r * 0.16, r * 0.14], 8); a.ell(p1[0], p1[1], p1[2], r * 0.17, r * 0.17, r * 0.17, 8, 5); a.tube([p1, p2], [r * 0.13, r * 0.12], 8); a.box(p2[0] - r * 0.14, p2[1] - r * 0.14, a.Z0, p2[0] + r * 0.14, p2[1] + r * 0.14, a.Z0 + D0 * 0.12); a.circ(p2[0], p2[1], r * 0.15, 'EQUIP-DETAIL'); }
      a.circ(cx, cy, r); a.circ(cx, cy, r * 0.6, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the flange, the round housing with cable gland and the three jointed fingers with fingertip pads (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic angular gripper',
    desc: (v) => `Angular (pivoting) jaw gripper for ${v.P} mm parts: a tool flange, a body block with air ports and two curved jaws on pivot pins, shown open at about 30 degrees with a finger pad on each tip.`,
    vs: [[20, 'small'], [60, 'medium'], [150, 'large']].map(([P, l]) => V(`${l}, ${P} mm parts`, P * 3.4, P * 1.3 + 30, P * 3.2 + 40, { P })),
    build: (a, v) => {
      const P = v.P, cx = a.cx, cy = a.cy, zt = a.Z1, bw = P * 1.6, bd = P * 1.1 + 24, bh = P * 1.0 + 12, fr = bd * 0.4;
      grip.flange(a, cx, cy, zt, fr); const zb = zt - fr * 0.32; a.box(cx - bw / 2, cy - bd / 2, zb - bh, cx + bw / 2, cy + bd / 2, zb); a.ycyl(cy - bd / 2 - 8, cy - bd / 2, cx - bw * 0.2, zb - bh * 0.5, bd * 0.06, 8); a.ycyl(cy - bd / 2 - 8, cy - bd / 2, cx + bw * 0.2, zb - bh * 0.5, bd * 0.06, 8);
      for (const s of [-1, 1]) { const px = cx + s * bw * 0.38, pz = zb - bh * 0.7, tx = cx + s * (bw * 0.9), tz = a.Z0 + P * 0.35; a.ycyl(cy - bd * 0.45, cy + bd * 0.45, px, pz, bd * 0.12, 12);
        bar(a, 'y', [px, pz], [px + s * P * 0.5, pz - P * 0.9], P * 0.35, cy - bd * 0.4, cy + bd * 0.4); bar(a, 'y', [px + s * P * 0.5, pz - P * 0.9], [tx, tz], P * 0.3, cy - bd * 0.4, cy + bd * 0.4); a.box(tx - P * 0.12, cy - bd * 0.42, a.Z0, tx + P * 0.12, cy + bd * 0.42, tz + P * 0.15); a.line(px, cy, tx, cy, 'EQUIP-DETAIL'); }
      a.rect(cx - bw / 2, cy - bd / 2, cx + bw / 2, cy + bd / 2); a.circ(cx, cy, fr, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.rect(cx + s * bw * 0.9 - P * 0.12, cy - bd * 0.42, cx + s * bw * 0.9 + P * 0.12, cy + bd * 0.42, 'EQUIP-DETAIL');
      a.log('Added the flange, the body block with ports, the pivot pins and the two curved jaws with pads (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic magnetic gripper',
    desc: (v) => v.k === 0 ? `Electromagnetic disc gripper, ${v.S} mm: a tool flange, a round steel housing with a cable gland and a flat pole face ring.` : v.k === 1 ? `Rectangular magnetic gripper, ${v.S} mm, on a bracket: a flange, a bridge plate and three pole bars with a connector.` : `Magnetic gripper bar, ${v.S} mm, with four round pole pads on a flange plate and a cross brace.`,
    vs: [['disc, 60 mm', 0, 60], ['disc, 120 mm', 0, 120], ['three-pole block, 240 mm', 1, 240], ['four-pad bar, 500 mm', 2, 500]].map(([l, k, S]) => V(l, k === 0 ? S * 1.3 : k === 1 ? S : S, k === 0 ? S * 1.3 : k === 1 ? S * 0.5 : S * 0.22, k === 0 ? S * 1.1 : S * 0.55, { k, S })),
    build: (a, v) => {
      const { k, S } = v, cx = a.cx, cy = a.cy, zt = a.Z1;
      if (k === 0) { const r = S / 2; grip.flange(a, cx, cy, zt, r * 0.55); a.cyl(cx, cy, a.Z0 + r * 0.12, zt - r * 0.2, r, 26); ring(a, 'z', cx, cy, a.Z0, a.Z0 + r * 0.14, r * 0.55, r * 0.97, 24); a.cyl(cx, cy, a.Z0, a.Z0 + r * 0.1, r * 0.5, 20); a.ycyl(cy + r, cy + r * 1.28, cx + r * 0.3, zt - r * 0.9, r * 0.12, 8); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.55, 'EQUIP-DETAIL'); }
      else if (k === 1) { const w = S, d = S * 0.5; grip.flange(a, cx, cy, zt, d * 0.28); a.box(cx - w * 0.5, cy - d * 0.5, a.Z0 + S * 0.22, cx + w * 0.5, cy + d * 0.5, zt - d * 0.28 * 0.3); for (const i of [-1, 0, 1]) a.box(cx + i * w * 0.3 - w * 0.12, cy - d * 0.5, a.Z0, cx + i * w * 0.3 + w * 0.12, cy + d * 0.5, a.Z0 + S * 0.22); a.box(cx + w * 0.38, cy + d * 0.5, a.Z0 + S * 0.3, cx + w * 0.46, cy + d * 0.5 + 28, a.Z0 + S * 0.4); a.rect(cx - w / 2, cy - d / 2, cx + w / 2, cy + d / 2); for (const i of [-1, 0, 1]) a.rect(cx + i * w * 0.3 - w * 0.12, cy - d * 0.5, cx + i * w * 0.3 + w * 0.12, cy + d * 0.5, 'EQUIP-DETAIL'); }
      else { const w = S, d = S * 0.22; a.box(cx - w / 2, cy - d / 2, a.Z0 + S * 0.1, cx + w / 2, cy + d / 2, a.Z0 + S * 0.2); grip.flange(a, cx, cy, zt, d * 0.3); a.cyl(cx, cy, a.Z0 + S * 0.2, zt - d * 0.06, d * 0.22, 14); a.box(cx - w * 0.45, cy - d * 0.2, a.Z0 + S * 0.2, cx + w * 0.45, cy + d * 0.2, a.Z0 + S * 0.26); for (const i of [-1.5, -0.5, 0.5, 1.5]) { a.cyl(cx + i * w * 0.27, cy, a.Z0, a.Z0 + S * 0.1, d * 0.4, 16); a.circ(cx + i * w * 0.27, cy, d * 0.4, 'EQUIP-DETAIL'); } a.rect(cx - w / 2, cy - d / 2, cx + w / 2, cy + d / 2); }
      a.log('Added the flange, the housing or bridge and the pole faces (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic end effector tool rack',
    desc: (v) => `Floor stand for parked robot tools with ${v.n} slots: a base plate, two uprights, a sloped cradle shelf with a notch and keeper pin for each tool, and a gripper, a spindle or a nozzle parked in the first slots.`,
    vs: [3, 4, 6].map((n) => V(`${n} slots, floor stand`, 190 * n + 120, 380, 560, { n })),
    build: (a, v) => {
      const n = v.n, x0 = a.X0, x1 = a.X1, cy = a.cy, z0 = a.Z0;
      a.box(x0, a.YF, z0, x1, a.YB, z0 + 30); for (const x of [x0 + 20, x1 - 20]) { a.box(x - 20, cy - 30, z0 + 30, x + 20, cy + 30, a.Z1 - 90); a.box(x - 50, cy - 90, z0 + 30, x + 50, cy + 90, z0 + 80); }
      a.box(x0, cy - 150, z0 + 250, x1, cy + 150, z0 + 290); a.box(x0, cy + 130, z0 + 290, x1, cy + 150, z0 + 400); a.box(x0, cy - 150, a.Z1 - 90, x1, cy + 150, a.Z1 - 70);
      for (let i = 0; i < n; i++) { const x = x0 + 60 + ((x1 - x0 - 120) * (i + 0.5)) / n; a.box(x - 40, cy - 120, z0 + 290, x + 40, cy - 60, z0 + 320); a.cyl(x, cy + 100, z0 + 290, z0 + 345, 8, 8); a.rect(x - 40, cy - 120, x + 40, cy - 60, 'EQUIP-DETAIL');
        if (i % 3 === 0) { a.cyl(x, cy, z0 + 320, z0 + 400, 40, 18); a.cyl(x, cy, z0 + 400, z0 + 430, 30, 14); grip.flange(a, x, cy, z0 + 480, 28); } else if (i % 3 === 1) { a.cyl(x, cy, z0 + 320, z0 + 450, 32, 16); a.cyl(x, cy, z0 + 450, z0 + 500, 12, 10); } else { a.cyl(x, cy, z0 + 320, z0 + 440, 36, 14); a.cone(x, cy, z0 + 440, z0 + 500, 36, 8, 12); } }
      a.circ(x0 + 20, cy, 25, 'EQUIP-DETAIL'); a.circ(x1 - 20, cy, 25, 'EQUIP-DETAIL'); a.rect(x0, cy - 150, x1, cy + 150, 'EQUIP-DETAIL'); a.outline();
      a.log('Added the base plate, the uprights, the cradle shelf with notches and keeper pins and the parked tools (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic paint bell atomizer',
    desc: (v) => `Rotary bell atomizer with a ${v.cup} mm cup for a painting robot: a tool flange, a body with colour-change valve block, a nose with a shaping-air ring, a flared bell cup and two paint and air hoses.`,
    vs: [[30, 'small'], [50, 'standard'], [65, 'large']].map(([cup, l]) => V(`${l}, ${cup} mm cup`, cup * 4.2, cup * 3.2, cup * 7.5, { cup })),
    build: (a, v) => {
      const c = v.cup, cx = a.cx, cy = a.cy, zt = a.Z1, r = c * 1.1;
      grip.flange(a, cx, cy, zt, r * 0.8); a.cyl(cx, cy, zt - c * 3.2, zt - r * 0.3, r, 22); a.box(cx + r * 0.2, cy - r * 0.8, zt - c * 2.6, cx + r * 1.3, cy + r * 0.8, zt - c * 1.4);
      a.cone(cx, cy, zt - c * 4.8, zt - c * 3.2, r * 0.6, r, 22); a.cyl(cx, cy, zt - c * 5.1, zt - c * 4.8, r * 0.72, 22); a.cone(cx, cy, zt - c * 5.9, zt - c * 5.1, c * 0.25, c * 0.4, 14); a.cone(cx, cy, a.Z0 + c * 0.1, zt - c * 5.9, c * 0.2, c * 0.15, 12);
      a.cone(cx, cy, a.Z0, a.Z0 + c * 1.1, c * 0.5, c * 0.14, 22); a.cyl(cx, cy, a.Z0 + c * 1.1, a.Z0 + c * 1.15, c * 0.45, 22);
      a.tube([[cx - r * 0.6, cy + r * 0.3, zt - c * 0.5], [cx - r * 1.5, cy + r * 0.6, zt - c * 1.6], [cx - r * 1.3, cy + r * 1.2, zt - c * 3.3], [cx - r * 0.5, cy + r * 0.8, zt - c * 3.3]], [c * 0.18, c * 0.18, c * 0.18, c * 0.18], 8);
      a.circ(cx, cy, r); a.circ(cx, cy, c * 0.5, 'EQUIP-DETAIL'); a.rect(cx + r * 0.2, cy - r * 0.8, cx + r * 1.3, cy + r * 0.8, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the flange, the body, the valve block, the nose with shaping-air ring, the bell cup and the hoses (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic compliant deburring spindle',
    desc: (v) => `Compliant deburring tool, ${v.S} class: a tool flange, a floating housing with a rubber bellows and radial compliance, an air motor with an exhaust muffler and a collet holding a rotary burr.`,
    vs: [['light duty', 70, 250], ['medium duty', 95, 330], ['heavy duty', 130, 430]].map(([l, S, H]) => V(l, S * 1.5, S * 1.3, H, { S })),
    build: (a, v) => {
      const S = v.S, cx = a.cx, cy = a.cy, zt = a.Z1, r = S / 2;
      grip.flange(a, cx, cy, zt, r * 0.9); a.cyl(cx, cy, zt - S * 0.9, zt - r * 0.3, r * 0.9, 22); for (let i = 0; i < 6; i++) a.cyl(cx, cy, zt - S * 0.9 - 6 - i * 6, zt - S * 0.9 - i * 6, r * (1.05 + (i % 2) * 0.08), 20);
      a.cyl(cx, cy, zt - S * 1.6, zt - S * 0.9 - 36, r * 0.85, 22); a.cyl(cx + r * 0.6, cy, zt - S * 1.0, zt - S * 0.9, r * 0.2, 8); a.cyl(cx, cy, zt - S * 1.9, zt - S * 1.6, r * 0.55, 18); a.cyl(cx, cy, zt - S * 2.1, zt - S * 1.9, r * 0.35, 14); a.cyl(cx, cy, zt - S * 2.5, zt - S * 2.1, r * 0.12, 8); a.ell(cx, cy, a.Z0 + r * 0.18, r * 0.18, r * 0.18, r * 0.3, 8, 6);
      a.cyl(cx, cy, a.Z0 + r * 0.3, zt - S * 2.5, r * 0.07, 8); a.circ(cx, cy, r * 1.1); a.circ(cx, cy, r * 0.35, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the flange, the bellows, the air motor, the collet and the burr (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic belt-driven linear axis',
    desc: (v) => `Belt-driven linear axis, ${v.L} mm stroke, on two foot brackets: an aluminium profile body with T-slots, a carriage block on slider rails, a servo motor with a coupling at one end, an idler end cap and two proximity switches.`,
    vs: [500, 1000, 1500, 2000].map((L) => V(`${L} mm stroke, foot mounted`, L + 260, 150, 200, { L })),
    build: (a, v) => {
      const L = v.L, x0 = a.X0, x1 = a.X1, cy = a.cy, z0 = a.Z0, pz = z0 + 70, ph = 80;
      a.box(x0 + 60, cy - ph / 2, pz, x1 - 120, cy + ph / 2, pz + ph); for (const x of [x0 + 100, x1 - 180]) { a.box(x - 25, cy - 70, z0, x + 25, cy + 70, z0 + 12); a.box(x - 25, cy - 20, z0 + 12, x + 25, cy + 20, pz); }
      for (const s of [-1, 1]) a.box(x0 + 60, cy + s * 28 - 6, pz + ph, x1 - 120, cy + s * 28 + 6, pz + ph + 10); for (const s of [-1, 1]) a.box(x0 + 60, cy + s * ph / 2 - 2 + s * 0, pz + 20, x1 - 120, cy + s * ph / 2 + s * 4, pz + 28);
      const cxx = x0 + 150 + (L * 0.3); a.box(cxx - 70, cy - 50, pz + ph + 10, cxx + 70, cy + 50, pz + ph + 50); a.box(cxx - 50, cy - 40, pz + ph + 50, cxx + 50, cy + 40, pz + ph + 56);
      a.box(x1 - 120, cy - ph / 2 - 8, pz - 10, x1 - 60, cy + ph / 2 + 8, pz + ph + 10); a.box(x0 + 30, cy - 45, pz - 5, x0 + 60, cy + 45, pz + ph + 8); a.xcyl(x0 + 8, x0 + 30, cy, pz + ph / 2 + 5, 18, 14);
      a.xcyl(x1 - 120, x1 - 40, cy, pz + ph / 2, 26, 16); a.box(x1 - 40, cy - 38, pz - 10, x1, cy + 38, pz + ph + 20); a.ycyl(cy + 38, cy + 55, x1 - 20, pz + 50, 7, 8);
      for (const x of [x0 + 200, x1 - 260]) { a.box(x - 8, cy + 45, pz + ph - 15, x + 8, cy + 70, pz + ph + 5); }
      a.rect(x0, cy - 70, x1, cy + 70, 'EQUIP-DETAIL'); a.rect(x0 + 60, cy - ph / 2, x1 - 120, cy + ph / 2); a.rect(cxx - 70, cy - 50, cxx + 70, cy + 50, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the profile body, the foot brackets, the slider rails, the carriage, the motor with coupling, the idler cap and the switches (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic XY positioning stage',
    desc: (v) => `Bench XY stage with ${v.X} x ${v.Y} mm travel on four feet: a base plate with two lower rails, a Y carriage with a cross bridge, an X carriage with a tool plate, two stepper motors with couplings and cable chains.`,
    vs: [[300, 300], [600, 400], [1000, 600]].map(([X, Y]) => V(`${X} x ${Y} mm travel, bench`, X + 220, Y + 220, 220, { X, Y })),
    build: (a, v) => {
      const { X, Y } = v, x0 = a.X0, x1 = a.X1, y0 = a.YF, y1 = a.YB, cx = a.cx, cy = a.cy, z0 = a.Z0;
      for (const [x, y] of [[x0 + 30, y0 + 30], [x1 - 30, y0 + 30], [x0 + 30, y1 - 30], [x1 - 30, y1 - 30]]) a.cyl(x, y, z0, z0 + 25, 18, 10);
      a.box(x0, y0, z0 + 25, x1, y1, z0 + 45); for (const s of [-1, 1]) { a.box(cx + s * (X * 0.5 + 30) - 15, y0 + 40, z0 + 45, cx + s * (X * 0.5 + 30) + 15, y1 - 40, z0 + 70); }
      a.box(cx - X / 2 - 60, cy - Y * 0.5 - 40, z0 + 70, cx - X / 2 + 60, cy + Y * 0.5 + 40, z0 + 100); a.box(cx + X / 2 - 60, cy - Y * 0.5 - 40, z0 + 70, cx + X / 2 + 60, cy + Y * 0.5 + 40, z0 + 100);
      const yc = cy - Y * 0.15; a.box(cx - X / 2 - 70, yc - 45, z0 + 100, cx + X / 2 + 70, yc + 45, z0 + 140); for (const s of [-1, 1]) a.box(cx + s * (X / 2 + 70) - 20, y0 + 40, z0 + 70, cx + s * (X / 2 + 70) + 20, y1 - 40, z0 + 100);
      const xc = cx + X * 0.1; a.box(xc - 60, yc - 60, z0 + 140, xc + 60, yc + 60, z0 + 170); a.box(xc - 90, yc - 90, z0 + 170, xc + 90, yc + 90, z0 + 190); for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.cyl(xc + sx * 65, yc + sy * 65, z0 + 190, z0 + 197, 8, 8);
      a.box(x1 - 100, y0 + 20, z0 + 45, x1 - 20, y0 + 70, z0 + 120); a.xcyl(x0 + 20, x0 + 100, y1 - 50, z0 + 80, 25, 14); a.ycyl(y1 - 100, y1 - 10, cx + X / 2 + 30, z0 + 50, 12, 10);
      a.rect(x0, y0, x1, y1); a.rect(xc - 90, yc - 90, xc + 90, yc + 90, 'EQUIP-DETAIL'); a.rect(cx - X / 2 - 70, yc - 45, cx + X / 2 + 70, yc + 45, 'EQUIP-DETAIL');
      a.log('Added the feet, the base plate, the rails, the Y and X carriages with the tool plate and the two motors (plan and 3D).');
    } }),
  fam({ cat: 'robotics/arms', title: 'Generic hexapod positioning platform',
    desc: (v) => `Six-leg hexapod positioning platform, ${v.B} mm base ring, raised about ${v.up} mm: a base ring with three pairs of pivot mounts, six telescoping legs with motors, a hexagonal top plate with a bolt grid and a cable bundle.`,
    vs: [[250, 90], [400, 140], [600, 200], [800, 260]].map(([B, up]) => V(`${B} mm base ring`, B * 1.05, B * 1.05, up + B * 0.35 + 60, { B, up })),
    build: (a, v) => {
      const { B, up } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, rb = B / 2, rt = B * 0.32, zt = z0 + 40 + B * 0.3 + up;
      ring(a, 'z', cx, cy, z0, z0 + 30, rb * 0.72, rb, 32); const base = (i) => { const k = m.floor(i / 2), s = i % 2 ? 1 : -1, t = (TAU * k) / 3 + s * 0.2 + 0.5; return [cx + rb * 0.92 * m.cos(t), cy + rb * 0.92 * m.sin(t), t]; };
      const top = (i) => { const k = m.floor(i / 2), s = i % 2 ? -1 : 1, t = (TAU * k) / 3 + s * 0.2 + 0.5 + 1.0472; return [cx + rt * m.cos(t), cy + rt * m.sin(t)]; };
      for (let i = 0; i < 6; i++) { const [bx, by] = base(i), [tx, ty] = top(i); a.cyl(bx, by, z0 + 30, z0 + 70, B * 0.045, 10); const q = [bx, by, z0 + 70], p = [tx, ty, zt - 10], d = [p[0] - q[0], p[1] - q[1], p[2] - q[2]]; const mid = [q[0] + d[0] * 0.45, q[1] + d[1] * 0.45, q[2] + d[2] * 0.45]; a.tube([q, mid], [B * 0.045, B * 0.045], 10); a.tube([mid, p], [B * 0.03, B * 0.028], 8); a.ell(tx, ty, zt - 10, B * 0.03, B * 0.03, B * 0.03, 8, 5); }
      a.prism(ptsC(cx, cy, rt * 1.12, 6, 0.0), zt - 10, zt + 20); for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) if (i * i + j * j <= 5) a.cyl(cx + i * rt * 0.32, cy + j * rt * 0.32, zt + 20, zt + 24, rt * 0.045, 6);
      a.circ(cx, cy, rb); a.circ(cx, cy, rb * 0.72, 'EQUIP-DETAIL'); a.poly(ptsC(cx, cy, rt * 1.12, 6, 0.0), 'EQUIP-DETAIL');
      a.log('Added the base ring, the six telescoping legs on pivots and the hexagonal top plate with bolt grid (plan and 3D).');
    } }),
];

// ============================================================================================= MOBILE
const wy = (a, x, y, zc, r, w) => { a.xcyl(x - w / 2, x + w / 2, y, zc, r, 20); a.xcyl(x - w / 2 - 2, x + w / 2 + 2, y, zc, r * 0.5, 14); a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL'); };
const mecanum = (a, x, y, zc, r, w, flip = 1) => {
  a.xcyl(x - w * 0.42, x + w * 0.42, y, zc, r * 0.62, 18);
  for (let i = 0; i < 9; i++) { const t = (TAU * i) / 9; a.tube([[x - w / 2, y + r * 0.8 * m.cos(t), zc + r * 0.8 * m.sin(t)], [x + w / 2, y + r * 0.8 * m.cos(t + flip * 0.5), zc + r * 0.8 * m.sin(t + flip * 0.5)]], [r * 0.19, r * 0.19], 8); }
  a.xcyl(x - w / 2 - 3, x + w / 2 + 3, y, zc, r * 0.22, 10); a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL');
};
const prop = (a, x, y, z, r, n = 2, t = 3) => { for (let i = 0; i < n; i++) { const th = (m.PI * i) / n + 0.3, ux = m.cos(th), uy = m.sin(th), nx = -uy * r * 0.08, ny = ux * r * 0.08; a.prism([[x - ux * r + nx, y - uy * r + ny], [x + ux * r + nx, y + uy * r + ny], [x + ux * r - nx, y + uy * r - ny], [x - ux * r - nx, y - uy * r - ny]], z, z + t); } a.cyl(x, y, z - 2, z + t + 3, r * 0.1, 8); a.circ(x, y, r, 'EQUIP-DETAIL'); };
const mobile = [
  fam({ cat: 'robotics/mobile', title: 'Generic disc floor-cleaning robot',
    desc: (v) => `Disc-shaped floor-cleaning robot, ${v.D0} mm across: a round body with a front bumper arc, a domed lid with a lidar bump and three buttons, two drive wheels, a front caster, a side brush with bristles and a rear dust bin lid.`,
    vs: [250, 330, 400].map((D0) => V(`${D0} mm disc`, D0, D0, D0 * 0.28, { D0 })),
    build: (a, v) => {
      const D0 = v.D0, cx = a.cx, cy = a.cy, z0 = a.Z0, r = D0 / 2, H = a.H;
      a.cyl(cx, cy, z0 + H * 0.06, z0 + H * 0.62, r * 0.96, 36); a.cone(cx, cy, z0 + H * 0.62, z0 + H * 0.86, r * 0.96, r * 0.86, 36); a.cyl(cx, cy, z0 + H * 0.86, z0 + H * 0.9, r * 0.84, 36);
      ring(a, 'z', cx, cy, z0 + H * 0.12, z0 + H * 0.5, r * 0.9, r, 18, m.PI, m.PI);
      puck(a, cx, cy + r * 0.12, z0 + H * 0.9, r * 0.2, H * 0.1); for (const dx of [-1, 0, 1]) a.cyl(cx + dx * r * 0.22, cy - r * 0.38, z0 + H * 0.9, z0 + H * 0.94, r * 0.06, 10);
      for (const s of [-1, 1]) { a.xcyl(cx + s * r * 0.93 - 8, cx + s * r * 0.93 + 8, cy + r * 0.05, z0 + H * 0.3, H * 0.3, 18); a.circ(cx + s * r * 0.93, cy + r * 0.05, H * 0.3, 'EQUIP-HIDDEN'); }
      a.cyl(cx, cy - r * 0.7, z0, z0 + H * 0.06, H * 0.07, 10); const bx = cx - r * 0.62, by = cy - r * 0.62; a.cyl(bx, by, z0 + H * 0.45, z0 + H * 0.58, r * 0.06, 8); for (let i = 0; i < 3; i++) { const t = (TAU * i) / 3; a.tube([[bx, by, z0 + H * 0.5], [bx + r * 0.3 * m.cos(t), by + r * 0.3 * m.sin(t), z0 + H * 0.4]], [r * 0.012, r * 0.012], 6); }
      a.box(cx - r * 0.35, cy + r * 0.55, z0 + H * 0.9, cx + r * 0.35, cy + r * 0.88, z0 + H * 0.94);
      a.circ(cx, cy, r); a.circ(cx, cy, r * 0.84, 'EQUIP-DETAIL'); a.circ(cx, cy + r * 0.12, r * 0.2, 'EQUIP-DETAIL'); a.circ(bx, by, r * 0.3, 'EQUIP-DETAIL');
      a.log('Added the body, the bumper arc, the lid with lidar bump and buttons, the wheels, the caster, the side brush and the dust bin lid (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic sidewalk delivery robot',
    desc: (v) => `Six-wheel sidewalk delivery robot, ${v.L} mm long: a low chassis with three wheels each side, a sloped lockable cargo lid, a front camera strip, a flag mast with a beacon and an antenna.`,
    vs: [[450, 600, 520, 'small cargo'], [560, 750, 640, 'medium cargo'], [700, 950, 800, 'large cargo']].map(([W, L, H, l]) => V(`${l}, ${L} mm`, W, L, H, { L })),
    build: (a, v) => {
      const W = a.W, L = a.D, H = a.H, cx = a.cx, cy = a.cy, z0 = a.Z0, wr = H * 0.1, ww = W * 0.12;
      a.box(a.X0 + ww + 10, a.YF + L * 0.04, z0 + H * 0.12, a.X1 - ww - 10, a.YB - L * 0.04, z0 + H * 0.3);
      for (const s of [-1, 1]) for (const j of [-1, 0, 1]) wy(a, cx + s * (W / 2 - ww / 2), cy + j * L * 0.3, z0 + wr, wr, ww);
      for (const s of [-1, 1]) a.box(cx + s * (W / 2 - ww) - 6, a.YF + L * 0.12, z0 + wr, cx + s * (W / 2 - ww) + 6, a.YB - L * 0.12, z0 + H * 0.3);
      prismX(a, [[a.YF + L * 0.03, z0 + H * 0.3], [a.YB - L * 0.03, z0 + H * 0.3], [a.YB - L * 0.03, z0 + H * 0.78], [a.YF + L * 0.28, z0 + H * 0.7], [a.YF + L * 0.03, z0 + H * 0.58]], a.X0 + ww + 10, a.X1 - ww - 10);
      a.box(cx - W * 0.2, a.YF + L * 0.03 - 6, z0 + H * 0.55, cx + W * 0.2, a.YF + L * 0.03, z0 + H * 0.62); for (const s of [-1, 1]) a.cyl(cx + s * W * 0.14, a.YF + L * 0.03 - 4, z0 + H * 0.585, z0 + H * 0.59, 8, 8);
      a.box(cx - W * 0.1, a.YB - L * 0.03 - 6, z0 + H * 0.5, cx + W * 0.1, a.YB - L * 0.03, z0 + H * 0.58);
      a.cyl(cx + W * 0.32, a.YB - L * 0.12, z0 + H * 0.77, a.Z1 - H * 0.08, 5, 8); beaconAt(a, cx + W * 0.32, a.YB - L * 0.12, a.Z1 - H * 0.1, H * 0.05, H * 0.1); a.cyl(cx - W * 0.3, a.YB - L * 0.12, z0 + H * 0.76, a.Z1 - H * 0.2, 3, 6);
      a.rect(a.X0 + ww, a.YF, a.X1 - ww, a.YB); a.rect(a.X0, a.YF + L * 0.1, a.X0 + ww, a.YB - L * 0.1, 'EQUIP-DETAIL'); a.rect(a.X1 - ww, a.YF + L * 0.1, a.X1, a.YB - L * 0.1, 'EQUIP-DETAIL');
      a.log('Added the chassis, six wheels on rocker bars, the sloped cargo lid, the camera strip, the flag mast with beacon and the antenna (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic robotic lawn mower',
    desc: (v) => `Robotic lawn mower, ${v.L} mm long: a domed shell with a stop flap and a front bump hood, two large rear drive wheels with treads, two small front caster wheels, charging contacts at the nose and a short antenna.`,
    vs: [[330, 430, 200, 'small garden'], [400, 520, 240, 'medium garden'], [480, 650, 280, 'large garden']].map(([W, L, H, l]) => V(`${l}, ${L} mm`, W, L, H, { L })),
    build: (a, v) => {
      const W = a.W, L = a.D, H = a.H, cx = a.cx, cy = a.cy, z0 = a.Z0, rwr = H * 0.27;
      a.ell(cx, cy, z0 + H * 0.52, W * 0.43, L * 0.5, H * 0.44, 24, 12); a.box(cx - W * 0.28, cy - L * 0.1, z0 + H * 0.2, cx + W * 0.28, cy + L * 0.3, z0 + H * 0.42);
      for (const s of [-1, 1]) { const x = cx + s * W * 0.465; a.xcyl(x - W * 0.045, x + W * 0.045, cy + L * 0.22, z0 + rwr, rwr, 22); for (let i = 0; i < 16; i++) { const t = (TAU * i) / 16; a.box(x - W * 0.05, cy + L * 0.22 + rwr * m.cos(t) - 3, z0 + rwr + rwr * m.sin(t) - 3, x + W * 0.05, cy + L * 0.22 + rwr * m.cos(t) + 3, z0 + rwr + rwr * m.sin(t) + 3); } a.rect(x - W * 0.045, cy + L * 0.22 - rwr, x + W * 0.045, cy + L * 0.22 + rwr, 'EQUIP-DETAIL'); a.xcyl(cx + s * W * 0.36 - 6, cx + s * W * 0.36 + 6, cy - L * 0.34, z0 + H * 0.11, H * 0.11, 12); }
      a.box(cx - W * 0.18, cy - L * 0.5, z0 + H * 0.2, cx + W * 0.18, cy - L * 0.4, z0 + H * 0.52); a.box(cx - W * 0.14, cy - L * 0.28, z0 + H * 0.92, cx + W * 0.14, cy - L * 0.08, a.Z1); for (const s of [-1, 1]) a.box(cx + s * W * 0.07 - 4, cy - L * 0.5 - 8, z0 + H * 0.24, cx + s * W * 0.07 + 4, cy - L * 0.5, z0 + H * 0.3);
      a.cyl(cx + W * 0.2, cy + L * 0.38, z0 + H * 0.8, z0 + H * 0.96, 4, 6);
      a.ellp(cx, cy, W * 0.43, L * 0.5); a.rect(cx - W * 0.18, cy - L * 0.5, cx + W * 0.18, cy - L * 0.4, 'EQUIP-DETAIL'); a.rect(cx - W * 0.14, cy - L * 0.28, cx + W * 0.14, cy - L * 0.08, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the domed shell, the bump hood, the stop flap, the treaded rear wheels, the front casters, the charging contacts and the antenna (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic shelf-lifting warehouse robot',
    desc: (v) => v.shelf ? `Shelf-lifting warehouse robot, ${v.pay} kg class, carrying a four-post storage shelf with three levels of totes: a low drive unit with a round lift disc, front and rear scanners and an e-stop.` : `Shelf-lifting warehouse robot, ${v.pay} kg class: a low drive unit with a round lift disc on top, front and rear safety scanners, a status light bar, two e-stops and drive wheel skirts.`,
    vs: [[250, 560, 700, 220, false, 'bare drive unit'], [500, 800, 950, 1700, true, 'carrying a shelf'], [1000, 900, 1100, 300, false, 'bare drive unit']].map(([pay, W, L, H, shelf, l]) => V(`${pay} kg class, ${l}`, W, L, H, { pay, shelf })),
    build: (a, v) => {
      const W = a.W, L = a.D, cx = a.cx, cy = a.cy, z0 = a.Z0, hd = v.shelf ? 260 : a.H * 0.8;
      a.box(a.X0 + 10, a.YF + 10, z0 + 20, a.X1 - 10, a.YB - 10, z0 + hd * 0.7); a.box(a.X0, a.YF + L * 0.06, z0 + hd * 0.22, a.X1, a.YB - L * 0.06, z0 + hd * 0.5);
      for (const s of [-1, 1]) for (const t of [-1, 1]) a.xcyl(cx + s * W * 0.44 - 10, cx + s * W * 0.44 + 10, cy + t * L * 0.32, z0 + 25, 25, 12);
      a.cyl(cx, cy, z0 + hd * 0.7, z0 + hd * 0.9, W * 0.3, 28); a.cyl(cx, cy, z0 + hd * 0.9, z0 + hd * 0.96, W * 0.34, 28);
      for (const t of [-1, 1]) { puck(a, cx, cy + t * (L / 2 - 30), z0 + hd * 0.24, 22, 30); a.box(cx - W * 0.2, cy + t * (L / 2 - 10) - 4, z0 + hd * 0.56, cx + W * 0.2, cy + t * (L / 2 - 10) + 4, z0 + hd * 0.64); }
      estop(a, cx + W * 0.36, a.YF + 5, z0 + hd * 0.72, 9); estop(a, cx - W * 0.36, a.YB - 5, z0 + hd * 0.72, 9);
      if (v.shelf) { const sw = W * 0.9, sl = L * 0.9, zb = z0 + hd * 0.96 + 10; for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * sw / 2 - 12, cy + sy * sl / 2 - 12, zb, cx + sx * sw / 2 + 12, cy + sy * sl / 2 + 12, a.Z1);
        for (const f of [0, 0.38, 0.7, 1.0]) { const z = zb + (a.Z1 - zb - 20) * f; a.box(cx - sw / 2, cy - sl / 2, z, cx + sw / 2, cy + sl / 2, z + 20); if (f > 0 && f < 1) for (const sx of [-1, 1]) a.box(cx + sx * sw * 0.23 - sw * 0.2, cy - sl * 0.38, z + 20, cx + sx * sw * 0.23 + sw * 0.2, cy + sl * 0.38, z + 20 + (a.Z1 - zb) * 0.2); }
        a.rect(cx - sw / 2, cy - sl / 2, cx + sw / 2, cy + sl / 2, 'EQUIP-DETAIL'); } else a.circ(cx, cy, W * 0.3, 'EQUIP-DETAIL');
      a.outline();
      a.log('Added the drive unit, the wheel skirts, the lift disc, the scanners, the e-stops' + (v.shelf ? ' and the four-post shelf with totes' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic autonomous pallet jack',
    desc: (v) => `Autonomous pallet jack, ${v.cap} t class with ${v.F} mm forks: two forks with tapered tips and load rollers, a rear drive unit with battery cover and drive wheel, a front-facing scanner, a rear scanner mast with a beacon and an e-stop.`,
    vs: [[1.0, 1150, 'single pallet'], [1.6, 1150, 'single pallet'], [2.0, 1800, 'long forks']].map(([cap, F, l]) => V(`${cap} t, ${l}`, 720, F + 560, 1200, { cap, F })),
    build: (a, v) => {
      const F = v.F, W = a.W, cx = a.cx, z0 = a.Z0, yb = a.YB, yf = a.YF, fw = 160;
      for (const s of [-1, 1]) { const x = cx + s * (W / 2 - fw / 2 - 20); a.box(x - fw / 2, yf + 120, z0 + 40, x + fw / 2, yb - 520, z0 + 105); prismX(a, [[yf, z0 + 40], [yf + 120, z0 + 40], [yf + 120, z0 + 105], [yf + 40, z0 + 70]], x - fw / 2, x + fw / 2); a.xcyl(x - fw * 0.3, x + fw * 0.3, yf + 55, z0 + 28, 28, 12); a.xcyl(x - fw * 0.3, x + fw * 0.3, yb - 520 - 100, z0 + 38, 38, 12); a.rect(x - fw / 2, yf, x + fw / 2, yb - 520, 'EQUIP'); }
      a.box(cx - W / 2 + 10, yb - 560, z0 + 70, cx + W / 2 - 10, yb, z0 + 700); a.box(cx - W * 0.3, yb - 540, z0 + 700, cx + W * 0.3, yb - 40, z0 + 760); a.cyl(cx, yb - 330, z0, z0 + 70, 90, 20);
      a.box(cx - W * 0.45, yb - 560, z0 + 380, cx + W * 0.45, yb - 530, z0 + 640); puck(a, cx, yb - 570, z0 + 120, 36, 70);
      a.cyl(cx - W * 0.35, yb - 80, z0 + 760, a.Z1 - 90, 14, 10); a.box(cx - W * 0.42, yb - 110, a.Z1 - 90, cx - W * 0.28, yb - 50, a.Z1 - 60); beaconAt(a, cx - W * 0.35, yb - 80, a.Z1 - 60, 36, 60); estop(a, cx + W * 0.3, yb - 40, z0 + 640, 16);
      for (const f of [0.35, 0.65]) a.box(cx + W * 0.28, yb - 40, z0 + 420 + 0 * f, cx + W * 0.4, yb, z0 + 450);
      a.rect(cx - W / 2, yb - 560, cx + W / 2, yb); a.circ(cx, yb - 330, 90, 'EQUIP-HIDDEN');
      a.log('Added the two forks with tapered tips and rollers, the drive unit with battery cover and drive wheel, the scanners, the beacon mast and the e-stop (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic hospital delivery robot',
    desc: (v) => `Hospital delivery robot, ${v.n} locking compartments: a rounded low base on four wheels, a cabinet body with ${v.n} doors with finger pulls and key locks, a front lidar, a tilted touch display on top and a rear handle.`,
    vs: [[2, 500, 600, 1000], [3, 600, 700, 1200], [4, 700, 800, 1400]].map(([n, W, L, H]) => V(`${n} compartments`, W, L, H, { n })),
    build: (a, v) => {
      const n = v.n, W = a.W, L = a.D, H = a.H, cx = a.cx, cy = a.cy, z0 = a.Z0, bh = H * 0.12, cz0 = z0 + bh, cz1 = a.Z1 - H * 0.1;
      a.box(a.X0 + 10, a.YF + 10, z0 + 30, a.X1 - 10, a.YB - 10, cz0); for (const s of [-1, 1]) for (const t of [-1, 1]) wy(a, cx + s * (W / 2 - 40), cy + t * L * 0.34, z0 + 38, 38, 36);
      a.box(a.X0 + 20, a.YF + 20, cz0, a.X1 - 20, a.YB - 20, cz1); const dh = (cz1 - cz0 - 20) / n;
      for (let i = 0; i < n; i++) { const z = cz0 + 10 + i * dh; a.box(a.X0 + 30, a.YF + 10, z + 6, a.X1 - 30, a.YF + 20, z + dh - 6); a.box(cx - W * 0.12, a.YF + 2, z + dh * 0.62, cx + W * 0.12, a.YF + 10, z + dh * 0.7); a.ycyl(a.YF + 6, a.YF + 11, cx + W * 0.3, z + dh * 0.5, 7, 8); }
      puck(a, cx, a.YF + 40, z0 + bh * 0.2, 28, 40);
      prismX(a, [[a.YF + 30, cz1], [a.YB - 30, cz1], [a.YB - 30, a.Z1], [a.YB - 70, a.Z1]], a.X0 + W * 0.2, a.X1 - W * 0.2); a.box(a.X0 + W * 0.23, a.YF + 40, cz1, a.X1 - W * 0.23, a.YF + 80, cz1 + 20);
      a.ycyl(a.YB, a.YB + 0.0, 0, 0, 0.01, 3); a.box(cx - W * 0.3, a.YB - 25, cz1 - 120, cx + W * 0.3, a.YB - 10, cz1 - 90);
      a.rect(a.X0 + 10, a.YF + 10, a.X1 - 10, a.YB - 10); a.rect(a.X0 + 20, a.YF + 20, a.X1 - 20, a.YB - 20, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the base with wheels, the cabinet with ' + n + ' doors, pulls and locks, the lidar, the display and the rear handle (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic pipe inspection crawler',
    desc: (v) => `Pipe inspection crawler for ${v.P} mm pipe: a cylindrical body with a camera dome and lamp ring at the front, two sets of four spring arms with wheels pressing on the pipe wall and a tether eye at the rear.`,
    vs: [150, 300, 600].map((P) => V(`${P} mm pipe`, P * 0.96, P * 1.6, P * 0.96, { P })),
    build: (a, v) => {
      const P = v.P, cx = a.cx, cy = a.cy, zc = a.Z0 + a.H / 2, rb = P * 0.15, rw = P * 0.075, rr = P * 0.4;
      a.ycyl(cy - P * 0.6, cy + P * 0.55, cx, zc, rb, 22); a.ell(cx, cy - P * 0.62, zc, rb * 0.95, rb * 0.7, rb * 0.95, 14, 8); ring(a, 'y', cx, zc, cy - P * 0.5, cy - P * 0.42, rb * 0.6, rb * 1.12, 20);
      a.cyl(cx, cy - P * 0.7, zc - rb * 0.3, zc + rb * 0.3, rb * 0.25, 10); a.tube([[cx, cy + P * 0.55, zc], [cx, cy + P * 0.75, zc]], [rb * 0.5, rb * 0.3], 10); a.xcyl(cx - rb * 0.12, cx + rb * 0.12, cy + P * 0.77, zc, rb * 0.28, 12);
      for (const yy of [cy - P * 0.28, cy + P * 0.28]) { a.box(cx - rb * 1.2, yy - rb * 0.3, zc - rb * 1.2, cx + rb * 1.2, yy + rb * 0.3, zc + rb * 1.2);
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { a.tube([[cx + dx * rb * 0.9, yy, zc + dz * rb * 0.9], [cx + dx * rr, yy, zc + dz * rr]], [rw * 0.3, rw * 0.3], 6);
          if (dz !== 0) a.xcyl(cx - rw * 0.9, cx + rw * 0.9, yy, zc + dz * rr, rw, 12); else a.cyl(cx + dx * rr, yy, zc - rw * 0.9, zc + rw * 0.9, rw, 12); } }
      a.rect(cx - rb, cy - P * 0.6, cx + rb, cy + P * 0.55); for (const yy of [cy - P * 0.28, cy + P * 0.28]) a.line(cx - rr - rw, yy, cx + rr + rw, yy, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the body, the camera dome and lamp ring, the two sets of four spring arms with wheels and the tether eye (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic fixed-wing survey drone',
    desc: (v) => `Fixed-wing survey drone, ${v.S} mm span: a tapered fuselage with a nose camera hatch, two swept wing panels with winglets, a V-tail, a pusher propeller at the tail and a small tricycle landing gear.`,
    vs: [1200, 2000, 3000].map((S) => V(`${S} mm span`, S, S * 0.72, S * 0.2, { S })),
    build: (a, v) => {
      const S = v.S, cx = a.cx, yf = a.YF, yb = a.YB, z0 = a.Z0, zf = z0 + S * 0.11;
      a.tube([[cx, yf + S * 0.04, zf], [cx, yf + S * 0.12, zf], [cx, yf + S * 0.36, zf], [cx, yb - S * 0.2, zf + S * 0.01], [cx, yb - S * 0.07, zf + S * 0.02]], [S * 0.012, S * 0.036, S * 0.04, S * 0.022, S * 0.008], 16); a.ell(cx, yf + S * 0.05, zf, S * 0.02, S * 0.035, S * 0.02, 10, 6); a.box(cx - S * 0.03, yf + S * 0.2, zf + S * 0.03, cx + S * 0.03, yf + S * 0.3, zf + S * 0.045);
      const wz = zf + S * 0.01, th = S * 0.014, yR = yf + S * 0.26, cr = S * 0.15, tr = S * 0.07, sw = S * 0.07;
      for (const s of [-1, 1]) { a.prism(s > 0 ? [[cx + S * 0.03, yR], [cx + S * 0.5, yR + sw], [cx + S * 0.5, yR + sw + tr], [cx + S * 0.03, yR + cr]] : [[cx - S * 0.03, yR], [cx - S * 0.03, yR + cr], [cx - S * 0.5, yR + sw + tr], [cx - S * 0.5, yR + sw]], wz - th / 2, wz + th / 2);
        a.box(cx + s * S * 0.5 - 3, yR + sw, wz - th, cx + s * S * 0.5 + 3, yR + sw + tr, wz + S * 0.045); }
      const ty = yb - S * 0.09; for (const s of [-1, 1]) bar(a, 'y', [cx + s * S * 0.02, zf + S * 0.01], [cx + s * S * 0.13, zf + S * 0.085], S * 0.016, ty, ty + S * 0.075);
      prop(a, cx, yb - S * 0.02, zf + S * 0.02, S * 0.07, 2, 4); a.cyl(cx, yb - S * 0.05, zf, zf + S * 0.04, S * 0.012, 8);
      for (const s of [-1, 1]) { a.tube([[cx + s * S * 0.01, yf + S * 0.36, zf - S * 0.03], [cx + s * S * 0.06, yf + S * 0.36, z0 + S * 0.03]], [S * 0.005, S * 0.005], 6); a.xcyl(cx + s * S * 0.06 - 5, cx + s * S * 0.06 + 5, yf + S * 0.36, z0 + S * 0.025, S * 0.025, 12); }
      a.tube([[cx, yf + S * 0.1, zf - S * 0.02], [cx, yf + S * 0.1, z0 + S * 0.02]], [S * 0.004, S * 0.004], 6); a.xcyl(cx - 4, cx + 4, yf + S * 0.1, z0 + S * 0.02, S * 0.02, 10);
      a.poly([[cx, yf + S * 0.01], [cx + S * 0.03, yf + S * 0.2], [cx + S * 0.5, yR + sw], [cx + S * 0.5, yR + sw + tr], [cx + S * 0.03, yR + cr], [cx + S * 0.02, yb - S * 0.1], [cx + S * 0.13, yb - S * 0.1], [cx + S * 0.13, yb - S * 0.02], [cx - S * 0.13, yb - S * 0.02], [cx - S * 0.13, yb - S * 0.1], [cx - S * 0.02, yb - S * 0.1], [cx - S * 0.03, yR + cr], [cx - S * 0.5, yR + sw + tr], [cx - S * 0.5, yR + sw], [cx - S * 0.03, yf + S * 0.2]]); a.outline('EQUIP-HIDDEN');
      a.log('Added the fuselage, the camera hatch, the wing panels with winglets, the V-tail, the pusher propeller and the landing gear (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic heavy-lift hexacopter',
    desc: (v) => `Six-rotor heavy-lift multicopter, ${v.D} mm motor-to-motor: a central plate with a battery pack and a canopy, six tapered arms with motors and two-blade propellers, two landing skids and a camera gimbal ball under the body.`,
    vs: [800, 1200, 1600].map((D) => V(`${D} mm motor-to-motor`, D * 1.3, D * 1.2, D * 0.3, { D })),
    build: (a, v) => {
      const D = v.D, cx = a.cx, cy = a.cy, z0 = a.Z0, pr = D * 0.15, zp = z0 + D * 0.2;
      ring(a, 'z', cx, cy, zp - D * 0.015, zp + D * 0.015, 0, D * 0.12, 24); ring(a, 'z', cx, cy, zp + D * 0.015, zp + D * 0.03, 0, D * 0.1, 24); a.box(cx - D * 0.12, cy - D * 0.07, zp + D * 0.03, cx + D * 0.12, cy + D * 0.07, zp + D * 0.075); a.ell(cx, cy - D * 0.07, zp + D * 0.045, D * 0.06, D * 0.04, D * 0.04, 12, 6);
      for (let i = 0; i < 6; i++) { const t = (TAU * i) / 6 + 0.0, mx = cx + (D / 2) * m.cos(t), my = cy + (D / 2) * m.sin(t); a.tube([[cx + D * 0.08 * m.cos(t), cy + D * 0.08 * m.sin(t), zp], [mx, my, zp]], [D * 0.018, D * 0.012], 8); a.cyl(mx, my, zp - D * 0.005, zp + D * 0.04, D * 0.028, 14); prop(a, mx, my, zp + D * 0.04, pr, 2, 3); }
      for (const s of [-1, 1]) { const x = cx + s * D * 0.12; a.tube([[x, cy - D * 0.2, z0 + D * 0.012], [x, cy + D * 0.2, z0 + D * 0.012]], [D * 0.008, D * 0.008], 8); for (const y of [cy - D * 0.12, cy + D * 0.12]) a.tube([[x, y, z0 + D * 0.012], [x * 0.2 + cx * 0.8, y, zp - D * 0.01]], [D * 0.007, D * 0.007], 6); }
      a.cyl(cx, cy, zp - D * 0.07, zp - D * 0.015, D * 0.02, 10); a.ell(cx, cy, zp - D * 0.09, D * 0.045, D * 0.045, D * 0.045, 12, 8); a.circ(cx, cy, D * 0.12, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the central plate, the battery and canopy, six arms with motors and propellers, the landing skids and the gimbal ball (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic open-frame underwater vehicle',
    desc: (v) => `Open-frame inspection underwater vehicle, ${v.L} mm long: two side frame plates with cross tubes, a foam block on top, two rear horizontal thrusters, two vertical thrusters, a front camera dome and two lamps, on a bottom skid.`,
    vs: [400, 700, 1000].map((L) => V(`${L} mm, inspection class`, L * 0.62, L, L * 0.5, { L })),
    build: (a, v) => {
      const L = v.L, W = a.W, cx = a.cx, cy = a.cy, z0 = a.Z0, yf = a.YF, yb = a.YB, ft = L * 0.025;
      for (const s of [-1, 1]) { prismX(a, [[yf + L * 0.04, z0 + L * 0.06], [yb - L * 0.04, z0 + L * 0.06], [yb - L * 0.04, z0 + L * 0.3], [yf + L * 0.1, z0 + L * 0.3], [yf + L * 0.04, z0 + L * 0.2]], cx + s * W * 0.46 - ft / 2, cx + s * W * 0.46 + ft / 2); }
      for (const y of [yf + L * 0.14, cy, yb - L * 0.14]) for (const z of [z0 + L * 0.08, z0 + L * 0.28]) a.xcyl(cx - W * 0.46, cx + W * 0.46, y, z, L * 0.012, 8);
      a.box(cx - W * 0.4, yf + L * 0.12, z0 + L * 0.3, cx + W * 0.4, yb - L * 0.06, z0 + L * 0.5); a.box(cx - W * 0.36, yf + L * 0.12, z0 + L * 0.3, cx + W * 0.36, yb - L * 0.06, z0 + L * 0.34);
      a.cyl(cx, cy + L * 0.04, z0 + L * 0.12, z0 + L * 0.26, L * 0.09, 20); a.ell(cx, yf + L * 0.1, z0 + L * 0.19, L * 0.05, L * 0.05, L * 0.05, 12, 8);
      for (const s of [-1, 1]) { const x = cx + s * W * 0.34; a.ycyl(yb - L * 0.2, yb - L * 0.04, x, z0 + L * 0.18, L * 0.045, 16); ring(a, 'y', x, z0 + L * 0.18, yb - L * 0.03, yb - L * 0.02, L * 0.045, L * 0.06, 16); a.cyl(cx + s * W * 0.22, cy + L * 0.04, z0 + L * 0.3, z0 + L * 0.5 - 0.1, 0.01, 3); a.cyl(cx + s * W * 0.2, cy - L * 0.2, z0 + L * 0.31, z0 + L * 0.34 + L * 0.0, L * 0.04, 14); a.cyl(cx + s * W * 0.2, cy - L * 0.2, z0 + L * 0.2, z0 + L * 0.3, L * 0.03, 12); a.ycyl(yf + L * 0.02, yf + L * 0.1, cx + s * W * 0.3, z0 + L * 0.19, L * 0.022, 10); }
      a.box(cx - W * 0.44, yf + L * 0.08, z0, cx + W * 0.44, yf + L * 0.14, z0 + L * 0.06); a.box(cx - W * 0.44, yb - L * 0.14, z0, cx + W * 0.44, yb - L * 0.08, z0 + L * 0.06);
      a.rect(cx - W * 0.46, yf + L * 0.04, cx + W * 0.46, yb - L * 0.04); a.rect(cx - W * 0.4, yf + L * 0.12, cx + W * 0.4, yb - L * 0.06, 'EQUIP-DETAIL'); a.circ(cx, cy + L * 0.04, L * 0.09, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the side frames, the cross tubes, the foam block, the four thrusters, the camera dome, the lamps and the skid (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic mecanum-wheel platform',
    desc: (v) => `Omnidirectional platform on four mecanum wheels, ${v.L} mm long: a frame with side rails and cross members, a top deck with a bolt grid, a battery bay, a front lidar and an e-stop; each wheel has angled rollers and a hub.`,
    vs: [[400, 500, 170, 'light'], [600, 800, 220, 'medium'], [900, 1200, 300, 'heavy']].map(([W, L, H, l]) => V(`${l}, ${L} mm`, W, L, H, { L })),
    build: (a, v) => {
      const W = a.W, L = a.D, H = a.H, cx = a.cx, cy = a.cy, z0 = a.Z0, wr = H * 0.34, ww = W * 0.14;
      a.box(a.X0 + ww + 10, a.YF + 10, z0 + H * 0.3, a.X1 - ww - 10, a.YB - 10, z0 + H * 0.6); for (const s of [-1, 1]) a.box(cx + s * (W / 2 - ww - 40) - 20, a.YF + 10, z0 + H * 0.2, cx + s * (W / 2 - ww - 40) + 20, a.YB - 10, z0 + H * 0.62);
      for (const s of [-1, 1]) for (const t of [-1, 1]) { mecanum(a, cx + s * (W / 2 - ww / 2), cy + t * L * 0.33, z0 + wr, wr, ww, s * t); a.box(cx + s * (W / 2 - ww - 30) - 6, cy + t * L * 0.33 - 30, z0 + wr - 20, cx + s * (W / 2 - ww - 30) + 6, cy + t * L * 0.33 + 30, z0 + H * 0.5); }
      a.box(a.X0 + ww + 10, a.YF + 10, z0 + H * 0.6, a.X1 - ww - 10, a.YB - 10, z0 + H * 0.68); for (let i = -2; i <= 2; i++) for (let j = -3; j <= 3; j++) a.cyl(cx + i * W * 0.14, cy + j * L * 0.11, z0 + H * 0.68, z0 + H * 0.7, 6, 6);
      puck(a, cx, a.YF + L * 0.06, z0 + H * 0.7, W * 0.07, H * 0.28); estop(a, cx + W * 0.3, a.YB - L * 0.06, z0 + H * 0.7, 12);
      a.rect(a.X0 + ww + 10, a.YF + 10, a.X1 - ww - 10, a.YB - 10); a.outline('EQUIP-HIDDEN');
      a.log('Added the frame, the deck with bolt grid, four mecanum wheels with rollers, the lidar and the e-stop (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic self-balancing two-wheel robot',
    desc: (v) => `Self-balancing two-wheel robot, ${v.H0} mm tall, shown on its kickstand: two large wheels on a shared axle, a tall battery and electronics body, a head with camera and sensor bar, and a folding rear kickstand foot.`,
    vs: [[260, 200, 420, 'compact'], [420, 300, 900, 'tall']].map(([W, L, H, l]) => V(`${l}, ${H} mm tall`, W, L, H, { H0: H })),
    build: (a, v) => {
      const H = a.H, W = a.W, L = a.D, cx = a.cx, cy = a.cy, z0 = a.Z0, wr = H * 0.17, ww = W * 0.12;
      for (const s of [-1, 1]) { wy(a, cx + s * (W / 2 - ww / 2), cy, z0 + wr, wr, ww); a.xcyl(cx + s * (W * 0.3) - W * 0.08, cx + s * W * 0.3 + W * 0.08, cy, z0 + wr, wr * 0.55, 14); }
      a.box(cx - W * 0.3, cy - L * 0.3, z0 + wr * 0.8, cx + W * 0.3, cy + L * 0.3, z0 + H * 0.66); a.box(cx - W * 0.25, cy - L * 0.34, z0 + H * 0.3, cx + W * 0.25, cy - L * 0.3, z0 + H * 0.5);
      a.ell(cx, cy, z0 + H * 0.78, W * 0.26, L * 0.3, H * 0.14, 18, 10); a.box(cx - W * 0.2, cy - L * 0.36, z0 + H * 0.74, cx + W * 0.2, cy - L * 0.3, z0 + H * 0.82); puck(a, cx, cy, z0 + H * 0.9, W * 0.07, H * 0.1);
      a.tube([[cx, cy + L * 0.28, z0 + H * 0.2], [cx, cy + L * 0.5 - 6, z0 + 8]], [L * 0.02, L * 0.02], 8); a.box(cx - W * 0.1, cy + L * 0.5 - 26, z0, cx + W * 0.1, cy + L * 0.5, z0 + 10);
      a.rect(cx - W * 0.3, cy - L * 0.3, cx + W * 0.3, cy + L * 0.3); a.rect(cx - W * 0.1, cy + L * 0.5 - 26, cx + W * 0.1, cy + L * 0.5, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the two wheels, the body, the head with camera and sensor bar and the kickstand foot (plan and 3D).');
    } }),
  fam({ cat: 'robotics/mobile', title: 'Generic telepresence robot',
    desc: (v) => `Telepresence robot, ${v.H0} mm tall: a round weighted base with a bumper ring and two hidden drive wheels, a slim telescoping mast, a head with a tilting display and a camera strip, and a grab handle behind the display.`,
    vs: [[420, 1250], [480, 1500]].map(([D0, H]) => V(`${H} mm tall, ${D0} mm base`, D0, D0, H, { H0: H })),
    build: (a, v) => {
      const H = a.H, D0 = a.W, cx = a.cx, cy = a.cy, z0 = a.Z0, r = D0 / 2;
      a.cyl(cx, cy, z0 + 12, z0 + 85, r * 0.95, 32); ring(a, 'z', cx, cy, z0 + 25, z0 + 70, r * 0.95, r, 24, 0, TAU); a.cone(cx, cy, z0 + 85, z0 + 130, r * 0.95, r * 0.3, 28); a.cyl(cx, cy, z0 + 130, z0 + H * 0.5, 22, 14); a.cyl(cx, cy, z0 + H * 0.5, z0 + H * 0.84, 16, 12);
      a.cyl(cx, cy, z0 + H * 0.5 - 8, z0 + H * 0.5 + 8, 28, 14);
      const sw = D0 * 0.62, sh = H * 0.2; a.box(cx - sw / 2, cy - 14, z0 + H * 0.8, cx + sw / 2, cy + 14, z0 + H * 0.8 + sh); a.box(cx - sw / 2 + 12, cy - 18, z0 + H * 0.8 + 12, cx + sw / 2 - 12, cy - 14, z0 + H * 0.8 + sh - 12); a.box(cx - sw * 0.2, cy - 22, z0 + H * 0.8 + sh - 12, cx + sw * 0.2, cy - 14, z0 + H * 0.8 + sh - 4);
      a.tube([[cx - sw * 0.3, cy + 14, z0 + H * 0.8 + sh * 0.8], [cx - sw * 0.3, cy + 50, z0 + H * 0.8 + sh * 0.8], [cx + sw * 0.3, cy + 50, z0 + H * 0.8 + sh * 0.8], [cx + sw * 0.3, cy + 14, z0 + H * 0.8 + sh * 0.8]], [6, 6, 6, 6], 8);
      a.circ(cx, cy, r); a.rect(cx - sw / 2, cy - 14, cx + sw / 2, cy + 14, 'EQUIP-DETAIL'); a.circ(cx, cy, 22, 'EQUIP-DETAIL');
      a.log('Added the weighted base with bumper ring, the telescoping mast, the display head with camera strip and the handle (plan and 3D).');
    } }),
];

// ============================================================================================= PARTS
const boltHoles = (a, cx, cy, z0, z1, r, n, hr, rot = 0.78) => { for (let i = 0; i < n; i++) { const t = (TAU * i) / n + rot; a.cyl(cx + r * m.cos(t), cy + r * m.sin(t), z0 - 0.3, z1 + 0.3, hr, 6); } };
const parts = [
  fam({ cat: 'robotics/parts', title: 'Generic brushless gimbal motor',
    desc: (v) => `Outer-rotor brushless gimbal motor, ${v.D0} mm: a square mounting plate with four holes, a stator stack, a rotor bell with a magnet band, a hollow top cap and three lead wires leaving the base.`,
    vs: [35, 60, 90].map((D0) => V(`${D0} mm, outer rotor`, D0, D0, D0 * 0.62, { D0 })),
    build: (a, v) => {
      const D = v.D0, cx = a.cx, cy = a.cy, z0 = a.Z0, r = D * 0.45;
      plateHoles(a, a.X0, a.YF, a.X1, a.YB, z0, z0 + D * 0.07, [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => ({ x: cx + sx * D * 0.4, y: cy + sy * D * 0.4, rx: D * 0.04, ry: D * 0.04 })), 4);
      a.cyl(cx, cy, z0 + D * 0.07, z0 + D * 0.2, D * 0.22, 20); a.cyl(cx, cy, z0 + D * 0.2, z0 + D * 0.4, D * 0.3, 24); a.cyl(cx, cy, z0 + D * 0.4, z0 + D * 0.48, D * 0.18, 18);
      ring(a, 'z', cx, cy, z0 + D * 0.16, z0 + D * 0.48, r * 0.92, r, 32); a.cyl(cx, cy, z0 + D * 0.48, z0 + D * 0.52, r, 32); a.cyl(cx, cy, z0 + D * 0.52, z0 + D * 0.62, D * 0.09, 14); ring(a, 'z', cx, cy, z0 + D * 0.2, z0 + D * 0.42, r, r * 1.02, 32);
      for (let i = 0; i < 3; i++) a.tube([[cx + D * 0.12 * (i - 1), cy + D * 0.22, z0 + D * 0.1], [cx + D * 0.15 * (i - 1), cy + D * 0.42, z0 + D * 0.06], [cx + D * 0.2 * (i - 1), cy + D * 0.5 - 2, z0 + D * 0.04]], [D * 0.012, D * 0.012, D * 0.012], 6);
      a.circ(cx, cy, r); a.circ(cx, cy, D * 0.09, 'EQUIP-DETAIL'); a.outline();
      a.log('Added the mounting plate with holes, the stator, the rotor bell with magnet band, the top cap and the lead wires (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic strain-wave reducer',
    desc: (v) => `Strain-wave (harmonic) reducer unit, ${v.D0} mm: an outer circular spline ring with a bolt circle, a thin-walled flexspline cup, a wave generator hub with a bore and an output flange with a ring of holes.`,
    vs: [60, 90, 130].map((D0) => V(`${D0} mm unit`, D0, D0, D0 * 0.42, { D0 })),
    build: (a, v) => {
      const D = v.D0, cx = a.cx, cy = a.cy, z0 = a.Z0, r = D / 2;
      ring(a, 'z', cx, cy, z0, z0 + D * 0.1, D * 0.2, r, 32); boltHoles(a, cx, cy, z0, z0 + D * 0.1, r * 0.86, 12, D * 0.018);
      ring(a, 'z', cx, cy, z0 + D * 0.1, z0 + D * 0.24, r * 0.72, r * 0.9, 32); ring(a, 'z', cx, cy, z0 + D * 0.1, z0 + D * 0.3, r * 0.64, r * 0.7, 32); ring(a, 'z', cx, cy, z0 + D * 0.24, z0 + D * 0.3, r * 0.7, r * 0.82, 32);
      ring(a, 'z', cx, cy, z0 + D * 0.3, z0 + D * 0.36, D * 0.18, r * 0.86, 32); boltHoles(a, cx, cy, z0 + D * 0.3, z0 + D * 0.36, r * 0.7, 8, D * 0.016, 0.2);
      ring(a, 'z', cx, cy, z0 + D * 0.06, z0 + D * 0.42, D * 0.1, D * 0.18, 20); ring(a, 'z', cx, cy, z0 + D * 0.12, z0 + D * 0.34, D * 0.18, D * 0.3, 24);
      a.circ(cx, cy, r); a.circ(cx, cy, r * 0.86, 'EQUIP-DETAIL'); a.circ(cx, cy, D * 0.18, 'EQUIP-DETAIL'); a.circ(cx, cy, D * 0.1, 'EQUIP-DETAIL');
      a.log('Added the circular spline ring with bolt circle, the flexspline cup, the wave generator hub and the output flange (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic planetary gearbox',
    desc: (v) => `Planetary gearhead, ${v.S} mm frame with ${v.st} stage${v.st > 1 ? 's' : ''}: a square input adapter plate, ${v.st} cylindrical stage housings stepping down, an output flange with four holes, a pilot boss and a keyed output shaft.`,
    vs: [[42, 1], [60, 2], [90, 3]].map(([S, st]) => V(`${S} mm frame, ${st} stage${st > 1 ? 's' : ''}`, S, S, 20 + st * S * 0.5 + S * 0.9, { S, st })),
    build: (a, v) => {
      const S = v.S, st = v.st, cx = a.cx, cy = a.cy, z0 = a.Z0; let z = z0;
      a.box(a.X0, a.YF, z, a.X1, a.YB, z + 12); z += 12; a.cyl(cx, cy, z, z + S * 0.12, S * 0.3, 18); z += S * 0.12;
      for (let i = 0; i < st; i++) { a.cyl(cx, cy, z, z + S * 0.5, S * (0.47 - i * 0.015), 28); a.cyl(cx, cy, z + S * 0.5 - 3, z + S * 0.5, S * (0.5 - i * 0.015), 28); z += S * 0.5; }
      plateHoles(a, a.X0, a.YF, a.X1, a.YB, z, z + 8, [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => ({ x: cx + sx * S * 0.38, y: cy + sy * S * 0.38, rx: S * 0.035, ry: S * 0.035 })), 3); z += 8;
      a.cyl(cx, cy, z, z + S * 0.1, S * 0.3, 22); z += S * 0.1; a.cyl(cx, cy, z, a.Z1, S * 0.14, 14); a.box(cx - S * 0.03, cy + S * 0.1, z + 4, cx + S * 0.03, cy + S * 0.16, a.Z1 - 4);
      a.rect(a.X0, a.YF, a.X1, a.YB); a.circ(cx, cy, S * 0.47, 'EQUIP-DETAIL'); a.circ(cx, cy, S * 0.14, 'EQUIP-DETAIL');
      a.log('Added the input plate, the stage housings, the output flange with holes and the keyed shaft (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic electric rod actuator',
    desc: (v) => `Electric linear rod actuator, ${v.st} mm stroke, on two foot brackets: a motor housing with a cable gland at the rear, a ball-screw tube, an extended rod and a clevis eye at the tip, and a rear eye.`,
    vs: [100, 300, 600].map((st) => V(`${st} mm stroke, extended`, st + 300, 70, 110, { st })),
    build: (a, v) => {
      const st = v.st, x0 = a.X0, x1 = a.X1, cy = a.cy, z0 = a.Z0, zc = z0 + 62, tr = 26;
      a.xcyl(x0 + 45, x0 + 150, cy, zc, 30, 18); a.box(x0 + 45, cy - 30, zc - 30, x0 + 150, cy + 30, zc + 30); a.ycyl(cy + 30, cy + 48, x0 + 110, zc + 5, 8, 8);
      a.xcyl(x0 + 150, x0 + 150 + (x1 - x0 - 300 + 100) * 0.4, cy, zc, tr, 18); const tEnd = x0 + 150 + (x1 - x0 - 200) * 0.45; a.xcyl(x0 + 150, tEnd, cy, zc, tr, 18); a.xcyl(tEnd, x1 - 55, cy, zc, 11, 12); a.xcyl(x1 - 55, x1 - 20, cy, zc, 16, 14);
      ring(a, 'y', x1 - 20, zc, cy - 12, cy + 12, 7, 20, 14); ring(a, 'y', x0 + 15, zc, cy - 12, cy + 12, 7, 20, 14); a.box(x0 + 15, cy - 10, zc - 20, x0 + 45, cy + 10, zc + 20);
      for (const x of [x0 + 160, tEnd - 70]) { a.box(x - 25, cy - 35, z0, x + 25, cy + 35, z0 + 10); a.box(x - 12, cy - 20, z0 + 10, x + 12, cy + 20, zc - tr + 4); }
      a.rect(x0 + 45, cy - 30, x0 + 150, cy + 30); a.rect(x0 + 150, cy - tr, tEnd, cy + tr, 'EQUIP-DETAIL'); a.line(tEnd, cy, x1 - 20, cy, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the motor housing, the screw tube, the rod, the clevis and rear eyes and the foot brackets (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic motor driver board',
    desc: (v) => `Motor driver board, ${v.Wb} x ${v.Db} mm: a circuit board on four standoffs with a finned heatsink block, screw terminal blocks along one edge, ${v.caps} electrolytic capacitors, a pin header and two chips.`,
    vs: [[60, 40, 2], [100, 60, 3], [150, 90, 4]].map(([Wb, Db, caps]) => V(`${Wb} x ${Db} mm, ${caps} capacitors`, Wb, Db, 14 + Wb * 0.28, { Wb, Db, caps })),
    build: (a, v) => {
      const { Wb, Db, caps } = v, x0 = a.X0, x1 = a.X1, y0 = a.YF, y1 = a.YB, z0 = a.Z0, zp = z0 + 8, cx = a.cx;
      for (const [x, y] of [[x0 + 5, y0 + 5], [x1 - 5, y0 + 5], [x0 + 5, y1 - 5], [x1 - 5, y1 - 5]]) a.cyl(x, y, z0, zp, 2.5, 8);
      a.box(x0, y0, zp, x1, y1, zp + 1.6); const zt = zp + 1.6, hw = Wb * 0.4, hd = Db * 0.4;
      a.box(cx - hw / 2, y0 + Db * 0.3, zt, cx + hw / 2, y0 + Db * 0.3 + hd, zt + 4); for (let i = 0; i < 8; i++) a.box(cx - hw / 2 + 2 + i * ((hw - 4) / 8), y0 + Db * 0.3 + 2, zt + 4, cx - hw / 2 + 2 + i * ((hw - 4) / 8) + (hw - 4) / 16, y0 + Db * 0.3 + hd - 2, a.Z1);
      for (let i = 0; i < 3; i++) a.box(x0 + 3 + i * (Wb * 0.26), y1 - 14, zt, x0 + 3 + i * (Wb * 0.26) + Wb * 0.22, y1 - 3, zt + 9);
      for (let i = 0; i < caps; i++) a.cyl(x0 + Wb * 0.12 + i * (Wb * 0.82) / caps, y0 + Db * 0.16, zt, zt + 12 + Wb * 0.03, 3.5 + Wb * 0.012, 10);
      a.box(x1 - Wb * 0.3, y0 + 3, zt, x1 - 3, y0 + 8, zt + 8); a.box(x0 + 6, y0 + Db * 0.45, zt, x0 + 14, y0 + Db * 0.6, zt + 1.5); a.box(x0 + 8, y0 + Db * 0.7, zt, x0 + 8 + Wb * 0.14, y0 + Db * 0.7 + Wb * 0.14, zt + 1.8);
      a.rect(x0, y0, x1, y1); a.rect(cx - hw / 2, y0 + Db * 0.3, cx + hw / 2, y0 + Db * 0.3 + hd, 'EQUIP-DETAIL'); for (const [x, y] of [[x0 + 5, y0 + 5], [x1 - 5, y0 + 5], [x0 + 5, y1 - 5], [x1 - 5, y1 - 5]]) a.circ(x, y, 2.5, 'EQUIP-DETAIL');
      a.log('Added the board on standoffs, the finned heatsink, the terminal blocks, the capacitors, the header and the chips (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic microcontroller board',
    desc: (v) => v.stack ? `Microcontroller board with a stacked expansion board, ${v.Wb} x ${v.Db} mm: two circuit boards on standoffs with header sockets between them, a USB connector, a power jack and a chip on each.` : `Microcontroller board, ${v.Wb} x ${v.Db} mm: a circuit board with four corner holes, two long pin header rows, a USB connector, a chip, a crystal and a reset button.`,
    vs: [[51, 26, false, 'small'], [69, 53, false, 'standard'], [86, 54, false, 'wide'], [69, 53, true, 'stacked']].map(([Wb, Db, stack, l]) => V(`${l}, ${Wb} x ${Db} mm`, Wb, Db, stack ? 32 : 14, { Wb, Db, stack })),
    build: (a, v) => {
      const { Wb, Db, stack } = v, x0 = a.X0, x1 = a.X1, y0 = a.YF, y1 = a.YB, z0 = a.Z0, zp = z0 + 6, cx = a.cx;
      const hl = [[x0 + 3.5, y0 + 3.5], [x1 - 3.5, y0 + 3.5], [x0 + 3.5, y1 - 3.5], [x1 - 3.5, y1 - 3.5]]; for (const [x, y] of hl) a.cyl(x, y, z0, zp, 2.4, 8);
      plateHoles(a, x0, y0, x1, y1, zp, zp + 1.6, hl.map(([x, y]) => ({ x, y, rx: 1.4, ry: 1.4 })), 3); const zt = zp + 1.6;
      for (const y of [y0 + 2.5, y1 - 2.5]) a.box(x0 + 8, y - 1.3, zt, x1 - 8, y + 1.3, zt + 8.5);
      a.box(x0 - 0 + 0.0, y0 + Db * 0.35, zt, x0 + 14, y0 + Db * 0.65, zt + 4); a.box(x0 + 22, y0 + Db * 0.3, zt, x0 + 22 + m.min(14, Wb * 0.2), y0 + Db * 0.3 + m.min(14, Wb * 0.2), zt + 1.6); a.cyl(x0 + 40, cx * 0 + y0 + Db * 0.7, zt, zt + 1, 2.5, 8); a.box(x1 - 14, y0 + Db * 0.4, zt, x1 - 8, y0 + Db * 0.4 + 6, zt + 3.4);
      if (stack) { const z2 = zt + 22; for (const [x, y] of hl) a.cyl(x, y, zt + 8.5, z2, 2.4, 8); a.box(x0, y0, z2, x1, y1, z2 + 1.6); a.box(x0 + 10, y0 + Db * 0.35, z2 + 1.6, x0 + 10 + 16, y0 + Db * 0.35 + 16, z2 + 3.2); a.box(x1 - 20, y1 - 14, z2 + 1.6, x1 - 6, y1 - 4, z2 + 11); }
      a.rect(x0, y0, x1, y1); for (const [x, y] of hl) a.circ(x, y, 1.4, 'EQUIP-DETAIL'); a.rect(x0 + 8, y0 + 1.2, x1 - 8, y0 + 3.8, 'EQUIP-DETAIL');
      a.log('Added the board, the pin header rows, the USB connector, the chip and the reset button' + (stack ? ', the stacked second board' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic stereo depth camera',
    desc: (v) => `Stereo depth camera bar, ${v.Wc} mm wide: a rectangular body with a dark front glass, two lens barrels, an infrared emitter and a colour lens, a hinged mounting foot with a screw boss and a USB cable.`,
    vs: [90, 124, 180].map((Wc) => V(`${Wc} mm bar, on foot`, Wc, Wc * 0.27, Wc * 0.4, { Wc })),
    build: (a, v) => {
      const Wc = v.Wc, x0 = a.X0, x1 = a.X1, cx = a.cx, z0 = a.Z0, yf = a.YF, yb = a.YB, bh = Wc * 0.2, bz = z0 + Wc * 0.17, bd = a.D * 0.6;
      a.box(cx - Wc * 0.2, yb - bd - 12, z0, cx + Wc * 0.2, yb - 4, z0 + 5); a.box(cx - Wc * 0.04, yb - bd * 0.7 - 10, z0 + 5, cx + Wc * 0.04, yb - bd * 0.7, bz); a.xcyl(cx - Wc * 0.07, cx + Wc * 0.07, yb - bd * 0.7 - 4, bz + 2, Wc * 0.03, 12);
      a.box(x0, yf + a.D * 0.3, bz, x1, yf + a.D * 0.3 + bd * 0.9, bz + bh); a.box(x0 + 2, yf + a.D * 0.3 - 1.5, bz + 2, x1 - 2, yf + a.D * 0.3, bz + bh - 2);
      for (const [fx, r] of [[-0.38, Wc * 0.045], [0.38, Wc * 0.045], [0.12, Wc * 0.03], [-0.12, Wc * 0.03]]) { a.ycyl(yf + a.D * 0.3 - 5, yf + a.D * 0.3 - 1, cx + fx * Wc, bz + bh / 2, r, 14); a.ycyl(yf + a.D * 0.3 - 7, yf + a.D * 0.3 - 5, cx + fx * Wc, bz + bh / 2, r * 0.6, 12); }
      a.tube([[cx + Wc * 0.2, yb - 4, z0 + 4], [cx + Wc * 0.2, yb - 3, z0 + 3]], [3, 3], 6); a.tube([[cx + Wc * 0.42, yf + a.D * 0.3 + bd * 0.9, bz + bh * 0.4], [cx + Wc * 0.45, yb - 1, bz + bh * 0.2], [cx + Wc * 0.45, yb - 1, z0 + 6]], [2.5, 2.5, 2.5], 6);
      a.rect(x0, yf + a.D * 0.3, x1, yf + a.D * 0.3 + bd * 0.9); a.rect(cx - Wc * 0.2, yb - bd - 12, cx + Wc * 0.2, yb - 4, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the body with front glass, the lens barrels, the emitter, the hinged foot and the cable (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic six-axis force torque sensor',
    desc: (v) => `Six-axis force-torque sensor, ${v.D0} mm: a flanged base ring with bolt holes, four flexure spokes between the base and a tool ring, a tool flange with a pilot bore and a side cable connector.`,
    vs: [40, 75, 130].map((D0) => V(`${D0} mm disc`, D0, D0 * 1.25, D0 * 0.4, { D0 })),
    build: (a, v) => {
      const D = v.D0, cx = a.cx, cy = a.cy - D * 0.12, z0 = a.Z0, r = D / 2;
      ring(a, 'z', cx, cy, z0, z0 + D * 0.1, D * 0.12, r, 30); boltHoles(a, cx, cy, z0, z0 + D * 0.1, r * 0.82, 8, D * 0.025);
      for (let i = 0; i < 4; i++) { const t = (TAU * i) / 4 + 0.78; bar(a, 'z', [cx + D * 0.14 * m.cos(t), cy + D * 0.14 * m.sin(t)], [cx + r * 0.78 * m.cos(t), cy + r * 0.78 * m.sin(t)], D * 0.07, z0 + D * 0.1, z0 + D * 0.26, false); }
      ring(a, 'z', cx, cy, z0 + D * 0.1, z0 + D * 0.26, r * 0.78, r * 0.86, 30); ring(a, 'z', cx, cy, z0 + D * 0.26, z0 + D * 0.4, D * 0.12, r * 0.62, 28); boltHoles(a, cx, cy, z0 + D * 0.26, z0 + D * 0.4, r * 0.45, 6, D * 0.02, 0);
      a.box(cx - D * 0.16, cy + r * 0.86, z0 + D * 0.05, cx + D * 0.16, cy + r * 0.86 + D * 0.24, z0 + D * 0.24); a.cyl(cx, cy + r * 0.86 + D * 0.24, z0 + D * 0.12, z0 + D * 0.13, 0.01, 3); a.ycyl(cy + r * 0.86 + D * 0.24, a.YB, cx, z0 + D * 0.14, D * 0.07, 12);
      a.circ(cx, cy, r); a.circ(cx, cy, r * 0.62, 'EQUIP-DETAIL'); a.circ(cx, cy, D * 0.12, 'EQUIP-DETAIL'); a.rect(cx - D * 0.16, cy + r * 0.86, cx + D * 0.16, a.YB, 'EQUIP-DETAIL');
      a.log('Added the base ring, the four flexure spokes, the tool ring and flange and the cable connector (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic hollow-shaft encoder',
    desc: (v) => `Hollow-shaft rotary encoder, ${v.D0} mm housing with a ${v.bore} mm through bore: a round body with a stepped cover, a clamp ring on the bore, a flexible torque stop arm with a slot and a side cable exit.`,
    vs: [[38, 12], [58, 20], [90, 38]].map(([D0, bore]) => V(`${D0} mm, ${bore} mm bore`, D0 * 1.1, D0 * 1.3, D0 * 0.6, { D0, bore })),
    build: (a, v) => {
      const D = v.D0, b = v.bore, cx = a.cx, cy = a.cy, z0 = a.Z0, r = D / 2;
      ring(a, 'z', cx, cy, z0, z0 + D * 0.28, b / 2, r, 32); ring(a, 'z', cx, cy, z0 + D * 0.28, z0 + D * 0.4, b / 2, r * 0.82, 32); ring(a, 'z', cx, cy, z0 + D * 0.4, z0 + D * 0.58, b / 2, b / 2 + D * 0.1, 20); ring(a, 'z', cx, cy, z0 + D * 0.5, z0 + D * 0.6, b / 2, b / 2 + D * 0.14, 20);
      plateHoles(a, cx + r * 0.7, cy - D * 0.06, cx + D * 0.8, cy + D * 0.06, z0 + D * 0.08, z0 + D * 0.14, [{ x: cx + r * 0.75 + D * 0.1, y: cy, rx: D * 0.08, ry: D * 0.025 }], 3); a.box(cx + r - 4, cy - D * 0.08, z0 + D * 0.05, cx + r * 0.7 + D * 0.14, cy + D * 0.08, z0 + D * 0.17);
      a.ycyl(cy + r * 0.9, a.YB, cx - D * 0.1, z0 + D * 0.14, D * 0.05, 10); a.cyl(cx - D * 0.1, cy + r * 0.9, z0 + D * 0.08, z0 + D * 0.2, D * 0.07, 10);
      for (let i = 0; i < 3; i++) a.cyl(cx + r * 0.62 * m.cos(i * 2.094), cy + r * 0.62 * m.sin(i * 2.094), z0 + D * 0.4, z0 + D * 0.43, D * 0.025, 6);
      a.circ(cx, cy, r); a.circ(cx, cy, b / 2, 'EQUIP-DETAIL'); a.rect(cx + r * 0.7, cy - D * 0.08, cx + D * 0.8, cy + D * 0.08, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the round body, the stepped cover, the bore clamp ring, the torque stop arm with slot and the cable exit (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic inductive proximity sensor',
    desc: (v) => `Cylindrical inductive proximity sensor, ${v.M} thread, in a mounting bracket: a threaded barrel with a flat sensing face down, two hex lock nuts, an indicator LED cap and a cable leaving the rear, through a bent bracket block.`,
    vs: [[8, 'M8', 40], [12, 'M12', 50], [18, 'M18', 60], [30, 'M30', 70]].map(([d, M, L]) => V(`${M} barrel`, d * 3.4, d * 3.0, L + 16, { d, M, L })),
    build: (a, v) => {
      const d = v.d, L = v.L, cx = a.cx, cy = a.cy, z0 = a.Z0, r = d / 2, zb = z0 + 10;
      a.box(a.X0, a.YF, z0, a.X1, a.YB, z0 + 8); a.box(cx - d * 1.2, cy - d * 1.4, z0 + 8, cx + d * 1.2, cy + d * 1.4, z0 + 8 + d * 0.9);
      a.cyl(cx, cy, zb - 8 + 0.5, zb + L - 4, r * 0.9, 18); thread(a, cx, cy, zb, zb + L * 0.8, r, r * 0.9, d * 0.12, 14, 14); a.cyl(cx, cy, z0, z0 + 2, r * 0.8, 16);
      for (const z of [z0 + 8 + d * 0.9, z0 + 8 + d * 0.9 + 0.001]) a.prism(ptsC(cx, cy, r * 1.35, 6), z, z + d * 0.35); a.prism(ptsC(cx, cy, r * 1.35, 6), z0 + 4, z0 + 8); a.cyl(cx, cy, zb + L * 0.8, a.Z1 - 2, r * 0.95, 16); a.cyl(cx, cy, a.Z1 - 2, a.Z1, r * 0.7, 14);
      a.tube([[cx, cy, a.Z1], [cx + d * 0.5, cy + d * 1.2, a.Z1 - 4], [cx + d * 0.7, a.YB - 2, z0 + 4]], [d * 0.14, d * 0.14, d * 0.14], 8);
      a.rect(a.X0, a.YF, a.X1, a.YB); a.circ(cx, cy, r, 'EQUIP-DETAIL'); a.poly(ptsC(cx, cy, r * 1.35, 6), 'EQUIP-DETAIL');
      a.log('Added the bracket block, the threaded barrel, the two lock nuts, the LED cap and the cable (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic omnidirectional wheel',
    desc: (v) => `Omnidirectional wheel, ${v.D0} mm: a hub with a bore and set screw, two staggered rows of ${v.n} barrel rollers around the rim, and side plates holding the roller axles.`,
    vs: [[50, 10], [100, 12], [150, 14]].map(([D0, n]) => V(`${D0} mm, double row`, D0 * 0.42, D0, D0, { D0, n })),
    build: (a, v) => {
      const D = v.D0, n = v.n, cx = a.cx, cy = a.cy, zc = a.Z0 + D / 2, r = D / 2, w = a.W;
      for (const row of [0, 1]) { const xo = cx + (row ? 1 : -1) * w * 0.2; for (let i = 0; i < n; i++) { const t = (TAU * (i + row * 0.5)) / n, py = cy + r * 0.78 * m.cos(t), pz = zc + r * 0.78 * m.sin(t), tx = -m.sin(t), tz = m.cos(t), L = r * 0.2; a.tube([[xo, py - tx * L, pz - tz * L], [xo, py + tx * L, pz + tz * L]], [r * 0.11, r * 0.11], 8); } a.xcyl(xo - w * 0.16, xo + w * 0.16, cy, zc, r * 0.66, 24); }
      a.xcyl(cx - w * 0.5, cx + w * 0.5, cy, zc, r * 0.3, 18); a.xcyl(cx - w * 0.5 - 0.0, cx + w * 0.5, cy, zc, r * 0.12, 10); a.ycyl(cy, cy + r * 0.3, cx + w * 0.4, zc, r * 0.04, 6);
      a.rect(cx - w / 2, cy - r, cx + w / 2, cy + r); a.line(cx, cy - r, cx, cy + r, 'EQUIP-DETAIL');
      a.log('Added the hub, the two staggered rows of barrel rollers and the side plates (plan and 3D).');
    } }),
  fam({ cat: 'robotics/parts', title: 'Generic mecanum wheel',
    desc: (v) => `Mecanum wheel, ${v.D0} mm, ${v.hand} hand: a hub with a bore and set screw, two side plates and nine barrel rollers set at 45 degrees around the rim.`,
    vs: [[80, 'left'], [127, 'right'], [203, 'left']].map(([D0, hand]) => V(`${D0} mm, ${hand} hand`, D0 * 0.5, D0, D0, { D0, hand })),
    build: (a, v) => {
      const D = v.D0, cx = a.cx, cy = a.cy, zc = a.Z0 + D / 2, r = D / 2, w = a.W;
      mecanum(a, cx, cy, zc, r, w * 0.9, v.hand === 'left' ? 1 : -1); a.xcyl(cx - w * 0.5, cx + w * 0.5, cy, zc, r * 0.16, 12); a.ycyl(cy, cy + r * 0.22, cx + w * 0.3, zc, r * 0.035, 6);
      a.rect(cx - w / 2, cy - r, cx + w / 2, cy + r); a.line(cx, cy - r, cx, cy + r, 'EQUIP-DETAIL');
      a.log('Added the hub, the side plates and the nine angled rollers (plan and 3D).');
    } }),
];

// ============================================================================================= CELLS
const cells = [
  fam({ cat: 'robotics/cells', title: 'Generic rotary indexing table',
    desc: (v) => `Rotary indexing table, ${v.D0} mm top with ${v.n} stations: a drum base on a plinth plate, a round top with T-slot grooves and ${v.n} fixture posts with clamp blocks, a side gearbox with motor and a sensor flag.`,
    vs: [[400, 4], [800, 6], [1200, 8]].map(([D0, n]) => V(`${D0} mm top, ${n} stations`, D0 * 1.2, D0 * 1.2, D0 * 0.42, { D0, n })),
    build: (a, v) => {
      const D = v.D0, n = v.n, cx = a.cx, cy = a.cy - D * 0.02, z0 = a.Z0, r = D / 2;
      a.box(a.X0, a.YF, z0, a.X1, a.YB, z0 + D * 0.03); a.cyl(cx, cy, z0 + D * 0.03, z0 + D * 0.2, r * 0.7, 32); a.cyl(cx, cy, z0 + D * 0.2, z0 + D * 0.23, r * 0.9, 32); a.cyl(cx, cy, z0 + D * 0.23, z0 + D * 0.27, r, 40);
      for (let i = 0; i < n; i++) { const t = (TAU * i) / n; bar(a, 'z', [cx + r * 0.12 * m.cos(t), cy + r * 0.12 * m.sin(t)], [cx + r * 0.92 * m.cos(t), cy + r * 0.92 * m.sin(t)], D * 0.012, z0 + D * 0.27, z0 + D * 0.272, false);
        const px = cx + r * 0.68 * m.cos(t), py = cy + r * 0.68 * m.sin(t); a.box(px - D * 0.045, py - D * 0.045, z0 + D * 0.27, px + D * 0.045, py + D * 0.045, z0 + D * 0.27 + D * 0.1); a.box(px - D * 0.025, py - D * 0.025, z0 + D * 0.37, px + D * 0.025, py + D * 0.025, z0 + D * 0.4); a.circ(px, py, D * 0.045, 'EQUIP-DETAIL'); }
      a.cyl(cx, cy, z0 + D * 0.27, z0 + D * 0.3, r * 0.1, 14);
      a.box(cx - D * 0.14, cy + r * 0.72, z0 + D * 0.03, cx + D * 0.14, cy + r * 1.0, z0 + D * 0.2); a.xcyl(cx - D * 0.1, cx + D * 0.1, cy + r * 1.05, z0 + D * 0.12, D * 0.07, 18); a.box(cx - D * 0.05, cy + r * 0.98, z0 + D * 0.2, cx + D * 0.05, cy + r * 1.04, z0 + D * 0.27);
      a.circ(cx, cy, r); a.circ(cx, cy, r * 0.7, 'EQUIP-HIDDEN'); a.rect(cx - D * 0.14, cy + r * 0.72, cx + D * 0.14, cy + r * 1.0, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the plinth, the drum, the round top with grooves, the fixture posts and clamps and the gearbox with motor (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic welding positioner',
    desc: (v) => `Two-station headstock-and-tailstock welding positioner, ${v.cap} kg class: a base beam with feet, a headstock tower with a motorised faceplate and bolt slots, a tailstock tower with a live centre and a fixture beam clamped between the two.`,
    vs: [[500, 1400, 600, 760], [1000, 2200, 800, 940], [2000, 3400, 1000, 1180]].map(([cap, L, W, H]) => V(`${cap} kg, ${L} mm between ends`, L, W, H, { cap })),
    build: (a, v) => {
      const L = a.W, W = a.D, H = a.H, x0 = a.X0, x1 = a.X1, cy = a.cy, z0 = a.Z0, bh = H * 0.1, zc = z0 + H * 0.58;
      a.box(x0, cy - W * 0.4, z0 + 25, x1, cy + W * 0.4, z0 + 25 + bh); for (const x of [x0 + 40, x1 - 40]) for (const s of [-1, 1]) { a.cyl(x, cy + s * W * 0.34, z0, z0 + 25, 22, 10); }
      a.box(x0, cy - W * 0.36, z0 + 25 + bh, x0 + L * 0.16, cy + W * 0.36, zc + H * 0.2); a.box(x0 + L * 0.02, cy + W * 0.1, z0 + 25 + bh, x0 + L * 0.14, cy + W * 0.34, z0 + 25 + bh + H * 0.2);
      a.xcyl(x0 + L * 0.16, x0 + L * 0.2, cy, zc, W * 0.2, 28); for (let i = 0; i < 8; i++) { const t = (TAU * i) / 8; a.xcyl(x0 + L * 0.2, x0 + L * 0.205, cy + W * 0.15 * m.cos(t), zc + W * 0.15 * m.sin(t), W * 0.02, 8); }
      a.box(x1 - L * 0.12, cy - W * 0.3, z0 + 25 + bh, x1, cy + W * 0.3, zc + H * 0.16); a.xcyl(x1 - L * 0.16, x1 - L * 0.12, cy, zc, W * 0.08, 14); a.tube([[x1 - L * 0.21, cy, zc], [x1 - L * 0.16, cy, zc]], [1, W * 0.04], 14);
      a.box(x0 + L * 0.2, cy - W * 0.3, zc - W * 0.04, x1 - L * 0.21, cy + W * 0.3, zc + W * 0.04); for (const x of [0.4, 0.55, 0.7]) a.box(x0 + L * x - 15, cy - W * 0.3, zc + W * 0.04, x0 + L * x + 15, cy + W * 0.3, zc + W * 0.1);
      a.rect(x0, cy - W * 0.4, x1, cy + W * 0.4); a.rect(x0, cy - W * 0.36, x0 + L * 0.16, cy + W * 0.36, 'EQUIP-DETAIL'); a.rect(x1 - L * 0.12, cy - W * 0.3, x1, cy + W * 0.3, 'EQUIP-DETAIL'); a.rect(x0 + L * 0.2, cy - W * 0.3, x1 - L * 0.21, cy + W * 0.3, 'EQUIP-DETAIL');
      a.log('Added the base beam and feet, the headstock with faceplate, the tailstock with live centre and the fixture beam (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic robot pallet station',
    desc: (v) => `Robot pallet station for ${v.k} pallet${v.k > 1 ? 's' : ''}: a floor frame with corner guide angles and a rear stop bar, ${v.k > 1 ? v.k + ' ' : 'a '}wooden pallet${v.k > 1 ? 's' : ''} with deck boards, stringer blocks${v.stack ? ' and a stack of cartons in three layers' : ''}, and a floor-mounted presence sensor post.`,
    vs: [[1, false, 'one empty pallet'], [2, false, 'two empty pallets'], [1, true, 'one pallet with cartons']].map(([k, stack, l]) => V(l, k * 1200 + 240, 1100, stack ? 1450 : 380, { k, stack })),
    build: (a, v) => {
      const k = v.k, x0 = a.X0, y0 = a.YF, y1 = a.YB, z0 = a.Z0, cy = a.cy;
      a.box(x0, y0, z0, a.X1, y0 + 60, z0 + 40); a.box(x0, y1 - 60, z0, a.X1, y1, z0 + 40); for (let i = 0; i <= k; i++) a.box(x0 + 60 + i * 1200 - 30, y0 + 60, z0, x0 + 60 + i * 1200 + 30, y1 - 60, z0 + 30);
      for (let j = 0; j < k; j++) { const px = x0 + 120 + j * 1200 + 0, pw = 1200 - 120 + 0, pz = z0 + 40; const xa = px - 0, xb = px + pw - 0; a.box(xa, y0 + 100, pz, xb, y0 + 160, pz + 90); a.box(xa, cy - 30, pz, xb, cy + 30, pz + 90); a.box(xa, y1 - 160, pz, xb, y1 - 100, pz + 90);
        for (let b = 0; b < 3; b++) for (const yy of [y0 + 100, cy - 30, y1 - 160]) a.box(xa + b * (pw - 100) / 2, yy, pz, xa + b * (pw - 100) / 2 + 100, yy + 60, pz + 90);
        for (let i = 0; i < 7; i++) a.box(xa, y0 + 100 + i * ((y1 - y0 - 200 - 80) / 6), pz + 90, xb, y0 + 100 + i * ((y1 - y0 - 200 - 80) / 6) + 80, pz + 112); a.box(xa, y0 + 100, pz + 112, xb, y0 + 160, pz + 122);
        if (v.stack) for (let ly = 0; ly < 3; ly++) for (let cxn = 0; cxn < 3; cxn++) for (let cyn = 0; cyn < 2; cyn++) a.box(xa + 8 + cxn * ((pw - 16) / 3), y0 + 106 + cyn * ((y1 - y0 - 212) / 2), pz + 122 + ly * 300, xa + 8 + (cxn + 1) * ((pw - 16) / 3) - 6, y0 + 106 + (cyn + 1) * ((y1 - y0 - 212) / 2) - 6, pz + 122 + (ly + 1) * 300 - 6); a.rect(xa, y0 + 100, xb, y1 - 100, 'EQUIP-DETAIL'); }
      for (const [x, y, sx, sy] of [[x0 + 20, y0 + 70, 1, 1], [a.X1 - 20, y0 + 70, -1, 1], [x0 + 20, y1 - 70, 1, -1], [a.X1 - 20, y1 - 70, -1, -1]]) { a.box(x - 20, y - 10 * sy, z0 + 40, x + 20, y + 140 * sy * 0 + 10 * sy, z0 + 340); a.box(x - 20, y - 10 * sy, z0 + 40, x - 20 + sx * 140 * 0 + 20, y + 10 * sy, z0 + 340); }
      a.cyl(a.X1 - 20, cy, z0 + 40, z0 + 330, 14, 10); a.box(a.X1 - 40, cy - 30, z0 + 330, a.X1, cy + 30, z0 + 380); a.outline();
      a.log('Added the floor frame, the pallet' + (k > 1 ? 's' : '') + ' with boards and stringer blocks, the corner guides, the stop bar and the sensor post' + (v.stack ? ' and the carton layers' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic drawer parts presenter',
    desc: (v) => `Pull-out parts presenter, ${v.Wc} mm wide: a steel cabinet with a lockable front panel and status lamp, a telescopic tray drawer pulled out halfway on side rails, a tray with ${v.n} compartments holding small parts and a pull bar.`,
    vs: [[500, 450, 3], [700, 600, 6], [900, 750, 8]].map(([Wc, Dc, n]) => V(`${Wc} mm wide, ${n} compartments`, Wc, Dc * 1.55, 520, { Wc, Dc, n })),
    build: (a, v) => {
      const { Wc, Dc, n } = v, x0 = a.X0, x1 = a.X1, yb = a.YB, z0 = a.Z0, H = a.H, yc = yb - Dc;
      a.box(x0, yc, z0 + 40, x1, yb, a.Z1); a.box(x0 + 10, yc - 4, z0 + 40 + 20, x1 - 10, yc, z0 + 40 + 90); a.cyl(x1 - 40, yc - 4, a.Z1 - 80, a.Z1 - 78, 0.01, 3); a.ycyl(yc - 10, yc, x1 - 40, a.Z1 - 60, 12, 12);
      for (const x of [x0 + 20, x1 - 20]) a.box(x - 15, yc + 10, z0, x + 15, yb - 10, z0 + 40);
      const tz = z0 + H * 0.42, ty0 = a.YF + 20, ty1 = yc - 4; for (const s of [-1, 1]) a.box(s < 0 ? x0 + 14 : x1 - 28, ty0 + 40, tz - 20, s < 0 ? x0 + 28 : x1 - 14, yc + Dc * 0.3, tz + 10);
      a.box(x0 + 28, ty0, tz, x1 - 28, ty1, tz + 20); const cw = (x1 - x0 - 100) / 3, rows = n > 3 ? 2 : 1, cols = m.ceil(n / rows);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const xa = x0 + 40 + c * ((x1 - x0 - 80) / cols), xb = xa + (x1 - x0 - 80) / cols - 6, ya = ty0 + 30 + r * ((ty1 - ty0 - 80) / rows), yb2 = ya + (ty1 - ty0 - 80) / rows - 6; a.box(xa, ya, tz + 20, xa + 4, yb2, tz + 70); a.box(xa, yb2 - 4, tz + 20, xb, yb2, tz + 70); for (let p = 0; p < 3; p++) a.cyl((xa + xb) / 2 + (p - 1) * 14, (ya + yb2) / 2, tz + 20, tz + 40, 6, 8); }
      a.box(x0 + 34, ty0, tz + 20, x1 - 34, ty0 + 12, tz + 70); a.box(x0 + 60, ty0 - 30, tz + 30, x1 - 60, ty0 - 18, tz + 44); a.box(x0 + 60, ty0 - 30, tz + 30, x0 + 74, ty0, tz + 44); a.box(x1 - 74, ty0 - 30, tz + 30, x1 - 60, ty0, tz + 44);
      a.rect(x0, yc, x1, yb); a.rect(x0 + 28, ty0, x1 - 28, ty1, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the cabinet with front panel and lamp, the side rails, the tray with compartments and parts and the pull bar (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic flexible parts feeder',
    desc: (v) => `Flexible vibration parts feeder, ${v.Wc} mm platform: a cabinet on four feet with leaf-spring vibration drive, a flat platform with side walls and a backlight panel, a sloped hopper at the back and a loose scatter of small parts on the platform.`,
    vs: [[300, 400, 300], [500, 700, 400], [800, 1000, 520]].map(([Wc, Lc, Hc]) => V(`${Wc} x ${Lc} mm platform`, Wc + 80, Lc + 120, Hc, { Wc, Lc })),
    build: (a, v) => {
      const { Wc, Lc } = v, x0 = a.X0, x1 = a.X1, y0 = a.YF, y1 = a.YB, z0 = a.Z0, cx = a.cx, zb = z0 + a.H * 0.3, hz = a.H * 0.44;
      for (const [x, y] of [[x0 + 30, y0 + 30], [x1 - 30, y0 + 30], [x0 + 30, y1 - 30], [x1 - 30, y1 - 30]]) a.cyl(x, y, z0, z0 + 30, 22, 10);
      a.box(x0 + 10, y0 + 10, z0 + 30, x1 - 10, y1 - 10, zb); a.box(x0 + 10, y0 + 6, zb - 40, x1 - 10, y0 + 12, zb - 10);
      for (const x of [-0.3, 0, 0.3]) a.box(cx + x * Wc - 25, y0 + 80, zb, cx + x * Wc + 25, y0 + 80 + 0.5 * Lc * 0.2, zb + 30);
      const py0 = y0 + 40, py1 = y1 - 40 - Lc * 0.2; a.box(cx - Wc / 2, py0, zb + 30, cx + Wc / 2, py1, zb + 45); for (const s of [-1, 1]) a.box(cx + s * Wc / 2 - (s > 0 ? 8 : 0), py0, zb + 45, cx + s * Wc / 2 + (s < 0 ? 8 : 0), py1, zb + 80);
      a.box(cx - Wc / 2, py0, zb + 45, cx + Wc / 2, py0 + 8, zb + 70); a.box(cx - Wc * 0.45, py0 + 20, zb + 45, cx + Wc * 0.45, py1 - 20, zb + 47);
      prismX(a, [[py1, zb + 30], [y1 - 10, zb + 30], [y1 - 10, a.Z1], [py1 + 30, hz + zb * 0.6]], cx - Wc * 0.4, cx + Wc * 0.4); a.box(cx - Wc * 0.4, py1 - 4, zb + 30, cx + Wc * 0.4, py1, zb + 95);
      for (let i = 0; i < 24; i++) { const u = ((i * 7919) % 97) / 97, w = ((i * 104729) % 89) / 89; a.cyl(cx - Wc * 0.4 + u * Wc * 0.8, py0 + 30 + w * (py1 - py0 - 60), zb + 47, zb + 47 + 6 + (i % 3) * 3, 4 + (i % 2) * 2, 8); }
      a.rect(x0 + 10, y0 + 10, x1 - 10, y1 - 10); a.rect(cx - Wc / 2, py0, cx + Wc / 2, py1, 'EQUIP-DETAIL'); a.rect(cx - Wc * 0.4, py1, cx + Wc * 0.4, y1 - 10, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the cabinet on feet, the leaf-spring drive, the platform with side walls and backlight, the hopper and the scattered parts (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic safety laser scanner stand',
    desc: (v) => `Safety laser scanner on a stand, ${v.Hs} mm high: a base plate with four bolt holes, ${v.post ? 'a round post with a diagonal brace, ' : 'a short mounting block, '}an adjustable bracket and a scanner head with a front window slot, a status LED, a top lid and a cable.`,
    vs: [['foot-mounted, 150 mm', 150, false], ['post-mounted, 500 mm', 500, true], ['post-mounted, 1000 mm', 1000, true]].map(([l, Hs, post]) => V(l, 220, 240, Hs + 120, { Hs, post })),
    build: (a, v) => {
      const Hs = v.Hs, cx = a.cx, cy = a.cy, z0 = a.Z0, post = v.post;
      plateHoles(a, a.X0, a.YF, a.X1, a.YB, z0, z0 + 10, [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => ({ x: cx + sx * 85, y: cy + sy * 95, rx: 8, ry: 8 })), 3);
      if (post) { a.cyl(cx, cy + 50, z0 + 10, z0 + Hs, 20, 16); a.tube([[cx, cy + 100, z0 + 10], [cx, cy + 52, z0 + Hs * 0.55]], [8, 8], 8); a.cyl(cx, cy + 50, z0 + Hs, z0 + Hs + 8, 28, 16); } else a.box(cx - 40, cy + 20, z0 + 10, cx + 40, cy + 80, z0 + Hs);
      a.box(cx - 36, cy - 10, z0 + Hs, cx + 36, cy + 80, z0 + Hs + 14); const zs = z0 + Hs + 14;
      a.box(cx - 55, cy - 90, zs, cx + 55, cy + 50, zs + 62); a.box(cx - 50, cy - 90 - 2, zs + 14, cx + 50, cy - 90, zs + 34); a.cyl(cx, cy - 20, zs + 62, zs + 80, 40, 22); a.cyl(cx, cy - 20, zs + 80, zs + 86, 44, 22); a.box(cx + 30, cy - 90 - 2, zs + 42, cx + 40, cy - 90, zs + 50);
      a.tube([[cx + 40, cy + 50, zs + 20], [cx + 70, cy + 80, zs + 10], [cx + 70, cy + 100, z0 + 30]], [4, 4, 4], 6);
      a.rect(a.X0, a.YF, a.X1, a.YB); a.rect(cx - 55, cy - 90, cx + 55, cy + 50, 'EQUIP-DETAIL'); a.circ(cx, cy - 20, 40, 'EQUIP-DETAIL');
      a.log('Added the base plate, the post' + (post ? ' with brace' : ' block') + ', the bracket and the scanner head with window, lid and cable (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic cell roller conveyor',
    desc: (v) => `Gravity-style roller conveyor, ${v.L} mm long, 500 mm wide: two C-channel side frames, ${v.n} steel rollers, four or more legs with cross braces and adjustable feet, and guide rails and end stops on the outside.`,
    vs: [1000, 2000, 3000].map((L) => V(`${L / 1000} m, 500 mm wide`, L, 600, 760, { L, n: m.round(L / 80) })),
    build: (a, v) => {
      const { L, n } = v, x0 = a.X0, x1 = a.X1, cy = a.cy, z0 = a.Z0, zt = z0 + 600, ch = 90, rw = 250;
      for (const s of [-1, 1]) { a.box(x0, cy + s * rw - 4, zt - ch, x1, cy + s * rw + 4, zt); a.box(x0, cy + s * rw + (s > 0 ? 4 : -34) , zt - ch, x1, cy + s * rw + (s > 0 ? 34 : -4), zt - ch + 6); a.box(x0, cy + s * (rw + 40), zt, x1, cy + s * (rw + 40) + 6, zt + 60); }
      for (let i = 0; i < n; i++) a.ycyl(cy - rw + 4, cy + rw - 4, x0 + 40 + ((L - 80) * i) / (n - 1), zt - 30, 25, 12);
      const legs = m.max(2, m.round(L / 1000) + 1);
      for (let i = 0; i < legs; i++) { const x = x0 + 60 + ((L - 120) * i) / (legs - 1); for (const s of [-1, 1]) { a.box(x - 20, cy + s * (rw - 20) - 20, z0 + 40, x + 20, cy + s * (rw - 20) + 20, zt - ch); a.cyl(x, cy + s * (rw - 20), z0, z0 + 40, 25, 8); } a.box(x - 12, cy - rw + 20, z0 + 250, x + 12, cy + rw - 20, z0 + 280); }
      for (const x of [x0 + 20, x1 - 20]) a.box(x - 12, cy - rw, zt - 60, x + 12, cy + rw, zt + 20);
      a.rect(x0, cy - rw - 34, x1, cy + rw + 34); for (let i = 0; i <= 8; i++) { const x = x0 + (L * i) / 8; a.line(x, cy - rw, x, cy + rw, 'EQUIP-DETAIL'); } a.outline('EQUIP-HIDDEN');
      a.log('Added the side frames, the rollers, the legs with braces and feet, the guide rails and the end stops (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic cell pallet chain conveyor',
    desc: (v) => `Chain conveyor for pallets, ${v.L} mm long: two chain tracks in guide channels with a link pattern, a side frame on legs with feet, a gear motor and drive shaft at one end and a hard stop with a sensor at the other.`,
    vs: [1400, 2000, 2800].map((L) => V(`${L} mm, twin chain`, L, 800, 700, { L })),
    build: (a, v) => {
      const L = v.L, x0 = a.X0, x1 = a.X1, cy = a.cy, z0 = a.Z0, zt = z0 + 520, ty = 250;
      for (const s of [-1, 1]) { a.box(x0 + 80, cy + s * ty - 45, zt - 90, x1 - 80, cy + s * ty + 45, zt - 20); a.box(x0 + 80, cy + s * ty - 45, zt - 20, x1 - 80, cy + s * ty - 35, zt + 25); a.box(x0 + 80, cy + s * ty + 35, zt - 20, x1 - 80, cy + s * ty + 45, zt + 25); for (let i = 0; i < m.floor((L - 160) / 70); i++) a.box(x0 + 85 + i * 70, cy + s * ty - 24, zt - 20, x0 + 85 + i * 70 + 50, cy + s * ty + 24, zt + 8); }
      const legs = m.round(L / 900) + 1; for (let i = 0; i < legs; i++) { const x = x0 + 110 + ((L - 220) * i) / (legs - 1); for (const s of [-1, 1]) { a.box(x - 25, cy + s * ty - 25, z0 + 40, x + 25, cy + s * ty + 25, zt - 90); a.cyl(x, cy + s * ty, z0, z0 + 40, 30, 8); } a.box(x - 15, cy - ty, z0 + 220, x + 15, cy + ty, z0 + 250); a.box(x - 20, cy - ty, zt - 120, x + 20, cy + ty, zt - 90); }
      a.xcyl(x0 + 20, x0 + 100, cy, zt - 50, 20, 14); a.box(x0 + 40, cy + ty + 45, zt - 160, x0 + 220, cy + ty + 200, zt - 20); a.xcyl(x0 + 220, x0 + 330, cy + ty + 120, zt - 90, 55, 18); a.box(x0 + 80, cy - 8, zt - 95, x0 + 100, cy + 8, zt - 50);
      a.box(x1 - 70, cy - ty - 45, zt - 90, x1, cy + ty + 45, zt + 50); a.cyl(x1 - 40, cy, zt - 90, zt + 20, 12, 8); a.box(x1 - 110, cy + ty + 50, zt - 50, x1 - 70, cy + ty + 80, zt + 20);
      a.rect(x0 + 80, cy - ty - 45, x1 - 80, cy + ty + 45); for (const s of [-1, 1]) a.rect(x0 + 80, cy + s * ty - 24, x1 - 80, cy + s * ty + 24, 'EQUIP-DETAIL'); a.rect(x0 + 40, cy + ty + 45, x0 + 220, cy + ty + 200, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the two chain tracks with links, the legs with feet, the gear motor and shaft, the hard stop and the sensor (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic vision inspection station',
    desc: (v) => `Vision inspection station over a belt, ${v.Wb} mm field: four posts with a top beam, a camera on a slide bracket with a lens, a ring light under it, a backlight panel below the belt strip and a side controller box.`,
    vs: [[300, 'compact'], [500, 'standard'], [800, 'wide']].map(([Wb, l]) => V(`${l}, ${Wb} mm field`, Wb + 340, Wb + 340, Wb * 1.5 + 400, { Wb })),
    build: (a, v) => {
      const Wb = v.Wb, x0 = a.X0, x1 = a.X1, y0 = a.YF, y1 = a.YB, cx = a.cx, cy = a.cy, z0 = a.Z0, H = a.H, zb = z0 + 120;
      for (const [x, y] of [[x0 + 25, y0 + 25], [x1 - 25, y0 + 25], [x0 + 25, y1 - 25], [x1 - 25, y1 - 25]]) { a.box(x - 25, y - 25, z0, x + 25, y + 25, a.Z1 - 20); a.box(x - 45, y - 45, z0, x + 45, y + 45, z0 + 10); }
      a.box(x0 + 50, y0, zb, x1 - 50, y1, zb + 30); for (let i = 0; i < 6; i++) a.ycyl(y0 + 40, y1 - 40, x0 + 80 + i * ((x1 - x0 - 160) / 5), zb + 38, 10, 8); a.box(cx - Wb * 0.45, cy - Wb * 0.45, zb + 30, cx + Wb * 0.45, cy + Wb * 0.45, zb + 34);
      for (const s of [-1, 1]) { a.box(x0 + 25, y0 + 25 + (s > 0 ? y1 - y0 - 50 : 0) - 15, a.Z1 - 70, x1 - 25, y0 + 25 + (s > 0 ? y1 - y0 - 50 : 0) + 15, a.Z1 - 20); }
      a.box(x0 + 25, cy - 25, a.Z1 - 70, x1 - 25, cy + 25, a.Z1 - 20); const zc = a.Z1 - 70; a.box(cx - 40, cy - 45, zc - 120, cx + 40, cy + 45, zc); a.box(cx - 32, cy - 30, zc - 190, cx + 32, cy + 30, zc - 120); a.cyl(cx, cy, zc - 260, zc - 190, 28, 18); ring(a, 'z', cx, cy, zc - 300, zc - 260, 40, Wb * 0.18, 24);
      a.box(x1 - 25, y0 + 60, z0 + 300, x1 + 0, y0 + 60 + 200, z0 + 300 + 260 * 0 + 300);
      a.rect(x0, y0, x1, y1); a.rect(x0 + 50, y0, x1 - 50, y1, 'EQUIP-DETAIL'); a.circ(cx, cy, Wb * 0.18, 'EQUIP-DETAIL');
      a.log('Added the four posts, the top beam, the camera on its bracket with lens, the ring light, the backlight panel under the belt and the controller box (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic signal tower light',
    desc: (v) => `Stack signal tower with ${v.n} light segment${v.n > 1 ? 's' : ''}: a round base plate with a bolt hole ring, a tube post, ${v.n} lens segments with rings between them (red, amber, green, blue order) and a ${v.n > 2 ? 'buzzer cap' : 'domed cap'}.`,
    vs: [1, 2, 3, 4].map((n) => V(`${n} segment${n > 1 ? 's' : ''}`, 100, 100, 180 + n * 65, { n })),
    build: (a, v) => {
      const n = v.n, cx = a.cx, cy = a.cy, z0 = a.Z0; a.cyl(cx, cy, z0, z0 + 10, 48, 24); boltHoles(a, cx, cy, z0, z0 + 10, 36, 4, 5); a.cyl(cx, cy, z0 + 10, z0 + 20, 25, 16); a.cyl(cx, cy, z0 + 20, z0 + 140, 12, 12);
      let z = z0 + 140; for (let i = 0; i < n; i++) { a.cyl(cx, cy, z, z + 6, 30, 20); a.cyl(cx, cy, z + 6, z + 59, 26 + (i % 2) * 0, 22); for (let k = 0; k < 8; k++) { const t = (TAU * k) / 8; a.cyl(cx + 26 * m.cos(t), cy + 26 * m.sin(t), z + 14, z + 52, 3, 6); } z += 59; a.cyl(cx, cy, z, z + 6, 30, 20); z += 6; }
      if (n > 2) { a.cyl(cx, cy, z, z + 24, 24, 20); a.ycyl(cy - 24, cy - 20, cx, z + 12, 8, 8); z += 24; } else a.ell(cx, cy, z, 28, 28, 22, 16, 8);
      a.circ(cx, cy, 48); a.circ(cx, cy, 30, 'EQUIP-DETAIL'); for (let k = 0; k < 4; k++) a.circ(cx + 36 * m.cos(0.78 + (TAU * k) / 4), cy + 36 * m.sin(0.78 + (TAU * k) / 4), 5, 'EQUIP-DETAIL');
      a.log('Added the base plate, the tube post, the ' + n + ' lens segment' + (n > 1 ? 's' : '') + ' with rings and the cap (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic collaborative robot cart',
    desc: (v) => `Mobile base cart for a collaborative robot, ${v.Wc} x ${v.Dc} mm: a welded frame, a top plate with an arm bolt pattern, a controller bay door, four casters, two push handles${v.drw ? ', a tool drawer' : ''}${v.fx ? ' and a side fixture plate with T-slots' : ''}.`,
    vs: [[600, 600, 'bare cart', false, false], [800, 600, 'with tool drawer', true, false], [1000, 700, 'with fixture plate', true, true]].map(([Wc, Dc, l, drw, fx]) => V(`${Wc} x ${Dc} mm, ${l}`, Wc + (fx ? 260 : 0), Dc + 80, 760, { Wc, Dc, drw, fx })),
    build: (a, v) => {
      const { Wc, Dc, drw, fx } = v, x0 = a.X0, y0 = a.YF + 40, y1 = a.YB - 40, z0 = a.Z0, xe = x0 + Wc, cy = (y0 + y1) / 2, zt = z0 + 700;
      for (const [x, y] of [[x0 + 50, y0 + 50], [xe - 50, y0 + 50], [x0 + 50, y1 - 50], [xe - 50, y1 - 50]]) { a.caster(x, y, 120); a.cyl(x, y, z0 + 90, z0 + 130, 9, 8); a.box(x - 25, y - 25, z0 + 128, x + 25, y + 25, z0 + 150); }
      a.box(x0, y0, z0 + 150, xe, y1, z0 + 190); a.box(x0, y0, z0 + 190, xe, y1, zt - 40); a.box(x0 - 4, y0 - 4, zt - 40, xe + 4, y1 + 4, zt); const cxx = x0 + Wc / 2;
      a.box(x0 + 40, y0 - 6, z0 + 230, x0 + Wc * (drw ? 0.55 : 0.9), y0, zt - 120); a.box(x0 + Wc * 0.4, y0 - 24, z0 + 400, x0 + Wc * 0.4 + 14, y0 - 6, z0 + 520); a.cyl(x0 + 40, y0 - 6, z0 + 500, z0 + 502, 0.01, 3);
      if (drw) { a.box(x0 + Wc * 0.58, y0 - 6, z0 + 230, xe - 40, y0, z0 + 400); a.box(x0 + Wc * 0.62, y0 - 22, z0 + 330, xe - 80, y0 - 10, z0 + 344); }
      const hy = y1 + 0; for (const x of [x0 + 120, xe - 120]) { a.tube([[x, y1 - 10, zt - 20], [x, y1 + 70, zt - 20], [x, y1 + 70, zt + 120]], [14, 14, 14], 8); }
      a.cyl(cxx - Wc * 0.1, cy, zt, zt + 8, 130, 28); boltHoles(a, cxx - Wc * 0.1, cy, zt, zt + 8, 90, 8, 6, 0); a.cyl(cxx - Wc * 0.1, cy, zt, zt + 8, 20, 12);
      if (fx) { a.box(xe, y0 + 30, zt - 160, xe + 260, y1 - 30, zt - 150); a.box(xe, y0 + 30, zt - 150, xe + 12, y1 - 30, zt); for (let i = 0; i < 6; i++) a.box(xe + 12, y0 + 40 + i * ((y1 - y0 - 100) / 5), zt - 150, xe + 250, y0 + 48 + i * ((y1 - y0 - 100) / 5) + 6, zt - 146); }
      a.rect(x0, y0, xe, y1); a.circ(cxx - Wc * 0.1, cy, 130, 'EQUIP-DETAIL'); if (fx) a.rect(xe, y0 + 30, xe + 260, y1 - 30, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the frame, the top plate with bolt pattern, the controller bay door, the casters and levelling feet, the handles' + (drw ? ', the tool drawer' : '') + (fx ? ' and the side fixture plate' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'robotics/cells', title: 'Generic machine-tending docking cart',
    desc: (v) => `Docking cart for loading a machine, ${v.Wc} x ${v.Dc} mm: a tube frame on four casters with two docking cones on the front rail, a top plate with part trays and locating pins, a bottom shelf, a latch bracket at the front and two push handles.`,
    vs: [[600, 800, 2], [800, 1000, 3], [1000, 1200, 4]].map(([Wc, Dc, t]) => V(`${Wc} x ${Dc} mm, ${t} trays`, Wc, Dc, 1000, { Wc, Dc, t })),
    build: (a, v) => {
      const { Wc, Dc, t } = v, x0 = a.X0, x1 = a.X1, y0 = a.YF, y1 = a.YB, z0 = a.Z0, cx = a.cx, zt = z0 + 800, zb = z0 + 260;
      for (const [x, y] of [[x0 + 40, y0 + 40], [x1 - 40, y0 + 40], [x0 + 40, y1 - 40], [x1 - 40, y1 - 40]]) { a.caster(x, y, 140); a.cyl(x, y, z0 + 100, z0 + 145, 9, 8); a.box(x - 20, y - 20, z0 + 140, x + 20, y + 20, zt - 40); a.box(x - 22, y - 22, z0 + 140, x + 22, y + 22, z0 + 160); }
      a.box(x0 + 40, y0 + 40, zt - 40, x1 - 40, y1 - 40, zt); for (const z of [zt - 40, zb]) { a.box(x0 + 20, y0 + 20, z, x1 - 20, y0 + 60, z + 40); a.box(x0 + 20, y1 - 60, z, x1 - 20, y1 - 20, z + 40); a.box(x0 + 20, y0 + 20, z, x0 + 60, y1 - 20, z + 40); a.box(x1 - 60, y0 + 20, z, x1 - 20, y1 - 20, z + 40); }
      a.box(x0 + 40, y0 + 40, zb + 40, x1 - 40, y1 - 40, zb + 50);
      const tw = (x1 - x0 - 120) / (t > 2 ? 2 : 1), th = (y1 - y0 - 120) / (t > 2 ? 2 : 1); for (let i = 0; i < t; i++) { const c = i % 2, r = m.floor(i / 2), xa = x0 + 60 + (t > 2 ? c * (tw + 0) : 0), ya = y0 + 60 + (t > 2 ? r * th : 0); const tx1 = xa + (t > 2 ? tw - 10 : tw), ty1 = ya + (t > 2 ? th - 10 : th / t * 0 + (y1 - y0 - 120) / t - 10); const yb2 = t > 2 ? ty1 : ya + (y1 - y0 - 120) / t - 10; a.box(xa, ya, zt, tx1, yb2, zt + 14); a.box(xa, ya, zt + 14, tx1, ya + 6, zt + 60); a.box(xa, yb2 - 6, zt + 14, tx1, yb2, zt + 60); a.box(xa, ya, zt + 14, xa + 6, yb2, zt + 60); a.box(tx1 - 6, ya, zt + 14, tx1, yb2, zt + 60); a.cyl(xa + 30, ya + 30, zt + 14, zt + 60, 5, 6); a.cyl(tx1 - 30, yb2 - 30, zt + 14, zt + 60, 5, 6); }
      for (const s of [-1, 1]) { a.box(cx + s * Wc * 0.3 - 30, y0 + 40, zb - 20, cx + s * Wc * 0.3 + 30, y0 + 60, zb + 60); a.tube([[cx + s * Wc * 0.3, y0 + 40, zb + 20], [cx + s * Wc * 0.3, y0 + 2, zb + 20]], [28, 8], 12); }
      a.box(cx - 70, y0 + 5, zb + 100, cx + 70, y0 + 40, zb + 150); a.cyl(cx, y0 + 5, zb + 150, zb + 190, 14, 8);
      for (const x of [x0 + 100, x1 - 100]) a.tube([[x, y1 - 30, zt - 20], [x, y1 + 0, zt - 20]], [14, 14], 8);
      a.rect(x0 + 20, y0 + 20, x1 - 20, y1 - 20); for (let i = 0; i < t; i++) a.rect(x0 + 60, y0 + 60, x1 - 60, y1 - 60, 'EQUIP-HIDDEN'); a.outline('EQUIP-HIDDEN');
      a.log('Added the tube frame, the casters, the locating cones, the top plate with trays and pins, the bottom shelf, the latch bracket and the handles (plan and 3D).');
    } }),
];
export default [...arms, ...mobile, ...parts, ...cells];

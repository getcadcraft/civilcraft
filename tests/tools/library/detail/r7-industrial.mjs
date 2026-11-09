/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, industrial design: 150 more consumer products, handheld devices, packaging and enclosures. Original geometry; generic designed forms by type and size.
 *  Units inside build(): millimetres, z up, plan front at -Y, back at y = 0. Variant sizes are written in inches. */
import { fam } from './r4-kit.mjs';
import { tube as TUBE, ellipsoid as ELL } from './com-core.mjs';

const m = Math, TAU = m.PI * 2, IN = 25.4;
const R1 = (n) => m.round(n * 10) / 10;
/** variant row, sizes in inches (w, d, h) */
const VI = (label, w, d, h, p = {}) => [label, w, d, h, 0, p];

// ------------------------------------------------------------------------------------------ mesh helpers
const rotX = (t, g) => { const c = m.cos(g), s = m.sin(g); return t.map((q) => q.map(([x, y, z]) => [x, y * c - z * s, y * s + z * c])); };
const rotY = (t, g) => { const c = m.cos(g), s = m.sin(g); return t.map((q) => q.map(([x, y, z]) => [x * c + z * s, y, -x * s + z * c])); };
const mv = (t, dx, dy, dz) => t.map((q) => q.map(([x, y, z]) => [x + dx, y + dy, z + dz]));
function frustum(pa, za, pb, zb) {
  const t = [], n = pa.length;
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; t.push([[...pa[i], za], [...pa[j], za], [...pb[j], zb]], [[...pa[i], za], [...pb[j], zb], [...pb[i], zb]]); }
  for (const [p, z] of [[pa, za], [pb, zb]]) { const c = [p.reduce((s, q) => s + q[0], 0) / n, p.reduce((s, q) => s + q[1], 0) / n, z]; for (let i = 0; i < n; i++) t.push([c, [...p[i], z], [...p[(i + 1) % n], z]]); }
  return t;
}
/** rounded-rectangle outline centred on (cx, cy) */
function rrPoly(cx, cy, w, d, r, n = 3) {
  r = m.min(r, w / 2 - 0.01, d / 2 - 0.01); const pts = [];
  for (const [sx, sy, a0] of [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]]) for (let i = 0; i <= n; i++) { const g = ((a0 + (90 * i) / n) * m.PI) / 180; pts.push([cx + sx * (w / 2 - r) + (r * m.cos(g)) * 1 * (sx < 0 ? 1 : 1) * 0 + r * m.cos(g) * 0 + (sx > 0 ? r * m.cos(g) - 0 : r * m.cos(g)) * 0, 0]); pts.pop(); pts.push([cx + (sx * (w / 2 - r)) + r * m.cos(g) * 1, cy + sy * (d / 2 - r) + r * m.sin(g)]); }
  return pts;
}
/** a rounded body with a softened top edge: full size to z1-f, then a bevel in to a smaller outline */
function soft(a, cx, cy, w, d, r, z0, z1, f = 3, fb = 0) {
  const full = rrPoly(cx, cy, w, d, r), top = rrPoly(cx, cy, w - 2 * f, d - 2 * f, m.max(0.5, r - f * 0.5)), bot = rrPoly(cx, cy, w - 2 * fb, d - 2 * fb, m.max(0.5, r - fb * 0.5));
  if (fb) a.add(frustum(bot, z0, full, z0 + fb)); a.add(frustum(full, z0 + fb, full, z1 - f)); a.add(frustum(full, z1 - f, top, z1));
  return a;
}
const planRR = (a, cx, cy, w, d, r, layer = 'EQUIP') => a.poly(rrPoly(cx, cy, w, d, r), layer);
/** lathe about a vertical axis: pts [[z, r], …] */
const lathe = (a, cx, cy, pts, seg = 20) => a.add(TUBE(pts.map(([z]) => [cx, cy, z]), pts.map(([, r]) => r), seg));
function torus(R, r, n = 20, seg = 6) { const pts = [], rads = []; for (let i = 0; i <= n; i++) { const g = (i / n) * TAU; pts.push([R * m.cos(g), R * m.sin(g), 0]); rads.push(r); } return TUBE(pts, rads, seg); }
/** extrude a convex [x, z] polygon along Y between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]);
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** a screw head seen from the front (cylinder with a slot) at (x, z) on the plane y */
function screwY(a, x, z, y, r = 3, h = 1.6, dir = -1) { a.ycyl(dir < 0 ? y - h : y, dir < 0 ? y : y + h, x, z, r, 10); a.box(x - r * 0.8, dir < 0 ? y - h - 0.3 : y + h, z - 0.4, x + r * 0.8, dir < 0 ? y - h : y + h + 0.3, z + 0.4); }
/** a slot-grille on the front plane: n slots */
/** how far a face detail should stand proud so it reads in an elevation: scales with the object */
const pd = (a) => m.max(2.6, 0.0035 * m.max(a.W, a.D, a.H));
const slotsY = (a, x0, x1, z0, z1, y, n, w = 1.4) => { for (let i = 0; i < n; i++) { const x = x0 + ((x1 - x0) * (i + 0.5)) / n; a.box(x - w / 2, y - pd(a), z0, x + w / 2, y, z1); } };
/** rows and columns of small round buttons on the front plane */
function buttonsY(a, x0, x1, z0, z1, y, cols, rows, r = 3, h = 1.6, sq = false) {
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const x = x0 + ((x1 - x0) * (i + 0.5)) / cols, z = z0 + ((z1 - z0) * (j + 0.5)) / rows; if (sq) a.box(x - r, y - m.max(h, pd(a)), z - r * 0.8, x + r, y, z + r * 0.8); else a.ycyl(y - m.max(h, pd(a)), y, x, z, r, 10); }
}
const mm = (inch) => inch * IN;
/** a ring in the XZ plane (facing Y) */
const ringXZ = (a, cx, y, z, r, tr = 0.6, n = 28) => a.add(mv(rotX(torus(r, tr, n, 4), m.PI / 2), cx, y, z));
/** a flat polygon [x, z] rotated about (cx, cz) and extruded along Y */
const bladeY = (a, cx, cz, ang, r0, r1, w0, w1, y0, y1) => {
  const c = m.cos(ang), s = m.sin(ang), P = (r, t) => [cx + c * r - s * t, cz + s * r + c * t];
  return prismY(a, [P(r0, -w0), P(r1, -w1), P(r1, w1), P(r0, w0)], y0, y1);
};
const circY = (a, cx, y0, y1, z, r, seg = 20) => a.ycyl(y0, y1, cx, z, r, seg);
const VZ = (label, w, d, h, z, p = {}) => [label, w, d, h, z, p];

// ================================================================================================ PRODUCTS
/** desk fan: round base, stem, motor, blades, wire guard; v.dia in inches, v.blades */
function deskFan(a, v) {
  const cx = a.cx, yc = a.cy, z0 = a.Z0, W = a.W, H = a.H, R = W / 2 - 1.2, zc = z0 + H - R - 1.2, br = m.min(a.D * 0.46, W * 0.36), gd = R * 0.36;
  a.cyl(cx, yc, z0, z0 + 5, br, 28); lathe(a, cx, yc, [[z0 + 5, br * 0.92], [z0 + 9, br * 0.45]], 20);
  a.cyl(cx, yc, z0 + 9, zc - R * 0.1, R * 0.07, 10);
  a.ycyl(yc - gd * 0.2, yc + gd * 0.55, cx, zc, R * 0.17, 20); a.ycyl(yc - gd * 0.5, yc - gd * 0.2, cx, zc, R * 0.12, 20);
  for (let k = 0; k < v.blades; k++) bladeY(a, cx, zc, (k / v.blades) * TAU + 0.3, R * 0.12, R * 0.9, R * 0.06, R * 0.17, yc - gd * 0.12, yc - gd * 0.12 + 1.2);
  for (const y of [yc - gd / 2, yc + gd / 2]) { ringXZ(a, cx, y, zc, R * 0.98, 0.7); ringXZ(a, cx, y, zc, R * 0.62, 0.5); ringXZ(a, cx, y, zc, R * 0.3, 0.5); }
  for (let k = 0; k < 8; k++) { const g = (k / 8) * TAU; a.tube([[cx, yc - gd / 2, zc], [cx + R * 0.98 * m.cos(g), yc - gd / 2, zc + R * 0.98 * m.sin(g)]], [0.6, 0.6], 4); a.ycyl(yc - gd / 2, yc + gd / 2, cx + R * 0.98 * m.cos(g), zc + R * 0.98 * m.sin(g), 0.6, 4); }
  a.box(cx + br * 0.2, yc - br * 0.9, z0 + 5, cx + br * 0.6, yc - br * 0.7, z0 + 7);   // speed switch
  a.circ(cx, yc, br); a.rect(cx - R, yc - gd / 2, cx + R, yc + gd / 2, 'EQUIP-DETAIL'); a.circ(cx, yc, R * 0.17, 'EQUIP-DETAIL');
  a.log(`Added the round base and stem, a motor housing with a hub, ${v.blades} blades and a wire guard front and back with rings, spokes and rods (plan and 3D).`);
}
/** tilt-head stand mixer */
function standMixer(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, yB = a.YB, bz = z0 + H * 0.07, rB = m.min(W * 0.34, D * 0.24), by = yF + rB + D * 0.12, hz = z0 + H * 0.86;
  soft(a, cx, a.cy, W, D, D * 0.2, z0, bz, 4);
  soft(a, cx, yB - D * 0.22, W * 0.46, D * 0.3, D * 0.1, bz, hz, 4);
  soft(a, cx, a.cy, W * 0.74, D * 0.94, W * 0.3, hz - H * 0.1, hz + H * 0.09, 9);                      // head
  a.ell(cx, yF + D * 0.06, hz - H * 0.01, W * 0.2, D * 0.07, H * 0.07, 14, 8);
  circY(a, cx, yF, yF + 3, hz + H * 0.02, W * 0.09, 18);                                         // attachment hub
  lathe(a, cx, by, [[bz, rB * 0.5], [bz + 4, rB * 0.56], [bz + H * 0.05, rB * 0.8], [bz + H * 0.14, rB * 0.97], [z0 + H * 0.6, rB], [z0 + H * 0.62, rB * 1.04]], 28);   // bowl
  a.add(mv(torus(rB * 1.03, 1.2, 28, 4), cx, by, z0 + H * 0.62));
  a.tube([[cx, by, hz - H * 0.1], [cx, by, bz + H * 0.2]], [3.2, 3.2], 8); a.ell(cx, by, bz + H * 0.2, rB * 0.62, rB * 0.62, H * 0.1, 18, 8);   // beater
  a.tube([[cx + W * 0.3, yB - D * 0.45, hz + H * 0.1], [cx + W * 0.46, yB - D * 0.45, hz + H * 0.02]], [2.6, 3.2], 8); a.ell(cx + W * 0.46, yB - D * 0.45, hz + H * 0.02, 4, 4, 4, 8, 6);  // speed lever
  a.box(cx - W * 0.1, yF + D * 0.2, bz, cx + W * 0.1, yF + D * 0.2 + 0.01, bz + 0.01);
  planRR(a, cx, a.cy, W, D, D * 0.2); a.circ(cx, by, rB, 'EQUIP-DETAIL'); a.ellp(cx, a.cy, W * 0.48, D * 0.47, 'EQUIP-DETAIL');
  a.log('Added the soft base and rear column, the tilting head with attachment hub, a footed bowl with rim, a beater and a speed lever (plan and 3D).');
}
/** drip coffee maker */
function coffeeMaker(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, yB = a.YB, bz = z0 + H * 0.06, rc = m.min(W * 0.21, D * 0.17), cy2 = yF + D * 0.48;
  soft(a, cx, a.cy, W, D, 8, z0, bz, 3);
  soft(a, cx, yB - D * 0.17, W * 0.9, D * 0.34, 8, bz, z0 + H * 0.84, 3);                          // water tank column
  a.box(cx - W * 0.1, yB - D * 0.34 - 0.8, bz + H * 0.1, cx + W * 0.1, yB - D * 0.34, z0 + H * 0.78);   // level window
  soft(a, cx, yB - D * 0.34, W * 0.9, D * 0.68, 8, z0 + H * 0.82, z0 + H * 0.93, 3);                // brew head
  a.box(cx - W * 0.3, yB - D * 0.2, z0 + H * 0.93, cx + W * 0.3, yB - D * 0.08, z0 + H);           // reservoir lid
  a.cyl(cx, cy2, bz, bz + 3, rc * 1.22, 24);                                                          // warming plate
  lathe(a, cx, cy2, [[bz + 3, rc * 0.84], [bz + 6, rc * 0.96], [z0 + H * 0.46, rc], [z0 + H * 0.58, rc * 0.82], [z0 + H * 0.62, rc * 0.74]], 24);   // carafe
  a.tube([[cx + rc * 0.9, cy2, z0 + H * 0.56], [cx + rc * 1.4, cy2, z0 + H * 0.54], [cx + rc * 1.35, cy2, z0 + H * 0.3], [cx + rc * 0.98, cy2, z0 + H * 0.24]], [2.2, 3, 3, 2.2], 8);   // handle
  a.cone(cx, cy2, z0 + H * 0.69, z0 + H * 0.82, rc * 0.62, rc * 0.96, 20);                          // filter basket
  a.cyl(cx, cy2, z0 + H * 0.64, z0 + H * 0.69, rc * 0.8, 20);
  a.box(cx - W * 0.34, yF, z0 + 0, cx - W * 0.1, yF + 4, bz); circY(a, cx + W * 0.3, yF, yF + 3, bz * 0.5, 3.4, 10);  // switch and lamp
  planRR(a, cx, a.cy, W, D, 8); a.circ(cx, cy2, rc, 'EQUIP-DETAIL'); a.rect(cx - W * 0.45, yB - D * 0.34, cx + W * 0.45, yB, 'EQUIP-DETAIL');
  a.log('Added the base with warming plate, the rear water column with level window and lid, a brew head with filter basket and a handled carafe (plan and 3D).');
}
/** ceiling pendant: canopy, cord, dome shade; hangs from the top of the body box */
function pendant(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 0.5, sh = R * v.rise, sz = z0 + sh;
  a.cyl(cx, y, z0 + H - 8, z0 + H, m.max(R * 0.12, 18), 20);                    // ceiling canopy
  a.cyl(cx, y, sz + sh * 0.6, z0 + H - 8, 1.6, 8);                                                    // cord
  a.cyl(cx, y, sz + sh * 0.35, sz + sh * 0.7, R * 0.07, 12);                                          // cord grip
  if (v.shade === 'dome') lathe(a, cx, y, [[z0, R], [z0 + sh * 0.12, R * 0.97], [z0 + sh * 0.55, R * 0.62], [z0 + sh * 0.9, R * 0.2], [z0 + sh, R * 0.12]], 30);
  else if (v.shade === 'cone') lathe(a, cx, y, [[z0, R], [z0 + sh, R * 0.14]], 30);
  else { a.ell(cx, y, z0 + sh * 0.5, R, R, sh * 0.5, 30, 16); a.cyl(cx, y, z0 + sh - 1, z0 + sh + 4, R * 0.16, 14); }
  a.add(mv(torus(R * (v.shade === 'globe' ? 0.5 : 0.99), 1.2, 30, 4), cx, y, z0 + 0.6));
  a.ell(cx, y, z0 + sh * 0.2, R * 0.2, R * 0.2, R * 0.24, 14, 8);                                  // bulb
  a.circ(cx, y, R); a.circ(cx, y, R * 0.5, 'EQUIP-DETAIL'); a.circ(cx, y, R * 0.12, 'EQUIP-DETAIL');
  a.log(`Added the ceiling canopy, a cord with grip, a ${v.shade} shade with a rim ring and the bulb inside (plan and 3D).`);
}
/** rice cooker: round body, domed lid, handles, front panel */
function riceCooker(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.D * 0.44, yF = a.YF;
  a.cyl(cx, y, z0, z0 + 6, R * 0.82, 26);
  lathe(a, cx, y, [[z0 + 6, R * 0.84], [z0 + 12, R * 0.98], [z0 + H * 0.5, R * 1.02], [z0 + H * 0.66, R], [z0 + H * 0.7, R * 0.96]], 30);   // pot body
  lathe(a, cx, y, [[z0 + H * 0.7, R * 0.98], [z0 + H * 0.78, R * 0.96], [z0 + H * 0.9, R * 0.66], [z0 + H * 0.97, R * 0.3], [z0 + H, R * 0.22]], 30);   // lid dome
  a.cyl(cx, y, z0 + H * 0.92, z0 + H, R * 0.1, 12); a.add(mv(torus(R * 0.1, 1.2, 12, 4), cx, y, z0 + H - 1));   // steam vent
  for (const s of [-1, 1]) a.box(cx + s * R * 1.03 - (s > 0 ? 0 : 6), y - R * 0.3, z0 + H * 0.5, cx + s * R * 1.03 + (s > 0 ? 6 : 0), y + R * 0.3, z0 + H * 0.62);   // side handles
  a.box(cx - R * 0.58, yF, z0 + H * 0.14, cx + R * 0.58, yF + 4.2, z0 + H * 0.5);                    // control panel
  a.box(cx - R * 0.46, yF - 1.6, z0 + H * 0.36, cx + R * 0.46, yF, z0 + H * 0.46);                    // display strip
  for (let k = 0; k < 4; k++) a.box(cx - R * 0.44 + k * R * 0.24, yF - 2.4, z0 + H * 0.2, cx - R * 0.44 + k * R * 0.24 + R * 0.2, yF, z0 + H * 0.28);   // four keys
  a.box(cx - R * 0.3, yF + 4.2, z0 + H * 0.66, cx + R * 0.3, yF + 8, z0 + H * 0.72);               // lid latch
  a.circ(cx, y, R); a.circ(cx, y, R * 0.66, 'EQUIP-DETAIL'); a.rect(cx - R * 0.5, yF, cx + R * 0.5, yF + 4.2, 'EQUIP-DETAIL');
  a.log('Added the round pot body on a base, a domed lid with steam vent and latch, two side handles and a front panel with two buttons and a lamp (plan and 3D).');
}
/** basket air fryer: rounded body, front drawer with handle, top panel */
function airFryer(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, yB = a.YB;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.cyl(cx + sx * (W / 2 - 14), a.cy + sy * (D / 2 - 14), z0, z0 + 6, 6, 8);
  soft(a, cx, a.cy, W, D, W * 0.2, z0 + 6, z0 + H, 8);
  a.box(cx - W * 0.44, yF - 4, z0 + H * 0.1, cx + W * 0.44, yF + 2, z0 + H * 0.6);                       // proud drawer front
  a.box(cx - W * 0.4, yF - 4.6, z0 + H * 0.52, cx + W * 0.4, yF - 4, z0 + H * 0.56);
  for (const sx of [-1, 1]) a.box(cx + sx * W * 0.34 - 2.5, yF - 14, z0 + H * 0.5, cx + sx * W * 0.34 + 2.5, yF - 4, z0 + H * 0.58);   // handle posts
  a.box(cx - W * 0.34, yF - 14, z0 + H * 0.5, cx + W * 0.34, yF - 10, z0 + H * 0.58);                    // handle bar
  a.box(cx - W * 0.32, yF - 3.5, z0 + H * 0.66, cx + W * 0.32, yF + 1, z0 + H * 0.9);                    // display panel
  a.box(cx - W * 0.24, yF - 4.4, z0 + H * 0.7, cx - W * 0.04, yF - 3.5, z0 + H * 0.84);
  a.ycyl(yF - 8, yF - 3.5, cx + W * 0.18, z0 + H * 0.77, H * 0.075, 16);                                // dial
  slotsY(a, cx - W * 0.3, cx + W * 0.3, z0 + H - 1.2, z0 + H, yB, 7, 2.2);                          // exhaust slots (back)
  for (let i = 0; i < 6; i++) a.box(cx - W * 0.3 + i * (W * 0.6) / 5 - 1, a.cy + D * 0.1, z0 + H, cx - W * 0.3 + i * (W * 0.6) / 5 + 1, a.cy + D * 0.1 + D * 0.3, z0 + H + 0.01);
  planRR(a, cx, a.cy, W, D, W * 0.2); a.rect(cx - W * 0.42, yF, cx + W * 0.42, yF + 3, 'EQUIP-DETAIL');
  a.log(`Added the softened body on four feet with a front basket drawer and handle bar, a top display panel with a dial and rear exhaust slots (plan and 3D).`);
}
/** tower fan heater: tall oval body on a swivel base, slot grille, control top */
function towerHeater(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF;
  a.cyl(cx, a.cy, z0, z0 + 8, D * 0.46, 28); a.cyl(cx, a.cy, z0 + 8, z0 + 12, D * 0.3, 24);
  soft(a, cx, a.cy, W, D * 0.8, D * 0.3, z0 + 12, z0 + H, 8);
  const gz0 = z0 + H * 0.16, gz1 = z0 + H * 0.78;
  a.box(cx - W * 0.36, yF + D * 0.1 - 1.6, gz0, cx + W * 0.36, yF + D * 0.1, gz1);                   // grille recess
  for (let i = 0; i < 4 * m.round(v.slots / 4); i++) a.box(cx - W * 0.4, yF + D * 0.1 - 2.4, gz0 + 4 + (i * (gz1 - gz0 - 8)) / (4 * m.round(v.slots / 4)), cx + W * 0.4, yF + D * 0.1 - 1.6, gz0 + 4 + (i * (gz1 - gz0 - 8)) / (4 * m.round(v.slots / 4)) + 1.6);
  a.box(cx - W * 0.34, yF + D * 0.1 - 1.6, z0 + H * 0.84, cx + W * 0.34, yF + D * 0.1, z0 + H * 0.97);   // control strip
  for (let k = 0; k < 3; k++) circY(a, cx - W * 0.2 + k * W * 0.2, yF + D * 0.1 - 3, yF + D * 0.1 - 1.6, z0 + H * 0.905, 4.5, 12);
  a.ell(cx, a.cy + D * 0.28, z0 + H * 0.5, W * 0.08, D * 0.06, H * 0.18, 8, 6);                      // rear carry handle
  a.circ(cx, a.cy, D * 0.46); planRR(a, cx, a.cy, W, D * 0.8, D * 0.3, 'EQUIP-DETAIL');
  a.log(`Added the swivel base, the tall oval body with ${v.slots} grille slots in a recess, a control strip with three knobs and a rear carry handle (plan and 3D).`);
}
/** clothes iron lying along X, tip to +X */
function clothesIron(a, v) {
  const z0 = a.Z0, H = a.H, L = a.W, D = a.D, y = a.cy, x0 = a.X0, x1 = a.X1, pw = D * 0.46;
  a.prism([[x0 + 2, y - pw], [x0 + L * 0.66, y - pw], [x1 - 2, y], [x0 + L * 0.66, y + pw], [x0 + 2, y + pw]], z0, z0 + H * 0.12);       // soleplate
  for (let i = 0; i < 12; i++) { const g = (i / 12) * TAU; a.cyl(x0 + L * 0.5 + m.cos(g) * L * 0.06 + L * 0.08 * (i % 3 - 1), y + (i % 4 - 1.5) * pw * 0.4, z0 - 0, z0 + 0.01, 0.4, 3); }
  a.prism([[x0 + 4, y - pw * 0.9], [x0 + L * 0.64, y - pw * 0.9], [x1 - L * 0.12, y], [x0 + L * 0.64, y + pw * 0.9], [x0 + 4, y + pw * 0.9]], z0 + H * 0.12, z0 + H * 0.5);   // shell
  a.prism([[x0 + L * 0.1, y - pw * 0.7], [x0 + L * 0.58, y - pw * 0.7], [x1 - L * 0.3, y], [x0 + L * 0.58, y + pw * 0.7], [x0 + L * 0.1, y + pw * 0.7]], z0 + H * 0.5, z0 + H * 0.66);
  a.box(x0 + L * 0.1, y - pw * 0.16, z0 + H * 0.66, x0 + L * 0.2, y + pw * 0.16, z0 + H * 0.98);        // handle rear post
  a.box(x0 + L * 0.4, y - pw * 0.16, z0 + H * 0.66, x0 + L * 0.5, y + pw * 0.16, z0 + H * 0.9);          // handle front post
  a.prism([[x0 + L * 0.1, y - pw * 0.16], [x0 + L * 0.5, y - pw * 0.16], [x0 + L * 0.5, y + pw * 0.16], [x0 + L * 0.1, y + pw * 0.16]], z0 + H * 0.9, z0 + H * 0.98);   // grip bar
  a.cyl(x0 + L * 0.56, y, z0 + H * 0.66, z0 + H * 0.76, pw * 0.12, 12);                             // fill cap
  a.ycyl(y - pw * 0.8, y - pw * 0.9, x0 + L * 0.3, z0 + H * 0.34, pw * 0.2, 14);                      // temperature dial (side)
  a.box(x0 + L * 0.5, y - pw * 0.8, z0 + H * 0.3, x0 + L * 0.6, y - pw * 0.88, z0 + H * 0.4);       // spray button
  a.rect(x0, y - pw, x1, y + pw); a.line(x0 + L * 0.66, y - pw, x0 + L * 0.66, y + pw, 'EQUIP-DETAIL'); a.rect(x0 + L * 0.1, y - pw * 0.2, x0 + L * 0.5, y + pw * 0.2, 'EQUIP-DETAIL');
  a.log('Added the pointed soleplate, the shell, a loop handle, a fill cap, a temperature dial and a spray button (plan and 3D).');
}
/** cool-mist humidifier: base, tank, lid, mist nozzle */
function humidifier(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 0.5, yF = a.YF;
  lathe(a, cx, y, [[z0, R * 0.84], [z0 + 3, R * 0.96], [z0 + H * 0.17, R], [z0 + H * 0.22, R * 0.96]], 28);       // base
  circY(a, cx, yF, yF + 3, z0 + H * 0.11, H * 0.05, 14); circY(a, cx + R * 0.4, yF, yF + 2, z0 + H * 0.11, 3, 10);    // dial + lamp
  lathe(a, cx, y, [[z0 + H * 0.22, R * 0.94], [z0 + H * 0.3, R * 0.98], [z0 + H * 0.74, R * 0.88], [z0 + H * 0.8, R * 0.74]], 28);   // tank
  a.add(mv(torus(R * 0.96, 0.9, 28, 4), cx, y, z0 + H * 0.3));
  lathe(a, cx, y, [[z0 + H * 0.8, R * 0.76], [z0 + H * 0.86, R * 0.62], [z0 + H * 0.9, R * 0.5]], 24);              // lid
  a.cyl(cx, y, z0 + H * 0.9, z0 + H * 0.97, R * 0.16, 14); a.add(mv(torus(R * 0.16, 1, 14, 4), cx, y, z0 + H * 0.97));   // mist nozzle
  a.box(cx - R * 0.5, y + R * 0.7 - 6, z0 + H * 0.74, cx + R * 0.5, y + R * 0.7, z0 + H * 0.76);                     // fill handle bar
  a.circ(cx, y, R); a.circ(cx, y, R * 0.5, 'EQUIP-DETAIL'); a.circ(cx, y, R * 0.16, 'EQUIP-DETAIL');
  a.log('Added the round base with a dial and lamp, a tapering water tank with a rim ring, a domed lid and a raised mist nozzle (plan and 3D).');
}
/** twin-bell alarm clock: round face on two legs, bells on top, hammer, key */
function alarmClock(a, v) {
  const cx = a.cx, z0 = a.Z0, H = a.H, D = a.D, W = a.W, yF = a.YF, R = W * 0.44, zc = z0 + H * 0.5 - H * 0.02, yb = a.cy;
  for (const s of [-1, 1]) a.tube([[cx + s * R * 0.7, yb, zc - R * 0.7], [cx + s * R * 0.92, yb, z0 + 1], [cx + s * R * 1.0, yb, z0 + 0.5]], [2.8, 2.4, 2.4], 8);
  a.ycyl(yF + 3, a.YB - 3, cx, zc, R, 36); ringXZ(a, cx, yF + 3, zc, R * 0.98, 1.6, 36);        // case and bezel
  a.ycyl(yF + 2, yF + 3, cx, zc, R * 0.86, 36); a.ycyl(yF + 1.6, yF + 2, cx, zc, R * 0.84, 36);     // dial
  for (let k = 0; k < 12; k++) { const g = (k / 12) * TAU; a.box(cx + m.sin(g) * R * 0.74 - 1, yF + 1.0, zc + m.cos(g) * R * 0.74 - (k % 3 ? 1.2 : 2), cx + m.sin(g) * R * 0.74 + 1, yF + 1.6, zc + m.cos(g) * R * 0.74 + (k % 3 ? 1.2 : 2)); }
  a.box(cx - 1.2, yF + 0.4, zc, cx + 1.2, yF + 1.0, zc + R * 0.62); a.box(cx - 1.2, yF + 0.2, zc, cx + R * 0.46, yF + 0.8, zc + 1.2);   // hands
  circY(a, cx, yF + 0.2, yF + 1.4, zc, 2.8, 10);
  for (const s of [-1, 1]) { const bx = cx + s * R * 0.62, bz = zc + R * 0.82; a.cyl(bx, yb, bz, bz + R * 0.1, 2.5, 8); lathe(a, bx, yb, [[bz + R * 0.12, R * 0.34], [bz + R * 0.26, R * 0.3], [bz + R * 0.4, R * 0.1]], 20); }
  a.tube([[cx, yb, zc + R * 0.98], [cx, yb, z0 + H - 2]], [2, 2], 6); a.ell(cx, yb, z0 + H - 4, 5, 3, 2, 8, 6);       // hammer arm
  a.cyl(cx, a.YB - 3, z0 + 0.0, z0 + 0.01, 0.1, 3);
  a.circ(cx, yb, R * 0.2); a.rect(cx - R, yF + 3, cx + R, a.YB - 3, 'EQUIP'); a.circ(cx, yb, R * 0.6, 'EQUIP-DETAIL');
  a.log('Added the round case with bezel, a dial with hour marks and hands, two bells on stems, a hammer, two legs and a back winding key (plan and 3D).');
}
/** waffle maker: hinged lid with handle, base, indicator, grid lines */
function waffleMaker(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, yF = a.YF, yB = a.YB, W = a.W, D = a.D, sq = v.sq, rr = sq ? 14 : m.min(W, D) / 2;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.cyl(cx + sx * (W / 2 - 12), y + sy * (D / 2 - 12), z0, z0 + 4, 4.5, 8);
  soft(a, cx, y, W, D, rr, z0 + 4, z0 + H * 0.46, 4); soft(a, cx, y, W * 0.98, D * 0.98, rr, z0 + H * 0.46, z0 + H * 0.9, 6);
  a.box(cx - W * 0.4, yF + 0.0, z0 + H * 0.46 - 1.2, cx + W * 0.4, yF + 1.2, z0 + H * 0.46 + 1.2);   // seam lip
  a.box(cx - W * 0.2, yF, z0 + H * 0.5, cx + W * 0.2, yF + 12, z0 + H * 0.66);                       // handle block
  a.box(cx - W * 0.17, yF, z0 + H * 0.56, cx + W * 0.17, yF + 10, z0 + H * 0.61);
  const gx = W * 0.32, gy = D * 0.3, n = 6;
  for (let i = 0; i <= n; i++) { a.box(cx - gx + (2 * gx * i) / n - 0.7, y - gy, z0 + H * 0.9, cx - gx + (2 * gx * i) / n + 0.7, y + gy, z0 + H * 0.9 + 1.4); a.box(cx - gx, y - gy + (2 * gy * i) / n - 0.7, z0 + H * 0.9, cx + gx, y - gy + (2 * gy * i) / n + 0.7, z0 + H * 0.9 + 1.4); }
  for (const s of [-1, 1]) a.box(cx + s * W * 0.34 - 4, yB - 8, z0 + H * 0.4, cx + s * W * 0.34 + 4, yB, z0 + H * 0.6);   // hinges
  circY(a, cx + W * 0.36, yF, yF + 2, z0 + H * 0.3, 2.6, 10); circY(a, cx + W * 0.28, yF, yF + 2, z0 + H * 0.3, 2.6, 10);   // indicator lamps
  if (sq) planRR(a, cx, y, W, D, 14); else a.ellp(cx, y, W / 2, D / 2); a.rect(cx - gx, y - gy, cx + gx, y + gy, 'EQUIP-DETAIL'); a.rect(cx - W * 0.2, yF, cx + W * 0.2, yF + 12, 'EQUIP-DETAIL');
  a.log(`Added the ${sq ? 'square' : 'round'} base on four feet, the hinged lid with a grid of ribs, a front handle, rear hinges and two indicator lamps (plan and 3D).`);
}

// ================================================================================================ HANDHELD
/** laser distance measure standing up: front display, keys, laser window on the top end */
function laserMeasure(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF;
  a.box(cx - W * 0.5, a.cy - D * 0.5, z0, cx + W * 0.5, a.cy + D * 0.5, z0 + H * 0.08);                 // rubber end bumper
  soft(a, cx, a.cy, W, D, W * 0.2, z0 + H * 0.08, z0 + H * 0.93, 3);
  soft(a, cx, a.cy, W * 0.96, D * 0.96, W * 0.18, z0 + H * 0.93, z0 + H, 2);
  a.box(cx - W * 0.34, yF - 0.0, z0 + H * 0.6, cx + W * 0.34, yF + 1.0, z0 + H * 0.86);               // display bezel
  a.box(cx - W * 0.28, yF - 0.0, z0 + H * 0.64, cx + W * 0.28, yF + 0.5, z0 + H * 0.82);
  for (let i = 0; i < 4; i++) a.box(cx - W * 0.24 + i * W * 0.13, yF + 0.0, z0 + H * 0.7, cx - W * 0.24 + i * W * 0.13 + W * 0.09, yF + 0.3, z0 + H * 0.78);
  buttonsY(a, cx - W * 0.34, cx + W * 0.34, z0 + H * (v.keys > 6 ? 0.18 : 0.3), z0 + H * 0.54, yF, 3, v.keys / 3, W * 0.09, 1.6);
  circY(a, cx, yF, yF + 2, z0 + H * 0.1 + H * 0.02, W * 0.14, 16);                                     // main measure key
  a.ycyl(a.YB - 1, a.YB, cx - W * 0.2, z0 + H * 0.96, W * 0.08, 10); a.ycyl(a.YB - 1, a.YB, cx + W * 0.2, z0 + H * 0.96, W * 0.1, 10);   // laser and receiver windows
  a.box(cx - W * 0.1, a.cy - D * 0.5 - 0.0, z0 + H * 0.4, cx - W * 0.1 + 0.1, a.cy - D * 0.5 + 0.1, z0 + H * 0.41);
  planRR(a, cx, a.cy, W, D, W * 0.2); a.rect(cx - W * 0.34, yF, cx + W * 0.34, yF + 1, 'EQUIP-DETAIL');
  a.log(`Added the rubber end bumper, the softened body with a display bezel, ${v.keys} keys, a main measure key and the laser and receiver windows on the top end (plan and 3D).`);
}
/** infrared thermometer, pistol grip lying along X: barrel, sensor nose, display at the rear, trigger */
function irThermo(a, v) {
  const cx = a.cx, L = a.W, D = a.D, H = a.H, z0 = a.Z0, y = a.cy, x0 = a.X0, x1 = a.X1, r = D * 0.44, zb = z0 + H - r;
  a.add(TUBE([[x0 + 2, y, zb], [x0 + L * 0.3, y, zb], [x0 + L * 0.74, y, zb], [x1 - L * 0.12, y, zb]], [r * 0.9, r, r, r * 0.86], 22));        // barrel
  a.add(TUBE([[x1 - L * 0.12, y, zb], [x1 - L * 0.05, y, zb], [x1, y, zb]], [r * 0.7, r * 0.55, r * 0.5], 18));                              // sensor nose
  a.ell(x1 - 1.5, y, zb, 1.5, r * 0.4, r * 0.4, 4, 12);
  a.tube([[x0 + L * 0.44, y, zb - r * 0.6], [x0 + L * 0.5, y, zb - (H - 2 * r) * 0.5], [x0 + L * 0.56, y, z0 + 4]], [r * 0.7, r * 0.62, r * 0.55], 14);   // handle
  a.ell(x0 + L * 0.56, y, z0 + 3, r * 0.58, r * 0.5, 3.5, 12, 4);
  a.box(x0 + L * 0.6, y - 2.5, zb - r * 1.2, x0 + L * 0.66, y + 2.5, zb - r * 0.5);                                                           // trigger
  a.box(x0 + 0.0, y - r * 0.7, zb - r * 0.55, x0 + 1.4, y + r * 0.7, zb + r * 0.65);                                                          // rear display
  a.box(x0 + L * 0.2, y - r * 0.5, zb + r * 0.92, x0 + L * 0.34, y + r * 0.5, zb + r * 1.0);                                                  // top mode key
  a.rect(x0, y - r, x1, y + r); a.line(x0 + L * 0.44, y - r * 0.7, x0 + L * 0.56, y - r * 0.6, 'EQUIP-DETAIL'); a.circ(x1 - r * 0.8, y, r * 0.5, 'EQUIP-DETAIL');
  a.log('Added the round barrel with a sensor nose, a rear display, a top mode key, an angled pistol grip with a base cap and a trigger (plan and 3D).');
}
/** barcode scanner in its cradle */
function scannerCradle(a, v) {
  const cx = a.cx, L = a.W, D = a.D, H = a.H, z0 = a.Z0, y = a.cy, x0 = a.X0, x1 = a.X1, r = D * 0.26, zb = z0 + H * 0.62, bt = z0 + H * 0.1;
  a.box(x0, y - D * 0.46, z0, x1, y + D * 0.46, bt);                                                                                   // cradle base
  for (const [xa, xb] of [[0.02, 0.14], [0.56, 0.68]]) { a.box(x0 + L * xa, y - D * 0.34, bt, x0 + L * xb, y + D * 0.34, zb - r * 0.55); a.box(x0 + L * xa, y - D * 0.34, zb - r * 0.55, x0 + L * xb, y - D * 0.34 + 4, zb + r * 0.2); a.box(x0 + L * xa, y + D * 0.34 - 4, zb - r * 0.55, x0 + L * xb, y + D * 0.34, zb + r * 0.2); }
  a.add(TUBE([[x0 + L * 0.1, y, zb], [x0 + L * 0.3, y, zb], [x1 - L * 0.34, y, zb]], [r * 0.8, r, r], 20));                           // body
  prismY(a, [[x1 - L * 0.34, zb - r * 1.0], [x1 - L * 0.04, zb - r * 1.35], [x1 - L * 0.04, zb + r * 1.6], [x1 - L * 0.34, zb + r * 1.0]], y - r * 1.1, y + r * 1.1);   // angled head
  prismY(a, [[x1 - L * 0.045, zb - r * 1.2], [x1 - L * 0.02, zb - r * 1.3], [x1 - L * 0.02, zb + r * 1.5], [x1 - L * 0.045, zb + r * 1.4]], y - r * 0.9, y + r * 0.9);   // scan window
  a.tube([[x0 + L * 0.32, y, zb - r * 0.4], [x0 + L * 0.35, y, (zb + bt) / 2], [x0 + L * 0.37, y, bt + 3]], [r * 0.8, r * 0.7, r * 0.66], 12);   // grip standing on the base
  a.box(x0 + L * 0.4, y - 2.4, zb - r * 1.5, x0 + L * 0.46, y + 2.4, zb - r * 0.6);                                                  // trigger
  a.tube([[x0, y, bt + 8], [x0 + L * 0.1, y, bt + 8], [x0 + L * 0.1, y, zb]], [2.6, 2.6, 2.6], 8);                                      // cable
  a.rect(x0, y - D * 0.46, x1, y + D * 0.46); a.rect(x0 + L * 0.1, y - r, x1 - L * 0.02, y + r, 'EQUIP-DETAIL');
  a.log('Added the cradle base with two seats, the scanner body with an angled head and scan window, a grip standing on the base, a trigger and a cable (plan and 3D).');
}
/** handheld vacuum lying along X: dust cup, motor body, pistol handle, nozzle */
function handVac(a, v) {
  const L = a.W, D = a.D, H = a.H, z0 = a.Z0, y = a.cy, x0 = a.X0, x1 = a.X1, r = D * 0.42, zb = z0 + H - r - 2;
  a.add(TUBE([[x0 + 4, y, zb], [x0 + L * 0.22, y, zb], [x0 + L * 0.36, y, zb]], [r * 0.72, r * 0.82, r * 0.82], 22));                  // motor housing
  a.add(TUBE([[x0 + L * 0.36, y, zb], [x0 + L * 0.4, y, zb], [x1 - L * 0.26, y, zb]], [r * 0.82, r, r], 22));                           // dust cup
  a.add(mv(rotY(torus(r * 1.02, 0.9, 24, 4), m.PI / 2), x0 + L * 0.37, y, zb));
  a.add(TUBE([[x1 - L * 0.26, y, zb], [x1 - L * 0.22, y, zb], [x1 - L * 0.1, y, zb]], [r * 0.94, r * 0.5, r * 0.4], 20));                // cone
  a.add(TUBE([[x1 - L * 0.1, y, zb], [x1, y, zb]], [r * 0.55, r * 0.7], 20));   // flared mouth
  a.tube([[x0 + L * 0.12, y, zb + r * 0.6], [x0 + L * 0.2, y, zb - r * 0.8], [x0 + L * 0.28, y, z0 + 4]], [r * 0.5, r * 0.45, r * 0.45], 12);   // handle
  a.ell(x0 + L * 0.28, y, z0 + 3, r * 0.5, r * 0.4, 3, 10, 4);
  a.box(x0 + L * 0.14, y - 3, zb + r * 0.96, x0 + L * 0.2, y + 3, zb + r * 1.0 + 1);                                                   // switch
  slotsY(a, x0 + 6, x0 + L * 0.16, zb - r * 0.4, zb + r * 0.4, y - r * 0.72, 5, 1.2);
  if (v.crevice) a.tube([[x0 + L * 0.46, y, zb - r - 3], [x1 - L * 0.2, y, zb - r - 3]], [3.4, 2.4], 8);   // clipped crevice tool
  a.rect(x0, y - r, x1, y + r); a.line(x0 + L * 0.36, y - r, x0 + L * 0.36, y + r, 'EQUIP-DETAIL'); a.circ(x0 + L * 0.2, y, r * 0.45, 'EQUIP-DETAIL');
  a.log('Added the motor housing with vent slots, a ringed dust cup, the nozzle cone and flared mouth, a handle with a switch' + (v.crevice ? ' and a clipped crevice tool' : '') + ' (plan and 3D).');
}
/** rotary / foil shaver standing: body, head plate with rings, buttons, display */
function shaver(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, bodyH = H * 0.8;
  soft(a, cx, a.cy, W, D, D * 0.46, z0, z0 + bodyH, 4, 3);
  a.box(cx - W * 0.4, yF - 0.0, z0 + bodyH * 0.1, cx + W * 0.4, yF + 1, z0 + bodyH * 0.12);         // trim line
  for (let i = 0; i < 6; i++) a.box(cx - W * 0.3, yF + 0.0, z0 + bodyH * (0.2 + i * 0.045), cx + W * 0.3, yF + 0.5, z0 + bodyH * (0.2 + i * 0.045) + 0.7);   // grip lines
  circY(a, cx, yF, yF + 1.8, z0 + bodyH * 0.62, W * 0.12, 14); a.box(cx - W * 0.15, yF, z0 + bodyH * 0.8, cx + W * 0.15, yF + 1.2, z0 + bodyH * 0.9);   // power button + display
  soft(a, cx, a.cy, W * 0.94, D * 0.94, D * 0.4, z0 + bodyH, z0 + H * 0.9, 2);                                                           // head carrier
  const n = v.heads, hr = n === 1 ? W * 0.3 : n === 2 ? W * 0.23 : W * 0.2;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * TAU + m.PI / 2, hx = n === 1 ? cx : cx + m.cos(ang) * W * (n === 2 ? 0.0 : 0.2) + (n === 2 ? (i ? 1 : -1) * W * 0.22 : 0), hy = n === 1 ? a.cy : n === 2 ? a.cy : a.cy + m.sin(ang) * D * 0.16;
    a.cyl(hx, hy, z0 + H * 0.9, z0 + H * 0.96, hr, 22); a.add(mv(torus(hr * 0.9, 0.8, 22, 4), hx, hy, z0 + H * 0.96)); a.cyl(hx, hy, z0 + H * 0.94, z0 + H * 0.985, hr * 0.5, 16);
    for (let k = 0; k < 3; k++) { const g = (k / 3) * TAU; a.box(hx + m.cos(g) * hr * 0.64 - 0.7, hy + m.sin(g) * hr * 0.64 - 0.7, z0 + H * 0.96, hx + m.cos(g) * hr * 0.64 + 0.7, hy + m.sin(g) * hr * 0.64 + 0.7, z0 + H); }
  }
  a.box(cx - W * 0.1, a.YB - 2, z0 + bodyH * 0.55, cx + W * 0.1, a.YB, z0 + H * 0.98);                                                  // pop-up trimmer
  planRR(a, cx, a.cy, W, D, D * 0.46);
  a.log(`Added the grip body with a trim line and grip lines, a power button, a display, a head carrier with ${n} cutter head${n > 1 ? 's' : ''} and a rear trimmer (plan and 3D).`);
}
/** electric toothbrush on its charging base */
function toothbrush(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, y = a.cy, br = m.min(W, D) * 0.46, hr = W * 0.26;
  lathe(a, cx, y, [[z0, br * 0.9], [z0 + 3, br], [z0 + H * 0.06, br * 0.96], [z0 + H * 0.08, br * 0.5]], 26);                  // charging base
  a.add(mv(torus(br * 0.98, 1.2, 26, 4), cx, y, z0 + H * 0.07));
  lathe(a, cx, y, [[z0 + H * 0.08, hr * 0.98], [z0 + H * 0.12, hr], [z0 + H * 0.6, hr * 0.92], [z0 + H * 0.7, hr * 0.78]], 22);      // handle
  a.add(mv(torus(hr * 0.94, 0.7, 22, 4), cx, y, z0 + H * 0.4));
  circY(a, cx, yF + (D - hr * 2) / 2, yF + (D - hr * 2) / 2 + 1.6, z0 + H * 0.5, hr * 0.34, 12);                                   // button
  a.cyl(cx, y, z0 + H * 0.7, z0 + H * 0.79, hr * 0.62, 14);                                                                   // neck
  a.box(cx - hr * 0.6, y - D * 0.1, z0 + H * 0.78, cx + hr * 0.6, y + D * 0.1, z0 + H * 0.96);                                  // brush head
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) a.ycyl(y - D * 0.1 - 5, y - D * 0.1, cx - hr * 0.42 + j * hr * 0.42, z0 + H * 0.8 + i * H * 0.04, 1.5, 6);   // bristle tufts
  planRR(a, cx, y, br * 2, br * 2, br); a.circ(cx, y, hr, 'EQUIP-DETAIL');
  a.log('Added the round charging base with a ring, the tapered handle with a grip ring and button, a neck and a brush head with rows of bristle tufts (plan and 3D).');
}
/** handheld GPS unit */
function gpsUnit(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF;
  soft(a, cx, a.cy, W, D, W * 0.14, z0, z0 + H * 0.88, 3);
  a.cyl(cx + W * 0.3, a.cy, z0 + H * 0.88, z0 + H, W * 0.07, 12); a.ell(cx + W * 0.3, a.cy, z0 + H, W * 0.07, W * 0.07, 2, 10, 4);       // aerial stub
  a.box(cx - W * 0.42, yF - 0.0, z0 + H * 0.38, cx + W * 0.42, yF + 1.4, z0 + H * 0.84);                                               // screen bezel
  a.box(cx - W * 0.36, yF - 0.0, z0 + H * 0.42, cx + W * 0.36, yF + 0.8, z0 + H * 0.8);
  a.ycyl(yF, yF + 2, cx, z0 + H * 0.2, W * 0.14, 18); a.ycyl(yF, yF + 2.6, cx, z0 + H * 0.2, W * 0.05, 10);                             // thumb pad
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) a.ycyl(yF, yF + 1.6, cx + s * W * (0.3 + k * 0.0), z0 + H * (0.28 + k * 0.1), W * 0.05, 10);
  for (let i = 0; i < 8; i++) a.box(a.X1 - 0.8, a.cy - D * 0.3, z0 + H * (0.3 + i * 0.05), a.X1, a.cy + D * 0.3, z0 + H * (0.3 + i * 0.05) + 1.2);   // side grip ribs
  a.tube([[cx - W * 0.2, a.YB - 0.8, z0 + 3], [cx - W * 0.2, a.YB - 0.8, z0 - 0.0 + 1], [cx + W * 0.2, a.YB - 0.8, z0 + 1], [cx + W * 0.2, a.YB - 0.8, z0 + 3]], [1.6, 1.6, 1.6, 1.6], 6);   // lanyard loop
  planRR(a, cx, a.cy, W, D, W * 0.14); a.circ(cx + W * 0.3, a.cy, W * 0.07, 'EQUIP-DETAIL');
  a.log('Added the rounded body with a stub aerial, a screen in a bezel, a thumb pad, four keys, side grip ribs and a lanyard loop (plan and 3D).');
}
/** retractable tape measure: round-cornered case in the XZ plane, tape, hook, lock, belt clip */
function tapeMeasure(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, y = a.cy, cw = W * 0.74, hx = a.X0 + cw / 2, x1 = a.X1;
  const body = rrPoly(hx, 0, cw, H, H * 0.28, 4).map(([x, z]) => [x, z0 + H / 2 + z]);
  prismY(a, body, yF, yF + D);
  a.box(hx - cw * 0.3, yF, z0 + H * 0.06, hx + cw * 0.3, yF + 1.2, z0 + H * 0.12);                                              // rubber foot strip
  a.ycyl(yF, yF + 1.6, hx - cw * 0.1, z0 + H * 0.58, H * 0.2, 22); a.ycyl(yF, yF + 2.2, hx - cw * 0.1, z0 + H * 0.58, H * 0.1, 14);   // window and hub
  a.box(hx + cw * 0.12, yF, z0 + H * 0.5, hx + cw * 0.4, yF + 1.2, z0 + H * 0.66);                                                // lock slide
  a.box(hx - cw * 0.4, yF + D * 0.2, z0 + H * 0.98, hx + cw * 0.4, yF + D * 0.8, z0 + H);                                          // top ridge
  a.box(hx - cw * 0.3, a.YB - 0.9, z0 + H * 0.2, hx + cw * 0.3, a.YB, z0 + H * 0.98);                                               // belt clip
  a.box(hx + cw / 2 - 10, y - D * 0.36, z0 + H * 0.12, x1 - 3, y + D * 0.36, z0 + H * 0.12 + 0.9);                                       // blade
  a.box(x1 - 3, y - D * 0.36, z0 + H * 0.12, x1, y + D * 0.36, z0 + H * 0.12 + H * 0.3);                                             // end hook
  for (let i = 0; i < 9; i++) a.box(hx + cw / 2 + 4 + i * (x1 - hx - cw / 2 - 12) / 9, y - D * 0.36, z0 + H * 0.12 + 0.9, hx + cw / 2 + 4.6 + i * (x1 - hx - cw / 2 - 12) / 9, y + D * 0.36, z0 + H * 0.12 + 1.4);
  a.rect(a.X0, yF, hx + cw / 2, yF + D); a.rect(hx + cw / 2, y - D * 0.36, x1, y + D * 0.36, 'EQUIP-DETAIL');
  a.log('Added the rounded case with a rubber foot, a window, a lock slide and a belt clip, and the extended blade with graduations and an end hook (plan and 3D).');
}
/** hot glue gun lying along X */
function glueGun(a, v) {
  const L = a.W, D = a.D, H = a.H, z0 = a.Z0, y = a.cy, x0 = a.X0, x1 = a.X1, r = D * 0.4, zb = z0 + H - r - 1;
  a.add(TUBE([[x0 + L * 0.22, y, zb], [x0 + L * 0.3, y, zb], [x1 - L * 0.26, y, zb], [x1 - L * 0.14, y, zb]], [r * 0.7, r, r, r * 0.9], 18));   // barrel
  a.add(TUBE([[x1 - L * 0.14, y, zb], [x1 - L * 0.04, y, zb], [x1, y, zb]], [r * 0.55, r * 0.3, r * 0.15], 14));                             // nozzle
  a.add(TUBE([[x0 + 2, y, zb + 1], [x0 + L * 0.22, y, zb]], [r * 0.28, r * 0.28], 10));                                                      // glue stick
  a.tube([[x0 + L * 0.32, y, zb - r * 0.4], [x0 + L * 0.38, y, zb - (H - 2 * r) * 0.5], [x0 + L * 0.44, y, z0 + 3]], [r * 0.6, r * 0.55, r * 0.5], 12);   // handle
  a.box(x0 + L * 0.46, y - 2.4, zb - r * 1.5, x0 + L * 0.52, y + 2.4, zb - r * 0.6);                                                          // trigger
  a.tube([[x1 - L * 0.34, y, zb - r * 0.9], [x1 - L * 0.34, y, z0 + 1], [x1 - L * 0.12, y, z0 + 1], [x1 - L * 0.12, y, zb - r * 0.9]], [1.2, 1.2, 1.2, 1.2], 6);   // fold-out stand
  a.cyl(x0 + L * 0.3, y, zb + r * 0.9, zb + r * 1.0, r * 0.2, 10);
  a.rect(x0 + 2, y - r, x1, y + r); a.line(x0 + L * 0.22, y - r * 0.7, x0 + L * 0.22, y + r * 0.7, 'EQUIP-DETAIL'); a.circ(x1 - 2, y, 2, 'EQUIP-DETAIL');
  a.log('Added the barrel with a glue stick at the rear and a tapered nozzle, a handle with a trigger and a fold-out wire stand (plan and 3D).');
}
/** rugged handheld terminal: screen, keypad, scan window on top end, bumpers */
function ruggedTerminal(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, y = a.cy;
  soft(a, cx, y, W, D, W * 0.16, z0, z0 + H * 0.9, 3);
  for (const s of [-1, 1]) a.ell(cx + s * W * 0.4, y, z0 + H * 0.08, W * 0.12, D * 0.5, H * 0.06, 10, 5);           // corner bumpers
  prismY(a, rrPoly(cx, 0, W * 0.84, H * 0.38, 3).map(([x, z]) => [x, z0 + H * (0.9 - 0.24) + z]), yF - 1.4, yF + 0.5);   // screen
  prismY(a, rrPoly(cx, 0, W * 0.78, H * 0.32, 2).map(([x, z]) => [x, z0 + H * (0.9 - 0.24) + z]), yF - 2.0, yF - 1.4);
  buttonsY(a, cx - W * 0.38, cx + W * 0.38, z0 + H * 0.06, z0 + H * (v.rows ? 0.4 : 0.14), yF, 4, m.max(1, v.rows), W * 0.055, 1.5, true);
  a.box(cx - W * 0.3, a.YB - 0.9, z0 + H * 0.1, cx + W * 0.3, a.YB, z0 + H * 0.7);                                      // rear hand-strap plate
  a.box(cx - W * 0.28, y - D * 0.3, z0 + H * 0.9, cx + W * 0.28, y + D * 0.3, z0 + H);                                  // scan head on top
  a.box(cx - W * 0.24, yF + D * 0.2, z0 + H * 0.97, cx + W * 0.24, y + D * 0.1, z0 + H * 0.97 + 0.01);
  a.box(a.X1 - 0.8, y - D * 0.2, z0 + H * 0.5, a.X1, y + D * 0.2, z0 + H * 0.65);                                       // side trigger
  planRR(a, cx, y, W, D, W * 0.16); a.rect(cx - W * 0.28, y - D * 0.3, cx + W * 0.28, y + D * 0.3, 'EQUIP-DETAIL');
  a.log('Added the rounded body with corner bumpers, a front screen' + (v.rows ? `, a ${4} x ${v.rows} keypad` : ' and a few keys') + ', a scan head on the top end, a side trigger and a rear strap plate (plan and 3D).');
}
/** action camera cube: lens, display, top button, two-prong mount */
function actionCam(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, y = a.cy, mh = H * 0.22;
  a.box(cx - W * 0.3, y - D * 0.3, z0, cx + W * 0.3, y + D * 0.3, z0 + mh);                                                              // mount foot
  for (const s of [-1, 1]) a.box(cx + s * W * 0.12 - 1.6, y - D * 0.3, z0 + mh * 0.2, cx + s * W * 0.12 + 1.6, y + D * 0.3, z0 + mh); a.xcyl(cx - W * 0.2, cx + W * 0.2, y, z0 + mh * 0.6, 2, 8);
  soft(a, cx, y, W, D, W * 0.14, z0 + mh, z0 + H, 3);
  a.ycyl(yF - 0.0, yF + 1.6, cx - W * 0.1, z0 + mh + (H - mh) * 0.62, (H - mh) * 0.24, 24); a.ycyl(yF, yF + 3.2, cx - W * 0.1, z0 + mh + (H - mh) * 0.62, (H - mh) * 0.18, 24);   // lens and ring
  a.ycyl(yF, yF + 3.8, cx - W * 0.1, z0 + mh + (H - mh) * 0.62, (H - mh) * 0.08, 14);
  a.box(cx + W * 0.28, yF, z0 + mh + (H - mh) * 0.58, cx + W * 0.44, yF + 1, z0 + mh + (H - mh) * 0.88);                                  // front status screen
  circY(a, cx - W * 0.4, yF, yF + 1, z0 + mh + (H - mh) * 0.92, 1.4, 8);
  a.box(cx - W * 0.12, y - D * 0.2, z0 + H, cx + W * 0.12, y + D * 0.2, z0 + H - 0.01); circY(a, cx - W * 0.1, y - 0.0, y + 0.0, z0 + H, 0.01, 3);
  a.box(cx + W * 0.3, y - D * 0.14, z0 + H - 1.2, cx + W * 0.44, y + D * 0.14, z0 + H);                                                   // shutter pad
  a.box(a.X1 - 0.6, y - D * 0.2, z0 + mh + (H - mh) * 0.2, a.X1, y + D * 0.2, z0 + mh + (H - mh) * 0.5);                                  // side latch
  planRR(a, cx, y, W, D, W * 0.14); a.circ(cx - W * 0.1, yF + 2, (H - mh) * 0.18, 'EQUIP-DETAIL'); a.rect(cx - W * 0.3, y - D * 0.3, cx + W * 0.3, y + D * 0.3, 'EQUIP-DETAIL');
  a.log('Added the rounded cube body with a ringed lens, a front status screen, a shutter pad, a side latch and a two-prong mount foot with a pin (plan and 3D).');
}
/** bullhorn lying along X: horn bell, body, pistol grip, trigger */
function bullhorn(a, v) {
  const L = a.W, D = a.D, H = a.H, z0 = a.Z0, y = a.cy, x0 = a.X0, x1 = a.X1, br = H * 0.5 - 1, zc = z0 + H - br - 1;
  a.add(TUBE([[x0 + L * 0.34, y, zc], [x0 + L * 0.5, y, zc], [x0 + L * 0.78, y, zc], [x1, y, zc]], [br * 0.2, br * 0.34, br * 0.72, br], 28));    // horn
  a.add(mv(rotY(torus(br * 0.98, 1.6, 28, 4), m.PI / 2), x1 - 1.6, y, zc));
  a.add(TUBE([[x0 + 2, y, zc], [x0 + L * 0.1, y, zc], [x0 + L * 0.34, y, zc]], [br * 0.28, br * 0.34, br * 0.34], 20));                     // body
  a.ell(x0 + 3, y, zc, 3, br * 0.28, br * 0.28, 4, 14);
  a.tube([[x0 + L * 0.18, y, zc - br * 0.2], [x0 + L * 0.2, y, zc - (br + 6) * 0.9], [x0 + L * 0.22, y, z0 + 4]], [br * 0.2, br * 0.18, br * 0.17], 10);    // grip
  a.box(x0 + L * 0.25, y - 2.4, zc - br * 0.6, x0 + L * 0.3, y + 2.4, zc - br * 0.2);                                                       // trigger
  a.cyl(x0 + L * 0.12, y, zc + br * 0.32, zc + br * 0.42, br * 0.14, 14);                                                                    // volume knob
  a.tube([[x0 + L * 0.3, y, zc + br * 0.3], [x0 + L * 0.34, y, zc + br * 0.9], [x0 + L * 0.5, y, zc + br * 0.5]], [1.6, 1.6, 1.6], 6);        // strap loop
  a.rect(x0, y - br * 0.34, x0 + L * 0.34, y + br * 0.34); a.poly([[x0 + L * 0.34, y - br * 0.2], [x1, y - br], [x1, y + br], [x0 + L * 0.34, y + br * 0.2]]); a.circ(x1 - 4, y, br * 0.8, 'EQUIP-DETAIL');
  a.log('Added the flared horn with a rolled bell rim, the rear body with a volume knob, a pistol grip with a trigger and a strap loop (plan and 3D).');
}

// ================================================================================================ PACKAGING
/** extrude a convex [y, z] polygon along X between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) a.t.push([[x0, poly[0][0], poly[0][1]], [x0, poly[i + 1][0], poly[i + 1][1]], [x0, poly[i][0], poly[i][1]]], [[x1, poly[0][0], poly[0][1]], [x1, poly[i][0], poly[i][1]], [x1, poly[i + 1][0], poly[i + 1][1]]]);
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, p[0], p[1]], [x0, q[0], q[1]], [x1, q[0], q[1]]], [[x0, p[0], p[1]], [x1, q[0], q[1]], [x1, p[0], p[1]]]); }
  return a;
}
/** a wine bottle: v.sh = where the shoulder starts (0-1 of the height), v.nk = neck radius ratio */
function wineBottle(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 0.3, zs = z0 + H * v.sh, zn = z0 + H * 0.78, d = zn - zs, nr = R * v.nk;
  lathe(a, cx, y, [[z0, R * 0.7], [z0 + 1.2, R * 0.9], [z0 + 3.5, R], [zs, R], [zs + d * 0.22, R * (1 - (1 - v.nk) * 0.28)], [zs + d * 0.5, R * (1 - (1 - v.nk) * 0.62)], [zs + d * 0.8, nr * 1.12], [zn, nr * 1.02], [z0 + H * 0.9, nr], [z0 + H * 0.93, nr * 1.12], [z0 + H * 0.955, nr * 1.12], [z0 + H * 0.96, nr * 1.0]], 30);
  lathe(a, cx, y, [[z0 + H * 0.28, R * 1.012], [z0 + H * 0.58, R * 1.012]], 30);                    // front label band
  lathe(a, cx, y, [[z0 + H * 0.74, nr * 1.03], [z0 + H * 0.985, nr * 1.07], [z0 + H, nr * 1.0]], 22);   // foil capsule over the cork
  a.add(mv(torus(nr * 1.08, 0.8, 22, 4), cx, y, z0 + H * 0.985));
  a.circ(cx, y, R); a.circ(cx, y, nr * 1.06, 'EQUIP-DETAIL'); a.circ(cx, y, R * 0.7, 'EQUIP-HIDDEN');
  a.log('Added the lathed glass body with a pushed-up base, a label band, a ' + (v.sh > 0.5 ? 'high shoulder' : 'sloping shoulder') + ', a lipped neck and a foil capsule (plan and 3D).');
}
/** aerosol can: dome base, shoulder, valve cup, actuator with overcap */
function aerosol(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 0.3, cap = H * 0.2;
  lathe(a, cx, y, [[z0, R * 0.78], [z0 + 2, R * 0.94], [z0 + 5, R], [z0 + H * 0.66, R], [z0 + H * 0.74, R * 0.86], [z0 + H * 0.78, R * 0.5], [z0 + H * 0.8, R * 0.36]], 30);
  a.add(mv(torus(R * 0.99, 0.5, 30, 4), cx, y, z0 + 5)); a.add(mv(torus(R * 0.99, 0.5, 30, 4), cx, y, z0 + H * 0.66));
  lathe(a, cx, y, [[z0 + H * 0.12, R * 1.012], [z0 + H * 0.58, R * 1.012]], 30);                    // label
  lathe(a, cx, y, [[z0 + H - cap, R * 0.82], [z0 + H - cap + 2, R * 0.86], [z0 + H - 3, R * 0.86], [z0 + H, R * 0.78]], 26);   // overcap
  for (let k = 0; k < 24; k++) { const g = (k / 24) * TAU; a.box(cx + R * 0.87 * m.cos(g) - 0.4, y + R * 0.87 * m.sin(g) - 0.4, z0 + H - cap + 3, cx + R * 0.87 * m.cos(g) + 0.4, y + R * 0.87 * m.sin(g) + 0.4, z0 + H - 4); }
  a.cyl(cx, y, z0 + H * 0.8, z0 + H * 0.84, R * 0.36, 16);                                           // valve cup
  a.box(cx - R * 0.3, a.YF, z0 + H * 0.8, cx + R * 0.3, a.YF + 4, z0 + H * 0.88);                    // spray window (front notch)
  a.circ(cx, y, R); a.circ(cx, y, R * 0.86, 'EQUIP-DETAIL');
  a.log('Added the domed base and rolled seams, the straight wall with a label band, a shoulder to the valve cup and a ribbed overcap with a spray notch (plan and 3D).');
}
/** open paint tin with lid and bail handle */
function paintTin(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 3, bh = H * 0.84, arch = H - bh;
  lathe(a, cx, y, [[z0, R * 0.92], [z0 + 2, R], [z0 + bh - 6, R], [z0 + bh - 4, R * 1.03], [z0 + bh - 2, R * 1.03], [z0 + bh - 1, R * 0.98]], 30);
  for (const f of [0.14, 0.52]) a.add(mv(torus(R * 1.0, 0.7, 30, 4), cx, y, z0 + bh * f));          // rolling hoops
  lathe(a, cx, y, [[z0 + bh * 0.2, R * 1.012], [z0 + bh * 0.46, R * 1.012]], 30);                    // label
  lathe(a, cx, y, [[z0 + bh - 1, R * 1.02], [z0 + bh, R * 1.02], [z0 + bh, R * 0.9], [z0 + bh - 0.5, R * 0.9]], 30);   // lid rim
  a.cyl(cx, y, z0 + bh, z0 + bh + 1.2, R * 0.86, 30); a.add(mv(torus(R * 0.7, 0.6, 28, 3), cx, y, z0 + bh + 1.2));
  for (const s of [-1, 1]) a.cyl(cx + s * R * 1.0, y, z0 + bh - 12, z0 + bh - 5, 2.4, 8);             // handle lugs
  const pts = [], rad = [];
  for (let i = 0; i <= 14; i++) { const t = (i / 14) * m.PI; pts.push([cx + R * 1.0 * m.cos(t), y, z0 + bh - 8 + (arch + 8 - 2.4) * m.sin(t)]); rad.push(1.3); }
  a.tube(pts, rad, 6);                                                                               // bail wire
  a.tube([[cx - R * 0.3, y, z0 + H - 2.6], [cx + R * 0.3, y, z0 + H - 2.6]], [3, 3], 10);              // plastic grip
  a.circ(cx, y, R); a.circ(cx, y, R * 0.86, 'EQUIP-DETAIL'); a.line(cx - R, y, cx + R, y, 'EQUIP-DETAIL');
  a.log('Added the straight-walled tin with rolling hoops and a label band, a pressed lid with a rim, two handle lugs and a wire bail with a plastic grip (plan and 3D).');
}
/** gable-top carton */
function gableCarton(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, y = a.cy, zb = z0 + H * 0.72, zt = z0 + H * 0.92, fin = H - (zt - z0);
  a.box(cx - W / 2, yF, z0, cx + W / 2, a.YB, zb);
  a.box(cx - W / 2 + 0.01, yF - 0.0, z0, cx - W / 2 + 0.02, yF, z0 + 0.01);
  prismX(a, [[yF, zb], [a.YB, zb], [y + 3, zt], [y - 3, zt]], cx - W / 2, cx + W / 2);                // gable roof
  a.box(cx - W / 2, y - 1.4, zt, cx + W / 2, y + 1.4, z0 + H);                                         // sealed fin
  for (const x of [-1, 1]) a.box(cx + x * W * 0.5 - (x > 0 ? 2 : 0), y - D * 0.5, zb, cx + x * W * 0.5 + (x < 0 ? 2 : 0), y + D * 0.5, zb + 0.0 + 0.5);
  const sy = yF + D * 0.28, sz = zb + (zt - zb) * ((sy - yF) / (y + 3 - yF)); a.cyl(cx + W * 0.2, sy, sz - 2, sz + 8, W * 0.16, 14); a.cyl(cx + W * 0.2, sy, sz + 8, sz + 9, W * 0.11, 14);   // pour cap
  for (let i = 0; i < 4; i++) a.box(cx - W * 0.34, yF, z0 + H * (0.12 + i * 0.12), cx + W * 0.34, yF + 2.2, z0 + H * (0.12 + i * 0.12) + 1.0);   // printed band lines
  a.box(cx - W / 2, yF, z0 + H * 0.02, cx + W / 2, yF + 0.5, z0 + H * 0.05);                         // base fold
  a.rect(cx - W / 2, yF, cx + W / 2, a.YB); a.line(cx - W / 2, y, cx + W / 2, y, 'EQUIP-DETAIL'); a.circ(cx + W * 0.2, sy, W * 0.16, 'EQUIP-DETAIL');
  a.log('Added the square body with printed band lines, a gable roof with a sealed fin along its ridge and a screw pour cap on the front slope (plan and 3D).');
}
/** steel food can with double seams, ribs and a pull-ring end */
function foodCan(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 0.3;
  lathe(a, cx, y, [[z0, R * 0.94], [z0 + 1.2, R], [z0 + 3, R * 1.0], [z0 + H - 3, R], [z0 + H - 1.2, R * 1.0], [z0 + H, R * 0.94]], 30);
  for (const z of [z0 + 1.6, z0 + H - 1.6]) a.add(mv(torus(R * 1.0, 1.1, 30, 4), cx, y, z));          // double seams
  const n = v.ribs; for (let i = 1; i <= n; i++) a.add(mv(torus(R * 0.99, 0.7, 30, 4), cx, y, z0 + H * (0.1 + (0.8 * i) / (n + 1)) - 0.0));
  lathe(a, cx, y, [[z0 + H * 0.2, R * 1.012], [z0 + H * 0.8, R * 1.012]], 30);                        // paper label
  a.cyl(cx, y, z0 + H - 1.4, z0 + H - 0.4, R * 0.84, 30);                                              // recessed end
  a.add(mv(torus(R * 0.84, 0.6, 30, 3), cx, y, z0 + H - 0.4));
  a.add(mv(torus(R * 0.22, 0.9, 18, 4), cx + R * 0.26, y, z0 + H - 0.2)); a.box(cx + R * 0.26 - R * 0.06, y - 1.0, z0 + H - 0.4, cx + R * 0.7, y + 1.0, z0 + H + 0.0);   // pull ring and tab
  a.circ(cx, y, R); a.circ(cx, y, R * 0.84, 'EQUIP-DETAIL'); a.circ(cx + R * 0.26, y, R * 0.22, 'EQUIP-DETAIL');
  a.log(`Added the steel body with double seams, ${n} bead ribs, a paper label band and a recessed pull-ring end (plan and 3D).`);
}
/** egg carton: tray of cups with eggs, hinged lid standing open at the back */
function eggCarton(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, cols = v.cols, rows = v.rows, trayD = D * 0.66, cw = (W - 8) / cols, rd = trayD / rows, th = H * 0.46;
  a.box(cx - W / 2, yF, z0 + th * 0.8, cx + W / 2, yF + trayD, z0 + th);                              // top rim sheet
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const ex = cx - W / 2 + 4 + (i + 0.5) * cw, ey = yF + (j + 0.5) * rd;
    a.cone(ex, ey, z0, z0 + th * 0.85, cw * 0.24, cw * 0.4, 14);                                       // cup
    a.ell(ex, ey, z0 + th * 0.85 + cw * 0.12, cw * 0.28, cw * 0.28, cw * 0.38, 14, 8);                  // egg
    a.cone(ex + cw / 2, ey + rd / 2 - rd / 2, z0 + th * 0.8, z0 + th + 6, cw * 0.1, 0.5, 6);              // separator post
  }
  a.box(cx - W / 2, a.YB - 3, z0, cx + W / 2, a.YB, z0 + H);                                          // lid standing open
  for (let i = 1; i < cols; i++) a.box(cx - W / 2 + (W * i) / cols - 1, a.YB - 4.2, z0 + H * 0.1, cx - W / 2 + (W * i) / cols + 1, a.YB - 3, z0 + H * 0.9);   // lid ribs
  a.box(cx - W / 2, a.YB - 9, z0, cx + W / 2, a.YB - 3, z0 + 3);                                       // hinge strip
  a.rect(cx - W / 2, yF, cx + W / 2, yF + trayD); a.rect(cx - W / 2, a.YB - 3, cx + W / 2, a.YB, 'EQUIP-DETAIL');
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) a.circ(cx - W / 2 + 4 + (i + 0.5) * cw, yF + (j + 0.5) * rd, cw * 0.3, 'EQUIP-DETAIL');
  a.log(`Added the tray of ${cols * rows} formed cups each holding an egg, separator posts and a lid standing open on a hinge strip (plan and 3D).`);
}
/** corrugated shipping carton: taped flaps, label, handle slots */
function shipCarton(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, y = a.cy;
  a.box(cx - W / 2, yF, z0, cx + W / 2, a.YB, z0 + H);
  a.box(cx - W / 2, y - 0.5, z0 + H - 0.01, cx + W / 2, y + 0.5, z0 + H);
  a.box(cx - W * 0.12, y - D / 2, z0 + H, cx + W * 0.12, y + D / 2, z0 + H + 0.0);
  a.box(cx - 25, yF, z0 + H - 0.01, cx + 25, a.YB, z0 + H);
  a.box(cx - 25, yF, z0 + H * 0.82, cx + 25, yF + 2.2, z0 + H);                                  // tape down the front
  a.box(cx - W * 0.4, yF, z0 + H * 0.3, cx + W * 0.1, yF + 2.2, z0 + H * 0.62);                        // shipping label
  for (let i = 0; i < 4; i++) a.box(cx - W * 0.36, yF - 2.2, z0 + H * (0.36 + i * 0.06), cx + W * 0.06, yF - 1.0, z0 + H * (0.36 + i * 0.06) + 1.0);
  for (const s of [-1, 1]) { const x = cx + s * W / 2; a.box(x - (s > 0 ? 0.6 : 0), y - D * 0.18, z0 + H * 0.66, x + (s < 0 ? 0.6 : 0), y + D * 0.18, z0 + H * 0.76); a.box(x - (s > 0 ? 0.6 : 0), y - D * 0.18, z0 + H * 0.76, x + (s < 0 ? 0.6 : 0), y + D * 0.18, z0 + H * 0.78); }   // handle slots
  for (let i = 0; i < 6; i++) a.box(cx - W / 2, yF + 0.0, z0 + H * (0.04 + i * 0.0), cx - W / 2 + 0.01, yF + 0.01, z0 + H * 0.04 + 0.01);
  a.box(cx - W / 2, yF, z0 + H * 0.04, cx + W / 2, yF + 2.2, z0 + H * 0.06);                      // bottom flap seam
  a.rect(cx - W / 2, yF, cx + W / 2, a.YB); a.line(cx - W / 2, y, cx + W / 2, y, 'EQUIP-DETAIL'); a.rect(cx - 25, yF, cx + 25, a.YB, 'EQUIP-DETAIL');
  a.log('Added the corrugated carton with a closed flap seam and packing tape, a shipping label with text lines, bottom seam and two hand-hold slots (plan and 3D).');
}
/** steel drum: chimes, rolling hoops, closed head with bungs or an open head with a lever ring */
function steelDrum(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 0.5;
  lathe(a, cx, y, [[z0, R * 0.9], [z0 + 3, R * 0.98], [z0 + 6, R], [z0 + H - 6, R], [z0 + H - 3, R * 0.98], [z0 + H - 1, R * 0.9]], 36);
  for (const z of [z0 + 2.5, z0 + H - 2.5]) a.add(mv(torus(R * 0.99, 2.2, 36, 4), cx, y, z));      // chime seams
  for (const f of [0.34, 0.66]) { a.add(mv(torus(R * 1.0, 1.8, 36, 4), cx, y, z0 + H * f)); a.add(mv(torus(R * 1.0, 1.2, 36, 4), cx, y, z0 + H * f + 7)); }   // rolling hoops
  if (v.open) {
    a.cyl(cx, y, z0 + H - 3, z0 + H - 0.5, R * 0.94, 36); a.add(mv(torus(R * 0.99, 3.4, 36, 4), cx, y, z0 + H - 4));   // lid and lock ring
    a.box(cx + R * 0.99 - 2, y - 14, z0 + H - 12, cx + R * 0.99 + 0.0, y + 14, z0 + H - 3);              // lever lug
    a.tube([[cx + R * 0.97, y, z0 + H - 7], [cx + R * 0.97, y, z0 + H - 28]].map(([x, yy, z]) => [x, yy, z]), [2, 2], 8);
  } else {
    a.cyl(cx, y, z0 + H - 3, z0 + H - 0.8, R * 0.9, 36);
    for (const [bx, by, br] of [[R * 0.4, 0, 0.14], [-R * 0.22, R * 0.3, 0.09]]) { a.cyl(cx + bx, y + by, z0 + H - 1, z0 + H, R * br * 1.3, 14); a.cyl(cx + bx, y + by, z0 + H, z0 + H + 0.01, R * br, 12); }
  }
  a.circ(cx, y, R); a.circ(cx, y, R * 0.9, 'EQUIP-DETAIL'); a.circ(cx, y, R * 0.7, 'EQUIP-HIDDEN');
  a.log('Added the steel body with chime seams and two rolling hoops, and ' + (v.open ? 'an open-head lid with a lock ring and lever lug' : 'a closed head with two threaded bungs') + ' (plan and 3D).');
}
/** pharmacy pill bottle with a child-resistant ribbed cap */
function pillBottle(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 0.3, ch = H * 0.3;
  lathe(a, cx, y, [[z0, R * 0.85], [z0 + 1.5, R * 0.97], [z0 + 3, R], [z0 + (H - ch) * 0.86, R], [z0 + (H - ch) * 0.98, R * 0.86], [z0 + H - ch, R * 0.8]], 28);
  lathe(a, cx, y, [[z0 + H * 0.1, R * 1.012], [z0 + (H - ch) * 0.78, R * 1.012]], 28);              // label wrap
  a.add(mv(torus(R * 0.82, 0.7, 24, 4), cx, y, z0 + H - ch + 0.4));
  lathe(a, cx, y, [[z0 + H - ch, R * 0.94], [z0 + H - ch + 1, R * 0.97], [z0 + H - 1, R * 0.97], [z0 + H, R * 0.9]], 28);
  for (let k = 0; k < 28; k++) { const g = (k / 28) * TAU; a.box(cx + R * 0.98 * m.cos(g) - 0.5, y + R * 0.98 * m.sin(g) - 0.5, z0 + H - ch + 2, cx + R * 0.98 * m.cos(g) + 0.5, y + R * 0.98 * m.sin(g) + 0.5, z0 + H - 2); }
  a.box(cx - 0.8, y - R * 0.6, z0 + H, cx + 0.8, y - R * 0.1, z0 + H - 0.01);                          // press-down arrow on top
  a.cyl(cx, y, z0 + H - 0.5, z0 + H, R * 0.5, 20);
  a.circ(cx, y, R); a.circ(cx, y, R * 0.97, 'EQUIP-DETAIL'); a.circ(cx, y, R * 0.5, 'EQUIP-DETAIL');
  a.log('Added the amber-style round body with a label wrap and neck ring and a ribbed child-resistant cap with a pressed top (plan and 3D).');
}
/** jerry can: flat body, three-bar handle, angled spout, pressed cross */
function jerryCan(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, y = a.cy, bh = H * 0.8;
  soft(a, cx, y, W, D, D * 0.14, z0, z0 + bh, 3, 2);
  for (const f of [0.4, 0.55, 0.7]) a.box(cx - W * 0.5, yF - 0.0, z0 + bh * f, cx + W * 0.5, yF + 0.5, z0 + bh * f + 0.7);   // moulded ribs across the face
  for (const [x0, x1] of [[-0.5, -0.26], [-0.12, 0.12], [0.26, 0.5]]) a.box(cx + x0 * W, y - D * 0.2, z0 + bh, cx + x1 * W, y + D * 0.2, z0 + H);   // three handle posts
  a.box(cx - W * 0.5, y - D * 0.2, z0 + H - H * 0.04, cx + W * 0.5, y + D * 0.2, z0 + H);              // handle top bar
  a.tube([[cx + W * 0.36, y, z0 + bh - 2], [cx + W * 0.4, y, z0 + bh + H * 0.1]].map(([x, yy, z]) => [x, yy, z]), [W * 0.07, W * 0.06], 10);   // fill neck
  a.cyl(cx + W * 0.4, y, z0 + bh + H * 0.08, z0 + bh + H * 0.12, W * 0.085, 12);
  a.tube([[cx - W * 0.34, y, z0 + bh], [cx - W * 0.3, y, z0 + bh + H * 0.06], [cx - W * 0.22, y, z0 + bh + H * 0.12]], [W * 0.05, W * 0.05, W * 0.04], 10);   // pouring spout
  a.tube([[cx - W * 0.3, yF + 1, z0 + bh * 0.2], [cx + W * 0.3, yF + 1, z0 + bh * 0.88]], [0.7, 0.7], 4); a.tube([[cx - W * 0.3, yF + 1, z0 + bh * 0.88], [cx + W * 0.3, yF + 1, z0 + bh * 0.2]], [0.7, 0.7], 4);   // pressed cross
  planRR(a, cx, y, W, D, D * 0.14); a.rect(cx - W * 0.5, y - D * 0.2, cx + W * 0.5, y + D * 0.2, 'EQUIP-DETAIL'); a.circ(cx + W * 0.4, y, W * 0.085, 'EQUIP-DETAIL');
  a.log('Added the flat softened body with moulded ribs and a pressed cross, a three-post carry handle, a fill neck with cap and an angled pouring spout (plan and 3D).');
}
/** tapered pail with a wire bail */
function pail(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 3, bh = H * 0.86, rb = R * 0.82, arch = H - bh;
  lathe(a, cx, y, [[z0, rb * 0.88], [z0 + 2, rb], [z0 + bh - 4, R * 0.98], [z0 + bh - 2, R], [z0 + bh, R]], 30);
  a.add(mv(torus(R * 1.0, 1.6, 30, 4), cx, y, z0 + bh));                                              // rolled rim
  for (const f of [0.3, 0.55]) a.add(mv(torus(rb + (R - rb) * f + 0.3, 0.8, 30, 4), cx, y, z0 + bh * f));   // stiffening ribs
  a.cyl(cx, y, z0, z0 + 1.6, rb * 0.7, 24);
  for (const s of [-1, 1]) { a.cyl(cx + s * R * 1.0, y, z0 + bh - 12, z0 + bh - 3, 3, 8); }            // ears
  const pts = [], rad = [];
  for (let i = 0; i <= 14; i++) { const t = (i / 14) * m.PI; pts.push([cx + R * 1.0 * m.cos(t), y, z0 + bh - 6 + (arch + 6 - 2.4) * m.sin(t)]); rad.push(1.4); }
  a.tube(pts, rad, 6); a.tube([[cx - R * 0.34, y, z0 + H - 3], [cx + R * 0.34, y, z0 + H - 3]], [3.2, 3.2], 10);   // bail and grip
  a.circ(cx, y, R); a.circ(cx, y, rb, 'EQUIP-DETAIL'); a.line(cx - R, y, cx + R, y, 'EQUIP-DETAIL');
  a.log('Added the tapered body with a rolled rim and two stiffening ribs, two ears and a wire bail with a plastic grip (plan and 3D).');
}

// ================================================================================================ ENCLOSURES
/** hex cable gland pointing down from z, length gl */
function gland(a, x, y, zTop, gl, r) {
  a.cyl(x, y, zTop - gl * 0.28, zTop, r * 1.15, 6); a.cyl(x, y, zTop - gl * 0.7, zTop - gl * 0.28, r * 0.92, 14); a.cone(x, y, zTop - gl, zTop - gl * 0.7, r * 0.5, r * 0.9, 14); a.cyl(x, y, zTop - gl - 0.01, zTop - gl, r * 0.3, 8);
}
/** wall-mount box: base, hinged flanged lid with screws and gasket, side ears, glands on the underside */
function wallBox(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, y = a.cy, gl = v.glands ? m.max(18, H * 0.1) : 0, bz = z0 + gl, ear = 12, bw = W - 2 * ear;
  a.box(cx - bw / 2, yF + 6, bz, cx + bw / 2, a.YB, z0 + H);                                              // base shell
  a.box(cx - bw / 2 - 0.0, yF + 0, bz, cx + bw / 2, yF + 6, z0 + H);                                      // lid
  a.box(cx - bw / 2 + 4, yF - 0.0, bz + 4, cx + bw / 2 - 4, yF + 0.01, z0 + H - 4);
  a.box(cx - bw / 2 - 0.5, yF + 5.6, bz - 0.0, cx + bw / 2 + 0.5, yF + 6.4, z0 + H);                       // gasket line / seam lip
  for (const s of [-1, 1]) { a.box(cx + s * (W / 2) - (s > 0 ? ear : 0), a.YB - 3, bz + 6, cx + s * W / 2 + (s < 0 ? ear : 0), a.YB, bz + 16); a.box(cx + s * (W / 2) - (s > 0 ? ear : 0), a.YB - 3, z0 + H - 16, cx + s * W / 2 + (s < 0 ? ear : 0), a.YB, z0 + H - 6); }   // mounting ears
  a.box(cx - bw / 2 + 12, yF - 2.4, bz + 12, cx + bw / 2 - 12, yF, z0 + H - 12);                                        // raised lid panel
  a.box(cx - bw * 0.22, yF - 3.4, z0 + H - 30, cx + bw * 0.22, yF - 2.4, z0 + H - 16);                                  // rating plate
  for (const [sx, sz] of [[-1, 0], [1, 0], [-1, 1], [1, 1]]) screwY(a, cx + sx * (bw / 2 - 7), sz ? z0 + H - 7 : bz + 7, yF, 3.2, 1.6);
  if (v.hinge) { for (const zz of [0.2, 0.8]) a.cyl(cx - bw / 2 - 1.5, yF + 3, bz + (z0 + H - bz) * zz - 6, bz + (z0 + H - bz) * zz + 6, 2.4, 8); a.box(cx + bw / 2 - 12, yF - 2, bz + (z0 + H - bz) * 0.45, cx + bw / 2, yF, bz + (z0 + H - bz) * 0.55); }
  for (let i = 0; i < v.glands; i++) gland(a, cx - bw / 2 + 14 + (i + 0.5) * ((bw - 28) / v.glands), yF + 6 + (D - 6) / 2, bz, gl, 6);
  a.outline(); a.rect(cx - bw / 2, yF, cx + bw / 2, yF + 6, 'EQUIP-DETAIL');
  for (const [sx, sy] of [[-1, 0], [1, 0]]) a.circ(cx + sx * (W / 2 - 6), a.YB - 1.5, 2, 'EQUIP-DETAIL');
  a.log(`Added the base shell with side mounting ears, a flanged lid with four slotted screws and a gasket line${v.hinge ? ', hinges and a latch' : ''} and ${v.glands} cable glands on the underside (plan and 3D).`);
}
/** enclosure with a viewing window that shows a circuit board with parts */
function windowBox(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, yB = a.YB, w = 5, fx = W * 0.08, fz = H * 0.1;
  a.box(cx - W / 2, yF, z0, cx + W / 2, yB, z0 + w); a.box(cx - W / 2, yF, z0 + H - w, cx + W / 2, yB, z0 + H);                 // bottom and top walls
  a.box(cx - W / 2, yF, z0, cx - W / 2 + w, yB, z0 + H); a.box(cx + W / 2 - w, yF, z0, cx + W / 2, yB, z0 + H);                  // side walls
  a.box(cx - W / 2, yB - 3, z0, cx + W / 2, yB, z0 + H);                                                                          // back wall
  a.box(cx - W / 2, yF, z0, cx + W / 2, yF + 3, z0 + fz); a.box(cx - W / 2, yF, z0 + H - fz, cx + W / 2, yF + 3, z0 + H);          // lid frame
  a.box(cx - W / 2, yF, z0 + fz, cx - W / 2 + fx, yF + 3, z0 + H - fz); a.box(cx + W / 2 - fx, yF, z0 + fz, cx + W / 2, yF + 3, z0 + H - fz);
  const bw = W - 2 * w - 8, by = yB - 3 - 5;                                                                                      // the board stands off the back wall
  a.box(cx - bw / 2, by, z0 + w + 4, cx + bw / 2, yB - 3, z0 + H - w - 4);
  for (let i = 0; i < v.parts; i++) {
    const px = cx - bw / 2 + ((i + 0.5) * bw) / v.parts, pz = z0 + w + 8 + (i % 3) * (H - 2 * w - 20) / 3, cw = bw / v.parts * 0.34;
    if (i % 2) a.ycyl(by - 12, by, px, pz + 8, cw * 0.7, 12); else a.box(px - cw, by - 6, pz, px + cw, by, pz + (H - 2 * w - 20) / 4);   // capacitor or chip
    a.box(px - cw * 0.5, by - 1.2, z0 + w + 4, px + cw * 0.5, by, z0 + H - w - 4);
  }
  for (const [sx, sz] of [[-1, 0], [1, 0], [-1, 1], [1, 1]]) screwY(a, cx + sx * (W / 2 - fx / 2), sz ? z0 + H - fz / 2 : z0 + fz / 2, yF, 2.6, 1.4);
  a.rect(cx - W / 2, yF, cx + W / 2, yB); a.rect(cx - W / 2 + fx, yF, cx + W / 2 - fx, yF + 3, 'EQUIP-DETAIL'); a.rect(cx - bw / 2, by, cx + bw / 2, yB - 3, 'EQUIP-DETAIL');
  a.log(`Added the walled box with a four-screw lid frame around an open window onto a board carrying ${v.parts} components (plan and 3D).`);
}
/** floor-standing control cabinet: plinth, door with lever latch, louvres, roof lip, lifting eyes */
function floorCabinet(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, pl = 3 * IN, rf = 10;
  a.box(cx - W * 0.46, yF + 8, z0, cx + W * 0.46, a.YB - 8, z0 + pl);                                     // plinth
  a.box(cx - W / 2, yF, z0 + pl, cx + W / 2, a.YB, z0 + H - rf);                                          // body
  a.box(cx - W / 2 - 0.0, yF, z0 + H - rf, cx + W / 2, a.YB, z0 + H);                                      // roof lip
  const dx = v.doors === 2 ? [[-0.5, -0.0], [0.0, 0.5]] : [[-0.5, 0.5]];
  for (const [d0, d1] of dx) {
    a.box(cx + d0 * W + (d0 < 0 ? 4 : 1.5), yF - 10, z0 + pl + 6, cx + d1 * W - (d1 > 0 ? 4 : 1.5), yF + 3, z0 + H - rf - 6);   // door
    slotsY(a, cx + d0 * W + 14, cx + d1 * W - 14, z0 + H - rf - 30, z0 + H - rf - 12, yF - 10, m.max(4, m.round((d1 - d0) * W / 24)), 7);     // louvres top
    slotsY(a, cx + d0 * W + 14, cx + d1 * W - 14, z0 + pl + 12, z0 + pl + 30, yF - 10, m.max(4, m.round((d1 - d0) * W / 24)), 7);
  }
  for (const [d0, d1] of dx) { const x0 = cx + d0 * W + (d0 < 0 ? 4 : 1.5) + 40, x1 = cx + d1 * W - (d1 > 0 ? 4 : 1.5) - 40, zA = z0 + pl + 60, zB = z0 + H - rf - 60; for (const [ax, az, bx, bz] of [[x0, zA, x1, zA + 14], [x0, zB - 14, x1, zB], [x0, zA, x0 + 14, zB], [x1 - 14, zA, x1, zB]]) a.box(ax, yF - 16, az, bx, yF - 10, bz); }   // raised door panel rim
  const lx = v.doors === 2 ? cx + 8 : cx + W * 0.36;
  a.box(lx - 4, yF - 18, z0 + H * 0.46, lx + 4, yF - 10, z0 + H * 0.54 + 28); a.ycyl(yF - 26, yF - 18, lx, z0 + H * 0.5, 8, 12); a.box(lx - 4, yF - 28, z0 + H * 0.5 - 4, lx + 60, yF - 20, z0 + H * 0.5 + 4);  // handle with lever
  a.box(cx + (v.doors === 2 ? -W * 0.5 + 10 : -W * 0.5 + 8), yF - 2, z0 + pl + 18, cx + (v.doors === 2 ? -W * 0.5 + 14 : -W * 0.5 + 12), yF, z0 + H - rf - 40);   // hinge side edge
  a.outline(); a.rect(cx - W * 0.5 + 3, yF, cx + W * 0.5 - 3, yF + 3, 'EQUIP-DETAIL'); if (v.doors === 2) a.line(cx, yF, cx, yF + 3, 'EQUIP-DETAIL');
  a.log(`Added the plinth, the body with a roof lip, ${v.doors === 2 ? 'two doors' : 'one door'} with top and bottom louvre slots, a lever handle and lifting eyes (plan and 3D).`);
}
/** ABS handheld enclosure: LCD opening, key grid, screw bosses, battery door, lanyard slot */
function handheldCase(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF;
  soft(a, cx, a.cy, W, D, W * 0.12, z0, z0 + H, 3);
  a.box(cx - W * 0.36, yF - 0.0, z0 + H * 0.56, cx + W * 0.36, yF + 1.0, z0 + H * 0.9); a.box(cx - W * 0.31, yF + 1.0, z0 + H * 0.6, cx + W * 0.31, yF + 1.4, z0 + H * 0.86);   // LCD frame and glass
  buttonsY(a, cx - W * 0.34, cx + W * 0.34, z0 + H * 0.1, z0 + H * 0.5, yF, 4, v.rows, W * 0.055, 1.4, true);
  for (const [sx, sz] of [[-1, 0], [1, 0], [-1, 1], [1, 1]]) screwY(a, cx + sx * (W / 2 - 5), sz ? z0 + H - 5 : z0 + 5, yF, 2.2, 1.2);
  a.box(cx - W * 0.3, a.YB - 1.2, z0 + H * 0.12, cx + W * 0.3, a.YB, z0 + H * 0.6);                    // battery door
  a.box(cx - W * 0.12, a.YB - 2, z0 + H * 0.6, cx + W * 0.12, a.YB - 0.6, z0 + H * 0.64);            // door latch
  a.tube([[cx + W * 0.38, a.cy, z0 + H - 0.5], [cx + W * 0.4, a.cy, z0 + H + 0.0]], [1, 1], 4);
  planRR(a, cx, a.cy, W, D, W * 0.12); a.rect(cx - W * 0.36, yF, cx + W * 0.36, yF + 1, 'EQUIP-DETAIL');
  a.log(`Added the softened shell with an LCD frame and glass, a 4 x ${v.rows} key grid, four corner screws, a battery door with latch on the back (plan and 3D).`);
}
/** rack chassis: 19 in front panel with ears, handles, vents, switch, LEDs, ports */
function rackChassis(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, ear = 0.75 * IN, bw = W - 2 * ear;
  a.box(cx - W / 2, yF, z0, cx + W / 2, yF + 3, z0 + H);                                                   // front panel with ears
  a.box(cx - bw / 2 + 2, yF + 3, z0 + 3, cx + bw / 2 - 2, a.YB, z0 + H - 3);                              // chassis body
  for (const s of [-1, 1]) for (let k = 0; k < (v.u > 1 ? 2 : 1); k++) { const zz = z0 + H * (v.u > 1 ? 0.2 + k * 0.6 : 0.5); a.box(cx + s * (W / 2 - ear / 2) - 3, yF - 0.6, zz - 4, cx + s * (W / 2 - ear / 2) + 3, yF, zz + 4); }   // ear slots
  for (const s of [-1, 1]) a.tube([[cx + s * (bw / 2 - 2), yF, z0 + H * 0.28], [cx + s * (bw / 2 - 2), yF - 18, z0 + H * 0.28], [cx + s * (bw / 2 - 2), yF - 18, z0 + H * 0.72], [cx + s * (bw / 2 - 2), yF, z0 + H * 0.72]].map(([x, yy, z]) => [x, m.max(yy, yF), z]), [2.4, 2.4, 2.4, 2.4], 8);
  slotsY(a, cx - bw * 0.4, cx - bw * 0.04, z0 + H * 0.2, z0 + H * 0.8, yF, 9, 3.4);                         // vent slots
  a.box(cx + bw * 0.1, yF - 0.6, z0 + H * 0.3, cx + bw * 0.34, yF, z0 + H * 0.7);                           // display strip
  for (let i = 0; i < 3; i++) circY(a, cx + bw * 0.4 + i * 0, yF, yF + 1.0, z0 + H * (0.25 + i * 0.25), 2, 8);
  for (let i = 0; i < 2 * v.u; i++) a.box(cx + bw * 0.46 - (i % 2) * 8, yF - 0.0, z0 + H * 0.2 + (i >> 1) * H * 0.22, cx + bw * 0.46 - (i % 2) * 8 + 6, yF + 0.6, z0 + H * 0.2 + (i >> 1) * H * 0.22 + 5);   // ports
  circY(a, cx - bw * 0.46, yF, yF + 1.6, z0 + H * 0.5, 4.5, 12);                                           // power switch
  a.rect(cx - W / 2, yF, cx + W / 2, yF + 3); a.rect(cx - bw / 2, yF + 3, cx + bw / 2, a.YB, 'EQUIP-DETAIL');
  a.log(`Added the ${v.u} U front panel with slotted ears, two handles, vent slots, a display strip, lamps, ports and a power switch over the chassis body (plan and 3D).`);
}
/** transport flight case: shell, lid seam, edge caps, butterfly latches, handles, casters */
function flightCase(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, y = a.cy, ch = v.wheels ? 70 : 0, bz = z0 + ch;
  soft(a, cx, y, W, D, 8, bz, z0 + H, 3);
  a.box(cx - W / 2 - 0.0, yF, bz + (H - ch) * 0.52, cx + W / 2, yF + 0.9, bz + (H - ch) * 0.56);        // lid seam strip
  a.box(cx - W / 2, a.YB - 0.9, bz + (H - ch) * 0.52, cx + W / 2, a.YB, bz + (H - ch) * 0.56);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [0, 1]) a.ell(cx + sx * (W / 2 - 9), y + sy * (D / 2 - 9), sz ? z0 + H - 9 : bz + 9, 9, 9, 9, 8, 5);   // ball corners
  for (const f of v.latches === 2 ? [0.3, 0.7] : [0.18, 0.5, 0.82]) { a.box(cx - 24 + (f - 0.5) * W, yF - 3, bz + (H - ch) * 0.64, cx + 24 + (f - 0.5) * W, yF + 2.4, bz + (H - ch) * 0.72); a.box(cx - 20 + (f - 0.5) * W, yF - 3, bz + (H - ch) * 0.34, cx + 20 + (f - 0.5) * W, yF + 2.4, bz + (H - ch) * 0.42); a.tube([[cx - 12 + (f - 0.5) * W, yF - 3.5, bz + (H - ch) * 0.64], [cx - 12 + (f - 0.5) * W, yF + 2.4, bz + (H - ch) * 0.42]], [1.4, 1.4], 6); a.tube([[cx + 12 + (f - 0.5) * W, yF - 3.5, bz + (H - ch) * 0.64], [cx + 12 + (f - 0.5) * W, yF - 3.5, bz + (H - ch) * 0.42]], [1.4, 1.4], 6); }
  for (const s of [-1, 1]) { a.box(cx + s * W / 2 - (s > 0 ? 4 : 0), y - 40, bz + (H - ch) * 0.46, cx + s * W / 2 + (s < 0 ? 4 : 0), y + 40, bz + (H - ch) * 0.58); }   // end handle plates
  a.tube([[cx - 30, y, z0 + H], [cx - 30, y, z0 + H - 0.01], [cx + 30, y, z0 + H - 0.01], [cx + 30, y, z0 + H]], [1, 1, 1, 1], 4);
  if (v.wheels) for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.caster(cx + sx * (W / 2 - 34), y + sy * (D / 2 - 34), ch);
  else for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.cyl(cx + sx * (W / 2 - 20), y + sy * (D / 2 - 20), z0, bz + 2, 9, 10);
  planRR(a, cx, y, W, D, 8); a.rect(cx - W / 2, yF, cx + W / 2, yF + 1, 'EQUIP-DETAIL');
  a.log(`Added the softened shell with ball corners, a lid seam, ${v.latches} butterfly latches, end handles${v.wheels ? ' and four swivel casters' : ' and four rubber feet'} (plan and 3D).`);
}
/** utility meter box: hood roof, window door, hasp, vents, hinges */
function meterBox(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, y = a.cy, rf = H * 0.1;
  a.box(cx - W / 2, yF + 6, z0, cx + W / 2, a.YB, z0 + H - rf);
  a.box(cx - W / 2 + 2, yF, z0 + 4, cx + W / 2 - 2, yF + 6, z0 + H - rf - 2);                               // door
  const wz0 = z0 + (H - rf) * 0.3, wz1 = z0 + (H - rf) * 0.86;
  a.box(cx - W * 0.3, yF - 0.0, wz0, cx + W * 0.3, yF + 1.0, wz1); a.box(cx - W * 0.25, yF + 1.0, wz0 + 4, cx + W * 0.25, yF + 1.6, wz1 - 4);   // viewing window
  prismX(a, [[yF - 0.0, z0 + H - rf], [a.YB, z0 + H - rf], [a.YB, z0 + H - rf * 0.3], [yF + 0.0, z0 + H]], cx - W / 2 - 0.0, cx + W / 2);          // sloping hood
  slotsY(a, cx - W * 0.3, cx + W * 0.3, z0 + 12, z0 + (H - rf) * 0.22, yF, m.max(5, m.round(W / 12)), 2);   // vents
  for (const zz of [0.2, 0.8]) a.cyl(cx - W / 2 + 4, yF + 3, z0 + (H - rf) * zz - 6, z0 + (H - rf) * zz + 6, 3, 8);   // hinges
  a.box(cx + W / 2 - 18, yF - 3, z0 + (H - rf) * 0.46, cx + W / 2 - 4, yF, z0 + (H - rf) * 0.58); a.tube([[cx + W / 2 - 11, yF - 3, z0 + (H - rf) * 0.46], [cx + W / 2 - 11, yF - 3, z0 + (H - rf) * 0.34], [cx + W / 2 - 18, yF - 3, z0 + (H - rf) * 0.34]].map(([x, yy, z]) => [x, m.max(yy, yF), z]), [1.8, 1.8, 1.8], 6);   // hasp and loop
  for (const s of [-1, 1]) a.cyl(cx + s * W * 0.3, y + D * 0.1, z0, z0 + 8, 6, 12);
  a.outline(); a.rect(cx - W / 2 + 2, yF, cx + W / 2 - 2, yF + 6, 'EQUIP-DETAIL');
  a.log('Added the box with a framed door and viewing window, a sloping hood, vent slots, two hinges, a hasp with a loop and conduit stubs (plan and 3D).');
}
/** push-button control station: 1-3 holes with buttons; the last is an emergency-stop mushroom if v.estop */
function buttonStation(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, n = v.n, pr = m.min(W / n * 0.26, H * 0.2);
  soft(a, cx, a.cy, W, D, 5, z0 + 14, z0 + H, 2);
  gland(a, cx, a.cy, z0 + 14, 14, 6);
  for (let i = 0; i < n; i++) {
    const px = cx - W / 2 + ((i + 0.5) * W) / n, pz = z0 + 14 + (H - 14) * (n === 3 ? 0.62 : 0.6), est = v.estop && i === n - 1;
    a.ycyl(yF - 4, yF, px, pz, pr * 1.2, 20); a.ycyl(yF - 4.4, yF - 4, px, pz, pr * 1.25, 20);                                              // collar and bezel
    if (est) { a.ycyl(yF - 6, yF - 4, px, pz, pr * 1.1, 22); a.ell(px, yF - 7, pz, pr * 1.15, 3.4, pr * 1.15, 22, 6); a.ycyl(yF - 2, yF, px, pz, pr * 1.55, 24); }   // mushroom head on a yellow backing
    else a.ycyl(yF - 6, yF - 4.4, px, pz, pr * 0.95, 20);
    a.box(px - pr * 1.2, yF - 0.0, pz - pr * 1.3 - 9, px + pr * 1.2, yF + 0.6, pz - pr * 1.3 - 5);                                           // legend plate
    a.circ(px, yF - 0, pr, 'EQUIP-DETAIL');
  }
  for (const [sx, sz] of [[-1, 0], [1, 0]]) screwY(a, cx + sx * (W / 2 - 5), z0 + H - 5, yF, 2, 1.2);
  planRR(a, cx, a.cy, W, D, 5); a.circ(cx, a.cy, 6, 'EQUIP-HIDDEN');
  a.log(`Added the softened box with ${n} button position${n > 1 ? 's' : ''} in bezels with legend plates${v.estop ? ' and a red mushroom emergency-stop button on a yellow backing' : ''}, two corner screws and a cable gland below (plan and 3D).`);
}
/** battery box: lid, vent caps, handle, terminals, hold-down strap */
function batteryBox(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, y = a.cy, bh = H * 0.78;
  soft(a, cx, y, W, D, 5, z0, z0 + bh, 2);
  a.box(cx - W / 2 - 0.0, yF, z0 + bh * 0.88, cx + W / 2, a.YB, z0 + bh);                                          // lid band
  a.box(cx - W * 0.46, yF, z0 + bh * 0.2, cx + W * 0.46, yF + 2.2, z0 + bh * 0.74);                           // label recess
  for (let i = 0; i < 6; i++) a.cyl(cx - W * 0.4 + (i + 0.5) * (W * 0.8 / 6), y, z0 + bh, z0 + bh + H * 0.06, 4, 10);   // cell vent caps
  for (const s of [-1, 1]) { a.cyl(cx + s * W * 0.38, yF + D * 0.2, z0 + bh, z0 + bh + H * 0.14, 5, 12); a.box(cx + s * W * 0.38 - 5, yF + D * 0.2 - 5, z0 + bh + H * 0.1, cx + s * W * 0.38 + 5, yF + D * 0.2 + 5, z0 + bh + H * 0.14); }   // terminal posts and clamps
  for (const s of [-1, 1]) a.box(cx + s * W * 0.3 - 3, y - 3, z0 + bh + H * 0.04, cx + s * W * 0.3 + 3, y + 3, z0 + H);   // handle posts
  a.box(cx - W * 0.3 - 3, y - 4, z0 + H - 6, cx + W * 0.3 + 3, y + 4, z0 + H);                                                // handle grip bar
  a.box(cx - W / 2 - 0.0, yF + D * 0.45, z0, cx - W / 2 + 6, yF + D * 0.55, z0 + bh); a.box(cx + W / 2 - 6, yF + D * 0.45, z0, cx + W / 2, yF + D * 0.55, z0 + bh);   // hold-down ribs
  planRR(a, cx, y, W, D, 5); for (let i = 0; i < 6; i++) a.circ(cx - W * 0.4 + (i + 0.5) * (W * 0.8 / 6), y, 4, 'EQUIP-DETAIL');
  a.log('Added the softened case with a lid band, six cell vent caps, two terminal posts with clamps, a carry handle, a label recess and side hold-down ribs (plan and 3D).');
}
/** surface consumer unit: deep door frame around an open window, a row of breakers, main switch */
function consumerUnit(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, t = 12, fd = 28;
  a.box(cx - W / 2, yF + fd, z0, cx + W / 2, a.YB, z0 + H);                                              // back box
  a.box(cx - W / 2, yF, z0, cx + W / 2, yF + fd, z0 + t); a.box(cx - W / 2, yF, z0 + H - t, cx + W / 2, yF + fd, z0 + H);   // frame walls
  a.box(cx - W / 2, yF, z0 + t, cx - W / 2 + t, yF + fd, z0 + H - t); a.box(cx + W / 2 - t, yF, z0 + t, cx + W / 2, yF + fd, z0 + H - t);
  const n = v.ways + 2, mw = (W - 2 * t - 8) / n, bz0 = z0 + H * 0.3, bz1 = z0 + H * 0.78;
  a.box(cx - W / 2 + t, yF + fd - 2, z0 + t, cx + W / 2 - t, yF + fd, z0 + H - t);                        // rail plate
  a.box(cx - W / 2 + t, yF + fd - 4, z0 + H * 0.5 - 3, cx + W / 2 - t, yF + fd - 2, z0 + H * 0.5 + 3);      // din rail
  for (let i = 0; i < n; i++) {
    const x0 = cx - W / 2 + t + 4 + i * mw, main = i < 2;
    a.box(x0 + 0.4, yF + 6, bz0, x0 + mw - 0.4, yF + fd - 2, bz1);                                         // breaker body
    a.box(x0 + mw * 0.28, yF + 3, (bz0 + bz1) / 2 - (main ? 9 : 5), x0 + mw * 0.72, yF + 6, (bz0 + bz1) / 2 + (main ? 9 : 5));   // toggle
    a.box(x0 + 1, yF + 6, bz0 - 4, x0 + mw - 1, yF + 7, bz0 - 1);                                           // circuit label
  }
  for (const zz of [0.2, 0.8]) a.cyl(cx - W / 2 + 4, yF + 3, z0 + H * zz - 6, z0 + H * zz + 6, 2.4, 8);
  a.outline(); a.rect(cx - W / 2 + t, yF, cx + W / 2 - t, yF + fd, 'EQUIP-DETAIL');
  a.log(`Added the back box with a deep door frame around an open window, a rail, a double-width main switch and ${v.ways} breaker modules with toggles and labels (plan and 3D).`);
}
/** sloped-front desktop console: wedge shell, tilted display, knob rows, button strip */
function wedgeConsole(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, yB = a.YB, hf = H * 0.26, sl = (y) => z0 + hf + (H - hf) * ((y - yF) / (yB - yF));
  prismX(a, [[yF, z0], [yB, z0], [yB, z0 + H], [yF, z0 + hf]], cx - W / 2, cx + W / 2);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.cyl(cx + sx * (W / 2 - 10), a.cy + sy * (D / 2 - 10), z0, z0 + 1.4, 5, 8);
  const yd0 = yF + D * 0.5, yd1 = yF + D * 0.88;
  prismX(a, [[yd0, sl(yd0) + 0.4], [yd1, sl(yd1) + 0.4], [yd1, sl(yd1) + 1.8], [yd0, sl(yd0) + 1.8]], cx - W * 0.3, cx + W * 0.3);     // tilted display
  const rows = v.rows;
  for (let r = 0; r < rows; r++) for (let i = 0; i < v.knobs; i++) { const kx = cx - W * 0.42 + ((i + 0.5) * W * 0.84) / v.knobs, ky = yF + D * (0.14 + r * 0.14); a.cyl(kx, ky, sl(ky), sl(ky) + 9, W * 0.025 + 3, 14); a.cyl(kx, ky, sl(ky) + 9, sl(ky) + 9.6, W * 0.02 + 2, 10); }
  for (let i = 0; i < 8; i++) { const bx = cx - W * 0.42 + i * (W * 0.84 / 8), by = yF + D * 0.38; a.box(bx + 2, by, sl(by) + 0.0, bx + W * 0.84 / 8 - 2, by + 8, sl(by + 8) + 3); }
  a.box(cx - W * 0.46, yB - 0.0, z0 + H - 4, cx + W * 0.46, yB, z0 + H);                                                                 // rear connector strip
  a.rect(cx - W / 2, yF, cx + W / 2, yB); a.rect(cx - W * 0.3, yd0, cx + W * 0.3, yd1, 'EQUIP-DETAIL'); a.line(cx - W / 2, yF + D * 0.38, cx + W / 2, yF + D * 0.38, 'EQUIP-DETAIL');
  a.log(`Added the wedge shell on four feet with a tilted display, ${rows} row${rows > 1 ? 's' : ''} of ${v.knobs} knobs and a strip of eight keys sitting on the sloped panel (plan and 3D).`);
}
/** wall key lock box: body, hinged cover, four code dials, release lever, shackle */
function keyLockBox(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, y = a.cy, sh = v.shackle ? H * 0.3 : 0, bz1 = z0 + H - sh;
  soft(a, cx, y, W, D, 4, z0, bz1, 2);
  a.box(cx - W * 0.44, yF - 0.0, z0 + (bz1 - z0) * 0.58, cx + W * 0.44, yF + 1.6, bz1 - 6);                                  // hinged cover plate
  a.box(cx - W * 0.4, yF - 0.0, z0 + 6, cx + W * 0.4, yF + 1.0, z0 + (bz1 - z0) * 0.5);                                      // dial bay
  for (let i = 0; i < 4; i++) { const dx = cx - W * 0.3 + i * W * 0.2; a.ycyl(yF - 4, yF + 1, dx, z0 + (bz1 - z0) * 0.26, W * 0.085, 18); for (let k = 0; k < 10; k++) { const g = (k / 10) * TAU; a.box(dx + m.cos(g) * W * 0.085 - 0.6, yF - 4.4, z0 + (bz1 - z0) * 0.26 + m.sin(g) * W * 0.085 - 0.6, dx + m.cos(g) * W * 0.085 + 0.6, yF - 4, z0 + (bz1 - z0) * 0.26 + m.sin(g) * W * 0.085 + 0.6); } }
  a.box(cx - W * 0.1, yF - 3, z0 + (bz1 - z0) * 0.7, cx + W * 0.1, yF, z0 + (bz1 - z0) * 0.78);                                // release lever
  if (v.shackle) { for (const s of [-1, 1]) a.cyl(cx + s * W * 0.3, y, bz1 - 2, z0 + H - 4, 3.2, 10); a.xcyl(cx - W * 0.3, cx + W * 0.3, y, z0 + H - 3.2, 3.2, 10); }
  for (const s of [-1, 1]) a.cyl(cx + s * W * 0.38, a.YB - 2, z0 + 6, z0 + 8, 2.4, 8);
  planRR(a, cx, y, W, D, 4); a.rect(cx - W * 0.44, yF, cx + W * 0.44, yF + 1.6, 'EQUIP-DETAIL');
  a.log('Added the softened body with a hinged cover, four ringed code dials in a dial bay, a release lever' + (v.shackle ? ' and a steel shackle' : '') + ' (plan and 3D).');
}

// ================================================================================================ families
/** every builder runs with its body face set 2.5 mm back, and thin details drawn flush on the face stand proud of it */
const relief = (fn, k = 2.5) => (a, v) => {
  a.YF += k; a.D -= k; a.cy = (a.YF + a.YB) / 2;
  const F = a.YF, ob = a.box.bind(a), oy = a.ycyl.bind(a);
  const P = pd(a);
  a.box = (x0, y0, z0, x1, y1, z1) => (y0 === F && y1 > F && y1 - F <= 2.5 ? ob(x0, F - m.max(y1 - F, P), z0, x1, F, z1) : ob(x0, y0, z0, x1, y1, z1));
  a.ycyl = (y0, y1, x, z, r, sg) => (y0 === F && y1 > F && y1 - F <= 2.5 ? oy(F - m.max(y1 - F, P), F, x, z, r, sg) : oy(y0, y1, x, z, r, sg));
  return fn(a, v);
};
const FAMS = [
  // ---- products (38)
  fam({ cat: 'industrial/products', title: 'Generic desk fan with wire guard', desc: (v) => `Desk fan with a ${v.dia} in wire guard: a round base and stem, a motor housing with hub, ${v.blades} blades and a guard with rings and spokes.`,
    vs: [[6, 6.6, 5.2, 9.6, 3], [8, 8.6, 6.4, 12.6, 3], [10, 10.6, 7.4, 14.8, 4], [12, 12.6, 8.4, 17.6, 5], [16, 16.6, 10, 22.6, 5]].map(([d, w, dp, h, b]) => VI(`${d} in guard, ${b} blades`, w, dp, h, { dia: d, blades: b })), build: deskFan }),
  fam({ cat: 'industrial/products', title: 'Generic tilt-head stand mixer', desc: (v) => `Stand mixer, ${v.qt} quart bowl: a soft base and rear column, a tilting head with attachment hub, a footed bowl with rim, a beater and a speed lever.`,
    vs: [VI('3.5 quart bowl', 8.2, 13, 13, { qt: 3.5 }), VI('5 quart bowl', 9, 14.5, 14.5, { qt: 5 }), VI('7 quart bowl', 10, 16, 16.5, { qt: 7 })], build: standMixer }),
  fam({ cat: 'industrial/products', title: 'Generic drip coffee maker', desc: (v) => `Drip coffee maker, ${v.cups} cup: a base with warming plate, a rear water column with level window and lid, a brew head with filter basket and a handled carafe.`,
    vs: [VI('5 cup', 7.5, 9, 11, { cups: 5 }), VI('10 cup', 9.5, 11, 13.5, { cups: 10 }), VI('12 cup', 10, 12, 14.5, { cups: 12 })], build: coffeeMaker }),
  fam({ cat: 'industrial/products', title: 'Generic ceiling pendant light', desc: (v) => `Ceiling pendant, ${v.dia} in ${v.shade} shade: a ceiling canopy, a cord with grip, the shade with a rim ring and a bulb inside.`,
    vs: [['dome shade, 8 in', 8, 8, 20, 66, { dia: 8, shade: 'dome', rise: 0.8 }], ['dome shade, 12 in', 12, 12, 22, 66, { dia: 12, shade: 'dome', rise: 0.7 }], ['cone shade, 16 in', 16, 16, 24, 66, { dia: 16, shade: 'cone', rise: 0.55 }], ['globe shade, 10 in', 10, 10, 22, 66, { dia: 10, shade: 'globe', rise: 1.8 }], ['globe shade, 14 in', 14, 14, 26, 66, { dia: 14, shade: 'globe', rise: 1.8 }]], build: pendant }),
  fam({ cat: 'industrial/products', title: 'Generic electric rice cooker', desc: (v) => `Rice cooker, ${v.cup} cup: a round pot body on a base, a domed lid with steam vent and latch, side handles and a front panel with two buttons and a lamp.`,
    vs: [VI('3 cup', 10, 10, 8.5, { cup: 3 }), VI('5.5 cup', 11.5, 11.5, 9.5, { cup: 5.5 }), VI('10 cup', 13.5, 13.5, 11, { cup: 10 })], build: riceCooker }),
  fam({ cat: 'industrial/products', title: 'Generic basket air fryer', desc: (v) => `Air fryer, ${v.qt} quart: a softened body on four feet with a front basket drawer and handle bar, a top display panel with a dial and rear exhaust slots.`,
    vs: [VI('2 quart', 9, 11, 10.5, { qt: 2 }), VI('4 quart', 10.5, 13, 12, { qt: 4 }), VI('6 quart', 12, 14.5, 13.5, { qt: 6 })], build: airFryer }),
  fam({ cat: 'industrial/products', title: 'Generic tower fan heater', desc: (v) => `Tower heater: a swivel base, a tall oval body with ${v.slots} grille slots in a recess, a control strip with three knobs and a rear carry handle.`,
    vs: [VI('desktop, 16 in', 6.5, 6, 16, { slots: 12 }), VI('standard, 22 in', 8, 7.5, 22, { slots: 16 }), VI('tall, 30 in', 9, 8.5, 30, { slots: 20 })], build: towerHeater }),
  fam({ cat: 'industrial/products', title: 'Generic steam clothes iron', desc: () => 'Clothes iron: a pointed soleplate, a shell with a loop handle, a fill cap, a temperature dial and a spray button.',
    vs: [VI('travel, 7.5 in', 7.5, 3.6, 4.2, {}), VI('standard, 10.5 in', 10.5, 5, 5.6, {}), VI('steam generator head, 11.5 in', 11.5, 5.4, 6.2, {})], build: clothesIron }),
  fam({ cat: 'industrial/products', title: 'Generic cool-mist humidifier', desc: (v) => `Cool-mist humidifier, ${v.l} litre tank: a round base with dial and lamp, a tapering tank with a rim ring, a domed lid and a raised mist nozzle.`,
    vs: [VI('1 litre tank', 6.5, 6.5, 11, { l: 1 }), VI('2.5 litre tank', 8, 8, 14, { l: 2.5 }), VI('4 litre tank', 9.5, 9.5, 17, { l: 4 })], build: humidifier }),
  fam({ cat: 'industrial/products', title: 'Generic twin-bell alarm clock', desc: (v) => `Alarm clock with a ${v.d} in face: a round case with bezel, hour marks and hands, two bells with a hammer, two legs and a back winding key.`,
    vs: [[3.5, 1.9, 4.5], [4.5, 2.3, 5.8], [5.5, 2.7, 7], [6.5, 3.1, 8.3]].map(([d, dp, h]) => VI(`${d} in face`, d, dp, h, { d })), build: alarmClock }),
  fam({ cat: 'industrial/products', title: 'Generic electric waffle maker', desc: (v) => `${v.sq ? 'Square' : 'Round'} waffle maker: a base on four feet, a hinged lid with a grid of ribs, a front handle, rear hinges and two indicator lamps.`,
    vs: [VI('round, 7 in plates', 9.4, 9.4, 3.6, { sq: false }), VI('square, 8 in plates', 11, 10.4, 3.8, { sq: true }), VI('round, 10 in plates', 12.4, 12.4, 4, { sq: false })], build: waffleMaker }),
  // ---- handheld (38)
  fam({ cat: 'industrial/handheld', title: 'Generic laser distance measure', desc: (v) => `Handheld laser measure: a rubber end bumper, a softened body with a display bezel, ${v.keys} keys, a main measure key and laser and receiver windows on the top end.`,
    vs: [VI('3 key, mini', 1.8, 1, 3.9, { keys: 3 }), VI('6 key, standard', 2.1, 1.2, 5, { keys: 6 }), VI('6 key, long body', 2.2, 1.3, 5.9, { keys: 6 }), VI('9 key, wide', 2.5, 1.4, 6.4, { keys: 9 })], build: laserMeasure }),
  fam({ cat: 'industrial/handheld', title: 'Generic infrared thermometer gun', desc: () => 'Infrared thermometer: a round barrel with a sensor nose, a rear display, a top mode key, an angled pistol grip with a base cap and a trigger.',
    vs: [VI('compact, 5.2 in', 5.2, 1.6, 4.6, {}), VI('standard, 6.3 in', 6.3, 1.9, 5.6, {}), VI('long range, 7.2 in', 7.2, 2.2, 6.2, {})], build: irThermo }),
  fam({ cat: 'industrial/handheld', title: 'Generic barcode scanner in cradle', desc: () => 'Barcode scanner resting in a cradle: a cradle base with a rear support and a front rest, a scanner body with an angled head and scan window, a grip, a trigger and a cable.',
    vs: [VI('compact, 6.5 in', 6.5, 3.4, 4.2, {}), VI('standard, 7.5 in', 7.5, 3.8, 4.8, {}), VI('long, 8.5 in', 8.5, 4.2, 5.4, {})], build: scannerCradle }),
  fam({ cat: 'industrial/handheld', title: 'Generic handheld vacuum cleaner', desc: (v) => `Handheld vacuum: a motor housing with vent slots, a ringed dust cup, a nozzle cone and flared mouth and a handle with a switch${v.crevice ? ', plus a clipped crevice tool' : ''}.`,
    vs: [VI('compact, 11 in', 11, 3.8, 5.2, { crevice: false }), VI('standard, 13 in', 13, 4.2, 5.8, { crevice: true }), VI('large cup, 15 in', 15, 4.8, 6.4, { crevice: true })], build: handVac }),
  fam({ cat: 'industrial/handheld', title: 'Generic electric shaver', desc: (v) => `Electric shaver: a grip body with grip lines, a power button, a display, a head carrier with ${v.heads} cutter head${v.heads > 1 ? 's' : ''} and a rear trimmer.`,
    vs: [VI('single foil head', 1.9, 1.4, 5.6, { heads: 1 }), VI('two heads', 2.7, 1.6, 5.8, { heads: 2 }), VI('three rotary heads', 2.9, 2.5, 6, { heads: 3 })], build: shaver }),
  fam({ cat: 'industrial/handheld', title: 'Generic electric toothbrush on charging base', desc: () => 'Electric toothbrush on its charger: a round base with a ring, a tapered handle with grip ring and button, a neck and a brush head with rows of bristle tufts.',
    vs: [VI('standard, 7.6 in', 2.1, 2.1, 7.6, {}), VI('long handle, 8.2 in', 2.2, 2.2, 8.2, {}), VI('wide base, 8.8 in', 2.6, 2.6, 8.8, {})], build: toothbrush }),
  fam({ cat: 'industrial/handheld', title: 'Generic handheld GPS unit', desc: () => 'Handheld GPS unit: a rounded body with a stub aerial, a screen in a bezel, a thumb pad, four keys, side grip ribs and a lanyard loop.',
    vs: [VI('compact, 5.2 in', 2.4, 1.3, 5.2, {}), VI('standard, 6 in', 2.6, 1.4, 6, {}), VI('large screen, 6.5 in', 3, 1.5, 6.5, {})], build: gpsUnit }),
  fam({ cat: 'industrial/handheld', title: 'Generic retractable tape measure', desc: (v) => `Tape measure, ${v.ft} ft: a rounded case with a rubber foot, a window, a lock slide and a belt clip, and an extended blade with graduations and an end hook.`,
    vs: [[16, 4.4, 1.4, 3], [25, 5, 1.9, 3.4], [33, 5.7, 2.1, 3.8], [50, 6.5, 2.4, 4.4]].map(([ft, w, d, h]) => VI(`${ft} ft`, w, d, h, { ft })), build: tapeMeasure }),
  fam({ cat: 'industrial/handheld', title: 'Generic hot glue gun', desc: () => 'Hot glue gun: a barrel with a glue stick at the rear and a tapered nozzle, a handle with a trigger and a fold-out wire stand.',
    vs: [VI('mini, 5.5 in', 5.5, 1.8, 4.8, {}), VI('standard, 8 in', 8, 2.2, 6.5, {}), VI('long barrel, 9.5 in', 9.5, 2.6, 7.4, {})], build: glueGun }),
  fam({ cat: 'industrial/handheld', title: 'Generic rugged handheld terminal', desc: (v) => `Rugged terminal: a rounded body with corner bumpers, a front screen${v.rows ? ` and a 4 x ${v.rows} keypad` : ' and a few keys'}, a scan head, a side trigger and a rear strap plate.`,
    vs: [VI('touch screen, 6.2 in', 3.2, 1, 6.2, { rows: 0 }), VI('3 row keypad, 6.8 in', 3.1, 1.1, 6.8, { rows: 3 }), VI('4 row keypad, 7.6 in', 3.2, 1.2, 7.6, { rows: 4 })], build: ruggedTerminal }),
  fam({ cat: 'industrial/handheld', title: 'Generic action camera on mount', desc: () => 'Action camera: a rounded cube body with a ringed lens, a front status screen, a shutter pad, a side latch and a two-prong mount foot with a pin.',
    vs: [VI('small, 2.3 in', 2, 1.2, 2.3, {}), VI('standard, 2.7 in', 2.4, 1.3, 2.7, {}), VI('large, 3 in', 2.8, 1.5, 3, {})], build: actionCam }),
  fam({ cat: 'industrial/handheld', title: 'Generic handheld bullhorn', desc: () => 'Bullhorn: a flared horn with a rolled bell rim, a rear body with a volume knob, a pistol grip with a trigger and a strap loop.',
    vs: [VI('small, 8 in', 8, 4.4, 4.4, {}), VI('medium, 11 in', 11, 6, 6, {}), VI('large, 14 in', 14, 8, 8, {})], build: bullhorn }),
  // ---- packaging (37)
  fam({ cat: 'industrial/packaging', title: 'Generic wine bottle', desc: (v) => `Glass wine bottle, ${v.sz}: a lathed body with a pushed-up base, a label band, a ${v.sh > 0.5 ? 'high' : 'sloping'} shoulder, a lipped neck and a foil capsule.`,
    vs: [['straight shoulder, 750 ml', 3, 3, 11.8, 0, { sz: '750 ml', sh: 0.52, nk: 0.36 }], ['sloping shoulder, 750 ml', 3.1, 3.1, 12.4, 0, { sz: '750 ml', sh: 0.4, nk: 0.34 }], ['half bottle, 375 ml', 2.6, 2.6, 9.6, 0, { sz: '375 ml', sh: 0.5, nk: 0.38 }], ['large format, 1.5 litre', 3.8, 3.8, 15.5, 0, { sz: '1.5 litre', sh: 0.5, nk: 0.34 }]], build: wineBottle }),
  fam({ cat: 'industrial/packaging', title: 'Generic aerosol spray can', desc: () => 'Aerosol can: a domed base and rolled seams, a straight wall with a label band, a shoulder to the valve cup and a ribbed overcap with a spray notch.',
    vs: [VI('short, 5.6 in', 1.9, 1.9, 5.6, {}), VI('standard, 7 in', 2.2, 2.2, 7, {}), VI('tall, 8.6 in', 2.6, 2.6, 8.6, {})], build: aerosol }),
  fam({ cat: 'industrial/packaging', title: 'Generic paint tin with bail', desc: (v) => `Paint tin, ${v.cap}: a straight-walled tin with rolling hoops and a label band, a pressed lid with a rim, two lugs and a wire bail with a plastic grip.`,
    vs: [['0.5 litre', 3.9, 3.9, 5.1, 0, { cap: '0.5 litre' }], ['1 litre', 4.8, 4.8, 6.3, 0, { cap: '1 litre' }], ['2.5 litre', 6.7, 6.7, 8.8, 0, { cap: '2.5 litre' }], ['5 litre', 8.3, 8.3, 10.8, 0, { cap: '5 litre' }]], build: paintTin }),
  fam({ cat: 'industrial/packaging', title: 'Generic gable-top milk carton', desc: () => 'Gable-top carton: a square body with printed band lines, a gable roof with a sealed fin along its ridge and a screw pour cap on the front slope.',
    vs: [VI('half pint', 2, 2, 4.8, {}), VI('1 pint', 2.8, 2.8, 6, {}), VI('1 quart', 3.1, 3.1, 7.3, {}), VI('half gallon', 3.8, 3.8, 9.4, {})], build: gableCarton }),
  fam({ cat: 'industrial/packaging', title: 'Generic steel food can', desc: (v) => `Steel food can, ${v.oz}: a body with double seams, ${v.ribs} bead ribs, a paper label band and a recessed pull-ring end.`,
    vs: [VI('flat, 5 oz', 2.9, 2.9, 1.5, { oz: '5 oz', ribs: 0 }), VI('small, 8 oz', 2.6, 2.6, 3, { oz: '8 oz', ribs: 2 }), VI('standard, 15 oz', 3, 3, 4.1, { oz: '15 oz', ribs: 3 }), VI('large, 28 oz', 4.1, 4.1, 4.8, { oz: '28 oz', ribs: 3 })], build: foodCan }),
  fam({ cat: 'industrial/packaging', title: 'Generic egg carton with open lid', desc: (v) => `Egg carton: a tray of ${v.cols * v.rows} formed cups each holding an egg, separator posts and a lid standing open on a hinge strip.`,
    vs: [VI('half dozen', 6.4, 6.4, 4.4, { cols: 3, rows: 2 }), VI('dozen', 12.4, 6.4, 4.4, { cols: 6, rows: 2 }), VI('18 eggs', 12.4, 9.4, 6.4, { cols: 6, rows: 3 })], build: eggCarton }),
  fam({ cat: 'industrial/packaging', title: 'Generic corrugated shipping carton', desc: () => 'Corrugated carton: a closed flap seam with packing tape down the front, a shipping label with text lines, a bottom seam and two hand-hold slots.',
    vs: [VI('small, 8 x 6 x 4 in', 8, 6, 4, {}), VI('medium, 14 x 10 x 8 in', 14, 10, 8, {}), VI('large, 20 x 16 x 12 in', 20, 16, 12, {})], build: shipCarton }),
  fam({ cat: 'industrial/packaging', title: 'Generic steel storage drum', desc: (v) => `Steel drum, ${v.gal} gallon: a body with chime seams and two rolling hoops, and ${v.open ? 'an open-head lid with a lock ring and lever lug' : 'a closed head with two threaded bungs'}.`,
    vs: [['15 gallon, open head', 15, 15, 22, 0, { gal: 15, open: true }], ['30 gallon, open head', 18.5, 18.5, 27.5, 0, { gal: 30, open: true }], ['55 gallon, closed head', 23, 23, 34.5, 0, { gal: 55, open: false }]], build: steelDrum }),
  fam({ cat: 'industrial/packaging', title: 'Generic pharmacy pill bottle', desc: () => 'Pill bottle: a round body with a label wrap and neck ring, and a ribbed child-resistant cap with a pressed top.',
    vs: [VI('small, 2.4 in', 1.3, 1.3, 2.4, {}), VI('medium, 3.1 in', 1.7, 1.7, 3.1, {}), VI('large, 4.6 in', 2.3, 2.3, 4.6, {})], build: pillBottle }),
  fam({ cat: 'industrial/packaging', title: 'Generic plastic jerry can', desc: (v) => `Jerry can, ${v.l} litre: a flat softened body with moulded ribs and a pressed cross, a three-post carry handle, a fill neck with cap and an angled pouring spout.`,
    vs: [VI('5 litre', 8.5, 4.5, 12, { l: 5 }), VI('10 litre', 11.5, 5.5, 14.5, { l: 10 }), VI('20 litre', 13.5, 6.5, 18, { l: 20 })], build: jerryCan }),
  fam({ cat: 'industrial/packaging', title: 'Generic tapered bucket pail', desc: (v) => `Pail, ${v.l} litre: a tapered body with a rolled rim and two stiffening ribs, two ears and a wire bail with a plastic grip.`,
    vs: [VI('5 litre', 8.2, 8.2, 8.4, { l: 5 }), VI('10 litre', 10.2, 10.2, 10.6, { l: 10 }), VI('20 litre', 12.6, 12.6, 15.2, { l: 20 })], build: pail }),
  // ---- enclosures (37)
  fam({ cat: 'industrial/enclosures', title: 'Generic wall box with cable glands', desc: (v) => `Wall-mount box: a base shell with side mounting ears, a flanged lid with four slotted screws and a gasket line${v.hinge ? ', hinges and a latch' : ''} and ${v.glands} cable glands underneath.`,
    vs: [VI('6 x 6 in, 2 glands', 6.8, 3.4, 7, { glands: 2, hinge: false }), VI('8 x 8 in, 3 glands', 8.8, 4, 9, { glands: 3, hinge: false }), VI('12 x 10 in, hinged, 3 glands', 12.8, 5.5, 11.2, { glands: 3, hinge: true }), VI('16 x 12 in, hinged, 4 glands', 16.8, 6.5, 13.2, { glands: 4, hinge: true })], build: wallBox }),
  fam({ cat: 'industrial/enclosures', title: 'Generic enclosure with viewing window', desc: (v) => `Box with a four-screw lid frame around an open window onto a board carrying ${v.parts} components.`,
    vs: [VI('small, 5 x 3.5 in', 5, 2.4, 3.5, { parts: 4 }), VI('medium, 7 x 4.5 in', 7, 2.8, 4.5, { parts: 5 }), VI('large, 9 x 6 in', 9, 3.2, 6, { parts: 6 })], build: windowBox }),
  fam({ cat: 'industrial/enclosures', title: 'Generic floor-standing control cabinet', desc: (v) => `Control cabinet: a plinth, a body with a roof lip, ${v.doors === 2 ? 'two doors' : 'one door'} with top and bottom louvre slots and a lever handle.`,
    vs: [VI('one door, 24 x 16 x 72 in', 24, 16, 72, { doors: 1 }), VI('one door, 32 x 20 x 72 in', 32, 20, 72, { doors: 1 }), VI('two doors, 48 x 24 x 80 in', 48, 24, 80, { doors: 2 })], build: floorCabinet }),
  fam({ cat: 'industrial/enclosures', title: 'Generic handheld device housing', desc: (v) => `Handheld housing: a softened shell with an LCD frame and glass, a 4 x ${v.rows} key grid, four corner screws and a battery door with latch on the back.`,
    vs: [VI('small, 2 key rows', 3, 1.1, 5.6, { rows: 2 }), VI('medium, 3 key rows', 3.6, 1.3, 6.8, { rows: 3 }), VI('large, 3 key rows', 4.2, 1.5, 7.6, { rows: 3 })], build: handheldCase }),
  fam({ cat: 'industrial/enclosures', title: 'Generic rack-mount instrument chassis', desc: (v) => `Rack chassis, ${v.u} U: a front panel with slotted ears, two handles, vent slots, a display strip, lamps, ports and a power switch over the chassis body.`,
    vs: [VI('1 U, 19 in', 19, 14, 1.75, { u: 1 }), VI('2 U, 19 in', 19, 16, 3.5, { u: 2 }), VI('3 U, 19 in', 19, 18, 5.25, { u: 3 })], build: rackChassis }),
  fam({ cat: 'industrial/enclosures', title: 'Generic wheeled flight case', desc: (v) => `Transport case: a softened shell with ball corners, a lid seam, ${v.latches} butterfly latches, end handles${v.wheels ? ' and four swivel casters' : ' and four rubber feet'}.`,
    vs: [VI('carry, 24 x 16 x 14 in', 24, 16, 14, { latches: 2, wheels: false }), VI('medium on casters, 30 x 18 x 20 in', 30, 18, 20, { latches: 2, wheels: true }), VI('large on casters, 36 x 24 x 24 in', 36, 24, 24, { latches: 3, wheels: true }), VI('long on casters, 48 x 20 x 22 in', 48, 20, 22, { latches: 3, wheels: true })], build: flightCase }),
  fam({ cat: 'industrial/enclosures', title: 'Generic utility meter box with hood', desc: () => 'Meter box: a body with a framed door and viewing window, a sloping hood, vent slots, two hinges, a hasp with a loop and conduit stubs.',
    vs: [VI('small, 12 x 7 x 16 in', 12, 7, 16, {}), VI('medium, 16 x 9 x 20 in', 16, 9, 20, {}), VI('large, 20 x 10 x 26 in', 20, 10, 26, {})], build: meterBox }),
  fam({ cat: 'industrial/enclosures', title: 'Generic push-button control station', desc: (v) => `Control station: a softened box with ${v.n} button position${v.n > 1 ? 's' : ''} in bezels with legend plates${v.estop ? ' and a red mushroom emergency-stop button' : ''}, corner screws and a cable gland below.`,
    vs: [VI('one button', 2.6, 2.6, 4.6, { n: 1, estop: false }), VI('two buttons with stop', 4.4, 2.6, 4.6, { n: 2, estop: true }), VI('three buttons with stop', 6.2, 2.6, 4.6, { n: 3, estop: true })], build: buttonStation }),
  fam({ cat: 'industrial/enclosures', title: 'Generic battery box with handle', desc: () => 'Battery box: a softened case with a lid band, six cell vent caps, two terminal posts with clamps, a carry handle, a label recess and side hold-down ribs.',
    vs: [VI('small, 7 x 5 in', 7, 5, 7.2, {}), VI('medium, 9 x 6.5 in', 9, 6.5, 8.8, {}), VI('large, 12 x 7 in', 12, 7, 9.8, {})], build: batteryBox }),
  fam({ cat: 'industrial/enclosures', title: 'Generic surface consumer unit', desc: (v) => `Consumer unit: a box with a door frame around an open window, a rail plate, a double-width main switch and ${v.ways} breaker modules with toggles.`,
    vs: [VI('4 way', 5.8, 2.6, 8.6, { ways: 4 }), VI('8 way', 8.6, 2.6, 8.6, { ways: 8 }), VI('12 way', 11.4, 2.6, 8.6, { ways: 12 })], build: consumerUnit }),
  fam({ cat: 'industrial/enclosures', title: 'Generic sloped-front desktop console', desc: (v) => `Wedge console: a sloped shell on four feet with a tilted display, ${v.rows} row${v.rows > 1 ? 's' : ''} of ${v.knobs} knobs and a strip of eight keys on the sloped panel.`,
    vs: [VI('small, 4 knobs', 8, 7, 3, { knobs: 4, rows: 1 }), VI('medium, 6 knobs', 12, 9, 3.6, { knobs: 6, rows: 2 }), VI('large, 8 knobs', 16, 11, 4.2, { knobs: 8, rows: 2 })], build: wedgeConsole }),
  fam({ cat: 'industrial/enclosures', title: 'Generic wall key lock box', desc: (v) => `Key lock box: a softened body with a hinged cover, four ringed code dials in a dial bay, a release lever${v.shackle ? ' and a steel shackle' : ''}.`,
    vs: [VI('wall mount', 3.4, 1.6, 4.8, { shackle: false }), VI('with shackle', 3.4, 1.6, 7, { shackle: true })], build: keyLockBox }),
];
export default FAMS.map((f) => ({ ...f, build: relief(f.build) }));

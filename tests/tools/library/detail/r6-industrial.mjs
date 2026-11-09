/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, industrial design: consumer products, handheld devices, packaging and enclosures. Original geometry; generic designed forms by type and size.
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
const slotsY = (a, x0, x1, z0, z1, y, n, w = 1.4) => { for (let i = 0; i < n; i++) { const x = x0 + ((x1 - x0) * (i + 0.5)) / n; a.box(x - w / 2, y - 1.6, z0, x + w / 2, y, z1); } };
/** rows and columns of small round buttons on the front plane */
function buttonsY(a, x0, x1, z0, z1, y, cols, rows, r = 3, h = 1.6, sq = false) {
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const x = x0 + ((x1 - x0) * (i + 0.5)) / cols, z = z0 + ((z1 - z0) * (j + 0.5)) / rows; if (sq) a.box(x - r, y - h, z - r * 0.8, x + r, y, z + r * 0.8); else a.ycyl(y - h, y, x, z, r, 10); }
}
const mm = (inch) => inch * IN;

// ================================================================================================ PRODUCTS
/** portable cylinder speaker, standing: v.dia, v.h in inches */
function cylSpeaker(a, v) {
  const cx = a.cx, cy = a.cy, R = a.W / 2 - 0.5, H = a.H, z0 = a.Z0;
  a.cyl(cx, cy, z0, z0 + 6, R * 0.94, 24);                                                // rubber base ring
  lathe(a, cx, cy, [[z0 + 6, R], [z0 + 8, R], [z0 + H - 10, R], [z0 + H - 8, R * 0.98]], 28);       // shell
  lathe(a, cx, cy, [[z0 + 12, R * 1.015], [z0 + H - 18, R * 1.015]], 28);                            // grille sleeve
  for (let i = 1; i < 9; i++) { const z = z0 + 12 + ((H - 30) * i) / 9; a.add(mv(torus(R * 1.02, 0.5, 28, 3), cx, cy, z)); }   // grille rows
  lathe(a, cx, cy, [[z0 + H - 8, R], [z0 + H - 4, R * 0.96], [z0 + H, R * 0.9]], 24);               // top cap
  for (let k = 0; k < 3; k++) a.cyl(cx + (k - 1) * R * 0.45, cy, z0 + H, z0 + H + 0.01, 0.01, 3);
  for (let k = -1; k <= 1; k++) a.cyl(cx + k * R * 0.42, cy - R * 0.1, z0 + H - 5, z0 + H, R * 0.15, 10);   // three top buttons (stay inside the box)
  a.circ(cx, cy, R); a.circ(cx, cy, R * 0.92, 'EQUIP-DETAIL');
  for (let k = -1; k <= 1; k++) a.circ(cx + k * R * 0.42, cy - R * 0.1, R * 0.15, 'EQUIP-DETAIL');
  a.log('Added the rubber base ring, the round grille shell with its ring rows, a top cap with three buttons (plan and 3D).');
}
/** desk lamp: round base, two arms, conical shade; v.reach in mm, v.h */
function deskLamp(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, br = m.min(a.W, a.D) * 0.24;
  a.cyl(cx - a.W * 0.28, y, z0, z0 + 14, br, 28); const bx = cx - a.W * 0.28;
  a.cyl(bx, y, z0 + 14, z0 + 22, br * 0.35, 14); a.ell(bx, y, z0 + 24, 12, 12, 12, 10, 6);
  const k1 = [bx + a.W * 0.18, y, z0 + H * 0.58], k2 = [bx + a.W * 0.42, y, z0 + H * 0.84];
  a.tube([[bx, y, z0 + 24], k1], [4, 4], 8); a.tube([[bx + 3, y, z0 + 30], [k1[0] + 3, y, k1[2] + 2]], [3, 3], 6);
  a.tube([k1, k2], [4, 4], 8); a.ell(...k1, 9, 9, 9, 10, 6); a.ell(...k2, 8, 8, 8, 10, 6);
  a.tube([k2, [k2[0] + a.W * 0.1, y, k2[2] - H * 0.02]], [4, 4], 8);
  const hx = k2[0] + a.W * 0.1, hz = k2[2] - H * 0.02, sh = H * 0.13, sr = a.W * 0.13;
  a.add(TUBE([[hx + sh * 0.5, y, hz + sh * 0.2], [hx - sh * 0.1, y, hz - sh * 0.1]], [sr * 0.35, sr], 20));   // head, tilted shade
  a.ell(hx + sh * 0.3, y, hz + sh * 0.1, 10, 10, 10, 8, 5);
  a.circ(bx, y, br); a.line(bx, y, hx, y, 'EQUIP-DETAIL'); a.circ(hx, y, sr, 'EQUIP-DETAIL');
  a.log('Added the weighted round base, a two-section jointed arm with ball joints and the tilted conical shade (plan and 3D).');
}
/** cordless jug kettle: v.dia (base), v.h */
function kettle(a, v) {
  const cx = a.cx - a.W * 0.04, y = a.cy, z0 = a.Z0, H = a.H, R = a.D * 0.46, Rt = R * 0.78;
  a.cyl(cx, y, z0, z0 + 12, R * 1.08, 28);                                                     // power base
  a.add(mv(torus(R * 1.0, 1.2, 28, 4), cx, y, z0 + 12));
  lathe(a, cx, y, [[z0 + 12, R * 0.98], [z0 + 18, R], [z0 + H * 0.55, R * 0.96], [z0 + H * 0.86, Rt], [z0 + H * 0.9, Rt * 0.9]], 26);   // body
  lathe(a, cx, y, [[z0 + H * 0.9, Rt * 0.96], [z0 + H * 0.93, Rt * 0.94], [z0 + H * 0.965, Rt * 0.55]], 26);                        // lid dome
  a.cyl(cx, y, z0 + H * 0.965, z0 + H, Rt * 0.18, 12);                                          // lid knob
  a.ell(cx, y, z0 + H - 1.5, Rt * 0.26, Rt * 0.26, 3, 10, 4);
  a.box(cx - R * 0.14, y - R - 1.2, z0 + H * 0.2, cx + R * 0.14, y - R * 0.5, z0 + H * 0.78);        // water window
  const sx = cx - R, sz = z0 + H * 0.8;                                                           // spout toward the left
  a.add(rotY(TUBE([[0, 0, 0], [0, 0, R * 0.5]], [R * 0.34, R * 0.1], 14), -m.PI / 2 * 0.9).map((q) => q.map(([x, yy, zz]) => [x + cx - R * 0.55, yy + y, zz + sz - R * 0.1])));
  const hx = cx + R * 0.95;                                                                      // C handle on the right
  a.tube([[hx - R * 0.15, y, z0 + H * 0.84], [hx + R * 0.45, y, z0 + H * 0.82], [hx + R * 0.52, y, z0 + H * 0.5], [hx + R * 0.2, y, z0 + H * 0.2]], [R * 0.09, R * 0.12, R * 0.12, R * 0.1], 8);
  a.box(hx + R * 0.1, y - 2, z0 + H * 0.84, hx + R * 0.45, y + 2, z0 + H * 0.865);              // thumb switch
  a.circ(cx, y, R); a.circ(cx, y, R * 1.08, 'EQUIP-DETAIL'); a.line(cx + R * 0.9, y, cx + R * 1.4, y, 'EQUIP-DETAIL'); a.circ(cx, y, Rt * 0.55, 'EQUIP-DETAIL');
  a.log('Added the round power base, the tapering body with water window, lid and knob, the pouring spout, a C handle and a switch (plan and 3D).');
}
/** table radio: speaker grille left, dial window right, two knobs, telescopic aerial; v.handle */
function radio(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF;
  a.box(cx - W * 0.4, yF + 3, z0, cx + W * 0.4, yF + 6, z0 + 3); a.add(0 ? [] : []);
  soft(a, cx, a.cy, W, D, 12, z0 + 3, z0 + H - (v.handle ? 22 : 12), 5);
  const zt = z0 + H - (v.handle ? 22 : 12);
  a.box(cx - W * 0.46, a.cy - D / 2 + 2, z0 + 3, cx + W * 0.46, a.cy - D / 2 + 2.01, z0 + 3.01);
  slotsY(a, cx - W * 0.44, cx - W * 0.04, z0 + H * 0.2, zt - H * 0.18, yF, 14, 2.0);                     // speaker slots
  a.box(cx + W * 0.02, yF - 1.2, z0 + H * 0.52, cx + W * 0.42, yF, zt - H * 0.12);                         // dial window
  for (let i = 0; i <= 8; i++) a.box(cx + W * 0.04 + (W * 0.36 * i) / 8 - 0.4, yF - 0.8, z0 + H * 0.56, cx + W * 0.04 + (W * 0.36 * i) / 8 + 0.4, yF - 0.2, z0 + H * 0.56 + (i % 2 ? 6 : 10));
  a.box(cx + W * 0.1, yF - 1.6, z0 + H * 0.55, cx + W * 0.11, yF - 0.8, zt - H * 0.14);                           // needle
  for (const k of [0.14, 0.34]) { a.ycyl(yF - 6, yF + 1, cx + W * k, z0 + H * 0.28, H * 0.09, 14); a.ycyl(yF - 7, yF - 6, cx + W * k, z0 + H * 0.28, H * 0.07, 14); }
  a.ycyl(yF - 1, yF + 1, cx + W * 0.42, z0 + H * 0.26, 3.2, 10);
  if (v.handle) { a.tube([[cx - W * 0.3, a.cy, zt - 3], [cx - W * 0.3, a.cy, z0 + H - 4], [cx + W * 0.3, a.cy, z0 + H - 4], [cx + W * 0.3, a.cy, zt - 3]], [5, 5, 5, 5], 8); }
  a.tube([[cx + W * 0.42, a.YB - 12, zt - 2], [cx + W * 0.46, a.YB - 12, zt + (v.handle ? 2 : 0) + 0.1], [cx + W * 0.5 - 6, a.YB - 12, z0 + H - 1]], [2.2, 1.4, 0.8], 6);
  planRR(a, cx, a.cy, W, D, 12); slotsY(a, 0, 0, 0, 0, 0, 0); a.line(cx - W * 0.44, yF + 6, cx - W * 0.04, yF + 6, 'EQUIP-DETAIL'); a.rect(cx + W * 0.02, yF, cx + W * 0.42, yF + 3, 'EQUIP-DETAIL');
  a.log('Added the softened cabinet with a slotted speaker grille, a tuning dial window with scale and needle, two knobs, a telescopic aerial' + (v.handle ? ' and a carry handle' : '') + ' (plan and 3D).');
}
/** hair dryer lying along X: barrel, nozzle, angled handle, intake; v.big */
function hairDryer(a, v) {
  const z0 = a.Z0, y = a.cy, H = a.H, L = a.W, br = a.D * 0.46, nl = v.conc ? L * 0.16 : 0, bx0 = a.X0 + 3, bx1 = a.X1 - 3 - nl;
  const zc = z0 + H - br - 2;
  a.add(TUBE([[bx0 + 8, y, zc], [bx0 + 14, y, zc], [bx1 - 14, y, zc], [bx1, y, zc]], [br * 0.9, br, br * 0.96, br * 0.82], 24));           // barrel
  a.add(TUBE([[bx0, y, zc], [bx0 + 8, y, zc]], [br * 0.8, br * 0.9], 24));
  for (let i = 0; i < 6; i++) a.add(mv(rotY(torus(br * 0.86, 0.6, 24, 3), m.PI / 2), bx0 + 2 + i * 1.6, y, zc).map((q) => q));   // intake rings
  if (nl) a.add(TUBE([[bx1, y, zc], [bx1 + nl * 0.4, y, zc], [bx1 + nl, y, zc]], [br * 0.82, br * 0.9, br * 0.9], 4).map((q) => q.map(([x, yy, zz]) => [x, yy, zz])).slice(0, 0).concat(TUBE([[bx1, y, zc], [a.X1 - 3, y, zc]], [br * 0.82, br * 0.93], 4)));
  a.add(TUBE([[bx1 - 4, y, zc], [bx1 + 2, y, zc]], [br * 1.02, br * 0.86], 24));                                                     // front lip
  const hx = bx0 + (bx1 - bx0) * 0.5, hr = br * 0.36;
  a.tube([[hx + br * 0.1, y, zc - br * 0.6], [hx + br * 0.4, y, zc - (H - 2 * br) * 0.5 - br * 0.5], [hx + br * 0.8, y, z0 + 6]], [hr * 1.1, hr, hr * 0.92], 12);   // handle
  a.ell(hx + br * 0.85, y, z0 + 4, hr * 0.95, hr * 0.95, 4, 10, 4);
  a.box(hx + br * 0.2, y - 6, zc - br - 4, hx + br * 0.9, y + 6, zc - br * 0.5);                                                      // switch pod
  a.rect(bx0, y - br, a.X1 - 3, y + br); a.line(bx0, y, a.X1 - 3, y, 'EQUIP-DETAIL'); a.circ(hx + br * 0.4, y, hr, 'EQUIP-DETAIL');
  a.log('Added the barrel with an intake grille and front lip, the angled handle with switches' + (nl ? ' and a flat concentrator nozzle' : '') + ' (plan and 3D).');
}
/** flat iron lying open-side down: two long arms with plates; or a curling tong */
function hairIron(a, v) {
  const z0 = a.Z0, y = a.cy, L = a.W, H = a.H, D = a.D, cx = a.cx;
  if (v.tong) {
    const br = D * 0.4;
    a.add(TUBE([[a.X0 + 4, y, z0 + H * 0.5], [a.X0 + L * 0.5, y, z0 + H * 0.5], [a.X1 - 6, y, z0 + H * 0.5]], [br * 0.9, br, br], 18));    // heated barrel
    a.add(TUBE([[a.X1 - 6, y, z0 + H * 0.5], [a.X1 - 4, y, z0 + H * 0.5]], [br, br * 0.5], 18));
    a.add(TUBE([[a.X0 + 4, y, z0 + H * 0.5], [a.X0 + L * 0.26, y, z0 + H * 0.5]], [br * 0.5, br * 0.52], 16).slice(0, 0));
    a.box(a.X0, y - br * 0.7, z0 + H * 0.5 - br - H * 0.28, a.X0 + L * 0.5, y + br * 0.7, z0 + H * 0.5 - br + 2);                                     // clamp arm
    a.tube([[a.X0 + L * 0.5, y, z0 + H * 0.5 - br * 0.95], [a.X0 + L * 0.5 - L * 0.04, y, z0 + H * 0.5 - br * 1.4]], [3, 3], 6);
    a.ycyl(y - 2, y + 2, a.X0 + L * 0.5, z0 + H * 0.2, 4, 10);
    a.add(TUBE([[a.X0 + 4, y, z0 + 5], [a.X0 + L * 0.27, y, z0 + 5]], [br * 0.85, br * 0.85], 14).slice(0, 0));
    a.rect(a.X0, y - br, a.X1, y + br); a.line(a.X0 + L * 0.5, y - br, a.X0 + L * 0.5, y + br, 'EQUIP-DETAIL');
    a.log('Added the long heated barrel with its tip, the handle section and a spring clamp arm with a thumb rest (plan and 3D).');
    return;
  }
  const pw = D * 0.46, gap = 3;
  for (const s of [-1, 1]) {
    const yy = y + s * (pw / 2 + gap / 2);
    a.box(a.X0, yy - pw / 2, z0 + H * 0.25, a.X0 + L * 0.5, yy + pw / 2, z0 + H * 0.82);                      // handle half
    a.box(a.X0 + L * 0.5, yy - pw / 2, z0 + H * 0.3, a.X1, yy + pw / 2, z0 + H * 0.8);                       // plate carrier
    a.box(a.X0 + L * 0.54, yy - pw * 0.4, z0 + H * 0.15, a.X1 - 4, yy + pw * 0.4, z0 + H * 0.3);              // heated plate
    a.box(a.X0 + L * 0.54, yy - pw * 0.4, z0 + H * 0.82, a.X1 - 4, yy + pw * 0.4, z0 + H * 0.97);
  }
  a.box(a.X0, y - gap / 2 - 0.5, z0 + H * 0.4, a.X0 + L * 0.12, y + gap / 2 + 0.5, z0 + H * 0.7);              // hinge block
  a.tube([[a.X0, y, z0 + H * 0.55], [a.X0 - 0, y, z0 + H * 0.55]], [3, 3], 6);
  a.add(TUBE([[a.X0, y, z0 + H * 0.55], [a.X0 + 0.5, y, z0 + H * 0.55]], [pw * 0.28, pw * 0.28], 10).slice(0, 0));
  a.ycyl(y - pw - 2, y + pw + 2, a.X0 + L * 0.5, z0 + H * 0.56, 4, 10);                                       // pivot
  a.box(a.X0 + L * 0.3, y - pw - 2, z0 + H * 0.5, a.X0 + L * 0.38, y - pw - 5, z0 + H * 0.62);                  // slide switch
  a.rect(a.X0, y - pw - gap / 2, a.X1, y + pw + gap / 2); a.line(a.X0, y, a.X1, y, 'EQUIP-DETAIL'); a.rect(a.X0 + L * 0.54, y - pw, a.X1 - 4, y + pw, 'EQUIP-DETAIL');
  a.log('Added two long arms with a hinge block, a pivot, two heated plates and a slide switch (plan and 3D).');
}
/** toaster: v.slots, v.long */
function toaster(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, bt = z0 + H - 24;
  for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.cyl(cx + x * (W / 2 - 10), a.cy + y * (D / 2 - 10), z0, z0 + 4, 5, 8);
  soft(a, cx, a.cy, W, D, D * 0.3, z0 + 4, bt, 6);
  a.box(cx - W * 0.46, yF - 1.4, z0 + H * 0.26, cx + W * 0.46, yF, z0 + H * 0.3);                       // trim line
  // slot positions: [x centre, y centre, half length along x, half width along y]
  const slots = [];
  if (v.long) for (let i = 0; i < v.slots; i++) slots.push([cx, a.cy + ((i + 0.5) / v.slots - 0.5) * (D - 30), W * 0.38, 4.5]);
  else if (v.slots >= 4) for (let i = 0; i < 4; i++) slots.push([cx + (i % 2 ? 1 : -1) * W * 0.22, a.cy + (i < 2 ? -1 : 1) * D * 0.2, W * 0.17, 4.5]);
  else for (let i = 0; i < 2; i++) slots.push([cx + (i ? 1 : -1) * W * 0.2, a.cy, W * 0.14, D * 0.3]);
  for (const [sx, sy, hx, hy] of slots) {
    a.box(sx - hx - 2, sy - hy - 2, bt - 1, sx + hx + 2, sy + hy + 2, bt + 0.01);                          // slot surround
    const bw = (v.long ? hx * 0.5 : hx) * 0.96, thick = v.long ? hy * 1.2 : 9;                                // a slice of toast rising from the slot
    a.add(prismYslice(sx, sy, bw, thick, bt - 6, bt + 22));
    a.rect(sx - hx, sy - hy, sx + hx, sy + hy, 'EQUIP-DETAIL');
  }
  a.box(cx + W * 0.5 - 14, yF - 2.4, z0 + H * 0.2, cx + W * 0.5 - 8, yF, z0 + H * 0.62);                // lever slot
  a.box(cx + W * 0.5 - 17, yF - 5, z0 + H * 0.46, cx + W * 0.5 - 5, yF - 2.4, z0 + H * 0.52);            // lever
  a.ycyl(yF - 6, yF, cx - W * 0.34, z0 + H * 0.5 - 4, H * 0.1, 14); a.ycyl(yF - 7.5, yF - 6, cx - W * 0.34, z0 + H * 0.5 - 4, H * 0.075, 14);   // browning dial
  a.ycyl(yF - 4, yF, cx - W * 0.1, z0 + H * 0.5 - 4, 3.5, 10);                                          // cancel button
  planRR(a, cx, a.cy, W, D, D * 0.3);
  a.log(`Added the softened body on four feet with ${v.slots} bread slots holding slices, a lift lever with slot, a browning dial and a cancel button (plan and 3D).`);
}
/** a bread-slice shape: box with a rounded top, seen from the front */
function prismYslice(sx, sy, hw, th, z0, z1) {
  const pts = [[sx - hw, z0], [sx + hw, z0], [sx + hw, z1 - hw * 0.5], [sx + hw * 0.6, z1 - hw * 0.12], [sx, z1], [sx - hw * 0.6, z1 - hw * 0.12], [sx - hw, z1 - hw * 0.5]];
  const t = [], y0 = sy - th / 2, y1 = sy + th / 2, n = pts.length;
  for (let i = 1; i < n - 1; i++) t.push([[pts[0][0], y0, pts[0][1]], [pts[i + 1][0], y0, pts[i + 1][1]], [pts[i][0], y0, pts[i][1]]], [[pts[0][0], y1, pts[0][1]], [pts[i][0], y1, pts[i][1]], [pts[i + 1][0], y1, pts[i + 1][1]]]);
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return t;
}
/** jug blender: jar, lid, base with dial; v.jar litres */
function blender(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = m.min(a.W, a.D) * 0.46, bh = H * 0.3;
  soft(a, cx, y, R * 2 * 0.96, R * 2 * 0.96, R * 0.5, z0, z0 + bh, 5);
  a.ycyl(a.YF - 0.0, a.YF + 4, cx, z0 + bh * 0.5, 0.01, 4);
  a.ycyl(a.YF + 0.01, a.YF + 5, cx, z0 + bh * 0.5, bh * 0.2, 16); a.ycyl(a.YF, a.YF + 0.01, cx, z0 + bh * 0.5, bh * 0.14, 16);
  a.box(cx - R * 0.5, a.YF, z0 + bh * 0.82, cx + R * 0.5, a.YF + 0.01, z0 + bh * 0.86);
  lathe(a, cx, y, [[z0 + bh, R * 0.6], [z0 + bh + 6, R * 0.74], [z0 + bh + 10, R * 0.74]], 24);                       // collar
  lathe(a, cx, y, [[z0 + bh + 10, R * 0.72], [z0 + bh + (H - bh) * 0.25, R * 0.8], [z0 + H - 16, R * 0.92], [z0 + H - 8, R * 0.94]], 24);   // jar
  lathe(a, cx, y, [[z0 + H - 8, R * 0.96], [z0 + H - 3, R * 0.95], [z0 + H - 1, R * 0.7]], 24);                           // lid
  a.cyl(cx, y, z0 + H - 1, z0 + H, R * 0.28, 12);
  a.tube([[cx + R * 0.9, y, z0 + H - 18], [cx + R * 1.15, y, z0 + H - 22], [cx + R * 1.15, y, z0 + bh + (H - bh) * 0.45], [cx + R * 0.82, y, z0 + bh + (H - bh) * 0.28]].map(([x, yy, z]) => [Math.min(x, a.X1 - 5), yy, z]), [4, 5, 5, 4], 8);
  a.circ(cx, y, R); a.circ(cx, y, R * 0.8, 'EQUIP-DETAIL'); a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP-HIDDEN');
  a.log('Added the softened motor base with a dial and speed marks, the tapering jar with collar, lid and cap and a handle (plan and 3D).');
}
/** bookshelf speaker: cabinet with woofer, tweeter, port, grille frame */
function bookSpeaker(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF;
  for (const x of [-1, 1]) a.cyl(cx + x * (W / 2 - 14), a.cy, z0, z0 + 4, 5, 8);
  soft(a, cx, a.cy, W, D, 8, z0 + 4, z0 + H, 4);
  a.box(cx - W * 0.46, yF - 1.0, z0 + 10, cx + W * 0.46, yF, z0 + H - 8);                                          // baffle plate
  const wr = W * 0.33, wz = z0 + H * 0.32, tz = z0 + H * 0.76;
  for (const [z, r] of [[wz, wr], [tz, W * 0.12]]) { a.ycyl(yF - 3, yF - 1.0, cx, z, r * 1.12, 28); a.ycyl(yF - 4, yF - 3, cx, z, r * 0.92, 28); a.add(rotX(TUBE([[0, 0, 0], [0, 0, -r * 0.5]], [r * 0.3, r * 0.92], 24), m.PI / 2).map((q) => q.map(([x, yy, zz]) => [x + cx, yy + yF - 2.5, zz + z]))); a.ell(cx, yF - 4, z, r * 0.3, 2.2, r * 0.3, 14, 5); }
  a.add(mv(rotX(torus(wr * 1.04, 1.2, 28, 4), m.PI / 2), cx, yF - 3.5, wz)); a.add(mv(rotX(torus(W * 0.124, 0.8, 20, 4), m.PI / 2), cx, yF - 4, tz));
  a.ycyl(yF - 1.5, yF + 4, cx + W * 0.28, z0 + H * 0.1 + 0.0, W * 0.05, 14); a.ycyl(yF - 2.5, yF - 1.5, cx + W * 0.28, z0 + H * 0.1, W * 0.07, 14);   // bass port flare
  a.ycyl(yF - 6, yF - 4, cx - W * 0.32, z0 + 6, 1.5, 8);
  planRR(a, cx, a.cy, W, D, 8); a.rect(cx - W * 0.46, yF, cx + W * 0.46, yF + 1.0, 'EQUIP-DETAIL'); a.circ(cx, yF + 4, 6, 'EQUIP-DETAIL');
  a.log('Added the softened cabinet on four feet with a baffle plate, a woofer and a tweeter with surrounds and cones, and a flared bass port (plan and 3D).');
}

// ================================================================================================ HANDHELD
function gamepad(a, v) {
  const cx = a.cx, W = a.W, H = a.H, D = a.D, z0 = a.Z0, yF = a.YF, ry = (D - 10) / 2, cy = yF + 5 + ry, zc = z0 + H * 0.62;
  a.ell(cx, cy, zc, W * 0.3, ry, H * 0.34, 20, 10);
  for (const s of [-1, 1]) {
    a.add(mv(rotY(ELL(0, 0, 0, W * 0.1, ry * 0.95, H * 0.42, 14, 8), -s * 0.3), cx + s * W * 0.32, cy, z0 + H * 0.42));
    a.ell(cx + s * W * 0.26, cy, zc, W * 0.14, ry * 0.95, H * 0.3, 12, 8);
  }
  for (const s of [-1, 1]) a.box(cx + s * W * 0.36, cy - ry * 0.7, z0 + H * 0.86, cx + s * W * 0.2, cy + ry * 0.1, z0 + H * 0.93);          // bumpers
  const fy = yF + 5 - 0.0, fz = zc;
  const dx = cx - W * 0.2, dz = zc + H * 0.04;                                                                            // d-pad
  a.box(dx - 11, fy - 2.5, dz - 3.6, dx + 11, fy + 1, dz + 3.6); a.box(dx - 3.6, fy - 2.5, dz - 11, dx + 3.6, fy + 1, dz + 11);
  const bx = cx + W * 0.2, bz = zc + H * 0.04;                                                                            // face buttons
  for (const [ox, oz] of [[0, 9], [0, -9], [-9, 0], [9, 0]]) { a.ycyl(fy - 3, fy + 1, bx + ox, bz + oz, 5, 12); }
  for (const [sx, sz] of [[cx - W * 0.1, zc - H * 0.2], [cx + W * 0.1, zc - H * 0.2]]) { a.ycyl(fy - 3, fy + 1, sx, sz, 11, 16); a.ell(sx, fy - 4, sz, 8.5, 4.5, 8.5, 12, 6); a.add(mv(rotX(torus(11, 0.8, 18, 4), m.PI / 2), sx, fy - 3, sz)); }
  a.box(cx - 13, fy - 1.5, zc + H * 0.14, cx - 7, fy + 1, zc + H * 0.14 + 3); a.box(cx + 7, fy - 1.5, zc + H * 0.14, cx + 13, fy + 1, zc + H * 0.14 + 3); a.ycyl(fy - 2.5, fy + 1, cx, zc + H * 0.1, 5, 10);
  if (v.paddles) for (const s of [-1, 1]) a.box(cx + s * W * 0.4, cy + ry * 0.6, z0 + H * 0.1, cx + s * W * 0.34, cy + ry, z0 + H * 0.5);
  a.ellp(cx, cy, W * 0.46, ry); a.circ(dx, cy, 7, 'EQUIP-DETAIL'); a.circ(bx, cy, 8, 'EQUIP-DETAIL');
  a.log('Added the body with two angled grips, a d-pad, four face buttons, two thumb sticks with caps, centre buttons and shoulder bumpers (plan and 3D).');
}
/** torch lying along X: tail cap, tube with grip rings, head with reflector; v.lens (head radius ratio) */
function torch(a, v) {
  const y = a.cy, z0 = a.Z0, zc = z0 + a.H / 2, L = a.W, br = a.D * 0.32 * (v.head ? 0.9 : 1), hr = a.D * 0.46, x0 = a.X0, x1 = a.X1;
  a.add(TUBE([[x0, y, zc], [x0 + L * 0.03, y, zc], [x0 + L * 0.09, y, zc]], [br * 0.75, br * 0.95, br], 20));          // tail cap
  a.cyl(x0 + L * 0.06, y, zc + br * 0.9, zc + br * 1.2, 2.2, 8); a.ell(x0 + L * 0.06, y, zc + br * 1.15, 5.5, 3.5, 2.2, 8, 4);   // tail switch
  a.add(TUBE([[x0 + L * 0.09, y, zc], [x1 - L * 0.28, y, zc]], [br, br], 20));
  const n = m.max(6, m.round(L / 14));
  for (let i = 0; i < n; i++) { const x = x0 + L * 0.14 + ((L * 0.42) * i) / n; a.add(TUBE([[x, y, zc], [x + L * 0.014, y, zc]], [br * 1.04, br * 1.04], 14)); }  // grip rings
  a.add(TUBE([[x1 - L * 0.3, y, zc], [x1 - L * 0.26, y, zc], [x1 - L * 0.18, y, zc], [x1 - L * 0.02, y, zc], [x1 - L * 0.0, y, zc]], [br * 1.05, hr * 0.7, hr * 0.98, hr, hr * 0.96], 24));   // head flare
  a.add(TUBE([[x1 - L * 0.012, y, zc], [x1 - L * 0.0, y, zc]], [hr * 0.96, hr * 0.96], 24));
  a.add(TUBE([[x1 - L * 0.02, y, zc], [x1 - L * 0.1, y, zc]], [hr * 0.82, hr * 0.28], 20).slice(0, 0));
  a.add(TUBE([[x1 - L * 0.14, y, zc], [x1 - L * 0.01, y, zc]], [hr * 0.25, hr * 0.9], 24));                                       // reflector cone
  a.add(TUBE([[x1 - L * 0.006, y, zc], [x1 - L * 0.0, y, zc]], [hr * 0.9, hr * 0.9], 24));
  a.add(mv(rotY(TUBE([[0, 0, 0], [0, 0, 1.2]], [hr * 0.9, hr * 0.9], 24), 0), x1 - 1.5, y, zc).slice(0, 0));
  a.ell(x1 - L * 0.018, y, zc, 1.6, hr * 0.88, hr * 0.88, 4, 16);
  a.ell(x1 - L * 0.07, y, zc, 3, hr * 0.28, hr * 0.28, 10, 6);                                                                    // lamp
  a.box(x1 - L * 0.35, y - 4.5, zc + br * 0.95, x1 - L * 0.32, y + 4.5, zc + br * 0.95 + 3);                                         // side switch pad
  a.tube([[x0 + L * 0.16, y, zc - br], [x0 + L * 0.16, y, zc - br - 4], [x0 + L * 0.3, y, zc - br - 4], [x0 + L * 0.3, y, zc - br]], [1.6, 1.6, 1.6, 1.6], 6);   // pocket clip
  a.rect(x0, y - br, x1 - L * 0.28, y + br); a.rect(x1 - L * 0.28, y - hr, x1, y + hr); a.line(x0, y, x1, y, 'EQUIP-DETAIL');
  a.log('Added the tail cap with a push switch, the knurled grip tube, a pocket clip and the flared head with reflector and lamp (plan and 3D).');
}
function remote(a, v) {
  const cx = a.cx, W = a.W, H = a.H, D = a.D, z0 = a.Z0, yF = a.YF;
  soft(a, cx, a.cy, W, D, W * 0.28, z0, z0 + H, 3);
  a.add(rotX(frustum(rrPoly(0, 0, W * 0.92, H * 0.97, 4), 0, rrPoly(0, 0, W * 0.9, H * 0.95, 4), 0.01).slice(0, 0), 0));
  a.ycyl(yF - 1.4, yF, cx, z0 + H - 6, 2.2, 10); a.box(cx - 5, yF - 0.8, z0 + H - 4, cx + 5, yF, z0 + H - 2);   // IR window
  a.ycyl(yF - 2.2, yF, cx - W * 0.28, z0 + H * 0.86, W * 0.12, 14); a.ycyl(yF - 2.2, yF, cx + W * 0.28, z0 + H * 0.86, W * 0.12, 14);   // power / source
  a.ycyl(yF - 2.5, yF, cx, z0 + H * 0.7, W * 0.3, 20); a.ycyl(yF - 3.4, yF - 2.5, cx, z0 + H * 0.7, W * 0.12, 14);                      // nav ring + ok
  buttonsY(a, cx - W * 0.4, cx + W * 0.4, z0 + H * (v.big ? 0.12 : 0.1), z0 + H * 0.5, yF, v.cols, v.rows, v.big ? W * 0.09 : W * 0.07, 2.0, true);
  a.box(cx - W * 0.34, yF - 2.0, z0 + H * 0.54, cx - W * 0.1, yF, z0 + H * 0.58);
  planRR(a, cx, a.cy, W, D, W * 0.28); a.line(cx - W * 0.4, yF + 1, cx + W * 0.4, yF + 1, 'EQUIP-DETAIL');
  a.log(`Added the softened slab body with a power key, a round navigation pad and a ${v.cols} x ${v.rows} grid of keys (plan and 3D).`);
}
function phone(a, v) {
  const cx = a.cx, W = a.W, H = a.H, D = a.D, z0 = a.Z0, yF = a.YF, fr = 5;
  soft(a, cx, a.cy, W, D, W * 0.14, z0, z0 + H, 2.5);
  const sp = rrPoly(cx, 0, W - 7, H - 9, W * 0.1).map(([x, z]) => [x, z0 + H / 2 + z]);
  prismY(a, sp, yF - 0.6, yF + 0.1);                                                                  // screen glass
  prismY(a, rrPoly(cx, 0, W - 11, H - 15, W * 0.08).map(([x, z]) => [x, z0 + H / 2 + z]), yF - 0.9, yF - 0.6);   // lit panel
  a.box(cx - 9, yF - 0.5, z0 + H - 5.5, cx + 9, yF + 0.1, z0 + H - 4.4); a.ycyl(yF - 0.6, yF, cx + 14, z0 + H - 5, 1.6, 8); a.ycyl(yF - 0.6, yF, cx - 14, z0 + H - 5, 1.2, 8);   // speaker, sensors
  a.box(a.X1, yF + D * 0.2, z0 + H * 0.62, a.X1 - 0.0, yF + D * 0.2, z0 + H * 0.62);
  a.box(cx + W / 2 - 0.4, a.cy - 0.5, z0 + H * 0.66, cx + W / 2, a.cy + 0.5, z0 + H * 0.78);          // side keys
  a.box(cx + W / 2 - 0.4, a.cy - 0.5, z0 + H * 0.54, cx + W / 2, a.cy + 0.5, z0 + H * 0.62);
  a.box(cx - 6, yF + D - 1.5, z0, cx + 6, a.YB - 0.2, z0 + 0.5);
  // camera plateau on the back (+Y side)
  a.box(cx - W * 0.4, a.YB - 1.2, z0 + H - W * 0.46, cx - W * 0.4 + W * 0.36, a.YB, z0 + H - 3);
  for (const [dx, dz] of v.lens === 3 ? [[0.12, 0.12], [0.12, 0.32], [0.3, 0.2]] : [[0.12, 0.12], [0.12, 0.3]]) { a.ycyl(a.YB - 3, a.YB - 1, cx - W * 0.4 + W * dx * 1.0 + 4, z0 + H - W * 0.46 + W * dz * 1.0 + 6, W * 0.075, 14); a.ycyl(a.YB - 3.4, a.YB - 3, cx - W * 0.4 + W * dx + 4, z0 + H - W * 0.46 + W * dz + 6, W * 0.05, 12); }
  planRR(a, cx, a.cy, W, D, W * 0.14); a.circ(cx - W * 0.28, a.YB - 2, W * 0.07, 'EQUIP-DETAIL');
  a.log(`Added the rounded slim body with a front glass panel, speaker slot and sensors, side keys and a back camera plateau with ${v.lens} lenses (plan and 3D).`);
}
function camera(a, v) {
  const cx = a.cx, W = a.W, H = a.H, D = a.D, z0 = a.Z0, yF = a.YF, bd = v.lensL ? D * 0.5 : D, bodyH = v.dslr ? H * 0.72 : H * 0.82;
  const by0 = a.YB - bd;
  soft(a, cx, (by0 + a.YB) / 2, W, bd, 6, z0, z0 + bodyH, 4);
  if (v.dslr) { a.ell(cx, (by0 + a.YB) / 2, z0 + bodyH + 2, W * 0.14, bd * 0.38, H * 0.2, 14, 8); a.box(cx - W * 0.09, by0 + bd * 0.25, z0 + bodyH, cx + W * 0.09, by0 + bd * 0.75, z0 + bodyH + H * 0.16); }
  const lz = z0 + bodyH * 0.55, lr = v.dslr ? bodyH * 0.42 : bodyH * 0.34, lx = v.dslr ? cx : cx + W * 0.12;
  a.add(TUBE([[lx, by0, lz].map((q, i) => i === 1 ? by0 : q), [lx, by0 - 3, lz]].map((p) => p), [lr * 1.18, lr * 1.18], 24).slice(0, 0));
  const ly = by0 - v.lensL;
  a.add(rotXdir([[lx, by0 + 1, lz], [lx, by0 - v.lensL * 0.35, lz], [lx, ly, lz]], [lr * 1.2, lr * 1.0, lr * 0.96]));
  a.add(rotXdir([[lx, ly, lz], [lx, ly - 2, lz]], [lr * 1.04, lr * 1.04]));
  for (let i = 0; i < 3; i++) a.add(rotXdir([[lx, by0 - v.lensL * (0.25 + i * 0.18), lz], [lx, by0 - v.lensL * (0.25 + i * 0.18) - 3, lz]], [lr * 1.08, lr * 1.08]));  // rings
  a.add(rotXdir([[lx, ly - 2, lz], [lx, ly - 3, lz]], [lr * 0.55, lr * 0.55]));
  a.ycyl(by0 - 1.0, by0, cx - W * 0.34, z0 + bodyH * 0.55, 0.01, 3);
  a.box(cx + W * 0.28, by0 - 1.5, z0 + bodyH * 0.78, cx + W * 0.44, by0 + 0.01, z0 + bodyH * 0.96); a.ycyl(by0 - 2, by0, cx - W * 0.4, z0 + bodyH * 0.86, 3, 8);   // flash / AF lamp
  a.cyl(cx + W * 0.3, (by0 + a.YB) / 2, z0 + bodyH, z0 + bodyH + 5, 7, 14); a.cyl(cx + W * 0.3, (by0 + a.YB) / 2, z0 + bodyH + 5, z0 + bodyH + 7, 5, 14);     // mode dial
  a.cyl(cx - W * 0.3, (by0 + a.YB) / 2, z0 + bodyH, z0 + bodyH + 3.5, 4.5, 12);                                                                               // shutter
  a.box(cx + W * 0.36, by0, z0 + bodyH * 0.1, cx + W * 0.5 - 1, by0 + bd * 0.5, z0 + bodyH * 0.9);
  for (let i = 0; i < 5; i++) a.box(cx - W * 0.5 + 3 + i * 3, by0 - 0.6, z0 + bodyH * 0.12, cx - W * 0.5 + 4.6 + i * 3, by0, z0 + bodyH * 0.78);
  a.rect(cx - W / 2, by0, cx + W / 2, a.YB); a.circ(lx, by0 - v.lensL / 2, lr, 'EQUIP-DETAIL'); a.rect(lx - lr, ly, lx + lr, by0, 'EQUIP-DETAIL');
  a.log(`Added the camera body with a ${v.dslr ? 'viewfinder hump, ' : ''}grip, mode dial, shutter button, flash window and a ringed lens barrel (plan and 3D).`);
}
/** a cylinder along Y through the point list with radii (front to back) */
function rotXdir(pts, rads) { return TUBE(pts, rads, 24); }
function multimeter(a, v) {
  const cx = a.cx, W = a.W, H = a.H, D = a.D, z0 = a.Z0, yF = a.YF;
  if (v.holster) { soft(a, cx, a.cy, W, D, 14, z0, z0 + H, 5); a.box(cx - W * 0.35, yF - 1, z0 + H - 14, cx + W * 0.35, yF, z0 + H - 6); }
  const bw = v.holster ? W * 0.86 : W, bd = v.holster ? D - 8 : D;
  soft(a, cx, a.cy, bw, bd, 6, z0 + (v.holster ? 5 : 0), z0 + H - (v.holster ? 5 : 0), 3);
  const fy = yF + (v.holster ? 4 : 0);
  a.box(cx - bw * 0.36, fy - 1.0, z0 + H * 0.68, cx + bw * 0.36, fy, z0 + H * 0.93);              // display bezel
  a.box(cx - bw * 0.3, fy - 1.3, z0 + H * 0.72, cx + bw * 0.3, fy - 1.0, z0 + H * 0.9);
  for (let i = 0; i < 4; i++) a.box(cx - bw * 0.26 + i * bw * 0.14, fy - 1.9, z0 + H * 0.75, cx - bw * 0.26 + i * bw * 0.14 + bw * 0.1, fy - 1.3, z0 + H * 0.87);   // digits
  for (let i = 0; i < 4; i++) a.box(cx - bw * 0.36 + i * bw * 0.18, fy - 2.2, z0 + H * 0.56, cx - bw * 0.36 + i * bw * 0.18 + bw * 0.14, fy, z0 + H * 0.61);   // soft keys
  const dz = z0 + H * 0.36, dr = bw * 0.3;
  a.ycyl(fy - 4, fy, cx, dz, dr, 28); a.ycyl(fy - 6, fy - 4, cx, dz, dr * 0.78, 28); a.box(cx - 1.4, fy - 6.4, dz, cx + 1.4, fy - 6, dz + dr * 0.76);     // rotary dial + pointer
  for (let i = 0; i < 12; i++) { const g = (i / 12) * TAU; a.ycyl(fy - 1.2, fy, cx + (dr + 4) * m.sin(g) * 1.0, dz + (dr + 4) * m.cos(g), 0.9, 6); }
  for (let i = 0; i < 3; i++) { const x = cx + (i - 1) * bw * 0.28; a.ycyl(fy - 7, fy, x, z0 + H * 0.08 + 8, 5.5, 12); a.ycyl(fy - 7.5, fy - 7, x, z0 + H * 0.08 + 8, 3, 10); }   // jacks
  planRR(a, cx, a.cy, bw, bd, 6);
  a.log('Added the softened case' + (v.holster ? ' in a rubber holster' : '') + ' with a display, soft keys, a rotary range dial with pointer and three input jacks (plan and 3D).');
}
/** digital caliper lying face to the front: beam with scale, fixed jaws, sliding head with display and thumb wheel */
function caliper(a, v) {
  const z0 = a.Z0, H = a.H, L = a.W, y = a.YF, x0 = a.X0, x1 = a.X1, bz0 = z0 + H * 0.2, bz1 = z0 + H * 0.52, t = 3.2, d = a.D;
  a.box(x0, y, bz0, x1, y + d * 0.55, bz1);                                                       // beam
  a.box(x0 + 2, y - 0.6, bz0 + 3, x1 - 6, y, bz1 - 3);                                            // scale strip
  const n = m.round((L - 30) / 5);
  for (let i = 0; i < n; i++) a.box(x0 + 12 + i * ((L - 30) / n), y - 1.4, bz1 - 3, x0 + 12.5 + i * ((L - 30) / n) + 0.4, y - 0.6, bz1 - (i % 5 === 0 ? 10 : 6.5));   // graduations
  a.box(x0, y, z0, x0 + 9, y + d * 0.55, bz0);                                                    // fixed outside jaw, down
  a.box(x0, y, bz1, x0 + 7, y + d * 0.55, z0 + H * 0.72);                                   // fixed inside jaw, up
  const sx = x0 + L * 0.12;
  a.box(sx, y, z0, sx + 9, y + d * 0.55, bz0);                                                     // sliding outside jaw
  a.box(sx + 2, y, bz1, sx + 8, y + d * 0.55, z0 + H * 0.72);                                      // sliding inside jaw
  const hw = L * 0.22;
  a.box(sx, y - 3, bz0 - 2, sx + hw, y + d, z0 + H);                                               // sliding head
  a.box(sx + hw * 0.1, y - 4.2, z0 + H * 0.66, sx + hw * 0.9, y - 3, z0 + H * 0.96);                // display bezel
  a.box(sx + hw * 0.16, y - 4.8, z0 + H * 0.7, sx + hw * 0.84, y - 4.2, z0 + H * 0.92);
  for (let i = 0; i < 4; i++) a.box(sx + hw * 0.2 + i * hw * 0.16, y - 5.2, z0 + H * 0.74, sx + hw * 0.2 + i * hw * 0.16 + hw * 0.11, y - 4.8, z0 + H * 0.86);
  a.ycyl(y - 6, y - 3, sx + hw * 0.5, z0 + H * 0.38, H * 0.1, 16);                                 // thumb wheel
  for (let i = 0; i < 3; i++) a.ycyl(y - 4.5, y - 3, sx + hw * (0.22 + i * 0.28), z0 + H * 0.56, 2.2, 8);   // buttons
  a.rect(x0, y, x1, y + d * 0.55); a.rect(sx, y, sx + hw, y + d, 'EQUIP-DETAIL'); a.line(x0 + 9, y, x0 + 9, y + d * 0.55, 'EQUIP-DETAIL');
  a.log('Added the beam with a scale strip and graduations, fixed and sliding jaws (outside and inside), a sliding head with a display, keys and a thumb wheel (plan and 3D).');
}
function walkie(a, v) {
  const cx = a.cx, W = a.W, H = a.H, D = a.D, z0 = a.Z0, yF = a.YF, bodyH = H - v.ant;
  soft(a, cx, a.cy, W, D, 8, z0, z0 + bodyH, 4);
  a.tube([[cx - W * 0.3, a.cy, z0 + bodyH], [cx - W * 0.3, a.cy, z0 + bodyH + v.ant * 0.5], [cx - W * 0.28, a.cy, z0 + H]], [4, 3.2, 2.4], 8);          // aerial
  a.cyl(cx + W * 0.2, a.cy, z0 + bodyH, z0 + bodyH + 8, 6, 14); a.cyl(cx + W * 0.2, a.cy, z0 + bodyH + 8, z0 + bodyH + 9, 5, 14);                           // channel knob
  a.cyl(cx + W * 0.34, a.cy, z0 + bodyH, z0 + bodyH + 4, 3.5, 10);
  slotsY(a, cx - W * 0.3, cx + W * 0.3, z0 + bodyH * 0.6, z0 + bodyH * 0.9, yF, 9, 1.4);                                                                  // speaker slots
  a.box(cx - W * 0.28, yF - 1.0, z0 + bodyH * 0.42, cx + W * 0.28, yF, z0 + bodyH * 0.54);                                                                    // display
  buttonsY(a, cx - W * 0.3, cx + W * 0.3, z0 + bodyH * 0.1, z0 + bodyH * 0.38, yF, 3, 2, W * 0.07, 1.5, true);
  a.box(cx - W * 0.5 - 2.0, yF + D * 0.2, z0 + bodyH * 0.5, cx - W * 0.5, yF + D * 0.6, z0 + bodyH * 0.8);
  a.box(a.X0 + 0.0, yF + D * 0.18, z0 + bodyH * 0.52, a.X0 + 0.01, yF + D * 0.45, z0 + bodyH * 0.78);
  a.box(a.X0 + 1, yF + D * 0.22, z0 + bodyH * 0.5, a.X0 + 4, yF + D * 0.55, z0 + bodyH * 0.78);                                                               // push-to-talk
  a.box(cx - W * 0.2, a.YB - 3.5, z0 + bodyH * 0.2, cx + W * 0.2, a.YB, z0 + bodyH * 0.9);                                                                   // belt clip
  planRR(a, cx, a.cy, W, D, 8); a.circ(cx - W * 0.3, a.cy, 3, 'EQUIP-DETAIL'); a.circ(cx + W * 0.2, a.cy, 6, 'EQUIP-DETAIL');
  a.log('Added the softened housing with a speaker grille, a small display, keys, a channel knob, push-to-talk bar, a belt clip and the aerial (plan and 3D).');
}

// ================================================================================================ PACKAGING
/** bottle profile as [z, r] pts */
function bottle(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 0.3, nr = R * v.neck, nz = z0 + H * 0.84;
  const body = [[z0, R * 0.55], [z0 + 2, R * 0.9], [z0 + 6, R], [z0 + H * 0.3, R], [z0 + H * 0.56, R * 0.96], [z0 + H * 0.7, R * 0.82], [nz - 6, nr * 1.4], [nz, nr * 1.05], [nz + 2, nr]];
  lathe(a, cx, y, body, 28);
  if (v.petal) for (let k = 0; k < 5; k++) { const g = (k / 5) * TAU; a.cyl(cx + R * 0.66 * m.cos(g), y + R * 0.66 * m.sin(g), z0, z0 + 3, R * 0.2, 8); }
  for (let i = 0; i < 2; i++) { a.add(mv(torus(R * 1.01, 0.5, 28, 3), cx, y, z0 + H * (0.28 + i * 0.28))); }             // rib rings
  lathe(a, cx, y, [[z0 + H * 0.3, R * 1.012], [z0 + H * 0.58, R * 1.012]], 28);                                          // label band
  a.add(mv(torus(nr * 1.1, 0.8, 18, 4), cx, y, nz + 2));                                                                 // neck ring
  const capZ = nz + 5, ch = H - (capZ - z0);
  lathe(a, cx, y, [[capZ, nr * 1.05], [capZ + 1, nr * 1.15], [capZ + ch - 1, nr * 1.15], [capZ + ch, nr * 1.05]], 20);
  for (let k = 0; k < 18; k++) { const g = (k / 18) * TAU; a.box(cx + nr * 1.16 * m.cos(g) - 0.3, y + nr * 1.16 * m.sin(g) - 0.3, capZ + 1.5, cx + nr * 1.16 * m.cos(g) + 0.3, y + nr * 1.16 * m.sin(g) + 0.3, capZ + ch - 1.5); }
  a.circ(cx, y, R); a.circ(cx, y, nr * 1.15, 'EQUIP-DETAIL');
  a.log('Added the lathed body with a base' + (v.petal ? ' of five feet' : '') + ', rib rings, label band, shoulder, neck ring and a ribbed screw cap (plan and 3D).');
}
function jar(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 0.4, lh = v.lid, nz = z0 + H - lh;
  lathe(a, cx, y, [[z0, R * 0.85], [z0 + 2, R * 0.96], [z0 + 5, R], [z0 + (H - lh) * 0.7, R], [z0 + (H - lh) * 0.85, R * 0.95], [nz - 3, R * 0.8], [nz, R * 0.78]], 28);
  lathe(a, cx, y, [[z0 + (H - lh) * 0.14, R * 1.012], [z0 + (H - lh) * 0.64, R * 1.012]], 28);                              // label
  for (let i = 0; i < 3; i++) a.add(mv(torus(R * 0.8, 0.7, 24, 4), cx, y, nz - 2.5 + i * 0.0 + (i - 1) * 0.0 + (i - 1) * 2.4 * 0.0));  // thread
  lathe(a, cx, y, [[nz, R * 0.88], [nz + 1, R * 0.88], [nz + lh - 1, R * 0.88], [nz + lh, R * 0.84]], 28);                    // lid
  for (let k = 0; k < 36; k++) { const g = (k / 36) * TAU; a.box(cx + R * 0.89 * m.cos(g) - 0.4, y + R * 0.89 * m.sin(g) - 0.4, nz + 2, cx + R * 0.89 * m.cos(g) + 0.4, y + R * 0.89 * m.sin(g) + 0.4, nz + lh - 2); }
  a.circ(cx, y, R); a.circ(cx, y, R * 0.88, 'EQUIP-DETAIL');
  a.log('Added the wide-mouth glass body with a shoulder, a label panel, the thread ring and a knurled screw lid (plan and 3D).');
}
function can(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 0.3;
  lathe(a, cx, y, [[z0, R * 0.7], [z0 + 2, R * 0.78], [z0 + 5, R * 0.92], [z0 + 8, R], [z0 + H - 12, R], [z0 + H - 8, R * 0.9], [z0 + H - 4, R * 0.82], [z0 + H - 3, R * 0.84]], 28);
  a.add(mv(torus(R * 0.83, 0.9, 28, 4), cx, y, z0 + H - 3));
  a.cyl(cx, y, z0 + H - 3.2, z0 + H - 2, R * 0.76, 28);                                    // lid panel
  const tx = cx + R * 0.15; a.box(tx - R * 0.35, y - 3.2, z0 + H - 2, tx + R * 0.3, y + 3.2, z0 + H - 1.0); a.ycyl(y - 1.5, y + 1.5, tx + R * 0.38, z0 + H - 1.4, 1.4, 8);   // pull tab
  a.ell(tx - R * 0.35, y, z0 + H - 1.2, 3, 2.4, 0.8, 8, 4);
  a.add(mv(torus(R * 0.99, 0.35, 28, 3), cx, y, z0 + H * 0.12)); a.add(mv(torus(R * 0.99, 0.35, 28, 3), cx, y, z0 + H - 14));
  a.circ(cx, y, R); a.circ(cx, y, R * 0.76, 'EQUIP-DETAIL'); a.rect(tx - R * 0.35, y - 3.2, tx + R * 0.3, y + 3.2, 'EQUIP-DETAIL');
  a.log('Added the necked drinks can body with a curved base, rims, a top panel and a pull tab (plan and 3D).');
}
/** squeeze tube standing on its cap */
function tubeP(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 0.3, capH = v.capH;
  lathe(a, cx, y, [[z0, R * 0.62], [z0 + 1, R * 0.72], [z0 + capH - 2, R * 0.55], [z0 + capH, R * 0.5]], 20);              // cap
  for (let k = 0; k < 12; k++) { const g = (k / 12) * TAU; a.box(cx + R * 0.66 * m.cos(g) - 0.4, y + R * 0.66 * m.sin(g) - 0.4, z0 + 3, cx + R * 0.66 * m.cos(g) + 0.4, y + R * 0.66 * m.sin(g) + 0.4, z0 + capH - 6); }
  lathe(a, cx, y, [[z0 + capH, R * 0.5], [z0 + capH + 3, R * 0.62], [z0 + capH + 8, R * 0.9], [z0 + capH + 14, R]], 22);   // shoulder
  a.add(TUBE([[cx, y, z0 + capH + 14], [cx, y, z0 + H - 8]], [R, R * 0.97], 22));
  a.box(cx - R, y - 0.9, z0 + H - 10, cx + R, y + 0.9, z0 + H);                                                              // flat crimp
  a.box(cx - R * 0.96, y - 1.3, z0 + H - 8, cx + R * 0.96, y + 1.3, z0 + H - 5.4);
  for (let k = 0; k < 7; k++) a.box(cx - R * 0.92 + k * ((R * 1.84) / 7), y - 1.4, z0 + H - 8, cx - R * 0.92 + k * ((R * 1.84) / 7) + 0.7, y + 1.4, z0 + H - 5.4);
  a.add(mv(torus(R * 1.0, 0.4, 22, 3), cx, y, z0 + capH + 14));
  a.circ(cx, y, R); a.rect(cx - R, y - 0.9, cx + R, y + 0.9, 'EQUIP-DETAIL'); a.circ(cx, y, R * 0.5, 'EQUIP-DETAIL');
  a.log('Added the screw cap with ribs, the shoulder, the rolled tube body and a flat serrated crimp at the top (plan and 3D).');
}
/** tuck-end carton with a hang tab or window */
function carton(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, th = 1.0, tabH = v.tab ? 14 : 0, bh = H - tabH;
  a.box(cx - W / 2, yF, z0, cx + W / 2, a.YB, z0 + bh);
  a.box(cx - W / 2 - 0.0, yF, z0 + bh - 12, cx + W / 2, yF + 0.6, z0 + bh - 11.5 + 0.0);
  a.box(cx - W / 2, yF - 1.4, z0 + bh - 14, cx + W / 2, yF, z0 + bh - 12.6);                               // tuck-flap edge line
  a.box(cx - W * 0.2, yF - 0.5, z0 + bh - 14.8, cx + W * 0.2, yF, z0 + bh - 14);                         // thumb notch
  a.box(cx - W / 2, yF - 0.5, z0 + 6, cx - W / 2 + 1.2, a.YB, z0 + bh - 6);
  if (v.window) { const wx0 = cx - W * 0.32, wx1 = cx + W * 0.32, wz0 = z0 + bh * 0.28, wz1 = z0 + bh * 0.72; a.frame(wx0, wz0, wx1, wz1, yF - 2.0, yF, 3); a.box(wx0 + 2, yF - 0.5, wz0 + 2, wx1 - 2, yF - 0.3, wz1 - 2); }
  else { a.box(cx - W * 0.34, yF - 1.6, z0 + bh * 0.3, cx + W * 0.34, yF, z0 + bh * 0.7); a.box(cx - W * 0.3, yF - 2.2, z0 + bh * 0.36, cx + W * 0.3, yF - 1.6, z0 + bh * 0.44); }               // printed label panel
  if (v.tab) { a.box(cx - W * 0.2, yF + D * 0.35, z0 + bh, cx + W * 0.2, yF + D * 0.35 + 1.2, z0 + H); a.ycyl(yF + D * 0.35 - 0.1, yF + D * 0.35 + 1.3, cx, z0 + H - 6, 3.4, 12); }
  a.rect(cx - W / 2, yF, cx + W / 2, a.YB); a.line(cx - W / 2 + 1, yF + 1, cx + W / 2 - 1, yF + 1, 'EQUIP-DETAIL');
  a.log('Added the tuck-end carton body with the closure flap line and thumb notch' + (v.window ? ', a window frame' : ', a label panel') + (v.tab ? ' and a punched hang tab' : '') + ' (plan and 3D).');
}
function blister(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, cardD = 1.6;
  a.box(cx - W / 2, a.YB - cardD, z0, cx + W / 2, a.YB, z0 + H);                                              // card
  a.box(cx - W / 2 + 4, a.YB - cardD - 0.4, z0 + 5, cx + W / 2 - 4, a.YB - cardD, z0 + H - 22);
  a.box(cx - W * 0.12, a.YB - cardD, z0 + H - 14, cx + W * 0.12, a.YB - cardD + 0.01, z0 + H - 6);
  a.ycyl(a.YB - cardD - 0.4, a.YB - cardD, cx, z0 + H - 8, 0.01, 3);
  const pr = v.pod, cols = v.cols, rows = v.rows, zb = z0 + 8, zt = z0 + H - 28;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = cx - W / 2 + (W * (i + 0.5)) / cols, z = zb + ((zt - zb) * (j + 0.5)) / rows;
    a.ell(x, a.YB - cardD, z, pr, D - cardD - 0.4, pr * 1.5, 14, 8);
    a.ycyl(a.YB - cardD - 0.2, a.YB - cardD, x, z, pr * 1.3, 14);
    a.rect(x - pr, a.YB - cardD - 0.2, x + pr, a.YB - cardD, 'EQUIP-DETAIL');
  }
  a.box(cx - W / 2 + 3, a.YB - cardD - 0.3, z0 + H - 25, cx + W / 2 - 3, a.YB - cardD, z0 + H - 11);        // printed header
  a.rect(cx - W / 2, a.YB - cardD, cx + W / 2, a.YB); a.circ(cx, a.YB - cardD / 2, 3, 'EQUIP-DETAIL');
  a.log(`Added the printed card with a hang hole and header panel and ${cols * rows} formed clear pods (plan and 3D).`);
}
function crate(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, t = 5, fh = 12, rib = v.rib;
  a.box(cx - W / 2, yF, z0 + fh - 3, cx + W / 2, a.YB, z0 + fh);                                                   // floor slab on its feet
  for (let i = 0; i < rib; i++) a.box(cx - W / 2 + 14 + ((W - 28) * (i + 0.5)) / rib - 2, yF + t, z0 + fh, cx - W / 2 + 14 + ((W - 28) * (i + 0.5)) / rib + 2, a.YB - t, z0 + fh + 5);
  for (const sy of [yF, a.YB - t]) {                                                                                // long walls as open frames
    a.box(cx - W / 2, sy, z0 + fh, cx + W / 2, sy + t, z0 + fh + 14);                                              // lower rail
    a.box(cx - W / 2, sy, z0 + H - 14, cx + W / 2, sy + t + 2, z0 + H);                                            // top rim
    for (let i = 0; i <= rib + 2; i++) { const x = cx - W / 2 + 4 + ((W - 8) * i) / (rib + 2); a.box(x - 5, sy, z0 + fh, x + 5, sy + t, z0 + H); }   // posts
  }
  for (const s of [-1, 1]) {                                                                                         // end walls with a hand opening
    const ex = s > 0 ? cx + W / 2 - t : cx - W / 2;
    a.box(ex, yF, z0 + fh, ex + t, a.YB, z0 + fh + (H - fh) * 0.3); a.box(ex, yF, z0 + H - 14, ex + t, a.YB, z0 + H);
    a.box(ex, yF, z0 + fh, ex + t, yF + D * 0.22, z0 + H); a.box(ex, a.YB - D * 0.22, z0 + fh, ex + t, a.YB, z0 + H);
  }
  for (const x of [-1, 1]) for (const yy of [yF + t, a.YB - t]) a.box(cx + x * (W / 2 - 9) - 9, yy - t, z0, cx + x * (W / 2 - 9) + 9, yy + t, z0 + fh);   // corner feet
  a.rect(cx - W / 2, yF, cx + W / 2, a.YB); a.rect(cx - W / 2 + t, yF + t, cx + W / 2 - t, a.YB - t, 'EQUIP-DETAIL');
  for (let i = 0; i < rib; i++) a.line(cx - W / 2 + 14 + ((W - 28) * (i + 0.5)) / rib, yF + t, cx - W / 2 + 14 + ((W - 28) * (i + 0.5)) / rib, a.YB - t, 'EQUIP-HIDDEN');
  a.log('Added the vented crate: a ribbed floor, long walls as open frames with posts, end walls with a hand opening, a top rim and corner feet (plan and 3D).');
}
function pumpBottle(a, v) {
  const cx = a.cx, y = a.cy, z0 = a.Z0, H = a.H, R = a.W / 2 - 0.4, ph = H * 0.2, bz = z0 + H - ph - H * 0.07;
  lathe(a, cx, y, [[z0, R * 0.8], [z0 + 2, R * 0.97], [z0 + 5, R], [z0 + (bz - z0) * 0.8, R], [z0 + (bz - z0) * 0.94, R * 0.6], [bz, R * 0.42]], 26);
  lathe(a, cx, y, [[z0 + (bz - z0) * 0.12, R * 1.012], [z0 + (bz - z0) * 0.7, R * 1.012]], 26);
  lathe(a, cx, y, [[bz, R * 0.48], [bz + 2, R * 0.5], [bz + H * 0.05, R * 0.5], [bz + H * 0.07, R * 0.46]], 20);                       // collar
  a.cyl(cx, y, bz + H * 0.07, bz + H * 0.07 + ph * 0.45, R * 0.12, 10);                                                                  // stem
  const hz = bz + H * 0.07 + ph * 0.45;
  a.add(TUBE([[cx - R * 0.35, y, hz + 1], [cx + R * 0.1, y, hz + 1], [cx + R * 0.3, y, hz + 3]], [R * 0.24, R * 0.24, R * 0.2], 12));       // actuator head
  a.add(TUBE([[cx + R * 0.3, y, hz + 3], [cx + R * 0.9, y, hz + 3], [cx + R * 1.0, y, hz + 1.4]].map(([x, yy, z]) => [m.min(x, a.X1 - 2), yy, z]), [R * 0.17, R * 0.15, R * 0.12], 10));   // nozzle spout
  a.add(TUBE([[cx - R * 0.35, y, hz + 1], [cx - R * 0.5, y, hz + 0.5]], [R * 0.24, R * 0.22], 12).slice(0, 0));
  a.circ(cx, y, R); a.circ(cx, y, R * 0.5, 'EQUIP-DETAIL'); a.line(cx, y, a.X1 - 2, y, 'EQUIP-DETAIL');
  a.log('Added the round bottle with a label band, a collar and a pump with a stem, actuator head and side nozzle (plan and 3D).');
}

// ================================================================================================ ENCLOSURES
function jbox(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, lid = 6;
  a.box(cx - W / 2, yF + lid, z0, cx + W / 2, a.YB, z0 + H);                                                       // body
  a.box(cx - W / 2 + 2, yF, z0 + 2, cx + W / 2 - 2, yF + lid, z0 + H - 2);                                         // lid
  a.box(cx - W / 2 - 6, a.YB - 4, z0 + H * 0.12, cx - W / 2, a.YB, z0 + H * 0.88);
  for (const s of [-1, 1]) a.box(cx + s * (W / 2 + 7) - 6, a.YB - 3, z0 + H * 0.3, cx + s * (W / 2 + 7) + 6, a.YB, z0 + H * 0.7);
  const sx = W / 2 - 9, sz = H / 2 - 9;
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { screwY(a, cx + x * sx, z0 + H / 2 + z * sz, yF, 3.0, 2.2); a.cyl(cx + x * sx, a.cy, z0 + 3, z0 + 4, 0.1, 3); }
  a.box(cx - W * 0.2, yF - 0.5, z0 + H / 2 - 0.5, cx + W * 0.2, yF, z0 + H / 2 + 0.5);
  a.add(rotXdir([[cx, yF + lid, z0 + 3], [cx, yF + lid, z0 + 3.1]], [0.1, 0.1]));
  for (let i = 0; i < v.glands; i++) { const x = cx - W * 0.28 + ((W * 0.56) * (i + 0.5)) / v.glands; a.cyl(x, a.cy, z0 - 0.0, z0 - 0.0 + 0.01, 0.01, 3); a.ycyl(yF + lid + 2, yF + lid + 2.01, x, z0, 0.01, 3); }
  for (let i = 0; i < v.glands; i++) { const x = cx - W * 0.3 + ((W * 0.6) * (i + 0.5)) / v.glands; a.add(TUBE([[x, a.cy, z0 + H], [x, a.cy, z0 + H]], [0.01, 0.01], 3)); }
  a.rect(cx - W / 2, yF, cx + W / 2, a.YB); a.rect(cx - W / 2 + 2, yF, cx + W / 2 - 2, yF + lid, 'EQUIP-DETAIL');
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.circ(cx + x * sx, yF + 2, 3, 'EQUIP-DETAIL');
  a.log('Added the box body, a fixed lid with four slotted screws and a gasket line, side mounting ears and wall brackets (plan and 3D).');
}
function jboxFull(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, lid = 5, ear = 8;
  a.box(cx - W / 2, yF + lid, z0, cx + W / 2, a.YB, z0 + H);
  a.box(cx - W / 2 - 0.0, yF + 1, z0 + 1, cx + W / 2, yF + lid, z0 + H - 1);
  a.box(cx - W / 2 + 3, yF, z0 + 3, cx + W / 2 - 3, yF + 1.2, z0 + H - 3);
  for (const s of [-1, 1]) { a.box(cx + s * (W / 2 - 0.0) + (s > 0 ? 0 : -ear), a.YB - 3, z0 + H * 0.38, cx + s * (W / 2) + (s > 0 ? ear : 0), a.YB, z0 + H * 0.62); a.cyl(cx + s * (W / 2 + ear / 2), a.YB - 1.5, z0 + H * 0.5 - 0.0, z0 + H * 0.5 + 0.01, 0.01, 3); }
  const sx = W / 2 - 8, sz = H / 2 - 8;
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) screwY(a, cx + x * sx, z0 + H / 2 + z * sz, yF + 1.2, 3.0, 2.0);
  const nG = v.glands;
  for (let i = 0; i < nG; i++) { const x = cx - W * 0.3 + ((W * 0.6) * (i + 0.5)) / nG; a.cyl(x, a.cy + 0.0, z0 - 0.0, z0 + 0.0 + 0.01, 0.01, 3); a.ycyl(yF + lid + 4, yF + lid + 4.01, x, z0 + 0.5, 0.01, 3); }
  for (let i = 0; i < nG; i++) { const x = cx - W * 0.3 + ((W * 0.6) * (i + 0.5)) / nG; a.cyl(x, yF + D * 0.55, z0 - 0.0, z0 + 0.01, 0.01, 3); a.add(TUBE([[x, yF + D * 0.55, z0 - 8], [x, yF + D * 0.55, z0 + 0.5]], [4.2, 4.2], 10)); a.add(TUBE([[x, yF + D * 0.55, z0 - 16], [x, yF + D * 0.55, z0 - 8]], [3, 3], 10).slice(0, 0)); }
  a.rect(cx - W / 2, yF, cx + W / 2, a.YB); a.rect(cx - W / 2 + 3, yF, cx + W / 2 - 3, yF + 1.2, 'EQUIP-DETAIL');
  for (let i = 0; i < nG; i++) { const x = cx - W * 0.3 + ((W * 0.6) * (i + 0.5)) / nG; a.circ(x, yF + D * 0.55, 4.2, 'EQUIP-DETAIL'); }
  for (const [x, z] of [[-1, -1], [1, -1]]) a.circ(cx + x * sx, yF + 2, 3, 'EQUIP-DETAIL');
  a.log(`Added the box with a stepped lid on four slotted screws, wall-mount ears and ${nG} cable glands on the underside (plan and 3D).`);
}
function caseHard(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, ls = H * 0.38;
  soft(a, cx, a.cy, W, D, 12, z0, z0 + H, 6);
  a.box(cx - W / 2 - 0.5, yF - 0.3, z0 + ls - 1.2, cx + W / 2 + 0.5, yF, z0 + ls + 1.2);                              // lid/base seam
  for (const s of [-1, 1]) { const x = cx + s * W * 0.3; a.box(x - 15, yF - 3, z0 + ls - 10, x + 15, yF, z0 + ls + 2); a.box(x - 12, yF - 4, z0 + ls + 2.5, x + 12, yF - 3, z0 + ls + 6); a.box(x - 15, yF - 3, z0 + ls + 2, x + 15, yF, z0 + ls + 14); a.ycyl(yF - 5, yF - 3, x, z0 + ls - 4, 2.5, 8); }   // latches
  a.tube([[cx - W * 0.18, a.cy, z0 + H - 1], [cx - W * 0.16, a.cy, z0 + H + 0.0], [cx + W * 0.16, a.cy, z0 + H + 0.0], [cx + W * 0.18, a.cy, z0 + H - 1]].map(([x, y, z]) => [x, y, z - 0.0]), [4, 4, 4, 4], 8);
  a.box(cx - W * 0.2, a.cy - 7, z0 + H - 3.5, cx + W * 0.2, a.cy + 7, z0 + H - 0.3);
  a.box(cx - W * 0.2, yF + D * 0.5 - 7, z0 + H - 0.3, cx + W * 0.2, yF + D * 0.5 + 7, z0 + H - 0.2);
  for (const s of [-1, 1]) { a.box(cx + s * (W / 2 - 14) - 12, a.YB, z0 + ls - 8, cx + s * (W / 2 - 14) + 12, a.YB, z0 + ls + 8); a.ycyl(a.YB - 3, a.YB - 0.5, cx + s * W * 0.34, z0 + ls, 3, 8); }   // hinges at the back
  for (const [x, z] of [[-1, 0], [1, 0], [-1, 1], [1, 1]]) a.box(cx + x * (W / 2 - 9), yF - 1.2, z0 + (z ? H - 9 : 0), cx + x * (W / 2 + 0.0) + (x < 0 ? -0.5 : 0.5) * 0, yF, z0 + (z ? H : 9));
  for (const x of [-1, 1]) for (const z of [0, 1]) a.box(cx + x * (W / 2 - 14) - (x > 0 ? 0 : 0), yF - 1.6, z0 + (z ? H - 14 : 0), cx + x * (W / 2 + 0.0), yF, z0 + (z ? H : 14));   // corner guards
  a.tube([[cx - W * 0.17, yF + D * 0.5, z0 + H], [cx - W * 0.15, yF + D * 0.5, z0 + H + 0.01]], [0.1, 0.1], 3);
  planRR(a, cx, a.cy, W, D, 12); a.rect(cx - W * 0.2, a.cy - 7, cx + W * 0.2, a.cy + 7, 'EQUIP-DETAIL'); a.line(cx - W / 2, a.cy, cx + W / 2, a.cy, 'EQUIP-HIDDEN');
  a.log('Added the softened hard case with a lid and base seam, two draw latches, back hinges, corner guards and a top carry handle (plan and 3D).');
}
function panelBox(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, dd = 4;
  a.box(cx - W / 2 + 6, yF + dd + 6, z0 + 6, cx + W / 2 - 6, a.YB, z0 + H - 6);                                         // cabinet
  a.box(cx - W / 2, yF, z0, cx + W / 2, yF + dd + 6, z0 + H);                                                           // door
  a.box(cx - W / 2 + 7, yF - 1.2, z0 + 7, cx + W / 2 - 7, yF, z0 + H - 7);                                              // raised door panel
  a.frame(cx - W / 2 + 12, z0 + 12, cx + W / 2 - 12, z0 + H - 12, yF - 2, yF - 1.2, 1.8);
  for (const s of [-1, 1]) { const x = cx + s * (W / 2 + 3); a.cyl(x, a.cy - 0.0, z0 + H * 0.12, z0 + H * 0.28, 4, 8); }
  for (const zz of [0.16, 0.84]) a.cyl(cx - W / 2 - 1.5, yF + dd + 3, z0 + H * zz - 6, z0 + H * zz + 6, 3.4, 10);        // door hinges
  a.ycyl(yF - 6, yF - 1.2, cx + W / 2 - 22, z0 + H / 2, 6, 14); a.box(cx + W / 2 - 22 - 9, yF - 9, z0 + H / 2 - 2.5, cx + W / 2 - 22 + 9, yF - 6, z0 + H / 2 + 2.5);   // quarter-turn latch
  if (v.window) { a.frame(cx - W * 0.28, z0 + H * 0.3, cx + W * 0.18, z0 + H * 0.74, yF - 1.8, yF - 1.2, 3); }
  for (const [x, z] of [[-1, 0], [1, 0], [-1, 1], [1, 1]]) a.box(cx + x * (W / 2 + 12) - 12, a.YB - 3, z0 + (z ? H - 14 : 8), cx + x * (W / 2 + 12) + 12, a.YB, z0 + (z ? H - 8 : 14));
  for (const s of [-1, 1]) for (const z of [0.14, 0.86]) { a.box(cx + s * (W / 2) - (s > 0 ? 0 : 14) + (s > 0 ? 0 : 0), a.YB - 3, z0 + H * z - 10, cx + s * (W / 2) + (s > 0 ? 14 : 0), a.YB, z0 + H * z + 10); }
  a.rect(cx - W / 2, yF, cx + W / 2, a.YB - 0.0); a.rect(cx - W / 2 + 6, yF + dd + 6, cx + W / 2 - 6, a.YB, 'EQUIP-DETAIL');
  a.arc(cx - W / 2, yF, W - 8, 270, 360, 'EQUIP-SWING'); a.line(cx - W / 2, yF, cx - W / 2, yF - (W - 8), 'EQUIP-SWING');
  a.log('Added the cabinet with a hinged flanged door, a raised panel' + (v.window ? ', an inspection window' : '') + ', a quarter-turn latch, door hinges and (in plan) the door swing (plan and 3D).');
}
function projectBox(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF;
  soft(a, cx, a.cy, W, D, 5, z0, z0 + H - 3, 2); a.box(cx - W / 2 + 1, yF + 1, z0 + H - 4, cx + W / 2 - 1, a.YB - 1, z0 + H - 0.2);     // body and lid
  a.box(cx - W / 2 - 0.0, yF - 0.3, z0 + H - 4.4, cx + W / 2, yF, z0 + H - 3.6);                                                          // lid seam
  slotsY(a, cx - W * 0.35, cx + W * 0.1, z0 + H * 0.3, z0 + H * 0.62, yF, v.vents, 1.6);                                          // vent slots
  for (const [x, z] of [[-1, 0], [1, 0], [-1, 1], [1, 1]]) a.ycyl(yF - 0.8, yF, cx + x * (W / 2 - 6), z0 + (z ? H - 8 : 8), 1.6, 8);   // screw heads
  a.box(cx + W / 2 - 0.4, a.cy - 6, z0 + H * 0.34, cx + W / 2, a.cy + 6, z0 + H * 0.66);                                               // side cable slot
  a.ycyl(yF - 1.6, yF, cx + W * 0.32, z0 + H * 0.46, 3, 12);                                                                            // LED window
  a.cyl(cx - W * 0.3, yF + 2, z0 + H - 3, z0 + H - 3.01, 0.01, 3);
  planRR(a, cx, a.cy, W, D, 5); a.rect(cx - W / 2 + 4, yF + 4, cx + W / 2 - 4, a.YB - 4, 'EQUIP-HIDDEN');
  for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.circ(cx + x * (W / 2 - 6), a.cy + y * (D / 2 - 6), 3, 'EQUIP-HIDDEN');
  for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.cyl(cx + x * (W / 2 - 6), a.cy + y * (D / 2 - 6), z0 + 1.5, z0 + H - 4, 2.4, 8);
  a.log('Added the rounded body and lid with seam, four corner screw bosses, vent slots, an LED window, side cable slot and screw heads (plan and 3D).');
}
function finBox(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, fin = v.fins, fh = 14;
  a.box(cx - W / 2 + fh, yF, z0 + 4, cx + W / 2 - fh, a.YB, z0 + H - 4 - 0.0);                                         // core
  for (let i = 0; i < fin; i++) { const z = z0 + 4 + ((H - 8 - 3) * i) / (fin - 1); for (const s of [-1, 1]) a.box(s > 0 ? cx + W / 2 - fh : cx - W / 2, yF, z, s > 0 ? cx + W / 2 : cx - W / 2 + fh, a.YB, z + 3); }   // side fins
  a.box(cx - W / 2 + fh, yF - 0.0, z0, cx + W / 2 - fh, a.YB, z0 + 4); a.box(cx - W / 2 + fh, yF, z0 + H - 4, cx + W / 2 - fh, a.YB, z0 + H);
  a.box(cx - W / 2 + fh + 3, yF - 2, z0 + 8, cx + W / 2 - fh - 3, yF, z0 + H - 8);                                       // front plate
  for (const [x, z] of [[-1, 0], [1, 0], [-1, 1], [1, 1]]) screwY(a, cx + x * (W / 2 - fh - 8), z0 + (z ? H - 10 : 10), yF - 2, 2.6, 1.6);
  for (let i = 0; i < 3; i++) a.ycyl(yF - 6, yF - 2, cx - W * 0.1 + i * W * 0.1, z0 + H * 0.5, 4.2, 10);
  for (let i = 0; i < 3; i++) a.cyl(cx - W * 0.12 + i * W * 0.12, yF - 2, z0 + H * 0.4, z0 + H * 0.4, 0, 3);
  for (let i = 0; i < 3; i++) a.ycyl(yF - 6, yF - 2, cx - W * 0.14 + i * W * 0.14, z0 + H * 0.5, 4.2, 10);
  a.rect(cx - W / 2, yF, cx + W / 2, a.YB); a.rect(cx - W / 2 + fh, yF, cx + W / 2 - fh, a.YB, 'EQUIP-DETAIL');
  a.log(`Added the central housing with ${fin} cooling fins on each side, a front plate with four screws and three connector sockets (plan and 3D).`);
}
function dinBox(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, mod = 17.5, n = v.mods;
  a.box(cx - W / 2, yF + 14, z0, cx + W / 2, a.YB, z0 + H);                                                              // base
  a.box(cx - W / 2, yF + 6, z0 + H * 0.28, cx + W / 2, yF + 14, z0 + H * 0.72);                                         // device window carrier
  a.box(cx - W / 2, yF + 2, z0 + H * 0.04, cx + W / 2, yF + 14, z0 + H * 0.28 - 0.0);                                     // terminal shoulder bottom
  a.box(cx - W / 2, yF + 2, z0 + H * 0.72, cx + W / 2, yF + 14, z0 + H * 0.96);
  for (let i = 0; i < n; i++) { const x0 = cx - W / 2 + 3 + i * mod, x1 = x0 + mod - 3; a.box(x0, yF, z0 + H * 0.3, x1, yF + 6, z0 + H * 0.7); a.box(x0 + 2, yF - 0.8, z0 + H * 0.34, x1 - 2, yF, z0 + H * 0.66); }
  a.box(cx - W / 2 + 3, yF - 0.8, z0 + H * 0.34, cx + W / 2 - 3, yF, z0 + H * 0.37);
  prismY(a, [[cx - W / 2, z0 + H * 0.74], [cx + W / 2, z0 + H * 0.74], [cx + W / 2 - 4, z0 + H * 0.94], [cx - W / 2 + 4, z0 + H * 0.94]], yF + 2, yF + 3);
  for (let i = 0; i < n * 2; i++) { const x = cx - W / 2 + 6 + ((W - 12) * (i + 0.5)) / (n * 2); a.ycyl(yF + 1, yF + 2.2, x, z0 + H * 0.9, 2.2, 8); a.ycyl(yF + 1, yF + 2.2, x, z0 + H * 0.1, 2.2, 8); }   // terminal screws
  a.box(cx - W / 2 - 0.0, yF + 8, z0 - 0.0, cx + W / 2, yF + 14, z0 + 3.0);
  a.box(cx - 20, a.YB, z0 + H * 0.5 - 5, cx + 20, a.YB, z0 + H * 0.5 + 5);
  a.rect(cx - W / 2, yF + 2, cx + W / 2, a.YB); for (let i = 0; i < n; i++) a.rect(cx - W / 2 + 3 + i * mod, yF, cx - W / 2 + 3 + i * mod + mod - 3, yF + 6, 'EQUIP-DETAIL');
  a.log(`Added the stepped base with terminal shoulders, ${n} modular device windows and ${n * 4} terminal screws (plan and 3D).`);
}
function instrument(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, foot = 6;
  for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.cyl(cx + x * (W / 2 - 18), a.cy + y * (D / 2 - 18), z0, z0 + foot, 7, 10);
  a.box(cx - W / 2, yF + 3, z0 + foot, cx + W / 2, a.YB, z0 + H);                                                             // case
  a.box(cx - W / 2, yF, z0 + foot, cx + W / 2, yF + 3, z0 + H);                                                               // front panel
  a.box(cx - W / 2 + 4, yF - 0.8, z0 + foot + 4, cx + W / 2 - 4, yF, z0 + H - 4);
  a.box(cx - W * 0.4, yF - 1.6, z0 + H * 0.58, cx - W * 0.05, yF - 0.8, z0 + H * 0.92);                                       // display
  a.box(cx - W * 0.38, yF - 2.0, z0 + H * 0.62, cx - W * 0.07, yF - 1.6, z0 + H * 0.88);
  for (let i = 0; i < v.knobs; i++) { const x = cx + W * 0.02 + ((W * 0.44) * (i + 0.5)) / v.knobs; a.ycyl(yF - 10, yF - 0.8, x, z0 + H * 0.66, H * 0.1, 18); a.ycyl(yF - 11, yF - 10, x, z0 + H * 0.66, H * 0.075, 18); a.box(x - 0.8, yF - 11.3, z0 + H * 0.66, x + 0.8, yF - 11, z0 + H * 0.66 + H * 0.08); }
  for (let i = 0; i < v.knobs; i++) { const x = cx + W * 0.02 + ((W * 0.44) * (i + 0.5)) / v.knobs; a.ycyl(yF - 4, yF - 0.8, x, z0 + H * 0.28, 4.5, 10); a.ycyl(yF - 5, yF - 4, x, z0 + H * 0.28, 2.5, 10); }
  slotsY(a, cx - W * 0.4, cx - W * 0.05, z0 + H * 0.14, z0 + H * 0.4, yF - 0.4, 12, 1.6);
  a.ycyl(yF - 3, yF - 0.8, cx - W * 0.42, z0 + H * 0.24, 0.01, 3); a.ycyl(yF - 5, yF - 0.8, cx + W * 0.46, z0 + H * 0.24, 3.4, 10);
  for (let i = 0; i < 6; i++) a.box(cx - W / 2, a.cy - 8 + (i % 2) * 8, z0 + foot + 14 + i * (H - 30) / 7, cx - W / 2 - 0.0, a.cy, z0 + foot + 15 + i * (H - 30) / 7);
  a.rect(cx - W / 2, yF, cx + W / 2, a.YB); a.rect(cx - W / 2 + 4, yF, cx + W / 2 - 4, yF + 3, 'EQUIP-DETAIL');
  for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.circ(cx + x * (W / 2 - 18), a.cy + y * (D / 2 - 18), 7, 'EQUIP-HIDDEN');
  a.log(`Added the case on four feet with a front panel, a display window, ${v.knobs} large knobs with pointers, ${v.knobs} small knobs, a vent grille and a connector (plan and 3D).`);
}
function fanBox(a, v) {
  const cx = a.cx, W = a.W, D = a.D, H = a.H, z0 = a.Z0, yF = a.YF, hood = v.hood;
  a.box(cx - W / 2, yF + 6, z0, cx + W / 2, a.YB, z0 + H - (hood ? 20 : 0));
  a.box(cx - W / 2 + 2, yF, z0 + 2, cx + W / 2 - 2, yF + 6, z0 + H - (hood ? 22 : 2));
  const fr = m.min(W, H) * 0.3, fz = z0 + (H - (hood ? 20 : 0)) / 2;
  a.ycyl(yF - 1, yF, cx, fz, fr * 1.12, 28); a.ycyl(yF - 1.6, yF - 1, cx, fz, fr, 28);
  for (let i = 1; i <= 4; i++) a.add(rotXdir([[cx, yF - 2.4, fz], [cx, yF - 1.6, fz]], [fr * (i / 4.4), fr * (i / 4.4)]).slice(0, 0));
  for (let i = 1; i <= 4; i++) a.add(rotXdirAt(cx, fz, yF - 2.2, yF - 1.6, fr * (i / 4.4)));
  for (let k = 0; k < 12; k++) { const g = (k / 12) * TAU; a.box(cx + fr * m.cos(g) * 0.5 - 0.5, yF - 2.2, fz + fr * m.sin(g) * 0.5 - 0.5, cx + fr * m.cos(g) * 0.5 + 0.5, yF - 1.6, fz + fr * m.sin(g) * 0.5 + 0.5); }
  a.box(cx - fr, yF - 2.2, fz - 0.8, cx + fr, yF - 1.6, fz + 0.8); a.box(cx - 0.8, yF - 2.2, fz - fr, cx + 0.8, yF - 1.6, fz + fr);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) screwY(a, cx + x * (W / 2 - 10), fz + z * (H / 2 - 12 - (hood ? 10 : 0)), yF, 2.6, 1.6);
  if (hood) prismY(a, [[cx - W / 2 - 4, z0 + H - 20], [cx + W / 2 + 4, z0 + H - 20], [cx + W / 2 + 4, z0 + H - 14], [cx + W / 2 - 4, z0 + H - 1], [cx - W / 2 + 4, z0 + H - 1], [cx - W / 2 - 4, z0 + H - 14]], yF - 10, a.YB);
  a.rect(cx - W / 2, yF, cx + W / 2, a.YB); a.circ(cx, yF + 3, fr, 'EQUIP-DETAIL'); if (hood) a.rect(cx - W / 2 - 4, yF - 10, cx + W / 2 + 4, yF, 'EQUIP-DETAIL');
  a.log('Added the sealed box with a lid, a fan guard with concentric rings and cross bars, four slotted screws' + (hood ? ' and a sloping rain hood' : '') + ' (plan and 3D).');
}
function rotXdirAt(cx, z, y0, y1, r) { return TUBE([[cx, y0, z], [cx, y1, z]], [r, r], 24).slice(0, 0).concat(torusY(cx, z, (y0 + y1) / 2, r)); }
function torusY(cx, z, y, r) { return mv(rotX(torus(r, 0.5, 28, 3), m.PI / 2), cx, y, z); }

// ================================================================================================ families
const iv = (rows) => rows;
export default [
  // ---- products
  fam({ cat: 'industrial/products', title: 'Generic portable cylinder speaker', desc: (v) => `Portable cylinder speaker, ${v.h} in tall: a rubber base ring, a round grille shell with ring rows and a top cap with three buttons.`,
    vs: [[2.7, 6.3, 'small'], [3.1, 8.1, 'medium'], [3.9, 10.2, 'large']].map(([d, h, l]) => VI(`${l}, ${h} in`, d, d, h, { h })), build: cylSpeaker }),
  fam({ cat: 'industrial/products', title: 'Generic articulated desk lamp', desc: (v) => `Desk lamp, ${v.h} in tall: a weighted round base, a two-section arm with ball joints and a tilted conical shade.`,
    vs: [VI('compact, 14 in', 9, 5, 14, { h: 14 }), VI('standard, 20 in', 13, 7, 20, { h: 20 }), VI('tall, 26 in', 17, 8, 26, { h: 26 })], build: deskLamp }),
  fam({ cat: 'industrial/products', title: 'Generic cordless jug kettle', desc: (v) => `Cordless kettle, ${v.cap} litre class: a round power base, a tapering body with water window, a domed lid with knob, a spout and a C handle.`,
    vs: [VI('1 litre class', 9.6, 6.5, 8.0, { cap: 1 }), VI('1.5 litre class', 10.2, 7.2, 9.0, { cap: 1.5 }), VI('1.7 litre class', 10.8, 7.6, 9.6, { cap: 1.7 })], build: kettle }),
  fam({ cat: 'industrial/products', title: 'Generic table radio', desc: (v) => `Table radio: a softened cabinet with a slotted speaker grille, a tuning dial window with needle, two knobs and a telescopic aerial${v.handle ? ', plus a carry handle' : ''}.`,
    vs: [VI('compact, 8 in', 8, 3.2, 5, { handle: false }), VI('tabletop, 12 in', 12, 4.6, 7, { handle: false }), VI('large with handle, 16 in', 16, 5.6, 10, { handle: true })], build: radio }),
  fam({ cat: 'industrial/products', title: 'Generic hair dryer', desc: (v) => `Hair dryer: a barrel with intake grille and front lip, an angled handle with switch pod${v.conc ? ' and a flat concentrator nozzle' : ''}.`,
    vs: [VI('compact travel', 7.5, 2.6, 7.6, { conc: false }), VI('standard', 9.8, 3.1, 9.0, { conc: true }), VI('professional long', 11.5, 3.4, 9.8, { conc: true })], build: hairDryer }),
  fam({ cat: 'industrial/products', title: 'Generic hair straightener and tong', desc: (v) => v.tong ? 'Curling tong: a long heated barrel with a tip, a handle section and a spring clamp arm.' : 'Flat hair straightener: two long arms with a hinge block, a pivot, two heated plates and a slide switch.',
    vs: [VI('flat plates, 10 in', 10.4, 2.4, 1.8, { tong: false }), VI('curling tong, 1 in barrel', 12, 2.6, 2.4, { tong: true })], build: hairIron }),
  fam({ cat: 'industrial/products', title: 'Generic designed toaster', desc: (v) => `Toaster: a softened body on four feet with ${v.slots} bread slots, a lift lever with slot, a browning dial and a cancel button.`,
    vs: [VI('two slice', 11, 6.5, 7.5, { slots: 2, long: false }), VI('four slice', 15, 11, 7.5, { slots: 4, long: false }), VI('two long slots', 14, 7, 7.5, { slots: 2, long: true })], build: toaster }),
  fam({ cat: 'industrial/products', title: 'Generic jug blender', desc: (v) => `Jug blender: a softened motor base with a dial, a tapering jar with collar, lid and cap and a handle, ${v.l} litre class.`,
    vs: [VI('1 litre class', 7.2, 7.2, 15, { l: 1 }), VI('1.75 litre class', 8.2, 8.2, 17.5, { l: 1.75 })], build: blender }),
  fam({ cat: 'industrial/products', title: 'Generic bookshelf speaker', desc: () => 'Bookshelf speaker: a softened cabinet on four feet with a baffle plate, a woofer and a tweeter with surrounds and cones, and a flared bass port.',
    vs: [VI('small, 8 in', 5, 6.5, 8, {}), VI('medium, 12 in', 7, 9, 12, {}), VI('large, 16 in', 9, 11, 16, {})], build: bookSpeaker }),
  // ---- handheld
  fam({ cat: 'industrial/handheld', title: 'Generic game controller', desc: () => 'Handheld game controller: a body with two angled grips, a d-pad, four face buttons, two thumb sticks, centre buttons and shoulder bumpers.',
    vs: [VI('standard, 6.2 in', 6.2, 2.4, 4.0, {}), VI('compact, 5.2 in', 5.2, 2.1, 3.4, {}), VI('wide with rear paddles, 6.6 in', 6.6, 2.5, 4.2, { paddles: true })], build: gamepad }),
  fam({ cat: 'industrial/handheld', title: 'Generic hand torch', desc: (v) => `Hand torch, ${v.L} in long: a tail cap with a push switch, a knurled grip tube, a pocket clip and a flared head with reflector and lamp.`,
    vs: [[3.6, 0.9, 1.2], [5.5, 1.1, 1.5], [8, 1.5, 2.0], [11, 1.9, 2.5]].map(([L, d, h]) => VI(`${L} in`, L, d * 1.0 + 0.8, h + 0.4, { L, head: L < 5 })), build: torch }),
  fam({ cat: 'industrial/handheld', title: 'Generic remote control', desc: (v) => `Remote control: a softened slab with a power key, a round navigation pad and a ${v.cols} x ${v.rows} grid of keys.`,
    vs: [VI('slim, 6.5 in', 1.6, 0.6, 6.5, { cols: 3, rows: 3 }), VI('standard, 8 in', 1.9, 0.9, 8, { cols: 3, rows: 5 }), VI('large keys, 8.5 in', 2.3, 0.9, 8.5, { cols: 3, rows: 4, big: true })], build: remote }),
  fam({ cat: 'industrial/handheld', title: 'Generic smartphone', desc: (v) => `Smartphone: a rounded slim body with a front glass panel, speaker slot and sensors, side keys and a back camera plateau with ${v.lens} lenses.`,
    vs: [VI('5.5 in screen class', 2.9, 0.32, 5.8, { lens: 2 }), VI('6.1 in screen class', 3.0, 0.34, 6.2, { lens: 2 }), VI('6.7 in screen class', 3.1, 0.36, 6.5, { lens: 3 })], build: phone }),
  fam({ cat: 'industrial/handheld', title: 'Generic digital camera', desc: (v) => `Digital camera: a body with ${v.dslr ? 'a viewfinder hump, ' : ''}a grip, mode dial, shutter button, flash window and a ringed lens barrel.`,
    vs: [VI('compact, 4 in', 4.0, 2.6, 2.4, { lensL: 30, dslr: false }), VI('mirrorless body with lens, 5 in', 5.0, 4.4, 3.4, { lensL: 46, dslr: false }), VI('viewfinder body with long lens, 6 in', 6.0, 7.6, 4.8, { lensL: 110, dslr: true })], build: camera }),
  fam({ cat: 'industrial/handheld', title: 'Generic digital multimeter', desc: (v) => `Handheld multimeter${v.holster ? ' in a rubber holster' : ''}: a display, soft keys, a rotary range dial with pointer and three input jacks.`,
    vs: [VI('pocket, 5.5 in', 2.8, 1.0, 5.5, {}), VI('standard, 7 in', 3.6, 1.6, 7, {}), VI('in holster, 7.6 in', 3.9, 1.8, 7.6, { holster: true })], build: multimeter }),
  fam({ cat: 'industrial/handheld', title: 'Generic digital caliper', desc: () => 'Digital caliper: a beam with a scale strip and graduations, fixed and sliding jaws (outside and inside), a sliding head with a display, keys and a thumb wheel.',
    vs: [VI('6 in', 8.4, 0.6, 2.8, {}), VI('8 in', 10.6, 0.6, 2.8, {}), VI('12 in', 15.2, 0.6, 2.8, {})], build: caliper }),
  fam({ cat: 'industrial/handheld', title: 'Generic two-way handheld radio', desc: () => 'Handheld two-way radio: a softened housing with a speaker grille, small display, keys, a channel knob, a push-to-talk bar, a belt clip and an aerial.',
    vs: [VI('pocket, 5.5 in', 2.0, 1.1, 5.5, { ant: 20 }), VI('standard, 7 in', 2.4, 1.5, 7, { ant: 40 }), VI('heavy-duty, 8.5 in', 2.8, 1.8, 8.5, { ant: 56 })], build: walkie }),
  // ---- packaging
  fam({ cat: 'industrial/packaging', title: 'Generic plastic drinks bottle', desc: (v) => `Plastic drinks bottle, ${v.cl}: a lathed body${v.petal ? ' on five feet' : ''} with rib rings, a label band, shoulder, neck ring and a ribbed screw cap.`,
    vs: [VI('0.33 litre', 2.3, 2.3, 8, { cl: '0.33 litre', neck: 0.42, petal: false }), VI('0.5 litre', 2.6, 2.6, 8.8, { cl: '0.5 litre', neck: 0.4, petal: false }), VI('1 litre', 3.4, 3.4, 11.2, { cl: '1 litre', neck: 0.34, petal: true }), VI('1.5 litre', 3.7, 3.7, 12.6, { cl: '1.5 litre', neck: 0.32, petal: true })], build: bottle }),
  fam({ cat: 'industrial/packaging', title: 'Generic glass storage jar', desc: (v) => `Glass jar with a wide mouth, ${v.sz}: a shoulder, a label panel, a thread ring and a knurled screw lid.`,
    vs: [VI('4 oz', 2.2, 2.2, 3.1, { lid: 8, sz: '4 oz' }), VI('8 oz', 2.9, 2.9, 3.9, { lid: 10, sz: '8 oz' }), VI('16 oz', 3.7, 3.7, 5.2, { lid: 12, sz: '16 oz' })], build: jar }),
  fam({ cat: 'industrial/packaging', title: 'Generic drinks can', desc: () => 'Drinks can: a necked body with a curved base, rims, a top panel and a pull tab.',
    vs: [VI('slim 250 ml', 2.2, 2.2, 5.9, {}), VI('standard 330 ml', 2.6, 2.6, 4.8, {}), VI('tall 500 ml', 2.6, 2.6, 6.8, {})], build: can }),
  fam({ cat: 'industrial/packaging', title: 'Generic squeeze tube', desc: (v) => `Squeeze tube standing on its cap, ${v.s}: a ribbed screw cap, a shoulder, a rolled tube body and a flat serrated crimp.`,
    vs: [VI('1 oz', 1.0, 1.0, 4.0, { capH: 14, s: '1 oz' }), VI('3 oz', 1.4, 1.4, 6.0, { capH: 18, s: '3 oz' }), VI('6 oz', 1.9, 1.9, 7.8, { capH: 22, s: '6 oz' })], build: tubeP }),
  fam({ cat: 'industrial/packaging', title: 'Generic tuck-end carton', desc: (v) => `Folding carton${v.window ? ' with a window frame' : ' with a printed label panel'}${v.tab ? ' and a punched hang tab' : ''}: closure flap line and thumb notch.`,
    vs: [VI('small with hang tab', 3, 1, 5.5, { tab: true }), VI('medium with label', 4, 2.4, 6, {}), VI('large with window', 6, 4, 9, { window: true })], build: carton }),
  fam({ cat: 'industrial/packaging', title: 'Generic blister pack card', desc: (v) => `Blister pack: a printed hang card with a header panel and ${v.cols * v.rows} formed clear pods.`,
    vs: [VI('six pods', 4.5, 0.55, 7, { cols: 2, rows: 3, pod: 12 }), VI('ten pods', 5.5, 0.6, 8.5, { cols: 2, rows: 5, pod: 12 }), VI('twelve small pods', 6, 0.5, 9, { cols: 3, rows: 4, pod: 11 })], build: blister }),
  fam({ cat: 'industrial/packaging', title: 'Generic stackable crate', desc: () => 'Open plastic crate: a ribbed vented floor, four walls with grip recesses and ribs, a top rim and corner feet.',
    vs: [VI('15.7 x 11.8 x 6.7 in', 15.7, 11.8, 6.7, { rib: 5 }), VI('23.6 x 15.7 x 9.8 in', 23.6, 15.7, 9.8, { rib: 8 }), VI('23.6 x 15.7 x 12.6 in deep', 23.6, 15.7, 12.6, { rib: 8 })], build: crate }),
  fam({ cat: 'industrial/packaging', title: 'Generic pump dispenser bottle', desc: () => 'Pump dispenser bottle: a round body with a label band, a collar and a pump with stem, actuator head and side nozzle.',
    vs: [VI('8 oz', 2.3, 2.3, 7.2, {}), VI('12 oz', 2.6, 2.6, 8.6, {}), VI('16 oz', 2.9, 2.9, 9.8, {})], build: pumpBottle }),
  // ---- enclosures
  fam({ cat: 'industrial/enclosures', title: 'Generic screw-lid junction box', desc: () => 'Junction box: a box body, a fixed lid with four slotted screws and a gasket line, and side mounting ears.',
    vs: [VI('4 x 4 x 2 in', 4.6, 2.1, 4, { glands: 2 }), VI('6 x 6 x 4 in', 6.6, 4.1, 6, { glands: 3 }), VI('8 x 8 x 4 in', 8.6, 4.1, 8, { glands: 3 }), VI('12 x 12 x 6 in', 12.8, 6.1, 12, { glands: 4 })], build: jboxFull }),
  fam({ cat: 'industrial/enclosures', title: 'Generic hard instrument case', desc: () => 'Hard instrument case: a softened shell with a lid and base seam, two draw latches, back hinges, corner guards and a top carry handle.',
    vs: [VI('12 x 4 x 9 in', 12, 4, 9, {}), VI('16 x 6 x 12 in', 16, 6, 12, {}), VI('22 x 8 x 14 in', 22, 8, 14, {})], build: caseHard }),
  fam({ cat: 'industrial/enclosures', title: 'Generic hinged panel enclosure', desc: (v) => `Wall-mount panel enclosure: a cabinet with a hinged flanged door, a raised panel${v.window ? ', an inspection window' : ''} and a quarter-turn latch.`,
    vs: [VI('12 x 6 x 12 in', 12.6, 6.2, 12.6, {}), VI('16 x 8 x 16 in', 16.6, 8.2, 16.6, {}), VI('24 x 8 x 20 in with window', 24.6, 8.2, 20.6, { window: true }), VI('36 x 10 x 24 in with window', 36.6, 10.2, 24.6, { window: true })], build: panelBox }),
  fam({ cat: 'industrial/enclosures', title: 'Generic bossed bench enclosure', desc: () => 'Project box: a rounded body and lid with seam, four corner screw bosses, vent slots, an LED window and a side cable slot.',
    vs: [VI('3.9 x 2.4 x 1.3 in', 3.9, 2.4, 1.3, { vents: 5 }), VI('6 x 4 x 2 in', 6, 4, 2, { vents: 7 }), VI('8 x 6 x 3 in', 8, 6, 3, { vents: 9 })], build: projectBox }),
  fam({ cat: 'industrial/enclosures', title: 'Generic finned heat-sink enclosure', desc: (v) => `Cast housing with ${v.fins} cooling fins on each side, a front plate with four screws and three connector sockets.`,
    vs: [VI('6 x 4 x 2.2 in', 6, 2.2, 4, { fins: 8 }), VI('8 x 5 x 3 in', 8, 3, 5, { fins: 10 }), VI('11 x 6 x 3.5 in', 11, 3.5, 6, { fins: 12 })], build: finBox }),
  fam({ cat: 'industrial/enclosures', title: 'Generic modular DIN-rail housing', desc: (v) => `Modular rail housing: a stepped base with terminal shoulders, ${v.mods} device windows and ${v.mods * 4} terminal screws.`,
    vs: [VI('4 module', 2.8, 2.6, 3.6, { mods: 4 }), VI('8 module', 5.6, 2.6, 3.6, { mods: 8 }), VI('12 module', 8.4, 2.6, 3.6, { mods: 12 })], build: dinBox }),
  fam({ cat: 'industrial/enclosures', title: 'Generic benchtop instrument enclosure', desc: (v) => `Benchtop instrument case on four feet: a front panel with a display window, ${v.knobs} large and ${v.knobs} small knobs, a vent grille and a connector.`,
    vs: [VI('8 x 7 x 3 in', 8, 7, 3, { knobs: 2 }), VI('12 x 10 x 4 in', 12, 10, 4, { knobs: 3 }), VI('17 x 14 x 5 in', 17, 14, 5, { knobs: 4 })], build: instrument }),
  fam({ cat: 'industrial/enclosures', title: 'Generic fan-cooled electronics enclosure', desc: (v) => `Sealed box with a lid, a fan guard with concentric rings and cross bars, four slotted screws${v.hood ? ' and a sloping rain hood' : ''}.`,
    vs: [VI('8 x 3 x 8 in', 8, 3, 8, { hood: false }), VI('12 x 5 x 12 in outdoor hood', 12.6, 5.4, 12.8, { hood: true })], build: fanBox }),
];

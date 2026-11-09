/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, military: more generic wheeled vehicles and trailers, field shelters and barriers, camp and field gear, depot and airfield support. Plain non-weapon scale shapes; no unit, programme, maker or model. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, FT = 304.8, m = Math, PI = m.PI;

// ------------------------------------------------------------------------------------------ helpers
/** extrude a polygon given as [x, z] points between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** extrude a polygon given as [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** a wheel on a lateral axle at (x, y), radius r, width w, centre height zc, with a hub and optional lugs */
function whl(a, x, y, r, w, zc, lugs = 0) {
  a.xcyl(x - w / 2, x + w / 2, y, zc, r, 18); a.xcyl(x - w / 2 - 6, x + w / 2 + 6, y, zc, r * 0.4, 10); a.xcyl(x - w / 2 + 4, x + w / 2 - 4, y, zc, r * 0.7, 12);
  a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL');
  for (let i = 0; i < lugs; i++) { const g = (i / lugs) * PI * 2; a.box(x - w / 2, y + m.cos(g) * r * 0.98 - r * 0.06, zc + m.sin(g) * r * 0.98 - r * 0.06, x + w / 2, y + m.cos(g) * r * 0.98 + r * 0.06, zc + m.sin(g) * r * 0.98 + r * 0.06); }
}
/** wheel pairs (left and right) at each y, dual rear wheels optional */
function wheelsAt(a, ys, r, ww, dual = []) {
  const xo = a.W / 2 - ww / 2 - 6;
  ys.forEach((y, i) => { for (const s of [-1, 1]) { whl(a, a.cx + s * xo, y, r, ww, a.Z0 + r, 10); if (dual[i]) whl(a, a.cx + s * (xo - ww - 20), y, r, ww, a.Z0 + r, 10); } a.xcyl(a.cx - xo, a.cx + xo, y, a.Z0 + r, r * 0.14, 8); });
}
/** a frame ladder under a body: two rails and cross members */
function frameRails(a, y0, y1, z, hw, t = 70, h = 160) { for (const s of [-1, 1]) a.box(a.cx + s * hw - t / 2, y0, z, a.cx + s * hw + t / 2, y1, z + h); for (let i = 0; i < 6; i++) { const y = y0 + ((y1 - y0) * i) / 5; a.box(a.cx - hw, y - 25, z + h * 0.2, a.cx + hw, y + 25, z + h * 0.8); } }
/** a windscreen frame with posts, seen from the front, at y (opening z0..z1 between x0..x1) */
function glazing(a, x0, x1, y, z0, z1, t = 24, d = 30) { a.frame(x0, z0, x1, z1, y, y + d, t); a.box(x0 + t, y + d * 0.35, z0 + t, x1 - t, y + d * 0.55, z1 - t); }
/** headlamp pair, grille slats and bumper at the vehicle front */
function frontEnd(a, y, zb, zt, hw, lamp = 70) {
  a.box(a.cx - hw, y, zb - 70, a.cx + hw, y + 90, zb + 30);
  for (let i = 0; i < 5; i++) a.box(a.cx - hw * 0.55, y + 12, zb + 70 + i * ((zt - zb - 110) / 5), a.cx + hw * 0.55, y + 44, zb + 70 + i * ((zt - zb - 110) / 5) + (zt - zb - 110) / 8);
  for (const s of [-1, 1]) { a.ycyl(y + 4, y + 50, a.cx + s * hw * 0.78, zt - lamp * 1.2, lamp, 12); a.ycyl(y + 2, y + 20, a.cx + s * hw * 0.78, zb + 40, lamp * 0.45, 8); }
}
/** a post-and-rail from (x0,y0) to (x1,y1) */
function rail(a, x0, y0, x1, y1, z0, z1, t = 14, posts = 3) {
  a.tube([[x0, y0, z1], [x1, y1, z1]], [t, t], 6);
  for (let i = 0; i < posts; i++) { const f = posts === 1 ? 0 : i / (posts - 1); a.tube([[x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z0], [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z1]], [t * 0.8, t * 0.8], 6); }
  a.line(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
function braceXZ(a, x0, x1, y, z0, z1, t = 10) { a.tube([[x0, y, z0], [x1, y, z1]], [t, t], 4); a.tube([[x1, y, z0], [x0, y, z1]], [t, t], 4); }
function braceYZ(a, x, y0, y1, z0, z1, t = 10) { a.tube([[x, y0, z0], [x, y1, z1]], [t, t], 4); a.tube([[x, y1, z0], [x, y0, z1]], [t, t], 4); }
/** canvas cover with bows over a bed: y0..y1, x half width hw, from z0 to z1 */
function canvasCover(a, y0, y1, hw, z0, z1, bows = 4) {
  const poly = [[a.cx - hw, z0], [a.cx + hw, z0], [a.cx + hw, z1 - (z1 - z0) * 0.3], [a.cx + hw * 0.62, z1 - (z1 - z0) * 0.07], [a.cx, z1], [a.cx - hw * 0.62, z1 - (z1 - z0) * 0.07], [a.cx - hw, z1 - (z1 - z0) * 0.3]];
  prismY(a, poly, y0, y1);
  for (let i = 0; i <= bows; i++) { const y = y0 + ((y1 - y0) * i) / bows; prismY(a, poly.map(([x, z]) => [a.cx + (x - a.cx) * 1.012, z + (z > z0 ? (z - z0) * 0.012 : 0)]), y - 9, y + 9); }
  a.rect(a.cx - hw, y0, a.cx + hw, y1, 'EQUIP-DETAIL'); a.line(a.cx, y0, a.cx, y1, 'EQUIP-DETAIL');
}
/** a lifting eye / ring */
function eye(a, x, y, z, r = 30) { a.xcyl(x - 8, x + 8, y, z, r, 10); a.cyl(x, y, z - r * 1.2, z - r * 0.4, 8, 6); }

/** a wheeled truck chassis with a cab: o = { r, ww, axles (mm from the front), dual [bool], cabL, hoodL, cabH, hoodH, fz } ; returns { zf, yb } where the body starts */
function truck(a, o) {
  const { X0, X1, YF, YB, Z0, cx, W } = a, r = o.r, zf = Z0 + r * 1.2, hw = W * 0.44;
  frameRails(a, YF + 120, YB - 40, Z0 + r * 0.85, W * 0.28, 90, zf - Z0 - r * 0.85);
  wheelsAt(a, o.axles.map((y) => YF + y), r, o.ww, o.dual || []);
  for (const y of o.axles.slice(0, o.steer ?? 1)) for (const s of [-1, 1]) a.box(cx + s * (W / 2 - o.ww * 0.5 - 6) - o.ww * 0.62, YF + y - r * 1.05, Z0 + r * 2.0, cx + s * (W / 2 - o.ww * 0.5 - 6) + o.ww * 0.62, YF + y + r * 1.05, Z0 + r * 2.08);
  a.box(cx - hw * 0.9, YF + 40, zf + 40, cx + hw * 0.9, YF + o.hoodL, zf + o.hoodH);
  a.box(cx - hw, YF + o.hoodL, zf + 40, cx + hw, YF + o.hoodL + o.cabL, zf + o.cabH);
  a.frame(cx - hw * 0.84, zf + o.cabH * 0.56, cx + hw * 0.84, zf + o.cabH - 70, YF + o.hoodL - 16, YF + o.hoodL + 6, 26);
  for (const s of [-1, 1]) { a.box(cx + s * hw - 8, YF + o.hoodL + 120, zf + o.cabH * 0.56, cx + s * hw + 8, YF + o.hoodL + o.cabL - 100, zf + o.cabH - 70); a.box(cx + s * hw - 4, YF + o.hoodL + 60, zf + 70, cx + s * hw + 12, YF + o.hoodL + o.cabL - 60, zf + 120);
    a.tube([[cx + s * (hw + 4), YF + o.hoodL + 80, zf + o.cabH * 0.7], [cx + s * (hw + 140), YF + o.hoodL + 20, zf + o.cabH * 0.7]], [8, 8], 5); a.box(cx + s * (hw + 140) - 14, YF + o.hoodL + 5, zf + o.cabH * 0.58, cx + s * (hw + 140) + 14, YF + o.hoodL + 40, zf + o.cabH * 0.82); }
  frontEnd(a, YF, zf, zf + o.hoodH, hw * 0.9, 80);
  a.rect(cx - hw, YF, cx + hw, YF + o.hoodL + o.cabL, 'EQUIP-DETAIL'); a.line(cx - hw, YF + o.hoodL, cx + hw, YF + o.hoodL, 'EQUIP-DETAIL');
  return { zf, yb: YF + o.hoodL + o.cabL + 80, hw };
}

const FAMS = [
  // ===================================================== vehicles =====================================================
  fam({ cat: 'military/vehicles', title: 'Generic light recovery wrecker truck',
    desc: (v) => `${v.drive} recovery truck, ${v.len} in long, unarmed: a cab with windscreen and mirrors, a flat deck with side tool boxes, an A-frame recovery boom with a winch drum, cable and hook, a rear tow eye and ${v.out ? 'two rear stabiliser legs with pads' : 'a rear push bar'}.`,
    vs: [['4x4, light, 230 in', '4x4', 230, 82, 120, 18, 2, false], ['6x6, medium, 300 in', '6x6', 300, 94, 132, 21, 3, true], ['6x6, heavy, 340 in', '6x6', 340, 98, 142, 22, 3, true], ['8x8, heavy, 390 in', '8x8', 390, 100, 150, 23, 4, true]].map(([l, drive, len, w, h, r, ax, out]) => [l, w, len, h, 0, { drive, len, r, ax, out }]),
    build: (a, v) => {
      const r = v.r * IN, L = a.D, W = a.W, cx = a.cx, ww = r * 0.6;
      const axles = v.ax === 2 ? [L * 0.17, L * 0.76] : v.ax === 3 ? [L * 0.15, L * 0.68, L * 0.84] : [L * 0.13, L * 0.27, L * 0.7, L * 0.87];
      const T = truck(a, { r, ww, axles, dual: axles.map((_, i) => v.ax >= 3 && i >= (v.ax === 4 ? 2 : 1)), steer: v.ax === 4 ? 2 : 1, cabL: L * 0.2, hoodL: L * 0.17, cabH: a.H * 0.4, hoodH: a.H * 0.28 });
      const y0 = T.yb, y1 = a.YB - 20, zf = T.zf, bz = zf + 140, hw = W * 0.45, yp = y0 + (y1 - y0) * 0.3;
      a.box(cx - hw, y0, zf, cx + hw, y1, bz);
      for (const s of [-1, 1]) { a.box(cx + s * hw - 30 - (s > 0 ? 30 : 0) + 30, y0 + 60, bz, cx + s * hw + (s > 0 ? -30 : 30), y0 + (y1 - y0) * 0.5, bz + 360); a.box(cx + s * hw - 4 * s, y0 + 80, bz + 120, cx + s * hw + 10 * s, y0 + (y1 - y0) * 0.5 - 40, bz + 320); }
      a.box(cx - hw * 0.5, y0 + 20, bz, cx + hw * 0.5, yp, bz + 640);
      for (const s of [-1, 1]) { a.tube([[cx + s * hw * 0.5, yp - 60, bz + 640], [cx + s * hw * 0.34, y1 - 260, a.Z1 - 80]], [34, 28], 6); a.tube([[cx + s * hw * 0.5, y0 + 80, bz + 40], [cx + s * hw * 0.5, yp - 60, bz + 640]], [30, 30], 6); }
      a.xcyl(cx - hw * 0.34, cx + hw * 0.34, y1 - 260, a.Z1 - 80, 40, 10); a.tube([[cx, y1 - 260, a.Z1 - 80], [cx, y1 - 200, bz + 260]], [10, 10], 5); a.cyl(cx, y1 - 200, bz + 200, bz + 260, 22, 8);
      a.xcyl(cx - hw * 0.4, cx + hw * 0.4, yp + 180, bz + 620, 90, 14); a.xcyl(cx - hw * 0.46, cx + hw * 0.46, yp + 180, bz + 620, 30, 8);
      a.box(cx - 40, y1, bz + 60, cx + 40, y1 + 0, bz + 160); a.xcyl(cx - 60, cx + 60, y1 - 20, bz + 60, 30, 10);
      if (v.out) for (const s of [-1, 1]) { a.box(cx + s * hw * 0.8 - 40, y1 - 140, bz - 160, cx + s * hw * 0.8 + 40, y1 - 40, bz); a.box(cx + s * hw * 0.8 - 90, y1 - 190, a.Z0 + 20, cx + s * hw * 0.8 + 90, y1 - 10, a.Z0 + 60); a.box(cx + s * hw * 0.8 - 20, y1 - 130, a.Z0 + 60, cx + s * hw * 0.8 + 20, y1 - 80, bz - 160); }
      else a.box(cx - hw * 0.8, y1 - 80, zf - 60, cx + hw * 0.8, y1, zf + 60);
      a.rect(cx - hw, y0, cx + hw, y1, 'EQUIP'); a.line(cx - hw * 0.5, yp, cx + hw * 0.5, yp, 'EQUIP-DETAIL'); a.circ(cx, yp + 180, 90, 'EQUIP-DETAIL'); a.line(cx - hw * 0.5, yp, cx - hw * 0.34, y1 - 260, 'EQUIP-DETAIL'); a.line(cx + hw * 0.5, yp, cx + hw * 0.34, y1 - 260, 'EQUIP-DETAIL');
      a.log('Added the ladder frame, wheels, cab, deck with tool boxes, A-frame recovery boom with winch drum, cable and hook' + (v.out ? ' and rear stabiliser legs' : ' and push bar') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic water tanker truck, field',
    desc: (v) => `${v.drive} water tanker, ${v.len} in long, carrying a ${v.gal} US gal horizontal tank: ladder frame, wheels, hood with grille, cab with windscreen and mirrors, tank with a roof manhole dome, stiffening rings, a top walkway with a ladder, a rear pump box with a hose reel and a rear spray bar.`,
    vs: [['4x4, 1,200 gal, 240 in', '4x4', 1200, 240, 86, 108, 18, 2], ['6x6, 2,500 gal, 300 in', '6x6', 2500, 300, 96, 118, 21, 3], ['6x6, 4,000 gal, 340 in', '6x6', 4000, 340, 98, 126, 22, 3], ['8x8, 6,000 gal, 400 in', '8x8', 6000, 400, 100, 134, 23, 4]].map(([l, drive, gal, len, w, h, r, ax]) => [l, w, len, h, 0, { drive, gal, len, r, ax }]),
    build: (a, v) => {
      const r = v.r * IN, L = a.D, W = a.W, cx = a.cx, ww = r * 0.6;
      const axles = v.ax === 2 ? [L * 0.17, L * 0.78] : v.ax === 3 ? [L * 0.15, L * 0.7, L * 0.86] : [L * 0.13, L * 0.27, L * 0.72, L * 0.88];
      const T = truck(a, { r, ww, axles, dual: axles.map((_, i) => v.ax >= 3 && i >= (v.ax === 4 ? 2 : 1)), steer: v.ax === 4 ? 2 : 1, cabL: L * 0.2, hoodL: L * 0.16, cabH: a.H * 0.5, hoodH: a.H * 0.34 });
      const y0 = T.yb, y1 = a.YB - 140, zf = T.zf, tr = (W * 0.46), zc = zf + 120 + tr;
      a.box(cx - W * 0.42, y0 - 20, zf, cx + W * 0.42, y1 + 130, zf + 110);
      a.ycyl(y0 + 40, y1, cx, zc, tr, 24); a.cone(cx, y0 + 40, zc, zc, 0, 0, 3);
      for (const y of [y0 + 40, y1 - 24]) a.ycyl(y, y + 24, cx, zc, tr * 1.04, 24);
      for (let i = 1; i < 4; i++) { const y = y0 + 40 + ((y1 - y0 - 40) * i) / 4; a.ycyl(y - 12, y + 12, cx, zc, tr * 1.03, 24); }
      const mid = (y0 + y1) / 2; a.cyl(cx, mid, zc + tr * 0.96, zc + tr * 1.2, tr * 0.28, 12); a.cyl(cx, mid, zc + tr * 1.2, zc + tr * 1.26, tr * 0.32, 12);
      a.box(cx - 120, y0 + 100, zc + tr * 0.98, cx + 120, y1 - 60, zc + tr * 1.02); a.tube([[cx + tr * 0.85, y0 + 100, zc + tr * 0.5], [cx + tr * 0.4, y0 + 100, zc + tr * 1.02]], [10, 10], 4);
      a.box(cx - W * 0.36, y1 + 20, zf + 110, cx + W * 0.36, a.YB - 10, zf + 700); a.xcyl(cx - W * 0.2, cx + W * 0.2, a.YB - 120, zf + 420, 190, 14); a.xcyl(cx - W * 0.24, cx + W * 0.24, a.YB - 120, zf + 420, 40, 8);
      a.xcyl(cx - W * 0.3, cx + W * 0.3, a.YB - 10, zf + 140, 20, 8); a.circ(cx, a.YB - 120, 190, 'EQUIP-DETAIL');
      a.ycyl(y0 + 40, y1, cx + tr * 0.5, zc - tr * 0.8, 14, 6);
      a.rect(cx - tr, y0 + 40, cx + tr, y1, 'EQUIP'); a.circ(cx, mid, tr * 0.28, 'EQUIP-DETAIL'); a.rect(cx - W * 0.36, y1 + 20, cx + W * 0.36, a.YB - 10, 'EQUIP-DETAIL'); a.line(cx, y0 + 40, cx, y1, 'EQUIP-DETAIL');
      a.log('Added the cab, horizontal tank with rings, manhole dome and top walkway with ladder, rear pump box with hose reel and spray bar, frame and wheels (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic hook-lift container carrier truck',
    desc: (v) => `${v.drive} hook-lift truck, ${v.len} in long, carrying a ${v.box} ft ${v.kind === 'flat' ? 'flat rack' : 'box container'}: ladder frame, wheels, cab with windscreen and mirrors, a sub-frame with a hinged hook arm and lifting hook, rear rollers and a cargo unit with corner posts${v.kind === 'flat' ? ' and lashing rails' : ' and a door at the back'}.`,
    vs: [['4x4, 10 ft box, 250 in', '4x4', 250, 86, 112, 18, 2, 10, 'box'], ['6x6, 20 ft box, 360 in', '6x6', 360, 98, 130, 22, 3, 20, 'box'], ['6x6, 20 ft flat rack, 360 in', '6x6', 360, 98, 112, 22, 3, 20, 'flat']].map(([l, drive, len, w, h, r, ax, box, kind]) => [l, w, len, h, 0, { drive, len, r, ax, box, kind }]),
    build: (a, v) => {
      const r = v.r * IN, L = a.D, W = a.W, cx = a.cx, ww = r * 0.6;
      const axles = v.ax === 2 ? [L * 0.17, L * 0.8] : [L * 0.13, L * 0.66, L * 0.82];
      const T = truck(a, { r, ww, axles, dual: axles.map((_, i) => v.ax === 3 && i > 0), cabL: L * 0.17, hoodL: L * 0.14, cabH: a.H * 0.5, hoodH: a.H * 0.34 });
      const y0 = T.yb, y1 = a.YB - 10, zf = T.zf, hw = W * 0.44, sb = zf + 90;
      for (const s of [-1, 1]) { a.box(cx + s * W * 0.2 - 50, y0, zf, cx + s * W * 0.2 + 50, y1, sb); a.box(cx + s * W * 0.24 - 30, y0 + 60, sb, cx + s * W * 0.24 + 30, y0 + (y1 - y0) * 0.3, sb + 420); }
      a.xcyl(cx - W * 0.28, cx + W * 0.28, y1 - 40, sb + 40, 50, 12);
      a.tube([[cx - W * 0.24, y0 + 60, sb + 400], [cx - W * 0.24, y0 + (y1 - y0) * 0.55, sb + 130], [cx - W * 0.24, y1 - 380, sb + 130]], [26, 26, 26], 6); a.tube([[cx + W * 0.24, y0 + 60, sb + 400], [cx + W * 0.24, y0 + (y1 - y0) * 0.55, sb + 130], [cx + W * 0.24, y1 - 380, sb + 130]], [26, 26, 26], 6);
      a.tube([[cx, y0 + 40, sb + 160], [cx, y0 + (y1 - y0) * 0.3, sb + 300]], [24, 24], 6);
      const by0 = y0 + 160, by1 = y1 - 20, bt = a.Z1 - 20, bb = sb + 150;
      a.box(cx - hw, by0, sb, cx + hw, by1, bb);
      if (v.kind === 'box') { a.box(cx - hw, by0, bb, cx + hw, by1, bt); for (let i = 0; i <= 8; i++) { const y = by0 + ((by1 - by0) * i) / 8; a.box(cx - hw - 6, y - 8, bb + 20, cx + hw + 6, y + 8, bt - 20); } for (const s of [-1, 1]) for (const y of [by0, by1 - 60]) a.box(cx + s * hw - 30, y, bb, cx + s * hw + 30, y + 60, bt); a.box(cx - hw * 0.9, by1 - 4, bb + 100, cx + hw * 0.9, by1, bt - 100); }
      else { for (const s of [-1, 1]) { for (const y of [by0, by1 - 60]) a.box(cx + s * hw - 30, y, bb, cx + s * hw + 30, y + 60, bb + 750); a.tube([[cx + s * hw, by0 + 30, bb + 750], [cx + s * hw, by1 - 30, bb + 750]], [14, 14], 6); a.tube([[cx + s * hw, by0 + 30, bb + 400], [cx + s * hw, by1 - 30, bb + 400]], [12, 12], 6); } a.box(cx - hw, by0, bb, cx + hw, by0 + 40, bb + 750); a.box(cx - hw, by1 - 40, bb, cx + hw, by1, bb + 750); }
      a.rect(cx - hw, by0, cx + hw, by1, 'EQUIP'); a.rect(cx - W * 0.28, y0, cx + W * 0.28, y1, 'EQUIP-DETAIL'); a.line(cx - W * 0.24, y0 + 60, cx - W * 0.24, y1 - 380, 'EQUIP-DETAIL'); a.line(cx + W * 0.24, y0 + 60, cx + W * 0.24, y1 - 380, 'EQUIP-DETAIL');
      a.log('Added the ladder frame, wheels, cab, sub-frame with hinged hook arm and rear rollers, and the ' + (v.kind === 'flat' ? 'flat rack with posts and lashing rails' : 'box container with corner posts and rear door') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic field motorcycle, utility',
    desc: (v) => `${v.cls} utility motorcycle, ${v.len} in long, unarmed: spoked front and rear wheels with tyres, a tubular frame, a fuel tank, a seat, telescopic forks, handlebars with mirrors, an engine block with exhaust, a headlamp and a mudguard${v.pan ? ', plus two side pannier boxes and a rear carrier rack' : ' and a small rear carrier rack'}.`,
    vs: [['light trail, 82 in', 'light', 82, 32, 44, 11, false], ['medium, 90 in', 'medium', 90, 34, 46, 12, false], ['heavy dual-sport with panniers, 98 in', 'heavy', 98, 42, 50, 13, true]].map(([l, cls, len, w, h, r, pan]) => [l, w, len, h, 0, { cls, len, r, pan }]),
    build: (a, v) => {
      const r = v.r * IN, L = a.D, cx = a.cx, ww = r * 0.38, yf = a.YF + r + 40, yr = a.YB - r - 30;
      for (const y of [yf, yr]) { whl(a, cx, y, r, ww, a.Z0 + r, 0); a.xcyl(cx - ww * 0.5, cx + ww * 0.5, y, a.Z0 + r, r * 0.86, 20); }
      a.tube([[cx, yf, a.Z0 + r], [cx, yf + 110, a.Z0 + r * 2.1], [cx, yf + 250, a.Z0 + r * 2.9]], [14, 14, 14], 6);
      a.tube([[cx - 40, yf + 250, a.Z0 + r * 2.9], [cx - 40, yf + 250, a.Z1 - 40], [cx + 40, yf + 250, a.Z1 - 40]], [12, 12, 12], 6); a.tube([[cx + 40, yf + 250, a.Z1 - 40], [cx + 40, yf + 250, a.Z0 + r * 2.9]], [12, 12], 6);
      a.xcyl(cx - a.W * 0.46, cx + a.W * 0.46, yf + 250, a.Z1 - 40, 18, 8); a.box(cx - a.W * 0.46 - 16, yf + 230, a.Z1 - 130, cx - a.W * 0.46 + 4, yf + 280, a.Z1 - 60); a.box(cx + a.W * 0.46 - 4, yf + 230, a.Z1 - 130, cx + a.W * 0.46 + 16, yf + 280, a.Z1 - 60);
      a.ycyl(yf + 330, yf + 380, cx, a.Z0 + r * 2.5, r * 0.5, 14);
      const ey = a.YF + L * 0.5; a.box(cx - 90, ey - 130, a.Z0 + r * 0.9, cx + 90, ey + 130, a.Z0 + r * 1.9);
      a.tube([[cx, yf + 250, a.Z0 + r * 2.7], [cx, ey, a.Z0 + r * 1.9], [cx, yr, a.Z0 + r]], [14, 14, 14], 6); a.tube([[cx, yf + 250, a.Z0 + r * 2.4], [cx, ey + 100, a.Z0 + r * 2.5], [cx, yr - 120, a.Z0 + r * 1.7]], [14, 14, 14], 6);
      a.ell(cx, yf + L * 0.27, a.Z0 + r * 2.9, 130, 230, 110, 14, 8); a.box(cx - 90, yf + L * 0.42, a.Z0 + r * 2.35, cx + 90, yr - 80, a.Z0 + r * 2.7);
      a.ycyl(ey - 60, yr + 60, cx + 120, a.Z0 + r * 0.8, 32, 10); a.box(cx + 100, yr + 60, a.Z0 + r * 0.6, cx + 160, yr + 160, a.Z0 + r * 1.0);
      a.box(cx - 110, yr - 100, a.Z0 + r * 2.0, cx + 110, yr + 140, a.Z0 + r * 2.05 + 20); a.box(cx - 100, yr - r * 0.9, a.Z0 + r * 2.0, cx + 100, yr + r * 0.9, a.Z0 + r * 2.1);
      if (v.pan) for (const s of [-1, 1]) a.box(cx + s * 190 - (s > 0 ? 0 : 150), yr - 220, a.Z0 + r * 1.2, cx + s * 190 + (s > 0 ? 150 : 0), yr + 220, a.Z0 + r * 2.0);
      a.rect(cx - 90, yf, cx + 90, yr, 'EQUIP-DETAIL'); a.ellp(cx, yf + L * 0.27, 130, 230, 'EQUIP-DETAIL'); a.outline();
      a.log('Added the wheels with spokes and tyres, tube frame, forks, handlebars with mirrors, tank, seat, engine, exhaust, headlamp, mudguard and carrier rack' + (v.pan ? ' with side panniers' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic all-terrain quad utility vehicle',
    desc: (v) => `${v.seat}-seat four-wheel all-terrain vehicle, ${v.len} in long, unarmed: four low-pressure lugged wheels, a tube chassis, a fuel tank cover, ${v.seat === 1 ? 'a saddle seat' : 'a bench seat'}, handlebars, a headlamp, mudguards and front and rear carrier racks${v.box ? ', with a tipping cargo box at the back' : ''}.`,
    vs: [['one seat, 72 in', 1, 72, 44, 44, false], ['two seat, 84 in', 2, 84, 48, 46, false], ['two seat with cargo box, 96 in', 2, 96, 50, 48, true]].map(([l, seat, len, w, h, box]) => [l, w, len, h, 0, { seat, len, box }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, r = 10 * IN, ww = r * 0.8, ys = [a.YF + L * 0.2, a.YB - L * 0.2], zc = a.Z0 + r;
      wheelsAt(a, ys, r, ww); a.box(cx - W * 0.3, a.YF + L * 0.08, zc + r * 0.2, cx + W * 0.3, a.YB - L * 0.06, zc + r * 0.5);
      for (const s of [-1, 1]) { a.box(cx + s * W * 0.3 - (s > 0 ? 0 : 60), ys[0] - r * 1.05, zc + r * 0.95, cx + s * W * 0.3 + (s > 0 ? 60 : 0), ys[0] + r * 1.05, zc + r * 1.08); a.box(cx + s * W * 0.3 - (s > 0 ? 0 : 60), ys[1] - r * 1.05, zc + r * 0.95, cx + s * W * 0.3 + (s > 0 ? 60 : 0), ys[1] + r * 1.05, zc + r * 1.08); }
      const fy = a.YF + L * 0.34; a.box(cx - W * 0.28, a.YF + L * 0.06, zc + r * 0.5, cx + W * 0.28, fy, zc + r * 1.2); a.box(cx - W * 0.2, a.YF + L * 0.02, zc + r * 0.6, cx + W * 0.2, a.YF + L * 0.08, zc + r * 1.1);
      for (const s of [-1, 1]) a.ycyl(a.YF + 6, a.YF + 40, cx + s * W * 0.2, zc + r * 0.9, 40, 10);
      a.ell(cx, fy + 100, zc + r * 1.4, 160, 200, 110, 12, 6); a.tube([[cx - 40, fy + 180, zc + r * 1.4], [cx - 40, fy + 200, a.Z1 - 20], [cx + 40, fy + 200, a.Z1 - 20], [cx + 40, fy + 180, zc + r * 1.4]], [12, 12, 12, 12], 6); a.xcyl(cx - W * 0.36, cx + W * 0.36, fy + 200, a.Z1 - 20, 14, 8);
      const sy0 = fy + 320, sy1 = sy0 + (v.seat === 1 ? 430 : 760); a.box(cx - W * 0.2, sy0, zc + r * 1.2, cx + W * 0.2, sy1, zc + r * 1.52); a.box(cx - W * 0.22, sy1 - 40, zc + r * 1.52, cx + W * 0.22, sy1, zc + r * 2.0);
      const ry = a.YB - L * 0.06;
      if (v.box) { a.box(cx - W * 0.4, sy1 + 40, zc + r * 0.9, cx + W * 0.4, ry, zc + r * 1.0); for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 14, sy1 + 40, zc + r * 1.0, cx + s * W * 0.4 + 14, ry, zc + r * 1.8); a.box(cx - W * 0.4, sy1 + 40, zc + r * 1.0, cx + W * 0.4, sy1 + 68, zc + r * 1.8); a.box(cx - W * 0.4, ry - 28, zc + r * 1.0, cx + W * 0.4, ry, zc + r * 1.8); a.rect(cx - W * 0.4, sy1 + 40, cx + W * 0.4, ry, 'EQUIP-DETAIL'); }
      else { a.box(cx - W * 0.34, sy1 + 40, zc + r * 1.15, cx + W * 0.34, ry, zc + r * 1.2); for (let i = 0; i < 4; i++) a.box(cx - W * 0.34 + i * (W * 0.68 - 20) / 3, sy1 + 40, zc + r * 1.2, cx - W * 0.34 + i * (W * 0.68 - 20) / 3 + 20, ry, zc + r * 1.22 + 40); }
      a.box(cx - W * 0.34, a.YF + 40, zc + r * 1.0, cx + W * 0.34, a.YF + L * 0.1, zc + r * 1.05);
      a.rect(cx - W * 0.3, a.YF + L * 0.06, cx + W * 0.3, a.YB - L * 0.04, 'EQUIP-DETAIL'); a.rect(cx - W * 0.2, sy0, cx + W * 0.2, sy1, 'EQUIP-DETAIL'); a.outline();
      a.log('Added four lugged wheels, tube chassis, mudguards, headlamp, tank cover, seat, handlebars and carrier racks' + (v.box ? ' with a tipping cargo box' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic low-loader semi-trailer',
    desc: (v) => `${v.ax}-axle low-loader semi-trailer, ${v.len} in long: a gooseneck with a kingpin plate and landing legs, a drop deck between rails, a raised rear tyre section with ${v.ax} axles of dual wheels, fold-down loading ramps, lashing rings along both sides and rear lamps.`,
    vs: [['2 axle, 360 in', 2, 360, 102, 48], ['3 axle, 470 in', 3, 470, 102, 50], ['4 axle, 560 in', 4, 560, 102, 52], ['5 axle, 640 in', 5, 640, 106, 54]].map(([l, ax, len, w, h]) => [l, w, len, h, 0, { ax, len }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, r = 20 * IN, ww = 10 * IN, hw = W * 0.45, dz = a.Z0 + 300, gz = a.Z0 + 1050, ay = a.YB - L * 0.05;
      const ys = Array.from({ length: v.ax }, (_, i) => ay - i * 1150); wheelsAt(a, ys, r, ww, ys.map(() => true));
      for (const s of [-1, 1]) { a.box(cx + s * hw * 0.78 - 60, a.YF + L * 0.22, dz - 120, cx + s * hw * 0.78 + 60, ys[ys.length - 1] - 900, dz); a.box(cx + s * hw * 0.78 - 60, ys[ys.length - 1] - 900, dz - 120, cx + s * hw * 0.78 + 60, a.YB - 20, gz - 400); }
      a.box(cx - hw, a.YF + L * 0.22, dz, cx + hw, ys[ys.length - 1] - 900, dz + 70); a.box(cx - hw, ys[ys.length - 1] - 900, gz - 400, cx + hw, a.YB - 20, gz - 340);
      for (const s of [-1, 1]) { a.box(cx + s * hw - 30, a.YF + L * 0.22, dz + 70, cx + s * hw + 30, ys[ys.length - 1] - 900, dz + 150); for (let i = 0; i < 8; i++) { const y = a.YF + L * 0.26 + ((ys[ys.length - 1] - 900 - a.YF - L * 0.3) * i) / 7; a.xcyl(cx + s * hw - 20, cx + s * hw + 20, y, dz + 110, 18, 6); } }
      a.prism([[cx - hw, a.YF + 40], [cx + hw, a.YF + 40], [cx + hw * 0.7, a.YF + L * 0.22], [cx - hw * 0.7, a.YF + L * 0.22]], dz, gz); 
      a.prism([[cx - hw, a.YF + 40], [cx + hw, a.YF + 40], [cx + hw, a.YF + 90], [cx - hw, a.YF + 90]], dz, gz + 40); a.cyl(cx, a.YF + 300, gz - 160, gz, 100, 14); a.cyl(cx, a.YF + 300, gz, gz + 40, 220, 18);
      for (const s of [-1, 1]) { a.box(cx + s * hw * 0.5 - 30, a.YF + L * 0.34, a.Z0 + 60, cx + s * hw * 0.5 + 30, a.YF + L * 0.34 + 60, dz); a.box(cx + s * hw * 0.5 - 100, a.YF + L * 0.34 - 20, a.Z0 + 10, cx + s * hw * 0.5 + 100, a.YF + L * 0.34 + 80, a.Z0 + 60); }
      a.box(cx - hw * 0.8, a.YB - 20, gz - 400, cx + hw * 0.8, a.YB - 4, gz - 340);
      for (const s of [-1, 1]) { a.box(cx + s * hw - 40, a.YB - 30, gz - 300, cx + s * hw + 40, a.YB, gz - 200); }
      a.rect(cx - hw, a.YF + 40, cx + hw, a.YB - 20, 'EQUIP'); a.line(cx - hw * 0.7, a.YF + L * 0.22, cx + hw * 0.7, a.YF + L * 0.22, 'EQUIP-DETAIL'); a.line(cx - hw, ys[ys.length - 1] - 900, cx + hw, ys[ys.length - 1] - 900, 'EQUIP-DETAIL'); a.circ(cx, a.YF + 300, 100, 'EQUIP-DETAIL');
      a.log('Added the gooseneck with kingpin plate and landing legs, drop deck with side rails and lashing rings, raised rear section, dual-wheel axles and rear lamps (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic heavy tractor unit, depot',
    desc: (v) => `${v.drive} tractor unit for semi-trailers, ${v.len} in long: ladder frame, ${v.ax} axles with dual rear wheels, a hood with grille and lamps, a ${v.sleeper ? 'cab with a rear sleeper section' : 'day cab'}, windscreen and mirrors, a fifth-wheel plate with air lines, twin vertical exhaust stacks, fuel tanks and cab steps. Unarmed.`,
    vs: [['4x2 day cab, 220 in', '4x2', 220, 100, 134, 21, 2, false], ['6x4 with sleeper, 270 in', '6x4', 270, 102, 150, 22, 3, true], ['6x6 off-road day cab, 290 in', '6x6', 290, 104, 140, 23, 3, false]].map(([l, drive, len, w, h, r, ax, sleeper]) => [l, w, len, h, 0, { drive, len, r, ax, sleeper }]),
    build: (a, v) => {
      const r = v.r * IN, L = a.D, W = a.W, cx = a.cx, ww = r * 0.55, axles = v.ax === 2 ? [L * 0.16, L * 0.78] : [L * 0.15, L * 0.68, L * 0.82];
      const T = truck(a, { r, ww, axles, dual: axles.map((_, i) => i > 0), cabL: L * (v.sleeper ? 0.27 : 0.2), hoodL: L * 0.2, cabH: a.H * 0.72, hoodH: a.H * 0.46 });
      const zf = T.zf, hw = W * 0.44, yb = T.yb;
      for (const s of [-1, 1]) { a.ycyl(a.YF + L * 0.38, a.YF + L * 0.38 + 600, cx + s * (hw + 40), zf + 140, 160, 14); a.cyl(cx + s * (hw * 0.78), a.YF + L * 0.5, zf + 260, a.Z1 - 50, 50, 10); a.cone(cx + s * (hw * 0.78), a.YF + L * 0.5, a.Z1 - 50, a.Z1, 50, 70, 10); }
      a.box(cx - hw * 0.95, yb, zf, cx + hw * 0.95, a.YB - 20, zf + 90);
      a.cyl(cx, a.YB - L * 0.2, zf + 90, zf + 170, hw * 0.55, 20); a.box(cx - hw * 0.5, a.YB - L * 0.2 - 360, zf + 170, cx + hw * 0.5, a.YB - L * 0.2 + 330, zf + 215);
      for (const s of [-1, 1]) a.tube([[cx + s * 130, yb + 40, zf + 90], [cx + s * 130, yb + 40, zf + 300], [cx + s * 200, yb + 140, zf + 360]], [8, 8, 8], 5);
      if (v.sleeper) a.box(cx - hw * 0.98, yb - 20, zf + 100, cx + hw * 0.98, yb + 120, zf + a.H * 0.66); else a.box(cx - hw * 0.9, yb, zf + 60, cx + hw * 0.9, yb + 110, zf + a.H * 0.62);
      a.rect(cx - hw * 0.5, a.YB - L * 0.2 - 360, cx + hw * 0.5, a.YB - L * 0.2 + 330, 'EQUIP-DETAIL'); a.circ(cx, a.YB - L * 0.2, hw * 0.55, 'EQUIP-DETAIL');
      a.log('Added the frame, dual rear wheels, hood and grille, ' + (v.sleeper ? 'cab with sleeper' : 'day cab') + ', fifth-wheel plate with air lines, exhaust stacks, fuel tanks and mirrors (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic towed water bowser trailer',
    desc: (v) => `${v.gal} US gal towed water bowser, ${v.len} in long: a cylindrical tank on ${v.ax === 2 ? 'a tandem axle' : 'a single axle'} with ${v.ax === 2 ? 'four' : 'two'} wheels and mudguards, a draw bar with a lunette eye and a jockey wheel, a top manhole with lid, a rear tap manifold with two taps, a drain valve and a hand-pump.`,
    vs: [['200 gal, 120 in', 200, 120, 58, 56, 1], ['400 gal, 150 in', 400, 150, 66, 62, 1], ['900 gal, 190 in', 900, 190, 78, 76, 1], ['1,500 gal, tandem, 230 in', 1500, 230, 90, 90, 2]].map(([l, gal, len, w, h, ax]) => [l, w, len, h, 0, { gal, len, ax }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, r = (v.ax === 2 ? 14 : 12) * IN, ww = r * 0.55, ys = v.ax === 2 ? [a.YB - L * 0.36, a.YB - L * 0.2] : [a.YB - L * 0.3], tr = W * 0.34, zc = a.Z0 + r * 1.05 + tr, bx0 = a.YF + L * 0.28;
      wheelsAt(a, ys, r, ww); for (const y of ys) for (const s of [-1, 1]) a.box(cx + s * (W / 2 - ww / 2 - 6) - ww * 0.62, y - r * 1.1, a.Z0 + r * 1.9, cx + s * (W / 2 - ww / 2 - 6) + ww * 0.62, y + r * 1.1, a.Z0 + r * 1.98);
      a.box(cx - W * 0.2, bx0, a.Z0 + r * 1.1, cx + W * 0.2, a.YB - 30, a.Z0 + r * 1.1 + 70);
      a.ycyl(bx0, a.YB - 30, cx, zc, tr, 22); for (const y of [bx0, a.YB - 54]) a.ycyl(y, y + 24, cx, zc, tr * 1.05, 22); for (let i = 1; i < 4; i++) { const y = bx0 + ((a.YB - 30 - bx0) * i) / 4; a.ycyl(y - 10, y + 10, cx, zc, tr * 1.03, 22); }
      const mid = (bx0 + a.YB) / 2 - 60; a.cyl(cx, mid, zc + tr * 0.95, zc + tr * 1.25, tr * 0.25, 12); a.cyl(cx, mid, zc + tr * 1.25, zc + tr * 1.3, tr * 0.3, 12);
      a.prism([[cx - 40, a.YF + 140], [cx + 40, a.YF + 140], [cx + 260, bx0 + 80], [cx - 260, bx0 + 80]], a.Z0 + r * 1.1 - 60, a.Z0 + r * 1.1 + 10); a.tube([[cx, a.YF + 60, a.Z0 + r * 1.1 - 25], [cx, a.YF + 150, a.Z0 + r * 1.1 - 25]], [24, 24], 6); a.xcyl(cx - 22, cx + 22, a.YF + 22, a.Z0 + r * 1.1 - 25, 50, 12);
      a.cyl(cx + 100, a.YF + 280, a.Z0 + 70, a.Z0 + r * 1.1 - 40, 16, 8); a.xcyl(cx + 80, cx + 120, a.YF + 280, a.Z0 + 70, 70, 12);
      for (const s of [-1, 1]) { a.ycyl(a.YB - 30, a.YB, cx + s * 120, zc - tr * 0.8, 20, 8); a.ycyl(a.YB - 4, a.YB, cx + s * 120, zc - tr * 0.8, 36, 8); }
      a.ycyl(a.YB - 30, a.YB, cx, zc - tr * 0.55, 14, 8); a.box(cx + tr * 0.4 - 25, bx0 + 80, zc + tr * 0.5, cx + tr * 0.4 + 25, bx0 + 180, zc + tr * 0.9);
      a.rect(cx - tr, bx0, cx + tr, a.YB - 30, 'EQUIP'); a.circ(cx, mid, tr * 0.25, 'EQUIP-DETAIL'); a.line(cx - 40, a.YF + 140, cx - 260, bx0 + 80, 'EQUIP-DETAIL'); a.line(cx + 40, a.YF + 140, cx + 260, bx0 + 80, 'EQUIP-DETAIL'); a.circ(cx, a.YF + 22, 50, 'EQUIP-DETAIL');
      a.log('Added the cylindrical tank with rings and manhole, axle and wheels with mudguards, draw bar with lunette eye and jockey wheel, tap manifold and hand-pump (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic field panel van',
    desc: (v) => `${v.drive} panel van, ${v.len} in long, ${v.kind === 'crew' ? 'with a crew cab, two rows of side windows and a rear load area' : v.kind === 'high' ? 'with a high roof, a side sliding door and rear double doors' : 'with a cab, a side sliding door and rear double doors'}: ladder frame, wheels, hood with grille and lamps, windscreen, mirrors and a roof rail. Unarmed.`,
    vs: [['4x4 short, 185 in', '4x4', 185, 74, 86, 16, 'short'], ['4x4 long, 230 in', '4x4', 230, 76, 90, 17, 'long'], ['4x4 high roof, 250 in', '4x4', 250, 78, 114, 17, 'high'], ['4x4 crew cab, 260 in', '4x4', 260, 80, 92, 18, 'crew']].map(([l, drive, len, w, h, r, kind]) => [l, w, len, h, 0, { drive, len, r, kind }]),
    build: (a, v) => {
      const r = v.r * IN, L = a.D, W = a.W, cx = a.cx, ww = r * 0.6, zf = a.Z0 + r * 1.2, hw = W * 0.45, ys = [a.YF + L * 0.17, a.YB - L * 0.2];
      frameRails(a, a.YF + 100, a.YB - 40, a.Z0 + r * 0.85, W * 0.26, 70, zf - a.Z0 - r * 0.85); wheelsAt(a, ys, r, ww);
      const bf = a.YF + L * 0.2, ce = bf + L * (v.kind === 'crew' ? 0.34 : 0.22), top = a.Z1 - 60;
      a.box(cx - hw * 0.9, a.YF + 40, zf + 40, cx + hw * 0.9, bf, zf + a.H * 0.3); frontEnd(a, a.YF, zf, zf + a.H * 0.3, hw * 0.9, 70);
      a.box(cx - hw, bf, zf + 40, cx + hw, a.YB - 20, top); a.frame(cx - hw * 0.84, zf + a.H * 0.34, cx + hw * 0.84, top - 100, bf - 14, bf + 6, 24);
      for (const s of [-1, 1]) { a.box(cx + s * hw - 6 * s, bf + 80, zf + a.H * 0.36, cx + s * hw + 10 * s, ce - 40, top - 120);
        if (v.kind === 'crew') a.box(cx + s * hw - 6 * s, ce + 40, zf + a.H * 0.36, cx + s * hw + 10 * s, ce + L * 0.2, top - 120);
        a.box(cx + s * hw - 4 * s, ce + (v.kind === 'crew' ? L * 0.3 : 100), zf + 150, cx + s * hw + 10 * s, ce + (v.kind === 'crew' ? L * 0.3 : 100) + L * 0.2, top - 160); a.xcyl(cx + s * hw - 4, cx + s * hw + 4, ce + L * 0.3, zf + 260, 22, 6); a.line(cx + s * hw, ce + 100, cx + s * hw, a.YB - 120, 'EQUIP-DETAIL'); }
      a.box(cx - hw * 0.8, a.YB - 14, zf + 100, cx + hw * 0.8, a.YB, top - 140); a.line(cx, a.YB, cx, a.YB - 200, 'EQUIP-DETAIL'); a.box(cx - hw * 0.9, a.YB - 120, zf - 40, cx + hw * 0.9, a.YB, zf + 30);
      for (const s of [-1, 1]) a.tube([[cx + s * hw * 0.8, bf + 100, top], [cx + s * hw * 0.8, a.YB - 60, top], [cx + s * hw * 0.8, a.YB - 60, top + 50]], [10, 10, 10], 5);
      a.box(cx - 8, bf + 100, top, cx + 8, a.YB - 60, top + 40);
      a.rect(cx - hw, a.YF, cx + hw, a.YB, 'EQUIP'); a.line(cx - hw, bf, cx + hw, bf, 'EQUIP-DETAIL'); a.line(cx - hw, ce, cx + hw, ce, 'EQUIP-DETAIL');
      a.log('Added the frame, wheels, hood with grille and lamps, ' + (v.kind === 'crew' ? 'crew cab' : 'cab') + ' with windscreen and mirrors, side windows, sliding door, rear double doors and roof rails (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic depot tipper truck',
    desc: (v) => `${v.drive} tipper truck, ${v.len} in long, ${v.yd} cubic yard class: ladder frame, wheels, hood with grille and lamps, a cab with a protective canopy over the cab roof, a steel tipping body with a sloped headboard, stiffening ribs, a rear hinge, a hydraulic ram and a ${v.tarp ? 'rolled tarpaulin cover' : 'hinged tailgate'}.`,
    vs: [['4x4, 4 yd, 230 in', '4x4', 4, 230, 86, 106, 18, 2, false], ['6x4, 10 yd, 290 in', '6x4', 10, 290, 98, 122, 21, 3, false], ['6x6, 12 yd, 310 in', '6x6', 12, 310, 100, 126, 22, 3, false], ['8x4, 16 yd, 345 in', '8x4', 16, 345, 100, 132, 22, 4, false], ['6x6, 12 yd with tarpaulin, 310 in', '6x6', 12, 310, 100, 134, 22, 3, true]].map(([l, drive, yd, len, w, h, r, ax, tarp]) => [l, w, len, h, 0, { drive, yd, len, r, ax, tarp }]),
    build: (a, v) => {
      const r = v.r * IN, L = a.D, W = a.W, cx = a.cx, ww = r * 0.6;
      const axles = v.ax === 2 ? [L * 0.17, L * 0.78] : v.ax === 3 ? [L * 0.15, L * 0.7, L * 0.85] : [L * 0.13, L * 0.26, L * 0.72, L * 0.87];
      const T = truck(a, { r, ww, axles, dual: axles.map((_, i) => v.ax >= 3 && i >= (v.ax === 4 ? 2 : 1)), steer: v.ax === 4 ? 2 : 1, cabL: L * 0.19, hoodL: L * 0.16, cabH: a.H * 0.56, hoodH: a.H * 0.38 });
      const y0 = T.yb, y1 = a.YB - 10, zf = T.zf, hw = W * 0.46, bz = zf + 150, top = a.Z1 - (v.tarp ? 160 : 20), hh = top - bz;
      a.box(cx - hw * 0.9, y0 - 60, zf, cx + hw * 0.9, y1, bz);
      prismX(a, [[y0 - 20, bz + hh * 0.35], [y0 + 60, top], [y1, top], [y1, bz + 30], [y0 + 160, bz + 30]], cx - hw, cx + hw);
      prismX(a, [[y0 - 140, bz + hh * 0.9], [y0 + 120, bz + hh * 0.9], [y0 + 40, top + 20], [y0 - 140, top + 20]], cx - hw * 0.94, cx + hw * 0.94);
      for (let i = 1; i < 6; i++) { const y = y0 + 20 + ((y1 - y0 - 80) * i) / 6; for (const s of [-1, 1]) a.box(cx + s * hw - (s > 0 ? 0 : 0) - 10, y, bz + 60, cx + s * hw + 10 * s * 0 + 10, y + 22, top - 20 - (i % 2) * 0); }
      a.box(cx - hw, y1 - 22, bz + 30, cx + hw, y1, top); a.ycyl(y0 + 200, y0 + (y1 - y0) * 0.55, cx, bz - 20, 40, 10); a.xcyl(cx - hw * 0.3, cx + hw * 0.3, y1 - 40, bz - 10, 30, 8);
      if (v.tarp) a.xcyl(cx - hw, cx + hw, y0 + 40, top + 80, 80, 14);
      a.rect(cx - hw, y0 - 20, cx + hw, y1, 'EQUIP'); a.line(cx - hw, y1 - 22, cx + hw, y1 - 22, 'EQUIP-DETAIL'); a.line(cx - hw, y0 + 120, cx + hw, y0 + 120, 'EQUIP-DETAIL');
      a.log('Added the frame, wheels, cab with protective canopy, sloped-headboard tipping body with ribs, rear hinge, hydraulic ram and ' + (v.tarp ? 'rolled tarpaulin' : 'tailgate') + ' (plan and 3D).');
    } }),

  // ===================================================== shelters =====================================================
  fam({ cat: 'military/shelters', title: 'Generic pole tent, mess and assembly',
    desc: (v) => `Large hip-roof pole tent, ${v.tw} by ${v.tl} ft: a canvas roof on ${v.poles} centre poles with a ridge, low canvas side walls on eave poles, two end doors with tied flaps, ${v.win} side windows with flaps, wall ropes to pegs and a rain valance.`,
    vs: [['16 by 32 ft', 16, 32, 2], ['20 by 40 ft', 20, 40, 3], ['24 by 48 ft', 24, 48, 3], ['30 by 60 ft', 30, 60, 4]].map(([l, tw, tl, poles]) => [l, tw * 12 + 40, tl * 12 + 40, tw >= 24 ? 168 : 144, 0, { tw, tl, poles, win: tl / 8 | 0 }]),
    build: (a, v) => {
      const W = a.W, L = a.D, cx = a.cx, ew = 6 * FT, ri = a.Z1, eo = 20, hw = W / 2 - eo, y0 = a.YF + eo, y1 = a.YB - eo, ml = (y1 - y0) * 0.18;
      const poly = [[cx - hw, 0], [cx + hw, 0], [cx + hw, ew], [cx + hw * 0.18, ri - 30], [cx, ri - 30], [cx - hw * 0.18, ri - 30], [cx - hw, ew]].map(([x, z]) => [x, a.Z0 + z]);
      prismY(a, poly, y0 + ml * 0, y1); 
      for (const y of [y0, y1 - 20]) prismY(a, poly.map(([x, z]) => [x, z]), y, y + 20);
      for (let i = 0; i <= v.poles; i++) { const y = y0 + ((y1 - y0) * i) / v.poles; a.tube([[cx, y, a.Z0], [cx, y, ri - 20]], [30, 30], 8); for (const s of [-1, 1]) { a.tube([[cx + s * hw, y, a.Z0], [cx + s * hw, y, ew]], [16, 16], 6); a.box(cx + s * hw - 3 * s - 4, y - 60, a.Z0 + 30, cx + s * hw + 3 * s + 4, y + 60, a.Z0 + ew * 0.9); } }
      a.tube([[cx, y0, ri - 22], [cx, y1, ri - 22]], [22, 22], 8);
      a.box(cx - 3 * 304.8 * 0.5, a.YF + 4, a.Z0, cx + 3 * 304.8 * 0.5, a.YF + 20, a.Z0 + ew * 1.1); a.box(cx - 3 * 304.8 * 0.5, a.YB - 20, a.Z0, cx + 3 * 304.8 * 0.5, a.YB - 4, a.Z0 + ew * 1.1);
      for (let k = 0; k < v.win; k++) { const y = y0 + ((y1 - y0) * (k + 0.5)) / v.win; for (const s of [-1, 1]) a.box(cx + s * hw - 10 + (s > 0 ? 6 : -6), y - 300, a.Z0 + ew * 0.35, cx + s * hw + 10 + (s > 0 ? 6 : -6), y + 300, a.Z0 + ew * 0.75); }
      for (const s of [-1, 1]) for (let i = 0; i <= v.poles * 2; i++) { const y = y0 + ((y1 - y0) * i) / (v.poles * 2); a.tube([[cx + s * hw, y, ew], [cx + s * (hw + eo * 0.95), y + (i % 2 ? 40 : -40), a.Z0 + 20]], [4, 4], 4); a.cyl(cx + s * (hw + eo * 0.95), y + (i % 2 ? 40 : -40), a.Z0, a.Z0 + 40, 8, 6); }
      a.rect(cx - hw, y0, cx + hw, y1, 'EQUIP'); a.line(cx, y0, cx, y1, 'EQUIP-DETAIL'); for (let i = 0; i <= v.poles; i++) a.circ(cx, y0 + ((y1 - y0) * i) / v.poles, 40, 'EQUIP-DETAIL'); a.rect(cx - 457, a.YF, cx + 457, a.YF + 20, 'EQUIP-DETAIL'); a.rect(cx - 457, a.YB - 20, cx + 457, a.YB, 'EQUIP-DETAIL');
      a.log('Added the hip canvas roof, centre poles and ridge, side walls on eave poles, end doors with flaps, windows, wall ropes with pegs (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic inflatable air-beam shelter',
    desc: (v) => `Air-beam shelter, ${v.bays} beams, ${v.tl} ft long by ${v.tw} ft wide: tubular inflated arches on a floor mat, fabric skin between them, an end door opening with a zip flap, a window panel, a ground rail with tie-down loops and a pump valve at the base.`,
    vs: [['3 beam, 15 ft', 3, 15, 18], ['4 beam, 20 ft', 4, 20, 18], ['5 beam, 25 ft', 5, 25, 20], ['6 beam, 30 ft', 6, 30, 22]].map(([l, bays, tl, tw]) => [l, tw * 12, tl * 12, 118, 0, { bays, tl, tw }]),
    build: (a, v) => {
      const W = a.W, L = a.D, cx = a.cx, hw = W / 2 - 30, hh = a.H - 30, y0 = a.YF + 60, y1 = a.YB - 60, n = 14, br = 160;
      const arc = (y, inset = 0) => Array.from({ length: n + 1 }, (_, i) => { const g = (i / n) * PI; return [cx + m.cos(g) * (hw - inset), y, a.Z0 + 20 + m.sin(g) * (hh - inset)]; });
      a.box(cx - hw - 20, a.YF + 20, a.Z0, cx + hw + 20, a.YB - 20, a.Z0 + 20);
      const ys = Array.from({ length: v.bays }, (_, i) => y0 + ((y1 - y0 - 0) * i) / (v.bays - 1));
      for (const y of ys) { const p = arc(y, br * 0.5); a.tube(p, p.map(() => br * 0.5), 8); }
      for (let i = 0; i < ys.length - 1; i++) { const ya = ys[i] + br * 0.5, yb = ys[i + 1] - br * 0.5; const pts = arc(0, br * 0.25); const poly = pts.map(([x, , z]) => [x, z]); prismY(a, poly, ya, yb); }
      const door = ys[0]; a.box(cx - 320, a.YF + 4, a.Z0 + 20, cx + 320, a.YF + 24, a.Z0 + 1900); a.box(cx - 4, a.YF + 24, a.Z0 + 20, cx + 4, a.YF + 30, a.Z0 + 1900);
      a.box(cx - hw * 0.9 - 4, ys[1] - 400, a.Z0 + 800, cx - hw * 0.9 + 12, ys[1] + 400, a.Z0 + 1300);
      for (const y of ys) for (const s of [-1, 1]) a.xcyl(cx + s * (hw + 20) - 20, cx + s * (hw + 20) + 20, y, a.Z0 + 10, 25, 8);
      a.cyl(cx + hw * 0.8, ys[ys.length - 1] + 60, a.Z0 + 20, a.Z0 + 120, 22, 8);
      a.rect(cx - hw - 20, a.YF + 20, cx + hw + 20, a.YB - 20, 'EQUIP'); for (const y of ys) a.line(cx - hw, y, cx + hw, y, 'EQUIP-DETAIL'); a.rect(cx - 320, a.YF, cx + 320, a.YF + 24, 'EQUIP-DETAIL');
      a.log('Added the inflated arch beams, fabric skin between them, floor mat with tie-down loops, end door with flap, window panel and pump valve (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic sentry booth',
    desc: (v) => `Sentry booth, ${v.bw} by ${v.bd} ft: a floor deck on a step, a body with ${v.glaze === 'wrap' ? 'full-height glazing on three sides' : 'a window band on three sides'}, a hinged door with a vision pane and a handle, an overhanging roof with a gutter, a roof beacon and ${v.ac ? 'a wall air conditioner on the back' : 'a roof vent'}.`,
    vs: [['4 by 4 ft', 4, 4, 'band', false], ['6 by 6 ft', 6, 6, 'band', false], ['6 by 8 ft with air conditioner', 6, 8, 'wrap', true], ['8 by 8 ft with desk and canopy', 8, 8, 'wrap', true]].map(([l, bw, bd, glaze, ac]) => [l, bw * 12 + 12, bd * 12 + 12, 112, 0, { bw, bd, glaze, ac }]),
    build: (a, v) => {
      const cx = a.cx, bx0 = a.X0 + 150, bx1 = a.X1 - 150, by0 = a.YF + 150, by1 = a.YB - 50, fl = a.Z0 + 150, wt = fl + 2150, ro = a.Z1, sill = fl + 900, head = wt - 300, dw = 760;
      a.box(a.X0 + 40, a.YF + 40, a.Z0, a.X1 - 40, a.YB - 20, fl); a.box(cx - 300, a.YF + 20, a.Z0, cx + 300, a.YF + 150, fl - 70);
      // wall bands below and above the glazing, three glazed sides and a solid back
      a.box(bx0, by0, fl, bx1, by1, sill); a.box(bx0, by0, head, bx1, by1, wt);
      for (const [x, y] of [[bx0, by0], [bx1 - 70, by0], [bx0, by1 - 70], [bx1 - 70, by1 - 70]]) a.box(x, y, sill, x + 70, y + 70, head);
      a.box(bx0 + 70, by1 - 40, sill, bx1 - 70, by1, head);
      const gl = v.glaze === 'wrap' ? 0 : 1; for (const x of [bx0, bx1 - 20]) a.box(x + (x === bx0 ? 0 : 0), by0 + 70, sill + gl * 60, x + 20, by1 - 70, head - gl * 60);
      a.box(bx0 + 70, by0 + 10, sill + gl * 60, bx0 + dw, by0 + 40, head - gl * 60); a.box(bx0 + dw + 40, by0 - 4, sill + gl * 60, bx1 - 70, by0 + 20, head - gl * 60);
      a.box(bx0 + 70, by0 - 40, fl + 40, bx0 + dw, by0, head - 150); a.xcyl(bx0 + dw - 160, bx0 + dw - 100, by0 - 60, fl + 1100, 22, 6);
      a.box(a.X0, a.YF, wt, a.X1, a.YB, ro - 160); a.box(a.X0 + 30, a.YF + 10, ro - 160, a.X1 - 30, a.YB - 30, ro - 80); a.box(a.X0, a.YF, ro - 80, a.X1, a.YF + 40, ro - 30); a.cyl(cx, (a.YF + a.YB) / 2, ro - 80, ro - 20, 90, 10);
      if (v.ac) a.box(bx1 - 450, by1, fl + 1300, bx1 - 40, by1 + 40, fl + 1700); else a.cyl(bx1 - 300, by1 - 300, wt, wt + 20, 50, 8);
      if (v.bw >= 8) a.box(bx0 + 500, by1 - 420, fl + 700, bx1 - 100, by1 - 70, fl + 740);
      a.outline(); a.rect(bx0, by0, bx1, by1, 'EQUIP-DETAIL'); a.arc(bx0 + 440, by0, 440, 0, 90, 'EQUIP-SWING'); a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP-DETAIL');
      a.log('Added the deck and entry step, glazed body, door with vision pane, overhanging roof with gutter and beacon, and the ' + (v.ac ? 'wall air conditioner' : 'roof vent') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic concrete road barrier, perimeter',
    desc: (v) => `${v.kind} concrete barrier section, ${v.lf} ft long and ${v.hh} in tall: ${v.kind === 'T-wall' ? 'a T-shaped profile with a wide foot, ' : v.kind === 'single-slope' ? 'a single sloped face, ' : 'the stepped safety profile with a low toe, '}a flat top, a base that rests on the ground, two forklift slots, lifting loops on top and joint pins at each end.`,
    vs: [['safety profile, 10 ft', 'safety', 10, 32, 24], ['safety profile, 20 ft', 'safety', 20, 32, 24], ['T-wall, 12 ft', 'T-wall', 12, 144, 60], ['single-slope, 12 ft', 'single-slope', 12, 42, 24]].map(([l, kind, lf, hh, wd]) => [l, wd, lf * 12, hh, 0, { kind, lf, hh }]),
    build: (a, v) => {
      const W = a.W, cx = a.cx, Z0 = a.Z0, H = a.H, hw = W / 2;
      const base = v.kind === 'T-wall' ? [[-hw, 0], [hw, 0], [hw, 300], [hw * 0.2, 400], [hw * 0.2, H], [-hw * 0.2, H], [-hw * 0.2, 400], [-hw, 300]] : v.kind === 'single-slope' ? [[-hw, 0], [hw, 0], [hw, 100], [hw * 0.25, H], [-hw * 0.25, H], [-hw, 100]] : [[-hw, 0], [hw, 0], [hw, 190], [hw * 0.88, 190], [hw * 0.42, H * 0.62], [hw * 0.22, H], [-hw * 0.22, H], [-hw * 0.42, H * 0.62], [-hw * 0.88, 190], [-hw, 190]];
      const poly = base.map(([x, z]) => [cx + x, Z0 + z]); prismY(a, poly, a.YF + 20, a.YB - 20);
      for (const y of [a.YF + 20, a.YB - 40]) a.box(cx - hw * 0.15, y, Z0 + H * 0.5, cx + hw * 0.15, y + 20, Z0 + H * 0.9);
      const n = m.max(2, m.round(v.lf / 5));
      for (let i = 0; i < n; i++) { const y = a.YF + 20 + ((a.D - 40) * (i + 0.5)) / n; a.tube([[cx - 60, y, Z0 + H - 14], [cx, y, Z0 + H - 14], [cx + 60, y, Z0 + H - 14]], [10, 10, 10], 5); }
      for (const y of [a.YF + a.D * 0.3, a.YB - a.D * 0.3]) a.box(cx - hw - 0, y - 60, Z0 + 20, cx + hw, y + 60, Z0 + 90);
      a.outline(); a.rect(cx - hw * 0.25, a.YF + 20, cx + hw * 0.25, a.YB - 20, 'EQUIP-DETAIL'); for (const y of [a.YF + a.D * 0.3, a.YB - a.D * 0.3]) a.line(cx - hw, y, cx + hw, y, 'EQUIP-HIDDEN');
      a.log('Added the ' + v.kind + ' profile, forklift slots, lifting loops and joint pins at the ends (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic wire-mesh filled barrier wall',
    desc: (v) => `Barrier wall of ${v.cells} wire-mesh cells in a ${v.rows === 1 ? 'single row' : v.rows + ' stacked rows'}, each cell 39 in square: a welded mesh basket with corner posts and top rim wires, fabric liner and rock fill, joined to its neighbours with spiral pins${v.step ? ', stepped back at each higher row' : ''}.`,
    vs: [['single row, 4 cells', 4, 1, 4, false], ['two high, 6 cells', 6, 2, 3, false], ['three high, stepped, 9 cells', 9, 3, 3, true], ['two high, 10 cells', 10, 2, 5, false]].map(([l, cells, rows, per, step]) => [l, step ? 39 * 3 + 6 : 39 + 6, per * 39 + 6, rows * 39, 0, { cells, rows, per, step }]),
    build: (a, v) => {
      const cz = 39 * IN, cx = a.cx;
      let k = 0;
      for (let r = 0; r < v.rows; r++) { const n = v.cells === 6 ? 3 : v.cells === 9 ? 3 : v.cells === 4 ? 4 : 5; const cols = v.step ? 4 - (r + 1) : 1; for (let c = 0; c < (v.step ? 1 : 1); c++) { }
        for (let i = 0; i < v.per; i++) { const y0 = a.YF + 3 + i * cz, y1 = y0 + cz, z0 = a.Z0 + r * cz, z1 = z0 + cz, xw = v.step ? (cz * (v.rows - r)) / 1 : cz, x0 = v.step ? a.X0 + 3 : cx - cz / 2, x1 = x0 + (v.step ? cz * (v.rows - r) : cz);
          a.box(x0 + 8, y0 + 8, z0 + 8, x1 - 8, y1 - 8, z1 - 8);
          for (let q = 1; q < 6; q++) { const f = q / 6; a.box(x0 + 3, y0 + (y1 - y0) * f - 3, z1 - 6, x1 - 3, y0 + (y1 - y0) * f + 3, z1); a.box(x0 + 3, y0 - 2, z0 + (z1 - z0) * f - 3, x1 - 3, y0 + 4, z0 + (z1 - z0) * f + 3); a.box(x0 + (x1 - x0) * f - 3, y0 - 2, z0 + 8, x0 + (x1 - x0) * f + 3, y0 + 4, z1 - 8); }
          for (const [xa, xb] of [[x0, x0 + 14], [x1 - 14, x1]]) for (const [ya, yb] of [[y0, y0 + 14], [y1 - 14, y1]]) a.box(xa, ya, z0, xb, yb, z1);
          a.frame(x0, z1 - 14, x1, z1, y0, y1, 14); a.frame(x0, z0, x1, z0 + 14, y0, y1, 14);
          a.tube([[x0, y0 + 4, z0], [x1, y0 + 4, z0 + 0]], [6, 6], 4); a.tube([[x0 + 4, y0, z0 + cz * 0.5], [x0 + 4, y1, z0 + cz * 0.5]], [5, 5], 4); a.tube([[x0, y0, z0 + cz * 0.5], [x1, y0, z0 + cz * 0.5]], [5, 5], 4);
          if (v.step) a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); else a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); k++; } }
      a.outline(); for (let i = 1; i < v.per; i++) a.line(a.X0, a.YF + 3 + i * cz, a.X1, a.YF + 3 + i * cz, 'EQUIP-DETAIL');
      a.log('Added the welded mesh baskets with corner posts, rim wires, fabric liner and rock fill, joined in a row' + (v.rows > 1 ? ' and stacked ' + v.rows + ' high' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic modular accommodation unit',
    desc: (v) => `Modular accommodation unit, ${v.ft} ft long: a steel-framed box on a skid base with corner lifting castings, a ${v.kind === 'double' ? 'pair of doors in the long side' : 'door on the long side'} with ${v.porch ? 'a porch deck, steps and a rail' : 'a step'}, ${v.win} sliding windows, a flat roof with a slight fall and drip rail, a wall air conditioner and an exterior lamp.`,
    vs: [['10 ft', 10, 'single', false, 1], ['20 ft', 20, 'single', false, 2], ['20 ft with porch', 20, 'single', true, 2], ['40 ft office, two doors', 40, 'double', true, 5]].map(([l, ft, kind, porch, win]) => [l, 8 * 12 + (porch ? 48 : 13), ft * 12, 104, 0, { ft, kind, porch, win }]),
    build: (a, v) => {
      const pd = v.porch ? 1219 : 330, bx0 = a.X0, bx1 = a.X1 - pd, by0 = a.YF, by1 = a.YB, sk = a.Z0 + 300, top = a.Z1 - 60;
      a.box(bx0, by0, a.Z0 + 120, bx1, by1, sk);
      for (const y of [by0, by1 - 120]) for (const x of [bx0, bx1 - 120]) a.box(x, y, a.Z0, x + 120, y + 120, top + 60);
      a.box(bx0 + 40, by0 + 40, sk, bx1 - 40, by1 - 40, top); a.box(bx0, by0, top, bx1, by1, top + 40); a.box(bx0 - 0, by0, top + 40, bx1, by0 + 40, top + 60);
      a.box(bx0 + 20, by0 + 20, top + 40, bx1 - 20, by1 - 20, top + 55 + 0);
      for (let i = 1; i < v.ft / 4; i++) { const y = by0 + ((by1 - by0) * i) / (v.ft / 4); a.box(bx0 + 30, y - 4, sk, bx1 - 30, y + 4, top - 20); }
      const fx = bx1; const dw = 900, dh = 2000, dy = v.kind === 'double' ? [by0 + (by1 - by0) * 0.3, by0 + (by1 - by0) * 0.7] : [by0 + 500];
      for (const y of dy) { a.box(fx, y, sk, fx + 30, y + dw, sk + dh); a.box(fx + 30, y + dw - 120, sk + 1000, fx + 60, y + dw - 90, sk + 1060); }
      for (let k = 0; k < v.win; k++) { const y = v.kind === 'double' ? by0 + 500 + k * ((by1 - by0 - 1700) / m.max(1, v.win - 1)) : by0 + 500 + dw + 300 + k * 1100; if (y + 1000 < by1 - 100 && !(v.kind === 'double' && dy.some((d) => y + 1000 > d && y < d + dw))) a.box(fx, y, sk + 900, fx + 40, y + 1000, sk + 1500); }
      a.box(bx0 + 10, by0 + 400, sk + 1100, bx0 - 0, by0 + 400, sk + 1100); a.box(bx0 + 0, by1 - 800, sk + 1300, bx0 + 20, by1 - 200, sk + 1900);
      if (v.porch) { const py0 = dy[0] - 150, py1 = dy[dy.length - 1] + dw + 150; a.box(bx1, py0, sk - 60, a.X1, py1, sk); for (const y of [py0, py1 - 30]) a.box(a.X1 - 30, y, sk, a.X1, y + 30, sk + 1000); a.tube([[a.X1 - 15, py0 + 15, sk + 1000], [a.X1 - 15, py1 - 15, sk + 1000]], [14, 14], 6); a.tube([[a.X1 - 15, py0 + 15, sk + 500], [a.X1 - 15, py1 - 15, sk + 500]], [10, 10], 6); a.box(bx1 + 400, py0 - 0, a.Z0 + 120, a.X1 - 40, py0 + 0, sk); }
      else a.box(fx, dy[0] + 100, a.Z0 + 120, fx + 310, dy[0] + dw - 100, sk - 20);
      a.box(bx0 - 0, by0 + 300, sk + 1300, bx0 + 0, by0 + 300, sk + 1300); a.box(bx1 - 400, by1 - 0, sk + 1600, bx1 - 40, by1, sk + 1900);
      a.ycyl(by0 + 100, by0 + 160, bx1 - 150, sk + 2000, 40, 8);
      a.rect(bx0, by0, bx1, by1, 'EQUIP'); for (const y of dy) { a.line(bx1, y, bx1, y + dw, 'EQUIP-DETAIL'); a.arc(bx1, y, dw, 0, 90, 'EQUIP-SWING'); } if (v.porch) a.rect(bx1, dy[0] - 150, a.X1, dy[dy.length - 1] + dw + 150, 'EQUIP-DETAIL');
      a.log('Added the skid base with lifting corners, framed walls and flat roof with drip rail, door' + (v.kind === 'double' ? 's' : '') + ', sliding windows, ' + (v.porch ? 'porch deck with rail' : 'entry step') + ' and exterior lamp (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic latrine and ablution block',
    desc: (v) => `Camp ${v.kind} block, ${v.ft} ft long: a framed building on a concrete slab with ${v.n} ${v.kind === 'latrine' ? 'cubicles each with a door, a seat riser and a roof vent' : v.kind === 'shower' ? 'shower cubicles each with a door and a head, plus a row of basins' : 'cubicles with doors, a shower row and a basin row'}, a corridor door at each end, a pitched roof${v.tank ? ' carrying a roof water tank on a stand' : ''}, a vent stack and a drain trough along the front.`,
    vs: [['latrine, 4 cubicle, 12 ft', 'latrine', 12, 4, false], ['latrine, 8 cubicle, 24 ft', 'latrine', 24, 8, false], ['shower, 6 cubicle with roof tank, 24 ft', 'shower', 24, 6, true], ['combined, 10 cubicle with roof tank, 32 ft', 'combined', 32, 10, true]].map(([l, kind, ft, n, tank]) => [l, 8 * 12 + 12, ft * 12 + 12, 108 + (tank ? 30 : 0), 0, { kind, ft, n, tank }]),
    build: (a, v) => {
      const bx0 = a.X0 + 150, bx1 = a.X1 - 150, by0 = a.YF + 150, by1 = a.YB - 150, sl = a.Z0 + 150, wh = a.Z0 + 2400, rz = wh + 400, cx = a.cx;
      a.box(a.X0 + 20, a.YF + 20, a.Z0, a.X1 - 20, a.YB - 20, sl); a.box(bx0, by0, sl, bx1, by1, sl + 60);
      for (let i = 0; i <= 4; i++) { const y = by0 + ((by1 - by0) * i) / 4; for (const x of [bx0, bx1 - 70]) a.box(x, y - (i === 4 ? 70 : 0), sl, x + 70, y + (i === 4 ? 0 : 70), wh); }
      a.box(bx0, by0, sl + 60, bx0 + 70, by1, wh); a.box(bx1 - 70, by0, sl + 60, bx1, by1, wh);
      a.box(bx0, by0, sl + 60, bx1, by0 + 70, wh); a.box(bx0, by1 - 70, sl + 60, bx1, by1, wh);
      const cw = (by1 - by0 - 400) / v.n, cy0 = by0 + 200;
      for (let i = 0; i < v.n; i++) { const y = cy0 + i * cw; a.box(bx0 + 70, y - 12, sl + 60, bx0 + 1200, y + 12, wh - 400); a.box(bx0 + 1180, y + cw * 0.12, sl + 60, bx0 + 1214, y + cw * 0.88, wh - 700); a.box(bx0 + 1214, y + cw * 0.55, sl + 1000, bx0 + 1260, y + cw * 0.6, sl + 1050);
        if (v.kind === 'latrine' || (v.kind === 'combined' && i < v.n / 2)) { a.box(bx0 + 120, y + cw * 0.25, sl + 60, bx0 + 620, y + cw * 0.75, sl + 460); a.cyl(bx0 + 370, y + cw * 0.5, sl + 460, sl + 480, 150, 12); a.cyl(bx0 + 130, y + cw * 0.5, wh, wh + 160, 32, 8); }
        else a.cyl(bx0 + 300, y + cw * 0.5, wh - 700, wh - 500, 90, 10); }
      for (let i = 0; i < 4; i++) a.box(bx0 + 30, by0 + 100 + i * ((by1 - by0 - 400) / 3), wh - 650, bx0 + 52, by0 + 400 + i * ((by1 - by0 - 400) / 3), wh - 250);
      const rx = [[bx0 - 60, wh], [bx1 + 60, wh], [bx1 + 60, wh + 50], [cx, rz], [bx0 - 60, wh + 50]].map(([x, z]) => [x, z]); prismY(a, rx, by0 - 100, by1 + 100);
      a.box(cx - 450, by0 + 50, sl, cx + 450, by0 + 80, wh - 300); a.box(cx - 450, by1 - 80, sl, cx + 450, by1 - 50, wh - 300);
      a.cyl(cx + 700, by0 + 700, rz, rz + 60, 90, 8); a.box(a.X0 + 150, a.YF + 40, a.Z0 + 150, a.X0 + 440, by0 - 20, a.Z0 + 190);
      if (v.tank) { for (const x of [cx - 600, cx + 600]) for (const y of [by0 + (by1 - by0) * 0.3, by0 + (by1 - by0) * 0.7]) a.cyl(x, y, rz, rz + 400, 25, 6); a.ycyl(by0 + (by1 - by0) * 0.15, by0 + (by1 - by0) * 0.85, cx, rz + 400 + 320, 320, 18); a.box(cx - 800, by0 + (by1 - by0) * 0.15 - 20, rz + 380, cx + 800, by0 + (by1 - by0) * 0.85 + 20, rz + 410); }
      a.rect(bx0, by0, bx1, by1, 'EQUIP'); for (let i = 1; i < v.n; i++) a.line(bx0 + 70, cy0 + i * cw, bx0 + 1200, cy0 + i * cw, 'EQUIP-DETAIL'); a.line(bx0 + 1200, by0 + 70, bx0 + 1200, by1 - 70, 'EQUIP-DETAIL'); a.rect(a.X0 + 150, a.YF + 40, a.X0 + 440, by0 - 20, 'EQUIP-DETAIL');
      a.log('Added the slab, framed walls, cubicle partitions with doors, ' + (v.kind === 'latrine' ? 'seat risers and vents' : 'shower heads and basins') + ', end doors, pitched roof, vent stack, drain trough' + (v.tank ? ' and roof water tank' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic perimeter vehicle gate',
    desc: (v) => `${v.kind} vehicle gate, ${v.ft} ft opening and ${v.hh} in tall: two concrete-footed gate posts with caps, ${v.kind === 'sliding cantilever' ? 'a cantilever leaf of welded mesh panels on a top rail, a track with two carriages and a counterweight tail, and a latch post' : v.kind === 'double swing' ? 'two swing leaves of welded mesh on a frame with diagonal braces, hinges, a centre drop bolt and a padlock hasp' : 'one swing leaf of welded mesh on a frame with a diagonal brace, hinges and a latch'}, plus barbed-free top rail and a reflective plate at each post.`,
    vs: [['single swing, 12 ft', 'single swing', 12, 96], ['double swing, 20 ft', 'double swing', 20, 96], ['sliding cantilever, 20 ft', 'sliding cantilever', 20, 96], ['sliding cantilever, 30 ft', 'sliding cantilever', 30, 108]].map(([l, kind, ft, hh]) => [l, ft * 12 * (kind === 'sliding cantilever' ? 1.55 : 1) + 24, 24, hh, 0, { kind, ft, hh }]),
    build: (a, v) => {
      const cx = a.cx, my = (a.YF + a.YB) / 2, H = a.H, op = v.ft * FT, slide = v.kind === 'sliding cantilever', x0 = a.X0 + 150, xo = slide ? x0 + op : a.X1 - 150;
      const post = (x) => { a.box(x - 100, my - 100, a.Z0, x + 100, my + 100, a.Z1 - 60); a.box(x - 120, my - 120, a.Z1 - 60, x + 120, my + 120, a.Z1 - 20); a.box(x - 100, a.YF + 4, a.Z0 + 1300, x + 100, my - 100, a.Z0 + 1700); };
      post(x0); post(xo);
      const leaf = (xa, xb, hinge) => { const z0 = a.Z0 + 180, z1 = a.Z1 - 280; a.frame(xa, z0, xb, z1, my - 30, my + 30, 50); const n = m.round((xb - xa) / 150); for (let i = 1; i < n; i++) a.box(xa + ((xb - xa) * i) / n - 4, my - 10, z0 + 50, xa + ((xb - xa) * i) / n + 4, my + 10, z1 - 50); for (const z of [z0 + 400, (z0 + z1) / 2, z1 - 400]) a.box(xa + 50, my - 10, z - 4, xb - 50, my + 10, z + 4); a.tube([[xa + 50, my, z0 + 50], [xb - 50, my, z1 - 50]], [14, 14], 5); a.line(xa, my, xb, my, 'EQUIP'); };
      if (v.kind === 'single swing') { leaf(x0 + 100, xo - 100); a.arc(x0 + 100, my, op - 200, 0, 90, 'EQUIP-SWING'); }
      else if (v.kind === 'double swing') { const mid = (x0 + xo) / 2; leaf(x0 + 100, mid - 20); leaf(mid + 20, xo - 100); a.box(mid - 10, my - 60, a.Z0 + 20, mid + 10, my, a.Z0 + 200); a.arc(x0 + 100, my, op / 2 - 100, 0, 90, 'EQUIP-SWING'); a.arc(xo - 100, my, op / 2 - 100, 90, 180, 'EQUIP-SWING'); }
      else { const tail = op * 0.5, l0 = x0 + 100, l1 = xo + tail; leaf(l0, l1 - 0); a.box(l0, my - 60, a.Z1 - 300, l1, my + 60, a.Z1 - 230); a.box(l0, my - 60, a.Z0 + 100, l1, my + 60, a.Z0 + 140); for (const x of [x0 + 150, xo - 150]) { a.box(x - 100, my - 140, a.Z0 + 20, x + 100, my + 140, a.Z0 + 100); a.xcyl(x - 70, x + 70, my, a.Z1 - 190, 40, 10); } a.box(xo + tail - 100, my - 80, a.Z0 + 180, xo + tail, my + 80, a.Z1 - 280); }
      a.box(x0 + 160, my - 6, a.Z0 + 20, xo - 160, my + 6, a.Z0 + 60);
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP-DETAIL'); for (const x of [x0, xo]) a.rect(x - 100, my - 100, x + 100, my + 100, 'EQUIP');
      a.log('Added the gate posts with caps, ' + (slide ? 'cantilever leaf of mesh panels with track, carriages and counterweight tail' : v.kind === 'double swing' ? 'two swing leaves of mesh with braces, hinges and a centre drop bolt' : 'swing leaf of mesh with brace, hinges and latch') + ', reflective plates and threshold (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic open-sided depot lean-to shed',
    desc: (v) => `Open-sided lean-to storage shed, ${v.wf} by ${v.lf} ft: a sloped corrugated roof on purlins, high front and low rear posts on base plates, a back wall of sheet cladding, ${v.bays} bays with end bracing and ${v.rack ? 'a three-tier steel shelving run along the back wall' : 'a timber pallet stack row'}.`,
    vs: [['12 by 20 ft', 12, 20, 2, false], ['16 by 30 ft with shelving', 16, 30, 3, true], ['20 by 40 ft', 20, 40, 4, false]].map(([l, wf, lf, bays, rack]) => [l, wf * 12, lf * 12, 126, 0, { wf, lf, bays, rack }]),
    build: (a, v) => {
      const cx = a.cx, W = a.W, hz = a.Z1, lz = a.Z0 + 2200, xl = a.X0 + 80, xr = a.X1 - 80, pad = a.Z0 + 100;
      a.box(a.X0 + 20, a.YF + 20, a.Z0, a.X1 - 20, a.YB - 20, pad);
      const ys = Array.from({ length: v.bays + 1 }, (_, i) => a.YF + 100 + ((a.D - 200) * i) / v.bays);
      for (const y of ys) { a.box(xl - 60, y - 60, pad, xl + 60, y + 60, hz - 80); a.box(xr - 60, y - 60, pad, xr + 60, y + 60, lz); a.box(xl - 90, y - 90, pad, xl + 90, y + 90, pad + 20); a.box(xr - 90, y - 90, pad, xr + 90, y + 90, pad + 20); a.tube([[xl, y, hz - 80], [xr, y, lz + 80]], [30, 30], 6); }
      a.box(xr - 10, a.YF + 40, lz - 1800, xr + 40, a.YB - 40, lz); 
      for (let i = 0; i < 9; i++) { const x = xl - 60 + ((xr - xl + 120) * i) / 8; a.box(x, a.YF + 20, hz - 80 + (lz - hz + 80) * (i / 8) - 0, x + 120, a.YB - 20, hz - 20 + (lz - hz + 80) * (i / 8) + 0); }
      for (const y of [ys[0], ys[ys.length - 1]]) { a.tube([[xl, y, pad + 200], [xr, y, lz - 200]], [18, 18], 5); }
      for (let k = 0; k < v.bays; k++) a.box(xl, ys[k] + 20, hz - 600, xr, ys[k + 1] - 20, hz - 580);
      if (v.rack) for (let t = 0; t < 3; t++) { a.box(xr - 560, a.YF + 200, pad + 450 + t * 650, xr - 20, a.YB - 200, pad + 480 + t * 650); for (const y of ys.slice(1, -1).concat([ys[0] + 100, ys[ys.length - 1] - 100])) a.box(xr - 560, y - 20, pad, xr - 520, y + 20, pad + 1950); }
      else for (let i = 0; i < v.bays; i++) { const y = (ys[i] + ys[i + 1]) / 2; for (let l = 0; l < 3; l++) a.box(cx - 500, y - 600, pad + l * 150, cx + 500, y + 600, pad + l * 150 + 130); }
      a.rect(xl - 60, a.YF + 40, xr + 60, a.YB - 40, 'EQUIP'); for (const y of ys) a.line(xl, y, xr, y, 'EQUIP-DETAIL'); a.outline('EQUIP-DETAIL');
      a.log('Added the base plates, posts at two heights, sloped corrugated roof on purlins, back wall cladding, end bracing and ' + (v.rack ? 'three-tier shelving' : 'pallet stacks') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic vehicle wash bay, concrete apron',
    desc: (v) => `Vehicle wash bay, ${v.bw} bays, ${v.lf} ft long: a sloped concrete apron with a kerb, a central drain trough with a grate, a sump pit at the low end, a spray rail on a standpipe along each side with nozzles and a hose reel box${v.roof ? ' and a steel canopy on columns with a pitched roof sheet and a light bar' : ''}.`,
    vs: [['single bay, open, 40 ft', 1, 40, false], ['single bay with canopy, 40 ft', 1, 40, true], ['double bay with canopy, 50 ft', 2, 50, true]].map(([l, bw, lf, roof]) => [l, bw * 16 * 12 + 24, lf * 12, roof ? 216 : 60, 0, { bw, lf, roof }]),
    build: (a, v) => {
      const cx = a.cx, ap = a.Z0 + 250, bwid = (a.W - 300) / v.bw;
      a.box(a.X0, a.YF, a.Z0, a.X1, a.YB, ap - 60); a.box(a.X0, a.YF, ap - 60, a.X1, a.YB, ap);
      for (const x of [a.X0, a.X1 - 140]) a.box(x, a.YF, ap, x + 140, a.YB, ap + 120);
      for (const x of [a.X0, a.X1 - 140]) a.box(x, a.YF, ap, x + 140, a.YB, ap + 120);
      for (let b = 0; b < v.bw; b++) { const x = a.X0 + 150 + bwid * (b + 0.5); a.box(x - 150, a.YF + 100, ap, x + 150, a.YB - 100, ap + 30); for (let i = 0; i < 24; i++) a.box(x - 130, a.YF + 150 + i * ((a.D - 340) / 24), ap + 30, x + 130, a.YF + 150 + i * ((a.D - 340) / 24) + 36, ap + 50); a.box(x - 220, a.YB - 400, ap, x + 220, a.YB - 100, ap + 10);
        for (const s of [-1, 1]) { const xs = x + s * (bwid * 0.5 - 220); for (let k = 0; k < 4; k++) { const y = a.YF + 500 + k * ((a.D - 1500) / 3); a.cyl(xs, y, ap, ap + 1000, 30, 8); a.tube([[xs, y, ap + 1000], [xs - s * 100, y, ap + 1150]], [10, 8], 5); a.box(xs - 60, y - 60, ap + 40, xs + 60, y + 60, ap + 400); } a.tube([[xs, a.YF + 500, ap + 800], [xs, a.YB - 1000, ap + 800]], [18, 18], 6); }
        a.box(x - bwid * 0.5 + 220, a.YB - 300, ap, x - bwid * 0.5 + 520, a.YB - 120, ap + 700); a.rect(x - 150, a.YF + 100, x + 150, a.YB - 100, 'EQUIP-DETAIL'); a.rect(x - 220, a.YB - 400, x + 220, a.YB - 100, 'EQUIP-DETAIL'); }
      if (v.roof) { const cz = a.Z1 - 300; for (const x of [a.X0 + 100, a.X1 - 100, ...(v.bw > 1 ? [cx] : [])]) for (const y of [a.YF + 150, a.YB - 150]) a.box(x - 70, y - 70, ap + 120, x + 70, y + 70, cz); prismY(a, [[a.X0, cz], [a.X1, cz], [a.X1, cz + 200], [cx, a.Z1], [a.X0, cz + 200]], a.YF, a.YB); for (const y of [a.YF + 150, a.YB - 150]) a.box(a.X0 + 40, y - 40, cz - 120, a.X1 - 40, y + 40, cz); a.box(cx - 60, a.YF + 300, cz - 100, cx + 60, a.YB - 300, cz - 40); }
      a.outline(); a.rect(a.X0 + 150, a.YF + 100, a.X1 - 150, a.YB - 100, 'EQUIP-DETAIL');
      a.log('Added the concrete apron with kerb, drain trough and grate, sump pit, side spray rails on standpipes and hose reel box' + (v.roof ? ', and the canopy on columns with light bar' : '') + ' (plan and 3D).');
    } }),

  // ===================================================== field =====================================================
  fam({ cat: 'military/field', title: 'Generic towed field shower trailer',
    desc: (v) => `Towed field shower trailer, ${v.n} cubicles, ${v.len} in long: a boxed body on a single axle with mudguards, a drawbar with a lunette eye and a jockey wheel, ${v.n} side doors each with a louvre and a handle, a roof water tank, a vent stack, a drain manifold at the rear and a heater flue.`,
    vs: [['4 cubicle, 168 in', 4, 168, 80, 100], ['6 cubicle, 220 in', 6, 220, 88, 104], ['8 cubicle, tandem axle, 270 in', 8, 270, 94, 108]].map(([l, n, len, w, h]) => [l, w, len, h, 0, { n, len }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, r = 14 * IN, ww = r * 0.55, hw = W * 0.45, bx0 = a.YF + L * 0.2, ys = v.n >= 8 ? [a.YB - L * 0.3, a.YB - L * 0.16] : [a.YB - L * 0.24], bz = a.Z0 + r * 1.3, top = a.Z1 - 560;
      wheelsAt(a, ys, r, ww); for (const y of ys) for (const s of [-1, 1]) a.box(cx + s * (W / 2 - ww / 2 - 6) - ww * 0.62, y - r * 1.1, a.Z0 + r * 1.85, cx + s * (W / 2 - ww / 2 - 6) + ww * 0.62, y + r * 1.1, a.Z0 + r * 1.95);
      a.box(cx - hw, bx0, bz - 120, cx + hw, a.YB - 20, bz); a.box(cx - hw, bx0, bz, cx + hw, a.YB - 20, top);
      a.prism([[cx - 40, a.YF + 120], [cx + 40, a.YF + 120], [cx + W * 0.2, bx0], [cx - W * 0.2, bx0]], bz - 120, bz - 50); a.xcyl(cx - 25, cx + 25, a.YF + 20, bz - 85, 55, 14); a.cyl(cx + 120, a.YF + 280, a.Z0 + 80, bz - 100, 20, 8); a.xcyl(cx + 100, cx + 140, a.YF + 280, a.Z0 + 80, 80, 12);
      const dw = (a.YB - 20 - bx0 - 300) / v.n; for (const s of [-1, 1]) for (let i = 0; i < v.n; i++) { const y = bx0 + 150 + i * dw; a.box(cx + s * hw - 6 * s, y + dw * 0.1, bz + 100, cx + s * hw + 20 * s, y + dw * 0.9, top - 200); for (let k = 0; k < 4; k++) a.box(cx + s * hw + 16 * s - 4, y + dw * 0.2, bz + 1400 + k * 120, cx + s * hw + 20 * s + 4, y + dw * 0.8, bz + 1440 + k * 120); }
      a.ycyl(bx0 + 100, a.YB - 120, cx, top + 250, 250, 18); a.box(cx - hw * 0.6, bx0 + 100, top, cx + hw * 0.6, a.YB - 120, top + 20);
      for (const y of [bx0 + 200, a.YB - 220]) a.box(cx - 160, y, top + 20, cx + 160, y + 20, top + 120);
      a.cyl(cx + hw * 0.6, bx0 + 300, top, top + 540, 40, 8); a.cyl(cx - hw * 0.6, a.YB - 300, top, top + 480, 55, 8);
      a.ycyl(a.YB - 20, a.YB, cx, bz - 80, 40, 10); for (const s of [-1, 1]) a.ycyl(a.YB - 20, a.YB, cx + s * 300, bz - 80, 20, 8);
      a.rect(cx - hw, bx0, cx + hw, a.YB - 20, 'EQUIP'); for (let i = 0; i <= v.n; i++) a.line(cx - hw, bx0 + 150 + i * dw, cx + hw, bx0 + 150 + i * dw, 'EQUIP-DETAIL'); a.circ(cx, a.YF + 20, 55, 'EQUIP-DETAIL');
      a.log('Added the box body, wheels and mudguards, drawbar with lunette eye and jockey wheel, side doors with louvres, roof water tank, flue, vent stack and rear drain manifold (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic multi-burner field cooking range',
    desc: (v) => `Portable field cooking range, ${v.n} burners, ${v.len} in long: a steel body on four legs with a fuel tank cradle, ${v.n} burners each with a heavy pot ring, control knobs on the front, a folding windshield along the back, an exhaust flue and carrying handles on both ends.`,
    vs: [['2 burner, 36 in', 2, 36], ['4 burner, 60 in', 4, 60], ['6 burner, 84 in', 6, 84]].map(([l, n, len]) => [l, len, 26, 38, 0, { n, len }]),
    build: (a, v) => {
      const cx = a.cx, W = a.W, ty = a.Z0 + 780, my = (a.YF + a.YB) / 2, hw = W / 2 - 60;
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.cyl(cx + sx * (hw - 60), my + sy * 250, a.Z0, ty - 140, 28, 8);
      a.box(cx - hw, a.YF + 80, ty - 140, cx + hw, a.YB - 80, ty); a.box(cx - hw + 60, a.YF + 80, a.Z0 + 380, cx + hw - 60, a.YB - 80, a.Z0 + 400);
      a.ycyl(a.YF + 140, a.YB - 140, cx, a.Z0 + 280, 90, 14);
      const bw = (W - 200) / v.n; for (let i = 0; i < v.n; i++) { const x = cx - hw + 100 + bw * (i + 0.5); a.cyl(x, my, ty, ty + 70, 130, 16); a.cyl(x, my, ty + 70, ty + 90, 190, 16); for (let k = 0; k < 4; k++) { const g = (k / 4) * PI * 2 + 0.4; a.box(x + m.cos(g) * 150 - 12, my + m.sin(g) * 150 - 12, ty + 90, x + m.cos(g) * 150 + 12, my + m.sin(g) * 150 + 12, ty + 150); } a.xcyl(x - 25, x + 25, a.YF + 70, ty - 70, 24, 8); a.circ(x, my, 130, 'EQUIP-DETAIL'); a.circ(x, my, 190, 'EQUIP-DETAIL'); }
      a.box(cx - hw, a.YB - 70, ty, cx + hw, a.YB - 50, a.Z1 - 80); a.cyl(cx + hw - 120, a.YB - 140, ty, a.Z1, 40, 8);
      for (const s of [-1, 1]) a.tube([[cx + s * hw, my - 160, ty - 70], [cx + s * (hw + 0), my - 160, ty - 20]], [12, 12], 4);
      a.outline(); a.rect(cx - hw, a.YF + 80, cx + hw, a.YB - 80, 'EQUIP-DETAIL');
      a.log('Added the body on legs, fuel tank cradle and tank, burners with pot rings and grate pins, front knobs, back windshield, flue and handles (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic folding mess table and bench set',
    desc: (v) => `Folding mess set, ${v.ft} ft table: a plank top on a folding trestle frame with splayed legs and a cross brace, and two plank benches on their own folding legs with a cross rail, each leg with a rubber foot.`,
    vs: [['6 ft', 6], ['8 ft', 8], ['10 ft', 10], ['12 ft', 12]].map(([l, ft]) => [l, 72, ft * 12, 31, 0, { ft }]),
    build: (a, v) => {
      const cx = a.cx, W = a.W, ty = a.Z0 + 28 * IN, by = a.Z0 + 17 * IN, tw = 30 * IN, bw = 10 * IN;
      a.box(cx - tw / 2, a.YF + 30, ty - 38, cx + tw / 2, a.YB - 30, ty);
      for (const s of [-1, 1]) { a.box(cx + s * (tw / 2 - 90) - 20, a.YF + 30, ty - 90, cx + s * (tw / 2 - 90) + 20, a.YB - 30, ty - 38);
        const nt = v.ft > 8 ? 3 : 2; for (let i = 0; i < nt; i++) { const y = a.YF + 250 + ((a.D - 500) * i) / (nt - 1); a.tube([[cx + s * 120, y, ty - 38], [cx + s * (tw / 2 + 120), y, a.Z0 + 20]], [18, 18], 6); a.tube([[cx - s * 120, y, ty - 38], [cx - s * (tw / 2 + 120), y, a.Z0 + 20]], [18, 18], 6); a.box(cx + s * (tw / 2 + 120) - 30, y - 30, a.Z0, cx + s * (tw / 2 + 120) + 30, y + 30, a.Z0 + 20); a.box(cx - s * (tw / 2 + 120) - 30, y - 30, a.Z0, cx - s * (tw / 2 + 120) + 30, y + 30, a.Z0 + 20); } 
        a.box(cx + s * (tw / 2 + 380) - bw / 2, a.YF + 100, by - 36, cx + s * (tw / 2 + 380) + bw / 2, a.YB - 100, by);
        for (const y of [a.YF + 250, a.YB - 250]) { a.tube([[cx + s * (tw / 2 + 380) - 90, y, by - 36], [cx + s * (tw / 2 + 380) - 90, y, a.Z0 + 20]], [14, 14], 6); a.tube([[cx + s * (tw / 2 + 380) + 90, y, by - 36], [cx + s * (tw / 2 + 380) + 90, y, a.Z0 + 20]], [14, 14], 6); }
        a.tube([[cx + s * (tw / 2 + 380), a.YF + 250, a.Z0 + 140], [cx + s * (tw / 2 + 380), a.YB - 250, a.Z0 + 140]], [10, 10], 5); a.rect(cx + s * (tw / 2 + 380) - bw / 2, a.YF + 100, cx + s * (tw / 2 + 380) + bw / 2, a.YB - 100, 'EQUIP-DETAIL'); }
      a.rect(cx - tw / 2, a.YF + 30, cx + tw / 2, a.YB - 30, 'EQUIP');
      a.log('Added the plank table top on trestle legs with brace, two plank benches on folding legs with cross rail, and rubber feet (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic steel bunk frame, barracks',
    desc: (v) => `Steel barracks bunk frame, ${v.tiers} tier${v.tiers > 1 ? 's' : ''}, 80 in long: four tube corner posts, side rails, a woven wire deck with slats at each tier${v.tiers > 1 ? ', end ladder rungs and guard rails on upper tiers' : ''}, and a thin mattress pad on each deck.`,
    vs: [['single tier', 1], ['double tier', 2], ['triple tier', 3]].map(([l, tiers]) => [l, 38, 80, tiers === 1 ? 24 : tiers === 2 ? 74 : 86, 0, { tiers }]),
    build: (a, v) => {
      const cx = a.cx, hx = a.W / 2 - 25, tz = (i) => a.Z0 + 380 + i * 1100 - (v.tiers === 3 ? 0 : 0);
      for (const sx of [-1, 1]) for (const [y] of [[a.YF + 30], [a.YB - 30]]) a.tube([[cx + sx * hx, y, a.Z0], [cx + sx * hx, y, a.Z1 - 10]], [22, 22], 8);
      for (let t = 0; t < v.tiers; t++) { const z = a.Z0 + 380 + t * (v.tiers === 3 ? 600 : 1000) - (v.tiers === 3 ? 100 : 0);
        for (const sx of [-1, 1]) a.box(cx + sx * hx - 22, a.YF + 30, z, cx + sx * hx + 22, a.YB - 30, z + 70); a.box(cx - hx, a.YF + 30, z, cx + hx, a.YF + 60, z + 70); a.box(cx - hx, a.YB - 60, z, cx + hx, a.YB - 30, z + 70);
        for (let i = 0; i < 12; i++) a.box(cx - hx, a.YF + 90 + i * ((a.D - 180) / 12), z + 10, cx + hx, a.YF + 90 + i * ((a.D - 180) / 12) + 20, z + 22);
        a.box(cx - hx + 30, a.YF + 90, z + 70, cx + hx - 30, a.YB - 90, z + 150);
        if (t > 0) for (const sx of [-1, 1]) a.tube([[cx + sx * hx, a.YF + 40, z + 70], [cx + sx * hx, a.YF + 40, z + 300], [cx + sx * hx, a.YB - 40, z + 300], [cx + sx * hx, a.YB - 40, z + 70]], [8, 8, 8, 8], 5);
      }
      if (v.tiers > 1) for (let k = 0; k < 3; k++) a.tube([[cx - hx, a.YF + 18, a.Z0 + 480 + k * 220], [cx + hx, a.YF + 18, a.Z0 + 480 + k * 220]], [9, 9], 5);
      a.rect(cx - hx - 22, a.YF + 30, cx + hx + 22, a.YB - 30, 'EQUIP'); a.rect(cx - hx + 30, a.YF + 90, cx + hx - 30, a.YB - 90, 'EQUIP-DETAIL');
      a.log('Added the tube corner posts, side rails, woven wire decks with slats, mattress pads' + (v.tiers > 1 ? ', end ladder rungs and upper-tier guard rails' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic fuel drum rack and spill pallet',
    desc: (v) => `${v.n} drum ${v.kind === 'cradle' ? 'horizontal cradle rack' : 'spill pallet'}: ${v.n} steel 55 US gal drums with rolled rims, bungs and chime rings, ${v.kind === 'cradle' ? 'resting in a welded cradle frame with a saddle under each drum and a drip tray' : 'standing upright on a grated deck over a bunded sump with forklift pockets'}.`,
    vs: [['2 drum horizontal cradle', 2, 'cradle'], ['4 drum two-tier cradle', 4, 'cradle'], ['4 drum spill pallet', 4, 'pallet'], ['8 drum spill pallet', 8, 'pallet']].map(([l, n, kind]) => [l, kind === 'cradle' ? 50 : 52, kind === 'cradle' ? 36 : n === 4 ? 52 : 100, kind === 'cradle' ? (n === 2 ? 30 : 52) : 40, 0, { n, kind }]),
    build: (a, v) => {
      const cx = a.cx, dr = 11.5 * IN, dh = 34.5 * IN;
      if (v.kind === 'cradle') {
        const cols = 2, tray = 120;
        a.box(a.X0 + 20, a.YF + 20, a.Z0, a.X1 - 20, a.YB - 20, a.Z0 + tray); for (const s of [-1, 1]) for (const y of [a.YF + 20, a.YB - 40]) a.box(a.X0 + 20, y, a.Z0 + tray, a.X1 - 20, y + 20, a.Z0 + tray + 40);
        for (let c = 0; c < cols; c++) for (let l = 0; l < v.n / cols; l++) { const x = a.X0 + 40 + dr + c * (dr * 2 + 20), zz = a.Z0 + tray + 40 + dr + l * dr * 1.8; a.ycyl(a.YF + 60, a.YB - 60, x, zz, dr * 0.96, 24); for (const y of [a.YF + 60, a.YB - 60 - 25, a.YF + 60 + (a.D - 120) / 2 - 12]) a.ycyl(y, y + 25, x, zz, dr, 24); a.cyl(x, a.YB - 140, zz + dr * 0.9, zz + dr * 1.0, 22, 8); a.cyl(x, a.YB - 360, zz + dr * 0.9, zz + dr * 1.0, 14, 8); for (const y of [a.YF + 140, a.YB - 140]) { a.box(x - dr * 0.9, y - 25, a.Z0 + tray + 40, x + dr * 0.9, y + 25, zz - dr * 0.5); } a.circ(x, a.YF + 60, dr * 0.96, 'EQUIP-DETAIL'); a.rect(x - dr, a.YF + 60, x + dr, a.YB - 60, 'EQUIP-DETAIL'); }
      } else {
        const cols = v.n === 4 ? 2 : 2, rows = v.n / cols, pd = 150;
        a.box(a.X0, a.YF, a.Z0 + 100, a.X1, a.YB, a.Z0 + 200); a.box(a.X0, a.YF, a.Z0 + 200, a.X1, a.YF + 40, a.Z0 + 330); a.box(a.X0, a.YB - 40, a.Z0 + 200, a.X1, a.YB, a.Z0 + 330); a.box(a.X0, a.YF, a.Z0 + 200, a.X0 + 40, a.YB, a.Z0 + 330); a.box(a.X1 - 40, a.YF, a.Z0 + 200, a.X1, a.YB, a.Z0 + 330);
        for (const y of [a.YF + a.D * 0.3, a.YB - a.D * 0.3]) for (const x of [cx - 220, cx + 220]) a.box(x - 70, y - 120, a.Z0, x + 70, y + 120, a.Z0 + 100);
        for (let i = 0; i < 20; i++) a.box(a.X0 + 60, a.YF + 60 + i * ((a.D - 120) / 20), a.Z0 + 330, a.X1 - 60, a.YF + 60 + i * ((a.D - 120) / 20) + 16, a.Z0 + 350);
        for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) { const x = a.X0 + 50 + dr + c * (a.W - 100 - dr * 2), y = a.YF + 50 + dr + r * ((a.D - 100 - dr * 2) / m.max(1, rows - 1)); a.cyl(x, y, a.Z0 + 350, a.Z0 + 350 + dh * 0.0 + (a.Z1 - a.Z0 - 350), dr * 0.96, 24); for (const z of [a.Z0 + 350 + 140, a.Z0 + 350 + 560, a.Z1 - 28]) a.cyl(x, y, z, z + 22, dr, 24); a.cyl(x + dr * 0.35, y, a.Z1 - 4, a.Z1, 20, 8); a.circ(x, y, dr, 'EQUIP-DETAIL'); }
        a.outline();
      }
      a.log('Added the drums with rolled rims, bungs and chime rings, and the ' + (v.kind === 'cradle' ? 'welded cradle frame, saddles and drip tray' : 'grated deck over a bunded sump with forklift pockets') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic towable camp light tower',
    desc: (v) => `Towable light tower, ${v.mast} ft mast: a trailer chassis with a drawbar, jockey wheel, four outriggers with pads and two wheels, an engine and fuel enclosure, a ${v.mast} ft telescoping mast with guy-free sections and a winch, and a lamp head with ${v.lamps} lamps in a bar.`,
    vs: [['20 ft mast, 4 lamps', 20, 4, 150], ['30 ft mast, 4 lamps', 30, 4, 200], ['30 ft mast, 6 lamps', 30, 6, 200]].map(([l, mast, lamps, len]) => [l, 62, len, mast * 12 + 36, 0, { mast, lamps, len }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, r = 11 * IN, ww = r * 0.5, bz = a.Z0 + r * 1.3, by1 = a.YB - 20, by0 = a.YF + L * 0.3;
      wheelsAt(a, [a.YB - L * 0.3], r, ww); for (const s of [-1, 1]) a.box(cx + s * (W / 2 - ww / 2 - 6) - ww * 0.62, a.YB - L * 0.3 - r * 1.1, a.Z0 + r * 1.85, cx + s * (W / 2 - ww / 2 - 6) + ww * 0.62, a.YB - L * 0.3 + r * 1.1, a.Z0 + r * 1.95);
      a.box(cx - W * 0.4, by0, bz - 100, cx + W * 0.4, by1, bz); a.box(cx - W * 0.38, by0 + 40, bz, cx + W * 0.38, by1 - 40, bz + 750);
      for (let i = 0; i < 6; i++) a.box(cx - W * 0.3, by1 - 42, bz + 150 + i * 80, cx + W * 0.3, by1 - 38, bz + 190 + i * 80);
      a.prism([[cx - 40, a.YF + 100], [cx + 40, a.YF + 100], [cx + W * 0.2, by0], [cx - W * 0.2, by0]], bz - 100, bz - 40); a.xcyl(cx - 25, cx + 25, a.YF + 20, bz - 70, 50, 12); a.cyl(cx + 120, a.YF + 260, a.Z0 + 60, bz - 90, 18, 8);
      for (const s of [-1, 1]) for (const y of [by0 + 120, by1 - 120]) { a.box(cx + s * W * 0.4 - 30, y - 30, bz - 80, cx + s * W * 0.5 + 0, y + 30, bz - 40); a.box(cx + s * W * 0.46 - 60, y - 60, a.Z0, cx + s * W * 0.46 + 60, y + 60, a.Z0 + 40); a.cyl(cx + s * W * 0.46, y, a.Z0 + 40, bz - 60, 16, 8); }
      const mz0 = bz + 750, my = by0 + 400; const n = 4; for (let i = 0; i < n; i++) a.cyl(cx, my, mz0 + (i * (a.Z1 - mz0 - 400)) / n, mz0 + ((i + 1) * (a.Z1 - mz0 - 400)) / n + 40, 70 - i * 10, 10);
      const hz = a.Z1 - 280; a.xcyl(cx - 550, cx + 550, my, hz, 22, 8); for (let l = 0; l < v.lamps; l++) { const x = cx - 500 + (1000 * l) / (v.lamps - 1); a.box(x - 100, my - 100, hz - 160, x + 100, my + 70, hz + 160); a.box(x - 80, my - 140, hz - 130, x + 80, my - 100, hz + 130); }
      a.circ(cx, my, 70, 'EQUIP-DETAIL'); a.rect(cx - W * 0.4, by0, cx + W * 0.4, by1, 'EQUIP'); a.line(cx - 550, my, cx + 550, my, 'EQUIP-DETAIL'); a.line(cx - 40, a.YF + 100, cx - W * 0.2, by0, 'EQUIP-DETAIL'); a.line(cx + 40, a.YF + 100, cx + W * 0.2, by0, 'EQUIP-DETAIL');
      a.log('Added the trailer chassis with drawbar, jockey wheel, wheels and four outriggers, engine enclosure, telescoping mast sections and the lamp bar (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic portable cold room trailer',
    desc: (v) => `Portable cold room, ${v.ft} ft long: an insulated box on a skid or trailer frame with a rear double door and a door handle bar, a refrigeration unit on the front with a condenser grille and a fan, corner posts, a roof drain and a side step${v.ax ? ', on a tandem axle with a drawbar' : ''}.`,
    vs: [['10 ft, skid mounted', 10, false], ['16 ft, single axle trailer', 16, true], ['20 ft, tandem trailer', 20, 2]].map(([l, ft, ax]) => [l, 8 * 12, ft * 12 + 12, ax ? 120 : 108, 0, { ft, ax }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, hw = W * 0.46, sk = a.Z0 + (v.ax ? 1000 : 260), top = a.Z1 - 80, r = 15 * IN, bx0 = a.YF + (v.ax ? 600 : 40);
      if (v.ax) { const ys = v.ax === 2 ? [a.YB - L * 0.26, a.YB - L * 0.14] : [a.YB - L * 0.2]; wheelsAt(a, ys, r, r * 0.55); frameRails(a, bx0, a.YB - 20, sk - 170, W * 0.3, 90, 160); a.prism([[cx - 50, a.YF + 80], [cx + 50, a.YF + 80], [cx + W * 0.25, bx0], [cx - W * 0.25, bx0]], sk - 170, sk - 90); a.xcyl(cx - 25, cx + 25, a.YF + 20, sk - 130, 50, 12); }
      else for (const s of [-1, 1]) a.box(cx + s * W * 0.3 - 70, a.YF + 40, a.Z0, cx + s * W * 0.3 + 70, a.YB - 20, sk);
      a.box(cx - hw, bx0 + 600, sk, cx + hw, a.YB - 20, top); for (const s of [-1, 1]) for (const y of [bx0 + 600, a.YB - 70]) a.box(cx + s * hw - 40 - (s > 0 ? 0 : 0) * 0, y, sk, cx + s * hw + 40, y + 70, top);
      a.box(cx - hw * 0.9, bx0 + 600, sk, cx + hw * 0.9, bx0 + 640, top); a.box(cx - hw, bx0 + 40, sk, cx + hw, bx0 + 600, sk + (top - sk) * 0.86);
      a.box(cx - hw * 0.8, bx0 + 60, sk + 600, cx + hw * 0.8, bx0 + 80, top - 300); a.ycyl(bx0 + 20, bx0 + 60, cx - hw * 0.35, sk + 1000, 360, 18); a.ycyl(bx0 + 20, bx0 + 60, cx + hw * 0.35, sk + 1000, 360, 18);
      a.box(cx - hw * 0.8, a.YB - 14, sk + 100, cx + hw * 0.8, a.YB, top - 100); a.line(cx, a.YB, cx, a.YB - 200, 'EQUIP-DETAIL'); for (const s of [-1, 1]) { a.box(cx + s * hw * 0.1 - 8, a.YB - 28, sk + 800, cx + s * hw * 0.1 + 8, a.YB - 14, sk + 1500); }
      a.box(cx + hw, a.YB - 900, sk + 20, cx + hw + 0, a.YB - 500, sk + 20); 
      a.rect(cx - hw, bx0 + 40, cx + hw, a.YB - 20, 'EQUIP'); a.rect(cx - hw, bx0 + 40, cx + hw, bx0 + 600, 'EQUIP-DETAIL'); a.circ(cx - hw * 0.35, bx0 + 40, 360, 'EQUIP-DETAIL'); a.circ(cx + hw * 0.35, bx0 + 40, 360, 'EQUIP-DETAIL');
      a.log('Added the insulated box with corner posts, rear double door with handle bars, front refrigeration unit with condenser fans' + (v.ax ? ' and the trailer frame, axle, wheels and drawbar' : ' on a skid frame') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic shade net frame, field',
    desc: (v) => `Camouflage-pattern-free shade net frame, ${v.wf} by ${v.lf} ft: ${v.posts} tube posts on base plates, a perimeter tube beam, a sloped net sheet held by edge ropes, centre support poles and ground anchor ropes.`,
    vs: [['20 by 20 ft', 20, 20, 6], ['20 by 40 ft', 20, 40, 9], ['30 by 30 ft', 30, 30, 9]].map(([l, wf, lf, posts]) => [l, wf * 12, lf * 12, 120, 0, { wf, lf, posts }]),
    build: (a, v) => {
      const cx = a.cx, hw = a.W / 2 - 80, y0 = a.YF + 80, y1 = a.YB - 80, hz = a.Z1 - 150, lz = a.Z0 + 2100, nx = 3, ny = v.posts / 3;
      const poly = [[cx - hw, lz], [cx + hw, lz], [cx + hw * 0.3, hz], [cx - hw * 0.3, hz]]; prismY(a, poly, y0, y1);
      for (let j = 0; j < ny; j++) for (let i = 0; i < 3; i++) { const x = cx - hw + (hw * i), y = y0 + ((y1 - y0) * j) / (ny - 1); const top = i === 1 ? hz - 20 : lz - 20; a.tube([[x, y, a.Z0], [x, y, top]], [30, 30], 8); a.box(x - 120, y - 120, a.Z0, x + 120, y + 120, a.Z0 + 14); a.circ(x, y, 40, 'EQUIP-DETAIL'); }
      for (const s of [-1, 1]) a.tube([[cx + s * hw, y0, lz - 20], [cx + s * hw, y1, lz - 20]], [20, 20], 6); a.tube([[cx - hw, y0, lz - 20], [cx + hw, y0, lz - 20]], [20, 20], 6); a.tube([[cx - hw, y1, lz - 20], [cx + hw, y1, lz - 20]], [20, 20], 6); a.tube([[cx, y0, hz - 20], [cx, y1, hz - 20]], [20, 20], 6);
      for (const s of [-1, 1]) for (const y of [y0, y1]) { a.tube([[cx + s * hw, y, lz - 20], [cx + s * (hw + 60), y + (y === y0 ? -60 : 60), a.Z0 + 20]], [5, 5], 4); }
      a.rect(cx - hw, y0, cx + hw, y1, 'EQUIP'); a.line(cx, y0, cx, y1, 'EQUIP-DETAIL'); a.log('Added the base plates, tube posts, perimeter beams, sloped net sheet, ridge tube and corner ropes with pegs (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic field communications dish, ground mount',
    desc: (v) => `Ground-mounted dish antenna, ${v.dia} in reflector: a dish with a rolled rim and rear ribs, a feed arm and feed horn, an azimuth-elevation mount on a ${v.leg === 'tri' ? 'three-leg tripod with ground pads' : 'concrete-footed pedestal with a base plate and bolts'} and a cable run to a small equipment box.`,
    vs: [['36 in dish, tripod', 36, 'tri'], ['72 in dish, tripod', 72, 'tri'], ['96 in dish, pedestal', 96, 'ped'], ['144 in dish, pedestal', 144, 'ped']].map(([l, dia, leg]) => [l, dia * 1.2 + 30, dia * 0.7 + 40, dia * 1.45 + 36, 0, { dia, leg }]),
    build: (a, v) => {
      const cx = a.cx, my = (a.YF + a.YB) / 2, dr = (v.dia * IN) / 2, hz = a.Z0 + (v.leg === 'tri' ? 700 : 1000) + dr * 0.9, tilt = 0.5;
      if (v.leg === 'tri') { for (let i = 0; i < 3; i++) { const g = (i / 3) * PI * 2 + PI / 2; const x = cx + m.cos(g) * a.W * 0.34, y = my + m.sin(g) * a.D * 0.36; a.tube([[cx, my, hz - dr * 0.4], [x, y, a.Z0 + 30]], [24, 24], 6); a.cyl(x, y, a.Z0, a.Z0 + 30, 90, 10); } a.cyl(cx, my, a.Z0 + 400, hz - dr * 0.4, 50, 10); }
      else { a.box(cx - 450, my - 450, a.Z0, cx + 450, my + 450, a.Z0 + 120); a.cyl(cx, my, a.Z0 + 120, hz - dr * 0.1, 150, 16); a.box(cx - 250, my - 250, a.Z0 + 120, cx + 250, my + 250, a.Z0 + 160); }
      const px = cx, py = my, pz = hz; const ax = [0, -m.cos(tilt), m.sin(tilt)];
      a.box(px - 120, py - 100, pz - dr * 0.5, px + 120, py + 100, pz - dr * 0.1);
      const dc = [px, py + 0, pz + dr * 0.2];
      a.tube([[dc[0], dc[1] + dr * 0.2, dc[2] - dr * 0.15], [dc[0], dc[1] - dr * 0.9 * 0, dc[2] + dr * 0.0]], [40, 40], 6);
      a.tube([[px, py + dr * 0.15, pz + dr * 0.25], [px, py - dr * 0.1, pz + dr * 0.55]], [dr * 0.5, dr * 0.05], 24);
      for (let k = 0; k < 6; k++) { const g = (k / 6) * PI * 2; a.tube([[px + m.cos(g) * dr * 0.9, py - dr * 0.1, pz + dr * 0.55 + m.sin(g) * dr * 0.9 * 0.2], [px, py + dr * 0.15, pz + dr * 0.25]], [8, 8], 4); }
      a.tube([[px, py - dr * 0.1, pz + dr * 0.55], [px, py + dr * 0.28, pz + dr * 0.55]], [dr * 0.99, dr * 0.1], 30); a.ycyl(py - dr * 0.14, py - dr * 0.08, px, pz + dr * 0.55, dr * 1.0, 30);
      a.tube([[px, py + 0, pz + dr * 0.55], [px, py - dr * 0.6, pz + dr * 0.55]], [14, 14], 5); a.ycyl(py - dr * 0.72, py - dr * 0.6, px, pz + dr * 0.55, 40, 10);
      a.box(cx + a.W * 0.3 - 150, a.YB - 350, a.Z0, cx + a.W * 0.3 + 150, a.YB - 50, a.Z0 + 280); a.tube([[cx + a.W * 0.3, a.YB - 200, a.Z0 + 280], [cx, my, a.Z0 + 100]], [8, 8], 4);
      a.circ(cx, my, dr, 'EQUIP'); a.circ(cx, my, dr * 0.5, 'EQUIP-DETAIL'); a.rect(cx + a.W * 0.3 - 150, a.YB - 350, cx + a.W * 0.3 + 150, a.YB - 50, 'EQUIP-DETAIL');
      a.log('Added the dish with rim, rear ribs, feed arm and horn, the mount and ' + (v.leg === 'tri' ? 'tripod legs with pads' : 'pedestal on a base plate') + ', and the equipment box with cable (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic camp flagpole with base',
    desc: (v) => `${v.ft} ft tapered flagpole: a rectangular base plate with four anchor bolts and a collar, a tapered tube shaft in ${v.seg} sections with joint bands, a ball finial with a truck, a halyard with two pulleys and a cleat, and a rolled cloth banner with a bracket.`,
    vs: [['20 ft', 20, 2], ['30 ft', 30, 3], ['40 ft', 40, 4]].map(([l, ft, seg]) => [l, 40 + ft * 0.6, 24 + ft * 0.3, ft * 12 + 6, 0, { ft, seg }]),
    build: (a, v) => {
      const cx = a.cx, my = (a.YF + a.YB) / 2, H = a.H, bp = 16 * IN / 1.5, sh = a.Z1 - 140;
      a.box(cx - bp, my - bp, a.Z0, cx + bp, my + bp, a.Z0 + 25); for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.cyl(cx + sx * bp * 0.78, my + sy * bp * 0.78, a.Z0 + 25, a.Z0 + 70, 12, 6);
      a.cone(cx, my, a.Z0 + 25, a.Z0 + 250, 150, 80, 14);
      for (let i = 0; i < v.seg; i++) { const z0 = a.Z0 + 250 + (i * (sh - a.Z0 - 250)) / v.seg, z1 = a.Z0 + 250 + ((i + 1) * (sh - a.Z0 - 250)) / v.seg, f0 = 1 - i / v.seg, f1 = 1 - (i + 1) / v.seg; a.cone(cx, my, z0, z1 + 20, 58 * (0.45 + 0.55 * f0), 58 * (0.45 + 0.55 * f1), 12); a.cyl(cx, my, z1 - 12, z1 + 28, 58 * (0.45 + 0.55 * f1) + 8, 12); }
      a.cyl(cx, my, sh, sh + 30, 36, 10); a.ell(cx, my, sh + 75, 48, 48, 48, 12, 7);
      a.box(cx + 24, my - 30, a.Z0 + 1400, cx + 70, my + 30, a.Z0 + 1700); a.ycyl(my + 28, my + 40, cx + 40, a.Z0 + 1700, 20, 8);
      const bz1 = sh - 100, bz0 = sh - 100 - 1000; a.box(cx + 60, my - 8, bz0, cx + 60 + m.min(900, a.W / 2 - 100), my + 8, bz1); a.xcyl(cx + 20, cx + 70, my, bz1, 12, 6); a.xcyl(cx + 20, cx + 70, my, bz0, 12, 6);
      a.circ(cx, my, 58, 'EQUIP'); a.rect(cx - bp, my - bp, cx + bp, my + bp, 'EQUIP-DETAIL'); a.circ(cx, my, 150, 'EQUIP-DETAIL');
      a.log('Added the base plate with anchor bolts, collar, tapered ' + v.seg + '-section shaft with joint bands, ball finial, halyard cleat and the rolled banner on its bracket (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic tent heater skid unit',
    desc: (v) => `Skid-mounted tent heater, ${v.kbtu}k BTU class: a steel cabinet on a lifting skid with a hinged service door, a fuel tank under the burner, a blower housing with a fan, a hot-air outlet collar with two flexible duct stubs, an exhaust flue stack and a control panel with a dial and two switches.`,
    vs: [['60k BTU class', 60, 34, 24, 30], ['120k BTU class', 120, 44, 28, 36], ['250k BTU class', 250, 60, 34, 44]].map(([l, kbtu, len, w, h]) => [l, w, len, h, 0, { kbtu }]),
    build: (a, v) => {
      const cx = a.cx, hw = a.W / 2 - 20, sk = a.Z0 + 100;
      for (const sx of [-1, 1]) a.box(cx + sx * (hw - 50) - 50, a.YF + 20, a.Z0, cx + sx * (hw - 50) + 50, a.YB - 20, sk);
      a.box(cx - hw, a.YF + 20, sk, cx + hw, a.YB - 20, sk + 120); a.ycyl(a.YF + 80, a.YB - a.D * 0.55, cx, sk + 120 + (a.Z1 - sk) * 0.2, (a.Z1 - sk) * 0.16, 18);
      const bz = sk + 120, ct = a.Z1 - 120, ym = a.YF + a.D * 0.45;
      a.box(cx - hw, ym, bz, cx + hw, a.YB - 20, ct); a.box(cx - hw * 0.8, a.YF + 60, bz + (ct - bz) * 0.5, cx + hw * 0.8, ym, ct); a.box(cx - hw - 4, ym + 60, bz + 60, cx - hw, a.YB - 120, ct - 60); a.xcyl(cx - hw - 20, cx - hw - 4, ym + 150, bz + (ct - bz) * 0.5, 22, 8);
      a.cyl(cx - hw * 0.3, a.YF + 140, bz + (ct - bz) * 0.5, ct, hw * 0.28, 16); for (let k = 0; k < 6; k++) a.box(cx - hw * 0.4, a.YF + 140 - 6, bz + (ct - bz) * 0.5 + k * 30, cx - hw * 0.2, a.YF + 140 + 6, bz + (ct - bz) * 0.5 + k * 30 + 12);
      a.cyl(cx + hw * 0.4, a.YB - 120, ct, a.Z1 - 20, 55, 12); a.cyl(cx + hw * 0.4, a.YB - 120, a.Z1 - 20, a.Z1, 80, 12);
      for (const sx of [-1, 1]) { a.ycyl(a.YF + 4, a.YF + 60, cx + sx * hw * 0.5, bz + (ct - bz) * 0.72, 90, 14); a.ycyl(a.YF + 4, a.YF + 20, cx + sx * hw * 0.5, bz + (ct - bz) * 0.72, 110, 14); }
      a.box(cx + hw * 0.1, ym + 4, ct - 220, cx + hw * 0.85, ym + 28, ct - 40); a.ycyl(ym - 2, ym + 4, cx + hw * 0.3, ct - 130, 40, 12); for (const x of [0.55, 0.7]) a.box(cx + hw * x - 10, ym - 8, ct - 110, cx + hw * x + 10, ym + 4, ct - 70);
      a.rect(cx - hw, a.YF + 20, cx + hw, a.YB - 20, 'EQUIP'); a.circ(cx + hw * 0.4, a.YB - 120, 55, 'EQUIP-DETAIL'); a.circ(cx - hw * 0.3, a.YF + 140, hw * 0.28, 'EQUIP-DETAIL'); for (const sx of [-1, 1]) a.circ(cx + sx * hw * 0.5, a.YF + 30, 90, 'EQUIP-DETAIL');
      a.log('Added the lifting skid, steel cabinet with service door, fuel tank, blower housing and fan, two duct outlet collars, flue stack and the control panel (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic hand-wash station, camp',
    desc: (v) => `Camp hand-wash station with ${v.n} basins: a tube stand with a rail${v.n > 2 ? ' trough' : ''}, ${v.n} stainless basins with taps, a foot pedal pump per basin, a water drum on a shelf with a drain hose, a soap dispenser on each side and a waste bucket below.`,
    vs: [['2 basin', 2, 40], ['4 basin', 4, 70], ['6 basin trough', 6, 100]].map(([l, n, len]) => [l, len, 24, 44, 0, { n, len }]),
    build: (a, v) => {
      const cx = a.cx, my = (a.YF + a.YB) / 2, hw = a.W / 2 - 30, tz = a.Z0 + 33 * IN;
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.tube([[cx + sx * hw, my + sy * 220, a.Z0], [cx + sx * hw, my + sy * 220, tz]], [18, 18], 8);
      for (const sy of [-1, 1]) a.tube([[cx - hw, my + sy * 220, tz], [cx + hw, my + sy * 220, tz]], [14, 14], 6); for (const sx of [-1, 1]) a.tube([[cx + sx * hw, my - 220, tz], [cx + sx * hw, my + 220, tz]], [14, 14], 6);
      a.box(cx - hw, my - 220, a.Z0 + 200, cx + hw, my + 220, a.Z0 + 220); const bw = (2 * hw) / v.n;
      for (let i = 0; i < v.n; i++) { const x = cx - hw + bw * (i + 0.5); a.cyl(x, my - 40, tz - 160, tz, 160, 18); a.cyl(x, my - 40, tz - 10, tz + 10, 190, 18); a.tube([[x, my + 150, tz], [x, my + 150, tz + 250], [x, my + 60, tz + 250]], [14, 14, 12], 6); a.box(x - 70, my - 120, a.Z0 + 20, x + 70, my + 60, a.Z0 + 90); a.circ(x, my - 40, 160, 'EQUIP-DETAIL'); }
      a.cyl(cx, my + 140, tz + 250, a.Z1, 190, 16); a.box(cx - 280, my + 100, tz + 230, cx + 280, my + 330, tz + 250);
      for (const sx of [-1, 1]) a.box(cx + sx * hw * 0.8 - 40, my + 190, tz + 40, cx + sx * hw * 0.8 + 40, my + 215, tz + 200);
      a.cyl(cx, my + 100, a.Z0 + 230, a.Z0 + 520, 130, 12);
      a.rect(cx - hw, my - 220, cx + hw, my + 220, 'EQUIP'); a.rect(cx - hw, my - 220, cx + hw, my + 220, 'EQUIP-DETAIL'); a.circ(cx, my + 140, 190, 'EQUIP-DETAIL');
      a.log('Added the tube stand with rails, stainless basins with taps, foot pumps, water drum on a shelf, soap dispensers and a waste bucket (plan and 3D).');
    } }),

  // ===================================================== support =====================================================
  fam({ cat: 'military/support', title: 'Generic specialised freight container, depot',
    desc: (v) => `${v.ft} ft ${v.kind === 'reefer' ? 'refrigerated freight container: a corrugated box with a front machinery section holding a condenser grille and two fans, a double rear door with locking bars and hinges, corner castings and fork pockets' : 'tank container: a horizontal cylindrical tank in a corner-cast frame with end rings, a top manhole, a rear valve box and ladder, and a walkway'}.`,
    vs: [['refrigerated, 20 ft', 'reefer', 20, 102, 102], ['refrigerated, 40 ft', 'reefer', 40, 102, 102], ['tank, 20 ft', 'tank', 20, 96, 102]].map(([l, kind, ft, w, h]) => [l, w, ft * 12, h, 0, { kind, ft }]),
    build: (a, v) => {
      const cx = a.cx, hw = a.W / 2, z0 = a.Z0, z1 = a.Z1, y0 = a.YF, y1 = a.YB;
      const castings = () => { for (const sx of [-1, 1]) for (const y of [y0, y1 - 160]) for (const [za, zb] of [[z0, z0 + 160], [z1 - 160, z1]]) a.box(cx + sx * hw - (sx > 0 ? 160 : 0), y, za, cx + sx * hw + (sx < 0 ? 160 : 0), y + 160, zb); };
      if (v.kind === 'reefer') {
        a.box(cx - hw, y0 + 20, z0 + 120, cx + hw, y1, z1); for (let i = 0; i < 20; i++) a.box(cx - hw - 10, y0 + 600 + i * ((y1 - y0 - 900) / 20), z0 + 200, cx + hw + 10, y0 + 600 + i * ((y1 - y0 - 900) / 20) + 55, z1 - 80);
        a.box(cx - hw * 0.85, y0, z0 + 400, cx + hw * 0.85, y0 + 20, z1 - 150); a.ycyl(y0 - 30, y0 + 20, cx - hw * 0.35, z0 + 1700, 380, 18); a.ycyl(y0 - 30, y0 + 20, cx + hw * 0.35, z0 + 1700, 380, 18); for (let i = 0; i < 6; i++) a.box(cx - hw * 0.8, y0 - 12, z0 + 500 + i * 70, cx + hw * 0.8, y0 + 4, z0 + 530 + i * 70);
        a.box(cx - hw * 0.9, y1 - 20, z0 + 160, cx + hw * 0.9, y1, z1 - 160); for (const sx of [-1, 1]) for (const x of [0.2, 0.7]) a.tube([[cx + sx * hw * x, y1 + 0, z0 + 220], [cx + sx * hw * x, y1 - 0, z1 - 200]], [18, 18], 6);
        for (const x of [-1, 1]) a.box(cx + x * hw * 0.5 - 150, y0 + 100, z0, cx + x * hw * 0.5 + 150, y1 - 100, z0 + 120);
        castings(); a.rect(cx - hw, y0 + 20, cx + hw, y1, 'EQUIP'); a.line(cx - hw, y0 + 600, cx + hw, y0 + 600, 'EQUIP-DETAIL'); a.circ(cx - hw * 0.35, y0 + 20, 380, 'EQUIP-DETAIL'); a.circ(cx + hw * 0.35, y0 + 20, 380, 'EQUIP-DETAIL');
      } else {
        const tr = hw * 0.82, zc = (z0 + z1) / 2; a.ycyl(y0 + 200, y1 - 200, cx, zc, tr, 28); for (let i = 1; i < 5; i++) { const y = y0 + 200 + ((y1 - y0 - 400) * i) / 5; a.ycyl(y - 12, y + 12, cx, zc, tr * 1.03, 28); }
        for (const y of [y0 + 200, y1 - 200]) a.cone(cx, y, zc, zc, tr, tr, 3);
        for (const y of [y0 + 20, y1 - 160]) { a.frame(cx - hw, z0, cx + hw, z1, y, y + 140, 140); a.box(cx - hw, y, zc - 80, cx + hw, y + 140, zc + 80); }
        for (const sx of [-1, 1]) { a.box(cx + sx * hw - (sx > 0 ? 100 : 0), y0 + 20, z0, cx + sx * hw + (sx < 0 ? 100 : 0), y1, z0 + 120); a.box(cx + sx * hw - (sx > 0 ? 100 : 0), y0 + 20, z1 - 120, cx + sx * hw + (sx < 0 ? 100 : 0), y1, z1); }
        const my = (y0 + y1) / 2; a.cyl(cx, my, zc + tr * 0.96, zc + tr * 1.0 + 100, 250, 14); a.cyl(cx, my, zc + tr + 100, z1, 280, 14); a.box(cx - 220, y1 - 700, zc - 500, cx + 220, y1 - 100, zc + 100); a.box(cx - 100, y0 + 400, zc + tr * 0.95, cx + 100, y1 - 400, zc + tr + 40);
        for (const z of [z0 + 400, z0 + 900, z0 + 1400]) a.box(cx + hw * 0.4, y1 - 20, z, cx + hw * 0.8, y1, z + 40);
        castings(); a.outline(); a.circ(cx, my, 250, 'EQUIP-DETAIL'); a.rect(cx - 220, y1 - 700, cx + 220, y1 - 100, 'EQUIP-DETAIL');
      }
      a.log('Added the ' + (v.kind === 'reefer' ? 'corrugated box with front refrigeration section, fans, rear locking-bar doors and fork pockets' : 'cylindrical tank with ring stiffeners, frame with corner castings, manhole, valve box, ladder and walkway') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic fuel dispensing skid, depot',
    desc: (v) => `Skid fuel dispenser, ${v.l} litre class: a horizontal tank in a bunded skid with lifting lugs, a vent pipe with a cowl, a fill point with a lid, a pump and meter set on a plinth, a hose reel with a delivery hose and a nozzle holster, a lockable control cabinet and an earthing point.`,
    vs: [['2,000 litre class', 2000, 90, 60, 66], ['5,000 litre class', 5000, 130, 70, 76], ['10,000 litre class', 10000, 190, 84, 90]].map(([l, ltr, len, w, h]) => [l, w, len, h, 0, { l: ltr.toLocaleString('en-US'), len }]),
    build: (a, v) => {
      const cx = a.cx, hw = a.W / 2, sk = a.Z0 + 200;
      a.box(a.X0, a.YF, a.Z0, a.X1, a.YB, sk - 120); for (const [x0, y0, x1, y1] of [[a.X0, a.YF, a.X1, a.YF + 60], [a.X0, a.YB - 60, a.X1, a.YB], [a.X0, a.YF, a.X0 + 60, a.YB], [a.X1 - 60, a.YF, a.X1, a.YB]]) a.box(x0, y0, sk - 120, x1, y1, sk + 100);
      const tr = hw * 0.62, zc = sk + 60 + tr, ty0 = a.YF + 150, ty1 = a.YB - a.D * 0.3, tm = (ty0 + ty1) / 2;
      for (const y of [ty0 + 200, ty1 - 200]) { a.box(cx - tr * 0.8, y - 60, sk - 120, cx + tr * 0.8, y + 60, zc - tr * 0.3); a.tube([[cx - tr * 0.8, y, zc - tr * 0.3], [cx + tr * 0.8, y, zc - tr * 0.3]], [30, 30], 6); }
      a.ycyl(ty0, ty1, cx, zc, tr, 26); for (let i = 1; i < 4; i++) { const y = ty0 + ((ty1 - ty0) * i) / 4; a.ycyl(y - 10, y + 10, cx, zc, tr * 1.03, 26); }
      a.cyl(cx, tm, zc + tr * 0.96, zc + tr + 80, 230, 14); a.cyl(cx, tm, zc + tr + 80, zc + tr + 110, 270, 14); a.cyl(cx - tr * 0.5, ty0 + 150, zc + tr * 0.8, a.Z1 - 30, 28, 8); a.cone(cx - tr * 0.5, ty0 + 150, a.Z1 - 30, a.Z1, 28, 70, 8);
      for (const x of [cx - tr * 0.5, cx + tr * 0.5]) a.cyl(x, ty0 + 300, zc + tr * 0.9, zc + tr + 160, 16, 6);
      const px = ty1 + 100; a.box(cx - hw * 0.7, px, sk, cx + hw * 0.1, a.YB - 120, sk + 120); a.box(cx - hw * 0.65, px + 40, sk + 120, cx - hw * 0.15, a.YB - 160, sk + 600); a.cyl(cx - hw * 0.4, px + 200, sk + 600, sk + 680, 110, 14); a.box(cx - hw * 0.35, px + 40, sk + 300, cx - hw * 0.05, px + 100, sk + 520);
      a.box(cx + hw * 0.2, px, sk, cx + hw * 0.9, a.YB - 80, sk + 1050); a.box(cx + hw * 0.22, px - 4, sk + 400, cx + hw * 0.88, px + 6, sk + 900);
      a.ycyl(px + 30, px + 120, cx + hw * 0.55, sk + 1200, 200, 18); a.ycyl(px + 30, px + 120, cx + hw * 0.55, sk + 1200, 70, 10); a.box(cx + hw * 0.7, px - 40, sk + 1100, cx + hw * 0.85, px + 20, sk + 1260);
      a.cyl(cx + hw * 0.9 - 0, a.YF + 100, sk, sk + 200, 12, 6);
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP'); a.rect(cx - tr, ty0, cx + tr, ty1, 'EQUIP-DETAIL'); a.circ(cx, tm, 230, 'EQUIP-DETAIL'); a.rect(cx + hw * 0.2, px, cx + hw * 0.9, a.YB - 80, 'EQUIP-DETAIL');
      a.log('Added the bunded skid with lifting lugs, horizontal tank with rings, fill point, vent pipe with cowl, pump and meter set, hose reel with nozzle holster and the control cabinet (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic air cargo platform loader',
    desc: (v) => `Self-propelled cargo platform loader, ${v.len} in long, ${v.cap} class: a cab at the front with windscreen and mirrors, a chassis with four wheels, a scissor lift under a roller-deck platform with side guide rails, rear and front bridging plates, hydraulic cylinders and an operator rail.`,
    vs: [['10 ton class, 300 in', '10 ton', 300, 100, 118], ['20 ton class, 380 in', '20 ton', 380, 112, 124], ['30 ton class, 440 in', '30 ton', 440, 120, 130]].map(([l, cap, len, w, h]) => [l, w, len, h, 0, { cap, len }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, r = 20 * IN, hw = W * 0.45, zc = a.Z0 + r, ch = a.Z0 + r * 1.9;
      wheelsAt(a, [a.YF + L * 0.18, a.YB - L * 0.14], r, r * 0.6);
      a.box(cx - hw * 0.9, a.YF + L * 0.06, ch - 160, cx + hw * 0.9, a.YB - 40, ch + 100);
      const cb = a.YF + L * 0.06, ce = cb + L * 0.2; a.box(cx - hw * 0.95, cb, ch + 100, cx + hw * 0.95, ce, a.Z0 + a.H * 0.55); a.frame(cx - hw * 0.8, ch + 500, cx + hw * 0.8, a.Z0 + a.H * 0.5, cb - 12, cb + 6, 26); for (const s of [-1, 1]) a.box(cx + s * hw * 0.95 - 6 * s, cb + 100, ch + 500, cx + s * hw * 0.95 + 14 * s, ce - 80, a.Z0 + a.H * 0.5);
      for (const s of [-1, 1]) { a.tube([[cx + s * (hw * 0.95 + 8), cb + 100, ch + 700], [cx + s * (hw * 0.95 + 140), cb + 40, ch + 700]], [8, 8], 5); a.box(cx + s * (hw * 0.95 + 140) - 14, cb + 20, ch + 560, cx + s * (hw * 0.95 + 140) + 14, cb + 50, ch + 840); }
      const py0 = ce + 100, py1 = a.YB - 80, pz = a.Z0 + a.H * 0.62;
      for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { a.tube([[cx + s * hw * 0.7, py0 + 200, ch + 100], [cx + s * hw * 0.7, py1 - 200, pz - 80]], [26, 26], 6); a.tube([[cx + s * hw * 0.7, py1 - 200, ch + 100], [cx + s * hw * 0.7, py0 + 200, pz - 80]], [26, 26], 6); }
      a.box(cx - hw * 0.8, py0 + 200, ch + 100, cx + hw * 0.8, py1 - 200, ch + 160); a.ycyl(py0 + 400, py0 + 1000, cx, ch + 300, 45, 10);
      a.box(cx - hw, py0, pz - 80, cx + hw, py1, pz); for (let i = 0; i < 12; i++) a.xcyl(cx - hw + 60, cx + hw - 60, py0 + 80 + i * ((py1 - py0 - 160) / 11), pz + 30, 30, 8);
      for (const s of [-1, 1]) { a.box(cx + s * hw - 30 * (s > 0 ? 1 : 0) - (s < 0 ? 0 : 0), py0, pz, cx + s * hw + (s > 0 ? 0 : 30), py1, pz + 360); a.box(cx + s * hw - (s > 0 ? 30 : 0), py0, pz + 360, cx + s * hw + (s > 0 ? 0 : 30), py1, pz + 400); }
      a.box(cx - hw, py1 - 200, pz - 80, cx + hw, py1, pz - 40); a.box(cx - hw * 0.9, a.YB - 20, pz - 60, cx + hw * 0.9, a.YB, pz + 20); a.rect(cx - hw, py0, cx + hw, py1, 'EQUIP'); a.rect(cx - hw * 0.95, cb, cx + hw * 0.95, ce, 'EQUIP-DETAIL'); for (let i = 1; i < 6; i++) a.line(cx - hw, py0 + ((py1 - py0) * i) / 6, cx + hw, py0 + ((py1 - py0) * i) / 6, 'EQUIP-DETAIL');
      a.log('Added the cab, wheeled chassis, scissor lift with hydraulic cylinder, roller deck with side guide rails, bridging plate and mirrors (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic aircraft tripod jack',
    desc: (v) => `${v.cap} class tripod aircraft jack, ${v.h} in tall: three splayed tube legs with cross braces and foot pads, a central screw ram with a lifting handle and a crank wheel, a hydraulic cylinder, a saddle head with a swivel pad and a locking collar.`,
    vs: [['3 ton class', '3 ton', 54], ['6 ton class', '6 ton', 78], ['12 ton class', '12 ton', 102]].map(([l, cap, h]) => [l, h * 0.62 + 16, h * 0.62 + 16, h, 0, { cap, h }]),
    build: (a, v) => {
      const cx = a.cx, my = (a.YF + a.YB) / 2, R = a.W * 0.42, top = a.Z0 + a.H * 0.62, lt = 30 + v.h * 0.18;
      for (let i = 0; i < 3; i++) { const g = (i / 3) * PI * 2 + PI / 2, x = cx + m.cos(g) * R, y = my + m.sin(g) * R; a.tube([[cx + m.cos(g) * R * 0.12, my + m.sin(g) * R * 0.12, top], [x, y, a.Z0 + 40]], [lt * 0.6, lt * 0.5], 8); a.cyl(x, y, a.Z0, a.Z0 + 40, lt * 1.9, 12); const g2 = ((i + 1) / 3) * PI * 2 + PI / 2; a.tube([[x * 0.7 + (cx + m.cos(g2) * R) * 0.3 - 0, y * 0.7 + (my + m.sin(g2) * R) * 0.3, a.Z0 + a.H * 0.2], [cx + m.cos(g2) * R * 0.7 + m.cos(g) * R * 0.3, my + m.sin(g2) * R * 0.7 + m.sin(g) * R * 0.3, a.Z0 + a.H * 0.2]], [lt * 0.2, lt * 0.2], 5); }
      a.cyl(cx, my, top - 80, top + 90, lt * 1.6, 14); a.cyl(cx, my, top, a.Z1 - 120, lt * 0.8, 12); a.cyl(cx, my, a.Z1 - 120, a.Z1 - 80, lt * 1.1, 12); a.cyl(cx, my, a.Z1 - 80, a.Z1 - 20, lt * 1.6, 12); a.cyl(cx, my, a.Z1 - 20, a.Z1, lt * 1.1, 12);
      a.xcyl(cx - lt * 4, cx + lt * 4, my, top + 140, lt * 0.35, 8); a.cyl(cx + lt * 4, my, top + 80, top + 200, lt * 0.5, 8); a.cyl(cx - lt * 4, my, top + 80, top + 200, lt * 0.5, 8);
      for (let i = 0; i < 3; i++) { const g = (i / 3) * PI * 2 + PI / 2; a.circ(cx + m.cos(g) * R, my + m.sin(g) * R, lt * 1.9, 'EQUIP-DETAIL'); a.line(cx, my, cx + m.cos(g) * R, my + m.sin(g) * R, 'EQUIP-DETAIL'); }
      a.circ(cx, my, lt * 1.6, 'EQUIP');
      a.log('Added the three splayed legs with foot pads and cross braces, central ram with collar, crank handle and the saddle head (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic towable ground power cart',
    desc: (v) => `${v.kva} kVA towable ground power cart, ${v.len} in long: an engine-generator enclosure with louvred doors and a lifting eye, a cable reel with output cable and plug, a control panel with gauges and switches, an exhaust stack, a drawbar with a tow ring and ${v.ax} wheels with mudguards.`,
    vs: [['30 kVA class', 30, 100, 40, 54, 2], ['60 kVA class', 60, 126, 46, 60, 2], ['90 kVA class', 90, 150, 52, 66, 4]].map(([l, kva, len, w, h, ax]) => [l, w, len, h, 0, { kva, len, ax }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, r = 12 * IN, ww = r * 0.5, bz = a.Z0 + r * 1.5, ys = v.ax === 4 ? [a.YB - L * 0.4, a.YB - L * 0.25] : [a.YB - L * 0.32];
      wheelsAt(a, ys, r, ww); for (const y of ys) for (const s of [-1, 1]) a.box(cx + s * (W / 2 - ww / 2 - 6) - ww * 0.62, y - r * 1.1, a.Z0 + r * 1.85, cx + s * (W / 2 - ww / 2 - 6) + ww * 0.62, y + r * 1.1, a.Z0 + r * 1.95);
      const by0 = a.YF + L * 0.18, hw = W * 0.4; a.box(cx - hw, by0, bz - 100, cx + hw, a.YB - 20, bz);
      a.box(cx - hw, by0, bz, cx + hw, a.YB - 20, a.Z1 - 120); for (let i = 0; i < 5; i++) { a.box(cx - hw - 6, by0 + 200, bz + 150 + i * 70, cx - hw, a.YB - 200, bz + 175 + i * 70); a.box(cx + hw, by0 + 200, bz + 150 + i * 70, cx + hw + 6, a.YB - 200, bz + 175 + i * 70); }
      a.box(cx - hw * 0.9, by0 - 4, bz + 200, cx + hw * 0.9, by0, a.Z1 - 200);
      a.ycyl(by0 - 80, by0, cx - hw * 0.4, bz + (a.Z1 - bz) * 0.5, 260, 20); a.ycyl(by0 - 80, by0 - 60, cx - hw * 0.4, bz + (a.Z1 - bz) * 0.5, 280, 20); a.ycyl(by0 - 70, by0 - 4, cx - hw * 0.4, bz + (a.Z1 - bz) * 0.5, 80, 12);
      a.box(cx + hw * 0.1, by0 - 14, bz + 500, cx + hw * 0.85, by0, bz + 1000); for (const x of [0.25, 0.45, 0.65]) a.ycyl(by0 - 24, by0 - 14, cx + hw * x, bz + 900, 30, 8);
      a.cyl(cx + hw * 0.5, a.YB - 250, a.Z1 - 120, a.Z1, 40, 10); a.box(cx + hw * 0.35 - 200, a.YB - 150, bz - 60, cx + hw * 0.35 + 200, a.YB - 20, bz + 40);
      a.prism([[cx - 40, a.YF + 100], [cx + 40, a.YF + 100], [cx + W * 0.18, by0], [cx - W * 0.18, by0]], bz - 100, bz - 40); a.xcyl(cx - 25, cx + 25, a.YF + 20, bz - 70, 50, 12);
      a.rect(cx - hw, by0, cx + hw, a.YB - 20, 'EQUIP'); a.circ(cx - hw * 0.4, by0 - 40, 260, 'EQUIP-DETAIL'); a.line(cx - 40, a.YF + 100, cx - W * 0.18, by0, 'EQUIP-DETAIL'); a.line(cx + 40, a.YF + 100, cx + W * 0.18, by0, 'EQUIP-DETAIL'); a.circ(cx, a.YF + 20, 50, 'EQUIP-DETAIL');
      a.log('Added the louvred generator enclosure, cable reel, control panel, exhaust stack, fuel step, drawbar with tow ring and wheels with mudguards (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic manual pallet truck, depot',
    desc: (v) => `Manual pallet truck, ${v.cap} lb class, ${v.fl} in forks: two steel forks with entry tapers and tandem rollers at the tips, a pump unit with a hydraulic cylinder, a tiller handle with a three-position lever and a pair of steering wheels at the drive end.`,
    vs: [['4,500 lb, 48 in forks', 4500, 48, 27], ['5,500 lb, 72 in forks', 5500, 72, 27], ['5,500 lb, narrow, 48 in forks', 5500, 48, 20.5]].map(([l, cap, fl, w]) => [l, w, fl + 20, 48, 0, { cap: cap.toLocaleString('en-US'), fl }]),
    build: (a, v) => {
      const cx = a.cx, fw = 6.5 * IN, fy0 = a.YF + 12, fy1 = a.YF + v.fl * IN, hw = a.W / 2 - 15, my = a.YB - 15;
      for (const s of [-1, 1]) { const x = cx + s * (hw - fw / 2); a.box(x - fw / 2, fy0, a.Z0 + 20, x + fw / 2, fy1, a.Z0 + 100); a.prism([[x - fw / 2, fy0], [x + fw / 2, fy0], [x + fw * 0.2, fy0 - 0], [x - fw * 0.2, fy0 - 0]], a.Z0 + 20, a.Z0 + 21); a.xcyl(x - 30, x + 30, fy0 + 40, a.Z0 + 40, 36, 12); a.xcyl(x - 30, x + 30, fy0 + 40 + 76, a.Z0 + 40, 36, 12); a.xcyl(x - 30, x + 30, fy1 - 150, a.Z0 + 55, 55, 12); a.rect(x - fw / 2, fy0, x + fw / 2, fy1, 'EQUIP-DETAIL'); }
      a.box(cx - hw, fy1, a.Z0 + 40, cx + hw, fy1 + 220, a.Z0 + 200); a.box(cx - hw * 0.5, fy1 - 50, a.Z0 + 100, cx + hw * 0.5, fy1 + 200, a.Z0 + 240);
      a.cyl(cx, fy1 + 110, a.Z0 + 240, a.Z0 + 760, 55, 12); a.tube([[cx, fy1 + 110, a.Z0 + 700], [cx, my - 100, a.Z0 + 900], [cx, my, a.Z1 - 280]], [28, 25, 22], 8); a.xcyl(cx - 260, cx + 260, my, a.Z1 - 60, 22, 8); a.box(cx - 260, my - 10, a.Z1 - 70, cx - 120, my + 12, a.Z1 - 20);
      a.tube([[cx, my, a.Z1 - 280], [cx, my, a.Z1 - 60]], [22, 22], 8); for (const s of [-1, 1]) a.xcyl(cx + s * (hw - 20) - 25, cx + s * (hw - 20) + 25, fy1 + 110, a.Z0 + 100, 100, 14);
      a.box(cx - 15, fy1 + 20, a.Z0 + 200, cx + 15, fy1 + 90, a.Z0 + 420); a.rect(cx - hw, fy1, cx + hw, fy1 + 220, 'EQUIP');
      a.log('Added the two forks with entry tapers and tandem tip rollers, pump unit, steering wheels and tiller handle with lever (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic depot portal gantry crane',
    desc: (v) => `Portal gantry crane, ${v.sp} ft span, ${v.cap} ton class: two A-frame legs on end carriages with wheels on floor rails, a box girder bridge with an end truck at each leg, a trolley with a wire-rope hoist and hook, a driver walkway with a handrail and a pendant control on a cable.`,
    vs: [['20 ft span, 5 ton', 20, 5, 17], ['30 ft span, 10 ton', 30, 10, 20], ['40 ft span, 20 ton', 40, 20, 24]].map(([l, sp, cap, ht]) => [l, sp * 12 + 80, 160, ht * 12, 0, { sp, cap, ht }]),
    build: (a, v) => {
      const cx = a.cx, my = (a.YF + a.YB) / 2, hwx = v.sp * FT / 2, gz = a.Z1 - 420, gh = 420, dl = a.D / 2 - 200;
      for (const s of [-1, 1]) { const x = cx + s * hwx;
        a.box(x - 120, my - dl, a.Z0 + 60, x + 120, my + dl, a.Z0 + 200); for (const sy of [-1, 1]) { a.xcyl(x - 90, x + 90, my + sy * (dl - 150), a.Z0 + 35, 35, 10); a.xcyl(x - 90, x + 90, my + sy * 100, a.Z0 + 35, 35, 10); }
        a.tube([[x, my - dl + 100, a.Z0 + 200], [x, my - 80, gz]], [60, 55], 8); a.tube([[x, my + dl - 100, a.Z0 + 200], [x, my + 80, gz]], [60, 55], 8);
        a.tube([[x, my - dl * 0.55, a.Z0 + 1100], [x, my + dl * 0.55, a.Z0 + 1100]], [30, 30], 6); a.box(x - 150, my - 220, gz - 80, x + 150, my + 220, gz + gh * 0.4); a.rect(x - 120, my - dl, x + 120, my + dl, 'EQUIP-DETAIL'); }
      a.box(cx - hwx - 150, my - 160, gz, cx + hwx + 150, my + 160, gz + gh); a.box(cx - hwx, my - 220, gz + gh, cx + hwx, my - 190, gz + gh + 0);
      for (let i = 0; i <= 8; i++) { const x = cx - hwx + 100 + ((2 * hwx - 200) * i) / 8; a.box(x - 6, my - 162, gz + 40, x + 6, my - 160, gz + gh - 40); }
      a.box(cx - hwx - 150, my + 160, gz + gh * 0.3, cx + hwx + 150, my + 420, gz + gh * 0.4); a.tube([[cx - hwx - 150, my + 410, gz + gh * 0.4], [cx - hwx - 150, my + 410, gz + gh * 0.4 + 280], [cx + hwx + 150, my + 410, gz + gh * 0.4 + 280], [cx + hwx + 150, my + 410, gz + gh * 0.4]], [12, 12, 12, 12], 5);
      const tx = cx + hwx * 0.2; a.box(tx - 220, my - 220, gz + gh, tx + 220, my + 220, gz + gh + 180); a.xcyl(tx - 160, tx + 160, my, gz + gh + 300, 120, 14); a.cyl(tx, my, gz - 600, gz - 100, 10, 6); a.box(tx - 60, my - 40, gz - 800, tx + 60, my + 40, gz - 600); a.tube([[tx, my, gz - 800], [tx + 60, my, gz - 900], [tx, my, gz - 1000], [tx - 60, my, gz - 900]], [16, 16, 16, 16], 6);
      a.tube([[tx + 200, my + 100, gz - 100], [tx + 400, my + 200, a.Z0 + 1300]], [4, 4], 4); a.box(tx + 360, my + 160, a.Z0 + 1100, tx + 440, my + 240, a.Z0 + 1300);
      a.rect(cx - hwx - 150, my - 160, cx + hwx + 150, my + 160, 'EQUIP-DETAIL'); a.rect(tx - 220, my - 220, tx + 220, my + 220, 'EQUIP');
      a.log('Added the end carriages with wheels, A-frame legs with ties, box girder with walkway and handrail, trolley with wire-rope hoist and hook, and the pendant control (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic towed air compressor, depot',
    desc: (v) => `${v.cfm} cfm towed air compressor, ${v.len} in long: a louvred canopy over the engine and air end, hinged side doors with latches, an air receiver with a gauge and valves, a row of outlet valves with hose couplings at the rear, an exhaust stack, a drawbar with a tow ring and jockey wheel and ${v.ax === 2 ? 'a tandem axle' : 'a single axle'}.`,
    vs: [['185 cfm class', 185, 130, 60, 62, 1], ['375 cfm class', 375, 170, 66, 72, 1], ['750 cfm class', 750, 220, 78, 84, 2]].map(([l, cfm, len, w, h, ax]) => [l, w, len, h, 0, { cfm, len, ax }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, r = 14 * IN, ww = r * 0.55, bz = a.Z0 + r * 1.45, by0 = a.YF + L * 0.22, ys = v.ax === 2 ? [a.YB - L * 0.36, a.YB - L * 0.2] : [a.YB - L * 0.3], hw = W * 0.42;
      wheelsAt(a, ys, r, ww); for (const y of ys) for (const s of [-1, 1]) a.box(cx + s * (W / 2 - ww / 2 - 6) - ww * 0.62, y - r * 1.1, a.Z0 + r * 1.85, cx + s * (W / 2 - ww / 2 - 6) + ww * 0.62, y + r * 1.1, a.Z0 + r * 1.95);
      a.box(cx - hw, by0, bz - 120, cx + hw, a.YB - 20, bz); a.box(cx - hw, by0, bz, cx + hw, a.YB - 20, a.Z1 - 140); a.prism([[cx - hw, by0 + 20], [cx + hw, by0 + 20], [cx + hw * 0.8, by0 - 50], [cx - hw * 0.8, by0 - 50]], bz + 20, a.Z1 - 140);
      a.box(cx - hw * 0.9, by0 + 60, a.Z1 - 140, cx + hw * 0.9, a.YB - 60, a.Z1 - 90); for (const s of [-1, 1]) { for (let k = 0; k < 7; k++) a.box(cx + s * hw - 4 * s, by0 + 150 + k * ((a.YB - by0 - 400) / 7), bz + 500, cx + s * hw + 12 * s, by0 + 150 + k * ((a.YB - by0 - 400) / 7) + 90, a.Z1 - 260); a.box(cx + s * hw - 4 * s, by0 + 100, bz + 150, cx + s * hw + 12 * s, by0 + (a.YB - by0) * 0.5, bz + 450); a.box(cx + s * hw - 4 * s, by0 + (a.YB - by0) * 0.55, bz + 150, cx + s * hw + 12 * s, a.YB - 120, bz + 450); }
      a.ycyl(a.YB - 20, a.YB, cx - hw * 0.5, bz + 200, 130, 14); for (const k of [0.1, 0.4, 0.7]) { a.ycyl(a.YB - 6, a.YB + 0, cx + hw * k, bz + 450, 45, 8); a.cyl(cx + hw * k, a.YB - 8, bz + 450 - 0, bz + 600, 8, 6); }
      a.cyl(cx + hw * 0.5, a.YB - 200, a.Z1 - 90, a.Z1 - 10, 40, 10); a.cyl(cx + hw * 0.5, a.YB - 200, a.Z1 - 10, a.Z1, 60, 10);
      a.prism([[cx - 40, a.YF + 100], [cx + 40, a.YF + 100], [cx + W * 0.2, by0], [cx - W * 0.2, by0]], bz - 120, bz - 60); a.xcyl(cx - 25, cx + 25, a.YF + 20, bz - 90, 50, 12); a.cyl(cx + 120, a.YF + 280, a.Z0 + 70, bz - 100, 18, 8); a.xcyl(cx + 100, cx + 140, a.YF + 280, a.Z0 + 70, 70, 12);
      a.rect(cx - hw, by0, cx + hw, a.YB - 20, 'EQUIP'); a.line(cx - hw, by0 + (a.YB - by0) * 0.5, cx + hw, by0 + (a.YB - by0) * 0.5, 'EQUIP-DETAIL'); a.line(cx - 40, a.YF + 100, cx - W * 0.2, by0, 'EQUIP-DETAIL'); a.line(cx + 40, a.YF + 100, cx + W * 0.2, by0, 'EQUIP-DETAIL'); a.circ(cx, a.YF + 20, 50, 'EQUIP-DETAIL');
      a.log('Added the louvred canopy, side doors with latches, air receiver, outlet valves with couplings, exhaust stack, drawbar with tow ring and jockey wheel, axle and wheels (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic depot pallet racking bay',
    desc: (v) => `Pallet racking bay, ${v.lv} beam levels, ${v.bay} in wide: two upright frames with diagonal bracing and base plates, pairs of box-section load beams with safety clips at each level, wire mesh decks, a pallet with boxed cargo on each level and a row spacer between frames.`,
    vs: [['3 levels, 108 in bay', 3, 108, 126], ['4 levels, 108 in bay', 4, 108, 168], ['5 levels, 144 in bay', 5, 144, 216]].map(([l, lv, bay, h]) => [l, 44, bay + 4, h, 0, { lv, bay }]),
    build: (a, v) => {
      const cx = a.cx, hx = a.W / 2 - 40, uh = a.Z1 - a.Z0, gap = (uh - 200) / v.lv;
      for (const y of [a.YF + 40, a.YB - 40]) { for (const s of [-1, 1]) { a.box(cx + s * hx - 40, y - 40, a.Z0, cx + s * hx + 40, y + 40, a.Z1 - 20); a.box(cx + s * hx - 80, y - 80, a.Z0, cx + s * hx + 80, y + 80, a.Z0 + 14); }
        for (let i = 0; i < 2 * v.lv; i++) { const z0 = a.Z0 + 100 + (i * (uh - 200)) / (2 * v.lv), z1 = a.Z0 + 100 + ((i + 1) * (uh - 200)) / (2 * v.lv); a.tube([[cx - hx, y, i % 2 ? z1 : z0], [cx + hx, y, i % 2 ? z0 : z1]], [12, 12], 4); } a.tube([[cx - hx, y, a.Z0 + 100], [cx + hx, y, a.Z0 + 100]], [12, 12], 4); a.tube([[cx - hx, y, a.Z1 - 120], [cx + hx, y, a.Z1 - 120]], [12, 12], 4); }
      for (let l = 0; l < v.lv; l++) { const z = a.Z0 + 200 + l * gap; for (const s of [-1, 1]) { a.box(cx + s * hx - (s > 0 ? 90 : 0) - 0, a.YF + 40, z, cx + s * hx + (s > 0 ? 0 : 90), a.YB - 40, z + 100); a.box(cx + s * hx - 4 * s, a.YF + 40, z - 40, cx + s * hx + 24 * s, a.YF + 80, z + 60); a.box(cx + s * hx - 4 * s, a.YB - 80, z - 40, cx + s * hx + 24 * s, a.YB - 40, z + 60); }
        a.box(cx - hx + 90, a.YF + 80, z + 100, cx + hx - 90, a.YB - 80, z + 114);
        const pz = z + 114, np = v.bay > 120 ? 3 : 2; for (let p = 0; p < np; p++) { const y0 = a.YF + 100 + p * ((a.D - 160) / np); const y1 = y0 + (a.D - 160) / np - 80; for (const k of [0, 1, 2]) a.box(cx - hx + 120, y0 + k * ((y1 - y0) / 3), pz, cx + hx - 120, y0 + k * ((y1 - y0) / 3) + (y1 - y0) / 3 - 30, pz + 100); a.box(cx - hx + 120, y0, pz + 100, cx + hx - 120, y1, pz + Math.min(gap - 320, 560)); } }
      for (const s of [-1, 1]) a.box(cx + s * hx - 30, a.YF + 40, a.Z0 + 100, cx + s * hx + 30, a.YB - 40, a.Z0 + 124);
      a.rect(a.X0 + 40, a.YF + 20, a.X1 - 40, a.YB - 20, 'EQUIP'); for (const y of [a.YF + 40, a.YB - 40]) a.rect(cx - hx - 40, y - 40, cx + hx + 40, y + 40, 'EQUIP-DETAIL');
      a.log('Added the two braced upright frames with base plates, load beams with safety clips, wire mesh decks and a pallet with boxed cargo on each level (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic mobile yard loading ramp',
    desc: (v) => `Mobile yard ramp for ${v.ht} in dock height: a steel deck with an anti-slip tread and a hinged lip plate, two side kerbs with handrails, a pair of wheels at the high end with a lifting handle and a towing eye, adjustable support legs, a brake lock and a wheel chock on a chain.`,
    vs: [['36 in dock height', 36, 240], ['48 in dock height', 48, 300], ['60 in dock height', 60, 360]].map(([l, ht, len]) => [l, 96, len, ht + 40, 0, { ht, len }]),
    build: (a, v) => {
      const cx = a.cx, hw = a.W / 2 - 40, hz = a.Z0 + v.ht * IN, lz = a.Z0 + 150, y0 = a.YF + 40, y1 = a.YB - 120, ly = a.YF + 150;
      prismX(a, [[y0, lz], [y1, hz], [y1, hz - 120], [y0, lz - 40]].map(([y, z]) => [y, z]), cx - hw, cx + hw);
      for (let i = 0; i < 16; i++) { const f = (i + 0.5) / 16, y = y0 + (y1 - y0) * f; a.box(cx - hw * 0.9, y, lz + (hz - lz) * f + 0, cx + hw * 0.9, y + 18, lz + (hz - lz) * f + 18); }
      a.box(cx - hw, y1, hz - 200, cx + hw, y1 + 80, hz); a.box(cx - hw, y0 - 20, lz - 40, cx + hw, y0 + 20, lz);
      for (const s of [-1, 1]) { prismX(a, [[y0, lz], [y1, hz], [y1, hz + 70], [y0, lz + 70]], cx + s * hw - 40 * (s > 0 ? 1 : 0) - (s < 0 ? 0 : 0), cx + s * hw + (s > 0 ? 0 : 40)); for (let k = 0; k < 4; k++) { const f = k / 3, y = y0 + 200 + (y1 - y0 - 400) * f, z = lz + (hz - lz) * ((y - y0) / (y1 - y0)); a.tube([[cx + s * hw, y, z + 70], [cx + s * hw, y, z + 900]], [18, 18], 6); } a.tube([[cx + s * hw, y0 + 200, lz + (hz - lz) * (200 / (y1 - y0)) + 900], [cx + s * hw, y1 - 200, hz - 0 + 900 - (hz - hz) ]], [18, 18], 6); a.tube([[cx + s * hw, y0 + 200, lz + (hz - lz) * (200 / (y1 - y0)) + 450], [cx + s * hw, y1 - 200, hz + 450]], [12, 12], 6); }
      for (const s of [-1, 1]) { a.xcyl(cx + s * (hw + 0) - 60, cx + s * (hw + 0) + 60, y1 - 700, a.Z0 + 190, 190, 16); a.cyl(cx + s * hw * 0.6, y1 - 200, a.Z0, hz - 200, 36, 8); a.box(cx + s * hw * 0.6 - 90, y1 - 290, a.Z0, cx + s * hw * 0.6 + 90, y1 - 110, a.Z0 + 20); }
      a.tube([[cx, y0 + 40, lz - 60], [cx, y0 + 40, lz - 400]], [10, 10], 5); a.box(cx - 100, y0 - 100, a.Z0, cx + 100, y0 + 100, a.Z0 + 120);
      a.rect(cx - hw, y0, cx + hw, y1, 'EQUIP'); for (let i = 1; i < 5; i++) a.line(cx - hw, y0 + ((y1 - y0) * i) / 5, cx + hw, y0 + ((y1 - y0) * i) / 5, 'EQUIP-DETAIL'); a.rect(cx - hw, y1, cx + hw, y1 + 80, 'EQUIP-DETAIL');
      a.log('Added the sloped deck with tread, hinged lip plate, side kerbs with handrails, wheels, adjustable support legs and the chocked towing end (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic portable roller conveyor, depot',
    desc: (v) => `Portable roller conveyor, ${v.ft} ft long and ${v.bw} in wide: a pair of channel side frames carrying closely spaced steel rollers with axle ends, adjustable stands with cross ties and foot pads at both ends${v.ft > 10 ? ' and a middle pair' : ''}, and end stops.`,
    vs: [['10 ft, 18 in wide', 10, 18], ['16 ft, 24 in wide', 16, 24], ['24 ft, 30 in wide', 24, 30]].map(([l, ft, bw]) => [l, bw + 8, ft * 12, 38, 0, { ft, bw }]),
    build: (a, v) => {
      const cx = a.cx, hw = v.bw * IN / 2 + 30, rz = a.Z0 + 28 * IN, nr = m.round(v.ft * 12 / 3);
      for (const s of [-1, 1]) a.box(cx + s * hw - 20, a.YF, rz - 80, cx + s * hw + 20, a.YB, rz + 10);
      for (let i = 0; i < nr; i++) { const y = a.YF + 40 + ((a.D - 80) * i) / (nr - 1); a.xcyl(cx - hw + 10, cx + hw - 10, y, rz - 10, 24, 10); a.box(cx - hw - 4, y - 5, rz - 20, cx - hw + 12, y + 5, rz); a.box(cx + hw - 12, y - 5, rz - 20, cx + hw + 4, y + 5, rz); }
      const sy = v.ft > 10 ? [a.YF + 250, (a.YF + a.YB) / 2, a.YB - 250] : [a.YF + 250, a.YB - 250];
      for (const y of sy) { for (const s of [-1, 1]) { a.tube([[cx + s * hw, y, rz - 80], [cx + s * (hw + 120), y, a.Z0 + 60]], [20, 20], 6); a.box(cx + s * (hw + 120) - 60, y - 60, a.Z0, cx + s * (hw + 120) + 60, y + 60, a.Z0 + 20); } a.tube([[cx - hw, y, rz - 140], [cx + hw, y, rz - 140]], [12, 12], 5); }
      for (const y of [a.YF + 4, a.YB - 24]) a.box(cx - hw, y, rz + 10, cx + hw, y + 20, rz + 90);
      a.rect(cx - hw - 20, a.YF, cx + hw + 20, a.YB, 'EQUIP'); for (let i = 0; i < nr; i += 2) { const y = a.YF + 40 + ((a.D - 80) * i) / (nr - 1); a.line(cx - hw, y, cx + hw, y, 'EQUIP-DETAIL'); }
      a.log('Added the channel side frames, closely spaced rollers with axle ends, adjustable stands with cross ties and foot pads, and end stops (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic surface weighbridge, platform',
    desc: (v) => `Surface-mounted weighbridge, ${v.dl} ft platform, ${v.cap} t class: a steel deck of chequer plate on cross girders with side kerbs, approach ramps at both ends, four load-cell housings at the corners, a junction box and a display post with a head unit on a stand.`,
    vs: [['10 by 6 ft, 3 t', 10, 6, 3], ['20 by 10 ft, 30 t', 20, 10, 30], ['40 by 10 ft, 60 t', 40, 10, 60]].map(([l, dl, dw, cap]) => [l, (dw + 4) * 12 + 36, (dl + 6) * 12, 56, 0, { dl, dw, cap }]),
    build: (a, v) => {
      const cx = a.cx, my = (a.YF + a.YB) / 2, dw = v.dw * FT, dl = v.dl * FT, dz = a.Z0 + 280, rp = 600;
      a.box(cx - dw / 2 - 150, my - dl / 2, a.Z0, cx + dw / 2 + 150, my + dl / 2, dz - 120);
      a.box(cx - dw / 2, my - dl / 2, dz - 120, cx + dw / 2, my + dl / 2, dz);
      for (let i = 0; i < 14; i++) a.box(cx - dw / 2, my - dl / 2 + 60 + i * ((dl - 120) / 13), dz, cx + dw / 2, my - dl / 2 + 60 + i * ((dl - 120) / 13) + 18, dz + 14);
      for (const s of [-1, 1]) a.box(cx + s * dw / 2 - (s > 0 ? 70 : 0), my - dl / 2, dz, cx + s * dw / 2 + (s < 0 ? 70 : 0), my + dl / 2, dz + 140);
      for (const s of [-1, 1]) prismX(a, [[my + s * dl / 2, dz - 120], [my + s * (dl / 2 + rp), a.Z0], [my + s * (dl / 2 + rp), a.Z0 + 40], [my + s * dl / 2, dz]].map(([y, z]) => [y, z]), cx - dw / 2, cx + dw / 2);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * (dw / 2 - 170) - 100, my + sy * (dl / 2 - 170) - 100, dz - 160, cx + sx * (dw / 2 - 170) + 100, my + sy * (dl / 2 - 170) + 100, dz - 120);
      a.box(cx + dw / 2 + 20, my - dl / 2 + 120, a.Z0 + 20, cx + dw / 2 + 150, my - dl / 2 + 280, a.Z0 + 200);
      a.tube([[cx + dw / 2 + 100, my - dl / 2 - 0 + 0, a.Z0], [cx + dw / 2 + 100, my - dl / 2 + 0, a.Z0 + 1200]], [30, 30], 8); a.box(cx + dw / 2 + 20, my - dl / 2 - 120, a.Z0 + 1200, cx + dw / 2 + 180, my - dl / 2 + 60, a.Z0 + 1400);
      a.rect(cx - dw / 2, my - dl / 2, cx + dw / 2, my + dl / 2, 'EQUIP'); for (const s of [-1, 1]) a.line(cx - dw / 2, my + s * dl / 2 + s * rp * 0.5, cx + dw / 2, my + s * dl / 2 + s * rp * 0.5, 'EQUIP-DETAIL'); a.rect(cx - dw / 2 - 150, my - dl / 2 - rp, cx + dw / 2 + 150, my + dl / 2 + rp, 'EQUIP-DETAIL');
      a.log('Added the chequer deck on cross girders with side kerbs, both approach ramps, corner load-cell housings, junction box and the display post with its head unit (plan and 3D).');
    } }),
];
export default FAMS;

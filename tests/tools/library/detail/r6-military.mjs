/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, military: generic utility vehicles and trailers, shelters and field structures, field kitchens, water and fuel storage, camp gear, logistics and airfield support. Plain non-weapon scale shapes; no unit, programme, maker or model. */
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
  fam({ cat: 'military/vehicles', title: 'Generic light utility vehicle, 4x4',
    desc: (v) => `Light 4x4 utility vehicle, ${v.len} in long, ${v.kind === 'soft' ? 'two-door with a canvas top on bows' : v.kind === 'hard' ? 'four-door with a hard roof and side windows' : v.kind === 'pickup' ? 'with a cab and an open cargo bed with a tailgate' : 'with a cab and an enclosed cargo canopy'}: ladder frame, four lugged wheels, hood with grille and lamps, wings, windscreen, mirrors, a rear spare wheel and fuel can racks. Unarmed.`,
    vs: [['two-door soft top, 130 in', 'soft', 130, 66, 74, 15], ['four-door hard top, 172 in', 'hard', 172, 72, 80, 17], ['pickup bed, 205 in', 'pickup', 205, 74, 78, 17], ['long canopy, 232 in', 'canopy', 232, 76, 90, 18]].map(([l, kind, len, w, h, r]) => [l, w, len, h, 0, { kind, len, r }]),
    build: (a, v) => {
      const r = v.r * IN, ww = r * 0.62, L = a.D, W = a.W, H = a.H, cx = a.cx, ys = [a.YF + L * 0.18, a.YB - L * 0.2], zf = a.Z0 + r * 1.1, yw = a.YF + L * 0.34;
      frameRails(a, a.YF + L * 0.06, a.YB - L * 0.04, a.Z0 + r * 0.8, W * 0.26, 70, r * 0.3); wheelsAt(a, ys, r, ww);
      a.box(cx - W * 0.4, a.YF + L * 0.08, zf, cx + W * 0.4, a.YB - L * 0.03, zf + 60); a.box(cx - W * 0.38, a.YF + L * 0.05, zf + 60, cx + W * 0.38, yw, zf + H * 0.3); frontEnd(a, a.YF, zf, zf + H * 0.3, W * 0.4, r * 0.22);
      for (const s of [-1, 1]) { a.box(cx + s * W * 0.36 - (s > 0 ? 0 : W * 0.14), ys[0] - r * 1.1, a.Z0 + r * 1.95, cx + s * W * 0.36 + (s > 0 ? W * 0.14 : 0), ys[0] + r * 1.1, a.Z0 + r * 2.1); a.box(cx + s * W * 0.36 - (s > 0 ? 0 : W * 0.14), ys[1] - r * 1.05, a.Z0 + r * 1.95, cx + s * W * 0.36 + (s > 0 ? W * 0.14 : 0), ys[1] + r * 1.05, a.Z0 + r * 2.1); a.box(cx + s * W * 0.5 - 8, yw - 60, zf + H * 0.2, cx + s * W * 0.5 + 8, yw + 90, zf + H * 0.5); }
      const belt = zf + H * 0.34, top = a.Z1;
      if (v.kind === 'soft' || v.kind === 'hard') {
        for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 24, yw, zf + 60, cx + s * W * 0.4 + 24, a.YB - L * 0.12, belt);
        a.box(cx - W * 0.4, a.YB - L * 0.12, zf + 60, cx + W * 0.4, a.YB - L * 0.1, belt); glazing(a, cx - W * 0.38, cx + W * 0.38, yw - 10, belt, belt + H * 0.26, 24, 30);
        if (v.kind === 'soft') { canvasCover(a, yw + 120, a.YB - L * 0.12, W * 0.4, belt, top, 4); a.box(cx - W * 0.4, a.YB - L * 0.12, belt, cx + W * 0.4, a.YB - L * 0.115, belt + (top - belt) * 0.7); }
        else { a.box(cx - W * 0.4, yw + 100, belt, cx + W * 0.4, a.YB - L * 0.1, top); for (const s of [-1, 1]) { a.box(cx + s * W * 0.4 - 6 * s, yw + 160, belt + H * 0.04, cx + s * W * 0.4 + 14 * s, a.YB - L * 0.14, belt + H * 0.22); } a.rect(cx - W * 0.4, yw + 100, cx + W * 0.4, a.YB - L * 0.1, 'EQUIP-DETAIL'); }
      } else {
        const ce = yw + L * 0.26; a.box(cx - W * 0.4, yw, zf + 60, cx + W * 0.4, ce, top - H * 0.1); glazing(a, cx - W * 0.36, cx + W * 0.36, yw - 8, belt, belt + H * 0.26, 24, 30);
        for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 6 * s, yw + 100, belt + H * 0.04, cx + s * W * 0.4 + 14 * s, ce - 60, belt + H * 0.22);
        const bx1 = a.YB - L * 0.03;
        if (v.kind === 'pickup') { for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 22, ce + 40, zf + 60, cx + s * W * 0.4 + 22, bx1, zf + H * 0.32); a.box(cx - W * 0.4, bx1 - 40, zf + 60, cx + W * 0.4, bx1, zf + H * 0.32); a.box(cx - W * 0.4, ce + 20, zf + 60, cx + W * 0.4, ce + 60, zf + H * 0.4); a.tube([[cx - W * 0.36, ce + 100, zf + 60], [cx - W * 0.36, ce + 100, top - H * 0.04], [cx + W * 0.36, ce + 100, top - H * 0.04], [cx + W * 0.36, ce + 100, zf + 60]], Array(4).fill(18), 6); }
        else { a.box(cx - W * 0.4, ce + 30, zf + 60, cx + W * 0.4, bx1, top); for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 6 * s, ce + 300, zf + H * 0.4, cx + s * W * 0.4 + 14 * s, bx1 - 300, zf + H * 0.62); a.box(cx - W * 0.2, bx1 - 4, zf + H * 0.4, cx + W * 0.2, bx1, zf + H * 0.62); a.rect(cx - W * 0.4, ce + 30, cx + W * 0.4, bx1, 'EQUIP-DETAIL'); }
        a.line(cx - W * 0.4, ce, cx + W * 0.4, ce, 'EQUIP-DETAIL');
      }
      a.ycyl(a.YB - 20, a.YB - 6, cx + W * 0.2, zf + H * 0.24, r * 0.9, 16); a.ycyl(a.YB - 6, a.YB, cx + W * 0.2, zf + H * 0.24, r * 0.35, 10);
      for (const s of [-1, 1]) a.box(cx + s * W * 0.2 - 90, a.YB - 70, zf + 60, cx + s * W * 0.2 + 90, a.YB - 30, zf + 60 + 280);
      a.rect(cx - W * 0.45, a.YF, cx + W * 0.45, a.YB, 'EQUIP'); a.line(cx - W * 0.4, yw, cx + W * 0.4, yw, 'EQUIP-DETAIL'); a.rect(cx - W * 0.38, a.YF + L * 0.05, cx + W * 0.38, yw, 'EQUIP-DETAIL');
      a.log('Added the ladder frame, lugged wheels, hood with grille and lamps, wings, windscreen, ' + (v.kind === 'soft' ? 'canvas top on bows' : v.kind === 'hard' ? 'hard roof and windows' : v.kind === 'pickup' ? 'cab and open cargo bed' : 'cab and cargo canopy') + ', mirrors, spare wheel and fuel can racks (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic military cargo truck',
    desc: (v) => `${v.drive} cargo truck, ${v.len} in long, ${v.kind === 'flat' ? 'with a flat bed, drop sides, a headboard and a front winch' : 'with a drop-side bed under a canvas cover on bows and a rear tailgate'}: ladder frame, ${v.ax} axles with ${v.dual ? 'dual rear wheels' : 'single wheels'}, a hood with grille and lamps, a cab with windscreen, side windows and mirrors, and steps. Unarmed.`,
    vs: [['4x4, 2 ton class, 240 in', '4x4', 240, 88, 112, 19, 2, 'cover', false], ['6x6, 5 ton class, 300 in', '6x6', 300, 96, 118, 22, 3, 'cover', true], ['6x6, flat bed with winch, 330 in', '6x6', 330, 96, 100, 22, 3, 'flat', true], ['8x8, heavy, 390 in', '8x8', 390, 100, 124, 23, 4, 'cover', true]].map(([l, drive, len, w, h, r, ax, kind, dual]) => [l, w, len, h, 0, { drive, len, r, ax, kind, dual }]),
    build: (a, v) => {
      const r = v.r * IN, L = a.D, W = a.W, ww = r * 0.6, cx = a.cx;
      const axles = v.ax === 2 ? [L * 0.17, L * 0.76] : v.ax === 3 ? [L * 0.15, L * 0.68, L * 0.84] : [L * 0.13, L * 0.27, L * 0.7, L * 0.87];
      const T = truck(a, { r, ww, axles, dual: axles.map((_, i) => v.dual && i >= (v.ax === 4 ? 2 : 1)), steer: v.ax === 4 ? 2 : 1, cabL: L * 0.2, hoodL: L * 0.17, cabH: a.H * 0.6, hoodH: a.H * 0.4 });
      const y0 = T.yb, y1 = a.YB - 20, zf = T.zf, bz = zf + 140, hw = W * 0.45;
      a.box(cx - hw, y0, zf, cx + hw, y1, bz); a.box(cx - hw, y0, bz, cx + hw, y0 + 30, bz + 700);
      for (const s of [-1, 1]) { a.box(cx + s * hw - 20, y0, bz, cx + s * hw + 20, y1, bz + 460); for (let i = 1; i < 12; i++) { const y = y0 + ((y1 - y0) * i) / 12; a.box(cx + s * hw - 26, y - 6, bz, cx + s * hw + 26, y + 6, bz + 460); } }
      a.box(cx - hw, y1 - 30, bz, cx + hw, y1, bz + 460);
      for (const s of [-1, 1]) a.box(cx + s * W * 0.3 - 60, y1 - 10, zf + 40, cx + s * W * 0.3 + 60, y1, zf + 140);
      if (v.kind === 'cover') canvasCover(a, y0 + 60, y1 - 40, hw * 0.98, bz + 460, a.Z1, 6);
      else { for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const y = y0 + 200 + ((y1 - y0 - 400) * i) / 3; a.box(cx + s * hw - 12, y - 15, bz + 460, cx + s * hw + 12, y + 15, bz + 900); } a.box(cx - hw, y0 + 20, bz + 460, cx + hw, y0 + 60, bz + 980); a.xcyl(cx - W * 0.2, cx + W * 0.2, a.YF + 90, zf + 40, 90, 12); a.rect(cx - W * 0.2, a.YF + 30, cx + W * 0.2, a.YF + 150, 'EQUIP-DETAIL'); }
      a.rect(cx - hw, y0, cx + hw, y1, 'EQUIP'); a.line(cx - hw, y0, cx + hw, y1, 'EQUIP-DETAIL'); a.line(cx + hw, y0, cx - hw, y1, 'EQUIP-DETAIL');
      a.log('Added the ladder frame, wheels, hood with grille and lamps, cab with windscreen and mirrors, drop-side bed and ' + (v.kind === 'cover' ? 'canvas cover on bows' : 'headboard and winch') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic tracked utility carrier',
    desc: (v) => `Tracked utility carrier, ${v.len} in long, unarmed: a sloped-bow hull, two track units each with a drive sprocket, idler, ${v.rw} road wheels and return rollers, a front cab with windows and a hatch, an engine deck with louvres and an open cargo compartment${v.cover ? ' under a canvas cover on bows' : ' with side walls and a rear ramp'}.`,
    vs: [['light, 160 in', 160, 74, 64, 5, false], ['medium, 210 in', 210, 98, 76, 6, false], ['heavy cargo, 260 in', 260, 108, 88, 7, false], ['covered cargo, 230 in', 230, 100, 100, 6, true]].map(([l, len, w, h, rw, cover]) => [l, w, len, h, 0, { len, rw, cover }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, trh = a.H * (v.cover ? 0.34 : 0.4), tw = W * 0.17, xo = W / 2 - tw / 2, zb = a.Z0 + trh * 0.42, zt = zb + a.H * (v.cover ? 0.28 : 0.36);
      for (const s of [-1, 1]) { const x = cx + s * xo; prismX(a, [[a.YF + trh * 0.9, a.Z0 + trh * 0.2], [a.YF + L * 0.02, a.Z0 + trh * 0.7], [a.YF + L * 0.1, a.Z0 + trh], [a.YB - L * 0.1, a.Z0 + trh], [a.YB - L * 0.02, a.Z0 + trh * 0.7], [a.YB - trh * 0.9, a.Z0 + trh * 0.2], [a.YB - trh * 0.9 - 80, a.Z0], [a.YF + trh * 0.9 + 80, a.Z0]], x - tw / 2, x + tw / 2);
        const rr = trh * 0.36; for (let i = 0; i < v.rw; i++) { const y = a.YF + trh * 1.2 + ((L - trh * 2.4) * i) / (v.rw - 1); a.xcyl(x - tw * 0.58, x + tw * 0.58, y, a.Z0 + rr + 20, rr, 14); a.xcyl(x - tw * 0.66, x + tw * 0.66, y, a.Z0 + rr + 20, rr * 0.4, 8); a.circ(x, y, rr * 0.6, 'EQUIP-DETAIL'); }
        a.xcyl(x - tw * 0.6, x + tw * 0.6, a.YB - trh * 0.8, a.Z0 + trh * 0.62, trh * 0.4, 16); a.xcyl(x - tw * 0.6, x + tw * 0.6, a.YF + trh * 0.8, a.Z0 + trh * 0.62, trh * 0.34, 14);
        for (let i = 0; i < 3; i++) a.xcyl(x - tw * 0.3, x + tw * 0.3, a.YF + L * (0.3 + 0.2 * i), a.Z0 + trh * 0.95, trh * 0.09, 8); a.rect(x - tw / 2, a.YF, x + tw / 2, a.YB, 'EQUIP-DETAIL');
        a.box(x - tw / 2, a.YF + L * 0.1, a.Z0 + trh * 1.0, x + tw / 2, a.YB - L * 0.1, a.Z0 + trh * 1.06); }
      const hw = W / 2 - tw * 0.95;
      prismX(a, [[a.YF + L * 0.03, zb + (zt - zb) * 0.3], [a.YF + L * 0.2, zt], [a.YB - L * 0.02, zt], [a.YB - L * 0.02, zb], [a.YF + L * 0.1, zb]], cx - hw, cx + hw);
      const cb = a.YF + L * 0.2, ce = a.YF + L * 0.36, ct = zt + a.H * 0.22;
      a.box(cx - hw * 0.9, cb, zt, cx + hw * 0.9, ce, ct); a.frame(cx - hw * 0.8, zt + a.H * 0.05, cx + hw * 0.8, ct - 30, cb - 12, cb + 6, 20); a.cyl(cx - hw * 0.35, (cb + ce) / 2, ct, ct + 60, hw * 0.28, 14); a.cyl(cx + hw * 0.4, (cb + ce) / 2, ct, ct + 40, hw * 0.1, 8);
      for (const s of [-1, 1]) a.box(cx + s * hw * 0.9 - 6, cb + 120, zt + a.H * 0.06, cx + s * hw * 0.9 + 6, ce - 80, ct - 40);
      a.box(cx - hw * 0.8, ce + 40, zt, cx + hw * 0.8, ce + L * 0.14, zt + 70); for (let i = 0; i < 6; i++) a.box(cx - hw * 0.7, ce + 70 + i * L * 0.02, zt + 70, cx + hw * 0.7, ce + 70 + i * L * 0.02 + 20, zt + 90);
      const bs = ce + L * 0.18, be = a.YB - L * 0.02; for (const s of [-1, 1]) a.box(cx + s * hw - 22 * s - (s > 0 ? 22 : 0), bs, zt, cx + s * hw + (s > 0 ? 0 : 22), be, zt + a.H * 0.2 + (v.cover ? 0 : 0));
      a.box(cx - hw, be - 30, zt, cx + hw, be, zt + a.H * 0.2);
      if (v.cover) canvasCover(a, bs + 20, be - 40, hw * 0.96, zt + a.H * 0.2, a.Z1, 4); else for (const s of [-1, 0, 1]) a.box(cx + s * hw * 0.4 - hw * 0.14, bs + 200, zt + 20, cx + s * hw * 0.4 + hw * 0.14, bs + 260, zt + 100);
      a.rect(cx - hw, a.YF + L * 0.03, cx + hw, be, 'EQUIP'); a.rect(cx - hw * 0.9, cb, cx + hw * 0.9, ce, 'EQUIP-DETAIL'); a.rect(cx - hw * 0.8, ce + 40, cx + hw * 0.8, ce + L * 0.14, 'EQUIP-DETAIL');
      a.log('Added the sloped hull, two track units with sprocket, idler, road wheels and return rollers, front cab with hatch, engine deck louvres and the cargo compartment (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic field ambulance vehicle',
    desc: (v) => `${v.drive} field ambulance, ${v.len} in long: a cab with windscreen and mirrors, a boxed patient compartment with a side door, a window, double rear doors with handles and a step, roof vents and a roof light bar, and ${v.ax} axles. Unarmed.`,
    vs: [['4x4, light, 200 in', '4x4', 200, 78, 96, 17, 2], ['4x4, large box, 262 in', '4x4', 262, 88, 112, 19, 2], ['6x6, 5 ton class, 310 in', '6x6', 310, 96, 118, 22, 3]].map(([l, drive, len, w, h, r, ax]) => [l, w, len, h, 0, { drive, len, r, ax }]),
    build: (a, v) => {
      const r = v.r * IN, L = a.D, W = a.W, ww = r * 0.6, cx = a.cx;
      const axles = v.ax === 2 ? [L * 0.2, L * 0.78] : [L * 0.16, L * 0.7, L * 0.86];
      const T = truck(a, { r, ww, axles, dual: axles.map((_, i) => v.ax === 3 && i > 0), cabL: L * 0.2, hoodL: L * 0.15, cabH: a.H * 0.58, hoodH: a.H * 0.38 });
      const y0 = T.yb - 40, y1 = a.YB - 20, zf = T.zf, hw = W * 0.46, top = a.Z1 - 140;
      a.box(cx - hw, y0, zf + 60, cx + hw, y1, top); a.box(cx - hw * 0.96, y0 - 60, zf + 60, cx + hw * 0.96, y0, top - 160);
      for (const s of [-1, 1]) { a.box(cx + s * hw - 6 * s, y0 + (y1 - y0) * 0.2, zf + (top - zf) * 0.5, cx + s * hw + 12 * s, y0 + (y1 - y0) * 0.42, zf + (top - zf) * 0.82); a.box(cx + s * hw - 4 * s, y0 + (y1 - y0) * 0.52, zf + 220, cx + s * hw + 10 * s, y0 + (y1 - y0) * 0.78, top - 160); }
      for (const s of [-1, 1]) { a.box(cx + s * hw * 0.5 - hw * 0.4, y1 - 14, zf + 220, cx + s * hw * 0.5 + hw * 0.4 - 0, y1 + 0, top - 120); a.box(cx + s * hw * 0.85 - 8, y1 - 40, zf + (top - zf) * 0.5, cx + s * hw * 0.85 + 8, y1, zf + (top - zf) * 0.5 + 300); }
      a.box(cx - hw * 0.8, y1 - 130, zf - 60, cx + hw * 0.8, y1, zf + 20);
      for (const i of [0, 1]) a.box(cx - hw * 0.3, y0 + (y1 - y0) * (0.25 + i * 0.4), top, cx + hw * 0.3, y0 + (y1 - y0) * (0.25 + i * 0.4) + 400, top + 130);
      a.box(cx - hw * 0.5, y0 + 40, top, cx + hw * 0.5, y0 + 160, top + 130); for (const s of [-1, 1]) a.ell(cx + s * hw * 0.3, y0 + 100, top + 130, 90, 60, 60, 8, 4);
      a.rect(cx - hw, y0, cx + hw, y1, 'EQUIP'); a.line(cx - hw * 0.02, y1, cx - hw * 0.02, y1 - 300, 'EQUIP-DETAIL'); a.rect(cx - hw * 0.8, y1 - 130, cx + hw * 0.8, y1, 'EQUIP-DETAIL');
      a.log('Added the cab, boxed patient compartment with side door and window, double rear doors with step, roof vents and light bar, wheels and mirrors (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic mobile command post vehicle',
    desc: (v) => `${v.drive} command vehicle, ${v.len} in long: a cab, a boxed operations compartment with a side door and steps, a folding side awning frame, a roof air conditioner, ${v.masts} roof masts with guyless whip antennas and a roof cable tray. Unarmed.`,
    vs: [['4x4, light, 215 in', '4x4', 215, 82, 112, 18, 2, 2], ['4x4, medium, 270 in', '4x4', 270, 90, 122, 19, 2, 3], ['6x6, heavy, 330 in', '6x6', 330, 98, 132, 22, 3, 4]].map(([l, drive, len, w, h, r, ax, masts]) => [l, w, len, h, 0, { drive, len, r, ax, masts }]),
    build: (a, v) => {
      const r = v.r * IN, L = a.D, W = a.W, ww = r * 0.6, cx = a.cx, axles = v.ax === 2 ? [L * 0.19, L * 0.78] : [L * 0.15, L * 0.69, L * 0.85];
      const T = truck(a, { r, ww, axles, dual: axles.map((_, i) => v.ax === 3 && i > 0), cabL: L * 0.2, hoodL: L * 0.14, cabH: a.H * 0.52, hoodH: a.H * 0.34 });
      const y0 = T.yb - 40, y1 = a.YB - 20, zf = T.zf, hw = W * 0.46, top = a.Z1 - 760;
      a.box(cx - hw, y0, zf + 60, cx + hw, y1, top);
      for (const s of [-1, 1]) { a.box(cx + s * hw - 4 * s, y0 + (y1 - y0) * 0.55, zf + 250, cx + s * hw + 12 * s, y0 + (y1 - y0) * 0.55 + 700, top - 300); a.box(cx + s * hw - 4 * s, y0 + (y1 - y0) * 0.2, zf + (top - zf) * 0.55, cx + s * hw + 8 * s, y0 + (y1 - y0) * 0.38, top - 280); }
      a.frame(cx - hw * 0.8, zf - 40 + 200, cx + hw * 0.8, zf + 780, y1 - 14, y1, 24); a.box(cx + hw, y0 + (y1 - y0) * 0.5, zf - 80, cx + hw + 160, y0 + (y1 - y0) * 0.5 + 760, zf - 50);
      a.frame(cx - hw - 20, top - 260, cx - hw, top - 40, y0 + (y1 - y0) * 0.1, y1 - (y1 - y0) * 0.1, 18);
      a.box(cx - hw * 0.6, y0 + 150, top, cx + hw * 0.6, y0 + 150 + (y1 - y0) * 0.22, top + 360); a.cyl(cx - hw * 0.3, y0 + 150 + (y1 - y0) * 0.11, top + 360, top + 420, hw * 0.16, 12); a.cyl(cx + hw * 0.3, y0 + 150 + (y1 - y0) * 0.11, top + 360, top + 420, hw * 0.16, 12);
      a.box(cx - 90, y0 + (y1 - y0) * 0.45, top, cx + 90, y1 - 120, top + 90);
      for (let i = 0; i < v.masts; i++) { const x = cx + (i % 2 ? 1 : -1) * hw * (0.5 + 0.12 * (i >> 1)), y = y0 + (y1 - y0) * (0.5 + 0.1 * i); a.cyl(x, y, top, top + 110, 60, 10); a.tube([[x, y, top + 110], [x, y, a.Z1]], [16, 3], 6); a.circ(x, y, 60, 'EQUIP-DETAIL'); }
      a.rect(cx - hw, y0, cx + hw, y1, 'EQUIP'); a.rect(cx - hw * 0.6, y0 + 150, cx + hw * 0.6, y0 + 150 + (y1 - y0) * 0.22, 'EQUIP-DETAIL'); a.rect(cx + hw, y0 + (y1 - y0) * 0.5, cx + hw + 160, y0 + (y1 - y0) * 0.5 + 760, 'EQUIP-DETAIL');
      a.log('Added the cab, boxed operations compartment with side door and steps, awning frame, roof air conditioner, whip antenna masts and cable tray (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic wheeled personnel transport bus',
    desc: (v) => `Wheeled personnel transport, ${v.seats} seats, ${v.len} in long: a one-piece body with a window band down both sides, a front door and a rear door, a hood with grille and lamps, a roof rack with a ladder and ${v.ax} axles. Unarmed.`,
    vs: [['12 seat, 4x4, 215 in', 12, 215, 84, 100, 18, 2], ['24 seat, 4x4, 290 in', 24, 290, 92, 112, 20, 2], ['36 seat, 6x6, 380 in', 36, 380, 98, 120, 22, 3]].map(([l, seats, len, w, h, r, ax]) => [l, w, len, h, 0, { seats, len, r, ax }]),
    build: (a, v) => {
      const r = v.r * IN, L = a.D, W = a.W, ww = r * 0.6, cx = a.cx, zf = a.Z0 + r * 1.2, hw = W * 0.45, axles = v.ax === 2 ? [L * 0.17, L * 0.8] : [L * 0.15, L * 0.72, L * 0.88];
      frameRails(a, a.YF + 120, a.YB - 40, a.Z0 + r * 0.85, W * 0.28, 90, zf - a.Z0 - r * 0.85); wheelsAt(a, axles.map((y) => a.YF + y), r, ww, axles.map((_, i) => v.ax === 3 && i > 0));
      const bf = a.YF + L * 0.18; a.box(cx - hw * 0.9, a.YF + 40, zf + 40, cx + hw * 0.9, bf, zf + a.H * 0.36); frontEnd(a, a.YF, zf, zf + a.H * 0.36, hw * 0.9, 80);
      a.box(cx - hw, bf, zf + 40, cx + hw, a.YB - 30, a.Z1 - 260); a.frame(cx - hw * 0.84, zf + a.H * 0.36, cx + hw * 0.84, a.Z1 - 300, bf - 14, bf + 6, 26);
      const nw = m.max(3, m.round(v.seats / 4)), wl = (a.YB - 60 - bf - 600 - 300) / nw;
      for (const s of [-1, 1]) { for (let i = 0; i < nw; i++) a.box(cx + s * hw - 6 * s, bf + 300 + i * wl + 30, zf + a.H * 0.4, cx + s * hw + 8 * s, bf + 300 + (i + 1) * wl - 30, a.Z1 - 340); a.box(cx + s * hw - 4 * s, bf + 80, zf + 100, cx + s * hw + 12 * s, bf + 220, a.Z1 - 340); a.line(cx + s * hw, bf + 300, cx + s * hw, a.YB - 60, 'EQUIP-DETAIL'); }
      a.box(cx - hw * 0.8, a.YB - 20, zf + 100, cx + hw * 0.8, a.YB, a.Z1 - 340); a.box(cx - hw, bf + 20, a.Z1 - 260, cx + hw, a.YB - 30, a.Z1 - 230);
      a.tube([[cx - hw * 0.7, bf + 200, a.Z1 - 230], [cx - hw * 0.7, bf + 200, a.Z1 - 130], [cx + hw * 0.7, bf + 200, a.Z1 - 130], [cx + hw * 0.7, bf + 200, a.Z1 - 230]], Array(4).fill(12), 5);
      a.tube([[cx - hw * 0.7, a.YB - 200, a.Z1 - 230], [cx - hw * 0.7, a.YB - 200, a.Z1 - 130], [cx + hw * 0.7, a.YB - 200, a.Z1 - 130], [cx + hw * 0.7, a.YB - 200, a.Z1 - 230]], Array(4).fill(12), 5); a.box(cx - hw * 0.7, bf + 200, a.Z1 - 140, cx + hw * 0.7, a.YB - 200, a.Z1 - 124);
      a.rect(cx - hw, a.YF, cx + hw, a.YB, 'EQUIP'); a.line(cx - hw, bf, cx + hw, bf, 'EQUIP-DETAIL'); a.rect(cx - hw * 0.7, bf + 200, cx + hw * 0.7, a.YB - 200, 'EQUIP-DETAIL');
      a.log('Added the ladder frame, wheels, hood with grille, one-piece body with window band, front and rear doors and the roof rack (plan and 3D).');
    } }),

  fam({ cat: 'military/vehicles', title: 'Generic light cargo trailer, field',
    desc: (v) => `${v.cap} class cargo trailer, ${v.len} in long: an A-frame drawbar with a lunette eye and a jockey wheel, a drop-side tub body with a tailgate, mudguards, ${v.axles === 2 ? 'a tandem axle' : 'a single axle'} and rear lamps${v.cover ? ', under a canvas cover on bows' : ''}.`,
    vs: [['1 ton, 130 in', '1 ton', 130, 62, 38, 1, false], ['1.5 ton, covered, 156 in', '1.5 ton', 156, 74, 74, 1, true], ['3 ton, tandem, 210 in', '3 ton', 210, 90, 56, 2, false], ['5 ton, tandem, covered, 260 in', '5 ton', 260, 96, 104, 2, true]].map(([l, cap, len, w, h, axles, cover]) => [l, w, len, h, 0, { cap, len, axles, cover }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, r = (v.axles === 2 ? 14 : 13) * IN, ww = r * 0.55, bz = a.Z0 + r * 1.35, bx0 = a.YF + L * 0.3, hw = W * 0.4, wz = a.Z0 + r;
      const ys = v.axles === 2 ? [a.YB - L * 0.3, a.YB - L * 0.14] : [a.YB - L * 0.22];
      wheelsAt(a, ys, r, ww); for (const y of ys) a.xcyl(cx - W * 0.4, cx + W * 0.4, y, wz, 30, 8);
      for (const s of [-1, 1]) a.box(cx + s * W * 0.2 - 40, bx0, bz - 150, cx + s * W * 0.2 + 40, a.YB - 40, bz); a.box(cx - hw, bx0, bz, cx + hw, a.YB - 20, bz + 50);
      const sh = v.cover ? 520 : 600;
      for (const s of [-1, 1]) { a.box(cx + s * hw - 18, bx0, bz + 50, cx + s * hw + 18, a.YB - 20, bz + sh); for (const y of [bx0 + (a.YB - bx0) * 0.25, bx0 + (a.YB - bx0) * 0.55, bx0 + (a.YB - bx0) * 0.85]) a.box(cx + s * hw - 24, y - 8, bz + 50, cx + s * hw + 24, y + 8, bz + sh); }
      a.box(cx - hw, bx0, bz + 50, cx + hw, bx0 + 34, bz + sh); a.box(cx - hw, a.YB - 34, bz + 50, cx + hw, a.YB - 20, bz + sh);
      for (const y of ys) for (const s of [-1, 1]) a.box(cx + s * (W / 2 - ww / 2 - 6) - ww * 0.6, y - r * 1.15, a.Z0 + r * 1.85, cx + s * (W / 2 - ww / 2 - 6) + ww * 0.6, y + r * 1.15, a.Z0 + r * 1.95);
      a.prism([[cx - 40, a.YF + 120], [cx + 40, a.YF + 120], [cx + W * 0.2 + 40, bx0], [cx - W * 0.2 - 40, bx0]], bz - 120, bz - 60); a.tube([[cx, a.YF + 60, bz - 90], [cx, a.YF + 140, bz - 90]], [28, 28], 6); a.xcyl(cx - 25, cx + 25, a.YF + 20, bz - 90, 55, 14);
      a.cyl(cx + 130, a.YF + 300, a.Z0 + 80, bz - 100, 20, 8); a.xcyl(cx + 110, cx + 150, a.YF + 300, a.Z0 + 80, 80, 12);
      for (const s of [-1, 1]) a.box(cx + s * hw - 40, a.YB - 20, bz + 120, cx + s * hw + 40, a.YB, bz + 220);
      if (v.cover) canvasCover(a, bx0 + 40, a.YB - 30, hw * 0.98, bz + sh, a.Z1, 4);
      a.rect(cx - hw, bx0, cx + hw, a.YB - 20, 'EQUIP'); a.line(cx - W * 0.2, a.YF + 120, cx - W * 0.2 - 40, bx0, 'EQUIP-DETAIL'); a.line(cx + W * 0.2, a.YF + 120, cx + W * 0.2 + 40, bx0, 'EQUIP-DETAIL'); a.circ(cx, a.YF + 20, 55, 'EQUIP-DETAIL');
      a.log('Added the A-frame drawbar with lunette eye and jockey wheel, tub body with drop sides and tailgate, mudguards, axle and wheels' + (v.cover ? ', canvas cover on bows' : '') + ' (plan and 3D).');
    } }),

  // ===================================================== shelters =====================================================
  fam({ cat: 'military/shelters', title: 'Generic frame tent, field',
    desc: (v) => `Gable frame tent, ${v.tw} by ${v.tl} ft: a fabric roof and walls on a ridge pole and end poles, a door opening in the front gable with two tied flaps, ${v.win} side windows with flaps, an eave line, eight guy ropes to pegs and a ground sheet edge.`,
    vs: [['12 x 12 ft', 12, 12, 2], ['16 x 16 ft', 16, 16, 2], ['16 x 32 ft', 16, 32, 4], ['20 x 40 ft', 20, 40, 6], ['32 x 60 ft', 32, 60, 8]].map(([l, tw, tl, win]) => [l, tw * 12 + 120, tl * 12 + 120, (4.5 + tw * 0.17 + tw * 0.2) * 12, 0, { tw, tl, win }]),
    build: (a, v) => {
      const tw = v.tw * FT, tl = v.tl * FT, wh = (4.5 + v.tw * 0.17) * FT, rh = wh + v.tw * 0.2 * FT, cx = a.cx, yf = a.cy - tl / 2, yb = a.cy + tl / 2, hw = tw / 2;
      a.box(cx - hw - 20, yf - 20, a.Z0, cx + hw + 20, yb + 20, a.Z0 + 14);
      prismY(a, [[cx - hw, a.Z0 + 14], [cx + hw, a.Z0 + 14], [cx + hw, wh], [cx, rh], [cx - hw, wh]], yf, yb);
      a.tube([[cx, yf - 30, rh + 30], [cx, yb + 30, rh + 30]], [30, 30], 6);
      for (const y of [yf - 25, yb + 25]) a.tube([[cx, y, a.Z0], [cx, y, rh + 30]], [28, 28], 6);
      for (const y of [yf + tl * 0.33, yf + tl * 0.66]) if (v.tl > 20) a.tube([[cx, y, a.Z0 + 14], [cx, y, rh]], [26, 26], 6);
      a.box(cx - hw * 0.3, yf - 22, a.Z0 + 14, cx + hw * 0.3, yf, wh + (rh - wh) * 0.25); for (const s of [-1, 1]) prismY(a, [[cx + s * hw * 0.3, a.Z0 + 14], [cx + s * hw * 0.3 + s * hw * 0.2, a.Z0 + 14], [cx + s * hw * 0.3, wh + (rh - wh) * 0.25]].slice(0, 3).map((q, i) => q), yf - 38, yf - 22);
      for (let i = 0; i < v.win; i++) { const y = yf + tl * (0.16 + (0.7 * (i >> 1)) / m.max(1, v.win / 2 - 1)); for (const s of [-1, 1]) a.box(cx + s * hw - (s > 0 ? 0 : 0) - 12, y - 160, a.Z0 + wh * 0.45, cx + s * hw + 12, y + 160, a.Z0 + wh * 0.8); }
      a.tube([[cx - hw, yf, wh], [cx - hw, yb, wh]], [14, 14], 5); a.tube([[cx + hw, yf, wh], [cx + hw, yb, wh]], [14, 14], 5);
      const rope = [[-1, yf], [1, yf], [-1, yb], [1, yb]], R2 = 55 * 25.4;
      for (const [s, y] of rope) { const sy = y === yf ? -1 : 1; for (const k of [0, 1]) { const px = cx + s * (hw + R2 * 0.8), py = y + sy * (k ? R2 * 0.9 : R2 * 0.2) + (k ? 0 : 0); a.tube([[cx + s * hw, y, wh], [px, py, a.Z0 + 20]], [4, 4], 4); a.cyl(px, py, a.Z0, a.Z0 + 150, 12, 6); } }
      a.rect(cx - hw, yf, cx + hw, yb, 'EQUIP'); a.line(cx, yf, cx, yb, 'EQUIP-DETAIL'); a.rect(cx - hw * 0.3, yf - 22, cx + hw * 0.3, yf, 'EQUIP-DETAIL'); for (const [s, y] of rope) { const sy = y === yf ? -1 : 1; for (const k of [0, 1]) a.line(cx + s * hw, y, cx + s * (hw + R2 * 0.8), y + sy * (k ? R2 * 0.9 : R2 * 0.2), 'EQUIP-HIDDEN'); }
      a.log('Added the gable roof and walls on ridge and end poles, front door with flaps, side windows, eave line, guy ropes and pegs (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic arched barracks hut',
    desc: (v) => `Arched corrugated barracks hut, ${v.w} by ${v.l} ft: a half-round shell with stiffening ribs every few feet on a low plinth, a door and a window in each gable end, ${v.win} windows per side, a stove flue through the roof and entrance steps.`,
    vs: [['16 x 30 ft', 16, 30, 3], ['16 x 36 ft', 16, 36, 4], ['24 x 48 ft', 24, 48, 6], ['24 x 60 ft', 24, 60, 8]].map(([l, w, len, win]) => [l, w * 12 + 60, len * 12 + 60, w * 12 / 2 + 36, 0, { w, len, win }]),
    build: (a, v) => {
      const hw = v.w * FT / 2, cx = a.cx, yf = a.YF + 400, yb = a.YB - 120, pl = 300, arc = (r, z0) => Array.from({ length: 17 }, (_, i) => [cx + m.cos(PI - (i / 16) * PI) * r, z0 + m.sin((i / 16) * PI) * r * 0.97]);
      a.box(cx - hw - 20, yf - 20, a.Z0, cx + hw + 20, yb + 20, a.Z0 + pl);
      prismY(a, arc(hw, a.Z0 + pl), yf, yb);
      const n = m.round(v.len / 3); for (let i = 0; i <= n; i++) { const y = yf + ((yb - yf - 90) * i) / n; prismY(a, arc(hw + 26, a.Z0 + pl - 8), y, y + 90); }
      for (const q of [0, 1]) { const y = q ? yb : yf; const yy = q ? yb + 16 : yf - 16; a.box(cx - hw * 0.62, yy - 4, a.Z0 + pl, cx - hw * 0.12, yy + 4, a.Z0 + pl + hw * 0.7); a.box(cx + hw * 0.2, yy - 4, a.Z0 + pl + hw * 0.34, cx + hw * 0.58, yy + 4, a.Z0 + pl + hw * 0.64); }
      a.box(cx - hw * 0.62, yf - 150, a.Z0, cx - hw * 0.12, yf - 20, a.Z0 + 160); a.box(cx - hw * 0.62, yf - 300, a.Z0, cx - hw * 0.12, yf - 150, a.Z0 + 80);
      for (let i = 0; i < v.win; i++) { const y = yf + (yb - yf) * ((i + 0.6) / (v.win + 0.2)); for (const s of [-1, 1]) a.box(cx + s * hw * 0.93 - 10, y - 380, a.Z0 + pl + hw * 0.16, cx + s * hw * 0.93 + 10, y + 380, a.Z0 + pl + hw * 0.42); }
      a.cyl(cx + hw * 0.2, yf + (yb - yf) * 0.3, a.Z0 + pl + hw * 0.9, a.Z1 - 20, 90, 10); a.cyl(cx + hw * 0.2, yf + (yb - yf) * 0.3, a.Z1 - 100, a.Z1, 130, 10);
      a.rect(cx - hw - 20, yf - 20, cx + hw + 20, yb + 20, 'EQUIP'); a.rect(cx - hw, yf, cx + hw, yb, 'EQUIP-DETAIL'); for (let i = 1; i < n; i++) a.line(cx - hw, yf + ((yb - yf) * i) / n, cx + hw, yf + ((yb - yf) * i) / n, 'EQUIP-DETAIL'); a.circ(cx + hw * 0.2, yf + (yb - yf) * 0.3, 90, 'EQUIP-DETAIL'); a.rect(cx - hw * 0.62, yf - 300, cx - hw * 0.12, yf - 20, 'EQUIP-DETAIL');
      a.log('Added the half-round shell on a plinth with stiffening ribs, gable doors and windows, side windows, stove flue and entrance steps (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic hardened aircraft shelter',
    desc: (v) => `Arched concrete aircraft shelter, ${v.sp} ft span and ${v.len} ft long: a thick elliptical arch with a heavy portal ring at the front, two sliding door leaves on a floor track drawn part open, a sloped earth berm along each side, roof vent stacks and an apron slab. Plain structure.`,
    vs: [['60 ft span', 60, 90, 22], ['80 ft span', 80, 120, 28], ['100 ft span', 100, 140, 32]].map(([l, sp, len, h]) => [l, sp * 12 + sp * 12 * 0.9, len * 12 + 600 / 25.4, h * 12 + 18, 0, { sp, len, h }]),
    build: (a, v) => {
      const hw = v.sp * FT / 2, bh = v.h * FT, cx = a.cx, yf = a.YF + 180 * FT / 12, yb = a.YB, ell = (rx, rz, z0, n = 20) => Array.from({ length: n + 1 }, (_, i) => [cx + m.cos(PI - (i / n) * PI) * rx, z0 + m.sin((i / n) * PI) * rz]);
      a.box(a.X0, a.YF, a.Z0, a.X1, a.YB, a.Z0 + 120);
      prismY(a, ell(hw, bh, a.Z0 + 120), yf, yb);
      prismY(a, ell(hw * 1.06, bh * 1.05, a.Z0 + 120), yf - 24 * 25.4 / 2, yf + 24 * 25.4 / 2); prismY(a, ell(hw * 1.04, bh * 1.03, a.Z0 + 120), yf + 600, yf + 1100);
      for (const s of [-1, 1]) { prismY(a, [[cx + s * hw * 0.96, a.Z0 + 120], [cx + s * hw * 1.9, a.Z0 + 120], [cx + s * hw * 0.99, a.Z0 + 120 + bh * 0.6]].map((q) => q).slice(0, 3), yf + 1100, yb); }
      const dw = hw * 0.92, dh = bh * 0.92; a.box(cx - dw, yf - 20, a.Z0 + 120, cx + dw, yf, a.Z0 + 140); a.box(cx - dw * 0.96, yf - 50, a.Z0 + 120, cx - dw * 0.04, yf - 16, a.Z0 + 120 + dh * 0.82); for (let i = 1; i < 8; i++) a.box(cx - dw * 0.96 + (dw * 0.92 * i) / 8, yf - 70, a.Z0 + 120, cx - dw * 0.96 + (dw * 0.92 * i) / 8 + 40, yf - 50, a.Z0 + 120 + dh * 0.82);
      a.box(cx + dw * 0.52, yf - 50, a.Z0 + 120, cx + dw * 0.96, yf - 16, a.Z0 + 120 + dh * 0.82); a.box(cx - dw, yf - 120, a.Z0 + 120, cx + dw, yf - 90, a.Z0 + 120 + dh * 0.0 + 60);
      for (let i = 0; i < 3; i++) a.cyl(cx + (i - 1) * hw * 0.4, yf + (yb - yf) * 0.5, a.Z0 + 120 + bh * 0.96, a.Z1 - 20, 220, 10);
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP-HIDDEN'); a.rect(cx - hw, yf, cx + hw, yb, 'EQUIP'); a.rect(cx - dw, yf - 50, cx - dw * 0.04, yf - 16, 'EQUIP-DETAIL'); a.rect(cx + dw * 0.52, yf - 50, cx + dw * 0.96, yf - 16, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.line(cx + s * hw, yf + 1100, cx + s * hw * 1.9, yf + 1100, 'EQUIP-DETAIL');
      a.log('Added the apron slab, thick arch with portal ring and stiffening ring, sliding door leaves on a floor track, side berms and roof vents (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic maintenance hangar, gabled',
    desc: (v) => `Gabled maintenance hangar, ${v.w} ft wide and ${v.l} ft long: portal frames at every bay, clad walls and roof with a ridge vent, a wide sliding door in two leaves on a top track at the front, a personnel door and a side office block with a window and a door.`,
    vs: [['60 x 80 ft', 60, 80, 22], ['90 x 120 ft', 90, 120, 28], ['120 x 160 ft', 120, 160, 34]].map(([l, w, len, h]) => [l, w * 12 + 8 * 12, len * 12, h * 12, 0, { w, len, h }]),
    build: (a, v) => {
      const hw = v.w * FT / 2, cx = a.cx - 8 * 12 * 25.4 / 2 + 0, eh = a.H * 0.72, yf = a.YF, yb = a.YB, ox = cx + hw;
      prismY(a, [[cx - hw, a.Z0], [cx + hw, a.Z0], [cx + hw, a.Z0 + eh], [cx, a.Z1], [cx - hw, a.Z0 + eh]], yf + 60, yb);
      const bays = m.round(v.l / 20); for (let i = 0; i <= bays; i++) { const y = yf + 60 + ((yb - yf - 60 - 160) * i) / bays; prismY(a, [[cx - hw - 40, a.Z0], [cx + hw + 40, a.Z0], [cx + hw + 40, a.Z0 + eh], [cx, a.Z1 + 40], [cx - hw - 40, a.Z0 + eh]], y, y + 160); }
      a.box(cx - 220, yb - 60, a.Z1 - 20, cx + 220, yb, a.Z1 + 0); a.box(cx - 150, yf + 200, a.Z1 - 10, cx + 150, yb - 200, a.Z1);
      const dh = a.H * 0.62, dw = hw * 0.92; a.box(cx - dw, yf, a.Z0 + dh, cx + dw, yf + 60, a.Z0 + dh + 100); for (const q of [0, 1]) { const x0 = q ? cx : cx - dw * 0.98, x1 = q ? cx + dw * 0.98 : cx; a.box(x0, yf - 60, a.Z0, x1, yf, a.Z0 + dh); for (let i = 1; i < 6; i++) a.box(x0 + ((x1 - x0) * i) / 6, yf - 90, a.Z0, x0 + ((x1 - x0) * i) / 6 + 40, yf - 60, a.Z0 + dh); a.box(x0 + 20, yf - 90, a.Z0 + dh * 0.5 - 20, x1 - 20, yf - 60, a.Z0 + dh * 0.5 + 20); }
      a.box(cx + dw * 1.02, yf - 30, a.Z0, cx + dw * 1.02 + 900, yf, a.Z0 + 2100);
      a.box(ox, yf + (yb - yf) * 0.3, a.Z0, a.X1, yf + (yb - yf) * 0.3 + 12 * 304.8, a.Z0 + 3300); a.box(a.X1 - 60, yf + (yb - yf) * 0.3 + 800, a.Z0 + 800, a.X1, yf + (yb - yf) * 0.3 + 1800, a.Z0 + 2000); a.box(a.X1 - 60, yf + (yb - yf) * 0.3 + 2400, a.Z0, a.X1, yf + (yb - yf) * 0.3 + 3300, a.Z0 + 2100);
      a.rect(cx - hw, yf + 60, cx + hw, yb, 'EQUIP'); a.rect(ox, yf + (yb - yf) * 0.3, a.X1, yf + (yb - yf) * 0.3 + 12 * 304.8, 'EQUIP'); a.line(cx, yf + 60, cx, yf - 60, 'EQUIP-DETAIL'); for (let i = 1; i < bays; i++) a.line(cx - hw, yf + 60 + ((yb - yf - 220) * i) / bays, cx + hw, yf + 60 + ((yb - yf - 220) * i) / bays, 'EQUIP-DETAIL'); a.rect(cx - dw, yf - 90, cx, yf - 60, 'EQUIP-DETAIL');
      a.log('Added the clad gabled shell with portal frames, ridge vent, two-leaf sliding front door on a top track, personnel door and the side office block (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic elevated watch tower',
    desc: (v) => `Watch tower, ${v.hft} ft to the platform: four slanted tube legs with cross bracing in each bay, a ladder with a safety cage, a landing${v.hft > 20 ? ' at mid height' : ''}, a platform with a guard rail, a glazed lookout room with a window band, a gable roof and a swivel floodlight on a post. Unarmed lookout.`,
    vs: [['12 ft', 12], ['20 ft', 20], ['30 ft', 30], ['40 ft', 40]].map(([l, hft]) => [l, 120 + hft * 1.8, 120 + hft * 1.8, hft * 12 + 100, 0, { hft }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, bw = a.W * 0.84 / 2, tw = bw * 0.62, pz = a.Z0 + v.hft * FT, t = 55, cab = tw + 120, ch = 7.2 * FT;
      const legs = [[-1, -1], [1, -1], [-1, 1], [1, 1]]; for (const [sx, sy] of legs) a.tube([[cx + sx * bw, cy + sy * bw, a.Z0], [cx + sx * tw, cy + sy * tw, pz]], [t, t * 0.9], 6);
      const bays = m.max(2, m.round(v.hft / 8)); for (let k = 0; k < bays; k++) { const f0 = k / bays, f1 = (k + 1) / bays, r0 = bw + (tw - bw) * f0, r1 = bw + (tw - bw) * f1, z0 = a.Z0 + (pz - a.Z0) * f0, z1 = a.Z0 + (pz - a.Z0) * f1;
        for (const sy of [-1, 1]) { a.tube([[cx - r0, cy + sy * r0, z0], [cx + r1, cy + sy * r1, z1]], [16, 16], 4); a.tube([[cx + r0, cy + sy * r0, z0], [cx - r1, cy + sy * r1, z1]], [16, 16], 4); a.box(cx - r1, cy + sy * r1 - 20, z1 - 20, cx + r1, cy + sy * r1 + 20, z1 + 20); }
        for (const sx of [-1, 1]) { a.tube([[cx + sx * r0, cy - r0, z0], [cx + sx * r1, cy + r1, z1]], [16, 16], 4); a.tube([[cx + sx * r0, cy + r0, z0], [cx + sx * r1, cy - r1, z1]], [16, 16], 4); a.box(cx + sx * r1 - 20, cy - r1, z1 - 20, cx + sx * r1 + 20, cy + r1, z1 + 20); } }
      a.box(cx - tw - 180, cy - tw - 180, pz, cx + tw + 180, cy + tw + 180, pz + 60);
      if (v.hft > 20) { a.box(cx - 450, cy + tw + 200, a.Z0 + (pz - a.Z0) * 0.5 - 30, cx + 450, cy + tw + 1000, a.Z0 + (pz - a.Z0) * 0.5); }
      const lx = cx + tw * 0.3, ly0 = cy + bw + 20, ly1 = cy + tw + 200; for (const s of [-1, 1]) a.tube([[lx + s * 200, ly0 + 60, a.Z0], [lx + s * 200, ly1, pz]], [15, 15], 5); for (let i = 0; i <= m.round(v.hft / 1.2); i++) { const f = i / m.round(v.hft / 1.2); a.box(lx - 200, ly0 + 60 + (ly1 - ly0 - 60) * f - 8, a.Z0 + (pz - a.Z0) * f - 8, lx + 200, ly0 + 60 + (ly1 - ly0 - 60) * f + 8, a.Z0 + (pz - a.Z0) * f + 8); }
      const ccx = cx, cr = tw + 120; a.box(ccx - cab, cy - cab, pz + 60, ccx + cab, cy + cab, pz + 60 + 1000); a.frame(ccx - cab, pz + 60 + 1000, ccx + cab, pz + 60 + ch - 300, cy - cab - 10, cy - cab + 14, 40); for (const s of [-1, 1]) { a.frame(ccx + s * cab - 8, pz + 60 + 1000, ccx + s * cab + 8, pz + 60 + ch - 300, cy - cab, cy + cab, 36); }
      a.box(ccx - cab, cy - cab, pz + 60 + ch - 300, ccx + cab, cy + cab, pz + 60 + ch - 250);
      prismY(a, [[ccx - cab * 1.25, pz + 60 + ch - 250], [ccx + cab * 1.25, pz + 60 + ch - 250], [ccx, a.Z1 - 20]], cy - cab * 1.25, cy + cab * 1.25);
      rail(a, cx - tw - 160, cy - tw - 160, cx + tw + 160, cy - tw - 160, pz + 60, pz + 1100, 14, 6); rail(a, cx - tw - 160, cy + tw + 160, cx + tw + 160, cy + tw + 160, pz + 60, pz + 1100, 14, 6);
      a.cyl(cx + tw + 100, cy - tw - 100, pz + 60, pz + 600, 25, 8); a.ell(cx + tw + 100, cy - tw - 100, pz + 700, 90, 120, 90, 10, 6);
      a.rect(cx - bw, cy - bw, cx + bw, cy + bw, 'EQUIP'); a.rect(cx - tw - 180, cy - tw - 180, cx + tw + 180, cy + tw + 180, 'EQUIP-DETAIL'); a.rect(ccx - cab, cy - cab, ccx + cab, cy + cab, 'EQUIP-DETAIL'); a.line(cx - bw, cy - bw, cx + bw, cy + bw, 'EQUIP-DETAIL'); a.line(cx + bw, cy - bw, cx - bw, cy + bw, 'EQUIP-DETAIL');
      a.log('Added the slanted legs with cross bracing, caged ladder, landing, platform with guard rail, glazed cabin, gable roof and floodlight post (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic vehicle checkpoint',
    desc: (v) => `Vehicle checkpoint with ${v.lanes} lane${v.lanes > 1 ? 's' : ''}: a guard booth with a window band, a door and a roof overhang, ${v.lanes} barrier arm${v.lanes > 1 ? 's' : ''} with striped segments on a post, bollards, speed humps${v.canopy ? ', a steel inspection canopy on four columns over the lanes' : ''} and a sign post.`,
    vs: [['single lane', 1, false, 22, 40], ['two lanes', 2, false, 36, 40], ['two lanes with canopy', 2, true, 40, 56]].map(([l, lanes, canopy, w, d]) => [l, w * 12, d * 12, canopy ? 20 * 12 : 12 * 12, 0, { lanes, canopy }]),
    build: (a, v) => {
      const lw = 12 * FT, bx = a.X0 + 40, cx = a.cx;
      a.box(a.X0, a.YF, a.Z0, a.X1, a.YB, a.Z0 + 20);
      const bw = 7 * FT, bd = 10 * FT, bz = a.Z0 + 20, bh = 8.5 * FT, bxx = a.X0 + 300, byy = a.cy - bd / 2;
      a.box(bxx, byy, bz, bxx + bw, byy + bd, bz + bh); a.box(bxx - 400, byy - 400, bz + bh, bxx + bw + 400, byy + bd + 400, bz + bh + 120);
      for (const s of [0, 1]) { a.frame(bxx + 250 + s * 0, bz + 1000, bxx + bw - 250, bz + bh - 400, byy - 12 + s * (bd + 12), byy + 12 + s * (bd - 12 + 0), 40); }
      a.frame(bxx + bw - 12, bz + 1000, bxx + bw + 12, bz + bh - 400, byy + 500, byy + bd - 500, 40); a.box(bxx - 12, byy + bd * 0.3, bz, bxx + 12, byy + bd * 0.3 + 900, bz + 2100); a.box(bxx + bw * 0.3, byy + bd, bz, bxx + bw * 0.3 + 900, byy + bd + 250, bz + 200);
      a.cyl(bxx + bw / 2, byy + bd / 2, bz + bh + 120, bz + bh + 300, 60, 8); a.ell(bxx + bw / 2, byy + bd / 2, bz + bh + 380, 100, 100, 90, 8, 5);
      for (let i = 0; i < v.lanes; i++) {
        const lx = bxx + bw + 900 + i * (lw + 300), ly = a.cy; a.box(lx, ly - 5 * FT, bz, lx + lw, ly + 5 * FT, bz + 1); a.line(lx, a.YF + 100, lx, a.YB - 100, 'EQUIP-DETAIL');
        a.box(lx - 400, ly - 2.2 * FT, bz, lx - 100, ly - 1.6 * FT, bz + 1100); a.box(lx - 450, ly - 2.3 * FT, bz, lx - 50, ly - 1.5 * FT, bz + 250);
        const al = lw + 300; for (let k = 0; k < 6; k++) a.box(lx - 100 + (al * k) / 6, ly - 2.2 * FT - 50, bz + 950, lx - 100 + (al * (k + 1)) / 6, ly - 2.2 * FT + 50, bz + 1050 + 0), 0;
        for (let k = 0; k < 6; k++) a.box(lx - 100 + (al * k) / 6, ly - 2.2 * FT - 50 - 0, bz + 1000, lx - 100 + (al * (k + 0.5)) / 6, ly - 2.2 * FT - 50 + 0 + 100, bz + 1100);
        for (const dy of [-1, 1]) a.box(lx + lw * 0.25, ly + dy * 3.2 * FT - 150, bz, lx + lw * 0.75, ly + dy * 3.2 * FT + 150, bz + 120);
        for (const k of [0, 1, 2]) a.cyl(lx + lw * (0.2 + 0.3 * k), ly + 5 * FT - 200, bz, bz + 900, 90, 10);
        a.rect(lx, ly - 5 * FT, lx + lw, ly + 5 * FT, 'EQUIP-DETAIL'); a.rect(lx - 100, ly - 2.2 * FT - 50, lx - 100 + al, ly - 2.2 * FT + 50, 'EQUIP-DETAIL');
        a.line(lx + lw * 0.2, ly - 5 * FT, lx + lw * 0.2, ly + 5 * FT, 'EQUIP-DETAIL'); a.line(lx + lw * 0.8, ly - 5 * FT, lx + lw * 0.8, ly + 5 * FT, 'EQUIP-DETAIL');
      }
      if (v.canopy) { const cx0 = bxx + bw + 700, cx1 = a.X1 - 300, cy0 = a.cy - 5.6 * FT, cy1 = a.cy + 5.6 * FT, ch = 16 * FT; for (const [x, y] of [[cx0, cy0], [cx1, cy0], [cx0, cy1], [cx1, cy1]]) a.tube([[x, y, bz], [x, y, bz + ch]], [90, 90], 8); a.box(cx0 - 300, cy0 - 300, bz + ch, cx1 + 300, cy1 + 300, bz + ch + 220); a.box(cx0 - 300, cy0 - 300, bz + ch + 220, cx1 + 300, cy0 - 250, bz + ch + 400); a.box(cx0 - 300, cy1 + 250, bz + ch + 220, cx1 + 300, cy1 + 300, bz + ch + 400); a.rect(cx0 - 300, cy0 - 300, cx1 + 300, cy1 + 300, 'EQUIP'); for (const [x, y] of [[cx0, cy0], [cx1, cy0], [cx0, cy1], [cx1, cy1]]) a.circ(x, y, 90, 'EQUIP-DETAIL'); }
      a.rect(bxx, byy, bxx + bw, byy + bd, 'EQUIP'); a.rect(bxx - 400, byy - 400, bxx + bw + 400, byy + bd + 400, 'EQUIP-HIDDEN'); a.arc(bxx, byy + bd * 0.3, 900, 270, 360); a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP-HIDDEN');
      a.log('Added the guard booth with windows, door and roof overhang, barrier arms with striped segments, bollards, speed humps' + (v.canopy ? ', inspection canopy on columns' : '') + ' and a sign post (plan and 3D).');
    } }),

  fam({ cat: 'military/shelters', title: 'Generic earth-covered storage bunker',
    desc: (v) => `Earth-covered storage bunker, ${v.w} by ${v.l} ft: a concrete box with a sloped earth mound over the roof, a front facade with a heavy double door and a step, two angled wing walls, ${v.vents} vent pipes through the mound and a drainage swale along the front. Plain storage structure.`,
    vs: [['small, 20 x 30 ft', 20, 30, 1], ['medium, 30 x 50 ft', 30, 50, 2], ['large, 40 x 80 ft', 40, 80, 3]].map(([l, w, len, vents]) => [l, w * 12 + 20 * 12, len * 12 + 6 * 12, (w < 25 ? 12 : w < 35 ? 14 : 16) * 12, 0, { w, len, vents }]),
    build: (a, v) => {
      const hw = v.w * FT / 2, cx = a.cx, yf = a.YF + 6 * FT, yb = a.YB, wh = a.H * 0.62, mh = a.H;
      a.box(a.X0, a.YF, a.Z0, a.X1, a.YB, a.Z0 + 100);
      a.box(cx - hw, yf, a.Z0 + 100, cx + hw, yb, a.Z0 + 100 + wh);
      prismY(a, [[cx - hw * 1.25, a.Z0 + 100], [cx + hw * 1.25, a.Z0 + 100], [cx + hw * 1.0, a.Z0 + 100 + wh], [cx - hw * 1.0, a.Z0 + 100 + wh]].slice(0, 4), yf + 300, yb);
      prismY(a, [[cx - hw * 1.25, a.Z0 + 100], [cx + hw * 1.25, a.Z0 + 100], [cx + hw * 0.55, a.Z1 - 120], [cx - hw * 0.55, a.Z1 - 120]], yf + 700, yb);
      for (const s of [-1, 1]) prismX(a, [[yf - 5 * FT, a.Z0 + 100], [yf, a.Z0 + 100], [yf, a.Z0 + 100 + wh * 0.9]], cx + s * hw - 120 + (s > 0 ? 0 : 0) - (s > 0 ? 0 : -0), cx + s * hw + 120);
      for (const s of [-1, 1]) { const x = cx + s * (hw + 1.2 * FT); prismY(a, [[cx + s * hw, a.Z0 + 100], [x, a.Z0 + 100], [cx + s * hw, a.Z0 + 100 + wh * 0.9]].map((q) => q), yf - 3 * FT, yf); }
      const dw = hw * 0.5; a.frame(cx - dw, a.Z0 + 100, cx + dw, a.Z0 + 100 + wh * 0.8, yf - 90, yf, 120); for (const q of [-1, 1]) { a.box(cx + (q > 0 ? 0 : -dw * 0.96), yf - 150, a.Z0 + 130, cx + (q > 0 ? dw * 0.96 : 0), yf - 90, a.Z0 + 100 + wh * 0.78); for (let i = 1; i < 4; i++) a.box(cx + (q > 0 ? 0 : -dw * 0.96) + (dw * 0.96 * i) / 4, yf - 190, a.Z0 + 150, cx + (q > 0 ? 0 : -dw * 0.96) + (dw * 0.96 * i) / 4 + 50, yf - 150, a.Z0 + 100 + wh * 0.75); }
      a.box(cx - dw * 0.8, yf - 500, a.Z0 + 100, cx + dw * 0.8, yf - 150, a.Z0 + 220);
      for (let i = 0; i < v.vents; i++) { const x = cx + (i - (v.vents - 1) / 2) * hw * 0.7, y = yf + (yb - yf) * 0.55; a.cyl(x, y, a.Z1 - 200, a.Z1 - 20 + 0, 120, 10); a.cyl(x, y, a.Z1 - 60, a.Z1, 200, 10); a.circ(x, y, 120, 'EQUIP-DETAIL'); }
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP-HIDDEN'); a.rect(cx - hw, yf, cx + hw, yb, 'EQUIP'); a.rect(cx - hw * 1.25, yf + 300, cx + hw * 1.25, yb, 'EQUIP-DETAIL'); a.rect(cx - hw * 0.55, yf + 700, cx + hw * 0.55, yb, 'EQUIP-DETAIL'); a.rect(cx - dw, yf - 190, cx + dw, yf, 'EQUIP-DETAIL');
      a.log('Added the concrete box, sloped earth mound, front facade with heavy double door and step, wing walls, vent pipes and drainage swale (plan and 3D).');
    } }),

  // ===================================================== field =====================================================
  fam({ cat: 'military/field', title: 'Generic towed field kitchen trailer',
    desc: (v) => `Towed field kitchen, ${v.len} in long on ${v.ax === 2 ? 'a tandem axle' : 'one axle'}: an insulated box body with a hinged side serving hatch on a prop, ${v.stacks} roof stack pipes, a roof vent hood, side lockers, a rear door with steps, a tow bar with eye, jockey wheel and levelling jacks.`,
    vs: [['small, 150 in', 150, 76, 96, 1, 2], ['medium, 220 in', 220, 84, 104, 2, 3], ['large, 290 in', 290, 90, 110, 2, 4]].map(([l, len, w, h, ax, stacks]) => [l, w, len, h, 0, { len, ax, stacks }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, r = 13 * IN, ww = r * 0.55, bz = a.Z0 + r * 1.4, bx0 = a.YF + L * 0.22, hw = W * 0.35, top = a.Z1 - 380, aw = W * 0.12, ys = v.ax === 2 ? [a.YB - L * 0.33, a.YB - L * 0.18] : [a.YB - L * 0.3];
      wheelsAt(a, ys, r, ww); for (const y of ys) a.xcyl(cx - W * 0.4, cx + W * 0.4, y, a.Z0 + r, 30, 8);
      for (const s of [-1, 1]) a.box(cx + s * W * 0.22 - 40, bx0, bz - 150, cx + s * W * 0.22 + 40, a.YB - 30, bz); a.box(cx - hw, bx0, bz, cx + hw, a.YB - 20, bz + 60);
      a.box(cx - hw, bx0, bz + 60, cx + hw, a.YB - 20, top); for (const y of ys) for (const s of [-1, 1]) a.box(cx + s * (W / 2 - ww / 2 - 6) - ww * 0.6, y - r * 1.15, a.Z0 + r * 1.85, cx + s * (W / 2 - ww / 2 - 6) + ww * 0.6, y + r * 1.15, a.Z0 + r * 1.95);
      prismX(a, [[a.YF + 40, bz - 100], [a.YF + 60, bz - 60], [bx0, bz - 60], [bx0, bz - 120]].slice(0, 4), cx - 40, cx + 40); a.tube([[cx, a.YF + 20, bz - 90], [cx, bx0, bz - 90]], [34, 34], 6); a.xcyl(cx - 26, cx + 26, a.YF + 20, bz - 90, 50, 14); a.cyl(cx, a.YF + 300, a.Z0 + 80, bz - 100, 20, 8); a.xcyl(cx - 40, cx + 40, a.YF + 300, a.Z0 + 80, 80, 12);
      for (const [x, y] of [[cx - hw, bx0 + 200], [cx + hw, bx0 + 200], [cx - hw, a.YB - 200], [cx + hw, a.YB - 200]]) { a.cyl(x, y, a.Z0 + 120, bz - 40, 22, 6); a.box(x - 80, y - 80, a.Z0 + 100, x + 80, y + 80, a.Z0 + 130); }
      const hz0 = bz + (top - bz) * 0.35, hz1 = bz + (top - bz) * 0.8, hy0 = bx0 + (a.YB - bx0) * 0.2, hy1 = bx0 + (a.YB - bx0) * 0.7;
      a.frame(cx + hw - 12, hz0, cx + hw + 12, hz1, hy0, hy1, 40); a.box(cx + hw, hy0, hz1, cx + hw + aw, hy1, hz1 + 30); a.tube([[cx + hw + aw, hy0, hz1], [cx + hw + aw * 0.9, hy0, hz0 - 100]], [10, 10], 4); a.tube([[cx + hw + aw, hy1, hz1], [cx + hw + aw * 0.9, hy1, hz0 - 100]], [10, 10], 4); a.box(cx + hw, hy0, hz0 - 40, cx + hw + aw * 0.6, hy1, hz0);
      a.box(cx - hw - 160, bx0 + 100, bz + 150, cx - hw, bx0 + 100 + (a.YB - bx0) * 0.3, bz + 150 + 650); a.box(cx - hw - 160, bx0 + 100 + (a.YB - bx0) * 0.4, bz + 150, cx - hw, bx0 + 100 + (a.YB - bx0) * 0.7, bz + 150 + 650);
      for (let i = 0; i < v.stacks; i++) { const y = bx0 + 300 + ((a.YB - bx0 - 800) * i) / m.max(1, v.stacks - 1); a.cyl(cx - hw * 0.4 + (i % 2) * hw * 0.5, y, top, a.Z1, 70, 10); a.cyl(cx - hw * 0.4 + (i % 2) * hw * 0.5, y, a.Z1 - 80, a.Z1, 110, 10); }
      a.box(cx - hw * 0.4, bx0 + (a.YB - bx0) * 0.6, top, cx + hw * 0.4, bx0 + (a.YB - bx0) * 0.9, top + 160);
      a.box(cx - hw * 0.5, a.YB - 14, bz + 150, cx + hw * 0.5, a.YB, top - 200); a.box(cx - hw * 0.5, a.YB, bz - 160, cx + hw * 0.5, a.YB + 0, bz); a.box(cx - hw * 0.4, a.YB - 220, bz - 200, cx + hw * 0.4, a.YB - 40, bz - 150);
      a.rect(cx - hw, bx0, cx + hw, a.YB - 20, 'EQUIP'); a.rect(cx + hw, hy0, cx + hw + aw, hy1, 'EQUIP-DETAIL'); a.rect(cx - hw - 160, bx0 + 100, cx - hw, bx0 + 100 + (a.YB - bx0) * 0.3, 'EQUIP-DETAIL'); a.line(cx - W * 0.22, a.YF + 60, cx - W * 0.22 - 0, bx0, 'EQUIP-DETAIL'); a.circ(cx, a.YF + 20, 50, 'EQUIP-DETAIL');
      a.log('Added the insulated body, hinged side serving hatch on a prop, roof stacks and vent hood, side lockers, rear door with steps, tow bar with jockey wheel and levelling jacks (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic field water pillow tank',
    desc: (v) => `Flexible water pillow tank, ${v.gal} gal, about ${v.l} by ${v.wd} in and ${v.ht} in high when full: a rounded fabric pillow with welded seams, a fill and outlet fitting with a valve and cap on the front end, a vent valve on top, a row of tie-down loops around the base and a ground sheet underneath.`,
    vs: [['500 gal', 500, 96, 60, 15], ['1,500 gal', 1500, 144, 96, 22], ['3,000 gal', 3000, 192, 120, 27], ['10,000 gal', 10000, 300, 180, 36]].map(([l, gal, len, wd, ht]) => [l, wd + 12, len + 12, ht + 14, 0, { gal, l: len, wd, ht }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, L = v.l * IN, Wd = v.wd * IN, H = v.ht * IN;
      a.box(a.X0, a.YF, a.Z0, a.X1, a.YB, a.Z0 + 6);
      a.ell(cx, cy, a.Z0 + 6 + H * 0.5, Wd / 2 - 20, L / 2 - 20, H * 0.5, 22, 12); a.ell(cx, cy, a.Z0 + 6 + H * 0.46, Wd / 2 - 6, L / 2 - 6, H * 0.42, 20, 10);
      for (const s of [-1, 1]) { const y0 = cy + s * L * 0.3; a.tube([[cx - Wd / 2 + 30, y0, a.Z0 + 20], [cx - Wd / 4, y0, a.Z0 + 6 + H * 0.9], [cx + Wd / 4, y0, a.Z0 + 6 + H * 0.9], [cx + Wd / 2 - 30, y0, a.Z0 + 20]], Array(4).fill(6), 5); }
      const fy = a.YF + 40; a.ycyl(fy, fy + 120, cx, a.Z0 + 6 + H * 0.3, 55, 12); a.ycyl(fy, fy + 30, cx, a.Z0 + 6 + H * 0.3, 80, 12); a.box(cx - 25, fy + 30, a.Z0 + 6 + H * 0.3 + 55, cx + 25, fy + 80, a.Z0 + 6 + H * 0.3 + 160); a.xcyl(cx - 90, cx + 90, fy + 55, a.Z0 + 6 + H * 0.3 + 160, 18, 8);
      a.cyl(cx, cy + L * 0.15, a.Z0 + 6 + H * 0.95, a.Z1, 40, 10); a.cyl(cx, cy + L * 0.15, a.Z1 - 14, a.Z1, 70, 10);
      for (let i = 0; i < 6; i++) { const y = cy - L * 0.4 + (L * 0.8 * i) / 5; for (const s of [-1, 1]) a.box(cx + s * (Wd / 2 - 10) - 20, y - 30, a.Z0 + 6, cx + s * (Wd / 2 - 10) + 20, y + 30, a.Z0 + 60); }
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP-HIDDEN'); a.ellp(cx, cy, Wd / 2 - 6, L / 2 - 6, 'EQUIP'); a.ellp(cx, cy, Wd / 2 - 70, L / 2 - 70, 'EQUIP-DETAIL'); a.circ(cx, fy + 60, 55, 'EQUIP-DETAIL'); a.circ(cx, cy + L * 0.15, 40, 'EQUIP-DETAIL');
      a.log('Added the welded pillow body, outlet fitting with valve and cap, top vent valve, base tie-down loops and the ground sheet (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic field fuel pillow tank with containment berm',
    desc: (v) => `Flexible fuel pillow tank, ${v.gal} gal, inside a lined containment berm ${v.bl} ft long: a rounded fabric pillow, a valve manifold with a grounding rod on the front, a vent, tie-down loops, a low liner wall all round and a ramp over the wall at one corner.`,
    vs: [['3,000 gal', 3000, 24, 16, 192, 120, 27], ['10,000 gal', 10000, 36, 24, 300, 180, 36], ['20,000 gal', 20000, 50, 32, 420, 220, 44]].map(([l, gal, bl, bw, len, wd, ht]) => [l, bw * 12, bl * 12, ht + 28, 0, { gal, bl, len, wd, ht }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, L = v.len * IN, Wd = v.wd * IN, H = v.ht * IN, wl = 14 * IN;
      a.box(a.X0, a.YF, a.Z0, a.X1, a.YB, a.Z0 + 20);
      for (const [x0, y0, x1, y1] of [[a.X0, a.YF, a.X1, a.YF + 140], [a.X0, a.YB - 140, a.X1, a.YB], [a.X0, a.YF, a.X0 + 140, a.YB], [a.X1 - 140, a.YF, a.X1, a.YB]]) a.box(x0, y0, a.Z0 + 20, x1, y1, a.Z0 + 20 + wl);
      prismX(a, [[a.YF - 0, a.Z0 + 20], [a.YF + 140 + 900, a.Z0 + 20], [a.YF + 140, a.Z0 + 20 + wl]].map((q) => q), a.X1 - 140 - 600, a.X1 - 140);
      a.ell(cx, cy, a.Z0 + 20 + H * 0.5, Wd / 2 - 20, L / 2 - 20, H * 0.5, 22, 12);
      for (const s of [-1, 1]) { const y0 = cy + s * L * 0.28; a.tube([[cx - Wd / 2 + 30, y0, a.Z0 + 40], [cx, y0, a.Z0 + 20 + H * 0.95], [cx + Wd / 2 - 30, y0, a.Z0 + 40]], Array(3).fill(6), 5); }
      const fy = cy - L / 2 + 20; a.ycyl(fy - 150, fy + 100, cx, a.Z0 + 20 + H * 0.3, 55, 12); a.box(cx - 150, fy - 200, a.Z0 + 20 + H * 0.3 - 200, cx + 150, fy - 150, a.Z0 + 20 + H * 0.3 + 120); for (const dx of [-80, 0, 80]) a.cyl(cx + dx, fy - 180, a.Z0 + 20 + H * 0.3 + 120, a.Z0 + 20 + H * 0.3 + 260, 25, 8);
      a.cyl(cx + Wd * 0.3, fy - 120, a.Z0 + 20, a.Z0 + 20 + 700, 10, 6); a.cyl(cx, cy + L * 0.2, a.Z0 + 20 + H * 0.95, a.Z1, 40, 10);
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP'); a.rect(a.X0 + 140, a.YF + 140, a.X1 - 140, a.YB - 140, 'EQUIP-DETAIL'); a.ellp(cx, cy, Wd / 2 - 20, L / 2 - 20, 'EQUIP'); a.circ(cx + Wd * 0.3, fy - 120, 10, 'EQUIP-DETAIL'); a.rect(cx - 150, fy - 200, cx + 150, fy - 150, 'EQUIP-DETAIL'); a.line(a.X1 - 740, a.YF + 140, a.X1 - 140, a.YF + 140, 'EQUIP-DETAIL');
      a.log('Added the liner floor and low containment walls with an access ramp, the pillow body, valve manifold on the front with a grounding rod, a vent and tie-down straps (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic towable generator set, canopy',
    desc: (v) => `Towable ${v.kva} kVA generator set in a sound canopy, ${v.len} in long: a louvred hinged side door, a control panel window, a cooling grille at one end, an exhaust stack, a lifting eye, a fuel filler, a drawbar with eye and a jockey wheel, two wheels, and four levelling jack feet.`,
    vs: [['10 kVA', 10, 96, 48, 54], ['30 kVA', 30, 126, 58, 66], ['60 kVA', 60, 168, 66, 76]].map(([l, kva, len, w, h]) => [l, w, len, h, 0, { kva, len }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, r = 9 * IN, ww = r * 0.5, bz = a.Z0 + r * 1.5, bx0 = a.YF + L * 0.24, hw = W * 0.44, ys = [a.YB - L * 0.28], top = a.Z1 - 260;
      wheelsAt(a, ys, r, ww); a.xcyl(cx - hw, cx + hw, ys[0], a.Z0 + r, 24, 8);
      a.box(cx - hw, bx0, bz - 80, cx + hw, a.YB - 20, bz); for (const s of [-1, 1]) a.box(cx + s * W * 0.25 - 35, bx0, bz - 180, cx + s * W * 0.25 + 35, a.YB - 30, bz - 80);
      a.box(cx - hw, bx0, bz, cx + hw, a.YB - 20, top); a.box(cx - hw - 6, bx0 - 4, top - 30, cx + hw + 6, a.YB - 16, top + 40);
      for (const s of [-1, 1]) { for (let i = 0; i < 8; i++) a.box(cx + s * hw - 4 * s, bx0 + (a.YB - bx0) * 0.08 + i * 40, bz + (top - bz) * 0.3, cx + s * hw + 12 * s, bx0 + (a.YB - bx0) * 0.08 + i * 40 + 18, bz + (top - bz) * 0.8); a.frame(cx + s * hw - 3, bz + (top - bz) * 0.25, cx + s * hw + 3 * s + 6, top - 60, bx0 + (a.YB - bx0) * 0.5, bx0 + (a.YB - bx0) * 0.92, 24); }
      a.frame(cx - hw * 0.8, bz + (top - bz) * 0.3, cx + hw * 0.8, top - 60, bx0 - 14, bx0 + 4, 26); for (let i = 0; i < 6; i++) a.box(cx - hw * 0.7, bx0 - 12, bz + (top - bz) * 0.35 + i * 36, cx + hw * 0.7, bx0 - 6, bz + (top - bz) * 0.35 + i * 36 + 14);
      a.cyl(cx + hw * 0.5, bx0 + (a.YB - bx0) * 0.25, top + 40, top + 420, 55, 10); a.cyl(cx + hw * 0.5, bx0 + (a.YB - bx0) * 0.25, top + 400, top + 440, 90, 10); a.cyl(cx - hw * 0.4, bx0 + (a.YB - bx0) * 0.6, top + 40, top + 100, 40, 8); eye(a, cx, bx0 + (a.YB - bx0) * 0.5, top + 60, 55);
      for (const [x, y] of [[cx - hw, bx0 + 100], [cx + hw, bx0 + 100], [cx - hw, a.YB - 100], [cx + hw, a.YB - 100]]) { a.cyl(x, y, a.Z0 + 60, bz - 80, 18, 6); a.box(x - 70, y - 70, a.Z0 + 40, x + 70, y + 70, a.Z0 + 70); }
      a.prism([[cx - 30, a.YF + 60], [cx + 30, a.YF + 60], [cx + W * 0.25 + 30, bx0], [cx - W * 0.25 - 30, bx0]], bz - 150, bz - 90); a.xcyl(cx - 24, cx + 24, a.YF + 25, bz - 120, 45, 12); a.cyl(cx, a.YF + 260, a.Z0 + 80, bz - 120, 18, 8); a.xcyl(cx - 35, cx + 35, a.YF + 260, a.Z0 + 80, 75, 10);
      a.rect(cx - hw, bx0, cx + hw, a.YB - 20, 'EQUIP'); a.rect(cx - hw, bx0, cx - hw + 100, a.YB - 20, 'EQUIP-DETAIL'); a.circ(cx + hw * 0.5, bx0 + (a.YB - bx0) * 0.25, 55, 'EQUIP-DETAIL'); a.line(cx - W * 0.25, a.YF + 60, cx - W * 0.25 - 30, bx0, 'EQUIP-DETAIL'); a.line(cx + W * 0.25, a.YF + 60, cx + W * 0.25 + 30, bx0, 'EQUIP-DETAIL');
      a.log('Added the sound canopy with louvred door, control window, cooling grille, exhaust stack, lifting eye, wheels, drawbar with jockey wheel and four jack feet (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic folding camp cot',
    desc: (v) => v.tiers === 2 ? `Two-tier camp bunk, ${v.len} in long: four corner posts, two side-rail frames with taut fabric beds, end rails, a ladder rung set at one end and cross braces.` : `Folding camp cot, ${v.len} in long and ${v.wd} in wide: two side rails, a taut fabric bed, two pairs of crossed folding legs with a cross bar, end spreaders and feet.`,
    vs: [['standard, 75 in', 75, 27, 17, 1], ['wide, 80 in', 80, 32, 18, 1], ['two-tier bunk, 80 in', 80, 32, 66, 2]].map(([l, len, wd, ht, tiers]) => [l, wd, len, ht, 0, { len, wd, tiers }]),
    build: (a, v) => {
      const cx = a.cx, hw = a.W / 2 - 14, y0 = a.YF + 14, y1 = a.YB - 14, t = 12;
      if (v.tiers === 1) {
        const bz = a.Z0 + a.H * 0.72;
        for (const s of [-1, 1]) a.tube([[cx + s * hw, y0, bz], [cx + s * hw, y1, bz]], [t, t], 6); a.box(cx - hw, y0, bz - 6, cx + hw, y1, bz + 6);
        for (const y of [y0 + 8, y1 - 8]) a.tube([[cx - hw, y, bz], [cx + hw, y, bz]], [t * 0.8, t * 0.8], 6);
        for (const y of [a.cy - (y1 - y0) * 0.25, a.cy + (y1 - y0) * 0.25]) { a.tube([[cx - hw * 0.9, y, a.Z0 + 8], [cx + hw * 0.9, y, bz - 14]], [t * 0.8, t * 0.8], 6); a.tube([[cx + hw * 0.9, y, a.Z0 + 8], [cx - hw * 0.9, y, bz - 14]], [t * 0.8, t * 0.8], 6); a.xcyl(cx - hw * 0.45, cx + hw * 0.45, y, a.Z0 + (bz - a.Z0) * 0.48, t * 0.5, 6); a.box(cx - hw * 0.95 - 10, y - 10, a.Z0, cx - hw * 0.95 + 20, y + 10, a.Z0 + 10); a.box(cx + hw * 0.95 - 20, y - 10, a.Z0, cx + hw * 0.95 + 10, y + 10, a.Z0 + 10); }
        a.rect(cx - hw, y0, cx + hw, y1, 'EQUIP'); for (const s of [-1, 1]) a.line(cx + s * hw * 0.9, a.cy - (y1 - y0) * 0.25, cx - s * hw * 0.9, a.cy - (y1 - y0) * 0.25, 'EQUIP-DETAIL'); a.line(cx - hw, a.cy, cx + hw, a.cy, 'EQUIP-DETAIL');
      } else {
        for (const [x, y] of [[-hw, y0], [hw, y0], [-hw, y1], [hw, y1]]) a.tube([[cx + x, y, a.Z0], [cx + x, y, a.Z1]], [t, t], 6);
        for (const z of [a.Z0 + a.H * 0.3, a.Z0 + a.H * 0.7]) { for (const s of [-1, 1]) a.box(cx + s * hw - 10, y0, z - 30, cx + s * hw + 10, y1, z + 30); a.box(cx - hw, y0, z - 8, cx + hw, y1, z + 8); for (const y of [y0, y1]) a.box(cx - hw, y - 10, z - 30, cx + hw, y + 10, z + 30); }
        for (const s of [-1, 1]) braceYZ(a, cx + s * hw, y0, y1, a.Z0 + a.H * 0.3 + 30, a.Z0 + a.H * 0.7 - 30, 6); for (let i = 0; i < 4; i++) a.box(cx - hw * 0.6, y1 - 2, a.Z0 + a.H * 0.3 + 60 + i * 90, cx + hw * 0.6, y1 + 0, a.Z0 + a.H * 0.3 + 76 + i * 90);
        a.rect(cx - hw, y0, cx + hw, y1, 'EQUIP'); a.line(cx - hw, a.cy, cx + hw, a.cy, 'EQUIP-DETAIL'); for (const [x, y] of [[-hw, y0], [hw, y0], [-hw, y1], [hw, y1]]) a.circ(cx + x, y, t, 'EQUIP-DETAIL');
      }
      a.log(v.tiers === 2 ? 'Added the four posts, two bed frames with fabric, end rails, braces and ladder rungs (plan and 3D).' : 'Added the side rails, fabric bed, end spreaders, crossed folding legs with cross bar and feet (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic steel field locker',
    desc: (v) => `Steel field locker with ${v.n} compartment${v.n > 1 ? 's' : ''}, ${v.w} in wide: a full-height door per compartment with louvres top and bottom, a lift handle with a hasp, a number plate, a sloped top, a hat shelf and hanging rail drawn at the door opening, and a plinth base.`,
    vs: [['1 compartment, 15 in', 1, 15, 18, 72], ['2 compartments, 30 in', 2, 30, 18, 72], ['3 compartments, 45 in', 3, 45, 21, 78]].map(([l, n, w, d, h]) => [l, w, d, h, 0, { n, w }]),
    build: (a, v) => {
      const cw = a.W / v.n, pl = 80, top = a.Z1 - 40, yF = a.YF + 50;
      a.box(a.X0, yF, a.Z0 + pl, a.X1, a.YB, top); a.box(a.X0 + 8, yF + 8, a.Z0, a.X1 - 8, a.YB - 8, a.Z0 + pl);
      prismX(a, [[yF, top], [a.YB, top], [a.YB, a.Z1], [yF + 60, a.Z1 - 14]].slice(0, 4), a.X0, a.X1);
      for (let i = 0; i < v.n; i++) { const x0 = a.X0 + cw * i + 4, x1 = a.X0 + cw * (i + 1) - 4; a.box(x0, yF - 18, a.Z0 + pl + 6, x1, yF, top - 6);
        for (let k = 0; k < 5; k++) for (const zz of [top - 40 - k * 28, a.Z0 + pl + 30 + k * 28]) a.box(x0 + cw * 0.15, yF - 24, zz - 8, x1 - cw * 0.15, yF - 18, zz + 4);
        a.box(x1 - cw * 0.2, yF - 44, a.Z0 + pl + (top - a.Z0) * 0.52, x1 - cw * 0.1, yF - 18, a.Z0 + pl + (top - a.Z0) * 0.52 + 130); a.box(x1 - cw * 0.2 - 30, yF - 36, a.Z0 + pl + (top - a.Z0) * 0.52 + 140, x1 - cw * 0.05, yF - 18, a.Z0 + pl + (top - a.Z0) * 0.52 + 175);
        a.box(x0 + cw * 0.25, yF - 24, top - 190, x0 + cw * 0.65, yF - 18, top - 140); a.rect(x0, yF, x1, a.YB, 'EQUIP-DETAIL'); a.line(x0, yF + 4, x1, yF + 4, 'EQUIP-DETAIL'); a.arc(x0, yF, cw * 0.9, 0, 60); }
      a.outline();
      a.log('Added the plinth, body with sloped top, a louvred door per compartment with lift handle, hasp and number plate (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic field sign post',
    desc: (v) => `Field sign post, ${v.h} in tall: ${v.kind === 'finger' ? 'a round mast on a base plate with five pointed direction boards fixed at different angles and a finial cap' : v.kind === 'twin' ? 'two square posts on ground plates carrying a wide board with a frame, cross rails and diagonal braces' : 'a single square post on a ground plate with a framed board on two brackets and a cap'}. Plain boards, no lettering.`,
    vs: [['single board, 84 in', 84, 24, 'single', 36, 24], ['twin post board, 96 in', 96, 84, 'twin', 72, 36], ['direction finger mast, 108 in', 108, 40, 'finger', 36, 8]].map(([l, h, w, kind, bw, bh]) => [l, w, kind === 'finger' ? 40 : 18, h, 0, { h, kind, bw, bh }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy;
      if (v.kind === 'single') {
        a.box(cx - 220, cy - 220, a.Z0, cx + 220, cy + 220, a.Z0 + 14); a.box(cx - 40, cy - 40, a.Z0 + 14, cx + 40, cy + 40, a.Z1 - 20); a.box(cx - 50, cy - 50, a.Z1 - 20, cx + 50, cy + 50, a.Z1);
        const bw = a.W * 0.92, z1 = a.Z1 - 120, z0 = z1 - a.H * 0.34; a.box(cx - bw / 2, cy + 40, z0, cx + bw / 2, cy + 52, z1); a.frame(cx - bw / 2 - 6, z0 - 6, cx + bw / 2 + 6, z1 + 6, cy + 38, cy + 58, 20); for (const dz of [0.2, 0.8]) a.box(cx - 40, cy + 20, z0 + (z1 - z0) * dz - 12, cx + 40, cy + 40, z0 + (z1 - z0) * dz + 12);
        a.rect(cx - 220, cy - 220, cx + 220, cy + 220, 'EQUIP-DETAIL'); a.rect(cx - 40, cy - 40, cx + 40, cy + 40, 'EQUIP'); a.rect(cx - bw / 2, cy + 40, cx + bw / 2, cy + 52, 'EQUIP');
      } else if (v.kind === 'twin') {
        const px = a.W * 0.38; for (const s of [-1, 1]) { a.box(cx + s * px - 200, cy - 200, a.Z0, cx + s * px + 200, cy + 200, a.Z0 + 12); a.box(cx + s * px - 35, cy - 35, a.Z0 + 12, cx + s * px + 35, cy + 35, a.Z1); }
        const z1 = a.Z1 - 80, z0 = z1 - a.H * 0.4, bw = px + 150; a.box(cx - bw, cy + 35, z0, cx + bw, cy + 47, z1); a.frame(cx - bw - 6, z0 - 6, cx + bw + 6, z1 + 6, cy + 33, cy + 53, 24); for (const z of [z0 + 60, z1 - 60]) a.box(cx - px, cy - 20, z - 20, cx + px, cy + 20, z + 20); braceXZ(a, cx - px + 35, cx + px - 35, cy - 10, a.Z0 + 200, z0 - 20, 10);
        a.rect(cx - px - 200, cy - 200, cx + px + 200, cy + 200, 'EQUIP-HIDDEN'); a.rect(cx - bw, cy + 35, cx + bw, cy + 47, 'EQUIP'); for (const s of [-1, 1]) a.rect(cx + s * px - 35, cy - 35, cx + s * px + 35, cy + 35, 'EQUIP-DETAIL');
      } else {
        a.box(cx - 220, cy - 220, a.Z0, cx + 220, cy + 220, a.Z0 + 14); a.cyl(cx, cy, a.Z0 + 14, a.Z1 - 60, 35, 12); a.cone(cx, cy, a.Z1 - 60, a.Z1, 50, 12, 12);
        for (let i = 0; i < 5; i++) { const z = a.Z0 + a.H * (0.3 + 0.12 * i), g = (i - 2) * 0.5 + 0.2 * (i % 2), ln = a.W * 0.42, w0 = a.H * 0.035; const ux = m.cos(g), uy = m.sin(g) * 0.0; const dir = i % 2 ? 1 : -1;
          a.prism([[cx + dir * 40, cy - 8], [cx + dir * (ln - 150), cy - 8], [cx + dir * ln, cy], [cx + dir * (ln - 150), cy + 8], [cx + dir * 40, cy + 8]].map((q) => q), z, z + w0 * 5); a.box(cx - 40, cy - 12, z, cx + 40, cy + 12, z + w0 * 5); }
        a.circ(cx, cy, 220, 'EQUIP-DETAIL'); a.circ(cx, cy, 35, 'EQUIP'); for (let i = 0; i < 5; i++) { const dir = i % 2 ? 1 : -1; a.line(cx + dir * 40, cy, cx + dir * a.W * 0.42, cy, 'EQUIP-DETAIL'); }
      }
      a.log('Added the ground plate, ' + (v.kind === 'finger' ? 'round mast, five direction boards and cap' : v.kind === 'twin' ? 'twin posts, framed board, rails and braces' : 'post, framed board on brackets and cap') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/field', title: 'Generic guyed field radio mast',
    desc: (v) => `Guyed field radio mast, ${v.h} ft tall: a triangular lattice mast of ${v.sec} sections on a base plate with a pivot foot, ${v.rings} guy rings each with three guy lines to ground anchors, a cross-arm with two whip antennas, a dipole at mid height and a top whip.`,
    vs: [['30 ft', 30, 3, 1], ['50 ft', 50, 5, 2], ['80 ft', 80, 8, 3]].map(([l, h, sec, rings]) => [l, h * 0.5 * 12 * 2, h * 0.5 * 12 * 2, h * 12 + 30, 0, { h, sec, rings }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, Hm = v.h * FT, mr = 130 + v.h * 2.5, tt = 12 + v.h * 0.18, N = v.sec * 3;
      const leg = (k) => { const g = (k / 3) * PI * 2 + PI / 2; return [m.cos(g) * mr, m.sin(g) * mr]; };
      a.box(cx - 400, cy - 400, a.Z0, cx + 400, cy + 400, a.Z0 + 20); a.cyl(cx, cy, a.Z0 + 20, a.Z0 + 80, 160, 10);
      for (let k = 0; k < 3; k++) { const [lx, ly] = leg(k); a.tube([[cx + lx, cy + ly, a.Z0 + 80], [cx + lx, cy + ly, a.Z0 + Hm]], [tt, tt], 5); }
      for (let i = 0; i < N; i++) { const z0 = a.Z0 + 80 + ((Hm - 80) * i) / N, z1 = a.Z0 + 80 + ((Hm - 80) * (i + 1)) / N; for (let k = 0; k < 3; k++) { const [ax, ay] = leg(k), [bx, by] = leg((k + 1) % 3); a.tube([[cx + ax, cy + ay, z0], [cx + bx, cy + by, z1]], [tt * 0.4, tt * 0.4], 4); a.tube([[cx + bx, cy + by, z0], [cx + ax, cy + ay, z1]], [tt * 0.4, tt * 0.4], 4); } }
      const gr = Hm * 0.55 * 0.5 * 2 * 0.5 * 1.6; const R = a.W / 2 - 160;
      for (let q = 1; q <= v.rings; q++) { const zr = a.Z0 + 80 + (Hm - 80) * (q / v.rings) * 0.96; a.cyl(cx, cy, zr - 20, zr + 20, mr * 1.4, 12); for (let k = 0; k < 3; k++) { const g = (k / 3) * PI * 2 + PI / 6 + q * 0.2, ax = cx + m.cos(g) * R * (0.5 + 0.5 * q / v.rings), ay = cy + m.sin(g) * R * (0.5 + 0.5 * q / v.rings); a.tube([[cx + m.cos(g) * mr * 1.2, cy + m.sin(g) * mr * 1.2, zr], [ax, ay, a.Z0 + 40]], [4, 4], 4); if (q === v.rings) { a.cyl(ax, ay, a.Z0, a.Z0 + 120, 25, 6); a.circ(ax, ay, 40, 'EQUIP-DETAIL'); a.line(cx, cy, ax, ay, 'EQUIP-HIDDEN'); } } }
      const zt = a.Z0 + Hm; a.tube([[cx, cy, zt], [cx, cy, a.Z1]], [mr * 0.2, 3], 5); a.box(cx - 450, cy - 20, zt - 600, cx + 450, cy + 20, zt - 560); for (const s of [-1, 1]) a.tube([[cx + s * 450, cy, zt - 580], [cx + s * 450, cy, zt + 700]], [8, 3], 5);
      a.tube([[cx - mr * 1.1, cy, a.Z0 + Hm * 0.5], [cx - 1100, cy, a.Z0 + Hm * 0.5 + 100]], [8, 8], 5); a.tube([[cx + mr * 1.1, cy, a.Z0 + Hm * 0.5], [cx + 1100, cy, a.Z0 + Hm * 0.5 + 100]], [8, 8], 5);
      a.circ(cx, cy, R, 'EQUIP-HIDDEN'); a.circ(cx, cy, mr, 'EQUIP'); a.rect(cx - 400, cy - 400, cx + 400, cy + 400, 'EQUIP-DETAIL');
      a.log('Added the base plate with pivot foot, triangular lattice sections, guy rings with guy lines and ground anchors, cross-arm whips, dipole and top whip (plan and 3D).');
    } }),

  // ===================================================== support =====================================================
  fam({ cat: 'military/support', title: 'Generic wood freight pallet, depot',
    desc: (v) => `Wooden freight pallet, ${v.w} by ${v.l} in: ${v.top} top deck boards over three stringers and three bottom boards with chamfered corners${v.load ? ', carrying a stack of cartons under two straps' : ''}.`,
    vs: [['32 x 40 in', 32, 40, 7, 3, false], ['40 x 48 in', 40, 48, 7, 3, false], ['48 x 48 in, heavy', 48, 48, 9, 4, false], ['40 x 48 in, loaded', 40, 48, 7, 3, true]].map(([l, w, len, top, bot, load]) => [l, w, len, load ? 6 + 40 : 6, 0, { w, l: len, top, load }]),
    build: (a, v) => {
      const ph = 6 * IN, nb = v.top, bw = 3.5 * IN, g = (a.D - bw) / (nb - 1);
      for (let i = 0; i < 3; i++) { const x = a.X0 + (a.W - 3.5 * IN) * (i / 2); a.box(x, a.YF, a.Z0 + ph * 0.18, x + 3.5 * IN, a.YB, a.Z0 + ph * 0.82); a.box(x + 12, a.YF + 40, a.Z0 + ph * 0.18, x + 3.5 * IN - 12, a.YF + 40 + 120, a.Z0 + ph * 0.18 + 1); }
      for (let i = 0; i < nb; i++) { const y = a.YF + g * i; a.box(a.X0, y, a.Z0 + ph * 0.82, a.X1, y + bw, a.Z0 + ph); a.line(a.X0, y, a.X1, y, 'EQUIP-DETAIL'); }
      for (let i = 0; i < 3; i++) { const y = a.YF + (a.D - bw) * (i / 2); a.box(a.X0, y, a.Z0, a.X1, y + bw, a.Z0 + ph * 0.18); }
      for (let i = 0; i < 3; i++) { const x = a.X0 + (a.W - 3.5 * IN) * (i / 2); a.line(x, a.YF, x, a.YB, 'EQUIP-DETAIL'); }
      if (v.load) { const cw = a.W / 2 - 20, cd = a.D / 3 - 20; for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) for (let z = 0; z < 3; z++) a.box(a.X0 + 10 + c * (cw + 20), a.YF + 10 + r * (cd + 20), a.Z0 + ph + z * 330 - 0, a.X0 + 10 + c * (cw + 20) + cw, a.YF + 10 + r * (cd + 20) + cd, a.Z0 + ph + z * 330 + 320 + 0); for (const y of [a.YF + a.D * 0.3, a.YF + a.D * 0.7]) { a.box(a.X0 + 4, y - 6, a.Z0 + ph, a.X0 + 10, y + 6, a.Z1); a.box(a.X1 - 10, y - 6, a.Z0 + ph, a.X1 - 4, y + 6, a.Z1); a.box(a.X0 + 4, y - 6, a.Z1 - 8, a.X1 - 4, y + 6, a.Z1); } }
      a.outline();
      a.log('Added the three stringers with notches, the top deck boards, bottom boards' + (v.load ? ', the stacked cartons and two straps' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic freight container, depot',
    desc: (v) => `${v.ft} ft freight container, ${v.hh} in high: corrugated side and roof panels, eight corner castings, a closed end wall, a door end with two door leaves, four locking bars with cam handles and hinge pins, and fork pockets at the base.`,
    vs: [['10 ft', 10, 96, 96], ['20 ft', 20, 96, 102], ['40 ft', 40, 96, 102], ['40 ft, high cube', 40, 96, 114]].map(([l, ft, w, h]) => [l, w, ft * 12, h, 0, { ft, hh: h }]),
    build: (a, v) => {
      const cx = a.cx, c = 7.5 * IN, rib = 80, t = 14;
      a.box(a.X0 + 30, a.YF + 20, a.Z0 + 220, a.X1 - 30, a.YB - 20, a.Z0 + 260); for (const s of [-1, 1]) a.box(cx + s * (a.W / 2 - 120) - 80, a.YF + 20, a.Z0 + 40, cx + s * (a.W / 2 - 120) + 80, a.YB - 20, a.Z0 + 220); for (const s of [-1, 1]) for (const y of [a.YF + a.D * 0.25, a.YF + a.D * 0.75]) a.box(cx + s * (a.W / 2 - 120) - 80, y - 80, a.Z0 + 20, cx + s * (a.W / 2 - 120) + 80, y + 80, a.Z0 + 220);
      a.box(a.X0 + 40, a.YF + 20, a.Z0 + 260, a.X1 - 40, a.YB - 20, a.Z1 - 40); a.box(a.X0 + 40, a.YB - 60, a.Z0 + 260, a.X1 - 40, a.YB - 20, a.Z1 - 40);
      const nr = m.floor((a.D - 400) / rib); for (let i = 0; i < nr; i++) { const y = a.YF + 220 + i * rib; for (const s of [-1, 1]) a.box(cx + s * (a.W / 2 - 40) - (s > 0 ? 0 : 0) - t / 2 + (s > 0 ? 0 : 0), y, a.Z0 + 280, cx + s * (a.W / 2 - 40) + s * t / 2 + (s > 0 ? 0 : 0) + 0, y + rib * 0.45, a.Z1 - 60); a.box(a.X0 + 120, y, a.Z1 - 40, a.X1 - 120, y + rib * 0.45, a.Z1 - 26); }
      for (const sx of [-1, 1]) for (const sy of [0, 1]) for (const sz of [0, 1]) a.box(cx + sx * (a.W / 2 - c * 0.5) - c * 0.5, (sy ? a.YB - c : a.YF), sz ? a.Z1 - c * 0.65 : a.Z0, cx + sx * (a.W / 2 - c * 0.5) + c * 0.5, sy ? a.YB : a.YF + c, sz ? a.Z1 : a.Z0 + c * 0.65);
      a.box(a.X0 + 40, a.YF + 20, a.Z0 + 260, a.X1 - 40, a.YF + 60, a.Z1 - 40);
      for (const q of [0, 1]) { const x0 = q ? cx + 8 : a.X0 + 50, x1 = q ? a.X1 - 50 : cx - 8; a.box(x0, a.YB - 70, a.Z0 + 270, x1, a.YB - 20 + 0, a.Z1 - 50); for (let i = 1; i < 5; i++) a.box(x0 + ((x1 - x0) * i) / 5 - 6, a.YB - 82, a.Z0 + 280, x0 + ((x1 - x0) * i) / 5 + 6, a.YB - 70, a.Z1 - 60); for (const k of [0, 1]) { const x = q ? x1 - 160 + k * 90 : x0 + 70 + k * 90; a.cyl(x, a.YB - 100, a.Z0 + 300, a.Z1 - 80, 14, 6); a.box(x - 30, a.YB - 118, a.Z0 + (a.Z1 - a.Z0) * 0.45, x + 30, a.YB - 100, a.Z0 + (a.Z1 - a.Z0) * 0.45 + 40); } for (const z of [0.1, 0.9]) a.cyl(q ? x1 : x0, a.YB - 70, a.Z0 + (a.Z1 - a.Z0) * z, a.Z0 + (a.Z1 - a.Z0) * z + 40, 12, 6); }
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP'); a.line(cx, a.YB - 70, cx, a.YB, 'EQUIP-DETAIL'); a.rect(a.X0 + 40, a.YF + 20, a.X1 - 40, a.YB - 20, 'EQUIP-DETAIL'); for (const sx of [-1, 1]) for (const sy of [0, 1]) a.rect(cx + sx * (a.W / 2 - c) - (sx > 0 ? 0 : 0), sy ? a.YB - c : a.YF, cx + sx * (a.W / 2), sy ? a.YB : a.YF + c, 'EQUIP-DETAIL');
      a.log('Added the corrugated sides and roof, corner castings, closed end wall, door end with two leaves, locking bars with cam handles and the base with fork pockets (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic truck-mounted telescopic crane',
    desc: (v) => `Truck-mounted telescopic crane, ${v.ton} ton class, ${v.len} in long in travel position: a cab, a carrier deck with turntable and side operator cab, a three-section boom lying forward over the cab with a hook block, a counterweight and two outrigger beams with jack legs and pads.`,
    vs: [['5 ton, 4x2', 5, 250, 90, 118, 17, 2], ['12 ton, 4x4', 12, 330, 96, 128, 19, 2], ['25 ton, 6x6', 25, 420, 100, 138, 22, 3]].map(([l, ton, len, w, h, r, ax]) => [l, w, len, h, 0, { ton, len, r, ax }]),
    build: (a, v) => {
      const r = v.r * IN, L = a.D, W = a.W, ww = r * 0.6, cx = a.cx, axles = v.ax === 2 ? [L * 0.14, L * 0.7] : [L * 0.12, L * 0.62, L * 0.77];
      const T = truck(a, { r, ww, axles, dual: axles.map((_, i) => v.ax === 3 && i > 0), cabL: L * 0.15, hoodL: L * 0.1, cabH: a.H * 0.52, hoodH: a.H * 0.34 });
      const zf = T.zf, y0 = T.yb - 100, y1 = a.YB - 20, hw = W * 0.4, dz = zf + 60, ym = y0 + (y1 - y0) * 0.55, zt = zf + 600;
      a.box(cx - hw, y0, zf, cx + hw, y1, dz + 100); a.cyl(cx, ym, dz + 100, zt, hw * 0.55, 20); a.cyl(cx, ym, zt, zt + 80, hw * 0.62, 20);
      a.box(cx - hw * 0.7, ym - hw * 0.55, zt + 80, cx + hw * 0.7, ym + hw * 0.7, zt + 80 + 900); a.box(cx - hw * 0.75, ym + hw * 0.7, zt + 80, cx + hw * 0.75, m.min(y1, ym + hw * 0.7 + 650), zt + 80 + 700);
      a.box(cx + hw * 0.4, ym - hw * 1.0, zt + 80, cx + hw * 1.05 > W / 2 - 30 ? W / 2 - 30 : cx + hw * 1.05, ym - hw * 0.1, zt + 80 + 1250); a.frame(cx + hw * 0.4 + 6, zt + 80 + 500, W / 2 - 40, zt + 80 + 1150, ym - hw * 1.0 - 6, ym - hw * 1.0 + 8, 30);
      const bz = zt + 80 + 520, tip = a.Z1 - 260, by = T.yb + 0; const p0 = [cx, ym + hw * 0.5, bz], p1 = [cx, ym - hw * 0.9, bz + 80], p2 = [cx, a.YF + (ym - a.YF) * 0.25, (bz + tip) / 2 + 60], p3 = [cx, a.YF + 140, tip];
      a.tube([p0, p1, [cx, (p1[1] + p2[1]) / 2, (p1[2] + p2[2]) / 2], p2], [hw * 0.34, hw * 0.34, hw * 0.29, hw * 0.27], 8); a.tube([p2, [cx, (p2[1] + p3[1]) / 2, (p2[2] + p3[2]) / 2], p3], [hw * 0.24, hw * 0.2, hw * 0.17], 8);
      a.box(cx - hw * 0.28, p3[1] - 140, p3[2] - 60, cx + hw * 0.28, p3[1] + 60, p3[2] + 110); a.xcyl(cx - hw * 0.3, cx + hw * 0.3, p3[1] - 120, p3[2], 100, 12); a.tube([[cx, p3[1] - 120, p3[2] - 100], [cx, p3[1] - 120, p3[2] - 650]], [8, 8], 4); a.box(cx - 60, p3[1] - 160, p3[2] - 800, cx + 60, p3[1] - 80, p3[2] - 650);
      for (const yo of [y0 + 300, y1 - 400]) { a.box(cx - W / 2 + 70, yo - 100, zf - 120, cx + W / 2 - 70, yo + 100, zf + 40); for (const s of [-1, 1]) { a.cyl(cx + s * (W / 2 - 110), yo, a.Z0 + 120, zf - 120, 50, 8); a.box(cx + s * (W / 2 - 110) - 160, yo - 160, a.Z0, cx + s * (W / 2 - 110) + 160, yo + 160, a.Z0 + 120); } }
      a.rect(cx - hw, y0, cx + hw, y1, 'EQUIP'); a.circ(cx, ym, hw * 0.55, 'EQUIP-DETAIL'); a.line(cx, ym, cx, a.YF + 140, 'EQUIP-DETAIL'); a.rect(cx + hw * 0.4, ym - hw * 1.0, cx + hw * 1.05 > W / 2 - 30 ? W / 2 - 30 : cx + hw * 1.05, ym - hw * 0.1, 'EQUIP-DETAIL'); for (const yo of [y0 + 300, y1 - 400]) { a.rect(cx - W / 2 + 70, yo - 100, cx + W / 2 - 70, yo + 100, 'EQUIP-DETAIL'); }
      a.log('Added the cab, carrier deck with turntable and operator cab, three-section boom with sheave head and hook block, counterweight and the outrigger beams with jack legs and pads (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic depot forklift truck',
    desc: (v) => `${v.cap} lb class forklift truck, ${v.len} in long with forks: a two-upright mast with a lift carriage and two tapered forks, an overhead guard with roof bars, a seat, steering wheel, a counterweight rear end, ${v.big ? 'four large lugged rough-ground tyres' : 'two large drive tyres at the front and two small steer tyres at the rear'} and a beacon.`,
    vs: [['3,000 lb', '3,000', 130, 42, 84, false, 8], ['5,000 lb', '5,000', 150, 46, 90, false, 10], ['8,000 lb', '8,000', 175, 52, 98, false, 12], ['10,000 lb, rough ground', '10,000', 205, 78, 112, true, 18]].map(([l, cap, len, w, h, big, r]) => [l, w, len, h, 0, { cap, len, big, r }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, r = v.r * IN, ww = r * 0.7, xo = W / 2 - ww / 2 - 6, fy = a.YF + L * 0.3, ry = a.YB - L * 0.14, rr = v.big ? r : r * 0.62;
      for (const s of [-1, 1]) { whl(a, cx + s * xo, fy, r, ww, a.Z0 + r, v.big ? 12 : 0); whl(a, cx + s * (xo - (v.big ? 0 : W * 0.04)), ry, rr, ww * 0.8, a.Z0 + rr, v.big ? 12 : 0); }
      a.box(cx - W * 0.4, a.YF + L * 0.17 + 80, a.Z0 + r * 0.9, cx + W * 0.4, a.YB - 40, a.Z0 + r * 1.9); a.box(cx - W * 0.36, a.YB - L * 0.26, a.Z0 + r * 1.9, cx + W * 0.36, a.YB, a.Z0 + r * 2.9); a.ell(cx, a.YB - L * 0.1, a.Z0 + r * 2.4, W * 0.4, L * 0.16, r * 0.55, 12, 6);
      const sz = a.Z0 + r * 1.9, gz = a.Z1 - 30, my = a.YF + L * 0.2;
      a.box(cx - W * 0.3, a.cy + L * 0.04, sz, cx + W * 0.3, a.cy + L * 0.16, sz + 180); a.box(cx - W * 0.28, a.cy + L * 0.14, sz + 180, cx + W * 0.28, a.cy + L * 0.17, sz + 620);
      a.cyl(cx, a.cy - L * 0.1, sz, sz + 560, 30, 8); a.xcyl(cx - 170, cx + 170, a.cy - L * 0.1, sz + 620, 25, 14);
      for (const [x, y] of [[-1, a.cy - L * 0.18], [1, a.cy - L * 0.18], [-1, a.cy + L * 0.19], [1, a.cy + L * 0.19]]) a.tube([[cx + x * W * 0.36, y, sz], [cx + x * W * 0.36, y, gz]], [18, 18], 6);
      for (let i = 0; i < 7; i++) a.box(cx - W * 0.38, a.cy - L * 0.19 + i * (L * 0.38 / 6) - 10, gz - 14, cx + W * 0.38, a.cy - L * 0.19 + i * (L * 0.38 / 6) + 10, gz); for (const s of [-1, 1]) a.box(cx + s * W * 0.38 - 12, a.cy - L * 0.19, gz - 14, cx + s * W * 0.38 + 12, a.cy + L * 0.2, gz);
      for (const s of [-1, 1]) a.box(cx + s * W * 0.22 - 40, a.YF + L * 0.17, a.Z0 + r * 0.5, cx + s * W * 0.22 + 40, a.YF + L * 0.17 + 80, a.Z0 + (a.Z1 - a.Z0) * 0.78);
      a.box(cx - W * 0.25, a.YF + L * 0.17, a.Z0 + (a.Z1 - a.Z0) * 0.7, cx + W * 0.25, a.YF + L * 0.17 + 80, a.Z0 + (a.Z1 - a.Z0) * 0.78); a.box(cx - W * 0.25, a.YF + L * 0.17, a.Z0 + (a.Z1 - a.Z0) * 0.3, cx + W * 0.25, a.YF + L * 0.17 + 80, a.Z0 + (a.Z1 - a.Z0) * 0.36);
      a.box(cx - W * 0.3, a.YF + L * 0.17 - 40, a.Z0 + 200, cx + W * 0.3, a.YF + L * 0.17, a.Z0 + (a.Z1 - a.Z0) * 0.4);
      for (const s of [-1, 1]) { const fx = cx + s * W * 0.2; a.box(fx - 60, a.YF + 20, a.Z0 + 30, fx + 60, a.YF + L * 0.17, a.Z0 + 85); a.box(fx - 60, a.YF + L * 0.17 - 40, a.Z0 + 30, fx + 60, a.YF + L * 0.17, a.Z0 + (a.Z1 - a.Z0) * 0.4); a.rect(fx - 60, a.YF + 20, fx + 60, a.YF + L * 0.17, 'EQUIP-DETAIL'); }
      a.cyl(cx + W * 0.3, a.cy + L * 0.2, gz, gz + 0, 1, 4); a.cyl(cx - W * 0.3, a.cy - L * 0.18, gz, gz + 0, 1, 4);
      a.outline(); a.rect(cx - W * 0.36, a.cy - L * 0.19, cx + W * 0.36, a.cy + L * 0.2, 'EQUIP-DETAIL'); a.rect(cx - W * 0.25, a.YF + L * 0.17, cx + W * 0.25, a.YF + L * 0.17 + 80, 'EQUIP-DETAIL');
      a.log('Added the two-upright mast with lift carriage and tapered forks, overhead guard, seat and steering wheel, counterweight and tyres (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic fuel bowser tanker truck',
    desc: (v) => `Fuel bowser truck, ${v.gal} gal, ${v.len} in long: a cab on a ladder frame, an oval tank with three manway hatches, a top walkway with a rail, a vent, a rear cabinet with a hose reel and two hose coils, side valve boxes, a rear ladder, ${v.ax} axles and a front bumper bar. No weapons, no markings.`,
    vs: [['2,000 gal, 4x4', 2000, 250, 90, 118, 18, 2], ['4,000 gal, 6x6', 4000, 310, 96, 124, 21, 3], ['6,000 gal, 6x6', 6000, 360, 98, 130, 22, 3]].map(([l, gal, len, w, h, r, ax]) => [l, w, len, h, 0, { gal, len, r, ax }]),
    build: (a, v) => {
      const r = v.r * IN, L = a.D, W = a.W, ww = r * 0.6, cx = a.cx, axles = v.ax === 2 ? [L * 0.17, L * 0.77] : [L * 0.14, L * 0.69, L * 0.85];
      const T = truck(a, { r, ww, axles, dual: axles.map((_, i) => v.ax === 3 && i > 0), cabL: L * 0.17, hoodL: L * 0.13, cabH: a.H * 0.54, hoodH: a.H * 0.36 });
      const y0 = T.yb + 20, y1 = a.YB - 520, zf = T.zf, hw = W * 0.42, tz0 = zf + 120, tz1 = a.Z1 - 380, ov = (n) => Array.from({ length: n }, (_, i) => { const g = (i / n) * PI * 2; return [cx + m.cos(g) * hw, (tz0 + tz1) / 2 + m.sin(g) * (tz1 - tz0) / 2]; });
      prismY(a, ov(18), y0, y1); for (let i = 0; i <= 3; i++) { const y = y0 + ((y1 - y0 - 80) * i) / 3; prismY(a, ov(18).map(([x, z]) => [cx + (x - cx) * 1.018, (tz0 + tz1) / 2 + (z - (tz0 + tz1) / 2) * 1.03]), y, y + 80); }
      for (const s of [-1, 1]) a.box(cx + s * hw * 0.5 - 90, y0, zf + 40, cx + s * hw * 0.5 + 90, y1, tz0 + 60);
      a.box(cx - hw * 0.3, y0 + 100, tz1 - 20, cx + hw * 0.3, y1 - 100, tz1 + 20); for (let i = 0; i < 3; i++) { const y = y0 + 260 + ((y1 - y0 - 520) * i) / 2; a.cyl(cx, y, tz1 + 20, tz1 + 300 > a.Z1 ? a.Z1 : tz1 + 300, 220, 14); a.cyl(cx, y, tz1 + 260, tz1 + 300 > a.Z1 ? a.Z1 : tz1 + 300, 250, 14); a.circ(cx, y, 220, 'EQUIP-DETAIL'); }
      for (const s of [-1, 1]) rail(a, cx + s * hw * 0.34, y0 + 120, cx + s * hw * 0.34, y1 - 120, tz1 + 20, tz1 + 330 > a.Z1 ? a.Z1 : tz1 + 330, 10, 4); a.cyl(cx + hw * 0.6, y0 + 150, tz1 - 40, tz1 + 200, 30, 8);
      const cy0 = y1 + 20, cy1 = a.YB - 10; a.box(cx - hw, cy0, zf + 60, cx + hw, cy1, a.Z1 - 560); for (const s of [-1, 1]) a.box(cx + s * hw - 4 * s, cy0 + 40, zf + 160, cx + s * hw + 12 * s, cy1 - 40, a.Z1 - 660);
      a.xcyl(cx - hw * 0.5, cx + hw * 0.5, cy1 - 200, zf + 560, 190, 16); for (const q of [-1, 1]) a.xcyl(cx + q * hw * 0.5 - 60, cx + q * hw * 0.5 + 60, cy1 - 200, zf + 560, 230, 16);
      for (const dx of [-1, 1]) a.tube([[cx + dx * hw * 0.55, cy0 + 150, zf + 200], [cx + dx * hw * 0.75, cy0 + 50, zf + 300], [cx + dx * hw * 0.55, cy0 + 20, zf + 520]], [20, 20, 20], 6);
      for (const s of [-1, 1]) a.tube([[cx + s * hw * 0.8, cy1 - 10, zf + 80], [cx + s * hw * 0.8, cy1 - 10, a.Z1 - 450]], [14, 14], 5); a.box(cx - hw * 0.8, cy1 - 10, a.Z1 - 560 + 0, cx + hw * 0.8, cy1 - 5, a.Z1 - 530);
      a.rect(cx - hw, y0, cx + hw, y1, 'EQUIP'); a.rect(cx - hw, cy0, cx + hw, cy1, 'EQUIP-DETAIL'); for (let i = 0; i < 3; i++) a.circ(cx, y0 + 260 + ((y1 - y0 - 520) * i) / 2, 220, 'EQUIP-DETAIL');
      a.log('Added the cab and frame, oval tank with three manway hatches, top walkway with rail, vent, rear hose-reel cabinet with hose coils, side valve boxes and rear ladder (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic field medical and workshop trailer',
    desc: (v) => `${v.kind === 'medical' ? 'Field medical' : 'Field workshop'} trailer, ${v.len} in long on a tandem axle: an insulated box body, ${v.kind === 'medical' ? 'a side door with steps, three window frames, a rear ramp, a roof air conditioner and an entrance awning on a frame' : 'a rolling shutter on the side, a side door, a roof extraction vent, a generator box on the drawbar and a side workbench shelf on brackets'}, a drawbar with eye and jockey wheel, and four levelling jacks.`,
    vs: [['medical, 180 in', 'medical', 180, 84, 106], ['medical, 288 in', 'medical', 288, 96, 118], ['workshop, 180 in', 'workshop', 180, 84, 106], ['workshop, 288 in', 'workshop', 288, 96, 118]].map(([l, kind, len, w, h]) => [l, kind === 'medical' ? w + 30 : w + 20, len, h, 0, { kind, len, bw: w }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx - (v.kind === 'medical' ? 0 : 0), r = 13 * IN, ww = r * 0.55, bz = a.Z0 + r * 1.4, bx0 = a.YF + L * 0.2, hw = v.bw * IN / 2 * 0.86, top = a.Z1 - 240, ys = [a.YB - L * 0.3, a.YB - L * 0.17];
      wheelsAt(a, ys, r, ww); for (const y of ys) a.xcyl(cx - W * 0.4, cx + W * 0.4, y, a.Z0 + r, 30, 8);
      a.box(cx - hw, bx0, bz, cx + hw, a.YB - 20, bz + 60); for (const s of [-1, 1]) a.box(cx + s * hw * 0.5 - 40, bx0, bz - 150, cx + s * hw * 0.5 + 40, a.YB - 30, bz); a.box(cx - hw, bx0, bz + 60, cx + hw, a.YB - 20, top);
      for (const y of ys) for (const s of [-1, 1]) a.box(cx + s * (W / 2 - ww / 2 - 6) - ww * 0.6, y - r * 1.15, a.Z0 + r * 1.85, cx + s * (W / 2 - ww / 2 - 6) + ww * 0.6, y + r * 1.15, a.Z0 + r * 1.95);
      a.prism([[cx - 40, a.YF + 80], [cx + 40, a.YF + 80], [cx + hw * 0.5 + 40, bx0], [cx - hw * 0.5 - 40, bx0]], bz - 150, bz - 90); a.xcyl(cx - 26, cx + 26, a.YF + 25, bz - 120, 50, 14); a.cyl(cx, a.YF + 300, a.Z0 + 80, bz - 120, 20, 8); a.xcyl(cx - 40, cx + 40, a.YF + 300, a.Z0 + 80, 80, 12);
      for (const [x, y] of [[cx - hw, bx0 + 150], [cx + hw, bx0 + 150], [cx - hw, a.YB - 150], [cx + hw, a.YB - 150]]) { a.cyl(x, y, a.Z0 + 100, bz - 20, 22, 6); a.box(x - 80, y - 80, a.Z0 + 80, x + 80, y + 80, a.Z0 + 110); }
      const sy0 = bx0 + (a.YB - bx0) * 0.18, wz0 = bz + (top - bz) * 0.4, wz1 = bz + (top - bz) * 0.85;
      if (v.kind === 'medical') {
        a.box(cx + hw - 4, sy0, bz + 60, cx + hw + 12, sy0 + 900, top - 200); a.box(cx + hw, sy0 - 450, bz - 120, cx + hw + 500, sy0 + 900, bz - 40); a.box(cx + hw, sy0 - 450, bz - 220, cx + hw + 500, sy0 - 300, bz - 120);
        for (const k of [0, 1, 2]) a.frame(cx - hw - 12, wz0, cx - hw + 6, wz1, bx0 + (a.YB - bx0) * (0.15 + k * 0.27), bx0 + (a.YB - bx0) * (0.15 + k * 0.27) + 700, 28);
        a.frame(cx + hw - 6, wz0, cx + hw + 14, wz1, sy0 + 1000, sy0 + 1700, 28);
        a.prism([[cx - hw * 0.8, a.YB - 20], [cx + hw * 0.8, a.YB - 20], [cx + hw * 0.7, a.YB + 0], [cx - hw * 0.7, a.YB + 0]], bz - 40, bz);
        a.box(cx - hw * 0.5, bx0 + (a.YB - bx0) * 0.5, top, cx + hw * 0.5, bx0 + (a.YB - bx0) * 0.85, top + 220); a.tube([[cx + hw + 20, sy0 - 150, bz + 2100], [cx + hw + 700, sy0 - 150, bz + 2100], [cx + hw + 700, sy0 + 1000, bz + 2100]], Array(3).fill(14), 5); a.tube([[cx + hw + 700, sy0 - 150, bz + 2100], [cx + hw + 700, sy0 - 150, bz - 40]], [14, 14], 5); a.tube([[cx + hw + 700, sy0 + 1000, bz + 2100], [cx + hw + 700, sy0 + 1000, bz - 40]], [14, 14], 5);
        a.rect(cx + hw, sy0 - 450, cx + hw + 500, sy0 + 900, 'EQUIP-DETAIL'); a.rect(cx - hw * 0.5, bx0 + (a.YB - bx0) * 0.5, cx + hw * 0.5, bx0 + (a.YB - bx0) * 0.85, 'EQUIP-DETAIL');
      } else {
        const sh0 = bx0 + (a.YB - bx0) * 0.3, sh1 = bx0 + (a.YB - bx0) * 0.78; a.box(cx + hw - 4, sh0 - 80, bz + 120, cx + hw + 20, sh1 + 80, top - 240); for (let i = 0; i < 14; i++) a.box(cx + hw + 20, sh0 - 40, bz + 160 + i * ((top - bz - 560) / 14), cx + hw + 40, sh1 + 40, bz + 160 + i * ((top - bz - 560) / 14) + ((top - bz - 560) / 14) * 0.6);
        a.box(cx + hw - 4, sy0 - 300, bz + 60, cx + hw + 12, sy0 + 500, top - 300);
        for (const s of [-1, 1]) a.tube([[cx - hw - 20, a.YB - 600 + s * 300, bz + 700], [cx - hw - 400, a.YB - 600 + s * 300, bz + 700]], [12, 12], 5); a.box(cx - hw - 500, a.YB - 1000, bz + 700, cx - hw - 20, a.YB - 200, bz + 740);
        a.box(cx - hw * 0.7, a.YF + 120, bz - 360, cx + hw * 0.7, bx0 - 80, bz - 160); a.box(cx - hw * 0.25, bx0 + (a.YB - bx0) * 0.5, top, cx + hw * 0.25, bx0 + (a.YB - bx0) * 0.65, top + 200); a.cyl(cx, bx0 + (a.YB - bx0) * 0.58, top + 200, top + 240, 150, 10);
        a.rect(cx - hw - 500, a.YB - 1000, cx - hw - 20, a.YB - 200, 'EQUIP-DETAIL'); a.rect(cx - hw * 0.7, a.YF + 120, cx + hw * 0.7, bx0 - 80, 'EQUIP-DETAIL'); a.circ(cx, bx0 + (a.YB - bx0) * 0.58, 150, 'EQUIP-DETAIL');
      }
      a.rect(cx - hw, bx0, cx + hw, a.YB - 20, 'EQUIP'); a.circ(cx, a.YF + 25, 50, 'EQUIP-DETAIL'); a.line(cx - hw * 0.5, a.YF + 80, cx - hw * 0.5 - 40, bx0, 'EQUIP-DETAIL'); a.line(cx + hw * 0.5, a.YF + 80, cx + hw * 0.5 + 40, bx0, 'EQUIP-DETAIL');
      a.log('Added the insulated body, ' + (v.kind === 'medical' ? 'side door with steps, window frames, rear ramp, roof air conditioner and awning frame' : 'rolling shutter, side door, roof extraction vent, drawbar generator box and side bench shelf') + ', tandem axle, drawbar with jockey wheel and jacks (plan and 3D).');
    } }),

  fam({ cat: 'military/support', title: 'Generic airfield tow tractor',
    desc: (v) => `Low airfield tow tractor, ${v.len} in long: a heavy low chassis with ballast weights, an open cab frame with roof and a seat, ${v.w6 ? 'six small solid tyres' : 'four small solid tyres'}, front grille with lamps, a push bumper, a rear tow hitch with a pin and a roof beacon.`,
    vs: [['light, 130 in', 130, 62, 66, false, 10], ['medium, 160 in', 160, 76, 74, false, 13], ['heavy, 210 in', 210, 90, 84, true, 15]].map(([l, len, w, h, w6, r]) => [l, w, len, h, 0, { len, w6, r }]),
    build: (a, v) => {
      const L = a.D, W = a.W, cx = a.cx, r = v.r * IN, ww = r * 0.7, xo = W / 2 - ww / 2 - 6, ys = v.w6 ? [a.YF + L * 0.2, a.YB - L * 0.34, a.YB - L * 0.16] : [a.YF + L * 0.22, a.YB - L * 0.22];
      for (const y of ys) { for (const s of [-1, 1]) whl(a, cx + s * xo, y, r, ww, a.Z0 + r, 0); a.xcyl(cx - xo, cx + xo, y, a.Z0 + r, 40, 8); }
      const cz = a.Z0 + r * 0.9; a.box(cx - W * 0.4, a.YF + 80, cz, cx + W * 0.4, a.YB - 40, cz + a.H * 0.32); for (const s of [-1, 1]) for (const y of ys) a.box(cx + s * (xo - ww * 0.1) - ww * 0.65, y - r * 1.1, a.Z0 + r * 1.9, cx + s * (xo - ww * 0.1) + ww * 0.65, y + r * 1.1, a.Z0 + r * 2.0);
      const hz = cz + a.H * 0.32; a.box(cx - W * 0.34, a.YF + 80, hz, cx + W * 0.34, a.YF + L * 0.28, hz + a.H * 0.16);
      for (let i = 0; i < 5; i++) a.box(cx - W * 0.22, a.YF + 56, cz + 100 + i * (a.H * 0.32 / 5), cx + W * 0.22, a.YF + 80, cz + 100 + i * (a.H * 0.32 / 5) + a.H * 0.04); for (const s of [-1, 1]) a.ycyl(a.YF + 56, a.YF + 80, cx + s * W * 0.32, cz + a.H * 0.24, 55, 10);
      a.box(cx - W * 0.44, a.YF, cz - 50, cx + W * 0.44, a.YF + 90, cz + a.H * 0.22);
      const cb = a.YF + L * 0.3, ce = a.YB - L * 0.12, top = a.Z1 - 140; for (const [x, y] of [[-1, cb], [1, cb], [-1, ce], [1, ce]]) a.tube([[cx + x * W * 0.34, y, hz], [cx + x * W * 0.34, y, top]], [18, 18], 6);
      a.box(cx - W * 0.38, cb - 20, top, cx + W * 0.38, ce + 20, top + 50); a.box(cx - W * 0.2, cb + 100, hz, cx + W * 0.2, cb + 360, hz + 220); a.box(cx - W * 0.2, cb + 300, hz + 220, cx + W * 0.2, cb + 360, hz + 520);
      a.box(cx - W * 0.4, a.YB - 40 - L * 0.1, hz, cx + W * 0.4, a.YB - 40, hz + a.H * 0.12); a.cyl(cx + W * 0.2, ce + 200, top + 50, a.Z1, 25, 8); a.ell(cx + W * 0.2, ce + 200, a.Z1 - 20, 70, 70, 50, 8, 4);
      a.box(cx - 100, a.YB - 40, cz + a.H * 0.04, cx + 100, a.YB + 0, cz + a.H * 0.2); a.cyl(cx, a.YB - 30, cz + a.H * 0.04, cz + a.H * 0.2, 25, 8);
      a.outline(); a.rect(cx - W * 0.34, cb, cx + W * 0.34, ce, 'EQUIP-DETAIL'); a.rect(cx - W * 0.34, a.YF + 80, cx + W * 0.34, a.YF + L * 0.28, 'EQUIP-DETAIL'); a.circ(cx, a.YB - 30, 25, 'EQUIP-DETAIL'); a.circ(cx + W * 0.2, ce + 200, 70, 'EQUIP-DETAIL');
      a.log('Added the low chassis with ballast, open cab frame with roof and seat, solid tyres, front grille with lamps, push bumper, rear tow hitch and roof beacon (plan and 3D).');
    } }),
];
export default FAMS;

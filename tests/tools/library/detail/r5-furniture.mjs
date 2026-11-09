/* SPDX-License-Identifier: Apache-2.0 */
/** Round 5 furniture (2026-11-03): hospitals, construction sites, mine camps and aviation. 250 variants. Original geometry from boxes, tubes, ellipsoids and extruded outlines. */
import { fam, cab, tbl, pull, T, GAP, leaves, F, FU, M, S, C, O, A, Acc } from './r4-kit.mjs';

const fams = [];
const P = (f) => { fams.push(fam(f)); };
const cushion = FU.cushion;
const IN = 25.4;
const cnt = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const deg = (d) => (d * Math.PI) / 180;
const legsAt = (a, pts, z0, z1, r) => { for (const [x, y] of pts) { a.leg(x, y, z0, z1, r); a.circ(x, y, r, 'EQUIP-HIDDEN'); } };

/** Extrude a convex side profile [[y, z], …] (counter-clockwise, y right, z up) across x0..x1. */
function xprism(a, poly, x0, x1) {
  const tmp = { t: [] };
  Acc.prototype.prism.call(tmp, poly, x0, x1);
  return a.add(tmp.t.map((tri) => tri.map(([p, q, r]) => [r, p, q])));
}
/** A sloped slab in the side view from (y0, z0) to (y1, z1), thickness t measured vertically, across x0..x1. */
function slab(a, x0, x1, y0, z0, y1, z1, t) {
  if (y1 < y0) { [y0, y1] = [y1, y0]; [z0, z1] = [z1, z0]; }
  return xprism(a, [[y0, z0], [y1, z1], [y1, z1 + t], [y0, z0 + t]], x0, x1);
}
/** A four-wheel base: two skids along Y joined by cross bars, with casters. */
function caseBase(a, o = {}) {
  const { X0, X1, YF, YB, Z0 } = a, inx = o.inx ?? 90, iny = o.iny ?? 90, top = Z0 + (o.top ?? 150), bot = Z0 + (o.bot ?? 90);
  for (const x of [X0 + inx, X1 - inx]) { a.box(x - 25, YF + iny, bot, x + 25, YB - iny, top); a.rect(x - 25, YF + iny, x + 25, YB - iny, 'EQUIP-HIDDEN'); }
  for (const y of [YF + iny + 20, YB - iny - 20]) a.box(X0 + inx, y - 20, bot, X1 - inx, y + 20, top);
  for (const x of [X0 + inx, X1 - inx]) for (const y of [YF + iny, YB - iny]) { a.caster(x, y, o.cas ?? 120); a.circ(x, y, 22, 'EQUIP-HIDDEN'); }
}
/** Side rails along Y at both x faces: levels n between z0 and z1, posts at the given y values. */
function sideRails(a, xs, y0, y1, z0, z1, n, posts, r = 11) {
  for (const x of xs) {
    for (let i = 0; i < n; i++) a.ycyl(y0, y1, x, z0 + ((z1 - z0) * i) / (n - 1), r, 8);
    for (const y of posts) a.cyl(x, y, z0, z1, r, 8);
    a.rect(x - 12, y0, x + 12, y1, 'EQUIP-DETAIL');
  }
}

// ================================================================ HOSPITAL / HEALTHCARE
/** Two-section hospital bed frame: base with casters, columns, deck, mattress, raised head section, head and foot panels, side rails. */
function hospBed(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a;
  const deck = Z0 + o.deck, mt = o.mt ?? 130, hl = D * 0.36, hs = YB - 60 - hl;
  a.outline();
  caseBase(a, { inx: 90, iny: 120, top: 170, bot: 100, cas: 140 });
  for (const y of [YF + D * 0.26, YB - D * 0.26]) { a.box(cx - 75, y - 55, Z0 + 170, cx + 75, y + 55, deck - 60); a.rect(cx - 75, y - 55, cx + 75, y + 55, 'EQUIP-HIDDEN'); }
  a.box(X0 + 40, YF + 45, deck - 60, X1 - 40, hs, deck);
  a.box(X0 + 45, YF + 55, deck, X1 - 45, hs, deck + mt);
  if (o.head > 0) {
    const ye = hs + hl * Math.cos(deg(o.head)), ze = deck + hl * Math.sin(deg(o.head));
    slab(a, X0 + 40, X1 - 40, hs, deck - 60, ye, ze - 60, 60);
    slab(a, X0 + 45, X1 - 45, hs, deck, ye, ze, mt);
    a.ell(cx, YB - 150, ze + mt + 25, W * 0.28, 150, 45, 12, 5);
  } else {
    a.box(X0 + 40, hs, deck - 60, X1 - 40, YB - 60, deck); a.box(X0 + 45, hs, deck, X1 - 45, YB - 60, deck + mt);
    a.ell(cx, YB - 200, deck + mt + 20, W * 0.28, 150, 45, 12, 5);
  }
  a.line(X0 + 45, hs, X1 - 45, hs, 'EQUIP-DETAIL'); a.line(X0 + 45, YF + D * 0.44, X1 - 45, YF + D * 0.44, 'EQUIP-DETAIL');
  a.rect(X0 + 45, YF + 55, X1 - 45, YB - 60, 'EQUIP-DETAIL');
  a.box(X0 + 20, YB - 55, deck - 150, X1 - 20, YB - 25, Z1); a.rect(X0 + 20, YB - 55, X1 - 20, YB - 25, 'EQUIP-DETAIL');
  const ft = Math.min(Z1, deck + mt + 340);
  a.box(X0 + 20, YF + 25, deck - 120, X1 - 20, YF + 55, ft); a.rect(X0 + 20, YF + 25, X1 - 20, YF + 55, 'EQUIP-DETAIL');
  if (o.rails !== 'none') {
    const rt = Z1 - 20, y0 = o.rails === 'half' ? YF + D * 0.5 : YF + 130, y1 = YB - 110;
    sideRails(a, [X0 + 22, X1 - 22], y0, y1, deck + 40, rt, 3, [y0, (y0 + y1) / 2, y1]);
  }
}
P({ cat: 'furniture/beds', title: 'Generic hospital ward bed frame',
  desc: (v) => `Two-section bed frame, ${v.w} by ${v.d} in, on a four-caster base with two lifting columns: a mattress deck${v.head ? ` with the head section raised ${v.head} degrees` : ''}, head and foot panels${v.rails === 'none' ? ' and no side rails' : v.rails === 'half' ? ' and head-half side rails' : ' and full-length side rails'}.`,
  vs: [
    ['36 by 80 in, rails up', 36, 80, 44, 0, { deck: 600, head: 0, rails: 'full' }],
    ['36 by 80 in, low height', 36, 80, 42, 0, { deck: 330, head: 0, rails: 'full' }],
    ['36 by 80 in, head raised 30 degrees', 36, 80, 47, 0, { deck: 600, head: 30, rails: 'full' }],
    ['36 by 80 in, head raised 45 degrees, rails up', 36, 80, 53, 0, { deck: 600, head: 45, rails: 'full' }],
    ['36 by 80 in, head raised 60 degrees, head rails', 36, 80, 58, 0, { deck: 600, head: 60, rails: 'half' }],
    ['36 by 80 in, no rails', 36, 80, 36, 0, { deck: 600, head: 0, rails: 'none' }],
    ['42 by 88 in, wide frame, rails up', 42, 88, 44, 0, { deck: 600, head: 0, rails: 'full' }],
    ['48 by 90 in, wide frame, head raised', 48, 90, 48, 0, { deck: 620, head: 30, rails: 'full' }],
    ['30 by 66 in, child frame, tall rails', 30, 66, 52, 0, { deck: 450, head: 0, rails: 'full', mt: 100 }] ],
  build: (a, v) => { hospBed(a, v); a.log('Added the casters, base and columns, the deck and mattress with any raised head section, the head and foot panels and the side rails (plan and 3D).'); } });

/** Ward recliner: base, sloped back, arms, footrest folded down or extended. */
function recliner(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a;
  const sz = Z0 + 480, arm = o.arm ?? 120, bk = o.back ?? 20;
  a.outline();
  a.box(X0 + 20, YB - 640, Z0 + 70, X1 - 20, YB - 40, sz - 120);
  for (const x of [X0 + 70, X1 - 70]) for (const y of [YB - 600, YB - 80]) { if (o.legs) { a.cone(x, y, Z0, Z0 + 70, 18, 28, 8); a.circ(x, y, 24, 'EQUIP-HIDDEN'); } else { a.caster(x, y, 100); a.circ(x, y, 22, 'EQUIP-HIDDEN'); } }
  for (const x of [X0, X1 - arm]) {
    a.box(x, YB - 640, sz - 130, x + arm, YB - 40, sz + 190); a.ell(x + arm / 2, YB - 340, sz + 190, arm / 2, 300, 22, 10, 4); a.rect(x, YB - 640, x + arm, YB - 40, 'EQUIP-DETAIL');
  }
  const sx0 = X0 + arm + 5, sx1 = X1 - arm - 5, sy0 = YB - 620;
  xprism(a, [[sy0, sz - 130], [YB - 190, sz - 130], [YB - 190, sz + 60], [sy0, sz + 90]], sx0, sx1);
  a.rect(sx0, sy0, sx1, YB - 190, 'EQUIP-DETAIL');
  const bz1 = Z1 - 30;
  xprism(a, [[YB - 210, sz - 130], [YB - 40, sz - 130], [YB - 40, bz1], [YB - 130, bz1]], sx0, sx1);
  a.ell(cx, YB - 120, bz1 - 60, (sx1 - sx0) / 2 - 40, 55, 110, 14, 6);
  a.line(sx0, YB - 200, sx1, YB - 200, 'EQUIP-DETAIL');
  const fl = o.foot ? YF + 60 : YB - 620 - 200;
  if (o.foot) {
    slab(a, sx0 + 20, sx1 - 20, sy0 + 20, sz - 100, fl, sz + 20, 90);
    a.ell(cx, (sy0 + fl) / 2 - 20, sz + 70, (sx1 - sx0) / 2 - 30, (sy0 - fl) / 2, 30, 12, 4);
    a.rect(sx0 + 20, fl, sx1 - 20, sy0, 'EQUIP-DETAIL');
  } else { a.box(sx0 + 30, sy0 - 150, sz - 100, sx1 - 30, sy0 + 10, sz - 10); a.rect(sx0 + 30, sy0 - 150, sx1 - 30, sy0 + 10, 'EQUIP-DETAIL'); }
  if (o.tray) { a.tube([[X1 - arm / 2, YB - 560, sz + 190], [X1 - arm / 2 - 180, YB - 560, sz + 215]], [14, 14], 6); a.box(X0 + arm + 160, YB - 700, sz + 210, X1 - arm - 40, YB - 330, sz + 232); a.rect(X0 + arm + 160, YB - 700, X1 - arm - 40, YB - 330, 'EQUIP-DETAIL'); }
}
P({ cat: 'furniture/seating', title: 'Generic hospital ward recliner',
  desc: (v) => `Upholstered ward recliner on four casters with padded arms, a sloped back and a seat; the footrest is ${v.foot ? 'extended in front' : 'folded down'}${v.tray ? ' and a swing-over tray sits on the right arm' : ''}.`,
  vs: [
    ['footrest down', 30, 34, 44, 0, { foot: false }],
    ['footrest extended', 30, 58, 44, 0, { foot: true }],
    ['wide seat, footrest down', 36, 36, 44, 0, { foot: false, arm: 130 }],
    ['wide seat, footrest extended', 36, 60, 44, 0, { foot: true, arm: 130 }],
    ['footrest extended, with tray', 32, 58, 44, 0, { foot: true, tray: true }] ],
  build: (a, v) => { recliner(a, v); a.log('Added the base and casters, the arms, the seat, the sloped back and the footrest with any swing-over tray (plan and 3D).'); } });

P({ cat: 'furniture/tables', title: 'Generic overbed table, hospital ward',
  desc: (v) => `Wheeled overbed table with a ${v.round ? 'round top' : 'rectangular top with a front rim'}${v.tilt ? ', a hinged tilting centre panel' : ''}${v.shelf ? ', a lower side shelf' : ''}, a column and a U-base with four casters.`,
  vs: [
    ['top 30 by 15 in', 30, 15, 34, 0, {}],
    ['top 34 by 16 in', 34, 16, 34, 0, {}],
    ['top 32 by 16 in, tilting centre panel', 32, 16, 36, 0, { tilt: true }],
    ['top 32 by 16 in, side shelf', 32, 16, 36, 0, { shelf: true }],
    ['round top 24 in', 24, 24, 34, 0, { round: true }],
    ['low top 34 by 16 in, 28 in high', 34, 16, 28, 0, {}] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, tt = 28;
    a.outline('EQUIP-HIDDEN');
    if (v.round) { a.ell(cx, cy, Z1 - tt / 2, W / 2, W / 2, tt / 2, 24, 3); a.circ(cx, cy, W / 2); a.circ(cx, cy, W / 2 - 18, 'EQUIP-DETAIL'); }
    else { a.box(X0, YF, Z1 - tt, X1, YB, Z1); a.box(X0, YF, Z1, X1, YF + 14, Z1 + 12); a.rect(X0, YF, X1, YB); a.rect(X0 + 18, YF + 18, X1 - 18, YB - 18, 'EQUIP-DETAIL'); }
    if (v.tilt) { slab(a, X0 + W * 0.3, X1 - W * 0.3, YF + D * 0.2, Z1 + 10, YF + D * 0.75, Z1 + 70, 18); a.rect(X0 + W * 0.3, YF + D * 0.2, X1 - W * 0.3, YF + D * 0.75, 'EQUIP-DETAIL'); }
    const cyb = v.round ? cy + W * 0.18 : YB - 90;
    a.box(cx - 30, cyb - 30, Z0 + 110, cx + 30, cyb + 30, Z1 - tt); a.box(cx - 55, cyb - 40, Z1 - tt - 50, cx + 55, cyb + 40, Z1 - tt);
    const xb = W * 0.34, y0 = YF + D * 0.1, y1 = cyb + 30;
    for (const x of [cx - xb, cx + xb]) { a.box(x - 22, y0, Z0 + 70, x + 22, y1, Z0 + 110); a.rect(x - 22, y0, x + 22, y1, 'EQUIP-HIDDEN'); for (const y of [y0 + 25, y1 - 25]) { a.caster(x, y, 100); } }
    a.box(cx - xb, cyb - 25, Z0 + 70, cx + xb, cyb + 25, Z0 + 110);
    if (v.shelf) { a.box(X0 + 60, YF + 60, Z0 + (Z1 - Z0) * 0.5, X0 + 60 + W * 0.28, YB - 60, Z0 + (Z1 - Z0) * 0.5 + 18); a.rect(X0 + 60, YF + 60, X0 + 60 + W * 0.28, YB - 60, 'EQUIP-HIDDEN'); }
    a.log('Added the top with its rim, the column, the U-base with casters and any tilting panel or shelf (plan and 3D).');
  } });

P({ cat: 'furniture/storage', title: 'Generic bedside unit, patient room',
  desc: (v) => `Bedside unit on casters, ${v.w} by ${v.d} in: ${v.dr ? cnt(v.dr, 'drawer', 'drawers') : 'no drawers'}${v.doors ? `, ${cnt(v.doors, 'door', 'doors')} below` : ''}${v.open ? ' and an open shelf' : ''}${v.tray ? ', with a pull-out tray under the top' : ''} and a flat top.`,
  vs: [
    ['one drawer, one door, 18 in', 18, 16, 34, 0, { dr: 1, doors: 1 }],
    ['two drawers, one door, 20 in', 20, 18, 34, 0, { dr: 2, doors: 1 }],
    ['one drawer, open shelf, 18 in', 18, 16, 34, 0, { dr: 1, open: true }],
    ['two drawers, 16 in', 16, 16, 32, 0, { dr: 2, doors: 0, open: false }],
    ['drawer, door and pull-out tray, 20 in', 20, 18, 34, 0, { dr: 1, doors: 1, tray: true }],
    ['wide, three drawers, 24 in', 24, 18, 34, 0, { dr: 3, doors: 0 }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z1, cx } = a;
    if (v.open) {
      cab(a, { casters: 90, open: true, shelves: 1, pull: 'none', topT: 25 });
      a.box(X0 + 3, YF - 2, Z1 - 25 - 170, X1 - 3, YF + T - 2, Z1 - 28); a.box(cx - 55, YF - 12, Z1 - 25 - 95, cx + 55, YF - 2, Z1 - 25 - 83);
    } else {
      cab(a, { casters: 90, drawers: v.dr, drawerH: v.doors ? 170 * v.dr : 0, doors: v.doors, pull: 'none', topT: 25 });
      for (let i = 0; i < v.dr; i++) { const zc = Z1 - 25 - 60 - i * (v.doors ? 170 : (Z1 - a.Z0 - 150) / v.dr); a.box(cx - 55, YF - 10, zc - 6, cx + 55, YF, zc + 6); }
      if (v.doors) { const zm = (a.Z0 + 90 + Z1 - 25 - 170 * v.dr) / 2; a.box(X1 - 75, YF - 10, zm - 60, X1 - 63, YF, zm + 60); }
    }
    if (v.tray) { a.box(X0 + 30, YF + 5, Z1 - 125, X1 - 30, YB - 40, Z1 - 105); a.rect(X0 + 30, YF + 5, X1 - 30, YB - 40, 'EQUIP-DETAIL'); }
    a.log('Added the casters, the carcass, the drawers and door or the open shelf, the pulls, the top and any pull-out tray (plan and 3D).');
  } });

/** Four-leg armchair: wood or padded arms, seat and back cushions; sleeper = a flat bed deck pulled out to the front. */
function armchair(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, sh = Z0 + o.sh, ax = 55;
  a.outline();
  const fy = YF + 45, by = YB - 45;
  legsAt(a, [[X0 + 45, fy], [X1 - 45, fy], [X0 + 45, by], [X1 - 45, by]], Z0, sh - 80, o.legR ?? 20);
  a.box(X0 + 30, fy - 15, sh - 110, X1 - 30, by + 15, sh - 60);
  if (o.ext) {   // pulled-out sleeping deck
    a.box(X0 + 40, YF + 20, sh - 60, X1 - 40, YB - 560, sh - 30); cushion(a, X0 + 50, YF + 25, X1 - 50, YB - 560, sh - 30, sh + 60); a.rect(X0 + 50, YF + 25, X1 - 50, YB - 560, 'EQUIP-DETAIL');
    a.cyl(X0 + 60, YF + 45, Z0, sh - 60, 20, 8); a.cyl(X1 - 60, YF + 45, Z0, sh - 60, 20, 8);
  }
  const sy0 = o.ext ? YB - 550 : YF + 45;
  cushion(a, X0 + 80, sy0, X1 - 80, YB - 120, sh - 60, sh + 70); a.rect(X0 + 80, sy0, X1 - 80, YB - 120, 'EQUIP-DETAIL');
  xprism(a, [[YB - 130, sh - 60], [YB - 30, sh - 60], [YB - 30, Z1 - 20], [YB - 90, Z1 - 20]], X0 + 75, X1 - 75);
  a.ell(cx, YB - 135, (sh + Z1) / 2 + 40, (W - 160) / 2 - 10, 35, (Z1 - sh) / 2 - 90, 12, 6); a.rect(X0 + 75, YB - 130, X1 - 75, YB - 30, 'EQUIP-DETAIL');
  for (const x of [X0 + 20, X1 - 20 - 50]) {
    if (o.arms === 'pad') { a.box(x, fy - 15, sh - 80, x + 50, by + 15, sh + 170); a.ell(x + 25, (fy + by) / 2, sh + 170, 25, (by - fy) / 2 + 15, 25, 8, 4); }
    else { a.box(x, fy - 25, sh + 170, x + 50, by + 10, sh + 205); a.box(x + 5, fy - 15, sh - 80, x + 45, fy + 15, sh + 170); a.box(x + 5, by - 15, sh - 80, x + 45, by + 15, sh + 170); }
    a.rect(x, fy - 25, x + 50, by + 10, 'EQUIP-DETAIL');
  }
}
P({ cat: 'furniture/seating', title: 'Generic ward armchair, patient room',
  desc: (v) => `Four-leg armchair with ${v.arms === 'pad' ? 'padded arms' : 'timber-style arm rails on front and rear posts'}, a seat cushion and a padded back, seat height ${Math.round(v.sh / IN)} in.`,
  vs: [
    ['visitor, seat 18 in', 24, 24, 35, 0, { sh: 18 * IN, arms: 'wood' }],
    ['visitor, wide, seat 18 in', 28, 25, 35, 0, { sh: 18 * IN, arms: 'wood' }],
    ['raised seat, 21 in', 25, 26, 40, 0, { sh: 21 * IN, arms: 'wood' }],
    ['raised seat, padded arms, 21 in', 26, 26, 40, 0, { sh: 21 * IN, arms: 'pad' }],
    ['wide seat, padded arms, 19 in', 32, 28, 40, 0, { sh: 19 * IN, arms: 'pad', legR: 24 }],
    ['wide seat, wood arms, 22 in', 34, 28, 41, 0, { sh: 22 * IN, arms: 'wood', legR: 24 }] ],
  build: (a, v) => { armchair(a, v); a.log('Added the legs and seat frame, the seat and back cushions and the two arms (plan and 3D).'); } });

P({ cat: 'furniture/seating', title: 'Generic family sleeper chair, patient room',
  desc: (v) => v.ext ? 'Armchair with the sleeping deck pulled out to the front: a padded flat deck on two extra feet, with the chair back and arms in place.' : 'Armchair with a folded sleeping deck under the seat, padded back and wood arm rails, on four legs.',
  vs: [
    ['folded', 28, 30, 36, 0, { sh: 18 * IN, arms: 'wood', ext: false }],
    ['folded, wide', 32, 30, 36, 0, { sh: 18 * IN, arms: 'pad', ext: false }],
    ['extended as a bed', 28, 72, 36, 0, { sh: 18 * IN, arms: 'wood', ext: true }] ],
  build: (a, v) => { armchair(a, v); if (!v.ext) { a.box(a.X0 + 90, a.YF + 20, a.Z0 + 18 * IN - 150, a.X1 - 90, a.YF + 50, a.Z0 + 18 * IN - 70); a.rect(a.X0 + 90, a.YF + 20, a.X1 - 90, a.YF + 50, 'EQUIP-DETAIL'); } a.log('Added the legs, the seat and back cushions, the arms and the sleeping deck (plan and 3D).'); } });

/** Exam table: pedestal or drawer base, seat, foot and back sections (back raised by an angle), paper roll. */
function examTable(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, top = Z0 + o.th, pt = 70;
  a.outline();
  const py0 = YF + D * 0.3, py1 = YF + D * 0.66, px0 = X0 + W * 0.1, px1 = X1 - W * 0.1;
  if (o.drawers) {
    a.box(px0, py0, Z0, px1, py1, top - pt); a.rect(px0, py0, px1, py1, 'EQUIP-HIDDEN');
    for (let i = 0; i < o.drawers; i++) { const z1 = top - pt - 20 - i * ((top - pt - Z0 - 40) / o.drawers), z0 = z1 - (top - pt - Z0 - 60) / o.drawers; a.box(px0 + 15, py0 - 12, z0, px1 - 15, py0, z1); a.box(cx - 70, py0 - 24, (z0 + z1) / 2 - 6, cx + 70, py0 - 12, (z0 + z1) / 2 + 6); }
  } else {
    a.box(X0 + W * 0.15, py0 + 30, Z0, X1 - W * 0.15, py1 - 30, Z0 + 60); a.rect(X0 + W * 0.15, py0 + 30, X1 - W * 0.15, py1 - 30, 'EQUIP-HIDDEN');
    a.box(cx - 130, (py0 + py1) / 2 - 100, Z0 + 60, cx + 130, (py0 + py1) / 2 + 100, top - pt); a.box(cx - 180, (py0 + py1) / 2 - 130, top - pt - 60, cx + 180, (py0 + py1) / 2 + 130, top - pt);
  }
  const hy = YB - D * 0.4, L = D * 0.4;
  a.box(X0, YF + D * 0.27, top - pt, X1, hy, top); a.rect(X0, YF + D * 0.27, X1, hy, 'EQUIP-DETAIL');
  slab(a, X0 + 5, X1 - 5, YF + 10, top - pt - (o.foot ?? 0), YF + D * 0.27 - 8, top - pt - (o.foot ?? 0) * 0.2, pt); a.rect(X0 + 5, YF + 10, X1 - 5, YF + D * 0.27 - 8, 'EQUIP-DETAIL');
  const ye = hy + L * Math.cos(deg(o.back)), ze = top - pt + L * Math.sin(deg(o.back));
  slab(a, X0 + 5, X1 - 5, hy + 6, top - pt, ye, ze, pt); a.line(X0, hy, X1, hy, 'EQUIP-DETAIL');
  a.xcyl(X0 + 50, X1 - 50, ye - 20, ze + pt + 45, 45, 12); a.xcyl(X0 + 20, X1 - 20, ye - 20, ze + pt + 45, 20, 8);
  if (o.step) { a.box(X0 + W * 0.2, YF + 40, Z0, X1 - W * 0.2, YF + 330, Z0 + 230); a.rect(X0 + W * 0.2, YF + 40, X1 - W * 0.2, YF + 330, 'EQUIP-DETAIL'); a.box(X0 + W * 0.2, YF + 40, Z0 + 230, X1 - W * 0.2, YF + 330, Z0 + 250); }
}
P({ cat: 'furniture/beds', title: 'Generic clinic exam table, examination room',
  desc: (v) => `Padded exam table, ${v.w} by ${v.d} in, ${v.th / IN} in to the seat section, with ${v.drawers ? `a base cabinet of ${cnt(v.drawers, 'drawer', 'drawers')}` : 'a pedestal base'}, a foot section, a back section${v.back ? ` raised ${v.back} degrees` : ' lying flat'}, a paper roll holder${v.step ? ' and a fixed step at the foot' : ''}.`,
  vs: [
    ['pedestal base, flat', 27, 70, 34, 0, { th: 31 * IN, back: 0 }],
    ['pedestal base, back raised 30 degrees', 27, 70, 44, 0, { th: 31 * IN, back: 30 }],
    ['pedestal base, back raised 60 degrees', 27, 70, 59, 0, { th: 31 * IN, back: 60 }],
    ['drawer base, flat', 27, 70, 34, 0, { th: 31 * IN, back: 0, drawers: 3 }],
    ['drawer base, back raised 45 degrees, step', 27, 70, 49, 0, { th: 31 * IN, back: 45, drawers: 2, step: true }],
    ['low height, back raised 30 degrees', 27, 70, 38, 0, { th: 21 * IN, back: 30 }],
    ['wide, 32 in, back raised 30 degrees', 32, 72, 44, 0, { th: 31 * IN, back: 30, step: true }],
    ['drawer base, wide, back raised 15 degrees', 32, 72, 38, 0, { th: 31 * IN, back: 15, drawers: 4 }] ],
  build: (a, v) => { examTable(a, v); a.log('Added the base, the padded seat, foot and back sections, the paper roll holder and any drawers or step (plan and 3D).'); } });

/** Patient transport trolley: wheeled base, deck, mattress, raised backrest, side rails, push bar, pole socket. */
function trolley(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, deck = Z0 + o.deck, hl = D * 0.32;
  a.outline();
  caseBase(a, { inx: 100, iny: 110, top: 240, bot: 160, cas: 200 });
  for (const y of [YF + D * 0.3, YB - D * 0.3]) a.box(cx - 80, y - 50, Z0 + 240, cx + 80, y + 50, deck - 70);
  a.box(X0 + 45, YF + 50, deck - 70, X1 - 45, YB - 50 - hl, deck);
  a.box(X0 + 50, YF + 55, deck, X1 - 50, YB - 50 - hl, deck + 90);
  if (o.back > 0) {
    const hy = YB - 50 - hl, ye = hy + hl * Math.cos(deg(o.back)), ze = deck + hl * Math.sin(deg(o.back));
    slab(a, X0 + 45, X1 - 45, hy, deck - 70, ye, ze - 70, 70); slab(a, X0 + 50, X1 - 50, hy, deck, ye, ze, 90);
  } else { a.box(X0 + 45, YB - 50 - hl, deck - 70, X1 - 45, YB - 50, deck); a.box(X0 + 50, YB - 50 - hl, deck, X1 - 50, YB - 50, deck + 90); }
  a.line(X0 + 50, YB - 50 - hl, X1 - 50, YB - 50 - hl, 'EQUIP-DETAIL'); a.rect(X0 + 50, YF + 55, X1 - 50, YB - 50, 'EQUIP-DETAIL');
  a.xcyl(X0 + 30, X1 - 30, YB - 20, Z1 - 30, 16, 10); for (const x of [X0 + 30, X1 - 30]) a.cyl(x, YB - 20, deck - 100, Z1 - 30, 16, 8);
  a.xcyl(X0 + 40, X1 - 40, YF + 20, deck + 120, 14, 8); for (const x of [X0 + 40, X1 - 40]) a.cyl(x, YF + 20, deck - 100, deck + 120, 14, 8);
  if (o.rails) sideRails(a, [X0 + 20, X1 - 20], YF + 180, YB - 50 - hl * 0.9, deck + 120, deck + 340, 2, [YF + 180, (YF + 180 + YB - 50 - hl * 0.9) / 2, YB - 50 - hl * 0.9], 12);
  a.cyl(X1 - 35, YB - 70, deck - 70, deck + 230, 20, 8);
}
P({ cat: 'furniture/beds', title: 'Generic patient transport trolley, hospital corridor',
  desc: (v) => `Wheeled patient trolley, ${v.w} by ${v.d} in: four large casters on a cross-braced base with two lifting columns, a padded deck${v.back ? ` with the back section raised ${v.back} degrees` : ''}, a push bar at the head, a foot bumper bar and ${v.rails ? 'side rails' : 'no side rails'}.`,
  vs: [
    ['flat, rails up', 28, 78, 44, 0, { deck: 820, back: 0, rails: true }],
    ['flat, rails down', 28, 78, 40, 0, { deck: 820, back: 0, rails: false }],
    ['back raised 30 degrees', 28, 78, 52, 0, { deck: 820, back: 30, rails: true }],
    ['back raised 60 degrees', 28, 78, 62, 0, { deck: 820, back: 60, rails: true }],
    ['wide, 34 in, flat', 34, 82, 44, 0, { deck: 820, back: 0, rails: true }],
    ['child size, 24 by 56 in', 24, 56, 42, 0, { deck: 700, back: 0, rails: true }] ],
  build: (a, v) => { trolley(a, v); a.log('Added the cross-braced base with casters, the columns, the deck and mattress with any raised back, the push bar, the foot bar and the side rails (plan and 3D).'); } });

/** Linked waiting seating on floor legs: seats, arms at every boundary, optional table slot. */
function waitSeats(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a, sh = Z0 + 450, slots = [];
  for (let i = 1; i <= o.n; i++) { slots.push('S'); if (o.table === i) slots.push('T'); }
  const wts = slots.map((c) => (c === 'S' ? 1 : 0.7)), tot = wts.reduce((s, u) => s + u, 0), usable = W - 80, unit = usable / tot;
  a.outline();
  a.box(X0 + 20, YB - 100, sh - 100, X1 - 20, YB - 50, sh - 45); a.box(X0 + 20, YF + 60, sh - 100, X1 - 20, YF + 105, sh - 45);
  let x = X0 + 40; const bounds = [x]; const spans = [];
  slots.forEach((c, i) => { spans.push([c, x, x + wts[i] * unit]); x += wts[i] * unit; bounds.push(x); });
  for (const bx of bounds) {
    a.box(bx - 22, YF + 60, Z0, bx + 22, YF + 105, sh - 100); a.box(bx - 22, YB - 100, Z0, bx + 22, YB - 50, sh - 100); a.box(bx - 22, YF + 60, Z0, bx + 22, YB - 50, Z0 + 30);
    a.rect(bx - 22, YF + 60, bx + 22, YB - 50, 'EQUIP-HIDDEN');
    a.box(bx - 22, YF + 90, sh + 170, bx + 22, YB - 110, sh + 205); a.box(bx - 20, YF + 90, sh - 45, bx + 20, YF + 130, sh + 170); a.rect(bx - 22, YF + 90, bx + 22, YB - 110, 'EQUIP-DETAIL');
  }
  for (const [c, x0, x1] of spans) {
    if (c === 'S') {
      cushion(a, x0 + 24, YF + 70, x1 - 24, YB - 110, sh - 45, sh + 55); a.rect(x0 + 24, YF + 70, x1 - 24, YB - 110, 'EQUIP-DETAIL');
      xprism(a, [[YB - 125, sh + 10], [YB - 40, sh + 10], [YB - 40, Z1 - 30], [YB - 100, Z1 - 30]], x0 + 24, x1 - 24);
      a.ell((x0 + x1) / 2, YB - 128, (sh + Z1) / 2 + 40, (x1 - x0) / 2 - 36, 20, (Z1 - sh) / 2 - 80, 12, 5);
    } else { a.box(x0 + 10, YF + 110, sh + 160, x1 - 10, YB - 120, sh + 190); a.rect(x0 + 10, YF + 110, x1 - 10, YB - 120, 'EQUIP-DETAIL'); a.box((x0 + x1) / 2 - 20, (YF + YB) / 2 - 20, sh - 45, (x0 + x1) / 2 + 20, (YF + YB) / 2 + 20, sh + 160); }
  }
}
P({ cat: 'furniture/seating', title: 'Generic waiting room seating, hospital outpatient clinic',
  desc: (v) => `Linked ${cnt(v.n, 'seat', 'seats')} on floor-standing end and divider legs with wood-style arm rails at each leg line, padded seat and back pads${v.table ? ' and a fixed side table between two seats' : ''}.`,
  vs: [
    ['2 seats', 44, 28, 35, 0, { n: 2 }],
    ['3 seats', 64, 28, 35, 0, { n: 3 }],
    ['4 seats', 84, 28, 35, 0, { n: 4 }],
    ['3 seats, side table', 76, 28, 35, 0, { n: 3, table: 2 }],
    ['4 seats, centre table', 94, 28, 35, 0, { n: 4, table: 2 }],
    ['5 seats', 104, 28, 35, 0, { n: 5 }],
    ['6 seats', 124, 28, 35, 0, { n: 6 }] ],
  build: (a, v) => { waitSeats(a, v); a.log('Added the divider legs and rails, the seat and back pads, the arm rails and any side table (plan and 3D).'); } });

/** Blood-draw / treatment chair: base plate, column, seat, back, fixed arm and flip-up arm boards. */
function drawChair(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, sh = Z0 + 480;
  a.outline();
  a.box(X0 + 50, YF + 80, Z0, X1 - 50, YB - 80, Z0 + 45); a.rect(X0 + 50, YF + 80, X1 - 50, YB - 80, 'EQUIP-HIDDEN');
  a.cone(cx, cy + 80, Z0 + 45, sh - 90, 70, 55, 14); a.box(cx - 150, cy - 60, sh - 100, cx + 150, cy + 220, sh - 45);
  cushion(a, X0 + 50, YF + 80, X1 - 50, YB - 130, sh - 45, sh + 70); a.rect(X0 + 50, YF + 80, X1 - 50, YB - 130, 'EQUIP-DETAIL');
  xprism(a, [[YB - 150, sh - 40], [YB - 40, sh - 40], [YB - 40, Z1 - 30], [YB - 140, Z1 - 30]], X0 + 55, X1 - 55);
  a.ell(cx, YB - 150, sh + 330, (W - 160) / 2, 35, 260, 12, 6);
  if (o.rest) { a.ell(cx, YB - 110, Z1 - 30, 140, 70, 60, 10, 5); }
  const sides = o.flip === 'both' ? ['L', 'R'] : [o.flip];
  for (const sd of ['L', 'R']) {
    const x = sd === 'L' ? X0 + 15 : X1 - 15 - 45;
    a.box(x, YF + 120, sh + 200, x + 45, YB - 140, sh + 235); a.box(x + 8, YB - 180, sh - 45, x + 37, YB - 140, sh + 200); a.rect(x, YF + 120, x + 45, YB - 140, 'EQUIP-DETAIL');
    if (sides.includes(sd)) {   // the flip-up board lies across the front on this side
      const bx0 = sd === 'L' ? X0 + 15 : cx + (o.flip === 'both' ? 20 : -120), bx1 = sd === 'L' ? cx - (o.flip === 'both' ? 20 : -120) : X1 - 15;
      a.box(bx0, YF + 30, sh + 235, bx1, YF + 330, sh + 270); a.rect(bx0, YF + 30, bx1, YF + 330, 'EQUIP-DETAIL');
      a.box(sd === 'L' ? X0 + 15 : X1 - 60, YF + 330, sh + 200, sd === 'L' ? X0 + 60 : X1 - 15, YF + 360, sh + 270);
    }
  }
  if (o.foot) { a.box(X0 + 100, YF + 10, Z0, X1 - 100, YF + 300, Z0 + 60); a.rect(X0 + 100, YF + 10, X1 - 100, YF + 300, 'EQUIP-DETAIL'); }
}
P({ cat: 'furniture/seating', title: 'Generic blood-draw chair, clinic',
  desc: (v) => `Padded chair on a column and base plate with a fixed arm rest on one side and ${v.flip === 'both' ? 'a flip-up arm board on each side' : 'a flip-up arm board on the ' + (v.flip === 'L' ? 'left' : 'right')}, a padded back${v.rest ? ' with a headrest' : ''}${v.foot ? ' and a floor footrest' : ''}.`,
  vs: [
    ['flip arm on left', 28, 34, 44, 0, { flip: 'L' }],
    ['flip arm on right', 28, 34, 44, 0, { flip: 'R' }],
    ['flip arms on both sides', 30, 34, 44, 0, { flip: 'both' }],
    ['flip arm, footrest', 28, 38, 44, 0, { flip: 'L', foot: true }],
    ['flip arm, headrest, tall back', 28, 34, 50, 0, { flip: 'R', rest: true }] ],
  build: (a, v) => { drawChair(a, v); a.log('Added the base plate and column, the padded seat and back, the fixed arm and the flip-up arm board or boards (plan and 3D).'); } });

P({ cat: 'furniture/storage', title: 'Generic patient wardrobe, ward room',
  desc: (v) => v.rail ? 'Open wardrobe bay with a hanging rail and a shelf above it, on a plinth.' : `Floor-standing wardrobe, ${v.w} by ${v.d} in: ${cnt(v.doors, 'door', 'doors')}${v.dr ? ` over ${cnt(v.dr, 'drawer', 'drawers')}` : ''}, recessed pulls and a toe kick.`,
  vs: [
    ['single door, 18 in', 18, 22, 72, 0, { doors: 1 }],
    ['two doors, 30 in', 30, 22, 72, 0, { doors: 2 }],
    ['door over drawer, 24 in', 24, 22, 72, 0, { doors: 1, dr: 1 }],
    ['open bay with hanging rail, 24 in', 24, 22, 72, 0, { rail: true }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a;
    if (v.rail) { cab(a, { toe: 90, open: true, shelves: 0, pull: 'none' }); a.xcyl(X0 + T, X1 - T, YF + 220, Z1 - 330, 12, 10); a.box(X0 + T, YF + 20, Z1 - 250, X1 - T, YB - T, Z1 - 250 + T); for (const x of [cx - 100, cx, cx + 100]) a.box(x - 3, YF + 200, Z1 - 460, x + 3, YF + 240, Z1 - 330); }
    else cab(a, { toe: 90, doors: v.doors, drawers: v.dr ?? 0, drawerH: v.dr ? 200 : 0, pull: 'recess', swing: true });
    a.log('Added the toe kick, the carcass, the door or doors with pulls and any drawer, shelf or hanging rail (plan and 3D).');
  } });

/** Three- or four-panel privacy screen on casters: framed panels with a curtain band and an open mesh band at the top. */
function wardScreen(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, cy } = a, pw = W / o.n, amp = o.n === 1 ? 0 : 150, th = 30;
  a.outline('EQUIP-HIDDEN');
  for (let i = 0; i < o.n; i++) {
    const xa = X0 + pw * i + 8, xb = X0 + pw * (i + 1) - 8, ya = cy + (i % 2 ? amp / 2 : -amp / 2), yb = cy + (i % 2 ? -amp / 2 : amp / 2);
    const dx = xb - xa, dy = yb - ya, L = Math.hypot(dx, dy), nx = -dy / L * th / 2, ny = dx / L * th / 2;
    const quad = (t, u0, u1) => { const ax = xa + dx * u0, ay = ya + dy * u0, bx = xa + dx * u1, by = ya + dy * u1; return [[ax - nx * t, ay - ny * t], [bx - nx * t, by - ny * t], [bx + nx * t, by + ny * t], [ax + nx * t, ay + ny * t]]; };
    a.prism(quad(1, 0, 1), Z0 + 220, Z1 - 420); a.prism(quad(1.5, 0, 1), Z1 - 60, Z1); a.prism(quad(1.5, 0, 1), Z0 + 160, Z0 + 220);
    for (const u of [0, 1]) a.prism(quad(1.5, Math.max(0, u - 0.03), Math.min(1, u + 0.03)), Z0 + 160, Z1);
    const nb = Math.max(3, Math.round(L / 120)); for (let k = 1; k < nb; k++) { const u = k / nb; a.prism(quad(0.5, u - 0.006, u + 0.006), Z1 - 420, Z1 - 60); }
    a.poly(quad(1.5, 0, 1));
    for (const u of [0.05, 0.95]) a.caster(xa + dx * u, ya + dy * u, 130);
  }
}
P({ cat: 'furniture/other', title: 'Generic ward privacy screen on casters',
  desc: (v) => `Free-standing ${cnt(v.n, 'panel', 'panels')} screen in a zigzag on casters: a framed solid curtain band with an open vertical-bar band at the top, ${v.h} in high.`,
  vs: [
    ['single panel, 3 ft', 36, 6, 70, 0, { n: 1 }],
    ['two panels, 4 ft', 48, 14, 70, 0, { n: 2 }],
    ['three panels, 6 ft', 72, 14, 70, 0, { n: 3 }],
    ['four panels, 8 ft', 96, 14, 70, 0, { n: 4 }] ],
  build: (a, v) => { wardScreen(a, v); a.log('Added each framed panel with its curtain band, bar band, top and bottom rails and casters (plan and 3D).'); } });

/** Infant cot (barred sides) or bassinet (tub on a stand). */
function infantCot(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a;
  a.outline();
  if (o.kind === 'cot') {
    const mz = Z0 + o.deck;
    caseBase(a, { inx: 70, iny: 70, top: 130, bot: 80, cas: 110 });
    a.box(X0 + 20, YF + 20, mz - 60, X1 - 20, YB - 20, mz); a.box(X0 + 30, YF + 30, mz, X1 - 30, YB - 30, mz + 90); a.rect(X0 + 30, YF + 30, X1 - 30, YB - 30, 'EQUIP-DETAIL');
    for (const x of [X0 + 30, X1 - 30]) { a.cyl(x, YF + 30, Z0 + 130, Z1, 16, 8); a.cyl(x, YB - 30, Z0 + 130, Z1, 16, 8); }
    a.box(X0 + 25, YF + 22, mz + 120, X1 - 25, YF + 38, Z1 - 60); a.box(X0 + 25, YB - 38, mz + 120, X1 - 25, YB - 22, Z1 - 60);
    for (const [x, hi] of [[X0 + 30, false], [X1 - 30, true]]) {
      const top = o.drop && hi ? mz + 250 : Z1, bot = mz + 60;
      a.ycyl(YF + 30, YB - 30, x, top, 10, 8); a.ycyl(YF + 30, YB - 30, x, bot, 10, 8);
      const nb = Math.round((D - 100) / 80); for (let i = 1; i < nb; i++) a.cyl(x, YF + 30 + ((D - 60) * i) / nb, bot, top, 6, 6);
      a.rect(x - 10, YF + 30, x + 10, YB - 30, 'EQUIP-DETAIL');
    }
  } else {
    caseBase(a, { inx: 60, iny: 50, top: 100, bot: 60, cas: 100 });
    for (const y of [YF + D * 0.25, YB - D * 0.25]) a.box(cx - 25, y - 25, Z0 + 100, cx + 25, y + 25, Z0 + o.deck - 40);
    const bz = Z0 + o.deck;
    a.box(X0 + 20, YF + 25, bz - 40, X1 - 20, YB - 25, bz); a.box(X0 + 50, YF + 60, bz, X1 - 50, YB - 60, bz + 60);
    for (const x of [X0 + 25, X1 - 25 - 25]) a.box(x, YF + 25, bz, x + 25, YB - 25, bz + 200);
    for (const y of [YF + 25, YB - 50]) a.box(X0 + 25, y, bz, X1 - 25, y + 25, bz + 200);
    a.rect(X0 + 50, YF + 60, X1 - 50, YB - 60, 'EQUIP-DETAIL'); a.rect(X0 + 25, YF + 25, X1 - 25, YB - 25, 'EQUIP-DETAIL');
    if (o.shelf) { a.box(X0 + 60, YF + 70, Z0 + 230, X1 - 60, YB - 70, Z0 + 250); a.rect(X0 + 60, YF + 70, X1 - 60, YB - 70, 'EQUIP-HIDDEN'); }
  }
}
P({ cat: 'furniture/beds', title: 'Generic infant cot, hospital nursery',
  desc: (v) => v.kind === 'cot' ? `Barred cot on four casters, ${v.w} by ${v.d} in, with a mattress and bars on both long sides${v.drop ? ' (one side dropped to a low rail)' : ''}.` : `Infant bassinet: a four-wall tub on a column-and-base stand with casters${v.shelf ? ' and a lower shelf' : ''}, ${v.w} by ${v.d} in.`,
  vs: [
    ['barred cot, raised sides', 24, 40, 42, 0, { kind: 'cot', deck: 380 }],
    ['barred cot, one side dropped', 24, 40, 42, 0, { kind: 'cot', deck: 380, drop: true }],
    ['bassinet on stand', 18, 34, 38, 0, { kind: 'bass', deck: 650 }],
    ['bassinet on stand with lower shelf', 20, 36, 38, 0, { kind: 'bass', deck: 650, shelf: true }] ],
  build: (a, v) => { infantCot(a, v); a.log('Added the casters and base, the mattress or tub, the bars or walls and any lower shelf (plan and 3D).'); } });

/** Rolling procedure stool: five-star caster base, column, round seat, optional back and foot ring. */
function procStool(a, o) {
  const { Z0, Z1, cx, cy, W } = a, sh = Z0 + o.sh, r = W / 2 - 25;
  a.outline('EQUIP-HIDDEN'); a.circ(cx, cy, r);
  FU.star(a, cx, cy, Z0, r * 0.95, 5);
  a.cone(cx, cy, Z0 + 90, sh - 55, 24, 20, 12); a.cyl(cx, cy, Z0 + 70, Z0 + 100, 55, 12);
  a.cyl(cx, cy, sh - 55, sh - 30, 90, 14); a.ell(cx, cy, sh - 22, r * 0.7, r * 0.7, 40, 16, 5); a.circ(cx, cy, r * 0.7, 'EQUIP-DETAIL');
  if (o.ring) { a.tube([[cx, cy, Z0 + o.sh * 0.5], [cx, cy, Z0 + o.sh * 0.5 + 4]], [r * 0.6, r * 0.6], 20); a.circ(cx, cy, r * 0.6, 'EQUIP-DETAIL'); for (const g of [0.8, 2.3, 3.9, 5.4]) a.tube([[cx + Math.cos(g) * r * 0.25, cy + Math.sin(g) * r * 0.25, Z0 + o.sh * 0.5], [cx + Math.cos(g) * r * 0.6, cy + Math.sin(g) * r * 0.6, Z0 + o.sh * 0.5]], [6, 6], 6); }
  if (o.back) { a.tube([[cx, cy + r * 0.62, sh - 10], [cx, cy + r * 0.8, sh + 200]], [14, 14], 8); a.ell(cx, cy + r * 0.82, sh + 230, r * 0.6, 22, 60, 12, 5); }
}
P({ cat: 'furniture/seating', title: 'Generic procedure stool, clinic room',
  desc: (v) => `Rolling stool on a five-star caster base and a column, with a padded round seat${v.back ? ', a back rest on a post' : ''}${v.ring ? ' and a foot ring' : ''}; seat height ${Math.round(v.sh / IN)} in.`,
  vs: [
    ['low, backless, 16 in', 20, 20, 17, 0, { sh: 16 * IN }],
    ['mid, backless, 20 in', 20, 20, 21, 0, { sh: 20 * IN }],
    ['mid, with back, 20 in', 22, 22, 32, 0, { sh: 20 * IN, back: true }],
    ['tall, with back and foot ring, 26 in', 24, 24, 35, 0, { sh: 26 * IN, back: true, ring: true }] ],
  build: (a, v) => { procStool(a, v); a.log('Added the five-star base with casters, the column, the padded seat and any back or foot ring (plan and 3D).'); } });

// ================================================================ CONSTRUCTION SITE
/** Steel site-cabin desk: top, drawer pedestal(s), leg panel, modesty panel and an optional return. o.dr drawers per pedestal · o.ped L|R|2 · o.ret (return depth mm) */
function siteDesk(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, tt = 32, dm = o.ret ? 760 : D, y0 = YB - dm, zt = Z1 - tt;
  a.outline();
  a.box(X0, y0, zt, X1, YB, Z1); a.rect(X0, y0, X1, YB); a.rect(X0 + 10, y0 + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL');
  const peds = o.ped === '2' ? ['L', 'R'] : [o.ped], pw = Math.min(420, W * 0.34);
  for (const sd of ['L', 'R']) {
    const px0 = sd === 'L' ? X0 + 30 : X1 - 30 - pw, px1 = px0 + pw;
    if (peds.includes(sd)) {
      a.box(px0, y0 + 50, Z0 + 40, px1, YB - 30, zt); a.box(px0, y0 + 50, Z0, px1, YB - 30, Z0 + 40); a.rect(px0, y0 + 50, px1, YB - 30, 'EQUIP-HIDDEN');
      const rh = (zt - Z0 - 70) / o.dr;
      for (let i = 0; i < o.dr; i++) { const z1 = zt - 15 - i * rh, z0 = z1 - rh + 10; a.box(px0 + 10, y0 + 30, z0, px1 - 10, y0 + 50, z1); a.box((px0 + px1) / 2 - 60, y0 + 18, (z0 + z1) / 2 - 6, (px0 + px1) / 2 + 60, y0 + 30, (z0 + z1) / 2 + 6); }
    } else { a.box(px0 + (sd === 'L' ? 0 : pw - 30), y0 + 60, Z0, px0 + (sd === 'L' ? 30 : pw), YB - 40, zt); }
  }
  a.box(X0 + 60, YB - 45, Z0 + 200, X1 - 60, YB - 25, zt - 20);
  if (o.ret) { a.box(X0, YF, zt, X0 + 700, y0, Z1); a.rect(X0, YF, X0 + 700, y0); a.box(X0 + 10, YF + 20, Z0, X0 + 50, YF + 60, zt); a.box(X0 + 650, YF + 20, Z0, X0 + 690, YF + 60, zt); a.box(X0 + 10, YF + 20, zt - 80, X0 + 690, YF + 40, zt); }
}
P({ cat: 'furniture/desks', title: 'Generic site office desk, steel pedestal',
  desc: (v) => `Site-office desk, ${v.w} by ${v.d} in, with a laminate top, ${v.ped === '2' ? 'two' : 'one'} ${v.dr}-drawer steel ${v.ped === '2' ? 'pedestals' : 'pedestal'}, a leg panel on the open side and a modesty panel${v.ret ? ', and a return on the left' : ''}.`,
  vs: [
    ['48 by 24 in, 2 drawers', 48, 24, 29, 0, { ped: 'R', dr: 2 }],
    ['60 by 30 in, 3 drawers', 60, 30, 29, 0, { ped: 'R', dr: 3 }],
    ['60 by 30 in, pedestal each side', 60, 30, 29, 0, { ped: '2', dr: 3 }],
    ['72 by 30 in, 2 pedestals', 72, 30, 29, 0, { ped: '2', dr: 2 }],
    ['60 by 60 in, with return', 60, 60, 29, 0, { ped: 'R', dr: 3, ret: true }] ],
  build: (a, v) => { siteDesk(a, v); a.log('Added the top, the drawer pedestals with fronts and handles, the leg panel, the modesty panel and any return (plan and 3D).'); } });

/** Rugged meeting table: plank top on steel H-trestles with floor feet and a stretcher; optional drawing-roll shelf. */
function siteTable(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, tt = 45;
  a.outline(); a.box(X0, YF, Z1 - tt, X1, YB, Z1); a.rect(X0 + 12, YF + 12, X1 - 12, YB - 12, 'EQUIP-DETAIL');
  const np = Math.round(D / 150); for (let i = 1; i < np; i++) a.line(X0, YF + (D * i) / np, X1, YF + (D * i) / np, 'EQUIP-DETAIL');
  const xs = Array.from({ length: o.tr }, (_, i) => X0 + 220 + ((W - 440) * i) / (o.tr - 1));
  for (const x of xs) {
    for (const y of [YF + 110, YB - 160]) a.box(x - 25, y, Z0 + 40, x + 25, y + 50, Z1 - tt);
    a.box(x - 25, YF + 110, Z1 - tt - 60, x + 25, YB - 110, Z1 - tt); a.box(x - 35, YF + 70, Z0, x + 35, YB - 70, Z0 + 40); a.rect(x - 35, YF + 70, x + 35, YB - 70, 'EQUIP-HIDDEN');
  }
  a.box(xs[0], YB - 150, Z0 + 250, xs[xs.length - 1], YB - 120, Z0 + 300);
  if (o.shelf) { a.box(xs[0], YF + 140, Z0 + 230, xs[xs.length - 1], YB - 140, Z0 + 250); a.rect(xs[0], YF + 140, xs[xs.length - 1], YB - 140, 'EQUIP-HIDDEN'); }
}
P({ cat: 'furniture/tables', title: 'Generic site meeting table, trestle',
  desc: (v) => `Plank-top meeting table ${v.w / 12} ft by ${v.d} in on ${v.tr} steel H-trestles with floor feet and a back stretcher${v.shelf ? ' and a full-length lower shelf for rolled drawings' : ''}.`,
  vs: [
    ['6 ft by 30 in', 72, 30, 30, 0, { tr: 2 }],
    ['8 ft by 30 in', 96, 30, 30, 0, { tr: 2 }],
    ['10 ft by 36 in, lower shelf', 120, 36, 30, 0, { tr: 3, shelf: true }],
    ['12 ft by 36 in, lower shelf', 144, 36, 30, 0, { tr: 3, shelf: true }],
    ['16 ft by 42 in, 4 trestles', 192, 42, 30, 0, { tr: 4, shelf: true }] ],
  build: (a, v) => { siteTable(a, v); a.log('Added the plank top, the H-trestles with feet, the stretcher and any lower shelf (plan and 3D).'); } });

P({ cat: 'furniture/tables', title: 'Generic site canteen table with fixed benches',
  desc: (v) => `Rugged canteen table ${v.w / 12} ft long with two ${v.bd}-in-deep benches on steel cantilever arms from the table legs, plank top and plank seats${v.fold ? ', with a centre fold hinge line drawn on the top' : ''}.`,
  vs: [
    ['6 ft', 72, 60, 30, 0, { bd: 11 }],
    ['8 ft', 96, 60, 30, 0, { bd: 11 }],
    ['10 ft', 120, 62, 30, 0, { bd: 12 }],
    ['8 ft, with fold hinge', 96, 60, 30, 0, { bd: 11, fold: true }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a, tt = 45, bd = v.bd * IN, sh = Z0 + 440;
    a.outline(); a.box(X0 + 20, cy - 380, Z1 - tt, X1 - 20, cy + 380, Z1); a.rect(X0 + 20, cy - 380, X1 - 20, cy + 380);
    for (let i = 1; i < 5; i++) a.line(X0 + 20, cy - 380 + (760 * i) / 5, X1 - 20, cy - 380 + (760 * i) / 5, 'EQUIP-DETAIL');
    if (v.fold) a.line(cx, cy - 380, cx, cy + 380, 'EQUIP-DETAIL');
    for (const s of [-1, 1]) { const y0 = s < 0 ? YF + 10 : YB - 10 - bd, y1 = y0 + bd; a.box(X0, y0, sh - 40, X1, y1, sh); a.rect(X0, y0, X1, y1, 'EQUIP-DETAIL'); }
    for (const x of [X0 + 170, X1 - 170 - 50]) {
      a.box(x, cy - 330, Z0 + 30, x + 50, cy + 330, Z1 - tt); a.box(x - 60, cy - 330, Z0, x + 110, cy + 330, Z0 + 30); a.rect(x - 60, cy - 330, x + 110, cy + 330, 'EQUIP-HIDDEN');
      for (const s of [-1, 1]) { const ya = cy + s * 330, yb = s < 0 ? YF + 10 + bd / 2 : YB - 10 - bd / 2; a.box(x, Math.min(ya, yb) - 25, sh - 90, x + 50, Math.max(ya, yb) + 25, sh - 40); a.box(x + 5, yb - 25, Z0 + 30, x + 45, yb + 25, sh - 90); }
    }
    a.log('Added the plank top, the two plank benches, the table legs with floor plates and the bench arms (plan and 3D).');
  } });

P({ cat: 'furniture/seating', title: 'Generic stacking chair, site office',
  desc: (v) => `Stacking chair with four tubular steel legs, a plastic-style seat pan and back panel${v.arms ? ', and tube arms' : ''}${v.stool ? ' on a stool frame without a back' : ''}.`,
  vs: [
    ['steel frame, seat and back panel', 17, 19, 33, 0, {}],
    ['steel frame, with arms', 21, 21, 33, 0, { arms: true }],
    ['stacking stool, 24 in', 15, 15, 24, 0, { stool: true }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a, sh = Z0 + (v.stool ? 24 * IN - 20 : 450);
    a.outline();
    for (const x of [X0 + 25, X1 - 25]) {
      a.tube([[x, YF + 35, Z0], [x, YF + 55, sh - 25]], [9, 9], 8); a.circ(x, YF + 35, 10, 'EQUIP-HIDDEN');
      if (!v.stool) a.tube([[x, YB - 70, Z0], [x, YB - 60, sh - 20], [x, YB - 40, Z1 - 30]], [9, 9, 9], 8); else a.tube([[x, YB - 40, Z0], [x, YB - 50, sh - 25]], [9, 9], 8);
      a.tube([[x, YF + 50, sh - 30], [x, YB - 60, sh - 30]], [8, 8], 6);
      if (v.arms) a.tube([[x, YF + 80, sh + 190], [x, YB - 60, sh + 190]], [9, 9], 6);
      a.circ(x, YB - 60, 10, 'EQUIP-HIDDEN');
    }
    a.xcyl(X0 + 25, X1 - 25, YF + 130, Z0 + 180, 7, 6);
    a.box(X0 + 15, YF + 20, sh - 30, X1 - 15, YB - 50, sh + 12); a.rect(X0 + 15, YF + 20, X1 - 15, YB - 50, 'EQUIP-DETAIL');
    if (!v.stool) { a.box(X0 + 30, YB - 70, sh + 130, X1 - 30, YB - 50, Z1 - 30); a.rect(X0 + 30, YB - 70, X1 - 30, YB - 50, 'EQUIP-DETAIL'); }
    a.log('Added the tubular legs and stretchers, the seat pan and any back panel or arms (plan and 3D).');
  } });

/** Drawing table: tubular frame and a top set flat or tilted (front edge low, with a ledge). */
function planTable(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, zf = Z0 + o.zf, rise = (D - 80) * Math.tan(deg(o.tilt)), tt = 40;
  a.outline();
  a.box(X0, YF, zf, X0 + 1, YF + 1, zf + 1);
  slab(a, X0 + 20, X1 - 20, YF + 30, zf, YB - 40, zf + rise, tt);
  a.rect(X0 + 20, YF + 30, X1 - 20, YB - 40, 'EQUIP'); a.rect(X0 + 40, YF + 50, X1 - 40, YB - 60, 'EQUIP-DETAIL');
  if (o.tilt) a.box(X0 + 20, YF + 10, zf + tt - 5, X1 - 20, YF + 40, zf + tt + 35);
  for (const x of [X0 + 70, X1 - 70]) {
    a.box(x - 20, YF + 80, Z0, x + 20, YF + 120, zf - 10); a.box(x - 20, YB - 120, Z0, x + 20, YB - 80, zf + rise - 10); a.box(x - 20, YF + 80, Z0 + 150, x + 20, YB - 80, Z0 + 190);
    a.rect(x - 20, YF + 80, x + 20, YB - 80, 'EQUIP-HIDDEN');
  }
  a.box(X0 + 70, YF + 80, Z0 + 150, X1 - 70, YF + 120, Z0 + 190);
  if (o.dr) { a.box(X0 + 140, YF + 130, zf - 150, X1 - 140, YB - 130, zf - 10); a.box(X0 + 160, YF + 100, zf - 130, X1 - 160, YF + 130, zf - 30); a.box(a.cx - 60, YF + 90, zf - 85, a.cx + 60, YF + 100, zf - 75); }
}
P({ cat: 'furniture/desks', title: 'Generic site drawing table, plan table',
  desc: (v) => `Drawing table, ${v.w} by ${v.d} in, with a tubular steel frame and lower rail and a top ${v.tilt ? `tilted ${v.tilt} degrees with a front ledge` : 'set flat'}${v.dr ? ', and a shallow sheet drawer under the top' : ''}.`,
  vs: [
    ['flat top, 36 by 60 in', 60, 36, 36, 0, { zf: 36 * IN - 40, tilt: 0 }],
    ['flat top with sheet drawer, 36 by 60 in', 60, 36, 36, 0, { zf: 36 * IN - 40, tilt: 0, dr: true }],
    ['top tilted 15 degrees, 30 by 48 in', 48, 30, 40, 0, { zf: 30 * IN, tilt: 15 }],
    ['top tilted 30 degrees, 36 by 60 in', 60, 36, 52, 0, { zf: 30 * IN, tilt: 30 }] ],
  build: (a, v) => { planTable(a, v); a.log('Added the top, any front ledge, the four frame legs with rails and the sheet drawer if listed (plan and 3D).'); } });

P({ cat: 'furniture/storage', title: 'Generic site roll storage rack, drawing store',
  desc: (v) => `Pigeonhole rack of ${v.cols} by ${v.rows} (${v.cols * v.rows}) round roll slots with a rolled sheet in each, on a plinth with a back panel.`,
  vs: [
    ['3 by 4 slots', 19, 24, 24, 0, { cols: 3, rows: 4 }],
    ['4 by 6 slots', 24, 24, 34, 0, { cols: 4, rows: 6 }],
    ['6 by 5 slots', 34, 24, 29, 0, { cols: 6, rows: 5 }],
    ['6 by 8 slots', 34, 24, 44, 0, { cols: 6, rows: 8 }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, pl = 80, cw = (W - 60) / v.cols, rh = (Z1 - Z0 - pl - 30) / v.rows;
    a.outline(); a.box(X0, YF + 30, Z0, X1, YB, Z0 + pl); a.box(X0 + 30, YB - 20, Z0 + pl, X1 - 30, YB, Z1 - 15);
    for (let i = 0; i <= v.cols; i++) a.box(X0 + 30 + i * cw - 8, YF + 30, Z0 + pl, X0 + 30 + i * cw + 8, YB - 20, Z1 - 15);
    for (let j = 0; j <= v.rows; j++) a.box(X0 + 30, YF + 30, Z0 + pl + j * rh - 8, X1 - 30, YB - 20, Z0 + pl + j * rh + 8);
    for (let i = 0; i < v.cols; i++) for (let j = 0; j < v.rows; j++) { const x = X0 + 30 + (i + 0.5) * cw, z = Z0 + pl + (j + 0.5) * rh; a.ycyl(YF + 70, YB - 40, x, z, Math.min(cw, rh) * 0.36, 10); a.circ(x, YF + 45, Math.min(cw, rh) * 0.36, 'EQUIP-DETAIL'); }
    a.rect(X0 + 30, YF + 30, X1 - 30, YB - 20, 'EQUIP-DETAIL');
    a.log('Added the plinth, the back panel, the divider grid and a rolled sheet in each slot (plan and 3D).');
  } });

P({ cat: 'furniture/storage', title: 'Generic site welfare locker with bench',
  desc: (v) => `Steel locker bank of ${cnt(v.n, 'door', 'doors')} (vented, with latch plates) with a plank bench in front on two steel frames and ${v.shelf ? 'a slatted boot shelf under it' : 'an open floor underneath'}${v.hooks ? ', and a coat hook rail on the side' : ''}.`,
  vs: [
    ['one door, 18 in wide', 18, 42, 72, 0, { n: 1, shelf: true }],
    ['two doors, 30 in wide', 30, 42, 72, 0, { n: 2, shelf: true }],
    ['three doors, 45 in wide, boot shelf', 45, 42, 72, 0, { n: 3, shelf: true }],
    ['two doors, 30 in wide, hook rail', 30, 42, 72, 0, { n: 2, shelf: false, hooks: true }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, ld = 450, y0 = YB - ld, base = Z0 + 100, top = Z1 - 50;
    a.outline(); a.box(X0, y0, Z0, X1, YB, base); a.box(X0, y0, base, X1, YB, top); a.prism([[X0, y0], [X1, y0], [X1, YB], [X0, YB]], top, Z1 - 20); a.box(X0, y0 + 40, Z1 - 20, X1, YB, Z1);
    const cw = W / v.n;
    for (let c = 0; c < v.n; c++) { const x0 = X0 + c * cw + 3, x1 = X0 + (c + 1) * cw - 3; a.box(x0, y0 - 5, base + 3, x1, y0, top - 3); for (let k = 0; k < 4; k++) a.box(x0 + 30, y0 - 9, top - 140 + k * 22, x1 - 30, y0 - 5, top - 132 + k * 22); a.box(x1 - 60, y0 - 10, base + (top - base) / 2, x1 - 35, y0 - 5, base + (top - base) / 2 + 60); a.line(x0, y0 - 5, x0, y0, 'EQUIP-DETAIL'); }
    a.rect(X0, y0 - 5, X1, y0, 'EQUIP-DETAIL');
    const by0 = YF + 20, by1 = y0 - 60, bz = Z0 + 450;
    a.box(X0 + 10, by0, bz - 40, X1 - 10, by1, bz); a.rect(X0 + 10, by0, X1 - 10, by1, 'EQUIP-DETAIL');
    for (const x of [X0 + 70, X1 - 70]) { a.box(x - 20, by0 + 30, Z0, x + 20, by0 + 60, bz - 40); a.box(x - 20, by1 - 60, Z0, x + 20, by1 - 30, bz - 40); a.box(x - 20, by0 + 30, Z0, x + 20, by1 - 30, Z0 + 25); }
    if (v.shelf) for (let i = 0; i < 5; i++) { const y = by0 + 60 + i * ((by1 - by0 - 120) / 4); a.box(X0 + 90, y - 12, Z0 + 180, X1 - 90, y + 12, Z0 + 195); }
    if (v.hooks) { a.box(X1 - 10, y0 - 120, base + 400, X1, y0 - 100, base + 900); for (let k = 0; k < 4; k++) a.tube([[X1, y0 - 110, base + 450 + k * 120], [X1 - 8, y0 - 110, base + 450 + k * 120]], [8, 8], 6); }
    a.log('Added the plinth, the vented locker doors with latch plates, the sloped top, the bench frames and planks, and any boot shelf or hook rail (plan and 3D).');
  } });

P({ cat: 'furniture/storage', title: 'Generic site drying room rack',
  desc: (v) => v.pegs ? `Boot rack of ${v.pegs} angled peg pairs on a plank base with end frames and a back rail, for site welfare rooms.` : `Clothing drying rack, ${v.w / 12} ft wide: steel end frames with floor feet and ${v.rails} hanging rails${v.two ? ' reaching both sides' : ' against the wall'}, with hooks along each rail.`,
  vs: [
    ['wall rack, 4 ft, 3 rails', 48, 14, 72, 0, { rails: 3 }],
    ['free-standing, 6 ft, 4 rails, two sides', 72, 30, 72, 0, { rails: 4, two: true }],
    ['boot rack, 6 pairs', 36, 16, 14, 0, { pegs: 6 }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a;
    a.outline();
    if (v.pegs) {
      a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0, YB - 40, Z0 + 60, X1, YB, Z1);
      for (let i = 0; i < v.pegs; i++) { const x = X0 + (W * (i + 0.5)) / v.pegs; a.tube([[x, YB - 40, Z0 + 100], [x, YF + 100, Z0 + 270]], [14, 11], 8); a.circ(x, YF + 100, 11, 'EQUIP-DETAIL'); }
      a.rect(X0, YB - 40, X1, YB, 'EQUIP-DETAIL');
    } else {
      const zs = Array.from({ length: v.rails }, (_, i) => Z0 + 500 + ((Z1 - Z0 - 560) * i) / (v.rails - 1));
      for (const x of [X0 + 25, X1 - 25]) {
        if (v.two) { a.box(x - 20, cy - 20, Z0 + 40, x + 20, cy + 20, Z1); a.box(x - 25, YF + 40, Z0, x + 25, YB - 40, Z0 + 40); a.rect(x - 25, YF + 40, x + 25, YB - 40, 'EQUIP-HIDDEN'); }
        else { a.box(x - 20, YB - 50, Z0, x + 20, YB - 10, Z1); a.box(x - 20, YF + 40, Z0, x + 20, YF + 80, Z0 + 40); a.box(x - 20, YF + 60, Z0, x + 20, YB - 10, Z0 + 40); }
      }
      for (const z of zs) { a.xcyl(X0 + 25, X1 - 25, v.two ? cy : YB - 30, z, 13, 8); for (let k = 1; k < 8; k++) { const x = X0 + 25 + ((W - 50) * k) / 8; if (v.two) { a.tube([[x, cy, z + 10], [x, cy - 120, z + 70]], [6, 6], 5); a.tube([[x, cy, z + 10], [x, cy + 120, z + 70]], [6, 6], 5); } else a.tube([[x, YB - 30, z + 10], [x, YB - 140, z + 60]], [6, 6], 5); } }
      a.line(X0 + 25, v.two ? cy : YB - 30, X1 - 25, v.two ? cy : YB - 30, 'EQUIP-DETAIL');
    }
    a.log('Added the end frames and feet, the hanging rails or boot pegs and the hooks (plan and 3D).');
  } });

P({ cat: 'furniture/storage', title: 'Generic site office steel cupboard',
  desc: (v) => `Steel cupboard, ${v.w} by ${v.d} in, ${v.h} in high: ${cnt(v.doors, 'door', 'doors')} with recessed pulls and lock plates${v.dr ? ` over ${cnt(v.dr, 'drawer', 'drawers')}` : ''}, a plinth and a flat top.`,
  vs: [
    ['two doors, 36 by 18 in', 36, 18, 72, 0, { doors: 2 }],
    ['two doors over two drawers, 36 in', 36, 18, 72, 0, { doors: 2, dr: 2 }],
    ['four doors, 48 by 18 in', 48, 18, 72, 0, { doors: 4 }],
    ['low cupboard, 36 by 18 in, 36 in high', 36, 18, 36, 0, { doors: 2 }] ],
  build: (a, v) => { cab(a, { toe: 80, doors: v.doors, drawers: v.dr ?? 0, drawerH: v.dr ? 360 : 0, pull: 'recess', lock: true, swing: true }); a.log('Added the plinth, the carcass, the doors with recessed pulls and lock plates and any drawers (plan and 3D).'); } });

P({ cat: 'furniture/tables', title: 'Generic site workshop bench, steel and plank',
  desc: (v) => `Workbench ${v.w} by ${v.d} in: a thick plank top, a steel leg frame with a lower shelf, a perforated back board and ${v.vise ? 'a bench vise on the right front corner' : 'no vise'}${v.dr ? ' and a three-drawer unit under the left end' : ''}.`,
  vs: [
    ['48 by 24 in', 48, 24, 54, 0, { vise: true }],
    ['72 by 24 in', 72, 24, 54, 0, { vise: true }],
    ['96 by 30 in', 96, 30, 54, 0, { vise: true }],
    ['72 by 24 in, drawers', 72, 24, 54, 0, { vise: true, dr: true }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D } = a, zt = Z0 + 36 * IN, tt = 60;
    a.outline(); a.box(X0, YF, zt - tt, X1, YB - 40, zt); a.rect(X0, YF, X1, YB - 40); a.rect(X0 + 12, YF + 12, X1 - 12, YB - 52, 'EQUIP-DETAIL');
    for (const x of [X0 + 50, X1 - 50]) for (const y of [YF + 60, YB - 100]) { a.box(x - 20, y - 20, Z0, x + 20, y + 20, zt - tt); a.rect(x - 20, y - 20, x + 20, y + 20, 'EQUIP-HIDDEN'); }
    a.box(X0 + 30, YF + 40, zt - tt - 60, X1 - 30, YB - 80, zt - tt);
    a.box(X0 + 70, YF + 80, Z0 + 220, X1 - 70, YB - 120, Z0 + 245); a.rect(X0 + 70, YF + 80, X1 - 70, YB - 120, 'EQUIP-HIDDEN');
    a.box(X0, YB - 40, zt, X1, YB, Z1);
    for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) a.box(X0 + 120 + ((W - 240) * i) / 11 - 8, YB - 44, zt + 120 + j * 120, X0 + 120 + ((W - 240) * i) / 11 + 8, YB - 40, zt + 136 + j * 120);
    if (v.vise) { a.box(X1 - 260, YF - 0, zt, X1 - 60, YF + 160, zt + 90); a.box(X1 - 180, YF + 50, zt + 90, X1 - 140, YF + 110, zt + 120); a.ycyl(YF + 5, YF + 120, X1 - 160, zt + 55, 12, 8); a.rect(X1 - 260, YF, X1 - 60, YF + 160, 'EQUIP-DETAIL'); }
    if (v.dr) { a.box(X0 + 60, YF + 70, Z0 + 150, X0 + 60 + 420, YB - 90, zt - tt - 60); for (let i = 0; i < 3; i++) { const z1 = zt - tt - 80 - i * 170, z0 = z1 - 150; a.box(X0 + 70, YF + 50, z0, X0 + 470, YF + 70, z1); a.box(X0 + 200, YF + 40, (z0 + z1) / 2 - 6, X0 + 340, YF + 50, (z0 + z1) / 2 + 6); } }
    a.log('Added the plank top, the steel legs with lower shelf, the perforated back board, the vise and any drawer unit (plan and 3D).');
  } });

/** Build part of an object inside a sub-box (x0..x1 in mm) with an existing builder, then merge its triangles and plan shapes. */
function mix(a, x0, x1, fn) {
  const sub = new Acc({ x: x0, y: a.YF, z: a.Z0, w: x1 - x0, h: a.H });
  fn(sub);
  a.add(sub.t); for (const p of sub.p) a.p.push(p); for (const c of sub.cl) a.cl.push(c);
}

/** Folding cot: two side rails, X-crossed end legs and a stretched fabric bed, optional foam mattress. */
P({ cat: 'furniture/beds', title: 'Generic folding cot, site welfare room',
  desc: (v) => `Folding cot ${v.w} by ${v.d} in on two tubular side rails with crossed end legs and a stretched fabric bed${v.mat ? ', with a foam mattress on top' : ''}.`,
  vs: [
    ['frame and fabric, 24 in', 24, 74, 17, 0, {}],
    ['with foam mattress, 26 in', 26, 76, 22, 0, { mat: true }],
    ['wide frame with foam mattress, 30 in', 30, 76, 22, 0, { mat: true }],
    ['raised frame, 26 in', 26, 76, 24, 0, { mat: true, hi: true }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a, bz = Z0 + (v.hi ? 460 : 340);
    a.outline();
    for (const x of [X0 + 30, X1 - 30]) a.ycyl(YF + 30, YB - 30, x, bz - 15, 14, 8);
    for (const y of [YF + 40, YB - 40]) { a.tube([[X0 + 40, y, bz - 20], [X1 - 40, y, Z0 + 40]], [11, 11], 6); a.tube([[X1 - 40, y, bz - 20], [X0 + 40, y, Z0 + 40]], [11, 11], 6); a.xcyl(X0 + 30, X1 - 30, y, Z0 + 30, 11, 6); a.line(X0 + 30, y, X1 - 30, y, 'EQUIP-HIDDEN'); }
    a.box(X0 + 22, YF + 30, bz - 10, X1 - 22, YB - 30, bz + 10); a.rect(X0 + 22, YF + 30, X1 - 22, YB - 30, 'EQUIP-DETAIL');
    if (v.mat) { cushion(a, X0 + 30, YF + 40, X1 - 30, YB - 40, bz + 10, bz + 110); a.ell(cx, YB - 150, bz + 130, 200, 120, 40, 10, 4); a.rect(X0 + 30, YF + 40, X1 - 30, YB - 40, 'EQUIP-DETAIL'); }
    a.log('Added the side rails, the crossed end legs, the stretched fabric bed and the foam mattress if listed (plan and 3D).');
  } });

/** Stacked bunk: four posts, n tiers with mattresses, guard rails on the upper tiers and a ladder at one side. */
P({ cat: 'furniture/beds', title: 'Generic site accommodation bunk',
  desc: (v) => `${cnt(v.n, 'tier', 'tiers')} steel bunk, ${v.w} by ${v.d} in, with four corner posts, a mattress on each tier, guard rails on the upper ${v.n === 2 ? 'tier' : 'tiers'} and a ladder at the foot.`,
  vs: [
    ['two tier, 30 in wide', 30, 80, 67, 0, { n: 2 }],
    ['two tier, 36 in wide', 36, 80, 67, 0, { n: 2 }],
    ['three tier, 30 in wide', 30, 80, 88, 0, { n: 3 }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a, pitch = (Z1 - Z0 - 420) / v.n; a.outline();
    for (const [x, y] of [[X0 + 25, YF + 25], [X1 - 25, YF + 25], [X0 + 25, YB - 25], [X1 - 25, YB - 25]]) { a.box(x - 25, y - 25, Z0, x + 25, y + 25, Z1); a.rect(x - 25, y - 25, x + 25, y + 25, 'EQUIP-DETAIL'); }
    for (let i = 0; i < v.n; i++) {
      const z = Z0 + 280 + i * pitch;
      a.box(X0 + 25, YF + 25, z - 90, X1 - 25, YB - 25, z - 50); a.box(X0 + 25, YF + 25, z - 50, X0 + 40, YB - 25, z); cushion(a, X0 + 45, YF + 45, X1 - 45, YB - 45, z - 50, z + 110);
      if (i > 0) { a.box(X0 + 25, YF + 25, z + 100, X1 - 25, YF + 40, z + 330); a.box(X0 + 25, YB - 40, z + 100, X1 - 25, YB - 25, z + 330); a.box(X1 - 40, YF + 25, z + 100, X1 - 25, YB - 25, z + 330 - 140); }
    }
    for (let i = 0; i < 4 * v.n; i++) a.box(X0 + 55, YF + 8, Z0 + 250 + i * (pitch / 3.6), X0 + 150, YF + 24, Z0 + 275 + i * (pitch / 3.6));
    a.rect(X0 + 45, YF + 45, X1 - 45, YB - 45, 'EQUIP-DETAIL');
    a.log('Added the four posts, each tier with its mattress, the guard rails on the upper tiers and the ladder rungs (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic site wall fold-down table',
  desc: (v) => `Wall-fixed table ${v.w} by ${v.d} in, ${v.n} angled steel brackets from a wall rail up to the top, laminate top with an edge band, drawn in the open position.`,
  vs: [['24 by 36 in', 36, 24, 30, 0, { n: 2 }], ['30 by 48 in', 48, 30, 30, 0, { n: 2 }], ['30 by 72 in, 3 brackets', 72, 30, 30, 0, { n: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tt = 32;
    a.outline(); a.box(X0, YF, Z1 - tt, X1, YB - 40, Z1); a.rect(X0, YF, X1, YB - 40); a.rect(X0 + 12, YF + 12, X1 - 12, YB - 52, 'EQUIP-DETAIL');
    a.box(X0, YB - 40, Z1 - 120, X1, YB, Z1);
    for (let i = 0; i < v.n; i++) { const x = X0 + 120 + ((W - 240) * i) / (v.n - 1); a.tube([[x, YB - 30, Z0 + 150], [x, YF + 120, Z1 - tt - 20]], [14, 14], 6); a.box(x - 15, YB - 70, Z1 - tt - 90, x + 15, YB - 40, Z1 - tt); a.box(x - 25, YB - 30, Z0 + 100, x + 25, YB, Z0 + 200); }
    a.log('Added the wall rail, the angled brackets and the edge-banded top (plan and 3D).');
  } });

P({ cat: 'furniture/seating', title: 'Generic site supervisor chair, site office',
  desc: (v) => `Swivel office chair on a five-star caster base: a gas column, a padded seat, ${v.arms ? 'two arms, ' : 'no arms, '}${v.high ? 'a high back' : 'a mid back'}${v.mesh === false ? ' in solid padding' : ' in mesh'}.`,
  vs: [
    ['mid back, with arms', 26, 26, 38, 0, { arms: true, mesh: true }],
    ['mid back, no arms', 24, 25, 38, 0, { arms: false, mesh: true }],
    ['high back, with arms, padded', 27, 27, 44, 0, { high: true, arms: true, mesh: false }] ],
  build: (a, v) => { FU.officeChair(a, v); a.log('Added the star base with casters, the column, the seat, the back and any arms (plan and 3D).'); } });

// ================================================================ MINE CAMP AND CHANGE HOUSE
/** Camp bed: rail frame on legs, mattress, headboard, low footboard, optional drawers under the long sides and a headboard shelf. */
function campBed(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, mz = Z0 + (o.dr ? 420 : 380);
  a.outline();
  if (o.dr) { a.box(X0 + 15, YF + 40, Z0 + 60, X1 - 15, YB - 60, mz - 90); const nd = 2; for (const x of [X0, X1 - 22]) for (let i = 0; i < nd; i++) { const y0 = YF + 60 + i * ((YB - YF - 140) / nd); a.box(x, y0 + 8, Z0 + 80, x + 22, y0 + (YB - YF - 140) / nd - 8, mz - 110); a.box(x - 6, y0 + (YB - YF - 140) / nd / 2 - 60, mz - 200, x + (x < cx ? 0 : 22) + 6 * (x < cx ? 0 : 1), y0 + (YB - YF - 140) / nd / 2 + 60, mz - 180); } a.box(X0 + 5, YF + 20, Z0, X1 - 5, YF + 60, Z0 + 60); a.box(X0 + 5, YB - 60, Z0, X1 - 5, YB - 20, Z0 + 60); }
  else for (const [x, y] of [[X0 + 45, YF + 45], [X1 - 45, YF + 45], [X0 + 45, YB - 45], [X1 - 45, YB - 45]]) { a.box(x - 30, y - 30, Z0, x + 30, y + 30, mz - 90); a.circ(x, y, 30, 'EQUIP-HIDDEN'); }
  a.box(X0 + 10, YF + 20, mz - 100, X1 - 10, YB - 20, mz - 60); cushion(a, X0 + 20, YF + 30, X1 - 20, YB - 60, mz - 60, mz + 110);
  a.box(X0 + 10, YB - 55, mz - 100, X1 - 10, YB - 20, mz + 560); a.rect(X0 + 10, YB - 55, X1 - 10, YB - 20, 'EQUIP-DETAIL');
  a.box(X0 + 10, YF + 20, mz - 100, X1 - 10, YF + 50, mz + 160);
  if (o.shelf) { a.box(X0 + 10, YB - 150, mz + 600, X1 - 10, YB, mz + 630); a.box(X0 + 10, YB - 150, mz + 630, X1 - 10, YB - 135, mz + 700); a.rect(X0 + 10, YB - 150, X1 - 10, YB, 'EQUIP-DETAIL'); }
  a.ell(cx, YB - 250, mz + 130, W * 0.3, 160, 45, 10, 5); a.rect(X0 + 20, YF + 30, X1 - 20, YB - 60, 'EQUIP-DETAIL');
}
P({ cat: 'furniture/beds', title: 'Generic mine camp room bed',
  desc: (v) => `Single bed frame, ${v.w} by ${v.d} in, on ${v.dr ? 'a drawer base with two drawers along each long side' : 'four legs'}, with a mattress, a padded headboard, a low footboard${v.shelf ? ' and a shelf above the headboard' : ''}.`,
  vs: [
    ['single, 36 by 80 in, on legs', 36, 80, 40, 0, {}],
    ['single, 36 by 80 in, drawer base', 36, 80, 40, 0, { dr: true }],
    ['single, 36 by 80 in, headboard shelf', 36, 80, 46, 0, { shelf: true }],
    ['long single, 39 by 84 in, drawer base', 39, 84, 40, 0, { dr: true }],
    ['double, 54 by 80 in, drawer base, shelf', 54, 80, 46, 0, { dr: true, shelf: true }] ],
  build: (a, v) => { campBed(a, v); a.log('Added the legs or drawer base, the rail frame, the mattress, the headboard, the footboard and any shelf (plan and 3D).'); } });

/** Built-in room unit: wardrobe bay on the left, desk bay on the right with an overhead shelf. */
P({ cat: 'furniture/storage', title: 'Generic mine camp wardrobe and desk unit',
  desc: (v) => `Fitted room unit ${v.w} in wide: a ${v.ww} in ${v.wdoors === 1 ? 'single-door' : 'two-door'} wardrobe bay${v.wd ? ' with a drawer under the doors' : ''} beside a desk bay with a top, a side panel and an overhead open shelf with a pin board.`,
  vs: [
    ['60 in', 60, 24, 78, 0, { ww: 24, wdoors: 1 }],
    ['72 in', 72, 24, 78, 0, { ww: 30, wdoors: 2 }],
    ['84 in, wardrobe drawer', 84, 24, 78, 0, { ww: 30, wdoors: 2, wd: true }],
    ['96 in, wardrobe drawer', 96, 24, 84, 0, { ww: 36, wdoors: 2, wd: true }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a, wx = X0 + v.ww * IN;
    a.outline();
    mix(a, X0, wx, (s) => cab(s, { toe: 80, doors: v.wdoors, drawers: v.wd ? 1 : 0, drawerH: v.wd ? 200 : 0, pull: 'recess', swing: false }));
    const dz = Z0 + 29 * IN, dd = YB - YF - 100; 
    a.box(wx, YF, dz - 30, X1, YB, dz); a.rect(wx, YF, X1, YB, 'EQUIP'); a.rect(wx + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL');
    a.box(X1 - 30, YF + 40, Z0, X1, YB - 20, dz - 30); a.box(wx + 20, YB - 40, Z0 + 250, X1 - 40, YB - 20, dz - 30);
    a.box(wx + 20, YF + 40, Z0, wx + 50, YB - 20, dz - 30);
    a.box(wx, YB - 330, Z1 - 520, X1, YB, Z1 - 490); a.box(wx, YB - 330, Z1 - 490, X1, YB - 310, Z1 - 380); a.box(wx, YB - 330, Z1 - 20, X1, YB, Z1);
    a.box(wx, YB - 30, Z1 - 490, X1, YB, Z1 - 20); a.rect(wx, YB - 330, X1, YB, 'EQUIP-HIDDEN');
    a.log('Added the wardrobe bay with doors, the desk top and panels, and the overhead shelf with its back board (plan and 3D).');
  } });

P({ cat: 'furniture/desks', title: 'Generic mine camp study desk',
  desc: (v) => `Fitted desk ${v.w} by ${v.d} in with a laminate top, two side panels, a back rail, ${v.dr ? 'a shallow centre drawer' : 'a knee space'} and a wall shelf above on two brackets.`,
  vs: [['36 by 20 in', 36, 20, 60, 0, {}], ['48 by 24 in, drawer', 48, 24, 60, 0, { dr: true }], ['60 by 24 in, drawer', 60, 24, 60, 0, { dr: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a, zt = Z0 + 29 * IN, tt = 30;
    a.outline(); a.box(X0, YF, zt - tt, X1, YB, zt); a.rect(X0 + 8, YF + 8, X1 - 8, YB - 8, 'EQUIP-DETAIL');
    for (const x of [X0 + 20, X1 - 50]) { a.box(x, YF + 30, Z0, x + 30, YB - 20, zt - tt); a.rect(x, YF + 30, x + 30, YB - 20, 'EQUIP-HIDDEN'); }
    a.box(X0 + 50, YB - 45, Z0 + 200, X1 - 50, YB - 20, zt - tt);
    if (v.dr) { a.box(cx - 220, YF + 60, zt - tt - 90, cx + 220, YB - 60, zt - tt); a.box(cx - 220, YF + 40, zt - tt - 90, cx + 220, YF + 60, zt - tt - 10); a.box(cx - 50, YF + 26, zt - tt - 60, cx + 50, YF + 40, zt - tt - 45); }
    a.box(X0 + 20, YB - 220, Z1 - 100, X1 - 20, YB, Z1 - 70); for (const x of [X0 + 120, X1 - 120]) a.tube([[x, YB - 10, zt + 600], [x, YB - 200, Z1 - 100]], [12, 12], 6);
    a.box(X0 + 20, YB - 10, zt + 500, X1 - 20, YB, Z1);
    a.log('Added the top, the side panels, the back rail, the centre drawer if listed and the wall shelf with brackets (plan and 3D).');
  } });

/** Long mess table with H-frame ends and two separate backless benches. */
P({ cat: 'furniture/tables', title: 'Generic mine camp mess table with benches',
  desc: (v) => `Mess-hall table ${v.w / 12} ft long, ${v.td} in wide, on two H-frame ends${v.rail ? ' with a centre condiment rail along the top' : ''}, with two separate backless benches seating ${v.seats}.`,
  vs: [['8 ft, seats 8', 96, 66, 30, 0, { td: 30, seats: 8 }], ['10 ft, seats 10', 120, 66, 30, 0, { td: 30, seats: 10 }], ['12 ft, seats 12, condiment rail', 144, 66, 30, 0, { td: 30, seats: 12, rail: true }], ['10 ft, wide, seats 10, condiment rail', 120, 72, 30, 0, { td: 36, seats: 10, rail: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a, tw = v.td * IN / 2, tt = 40, sh = Z0 + 450;
    a.outline(); a.box(X0 + 40, cy - tw, Z1 - tt, X1 - 40, cy + tw, Z1); a.rect(X0 + 40, cy - tw, X1 - 40, cy + tw); a.rect(X0 + 52, cy - tw + 12, X1 - 52, cy + tw - 12, 'EQUIP-DETAIL');
    if (v.rail) { a.box(X0 + 120, cy - 25, Z1, X1 - 120, cy + 25, Z1 + 0.0001 + 12); a.rect(X0 + 120, cy - 25, X1 - 120, cy + 25, 'EQUIP-DETAIL'); }
    for (const x of [X0 + 140, X1 - 140]) { for (const y of [cy - tw + 60, cy + tw - 110]) a.box(x - 25, y, Z0 + 30, x + 25, y + 50, Z1 - tt); a.box(x - 25, cy - tw + 60, Z1 - tt - 60, x + 25, cy + tw - 60, Z1 - tt); a.box(x - 40, cy - tw + 40, Z0, x + 40, cy + tw - 40, Z0 + 30); }
    a.box(X0 + 140, cy - 20, Z0 + 250, X1 - 140, cy + 20, Z0 + 290);
    for (const s of [-1, 1]) { const by = s < 0 ? YF + 20 : YB - 20 - 300; a.box(X0 + 60, by, sh - 45, X1 - 60, by + 300, sh); a.rect(X0 + 60, by, X1 - 60, by + 300, 'EQUIP-DETAIL'); for (const x of [X0 + 130, X1 - 130]) { a.box(x - 20, by + 20, Z0, x + 20, by + 60, sh - 45); a.box(x - 20, by + 240, Z0, x + 20, by + 280, sh - 45); } }
    a.log('Added the table top, the H-frame ends, the stretcher, the two backless benches and the condiment rail if listed (plan and 3D).');
  } });

/** Dry-house basket hoist: an overhead rail with pulleys, chains and wire clothes baskets hung at different heights. */
P({ cat: 'furniture/storage', title: 'Generic mine dry-house clothes basket hoist',
  desc: (v) => `Overhead rail of ${v.n} wire clothes baskets hung on chains from pulleys, at staggered heights, with a wall cleat for tying off the chains.`,
  vs: [['6 baskets', 96, 20, 96, 0, { n: 6 }], ['10 baskets, two rows', 120, 36, 96, 0, { n: 10 }], ['16 baskets, two rows', 192, 36, 96, 0, { n: 16 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D } = a, rows = v.n > 6 ? 2 : 1, per = Math.ceil(v.n / rows);
    a.outline('EQUIP-HIDDEN');
    for (let r = 0; r < rows; r++) { const y = rows === 1 ? (YF + YB) / 2 : YB - 200 - r * (D - 400); a.box(X0 + 30, y - 25, Z1 - 60, X1 - 30, y + 25, Z1); a.rect(X0 + 30, y - 25, X1 - 30, y + 25, 'EQUIP-DETAIL'); }
    for (let i = 0; i < v.n; i++) {
      const r = i % rows, k = Math.floor(i / rows), y = rows === 1 ? (YF + YB) / 2 : YB - 200 - r * (D - 400), x = X0 + 80 + ((W - 160) * (k + 0.5)) / per, top = Z1 - 60 - ((k * 7 + r * 3) % 5) * 190, bz = top - 450;
      a.cyl(x, y, Z1 - 80, Z1 - 40, 30, 10); a.cyl(x, y, top, Z1 - 80, 6, 5); a.circ(x, y, 25, 'EQUIP-DETAIL');
      a.cyl(x, y, bz, bz + 6, 200, 12); for (const g of [0, 1.57, 3.14, 4.71]) a.tube([[x + Math.cos(g) * 190, y + Math.sin(g) * 190, bz], [x + Math.cos(g) * 210, y + Math.sin(g) * 210, top - 40], [x, y, top]], [6, 5, 5], 5);
      a.tube([[x, y, bz + 150], [x, y, bz + 154]], [210, 210], 14); a.tube([[x, y, top - 40], [x, y, top - 36]], [150, 150], 12); a.circ(x, y, 200, 'EQUIP-DETAIL');
    }
    a.box(X1 - 60, YB - 30, Z0 + 1000, X1 - 20, YB, Z0 + 1300); a.log('Added the overhead rails with pulleys, the chains, the wire baskets at staggered heights and the wall cleat (plan and 3D).');
  } });

/** Double-sided island bench with a central hook rail, or a wall bench with a boot rack under the seat. */
P({ cat: 'furniture/seating', title: 'Generic mine changing room bench with boot rack',
  desc: (v) => v.island ? `Island bench, ${v.w} in long, with a slatted seat on each side of a central post-and-rail carrying two rows of coat hooks, and an open boot rack under each seat.` : `Wall bench, ${v.w} in long, with a slatted seat on steel frames, an open boot rack of angled pegs under it and a hook rail on the wall above.`,
  vs: [['wall bench, 48 in', 48, 18, 64, 0, {}], ['wall bench, 72 in', 72, 18, 64, 0, {}], ['island bench, 72 in', 72, 40, 70, 0, { island: true }], ['island bench, 96 in', 96, 40, 70, 0, { island: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a, sh = Z0 + 440;
    a.outline();
    const seats = v.island ? [[YF + 15, YF + 15 + 360], [YB - 15 - 360, YB - 15]] : [[YF + 15, YF + 15 + 400]];
    for (const [y0, y1] of seats) { for (let i = 0; i < 4; i++) { const y = y0 + (y1 - y0) * (i / 4); a.box(X0 + 20, y + 3, sh - 40, X1 - 20, y + (y1 - y0) / 4 - 3, sh); } a.rect(X0 + 20, y0, X1 - 20, y1, 'EQUIP-DETAIL'); }
    for (const x of [X0 + 60, cx, X1 - 60]) { for (const [y0, y1] of seats) { a.box(x - 20, y0 + 20, Z0, x + 20, y0 + 50, sh - 40); a.box(x - 20, y1 - 50, Z0, x + 20, y1 - 20, sh - 40); } a.box(x - 20, seats[0][0] + 20, Z0 + 150, x + 20, seats[seats.length - 1][1] - 20, Z0 + 175); }
    for (const [y0, y1] of seats) for (let i = 0; i < 6; i++) { const x = X0 + 80 + ((W - 160) * i) / 5; a.tube([[x, y1 - 60, Z0 + 175], [x, y0 + 80, Z0 + 330]], [11, 9], 6); }
    if (v.island) { for (const x of [X0 + 60, cx, X1 - 60]) a.box(x - 15, cy - 15, sh - 40, x + 15, cy + 15, Z1); a.box(X0 + 40, cy - 20, Z1 - 60, X1 - 40, cy + 20, Z1); for (let i = 0; i < 8; i++) { const x = X0 + 100 + ((W - 200) * i) / 7; a.tube([[x, cy - 20, Z1 - 30], [x, cy - 90, Z1 - 5]], [7, 7], 5); a.tube([[x, cy + 20, Z1 - 30], [x, cy + 90, Z1 - 5]], [7, 7], 5); } }
    else { a.box(X0 + 20, YB - 30, sh + 700, X1 - 20, YB, sh + 740); for (let i = 0; i < 7; i++) { const x = X0 + 60 + ((W - 120) * i) / 6; a.tube([[x, YB - 30, sh + 720], [x, YB - 100, sh + 760]], [7, 7], 5); } a.box(X0 + 20, YB - 20, sh - 40, X1 - 20, YB, sh + 700); }
    a.log('Added the slatted seats, the steel frames, the boot rack pegs and the hook rail or central hook post (plan and 3D).');
  } });

/** Vinyl lounge furniture for camp common rooms. */
function lounge(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a, sh = Z0 + 420, arm = 130, n = o.n;
  a.outline();
  for (const x of [X0 + 50, X1 - 50]) for (const y of [YF + 50, YB - 50]) a.box(x - 25, y - 25, Z0, x + 25, y + 25, Z0 + 90);
  a.box(X0, YF, Z0 + 90, X1, YB, sh - 70);
  for (const x0 of [X0, X1 - arm]) { a.box(x0, YF, sh - 70, x0 + arm, YB, sh + 220); a.ell(x0 + arm / 2, (YF + YB) / 2, sh + 220, arm / 2, (YB - YF) / 2, 15, 8, 3); a.rect(x0, YF, x0 + arm, YB, 'EQUIP-DETAIL'); }
  a.box(X0 + arm, YB - 170, sh - 70, X1 - arm, YB, Z1); a.rect(X0, YB - 170, X1, YB, 'EQUIP-DETAIL');
  for (let i = 0; i < n; i++) { const x0 = X0 + arm + ((W - 2 * arm) * i) / n + 3, x1 = X0 + arm + ((W - 2 * arm) * (i + 1)) / n - 3; cushion(a, x0, YF + 10, x1, YB - 175, sh - 70, sh + 80); a.rect(x0, YF + 10, x1, YB - 175, 'EQUIP-DETAIL'); a.ell((x0 + x1) / 2, YB - 190, (sh + Z1) / 2 + 20, (x1 - x0) / 2 - 3, 50, (Z1 - sh) / 2 - 40, 12, 5); }
}
P({ cat: 'furniture/seating', title: 'Generic mine camp lounge seating, vinyl',
  desc: (v) => `Wipe-clean vinyl-style lounge ${v.n === 1 ? 'chair' : v.n === 2 ? 'sofa' : 'sofa'} with ${cnt(v.n, 'seat cushion', 'seat cushions')}, back cushions, padded arms and short feet, ${v.w} in wide.`,
  vs: [['chair, 36 in', 36, 34, 33, 0, { n: 1 }], ['two seat, 60 in', 60, 34, 33, 0, { n: 2 }], ['three seat, 84 in', 84, 34, 33, 0, { n: 3 }], ['four seat, 108 in', 108, 34, 33, 0, { n: 4 }]],
  build: (a, v) => { lounge(a, v); a.log('Added the feet and frame, the arms, the back and the seat and back cushions (plan and 3D).'); } });

/** Operator console desk: front worktop, wing returns, a raised monitor shelf with screens, a cable trough and side panels. */
function consoleDesk(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a, zt = Z0 + (o.zt ?? 29 * IN), tt = 35, bays = o.bays;
  a.outline(); a.box(X0, YF + 60, zt - tt, X1, YB, zt); a.rect(X0, YF + 60, X1, YB); a.rect(X0 + 10, YF + 70, X1 - 10, YB - 10, 'EQUIP-DETAIL');
  a.box(X0, YF, zt - tt - 20, X1, YF + 60, zt - tt + 10); a.rect(X0, YF, X1, YF + 60, 'EQUIP-DETAIL');
  const bw = W / bays;
  for (let i = 0; i <= bays; i++) { const x = X0 + i * bw; a.box(Math.max(X0, x - 18), YF + 80, Z0, Math.min(X1, x + 18), YB - 20, zt - tt); }
  for (let i = 0; i < bays; i++) {
    const x0 = X0 + i * bw + 40, x1 = X0 + (i + 1) * bw - 40;
    a.box(x0, YB - 60, Z0 + 250, x1, YB - 40, zt - tt - 20);
    if (o.draws) a.box(x0 + 20, YF + 100, zt - tt - 150, x1 - 20, YB - 80, zt - tt - 20);
    const nm = o.screens ?? 2, sw = (x1 - x0) / nm;
    for (let k = 0; k < nm; k++) { const sx = x0 + sw * (k + 0.5); a.box(sx - 40, YB - 220, zt, sx + 40, YB - 140, zt + 30); a.box(sx - 20, YB - 190, zt + 30, sx + 20, YB - 170, zt + 150); a.box(sx - sw * 0.42, YB - 185, zt + 120, sx + sw * 0.42, YB - 165, zt + 120 + o.sh); a.rect(sx - sw * 0.42, YB - 185, sx + sw * 0.42, YB - 165, 'EQUIP-DETAIL'); }
  }
  a.box(X0 + 20, YB - 110, zt, X1 - 20, YB - 40, zt + 25); a.rect(X0 + 20, YB - 110, X1 - 20, YB - 40, 'EQUIP-HIDDEN');
  if (o.wings) for (const x of [X0, X1 - 600]) { a.box(x, YF, zt - tt, x + 600, YF + 60, zt); }
}
P({ cat: 'furniture/desks', title: 'Generic mine control room operator desk',
  desc: (v) => `Operator desk of ${cnt(v.bays, 'bay', 'bays')}, ${v.w} by ${v.d} in: a worktop with a front lip, side panels at each bay, a cable trough and ${cnt(v.bays * 2, 'screen', 'screens')} on stands${v.draws ? ', and a shallow drawer unit under the top' : ''}.`,
  vs: [['one bay, 60 in', 60, 36, 46, 0, { bays: 1, sh: 380 }], ['two bays, 96 in', 96, 36, 46, 0, { bays: 2, sh: 380 }], ['three bays, 144 in', 144, 36, 46, 0, { bays: 3, sh: 380 }], ['two bays, 96 in, drawer units', 96, 36, 46, 0, { bays: 2, sh: 380, draws: true }]],
  build: (a, v) => { consoleDesk(a, v); a.log('Added the worktop, the side panels, the cable trough, the screens on stands and any drawer units (plan and 3D).'); } });

P({ cat: 'furniture/storage', title: 'Generic mine camp room bedside locker',
  desc: (v) => `Steel bedside locker, ${v.w} by ${v.d} in: ${v.dr ? cnt(v.dr, 'drawer', 'drawers') : 'no drawers'}${v.doors ? ` and ${cnt(v.doors, 'door', 'doors')}` : ''} with recessed pulls on a plinth.`,
  vs: [['one door, 16 in', 16, 18, 30, 0, { doors: 1 }], ['drawer and door, 18 in', 18, 18, 30, 0, { dr: 1, doors: 1 }], ['three drawers, 18 in', 18, 18, 30, 0, { dr: 3 }]],
  build: (a, v) => { cab(a, { toe: 70, doors: v.doors ?? 0, drawers: v.dr ?? 0, drawerH: v.doors ? 170 : 0, pull: 'recess', topT: 25 }); a.log('Added the plinth, the carcass, the drawers or door with recessed pulls and the top (plan and 3D).'); } });

P({ cat: 'furniture/tables', title: 'Generic mine shift handover table, standing height',
  desc: (v) => `Standing-height table, ${v.w} by ${v.d} in, 42 in to the top, on end frames with a foot rail, a low back rail and a lower shelf.`,
  vs: [['60 by 30 in', 60, 30, 42, 0, {}], ['96 by 36 in', 96, 36, 42, 0, {}], ['120 by 36 in', 120, 36, 42, 0, {}]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tt = 40;
    a.outline(); a.box(X0, YF, Z1 - tt, X1, YB, Z1); a.rect(X0 + 12, YF + 12, X1 - 12, YB - 12, 'EQUIP-DETAIL');
    const xs = W > 2000 ? [X0 + 150, (X0 + X1) / 2, X1 - 150] : [X0 + 150, X1 - 150];
    for (const x of xs) { for (const y of [YF + 60, YB - 100]) a.box(x - 25, y, Z0 + 40, x + 25, y + 40, Z1 - tt); a.box(x - 35, YF + 50, Z0, x + 35, YB - 50, Z0 + 40); a.box(x - 25, YF + 60, Z1 - tt - 50, x + 25, YB - 60, Z1 - tt); a.rect(x - 35, YF + 50, x + 35, YB - 50, 'EQUIP-HIDDEN'); }
    a.xcyl(xs[0], xs[xs.length - 1], YF + 80, Z0 + 200, 18, 8); a.box(xs[0], YB - 100, Z0 + 250, xs[xs.length - 1], YB - 60, Z0 + 275); a.box(xs[0], YF + 140, Z0 + 330, xs[xs.length - 1], YB - 140, Z0 + 355);
    a.log('Added the top, the end frames with floor plates, the foot rail, the back rail and the lower shelf (plan and 3D).');
  } });

// ================================================================ AVIATION
/** Aircraft passenger seat row: n seats on floor spars, leaning backs with headrests, fold-up armrests, a tray on each back; bulkhead = a wall in front with arm trays. */
function cabinRow(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, sh = Z0 + 430, arm = 45, n = o.n, u = (W - 2 * arm) / n;
  a.outline();
  const dx = [...Array(n + 1)].map((_, i) => X0 + arm / 2 + i * (u + (2 * arm - arm) / n * 0) + (i === 0 ? 0 : (arm * i) / n));
  const ax = [...Array(n + 1)].map((_, i) => X0 + arm / 2 + (i * (W - arm)) / n);
  for (const x of ax) {
    a.box(x - 16, YB - 470, Z0, x + 16, YB - 60, Z0 + 30); a.rect(x - 16, YB - 470, x + 16, YB - 60, 'EQUIP-HIDDEN');
    a.tube([[x, YB - 330, Z0 + 30], [x, YB - 260, sh - 70]], [16, 16], 8);
    a.box(x - arm / 2, YB - 440, sh + 120, x + arm / 2, YB - 110, sh + 165); a.box(x - 12, YB - 400, sh - 60, x + 12, YB - 360, sh + 120); a.rect(x - arm / 2, YB - 440, x + arm / 2, YB - 110, 'EQUIP-DETAIL');
  }
  for (let i = 0; i < n; i++) {
    const x0 = ax[i] + arm / 2 + 6, x1 = ax[i + 1] - arm / 2 - 6;
    a.box(x0, YB - 500, sh - 70, x1, YB - 100, sh - 45); cushion(a, x0, YB - 500, x1, YB - 110, sh - 45, sh + 55); a.rect(x0, YB - 500, x1, YB - 110, 'EQUIP-DETAIL');
    xprism(a, [[YB - 130, sh - 20], [YB - 25, sh - 20], [YB - 25, Z1 - 40], [YB - 90, Z1 - 40]], x0 + 10, x1 - 10);
    a.box(x0 + 30, YB - 140, Z1 - 200, x1 - 30, YB - 25, Z1);
    if (o.wings) for (const x of [x0 + 10, x1 - 40]) a.box(x, YB - 240, Z1 - 200, x + 30, YB - 100, Z1 - 10);
    if (!o.bulk) { a.box(x0 + 40, YB - 20, sh + 220, x1 - 40, YB, sh + 250); a.rect(x0 + 40, YB - 20, x1 - 40, YB, 'EQUIP-DETAIL'); }
  }
  if (o.bulk) { a.box(X0, YF, Z0, X1, YF + 45, Z1 - 120); a.rect(X0, YF, X1, YF + 45); for (let i = 0; i < n; i++) { const x = (ax[i] + ax[i + 1]) / 2; a.box(x - 180, YF + 45, sh + 160, x + 180, YF + 300, sh + 185); a.rect(x - 180, YF + 45, x + 180, YF + 300, 'EQUIP-DETAIL'); } }
}
P({ cat: 'furniture/seating', title: 'Generic aircraft passenger seat row',
  desc: (v) => `Passenger seat row of ${v.n} seats on floor spars with leaning backs, headrests${v.wings ? ' with side wings' : ''}, fold-up armrests${v.bulk ? ', and a bulkhead wall in front with a fold-out tray beside each seat' : ' and a tray table on each seat back'}.`,
  vs: [
    ['regional jet, 2 seats, 30 in pitch', 37, 30, 40, 0, { n: 2 }],
    ['regional jet, 3 seats, 30 in pitch', 53, 30, 40, 0, { n: 3 }],
    ['narrow-body, 3 seats, 31 in pitch', 55, 31, 40, 0, { n: 3 }],
    ['narrow-body, 3 seats, 34 in pitch, wings', 55, 34, 42, 0, { n: 3, wings: true }],
    ['narrow-body, bulkhead row, 3 seats', 55, 31, 40, 0, { n: 3, bulk: true }],
    ['wide-body, 3 seats at the side', 60, 32, 40, 0, { n: 3 }],
    ['wide-body, 4 seats in the centre', 78, 32, 40, 0, { n: 4 }],
    ['turboprop, 2 seats, 29 in pitch', 36, 29, 39, 0, { n: 2 }],
    ['wide-body, 2 seats at the window', 41, 32, 40, 0, { n: 2 }] ],
  build: (a, v) => { cabinRow(a, v); a.log('Added the floor spars, the seat pans, the leaning backs with headrests, the armrests and the tray tables or bulkhead trays (plan and 3D).'); } });

/** Premium cabin seat: a shell with side walls, seat, leaning back, footrest and console armrests; flat = the seat made up as a bed. */
function premiumSeat(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, sh = Z0 + 420, wall = 45;
  a.outline();
  a.box(X0, YF + 60, Z0, X1, YB, Z0 + 150);
  for (const x of [X0, X1 - wall]) { a.box(x, YF + 60, Z0 + 150, x + wall, YB, o.shell); a.rect(x, YF + 60, x + wall, YB, 'EQUIP-DETAIL'); }
  const seats = o.pair ? 2 : 1, cw = o.pair ? 200 : 0, sw = (W - 2 * wall - cw) / seats;
  for (let i = 0; i < seats; i++) {
    const x0 = X0 + wall + i * (sw + cw) + 30, x1 = x0 + sw - 60;
    if (o.flat) {
      a.box(x0, YF + 100, Z0 + 150, x1, YB - 40, sh); cushion(a, x0, YF + 110, x1, YB - 50, sh, sh + 110); a.ell((x0 + x1) / 2, YB - 220, sh + 130, (x1 - x0) / 2 - 40, 170, 50, 10, 5); a.rect(x0, YF + 110, x1, YB - 50, 'EQUIP-DETAIL');
    } else {
      a.box(x0, YB - 700, Z0 + 150, x1, YB - 60, sh - 40); cushion(a, x0, YB - 700, x1, YB - 200, sh - 40, sh + 80); a.rect(x0, YB - 700, x1, YB - 200, 'EQUIP-DETAIL');
      xprism(a, [[YB - 300, sh - 40], [YB - 180, sh - 40], [YB - 60, Z1 - 120], [YB - 190, Z1 - 120]], x0 + 20, x1 - 20);
      a.ell((x0 + x1) / 2, YB - 125, Z1 - 100, (x1 - x0) / 2 - 80, 60, 90, 10, 5);
      a.box(x0 + 20, YB - 1020, Z0 + 150, x1 - 20, YB - 720, sh - 120); cushion(a, x0 + 20, YB - 1020, x1 - 20, YB - 720, sh - 120, sh - 20); a.rect(x0 + 20, YB - 1020, x1 - 20, YB - 720, 'EQUIP-DETAIL');
    }
  }
  if (o.pair) { const x0 = X0 + wall + sw + 30 - 15; a.box(x0, YF + 100, Z0 + 150, x0 + cw - 30, YB - 60, sh + 180); a.rect(x0, YF + 100, x0 + cw - 30, YB - 60, 'EQUIP-DETAIL'); }
  a.box(X0 + wall, YB - 60, Z0 + 150, X1 - wall, YB, o.shell - 200); a.box(X0 + wall + 40, YF + 60, sh + 120, X0 + wall + 340, YF + 400, sh + 150);
}
P({ cat: 'furniture/seating', title: 'Generic aircraft premium-class seat',
  desc: (v) => v.flat ? `Premium-class seat made up as a flat bed: a base, two side walls ${v.shell / IN > 30 ? 'with a high shell' : ''}, a padded flat deck and a pillow.` : `Premium-class ${v.pair ? 'seat pair with a centre console between them' : 'recliner'}: a base, side walls, a seat with a leaning back and headrest, a footrest ottoman and a fold-out table in front of the right-hand wall.`,
  vs: [
    ['recliner pod, single', 30, 60, 46, 0, { shell: 38 * IN }],
    ['recliner pod, single, high shell', 32, 62, 52, 0, { shell: 46 * IN }],
    ['recliner pair with centre console', 62, 60, 46, 0, { shell: 38 * IN, pair: true }],
    ['recliner pair, high shell', 64, 62, 52, 0, { shell: 46 * IN, pair: true }],
    ['flat bed made up, single', 30, 80, 46, 0, { shell: 38 * IN, flat: true }] ],
  build: (a, v) => { premiumSeat(a, v); a.log('Added the base, the side walls, the seat with back and footrest or the flat deck, any console and the fold-out table (plan and 3D).'); } });

/** Fold-down crew jump seat against a wall plate with a harness. */
function jumpSeat(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, n = o.n, u = W / n, sh = Z0 + 450;
  a.outline();
  a.box(X0, YB - 40, Z0 + 100, X1, YB, Z1); a.rect(X0, YB - 40, X1, YB, 'EQUIP-DETAIL');
  for (let i = 0; i < n; i++) {
    const x0 = X0 + i * u + 30, x1 = X0 + (i + 1) * u - 30, mx = (x0 + x1) / 2;
    cushion(a, x0 + 15, YB - 90, x1 - 15, YB - 40, sh + 100, Z1 - 150); a.rect(x0 + 15, YB - 90, x1 - 15, YB - 40, 'EQUIP-DETAIL');
    if (o.stowed) { a.box(x0, YB - 120, sh + 80, x1, YB - 90, sh + 460); a.rect(x0, YB - 120, x1, YB - 90, 'EQUIP-DETAIL'); }
    else {
      a.box(x0, YB - 400, sh - 20, x1, YB - 90, sh + 25); cushion(a, x0 + 10, YB - 390, x1 - 10, YB - 100, sh + 25, sh + 80); a.rect(x0, YB - 400, x1, YB - 90, 'EQUIP-DETAIL');
      a.tube([[x0 + 20, YB - 40, Z0 + 150], [x0 + 20, YB - 330, sh - 20]], [11, 11], 6); a.tube([[x1 - 20, YB - 40, Z0 + 150], [x1 - 20, YB - 330, sh - 20]], [11, 11], 6);
    }
    for (const sx of [x0 + 40, x1 - 40]) a.tube([[sx, YB - 45, Z1 - 100], [mx, YB - 130, sh + 160]], [8, 8], 5);
    a.cyl(mx, YB - 130, sh + 150, sh + 175, 38, 10);
  }
}
P({ cat: 'furniture/seating', title: 'Generic aircraft crew jump seat',
  desc: (v) => `Crew seat unit of ${cnt(v.n, 'seat', 'seats')} on a wall plate: ${v.stowed ? 'the seat pans folded up against the plate' : 'a fold-down seat pan on two struts'}, a padded back and a shoulder harness meeting at a buckle for each seat.`,
  vs: [
    ['single, seat down', 20, 18, 48, 0, { n: 1 }],
    ['single, seat stowed', 20, 6, 48, 0, { n: 1, stowed: true }],
    ['double, seats down', 38, 18, 48, 0, { n: 2 }],
    ['triple, seats down', 56, 18, 48, 0, { n: 3 }] ],
  build: (a, v) => { jumpSeat(a, v); a.log('Added the wall plate, the back pads, the fold-down seat pans with struts or the stowed pans and the harnesses (plan and 3D).'); } });

/** Flight-deck style seat: floor tracks, carriage, seat pan with bolsters, leaning back with headrest, armrests, harness. */
function pilotSeat(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, sh = Z0 + 480;
  a.outline();
  for (const x of [X0 + 60, X1 - 60]) { a.box(x - 25, YF + 30, Z0, x + 25, YB - 20, Z0 + 55); a.rect(x - 25, YF + 30, x + 25, YB - 20, 'EQUIP-HIDDEN'); }
  a.box(X0 + 40, YF + 120, Z0 + 55, X1 - 40, YB - 140, Z0 + 140); a.cone(cx, (YF + YB) / 2 - 60, Z0 + 140, sh - 70, 80, 60, 12);
  a.box(X0 + 50, YF + 100, sh - 70, X1 - 50, YB - 120, sh - 20); cushion(a, X0 + 60, YF + 110, X1 - 60, YB - 130, sh - 20, sh + 70);
  for (const x of [X0 + 50, X1 - 50 - 40]) a.box(x, YF + 110, sh + 20, x + 40, YB - 130, sh + 110);
  a.rect(X0 + 60, YF + 110, X1 - 60, YB - 130, 'EQUIP-DETAIL');
  xprism(a, [[YB - 200, sh - 20], [YB - 60, sh - 20], [YB - 40, Z1 - 140], [YB - 160, Z1 - 140]], X0 + 60, X1 - 60);
  a.ell(cx, YB - 110, Z1 - 120, (W - 200) / 2 - 20, 55, 110, 12, 6); a.rect(X0 + 60, YB - 200, X1 - 60, YB - 60, 'EQUIP-DETAIL');
  if (o.arms) for (const x of [X0 + 20, X1 - 20 - 45]) { a.box(x, YF + 140, sh + 170, x + 45, YB - 200, sh + 210); a.tube([[x + 22, YB - 230, sh + 10], [x + 22, YB - 230, sh + 170]], [14, 14], 6); }
  for (const sx of [cx - 140, cx + 140]) a.tube([[sx, YB - 70, Z1 - 160], [cx + (sx < cx ? 40 : -40), YB - 220, sh + 120]], [9, 9], 5);
  a.cyl(cx, YB - 225, sh + 100, sh + 130, 36, 10);
}
P({ cat: 'furniture/seating', title: 'Generic cockpit-style crew seat',
  desc: (v) => `Flight-deck style seat on two floor tracks with a carriage and column, ${v.arms ? 'adjustable armrests, ' : 'no armrests, '}a bolstered seat pan, a leaning back with a headrest and a shoulder harness to a central buckle.`,
  vs: [['with armrests', 24, 30, 46, 0, { arms: true }], ['without armrests', 22, 30, 46, 0, { arms: false }], ['wide, with armrests', 27, 31, 47, 0, { arms: true }]],
  build: (a, v) => { pilotSeat(a, v); a.log('Added the floor tracks, the carriage and column, the seat pan with bolsters, the back with headrest, any armrests and the harness (plan and 3D).'); } });

/** Crew rest berth: shell around a mattress, with a curtain rail and optional drawn curtain, in one or two tiers. */
function berth(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, tiers = o.tiers, th = (Z1 - Z0 - 100) / tiers;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 100);
  for (const x of [X0, X1 - 40]) { a.box(x, YF, Z0 + 100, x + 40, YB, Z1); a.rect(x, YF, x + 40, YB, 'EQUIP-DETAIL'); }
  a.box(X0 + 40, YB - 40, Z0 + 100, X1 - 40, YB, Z1);
  for (let i = 0; i < tiers; i++) {
    const z = Z0 + 100 + i * th;
    a.box(X0 + 40, YF + 20, z + 100, X1 - 40, YB - 40, z + 150); cushion(a, X0 + 50, YF + 40, X1 - 50, YB - 50, z + 150, z + 260); a.ell(cx, YB - 220, z + 270, W * 0.28, 170, 45, 10, 5);
    a.box(X0 + 40, YF + 20, z + th - 40, X1 - 40, YB - 40, z + th);
    a.box(X0 + 40, YF + 20, z + th - 90, X1 - 40, YF + 40, z + th - 40);
    if (o.curtain) { a.box(X0 + 40, YF + 4, z + 170, X1 - 40, YF + 16, z + th - 90); a.line(X0 + 40, YF + 10, X1 - 40, YF + 10, 'EQUIP-DETAIL'); }
    a.cyl(X1 - 120, YB - 60, z + th - 120, z + th - 100, 40, 10);
  }
  a.rect(X0 + 50, YF + 40, X1 - 50, YB - 50, 'EQUIP-DETAIL');
}
P({ cat: 'furniture/beds', title: 'Generic aircraft crew rest berth',
  desc: (v) => `${v.tiers === 2 ? 'Two stacked' : 'One'} enclosed lie-flat berth${v.tiers === 2 ? 's' : ''}, ${v.w} by ${v.d} in: a base, two side walls, a mattress with a pillow, a ceiling panel with a reading light${v.curtain ? ' and a privacy curtain across the opening' : ' and an open front with a curtain rail'}.`,
  vs: [
    ['single berth, curtain open', 30, 80, 44, 0, { tiers: 1 }],
    ['single berth, curtain drawn', 30, 80, 44, 0, { tiers: 1, curtain: true }],
    ['two berths stacked', 30, 80, 80, 0, { tiers: 2 }] ],
  build: (a, v) => { berth(a, v); a.log('Added the base, the side walls, the mattress and pillow, the ceiling panel, the curtain rail and any drawn curtain (plan and 3D).'); } });

P({ cat: 'furniture/tables', title: 'Generic hangar break room table',
  desc: (v) => v.round ? `Round break-room table, ${v.w} in across, on a column and round foot with a laminate top.` : v.leaf ? `Drop-leaf table: a ${v.w} in by ${v.d} in centre top with two raised leaves on swing brackets, on four legs.` : `Rectangular break-room table, ${v.w} by ${v.d} in, with a laminate top, an apron frame and four legs${v.power ? ', and a power strip with sockets along the long edge' : ''}.`,
  vs: [
    ['rectangular, 60 by 30 in', 60, 30, 30, 0, {}],
    ['rectangular, 72 by 36 in, power strip', 72, 36, 30, 0, { power: true }],
    ['round, 48 in', 48, 48, 30, 0, { round: true }],
    ['drop leaf, 72 by 36 in open', 72, 36, 30, 0, { leaf: true }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a;
    if (v.round) tbl(a, { round: true, base: 'pedestal', topT: 34 });
    else if (v.leaf) {
      const lw = W * 0.2; tbl(a, { topT: 34, base: 'legs', apron: 70, legR: 24 });
      for (const sd of [-1, 1]) { const x = sd < 0 ? X0 + 60 + lw : X1 - 60 - lw; a.line(x, YF, x, YB, 'EQUIP-DETAIL'); a.tube([[x + sd * 20, YB - 80, Z1 - 120], [x + sd * (lw - 40), YB - 80, Z1 - 40]], [12, 12], 6); a.tube([[x + sd * 20, YF + 80, Z1 - 120], [x + sd * (lw - 40), YF + 80, Z1 - 40]], [12, 12], 6); }
    } else { tbl(a, { topT: 34, base: 'legs', apron: 70, legR: 24 }); if (v.power) { a.box(X0 + 200, YF + 6, Z1 - 100, X1 - 200, YF + 40, Z1 - 34); for (let i = 0; i < 4; i++) { const x = X0 + 200 + ((W - 400) * (i + 0.5)) / 4; a.cyl(x, YF + 6, Z1 - 80, Z1 - 79, 14, 8); a.circ(x, YF + 18, 14, 'EQUIP-DETAIL'); } } }
    a.log('Added the top, the legs or column, the apron or foot, the leaf brackets or the power strip if listed (plan and 3D).');
  } });

P({ cat: 'furniture/seating', title: 'Generic crew lounge recliner, hangar crew room',
  desc: (v) => `Upholstered recliner on short feet with padded arms, a sloped back and a seat; the footrest is ${v.foot ? 'extended in front' : 'folded down'}.`,
  vs: [['footrest down', 31, 34, 42, 0, { foot: false, legs: true }], ['footrest extended', 31, 58, 42, 0, { foot: true, legs: true }], ['wide, footrest extended', 36, 60, 42, 0, { foot: true, legs: true, arm: 140 }]],
  build: (a, v) => { recliner(a, v); a.log('Added the feet and frame, the arms, the seat, the sloped back and the footrest (plan and 3D).'); } });

P({ cat: 'furniture/seating', title: 'Generic hangar shop stool, adjustable',
  desc: (v) => `Workshop stool on a five-star caster base and a column, with a round seat${v.back ? ', a back rest on a post' : ''}${v.ring ? ' and a foot ring' : ''}; seat height ${Math.round(v.sh / IN)} in.`,
  vs: [['low, 18 in', 20, 20, 19, 0, { sh: 18 * IN }], ['mid, with back, 24 in', 22, 22, 36, 0, { sh: 24 * IN, back: true }], ['tall, with back and foot ring, 30 in', 24, 24, 42, 0, { sh: 30 * IN, back: true, ring: true }], ['tall, with foot ring, 34 in', 24, 24, 35, 0, { sh: 34 * IN, ring: true }]],
  build: (a, v) => { procStool(a, v); a.log('Added the five-star base with casters, the column, the seat and any back or foot ring (plan and 3D).'); } });

P({ cat: 'furniture/other', title: 'Generic aircraft maintenance creeper',
  desc: (v) => v.seat ? 'Low rolling seat on four casters with a padded top and a small parts tray under the seat.' : `Padded lie-down board, ${v.d} in long, on six swivel casters with a molded headrest${v.tray ? ' and a parts tray at the foot' : ''}.`,
  vs: [['board, 40 in', 17, 40, 5, 0, {}], ['board with parts tray, 40 in', 17, 46, 5, 0, { tray: true }], ['low seat, 14 in', 14, 14, 15, 0, { seat: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a;
    a.outline();
    if (v.seat) { for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 40], [X1 - 40, YB - 40]]) { a.caster(x, y, 90); a.circ(x, y, 25, 'EQUIP-HIDDEN'); } a.box(X0 + 20, YF + 20, Z0 + 80, X1 - 20, YB - 20, Z0 + 130); cushion(a, X0 + 15, YF + 15, X1 - 15, YB - 15, Z0 + 130, Z1); a.box(X0 + 40, YF + 40, Z0 + 55, X1 - 40, YB - 40, Z0 + 80); a.rect(X0 + 15, YF + 15, X1 - 15, YB - 15, 'EQUIP-DETAIL'); }
    else {
      const y0 = v.tray ? YF + 230 : YF + 15;
      for (const [x, y] of [[X0 + 25, y0 + 30], [X1 - 25, y0 + 30], [X0 + 25, (y0 + YB) / 2], [X1 - 25, (y0 + YB) / 2], [X0 + 25, YB - 40], [X1 - 25, YB - 40]]) { a.caster(x, y, 70); a.circ(x, y, 22, 'EQUIP-HIDDEN'); }
      a.box(X0 + 15, y0, Z0 + 55, X1 - 15, YB - 15, Z0 + 80); cushion(a, X0 + 20, y0 + 5, X1 - 20, YB - 20, Z0 + 80, Z0 + 110); a.ell(cx, YB - 110, Z0 + 115, W * 0.3, 75, 22, 10, 4); a.rect(X0 + 15, y0, X1 - 15, YB - 15, 'EQUIP-DETAIL');
      if (v.tray) { a.box(X0 + 25, YF + 10, Z0 + 55, X1 - 25, y0 - 10, Z0 + 70); a.box(X0 + 25, YF + 10, Z0 + 70, X1 - 25, YF + 22, Z0 + 100); a.box(X0 + 25, y0 - 22, Z0 + 70, X1 - 25, y0 - 10, Z0 + 100); a.rect(X0 + 25, YF + 10, X1 - 25, y0 - 10, 'EQUIP-DETAIL'); }
    }
    a.log('Added the casters, the padded deck, the headrest and the parts tray or seat frame (plan and 3D).');
  } });

P({ cat: 'furniture/other', title: 'Generic hangar rolling step platform',
  desc: (v) => `Rolling access steps: ${v.n} treads on two sloped stringers up to a ${v.top} in high platform with ${v.rails ? 'side handrails and a back rail' : 'a back rail'}, on four casters.`,
  vs: [['2 steps, 20 in platform', 24, 36, 20, 0, { n: 2, top: 20, rails: false }], ['3 steps, 30 in platform', 26, 44, 48, 0, { n: 3, top: 30, rails: true }], ['4 steps, 40 in platform, handrails', 28, 56, 62, 0, { n: 4, top: 40, rails: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D } = a, tz = Z0 + v.top * IN, sh0 = Z0 + 110, run = (D - 520) / v.n;
    a.outline();
    for (const [x, y] of [[X0 + 50, YF + 70], [X1 - 50, YF + 70], [X0 + 50, YB - 70], [X1 - 50, YB - 70]]) { a.caster(x, y, 110); a.circ(x, y, 25, 'EQUIP-HIDDEN'); }
    for (const x of [X0 + 30, X1 - 60]) { slab(a, x, x + 30, YF + 50, sh0, YB - 480, tz - 40, 40); a.box(x, YB - 480, sh0, x + 30, YB - 440, tz); a.box(x, YB - 70, sh0, x + 30, YB - 30, tz); a.box(x, YB - 480, tz - 40, x + 30, YB - 30, tz); }
    for (let i = 1; i <= v.n; i++) { const z = sh0 + ((tz - sh0) * i) / v.n, y = YF + 50 + run * (i - 1); a.box(X0 + 40, y, z - 30, X1 - 40, y + 330, z); a.rect(X0 + 40, y, X1 - 40, y + 330, 'EQUIP-DETAIL'); }
    a.box(X0 + 30, YB - 470, tz, X1 - 30, YB - 40, tz + 30); a.rect(X0 + 30, YB - 470, X1 - 30, YB - 40, 'EQUIP-DETAIL');
    const top = Math.min(Z1, tz + 900);
    for (const x of [X0 + 40, X1 - 40]) { a.cyl(x, YB - 460, tz, top, 16, 8); a.cyl(x, YB - 50, tz, top, 16, 8); if (v.rails) a.ycyl(YB - 460, YB - 50, x, top, 14, 8); }
    a.xcyl(X0 + 40, X1 - 40, YB - 50, top, 14, 8);
    a.log('Added the casters, the stringers, the treads, the platform and the rails (plan and 3D).');
  } });

P({ cat: 'furniture/desks', title: 'Generic airfield operations desk',
  desc: (v) => `Operations desk of ${cnt(v.bays, 'position', 'positions')}, ${v.w} by ${v.d} in: a worktop with a front lip, side panels, a cable trough, a ${v.bays === 1 ? 'screen' : 'screens'} on stand${v.bays === 1 ? '' : 's'} and a radio shelf along the back.`,
  vs: [['one position, 60 in', 60, 30, 56, 0, { bays: 1, screens: 1, sh: 300, shelf: true }], ['two positions, 96 in', 96, 30, 56, 0, { bays: 2, screens: 1, sh: 300, shelf: true }], ['three positions, 144 in', 144, 30, 56, 0, { bays: 3, screens: 1, sh: 300, shelf: true }]],
  build: (a, v) => { consoleDesk(a, v); if (v.shelf) { a.box(a.X0 + 20, a.YB - 220, a.Z0 + 29 * IN + 650, a.X1 - 20, a.YB - 10, a.Z0 + 29 * IN + 680); for (const x of [a.X0 + 60, a.X1 - 60]) a.box(x - 12, a.YB - 220, a.Z0 + 29 * IN + 150, x + 12, a.YB - 190, a.Z0 + 29 * IN + 650); } a.log('Added the worktop, the side panels, the cable trough, the screens on stands and the radio shelf (plan and 3D).'); } });

P({ cat: 'furniture/tables', title: 'Generic hangar parts bench, steel top',
  desc: (v) => `Heavy bench ${v.w} by ${v.d} in: a steel top, ${v.cabs === 2 ? 'a drawer cabinet at each end' : 'a drawer cabinet at the left end and an open knee space'}${v.riser ? ', a back riser with two shelves and a light bar' : ''}.`,
  vs: [['72 by 30 in, one cabinet', 72, 30, 36, 0, { cabs: 1 }], ['96 by 30 in, two cabinets', 96, 30, 36, 0, { cabs: 2 }], ['96 by 30 in, two cabinets and riser', 96, 30, 66, 0, { cabs: 2, riser: true }], ['120 by 36 in, two cabinets and riser', 120, 36, 66, 0, { cabs: 2, riser: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, zt = Z0 + 36 * IN, cw = 560;
    a.outline(); a.box(X0, YF, zt - 45, X1, YB, zt); a.rect(X0, YF, X1, YB); a.rect(X0 + 12, YF + 12, X1 - 12, YB - 12, 'EQUIP-DETAIL');
    mix(a, X0 + 20, X0 + 20 + cw, (s) => { const t = new Acc({ x: s.X0, y: s.YF, z: s.Z0, w: s.W, h: zt - s.Z0 - 45 }); cab(t, { toe: 70, drawers: 4, pull: 'recess' }); s.add(t.t); for (const p of t.p) s.p.push(p); });
    if (v.cabs === 2) mix(a, X1 - 20 - cw, X1 - 20, (s) => { const t = new Acc({ x: s.X0, y: s.YF, z: s.Z0, w: s.W, h: zt - s.Z0 - 45 }); cab(t, { toe: 70, drawers: 4, pull: 'recess' }); s.add(t.t); for (const p of t.p) s.p.push(p); });
    else { a.box(X1 - 80, YF + 40, Z0, X1 - 40, YB - 20, zt - 45); a.box(X1 - 80, YF + 40, Z0, X1 - 40, YF + 80, zt - 45); }
    a.box(X0 + 20 + cw, YB - 40, Z0 + 250, X1 - (v.cabs === 2 ? 20 + cw : 80), YB - 20, zt - 45);
    if (v.riser) { for (const x of [X0 + 60, X1 - 60]) a.box(x - 20, YB - 280, zt, x + 20, YB - 240, Z1); for (const z of [zt + 450, zt + 850]) a.box(X0 + 60, YB - 300, z, X1 - 60, YB - 60, z + 25); a.box(X0 + 60, YB - 320, Z1 - 40, X1 - 60, YB - 260, Z1); a.rect(X0 + 60, YB - 300, X1 - 60, YB - 60, 'EQUIP-HIDDEN'); }
    a.log('Added the steel top, the drawer cabinets with recessed pulls, the back panel and the riser with shelves and light bar if listed (plan and 3D).');
  } });

P({ cat: 'furniture/seating', title: 'Generic aircraft side-facing bench seat',
  desc: (v) => `Side-facing bench of ${v.n} places along a wall panel: padded seat cushions on a frame with a hinged underside, thin back pads and a lap-belt pair at each place.`,
  vs: [['2 places', 40, 22, 40, 0, { n: 2 }], ['3 places', 58, 22, 40, 0, { n: 3 }], ['4 places', 76, 22, 40, 0, { n: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, u = W / v.n, sh = Z0 + 430;
    a.outline(); a.box(X0, YB - 40, Z0 + 100, X1, YB, Z1); a.box(X0, YF + 40, Z0, X1, YB - 40, Z0 + 100); a.box(X0 + 10, YF + 80, Z0 + 100, X1 - 10, YB - 40, sh - 60);
    for (let i = 0; i < v.n; i++) { const x0 = X0 + i * u + 20, x1 = X0 + (i + 1) * u - 20, mx = (x0 + x1) / 2; cushion(a, x0, YF + 80, x1, YB - 70, sh - 60, sh + 40); a.rect(x0, YF + 80, x1, YB - 70, 'EQUIP-DETAIL'); a.box(x0 + 15, YB - 90, sh + 40, x1 - 15, YB - 40, Z1 - 150); a.rect(x0 + 15, YB - 90, x1 - 15, YB - 40, 'EQUIP-DETAIL'); a.tube([[x0 + 20, YB - 80, sh + 30], [mx - 8, YF + 200, sh + 50]], [7, 7], 5); a.tube([[x1 - 20, YB - 80, sh + 30], [mx + 8, YF + 200, sh + 50]], [7, 7], 5); a.cyl(mx, YF + 200, sh + 50, sh + 70, 28, 8); }
    a.log('Added the wall panel, the seat base, the cushions, the back pads and the lap belts (plan and 3D).');
  } });

/** Business-jet club seat or divan on floor tracks. */
function clubSeat(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, sh = Z0 + 450, n = o.n ?? 1, seatW = (W - (o.table ? 400 : 0)) / n;
  a.outline();
  for (const x of [X0 + 70, X1 - 70]) { a.box(x - 25, YF + 20, Z0, x + 25, YB - 20, Z0 + 50); a.rect(x - 25, YF + 20, x + 25, YB - 20, 'EQUIP-HIDDEN'); }
  const x0 = X0 + (o.table ? 0 : 0), x1 = x0 + seatW * n;
  if (o.div) { a.box(x0 + 30, YF + 60, Z0 + 50, x1 - 30, YB - 60, sh - 50); }
  else { a.box(X0 + 70, cy - 40, Z0 + 20, X1 - 70, cy + 40, Z0 + 50); a.cone(x0 + seatW / 2, cy, Z0 + 50, sh - 100, 90, 60, 12); a.box(x0 + 40, YF + 100, sh - 100, x0 + seatW - 40, YB - 160, sh - 50); a.circ(x0 + seatW / 2, cy, 140, 'EQUIP-HIDDEN'); }
  for (let i = 0; i < n; i++) {
    const sx0 = x0 + seatW * i + 10, sx1 = x0 + seatW * (i + 1) - 10;
    cushion(a, sx0 + 20, YF + 60, sx1 - 20, YB - 100, sh - 50, sh + 70); a.rect(sx0 + 20, YF + 60, sx1 - 20, YB - 100, 'EQUIP-DETAIL');
    xprism(a, [[YB - 190, sh - 40], [YB - 50, sh - 40], [YB - 40, Z1 - 90], [YB - 150, Z1 - 90]], sx0 + 20, sx1 - 20);
    a.ell((sx0 + sx1) / 2, YB - 100, Z1 - 80, (sx1 - sx0) / 2 - 50, 50, 90, 10, 5);
  }
  for (const x of [x0 + 10, x1 - 10 - 55]) { a.box(x, YF + 80, sh + 120, x + 55, YB - 180, sh + 160); a.box(x + 5, YB - 200, sh - 50, x + 50, YB - 150, sh + 120); a.rect(x, YF + 80, x + 55, YB - 180, 'EQUIP-DETAIL'); }
  if (o.div) for (let i = 0; i < n; i++) { const mx = x0 + seatW * (i + 0.5); a.tube([[mx - 80, YB - 60, sh + 150], [mx, YF + 160, sh + 40]], [6, 6], 5); a.tube([[mx + 80, YB - 60, sh + 150], [mx, YF + 160, sh + 40]], [6, 6], 5); a.cyl(mx, YF + 160, sh + 40, sh + 55, 30, 8); }
  if (o.table) { a.box(x1 + 20, YF + 80, sh + 100, X1, YB - 220, sh + 130); a.box(x1 + 150, YB - 300, Z0 + 50, x1 + 190, YB - 260, sh + 100); a.rect(x1 + 20, YF + 80, X1, YB - 220, 'EQUIP-DETAIL'); }
}
P({ cat: 'furniture/seating', title: 'Generic business jet club seat',
  desc: (v) => v.div ? `Divan for ${v.n} on floor tracks: a base, ${cnt(v.n, 'seat cushion', 'seat cushions')} with leaning backs and headrests, two end arms and a lap belt for each place.` : `Swivel club seat on a column and floor tracks with a leaning back and headrest and two arms${v.table ? ', and a side table pulled out beside it' : ''}.`,
  vs: [['swivel seat', 28, 30, 38, 0, { n: 1 }], ['swivel seat with side table', 44, 30, 38, 0, { n: 1, table: true }], ['swivel seat, narrow, 24 in', 24, 28, 38, 0, { n: 1 }], ['two-place divan', 54, 28, 38, 0, { n: 2, div: true }], ['three-place divan', 80, 28, 38, 0, { n: 3, div: true }]],
  build: (a, v) => { clubSeat(a, v); a.log('Added the floor tracks, the column or divan base, the seat cushions, the leaning backs with headrests, the arms and any table or belts (plan and 3D).'); } });

// ================================================================ MORE HOSPITAL, SITE AND CAMP
/** Bathing seat for wet rooms: slatted seat on four legs with rubber feet, optional back and arms, or a wall-hinged fold-down seat. */
function bathSeat(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, sh = Z0 + (o.sh ?? 18 * IN), ns = 6;
  a.outline();
  if (o.fold) {
    a.box(X0 + 20, YB - 30, Z0 + 300, X1 - 20, YB, Z1); a.rect(X0 + 20, YB - 30, X1 - 20, YB, 'EQUIP-DETAIL');
    for (let i = 0; i < ns; i++) { const y = YF + 20 + ((D - 70) * i) / ns; a.box(X0 + 30, y + 3, sh - 25, X1 - 30, y + (D - 70) / ns - 3, sh); }
    a.rect(X0 + 30, YF + 20, X1 - 30, YB - 40, 'EQUIP-DETAIL');
    a.tube([[cx, YF + 40, Z0 + 20], [cx, YB - 40, sh - 30]], [12, 12], 8); a.cyl(cx, YF + 40, Z0, Z0 + 20, 20, 8);
    a.box(cx - 160, YB - 60, sh - 60, cx + 160, YB - 30, sh - 25);
    return;
  }
  for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 50], [X1 - 40, YB - 50]]) { a.tube([[x, y, Z0 + 25], [x, y, sh - 25]], [13, 13], 8); a.cyl(x, y, Z0, Z0 + 25, 20, 8); a.circ(x, y, 20, 'EQUIP-HIDDEN'); }
  a.xcyl(X0 + 40, X1 - 40, YF + 40, Z0 + 180, 8, 6); a.xcyl(X0 + 40, X1 - 40, YB - 50, Z0 + 180, 8, 6);
  for (let i = 0; i < ns; i++) { const y = YF + 20 + ((D - 70) * i) / ns; a.box(X0 + 20, y + 3, sh - 25, X1 - 20, y + (D - 70) / ns - 3, sh); }
  a.rect(X0 + 20, YF + 20, X1 - 20, YB - 50, 'EQUIP-DETAIL');
  if (o.back) { for (const x of [X0 + 50, X1 - 50]) a.tube([[x, YB - 50, sh], [x, YB - 60, Z1]], [12, 12], 8); for (let k = 0; k < 3; k++) a.box(X0 + 40, YB - 75, sh + 120 + k * 120, X1 - 40, YB - 45, sh + 200 + k * 120); }
  if (o.arms) for (const x of [X0 + 12, X1 - 12]) { a.tube([[x, YB - 60, sh + 220], [x, YF + 60, sh + 220]], [11, 11], 6); a.tube([[x, YF + 60, sh + 220], [x, YF + 60, sh]], [9, 9], 6); }
}
P({ cat: 'furniture/seating', title: 'Generic bathing seat, hospital wet room',
  desc: (v) => v.fold ? 'Wall-hinged fold-down shower seat: a wall plate, six slats and a single support leg with a foot pad, drawn in the down position.' : `Slatted bathing seat on four legs with rubber feet and two stretchers${v.back ? ', a slatted back' : ''}${v.arms ? ' and two arms' : ''}; seat height ${Math.round(v.sh / IN)} in.`,
  vs: [['stool, 18 in', 16, 14, 18, 0, { sh: 18 * IN }], ['with back, 20 in', 18, 16, 38, 0, { sh: 20 * IN, back: true }], ['with back and arms, 20 in', 22, 17, 38, 0, { sh: 20 * IN, back: true, arms: true }], ['wall-hinged fold-down seat, 17 in', 20, 16, 40, 0, { sh: 17 * IN, fold: true }]],
  build: (a, v) => { bathSeat(a, v); a.log('Added the slatted seat, the legs with feet and stretchers or the wall plate and support leg, and any back or arms (plan and 3D).'); } });

P({ cat: 'furniture/seating', title: 'Generic hospital corridor bench',
  desc: (v) => `Wipe-clean bench, ${v.w} in long, with an upholstered seat on two steel end frames${v.back ? ', a padded back' : ' and no back'}${v.arms ? ' and a centre arm divider' : ''}.`,
  vs: [['48 in, with back', 48, 20, 34, 0, { back: true }], ['72 in, with back and arm divider', 72, 20, 34, 0, { back: true, arms: true }], ['60 in, backless', 60, 18, 18, 0, { back: false }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, sh = Z0 + 440;
    a.outline();
    for (const x of v.arms ? [X0 + 60, cx, X1 - 60] : [X0 + 60, X1 - 60]) { a.box(x - 18, YF + 30, Z0, x + 18, YF + 60, sh - 60); a.box(x - 18, YB - (v.back ? 80 : 60), Z0, x + 18, YB - (v.back ? 50 : 30), sh - 60); a.box(x - 18, YF + 30, sh - 70, x + 18, YB - 30, sh - 50); a.box(x - 30, YF + 20, Z0, x + 30, YF + 70, Z0 + 18); a.rect(x - 18, YF + 30, x + 18, YB - 30, 'EQUIP-HIDDEN'); }
    cushion(a, X0 + 15, YF + 20, X1 - 15, YB - (v.back ? 100 : 30), sh - 50, sh + 50); a.rect(X0 + 15, YF + 20, X1 - 15, YB - (v.back ? 100 : 30), 'EQUIP-DETAIL');
    if (v.back) { xprism(a, [[YB - 110, sh], [YB - 40, sh], [YB - 40, Z1 - 20], [YB - 90, Z1 - 20]], X0 + 15, X1 - 15); a.rect(X0 + 15, YB - 110, X1 - 15, YB - 40, 'EQUIP-DETAIL'); }
    if (v.arms) { a.box(cx - 18, YF + 60, sh + 120, cx + 18, YB - 120, sh + 160); a.box(cx - 12, YB - 140, sh + 40, cx + 12, YB - 100, sh + 120); }
    a.log('Added the end frames, the upholstered seat and any back or centre arm divider (plan and 3D).');
  } });

P({ cat: 'furniture/seating', title: 'Generic nurse station chair',
  desc: (v) => v.stool ? `Tall stool on a five-star caster base with a seat, a back rest and a foot ring, for a raised nurse station counter; seat height 26 in.` : `Swivel task chair on a five-star caster base: a column, a padded seat, ${v.arms ? 'two arms, ' : 'no arms, '}${v.high ? 'a high back' : 'a mid back'}.`,
  vs: [['task chair, arms', 26, 26, 38, 0, { arms: true, mesh: true }], ['task chair, no arms', 24, 25, 38, 0, { arms: false, mesh: true }], ['task chair, high back, padded', 27, 27, 44, 0, { high: true, arms: true, mesh: false }], ['counter-height stool, 26 in', 24, 24, 35, 0, { stool: true, sh: 26 * IN, back: true, ring: true }]],
  build: (a, v) => { if (v.stool) procStool(a, v); else FU.officeChair(a, v); a.log('Added the star base with casters, the column, the seat, the back and any arms or foot ring (plan and 3D).'); } });

P({ cat: 'furniture/storage', title: 'Generic clean supply rack, ward store',
  desc: (v) => `Wire shelving rack on four casters, ${v.w} by ${v.d} in: four corner posts, ${v.sh} wire-grid shelves with front rails and a lower stretcher.`,
  vs: [['36 by 18 in, 4 shelves', 36, 18, 66, 0, { sh: 4 }], ['48 by 18 in, 5 shelves', 48, 18, 72, 0, { sh: 5 }], ['48 by 24 in, 6 shelves', 48, 24, 72, 0, { sh: 6 }], ['60 by 24 in, 5 shelves', 60, 24, 72, 0, { sh: 5 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline();
    for (const [x, y] of [[X0 + 25, YF + 25], [X1 - 25, YF + 25], [X0 + 25, YB - 25], [X1 - 25, YB - 25]]) { a.cyl(x, y, Z0 + 100, Z1, 14, 8); a.circ(x, y, 14, 'EQUIP-DETAIL'); a.caster(x, y, 120); }
    for (let i = 0; i < v.sh; i++) {
      const z = Z0 + 190 + ((Z1 - Z0 - 260) * i) / (v.sh - 1);
      a.xcyl(X0 + 25, X1 - 25, YF + 25, z, 6, 6); a.xcyl(X0 + 25, X1 - 25, YB - 25, z, 6, 6); for (const x of [X0 + 25, X1 - 25]) a.ycyl(YF + 25, YB - 25, x, z, 6, 6);
      for (let k = 1; k < 9; k++) a.ycyl(YF + 25, YB - 25, X0 + 25 + ((W - 50) * k) / 9, z - 8, 3, 4);
      a.box(X0 + 25, YF + 15, z - 30, X1 - 25, YF + 22, z + 25);
    }
    a.rect(X0 + 25, YF + 25, X1 - 25, YB - 25, 'EQUIP-DETAIL'); for (let k = 1; k < 9; k++) a.line(X0 + 25 + ((W - 50) * k) / 9, YF + 25, X0 + 25 + ((W - 50) * k) / 9, YB - 25, 'EQUIP-DETAIL');
    a.xcyl(X0 + 25, X1 - 25, YF + 25, Z0 + 140, 7, 6);
    a.log('Added the corner posts with casters, the wire-grid shelves with front rails and the lower stretcher (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic children waiting table, clinic play area',
  desc: (v) => v.maze ? 'Low square play table with a bead-maze: three curved wire tracks rising from the top on posts.' : `Child-height table, ${v.round ? v.w + ' in round' : v.w + ' by ' + v.d + ' in'}, ${v.h} in high, with a rounded edge band and four legs.`,
  vs: [['square, 24 in', 24, 24, 20, 0, {}], ['round, 36 in', 36, 36, 20, 0, { round: true }], ['bead maze play table, 24 in', 24, 24, 26, 0, { maze: true }]],
  build: (a, v) => {
    const { cx, cy, Z0, Z1, W } = a;
    const tb = v.maze ? new Acc({ x: a.X0, y: a.YF, z: a.Z0, w: a.W, h: a.H - 150 }) : a;
    if (v.round) tbl(tb, { round: true, base: 'legs', topT: 36, legR: 22 }); else tbl(tb, { topT: 36, base: 'legs', apron: 40, legR: 22, edge: v.maze ? 0 : 12 });
    if (v.maze) { a.add(tb.t); for (const p of tb.p) a.p.push(p); const zt = a.Z0 + a.H - 150; for (const [x, y, r] of [[-0.25, -0.2, 90], [0.2, 0.15, 110], [-0.1, 0.25, 70]]) { a.cyl(cx + x * W, cy + y * W, zt, zt + 8, 15, 8); a.tube([[cx + x * W - r, cy + y * W, zt + 8], [cx + x * W, cy + y * W + r * 0.7, zt + 100], [cx + x * W + r, cy + y * W, zt + 50], [cx + x * W, cy + y * W - r * 0.7, zt + 135]], [6, 6, 6, 6], 5); } }
    a.log('Added the top, the legs and the rounded edge band or the bead-maze tracks (plan and 3D).');
  } });

P({ cat: 'furniture/beds', title: 'Generic family sleeper bench, patient room window',
  desc: (v) => v.ext ? 'Window bench made up as a bed: a base cabinet, one long padded mattress deck and a pillow.' : `Window bench ${v.w} in long on a base cabinet with seat cushions and back cushions${v.dr ? ' and two drawer fronts below the seat' : ''}.`,
  vs: [['bench, 72 in', 72, 24, 34, 0, {}], ['bench with drawers, 72 in', 72, 24, 34, 0, { dr: true }], ['made up as a bed, 72 in', 72, 36, 20, 0, { ext: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, sh = Z0 + 430; a.outline();
    if (v.ext) { a.box(X0, YF, Z0 + 60, X1, YB, Z0 + 330); cushion(a, X0 + 10, YF + 10, X1 - 10, YB - 10, Z0 + 330, Z1); a.ell(X0 + 250, cx * 0 + (YF + YB) / 2, Z1 + 0, 230, 250, 0.5, 8, 3); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL'); a.line(X0 + 500, YF, X0 + 500, YB, 'EQUIP-DETAIL'); }
    else {
      a.box(X0, YF + 40, Z0 + 60, X1, YB, sh - 60); a.box(X0 + 10, YF + 20, Z0, X1 - 10, YF + 60, Z0 + 60);
      if (v.dr) for (let i = 0; i < 2; i++) { const x0 = X0 + 30 + i * ((W - 60) / 2), x1 = x0 + (W - 60) / 2 - 10; a.box(x0, YF + 22, Z0 + 90, x1, YF + 40, sh - 90); a.box((x0 + x1) / 2 - 60, YF + 10, Z0 + 250, (x0 + x1) / 2 + 60, YF + 22, Z0 + 270); }
      const n = 3; for (let i = 0; i < n; i++) { const x0 = X0 + ((W) * i) / n + 3, x1 = X0 + (W * (i + 1)) / n - 3; cushion(a, x0, YF + 40, x1, YB - 130, sh - 60, sh + 60); a.rect(x0, YF + 40, x1, YB - 130, 'EQUIP-DETAIL'); a.ell((x0 + x1) / 2, YB - 130, sh + 250, (x1 - x0) / 2 - 3, 60, 200, 12, 5); }
      a.box(X0, YB - 80, sh - 60, X1, YB, Z1 - 40); a.rect(X0, YB - 130, X1, YB, 'EQUIP-DETAIL');
    }
    a.log('Added the base cabinet, the seat and back cushions or the bed deck, any drawer fronts and the pillow (plan and 3D).');
  } });

P({ cat: 'furniture/storage', title: 'Generic site PPE rack, welfare area',
  desc: (v) => `Wall-mounted back board ${v.w} in wide with ${v.hooks} hooks for hard hats and coats on a rail${v.shelf ? ', a shelf above for helmets and gloves' : ''}${v.tray ? ' and a boot tray on the floor below' : ''}.`,
  vs: [['36 in, 6 hooks', 36, 6, 36, 0, { hooks: 6 }], ['48 in, 8 hooks, shelf', 48, 10, 48, 0, { hooks: 8, shelf: true }], ['72 in, 12 hooks, shelf and boot tray', 72, 18, 60, 0, { hooks: 12, shelf: true, tray: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline();
    a.box(X0, YB - 25, Z0 + (v.tray ? 100 : 0), X1, YB, Z1); a.rect(X0, YB - 25, X1, YB, 'EQUIP-DETAIL');
    a.box(X0, YB - 60, Z1 - 500, X1, YB - 25, Z1 - 460);
    for (let i = 0; i < v.hooks; i++) { const x = X0 + (W * (i + 0.5)) / v.hooks; a.tube([[x, YB - 60, Z1 - 480], [x, YB - 150, Z1 - 480], [x, YB - 190, Z1 - 420]], [9, 8, 8], 6); a.circ(x, YB - 150, 8, 'EQUIP-DETAIL'); }
    if (v.shelf) { a.box(X0, YB - 300, Z1 - 120, X1, YB - 25, Z1 - 90); a.box(X0, YB - 300, Z1 - 90, X1, YB - 285, Z1 - 20); a.rect(X0, YB - 300, X1, YB - 25, 'EQUIP-HIDDEN'); }
    if (v.tray) { a.box(X0 + 20, YB - 340, Z0, X1 - 20, YB - 25, Z0 + 60); for (let k = 0; k < 6; k++) a.box(X0 + 20, YB - 330 + k * 45, Z0 + 60, X1 - 20, YB - 310 + k * 45, Z0 + 80); a.rect(X0 + 20, YB - 340, X1 - 20, YB - 25, 'EQUIP-DETAIL'); }
    a.log('Added the back board, the hook rail with hooks and any shelf or boot tray (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic mine camp laundry folding table',
  desc: (v) => `Laundry sorting and folding table, ${v.w} by ${v.d} in, ${v.h} in high: a laminate top, a steel leg frame with a lower shelf and a back rail between the rear legs.`,
  vs: [['48 by 24 in', 48, 24, 36, 0, {}], ['60 by 30 in', 60, 30, 36, 0, {}], ['72 by 30 in', 72, 30, 36, 0, {}]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tt = 35; a.outline(); a.box(X0, YF, Z1 - tt, X1, YB, Z1);
    a.rect(X0 + 12, YF + 12, X1 - 12, YB - 12, 'EQUIP-DETAIL');
    for (const x of [X0 + 50, X1 - 50]) for (const y of [YF + 50, YB - 50]) { a.leg(x, y, Z0, Z1 - tt, 18); a.circ(x, y, 18, 'EQUIP-HIDDEN'); }
    a.box(X0 + 60, YF + 60, Z0 + 180, X1 - 60, YB - 60, Z0 + 200); a.rect(X0 + 60, YF + 60, X1 - 60, YB - 60, 'EQUIP-HIDDEN');
    a.xcyl(X0 + 50, X1 - 50, YB - 50, Z0 + 420, 10, 6);
    a.log('Added the top, the four legs, the lower shelf and the back rail (plan and 3D).');
  } });

export default fams;

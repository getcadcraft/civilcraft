/* SPDX-License-Identifier: Apache-2.0 */
/** Round 4 casework (2026-11-03): counters, stations, cases and fixtures for restaurants, airports, shopping centres and retail. 150 variants. */
import { fam, cab, tbl, pull, T, GAP, leaves, F, FU, M, S, C, O, A } from './r4-kit.mjs';

const fams = [];
const P = (f) => { fams.push(fam(f)); };
const IN = 25.4;
const cnt = (n, one, many) => `${n} ${n === 1 ? one : many}`;
/** Extrude a convex outline given in (y, z) between x0 and x1 (for sloped tops and wedges). */
function prismX(a, poly, x0, x1) {
  let s = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; s += p[0] * q[1] - q[0] * p[1]; }
  const pl = s < 0 ? [...poly].reverse() : poly, n = pl.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x1, ...pl[0]], [x1, ...pl[i]], [x1, ...pl[i + 1]]]); a.t.push([[x0, ...pl[0]], [x0, ...pl[i + 1]], [x0, ...pl[i]]]); }
  for (let i = 0; i < n; i++) { const p = pl[i], q = pl[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
}
const ring = (a, cx, cy, r0, r1, z0, z1, an0, an1, n, planLayer = 'EQUIP-DETAIL') => {
  for (let i = 0; i < n; i++) {
    const g0 = (an0 + ((an1 - an0) * i) / n) * Math.PI / 180, g1 = (an0 + ((an1 - an0) * (i + 1)) / n) * Math.PI / 180;
    const q = [[cx + Math.cos(g0) * r0, cy + Math.sin(g0) * r0], [cx + Math.cos(g1) * r0, cy + Math.sin(g1) * r0], [cx + Math.cos(g1) * r1, cy + Math.sin(g1) * r1], [cx + Math.cos(g0) * r1, cy + Math.sin(g0) * r1]];
    a.prism(q, z0, z1); if (planLayer) a.poly(q, planLayer);
  }
};
/** A flat monitor on a post, facing the front (−Y), at (x, y) with base z. */
function monitor(a, x, y, z, w = 340, h = 220) {
  a.box(x - 60, y - 40, z, x + 60, y + 40, z + 12); a.cyl(x, y, z + 12, z + 160, 14, 8);
  a.box(x - w / 2, y - 22, z + 160, x + w / 2, y + 4, z + 160 + h); a.rect(x - w / 2, y - 22, x + w / 2, y + 4, 'EQUIP-DETAIL');
}
/** A run of desk positions: check-in, gate, information, rental. o: n · topZ (counter height, mm) · ledge (raised ledge height) · scale · backH · lowW (mm of lower accessible section at the right) · printers · drawers */
function deskRun(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a;
  const topZ = Z0 + (o.topZ ?? 1000), tt = 45, n = o.n ?? 1, lowW = o.lowW ?? 0, lowZ = Z0 + 860, mainX1 = X1 - lowW;
  a.outline();
  a.box(X0, YF + 60, Z0, X1, YB, Z0 + 100); a.line(X0, YF + 60, X1, YF + 60, 'EQUIP-HIDDEN');
  a.box(X0, YF + 40, Z0 + 100, mainX1, YB, topZ - tt);
  if (lowW) a.box(mainX1, YF + 40, Z0 + 100, X1, YB, lowZ - tt);
  a.box(X0, YF, topZ - tt, mainX1, YB, topZ);
  if (lowW) a.box(mainX1, YF, lowZ - tt, X1, YB, lowZ);
  if (o.ledge) { a.box(X0, YF, topZ, mainX1, YF + 90, topZ + o.ledge); a.line(X0, YF + 90, mainX1, YF + 90, 'EQUIP-DETAIL'); }
  // front panel seams, one bay per position
  const pw = (mainX1 - X0) / n;
  for (let i = 0; i < n; i++) {
    const x0 = X0 + pw * i, x1 = x0 + pw;
    if (i) a.line(x0, YF + 40, x0, YB, 'EQUIP-DETAIL');
    a.box(x0 + 60, YF + 30, Z0 + 180, x1 - 60, YF + 40, topZ - tt - 140); a.rect(x0 + 60, YF + 30, x1 - 60, YF + 40, 'EQUIP-DETAIL');
    const cxp = (x0 + x1) / 2;
    if (o.scale) { a.box(x0 + 60, YF + 150, topZ, x0 + 700, YF + 580, topZ + 18); a.rect(x0 + 60, YF + 150, x0 + 700, YF + 580, 'EQUIP-DETAIL'); a.line(x0 + 80, YF + 365, x0 + 680, YF + 365, 'EQUIP-DETAIL'); }
    monitor(a, o.scale ? x1 - 280 : cxp, YB - 90, topZ, 340, 220);
    if (o.printers) { a.box(x1 - 240, YB - 330, topZ, x1 - 80, YB - 190, topZ + 110); a.rect(x1 - 240, YB - 330, x1 - 80, YB - 190, 'EQUIP-DETAIL'); }
    if (o.drawers) { a.box(cxp - 200, YB - 25, topZ - tt - 120, cxp + 200, YB, topZ - tt - 20); }
  }
  if (o.backH) { a.box(X0, YB - 36, topZ, mainX1, YB, o.backH + Z0); a.rect(X0, YB - 36, mainX1, YB, 'EQUIP-DETAIL'); a.box(X0 + 120, YB - 40, o.backH + Z0 - 140, mainX1 - 120, YB - 36, o.backH + Z0 - 60); }
  if (lowW) { a.line(mainX1, YF, mainX1, YB, 'EQUIP-DETAIL'); a.clear('knee space', mainX1, YF - 700, X1, YF, 700); }
}

// ================================================================ base cabinets, counters and stations
P({ cat: 'casework/base', title: 'Generic host stand',
  desc: (v) => `Floor-standing host stand ${v.w} in wide: a panelled base, a sloped writing top with a lip${v.tablet ? ' and a recessed tablet well' : ''}, a lower shelf and a drawer.`,
  vs: [['24 in', 24, 20, 44, 0, {}], ['30 in with tablet well', 30, 22, 44, 0, { tablet: true }], ['36 in with tablet well', 36, 24, 44, 0, { tablet: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, tz = Z0 + 1000;
    a.outline(); a.box(X0, YF + 40, Z0, X1, YB, Z0 + 90);
    a.box(X0 + 10, YF + 60, Z0 + 90, X1 - 10, YB - 20, tz - 60); a.box(X0, YB - 20, Z0 + 90, X1, YB, Z1);
    a.box(X0 + 10, YF + 40, Z0 + 150, X1 - 10, YF + 60, tz - 220); a.box(X0 + 30, YF + 60, Z0 + 600, X1 - 30, YF + 280, Z0 + 625);
    a.box(X0 + 30, YF + 36, tz - 200, X1 - 30, YF + 60, tz - 70); pull(a, 'bar', cx, tz - 135, YF + 36);
    prismX(a, [[YF, tz - 20], [YB - 20, tz + 100], [YB - 20, tz + 60], [YF, tz - 80]], X0, X1);
    a.box(X0, YF, tz - 20, X1, YF + 30, tz + 20);
    if (v.tablet) { a.box(cx - 130, YF + 100, tz + 12, cx + 130, YF + 300, tz + 32); a.rect(cx - 130, YF + 100, cx + 130, YF + 300, 'EQUIP-DETAIL'); }
    a.rect(X0 + 10, YF + 60, X1 - 10, YB - 20, 'EQUIP-DETAIL'); a.line(X0, YF + 30, X1, YF + 30, 'EQUIP-DETAIL');
    a.log('Added the plinth, the base panels, the drawer, the lower shelf and the sloped top with its lip (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic server station',
  desc: (v) => `Restaurant server station ${v.w} in wide: a base with ${v.doors} doors and a drawer row, a toe kick, a top${v.hutch ? ' and a hutch with two open shelves and a rail' : ''}.`,
  vs: [['36 in, low', 36, 20, 38, 0, { doors: 2 }], ['48 in, with hutch', 48, 20, 56, 0, { doors: 2, hutch: true }], ['60 in, with hutch', 60, 24, 56, 0, { doors: 3, hutch: true }], ['72 in, with hutch', 72, 24, 58, 0, { doors: 4, hutch: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a, bt = Z0 + 36 * IN;
    cab(a, { toe: 90, drawers: 1, drawerH: 170, drawerCols: v.doors > 2 ? 3 : 2, doors: v.doors, pull: 'bar', topT: 32, swing: true, ...{} });
    if (v.hutch) {
      for (const x of [X0 + 10, X1 - 40]) a.box(x, YB - 260, bt, x + 30, YB - 20, Z1);
      for (let i = 1; i <= 2; i++) { const z = bt + ((Z1 - bt) * i) / 3; a.box(X0 + 10, YB - 260, z, X1 - 10, YB - 20, z + 22); a.box(X0 + 10, YB - 270, z + 22, X1 - 10, YB - 258, z + 60); }
      a.box(X0 + 10, YB - 260, Z1 - 30, X1 - 10, YB - 20, Z1); a.box(X0 + 20, YB - 20, bt, X1 - 20, YB, Z1);
      a.rect(X0 + 10, YB - 260, X1 - 10, YB - 20, 'EQUIP-DETAIL');
    }
    a.log('Added the drawer row over the doors, the toe kick, the top and the hutch if listed (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic bar front',
  desc: (v) => `Bar counter ${v.w / 12} ft long: ${v.padded ? 'a padded, tufted front' : 'a front of vertical panels'}, a top with an arm rail edge, a brass foot rail and the working side open to the back bar.`,
  vs: [['6 ft, panelled', 72, 24, 42, 0, {}], ['8 ft, panelled', 96, 24, 42, 0, {}], ['12 ft, panelled', 144, 26, 42, 0, {}], ['12 ft, padded front', 144, 26, 42, 0, { padded: true }], ['16 ft, padded front', 192, 26, 42, 0, { padded: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tz = Z1, tt = 50;
    a.outline(); a.box(X0, YF + 20, Z0, X1, YF + 80, Z0 + 90); a.line(X0, YF + 80, X1, YF + 80, 'EQUIP-HIDDEN');
    a.box(X0 + 20, YF + 80, Z0 + 90, X1 - 20, YB, tz - tt);
    a.box(X0, YF, tz - tt, X1, YB, tz);
    a.xcyl(X0 + 10, X1 - 10, YF + 30, tz + 5, 38, 12); a.line(X0, YF + 70, X1, YF + 70, 'EQUIP-DETAIL');   // arm rest roll
    const np = Math.max(4, Math.round(W / 480));
    for (let i = 0; i < np; i++) { const x0 = X0 + 20 + ((W - 40) * i) / np + 6, x1 = X0 + 20 + ((W - 40) * (i + 1)) / np - 6; a.box(x0, YF + 55, Z0 + 120, x1, YF + 80, tz - tt - 30); a.rect(x0, YF + 55, x1, YF + 80, 'EQUIP-DETAIL'); if (v.padded) { a.ell((x0 + x1) / 2, YF + 62, (Z0 + 120 + tz - tt - 30) / 2, (x1 - x0) / 2 - 2, 14, (tz - tt - Z0 - 150) / 2 - 2, 10, 5); } }
    a.xcyl(X0 + 40, X1 - 40, YF + 25, Z0 + 200, 24, 14); for (let x = X0 + 150; x < X1 - 100; x += 700) a.box(x - 12, YF + 20, Z0 + 90, x + 12, YF + 55, Z0 + 200);
    a.line(X0 + 40, YF + 25, X1 - 40, YF + 25, 'EQUIP-HIDDEN');
    a.box(X0 + 20, YB - 100, tz - tt - 200, X1 - 20, YB - 20, tz - tt); a.line(X0 + 20, YB - 100, X1 - 20, YB - 100, 'EQUIP-HIDDEN');
    a.log('Added the plinth, the carcass, the panelled or padded front, the arm roll, the foot rail and the rear shelf (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic curved bar counter',
  desc: (v) => `Curved bar counter sweeping ${v.sweep} degrees on ${v.seg} straight segments: panelled front, a top with an arm roll and a foot rail along the curve.`,
  vs: [['quarter circle, 3 ft radius', 36, 36, 42, 0, { sweep: 90, seg: 8 }], ['quarter circle, 4 ft radius', 48, 48, 42, 0, { sweep: 90, seg: 10 }], ['half circle, 6 ft diameter', 72, 36, 42, 0, { sweep: 180, seg: 14 }]],
  build: (a, v) => {
    const R = v.sweep === 180 ? a.W / 2 : a.W, cx = v.sweep === 180 ? a.cx : a.X0, cy = a.YF, dep = 650;
    a.outline('EQUIP-HIDDEN'); ring(a, cx, cy, R - dep, R, a.Z0, a.Z0 + 90, 0, v.sweep, v.seg, null);
    ring(a, cx, cy, R - dep + 20, R - 70, a.Z0 + 90, a.Z1 - 50, 0, v.sweep, v.seg, 'EQUIP');
    ring(a, cx, cy, R - dep, R, a.Z1 - 50, a.Z1, 0, v.sweep, v.seg, 'EQUIP');
    const pts = []; for (let i = 0; i <= v.seg; i++) { const g = ((v.sweep * i) / v.seg) * Math.PI / 180; pts.push([cx + Math.cos(g) * (R - 45), cy + Math.sin(g) * (R - 45), a.Z0 + 200]); }
    a.tube(pts, pts.map(() => 22), 10); a.arc(cx, cy, R - 45, 0, v.sweep, 'EQUIP-HIDDEN');
    ring(a, cx, cy, R - 70, R - 45, a.Z0 + 90, a.Z1 - 50, 0, v.sweep, v.seg, null);
    a.log('Added the segmented plinth, the curved front, the top and the curved foot rail (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic back bar base',
  desc: (v) => `Back bar base cabinet ${v.w} in wide: ${v.doors} doors${v.glass ? ' with glass panes' : ''} under a counter top, a row of drawers, a toe kick and bar pulls.`,
  vs: [['48 in', 48, 24, 36, 0, { doors: 2 }], ['60 in, glass doors', 60, 24, 36, 0, { doors: 3, glass: true }], ['72 in', 72, 24, 36, 0, { doors: 3 }], ['96 in, glass doors', 96, 24, 36, 0, { doors: 4, glass: true }]],
  build: (a, v) => { cab(a, { toe: 100, drawers: 1, drawerH: 150, drawerCols: v.doors, doors: v.doors, glass: v.glass, pull: 'bar', topT: 38, swing: true }); a.log('Added the drawer row over the doors, the toe kick and the counter top (plan and 3D).'); } });

P({ cat: 'casework/base', title: 'Generic kitchen expo counter',
  desc: (v) => `Expo pass counter ${v.w / 12} ft long: an open-bay base, a top, and a heat lamp rail on two posts with ${v.lamps} lamps over the pass.`,
  vs: [['6 ft', 72, 30, 62, 0, { lamps: 3 }], ['8 ft', 96, 30, 62, 0, { lamps: 4 }], ['10 ft', 120, 30, 62, 0, { lamps: 5 }], ['12 ft', 144, 30, 62, 0, { lamps: 6 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cy } = a, tz = Z0 + 36 * IN;
    cab(a, { open: true, cols: Math.round(W / 700), shelves: 1, toe: 90, topT: 0 }); a.box(X0, YF, tz - 45, X1, YB, tz); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL');
    for (const x of [X0 + 30, X1 - 60]) a.box(x, cy - 30, tz, x + 30, cy + 30, Z1);
    a.box(X0 + 30, cy - 90, Z1 - 60, X1 - 30, cy + 90, Z1 - 30);
    for (let i = 0; i < v.lamps; i++) { const x = X0 + 150 + ((W - 300) * i) / Math.max(1, v.lamps - 1); a.cone(x, cy, Z1 - 200, Z1 - 60, 40, 80, 10); a.circ(x, cy, 50, 'EQUIP-DETAIL'); }
    a.box(X0 + 120, cy - 100, Z1 - 360, X1 - 120, cy + 100, Z1 - 340);
    a.log('Added the open-bay base, the top, the two posts, the lamp rail with heat lamps and the warming shelf (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic point of sale counter',
  desc: (v) => `Point of sale counter ${v.w} in wide: a base of ${v.dr} drawers and a door, a top with a raised customer ledge, ${cnt(v.terms, 'register terminal', 'register terminals')} with a screen, a card reader and a cash drawer.`,
  vs: [['36 in, 1 terminal', 36, 28, 54, 0, { dr: 1, terms: 1 }], ['48 in, 1 terminal', 48, 28, 54, 0, { dr: 2, terms: 1 }], ['60 in, 2 terminals', 60, 28, 54, 0, { dr: 2, terms: 2 }], ['72 in, 2 terminals', 72, 28, 54, 0, { dr: 3, terms: 2 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tz = Z0 + 38 * IN;
    cab(a, { toe: 100, drawers: 1, drawerH: 150, drawerCols: v.dr, doors: v.dr > 1 ? 2 : 1, pull: 'bar', topT: 40, swing: false });
    a.box(X0, YF, tz, X1, YF + 70, tz + 100); a.line(X0, YF + 70, X1, YF + 70, 'EQUIP-DETAIL');
    for (let i = 0; i < v.terms; i++) {
      const x = X0 + (W * (i + 0.5)) / v.terms;
      monitor(a, x, YB - 120, tz, 300, 220); a.box(x - 200, YF + 150, tz, x - 50, YF + 280, tz + 25); a.rect(x - 200, YF + 150, x - 50, YF + 280, 'EQUIP-DETAIL');
      a.box(x + 50, YB - 330, tz, x + 330, YB - 130, tz + 18); a.rect(x + 50, YB - 330, x + 330, YB - 130, 'EQUIP-DETAIL');
    }
    a.log('Added the drawer and door base, the top with the raised ledge, each terminal with its screen, card reader and cash drawer (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic banquette base cabinet',
  desc: (v) => `Cabinet base for built-in seating, ${v.w} in long: ${v.doors} access doors, a toe kick and a top deck with hinged lids over storage.`,
  vs: [['48 in', 48, 20, 17, 0, { doors: 2 }], ['72 in', 72, 20, 17, 0, { doors: 3 }], ['96 in', 96, 20, 17, 0, { doors: 4 }]],
  build: (a, v) => {
    cab(a, { toe: 80, doors: v.doors, pull: 'recess', swing: false });
    const { X0, X1, YF, YB, Z1, W } = a; a.box(X0 - 0, YF, Z1 - 30, X1, YB, Z1);
    for (let i = 0; i < v.doors; i++) { const x0 = X0 + (W * i) / v.doors + 6, x1 = X0 + (W * (i + 1)) / v.doors - 6; a.box(x0, YF + 20, Z1 - 4, x1, YB - 20, Z1 + 0.01); a.rect(x0, YF + 20, x1, YB - 20, 'EQUIP-DETAIL'); }
    a.log('Added the toe kick, the access doors and the top deck with its lids (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic check-in counter',
  desc: (v) => `Airport check-in counter with ${cnt(v.n, 'position', 'positions')}: a panelled base, a top with a baggage scale plate, a monitor on a post, a tag printer, a cash drawer and a raised back panel.`,
  vs: [['1 position', 72, 30, 60, 0, { n: 1 }], ['2 positions', 120, 30, 60, 0, { n: 2 }], ['3 positions', 180, 30, 60, 0, { n: 3 }], ['4 positions', 240, 30, 60, 0, { n: 4 }]],
  build: (a, v) => { deskRun(a, { n: v.n, scale: true, topZ: 1000, printers: true, drawers: true, backH: 1480 }); a.log('Added the base panels, the top, each position with its scale plate, monitor, printer and drawer, and the back panel (plan and 3D).'); } });

P({ cat: 'casework/base', title: 'Generic bag drop counter',
  desc: (v) => `Bag drop position ${v.w / 12} ft long: a low belt unit with side guides and a weighing zone in front, and a staffed counter behind with a monitor and a tag printer.`,
  vs: [['8 ft', 96, 60, 50, 0, {}], ['10 ft', 120, 60, 50, 0, {}], ['12 ft', 144, 66, 50, 0, {}]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D } = a, cd = 640, tz = Z0 + 1000, bz = Z0 + 520, by0 = YF + 40, by1 = YB - cd - 40;
    a.outline();
    a.box(X0, by0, Z0, X1, by1, bz - 20); a.box(X0, by0, bz - 20, X1, by1, bz); a.rect(X0, by0, X1, by1, 'EQUIP');
    for (let x = X0 + 60; x < X1 - 40; x += 60) a.line(x, by0 + 40, x, by1 - 40, 'EQUIP-DETAIL');
    a.box(X0 + 120, by0 + 30, bz, X1 - 120, by1 - 30, bz + 14);
    for (const y of [by0, by1 - 40]) a.box(X0, y, bz, X1, y + 40, bz + 150);
    a.box(X0 + 300, by0 + 20, bz + 14, X0 + 304, by0 + 22, bz + 16); a.rect(X0 + 150, by0 + 80, X0 + 750, by1 - 80, 'EQUIP-DETAIL');
    a.box(X0, YB - cd, Z0, X1, YB, tz - 45); a.box(X0, YB - cd - 20, tz - 45, X1, YB, tz); a.rect(X0, YB - cd, X1, YB, 'EQUIP');
    monitor(a, X1 - 500, YB - 90, tz, 340, 220); a.box(X1 - 340, YB - 330, tz, X1 - 160, YB - 180, tz + 110); a.rect(X1 - 340, YB - 330, X1 - 160, YB - 180, 'EQUIP-DETAIL');
    a.box(X0, YB - 36, tz, X1, YB, Z1);
    a.log('Added the belt unit with rollers and side guides, the weighing zone, the counter and its equipment (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic gate counter',
  desc: (v) => `Boarding gate counter with ${cnt(v.n, 'position', 'positions')}: a panelled base, a top with a short customer ledge, a monitor and a drawer for each position, and a toe kick.`,
  vs: [['1 position', 48, 28, 52, 0, { n: 1 }], ['2 positions', 84, 28, 52, 0, { n: 2 }], ['3 positions', 126, 28, 52, 0, { n: 3 }], ['4 positions', 168, 28, 52, 0, { n: 4 }]],
  build: (a, v) => { deskRun(a, { n: v.n, topZ: 1050, ledge: 60, drawers: true }); a.log('Added the base panels, the top and ledge, and each position with its monitor and drawer (plan and 3D).'); } });

P({ cat: 'casework/base', title: 'Generic information desk',
  desc: (v) => `Information desk with ${cnt(v.n, 'standing position', 'standing positions')} at 42 in and a lower 34 in section at one end with an open knee space; raised customer ledge and monitors.`,
  vs: [['1 position with low end', 96, 32, 60, 0, { n: 1 }], ['2 positions with low end', 132, 32, 60, 0, { n: 2 }], ['3 positions with low end', 180, 32, 60, 0, { n: 3 }], ['4 positions with low end', 228, 32, 60, 0, { n: 4 }]],
  build: (a, v) => { deskRun(a, { n: v.n, topZ: 1070, ledge: 110, lowW: 910, drawers: true }); a.log('Added the base, the standing-height top with ledge, the lower accessible section and its knee space, and the monitors (plan and 3D).'); } });

P({ cat: 'casework/base', title: 'Generic rental counter',
  desc: (v) => `Vehicle rental counter with ${cnt(v.n, 'position', 'positions')}: a panelled base, a top with a raised ledge, a monitor, a printer and a drawer at each position, and a high back panel.`,
  vs: [['2 positions', 96, 30, 60, 0, { n: 2 }], ['3 positions', 144, 30, 60, 0, { n: 3 }], ['4 positions', 192, 30, 60, 0, { n: 4 }]],
  build: (a, v) => { deskRun(a, { n: v.n, topZ: 1000, ledge: 100, printers: true, drawers: true, backH: 1480 }); a.log('Added the base panels, the top with ledge, each position with its monitor, printer and drawer, and the back panel (plan and 3D).'); } });

P({ cat: 'casework/base', title: 'Generic security divest table',
  desc: (v) => `Screening divest table ${v.w / 12} ft long: a roller bed with side lips and an end stop on a steel leg frame${v.shelf ? ', with a lower shelf for returned bins' : ''}.`,
  vs: [['6 ft', 72, 30, 36, 0, {}], ['8 ft', 96, 30, 36, 0, {}], ['10 ft, with bin shelf', 120, 30, 36, 0, { shelf: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tz = Z1;
    a.outline();
    a.box(X0, YF, tz - 60, X1, YF + 40, tz - 10); a.box(X0, YB - 40, tz - 60, X1, YB, tz - 10);
    a.box(X0, YF + 40, tz - 40, X1, YB - 40, tz - 30);
    for (let x = X0 + 40; x < X1 - 30; x += 70) { a.ycyl(YF + 40, YB - 40, x, tz - 18, 22, 10); a.line(x, YF + 40, x, YB - 40, 'EQUIP-DETAIL'); }
    a.box(X0, YF, tz - 10, X1, YF + 40, tz + 50); a.box(X0, YB - 40, tz - 10, X1, YB, tz + 50); a.box(X1 - 40, YF + 40, tz - 10, X1, YB - 40, tz + 90);
    for (const x of [X0 + 100, X1 - 100]) for (const y of [YF + 60, YB - 60]) { a.box(x - 25, y - 25, Z0, x + 25, y + 25, tz - 60); a.rect(x - 25, y - 25, x + 25, y + 25, 'EQUIP-HIDDEN'); }
    a.box(X0 + 100, YF + 35, tz - 200, X1 - 100, YF + 85, tz - 160); a.box(X0 + 100, YB - 85, tz - 200, X1 - 100, YB - 35, tz - 160);
    if (v.shelf) { a.box(X0 + 120, YF + 80, Z0 + 250, X1 - 120, YB - 80, Z0 + 280); a.rect(X0 + 120, YF + 80, X1 - 120, YB - 80, 'EQUIP-HIDDEN'); }
    a.log('Added the roller bed, the side lips, the end stop, the leg frame and the lower shelf if listed (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic screening lane roller bed',
  desc: (v) => `Screening lane roller bed ${v.w / 12} ft long with tall side guides, an end stop and a leg frame; rollers run the length of the bed.`,
  vs: [['6 ft', 72, 36, 36, 0, {}], ['8 ft', 96, 36, 36, 0, {}]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a, tz = Z0 + 30 * IN;
    a.outline();
    a.box(X0, YF + 40, tz - 90, X1, YB - 40, tz - 70); for (let x = X0 + 40; x < X1 - 30; x += 70) { a.ycyl(YF + 60, YB - 60, x, tz - 50, 22, 10); a.line(x, YF + 60, x, YB - 60, 'EQUIP-DETAIL'); }
    for (const y of [YF, YB - 40]) { a.box(X0, y, tz - 110, X1, y + 40, Z1); a.rect(X0, y, X1, y + 40, 'EQUIP-DETAIL'); }
    a.box(X1 - 40, YF + 40, tz - 70, X1, YB - 40, tz + 160);
    for (const x of [X0 + 90, X1 - 130]) for (const y of [YF + 60, YB - 60]) { a.box(x - 25, y - 25, Z0, x + 25, y + 25, tz - 90); a.rect(x - 25, y - 25, x + 25, y + 25, 'EQUIP-HIDDEN'); }
    a.xcyl(X0 + 90, X1 - 130, a.cy, Z0 + 150, 12, 8);
    a.log('Added the roller bed, the tall side guides, the end stop and the leg frame (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic lounge hospitality counter',
  desc: (v) => `Self-serve lounge counter ${v.w / 12} ft long: a doored base with a toe kick, a top that overhangs the front by 12 in on corbels for stools, and a raised back ledge.`,
  vs: [['6 ft', 72, 36, 42, 0, { doors: 3 }], ['8 ft', 96, 36, 42, 0, { doors: 4 }], ['10 ft', 120, 36, 42, 0, { doors: 5 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tz = Z1 - 100, oh = 300, cd = a.D - oh;
    a.outline(); a.box(X0 + 20, YB - cd + 60, Z0, X1 - 20, YB, Z0 + 100);
    a.box(X0, YB - cd, Z0 + 100, X1, YB, tz - 40); a.box(X0, YF, tz - 40, X1, YB, tz); a.box(X0, YB - 60, tz, X1, YB, Z1);
    const L = leaves(X0, X1, v.doors);
    for (const lf of L) { a.box(lf.a, YB - cd - 19, Z0 + 120, lf.b, YB - cd, tz - 60); pull(a, 'bar', (lf.a + lf.b) / 2, tz - 150, YB - cd - 19); a.line(lf.a, YB - cd, lf.a, YB - cd - 19, 'EQUIP-DETAIL'); }
    for (let i = 0; i <= 3; i++) { const x = X0 + 80 + ((W - 160) * i) / 3; a.box(x - 20, YF + 20, tz - 140, x + 20, YB - cd, tz - 40); }
    a.line(X0, YB - cd, X1, YB - cd, 'EQUIP-HIDDEN');
    a.log('Added the doored base, the overhanging top with corbels and the raised back ledge (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic cash wrap',
  desc: (v) => `Retail cash wrap ${v.w} in long: an open-frame display case section at the left, a solid base with drawers and doors for the register at the right, a lower bag shelf and a toe kick.`,
  vs: [['48 in', 48, 30, 38, 0, { frac: 0.4 }], ['60 in', 60, 30, 38, 0, { frac: 0.4 }], ['72 in', 72, 30, 38, 0, { frac: 0.45 }], ['96 in', 96, 30, 38, 0, { frac: 0.5 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, cx1 = X0 + W * v.frac, tt = 40;
    a.outline(); a.box(X0, YF + 70, Z0, X1, YB, Z0 + 100); a.line(X0, YF + 70, X1, YF + 70, 'EQUIP-HIDDEN');
    // solid base (right)
    a.box(cx1, YF + 20, Z0 + 100, X1, YB, Z1 - tt); a.box(cx1, YF, Z1 - tt, X1, YB, Z1);
    const rw = X1 - cx1, nd = Math.max(1, Math.round(rw / 450));
    for (let i = 0; i < nd; i++) { const x0 = cx1 + (rw * i) / nd + GAP, x1 = cx1 + (rw * (i + 1)) / nd - GAP; a.box(x0, YF, Z1 - tt - 170, x1, YF + 20, Z1 - tt - GAP); pull(a, 'bar', (x0 + x1) / 2, Z1 - tt - 90, YF); a.box(x0, YF, Z0 + 100 + GAP, x1, YF + 20, Z1 - tt - 175); pull(a, 'bar', (x0 + x1) / 2, Z0 + 500, YF); }
    // glass case (left): frame, shelf, glass top
    const gx0 = X0, gx1 = cx1 - 10;
    a.box(gx0, YF + 20, Z0 + 100, gx1, YB, Z0 + 330);
    for (const x of [gx0, gx1 - 30]) a.box(x, YF, Z0 + 330, x + 30, YF + 30, Z1 - 30); for (const x of [gx0, gx1 - 30]) a.box(x, YB - 30, Z0 + 330, x + 30, YB, Z1 - 30);
    a.box(gx0, YF, Z1 - 30, gx1, YB, Z1);
    a.box(gx0 + 30, YF + 40, Z0 + 600, gx1 - 30, YB - 40, Z0 + 612);
    a.rect(gx0 + 30, YF + 30, gx1 - 30, YB - 30, 'EQUIP-DETAIL'); a.rect(gx0, YF, gx1, YB, 'EQUIP');
    a.box(cx1 + 60, YB - 330, Z1, X1 - 60, YB - 130, Z1 + 18); a.rect(cx1 + 60, YB - 330, X1 - 60, YB - 130, 'EQUIP-DETAIL');
    a.box(cx1 + 60, YB - 150, Z0 + 300, X1 - 60, YB - 10, Z0 + 320);
    a.log('Added the open-frame case with its shelf, the solid base with drawers and doors, the register mat and the toe kick (plan and 3D).');
  } });

function showcase(a, o = {}) {
  const { X0, X1, YF, YB, Z0, W } = a, Z1 = o.top ?? a.Z1, gz0 = Z0 + (o.base ?? 330), gz1 = Z1 - 40;
  a.outline(); a.box(X0 + 10, YF + 60, Z0, X1 - 10, YB, Z0 + 90); a.line(X0 + 10, YF + 60, X1 - 10, YF + 60, 'EQUIP-HIDDEN');
  a.box(X0, YF + 20, Z0 + 90, X1, YB, gz0); a.box(X0, YF, gz1, X1, YB, Z1);
  const bays = o.bays ?? Math.max(2, Math.round(W / 600));
  for (let i = 0; i <= bays; i++) { const x = i === 0 ? X0 : i === bays ? X1 - 28 : X0 + (W * i) / bays - 14; a.box(x, YF, gz0, x + 28, YF + 28, gz1); a.box(x, YB - 28, gz0, x + 28, YB, gz1); }
  for (let k = 1; k <= (o.shelves ?? 1); k++) { const z = gz0 + ((gz1 - gz0) * k) / ((o.shelves ?? 1) + 1); a.box(X0 + 28, YF + 28, z, X1 - 28, YB - 28, z + 10); }
  a.box(X0 + 28, YF + 30, gz1 - 30, X1 - 28, YF + 44, gz1); a.line(X0 + 28, YF + 37, X1 - 28, YF + 37, 'EQUIP-DETAIL');
  a.rect(X0 + 28, YF + 28, X1 - 28, YB - 28, 'EQUIP-DETAIL');
  if (o.doors) for (let i = 0; i < o.doors; i++) { const x0 = X0 + (W * i) / o.doors + 10, x1 = X0 + (W * (i + 1)) / o.doors - 10; a.box(x0, YF + 20 - 8, Z0 + 120, x1, YF + 20, gz0 - 30); pull(a, 'recess', (x0 + x1) / 2, gz0 - 100, YF + 12); }
}
P({ cat: 'casework/base', title: 'Generic glass display counter',
  desc: (v) => `Display counter ${v.w} in long: ${cnt(Math.max(2, Math.round(v.w * IN / 600)), 'glazing bay', 'glazing bays')} drawn as open frames, with a mid shelf, a lit top rail, a doored lower band and a toe kick.`,
  vs: [['48 in', 48, 24, 38, 0, { doors: 2 }], ['60 in', 60, 24, 38, 0, { doors: 2 }], ['72 in', 72, 24, 38, 0, { doors: 3 }], ['96 in', 96, 24, 38, 0, { doors: 4 }]],
  build: (a, v) => { showcase(a, { doors: v.doors }); a.log('Added the toe kick, the doored lower band, the frame bays with posts and a shelf, and the lit top rail (plan and 3D).'); } });

P({ cat: 'casework/base', title: 'Generic jewelry display case',
  desc: (v) => `Jewelry counter ${v.w} in long: a drawer and door base, a low glass case with a sloped glazed front and a flat glass top, and a lit shelf inside.`,
  vs: [['48 in', 48, 24, 38, 0, { doors: 2 }], ['60 in', 60, 24, 38, 0, { doors: 3 }], ['72 in', 72, 24, 38, 0, { doors: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a, bz = Z0 + 760;
    cab(a, { toe: 100, drawers: 1, drawerH: 150, doors: v.doors, pull: 'bar', topT: 35, swing: false });
    a.box(X0, YF, Z0 + 725, X1, YB, bz);
    for (const x of [X0, X1 - 25]) prismX(a, [[YF, bz], [YB, bz], [YB, Z1], [YF + 100, Z1]], x, x + 25);
    prismX(a, [[YF, bz], [YF + 100, Z1], [YF + 100, Z1 - 8], [YF, bz + 8]], X0 + 25, X1 - 25);
    a.box(X0 + 25, YB - 25, bz, X1 - 25, YB, Z1); a.box(X0 + 25, YF + 100, Z1 - 20, X1 - 25, YB, Z1);
    a.box(X0 + 40, YF + 130, bz + 120, X1 - 40, YB - 25, bz + 135); a.line(X0 + 25, YF + 100, X1 - 25, YF + 100, 'EQUIP-DETAIL');
    a.log('Added the drawer and door base, the side frames, the sloped glazed front, the glass top and the inner shelf (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic cosmetics display counter',
  desc: (v) => `Cosmetics counter ${v.w} in long: a lit open-frame case with a tester shelf, a doored base, and a raised mirror panel at the back on two uprights.`,
  vs: [['48 in', 48, 24, 74, 0, { doors: 2 }], ['72 in', 72, 24, 74, 0, { doors: 3 }], ['96 in', 96, 24, 74, 0, { doors: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tz = Z0 + 38 * IN;
    showcase(a, { doors: v.doors, shelves: 1, top: tz });
    a.box(X0 + 20, YB - 20, tz, X1 - 20, YB - 4, Z1); a.frame(X0 + 20, tz, X1 - 20, Z1, YB - 30, YB - 4, 30); a.rect(X0 + 20, YB - 30, X1 - 20, YB - 4, 'EQUIP-DETAIL');
    a.box(X0 + 60, YB - 220, tz + 900, X1 - 60, YB - 30, tz + 920);
    a.log('Added the open-frame case with its shelf, the drawer base and the raised framed mirror panel with a shelf (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic pharmacy dispensing counter',
  desc: (v) => `Pharmacy dispensing counter with ${cnt(v.n, 'window position', 'window positions')}: a base with drawers, a raised customer ledge, a high privacy back panel and a monitor, a printer and a cash drawer at each position.`,
  vs: [['2 positions', 84, 32, 66, 0, { n: 2 }], ['3 positions', 126, 32, 66, 0, { n: 3 }], ['4 positions', 168, 32, 66, 0, { n: 4 }]],
  build: (a, v) => { deskRun(a, { n: v.n, topZ: 1000, ledge: 120, printers: true, drawers: true, backH: 1620 }); a.log('Added the base, the top with ledge, the privacy back panel and each position with its monitor, printer and drawer (plan and 3D).'); } });

P({ cat: 'casework/base', title: 'Generic mall kiosk base',
  desc: (v) => v.hex ? 'Hexagonal kiosk base: six panelled sides, a counter top and a door on one side; open centre for the attendant.' : `${v.w} by ${v.d} in kiosk base: panelled sides, a counter top all round, a shelf inside and a door on the back side.`,
  vs: [['square, 48 in', 48, 48, 42, 0, {}], ['rectangular, 72 by 36 in', 72, 36, 42, 0, {}], ['hexagonal, 72 in', 72, 62, 42, 0, { hex: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, tt = 45;
    if (v.hex) {
      const R = W / 2, pts = Array.from({ length: 6 }, (_, i) => [cx + Math.cos((i * Math.PI) / 3) * R, cy + Math.sin((i * Math.PI) / 3) * R * (D / W / 0.866)]);
      a.prism(pts, Z0 + 90, Z1 - tt); a.prism(pts, Z1 - tt, Z1); a.poly(pts);
      const inner = pts.map(([x, y]) => [cx + (x - cx) * 0.8, cy + (y - cy) * 0.8]); a.prism(pts.map(([x, y]) => [cx + (x - cx) * 0.92, cy + (y - cy) * 0.92]), Z0, Z0 + 90); a.poly(inner, 'EQUIP-DETAIL');
      for (let i = 0; i < 6; i++) { const p = pts[i], q = pts[(i + 1) % 6]; a.line(p[0], p[1], q[0], q[1], 'EQUIP-DETAIL'); }
    } else {
      a.outline(); a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 90); a.box(X0 + 10, YF + 10, Z0 + 90, X1 - 10, YB - 10, Z1 - tt); a.box(X0, YF, Z1 - tt, X1, YB, Z1);
      const np = Math.max(2, Math.round(W / 450)); for (let i = 0; i < np; i++) { const x0 = X0 + 40 + ((W - 80) * i) / np + 6, x1 = X0 + 40 + ((W - 80) * (i + 1)) / np - 6; a.box(x0, YF, Z0 + 140, x1, YF + 10, Z1 - tt - 60); a.rect(x0, YF, x1, YF + 10, 'EQUIP-DETAIL'); }
      a.box(X0 + 40, YB - 10, Z0 + 140, X0 + 40 + 480, YB, Z1 - tt - 60); a.line(X0 + 40, YB, X0 + 520, YB, 'EQUIP-DETAIL'); a.rect(X0 + 40, YB - 10, X0 + 520, YB);
      a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL');
    }
    a.log('Added the base, the panelled sides, the counter top and the attendant door (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic mall cart base',
  desc: (v) => `Mobile retail cart base ${v.w} by ${v.d} in on four casters: ${v.doors} doors under a counter top, an open shelf on one end and a push handle.`,
  vs: [['48 by 30 in', 48, 30, 38, 0, { doors: 2 }], ['60 by 30 in', 60, 30, 38, 0, { doors: 2 }], ['72 by 30 in', 72, 30, 38, 0, { doors: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a;
    cab(a, { casters: 120, doors: v.doors, pull: 'bar', topT: 40, swing: false });
    a.box(X1 - 20, YF + 60, Z0 + 700, X1, YB - 60, Z0 + 720); a.box(X1 - 25, YF + 60, Z0 + 130, X1 - 5, YF + 80, Z0 + 720); a.box(X1 - 25, YB - 80, Z0 + 130, X1 - 5, YB - 60, Z0 + 720);
    a.box(X0 + 30, YF + 60, Z0 + 380, X0 + 300, YB - 60, Z0 + 395);
    a.log('Added the doored base, the counter top, the casters, the end shelf and the push handle (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic gift wrap counter',
  desc: (v) => `Wrapping counter ${v.w} in long: a base with a drawer and ${v.doors} doors, a top with a paper cutter rail, and a rack holding ${v.rolls} paper rolls on a rod above the back edge.`,
  vs: [['48 in', 48, 24, 54, 0, { doors: 2, rolls: 3 }], ['72 in', 72, 24, 54, 0, { doors: 3, rolls: 5 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tz = Z0 + 36 * IN;
    cab(a, { toe: 100, drawers: 1, drawerH: 150, doors: v.doors, pull: 'bar', topT: 45, swing: false });
    for (const x of [X0 + 30, X1 - 60]) a.box(x, YB - 60, tz, x + 30, YB - 30, Z1);
    a.xcyl(X0 + 30, X1 - 30, YB - 45, Z1 - 80, 12, 8);
    for (let i = 0; i < v.rolls; i++) { const x = X0 + 110 + ((W - 220) * (i + 0.5)) / v.rolls; a.xcyl(x - 50, x + 50, YB - 45, Z1 - 80, 45, 12); }
    a.box(X0 + 100, YF + 60, tz, X1 - 100, YF + 76, tz + 12); a.line(X0 + 100, YF + 68, X1 - 100, YF + 68, 'EQUIP-DETAIL');
    a.log('Added the drawer and door base, the top, the cutter rail, the two uprights and the paper rod with rolls (plan and 3D).');
  } });

P({ cat: 'casework/base', title: 'Generic stockroom base cabinet',
  desc: (v) => `Back-of-house base cabinet ${v.w} in wide with ${v.doors} doors, one fixed shelf, a toe kick and a top.`,
  vs: [['24 in', 24, 24, 34, 0, { doors: 1 }], ['36 in', 36, 24, 34, 0, { doors: 2 }], ['48 in', 48, 24, 34, 0, { doors: 2 }]],
  build: (a, v) => { cab(a, { toe: 100, doors: v.doors, pull: 'bar', topT: 32, swing: true }); a.box(a.X0 + T, a.YF + T + 2, a.Z0 + 450, a.X1 - T, a.YB - 6, a.Z0 + 450 + 18); a.log('Added the doors with swings, the shelf, the toe kick and the top (plan and 3D).'); } });

// ================================================================ wall cabinets and wall fixtures
P({ cat: 'casework/wall', title: 'Generic back bar shelf unit',
  desc: (v) => `Back bar shelving ${v.w} in wide: a mirrored back, two end panels, ${v.sh} glass shelves with front lips and a row of bottles on each, and a lit canopy along the top.`,
  vs: [['72 in', 72, 12, 48, 38, { sh: 3 }], ['96 in', 96, 12, 48, 38, { sh: 3 }], ['120 in', 120, 12, 54, 36, { sh: 4 }], ['144 in', 144, 12, 54, 36, { sh: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a;
    a.outline('EQUIP-HIDDEN'); a.box(X0, YB - 20, Z0, X1, YB, Z1); a.rect(X0, YB - 20, X1, YB, 'EQUIP-DETAIL');
    for (const x of [X0, X1 - 25]) a.box(x, YF, Z0, x + 25, YB - 20, Z1);
    a.box(X0, YF, Z1 - 70, X1, YB - 20, Z1); a.box(X0 + 25, YF + 20, Z1 - 80, X1 - 25, YF + 50, Z1 - 70);
    const gap = (Z1 - 70 - Z0 - 40) / v.sh;
    for (let i = 0; i < v.sh; i++) {
      const z = Z0 + 40 + gap * i; a.box(X0 + 25, YF + 20, z, X1 - 25, YB - 20, z + 12); a.box(X0 + 25, YF + 20, z + 12, X1 - 25, YF + 30, z + 40);
      a.line(X0 + 25, YF + 25, X1 - 25, YF + 25, 'EQUIP-DETAIL');
      for (let x = X0 + 110; x < X1 - 90; x += 125) { const bh = 220 + ((Math.round(x / 125) * 37) % 6) * 12; a.cyl(x, (YF + YB) / 2, z + 12, z + 12 + bh, 28, 8); a.cyl(x, (YF + YB) / 2, z + 12 + bh, z + 12 + bh + 60, 11, 6); }
    }
    a.log('Added the mirrored back, the end panels, the glass shelves with lips, the bottles and the lit canopy (plan and 3D).');
  } });

P({ cat: 'casework/wall', title: 'Generic slatwall fixture',
  desc: (v) => `Slatwall display panel ${v.w} in wide by ${v.h} in high with horizontal grooves, ${v.sh} bracket shelves and a row of hooks on the lowest groove.`,
  vs: [['48 in wide, 48 in high', 48, 14, 48, 24, { sh: 2 }], ['48 in wide, 72 in high', 48, 14, 72, 12, { sh: 3 }], ['72 in wide, 72 in high', 72, 14, 72, 12, { sh: 3 }], ['96 in wide, 72 in high', 96, 14, 72, 12, { sh: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, H } = a;
    a.outline('EQUIP-HIDDEN'); a.box(X0, YB - 20, Z0, X1, YB, Z1);
    for (let z = Z0 + 75; z < Z1; z += 75) a.box(X0, YB - 22, z, X1, YB - 20, z + 6);
    a.rect(X0, YB - 20, X1, YB, 'EQUIP-DETAIL'); a.box(X0, YB - 40, Z0, X1, YB - 20, Z0 + 60);
    for (let i = 0; i < v.sh; i++) {
      const z = Z0 + 300 + ((H - 500) * i) / Math.max(1, v.sh - 1);
      a.box(X0 + 20, YF + 40, z, X1 - 20, YB - 22, z + 14);
      for (const x of [X0 + 80, X1 - 80]) a.tube([[x, YB - 22, z - 140], [x, YB - 100, z - 10]], [8, 8], 6);
      a.line(X0 + 20, YF + 40, X1 - 20, YF + 40, 'EQUIP-DETAIL');
    }
    for (let x = X0 + 130; x < X1 - 80; x += 230) { a.tube([[x, YB - 22, Z0 + 150], [x, YB - 120, Z0 + 150], [x, YB - 170, Z0 + 200]], [6, 6, 6], 6); }
    a.log('Added the grooved panel, the base rail, the bracket shelves and the hooks (plan and 3D).');
  } });

P({ cat: 'casework/wall', title: 'Generic wall display cabinet',
  desc: (v) => `Wall-hung display cabinet ${v.w} in wide with ${v.doors} glass doors, two internal shelves and a lit underside.`,
  vs: [['36 in', 36, 12, 36, 48, { doors: 2 }], ['48 in', 48, 12, 36, 48, { doors: 2 }], ['60 in', 60, 12, 36, 48, { doors: 3 }]],
  build: (a, v) => { cab(a, { doors: v.doors, glass: true, hidden: true, swing: true, pull: 'vbar', open: false }); const { X0, X1, YB, YF, Z0, Z1 } = a; for (const k of [1, 2]) a.box(X0 + T, YF + T, Z0 + ((Z1 - Z0) * k) / 3, X1 - T, YB - 4, Z0 + ((Z1 - Z0) * k) / 3 + 10); a.box(X0 + T, YF + T, Z0 - 8 + 8, X1 - T, YF + T + 30, Z0 + 8); a.log('Added the glazed doors with swings, the two shelves and the underside light (plan and 3D).'); } });

P({ cat: 'casework/wall', title: 'Generic wall menu board cabinet',
  desc: (v) => `Wall-mounted menu board of ${cnt(v.n, 'panel', 'panels')}: a framed box with a slim depth, dark display panels, a lit header strip and a wall bracket.`,
  vs: [['2 panels, 48 in', 48, 4, 30, 72, { n: 2 }], ['3 panels, 72 in', 72, 4, 30, 72, { n: 3 }], ['4 panels, 96 in', 96, 4, 30, 72, { n: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a;
    a.outline('EQUIP-HIDDEN'); a.box(X0, YB - 50, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YF, YB - 50, 40);
    a.box(X0 + 40, YF + 4, Z1 - 120, X1 - 40, YF + 20, Z1 - 40);
    for (let i = 0; i < v.n; i++) { const x0 = X0 + 40 + ((W - 80) * i) / v.n + 8, x1 = X0 + 40 + ((W - 80) * (i + 1)) / v.n - 8; a.box(x0, YF + 12, Z0 + 40, x1, YF + 28, Z1 - 130); a.line(x0, YF + 12, x1, YF + 12, 'EQUIP-DETAIL'); }
    a.line(X0, YF, X1, YF, 'EQUIP-DETAIL');
    a.log('Added the frame, the lit header, each display panel and the wall bracket (plan and 3D).');
  } });

P({ cat: 'casework/wall', title: 'Generic wall literature rack',
  desc: (v) => `Wall-mounted literature rack with ${v.rows} rows of ${v.cols} pockets: a backing plate, a floor and a low front lip to each pocket, and pocket dividers.`,
  vs: [['3 rows of 2', 24, 5, 36, 42, { rows: 3, cols: 2 }], ['4 rows of 3', 36, 5, 48, 36, { rows: 4, cols: 3 }], ['5 rows of 4', 48, 5, 54, 30, { rows: 5, cols: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, H } = a;
    a.outline('EQUIP-HIDDEN'); a.box(X0, YB - 12, Z0, X1, YB, Z1); a.rect(X0, YB - 12, X1, YB, 'EQUIP-DETAIL');
    for (let r = 0; r < v.rows; r++) {
      const z = Z0 + 30 + ((H - 60) * r) / v.rows, rh = (H - 60) / v.rows;
      a.box(X0 + 10, YF, z, X1 - 10, YB - 12, z + 8); a.box(X0 + 10, YF, z + 8, X1 - 10, YF + 8, z + 70);
      for (let c = 0; c <= v.cols; c++) { const x = c === 0 ? X0 + 10 : c === v.cols ? X1 - 22 : X0 + 10 + ((W - 20) * c) / v.cols - 6; a.box(x, YF, z + 8, x + 12, YB - 12, z + rh - 12); }
    }
    a.line(X0 + 10, YF, X1 - 10, YF, 'EQUIP-DETAIL');
    a.log('Added the backing plate and every pocket with its floor, lip and dividers (plan and 3D).');
  } });

P({ cat: 'casework/wall', title: 'Generic locking wall cabinet',
  desc: (v) => `Wall cabinet ${v.w} in wide with ${cnt(v.doors, 'locking door', 'locking doors')}, one adjustable shelf and a fixed hanging rail, for back-of-house storage.`,
  vs: [['24 in', 24, 14, 30, 54, { doors: 1 }], ['30 in', 30, 14, 30, 54, { doors: 2 }], ['36 in', 36, 14, 30, 54, { doors: 2 }]],
  build: (a, v) => { cab(a, { doors: v.doors, lock: true, swing: true, hidden: true, pull: 'vbar' }); a.box(a.X0 + T, a.YF + T + 2, a.Z0 + 380, a.X1 - T, a.YB - 6, a.Z0 + 398); a.log('Added the locking doors with swings, the shelf and the carcass (plan and 3D).'); } });

P({ cat: 'casework/wall', title: 'Generic wall shelving bay',
  desc: (v) => `Retail wall shelving bay ${v.w} in wide: ${v.stds} slotted standards, ${v.sh} adjustable shelves with front lips and shelf brackets, and a top cap.`,
  vs: [['36 in', 36, 14, 72, 12, { stds: 2, sh: 5 }], ['48 in', 48, 14, 72, 12, { stds: 3, sh: 5 }], ['72 in', 72, 14, 84, 12, { stds: 4, sh: 6 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, H } = a;
    a.outline('EQUIP-HIDDEN');
    for (let i = 0; i < v.stds; i++) { const x = X0 + 15 + ((W - 30) * i) / (v.stds - 1); a.box(x - 15, YB - 18, Z0, x + 15, YB, Z1); a.line(x, YB - 18, x, YB, 'EQUIP-DETAIL'); }
    a.box(X0, YB - 40, Z1 - 40, X1, YB, Z1);
    for (let k = 0; k < v.sh; k++) {
      const z = Z0 + 120 + ((H - 260) * k) / (v.sh - 1);
      a.box(X0 + 20, YF + 30, z, X1 - 20, YB - 18, z + 18); a.box(X0 + 20, YF + 30, z + 18, X1 - 20, YF + 40, z + 55);
      for (let i = 0; i < v.stds; i++) { const x = X0 + 15 + ((W - 30) * i) / (v.stds - 1); a.box(x - 6, YB - 190, z - 100, x + 6, YB - 18, z); }
    }
    a.log('Added the slotted standards, the shelves with lips, the brackets and the top cap (plan and 3D).');
  } });

P({ cat: 'casework/wall', title: 'Generic fragrance wall display',
  desc: (v) => `Backlit fragrance wall ${v.w} in wide: a lit back panel, ${v.sh} glass shelves each with an LED strip and a front lip, and rows of bottles on every shelf.`,
  vs: [['36 in', 36, 10, 60, 24, { sh: 5 }], ['48 in', 48, 10, 60, 24, { sh: 5 }], ['72 in', 72, 10, 72, 18, { sh: 6 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, H } = a;
    a.outline('EQUIP-HIDDEN'); a.box(X0, YB - 30, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YF + 60, YB - 30, 25); a.rect(X0, YB - 30, X1, YB, 'EQUIP-DETAIL');
    for (let k = 0; k < v.sh; k++) {
      const z = Z0 + 60 + ((H - 160) * k) / (v.sh - 1);
      a.box(X0 + 25, YF + 30, z, X1 - 25, YB - 30, z + 10); a.box(X0 + 25, YF + 30, z + 10, X1 - 25, YF + 36, z + 40); a.box(X0 + 25, YB - 50, z - 12, X1 - 25, YB - 30, z);
      for (let x = X0 + 90; x < X1 - 70; x += 95) { a.cyl(x, YF + 120, z + 10, z + 120, 28, 8); a.cyl(x, YF + 120, z + 120, z + 160, 11, 6); }
    }
    a.log('Added the lit back panel, the glass shelves with strips and lips and the bottle rows (plan and 3D).');
  } });

P({ cat: 'casework/wall', title: 'Generic shoe wall display',
  desc: (v) => `Shoe wall ${v.w} in wide: a backing panel with ${v.cols} columns of ${v.rows} angled shelf pegs, each carrying a display shoe, and a base shelf for boxes.`,
  vs: [['48 in', 48, 16, 60, 12, { cols: 3, rows: 6 }], ['72 in', 72, 16, 60, 12, { cols: 5, rows: 6 }], ['96 in', 96, 16, 72, 12, { cols: 7, rows: 7 }], ['120 in', 120, 16, 72, 12, { cols: 9, rows: 7 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, H } = a;
    a.outline('EQUIP-HIDDEN'); a.box(X0, YB - 20, Z0, X1, YB, Z1); a.rect(X0, YB - 20, X1, YB, 'EQUIP-DETAIL');
    a.box(X0, YB - 300, Z0, X1, YB - 20, Z0 + 60);
    for (let c = 0; c < v.cols; c++) for (let r = 0; r < v.rows; r++) {
      const x = X0 + (W * (c + 0.5)) / v.cols, z = Z0 + 140 + ((H - 260) * r) / Math.max(1, v.rows - 1);
      a.tube([[x, YB - 20, z], [x, YB - 160, z + 40]], [6, 6], 6);
      a.ell(x, YB - 120, z + 80, 95, 110, 40, 8, 4);
      a.line(x - 5, YB - 20, x + 5, YB - 20, 'EQUIP-DETAIL');
    }
    a.log('Added the backing panel, the base shelf, every angled peg and its display shoe (plan and 3D).');
  } });

P({ cat: 'casework/wall', title: 'Generic wall cabinet over counter',
  desc: (v) => `Standard wall cabinet ${v.w} in wide and ${v.h} in high with ${v.doors} doors, a shelf and bar pulls, hung over a counter.`,
  vs: [['36 in', 36, 12, 30, 54, { doors: 2 }], ['48 in', 48, 12, 30, 54, { doors: 2 }], ['60 in', 60, 12, 30, 54, { doors: 3 }]],
  build: (a, v) => { cab(a, { doors: v.doors, hidden: true, swing: true, pull: 'bar' }); a.box(a.X0 + T, a.YF + T + 2, a.Z0 + 380, a.X1 - T, a.YB - 6, a.Z0 + 398); a.log('Added the doors with swings, the shelf and the carcass (plan and 3D).'); } });

// ================================================================ tall cabinets
P({ cat: 'casework/tall', title: 'Generic tall glass showcase',
  desc: (v) => `Floor-standing showcase ${v.w} in wide: a doored base, an open corner-post frame with glass side panels, ${v.sh} glass shelves and a lit cornice.`,
  vs: [['24 in', 24, 18, 72, 0, { sh: 3 }], ['36 in', 36, 18, 72, 0, { sh: 3 }], ['48 in', 48, 18, 72, 0, { sh: 4 }], ['48 in, 84 in high', 48, 20, 84, 0, { sh: 5 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, bz = Z0 + 600, tz = Z1 - 120;
    a.outline(); a.box(X0 + 10, YF + 50, Z0, X1 - 10, YB, Z0 + 90); a.box(X0, YF + 20, Z0 + 90, X1, YB, bz);
    const nd = Math.max(1, Math.round(W / 500)); for (let i = 0; i < nd; i++) { const x0 = X0 + (W * i) / nd + GAP, x1 = X0 + (W * (i + 1)) / nd - GAP; a.box(x0, YF, Z0 + 110, x1, YF + 20, bz - GAP); pull(a, 'knob', (x0 + x1) / 2, bz - 140, YF); }
    for (const [x, y] of [[X0, YF], [X1 - 28, YF], [X0, YB - 28], [X1 - 28, YB - 28]]) { a.box(x, y, bz, x + 28, y + 28, tz); a.rect(x, y, x + 28, y + 28, 'EQUIP-DETAIL'); }
    a.box(X0, YF + 28, bz, X0 + 3, YB - 28, tz); a.box(X1 - 3, YF + 28, bz, X1, YB - 28, tz);
    for (let k = 0; k < v.sh; k++) { const z = bz + 40 + ((tz - bz - 80) * (k + 0.5)) / v.sh; a.box(X0 + 28, YF + 28, z, X1 - 28, YB - 28, z + 10); }
    a.box(X0, YF, tz, X1, YB, Z1 - 30); a.box(X0 - 0, YF + 20, Z1 - 30, X1, YB, Z1); a.box(X0 + 28, YF + 28, tz - 14, X1 - 28, YF + 60, tz); a.rect(X0 + 28, YF + 28, X1 - 28, YB - 28, 'EQUIP-DETAIL');
    a.log('Added the plinth, the doored base, the post frame, the glass sides, the shelves and the lit cornice (plan and 3D).');
  } });

P({ cat: 'casework/tall', title: 'Generic wine display tower',
  desc: (v) => `Wine tower ${v.w} in wide: a frame with ${v.cols} columns by ${v.rows} rows of horizontal bottle cradles (${v.cols * v.rows} bottles shown), a base cabinet and a top shelf.`,
  vs: [['24 in, 48 bottles', 24, 14, 84, 0, { cols: 4, rows: 12 }], ['36 in, 72 bottles', 36, 14, 84, 0, { cols: 6, rows: 12 }], ['48 in, 96 bottles', 48, 14, 84, 0, { cols: 8, rows: 12 }], ['36 in, 96 bottles, 96 in high', 36, 14, 96, 0, { cols: 6, rows: 16 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, bz = Z0 + 300, tz = Z1 - 60;
    a.outline(); a.box(X0, YF + 30, Z0, X1, YB, bz); const nd = v.cols > 4 ? 2 : 1;
    for (let i = 0; i < nd; i++) { const x0 = X0 + (W * i) / nd + GAP, x1 = X0 + (W * (i + 1)) / nd - GAP; a.box(x0, YF, Z0 + 40, x1, YF + 30, bz - GAP); pull(a, 'bar', (x0 + x1) / 2, bz - 90, YF); }
    a.box(X0, YF + 10, bz, X0 + 20, YB, tz); a.box(X1 - 20, YF + 10, bz, X1, YB, tz); a.box(X0, YB - 10, bz, X1, YB, tz); a.box(X0, YF + 10, tz, X1, YB, Z1);
    const cw = (W - 40) / v.cols, rh = (tz - bz - 40) / v.rows;
    for (let r = 0; r < v.rows; r++) { const z = bz + 20 + rh * (r + 0.5); a.box(X0 + 20, YF + 10, z - rh / 2, X1 - 20, YF + 22, z - rh / 2 + 8); for (let c = 0; c < v.cols; c++) { const x = X0 + 20 + cw * (c + 0.5); a.ycyl(YF + 40, YB - 40, x, z, Math.min(rh, cw) * 0.36, 8); } }
    for (let c = 0; c <= v.cols; c++) a.line(X0 + 20 + cw * c, YF + 10, X0 + 20 + cw * c, YB - 10, 'EQUIP-DETAIL');
    a.log('Added the doored base, the side and back frame, every bottle cradle row with its bottles and the top shelf (plan and 3D).');
  } });

P({ cat: 'casework/tall', title: 'Generic fitting room unit',
  desc: (v) => v.curtain ? 'Fitting room unit with a curtain: three panelled walls, a curtain on a ceiling-height track across the front, a bench, a mirror and two hooks.' : `Fitting room unit with a hinged louvered door: three panelled walls, a bench, a full-height mirror, hooks and a plan swing, ${v.w} by ${v.d} in.`,
  vs: [['36 by 36 in, door', 36, 36, 84, 0, {}], ['48 by 60 in, wide door, wheelchair turning', 48, 60, 84, 0, { wide: true }], ['36 by 36 in, curtain', 36, 36, 84, 0, { curtain: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, wt = 40;
    a.outline(); a.box(X0, YF, Z0 + 100, X0 + wt, YB, Z1); a.box(X1 - wt, YF, Z0 + 100, X1, YB, Z1); a.box(X0 + wt, YB - wt, Z0 + 100, X1 - wt, YB, Z1);
    a.box(X0, YF, Z1 - 140, X1, YF + 60, Z1); a.rect(X0, YF, X0 + wt, YB, 'EQUIP-DETAIL'); a.rect(X1 - wt, YF, X1, YB, 'EQUIP-DETAIL'); a.rect(X0 + wt, YB - wt, X1 - wt, YB, 'EQUIP-DETAIL');
    const bd = 380; a.box(X0 + wt, YB - wt - bd, Z0 + 450, X1 - wt, YB - wt, Z0 + 490); cushion3(a, X0 + wt, YB - wt - bd, X1 - wt, YB - wt, Z0 + 490);
    a.box(X0 + wt + 60, YB - wt - 12, Z0 + 700, X1 - wt - 60, YB - wt, Z1 - 250); a.rect(X0 + wt + 60, YB - wt - 12, X1 - wt - 60, YB - wt - 8, 'EQUIP-DETAIL');
    for (const x of [X0 + wt, X1 - wt - 12]) a.tube([[x + 6, YF + 300, Z0 + 1700], [x + 6, YF + 360, Z0 + 1700]], [8, 8], 6);
    a.box(X0 + wt, YF + 100, Z0, X1 - wt, YB - wt, Z0 + 100);
    if (v.curtain) {
      a.xcyl(X0 + wt, X1 - wt, YF + 30, Z1 - 150, 8, 8); const nf = Math.round((W - 2 * wt) / 120);
      for (let i = 0; i < nf; i++) { const x0 = X0 + wt + ((W - 2 * wt) * i) / nf; a.ell(x0 + (W - 2 * wt) / nf / 2, YF + 30, (Z0 + 250 + Z1 - 160) / 2, (W - 2 * wt) / nf / 2, 14, (Z1 - 160 - Z0 - 250) / 2, 8, 6); }
    } else {
      const dw = W - 2 * wt - 20, hx = X0 + wt + 10; a.box(hx, YF, Z0 + 150, hx + dw, YF + 30, Z1 - 160);
      for (let z = Z0 + 350; z < Z1 - 300; z += 45) a.box(hx + 50, YF - 6, z, hx + dw - 50, YF, z + 8);
      pull(a, 'bar', hx + dw - 120, Z0 + 1000, YF - 6); a.line(hx, YF, hx, YF - dw, 'EQUIP-SWING'); a.arc(hx, YF, dw, 270, 360); a.clear('door swing', hx, YF - dw, X1 - wt, YF, 80);
    }
    a.log('Added the three panelled walls, the valance, the bench, the mirror, the hooks and the door or curtain (plan and 3D).');
  } });
function cushion3(a, x0, y0, x1, y1, z) { FU.cushion(a, x0 + 10, y0 + 10, x1 - 10, y1 - 10, z, z + 60); }

P({ cat: 'casework/tall', title: 'Generic dry storage tall cabinet',
  desc: (v) => `Back-of-house tall cabinet ${v.w} in wide with ${cnt(v.doors, 'door', 'doors')}, a toe kick and four fixed shelves inside${v.lock ? ', with a lock' : ''}.`,
  vs: [['24 in', 24, 24, 84, 0, { doors: 1 }], ['36 in', 36, 24, 84, 0, { doors: 2 }], ['48 in, locking', 48, 24, 84, 0, { doors: 2, lock: true }]],
  build: (a, v) => { cab(a, { toe: 100, doors: v.doors, swing: true, pull: 'vbar', lock: v.lock }); for (let i = 1; i <= 4; i++) a.box(a.X0 + T, a.YF + T + 2, a.Z0 + 100 + ((a.Z1 - a.Z0 - 100) * i) / 5, a.X1 - T, a.YB - 6, a.Z0 + 100 + ((a.Z1 - a.Z0 - 100) * i) / 5 + 14); a.log('Added the doors with swings, the shelves and the toe kick (plan and 3D).'); } });

P({ cat: 'casework/tall', title: 'Generic coat check unit',
  desc: (v) => `Coat check stand ${v.w} in long: end panels, a back panel, two hanging rails with ${v.hangers} hangers, a top shelf with cubbies for bags and a base shelf.`,
  vs: [['48 in', 48, 24, 78, 0, { hangers: 16 }], ['72 in', 72, 24, 78, 0, { hangers: 24 }], ['96 in', 96, 24, 78, 0, { hangers: 32 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cy } = a, sz = Z1 - 500;
    a.outline(); a.box(X0, YF, Z0, X0 + 30, YB, Z1); a.box(X1 - 30, YF, Z0, X1, YB, Z1); a.box(X0 + 30, YB - 15, Z0 + 150, X1 - 30, YB, Z1);
    a.box(X0 + 30, YF + 30, Z0 + 150, X1 - 30, YB - 15, Z0 + 170); a.box(X0 + 30, YF, sz, X1 - 30, YB, sz + 20); a.box(X0, YF, Z1 - 30, X1, YB, Z1);
    const nc = Math.max(3, Math.round(W / 450)); for (let i = 1; i < nc; i++) a.box(X0 + 30 + ((W - 60) * i) / nc - 8, YF + 20, sz + 20, X0 + 30 + ((W - 60) * i) / nc + 8, YB - 15, Z1 - 30);
    const rz = sz - 80; for (const y of [cy - 120, cy + 120]) { a.xcyl(X0 + 30, X1 - 30, y, rz, 14, 8); a.line(X0 + 30, y, X1 - 30, y, 'EQUIP-DETAIL'); }
    for (let i = 0; i < v.hangers; i++) { const x = X0 + 60 + ((W - 120) * (i + 0.5)) / v.hangers, y = i % 2 ? cy + 120 : cy - 120; a.tube([[x, y, rz - 10], [x, y, rz - 40], [x - 120, y, rz - 110], [x + 120, y, rz - 110], [x, y, rz - 40]], [3, 3, 3, 3, 3], 4); }
    a.log('Added the end and back panels, the two hanging rails with hangers, the bag cubbies and the base shelf (plan and 3D).');
  } });

P({ cat: 'casework/tall', title: 'Generic pharmacy stock tower',
  desc: (v) => `Pharmacy stock tower ${v.w} in wide: ${v.dr} labelled drawers over a lower door pair with a toe kick and bar pulls.`,
  vs: [['30 in', 30, 24, 84, 0, { dr: 6 }], ['36 in', 36, 24, 84, 0, { dr: 7 }], ['48 in', 48, 24, 84, 0, { dr: 8 }]],
  build: (a, v) => {
    cab(a, { toe: 90, drawers: v.dr, drawerH: Math.round(a.H * 0.7), doors: 2, pull: 'bar', swing: false });
    const { X0, X1, YF, Z0, Z1 } = a, dz = Z1 - 1.5 - (Z1 - Z0) * 0 , rh = (a.H * 0.7) / v.dr;
    for (let i = 0; i < v.dr; i++) { const z = Z1 - GAP - i * rh - rh / 2; a.box(X0 + 60, YF - 3, z + 8, X0 + 160, YF, z + 28); }
    a.log('Added the labelled drawer stack, the door pair and the toe kick (plan and 3D).');
  } });

P({ cat: 'casework/tall', title: 'Generic luggage locker tower',
  desc: (v) => `Public luggage lockers: ${v.cols} columns of ${v.tiers} large doors, each with a keypad and a lock slot, on a base with a sloped top.`,
  vs: [['2 columns', 36, 24, 72, 0, { cols: 2, tiers: 3 }], ['3 columns', 54, 24, 72, 0, { cols: 3, tiers: 3 }], ['4 columns', 72, 24, 72, 0, { cols: 4, tiers: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, base = Z0 + 100, top = Z1 - 80;
    a.outline(); a.box(X0, YF + 40, Z0, X1, YB, base); a.box(X0, YF + 8, base, X1, YB, top);
    a.prism([[X0, YF + 8], [X1, YF + 8], [X1, YB], [X0, YB]], top, top + 40); a.prism([[X0, YF + 60], [X1, YF + 60], [X1, YB], [X0, YB]], top + 40, Z1);
    const cw = W / v.cols, th = (top - base) / v.tiers;
    for (let c = 0; c < v.cols; c++) for (let t = 0; t < v.tiers; t++) {
      const x0 = X0 + c * cw + 4, x1 = X0 + (c + 1) * cw - 4, z0 = base + t * th + 4, z1 = base + (t + 1) * th - 4;
      a.box(x0, YF, z0, x1, YF + 8, z1); a.box(x1 - 130, YF - 8, (z0 + z1) / 2 - 10, x1 - 40, YF, (z0 + z1) / 2 + 70); a.box(x1 - 120, YF - 10, (z0 + z1) / 2 + 20, x1 - 50, YF - 8, (z0 + z1) / 2 + 55);
      a.box(x0 + 40, YF - 4, z1 - 80, x0 + 130, YF, z1 - 60); a.box(x1 - 90, YF - 5, (z0 + z1) / 2 - 40, x1 - 60, YF, (z0 + z1) / 2 - 30);
    }
    for (let c = 1; c < v.cols; c++) a.line(X0 + c * cw, YF, X0 + c * cw, YB, 'EQUIP-DETAIL');
    for (let c = 0; c < v.cols; c++) a.line(X0 + c * cw + 8, YF - 6, X0 + (c + 1) * cw - 8, YF - 6, 'EQUIP-DETAIL');
    a.log('Added the base, the carcass, the sloped top and every door with its keypad and lock slot (plan and 3D).');
  } });

P({ cat: 'casework/tall', title: 'Generic AV equipment tower',
  desc: (v) => v.glass ? `Equipment tower ${v.w} in wide with a glazed door, a toe kick, a rear cable opening and adjustable shelves inside.` : `Equipment tower ${v.w} in wide with ${cnt(v.doors, 'louvered door', 'louvered doors')} for airflow, a toe kick and a rear cable opening.`,
  vs: [['24 in, louvered', 24, 24, 72, 0, { doors: 1 }], ['30 in, glazed', 30, 24, 72, 0, { doors: 1, glass: true }], ['36 in, louvered', 36, 24, 78, 0, { doors: 2 }]],
  build: (a, v) => { cab(a, { toe: 90, doors: v.doors, glass: v.glass, louver: !v.glass, swing: true, pull: 'vbar' }); a.box(a.cx - 150, a.YB - 14, a.Z0 + 600, a.cx + 150, a.YB, a.Z0 + 700); a.rect(a.cx - 150, a.YB - 14, a.cx + 150, a.YB, 'EQUIP-DETAIL'); a.log('Added the door with swing, the louvres or glazing, the toe kick and the cable opening (plan and 3D).'); } });

P({ cat: 'casework/tall', title: 'Generic crew wardrobe',
  desc: (v) => `Staff wardrobe ${v.w} in wide with ${cnt(v.doors, 'locking louvered door', 'locking louvered doors')}, a toe kick, a hanging rod and a top shelf.`,
  vs: [['24 in', 24, 24, 78, 0, { doors: 1 }], ['36 in', 36, 24, 78, 0, { doors: 2 }], ['48 in', 48, 24, 78, 0, { doors: 2 }]],
  build: (a, v) => { cab(a, { toe: 80, doors: v.doors, louver: true, lock: true, swing: true, pull: 'none' }); a.xcyl(a.X0 + T, a.X1 - T, a.cy, a.Z1 - 250, 12, 8); a.box(a.X0 + T, a.YF + T + 2, a.Z1 - 180, a.X1 - T, a.YB - 6, a.Z1 - 162); a.log('Added the louvered locking doors with swings, the toe kick, the rod and the shelf (plan and 3D).'); } });

P({ cat: 'casework/tall', title: 'Generic tall retail display unit',
  desc: (v) => `Open retail tower ${v.w} in wide: side panels, a back panel, ${v.sh} adjustable shelves with front lips, a base cabinet and a lit header.`,
  vs: [['24 in', 24, 14, 84, 0, { sh: 5 }], ['36 in', 36, 14, 84, 0, { sh: 5 }], ['48 in', 48, 16, 84, 0, { sh: 6 }], ['48 in, 96 in high', 48, 16, 96, 0, { sh: 7 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, bz = Z0 + 650, hz = Z1 - 160;
    a.outline(); a.box(X0, YF + 40, Z0, X1, YB, bz); const nd = W > 900 ? 2 : 1;
    for (let i = 0; i < nd; i++) { const x0 = X0 + (W * i) / nd + GAP, x1 = X0 + (W * (i + 1)) / nd - GAP; a.box(x0, YF, Z0 + 30, x1, YF + 40, bz - GAP); pull(a, 'bar', (x0 + x1) / 2, bz - 100, YF); }
    a.box(X0, YF, bz, X0 + 25, YB, Z1); a.box(X1 - 25, YF, bz, X1, YB, Z1); a.box(X0, YB - 12, bz, X1, YB, Z1);
    a.box(X0, YF, hz, X1, YB, Z1); a.box(X0 + 25, YF + 30, hz - 6, X1 - 25, YF + 70, hz);
    for (let k = 0; k < v.sh; k++) { const z = bz + 60 + ((hz - bz - 140) * k) / (v.sh - 1); a.box(X0 + 25, YF + 20, z, X1 - 25, YB - 12, z + 14); a.box(X0 + 25, YF + 20, z + 14, X1 - 25, YF + 30, z + 50); }
    a.rect(X0 + 25, YF + 20, X1 - 25, YB - 12, 'EQUIP-DETAIL');
    a.log('Added the base cabinet, the side and back panels, the shelves with lips and the lit header (plan and 3D).');
  } });

export default fams;

/* SPDX-License-Identifier: Apache-2.0 */
/** Commercial casework detail (casework-3.csv). Built mostly on cab(); the units that are not a plain cabinet have their own code. */
import { cab, pull, T, GAP, leaves } from './com-core.mjs';

const C = (o, log) => (a) => { cab(a, o); a.log(log); };

/** An open carcass (sides, top, bottom, back) for the units drawn by hand. */
function shell(a, z0, z1, { back = true, topBot = true } = {}) {
  const { X0, X1, YF, YB } = a;
  a.box(X0, YF, z0, X0 + T, YB, z1).box(X1 - T, YF, z0, X1, YB, z1);
  if (topBot) a.box(X0 + T, YF, z1 - T, X1 - T, YB, z1).box(X0 + T, YF, z0, X1 - T, YB, z0 + T);
  if (back) a.box(X0 + T, YB - 6, z0 + T, X1 - T, YB, z1 - T);
}

export const CASE = [
  [/reception base cabinet/i, C({ toe: 100, doors: 2, pull: 'recess', topT: 45, splash: { h: 150, t: 200 }, swing: false }, 'Added the 36 in counter, the raised transaction ledge, two doors and the toe kick (plan and 3D).')],
  [/nurse station base/i, C({ toe: 100, drawers: 4, pull: 'bar', topT: 45, splash: { h: 150, t: 220 } }, 'Added four drawers, the counter and the raised ledge (plan and 3D).')],
  [/ADA sink base/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a;
    a.outline(); a.box(X0, YF + 20, Z0, X0 + T, YB, Z1 - 40).box(X1 - T, YF + 20, Z0, X1, YB, Z1 - 40).box(X0, YF, Z1 - 40, X1, YB, Z1).box(X0 + T, YB - 10, Z0 + 80, X1 - T, YB, Z1 - 40);
    a.box(X0 + T, YF + 20, Z1 - 120, X1 - T, YF + 40, Z1 - 40);   // front rail
    for (const x of [X0 + 120, X1 - 120]) { a.box(x - 60, YF + 20, Z0 + 20, x + 60, YF + 36, Z1 - 140); }   // removable door halves, shown low
    a.line(X0 + T, YF + 20, X1 - T, YF + 20, 'EQUIP-HIDDEN'); a.rect(X0 + T, YF + 20, X1 - T, YB - 10, 'EQUIP-HIDDEN'); a.rect(X0 + 100, YF + 100, X1 - 100, YB - 100, 'EQUIP-DETAIL');
    a.clear('knee and toe space', X0 + T, YF - 450, X1 - T, YF + 20, 700);
    a.log('Added the two side panels, the open knee space with its clearance, the top and the removable door halves (plan and 3D).');
  }],
  [/laboratory base cabinet/i, C({ toe: 100, drawers: 3, drawerH: 330, doors: 1, pull: 'bar', topT: 35, swing: true }, 'Added three drawers over a door, the top and the toe kick (plan and 3D).')],
  [/retail checkout base/i, (a) => { cab(a, { toe: 100, drawers: 1, drawerH: 150, doors: 2, pull: 'bar', topT: 40, splash: { h: 90, t: 70 } }); a.box(a.X0 + 40, a.YF - 0.0 + 0, a.Z0 + 100, a.X0 + 60, a.YF + 0.01, a.Z0 + 160); a.log('Added the drawer over two doors, the toe kick and the rear bag lip (plan and 3D).'); }],
  [/school storage base/i, C({ toe: 100, doors: 2, pull: 'bar', topT: 30, swing: true }, 'Added two doors with swings, the top and the toe kick (plan and 3D).')],
  [/pharmacy counter base/i, C({ toe: 100, drawers: 3, drawerCols: 2, pull: 'bar', topT: 35 }, 'Added six drawers in two banks, the counter and the toe kick (plan and 3D).')],
  [/breakroom base cabinet/i, (a) => {
    const { X0, X1, YF, YB, Z1, cx } = a; cab(a, { toe: 100, drawers: 1, drawerH: 150, doors: 2, pull: 'bar', topT: 38 });
    const sx0 = X0 + 400, sx1 = X1 - 400, sy0 = YF + 80, sy1 = YB - 80;
    a.box(sx0 - 20, sy0 - 20, Z1, sx1 + 20, sy0, Z1 + 8).box(sx0 - 20, sy1, Z1, sx1 + 20, sy1 + 20, Z1 + 8).box(sx0 - 20, sy0, Z1, sx0, sy1, Z1 + 8).box(sx1, sy0, Z1, sx1 + 20, sy1, Z1 + 8);
    a.rect(sx0, sy0, sx1, sy1, 'EQUIP-DETAIL'); a.circ(cx, a.cy, 25, 'EQUIP-DETAIL'); a.tube([[cx, YB - 60, Z1], [cx, YB - 60, Z1 + 260], [cx, YB - 200, Z1 + 280]], [14, 14, 11], 8);
    a.log('Added the sink opening with its rim and faucet, a drawer over two doors and the toe kick (plan and 3D).');
  }],
  [/coffee bar undercounter/i, C({ toe: 100, drawers: 1, drawerH: 180, drawerCols: 2, doors: 1, pull: 'bar', topT: 38, swing: true }, 'Added two drawers over the pull-out bin door, the top and the toe kick (plan and 3D).')],
  [/open cubby base/i, C({ open: true, cols: 2, shelves: 1, toe: 80, topT: 0 }, 'Added the sides, the vertical divider, the mid shelf and the back, giving four cubbies (plan and 3D).')],
  [/exam room base/i, C({ toe: 100, drawers: 1, drawerH: 180, drawerCols: 3, doors: 3, pull: 'bar', topT: 38, swing: true }, 'Added the drawer row over three doors, the top and the toe kick (plan and 3D).')],
  [/lockable wall cabinet/i, C({ doors: 1, lock: true, swing: true, hidden: true, pull: 'vbar' }, 'Added the locking door with its swing, pull and lock (plan and 3D).')],
  [/sliding glass door wall cabinet/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline('EQUIP-HIDDEN'); shell(a, Z0, Z1);
    const mid = Z0 + (Z1 - Z0) * 0.5; a.box(X0 + T, YB - 6 - T, mid, X1 - T, YB - 6, mid + T);
    a.box(X0 + T, YF, Z1 - 40, X1 - T, YF + 24, Z1 - T).box(X0 + T, YF, Z0 + T, X1 - T, YF + 24, Z0 + 36);   // track rails
    const w = (W - 2 * T) / 2 + 20;
    a.frame(X0 + T, Z0 + 36, X0 + T + w, Z1 - 40, YF, YF + 8, 30); a.box(X0 + T + 30, YF + 3, Z0 + 66, X0 + T + w - 30, YF + 5, Z1 - 70);
    a.frame(X1 - T - w, Z0 + 36, X1 - T, Z1 - 40, YF + 12, YF + 20, 30); a.box(X1 - T - w + 30, YF + 15, Z0 + 66, X1 - T - w - 30 + w, YF + 17, Z1 - 70);
    a.line(X0 + T + w, YF, X0 + T + w, YF + 20); a.line(X1 - T - w, YF, X1 - T - w, YF + 20);
    a.log('Added the carcass with a mid shelf and two sliding glass doors on offset tracks (plan and 3D).');
  }],
  [/laboratory reagent shelf/i, (a) => { cab(a, { open: true, shelves: 1, hidden: true, cols: 1 }); a.box(a.X0 + T, a.YF, a.Z0 + 150, a.X1 - T, a.YF + 12, a.Z0 + 190); a.box(a.X0 + T, a.YF, a.Z0 + 470, a.X1 - T, a.YF + 12, a.Z0 + 510); a.log('Added the two shelf tiers with their front rails (plan and 3D).'); }],
  [/hospital supply wall cabinet/i, C({ doors: 1, swing: true, hidden: true, pull: 'vbar' }, 'Added the hinged door with swing and the carcass (plan and 3D).')],
  [/open wall shelf unit/i, C({ open: true, shelves: 2, hidden: true, cols: 1 }, 'Added the sides, back and two shelves (plan and 3D).')],
  [/flip-up door wall cabinet/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline('EQUIP-HIDDEN'); shell(a, Z0, Z1);
    const L = leaves(X0 + T, X1 - T, 2);
    for (const lf of L) { a.box(lf.a, YF, Z0 + GAP, lf.b, YF + T, Z1 - GAP); pull(a, 'bar', (lf.a + lf.b) / 2, Z0 + 70); a.cyl(lf.a + 40, YB - 100, Z1 - 200, Z1 - 60, 6, 8); a.line(lf.a, YF + 50, lf.a, YF); a.line(lf.b, YF + 50, lf.b, YF); }
    a.line(X0 + T, Z1 > 0 ? YF : YF, X1 - T, YF, 'EQUIP-HIDDEN'); a.log('Added two lift-up doors, their pulls and the gas struts (plan and 3D).');
  }],
  [/tackboard wall cabinet/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YF - 16, YF, 36); a.box(X0 + 36, YF - 10, Z0 + 36, X1 - 36, YF, Z1 - 36); a.rect(X0 + 36, YF + 2, X1 - 36, YF + 8, 'EQUIP-DETAIL');
    a.log('Added the frame and the cork face (plan and 3D).');
  }],
  [/mail sorting wall unit/i, C({ open: true, cols: 6, shelves: 3, hidden: true }, 'Added the sides, five dividers and three shelves, giving 24 pigeonholes (plan and 3D).')],
  [/janitorial closet tall/i, (a) => { cab(a, { toe: 80, doors: 2, swing: true, louver: true, pull: 'vbar' }); a.log('Added two louvered doors with swings, the toe kick and pulls (plan and 3D).'); }],
  [/tall storage cabinet with lockers/i, C({ toe: 80, doors: 4, louver: true, lock: true, pull: 'none', swing: false }, 'Added four vented locker doors with locks, the toe kick and seams (plan and 3D).')],
  [/ADA tall pantry/i, C({ toe: 100, doors: 2, swing: true, pull: 'vbar', pullZ: 900 }, 'Added two doors with swings and low pulls (plan and 3D).')],
  [/AV equipment tall/i, C({ toe: 80, doors: 1, swing: true, louver: true, pull: 'vbar' }, 'Added the vented door with its swing and the toe kick (plan and 3D).')],
  [/supply room tall/i, C({ toe: 100, doors: 2, swing: true, pull: 'vbar' }, 'Added two doors with swings and the toe kick (plan and 3D).')],
  [/teacher tall cabinet/i, C({ toe: 100, doors: 2, swing: true, lock: true, pull: 'vbar' }, 'Added two locking doors with swings and the toe kick (plan and 3D).')],
  [/tall file cabinet with doors/i, C({ toe: 100, doors: 2, swing: true, pull: 'vbar' }, 'Added two doors with swings and the toe kick (plan and 3D).')],
  [/tall broom closet/i, C({ toe: 80, doors: 1, swing: true, pull: 'vbar' }, 'Added the single door with swing and the toe kick (plan and 3D).')],
  [/tall oven cabinet/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a, base = Z0 + 100, oz0 = Z0 + 760, oz1 = Z0 + 1480;
    a.outline(); a.box(X0, YF + 75, Z0, X1, YB, base); a.line(X0, YF + 75, X1, YF + 75, 'EQUIP-HIDDEN'); shell(a, base, Z1);
    a.box(X0 + T, YF + T, oz0 - T, X1 - T, YB - 6, oz0).box(X0 + T, YF + T, oz1, X1 - T, YB - 6, oz1 + T);   // oven bay deck
    a.rect(X0 + T, YF + T, X1 - T, YB - 6, 'EQUIP-HIDDEN');
    const L = leaves(X0 + T, X1 - T, 1); const lf = L[0];
    a.box(lf.a, YF, base + 200, lf.b, YF + T, oz0 - 60 - 160 - GAP).box(lf.a, YF, oz0 - 160 - GAP, lf.b, YF + T, oz0 - GAP);   // warming drawer
    pull(a, 'bar', (lf.a + lf.b) / 2, oz0 - 90); a.box(lf.a, YF, base + GAP, lf.b, YF + T, base + 190);   // storage drawer
    pull(a, 'bar', (lf.a + lf.b) / 2, base + 120);
    a.box(lf.a, YF, oz1 + T + GAP, lf.b, YF + T, Z1 - T - GAP); pull(a, 'vbar', lf.b - 40, (oz1 + Z1) / 2);
    a.log('Added the toe kick, the open oven bay between two decks, the warming and storage drawers, and the upper door (plan and 3D).');
  }],
  [/tall wardrobe cabinet/i, (a) => { cab(a, { toe: 80, doors: 2, swing: true, pull: 'vbar' }); a.xcyl(a.X0 + 60, a.X1 - 60, a.cy, a.Z1 - 200, 12, 10); a.log('Added two doors with swings, the toe kick and the hanging rod (plan and 3D).'); }],
  [/tall medical supply/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a, base = Z0 + 80, split = Z0 + (Z1 - Z0) * 0.52;
    a.outline(); a.box(X0, YF + 75, Z0, X1, YB, base); shell(a, base, Z1);
    for (let z = base + 300; z < split; z += 300) a.box(X0 + T, YF + T, z, X1 - T, YB - 6, z + 12);
    for (let z = split + 300; z < Z1 - 100; z += 300) a.box(X0 + T, YF + T, z, X1 - T, YB - 6, z + 12);
    const L = leaves(X0 + T, X1 - T, 2);
    for (const lf of L) { a.frame(lf.a, split, lf.b, Z1 - T - GAP, YF, YF + T, 40); a.box(lf.a + 40, YF + 8, split + 40, lf.b - 40, YF + 11, Z1 - T - 40); pull(a, 'vbar', lf.hinge === 'L' ? lf.b - 40 : lf.a + 40, (split + Z1) / 2); a.line(lf.a, YF + 50, lf.a, YF); const hing = lf.hinge === 'L' ? lf.a : lf.b, w = lf.b - lf.a; a.line(hing, YF, hing, YF - w, 'EQUIP-SWING'); a.arc(hing, YF, w, lf.hinge === 'L' ? 270 : 180, lf.hinge === 'L' ? 360 : 270); }
    const rh = (split - base - GAP) / 3;
    for (let i = 0; i < 3; i++) { const z1 = split - GAP - i * rh; a.box(X0 + T + GAP, YF, z1 - rh + GAP, X1 - T - GAP, YF + T, z1); pull(a, 'bar', a.cx, z1 - rh / 2); a.circ(a.cx + 100, YF - 3, 10, 'EQUIP-DETAIL'); }
    a.clear('door swing', X0, YF - (X1 - X0) / 2, X1, YF, 80);
    a.log('Added shelves behind two glazed doors over three locking drawers, with swings and the toe kick (plan and 3D).');
  }],
];

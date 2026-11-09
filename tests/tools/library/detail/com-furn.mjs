/* SPDX-License-Identifier: Apache-2.0 */
/** Commercial furniture detail (furniture-3.csv). Original geometry from boxes, tubes, ellipsoids and extruded outlines. */
import { cab, tbl, pull, T, GAP } from './com-core.mjs';

/** A padded seat cushion as a flattened ellipsoid on a box base. */
export function cushion(a, x0, y0, x1, y1, z0, z1) { a.box(x0, y0, z0, x1, y1, z0 + (z1 - z0) * 0.55); a.ell((x0 + x1) / 2, (y0 + y1) / 2, z0 + (z1 - z0) * 0.55, (x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) * 0.45, 14, 5); }
export function star(a, cx, cy, z, r, n = 5) {
  for (let i = 0; i < n; i++) { const g = (i / n) * Math.PI * 2, x = cx + Math.cos(g) * r, y = cy + Math.sin(g) * r; a.tube([[cx, cy, z + 40], [x, y, z + 35]], [24, 14], 8); a.caster(x, y, 55); a.line(cx, cy, x, y, 'EQUIP-HIDDEN'); }
}

export function officeChair(a, { high = false, arms = true, mesh = true } = {}) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, seatZ = Z0 + 470;
  a.outline(); star(a, cx, cy, Z0, Math.min(W, a.D) * 0.42);
  a.cone(cx, cy, Z0 + 90, seatZ - 40, 24, 30, 10);
  cushion(a, X0 + 50, YF + 40, X1 - 50, YB - 80, seatZ - 40, seatZ + 55);
  a.box(X0 + 70, cy - 20, seatZ - 70, X1 - 70, cy + 20, seatZ - 40);   // mechanism
  const bt = high ? Z1 : Z0 + 960;
  a.box(X0 + 80, YB - 80, seatZ + 90, X0 + 100, YB - 60, bt); a.box(X1 - 100, YB - 80, seatZ + 90, X1 - 80, YB - 60, bt);
  a.box(X0 + 80, YB - 80, bt - 70, X1 - 80, YB - 50, bt);   // top rail
  if (mesh) { a.box(X0 + 100, YB - 74, seatZ + 140, X1 - 100, YB - 68, bt - 70); for (let z = seatZ + 160; z < bt - 90; z += 60) a.line(X0 + 100, YB - 70, X1 - 100, YB - 70, 'EQUIP-DETAIL'); } else a.box(X0 + 100, YB - 100, seatZ + 100, X1 - 100, YB - 50, bt - 70);
  if (arms) for (const x of [X0 + 20, X1 - 50]) { a.box(x, cy - 160, seatZ + 160, x + 30, cy + 100, seatZ + 190); a.tube([[x + 15, cy - 40, seatZ + 20], [x + 15, cy - 40, seatZ + 160]], [12, 12], 6); a.rect(x, cy - 160, x + 30, cy + 100, 'EQUIP-DETAIL'); }
  a.rect(X0 + 50, YF + 40, X1 - 50, YB - 80, 'EQUIP-DETAIL'); a.rect(X0 + 80, YB - 80, X1 - 80, YB - 50, 'EQUIP-DETAIL');
}

export function stoolLegs(a, x, y, z0, z1, r = 14) { a.leg(x, y, z0, z1, r); a.circ(x, y, r, 'EQUIP-HIDDEN'); }

export const FURN = [
  [/task chair/i, (a) => { officeChair(a, { high: false, arms: true, mesh: true }); a.log('Added the five-star base with casters, the gas column, seat, mesh back and arms (plan and 3D).'); }],
  [/conference chair, high back/i, (a) => { officeChair(a, { high: true, arms: true, mesh: false }); a.log('Added the star base, the padded seat and high back with fixed arms (plan and 3D).'); }],
  [/lecture hall seat/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a, sz = Z0 + 450; a.outline();
    a.box(cx - 20, YB - 200, Z0, cx + 20, YB - 60, sz); a.box(cx - 200, YB - 200, Z0, cx + 200, YB - 160, 30);
    cushion(a, X0 + 40, YF + 170, X1 - 40, YB - 120, sz, sz + 60);   // fold-up seat
    a.box(X0 + 40, YB - 100, sz + 60, X1 - 40, YB - 70, Z1); a.ell(cx, YB - 85, Z1 - 150, (X1 - X0) / 2 - 40, 15, 200, 14, 6);
    for (const x of [X0 + 12, X1 - 62]) a.box(x, YB - 230, sz + 40, x + 50, YB - 90, sz + 70);
    a.box(X1 - 380, YF + 80, sz + 160, X1 - 20, YF + 460, sz + 180); a.tube([[X1 - 40, YB - 220, sz + 60], [X1 - 40, YB - 300, sz + 170]], [10, 10], 6);   // writing tablet
    a.rect(X1 - 380, YF + 80, X1 - 20, YF + 460, 'EQUIP-DETAIL'); a.rect(X0 + 40, YF + 170, X1 - 40, YB - 120, 'EQUIP-DETAIL');
    a.log('Added the pedestal, the fold-up seat, padded back, arm rests and the swing-out writing tablet (plan and 3D).');
  }],
  [/restaurant booth seating/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF + 40, Z0 + 80, X1, YB, Z0 + 420); a.box(X0 + 20, YF + 60, Z0 + 420, X1 - 20, YB - 120, Z0 + 500);
    a.box(X0, YB - 120, Z0 + 420, X1, YB, Z1); a.ell(a.cx, YB - 60, Z0 + 900, (X1 - X0) / 2 - 40, 55, 420, 18, 8); a.box(X0, YF + 40, Z0, X1, YF + 80, Z0 + 80);
    for (let x = X0 + 400; x < X1 - 200; x += 400) { a.line(x, YF + 60, x, YB - 120); a.line(x, YB - 120, x, YB, 'EQUIP-DETAIL'); }
    a.rect(X0 + 20, YF + 60, X1 - 20, YB - 120, 'EQUIP-DETAIL'); a.log('Added the base plinth, seat cushion, high back with a button-tufted panel and the seam lines (plan and 3D).');
  }],
  [/bar stool with back/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, sz = Z0 + 740; a.outline();
    for (const [x, y] of [[X0 + 50, YF + 50], [X1 - 50, YF + 50], [X0 + 50, YB - 50], [X1 - 50, YB - 50]]) stoolLegs(a, x, y, Z0, sz);
    a.tube([[cx, cy, Z0 + 230], [cx, cy, Z0 + 232]], [180, 180], 20);
    cushion(a, X0 + 20, YF + 20, X1 - 20, YB - 20, sz, sz + 70); a.circ(cx, cy, 170, 'EQUIP-DETAIL');
    a.box(X0 + 40, YB - 40, sz + 120, X1 - 40, YB - 20, sz + 320);
    a.log('Added the four legs with a foot ring, the padded seat and the low back (plan and 3D).');
  }],
  [/waiting room bench seating/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cy } = a, sz = Z0 + 440; a.outline();
    a.box(X0 + 80, cy - 40, sz - 120, X1 - 80, cy + 40, sz - 40);   // beam
    for (const x of [X0 + 150, X1 - 190]) { a.box(x, cy - 30, Z0, x + 40, cy + 30, sz - 40); a.box(x - 100, YF + 60, Z0, x + 140, YF + 100, 30); a.box(x - 100, YB - 100, Z0, x + 140, YB - 60, 30); }
    for (let i = 0; i < 3; i++) { const x0 = X0 + 60 + (i * (W - 120)) / 3 + 4, x1 = X0 + 60 + ((i + 1) * (W - 120)) / 3 - 4; cushion(a, x0, YF + 30, x1, YB - 60, sz - 40, sz + 40); a.box(x0, YB - 80, sz + 40, x1, YB - 40, Z1); a.rect(x0, YF + 30, x1, YB - 60, 'EQUIP-DETAIL'); }
    for (const x of [X0, X1 - 60]) a.box(x, YF + 40, sz + 40, x + 60, YB - 40, sz + 200);
    a.log('Added the beam frame, three seat and back cushions and the two end arms (plan and 3D).');
  }],
  [/modular lounge seat, corner/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a, sz = Z0 + 400; a.outline();
    a.box(X0, YF + 100, Z0 + 60, X1, YB, sz); a.box(X0, YB - 130, sz, X1, YB, Z1); a.box(X0, YF + 100, sz, X0 + 130, YB, Z1);   // base, back, side
    cushion(a, X0 + 140, YF + 110, X1 - 10, YB - 140, sz, sz + 100);
    for (const [x, y] of [[X0 + 40, YF + 140], [X1 - 40, YF + 140], [X0 + 40, YB - 40], [X1 - 40, YB - 40]]) a.cyl(x, y, Z0, Z0 + 60, 16, 8);
    a.line(X0 + 130, YF + 100, X0 + 130, YB, 'EQUIP-DETAIL'); a.line(X0, YB - 130, X1, YB - 130, 'EQUIP-DETAIL'); a.log('Added the corner base, back and side, the seat cushion and the feet (plan and 3D).');
  }],
  [/stacking chair/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a, sz = Z0 + 450; a.outline();
    for (const [x, y] of [[X0 + 25, YF + 25], [X1 - 25, YF + 25], [X0 + 25, YB - 25], [X1 - 25, YB - 25]]) stoolLegs(a, x, y, Z0, sz, 9);
    a.xcyl(X0 + 25, X1 - 25, YF + 25, Z0 + 180, 7, 6); a.xcyl(X0 + 25, X1 - 25, YB - 25, Z0 + 180, 7, 6);
    a.ell(cx, a.cy + 10, sz + 15, (X1 - X0) / 2 - 15, (a.D - 70) / 2, 20, 16, 5);   // shell seat
    a.ell(cx, YB - 35, sz + 230, (X1 - X0) / 2 - 20, 18, 220, 16, 8);   // curved back
    a.rect(X0 + 20, YF + 20, X1 - 20, YB - 50, 'EQUIP-DETAIL'); a.log('Added four steel legs with side rails, the molded seat and the curved back shell (plan and 3D).');
  }],
  [/recliner, hospital/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a, sz = Z0 + 480; a.outline();
    a.box(X0 + 40, YF + 300, Z0 + 100, X1 - 40, YB - 100, sz); a.box(X0 + 40, YF + 40, Z0 + 220, X1 - 40, YF + 300, Z0 + 340);   // footrest out
    cushion(a, X0 + 110, YF + 300, X1 - 110, YB - 220, sz, sz + 100); a.box(X0 + 110, YB - 220, sz, X1 - 110, YB - 60, Z1);
    for (const x of [X0, X1 - 90]) { a.box(x, YF + 330, sz, x + 90, YB - 60, sz + 220); a.rect(x, YF + 330, x + 90, YB - 60, 'EQUIP-DETAIL'); }
    a.box(X0 + 40, YB - 100, Z0, X1 - 40, YB - 40, Z0 + 100); for (const [x, y] of [[X0 + 70, YF + 340], [X1 - 70, YF + 340], [X0 + 70, YB - 70], [X1 - 70, YB - 70]]) a.caster(x, y, 90);
    a.rect(X0 + 40, YF + 40, X1 - 40, YF + 300, 'EQUIP-DETAIL'); a.log('Added the base, seat, back, arms, the extended footrest and four casters (plan and 3D).');
  }],
  [/boat shaped/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, zt = Z1, tt = 40, pts = [];
    for (let i = 0; i <= 24; i++) { const t = (i / 24) * Math.PI * 2, x = cx + Math.cos(t) * W / 2, k = Math.pow(Math.abs(Math.sin(t)), 0.7); pts.push([x, cy + Math.sign(Math.sin(t)) * k * D / 2 * (1 - 0.18 * Math.pow(Math.abs(Math.cos(t)), 4))]); }
    a.prism(pts, zt - tt, zt); a.poly(pts);
    for (const x of [cx - W * 0.28, cx + W * 0.28]) { a.box(x - 20, cy - D * 0.3, Z0, x + 20, cy + D * 0.3, zt - tt); a.box(x - 20, cy - D * 0.35, Z0, x + 20, cy - D * 0.3 + 10, Z0 + 40); a.box(x - 200, cy - D * 0.3, Z0, x + 200, cy - D * 0.3 + 40, Z0 + 40); a.box(x - 200, cy + D * 0.3 - 40, Z0, x + 200, cy + D * 0.3, Z0 + 40); a.rect(x - 20, cy - D * 0.3, x + 20, cy + D * 0.3, 'EQUIP-HIDDEN'); }
    a.box(cx - 200, cy - 10, zt - tt - 90, cx + 200, cy + 10, zt - tt);   // cable tray
    a.log('Added the boat-shaped top on two slab bases with feet and a cable tray (plan and 3D).');
  }],
  [/training table, flip-top/i, (a) => { tbl(a, { topT: 32, base: 'legs', casters: 70, apron: 60, legR: 20 }); a.box(a.X0 + 60, a.YF + 120, a.Z1 - 140, a.X1 - 60, a.YF + 150, a.Z1 - 72); a.log('Added the top, folding legs with casters and the modesty panel (plan and 3D).'); }],
  [/bistro table/i, (a) => { tbl(a, { round: true, base: 'pedestal', topT: 30 }); a.log('Added the round top, the column and the cast foot (plan and 3D).'); }],
  [/cafeteria table with attached/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, zt = Z0 + 740; a.outline();
    a.box(X0 + 500, YF + 500, zt - 38, X1 - 500, YB - 500, zt); a.rect(X0 + 500, YF + 500, X1 - 500, YB - 500);
    for (const x of [X0 + 560, X1 - 600]) a.box(x, YF + 520, Z0, x + 40, YB - 520, zt - 38);
    for (const fy of [YF, YB - 380]) { for (const x of [X0 + 560, X1 - 600]) { a.box(x - 10, fy + 190, Z0 + 400, x + 50, fy + 210, Z0 + 440); } }
    for (const [sx, sy] of [[cx - 480, YF + 190], [cx + 480, YF + 190], [cx - 480, YB - 190], [cx + 480, YB - 190]]) { a.cyl(sx, sy, Z0 + 440, Z0 + 470, 180, 18); a.circ(sx, sy, 180); a.box(sx - 10, sy < cy ? YF + 360 : YB - 500, Z0 + 420, sx + 10, sy < cy ? YF + 560 : YB - 360, Z0 + 440); }
    a.box(X0 + 520, a.cy - 8, Z0 + 420, X1 - 520, a.cy + 8, Z0 + 440);
    a.log('Added the top on twin frames and four stools on swing arms (plan and 3D).');
  }],
  [/high-top table/i, (a) => { tbl(a, { round: true, base: 'pedestal', topT: 38 }); a.log('Added the bar-height round top, the column and the foot (plan and 3D).'); }],
  [/banquet table, folding/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; tbl(a, { topT: 28, base: 'trestle' }); a.log('Added the top with edge, folding trestle leg pairs and the cross brace (plan and 3D).');
  }],
  [/banquet round table/i, (a) => { tbl(a, { round: true, base: 'pedestal', topT: 32 }); a.rect(a.cx - 400, a.cy - 40, a.cx + 400, a.cy + 40, 'EQUIP-HIDDEN'); a.log('Added the 60 in round top on a folding X base (plan and 3D).'); }],
  [/open plan benching desk/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, zt = Z1; a.outline();
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
      const x0 = X0 + c * (W / 2), x1 = x0 + W / 2, y0 = r ? cy + 20 : YF, y1 = r ? YB : cy - 20;
      a.box(x0, y0, zt - 30, x1, y1, zt); a.rect(x0 + 4, y0 + 4, x1 - 4, y1 - 4, 'EQUIP-DETAIL');
      const fy = r ? y1 - 40 : y0 + 40; a.box(x1 - 60, y0 + 30, Z0, x1 - 30, y1 - 30, zt - 30);
    }
    a.box(X0 + 20, cy - 20, Z0 + 600, X1 - 20, cy + 20, Z0 + 640); a.box(X0 + 20, cy - 12, zt, X1 - 20, cy + 12, zt + 340); a.rect(X0, cy - 20, X1, cy + 20, 'EQUIP-DETAIL');
    a.box(cx - 8, YF + 30, Z0, cx + 8, YB - 30, zt - 30); for (const x of [X0 + 60, X1 - 60]) a.box(x - 20, YF + 30, Z0, x + 20, YB - 30, 40);
    a.log('Added four work surfaces, the shared center screen, frames and the cable beam (plan and 3D).');
  }],
  [/sit-stand desk/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z1 - 30, X1, YB, Z1); a.rect(X0 + 6, YF + 6, X1 - 6, YB - 6, 'EQUIP-DETAIL');
    for (const x of [X0 + 120, X1 - 120]) { a.box(x - 40, cy - 280, Z0, x + 40, cy + 280, 40); a.box(x - 35, cy - 30, 40, x + 35, cy + 30, Z1 - 80); a.box(x - 25, cy - 20, Z1 - 80, x + 25, cy + 20, Z1 - 30); a.rect(x - 40, cy - 280, x + 40, cy + 280, 'EQUIP-HIDDEN'); }
    a.box(X0 + 120, YB - 80, Z1 - 100, X1 - 120, YB - 40, Z1 - 30); a.box(X1 - 230, YF + 10, Z1 - 60, X1 - 120, YF + 120, Z1 - 30);
    a.log('Added the top, two telescoping columns with feet, the crossbar and the control paddle (plan and 3D).');
  }],
  [/executive L-shaped desk/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a, zt = Z1, d1 = 760; a.outline();
    a.prism([[X0, YB - d1], [X1, YB - d1], [X1, YB], [X0, YB]], zt - 38, zt); a.prism([[X0, YF], [X0 + 560, YF], [X0 + 560, YB - d1], [X0, YB - d1]], zt - 38, zt);
    a.poly([[X0, YF], [X0 + 560, YF], [X0 + 560, YB - d1], [X1, YB - d1], [X1, YB], [X0, YB]], 'EQUIP');
    a.box(X1 - 440, YB - d1 + 30, Z0 + 50, X1 - 30, YB - 30, zt - 38); for (let i = 0; i < 3; i++) { const z1 = zt - 38 - 30 - i * 200; a.box(X1 - 430, YB - d1 + 8, z1 - 180, X1 - 40, YB - d1 + 28, z1); pull(a, 'bar', X1 - 235, z1 - 90, YB - d1 + 8); }
    a.box(X0 + 560 - 40, YF + 30, Z0, X0 + 560 - 20, YB - d1 - 20, zt - 38); a.box(X0 + 30, YB - 70, Z0, X0 + 50, YB - 40, zt - 38); a.box(X0 + 560 - 100, YB - 70, Z0 + 100, X1 - 440, YB - 40, zt - 100);
    a.log('Added the L-shaped top with return, the pedestal with three drawers, the return panel and the modesty panel (plan and 3D).');
  }],
  [/teller station/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, zc = Z0 + 1060; cab(a, { toe: 100, drawers: 3, drawerCols: 2, pull: 'bar', topT: 45 });
    a.box(X0 + 30, YB - 120, zc, X1 - 30, YB - 100, Z1 + 700); a.frame(X0 + 30, zc, X1 - 30, Z1 + 700, YB - 125, YB - 95, 20); a.box(X0 + 50, YB - 118, zc + 20, X1 - 50, YB - 102, Z1 + 680);
    a.box(a.cx - 160, YB - 140, zc + 20, a.cx + 160, YB - 95, zc + 130); a.rect(X0 + 30, YB - 125, X1 - 30, YB - 95, 'EQUIP-DETAIL');
    a.log('Added the counter with six drawers, the glass screen with a pass-through and the toe kick (plan and 3D).');
  }],
  [/mobile pedestal/i, (a) => { cab(a, { casters: 80, drawers: 3, pull: 'bar', topT: 35 }); a.ell(a.cx, a.cy, a.Z1, a.W / 2 - 10, a.D / 2 - 10, 18, 12, 4); a.log('Added three drawers, the cushion top and four casters (plan and 3D).'); }],
  [/lateral file, four drawer/i, (a) => { cab(a, { toe: 40, drawers: 4, pull: 'recess', topT: 25 }); a.log('Added four lateral drawers with recessed pulls (plan and 3D).'); }],
  [/metal storage cabinet/i, (a) => { cab(a, { toe: 60, doors: 2, swing: true, pull: 'vbar', lock: true }); a.log('Added two locking doors with swings and the toe kick (plan and 3D).'); }],
  [/display shelving gondola/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 140);
    a.box(cx - 15, YF + 30, Z0 + 140, cx + 15, YB - 30, Z1); for (const x of [X0 + 20, X1 - 20]) a.box(x - 15, YF + 30, Z0 + 140, x + 15, YB - 30, Z1);
    for (let i = 0; i < 5; i++) { const z = Z0 + 260 + i * 250; a.box(X0 + 10, YF + 30, z, X1 - 10, cy - 20, z + 10); a.box(X0 + 10, cy + 20, z, X1 - 10, YB - 30, z + 10); a.box(X0 + 10, YF + 30, z + 10, X1 - 10, YF + 42, z + 70); a.box(X0 + 10, YB - 42, z + 10, X1 - 10, YB - 30, z + 70); }
    a.box(X0, cy - 15, Z1 - 10, X1, cy + 15, Z1); a.rect(X0 + 10, YF + 30, X1 - 10, cy - 20, 'EQUIP-DETAIL'); a.rect(X0 + 10, cy + 20, X1 - 10, YB - 30, 'EQUIP-DETAIL');
    a.log('Added the base, center and end uprights, five shelf levels on both faces with price rails and the top cap (plan and 3D).');
  }],
  [/coat rack, wall-mounted/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YB - 25, Z0, X1, YB, Z0 + 90);
    for (let x = X0 + 80; x < X1 - 50; x += 110) { a.tube([[x, YB - 25, Z0 + 45], [x, YB - 140, Z0 + 45], [x, YB - 190, Z0 + 140]], [10, 9, 9], 8); a.circ(x, YB - 140, 10, 'EQUIP-DETAIL'); }
    a.box(X0, YB - 200, Z1 - 30, X1, YB, Z1); a.line(X0, YB - 25, X1, YB - 25, 'EQUIP-DETAIL');
    a.log('Added the backing rail, the row of coat hooks and the hat shelf above (plan and 3D).');
  }],
  [/hospital patient bed/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); const dz = Z0 + 420;
    a.box(X0 + 120, YF + 300, Z0 + 140, X1 - 120, YB - 300, dz - 70); for (const [x, y] of [[X0 + 100, YF + 200], [X1 - 100, YF + 200], [X0 + 100, YB - 200], [X1 - 100, YB - 200]]) { a.caster(x, y, 130); a.circ(x, y, 50, 'EQUIP-HIDDEN'); }
    a.box(X0 + 30, YF + 60, dz - 70, X1 - 30, YB - 400, dz); a.box(X0 + 30, YB - 400, dz - 70, X1 - 30, YB - 60, dz);
    a.box(X0 + 30, YF + 60, dz, X1 - 30, YB - 560, dz + 200); a.box(X0 + 30, YB - 560, dz, X1 - 30, YB - 60, dz + 100);
    a.box(X0, YF + 60, dz + 100, X1, YF + 100, dz + 700); a.box(X0, YB - 100, dz + 100, X1, YB - 60, Z1);
    for (const x of [X0 - 0, X1 - 30]) { a.box(x, YF + 400, dz + 200, x + 30, YB - 450, dz + 560); for (let z = dz + 250; z < dz + 560; z += 100) a.line(x, a.cy, x + 30, a.cy, 'EQUIP-DETAIL'); }
    a.rect(X0 + 30, YF + 60, X1 - 30, YB - 60, 'EQUIP-DETAIL'); a.log('Added the base frame with casters, the mattress sections, head and foot boards and the raised side rails (plan and 3D).');
  }],
  [/exam table/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline();
    a.box(X0 + 30, YF + 60, Z0, X1 - 30, YF + 700, Z0 + 700); a.box(X0 + 30, YF + 60, Z0 + 700, X1 - 30, YB - 520, Z1 - 80); cushion(a, X0 + 20, YF + 40, X1 - 20, YB - 500, Z1 - 80, Z1);
    cushion(a, X0 + 20, YB - 500, X1 - 20, YB - 40, Z1 - 120, Z1 - 20); a.box(X0 + 30, YF + 700, Z0 + 200, X1 - 30, YF + 720, Z0 + 700);
    for (let i = 0; i < 3; i++) { const z1 = Z0 + 680 - i * 200; a.box(X0 + 40, YF + 40, z1 - 180, X1 - 40, YF + 60, z1); pull(a, 'bar', cx, z1 - 90, YF + 40); }
    a.box(cx - 150, YF + 700, Z0, cx + 150, YB - 520, Z0 + 40); a.box(X0 - 0, YB - 40, Z0 + 700, X1, YB, Z0 + 740); a.rect(X0 + 20, YF + 40, X1 - 20, YB - 500, 'EQUIP-DETAIL');
    a.log('Added the base cabinet with three drawers, the padded table, the raised back section and the foot piece (plan and 3D).');
  }],
  [/hotel bed, king/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline(); a.box(X0, YF, Z0 + 150, X1, YB - 80, Z0 + 380);
    for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 120], [X1 - 40, YB - 120]]) a.cyl(x, y, Z0, Z0 + 150, 22, 8);
    cushion(a, X0 + 30, YF + 30, X1 - 30, YB - 110, Z0 + 380, Z0 + 600); a.box(X0 + 30, YF + 600, Z0 + 540, X1 - 30, YF + 640, Z0 + 600);
    a.box(X0 - 0, YB - 80, Z0 + 250, X1, YB - 40, Z1); a.ell(cx, YB - 60, Z0 + 800, W / 2 - 40, 30, 380, 16, 8);
    for (const x of [cx - W * 0.25, cx + W * 0.25]) { a.ell(x, YB - 280, Z0 + 640, 330, 190, 80, 14, 6); a.ellp(x, YB - 280, 330, 190, 'EQUIP-DETAIL'); }
    a.line(X0 + 30, YF + 640, X1 - 30, YF + 640, 'EQUIP-DETAIL'); a.log('Added the platform base, the mattress with a folded cover line, two pillows and the tall upholstered headboard (plan and 3D).');
  }],
  [/host stand/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YB - 300, Z0, X1, YB, Z1 - 40); a.box(X0 + 20, YB - 500, Z0, X1 - 20, YB - 300, Z0 + 700);
    a.prism([[X0, YB - 470], [X1, YB - 470], [X1, YB], [X0, YB]], Z1 - 40, Z1 - 20); a.box(X0, YB - 60, Z1 - 20, X1, YB, Z1);
    a.box(X0 + 20, YB - 500, Z0 + 700, X1 - 20, YB - 480, Z1 - 40); a.log('Added the tall back, the lower shelf, the slanted top and the ledge (plan and 3D).');
  }],
  [/acoustic room divider/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0 + 90, X1, YB, Z1);
    for (const x of [X0 + 80, X1 - 380]) { a.box(x, YF, Z0, x + 300, YB, Z0 + 90); a.rect(x, YF, x + 300, YB, 'EQUIP-HIDDEN'); }
    for (let x = X0 + 150; x < X1 - 50; x += 150) a.line(x, YF, x, YB, 'EQUIP-DETAIL'); a.frame(X0, Z0 + 90, X1, Z1, YF, YB, 20);
    a.log('Added the felt-faced panel with its frame and the two feet (plan and 3D).');
  }],
];

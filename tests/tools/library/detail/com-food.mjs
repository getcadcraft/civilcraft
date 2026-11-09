/* SPDX-License-Identifier: Apache-2.0 */
/** Commercial foodservice detail (foodservice-3.csv): one builder per type. Original geometry; sizes come from the object's body box. */
import { cab, tbl, pull, T, GAP } from './com-core.mjs';

/** Four posts and an optional lower shelf: an open stand under an appliance. */
export function stand(a, top, { rail = true, post = 22, shelf = false } = {}) {
  const { X0, X1, YF, YB, Z0 } = a;
  for (const [x, y] of [[X0 + post, YF + post], [X1 - post, YF + post], [X0 + post, YB - post], [X1 - post, YB - post]]) { a.box(x - post / 2, y - post / 2, Z0, x + post / 2, y + post / 2, top); a.circ(x, y, post / 2, 'EQUIP-HIDDEN'); }
  if (rail) { a.box(X0, YF, top - 30, X1, YF + 20, top); a.box(X0, YB - 20, top - 30, X1, YB, top); a.box(X0, YF, top - 30, X0 + 20, YB, top); a.box(X1 - 20, YF, top - 30, X1, YB, top); }
  if (shelf) a.box(X0 + 30, YF + 30, Z0 + 180, X1 - 30, YB - 30, Z0 + 200);
}
export function knobs(a, n, zc, x0 = a.X0 + 70, x1 = a.X1 - 70, y = a.YF) {
  for (let i = 0; i < n; i++) { const x = x0 + ((x1 - x0) * (i + 0.5)) / n; a.ycyl(y - 26, y, x, zc, 17, 10); a.ycyl(y - 32, y - 26, x, zc, 20, 10); a.circ(x, y - 16, 17, 'EQUIP-DETAIL'); }
}
export function collar(a, cx, cy, z0, z1, r) { a.cyl(cx, cy, z0, z1, r, 16); a.circ(cx, cy, r, 'EQUIP-DETAIL'); a.circ(cx, cy, r - 12, 'EQUIP-DETAIL'); }

export const FOOD = [
  [/combi oven/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, H } = a, split = Z0 + H * 0.38;
    a.outline(); stand(a, split, { shelf: false });
    for (let z = Z0 + 220; z < split - 60; z += 90) { a.box(X0 + 50, YF + 40, z, X0 + 70, YB - 40, z + 14); a.box(X1 - 70, YF + 40, z, X1 - 50, YB - 40, z + 14); }
    a.box(X0, YF + T, split, X1, YB, Z1);
    a.frame(X0 + 10, split + 20, X1 - 170, Z1 - 20, YF, YF + T, 40); a.box(X0 + 50, YF + 6, split + 60, X1 - 210, YF + 12, Z1 - 60);
    a.box(X1 - 160, YF - 6, split + 20, X1 - 10, YF, Z1 - 20); knobs(a, 2, Z1 - 120, X1 - 150, X1 - 20); a.box(X1 - 140, YF - 8, split + 60, X1 - 30, YF - 6, split + 240);
    a.box(X0 + 20, YF - 40, split + 200, X0 + 40, YF, Z1 - 200);   // door handle
    a.rect(X0 + 20, YF - 40, X0 + 40, YF, 'EQUIP-DETAIL'); a.line(X1 - 165, YF, X1 - 165, YF + 50);
    a.arc(X0, YF, X1 - 165 - X0, 270, 360); a.clear('door swing', X0, YF - (X1 - 165 - X0), X1, YF, 80);
    a.log('Added the stand with pan rails, the oven body, glazed door with handle and swing, and the control panel (plan and 3D).');
  }],
  [/conveyor pizza oven/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, H, W } = a, bot = Z0 + 230;
    a.outline(); stand(a, bot, { shelf: true });
    const dh = (Z1 - bot - 60) / 2;
    for (let i = 0; i < 2; i++) {
      const z0 = bot + i * (dh + 20), z1 = z0 + dh;
      a.box(X0 + 200, YF + 40, z0, X1 - 200, YB - 40, z1);
      a.box(X0 + 20, YF + 140, z0 + 40, X0 + 200, YB - 140, z0 + 54); a.box(X1 - 200, YF + 140, z0 + 40, X1 - 20, YB - 140, z0 + 54);   // belt ends
      a.box(X0 + 200, YF + 100, z0 + dh * 0.3, X0 + 215, YB - 100, z1 - 30); a.box(X1 - 215, YF + 100, z0 + dh * 0.3, X1 - 200, YB - 100, z1 - 30);
      a.rect(X0 + 20, YF + 140, X0 + 200, YB - 140, 'EQUIP-DETAIL'); a.rect(X1 - 200, YF + 140, X1 - 20, YB - 140, 'EQUIP-DETAIL');
    }
    a.box(X0 + W * 0.4, YF, bot + 30, X0 + W * 0.6, YF + 40, Z1 - 30); knobs(a, 3, Z1 - 160, X0 + W * 0.4 + 20, X0 + W * 0.6 - 20, YF + 40);
    a.line(X0 + 200, YF + 40, X1 - 200, YF + 40);
    a.log('Added two oven decks with conveyor belts extending at both ends, the shared control panel and the open stand (plan and 3D).');
  }],
  [/charbroiler/i, (a) => {
    const { X0, X1, YF, YB, Z1 } = a;
    cab(a, { toe: 100, doors: 0, panel: { z0: Z1 - 190, z1: Z1 - 70, keys: 4 } });
    a.box(X0 + 20, YF + 60, Z1 - 20, X1 - 20, YB - 60, Z1 - 4);
    for (let x = X0 + 40; x < X1 - 40; x += 28) { a.box(x, YF + 70, Z1 - 4, x + 12, YB - 70, Z1 + 12); }
    a.box(X0, YF, Z1 - 60, X1, YF + 50, Z1 - 20);   // grease trough
    for (let x = X0 + 40; x < X1 - 40; x += 28) a.line(x + 6, YF + 70, x + 6, YB - 70, 'EQUIP-DETAIL');
    a.box(X0, YB - 40, Z1 - 20, X1, YB, Z1 + 60); a.log('Added the toe kick, control panel with knobs, grease trough and grate bars (plan and 3D).');
  }],
  [/braising pan/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a;
    cab(a, { toe: 120, doors: 0 });
    a.box(X0 + 10, YF + 10, Z1 - 330, X1 - 10, YB - 10, Z1 - 20); a.box(X0 + 40, YF + 40, Z1 - 20, X1 - 40, YB - 40, Z1 - 4);
    a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-DETAIL'); a.box(a.cx - 120, YF - 20, Z1 - 60, a.cx + 120, YF + 30, Z1);   // pour lip
    a.box(X0, YB - 30, Z1, X1, YB, Z1 + 140);   // lid hinge
    a.cyl(X1 + 0 - 40, YF + 120, Z1 - 200, Z1 - 120, 6, 8); a.ycyl(YF + 40, YF + 220, X1 - 40, Z1 - 160, 90, 14); a.circ(X1 - 40, YF + 130, 90, 'EQUIP-DETAIL');
    a.log('Added the pan, pour lip, lid hinge and the tilt hand wheel on a pedestal (plan and 3D).');
  }],
  [/fryer battery/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a;
    cab(a, { toe: 100, doors: 3, pull: 'bar', topT: 60 });
    for (let i = 0; i < 3; i++) {
      const x0 = X0 + 30 + (i * (W - 60)) / 3, x1 = X0 + 30 + ((i + 1) * (W - 60)) / 3 - 20;
      a.box(x0, YF + 140, Z1 - 4, x1, YB - 220, Z1 + 4); a.rect(x0, YF + 140, x1, YB - 220, 'EQUIP-DETAIL');
      a.box(x0 + 10, YF + 140, Z1, x0 + 14, YB - 220, Z1 + 12); a.box(x1 - 14, YF + 140, Z1, x1 - 10, YB - 220, Z1 + 12);
      a.xcyl(x0 + 40, x1 - 40, YF + 60, Z1 + 60, 7, 8);   // basket hanger rod
    }
    a.box(X0, YB - 220, Z1, X1, YB, Z1 + 160); a.log('Added three doors, the three open vats with hanger rods and the flue riser (plan and 3D).');
  }],
  [/wok range/i, (a) => {
    const { X0, X1, YF, YB, Z1, cy } = a;
    cab(a, { toe: 100, doors: 2, pull: 'bar', topT: 60 });
    for (const x of [X0 + a.W * 0.27, X0 + a.W * 0.73]) {
      a.tube([[x, cy, Z1 - 4], [x, cy, Z1 + 60], [x, cy, Z1 + 110]], [60, 230, 260], 20); a.circ(x, cy, 260); a.circ(x, cy, 130, 'EQUIP-DETAIL');
      a.ycyl(YB - 150, YB - 20, x, Z1 + 140, 14, 8);   // swing tap
    }
    a.box(X0 + 40, YB - 40, Z1, X1 - 40, YB, Z1 + 120); a.log('Added two wok rings with cradles, swing taps and a cabinet below (plan and 3D).');
  }],
  [/blast chiller/i, (a) => { cab(a, { doors: 1, swing: true, toe: 120, pull: 'vbar', panel: { z0: a.Z1 - 260, z1: a.Z1 - 110, keys: 3 } }); a.ycyl(a.YF - 0, a.YF + 6, a.X0 + 40, a.Z1 - 380, 5, 6); a.log('Added the insulated door with swing, vertical handle, control panel and probe port (plan and 3D).'); }],
  [/pizza prep table/i, (a) => {
    const { X0, X1, YF, YB, Z1, W } = a;
    cab(a, { toe: 100, doors: 2, swing: true, pull: 'vbar', topT: 80 });
    a.box(X0, YB - 120, Z1 - 80, X1, YB, Z1 - 40); a.box(X0, YB - 360, Z1 - 80, X1, YB - 120, Z1 - 40);
    for (let i = 0; i < 4; i++) { const x0 = X0 + 40 + (i * (W - 80)) / 4; a.box(x0, YB - 330, Z1 - 40, x0 + (W - 80) / 4 - 18, YB - 150, Z1 - 20); a.rect(x0, YB - 330, x0 + (W - 80) / 4 - 18, YB - 150, 'EQUIP-DETAIL'); }
    a.box(X0, YB - 40, Z1 - 40, X1, YB, Z1); a.log('Added two swing doors, the refrigerated pan rail with four insets and the work surface (plan and 3D).');
  }],
  [/back-bar refrigerator/i, (a) => { cab(a, { doors: 3, glass: true, swing: true, toe: 100, pull: 'vbar', topT: 40 }); a.log('Added three glazed doors, the bar top and toe kick (plan and 3D).'); }],
  [/walk-in freezer door/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a;
    a.outline(); a.box(X0, YF, Z0, X0 + 90, YB, Z1); a.box(X1 - 90, YF, Z0, X1, YB, Z1); a.box(X0 + 90, YF, Z1 - 90, X1 - 90, YB, Z1);
    const dx0 = X0 + 90, dx1 = X1 - 90;
    a.box(dx0 + GAP, YF - 25, Z0 + GAP, dx1 - GAP, YB - 5, Z1 - 90 - GAP);
    a.frame(dx0 + 130, Z0 + 1400, dx0 + 330, Z0 + 1800, YF - 28, YF - 25, 20); a.box(dx0 + 140, YF - 27, Z0 + 1410, dx0 + 320, YF - 24, Z0 + 1790);
    a.box(dx1 - 150, YF - 70, Z0 + 900, dx1 - 90, YF - 25, Z0 + 1100); a.box(dx1 - 150, YF - 70, Z0 + 1000, dx1 - 90, YF - 45, Z0 + 1030);
    for (const z of [Z0 + 300, Z0 + 1000, Z0 + 1700]) a.box(dx0 - 2, YF - 30, z, dx0 + 40, YF - 5, z + 120);
    a.line(dx0, YF, dx1, YF); a.arc(dx0, YF, dx1 - dx0, 270, 360); a.line(dx0, YF, dx0, YF - (dx1 - dx0), 'EQUIP-SWING'); a.clear('door swing', dx0, YF - (dx1 - dx0), dx1, YF, 80);
    a.log('Added the door frame, insulated leaf with viewing window, hinges, latch and 90° swing (plan and 3D).');
  }],
  [/three-compartment sink/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, zt = Z1 - 150, dbw = 480, bw = (W - 2 * dbw) / 3;
    a.outline(); tbl(a, { topT: 1, base: 'legs', apron: 1 });
    const xs = [X0 + dbw, X0 + dbw + bw, X0 + dbw + 2 * bw, X1 - dbw];
    a.box(X0, YF, zt - 40, xs[0], YB, zt); a.box(xs[3], YF, zt - 40, X1, YB, zt);
    for (let i = 0; i < 3; i++) { const b0 = xs[i], b1 = xs[i + 1]; a.box(b0, YF, zt - 40, b1, YF + 70, zt); a.box(b0, YB - 70, zt - 40, b1, YB, zt); a.box(b0, YF + 70, zt - 380, b1, YB - 70, zt - 360); a.box(b0, YF + 70, zt - 380, b0 + 6, YB - 70, zt - 40); a.box(b1 - 6, YF + 70, zt - 380, b1, YB - 70, zt - 40); a.rect(b0 + 10, YF + 80, b1 - 10, YB - 80, 'EQUIP-DETAIL'); a.circ((b0 + b1) / 2, a.cy, 30, 'EQUIP-DETAIL'); a.tube([[ (b0 + b1) / 2, YB - 40, zt], [ (b0 + b1) / 2, YB - 40, zt + 350], [(b0 + b1) / 2, YB - 200, zt + 380]], [14, 14, 14], 8); }
    a.box(X0, YB - 40, zt, X1, YB, Z1);
    a.log('Added three bowls with drains and swing faucets between two drainboards, the splash and legs (plan and 3D).');
  }],
  [/hand sink, wall-mounted/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a;
    a.outline(); a.box(X0, YF + 40, Z0, X1, YB, Z0 + 180); a.box(X0 + 20, YF + 40, Z0 + 180, X1 - 20, YB - 40, Z0 + 200);
    a.rect(X0 + 40, YF + 60, X1 - 40, YB - 60, 'EQUIP-DETAIL'); a.circ(cx, a.cy, 14, 'EQUIP-DETAIL');
    a.box(X0, YB - 20, Z0 + 180, X1, YB, Z0 + 560);
    a.tube([[cx, YB - 30, Z0 + 200], [cx, YB - 30, Z0 + 330], [cx, YB - 150, Z0 + 340]], [12, 12, 10], 8);
    a.box(X0 + 20, YF + 120, Z0 - 420, X0 + 60, YF + 160, Z0); a.ycyl(YF + 60, YF + 120, X0 + 40, Z0 - 380, 9, 6);   // knee valve
    a.log('Added the bowl, drain, gooseneck faucet, backsplash and knee valve (plan and 3D).');
  }],
  [/stainless work table with drawers/i, (a) => { tbl(a, { topT: 38, shelf: 220, splash: { h: 100, t: 22 }, drawers: 2, legR: 22 }); a.log('Added the top with a rear backsplash, an undershelf, two drawers and four legs (plan and 3D).'); }],
  [/butcher block table/i, (a) => { tbl(a, { topT: 110, shelf: 200, legR: 24, edge: 0 }); a.rect(a.X0 + 30, a.YF + 30, a.X1 - 30, a.YB - 30, 'EQUIP-DETAIL'); a.log('Added the thick block top, four legs and an undershelf (plan and 3D).'); }],
  [/dunnage rack/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline();
    for (const x of [X0, X1 - 70]) a.box(x, YF, Z0, x + 70, YB, Z0 + 100);
    for (let y = YF + 20; y < YB - 20; y += 80) { a.box(X0, y, Z0 + 100, X1, y + 50, Z1); a.rect(X0, y, X1, y + 50, 'EQUIP-DETAIL'); }
    a.log('Added the two skids and the raised slats (plan and 3D).');
  }],
  [/sheet pan rack/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline();
    for (const [x, y] of [[X0 + 12, YF + 12], [X1 - 12, YF + 12], [X0 + 12, YB - 12], [X1 - 12, YB - 12]]) { a.box(x - 12, y - 12, Z0 + 110, x + 12, y + 12, Z1); a.caster(x, y, 110); a.circ(x, y, 12, 'EQUIP-HIDDEN'); }
    for (let i = 0; i < 20; i++) { const z = Z0 + 170 + i * 74; a.box(X0 + 24, YF + 24, z, X0 + 40, YB - 24, z + 8); a.box(X1 - 40, YF + 24, z, X1 - 24, YB - 24, z + 8); }
    a.box(X0, YF, Z0 + 110, X1, YF + 12, Z0 + 140); a.box(X0, YB - 12, Z0 + 110, X1, YB, Z0 + 140);
    a.log('Added four posts, twenty pan slides on each side and four casters (plan and 3D).');
  }],
  [/conveyor dishmachine/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, ln = 560, rn = 560, mx0 = X0 + ln, mx1 = X1 - rn;
    a.outline();
    for (const [x0, x1] of [[X0, mx0], [mx1, X1]]) { a.box(x0, YF, Z0 + 740, x1, YB, Z0 + 800); for (const x of [x0 + 30, x1 - 60]) { a.box(x, YF + 30, Z0, x + 30, YF + 60, Z0 + 740); a.box(x, YB - 60, Z0, x + 30, YB - 30, Z0 + 740); } a.box(x0, YB - 40, Z0 + 800, x1, YB, Z0 + 1000); a.rect(x0 + 20, YF + 20, x1 - 20, YB - 20, 'EQUIP-DETAIL'); }
    a.box(mx0, YF + 20, Z0 + 150, mx1, YB, Z1 - 100); a.box(mx0 + 30, YF, Z0 + 760, mx0 + 90, YF + 20, Z1 - 140); a.box(mx1 - 90, YF, Z0 + 760, mx1 - 30, YF + 20, Z1 - 140);
    for (let i = 0; i < 4; i++) { const x = mx0 + 140 + i * ((mx1 - mx0 - 280) / 3); a.box(x, YF + 20, Z0 + 780, x + 8, YB - 80, Z1 - 300); }
    a.box(mx0 + 100, YF - 6, Z0 + 1150, mx1 - 100, YF, Z0 + 1400); knobs(a, 4, Z0 + 1275, mx0 + 150, mx1 - 150, YF - 6);
    a.box(mx0, YF + 20, Z1 - 100, mx1, YB, Z1);
    a.line(mx0, YF + 20, mx0, YB); a.line(mx1, YF + 20, mx1, YB);
    a.log('Added the loading table, the wash and rinse chamber with curtains, the unloading table, controls and splashes (plan and 3D).');
  }],
  [/glasswasher/i, (a) => { cab(a, { doors: 1, swing: true, toe: 100, pull: 'bar', panel: { z0: a.Z1 - 190, z1: a.Z1 - 60, keys: 3 }, topT: 30 }); a.log('Added the hinged door with swing, the control panel and the toe kick (plan and 3D).'); }],
  [/pot and pan washer/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline();
    a.box(X0, YF + 60, Z0 + 200, X1, YB, Z0 + 900); for (const x of [X0 + 30, X1 - 60]) { a.box(x, YF + 60, Z0, x + 30, YF + 90, Z0 + 200); a.box(x, YB - 30, Z0, x + 30, YB, Z0 + 200); }
    a.box(X0 + 40, YF, Z0 + 900, X1 - 40, YB, Z1 - 100); a.frame(X0 + 120, Z0 + 960, X1 - 120, Z1 - 160, YF - 10, YF, 30);
    a.box(X0 + W * 0.4, YF - 40, Z0 + 1400, X0 + W * 0.6, YF - 10, Z0 + 1440); a.box(X0 + 40, YB - 120, Z1 - 100, X1 - 40, YB, Z1);
    a.line(X0 + 40, YF, X1 - 40, YF); a.log('Added the base, the raised hood door with handle, the splash and the rack track (plan and 3D).');
  }],
  [/Type I exhaust hood/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a;
    a.outline('EQUIP'); a.prism([[X0, YF], [X1, YF], [X1, YB], [X0, YB]], Z0, Z0 + 60);
    a.prism([[X0 + 30, YF + 20], [X1 - 30, YF + 20], [X1 - 30, YB - 10], [X0 + 30, YB - 10]], Z0 + 60, Z1 - 100);
    a.prism([[cx - 380, YB - 380], [cx + 380, YB - 380], [cx + 250, YB - 90], [cx - 250, YB - 90]], Z1 - 100, Z1);   // transition to the collar
    for (let x = X0 + 60; x < X1 - 120; x += 205) { a.box(x, YF + 10, Z0 + 60, x + 190, YF + 50, Z0 + 460); for (let k = 1; k < 6; k++) a.box(x + 6, YF + 4, Z0 + 60 + k * 66, x + 184, YF + 10, Z0 + 66 + k * 66); a.rect(x, YF + 10, x + 190, YF + 50, 'EQUIP-DETAIL'); }
    for (const x of [X0 + 200, X1 - 200]) { a.box(x - 60, YF + 30, Z0 + 470, x + 60, YF + 60, Z0 + 540); }
    collar(a, cx, YB - 235, Z1, Z1 + 280, 170); a.line(X0, YB - 80, X1, YB - 80, 'EQUIP-HIDDEN');
    a.log('Added the canopy skirt, grease filters with baffles, lights, transition and duct collar (plan and 3D).');
  }],
  [/Type II condensate hood/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a;
    a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 40); a.box(X0 + 30, YF + 30, Z0 + 40, X1 - 30, YB, Z1 - 30); a.prism([[X0 + 150, YB - 250], [X1 - 150, YB - 250], [X1 - 250, YB - 60], [X0 + 250, YB - 60]], Z1 - 30, Z1);
    collar(a, cx, YB - 155, Z1, Z1 + 200, 120); a.rect(X0 + 100, YF + 100, X1 - 100, YB - 100, 'EQUIP-DETAIL');
    a.log('Added the flat condensate canopy, lip and duct collar (plan and 3D).');
  }],
  [/planetary mixer/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a;
    a.outline(); a.box(X0, YB - 260, Z0, X1, YB, Z1 - 200); a.box(X0 + 20, YB - 240, Z1 - 200, X1 - 20, YB, Z1 - 20);   // column + head
    a.box(X0, YF + 80, Z0, X1, YB - 260, Z0 + 140);   // base
    a.cone(cx, cy + 60, Z0 + 260, Z0 + 700, 150, 230, 20); a.circ(cx, cy + 60, 230);   // bowl
    a.cone(cx, cy + 60, Z0 + 330, Z1 - 180, 14, 14, 8); a.cone(cx, cy + 60, Z1 - 200, Z1 - 180, 70, 30, 14);
    a.xcyl(X0 - 0, X0 + 40, cy + 170, Z0 + 800, 30, 10); a.box(X0 + 8, cy + 120, Z0 + 520, X0 + 40, cy + 200, Z0 + 560);
    a.log('Added the base, column, head with hub, bowl, agitator and bowl lift (plan and 3D).');
  }],
  [/meat slicer/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a;
    a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 120); a.box(X0 + 20, YB - 280, Z0 + 120, X1 - 20, YB, Z0 + 420);
    a.cone(X1 - 220, a.cy, Z0 + 200, Z0 + 215, 160, 160, 28); a.ycyl(a.cy - 8, a.cy + 8, X1 - 220, Z0 + 330, 150, 28); a.circ(X1 - 220, a.cy, 150, 'EQUIP-DETAIL');
    a.box(X0 + 30, YF + 40, Z0 + 120, X0 + 330, YB - 280, Z0 + 150); a.box(X0 + 30, YF + 40, Z0 + 150, X0 + 330, YF + 60, Z0 + 330);
    a.box(X0, YB - 100, Z0 + 420, X1, YB, Z0 + 520); a.log('Added the base, round blade, gauge plate, carriage with food stop and the motor housing (plan and 3D).');
  }],
  [/heated holding cabinet/i, (a) => { cab(a, { doors: 1, swing: true, toe: 100, pull: 'vbar', panel: { z0: a.Z1 - 300, z1: a.Z1 - 140, keys: 2 } }); a.log('Added the full-height door with swing, handle and control panel (plan and 3D).'); }],
  [/heat lamp strip/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cy } = a; a.outline(); a.box(X0, YF, Z0 + 60, X1, YB, Z1); a.box(X0 + 30, YF + 10, Z0 + 20, X1 - 30, YB - 10, Z0 + 60);
    for (let i = 0; i < 4; i++) { const x = X0 + a.W * (i + 0.5) / 4; a.ell(x, cy, Z0 + 6, 38, 38, 38, 12, 6); a.circ(x, cy, 38, 'EQUIP-DETAIL'); }
    for (const x of [X0 + 120, X1 - 120]) a.cyl(x, cy, Z1, Z1 + 700, 7, 6);
    a.log('Added the reflector housing, four lamps and two hanger rods (plan and 3D).');
  }],
  [/espresso machine/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); a.box(X0, YF + 40, Z0 + 30, X1, YB, Z1 - 50); a.box(X0 + 10, YF + 40, Z1 - 50, X1 - 10, YB, Z1);
    for (const f of [0.28, 0.72]) { const x = X0 + W * f; a.ycyl(YF + 10, YF + 70, x, Z1 - 150, 30, 14); a.box(x - 25, YF - 60, Z1 - 175, x + 25, YF + 12, Z1 - 150); a.ycyl(YF - 160, YF - 60, x, Z1 - 165, 14, 8); a.circ(x, YF - 35, 30, 'EQUIP-DETAIL'); }
    for (const x of [X0 + 40, X1 - 40]) { a.tube([[x, YF + 80, Z1 - 100], [x, YF + 20, Z1 - 200], [x, YF - 40, Z1 - 330]], [8, 8, 6], 8); }
    a.box(X0 + 30, YF - 30, Z0, X1 - 30, YF + 40, Z0 + 30); a.rect(X0 + 30, YF - 30, X1 - 30, YF + 40, 'EQUIP-DETAIL'); a.log('Added the boiler body, two group heads with portafilters, steam wands and the cup tray (plan and 3D).');
  }],
  [/draft beer tower/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0 + 10, YF, Z0, X1 - 10, YB, Z0 + 20);
    a.box(X0 + 60, YB - 130, Z0 + 20, X1 - 60, YB, Z1 - 30); a.ell(cx, YB - 65, Z1 - 30, (X1 - X0) / 2 - 60, 65, 40, 14, 6);
    for (let i = 0; i < 4; i++) { const x = X0 + 90 + (i * (X1 - X0 - 180)) / 3; a.ycyl(YB - 280, YB - 100, x, Z1 - 100, 12, 8); a.box(x - 8, YB - 290, Z1 - 250, x + 8, YB - 270, Z1 - 100); a.circ(x, YB - 190, 12, 'EQUIP-DETAIL'); }
    a.log('Added the base plate, the column and four tap shanks with handles (plan and 3D).');
  }],
  [/soda fountain dispenser/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YB - 340, Z0, X1, YB, Z1); a.box(X0 + 20, YF, Z0, X1 - 20, YB - 340, Z0 + 20);
    for (let i = 0; i < 8; i++) { const x = X0 + W * (i + 0.5) / 8; a.ycyl(YB - 440, YB - 340, x, Z0 + 600, 14, 8); a.circ(x, YB - 390, 14, 'EQUIP-DETAIL'); }
    a.box(X0 + 20, YB - 340, Z0 + 640, X1 - 20, YB - 320, Z1 - 40); a.log('Added the dispense head with eight nozzles, the drip tray and the back housing (plan and 3D).');
  }],
  [/modular ice machine/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, H } = a, bz = Z0 + H * 0.55; cab(a, { legs: 150, doors: 0 });
    a.box(a.X0 + 0, a.YF, a.Z0 + 150, a.X1, a.YB, bz); a.frame(a.X0 + 60, a.Z0 + 260, a.X1 - 60, bz - 60, a.YF - 20, a.YF + 5, 30); a.box(a.X0 + 70, a.YF - 15, a.Z0 + 280, a.X1 - 70, a.YF + 3, bz - 90);
    a.box(a.X0, a.YF, bz, a.X1, a.YB, Z1); for (let z = bz + 120; z < Z1 - 120; z += 40) a.box(a.X0 + 80, a.YF - 6, z, a.X1 - 80, a.YF, z + 14);
    a.log('Added the bin with the scoop door, the ice maker head with louvers and the legs (plan and 3D).');
  }],
  [/hot food serving counter/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, zt = Z0 + 900;
    cab(a, { toe: 110, doors: 4, pull: 'recess', topT: 0, hidden: false });
    a.box(a.X0, YF, zt, a.X1, YB, zt + 40);
    for (let i = 0; i < 4; i++) { const x0 = X0 + 60 + (i * (W - 120)) / 4, x1 = x0 + (W - 120) / 4 - 24; a.box(x0, YB - 640, zt + 40, x1, YB - 120, zt + 50); a.rect(x0, YB - 640, x1, YB - 120, 'EQUIP-DETAIL'); }
    a.box(X0, YF, zt + 40, X1, YF + 160, zt + 60);   // tray slide
    for (const x of [X0 + 40, X1 - 40]) a.cyl(x, YB - 60, zt + 40, Z1, 8, 8);
    a.box(X0 + 20, YB - 80, Z1 - 20, X1 - 20, YB - 60, Z1); a.box(X0 + 30, YB - 70, zt + 480, X1 - 30, YB - 66, Z1 - 20);   // sneeze guard glass
    a.log('Added the cabinet doors, four hot wells, the tray slide and the sneeze guard (plan and 3D).');
  }],
];

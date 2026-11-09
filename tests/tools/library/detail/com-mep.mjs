/* SPDX-License-Identifier: Apache-2.0 */
/** Commercial plumbing (plumbing-3.csv), electrical (electrical-3.csv), mechanical (mechanical-3.csv) and appliance (appliances-3.csv) detail. */
import { cab, tbl, pull, T, GAP, leaves } from './com-core.mjs';

const C = (o, log) => (a) => { cab(a, o); a.log(log); };
export function flange(a, cx, cy, z, r, t = 14) { a.cyl(cx, cy, z, z + t, r, 18); a.circ(cx, cy, r, 'EQUIP-DETAIL'); }
export function collar(a, cx, cy, z0, z1, r) { a.cyl(cx, cy, z0, z1, r, 16); a.circ(cx, cy, r, 'EQUIP-DETAIL'); }
export function louvers(a, x0, x1, y, z0, z1, step = 38) { for (let z = z0; z < z1 - 10; z += step) a.box(x0, y - 8, z, x1, y, z + 10); a.rect(x0, y - 8, x1, y, 'EQUIP-DETAIL'); }
function panelFront(a, o = {}) { cab(a, { toe: o.toe ?? 0, doors: o.doors ?? 1, swing: o.swing ?? true, pull: o.pull ?? 'vbar', lock: o.lock, louver: o.louver, hidden: o.hidden, legs: o.legs, ...o.extra }); }
export function bowl(a, cx, cy, rx, ry, z0, z1) { a.ell(cx, cy, z1 - (z1 - z0) * 0.3, rx, ry, (z1 - z0) * 0.7, 18, 6); a.ellp(cx, cy, rx, ry); a.ellp(cx, cy, rx * 0.8, ry * 0.8, 'EQUIP-DETAIL'); }
export function tank(a, cx, cy, z0, z1, r, domes = true) { a.cyl(cx, cy, z0, z1, r, 24); if (domes) { a.ell(cx, cy, z1, r, r, r * 0.35, 20, 5); a.ell(cx, cy, z0, r, r, r * 0.25, 20, 5); } a.circ(cx, cy, r); }
export function pumpSet(a, x, y, z, len = 360) { a.box(x - len / 2, y - 120, z, x + len / 2, y + 120, z + 40); a.xcyl(x - len / 2 + 60, x, y, z + 200, 110, 16); a.ell(x + 100, y, z + 210, 150, 140, 150, 16, 8); a.xcyl(x - len / 2, x - len / 2 + 60, y, z + 200, 60, 12); a.circ(x + 100, y, 140, 'EQUIP-DETAIL'); a.rect(x - len / 2, y - 120, x + len / 2, y + 120, 'EQUIP-DETAIL'); }

export const PLUMB = [
  [/ADA water closet, floor/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0 + 20, YB - 340, Z0 + 380, X1 - 20, YB, Z1 - 80); a.box(X0 + 25, YB - 330, Z1 - 80, X1 - 25, YB, Z1);   // tank/flushometer housing
    a.box(X0 + 70, YB - 320, Z0, X1 - 70, YB - 120, Z0 + 380); a.ell(cx, YF + 300, Z0 + 270, (X1 - X0) / 2 - 20, 270, 120, 18, 8);
    a.ell(cx, YF + 300, Z0 + 440, (X1 - X0) / 2 - 8, 290, 25, 18, 4); a.cone(cx, YB - 210, Z0, Z0 + 20, 140, 90, 14);
    a.ellp(cx, YF + 300, (X1 - X0) / 2, 290); a.ellp(cx, YF + 300, (X1 - X0) / 2 - 70, 215, 'EQUIP-DETAIL'); a.rect(X0 + 20, YB - 340, X1 - 20, YB, 'EQUIP-DETAIL'); a.circ(cx, YB - 210, 90, 'EQUIP-HIDDEN');
    a.clear('ADA clear floor space', X0 - 400, YF - 700, X1 + 400, YB, 20);
    a.log('Added the bowl at a 17 in seat height, the seat ring, the rear housing and the floor flange (plan and 3D).');
  }],
  [/wall-hung water closet/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.ell(cx, YF + 250, Z0 + 110, (X1 - X0) / 2 - 10, 240, 110, 18, 8); a.box(X0 + 40, YB - 250, Z0, X1 - 40, YB, Z1 + 0);
    a.box(X0 + 10, YB - 240, Z0 - 100, X1 - 10, YB, Z0); a.ell(cx, YF + 250, Z0 + 180, (X1 - X0) / 2, 250, 20, 18, 4); a.ellp(cx, YF + 250, (X1 - X0) / 2, 250); a.ellp(cx, YF + 250, (X1 - X0) / 2 - 55, 190, 'EQUIP-DETAIL');
    a.rect(X0 + 40, YB - 250, X1 - 40, YB, 'EQUIP-HIDDEN'); a.cyl(cx + 60, YB - 40, Z1 - 10, Z1 + 30, 22, 10);
    a.log('Added the cantilevered bowl, the seat ring, the concealed carrier and the flush button plate (plan and 3D).');
  }],
  [/wall-hung urinal/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.ell(cx, YB - 180, Z0 + 200, (X1 - X0) / 2, 190, 260, 16, 8); a.box(X0 + 30, YB - 60, Z0 + 180, X1 - 30, YB, Z1);
    a.cyl(cx, YB - 60, Z1 - 10, Z1 + 60, 20, 10); a.box(X0 + 90, YB - 40, Z0 - 20, X1 - 90, YB, Z0 + 30); a.ellp(cx, YB - 180, (X1 - X0) / 2 - 20, 150, 'EQUIP-DETAIL');
    a.log('Added the flared bowl, the back plate, the flush valve and the outlet (plan and 3D).');
  }],
  [/trough urinal/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YB - 50, Z0, X1, YB, Z0 + 900); a.box(X0, YF, Z0, X1, YB - 50, Z0 + 100); a.box(X0, YF, Z0 + 100, X1, YF + 50, Z0 + 600); a.box(X0, YB - 100, Z0 + 100, X1, YB - 50, Z0 + 600);
    a.rect(X0 + 50, YF + 50, X1 - 50, YB - 100, 'EQUIP-DETAIL'); a.xcyl(X0 + 40, X1 - 40, YB - 40, Z0 + 850, 12, 10); for (let i = 0; i < 6; i++) a.circ(X0 + 80 + (i * (W - 160)) / 5, YB - 120, 5, 'EQUIP-DETAIL');
    a.log('Added the trough basin with its lip, the back wall and the spreader pipe (plan and 3D).');
  }],
  [/handwash trough/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, zt = Z0 + 850; a.outline();
    const pts = []; for (let i = 0; i <= 20; i++) { const t = Math.PI * (i / 20); pts.push([cx + Math.cos(t) * W / 2, YB - Math.sin(t) * (a.D - 20)]); }
    a.prism([...pts, [X1, YB], [X0, YB]].filter((p, i, ar) => i < ar.length - 2 || true), zt - 120, zt); a.poly([...pts]);
    a.cone(cx, cy, Z0, zt - 120, 120, 180, 14); a.cyl(cx, cy, Z0, Z0 + 20, 260, 18);
    for (const f of [0.2, 0.5, 0.8]) { const x = X0 + W * f, y = YB - (a.D - 20) * Math.sin(Math.acos((x - cx) / (W / 2))) + 80; a.tube([[x, y + 60, zt], [x, y + 60, zt + 180], [x, y, zt + 200]], [12, 12, 10], 8); a.circ(x, y + 60, 12, 'EQUIP-DETAIL'); }
    a.log('Added the semicircular trough on a central column with three sensor spouts (plan and 3D).');
  }],
  [/ADA lavatory, wall-hung/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 200, Z0, X1, YB, Z1 + 0); a.box(X0, YF, Z0 + 20, X1, YB - 200, Z0 + 150); a.ell(cx, YF + 250, Z0 + 150, (X1 - X0) / 2 - 40, 190, 70, 16, 5);
    a.rect(X0 + 40, YF + 60, X1 - 40, YB - 60, 'EQUIP-DETAIL'); a.circ(cx, a.cy, 25, 'EQUIP-DETAIL'); a.tube([[cx, YB - 40, Z0 + 150], [cx, YB - 40, Z0 + 330], [cx, YB - 200, Z0 + 340]], [12, 12, 10], 8); a.box(cx - 140, YF + 400, Z0 + 330, cx - 40, YF + 440, Z0 + 350);
    a.box(X0 + 20, YB - 110, Z0 - 560, X1 - 20, YB - 60, Z0); a.log('Added the wall-hung basin, the faucet with wrist blades and the insulation shield over the trap (plan and 3D).');
  }],
  [/countertop lavatory, undermount/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0 - 0, YF, Z1 - 20, X1, YB, Z1); a.ell(cx, cy, Z1 - 100, (X1 - X0) / 2 - 20, (a.D) / 2 - 20, 100, 18, 6);
    a.circ(cx, cy, 25, 'EQUIP-DETAIL'); a.ellp(cx, cy, (X1 - X0) / 2 - 10, a.D / 2 - 10); a.tube([[cx, YB - 25, Z1], [cx, YB - 25, Z1 + 260], [cx, YB - 150, Z1 + 280]], [12, 12, 10], 8); a.log('Added the undermount basin, the deck and the deck-mounted gooseneck faucet (plan and 3D).');
  }],
  [/bi-level drinking fountain/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 120, Z0, X1, YB, Z1); a.box(X0 + 15, YF + 120, Z0 + 20, X1 - 15, YB - 120, Z0 + 90);
    a.ell(cx, YF + 250, Z0 + 140, (X1 - X0) / 2 - 20, 130, 60, 16, 5); a.ell(cx, YF + 250, Z0 + 330, (X1 - X0) / 2 - 20, 130, 60, 16, 5);
    a.box(X0 + 15, YF + 130, Z0 + 100, X1 - 15, YB - 120, Z0 + 150); a.cyl(cx, YB - 100, Z0 + 150, Z0 + 330, 20, 8);
    a.circ(cx, YF + 250, 130, 'EQUIP-DETAIL'); a.log('Added the two basins at accessible and standing heights, the bubblers and the back housing (plan and 3D).');
  }],
  [/bottle filling station/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 200, Z0, X1, YB, Z1); a.box(X0 + 20, YB - 220, Z0 + 60, X1 - 20, YB - 200, Z1 - 60); a.box(X0 + 70, YF + 80, Z0 + 100, X1 - 70, YB - 200, Z0 + 150);
    a.ycyl(YB - 250, YB - 200, cx, Z0 + 200, 20, 10); a.ycyl(YB - 280, YB - 250, cx, Z0 + 200, 10, 8); a.rect(X0 + 70, YF + 80, X1 - 70, YB - 200, 'EQUIP-DETAIL'); a.box(X0 + 60, YB - 225, Z1 - 160, X1 - 60, YB - 220, Z1 - 80);
    a.log('Added the housing, the sensor bezel, the arched spout and the basin (plan and 3D).');
  }],
  [/floor mop sink/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 60); for (const [x0, y0, x1, y1] of [[X0, YF, X1, YF + 60], [X0, YB - 60, X1, YB], [X0, YF, X0 + 60, YB], [X1 - 60, YF, X1, YB]]) a.box(x0, y0, Z0 + 60, x1, y1, Z1);
    a.rect(X0 + 60, YF + 60, X1 - 60, YB - 60, 'EQUIP-DETAIL'); a.circ(cx, cy, 45, 'EQUIP-DETAIL'); a.box(X0 + 6, YB - 40, Z1, X1 - 6, YB, Z1 + 400); a.tube([[cx, YB - 40, Z1 + 400], [cx, YB - 40, Z1 + 650], [cx, YB - 170, Z1 + 680]], [16, 16, 12], 8);
    a.box(X0, YB - 20, Z1 + 800, X1, YB, Z1 + 860); a.log('Added the floor basin with its shield rim, the drain, the wall faucet with a hose hook and the mop hanger (plan and 3D).');
  }],
  [/emergency shower and eyewash/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.cyl(cx + 400, YB - 60, Z0, Z1, 30, 12); a.cyl(cx + 400, YB - 60, Z0, Z0 + 20, 120, 12); a.xcyl(cx + 400, cx + 400, YB - 60, Z1, 1, 3);
    a.tube([[cx + 400, YB - 60, Z1 - 30], [cx, YB - 60, Z1 - 30], [cx, cy + 0, Z1 - 30]], [28, 28, 28], 10); a.cone(cx, cy, Z1 - 80, Z1 - 30, 150, 60, 18); a.circ(cx, cy, 150, 'EQUIP-DETAIL');
    a.tube([[cx + 400, YB - 60, Z1 - 160], [cx + 400, YF + 350, Z1 - 400], [cx + 400, YF + 100, Z1 - 400]], [6, 6, 6], 6); a.box(cx + 340, YF + 60, Z1 - 440, cx + 460, YF + 140, Z1 - 380);
    a.cyl(cx - 250, YB - 60, Z0, Z0 + 900, 28, 10); a.cone(cx - 250, YB - 60, Z0 + 900, Z0 + 960, 28, 60, 10); a.ell(cx - 250, YF + 200, Z0 + 1000, 130, 130, 40, 14, 5); a.circ(cx - 250, YF + 200, 130);
    a.cyl(cx - 250, YF + 200, Z0 + 900, Z0 + 1000, 20, 8); a.log('Added the post with a base plate, the overhead shower head with a pull handle and the eyewash bowl on its pedestal (plan and 3D).');
  }],
  [/eyewash station, wall/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 40, Z0 - 100, X1, YB, Z1 + 150); a.ell(cx, YF + 170, Z0 + 20, (X1 - X0) / 2 - 10, 140, 50, 16, 5);
    for (const x of [cx - 80, cx + 80]) a.tube([[x, YB - 40, Z0 + 100], [x, YF + 150, Z0 + 120], [x, YF + 120, Z0 + 140]], [10, 10, 8], 8); a.box(cx - 20, YF + 20, Z0 + 60, cx + 20, YB - 40, Z0 + 80); a.circ(cx, YF + 170, 140, 'EQUIP-DETAIL');
    a.log('Added the wall bracket, the bowl, twin spray heads and the push paddle (plan and 3D).');
  }],
  [/floor drain, 6 in/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.circ(cx, cy, (X1 - X0) / 2); a.cyl(cx, cy, Z0, Z1 + 0.02 + 0, (X1 - X0) / 2, 22); for (let i = 1; i < 4; i++) a.line(cx - (X1 - X0) * 0.4, cy - (X1 - X0) * (0.12 * (i - 2) * -1), cx + (X1 - X0) * 0.4, cy - (X1 - X0) * (0.12 * (i - 2) * -1), 'EQUIP-DETAIL'); a.circ(cx, cy, (X1 - X0) * 0.38, 'EQUIP-DETAIL'); a.log('Added the round grate with its slots and the drain body (plan and 3D).'); }],
  [/trench drain/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YF + 25, Z1); a.box(X0, YB - 25, Z0, X1, YB, Z1); a.box(X0, YF + 25, Z0, X1, YB - 25, Z0 + 10);
    for (let x = X0 + 30; x < X1 - 60; x += 60) { a.box(x, YF + 25, Z1 - 10, x + 30, YB - 25, Z1); a.rect(x, YF + 25, x + 30, YB - 25, 'EQUIP-DETAIL'); } a.log('Added the channel walls, the sloped floor and the slotted grate (plan and 3D).');
  }],
  [/roll-in shower/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 15);
    a.box(X0, YB - 40, Z0 + 15, X1, YB, Z1); a.box(X0, YF + 40, Z0 + 15, X0 + 40, YB - 40, Z1); a.box(X1 - 40, YF + 40, Z0 + 15, X1, YB - 40, Z1);
    a.box(X1 - 440, YF + 80, Z0 + 450, X1 - 40, YB - 120, Z0 + 480); a.box(X1 - 440, YB - 120, Z0 + 480, X1 - 40, YB - 100, Z0 + 520);   // fold-down seat
    a.xcyl(X0 + 40, X1 - 40, YB - 60, Z0 + 840, 18, 10); a.ycyl(YB - 200, YB - 60, X1 - 60, Z0 + 840, 18, 10);
    a.tube([[X0 + 300, YB - 40, Z0 + 1100], [X0 + 300, YB - 40, Z1 - 100], [X0 + 400, YB - 120, Z1 - 60]], [14, 14, 40], 10); a.box(X0 + 120, YF + 30, Z0 + 17, X1 - 120, YF + 40, Z0 + 25);
    a.line(X0 + 40, YF + 35, X1 - 40, YF + 35, 'EQUIP-DETAIL'); a.rect(X1 - 440, YF + 80, X1 - 40, YB - 100, 'EQUIP-DETAIL'); a.circ(cx - 200, a.cy, 40, 'EQUIP-DETAIL');
    a.log('Added the pan with the curbless entry, three walls, the fold-down seat, grab bars and the hand shower (plan and 3D).');
  }],
  [/transfer shower/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 75); a.box(X0, YB - 40, Z0 + 75, X1, YB, Z1); a.box(X0, YF + 40, Z0 + 75, X0 + 40, YB - 40, Z1); a.box(X1 - 40, YF + 40, Z0 + 75, X1, YB - 40, Z1);
    a.box(X0 + 40, YB - 380, Z0 + 450, X1 - 40, YB - 40, Z0 + 480); a.xcyl(X0 + 40, X1 - 40, YB - 60, Z0 + 840, 18, 10); a.ycyl(YB - 420, YB - 60, X1 - 60, Z0 + 840, 18, 10);
    a.tube([[X1 - 150, YB - 40, Z0 + 1100], [X1 - 150, YB - 40, Z1 - 100], [X1 - 250, YB - 130, Z1 - 60]], [14, 14, 40], 10); a.rect(X0 + 40, YB - 380, X1 - 40, YB - 40, 'EQUIP-DETAIL'); a.box(X0 + 40, YF, Z0 + 75, X1 - 40, YF + 30, Z0 + 100);
    a.log('Added the shower pan with its 1/2 in threshold, three walls, the seat, grab bars and the shower valve (plan and 3D).');
  }],
  [/baby changing station/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 25, Z0, X1, YB, Z1); a.box(X0 + 20, YF, Z0 + 20, X1 - 20, YB - 25, Z0 + 80); a.ell(cx, a.cy, Z0 + 80, (X1 - X0) / 2 - 40, (a.D - 120) / 2, 25, 16, 5);
    a.tube([[X0 + 60, YF + 20, Z0 + 80], [X0 + 60, YF + 20, Z1 - 100]], [8, 8], 6); a.tube([[X1 - 60, YF + 20, Z0 + 80], [X1 - 60, YF + 20, Z1 - 100]], [8, 8], 6);   // restraint straps
    a.rect(X0 + 20, YF, X1 - 20, YB - 25, 'EQUIP-DETAIL'); a.log('Added the wall housing, the lowered changing bed with its rail and the safety strap (plan and 3D).');
  }],
  [/laboratory sink, epoxy/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z1 - 30, X1, YB, Z1); a.box(X0 + 30, YF + 30, Z0, X1 - 30, YB - 30, Z1 - 30); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-DETAIL'); a.circ(cx, cy, 25, 'EQUIP-DETAIL');
    a.tube([[cx, YB - 25, Z1], [cx, YB - 25, Z1 + 400], [cx, YB - 40, Z1 + 500], [cx, YF + 60, Z1 + 520]], [14, 14, 12, 10], 8); a.log('Added the epoxy deck with a recessed sink, the drain and the gooseneck faucet (plan and 3D).');
  }],
  [/freeze-proof wall hydrant/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0 - 0, YB - 25, Z0 - 30, X1, YB, Z1 + 30); a.ycyl(YF + 60, YB - 25, cx, Z0 + 60, 18, 10); a.cone(cx, cy, Z1 - 10, Z1 + 30, 14, 14, 8);
    a.ycyl(YF, YF + 60, cx, Z0 + 60, 22, 10); a.circ(cx, YF + 30, 22, 'EQUIP-DETAIL'); a.xcyl(cx - 60, cx + 60, YB - 70, Z0 + 150, 8, 8);
    a.log('Added the wall flange, the extended body, the hose spout with its vacuum breaker and the T-handle (plan and 3D).');
  }],
  [/water hammer arrestor/i, (a) => { const { cx, cy, Z0, Z1, X0, X1 } = a; a.outline(); a.circ(cx, cy, (X1 - X0) / 2); a.cyl(cx, cy, Z0 + 20, Z1, (X1 - X0) / 2, 16); a.cone(cx, cy, Z0, Z0 + 20, 18, 18, 10); a.log('Added the cylinder body and the threaded inlet (plan and 3D).'); }],
  [/commercial water heater, 100 gal/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.outline();
    a.cyl(cx, cy, Z0 + 150, Z1 - 100, r - 10, 28); a.ell(cx, cy, Z1 - 100, r - 10, r - 10, 80, 24, 5); a.cyl(cx, cy, Z0, Z0 + 150, r - 80, 20);
    a.cyl(cx + r * 0.3, cy, Z1 - 20, Z1 + 400, 110, 16); a.cyl(cx - r * 0.5, cy, Z1 - 100, Z1 + 160, 25, 10); a.cyl(cx - r * 0.2, cy, Z1 - 100, Z1 + 160, 25, 10); a.circ(cx + r * 0.3, cy, 110, 'EQUIP-DETAIL');
    a.box(cx - 150, YF - 0, Z0 + 250, cx + 150, YF + 8, Z0 + 600); a.box(cx - 100, YF + 8 - 0, Z0 + 700, cx + 100, YF + 8, Z0 + 900); a.cyl(cx + r - 40, cy + 100, Z0 + 300, Z0 + 420, 30, 8); a.log('Added the insulated tank with domed top, the flue, the water connections, the burner access door and the relief valve (plan and 3D).');
  }],
  [/commercial tankless/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 100, Z0, X1, YB, Z1); a.box(X0 + 10, YF, Z0 + 20, X1 - 10, YB - 100, Z1 - 20); a.box(X0 + 30, YF - 6, Z1 - 220, X1 - 30, YF, Z1 - 40);
    for (const x of [cx - 90, cx - 30, cx + 30, cx + 90]) a.cyl(x, YB - 60, Z0 - 120, Z0 + 20, 16, 8); a.cyl(X1 - 50, YB - 120, Z1 - 20, Z1 + 160, 40, 12); a.circ(X1 - 50, YB - 120, 40, 'EQUIP-DETAIL');
    louvers(a, X0 + 30, X1 - 30, YF + 0, Z0 + 80, Z1 - 260, 36); a.log('Added the wall casing, the control display, the front louvers, the bottom connections and the vent (plan and 3D).');
  }],
  [/booster pump set/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 80); pumpSet(a, cx - 180, YF + 250, Z0 + 80, 440); pumpSet(a, cx - 180, YB - 250, Z0 + 80, 440);
    a.xcyl(cx - 400, cx + 340, YB - 100, Z0 + 650, 50, 12); a.xcyl(cx - 400, cx + 340, YF + 100, Z0 + 650, 50, 12); a.cyl(X1 - 200, cy, Z0 + 80, Z1 - 100, 200, 24); a.ell(X1 - 200, cy, Z1 - 100, 200, 200, 80, 20, 5);
    a.box(X0 + 60, YF + 20, Z0 + 700, X0 + 360, YF + 60, Z0 + 1000); a.log('Added the skid, two pump and motor sets, the manifolds, the diaphragm tank and the control box (plan and 3D).');
  }],
  [/backflow preventer/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline(); a.xcyl(X0, X1, cy, Z0 + 120, 38, 14);
    for (const f of [0.18, 0.5, 0.82]) a.ell(X0 + W * f, cy, Z0 + 140, 55, 55, 55, 12, 6);
    a.xcyl(X0 + W * 0.22, X0 + W * 0.78, cy, Z0 + 200, 70, 20); a.ell(X0 + W * 0.5, cy, Z0 + 215, 95, 75, 80, 16, 8);
    for (const f of [0.05, 0.95]) { a.cyl(X0 + W * f, cy, Z0 + 120, Z0 + 330, 8, 6); a.xcyl(X0 + W * f - 40, X0 + W * f + 40, cy, Z0 + 330, 8, 6); }
    for (const f of [0.3, 0.4, 0.6, 0.7]) a.ycyl(cy, cy + 80, X0 + W * f, Z0 + 150, 8, 6);
    a.circ(X0 + W * 0.5, cy, 80, 'EQUIP-DETAIL'); a.log('Added the through pipe, the two shutoff valves, the relief valve body and the test cocks (plan and 3D).');
  }],
  [/duplex sump pump pit/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 20); for (const [x0, y0, x1, y1] of [[X0, YF, X1, YF + 20], [X0, YB - 20, X1, YB], [X0, YF + 20, X0 + 20, YB - 20], [X1 - 20, YF + 20, X1, YB - 20]]) a.box(x0, y0, Z0 + 20, x1, y1, Z1 - 20);
    a.box(X0 - 0, YF, Z1 - 20, X1, YB, Z1); a.rect(X0 + 80, YF + 80, X1 - 80, YB - 80, 'EQUIP-HIDDEN'); for (const x of [cx - 220, cx + 220]) { a.cyl(x, cy, Z1, Z1 + 1, 120, 6); a.circ(x, cy, 110, 'EQUIP-DETAIL'); a.cyl(x, cy, Z1 - 20, Z1 + 0.5, 110, 16); }
    a.log('Added the pit walls and floor, the hatch cover with two pump covers and the hidden basin outline (plan and 3D).');
  }],
  [/grease interceptor, in-floor/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z1 - 30); a.box(X0 - 0, YF, Z1 - 30, X1, YB, Z1); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-DETAIL');
    for (const x of [X0 + 120, X1 - 120]) for (const y of [YF + 120, YB - 120]) { a.cyl(x, y, Z1, Z1 + 6, 16, 8); a.circ(x, y, 16, 'EQUIP-DETAIL'); }
    a.box(cx - 40, YF + 40, Z0 + 150, cx + 40, YB - 40, Z1 - 60); a.line(cx, YF + 40, cx, YB - 40, 'EQUIP-HIDDEN'); a.log('Added the steel tank, the bolted cover with its bolts and the internal baffle (plan and 3D).');
  }],
  [/pressure reducing valve station/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline(); a.xcyl(X0, X1, cy + 90, Z0 + 230, 40, 14); a.xcyl(X0 + 100, X1 - 100, cy - 90, Z0 + 230, 40, 14); a.ycyl(cy - 90, cy + 90, X0 + 100, Z0 + 230, 36, 12); a.ycyl(cy - 90, cy + 90, X1 - 100, Z0 + 230, 36, 12);
    a.ell(cx, cy + 90, Z0 + 270, 110, 80, 110, 16, 8); a.cyl(cx, cy + 90, Z0 + 350, Z0 + 440, 40, 14);
    for (const x of [X0 + 150, X1 - 150]) { a.cyl(x, cy + 90, Z0 + 270, Z0 + 340, 6, 6); a.ell(x, cy + 90, Z0 + 370, 45, 14, 45, 12, 6); }
    for (const x of [X0 + 220, X1 - 220]) a.ell(x, cy + 90, Z0 + 250, 60, 45, 60, 12, 6);
    a.log('Added the main line with the reducing valve, the gauges, the isolation valves and the bypass (plan and 3D).');
  }],
  [/water softener, commercial/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline(); for (const x of [X0 + W * 0.28, X0 + W * 0.72]) { tank(a, x, YB - 280, Z0 + 20, Z1 - 120, 220); a.box(x - 100, YB - 280 - 100, Z1 - 120, x + 100, YB - 280 + 100, Z1 - 20); a.ycyl(YB - 280, YF + 100, x, Z1 - 70, 12, 8); }
    a.box(cx - 120, YF + 80, Z0, cx + 120, YF + 400, Z0 + 700); a.rect(cx - 120, YF + 80, cx + 120, YF + 400); a.box(cx - 60, YF + 60, Z0 + 550, cx + 60, YF + 80, Z0 + 640);
    a.log('Added the twin resin tanks with control heads, the brine tank and the cross-over pipes (plan and 3D).');
  }],
  [/reverse osmosis system/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 40); a.box(X0 + 20, YB - 40, Z0 + 40, X1 - 20, YB, Z1);
    for (let i = 0; i < 3; i++) { const z = Z0 + 140 + i * 230; a.xcyl(X0 + 120, X1 - 120, YB - 90, z, 60, 18); a.circ(X0 + W * 0.5, YB - 90, 60, 'EQUIP-HIDDEN'); }
    a.cyl(X1 - 120, YF + 120, Z0 + 40, Z0 + 700, 100, 18); a.circ(X1 - 120, YF + 120, 100); a.box(X0 + 80, YF + 40, Z0 + 40, X0 + 380, YF + 160, Z0 + 340); a.ell(X0 + 230, YF + 100, Z0 + 390, 90, 60, 50, 12, 6);
    a.log('Added the skid, three membrane housings, the booster pump, the permeate tank and the control board (plan and 3D).');
  }],
  [/thermal expansion tank/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.outline(); tank(a, cx, cy, Z0 + 60, Z1 - 20, r - 6); for (const [x, y] of [[cx - r * 0.7, cy], [cx + r * 0.7, cy], [cx, cy - r * 0.7], [cx, cy + r * 0.7]]) a.cyl(x, y, Z0, Z0 + 60, 10, 6); a.cyl(cx, cy, Z1 - 20, Z1 + 20, 18, 8); a.log('Added the tank shell with domed ends, the four stand legs and the system connection (plan and 3D).'); }],
];

// -------------------------------------------------------------------------------------------------------------------------------------------------
export const ELEC = [
  [/linear pendant light, 8 ft/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 40); a.box(X0 + 10, YF + 10, Z0 - 0, X1 - 10, YB - 10, Z0 + 10); a.rect(X0 + 15, YF + 15, X1 - 15, YB - 15, 'EQUIP-DETAIL');
    a.box(X0 + 6, YF + 6, Z0 + 40, X1 - 6, YB - 6, Z1); for (const x of [X0 + 300, X1 - 300]) a.tube([[x, cy, Z1], [x, cy, Z1 + 1100]], [3, 3], 6);
    a.log('Added the housing, the frosted lens and two suspension cables (plan and 3D).');
  }],
  [/recessed linear light, 4 ft/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0 - 0, YF, Z1 - 15, X1, YB, Z1); a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z1 - 15); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL'); a.line(X0 + 40, a.cy, X1 - 40, a.cy, 'EQUIP-DETAIL'); a.log('Added the trim flange, the recessed housing and the lens (plan and 3D).'); }],
  [/wall wash light/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YB - 80, Z0, X1, YB, Z1); a.box(X0 + 6, YF, Z0 + 20, X1 - 6, YB - 80, Z1 - 20); a.prism([[X0 + 10, YF], [X1 - 10, YF], [X1 - 10, YB - 80], [X0 + 10, YB - 80]], Z0, Z0 + 20); a.line(X0 + 20, YF + 40, X1 - 20, YF + 40, 'EQUIP-DETAIL'); a.log('Added the housing, the asymmetric lens and the wall-side reflector (plan and 3D).'); }],
  [/vapor tight light/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0 + 40, X1, YB, Z1); a.box(X0 + 6, YF + 6, Z0, X1 - 6, YB - 6, Z0 + 40); for (let i = 0; i < 6; i++) a.box(X0 + 100 + i * ((X1 - X0 - 200) / 5) - 10, YF - 4, Z0 + 30, X0 + 100 + i * ((X1 - X0 - 200) / 5) + 10, YB + 0, Z0 + 50); a.rect(X0 + 6, YF + 6, X1 - 6, YB - 6, 'EQUIP-DETAIL'); a.log('Added the gasketed body, the clear lens and the latch clips (plan and 3D).'); }],
  [/parking garage light/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0 + 20, X1, YB, Z1); for (let x = X0 + 30; x < X1 - 20; x += 40) a.box(x, YF + 10, Z0, x + 8, YB - 10, Z0 + 20); a.cyl(X1 - 60, cy, Z0 - 20, Z0, 24, 10); a.log('Added the housing, the louver slats and the occupancy sensor (plan and 3D).'); }],
  [/wall pack, exterior/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 90, Z0, X1, YB, Z1); a.prism([[X0 + 10, YB - 90], [X1 - 10, YB - 90], [X1 - 20, YF], [X0 + 20, YF]], Z0 + 20, Z1 - 10); a.box(X0 + 10, YF - 0, Z1 - 10, X1 - 10, YB - 30, Z1 + 0.0 + 0.1); a.cyl(cx, YB - 40, Z1, Z1 + 20, 20, 8); a.log('Added the back box, the sloped housing, the visor and the photocell (plan and 3D).'); }],
  [/pole light head, area/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 120, Z0, X1, YB, Z0 + 150); a.prism([[X0, YB - 120], [X1, YB - 120], [X1 - 20, YF], [X0 + 20, YF]], Z0 + 20, Z1); a.box(X0 + 20, YF + 10, Z0, X1 - 20, YB - 120, Z0 + 20); a.rect(X0 + 20, YF + 10, X1 - 20, YB - 120, 'EQUIP-DETAIL'); a.log('Added the pole arm bracket, the housing and the flat lens (plan and 3D).'); }],
  [/stairwell light/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.circ(cx, a.cy, (X1 - X0) / 2); a.cyl(cx, YB - 15, Z0, Z1, (X1 - X0) / 2 * 0.0 + 1, 3); a.ycyl(YF, YB, cx, (Z0 + Z1) / 2, (X1 - X0) / 2, 22); a.ell(cx, YF + 20, (Z0 + Z1) / 2, (X1 - X0) / 2 - 20, 20, (Z1 - Z0) / 2 - 20, 18, 6); a.circ(cx, a.cy, (X1 - X0) / 2 - 30, 'EQUIP-DETAIL'); a.log('Added the round back plate and the domed diffuser (plan and 3D).'); }],
  [/combination exit and emergency/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0 + 140, YF, Z0, X1 - 140, YB, Z1); a.box(X0 + 150, YF - 4, Z0 + 40, X1 - 150, YF, Z1 - 20); a.line(X0 + 140, YF - 4, X1 - 140, YF - 4, 'EQUIP-DETAIL');
    for (const x of [X0 + 70, X1 - 70]) { a.ell(x, a.cy, Z0 + 90, 55, 55, 55, 12, 6); a.tube([[x, a.cy, Z0 + 50], [x + (x < cx ? 40 : -40), a.cy, Z0 + 20]], [10, 10], 6); a.circ(x, a.cy, 55, 'EQUIP-DETAIL'); }
    a.log('Added the exit sign body, the lit legend and the two adjustable lamp heads (plan and 3D).');
  }],
  [/step light, recessed/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YB - 10, Z0, X1, YB, Z1); a.box(X0 + 10, YF + 10, Z0 + 10, X1 - 10, YB - 10, Z1 - 10); a.frame(X0, Z0, X1, Z1, YF, YB, 10); for (let i = 1; i < 4; i++) a.line(X0 + 10, YF + 10 + i * 10, X1 - 10, YF + 10 + i * 10, 'EQUIP-DETAIL'); a.log('Added the trim plate and the louvered face (plan and 3D).'); }],
  [/display track head/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(cx - 50, cy - 20, Z1 - 20, cx + 50, cy + 20, Z1); a.cyl(cx, cy, Z1 - 60, Z1 - 20, 18, 10); a.add([]); a.cyl(cx, cy, Z1 - 160, Z1 - 60, 14, 8); a.ycyl(cy - 20, cy + 20, cx, Z1 - 160, 22, 10); a.ell(cx, cy - 20, Z0 + 55, 50, 50, 55, 14, 6); a.cone(cx, cy - 20, Z0, Z0 + 40, 56, 44, 14); a.circ(cx, cy, 50, 'EQUIP-DETAIL'); a.log('Added the track adapter, the yoke and the barrel with its aperture (plan and 3D).'); }],
  [/LED panel light, 2 x 4/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.frame(X0, Z0, X1, Z1, YF, YB, 0.01); a.box(X0, YF, Z0 + 30, X1, YB, Z1); a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 30); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL'); a.log('Added the frame and the edge-lit diffuser (plan and 3D).'); }],
  [/wide downlight, 6 in/i, (a) => { const { X0, X1, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.circ(cx, cy, r); a.circ(cx, cy, r * 0.75, 'EQUIP-DETAIL'); a.cone(cx, cy, Z1 - 20, Z1, r, r, 24); a.cone(cx, cy, Z0, Z1 - 20, r * 0.7, r * 0.75, 24); a.cone(cx, cy, Z0 + 20, Z1 - 30, r * 0.6, r * 0.45, 20); a.log('Added the trim ring, the baffle and the housing (plan and 3D).'); }],
  [/decorative pendant cluster/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.circ(cx, cy, (X1 - X0) / 2); a.cyl(cx, cy, Z1 - 20, Z1, 160, 18); a.circ(cx, cy, 160, 'EQUIP-DETAIL');
    [[0, 0, 0], [200, 0, 1], [-200, 40, 2], [60, 220, 3], [-60, -220, 4]].forEach(([dx, dy, i]) => { const drop = 500 + i * 60; a.tube([[cx + dx, cy + dy, Z1 - 20], [cx + dx, cy + dy, Z1 - drop]], [3, 3], 5); a.ell(cx + dx, cy + dy, Z1 - drop - 80, 90, 90, 100, 14, 8); a.circ(cx + dx, cy + dy, 90, 'EQUIP-DETAIL'); });
    a.log('Added the canopy and five drop pendants of staggered length (plan and 3D).');
  }],
  [/in-grade uplight/i, (a) => { const { X0, X1, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.circ(cx, cy, r); a.cyl(cx, cy, Z0, Z1 - 10, r * 0.85, 20); a.cone(cx, cy, Z1 - 12, Z1, r, r, 22); a.circ(cx, cy, r * 0.6, 'EQUIP-DETAIL'); for (let i = 0; i < 4; i++) { const g = (i / 4) * Math.PI * 2 + 0.78; a.cyl(cx + Math.cos(g) * r * 0.72, cy + Math.sin(g) * r * 0.72, Z1 - 4, Z1 + 1, 4, 5); } a.log('Added the flush trim ring, the lens and the buried housing (plan and 3D).'); }],
  [/high mast flood light/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.circ(cx, cy, (X1 - X0) / 2); a.cyl(cx, cy, Z0, Z0 + 20, 45, 16); a.ycyl(cy - 0, cy + 0.2, cx, Z0, 1, 3); for (let i = 0; i < 6; i++) { const g = (i / 6) * Math.PI * 2, x = cx + Math.cos(g) * 280, y = cy + Math.sin(g) * 280; a.tube([[cx, cy, Z0 + 10], [x, y, Z0 + 15]], [20, 20], 6); a.prism([[x - 90, y - 70], [x + 90, y - 70], [x + 90, y + 70], [x - 90, y + 70]], Z0 + 5, Z1); a.rect(x - 90, y - 70, x + 90, y + 70, 'EQUIP-DETAIL'); } a.log('Added the ring bracket and six aimed flood heads (plan and 3D).'); }],
  [/switchgear section/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); a.box(X0, YF + 30, Z0, X1, YB, Z1); a.box(X0 + 20, YF, Z0 + 50, X1 - 20, YF + 30, Z1 - 100);
    for (let i = 0; i < 3; i++) { const z0 = Z0 + 100 + i * 560; a.box(X0 + 70, YF - 10, z0, X1 - 70, YF, z0 + 520); a.box(X0 + 120, YF - 30, z0 + 200, X0 + 220, YF - 10, z0 + 330); a.rect(X0 + 70, YF - 10, X1 - 70, YF, 'EQUIP-DETAIL'); a.circ(X0 + 170, YF - 20, 30, 'EQUIP-DETAIL'); }
    a.box(X0, YF + 30, Z1, X1, YB, Z1 + 0.1); for (const x of [X0 + 30, X1 - 30]) a.cyl(x, YB - 30, Z1, Z1 + 80, 20, 8); a.line(X0 + 20, YF + 30, X1 - 20, YF + 30); a.arc(X0 + 20, YF, X1 - X0 - 40, 270, 360); a.clear('working space', X0, YF - 1070, X1, YF, 40);
    a.log('Added the cabinet, three breaker doors with handles, lifting eyes and the 42 in front working clearance (plan and 3D).');
  }],
  [/motor control center/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); const n = 6;
    for (let i = 0; i < n; i++) { const x0 = X0 + (i * W) / n, x1 = X0 + ((i + 1) * W) / n; a.box(x0, YF + 20, Z0, x1, YB, Z1); a.line(x0, YF, x0, YB); for (let j = 0; j < 5; j++) { const z0 = Z0 + 150 + j * 380; a.box(x0 + 40, YF, z0, x1 - 40, YF + 20, z0 + 330); a.box(x1 - 130, YF - 18, z0 + 120, x1 - 70, YF, z0 + 210); } a.box(x0 + 40, YF, Z0 + 20, x1 - 40, YF + 20, Z0 + 130); }
    a.clear('working space', X0, YF - 1070, X1, YF, 40); a.log('Added six vertical sections, each with five starter buckets and operating handles, and the front working clearance (plan and 3D).');
  }],
  [/distribution panel, 400 A/i, (a) => { panelWall(a, 4); a.log('Added the enclosure, a hinged door with a latch, the main breaker and the breaker columns (plan and 3D).'); }],
  [/panelboard, 225 A, 42 circuit/i, (a) => { panelWall(a, 2); a.log('Added the enclosure with a trim, a hinged door and the breaker columns (plan and 3D).'); }],
  [/EV charger, dual port/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 40); a.box(X0 + 20, YF + 20, Z0 + 40, X1 - 20, YB - 20, Z1); a.box(X0 + 40, YF + 10, Z1 - 450, X1 - 40, YF + 20, Z1 - 130);
    a.box(X0 + 50, YF + 6, Z1 - 440, X1 - 50, YF + 10, Z1 - 140); for (const dx of [-1, 1]) { const x = cx + dx * (X1 - X0) / 2; a.tube([[cx + dx * 60, YF + 20, Z1 - 600], [cx + dx * 140, YF - 60, Z1 - 850], [cx + dx * 120, YF - 140, Z0 + 150]], [14, 16, 14], 8); a.box(cx + dx * 120 - 30, YF - 220, Z0 + 150, cx + dx * 120 + 30, YF - 130, Z0 + 330); }
    a.prism([[X0 + 10, YF + 10], [X1 - 10, YF + 10], [X1 - 10, YB - 10], [X0 + 10, YB - 10]], Z1, Z1 + 20); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL'); a.log('Added the base plate, the pedestal, the display, two coiled cables and their connector holsters (plan and 3D).');
  }],
  [/DC fast charger/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 24, Z0, X1, YB, Z1); a.box(X0, YF, Z0 + 40, X1, YB, Z1); a.box(X0 + 10, YF, Z0, X1 - 10, YB, Z0 + 40); louvers(a, X0 + 20, X1 - 20, YB, Z0 + 100, Z0 + 700, 40);
    a.box(X0 + 140, YF - 20, Z1 - 650, X1 - 140, YF, Z1 - 250); a.box(X0 + 150, YF - 24, Z1 - 640, X1 - 150, YF - 20, Z1 - 450); a.rect(X0 + 140, YF - 20, X1 - 140, YF, 'EQUIP-DETAIL');
    for (const side of [0, 1]) { const x = side ? X1 : X0; a.tube([[x, a.cy, Z1 - 500], [x + (side ? 160 : -160), a.cy, Z1 - 900], [x + (side ? 120 : -120), a.cy, Z0 + 500]], [18, 18, 18], 8); } a.log('Added the cabinet with vented lower panels, the touchscreen, a cable and holster on each side and the roof (plan and 3D).');
  }],
  [/transfer switch, 400 A/i, (a) => { panelWall(a, 1); a.log('Added the enclosure, the hinged door, handle and status lamps (plan and 3D).'); }],
  [/floor box, four service/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z1 - 4); a.box(X0 + 6, YF + 6, Z1 - 4, X1 - 6, YB - 6, Z1); a.rect(X0 + 6, YF + 6, X1 - 6, YB - 6, 'EQUIP-DETAIL'); for (let i = 0; i < 4; i++) a.circ(X0 + (X1 - X0) * (i + 0.5) / 4, cy, 18, 'EQUIP-DETAIL'); a.line(X0 + 10, YF + 10, X1 - 10, YF + 10, 'EQUIP-DETAIL'); a.log('Added the box body, the hinged cover plate and the four service openings (plan and 3D).'); }],
  [/poke-through device/i, (a) => { const { X0, X1, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.circ(cx, cy, r); a.cyl(cx, cy, Z0, Z1 - 3, r * 0.85, 16); a.cyl(cx, cy, Z1 - 3, Z1, r, 18); a.circ(cx, cy, r * 0.55, 'EQUIP-DETAIL'); a.log('Added the sleeve and the flip-lid cover (plan and 3D).'); }],
  [/busway plug-in unit/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z1); a.box(X0 + 15, YF - 4, Z0 + 30, X1 - 15, YF, Z1 - 30); a.box(cx - 20, YF - 30, Z0 + 120, cx + 20, YF - 4, Z0 + 250); a.box(X0 - 0, YB - 0, Z1, X1, YB + 0.1, Z1 + 0.1); a.rect(X0 + 15, YF - 4, X1 - 15, YF, 'EQUIP-DETAIL'); a.cyl(cx, a.cy, Z1, Z1 + 80, 25, 8); a.log('Added the plug-in box, its door with the breaker handle and the stab housing (plan and 3D).'); }],
  [/server rack, 42U/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a, base = Z0 + 80; a.outline(); for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 40], [X1 - 40, YB - 40]]) { a.caster(x, y, 80); a.box(x - 20, y - 20, base, x + 20, y + 20, Z1 - 40); a.circ(x, y, 20, 'EQUIP-HIDDEN'); }
    a.box(X0, YF, Z1 - 40, X1, YB, Z1); a.box(X0, YF, base, X1, YB, base + 40); a.frame(X0 + 10, base + 40, X1 - 10, Z1 - 40, YF, YF + 20, 40);
    for (let z = base + 90; z < Z1 - 100; z += 22) a.box(X0 + 70, YF + 20, z, X1 - 70, YF + 24, z + 4); a.box(X0 + 90, YF - 20, base + 60, X1 - 90, YF, Z1 - 60);
    for (let i = 0; i < 10; i++) a.box(X0 + 110, YF - 20, base + 100 + i * 150, X1 - 110, YF - 17, base + 110 + i * 150);
    a.rect(X0 + 90, YF - 20, X1 - 90, YF, 'EQUIP-DETAIL'); a.arc(X0, YF, X1 - X0, 270, 360); a.log('Added the frame on casters, the perforated front door, the mounting rails and the top cable entry (plan and 3D).');
  }],
  [/rack PDU, vertical/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z1); for (let z = Z0 + 120; z < Z1 - 200; z += 120) a.box(X0 + 10, YF - 6, z, X1 - 10, YF, z + 70); a.cyl(cx, cy, Z1, Z1 + 150, 12, 8); a.log('Added the strip body, the row of outlets and the power cord (plan and 3D).'); }],
  [/solar inverter, 50 kW/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 60, Z0, X1, YB, Z1); a.box(X0 + 20, YF + 40, Z0 + 20, X1 - 20, YB - 60, Z1 - 20);
    for (let x = X0 + 60; x < X1 - 120; x += 30) a.box(x, YB - 60, Z0 + 60, x + 10, YB + 0.01 - 0.01 + 0.0, Z1 - 60); louvers(a, X0 + 40, X1 - 40, YF + 40, Z0 + 80, Z0 + 520, 34);
    a.box(X0 + 400, YF, Z0 + 600, X0 + 700, YF + 40, Z0 + 800); a.box(X0 + 40, YF, Z0 - 0, X1 - 40, YF + 40, Z0 + 40); for (let i = 0; i < 4; i++) a.cyl(X0 + 120 + i * 120, YF + 80, Z0 - 100, Z0 + 20, 24, 8);
    a.log('Added the wall-mounted enclosure, front louvers, the display and the underside conduit connections (plan and 3D).');
  }],
  [/battery energy storage cabinet/i, (a) => { cab(a, { legs: 100, doors: 2, swing: true, louver: true, pull: 'vbar', lock: true }); const { X0, X1, YF, YB, Z1 } = a; a.box(X0 + 40, YB - 30, Z1 - 20, X1 - 40, YB, Z1 + 0.1); a.box(X0 + 60, YF - 4, Z1 - 200, X0 + 260, YF, Z1 - 120); a.log('Added two vented locking doors with swings, the base legs and the status display (plan and 3D).'); }],
];
export function panelWall(a, n) {
  const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 6, Z0, X1, YB, Z1); a.box(X0, YF + 12, Z0, X1, YB - 6, Z1); a.frame(X0, Z0, X1, Z1, YF, YF + 12, 30);
  a.box(X0 + 30, YF + 6, Z0 + 30, X1 - 30, YF + 12, Z1 - 30); a.box(X1 - 90, YF - 14, (Z0 + Z1) / 2 - 80, X1 - 55, YF, (Z0 + Z1) / 2 + 80);
  if (n > 1) for (let i = 0; i < 2; i++) for (let z = Z0 + 170; z < Z1 - 120; z += 36) a.box(X0 + 70 + i * (X1 - X0 - 160) / 2, YF + 6, z, X0 + 70 + i * (X1 - X0 - 160) / 2 + (X1 - X0 - 160) / 2 - 20, YF + 8, z + 22);
  a.box(cx - 70, YF + 0.0 + 0, Z1 - 120, cx + 70, YF + 6, Z1 - 70); a.line(X1 - 40, YF, X1 - 40, YF + 30, 'EQUIP-DETAIL'); a.arc(X0, YF, X1 - X0, 270, 360); a.line(X0, YF, X0, YF - (X1 - X0), 'EQUIP-SWING'); a.clear('working space', X0, YF - 1070, X1, YF, 40);
}

// -------------------------------------------------------------------------------------------------------------------------------------------------
export function casing(a, ext = {}) { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0 + (ext.lift ?? 0), X1, YB, Z1); }
export function ductFlange(a, x, y, z, w, h, axis = 'x') { if (axis === 'x') a.box(x - 10, y - w / 2, z - h / 2, x + 10, y + w / 2, z + h / 2); else a.box(x - w / 2, y - 10, z - h / 2, x + w / 2, y + 10, z + h / 2); }
export function accessPanels(a, n, z0, z1, y = a.YF) { const { X0, X1 } = a; const w = (X1 - X0) / n; for (let i = 0; i < n; i++) { a.box(X0 + i * w + 30, y - 10, z0, X0 + (i + 1) * w - 30, y, z1); a.box(X0 + i * w + w - 100, y - 24, (z0 + z1) / 2 - 40, X0 + i * w + w - 60, y - 10, (z0 + z1) / 2 + 40); a.rect(X0 + i * w + 30, y - 10, X0 + (i + 1) * w - 30, y, 'EQUIP-DETAIL'); } }

export const MECH = [
  [/rooftop unit, 50 ton/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 350);   // curb
    a.box(X0 + 20, YF + 20, Z0 + 350, X1 - 20, YB - 20, Z1); accessPanels(a, 5, Z0 + 450, Z1 - 120, YF + 20); accessPanels(a, 5, Z0 + 450, Z1 - 120, YB + 0);
    for (const x of [X0 + W * 0.25, X0 + W * 0.7]) { a.cyl(x, a.cy, Z1, Z1 + 20, 450, 28); for (let i = 0; i < 8; i++) { const g = (i / 8) * Math.PI * 2; a.box(x + Math.cos(g) * 300 - 6, a.cy + Math.sin(g) * 300 - 6, Z1 + 20, x + Math.cos(g) * 300 + 6, a.cy + Math.sin(g) * 300 + 6, Z1 + 50); } a.circ(x, a.cy, 450, 'EQUIP-DETAIL'); a.circ(x, a.cy, 80, 'EQUIP-DETAIL'); }
    louvers(a, X0 + 100, X0 + 800, YB + 0, Z0 + 500, Z1 - 150, 36); a.box(X1 - 60, YF + 400, Z0 + 700, X1 + 0, YB - 400, Z0 + 1000); a.line(X0 + 20, YF + 20, X1 - 20, YF + 20); a.log('Added the roof curb, the casing with five access panels per side, two condenser fan openings and the outside-air hood (plan and 3D).');
  }],
  [/cooling tower, open circuit/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 250); a.box(X0 + 40, YF + 40, Z0 + 250, X1 - 40, YB - 40, Z1 - 450);
    for (const side of [0, 1, 2, 3]) louvers(a, X0 + 100, X1 - 100, side < 2 ? (side ? YB : YF) : (side === 2 ? YB : YF), Z0 + 400, Z1 - 600, 44);
    a.cone(cx, cy, Z1 - 450, Z1 - 150, (X1 - X0) / 2 - 40, 560, 28); a.cyl(cx, cy, Z1 - 150, Z1, 560, 28); a.circ(cx, cy, 560); a.circ(cx, cy, 120, 'EQUIP-DETAIL'); for (let i = 0; i < 4; i++) { const g = (i / 4) * Math.PI * 2 + 0.4; a.line(cx, cy, cx + Math.cos(g) * 520, cy + Math.sin(g) * 520, 'EQUIP-DETAIL'); }
    a.ycyl(YF - 0, YF + 0.2, cx, Z0 + 150, 1, 3); a.cyl(X1 - 150, cy, Z0 + 250, Z0 + 600, 90, 14); a.cyl(X0 + 150, cy, Z0 + 250, Z0 + 600, 90, 14); a.log('Added the basin, the louvered casing, the fan cylinder with its blades and the water connections (plan and 3D).');
  }],
  [/water-cooled chiller, 200 ton/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 100); a.xcyl(X0 + 100, X1 - 600, cy + 380, Z0 + 600, 380, 28); a.xcyl(X0 + 100, X1 - 600, cy - 380, Z0 + 1200, 320, 28);
    a.box(X1 - 560, YF + 100, Z0 + 100, X1 - 40, YB - 100, Z1 - 300); a.box(X1 - 540, YF, Z0 + 700, X1 - 60, YF + 100, Z1 - 400);
    for (const y of [cy + 380, cy - 380]) { a.cyl(X0 + 300, y, Z0 + 1000, Z0 + 1300, 90, 14); flange(a, X0 + 300, y, Z0 + 1300, 120); }
    a.box(X0 + 100, YF, Z0 + 100, X0 + 140, YB, Z0 + 1000); a.box(X1 - 700, YF + 20, Z0 + 150, X1 - 560, YB - 20, Z0 + 600); a.log('Added the skid, the evaporator and condenser shells, the compressor and starter section, and the water nozzles with flanges (plan and 3D).');
  }],
  [/condensing boiler, 1000 MBH/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 450, Z0, X1, YB, Z0 + 150); a.box(X0 + 20, YB - 430, Z0 + 150, X1 - 20, YB - 20, Z1); a.box(X0 + 40, YF + 60, Z0 + 500, X1 - 40, YB - 430, Z1 - 100); a.box(X0 + 60, YF, Z0 + 700, X1 - 60, YF + 60, Z0 + 950);
    a.cyl(X1 - 200, YB - 150, Z1, Z1 + 400, 80, 16); a.circ(X1 - 200, YB - 150, 80, 'EQUIP-DETAIL'); a.cyl(X0 + 200, YB - 150, Z0 + 150, Z0 + 420, 60, 12); for (const x of [cx - 100, cx, cx + 100]) a.cyl(x, YB - 200, Z0 - 0, Z0 + 150, 30, 8);
    a.box(X0 + 120, YF - 20, Z0 + 1100, X0 + 400, YF + 60, Z0 + 1300); a.log('Added the base, the heat-exchanger casing, the burner section, the control display, the flue and the connections (plan and 3D).');
  }],
  [/base-mounted pump, 10 hp/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 80); a.xcyl(X0 + 80, X0 + W * 0.45, a.cy, Z0 + 260, 170, 20); a.xcyl(X0 + W * 0.45, X0 + W * 0.55, a.cy, Z0 + 260, 40, 12); a.ell(X0 + W * 0.7, a.cy, Z0 + 270, 190, 170, 190, 18, 8); flange(a, X0 + W * 0.7, a.cy, Z1 - 60, 90); a.ycyl(a.cy, a.cy + 190, X0 + W * 0.7, Z0 + 270, 50, 12); a.box(X0 + W * 0.45, a.cy - 120, Z0 + 80, X0 + W * 0.55, a.cy + 120, Z0 + 300); a.log('Added the baseplate, motor, coupling guard, volute casing, suction and discharge flanges (plan and 3D).'); }],
  [/variable frequency drive/i, (a) => { panelWall(a, 2); a.box(a.X0 + 100, a.YF - 30, a.Z1 - 260, a.X1 - 100, a.YF - 14, a.Z1 - 120); a.log('Added the enclosure, the door, the keypad display and the heat-sink fins (plan and 3D).'); }],
  [/makeup air unit, 8000 cfm/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 150); a.box(X0 + 10, YF + 10, Z0 + 150, X1 - 10, YB - 10, Z1); louvers(a, X0 + 40, X0 + 700, YF + 10, Z0 + 250, Z1 - 120, 40); accessPanels(a, 3, Z0 + 250, Z1 - 120, YB);
    a.box(X1 - 500, YF + 10, Z0 + 250, X1 - 40, YB - 10, Z1 - 120); a.cyl(X1 - 350, YB - 10, Z1, Z1 + 400, 100, 14); a.box(X1 - 5, YF + 400, Z0 + 400, X1 + 0.0 + 0.1, YB - 400, Z1 - 300); a.rect(X0 + 40, YF + 10, X0 + 700, YF + 20, 'EQUIP-DETAIL'); a.log('Added the base, the filter and louver section, the access panels, the gas burner section and the flue (plan and 3D).');
  }],
  [/upblast kitchen exhaust fan/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 250); a.cyl(cx, cy, Z0 + 250, Z0 + 500, r * 0.55, 20); a.cone(cx, cy, Z0 + 500, Z1 - 100, r * 0.6, r * 0.7, 20); a.cone(cx, cy, Z1 - 100, Z1, r * 0.92, r * 0.92, 24); a.cone(cx, cy, Z1 - 20, Z1 + 1, r * 0.92, r * 0.92, 24); a.circ(cx, cy, r * 0.92); a.circ(cx, cy, r * 0.55, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.box(cx + s * r * 0.55, cy - 120, Z0 + 350, cx + s * r * 0.55 + s * 140, cy + 120, Z0 + 520); a.log('Added the curb, the fan housing, the upblast discharge, the weather hood and the disconnect (plan and 3D).'); }],
  [/laboratory fume hood/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, base = Z0 + 900; a.outline(); a.box(X0, YF + 20, Z0, X1, YB, base - 40); a.line(X0, YF + 20, X1, YF + 20); for (let i = 0; i < 2; i++) { const x0 = X0 + i * W / 2 + 15, x1 = X0 + (i + 1) * W / 2 - 15; a.box(x0, YF, Z0 + 80, x1, YF + 20, base - 100); pull(a, 'bar', (x0 + x1) / 2, base - 160, YF); }
    a.box(X0, YF, base - 40, X1, YB, base); a.box(X0, YF, base, X0 + 150, YB, Z1 - 200); a.box(X1 - 150, YF, base, X1, YB, Z1 - 200); a.box(X0, YB - 80, base, X1, YB, Z1);
    a.box(X0, YF, Z1 - 200, X1, YB, Z1); a.frame(X0 + 150, base + 300, X1 - 150, Z1 - 200, YF + 20, YF + 40, 40); a.box(X0 + 190, YF + 28, base + 340, X1 - 190, YF + 32, Z1 - 240); a.box(X0 + 150, YF + 30, base + 40, X1 - 150, YF + 60, base + 300);
    a.cyl(cx, YB - 200, Z1, Z1 + 400, 150, 16); a.circ(cx, YB - 200, 150, 'EQUIP-DETAIL'); a.rect(X0 + 150, YF + 20, X1 - 150, YB - 80, 'EQUIP-DETAIL'); a.log('Added the base cabinet, the work surface, the sash frame and airfoil, the baffle, the exhaust collar and the sash handle (plan and 3D).');
  }],
  [/fan filter unit/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0 + 50, X1, YB, Z1); a.frame(X0, Z0, X1, Z0 + 50, YF, YB, 20); a.box(X0 + 20, YF + 20, Z0 + 5, X1 - 20, YB - 20, Z0 + 45); for (let x = X0 + 40; x < X1 - 20; x += 20) a.line(x, YF + 20, x, YB - 20, 'EQUIP-DETAIL'); a.cyl(cx, cy, Z1, Z1 + 80, 100, 16); a.circ(cx, cy, 100, 'EQUIP-DETAIL'); a.log('Added the plenum, the HEPA media face with its pleats and the fan inlet collar (plan and 3D).'); }],
  [/computer room air conditioner/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YF, Z0 + 100, X1, YB, Z1); a.box(X0 + 10, YF, Z0, X1 - 10, YB, Z0 + 100); for (let i = 0; i < 4; i++) { const x0 = X0 + i * W / 4 + 20, x1 = X0 + (i + 1) * W / 4 - 20; a.box(x0, YF - 10, Z0 + 150, x1, YF, Z1 - 150); pull(a, 'bar', (x0 + x1) / 2, Z0 + 1000, YF); }
    a.box(X0 + 40, YF - 20, Z1 - 350, X0 + 500, YF - 10, Z1 - 160); louvers(a, X0 + 60, X1 - 60, YB - 0, Z1 - 120, Z1 - 20, 16);   // display and return louvers
    for (let i = 0; i < 4; i++) { const x = X0 + W * (i + 0.5) / 4; a.cyl(x, YB - 200, Z1, Z1 + 0, 1, 3); }
    a.line(X0, YF, X1, YF); a.arc(X0, YF, W / 4, 270, 360); a.clear('service space', X0, YF - 900, X1, YF, 40); a.log('Added the base, four hinged panels with handles, the control display, return louvers and the front service clearance (plan and 3D).');
  }],
  [/in-row cooler/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0 + 60, X1, YB, Z1); a.box(X0 + 10, YF, Z0, X1 - 10, YB, Z0 + 60); for (let z = Z0 + 200; z < Z1 - 100; z += 28) a.box(X0 + 20, YF - 6, z, X1 - 20, YF, z + 16); a.box(X0 + 30, YF - 12, Z1 - 400, X1 - 30, YF - 6, Z1 - 250); a.log('Added the cabinet, the perforated front, the display and the base plinth (plan and 3D).'); }],
  [/unit ventilator, classroom/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YB - 120, Z0, X1, YB, Z1); a.box(X0, YF, Z0 + 40, X1, YB - 120, Z1 - 20); a.prism([[X0, YF], [X1, YF], [X1, YF + 30], [X0, YF + 30]], Z1 - 20, Z1);
    for (let x = X0 + 40; x < X1 - 40; x += 22) a.box(x, YF - 6, Z1 - 140, x + 10, YF, Z1 - 30); a.box(X0 + 40, YF - 6, Z0 + 120, X1 - 40, YF, Z0 + 460); louvers(a, X0 + 100, X0 + 700, YB, Z0 + 150, Z1 - 150, 40);
    a.box(X1 - 220, YF - 10, Z0 + 500, X1 - 60, YF, Z0 + 600); a.box(X0 + 40, YB - 120, Z0 - 0, X1 - 40, YB - 100, Z0 + 20); a.log('Added the cabinet, the discharge grille on top, the front access panel, the outside-air louver at the back and the control plate (plan and 3D).');
  }],
  [/hot water coil, 24 x 24/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.frame(X0, Z0, X1, Z1, YF, YB, 30); for (let z = Z0 + 60; z < Z1 - 40; z += 30) a.xcyl(X0 + 30, X1 - 30, a.cy, z, 8, 8); a.cyl(X0 - 0, a.cy, Z0 + 40, Z1 - 40, 22, 10); a.cyl(X1 - 0, a.cy, Z0 + 40, Z1 - 40, 22, 10); a.ycyl(YF - 60, YF, X0 + 40, Z1 - 60, 14, 8); a.ycyl(YF - 60, YF, X0 + 40, Z0 + 60, 14, 8); a.log('Added the casing frame, the finned tube rows, the two headers and the supply and return stubs (plan and 3D).'); }],
  [/radiant ceiling panel/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z1); a.rect(X0 + 15, YF + 15, X1 - 15, YB - 15, 'EQUIP-DETAIL'); for (let y = YF + 60; y < YB - 30; y += 70) a.line(X0 + 25, y, X1 - 25, y, 'EQUIP-DETAIL'); a.box(X0 + 10, YF + 10, Z1, X0 + 70, YB - 10, Z1 + 30); a.log('Added the perforated panel face, the embedded coil pattern and the header (plan and 3D).'); }],
  [/destratification fan/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.circ(cx, cy, (X1 - X0) / 2); a.cyl(cx, cy, Z1 - 450, Z1, 25, 8); a.cyl(cx, cy, Z0 + 350, Z0 + 750, 160, 20); a.cyl(cx, cy, Z0 + 750, Z1 - 450, 20, 8);
    for (let i = 0; i < 6; i++) { const g = (i / 6) * Math.PI * 2; a.tube([[cx, cy, Z0 + 550], [cx + Math.cos(g) * 640, cy + Math.sin(g) * 640, Z0 + 520 + Math.sin(g) * 60]], [50, 25], 6); a.line(cx, cy, cx + Math.cos(g) * 680, cy + Math.sin(g) * 680, 'EQUIP-DETAIL'); }
    a.circ(cx, cy, 160, 'EQUIP-DETAIL'); a.cyl(cx, cy, Z0, Z0 + 60, 640, 24); a.log('Added the mounting stem, the hub with motor and six airfoil blades (plan and 3D).');
  }],
  [/air curtain, 48 in/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z1); a.box(X0 + 30, YF + 0, Z0, X1 - 30, YF + 0.0 + 70, Z0 + 12); for (let x = X0 + 40; x < X1 - 20; x += 24) a.line(x, YF + 20, x, YB - 20, 'EQUIP-DETAIL'); a.box(X1 - 80, YF - 4, Z0 + 60, X1 - 20, YF, Z1 - 60); a.log('Added the housing, the discharge nozzle slot, the intake grille lines and the control switch (plan and 3D).'); }],
  [/heat recovery ventilator/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; casing(a); accessPanels(a, 2, Z0 + 80, Z1 - 80); for (const [x, y] of [[X0 + 200, YF + 120], [X0 + 200, YB - 120], [X1 - 200, YF + 120], [X1 - 200, YB - 120]]) { a.cyl(x, y, Z1, Z1 + 150, 70, 14); a.circ(x, y, 70, 'EQUIP-DETAIL'); } for (const x of [X0 + 100, X1 - 100]) a.box(x - 30, cy - 10, Z0 - 0, x + 30, cy + 10, Z0 + 80); a.log('Added the casing, the access doors, four duct collars on top and the hanger points (plan and 3D).'); }],
  [/active chilled beam/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cy } = a; a.outline(); a.box(X0, YF, Z0 + 20, X1, YB, Z1); a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 20); for (let x = X0 + 40; x < X1 - 40; x += 18) a.box(x, cy - 15, Z0 - 0, x + 6, cy + 15, Z0 + 20); a.line(X0 + 20, cy - 25, X1 - 20, cy - 25, 'EQUIP-DETAIL'); a.line(X0 + 20, cy + 25, X1 - 20, cy + 25, 'EQUIP-DETAIL'); a.cyl(X0 + 100, cy, Z1, Z1 + 100, 50, 12); a.log('Added the housing, the central induction slot, the coil side grilles and the primary air collar (plan and 3D).'); }],
  [/outdoor unit, 10 ton|variable refrigerant flow outdoor unit/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 100); a.box(X0 + 20, YF + 20, Z0 + 100, X1 - 20, YB - 20, Z1 - 20); a.box(X0, YF, Z1 - 20, X1, YB, Z1);
    for (const f of [0.28, 0.72]) { const x = X0 + W * f; a.cyl(x, cy, Z1, Z1 + 12, 380, 28); for (let i = 0; i < 12; i++) { const g = (i / 12) * Math.PI * 2; a.box(x + Math.cos(g) * 300 - 4, cy + Math.sin(g) * 300 - 4, Z1 + 12, x + Math.cos(g) * 300 + 4, cy + Math.sin(g) * 300 + 4, Z1 + 26); } a.circ(x, cy, 380, 'EQUIP-DETAIL'); a.circ(x, cy, 70, 'EQUIP-DETAIL'); }
    for (let z = Z0 + 200; z < Z1 - 150; z += 22) { a.box(X0 + 10, YF + 10, z, X0 + 20, YB - 10, z + 8); a.box(X1 - 20, YF + 10, z, X1 - 10, YB - 10, z + 8); } a.box(X0 + 200, YF - 40, Z0 + 150, X0 + 500, YF - 20, Z0 + 350); a.log('Added the base rails, the coil casing with fin lines, two top fans with grilles and the refrigerant valve panel (plan and 3D).');
  }],
  [/ceiling cassette/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0 + 120, YF + 120, Z0 + 20, X1 - 120, YB - 120, Z1); a.box(X0, YF, Z0, X1, YB, Z0 + 25); a.box(X0 + 140, YF + 140, Z0 - 0, X1 - 140, YB - 140, Z0 + 15);
    for (const [x0, y0, x1, y1] of [[cx - 220, YF + 40, cx + 220, YF + 110], [cx - 220, YB - 110, cx + 220, YB - 40], [X0 + 40, cy - 220, X0 + 110, cy + 220], [X1 - 110, cy - 220, X1 - 40, cy + 220]]) { a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); a.box(x0, y0, Z0 - 6, x1, y1, Z0); }
    a.rect(X0 + 140, YF + 140, X1 - 140, YB - 140, 'EQUIP-DETAIL'); a.log('Added the ceiling panel, the four discharge slots, the central return grille and the casing above (plan and 3D).');
  }],
  [/smoke exhaust fan/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 80); a.xcyl(X0 + 300, X1 - 100, cy, Z0 + 600, 540, 28); a.cone(X0 + 100, cy, Z0 + 600, Z0 + 600, 1, 1, 3); a.xcyl(X0, X0 + 300, cy, Z0 + 600, 380, 24); a.box(X1 - 220, YF + 100, Z0 + 80, X1 - 60, YB - 100, Z0 + 500); a.circ(X0 + 150, cy, 380, 'EQUIP-DETAIL'); a.ycyl(YF - 80, YF, X1 - 140, Z0 + 600, 40, 10); a.log('Added the base, the fan housing with its inlet cone, the motor and the access box (plan and 3D).'); }],
  [/stair pressurization fan/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0 + 20, YF + 20, Z0 + 60, X1 - 20, YB - 20, Z1 - 200); a.xcyl(X0 + 100, X1 - 100, cy, Z1 - 200, 250, 24); a.box(X0 + 40, YF, Z1 - 200, X1 - 40, YB, Z1); a.ell(a.cx, a.cy, Z1 - 100, 280, 280, 100, 18, 6); a.log('Added the base, the fan scroll housing, the outlet damper section and the motor cover (plan and 3D).'); }],
  [/dust collector/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); for (const [x, y] of [[X0 + 80, YF + 80], [X1 - 80, YF + 80], [X0 + 80, YB - 80], [X1 - 80, YB - 80]]) a.box(x - 40, y - 40, Z0, x + 40, y + 40, Z0 + 600);
    a.cone(cx, cy, Z0 + 250, Z0 + 1100, 100, 420, 24); a.box(cx - 60, cy - 60, Z0 + 100, cx + 60, cy + 60, Z0 + 250); a.cyl(cx, cy, Z0 + 1100, Z0 + 2300, 480, 28);
    a.box(X0 + 30, YB - 400, Z0 + 2300, X1 - 30, YB - 30, Z1 - 100); a.cyl(cx, cy, Z1 - 100, Z1, 150, 14); a.box(X0 + 30, YB - 400, Z0 + 1300, X0 + 80, YB - 30, Z0 + 2100); a.circ(cx, cy, 480); a.circ(cx, cy, 120, 'EQUIP-DETAIL');
    a.log('Added the support legs, the hopper with a discharge, the cartridge chamber, the clean-air plenum and the exhaust (plan and 3D).');
  }],
  [/air compressor, 25 hp/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); a.xcyl(X0 + 100, X1 - 100, cy + 100, Z0 + 520, 360, 28); a.ell(X0 + 100, cy + 100, Z0 + 520, 20, 360, 360, 14, 6); a.ell(X1 - 100, cy + 100, Z0 + 520, 20, 360, 360, 14, 6);
    for (const x of [X0 + 400, X1 - 400]) a.box(x - 40, YF + 50, Z0, x + 40, YB - 50, Z0 + 160);
    a.box(X0 + 200, YF + 20, Z0 + 880, X1 - 200, YB - 100, Z1); a.box(X0 + 400, YF - 0, Z0 + 960, X0 + 900, YF + 20, Z1 - 80); a.cyl(X1 - 350, cy - 300, Z0 + 880, Z1 + 0, 100, 16); a.ell(X1 - 120, YF + 140, Z0 + 1000, 90, 90, 90, 12, 6); a.box(X0 + 20, YF + 60, Z0 + 880, X0 + 200, YF + 120, Z1 - 40);
    a.rect(X0 + 200, YF + 20, X1 - 200, YB - 100, 'EQUIP-DETAIL'); a.log('Added the receiver tank on its feet, the compressor and motor, the belt guard and the pressure gauge (plan and 3D).');
  }],
  [/refrigerated air dryer/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YF, Z0 + 60, X1, YB, Z1); a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 60); louvers(a, X0 + 40, X1 - 40, YF, Z0 + 150, Z1 - 300, 30); a.box(X0 + 40, YF - 10, Z1 - 250, X1 - 40, YF, Z1 - 80); a.ell(cx, YF - 12, Z1 - 165, 60, 8, 60, 14, 6); a.cyl(X1 - 60, YB - 60, Z1, Z1 + 80, 18, 8); a.cyl(X0 + 60, YB - 60, Z1, Z1 + 80, 18, 8); a.log('Added the cabinet, the front louvers, the gauge panel and the air inlet and outlet pipes (plan and 3D).'); }],
  [/fire pump, electric/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 100); a.xcyl(X0 + 80, X0 + W * 0.42, cy, Z0 + 330, 170, 22); a.xcyl(X0 + W * 0.42, X0 + W * 0.5, cy, Z0 + 330, 45, 12); a.ell(X0 + W * 0.7, cy, Z0 + 340, 220, 180, 210, 18, 8);
    a.ycyl(cy, YB - 20, X0 + W * 0.7, Z0 + 340, 120, 14); a.cyl(X0 + W * 0.7, cy, Z0 + 520, Z1 + 0, 120, 14); flange(a, X0 + W * 0.7, cy, Z1 - 14, 190, 14); a.circ(X0 + W * 0.7, cy, 120, 'EQUIP-DETAIL'); a.ycyl(YF, cy - 100, X0 + W * 0.7, Z0 + 340, 100, 14);
    a.box(X0 + W * 0.42, cy - 140, Z0 + 100, X0 + W * 0.5, cy + 140, Z0 + 420); a.log('Added the baseplate, the motor, the coupling guard, the split-case volute with suction and discharge flanges (plan and 3D).');
  }],
  [/hot water storage tank, 500 gal/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.outline(); a.cyl(cx, cy, Z0 + 150, Z1 - 100, r, 32); a.ell(cx, cy, Z1 - 100, r, r, r * 0.3, 24, 5); a.cone(cx, cy, Z0, Z0 + 150, r - 40, r - 40, 28); for (const dz of [250, 800, 1500]) a.ycyl(YF - 40, cy, cx + r * 0.3, Z0 + dz, 35, 12); a.cyl(cx, cy, Z1 - 20, Z1 + 80, 60, 12); a.ycyl(cy, YB + 0, cx - r * 0.5, Z0 + 600, 45, 12); a.circ(cx, cy, r); a.circ(cx, cy, r - 40, 'EQUIP-DETAIL'); a.log('Added the insulated shell, the domed top, the skirt base and the side nozzles (plan and 3D).'); }],
  [/glycol feeder/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0 + 20, YB - 300, Z0 + 60, X1 - 20, YB - 20, Z0 + 520); a.box(X0 + 40, YB - 300, Z0 + 520, X1 - 40, YB - 20, Z0 + 580); a.cyl(X0 + 180, YF + 200, Z0 + 60, Z0 + 520, 130, 20); a.box(X1 - 200, YF + 100, Z0 + 60, X1 - 40, YF + 260, Z0 + 340); a.ell(X1 - 120, YF + 180, Z0 + 380, 70, 70, 50, 14, 6); a.box(cx - 100, YB - 20, Z0 + 600, cx + 100, YB, Z1 - 80); a.log('Added the base, the glycol tank with lid, the feed pump, the control box and the wall panel (plan and 3D).'); }],
  [/plate heat exchanger, 20 in/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0 + 20, cy - 220, Z0 + 60, X0 + 80, cy + 220, Z1 - 60); a.box(X1 - 80, cy - 220, Z0 + 60, X1 - 20, cy + 220, Z1 - 60);
    for (let x = X0 + 100; x < X1 - 100; x += 16) a.box(x, cy - 200, Z0 + 120, x + 10, cy + 200, Z1 - 120); a.xcyl(X0 + 80, X1 - 80, cy - 130, Z1 - 30, 14, 8); a.xcyl(X0 + 80, X1 - 80, cy + 130, Z0 + 90, 14, 8);
    for (const [y, z] of [[cy - 130, Z1 - 180], [cy + 130, Z1 - 180], [cy - 130, Z0 + 200], [cy + 130, Z0 + 200]]) { a.xcyl(X0 - 0, X0 + 20, y, z, 45, 12); flange(a, X0 + 50, y, z, 1, 1); }
    a.rect(X0 + 20, cy - 220, X1 - 20, cy + 220, 'EQUIP-DETAIL'); a.log('Added the base, the fixed and movable frame plates, the plate pack, the tie bars and the four port connections (plan and 3D).');
  }],
];

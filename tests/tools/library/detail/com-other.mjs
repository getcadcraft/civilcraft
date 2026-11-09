/* SPDX-License-Identifier: Apache-2.0 */
/** Commercial building items in the "other" block (other-3.csv): entrances, docks, security, vertical transport, restroom accessories. */
import { cab, pull, T, GAP } from './com-core.mjs';

export function swingLeaf(a, hx, hy, w, dir, z0, z1, { glass = true, bar = true } = {}) {
  // a door leaf of width w hinged at (hx, hy), shown closed in 3D and open 90° in plan
  const x0 = dir > 0 ? hx : hx - w, x1 = dir > 0 ? hx + w : hx;
  if (glass) { a.frame(x0, z0, x1, z1, hy, hy + 45, 60); a.box(x0 + 60, hy + 18, z0 + 60, x1 - 60, hy + 27, z1 - 60); } else a.box(x0, hy, z0, x1, hy + 45, z1);
  if (bar) { const bx = dir > 0 ? x1 - 90 : x0 + 90; a.xcyl(bx - 400, bx + 400, hy - 40, z0 + 1000, 16, 10); a.box(bx - 400, hy - 40, z0 + 1000, bx - 380, hy, z0 + 1000 + 1); }
  a.line(hx, hy, hx, hy - w, 'EQUIP-SWING'); a.arc(hx, hy, w, dir > 0 ? 270 : 180, dir > 0 ? 360 : 270);
  a.clear('door swing', dir > 0 ? hx : hx - w, hy - w, dir > 0 ? hx + w : hx, hy, 80);
}
export function pedestalBox(a, x0, y0, x1, y1, z0, z1, n = 0) { a.box(x0, y0, z0, x1, y1, z1); if (n) for (let i = 1; i < n; i++) a.line(x0 + ((x1 - x0) * i) / n, y0, x0 + ((x1 - x0) * i) / n, y1, 'EQUIP-DETAIL'); }

export const OTHER = [
  [/storefront door pair/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline();
    a.box(X0, YF, Z0, X0 + 50, YB, Z1).box(X1 - 50, YF, Z0, X1, YB, Z1).box(X0 + 50, YF, Z1 - 100, X1 - 50, YB, Z1);   // jambs and head
    const w = (X1 - X0 - 100) / 2; swingLeaf(a, X0 + 50, YF + 10, w - 3, 1, Z0 + 5, Z1 - 105); swingLeaf(a, X1 - 50, YF + 10, w - 3, -1, Z0 + 5, Z1 - 105);
    a.box(X0, YF, Z0, X1, YB, Z0 + 5);
    a.log('Added the frame, two glazed leaves with push bars, 90° swings and clearance (plan and 3D).');
  }],
  [/automatic sliding door/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline();
    a.box(X0, YF, Z1 - 300, X1, YB, Z1); a.box(X0, YF + 10, Z0, X0 + 50, YB - 10, Z1 - 300); a.box(X1 - 50, YF + 10, Z0, X1, YB - 10, Z1 - 300);
    const lw = (W - 100) / 2;
    a.frame(X0 + 50, Z0, X0 + 50 + lw * 0.55, Z1 - 300, YF + 10, YF + 40, 50); a.frame(X0 + 50 + lw * 0.55, Z0, X0 + 50 + lw * 1.1, Z1 - 300, YB - 50, YB - 20, 50);
    a.frame(X1 - 50 - lw * 1.1, Z0, X1 - 50 - lw * 0.55, Z1 - 300, YF + 10, YF + 40, 50); a.frame(X1 - 50 - lw * 0.55, Z0, X1 - 50, Z1 - 300, YB - 50, YB - 20, 50);
    for (const x of [X0 + W * 0.5 - 150, X0 + W * 0.5 + 150]) a.ycyl(YF - 0.0 + 0, YF + 0.01, x, Z1 - 330, 1, 4);
    a.box(a.cx - 50, YF + 60, Z1 - 300, a.cx + 50, YB - 60, Z1 - 240);   // sensor
    a.line(X0 + 50, YF + 25, X1 - 50, YF + 25, 'EQUIP-HIDDEN'); a.line(X0 + 50, YB - 35, X1 - 50, YB - 35, 'EQUIP-HIDDEN');
    a.log('Added the header, two sliding leaves on separate tracks, the side lites and the sensor (plan and 3D).');
  }],
  [/rolling fire shutter/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, hood = 400; a.outline();
    a.box(X0, YF, Z0, X0 + 100, YB, Z1 - hood).box(X1 - 100, YF, Z0, X1, YB, Z1 - hood);
    a.cyl(a.cx, a.cy, Z1 - hood, Z1 - 2, 1, 4);   // placeholder to keep indices valid
    a.xcyl(X0, X1, a.cy, Z1 - hood / 2, hood / 2 - 10, 24); a.box(X0, YF, Z1 - hood, X1, YB, Z1 - hood / 2 + 20);
    for (let z = Z0 + 40; z < Z1 - hood - 20; z += 60) a.box(X0 + 100, a.cy - 25, z, X1 - 100, a.cy + 25, z + 50);
    a.box(X0 + 100, a.cy - 40, Z0, X1 - 100, a.cy + 40, Z0 + 40);
    a.line(X0 + 100, YF, X0 + 100, YB, 'EQUIP-DETAIL'); a.line(X1 - 100, YF, X1 - 100, YB, 'EQUIP-DETAIL'); a.log('Added the guides, the barrel hood, the slat curtain and the bottom bar (plan and 3D).');
  }],
  [/dock leveler/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D } = a, lip = 450; a.outline();
    a.box(X0, YB - 120, Z0, X1, YB, Z1); a.box(X0 + 40, YF + lip, Z0 + 100, X1 - 40, YB - 120, Z1 - 10);   // pit frame + deck
    a.box(X0 + 70, YF, Z1 - 70, X1 - 70, YF + lip, Z1 - 40);   // lip
    a.rect(X0 + 40, YF + lip, X1 - 40, YB - 120, 'EQUIP-DETAIL'); a.line(X0 + 70, YF + lip, X1 - 70, YF + lip); a.rect(X0, YB - 120, X1, YB, 'EQUIP-HIDDEN');
    for (let x = X0 + 150; x < X1 - 100; x += 120) a.line(x, YF + lip + 40, x, YB - 160, 'EQUIP-DETAIL');
    a.log('Added the pit frame, the deck, the hinged lip and the tread lines (plan and 3D).');
  }],
  [/dock door seal/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline();
    a.box(X0, YF, Z0, X0 + 350, YB, Z1 - 350).box(X1 - 350, YF, Z0, X1, YB, Z1 - 350).box(X0, YF, Z1 - 350, X1, YB, Z1);
    a.rect(X0, YF, X0 + 350, YB, 'EQUIP-DETAIL'); a.rect(X1 - 350, YF, X1, YB, 'EQUIP-DETAIL'); a.box(X0 + 350, YB - 20, Z0, X1 - 350, YB, Z1 - 350);
    a.log('Added the two side pads and the head pad of foam around the opening (plan and 3D).');
  }],
  [/turnstile/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline();
    a.box(cx - 100, cy - 400, Z0, cx + 100, cy + 400, Z0 + 600); a.cyl(cx, cy, Z0 + 600, Z0 + 900, 50, 14);
    for (let i = 0; i < 3; i++) { const g = (i / 3) * Math.PI * 2 + 0.4, dx = Math.cos(g), dy = Math.sin(g); a.tube([[cx, cy, Z0 + 900], [cx + dx * 380, cy + dy * 380, Z0 + 760]], [20, 14], 8); a.line(cx, cy, cx + dx * 380, cy + dy * 380, 'EQUIP-DETAIL'); }
    a.box(cx - 100, cy - 400, Z0 + 600, cx + 100, cy - 330, Z1 - 200); a.box(cx - 80, cy - 395, Z1 - 200, cx + 80, cy - 335, Z1 - 120);
    a.circ(cx, cy, 30, 'EQUIP-DETAIL'); a.log('Added the housing, the three-arm rotor, the card reader post and the rotor sweep (plan and 3D).');
  }],
  [/metal detector/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); const pw = 150;
    for (const x of [X0, X1 - pw]) { a.box(x, YF, Z0, x + pw, YB, Z1 - 150); a.box(x + 10, YF + 10, Z0 + 1200, x + pw - 10, YF + 20, Z0 + 1700); }
    a.box(X0, YF, Z1 - 150, X1, YB, Z1); a.box(cx - 120, YF + 20, Z1 - 140, cx + 120, YF + 22, Z1 - 20);
    a.box(X0 + pw, cy - 30, Z0, X1 - pw, cy + 30, Z0 + 25); a.rect(X0 + pw, cy - 30, X1 - pw, cy + 30, 'EQUIP-DETAIL');
    a.log('Added the two columns with zone lights, the head beam and the base plate (plan and 3D).');
  }],
  [/baggage x-ray/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, tl = 0.36; a.outline();
    a.box(X0, YF, Z0 + 200, X1, YB, Z1 - 150); a.box(X0, YF, Z0 + 200, X1, YB, Z0 + 700);
    const tw = (X1 - X0) * 0.7; a.frame(cx - tw / 2, Z0 + 720, cx + tw / 2, Z0 + 1080, YF - 0, YF + 5, 30);
    a.box(X0, YF + 560, Z0 + 640, X1, YB - 560, Z0 + 700);
    a.box(X0 + 30, YF, Z0 + 700, X0 + 90, YF + 560, Z0 + 740); a.box(X1 - 90, YB - 560, Z0 + 700, X1 - 30, YB, Z0 + 740);   // curtains
    a.box(X0 + 400, YF, Z0 + 700, X1 - 400, YB, Z1 - 150);
    a.xcyl(X0 + 10, X1 - 10, YF + 150, Z0 + 720, 25, 8); a.xcyl(X0 + 10, X1 - 10, YB - 150, Z0 + 720, 25, 8);   // belt rollers
    a.box(X1 - 600, YB - 380, Z1 - 150, X1 - 100, YB - 100, Z1); a.tube([[X1 - 350, YB - 240, Z1], [X1 - 350, YB - 240, Z1 + 1], [X1 - 350, YB - 240, Z1 + 2]], [1, 1, 1], 3);
    a.rect(X0 + 400, YF + 560, X1 - 400, YB - 560, 'EQUIP-DETAIL'); a.log('Added the base, belt with rollers, the shielded tunnel with curtains and the monitor stand (plan and 3D).');
  }],
  [/elevator door/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline();
    a.box(X0, YF, Z0, X0 + 60, YB, Z1).box(X1 - 60, YF, Z0, X1, YB, Z1).box(X0 + 60, YF, Z1 - 150, X1 - 60, YB, Z1);
    const dw = (W - 120) / 2; a.box(X0 + 60, YF + 30, Z0 + 10, X0 + 60 + dw + 40, YF + 60, Z1 - 150); a.box(X1 - 60 - dw - 40, YF + 10, Z0 + 10, X1 - 60, YF + 40, Z1 - 150);   // single-slide panels
    a.box(X0 + 60, YF + 15, Z0, X1 - 60, YB, Z0 + 10); a.box(X1 + 0 - 150, YF - 20, Z0 + 1050, X1 - 80, YF, Z0 + 1250); a.circ(X1 - 115, YF - 10, 22, 'EQUIP-DETAIL');
    a.line(X0 + 60, YF + 15, X1 - 60, YF + 15); a.log('Added the frame, two panels sliding on the same side, the sill and the call button plate (plan and 3D).');
  }],
  [/elevator cab/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a; a.outline();
    a.box(X0, YF, Z0, X1, YB, Z0 + 40); a.box(X0, YB - 40, Z0 + 40, X1, YB, Z1 - 100); a.box(X0, YF, Z0 + 40, X0 + 40, YB, Z1 - 100); a.box(X1 - 40, YF, Z0 + 40, X1, YB, Z1 - 100); a.box(X0, YF, Z1 - 100, X1, YB, Z1 - 60);
    a.box(X0 + 40, YF, Z0 + 40, X0 + 40 + 220, YF + 40, Z1 - 100); a.box(X1 - 40 - 220, YF, Z0 + 40, X1 - 40, YF + 40, Z1 - 100);   // front returns
    for (const [x, y0, y1, x1b] of [[X0 + 40, YF + 40, YB - 40, X0 + 70], [X1 - 70, YF + 40, YB - 40, X1 - 40]]) a.box(x, y0, Z0 + 880, x1b, y1, Z0 + 910);
    a.box(X0 + 40, YB - 70, Z0 + 880, X1 - 40, YB - 40, Z0 + 910); a.box(X0 + 40, YF + 20, Z0 + 1050, X0 + 80, YF + 260, Z0 + 1550); for (let i = 0; i < 6; i++) a.circ(X0 + 60, YF + 70 + i * 0, 0.5, 'EQUIP-HIDDEN');
    a.box(X0 + 200, cy - 200, Z1 - 70, X1 - 200, cy + 200, Z1 - 60); a.rect(X0 + 40, YF, X1 - 40, YB - 40, 'EQUIP-DETAIL'); a.line(X0 + 40, YF, X1 - 40, YF);
    a.log('Added the floor, three paneled walls, the front returns with the call panel, handrails on three sides and the ceiling light (plan and 3D).');
  }],
  [/escalator/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, run = D - 2 * 1500, rise = a.H - 1150, sx = X0 + 100, ex = X1 - 100; a.outline();
    const yL = YF + 1500, yH = YB - 1500;
    a.prism([[X0, YF], [X1, YF], [X1, YF + 1500], [X0, YF + 1500]], Z0, Z0 + 150); a.prism([[X0, YB - 1500], [X1, YB - 1500], [X1, YB], [X0, YB]], Z0 + rise, Z0 + rise + 150);
    a.add([]);
    const n = 28; for (let i = 0; i < n; i++) { const t = i / n, y = yL + (yH - yL) * t, z = Z0 + 150 + rise * t; a.box(sx + 120, y, z, ex - 120, y + (yH - yL) / n, z + 20); a.box(sx + 120, y, z - 200 * 0, ex - 120, y + 20, z + 200 * 0 + 20 + (rise / n)); }
    for (const x of [sx, ex - 160]) { a.tube([[x + 80, yL - 200, Z0 + 1000], [x + 80, yL, Z0 + 1050], [x + 80, yH, Z0 + rise + 1050], [x + 80, yH + 200, Z0 + rise + 1000]], [40, 40, 40, 40], 8); a.prism([[x, yL], [x + 160, yL], [x + 160, yH], [x, yH]], Z0 + 150, Z0 + 250); a.rect(x, yL, x + 160, yH, 'EQUIP-DETAIL'); }
    a.rect(X0 + 100, yL, X1 - 100, yH, 'EQUIP-DETAIL'); for (let i = 0; i <= n; i += 2) a.line(sx + 120, yL + ((yH - yL) * i) / n, ex - 120, yL + ((yH - yL) * i) / n, 'EQUIP-DETAIL');
    a.log('Added the two landing plates, the stepped treads on the incline, the balustrades with moving handrails and the truss sides (plan and 3D).');
  }],
  [/hand dryer/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 80, Z0, X1, YB, Z1); a.ell(cx, YB - 100, Z0 + 120, 100, 50, 90, 14, 6); a.box(cx - 40, YF + 10, Z0 + 40, cx + 40, YB - 80, Z0 + 80); a.box(cx - 100, YF, Z0 + 20, cx + 100, YF + 10, Z0 + 28); a.log('Added the housing, the downward nozzle and the sensor eye (plan and 3D).'); }],
  [/paper towel dispenser/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 60, Z0, X1, YB, Z1); a.box(X0 + 5, YF, Z0 + 5, X1 - 5, YB - 60, Z1 - 5); a.box(X0 + 30, YF - 4, Z0 + 20, X1 - 30, YF, Z0 + 55); a.box(X0 + 30, YF - 3, Z1 - 120, X1 - 30, YF, Z1 - 20); a.line(X0 + 5, YF + 40, X1 - 5, YF + 40, 'EQUIP-DETAIL'); a.log('Added the back plate, the hinged cover, the sheet slot and the roll window (plan and 3D).'); }],
  [/soap dispenser/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YB - 25, Z0, X1, YB, Z1); a.box(X0 + 6, YF + 20, Z0 + 20, X1 - 6, YB - 25, Z1 - 20); a.ycyl(YF, YF + 20, cx, Z0 + 20, 8, 8); a.xcyl(cx - 25, cx + 25, YF + 10, Z1 - 15, 6, 8); a.circ(cx, YF + 10, 8, 'EQUIP-DETAIL'); a.log('Added the back plate, the reservoir, the push bar and the nozzle (plan and 3D).'); }],
  [/toilet partition stall/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a, pt = 25; a.outline(); const clr = Z0 + 300;
    for (const x of [X0, X1 - pt]) a.box(x, YF + 150, clr, x + pt, YB, Z1 - 100);
    a.box(X0, YB - pt, clr, X1, YB, Z1 - 100); a.box(X0 + pt, YF, clr, X0 + 300, YF + pt, Z1 - 100);
    const dx0 = X0 + 330, dx1 = X1 - 60; a.box(dx0, YF, clr, dx1, YF + pt, Z1 - 100);
    a.box(dx1 - 20, YF - 25, Z0 + 1000, dx1 + 40, YF, Z0 + 1060); a.box(dx0 - 0, YF - 20, Z0 + 1000, dx0 + 60, YF, Z0 + 1060);
    for (const x of [X0 + 50, X1 - 50]) a.cyl(x, YB - 100, Z0, clr + 10, 22, 10);   // pilasters
    for (const x of [dx0 + 10]) { a.cyl(x, YF + 30, Z0, clr, 14, 8); a.cyl(dx1 - 10, YF + 30, Z0, clr, 14, 8); }
    a.box(X0, YF + 150, Z1 - 100, X1, YB, Z1 - 90); a.arc(dx1, YF, dx1 - dx0, 180, 270); a.line(dx1, YF, dx1, YF - (dx1 - dx0), 'EQUIP-SWING');
    a.clear('door swing', dx0, YF - (dx1 - dx0), dx1, YF, 80); a.log('Added the side and rear panels, the in-swinging door with latch and hinges, and the floor-mounted pilasters (plan and 3D).');
  }],
  [/urinal privacy screen/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YF, YB, 0.0 + 2); a.log('Added the wall-hung screen panel (plan and 3D).'); }],
  [/ADA lockers, two-tier/i, (a) => { cab(a, { toe: 100, doors: 2, louver: true, lock: true, pull: 'none' }); const { X0, X1, YF, Z0, Z1 } = a; a.log('Added two vented locker doors with locks and the toe kick (plan and 3D).'); }],
  [/waste and recycling station/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 60);
    for (let i = 0; i < 3; i++) { const x0 = X0 + (i * W) / 3 + 15, x1 = X0 + ((i + 1) * W) / 3 - 15; a.box(x0, YF + 30, Z0 + 60, x1, YB - 30, Z1 - 150); a.box(x0 - 5, YF + 20, Z1 - 150, x1 + 5, YB - 20, Z1 - 110); const hx = (x0 + x1) / 2; a.ell(hx, YF + 10, Z1 - 250, (x1 - x0) / 2 - 25, 5, 100, 14, 6); a.rect(x0 - 5, YF + 20, x1 + 5, YB - 20, 'EQUIP-DETAIL'); a.circ(hx, a.cy, 80, 'EQUIP-DETAIL'); }
    a.box(X0, YB - 40, Z0 + 60, X1, YB, Z1); a.log('Added the base, three bins with lids and openings, and the rear panel (plan and 3D).');
  }],
  [/AED cabinet/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YB - 50, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YF, YB - 50, 25); a.box(X0 + 25, YF + 6, Z0 + 25, X1 - 25, YF + 10, Z1 - 25); a.box(X0 + 90, YF - 8, Z0 + 150, X1 - 90, YF, Z0 + 215); a.log('Added the cabinet frame, the clear door and the alarm handle (plan and 3D).'); }],
  [/blade sign/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YB - 40, Z0, X1, YB, Z0 + 50); a.box(X0, YB - 40, Z1 - 50, X1, YB, Z1); a.box(X0 + 20, YB - 40, Z0, X0 + 120, YB, Z1); a.box(X0 + 20, YF, Z0 + 50, X1 - 20, YB - 40, Z1 - 50); a.log('Added the wall bracket and the double-face sign cabinet (plan and 3D).'); }],
  [/digital signage kiosk/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 40); a.box(X0 + 60, YF + 80, Z0 + 40, X1 - 60, YB - 40, Z0 + 500);
    a.box(X0 + 20, YB - 180, Z0 + 500, X1 - 20, YB - 60, Z1); a.box(X0 + 40, YB - 195, Z0 + 600, X1 - 40, YB - 180, Z1 - 60); a.box(X0 + 55, YB - 192, Z0 + 615, X1 - 55, YB - 190, Z1 - 75);
    a.rect(X0 + 60, YF + 80, X1 - 60, YB - 40, 'EQUIP-DETAIL'); a.log('Added the base, lower cabinet, the portrait display with bezel and the rear housing (plan and 3D).');
  }],
  [/information kiosk/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 40); a.box(X0 + 50, YB - 300, Z0 + 40, X1 - 50, YB - 40, Z0 + 1000);
    a.prism([[X0 + 30, YF + 30], [X1 - 30, YF + 30], [X1 - 30, YB - 60], [X0 + 30, YB - 60]], Z0 + 1000, Z0 + 1040);
    a.box(X0 + 60, YB - 330, Z0 + 1040, X1 - 60, YB - 280, Z1); a.box(X0 + 70, YB - 335, Z0 + 1060, X1 - 70, YB - 330, Z1 - 20); a.rect(X0 + 30, YF + 30, X1 - 30, YB - 60, 'EQUIP-DETAIL');
    a.log('Added the base, the pedestal, the shelf and the tilted touch screen (plan and 3D).');
  }],
  [/coat check counter/i, (a) => { cab(a, { toe: 100, doors: 4, pull: 'recess', topT: 45, splash: { h: 150, t: 300 } }); a.log('Added the counter with a raised half-door ledge, four doors and the toe kick (plan and 3D).'); }],
  [/shopping cart corral/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 120);
    for (const x of [X0, X1 - 40]) { a.box(x, YF, Z0 + 120, x + 40, YB, Z0 + 160); for (const y of [YF + 30, a.cy, YB - 70]) a.box(x + 5, y, Z0 + 160, x + 35, y + 40, Z1); }
    for (const z of [Z0 + 500, Z1 - 60]) { a.box(X0, YF, z, X0 + 40, YB, z + 40); a.box(X1 - 40, YF, z, X1, YB, z + 40); }
    a.box(X0, YB - 40, Z0 + 160, X1, YB, Z1 - 20); a.log('Added the curb base, the two side rails on posts and the back rail (plan and 3D).');
  }],
  [/baggage cart/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF + 20, Z0 + 130, X1, YB - 120, Z0 + 170); a.box(X0, YB - 120, Z0 + 130, X1, YB - 100, Z1);
    for (const x of [X0 + 20, X1 - 20]) { a.tube([[x, YB - 110, Z0 + 140], [x, YB - 110, Z1]], [14, 14], 8); a.tube([[x, YB - 110, Z1], [x, YB - 200, Z1 - 20]], [14, 14], 8); a.caster(x, YF + 60, 110); a.caster(x, YB - 90, 110); }
    a.xcyl(X0 + 10, X1 - 10, YB - 160, Z1 - 20, 14, 8); a.log('Added the deck, the back frame with handle and four casters (plan and 3D).');
  }],
  [/wheelchair, folding/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); const sz = Z0 + 480;
    for (const x of [X0 + 25, X1 - 25]) { a.xcyl(x - 12, x + 12, YB - 150, Z0 + 305, 305, 24); a.circ(x, YB - 150, 305 * 0 + 12, 'EQUIP-DETAIL'); a.xcyl(x - 8, x + 8, YF + 90, Z0 + 100, 100, 14); a.tube([[x, YB - 150, Z0 + 305], [x, YF + 100, sz - 40]], [8, 8], 6); a.tube([[x, YB - 110, sz + 20], [x, YB - 110, Z1]], [10, 10], 6); a.box(x - 25, YF + 200, sz + 150, x + 25, YB - 160, sz + 180); a.tube([[x, YF + 90, Z0 + 100], [x, YF + 30, Z0 + 150]], [9, 9], 6); a.box(x - 40, YF + 0, Z0 + 140, x + 40, YF + 90, Z0 + 160); }
    a.box(X0 + 40, YF + 80, sz, X1 - 40, YB - 120, sz + 25); a.box(X0 + 40, YB - 125, sz + 25, X1 - 40, YB - 105, Z1 - 80);
    a.rect(X0 + 40, YF + 80, X1 - 40, YB - 120, 'EQUIP-DETAIL'); a.log('Added two large rear wheels with push rims, the front casters, the seat, back sling, armrests and footplates (plan and 3D).');
  }],
  [/stretcher/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a, dz = Z0 + 760; a.outline();
    a.box(X0 + 120, YF + 200, Z0 + 150, X1 - 120, YB - 200, dz - 80); for (const [x, y] of [[X0 + 90, YF + 130], [X1 - 90, YF + 130], [X0 + 90, YB - 130], [X1 - 90, YB - 130]]) { a.caster(x, y, 140); a.circ(x, y, 50, 'EQUIP-HIDDEN'); }
    a.box(X0 + 20, YF + 40, dz - 80, X1 - 20, YB - 40, dz); cushion2(a, X0 + 30, YF + 50, X1 - 30, YB - 50, dz, dz + 90);
    for (const x of [X0, X1 - 25]) a.box(x, YF + 400, dz + 90, x + 25, YB - 500, dz + 330);
    a.rect(X0 + 20, YF + 40, X1 - 20, YB - 40, 'EQUIP-DETAIL'); a.log('Added the undercarriage with four casters, the deck, the mattress and the folding side rails (plan and 3D).');
  }],
  [/evacuation chair/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); const sz = Z0 + 460;
    for (const x of [X0 + 25, X1 - 25]) { a.box(x - 20, YB - 100, Z0 + 140, x + 20, YB - 60, Z1 - 100); a.box(x - 25, YF + 20, Z0 + 20, x + 25, YB - 60, Z0 + 140); a.xcyl(x - 25, x + 25, YF + 60, Z0 + 60, 50, 12); a.box(x - 20, YF + 10, sz - 30, x + 20, YB - 60, sz); }
    a.box(X0 + 50, YF + 40, sz - 10, X1 - 50, YB - 120, sz + 20); a.box(X0 + 50, YB - 130, sz + 20, X1 - 50, YB - 90, Z1 - 100); a.box(X0 + 30, YB - 125, Z1 - 100, X1 - 30, YB - 90, Z1);
    a.line(X0 + 25, YF + 20, X0 + 25, YB - 60, 'EQUIP-DETAIL'); a.line(X1 - 25, YF + 20, X1 - 25, YB - 60, 'EQUIP-DETAIL'); a.log('Added the two tracks, the seat, the back with grab handles and the side frame (plan and 3D).');
  }],
  [/panic bar/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YB - 40, Z0, X1, YB, Z1 + 4); a.box(X0 + 40, YB - 100, Z0 - 20 + 40, X1 - 40, YB - 40, Z1 + 4); a.box(X0 + 160, YF, Z0 - 10, X1 - 120, YB - 100, Z1 + 10);
    for (const x of [X0 + 60, X1 - 60]) a.box(x - 20, YB - 100, Z0, x + 20, YB - 40, Z1); a.log('Added the mounting rail, the end housings and the push bar (plan and 3D).');
  }],
  [/parking pay station/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0 + 30, YF + 20, Z0 + 60, X1 - 30, YB - 20, Z1 - 150);
    a.box(X0 + 20, YF, Z1 - 450, X1 - 20, YF + 20, Z1 - 150); a.box(X0 + 60, YF - 20, Z1 - 420, X1 - 60, YF, Z1 - 330); a.box(X0 + 60, YF - 10, Z1 - 300, X1 - 60, YF, Z1 - 200);
    a.prism([[X0 + 10, YF + 10], [X1 - 10, YF + 10], [X1 - 10, YB - 10], [X0 + 10, YB - 10]], Z1 - 150, Z1); a.box(cx - 30, YF, Z0 + 700, cx + 30, YF + 20, Z0 + 740); a.rect(X0 + 30, YF + 20, X1 - 30, YB - 20, 'EQUIP-DETAIL');
    a.log('Added the base plate, the cabinet, the screen and card slot panel, the ticket slot and the roofed top (plan and 3D).');
  }],
];
export function cushion2(a, x0, y0, x1, y1, z0, z1) { a.box(x0, y0, z0, x1, y1, z0 + (z1 - z0) * 0.5); a.ell((x0 + x1) / 2, (y0 + y1) / 2, z0 + (z1 - z0) * 0.5, (x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) * 0.5, 14, 5); }

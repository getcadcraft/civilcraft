/* SPDX-License-Identifier: Apache-2.0 */
/** Commercial site items (site-3.csv: landscape + vehicles) and people (people-3.csv). Original geometry; people are generic scale figures. */
import { cab, T, GAP } from './com-core.mjs';
import { figure2 } from './figure.mjs';

export function post(a, x, y, z0, z1, r = 20) { a.cyl(x, y, z0, z1, r, 10); }
export function wheels(a, ys, r, W, inset = 0) { for (const y of ys) for (const x of [a.X0 + 20 + inset, a.X1 - 20 - inset]) { a.xcyl(x - 120, x + 120, y, a.Z0 + r, r, 18); a.rect(x - 120, y - r, x + 120, y + r, 'EQUIP-DETAIL'); } }

/** A road vehicle from a cab block, a body block and wheels. Front at −Y. */
export function vehicle(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const cabL = o.cab, wr = o.wheel ?? 400, gz = Z0 + (o.ground ?? 300);
  a.box(X0 + 30, YF, gz, X1 - 30, YB, gz + (o.sill ?? 300));   // chassis
  // cab
  a.prism([[X0 + 20, YF + 80], [X1 - 20, YF + 80], [X1 - 20, YF + cabL], [X0 + 20, YF + cabL]], gz + 150, Z0 + (o.cabH ?? 1500));
  a.box(X0 + 40, YF, gz + 150, X1 - 40, YF + 80, gz + 700);   // hood / nose
  a.frame(X0 + 20, Z0 + 950, X1 - 20, Z0 + (o.cabH ?? 1500) - 80, YF + 80, YF + 90, 40);   // windshield
  a.box(X0 + 15, YF + cabL * 0.4, Z0 + 1000, X0 + 22, YF + cabL * 0.85, Z0 + 1400); a.box(X1 - 22, YF + cabL * 0.4, Z0 + 1000, X1 - 15, YF + cabL * 0.85, Z0 + 1400);   // side glass
  if (o.box) { a.box(X0 + 5, YF + cabL + 40, gz + 200, X1 - 5, YB, Z1); a.line(X0 + 5, YF + cabL + 40, X1 - 5, YF + cabL + 40); for (let y = YF + cabL + 400; y < YB - 100; y += 400) a.line(X0 + 5, y, X1 - 5, y, 'EQUIP-DETAIL'); }
  if (o.roofline) { a.box(X0 + 20, YF + 40 + cabL * 0.4, gz + 150, X1 - 20, YB - 20, Z1); }
  if (o.bar) { a.box(X0 + 120, YF + cabL + 120, Z0 + (o.cabH ?? 1500), X1 - 120, YF + cabL + 180, Z0 + (o.cabH ?? 1500) + 60); }
  for (const y of o.axles) { for (const x of [X0 + 120, X1 - 120]) { a.xcyl(x - 130, x + 130, y, Z0 + wr, wr, 20); a.rect(x - 130, y - wr, x + 130, y + wr, 'EQUIP-DETAIL'); } }
  a.box(X0 + 60, YF - 0, gz, X1 - 60, YF + 60, gz + 180);   // bumper
  for (const x of [X0 + 140, X1 - 140]) a.box(x - 60, YF, gz + 600, x + 60, YF + 10, gz + 680);   // lights
  return a;
}

const FIG_H = { stand: 1740, walk: 1740, sit: 1400 };

export function person(a, name, o = {}) {
  const pose = o.pose ?? (/seated|sitting|wheelchair|treadmill|yoga/i.test(name) ? 'sit' : /walk|running|queue|porter|shopper|stroller|backpack|laptop bag|carrier|delivery|student/i.test(name) ? 'walk' : 'stand');
  const hatH = o.hat ? 220 : 0;
  const s = (a.H - 5) / ((FIG_H[pose] + hatH) * 1) ;
  const off = o.dx ?? 0, offy = o.dy ?? 0;
  const f = figure2({ pose, scale: s, cx: a.cx + off, cy: a.cy + offy, hi: !o.lo });
  a.add(f.tris);
  for (const sh of f.plan) {
    if (sh.kind === 'ellipse') a.ellp(sh.x, sh.y, sh.rx, sh.ry); else if (sh.kind === 'circle') a.circ(sh.x, sh.y, sh.r); else if (sh.kind === 'rect') a.rect(sh.x0, sh.y0, sh.x1, sh.y1); else if (sh.kind === 'line') a.line(sh.x1, sh.y1, sh.x2, sh.y2);
  }
  const hz = a.Z0 + (FIG_H[pose] - 110) * s, hx = a.cx + off, hy = a.cy + offy;
  if (o.hat === 'toque') { a.cyl(hx, hy, hz - 20 * s, hz + 120 * s, 105 * s, 16); a.ell(hx, hy, hz + 120 * s, 130 * s, 130 * s, 90 * s, 16, 6); }
  if (o.hat === 'cap') { a.cyl(hx, hy, hz - 10 * s, hz + 60 * s, 100 * s, 16); a.box(hx - 90 * s, hy - 190 * s, hz - 5 * s, hx + 90 * s, hy - 90 * s, hz + 15 * s); }
  if (o.hat === 'hardhat') { a.ell(hx, hy, hz + 10 * s, 120 * s, 130 * s, 90 * s, 16, 6); a.box(hx - 130 * s, hy - 160 * s, hz + 5 * s, hx + 130 * s, hy + 130 * s, hz + 22 * s); }
  const counter = (h) => { a.box(hx - 450 * s, hy - 700 * s, a.Z0, hx + 450 * s, hy - 480 * s, a.Z0 + h * s); a.box(hx - 470 * s, hy - 720 * s, a.Z0 + h * s, hx + 470 * s, hy - 460 * s, a.Z0 + (h + 30) * s); a.rect(hx - 470 * s, hy - 720 * s, hx + 470 * s, hy - 460 * s); };
  if (o.counter) counter(o.counter);
  if (o.board) { a.box(hx - 900 * s, a.YB - 30, a.Z0 + 800 * s, hx + 900 * s, a.YB - 10, a.Z0 + 1800 * s); a.rect(hx - 900 * s, a.YB - 30, hx + 900 * s, a.YB - 10); }
  if (o.phone) a.box(hx + 100 * s, hy - 110 * s, hz - 160 * s, hx + 190 * s, hy - 90 * s, hz - 20 * s);
  if (o.child) { const c = figure2({ pose: 'stand', scale: 0.33 * s * 1.0, cx: hx, cy: hy - 420 * s, hi: false }); a.add(c.tris); for (const sh of c.plan) { if (sh.kind === 'ellipse') a.ellp(sh.x, sh.y, sh.rx, sh.ry); else if (sh.kind === 'circle') a.circ(sh.x, sh.y, sh.r); else if (sh.kind === 'rect') a.rect(sh.x0, sh.y0, sh.x1, sh.y1); else if (sh.kind === 'line') a.line(sh.x1, sh.y1, sh.x2, sh.y2); } }
  const hand = [hx + 250 * s, hy - 150 * s, a.Z0 + 1000 * s];
  if (o.tray) { a.cyl(hand[0] - 60 * s, hand[1] - 30 * s, hand[2] + 380 * s, hand[2] + 400 * s, 190 * s, 20); a.circ(hand[0] - 60 * s, hand[1] - 30 * s, 190 * s, 'EQUIP-DETAIL'); }
  if (o.box) a.box(hx - 200 * s, hy - 420 * s, a.Z0 + 950 * s, hx + 200 * s, hy - 120 * s, a.Z0 + 1250 * s);
  if (o.clipboard) a.box(hand[0] - 130 * s, hand[1] - 40 * s, hand[2] - 20 * s, hand[0] + 110 * s, hand[1] - 25 * s, hand[2] + 280 * s);
  if (o.mop) { a.cyl(hand[0], hand[1] - 40 * s, a.Z0, a.Z0 + 1700 * s, 14 * s, 8); a.box(hand[0] - 90 * s, hand[1] - 120 * s, a.Z0, hand[0] + 90 * s, hand[1] + 40 * s, a.Z0 + 60 * s); a.cyl(hx - 450 * s, hy - 150 * s, a.Z0, a.Z0 + 280 * s, 150 * s, 14); }
  if (o.backpack) a.box(hx - 150 * s, hy + 110 * s, a.Z0 + 950 * s, hx + 150 * s, hy + 330 * s, a.Z0 + 1450 * s);
  if (o.bag) a.box(hand[0] + 40 * s, hand[1] + 40 * s, a.Z0 + 640 * s, hand[0] + 300 * s, hand[1] + 140 * s, a.Z0 + 900 * s);
  if (o.cart) { const y0 = hy - 1000 * s; a.box(hx - 280 * s, y0, a.Z0 + 400 * s, hx + 280 * s, y0 + 760 * s, a.Z0 + 420 * s); for (const x of [hx - 280 * s, hx + 270 * s]) a.box(x, y0, a.Z0 + 420 * s, x + 10 * s, y0 + 760 * s, a.Z0 + 800 * s); a.box(hx - 280 * s, y0 + 750 * s, a.Z0 + 420 * s, hx + 280 * s, y0 + 760 * s, a.Z0 + 800 * s); for (const [x, y] of [[hx - 250 * s, y0 + 40 * s], [hx + 250 * s, y0 + 40 * s], [hx - 250 * s, y0 + 700 * s], [hx + 250 * s, y0 + 700 * s]]) a.xcyl(x - 10, x + 10, y, a.Z0 + 60 * s, 60 * s, 10); a.rect(hx - 280 * s, y0, hx + 280 * s, y0 + 760 * s); }
  return a;
}

export const SITE = [
  [/bus shelter/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); for (const x of [X0 + 60, X1 - 60]) { post(a, x, YB - 60, Z0, Z1 - 100, 40); post(a, x, YF + 120, Z0, Z1 - 100, 40); }
    a.box(X0 - 0, YF, Z1 - 100, X1, YB, Z1); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.frame(X0 + 60, Z0 + 300, X1 - 60, Z1 - 100, YB - 70, YB - 50, 40); a.box(X0 + 100, YB - 62, Z0 + 340, X1 - 100, YB - 58, Z1 - 140); for (const x of [X0 + 60, X1 - 60]) a.frame(x - 20, Z0 + 300, x + 20, Z1 - 100, YF + 100, YF + 120, 0.5);
    a.box(X0 + 200, YB - 500, Z0 + 440, X1 - 200, YB - 80, Z0 + 470); for (const x of [X0 + 260, X1 - 260]) a.box(x - 15, YB - 450, Z0, x + 15, YB - 120, Z0 + 440); a.log('Added the posts, the flat roof, the glazed back panel, end screens and the slatted bench (plan and 3D).'); }],
  [/bicycle shelter/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); for (const x of [X0 + 60, X0 + W * 0.5, X1 - 60]) { post(a, x, YB - 60, Z0, Z1, 40); post(a, x, YF + 60, Z0, Z1 - 250, 40); }
    a.prism([[X0, YF], [X1, YF], [X1, YB], [X0, YB]], Z1 - 120, Z1 - 100); a.box(X0, YF, Z1 - 100, X1, YB, Z1 - 80); a.line(X0, a.cy, X1, a.cy, 'EQUIP-DETAIL');
    for (let i = 0; i < 12; i++) { const x = X0 + 150 + i * (W - 300) / 11; a.tube([[x, YB - 100, Z0], [x, YB - 100, Z0 + 400], [x, YB - 500, Z0 + 400], [x, YB - 500, Z0]], [14, 14, 14, 14], 8); a.circ(x, a.cy, 14, 'EQUIP-DETAIL'); }
    a.log('Added the posts, the roof deck and twelve loop racks (plan and 3D).'); }],
  [/covered walkway/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, D } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 20);
    for (let y = YF + 200; y < YB; y += 3050) { for (const x of [X0 + 100, X1 - 100]) { post(a, x, y, Z0 + 20, Z1 - 200, 50); a.circ(x, y, 50, 'EQUIP'); } a.box(X0, y - 50, Z1 - 200, X1, y + 50, Z1 - 100); }
    a.prism([[X0 - 0, YF], [X1, YF], [X1, YB], [X0, YB]], Z1 - 100, Z1); a.line(X0, YF, X0, YB, 'EQUIP-DETAIL'); a.log('Added the slab, columns every 10 ft, the cross beams and the roof canopy (plan and 3D).'); }],
  [/dumpster enclosure/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W } = a, t = 200; a.outline(); a.box(X0, YB - t, Z0, X1, YB, Z1); a.box(X0, YF + 200, Z0, X0 + t, YB - t, Z1); a.box(X1 - t, YF + 200, Z0, X1, YB - t, Z1);
    for (const x of [X0, X1 - t]) a.box(x - 0, YF + 200, Z1, x + t, YB, Z1 + 80); a.box(X0, YB - t, Z1, X1, YB, Z1 + 80);
    const gw = (W - 2 * 100) / 2; for (const [g0, g1, hin] of [[X0 + 100, X0 + 100 + gw, 'L'], [X1 - 100 - gw, X1 - 100, 'R']]) { a.frame(g0, Z0 + 100, g1, Z1 - 100, YF + 150, YF + 190, 60); for (let z = Z0 + 300; z < Z1 - 150; z += 300) a.box(g0 + 60, YF + 160, z, g1 - 60, YF + 180, z + 40); a.line(hin === 'L' ? g0 : g1, YF + 170, hin === 'L' ? g0 : g1, YF + 170 - gw, 'EQUIP-SWING'); a.arc(hin === 'L' ? g0 : g1, YF + 170, gw, hin === 'L' ? 270 : 180, hin === 'L' ? 360 : 270); }
    a.box(X0 + t, YF + 300, Z0, X1 - t, YF + 360, Z0 + 150); a.log('Added the three masonry walls with caps, the two-leaf steel gate with swings and the curb stop (plan and 3D).'); }],
  [/dumpster, 8 yd/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0 + 150, X1, YB, Z1 - 80); a.prism([[X0 - 0, YF], [X1, YF], [X1 - 30, YB - 400], [X0 + 30, YB - 400]], Z1 - 80, Z1 - 60); a.box(X0, YB - 600, Z1 - 60, X1, YB, Z1);
    for (const x of [X0 + 300, X1 - 380]) a.box(x, YF - 10, Z0 + 150, x + 80, YB + 0, Z0 + 330); for (const x of [X0 + 100, X1 - 100]) a.box(x - 40, YF, Z0, x + 40, YB, Z0 + 150);
    for (let y = YF + 250; y < YB - 200; y += 500) a.box(X0 - 8, y, Z0 + 250, X0, y + 40, Z1 - 120); a.line(X0, YB - 600, X1, YB - 600, 'EQUIP-DETAIL'); a.log('Added the skids, the steel body with ribs, the fork pockets and the hinged lid (plan and 3D).'); }],
  [/security bollard/i, (a) => { const { X0, X1, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.circ(cx, cy, r); a.cyl(cx, cy, Z0, Z1 - 60, r, 22); a.cone(cx, cy, Z1 - 60, Z1, r, r * 0.6, 22); a.cyl(cx, cy, Z0 + 600, Z0 + 680, r + 4, 22); a.circ(cx, cy, r * 0.6, 'EQUIP-DETAIL'); a.cyl(cx, cy, Z0, Z0 + 20, r + 60, 22); a.log('Added the steel shaft with reflective band, the domed cap and the base ring (plan and 3D).'); }],
  [/ADA parking space/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, sw = 2743; a.outline(); a.box(X0, YF, Z0, X1, YB, Z1);
    a.rect(X0, YF, X0 + sw, YB, 'EQUIP'); a.rect(X0 + sw, YF, X1, YB, 'EQUIP'); for (let d = -a.D; d < a.D; d += 150) { const xa = X0 + sw + 20, xb = X1 - 20; a.line(xa, YF + 400, xb, YF + 400 + (xb - xa) * 0.0, 'EQUIP-DETAIL'); } for (let k = 0; k < 8; k++) a.line(X0 + sw + 40, YF + 300 + k * 450, X1 - 40, YF + 300 + k * 450 + 250, 'EQUIP-DETAIL');
    a.circ(X0 + sw / 2, YB - 1100, 450, 'EQUIP-DETAIL'); a.line(X0 + sw / 2 - 150, YB - 1100, X0 + sw / 2 + 150, YB - 1100, 'EQUIP-DETAIL'); post(a, X0 + 100, YF + 300, Z0, Z0 + 2200, 30); a.box(X0 + 60, YF + 280, Z0 + 1800, X0 + 340, YF + 320, Z0 + 2300);
    a.log('Added the stall and access aisle with hatching, the symbol and the post sign (plan and 3D).'); }],
  [/EV charging stall/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z1); a.line(X0, YF, X0, YB); a.line(X1, YF, X1, YB); a.box(cx - 800, YB - 500, Z1, cx + 800, YB - 400, Z1 + 100); a.rect(cx - 800, YB - 500, cx + 800, YB - 400, 'EQUIP-DETAIL');
    a.box(X1 - 300, YF + 300, Z0, X1 - 200, YF + 400, Z0 + 1200); a.box(X1 - 340, YF + 280, Z0 + 1000, X1 - 160, YF + 420, Z0 + 1300); a.circ(a.cx, a.cy, 300, 'EQUIP-DETAIL'); a.line(cx - 90, a.cy - 90, cx + 90, a.cy + 90, 'EQUIP-DETAIL'); a.log('Added the stall marking, the wheel stop, the charge post and the symbol (plan and 3D).'); }],
  [/parking area light pole/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(cx - 220, cy - 220, Z0, cx + 220, cy + 220, Z0 + 750); a.cone(cx, cy, Z0 + 750, Z1 - 30, 70, 45, 6); a.circ(cx, cy, 70, 'EQUIP-DETAIL');
    for (const s of [-1, 1]) { a.tube([[cx, cy, Z1 - 150], [cx + s * 300, cy, Z1 - 100], [cx + s * 520, cy, Z1 - 140]], [30, 25, 25], 8); a.prism([[cx + s * 420 - 250, cy - 150], [cx + s * 420 + 250, cy - 150], [cx + s * 420 + 250, cy + 150], [cx + s * 420 - 250, cy + 150]], Z1 - 200, Z1 - 140); }
    a.log('Added the base, the tapered pole and two arm-mounted area luminaires (plan and 3D).'); }],
  [/flagpole/i, (a) => { const { X0, X1, Z0, Z1, cx, cy } = a; a.circ(cx, cy, (X1 - X0) / 2); a.cyl(cx, cy, Z0, Z0 + 100, (X1 - X0) / 2 * 1, 20); a.cone(cx, cy, Z0 + 100, Z1 - 150, 90, 40, 12); a.ell(cx, cy, Z1 - 100, 60, 60, 60, 12, 6); a.box(cx + 70, cy - 20, Z1 - 1600, cx + 1200, cy + 20, Z1 - 600); a.cyl(cx + 80, cy, Z0 + 1500, Z0 + 1520, 4, 4); a.log('Added the base plate, the tapered pole, the ball finial and the flag (plan and 3D).'); }],
  [/monument sign/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 500); a.box(X0 - 0, YF, Z0 + 500, X1, YB, Z0 + 560); a.box(X0 + 100, YF + 60, Z0 + 560, X1 - 100, YB - 60, Z1 - 60); a.box(X0 + 80, YF + 40, Z1 - 60, X1 - 80, YB - 40, Z1); a.rect(X0 + 100, YF + 60, X1 - 100, YB - 60, 'EQUIP-DETAIL'); for (const x of [X0 + 300, X1 - 300]) a.cyl(x, YF + 50, Z0 + 500, Z0 + 600, 40, 10); a.log('Added the masonry base and cap, the sign panel with its frame and the two ground lights (plan and 3D).'); }],
  [/pylon sign/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.cyl(cx, cy, Z0, Z0 + 500, 500, 20); a.cyl(cx, cy, Z0 + 500, Z1 - 3500, 280, 20); a.circ(cx, cy, 280, 'EQUIP-DETAIL'); a.box(X0, YF, Z1 - 3500, X1, YB, Z1 - 2200); a.box(X0 - 0, YF + 20, Z1 - 2200, X1, YB - 20, Z1 - 100); a.box(X0 + 20, YF, Z1 - 3450, X1 - 20, YF + 10, Z1 - 2250); a.box(X0 + 20, YB - 10, Z1 - 3450, X1 - 20, YB, Z1 - 2250); a.box(X0, YF + 10, Z1 - 100, X1, YB - 10, Z1); a.log('Added the foundation collar, the steel pole, the lower and upper sign cabinets with faces (plan and 3D).'); }],
  [/outdoor dining table with umbrella/i, (a) => { const { X0, X1, Z0, Z1, cx, cy, W } = a; a.circ(cx, cy, W / 2, 'EQUIP-HIDDEN'); a.circ(cx, cy, 380); a.ell(cx, cy, Z0 + 740, 380, 380, 20, 22, 4); a.cone(cx, cy, Z0, Z0 + 720, 50, 50, 10); a.cyl(cx, cy, Z0 + 720, Z1 - 450, 25, 8); a.cone(cx, cy, Z1 - 450, Z1, 1100, 15, 24); a.circ(cx, cy, 1100, 'EQUIP-DETAIL');
    for (let i = 0; i < 4; i++) { const g = (i / 4) * Math.PI * 2 + 0.78, x = cx + Math.cos(g) * 640, y = cy + Math.sin(g) * 640; a.box(x - 220, y - 220, Z0 + 440, x + 220, y + 220, Z0 + 470); for (const [dx, dy] of [[-200, -200], [200, -200], [-200, 200], [200, 200]]) a.cyl(x + dx, y + dy, Z0, Z0 + 440, 12, 6); a.box(x - 220, y + (Math.sin(g) > 0 ? 200 : -220), Z0 + 470, x + 220, y + (Math.sin(g) > 0 ? 220 : -200), Z0 + 900); a.rect(x - 220, y - 220, x + 220, y + 220, 'EQUIP-DETAIL'); }
    a.log('Added the round table, the center pole and umbrella canopy, and four chairs around it (plan and 3D).'); }],
  [/patio heater/i, (a) => { const { X0, X1, Z0, Z1, cx, cy } = a; a.circ(cx, cy, (X1 - X0) / 2); a.cyl(cx, cy, Z0, Z0 + 80, (X1 - X0) / 2 * 0.9, 20); a.cyl(cx, cy, Z0 + 80, Z1 - 450, 35, 12); a.cyl(cx, cy, Z1 - 450, Z1 - 250, 85, 16); a.cone(cx, cy, Z1 - 250, Z1, 90, 380, 22); a.circ(cx, cy, 380, 'EQUIP-DETAIL'); a.box(cx + 36, cy - 10, Z0 + 1000, cx + 100, cy + 10, Z0 + 1120); a.log('Added the weighted base, the stem with a control, the burner and the reflector dome (plan and 3D).'); }],
  [/long planter, 8 ft/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); for (const [x0, y0, x1, y1] of [[X0, YF, X1, YF + 80], [X0, YB - 80, X1, YB], [X0, YF + 80, X0 + 80, YB - 80], [X1 - 80, YF + 80, X1, YB - 80]]) a.box(x0, y0, Z0, x1, y1, Z1); a.box(X0 + 80, YF + 80, Z0, X1 - 80, YB - 80, Z1 - 140); a.rect(X0 + 80, YF + 80, X1 - 80, YB - 80, 'EQUIP-DETAIL');
    for (let i = 0; i < 6; i++) a.ell(X0 + 250 + i * (W - 500) / 5, a.cy, Z1 - 80, 160, 200, 200, 12, 6); a.log('Added the concrete walls, the soil line and a row of plants (plan and 3D).'); }],
  [/tree grate/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.frame(X0, Z0, X1, Z1, YF, YB, 0.01); a.box(X0, YF, Z0, X1, YB, Z1); a.circ(cx, cy, 380, 'EQUIP-DETAIL'); a.circ(cx, cy, 300, 'EQUIP-DETAIL'); for (let i = 1; i < 8; i++) a.line(X0 + (X1 - X0) * i / 8, YF + 40, X0 + (X1 - X0) * i / 8, YB - 40, 'EQUIP-DETAIL'); a.log('Added the square grate, the round tree opening and the slotted bars (plan and 3D).'); }],
  [/park bench with back/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a, sz = Z0 + 440; a.outline(); for (const x of [X0 + 100, X1 - 160]) { a.box(x, YF + 40, Z0, x + 60, YB - 40, 30); a.box(x, YF + 60, Z0, x + 60, YF + 100, sz); a.box(x, YB - 100, Z0, x + 60, YB - 60, Z1); a.box(x, YF + 40, sz + 100, x + 60, YB - 60, sz + 160); }
    for (let y = YF + 80; y < YB - 280; y += 90) { a.box(X0, y, sz, X1, y + 70, sz + 30); a.line(X0, y, X1, y, 'EQUIP-DETAIL'); } for (let z = sz + 150; z < Z1 - 40; z += 100) a.box(X0, YB - 120, z, X1, YB - 85, z + 80); a.log('Added the cast end frames, the slatted seat, the slatted backrest and the armrests (plan and 3D).'); }],
  [/chain link fence with gate/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); for (const x of [X0 + 50, X0 + W * 0.5, X1 - 50]) post(a, x, a.cy, Z0, Z1, 30); a.xcyl(X0, X1, a.cy, Z1 - 20, 20, 8); a.xcyl(X0, X1, a.cy, Z0 + 100, 12, 8); a.xcyl(X0, X1, a.cy, Z0 + 1200, 12, 8);
    for (let x = X0 + 150; x < X0 + W * 0.5 - 60; x += 70) a.box(x, a.cy - 3, Z0 + 100, x + 4, a.cy + 3, Z1 - 30); a.frame(X0 + W * 0.5 + 30, Z0 + 100, X1 - 80, Z1 - 20, a.cy - 20, a.cy + 20, 40); for (let x = X0 + W * 0.5 + 80; x < X1 - 120; x += 70) a.box(x, a.cy - 3, Z0 + 140, x + 4, a.cy + 3, Z1 - 60);
    a.line(X0 + W * 0.5 + 30, a.cy, X0 + W * 0.5 + 30, a.cy - 900, 'EQUIP-SWING'); a.arc(X0 + W * 0.5 + 30, a.cy, 900, 270, 360); a.log('Added the line posts, rails, mesh and the swing gate with its swing (plan and 3D).'); }],
  [/cantilever sliding gate/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); const gl = W * 0.6;
    a.frame(X0, Z0 + 100, X0 + gl, Z1, cy - 30, cy + 30, 60); for (let x = X0 + 100; x < X0 + gl - 60; x += 120) a.box(x, cy - 10, Z0 + 160, x + 30, cy + 10, Z1 - 60); a.box(X0 + gl, cy - 30, Z0 + 1700, X1, cy + 30, Z0 + 1900); a.box(X0 + gl, cy - 30, Z0 + 1300, X1, cy + 30, Z0 + 1500);
    for (const x of [X0 + gl * 0.3, X0 + gl * 0.75, X0 + gl + 400]) { a.box(x - 100, cy - 100, Z0, x + 100, cy + 100, Z0 + 200); a.xcyl(x - 70, x + 70, cy, Z0 + 260, 60, 14); } post(a, X1 - 50, cy, Z0, Z1, 50); a.line(X0, cy, X1, cy, 'EQUIP-HIDDEN'); a.log('Added the gate frame with pickets, the cantilever tail, the carriage rollers and the receiver post (plan and 3D).'); }],
  [/guard booth/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 150); a.box(X0 + 20, YF + 20, Z0 + 150, X1 - 20, YB - 20, Z1 - 200); a.prism([[X0 - 300, YF - 300], [X1 + 300, YF - 300], [X1 + 300, YB + 300], [X0 - 300, YB + 300]].map(([x, y]) => [Math.max(X0, Math.min(X1, x)), Math.max(YF, Math.min(YB, y))]), Z1 - 200, Z1);
    a.frame(X0 + 100, Z0 + 950, X1 - 100, Z1 - 250, YF, YF + 20, 60); a.frame(X1 - 20, Z0 + 950, X1, Z1 - 250, YF + 200, YB - 200, 0.5); a.box(X0 + W * 0.7, YF - 0, Z0 + 150, X1 - 40, YF + 20, Z0 + 2100); a.line(X0 + W * 0.7, YF, X0 + W * 0.7, YF - 800, 'EQUIP-SWING'); a.arc(X0 + W * 0.7, YF, 800, 270, 360);
    a.box(X0 + 100, YF + 100, Z0 + 150 + 780, X0 + 900, YB - 100, Z0 + 150 + 810); a.log('Added the base, the glazed walls, the counter shelf, the door with swing and the roof overhang (plan and 3D).'); }],
  [/segmental retaining wall/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); const n = 5, sb = 120; for (let i = 0; i < n; i++) { const z0 = Z0 + (i * (Z1 - Z0)) / n, z1 = z0 + (Z1 - Z0) / n; a.box(X0, YB - (D - sb * (n - 1 - i)) , z0, X1, YB, z1); }
    for (let i = 1; i < n; i++) a.line(X0, YB - (D - sb * (n - 1 - i)), X1, YB - (D - sb * (n - 1 - i)), 'EQUIP-DETAIL'); for (let x = X0 + 460; x < X1; x += 460) a.line(x, YB - D + sb * (n - 1), x, YB, 'EQUIP-DETAIL'); a.box(X0, YB - 120, Z1, X1, YB, Z1 + 0.1); a.log('Added five stepped courses (setback 120 mm) with block joints in plan and elevation (plan and 3D).'); }],
  [/bioswale/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); a.prism([[X0, YF], [X1, YF], [X1 - 300, YF + 400], [X0 + 300, YF + 400]], Z0, Z1); a.prism([[X0, YB], [X1, YB], [X1 - 300, YB - 400], [X0 + 300, YB - 400]], Z0, Z1); a.box(X0 + 300, YF + 400, Z0, X1 - 300, YB - 400, Z0 + 60);
    a.rect(X0 + 300, YF + 400, X1 - 300, YB - 400, 'EQUIP-DETAIL'); for (let i = 0; i < 8; i++) a.ell(X0 + 500 + i * (W - 1000) / 7, cy + (i % 2 ? 150 : -150), Z0 + 150, 130, 130, 120, 12, 6); a.box(X1 - 600, cy - 150, Z0, X1 - 300, cy + 150, Z0 + 100); a.log('Added the sloped sides, the flat gravel bottom, the plant clumps and the overflow inlet (plan and 3D).'); }],
  [/gas pump island/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 180); for (let i = 0; i < 2; i++) { const x = X0 + W * (i * 0.5 + 0.25) + 0, x0 = x - 300, x1 = x + 300; a.box(x0, cy - 200, Z0 + 180, x1, cy + 200, Z0 + 1500); a.box(x0 + 40, cy - 215, Z0 + 1000, x1 - 40, cy - 200, Z0 + 1400); a.tube([[x1 + 40, cy, Z0 + 1200], [x1 + 100, cy, Z0 + 700], [x1 + 90, cy, Z0 + 500]], [20, 20, 20], 8); a.rect(x0, cy - 200, x1, cy + 200, 'EQUIP-DETAIL'); }
    for (const x of [X0 + 50, X1 - 50]) { a.cyl(x, YB - 100, Z0 + 180, Z0 + 1200, 30, 10); a.cyl(x, YF + 100, Z0 + 180, Z0 + 1200, 30, 10); } a.log('Added the raised island, two dispensers with display and hose, and the end bollards (plan and 3D).'); }],
  [/drive-through canopy/i, (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); for (const [x, y] of [[X0 + 120, YF + 120], [X1 - 120, YF + 120], [X0 + 120, YB - 120], [X1 - 120, YB - 120]]) { post(a, x, y, Z0, Z1 - 300, 60); a.circ(x, y, 60); } a.box(X0, YF, Z1 - 300, X1, YB, Z1 - 200); a.prism([[X0 - 0, YF], [X1, YF], [X1, YB], [X0, YB]], Z1 - 200, Z1); a.box(X0 + 600, YF + 20, Z0 + 2300, X1 - 600, YF + 60, Z1 - 300); a.line(X0, YF + 600, X1, YF + 600, 'EQUIP-DETAIL'); a.log('Added the four columns, the fascia, the roof deck and the height clearance bar (plan and 3D).'); }],
  [/loading dock, 10 x 10/i, (a) => { const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YB - 200, Z0, X1, YB, Z1 + 1200); a.box(X0, YF, Z0, X0 + 300, YB - 200, Z1); a.box(X1 - 300, YF, Z0, X1, YB - 200, Z1); a.box(X0 + 300, YF + 300, Z0, X1 - 300, YB - 200, Z0 + 1200 * 0 + 40);
    a.rect(X0 + 300, YF, X1 - 300, YB - 200, 'EQUIP-HIDDEN'); for (const x of [X0 + 450, X1 - 450]) a.box(x - 100, YF, Z0 + 800, x + 100, YF + 120, Z0 + 1100); a.frame(X0 + 300, Z0 + 1200, X1 - 300, Z0 + 3400, YB - 200, YB - 180, 80); a.log('Added the recessed bay with side walls, the leveler pit, the two bumpers and the overhead door frame (plan and 3D).'); }],
  [/tractor trailer/i, (a) => { vehicle(a, { cab: 2700, axles: [a.YF + 700, a.YF + 5400, a.YB - 2400, a.YB - 1200], cabH: 3000, wheel: 520, ground: 450, sill: 300, bar: false }); const { X0, X1, YF, YB, Z0, Z1 } = a; a.box(X0 + 5, YF + 3300, Z0 + 1100, X1 - 5, YB, Z1); a.line(X0 + 5, YF + 3300, X1 - 5, YF + 3300); a.box(X0 + 400, YF + 2700, Z0 + 3000, X1 - 400, YF + 2800, Z0 + 3200); a.cyl(a.cx, YF + 3200, Z0 + 1000, Z0 + 1100, 450, 18); a.log('Added the tractor cab, the fifth wheel, the 53 ft trailer box and the tandem axle groups (plan and 3D).'); }],
  [/box truck, 16 ft/i, (a) => { vehicle(a, { cab: 1900, axles: [a.YF + 600, a.YB - 900], cabH: 2000, wheel: 440, ground: 400, sill: 250, box: true }); a.box(a.X0 + 200, a.YB - 20, a.Z0 + 700, a.X1 - 200, a.YB, a.Z1 - 250); a.log('Added the cab, the cargo box with panel seams, the roll-up rear door and the wheels (plan and 3D).'); }],
  [/shuttle bus, 30 ft/i, (a) => { vehicle(a, { cab: 1500, axles: [a.YF + 1100, a.YB - 1100], cabH: 2650, wheel: 450, ground: 450, sill: 350, roofline: true }); const { X0, X1, YF, YB, Z0, Z1 } = a; for (let y = YF + 1800; y < YB - 400; y += 1000) { a.frame(X0 + 0, Z0 + 1350, X0 + 6, Z0 + 2100, y, y + 800, 20); a.frame(X1 - 6, Z0 + 1350, X1, Z0 + 2100, y, y + 800, 20); } a.box(X1 - 6, YF + 300, Z0 + 500, X1, YF + 1100, Z0 + 2100); a.log('Added the cab, the boxed body with a window band, the entry door, roof and wheels (plan and 3D).'); }],
  [/school bus, 40 ft/i, (a) => { vehicle(a, { cab: 2100, axles: [a.YF + 1700, a.YB - 1300], cabH: 2700, wheel: 480, ground: 480, sill: 350, roofline: true }); const { X0, X1, YF, YB, Z0, Z1 } = a; for (let y = YF + 2400; y < YB - 400; y += 900) { a.frame(X0 + 0, Z0 + 1300, X0 + 6, Z0 + 2050, y, y + 700, 20); a.frame(X1 - 6, Z0 + 1300, X1, Z0 + 2050, y, y + 700, 20); } a.box(X0 + 100, YF + 2000, Z0 + 1150, X1 - 100, YF + 2050, Z0 + 1190); a.box(X1 - 6, YF + 300, Z0 + 500, X1, YF + 1100, Z0 + 2100); a.log('Added the hooded nose, the boxed body with window band, the entry door and stop sign arm, roof and wheels (plan and 3D).'); }],
  [/ambulance, 22 ft/i, (a) => { vehicle(a, { cab: 1800, axles: [a.YF + 700, a.YB - 900], cabH: 2200, wheel: 430, ground: 420, sill: 250, box: true }); const { X0, X1, YF, YB, Z0, Z1 } = a; a.box(X0 + 300, YF + 600, Z1, X1 - 300, YF + 760, Z1 + 80); a.box(X0 + 200, YB - 6, Z0 + 700, X0 + 800, YB, Z1 - 300); a.box(X1 - 800, YB - 6, Z0 + 700, X1 - 200, YB, Z1 - 300); a.rect(X0 + 300, YF + 600, X1 - 300, YF + 760, 'EQUIP-DETAIL'); a.log('Added the cab, the patient compartment box, the roof light bar, rear doors and wheels (plan and 3D).'); }],
];

const P = (o) => (a, name) => { person(a, name, o); a.log(`Added a generic ${o.pose ?? 'standing'} figure with its props, built from lofted sections with clothing shells (plan and 3D).`); };
export const PEOPLE = [
  [/head chef in a toque/i, P({ hat: 'toque' })],
  [/server carrying a tray/i, P({ tray: true, pose: 'walk' })],
  [/barista/i, P({ counter: 1000 })],
  [/cashier, seated/i, P({ pose: 'sit', counter: 800, dy: 100 })],
  [/security guard/i, P({ hat: 'cap' })],
  [/nurse, standing/i, P({})],
  [/doctor with a clipboard/i, P({ clipboard: true })],
  [/patient on a gurney/i, (a) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0 + 40, YF + 40, Z0 + 700, X1 - 40, YB - 40, Z0 + 760); for (const [x, y] of [[X0 + 70, YF + 90], [X1 - 70, YF + 90], [X0 + 70, YB - 90], [X1 - 70, YB - 90]]) { a.caster(x, y, 140); a.circ(x, y, 50, 'EQUIP-HIDDEN'); a.cyl(x, y, Z0 + 140, Z0 + 700, 16, 6); }
    a.box(X0 + 60, YF + 400, Z0 + 400, X1 - 60, YB - 400, Z0 + 700); a.box(X0, YF + 40, Z0 + 760, X0 + 20, YB - 40, Z0 + 960); a.box(X1 - 20, YF + 40, Z0 + 760, X1, YB - 40, Z0 + 960);
    a.ell(cx, YB - 230, Z0 + 905, 100, 115, 105, 16, 8); a.ell(cx, YB - 420, Z0 + 850, 200, 190, 100, 16, 8); a.ell(cx, YB - 640, Z0 + 830, 175, 130, 90, 14, 6); a.tube([[cx - 85, YB - 760, Z0 + 820], [cx - 90, a.YF + 520, Z0 + 815]], [90, 55], 10); a.tube([[cx + 85, YB - 760, Z0 + 820], [cx + 90, a.YF + 520, Z0 + 815]], [90, 55], 10); a.box(cx - 230, a.YF + 380, Z0 + 780, cx + 230, YB - 560, Z0 + 850); a.ell(cx, a.cy + 100, Z0 + 835, 230, 820, 55, 16, 4); a.ellp(cx, a.cy + 100, 200, 880); a.ellp(cx, YB - 200, 100, 110); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-DETAIL'); a.log('Added the gurney frame with four casters and side rails, and a reclining figure under a blanket (plan and 3D).');
  }],
  [/teacher at a whiteboard/i, P({ board: true })],
  [/student with a backpack/i, P({ backpack: true })],
  [/construction worker/i, P({ hat: 'hardhat' })],
  [/delivery person with a box/i, P({ box: true })],
  [/janitor with a mop/i, P({ mop: true })],
  [/shopper pushing a cart/i, P({ cart: true })],
  [/queue of three/i, (a, n) => { for (const dy of [-0.3, 0, 0.3]) { const sub = Object.create(a); person(a, n, { dy: dy * a.D / 1.3 * 0.9, lo: true }); } a.log('Added three standing figures one behind the other (plan and 3D).'); }],
  [/long stride/i, P({ pose: 'walk' })],
  [/parent holding a toddler/i, P({ child: true, dy: 150 })],
  [/hotel porter/i, P({ cart: true, hat: 'cap' })],
  [/wheelchair user at a table/i, (a, n) => { const { X0, X1, YF, YB, Z0, cx } = a; person(a, n, { pose: 'sit', dy: -150 }); const y = a.cy - 150; for (const x of [cx - 330, cx + 330]) { a.xcyl(x - 10, x + 10, y + 200, Z0 + 305, 305, 22); a.xcyl(x - 8, x + 8, y - 350, Z0 + 90, 90, 12); a.rect(x - 10, y + 200 - 305, x + 10, y + 200 + 305, 'EQUIP-DETAIL'); } a.box(cx - 280, y - 330, Z0 + 460, cx + 280, y + 200, Z0 + 490); a.box(cx - 300, y + 190, Z0 + 490, cx + 300, y + 220, Z0 + 900); a.log('Added a seated figure in a manual wheelchair with large rear wheels, casters and footplate (plan and 3D).'); }],
  [/seated adult on a phone/i, P({ pose: 'sit', phone: true })],
  [/receptionist, seated/i, P({ pose: 'sit', counter: 740, dy: 100 })],
  [/gym user on a treadmill/i, (a, n) => { const { X0, X1, YF, YB, Z0, cx } = a; person(a, n, { pose: 'walk', dy: 100 }); a.box(X0 + 30, YF + 100, Z0, X1 - 30, YB - 100, Z0 + 180); a.box(X0 + 50, YF + 160, Z0 + 180, X1 - 50, YB - 150, Z0 + 215); a.rect(X0 + 50, YF + 160, X1 - 50, YB - 150, 'EQUIP-DETAIL'); a.box(X0 + 20, YB - 120, Z0 + 180, X1 - 20, YB - 80, Z0 + 1300); a.box(X0 + 40, YB - 120, Z0 + 1300, X1 - 40, YB - 60, Z0 + 1500); a.log('Added a running figure on a treadmill with its belt deck, upright and console (plan and 3D).'); }],
  [/seated person on a yoga mat/i, (a, n) => { const { X0, X1, YF, YB, Z0, cx } = a; a.box(X0, YF, Z0, X1, YB, Z0 + 15); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); person(a, n, { pose: 'sit' }); a.log('Added a seated figure on a yoga mat (plan and 3D).'); }],
  [/adult typing at a laptop/i, (a, n) => { person(a, n, { pose: 'sit' }); a.box(a.cx - 200, a.cy - 520, a.Z0 + 600, a.cx + 200, a.cy - 240, a.Z0 + 620); a.box(a.cx - 200, a.cy - 250, a.Z0 + 620, a.cx + 200, a.cy - 240, a.Z0 + 920); a.log('Added a seated figure with a laptop on a lap-height surface (plan and 3D).'); }],
  [/lecturer at a podium/i, (a, n) => { person(a, n, { dy: 80 }); a.box(a.cx - 300, a.cy - 380, a.Z0, a.cx + 300, a.cy - 160, a.Z0 + 1100); a.box(a.cx - 320, a.cy - 400, a.Z0 + 1100, a.cx + 320, a.cy - 120, a.Z0 + 1150); a.rect(a.cx - 300, a.cy - 380, a.cx + 300, a.cy - 160); a.log('Added a standing figure behind a podium (plan and 3D).'); }],
  [/line cook/i, P({ hat: 'cap' })],
  [/waiter taking an order/i, P({ clipboard: true })],
  [/rolling backpack/i, (a, n) => { person(a, n, { pose: 'walk' }); const x = a.cx + 380, y = a.cy; a.box(x - 100, y - 100, a.Z0 + 120, x + 100, y + 100, a.Z0 + 600); a.tube([[x, y, a.Z0 + 600], [x - 150, y - 100, a.Z0 + 950]], [10, 10], 6); for (const dx of [-80, 80]) a.xcyl(x + dx - 10, x + dx + 10, y + 60, a.Z0 + 50, 50, 10); a.rect(x - 100, y - 100, x + 100, y + 100); a.log('Added a walking figure towing a rolling backpack on a telescoping handle (plan and 3D).'); }],
  [/group of three/i, (a, n) => { for (const dx of [-0.32, 0, 0.32]) person(a, n, { dx: dx * a.W, lo: true }); a.log('Added three standing figures side by side (plan and 3D).'); }],
  [/laptop bag/i, P({ bag: true, pose: 'walk' })],
];

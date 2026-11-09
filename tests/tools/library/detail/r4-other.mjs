/* SPDX-License-Identifier: Apache-2.0 */
/** Round 4, group other (other/other): airport check-in, security, baggage, gate, wayfinding and mall retail equipment, 150 variants. */
import { fam, cab, pull, T, GAP, O } from './r4-kit.mjs';

const CAT = 'other/other';
const IN = 25.4;

// ---- shared pieces -------------------------------------------------------------------------------------------------------------------
/** A screen on the plane y (facing −Y): frame plus panel. */
function screen(a, x0, z0, x1, z1, y, t = 34) { a.frame(x0, z0, x1, z1, y - t, y, 22); a.box(x0 + 22, y - t + 10, z0 + 22, x1 - 22, y - t + 18, z1 - 22); a.rect(x0, y - t, x1, y, 'EQUIP-DETAIL'); }
function quad(a, p, q, r, s) { a.t.push([p, q, r], [p, r, s]); }
/** A hexahedron from 8 corners: bottom (b0..b3) and top (t0..t3), in matching order. */
function hexa(a, b, t) { quad(a, b[0], b[3], b[2], b[1]); quad(a, t[0], t[1], t[2], t[3]); for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; quad(a, b[i], b[j], t[j], t[i]); } }
/** A sloped slab along x from (x0, za) to (x1, zb), thickness t, over y0..y1. */
function ramp(a, x0, x1, y0, y1, za, zb, t) { hexa(a, [[x0, y0, za], [x1, y0, zb], [x1, y1, zb], [x0, y1, za]], [[x0, y0, za + t], [x1, y0, zb + t], [x1, y1, zb + t], [x0, y1, za + t]]); }
/** An annular sector (angles in degrees, centre cx, cy) extruded z0..z1. */
function sector(a, cx, cy, r0, r1, g0, g1, z0, z1, n = 8) {
  for (let i = 0; i < n; i++) {
    const t0 = ((g0 + ((g1 - g0) * i) / n) * Math.PI) / 180, t1 = ((g0 + ((g1 - g0) * (i + 1)) / n) * Math.PI) / 180;
    a.prism([[cx + r0 * Math.cos(t0), cy + r0 * Math.sin(t0)], [cx + r1 * Math.cos(t0), cy + r1 * Math.sin(t0)], [cx + r1 * Math.cos(t1), cy + r1 * Math.sin(t1)], [cx + r0 * Math.cos(t1), cy + r0 * Math.sin(t1)]], z0, z1);
  }
}
function tray(a, x0, y0, x1, y1, z0, z1, t = 6) { a.box(x0, y0, z0, x1, y1, z0 + t); a.box(x0, y0, z0, x0 + t, y1, z1); a.box(x1 - t, y0, z0, x1, y1, z1); a.box(x0, y0, z0, x1, y0 + t, z1); a.box(x0, y1 - t, z0, x1, y1, z1); }
function legs4(a, x0, y0, x1, y1, z0, z1, r = 20) { for (const x of [x0, x1]) for (const y of [y0, y1]) a.leg(x, y, z0, z1, r); }
function rollers(a, x0, x1, y0, y1, z, r = 25, pitch = 85) { for (let x = x0 + pitch / 2; x < x1; x += pitch) a.ycyl(y0, y1, x, z, r, 8); }
function feet(a, pts, h = 16, r = 22) { for (const [x, y] of pts) { a.cyl(x, y, a.Z0, a.Z0 + h, r, 8); a.circ(x, y, r, 'EQUIP-HIDDEN'); } }
function vent(a, x0, z0, x1, z1, y, n = 5) { for (let i = 0; i < n; i++) { const z = z0 + ((z1 - z0) * (i + 0.5)) / n; a.box(x0, y - 3, z - 3, x1, y, z + 3); } }
function lamp(a, x, y, z, c = 8) { a.cyl(x, y, z, z + 5, c, 8); }
function baseplate(a, x0, y0, x1, y1, z0, t) { a.box(x0, y0, z0, x1, y1, z0 + t); a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); }

// ---- check-in -----------------------------------------------------------------------------------------------------------------------
function checkin(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const pw = W * (v.screens === 2 ? 0.86 : 0.7), cw = W * (v.screens === 2 ? 0.34 : 0.4);
  baseplate(a, X0, YF, X1, YB, Z0, 30);
  const hz = Z0 + (Z1 - Z0) * (v.low ? 0.5 : 0.56);
  a.box(cx - cw / 2, YB - D * 0.62, Z0 + 30, cx + cw / 2, YB - D * 0.08, hz);                // column
  a.box(cx - pw / 2, YB - D * 0.7, hz, cx + pw / 2, YB - D * 0.05, Z1);                      // head
  a.rect(cx - cw / 2, YB - D * 0.62, cx + cw / 2, YB - D * 0.08, 'EQUIP-DETAIL');
  const fy = YB - D * 0.7;
  for (let i = 0; i < v.screens; i++) { const sw = (pw - 60) / v.screens; screen(a, cx - pw / 2 + 30 + i * sw + (i ? 10 : 0), hz + 120, cx - pw / 2 + 30 + (i + 1) * sw - (i < v.screens - 1 ? 10 : 0), Z1 - 60, fy, 30); }
  a.box(cx - pw / 2 + 30, fy - 8, hz + 20, cx + pw / 2 - 30, fy, hz + 100);                   // reader strip
  a.box(cx - 70, fy - 60, hz + 5, cx + 70, fy - 8, hz + 18);                                  // shelf under the screen
  if (v.printer) { a.box(cx - 150, YF + D * 0.18, hz - 260, cx + 150, fy - 10, hz - 160); a.box(cx - 130, YF + D * 0.16, hz - 245, cx + 130, YF + D * 0.18, hz - 232); a.rect(cx - 150, YF + D * 0.18, cx + 150, fy - 10, 'EQUIP-DETAIL'); }
  if (v.passport) { a.box(cx + pw * 0.15, fy - 70, hz + 10, cx + pw * 0.15 + 220, fy - 8, hz + 60); a.rect(cx + pw * 0.15, fy - 70, cx + pw * 0.15 + 220, fy - 8, 'EQUIP-DETAIL'); }
  a.log(`Added the base plate, the column, the head with ${v.screens === 2 ? 'two screens' : 'a screen'}, the card and scan strip${v.printer ? ', the tag printer' : ''}${v.passport ? ', the passport reader' : ''} and the shelf (plan and 3D).`);
}
const checkinDesc = (v) => `Self-service check-in kiosk on a base plate with ${v.screens === 2 ? 'two screens' : 'one screen'} in the head, a card and boarding-pass scan strip${v.printer ? ', a bag tag printer slot' : ''}${v.passport ? ', a passport reader' : ''}${v.low ? '; head set at a seated reach height' : ''}.`;

function bagdrop(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const bw = W * 0.56, bx0 = cx - bw / 2 - W * 0.08, bx1 = bx0 + bw;
  a.box(bx0 - 40, YF, Z0, bx1 + 40, YB, Z0 + 260);                                           // frame
  for (let i = 0; i < v.belts; i++) { const y0 = YF + (D * i) / v.belts + 40, y1 = YF + (D * (i + 1)) / v.belts - 40; a.box(bx0, y0, Z0 + 260, bx1, y1, Z0 + 300); rollers(a, bx0, bx1, y0, y1, Z0 + 308, 8, 70); a.rect(bx0, y0, bx1, y1, 'EQUIP-DETAIL'); if (v.scale && i === 0) a.rect(bx0 + 40, y0 + 40, bx1 - 40, y1 - 40, 'EQUIP-DETAIL'); }
  a.box(bx0 - 40, YF, Z0 + 300, bx0 - 20, YB, Z0 + 700); a.box(bx1 + 20, YF, Z0 + 300, bx1 + 40, YB, Z0 + 700);       // side guards
  for (const y of [YF + 10, YB - 30]) a.box(bx0 - 40, y, Z0 + 300, bx1 + 40, y + 20, Z0 + 1000);                  // light-curtain frames
  const px = bx1 + 120, pdx = Math.min(X1 - 20, px + 380);
  a.box(px, YF + 40, Z0, pdx, YF + 360, Z0 + 950); screen(a, px + 20, Z0 + 600, pdx - 20, Z0 + 930, YF + 40, 30);
  if (v.printer) { a.box(px + 20, YF + 20, Z0 + 420, pdx - 20, YF + 40, Z0 + 520); a.rect(px + 20, YF + 20, pdx - 20, YF + 40, 'EQUIP-DETAIL'); }
  a.rect(px, YF + 40, pdx, YF + 360, 'EQUIP-DETAIL'); a.box(X0, YF, Z1 - 90, X1, YB, Z1); for (const x of [X0 + 10, X1 - 10]) for (const y of [YF + 10, YB - 10]) a.box(x - 10, y - 10, Z0 + 300, x + 10, y + 10, Z1 - 90);  // headframe
  a.log(`Added ${v.belts === 2 ? 'two in-line belt sections' : 'the belt section'} with rollers, side guards, light-curtain frames, the screen post${v.printer ? ' with tag printer' : ''}${v.scale ? ' and a weighing area' : ''} (plan and 3D).`);
}

function scale(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0 + 20, YF + 20, Z0 + 60, X1 - 20, YB - 20, Z1 - 30); a.box(X0, YF, Z1 - 30, X1, YB, Z1);
  if (v.rollers) rollers(a, X0 + 30, X1 - 30, YF + 30, YB - 30, Z1 + 6, 8, 70); a.rect(X0 + 30, YF + 30, X1 - 30, YB - 30, 'EQUIP-DETAIL');
  if (v.display) { a.cyl(X1 - 90, YF + 60, Z0, Z0 + 700, 22, 10); a.box(X1 - 190, YF + 30, Z0 + 700, X1 - 10, YF + 100, Z0 + 900); screen(a, X1 - 180, Z0 + 710, X1 - 20, Z0 + 890, YF + 30, 24); }
  a.log(`Added the platform with its frame${v.rollers ? ' and roller top' : ''}${v.display ? ' and a weight display on a post' : ''} (plan and 3D).`);
}

// ---- security ----------------------------------------------------------------------------------------------------------------------
function divest(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline();
  const top = Z1 - 60; a.box(X0, YF, top, X1, YB, top + 20);
  a.box(X0, YF, top + 20, X1, YF + 18, Z1); a.box(X0, YB - 18, top + 20, X1, YB, Z1);      // side rails
  rollers(a, X0 + 30, X1 - 30, YF + 30, YB - 30, top + 20 + 24, 24, 90); a.rect(X0 + 30, YF + 30, X1 - 30, YB - 30, 'EQUIP-DETAIL');
  a.box(X1 - 20, YF, top + 20, X1, YB, Z1 + 0); a.box(X0, YF, top + 20, X0 + 20, YB, top + 80);   // stop at one end
  const nl = Math.max(2, Math.round(W / 1500) + 1);
  for (let i = 0; i < nl; i++) { const x = X0 + 60 + ((W - 120) * i) / (nl - 1); a.box(x - 20, YF + 60, Z0, x + 20, YF + 100, top); a.box(x - 20, YB - 100, Z0, x + 20, YB - 60, top); a.box(x - 20, YF + 60, Z0 + 150, x + 20, YB - 60, Z0 + 180); }
  if (v.shelf) a.box(X0 + 120, YF + 80, Z0 + 330, X1 - 120, YB - 80, Z0 + 350);
  a.log(`Added the roller bed between side rails, an end stop, ${nl} leg frames with cross rails${v.shelf ? ' and a lower bin shelf' : ''} (plan and 3D).`);
}

function binStack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  if (v.rack) {
    a.box(X0, YF, Z0 + 80, X0 + 20, YB, Z1); a.box(X1 - 20, YF, Z0 + 80, X1, YB, Z1);
    for (const x of [X0 + 10, X1 - 10]) for (const y of [YF + 10, YB - 10]) { a.cyl(x, y, Z0 + 60, Z0 + 80, 7, 6); a.xcyl(x - 8, x + 8, y, Z0 + 30, 30, 10); a.circ(x, y, 30, 'EQUIP-HIDDEN'); }
    const lv = v.n; for (let i = 0; i < lv; i++) { const z = Z0 + 120 + ((Z1 - Z0 - 200) * i) / lv; a.box(X0 + 20, YF, z, X1 - 20, YB, z + 12); tray(a, X0 + 40, YF + 20, X1 - 40, YB - 20, z + 12, z + 12 + 90, 5); }
    a.box(X0, YF, Z1 - 20, X1, YB, Z1);
  } else {
    const h = 95;
    for (let i = 0; i < v.n; i++) { const z = Z0 + 6 + i * 24; tray(a, X0, YF, X1, YB, z, z + h, 5); a.box(X0 + 20, YF - 4, z + h - 10, X1 - 20, YF, z + h); }
    a.rect(X0 + 12, YF + 12, X1 - 12, YB - 12, 'EQUIP-DETAIL');
  }
  a.log(v.rack ? `Added a wheeled rack of ${v.n} shelves, each holding a screening bin (plan and 3D).` : `Added ${v.n} nested screening bin${v.n > 1 ? 's' : ''} with rims and hand slots (plan and 3D).`);
}

function xray(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const hw = (W - 2 * v.belt) / 2 < 0 ? W * 0.5 : v.tunnel, hx0 = cx - hw / 2, hx1 = cx + hw / 2, tz0 = Z0 + 560, tz1 = tz0 + v.opening, tw = D * 0.7;
  a.box(hx0, YF + 20, Z0 + 330, hx1, YB - 20, tz0); a.box(hx0, YF + 20, tz1, hx1, YB - 20, Z1 - 120);                                    // below and above the tunnel
  a.box(hx0, YF + 20, tz0, hx1, YF + (D - tw) / 2 + 20, tz1); a.box(hx0, YB - (D - tw) / 2 - 20, tz0, hx1, YB - 20, tz1);                // side walls
  a.box(hx0 + 30, YF + 40, Z1 - 120, hx1 - 30, YB - 40, Z1 - 60);
  for (const x of [hx0 - 6, hx1 - 6]) for (let i = 0; i < 6; i++) a.box(x, YF + (D - tw) / 2 + 40 + i * (tw / 7), tz0 + 20, x + 12, YF + (D - tw) / 2 + 52 + i * (tw / 7), tz1 - 20);     // curtain strips
  a.box(X0, YF + 40, tz0 - 40, hx0, YB - 40, tz0 - 20); a.box(hx1, YF + 40, tz0 - 40, X1, YB - 40, tz0 - 20);                                 // roller beds
  rollers(a, X0, hx0, YF + 50, YB - 50, tz0 - 4, 20, 80); rollers(a, hx1, X1, YF + 50, YB - 50, tz0 - 4, 20, 80);
  for (const [x0, x1] of [[X0, hx0], [hx1, X1]]) { a.box(x0, YF + 20, tz0 - 20, x1, YF + 50, tz0 + 40); a.box(x0, YB - 50, tz0 - 20, x1, YB - 20, tz0 + 40); }
  for (const x of [hx0 + 50, hx1 - 50]) for (const y of [YF + 50, YB - 50]) a.leg(x, y, Z0, Z0 + 330, 28);
  a.cyl(hx0 + 140, YF + 100, Z1 - 60, Z1 + 0, 22, 8);   // beacon
  if (v.monitor) { a.box(X0 + 120, YF + 20, Z0 + 700, X0 + 150, YF + 60, Z0 + 1050); a.cyl(X0 + 135, YF + 40, Z0 + 700, Z0 + 1000, 0.1, 3); }
  a.rect(hx0, YF + 20, hx1, YB - 20, 'EQUIP-DETAIL'); a.rect(hx0, YF + (D - tw) / 2 + 20, hx1, YB - (D - tw) / 2 - 20, 'EQUIP-HIDDEN'); a.rect(X0, YF + 50, hx0, YB - 50, 'EQUIP-DETAIL'); a.rect(hx1, YF + 50, X1, YB - 50, 'EQUIP-DETAIL');
  a.log('Added the scanner housing with a tunnel opening and curtain strips, the infeed and exit roller beds with guard rails, the legs and a beacon (plan and 3D).');
}

function portal(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(X0 + 40, YF + 60, Z0, X1 - 40, YB - 60, Z0 + 90);
  a.rect(cx - 220, cy - 300, cx - 20, cy - 100, 'EQUIP-DETAIL'); a.rect(cx + 20, cy - 300, cx + 220, cy - 100, 'EQUIP-DETAIL');                      // foot marks
  const tw = 260;
  for (const [x0, x1] of [[X0 + 20, X0 + 20 + tw], [X1 - 20 - tw, X1 - 20]]) { a.box(x0, YF + 80, Z0 + 90, x1, YB - 80, Z1 - 140); if (v.glass) a.frame(x0, Z0 + 90, x1, Z1 - 140, YF + 40, YF + 80, 40); }
  a.box(X0 + 20, YF + 80, Z1 - 140, X1 - 20, YB - 80, Z1);
  if (v.glass) { a.box(X0 + 20 + tw, YF + 80, Z0 + 90, X1 - 20 - tw, YF + 100, Z0 + 1100); a.box(X0 + 20 + tw, YB - 100, Z0 + 90, X1 - 20 - tw, YB - 80, Z0 + 1100); }
  if (v.ramp) { ramp(a, X0 - 0, X0 + 20, YF + 60, YB - 60, Z0, Z0 + 90, 0); a.box(cx - 120, YF + 90, Z0 + 1050, cx + 120, YF + 140, Z0 + 1070); }
  for (const x of [cx - 160, cx + 160]) a.ycyl(YF + 100, YF + 300, x, Z0 + 1100, 18, 8);   // hand grips
  a.line(cx - 220, YF + 80, cx + 220, YF + 80); a.line(cx - 220, YB - 80, cx + 220, YB - 80);
  a.log(`Added the foot platform with foot marks, two scanner towers${v.glass ? ' with glazed front panels and side shields' : ''}, the roof unit and two hand grips (plan and 3D).`);
}

function wtmd(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const pw = 160; a.box(X0, YF, Z0, X0 + pw, YB, Z1 - 200); a.box(X1 - pw, YF, Z0, X1, YB, Z1 - 200); a.box(X0, YF, Z1 - 200, X1, YB, Z1);
  a.box(X0 + pw, YF + 20, Z0, X1 - pw, YB - 20, Z0 + 30);
  for (let i = 0; i < v.zones; i++) { const z = Z0 + 200 + ((Z1 - Z0 - 600) * i) / Math.max(1, v.zones - 1); for (const x of [X0 + pw, X1 - pw]) a.box(x - 3, cy - 40, z - 14, x + 3, cy + 40, z + 14); }
  a.box(cx - 220, YF - 10, Z1 - 160, cx + 220, YF + 20, Z1 - 40); for (let i = 0; i < 5; i++) lamp(a, cx - 160 + i * 80, YF - 14, Z1 - 100, 12);
  if (v.panel) { a.box(X0 - 20, YF, Z0, X0, YB, Z1 - 200 + 100); a.box(X1, YF, Z0, X1 + 20, YB, Z1 - 200 + 100); }
  a.rect(X0, YF, X0 + pw, YB, 'EQUIP-DETAIL'); a.rect(X1 - pw, YF, X1, YB, 'EQUIP-DETAIL');
  a.log(`Added the two side panels with ${v.zones} detection zone strips each, the header with an indicator bar and the floor mat${v.panel ? ' and side guards' : ''} (plan and 3D).`);
}

function laneDivider(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const n = Math.max(2, Math.round(W / 1200) + 1), pz = Z1 - 120;
  for (let i = 0; i < n; i++) { const x = X0 + 60 + ((W - 120) * i) / (n - 1); a.cyl(x, a.cy, Z0 + 40, Z1, 22, 10); a.box(x - 130, YF, Z0, x + 130, YB, Z0 + 40); a.rect(x - 130, YF, x + 130, YB, 'EQUIP-DETAIL'); }
  a.box(X0 + 60, a.cy - 25, Z0 + 250, X1 - 60, a.cy + 25, pz); a.frame(X0 + 60, Z0 + 250, X1 - 60, pz, a.cy - 30, a.cy + 30, 30);
  a.box(X0 + 60, a.cy - 20, Z1 - 160, X1 - 60, a.cy + 20, Z1); a.line(X0, a.cy, X1, a.cy);
  if (v.sign) { a.box(cx - 180, a.cy - 40, Z1 - 330, cx + 180, a.cy + 40, Z1 - 170); }
  a.log(`Added ${n} base-plate posts, a ${v.sign ? 'framed panel with a sign plate' : 'framed panel'} and a top rail (plan and 3D).`);
}

function stanchion(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const r = D / 2, xs = v.wall ? [X0 + r] : [X0 + r, X1 - r];
  for (const x of xs) { a.cyl(x, cy, Z0, Z0 + 20, r, 20); a.cyl(x, cy, Z0 + 20, Z1 - 100, 25, 12); a.cyl(x, cy, Z1 - 100, Z1, 38, 14); a.circ(x, cy, r); a.circ(x, cy, 38, 'EQUIP-DETAIL'); }
  if (v.wall) a.box(X1 - 30, cy - 40, Z1 - 160, X1, cy + 40, Z1 - 60);
  const x1 = v.wall ? X1 - 30 : X1 - r, zb = Z1 - 60;
  for (let k = 0; k < (v.double ? 2 : 1); k++) { const z = zb - k * 180; a.box(X0 + r + 38, cy - 25, z - 25, x1 - (v.wall ? 0 : 38), cy + 25, z + 25); }
  a.box(x1 - 38, cy - 38, zb - 40, x1 + (v.wall ? 0 : 38), cy + 38, zb + 40);
  a.line(X0 + r, cy, x1, cy);
  a.log(`Added ${v.wall ? 'one post and a wall receiver' : 'two weighted-base posts'} with belt cassette heads and ${v.double ? 'two' : 'a'} tensioned belt${v.double ? 's' : ''} between them (plan and 3D).`);
}

function ropePost(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const r = D / 2, rz = Z1 - (v.ball ? 130 : 60);
  for (const x of [X0 + r, X1 - r]) { a.cyl(x, cy, Z0, Z0 + 30, r, 20); a.cyl(x, cy, Z0 + 30, Z1 - (v.ball ? 140 : 40), 22, 12); if (v.ball) a.ell(x, cy, Z1 - 70, 55, 55, 55, 14, 8); else a.cyl(x, cy, Z1 - 40, Z1, 40, 14); a.circ(x, cy, r); a.circ(x, cy, 25, 'EQUIP-DETAIL'); }
  const mid = (X0 + X1) / 2; a.tube([[X0 + r + 30, cy, rz], [mid - W * 0.15, cy, rz - 70], [mid + W * 0.15, cy, rz - 70], [X1 - r - 30, cy, rz]], [16, 16, 16, 16], 8);
  a.tube([[X0 + r, cy, rz], [X0 + r + 30, cy, rz]], [26, 16], 8); a.tube([[X1 - r - 30, cy, rz], [X1 - r, cy, rz]], [16, 26], 8);
  a.line(X0 + r, cy, X1 - r, cy);
  a.log('Added two posts with round bases, finials and a rope hanging between them on end hooks (plan and 3D).');
}

function crowdBarrier(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const n = v.bars;
  for (const x of [X0 + 50, X1 - 50]) { a.box(x - 25, cy - 25, Z0 + 60, x + 25, cy + 25, Z1); a.box(x - 25, YF, Z0, x + 25, YB, Z0 + 60); a.rect(x - 25, YF, x + 25, YB, 'EQUIP-DETAIL'); }
  a.box(X0 + 50, cy - 20, Z1 - 40, X1 - 50, cy + 20, Z1); a.box(X0 + 50, cy - 20, Z0 + 160, X1 - 50, cy + 20, Z0 + 200);
  for (let i = 0; i < n; i++) { const x = X0 + 50 + ((W - 100) * (i + 1)) / (n + 1); a.cyl(x, cy, Z0 + 200, Z1 - 40, 10, 8); }
  a.line(X0, cy, X1, cy);
  a.log(`Added two feet-and-post ends, a top and a bottom rail and ${n} vertical bars between them (plan and 3D).`);
}

function gatePost(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  baseplate(a, X0, YF, X1, YB, Z0, 30);
  a.box(cx - W * 0.22, cy - D * 0.28, Z0 + 30, cx + W * 0.22, cy + D * 0.28, Z0 + (Z1 - Z0) * 0.62);
  const hz = Z0 + (Z1 - Z0) * 0.62, hx = W * (v.dual ? 0.46 : 0.32);
  a.box(cx - hx, cy - D * 0.34, hz, cx + hx, cy + D * 0.34, Z1);
  a.box(cx - hx + 20, cy - D * 0.34 - 16, hz + 20, cx + hx - 20, cy - D * 0.34, hz + 130); screen(a, cx - hx + 40, hz + 140, cx + hx - 40, Z1 - 30, cy - D * 0.34, 24);
  const nz = v.dual ? 2 : 1; for (let i = 0; i < nz; i++) { const x = cx - hx + ((2 * hx) * (i + 0.5)) / nz; a.box(x - 80, cy - D * 0.34 - 34, hz + 25, x + 80, cy - D * 0.34 - 16, hz + 100); a.rect(x - 80, cy - D * 0.34 - 34, x + 80, cy - D * 0.34 - 16, 'EQUIP-DETAIL'); }
  a.box(cx - hx, cy - D * 0.34 - 5, Z1, cx + hx, cy - D * 0.34 + 5, Z1 + 0.01); for (const dx of [-1, 1]) lamp(a, cx + dx * (hx - 40), cy, Z1 - 4, 12);
  a.rect(cx - W * 0.22, cy - D * 0.28, cx + W * 0.22, cy + D * 0.28, 'EQUIP-DETAIL');
  a.log(`Added the base plate, the column, the head with a screen, ${nz === 2 ? 'two scan windows' : 'a scan window'} and status lights (plan and 3D).`);
}

// ---- baggage --------------------------------------------------------------------------------------------------------------------------
function carousel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const bw = v.bw;
  if (v.curve) {
    const R = Math.min(W, D); const cX = X0, cY = YB, r1 = R - 20, r0 = R - 20 - bw;
    sector(a, cX, cY, r0 - 130, r1 + 120, -v.curve, 0, Z0, Z0 + 260, 12 + Math.round(v.curve / 8));
    sector(a, cX, cY, r0, r1, -v.curve, 0, Z0 + 260, Z0 + 300, 12 + Math.round(v.curve / 8));
    for (let g = 0; g > -v.curve; g -= 6) { const t = (g * Math.PI) / 180; a.line(cX + r0 * Math.cos(t), cY + r0 * Math.sin(t), cX + r1 * Math.cos(t), cY + r1 * Math.sin(t), 'EQUIP-DETAIL'); }
    sector(a, cX, cY, r1 + 20, r1 + 120, -v.curve, 0, Z0 + 260, Z1 - 100, 12 + Math.round(v.curve / 8)); sector(a, cX, cY, r0 - 130, r0 - 40, -v.curve, 0, Z0 + 260, Z0 + 420, 12 + Math.round(v.curve / 8));
    a.arc(cX, cY, r1 + 120, 360 - v.curve, 360, 'EQUIP-DETAIL'); a.arc(cX, cY, r0 - 130, 360 - v.curve, 360, 'EQUIP-DETAIL'); a.arc(cX, cY, r0, 360 - v.curve, 360, 'EQUIP-DETAIL'); a.arc(cX, cY, r1, 360 - v.curve, 360, 'EQUIP-DETAIL');
  } else {
    a.box(X0, YF, Z0, X1, YB, Z0 + 260);
    a.box(X0 + 40, YF + 130, Z0 + 260, X1 - 40, YB - 130, Z0 + 300); for (let x = X0 + 60; x < X1 - 60; x += 110) a.box(x, YF + 135, Z0 + 300, x + 100, YB - 135, Z0 + 308);
    a.box(X0 + 40, YF + 20, Z0 + 260, X1 - 40, YF + 130, Z0 + 330); ramp(a, X0 + 40, X1 - 40, YB - 130, YB - 20, Z0 + 340, Z0 + 260, 40);
    a.box(X0, YB - 20, Z0 + 260, X1, YB, Z1 - 100); a.rect(X0 + 40, YF + 130, X1 - 40, YB - 130, 'EQUIP-DETAIL'); for (let x = X0 + 60; x < X1 - 60; x += 220) a.line(x, YF + 130, x, YB - 130, 'EQUIP-DETAIL');
  }
  a.log(v.curve ? `Added a ${v.curve} degree curved slat belt with inner and outer skirts and a base frame (plan and 3D).` : 'Added the slat belt on a base frame with sloped side skirts and a back guard (plan and 3D).');
}

function conveyor(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const za = v.rise ? Z0 + 250 : Z0 + 300, zb = v.rise ? Z1 - 160 : za;
  if (v.rise) {
    ramp(a, X0, X1, YF + 30, YB - 30, za, zb, 60);
    ramp(a, X0, X1, YF + 20, YF + 50, za + 60, zb + 60, 90); ramp(a, X0, X1, YB - 50, YB - 20, za + 60, zb + 60, 90);
    for (let i = 0; i <= 4; i++) { const x = X0 + 100 + ((W - 200) * i) / 4, z = za + ((zb - za) * (x - X0)) / W; a.box(x - 15, YF + 40, Z0, x + 15, YF + 70, z); a.box(x - 15, YB - 70, Z0, x + 15, YB - 40, z); }
  } else {
    a.box(X0, YF + 20, za - 40, X1, YB - 20, za + 20);
    a.box(X0, YF + 20, za + 20, X1, YF + 50, za + 130); a.box(X0, YB - 50, za + 20, X1, YB - 20, za + 130);
    if (v.rollers) rollers(a, X0 + 20, X1 - 20, YF + 50, YB - 50, za + 40, 26, 90); else { a.box(X0 + 10, YF + 50, za + 20, X1 - 10, YB - 50, za + 40); for (let x = X0 + 60; x < X1; x += 180) a.line(x, YF + 50, x, YB - 50, 'EQUIP-DETAIL'); }
    for (let i = 0; i <= Math.round(W / 1200); i++) { const x = X0 + 80 + ((W - 160) * i) / Math.max(1, Math.round(W / 1200)); a.box(x - 20, YF + 40, Z0, x + 20, YF + 70, za - 40); a.box(x - 20, YB - 70, Z0, x + 20, YB - 40, za - 40); a.box(x - 20, YF + 40, Z0 + 150, x + 20, YB - 40, Z0 + 180); }
  }
  a.box(X1 - 220, YF + 10, Z0 + 150, X1 - 20, YF + 60, Z0 + 330); a.box(X0 + 20, YB - 120, v.rise ? za - 20 : za - 110, X0 + 200, YB - 20, v.rise ? za + 140 : za - 40);   // control box and drive
  a.rect(X0, YF + 20, X1, YB - 20, 'EQUIP-DETAIL'); a.rect(X1 - 220, YF + 10, X1 - 20, YF + 60, 'EQUIP-DETAIL');
  a.log(`Added the ${v.rise ? 'sloped' : 'flat'} ${v.rollers ? 'roller' : 'belt'} bed with side guards, support legs, a drive and a control box (plan and 3D).`);
}

function luggageCart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  for (const x of [X0 + 70, X1 - 70]) for (const y of [YF + 60, YB - 60]) { a.cyl(x, y, Z0 + 40, Z0 + 90, 8, 6); a.xcyl(x - 10, x + 10, y, Z0 + 38, 38, 10); a.circ(x, y, 40, 'EQUIP-HIDDEN'); }
  for (let t = 0; t < v.tiers; t++) { const z = Z0 + 90 + t * 380; a.box(X0 + 20, YF + 20, z, X1 - 20, YB - 20, z + 25); a.box(X0 + 20, YF + 20, z + 25, X1 - 20, YF + 40, z + 80); a.box(X0 + 20, YB - 40, z + 25, X1 - 20, YB - 20, z + 80); }
  a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL');
  const top = Z0 + 90 + (v.tiers - 1) * 380; for (const x of [X0 + 90, X1 - 90]) { a.box(x - 12, YB - 40, Z0 + 60, x + 12, YB - 16, Z1 - 80); if (v.tiers > 1) a.box(x - 12, YF + 20, Z0 + 90, x + 12, YF + 44, top + 80); }
  a.box(X0 + 90, YB - 44, Z1 - 80, X1 - 90, YB - 12, Z1 - 50); a.xcyl(X0 + 90, X1 - 90, YB - 28, Z1 - 30, 14, 10);
  if (v.brake) { a.box(cx - 25, YB - 70, Z1 - 170, cx + 25, YB - 40, Z1 - 80); }
  a.log(`Added ${v.tiers === 2 ? 'two' : 'one'} luggage deck${v.tiers === 2 ? 's' : ''} with rails, a push handle with grip, four swivel wheels${v.brake ? ' and a brake lever' : ''} (plan and 3D).`);
}

function wheelchair(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const sw = W - 160, sz = Z0 + 480, rr = v.big ? 305 : 95;
  for (const x of [X0 + 25, X1 - 25]) { a.xcyl(x - 12, x + 12, YB - 300, Z0 + rr, rr, 22); a.circ(x, YB - 300, 10, 'EQUIP-DETAIL'); a.rect(x - 12, YB - 300 - rr, x + 12, YB - 300 + rr, 'EQUIP-DETAIL'); if (v.big) a.xcyl(x - 35, x - 12, YB - 300, Z0 + rr, rr * 0.9, 20); }
  for (const x of [X0 + 60, X1 - 60]) { a.cyl(x, YF + 140, Z0 + 80, sz - 20, 7, 6); a.xcyl(x - 7, x + 7, YF + 140, Z0 + 60, 55, 12); a.rect(x - 7, YF + 85, x + 7, YF + 195, 'EQUIP-DETAIL'); }
  a.box(X0 + 70, YB - 440, sz, X1 - 70, YB - 30, sz + 30);                                              // seat
  a.box(X0 + 70, YB - 40, sz + 30, X1 - 70, YB - 15, Z1 - 110);                                         // back
  for (const x of [X0 + 70, X1 - 70]) { a.box(x - 10, YB - 400, sz + 30, x + 10, YB - 70, sz + 230); a.box(x - 12, YB - 40, Z1 - 110, x + 12, YB + 0, Z1); a.tube([[x, YB - 440, sz], [x, YF + 100, Z0 + 140]], [10, 10], 6); a.box(x - 30, YF, Z0 + 120, x + 30, YF + 160, Z0 + 140); }
  if (v.attendant) { a.box(X0 + 20, YB - 35, Z1 - 40, X1 - 20, YB, Z1); a.xcyl(X0 + 20, X1 - 20, YB - 15, Z1 - 20, 16, 10); }
  a.rect(X0 + 70, YB - 440, X1 - 70, YB - 30, 'EQUIP-DETAIL'); a.rect(X0 + 70, YB - 40, X1 - 70, YB - 15, 'EQUIP-DETAIL');
  a.log(`Added ${v.big ? 'large rear wheels with hand rims' : 'four small wheels'}, front casters, seat, back, armrests, footplates${v.attendant ? ' and attendant push handles' : ''} (plan and 3D).`);
}

// ---- information, wayfinding, services ---------------------------------------------------------------------------------------------
/** A flat arrow pictogram on the plane y facing −Y, built from stepped boxes. dir: 1 right, -1 left, 0 up. */
function arrow(a, cx, cz, w, h, dir, y) {
  const t = 4;
  if (dir === 0) { a.box(cx - w * 0.12, y - t, cz - h / 2, cx + w * 0.12, y, cz + h * 0.1); for (let i = 0; i < 5; i++) { const hw = (w / 2) * (1 - i / 5); a.box(cx - hw, y - t, cz + h * 0.1 + (h * 0.4 * i) / 5, cx + hw, y, cz + h * 0.1 + (h * 0.4 * (i + 1)) / 5); } return; }
  a.box(cx - (w / 2) * dir, y - t, cz - h * 0.12, cx + (w * 0.1) * dir, y, cz + h * 0.12);
  for (let i = 0; i < 5; i++) { const hh = (h / 2) * (1 - i / 5), x0 = cx + (w * 0.1 + (w * 0.4 * i) / 5) * dir, x1 = cx + (w * 0.1 + (w * 0.4 * (i + 1)) / 5) * dir; a.box(Math.min(x0, x1), y - t, cz - hh, Math.max(x0, x1), y, cz + hh); }
}
function stand(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  baseplate(a, X0, YF, X1, YB, Z0, 30);
  const cw = W * 0.34, hz = Z1 - v.sh - 120, hy0 = cy - D * 0.3, hy1 = cy + D * 0.3;
  a.box(cx - cw / 2, cy - D * 0.2, Z0 + 30, cx + cw / 2, cy + D * 0.2, hz); a.rect(cx - cw / 2, cy - D * 0.2, cx + cw / 2, cy + D * 0.2, 'EQUIP-DETAIL');
  const hw = v.sw + 80; a.box(cx - hw / 2, hy0, hz, cx + hw / 2, hy1, Z1);
  screen(a, cx - v.sw / 2, hz + 60, cx + v.sw / 2, Z1 - 60, hy0, 28);
  if (v.dbl) { a.frame(cx - v.sw / 2, hz + 60, cx + v.sw / 2, Z1 - 60, hy1, hy1 + 28, 22); a.box(cx - v.sw / 2 + 22, hy1 + 8, hz + 82, cx + v.sw / 2 - 22, hy1 + 14, Z1 - 82); }
  if (v.touch) { a.box(cx - 120, hy0 - 40, hz + 8, cx + 120, hy0, hz + 50); }
  a.rect(cx - hw / 2, hy0, cx + hw / 2, hy1, 'EQUIP-DETAIL');
  a.log(`Added the base plate, the column and a head with ${v.dbl ? 'a screen on each side' : 'a screen'}${v.touch ? ' and a handset shelf' : ''} (plan and 3D).`);
}
function ceilSign(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const n = v.n, ph = (Z1 - Z0 - 250) / n;
  for (let i = 0; i < n; i++) {
    const z1 = Z1 - 250 - i * ph, z0 = z1 - ph + 30;
    a.box(X0, YF, z0, X1, YB, z1); a.frame(X0 + 10, z0 + 10, X1 - 10, z1 - 10, YF - 8, YF, 14);
    arrow(a, X0 + W * 0.2, (z0 + z1) / 2, W * 0.14, ph * 0.6, v.dirs[i % v.dirs.length], YF - 8); for (let k = 0; k < 3; k++) a.box(X0 + W * 0.42, YF - 12, (z0 + z1) / 2 - 40 + k * 40 - 12, X0 + W * (0.62 + 0.1 * (k % 2)), YF - 8, (z0 + z1) / 2 - 40 + k * 40 + 12);
  }
  for (const x of [X0 + W * 0.2, X1 - W * 0.2]) a.cyl(x, cy, Z1 - 250, Z1, 10, 8); a.box(X0 + W * 0.15, cy - 40, Z1 - 20, X1 - W * 0.15, cy + 40, Z1);
  a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL');
  a.log(`Added ${n} sign panel${n > 1 ? 's' : ''} with arrow pictograms and text bars, two hanger rods and a ceiling bar (plan and 3D).`);
}
function pylon(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0 + 60, YF + 30, Z0 + 60, X1 - 60, YB - 30, Z1 - 60); a.box(X0 + 20, YF + 10, Z1 - 140, X1 - 20, YB - 10, Z1);
  const sides = v.dbl ? [YF + 30, YB - 30] : [YF + 30];
  for (const y of sides) { const f = y < cy ? -1 : 1; for (let i = 0; i < v.rows; i++) { const z0 = Z1 - 240 - (i + 1) * ((Z1 - Z0 - 440) / v.rows) + 20, z1 = z0 + ((Z1 - Z0 - 440) / v.rows) - 20; a.box(X0 + 90, f < 0 ? y - 16 : y, z0, X1 - 90, f < 0 ? y : y + 16, z1); arrow(a, X0 + 160, (z0 + z1) / 2, 100, Math.min(80, z1 - z0 - 30), 0, f < 0 ? y - 16 : y + 24); } }
  a.rect(X0 + 60, YF + 30, X1 - 60, YB - 30, 'EQUIP-DETAIL');
  a.log(`Added the base, the slab body, a header and ${v.rows} listing panels${v.dbl ? ' on each face' : ''} with arrows (plan and 3D).`);
}
function wallMap(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  a.box(X0, YB - D, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YF, YB - D + 10, 40);
  a.box(X0 + 60, YB - D + 2, Z0 + 60, X1 - 60, YB - D + 10, Z1 - 200);
  for (let i = 0; i < 9; i++) { const bx = X0 + 120 + ((i * 193) % Math.max(1, W - 360)), bz = Z0 + 130 + ((i * 317) % Math.max(1, Z1 - Z0 - 560)); a.box(bx, YB - D - 12, bz, bx + 130 + (i % 3) * 60, YB - D + 3, bz + 90 + (i % 2) * 60); }
  a.box(X0 + 60, YB - D - 14, Z1 - 180, X1 - 60, YB - D + 6, Z1 - 60); arrow(a, X0 + 160, Z1 - 120, 100, 80, 1, YB - D - 14);
  if (v.lit) { a.box(X0 + 40, YF - 30, Z1 - 20, X1 - 40, YF, Z1 + 0); lamp(a, cx, YF - 20, Z1 - 20, 30); }
  a.rect(X0 + 60, YF + 10, X1 - 60, YB - 10, 'EQUIP-DETAIL');
  a.log(`Added the frame, the map plate with area blocks, a header strip with an arrow${v.lit ? ' and a top light bar' : ''} (plan and 3D).`);
}
function blade(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(X0, YB - 25, Z0 + (Z1 - Z0) * 0.3, X1, YB, Z1 - 30);
  const px = cx, y0 = YF + 30, y1 = YB - 30; a.box(px - 25, y0, Z0, px + 25, y1, Z1);
  for (const z of [Z0 + (Z1 - Z0) * 0.3 + 40, Z1 - 100]) a.box(X0 + 20, YB - 80, z, X1 - 20, YB - 25, z + 20);
  for (const sx of [-1, 1]) { const x = px + sx * 25, xe = x + sx * 4; for (let i = 0; i < v.icons; i++) { const zc = Z0 + (Z1 - Z0) * (0.78 - 0.5 * i / Math.max(1, v.icons)); a.box(Math.min(x, xe), y0 + 80, zc - 80, Math.max(x, xe), y1 - 80, zc + 80); a.box(Math.min(x, xe + sx * 3), y0 + 160, zc - 40, Math.max(x, xe + sx * 3), y1 - 160, zc + 40); } }
  a.line(px, YF, px, YB); a.rect(X0, YB - 25, X1, YB, 'EQUIP-DETAIL');
  a.log(`Added the wall plate, two arms and a double-sided blade panel with ${v.icons} pictogram plate${v.icons > 1 ? 's' : ''} on each face (plan and 3D).`);
}
function atm(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  if (v.wall) { a.box(X0, YB - 90, Z0, X1, YB, Z1); a.box(X0 + 30, YF, Z0 + 200, X1 - 30, YB - 90, Z1 - 100); }
  else { a.box(X0, YF + 20, Z0, X1, YB, Z1 - (v.canopy ? 150 : 40)); }
  const fy = v.wall ? YF : YF + 20, lz = Z0 + (Z1 - Z0) * 0.5;
  if (v.canopy) a.box(X0 - 0, YF, Z1 - 150, X1, YB, Z1);
  screen(a, X0 + W * 0.22, lz + 200, X1 - W * 0.22, lz + 560, fy, 30);
  a.box(X0 + W * 0.12, fy - 50, lz + 40, X1 - W * 0.12, fy, lz + 200); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) a.box(cx - 120 + c * 90, fy - 58, lz + 54 + r * 34, cx - 60 + c * 90, fy - 50, lz + 76 + r * 34);
  a.box(X1 - W * 0.22, fy - 40, lz + 20, X1 - W * 0.12, fy, lz + 160); a.box(X0 + W * 0.12, fy - 20, lz - 60, X0 + W * 0.28, fy, lz + 10);    // card reader, receipt
  a.box(cx - 160, fy - 30, lz - 220, cx + 160, fy, lz - 130); a.box(cx - 150, fy - 36, lz - 205, cx + 150, fy - 30, lz - 145);                                      // cash dispenser
  a.box(X0 + 20, fy - 4, Z0 + 60, X1 - 20, fy + 8, lz - 260); a.rect(X0 + 20, fy - 4, X1 - 20, fy + 8, 'EQUIP-DETAIL'); a.line(X0, fy, X1, fy);
  a.log(`Added the ${v.wall ? 'through-wall fascia with a recess' : 'cabinet'}${v.canopy ? ' under a hood' : ''}, the screen, keypad, card reader, receipt slot, cash dispenser and a lower door (plan and 3D).`);
}
function vend(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  a.box(X0, YF + 20, Z0 + 60, X1, YB, Z1); a.box(X0 + 20, YF, Z0, X1 - 20, YB - 20, Z0 + 60); a.rect(X0 + 20, YF, X1 - 20, YB - 20, 'EQUIP-DETAIL');
  const gx1 = X0 + W * 0.7, bz = Z0 + 420, tz = Z1 - 120;
  a.frame(X0 + 30, bz, gx1, tz, YF, YF + 20, 30);
  for (let r = 0; r < v.rows; r++) {
    const z = bz + 40 + ((tz - bz - 90) * r) / v.rows; a.box(X0 + 60, YF + 30, z, gx1 - 30, YB - 70, z + 6);
    for (let c = 0; c < v.cols; c++) { const x = X0 + 90 + ((gx1 - X0 - 180) * (c + 0.5)) / v.cols; if (v.kind === 'drink') { a.cyl(x, YF + 120, z + 6, z + 6 + ((tz - bz - 90) / v.rows) * 0.8, 30, 10); } else if (v.kind === 'frozen') a.box(x - 50, YF + 90, z + 6, x + 50, YF + 190, z + 6 + 70); else { a.ycyl(YF + 60, YF + 240, x, z + 40, 24, 8); a.box(x - 40, YF + 70, z + 6, x + 40, YF + 230, z + 34); } }
  }
  const rx = gx1 + 40; a.box(rx, YF - 8, bz + 100, X1 - 30, YF + 20, tz - 100); a.box(rx + 20, YF - 24, tz - 260, X1 - 50, YF - 8, tz - 120);   // pad and display
  for (let r = 0; r < 3; r++) a.box(rx + 20, YF - 20, tz - 330 - r * 50, X1 - 50, YF - 8, tz - 300 - r * 50);
  a.box(rx + 10, YF - 12, bz + 130, X1 - 40, YF + 4, bz + 200); a.box(rx + 10, YF - 12, bz + 290, rx + 90, YF + 4, bz + 320);                         // card reader and coin slot
  a.box(X0 + 120, YF - 6, Z0 + 80, gx1 - 100, YF + 20, Z0 + 320); a.box(X0 + 160, YF - 12, Z0 + 140, gx1 - 140, YF - 6, Z0 + 260);                     // delivery flap
  a.box(X0 + 30, YF - 6, Z1 - 110, X1 - 30, YF + 20, Z1 - 30); lamp(a, cx, YF - 10, Z1 - 70, 20);
  a.log(`Added the cabinet, the glazed product window with ${v.rows} shelves of ${v.kind === 'drink' ? 'bottles' : v.kind === 'frozen' ? 'frozen packs' : 'spiral-coil snacks'}, the keypad, display, card and coin slots, the delivery flap and a header (plan and 3D).`);
}
function lockers(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline();
  const cols = v.cols, tiers = v.tiers, base = Z0 + 100, kw = v.kiosk ? W * 0.18 : 0, lw = (W - kw) / cols;
  a.box(X0, YF + 20, base, X1, YB, Z1); a.box(X0 + 30, YF + 60, Z0, X1 - 30, YB - 20, base);
  for (let c = 0; c < cols; c++) for (let t = 0; t < tiers; t++) {
    const x0 = X0 + kw + c * lw + 4, x1 = X0 + kw + (c + 1) * lw - 4, hh = (Z1 - base) / tiers, z0 = base + t * hh + 4, z1 = base + (t + 1) * hh - 4;
    a.box(x0, YF, z0, x1, YF + 20, z1); vent(a, x0 + 30, z1 - 150, x1 - 30, z1 - 40, YF, 4);
    if (v.charge) { a.box((x0 + x1) / 2 - 40, YF - 12, z0 + 30, (x0 + x1) / 2 + 40, YF, z0 + 80); a.cyl((x0 + x1) / 2 - 15, YF - 14, z0 + 55, z0 + 56, 8, 8); a.cyl((x0 + x1) / 2 + 15, YF - 14, z0 + 55, z0 + 56, 8, 8); }
    a.ycyl(YF - 8, YF, x1 - 50, (z0 + z1) / 2, 14, 8); a.box(x1 - 90, YF - 4, z0 + 26, x1 - 20, YF, z0 + 70);
    a.line(x0, YF, x0, YF + 20, 'EQUIP-DETAIL');
  }
  if (v.kiosk) { a.box(X0 + 4, YF - 4, base + 4, X0 + kw - 4, YF + 20, Z1 - 4); screen(a, X0 + 20, Z1 - 900, X0 + kw - 20, Z1 - 300, YF - 4, 24); a.box(X0 + 20, YF - 20, Z1 - 1000, X0 + kw - 20, YF - 4, Z1 - 920); }
  a.line(X0, YF, X1, YF);
  a.log(`Added ${cols * tiers} compartment doors with vents, handles and number plates${v.charge ? ', a power socket plate on each' : ''}${v.kiosk ? ', a payment column with a touch screen' : ''}, on a plinth (plan and 3D).`);
}
function charger(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  if (v.kind === 'tower') {
    baseplate(a, X0, YF, X1, YB, Z0, 30); a.box(cx - W * 0.35, cy - D * 0.35, Z0 + 30, cx + W * 0.35, cy + D * 0.35, Z1 - 60); a.box(cx - W * 0.4, cy - D * 0.4, Z1 - 60, cx + W * 0.4, cy + D * 0.4, Z1);
    for (const f of [-1, 1]) for (let i = 0; i < v.ports; i++) { const z = Z0 + 500 + i * ((Z1 - Z0 - 900) / Math.max(1, v.ports - 1)); const y = f < 0 ? cy - D * 0.35 : cy + D * 0.35; a.box(cx - 90, f < 0 ? y - 14 : y, z - 40, cx + 90, f < 0 ? y : y + 14, z + 40); a.box(cx - 70, f < 0 ? y - 20 : y + 14, z - 12, cx - 30, f < 0 ? y - 14 : y + 20, z + 12); a.box(cx + 30, f < 0 ? y - 20 : y + 14, z - 12, cx + 70, f < 0 ? y - 14 : y + 20, z + 12); }
    a.rect(cx - W * 0.35, cy - D * 0.35, cx + W * 0.35, cy + D * 0.35, 'EQUIP-DETAIL');
  } else if (v.kind === 'table') {
    a.box(X0, YF, Z1 - 40, X1, YB, Z1); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL'); legs4(a, X0 + 60, YF + 60, X1 - 60, YB - 60, Z0, Z1 - 40, 24);
    for (let i = 0; i < v.ports; i++) { const x = X0 + ((W) * (i + 0.5)) / v.ports; a.box(x - 60, cy - 50, Z1, x + 60, cy + 50, Z1 + 0.5); a.cyl(x - 25, cy, Z1 - 1, Z1 + 6, 12, 8); a.cyl(x + 25, cy, Z1 - 1, Z1 + 6, 12, 8); a.circ(x - 25, cy, 12, 'EQUIP-DETAIL'); a.circ(x + 25, cy, 12, 'EQUIP-DETAIL'); }
  } else {
    a.box(X0, YB - 70, Z0, X1, YB, Z1); for (let i = 0; i < v.ports; i++) { const x = X0 + 80 + ((W - 160) * i) / Math.max(1, v.ports - 1); a.box(x - 50, YB - 90, Z0 + (Z1 - Z0) * 0.4, x + 50, YB - 70, Z0 + (Z1 - Z0) * 0.8); a.cyl(x, YB - 94, Z0 + (Z1 - Z0) * 0.55, Z0 + (Z1 - Z0) * 0.55 + 4, 12, 8); }
    a.rect(X0, YB - 70, X1, YB, 'EQUIP-DETAIL');
  }
  a.log(`Added ${v.kind === 'tower' ? 'a base, a tower with two faces of ' + v.ports + ' charging panels' : v.kind === 'table' ? 'a table top on four legs with ' + v.ports + ' charging modules' : 'a wall plate with ' + v.ports + ' charging panels'} (plan and 3D).`);
}
function waste(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const n = v.n, bw = W / n;
  for (let i = 0; i < n; i++) {
    const x0 = X0 + i * bw + 6, x1 = X0 + (i + 1) * bw - 6, mx = (x0 + x1) / 2;
    a.box(x0, YF, Z0 + 50, x1, YB, Z1 - (v.tray ? 160 : 0) - 120); a.box(x0 - 3, YF - 3, Z1 - (v.tray ? 160 : 0) - 120, x1 + 3, YB + 3, Z1 - (v.tray ? 160 : 0));
    const r = Math.min(bw * 0.32, D * 0.32, 160); a.cyl(mx, cy, Z1 - (v.tray ? 160 : 0), Z1 - (v.tray ? 160 : 0) + 14, r + 10, 18); a.circ(mx, cy, r); a.circ(mx, cy, r + 10, 'EQUIP-DETAIL');
    a.box(x0 + 20, YF - 6, Z0 + 650, x1 - 20, YF, Z0 + 760); a.rect(x0 + 20, YF - 6, x1 - 20, YF, 'EQUIP-DETAIL');
    a.box(x0 + 30, YF - 3, Z0 + 60, x1 - 30, YF, Z0 + 80);
  }
  for (const x of [X0 + 40, X1 - 40]) for (const y of [YF + 40, YB - 40]) a.cyl(x, y, Z0, Z0 + 50, 18, 8);
  if (v.tray) { a.box(X0 - 20, YF - 60, Z1 - 160, X1 + 20, YB + 20, Z1 - 140); a.box(X0 - 20, YF - 60, Z1 - 140, X1 + 20, YF - 50, Z1 - 100); a.box(X0, YB - 10, Z1 - 140, X1, YB, Z1); a.rect(X0 - 20, YF - 60, X1 + 20, YB + 20, 'EQUIP-DETAIL'); }
  a.log(`Added ${n} body compartment${n > 1 ? 's' : ''} with round top openings, label plates, kick strips and feet${v.tray ? ', and a tray rest shelf with a back rail' : ''} (plan and 3D).`);
}
function grab(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const r = 19, off = 38, y = YB - off - r;
  const bar = (x0, z0, x1, z1) => { a.tube([[x0, y, z0], [x1, y, z1]], [r, r], 10); a.circ(x0, y, r, 'EQUIP-DETAIL'); };
  if (v.shape === 'L') { bar(X0 + 50, Z0 + 40, X1 - 50, Z0 + 40); bar(X1 - 50, Z0 + 40, X1 - 50, Z1 - 40); for (const [x, z] of [[X0 + 50, Z0 + 40], [X1 - 50, Z0 + 40], [X1 - 50, Z1 - 40]]) a.cyl(x, YB - 8, z - 0, z + 0.01, 0.01, 3); for (const [x, z] of [[X0 + 50, Z0 + 40], [X1 - 50, Z1 - 40]]) { a.ycyl(y, YB, x, z, 38, 12); a.circ(x, YB - 4, 38, 'EQUIP-DETAIL'); } }
  else { bar(X0 + 50, Z0 + 40, X1 - 50, Z0 + 40); for (const x of [X0 + 50, X1 - 50]) { a.ycyl(y, YB, x, Z0 + 40, 38, 12); a.circ(x, YB - 4, 38, 'EQUIP-DETAIL'); } }
  a.line(X0 + 50, y, v.shape === 'L' ? X1 - 50 : X1 - 50, y);
  a.log(`Added ${v.shape === 'L' ? 'an L-shaped' : 'a straight'} grab bar tube with wall flanges (plan and 3D).`);
}
function babyChange(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  a.box(X0, YB - 90, Z0, X1, YB, Z1);
  if (v.open) {
    if (v.vertical) { a.box(X0 + 40, YB - D + 20, Z0 + 200, X0 + 70, YB - 90, Z1 - 200); a.box(X1 - 70, YB - D + 20, Z0 + 200, X1 - 40, YB - 90, Z1 - 200); a.box(X0 + 40, YB - D + 20, Z0 + 200, X1 - 40, YB - 90, Z0 + 230); a.box(X0 + 40, YB - 120, Z0 + 230, X1 - 40, YB - 90, Z1 - 200); }
    else { a.box(X0 + 20, YF, Z0 + (Z1 - Z0) * 0.5, X1 - 20, YB - 90, Z0 + (Z1 - Z0) * 0.5 + 40); a.box(X0 + 20, YF, Z0 + (Z1 - Z0) * 0.5 + 40, X1 - 20, YF + 40, Z0 + (Z1 - Z0) * 0.5 + 130); a.box(X0 + 20, YB - 130, Z0 + (Z1 - Z0) * 0.5 + 40, X1 - 20, YB - 90, Z0 + (Z1 - Z0) * 0.5 + 160); for (const x of [X0 + 20, X1 - 20]) a.box(x - 20, YF, Z0 + (Z1 - Z0) * 0.5 + 40, x, YB - 90, Z0 + (Z1 - Z0) * 0.5 + 130); a.tube([[X0 + 150, YF + 120, Z0 + (Z1 - Z0) * 0.5 + 40], [X0 + 150, YB - 90, Z0 + (Z1 - Z0) * 0.5 + 300]], [10, 10], 6); a.tube([[X1 - 150, YF + 120, Z0 + (Z1 - Z0) * 0.5 + 40], [X1 - 150, YB - 90, Z0 + (Z1 - Z0) * 0.5 + 300]], [10, 10], 6); a.tube([[X0 + 40, YF + 20, Z0 + (Z1 - Z0) * 0.5 - 200], [X0 + 40, YB - 90, Z0 + (Z1 - Z0) * 0.5]], [8, 8], 6); }
  } else { a.box(X0, YF + 30, Z0 + 20, X1, YB - 90, Z1 - 20); a.box(cx - 60, YF + 20, Z0 + (Z1 - Z0) * 0.5, cx + 60, YF + 30, Z0 + (Z1 - Z0) * 0.5 + 40); }
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.log(`Added the wall shell and ${v.open ? (v.vertical ? 'the lowered vertical bed with side rails' : 'the lowered bed with side rails and a safety strap') : 'the closed cover with a latch'} (plan and 3D).`);
}
function dryer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  if (v.kind === 'blade') { a.box(X0, YB - D, Z0, X1, YB, Z1); a.box(X0 + 40, YF, Z0 + (Z1 - Z0) * 0.45, X1 - 40, YF + 60, Z0 + (Z1 - Z0) * 0.55); a.box(X0 + 60, YF - 4, Z0 + (Z1 - Z0) * 0.22, X1 - 60, YF + 12, Z0 + (Z1 - Z0) * 0.28); a.box(X0 + 60, YF - 4, Z0 + (Z1 - Z0) * 0.72, X1 - 60, YF + 12, Z0 + (Z1 - Z0) * 0.78); a.line(X0 + 60, YF + 6, X1 - 60, YF + 6); }
  else if (v.kind === 'push') { a.box(X0, YB - 90, Z0, X1, YB, Z1); a.ell(cx, YB - 90 - D * 0.28, Z0 + (Z1 - Z0) * 0.5, W * 0.4, D * 0.28, (Z1 - Z0) * 0.42, 18, 8); a.cone(cx, YB - 100, Z0 + (Z1 - Z0) * 0.12, Z0 + (Z1 - Z0) * 0.12 + 40, 36, 20, 12); a.cyl(cx, YB - 80 - D * 0.4, Z0 + (Z1 - Z0) * 0.72, Z0 + (Z1 - Z0) * 0.72 + 4, 24, 12); a.circ(cx, YB - 80 - D * 0.4, 24, 'EQUIP-DETAIL'); }
  else { a.box(X0, YB - 120, Z0, X1, YB, Z1); a.box(X0 + 20, YB - 160, Z0 + 50, X1 - 20, YB - 120, Z1 - 50); a.cone(cx, YB - 160, Z0 + (Z1 - Z0) * 0.55, Z0 + (Z1 - Z0) * 0.55 + 6, 60, 60, 16); a.box(cx - 80, YF + 20, Z0 + 20, cx + 80, YB - 160, Z0 + 60); a.box(cx - 120, YF + 20, Z1 - 130, cx + 120, YB - 160, Z1 - 60); a.circ(cx, YB - 170, 60, 'EQUIP-DETAIL'); }
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.log(`Added the wall box${v.kind === 'blade' ? ', a central drying slot with two blade slits' : v.kind === 'push' ? ' with a rounded cover, a push button and a nozzle' : ', a wall-recessed unit with a drying hood, a nozzle and a catch tray'} (plan and 3D).`);
}
function tissue(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const nR = v.rolls;
  a.box(X0, YB - 40, Z0, X1, YB, Z1);
  for (let i = 0; i < nR; i++) { const x = X0 + (W * (i + 0.5)) / nR, r = Math.min(W / nR * 0.46, D * 0.46); if (v.jumbo) { a.cyl(x, YB - 40 - r, Z0 + 20, Z1 - 20, r, 22); a.cyl(x, YB - 40 - r, Z0 + 20, Z1 - 20, r * 0.25, 10); a.circ(x, YB - 40 - r, r); a.circ(x, YB - 40 - r, r * 0.25, 'EQUIP-DETAIL'); } else { a.xcyl(x - W / nR * 0.3, x + W / nR * 0.3, YB - 40 - r, Z1 - r - 20, r, 18); a.xcyl(x - W / nR * 0.3, x + W / nR * 0.3, YB - 40 - r, Z0 + r + 20, r, 18); a.circ(x, YB - 40 - r, r, 'EQUIP-DETAIL'); } }
  a.box(X0 + 10, YF, Z0, X0 + 24, YB - 40, Z1); a.box(X1 - 24, YF, Z0, X1 - 10, YB - 40, Z1); a.box(X0 + 10, YF, Z1 - 30, X1 - 10, YB - 40, Z1); a.box(X0 + 10, YF, Z0, X1 - 10, YB - 40, Z0 + 30);
  a.log(`Added the wall plate, the housing with ${nR} ${v.jumbo ? 'jumbo tissue rolls on vertical spindles' : 'standard rolls stacked'} and a dispensing slot (plan and 3D).`);
}

// ---- retail ---------------------------------------------------------------------------------------------------------------------------
function gondola(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const dbl = v.sides === 2, back = v.back, ns = v.shelves;
  a.box(X0, YF, Z0, X1, YB, Z0 + 100);                                                   // base plinth
  for (const x of [X0 + 6, X1 - 6, ...(W > 1500 ? [cx] : [])]) { a.box(x - 20, dbl ? YF + 6 : YB - 60, Z0 + 100, x + 20, dbl ? YB - 6 : YB - 6, Z1); if (x !== cx || W <= 1500) a.box(x - 20, dbl ? YF + 6 : YB - 60, Z1 - 30, x + 20, YB - 6, Z1); }
  if (back === 'solid') a.box(X0 + 6, cy - 8, Z0 + 100, X1 - 6, cy + 8, Z1); else for (let z = Z0 + 200; z < Z1 - 100; z += 90) a.box(X0 + 20, cy - 4, z, X1 - 20, cy + 4, z + 6);
  for (const side of dbl ? [-1, 1] : [1]) {
    const y0 = side < 0 ? YF + 6 : (dbl ? cy + 10 : YB - 60), y1 = side < 0 ? cy - 10 : YB - 6;
    for (let i = 0; i < ns; i++) { const z = Z0 + 250 + ((Z1 - Z0 - 520) * i) / Math.max(1, ns - 1); a.box(X0 + 26, y0, z, X1 - 26, y1, z + 18); a.box(X0 + 26, side < 0 ? y0 : y1 - 16, z + 18, X1 - 26, side < 0 ? y0 + 16 : y1, z + 60); }
    if (!dbl) break;
  }
  a.box(X0, YF, Z1 - 60, X1, YB, Z1);
  a.line(X0, cy, X1, cy, 'EQUIP-DETAIL'); a.rect(X0 + 6, YF + 6, X1 - 6, YB - 6, 'EQUIP-DETAIL');
  a.log(`Added the plinth, the upright posts, a ${back === 'solid' ? 'solid' : 'pegboard'} centre back, ${ns} shelves with price lips ${dbl ? 'on both sides' : 'on one side'} and a top cap (plan and 3D).`);
}
function endcap(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 120); a.box(X0 + 20, YB - 40, Z0 + 120, X1 - 20, YB, Z1 - 120); a.box(X0 + 10, YF + 10, Z1 - 120, X1 - 10, YB - 10, Z1);
  a.box(X0 + 20, YF + 40, Z0 + 120, X0 + 44, YB - 40, Z1 - 120); a.box(X1 - 44, YF + 40, Z0 + 120, X1 - 20, YB - 40, Z1 - 120);
  if (v.kind === 'bins') { for (let i = 0; i < v.n; i++) { const z = Z0 + 180 + i * ((Z1 - Z0 - 420) / v.n); tray(a, X0 + 60, YF + 20, X1 - 60, YB - 60, z, z + 220, 8); } }
  else if (v.kind === 'peg') { for (let z = Z0 + 200; z < Z1 - 200; z += 80) a.box(X0 + 30, YB - 46, z, X1 - 30, YB - 40, z + 5); for (let i = 0; i < v.n; i++) { const z = Z0 + 300 + i * ((Z1 - Z0 - 700) / v.n); a.ycyl(YB - 280, YB - 46, X0 + 100, z, 4, 6); a.ycyl(YB - 280, YB - 46, X1 - 100, z, 4, 6); a.ycyl(YB - 280, YB - 46, cx, z, 4, 6); } }
  else for (let i = 0; i < v.n; i++) { const z = Z0 + 200 + (i * (Z1 - Z0 - 520)) / Math.max(1, v.n - 1); a.box(X0 + 44, YF + 40, z, X1 - 44, YB - 46, z + 16); a.box(X0 + 44, YF + 40, z + 16, X1 - 44, YF + 56, z + 60); }
  a.box(X0 + 40, YF - 4, Z1 - 100, X1 - 40, YF + 6, Z1 - 20); a.rect(X0 + 20, YF + 40, X1 - 20, YB - 40, 'EQUIP-DETAIL');
  a.log(`Added the plinth, back panel, side uprights, header sign${v.kind === 'bins' ? ' and ' + v.n + ' open bins' : v.kind === 'peg' ? ' and a pegboard with ' + v.n + ' rows of hooks' : ' and ' + v.n + ' shelves with price lips'} (plan and 3D).`);
}
function garment(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const rz = Z1 - 180;
  const hang = (x, y, along) => { for (let k = 0; k < 6; k++) { const t = -0.5 + (k + 0.5) / 6; const gx = along === 'x' ? x + t * (W * 0.7) : x, gy = along === 'x' ? y : y + t * (D * 0.7); a.box(gx - 3, gy - 3, rz - 24, gx + 3, gy + 3, rz); a.box(gx - 20, gy - 8, rz - 470, gx + 20, gy + 8, rz - 24); } };
  if (v.kind === 'round') { const r = W / 2 - 40; a.cyl(cx, cy, Z0 + 30, Z1 - 180, 14, 10); a.cyl(cx, cy, Z0, Z0 + 30, r * 0.6, 20); a.circ(cx, cy, W / 2); a.circ(cx, cy, r * 0.6, 'EQUIP-DETAIL');
    const pts = []; for (let i = 0; i <= 24; i++) { const t = (i / 24) * Math.PI * 2; pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r, rz]); } a.tube(pts, pts.map(() => 11), 6); for (let i = 0; i < 12; i++) { const t = (i / 12) * Math.PI * 2; a.box(cx + Math.cos(t) * r - 20, cy + Math.sin(t) * r - 8, rz - 470, cx + Math.cos(t) * r + 20, cy + Math.sin(t) * r + 8, rz - 24); } a.tube([[cx, cy, Z1 - 180], [cx + r, cy, rz]], [14, 11], 6); a.tube([[cx, cy, Z1 - 180], [cx - r, cy, rz]], [14, 11], 6); }
  else if (v.kind === 'four') { a.cyl(cx, cy, Z0 + 30, Z1 - 180, 14, 10); a.cyl(cx, cy, Z0, Z0 + 30, 220, 20); a.circ(cx, cy, 220, 'EQUIP-DETAIL'); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { a.tube([[cx, cy, Z1 - 180], [cx + dx * (W / 2 - 40), cy + dy * (D / 2 - 40), rz]], [12, 11], 6); a.tube([[cx + dx * (W / 2 - 40), cy + dy * (D / 2 - 40), rz], [cx + dx * (W / 2 - 40), cy + dy * (D / 2 - 40), rz - 20]], [11, 11], 6); a.line(cx, cy, cx + dx * (W / 2), cy + dy * (D / 2), 'EQUIP-DETAIL'); } for (let k = 0; k < 4; k++) { hang(cx + 0, cy + (k % 2 ? 1 : -1) * 70, 'x'); break; } }
  else if (v.kind === 'wall') { a.box(X0, YB - 20, Z1 - 260, X1, YB, Z1 - 180); for (const x of [X0 + 60, X1 - 60]) a.box(x - 15, YB - 20, Z1 - 260, x + 15, YB - 20 + (-D + 40) * -1 * 0 + (-0), Z1 - 180); for (const x of [X0 + 60, X1 - 60]) a.box(x - 15, YB - 300, Z1 - 200, x + 15, YB - 20, Z1 - 170); a.xcyl(X0 + 60, X1 - 60, YB - 300, Z1 - 185, 12, 10); a.line(X0 + 60, YB - 300, X1 - 60, YB - 300); for (let k = 0; k < 8; k++) { const x = X0 + 130 + k * ((W - 260) / 7); a.box(x - 3, YB - 303, Z1 - 210, x + 3, YB - 297, Z1 - 185); a.box(x - 20, YB - 308, Z1 - 650, x + 20, YB - 292, Z1 - 210); } }
  else { const rails = v.kind === 'double' ? 2 : 1; for (const x of [X0 + 120, X1 - 120]) { a.box(x - 20, YF + 30, Z0, x + 20, YB - 30, Z0 + 40); a.cyl(x, cy, Z0 + 40, Z1 - 180 - (rails - 1) * 0 + 0.01, 14, 10); if (rails === 2) a.cyl(x, cy, Z0 + 40, Z0 + 940, 14, 10); a.xcyl(x - 25, x + 25, YF + 30, Z0 + 30, 28, 10); a.xcyl(x - 25, x + 25, YB - 30, Z0 + 30, 28, 10); a.rect(x - 20, YF + 30, x + 20, YB - 30, 'EQUIP-DETAIL'); }
    a.xcyl(X0 + 120, X1 - 120, cy, Z1 - 180, 14, 10); if (rails === 2) a.xcyl(X0 + 120, X1 - 120, cy, Z0 + 940, 14, 10); for (let k = 0; k < 8; k++) { const x = X0 + 180 + k * ((W - 360) / 7); a.box(x - 3, cy - 3, Z1 - 204, x + 3, cy + 3, Z1 - 180); a.box(x - 20, cy - 8, Z1 - 650, x + 20, cy + 8, Z1 - 204); } if (rails === 2) for (let k = 0; k < 8; k++) { const x = X0 + 180 + k * ((W - 360) / 7); a.box(x - 20, cy - 8, Z0 + 520, x + 20, cy + 8, Z0 + 936); } a.line(X0 + 120, cy, X1 - 120, cy); }
  a.log(`Added ${v.kind === 'round' ? 'a round rail on a stem and base, with 12 hanging garment shapes' : v.kind === 'four' ? 'a stem with four radiating arms and a base' : v.kind === 'wall' ? 'a wall-mounted rail on brackets with hanging garment shapes' : 'rail ends on feet and casters' + (v.kind === 'double' ? ', a lower rail' : '') + ', with hanging garment shapes'} (plan and 3D).`);
}
function slat(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  a.box(X0, YB - D, Z0, X1, YB, Z1); for (let z = Z0 + 50; z < Z1 - 20; z += 76) a.box(X0 + 6, YB - D - 4, z, X1 - 6, YB - D, z + 8);
  a.line(X0, YB - D, X1, YB - D, 'EQUIP-DETAIL');
  for (let i = 0; i < v.shelves; i++) { const z = Z0 + 300 + i * ((Z1 - Z0 - 700) / Math.max(1, v.shelves)), x0 = X0 + W * 0.1, x1 = X1 - W * 0.1; a.box(x0, YF, z, x1, YB - D, z + 14); a.box(x0, YF, z + 14, x1, YF + 14, z + 50); a.box(x0 + 10, YB - D - 50, z - 60, x0 + 22, YB - D, z); a.box(x1 - 22, YB - D - 50, z - 60, x1 - 10, YB - D, z); }
  for (let i = 0; i < v.hooks; i++) { const x = X0 + 150 + (i * 140) % Math.max(200, W - 300), z = Z1 - 200 - Math.floor((i * 140) / Math.max(200, W - 300)) * 160; a.ycyl(YF + 140 > YB - D ? YB - D - 90 : YB - D - 90, YB - D - 4, x, z, 4, 6); a.cyl(x, YB - D - 90, z, z + 40, 4, 6); }
  a.log(`Added the grooved panel${v.shelves ? ', ' + v.shelves + ' shelves on brackets' : ''}${v.hooks ? ' and ' + v.hooks + ' hooks' : ''} (plan and 3D).`);
}
function mannequin(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const H = Z1 - Z0, s = H / 1800;
  a.cyl(cx, cy, Z0, Z0 + 20, Math.min(W, D) * 0.45, 22); a.circ(cx, cy, Math.min(W, D) * 0.45); a.circ(cx, cy, 12, 'EQUIP-DETAIL');
  if (v.kind === 'torso') { a.cyl(cx, cy, Z0 + 20, Z0 + H * 0.55, 12, 10); a.ell(cx, cy, Z0 + H * 0.7, W * 0.32, D * 0.3, H * 0.2, 18, 10); a.cyl(cx, cy, Z0 + H * 0.88, Z0 + H * 0.94, W * 0.1, 12); a.ell(cx, cy, Z1 - H * 0.06, W * 0.07, D * 0.08, H * 0.06, 12, 8); return a.log('Added a round base, a stem, a torso form with a neck and a head (plan and 3D).'); }
  const sw = (v.kind === 'male' ? 215 : v.kind === 'child' ? 140 : 180) * s;
  for (const sx of [-1, 1]) { a.tube([[cx + sx * 70 * s, cy, Z0 + 20], [cx + sx * 80 * s, cy, Z0 + H * 0.5]], [40 * s, 52 * s], 10); a.tube([[cx + sx * 80 * s, cy, Z0 + H * 0.5], [cx + sx * 95 * s, cy, Z0 + H * 0.76]], [52 * s, 70 * s], 10); }
  a.ell(cx, cy, Z0 + H * 0.77, sw * (v.kind === 'female' ? 0.85 : 0.8), 90 * s, H * 0.035, 16, 6);
  a.ell(cx, cy, Z0 + H * 0.85, sw * (v.kind === 'male' ? 1.0 : 0.85), 95 * s, H * 0.1, 18, 10); a.ell(cx, cy, Z0 + H * 0.84, sw * 0.7, 80 * s, H * 0.14, 16, 8);
  a.cyl(cx, cy, Z0 + H * 0.93, Z0 + H * 0.96, 40 * s, 10); a.ell(cx, cy, Z1 - H * 0.04, 75 * s, 90 * s, H * 0.05, 14, 8);
  for (const sx of [-1, 1]) { a.tube([[cx + sx * sw * 1.05, cy, Z0 + H * 0.9], [cx + sx * sw * 1.25, cy, Z0 + H * 0.65], [cx + sx * sw * 1.2, cy, Z0 + H * 0.5]], [38 * s, 32 * s, 24 * s], 8); }
  a.circ(cx, cy, 18, 'EQUIP-DETAIL'); a.ellp(cx, cy, sw * 1.1, 95 * s, 'EQUIP-DETAIL');
  a.log(`Added a round base, two legs, a hip, a torso with shoulders, a neck, a head and two arms of a ${v.kind} display figure (plan and 3D).`);
}
function displayTable(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(v.round ? 'EQUIP' : 'EQUIP');
  if (v.kind === 'nest') { const hs = [1, 0.8, 0.62]; for (let i = 0; i < 3; i++) { const w = W * (i === 0 ? 0.42 : 0.3), x0 = X0 + (i === 0 ? 0 : W * 0.42 + (i - 1) * W * 0.3 + 40), x1 = x0 + w, hh = (Z1 - Z0) * hs[i]; a.box(x0, YF, Z0 + hh - 30, x1, YB, Z0 + hh); legs4(a, x0 + 30, YF + 30, x1 - 30, YB - 30, Z0, Z0 + hh - 30, 14); a.rect(x0, YF, x1, YB, 'EQUIP-DETAIL'); } return a.log('Added three tables of stepped heights side by side, each on four legs (plan and 3D).'); }
  if (v.kind === 'tier') { const nT = v.n; for (let i = 0; i < nT; i++) { const f = 1 - i * 0.28, z = Z0 + 120 + i * ((Z1 - Z0 - 160) / nT); a.box(cx - W * 0.5 * f, cy - D * 0.5 * f, z, cx + W * 0.5 * f, cy + D * 0.5 * f, z + 30); a.rect(cx - W * 0.5 * f, cy - D * 0.5 * f, cx + W * 0.5 * f, cy + D * 0.5 * f, 'EQUIP-DETAIL'); } a.box(X0, YF, Z0, X1, YB, Z0 + 120); a.cyl(cx, cy, Z0 + 120, Z0 + 120 + (nT - 1) * ((Z1 - Z0 - 160) / nT) + 30, 60, 14); return a.log(`Added a plinth and ${nT} stepped display tiers, each smaller than the one below (plan and 3D).`); }
  a.box(X0, YF, Z1 - 40, X1, YB, Z1); a.rect(X0 + 15, YF + 15, X1 - 15, YB - 15, 'EQUIP-DETAIL'); legs4(a, X0 + 50, YF + 50, X1 - 50, YB - 50, Z0, Z1 - 40, 26); a.box(X0 + 50, YF + 50, Z0 + 180, X1 - 50, YB - 50, Z0 + 200);
  a.box(X0 + 50, YF + 60, Z1 - 120, X1 - 50, YF + 80, Z1 - 40); a.log('Added the top with a skirt, four legs and a lower shelf (plan and 3D).');
}
function jewel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const bz = Z0 + (Z1 - Z0) * (v.tower ? 0.2 : 0.6);
  cab(a, { toe: 80, doors: 0 }); a.box(X0 + 5, YF + 5, Z0 + 80, X1 - 5, YB, bz - 2); a.box(X0, YF, bz - 40, X1, YB, bz);
  for (const k of v.tower ? [0] : [0, 1, 2]) { if (v.tower) break; }
  const n = v.tower ? 1 : Math.max(2, Math.round(W / 600)); for (let i = 0; i < n; i++) { const x0 = X0 + 15 + (i * (W - 30)) / n, x1 = X0 + 15 + ((i + 1) * (W - 30)) / n - 6; a.box(x0, YF + 4, Z0 + 100, x1, YF + 24, bz - 60); a.ycyl(YF, YF + 4, x1 - 30, (Z0 + bz) / 2, 14, 8); }
  a.frame(X0 + 5, bz, X1 - 5, Z1 - 20, YF, YF + 14, 20); a.frame(X0 + 5, bz, X1 - 5, Z1 - 20, YB - 14, YB, 20); for (const x of [X0 + 5, X1 - 25]) a.box(x, YF, bz, x + 20, YB, Z1 - 20); a.box(X0, YF, Z1 - 20, X1, YB, Z1);
  const sh = v.tower ? 4 : 2; for (let i = 0; i < sh; i++) { const z = bz + 10 + (i + 1) * ((Z1 - 20 - bz) / (sh + 1)); a.box(X0 + 25, YF + 14, z, X1 - 25, YB - 14, z + 6); }
  a.box(X0 + 30, YF + 20, bz, X1 - 30, YB - 20, bz + 14); lamp(a, cx, cy, Z1 - 20, 40);
  a.log(`Added the lower cabinet with ${n} drawer front${n > 1 ? 's' : ''} and locks, a glazed showcase frame with ${sh} glass shelves, a velvet pad and a top light (plan and 3D).`);
}
function cart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const bz0 = Z0 + 300, bz1 = Z1 - 180;
  for (const x of [X0 + 80, X1 - 80]) for (const y of [YF + 80, YB - 80]) { a.cyl(x, y, Z0 + 55, bz0 - 20, 7, 6); a.xcyl(x - 10, x + 10, y, Z0 + 50, 50, 12); a.circ(x, y, 50, 'EQUIP-HIDDEN'); }
  a.box(X0 + 40, YF + 40, bz0 - 40, X1 - 40, YB - 40, bz0 - 20); for (let x = X0 + 60; x < X1 - 60; x += 40) a.box(x, YF + 40, bz0 - 20, x + 6, YB - 40, bz0 - 14);
  const bx0 = X0 + (v.compact ? 20 : 0), bx1 = X1 - (v.compact ? 20 : 0);
  for (let z = bz0; z < bz1 - 6; z += 75) { a.box(bx0, YF, z, bx1, YF + 8, z + 8); a.box(bx0, YB - 8, z, bx1, YB, z + 8); a.box(bx0, YF, z, bx0 + 8, YB, z + 8); a.box(bx1 - 8, YF, z, bx1, YB, z + 8); }
  for (const x of [bx0, bx1 - 12]) for (const y of [YF, YB - 12]) a.box(x, y, bz0, x + 12, y + 12, bz1); for (let x = bx0 + 100; x < bx1 - 60; x += 100) { a.box(x, YF, bz0, x + 6, YF + 6, bz1); a.box(x, YB - 6, bz0, x + 6, YB, bz1); }
  a.box(bx0, YF, bz1 - 20, bx1, YB, bz1); if (v.seat) { a.box(bx0 + 40, YB - 340, bz1 - 340, bx1 - 40, YB - 20, bz1 - 320); a.box(bx0 + 40, YB - 340, bz1 - 340, bx1 - 40, YB - 330, bz1 - 130); a.rect(bx0 + 40, YB - 340, bx1 - 40, YB - 20, 'EQUIP-DETAIL'); }
  a.box(bx0, YB - 30, bz1, bx1, YB, Z1 - 80); a.xcyl(bx0, bx1, YB - 15, Z1 - 70, 18, 10); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-DETAIL'); a.rect(bx0, YF, bx1, YB);
  a.log(`Added the wire-style basket with a rim, a lower tray, four swivel wheels and a push handle${v.seat ? ', and a fold-down child seat' : ''} (plan and 3D).`);
}
function basket(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  if (v.wheeled) { for (const x of [X0 + 40, X1 - 40]) { a.cyl(x, YF + 40, Z0 + 50, Z0 + 110, 6, 6); a.xcyl(x - 8, x + 8, YF + 40, Z0 + 40, 40, 10); } a.xcyl(X0 + 40, X0 + 60, YB - 40, Z0 + 70, 70, 14); a.xcyl(X1 - 60, X1 - 40, YB - 40, Z0 + 70, 70, 14); a.tube([[cx - 150, YB - 20, Z0 + 300], [cx - 150, YB + 0, Z1 - 20], [cx + 150, YB + 0, Z1 - 20], [cx + 150, YB - 20, Z0 + 300]], [10, 10, 10, 10], 6); }
  const z0 = Z0 + (v.wheeled ? 120 : 0), z1 = Z1 - (v.wheeled ? 0 : 160);
  tray(a, X0, YF, X1, YB, z0, z1, 8); for (let x = X0 + 50; x < X1; x += 70) a.box(x, YF, z0 + 20, x + 20, YF + 8, z1 - 30);
  if (!v.wheeled) { a.tube([[X0 + 20, cy, z1], [X0 + 20, cy, Z1 - 20], [X1 - 20, cy, Z1 - 20], [X1 - 20, cy, z1]], [9, 9, 9, 9], 6); }
  a.rect(X0 + 8, YF + 8, X1 - 8, YB - 8, 'EQUIP-DETAIL');
  a.log(`Added a ${v.wheeled ? 'wheeled ' : ''}basket tray with vent slots and ${v.wheeled ? 'a telescoping handle, two wheels and two feet' : 'a swing carry handle'} (plan and 3D).`);
}
function checkout(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const lo = Object.create(a); lo.Z1 = Z0 + 900; lo.H = 900; cab(lo, { toe: 80, doors: 0, topT: 45 }); const top = Z0 + 900;
  a.box(X0 + 20, YF + 40, top, X0 + W * 0.62, YB - 120, top + 50); a.box(X0 + 20, YF + 40, top + 50, X0 + W * 0.62, YF + 60, top + 90); a.box(X0 + 20, YB - 140, top + 50, X0 + W * 0.62, YB - 120, top + 90);
  rollers(a, X0 + 30, X0 + W * 0.62 - 10, YF + 60, YB - 140, top + 58, 10, 70); a.rect(X0 + 20, YF + 40, X0 + W * 0.62, YB - 120, 'EQUIP-DETAIL');
  a.box(X0 + W * 0.62, YF + 30, top - 40, X0 + W * 0.62 + 40, YB - 100, top + 140);                                  // divider stop
  if (v.self) { screen(a, X0 + W * 0.7, top + 300, X1 - 60, top + 640, YF + 120, 30); a.box(X0 + W * 0.7, YF + 100, top + 30, X1 - 60, YB - 120, top + 300); a.box(X0 + W * 0.7, YF + 70, top + 100, X1 - 60, YF + 100, top + 180); }
  else { a.cyl(X0 + W * 0.7, YB - 200, top, top + 520, 20, 10); screen(a, X0 + W * 0.7 - 120, top + 520, X0 + W * 0.7 + 200, top + 760, YB - 200, 30); a.box(X0 + W * 0.7, YF + 30, top, X1 - 60, YF + 330, top + 10); a.rect(X0 + W * 0.7, YF + 30, X1 - 60, YF + 330, 'EQUIP-DETAIL'); }
  a.box(X0 + W * 0.62 + 40, YB - 340, top - 450, X1 - 20, YB - 40, top - 400); a.rect(X0 + W * 0.62 + 40, YB - 340, X1 - 20, YB - 40, 'EQUIP-HIDDEN');
  a.log(`Added the counter base, the sunken belt well with rollers and side walls, a divider stop${v.self ? ', the scan area, a touch screen and a card reader' : ', a customer display on a pole and a card tray'} (plan and 3D).`);
}
function eas(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const pw = v.pair ? 90 : W - 40, xs = v.pair ? [[X0 + 20, X0 + 20 + pw], [X1 - 20 - pw, X1 - 20]] : [[X0 + 20, X1 - 20]];
  for (const [x0, x1] of xs) { a.box(x0 - 20, YF, Z0, x1 + 20, YB, Z0 + 20); a.box(x0, cy - 45, Z0 + 20, x1, cy + 45, Z1 - 120); a.box(x0 + 10, cy - 60, Z1 - 120, x1 - 10, cy + 60, Z1); a.box(x0 + 20, cy - 52, Z1 - 100, x1 - 20, cy - 45, Z1 - 20); a.rect(x0, cy - 45, x1, cy + 45, 'EQUIP-DETAIL'); a.rect(x0 - 20, YF, x1 + 20, YB, 'EQUIP-DETAIL'); }
  a.log(`Added ${v.pair ? 'two upright antenna panels' : 'one wide antenna panel'} with a base plate, a top light window and a cap (plan and 3D).`);
}
function fitting(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const n = v.n, sw = W / n;
  for (let i = 0; i <= n; i++) { const x = X0 + i * sw; a.box(x - 20, YF + 20, Z0 + 100, x + 20, YB, Z1 - 120); a.line(x, YF + 20, x, YB, 'EQUIP-DETAIL'); }
  a.box(X0, YB - 20, Z0 + 100, X1, YB, Z1 - 120); a.box(X0, YF + 20, Z1 - 120, X1, YB, Z1 - 80);
  for (let i = 0; i < n; i++) {
    const x0 = X0 + i * sw + 20, x1 = X0 + (i + 1) * sw - 20, zc = Z0 + 100;
    a.box(x0 + 40, YF, zc, x1 - 40, YF + 20, Z1 - 120); for (let z = zc + 100; z < Z1 - 260; z += 40) a.box(x0 + 60, YF - 8, z, x1 - 60, YF, z + 8);
    a.ycyl(YF - 16, YF, x1 - 80, zc + 900, 12, 8); a.box(x0 + 20, YB - 480, zc + 430, x1 - 20, YB - 40, zc + 470); a.box(x0 + 40, YB - 24, zc + 900, x1 - 40, YB - 20, Z1 - 300);   // bench, mirror
    for (let k = 0; k < 3; k++) a.cyl(x0 + 150 + k * 60, YB - 40, zc + 1400, zc + 1400 + 0.1, 0.1, 3);
    a.arc(x0 + 40, YF, x1 - x0 - 80, 270, 360); a.line(x0 + 40, YF, x0 + 40, YF - (x1 - x0 - 80), 'EQUIP-SWING');
    a.rect(x0 + 20, YB - 480, x1 - 20, YB - 40, 'EQUIP-DETAIL');
  }
  a.clear('door swing', X0, YF - (sw - 120), X1, YF, 80);
  a.log(`Added ${n} stall${n > 1 ? 's' : ''} with partitions, a louvered door each with swing, a bench, a mirror and a coat hook (plan and 3D).`);
}
function grille(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  if (v.kind === 'scissor') {
    for (const x of [X0 + 30, X1 - 30]) a.box(x - 30, YF, Z0, x + 30, YB, Z1);
    const n = Math.round(W / 220), dx = (W - 120) / n, hh = Z1 - Z0 - 60;
    for (let i = 0; i < n; i++) { const x = X0 + 60 + i * dx; a.tube([[x, cy, Z0 + 30], [x + dx, cy, Z0 + 30 + hh * 0.5]], [10, 10], 6); a.tube([[x + dx, cy, Z0 + 30], [x, cy, Z0 + 30 + hh * 0.5]], [10, 10], 6); a.tube([[x, cy, Z0 + 30 + hh * 0.5], [x + dx, cy, Z1 - 30]], [10, 10], 6); a.tube([[x + dx, cy, Z0 + 30 + hh * 0.5], [x, cy, Z1 - 30]], [10, 10], 6); }
    a.box(X0 + 60, cy - 20, Z0, X1 - 60, cy + 20, Z0 + 30); a.box(X0 + 60, cy - 20, Z1 - 30, X1 - 60, cy + 20, Z1); a.line(X0, cy, X1, cy);
    return a.log('Added two end posts, a bottom and a top rail and a folding scissor lattice of crossed bars between them (plan and 3D).');
  }
  const hz = 300; a.box(X0, YF, Z1 - hz, X1, YB, Z1);
  for (const x of [X0, X1 - 50]) a.box(x, YF, Z0, x + 50, YB, Z1 - hz);
  a.box(X0 + 50, cy - 25, Z0, X1 - 50, cy + 25, Z0 + 60);
  if (v.kind === 'link') { for (let x = X0 + 70; x < X1 - 60; x += 100) a.box(x, cy - 5, Z0 + 60, x + 8, cy + 5, Z1 - hz); for (let z = Z0 + 150; z < Z1 - hz; z += 150) a.box(X0 + 50, cy - 4, z, X1 - 50, cy + 4, z + 8); }
  else for (let z = Z0 + 60; z < Z1 - hz; z += 70) a.box(X0 + 50, cy - 10, z, X1 - 50, cy + 10, z + 64);
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.line(X0 + 50, cy, X1 - 50, cy);
  a.log(`Added the head box with the coil, two guide tracks, a bottom bar and a ${v.kind === 'link' ? 'link grille of vertical rods and cross links' : 'curtain of solid slats'} (plan and 3D).`);
}
function revolving(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const R = W / 2 - 10, H = Z1 - Z0;
  a.cyl(cx, cy, Z0, Z0 + 20, R + 10, 32); a.cyl(cx, cy, Z1 - 200, Z1, R + 10, 32); a.cyl(cx, cy, Z0 + 20, Z1 - 200, 25, 12);
  for (const [g0, g1] of [[-70, 70], [110, 250]]) { for (let g = g0; g <= g1; g += (g1 - g0) / 4) { const t = (g * Math.PI) / 180; a.cyl(cx + R * Math.cos(t), cy + R * Math.sin(t), Z0 + 20, Z1 - 200, 25, 8); } sector(a, cx, cy, R - 12, R + 8, g0, g1, Z1 - 330, Z1 - 200, 8); sector(a, cx, cy, R - 12, R + 8, g0, g1, Z0 + 20, Z0 + 110, 8); a.arc(cx, cy, R, g0 < 0 ? 360 + g0 : g0, g1 < 0 ? 360 + g1 : g1, 'EQUIP'); }
  for (let i = 0; i < v.wings; i++) { const t = (i / v.wings) * Math.PI * 2 + 0.3; const x = cx + (R - 30) * Math.cos(t), y = cy + (R - 30) * Math.sin(t); a.tube([[cx, cy, Z0 + 150], [x, y, Z0 + 150]], [18, 18], 6); a.tube([[cx, cy, Z1 - 330], [x, y, Z1 - 330]], [18, 18], 6); a.tube([[x, y, Z0 + 150], [x, y, Z1 - 330]], [14, 14], 6); a.tube([[cx, cy, Z0 + 150], [cx, cy, Z1 - 330]], [14, 14], 6); a.line(cx, cy, x, y, 'EQUIP-SWING'); }
  a.circ(cx, cy, R); a.circ(cx, cy, 25, 'EQUIP-DETAIL');
  a.log(`Added the floor and canopy discs, the central shaft, two curved glazed enclosure walls as posts and rings, and ${v.wings} door wings with swing lines (plan and 3D).`);
}
function slider(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(X0, YF, Z1 - 250, X1, YB, Z1); a.box(X0, YF + 40, Z0, X1, YB - 40, Z0 + 20); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  const side = v.side, open = v.leaves, lw = (W - 2 * side) / open;
  a.box(X0, YF, Z0, X0 + 60, YB, Z1 - 250); a.box(X1 - 60, YF, Z0, X1, YB, Z1 - 250);
  for (let i = 0; i < open; i++) { const x0 = X0 + side + i * lw + (i ? 4 : 0), x1 = X0 + side + (i + 1) * lw - 4; const y0 = i % 2 ? cy - 20 : cy - 60, y1 = y0 + 40; a.frame(x0, Z0 + 20, x1, Z1 - 250, y0, y1, 50); a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); a.box(x0 + (i % 2 ? 30 : lw - 50), y0 - 20, Z0 + 900, x0 + (i % 2 ? 40 : lw - 40), y0 + 0, Z0 + 1300); }
  if (side > 80) for (const [x0, x1] of [[X0 + 60, X0 + side], [X1 - side, X1 - 60]]) { a.frame(x0, Z0 + 20, x1, Z1 - 250, cy - 20, cy + 20, 40); a.rect(x0, cy - 20, x1, cy + 20, 'EQUIP-DETAIL'); }
  a.box(cx - 100, YF - 14, Z1 - 200, cx + 100, YF, Z1 - 120); a.line(X0 + side, cy - 40, X1 - side, cy - 40, 'EQUIP-DETAIL');
  a.log(`Added the head box with a sensor window, the track, two jambs, ${open} sliding glazed leaves in frames${side > 80 ? ' and fixed side panels' : ''} (plan and 3D).`);
}
function mallCart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const lo = Object.create(a); lo.Z1 = Z0 + 900; lo.H = 900; cab(lo, { casters: 90, doors: v.doors, pull: 'bar', topT: 40 }); const top = Z0 + 900;
  if (!v.canopy) { a.box(X0 + 20, YB - 30, top, X1 - 20, YB, Z1); }
  if (v.canopy) { for (const x of [X0 + 30, X1 - 30]) for (const y of [YF + 30, YB - 30]) a.cyl(x, y, Z0 + 900, Z1 - 120, 20, 8); a.box(X0, YF, Z1 - 120, X1, YB, Z1 - 60); a.box(X0 + 10, YF + 10, Z1 - 60, X1 - 10, YB - 10, Z1); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.box(X0 + 40, YF - 4, Z1 - 100, X1 - 40, YF + 4, Z1 - 70); for (const x of [X0 + 30, X1 - 30]) a.cyl(x, YB - 30, Z0 + 900, Z0 + 1000, 0, 3); }
  for (let i = 0; i < v.tiers; i++) { const z = top + 60 + i * 200; a.box(X0 + 60, YB - 300, z, X1 - 60, YB - 40, z + 12); a.box(X0 + 60, YB - 300, z + 12, X1 - 60, YB - 290, z + 50); }
  a.box(cx + 60, cy + 30, top + 20, X1 - 60, YB - 30, top + 80); a.box(X0 + 60, YF + 30, top + 20, cx - 60, YF + 230, top + 30);
  a.log(`Added the cabinet base on casters with doors and pulls, a worktop${v.canopy ? ', four posts and a canopy roof with a sign band' : ''}, ${v.tiers} display shelves and a card reader (plan and 3D).`);
}
function island(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const ringW = 300, zt = Z0 + 900;
  a.box(X0, YF, Z0 + 80, X1, YF + ringW, zt); a.box(X0, YB - ringW, Z0 + 80, X1, YB, zt); a.box(X0, YF + ringW, Z0 + 80, X0 + ringW, YB - ringW, zt); a.box(X1 - ringW, YF + ringW, Z0 + 80, X1, YB - ringW, zt);
  a.box(X0 + 30, YF + 30, Z0, X1 - 30, YB - 30, Z0 + 80); a.box(X0 - 10, YF - 10, zt, X1 + 10, YB + 10, zt + 40);
  a.rect(X0 + ringW, YF + ringW, X1 - ringW, YB - ringW, 'EQUIP-DETAIL');
  for (const [x0, y0, x1, y1] of [[X0, YF, X1, YF + 20], [X0, YB - 20, X1, YB], [X0, YF, X0 + 20, YB], [X1 - 20, YF, X1, YB]]) a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL');
  for (const [x0, y0, x1, y1] of [[X0 + 40, YF - 4, X1 - 40, YF + 4], [X0 + 40, YB - 4, X1 - 40, YB + 4]]) a.box(x0, y0, zt + 40, x1, y1, zt + 40 + 700);
  if (v.glass) for (const k of [-1, 1]) { const y = k < 0 ? YF + ringW + 20 : YB - ringW - 20; a.frame(X0 + ringW + 20, zt + 40, X1 - ringW - 20, zt + 40 + 500, y - 5, y + 5, 20); }
  for (const x of [X0 + 40, X1 - 40]) { a.box(x - 20, YF - 4, zt + 40, x + 20, YF + 4, Z1 - 100); a.box(x - 20, YB - 4, zt + 40, x + 20, YB + 4, Z1 - 100); }
  a.box(X0 + 40, YF - 4, Z1 - 100, X1 - 40, YF + 6, Z1); a.box(X0 + 40, YB - 6, Z1 - 100, X1 - 40, YB + 4, Z1);
  a.log(`Added the ring counter base with a plinth, a worktop overhang, shelves behind the ${v.glass ? 'glazed ' : ''}inner display and two header sign bands with posts (plan and 3D).`);
}
function planter(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const R = W / 2, wallH = v.wall;
  a.cyl(cx, cy, Z0, Z0 + wallH, R, 36); a.cyl(cx, cy, Z0 + wallH, Z0 + wallH + 30, R + 25, 36); a.circ(cx, cy, R); a.circ(cx, cy, R + 25, 'EQUIP-DETAIL'); a.circ(cx, cy, R - 150, 'EQUIP-DETAIL');
  a.cyl(cx, cy, Z0 + wallH + 30, Z0 + wallH + 60, R - 150, 24);
  for (let i = 0; i < v.shrubs; i++) { const t = (i / v.shrubs) * Math.PI * 2, r = (R - 300) * (i % 2 ? 0.8 : 0.5); a.ell(cx + Math.cos(t) * r, cy + Math.sin(t) * r, Z0 + wallH + 190, 190, 190, 140, 12, 7); a.circ(cx + Math.cos(t) * r, cy + Math.sin(t) * r, 150, 'EQUIP-DETAIL'); }
  if (v.tree) { a.cyl(cx, cy, Z0 + wallH + 60, Z0 + wallH + 1500, 45, 10); a.ell(cx, cy, Z1 - 600, 550, 550, 600, 14, 8); a.circ(cx, cy, 550, 'EQUIP-DETAIL'); }
  a.log(`Added the round wall with a cap ring, the soil surface, ${v.shrubs} shrub masses${v.tree ? ' and a tree with a trunk and a crown' : ''} (plan and 3D).`);
}

// ---- families ------------------------------------------------------------------------------------------------------------------------
export default [
  fam({ cat: CAT, title: 'Generic self-service check-in kiosk', desc: checkinDesc,
    vs: [['standing, one screen', 18, 20, 66, 0, { screens: 1, printer: false }], ['seated reach height, one screen', 18, 20, 54, 0, { screens: 1, low: true }], ['two screens', 30, 22, 66, 0, { screens: 2, printer: true }], ['one screen with tag printer and passport reader', 20, 24, 66, 0, { screens: 1, printer: true, passport: true }]], build: checkin }),
  fam({ cat: CAT, title: 'Generic bag drop unit',
    desc: (v) => `Check-in bag drop with ${v.belts === 2 ? 'two in-line belts' : 'a belt'} between side guards and light-curtain frames, a screen post${v.printer ? ' with a tag printer slot' : ''}${v.scale ? ' and a marked weighing section' : ''}.`,
    vs: [['one belt, 8 ft', 48, 96, 82, 0, { belts: 1, printer: false, scale: true }], ['one belt with tag printer', 48, 108, 82, 0, { belts: 1, printer: true, scale: true }], ['two belts, 14 ft', 48, 168, 82, 0, { belts: 2, printer: true, scale: true }]], build: bagdrop }),
  fam({ cat: CAT, title: 'Generic baggage weighing platform',
    desc: (v) => `Floor-recessed style platform scale with a framed deck${v.rollers ? ' and a roller top' : ''}${v.display ? ' and a weight display on a post' : ''}.`,
    vs: [['24 in by 30 in, display post', 24, 30, 36, 0, { display: true, rollers: false }], ['36 in by 48 in, roller top', 36, 48, 36, 0, { display: true, rollers: true }], ['30 in by 30 in, flat deck', 30, 30, 4, 0, { display: false, rollers: false }]], build: scale }),

  fam({ cat: CAT, title: 'Generic checkpoint divest table',
    desc: (v) => `Screening lane roller table with a roller bed between side rails, an end stop and leg frames with cross rails${v.shelf ? ' and a lower bin shelf' : ''}.`,
    vs: [['6 ft', 72, 30, 40, 0, { shelf: false }], ['8 ft', 96, 30, 40, 0, { shelf: true }], ['10 ft', 120, 30, 40, 0, { shelf: true }], ['12 ft', 144, 30, 40, 0, { shelf: true }]], build: divest }),
  fam({ cat: CAT, title: 'Generic screening bin',
    desc: (v) => v.rack ? `Wheeled rack with ${v.n} shelves each holding a screening bin, on four casters with end frames.` : `${v.n === 1 ? 'A single' : 'A nested stack of'} rectangular screening bin${v.n > 1 ? 's' : ''} with rims and hand slots.`,
    vs: [['single bin', 24, 16, 5, 0, { n: 1 }], ['stack of 10', 24, 16, 14, 0, { n: 10 }], ['stack of 20', 24, 16, 24, 0, { n: 20 }], ['rack of 6 shelves', 28, 20, 56, 0, { n: 6, rack: true }]], build: binStack }),
  fam({ cat: CAT, title: 'Generic carry-on screening scanner',
    desc: (v) => `Baggage x-ray scanner with a ${v.opening > 700 ? 'large' : v.opening > 600 ? 'standard' : 'compact'} tunnel opening, curtain strips at both ends, infeed and exit roller beds with guard rails and legs${v.monitor ? ', and an operator display post' : ''}.`,
    vs: [['compact tunnel', 90, 32, 54, 0, { tunnel: 1000, opening: 480, belt: 0, monitor: true }], ['standard tunnel', 108, 34, 58, 0, { tunnel: 1250, opening: 650, belt: 0, monitor: true }], ['large tunnel', 126, 36, 62, 0, { tunnel: 1450, opening: 800, belt: 0, monitor: true }], ['standard tunnel, short beds', 86, 34, 58, 0, { tunnel: 1250, opening: 650, belt: 0, monitor: false }]], build: xray }),
  fam({ cat: CAT, title: 'Generic body scanner portal',
    desc: (v) => `Walk-in body scanner: a foot platform with foot marks, two scanner towers and a roof unit${v.glass ? ', glazed panels at the front and back' : ''}${v.ramp ? ' and an entry ramp' : ''}, two hand grips.`,
    vs: [['open frame', 48, 48, 100, 0, { glass: false }], ['with glazed panels', 48, 52, 100, 0, { glass: true }], ['with glazed panels and ramp', 60, 54, 100, 0, { glass: true, ramp: true }]], build: portal }),
  fam({ cat: CAT, title: 'Generic walk-through metal detector',
    desc: (v) => `Arch detector with two side panels, ${v.zones} zone strips on each, a header with an indicator bar and a floor mat${v.panel ? ' and side guards' : ''}.`,
    vs: [['6 zone', 34, 22, 90, 0, { zones: 6 }], ['18 zone', 34, 22, 90, 0, { zones: 18 }], ['33 zone with side guards', 36, 24, 90, 0, { zones: 33, panel: true }]], build: wtmd }),
  fam({ cat: CAT, title: 'Generic screening lane divider',
    desc: (v) => `Floor-standing lane divider: posts on base plates with a framed panel and a top rail${v.sign ? ' and a sign plate' : ''}.`,
    vs: [['3 ft run', 36, 12, 40, 0, {}], ['4 ft run, with sign', 48, 12, 40, 0, { sign: true }], ['6 ft run', 72, 12, 40, 0, {}], ['8 ft run, with sign', 96, 12, 40, 0, { sign: true }]], build: laneDivider }),
  fam({ cat: CAT, title: 'Generic retractable belt stanchion',
    desc: (v) => `${v.wall ? 'Post with a retractable belt cassette head and a wall receiver' : 'Two posts with weighted round bases and retractable belt heads'}, with ${v.double ? 'two belts' : 'a belt'} stretched between them.`,
    vs: [['7 ft belt', 84, 14, 40, 0, {}], ['10 ft belt', 120, 14, 40, 0, {}], ['13 ft belt', 156, 14, 40, 0, {}], ['10 ft, two belts', 120, 14, 40, 0, { double: true }], ['wall mounted, 7 ft belt', 86, 14, 40, 0, { wall: true }]], build: stanchion }),
  fam({ cat: CAT, title: 'Generic rope and post barrier',
    desc: (v) => `Two ${v.ball ? 'ball-top' : 'flat-top'} posts with round bases and a rope hanging between them on end hooks.`,
    vs: [['ball top, 6 ft rope', 72, 14, 38, 0, { ball: true }], ['ball top, 8 ft rope', 96, 14, 38, 0, { ball: true }]], build: ropePost }),
  fam({ cat: CAT, title: 'Generic crowd control barrier',
    desc: (v) => `Pedestrian barrier with two post-and-foot ends, a top and bottom rail and ${v.bars} vertical bars.`,
    vs: [['folding style, 6 ft', 72, 16, 42, 0, { bars: 5 }], ['rack style, 7.5 ft', 90, 18, 42, 0, { bars: 7 }], ['heavy steel, 8 ft', 96, 20, 44, 0, { bars: 9 }]], build: crowdBarrier }),
  fam({ cat: CAT, title: 'Generic boarding gate reader post',
    desc: (v) => `Gate post on a base plate with a column and a head holding a screen, ${v.dual ? 'two scan windows' : 'a scan window'} and status lights.`,
    vs: [['one reader', 16, 14, 44, 0, {}], ['two readers', 24, 14, 44, 0, { dual: true }], ['one reader, tall', 16, 14, 52, 0, {}]], build: gatePost }),

  fam({ cat: CAT, title: 'Generic baggage claim belt',
    desc: (v) => v.curve ? `Baggage claim carousel section turning ${v.curve} degrees: a slat belt with inner and outer skirts on a base frame.` : 'Straight baggage claim carousel section: a slat belt with sloped side skirts and a back guard on a base frame.',
    vs: [['straight, 10 ft', 120, 56, 40, 0, { bw: 900 }], ['straight, 20 ft', 240, 56, 40, 0, { bw: 900 }], ['curved, 45 degrees', 150, 150, 40, 0, { bw: 1100, curve: 45 }], ['curved, 90 degrees', 150, 150, 40, 0, { bw: 1100, curve: 90 }]], build: carousel }),
  fam({ cat: CAT, title: 'Generic baggage conveyor',
    desc: (v) => `${v.rise ? 'Sloped' : 'Flat'} ${v.rollers ? 'roller' : 'belt'} conveyor with side guards, support legs, a drive and a control box.`,
    vs: [['flat belt, 10 ft', 120, 36, 40, 0, {}], ['flat belt, 20 ft', 240, 36, 40, 0, {}], ['roller, 10 ft', 120, 36, 40, 0, { rollers: true }], ['sloped belt, 12 ft', 144, 36, 62, 0, { rise: true }]], build: conveyor }),
  fam({ cat: CAT, title: 'Generic airport luggage cart',
    desc: (v) => `Luggage cart with ${v.tiers === 2 ? 'two decks' : 'a deck'}, rails, a push handle with grip and four swivel wheels${v.brake ? ' and a brake lever' : ''}.`,
    vs: [['one deck', 22, 40, 44, 0, { tiers: 1 }], ['two decks', 22, 40, 52, 0, { tiers: 2 }], ['one deck with brake', 24, 42, 44, 0, { tiers: 1, brake: true }]], build: luggageCart }),
  fam({ cat: CAT, title: 'Generic airport wheelchair',
    desc: (v) => `Wheelchair with ${v.big ? 'large rear wheels and hand rims' : 'four small wheels'}, seat, back, armrests and footplates${v.attendant ? ', with attendant push handles' : ''}.`,
    vs: [['self-propelled', 26, 40, 36, 0, { big: true }], ['transport chair', 24, 38, 36, 0, { attendant: true }], ['wide seat', 32, 40, 36, 0, { big: true, attendant: true }]], build: wheelchair }),
  // ---- information, wayfinding, services ---------------------------------------------------------------------------------------
  fam({ cat: CAT, title: 'Generic flight information display stand',
    desc: (v) => `Floor-standing display on a base plate and column with ${v.dbl ? 'a screen on each side' : 'one screen'} in a ${v.sw > v.sh ? 'landscape' : 'portrait'} frame.`,
    vs: [['portrait, one sided', 30, 20, 84, 0, { sw: 560, sh: 980, dbl: false }], ['portrait, two sided', 30, 22, 84, 0, { sw: 700, sh: 1220, dbl: true }], ['landscape, one sided', 60, 20, 72, 0, { sw: 1400, sh: 800, dbl: false }]], build: stand }),
  fam({ cat: CAT, title: 'Generic ceiling-hung directional sign',
    desc: (v) => `Double-width sign with ${v.n} stacked panel${v.n > 1 ? 's' : ''}, each with an arrow pictogram and text bars, two hanger rods and a ceiling bar.`,
    vs: [['one panel', 60, 4, 36, 84, { n: 1, dirs: [1] }], ['two panels', 60, 4, 56, 64, { n: 2, dirs: [1, -1] }], ['three panels', 72, 4, 72, 48, { n: 3, dirs: [0, 1, -1] }]], build: ceilSign }),
  fam({ cat: CAT, title: 'Generic freestanding pylon directory',
    desc: (v) => `Slab-style directory on a base with a header and ${v.rows} listing panels with arrows${v.dbl ? ' on both faces' : ' on one face'}.`,
    vs: [['72 in tall, one sided', 36, 8, 72, 0, { rows: 4, dbl: false }], ['84 in tall, two sided', 40, 10, 84, 0, { rows: 5, dbl: true }], ['96 in tall, two sided', 44, 12, 96, 0, { rows: 6, dbl: true }]], build: pylon }),
  fam({ cat: CAT, title: 'Generic wall-mounted directory map',
    desc: (v) => `Framed wall board with a map plate showing area blocks, a header strip with an arrow${v.lit ? ' and a top light bar' : ''}.`,
    vs: [['36 in by 48 in', 36, 3, 48, 48, { lit: false }], ['48 in by 60 in, lit', 48, 4, 60, 42, { lit: true }], ['60 in by 72 in, lit', 60, 4, 72, 36, { lit: true }]], build: wallMap }),
  fam({ cat: CAT, title: 'Generic projecting blade sign',
    desc: (v) => `Wall-mounted blade sign with a wall plate, two arms and a double-sided panel carrying ${v.icons} pictogram plate${v.icons > 1 ? 's' : ''} on each face.`,
    vs: [['one pictogram', 12, 24, 36, 72, { icons: 1 }], ['two pictograms', 14, 28, 52, 60, { icons: 2 }], ['three pictograms', 16, 32, 66, 48, { icons: 3 }]], build: blade }),
  fam({ cat: CAT, title: 'Generic interactive directory kiosk',
    desc: (v) => `Touch-screen directory on a base plate and column, ${v.dbl ? 'with a screen on each side' : 'one screen'} in a head and a handset shelf.`,
    vs: [['43 in screen', 28, 18, 72, 0, { sw: 540, sh: 960, dbl: false, touch: true }], ['55 in screen', 34, 20, 78, 0, { sw: 690, sh: 1220, dbl: false, touch: true }], ['two sided, 43 in', 30, 22, 72, 0, { sw: 540, sh: 960, dbl: true, touch: true }]], build: stand }),
  fam({ cat: CAT, title: 'Generic automated teller machine',
    desc: (v) => `Cash machine ${v.wall ? 'with a through-wall fascia and a recessed front' : 'cabinet'}${v.canopy ? ' under a hood' : ''}: a screen, keypad, card reader, receipt slot, cash dispenser and a lower door.`,
    vs: [['lobby cabinet', 28, 32, 66, 0, { wall: false }], ['through-wall fascia', 30, 14, 72, 0, { wall: true }], ['drive-up with hood', 30, 36, 84, 0, { wall: false, canopy: true }]], build: atm }),
  fam({ cat: CAT, title: 'Generic vending machine',
    desc: (v) => `Vending cabinet with a glazed window showing ${v.rows} shelves of ${v.kind === 'drink' ? 'bottles' : v.kind === 'frozen' ? 'frozen packs' : 'spiral-coil snacks'}, a keypad, display, card and coin slots, a delivery flap and a header light.`,
    vs: [['snack, 6 shelves', 39, 33, 72, 0, { kind: 'snack', rows: 6, cols: 7 }], ['cold drink, 5 shelves', 39, 34, 72, 0, { kind: 'drink', rows: 5, cols: 6 }], ['combination, 5 shelves', 39, 36, 74, 0, { kind: 'snack', rows: 5, cols: 6 }], ['frozen, 4 shelves', 36, 34, 70, 0, { kind: 'frozen', rows: 4, cols: 5 }]], build: vend }),
  fam({ cat: CAT, title: 'Generic public locker bank',
    desc: (v) => `Locker bank of ${v.cols * v.tiers} compartments in ${v.cols} columns and ${v.tiers} tiers, each with a vented door, a handle and a number plate${v.charge ? ', and a power socket plate inside each' : ''}${v.kiosk ? '; a payment column with a touch screen at one end' : ''}.`,
    vs: [['luggage, 8 large, with payment column', 82, 24, 78, 0, { cols: 4, tiers: 2, kiosk: true }], ['storage, 12 compartments', 60, 18, 72, 0, { cols: 4, tiers: 3 }], ['phone charging, 12 compartments', 48, 8, 36, 0, { cols: 6, tiers: 2, charge: true }], ['parcel pickup, 15 compartments', 90, 20, 78, 0, { cols: 5, tiers: 3, kiosk: true }]], build: lockers }),
  fam({ cat: CAT, title: 'Generic device charging station',
    desc: (v) => v.kind === 'tower' ? `Charging tower on a base plate with two faces of ${v.ports} socket and USB panels.` : v.kind === 'table' ? `Counter table on four legs with ${v.ports} socket and USB modules set into the top.` : `Wall-mounted charging bar with ${v.ports} socket and USB panels.`,
    vs: [['tower, 4 panels each face', 16, 16, 48, 0, { kind: 'tower', ports: 4 }], ['table, 6 modules', 72, 30, 42, 0, { kind: 'table', ports: 6 }], ['wall bar, 6 panels', 60, 4, 8, 40, { kind: 'bar', ports: 6 }]], build: charger }),
  fam({ cat: CAT, title: 'Generic waste and recycling station',
    desc: (v) => `Station of ${v.n} bod${v.n > 1 ? 'ies' : 'y'} with round top openings, label plates and kick strips${v.tray ? ', and a tray rest shelf above' : ''}.`,
    vs: [['single stream', 16, 16, 40, 0, { n: 1 }], ['two stream', 30, 16, 42, 0, { n: 2 }], ['three stream', 44, 18, 42, 0, { n: 3 }], ['three stream with tray rest', 48, 22, 54, 0, { n: 3, tray: true }]], build: waste }),
  fam({ cat: CAT, title: 'Generic restroom grab bar',
    desc: (v) => `${v.shape === 'L' ? 'L-shaped' : 'Straight'} stainless-style grab bar tube with wall flanges at each mounting point.`,
    vs: [['straight, 18 in', 18, 3, 3, 33, { shape: 'S' }], ['straight, 42 in', 42, 3, 3, 33, { shape: 'S' }], ['L shaped, 36 in by 42 in', 36, 3, 42, 30, { shape: 'L' }]], build: grab }),
  fam({ cat: CAT, title: 'Generic baby changing station',
    desc: (v) => `Wall shell with ${v.open ? (v.vertical ? 'a lowered vertical bed with side rails' : 'a lowered bed with side rails and a safety strap') : 'a closed cover with a latch'}.`,
    vs: [['horizontal, closed', 36, 6, 21, 36, { open: false }], ['horizontal, open', 36, 22, 21, 36, { open: true }], ['vertical, open', 22, 8, 36, 30, { open: true, vertical: true }]], build: babyChange }),
  fam({ cat: CAT, title: 'Generic restroom hand dryer',
    desc: (v) => v.kind === 'blade' ? 'High-speed dryer with a wall box, a central drying slot and two blade slits.' : v.kind === 'push' ? 'Wall dryer with a rounded cover, a push button and a nozzle.' : 'Wall-recessed dryer with a drying hood, a nozzle and a catch tray.',
    vs: [['blade type', 12, 10, 28, 40, { kind: 'blade' }], ['push button', 11, 9, 12, 42, { kind: 'push' }], ['recessed', 14, 8, 28, 36, { kind: 'rec' }]], build: dryer }),
  fam({ cat: CAT, title: 'Generic toilet tissue dispenser',
    desc: (v) => `Wall dispenser with ${v.rolls} ${v.jumbo ? 'jumbo' : 'standard'} roll${v.rolls > 1 ? 's' : ''} on ${v.jumbo ? 'vertical spindles' : 'stacked spindles'} behind a front-opening housing.`,
    vs: [['two standard rolls', 7, 6, 14, 24, { rolls: 1, jumbo: false }], ['single jumbo roll', 11, 11, 11, 24, { rolls: 1, jumbo: true }], ['twin jumbo rolls', 22, 11, 11, 24, { rolls: 2, jumbo: true }]], build: tissue }),

  // ---- retail ---------------------------------------------------------------------------------------------------------------------
  fam({ cat: CAT, title: 'Generic retail gondola shelving',
    desc: (v) => `${v.sides === 2 ? 'Double-sided' : 'Single-sided'} gondola with a plinth, upright posts, a ${v.back === 'solid' ? 'solid' : 'pegboard'} back, ${v.shelves} shelves per side with price lips and a top cap.`,
    vs: [['48 in tall, double sided', 48, 30, 48, 0, { sides: 2, back: 'solid', shelves: 4 }], ['66 in tall, double sided', 48, 30, 66, 0, { sides: 2, back: 'peg', shelves: 5 }], ['72 in tall, wall run', 48, 18, 72, 0, { sides: 1, back: 'solid', shelves: 5 }]], build: gondola }),
  fam({ cat: CAT, title: 'Generic retail endcap display',
    desc: (v) => `Gondola endcap with a plinth, a back panel, side uprights and a header sign, ${v.kind === 'bins' ? v.n + ' open bins' : v.kind === 'peg' ? 'a pegboard with ' + v.n + ' rows of hooks' : v.n + ' shelves with price lips'}.`,
    vs: [['shelves', 36, 18, 66, 0, { kind: 'shelf', n: 4 }], ['pegboard', 36, 18, 72, 0, { kind: 'peg', n: 4 }], ['bins', 36, 24, 54, 0, { kind: 'bins', n: 3 }]], build: endcap }),
  fam({ cat: CAT, title: 'Generic garment rack',
    desc: (v) => v.kind === 'round' ? 'Round clothing rack with a rail ring on a stem and base, 12 hanging garment shapes.' : v.kind === 'four' ? 'Four-arm clothing rack: a stem on a base with four radiating arms, hanging garment shapes.' : v.kind === 'wall' ? 'Wall-mounted clothing rail on brackets with hanging garment shapes.' : `Clothing rack with two feet-and-caster ends${v.kind === 'double' ? ', an upper and a lower rail' : ' and a rail'}, hanging garment shapes.`,
    vs: [['straight rail, 48 in', 48, 24, 66, 0, { kind: 'straight' }], ['round, 36 in', 36, 36, 66, 0, { kind: 'round' }], ['wall rail, 48 in', 48, 16, 66, 36, { kind: 'wall' }]], build: garment }),
  fam({ cat: CAT, title: 'Generic slatwall display panel',
    desc: (v) => `Wall panel with horizontal grooves${v.shelves ? ', ' + v.shelves + ' bracket shelves' : ''}${v.hooks ? ' and ' + v.hooks + ' hooks' : ''}.`,
    vs: [['4 ft by 8 ft', 48, 12, 96, 0, { shelves: 0, hooks: 0 }], ['4 ft by 8 ft, with shelves', 48, 14, 96, 0, { shelves: 3, hooks: 0 }], ['4 ft by 8 ft, with hooks', 48, 12, 96, 0, { shelves: 0, hooks: 12 }]], build: slat }),
  fam({ cat: CAT, title: 'Generic display mannequin',
    desc: (v) => `${v.kind === 'torso' ? 'Torso form with a neck and a head' : 'Display figure with two legs, hip, torso, neck, head and two arms'} on a round base and stem; a scale form, not a person.`,
    vs: [['female', 24, 18, 72, 0, { kind: 'female' }], ['male', 26, 18, 74, 0, { kind: 'male' }], ['child', 18, 14, 48, 0, { kind: 'child' }]], build: mannequin }),
  fam({ cat: CAT, title: 'Generic retail display table',
    desc: (v) => v.kind === 'nest' ? 'Three tables of stepped heights side by side, each on four legs.' : v.kind === 'tier' ? `Round-style plinth with ${v.n} stepped display tiers, each smaller than the one below.` : 'Display table with a top and skirt, four legs and a lower shelf.',
    vs: [['square, 36 in', 36, 36, 32, 0, { kind: 'square' }], ['nesting set of three', 72, 30, 30, 0, { kind: 'nest' }], ['three tier', 36, 36, 42, 0, { kind: 'tier', n: 3 }]], build: displayTable }),
  fam({ cat: CAT, title: 'Generic jewelry display case',
    desc: (v) => `${v.tower ? 'Tower case' : 'Counter case'} with a lower cabinet, drawer fronts with locks, a glazed showcase frame with glass shelves, a velvet pad and a top light.`,
    vs: [['counter case, 60 in', 60, 22, 38, 0, { tower: false }], ['tower case, 20 in', 20, 20, 72, 0, { tower: true }]], build: jewel }),
  fam({ cat: CAT, title: 'Generic shopping cart',
    desc: (v) => `Wire-style basket on a chassis with a lower tray, four swivel wheels and a push handle${v.seat ? ', and a fold-down child seat' : ''}.`,
    vs: [['standard', 24, 42, 38, 0, {}], ['with child seat', 24, 42, 38, 0, { seat: true }], ['compact', 20, 34, 36, 0, { compact: true }]], build: cart }),
  fam({ cat: CAT, title: 'Generic shopping basket',
    desc: (v) => `${v.wheeled ? 'Wheeled basket with a telescoping handle, two wheels and two feet' : 'Hand basket with vent slots and a swing carry handle'}.`,
    vs: [['hand basket', 16, 11, 14, 0, {}], ['rolling basket', 15, 12, 38, 0, { wheeled: true }]], build: basket }),
  fam({ cat: CAT, title: 'Generic checkout lane',
    desc: (v) => `Checkout counter with a sunken roller belt well, a divider stop${v.self ? ', a scan area with a touch screen and a card reader' : ', a customer display on a pole and a card tray'}.`,
    vs: [['staffed lane, 8 ft', 96, 36, 66, 0, {}], ['self-service lane, 8 ft', 96, 40, 66, 0, { self: true }]], build: checkout }),
  fam({ cat: CAT, title: 'Generic store exit antenna',
    desc: (v) => `${v.pair ? 'Two upright antenna panels' : 'One wide antenna panel'} on base plates with a top light window and a cap.`,
    vs: [['pair, 36 in aisle', 48, 12, 60, 0, { pair: true }], ['single panel', 28, 6, 62, 0, {}]], build: eas }),
  fam({ cat: CAT, title: 'Generic fitting room',
    desc: (v) => `${v.n} stall${v.n > 1 ? 's' : ''} with partitions, a louvered door each with swing, a bench, a mirror and a coat hook.`,
    vs: [['single stall', 42, 48, 84, 0, { n: 1 }], ['row of three', 126, 48, 84, 0, { n: 3 }]], build: fitting }),
  fam({ cat: CAT, title: 'Generic storefront security grille',
    desc: (v) => v.kind === 'scissor' ? 'Folding scissor gate: two end posts, a bottom and top rail and a lattice of crossed bars.' : `Head box with a coil, two guide tracks, a bottom bar and a ${v.kind === 'link' ? 'link grille of vertical rods and cross links' : 'curtain of solid slats'}.`,
    vs: [['link grille, 12 ft', 144, 12, 96, 0, { kind: 'link' }], ['solid slat, 10 ft', 120, 12, 96, 0, { kind: 'slat' }]], build: grille }),
  fam({ cat: CAT, title: 'Generic revolving entrance door',
    desc: (v) => `Drum door with floor and canopy discs, a central shaft, two curved glazed walls as posts and rings, and ${v.wings} wings.`,
    vs: [['three wing, 7 ft', 84, 84, 104, 0, { wings: 3 }], ['four wing, 8 ft', 96, 96, 104, 0, { wings: 4 }]], build: revolving }),
  fam({ cat: CAT, title: 'Generic sliding entrance door',
    desc: (v) => `Head box with a sensor window over a track, two jambs and ${v.leaves} glazed sliding leaves in frames${v.side > 80 ? ' beside fixed side panels' : ''}.`,
    vs: [['two leaves, 8 ft', 96, 6, 108, 0, { leaves: 2, side: 0 }], ['two leaves with side panels, 12 ft', 144, 6, 108, 0, { leaves: 2, side: 500 }]], build: slider }),
  fam({ cat: CAT, title: 'Generic mall merchandising cart',
    desc: (v) => `Cabinet cart on casters with doors, a worktop, ${v.tiers} display shelves and a card reader${v.canopy ? ', four posts and a canopy roof with a sign band' : ''}.`,
    vs: [['with canopy', 60, 30, 96, 0, { canopy: true, tiers: 2, doors: 2 }], ['open top', 48, 24, 54, 0, { canopy: false, tiers: 1, doors: 2 }]], build: mallCart }),
  fam({ cat: CAT, title: 'Generic mall island kiosk',
    desc: (v) => `Ring counter with a plinth and a worktop overhang, ${v.glass ? 'glazed inner displays' : 'open inner displays'} and header sign bands on posts at the long sides.`,
    vs: [['6 ft by 6 ft', 72, 72, 108, 0, { glass: false }], ['8 ft by 8 ft, glazed', 96, 96, 108, 0, { glass: true }]], build: island }),
  fam({ cat: CAT, title: 'Generic atrium planter',
    desc: (v) => `Round planter with a wall, a cap ring, a soil surface, ${v.shrubs} shrub masses${v.tree ? ' and a tree' : ''}.`,
    vs: [['60 in, shrubs', 60, 60, 36, 0, { wall: 700, shrubs: 6, tree: false }], ['96 in, with tree', 96, 96, 144, 0, { wall: 600, shrubs: 8, tree: true }]], build: planter }),
];

/* SPDX-License-Identifier: Apache-2.0 */
/** Round 5, block appliances (appliances/residential): hospital and laboratory cold storage, sterilizing and warming appliances, staff-room, site-trailer,
 *  mine-camp and hangar crew-lounge appliances, 250 variants. Several countertop builders are reused from the round-4 file. */
import { fam, cab, pull, T, GAP, A } from './r4-kit.mjs';
import base from './r4-appliances.mjs';

const CAT = 'appliances/residential';
const { dial } = A;

// ---- shared pieces ----------------------------------------------------------------------------------------------------------------
function hbar(a, x0, x1, z, off = 36) { a.xcyl(x0, x1, a.YF - off, z, 9, 8); a.box(x0, a.YF - off, z - 5, x0 + 12, a.YF, z + 5); a.box(x1 - 12, a.YF - off, z - 5, x1, a.YF, z + 5); a.rect(x0, a.YF - off, x1, a.YF, 'EQUIP-DETAIL'); }
function vbar(a, x, z0, z1, off = 36) { a.cyl(x, a.YF - off, z0, z1, 9, 8); a.box(x - 5, a.YF - off, z0, x + 5, a.YF, z0 + 12); a.box(x - 5, a.YF - off, z1 - 12, x + 5, a.YF, z1); a.rect(x - 9, a.YF - off, x + 9, a.YF, 'EQUIP-DETAIL'); }
function slab(a, x0, z0, x1, z1, t = T) { a.box(x0, a.YF, z0, x1, a.YF + t, z1); }
function dialAt(a, x, y, z, r = 18) { a.ycyl(y - 22, y, x, z, r, 10); a.circ(x, y - 11, r, 'EQUIP-DETAIL'); }
function knobs(a, n, z, x0, x1, r = 18) { for (let i = 0; i < n; i++) dial(a, x0 + ((x1 - x0) * (i + 0.5)) / n, z, r); }
function swingPlan(a, hx, w, left) { a.arc(hx, a.YF, w, left ? 270 : 180, left ? 360 : 270); a.line(hx, a.YF, hx, a.YF - w, 'EQUIP-SWING'); }
function window(a, x0, z0, x1, z1) { a.frame(x0, z0, x1, z1, a.YF - 12, a.YF - 4, 24); a.box(x0 + 24, a.YF - 9, z0 + 24, x1 - 24, a.YF - 6, z1 - 24); a.rect(x0, a.YF - 12, x1, a.YF - 4, 'EQUIP-DETAIL'); }
/** Burner positions for n burners over the top of the box, as fractions [fx, fy] (fy 0 = front). */
function layout(n) {
  const g = { 1: [[.5, .5]], 2: [[.5, .27], [.5, .73]], 3: [[.25, .5], [.5, .5], [.75, .5]], 4: [[.27, .27], [.73, .27], [.27, .73], [.73, .73]], 5: [[.25, .27], [.75, .27], [.25, .73], [.75, .73], [.5, .5]],
    6: [[.17, .27], [.5, .27], [.83, .27], [.17, .73], [.5, .73], [.83, .73]], 8: [[.125, .27], [.375, .27], [.625, .27], [.875, .27], [.125, .73], [.375, .73], [.625, .73], [.875, .73]] };
  return g[n];
}
function gasBurners(a, n, z, x0 = a.X0, x1 = a.X1, y0 = a.YF, y1 = a.YB) {
  for (const [fx, fy] of layout(n)) {
    const x = x0 + (x1 - x0) * fx, y = y0 + (y1 - y0) * fy, r = Math.min((x1 - x0) / (n > 5 ? 7.2 : 5.6), (y1 - y0) / 5.2, 70);
    a.cyl(x, y, z, z + 10, r, 16); a.cyl(x, y, z + 10, z + 22, r * 0.45, 12); a.circ(x, y, r, 'EQUIP-DETAIL'); a.circ(x, y, r * 0.45, 'EQUIP-DETAIL');
    const g = r * 1.45; a.box(x - g, y - 6, z + 24, x + g, y + 6, z + 32); a.box(x - 6, y - g, z + 24, x + 6, y + g, z + 32); a.line(x - g, y, x + g, y); a.line(x, y - g, x, y + g);
  }
}
function discs(a, n, z, kind, x0 = a.X0, x1 = a.X1, y0 = a.YF, y1 = a.YB) {
  for (const [fx, fy] of layout(n)) {
    const x = x0 + (x1 - x0) * fx, y = y0 + (y1 - y0) * fy, r = Math.min((x1 - x0) / (n > 5 ? 7.4 : 5.4), (y1 - y0) / 5, 90);
    a.cyl(x, y, z, z + (kind === 'coil' ? 14 : 4), r, 20); a.circ(x, y, r, 'EQUIP-DETAIL'); a.circ(x, y, r * 0.62, 'EQUIP-DETAIL');
    if (kind === 'coil') a.cyl(x, y, z + 14, z + 20, r * 0.45, 12);
  }
}
function chandle(a, x, y, z0, z1, out = 28, t = 9) { a.box(x - 4, y - t, z1 - 2 * t, x + out, y + t, z1); a.box(x - 4, y - t, z0, x + out, y + t, z0 + 2 * t); a.box(x + out - 2 * t, y - t, z0, x + out, y + t, z1); }
function oval(a, cx, cy, rx0, ry0, rx1, ry1, z0, z1, steps = 3) { for (let k = 0; k < steps; k++) { const f0 = k / steps, f1 = (k + 1) / steps, ax = rx0 + (rx1 - rx0) * f0, ay = ry0 + (ry1 - ry0) * f0, bx = rx0 + (rx1 - rx0) * f1, by = ry0 + (ry1 - ry0) * f1, rx = (ax + bx) / 2, ry = (ay + by) / 2; const pts = []; for (let i = 0; i < 28; i++) { const t = (i / 28) * Math.PI * 2; pts.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]); } a.prism(pts, z0 + (z1 - z0) * f0, z0 + (z1 - z0) * f1); } }

// ---- ranges ----------------------------------------------------------------------------------------------------------------------
function rangeBody(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a, bg = 230;
  cab(a, { toe: 80, doors: 0, splash: { h: bg, t: 70 } });
  const top = Z1 - bg;
  if (v.griddle) {
    const gx1 = X0 + W * 0.5; a.box(X0 + 20, YF + 30, top, gx1, YB - 110, top + 14); a.box(X0 + 20, YF + 30, top + 14, gx1, YF + 50, top + 26); a.box(X0 + 20, YF + 30, top + 14, X0 + 34, YB - 110, top + 26);
    a.rect(X0 + 20, YF + 30, gx1, YB - 110, 'EQUIP-DETAIL'); a.line(X0 + 20, YF + 50, gx1, YF + 50, 'EQUIP-DETAIL'); gasBurners(a, v.burners, top, gx1 + 14, X1 - 20, YF + 30, YB - 110);
  } else if (v.electric) discs(a, v.burners, top, v.coil ? 'coil' : 'flat', X0 + 30, X1 - 30, YF + 40, YB - 110); else gasBurners(a, v.burners, top, X0 + 20, X1 - 20, YF + 30, YB - 110);
  const n = v.burners > 5 ? 6 : v.burners;
  if (v.front) { a.box(X0 + 12, YF - 10, top - 150, X1 - 12, YF, top - 20); knobs(a, n, top - 85, X0 + 20, X1 - 20); } else knobs(a, n, Z1 - 110, X0 + 60, X1 - 60, 17);
  if (!v.front) a.box(X0 + 30, YB - 110, top + 2, X1 - 30, YB - 70, Z1 - 20);   // control panel on the backguard
  const doors = v.ovens, z0 = Z0 + 110, z1 = top - (v.front ? 170 : 40);
  if (v.drawer) { slab(a, X0 + 12, z0, X1 - 12, z0 + 150); hbar(a, X0 + 80, X1 - 80, z0 + 100, 30); }
  const dz0 = z0 + (v.drawer ? 160 : 0);
  for (let i = 0; i < doors; i++) {
    const x0 = X0 + 12 + (i * (W - 24)) / doors + (i ? 3 : 0), x1 = X0 + 12 + ((i + 1) * (W - 24)) / doors - (i < doors - 1 ? 3 : 0);
    a.box(x0, YF - 6, dz0, x1, YF + T, z1); window(a, x0 + 60, dz0 + 80, x1 - 60, z1 - 150); hbar(a, x0 + 40, x1 - 40, z1 - 50, 42);
    a.line(x0, YF, x1, YF); if (doors === 1 || i === 0) swingPlan(a, x0, x1 - x0, true);
  }
  a.line(X0, YF, X1, YF);
  a.log(`Added ${v.burners} ${v.electric ? (v.coil ? 'coil elements' : 'smooth-top elements') : 'gas burners with grates'}, ${v.front ? 'front' : 'backguard'} controls, ${doors === 2 ? 'two ovens' : 'an oven'} with window and handle${v.drawer ? ', a storage drawer' : ''} and a toe kick (plan and 3D).`);
}
const rangeDesc = (kind) => (v) => `${kind} range with ${v.burners} ${v.electric ? (v.coil ? 'coil elements' : 'smooth-top elements') : 'gas burners'}, ${v.front ? 'front controls' : 'a backguard control panel'}, ${v.ovens === 2 ? 'two oven doors' : 'one oven door'} with window and handle${v.drawer ? ' and a drawer' : ''}.`;

// ---- refrigerators ---------------------------------------------------------------------------------------------------------------
function fridge(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; cab(a, { toe: 100, doors: 0 });
  const H = Z1 - Z0, b = Z0 + 100, f = (k) => b + (H - 100) * k;
  const dsp = (x0, x1, z) => { a.box(x0, YF - 8, z, x1, YF + 4, z + 330); a.box(x0 + 30, YF - 30, z + 60, x1 - 30, YF - 8, z + 110); a.rect(x0, YF - 8, x1, YF, 'EQUIP-DETAIL'); };
  if (o.kind === 'top') {
    const s = f(0.7); slab(a, X0 + 12, b, X1 - 12, s - 4); slab(a, X0 + 12, s + 4, X1 - 12, Z1 - 12); vbar(a, X1 - 60, b + 300, b + 900, 34); vbar(a, X1 - 60, s + 80, Math.min(s + 520, Z1 - 40), 34);
    a.line(X0, YF, X1, YF); swingPlan(a, X0 + 12, W - 24, true);
  } else if (o.kind === 'bottom') {
    const s = f(0.3); slab(a, X0 + 12, b, X1 - 12, s - 4); hbar(a, X0 + 100, X1 - 100, s - 70, 36);
    if (o.french) { slab(a, X0 + 12, s + 4, cx - 2, Z1 - 12); slab(a, cx + 2, s + 4, X1 - 12, Z1 - 12); vbar(a, cx - 40, s + 300, s + 1000, 34); vbar(a, cx + 40, s + 300, s + 1000, 34); swingPlan(a, X0 + 12, W / 2 - 14, true); swingPlan(a, X1 - 12, W / 2 - 14, false); a.line(cx, YF, cx, YF + 30); }
    else { slab(a, X0 + 12, s + 4, X1 - 12, Z1 - 12); vbar(a, X1 - 60, s + 300, s + 1000, 34); swingPlan(a, X0 + 12, W - 24, true); }
    a.line(X0, YF, X1, YF);
  } else if (o.kind === 'side') {
    const fx = X0 + W * 0.4; slab(a, X0 + 12, b, fx - 2, Z1 - 12); slab(a, fx + 2, b, X1 - 12, Z1 - 12); vbar(a, fx - 40, b + 600, b + 1300, 34); vbar(a, fx + 40, b + 600, b + 1300, 34);
    if (o.dispenser) dsp(X0 + 60, fx - 60, b + 700);
    swingPlan(a, X0 + 12, fx - X0 - 12, true); swingPlan(a, X1 - 12, X1 - fx - 12, false); a.line(X0, YF, X1, YF);
  } else { // column: one tall door, hinge side from o.hinge
    slab(a, X0 + 12, b, X1 - 12, Z1 - 12); if (o.drawers) { for (let i = 1; i <= o.drawers; i++) a.line(X0 + 12, YF, X1 - 12, YF); const z = b + 400; a.box(X0 + 6, YF - 4, z, X1 - 6, YF + 2, z + 4); }
    const hl = o.hinge !== 'R'; vbar(a, hl ? X1 - 60 : X0 + 60, b + 400, b + 1500, 34); swingPlan(a, hl ? X0 + 12 : X1 - 12, W - 24, hl);
    if (o.bands) for (let i = 1; i <= o.bands; i++) a.line(X0 + 12, YF + 4 * i, X1 - 12, YF + 4 * i);
    a.line(X0, YF, X1, YF);
  }
  a.clear('door swing', X0, YF - (o.kind === 'side' ? W * 0.6 : W), X1, YF, 80);
  a.log(`Added ${o.kind === 'top' ? 'the freezer and fresh-food doors' : o.kind === 'bottom' ? (o.french ? 'two French doors over a freezer drawer' : 'the fresh-food door over a freezer drawer') : o.kind === 'side' ? 'the freezer and fresh-food doors' + (o.dispenser ? ' with a water dispenser recess' : '') : 'the tall door'}, handles, door swings and the toe kick (plan and 3D).`);
}
function underFridge(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a; cab(a, { toe: 90, doors: 0, topT: 20 });
  const z0 = Z0 + 100, z1 = Z1 - 24, n = o.doors ?? 1;
  if (o.drawers) {
    const rh = (z1 - z0) / o.drawers; for (let i = 0; i < o.drawers; i++) { const t = z1 - i * rh; slab(a, X0 + 10, t - rh + 4, X1 - 10, t - 2); hbar(a, X0 + 60, X1 - 60, t - 50, 30); a.line(X0 + 10, YF, X1 - 10, YF); }
  } else for (let i = 0; i < n; i++) {
    const x0 = X0 + 10 + (i * (W - 20)) / n + (i ? 3 : 0), x1 = X0 + 10 + ((i + 1) * (W - 20)) / n - (i < n - 1 ? 3 : 0);
    if (o.glass) { a.frame(x0, z0, x1, z1, YF, YF + T, 30); a.rect(x0 + 30, YF + 3, x1 - 30, YF + 9, 'EQUIP-DETAIL'); const sh = o.shelves ?? 3; for (let s = 1; s <= sh; s++) a.box(x0 + 40, YF + 20, z0 + ((z1 - z0) * s) / (sh + 1), x1 - 40, YF + 220, z0 + ((z1 - z0) * s) / (sh + 1) + 6); } else slab(a, x0, z0, x1, z1);
    const left = (o.hinge ?? 'L') === 'L'; const hing = n === 2 ? (i === 0 ? x0 : x1) : left ? x0 : x1; vbar(a, n === 2 ? (i === 0 ? x1 - 30 : x0 + 30) : left ? x1 - 30 : x0 + 30, z0 + (z1 - z0) * 0.3, z1 - 80, 26); swingPlan(a, hing, x1 - x0, n === 2 ? i === 0 : left);
  }
  a.box(X0 + 40, YF - 4, Z1 - 24 + 4, X1 - 40, YF, Z1 - 10); // thin display strip
  a.log(`Added ${o.drawers ? o.drawers + ' drawer front' + (o.drawers > 1 ? 's' : '') + ' with bar pulls' : n + ' ' + (o.glass ? 'glazed ' : '') + 'door' + (n > 1 ? 's' : '') + ' with handle' + (o.glass ? ' and shelves' : '') + ' and swing'}, the countertop edge and the toe kick (plan and 3D).`);
}

// ---- range hoods ----------------------------------------------------------------------------------------------------------------
function hoodLights(a, n, z, x0, x1, y) { for (let i = 0; i < n; i++) { const x = x0 + ((x1 - x0) * (i + 0.5)) / n; a.cyl(x, y, z - 6, z, 28, 10); a.circ(x, y, 28, 'EQUIP-DETAIL'); } }
function canopy(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, h = Z1 - Z0, sk = 120, island = !!o.island;
  const ch = Math.min(W * 0.34, 330), cw = Math.min(D * 0.36, 300);
  a.box(X0, YF, Z0, X1, YB, Z0 + sk); a.rect(X0, YF, X1, YB);
  const lay = 5; for (let i = 0; i < lay; i++) { const k0 = i / lay, k1 = (i + 1) / lay; const sx0 = 1 - (1 - ch / W) * k1, sd0 = 1 - (1 - cw / D) * k1; const hw = (W / 2) * sx0, hd = (D / 2) * sd0, by = island ? cy : YB - hd;
    a.prism([[cx - hw, by - hd], [cx + hw, by - hd], [cx + hw, by + hd], [cx - hw, by + hd]], Z0 + sk + (h * 0.4 - sk) * k0 - (i ? 2 : 0), Z0 + sk + (h * 0.4 - sk) * k1); }
  const by = island ? cy : YB - cw / 2;
  a.box(cx - ch / 2, by - cw / 2, Z0 + h * 0.4 - 4, cx + ch / 2, by + cw / 2, Z1);
  a.rect(cx - ch / 2, by - cw / 2, cx + ch / 2, by + cw / 2, 'EQUIP-DETAIL');
  a.box(X0 + 60, YF - 4, Z0 + 24, X1 - 60, YF + 10, Z0 + 70);   // trim band
  for (let x = X0 + 80; x < X1 - 80; x += 36) a.box(x, YF + 40, Z0 - 4, x + 20, YB - 40, Z0 + 2);   // baffle filter slots
  hoodLights(a, 2, Z0, X0 + 150, X1 - 150, cy);
  for (let i = 0; i < 3; i++) dialAt(a, cx - 70 + i * 70, YF - 2, Z0 + 55, 10);
  a.log(`Added the ${island ? 'island ' : 'wall '}canopy with a stepped hood, ${island ? 'a centred' : 'a rear'} chimney, baffle filter slots, two lights and fan buttons (plan and 3D).`);
}

// ---- laundry ---------------------------------------------------------------------------------------------------------------------
function washerFront(a, v) {
  const { X0, X1, YF, Z0, Z1, W, cx } = a; cab(a, { toe: 40, doors: 0 });
  const dz = v.stack ? 0 : 0; void dz;
  const unit = (z0, z1, kind, panel) => { const r = Math.min(W * 0.32, (z1 - z0) * 0.42); const zc = (z0 + z1) / 2 - (panel ? 40 : 0);
    a.box(X0 + 12, YF - 6, z1 - 150, X1 - 12, YF + 4, z1 - 12);   // control strip
    for (let i = 0; i < 4; i++) dial(a, X0 + 70 + i * ((W - 140) / 3), z1 - 80, 16);
    a.ycyl(YF - 20, YF + 4, cx, zc, r, 26); a.ycyl(YF - 26, YF - 20, cx, zc, r * 0.7, 26); a.circ(cx, YF - 12, r, 'EQUIP-DETAIL'); a.circ(cx, YF - 12, r * 0.7, 'EQUIP-DETAIL');
    if (kind === 'wash') a.box(X0 + 40, YF - 6, z0 + 8, X0 + 40 + W * 0.3, YF + 3, z0 + 70); };   // detergent drawer
  if (v.stack) { const mid = Z0 + (Z1 - Z0) * 0.5; unit(Z0 + 40, mid, 'wash', true); unit(mid, Z1, 'dry', true); a.line(X0, YF, X1, YF); a.box(X0 + 12, YF - 4, mid - 8, X1 - 12, YF + 2, mid + 8); }
  else unit(Z0 + 40, Z1, v.kind, true);
  a.line(X0, YF, X1, YF);
  a.log(`Added ${v.stack ? 'a washer stacked under a dryer, each' : 'the'} round door with glass ring, ${v.stack ? 'two' : 'a'} control strip${v.stack ? 's' : ''} with dials and the toe kick (plan and 3D).`);
}


// ---- reused round-4 builders ----------------------------------------------------------------------------------------------------
const B = (t) => { const f = base.find((x) => x.title === 'Generic ' + t); if (!f) throw new Error('no round-4 builder: ' + t); return f.build; };

// ---- new builders -----------------------------------------------------------------------------------------------------------------
/** Upright or undercounter cold-storage cabinet: solid or glass doors, display header, chart recorder, lock, latch. */
function coldCab(a, v) {
  const { X0, X1, YF, Z0, Z1, W } = a, n = v.doors ?? 1, lift = v.cast ? 100 : 90, head = v.disp ? 200 : 20, sh = v.shelves ?? 4;
  if (v.glass) cab(a, v.cast ? { open: true, shelves: sh, casters: 100 } : { open: true, shelves: sh, toe: 90 }); else cab(a, v.cast ? { doors: 0, casters: 100 } : { doors: 0, toe: 90 });
  const b = Z0 + lift + 6, topz = Z1 - head;
  if (v.glass) { const base0 = Z0 + lift; for (let s = 1; s <= sh; s++) { const z = base0 + ((Z1 - base0) * s) / (sh + 1) + T; for (let x = X0 + T + 30; x < X1 - T - 90; x += 95) a.box(x, YF + 80, z, x + 60, YF + 200, z + (s % 2 ? 110 : 70)); } }
  if (v.disp) { a.box(X0 + 10, YF, topz + 4, X1 - 10, YF + T, Z1 - 8); a.box(X0 + 40, YF - 6, topz + 30, X0 + 40 + Math.min(W * 0.35, 260), YF, topz + 150); for (let i = 0; i < 3; i++) { const bx = X0 + 40 + Math.min(W * 0.35, 260) + 36 + i * 44; if (bx < X1 - 30) a.ycyl(YF - 14, YF, bx, topz + 90, 14, 8); }
    if (v.chart) { a.ycyl(YF - 18, YF, X1 - 120, topz + 100, 56, 22); a.circ(X1 - 120, YF - 9, 56, 'EQUIP-DETAIL'); a.circ(X1 - 120, YF - 9, 30, 'EQUIP-DETAIL'); }
    if (v.alarm) a.ycyl(YF - 16, YF, X1 - 250, topz + 100, 16, 10); }
  for (let i = 0; i < n; i++) {
    const x0 = X0 + 10 + (i * (W - 20)) / n + (i ? 3 : 0), x1 = X0 + 10 + ((i + 1) * (W - 20)) / n - (i < n - 1 ? 3 : 0), left = n === 1 ? (v.hinge ?? 'L') === 'L' : i < n / 2, mid = (b + topz) / 2;
    if (v.glass) a.frame(x0, b, x1, topz, YF, YF + T, 34); else a.box(x0, YF, b, x1, YF + T, topz);
    if (v.panels && topz - b > 900) a.frame(x0 + 40, b + 60, x1 - 40, topz - 60, YF - 5, YF, 20);
    const hx = left ? x1 - 46 : x0 + 46;
    if (v.latch) { a.box(hx - 14, YF - 52, mid - 200, hx + 14, YF - 24, mid + 200); a.box(hx - 14, YF - 52, mid - 200, hx + 14, YF, mid - 170); a.box(hx - 14, YF - 52, mid + 170, hx + 14, YF, mid + 200); a.rect(hx - 14, YF - 52, hx + 14, YF, 'EQUIP-DETAIL'); }
    else if (topz - b > 700) vbar(a, hx, b + (topz - b) * 0.25, b + (topz - b) * 0.75, 34); else vbar(a, hx, b + (topz - b) * 0.2, b + (topz - b) * 0.8, 28);
    if (v.lock) pull(a, 'lock', hx, b + (topz - b) * (v.latch ? 0.12 : 0.15));
    swingPlan(a, left ? x0 : x1, x1 - x0, left);
  }
  if (v.hazard) a.box(X0 + 30, YF - 4, topz - 140, X1 - 30, YF, topz - 60);
  a.line(X0, YF, X1, YF); a.clear('door swing', X0, YF - W / n, X1, YF, 80);
  a.log(`Added ${n} ${v.glass ? 'glass-frame' : 'solid'} door${n > 1 ? 's' : ''} with ${v.latch ? 'a lever latch' : 'vertical handles'}${v.glass ? ', ' + sh + ' shelves with stock boxes' : ''}${v.disp ? ', a display header' : ''}${v.cast ? ' and casters' : ' and a toe kick'}, with door swings (plan and 3D).`);
}
const coldDesc = (kind) => (v) => `${kind} ${v.w} in wide with ${v.doors ?? 1} ${v.glass ? 'glass-frame' : 'solid'} door${(v.doors ?? 1) > 1 ? 's' : ''}, ${v.latch ? 'a lever latch' : 'vertical handles'}${v.glass ? ', ' + (v.shelves ?? 4) + ' shelves holding small stock boxes' : ''}${v.disp ? ', a display header' + (v.chart ? ' with a round chart recorder' : '') + (v.alarm ? ' and an alarm lamp' : '') : ''}${v.lock ? ', a key lock' : ''}${v.hazard ? ', a hazard band across the door' : ''} and ${v.cast ? 'casters' : 'a toe kick'}.`;

/** Chest freezer with n hinged lids, optional control panel, latches, lock, baskets, casters. */
function chest(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, n = v.lids ?? 1, L = v.cast ? 80 : 40, lidT = 60, f = YF + 16;
  a.outline(); const zt = Z1 - lidT;
  a.box(X0, f, Z0 + L, X0 + 50, YB, zt); a.box(X1 - 50, f, Z0 + L, X1, YB, zt); a.box(X0, f, Z0 + L, X1, f + 50, zt); a.box(X0, YB - 50, Z0 + L, X1, YB, zt); a.box(X0 + 50, f + 50, Z0 + L, X1 - 50, YB - 50, Z0 + L + 60);
  const sw = (W - 4) / n;
  for (let i = 0; i < n; i++) { const xa = X0 + 2 + i * sw + (i ? 2 : 0), xb = X0 + 2 + (i + 1) * sw - 2; a.box(xa, f, zt, xb, YB, Z1 - 16); a.box(xa + sw * 0.25, YF, zt + 10, xb - sw * 0.25, f + 4, zt + 34); a.line(xa, f, xa, YB); a.line(xa + sw * 0.5, f, xa + sw * 0.5, YB - D * 0.3, 'EQUIP-SWING');
    a.box(xa + 40, YB - 20, zt - 6, xa + 90, YB, zt + 20); a.box(xb - 90, YB - 20, zt - 6, xb - 40, YB, zt + 20);
    if (v.latch) { a.box((xa + xb) / 2 - 30, YF + 4, zt - 30, (xa + xb) / 2 + 30, f + 6, zt + 6); }
    if (v.baskets) a.frame(xa + 70, zt - 230, xb - 70, zt - 90, f + 80, f + 84, 14); }
  if (v.baskets) for (let i = 0; i < n; i++) { const xa = X0 + 2 + i * sw + 70, xb = X0 + 2 + (i + 1) * sw - 70; a.box(xa, f + 80, zt - 240, xb, YB - 80, zt - 230); a.rect(xa, f + 80, xb, YB - 80, 'EQUIP-HIDDEN'); }
  if (v.ctrl) { a.box(X0 + 30, YF + 2, zt - 150, X0 + 330, f + 2, zt - 60); a.box(X0 + 50, YF, zt - 130, X0 + 200, YF + 4, zt - 90); for (let i = 0; i < 3; i++) a.ycyl(YF - 6, YF + 2, X0 + 240 + i * 28, zt - 100, 9, 8); }
  if (v.lock) pull(a, 'lock', X1 - 70, zt - 40, f);
  if (v.cast) for (const [x, y] of [[X0 + 60, f + 50], [X1 - 60, f + 50], [X0 + 60, YB - 50], [X1 - 60, YB - 50]]) a.caster(x, y, 80); else for (const [x, y] of [[X0 + 40, f + 30], [X1 - 40, f + 30], [X0 + 40, YB - 30], [X1 - 40, YB - 30]]) a.cyl(x, y, Z0, Z0 + L, 14, 8);
  a.rect(X0 + 10, f + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL');
  a.log(`Added the cabinet walls, ${n} hinged lid${n > 1 ? 's' : ''} with lip handles and hinges${v.latch ? ', lid latches' : ''}${v.baskets ? ', wire baskets' : ''}${v.ctrl ? ', a front control panel' : ''}${v.lock ? ', a key lock' : ''} and ${v.cast ? 'casters' : 'feet'} (plan and 3D).`);
}

/** Tabletop sterilizer: a front round chamber door with wheel handle, a control panel with display, a water cap and feet. */
function steril(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a;
  a.outline(); a.box(X0, YF + 10, Z0 + 14, X1, YB, Z1 - 24); a.box(X0 + 10, YB - 260, Z1 - 24, X0 + 330, YB - 40, Z1); a.cyl(X0 + 170, YB - 150, Z1 - 24, Z1, 60, 16); a.circ(X0 + 170, YB - 150, 60, 'EQUIP-DETAIL');
  for (const x of [X0 + 30, X1 - 30]) for (const y of [YF + 40, YB - 30]) a.cyl(x, y, Z0, Z0 + 14, 11, 8);
  const px = X1 - W * 0.27, r = Math.min((Z1 - Z0) * 0.34, (px - X0) * 0.36), cxd = (X0 + px) / 2, zc = (Z0 + Z1) / 2 + 6;
  a.ycyl(YF - 32, YF + 10, cxd, zc, r, 28); a.ycyl(YF - 40, YF - 32, cxd, zc, r * 0.3, 14); a.xcyl(cxd - r * 0.85, cxd + r * 0.85, YF - 56, zc, 9, 8); a.box(cxd - 9, YF - 56, zc - 9, cxd + 9, YF - 40, zc + 9);
  a.circ(cxd, YF - 16, r, 'EQUIP-DETAIL'); a.circ(cxd, YF - 16, r * 0.6, 'EQUIP-DETAIL');
  a.box(px + 10, YF - 12, Z0 + 40, X1 - 10, YF + 10, Z1 - 40); a.box(px + 30, YF - 16, Z1 - 150, X1 - 30, YF - 12, Z1 - 80);
  for (let i = 0; i < 3; i++) a.ycyl(YF - 22, YF - 12, px + 40 + i * ((X1 - px - 80) / 2), Z0 + 110, 14, 10);
  if (v.drawer) { a.box(X0 + 20, YF - 8, Z0 + 20, px - 20, YF + 10, Z0 + 20 + 55); a.box(X0 + 80, YF - 20, Z0 + 36, px - 80, YF - 8, Z0 + 46); }
  a.rect(cxd - r, YF - 32, cxd + r, YF, 'EQUIP-DETAIL'); a.line(px, YF, px, YB, 'EQUIP-DETAIL');
  a.log('Added the body on four feet, the round chamber door with its hub and bar handle, the control panel with a display and three dials, the rear water-fill cap' + (v.drawer ? ' and the front drawer' : '') + ' (plan and 3D).');
}

/** Ultrasonic cleaning tank: walls round an open tank, a basket with handle, a front control strip, drain tap, optional lid. */
function ultra(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx } = a, lift = v.stand ? 700 : 20, tz0 = Z0 + lift, t = 26;
  a.outline();
  if (v.stand) { for (const [x, y] of [[X0 + 50, YF + 50], [X1 - 50, YF + 50], [X0 + 50, YB - 50], [X1 - 50, YB - 50]]) a.leg(x, y, Z0, tz0, 14); a.box(X0 + 40, YF + 40, Z0 + 180, X1 - 40, YB - 40, Z0 + 196); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-HIDDEN'); }
  else for (const x of [X0 + 25, X1 - 25]) for (const y of [YF + 30, YB - 30]) a.cyl(x, y, Z0, tz0, 10, 8);
  a.box(X0, YF, tz0, X1, YB, tz0 + t); a.box(X0, YF, tz0, X0 + t, YB, Z1); a.box(X1 - t, YF, tz0, X1, YB, Z1); a.box(X0, YF, tz0, X1, YF + t, Z1 - (v.strip ? 0 : 0)); a.box(X0, YB - t, tz0, X1, YB, Z1);
  const bz = tz0 + t + 40; a.frame(X0 + 70, bz, X1 - 70, Z1 - 70, YF + 90, YF + 94, 14); a.frame(X0 + 70, bz, X1 - 70, Z1 - 70, YB - 94, YB - 90, 14); a.box(X0 + 70, YF + 90, bz, X1 - 70, YB - 90, bz + 12);
  a.xcyl(X0 + 70, X1 - 70, a.cy, Z1 - 20, 8, 8); a.box(X0 + 70, a.cy - 8, Z1 - 70, X0 + 90, a.cy + 8, Z1 - 20); a.box(X1 - 90, a.cy - 8, Z1 - 70, X1 - 70, a.cy + 8, Z1 - 20);
  const pw = (X1 - X0) * 0.6, pr = Math.min(18, pw * 0.09); a.box(X0 + 20, YF - 10, tz0 + 30, X0 + 20 + pw, YF, tz0 + 140); for (let i = 0; i < 2; i++) a.ycyl(YF - 20, YF - 10, X0 + 20 + pw * (0.17 + i * 0.2), tz0 + 85, pr, 10); a.box(X0 + 20 + pw * 0.55, YF - 14, tz0 + 60, X0 + 20 + pw * 0.93, YF - 10, tz0 + 110);
  a.cyl(X1 - 40, YF - 30, tz0 + 20, tz0 + 70, 12, 8); a.xcyl(X1 - 40, X1 - 4, YF - 30, tz0 + 60, 7, 6);
  if (v.lid) { a.box(X0 + 4, YF + 4, Z1 - 10, X1 - 4, YB - 4, Z1); }
  a.rect(X0 + t, YF + t, X1 - t, YB - t, 'EQUIP-DETAIL'); a.rect(X0 + 70, YF + 90, X1 - 70, YB - 90, 'EQUIP-HIDDEN'); a.circ(X1 - 40, YF - 4, 12, 'EQUIP-DETAIL');
  a.log(`Added the tank walls and floor, the wire basket with a carrying bar, the front control strip with two dials and a display, the drain tap${v.stand ? ', the four-leg stand with a shelf' : ' and four feet'}${v.lid ? ' and a flat lid' : ''} (plan and 3D).`);
}

/** Benchtop incubator or drying oven: a cabinet with a door (glass frame or solid), shelves, a control header and feet. */
function benchOven(a, v) {
  const { X0, X1, YF, Z0, Z1, W } = a, sh = v.shelves ?? 3;
  cab(a, { open: true, shelves: sh, legs: 40 });
  const b = Z0 + 50, topz = Z1 - 170;
  a.box(X0 + 10, YF, topz + 4, X1 - 10, YF + T, Z1 - 6); a.box(X0 + 40, YF - 6, topz + 30, X0 + 40 + Math.min(W * 0.34, 220), YF, topz + 130); for (let i = 0; i < 2; i++) a.ycyl(YF - 16, YF, X1 - 120 - i * 80, topz + 80, 20, 12);
  if (v.glass) a.frame(X0 + 10, b, X1 - 10, topz, YF, YF + T, 40); else a.box(X0 + 10, YF, b, X1 - 10, YF + T, topz);
  vbar(a, X1 - 60, b + (topz - b) * 0.25, b + (topz - b) * 0.7, 30); swingPlan(a, X0 + 10, X1 - X0 - 20, true);
  if (v.vent) { a.cyl(X1 - 90, a.YB - 90, Z1 - 40, Z1, 36, 14); a.circ(X1 - 90, a.YB - 90, 36, 'EQUIP-DETAIL'); }
  a.line(X0, YF, X1, YF); a.clear('door swing', X0, YF - W, X1, YF, 60);
  a.log(`Added the ${v.glass ? 'glass-frame' : 'solid'} door with handle and swing, ${sh} shelves, the control header with a display and two dials${v.vent ? ', the top exhaust collar' : ''} and four feet (plan and 3D).`);
}

/** Boot and glove dryer: a heater base with a front grille and a row of upright pegs. */
function bootDryer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, cy } = a, bh = 150, n = v.pegs;
  a.outline(); a.box(X0, YF, Z0 + 14, X1, YB, Z0 + bh); for (const x of [X0 + 30, X1 - 30]) for (const y of [YF + 30, YB - 30]) a.cyl(x, y, Z0, Z0 + 14, 12, 8);
  for (let z = Z0 + 40; z < Z0 + bh - 30; z += 22) a.box(X0 + 60, YF - 4, z, X1 - 160, YF, z + 10);
  a.ycyl(YF - 16, YF, X1 - 90, Z0 + 80, 22, 12); a.circ(X1 - 90, YF - 8, 22, 'EQUIP-DETAIL');
  for (let i = 0; i < n; i++) { const x = X0 + (W * (i + 0.5)) / n; a.cyl(x, cy, Z0 + bh, Z1 - 40, 30, 12); a.ell(x, cy, Z1 - 40, 30, 30, 40, 12, 5); a.circ(x, cy, 30, 'EQUIP-DETAIL'); if (v.rail) a.box(x - 4, cy - 4, Z0 + bh, x + 4, cy + 4, Z0 + bh + 6); }
  if (v.rail) a.xcyl(X0 + 30, X1 - 30, YB - 30, Z1 - 120, 9, 8);
  a.log(`Added the heater base with a front grille and dial, and ${n} upright pegs with rounded tips${v.rail ? ' and a rear rail' : ''} (plan and 3D).`);
}

/** Hot-water urn: a cylinder on feet with a domed lid, side handles, a front tap and a sight gauge. */
function urn(a, v) {
  const { X0, X1, YF, YB, Z0, Z1 } = a, r = Math.min(a.W, a.D) * 0.34, cx = a.cx, cy = YB - r - 30, fh = v.floor ? 280 : 60;
  a.outline('EQUIP-HIDDEN');
  if (v.floor) for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.leg(cx + dx * r * 0.7, cy + dy * r * 0.7, Z0, Z0 + fh, 18); else a.cyl(cx, cy, Z0, Z0 + fh, r * 0.88, 22);
  a.cyl(cx, cy, Z0 + fh, Z1 - 150, r, 28); a.cone(cx, cy, Z1 - 150, Z1 - 90, r, r * 0.86, 28); a.ell(cx, cy, Z1 - 90, r * 0.86, r * 0.86, 70, 24, 6); a.cyl(cx, cy, Z1 - 30, Z1, 22, 10);
  a.box(cx - r - 26, cy - 14, Z1 - 330, cx - r + 4, cy + 14, Z1 - 260); a.box(cx + r - 4, cy - 14, Z1 - 330, cx + r + 26, cy + 14, Z1 - 260);
  const tz = Z0 + fh + 100; a.ycyl(cy - r - 70, cy - r + 4, cx, tz, 14, 10); a.box(cx - 8, cy - r - 70, tz - 50, cx + 8, cy - r - 54, tz); a.box(cx - 10, cy - r - 78, tz + 14, cx + 10, cy - r - 54, tz + 90);
  a.ycyl(cy - r - 22, cy - r + 2, cx + r * 0.62, Z0 + fh + (Z1 - Z0 - fh) * 0.4, 9, 8); a.cyl(cx + r * 0.62, cy - r * 0.8, Z0 + fh + 40, Z1 - 200, 7, 8);
  a.circ(cx, cy, r); a.circ(cx, cy, r * 0.86, 'EQUIP-DETAIL'); a.rect(cx - 8, cy - r - 70, cx + 8, cy - r, 'EQUIP-DETAIL'); a.box(cx - r * 0.5, cy - r - 10, Z0 + fh + (Z1 - Z0 - fh) * 0.62, cx + r * 0.5, cy - r + 2, Z0 + fh + (Z1 - Z0 - fh) * 0.62 + 50);
  a.log(`Added the ${v.floor ? 'four-leg stand' : 'footed base'}, the cylinder body, the domed lid with a knob, two side handles, the front tap with lever, a sight gauge and a control plate (plan and 3D).`);
}

/** Airpot brewer: a back column with a brew head, n brew baskets over n pump airpots on a base plate. */
function airpot(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a, n = v.pots;
  a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 40); a.box(X0 + 10, YB - 230, Z0 + 40, X1 - 10, YB, Z1); a.box(X0, YB - 420, Z1 - 250, X1, YB, Z1);
  const r = Math.min((W / n) * 0.38, 110), cyp = YB - 280;
  for (let i = 0; i < n; i++) { const x = X0 + (W * (i + 0.5)) / n; a.cone(x, cyp, Z1 - 250, Z1 - 290, 55, 40, 14); a.cyl(x, cyp, Z0 + 40, Z1 - 330, r, 22); a.cone(x, cyp, Z1 - 330, Z1 - 300, r, r * 0.7, 22); a.cyl(x, cyp, Z1 - 300, Z1 - 290, r * 0.5, 14); a.tube([[x, cyp, Z1 - 290], [x, cyp - 80, Z1 - 300]], [14, 10], 8);
    a.circ(x, cyp, r); a.circ(x, cyp, 55, 'EQUIP-DETAIL'); a.box(x - 25, YF + 10, Z0 + 40, x + 25, YF + 14, Z0 + 110); }
  for (let i = 0; i < n + 1; i++) a.ycyl(YF + 4, YF + 16, X0 + 40 + i * ((W - 80) / Math.max(n, 1)), Z1 - 90, 12, 8);
  a.log(`Added the base plate, the back column and brew head, ${n} brew baskets over ${n} pump-top airpots and a button row (plan and 3D).`);
}

/** Camp kitchenette: a counter with a bar-fridge door, a drawer, cabinet doors, two burners and a basin, a back splash. */
function kitchenette(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a, sp = 90; cab(a, { toe: 90, doors: 0, topT: 30, splash: { h: sp, t: 40 } });
  const bt = Z1 - sp, fw = Math.min(W * 0.4, 640), z0 = Z0 + 96, z1 = bt - 36, rx0 = X0 + fw + 3;
  a.box(X0 + 8, YF, z0, X0 + fw, YF + T, z1); vbar(a, X0 + fw - 50, z0 + (z1 - z0) * 0.4, z1 - 100, 30); swingPlan(a, X0 + 8, fw - 8, true);
  const dz = 150; a.box(rx0, YF, z1 - dz, X1 - 8, YF + T, z1); pull(a, 'bar', (rx0 + X1) / 2, z1 - dz / 2);
  const nd = v.doors, ww = (X1 - 8 - rx0) / nd;
  for (let i = 0; i < nd; i++) { const xa = rx0 + i * ww + (i ? 3 : 0), xb = rx0 + (i + 1) * ww - (i < nd - 1 ? 3 : 0), l = i < nd / 2; a.box(xa, YF, z0, xb, YF + T, z1 - dz - 4); pull(a, 'knob', l ? xb - 40 : xa + 40, (z0 + z1 - dz) / 2 + 100, YF); swingPlan(a, l ? xa : xb, xb - xa, l); }
  const tw = X1 - X0 - fw; let bx0 = rx0 + 20, bx1 = X1 - 20;
  if (v.sink) { const sx0 = X1 - 20 - Math.min(tw * 0.45, 560); a.box(sx0, YF + 60, bt - 6, X1 - 20, YF + 66, bt + 40); a.box(sx0, YB - 230, bt - 6, X1 - 20, YB - 224, bt + 40); a.box(sx0, YF + 60, bt - 6, sx0 + 6, YB - 224, bt + 40); a.box(X1 - 26, YF + 60, bt - 6, X1 - 20, YB - 224, bt + 40); a.rect(sx0, YF + 60, X1 - 20, YB - 224, 'EQUIP-DETAIL');
    a.tube([[ (sx0 + X1 - 20) / 2, YB - 70, bt], [(sx0 + X1 - 20) / 2, YB - 70, bt + 60], [(sx0 + X1 - 20) / 2, YB - 130, bt + 80]], [14, 12, 10], 8); bx1 = sx0 - 20; }
  if (v.burners) { discs(a, 2, bt, 'coil', bx0, bx1, YF + 30, YB - 70); }
  a.box(X0 + 20, YF - 6, z1 - 60, X0 + 60, YF, z1 - 20);
  a.line(X0, YF, X1, YF);
  a.log(`Added the counter with a bar-fridge door, a drawer, ${nd} cabinet door${nd > 1 ? 's' : ''}${v.burners ? ', two coil burners' : ''}${v.sink ? ', a basin with a gooseneck tap' : ''}, the back splash and the toe kick (plan and 3D).`);
}

/** Compact refrigerator: one body, an optional small freezer door above, a long main door, feet. */
function compactFridge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a, lift = 30;
  a.outline(); a.box(X0, YF + T, Z0 + lift, X1, YB, Z1); for (const x of [X0 + 30, X1 - 30]) for (const y of [YF + 40, YB - 40]) a.cyl(x, y, Z0, Z0 + lift, 14, 8);
  const zt = Z1 - 6, fz = v.fz ? Z0 + lift + (Z1 - Z0 - lift) * 0.78 : zt;
  a.box(X0 + 4, YF, Z0 + lift + 6, X1 - 4, YF + T, fz - 4); vbar(a, X1 - 38, Z0 + lift + (fz - Z0) * 0.25, fz - 80, 26);
  if (v.fz) { a.box(X0 + 4, YF, fz + 4, X1 - 4, YF + T, zt); a.box(X1 - 50, YF - 16, fz + 40, X1 - 26, YF, zt - 30); }
  if (v.glass) a.frame(X0 + 40, Z0 + lift + 40, X1 - 90, fz - 40, YF - 4, YF, 24);
  swingPlan(a, X0 + 4, W - 8, true); a.line(X0, YF, X1, YF);
  a.log(`Added the body on four feet, the long main door with a handle and swing${v.fz ? ', the small freezer door with its handle' : ''}${v.glass ? ' and a glass-frame outline' : ''} (plan and 3D).`);
}

/** Slim under-cabinet or wall hood: a flat box, front visor, filters on the underside, two lights, buttons. */
function hoodSlim(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a;
  a.outline(); a.box(X0, YB - 300, Z0 + 20, X1, YB, Z1); a.box(X0, YF, Z0, X1, YF + 160, Z0 + 90); a.box(X0, YF + 150, Z0, X1, YB - 300, Z1 - 60);
  for (let x = X0 + 60; x < X1 - 60; x += 32) a.box(x, YF + 190, Z0 - 3, x + 16, YB - 330, Z0 + 1); a.rect(X0 + 50, YF + 190, X1 - 50, YB - 330, 'EQUIP-HIDDEN');
  for (let i = 0; i < 2; i++) { a.cyl(X0 + W * (0.25 + 0.5 * i), cy, Z0 - 8, Z0, 22, 10); a.circ(X0 + W * (0.25 + 0.5 * i), cy, 22, 'EQUIP-DETAIL'); }
  for (let i = 0; i < v.keys; i++) a.box(cx - 30 * v.keys + i * 60, YF - 4, Z0 + 20, cx - 30 * v.keys + i * 60 + 40, YF, Z0 + 60);
  if (v.duct) a.cyl(cx, YB - 150, Z1 - 60, Z1, 60, 16);
  a.log(`Added the box with a front visor, ${v.keys} buttons, the underside filter slots and two lights${v.duct ? ', a round duct collar on top' : ''} (plan and 3D).`);
}

function warmCab(a, v) {
  const { X0, X1, YF, Z0, Z1, W } = a, n = v.doors, low = (Z1 - Z0) < 900;
  cab(a, low ? { toe: 90, doors: n, swing: true, pull: 'bar', topT: 20, panel: { z0: Z1 - 190, z1: Z1 - 70, keys: 3 } } : { casters: 100, doors: n, swing: true, pull: 'bar', panel: { z0: Z1 - 260, z1: Z1 - 100, keys: 3 } });
  if (v.win) { const lo = (low ? 100 : 130) + 120, hi = Z1 - (low ? 260 : 360); for (let i = 0; i < n; i++) { const x0 = X0 + 10 + (i * (W - 20)) / n + 60, x1 = X0 + 10 + ((i + 1) * (W - 20)) / n - 60; if (hi - lo > 150) a.frame(x0, Z0 + lo, x1, Z0 + hi, YF - 6, YF, 24); } }
  a.log(`Added ${n} door${n > 1 ? 's' : ''} with bar handles and swings, ${v.win ? 'window frames, ' : ''}a control strip with three dials and ${low ? 'a toe kick' : 'casters'} (plan and 3D).`);
}
function gearCab(a, v) {
  const { Z1 } = a; cab(a, { toe: 100, doors: v.doors, swing: true, louver: true, lock: true, pull: 'bar', panel: { z0: Z1 - 190, z1: Z1 - 80, keys: 3 } });
  a.log(`Added ${v.doors} louvered lockable door${v.doors > 1 ? 's' : ''} with swings, a control strip with three dials and a toe kick (plan and 3D).`);
}

// ---- families ---------------------------------------------------------------------------------------------------------------------
export default [
  // -------- hospital and laboratory cold storage --------
  fam({ cat: CAT, title: 'Generic medication refrigerator', desc: coldDesc('Medication refrigerator'),
    vs: [['18 in undercounter, key lock', 18, 24, 34, 0, { lock: true, disp: true }], ['24 in undercounter, display', 24, 26, 34, 0, { disp: true }], ['24 in undercounter, casters, key lock', 24, 26, 36, 0, { disp: true, lock: true, cast: true }],
      ['24 in upright', 24, 28, 60, 0, { disp: true, lock: true }], ['27 in tall', 27, 30, 72, 0, { disp: true, lock: true }], ['30 in tall, right hinge', 30, 32, 78, 0, { disp: true, lock: true, hinge: 'R' }], ['48 in tall, two doors', 48, 32, 78, 0, { doors: 2, disp: true, lock: true }]],
    build: coldCab }),
  fam({ cat: CAT, title: 'Generic vaccine storage refrigerator, glass door', desc: coldDesc('Glass-door refrigerator'),
    vs: [['24 in undercounter, 2 shelves', 24, 24, 34, 0, { glass: true, shelves: 2, disp: true }], ['24 in, 4 shelves', 24, 28, 72, 0, { glass: true, shelves: 4, disp: true }], ['28 in, 5 shelves', 28, 30, 78, 0, { glass: true, shelves: 5, disp: true }],
      ['30 in, 5 shelves, right hinge', 30, 32, 80, 0, { glass: true, shelves: 5, disp: true, hinge: 'R' }], ['48 in, two doors', 48, 32, 80, 0, { glass: true, shelves: 5, doors: 2, disp: true }], ['54 in, two doors, 6 shelves', 54, 32, 82, 0, { glass: true, shelves: 6, doors: 2, disp: true }], ['72 in, three doors', 72, 32, 82, 0, { glass: true, shelves: 5, doors: 3, disp: true }]],
    build: coldCab }),
  fam({ cat: CAT, title: 'Generic laboratory refrigerator on casters', desc: coldDesc('Laboratory refrigerator'),
    vs: [['23 in, 4 shelves', 23, 30, 72, 0, { glass: true, shelves: 4, cast: true }], ['28 in, 5 shelves', 28, 31, 78, 0, { glass: true, shelves: 5, cast: true }], ['33 in, 5 shelves', 33, 32, 80, 0, { glass: true, shelves: 5, cast: true }], ['47 in, two doors', 47, 32, 80, 0, { glass: true, shelves: 5, doors: 2, cast: true }],
      ['55 in, two doors, 6 shelves', 55, 32, 82, 0, { glass: true, shelves: 6, doors: 2, cast: true }], ['69 in, three doors', 69, 32, 82, 0, { glass: true, shelves: 5, doors: 3, cast: true }], ['83 in, four doors', 83, 32, 82, 0, { glass: true, shelves: 5, doors: 4, cast: true }]],
    build: coldCab }),
  fam({ cat: CAT, title: 'Generic blood-bank style cooler', desc: coldDesc('Blood-bank style cooler'),
    vs: [['24 in undercounter', 24, 26, 34, 0, { glass: true, shelves: 2, disp: true, chart: true, alarm: true }], ['24 in upright', 24, 30, 72, 0, { glass: true, shelves: 4, disp: true, chart: true, alarm: true }], ['30 in upright', 30, 30, 78, 0, { glass: true, shelves: 5, disp: true, chart: true, alarm: true }],
      ['48 in, two doors', 48, 32, 80, 0, { glass: true, shelves: 5, doors: 2, disp: true, chart: true, alarm: true }], ['54 in, two doors', 54, 34, 80, 0, { glass: true, shelves: 6, doors: 2, disp: true, chart: true, alarm: true, lock: true }], ['72 in, three doors', 72, 34, 80, 0, { glass: true, shelves: 5, doors: 3, disp: true, chart: true, alarm: true, lock: true }]],
    build: coldCab }),
  fam({ cat: CAT, title: 'Generic pharmacy undercounter drawer refrigerator',
    desc: (v) => `Under-counter refrigerator ${v.w} in wide with ${v.drawers} drawer fronts with bar pulls, a countertop edge and a toe kick.`,
    vs: [['24 in, 2 drawers', 24, 24, 34, 0, { drawers: 2 }], ['24 in, 3 drawers', 24, 24, 34, 0, { drawers: 3 }], ['30 in, 3 drawers', 30, 24, 34, 0, { drawers: 3 }], ['30 in, 4 drawers', 30, 24, 34, 0, { drawers: 4 }], ['36 in, 4 drawers', 36, 24, 34, 0, { drawers: 4 }]],
    build: underFridge }),
  fam({ cat: CAT, title: 'Generic flammable-storage laboratory refrigerator', desc: coldDesc('Laboratory refrigerator'),
    vs: [['24 in undercounter', 24, 26, 34, 0, { hazard: true, lock: true, disp: true }], ['24 in upright', 24, 30, 72, 0, { hazard: true, lock: true, disp: true, cast: true }], ['30 in upright', 30, 32, 78, 0, { hazard: true, lock: true, disp: true, cast: true }], ['36 in upright', 36, 32, 78, 0, { hazard: true, lock: true, disp: true, cast: true }], ['48 in, two doors', 48, 32, 78, 0, { hazard: true, lock: true, disp: true, cast: true, doors: 2 }]],
    build: coldCab }),
  fam({ cat: CAT, title: 'Generic laboratory upright freezer', desc: coldDesc('Upright freezer'),
    vs: [['24 in, 1 door', 24, 28, 72, 0, { panels: true, lock: true, disp: true }], ['28 in, 1 door', 28, 30, 76, 0, { panels: true, lock: true, disp: true }], ['32 in, 1 door', 32, 32, 78, 0, { panels: true, lock: true, disp: true, cast: true }], ['48 in, 2 doors', 48, 32, 78, 0, { panels: true, doors: 2, disp: true, cast: true }], ['56 in, 2 doors', 56, 34, 80, 0, { panels: true, doors: 2, disp: true, cast: true }], ['72 in, 3 doors', 72, 34, 80, 0, { panels: true, doors: 3, disp: true, cast: true }]],
    build: coldCab }),
  fam({ cat: CAT, title: 'Generic ultra-low upright freezer', desc: coldDesc('Ultra-low freezer'),
    vs: [['28 in, 1 door', 28, 34, 76, 0, { latch: true, panels: true, lock: true, disp: true, alarm: true, cast: true }], ['30 in, 1 door', 30, 36, 80, 0, { latch: true, panels: true, lock: true, disp: true, alarm: true, cast: true }], ['34 in, 1 door', 34, 38, 82, 0, { latch: true, panels: true, lock: true, disp: true, alarm: true, cast: true }],
      ['34 in, right hinge', 34, 38, 82, 0, { latch: true, panels: true, lock: true, disp: true, alarm: true, cast: true, hinge: 'R' }], ['58 in, 2 doors', 58, 38, 82, 0, { latch: true, panels: true, lock: true, disp: true, alarm: true, cast: true, doors: 2 }]],
    build: coldCab }),
  fam({ cat: CAT, title: 'Generic ultra-low chest freezer',
    desc: (v) => `Ultra-low chest freezer ${v.w} in long with ${v.lids} hinged lid${v.lids > 1 ? 's' : ''}, lid latches, a front control panel with display${v.cast ? ', casters' : ' and feet'}.`,
    vs: [['28 in, 1 lid', 28, 32, 36, 0, { lids: 1, latch: true, ctrl: true, cast: true }], ['36 in, 1 lid', 36, 32, 36, 0, { lids: 1, latch: true, ctrl: true, cast: true }], ['36 in, 1 lid, feet', 36, 32, 36, 0, { lids: 1, latch: true, ctrl: true }], ['45 in, 2 lids', 45, 35, 36, 0, { lids: 2, latch: true, ctrl: true, cast: true }], ['58 in, 2 lids', 58, 36, 36, 0, { lids: 2, latch: true, ctrl: true, cast: true }], ['72 in, 3 lids', 72, 36, 36, 0, { lids: 3, latch: true, ctrl: true, cast: true }]],
    build: chest }),
  fam({ cat: CAT, title: 'Generic mine-camp chest freezer',
    desc: (v) => `Chest freezer ${v.w} in long with ${v.lids} hinged lid${v.lids > 1 ? 's' : ''}, lip handles, ${v.baskets} wire basket${v.baskets > 1 ? 's' : ''}${v.lock ? ', a key lock' : ''} and four feet.`,
    vs: [['36 in, 1 lid', 36, 24, 35, 0, { lids: 1, baskets: 1 }], ['48 in, 1 lid, key lock', 48, 26, 35, 0, { lids: 1, baskets: 1, lock: true }], ['60 in, 2 lids', 60, 28, 35, 0, { lids: 2, baskets: 2 }], ['71 in, 2 lids, key lock', 71, 28, 35, 0, { lids: 2, baskets: 2, lock: true }], ['83 in, 3 lids', 83, 30, 35, 0, { lids: 3, baskets: 3 }], ['95 in, 3 lids, key lock', 95, 30, 35, 0, { lids: 3, baskets: 3, lock: true }]],
    build: chest }),
  fam({ cat: CAT, title: 'Generic hospital warming cabinet',
    desc: (v) => `Warming cabinet ${v.w} in wide with ${v.doors} door${v.doors > 1 ? 's' : ''} with bar handles${v.win ? ' and window frames' : ''}, a control strip with three dials and ${v.h < 40 ? 'a toe kick' : 'casters'}.`,
    vs: [['24 in undercounter', 24, 26, 34, 0, { doors: 1 }], ['30 in undercounter, window', 30, 28, 34, 0, { doors: 1, win: true }], ['24 in tall', 24, 28, 72, 0, { doors: 1 }], ['27 in tall, window', 27, 30, 72, 0, { doors: 1, win: true }], ['30 in tall, window', 30, 30, 72, 0, { doors: 1, win: true }], ['36 in tall, two doors', 36, 30, 72, 0, { doors: 2 }], ['36 in tall, two doors, windows', 36, 30, 72, 0, { doors: 2, win: true }], ['48 in tall, two doors', 48, 30, 72, 0, { doors: 2, win: true }]],
    build: warmCab }),
  fam({ cat: CAT, title: 'Generic laboratory tabletop sterilizer',
    desc: (v) => `Tabletop sterilizer ${v.w} in wide with a round chamber door and bar handle, a control panel with a display and three dials, a water-fill cap on top${v.drawer ? ', a front drawer' : ''} and four feet.`,
    vs: [['14 in', 14, 18, 12, 36, {}], ['16 in', 16, 20, 14, 36, {}], ['18 in', 18, 24, 16, 36, {}], ['20 in', 20, 26, 18, 36, {}], ['22 in', 22, 28, 20, 36, {}], ['24 in', 24, 28, 22, 36, {}], ['24 in with drawer', 24, 30, 26, 36, { drawer: true }]],
    build: steril }),
  fam({ cat: CAT, title: 'Generic ultrasonic cleaner tank',
    desc: (v) => `Ultrasonic cleaner tank ${v.w} in long: tank walls, a wire basket with carrying bar, a front control strip with two dials and a display, a drain tap${v.stand ? ', a four-leg stand with a shelf' : ' and four feet'}${v.lid ? ' and a flat lid' : ''}.`,
    vs: [['10 in', 10, 7, 9, 36, {}], ['12 in', 12, 8, 10, 36, {}], ['15 in, lid', 15, 9, 11, 36, { lid: true }], ['18 in, lid', 18, 11, 12, 36, { lid: true }], ['24 in, lid', 24, 14, 14, 36, { lid: true }], ['28 in, lid', 28, 16, 16, 36, { lid: true }], ['36 in, stand', 36, 18, 44, 0, { stand: true, lid: true }]],
    build: ultra }),
  fam({ cat: CAT, title: 'Generic laboratory benchtop incubator',
    desc: (v) => `Benchtop incubator ${v.w} in wide with a glass-frame door, ${v.shelves} shelves, a control header with a display and two dials and four feet.`,
    vs: [['17 in, 2 shelves', 17, 18, 22, 36, { shelves: 2 }], ['20 in, 3 shelves', 20, 20, 26, 36, { shelves: 3 }], ['24 in, 3 shelves', 24, 22, 30, 36, { shelves: 3 }], ['28 in, 4 shelves', 28, 24, 34, 36, { shelves: 4 }], ['32 in, 4 shelves', 32, 26, 36, 36, { shelves: 4 }], ['36 in, 5 shelves', 36, 28, 40, 36, { shelves: 5 }]],
    build: (a, v) => benchOven(a, { ...v, glass: true }) }),
  fam({ cat: CAT, title: 'Generic laboratory drying oven',
    desc: (v) => `Drying oven ${v.w} in wide with a solid door and handle, ${v.shelves} shelves, a control header with a display and two dials, a top exhaust collar and four feet.`,
    vs: [['18 in, 2 shelves', 18, 20, 24, 36, { shelves: 2 }], ['22 in, 3 shelves', 22, 22, 28, 36, { shelves: 3 }], ['26 in, 3 shelves', 26, 24, 32, 36, { shelves: 3 }], ['30 in, 4 shelves', 30, 26, 36, 36, { shelves: 4 }], ['36 in, 5 shelves', 36, 28, 40, 36, { shelves: 5 }], ['42 in, 5 shelves', 42, 30, 42, 36, { shelves: 5 }]],
    build: (a, v) => benchOven(a, { ...v, vent: true }) }),
  fam({ cat: CAT, title: 'Generic laboratory undercounter freezer', desc: coldDesc('Undercounter freezer'),
    vs: [['18 in', 18, 24, 34, 0, { panels: false, disp: true, lock: true }], ['24 in', 24, 26, 34, 0, { disp: true, lock: true }], ['24 in, casters', 24, 26, 36, 0, { disp: true, cast: true }], ['30 in, two doors', 30, 26, 34, 0, { disp: true, doors: 2 }]],
    build: coldCab }),

  // -------- staff rooms, wards, crew lounges --------
  fam({ cat: CAT, title: 'Generic ward pantry dishwasher',
    desc: (v) => `Under-counter dishwasher ${v.w} in wide for a ward pantry: a ${v.panel ? 'panel-ready door and a hidden control strip' : v.bar ? 'bar-handled door' : 'door with a recessed handle'}, controls, a toe kick and the front joint.`,
    vs: [['18 in', 18, 24, 34, 0, {}], ['18 in, bar handle', 18, 24, 34, 0, { bar: true }], ['24 in', 24, 24, 34, 0, {}], ['24 in, bar handle', 24, 24, 34, 0, { bar: true }], ['24 in, top controls', 24, 24, 34, 0, { bar: true, top: true }], ['24 in, panel ready', 24, 24, 34, 0, { panel: true }]],
    build: B('built-in dishwasher') }),
  fam({ cat: CAT, title: 'Generic staff-room countertop microwave', desc: 'Countertop microwave with a window door on the left, a handle, a button column and dial on the right, and four feet.',
    vs: [['17 in, compact', 17, 13, 10, 36, {}], ['18 in', 18, 14, 11, 36, {}], ['20 in', 20, 16, 12, 36, {}], ['22 in', 22, 18, 13, 36, {}], ['24 in, display', 24, 19, 14, 36, { disp: true }], ['26 in, display', 26, 20, 15, 36, { disp: true }]],
    build: B('countertop microwave oven') }),
  fam({ cat: CAT, title: 'Generic hangar crew-lounge over-range microwave', desc: (v) => `Microwave ${v.w} in wide mounted over a range, with a windowed door, a handle, a button panel and an exhaust grille on the underside.`,
    vs: [['24 in', 24, 16, 16, 66, {}], ['30 in', 30, 16, 17, 66, {}], ['36 in', 36, 16, 17, 66, {}]], build: B('over-the-range microwave') }),
  fam({ cat: CAT, title: 'Generic hospital staff-room refrigerator, top freezer',
    desc: (v) => `${v.w} in refrigerator with a freezer door over a fresh-food door, vertical handles, door swing and a toe kick.`,
    vs: [['24 in', 24, 28, 58, 0, {}], ['28 in', 28, 30, 62, 0, {}], ['30 in', 30, 31, 66, 0, {}], ['33 in', 33, 33, 68, 0, {}], ['36 in', 36, 33, 70, 0, {}]], build: (a) => fridge(a, { kind: 'top' }) }),
  fam({ cat: CAT, title: 'Generic site-trailer refrigerator, bottom freezer',
    desc: (v) => `${v.w} in refrigerator with ${v.french ? 'two French doors' : 'one fresh-food door'} over a pull-out freezer drawer, vertical handles, door swing and a toe kick.`,
    vs: [['30 in', 30, 31, 67, 0, {}], ['33 in', 33, 33, 68, 0, {}], ['33 in, French doors', 33, 33, 69, 0, { french: true }], ['36 in, French doors', 36, 34, 70, 0, { french: true }], ['36 in, French doors, tall', 36, 34, 72, 0, { french: true }]],
    build: (a, v) => fridge(a, { kind: 'bottom', french: v.french }) }),
  fam({ cat: CAT, title: 'Generic mine-camp mess side-by-side refrigerator',
    desc: (v) => `${v.w} in refrigerator with a narrow freezer door beside a wide fresh-food door${v.disp ? ' and a water dispenser recess' : ''}, vertical handles and swings.`,
    vs: [['33 in', 33, 33, 69, 0, {}], ['36 in', 36, 34, 70, 0, {}], ['36 in, dispenser', 36, 34, 70, 0, { disp: true }], ['42 in, dispenser', 42, 34, 72, 0, { disp: true }]],
    build: (a, v) => fridge(a, { kind: 'side', dispenser: v.disp }) }),
  fam({ cat: CAT, title: 'Generic crew-quarters compact refrigerator',
    desc: (v) => `Compact refrigerator ${v.w} in wide with a long main door and handle${v.fz ? ', a small freezer door above it' : ''}${v.glass ? ', a glass-frame outline on the door' : ''} and four feet.`,
    vs: [['17 in, countertop', 17, 18, 19, 36, {}], ['18 in, countertop, freezer', 18, 20, 21, 36, { fz: true }], ['18 in, floor', 18, 20, 33, 0, {}], ['20 in, freezer', 20, 22, 33, 0, { fz: true }], ['20 in, glass', 20, 22, 33, 0, { glass: true }], ['24 in, freezer', 24, 24, 34, 0, { fz: true }], ['24 in, tall', 24, 25, 45, 0, { fz: true }]],
    build: compactFridge }),

  // -------- camp kitchens and laundry --------
  fam({ cat: CAT, title: 'Generic camp kitchen range with griddle', desc: (v) => `Freestanding gas range ${v.w} in wide: a flat griddle plate with a grease trough on the left, ${v.burners} gas burners with grates on the right, a backguard control panel, ${v.ovens === 2 ? 'two oven doors' : 'one oven door'} with window and handle${v.drawer ? ' and a drawer' : ''}.`,
    vs: [['36 in, 2 burners', 36, 28, 47, 0, { burners: 2, ovens: 1, griddle: true }], ['48 in, 4 burners', 48, 29, 47, 0, { burners: 4, ovens: 1, griddle: true }], ['48 in, 4 burners, two ovens', 48, 29, 47, 0, { burners: 4, ovens: 2, griddle: true }], ['60 in, 4 burners, two ovens and drawer', 60, 29, 47, 0, { burners: 4, ovens: 2, griddle: true, drawer: true }], ['60 in, 6 burners', 60, 30, 47, 0, { burners: 6, ovens: 1, griddle: true }], ['72 in, 6 burners, two ovens', 72, 30, 47, 0, { burners: 6, ovens: 2, griddle: true, drawer: true }]],
    build: rangeBody }),
  fam({ cat: CAT, title: 'Generic site-trailer electric range', desc: rangeDesc('Freestanding electric'),
    vs: [['20 in, coil elements', 20, 25, 38, 0, { burners: 4, ovens: 1, electric: true, coil: true, front: true }], ['24 in, coil elements', 24, 26, 38, 0, { burners: 4, ovens: 1, electric: true, coil: true, front: true }], ['30 in, coil elements', 30, 27, 46, 0, { burners: 4, ovens: 1, electric: true, coil: true }], ['30 in, smooth top, drawer', 30, 28, 46, 0, { burners: 4, ovens: 1, electric: true, drawer: true }], ['36 in, smooth top, 6 elements', 36, 28, 47, 0, { burners: 6, ovens: 1, electric: true }]],
    build: rangeBody }),
  fam({ cat: CAT, title: 'Generic camp kitchen wall oven',
    desc: (v) => `Built-in ${v.ovens === 2 ? 'double' : 'single'} wall oven with ${v.ovens === 2 ? 'two windowed doors, bar handles' : 'a windowed door, a bar handle'} and a control strip of knobs across the top.`,
    vs: [['24 in, single', 24, 24, 24, 36, { ovens: 1 }], ['27 in, single', 27, 24, 28, 36, { ovens: 1 }], ['30 in, single', 30, 24, 29, 36, { ovens: 1 }], ['30 in, double', 30, 24, 52, 18, { ovens: 2 }], ['36 in, double', 36, 24, 52, 18, { ovens: 2 }]], build: B('built-in wall oven') }),
  fam({ cat: CAT, title: 'Generic crew-lounge induction hot plate',
    desc: (v) => `Portable induction hot plate with ${v.n === 2 ? 'two ring zones' : 'one ring zone'}, a glass top, a control strip with dials and side vents.`,
    vs: [['single, 12 in', 12, 10, 3, 36, { n: 1 }], ['single, 14 in', 14, 11, 3, 36, { n: 1 }], ['double, 24 in', 24, 14, 3, 36, { n: 2 }], ['double, 28 in', 28, 15, 3, 36, { n: 2 }]], build: B('portable induction burner') }),
  fam({ cat: CAT, title: 'Generic camp laundry front-load washer', desc: 'Front-load washer with a round glass-ring door, a detergent drawer, a control strip with four dials and a toe kick.',
    vs: [['24 in', 24, 24, 33, 0, { kind: 'wash' }], ['24 in, tall', 24, 27, 34, 0, { kind: 'wash' }], ['27 in', 27, 31, 39, 0, { kind: 'wash' }], ['27 in, deep', 27, 33, 39, 0, { kind: 'wash' }], ['29 in', 29, 32, 40, 0, { kind: 'wash' }]], build: washerFront }),
  fam({ cat: CAT, title: 'Generic camp laundry front-load dryer', desc: 'Front-load dryer with a round glass-ring door, a control strip with four dials and a toe kick.',
    vs: [['24 in', 24, 24, 33, 0, { kind: 'dry' }], ['24 in, tall', 24, 27, 34, 0, { kind: 'dry' }], ['27 in', 27, 31, 39, 0, { kind: 'dry' }], ['27 in, deep', 27, 34, 39, 0, { kind: 'dry' }], ['29 in', 29, 32, 40, 0, { kind: 'dry' }]], build: washerFront }),
  fam({ cat: CAT, title: 'Generic crew-quarters stacked washer-dryer', desc: 'Washer and dryer stacked in one column: two round glass-ring doors, two control strips with four dials each and a toe kick.',
    vs: [['24 in', 24, 26, 66, 0, { stack: true }], ['24 in, deep', 24, 28, 68, 0, { stack: true }], ['27 in', 27, 31, 77, 0, { stack: true }], ['27 in, tall', 27, 33, 80, 0, { stack: true }]], build: washerFront }),
  fam({ cat: CAT, title: 'Generic camp laundry top-load washer', desc: (v) => `Top-load washer ${v.w} in wide with a hinged lid showing a glass window, a back console with five dials and a lid-latch handle.`,
    vs: [['24 in', 24, 26, 41, 0, {}], ['24 in, tall', 24, 27, 43, 0, {}], ['27 in', 27, 28, 43, 0, {}], ['27 in, deep', 27, 30, 44, 0, {}]], build: B('top-loading washer') }),
  fam({ cat: CAT, title: 'Generic mine dry-house gear drying cabinet',
    desc: (v) => `Gear drying cabinet ${v.w} in wide with ${v.doors} louvered lockable door${v.doors > 1 ? 's' : ''}, a control strip with three dials and a toe kick.`,
    vs: [['24 in, 1 door', 24, 24, 72, 0, { doors: 1 }], ['30 in, 1 door', 30, 26, 72, 0, { doors: 1 }], ['36 in, 2 doors', 36, 26, 78, 0, { doors: 2 }], ['48 in, 2 doors', 48, 28, 78, 0, { doors: 2 }], ['60 in, 3 doors', 60, 28, 78, 0, { doors: 3 }], ['72 in, 3 doors', 72, 30, 84, 0, { doors: 3 }], ['96 in, 4 doors', 96, 30, 84, 0, { doors: 4 }]],
    build: gearCab }),
  fam({ cat: CAT, title: 'Generic mine dry-house boot and glove dryer',
    desc: (v) => `Floor boot and glove dryer with a heater base with a front grille and dial and ${v.pegs} upright pegs with rounded tips${v.rail ? ' and a rear rail' : ''}.`,
    vs: [['2 pegs', 10, 10, 24, 0, { pegs: 2 }], ['4 pegs', 16, 10, 26, 0, { pegs: 4 }], ['6 pegs', 22, 10, 26, 0, { pegs: 6 }], ['8 pegs', 28, 10, 28, 0, { pegs: 8 }], ['10 pegs, rail', 34, 12, 32, 0, { pegs: 10, rail: true }], ['12 pegs, rail', 40, 12, 32, 0, { pegs: 12, rail: true }], ['16 pegs, rail', 52, 12, 34, 0, { pegs: 16, rail: true }]],
    build: bootDryer }),
  fam({ cat: CAT, title: 'Generic site-trailer bottled water cooler',
    desc: (v) => `Freestanding ${v.load === 'top' ? 'top-load' : 'bottom-load'} water cooler with ${v.load === 'top' ? 'an inverted bottle on top' : 'a hinged lower door'}, hot and cold taps, a drip tray and four small feet.`,
    vs: [['top load, 12 in', 12, 12, 40, 0, { load: 'top' }], ['top load, 13 in', 13, 13, 42, 0, { load: 'top' }], ['top load, tall', 13, 14, 44, 0, { load: 'top' }], ['bottom load, 12 in', 12, 14, 38, 0, { load: 'bottom' }], ['bottom load, 13 in', 13, 14, 40, 0, { load: 'bottom' }], ['bottom load, tall', 13, 15, 42, 0, { load: 'bottom' }]],
    build: B('freestanding water dispenser') }),
  fam({ cat: CAT, title: 'Generic camp mess hot water urn',
    desc: (v) => `Hot water urn of ${v.gal} gallons: a cylinder body on ${v.floor ? 'a four-leg stand' : 'a footed base'}, a domed lid with a knob, two side handles, a front tap with lever and a sight gauge.`,
    vs: [['2 gallon', 9, 9, 20, 36, { gal: 2 }], ['3 gallon', 11, 11, 24, 36, { gal: 3 }], ['5 gallon', 13, 13, 28, 36, { gal: 5 }], ['10 gallon', 16, 16, 34, 36, { gal: 10 }], ['10 gallon, floor stand', 16, 16, 52, 0, { gal: 10, floor: true }], ['20 gallon, floor stand', 20, 20, 58, 0, { gal: 20, floor: true }], ['30 gallon, floor stand', 24, 24, 64, 0, { gal: 30, floor: true }]],
    build: urn }),
  fam({ cat: CAT, title: 'Generic hangar crew-lounge airpot coffee brewer',
    desc: (v) => `Brewer with a back column and brew head, ${v.pots} brew basket${v.pots > 1 ? 's' : ''} over ${v.pots} pump-top airpot${v.pots > 1 ? 's' : ''} on a base plate and a button row.`,
    vs: [['1 airpot', 9, 17, 25, 36, { pots: 1 }], ['2 airpots', 17, 17, 25, 36, { pots: 2 }], ['2 airpots, wide', 20, 18, 26, 36, { pots: 2 }], ['3 airpots', 25, 17, 25, 36, { pots: 3 }], ['4 airpots', 33, 18, 26, 36, { pots: 4 }]],
    build: airpot }),
  fam({ cat: CAT, title: 'Generic hangar crew-lounge toaster', desc: (v) => `Pop-up toaster with ${v.slots} slots, a side lever, a browning dial and a crumb tray; ${v.long ? 'long-slot body' : 'standard body'}.`,
    vs: [['two slice', 11, 6, 8, 36, { slots: 2, long: false }], ['two slice, wide', 12, 7, 8, 36, { slots: 2, long: false }], ['two long slots', 14, 7, 8, 36, { slots: 2, long: true }], ['four slice', 15, 11, 8, 36, { slots: 4, long: false }], ['four slice, wide', 17, 12, 9, 36, { slots: 4, long: false }]], build: B('toaster') }),
  fam({ cat: CAT, title: 'Generic crew-lounge toaster oven', desc: (v) => `Countertop toaster oven with a glass door, a pull handle, a ${v.knobs}-dial control side and a wire rack and tray drawn inside; fits ${v.slices} slices.`,
    vs: [['four slice', 15, 11, 9, 36, { knobs: 2, slices: 4 }], ['six slice', 17, 13, 10, 36, { knobs: 3, slices: 6 }], ['nine slice', 20, 16, 12, 36, { knobs: 3, slices: 9 }], ['twelve slice', 22, 17, 13, 36, { knobs: 3, slices: 12 }]], build: B('toaster oven') }),
  fam({ cat: CAT, title: 'Generic camp mess rice cooker', desc: (v) => `Rice cooker for ${v.cups} cups: a round body, a domed lid with a steam vent, a carry handle, a front latch button and a control panel.`,
    vs: [['5 cup', 11, 11, 10, 36, { cups: 5 }], ['10 cup', 14, 14, 11, 36, { cups: 10 }], ['20 cup', 17, 17, 13, 36, { cups: 20 }], ['30 cup', 20, 20, 15, 36, { cups: 30 }], ['50 cup', 24, 24, 17, 36, { cups: 50 }]], build: B('rice cooker') }),
  fam({ cat: CAT, title: 'Generic camp mess electric kettle', desc: (v) => `Electric kettle holding ${v.l} litres: a cylindrical jug, a pouring spout, a handle, a hinged lid and a base plate with a power cord stub.`,
    vs: [['1 litre', 8, 6, 9, 36, { l: 1 }], ['1.7 litre', 9, 7, 10, 36, { l: 1.7 }], ['2.5 litre', 10, 8, 11, 36, { l: 2.5 }], ['3.5 litre', 11, 9, 12, 36, { l: 3.5 }], ['5 litre', 12, 10, 14, 36, { l: 5 }]], build: B('electric kettle') }),
  fam({ cat: CAT, title: 'Generic camp mess slow cooker', desc: (v) => `Oval slow cooker for ${v.qt} quarts: a base with two dials, a pot with side handles and a vented lid with a knob.`,
    vs: [['4 quart', 14, 10, 10, 36, { qt: 4 }], ['6 quart', 16, 11, 11, 36, { qt: 6 }], ['8 quart', 18, 13, 12, 36, { qt: 8 }], ['12 quart', 21, 15, 14, 36, { qt: 12 }]], build: B('slow cooker') }),
  fam({ cat: CAT, title: 'Generic nursing-unit drip coffee maker', desc: (v) => `Drip coffee maker for ${v.cups} cups: a back column with a water tank and a brew head, ${v.thermal ? 'a steel thermal carafe' : 'a glass carafe on a warming plate'} and a front button row.`,
    vs: [['10 cup, glass carafe', 9, 12, 14, 36, { cups: 10 }], ['12 cup, glass carafe', 10, 12, 15, 36, { cups: 12 }], ['12 cup, thermal carafe', 10, 12, 15, 36, { cups: 12, thermal: true }]], build: B('drip coffee maker') }),
  fam({ cat: CAT, title: 'Generic camp kitchenette unit',
    desc: (v) => `Kitchenette counter ${v.w} in wide with a bar-fridge door, a drawer, ${v.doors} cabinet door${v.doors > 1 ? 's' : ''}${v.burners ? ', two coil burners' : ''}${v.sink ? ', a basin with a gooseneck tap' : ''}, a back splash and a toe kick.`,
    vs: [['48 in, 1 door', 48, 24, 36, 0, { doors: 1 }], ['48 in, burners', 48, 24, 36, 0, { doors: 1, burners: true }], ['60 in, sink', 60, 24, 36, 0, { doors: 2, sink: true }], ['60 in, burners', 60, 24, 36, 0, { doors: 2, burners: true }], ['72 in, burners and sink', 72, 24, 36, 0, { doors: 2, burners: true, sink: true }], ['84 in, burners and sink', 84, 25, 36, 0, { doors: 3, burners: true, sink: true }]],
    build: kitchenette }),
  fam({ cat: CAT, title: 'Generic camp kitchen canopy hood', desc: 'Wall-mounted canopy hood with a stepped hood, a rear chimney, baffle filter slots on the underside, two lights and fan buttons.',
    vs: [['60 in', 60, 30, 30, 66, {}], ['72 in', 72, 30, 30, 66, {}], ['84 in', 84, 32, 32, 66, {}], ['96 in', 96, 32, 32, 66, {}]], build: (a, v) => canopy(a, v) }),
  fam({ cat: CAT, title: 'Generic site-trailer slim range hood', desc: (v) => `Slim hood ${v.w} in wide: a box with a front visor, ${v.keys} buttons, underside filter slots and two lights${v.duct ? ' and a round duct collar on top' : ''}.`,
    vs: [['24 in', 24, 17, 6, 54, { keys: 3 }], ['30 in', 30, 17, 6, 54, { keys: 3 }], ['36 in', 36, 18, 6, 54, { keys: 4, duct: true }], ['42 in', 42, 18, 7, 54, { keys: 4, duct: true }], ['48 in', 48, 20, 7, 54, { keys: 5, duct: true }]],
    build: hoodSlim }),
  fam({ cat: CAT, title: 'Generic laboratory flake ice maker', desc: (v) => `Under-counter ice maker ${v.w} in wide with a hinged door with handle, a scoop-shaped bin visible behind a clear panel, a front grille and a drain note in plan.`,
    vs: [['15 in', 15, 24, 34, 0, {}], ['18 in', 18, 24, 34, 0, {}], ['21 in', 21, 24, 34, 0, {}], ['24 in', 24, 24, 34, 0, {}], ['30 in', 30, 26, 34, 0, {}]], build: B('undercounter ice maker') }),
];

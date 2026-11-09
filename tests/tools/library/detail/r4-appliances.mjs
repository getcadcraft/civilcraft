/* SPDX-License-Identifier: Apache-2.0 */
/** Round 4, group appliances (appliances/residential): staff-kitchen, break-room, lounge-kitchenette and tenant appliances, 150 variants. */
import { fam, cab, pull, T, GAP, A } from './r4-kit.mjs';

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
  if (v.electric) discs(a, v.burners, top, v.coil ? 'coil' : 'flat', X0 + 30, X1 - 30, YF + 40, YB - 110); else gasBurners(a, v.burners, top, X0 + 20, X1 - 20, YF + 30, YB - 110);
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
    const s = f(0.7); slab(a, X0 + 12, b, X1 - 12, s - 4); slab(a, X0 + 12, s + 4, X1 - 12, Z1 - 12); vbar(a, X1 - 60, b + 300, b + 900, 34); vbar(a, X1 - 60, s + 80, s + 520, 34);
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

// ---- families --------------------------------------------------------------------------------------------------------------------
export default [
  fam({ cat: CAT, title: 'Generic break-room gas range',
    desc: rangeDesc('Freestanding gas'),
    vs: [['24 in, 4 burners', 24, 27, 46, 0, { burners: 4, ovens: 1 }], ['30 in, 5 burners', 30, 28, 46, 0, { burners: 5, ovens: 1 }], ['36 in, 6 burners', 36, 28, 47, 0, { burners: 6, ovens: 1 }],
      ['48 in, 8 burners, two ovens', 48, 29, 47, 0, { burners: 8, ovens: 2 }], ['60 in, 8 burners, two ovens and drawer', 60, 29, 47, 0, { burners: 8, ovens: 2, drawer: true }]],
    build: rangeBody }),
  fam({ cat: CAT, title: 'Generic staff-kitchen electric range',
    desc: rangeDesc('Freestanding electric'),
    vs: [['20 in, coil elements, front controls', 20, 25, 38, 0, { burners: 4, ovens: 1, electric: true, coil: true, front: true }], ['24 in, coil elements, front controls', 24, 26, 38, 0, { burners: 4, ovens: 1, electric: true, coil: true, front: true }],
      ['30 in, smooth top', 30, 28, 46, 0, { burners: 5, ovens: 1, electric: true }], ['30 in, smooth top with drawer', 30, 28, 46, 0, { burners: 5, ovens: 1, electric: true, drawer: true }], ['36 in, smooth top', 36, 28, 47, 0, { burners: 6, ovens: 1, electric: true }]],
    build: rangeBody }),

  fam({ cat: CAT, title: 'Generic gas cooktop',
    desc: (v) => `Built-in gas cooktop with ${v.n} burners, cast grates, and a front row of ${Math.min(v.n, 6)} control knobs on the housing.`,
    vs: [['15 in, 2 burners', 15, 21, 5, 34, { n: 2 }], ['24 in, 4 burners', 24, 21, 5, 34, { n: 4 }], ['30 in, 5 burners', 30, 21, 5, 34, { n: 5 }], ['36 in, 6 burners', 36, 21, 5, 34, { n: 6 }], ['48 in, 8 burners', 48, 21, 5, 34, { n: 8 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z1 - 40); gasBurners(a, v.n, Z1 - 40); knobs(a, Math.min(v.n, 6), Z0 + 55, X0 + 40, X1 - 40, 14); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL'); a.log('Added the cooktop plate, burners with grates and the front knobs (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic electric radiant cooktop',
    desc: (v) => `Built-in smooth electric cooktop with ${v.n} radiant elements marked by rings and a row of touch-control strips at the front edge.`,
    vs: [['24 in, 4 elements', 24, 21, 4, 34, { n: 4 }], ['30 in, 5 elements', 30, 21, 4, 34, { n: 5 }], ['36 in, 6 elements', 36, 21, 4, 34, { n: 6 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z1 - 12); discs(a, v.n, Z1 - 12, 'flat', X0 + 10, X1 - 10, YF + 50, YB - 10); a.box(X0 + 30, YF + 6, Z1 - 12, X1 - 30, YF + 40, Z1 - 6); a.line(X0 + 30, YF + 40, X1 - 30, YF + 40); a.log('Added the glass top, the radiant element rings and the front control strip (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic built-in induction hob',
    desc: (v) => `Built-in induction hob with ${v.n} cooking zones drawn as rings, a bridge line between the left pair and a slider control strip.`,
    vs: [['24 in, 2 zones', 24, 21, 4, 34, { n: 2 }], ['30 in, 4 zones', 30, 21, 4, 34, { n: 4 }], ['36 in, 5 zones', 36, 21, 4, 34, { n: 5 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z1 - 10); discs(a, v.n, Z1 - 10, 'flat', X0 + 10, X1 - 10, YF + 50, YB - 10); a.box(X0 + 30, YF + 6, Z1 - 10, X1 - 30, YF + 36, Z1 - 5); for (let i = 1; i <= v.n; i++) a.line(X0 + 30 + i * ((X1 - X0 - 60) / (v.n + 1)), YF + 8, X0 + 30 + i * ((X1 - X0 - 60) / (v.n + 1)), YF + 34); a.log('Added the glass top, the zone rings and the slider strip (plan and 3D).'); } }),

  fam({ cat: CAT, title: 'Generic built-in wall oven',
    desc: (v) => `Built-in ${v.ovens === 2 ? 'double' : 'single'} wall oven with ${v.ovens === 2 ? 'two windowed doors, bar handles' : 'a windowed door, a bar handle'} and a control strip of knobs across the top.`,
    vs: [['24 in, single', 24, 24, 24, 36, { ovens: 1 }], ['27 in, single', 27, 24, 28, 36, { ovens: 1 }], ['30 in, single', 30, 24, 29, 36, { ovens: 1 }], ['27 in, double', 27, 24, 51, 18, { ovens: 2 }], ['30 in, double', 30, 24, 52, 18, { ovens: 2 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1 } = a; cab(a, { doors: 0 }); const n = v.ovens, hs = (Z1 - Z0) / n;
      for (let i = 0; i < n; i++) { const z0 = Z0 + i * hs + 20, z1 = Z0 + (i + 1) * hs - 20; a.box(X0 + 12, YF, z0, X1 - 12, YF + T, z1 - 120); window(a, X0 + 50, z0 + 60, X1 - 50, z1 - 220); hbar(a, X0 + 60, X1 - 60, z1 - 160, 40); a.box(X0 + 12, YF - 8, z1 - 110, X1 - 12, YF + 4, z1); knobs(a, 5, z1 - 55, X0 + 30, X1 - 30, 13); }
      a.line(X0, YF, X1, YF); a.log(`Added ${n === 2 ? 'two ovens' : 'the oven'} with window, handle and control strip (plan and 3D).`); } }),
  fam({ cat: CAT, title: 'Generic wall oven and microwave combination',
    desc: (v) => `Built-in tower of a windowed oven below a microwave with its own window, handle and a shared control strip; ${v.w} in wide.`,
    vs: [['27 in', 27, 24, 51, 18, {}], ['30 in', 30, 24, 52, 18, {}]],
    build: (a) => { const { X0, X1, YF, Z0, Z1 } = a; cab(a, { doors: 0 }); const mid = Z0 + (Z1 - Z0) * 0.5;
      a.box(X0 + 12, YF, Z0 + 20, X1 - 12, YF + T, mid - 150); window(a, X0 + 50, Z0 + 80, X1 - 50, mid - 260); hbar(a, X0 + 60, X1 - 60, mid - 190, 40);
      a.box(X0 + 12, YF - 8, mid - 140, X1 - 12, YF + 4, mid + 40); knobs(a, 5, mid - 50, X0 + 30, X1 - 30, 13);
      a.box(X0 + 12, YF, mid + 50, X1 - 12, YF + T, Z1 - 20); window(a, X0 + 40, mid + 90, X1 - 120, Z1 - 70); vbar(a, X1 - 70, mid + 90, Z1 - 70, 34); a.line(X0, YF, X1, YF);
      a.log('Added the lower oven and the upper microwave with windows, handles and the control strip (plan and 3D).'); } }),

  fam({ cat: CAT, title: 'Generic built-in dishwasher',
    desc: (v) => `Under-counter dishwasher with a ${v.panel ? 'panel-ready door and a hidden top control strip' : 'full-width ' + (v.bar ? 'bar handle' : 'recessed handle') + ' and a ' + (v.top ? 'top-edge' : 'front-panel') + ' row of buttons'}, a toe kick and ${v.w} in width.`,
    vs: [['18 in, front controls', 18, 24, 34, 0, { bar: false }], ['24 in, front controls', 24, 24, 34, 0, { bar: false }], ['24 in, top controls, bar handle', 24, 24, 34, 0, { bar: true, top: true }], ['24 in, panel ready', 24, 24, 34, 0, { panel: true }], ['24 in, bar handle and display', 24, 24, 34, 0, { bar: true }]],
    build: (a, v) => { const { X0, X1, YF, Z0, Z1 } = a; cab(a, { toe: 90, doors: 0 });
      slab(a, X0 + 8, Z0 + 100, X1 - 8, Z1 - (v.panel ? 8 : v.top ? 8 : 100));
      if (!v.panel && !v.top) { a.box(X0 + 8, YF - 8, Z1 - 96, X1 - 8, YF + 4, Z1 - 8); for (let i = 0; i < 5; i++) a.box(X0 + 70 + i * ((X1 - X0 - 140) / 4) - 10, YF - 13, Z1 - 62, X0 + 70 + i * ((X1 - X0 - 140) / 4) + 10, YF - 8, Z1 - 42); }
      if (v.top) { a.box(X0 + 8, YF - 6, Z1 - 40, X1 - 8, YF + 4, Z1 - 4); for (let i = 0; i < 4; i++) a.box(X0 + 60 + i * ((X1 - X0 - 120) / 3) - 8, YF - 10, Z1 - 30, X0 + 60 + i * ((X1 - X0 - 120) / 3) + 8, YF - 6, Z1 - 14); }
      if (v.bar) hbar(a, X0 + 60, X1 - 60, Z1 - (v.top ? 130 : 165), 38); else if (!v.panel) { a.box(X0 + 50, YF - 10, Z1 - 150, X1 - 50, YF, Z1 - 130); a.rect(X0 + 50, YF - 10, X1 - 50, YF, 'EQUIP-DETAIL'); }
      a.line(X0, YF, X1, YF); a.log('Added the door with handle and controls, the toe kick and the front joint (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic dishwasher drawer',
    desc: (v) => `Under-counter dishwasher with ${v.n === 2 ? 'two stacked drawers, each' : 'a single drawer'} with its own bar handle, and a short control strip above.`,
    vs: [['single drawer, 24 in', 24, 24, 34, 0, { n: 1 }], ['double drawer, 24 in', 24, 24, 34, 0, { n: 2 }]],
    build: (a, v) => { const { X0, X1, YF, Z0, Z1 } = a; cab(a, { toe: 90, doors: 0 }); a.box(X0 + 8, YF - 8, Z1 - 70, X1 - 8, YF + 4, Z1 - 8); knobs(a, 3, Z1 - 40, X0 + 40, X1 - 40, 10);
      const z0 = Z0 + 100, z1 = Z1 - 80, h = (z1 - z0) / v.n; for (let i = 0; i < v.n; i++) { const t = z1 - i * h; slab(a, X0 + 8, t - h + 4, X1 - 8, t - 4); hbar(a, X0 + 60, X1 - 60, t - 45, 36); a.line(X0 + 8, YF, X1 - 8, YF); }
      a.log('Added the drawer fronts with bar handles, the control strip and the toe kick (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic countertop dishwasher',
    desc: (v) => `Compact countertop dishwasher for ${v.places} place settings: a front door with a handle, a button row and four small feet.`,
    vs: [['6 place settings', 22, 18, 17, 36, { places: 6 }], ['8 place settings', 23, 19, 20, 36, { places: 8 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YF + T, Z0 + 20, X1, YB, Z1); slab(a, X0, Z0 + 20, X1, Z1 - 70); hbar(a, X0 + 50, X1 - 50, Z1 - 100, 30); a.box(X0, YF - 6, Z1 - 66, X1, YF + T, Z1); knobs(a, 3, Z1 - 33, X0 + 40, X1 - 40, 12);
      for (const [x, y] of [[X0 + 30, YF + 30], [X1 - 30, YF + 30], [X0 + 30, YB - 30], [X1 - 30, YB - 30]]) { a.cyl(x, y, Z0, Z0 + 20, 12, 8); a.circ(x, y, 12, 'EQUIP-HIDDEN'); } a.line(X0, YF, X1, YF); a.log('Added the door, handle, control row and four feet (plan and 3D).'); } }),

  fam({ cat: CAT, title: 'Generic top-mount refrigerator-freezer',
    desc: (v) => `${v.w} in refrigerator with a freezer door over a fresh-food door, vertical handles, door swing and a toe kick.`,
    vs: [['24 in', 24, 28, 61, 0, { kind: 'top' }], ['28 in', 28, 31, 65, 0, { kind: 'top' }], ['30 in', 30, 32, 67, 0, { kind: 'top' }], ['33 in', 33, 33, 69, 0, { kind: 'top' }]], build: fridge }),
  fam({ cat: CAT, title: 'Generic bottom-freezer refrigerator',
    desc: (v) => `${v.w} in refrigerator with ${v.french ? 'two French doors' : 'one fresh-food door'} over a pull-out freezer drawer, vertical handles, door swing and a toe kick.`,
    vs: [['30 in, single door', 30, 32, 67, 0, { kind: 'bottom' }], ['30 in, French doors', 30, 32, 68, 0, { kind: 'bottom', french: true }], ['33 in, French doors', 33, 33, 69, 0, { kind: 'bottom', french: true }], ['36 in, French doors', 36, 34, 70, 0, { kind: 'bottom', french: true }]], build: fridge }),
  fam({ cat: CAT, title: 'Generic side-by-side refrigerator-freezer',
    desc: (v) => `${v.w} in refrigerator with a narrow freezer door beside a wide fresh-food door${v.dispenser ? ' and a water dispenser recess' : ''}, vertical handles and swings.`,
    vs: [['33 in', 33, 33, 68, 0, { kind: 'side' }], ['36 in, with dispenser', 36, 34, 70, 0, { kind: 'side', dispenser: true }], ['42 in, with dispenser', 42, 35, 84, 0, { kind: 'side', dispenser: true }]], build: fridge }),
  fam({ cat: CAT, title: 'Generic column refrigerator',
    desc: (v) => `Tall built-in refrigerator column with one full-height door hinged ${v.hinge === 'R' ? 'right' : 'left'}, a vertical handle, trim lines and a toe kick.`,
    vs: [['24 in, left hinge', 24, 24, 84, 0, { kind: 'column', hinge: 'L' }], ['30 in, right hinge', 30, 25, 84, 0, { kind: 'column', hinge: 'R' }], ['36 in, left hinge', 36, 25, 84, 0, { kind: 'column', hinge: 'L' }]], build: fridge }),
  fam({ cat: CAT, title: 'Generic column freezer',
    desc: (v) => `Tall built-in freezer column with one full-height door hinged ${v.hinge === 'R' ? 'right' : 'left'}, a vertical handle, a display strip and a toe kick.`,
    vs: [['18 in, left hinge', 18, 24, 84, 0, { kind: 'column', hinge: 'L', bands: 2 }], ['24 in, right hinge', 24, 24, 84, 0, { kind: 'column', hinge: 'R', bands: 2 }], ['30 in, left hinge', 30, 25, 84, 0, { kind: 'column', hinge: 'L', bands: 2 }]], build: fridge }),

  fam({ cat: CAT, title: 'Generic undercounter refrigerator, solid door',
    desc: (v) => `Under-counter refrigerator ${v.w} in wide with ${v.doors === 2 ? 'two hinged doors' : 'one hinged door'}, vertical handles, a worktop edge and a toe kick.`,
    vs: [['15 in', 15, 24, 34, 0, { doors: 1 }], ['18 in', 18, 24, 34, 0, { doors: 1 }], ['24 in', 24, 24, 34, 0, { doors: 1 }], ['48 in, two doors', 48, 24, 34, 0, { doors: 2 }]], build: underFridge }),
  fam({ cat: CAT, title: 'Generic undercounter glass-door cooler',
    desc: (v) => `Under-counter cooler ${v.w} in wide with ${v.doors === 2 ? 'two glazed doors' : 'a glazed door'}, ${v.shelves} wire shelves, handles and a toe kick.`,
    vs: [['15 in, two shelves', 15, 24, 34, 0, { doors: 1, glass: true, shelves: 2 }], ['24 in, three shelves', 24, 24, 34, 0, { doors: 1, glass: true, shelves: 3 }], ['24 in, right hinge', 24, 24, 34, 0, { doors: 1, glass: true, shelves: 3, hinge: 'R' }], ['48 in, two doors', 48, 24, 34, 0, { doors: 2, glass: true, shelves: 3 }]], build: underFridge }),
  fam({ cat: CAT, title: 'Generic refrigerator drawers',
    desc: (v) => `Under-counter refrigerator with ${v.drawers} full-width drawer front${v.drawers > 1 ? 's' : ''}, bar pulls, a worktop edge and a toe kick.`,
    vs: [['15 in, one drawer', 15, 24, 34, 0, { drawers: 1 }], ['24 in, two drawers', 24, 24, 34, 0, { drawers: 2 }], ['30 in, three drawers', 30, 24, 34, 0, { drawers: 3 }]], build: underFridge }),

  fam({ cat: CAT, title: 'Generic wine cooler',
    desc: (v) => `Wine cooler ${v.w} in wide with a glazed door and ${v.racks} wooden-style bottle racks drawn behind it, a handle${v.dual ? ' and a divider between two temperature zones' : ''}.`,
    vs: [['15 in, single zone', 15, 24, 34, 0, { racks: 4, dual: false }], ['24 in, dual zone', 24, 24, 34, 0, { racks: 6, dual: true }], ['30 in, dual zone', 30, 24, 34, 0, { racks: 8, dual: true }], ['24 in, tall tower', 24, 25, 72, 0, { racks: 10, dual: true }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1 } = a; cab(a, { toe: 90, doors: 0 }); const z0 = Z0 + 100, z1 = Z1 - 24; a.frame(X0 + 10, z0, X1 - 10, z1, YF, YF + T, 34); a.rect(X0 + 44, YF + 4, X1 - 44, YF + 10, 'EQUIP-DETAIL');
      for (let i = 1; i <= v.racks; i++) { const z = z0 + ((z1 - z0) * i) / (v.racks + 1); a.box(X0 + 50, YF + 30, z, X1 - 50, YF + 330, z + 8); for (let k = 0; k < 4; k++) a.ycyl(YF + 40, YF + 320, X0 + 90 + k * ((X1 - X0 - 180) / 3), z + 40, 32, 10); }
      if (v.dual) a.box(X0 + 44, YF + 14, (z0 + z1) / 2 - 3, X1 - 44, YF + 340, (z0 + z1) / 2 + 3);
      vbar(a, X1 - 40, z0 + (z1 - z0) * 0.3, z1 - 80, 28); swingPlan(a, X0 + 10, X1 - X0 - 20, true); a.line(X0, YF, X1, YF); a.log('Added the glazed door with handle and swing, bottle racks and the toe kick (plan and 3D).'); } }),

  fam({ cat: CAT, title: 'Generic chest freezer',
    desc: (v) => `Chest freezer ${v.w} in long with a hinged lid, a lid handle, a storage basket inside and four feet; lid swing shown in plan.`,
    vs: [['28 in, 5 cubic ft class', 28, 22, 34, 0, {}], ['36 in, 7 cubic ft class', 36, 23, 34, 0, {}], ['48 in, 9 cubic ft class', 48, 24, 35, 0, {}], ['60 in, 15 cubic ft class', 60, 27, 35, 0, {}]],
    build: (a) => { const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); a.box(X0, YF, Z0 + 40, X0 + 40, YB, Z1 - 60); a.box(X1 - 40, YF, Z0 + 40, X1, YB, Z1 - 60); a.box(X0, YF, Z0 + 40, X1, YF + 40, Z1 - 60); a.box(X0, YB - 40, Z0 + 40, X1, YB, Z1 - 60); a.box(X0 + 40, YF + 40, Z0 + 40, X1 - 40, YB - 40, Z0 + 90);
      a.box(X0 - 4, YF - 4, Z1 - 60, X1 + 4, YB + 4, Z1 - 20); a.box(X0 + 100, YF - 14, Z1 - 50, X1 - 100, YF + 4, Z1 - 30);   // lid and lip handle
      a.box(X0 + 70, YF + 60, Z1 - 200, X0 + 70 + W * 0.3, YB - 60, Z1 - 190); a.rect(X0 + 70, YF + 60, X0 + 70 + W * 0.3, YB - 60, 'EQUIP-HIDDEN');
      for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 40], [X1 - 40, YB - 40]]) a.cyl(x, y, Z0, Z0 + 40, 14, 8);
      a.line(X0, YB, X1, YB - D * 0.3, 'EQUIP-SWING'); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL'); a.log('Added the cabinet walls, the lid with its handle, the basket and four feet (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic upright freezer',
    desc: (v) => `Upright freezer ${v.w} in wide with a full-height door, a vertical handle, ${v.drawers} drawer fronts below the door and a toe kick.`,
    vs: [['24 in, two drawers', 24, 26, 60, 0, { drawers: 2 }], ['28 in, three drawers', 28, 28, 66, 0, { drawers: 3 }], ['32 in, three drawers', 32, 30, 72, 0, { drawers: 3 }]],
    build: (a, v) => { const { X0, X1, YF, Z0, Z1 } = a; cab(a, { toe: 100, doors: 0 }); const b = Z0 + 100, s = b + v.drawers * 230; for (let i = 0; i < v.drawers; i++) { slab(a, X0 + 12, b + i * 230 + 4, X1 - 12, b + (i + 1) * 230 - 4); hbar(a, X0 + 50, X1 - 50, b + i * 230 + 180, 32); }
      slab(a, X0 + 12, s + 4, X1 - 12, Z1 - 12); vbar(a, X1 - 55, s + 150, s + 750, 34); swingPlan(a, X0 + 12, X1 - X0 - 24, true); a.line(X0, YF, X1, YF); a.log('Added the door with swing and handle, the lower drawers and the toe kick (plan and 3D).'); } }),

  fam({ cat: CAT, title: 'Generic undercounter ice maker',
    desc: (v) => `Under-counter ice maker ${v.w} in wide with a ${v.drain ? 'drop-down' : 'hinged'} door with handle, a scoop-shaped bin visible behind a clear panel, a front grille and a drain note in plan.`,
    vs: [['15 in', 15, 24, 34, 0, {}], ['18 in', 18, 24, 34, 0, {}], ['24 in', 24, 24, 34, 0, {}]],
    build: (a) => { const { X0, X1, YF, YB, Z0, Z1 } = a; cab(a, { toe: 100, doors: 0 }); a.box(X0 + 20, YF - 2, Z0 + 20, X1 - 20, YF + T, Z0 + 95); for (let z = Z0 + 30; z < Z0 + 90; z += 14) a.box(X0 + 40, YF - 6, z, X1 - 40, YF, z + 6);
      a.frame(X0 + 10, Z0 + 100, X1 - 10, Z1 - 24, YF, YF + T, 30); a.box(X0 + 40, YF + 4, Z0 + 130, X1 - 40, YF + 10, Z1 - 54); a.box(X0 + 50, YF + 20, Z0 + 140, X1 - 50, YB - 40, Z0 + 420); hbar(a, X0 + 50, X1 - 50, Z1 - 80, 30); a.line(X0 + 10, YF, X1 - 10, YF); a.circ(X0 + 60, YB - 60, 22, 'EQUIP-HIDDEN');
      a.log('Added the glazed door with handle, the ice bin, the front grille and a drain mark (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic countertop microwave oven',
    desc: (v) => `Countertop microwave ${v.w} in wide with a window door on the left, a handle, a button column and dial on the right, and four feet.`,
    vs: [['18 in, compact', 18, 14, 11, 36, {}], ['20 in, mid-size', 20, 16, 12, 36, {}], ['22 in, family size', 22, 18, 13, 36, {}], ['24 in, large with display', 24, 19, 14, 36, { disp: true }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YF, Z0 + 12, X1, YB, Z1); const dx = X0 + W * 0.74; a.box(X0 + 10, YF - 14, Z0 + 20, dx, YF, Z1 - 12); window(a, X0 + 50, Z0 + 55, dx - 40, Z1 - 55); a.box(dx - 40, YF - 30, Z0 + 40, dx - 28, YF, Z1 - 40);
      a.box(dx + 10, YF - 10, Z0 + 24, X1 - 10, YF, Z1 - 12); if (v.disp) a.box(dx + 20, YF - 12, Z1 - 70, X1 - 20, YF - 10, Z1 - 40); for (let i = 0; i < 5; i++) a.box(dx + 25, YF - 14, Z0 + 40 + i * ((Z1 - Z0 - 160) / 4), X1 - 25, YF - 10, Z0 + 55 + i * ((Z1 - Z0 - 160) / 4)); dial(a, (dx + X1) / 2, Z1 - 30, 14);
      for (const x of [X0 + 25, X1 - 25]) for (const y of [YF + 25, YB - 25]) a.cyl(x, y, Z0, Z0 + 12, 9, 8); a.line(X0, YF, dx, YF); a.log('Added the windowed door with its handle, the control column and four feet (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic over-the-range microwave',
    desc: (v) => `Microwave ${v.w} in wide mounted over a range, with a windowed door, a handle, a button panel and an exhaust grille on the underside.`,
    vs: [['30 in', 30, 16, 17, 66, {}], ['36 in', 36, 16, 17, 66, {}]],
    build: (a) => { const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YB - 300, Z0, X1, YB, Z1); a.box(X0, YF + 60, Z0, X1, YB - 300, Z1); const dx = X0 + W * 0.74;
      a.box(X0 + 8, YF - 8, Z0 + 20, dx, YF + 60, Z1 - 20); window(a, X0 + 50, Z0 + 55, dx - 40, Z1 - 55); a.box(dx - 40, YF - 30, Z0 + 40, dx - 28, YF - 8, Z1 - 40); a.box(dx + 10, YF - 4, Z0 + 20, X1 - 8, YF + 60, Z1 - 20); for (let i = 0; i < 4; i++) a.box(dx + 25, YF - 8, Z0 + 40 + i * 55, X1 - 25, YF - 4, Z0 + 60 + i * 55);
      for (let x = X0 + 60; x < X1 - 60; x += 28) a.box(x, YF + 100, Z0 - 3, x + 14, YB - 340, Z0); a.rect(X0 + 60, YF + 100, X1 - 60, YB - 340, 'EQUIP-HIDDEN'); a.log('Added the windowed door with handle, the button panel and the underside grille (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic built-in microwave drawer',
    desc: (v) => `Built-in microwave drawer ${v.w} in wide with a push-open front, a bar handle and a touch-control strip, set in a cabinet opening.`,
    vs: [['24 in', 24, 23, 15, 30, {}], ['30 in', 30, 23, 15, 30, {}]],
    build: (a) => { const { X0, X1, YF, Z0, Z1 } = a; cab(a, { doors: 0 }); a.box(X0 + 12, YF - 6, Z0 + 20, X1 - 12, YF + T, Z1 - 70); hbar(a, X0 + 60, X1 - 60, Z1 - 110, 36); a.box(X0 + 12, YF - 6, Z1 - 66, X1 - 12, YF + 4, Z1 - 12); for (let i = 0; i < 5; i++) a.box(X0 + 50 + i * ((X1 - X0 - 120) / 4), YF - 10, Z1 - 50, X0 + 70 + i * ((X1 - X0 - 120) / 4), YF - 6, Z1 - 30); a.line(X0, YF, X1, YF);
      a.log('Added the drawer front, the handle and the touch strip (plan and 3D).'); } }),

  fam({ cat: CAT, title: 'Generic cabinet-mounted range hood',
    desc: (v) => `Under-cabinet range hood ${v.w} in wide with a sloped front, a mesh filter panel on the underside, two lights, fan buttons and a round duct on top.`,
    vs: [['24 in', 24, 18, 7, 66, {}], ['30 in', 30, 18, 7, 66, {}], ['36 in', 36, 18, 7, 66, {}], ['42 in', 42, 20, 8, 66, {}]],
    build: (a) => { const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 300, Z0 + 30, X1, YB, Z1); a.box(X0 + 6, YF + 60, Z0, X1 - 6, YB - 200, Z0 + 40); a.box(X0 + 3, YF + 30, Z0 + 20, X1 - 3, YB - 250, Z0 + 55);
      for (let x = X0 + 40; x < X1 - 40; x += 24) a.box(x, YF + 90, Z0 - 3, x + 12, YB - 230, Z0); hoodLights(a, 2, Z0, X0 + 90, X1 - 90, (YF + YB) / 2); for (let i = 0; i < 3; i++) a.cyl(cx - 60 + i * 60, YF + 10, Z0 + 10, Z0 + 22, 10, 8);
      a.cyl(cx, YB - 100, Z1, Z1 + 1, 80, 20); a.circ(cx, YB - 100, 80, 'EQUIP-HIDDEN'); a.rect(X0 + 40, YF + 90, X1 - 40, YB - 230, 'EQUIP-DETAIL'); a.log('Added the hood body, the filter panel, two lights, fan buttons and the duct position (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic wall-mount canopy range hood',
    desc: (v) => `Wall-mounted canopy hood ${v.w} in wide with a stepped hood, a rear chimney, baffle filter slots on the underside, two lights and fan buttons.`,
    vs: [['30 in', 30, 20, 30, 66, {}], ['36 in', 36, 20, 30, 66, {}], ['42 in', 42, 22, 30, 66, {}], ['48 in', 48, 24, 32, 66, {}]], build: (a, v) => canopy(a, v) }),
  fam({ cat: CAT, title: 'Generic island canopy range hood',
    desc: (v) => `Island canopy hood ${v.w} in wide with a stepped hood, a centred chimney, baffle filter slots on the underside, two lights and fan buttons.`,
    vs: [['36 in', 36, 27, 30, 66, { island: true }], ['42 in', 42, 30, 32, 66, { island: true }], ['48 in', 48, 30, 32, 66, { island: true }]], build: (a, v) => canopy(a, v) }),
  fam({ cat: CAT, title: 'Generic range hood liner insert',
    desc: (v) => `Range hood liner insert ${v.w} in wide for a custom cabinet hood: a shallow metal pan with a mesh filter, a centre blower grille, two lights and a control strip.`,
    vs: [['30 in', 30, 20, 12, 66, {}], ['36 in', 36, 20, 12, 66, {}], ['42 in', 42, 20, 12, 66, {}]],
    build: (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0 + 60, X1, YF + 20, Z1); a.box(X0, YB - 20, Z0 + 60, X1, YB, Z1); a.box(X0, YF, Z0 + 60, X0 + 20, YB, Z1); a.box(X1 - 20, YF, Z0 + 60, X1, YB, Z1); a.box(X0, YF, Z0, X1, YB, Z0 + 60);
      for (let x = X0 + 50; x < X1 - 50; x += 26) a.box(x, YF + 60, Z0 - 3, x + 14, YB - 60, Z0); hoodLights(a, 2, Z0, X0 + 100, X1 - 100, cy); a.cyl(cx, cy, Z0 + 60, Z1, 85, 20); a.circ(cx, cy, 85, 'EQUIP-DETAIL'); for (let i = 0; i < 3; i++) dialAt(a, cx - 60 + i * 60, YF + 10, Z0 + 30, 10);
      a.rect(X0 + 50, YF + 60, X1 - 50, YB - 60, 'EQUIP-DETAIL'); a.log('Added the liner pan, the mesh filter, the blower grille, two lights and the control strip (plan and 3D).'); } }),

  fam({ cat: CAT, title: 'Generic front-loading washer',
    desc: 'Front-load washer with a round glass-ring door, a detergent drawer, a control strip with four dials and a toe kick.',
    vs: [['24 in', 24, 24, 33, 0, { kind: 'wash' }], ['27 in', 27, 31, 39, 0, { kind: 'wash' }]], build: washerFront }),
  fam({ cat: CAT, title: 'Generic front-load dryer',
    desc: 'Front-load dryer with a round glass-ring door, a control strip with four dials and a toe kick.',
    vs: [['24 in', 24, 26, 33, 0, { kind: 'dry' }], ['27 in', 27, 31, 39, 0, { kind: 'dry' }]], build: washerFront }),
  fam({ cat: CAT, title: 'Generic stacked washer and dryer',
    desc: 'Washer and dryer stacked in one column: two round glass-ring doors, two control strips with four dials each and a toe kick.',
    vs: [['24 in', 24, 26, 66, 0, { stack: true }], ['27 in', 27, 31, 77, 0, { stack: true }]], build: washerFront }),
  fam({ cat: CAT, title: 'Generic top-loading washer',
    desc: (v) => `Top-load washer ${v.w} in wide with a hinged lid showing a glass window, a back console with five dials and a lid-latch handle.`,
    vs: [['24 in', 24, 26, 41, 0, {}], ['27 in', 27, 28, 43, 0, {}]],
    build: (a) => { const { X0, X1, YF, YB, Z0, Z1, cx } = a; cab(a, { toe: 30, doors: 0 }); a.box(X0 + 12, YB - 220, Z1 - 200, X1 - 12, YB, Z1); for (let i = 0; i < 5; i++) dialAt(a, X0 + 70 + i * ((X1 - X0 - 140) / 4), YB - 220, Z1 - 100, 16);
      a.box(X0 + 8, YF - 4, Z1 - 60, X1 - 8, YB - 220, Z1 - 20); a.box(cx - 150, YF + 120, Z1 - 20, cx + 150, YB - 260, Z1 - 12); a.ell(cx, (YF + YB) / 2 - 50, Z1 - 18, 220, 220, 4, 20, 4); a.circ(cx, (YF + YB) / 2 - 50, 220, 'EQUIP-DETAIL'); a.box(cx - 40, YF - 14, Z1 - 50, cx + 40, YF + 6, Z1 - 30);
      a.line(X0, YF, X1, YF); a.log('Added the hinged lid with window and latch handle, the back console with dials and the toe kick (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic built-in warming drawer',
    desc: (v) => `Built-in warming drawer ${v.w} in wide with one drawer front, a bar handle and a small dial${v.w > 27 ? ' pair' : ''} on the face.`,
    vs: [['24 in', 24, 23, 10, 30, {}], ['30 in', 30, 23, 10, 30, {}]],
    build: (a) => { const { X0, X1, YF, Z0, Z1 } = a; cab(a, { doors: 0 }); a.box(X0 + 10, YF - 6, Z0 + 15, X1 - 10, YF + T, Z1 - 15); hbar(a, X0 + 60, X1 - 60, Z1 - 60, 34); dial(a, X1 - 60, Z0 + 55, 12); dial(a, X1 - 110, Z0 + 55, 12); a.line(X0, YF, X1, YF); a.log('Added the drawer front, the handle and two dials (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic undercounter trash compactor',
    desc: (v) => `Under-counter trash compactor ${v.w} in wide with a pull-out drawer front, a bar handle, a key slot on the face and a toe kick.`,
    vs: [['15 in', 15, 24, 34, 0, {}], ['18 in', 18, 24, 34, 0, {}]],
    build: (a) => { const { X0, X1, YF, Z0, Z1 } = a; cab(a, { toe: 90, doors: 0, topT: 20 }); a.box(X0 + 8, YF - 6, Z0 + 100, X1 - 8, YF + T, Z1 - 24); hbar(a, X0 + 50, X1 - 50, Z1 - 100, 34); a.ycyl(YF - 12, YF - 6, a.cx, Z1 - 170, 14, 10); a.circ(a.cx, YF - 9, 14, 'EQUIP-DETAIL'); a.line(X0, YF, X1, YF); a.log('Added the drawer front, the handle, a key cylinder and the toe kick (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic freestanding water dispenser',
    desc: (v) => `Freestanding ${v.load === 'top' ? 'top-load' : 'bottom-load'} water cooler with ${v.load === 'top' ? 'an inverted bottle on top' : 'a hinged lower door'}, hot and cold taps, a drip tray and four small feet.`,
    vs: [['top load', 13, 13, 40, 0, { load: 'top' }], ['bottom load', 12, 14, 40, 0, { load: 'bottom' }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); const bz = v.load === 'top' ? Z0 + 1010 * 0.0 : 0; void bz;
      const top = v.load === 'top' ? Z0 + 790 : Z1; a.box(X0, YF, Z0 + 30, X1, YB, top);
      if (v.load === 'top') { a.cone(cx, cy, top, top + 40, 120, 80, 16); a.cyl(cx, cy, top + 40, Z1 - 60, 130, 20); a.ell(cx, cy, Z1 - 60, 130, 130, 60, 20, 6); } else { a.box(X0 + 10, YF - 6, Z0 + 50, X1 - 10, YF + 4, Z0 + 420); a.box(X0 + 40, YF - 12, Z0 + 340, X1 - 40, YF - 6, Z0 + 360); }
      const tz = v.load === 'top' ? Z0 + 600 : Z0 + 720; a.box(X0 + 20, YF - 4, tz - 20, X1 - 20, YF + 6, tz + 140); a.cyl(cx - 60, YF - 22, tz + 50, tz + 90, 12, 8); a.cyl(cx + 60, YF - 22, tz + 50, tz + 90, 12, 8); a.box(X0 + 20, YF - 40, tz - 70, X1 - 20, YF - 4, tz - 56); a.rect(X0 + 20, YF - 40, X1 - 20, YF, 'EQUIP-DETAIL');
      for (const [x, y] of [[X0 + 20, YF + 25], [X1 - 20, YF + 25], [X0 + 20, YB - 25], [X1 - 20, YB - 25]]) a.cyl(x, y, Z0, Z0 + 30, 9, 8); a.log('Added the cabinet, the bottle or lower door, two taps, the drip tray and four feet (plan and 3D).'); } }),

  // ---- countertop appliances --------------------------------------------------------------------------------------------------
  fam({ cat: CAT, title: 'Generic toaster',
    desc: (v) => `Pop-up toaster with ${v.slots} slots, a side lever, a browning dial and a crumb tray; ${v.long ? 'long-slot body' : 'standard body'}.`,
    vs: [['two slice', 11, 6, 8, 36, { slots: 2, long: false }], ['four slice', 15, 11, 8, 36, { slots: 4, long: false }], ['two long slots', 14, 7, 8, 36, { slots: 2, long: true }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0 + 8, X1, YB, Z1 - 20); a.box(X0 + 6, YF + 6, Z1 - 20, X1 - 6, YB - 6, Z1); const n = v.slots, cols = n === 4 ? 2 : 1, rows = n / cols;
      for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) { const x0 = X0 + 20 + ((X1 - X0 - 40) * r) / rows, x1 = X0 + 20 + ((X1 - X0 - 40) * (r + 1)) / rows - 14, y0 = YF + 18 + c * ((YB - YF - 36) / cols), y1 = y0 + (YB - YF - 36) / cols - 12; a.box(x0, y0, Z1 - 3, x1, y1, Z1 + 1); a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); }
      a.box(X1 - 4, cy - 12, Z0 + 40, X1 + 14, cy + 12, Z0 + 60); a.ycyl(YF - 14, YF, X0 + 40, Z0 + 70, 10, 8); a.box(X0 + 10, YF - 2, Z0, X1 - 10, YF + 10, Z0 + 8); for (const x of [X0 + 12, X1 - 12]) for (const y of [YF + 12, YB - 12]) a.cyl(x, y, Z0, Z0 + 8, 7, 6);
      a.log(`Added the body, ${n} slots, the lever, the dial and the crumb tray (plan and 3D).`); } }),
  fam({ cat: CAT, title: 'Generic toaster oven',
    desc: (v) => `Countertop toaster oven with a glass door, a pull handle, a ${v.knobs}-dial control side and a wire rack and tray drawn inside; fits ${v.slices} slices.`,
    vs: [['four slice', 15, 11, 9, 36, { knobs: 2, slices: 4 }], ['six slice', 17, 13, 10, 36, { knobs: 3, slices: 6 }], ['nine slice convection', 20, 16, 12, 36, { knobs: 3, slices: 9 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YF + 20, Z0 + 12, X1, YB, Z1); const dx = X0 + W * 0.76; a.frame(X0 + 10, Z0 + 20, dx, Z1 - 20, YF - 6, YF + 20, 30); a.box(X0 + 40, YF + 4, Z0 + 50, dx - 30, YF + 10, Z1 - 50); a.xcyl(X0 + 40, dx - 30, YF - 30, Z1 - 55, 8, 8);
      a.box(X0 + 50, YF + 40, Z0 + 90, dx - 40, YB - 30, Z0 + 94); a.box(X0 + 50, YF + 40, Z0 + 50, dx - 40, YB - 30, Z0 + 54); for (let i = 0; i < v.knobs; i++) dialAt(a, (dx + X1) / 2 + 10, YF + 20, Z0 + 60 + i * ((Z1 - Z0 - 120) / v.knobs) + 10, 16);
      for (const x of [X0 + 20, X1 - 20]) for (const y of [YF + 35, YB - 25]) a.cyl(x, y, Z0, Z0 + 12, 9, 8); a.line(X0, YF + 20, X1, YF + 20, 'EQUIP-DETAIL'); a.log('Added the glass door with handle, the rack and tray, the dials and four feet (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic countertop blender',
    desc: (v) => `Countertop blender with a ${v.jar} litre tapered jar, a lid with cap, a pour spout and handle, a base with ${v.dials} dials and four feet.`,
    vs: [['personal, 0.6 litre jar', 5, 5, 14, 36, { jar: 0.6, dials: 1 }], ['standard, 1.5 litre jar', 8, 8, 17, 36, { jar: 1.5, dials: 2 }], ['high capacity, 2 litre jar', 9, 9, 20, 36, { jar: 2, dials: 2 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline(); const bz = Z0 + (Z1 - Z0) * 0.3; a.cone(cx, cy, Z0 + 10, bz, W * 0.5, W * 0.42, 20); for (let i = 0; i < v.dials; i++) dialAt(a, cx - (v.dials - 1) * 45 + i * 90, YF + 20, bz - 70, 14);
      a.cone(cx, cy, bz, Z1 - 40, W * 0.3, W * 0.4, 22); a.cone(cx, cy, Z1 - 40, Z1 - 16, W * 0.41, W * 0.41, 22); a.cyl(cx, cy, Z1 - 16, Z1, W * 0.12, 12); chandle(a, cx + W * 0.33, cy, bz + 90, Z1 - 90, X1 - (cx + W * 0.33), 8); a.circ(cx, cy, W * 0.5); a.circ(cx, cy, W * 0.3, 'EQUIP-DETAIL');
      a.log('Added the motor base with dials, the tapered jar, the lid with cap and the handle (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic stand mixer',
    desc: (v) => `Stand mixer for ${v.qt} quart bowls: a base with a column, a tilt-back head with a beater, a bowl on a pedestal and a speed lever.`,
    vs: [['4.5 quart bowl', 14, 9, 14, 36, { qt: 4.5 }], ['5 quart bowl', 14, 9, 15, 36, { qt: 5 }], ['7 quart bowl', 16, 11, 17, 36, { qt: 7 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 25); a.box(X1 - W * 0.22, YB - 130, Z0 + 25, X1 - 20, YB - 10, Z1 - 90); a.box(X0 + W * 0.3, YB - 140, Z1 - 160, X1 - 10, YB - 5, Z1 - 70); a.cyl(X0 + W * 0.3 + 10, cy, Z1 - 160, Z1 - 70, 70, 14);
      const bx = X0 + W * 0.36, by = (YF + YB) / 2 - 20; a.cyl(bx, by, Z0 + 25, Z0 + 60, W * 0.1, 14); a.cone(bx, by, Z0 + 60, Z1 - 200, W * 0.15, W * 0.19, 20); a.cone(bx, by, Z1 - 200, Z1 - 185, W * 0.2, W * 0.2, 20); a.cyl(bx, by, Z1 - 160, Z1 - 150, 8, 8);
      a.tube([[bx, by, Z1 - 150], [bx, by, Z1 - 330]], [18, 14], 10); a.ycyl(YF - 6, YF + 8, X1 - 60, Z0 + 150, 6, 6); a.box(X1 - 8, cy - 8, Z0 + 150, X1 + 12, cy + 8, Z0 + 175); a.circ(bx, by, W * 0.2); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
      a.log('Added the base, the column, the head with a beater, the bowl on its pedestal and the lever (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic juicer',
    desc: (v) => `${v.kind === 'centrifugal' ? 'Centrifugal juicer with a wide feed chute, a plunger, a pulp bin and a juice jug under the spout' : 'Cold-press juicer with a narrow tower, a hopper, a screw cap and a juice cup under the spout'}.`,
    vs: [['centrifugal', 14, 9, 17, 36, { kind: 'centrifugal' }], ['cold press', 9, 8, 18, 36, { kind: 'cold' }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline(); if (v.kind === 'centrifugal') { a.box(X0 + 20, YF + 10, Z0, X1 - 20, YB - 10, Z0 + 200); a.cone(cx - 30, cy, Z0 + 200, Z1 - 60, 130, 120, 20); a.cyl(cx - 30, cy - 70, Z1 - 60, Z1 - 5, 45, 14); a.cyl(cx - 30, cy - 70, Z1 - 5, Z1, 30, 10); a.box(X1 - 160, cy - 60, Z0 + 20, X1 - 20, cy + 60, Z0 + 130); a.cyl(X0 + 90, YF + 70, Z0, Z0 + 150, 55, 14); dialAt(a, cx + 100, YF + 10, Z0 + 100, 14); a.circ(cx - 30, cy, 130, 'EQUIP-DETAIL'); }
      else { a.box(X0 + 10, YF + 10, Z0, X1 - 10, YB - 10, Z0 + 150); a.cyl(cx, cy, Z0 + 150, Z1 - 120, W * 0.28, 18); a.cone(cx, cy, Z1 - 120, Z1 - 40, W * 0.3, W * 0.4, 18); a.cyl(cx, cy, Z1 - 40, Z1, W * 0.33, 18); a.cyl(cx, YF + 40, Z0, Z0 + 90, 40, 12); dialAt(a, cx, YF + 10, Z0 + 100, 12); a.circ(cx, cy, W * 0.4, 'EQUIP-DETAIL'); }
      a.log('Added the base, the juicing housing, the spout with its jug or cup and the dial (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic rice cooker',
    desc: (v) => `Rice cooker for ${v.cups} cups: a round body, a domed lid with a steam vent, a carry handle, a front latch button and a control panel.`,
    vs: [['3 cup', 9, 9, 9, 36, { cups: 3 }], ['5 cup', 11, 11, 10, 36, { cups: 5 }], ['10 cup', 14, 14, 11, 36, { cups: 10 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline('EQUIP-HIDDEN'); const r = W * 0.45; a.cone(cx, cy, Z0 + 10, Z1 - 80, r, r * 0.95, 26); a.cyl(cx, cy, Z0, Z0 + 10, r * 0.8, 20); a.cone(cx, cy, Z1 - 80, Z1 - 20, r * 0.95, r * 0.7, 26); a.cyl(cx, cy, Z1 - 20, Z1, 14, 8);
      a.box(cx - 60, cy - 8, Z1 - 20, cx + 60, cy + 8, Z1 + 0.5); a.box(cx - 50, YF - 6, Z1 - 130, cx + 50, YF + 10, Z1 - 60); a.box(cx - 50, YF - 10, Z0 + 20, cx + 50, YF + 2, Z0 + 70); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.7, 'EQUIP-DETAIL'); a.circ(cx, cy, 14, 'EQUIP-DETAIL'); a.box(X0, cy - 15, Z0 + 60, X0 + 18, cy + 15, Z0 + 90); a.box(X1 - 18, cy - 15, Z0 + 60, X1, cy + 15, Z0 + 90);
      a.log('Added the round body, the domed lid with vent, the side handles, the latch and the control panel (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic countertop air fryer',
    desc: (v) => `Countertop air fryer with ${v.baskets === 2 ? 'two pull-out baskets side by side' : 'one pull-out basket'}, basket handles, a top control panel and a rear exhaust grille; ${v.qt} quart.`,
    vs: [['2 quart, one basket', 9, 11, 11, 36, { baskets: 1, qt: 2 }], ['4 quart, one basket', 11, 13, 12, 36, { baskets: 1, qt: 4 }], ['6 quart, one basket', 13, 14, 13, 36, { baskets: 1, qt: 6 }], ['8 quart, two baskets', 16, 14, 13, 36, { baskets: 2, qt: 8 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YF + 30, Z0 + 10, X1, YB, Z1); const n = v.baskets, bw = (W - 40 - (n - 1) * 20) / n;
      for (let i = 0; i < n; i++) { const x0 = X0 + 20 + i * (bw + 20); a.box(x0, YF, Z0 + 20, x0 + bw, YF + 50, Z1 - 100); a.box(x0 + bw * 0.25, YF - 22, Z1 - 190, x0 + bw * 0.75, YF, Z1 - 160); a.rect(x0, YF, x0 + bw, YF + 50, 'EQUIP-DETAIL'); }
      a.box(X0 + 10, YF + 6, Z1 - 90, X1 - 10, YF + 40, Z1); for (let i = 0; i < 4; i++) a.cyl(X0 + 40 + i * ((W - 80) / 3), YF + 20, Z1, Z1 + 0.5, 8, 6); for (let x = X0 + 40; x < X1 - 40; x += 24) a.box(x, YB - 4, Z0 + 60, x + 12, YB + 0.01, Z1 - 60);
      for (const x of [X0 + 25, X1 - 25]) for (const y of [YF + 40, YB - 25]) a.cyl(x, y, Z0, Z0 + 10, 9, 8); a.log('Added the body, the pull-out baskets with handles, the top panel and the rear grille (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic countertop deep fryer',
    desc: (v) => `Countertop deep fryer with ${v.baskets === 2 ? 'two oil wells and two' : 'an oil well and a'} lift-out basket${v.baskets === 2 ? 's' : ''} on handles, a hinged lid, a temperature dial and a cool-touch side handle.`,
    vs: [['single well', 11, 15, 10, 36, { baskets: 1 }], ['double well', 20, 15, 10, 36, { baskets: 2 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); a.box(X0, YF + 20, Z0 + 20, X1, YB, Z1 - 60); const n = v.baskets, ww = (W - 60 - (n - 1) * 30) / n;
      for (let i = 0; i < n; i++) { const x0 = X0 + 30 + i * (ww + 30); a.box(x0, YF + 70, Z1 - 60, x0 + ww, YB - 30, Z1 - 20); a.box(x0 + 8, YF + 78, Z1 - 20, x0 + ww - 8, YB - 38, Z1 - 16); a.box(x0 + ww * 0.3, YF - 50, Z1 - 40, x0 + ww * 0.7, YF + 100, Z1 - 20); a.rect(x0, YF + 70, x0 + ww, YB - 30, 'EQUIP-DETAIL'); }
      a.box(X0 + 10, YF + 4, Z0 + 40, X1 - 10, YF + 20, Z1 - 70); for (let i = 0; i < n; i++) dialAt(a, X0 + 50 + i * ((W - 100)), YF + 4, Z0 + 90, 14); a.box(X1 - 4, cy - 20, Z0 + 60, X1 + 10, cy + 20, Z0 + 90);
      for (const x of [X0 + 20, X1 - 20]) for (const y of [YF + 40, YB - 25]) a.cyl(x, y, Z0, Z0 + 20, 10, 8); a.log('Added the oil well bodies, the lift-out baskets with handles, the dials and four feet (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic electric kettle',
    desc: (v) => `Electric kettle holding ${v.l} litres: a cylindrical jug, a pouring spout, a handle, a hinged lid and a base plate with a power cord stub.`,
    vs: [['1 litre', 8, 6, 9, 36, { l: 1 }], ['1.7 litre', 9, 7, 10, 36, { l: 1.7 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); const r = (YB - YF) * 0.42; const bx = cx - 20; a.cyl(bx, cy, Z0, Z0 + 20, r * 1.05, 24); a.cone(bx, cy, Z0 + 20, Z1 - 30, r, r * 0.9, 24); a.cone(bx, cy, Z1 - 30, Z1 - 10, r * 0.9, r * 0.75, 24); a.cyl(bx, cy, Z1 - 10, Z1, 20, 10);
      a.tube([[bx - r * 0.7, cy, Z1 - 110], [bx - r * 1.2, cy, Z1 - 60]], [26, 8], 8); chandle(a, bx + r * 0.85, cy, Z0 + 90, Z1 - 70, X1 - (bx + r * 0.85) - 6, 9); a.circ(bx, cy, r); a.circ(bx, cy, r * 1.05, 'EQUIP-DETAIL'); a.line(X1 - 20, cy, bx + r, cy, 'EQUIP-DETAIL'); a.box(X0 + 5, cy - 5, Z0 + 5, X0 + 40, cy + 5, Z0 + 12);
      a.log('Added the base plate, the jug, the spout, the handle, the lid and a cord stub (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic drip coffee maker',
    desc: (v) => `Drip coffee maker for ${v.cups} cups: a back column with a water tank and a brew head, ${v.thermal ? 'a steel thermal carafe' : 'a glass carafe on a warming plate'} and a front button row.`,
    vs: [['10 cup, glass carafe', 9, 12, 14, 36, { cups: 10 }], ['12 cup, glass carafe', 10, 12, 15, 36, { cups: 12 }], ['12 cup, thermal carafe', 10, 12, 15, 36, { cups: 12, thermal: true }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 30); a.box(X0 + 10, YB - 120, Z0 + 30, X1 - 10, YB - 10, Z1); a.box(X0 + 5, YF + 60, Z1 - 170, X1 - 5, YB - 10, Z1 - 100); a.cyl(cx, cx * 0 + (YF + YB) / 2 + 20, Z1 - 100, Z1 - 85, 28, 10);
      a.cyl(cx, (YF + YB) / 2 + 20, Z0 + 30, Z0 + 40, W * 0.38, 20); a.cone(cx, (YF + YB) / 2 + 20, Z0 + 40, Z1 - 190, W * (v.thermal ? 0.32 : 0.34), W * (v.thermal ? 0.32 : 0.3), 20); a.cone(cx, (YF + YB) / 2 + 20, Z1 - 190, Z1 - 175, W * 0.3, W * 0.3, 20); chandle(a, cx + W * 0.33, (YF + YB) / 2 + 20, Z0 + 70, Z1 - 230, 24, 8);
      for (let i = 0; i < 3; i++) a.cyl(X0 + 30 + i * 28, YF + 12, Z0 + 14, Z0 + 20, 6, 6); a.circ(cx, (YF + YB) / 2 + 20, W * 0.34); a.rect(X0 + 10, YB - 120, X1 - 10, YB - 10, 'EQUIP-DETAIL'); a.log('Added the base, the water column and brew head, the carafe with handle and the buttons (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic countertop espresso machine',
    desc: (v) => `Espresso machine with ${v.groups === 2 ? 'two' : 'one'} group head${v.groups === 2 ? 's' : ''} and portafilter${v.groups === 2 ? 's' : ''}, a steam wand, a water tank at the back, a cup tray with drip grid and a top cup rail.`,
    vs: [['one group', 13, 14, 15, 36, { groups: 1 }], ['two group', 20, 17, 17, 36, { groups: 2 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); a.box(X0, YB - 120, Z0, X1, YB, Z1 - 10); a.box(X0, YF + 120, Z0 + 120, X1, YB - 120, Z1); a.box(X0 + 10, YF, Z0, X1 - 10, YF + 130, Z0 + 20); for (let x = X0 + 30; x < X1 - 30; x += 24) a.box(x, YF + 15, Z0 + 20, x + 12, YF + 115, Z0 + 24);
      a.box(X0 + 10, YB - 130, Z1 - 4, X1 - 10, YB - 10, Z1); for (let i = 0; i < v.groups; i++) { const x = X0 + (W * (i + 0.5)) / v.groups - (v.groups === 2 ? 0 : 0); a.cyl(x, YF + 150, Z0 + 140, Z0 + 180, 40, 14); a.ycyl(YF + 20, YF + 150, x, Z0 + 190, 20, 10); a.tube([[x, YF + 20, Z0 + 190], [x + 50, YF - 25, Z0 + 190]], [14, 14], 8); a.circ(x, YF + 150, 40, 'EQUIP-DETAIL'); }
      a.tube([[X1 - 30, YF + 160, Z0 + 160], [X1 - 30, YF + 40, Z0 + 100], [X1 - 60, YF + 20, Z0 + 40]], [7, 7, 5], 8); for (let i = 0; i < 3; i++) dialAt(a, cx - 60 + i * 60, YF + 120, Z1 - 60, 12); a.log('Added the body and water tank, group heads with portafilters, the steam wand, the drip tray and cup rail (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic portable induction burner',
    desc: (v) => `Portable induction burner with ${v.n === 2 ? 'two ring zones' : 'one ring zone'}, a glass top, a control strip with ${v.n === 2 ? 'two dials' : 'a dial and buttons'} and side vents.`,
    vs: [['single', 14, 11, 3, 36, { n: 1 }], ['double', 28, 15, 3, 36, { n: 2 }]],
    build: (a, v) => { const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YF, Z0 + 10, X1, YB, Z1 - 4); a.box(X0 + 8, YF + 8, Z1 - 4, X1 - 8, YB - 8, Z1); for (let i = 0; i < v.n; i++) { const x = X0 + (W * (i + 0.5)) / v.n, r = Math.min((YB - YF) * 0.3, W / v.n * 0.35); a.cyl(x, YF + (YB - YF) * 0.58, Z1, Z1 + 1, r, 20); a.circ(x, YF + (YB - YF) * 0.58, r, 'EQUIP-DETAIL'); a.circ(x, YF + (YB - YF) * 0.58, r * 0.6, 'EQUIP-DETAIL'); dialAt(a, x, YF, Z0 + 28, 8); }
      for (let x = X0 + 30; x < X1 - 30; x += 18) a.box(x, YB - 3, Z0 + 14, x + 8, YB, Z1 - 8); for (const x of [X0 + 12, X1 - 12]) for (const y of [YF + 12, YB - 12]) a.cyl(x, y, Z0, Z0 + 10, 6, 6); a.log('Added the body, the glass top, the zone rings, the dials, the vents and four feet (plan and 3D).'); } }),
  fam({ cat: CAT, title: 'Generic slow cooker',
    desc: (v) => `Oval slow cooker for ${v.qt} quarts: a base with two dials, a ceramic-style pot with side handles and a vented lid with a knob.`,
    vs: [['4 quart', 14, 10, 10, 36, { qt: 4 }], ['6 quart', 16, 11, 11, 36, { qt: 6 }], ['8 quart', 18, 13, 12, 36, { qt: 8 }]],
    build: (a) => { const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline(); const H = Z1 - Z0, rx = W * 0.46, ry = D * 0.46; oval(a, cx, cy, rx * 0.92, ry * 0.92, rx * 0.98, ry * 0.98, Z0 + 8, Z0 + H * 0.4, 2); oval(a, cx, cy, rx * 1.0, ry * 1.0, rx * 1.0, ry * 1.0, Z0 + H * 0.4, Z0 + H * 0.48, 1); oval(a, cx, cy, rx * 0.95, ry * 0.95, rx * 0.97, ry * 0.97, Z0 + H * 0.48, Z0 + H * 0.74, 2); oval(a, cx, cy, rx * 0.97, ry * 0.97, rx * 0.5, ry * 0.5, Z0 + H * 0.74, Z1 - 40, 4); a.cyl(cx, cy, Z1 - 40, Z1, 14, 10);
      a.box(X0 - 2, cy - 30, Z0 + H * 0.5, X0 + 24, cy + 30, Z0 + H * 0.5 + 30); a.box(X1 - 24, cy - 30, Z0 + H * 0.5, X1 + 2, cy + 30, Z0 + H * 0.5 + 30);
      dialAt(a, cx - 70, cy - ry * 0.9, Z0 + H * 0.2, 12); dialAt(a, cx + 70, cy - ry * 0.9, Z0 + H * 0.2, 12); a.ellp(cx, cy, W * 0.45, D * 0.45); a.ellp(cx, cy, W * 0.36, D * 0.36, 'EQUIP-DETAIL'); a.log('Added the oval base with dials, the pot with handles and the vented lid with a knob (plan and 3D).'); } }),
];

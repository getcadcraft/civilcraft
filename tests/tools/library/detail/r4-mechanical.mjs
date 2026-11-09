/* SPDX-License-Identifier: Apache-2.0 */
/** Round 4 mechanical (2026-11-03): kitchen hoods and exhaust, make-up air, rooftop and air handling units, preconditioned air for aircraft gates, atrium and baggage-hall fans,
 *  chillers, boilers, towers, pumps, terminal units, diffusers and grilles, dampers, air curtains, heat recovery, refrigeration condensers and racks. */
import { fam, cab, tbl, pull, T, GAP, leaves, F, FU, M, S, C, O, A } from './r4-kit.mjs';

const I = 25.4;
/** Heavy louver slats on a long face (visible from the front): protrude 30 mm. */
const lv = (a, x0, x1, y, z0, z1, step = 90) => { const d = y < (a.YF + a.YB) / 2 ? -1 : 1; for (let z = z0; z < z1 - 25; z += step) a.box(x0, Math.min(y, y + d * 30), z, x1, Math.max(y, y + d * 30), z + 24); a.rect(x0, Math.min(y, y + d * 30), x1, Math.max(y, y + d * 30), 'EQUIP-DETAIL'); };
const louvers = M.louvers, cx_ = (a, f) => a.X0 + a.W * f;
/** Hinged service panels on a casing face at y (front: protrude toward -Y; back: toward +Y). */
const accessPanels = (a, n, z0, z1, y, xa = a.X0, xb = a.X1) => {
  const dir = y > (a.YF + a.YB) / 2 ? 1 : -1, w = (xb - xa) / n;
  for (let i = 0; i < n; i++) {
    const x0 = xa + i * w + 35, x1 = xa + (i + 1) * w - 35, ya = Math.min(y, y + dir * 28), yb = Math.max(y, y + dir * 28), zm = (z0 + z1) / 2;
    a.box(x0, ya, z0, x1, yb, z1); a.box(x1 - 90, Math.min(yb, yb + dir * 22), zm - 60, x1 - 60, Math.max(yb, yb + dir * 22), zm + 60); a.rect(x0, ya, x1, yb, 'EQUIP-DETAIL');
  }
};
/** Extrude a convex profile of [y, z] points along X from x0 to x1. */
const ext = (a, pr, x0, x1) => {
  const n = pr.length, P = (x, p) => [x, p[0], p[1]];
  for (let i = 1; i < n - 1; i++) { a.t.push([P(x0, pr[0]), P(x0, pr[i + 1]), P(x0, pr[i])]); a.t.push([P(x1, pr[0]), P(x1, pr[i]), P(x1, pr[i + 1])]); }
  for (let i = 0; i < n; i++) { const p = pr[i], q = pr[(i + 1) % n]; a.t.push([P(x0, p), P(x0, q), P(x1, q)], [P(x0, p), P(x1, q), P(x1, p)]); }
  return a;
};
/** A rectangular ring in plan (four boxes). */
const ring = (a, x0, y0, x1, y1, z0, z1, t) => { a.box(x0, y0, z0, x1, y0 + t, z1).box(x0, y1 - t, z0, x1, y1, z1).box(x0, y0 + t, z0, x0 + t, y1 - t, z1).box(x1 - t, y0 + t, z0, x1, y1 - t, z1); };
/** A round fan on a shroud: ring, guard spokes and hub, top at z + 90. */
const fanTop = (a, cx, cy, z, r, spokes = 8) => {
  a.cyl(cx, cy, z, z + 60, r, 26); a.cyl(cx, cy, z + 60, z + 90, r * 0.16, 12);
  for (let i = 0; i < spokes; i++) { const g = (i / spokes) * Math.PI * 2; a.tube([[cx + Math.cos(g) * r * 0.14, cy + Math.sin(g) * r * 0.14, z + 70], [cx + Math.cos(g) * r * 0.97, cy + Math.sin(g) * r * 0.97, z + 62]], [5, 5], 4); a.line(cx, cy, cx + Math.cos(g) * r, cy + Math.sin(g) * r, 'EQUIP-DETAIL'); }
  a.circ(cx, cy, r); a.circ(cx, cy, r * 0.55, 'EQUIP-DETAIL'); a.circ(cx, cy, r * 0.16, 'EQUIP-DETAIL');
};
/** Louver slats on an end face at x (facing -x if dir < 0, +x if dir > 0), spanning y0..y1. */
const sideLouvers = (a, x, y0, y1, z0, z1, step = 40, dir = -1) => { for (let z = z0; z < z1 - 10; z += step) a.box(Math.min(x, x + dir * 8), y0, z, Math.max(x, x + dir * 8), y1, z + 10); a.line(x, y0, x, y1, 'EQUIP-DETAIL'); };
const handleBar = (a, x, y, z, len = 120) => { a.box(x - 8, y - 22, z, x + 8, y - 12, z + len); a.box(x - 8, y - 12, z, x + 8, y, z + 14); a.box(x - 8, y - 12, z + len - 14, x + 8, y, z + len); };
const flangeY = (a, cx, y, cz, w, h, t = 24) => a.box(cx - w / 2, y - t / 2, cz - h / 2, cx + w / 2, y + t / 2, cz + h / 2);
/** Canopy hood shell: end plates, sloped front, back and top plate. */
function canopy(a, o) {
  const { X0, X1, YF, YB, Z0, Z1 } = a, t = 22, zt = Z1 - o.collarH, yTop = YF + a.D * o.run;
  a.outline();
  const prof = [[YF, Z0], [YF, Z0 + o.lip], [yTop, zt], [YB, zt], [YB, Z0]];
  ext(a, prof, X0, X0 + t); ext(a, prof, X1 - t, X1);
  ext(a, [[YF, Z0 + o.lip], [yTop, zt], [yTop, zt - t], [YF, Z0 + o.lip - t]], X0 + t, X1 - t);
  a.box(X0 + t, YF, Z0, X1 - t, YF + t, Z0 + o.lip); a.box(X0 + t, YB - t, Z0, X1 - t, YB, zt); a.box(X0 + t, yTop, zt - t, X1 - t, YB, zt);
  a.line(X0 + t, YF + t, X1 - t, YF + t); a.line(X0 + t, yTop, X1 - t, yTop, 'EQUIP-DETAIL');
}
const collars = (a, n, r, y, z0, z1) => { for (let i = 0; i < n; i++) { const x = a.X0 + (a.W * (i + 0.5)) / n; a.cyl(x, y, z0, z1, r, 18); a.circ(x, y, r, 'EQUIP-DETAIL'); a.cyl(x, y, z0, z0 + 25, r + 25, 18); } };

export default [
  // ===================================================================== kitchen hoods and exhaust
  fam({ cat: 'mechanical/equipment', title: 'Generic Type I wall canopy hood',
    desc: (v) => `Wall canopy grease hood ${v.l} in long with end plates, a sloped front with a lip, a baffle filter bank, ${v.nf} light fixtures, a grease cup and ${v.nc} round exhaust collar${v.nc > 1 ? 's' : ''} on top.`,
    vs: [[48, 1, 2], [72, 2, 3], [96, 2, 4], [120, 3, 5], [144, 3, 6]].map(([l, nc, nf]) => [`${l} in long`, l, 42, 30, 78, { l, nc, nf }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a; canopy(a, { lip: 150, run: 0.55, collarH: 150 });
      const nfl = Math.round(W / (20 * I)); for (let i = 0; i < nfl; i++) { const x0 = X0 + 40 + (i * (W - 80)) / nfl, x1 = X0 + 40 + ((i + 1) * (W - 80)) / nfl - 8; a.box(x0, YB - 120, Z0 + 150, x1, YB - 70, Z1 - 200); for (let z = Z0 + 190; z < Z1 - 220; z += 30) a.box(x0 + 10, YB - 125, z, x1 - 10, YB - 118, z + 8); a.rect(x0, YB - 120, x1, YB - 70, 'EQUIP-DETAIL'); }
      for (let i = 0; i < v.nf; i++) { const x = X0 + (W * (i + 0.5)) / v.nf; a.box(x - 60, YF + 100, Z0 + 150, x + 60, YF + 190, Z0 + 175); a.rect(x - 60, YF + 100, x + 60, YF + 190, 'EQUIP-DETAIL'); }
      a.cyl(X1 - 60, YF + 60, Z0 + 20, Z0 + 110, 30, 10); collars(a, v.nc, 130, YB - 170, Z1 - 150, Z1);
      a.log('Added the end plates, the sloped front with its lip, the baffle filter bank, the lights, the grease cup and the exhaust collars (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic island canopy hood',
    desc: (v) => `Double-sloped island canopy ${v.l} in long and ${v.dp} in deep with a lip on both long sides, a central filter bank, a light each side and ${v.nc} exhaust collars on the ridge.`,
    vs: [['96 in long', 96, 48, 30, 78, { l: 96, dp: 48, nc: 2 }], ['144 in long', 144, 54, 30, 78, { l: 144, dp: 54, nc: 3 }], ['192 in long', 192, 60, 32, 78, { l: 192, dp: 60, nc: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a, t = 22, zt = Z1 - 150; a.outline();
      const prof = [[YF, Z0], [YF, Z0 + 150], [cy - 250, zt], [cy + 250, zt], [YB, Z0 + 150], [YB, Z0]]; ext(a, prof, X0, X0 + t); ext(a, prof, X1 - t, X1);
      ext(a, [[YF, Z0 + 150], [cy - 250, zt], [cy - 250, zt - t], [YF, Z0 + 150 - t]], X0 + t, X1 - t); ext(a, [[YB, Z0 + 150], [cy + 250, zt], [cy + 250, zt - t], [YB, Z0 + 150 - t]], X0 + t, X1 - t);
      a.box(X0 + t, cy - 250, zt - t, X1 - t, cy + 250, zt); a.box(X0 + t, YF, Z0, X1 - t, YF + t, Z0 + 150); a.box(X0 + t, YB - t, Z0, X1 - t, YB, Z0 + 150);
      const nf = Math.round(W / (20 * I)); for (let i = 0; i < nf; i++) { const x0 = X0 + 40 + (i * (W - 80)) / nf, x1 = X0 + 40 + ((i + 1) * (W - 80)) / nf - 8; for (const s of [-1, 1]) { a.box(x0, cy + s * 180 - 22, Z0 + 180, x1, cy + s * 180 + 22, zt - 80); a.rect(x0, cy + s * 180 - 22, x1, cy + s * 180 + 22, 'EQUIP-DETAIL'); } }
      for (const y of [YF + 110, YB - 110]) a.box(X0 + W * 0.5 - 60, y - 45, Z0 + 150, X0 + W * 0.5 + 60, y + 45, Z0 + 175);
      collars(a, v.nc, 130, cy, zt, Z1); a.line(X0 + t, cy - 250, X1 - t, cy - 250, 'EQUIP-DETAIL'); a.line(X0 + t, cy + 250, X1 - t, cy + 250, 'EQUIP-DETAIL');
      a.log('Added the end plates, the two sloped sides with their lips, the central filter banks, the lights and the ridge collars (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic Type II condensate hood',
    desc: (v) => `Low-profile condensate hood ${v.l} in long with a front lip, a perimeter condensate trough inside, a flat top plate and ${v.nc} round collar${v.nc > 1 ? 's' : ''}; there are no grease filters.`,
    vs: [['48 in long', 48, 36, 18, 78, { l: 48, nc: 1 }], ['96 in long', 96, 42, 20, 78, { l: 96, nc: 2 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a; canopy(a, { lip: 100, run: 0.8, collarH: 100 });
      a.box(X0 + 22, YF + 22, Z0 + 20, X1 - 22, YF + 60, Z0 + 55); a.box(X0 + 22, YB - 60, Z0 + 20, X1 - 22, YB - 22, Z0 + 55); a.rect(X0 + 22, YF + 22, X1 - 22, YF + 60, 'EQUIP-DETAIL');
      a.cyl(X0 + 60, YF + 40, Z0 - 0, Z0 + 20, 20, 8); collars(a, v.nc, 140, YB - 190, Z1 - 100, Z1);
      for (let i = 0; i < v.nc + 1; i++) { const x = X0 + (W * (i + 0.5)) / (v.nc + 1); a.box(x - 40, YF + 120, Z0 + 100, x + 40, YF + 200, Z0 + 120); }
      a.log('Added the end plates, the sloped front with its lip, the condensate trough, the lights and the exhaust collars (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic proximity backshelf hood',
    desc: (v) => `Low backshelf hood ${v.l} in long that mounts on the back wall: a front panel with a long capture slot, a rear plenum, two end plates and ${v.nc} round collar${v.nc > 1 ? 's' : ''} on top.`,
    vs: [['36 in long', 36, 20, 20, 62, { l: 36, nc: 1 }], ['84 in long', 84, 24, 22, 62, { l: 84, nc: 2 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a, t = 20, zt = Z1 - 120; a.outline();
      a.box(X0, YF, Z0, X0 + t, YB, zt); a.box(X1 - t, YF, Z0, X1, YB, zt); a.box(X0, YF, zt - t, X1, YB, zt); a.box(X0 + t, YB - t, Z0, X1 - t, YB, zt);
      a.box(X0 + t, YF, Z0, X1 - t, YF + t, Z0 + (zt - Z0) * 0.3); a.box(X0 + t, YF, Z0 + (zt - Z0) * 0.3 + 70, X1 - t, YF + t, zt - t);
      a.box(X0 + t, YF + t, Z0 + (zt - Z0) * 0.3, X1 - t, YB - t, Z0 + (zt - Z0) * 0.3 + 6); a.rect(X0 + t, YF, X1 - t, YF + t, 'EQUIP-DETAIL'); a.line(X0 + t, YF + 8, X1 - t, YF + 8, 'EQUIP-DETAIL');
      collars(a, v.nc, 100, (YF + YB) / 2, zt, Z1);
      a.log('Added the end plates, the front panel with its capture slot, the rear plenum and the exhaust collars (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic grease exhaust fan',
    desc: (v) => `Rooftop upblast grease fan with a ${v.wh} in wheel size: a square curb, a base with a hinge kit, a round windband with a motor cover, a discharge cone with a rain cap and a grease drain.`,
    vs: [[12, 30], [18, 38], [24, 44], [30, 52]].map(([wh, c]) => [`${wh} in wheel`, c, c, 34 + wh, 0, { wh }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) * 0.36; a.outline(); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.5, 'EQUIP-DETAIL');
      a.box(X0, YF, Z0, X1, YB, Z0 + 180); a.box(X0 + 30, YF + 30, Z0 + 180, X1 - 30, YB - 30, Z0 + 240);
      a.cyl(cx, cy, Z0 + 240, Z0 + (Z1 - Z0) * 0.55, r, 28); a.cyl(cx, cy, Z0 + (Z1 - Z0) * 0.55, Z0 + (Z1 - Z0) * 0.58, r * 1.05, 28);
      a.cone(cx, cy, Z0 + (Z1 - Z0) * 0.58, Z1 - 70, r * 0.6, r * 0.5, 22); a.cyl(cx, cy, Z1 - 70, Z1 - 55, r * 0.9, 24);
      for (let i = 0; i < 3; i++) { const g = (i / 3) * Math.PI * 2 + 0.5; a.tube([[cx + Math.cos(g) * r * 0.45, cy + Math.sin(g) * r * 0.45, Z1 - 70], [cx + Math.cos(g) * r * 0.45, cy + Math.sin(g) * r * 0.45, Z1 - 55]], [8, 8], 5); }
      a.box(X0 + 30, cy - 60, Z0 + 240, X0 + 30 + 60, cy + 60, Z0 + 420); a.cyl(X1 - 40, YF + 60, Z0 + 20, Z0 + 150, 22, 8);
      a.box(cx + r * 0.9, cy - 12, Z0 + 250, cx + r * 1.1, cy + 12, Z0 + 330);
      a.log('Added the curb, the base, the windband with its motor cover and hinge, the discharge cone, the rain cap and the grease drain (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic direct-fired make-up air unit',
    desc: (v) => `Direct-fired make-up air unit of ${v.cfm} cfm on a roof curb: a louvered intake hood, filter section with a door, a burner section with a stack, a blower section with a panel and a discharge duct.`,
    vs: [['2,000 cfm', 66, 36, 40, 0, { cfm: '2,000' }], ['4,000 cfm', 84, 42, 44, 0, { cfm: '4,000' }], ['6,000 cfm', 100, 48, 48, 0, { cfm: '6,000' }], ['10,000 cfm', 132, 54, 56, 0, { cfm: '10,000' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 250);
      const bz = Z0 + 250, zc = Z1 - 200;
      a.box(X0 + 10, YF + 10, bz, X0 + W * 0.28, YB - 10, zc); sideLouvers(a, X0 + 10, YF + 40, YB - 40, bz + 80, zc - 80, 36, -1); a.box(X0 + W * 0.28, YF + 10, bz, X0 + W * 0.5, YB - 10, zc); accessPanels(a, 1, bz + 80, zc - 80, YF + 10);
      a.box(X0 + W * 0.5, YF + 10, bz, X0 + W * 0.7, YB - 10, zc); a.cyl(X0 + W * 0.6, YB - 90, zc, Z1, 70, 14); a.circ(X0 + W * 0.6, YB - 90, 70, 'EQUIP-DETAIL');
      a.box(X0 + W * 0.7, YF + 10, bz, X1 - 10, YB - 10, zc); a.box(X0 + W * 0.74, YF - 0, bz + 120, X1 - W * 0.06, YF + 10, zc - 120); a.cyl(X0 + W * 0.84, YB - 110, zc, zc + 120, 12, 6);
      a.box(X1 - 150, YF + 150, bz + 100, X1 - 10, YB - 150, zc - 100);
      a.line(X0 + W * 0.28, YF, X0 + W * 0.28, YB); a.line(X0 + W * 0.5, YF, X0 + W * 0.5, YB); a.line(X0 + W * 0.7, YF, X0 + W * 0.7, YB);
      a.log('Added the curb, the louvered intake, the filter section door, the burner section and stack, the blower section with its panel and the discharge duct (plan and 3D).');
    } }),
  // ===================================================================== rooftop units and air handlers
  fam({ cat: 'mechanical/equipment', title: 'Generic packaged rooftop unit',
    desc: (v) => `Packaged rooftop unit of ${v.tons} tons on a roof curb with a casing, ${v.panels} service panel${v.panels > 1 ? 's' : ''} per long side, ${v.fans} condenser fan${v.fans > 1 ? 's' : ''} with guards, a coil louver, an economizer hood and an end duct panel.`,
    vs: [['3 ton', 3, 1, 2, 52, 36, 36], ['7.5 ton', 7.5, 1, 2, 76, 44, 40], ['12.5 ton', 12.5, 2, 3, 96, 52, 44]]
      .map(([l, tons, fans, panels, w, d, h]) => [l, w, d, h, 0, { tons, fans, panels }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a, zc = Z1 - 110; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 260); a.box(X0 + 10, YF + 10, Z0 + 260, X1 - 10, YB - 10, zc);
      accessPanels(a, v.panels, Z0 + 340, zc - 60, YF + 10); accessPanels(a, v.panels, Z0 + 340, zc - 60, YB);
      sideLouvers(a, X0 + 10, YF + 60, YB - 60, Z0 + 340, zc - 60, 34, -1);
      for (let i = 0; i < v.fans; i++) fanTop(a, X0 + W * 0.45 + ((i + 0.5) * W * 0.4) / v.fans - W * 0.2 + (v.fans > 1 ? 0 : W * 0.1), cy, zc, Math.min(a.D * 0.3, 260), 8);
      a.box(X1 - 380, YF + 60, zc, X1 - 20, YB - 60, Z1 - 20); a.line(X1 - 380, YF + 60, X1 - 380, YB - 60, 'EQUIP-DETAIL'); a.rect(X1 - 380, YF + 60, X1 - 20, YB - 60, 'EQUIP-DETAIL');
      a.box(X1 - 10, YF + 120, Z0 + 300, X1 + 0.5, YB - 120, Z0 + 520); a.box(X0 + 200, YF - 10, Z0 + 700 > zc - 100 ? zc - 200 : Z0 + 700, X0 + 400, YF + 10, zc - 100 > Z0 + 700 ? Z0 + 880 : zc - 60);
      a.log('Added the curb, the casing, the service panels on both long sides, the coil louver, the condenser fans with guards and the economizer hood (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic multi-compressor rooftop unit',
    desc: (v) => `Large rooftop unit of ${v.tons} tons on a curb: a long casing with ${v.panels} service panels per long side, ${v.fans} condenser fans with guards in two rows, a return fan end with a hood and an outside air intake.`,
    vs: [['20 ton', 20, 4, 4, 112, 66, 54], ['40 ton', 40, 6, 6, 168, 78, 64], ['60 ton', 60, 6, 7, 204, 84, 70], ['75 ton', 75, 8, 8, 240, 90, 76]]
      .map(([l, tons, fans, panels, w, d, h]) => [l, w, d, h, 0, { tons, fans, panels }]).slice(0, 5),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, zc = Z1 - 120; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 300); a.box(X0 + 10, YF + 10, Z0 + 300, X1 - 10, YB - 10, zc);
      accessPanels(a, v.panels, Z0 + 420, zc - 80, YF + 10); accessPanels(a, v.panels, Z0 + 420, zc - 80, YB);
      const cols = v.fans / 2, fr = Math.min(D * 0.2, 330); for (let c = 0; c < cols; c++) for (const y of [cy - D * 0.22, cy + D * 0.22]) fanTop(a, X0 + W * 0.08 + ((c + 0.5) * W * 0.6) / cols, y, zc, fr, 8);
      a.box(X1 - 560, YF + 60, zc, X1 - 30, YB - 60, Z1 - 10); a.cyl(X1 - 300, cy, zc, Z1 - 10, Math.min(D * 0.25, 260), 20); a.circ(X1 - 300, cy, Math.min(D * 0.25, 260), 'EQUIP-DETAIL');
      sideLouvers(a, X0 + 10, YF + 100, YB - 100, Z0 + 420, zc - 80, 36, -1); sideLouvers(a, X1 - 10, YF + 100, YB - 100, Z0 + 420, zc - 80, 36, 1);
      a.log('Added the curb, the long casing with service panels, the two rows of condenser fans with guards, the return fan hood and the louvered end intakes (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic modular air handling unit',
    desc: (v) => `Floor-standing air handler for ${v.cfm} cfm built of ${v.n} sections on a base rail: a mixing box with dampers, a filter section, a coil section with pipe headers, a fan section with an external motor and a discharge plenum, each with a hinged door.`,
    vs: [['4,000 cfm', 4000, 5, 150, 30, 48], ['10,000 cfm', 10000, 5, 192, 46, 66], ['20,000 cfm', 20000, 5, 252, 62, 84], ['40,000 cfm', 40000, 6, 330, 84, 108], ['60,000 cfm', 60000, 6, 372, 96, 120]]
      .map(([l, cfm, n, w, d, h]) => [l, w, d, h, 0, { cfm: l.replace(' cfm', '').replace(/(\d+)(\d{3})/, '$1,$2'), n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 140); const bw = (W - 40) / v.n, zt = Z1 - 10;
      for (let i = 0; i < v.n; i++) { const x0 = X0 + 20 + i * bw, x1 = x0 + bw - 4; a.box(x0, YF + 10, Z0 + 140, x1, YB - 10, zt); a.rect(x0, YF + 10, x1, YB - 10, 'EQUIP-DETAIL');
        a.box(x0 + bw * 0.12, YF - 26, Z0 + 260, x1 - bw * 0.12, YF + 10, zt - 120); handleBar(a, x1 - bw * 0.2, YF - 26, Z0 + (zt - Z0) * 0.42, 140); }
      a.box(X0 + 20, YF + 10, Z0 + 140, X0 + 20 + bw * 0.4, YB - 10, zt); for (let z = Z0 + 300; z < zt - 200; z += 90) a.box(X0 + 8, YF + 40, z, X0 + 20, YB - 40, z + 40);
      const ci = 2; for (const dz of [Z0 + 340, Z0 + 460]) { a.xcyl(X0 + 20 + bw * ci + 20, X0 + 20 + bw * ci + 70, YB - 90, dz, 24, 8); }
      a.box(X0 + 20 + bw * 3 + bw * 0.2, YB - 10, zt - 240, X0 + 20 + bw * 3 + bw * 0.8, YB + 0, zt); a.box(X0 + 20 + bw * 3 + bw * 0.25, YB - 160, zt - 200, X0 + 20 + bw * 3 + bw * 0.75, YB - 10, zt - 40);
      a.box(X1 - 10, YF + D * 0.2, Z0 + 260, X1 - 0, YB - D * 0.2, zt - 120);
      a.log('Added the base rail, the sections with their hinged doors, the mixing box louver slats, the coil headers, the external fan motor and the discharge plenum (plan and 3D).');
    } }),
  // ===================================================================== aircraft gates, atrium and baggage hall
  fam({ cat: 'mechanical/equipment', title: 'Generic bridge-mounted preconditioned air unit',
    desc: (v) => `Preconditioned air unit of ${v.tons} tons for an aircraft gate, mounted on a boarding bridge frame: a casing with two service doors, ${v.fans} condenser fans with guards, a coil louver, a control panel and a flexible hose coupling at the aircraft end.`,
    vs: [['20 ton', 20, 3, 120, 48, 52], ['30 ton', 30, 4, 144, 54, 56], ['45 ton', 45, 6, 180, 60, 60]].map(([l, t, f, w, d, h]) => [l, w, d, h, 90, { tons: t, fans: f }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, zc = Z1 - 100; a.outline();
      for (const x of [X0 + 60, X1 - 60]) for (const y of [YF + 60, YB - 60]) a.box(x - 30, y - 30, Z0, x + 30, y + 30, Z0 + 140);
      a.box(X0, YF, Z0 + 140, X1, YB, Z0 + 180); a.box(X0 + 10, YF + 10, Z0 + 180, X1 - 10, YB - 10, zc); accessPanels(a, 2, Z0 + 260, zc - 80, YF + 10);
      sideLouvers(a, X0 + 10, YF + 70, YB - 70, Z0 + 260, zc - 80, 34, -1);
      const per = Math.ceil(v.fans / 2); for (let i = 0; i < v.fans; i++) fanTop(a, X0 + W * 0.12 + ((Math.floor(i / 2) + 0.5) * W * 0.62) / per, cy + (i % 2 ? 1 : -1) * D * 0.22, zc, Math.min(D * 0.2, 250), 8);
      a.box(X1 - 340, YF + 80, Z0 + 260, X1 - 10, YF + 110, zc - 120); a.xcyl(X1 - 10, X1 + 0, cy, Z0 + 420, 60, 12);
      a.tube([[X1 - 10, cy, Z0 + 420], [X1 - 10, cy, Z0 + 260]], [100, 100], 14); a.circ(X1 - 40, cy, 100, 'EQUIP-DETAIL');
      a.log('Added the frame legs, the casing with service doors, the coil louver, the condenser fans with guards, the control panel and the hose coupling (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic ground-mounted preconditioned air unit',
    desc: (v) => `Skid-mounted preconditioned air unit of ${v.tons} tons for an aircraft stand: a casing with service doors, ${v.fans} condenser fans with guards and a separate hose reel with a drum, a coiled flexible hose and a nozzle.`,
    vs: [['20 ton', 20, 3, 156, 60, 76], ['30 ton', 30, 4, 180, 66, 80], ['45 ton', 45, 6, 216, 72, 84]].map(([l, t, f, w, d, h]) => [l, w, d, h, 0, { tons: t, fans: f }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a, zc = Z1 - 100, cw = W * 0.64; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 100); a.box(X0 + 10, YF + 10, Z0 + 100, X0 + cw, YB - 10, zc); accessPanels(a, 2, Z0 + 200, zc - 80, YF + 10, X0, X0 + cw); a.line(X0 + cw, YF, X0 + cw, YB);
      sideLouvers(a, X0 + 10, YF + 70, YB - 70, Z0 + 200, zc - 80, 34, -1); const per = Math.ceil(v.fans / 2); for (let i = 0; i < v.fans; i++) fanTop(a, X0 + 10 + ((Math.floor(i / 2) + 0.5) * (cw - 20)) / per, cy + (i % 2 ? 1 : -1) * D * 0.22, zc, Math.min(D * 0.2, 250), 8);
      const rx = X0 + cw + (X1 - X0 - cw) / 2, rr = Math.min((X1 - X0 - cw) * 0.42, D * 0.42, (Z1 - Z0) * 0.3); a.cyl(rx, cy, Z0 + 100, Z0 + 140, rr * 0.5, 14);
      a.xcyl(rx - 120, rx + 120, cy, Z0 + 100 + rr + 40, rr, 28); a.xcyl(rx - 150, rx - 120, cy, Z0 + 100 + rr + 40, rr * 1.1, 28); a.xcyl(rx + 120, rx + 150, cy, Z0 + 100 + rr + 40, rr * 1.1, 28);
      for (let k = 0; k < 4; k++) a.xcyl(rx - 100 + k * 50, rx - 70 + k * 50, cy, Z0 + 100 + rr + 40, rr * 1.12, 28);
      a.tube([[rx, cy, Z0 + 120], [X0 + cw + 30, cy, Z0 + 260]], [30, 30], 8); a.circ(rx, cy, rr, 'EQUIP-DETAIL'); a.line(X0 + cw, cy, X1, cy, 'EQUIP-DETAIL');
      a.log('Added the skid, the casing with service doors, the condenser fans with guards, and the hose reel with its drum, coiled hose and nozzle (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic roof axial exhaust fan',
    desc: (v) => `Rooftop axial exhaust fan with a ${v.dia} in propeller on a square curb: a base plate, a round housing with a motor hub, a rain hood on four legs and a disconnect box.`,
    vs: [[30, 42], [42, 56], [54, 68], [72, 90]].map(([dia, c]) => [`${dia} in propeller`, c, c, 40 + dia * 0.4, 0, { dia }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) * 0.36; a.outline(); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.25, 'EQUIP-DETAIL');
      a.box(X0, YF, Z0, X1, YB, Z0 + 200); a.box(X0 + 30, YF + 30, Z0 + 200, X1 - 30, YB - 30, Z0 + 240); a.cyl(cx, cy, Z0 + 240, Z1 - 200, r, 30);
      const blades = 5; for (let i = 0; i < blades; i++) { const g = (i / blades) * Math.PI * 2; a.tube([[cx, cy, Z0 + 500], [cx + Math.cos(g) * r * 0.9, cy + Math.sin(g) * r * 0.9, Z0 + 520]], [50, 14], 6); a.line(cx, cy, cx + Math.cos(g) * r * 0.9, cy + Math.sin(g) * r * 0.9, 'EQUIP-DETAIL'); }
      a.cyl(cx, cy, Z0 + 240, Z0 + 520, r * 0.12, 10);
      for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.box(cx + x * r * 0.95 - 12, cy + y * r * 0.95 - 12, Z1 - 200, cx + x * r * 0.95 + 12, cy + y * r * 0.95 + 12, Z1 - 60);
      a.cone(cx, cy, Z1 - 60, Z1, r * 1.35, r * 0.4, 28); a.box(X0 + 20, cy - 50, Z0 + 260, X0 + 120, cy + 50, Z0 + 460);
      a.log('Added the curb, the base plate, the housing with its propeller, the rain hood on legs and the disconnect box (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic high-volume low-speed ceiling fan',
    desc: (v) => `Large slow ceiling fan ${v.dia} ft across with ${v.blades} airfoil blades on a central hub with a motor, a down rod, a ceiling mount plate and a safety cable; mounted high over an open hall.`,
    vs: [[8, 6], [12, 6], [16, 6], [20, 8], [24, 8]].map(([dia, blades]) => [`${dia} ft, ${blades} blades`, dia * 12, dia * 12, 60 + dia * 4, 120 - 24 + 0 * dia, { dia, blades }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2, hz = Z0 + 260; a.circ(cx, cy, r); a.outline('EQUIP-HIDDEN');
      a.box(cx - 150, cy - 150, Z1 - 20, cx + 150, cy + 150, Z1); a.cyl(cx, cy, hz + 140, Z1 - 20, 30, 10); a.cyl(cx, cy, hz - 10, hz + 140, 170, 22); a.cyl(cx, cy, hz - 100, hz - 10, 120, 18);
      for (let i = 0; i < v.blades; i++) { const g = (i / v.blades) * Math.PI * 2; const x2 = cx + Math.cos(g) * r * 0.97, y2 = cy + Math.sin(g) * r * 0.97; a.tube([[cx + Math.cos(g) * 160, cy + Math.sin(g) * 160, hz + 40], [x2, y2, hz + 20 - 0]], [60, 40], 6);
        a.line(cx, cy, x2, y2, 'EQUIP-DETAIL'); a.cyl(x2, y2, hz - 20, hz + 30, 12, 6); }
      a.tube([[cx, cy, Z1 - 20], [cx + 90, cy + 90, hz + 80]], [3, 3], 4); a.circ(cx, cy, 170, 'EQUIP-DETAIL');
      a.log('Added the ceiling plate, the down rod, the motor hub, the airfoil blades with their tip caps and the safety cable (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic tubeaxial smoke exhaust fan',
    desc: (v) => `In-line tubeaxial smoke exhaust fan for ${v.cfm} cfm: a round casing with end flanges and collars, a bulge for the inner motor, a mounting frame and a disconnect box.`,
    vs: [['20,000 cfm', 54, 32, 36, 0, { cfm: '20,000' }], ['50,000 cfm', 78, 44, 48, 0, { cfm: '50,000' }], ['100,000 cfm', 104, 60, 64, 0, { cfm: '100,000' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = Math.min(D, Z1 - Z0) * 0.36 , zc = Z0 + (Z1 - Z0) * 0.5; a.outline();
      a.box(X0 + W * 0.15, YF, Z0, X0 + W * 0.2, YB, zc - r); a.box(X1 - W * 0.2, YF, Z0, X1 - W * 0.15, YB, zc - r); a.box(X0 + W * 0.15, YF, Z0, X1 - W * 0.15, YB, Z0 + 40);
      a.xcyl(X0 + 60, X1 - 60, cy, zc, r, 28); for (const x of [X0 + 60, X1 - 100]) a.xcyl(x, x + 40, cy, zc, r * 1.18, 28);
      a.cone(cx, cy, zc, zc, 1, 1, 3); a.xcyl(X0, X0 + 60, cy, zc, r * 1.1, 24); a.xcyl(X1 - 60, X1, cy, zc, r * 1.1, 24);
      a.ell(cx, cy, zc, W * 0.14, r * 0.5, r * 0.5, 14, 8); a.box(cx - 100, cy - r * 1.4, zc + r * 0.3, cx + 100, cy - r * 1.18, zc + r * 0.9);
      a.line(X0 + 60, cy - r, X1 - 60, cy - r); a.line(X0 + 60, cy + r, X1 - 60, cy + r); a.circ(cx, cy, r * 0.5, 'EQUIP-HIDDEN');
      a.log('Added the cylindrical casing with flanges, the inlet and outlet collars, the inner motor bulge, the mounting frame and the disconnect box (plan and 3D).');
    } }),
  // ===================================================================== plant: chillers, boilers, towers, pumps
  fam({ cat: 'mechanical/equipment', title: 'Generic air-cooled chiller',
    desc: (v) => `Air-cooled chiller of ${v.tons} tons on a base frame: a long casing with two coil banks and louvered ends, ${v.fans} condenser fans with guards in two rows, a control panel door and two chilled water connections.`,
    vs: [['60 ton, 4 fans', 60, 4, 120, 84, 90], ['150 ton, 6 fans', 150, 6, 168, 90, 96], ['250 ton, 8 fans', 250, 8, 228, 96, 102], ['400 ton, 12 fans', 400, 12, 336, 100, 106]].map(([l, t, f, w, d, h]) => [l, w, d, h, 0, { tons: t, fans: f }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, zc = Z1 - 100; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 150); a.box(X0 + 20, YF + 20, Z0 + 150, X1 - 20, YB - 20, zc);
      for (const y of [YF + 20, YB - 20]) lv(a, X0 + 100, X1 - 400, y, Z0 + 300, zc - 80, 80);
      sideLouvers(a, X0 + 20, YF + 120, YB - 120, Z0 + 300, zc - 80, 34, -1); a.box(X1 - 380, YF + 20, Z0 + 150, X1 - 20, YB - 20, zc);
      a.box(X1 - 330, YF - 20, Z0 + 300, X1 - 80, YF + 20, zc - 200); a.rect(X1 - 330, YF - 20, X1 - 80, YF + 20, 'EQUIP-DETAIL');
      const cols = v.fans / 2; for (let c = 0; c < cols; c++) for (const y of [cy - D * 0.24, cy + D * 0.24]) fanTop(a, X0 + 60 + ((c + 0.5) * (W - 480)) / cols, y, zc, Math.min(D * 0.21, 330), 8);
      for (const y of [cy - 150, cy + 150]) { a.xcyl(X1 - 20, X1 + 0, y, Z0 + 420, 55, 12); a.xcyl(X1 - 60, X1 - 20, y, Z0 + 420, 70, 12); }
      a.log('Added the base frame, the casing with two louvered coil banks, the end louvers, the condenser fans with guards, the control panel door and the water connections (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic centrifugal chiller',
    desc: (v) => `Water-cooled centrifugal chiller of ${v.tons} tons: an evaporator shell below and a condenser shell above on a base, water boxes with nozzles at one end, a compressor and motor housing at the other and a starter cabinet.`,
    vs: [['400 ton', 400, 192, 80, 96], ['600 ton', 600, 216, 90, 108], ['1,000 ton', 1000, 252, 104, 120]].map(([l, t, w, d, h]) => [l, w, d, h, 0, { tons: l.replace(' ton', '') }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a, r = D * 0.3; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 120);
      const lo = Z0 + 120 + r + 20, hi = lo + r * 1.7; a.xcyl(X0 + 120, X1 - 540, cy - D * 0.12, lo, r, 30); a.xcyl(X0 + 120, X1 - 540, cy + D * 0.12, Math.min(hi, Z1 - r - 10), r * 0.9, 30);
      for (const [y, z, rr] of [[cy - D * 0.12, lo, r], [cy + D * 0.12, Math.min(hi, Z1 - r - 10), r * 0.9]]) { a.xcyl(X0, X0 + 120, y, z, rr * 1.12, 26); a.xcyl(X0 + 100, X0 + 130, y, z, rr * 1.2, 26); for (const dz of [-rr * 0.4, rr * 0.4]) a.xcyl(X0 - 0, X0 + 30, y, z + dz, 55, 10); }
      a.ell(X1 - 400, cy, Z0 + 120 + r * 1.6, 220, D * 0.28, r * 1.4, 18, 8); a.xcyl(X1 - 260, X1 - 60, cy, Z0 + 120 + r * 1.6, r * 0.9, 24); a.box(X1 - 160, cy - 300, Z0 + 120, X1 - 20, cy + 300, Z1 - 100);
      a.cyl(X1 - 400, cy, Z0 + 120 + r * 2.8 > Z1 ? Z1 - 200 : Z0 + 120 + r * 2.8, Z1 - 10, 90, 14); a.box(X0 + 600, YF + 20, Z0 + 600, X0 + 1100, YF + 60, Z0 + 1050);
      a.line(X0 + 120, cy - D * 0.12 - r, X1 - 540, cy - D * 0.12 - r); a.line(X0 + 120, cy + D * 0.12 + r * 0.9, X1 - 540, cy + D * 0.12 + r * 0.9); a.rect(X1 - 160, cy - 300, X1 - 20, cy + 300, 'EQUIP-DETAIL');
      a.log('Added the base, the evaporator and condenser shells with water boxes and nozzles, the compressor and motor housing, the discharge pipe and the starter cabinet (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic floor-standing condensing boiler',
    desc: (v) => `Floor-standing gas condensing boiler of ${v.mbh} MBH: a base with a condensate drain, an insulated casing, a front door with a display, a top burner housing, a flue and a combustion air collar and supply and return stubs on the back.`,
    vs: [['500 MBH', 500, 30, 42, 66], ['750 MBH', 750, 34, 48, 68], ['1,500 MBH', 1500, 42, 60, 74], ['2,000 MBH', 2000, 48, 66, 78]].map(([l, m, w, d, h]) => [l, w, d, h, 0, { mbh: l.replace(' MBH', '') }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 120); a.box(X0 + 15, YF + 15, Z0 + 120, X1 - 15, YB - 15, Z1 - 330);
      a.box(X0 + 40, YF + 5, Z0 + 250, X1 - 40, YF + 15, Z1 - 420); a.rect(X0 + 40, YF + 5, X1 - 40, YF + 15, 'EQUIP-DETAIL'); a.box(X0 + 90, YF - 12, Z1 - 800, X1 - 90, YF + 5, Z1 - 560);
      a.box(X0 + 60, YF + 60, Z1 - 330, X1 - 60, YB - 60, Z1 - 120); a.cyl(cx - W * 0.2, cy, Z1 - 120, Z1, 95, 16); a.cyl(cx + W * 0.2, cy, Z1 - 120, Z1 - 20, 50, 12); a.circ(cx - W * 0.2, cy, 95, 'EQUIP-DETAIL'); a.circ(cx + W * 0.2, cy, 50, 'EQUIP-DETAIL');
      for (const x of [cx - W * 0.2, cx + W * 0.2]) { a.cyl(x, YB - 15, Z0 + 500, Z0 + 700, 30, 10); a.cyl(x, YB - 15, Z0 + 500, Z0 + 700, 30, 10); }
      a.cyl(X0 + 60, YF + 60, Z0 - 0, Z0 + 120, 18, 8);
      a.log('Added the base, the insulated casing, the front door with its display, the burner housing, the flue and air collars and the water connections (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic firetube steam boiler',
    desc: (v) => `Horizontal firetube boiler of ${v.bhp} boiler horsepower: a cylindrical shell on saddles, an insulated jacket, a round front door, a burner housing with a blower, a stack, a water column with a gauge glass and a control panel.`,
    vs: [['100 hp', 100, 132, 72, 96], ['200 hp', 200, 168, 84, 108], ['400 hp', 400, 204, 100, 124]].map(([l, h, w, d, ht]) => [l, w, d, ht, 0, { bhp: l.replace(' hp', '') }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a, r = D * 0.38, zc = Z0 + 200 + r; a.outline();
      a.box(X0 + W * 0.15, YF + 60, Z0, X0 + W * 0.15 + 80, YB - 60, Z0 + 200); a.box(X1 - W * 0.4, YF + 60, Z0, X1 - W * 0.4 + 80, YB - 60, Z0 + 200); a.box(X0 + 100, cy - D * 0.3, Z0, X1 - 100, cy + D * 0.3, Z0 + 40);
      a.xcyl(X0 + 220, X1 - 100, cy, zc, r, 32); a.ell(X1 - 100, cy, zc, 60, r, r, 14, 8); a.xcyl(X0 + 120, X0 + 220, cy, zc, r * 1.02, 32); a.cyl(X0 + 120, cy, zc, zc + 0.01, 1, 3);
      a.ell(X0 + 60, cy, zc, 60, r * 0.95, r * 0.95, 16, 8); for (let i = 0; i < 8; i++) { const g = (i / 8) * Math.PI * 2; a.cyl(X0 + 40, cy + Math.sin(g) * r * 0.8, zc + Math.cos(g) * r * 0.8 - 12, zc + Math.cos(g) * r * 0.8 + 12, 12, 6); }
      a.box(X0, cy - r * 0.4, zc - r * 0.5, X0 + 120, cy + r * 0.4, zc + r * 0.1); a.ell(X0 + 60, cy, zc + r * 0.55, 100, 150, 120, 12, 6); a.cyl(X1 - W * 0.22, cy, zc + r, Z1, 90, 16); a.circ(X1 - W * 0.22, cy, 90, 'EQUIP-DETAIL');
      a.cyl(X0 + W * 0.45, YF + 70, zc, zc + r + 120, 25, 8); a.box(X0 + W * 0.3, YF + 20, Z0 + 300, X0 + W * 0.3 + 300, YF + 60, Z0 + 700);
      a.line(X0 + 220, cy - r, X1 - 100, cy - r); a.line(X0 + 220, cy + r, X1 - 100, cy + r); a.circ(X0 + 60, cy, 0.1, 'EQUIP-DETAIL');
      a.log('Added the saddles, the shell with its jacket, the round front door, the burner housing, the stack, the water column and the control panel (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic open cooling tower',
    desc: (v) => `Open-circuit cooling tower with ${v.n} cell${v.n > 1 ? 's' : ''} of ${v.tons} tons in all: a basin, louvered casing sides, a fan stack with a guarded fan on each cell and water connections.`,
    vs: [[1, 300, 120, 120, 150], [2, 600, 216, 120, 150], [3, 900, 312, 120, 154]].map(([n, t, w, d, h]) => [`${n} cell${n > 1 ? 's' : ''}, ${t} ton`, w, d, h, 0, { n, tons: t }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a, cw = W / v.n, zb = Z0 + 300, zt = Z1 - 450; a.outline();
      a.box(X0, YF, Z0 + 80, X1, YB, zb); a.box(X0 + 20, YF + 20, zb, X1 - 20, YB - 20, zt);
      for (const y of [YF + 20, YB - 20]) lv(a, X0 + 60, X1 - 60, y, zb + 100, zt - 100, 90);
      for (let i = 0; i < v.n; i++) { const x = X0 + cw * (i + 0.5); a.cone(x, cy, zt, zt + 300, cw * 0.4, cw * 0.28, 26); fanTop(a, x, cy, zt + 300, cw * 0.28, 8); a.line(X0 + cw * i, YF, X0 + cw * i, YB, 'EQUIP-DETAIL'); }
      for (const [x, y] of [[X0 + 60, YF + 60], [X1 - 60, YF + 60], [X0 + 60, YB - 60], [X1 - 60, YB - 60]]) a.box(x - 30, y - 30, Z0, x + 30, y + 30, Z0 + 80);
      a.cyl(X0 + 150, YF + 20, Z0 + 150, zb - 20, 70, 12); a.cyl(X1 - 150, YF + 20, Z0 + 150, zb - 20, 70, 12);
      a.log('Added the basin, the louvered casing, the cone and guarded fan of each cell and the water connections (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic end-suction pump',
    desc: (v) => `Base-mounted end-suction pump with a ${v.hp} hp motor: a steel base, a motor with a fan cover and terminal box, a coupling guard, a volute with a suction flange at the end and a discharge flange on top.`,
    vs: [['5 hp', 5, 44, 18, 24], ['15 hp', 15, 56, 22, 28], ['30 hp', 30, 68, 26, 34], ['50 hp', 50, 78, 30, 38]].map(([l, hp, w, d, h]) => [l, w, d, h, 0, { hp }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a, zc = Z0 + (Z1 - Z0) * 0.42, mr = D * 0.32; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 70);
      a.xcyl(X0 + 40, X0 + W * 0.5, cy, zc, mr, 22); a.xcyl(X0 + 40, X0 + 120, cy, zc, mr * 0.8, 18); for (let x = X0 + 160; x < X0 + W * 0.5 - 20; x += 36) a.xcyl(x, x + 12, cy, zc, mr * 1.05, 22);
      a.box(cx_(a, 0.18) - 70, cy - mr - 50, zc + mr * 0.2, cx_(a, 0.18) + 70, cy - mr, zc + mr * 0.9); a.box(X0 + W * 0.5, cy - 70, Z0 + 70, X0 + W * 0.58, cy + 70, zc + 70); a.box(X0 + W * 0.5, cy - 80, zc - 80, X0 + W * 0.6, cy + 80, zc + 80);
      a.ell(X0 + W * 0.7, cy, zc, W * 0.13, D * 0.36, D * 0.36, 18, 8); a.xcyl(X0 + W * 0.83, X1, cy, zc, D * 0.17, 14); a.xcyl(X1 - 28, X1, cy, zc, D * 0.23, 14);
      a.cyl(X0 + W * 0.7, cy, zc + D * 0.3, Z1 - 24, D * 0.15, 14); a.cyl(X0 + W * 0.7, cy, Z1 - 24, Z1, D * 0.22, 14); a.circ(X0 + W * 0.7, cy, D * 0.22, 'EQUIP-DETAIL');
      a.rect(X0 + 40, cy - mr, X0 + W * 0.5, cy + mr, 'EQUIP-DETAIL'); a.rect(X0 + W * 0.5, cy - 80, X0 + W * 0.6, cy + 80, 'EQUIP-DETAIL');
      a.log('Added the base, the motor with its fan cover and terminal box, the coupling guard, the volute and the suction and discharge flanges (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic vertical inline pump',
    desc: (v) => `Vertical inline pump with a ${v.hp} hp motor standing on a pump body with two in-line flanges: a motor with cooling ribs and a fan cover, a terminal box, and a lantern bracket.`,
    vs: [['1.5 hp', 1.5, 16, 12, 34], ['5 hp', 5, 20, 14, 42], ['10 hp', 10, 26, 18, 50], ['20 hp', 20, 32, 22, 58]].map(([l, hp, w, d, h]) => [l, w, d, h, 0, { hp }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, zp = Z0 + (Z1 - Z0) * 0.22, mr = D * 0.36; a.outline();
      a.ell(cx, cy, zp, W * 0.2, D * 0.4, D * 0.4, 16, 8); a.xcyl(X0, X1, cy, zp, D * 0.2, 14); for (const x of [X0 + 12, X1 - 12]) { a.xcyl(x - 12, x + 12, cy, zp, D * 0.3, 16); a.circ(x, cy, 0.1, 'EQUIP-DETAIL'); }
      a.cyl(cx, cy, zp + D * 0.3, zp + D * 0.3 + 140, mr * 0.6, 14); for (const dx of [-1, 1]) a.box(cx + dx * mr * 0.55 - 15, cy - 15, zp + D * 0.3, cx + dx * mr * 0.55 + 15, cy + 15, zp + D * 0.3 + 140);
      const zm = zp + D * 0.3 + 140; a.cyl(cx, cy, zm, Z1 - 80, mr, 24); for (let z = zm + 30; z < Z1 - 120; z += 42) a.cyl(cx, cy, z, z + 12, mr * 1.07, 24);
      a.cyl(cx, cy, Z1 - 80, Z1, mr * 0.9, 24); a.circ(cx, cy, mr, 'EQUIP-DETAIL'); a.circ(cx, cy, mr * 0.9, 'EQUIP-DETAIL'); a.box(cx + mr, cy - 40, zm + 40, cx + mr + 50 < X1 ? cx + mr + 50 : X1, cy + 40, zm + 160);
      a.line(X0, cy, X1, cy);
      a.log('Added the pump body with its in-line flanges, the lantern bracket, the motor with cooling ribs, the fan cover and the terminal box (plan and 3D).');
    } }),
  // ===================================================================== terminal units
  fam({ cat: 'mechanical/equipment', title: 'Generic single-duct VAV box with reheat',
    desc: (v) => `Variable air volume box for a ${v.inlet} in round inlet: a round inlet collar, an insulated rectangular body, a hot water reheat coil with two pipe stubs and a controller enclosure.`,
    vs: [6, 8, 10, 12].map((n) => [`${n} in inlet`, 30 + n * 2, 12 + n * 1.2, 10 + n, 96, { inlet: n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, r = v.inlet * I / 2, bh = Z1 - Z0; a.outline();
      a.xcyl(X0, X0 + 200, cy, Z0 + bh * 0.5, Math.min(r, bh * 0.45, D * 0.45), 18); a.xcyl(X0 + 60, X0 + 80, cy, Z0 + bh * 0.5, Math.min(r, bh * 0.45, D * 0.45) * 1.15, 18);
      a.box(X0 + 200, YF + 10, Z0, X1 - 260, YB - 10, Z1); a.box(X1 - 260, YF + 20, Z0 + 20, X1 - 40, YB - 20, Z1 - 20); a.box(X1 - 40, YF, Z0 + 10, X1, YB, Z1 - 10);
      a.xcyl(X1 - 150, X1 - 110, YF + 10, Z0 + bh * 0.5 - 40, 14, 8); a.ycyl(YF - 40, YF + 20, X1 - 200, Z0 + bh * 0.3, 14, 8); a.ycyl(YF - 40, YF + 20, X1 - 120, Z0 + bh * 0.3, 14, 8);
      a.box(cx - 80, YF - 40, Z0 + 20, cx + 80, YF, Z0 + bh * 0.6); for (const x of [X0 + 280, X1 - 340]) a.box(x - 10, YF + 20, Z1, x + 10, YB - 20, Z1 + 0.1);
      a.line(X0 + 200, YF + 10, X0 + 200, YB - 10); a.line(X1 - 260, YF + 20, X1 - 260, YB - 20); a.circ(X0 + 100, cy, Math.min(r, bh * 0.45, D * 0.45), 'EQUIP-DETAIL');
      a.log('Added the round inlet collar, the insulated body, the reheat coil with its pipe stubs, the discharge flange and the controller enclosure (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic series fan-powered VAV box',
    desc: (v) => `Series fan-powered terminal unit of ${v.cfm} cfm: a round primary inlet, a mixing plenum with a ceiling return opening, a blower with a motor on the side, a discharge collar and a controller box.`,
    vs: [['800 cfm', 800, 44, 22, 16], ['1,600 cfm', 1600, 54, 28, 18], ['2,400 cfm', 2400, 64, 32, 20]].map(([l, c, w, d, h]) => [l, w, d, h, 96, { cfm: l.replace(' cfm', '') }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, bh = Z1 - Z0; a.outline();
      a.xcyl(X0, X0 + 220, cy, Z0 + bh * 0.62, bh * 0.28, 16); a.box(X0 + 220, YF + 10, Z0, X1 - 320, YB - 10, Z1); a.box(X0 + 400, YF + 80, Z0 - 0, X0 + 700, YB - 80, Z0 + 12);
      a.rect(X0 + 400, YF + 80, X0 + 700, YB - 80, 'EQUIP-HIDDEN'); a.ell(X1 - 420, cy, Z0 + bh * 0.5, 130, D * 0.38, bh * 0.45, 16, 8); a.box(X1 - 330, YF + 20, Z0 + 20, X1 - 40, YB - 20, Z1 - 20);
      a.xcyl(X1 - 40, X1, cy, Z0 + bh * 0.5, bh * 0.35, 16); a.cyl(X1 - 420, YF + 20, Z0 + bh * 0.5 - 70, Z0 + bh * 0.5 + 70, 70, 14); a.box(cx - 80, YF - 40, Z0 + 20, cx + 80, YF, Z0 + bh * 0.55);
      a.log('Added the primary inlet collar, the mixing plenum with its return opening, the blower and motor, the discharge collar and the controller box (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic horizontal fan coil unit',
    desc: (v) => `Ceiling-concealed fan coil of ${v.cfm} cfm with a sheet-metal casing, a coil section with two pipe stubs, ${v.n} blower wheels with a motor, a drain pan with a drain stub, a return opening below and a supply discharge collar.`,
    vs: [['400 cfm', 400, 1, 36, 20, 10], ['800 cfm', 800, 2, 48, 22, 11], ['1,200 cfm', 1200, 2, 58, 24, 12], ['2,000 cfm', 2000, 3, 72, 26, 14]].map(([l, c, n, w, d, h]) => [l, w, d, h, 96, { cfm: l.replace(' cfm', ''), n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, bh = Z1 - Z0; a.outline(); a.box(X0, YF, Z0 + 20, X1 - 40, YB, Z1); a.box(X0 + 40, YF + 40, Z0, X1 - 240, YB - 40, Z0 + 20);
      a.box(X0 + 50, YF + 50, Z0 + 30, X0 + 190, YB - 50, Z1 - 20); a.rect(X0 + 50, YF + 50, X0 + 190, YB - 50, 'EQUIP-DETAIL'); for (const y of [cy - 80, cy + 80]) a.ycyl(YF - 50, YF + 50, X0 + 90, Z0 + bh * 0.5, 14, 8);
      for (let i = 0; i < v.n; i++) { const x = X0 + 260 + ((i + 0.5) * (W - 560)) / v.n, rw = Math.min((W - 560) / v.n * 0.4, D * 0.36); a.xcyl(x - rw * 0.8, x + rw * 0.8, cy, Z0 + bh * 0.5, Math.min(rw, bh * 0.38), 18); a.circ(x, cy, Math.min(rw, bh * 0.38), 'EQUIP-DETAIL'); }
      a.box(X1 - 40, YF + 30, Z0 + 30, X1, YB - 30, Z1 - 30); a.box(X0 + 300, YB - 6, Z0 + 20, X0 + 340, YB, Z0 + 60); a.cyl(X0 + 120, YF + 20, Z0 - 0, Z0 + 20, 10, 6);
      a.box(X1 - 230, YF - 30, Z0 + 30, X1 - 90, YF, Z0 + 120); a.box(X1 - 400, YF - 20, Z0 + 20, X1 - 260, YF, Z1 - 20);
      a.log('Added the casing, the coil with its pipe stubs, the blower wheels and motor, the drain pan, the return opening and the discharge collar (plan and 3D).');
    } }),
  // ===================================================================== diffusers and grilles
  fam({ cat: 'mechanical/equipment', title: 'Generic square louvered ceiling diffuser',
    desc: (v) => `Square four-way ceiling diffuser ${v.f} by ${v.f} in with an outer flange, three nested louvered rings, a centre plate and a round ${v.n} in neck above.`,
    vs: [['12 in, 6 in neck', 12, 6, 12], ['24 in, 10 in neck', 24, 10, 14], ['24 in, 14 in neck', 24, 14, 16], ['36 in, 18 in neck', 36, 18, 18]].map(([l, f, n, h]) => [l, f, f, h, 96, { f, n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, w = X1 - X0; a.outline(); ring(a, X0, YF, X1, YB, Z0, Z0 + 14, w * 0.05);
      for (const k of [1, 2, 3]) { const m = w * 0.05 + (k * w * 0.9) / 7; ring(a, X0 + m, YF + m, X1 - m, YB - m, Z0 + 8 + k * 6, Z0 + 14 + k * 8, w * 0.03); a.rect(X0 + m, YF + m, X1 - m, YB - m, 'EQUIP-DETAIL'); }
      a.box(cx - w * 0.12, cy - w * 0.12, Z0 + 8, cx + w * 0.12, cy + w * 0.12, Z0 + 40); a.cyl(cx, cy, Z0 + 14, Z1, v.n * I / 2 * 0.9 < w * 0.4 ? v.n * I / 2 * 0.9 : w * 0.4, 20); a.line(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.line(X0, YB, X1, YF, 'EQUIP-DETAIL');
      a.log('Added the flange, the three nested louvered rings, the centre plate and the round neck (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic round ceiling diffuser',
    desc: (v) => `Round ceiling diffuser with a ${v.d} in face: a flange ring, three stepped cones and a centre disc under a round ${v.n} in neck.`,
    vs: [['face 14 in, 8 in neck', 14, 8], ['face 20 in, 12 in neck', 20, 12], ['face 26 in, 16 in neck', 26, 16]].map(([l, d, n]) => [l, d, d, d * 0.55 + 4, 96, { d, n }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.circ(cx, cy, r); a.outline('EQUIP-HIDDEN');
      a.cyl(cx, cy, Z0, Z0 + 10, r, 30); for (const [k, rr] of [[1, 0.8], [2, 0.58], [3, 0.36]]) { a.cone(cx, cy, Z0 + k * 22, Z0 + k * 22 + 40, r * rr * 0.7, r * rr, 28); a.circ(cx, cy, r * rr, 'EQUIP-DETAIL'); }
      a.cyl(cx, cy, Z0 + 10, Z1 - 0, Math.min(v.n * I / 2, r * 0.8) * 0.8, 20); a.cyl(cx, cy, Z0 - 0, Z0 + 30, r * 0.2, 12);
      a.log('Added the flange ring, the three stepped cones, the centre disc and the round neck (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic linear slot diffuser',
    desc: (v) => `Linear slot diffuser ${v.l} in long with ${v.s} slot${v.s > 1 ? 's' : ''}: a flanged face, bars between slots, an adjustable pattern blade in each slot and an inlet plenum box with a round collar.`,
    vs: [['1 slot, 48 in', 48, 1, 5], ['2 slots, 72 in', 72, 2, 7], ['3 slots, 96 in', 96, 3, 9]].map(([l, len, s, w]) => [l, len, w, 12, 96, { l: len, s }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, sw = 18, bar = (D - 30 - v.s * sw) / (v.s + 1); a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 14);
      let y = YF + 15; for (let i = 0; i <= v.s; i++) { a.box(X0 + 15, y, Z0 + 14, X1 - 15, y + bar, Z0 + 50); y += bar; if (i < v.s) { a.box(X0 + 15, y + 4, Z0 + 14, X1 - 15, y + sw - 4, Z0 + 24); a.rect(X0 + 15, y, X1 - 15, y + sw, 'EQUIP-DETAIL'); y += sw; } }
      a.box(X0 + 15, YF + 15, Z0 + 50, X1 - 15, YB - 15, Z1 - 80); for (let i = 0; i < Math.max(1, Math.round(W / 1200)); i++) a.cyl(X0 + (W * (i + 0.5)) / Math.max(1, Math.round(W / 1200)), cy, Z1 - 80, Z1, Math.min(D * 0.3, 90), 14);
      a.log('Added the flanged face, the bars and slots with their pattern blades, the inlet plenum and the round collars (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic perforated face ceiling diffuser',
    desc: (v) => `Perforated-face ceiling diffuser ${v.f} by ${v.f} in with a lay-in frame, a field of drilled holes drawn on the face and a ${v.n} in round side collar on a plenum box.`,
    vs: [['24 in, 8 in collar', 24, 8, 12], ['24 in, 12 in collar', 24, 12, 16]].map(([l, f, n, h]) => [l, f, f, h, 96, { f, n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); ring(a, X0, YF, X1, YB, Z0, Z0 + 20, 18); a.box(X0 + 18, YF + 18, Z0 + 14, X1 - 18, YB - 18, Z0 + 20);
      for (let x = X0 + 60; x < X1 - 40; x += 45) for (let y = YF + 60; y < YB - 40; y += 45) a.circ(x, y, 4, 'EQUIP-DETAIL');
      a.box(X0 + 40, YF + 40, Z0 + 20, X1 - 40, YB - 40, Z1); a.xcyl(X1 - 40, X1 + 0, cy, Z0 + 20 + (Z1 - Z0 - 20) / 2, Math.min(v.n * I / 2, (Z1 - Z0 - 20) / 2 - 6), 16);
      a.log('Added the lay-in frame, the perforated face, the plenum box and the side collar (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic double-deflection sidewall register',
    desc: (v) => `Wall register ${v.w} by ${v.h} in with a frame, a front set of horizontal fins and a rear set of vertical fins.`,
    vs: [['12 by 6 in', 12, 6], ['14 by 8 in', 14, 8], ['24 by 12 in', 24, 12]].map(([l, w, h]) => [l, w, 2.5, h, 84, { w, h }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.frame(X0, Z0, X1, Z1, YF, YF + 14, 22);
      for (let z = Z0 + 34; z < Z1 - 22; z += 28) a.box(X0 + 22, YF, z, X1 - 22, YF + 12, z + 8); for (let x = X0 + 45; x < X1 - 30; x += 40) a.box(x, YF + 18, Z0 + 22, x + 8, YB - 6, Z1 - 22);
      a.box(X0 + 10, YB - 6, Z0 + 10, X1 - 10, YB, Z1 - 10); a.line(X0, YF, X1, YF); a.line(X0 + 22, YF + 12, X1 - 22, YF + 12, 'EQUIP-DETAIL');
      a.log('Added the frame, the front horizontal fins, the rear vertical fins and the back plate (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic floor register',
    desc: (v) => `Floor register ${v.w} by ${v.l} in with a flat flange, cross bars across the opening and a duct boot below.`,
    vs: [['4 by 10 in', 4, 10], ['6 by 14 in', 6, 14]].map(([l, w, len]) => [l, w, len, 5, 0, { w, l: len }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); ring(a, X0, YF, X1, YB, Z1 - 12, Z1, 14);
      for (let y = YF + 40; y < YB - 20; y += 26) a.box(X0 + 14, y, Z1 - 12, X1 - 14, y + 10, Z1);
      a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z1 - 12); for (let y = YF + 50; y < YB - 40; y += 40) a.line(X0 + 14, y, X1 - 14, y, 'EQUIP-DETAIL');
      a.log('Added the flange, the cross bars and the duct boot (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic egg-crate return grille',
    desc: (v) => `Return grille ${v.w} by ${v.h} in with a lay-in frame and a one-inch egg-crate grid of crossed blades across the face.`,
    vs: [['24 by 24 in', 24, 24], ['24 by 48 in', 24, 48]].map(([l, w, h]) => [l, w, h, 3, 96, { w, h }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); ring(a, X0, YF, X1, YB, Z0, Z1, 22);
      for (let x = X0 + 22 + 25; x < X1 - 22; x += 25) { a.box(x, YF + 22, Z0 + 4, x + 3, YB - 22, Z1); a.line(x, YF + 22, x, YB - 22, 'EQUIP-DETAIL'); }
      for (let y = YF + 22 + 25; y < YB - 22; y += 25) { a.box(X0 + 22, y, Z0 + 4, X1 - 22, y + 3, Z1); a.line(X0 + 22, y, X1 - 22, y, 'EQUIP-DETAIL'); }
      a.log('Added the lay-in frame and the crossed blades of the egg-crate grid (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic hinged filter return grille',
    desc: (v) => `Return grille ${v.w} by ${v.h} in with a louvered face on a frame, a latch at one side and a filter holder behind the louvers.`,
    vs: [['20 by 20 in', 20, 20], ['24 by 24 in', 24, 24]].map(([l, w, h]) => [l, w, h, 4, 84, { w, h }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.frame(X0, Z0, X1, Z1, YF, YB, 24);
      for (let z = Z0 + 40; z < Z1 - 30; z += 32) a.tube([[X0 + 24, YF + 8, z], [X1 - 24, YF + 8, z + 14]], [6, 6], 4);
      a.box(X0 + 24, YB - 30, Z0 + 24, X1 - 24, YB - 12, Z1 - 24); a.box(X1 - 80, YF - 14, (Z0 + Z1) / 2 - 20, X1 - 40, YF, (Z0 + Z1) / 2 + 20); a.line(X0 + 24, YB - 30, X1 - 24, YB - 30, 'EQUIP-HIDDEN');
      a.log('Added the frame, the louvers on the face, the filter holder and the latch (plan and 3D).');
    } }),
  // ===================================================================== dampers
  fam({ cat: 'mechanical/equipment', title: 'Generic opposed-blade volume damper',
    desc: (v) => `Rectangular volume damper ${v.w} by ${v.h} in in a 12 in long sleeve with opposed blades, a linkage bar on the side and a locking quadrant with a handle.`,
    vs: [['12 by 12 in', 12, 12], ['24 by 18 in', 24, 18], ['36 by 24 in', 36, 24]].map(([l, w, h]) => [l, w, 12, h + 6, 60, { w, h }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a, n = Math.max(2, Math.round((Z1 - Z0) / 100)); a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 14); a.box(X0, YF, Z1 - 14, X1, YB, Z1); a.box(X0, YF, Z0, X0 + 14, YB, Z1); a.box(X1 - 14, YF, Z0, X1, YB, Z1);
      for (let i = 0; i < n; i++) { const z = Z0 + 14 + ((Z1 - Z0 - 28) * (i + 0.5)) / n, t = i % 2 ? 24 : -24; a.tube([[X0 + 14, (YF + YB) / 2 + t, z - 40], [X1 - 14, (YF + YB) / 2 - t, z + 40]], [3, 3], 4); a.box(X0 + 14, (YF + YB) / 2 - 40, z - 4, X1 - 14, (YF + YB) / 2 + 40, z + 4); }
      a.box(X1, YF + 60, Z0 + 30, X1 + 0.5, YB - 60, Z1 - 30); a.box(X1 - 14, YF - 30, Z0 + (Z1 - Z0) * 0.4, X1 - 4, YF, Z0 + (Z1 - Z0) * 0.4 + 60); a.xcyl(X1 - 40, X1 - 14, YF - 14, Z0 + (Z1 - Z0) * 0.4 + 30, 6, 6);
      a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.line(X0, (YF + YB) / 2, X1, (YF + YB) / 2, 'EQUIP-DETAIL');
      a.log('Added the sleeve, the opposed blades, the linkage and the locking quadrant with its handle (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic combination fire and smoke damper',
    desc: (v) => `Combination fire and smoke damper ${v.w} by ${v.h} in in a 16 in sleeve: a framed sleeve, a bank of blades, a fusible link on a bracket and an actuator box on the side with a linkage.`,
    vs: [['12 by 12 in', 12, 12], ['24 by 24 in', 24, 24], ['36 by 18 in', 36, 18]].map(([l, w, h]) => [l, w, 16, h + 8, 60, { w, h }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy } = a, n = Math.max(3, Math.round((Z1 - Z0) / 85)); a.outline(); ring(a, X0, YF, X1, YB, Z0, Z0 + 16, 16); ring(a, X0, YF, X1, YB, Z1 - 16, Z1, 16);
      a.box(X0, YF, Z0, X0 + 16, YB, Z1); a.box(X1 - 16, YF, Z0, X1, YB, Z1); a.box(X0 - 0, YF - 0, Z0, X1, YF + 12, Z0 + 10);
      for (let i = 0; i < n; i++) { const z = Z0 + 20 + ((Z1 - Z0 - 40) * (i + 0.5)) / n; a.box(X0 + 16, cy - 36, z - 6, X1 - 16, cy + 36, z + 6); }
      a.box(X1 - 30, cy - 40, Z1 - 70, X1 - 14, cy + 40, Z1 - 20); a.cyl(X0 + 60, cy, Z1 - 50, Z1 - 20, 7, 6);
      a.box(X1, YF + 40, Z0 + 30, X1, YB - 40, Z0 + 30 + 0.01); a.box(X1 - 4, YF + 20, Z0 + 20, X1, YB - 20, Z1 - 20);
      a.box(X1 - 4 - 0, cy - 80, Z0 + (Z1 - Z0) * 0.3, X1, cy + 80, Z0 + (Z1 - Z0) * 0.3 + 120); a.rect(X1 - 4, cy - 80, X1, cy + 80, 'EQUIP-DETAIL'); a.circ(X0 + 60, cy, 7, 'EQUIP-DETAIL');
      a.log('Added the framed sleeve, the bank of blades, the fusible link and the actuator box with its linkage (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic motorized control damper',
    desc: (v) => `Control damper ${v.w} by ${v.h} in in a 10 in sleeve with parallel blades, a linkage on one end and a spring-return actuator mounted on a bracket.`,
    vs: [['12 by 12 in', 12, 12], ['24 by 24 in', 24, 24]].map(([l, w, h]) => [l, w, 10, h + 8, 60, { w, h }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy } = a, n = Math.max(3, Math.round((Z1 - Z0) / 90)); a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 12); a.box(X0, YF, Z1 - 12, X1, YB, Z1); a.box(X0, YF, Z0, X0 + 12, YB, Z1); a.box(X1 - 12, YF, Z0, X1, YB, Z1);
      for (let i = 0; i < n; i++) { const z = Z0 + 12 + ((Z1 - Z0 - 24) * (i + 0.5)) / n; a.tube([[X0 + 12, cy - 30, z], [X1 - 12, cy + 30, z + 18]], [3, 3], 4); a.box(X0 + 12, cy - 60, z - 5, X1 - 12, cy + 60, z + 5); a.xcyl(X1 - 12, X1 + 0, cy, z, 3, 4); }
      a.box(X1 - 10, YF + 10, Z0 + 20, X1, YF + 12, Z1 - 20); a.box(X1 - 90, YF - 40, Z0 + (Z1 - Z0) * 0.35, X1 - 12, YF, Z0 + (Z1 - Z0) * 0.35 + 90); a.rect(X1 - 90, YF - 40, X1 - 12, YF, 'EQUIP-DETAIL'); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
      a.log('Added the sleeve, the parallel blades, the end linkage and the actuator on its bracket (plan and 3D).');
    } }),
  // ===================================================================== entrances, energy recovery
  fam({ cat: 'mechanical/equipment', title: 'Generic entrance air curtain',
    desc: (v) => `Overhead air curtain ${v.l} in long over a doorway: a cabinet with a front intake grille, ${v.n} fan section${v.n > 1 ? 's' : ''} with motors, a discharge slot below and two wall brackets.`,
    vs: [['surface mount, 36 in', 36, 1], ['surface mount, 72 in', 72, 2], ['surface mount, 120 in', 120, 3]].map(([l, len, n]) => [l, len, 12, 12, 96, { l: len, n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); a.box(X0 + 40, YF, Z0 + 80, X1 - 40, YB, Z1); a.box(X0, YF + 30, Z0 + 100, X0 + 40, YB - 30, Z1 - 20); a.box(X1 - 40, YF + 30, Z0 + 100, X1, YB - 30, Z1 - 20);
      a.box(X0 + 60, YF + 20, Z0, X1 - 60, YB - 20, Z0 + 80); for (let x = X0 + 70; x < X1 - 70; x += 14) a.line(x, YF + 24, x, YB - 24, 'EQUIP-DETAIL'); a.rect(X0 + 60, YF + 20, X1 - 60, YB - 20, 'EQUIP-DETAIL');
      for (let i = 0; i < v.n; i++) { const x = X0 + 40 + ((i + 0.5) * (W - 80)) / v.n; a.ell(x, cy, Z0 + 180, (W - 80) / v.n * 0.32, 60, 60, 14, 6); for (let k = -3; k <= 3; k++) a.box(x - 60 + 8 * 0, YF - 6, Z0 + 140 + (k + 3) * 18, x + 60, YF, Z0 + 148 + (k + 3) * 18); }
      for (const x of [X0 + 100, X1 - 100]) a.box(x - 20, YB - 6, Z1 - 30, x + 20, YB, Z1);
      a.log('Added the cabinet, the front intake grille slats, the fan sections, the discharge slot and the end motors (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic ceiling energy recovery ventilator',
    desc: (v) => `Ceiling-hung energy recovery ventilator of ${v.cfm} cfm: an insulated casing with a hinged access door, a filter door, four round duct collars on the ends, two fans and a controller box.`,
    vs: [['500 cfm', 500, 52, 30, 16], ['1,000 cfm', 1000, 64, 36, 18], ['2,000 cfm', 2000, 80, 44, 22]].map(([l, c, w, d, h]) => [l, w, d, h, 96, { cfm: l.replace(' cfm', '') }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, r = Math.min((Z1 - Z0) * 0.3, D * 0.14); a.outline(); a.box(X0 + 100, YF, Z0, X1 - 100, YB, Z1);
      for (const [x, y] of [[X0, cy - D * 0.26], [X0, cy + D * 0.26], [X1, cy - D * 0.26], [X1, cy + D * 0.26]]) { const dx = x < cx ? 1 : -1; a.xcyl(Math.min(x, x + dx * 100), Math.max(x, x + dx * 100), y, Z0 + (Z1 - Z0) * 0.5, r, 16); a.circ(x + dx * 50, y, r, 'EQUIP-HIDDEN'); }
      a.box(X0 + 200, YF - 30, Z0 + 40, X0 + 200 + W * 0.3, YF, Z1 - 40); a.box(cx + W * 0.08, YF - 30, Z0 + 60, cx + W * 0.08 + 220, YF, Z1 - 60); handleBar(a, X0 + 200 + W * 0.3 - 40, YF - 30, Z0 + 60, Math.max(50, Z1 - Z0 - 150));
      a.ell(cx - W * 0.12, cy, Z0 + (Z1 - Z0) * 0.5, 90, D * 0.18, (Z1 - Z0) * 0.3, 12, 6); a.ell(cx + W * 0.12, cy, Z0 + (Z1 - Z0) * 0.5, 90, D * 0.18, (Z1 - Z0) * 0.3, 12, 6); a.line(X0 + 100, cy, X1 - 100, cy, 'EQUIP-DETAIL');
      a.log('Added the casing, the access and filter doors, the four duct collars, the two fans and the controller box (plan and 3D).');
    } }),
  // ===================================================================== refrigeration
  fam({ cat: 'mechanical/equipment', title: 'Generic air-cooled refrigeration condenser',
    desc: (v) => `Flat-bank air-cooled condenser with ${v.fans} fans in a row on a coil frame, a header on the end, four support legs with a base rail and a fan motor on each fan.`,
    vs: [[2, 84], [4, 150], [6, 216], [8, 282]].map(([f, w]) => [`${f} fans`, w, 48, 54, 0, { fans: f }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a, zb = Z0 + 500, zt = Z1 - 100; a.outline();
      for (let i = 0; i <= Math.ceil(v.fans / 2); i++) { const x = X0 + 60 + (i * (W - 120)) / Math.ceil(v.fans / 2); for (const y of [YF + 60, YB - 60]) { a.box(x - 25, y - 25, Z0, x + 25, y + 25, zb); a.circ(x, y, 25, 'EQUIP-HIDDEN'); } }
      a.box(X0 + 20, YF + 20, zb, X1 - 20, YB - 20, zt); for (let x = X0 + 40; x < X1 - 40; x += 30) a.line(x, YF + 20, x, YB - 20, 'EQUIP-DETAIL');
      for (let i = 0; i < v.fans; i++) fanTop(a, X0 + ((i + 0.5) * W) / v.fans, cy, zt, Math.min(W / v.fans * 0.46, D * 0.4), 6);
      a.xcyl(X1 - 120, X1, cy - 80, zb + 120, 40, 10); a.xcyl(X1 - 120, X1, cy + 80, zb + 120, 40, 10); a.box(X0 + 20, YF + 20, zb - 40, X1 - 20, YF + 40, zb);
      a.log('Added the legs, the coil frame, a fan with its guard for each fan and the end header (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic parallel compressor rack',
    desc: (v) => `Parallel refrigeration rack with ${v.n} compressors in a row on a skid, a suction header and a discharge header above them, an oil separator, a receiver tank and a control cabinet.`,
    vs: [[3, 120], [5, 168], [7, 216]].map(([n, w]) => [`${n} compressors`, w, 40, 64, 0, { n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 100);
      const pw = (W - 880) / v.n;
      for (let i = 0; i < v.n; i++) { const x = X0 + 60 + pw * (i + 0.5); a.xcyl(x - pw * 0.4, x + pw * 0.4, cy, Z0 + 330, 190, 20); a.xcyl(x - pw * 0.4 - 40, x - pw * 0.4, cy, Z0 + 330, 210, 20); a.box(x - pw * 0.3, cy - 130, Z0 + 520, x + pw * 0.3, cy + 130, Z0 + 640); a.circ(x, cy, 190, 'EQUIP-DETAIL'); }
      a.xcyl(X0 + 40, X1 - 840, cy - 150, Z1 - 120, 55, 12); a.xcyl(X0 + 40, X1 - 840, cy + 150, Z1 - 260, 40, 12);
      a.cyl(X1 - 700, cy, Z0 + 100, Z1 - 100, 130, 16); a.ell(X1 - 700, cy, Z1 - 100, 130, 130, 60, 14, 5); a.cyl(X1 - 520, cy, Z0 + 100, Z0 + 900, 100, 16); a.box(X1 - 380, YF + 30, Z0 + 100, X1 - 30, YB - 30, Z1 - 80);
      a.circ(X1 - 700, cy, 130, 'EQUIP-DETAIL'); a.circ(X1 - 520, cy, 100, 'EQUIP-DETAIL'); a.rect(X1 - 380, YF + 30, X1 - 30, YB - 30, 'EQUIP-DETAIL');
      a.log('Added the skid, the compressors with their motors, the two headers, the oil separator, the receiver tank and the control cabinet (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic walk-in condensing unit',
    desc: (v) => `Outdoor condensing unit of ${v.hp} hp for a walk-in cooler: a louvered casing, a fan on top with a guard, a compressor access door, a receiver at one end and a base rail.`,
    vs: [['3 hp', 3, 36, 28, 30], ['7.5 hp', 7.5, 46, 32, 36]].map(([l, hp, w, d, h]) => [l, w, d, h, 0, { hp }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0 + 15, YF + 15, Z0 + 60, X1 - 15, YB - 15, Z1 - 100);
      louvers(a, X0 + 60, X1 - 240, YF + 15, Z0 + 140, Z1 - 160, 36); sideLouvers(a, X0 + 15, YF + 60, YB - 60, Z0 + 140, Z1 - 160, 36, -1); a.box(X1 - 220, YF - 10, Z0 + 120, X1 - 60, YF + 15, Z1 - 160);
      fanTop(a, X0 + W * 0.42, cy, Z1 - 100, Math.min(D * 0.36, W * 0.22), 8); a.cyl(X1 - 80, YB - 80, Z0 + 60, Z1 - 160, 50, 12);
      a.log('Added the base rail, the casing with louvers, the compressor door, the fan with its guard and the receiver (plan and 3D).');
    } }),
  // ===================================================================== heating, louvers, silencers, hydronics, exhaust, split systems
  fam({ cat: 'mechanical/equipment', title: 'Generic hanging unit heater',
    desc: (v) => `Hydronic unit heater with a ${v.fw} in square casing hung from two threaded rods: a coil casing, a round fan guard on the back, louvers on the front and two pipe stubs on the side.`,
    vs: [['18 in casing', 18, 18], ['30 in casing', 30, 30]].map(([l, w, h]) => [l, w, 14, h, 108, { fw: w }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF + 140, Z0, X1, YB, Z1 - 60); a.box(X0 + 10, YF, Z0 + 10, X1 - 10, YF + 140, Z1 - 70); louvers(a, X0 + 20, X1 - 20, YF, Z0 + 20, Z1 - 80, 30);
      a.cyl(cx, YB - 4, Z0 + 20, Z1 - 80, 2, 4); a.ycyl(YB - 30, YB, cx, (Z0 + Z1) / 2 - 30, (X1 - X0) * 0.34, 20); for (const x of [X0 + 40, X1 - 40]) a.tube([[x, cy, Z1 - 60], [x, cy, Z1]], [6, 6], 6);
      a.xcyl(X1, X1, cy, Z0 + 100, 1, 3); a.ycyl(YF + 150, YF + 260, X1 - 10, Z0 + 80, 14, 8); a.ycyl(YF + 150, YF + 260, X1 - 10, Z0 + 160, 14, 8); a.circ(cx, cy + 60, (X1 - X0) * 0.34, 'EQUIP-DETAIL');
      a.log('Added the coil casing, the front louvers, the round fan guard on the back, the pipe stubs and the two hanger rods (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic fixed blade wall louver',
    desc: (v) => `Fixed wall louver ${v.w} by ${v.h} in with a frame and angled blades, a bird screen behind and a 4 in deep section.`,
    vs: [['24 by 24 in', 24, 24], ['36 by 48 in', 36, 48], ['48 by 72 in', 48, 72]].map(([l, w, h]) => [l, w, 4, h, 60, { w, h }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.frame(X0, Z0, X1, Z1, YF, YB, 30);
      const n = Math.round((Z1 - Z0 - 60) / 55); for (let i = 0; i < n; i++) { const z = Z0 + 30 + ((Z1 - Z0 - 60) * i) / n; ext(a, [[YF + 4, z + 4], [YB - 2, z + 50], [YB - 2, z + 58], [YF + 4, z + 14]], X0 + 30, X1 - 30); }
      a.box(X0 + 30, YB - 6, Z0 + 30, X1 - 30, YB, Z1 - 30); for (let x = X0 + 60; x < X1 - 40; x += 80) a.line(x, YF, x, YB, 'EQUIP-DETAIL');
      a.log('Added the frame, the angled blades and the bird screen (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic splitter duct silencer',
    desc: (v) => `Rectangular duct silencer ${v.w} by ${v.h} in and ${v.l} in long with top and bottom shell plates, flanged ends and ${v.n} parallel baffles between the end flanges.`,
    vs: [['24 by 12 in, 36 in long', 24, 12, 36, 2], ['36 by 24 in, 60 in long', 36, 24, 60, 3], ['48 by 36 in, 72 in long', 48, 36, 72, 4]].map(([l, w, h, len, n]) => [l, len, w, h, 96, { w, h, l: len, n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 12); a.box(X0, YF, Z1 - 12, X1, YB, Z1);
      for (const x of [X0, X1 - 24]) { ring(a, x, YF - 20, x + 24, YB + 0, Z0, Z0 + 0.01, 1); a.box(x, YF, Z0, x + 24, YB, Z0 + 40); a.box(x, YF, Z1 - 40, x + 24, YB, Z1); a.box(x, YF, Z0, x + 24, YF + 40, Z1); a.box(x, YB - 40, Z0, x + 24, YB, Z1); }
      const bw = D / (2 * v.n + 1); for (let i = 0; i < v.n; i++) { const y = YF + bw * (2 * i + 1); a.box(X0 + 24, y, Z0 + 12, X1 - 24, y + bw, Z1 - 12); a.rect(X0 + 24, y, X1 - 24, y + bw, 'EQUIP-DETAIL'); }
      a.log('Added the top and bottom shell plates, the flanged ends and the parallel baffles (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic hydronic air separator',
    desc: (v) => `Vertical air separator for a ${v.p} in pipe: a tank with domed ends on a skirt, two flanged side connections at mid height, a vent on top and a drain at the bottom.`,
    vs: [['3 in', 3, 12, 30], ['6 in', 6, 20, 40]].map(([l, p, d, h]) => [l, d, d, h, 0, { p }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2, zm = (Z0 + Z1) / 2; a.circ(cx, cy, r); a.outline('EQUIP-HIDDEN');
      a.cyl(cx, cy, Z0, Z0 + 120, r * 0.6, 20); a.cyl(cx, cy, Z0 + 120, Z1 - 110, r * 0.72, 28); a.ell(cx, cy, Z1 - 110, r * 0.72, r * 0.72, 90, 22, 5); a.ell(cx, cy, Z0 + 120, r * 0.72, r * 0.72, 70, 22, 5);
      for (const d of [-1, 1]) { a.xcyl(Math.min(cx + d * r * 0.7, cx + d * r), Math.max(cx + d * r * 0.7, cx + d * r), cy, zm, r * 0.22, 14); a.xcyl(Math.min(cx + d * r * 0.93, cx + d * r), Math.max(cx + d * r * 0.93, cx + d * r), cy, zm, r * 0.3, 14); }
      a.cyl(cx, cy, Z1 - 30, Z1, 14, 8); a.cyl(cx, cy, Z0 - 0, Z0 + 20, 12, 6);
      a.circ(cx, cy, r * 0.72, 'EQUIP-DETAIL');
      a.log('Added the skirt, the shell with domed ends, the two flanged side connections, the vent on top and the drain (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic roof upblast exhaust fan',
    desc: (v) => `Rooftop upblast exhaust fan for a restroom or general exhaust of ${v.cfm} cfm: a curb cap, a round housing, a rain cap on the top and a disconnect switch on the side.`,
    vs: [['600 cfm', 600, 24], ['2,000 cfm', 2000, 34]].map(([l, c, w]) => [l, w, w, w * 0.9, 0, { cfm: l.replace(' cfm', '') }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) * 0.36; a.outline(); a.circ(cx, cy, r); a.box(X0, YF, Z0, X1, YB, Z0 + 150); a.cyl(cx, cy, Z0 + 150, Z0 + (Z1 - Z0) * 0.6, r, 24);
      a.cone(cx, cy, Z0 + (Z1 - Z0) * 0.6, Z1 - 40, r, r * 0.5, 24); a.cyl(cx, cy, Z1 - 40, Z1, r * 1.0, 24); a.circ(cx, cy, r * 0.5, 'EQUIP-DETAIL'); a.box(cx + r * 0.9, cy - 40, Z0 + 160, cx + r * 0.9 + 60, cy + 40, Z0 + 260);
      a.log('Added the curb cap, the round housing, the cone with its rain cap and the disconnect switch (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic ceiling cabinet exhaust fan',
    desc: (v) => `Ceiling exhaust fan of ${v.cfm} cfm: a square grille on a flange with a louvered face, a sheet-steel housing above with a blower, a round duct collar on top and two mounting brackets.`,
    vs: [['80 cfm', 80, 12, 8], ['250 cfm', 250, 20, 12]].map(([l, c, w, h]) => [l, w, w, h, 96, { cfm: c }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 12); a.box(X0 + 20, YF + 20, Z0 + 12, X1 - 20, YB - 20, Z0 + 30);
      for (let x = X0 + 40; x < X1 - 30; x += 36) { a.box(x, YF + 24, Z0 + 12, x + 10, YB - 24, Z0 + 30); a.line(x, YF + 24, x, YB - 24, 'EQUIP-DETAIL'); }
      a.box(X0 + 40, YF + 40, Z0 + 30, X1 - 40, YB - 40, Z1 - 40); a.cyl(cx, cy, Z1 - 70, Z1, Math.min((X1 - X0) * 0.25, 90), 14); a.ell(cx, cy, Z0 + 30 + (Z1 - Z0) * 0.4, (X1 - X0) * 0.2, (X1 - X0) * 0.2, (Z1 - Z0) * 0.25, 14, 6);
      for (const [x0, x1] of [[X0 + 10, X0 + 60], [X1 - 60, X1 - 10]]) a.box(x0, cy - 10, Z1 - 60, x1, cy + 10, Z1 - 40);
      a.log('Added the flange, the louvered grille face, the housing with its blower, the duct collar and the brackets (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic split system condensing unit',
    desc: (v) => `Outdoor condensing unit of ${v.tons} tons on a pad: a wrapped coil casing with louvered sides, a top fan with a guard, two refrigerant service valves with caps on one side and a disconnect box.`,
    vs: [['3 ton, top discharge', 3, 30, 30, 34], ['5 ton, top discharge', 5, 34, 34, 40]].map(([l, t, w, d, h]) => [l, w, d, h, 0, { tons: t }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0 - 0, YF, Z0, X1, YB, Z0 + 40); a.box(X0 + 10, YF + 10, Z0 + 40, X1 - 10, YB - 10, Z1 - 60);
      for (const y of [YF + 10, YB - 10]) louvers(a, X0 + 30, X1 - 30, y + (y < cy ? 0 : 6), Z0 + 100, Z1 - 120, 30);
      fanTop(a, cx, cy, Z1 - 60, Math.min((X1 - X0) * 0.4, 320), 8); a.xcyl(X1 - 10, X1, YF + 150, Z0 + 220, 18, 8); a.xcyl(X1 - 10, X1, YF + 150, Z0 + 320, 12, 8); a.box(X1 - 8, YB - 220, Z0 + 300, X1, YB - 100, Z0 + 460);
      a.log('Added the pad, the coil casing with its louvers, the fan with its guard, the service valves and the disconnect box (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic variable refrigerant flow outdoor unit',
    desc: (v) => `Outdoor VRF unit of ${v.hp} hp with ${v.f} top fan${v.f > 1 ? 's' : ''} and guards, coil faces on the long sides, a base with two rails, a service panel on the front and two refrigerant connections.`,
    vs: [['8 hp, 1 fan', 8, 1, 36, 30, 66], ['16 hp, 2 fans', 16, 2, 66, 30, 66]].map(([l, hp, f, w, d, h]) => [l, w, d, h, 0, { hp, f }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 80); a.box(X0 + 15, YF + 15, Z0 + 80, X1 - 15, YB - 15, Z1 - 70);
      for (const y of [YF + 15, YB - 15]) louvers(a, X0 + 40, X1 - 40, y + (y < cy ? 0 : 6), Z0 + 160, Z1 - 150, 30); a.box(X0 + 40, YF - 12, Z0 + 140, X0 + 260, YF + 15, Z0 + 400);
      for (let i = 0; i < v.f; i++) fanTop(a, X0 + ((i + 0.5) * W) / v.f, cy, Z1 - 70, Math.min(W / v.f * 0.4, D * 0.38), 8); a.xcyl(X1 - 15, X1, YB - 100, Z0 + 200, 20, 8); a.xcyl(X1 - 15, X1, YB - 100, Z0 + 300, 14, 8);
      a.log('Added the base rails, the casing with coil louvers, the front service panel, the top fans with guards and the refrigerant connections (plan and 3D).');
    } }),
  fam({ cat: 'mechanical/equipment', title: 'Generic wall fin-tube radiation cover',
    desc: (v) => `Wall fin-tube radiation cover ${v.l} in long: a sheet-steel enclosure with a slotted top, a front panel with a lower air opening and two end caps, over an element drawn as a long pipe with fins.`,
    vs: [['48 in', 48], ['96 in', 96]].map(([l, len]) => [l, len, 6, 8, 0, { l: len }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); a.box(X0, YB - 12, Z0, X1, YB, Z1); a.box(X0 + 12, YF, Z0 + 20, X1 - 12, YF + 12, Z1 - 20); a.box(X0, YF, Z0, X0 + 12, YB, Z1); a.box(X1 - 12, YF, Z0, X1, YB, Z1);
      for (let x = X0 + 40; x < X1 - 40; x += 20) a.box(x, YF + 24, Z1 - 12, x + 8, YB - 24, Z1); a.box(X0 + 12, YF + 12, Z1 - 12, X1 - 12, YF + 24, Z1);
      a.xcyl(X0 + 12, X1 - 12, YB - 50, Z0 + 70, 12, 8); for (let x = X0 + 30; x < X1 - 20; x += 14) a.box(x, YB - 90, Z0 + 40, x + 2, YB - 14, Z0 + 140); a.line(X0 + 12, YB - 50, X1 - 12, YB - 50, 'EQUIP-DETAIL');
      a.log('Added the back plate, the front panel, the end caps, the slotted top and the finned element inside (plan and 3D).');
    } }),
];

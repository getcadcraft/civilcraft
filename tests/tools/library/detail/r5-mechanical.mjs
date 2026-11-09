/* SPDX-License-Identifier: Apache-2.0 */
/** Round 5 mechanical (2026-11-03): hospital air handling, vacuum and medical air plants, clean steam, boilers and chillers; construction heaters, dehumidifiers, fans, compressors,
 *  scrubbers; mine ventilation fans, ducts, coolers, dust collectors and plant; hangar heaters and fans, aircraft preconditioned air and heating, hydraulic and fuel test-stand plant. */
import { fam, M } from './r4-kit.mjs';

const EQ = 'mechanical/equipment';
const R = (rows, z = 0) => rows.map(([l, w, d, h, p]) => [l, w, d, h, z, p || {}]);
const D2 = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// ---------------------------------------------------------------- shared drawing helpers (all millimetres)
/** Hinged service door on a casing face at y (front): panel, lift handle, outline in plan. */
const tk = (a) => Math.max(24, Math.max(a.W, a.H) * 0.011);
const door = (a, x0, x1, z0, z1, y, hand = 1) => {
  const t = tk(a); a.box(x0, y - t, z0, x1, y, z1); const hx = hand > 0 ? x1 - 60 : x0 + 60, zm = (z0 + z1) / 2;
  a.box(hx - 8, y - t * 1.9, zm - 80, hx + 8, y - t, zm + 80); a.rect(x0, y - t, x1, y, 'EQUIP-DETAIL');
};
const gauge = (a, x, y, z, r = 38) => { const t = tk(a) * 0.8; a.ycyl(y - t, y, x, z, r, 14); a.ycyl(y - t * 1.4, y - t, x, z, r * 0.55, 10); };
const lvF = (a, x0, x1, y, z0, z1, step = 64) => { const t = tk(a) * 0.7; for (let z = z0; z < z1 - 26; z += step) a.box(x0, y - t, z, x1, y, z + 24); a.rect(x0, y - t, x1, y, 'EQUIP-DETAIL'); };
const lvX = (a, x, y0, y1, z0, z1, step = 64, dir = -1) => { const t = tk(a) * 0.7; for (let z = z0; z < z1 - 26; z += step) a.box(Math.min(x, x + dir * t), y0, z, Math.max(x, x + dir * t), y1, z + 24); a.line(x, y0, x, y1, 'EQUIP-DETAIL'); };
const wheel = (a, x, y, r, w = 70, z0 = a.Z0) => { a.ycyl(y - w / 2, y + w / 2, x, z0 + r, r, 18); a.ycyl(y - w / 2 - 8, y + w / 2 + 8, x, z0 + r, r * 0.38, 10); };
const cast = (a, x, y, h) => { const r = h * 0.42; a.cyl(x, y, a.Z0 + r * 1.6, a.Z0 + h * 0.95, 11, 6); a.ycyl(y - 24, y + 24, x, a.Z0 + r, r, 14); a.ycyl(y - 30, y + 30, x, a.Z0 + r, r * 0.3, 8); };
const ringY = (a, cx, y, cz, r, t = 5, n = 26) => { const p = [], q = []; for (let i = 0; i <= n; i++) { const g = (i / n) * Math.PI * 2; p.push([cx + Math.cos(g) * r, y, cz + Math.sin(g) * r]); q.push(t); } a.tube(p, q, 5); };
/** Guard on a fan that faces the front (-Y): rings, spokes, hub. */
const guardY = (a, cx, y, cz, r, rings = 3, spokes = 10) => {
  for (let i = 1; i <= rings; i++) ringY(a, cx, y, cz, (r * i) / rings, 5);
  for (let i = 0; i < spokes; i++) { const g = (i / spokes) * Math.PI * 2; a.tube([[cx + Math.cos(g) * r * 0.12, y, cz + Math.sin(g) * r * 0.12], [cx + Math.cos(g) * r, y, cz + Math.sin(g) * r]], [4, 4], 4); }
  a.ycyl(y - 20, y + 5, cx, cz, r * 0.14, 12);
};
/** Fan with the axis up: ring, guard spokes and hub; top at z + 90. */
const fanTop = (a, cx, cy, z, r, spokes = 8) => {
  a.cyl(cx, cy, z, z + 60, r, 26); a.cyl(cx, cy, z + 60, z + 90, r * 0.16, 12);
  for (let i = 0; i < spokes; i++) { const g = (i / spokes) * Math.PI * 2; a.tube([[cx + Math.cos(g) * r * 0.14, cy + Math.sin(g) * r * 0.14, z + 70], [cx + Math.cos(g) * r * 0.97, cy + Math.sin(g) * r * 0.97, z + 62]], [5, 5], 4); a.line(cx, cy, cx + Math.cos(g) * r, cy + Math.sin(g) * r, 'EQUIP-DETAIL'); }
  a.circ(cx, cy, r); a.circ(cx, cy, r * 0.5, 'EQUIP-DETAIL');
};
const ladder = (a, x, y, z0, z1, w = 420) => { a.cyl(x - w / 2, y, z0, z1, 14, 6); a.cyl(x + w / 2, y, z0, z1, 14, 6); for (let z = z0 + 250; z < z1 - 100; z += 280) a.xcyl(x - w / 2, x + w / 2, y, z, 9, 6); };
const rail = (a, x0, y0, x1, y1, z, h = 1000, n = 4) => {
  for (let i = 0; i <= n; i++) { const t = i / n; a.cyl(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z, z + h, 14, 6); }
  a.tube([[x0, y0, z + h], [x1, y1, z + h]], [14, 14], 6); a.tube([[x0, y0, z + h * 0.5], [x1, y1, z + h * 0.5]], [10, 10], 6);
};
const skid = (a, x0, x1, y0, y1, z0, t = 110) => { a.box(x0, y0, z0, x0 + 90, y1, z0 + t); a.box(x1 - 90, y0, z0, x1, y1, z0 + t); for (let i = 0; i <= 3; i++) { const x = x0 + ((x1 - x0 - 70) * i) / 3; a.box(x, y0, z0, x + 70, y1, z0 + t - 30); } a.rect(x0, y0, x1, y1, 'EQUIP-HIDDEN'); };
const stack = (a, cx, cy, z0, z1, r) => { a.cyl(cx, cy, z0, z1, r, 16); a.cyl(cx, cy, z1, z1 + 30, r * 1.35, 16); a.circ(cx, cy, r, 'EQUIP-DETAIL'); };
const flangeX = (a, x, y, z, r, t = 24, dir = 1) => { a.xcyl(x, x + dir * t, y, z, r * 1.18, 18); };
const vessel = (a, x0, x1, y, z, r) => { a.xcyl(x0, x1, y, z, r, 24); a.ell(x0, y, z, r * 0.3, r, r, 8, 6); a.ell(x1, y, z, r * 0.3, r, r, 8, 6); };
const saddle = (a, x, y, z0, zc, r) => { a.box(x - 60, y - r * 0.8, z0, x + 60, y + r * 0.8, zc - r * 0.55); };
const tankV = (a, cx, cy, z0, z1, r) => { a.cyl(cx, cy, z0, z1, r, 24); a.ell(cx, cy, z1, r, r, r * 0.3, 18, 5); a.circ(cx, cy, r); };
/** Canopy-style hood: end plates and a sloped front, back plate and top. Convex profile extrusion along X. */
const ext = (a, pr, x0, x1) => {
  const n = pr.length, P = (x, p) => [x, p[0], p[1]];
  for (let i = 1; i < n - 1; i++) { a.t.push([P(x0, pr[0]), P(x0, pr[i + 1]), P(x0, pr[i])]); a.t.push([P(x1, pr[0]), P(x1, pr[i]), P(x1, pr[i + 1])]); }
  for (let i = 0; i < n; i++) { const p = pr[i], q = pr[(i + 1) % n]; a.t.push([P(x0, p), P(x0, q), P(x1, q)], [P(x0, p), P(x1, q), P(x1, p)]); }
  return a;
};
const hood = (a, lip, run, collarH) => {
  const { X0, X1, YF, YB, Z0, Z1 } = a, t = 22, zt = Z1 - collarH, yTop = YF + a.D * run; a.outline();
  const prof = [[YF, Z0], [YF, Z0 + lip], [yTop, zt], [YB, zt], [YB, Z0]]; ext(a, prof, X0, X0 + t); ext(a, prof, X1 - t, X1);
  ext(a, [[YF, Z0 + lip], [yTop, zt], [yTop, zt - t], [YF, Z0 + lip - t]], X0 + t, X1 - t);
  a.box(X0 + t, YF, Z0, X1 - t, YF + t, Z0 + lip); a.box(X0 + t, YB - t, Z0, X1 - t, YB, zt); a.box(X0 + t, yTop, zt - t, X1 - t, YB, zt);
  a.line(X0 + t, YF + t, X1 - t, YF + t); a.line(X0 + t, yTop, X1 - t, yTop, 'EQUIP-DETAIL');
};
const collarsTop = (a, n, r, y, z0, z1) => { for (let i = 0; i < n; i++) { const x = a.X0 + (a.W * (i + 0.5)) / n; a.cyl(x, y, z0, z1, r, 18); a.cyl(x, y, z0, z0 + 24, r + 22, 18); a.circ(x, y, r, 'EQUIP-DETAIL'); } };
/** Rectangular duct collar (box with flange) on top of a casing. */
const rectCollar = (a, x0, x1, y0, y1, z0, z1) => { a.box(x0, y0, z0, x1, y1, z1); a.box(x0 - 18, y0 - 18, z1 - 24, x1 + 18, y1 + 18, z1); a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); };
const lug = (a, x, y, z) => { a.box(x - 30, y - 12, z, x + 30, y + 12, z + 90); a.cyl(x, y, z + 90, z + 92, 1, 3); };
/** Compressor cabinet with louvers and gauge, used by medical-air and hangar plants. */
const pumpHead = (a, x, y, z, len, r) => { a.xcyl(x - len / 2, x + len / 2, y, z, r, 18); for (let i = 0; i < 6; i++) a.xcyl(x - len / 2 + 30 + i * (len - 60) / 6, x - len / 2 + 44 + i * (len - 60) / 6, y, z, r * 1.2, 16); };

export default [
  // ===================================================================== hospital and healthcare
  fam({ cat: EQ, title: 'Generic operating room air handling unit',
    desc: (v) => `Indoor air handling unit of ${v.cfm} cfm for an operating room suite: ${v.n} casing sections on base rails with hinged access doors, pressure gauges, a supply duct on top and a return duct at the back.`,
    vs: R([['2,000 cfm', 120, 44, 56, { cfm: '2,000', n: 4 }], ['4,000 cfm', 150, 50, 62, { cfm: '4,000', n: 4 }], ['6,000 cfm', 180, 56, 68, { cfm: '6,000', n: 5 }], ['8,000 cfm', 210, 62, 74, { cfm: '8,000', n: 5 }],
      ['12,000 cfm', 252, 72, 84, { cfm: '12,000', n: 6 }], ['16,000 cfm', 288, 80, 90, { cfm: '16,000', n: 6 }], ['20,000 cfm', 324, 84, 96, { cfm: '20,000', n: 7 }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a, yf = YF + 40, top = Z1 - 250, c0 = Z0 + 150; a.outline();
      a.box(X0, YF + 20, Z0, X1, YB - 20, c0); a.box(X0, yf, c0, X1, YB - 170, top); const sw = W / v.n;
      for (let i = 0; i < v.n; i++) { const x0 = X0 + i * sw; door(a, x0 + 60, x0 + sw - 60, c0 + 100, top - 100, yf, i % 2 ? -1 : 1); if (i % 2 === 0) gauge(a, x0 + sw / 2, yf, top - 60, 30); if (i) a.line(x0, YF + 40, x0, YB - 170); }
      rectCollar(a, X1 - sw * 0.85, X1 - sw * 0.15, yf + 250, YB - 260, top, Z1); rectCollar(a, X0 + sw * 0.2, X0 + sw * 0.8, YB - 170, YB, c0 + 300, top - 150);
      for (let i = 0; i < v.n + 1; i++) a.box(X0 + (W - 100) * i / v.n, yf, top, X0 + (W - 100) * i / v.n + 100, YB - 170, top + 30);
      a.log('Added the base rails, the casing sections with hinged doors and gauges, the supply duct on top and the return duct at the back (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic operating room ceiling supply plenum',
    desc: (v) => `Ceiling-hung supply plenum ${v.w} by ${v.d} in for an operating room: a sheet-metal box with ${v.nc} top duct collars, hanger rods, a perimeter frame and a perforated-style diffuser face made of slats.`,
    vs: [['48 by 48 in', 48, 48, 14, 100, { nc: 1 }], ['60 by 60 in', 60, 60, 14, 100, { nc: 2 }], ['72 by 72 in', 72, 72, 16, 100, { nc: 2 }], ['96 by 72 in', 96, 72, 16, 100, { nc: 3 }], ['120 by 72 in', 120, 72, 18, 100, { nc: 4 }]].map(([l, w, d, h, z, p]) => [l, w, d, h, z, { ...p, w, d }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); const zf = Z0 + 90;
      a.box(X0 + 20, YF + 20, zf, X1 - 20, YB - 20, Z1 - 90); a.box(X0, YF, Z0, X1, YF + 40, zf); a.box(X0, YB - 40, Z0, X1, YB, zf); a.box(X0, YF + 40, Z0, X0 + 40, YB - 40, zf); a.box(X1 - 40, YF + 40, Z0, X1, YB - 40, zf);
      for (let x = X0 + 70; x < X1 - 70; x += 55) a.box(x, YF + 50, Z0 + 20, x + 22, YB - 50, zf - 6);
      for (let y = YF + 70; y < YB - 70; y += 220) a.line(X0 + 40, y, X1 - 40, y, 'EQUIP-DETAIL');
      for (let i = 0; i < v.nc; i++) { const x = X0 + (W * (i + 0.5)) / v.nc; a.cyl(x, a.cy, Z1 - 90, Z1, 120, 18); a.circ(x, a.cy, 120, 'EQUIP-DETAIL'); }
      for (const [fx, fy] of [[0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]]) a.cyl(X0 + W * fx, YF + D * fy, Z1 - 90, Z1, 8, 6);
      a.log('Added the plenum box, the perimeter frame, the slatted diffuser face, the top duct collars and the hanger rods (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic ward isolation room portable air cleaner',
    desc: (v) => `Portable air cleaner for a ward isolation room, ${v.cfm} cfm class: a cabinet on four casters with a louvered intake, a filter door with a handle, a control panel, a top duct collar and a carrying handle.`,
    vs: R([['500 cfm class', 18, 18, 34, { cfm: 500 }], ['800 cfm class', 22, 22, 40, { cfm: 800 }], ['1,200 cfm class', 26, 24, 44, { cfm: '1,200' }], ['1,800 cfm class', 30, 26, 48, { cfm: '1,800' }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); const c0 = Z0 + 90, top = Z1 - 110;
      a.box(X0 + 10, YF + 30, c0, X1 - 10, YB - 10, top);
      for (const [x, y] of [[X0 + 50, YF + 70], [X1 - 50, YF + 70], [X0 + 50, YB - 50], [X1 - 50, YB - 50]]) cast(a, x, y, 90);
      lvF(a, X0 + 50, X1 - 50, YF + 30, c0 + 40, c0 + (top - c0) * 0.45, 40); door(a, X0 + 40, X1 - 40, c0 + (top - c0) * 0.5, top - 40, YF + 30);
      a.box(X1 - 140, YF + 14, top - 130, X1 - 40, YF + 30, top - 40); gauge(a, X0 + 100, YF + 30, top - 90, 20);
      a.cyl(cx, cy, top, Z1 - 40, Math.min(W, D) * 0.2, 18); a.cyl(cx, cy, Z1 - 40, Z1 - 20, Math.min(W, D) * 0.25, 18); a.circ(cx, cy, Math.min(W, D) * 0.2, 'EQUIP-DETAIL');
      a.tube([[X0 + 60, cy, top], [X0 + 60, cy, Z1], [X1 - 60, cy, Z1], [X1 - 60, cy, top]], [8, 8, 8, 8], 6);
      a.log('Added the cabinet on casters, the louvered intake, the filter door, the control panel, the top duct collar and the carrying handle (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hospital medical vacuum plant',
    desc: (v) => `Medical vacuum plant with ${v.n} pump sets on a common skid: each a motor with fins and a pump head, a suction header with valves, a horizontal receiver tank on saddles and a control cabinet with a door.`,
    vs: R([['duplex, small', 72, 40, 66, { n: 2 }], ['triplex, small', 96, 40, 66, { n: 3 }], ['quadruplex, small', 120, 44, 66, { n: 4 }], ['duplex, large', 96, 48, 78, { n: 2 }], ['triplex, large', 132, 48, 78, { n: 3 }], ['quadruplex, large', 168, 52, 78, { n: 4 }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); skid(a, X0, X1 - 380, YF, YB, Z0, 110); const pw = (W - 380) / v.n, r = Math.min(D * 0.14, 130);
      for (let i = 0; i < v.n; i++) { const x = X0 + pw * (i + 0.5); a.box(x - pw * 0.4, YF + D * 0.18, Z0 + 110, x + pw * 0.4, YF + D * 0.18 + 30, Z0 + 150); a.xcyl(x - pw * 0.4, x + pw * 0.1, YF + D * 0.32, Z0 + 110 + r + 40, r, 18); pumpHead(a, x - pw * 0.15, YF + D * 0.32, Z0 + 110 + r + 40, pw * 0.45, r * 1.05); a.box(x + pw * 0.12, YF + D * 0.32 - r, Z0 + 110, x + pw * 0.38, YF + D * 0.32 + r, Z0 + 110 + 2 * r + 80); a.cyl(x + pw * 0.25, YF + D * 0.32, Z0 + 110 + 2 * r + 80, Z1 - 330, 30, 10); a.rect(x - pw * 0.4, YF + D * 0.32 - r, x + pw * 0.38, YF + D * 0.32 + r, 'EQUIP-DETAIL'); }
      a.xcyl(X0 + 40, X1 - 380, YB - 120, Z1 - 330, 42, 12); for (let i = 0; i < v.n; i++) a.cyl(X0 + pw * (i + 0.75), YB - 120, Z1 - 380, Z1 - 290, 55, 10);
      const tr = Math.min(D * 0.28, 300); vessel(a, X1 - 740, X1 - 380, YB - tr - 40, Z0 + 110 + tr + 80, tr); saddle(a, X1 - 700, YB - tr - 40, Z0 + 110, Z0 + 110 + tr + 80, tr); saddle(a, X1 - 420, YB - tr - 40, Z0 + 110, Z0 + 110 + tr + 80, tr);
      a.box(X1 - 340, YF + 20, Z0, X1, YB - 20, Z1 - 100); door(a, X1 - 310, X1 - 30, Z0 + 250, Z1 - 250, YF + 20); gauge(a, X1 - 170, YF + 20, Z1 - 190, 28); a.line(X1 - 340, YF, X1 - 340, YB);
      a.log('Added the skid, the pump sets with motors and heads, the suction header with valves, the receiver tank on saddles and the control cabinet (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hospital medical air compressor plant',
    desc: (v) => `Medical air plant with ${v.n} compressor cabinets with louvers and gauges, ${v.tk} vertical receiver tank${v.tk > 1 ? 's' : ''}, a dryer cabinet, a discharge header and a control cabinet with a door.`,
    vs: R([['duplex, small', 84, 40, 72, { n: 2, tk: 1 }], ['triplex, small', 108, 40, 72, { n: 3, tk: 1 }], ['duplex, large', 108, 48, 84, { n: 2, tk: 2 }], ['triplex, large', 144, 48, 84, { n: 3, tk: 2 }], ['quadruplex, large', 180, 52, 84, { n: 4, tk: 2 }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); const cw = (W - 160 * 0 - 300 * v.tk - 500) / v.n, ch = Z1 - Z0 - 350;
      a.box(X0, YF, Z0, X1, YB, Z0 + 70);
      for (let i = 0; i < v.n; i++) { const x0 = X0 + 40 + i * cw; a.box(x0, YF + 30, Z0 + 70, x0 + cw - 40, YB - 480, Z0 + 70 + ch); lvF(a, x0 + 40, x0 + cw - 90, YF + 30, Z0 + 150, Z0 + 70 + ch * 0.6, 55); gauge(a, x0 + cw / 2 - 20, YF + 30, Z0 + 70 + ch * 0.8, 32); a.rect(x0, YF + 30, x0 + cw - 40, YB - 480, 'EQUIP-DETAIL'); }
      const dx = X0 + 40 + v.n * cw; a.box(dx, YF + 30, Z0 + 70, dx + 380, YB - 480, Z0 + 70 + ch * 0.8); door(a, dx + 40, dx + 340, Z0 + 150, Z0 + 70 + ch * 0.6, YF + 30);
      for (let k = 0; k < v.tk; k++) tankV(a, dx + 380 + 220 + k * 380, YB - 260, Z0 + 70, Z0 + 70 + ch * 1.05, 170);
      a.xcyl(X0 + 40, X1 - 80, YB - 80, Z1 - 120, 34, 12); for (let i = 0; i < v.n; i++) a.cyl(X0 + 40 + (i + 0.5) * cw, YB - 80, Z0 + 70 + ch, Z1 - 120, 24, 8);
      a.box(X1 - 340, YB - 460, Z0 + 70, X1 - 40, YB - 330, Z0 + 70 + ch * 0.7); gauge(a, X1 - 190, YB - 460, Z0 + 70 + ch * 0.5, 28);
      a.log('Added the compressor cabinets with louvers, the dryer cabinet, the vertical receiver tanks, the discharge header and the control cabinet (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic sterile processing room exhaust canopy',
    desc: (v) => `Sterile processing room canopy ${v.l} in wide that sits over the door end of a steam sterilizer: sloped front with a lip, drip trough, two light fixtures, a hinged panel and one round exhaust collar on top.`,
    vs: [['36 in wide', 36, 36, 26, 78, { l: 36 }], ['48 in wide', 48, 40, 26, 78, { l: 48 }], ['60 in wide', 60, 42, 28, 78, { l: 60 }], ['72 in wide', 72, 44, 30, 78, { l: 72 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a; hood(a, 110, 0.7, 150);
      a.box(X0 + 22, YF + 22, Z0 + 14, X1 - 22, YF + 62, Z0 + 46); a.rect(X0 + 22, YF + 22, X1 - 22, YF + 62, 'EQUIP-DETAIL');
      for (const f of [0.28, 0.72]) a.box(X0 + W * f - 60, YF + 110, Z0 + 100, X0 + W * f + 60, YF + 190, Z0 + 120);
      door(a, X0 + 100, X1 - 100, Z0 + 20, Z0 + 90, YF + 6); collarsTop(a, 1, 125, YB - 200, Z1 - 150, Z1);
      a.log('Added the end plates, the sloped front with its lip, the drip trough, the lights, the hinged panel and the exhaust collar (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hospital clean steam generator',
    desc: (v) => `Clean steam generator of ${v.kg} kg per hour: an insulated vertical vessel on a skid with a steam outlet flange, a sight glass, a relief pipe, a feed pump set and a control cabinet with a door.`,
    vs: R([['100 kg per hour', 48, 36, 78, { kg: 100 }], ['200 kg per hour', 60, 40, 90, { kg: 200 }], ['400 kg per hour', 72, 44, 102, { kg: 400 }], ['800 kg per hour', 90, 50, 114, { kg: 800 }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); skid(a, X0, X1, YF, YB, Z0, 90); const r = Math.min(D * 0.3, 330), vx = X0 + W * 0.3, vy = YB - r - 60;
      tankV(a, vx, vy, Z0 + 90, Z1 - 330, r); a.cyl(vx, vy, Z1 - 330, Z1 - 120, 70, 14); flangeX(a, vx - 130, vy, Z1 - 130, 70, 24); a.cyl(vx, vy, Z1 - 120, Z1 - 100, 100, 14);
      for (const g of [0.7, 1.9]) a.cyl(vx + Math.cos(g) * r * 0.5, vy + Math.sin(g) * r * 0.5, Z1 - 330 + r * 0.2, Z1 - 200, 22, 8);
      a.box(vx - r - 16, vy - 24, Z0 + 400, vx - r, vy + 24, Z0 + 1000); a.box(vx + r * 0.7, YF + 30, Z0 + 90, vx + r * 1.7, YF + 30 + r * 0.8, Z0 + 330); a.xcyl(vx + r * 0.8, vx + r * 1.7, YF + 30 + r * 0.4, Z0 + 160, 70, 14);
      a.box(X1 - 480, YF + 40, Z0 + 90, X1 - 20, YB - 120, Z1 - 180); door(a, X1 - 440, X1 - 60, Z0 + 250, Z1 - 330, YF + 40); a.line(X1 - 480, YF, X1 - 480, YB);
      a.tube([[vx + r * 0.1, vy, Z1 - 120], [vx + r * 0.1, vy, Z1 - 20], [vx + r * 2, vy, Z1 - 20]], [14, 14, 14], 8);
      a.log('Added the skid, the insulated vertical vessel, the steam outlet flange, the sight glass, the relief pipe, the feed pump and the control cabinet (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hospital central plant fire-tube boiler',
    desc: (v) => `Horizontal fire-tube steam boiler of ${v.hp} boiler horsepower on a skid: an insulated shell with a front head, a burner housing, a stack, a water column with a sight glass, a gauge and a safety valve pipe.`,
    vs: R([['100 hp', 150, 66, 84, { hp: 100 }], ['250 hp', 190, 78, 96, { hp: 250 }], ['500 hp', 230, 90, 108, { hp: 500 }], ['800 hp', 270, 102, 120, { hp: 800 }], ['1,000 hp', 300, 108, 126, { hp: '1,000' }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); skid(a, X0, X1, YF, YB, Z0, 120); const r = Math.min(D * 0.38, (Z1 - Z0 - 420) / 2), zc = Z0 + 150 + r;
      vessel(a, X0 + W * 0.04, X1 - W * 0.3, cy, zc, r); for (let i = 0; i < 4; i++) a.ycyl(cy - r * 0.2, cy + r * 0.2, X0 + W * 0.12 + i * (W * 0.54) / 3, zc - r - 2, r * 0.12, 10);
      a.box(X1 - W * 0.3, cy - r * 0.8, zc - r * 0.8, X1 - W * 0.17, cy + r * 0.8, zc + r * 0.8); a.xcyl(X1 - W * 0.17, X1 - W * 0.04, cy, zc, r * 0.5, 18); a.box(X1 - W * 0.2, cy - r * 0.35, zc - r * 0.2, X1 - W * 0.1, cy + r * 0.35, zc + r * 0.9); a.circ(X1 - W * 0.1, cy, r * 0.5, 'EQUIP-DETAIL');
      a.ycyl(cy - r - 40, cy - r, X1 - W * 0.3 - 10, zc + r * 0.3, r * 0.22, 16); stack(a, X0 + W * 0.12, cy, zc + r - 20, Z1 - 30, r * 0.17);
      a.cyl(X0 + W * 0.3, cy - r * 0.5, zc + r - 20, Z1 - 160, 24, 8); a.box(X0 + W * 0.3 - 18, cy - r * 0.55, Z1 - 320, X0 + W * 0.3 + 18, cy - r * 0.45, Z1 - 160); gauge(a, X0 + W * 0.5, YF + (D - 2 * r) / 2 - 10 > YF ? cy - r : cy - r, zc + r * 0.55, 34);
      a.line(X0 + W * 0.04, cy - r, X0 + W * 0.04, cy + r, 'EQUIP-DETAIL'); a.line(X1 - W * 0.3, cy - r, X1 - W * 0.3, cy + r, 'EQUIP-DETAIL');
      a.log('Added the skid, the insulated shell with its heads, the burner housing, the stack, the water column, the gauge and the safety valve pipe (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hospital campus air-cooled chiller',
    desc: (v) => `Outdoor air-cooled chiller with ${v.fans} condenser fans with guards, coil banks with louvers on both long sides, a compressor and control section with a hinged door, a base frame and four lifting lugs.`,
    vs: R([['2 fan', 108, 88, 88, { fans: 2 }], ['4 fan', 168, 88, 92, { fans: 4 }], ['6 fan', 228, 90, 96, { fans: 6 }], ['8 fan', 288, 92, 100, { fans: 8 }], ['10 fan', 348, 92, 104, { fans: 10 }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 260); const zt = Z1 - 100, per = Math.ceil(v.fans / 2), fw = (W - 600) / per;
      a.box(X0 + 20, YF + 60, Z0 + 260, X1 - 20, YB - 60, zt);
      lvF(a, X0 + 30, X1 - 600 + 560 - 20, YF + 60, Z0 + 300, zt - 60, 38); a.box(X0 + 30, YB - 60, Z0 + 300, X1 - 30, YB - 44, zt - 60); a.rect(X0 + 30, YB - 60, X1 - 30, YB - 44, 'EQUIP-DETAIL');
      door(a, X1 - 560, X1 - 80, Z0 + 340, zt - 120, YF + 60); gauge(a, X1 - 320, YF + 60, zt - 70, 26); a.line(X1 - 600, YF, X1 - 600, YB);
      for (let i = 0; i < v.fans; i++) { const col = Math.floor(i / 2); fanTop(a, X0 + 300 + fw * (col + 0.5) - 0 + 0, YF + D * (i % 2 ? 0.7 : 0.3), zt, Math.min(fw * 0.42, D * 0.19), 8); }
      for (const [x, y] of [[X0 + 80, YF + 40], [X1 - 80, YF + 40], [X0 + 80, YB - 40], [X1 - 80, YB - 40]]) lug(a, x, y, Z0);
      a.log('Added the base frame, the louvered coil banks, the condenser fans with guards, the compressor and control section with its door and the lifting lugs (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hospital rooftop energy recovery unit',
    desc: (v) => `Rooftop energy recovery unit of ${v.cfm} cfm on a curb: a casing with ${v.n} service doors per long side, an outside air hood with louvers, an exhaust hood, a supply fan end and a rectangular supply duct.`,
    vs: R([['3,000 cfm', 120, 56, 56, { cfm: '3,000', n: 2 }], ['6,000 cfm', 150, 66, 62, { cfm: '6,000', n: 3 }], ['10,000 cfm', 192, 78, 68, { cfm: '10,000', n: 3 }], ['16,000 cfm', 240, 90, 76, { cfm: '16,000', n: 4 }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 220); const bz = Z0 + 220, zt = Z1 - 220;
      a.box(X0 + 10, YF + 40, bz, X1 - 10, YB - 40, zt); const dw = (W - 700) / v.n;
      for (let i = 0; i < v.n; i++) door(a, X0 + 350 + i * dw + 40, X0 + 350 + (i + 1) * dw - 40, bz + 120, zt - 120, YF + 40, i % 2 ? -1 : 1);
      a.box(X0 - 0, YF + 120, bz + 100, X0 + 340, YF + D * 0.5, zt + 150); lvX(a, X0, YF + 140, YF + D * 0.5 - 20, bz + 140, zt + 110, 44, -1);
      a.box(X0, YB - D * 0.5, bz + 100, X0 + 340, YB - 120, zt + 150); lvX(a, X0, YB - D * 0.5 + 20, YB - 140, bz + 140, zt + 110, 44, -1);
      rectCollar(a, X1 - 500, X1 - 120, YF + D * 0.25, YB - D * 0.25, zt, Z1); a.line(X0 + 350, YF, X0 + 350, YB); a.line(X1 - 350, YF, X1 - 350, YB);
      a.log('Added the curb, the casing with service doors, the louvered outside air and exhaust hoods and the rectangular supply duct (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hospital laboratory exhaust fan',
    desc: (v) => `High-plume laboratory exhaust fan for a ${v.wh} in wheel: a curb, a windband with a motor cover, a bypass air louver band, a tall discharge nozzle with a cap and an access hinge.`,
    vs: [18, 24, 30, 36].map((wh, i) => [`${wh} in wheel`, 34 + i * 8, 34 + i * 8, 78 + i * 12, 0, { wh }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) * 0.34; a.outline(); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.5, 'EQUIP-DETAIL');
      a.box(X0, YF, Z0, X1, YB, Z0 + 170); a.box(X0 + 30, YF + 30, Z0 + 170, X1 - 30, YB - 30, Z0 + 230);
      a.cyl(cx, cy, Z0 + 230, Z0 + 230 + (Z1 - Z0) * 0.22, r, 28); const zb = Z0 + 230 + (Z1 - Z0) * 0.22;
      for (let z = zb + 30; z < zb + 220; z += 60) a.cyl(cx, cy, z, z + 28, r * 1.04, 28);
      a.cone(cx, cy, zb + 260, Z1 - 140, r * 0.9, r * 0.38, 24); a.cyl(cx, cy, Z1 - 140, Z1 - 20, r * 0.38, 20); a.cyl(cx, cy, Z1 - 20, Z1, r * 0.5, 20);
      a.box(cx + r * 0.95, cy - 14, Z0 + 240, cx + r * 1.2, cy + 14, Z0 + 330); a.box(X0 + 30, cy - 70, Z0 + 230, X0 + 90, cy + 70, Z0 + 420);
      a.log('Added the curb, the windband with its band of louvers, the tall discharge nozzle with its cap, the motor cover and the hinge (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic pharmacy clean room fan filter module',
    desc: (v) => `Ceiling fan filter module ${v.w} by ${v.d} in for a pharmacy clean room: a sheet-metal housing with a top collar, a motor cap, a perimeter frame and a slatted discharge face with hanger rods.`,
    vs: [['24 by 24 in', 24, 24, 14, 100, {}], ['24 by 48 in', 24, 48, 14, 100, {}], ['36 by 36 in', 36, 36, 16, 100, {}], ['48 by 48 in', 48, 48, 18, 100, {}]],
    build: (a) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); const zf = Z0 + 70;
      a.box(X0 + 14, YF + 14, zf, X1 - 14, YB - 14, Z1 - 60); a.box(X0, YF, Z0, X1, YF + 30, zf); a.box(X0, YB - 30, Z0, X1, YB, zf); a.box(X0, YF + 30, Z0, X0 + 30, YB - 30, zf); a.box(X1 - 30, YF + 30, Z0, X1, YB - 30, zf);
      for (let x = X0 + 50; x < X1 - 50; x += 40) a.box(x, YF + 40, Z0 + 16, x + 16, YB - 40, zf - 4);
      a.cyl(cx, cy, Z1 - 60, Z1 - 20, Math.min(X1 - X0, YB - YF) * 0.22, 16); a.cyl(cx, cy, Z1 - 20, Z1, Math.min(X1 - X0, YB - YF) * 0.1, 12); a.circ(cx, cy, Math.min(X1 - X0, YB - YF) * 0.22, 'EQUIP-DETAIL');
      for (const [fx, fy] of [[0.12, 0.12], [0.88, 0.12], [0.12, 0.88], [0.88, 0.88]]) a.cyl(X0 + (X1 - X0) * fx, YF + (YB - YF) * fy, Z1 - 60, Z1, 6, 5);
      a.log('Added the housing, the perimeter frame, the slatted discharge face, the top collar, the motor cap and the hanger rods (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hospital hot water storage tank',
    desc: (v) => `Insulated vertical hot water storage tank of ${v.gal} gallons on a leg ring with a side manway, nozzle stubs with flanges, a temperature gauge, a relief pipe and a top vent.`,
    vs: [['500 gallon', 36, 36, 84, 0, { gal: 500 }], ['1,000 gallon', 48, 48, 96, 0, { gal: '1,000' }], ['2,000 gallon', 60, 60, 114, 0, { gal: '2,000' }], ['3,000 gallon', 72, 72, 120, 0, { gal: '3,000' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2 - 175; a.outline(); a.circ(cx, cy, r * 0.5, 'EQUIP-DETAIL');
      for (let i = 0; i < 4; i++) { const g = (i / 4) * Math.PI * 2 + 0.785; a.cyl(cx + Math.cos(g) * r * 0.8, cy + Math.sin(g) * r * 0.8, Z0, Z0 + 200, 40, 8); }
      tankV(a, cx, cy, Z0 + 200, Z1 - 260, r); a.cyl(cx, cy, Z1 - 160, Z1, 36, 10);
      a.ycyl(YF, YF + 10, cx, Z0 + 700, r * 0.34, 18); a.ycyl(YF + 10, YF + 70, cx, Z0 + 700, r * 0.3, 18);
      for (const [z, s] of [[Z0 + 400, -1], [Z1 - 460, 1], [Z0 + 1100, 1]]) { a.xcyl(cx + s * r, cx + s * (r + 130), cy + r * 0.2 * s, z, 42, 14); a.xcyl(cx + s * (r + 130), cx + s * (r + 150), cy + r * 0.2 * s, z, 62, 14); }
      gauge(a, cx - r * 0.55, YF + (cy - YF - r * 0.84), Z0 + 1500 < Z1 - 400 ? Z0 + 1500 : Z1 - 500, 30);
      a.tube([[cx + r * 0.5, cy, Z1 - 290], [cx + r * 0.5, cy, Z1 - 60], [cx + r * 0.25, cy, Z1 - 60]], [14, 14, 14], 8);
      a.log('Added the leg ring, the insulated vertical tank, the side manway, the flanged nozzle stubs, the gauge, the relief pipe and the top vent (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hospital cold room condensing unit',
    desc: (v) => `Outdoor condensing unit for a hospital cold room, ${v.hp} hp class: a coil with louvers, ${v.fans} horizontal fan${v.fans > 1 ? 's' : ''} with guards on the front, a compressor housing with a door, a liquid receiver and a base frame.`,
    vs: [['5 hp class', 40, 24, 36, 0, { hp: 5, fans: 1 }], ['10 hp class', 56, 26, 40, 0, { hp: 10, fans: 1 }], ['20 hp class', 72, 30, 44, 0, { hp: 20, fans: 2 }], ['40 hp class', 108, 34, 52, 0, { hp: 40, fans: 3 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); a.box(X0, YF + 20, Z0, X1, YB - 20, Z0 + 120); const zt = Z1 - 20;
      a.box(X0 + 10, YF + 70, Z0 + 120, X1 - W * 0.28, YB - 20, zt); lvX(a, X0 + 10, YF + 90, YB - 40, Z0 + 150, zt - 40, 46, -1);
      for (let i = 0; i < v.fans; i++) guardY(a, X0 + ((W * 0.72) * (i + 0.5)) / v.fans, YF + 70, (Z0 + 120 + zt) / 2, Math.min((W * 0.72) / v.fans * 0.42, (zt - Z0 - 120) * 0.42), 2, 8);
      a.box(X1 - W * 0.28, YF + 30, Z0 + 120, X1 - 10, YB - 20, zt - 60); door(a, X1 - W * 0.28 + 30, X1 - 40, Z0 + 190, zt - 160, YF + 30);
      tankV(a, X1 - W * 0.12, YB - 120, Z0 + 120, Z0 + 120 + 420, 70); a.line(X1 - W * 0.28, YF, X1 - W * 0.28, YB);
      a.log('Added the base frame, the louvered coil, the front fans with guards, the compressor housing with its door and the liquid receiver (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic ward isolation anteroom inline filter housing',
    desc: (v) => `Inline filter housing for an isolation anteroom exhaust: a ${v.l} in long rectangular box with duct flanges on both ends, a hinged filter door, a pressure gauge, a drain stub and ceiling hanger channels.`,
    vs: [['30 in long', 30, 20, 20, 96, { l: 30 }], ['40 in long', 40, 24, 24, 96, { l: 40 }], ['50 in long', 50, 28, 28, 96, { l: 50 }], ['60 in long', 60, 32, 32, 96, { l: 60 }]],
    build: (a) => {
      const { X0, X1, YF, YB, Z0, Z1, cy } = a; a.outline(); const zc = (Z0 + Z1) / 2;
      a.box(X0 + 70, YF + 20, Z0 + 20, X1 - 70, YB - 20, Z1 - 20); a.box(X0, cy - (YB - YF) * 0.3, zc - (Z1 - Z0) * 0.3, X0 + 70, cy + (YB - YF) * 0.3, zc + (Z1 - Z0) * 0.3); a.box(X1 - 70, cy - (YB - YF) * 0.3, zc - (Z1 - Z0) * 0.3, X1, cy + (YB - YF) * 0.3, zc + (Z1 - Z0) * 0.3);
      door(a, X0 + 140, X1 - 140, Z0 + 50, Z1 - 50, YF + 20); gauge(a, X1 - 110, YF + 20, Z1 - 70, 20);
      a.cyl(X0 + 140, cy, Z0, Z0 + 20, 12, 6); for (const x of [X0 + 120, X1 - 120]) { a.box(x - 20, YF + 40, Z1 - 20, x + 20, YB - 40, Z1); }
      a.log('Added the housing box, the duct flanges on both ends, the hinged filter door, the pressure gauge, the drain stub and the hanger channels (plan and 3D).');
    } }),
  // ===================================================================== construction sites
  fam({ cat: EQ, title: 'Generic construction site indirect-fired heater',
    desc: (v) => `Portable indirect-fired site heater of ${v.k} kBtu per hour: a steel cabinet with a louvered burner section and access door, a blower end with a round discharge collar, an exhaust stack, a control panel, a handle and two wheels.`,
    vs: R([['125 kBtu per hour', 60, 26, 40, { k: 125 }], ['250 kBtu per hour', 72, 30, 46, { k: 250 }], ['400 kBtu per hour', 84, 34, 52, { k: 400 }], ['600 kBtu per hour', 96, 38, 56, { k: 600 }], ['1,000 kBtu per hour', 118, 44, 62, { k: '1,000' }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); const wr = (Z1 - Z0) * 0.2, zb = Z0 + wr * 1.3, zt = Z1 - (Z1 - Z0) * 0.2, zc = (zb + zt) / 2;
      a.box(X0 + W * 0.08, YF + 70, zb, X1 - W * 0.12, YB - 20, zt); lvF(a, X0 + W * 0.12, X0 + W * 0.45, YF + 70, zb + 40, zt - 40, 46); door(a, X0 + W * 0.5, X1 - W * 0.17, zb + 60, zt - 60, YF + 70); a.line(X0 + W * 0.47, YF, X0 + W * 0.47, YB);
      a.box(X1 - W * 0.12, cy - D * 0.3, zc - (zt - zb) * 0.35, X1 - W * 0.06, cy + D * 0.3, zc + (zt - zb) * 0.35); a.xcyl(X1 - W * 0.06, X1 - 20, cy, zc, D * 0.24, 18); a.xcyl(X1 - 20, X1, cy, zc, D * 0.28, 18); a.circ(X1 - W * 0.03, cy, D * 0.24, 'EQUIP-DETAIL');
      stack(a, X0 + W * 0.2, cy, zt, Z1 - 20, 80); wheel(a, X0 + W * 0.18, YF + 50, wr, 60); wheel(a, X0 + W * 0.18, YB - 50, wr, 60);
      a.box(X1 - W * 0.2, YF + 50, Z0, X1 - W * 0.15, YF + 90, zb); a.box(X1 - W * 0.2, YB - 50, Z0, X1 - W * 0.15, YB - 20, zb);
      a.box(X0 + W * 0.3, YF + 52, zt - 190, X0 + W * 0.3 + 230, YF + 70, zt - 30); gauge(a, X0 + W * 0.3 + 70, YF + 52, zt - 110, 22);
      a.tube([[X0 + W * 0.08, cy - D * 0.2, zt - 50], [X0, cy - D * 0.2, zt - 120], [X0, cy + D * 0.2, zt - 120], [X0 + W * 0.08, cy + D * 0.2, zt - 50]], [10, 10, 10, 10], 6);
      a.log('Added the cabinet with its louvers and access door, the discharge collar, the stack, the control panel, the handle and the wheels (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic construction site forced-air torpedo heater',
    desc: (v) => `Direct-fired forced-air heater of ${v.k} kBtu per hour: a round barrel with a front outlet ring and guard, a rear air inlet with a guard, a fuel hose and regulator, a top control box, a carry handle and a leg frame${v.wh ? ' with two wheels' : ''}.`,
    vs: [['75 kBtu per hour', 14, 30, 22, 0, { k: 75, wh: 0 }], ['125 kBtu per hour', 16, 34, 26, 0, { k: 125, wh: 0 }], ['200 kBtu per hour', 18, 40, 28, 0, { k: 200, wh: 0 }], ['400 kBtu per hour, wheeled', 26, 52, 38, 0, { k: 400, wh: 1 }], ['800 kBtu per hour, wheeled', 32, 66, 46, 0, { k: 800, wh: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline(); const r = W * 0.34, zc = Z0 + (Z1 - Z0) * 0.55;
      a.ycyl(YF + 40, YB - 60, cx, zc, r, 26); a.ycyl(YF + 10, YF + 40, cx, zc, r * 1.08, 26); a.ycyl(YB - 60, YB - 10, cx, zc, r * 0.8, 22); a.circ(cx, YF + D * 0.5, r, 'EQUIP-DETAIL');
      guardY(a, cx, YF + 8, zc, r * 0.95, 3, 8); a.ycyl(YB - 10, YB, cx, zc, r * 0.8, 18); a.line(X0 + W * 0.14, YF + 40, X1 - W * 0.14, YF + 40, 'EQUIP-DETAIL');
      a.box(cx - 140, YB - 300, zc + r, cx + 140, YB - 120, zc + r + 120); a.tube([[cx - r * 0.7, YB - 200, zc + r + 120], [cx - r * 0.7, YB - 200, Z1 - 10], [cx + r * 0.7, YB - 200, Z1 - 10], [cx + r * 0.7, YB - 200, zc + r + 120]], [9, 9, 9, 9], 6);
      a.tube([[cx + r * 0.3, YB - 60, zc - r * 0.3], [cx + r * 0.6, YB, zc - r * 0.6], [cx + r * 0.8, YB - 10, Z0 + 80]], [12, 12, 12], 6);
      if (v.wh) { wheel(a, cx - r * 1.12 - 5, YB - 160, (Z1 - Z0) * 0.14, 50); wheel(a, cx + r * 1.12 + 5, YB - 160, (Z1 - Z0) * 0.14, 50); a.box(cx - r * 1.2, YB - 190, Z0 + 20, cx + r * 1.2, YB - 150, Z0 + 60); }
      a.box(cx - r * 0.9, YF + 60, Z0, cx - r * 0.7, YB - 100, zc - r * 0.4); a.box(cx + r * 0.7, YF + 60, Z0, cx + r * 0.9, YB - 100, zc - r * 0.4); a.box(cx - r * 0.9, YF + 60, Z0, cx + r * 0.9, YF + 90, Z0 + 40);
      a.log('Added the barrel with its outlet ring and guard, the rear inlet guard, the fuel hose, the control box, the carry handle and the leg frame (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic construction site dehumidifier',
    desc: (v) => `Portable site dehumidifier, ${v.cl}: a rugged casing with a louvered air intake, a control panel, ${v.ports} duct port${v.ports > 1 ? 's' : ''} on top, a drain hose stub, a carry handle and wheels with feet.`,
    vs: R([['70 pint class', 17, 14, 26, { cl: '70 pint class', ports: 0 }], ['130 pint class', 22, 17, 32, { cl: '130 pint class', ports: 0 }], ['desiccant, 600 cfm', 30, 22, 36, { cl: 'desiccant type, 600 cfm', ports: 2 }], ['desiccant, 1,200 cfm', 38, 26, 42, { cl: 'desiccant type, 1,200 cfm', ports: 2 }], ['desiccant, 3,000 cfm', 52, 34, 54, { cl: 'desiccant type, 3,000 cfm', ports: 3 }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); const wr = (Z1 - Z0) * 0.1, zb = Z0 + wr * 1.2, zt = Z1 - 60;
      a.box(X0 + 20, YF + 50, zb, X1 - 20, YB - 20, zt); lvF(a, X0 + W * 0.1, X1 - W * 0.1, YF + 50, zb + 40, zb + (zt - zb) * 0.55, 42); a.box(X0 + W * 0.15, YF + 20, zt - (zt - zb) * 0.3, X1 - W * 0.15, YF + 50, zt - 30); gauge(a, X1 - W * 0.3, YF + 20, zt - (zt - zb) * 0.15, 20);
      for (let i = 0; i < v.ports; i++) { const x = X0 + (W * (i + 0.5)) / v.ports; a.cyl(x, cy, zt, zt + 55, Math.min(D * 0.22, W / v.ports * 0.3), 16); a.circ(x, cy, Math.min(D * 0.22, W / v.ports * 0.3), 'EQUIP-DETAIL'); }
      a.tube([[X0 + W * 0.2, cy, zt], [X0 + W * 0.2, cy, Z1], [X1 - W * 0.2, cy, Z1], [X1 - W * 0.2, cy, zt]], [10, 10, 10, 10], 6);
      wheel(a, X0 + W * 0.15, YB - 60, wr, 50); wheel(a, X1 - W * 0.15, YB - 60, wr, 50); a.box(X0 + W * 0.1, YF + 60, Z0, X0 + W * 0.1 + 50, YF + 100, zb); a.box(X1 - W * 0.1 - 50, YF + 60, Z0, X1 - W * 0.1, YF + 100, zb);
      a.tube([[X0 + 40, YB - 30, zb + 80], [X0 - 0, YB - 20, zb + 20], [X0 + 90, YB - 10, Z0 + 10]], [8, 8, 8], 6);
      a.log('Added the casing with its louvered intake, the control panel, the duct ports, the handle, the drain stub, the wheels and the feet (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic scaffold portable axial fan',
    desc: (v) => `Portable axial blower fan with a ${v.dia} in shroud on a tilting yoke: a ring shroud, a front guard with rings and spokes, a motor and hub, a floor frame with two feet and a handle.`,
    vs: [[12, 16, 14, 22], [16, 20, 16, 28], [20, 24, 18, 32], [24, 28, 20, 38], [30, 34, 22, 44]].map(([dia, w, d, h]) => [`${dia} in diameter`, w, d, h, 0, { dia }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline(); const r = W * 0.42, zc = Z0 + (Z1 - Z0) * 0.55;
      a.ycyl(YF + 120, YF + 120 + D * 0.38, cx, zc, r, 30); ringY(a, cx, YF + 120 - 4, zc, r * 1.02, 8); guardY(a, cx, YF + 110, zc, r, 4, 12); a.ycyl(YF + 120 + D * 0.38, YB - 30, cx, zc, r * 0.4, 16);
      a.box(cx - r * 1.1, YF + 120 + D * 0.12, zc - 20, cx - r * 1.1 + 36, YF + 120 + D * 0.24, zc + 20); a.box(cx + r * 1.1 - 36, YF + 120 + D * 0.12, zc - 20, cx + r * 1.1, YF + 120 + D * 0.24, zc + 20);
      for (const s of [-1, 1]) { a.box(cx + s * r * 1.1 - (s > 0 ? 36 : 0), YF + 120 + D * 0.12, Z0 + 60, cx + s * r * 1.1 + (s > 0 ? 0 : 36), YF + 120 + D * 0.24, zc); a.box(cx + s * r * 1.1 - 40, YF + 40, Z0, cx + s * r * 1.1 + 40, YB - 40, Z0 + 60); }
      a.tube([[cx - r * 0.6, YF + 120 + D * 0.2, zc + r], [cx - r * 0.6, YF + 120 + D * 0.2, Z1], [cx + r * 0.6, YF + 120 + D * 0.2, Z1], [cx + r * 0.6, YF + 120 + D * 0.2, zc + r]], [9, 9, 9, 9], 6);
      a.circ(cx, YF + 120 + D * 0.19, r, 'EQUIP-DETAIL'); a.line(X0, YF + 120, X1, YF + 120, 'EQUIP-DETAIL');
      a.log('Added the ring shroud with its front guard, the motor and hub, the tilting yoke, the floor frame with feet and the handle (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic construction site towable air compressor',
    desc: (v) => `Towable diesel-driven site air compressor of ${v.cfm} cfm on a single axle: a canopy with side service doors and louvers, a radiator louver end, an exhaust stack, a drawbar with a coupler eye, fenders, wheels, a jack stand and a lifting eye.`,
    vs: [['185 cfm', 138, 60, 66], ['375 cfm', 168, 66, 74], ['600 cfm', 198, 72, 82], ['900 cfm', 228, 80, 90], ['1,300 cfm', 252, 90, 98], ['1,600 cfm', 276, 94, 104]].map(([l, w, d, h]) => [l, w, d, h, 0, { cfm: l.replace(' cfm', '') }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); const wr = (Z1 - Z0) * 0.21, zb = Z0 + wr * 1.45, zt = Z1 - 150, bx0 = X0 + W * 0.17;
      a.box(bx0 - 0, YF + 60, zb - 100, X1 - 20, YB - 60, zb); a.box(bx0, YF + 60, zb, X1 - 20, YB - 60, zt); a.box(bx0 + 20, YF + 60, zt, X1 - 40, YB - 60, zt + 40);
      door(a, bx0 + W * 0.06, bx0 + W * 0.3, zb + 80, zt - 80, YF + 60); door(a, bx0 + W * 0.34, bx0 + W * 0.62, zb + 80, zt - 80, YF + 60, -1); lvF(a, bx0 + W * 0.66, X1 - 80, YF + 60, zb + 100, zt - 80, 46);
      a.box(X1 - 20, YF + 140, zb + 100, X1, YB - 140, zt - 100); lvX(a, X1 - 20, YF + 160, YB - 160, zb + 120, zt - 120, 44, 1);
      stack(a, bx0 + W * 0.2, cy, zt + 40, Z1 - 30, 85); a.box(bx0 + W * 0.38, cy - 40, zt + 40, bx0 + W * 0.38 + 100, cy + 40, Z1 - 10);
      const ax = bx0 + W * 0.45; for (const y of [YF + 20, YB - 20]) { wheel(a, ax, y, wr, 110); a.box(ax - wr * 1.25, y - 60, Z0 + wr * 2 + 15, ax + wr * 1.25, y + 60, Z0 + wr * 2 + 45); }
      a.xcyl(ax, ax, cy, Z0 + wr, 1, 3); a.ycyl(YF + 20, YB - 20, ax, Z0 + wr, 30, 10);
      a.box(X0, cy - 50, zb - 160, bx0, cy + 50, zb - 60); a.cyl(X0 + 60, cy, zb - 60, zb - 10, 70, 14); a.circ(X0 + 60, cy, 70, 'EQUIP-DETAIL'); a.line(X0, cy, bx0, cy, 'EQUIP-DETAIL');
      a.cyl(X0 + W * 0.1, cy + 120, Z0, zb - 160, 22, 8); a.box(X0 + W * 0.1 - 90, cy + 70, Z0, X0 + W * 0.1 + 90, cy + 170, Z0 + 20); lug(a, bx0 + W * 0.2, cy, zt + 40);
      a.log('Added the canopy with service doors and louvers, the radiator louver end, the stack, the drawbar with its coupler, the fenders and wheels, the jack stand and the lifting eye (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic construction site wheelbarrow air compressor',
    desc: (v) => `Portable site air compressor with a ${v.gal} gallon horizontal tank on two wheels: a pump and motor on top with a belt guard, a pressure gauge, an outlet valve, a drain valve, a frame with a handle and a rubber foot.`,
    vs: [['8 gallon', 26, 14, 28, 0, { gal: 8 }], ['20 gallon', 34, 16, 32, 0, { gal: 20 }], ['30 gallon', 42, 18, 36, 0, { gal: 30 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); const r = D * 0.3, wr = (Z1 - Z0) * 0.22, zc = Z0 + wr * 1.1 + r * 0.9;
      vessel(a, X0 + W * 0.16, X1 - W * 0.1, cy, zc, r); wheel(a, X0 + W * 0.2, YF + 40, wr, 36); wheel(a, X0 + W * 0.2, YB - 40, wr, 36); a.ycyl(YF + 40, YB - 40, X0 + W * 0.2, Z0 + wr, 12, 8);
      a.box(X1 - W * 0.16, cy - D * 0.3, Z0, X1 - W * 0.08, cy + D * 0.3, zc - r * 0.85); a.tube([[X0 + W * 0.2, cy - D * 0.3, zc - r * 0.3], [X0, cy - D * 0.3, Z1 - 60], [X0, cy + D * 0.3, Z1 - 60], [X0 + W * 0.2, cy + D * 0.3, zc - r * 0.3]], [10, 10, 10, 10], 6);
      a.cyl(X0 + W * 0.5, cy, zc + r, zc + r + 120, 70, 14); a.box(X0 + W * 0.38, cy - 60, zc + r + 120, X0 + W * 0.62, cy + 60, Z1 - 30); a.xcyl(X0 + W * 0.62, X0 + W * 0.78, cy, zc + r + 140, 55, 14); a.box(X0 + W * 0.3, cy - 60, zc + r + 20, X0 + W * 0.36, cy + 60, Z1 - 50);
      gauge(a, X1 - W * 0.3, YF + D * 0.2, zc + r + 10, 18); a.cyl(X1 - W * 0.2, cy, zc + r, zc + r + 60, 14, 8); a.cyl(a.cx, cy, zc - r - 30, zc - r, 10, 6);
      a.log('Added the horizontal tank, the two wheels, the pump and motor with its belt guard, the gauge, the valves, the handle and the foot (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic construction site evaporative cooler',
    desc: (v) => `Portable evaporative cooler of ${v.cfm} cfm: a louvered cabinet with wet-pad side panels, a top fan with a guard, a water tank with a fill port, a control panel and four casters.`,
    vs: R([['2,000 cfm', 24, 20, 40, { cfm: '2,000' }], ['4,000 cfm', 30, 24, 48, { cfm: '4,000' }], ['8,000 cfm', 38, 30, 56, { cfm: '8,000' }], ['15,000 cfm', 52, 40, 68, { cfm: '15,000' }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); const c0 = Z0 + 110, zt = Z1 - 120;
      a.box(X0 + 10, YF + 30, c0, X1 - 10, YB - 10, c0 + 150); a.box(X0 + 10, YF + 30, c0 + 150, X1 - 10, YB - 10, zt); lvF(a, X0 + 50, X1 - 50, YF + 30, c0 + 200, zt - 60, 44); lvX(a, X0 + 10, YF + 60, YB - 30, c0 + 200, zt - 60, 44, -1); lvX(a, X1 - 10, YF + 60, YB - 30, c0 + 200, zt - 60, 44, 1);
      fanTop(a, cx, cy, zt, Math.min(W, D) * 0.4); a.box(X1 - 190, YF + 12, c0 + 20, X1 - 50, YF + 30, c0 + 130); a.cyl(X0 + 90, YF + 90, zt, zt + 25, 28, 10);
      for (const [x, y] of [[X0 + 60, YF + 70], [X1 - 60, YF + 70], [X0 + 60, YB - 40], [X1 - 60, YB - 40]]) cast(a, x, y, 110);
      a.log('Added the louvered cabinet with its wet-pad panels, the top fan with its guard, the water tank, the control panel and the casters (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic construction site portable spot cooler',
    desc: (v) => `Portable air-conditioning spot cooler of ${v.tons} tons: a cabinet with a front intake grille, ${v.ports} flexible duct outlet${v.ports > 1 ? 's' : ''} with collars on top, a condensate drain, a control panel and a handle on four casters.`,
    vs: [['1 ton', 18, 16, 30, 0, { tons: 1, ports: 1 }], ['2 ton', 22, 20, 38, 0, { tons: 2, ports: 2 }], ['3 ton', 26, 22, 44, 0, { tons: 3, ports: 2 }], ['5 ton', 34, 26, 52, 0, { tons: 5, ports: 3 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); const c0 = Z0 + 90, zt = Z1 - 130;
      a.box(X0 + 10, YF + 30, c0, X1 - 10, YB - 10, zt); lvF(a, X0 + 40, X1 - 40, YF + 30, c0 + 40, c0 + (zt - c0) * 0.5, 40); door(a, X0 + 40, X1 - 40, c0 + (zt - c0) * 0.58, zt - 40, YF + 30);
      for (let i = 0; i < v.ports; i++) { const x = X0 + (W * (i + 0.5)) / v.ports; a.cyl(x, cy, zt, zt + 95, Math.min(D * 0.22, W / v.ports * 0.34), 16); a.cyl(x, cy, zt + 95, zt + 120, Math.min(D * 0.22, W / v.ports * 0.34) + 14, 16); a.circ(x, cy, Math.min(D * 0.22, W / v.ports * 0.34), 'EQUIP-DETAIL'); }
      a.tube([[X0 + 30, YB - 40, zt - 40], [X0 + 30, YB - 40, Z1 - 20], [X1 - 30, YB - 40, Z1 - 20], [X1 - 30, YB - 40, zt - 40]], [9, 9, 9, 9], 6); gauge(a, X1 - W * 0.2, YF + 30, zt - 80, 20); a.cyl(X0 + 70, YF + 60, c0 - 20, c0, 12, 6);
      for (const [x, y] of [[X0 + 50, YF + 60], [X1 - 50, YF + 60], [X0 + 50, YB - 50], [X1 - 50, YB - 50]]) cast(a, x, y, 90);
      a.log('Added the cabinet, the front grille and door, the flexible duct collars, the control panel, the handle, the drain and the casters (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic construction site air scrubber',
    desc: (v) => `Portable air scrubber of ${v.cfm} cfm for dust control on a construction site: a cabinet with a front filter door and handle, a louvered intake, a round top duct collar, a control panel, a carry handle and four casters.`,
    vs: R([['500 cfm', 20, 20, 24, { cfm: 500 }], ['1,000 cfm', 26, 24, 30, { cfm: '1,000' }], ['2,000 cfm', 34, 30, 38, { cfm: '2,000' }], ['3,000 cfm', 42, 34, 44, { cfm: '3,000' }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); const c0 = Z0 + 90, zt = Z1 - 80;
      a.box(X0 + 10, YF + 30, c0, X1 - 10, YB - 10, zt); door(a, X0 + 40, X1 - 40, c0 + (zt - c0) * 0.4, zt - 40, YF + 30); lvF(a, X0 + 40, X1 - 40, YF + 30, c0 + 30, c0 + (zt - c0) * 0.33, 36);
      a.cyl(cx, cy, zt, Z1 - 20, Math.min(W, D) * 0.22, 18); a.cyl(cx, cy, Z1 - 20, Z1, Math.min(W, D) * 0.25, 18); a.circ(cx, cy, Math.min(W, D) * 0.22, 'EQUIP-DETAIL'); a.box(X1 - 120, YF + 12, zt - 110, X1 - 40, YF + 30, zt - 30);
      a.tube([[X0 + 50, YB - 30, zt - 30], [X0 + 20, YB - 30, zt + 50], [X1 - 20, YB - 30, zt + 50], [X1 - 50, YB - 30, zt - 30]], [9, 9, 9, 9], 6);
      for (const [x, y] of [[X0 + 50, YF + 70], [X1 - 50, YF + 70], [X0 + 50, YB - 50], [X1 - 50, YB - 50]]) cast(a, x, y, 90);
      a.log('Added the cabinet, the front filter door and louvered intake, the top duct collar, the control panel, the carry handle and the casters (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic construction site ground thaw heater trailer',
    desc: (v) => `Trailer-mounted hydronic ground thaw heater of ${v.k} kBtu per hour: an enclosure with a service door and louvers, a burner stack, a fluid tank with a fill cap, two hose reels, a drawbar and a single axle with wheels.`,
    vs: [['500 kBtu per hour', 132, 62, 76, 0, { k: 500 }], ['1,000 kBtu per hour', 156, 68, 84, 0, { k: '1,000' }], ['2,000 kBtu per hour', 186, 76, 92, 0, { k: '2,000' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); const wr = (Z1 - Z0) * 0.2, zb = Z0 + wr * 1.5, zt = Z1 - 120, bx0 = X0 + W * 0.18;
      a.box(bx0, YF + 60, zb - 90, X1 - 20, YB - 60, zb); a.box(bx0, YF + 60, zb, X1 - 20, YB - 60, zt); door(a, bx0 + 100, bx0 + W * 0.3, zb + 80, zt - 80, YF + 60); lvF(a, bx0 + W * 0.36, X1 - 120, YF + 60, zb + 100, zt - 80, 50);
      stack(a, X1 - W * 0.12, cy, zt, Z1 - 20, 70); a.cyl(bx0 + W * 0.1, cy, zt, zt + 80, 90, 16); a.circ(bx0 + W * 0.1, cy, 90, 'EQUIP-DETAIL');
      for (const k of [0, 1]) { const x = bx0 + W * (0.3 + 0.2 * k); a.ycyl(YF + 40, YF + 60, x, zt - 400, 260, 20); a.ycyl(YF + 24, YF + 40, x, zt - 400, 90, 12); }
      const ax = bx0 + W * 0.5; for (const y of [YF + 20, YB - 20]) wheel(a, ax, y, wr, 100); a.ycyl(YF + 20, YB - 20, ax, Z0 + wr, 30, 10);
      a.box(X0, cy - 50, zb - 150, bx0, cy + 50, zb - 50); a.cyl(X0 + 60, cy, zb - 50, zb, 60, 12); a.cyl(X0 + W * 0.08, cy + 120, Z0, zb - 150, 20, 8);
      a.log('Added the enclosure with its door and louvers, the burner stack, the fluid tank, the two hose reels, the drawbar and the axle with wheels (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic concrete silo top dust filter',
    desc: (v) => `Silo-top dust filter, ${v.dia} in diameter, for a cement or fly-ash silo: a cylindrical housing on a base flange, an access door, a cartridge cover with a handle, a pulse valve manifold, a fan on a bracket and a pressure relief vent.`,
    vs: [[30, 54], [40, 64], [52, 76], [64, 88]].map(([dia, h]) => [`${dia} in diameter`, dia + 12, dia + 12, h, 0, { dia }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a, r = v.dia * 25.4 / 2; a.outline(); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.4, 'EQUIP-DETAIL');
      a.cyl(cx, cy, Z0, Z0 + 40, r * 1.12, 28); a.cyl(cx, cy, Z0 + 40, Z1 - 380, r, 28); door(a, cx - r * 0.4, cx + r * 0.4, Z0 + 250, Z0 + 750 > Z1 - 600 ? Z1 - 600 : Z0 + 750, cy - r + 8);
      a.cyl(cx, cy, Z1 - 380, Z1 - 330, r * 1.06, 28); a.cone(cx, cy, Z1 - 330, Z1 - 120, r * 0.9, r * 0.5, 24); a.cyl(cx, cy, Z1 - 120, Z1 - 60, r * 0.5, 20); a.box(cx - 12, cy - r * 0.5 - 30, Z1 - 60, cx + 12, cy + r * 0.5 + 30, Z1 - 40); a.cyl(cx, cy, Z1 - 40, Z1, 30, 8);
      a.xcyl(cx - r * 0.6, cx + r * 0.6, cy - r * 0.2, Z1 - 250, 36, 10); for (let i = 0; i < 4; i++) a.cyl(cx - r * 0.6 + (i / 3) * r * 1.2, cy - r * 0.2, Z1 - 330, Z1 - 250, 20, 8);
      a.box(cx + r * 0.7, cy - 90, Z1 - 560, cx + r * 0.7 + 180, cy + 90, Z1 - 430); a.cyl(cx + r * 0.7 + 90, cy, Z1 - 430, Z1 - 330, 40, 8);
      a.log('Added the base flange, the cylindrical housing with its door, the cartridge cover, the pulse valve manifold, the fan bracket and the relief vent (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic construction site welding fume extractor',
    desc: (v) => `Portable welding fume extractor of ${v.cfm} cfm with a ${v.arm} in articulated extraction arm: a filter cabinet on casters with a door, a motor housing, a control panel, a hood on the arm tip and a handle.`,
    vs: [['600 cfm, 6 ft arm', 28, 24, 52, 0, { cfm: 600, arm: 72 }], ['900 cfm, 8 ft arm', 32, 26, 58, 0, { cfm: 900, arm: 96 }], ['1,200 cfm, 10 ft arm', 38, 28, 64, 0, { cfm: '1,200', arm: 120 }], ['1,800 cfm, 12 ft arm', 44, 32, 70, 0, { cfm: '1,800', arm: 144 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); const c0 = Z0 + 100, zt = Z0 + (Z1 - Z0) * 0.5;
      a.box(X0 + 10, YF + 40, c0, X1 - 10, YB - 10, zt); door(a, X0 + 40, X1 - 40, c0 + 40, zt - 60, YF + 40); a.box(X0 + 30, YF + 40, zt, X1 - 30, YB - 10, zt + 220); gauge(a, X1 - W * 0.25, YF + 40, zt + 110, 24); a.cyl(X0 + W * 0.25, cy, zt + 220, zt + 300, 70, 14);
      const ax = X0 + W * 0.25; a.tube([[ax, cy, zt + 300], [ax, cy, Z1 - 250], [ax + W * 0.35, cy, Z1 - 120], [X1 - W * 0.05, YF + D * 0.45, Z1 - 150]], [48, 44, 40, 40], 10);
      a.cone(X1 - W * 0.05, YF + D * 0.45, Z1 - 150, Z1 - 20, 40, 140, 16); a.circ(X1 - W * 0.05, YF + D * 0.45, 140, 'EQUIP-DETAIL'); a.line(ax, cy, ax + W * 0.35, cy, 'EQUIP-DETAIL'); a.line(ax + W * 0.35, cy, X1 - W * 0.05, YF + D * 0.45, 'EQUIP-DETAIL');
      for (const [x, y] of [[X0 + 50, YF + 80], [X1 - 50, YF + 80], [X0 + 50, YB - 50], [X1 - 50, YB - 50]]) cast(a, x, y, 100);
      a.log('Added the filter cabinet with its door, the motor housing, the control panel, the articulated extraction arm with its hood and the casters (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic construction site dust mist cannon',
    desc: (v) => `Dust suppression mist cannon with a ${v.dia} in fan on a trailer frame: a round shroud with a front guard, a ring of spray nozzles, a motor, a yoke, a pump skid with a water inlet and two wheels with a drawbar.`,
    vs: [['24 in fan', 70, 44, 56, 0, { dia: 24 }], ['30 in fan', 84, 50, 66, 0, { dia: 30 }], ['36 in fan', 98, 56, 76, 0, { dia: 36 }], ['48 in fan', 124, 68, 94, 0, { dia: 48 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); const r = Math.min(v.dia * 25.4 * 0.5, W * 0.3), wr = (Z1 - Z0) * 0.15, fz = Z0 + wr * 1.4, zc = fz + 60 + Math.max(r, 200) + 120;
      a.box(X0 + W * 0.12, YF + 60, fz, X1 - W * 0.12, YB - 120, fz + 60); wheel(a, X0 + W * 0.08, cy, wr, 70); wheel(a, X1 - W * 0.08, cy, wr, 70); a.xcyl(X0 + W * 0.08, X1 - W * 0.08, cy, Z0 + wr, 25, 8);
      a.box(cx - W * 0.1, YF + 70, fz + 60, cx + W * 0.1, YF + D * 0.45, fz + 160); a.box(cx - 40, YF + 120, fz + 160, cx + 40, YF + 240, zc - r * 0.3);
      for (const s of [-1, 1]) a.box(cx + s * (r + 30) - 20, YF + 160, fz + 160, cx + s * (r + 30) + 20, YF + 220, zc);
      a.ycyl(YF + 160, YF + 160 + D * 0.3, cx, zc, r, 28); a.ycyl(YF + 160 + D * 0.3, YB - 160, cx, zc, r * 0.35, 14); ringY(a, cx, YF + 150, zc, r * 1.04, 12);
      for (let i = 0; i < 10; i++) { const g = (i / 10) * Math.PI * 2; a.ycyl(YF + 90, YF + 150, cx + Math.cos(g) * r * 1.04, zc + Math.sin(g) * r * 1.04, 12, 6); }
      guardY(a, cx, YF + 140, zc, r * 0.97, 3, 10); a.box(X1 - W * 0.3, YB - 200, fz + 60, X1 - W * 0.12, YB - 60, fz + 260); a.xcyl(X1 - W * 0.3 - 80, X1 - W * 0.3, YB - 130, fz + 160, 22, 8);
      a.box(cx - 40, YB - 120, fz, cx + 40, YB, fz + 40); a.box(cx - 40, YB - 60, fz - 0, cx + 40, YB, fz + 40);
      a.circ(cx, YF + 160 + D * 0.15, r, 'EQUIP-DETAIL'); a.line(X0 + W * 0.12, YF + 160, X1 - W * 0.12, YF + 160, 'EQUIP-DETAIL');
      a.log('Added the trailer frame with its wheels and drawbar, the pump skid, the yoke, the fan shroud with its guard and the ring of spray nozzles (plan and 3D).');
    } }),
  // ===================================================================== mines
  fam({ cat: EQ, title: 'Generic mine main ventilation axial fan',
    desc: (v) => `Axial mine ventilation fan with a ${v.dia} in casing on a base frame: a round casing with flanged joints, a bellmouth inlet, a motor pod on struts, a diffuser outlet, an inspection hatch, a terminal box and four lifting lugs.`,
    vs: [[36, 100, 50, 53], [48, 124, 64, 68], [60, 150, 78, 82], [72, 172, 92, 96], [96, 220, 121, 125], [120, 268, 150, 154], [144, 312, 179, 183]].map(([dia, w, d, h]) => [`${dia} in casing`, w, d, h, 0, { dia }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); const r = v.dia * 25.4 / 2, zc = Z0 + 140 + r * 1.2;
      a.box(X0, YF + 30, Z0, X1, YB - 30, Z0 + 140); for (const x of [X0 + W * 0.25, X0 + W * 0.7]) a.box(x - 120, cy - r * 0.9, Z0 + 140, x + 120, cy + r * 0.9, zc - r * 0.7);
      a.tube([[X0 + 10, cy, zc], [X0 + W * 0.14, cy, zc]], [r * 1.2, r * 1.02], 28); a.xcyl(X0 + W * 0.14, X0 + W * 0.58, cy, zc, r, 28);
      for (const x of [X0 + W * 0.14, X0 + W * 0.36, X0 + W * 0.58]) a.xcyl(x - 22, x + 22, cy, zc, r * 1.07, 28);
      a.tube([[X0 + W * 0.58, cy, zc], [X1 - 10, cy, zc]], [r, r * 1.2], 28); a.xcyl(X1 - 40, X1 - 10, cy, zc, r * 1.2, 28);
      a.xcyl(X0 + W * 0.4, X0 + W * 0.56, cy, zc, r * 0.46, 20); for (let i = 0; i < 4; i++) { const g = (i / 4) * Math.PI * 2 + 0.78; a.tube([[X0 + W * 0.48, cy + Math.cos(g) * r * 0.45, zc + Math.sin(g) * r * 0.45], [X0 + W * 0.48, cy + Math.cos(g) * r, zc + Math.sin(g) * r]], [10, 10], 5); }
      a.box(X0 + W * 0.3, cy - 150, zc + r, X0 + W * 0.3 + 300, cy + 150, zc + r + 90); a.box(X0 + W * 0.62, cy - 70, zc + r - 30, X0 + W * 0.62 + 160, cy + 70, zc + r + 80); a.box(X0 + W * 0.2, YF + 30, zc - 120, X0 + W * 0.2 + 200, YF + 30 + r * 0.12 + 40, zc + 120);
      for (const [x, y] of [[X0 + 80, YF + 60], [X1 - 80, YF + 60], [X0 + 80, YB - 60], [X1 - 80, YB - 60]]) lug(a, x, y, Z0 + 140);
      for (const x of [X0 + W * 0.14, X0 + W * 0.36, X0 + W * 0.58]) a.line(x, cy - r, x, cy + r, 'EQUIP-DETAIL');
      a.log('Added the base frame, the cradles, the casing with flanged joints, the bellmouth, the motor pod on struts, the diffuser, the hatch, the terminal box and the lugs (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine auxiliary ventilation fan with silencer',
    desc: (v) => `Underground auxiliary ventilation fan, ${v.dia} in duct size, on a skid: an inlet bellmouth with a guard, a fan casing with a motor, a cylindrical silencer on the discharge side with a duct flange, a starter box and four lifting lugs.`,
    vs: [[24, 108, 40, 42], [36, 150, 54, 58], [48, 192, 68, 74], [60, 234, 82, 90]].map(([dia, w, d, h]) => [`${dia} in duct`, w, d, h, 0, { dia }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); const r = v.dia * 25.4 / 2, zc = Z0 + 130 + r * 1.05;
      skid(a, X0, X1, YF + 30, YB - 30, Z0, 120); a.tube([[X0 + 20, cy, zc], [X0 + W * 0.12, cy, zc]], [r * 1.25, r], 24); ringY(a, X0 + 20, 0, zc, 1, 1);
      a.xcyl(X0 + W * 0.12, X0 + W * 0.42, cy, zc, r, 26); a.xcyl(X0 + W * 0.38, X0 + W * 0.5, cy, zc, r * 0.55, 18);
      a.xcyl(X0 + W * 0.42, X1 - 40, cy, zc, r * 1.02, 26); for (let i = 1; i < 6; i++) { const x = X0 + W * 0.42 + (i * (W * 0.58 - 40)) / 6; a.xcyl(x - 8, x + 8, cy, zc, r * 1.06, 26); }
      a.xcyl(X1 - 40, X1, cy, zc, r * 1.25, 26); a.box(X0 + W * 0.2, YF + 40, zc - 200, X0 + W * 0.2 + 260, YF + 100, zc + 200); gauge(a, X0 + W * 0.2 + 130, YF + 40, zc + 100, 28);
      for (let z = zc - r; z <= zc + r; z += r * 0.5) a.xcyl(X0 + 20, X0 + 40, cy, z, 10, 5);
      for (const [x, y] of [[X0 + 80, YF + 60], [X1 - 80, YF + 60], [X0 + 80, YB - 60], [X1 - 80, YB - 60]]) lug(a, x, y, Z0 + 120);
      a.line(X0 + W * 0.42, cy - r, X0 + W * 0.42, cy + r, 'EQUIP-DETAIL');
      a.log('Added the skid, the inlet bellmouth, the fan casing and motor, the ribbed silencer with its duct flange, the starter box and the lugs (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine ventilation duct, straight section',
    desc: (v) => `Straight rigid steel mine ventilation duct, ${v.dia} in diameter and 10 ft long, with a bolted flange at each end, rib bands along the barrel, two support cradles and hanger lugs on top.`,
    vs: [24, 36, 48, 60, 72].map((dia) => [`${dia} in diameter, 10 ft`, 120 + 3, dia + 10, dia + 14, 0, { dia }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); const r = v.dia * 25.4 / 2, zc = Z0 + 40 + r;
      a.xcyl(X0 + 20, X1 - 20, cy, zc, r, 32); for (const x of [X0 + 20, X1 - 56]) a.xcyl(x, x + 36, cy, zc, r * 1.08, 32);
      for (let i = 1; i < 6; i++) a.xcyl(X0 + 20 + (W - 40) * i / 6 - 12, X0 + 20 + (W - 40) * i / 6 + 12, cy, zc, r * 1.035, 32);
      for (const x of [X0 + W * 0.2, X1 - W * 0.2]) { a.box(x - 90, cy - r * 0.55, Z0, x + 90, cy + r * 0.55, Z0 + 40 + r * 0.3); a.box(x - 90, cy - r * 0.9, Z0 + 20, x + 90, cy + r * 0.9, Z0 + 40); a.rect(x - 90, cy - r * 0.9, x + 90, cy + r * 0.9, 'EQUIP-DETAIL'); lug(a, x, cy, zc + r - 10); }
      for (const x of [X0 + 20, X1 - 20]) a.line(x, cy - r, x, cy + r, 'EQUIP-DETAIL');
      a.log('Added the barrel, the bolted end flanges, the rib bands, the support cradles and the hanger lugs (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine ventilation duct, 90 degree elbow',
    desc: (v) => `Rigid steel mine ventilation duct elbow, ${v.dia} in diameter, a 90 degree bend in plan with a short straight leg and a bolted flange at each end, rib bands on the bend and two support cradles.`,
    vs: [[24, 70], [36, 94], [48, 118], [60, 142]].map(([dia, w]) => [`${dia} in diameter`, w, w, dia + 14, 0, { dia }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline(); const r = v.dia * 25.4 / 2, zc = Z0 + 40 + r, R = r * 1.5, L = 300, yb = YB - r - 20, xc = X0 + L, yc = yb - R, pts = [], rads = [];
      pts.push([X0 + 36, yb, zc]); pts.push([xc, yb, zc]); for (let i = 1; i < 9; i++) { const g = Math.PI / 2 - (i / 9) * (Math.PI / 2); pts.push([xc + Math.cos(g) * R, yc + Math.sin(g) * R, zc]); } pts.push([xc + R, yc, zc]); pts.push([xc + R, YF + 20 + L * 0 + 36 + 260, zc]);
      for (let i = 0; i < pts.length; i++) rads.push(r); a.tube(pts, rads, 28); a.xcyl(X0, X0 + 36, yb, zc, r * 1.08, 28); a.ycyl(YF + 20, YF + 56, xc + R, zc, r * 1.08, 28);
      for (let i = 2; i < 9; i += 2) { const g = Math.PI / 2 - (i / 9) * (Math.PI / 2); a.cyl(xc + Math.cos(g) * R, yc + Math.sin(g) * R, zc - r * 1.04, zc + r * 1.04, r * 0.06 + 4, 6); }
      for (const [x, y] of [[X0 + L * 0.5, yb], [xc + R, YF + 360]]) { a.box(x - 90, y - 90, Z0, x + 90, y + 90, zc - r * 0.7); a.box(x - 120, y - 120, Z0 + 20, x + 120, y + 120, Z0 + 40); }
      a.line(X0 + 36, yb - r, X0 + 36, yb + r, 'EQUIP-DETAIL'); a.line(xc + R - r, YF + 56, xc + R + r, YF + 56, 'EQUIP-DETAIL'); a.arc(xc, yc, R, 0, 90, 'EQUIP-DETAIL');
      a.log('Added the straight leg, the 90 degree bend, the bolted end flanges, the rib bands and the support cradles (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine underground air cooling unit',
    desc: (v) => `Underground air cooling unit of ${v.kw} kW class: a long casing with a round duct collar at each end, a spray header with nozzles on top, two access doors, a sump pan, a pump set and pipes, on a skid.`,
    vs: [['600 kW class', 180, 72, 80, 0, { kw: 600 }], ['1,200 kW class', 240, 84, 92, 0, { kw: '1,200' }], ['2,400 kW class', 318, 96, 104, 0, { kw: '2,400' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); skid(a, X0 + 120, X1 - 120, YF, YB, Z0, 130); const zb = Z0 + 130, zt = Z1 - 300, zc = (zb + zt) / 2, r = Math.min(D * 0.32, (zt - zb) * 0.42);
      a.box(X0 + 200, YF + 60, zb, X1 - 200, YB - 60, zt); a.box(X0 + 200, YF + 60, zb - 20, X1 - 200, YB - 60, zb + 80);
      for (const s of [0, 1]) { const x = s ? X1 - 200 : X0 + 200; a.xcyl(s ? x : x - 160, s ? x + 160 : x, cy, zc, r, 24); a.xcyl(s ? x + 160 : x - 190, s ? x + 190 : x - 160, cy, zc, r * 1.16, 24); a.circ(s ? x + 100 : x - 100, cy, r, 'EQUIP-DETAIL'); }
      door(a, X0 + 300, X0 + W * 0.45, zb + 140, zt - 100, YF + 60); door(a, X0 + W * 0.52, X1 - 300, zb + 140, zt - 100, YF + 60, -1); a.line(X0 + W * 0.485, YF, X0 + W * 0.485, YB, 'EQUIP-DETAIL');
      a.xcyl(X0 + 260, X1 - 260, cy, zt + 100, 30, 10); for (let i = 0; i < 9; i++) a.cyl(X0 + 300 + (i * (W - 600)) / 8, cy, zt, zt + 100, 12, 6); for (const x of [X0 + 300, X1 - 300]) a.cyl(x, cy, zt, zt + 140, 30, 8);
      M.pumpSet(a, X0 + 100 + 0, YB - 150, Z0 + 20, 220); a.tube([[X0 + 250, YB - 150, Z0 + 230], [X0 + 250, YB - 150, zt + 100], [X0 + 260, cy, zt + 100]], [24, 24, 24], 8);
      a.log('Added the skid, the casing with a round collar at each end, the spray header with nozzles, the two doors, the sump pan, the pump set and the pipes (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine surface bulk air cooler tower',
    desc: (v) => `Surface bulk air cooler tower ${v.w} in square: a basin, louvered faces on all four sides, a fan stack with a guard on top, a deck with a handrail, a caged ladder, a water inlet pipe and a drain.`,
    vs: [['120 in square', 120, 120, 240, 0, { w: 120 }], ['168 in square', 168, 168, 288, 0, { w: 168 }], ['216 in square', 216, 216, 336, 0, { w: 216 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 400); const zb = Z0 + 400, zt = Z1 - 520; a.box(X0 + 60, YF + 60, zb, X1 - 60, YB - 60, zt);
      lvF(a, X0 + 100, X1 - 100, YF + 60, zb + 80, zt - 80, 70); lvX(a, X0 + 60, YF + 100, YB - 100, zb + 80, zt - 80, 70, -1); lvX(a, X1 - 60, YF + 100, YB - 100, zb + 80, zt - 80, 70, 1);
      a.box(X0 + 20, YF + 20, zt, X1 - 20, YB - 20, zt + 60); const sr = W * 0.28; a.cyl(cx, cy, zt + 60, zt + 460, sr, 28); a.cyl(cx, cy, zt + 460, zt + 500, sr * 1.08, 28); a.circ(cx, cy, sr); fanTop(a, cx, cy, Z1 - 100, sr * 0.9, 10);
      rail(a, X0 + 30, YF + 30, X1 - 30, YF + 30, zt + 60, 800, 6); rail(a, X0 + 30, YB - 30, X1 - 30, YB - 30, zt + 60, 800, 6); ladder(a, X1 - W * 0.2, YF + 8, Z0, zt + 60, 460);
      a.xcyl(X0 - 0, X0 + 220, cy, Z0 + 700, 50, 12); a.cyl(X1 - 120, YB - 120, Z0 - 0, Z0 + 150, 40, 8);
      a.log('Added the basin, the louvered faces, the fan stack with its guard, the deck with its handrail, the caged ladder and the water pipes (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine crusher baghouse dust collector',
    desc: (v) => `Baghouse dust collector for a mine crusher, ${v.bags} filter bags: a box housing on four legs with a hopper and rotary valve, a row of ${v.n} hinged bag doors, a top plenum with a pulse tank, a fan with a scroll and a stack, and a ladder.`,
    vs: [['36 bags', 54, 54, 168, { bags: 36, n: 3 }], ['64 bags', 72, 60, 192, { bags: 64, n: 4 }], ['100 bags', 96, 72, 216, { bags: 100, n: 5 }], ['150 bags', 120, 84, 240, { bags: 150, n: 6 }], ['225 bags', 144, 96, 264, { bags: 225, n: 6 }], ['300 bags', 180, 108, 288, { bags: 300, n: 8 }]].map(([l, w, d, h, p]) => [l, w, d, h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); const hz = Z0 + (Z1 - Z0) * 0.3, bz = Z0 + (Z1 - Z0) * 0.24, top = Z1 - (Z1 - Z0) * 0.22, hw = W * 0.7, hx0 = X0 + W * 0.05, hx1 = hx0 + hw;
      for (const [x, y] of [[hx0 + 80, YF + 80], [hx1 - 80, YF + 80], [hx0 + 80, YB - 80], [hx1 - 80, YB - 80]]) { a.box(x - 60, y - 60, Z0, x + 60, y + 60, bz); }
      a.cone(hx0 + hw / 2, cy, Z0 + (Z1 - Z0) * 0.1, bz, hw * 0.12, Math.min(hw, D) * 0.5, 4); a.xcyl(hx0 + hw / 2 - 160, hx0 + hw / 2 + 160, cy, Z0 + (Z1 - Z0) * 0.1, 80, 14); a.cyl(hx0 + hw / 2, cy, Z0, Z0 + (Z1 - Z0) * 0.1, 70, 12);
      a.box(hx0, YF + 20, bz, hx1, YB - 20, top); const dw = hw / v.n; for (let i = 0; i < v.n; i++) door(a, hx0 + i * dw + 50, hx0 + (i + 1) * dw - 50, bz + 200, top - 200, YF + 20, i % 2 ? -1 : 1);
      a.box(hx0 + 30, YF + 60, top, hx1 - 30, YB - 60, top + (Z1 - top) * 0.45); a.xcyl(hx0 + 80, hx1 - 80, YB - 140, top + (Z1 - top) * 0.45 + 80, 70, 12); for (let i = 0; i < v.n; i++) a.cyl(hx0 + dw * (i + 0.5), YB - 140, top + (Z1 - top) * 0.45, top + (Z1 - top) * 0.45 + 80, 26, 8);
      const fr = Math.min(Z1 - top - 40, (X1 - hx1 - 40) / 2) * 0.9; a.ycyl(cy - 160, cy + 160, hx1 + (X1 - hx1) / 2, top - 200 + fr, fr, 22); a.box(hx1 - 40, cy - 100, top + 100, hx1 + (X1 - hx1) / 2, cy + 100, top + 300); stack(a, hx1 + (X1 - hx1) / 2, cy, top - 200 + fr * 2, Z1 - 30, 100);
      ladder(a, hx0 + hw * 0.5, YF + 4, Z0, top, 400); for (let i = 1; i < v.n; i++) a.line(hx0 + i * dw, YF, hx0 + i * dw, YB, 'EQUIP-DETAIL'); a.circ(hx0 + hw / 2, cy, 70, 'EQUIP-DETAIL');
      a.log('Added the legs, the hopper with its rotary valve, the row of hinged bag doors, the top plenum with its pulse tank, the fan with its scroll and stack and the ladder (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine transfer point cartridge dust collector',
    desc: (v) => `Cartridge dust collector module with ${v.c} cartridges for a mine conveyor transfer point: a skid, a housing with a front service door, a bottom dust bin, a top pulse tank with valves, a fan and motor and a clean air outlet.`,
    vs: [['2 cartridges', 30, 26, 66, 0, { c: 2 }], ['4 cartridges', 40, 30, 78, 0, { c: 4 }], ['6 cartridges', 52, 34, 90, 0, { c: 6 }], ['8 cartridges', 64, 38, 100, 0, { c: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); skid(a, X0, X1, YF + 20, YB - 20, Z0, 90); const bz = Z0 + (Z1 - Z0) * 0.3, top = Z1 - (Z1 - Z0) * 0.25;
      a.box(X0 + 60, YF + 60, Z0 + 90, X1 - 60, YB - 60, bz); a.box(X0 + 40, YF + 40, bz, X1 - W * 0.22, YB - 40, top); door(a, X0 + 100, X1 - W * 0.22 - 60, bz + 120, top - 140, YF + 40);
      a.box(X1 - W * 0.22, YF + 60, bz + 60, X1 - 30, YB - 60, top - 60); a.box(X1 - 90, cy - 60, bz + 120, X1 - 20, cy + 60, top - 120);
      a.xcyl(X0 + 80, X1 - W * 0.22 - 80, cy, top + 120, 60, 12); for (let i = 0; i < v.c / 2; i++) a.cyl(X0 + 80 + (i + 0.5) * (W * 0.78 - 160) / (v.c / 2), cy, top, top + 120, 22, 8);
      a.box(X0 + 40, YF + 40, top, X1 - W * 0.22, YB - 40, top + 80); fanTop(a, X1 - W * 0.11, cy, top - 60, Math.min(W * 0.1, D * 0.3), 8); a.cyl(X1 - W * 0.11, cy, top - 200, top - 60, Math.min(W * 0.1, D * 0.3) * 0.5, 12);
      for (let i = 0; i < v.c / 2; i++) { const x = X0 + 60 + (i + 0.5) * (W * 0.78 - 120) / (v.c / 2); a.circ(x, cy - D * 0.15, 70, 'EQUIP-DETAIL'); a.circ(x, cy + D * 0.15, 70, 'EQUIP-DETAIL'); }
      a.log('Added the skid, the dust bin, the housing with its service door, the pulse tank with valves, the fan and motor and the clean air outlet (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine shaft collar air heating building',
    desc: (v) => `Mine shaft collar air heating building with a pitched roof: a ${v.n} burner room with a double door and louvers, ${v.n} roof burner stacks, a large round duct on one side that runs to the shaft, and a concrete plinth.`,
    vs: [['2 burner', 144, 96, 120, 0, { n: 2 }], ['4 burner', 216, 108, 132, 0, { n: 4 }], ['6 burner', 288, 120, 144, 0, { n: 6 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 150); const wz = Z1 - 420, bz = Z0 + 150;
      a.box(X0 + 60, YF + 60, bz, X1 - 60, YB - 60, wz); ext(a, [[YF + 40, wz], [YF + D * 0.5, Z1 - 150], [YB - 40, wz]], X0 + 40, X1 - 40); a.box(X0 + 40, YF + 40, wz - 30, X1 - 40, YB - 40, wz);
      door(a, X0 + W * 0.1, X0 + W * 0.2, bz + 80, bz + 1700 > wz - 80 ? wz - 80 : bz + 1700, YF + 60); door(a, X0 + W * 0.2 + 20, X0 + W * 0.3, bz + 80, bz + 1700 > wz - 80 ? wz - 80 : bz + 1700, YF + 60, -1);
      lvF(a, X0 + W * 0.45, X1 - W * 0.3, YF + 60, bz + 200, wz - 150, 55); for (let i = 0; i < v.n; i++) { const x = X0 + W * 0.15 + (i + 0.5) * (W * 0.7) / v.n; a.cyl(x, cy, Z1 - 160, Z1 - 20, 55, 12); a.cyl(x, cy, Z1 - 20, Z1, 75, 12); a.circ(x, cy, 55, 'EQUIP-DETAIL'); }
      const dr = Math.min(D * 0.2, (wz - bz) * 0.3); a.xcyl(X1 - 60, X1 - 10, cy, bz + (wz - bz) * 0.5, dr, 22); a.xcyl(X1 - 10, X1, cy, bz + (wz - bz) * 0.5, dr * 1.15, 22); a.line(X0 + W * 0.15, YF + 60, X0 + W * 0.15, YB - 60, 'EQUIP-DETAIL');
      a.log('Added the plinth, the burner room with its double door and louvers, the pitched roof, the burner stacks and the large round duct to the shaft (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine screw air compressor station',
    desc: (v) => `Mine compressor station of ${v.kw} kW: a screw compressor in a louvered enclosure with service doors on a skid, an aftercooler on top with a fan, a vertical air receiver with a gauge and relief pipe, a dryer cabinet and a discharge pipe.`,
    vs: [['75 kW', 108, 48, 78, 0, { kw: 75 }], ['160 kW', 138, 54, 84, 0, { kw: 160 }], ['250 kW', 168, 60, 90, 0, { kw: 250 }], ['400 kW', 204, 66, 96, 0, { kw: 400 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); skid(a, X0, X1, YF + 20, YB - 20, Z0, 110); const bz = Z0 + 110, ez = Z1 - 360, ew = W * 0.55;
      a.box(X0 + 20, YF + 40, bz, X0 + ew, YB - 40, ez); door(a, X0 + 80, X0 + ew * 0.4, bz + 90, ez - 90, YF + 40); lvF(a, X0 + ew * 0.46, X0 + ew - 70, YF + 40, bz + 90, ez - 90, 52); a.line(X0 + ew * 0.42, YF + 40, X0 + ew * 0.42, YB - 40, 'EQUIP-DETAIL');
      a.box(X0 + 20, YF + 40, ez, X0 + ew, YB - 40, ez + 60); fanTop(a, X0 + ew * 0.5, cy, ez + 60, Math.min(ew * 0.3, D * 0.3), 8); a.box(X0 + ew * 0.1, cy - 140, ez + 60, X0 + ew * 0.9, cy + 140, ez + 120 - 60 + 60);
      const rr = Math.min(D * 0.26, 320), rx = X0 + ew + rr + 90; tankV(a, rx, cy, bz, Z1 - 280, rr); gauge(a, rx, cy - rr * 0.96, bz + (Z1 - Z0) * 0.5, 30); a.tube([[rx + rr * 0.3, cy, Z1 - 280], [rx + rr * 0.3, cy, Z1 - 120], [rx + rr * 0.9, cy, Z1 - 120]], [14, 14, 14], 8);
      const dx = rx + rr + 90; a.box(dx, YF + 60, bz, X1 - 30, YB - 60, bz + (Z1 - bz) * 0.55); door(a, dx + 30, X1 - 60, bz + 90, bz + (Z1 - bz) * 0.55 - 90, YF + 60); a.tube([[X0 + ew, YB - 120, bz + 800], [dx, YB - 120, bz + 800], [dx, YB - 120, Z1 - 200], [X1 - 60, YB - 120, Z1 - 200]], [28, 28, 28, 28], 8);
      a.log('Added the skid, the louvered enclosure with its doors, the aftercooler and fan, the vertical receiver with gauge and relief pipe, the dryer cabinet and the discharge pipe (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine process water cross-flow cooling tower',
    desc: (v) => `Cross-flow cooling tower with ${v.fans} fan cell${v.fans > 1 ? 's' : ''} for mine process water: a basin, louvered fill faces on both long sides, a fan stack with a guard on each cell, a deck handrail, a ladder and a water inlet header.`,
    vs: R([['1 cell', 108, 96, 132, { fans: 1 }], ['2 cell', 192, 96, 132, { fans: 2 }], ['3 cell', 276, 96, 132, { fans: 3 }], ['4 cell', 360, 96, 132, { fans: 4 }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 300); const zb = Z0 + 300, zt = Z1 - 1450;
      a.box(X0 + 40, YF + 100, zb, X1 - 40, YB - 100, zt); lvF(a, X0 + 80, X1 - 80, YF + 100, zb + 60, zt - 60, 60); a.box(X0 + 40, YB - 100, zb + 60, X1 - 40, YB - 80, zt - 60); a.rect(X0 + 40, YF + 100, X1 - 40, YB - 100, 'EQUIP-DETAIL');
      a.box(X0 + 20, YF + 20, zt, X1 - 20, YB - 20, zt + 50); const cw = W / v.fans, sr = Math.min(cw * 0.38, D * 0.3);
      for (let i = 0; i < v.fans; i++) { const x = X0 + cw * (i + 0.5); a.cyl(x, cy, zt + 50, zt + 330, sr, 26); a.cyl(x, cy, zt + 330, zt + 370, sr * 1.07, 26); fanTop(a, x, cy, zt + 370, sr * 0.92, 10); if (i) a.line(X0 + cw * i, YF, X0 + cw * i, YB, 'EQUIP-DETAIL'); }
      rail(a, X0 + 30, YF + 30, X1 - 30, YF + 30, zt + 50, 1000, Math.max(4, v.fans * 2)); ladder(a, X0 + 220, YF + 6, Z0, zt + 50, 420); a.xcyl(X0 + 60, X1 - 60, cy, zt - 80, 36, 12);
      a.log('Added the basin, the louvered fill faces, the fan stacks with guards, the deck handrail, the ladder and the water inlet header (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine surface centrifugal main fan',
    desc: (v) => `Centrifugal mine ventilation fan with a ${v.dia} in wheel on a concrete-style base: a round scroll casing, an inlet cone on the front, a rectangular discharge duct on top, a motor with a coupling guard on a bedplate and an access door.`,
    vs: [[36, 114, 70, 108], [48, 144, 84, 134], [60, 174, 98, 160], [72, 204, 112, 186]].map(([dia, w, d, h]) => [`${dia} in wheel`, w, d, h, 0, { dia }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 140); const R = Math.min(W * 0.3, (Z1 - Z0 - 200) * 0.42), sx = X0 + W * 0.36, sz = Z0 + 140 + R + 60;
      a.ycyl(YF + D * 0.3, YB - 120, sx, sz, R, 36); a.ycyl(YF + D * 0.3 - 30, YF + D * 0.3, sx, sz, R * 1.04, 36); a.tube([[sx, YF + 40, sz], [sx, YF + D * 0.3, sz]], [R * 0.55, R * 0.4], 28); ringY(a, sx, YF + 36, sz, R * 0.56, 10); a.ycyl(YF + D * 0.3 - 4, YF + D * 0.3, sx, sz, R * 0.4, 20);
      a.box(sx + R * 0.1, YF + D * 0.3, sz + R * 0.9, sx + R * 1.05, YB - 120, Z1 - 20); a.box(sx + R * 0.04, YF + D * 0.3 - 20, sz + R * 0.9 - 40, sx + R * 1.12, YB - 100, sz + R * 0.9);
      a.box(X0 + W * 0.66, YF + D * 0.4, Z0 + 140, X1 - 120, YB - 200, Z0 + 140 + R * 0.55); a.xcyl(sx + R * 0.1, X0 + W * 0.66, cy + D * 0.1, Z0 + 140 + R * 0.28, 70, 12); a.box(sx + R * 0.2, cy, Z0 + 140, sx + R * 0.7, cy + 160, Z0 + 140 + R * 0.4);
      door(a, sx - R * 0.35, sx + R * 0.1, sz - R * 0.5, sz + R * 0.3, YF + D * 0.3 - 30); a.circ(sx, cy, R, 'EQUIP-DETAIL'); a.rect(X0 + W * 0.66, YF + D * 0.4, X1 - 120, YB - 200, 'EQUIP-DETAIL');
      a.log('Added the base, the round scroll casing, the inlet cone, the discharge duct on top, the motor with its coupling guard and the access door (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine ventilation double door with regulator',
    desc: (v) => `Double-leaf mine ventilation door in a steel frame, ${v.w} in wide and ${v.h} in high: two braced leaves with hinges and handles, a sliding regulator window in each leaf, a threshold and wall anchor plates.`,
    vs: [['72 by 84 in', 72, 14, 84], ['96 by 96 in', 96, 14, 96], ['120 by 108 in', 120, 16, 108], ['144 by 120 in', 144, 16, 120]].map(([l, w, d, h]) => [l, w + 12, d, h + 6, 0, { w, h }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); a.box(X0, YF, Z0, X0 + 90, YB, Z1); a.box(X1 - 90, YF, Z0, X1, YB, Z1); a.box(X0 + 90, YF, Z1 - 90, X1 - 90, YB, Z1); a.box(X0 + 90, YF, Z0, X1 - 90, YB, Z0 + 40);
      const lw = (W - 180) / 2; for (const s of [0, 1]) { const x0 = X0 + 90 + s * lw; a.box(x0 + 8, YF + 20, Z0 + 40, x0 + lw - 8, YF + 60, Z1 - 90); a.rect(x0 + 8, YF + 20, x0 + lw - 8, YF + 60, 'EQUIP-DETAIL');
        a.box(x0 + 30, YF + 4, Z0 + 140, x0 + lw - 30, YF + 20, Z0 + 180); a.box(x0 + 30, YF + 4, Z1 - 330, x0 + lw - 30, YF + 20, Z1 - 290); a.tube([[x0 + 30, YF + 6, Z0 + 150], [x0 + lw - 30, YF + 6, Z1 - 300]], [14, 14], 6);
        const wx0 = x0 + lw * 0.2, wx1 = x0 + lw * 0.8; a.box(wx0, YF + 4, Z0 + (Z1 - Z0) * 0.5, wx1, YF + 20, Z0 + (Z1 - Z0) * 0.5 + 260); for (let z = Z0 + (Z1 - Z0) * 0.5 + 30; z < Z0 + (Z1 - Z0) * 0.5 + 240; z += 55) a.box(wx0 + 20, YF, z, wx1 - 20, YF + 4, z + 20);
        const hx = s ? x0 + 70 : x0 + lw - 70; a.box(hx - 8, YF - 30 > YF ? YF : YF, Z0 + 1000, hx + 8, YF + 4, Z0 + 1250); for (const z of [Z0 + 300, Z1 - 400]) a.box(s ? X1 - 110 : X0 + 90, YF + 20, z, s ? X1 - 90 : X0 + 110, YF + 70, z + 120);
        a.arc(s ? X1 - 90 : X0 + 90, YF + 40, lw, s ? 90 : 0, s ? 180 : 90, 'EQUIP-SWING'); }
      a.line(X0 + W / 2, YF, X0 + W / 2, YB, 'EQUIP-DETAIL');
      a.log('Added the steel frame, the two braced leaves with hinges and handles, the sliding regulator windows, the threshold and the swing arcs (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine container refrigeration plant',
    desc: (v) => `Container-housed mine refrigeration plant of ${v.mw} MW: a corrugated steel container with two louvered doors and a roof of ${v.fans} condenser fans with guards, a ladder, an end pipe stub with flanges and four corner posts.`,
    vs: [['1 MW, 20 ft container', 240, 96, 120, 0, { mw: 1, fans: 2 }], ['2 MW, 30 ft container', 360, 96, 120, 0, { mw: 2, fans: 3 }], ['3 MW, 40 ft container', 480, 96, 120, 0, { mw: 3, fans: 4 }], ['5 MW, 40 ft high-cube container', 480, 96, 144, 0, { mw: 5, fans: 6 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); const zb = Z0 + 120, zt = Z1 - 150; for (const x of [X0 + 160, X1 - 160]) for (const y of [YF + 160, YB - 160]) a.box(x - 120, y - 120, Z0, x + 120, y + 120, zb);
      a.box(X0, YF + 20, zb, X1, YB - 20, zt); for (let x = X0 + 80; x < X1 - 60; x += 110) { a.box(x, YF + 6, zb + 40, x + 50, YF + 20, zt - 40); a.box(x, YB - 20, zb + 40, x + 50, YB - 6, zt - 40); }
      door(a, X0 + W * 0.08, X0 + W * 0.3, zb + 120, zt - 120, YF + 6); lvF(a, X0 + W * 0.4, X0 + W * 0.7, YF + 6, zb + 120, zt - 120, 54); door(a, X0 + W * 0.74, X0 + W * 0.92, zb + 120, zt - 120, YF + 6, -1);
      const per = Math.ceil(v.fans / (v.fans > 4 ? 2 : 1)), rows = v.fans > 4 ? 2 : 1; a.box(X0 + 20, YF + 40, zt, X1 - 20, YB - 40, zt + 50); for (let i = 0; i < v.fans; i++) fanTop(a, X0 + 20 + ((W - 40) * ((i % per) + 0.5)) / per, YF + D * (rows === 2 ? (i < per ? 0.3 : 0.7) : 0.5), zt + 50, Math.min((W - 40) / per * 0.4, D * (rows === 2 ? 0.2 : 0.32)), 8);
      ladder(a, X1 - 140, YF + 4, Z0, zt, 420); a.xcyl(X1, X1, cy, zb + 400, 1, 3); a.cyl(X1 - 140, cy + 80, zt + 50, Z1 - 60, 40, 10); a.cyl(X1 - 140, cy + 80, Z1 - 60, Z1 - 40, 70, 12);
      a.log('Added the corner posts, the corrugated container with its louvered doors, the roof condenser fans with guards, the ladder and the pipe stub (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic mine ventilation fan silencer',
    desc: (v) => `Cylindrical silencer for a ${v.dia} in mine ventilation fan: a ribbed outer shell with bolted flanges at both ends, rounded center pod ends visible through the openings, a support saddle at each end and four lifting lugs.`,
    vs: [[36, 120, 52, 58], [48, 150, 70, 76], [60, 180, 87, 93], [72, 210, 105, 111]].map(([dia, w, d, h]) => [`${dia} in duct size`, w, d, h, 0, { dia }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); const r = v.dia * 25.4 / 2 * 1.25, zc = Z0 + 60 + r;
      a.xcyl(X0 + 40, X1 - 40, cy, zc, r, 32); for (let i = 1; i < 9; i++) a.xcyl(X0 + 40 + (W - 80) * i / 9 - 10, X0 + 40 + (W - 80) * i / 9 + 10, cy, zc, r * 1.04, 32);
      for (const x of [X0 + 40, X1 - 76]) a.xcyl(x, x + 36, cy, zc, r * 1.1, 32); a.ell(X0 + 40 + W * 0.03, cy, zc, W * 0.06, r * 0.45, r * 0.45, 14, 8); a.ell(X1 - 40 - W * 0.03, cy, zc, W * 0.06, r * 0.45, r * 0.45, 14, 8);
      for (const x of [X0 + W * 0.18, X1 - W * 0.18]) { a.box(x - 100, cy - r * 0.6, Z0, x + 100, cy + r * 0.6, zc - r * 0.55); a.box(x - 140, cy - r * 0.9, Z0, x + 140, cy + r * 0.9, Z0 + 30); lug(a, x, cy, zc + r - 10); }
      for (const x of [X0 + 40, X1 - 40]) a.line(x, cy - r, x, cy + r, 'EQUIP-DETAIL'); a.ellp(X0 + 40 + W * 0.03, cy, W * 0.06, r * 0.45, 'EQUIP-DETAIL'); a.ellp(X1 - 40 - W * 0.03, cy, W * 0.06, r * 0.45, 'EQUIP-DETAIL');
      a.log('Added the ribbed shell, the bolted end flanges, the center pod ends, the support saddles and the lifting lugs (plan and 3D).');
    } }),
  // ===================================================================== hangars and aircraft ground support
  fam({ cat: EQ, title: 'Generic hangar overhead radiant tube heater',
    desc: (v) => `Suspended radiant tube heater ${v.L} ft long for an aircraft hangar: a burner box with a vent stub at one end, a straight tube with couplings, a reflector trough above, an end cap and chain hangers up to the roof steel.`,
    vs: [20, 30, 40, 50, 60, 70, 80].map((L) => [`${L} ft long`, L * 12, 24, 30, 216, { L }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline(); const zc = Z0 + 300, r = 60;
      a.box(X0, cy - 200, zc - 200, X0 + 420, cy + 200, zc + 200); a.cyl(X0 + 210, cy, zc + 200, zc + 420, 55, 12); a.cyl(X0 + 210, cy, zc + 420, zc + 440, 75, 12); a.circ(X0 + 210, cy, 55, 'EQUIP-DETAIL');
      a.xcyl(X0 + 420, X1 - 40, cy, zc, r, 18); const n = Math.floor((W - 460) / 3000); for (let i = 1; i <= n + 1; i++) { const x = X0 + 420 + ((W - 460) * i) / (n + 2); a.xcyl(x - 25, x + 25, cy, zc, r * 1.35, 18); }
      a.xcyl(X1 - 40, X1, cy, zc, r * 1.3, 18); ext(a, [[cy - 230, zc + 40], [cy - 90, zc + 140], [cy + 90, zc + 140], [cy + 230, zc + 40], [cy + 80, zc + 80], [cy - 80, zc + 80]].map(([y, z]) => [y, z]).slice(0, 4), X0 + 430, X1 - 60);
      const hn = Math.max(2, Math.round(W / 2400)); for (let i = 0; i < hn; i++) { const x = X0 + 600 + ((W - 1200) * i) / (hn - 1); a.tube([[x, cy, zc + 140], [x, cy, Z1]], [8, 8], 5); a.box(x - 30, cy - 30, zc + 140, x + 30, cy + 30, zc + 170); a.line(x, cy - 30, x, cy + 30, 'EQUIP-DETAIL'); }
      a.line(X0 + 420, cy - 60, X1 - 40, cy - 60, 'EQUIP-DETAIL'); a.line(X0 + 420, cy + 60, X1 - 40, cy + 60, 'EQUIP-DETAIL');
      a.log('Added the burner box with its vent stub, the straight tube with couplings, the reflector trough, the end cap and the chain hangers (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hangar gas-fired unit heater',
    desc: (v) => `Suspended gas-fired unit heater of ${v.mbh} MBH for an aircraft hangar: a casing with a front discharge louver panel, a side burner box with a gas valve, a flue collar on top, a motor guard on the back and four hanger rods.`,
    vs: [['100 MBH', 24, 20, 40, 130, { mbh: 100 }], ['150 MBH', 26, 22, 42, 130, { mbh: 150 }], ['200 MBH', 30, 24, 46, 130, { mbh: 200 }], ['300 MBH', 36, 28, 50, 130, { mbh: 300 }], ['400 MBH', 42, 32, 54, 130, { mbh: 400 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); const c0 = Z0 + 80, ct = Z1 - 330;
      a.box(X0 + 40, YF + 30, c0 + 120, X1 - 40, YB - 120, ct); a.box(X0 + 20, YF + 10, c0 + 100, X1 - 20, YF + 40, ct + 20); for (let z = c0 + 170; z < ct - 40; z += 70) a.box(X0 + 70, YF - 0, z, X1 - 70, YF + 30, z + 30);
      a.box(X0 + 40, YB - 120, c0 + 120, X1 - 40, YB - 20, ct - 60); a.ycyl(YB - 20, YB, cx, (c0 + ct) / 2, Math.min(W, ct - c0) * 0.3, 20); a.cyl(cx, cy + D * 0.2, ct, ct + 220, 80, 14); a.cyl(cx, cy + D * 0.2, ct + 220, ct + 240, 105, 14); a.circ(cx, cy + D * 0.2, 80, 'EQUIP-DETAIL');
      a.box(X1 - 40, YF + 120, c0 + 150, X1, YB - 160, ct - 100); a.cyl(X1 - 20, cy, c0 + 20, c0 + 150, 20, 8); a.box(X1 - 40, cy - 30, c0 + 60, X1, cy + 30, c0 + 150);
      for (const [x, y] of [[X0 + 80, YF + 60], [X1 - 80, YF + 60], [X0 + 80, YB - 160], [X1 - 80, YB - 160]]) { a.tube([[x, y, ct], [x, y, Z1]], [9, 9], 5); }
      a.line(X0 + 40, YB - 120, X1 - 40, YB - 120, 'EQUIP-DETAIL');
      a.log('Added the casing with its discharge louver panel, the side burner box, the flue collar, the motor guard and the hanger rods (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hangar high-volume low-speed ceiling fan',
    desc: (v) => `Large-diameter ceiling fan, ${v.ft} ft across, for an aircraft hangar: a roof mounting plate, a downrod, a gear motor hub, six wide blades with tip winglets and a safety cable ring.`,
    vs: [8, 12, 16, 20, 24].map((ft) => [`${ft} ft diameter`, ft * 12 + 6, ft * 12 + 6, 36 + ft * 2, 252, { ft }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); const R = v.ft * 12 * 25.4 / 2, zh = Z0 + 260;
      a.box(cx - 260, cy - 260, Z1 - 30, cx + 260, cy + 260, Z1); a.cyl(cx, cy, zh + 200, Z1 - 30, 40, 12); a.cyl(cx, cy, zh, zh + 200, 170, 20); a.cyl(cx, cy, zh - 60, zh, 120, 16); a.circ(cx, cy, 170, 'EQUIP-DETAIL'); a.circ(cx, cy, R, 'EQUIP-DETAIL');
      for (let i = 0; i < 6; i++) { const g = (i / 6) * Math.PI * 2, c = Math.cos(g), s = Math.sin(g), px = -s, py = c, w0 = 90, w1 = 150, r0 = 230, r1 = R - 80;
        a.prism([[cx + c * r0 + px * w0, cy + s * r0 + py * w0], [cx + c * r1 + px * w1, cy + s * r1 + py * w1], [cx + c * r1 - px * w1, cy + s * r1 - py * w1], [cx + c * r0 - px * w0, cy + s * r0 - py * w0]], zh + 20, zh + 70);
        a.prism([[cx + c * r1 + px * w1, cy + s * r1 + py * w1], [cx + c * (R - 5) + px * w1, cy + s * (R - 5) + py * w1], [cx + c * (R - 5) + px * w1 * 0.8, cy + s * (R - 5) + py * w1 * 0.8], [cx + c * r1 + px * w1 * 0.8, cy + s * r1 + py * w1 * 0.8]], zh + 20, zh + 190);
        a.poly([[cx + c * r0 + px * w0, cy + s * r0 + py * w0], [cx + c * r1 + px * w1, cy + s * r1 + py * w1], [cx + c * r1 - px * w1, cy + s * r1 - py * w1], [cx + c * r0 - px * w0, cy + s * r0 - py * w0]], 'EQUIP-DETAIL'); }
      for (let i = 0; i < 3; i++) { const g = (i / 3) * Math.PI * 2 + 0.52; a.tube([[cx + Math.cos(g) * 140, cy + Math.sin(g) * 140, zh + 190], [cx + Math.cos(g) * R * 0.9, cy + Math.sin(g) * R * 0.9, zh + 70]], [4, 4], 4); }
      a.log('Added the roof mounting plate, the downrod, the motor hub, the six blades with winglets and the safety cables (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic aircraft gate preconditioned air unit, ground pad',
    desc: (v) => `Ground-pad preconditioned air unit of ${v.tons} tons for an aircraft gate: a skid with an enclosure, service doors and coil louvers, ${v.fans} condenser fans with guards on top, a discharge duct with a flange, a hose hanger and a control door.`,
    vs: [['30 ton', 168, 66, 72, 0, { tons: 30, fans: 2 }], ['60 ton', 216, 78, 84, 0, { tons: 60, fans: 3 }], ['90 ton', 264, 90, 96, 0, { tons: 90, fans: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); skid(a, X0, X1, YF + 20, YB - 20, Z0, 130); const bz = Z0 + 130, zt = Z1 - 150;
      a.box(X0 + 20, YF + 50, bz, X1 - 20, YB - 50, zt); door(a, X0 + 100, X0 + W * 0.22, bz + 100, zt - 100, YF + 50); lvF(a, X0 + W * 0.28, X0 + W * 0.74, YF + 50, bz + 100, zt - 100, 56); door(a, X0 + W * 0.78, X1 - 100, bz + 100, zt - 100, YF + 50, -1);
      a.box(X0 + 20, YF + 50, zt, X1 - 20, YB - 50, zt + 40); for (let i = 0; i < v.fans; i++) fanTop(a, X0 + 20 + ((W - 40) * (i + 0.5)) / v.fans, cy, zt + 40, Math.min((W - 40) / v.fans * 0.38, D * 0.26), 8);
      a.xcyl(X1 - 20, X1 + 0, cy, bz + (zt - bz) * 0.5, 1, 3); a.box(X1 - 20, cy - 220, bz + 200, X1, cy + 220, bz + 640); a.tube([[X0 + 120, YB - 60, zt - 100], [X0 + 20, YB - 40, zt - 300], [X0 + 20, YB - 40, bz + 100]], [14, 14, 14], 6);
      a.log('Added the skid, the enclosure with its doors and coil louvers, the condenser fans with guards, the discharge duct flange and the hose hanger (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic aircraft boarding bridge underside preconditioned air unit',
    desc: (v) => `Bridge-mounted preconditioned air unit of ${v.tons} tons: a sheet-metal enclosure with a louvered coil face, a service door, a large hose reel with wound hose, an aircraft-end hose elbow and mounting channels along the top.`,
    vs: [['30 ton', 132, 48, 60, 0, { tons: 30 }], ['60 ton', 168, 54, 66, 0, { tons: 60 }], ['90 ton', 204, 60, 72, 0, { tons: 90 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); const bz = Z0 + 100, zt = Z1 - 100, ew = W * 0.62;
      a.box(X0, YF + 60, bz, X0 + ew, YB - 20, zt); lvF(a, X0 + 60, X0 + ew * 0.5, YF + 60, bz + 60, zt - 60, 48); door(a, X0 + ew * 0.55, X0 + ew - 60, bz + 60, zt - 60, YF + 60); for (const x of [X0 + 100, X0 + ew - 200]) a.box(x, YF + 40, Z0, x + 100, YB - 40, bz); a.box(X0, YF + 40, zt, X0 + ew, YB - 40, Z1); a.rect(X0, YF + 40, X0 + ew, YB - 40, 'EQUIP-DETAIL');
      const rr = Math.min((zt - bz) * 0.45, W * 0.17), rx = X0 + ew + rr + 80; a.ycyl(YF + 120, YF + 120 + 280, rx, (bz + zt) / 2, rr, 32); a.ycyl(YF + 120 - 30, YF + 120, rx, (bz + zt) / 2, rr * 1.1, 32); a.ycyl(YF + 100, YF + 120 + 310, rx, (bz + zt) / 2, rr * 0.28, 16); for (const d of [0.35, 0.62, 0.9]) ringY(a, rx, YF + 120 - 10, (bz + zt) / 2, rr * d, 12);
      const hx = Math.min(rx + rr * 0.9, X1 - 120); a.tube([[hx, YF + 260, (bz + zt) / 2 - rr * 0.4], [hx + 20, YF + 260, Z0 + 260], [hx + 20, YF + 260, Z0 + 130]], [60, 60, 60], 12); a.cyl(hx + 20, YF + 260, Z0 + 60, Z0 + 140, 90, 14);
      a.log('Added the enclosure with its louvered coil face and service door, the hose reel with wound hose, the aircraft-end hose and the mounting channels (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic aircraft towed preconditioned air cart',
    desc: (v) => `Towed preconditioned air cart of ${v.tons} tons: a trailer frame with an engine and condenser enclosure, a coil louver face, a hose drum with wound hose at the rear, a hose end fitting, a drawbar with a coupler, a jack stand and two wheels.`,
    vs: [['20 ton', 156, 66, 78, 0, { tons: 20 }], ['40 ton', 192, 72, 84, 0, { tons: 40 }], ['60 ton', 228, 78, 92, 0, { tons: 60 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); const wr = (Z1 - Z0) * 0.2, zb = Z0 + wr * 1.5, zt = Z1 - 40, bx0 = X0 + W * 0.17, bx1 = X1 - W * 0.26;
      a.box(bx0, YF + 50, zb - 90, X1 - 20, YB - 50, zb); a.box(bx0, YF + 50, zb, bx1, YB - 50, zt); door(a, bx0 + 80, bx0 + (bx1 - bx0) * 0.3, zb + 90, zt - 90, YF + 50); lvF(a, bx0 + (bx1 - bx0) * 0.38, bx0 + (bx1 - bx0) * 0.95, YF + 50, zb + 90, zt - 90, 54);
      const rr = (zt - zb) * 0.42, rx = X1 - W * 0.13, rz = zb + (zt - zb) * 0.5; a.ycyl(YF + 120, YB - 120, rx, rz, rr * 0.3, 16); for (const y of [YF + 100, YB - 130]) a.ycyl(y, y + 30, rx, rz, rr * 1.05, 28);
      a.ycyl(YF + 130, YB - 130, rx, rz, rr * 0.9, 28); for (const d of [0.4, 0.65]) ringY(a, rx, YF + 90, rz, rr * d, 12); a.box(rx - rr * 1.05, YF + 50, zb - 90, rx + rr * 1.05, YB - 50, zb - 40);
      a.tube([[rx + rr * 0.2, YF + 200, rz - rr * 0.9], [rx + rr * 0.5, YF + 200, zb - 200], [rx + rr * 0.5, YF + 200, Z0 + 260]], [55, 55, 55], 12); a.cyl(rx + rr * 0.5, YF + 200, Z0 + 150, Z0 + 270, 85, 14);
      const ax = bx0 + (bx1 - bx0) * 0.5; for (const y of [YF + 20, YB - 20]) { wheel(a, ax, y, wr, 100); a.box(ax - wr * 1.25, y - 55, Z0 + wr * 2 + 15, ax + wr * 1.25, y + 55, Z0 + wr * 2 + 45); } a.ycyl(YF + 20, YB - 20, ax, Z0 + wr, 30, 10);
      a.box(X0, cy - 50, zb - 160, bx0, cy + 50, zb - 60); a.cyl(X0 + 60, cy, zb - 60, zb - 10, 60, 12); a.cyl(X0 + W * 0.08, cy + 140, Z0, zb - 160, 20, 8); a.line(bx1, YF, bx1, YB, 'EQUIP-DETAIL'); a.circ(rx, cy, rr * 0.9, 'EQUIP-DETAIL');
      a.log('Added the trailer frame, the engine and condenser enclosure with its louver face, the hose drum with wound hose, the hose end fitting, the drawbar, the jack stand and the wheels (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic aircraft ground heating cart',
    desc: (v) => `Diesel-fired aircraft ground heating cart of ${v.k} kBtu per hour: a cabinet with a louvered burner section and access door, two round hose outlets with collars, an exhaust stack, a fuel tank, a handle and two large wheels with a front foot.`,
    vs: [['250 kBtu per hour', 72, 36, 52, 0, { k: 250 }], ['500 kBtu per hour', 90, 42, 60, 0, { k: 500 }], ['1,000 kBtu per hour', 114, 48, 68, 0, { k: '1,000' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); const wr = (Z1 - Z0) * 0.24, zb = Z0 + wr * 1.2, zt = Z1 - (Z1 - Z0) * 0.2;
      a.box(X0 + W * 0.08, YF + 80, zb, X1 - W * 0.14, YB - 30, zt); lvF(a, X0 + W * 0.12, X0 + W * 0.42, YF + 80, zb + 40, zt - 40, 46); door(a, X0 + W * 0.48, X1 - W * 0.18, zb + 60, zt - 60, YF + 80);
      for (const k of [0.3, 0.7]) { a.xcyl(X1 - W * 0.14, X1 - 30, YF + D * k + 40, zb + (zt - zb) * 0.5, D * 0.1, 16); a.xcyl(X1 - 30, X1, YF + D * k + 40, zb + (zt - zb) * 0.5, D * 0.13, 16); a.circ(X1 - W * 0.06, YF + D * k + 40, D * 0.1, 'EQUIP-DETAIL'); }
      stack(a, X0 + W * 0.22, cy + D * 0.1, zt, Z1 - 20, 70); a.box(X0 + W * 0.36, YF + 80, zt, X0 + W * 0.36 + 380, YB - 60, Z1 - 80); wheel(a, X0 + W * 0.2, YF + 50, wr, 70); wheel(a, X0 + W * 0.2, YB - 50, wr, 70);
      a.box(X1 - W * 0.22, YF + 70, Z0, X1 - W * 0.17, YF + 120, zb); a.box(X1 - W * 0.22, YB - 70, Z0, X1 - W * 0.17, YB - 30, zb); gauge(a, X0 + W * 0.55, YF + 80, zt - 100, 24);
      a.tube([[X0 + W * 0.08, cy - D * 0.2, zt - 50], [X0, cy - D * 0.2, zt - 160], [X0, cy + D * 0.2, zt - 160], [X0 + W * 0.08, cy + D * 0.2, zt - 50]], [10, 10, 10, 10], 6);
      a.log('Added the cabinet with its louvers and access door, the two hose outlets, the stack, the fuel tank, the handle, the wheels and the foot (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hangar mobile hydraulic test stand',
    desc: (v) => `Mobile hydraulic test stand of ${v.gpm} gpm flow class for an aircraft hangar: a cabinet on four casters with a gauge panel of four dials, an oil reservoir with a sight glass and fill cap, a motor and pump housing, a filter canister, two hose reels and a push handle.`,
    vs: [['5 gpm class', 36, 24, 52, 0, { gpm: 5 }], ['15 gpm class', 44, 28, 58, 0, { gpm: 15 }], ['30 gpm class', 54, 32, 62, 0, { gpm: 30 }], ['60 gpm class', 66, 36, 68, 0, { gpm: 60 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); const c0 = Z0 + 120, zt = Z0 + (Z1 - Z0) * 0.55;
      a.box(X0 + 40, YF + 50, c0, X1 - W * 0.2, YB - 40, zt); door(a, X0 + 100, X1 - W * 0.2 - 60, c0 + 60, zt - 60, YF + 50); a.box(X0 + 40, YF + 50, zt, X1 - W * 0.2, YF + 50 + D * 0.3, zt + (Z1 - zt) * 0.35);
      a.box(X0 + 60, YF + 60, zt + (Z1 - zt) * 0.35, X1 - W * 0.2 - 20, YF + 80, Z1 - 80); for (let i = 0; i < 4; i++) gauge(a, X0 + 120 + i * ((W * 0.8 - 340) / 3), YF + 60, zt + (Z1 - zt) * 0.7, 36); a.rect(X0 + 40, YF + 50, X1 - W * 0.2, YF + 50 + D * 0.3, 'EQUIP-DETAIL');
      a.box(X0 + 40, YF + D * 0.45, zt + (Z1 - zt) * 0.35, X0 + W * 0.45, YB - 40, Z1 - 40); a.cyl(X0 + W * 0.45 - 90, YB - 110, Z1 - 40, Z1, 40, 10); a.ycyl(YF + D * 0.45 - 4, YF + D * 0.45, X0 + 130, zt + (Z1 - zt) * 0.65, 30, 10);
      a.cyl(X1 - W * 0.32, YB - 150, c0, zt + 220, 60, 14); for (let k = 0; k < 2; k++) { const rz = c0 + (zt - c0) * (0.3 + 0.4 * k), rx = X1 - W * 0.1; a.xcyl(X1 - W * 0.2, X1 - W * 0.2 + 70, cy, rz, 140, 20); a.xcyl(X1 - W * 0.2 + 70, X1 - 20, cy, rz, 100, 20); a.xcyl(X1 - 20, X1, cy, rz, 140, 20); a.xcyl(X1 - W * 0.2 - 20, X1, cy, rz, 30, 8); }
      a.tube([[X1 - W * 0.2, YB - 60, Z1 - 200], [X1 - W * 0.2 + 60, YB - 60, Z1 - 20], [X0 + W * 0.2, YB - 60, Z1 - 20]], [10, 10, 10], 6); a.tube([[X0 + 40, YB - 60, c0 + 300], [X0 + 0, YB - 60, c0 + 300]], [10, 10], 6);
      for (const [x, y] of [[X0 + 70, YF + 80], [X1 - 70, YF + 80], [X0 + 70, YB - 60], [X1 - 70, YB - 60]]) cast(a, x, y, 120);
      a.log('Added the cabinet on casters, the gauge panel, the oil reservoir with its sight glass, the filter canister, the hose reels and the push handle (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hangar aircraft fuel system test stand',
    desc: (v) => `Mobile fuel system test stand of ${v.gpm} gpm for an aircraft hangar: a frame on four wheels with a pump and motor, two filter canisters, a flow meter, a gauge panel, a hose bundle with end fittings and a grounding reel.`,
    vs: [['20 gpm class', 54, 30, 50, 0, { gpm: 20 }], ['60 gpm class', 70, 36, 56, 0, { gpm: 60 }], ['120 gpm class', 88, 42, 62, 0, { gpm: 120 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); const c0 = Z0 + 120, r = Math.min(D * 0.16, 190);
      a.box(X0 + 40, YF + 50, c0, X1 - 40, YB - 40, c0 + 60); a.rect(X0 + 40, YF + 50, X1 - 40, YB - 40, 'EQUIP-DETAIL'); a.xcyl(X0 + 80, X0 + W * 0.3, cy + D * 0.15, c0 + 60 + r + 60, r * 0.9, 18); pumpHead(a, X0 + W * 0.38, cy + D * 0.15, c0 + 60 + r + 60, W * 0.14, r * 0.8);
      for (const k of [0, 1]) { const x = X0 + W * (0.55 + 0.17 * k); a.cyl(x, cy - D * 0.1, c0 + 60, c0 + 60 + (Z1 - c0) * 0.62, r, 20); a.cyl(x, cy - D * 0.1, c0 + 60 + (Z1 - c0) * 0.62, c0 + 80 + (Z1 - c0) * 0.62, r * 1.18, 20); a.circ(x, cy - D * 0.1, r, 'EQUIP-DETAIL'); }
      a.box(X0 + 40, YF + 60, c0 + 60, X0 + 40 + W * 0.22, YF + 90, c0 + 60 + (Z1 - c0) * 0.7); for (let i = 0; i < 3; i++) gauge(a, X0 + 40 + W * 0.04 + i * W * 0.07, YF + 60, c0 + (Z1 - c0) * 0.55, 30);
      a.tube([[X0 + W * 0.4, YB - 60, c0 + 160], [X0 + W * 0.2, YB - 60, c0 + 200], [X0 + W * 0.2, YB - 60, c0 + 500], [X0 + W * 0.45, YB - 60, c0 + 500], [X0 + W * 0.45, YB - 60, c0 + 160]], [24, 24, 24, 24, 24], 8);
      a.xcyl(X1 - 40, X1, YF + 140, c0 + 300, 70, 14); a.box(X0, cy - 30, c0 + 100, X0 + 80, cy + 30, c0 + 180); a.tube([[X0 + 40, YF + 80, c0 + 60], [X0 + 20, YF + 40, Z1 - 100], [X0 + 100, YF + 40, Z1 - 20]], [8, 8, 8], 5);
      for (const [x, y] of [[X0 + 80, YF + 80], [X1 - 80, YF + 80], [X0 + 80, YB - 60], [X1 - 80, YB - 60]]) cast(a, x, y, 120);
      a.log('Added the frame on wheels, the pump and motor, the two filter canisters, the gauge panel, the hose bundle and the grounding reel (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hangar fuel filter-separator vessel',
    desc: (v) => `Horizontal filter-separator vessel of ${v.gpm} gpm for hangar fuel plant: a cylindrical shell with dished ends on two saddles, flanged inlet and outlet nozzles, a hinged end closure, a sump with a drain, a sight glass, a vent and a differential gauge.`,
    vs: R([['100 gpm', 78, 30, 40, { gpm: 100 }], ['250 gpm', 96, 36, 46, { gpm: 250 }], ['500 gpm', 120, 44, 54, { gpm: 500 }], ['800 gpm', 144, 52, 62, { gpm: 800 }], ['1,200 gpm', 168, 60, 70, { gpm: '1,200' }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); const r = Math.min(D * 0.38, (Z1 - Z0 - 560) / 2), zc = Z0 + 230 + r;
      vessel(a, X0 + 100, X1 - 100, cy, zc, r); for (const x of [X0 + W * 0.22, X1 - W * 0.22]) { saddle(a, x, cy, Z0, zc, r); a.box(x - 120, cy - r * 0.9, Z0, x + 120, cy + r * 0.9, Z0 + 30); }
      for (const [x, z] of [[X0 + W * 0.3, zc + r], [X1 - W * 0.3, zc + r]]) { a.cyl(x, cy, zc + r - 20, zc + r + 240, r * 0.2, 16); a.cyl(x, cy, zc + r + 240, zc + r + 270, r * 0.27, 16); a.circ(x, cy, r * 0.2, 'EQUIP-DETAIL'); }
      a.xcyl(X1 - 100, X1 - 70, cy, zc, r * 0.8, 24); a.xcyl(X1 - 70, X1 - 40, cy, zc, r * 0.9, 24); a.box(X1 - 100, cy - 20, zc + r * 0.5, X1 - 30, cy + 20, zc + r * 0.9); a.cyl(X0 + W * 0.5, cy, Z0 + 100, zc - r, r * 0.12, 10); a.cyl(X0 + W * 0.5, cy, Z0 + 60, Z0 + 100, r * 0.17, 10);
      a.cyl(X0 + W * 0.5, cy, zc + r - 10, zc + r + 160, 20, 8); a.ycyl(YF + 10, cy - r, X0 + W * 0.5 + 0, zc, 1, 3); gauge(a, X0 + W * 0.42, cy - r + 0, zc + r * 0.2, 34); a.ycyl(cy - r - 20, cy - r, X0 + W * 0.58, zc, 22, 10);
      a.log('Added the shell with dished ends, the saddles, the flanged nozzles, the hinged end closure, the sump drain, the sight glass, the vent and the gauge (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hangar roof power ventilator',
    desc: (v) => `Hangar roof power ventilator with a ${v.th} in throat on a square curb: a base flange, a cylindrical body with a hinged access panel, a domed cap on standoff legs, a bird screen band and a motor housing under the cap.`,
    vs: [24, 30, 36, 48].map((th) => [`${th} in throat`, th + 14, th + 14, 22 + th * 0.4, 0, { th }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = v.th * 25.4 / 2 + 80; a.outline(); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.6, 'EQUIP-DETAIL');
      a.box(X0, YF, Z0, X1, YB, Z0 + 150); a.cyl(cx, cy, Z0 + 150, Z0 + 190, r * 1.0, 28); a.cyl(cx, cy, Z0 + 190, Z0 + (Z1 - Z0) * 0.6, r * 0.8, 28); const zb = Z0 + (Z1 - Z0) * 0.6;
      for (let i = 0; i < 6; i++) { const g = (i / 6) * Math.PI * 2; a.cyl(cx + Math.cos(g) * r * 0.75, cy + Math.sin(g) * r * 0.75, zb, zb + 120, 14, 6); }
      a.cyl(cx, cy, zb - 0, zb + 120, r * 0.3, 14); for (let z = zb + 12; z < zb + 108; z += 28) a.cyl(cx, cy, z, z + 8, r * 0.86, 28);
      a.ell(cx, cy, zb + 120, r * 0.98, r * 0.98, Z1 - zb - 120, 28, 8); door(a, cx - 180, cx + 180, Z0 + 260, Z0 + 600, YF + (cy - r) - YF + 0 > 0 ? cy - r + 40 : YF + 40);
      a.log('Added the curb and base flange, the cylindrical body with its access panel, the bird screen band, the motor housing and the domed cap on standoff legs (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hangar battery shop fume hood',
    desc: (v) => `Fume hood ${v.l} in wide for an aircraft battery shop: sloped-front canopy with end plates, a vertical sliding sash with a handle, a splash lip, an interior light and one top exhaust collar.`,
    vs: [['48 in wide', 48, 34, 44, 66, { l: 48 }], ['72 in wide', 72, 34, 44, 66, { l: 72 }], ['96 in wide', 96, 36, 48, 66, { l: 96 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a; hood(a, 650, 0.35, 220); const t = 22, sz0 = Z0 + 650 > Z1 - 600 ? Z0 + 300 : Z0 + 650;
      a.box(X0 + t, YF, Z0 + 40, X1 - t, YF + 12, sz0); a.frame(X0 + t + 30, Z0 + 120, X1 - t - 30, Z0 + 650, YF - 20, YF + 10, 24); a.box(X0 + t + 60, YF - 14, Z0 + 140, X1 - t - 60, YF - 8, Z0 + 640);
      a.box(X0 + W * 0.5 - 40, YF - 50, Z0 + 330, X0 + W * 0.5 + 40, YF - 20, Z0 + 345); a.box(X0 + t, YF + 12, Z0 + 20, X1 - t, YB - 40, Z0 + 60);
      collarsTop(a, 1, 130, YB - 190, Z1 - 220, Z1); a.rect(X0 + t + 30, YF - 20, X1 - t - 30, YF + 10, 'EQUIP-DETAIL');
      a.log('Added the end plates, the sloped canopy, the sliding sash with its handle, the splash lip and the exhaust collar (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hangar aircraft exhaust extraction reel',
    desc: (v) => `Overhead hose reel for aircraft engine exhaust extraction with a ${v.hd} in hose: a mounting plate, a drum with side flanges and wound hose, a duct connection to the exhaust fan line, a spring motor housing and a hanging hose end with a nozzle.`,
    vs: [['6 in hose', 30, 22, 38, 130, { hd: 6 }], ['8 in hose', 36, 26, 46, 130, { hd: 8 }], ['10 in hose', 42, 30, 54, 130, { hd: 10 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); const rr = Math.min((Z1 - Z0) * 0.3, W * 0.28), zc = Z1 - 100 - rr;
      a.box(X0 + 40, YF + 40, Z1 - 60, X1 - 40, YB - 40, Z1); a.box(X0 + 60, YF + 60, zc - 40, X0 + 100, YB - 60, Z1 - 60); a.box(X1 - 100, YF + 60, zc - 40, X1 - 60, YB - 60, Z1 - 60);
      a.xcyl(X0 + 100, X1 - 100, cy, zc, rr * 0.35, 20); for (const x of [X0 + 100, X1 - 130]) a.xcyl(x, x + 30, cy, zc, rr, 28); a.xcyl(X0 + 130, X1 - 130, cy, zc, rr * 0.9, 28); for (let x = X0 + 150; x < X1 - 150; x += 36) a.xcyl(x, x + 14, cy, zc, rr * 0.95, 28);
      a.xcyl(X1 - 60, X1 - 20, cy, zc, rr * 0.5, 16); a.box(X1 - 120, cy - 120, zc - rr * 0.3, X1 - 20, cy + 120, zc + rr * 0.3);
      a.tube([[cx, cy, zc - rr], [cx, cy, zc - rr - 300], [cx, cy, Z0 + 260], [cx, cy, Z0 + 140]], [v.hd * 12.7, v.hd * 12.7, v.hd * 12.7, v.hd * 12.7], 12); a.cone(cx, cy, Z0 + 20, Z0 + 140, v.hd * 25.4 * 0.9, v.hd * 12.7, 14);
      a.line(X0 + 100, cy, X1 - 100, cy, 'EQUIP-DETAIL'); a.circ(cx, cy, v.hd * 12.7, 'EQUIP-DETAIL');
      a.log('Added the mounting plate, the drum with side flanges and wound hose, the duct connection, the spring motor housing and the hanging hose end with its nozzle (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hangar compressed air plant',
    desc: (v) => `Hangar compressed air plant, ${v.cl}: ${v.n} rotary compressor cabinets with louvers and gauges, a refrigerated dryer cabinet, a horizontal air receiver on saddles, a discharge header and a control cabinet with a door.`,
    vs: [['duplex, 20 hp class', 108, 42, 72, 0, { n: 2, cl: 'duplex, 20 hp class' }], ['duplex, 50 hp class', 144, 48, 78, 0, { n: 2, cl: 'duplex, 50 hp class' }], ['duplex, 100 hp class', 180, 54, 84, 0, { n: 2, cl: 'duplex, 100 hp class' }], ['triplex, 100 hp class', 228, 54, 84, 0, { n: 3, cl: 'triplex, 100 hp class' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 70); const ch = Z1 - Z0 - 330, cw = (W - 1500) / v.n;
      for (let i = 0; i < v.n; i++) { const x0 = X0 + 40 + i * cw; a.box(x0, YF + 40, Z0 + 70, x0 + cw - 40, YB - 700, Z0 + 70 + ch); lvF(a, x0 + 40, x0 + cw - 120, YF + 40, Z0 + 160, Z0 + 70 + ch * 0.62, 55); gauge(a, x0 + cw / 2, YF + 40, Z0 + 70 + ch * 0.82, 32); a.rect(x0, YF + 40, x0 + cw - 40, YB - 700, 'EQUIP-DETAIL'); }
      const dx = X0 + 40 + v.n * cw; a.box(dx, YF + 40, Z0 + 70, dx + 480, YB - 700, Z0 + 70 + ch * 0.78); door(a, dx + 40, dx + 440, Z0 + 150, Z0 + 70 + ch * 0.55, YF + 40);
      const tr = Math.min(D * 0.2, 280); vessel(a, X0 + 140, X1 - 540, YB - tr - 60, Z0 + 70 + tr + 100, tr); saddle(a, X0 + 400, YB - tr - 60, Z0 + 70, Z0 + 70 + tr + 100, tr); saddle(a, X1 - 800, YB - tr - 60, Z0 + 70, Z0 + 70 + tr + 100, tr);
      a.box(X1 - 500, YF + 40, Z0 + 70, X1 - 40, YB - 700, Z0 + 70 + ch); door(a, X1 - 460, X1 - 80, Z0 + 150, Z0 + 70 + ch - 150, YF + 40, -1);
      a.xcyl(X0 + 60, X1 - 60, YB - 520, Z1 - 150, 34, 12); for (let i = 0; i < v.n; i++) a.cyl(X0 + 40 + (i + 0.5) * cw, YB - 520, Z0 + 70 + ch, Z1 - 150, 22, 8);
      a.log('Added the compressor cabinets, the dryer cabinet, the horizontal receiver on saddles, the discharge header and the control cabinet (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic aircraft avionics cooling cart',
    desc: (v) => `Mobile avionics cooling cart of ${v.kw} kW for aircraft on the ground: a cabinet with a louvered condenser face, a control panel, a coiled supply hose on a drum, a hose end fitting, a push handle and four casters.`,
    vs: [['3 kW', 30, 22, 40, 0, { kw: 3 }], ['6 kW', 36, 26, 46, 0, { kw: 6 }], ['12 kW', 46, 30, 52, 0, { kw: 12 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline(); const c0 = Z0 + 110, zt = Z1 - 150, rr = (zt - c0) * 0.3;
      a.box(X0 + 20, YF + 40, c0, X1 - W * 0.3, YB - 20, zt); lvF(a, X0 + 60, X1 - W * 0.3 - 60, YF + 40, c0 + 60, c0 + (zt - c0) * 0.5, 40); door(a, X0 + 60, X1 - W * 0.3 - 60, c0 + (zt - c0) * 0.58, zt - 50, YF + 40); gauge(a, X0 + 140, YF + 40, zt - 100, 22);
      a.xcyl(X1 - W * 0.3, X1 - 30, cy, c0 + (zt - c0) * 0.5, rr * 0.25, 14); for (const x of [X1 - W * 0.3, X1 - 70]) a.xcyl(x, x + 40, cy, c0 + (zt - c0) * 0.5, rr, 24); a.xcyl(X1 - W * 0.3 + 40, X1 - 70, cy, c0 + (zt - c0) * 0.5, rr * 0.8, 24);
      a.tube([[X1 - 30, cy, c0 + (zt - c0) * 0.5 - rr * 0.8], [X1, cy, c0 + 60], [X1 - 5, cy, Z0 + 40]], [34, 34, 34], 10); a.tube([[X0 + 20, cy - D * 0.2, zt - 60], [X0, cy - D * 0.2, Z1 - 20], [X0 + 20, cy + D * 0.2, Z1 - 20], [X0 + 20, cy + D * 0.2, zt - 60]], [10, 10, 10, 10], 6);
      for (const [x, y] of [[X0 + 60, YF + 70], [X1 - 60, YF + 70], [X0 + 60, YB - 50], [X1 - 60, YB - 50]]) cast(a, x, y, 110);
      a.log('Added the cabinet with its louvered condenser face, the control panel, the hose drum with coiled hose, the push handle and the casters (plan and 3D).');
    } }),
  fam({ cat: EQ, title: 'Generic hangar paint booth supply filter wall',
    desc: (v) => `Supply filter wall section ${v.cols} filters wide and ${v.rows} high for a hangar paint booth: a steel frame with a grid of filter cells, a top plenum with ${v.nc} round duct collars, a side access door and base feet.`,
    vs: [['4 by 3 cells', 96, 30, 90, 0, { cols: 4, rows: 3, nc: 2 }], ['6 by 4 cells', 144, 30, 114, 0, { cols: 6, rows: 4, nc: 3 }], ['8 by 5 cells', 192, 32, 138, 0, { cols: 8, rows: 5, nc: 4 }], ['10 by 6 cells', 240, 34, 162, 0, { cols: 10, rows: 6, nc: 5 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, cy } = a; a.outline(); const pz = Z1 - 300, fz0 = Z0 + 120, cw = (W - 200) / v.cols, ch = (pz - fz0 - 40) / v.rows;
      for (const x of [X0, X1 - 80]) a.box(x, YF + 20, Z0, x + 80, YB - 20, pz); a.box(X0, YF + 20, fz0 - 40, X1, YB - 20, fz0); a.box(X0, YF + 20, Z0, X1, YB - 20, 40);
      for (let i = 0; i < v.cols; i++) for (let j = 0; j < v.rows; j++) { const x0 = X0 + 100 + i * cw + 10, z0 = fz0 + 20 + j * ch + 10; a.box(x0, YF + 40, z0, x0 + cw - 20, YF + 140, z0 + ch - 20); a.box(x0 + 10, YF + 30, z0 + 10, x0 + cw - 30, YF + 40, z0 + ch - 30); }
      a.box(X0, YF + 20, pz, X1, YB - 20, Z1 - 120); a.rect(X0, YF + 20, X1, YB - 20, 'EQUIP-DETAIL'); for (let i = 0; i < v.nc; i++) { const x = X0 + (W * (i + 0.5)) / v.nc; a.cyl(x, cy, Z1 - 120, Z1, Math.min(D * 0.28, W / v.nc * 0.3), 18); a.circ(x, cy, Math.min(D * 0.28, W / v.nc * 0.3), 'EQUIP-DETAIL'); }
      for (let i = 1; i < v.cols; i++) a.line(X0 + 100 + i * cw, YF + 20, X0 + 100 + i * cw, YB - 20, 'EQUIP-DETAIL'); door(a, X1 - 78, X1 - 2, pz - 700, pz - 60, YF + 20, -1);
      a.log('Added the steel frame, the grid of filter cells, the top plenum with its duct collars, the side access door and the base feet (plan and 3D).');
    } }),
];

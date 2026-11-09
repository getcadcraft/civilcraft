/* SPDX-License-Identifier: Apache-2.0 */
/** Round 4, electrical: restaurant, airport and retail lighting, power, low voltage and life safety. Original geometry; sizes are generic. */
import { fam, cab, tbl, pull, T, GAP, leaves, F, FU, M, S, C, O, A } from './r4-kit.mjs';

const IN = 25.4;
const CEIL = 108;                       // ceiling height used for pendants and ceiling devices (in)
const m = Math;

/** a thin ring (a closed loop of tube) at height z */
function ring(a, cx, cy, z, r, t = 3, n = 28) {
  const pts = []; for (let i = 0; i <= n; i++) { const g = (i / n) * m.PI * 2; pts.push([cx + m.cos(g) * r, cy + m.sin(g) * r, z]); }
  a.tube(pts, pts.map(() => t), 5);
}
/** a hemispherical dome opening downward from zt (top) to zt-h with radius r */
function dome(a, cx, cy, zt, r, h, n = 7) {
  const pts = [], rad = [];
  for (let i = 0; i <= n; i++) { const t = (i / n) * m.PI / 2; pts.push([cx, cy, zt - h * m.sin(t)]); rad.push(m.max(0.5, r * m.cos(t))); }
  a.tube(pts, rad, 24);
}
/** a ceiling canopy: a short disc with a ring in plan */
function canopy(a, cx, cy, zt, r = 60) { a.cyl(cx, cy, zt - 28, zt, r, 18); a.circ(cx, cy, r, 'EQUIP-DETAIL'); }
/** a rectangular wire/cable pair from (x,y) down from z1 to z0 */
function cables(a, xs, y, z0, z1, t = 3) { for (const x of xs) a.tube([[x, y, z0], [x, y, z1]], [t, t], 6); }
/** a round plate on a wall facing −Y: radius r at (x, zc) */
function disc(a, x, zc, r, t = 8, y = a.YF) { a.ycyl(y, y + t, x, zc, r, 20); a.circ(x, y + t / 2, r, 'EQUIP-DETAIL'); }
/** a lit lens panel on the −Y face (thin light box) */
function lens(a, x0, z0, x1, z1, y = a.YF) { a.box(x0, y - 3, z0, x1, y, z1); a.rect(x0, y - 3, x1, y, 'EQUIP-DETAIL'); }
/** a wall back plate on the −Y side of the back wall plane */
const wallPlate = (a, x0, z0, x1, z1, t = 10) => a.box(x0, a.YB - t, z0, x1, a.YB, z1);

const FAMS = [
  // ===================================================== restaurant and bar lighting =====================================================
  fam({ cat: 'electrical/fixtures', title: 'Generic glass globe pendant',
    desc: (v) => `Globe pendant with a ${v.dia} in glass sphere, a metal neck collar, a cord drop and a ceiling canopy${v.cage ? ', with a wire cage of rings around the globe' : ''}.`,
    vs: [8, 10, 12, 14, 16, 20].map((d, i) => [`${d} in globe${i === 2 || i === 4 ? ', wire cage' : ''}`, d, d, d + 30, CEIL - d - 30, { dia: d, cage: i === 2 || i === 4 }]),
    build: (a, v) => {
      const r = a.W / 2, cx = a.cx, cy = a.cy, zc = a.Z0 + r;
      a.circ(cx, cy, r); a.circ(cx, cy, r * 0.7, 'EQUIP-DETAIL');
      a.ell(cx, cy, zc, r, r, r, 22, 11);
      a.cyl(cx, cy, zc + r * 0.9, zc + r + 24, m.min(r * 0.28, 42), 14);
      a.tube([[cx, cy, zc + r + 24], [cx, cy, a.Z1 - 26]], [4, 4], 6);
      canopy(a, cx, cy, a.Z1, m.min(r * 0.4, 70));
      if (v.cage) { for (const f of [0.55, 0.88]) ring(a, cx, cy, zc + r * (f - 0.5) * 0.9, r * m.sqrt(1 - ((f - 0.5) * 0.9) ** 2) * 1.02, 2.5); for (const f of [-0.55, -0.88]) ring(a, cx, cy, zc + r * (f + 0.5) * 0.9, r * m.sqrt(1 - ((f + 0.5) * 0.9) ** 2) * 1.02, 2.5); ring(a, cx, cy, zc, r * 1.02, 2.5); }
      a.log('Added the glass globe, neck collar, cord and canopy' + (v.cage ? ' and the wire cage rings' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic drum shade pendant',
    desc: (v) => `${v.taper ? 'Tapered' : 'Straight-sided'} drum shade pendant, ${v.dia} in across, hung from a canopy by three cords to a top spider and with a bottom diffuser disc.`,
    vs: [['12 in straight', 12, 12, 10 + 30, 0, { dia: 12, hs: 10 }], ['16 in straight', 16, 16, 12 + 30, 0, { dia: 16, hs: 12 }], ['20 in straight', 20, 20, 14 + 30, 0, { dia: 20, hs: 14 }], ['24 in tapered', 24, 24, 16 + 30, 0, { dia: 24, hs: 16, taper: true }], ['30 in tapered', 30, 30, 18 + 30, 0, { dia: 30, hs: 18, taper: true }]]
      .map((r) => { r[4] = CEIL - r[3]; return r; }),
    build: (a, v) => {
      const r = a.W / 2, cx = a.cx, cy = a.cy, hs = v.hs * IN, zb = a.Z0, zt = zb + hs, r1 = v.taper ? r * 0.72 : r;
      a.circ(cx, cy, r); a.circ(cx, cy, r1, 'EQUIP-DETAIL');
      a.cone(cx, cy, zb, zt, r, r1, 28);
      a.cyl(cx, cy, zb - 0, zb + 6, r * 0.97, 28);
      ring(a, cx, cy, zt, r1, 4); ring(a, cx, cy, zb + 3, r, 4);
      for (let i = 0; i < 3; i++) { const g = (i / 3) * m.PI * 2 + 0.5; a.tube([[cx + m.cos(g) * r1, cy + m.sin(g) * r1, zt], [cx, cy, a.Z1 - 120]], [2.5, 2.5], 5); }
      a.cyl(cx, cy, a.Z1 - 140, a.Z1 - 120, 30, 10); a.tube([[cx, cy, a.Z1 - 120], [cx, cy, a.Z1 - 28]], [4, 4], 6);
      canopy(a, cx, cy, a.Z1, 60);
      a.log('Added the drum shade, bottom diffuser, rim rings, three spider cords and the canopy (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic bar pendant rail',
    desc: (v) => `Bar pendant rail with a ${v.n}-lamp canopy bar hung on two cables and ${v.n} drop pendants with conical shades at staggered heights.`,
    vs: [2, 3, 4, 5].map((n) => [`${n} lamp`, 14 + 14 * n, 12, 30, 72, { n }]).concat([[ '6 lamp', 100, 12, 30, 72, { n: 6 }]]),
    build: (a, v) => {
      const { X0, X1, cy, Z0, Z1, W } = a, n = v.n, step = (W - 160) / n;
      a.rect(X0, cy - 60, X1, cy + 60); a.box(X0, cy - 60, Z1 - 40, X1, cy + 60, Z1);
      cables(a, [X0 + 80, X1 - 80], cy, Z1, Z1 + 0.5, 3);
      for (let i = 0; i < n; i++) {
        const x = X0 + 80 + step * (i + 0.5), drop = 220 + (i % 2) * 120, zs = Z1 - 40 - drop;
        a.tube([[x, cy, Z1 - 40], [x, cy, zs + 120]], [3, 3], 6);
        a.cone(x, cy, zs, zs + 120, 85, 28, 18); a.ell(x, cy, zs + 4, 40, 40, 14, 12, 5);
        a.circ(x, cy, 85, 'EQUIP-DETAIL');
      }
      a.log('Added the canopy bar, two hanging cables and staggered drop pendants with conical shades (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic wall sconce',
    desc: (v) => ({ arm: 'Wall sconce with a back plate, a curved arm and a conical shade.', swing: 'Wall sconce with a back plate, a two-joint swing arm and a conical shade.', twin: 'Wall sconce with a back plate and two curved arms, each with a conical shade.', up: 'Wall sconce with a back plate and a half-round up-light shell that throws light at the ceiling.', picture: 'Picture light with a back plate, a long curved arm and a long hood lamp.' }[v.kind]),
    vs: [['curved arm, 8 in', 6, 10, 12, 66, { kind: 'arm' }], ['swing arm, 22 in reach', 6, 22, 14, 60, { kind: 'swing' }], ['twin arm', 20, 10, 14, 66, { kind: 'twin' }], ['half-round up-light', 12, 5, 8, 72, { kind: 'up' }], ['picture light, 24 in', 24, 9, 6, 78, { kind: 'picture' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, zm = (Z0 + Z1) / 2; a.outline();
      const shade = (x, y, z, r) => { a.cone(x, y, z - 50, z + 120, r * 0.6, r, 16); a.circ(x, y, r, 'EQUIP-DETAIL'); };
      if (v.kind === 'arm') { a.box(cx - 40, YB - 10, Z0, cx + 40, YB, Z1); a.tube([[cx, YB - 10, zm], [cx, YB - 90, zm - 30], [cx, YF + 60, zm + 20]], [9, 9, 9], 8); shade(cx, YF + 70, zm + 60, 60); }
      else if (v.kind === 'swing') { a.box(cx - 40, YB - 10, Z0, cx + 40, YB, Z1); a.ell(cx, YB - 40, zm, 16, 16, 16, 8, 5); a.tube([[cx, YB - 40, zm], [cx + 20, YB - 250, zm + 40]], [8, 8], 8); a.ell(cx + 20, YB - 250, zm + 40, 14, 14, 14, 8, 5); a.tube([[cx + 20, YB - 250, zm + 40], [cx - 10, YF + 60, zm + 20]], [8, 8], 8); shade(cx - 10, YF + 70, zm + 50, 65); }
      else if (v.kind === 'twin') { a.box(cx - 140, YB - 10, zm - 40, cx + 140, YB, zm + 40); for (const s of [-1, 1]) { a.tube([[cx + s * 100, YB - 10, zm], [cx + s * 200, YB - 80, zm + 20], [cx + s * 200, YF + 40, zm + 80]], [8, 8, 8], 8); shade(cx + s * 200, YF + 50, zm + 120, 55); } }
      else if (v.kind === 'up') { a.box(X0, YB - 8, Z0, X1, YB, Z1); a.prism([[X0 + 10, YB - 8], [X1 - 10, YB - 8], [X1 - 30, YF + 20], [X0 + 30, YF + 20]], Z0 + 20, Z1 - 10); a.ell(cx, YB - 60, Z1 - 20, W / 2 - 10, 50, 12, 14, 5); a.line(X0 + 30, YF + 40, X1 - 30, YF + 40, 'EQUIP-DETAIL'); }
      else { a.box(cx - 25, YB - 8, Z0, cx + 25, YB, Z1); a.tube([[cx, YB - 8, Z1 - 20], [cx, YB - 100, Z1 - 5], [cx, YF + 60, Z1 - 30]], [6, 6, 6], 8); a.box(X0 + 20, YF, Z1 - 60, X1 - 20, YF + 70, Z1 - 5); a.rect(X0 + 20, YF, X1 - 20, YF + 70, 'EQUIP-DETAIL'); }
      a.log('Added the back plate, ' + (v.kind === 'up' ? 'the up-light shell' : v.kind === 'picture' ? 'the arm and the hood lamp' : 'the arm' + (v.kind === 'twin' ? 's' : '') + ' and the shade' + (v.kind === 'twin' ? 's' : '')) + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic track lighting run',
    desc: (v) => `Surface track ${v.len} ft long with a live-end cap, ceiling clips and ${v.heads} adjustable spot heads, each with an adapter, a yoke and an angled can.`,
    vs: [[2, 2], [4, 3], [6, 4], [8, 5], [10, 6], [12, 7]].map(([L, h]) => [`${L} ft, ${h} heads`, L * 12, 3, 12, CEIL - 12, { len: L, heads: h }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cy, W } = a; a.rect(X0, cy - 18, X1, cy + 18);
      a.box(X0, cy - 18, Z1 - 22, X1, cy + 18, Z1); a.box(X0 + 6, cy - 12, Z1 - 4, X1 - 6, cy + 12, Z1); a.box(X0, cy - 22, Z1 - 30, X0 + 40, cy + 22, Z1);
      for (const x of [X0 + 120, X1 - 120]) a.box(x - 15, cy - 25, Z1 - 4, x + 15, cy + 25, Z1 + 0.1);
      const n = v.heads;
      for (let i = 0; i < n; i++) {
        const x = X0 + 150 + ((W - 300) * i) / m.max(1, n - 1), s = i % 2 ? 1 : -1;
        a.cyl(x, cy, Z1 - 70, Z1 - 22, 14, 8); a.box(x - 22, cy - 5, Z1 - 100, x + 22, cy + 5, Z1 - 66);
        a.tube([[x, cy, Z1 - 100], [x + 25, cy + s * 70, Z1 - 175]], [30, 38], 12); a.cone(x + 25, cy + s * 70, Z1 - 200, Z1 - 175, 42, 36, 12);
        a.circ(x + 25, cy + s * 70, 38, 'EQUIP-DETAIL');
      }
      a.log('Added the track body with end cap and clips, and adjustable spot heads on adapters and yokes (plan and 3D).');
    } }),

  // ===================================================== airport lighting =====================================================
  fam({ cat: 'electrical/fixtures', title: 'Generic suspended linear luminaire',
    desc: (v) => `Suspended linear luminaire, ${v.len} ft long, with a ${v.both ? 'lower lens and an upper uplight lens' : 'lower lens only'}, end caps and two aircraft-cable hangers at each end.`,
    vs: [[4, false], [4, true], [8, false], [8, true], [12, false], [12, true]].map(([L, both]) => [`${L} ft, ${both ? 'direct and indirect' : 'direct'}`, L * 12, 5, 96 > 0 ? 36 : 0, 84, { len: L, both }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cy } = a, zh = Z0 + 80; a.rect(X0, cy - 64, X1, cy + 64); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
      a.box(X0, cy - 64, Z0, X1, cy + 64, zh); a.box(X0 + 10, cy - 54, Z0 - 0, X1 - 10, cy + 54, Z0 + 10);
      a.box(X0 + 4, cy - 58, Z0 + 10, X0 + 12, cy + 58, zh); a.box(X1 - 12, cy - 58, Z0 + 10, X1 - 4, cy + 58, zh);
      if (v.both) { a.box(X0 + 20, cy - 50, zh, X1 - 20, cy + 50, zh + 16); a.box(X0 + 20, cy - 62, zh, X1 - 20, cy - 50, zh + 40); a.box(X0 + 20, cy + 50, zh, X1 - 20, cy + 62, zh + 40); }
      const xs = v.len > 4 ? [X0 + 150, X1 - 150, a.cx] : [X0 + 150, X1 - 150];
      for (const x of xs) { a.tube([[x, cy - 40, zh + 20], [x - 0, cy - 5, Z1 - 20]], [2.5, 2.5], 5); a.tube([[x, cy + 40, zh + 20], [x, cy + 5, Z1 - 20]], [2.5, 2.5], 5); a.box(x - 25, cy - 20, Z1 - 20, x + 25, cy + 20, Z1); }
      a.log('Added the housing, lower lens, end caps' + (v.both ? ', the uplight lens' : '') + ' and the cable hangers with ceiling plates (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic round high-bay luminaire',
    desc: (v) => `Round high-bay luminaire, ${v.dia} in across, with a finned heat-sink cone, a reflector skirt, a bottom lens ring and a ${v.hook ? 'hook-and-cord hanger' : 'pendant stem hanger'}.`,
    vs: [[12, true], [14, true], [16, true], [20, false], [24, false]].map(([d, hook]) => [`${d} in, ${hook ? 'hook mount' : 'stem mount'}`, d, d, 14 + 12, CEIL + 60, { dia: d, hook }]),
    build: (a, v) => {
      const { Z0, Z1, cx, cy } = a, r = a.W / 2, zs = Z0 + 180;
      a.circ(cx, cy, r); a.circ(cx, cy, r * 0.62, 'EQUIP-DETAIL'); a.circ(cx, cy, r * 0.8, 'EQUIP-DETAIL');
      a.cone(cx, cy, Z0, zs, r * 0.55, r, 28); a.cone(cx, cy, Z0 + 4, Z0 + 50, r * 0.52, r * 0.56, 24);
      a.cyl(cx, cy, zs, zs + 120, r * 0.62, 24);
      for (let i = 0; i < 12; i++) { const g = (i / 12) * m.PI * 2; a.box(cx + m.cos(g) * r * 0.62 - 4, cy + m.sin(g) * r * 0.62 - 4, zs, cx + m.cos(g) * r * 0.75 + 4, cy + m.sin(g) * r * 0.75 + 4, zs + 120); }
      a.cyl(cx, cy, zs + 120, zs + 150, r * 0.5, 20);
      if (v.hook) { a.tube([[cx, cy, zs + 150], [cx, cy, Z1 - 60]], [5, 5], 6); a.ell(cx, cy, Z1 - 40, 30, 12, 40, 10, 5); ring(a, cx, cy, Z1 - 20, 22, 4, 12); }
      else { a.cyl(cx, cy, zs + 150, Z1 - 20, 16, 10); a.cyl(cx, cy, Z1 - 20, Z1, 50, 16); }
      a.log('Added the lens ring, reflector skirt, finned housing and the hanger (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic apron floodlight head',
    desc: (v) => `Apron floodlight head with ${v.n} rectangular flood luminaires on a bar frame with a visor on each, an aiming bracket and a pole-top mounting sleeve.`,
    vs: [[2, 1], [4, 2], [6, 2], [8, 2], [12, 3]].map(([n, rows]) => [`${n} lamp`, 24 + 18 * (n / rows), 18 + rows * 6, 12 + rows * 8, 0, { n, rows }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, cols = v.n / v.rows;
      a.outline(); a.cyl(cx, cy, Z0, Z0 + 140, 55, 16); a.box(X0, cy - 30, Z0 + 130, X1, cy + 30, Z0 + 170);
      const lw = (W - 80) / cols;
      for (let r = 0; r < v.rows; r++) for (let c = 0; c < cols; c++) {
        const x0 = X0 + 40 + c * lw + 8, x1 = X0 + 40 + (c + 1) * lw - 8, zr = Z0 + 190 + r * 215, y1 = cy + 90 + 10;
        a.box(x0, cy - 100, zr, x1, y1, zr + 190); a.box(x0 - 4, YF + 4, zr + 175, x1 + 4, cy - 100, zr + 205); a.box(x0 + 8, YF + 8, zr + 10, x1 - 8, cy - 100, zr + 14);
        a.rect(x0, cy - 100, x1, y1, 'EQUIP-DETAIL');
      }
      a.log('Added the sleeve, the cross bar and the flood luminaires with visors arranged in ' + v.rows + ' row' + (v.rows > 1 ? 's' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic hanging wayfinding sign light box',
    desc: (v) => `Double-face illuminated hanging sign, ${v.w} in wide, with a lit panel on each face, an extruded frame, two hanger rods and ${v.arrows} arrow bars on the faces.`,
    vs: [[48, 14, 1], [60, 16, 2], [72, 18, 2], [96, 20, 3], [120, 24, 3]].map(([w, h, ar]) => [`${w} x ${h} in`, w, 4, h + 24, CEIL - 24 > 0 ? 96 - (h) : 0, { w, h, arrows: ar }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, hh = v.h * IN, zb = Z0;
      a.outline(); a.box(X0, YF, zb, X1, YB, zb + hh); a.frame(X0, zb, X1, zb + hh, YF - 2, YF, 14); a.frame(X0, zb, X1, zb + hh, YB, YB + 2, 14);
      a.box(X0 + 14, YF - 4, zb + 14, X1 - 14, YF, zb + hh - 14); a.box(X0 + 14, YB, zb + 14, X1 - 14, YB + 4, zb + hh - 14);
      a.line(X0 + 14, cy, X1 - 14, cy, 'EQUIP-DETAIL');
      for (let i = 0; i < v.arrows; i++) { const x = X0 + 110 + i * 260 > X1 - 120 ? X0 + 110 + i * 150 : X0 + 110 + i * 260; a.box(x, YF - 8, zb + hh * 0.45, x + 120, YF - 4, zb + hh * 0.55); a.prism([[x + 120, YF - 8], [x + 120, YF - 4], [x + 150, YF - 4]], zb + hh * 0.38, zb + hh * 0.62); }
      for (const x of [X0 + 140, X1 - 140]) { a.tube([[x, cy, zb + hh], [x, cy, Z1 - 20]], [6, 6], 8); a.box(x - 40, cy - 40, Z1 - 20, x + 40, cy + 40, Z1); a.circ(x, cy, 6, 'EQUIP-DETAIL'); }
      a.log('Added the framed light box with lit faces, arrow bars and two hanger rods with ceiling plates (plan and 3D).');
    } }),

  // ===================================================== retail lighting =====================================================
  fam({ cat: 'electrical/fixtures', title: 'Generic showcase strip light',
    desc: (v) => `Showcase strip light, ${v.len} in long, with an aluminium channel, a frosted diffuser, two end caps, two mounting clips and a lead wire with an inline plug.`,
    vs: [24, 36, 48, 60, 72].map((L) => [`${L} in`, L, 1.2, 1, 40, { len: L }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy } = a; a.outline();
      a.box(X0, YF, Z0 + 5, X1, YB, Z1); a.box(X0 + 3, YF + 4, Z0, X1 - 3, YB - 4, Z0 + 6); a.box(X0, YF, Z0, X0 + 8, YB, Z1); a.box(X1 - 8, YF, Z0, X1, YB, Z1);
      a.line(X0 + 8, YF + 4, X1 - 8, YF + 4, 'EQUIP-DETAIL'); a.line(X0 + 8, YB - 4, X1 - 8, YB - 4, 'EQUIP-DETAIL');
      for (const x of [X0 + 70, X1 - 70]) a.box(x - 15, YF - 6, Z1 - 8, x + 15, YB + 0, Z1 + 0.2);
      a.tube([[X1 - 2, cy, Z0 + 12], [X1 + 20, cy, Z0 + 12], [X1 + 20, cy, Z0 + 12]], [2, 2, 2], 5);
      a.log('Added the channel, diffuser, end caps, clips and the lead wire (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic illuminated blade sign',
    desc: (v) => `Projecting blade sign with a ${v.round ? 'round' : 'square'} double-face ${v.dia} in light box on a wall bracket arm with a diagonal brace and a back plate.`,
    vs: [[18, false], [24, false], [30, false], [24, true], [30, true], [36, true]].map(([s, round]) => [`${s} in ${round ? 'round' : 'square'}`, s + 6, 40, s + 12, 114 - s / 2, { dia: s, round }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, s = v.dia * IN, xs = a.cx, y0 = YB - 90;
      a.outline(); a.box(xs - 30, YB - 14, Z0 + 20, xs + 30, YB, Z1 - 20);
      a.box(xs - 8, YF + 6, Z1 - 40, xs + 8, YB - 14, Z1 - 20); a.tube([[xs, YB - 14, Z0 + 40], [xs, YF + 120, Z1 - 40]], [8, 8], 6);
      const zc = Z0 + (Z1 - Z0) / 2 - 20, y1 = YF + 20, y2 = YF + 20 + 100;
      if (v.round) { a.ycyl(YF + 20, YF + 120, xs, zc, s / 2, 28); a.ycyl(YF + 16, YF + 20, xs, zc, s / 2 - 8, 28); a.ycyl(YF + 120, YF + 124, xs, zc, s / 2 - 8, 28); a.circ(xs, YF + 70, 0.1, 'EQUIP-DETAIL'); a.ellp(xs, YF + 70, 3, 50); }
      else { a.box(xs - s / 2, YF + 20, zc - s / 2, xs + s / 2, YF + 120, zc + s / 2); a.box(xs - s / 2 + 12, YF + 14, zc - s / 2 + 12, xs + s / 2 - 12, YF + 20, zc + s / 2 - 12); a.rect(xs - 3, YF + 20, xs + 3, YF + 120, 'EQUIP-DETAIL'); }
      a.tube([[xs, YF + 70, zc + s / 2], [xs, YF + 70, Z1 - 40]], [5, 5], 6);
      a.log('Added the wall plate, bracket arm with brace, the ' + (v.round ? 'round' : 'square') + ' two-face light box and its hanger (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic gimbal accent downlight',
    desc: (v) => `Recessed gimbal downlight, ${v.ap} in aperture, with a trim flange, a tilting inner lamp on a gimbal ring, a housing can and a junction box.`,
    vs: [3, 4, 5, 6, 8].map((d) => [`${d} in aperture`, d + 2, d + 2, 9 + d, CEIL - 9 - d + 1, { ap: d }]),
    build: (a, v) => {
      const { Z0, Z1, cx, cy } = a, r = (v.ap * IN) / 2, R = a.W / 2;
      a.circ(cx, cy, R); a.circ(cx, cy, r, 'EQUIP-DETAIL'); a.circ(cx, cy, r * 0.6, 'EQUIP-DETAIL');
      a.cone(cx, cy, Z1 - 6, Z1, R, R, 28); a.cone(cx, cy, Z0 + 20, Z1 - 6, r * 1.05, r * 1.1, 24);
      a.cyl(cx, cy, Z1 - 60, Z1 - 50, r * 1.1 + 2, 22);
      a.tube([[cx, cy, Z1 - 6], [cx + 30, cy, Z0 + 28]], [r * 0.75, r * 0.6], 20); a.ell(cx + 30, cy, Z0 + 20, r * 0.62, r * 0.62, 18, 14, 5);
      ring(a, cx, cy, Z1 - 10, r * 0.95, 3, 24);
      a.box(cx + r * 0.5, cy - 40, Z1, cx + r * 0.5 + 100, cy + 40, Z1 + 0.1);
      a.log('Added the trim flange, housing can, gimbal ring and the tilted inner lamp (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic mall plaza bollard light',
    desc: (v) => `Plaza bollard luminaire, ${v.hgt} in tall, with a round base plate with four anchor bolts, a post shaft, a ${v.louver ? 'louvered light band' : 'clear light band'} and a flat cap.`,
    vs: [[30, false], [36, true], [42, true], [48, false]].map(([h, lv]) => [`${h} in${lv ? ', louvered' : ''}`, 9, 9, h, 0, { hgt: h, louver: lv }]),
    build: (a, v) => {
      const { Z0, Z1, cx, cy } = a, r = 60;
      a.circ(cx, cy, 110); a.circ(cx, cy, r, 'EQUIP-DETAIL');
      a.cyl(cx, cy, Z0, Z0 + 14, 112, 20); for (const [dx, dy] of [[-85, -85], [85, -85], [-85, 85], [85, 85]]) { a.cyl(cx + dx, cy + dy, Z0 + 14, Z0 + 28, 7, 6); a.circ(cx + dx, cy + dy, 7, 'EQUIP-DETAIL'); }
      a.cyl(cx, cy, Z0 + 14, Z1 - 320, r, 20); a.cyl(cx, cy, Z1 - 320, Z1 - 60, r - 6, 20);
      if (v.louver) for (let z = Z1 - 310; z < Z1 - 70; z += 28) ring(a, cx, cy, z, r + 4, 4, 22);
      else a.cyl(cx, cy, Z1 - 300, Z1 - 80, r + 2, 20);
      a.cone(cx, cy, Z1 - 60, Z1, r + 6, r + 6, 20); a.cone(cx, cy, Z1 - 12, Z1, r + 8, r - 6, 20);
      a.log('Added the base plate with bolts, the shaft, the light band' + (v.louver ? ' with louver rings' : '') + ' and the cap (plan and 3D).');
    } }),

  // ===================================================== life safety =====================================================
  fam({ cat: 'electrical/fixtures', title: 'Generic edge-lit exit sign',
    desc: (v) => `Edge-lit exit sign with ${v.faces === 2 ? 'a legend on both faces' : 'one legend face'}, a thin housing and ${v.mount === 'ceiling' ? 'a ceiling stem mount' : v.mount === 'wall' ? 'a wall bracket' : 'an end-of-corridor wall mount'}, with a running-man arrow bar.`,
    vs: [['single face, wall mount', 12, 1.2, 8, 90, { faces: 1, mount: 'wall' }], ['single face, end mount', 12, 4, 8, 90, { faces: 1, mount: 'end' }], ['double face, ceiling stem', 12, 1.5, 14, 94, { faces: 2, mount: 'ceiling' }], ['single face, ceiling stem', 12, 1.2, 14, 94, { faces: 1, mount: 'ceiling' }], ['double face, wall bracket', 12, 5, 8, 90, { faces: 2, mount: 'wall' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline();
      const zb = v.mount === 'ceiling' ? Z0 : Z0, zt = v.mount === 'ceiling' ? Z0 + 200 : Z1;
      a.box(X0, cy - 15 * 1, zb, X1, cy + 15, zt); a.frame(X0, zb, X1, zt, YF, YF + 2, 8);
      a.box(X0 + 10, YF - 3, zb + 12, X1 - 10, YF, zt - 12); if (v.faces === 2) a.box(X0 + 10, YB, zb + 12, X1 - 10, YB + 3, zt - 12);
      for (let i = 0; i < 4; i++) a.box(X0 + 40 + i * 55, YF - 6, zb + 40, X0 + 40 + i * 55 + 35, YF - 3, zt - 40);
      a.box(X1 - 80, YF - 6, zb + 60, X1 - 25, YF - 3, zb + 80);
      a.rect(X0 + 10, YF - 3, X1 - 10, YF, 'EQUIP-DETAIL');
      if (v.mount === 'ceiling') { a.cyl(cx, cy, zt, Z1 - 20, 10, 8); a.cyl(cx, cy, Z1 - 20, Z1, 45, 14); }
      else if (v.mount === 'wall') { a.box(cx - 60, cy + 15, zb + 20, cx + 60, YB - 3, zt - 20); }
      else { a.box(cx - 10, cy + 15, zb, cx + 10, YB, zt); a.box(X0, YB - 10, zb, X1, YB, zt); }
      a.log('Added the thin housing, lit legend face' + (v.faces === 2 ? 's' : '') + ', letter bars, arrow bar and the ' + v.mount + ' mount (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic fire alarm horn and strobe',
    desc: (v) => `Wall-mounted fire alarm ${v.kind}, ${v.cd} candela rating shown on the lens, with a back box, a plate, a ${v.kind.includes('horn') ? 'horn grille' : 'plain cover'} and a clear strobe lens.`,
    vs: [['strobe only, 15 cd', 'strobe', 15], ['strobe only, 75 cd', 'strobe', 75], ['horn and strobe, 15 cd', 'horn and strobe', 15], ['horn and strobe, 75 cd', 'horn and strobe', 75], ['horn and strobe, 110 cd', 'horn and strobe', 110], ['horn only', 'horn', 0]]
      .map(([l, kind, cd]) => [l, 5.5, 2.4, 6, 80, { kind, cd }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline();
      a.box(X0, YB - 40, Z0, X1, YB, Z1); a.box(X0 + 10, YF, Z0 + 10, X1 - 10, YB - 40, Z1 - 10);
      const hz = (Z0 + Z1) / 2;
      if (v.kind !== 'horn') { a.box(X0 + 20, YF - 4, hz + 5, X1 - 20, YF + 10, Z1 - 15); a.rect(X0 + 20, YF - 4, X1 - 20, YF + 10, 'EQUIP-DETAIL'); }
      if (v.kind !== 'strobe') { for (let i = 0; i < 4; i++) a.box(X0 + 22, YF - 3, Z0 + 20 + i * 15, X1 - 22, YF, Z0 + 28 + i * 15); }
      a.rect(X0, YF + 0.1, X1, YF + 0.2, 'EQUIP-DETAIL');
      a.log('Added the back box, the plate, ' + (v.kind !== 'strobe' ? 'a horn grille ' : '') + (v.kind !== 'horn' ? 'and the clear strobe lens ' : '') + '(plan and 3D).');
    } }),

  // ===================================================== digital signage and low voltage =====================================================
  fam({ cat: 'electrical/equipment', title: 'Generic digital menu board',
    desc: (v) => `Wall-mounted digital menu board with ${v.n} landscape-format ${v.diag} in screens ${v.vert ? 'stacked above each other' : 'side by side'} in one black frame, a rear mounting rail and a media-player box behind.`,
    vs: [[1, 43, false], [2, 43, false], [3, 43, false], [4, 43, false], [2, 55, false], [3, 55, false], [3, 55, true], [4, 32, true]]
      .map(([n, diag, vert]) => { const sw = diag * 0.87, sh = diag * 0.49; return [`${n} screen${n > 1 ? 's' : ''}, ${diag} in${vert ? ', stacked' : ''}`, vert ? sw + 3 : n * (sw + 1) + 2, 3, vert ? n * (sh + 1) + 2 : sh + 3, 48, { n, diag, vert, sw, sh }]; }),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, H } = a; a.outline(); a.box(X0, YB - 70, Z0, X1, YB, Z1);
      const sw = v.sw * IN, sh = v.sh * IN, n = v.n;
      for (let i = 0; i < n; i++) {
        const x0 = v.vert ? cx - sw / 2 : X0 + 25 + i * (sw + 25), z0 = v.vert ? Z0 + 25 + i * (sh + 25) : Z0 + (H - sh) / 2;
        a.box(x0 - 8, YF, z0 - 8, x0 + sw + 8, YB - 70, z0 + sh + 8); a.box(x0, YF - 3, z0, x0 + sw, YF, z0 + sh); a.rect(x0, YF - 3, x0 + sw, YF, 'EQUIP-DETAIL');
        a.box(x0 + sw * 0.1, YF - 8, z0 + sh * 0.6, x0 + sw * 0.55, YF - 3, z0 + sh * 0.75);
      }
      a.box(cx - 120, YB - 70 - 0, Z0 + H * 0.4, cx + 120, YB - 70 + 0.1, Z0 + H * 0.6); a.rect(X0 + 10, YB - 70, X1 - 10, YB, 'EQUIP-HIDDEN');
      a.log('Added the black frame, ' + n + ' lit screens with menu bars, the rear mounting rail and the player box (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic flight information display',
    desc: (v) => `${v.dbl ? 'Double-sided' : 'Single-sided'} flight information display, ${v.diag} in landscape screen${v.dbl ? 's' : ''} in a ceiling-hung housing with a rod hanger at each end, a status bar on the screen and a cable cover.`,
    vs: [[55, false], [55, true], [65, false], [65, true], [75, true], [86, true]].map(([diag, dbl]) => [`${diag} in, ${dbl ? 'double sided' : 'single sided'}`, diag * 0.87 + 6, dbl ? 6 : 4, diag * 0.49 + 30, 84, { diag, dbl }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, sh = v.diag * 0.49 * IN; a.outline();
      const zb = Z0, zt = Z0 + sh + 60; a.box(X0, YF, zb, X1, YB, zt);
      a.box(X0 + 30, YF - 3, zb + 25, X1 - 30, YF, zt - 25); a.rect(X0 + 30, YF - 3, X1 - 30, YF, 'EQUIP-DETAIL');
      for (let i = 0; i < 6; i++) a.box(X0 + 60, YF - 6, zt - 60 - i * (sh / 7.5) - 30, X1 - 60, YF - 3, zt - 60 - i * (sh / 7.5));
      a.box(X0 + 30, YF - 3, zt - 55, X1 - 30, YF, zt - 25);
      if (v.dbl) { a.box(X0 + 30, YB, zb + 25, X1 - 30, YB + 3, zt - 25); for (let i = 0; i < 6; i++) a.box(X0 + 60, YB + 3, zt - 60 - i * (sh / 7.5) - 30, X1 - 60, YB + 6, zt - 60 - i * (sh / 7.5)); }
      for (const x of [X0 + 120, X1 - 120]) { a.tube([[x, cy, zt], [x, cy, Z1 - 20]], [7, 7], 8); a.box(x - 40, cy - 40, Z1 - 20, x + 40, cy + 40, Z1); }
      a.box(cx - 60, cy - 15, zt, cx + 60, cy + 15, zt + 40);
      a.log('Added the housing, ' + (v.dbl ? 'two' : 'one') + ' lit screen' + (v.dbl ? 's' : '') + ' with flight rows, two rod hangers with ceiling plates and the cable cover (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic passenger charging tower',
    desc: (v) => `Floor-standing device-charging tower with a base plate, a square column, ${v.ports} outlet and USB ports on ${v.faces === 4 ? 'all four' : 'two opposite'} faces, a lit header sign and a cable entry at the foot.`,
    vs: [[4, 2], [6, 2], [8, 2], [8, 4], [12, 4], [16, 4]].map(([ports, faces]) => [`${ports} ports, ${faces} faces`, faces === 4 ? 16 : 13, faces === 4 ? 16 : 11, 54, 0, { ports, faces }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 20); a.box(X0 + 40, YF + 40, Z0 + 20, X1 - 40, YB - 40, Z1 - 180); a.box(X0 + 20, YF + 20, Z1 - 180, X1 - 20, YB - 20, Z1);
      a.box(X0 + 28, YF + 12, Z1 - 160, X1 - 28, YF + 20, Z1 - 30); if (v.faces === 4) { a.box(X0 + 28, YB - 20, Z1 - 160, X1 - 28, YB - 12, Z1 - 30); a.box(X0 + 12, YF + 28, Z1 - 160, X0 + 20, YB - 28, Z1 - 30); a.box(X1 - 20, YF + 28, Z1 - 160, X1 - 12, YB - 28, Z1 - 30); }
      const per = v.ports / v.faces, rows = m.ceil(per / 2);
      const faceList = v.faces === 4 ? [0, 1, 2, 3] : [0, 2];
      for (const f of faceList) for (let i = 0; i < per; i++) {
        const row = i % rows, col = m.floor(i / rows), zz = Z0 + 280 + row * 190;
        const off = (col - (m.ceil(per / rows) - 1) / 2) * 90;
        if (f === 0) { a.box(cx + off - 28, YF + 34, zz, cx + off + 28, YF + 40, zz + 50); a.box(cx + off - 28, YF + 28, zz + 70, cx + off + 28, YF + 34, zz + 90); }
        if (f === 2) { a.box(cx + off - 28, YB - 40, zz, cx + off + 28, YB - 34, zz + 50); a.box(cx + off - 28, YB - 34, zz + 70, cx + off + 28, YB - 28, zz + 90); }
        if (f === 1) { a.box(X0 + 34 - 6, cy + off - 28, zz, X0 + 40, cy + off + 28, zz + 50); }
        if (f === 3) { a.box(X1 - 40, cy + off - 28, zz, X1 - 34 + 6, cy + off + 28, zz + 50); }
      }
      a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-DETAIL');
      a.log('Added the base plate, column, outlet and USB port faces and the lit header (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic dome camera',
    desc: (v) => `${v.pend ? 'Pendant' : 'Ceiling'}-mounted dome camera, ${v.dia} in across, with a base plate, a tinted dome over a gimbal lens and ${v.pend ? 'a stem and canopy' : 'a flush mounting ring'}.`,
    vs: [[4, false], [6, false], [8, false], [6, true], [8, true]].map(([d, pend]) => [`${d} in, ${pend ? 'pendant' : 'ceiling'}`, d, d, pend ? d * 0.6 + 8 : d * 0.55, pend ? CEIL - d * 0.6 - 8 : CEIL - d * 0.55, { dia: d, pend }]),
    build: (a, v) => {
      const { Z0, Z1, cx, cy } = a, r = a.W / 2, zd = v.pend ? Z0 + r * 0.9 : Z0 + r * 0.9;
      a.circ(cx, cy, r); a.circ(cx, cy, r * 0.55, 'EQUIP-DETAIL');
      const zt = v.pend ? Z1 - 190 : Z1;
      a.cyl(cx, cy, zt - 24, zt, r, 28); dome(a, cx, cy, zt - 24, r * 0.98, zt - 24 - Z0);
      a.cyl(cx, cy, zt - 60, zt - 24, r * 0.5, 16); a.ell(cx + 6, cy, zt - 70, r * 0.3, r * 0.3, r * 0.3, 14, 7); a.ycyl(cy - r * 0.3, cy - r * 0.3 - 8, cx + 6, zt - 70, r * 0.12, 10);
      if (v.pend) { a.tube([[cx, cy, zt], [cx, cy, Z1 - 20]], [14, 14], 10); a.cyl(cx, cy, Z1 - 20, Z1, 60, 16); }
      a.log('Added the base plate, the tinted dome, the gimbal lens' + (v.pend ? ' and the pendant stem with canopy' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic bullet camera',
    desc: (v) => `Bullet camera on a ${v.arm ? 'long wall arm' : 'short wall bracket'} with a ${v.shade ? 'sun shade over a ' : ''}cylindrical housing, a lens end, a joint ball and a back plate, ${v.size} size.`,
    vs: [['short bracket, compact', 'compact', false, false, 8, 6, 5, 95], ['short bracket, standard', 'standard', false, true, 9, 7, 5, 95], ['long arm, standard', 'standard', true, true, 9, 14, 6, 95], ['long arm, large, with shade', 'large', true, true, 11, 16, 6, 95]]
      .map(([l, size, arm, shade, w, d, h, z]) => [l, w, d, h + 3, z, { size, arm, shade }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, D } = a; a.outline();
      a.box(cx - 40, YB - 10, Z0, cx + 40, YB, Z1); const arm = v.arm ? D * 0.55 : 70;
      a.tube([[cx, YB - 10, Z1 - 40], [cx, YB - arm, Z1 - 55]], [10, 10], 8); a.ell(cx, YB - arm, Z1 - 55, 18, 18, 18, 10, 5);
      const r = v.size === 'large' ? 34 : v.size === 'compact' ? 22 : 28, y0 = YB - arm + 30, y1 = YF + 10, zc = Z1 - 70;
      a.ycyl(y1, y0, cx, zc, r, 18); a.ycyl(y1 - 4, y1, cx, zc, r * 0.7, 14); a.ycyl(y1 - 6, y1 - 4, cx, zc, r * 0.4, 12);
      if (v.shade) a.box(cx - r - 6, y1 - 4, zc + r, cx + r + 6, y0 + 30, zc + r + 6);
      a.rect(cx - r, y1, cx + r, y0, 'EQUIP-DETAIL');
      a.log('Added the back plate, ' + (v.arm ? 'a long arm' : 'a short bracket') + ', the joint ball and the cylindrical housing with its lens' + (v.shade ? ' and sun shade' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic wall access reader',
    desc: (v) => `Wall-mounted access reader, ${v.kind}, with a back box, a plate, a status light bar${v.kind === 'card reader with keypad' ? ', a twelve-key keypad' : v.kind === 'card and fingerprint reader' ? ' and a fingerprint window' : ' and a card-tap target'}.`,
    vs: [['mullion size', 'card reader', 1.8, 4.5], ['single gang size', 'card reader', 3.3, 4.6], ['with keypad', 'card reader with keypad', 3.5, 6], ['with fingerprint window', 'card and fingerprint reader', 4, 7.5], ['wide pedestal size', 'card reader', 5, 8]]
      .map(([l, kind, w, h]) => [l, w, 1.1, h, 46, { kind }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline();
      a.box(X0, YB - 10, Z0, X1, YB, Z1); a.box(X0 + 4, YF, Z0 + 4, X1 - 4, YB - 10, Z1 - 4); a.rect(X0 + 4, YF, X1 - 4, YB - 10, 'EQUIP-DETAIL');
      a.box(cx - (X1 - X0) * 0.3, YF - 3, Z1 - 26, cx + (X1 - X0) * 0.3, YF, Z1 - 18);
      const w = (X1 - X0);
      if (v.kind.includes('keypad')) for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const x = cx + (c - 1) * w * 0.22; a.box(x - 6, YF - 3, Z0 + 14 + r * 16, x + 6, YF, Z0 + 24 + r * 16); }
      if (v.kind.includes('fingerprint')) { a.ycyl(YF - 4, YF, cx, Z0 + 60, w * 0.22, 14); a.circ(cx, YF - 2, w * 0.22, 'EQUIP-DETAIL'); }
      if (v.kind === 'card reader') { a.ycyl(YF - 3, YF, cx, (Z0 + Z1) / 2 - 8, w * 0.2, 14); }
      a.log('Added the back box, the plate, the status light bar and the ' + (v.kind.includes('keypad') ? 'keypad' : v.kind.includes('fingerprint') ? 'fingerprint window' : 'tap target') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic ceiling speaker',
    desc: (v) => `${v.kind === 'horn' ? 'Paging horn speaker with a flared bell, a driver can and a swivel bracket' : 'Recessed round ceiling speaker with a grille, a trim ring, a driver cone behind it and a back can'}, ${v.dia} in nominal size.`,
    vs: [['4 in round', 4, 'round'], ['6 in round', 6, 'round'], ['8 in round', 8, 'round'], ['paging horn, 5 in', 5, 'horn'], ['paging horn, 8 in', 8, 'horn']]
      .map(([l, dia, kind]) => [l, kind === 'horn' ? dia + 2 : dia + 2, kind === 'horn' ? dia * 2 : dia + 2, kind === 'horn' ? dia + 5 : 5, kind === 'horn' ? 100 : CEIL - 5, { dia, kind }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a;
      if (v.kind === 'round') { const r = a.W / 2; a.circ(cx, cy, r); a.circ(cx, cy, r * 0.82, 'EQUIP-DETAIL'); a.circ(cx, cy, r * 0.3, 'EQUIP-DETAIL'); a.cyl(cx, cy, Z1 - 6, Z1, r, 28); a.cone(cx, cy, Z0, Z1 - 6, r * 0.78, r * 0.85, 24); for (let i = 1; i < 5; i++) ring(a, cx, cy, Z0 + 1, r * 0.8 * i / 5, 1.4, 22); a.cone(cx, cy, Z0 + 4, Z0 + 60, r * 0.32, r * 0.75, 18); }
      else { a.outline(); const r = (v.dia * IN) / 2; a.box(cx - 40, YB - 8, Z0 + 30, cx + 40, YB, Z1 - 20); a.ycyl(YB - 150, YB - 8, cx, (Z0 + Z1) / 2, r * 0.35, 16); a.cone(cx, YB - 150, (Z0 + Z1) / 2, (Z0 + Z1) / 2 + 0.01, 1, 1, 4); a.tube([[cx, YB - 150, (Z0 + Z1) / 2], [cx, YF + 10, (Z0 + Z1) / 2]], [r * 0.35, r * 0.9], 20); a.box(cx - r * 0.9 - 4, YF, Z0 + 4, cx + r * 0.9 + 4, YF + 10, Z1 - 4); }
      a.log(v.kind === 'round' ? 'Added the trim ring, the grille with its rings, the cone and the back can (plan and 3D).' : 'Added the wall plate, driver can, flared bell and bracket (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic wireless access point',
    desc: (v) => `${v.kind} wireless access point with ${v.kind.startsWith('outdoor') ? 'a weather housing, four antenna stubs' : 'a low housing'}, a status light ring and a mounting plate, ${v.size} in across.`,
    vs: [['ceiling disc, 7 in', 'ceiling disc', 7, 1.6, CEIL - 1.6], ['ceiling disc, 9 in', 'ceiling disc', 9, 1.8, CEIL - 1.8], ['wall plate, 6 in', 'wall plate', 6, 1.4, 90], ['outdoor, 9 in', 'outdoor', 9, 5, 100], ['outdoor, 12 in', 'outdoor', 12, 6, 100]]
      .map(([l, kind, size, dp, z]) => [l, size, kind === 'wall plate' ? dp : size, kind === 'ceiling disc' ? dp : kind === 'outdoor' ? dp * 1.1 + 4 : size, z, { kind, size }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a;
      if (v.kind === 'ceiling disc') { const r = a.W / 2; a.circ(cx, cy, r); a.circ(cx, cy, r * 0.5, 'EQUIP-DETAIL'); a.cone(cx, cy, Z0, Z1, r * 0.92, r, 28); ring(a, cx, cy, Z0 + 2, r * 0.7, 2, 24); a.ell(cx, cy, Z0 + 3, r * 0.2, r * 0.2, 3, 10, 4); }
      else if (v.kind === 'wall plate') { a.outline(); a.box(X0, YB - 40, Z0, X1, YB, Z1); a.box(X0 + 10, YF, Z0 + 10, X1 - 10, YB - 40, Z1 - 10); a.box(cx - 20, YF - 3, Z0 + 20, cx + 20, YF, Z0 + 40); a.rect(X0 + 10, YF, X1 - 10, YB - 40, 'EQUIP-DETAIL'); }
      else { const r = a.W / 2; a.circ(cx, cy, r); a.cyl(cx, cy, Z0, Z0 + (Z1 - Z0) * 0.5, r * 0.8, 24); a.cone(cx, cy, Z0 + (Z1 - Z0) * 0.5, Z1 - 40, r * 0.8, r * 0.5, 24); for (let i = 0; i < 4; i++) { const g = (i / 4) * m.PI * 2 + 0.78; a.tube([[cx + m.cos(g) * r * 0.55, cy + m.sin(g) * r * 0.55, Z0 + 20], [cx + m.cos(g) * r * 0.62, cy + m.sin(g) * r * 0.62, Z1]], [6, 5], 8); a.circ(cx + m.cos(g) * r * 0.6, cy + m.sin(g) * r * 0.6, 6, 'EQUIP-DETAIL'); } a.circ(cx, cy, r * 0.8, 'EQUIP-DETAIL'); }
      a.log('Added the ' + (v.kind === 'outdoor' ? 'weather housing, mount and antenna stubs' : v.kind === 'wall plate' ? 'wall plate housing and status light' : 'low disc housing, mount ring and status light ring') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic emergency call station',
    desc: (v) => `Emergency call tower, ${v.hgt} in tall, with a base plate, a square post, a blue beacon dome, a speaker grille, a call button and a camera on the ${v.cam ? 'post' : 'post top'}${v.sign ? ' and a lit sign face' : ''}.`,
    vs: [['60 in post', 60, false, false], ['72 in post, with sign', 72, false, true], ['96 in tower, with camera', 96, true, true], ['120 in tower, with camera', 120, true, true]]
      .map(([l, hgt, cam, sign]) => [l, 14, 14, hgt + 12, 0, { hgt, cam, sign }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, ph = v.hgt * IN; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 20); a.box(cx - 90, cy - 90, Z0 + 20, cx + 90, cy + 90, Z0 + ph);
      a.box(cx - 70, YF + 80 - 8, Z0 + 1050 > Z0 + ph - 300 ? Z0 + ph - 900 : Z0 + 1050, cx + 70, YF + 90, Z0 + 1300); a.box(cx - 40, YF + 70, Z0 + 1220, cx + 40, YF + 80, Z0 + 1260);
      for (let i = 0; i < 5; i++) a.box(cx - 50, YF + 74, Z0 + 1070 + i * 18, cx + 50, YF + 80, Z0 + 1080 + i * 18);
      a.ycyl(YF + 66, YF + 80, cx, Z0 + 1160, 36, 14); a.circ(cx, YF + 73, 36, 'EQUIP-DETAIL');
      a.cone(cx, cy, Z0 + ph, Z0 + ph + 0.01, 1, 1, 4);
      a.ell(cx, cy, Z0 + ph - 90, 100, 100, 90, 16, 7);
      if (v.sign) a.box(cx - 80, cy - 100, Z0 + ph - 450, cx + 80, cy - 90, Z0 + ph - 200);
      if (v.cam) { a.box(cx - 25, YB - 100, Z0 + ph - 450, cx + 25, YB - 90, Z0 + ph - 380); a.ycyl(cy + 90, YB - 20, cx, Z0 + ph - 520, 30, 14); }
      a.log('Added the base plate, post, call button, speaker grille and the blue beacon' + (v.cam ? ', with a camera' : '') + (v.sign ? ' and a lit sign face' : '') + ' (plan and 3D).');
    } }),

  // ===================================================== power =====================================================
  fam({ cat: 'electrical/equipment', title: 'Generic electrical panelboard enclosure',
    desc: (v) => `Surface panelboard enclosure, ${v.amps} A with ${v.ckt} circuits, with a hinged door, a trim, a latch, a main breaker and two breaker columns, and a marked working space in front.`,
    vs: [[100, 24, 20, 32], [100, 30, 20, 44], [225, 42, 20, 50], [400, 42, 24, 60], [600, 42, 26, 74]].map(([amps, ckt, w, h]) => [`${amps} A, ${ckt} circuit`, w, 6, h, 24, { amps, ckt }]),
    build: (a, v) => { M.panelWall(a, v.ckt > 24 ? 2 : 1); a.log('Added the enclosure, hinged door, latch, main breaker, breaker columns and the working space (plan and 3D).'); } }),

  fam({ cat: 'electrical/equipment', title: 'Generic floor-mounted dry transformer',
    desc: (v) => `Floor-mounted dry-type transformer, ${v.kva} kVA, with a ventilated enclosure, louvers on both ends, a base channel, lifting eyes, a terminal cover and a nameplate.`,
    vs: [[15, 20, 14, 28], [30, 24, 16, 34], [45, 26, 18, 36], [75, 30, 20, 42], [112.5, 34, 22, 46], [150, 38, 24, 50], [300, 48, 30, 60]].map(([kva, w, d, h]) => [`${kva} kVA`, w, d, h, 0, { kva }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 90); a.box(X0 + 30, YF + 30, Z0 + 90, X1 - 30, YB - 30, Z1 - 20); a.box(X0 + 10, YF + 15, Z1 - 20, X1 - 10, YB - 15, Z1);
      for (let z = Z0 + 200; z < Z1 - 150; z += 36) { a.box(X0 + 10, YF + 60, z, X0 + 30, YB - 60, z + 14); a.box(X1 - 30, YF + 60, z, X1 - 10, YB - 60, z + 14); }
      for (let z = Z0 + 200; z < Z1 - 150; z += 36) a.box(X0 + 60, YF + 18, z, X1 - 60, YF + 30, z + 14);
      a.box(cx - 120, YF + 18, Z1 - 330, cx + 120, YF + 30, Z1 - 160); a.box(cx - 70, YF + 12, Z1 - 290, cx + 70, YF + 18, Z1 - 220);
      for (const x of [X0 + 70, X1 - 70]) { a.ell(x, a.cy, Z1 + 12, 26, 12, 26, 10, 5); }
      a.rect(X0 + 30, YF + 30, X1 - 30, YB - 30, 'EQUIP-DETAIL'); a.clear('working space', X0, YF - 900, X1, YF, 40);
      a.log('Added the base channel, enclosure, end louvers, terminal cover, nameplate, lifting eyes and the working space (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic switchgear lineup',
    desc: (v) => `Low-voltage switchgear lineup of ${v.n} vertical sections, each with a hinged breaker door, a handle and lifting eyes on top, with a metering section${v.n > 2 ? ' and a main section' : ''} and the front working space.`,
    vs: [2, 3, 4, 5, 6].map((n) => [`${n} section`, n * 30, 48, 90, 0, { n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a, n = v.n; a.outline();
      for (let i = 0; i < n; i++) {
        const x0 = X0 + (i * W) / n, x1 = X0 + ((i + 1) * W) / n; a.box(x0, YF + 40, Z0, x1, YB, Z1); a.line(x0, YF, x0, YB);
        const meter = i === n - 1 && n > 2, main = i === 0 && n > 2;
        const rows = meter ? 2 : main ? 1 : 3, hh = (Z1 - Z0 - 200) / rows;
        for (let j = 0; j < rows; j++) { const z0 = Z0 + 100 + j * hh; a.box(x0 + 40, YF + 10, z0 + 10, x1 - 40, YF + 40, z0 + hh - 20); a.rect(x0 + 40, YF + 10, x1 - 40, YF + 40, 'EQUIP-DETAIL'); a.box(x1 - 120, YF - 10, z0 + hh * 0.4, x1 - 70, YF + 10, z0 + hh * 0.6); if (meter) { a.ycyl(YF + 2, YF + 12, (x0 + x1) / 2, z0 + hh / 2, 90, 18); } }
        a.box(x0 + 40, YF + 10, Z0 + 20, x1 - 40, YF + 40, Z0 + 90); a.ell((x0 + x1) / 2 - 150, (YF + YB) / 2, Z1 + 14, 25, 12, 25, 10, 5); a.ell((x0 + x1) / 2 + 150, (YF + YB) / 2, Z1 + 14, 25, 12, 25, 10, 5);
      }
      a.clear('working space', X0, YF - 1070, X1, YF, 40);
      a.log('Added ' + n + ' sections with hinged breaker doors, handles, lifting eyes, a metering section and the working space (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic floor service box',
    desc: (v) => `${v.kind} floor service box in a ${v.w} in cover, with a flush cover plate, ${v.power} power and ${v.data} data openings under hinged flip lids and a cable slot, in a cast housing set in the slab.`,
    vs: [['two service, flush', 7, 5, 2, 1], ['three service, flush', 9, 6, 2, 2], ['four service, flush', 11, 6, 2, 3], ['six service, flush', 14, 8, 4, 3], ['four service, raised lid', 11, 6, 2, 3]]
      .map(([l, w, d, pw, dt], i) => [l, w, d, 4, 0, { kind: i === 4 ? 'raised-lid' : 'flush', w, power: pw, data: dt }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      a.box(X0 - 20, YF - 20, Z0, X1 + 20, YB + 20, Z1 - 12); a.box(X0, YF, Z1 - 12, X1, YB, Z1 - (v.kind === 'raised-lid' ? 0 : 3));
      const n = v.power + v.data, sw = (W - 40) / n;
      for (let i = 0; i < n; i++) { const x0 = X0 + 20 + i * sw + 4, x1 = X0 + 20 + (i + 1) * sw - 4; a.box(x0, YF + 22, Z1 - 4, x1, YB - 22, Z1 + (v.kind === 'raised-lid' ? 10 : 0.5)); a.circ((x0 + x1) / 2, cy, m.min(sw, a.D) * 0.28, 'EQUIP-DETAIL'); a.rect(x0, YF + 22, x1, YB - 22, 'EQUIP-DETAIL'); }
      a.line(X0 + 10, YB - 14, X1 - 10, YB - 14, 'EQUIP-DETAIL');
      a.log('Added the slab housing, the cover plate and ' + n + ' lidded service openings (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic meter bank',
    desc: (v) => `Wall meter bank with ${v.n} socket meters in ${v.rows} row${v.rows > 1 ? 's' : ''}, each with a round glass window and ring, a ${v.rows > 1 ? 'main and ' : ''}disconnect handle below it and a common back panel, with the front working space.`,
    vs: [[2, 1], [4, 1], [4, 2], [6, 2], [8, 2], [12, 3]].map(([n, rows]) => [`${n} meters, ${rows} row${rows > 1 ? 's' : ''}`, (n / rows) * 14 + 6, 10, rows * 22 + 12, 36, { n, rows }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a, cols = v.n / v.rows; a.outline(); a.box(X0, YB - 30, Z0, X1, YB, Z1);
      const cw = (W - 80) / cols, rh = (Z1 - Z0 - 60) / v.rows;
      for (let r = 0; r < v.rows; r++) for (let c = 0; c < cols; c++) {
        const x = X0 + 40 + cw * (c + 0.5), zr = Z0 + 30 + r * rh;
        a.box(x - cw * 0.42, YF + 60, zr + 10, x + cw * 0.42, YB - 30, zr + rh - 10); a.ycyl(YF + 40, YF + 70, x, zr + rh * 0.68, cw * 0.32, 22); a.ycyl(YF + 28, YF + 40, x, zr + rh * 0.68, cw * 0.26, 22); a.circ(x, YF + 50, cw * 0.32, 'EQUIP-DETAIL');
        a.box(x - 40, YF + 30, zr + rh * 0.16, x + 40, YF + 60, zr + rh * 0.3); a.box(x - 20, YF + 10, zr + rh * 0.19, x + 20, YF + 30, zr + rh * 0.27);
      }
      a.clear('working space', X0, YF - 900, X1, YF, 40);
      a.log('Added the back panel, ' + v.n + ' meter sockets with round glass windows and ' + v.n + ' disconnect handles, and the working space (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic standby generator set',
    desc: (v) => `Outdoor weatherproof standby generator set, ${v.kw} kW, with a skid base fuel tank, a louvered enclosure with two hinged service doors, an exhaust stack, a radiator end and a control panel window.`,
    vs: [[30, 6, 3], [60, 8, 3.5], [100, 10, 4], [150, 12, 4.5], [250, 15, 5.5], [500, 20, 7]].map(([kw, L, w]) => [`${kw} kW`, L * 12, w * 12, L * 12 * 0.42 + 30, 0, { kw }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 300); a.box(X0 + 20, YF + 20, Z0 + 300, X1 - 20, YB - 20, Z1 - 220);
      for (let z = Z0 + 420; z < Z1 - 500; z += 40) { a.box(X1 - 40, YF + 80, z, X1 - 20, YB - 80, z + 18); }
      const nd = 2, dw = (W - 700) / nd;
      for (let i = 0; i < nd; i++) { const x0 = X0 + 60 + i * (dw + 20); a.box(x0, YF, Z0 + 340, x0 + dw, YF + 20, Z1 - 280); a.line(x0, YF, x0, YF + 20, 'EQUIP-DETAIL'); a.box(x0 + dw - 90, YF - 20, Z0 + (Z1 - Z0) * 0.45, x0 + dw - 60, YF, Z0 + (Z1 - Z0) * 0.55); a.arc(i ? x0 + dw : x0, YF, dw, i ? 180 : 270, i ? 270 : 360); }
      a.box(X1 - 600, YF + 60, Z0 + 400, X1 - 120, YF + 80, Z0 + 600); a.rect(X1 - 600, YF + 60, X1 - 120, YF + 80, 'EQUIP-DETAIL');
      a.box(X0 + 20, YF + 20, Z1 - 220, X1 - 20, YB - 20, Z1 - 200);
      a.cyl(X0 + 220, YB - 120, Z1 - 200, Z1, 80, 16); a.cyl(X0 + 220, YB - 120, Z1 - 12, Z1, 100, 16); a.circ(X0 + 220, YB - 120, 80, 'EQUIP-DETAIL');
      a.box(X1 - 260, YF + 100, Z1 - 200, X1 - 40, YB - 100, Z1 - 100);
      a.log('Added the skid fuel base, louvered enclosure with two doors and swings, the control panel window, the radiator end and the exhaust stack (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic cable tray run',
    desc: (v) => `Straight ${v.kind} cable tray section, 10 ft long and ${v.tw} in wide, with two side rails, ${v.kind === 'ladder' ? 'rungs every 12 in' : 'a solid bottom'} and two rod hangers with trapeze channels.`,
    vs: [['ladder, 6 in wide', 'ladder', 6], ['ladder, 12 in wide', 'ladder', 12], ['ladder, 18 in wide', 'ladder', 18], ['ladder, 24 in wide', 'ladder', 24], ['solid bottom, 12 in wide', 'solid', 12], ['solid bottom, 24 in wide', 'solid', 24]]
      .map(([l, kind, tw]) => [l, 120, tw + 4, 8, 108 - 8 - 12, { kind, tw }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy, W } = a; a.outline();
      const zb = Z0 + 90;
      a.box(X0, YF, zb, X1, YF + 14, Z1); a.box(X0, YB - 14, zb, X1, YB, Z1);
      if (v.kind === 'ladder') for (let x = X0 + 60; x < X1; x += 305) { a.box(x, YF + 14, zb, x + 30, YB - 14, zb + 20); a.line(x + 15, YF + 14, x + 15, YB - 14, 'EQUIP-DETAIL'); }
      else { a.box(X0, YF + 14, zb, X1, YB - 14, zb + 6); a.rect(X0 + 10, YF + 20, X1 - 10, YB - 20, 'EQUIP-DETAIL'); }
      for (const x of [X0 + 400, X1 - 400]) { a.box(x - 30, YF - 20, Z0 + 40, x + 30, YB + 0, Z0 + 90); a.box(x - 30, YB - 14, Z0 + 40, x + 30, YB, zb); a.tube([[x, YF - 10, Z0 + 60], [x, YF - 10, Z0 + 60 + 60]], [7, 7], 6); a.cyl(x, YF + 0, Z0, Z0 + 40, 8, 8); a.cyl(x, YB, Z0, Z0 + 40, 8, 8); }
      a.log('Added the side rails, ' + (v.kind === 'ladder' ? 'rungs' : 'solid bottom') + ' and two hanger rods with trapeze channels (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic safety disconnect switch',
    desc: (v) => `${v.amps} A ${v.fused ? 'fusible' : 'non-fusible'} disconnect switch in a wall-mounted enclosure with a hinged door, an external operating handle with a lock hasp and a conduit hub on top and bottom.`,
    vs: [[30, true, 9, 14], [60, true, 10, 16], [100, true, 12, 20], [200, true, 15, 28], [400, true, 20, 36], [600, false, 24, 44]].map(([amps, fused, w, h]) => [`${amps} A, ${fused ? 'fusible' : 'non-fusible'}`, w, 6, h, 54, { amps, fused }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline();
      a.box(X0, YB - 14, Z0 - 10, X1, YB, Z1 + 10); a.box(X0 + 10, YF + 6, Z0, X1 - 10, YB - 14, Z1); a.frame(X0 + 4, Z0, X1 - 4, Z1, YF, YF + 6, 14);
      a.box(X1 - 90, YF - 40, (Z0 + Z1) / 2 - 130, X1 - 40, YF, (Z0 + Z1) / 2 + 130); a.box(X1 - 90, YF - 50, (Z0 + Z1) / 2 + 80, X1 - 40, YF - 40, (Z0 + Z1) / 2 + 130); a.box(X1 - 70, YF - 5, (Z0 + Z1) / 2 - 150, X1 - 55, YF, (Z0 + Z1) / 2 - 130);
      a.cyl(cx, a.cy, Z1, Z1 + 40, 25, 10); a.cyl(cx, a.cy, Z0 - 40, Z0, 25, 10);
      a.line(X0 + 14, YF + 4, X1 - 14, YF + 4, 'EQUIP-DETAIL'); a.clear('working space', X0, YF - 900, X1, YF, 40);
      a.log('Added the enclosure, door, operating handle with lock hasp, conduit hubs and the working space (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic wall-mounted EV charger',
    desc: (v) => `Wall-mounted vehicle charger, ${v.kw} kW, with a housing, a status light bar, a ${v.screen ? 'small display, ' : ''}a coiled cable on a holder and a connector holster${v.dual ? ', with a second cable and holster' : ''}.`,
    vs: [['7 kW, one cable', 7, false, false], ['11 kW, one cable', 11, false, true], ['19 kW, one cable, display', 19, false, true], ['22 kW, two cables, display', 22, true, true]]
      .map(([l, kw, dual, screen]) => [l, dual ? 20 : 12, 8, 17, 36, { kw, dual, screen }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline();
      a.box(X0 + 4, YB - 90, Z0 + 4, X1 - 4, YB, Z1 - 4); a.box(X0, YB - 90 - 20, Z0, X1, YB - 90, Z1); a.rect(X0, YF + 0, X1, YB - 110, 'EQUIP-HIDDEN');
      a.box(X0 + 40, YF + 0, Z1 - 110, X1 - 40, YB - 110, Z1 - 80);
      if (v.screen) { a.box(cx - 60, YB - 112 - 6, Z1 - 250, cx + 60, YB - 110, Z1 - 160); }
      const hx = v.dual ? [cx - (X1 - X0) * 0.25, cx + (X1 - X0) * 0.25] : [cx];
      for (const x of hx) { a.ycyl(YB - 150, YB - 110, x, Z0 + 140, 28, 14); a.circ(x, YB - 130, 28, 'EQUIP-DETAIL'); a.tube([[x, YB - 110, Z0 + 200], [x + 60, YB - 220, Z0 - 20 > Z0 ? Z0 : Z0 + 10], [x + 20, YB - 120, Z0 + 150]], [8, 8, 8], 8); a.cyl(x + 60, YB - 220, Z0 + 10, Z0 + 30, 14, 8); }
      a.log('Added the housing, status bar' + (v.screen ? ', display' : '') + ', connector holster' + (v.dual ? 's' : '') + ' and the coiled cable' + (v.dual ? 's' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic wall switch plate',
    desc: (v) => `${v.gang}-gang wall switch plate with ${v.gang} ${v.kind === 'dimmer' ? 'slide dimmers with a rocker' : 'rocker switches'}, a faceplate, a mounting box behind it and screws at each end.`,
    vs: [[1, 'switch'], [2, 'switch'], [3, 'switch'], [4, 'switch'], [2, 'dimmer'], [3, 'dimmer']].map(([gang, kind]) => [`${gang} gang, ${kind === 'dimmer' ? 'dimmers' : 'rockers'}`, 1.1 + gang * 1.15, 0.9, 4.6, 46, { gang, kind }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      a.box(X0, YB - 12, Z0, X1, YB, Z1); a.box(X0 + 6, YB - 40, Z0 + 10, X1 - 6, YB - 12, Z1 - 10);
      for (let i = 0; i < v.gang; i++) { const x = X0 + 10 + (W - 20) * (i + 0.5) / v.gang; a.box(x - 11, YF, Z0 + 28, x + 11, YB - 12, Z1 - 28); a.rect(x - 11, YF, x + 11, YB - 12, 'EQUIP-DETAIL'); if (v.kind === 'dimmer') a.box(x - 4, YF - 3, Z0 + 32, x + 4, YF, Z1 - 38); }
      for (const z of [Z0 + 6, Z1 - 8]) a.ycyl(YF - 2, YF, cx, z, 3, 8);
      a.log('Added the faceplate, ' + v.gang + ' ' + (v.kind === 'dimmer' ? 'dimmer sliders with rockers' : 'rocker switches') + ' and the mounting box (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic ceiling fire detector',
    desc: (v) => `Ceiling-mounted ${v.kind}, ${v.dia} in across, with a base ring, a vented cover with radial slots, a status light and a mounting plate.`,
    vs: [['smoke, 4 in', 'smoke detector', 4.2], ['smoke, 6 in', 'smoke detector', 6], ['heat, 4 in', 'heat detector', 4.2], ['beam head', 'beam detector', 6]]
      .map(([l, kind, dia]) => [l, dia, dia, kind === 'beam detector' ? 4 : 2, CEIL - (kind === 'beam detector' ? 4 : 2), { kind, dia }]),
    build: (a, v) => {
      const { Z0, Z1, cx, cy } = a, r = a.W / 2; a.circ(cx, cy, r); a.circ(cx, cy, r * 0.55, 'EQUIP-DETAIL');
      if (v.kind === 'beam detector') { a.box(cx - r, cy - r * 0.6, Z1 - 20, cx + r, cy + r * 0.6, Z1); a.ycyl(cy - r * 0.6 - 30, cy - r * 0.6, cx, Z0 + 40, 50, 16); a.box(cx - r * 0.5, cy - r * 0.6, Z0, cx + r * 0.5, cy + r * 0.6, Z1 - 20); a.circ(cx, cy - r * 0.6 - 15, 50, 'EQUIP-DETAIL'); }
      else { a.cyl(cx, cy, Z1 - 5, Z1, r, 28); a.cone(cx, cy, Z0, Z1 - 5, r * 0.8, r * 0.95, 28); if (v.kind === 'smoke detector') for (let i = 0; i < 12; i++) { const g = (i / 12) * m.PI * 2; a.box(cx + m.cos(g) * r * 0.5 - 2, cy + m.sin(g) * r * 0.5 - 2, Z0, cx + m.cos(g) * r * 0.72 + 2, cy + m.sin(g) * r * 0.72 + 2, Z0 + 1.5); } else ring(a, cx, cy, Z0, r * 0.5, 2, 20); a.cyl(cx + r * 0.6, cy, Z0 - 1, Z0 + 2, 3, 6); }
      a.log('Added the base ring, the vented cover and the status light (plan and 3D).');
    } }),
];

// the families above list every honest size; this keeps a spread of each so the group holds exactly 150 objects
const KEEP = {
  'Generic glass globe pendant': [0, 1, 2, 4, 5], 'Generic drum shade pendant': [0, 1, 3, 4], 'Generic bar pendant rail': [0, 1, 2, 3], 'Generic track lighting run': [0, 2, 4, 5],
  'Generic suspended linear luminaire': [0, 1, 3, 4], 'Generic round high-bay luminaire': [0, 1, 3, 4], 'Generic apron floodlight head': [0, 1, 2, 4], 'Generic hanging wayfinding sign light box': [0, 1, 3, 4],
  'Generic showcase strip light': [0, 1, 3, 4], 'Generic illuminated blade sign': [0, 2, 3, 5], 'Generic gimbal accent downlight': [0, 1, 3, 4], 'Generic edge-lit exit sign': [0, 1, 2, 4],
  'Generic fire alarm horn and strobe': [0, 1, 2, 3, 5], 'Generic digital menu board': [0, 1, 3, 4, 6, 7], 'Generic flight information display': [0, 1, 3, 4, 5], 'Generic passenger charging tower': [0, 1, 3, 4, 5],
  'Generic dome camera': [0, 1, 2, 4], 'Generic wall access reader': [0, 1, 2, 3], 'Generic ceiling speaker': [0, 1, 3, 4], 'Generic wireless access point': [0, 2, 3, 4],
  'Generic electrical panelboard enclosure': [0, 2, 3, 4], 'Generic floor-mounted dry transformer': [0, 1, 2, 4, 5, 6], 'Generic switchgear lineup': [0, 1, 3, 4], 'Generic floor service box': [0, 1, 3, 4],
  'Generic meter bank': [0, 2, 3, 5], 'Generic standby generator set': [0, 1, 3, 4, 5], 'Generic cable tray run': [0, 1, 2, 4, 5], 'Generic safety disconnect switch': [0, 1, 2, 3, 5],
  'Generic wall switch plate': [0, 1, 3, 4], 'Generic ceiling fire detector': [0, 2],
};
export default FAMS.map((f) => (KEEP[f.title] ? { ...f, vs: KEEP[f.title].map((i) => f.vs[i]) } : f));

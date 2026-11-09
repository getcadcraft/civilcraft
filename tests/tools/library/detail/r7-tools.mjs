/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, tools: 150 more hand tools, power tools, workshop machines and tool storage. Original geometry; generic shapes by type and size class, no maker or model. */
import { fam, cab, Acc } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = m.PI;
/** inches, rounded up to a quarter inch, for a size in mm */
const U = (mm) => m.ceil(mm / IN * 4) / 4;

// ------------------------------------------------------------------------------------------ helpers
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** convex polygon [[x,z],...] extruded along Y between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** closed torus. plane 'xz' (axis Y), 'yz' (axis X), 'xy' (axis Z) */
function ring(a, plane, cx, cy, cz, R, r, seg_ = 24, sides = 6) {
  const P = (i, j) => {
    const t = (i / seg_) * 2 * PI, f = (j / sides) * 2 * PI, rr = R + r * m.cos(f), q = r * m.sin(f), c = m.cos(t) * rr, s2 = m.sin(t) * rr;
    return plane === 'xz' ? [cx + c, cy + q, cz + s2] : plane === 'yz' ? [cx + q, cy + c, cz + s2] : [cx + c, cy + s2, cz + q];
  };
  for (let i = 0; i < seg_; i++) for (let j = 0; j < sides; j++) { const A = P(i, j), B = P(i + 1, j), C = P(i + 1, j + 1), D = P(i, j + 1); a.t.push([A, B, C], [A, C, D]); }
}
/** a base disc with a short post; the tool starts at z = Z0 + h */
function stand(a, cx, cy, r, h) { r = m.min(r, a.D / 2 - 3, a.W / 2 - 3); a.cyl(cx, cy, a.Z0, a.Z0 + 14, r, 22); a.cyl(cx, cy, a.Z0 + 14, a.Z0 + h, 12, 10); a.circ(cx, cy, r, 'EQUIP-DETAIL'); }
/** two small saddle blocks to rest a long tool on, at x positions xs, centred on cy, top at z */
function saddles(a, xs, cy, z, w = 60) { for (const x of xs) { a.box(x - 22, cy - w / 2, a.Z0, x + 22, cy + w / 2, z); a.rect(x - 22, cy - w / 2, x + 22, cy + w / 2, 'EQUIP-DETAIL'); } }
/** a swollen grip tube from p to q */
function grip(a, p, q, r, sides = 10) { const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2]; a.tube([p, mid, q], [r * 0.9, r * 1.08, r * 0.9], sides); }
/** ribs around a vertical grip */
function ribs(a, cx, cy, z0, z1, r, n = 6) { for (let i = 0; i < n; i++) { const z = z0 + (z1 - z0) * (i + 0.5) / n; a.cyl(cx, cy, z - 1.5, z + 1.5, r, 12); } }
function legs4(a, x0, x1, y0, y1, z0, z1, r = 20, splay = 0) { for (const [x, y, sx, sy] of [[x0, y0, -1, -1], [x1, y0, 1, -1], [x0, y1, -1, 1], [x1, y1, 1, 1]]) a.tube([[x, y, z1], [x + sx * splay, y + sy * splay, z0]], [r, r], 8); }
function handwheel(a, x, y, z, R, axis = 'y') {
  if (axis === 'y') { ring(a, 'xz', x, y, z, R, 4, 22, 5); a.ycyl(y - 8, y + 8, x, z, 12, 8); for (let i = 0; i < 4; i++) { const t = (i / 4) * PI * 2; a.tube([[x, y, z], [x + m.cos(t) * R, y, z + m.sin(t) * R]], [3, 3], 4); } a.ell(x + R * 0.7, y - 4, z + R * 0.7, 9, 9, 9, 6, 4); }
  else { ring(a, 'yz', x, y, z, R, 4, 22, 5); a.xcyl(x - 8, x + 8, y, z, 12, 8); for (let i = 0; i < 4; i++) { const t = (i / 4) * PI * 2; a.tube([[x, y, z], [x, y + m.cos(t) * R, z + m.sin(t) * R]], [3, 3], 4); } }
}
function gauge(a, x, y, z, r = 22) { a.ycyl(y - 12, y, x, z, r, 14); a.ycyl(y - 14, y - 12, x, z, r * 0.8, 14); a.circ(x, y, r, 'EQUIP-DETAIL'); }
/** vertical wheels pair: wheel of radius r with hub, axis along X between x0 and x1 */
function wheelX(a, x0, x1, y, z, r) { a.xcyl(x0, x1, y, z, r, 18); a.xcyl(x0 - 2, x1 + 2, y, z, r * 0.45, 12); }
/** a cabinet drawn into a sub-box of the body */
function subCab(a, x0, w, z0, h, o, yf = a.YF) { const sub = new Acc({ x: x0, y: yf, z: z0, w, h }); cab(sub, o); for (const t of sub.t) a.t.push(t); for (const p of sub.p) a.p.push(p); }
function caster4(a, x0, x1, y0, y1, r = 38) { for (const [x, y] of [[x0 + 40, y0 + 40], [x1 - 40, y0 + 40], [x0 + 40, y1 - 40], [x1 - 40, y1 - 40]]) { a.box(x - 22, y - 22, a.Z0 + r * 2 - 4, x + 22, y + 22, a.Z0 + r * 2 + 6); a.xcyl(x - 14, x + 14, y, a.Z0 + r, r, 14); a.box(x - 18, y - 4, a.Z0 + r, x - 14, y + 4, a.Z0 + r * 2); a.box(x + 14, y - 4, a.Z0 + r, x + 18, y + 4, a.Z0 + r * 2); } }
/** a hex socket / nut body with axis along Z */
function hexZ(a, x, y, z0, z1, r) { a.cyl(x, y, z0, z1, r, 6); }
/** a pistol-grip handle: grip from the body down to the floor on a foot; hx = x of the grip top, lean = x offset at the foot */
function pistol(a, o) {
  const { Z0 } = a, cy = o.y ?? a.YF / 2, zb = Z0 + o.zb, hx = o.hx, hr = o.hr ?? 22;
  grip(a, [hx, cy, zb - o.Rm * 0.7], [hx + o.lean, cy, Z0 + o.bat], hr);
  a.box(hx - o.bw / 2 + o.lean, cy - o.bd / 2, Z0, hx + o.bw / 2 + o.lean, cy + o.bd / 2, Z0 + o.bat); a.rect(hx - o.bw / 2 + o.lean, cy - o.bd / 2, hx + o.bw / 2 + o.lean, cy + o.bd / 2, 'EQUIP');
  if (o.trigger !== false) a.box(hx - hr * 1.5, cy - hr * 0.3, zb - o.Rm * 0.7 - 36, hx - hr * 0.85, cy + hr * 0.3, zb - o.Rm * 0.7 - 2);
}
/** a flat bent strip: segs [[angle from vertical (deg, + toward +x), length mm], ...], width w measured across, extruded y0..y1. returns the end point [x, z] */
function strip(a, x, z, w, y0, y1, segs) {
  for (const [th, len] of segs) {
    const t = th * PI / 180, dx = m.sin(t), dz = m.cos(t), nx = m.cos(t), nz = -m.sin(t), x1 = x + dx * len, z1 = z + dz * len;
    prismY(a, [[x + nx * w / 2, z + nz * w / 2], [x - nx * w / 2, z - nz * w / 2], [x1 - nx * w / 2, z1 - nz * w / 2], [x1 + nx * w / 2, z1 + nz * w / 2]], y0, y1); x = x1; z = z1;
  }
  return [x, z];
}

// ------------------------------------------------------------------------------------------ hand tools
const MAL = [['wooden carpenter, 12 in', { type: 'wood', hl: 290, hh: 62, hw: 50, hlen: 150 }], ['rubber, 16 oz', { type: 'rubber', hl: 300, hh: 42, hlen: 100 }], ['dead-blow, 2 lb', { type: 'dead', hl: 320, hh: 46, hlen: 130 }]];
const RAT = [['quarter-inch drive, 6 in', { drv: 6.35, L: 110, hr: 21, hw: 13 }], ['three-eighths drive, 8 in', { drv: 9.5, L: 160, hr: 26, hw: 16 }], ['half-inch drive, 10 in', { drv: 12.7, L: 215, hr: 33, hw: 19 }]];
const PW = [['10 in', { L: 254 }], ['14 in', { L: 356 }], ['18 in', { L: 457 }]];
const LP = [['curved jaw, 7 in', { L: 178, tip: 0.9, c: 0.2 }], ['curved jaw, 10 in', { L: 254, tip: 0.9, c: 0.2 }], ['long-nose, 6 in', { L: 152, tip: 0.25, c: 0.12, longnose: true }]];
const FL = [['flat bastard, 10 in', { k: 'flat', bl: 254, hl: 100 }], ['half-round, 12 in', { k: 'half', bl: 305, hl: 105 }], ['round rat-tail, 8 in', { k: 'round', bl: 203, hl: 95 }]];
const PB = [['flat bar, 12 in', { k: 'flat', L: 305 }], ['flat bar, 18 in', { k: 'flat', L: 457 }], ['wrecking bar, 30 in', { k: 'wreck', L: 762 }], ['nail puller, 14 in', { k: 'puller', L: 356 }]];
const TP = [['16 ft, 3/4 in tape', { cw: 76, ch: 70, cd: 38, tw: 19, tl: 150 }], ['25 ft, 1 in tape', { cw: 90, ch: 80, cd: 46, tw: 25, tl: 170 }], ['33 ft, 1-1/4 in tape', { cw: 104, ch: 90, cd: 52, tw: 32, tl: 190 }]];
const LV = [['torpedo, 9 in', { L: 229, lh: 30, ld: 20, holes: [], plumbs: [0.3] }], ['box beam, 24 in', { L: 610, lh: 57, ld: 26, holes: [-0.2, 0.2], plumbs: [-0.36, 0.36] }], ['box beam, 48 in', { L: 1219, lh: 57, ld: 26, holes: [-0.2, -0.1, 0.1, 0.2], plumbs: [-0.37, 0.37] }], ['box beam, 72 in', { L: 1829, lh: 57, ld: 26, holes: [-0.28, -0.18, -0.08, 0.08, 0.18, 0.28], plumbs: [-0.4, 0.4] }]];
const BC = [['18 in', { L: 457 }], ['24 in', { L: 610 }], ['36 in', { L: 914 }]];
const TR = [['brick trowel, 11 in', { bl: 279, bw: 115, hl: 110, k: 'brick' }], ['pointing trowel, 6 in', { bl: 152, bw: 55, hl: 70, k: 'brick' }], ['finishing trowel, 14 in', { bl: 356, bw: 120, hl: 120, k: 'flat' }]];
const AX = [['hatchet, 14 in', { hl: 360, s: 0.8, bl: 100 }], ['felling axe, 26 in', { hl: 660, s: 1, bl: 120 }], ['splitting axe, 30 in', { hl: 760, s: 1.05, bl: 130, wedge: true }], ['splitting maul, 34 in', { hl: 860, s: 1, bl: 130, wedge: true, maul: true }]];

const HAND = [
  fam({ cat: 'tools/hand', title: 'Generic mallet on stand',
    desc: (v) => `${v.kind} mallet on a stand: a tapered handle with a flared grip end and ${v.type === 'wood' ? 'a rectangular wooden head with sloped faces and a wedge in the top of the eye' : v.type === 'rubber' ? 'a cylindrical rubber head with a raised ring at each face' : 'a cylindrical head with a central groove and a rubber-sleeved handle'}.`,
    vs: MAL.map(([l, p]) => [l, U(p.hlen + 30), m.max(4, U(2 * (p.hw || p.hh + 4) + 16)), U(60 + p.hl + 34), 0, p]).map((r) => { r[5] = { ...r[5], kind: r[0].split(',')[0][0].toUpperCase() + r[0].split(',')[0].slice(1) }; return r; }),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 60, zt = zb + v.hl - v.hh + 20; a.outline(); stand(a, cx, cy, 70, 60);
      a.tube([[cx, cy, zb], [cx, cy, zb + 40], [cx, cy, zb + v.hl * 0.5], [cx, cy, zb + v.hl]], [19, 14, 12, 12], 12);
      if (v.type === 'dead') a.tube([[cx, cy, zb], [cx, cy, zb + v.hl * 0.55]], [17, 17], 12);
      const x0 = cx - v.hlen / 2, x1 = cx + v.hlen / 2;
      if (v.type === 'wood') { prismX(a, [[cy - v.hw, zt - v.hh], [cy + v.hw, zt - v.hh], [cy + v.hw * 0.85, zt + v.hh], [cy - v.hw * 0.85, zt + v.hh]], x0, x1); a.box(cx - 14, cy - 4, zt + v.hh, cx + 14, cy + 4, zt + v.hh + 8); a.rect(x0, cy - v.hw, x1, cy + v.hw); }
      else if (v.type === 'rubber') { a.xcyl(x0, x1, cy, zt, v.hh, 22); a.xcyl(x0, x0 + 8, cy, zt, v.hh + 4, 22); a.xcyl(x1 - 8, x1, cy, zt, v.hh + 4, 22); a.rect(x0, cy - v.hh - 4, x1, cy + v.hh + 4); }
      else { a.xcyl(x0, cx - 8, cy, zt, v.hh, 22); a.xcyl(cx - 8, cx + 8, cy, zt, v.hh - 7, 22); a.xcyl(cx + 8, x1, cy, zt, v.hh, 22); a.rect(x0, cy - v.hh, x1, cy + v.hh); }
      a.circ(cx, cy, 14, 'EQUIP-DETAIL'); a.log('Added the stand, flared tapered handle and the ' + (v.type === 'wood' ? 'sloped wooden head with eye wedge' : v.type === 'rubber' ? 'rubber head with face rings' : 'grooved head and sleeved grip') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic ratchet wrench with socket on stand',
    desc: (v) => `Ratchet wrench, ${v.drv < 7 ? 'quarter-inch' : v.drv < 10 ? 'three-eighths' : 'half-inch'} square drive, on a stand with the head up: a flat handle with a ribbed grip, a round ratchet head with a reversing lever and a release button, a square drive and a hex socket on the drive.`,
    vs: RAT.map(([l, p]) => [l, U(2 * p.hr + 16), 5, U(60 + p.L + p.hr + 12), 0, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 60, zt = zb + v.L, hw = v.hw; a.outline(); stand(a, cx, cy, 45, 60);
      prismY(a, [[cx - hw, zb], [cx + hw, zb], [cx + hw * 0.7, zt - v.hr * 0.7], [cx - hw * 0.7, zt - v.hr * 0.7]], cy - 8, cy + 8);
      for (let i = 0; i < m.floor(v.L * 0.55 / 12); i++) a.box(cx - hw - 0.5, cy - 9.5, zb + 12 + i * 12, cx + hw + 0.5, cy + 9.5, zb + 15 + i * 12);
      a.ycyl(cy - 12, cy + 12, cx, zt, v.hr, 22); a.ycyl(cy - 14, cy - 12, cx, zt, v.hr * 0.7, 20); a.ycyl(cy + 12, cy + 18, cx, zt, v.hr * 0.3, 10);
      a.box(cx - v.hr * 0.5, cy - 10, zt + v.hr - 3, cx + v.hr * 0.5, cy + 10, zt + v.hr + 8);
      a.box(cx - v.drv / 2, cy - 24, zt - v.drv / 2, cx + v.drv / 2, cy - 14, zt + v.drv / 2); a.ycyl(cy - 60, cy - 24, cx, zt, v.drv * 1.5, 6); a.circ(cx, cy - 40, v.drv * 1.5, 'EQUIP-DETAIL');
      a.rect(cx - hw, cy - 9, cx + hw, cy + 9, 'EQUIP-DETAIL'); a.log('Added the stand, flat ribbed handle, ratchet head with lever and button, square drive and the hex socket (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic pipe wrench on stand',
    desc: (v) => `Pipe wrench, ${m.round(v.L / IN)} in long, on a stand: an I-section handle with side flanges, a hooked fixed jaw with teeth, a sliding hook jaw and a knurled adjusting nut.`,
    vs: PW.map(([l, p]) => [l, U(p.L * 0.05 * 3.6 + 24), 3.5, U(60 + p.L + 8), 0, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 60, hw = v.L * 0.05, Lh = v.L * 0.66, hh = v.L * 0.34, zh = zb + Lh; a.outline(); stand(a, cx, cy, 60, 60);
      prismY(a, [[cx - hw, zb], [cx + hw, zb], [cx + hw * 0.85, zh], [cx - hw * 0.85, zh]], cy - 5, cy + 5); a.box(cx - hw, cy - 9, zb, cx - hw + 4, cy + 9, zh); a.box(cx + hw - 4, cy - 9, zb, cx + hw, cy + 9, zh);
      a.box(cx - hw * 1.7, cy - 10, zh, cx - hw * 0.5, cy + 10, zh + hh * 0.7); prismY(a, [[cx - hw * 1.7, zh + hh * 0.7], [cx + hw * 0.35, zh + hh * 0.7], [cx + hw * 0.55, zh + hh * 0.95], [cx - hw * 1.7, zh + hh * 0.95]], cy - 10, cy + 10);
      a.box(cx - hw * 0.5, cy - 10, zh, cx + hw * 1.8, cy + 10, zh + hh * 0.22);
      a.box(cx + hw * 0.7, cy - 10, zh + hh * 0.22, cx + hw * 1.8, cy + 10, zh + hh * 0.65); prismY(a, [[cx + hw * 0.55, zh + hh * 0.65], [cx + hw * 1.8, zh + hh * 0.65], [cx + hw * 1.8, zh + hh * 0.8], [cx + hw * 0.4, zh + hh * 0.8]], cy - 10, cy + 10);
      a.cyl(cx + hw * 1.25, cy, zh + hh * 0.02, zh + hh * 0.24, hw * 0.8, 16); ribs(a, cx + hw * 1.25, cy, zh + hh * 0.02, zh + hh * 0.24, hw * 0.85, 5);
      for (let i = 0; i < 6; i++) { a.box(cx - hw * 0.5, cy - 8, zh + hh * 0.1 + i * hh * 0.1, cx - hw * 0.5 + 3, cy + 8, zh + hh * 0.13 + i * hh * 0.1); a.box(cx + hw * 0.7 - 3, cy - 8, zh + hh * 0.3 + i * hh * 0.06, cx + hw * 0.7, cy + 8, zh + hh * 0.33 + i * hh * 0.06); }
      a.rect(cx - hw * 1.7, cy - 10, cx + hw * 1.8, cy + 10); a.log('Added the stand, I-section handle with flanges, hooked fixed jaw, sliding jaw with teeth and the knurled nut (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic locking pliers on stand',
    desc: (v) => `${v.longnose ? 'Long-nose' : 'Curved-jaw'} locking pliers, ${m.round(v.L / IN)} in long, on a stand with the jaws up: a fixed handle with an adjusting screw knob, a lever handle with a release tab, a pivot and ${v.longnose ? 'long tapered jaws' : 'two curved gripping jaws'}.`,
    vs: LP.map(([l, p]) => [l, U(p.L * 0.075 * 5.4 + 24), 3, U(60 + p.L + 6), 0, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 60, hw = v.L * 0.075, zp = zb + v.L * 0.55, jl = v.L * 0.43; a.outline(); stand(a, cx, cy, 50, 60);
      prismY(a, [[cx - hw * 2.4, zb], [cx - hw * 0.9, zb], [cx - hw * 0.4, zp], [cx - hw * 1.6, zp]], cy - 6, cy + 6); prismY(a, [[cx - hw * 2.3, zb], [cx - hw * 1.0, zb], [cx - hw * 0.75, zb + (zp - zb) * 0.7], [cx - hw * 1.9, zb + (zp - zb) * 0.7]], cy - 10, cy + 10);
      prismY(a, [[cx + hw * 0.9, zb], [cx + hw * 2.4, zb], [cx + hw * 1.7, zp - v.L * 0.08], [cx + hw * 0.8, zp - v.L * 0.08]], cy - 6, cy + 6); prismY(a, [[cx + hw * 1.0, zb], [cx + hw * 2.3, zb], [cx + hw * 1.85, zb + (zp - zb) * 0.7], [cx + hw * 1.0, zb + (zp - zb) * 0.7]], cy - 10, cy + 10);
      a.ell(cx - hw * 1.65, cy, zb + 4, 10, 10, 9, 10, 5); a.box(cx + hw * 2.0, cy - 6, zp - v.L * 0.22, cx + hw * 2.6, cy + 6, zp - v.L * 0.12);
      a.box(cx + hw * 0.7, cy - 7, zp - v.L * 0.08, cx + hw * 1.7, cy + 7, zp + v.L * 0.03); a.ycyl(cy - 9, cy + 9, cx + hw * 0.1, zp + v.L * 0.03, hw * 0.5, 12);
      const t = v.tip, c = v.c;
      prismY(a, [[cx - hw * 1.6, zp], [cx - hw * 0.4, zp], [cx - hw * c, zp + jl * 0.5], [cx - hw * t, zp + jl * 0.95], [cx - hw * 1.6, zp + jl * 0.6]].map(([x, z], i) => i === 3 || i === 2 ? [x, z] : [x, z]), cy - 6, cy + 6);
      prismY(a, [[cx + hw * 0.4, zp], [cx + hw * 1.6, zp], [cx + hw * 1.6, zp + jl * 0.6], [cx + hw * t, zp + jl * 0.95], [cx + hw * c, zp + jl * 0.5]], cy - 6, cy + 6);
      a.rect(cx - hw * 2.4, cy - 10, cx + hw * 2.6, cy + 10); a.log('Added the stand, fixed handle with adjusting knob, lever handle with release tab, the pivot and the ' + (v.longnose ? 'long tapered' : 'curved') + ' jaws (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic engineer file on stand',
    desc: (v) => `${v.k === 'flat' ? 'Flat' : v.k === 'half' ? 'Half-round' : 'Round rat-tail'} file, ${m.round((v.bl + v.hl) / IN)} in overall, on a stand: a turned wooden handle with a ferrule and a tapered ${v.k === 'flat' ? 'rectangular' : v.k === 'half' ? 'half-round' : 'round'} blade with rows of cut teeth across the face.`,
    vs: FL.map(([l, p]) => [l, 2.5, 2.5, U(60 + p.hl + p.bl + 14), 0, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 60, zh = zb + v.hl, z0 = zh + 10, z1 = zh + 10 + v.bl; a.outline(); stand(a, cx, cy, 45, 60);
      a.tube([[cx, cy, zb], [cx, cy, zb + 8], [cx, cy, zb + v.hl * 0.3], [cx, cy, zb + v.hl * 0.85], [cx, cy, zh]], [10, 15, 16, 13, 10], 12); a.cyl(cx, cy, zh - 14, zh + 10, 12, 12);
      const n = m.floor((v.bl - 20) / 6);
      if (v.k === 'round') { a.cone(cx, cy, z0, z1 - 10, 9, 4, 12); for (let i = 0; i < n; i++) { const t = i / n; a.cyl(cx, cy, z0 + 6 + i * 6, z0 + 8 + i * 6, 9 - t * 5 + 1.2, 12); } a.cone(cx, cy, z1 - 10, z1, 4, 1.5, 10); a.circ(cx, cy, 9, 'EQUIP'); }
      else {
        const w = 14, th = v.k === 'flat' ? 4 : 8;
        for (let s = 0; s < 4; s++) {
          const za = z0 + (v.bl * s) / 4, zb2 = z0 + (v.bl * (s + 1)) / 4, k = 1 - 0.18 * s / 3;
          if (v.k === 'flat') a.prism([[cx - w * k, cy - th], [cx + w * k, cy - th], [cx + w * k, cy + th], [cx - w * k, cy + th]], za, zb2 - (s === 3 ? 6 : 0));
          else a.prism(Array.from({ length: 9 }, (_, j) => [cx + w * k * m.cos(PI * j / 8), cy - th * m.sin(PI * j / 8) * 1.0 + 0]), za, zb2 - (s === 3 ? 6 : 0));
        }
        for (let i = 0; i < n; i++) { const k = 1 - 0.18 * i / n; a.box(cx - 12 * k, cy - th - 1.4, z0 + 8 + i * 6, cx + 12 * k, cy - th + 0.2, z0 + 9.6 + i * 6); }
        a.rect(cx - w, cy - th, cx + w, cy + th);
      }
      a.log('Added the stand, turned handle with ferrule and the tapered blade with rows of cut teeth (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic pry bar on stand',
    desc: (v) => v.k === 'wreck' ? `Wrecking bar, ${m.round(v.L / IN)} in long, on a stand: a hexagonal steel shaft with a gooseneck bend and a curved forked claw at the top and a flat chisel end at the bottom.` : v.k === 'puller' ? `Nail puller, ${m.round(v.L / IN)} in long, on a stand: a flat steel bar curled over at the top into a forked claw.` : `Flat pry bar, ${m.round(v.L / IN)} in long, on a stand: a flat steel bar with a bent forked nail slot at the top and a flat chisel end below.`,
    vs: PB.map(([l, p]) => [l, p.k === 'wreck' ? 5.25 : 4.5, 3.5, U(60 + p.L + 10), 0, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 60, L = v.L; a.outline(); stand(a, cx + (v.k === 'wreck' ? -55 : -30), cy, 55, 60);
      if (v.k === 'wreck') {
        const ox = cx - 55, pts = [[0, 0], [0, L - 210], [10, L - 170], [45, L - 110], [85, L - 50], [110, L - 14]]; a.tube(pts.map(([x, z]) => [ox + x, cy, zb + z]), [13, 13, 13, 12, 11, 9], 6);
        a.tube([[ox + 110, cy - 5, zb + L - 14], [ox + 118, cy - 5, zb + L - 6]], [8, 5], 6); a.tube([[ox + 110, cy + 5, zb + L - 14], [ox + 118, cy + 5, zb + L - 6]], [8, 5], 6);
        a.box(ox - 18, cy - 6, zb, ox + 18, cy + 6, zb + 10); a.rect(ox - 13, cy - 13, ox + 120, cy + 13); a.log('Added the stand, hex shaft with gooseneck bend, forked claw and the chisel end (plan and 3D).'); return;
      }
      const ox = cx - 30;
      if (v.k === 'flat') { const [px, pz] = strip(a, ox, zb, 24, cy - 3.5, cy + 3.5, [[0, L - 70]]); for (const s of [-7.5, 7.5]) strip(a, px + s, pz, 9, cy - 3.5, cy + 3.5, [[50, 70]]); a.rect(ox - 12, cy - 4, ox + 74, cy + 4); }
      else { const [px, pz] = strip(a, ox, zb, 24, cy - 3.5, cy + 3.5, [[0, L - 110], [30, 45], [70, 40]]); for (const s of [-7.5, 7.5]) strip(a, px + s, pz, 9, cy - 3.5, cy + 3.5, [[110, 32]]); a.rect(ox - 12, cy - 4, ox + 70, cy + 4); }
      a.box(ox - 12, cy - 4.5, zb + 8, ox + 12, cy + 4.5, zb + 16); a.log('Added the stand, flat steel bar with the bent forked claw and the chisel end (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic tape measure on table',
    desc: (v) => `Tape measure with a ${v.tw} mm wide steel tape: an octagonal case with a rubber grip pad, a lock button on top and a belt clip on the back, the tape drawn out along the table with graduation marks and an end hook.`,
    vs: TP.map(([l, p]) => [l, U(p.cw + p.tl + 14), m.max(2.5, U(p.cd + 24)), U(p.ch + 10), 0, p]),
    build: (a, v) => {
      const { Z0, YF, X0, X1 } = a, cy = YF / 2, x0 = X0 + 6, cw = v.cw, ch = v.ch, cd = v.cd; a.outline();
      const pl = [[0, 10], [10, 0], [cw - 10, 0], [cw, 10], [cw, ch - 14], [cw - 14, ch], [14, ch], [0, ch - 14]].map(([x, z]) => [x0 + x, Z0 + z]);
      prismY(a, pl, cy - cd / 2, cy + cd / 2); a.box(x0 + 8, cy - cd / 2 - 3, Z0 + 14, x0 + cw - 8, cy - cd / 2, Z0 + ch - 14);
      a.box(x0 + cw * 0.55, cy - 8, Z0 + ch, x0 + cw * 0.8, cy + 8, Z0 + ch + 6); a.box(x0 + cw * 0.3, cy + cd / 2, Z0 + ch * 0.25, x0 + cw * 0.7, cy + cd / 2 + 3, Z0 + ch * 0.95); a.box(x0 + cw * 0.3, cy + cd / 2 + 3, Z0 + ch * 0.25, x0 + cw * 0.7, cy + cd / 2 + 7, Z0 + ch * 0.25 + 5);
      const xt = X1 - 6; a.box(x0 + cw, cy - v.tw / 2, Z0, xt, cy + v.tw / 2, Z0 + 1.2);
      for (let x = x0 + cw + 8; x < xt - 8; x += 6) a.box(x, cy - v.tw / 2, Z0 + 1.2, x + 0.8, cy + v.tw / 2 - (m.round((x - x0) / 6) % 4 ? 8 : 0), Z0 + 1.7);
      a.box(xt - 2, cy - v.tw / 2, Z0, xt, cy + v.tw / 2, Z0 + 14); a.box(xt - 6, cy - v.tw / 2, Z0 + 12, xt, cy + v.tw / 2, Z0 + 14);
      a.rect(x0, cy - cd / 2, x0 + cw, cy + cd / 2); a.rect(x0 + cw, cy - v.tw / 2, xt, cy + v.tw / 2, 'EQUIP-DETAIL'); a.log('Added the octagonal case with grip pad, lock button and belt clip and the drawn-out tape with marks and hook (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic spirit level on blocks',
    desc: (v) => `${m.round(v.L / IN)} in spirit level resting on two blocks: a ${v.holes.length ? 'box-section beam with ' + v.holes.length + ' hand holes' : 'short body'}, a horizontal vial in a centre housing, ${v.plumbs.length} plumb vial window${v.plumbs.length > 1 ? 's' : ''} and rubber end caps.`,
    vs: LV.map(([l, p]) => [l, U(p.L + 24), m.max(1.5, U(p.ld + 14)), U(p.lh + 16 + 8), 0, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, x0 = cx - v.L / 2, x1 = cx + v.L / 2, zb = Z0 + 16, zt = zb + v.lh, ld = v.ld; a.outline(); saddles(a, [x0 + v.L * 0.12, x1 - v.L * 0.12], cy, zb, ld + 6);
      a.box(x0, cy - ld / 2, zb, x1, cy + ld / 2, zb + 8); a.box(x0, cy - ld / 2, zt - 8, x1, cy + ld / 2, zt);
      const hl = 90, holes = v.holes.map((f) => cx + f * v.L), cuts = [x0, ...holes.flatMap((h) => [h - hl / 2, h + hl / 2]), x1];
      for (let i = 0; i < cuts.length; i += 2) if (cuts[i + 1] > cuts[i]) a.box(cuts[i], cy - 4, zb + 8, cuts[i + 1], cy + 4, zt - 8);
      for (const h of holes) { a.box(h - hl / 2, cy - ld / 2, zb + 8, h - hl / 2 + 4, cy + ld / 2, zt - 8); a.box(h + hl / 2 - 4, cy - ld / 2, zb + 8, h + hl / 2, cy + ld / 2, zt - 8); a.rect(h - hl / 2, cy - ld / 2, h + hl / 2, cy + ld / 2, 'EQUIP-DETAIL'); }
      const zc = (zb + zt) / 2, vy = cy - ld / 2; a.box(cx - 32, cy - ld / 2, zb + 8, cx + 32, cy + ld / 2, zt - 8); a.xcyl(cx - 26, cx + 26, vy - 2, zc, 6.5, 10); a.box(cx - 30, vy - 3, zc - 9, cx - 26, vy, zc + 9); a.box(cx + 26, vy - 3, zc - 9, cx + 30, vy, zc + 9);
      for (const f of v.plumbs) { const x = cx + f * v.L; a.box(x - 20, cy - ld / 2, zb + 8, x + 20, cy + ld / 2, zt - 8); a.ycyl(vy - 2, vy, x, zc, m.min(14, v.lh * 0.28), 14); a.ycyl(vy - 3, vy - 2, x, zc, m.min(9, v.lh * 0.18), 12); }
      for (const s of [-1, 1]) a.box(s < 0 ? x0 - 10 : x1, cy - ld / 2 - 1, zb - 1, s < 0 ? x0 : x1 + 10, cy + ld / 2 + 1, zt + 1);
      a.rect(x0, cy - ld / 2, x1, cy + ld / 2); a.log('Added the rails and web with hand holes, the centre vial, plumb vial windows, rubber end caps and the two blocks (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic bolt cutter on stand',
    desc: (v) => `Bolt cutter, ${m.round(v.L / IN)} in handles, standing on a stand with the jaws up: two long tapered handles with rubber grips, a head block with pivot bolts, two link bars and two angled jaw blades.`,
    vs: BC.map(([l, p]) => [l, U(2 * (48 + p.L * 0.02 + 16)), 4, U(60 + p.L + 146), 0, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 60, zp = zb + v.L, s0 = 48 + v.L * 0.02; a.outline(); stand(a, cx, cy, 60, 60);
      for (const s of [-1, 1]) { a.tube([[cx + s * s0, cy, zb], [cx + s * s0 * 0.55, cy, zb + v.L * 0.6], [cx + s * 20, cy, zp]], [12, 12, 10], 10); a.tube([[cx + s * s0, cy, zb], [cx + s * s0 * 0.85, cy, zb + v.L * 0.3]], [15, 15], 10); a.tube([[cx + s * 20, cy - 17, zp - 2], [cx + s * 8, cy - 17, zp + 48]], [5, 5], 6); a.tube([[cx + s * 20, cy + 17, zp - 2], [cx + s * 8, cy + 17, zp + 48]], [5, 5], 6); }
      a.box(cx - 42, cy - 14, zp - 10, cx + 42, cy + 14, zp + 60); for (const s of [-1, 1]) a.ycyl(cy - 20, cy + 20, cx + s * 28, zp + 30, 8, 10);
      prismY(a, [[cx - 36, zp + 60], [cx - 3, zp + 60], [cx - 3, zp + 120], [cx - 14, zp + 142], [cx - 30, zp + 120]], cy - 10, cy + 10); prismY(a, [[cx + 3, zp + 60], [cx + 36, zp + 60], [cx + 30, zp + 120], [cx + 14, zp + 142], [cx + 3, zp + 120]], cy - 10, cy + 10);
      a.rect(cx - s0 - 15, cy - 15, cx + s0 + 15, cy + 15); a.log('Added the stand, two tapered handles with grips, head block with pivots, link bars and the two angled jaw blades (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic masonry trowel',
    desc: (v) => `${v.k === 'brick' ? 'Pointed brick-laying trowel' : 'Rectangular finishing trowel'}, ${m.round(v.bl / IN)} in blade, resting on its blade: a ${v.k === 'brick' ? 'kite-shaped' : 'flat rectangular'} steel blade, a cranked neck on two mounting feet and a ribbed wooden handle with a ferrule.`,
    vs: TR.map(([l, p]) => [l, U(p.bl + 12), U(p.bw + 16), 4.5, 0, p]),
    build: (a, v) => {
      const { Z0, YF, X0, X1 } = a, cy = YF / 2, x0 = X0 + 6, x1 = X1 - 6, bw = v.bw; a.outline();
      const pl = v.k === 'brick' ? [[x0, cy - bw * 0.35], [x0 + v.bl * 0.28, cy - bw / 2], [x1, cy], [x0 + v.bl * 0.28, cy + bw / 2], [x0, cy + bw * 0.35]] : [[x0, cy - bw / 2], [x1, cy - bw / 2], [x1, cy + bw / 2], [x0, cy + bw / 2]];
      a.prism(pl, Z0, Z0 + 2); a.poly(pl.map(([x, y]) => [x, y]));
      const xn = x0 + v.bl * 0.2, zh = Z0 + 90; for (const s of [-1, 1]) a.tube([[xn, cy + s * bw * 0.14, Z0 + 2], [xn, cy + s * bw * 0.14, Z0 + 56], [xn + 16, cy + s * 4, zh - 6]], [3.5, 3.5, 3.5], 6);
      a.box(xn - 12, cy - bw * 0.16, Z0, xn + 12, cy - bw * 0.12, Z0 + 3); a.box(xn - 12, cy + bw * 0.12, Z0, xn + 12, cy + bw * 0.16, Z0 + 3);
      const hx = xn + 22; const hr = m.min(17, bw * 0.22); a.xcyl(hx, hx + 14, cy, zh, hr * 0.65, 10); a.tube([[hx + 14, cy, zh], [hx + 14 + v.hl * 0.2, cy, zh + 1], [hx + 14 + v.hl * 0.8, cy, zh + 1], [hx + 14 + v.hl, cy, zh]], [hr * 0.8, hr, hr, hr * 0.7], 12);
      for (let i = 0; i < 4; i++) a.xcyl(hx + 22 + i * v.hl * 0.2, hx + 24 + i * v.hl * 0.2, cy, zh, hr * 1.04, 12); a.rect(hx, cy - hr, hx + 14 + v.hl, cy + hr, 'EQUIP-DETAIL');
      a.log('Added the blade, cranked neck on two feet, ferrule and the ribbed handle (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic axe on stand',
    desc: (v) => `${v.maul ? 'Splitting maul' : v.wedge ? 'Splitting axe' : v.s < 0.9 ? 'Hatchet' : 'Felling axe'}, ${m.round(v.hl / IN)} in handle, on a stand with the head up: a gently curved handle with a knob end, a steel head with an eye block, ${v.maul ? 'a flat striking poll and a wide wedge-shaped splitting blade' : v.wedge ? 'a small poll and a wide wedge-shaped blade' : 'a poll and a flared blade with a ground edge'}.`,
    vs: AX.map(([l, p]) => [l, 9.25, 4.5, U(60 + p.hl + 56), 0, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, hx = cx - 40, zb = Z0 + 60, zt = zb + v.hl - 30; a.outline(); stand(a, hx, cy, 55, 60);
      a.tube([[hx, cy, zb], [hx + 4, cy, zb + v.hl * 0.3], [hx + 2, cy, zb + v.hl * 0.7], [hx, cy, zb + v.hl]], [16, 14, 13, 13], 12); a.ell(hx, cy, zb + 8, 20, 16, 12, 10, 6);
      a.box(hx - 24, cy - 20, zt - 45, hx + 24, cy + 20, zt + 45);
      const bl = v.bl, th = v.wedge ? [26, 16, 7] : [18, 11, 4], hf = (x) => 45 + (x - (hx + 24)) / bl * 35 * v.s;
      for (let i = 0; i < 3; i++) { const xa = hx + 24 + bl * i / 3, xb = hx + 24 + bl * (i + 1) / 3; prismY(a, [[xa, zt - hf(xa)], [xb, zt - hf(xb)], [xb, zt + hf(xb)], [xa, zt + hf(xa)]], cy - th[i], cy + th[i]); }
      if (v.maul) a.box(hx - 70, cy - 30, zt - 45, hx - 24, cy + 30, zt + 45); else a.box(hx - 46 * v.s, cy - 17, zt - 30 * v.s, hx - 24, cy + 17, zt + 30 * v.s);
      a.rect(hx - (v.maul ? 70 : 46 * v.s), cy - 20, hx + 24 + bl, cy + 20); a.circ(hx, cy, 14, 'EQUIP-DETAIL'); a.log('Added the stand, curved handle with knob, eye block, poll and the ' + (v.wedge ? 'wedge-shaped' : 'flared') + ' blade (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic fine saw on stand',
    desc: (v) => v.k === 'cope' ? 'Coping saw on a stand: a round handle with a turning ferrule, a thin spring-steel U frame, a fine 6.5 in blade held between two swivel pins and a toothed back rod.' : 'Pull saw on a stand: a long wrapped round handle and a thin tapered blade with a stiffening spine and a row of fine teeth along the cutting edge.',
    vs: [['coping saw, 6.5 in blade', 6, 3, 15, 0, { k: 'cope' }], ['pull saw, 9 in blade', 3, 2.5, 21.25, 0, { k: 'pull' }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 60; a.outline();
      if (v.k === 'cope') {
        const hx = cx - 65; stand(a, hx, cy, 45, 60); a.tube([[hx, cy, zb], [hx, cy, zb + 10], [hx, cy, zb + 60], [hx, cy, zb + 110]], [10, 16, 15, 11], 12); a.cyl(hx, cy, zb + 104, zb + 120, 13, 12);
        const z1 = zb + 120, z2 = zb + 295; a.tube([[hx, cy, z1], [hx + 20, cy, z1 + 6], [cx + 55, cy, z1 + 6], [cx + 65, cy, z1 + 16], [cx + 65, cy, z2 - 8], [cx + 55, cy, z2], [hx + 12, cy, z2], [hx, cy, z2 - 4]], [4, 4, 4, 4, 4, 4, 4, 4], 6);
        a.box(hx - 1.5, cy - 0.5, z1 + 4, hx + 1.5, cy + 0.5, z2 - 4); for (const z of [z1 + 2, z2 - 4]) a.cyl(hx, cy, z, z + 6, 5, 8); for (let i = 0; i < 24; i++) a.box(cx + 65 - 3, cy - 1, z1 + 30 + i * 6, cx + 65 + 3, cy + 1, z1 + 32 + i * 6);
        a.rect(hx - 16, cy - 16, cx + 70, cy + 16, 'EQUIP-DETAIL'); return a.log('Added the stand, round handle with ferrule, the spring U frame, the blade with swivel pins and the toothed back rod (plan and 3D).');
      }
      stand(a, cx, cy, 45, 60); a.tube([[cx, cy, zb], [cx, cy, zb + 10], [cx, cy, zb + 120], [cx, cy, zb + 235], [cx, cy, zb + 255]], [10, 14, 14, 13, 8], 12); for (let i = 0; i < 8; i++) a.cyl(cx, cy, zb + 30 + i * 24, zb + 33 + i * 24, 14.8, 12);
      const z0 = zb + 255, z1 = z0 + 229; prismY(a, [[cx - 14, z0], [cx + 12, z0], [cx + 9, z1], [cx - 9, z1]], cy - 0.8, cy + 0.8); a.box(cx + 9, cy - 3, z0 + 8, cx + 13, cy + 3, z1 - 4);
      for (let i = 0; i < 30; i++) { const z = z0 + 12 + i * 7, xe = cx - 14 + (14 - 9) * (z - z0) / 229; prismY(a, [[xe, z], [xe - 4, z + 3.5], [xe, z + 7]], cy - 0.8, cy + 0.8); }
      a.rect(cx - 14, cy - 14, cx + 14, cy + 14); a.log('Added the stand, long wrapped handle and the thin tapered blade with spine and fine teeth (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ power tools
const RH = [['SDS-plus, 1 in, pistol grip', { t: 'pistol', L: 345, Rm: 34, zb: 170, bit: 100 }], ['SDS-plus, 1-1/8 in, D handle', { t: 'd', L: 440, Rm: 42, zb: 190, bit: 110 }], ['SDS-max, 1-9/16 in, D handle', { t: 'd', L: 600, Rm: 56, zb: 235, bit: 150, big: true }]];
const BR = [['breaker, 15 lb class, hex bit', { bl: 260, Rm: 56 }], ['breaker, 30 lb class, hex bit', { bl: 330, Rm: 70 }]];
const PL = [['corded, 3-1/4 in cut', { cw: 82 }], ['cordless, 3-1/4 in cut, battery', { cw: 82, bat: true }], ['corded, 6 in wide cut', { cw: 150 }]];
const SP = [['handheld HVLP gun with cup', { k: 'gun' }], ['airless cart, 0.3 gallon per minute', { k: 'cart', R: 90 }], ['airless cart, 0.6 gallon per minute, hopper', { k: 'cart', R: 105, hop: true }]];
const DS = [['corded, adjustable nose cone', { k: 'plain' }], ['collated strip feed, extension magazine', { k: 'auto' }]];
const DG = [['straight pencil, quarter-inch collet', { k: 'straight', L: 270 }], ['right-angle head, quarter-inch collet', { k: 'angle', L: 250 }]];
const GG = [['mini, low temperature', { k: 'mini', L: 150, r: 14 }], ['full size, dual temperature', { k: 'full', L: 190, r: 18 }], ['cordless, on charging base', { k: 'cordless', L: 185, r: 18 }]];
const SO = [['pencil iron, 40 watt, with coil stand', { k: 'pencil' }], ['temperature station, 60 watt', { k: 'station' }], ['soldering gun, 140 watt', { k: 'gun' }]];
const RT = [['corded, variable speed', { k: 'plain' }], ['with flexible shaft on hanger stand', { k: 'flex' }]];
const CS = [['corded, 14 in bar', { bar: 356, bh: 110, k: 'corded' }], ['corded, 18 in bar, 2400 watt', { bar: 457, bh: 120, k: 'corded' }], ['cordless, 12 in bar, battery', { bar: 305, bh: 100, k: 'cordless' }]];
const WL = [['LED tripod, single head, 5000 lumen class', { heads: 1, h: 56, sp: 300 }], ['LED tripod, dual head, 10000 lumen class', { heads: 2, h: 66, sp: 360 }], ['LED telescoping stand, dual head, 20000 lumen class', { heads: 2, h: 80, sp: 440, big: true }]];
const BT = [['18 volt pack, 2.0 amp-hour compact', { k: 'pack', ph: 90 }], ['18 volt pack, 5.0 amp-hour with gauge', { k: 'pack', ph: 128, gauge: true }], ['dual-bay rapid charger with one pack docked', { k: 'charger' }]];
const SH = [['electric shear, 14 gauge', { k: 'shear' }], ['nibbler, 18 gauge', { k: 'nibbler' }], ['cordless shear, 20 gauge, battery', { k: 'shear', bat: true }]];
const SV = [['5 gallon, wet and dry', { R: 150, th: 250 }], ['12 gallon, wet and dry', { R: 195, th: 340 }]];

const POWER = [
  fam({ cat: 'tools/power', title: 'Generic rotary hammer',
    desc: (v) => `${v.t === 'pistol' ? 'Pistol-grip' : 'D-handle'} rotary hammer for hammer-action drilling: a keyless quick-change chuck with a dust cap and a ${v.bit} mm bit, a gear housing with a clamped side handle, a motor barrel with vent slots${v.t === 'pistol' ? ', a pistol grip with a trigger and a cord foot' : ' and a looped rear D handle with a trigger, resting on two blocks'}.`,
    vs: RH.map(([l, p]) => [l, U(p.L + 24), U(2 * p.Rm + 120), U(p.zb + p.Rm * 1.1 + (p.t === 'd' ? 110 : 12)), 0, p]),
    build: (a, v) => {
      const { Z0, cx } = a, Rm = v.Rm, yA = -(Rm + 10), zb = Z0 + v.zb, xf = cx - v.L / 2, xr = cx + v.L / 2 - 6; a.outline();
      a.tube([[xf, yA, zb], [xf + 14, yA, zb]], [2.5, 7], 8); a.xcyl(xf + 14, xf + v.bit, yA, zb, 7, 8); a.xcyl(xf + v.bit - 10, xf + v.bit + 14, yA, zb, Rm * 0.72, 16); a.xcyl(xf + v.bit + 14, xf + v.bit + 62, yA, zb, Rm * 0.6, 16);
      const xg = xf + v.bit + 62, xm = xg + v.L * 0.26; a.xcyl(xg, xm, yA, zb, Rm * 0.92, 18); a.tube([[xm, yA, zb], [xm + (xr - xm) * 0.5, yA, zb], [xr - 8, yA, zb]], [Rm, Rm * 1.08, Rm * 0.9], 16); a.ell(xr - 8, yA, zb, 16, Rm * 0.9, Rm * 0.9, 8, 6);
      for (let i = 0; i < 5; i++) a.box(xm + 20 + i * 14, yA - Rm * 1.12, zb - Rm * 0.3, xm + 24 + i * 14, yA - Rm * 1.05, zb + Rm * 0.5);
      a.xcyl(xg + 6, xg + 36, yA, zb, Rm * 0.98 + 4, 16); a.tube([[xg + 21, yA - Rm - 2, zb], [xg + 21, yA - Rm - 96, zb - 28]], [10, 13], 10); a.ell(xg + 21, yA - Rm - 98, zb - 29, 12, 5, 12, 8, 5);
      if (v.t === 'pistol') { pistol(a, { y: yA, zb: v.zb, hx: xm + (xr - xm) * 0.55, Rm, lean: 10, bat: 44, bw: 52, bd: 46, hr: Rm * 0.52 }); saddles(a, [xg + 20], yA, zb - Rm * 0.9, Rm * 1.4); a.tube([[xm + (xr - xm) * 0.55 + 10, yA, Z0 + 14], [xm + (xr - xm) * 0.55 + 60, yA + 20, Z0 + 8], [xm + (xr - xm) * 0.55 + 90, yA + 30, Z0 + 8]], [6, 5, 5], 6); }
      else { saddles(a, [xg + 30, xr - 70], yA, zb - Rm * 1.0, Rm * 1.4); const zt = zb + Rm * 0.95; a.tube([[xr - 90, yA, zt], [xr - 90, yA, zt + 52], [xr - 44, yA, zt + 92], [xr + 4, yA, zt + 52], [xr + 4, yA, zb + Rm * 0.2]], [14, 14, 14, 14, 13], 12); a.box(xr - 88, yA - 8, zt + 10, xr - 70, yA + 8, zt + 50); }
      a.rect(xf, yA - Rm, xr, yA + Rm); a.rect(xg + 6, yA - Rm - 98, xg + 36, yA - Rm, 'EQUIP-DETAIL'); a.log('Added the chuck with dust cap and bit, gear housing, side handle on its collar, vented motor barrel and the ' + (v.t === 'pistol' ? 'pistol grip with trigger' : 'looped D handle with trigger') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic demolition breaker on stand',
    desc: (v) => `Electric breaker, ${v.Rm > 60 ? '30' : '15'} lb class, standing on its bit point on a stand: a hex chisel bit with a retainer sleeve, a gear housing, a vented motor body, a top crossbar with two looped hand grips, a trigger switch and a cord stub.`,
    vs: BR.map(([l, p]) => [l, U(2 * (p.Rm + 124)), U(p.Rm * 2.3 + 10), U(60 + p.bl + 300), 0, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, Rm = v.Rm, zb = Z0 + 60, zg = zb + v.bl, zm = zg + 110, zt = zm + 160; a.outline(); stand(a, cx, cy, 70, 60);
      a.tube([[cx, cy, zb], [cx, cy, zb + 40], [cx, cy, zg + 10]], [3, 13, 13], 6); a.cyl(cx, cy, zg - 36, zg + 12, 26, 6); a.cone(cx, cy, zg + 12, zg + 60, Rm * 0.62, Rm * 0.78, 16); a.cyl(cx, cy, zg + 60, zm, Rm * 0.8, 18);
      a.cyl(cx, cy, zm, zt, Rm, 20); for (let i = 0; i < 6; i++) { const t = i / 6 * PI * 2; a.box(cx + m.cos(t) * Rm * 1.0 - 4, cy + m.sin(t) * Rm * 1.0 - 4, zm + 30, cx + m.cos(t) * Rm * 1.03 + 4, cy + m.sin(t) * Rm * 1.03 + 4, zm + 110); }
      a.ell(cx, cy, zt, Rm, Rm, 26, 16, 6); a.box(cx - Rm * 0.6, cy - Rm * 0.5, zt + 8, cx + Rm * 0.6, cy + Rm * 0.5, zt + 36);
      for (const s of [-1, 1]) { a.tube([[cx + s * Rm * 0.5, cy, zt + 24], [cx + s * (Rm + 50), cy, zt + 44], [cx + s * (Rm + 108), cy, zt - 20], [cx + s * (Rm + 100), cy, zt - 70]], [13, 14, 14, 14], 12); a.tube([[cx + s * (Rm + 70), cy, zt + 30], [cx + s * (Rm + 108), cy, zt - 20]], [15, 15], 12); }
      a.box(cx - Rm - 84, cy - 6, zt - 90, cx - Rm - 60, cy + 6, zt - 50); a.tube([[cx, cy + Rm * 0.5, zt + 30], [cx + 40, cy + Rm * 0.5 + 40, zt + 36]], [6, 5], 6);
      a.circ(cx, cy, Rm, 'EQUIP'); a.rect(cx - Rm - 114, cy - 15, cx + Rm + 114, cy + 15, 'EQUIP-DETAIL'); a.log('Added the stand, hex bit with retainer, gear housing, vented motor body, crossbar with two looped grips, trigger and cord stub (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic electric hand planer',
    desc: (v) => `${v.bat ? 'Cordless' : 'Corded'} hand planer with a ${v.cw} mm cut: a front shoe with a depth knob and a rear shoe with a cutter drum between them, a motor housing with a belt cover, a chip port at the side, a looped rear handle with a trigger${v.bat ? ' and a battery pack under the handle' : ''}.`,
    vs: PL.map(([l, p]) => [l, 13, U(p.cw + 60), 4.5, 0, p]),
    build: (a, v) => {
      const { Z0, X0, X1, YF } = a, cy = YF / 2, x0 = X0 + 10, x1 = X1 - 10, y0 = cy - v.cw / 2 - 16, y1 = cy + v.cw / 2 + 16; a.outline();
      a.box(x0, y0, Z0 + 4, x0 + 120, y1, Z0 + 12); a.box(x1 - 130, y0, Z0, x1, y1, Z0 + 8); a.ycyl(y0 + 8, y1 - 8, x0 + 150, Z0 + 18, 17, 14); for (let i = 0; i < 6; i++) a.box(x0 + 138, y0 + 10 + i * (v.cw + 4) / 6, Z0 + 4, x0 + 162, y0 + 10 + i * (v.cw + 4) / 6 + 3, Z0 + 12);
      a.box(x0 + 110, y0 + 8, Z0 + 12, x0 + 220, y1 - 8, Z0 + 56); a.xcyl(x0 + 130, x1 - 80, cy, Z0 + 78, 30, 16); a.ell(x1 - 80, cy, Z0 + 78, 14, 30, 30, 8, 6);
      a.box(x0 + 150, y1 - 8, Z0 + 20, x0 + 215, y1 + 24, Z0 + 52); a.box(x0 + 120, y0 - 12, Z0 + 14, x0 + 200, y0 + 8, Z0 + 52); a.cyl(x0 + 40, cy, Z0 + 12, Z0 + 44, 7, 8); a.ell(x0 + 40, cy, Z0 + 52, 24, 24, 12, 12, 6);
      a.tube([[x1 - 120, cy, Z0 + 100], [x1 - 70, cy, Z0 + 118], [x1 - 20, cy, Z0 + 100], [x1 - 14, cy, Z0 + 44]], [12, 13, 13, 12], 10); a.box(x1 - 110, cy - 6, Z0 + 68, x1 - 88, cy + 6, Z0 + 96);
      if (v.bat) a.box(x1 - 96, cy - 32, Z0 + 14, x1 - 12, cy + 32, Z0 + 56);
      a.rect(x0, y0, x1, y1); a.rect(x0 + 150 - 17, y0 + 8, x0 + 150 + 17, y1 - 8, 'EQUIP-DETAIL'); a.log('Added the front and rear shoes, cutter drum, depth knob, motor housing with belt cover, chip port and the looped handle' + (v.bat ? ' with battery pack' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic paint sprayer',
    desc: (v) => v.k === 'gun' ? 'Handheld HVLP spray gun standing on its grip on a base: a barrel with an air cap and fluid nozzle, a fluid adjusting knob at the rear, a top-mounted cup with a vented lid, a pistol grip with a trigger and an air fitting at the foot.' : `Airless paint sprayer on a two-wheel cart: a pump housing with a motor dome and a pressure dial, a hose coil, a suction tube into a paint bucket${v.hop ? ' and a hopper above the pump' : ''}, a spray gun on a hook and a tube handle.`,
    vs: [[SP[0][0], 8, 6, 9, 0, SP[0][1]], [SP[1][0], 26, 22, 38, 0, SP[1][1]], [SP[2][0], 28, 22, 44, 0, SP[2][1]]],
    build: (a, v) => {
      const { Z0, X0, X1, YF, cx } = a, cy = YF / 2; a.outline();
      if (v.k === 'gun') {
        const zb = Z0 + 150; stand(a, cx + 20, cy, 60, 14); a.cyl(cx + 20, cy, Z0 + 14, Z0 + 20, 24, 14);
        grip(a, [cx + 22, cy, zb - 14], [cx + 28, cy, Z0 + 20], 17); a.box(cx + 4, cy - 5, zb - 74, cx + 16, cy + 5, zb - 36); a.cyl(cx + 28, cy, Z0 + 14, Z0 + 28, 11, 10);
        a.xcyl(cx - 60, cx + 70, cy, zb, 22, 16); a.cone(cx - 60, cy, zb, zb + 0.01, 0.01, 0.01, 3); a.tube([[cx - 100, cy, zb], [cx - 60, cy, zb]], [7, 14], 12); a.xcyl(cx - 68, cx - 52, cy, zb, 24, 16); a.ell(cx + 76, cy, zb, 12, 20, 20, 10, 6);
        a.cyl(cx - 10, cy, zb + 20, zb + 36, 12, 10); a.cyl(cx - 10, cy, zb + 36, zb + 108, 40, 20); a.cyl(cx - 10, cy, zb + 108, zb + 116, 42, 20); a.ell(cx - 10, cy, zb + 118, 14, 14, 8, 8, 5);
        a.circ(cx - 10, cy, 40, 'EQUIP'); a.rect(cx - 100, cy - 22, cx + 76, cy + 22, 'EQUIP-DETAIL'); return a.log('Added the base, pistol grip with trigger and air fitting, barrel with air cap and nozzle, fluid knob and the cup with vented lid (plan and 3D).');
      }
      const R = v.R, wx = X1 - 40, yW = -60; a.box(cx - 200, -330, Z0 + 150, cx + 200, -80, Z0 + 400 + (v.hop ? 0 : 0)); a.rect(cx - 200, -330, cx + 200, -80);
      a.ell(cx, -205, Z0 + 410, 190, 120, 70, 18, 8); gauge(a, cx - 110, -330, Z0 + 330, 40); a.ycyl(-345, -330, cx + 50, Z0 + 330, 28, 14); a.box(cx + 120, -334, Z0 + 270, cx + 180, -330, Z0 + 300);
      if (v.hop) { a.cone(cx, -205, Z0 + 440, Z0 + 560, 60, 130, 18); a.cyl(cx, -205, Z0 + 560, Z0 + 575, 134, 18); }
      for (const s of [-1, 1]) { wheelX(a, s < 0 ? X0 + 10 : X1 - 50, s < 0 ? X0 + 50 : X1 - 10, -60, Z0 + 150, 150); }
      a.xcyl(X0 + 10, X1 - 10, -60, Z0 + 150, 8, 8); a.tube([[cx - 190, -90, Z0 + 330], [cx - 190, -60, Z0 + 700], [cx + 190, -60, Z0 + 700], [cx + 190, -90, Z0 + 330]], [12, 12, 12, 12], 8);
      for (const s of [-1, 1]) { a.tube([[cx + s * 160, -330, Z0 + 200], [cx + s * 190, -420, Z0 + 14]], [10, 12], 8); a.box(cx + s * 190 - 30, -450, Z0, cx + s * 190 + 30, -400, Z0 + 14); }
      ring(a, 'xz', cx + 130, -352, Z0 + 520 + 0, 100, 7, 24, 5); a.tube([[cx - 130, -300, Z0 + 340], [X0 + 50, -400, Z0 + 200], [X0 + 60, -470, Z0 + 150]], [8, 8, 8], 6);
      const bx = X0 + 160, by = -430; a.cyl(bx, by, Z0, Z0 + 300, 135, 24); a.cyl(bx, by, Z0 + 300, Z0 + 310, 140, 24); a.tube([[bx - 135, by, Z0 + 250], [bx - 150, by, Z0 + 240]], [10, 10], 6); a.circ(bx, by, 135, 'EQUIP');
      a.tube([[cx - 100, -300, Z0 + 150], [bx + 60, by, Z0 + 150], [bx + 60, by, Z0 + 20]], [10, 10, 10], 8); a.tube([[cx - 60, -300, Z0 + 150], [bx + 20, by + 40, Z0 + 150], [bx + 20, by + 40, Z0 + 60]], [8, 8, 8], 6);
      a.box(cx + 120, -90, Z0 + 700, cx + 160, -60, Z0 + 740); a.tube([[cx + 140, -75, Z0 + 700], [cx + 140, -75, Z0 + 560]], [10, 10], 8); a.rect(bx - 135, by - 135, bx + 135, by + 135, 'EQUIP-DETAIL');
      a.log('Added the pump housing with motor dome and pressure dial, wheels and handle, hose coil, suction tube into the bucket' + (v.hop ? ', hopper' : '') + ' and the gun hook (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic drywall screw gun',
    desc: (v) => `${v.k === 'auto' ? 'Collated-strip drywall screw gun' : 'Corded drywall screw gun'}: an inline motor body with vent slots, a pistol grip with a trigger and a cord foot, an adjustable depth nose cone with a bit${v.k === 'auto' ? ' and an extension magazine with a screw strip along the nose' : ''}.`,
    vs: [[DS[0][0], 15, 7, 9, 0, DS[0][1]], [DS[1][0], 22, 7, 9, 0, DS[1][1]]],
    build: (a, v) => {
      const { Z0, cx } = a, Rm = 40, yA = -(Rm + 8), zb = Z0 + 170, auto = v.k === 'auto', L = auto ? 500 : 360, xf = cx - L / 2; a.outline();
      a.tube([[xf, yA, zb], [xf + 14, yA, zb]], [3, 6.5], 8); a.xcyl(xf + 14, xf + 70, yA, zb, 6.5, 8);
      a.xcyl(xf + 40, xf + 110, yA, zb, Rm * 0.52, 14); ring(a, 'yz', xf + 75, yA, zb, Rm * 0.52, 2.5, 14, 4);
      a.tube([[xf + 110, yA, zb], [xf + 150, yA, zb], [xf + L * 0.55, yA, zb], [xf + L - 8, yA, zb]], [Rm * 0.6, Rm * 0.8, Rm, Rm * 0.9], 16); a.ell(xf + L - 8, yA, zb, 18, Rm * 0.9, Rm * 0.9, 8, 6);
      for (let i = 0; i < 5; i++) a.box(xf + L * 0.4 + i * 12, yA - Rm * 1.04, zb - Rm * 0.2, xf + L * 0.4 + i * 12 + 4, yA - Rm * 0.98, zb + Rm * 0.5);
      pistol(a, { y: yA, zb: 170, hx: xf + L * 0.62, Rm, lean: 6, bat: 44, bw: 50, bd: 46, hr: 23 }); a.tube([[xf + L * 0.62 + 6, yA, Z0 + 14], [xf + L * 0.62 + 70, yA + 25, Z0 + 8], [xf + L * 0.62 + 120, yA + 30, Z0 + 8]], [6, 5, 5], 6);
      a.box(xf + L * 0.62 - 40, yA - 8, zb + Rm - 2, xf + L * 0.62 - 12, yA + 8, zb + Rm + 6); saddles(a, [xf + 80], yA, zb - Rm * 0.52, 60);
      if (auto) { a.box(xf + 60, yA - 24, zb - Rm * 0.52 - 10 - 30, xf + 330, yA + 24, zb - Rm * 0.52 - 10); for (let i = 0; i < 14; i++) a.box(xf + 80 + i * 16, yA - 8, zb - Rm * 0.52 - 40 - 8, xf + 80 + i * 16 + 9, yA + 8, zb - Rm * 0.52 - 40); a.box(xf + 64, yA - 28, zb - Rm * 0.52 - 40, xf + 98, yA + 28, zb - Rm * 0.52 - 8); }
      a.rect(xf, yA - Rm, xf + L, yA + Rm); a.log('Added the bit and nose cone, vented motor body, pistol grip with trigger and cord foot' + (auto ? ' and the extension magazine with the screw strip' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic die grinder on blocks',
    desc: (v) => v.k === 'straight' ? 'Straight pencil die grinder resting on two blocks: a slim round body with a throttle lever, a tapered nose with a collet nut and wrench flats, a mounted grinding point and an air inlet fitting at the rear.' : 'Right-angle die grinder resting on two blocks: a round body with a throttle lever and an air inlet, a square head turned ninety degrees with a collet nut pointing down and a mounted grinding point.',
    vs: [[DG[0][0], 13, 3.5, 3.5, 0, DG[0][1]], [DG[1][0], 12, 4.5, 6, 0, DG[1][1]]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, xf = cx - v.L / 2, r = 17; let zb = Z0 + 40 + r; a.outline();
      if (v.k === 'straight') {
        saddles(a, [xf + 80, xf + v.L - 60], cy, zb - r, 50); a.ell(xf + 4, cy, zb, 5, 4, 4, 6, 4); a.xcyl(xf + 8, xf + 40, cy, zb, 3, 8); a.tube([[xf + 40, cy, zb], [xf + 70, cy, zb], [xf + 80, cy, zb]], [5, 8, 8], 10); a.cyl(xf + 62, cy, zb - 8, zb + 8, 0.1, 3);
        a.xcyl(xf + 70, xf + 86, cy, zb, 9, 6); a.tube([[xf + 86, cy, zb], [xf + 130, cy, zb], [xf + v.L - 30, cy, zb], [xf + v.L - 8, cy, zb]], [r * 0.7, r, r, r * 0.85], 16);
        for (let i = 0; i < 5; i++) a.xcyl(xf + 140 + i * 14, xf + 142 + i * 14, cy, zb, r + 1.5, 16); a.tube([[xf + 150, cy, zb + r - 2], [xf + 190, cy, zb + r + 6], [xf + 230, cy, zb + r - 2]], [4, 4, 4], 6); a.xcyl(xf + v.L - 8, xf + v.L, cy, zb, 9, 8);
        a.rect(xf, cy - r, xf + v.L, cy + r); return a.log('Added the mounted point, collet nut with flats, tapered nose, slim body with throttle lever, ribs and air inlet (plan and 3D).');
      }
      zb = Z0 + 80; saddles(a, [xf + 50, xf + v.L - 90], cy, zb - r, 50); a.xcyl(xf + 10, xf + 40, cy, zb, r * 0.8, 12); a.tube([[xf + 40, cy, zb], [xf + 110, cy, zb], [xf + v.L - 20, cy, zb]], [r, r * 1.05, r * 0.95], 16); a.ell(xf + 20, cy, zb, 12, r, r, 8, 6);
      const hx = xf + 6; a.box(hx - 22, cy - 20, zb - 40, hx + 30, cy + 20, zb + 20); a.cyl(hx, cy, zb - 56, zb - 40, 9, 8); a.cyl(hx, cy, zb - 66, zb - 56, 5, 8); a.ell(hx, cy, zb - 78, 9, 9, 12, 8, 5);
      a.tube([[hx + 60, cy, zb + r - 2], [hx + 100, cy, zb + r + 6], [hx + 140, cy, zb + r - 2]], [4, 4, 4], 6); a.xcyl(xf + v.L - 20, xf + v.L, cy, zb, 9, 8);
      a.rect(hx - 22, cy - 20, xf + v.L, cy + 20); a.log('Added the vented round body with throttle lever, the right-angle square head, the collet nut and the mounted point and the air inlet (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic hot glue gun',
    desc: (v) => `${v.k === 'cordless' ? 'Cordless hot glue gun standing in a charging base' : v.k === 'mini' ? 'Mini hot glue gun with a small barrel' : 'Full-size hot glue gun'}: a ${v.k === 'mini' ? '7 mm' : '11 mm'} glue stick fed in from the rear, a barrel with a heated nozzle cone, a pistol grip with a trigger${v.k === 'cordless' ? ' and a charging base with contact pins and an indicator' : ' and a bent wire stand under the nose'}.`,
    vs: GG.map(([l, p]) => [l, p.k === 'cordless' ? 10 : 9, 3.5, p.k === 'mini' ? 6 : 8, 0, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, r = v.r, L = v.L, xf = cx - L / 2, zb = Z0 + (v.k === 'mini' ? 105 : 150); a.outline();
      a.xcyl(xf + 20, xf + L * 0.62, cy, zb, r, 14); a.tube([[xf + 20, cy, zb], [xf - 2, cy, zb]], [r * 0.65, 4], 10); a.xcyl(xf + L * 0.62, xf + L - 24, cy, zb, r * 0.9, 14); a.ell(xf + L - 24, cy, zb, 10, r * 0.9, r * 0.9, 8, 6);
      a.xcyl(xf + L - 20, xf + L + 14 + 20, cy, zb + 3, v.k === 'mini' ? 3.5 : 5.5, 8);
      const gx = xf + L * 0.66; grip(a, [gx, cy, zb - r * 0.6], [gx + 6, cy, Z0 + (v.k === 'cordless' ? 40 : 6)], r * 0.95); a.box(gx - r * 1.6, cy - 4, zb - r * 0.6 - 34, gx - r * 0.9, cy + 4, zb - r * 0.6 - 2);
      for (let i = 0; i < 4; i++) a.box(xf + L * 0.35 + i * 10, cy - r * 1.05, zb - r * 0.4, xf + L * 0.35 + i * 10 + 4, cy - r * 0.95, zb + r * 0.5);
      if (v.k === 'cordless') { a.box(gx - 42, cy - 36, Z0, gx + 54, cy + 36, Z0 + 40); a.box(gx - 26, cy - 22, Z0 + 40, gx + 38, cy + 22, Z0 + 46); a.ell(gx + 40, cy - 34, Z0 + 20, 3, 3, 3, 6, 4); a.rect(gx - 42, cy - 36, gx + 54, cy + 36, 'EQUIP-DETAIL'); }
      else { a.cyl(gx + 6, cy, Z0, Z0 + 6, r * 1.1, 12); a.tube([[xf + 26, cy - 10, zb - r * 0.8], [xf + 6, cy - 10, Z0 + 4], [xf + 6, cy + 10, Z0 + 4], [xf + 26, cy + 10, zb - r * 0.8]], [3, 3, 3, 3], 5); }
      a.rect(xf - 2, cy - r, xf + L + 34, cy + r); a.log('Added the barrel with heated nozzle, the glue stick, pistol grip with trigger and ' + (v.k === 'cordless' ? 'the charging base with pins' : 'the wire stand') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic soldering iron set',
    desc: (v) => v.k === 'pencil' ? 'Pencil soldering iron, 40 watt, lying in a base with a coil holder: a rounded grip, a ribbed barrel with a heater sleeve, a replaceable cone tip, a cord leaving the grip, and a sponge pot on a weighted base.' : v.k === 'station' ? 'Temperature-controlled soldering station: a base housing with a front dial, a display window and two buttons, a spring holder with the iron lying in it and a sponge tray.' : 'Pistol-style soldering gun, 140 watt: a vented body with a trigger switch, a pair of tip terminals and a bent copper loop tip, standing on its grip with a wire rest under the nose.',
    vs: [[SO[0][0], 8, 5, 3.5, 0, SO[0][1]], [SO[1][0], 8, 6, 6.5, 0, SO[1][1]], [SO[2][0], 8, 3, 7, 0, SO[2][1]]],
    build: (a, v) => {
      const { Z0, X0, X1, YF, cx } = a, cy = YF / 2; a.outline();
      if (v.k === 'pencil') {
        a.box(X0 + 6, cy - 55, Z0, X1 - 6, cy + 55, Z0 + 12); a.cyl(X1 - 50, cy - 20, Z0 + 12, Z0 + 28, 24, 14); a.cyl(X1 - 50, cy - 20, Z0 + 28, Z0 + 29, 20, 14);
        for (let i = 0; i < 6; i++) ring(a, 'yz', X0 + 56 + i * 10, cy + 25, Z0 + 52, 14, 2.4, 14, 5); a.tube([[X0 + 50, cy + 25, Z0 + 12], [X0 + 56, cy + 25, Z0 + 52]], [3, 3], 5); a.tube([[X0 + 130, cy + 25, Z0 + 12], [X0 + 130, cy + 25, Z0 + 46]], [3, 3], 5);
        const z = Z0 + 52, xs = X0 + 70; a.tube([[xs, cy + 25, z], [xs + 50, cy + 25, z], [xs + 110, cy + 25, z], [xs + 118, cy + 25, z]], [9, 12, 12, 8], 12); a.tube([[xs + 118, cy + 25, z], [xs + 130, cy + 25, z], [xs + 140, cy + 25, z]], [5, 4, 3], 8); a.tube([[xs + 140, cy + 25, z], [xs + 150, cy + 25, z - 3]], [2, 1], 6);
        a.tube([[xs - 4, cy + 25, z], [xs - 40, cy + 25, z - 6], [xs - 70, cy + 25, z - 2]], [14, 14, 12], 12); a.tube([[xs - 70, cy + 25, z - 2], [X0 + 4, cy + 10, Z0 + 14]], [3, 3], 5);
        a.rect(X0 + 6, cy - 55, X1 - 6, cy + 55); a.rect(X0 + 10, cy + 20, xs + 150, cy + 30, 'EQUIP-DETAIL'); return a.log('Added the weighted base, wire stand posts, sponge pot, the grip, ribbed barrel, cone tip and the cord (plan and 3D).');
      }
      if (v.k === 'station') {
        a.box(X0 + 10, cy - 70, Z0, X1 - 10, cy + 70, Z0 + 56); a.box(X0 + 10, cy - 72, Z0 + 56, X1 - 10, cy + 70, Z0 + 62); a.ycyl(cy - 90, cy - 70, cx - 50, Z0 + 30, 22, 16); a.box(cx + 10, cy - 76, Z0 + 20, cx + 100, cy - 70, Z0 + 46); for (const dx of [112, 140]) a.ycyl(cy - 78, cy - 70, cx + dx, Z0 + 30, 7, 10);
        const hx = X1 - 24; a.box(hx - 10, cy + 10, Z0 + 62, hx + 10, cy + 30, Z0 + 140); for (let i = 0; i < 7; i++) ring(a, 'yz', hx, cy + 20, Z0 + 150 + i * 6, 11, 2, 12, 4); a.cyl(X0 + 60, cy + 30, Z0 + 62, Z0 + 76, 36, 16); a.cyl(X0 + 60, cy + 30, Z0 + 76, Z0 + 78, 30, 16);
        a.tube([[hx - 10, cy + 20, Z0 + 150], [hx - 90, cy + 20, Z0 + 154], [hx - 160, cy + 20, Z0 + 150], [hx - 190, cy + 20, Z0 + 146]], [8, 11, 11, 9], 12); a.tube([[hx - 10, cy + 20, Z0 + 150], [hx + 8, cy + 20, Z0 + 152]], [4, 3], 8); a.tube([[hx - 190, cy + 20, Z0 + 146], [X0 + 20, cy + 50, Z0 + 70]], [3, 3], 5);
        a.rect(X0 + 10, cy - 70, X1 - 10, cy + 70); return a.log('Added the base with dial, display window and buttons, sponge tray, the spring holder and the iron lying in it (plan and 3D).');
      }
      stand(a, cx + 10, cy, 50, 12); a.cyl(cx + 10, cy, Z0 + 12, Z0 + 20, 36, 14); const zb = Z0 + 120;
      grip(a, [cx + 10, cy, zb - 20], [cx + 12, cy, Z0 + 20], 20); a.tube([[cx - 60, cy, zb], [cx + 70, cy, zb]], [34, 40], 14); a.ell(cx + 70, cy, zb, 14, 38, 38, 8, 6);
      for (let i = 0; i < 4; i++) a.box(cx - 40 + i * 20, cy - 41, zb - 12, cx - 36 + i * 20, cy - 36, zb + 30); a.box(cx - 8, cy - 5, zb - 70, cx + 4, cy + 5, zb - 24);
      a.box(cx - 100, cy - 14, zb - 16, cx - 60, cy + 14, zb + 16); a.tube([[cx - 96, cy - 10, zb], [cx - 110, cy - 10, zb + 20], [cx - 118, cy - 3, zb + 4]], [4, 3, 3], 6); a.tube([[cx - 96, cy + 10, zb], [cx - 110, cy + 10, zb + 20], [cx - 118, cy + 3, zb + 4]], [4, 3, 3], 6);
      a.tube([[cx - 70, cy - 20, zb - 20], [cx - 90, cy - 20, Z0 + 6], [cx - 90, cy + 20, Z0 + 6], [cx - 70, cy + 20, zb - 20]], [3, 3, 3, 3], 5);
      a.rect(cx - 118, cy - 40, cx + 84, cy + 40); a.log('Added the vented body, trigger, grip on its foot, tip terminals with the copper loop tip and the wire rest (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic rotary tool',
    desc: (v) => v.k === 'plain' ? 'Corded rotary tool standing on its tail on a stand: a slim ribbed body with a speed dial near the tail, a tapered nose with a collet nut and a mounted grinding stone.' : 'Rotary tool with a flexible shaft on a hanger stand: a weighted base and post with a top arm, the motor hung from a hook ring below the arm with a speed dial, and a flexible shaft ending in a pen-grip handpiece with a keyless chuck and a bit.',
    vs: [[RT[0][0], 3, 3, 9, 0, RT[0][1]], [RT[1][0], 19.5, 8, 25, 0, RT[1][1]]],
    build: (a, v) => {
      const { Z0, YF, cx, X0 } = a, cy = YF / 2; a.outline();
      if (v.k === 'plain') {
        const zb = Z0 + 40; stand(a, cx, cy, 36, 40); a.tube([[cx, cy, zb], [cx, cy, zb + 8], [cx, cy, zb + 110], [cx, cy, zb + 150]], [12, 18, 18, 11], 14); a.cyl(cx, cy, zb + 150, zb + 168, 7.5, 6); a.cyl(cx, cy, zb + 168, zb + 176, 4, 8); a.cyl(cx, cy, zb + 176, zb + 200, 2.5, 8); a.ell(cx, cy, zb + 205, 6, 6, 8, 8, 6);
        a.cyl(cx, cy, zb + 20, zb + 32, 20, 16); ribs(a, cx, cy, zb + 50, zb + 110, 18.6, 6); a.circ(cx, cy, 18, 'EQUIP'); return a.log('Added the stand, ribbed body, speed dial, collet nut and the mounted stone (plan and 3D).');
      }
      const px = X0 + 70; a.cyl(px, cy, Z0, Z0 + 16, 60, 20); a.cyl(px, cy, Z0 + 16, Z0 + 560, 11, 10); a.tube([[px, cy, Z0 + 560], [px + 30, cy, Z0 + 600], [px + 120, cy, Z0 + 610], [px + 190, cy, Z0 + 600]], [11, 10, 10, 10], 10);
      const mx = px + 190; a.cyl(mx, cy, Z0 + 560, Z0 + 600, 6, 8); ring(a, 'xz', mx, cy, Z0 + 556, 12, 3, 12, 5); a.tube([[mx, cy, Z0 + 540], [mx, cy, Z0 + 520], [mx, cy, Z0 + 360], [mx, cy, Z0 + 340]], [10, 28, 30, 18], 16); ribs(a, mx, cy, Z0 + 420, Z0 + 500, 30.5, 5); a.ycyl(cy - 40, cy - 28, mx, Z0 + 470, 14, 12);
      a.tube([[mx, cy, Z0 + 340], [mx, cy, Z0 + 320], [mx + 20, cy, Z0 + 290], [mx + 120, cy, Z0 + 260], [mx + 190, cy, Z0 + 200], [mx + 210, cy, Z0 + 120], [mx + 150, cy, Z0 + 95]], [8, 8, 7, 7, 7, 7, 7], 8);
      for (let i = 0; i < 12; i++) { const t = i / 12; a.cyl(mx + 20 + t * 130, cy, Z0 + 290 - t * 160, Z0 + 291 - t * 160, 8.5, 8); }
      a.tube([[mx + 150, cy, Z0 + 95], [mx + 120, cy, Z0 + 78], [mx + 80, cy, Z0 + 58]], [12, 12, 9], 10); a.tube([[mx + 80, cy, Z0 + 58], [mx + 60, cy, Z0 + 48], [mx + 44, cy, Z0 + 40]], [8, 5, 3], 8); a.rect(px - 60, cy - 60, mx + 210, cy + 60, 'EQUIP-DETAIL');
      a.log('Added the weighted base, post and arm, the hung motor with hook ring and dial, the flexible shaft and the handpiece with chuck and bit (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic electric chainsaw',
    desc: (v) => `${v.k === 'cordless' ? 'Cordless' : 'Corded'} chainsaw with a ${m.round(v.bar / IN)} in bar: a guide bar with a chain of cutting links round the edge and a tip sprocket, a sprocket cover with bar nuts, a motor housing with an oil cap, a chain brake hand guard, a top handle, a rear handle with a trigger${v.k === 'cordless' ? ' and a battery pack' : ' and a cord'}.`,
    vs: CS.map(([l, p]) => [l, U(p.bar + 300), 5.5, U(p.bh + 90), 0, p]),
    build: (a, v) => {
      const { Z0, X0, X1, YF } = a, yA = YF / 2, x0 = X0 + 250, xb1 = x0 + v.bar + 10, zc = Z0 + 52 + (v.k === 'cordless' ? 0 : 0); a.outline();
      saddles(a, [xb1 - 40], yA, zc - 18, 50);
      prismY(a, [[x0 - 20, zc - 16], [xb1 - 16, zc - 16], [xb1, zc], [xb1 - 16, zc + 16], [x0 - 20, zc + 16]], yA - 4, yA + 4);
      for (let x = x0 + 4; x < xb1 - 20; x += 14) { a.box(x, yA - 6, zc + 16, x + 8, yA + 6, zc + 24); a.box(x + 4, yA - 6, zc - 24, x + 12, yA + 6, zc - 16); }
      a.ycyl(yA - 6, yA + 6, xb1 - 14, zc, 16, 14); a.box(x0 - 20, yA - 5.5, zc - 24, xb1 - 16, yA + 5.5, zc - 16); a.box(x0 - 20, yA - 5.5, zc + 16, xb1 - 16, yA + 5.5, zc + 18);
      const hb = Z0 + 0; a.box(x0 - 175, yA - 54, hb, x0 - 15, yA + 54, hb + v.bh); a.ell(x0 - 95, yA, hb + v.bh, 82, 54, 16, 12, 6); a.ycyl(yA - 62, yA - 54, x0 - 46, zc, 44, 18); for (const dx of [-24, 24]) a.ycyl(yA - 66, yA - 62, x0 - 46 + dx * 0.9, zc + dx * 0.9, 5, 8);
      a.cyl(x0 - 120, yA + 20, hb + v.bh + 8, hb + v.bh + 26, 14, 12); a.box(x0 - 14, yA - 36, zc + 6, x0 + 8, yA + 36, zc + 70); a.tube([[x0 - 24, yA - 40, hb + v.bh], [x0 + 4, yA - 40, hb + v.bh + 40], [x0 + 4, yA - 52, hb + v.bh + 52]], [6, 6, 6], 6);
      a.tube([[x0 - 100, yA, hb + v.bh + 12], [x0 - 70, yA, hb + v.bh + 66], [x0 - 150, yA, hb + v.bh + 66], [x0 - 170, yA, hb + v.bh - 20]], [11, 11, 11, 11], 10);
      a.tube([[x0 - 170, yA, hb + v.bh * 0.6], [x0 - 220, yA, hb + 70], [x0 - 220, yA, hb + 8]], [11, 12, 12], 10); a.box(x0 - 200, yA - 5, hb + 40, x0 - 178, yA + 5, hb + 74);
      if (v.k === 'cordless') a.box(x0 - 330 + 120, yA - 34, hb, x0 - 222, yA + 34, hb + 62); else a.tube([[x0 - 222, yA, hb + 8], [x0 - 150, yA + 30, hb + 6], [X0 + 10, yA + 40, hb + 5]], [7, 6, 6], 6);
      a.rect(x0 - 222, yA - 54, xb1, yA + 54); a.rect(x0 - 20, yA - 5, xb1, yA + 5, 'EQUIP-DETAIL'); a.log('Added the guide bar with chain links and tip sprocket, sprocket cover with bar nuts, motor housing with oil cap, brake hand guard, top and rear handles with trigger and the ' + (v.k === 'cordless' ? 'battery pack' : 'cord') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic LED work light on stand',
    desc: (v) => `${v.heads === 1 ? 'Single' : 'Dual'}-head LED work light on a ${v.big ? 'telescoping stand' : 'tripod'}: three splayed legs, a two-section mast with lock knobs, ${v.heads === 1 ? 'a lamp housing' : 'two lamp housings on a cross bar'} with a grid of LED cells behind a bezel, a carry handle and a cable.`,
    vs: WL.map(([l, p]) => [l, U(p.sp * 2 + 60), U(p.sp * 2 + 60), p.h, 0, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, H = v.h * IN, zt = Z0 + H - 220; a.outline();
      for (let i = 0; i < 3; i++) { const t = PI / 2 + i * PI * 2 / 3; a.tube([[cx, cy, Z0 + H * 0.34], [cx + m.cos(t) * v.sp, cy + m.sin(t) * v.sp, Z0 + 14]], [12, 12], 8); a.cyl(cx + m.cos(t) * v.sp, cy + m.sin(t) * v.sp, Z0, Z0 + 14, 22, 10); a.tube([[cx + m.cos(t) * v.sp * 0.5, cy + m.sin(t) * v.sp * 0.5, Z0 + H * 0.34 - (H * 0.34 - 14) * 0.5 + 40], [cx, cy, Z0 + H * 0.2]], [5, 5], 6); }
      a.cyl(cx, cy, Z0 + H * 0.15, Z0 + H * 0.34, 36, 14); a.cyl(cx, cy, Z0 + H * 0.34, Z0 + H * 0.62, 24, 14); a.cyl(cx, cy, Z0 + H * 0.5, Z0 + zt - Z0, 17, 12); a.ell(cx + 28, cy, Z0 + H * 0.5, 9, 9, 9, 6, 4); a.ell(cx + 22, cy, Z0 + H * 0.34, 9, 9, 9, 6, 4);
      a.box(cx - 24, cy - 24, zt - 40, cx + 24, cy + 24, zt);
      const hw = v.heads === 1 ? 0 : 150; if (v.heads === 2) a.box(cx - hw - 20, cy - 12, zt, cx + hw + 20, cy + 12, zt + 24);
      for (const s of v.heads === 1 ? [0] : [-1, 1]) { const x = cx + s * hw, w = v.big ? 200 : 170, h = v.big ? 180 : 150; a.box(x - w / 2, cy - 26, zt + 24, x + w / 2, cy + 8, zt + 24 + h); a.frame(x - w / 2 - 2, zt + 22, x + w / 2 + 2, zt + 26 + h, cy - 32, cy - 26, 8);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) a.box(x - w / 2 + 14 + i * ((w - 28) / 4), cy - 29, zt + 38 + j * ((h - 28) / 4), x - w / 2 + 14 + i * ((w - 28) / 4) + (w - 28) / 4 - 6, cy - 26, zt + 38 + j * ((h - 28) / 4) + (h - 28) / 4 - 6); a.ycyl(cy - 26, cy + 14, x - w / 2 - 14, zt + 24 + h / 2, 10, 8); a.ycyl(cy - 26, cy + 14, x + w / 2 + 14, zt + 24 + h / 2, 10, 8); }
      if (v.heads === 1) a.tube([[cx - 40, cy + 10, zt + 24 + 150], [cx - 40, cy + 10, zt + 24 + 190], [cx + 40, cy + 10, zt + 24 + 190], [cx + 40, cy + 10, zt + 24 + 150]], [8, 8, 8, 8], 8);
      a.tube([[cx + 40, cy + 10, zt + 24], [cx + 100, cy + 100, Z0 + H * 0.3], [cx + v.sp * 0.7, cy + 120, Z0 + 12]], [5, 4, 4], 6);
      a.rect(cx - v.sp, cy - v.sp, cx + v.sp, cy + v.sp, 'EQUIP-HIDDEN'); a.circ(cx, cy, 24, 'EQUIP'); a.log('Added the three legs, the two-section mast with lock knobs, ' + (v.heads === 1 ? 'the lamp housing' : 'the cross bar and two lamp housings') + ' with LED cells behind bezels, handle and cable (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic power tool battery and charger',
    desc: (v) => v.k === 'charger' ? 'Dual-bay rapid charger: a base housing with two pack bays with guide rails and contact terminals, vent slots, a status light for each bay, a mains cable, and one battery pack slid into the left bay.' : `18 volt slide-in battery pack${v.gauge ? ' with a four-segment charge gauge and a push button on the front' : ''}: a block body with two top slide rails, a spring latch tab, a terminal slot set and a rubber-ribbed side.`,
    vs: [[BT[0][0], 3.25, 2.75, 3.5, 0, BT[0][1]], [BT[1][0], 3.25, 2.75, 5, 0, BT[1][1]], [BT[2][0], 9, 6, 6.5, 0, BT[2][1]]],
    build: (a, v) => {
      const { Z0, X0, X1, YF, cx } = a, cy = YF / 2; a.outline();
      const pack = (x, zb, h) => { const w = 78, d = 60; a.box(x - w / 2, cy - d / 2, zb, x + w / 2, cy + d / 2, zb + h - 18); a.box(x - w / 2 + 6, cy - d / 2 + 4, zb + h - 18, x + w / 2 - 6, cy + d / 2 - 4, zb + h - 8);
        a.box(x - w / 2 + 10, cy - d / 2 + 2, zb + h - 8, x - w / 2 + 20, cy + d / 2 - 2, zb + h); a.box(x + w / 2 - 20, cy - d / 2 + 2, zb + h - 8, x + w / 2 - 10, cy + d / 2 - 2, zb + h);
        a.box(x - 12, cy - d / 2 - 2, zb + h - 30, x + 12, cy - d / 2 + 4, zb + h - 12); for (let i = 0; i < 3; i++) a.box(x - 12 + i * 10, cy + d / 2 - 6, zb + h - 14, x - 6 + i * 10, cy + d / 2, zb + h - 4); for (let i = 0; i < 4; i++) a.box(x - w / 2 - 1.2, cy - d / 2 + 6, zb + 10 + i * 8, x - w / 2, cy + d / 2 - 6, zb + 14 + i * 8); };
      if (v.k === 'pack') { pack(cx, Z0, v.ph); if (v.gauge) { a.box(cx - 24, cy - 31, Z0 + 20, cx + 24, cy - 29.5, Z0 + 46); for (let i = 0; i < 4; i++) a.box(cx - 20 + i * 10, cy - 32.5, Z0 + 38, cx - 14 + i * 10, cy - 31, Z0 + 43); a.ycyl(cy - 32, cy - 29.5, cx, Z0 + 28, 5, 10); } a.rect(cx - 39, cy - 30, cx + 39, cy + 30, 'EQUIP-DETAIL'); return a.log('Added the block body with slide rails, latch tab, terminal slots and ribbed side' + (v.gauge ? ', charge gauge and button' : '') + ' (plan and 3D).'); }
      a.box(X0 + 6, cy - 70, Z0, X1 - 6, cy + 70, Z0 + 62); a.box(X0 + 6, cy + 20, Z0 + 62, X1 - 6, cy + 70, Z0 + 150);
      for (const s of [-1, 1]) { const bx = cx + s * 100; a.box(bx - 48, cy - 66, Z0 + 62, bx - 42, cy + 20, Z0 + 100); a.box(bx + 42, cy - 66, Z0 + 62, bx + 48, cy + 20, Z0 + 100); a.box(bx - 30, cy + 14, Z0 + 62, bx + 30, cy + 22, Z0 + 76); a.box(bx - 42, cy - 66, Z0 + 56, bx + 42, cy - 62, Z0 + 62); a.ycyl(cy - 70, cy - 66, bx, Z0 + 30, 6, 10); for (let i = 0; i < 5; i++) a.box(X0 + 20 + (s > 0 ? 190 : 0) + i * 14, cy - 70.5, Z0 + 8, X0 + 24 + (s > 0 ? 190 : 0) + i * 14, cy - 70, Z0 + 20); }
      pack(cx - 100, Z0 + 62, 100); a.tube([[X1 - 10, cy + 60, Z0 + 20], [X1 + 0, cy + 60, Z0 + 10]].map(([x, y, z]) => [x - 10, y, z]), [6, 6], 6); a.tube([[X1 - 20, cy + 60, Z0 + 20], [X1 - 8, cy + 60, Z0 + 6]], [6, 6], 6);
      a.rect(X0 + 6, cy - 70, X1 - 6, cy + 70); a.rect(cx - 139, cy - 30, cx - 61, cy + 30, 'EQUIP-DETAIL'); a.log('Added the base housing with two bays, guide rails, contacts, status lights, vents, mains cable and the pack docked in the left bay (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic metal shear and nibbler',
    desc: (v) => `${v.k === 'nibbler' ? 'Sheet-metal nibbler' : v.bat ? 'Cordless sheet-metal shear' : 'Electric sheet-metal shear'}: an inline motor body with vent slots, a ${v.k === 'nibbler' ? 'head with a round punch and die' : 'cutting head with an upper and a lower blade and a swarf chute'}, a trigger grip with a ${v.bat ? 'battery pack' : 'cord foot'} and a rest block under the nose.`,
    vs: SH.map(([l, p]) => [l, 15, 6.5, 7, 0, p]),
    build: (a, v) => {
      const { Z0, cx } = a, Rm = 32, yA = -(Rm + 12), zb = Z0 + 140, L = 340, xf = cx - L / 2; a.outline();
      a.tube([[xf + 10, yA, zb], [xf + 90, yA, zb], [xf + L * 0.45, yA, zb], [xf + L - 8, yA, zb]], [Rm * 0.7, Rm * 0.9, Rm, Rm * 0.9], 16); a.ell(xf + L - 8, yA, zb, 18, Rm * 0.9, Rm * 0.9, 8, 6);
      for (let i = 0; i < 5; i++) a.box(xf + L * 0.45 + i * 12, yA - Rm * 1.06, zb - Rm * 0.2, xf + L * 0.45 + i * 12 + 4, yA - Rm * 1.0, zb + Rm * 0.5);
      if (v.k === 'nibbler') { a.box(xf - 20, yA - 24, zb - 26, xf + 30, yA + 24, zb + 10); a.cyl(xf - 4, yA, zb + 10, zb + 34, 9, 10); a.box(xf - 20, yA - 24, zb - 40, xf + 12, yA + 24, zb - 26); a.cyl(xf - 4, yA, zb - 26, zb - 14, 9, 10); a.box(xf + 30, yA - 20, zb - 18, xf + 80, yA + 20, zb + 14); }
      else { a.box(xf - 30, yA - 22, zb - 34, xf + 40, yA + 22, zb + 8); prismY(a, [[xf - 40, zb + 10], [xf + 50, zb + 10], [xf + 50, zb + 38], [xf - 20, zb + 38]], yA - 14, yA + 14); prismY(a, [[xf - 44, zb - 40], [xf + 40, zb - 40], [xf + 40, zb - 18], [xf - 30, zb - 18]], yA - 14, yA + 14); a.box(xf + 40, yA + 14, zb - 30, xf + 90, yA + 40, zb + 4); }
      const hx = xf + L * 0.6; pistol(a, { y: yA, zb: 140, hx, Rm, lean: 6, bat: v.bat ? 80 : 44, bw: v.bat ? 66 : 52, bd: v.bat ? 54 : 46, hr: 21 }); if (!v.bat) a.tube([[hx + 6, yA, Z0 + 14], [hx + 70, yA + 20, Z0 + 8], [hx + 110, yA + 26, Z0 + 8]], [6, 5, 5], 6);
      saddles(a, [xf + 60], yA, zb - 40 - 0, 50); a.rect(xf - 30, yA - Rm, xf + L, yA + Rm); a.log('Added the vented motor body, the ' + (v.k === 'nibbler' ? 'punch and die head' : 'blade head and swarf chute') + ', pistol grip with trigger and the rest block (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic wet and dry shop vacuum',
    desc: (v) => `${m.round(v.R * 2 / IN)} in tank wet and dry shop vacuum: a round tank on a four-leg caster base, a motor head with a handle, two side latches, a hose port with a coiled hose and wand, a blower port and a cord hook.`,
    vs: SV.map(([l, p]) => [l, U(p.R * 2 + 140), U(p.R * 2 + 140), U(p.th + 90 + 150), 0, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, R = v.R, zt = Z0 + 90 + v.th; a.outline();
      for (let i = 0; i < 4; i++) { const t = PI / 4 + i * PI / 2, x = cx + m.cos(t) * (R + 10), y = cy + m.sin(t) * (R + 10); a.tube([[cx, cy, Z0 + 90], [x, y, Z0 + 34]], [14, 10], 8); a.cyl(x, y, Z0 + 38, Z0 + 60, 12, 8); a.ell(x, y, Z0 + 22, 14, 14, 22, 8, 6); }
      a.cyl(cx, cy, Z0 + 80, Z0 + 92, R * 0.7, 20); a.cone(cx, cy, Z0 + 90, zt, R * 0.78, R, 28); ring(a, 'xy', cx, cy, Z0 + 90 + v.th * 0.45, R * 0.9 + 1, 2, 28, 4);
      a.cyl(cx, cy, zt, zt + 16, R + 8, 28); a.cyl(cx, cy, zt + 16, zt + 110, R * 0.58, 24); a.ell(cx, cy, zt + 110, R * 0.58, R * 0.58, 34, 20, 7); for (let i = 0; i < 6; i++) a.box(cx - R * 0.59, cy - 3 + (i - 3) * 8, zt + 40, cx - R * 0.58 + 2, cy + 0 + (i - 3) * 8, zt + 90);
      a.tube([[cx - R * 0.8, cy, zt + 16], [cx - R * 0.8, cy, zt + 120], [cx + R * 0.8, cy, zt + 120], [cx + R * 0.8, cy, zt + 16]], [13, 14, 14, 13], 10);
      for (const s of [-1, 1]) { a.box(cx + s * R * 0.9 - 10, cy - 10, zt - 130, cx + s * R * 0.9 + 10, cy + 10, zt + 22); }
      a.xcyl(cx + R, cx + R + 40, cy, zt - 80, 28, 14); a.xcyl(cx - R, cx - R - 20, cy, zt - 60, 20, 12);
      const hx = cx + R * 0.15, hy = cy - R - 10; ring(a, 'yz', cx + R + 20, cy - 10, zt - 120, 90, 14, 18, 6); a.tube([[cx + R + 40, cy, zt - 80], [cx + R + 70, cy, zt - 110]], [18, 16], 10);
      a.box(cx - 30, cy - R * 0.6, zt + 6, cx + 30, cy - R * 0.6 + 12, zt + 24); a.cyl(cx + R * 0.6, cy + R * 0.7, zt + 10, zt + 30, 8, 8);
      a.circ(cx, cy, R, 'EQUIP'); a.rect(cx - R - 20, cy - R - 20, cx + R + 70, cy + R + 20, 'EQUIP-HIDDEN'); a.log('Added the caster base, round tank, motor head with handle, latches, hose port with the coiled hose, blower port and cord hook (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ workshop machines
/** half-round guard over a wheel (axis X) at (x0..x1, cy, zc), radius R */
function hood(a, x0, x1, cy, zc, R, from = 0.05, to = 1.1, n = 14) { for (let k = 0; k < n; k++) { const t = PI * (from + (to - from) * k / n), t2 = PI * (from + (to - from) * (k + 1) / n); a.prism([[x0, cy + m.cos(t) * R], [x1, cy + m.cos(t) * R], [x1, cy + m.cos(t2) * R], [x0, cy + m.cos(t2) * R]].map(([x, y]) => [x, y]), zc + m.sin(t) * R - 2.5, zc + m.sin(t2) * R + 2.5); } }
const SCR = [['16 in throat, bench, variable speed', { th: 406, w: 13, h: 17, tilt: false }], ['21 in throat, bench, tilting table', { th: 533, w: 14, h: 19, tilt: true }]];
const JNT = [['6 in, benchtop', { cut: 152, L: 36, d: 13, h: 15, floor: false }], ['8 in, floor standing cabinet', { cut: 203, L: 62, d: 17, h: 42, floor: true }]];
const PLN = [['12-1/2 in, portable', { cut: 318, w: 22, d: 40, h: 19, stand: false }], ['15 in, stationary on stand', { cut: 381, w: 28, d: 50, h: 44, stand: true }]];
const RTB = [['benchtop, 24 x 16 in top', { w: 24, d: 16, h: 14, floor: false }], ['floor cabinet, 32 x 24 in top', { w: 32, d: 24, h: 40, floor: true }]];
const SDR = [['belt and disc, 4 in belt, 6 in disc, bench', { bw: 102, disc: 76, w: 22, d: 14, h: 16 }], ['belt and disc, 6 in belt, 12 in disc, floor stand', { bw: 152, disc: 152, w: 38, d: 22, h: 40, floor: true }]];
const CNC = [['desktop, 24 x 24 in cut area', { bx: 610, by: 610, bh: 90, hh: 330, leg: false }], ['frame, 4 x 4 ft cut area', { bx: 1219, by: 1219, bh: 760, hh: 420, leg: true }], ['frame, 4 x 8 ft cut area', { bx: 2438, by: 1219, bh: 760, hh: 420, leg: true }], ['frame, 5 x 10 ft cut area, vacuum table', { bx: 3048, by: 1524, bh: 780, hh: 480, leg: true, vac: true }]];
const PRS = [['12 ton H-frame, bench', { t: 12, iw: 380, h: 1170, d: 300, col: 36 }], ['20 ton H-frame, floor', { t: 20, iw: 500, h: 1520, d: 400, col: 46 }], ['50 ton H-frame, workshop', { t: 50, iw: 760, h: 1980, d: 560, col: 70 }]];
const MBS = [['horizontal, 4 x 6 in capacity, portable', { cap: 152, w: 34, d: 14, h: 22, stand: false }], ['horizontal, 7 x 12 in capacity, stand and coolant', { cap: 300, w: 58, d: 24, h: 44, stand: true }]];
const CHP = [['abrasive cut-off, 14 in wheel', { R: 178, w: 26, d: 22, h: 24 }], ['abrasive cut-off, 16 in wheel, swivel vise', { R: 203, w: 30, d: 26, h: 27 }]];
const PLS = [['inverter, 40 amp, portable', { k: 'case' }], ['inverter, 60 amp, on two-wheel cart with air filter', { k: 'cart' }]];
const PGR = [['8 in wheels, cast pedestal', { R: 102, h: 44 }], ['10 in wheels, pedestal with water pot', { R: 127, h: 48, pot: true }]];
const DCL = [['1 HP, two-bag portable', { k: 'bag', w: 22, d: 30, h: 70 }], ['2 HP, canopy filter and bag', { k: 'canopy', w: 28, d: 32, h: 76 }], ['2 HP, cyclone with 35 gallon drum', { k: 'cy', R: 0, w: 28, d: 28, h: 78, dr: 215 }], ['3 HP, cyclone with 55 gallon drum', { k: 'cy', w: 32, d: 32, h: 90, dr: 290, big: true }]];
const BRK = [['box and pan, 36 in, bench stand', { bw: 36 }], ['box and pan, 48 in, floor stand', { bw: 48, floor: true }]];
const GEN = [['2000 watt inverter, enclosed', { k: 'inv', w: 17, d: 11, h: 17 }], ['4500 watt, open frame', { k: 'open', w: 26, d: 20, h: 22, ew: 0.8 }], ['7500 watt, wheels and handle', { k: 'open', w: 30, d: 24, h: 26, ew: 1, wheels: true }], ['12000 watt, wheels and handle', { k: 'open', w: 36, d: 27, h: 31, ew: 1.2, wheels: true, big: true }]];
const TLS = [['wet tile saw, 7 in blade, benchtop', { R: 89, w: 26, d: 20, h: 15 }], ['wet tile saw, 10 in blade, folding stand', { R: 127, w: 38, d: 30, h: 38, stand: true }]];

const MACH = [
  fam({ cat: 'tools/machine', title: 'Generic scroll saw',
    desc: (v) => `${m.round(v.th / IN)} in throat scroll saw: a base with a rear column, a lower and an upper arm in a C frame, a blade held between two clamps with a tension knob, a table with a blade slot${v.tilt ? ' that tilts on a scale' : ''}, a hold-down foot, a flexible dust blower tube and a speed dial on the front.`,
    vs: SCR.map(([l, p]) => [l, p.w, U(p.th + 190), p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, cx } = a, by = YB - 40 - v.th, tz = Z0 + 140; a.outline();
      a.box(X0 + 10, YF + 20, Z0, X1 - 10, YB - 20, Z0 + 56); a.rect(X0 + 10, YF + 20, X1 - 10, YB - 20);
      a.box(cx - 60, YB - 120, Z0 + 56, cx + 60, YB - 20, Z0 + 100 + v.h * IN * 0.82 - 100); a.box(cx - 54, by - 20, Z0 + 56, cx + 54, YB - 40, Z0 + 100);
      const zu = Z0 + v.h * IN - 70; a.box(cx - 54, by - 44, zu, cx + 54, YB - 40, zu + 56); a.box(cx - 54, by - 20, tz - 40, cx + 54, YB - 80, tz - 10);
      a.box(cx - 8, by - 36, zu - 30, cx + 8, by - 26, zu); a.box(cx - 8, by - 36, tz + 30, cx + 8, by - 26, zu - 30 + 0); a.box(cx - 1, by - 32, tz + 24, cx + 1, by - 30, zu - 30);
      a.box(cx - 80, by - 90, tz - 10, cx + 80, by + 100, tz); a.box(cx - 8, by - 5, tz - 10, cx + 8, by + 5, tz + 1); a.cyl(cx, by, tz, tz + 30, 6, 8); a.box(cx - 14, by - 16, tz + 30, cx + 14, by + 16, tz + 40);
      a.ell(cx, by - 66, zu + 28, 22, 22, 22, 10, 6); a.cyl(cx, by - 66, zu + 50, zu + 60, 8, 8); a.ycyl(YF + 20, YF + 12, cx - 40, Z0 + 28, 20, 14); a.ycyl(YF + 10, YF + 20, cx + 20, Z0 + 28, 6, 10);
      if (v.tilt) { a.box(cx - 90, by - 94, tz - 30, cx - 80, by - 84, tz - 10); a.box(cx + 80, by - 94, tz - 30, cx + 90, by - 84, tz - 10); a.line(cx - 80, by - 90, cx + 80, by - 90); }
      a.tube([[cx + 40, by - 10, zu + 24], [cx + 70, by + 30, zu + 60], [cx + 60, by + 120, zu + 30], [cx + 60, by + 150, tz + 40]], [4, 4, 4, 4], 6);
      a.log('Added the base, rear column, lower and upper arms, blade with clamps and tension knob, slotted table' + (v.tilt ? ' with the tilt scale' : '') + ', hold-down foot, dust blower tube and speed dial (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic jointer',
    desc: (v) => `${m.round(v.cut / IN)} in jointer: ${v.floor ? 'a steel cabinet base with a motor door and a belt cover' : 'a bench base with short legs'}, an infeed table and an outfeed table with a cutter head between them under a spring guard, a tall fence with a tilt lock, a depth handwheel at the front of the infeed table and a dust chute under the cutter head.`,
    vs: JNT.map(([l, p]) => [l, p.L, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, H } = a; a.outline(); const zt = Z0 + H * (v.floor ? 0.78 : 0.62), tw = v.cut + 40, y0 = YB - tw - 6, y1 = YB - 6, gap = 90;
      if (v.floor) { subCab(a, X0 + 30, W - 60, Z0, zt - Z0 - 70, { doors: 2, legs: 0, toe: 80, pull: 'knob' }); } else { for (const x of [X0 + 24, X1 - 24]) a.box(x - 24, y0 + 20, Z0, x + 24, y1 - 20, zt - 70); a.box(X0 + 20, y0 + 20, Z0 + 20, X1 - 20, y1 - 20, Z0 + 56); }
      a.box(X0 + 8, y0, zt - 70, X1 - 8, y1, zt - 40); a.box(X0 + 8, y0, zt - 40, cx - gap / 2, y1, zt); a.box(cx + gap / 2, y0, zt - 40, X1 - 8, y1, zt); a.rect(X0 + 8, y0, X1 - 8, y1);
      a.xcyl(cx - gap / 2, cx + gap / 2, (y0 + y1) / 2, zt - 8, 36, 20); for (let i = 0; i < 6; i++) a.box(cx - gap / 2 + 4, y0 + 10 + i * (tw - 20) / 6, zt - 18, cx + gap / 2 - 4, y0 + 14 + i * (tw - 20) / 6, zt + 6);
      a.box(cx - gap / 2 - 10, y0 + 20, zt, cx + gap / 2 + 10, y0 + 30 + 0, zt + 90); a.box(cx - gap / 2 - 10, y0 + 30, zt + 50, cx + gap / 2 + 10, y0 + tw * 0.55, zt + 90);
      const fz = zt + 120; a.box(X0 + 30, YB - 70, zt, X1 - 30, YB - 40, fz); a.line(X0 + 30, YB - 70, X1 - 30, YB - 70); a.box(cx - 30, YB - 40, zt + 10, cx + 30, YB - 20, zt + 40); a.cyl(cx, YB - 20, zt + 20, zt + 28, 6, 8);
      handwheel(a, X0 + 60, y0 - 12, zt - 24, 36, 'y'); a.box(X0 + 56, y0 - 4, zt - 46, X0 + 68, y0 + 6, zt - 24); a.cyl(cx, (y0 + y1) / 2, zt - 70 - 60, zt - 70, 40, 12); a.cyl(cx, (y0 + y1) / 2, zt - 70 - 100, zt - 70 - 60, 24, 12);
      a.box(X1 - 150, y0 - 30, zt - 150 + (v.floor ? 0 : 0), X1 - 90, y0 - 6, zt - 90 + (v.floor ? 0 : 0)); a.log('Added the ' + (v.floor ? 'cabinet' : 'bench') + ' base, infeed and outfeed tables, cutter head with spring guard, tall tilting fence, depth handwheel and dust chute (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic thickness planer',
    desc: (v) => `${m.round(v.cut / IN)} in thickness planer${v.stand ? ' on a steel stand with a lower shelf' : ''}: a housing with a cutter head cover, an infeed table and an outfeed table, a top-mounted height crank with a depth scale, a dust hood and port, a control box with a switch and a thickness scale.`,
    vs: PLN.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, cx, W, D, H } = a; a.outline(); const yc = YF * 0.45, bw = W - 60, hz = Z0 + (v.stand ? H * 0.38 : 70), ht = v.stand ? 360 : 260, ztop = hz + ht;
      if (v.stand) { for (const [x, y] of [[X0 + 50, YF + 70], [X1 - 50, YF + 70], [X0 + 50, YB - 70], [X1 - 50, YB - 70]]) a.box(x - 20, y - 20, Z0, x + 20, y + 20, hz); a.box(X0 + 30, YF + 50, Z0 + 150, X1 - 30, YB - 50, Z0 + 170); a.box(X0 + 20, YF + 40, hz - 16, X1 - 20, YB - 40, hz); }
      else a.box(X0 + 20, yc - 150, Z0, X1 - 20, yc + 150, hz + 16);
      a.box(X0 + 30, yc - 170, hz, X1 - 30, yc + 170, hz + 70); a.ell(cx, yc, ztop, bw / 2 - 4, 168, 52, 20, 7); a.box(X0 + 30, yc - 168, hz + 70, X1 - 30, yc + 168, ztop); a.box(cx - 180, yc - 170 - 4, hz + 100, cx + 180, yc - 168, hz + 190); a.line(cx - 180, yc - 168, cx + 180, yc - 168);
      for (let i = 0; i < 9; i++) a.box(cx - 170 + i * 42, yc - 172, hz + 150, cx - 168 + i * 42, yc - 168, hz + 190);
      for (const [y0, y1] of [[YF + 12, yc - 170], [yc + 170, YB - 12]]) { a.box(X0 + 40, y0, hz + 12, X1 - 40, y1, hz + 24); a.box(X0 + 40, y0 + (y1 - y0) * 0.5, hz + 4, X0 + 60, y0 + (y1 - y0) * 0.5 + 8, hz + 12); a.box(X1 - 60, y0 + (y1 - y0) * 0.5, hz + 4, X1 - 40, y0 + (y1 - y0) * 0.5 + 8, hz + 12); }
      handwheel(a, cx, yc - 80, ztop + 36, 54, 'x'); a.cyl(cx, yc - 80, ztop + 30, ztop + 40, 20, 12); a.box(cx + 60, yc - 160, ztop - 40, cx + 150, yc - 140, ztop + 10);
      a.cyl(cx, yc + 120, ztop + 20, ztop + 140, 50, 16); a.box(cx - 70, yc + 90, ztop - 20, cx + 70, yc + 168, ztop + 20); a.cyl(cx, yc + 120, ztop + 140, ztop + 190, 44, 16); a.rect(X0 + 30, yc - 170, X1 - 30, yc + 170); a.rect(X0 + 40, YF + 12, X1 - 40, yc - 170, 'EQUIP-DETAIL'); a.rect(X0 + 40, yc + 170, X1 - 40, YB - 12, 'EQUIP-DETAIL');
      a.log('Added the housing with cutter cover, infeed and outfeed tables, top height crank with scale, dust hood and port, control box and ' + (v.stand ? 'the steel stand with shelf' : 'the base') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic router table',
    desc: (v) => `${v.floor ? 'Floor-standing' : 'Benchtop'} router table: a laminated top with a mounting plate and a router bit rising through it, a split fence with a dust port and an adjusting slot, a miter slot, a safety switch box on the front, ${v.floor ? 'a steel cabinet below with two doors and a drawer, a router lift crank through the top' : 'four short legs with a lower rail, a router hanging below the plate'}.`,
    vs: RTB.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const zt = Z1 - 110, ty0 = YF + 10;
      if (v.floor) subCab(a, X0 + 25, W - 50, Z0, zt - Z0 - 4, { doors: 2, drawers: 1, drawerH: 150, toe: 80, pull: 'bar', inset: 0 }, ty0 + 50);
      else { for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 40], [X1 - 40, YB - 40]]) a.box(x - 22, y - 22, Z0, x + 22, y + 22, zt - 2); a.box(X0 + 40, YF + 40, Z0 + 40, X1 - 40, YF + 62, Z0 + 80); a.box(X0 + 40, YB - 62, Z0 + 40, X1 - 40, YB - 40, Z0 + 80); a.cyl(cx, (YF + YB) / 2, Z0 + 100, zt - 30, 50, 16); a.cyl(cx, (YF + YB) / 2, Z0 + 80, Z0 + 100, 40, 14); a.box(cx + 50, (YF + YB) / 2 - 12, Z0 + 150, cx + 120, (YF + YB) / 2 + 12, Z0 + 170); }
      a.box(X0 + 8, ty0, zt - 6, X1 - 8, YB - 10, zt + 24); a.rect(X0 + 8, ty0, X1 - 8, YB - 10);
      const ry = (YF + YB) / 2; a.box(cx - 60, ry - 60, zt + 24, cx + 60, ry + 60, zt + 27); a.cyl(cx, ry, zt + 27, zt + 60, 9, 10); a.cyl(cx, ry, zt + 27, zt + 34, 22, 14); a.circ(cx, ry, 60, 'EQUIP-DETAIL');
      a.box(X0 + 30, ry - 190, zt + 24, X0 + 70, ry - 160, zt + 26 + 2); a.box(X0 + 70, ry - 190, zt + 24, X1 - 70, ry - 164, zt + 26); for (const s of [-1, 1]) a.box(cx + s * 100 - 30, ry + 60, zt + 24, cx + s * 100 + 30, ry + 70, zt + 80);
      a.box(X0 + 30, ry + 100, zt + 24, X1 - 30, ry + 120, zt + 100); a.box(cx - 20, ry + 120, zt + 40, cx + 20, ry + 150, zt + 90); a.xcyl(cx - 22, cx + 22, ry + 168, zt + 64, 24, 14); a.line(cx - 30, ry + 120, cx + 30, ry + 120);
      a.box(X1 - 180, YF + 20, zt + 24, X1 - 110, YF + 70, zt + 70); a.cyl(X1 - 145, YF + 45, zt + 70, zt + 80, 10, 10); a.box(X0 + 18, YF + 20, zt + 24, X0 + 24, YB - 20, zt + 25); a.line(X0 + 120, YF + 20, X0 + 120, YB - 20);
      if (v.floor) { a.cyl(cx + 90, ry, zt + 24, zt + 40, 16, 10); ring(a, 'xz', cx + 90, ry - 4, zt + 60, 20, 3, 14, 5); }
      a.log('Added the top with mounting plate and bit, split fence with dust port, miter slot lines, safety switch and the ' + (v.floor ? 'cabinet with doors, drawer and lift crank' : 'legs, rail and the hanging router') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic belt and disc sander',
    desc: (v) => `Belt and disc sander${v.floor ? ' on a pedestal' : ' on a bench base'}: a ${m.round(v.bw / IN)} in wide sanding belt run round two rollers with a tracking knob and a platen, a ${m.round(v.disc * 2 / IN)} in sanding disc facing forward with its own table, a vented motor body and a dust port.`,
    vs: SDR.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, H } = a; a.outline(); const cy = YF / 2, zb0 = Z0 + (v.floor ? H * 0.42 : 70);
      if (v.floor) { a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 30); a.box(cx - 90, cy - 80, Z0 + 30, cx + 90, cy + 80, zb0); a.box(X0 + 30, YF + 30, zb0, X1 - 30, YB - 30, zb0 + 24); } else { a.box(X0 + 10, YF + 20, Z0, X1 - 10, YB - 20, zb0); a.box(X0 + 10, YF + 20, Z0, X1 - 10, YF + 24, zb0 - 10); a.rect(X0 + 10, YF + 20, X1 - 10, YB - 20); }
      const bz = zb0 + 24 + (v.floor ? 0 : 0), bwid = v.bw, bl = 330, bx0 = X0 + 40, bx1 = bx0 + bl; a.box(bx0 - 20, cy - 70, bz, bx1 + 20, cy + 70, bz + 20);
      for (const x of [bx0, bx1]) a.cyl(x, cy, bz + 20, bz + 20 + bwid, 40, 18); a.box(bx0, cy - 40 - 6, bz + 24, bx1, cy - 40, bz + 20 + bwid - 4); a.box(bx0, cy + 40, bz + 24, bx1, cy + 46, bz + 20 + bwid - 4); a.box(bx0 + 40, cy - 40, bz + 20 + 6, bx1 - 40, cy - 30, bz + 14 + bwid); a.cyl(bx1, cy, bz + 20 + bwid, bz + 40 + bwid, 14, 10); a.cyl(bx1, cy - 30, bz + 20 + bwid + 20, bz + 20 + bwid + 40, 12, 10);
      const dx = X1 - 40 - v.disc, dz = bz + 20 + m.max(v.disc, 60); a.box(dx - 30, cy - 60, bz, dx + 30, cy + 60, dz - v.disc - 10); a.ycyl(cy - 20, cy + 14, dx, dz, v.disc, 24); a.ycyl(cy - 24, cy - 20, dx, dz, v.disc * 0.97, 24); a.box(dx - v.disc, cy - 56, dz - 8, dx + v.disc, cy - 20, dz); a.cyl(dx, cy - 56, dz - 8, dz, 0.01, 3);
      a.xcyl(cx - 50, cx + 50, cy + 80, bz + 30, 40, 14); a.cyl(bx1 - 60, cy + 56, bz + 20, bz + 90, 24, 12); a.box(bx0 - 24, cy - 76, bz + 30, bx0 - 16, cy - 56, bz + 60);
      a.circ(dx, cy, v.disc, 'EQUIP-DETAIL'); a.line(bx0, cy, bx1, cy); a.log('Added the base, belt rollers with belt runs and platen, tracking knob, the disc with its table, motor body and dust port (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic CNC router',
    desc: (v) => `CNC gantry router, ${m.round(v.bx / IN)} x ${m.round(v.by / IN)} in cut area: ${v.leg ? 'a tube frame on legs with a shelf' : 'a flat base frame'}, a ${v.vac ? 'zoned vacuum' : 'spoil'} board, side rails, a moving gantry with a Z carriage, a spindle with dust shoe, motors, a drag chain and a controller box.`,
    vs: CNC.map(([l, p]) => [l, U(p.bx + 330), U(p.by + 330), U(p.bh + p.hh + 40), 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, cx } = a, yc = YF / 2, bx0 = cx - v.bx / 2, bx1 = cx + v.bx / 2, by0 = yc - v.by / 2, by1 = yc + v.by / 2; a.outline(); const zf = Z0 + v.bh - 60, zs = Z0 + v.bh;
      if (v.leg) { for (const [x, y] of [[bx0 - 60, by0 - 60], [bx1 + 60, by0 - 60], [bx0 - 60, by1 + 60], [bx1 + 60, by1 + 60]]) { a.box(x - 25, y - 25, Z0, x + 25, y + 25, zf); a.box(x - 35, y - 35, Z0, x + 35, y + 35, Z0 + 14); } a.box(bx0 - 60, by0 - 60, Z0 + 180, bx1 + 60, by0 - 40, Z0 + 220); a.box(bx0 - 60, by1 + 40, Z0 + 180, bx1 + 60, by1 + 60, Z0 + 220); a.box(bx0 - 60, by0 - 40, Z0 + 180, bx0 - 40, by1 + 40, Z0 + 220); a.box(bx1 + 40, by0 - 40, Z0 + 180, bx1 + 60, by1 + 40, Z0 + 220); }
      a.box(bx0 - 70, by0 - 70, zf, bx1 + 70, by0 - 40, zs - 30); a.box(bx0 - 70, by1 + 40, zf, bx1 + 70, by1 + 70, zs - 30); a.box(bx0 - 70, by0 - 40, zf, bx0 - 40, by1 + 40, zs - 30); a.box(bx1 + 40, by0 - 40, zf, bx1 + 70, by1 + 40, zs - 30);
      a.box(bx0 - 40, by0 - 40, zs - 30, bx1 + 40, by1 + 40, zs - 18); a.box(bx0, by0, zs - 18, bx1, by1, zs); a.rect(bx0 - 70, by0 - 70, bx1 + 70, by1 + 70); a.rect(bx0, by0, bx1, by1, 'EQUIP-DETAIL');
      if (v.vac) for (let i = 1; i < 6; i++) a.line(bx0 + i * v.bx / 6, by0, bx0 + i * v.bx / 6, by1); else for (let i = 1; i < 5; i++) a.line(bx0, by0 + i * v.by / 5, bx1, by0 + i * v.by / 5);
      for (const y of [by0 - 70, by1 + 40]) { a.box(bx0 - 70, y, zs - 18, bx1 + 70, y + 30, zs + 24); a.box(bx0 - 70, y + 6, zs + 24, bx1 + 70, y + 12, zs + 30); }
      const gx = cx - v.bx * 0.18, gh = v.hh; for (const y of [by0 - 70, by1 + 40]) { a.box(gx - 55, y - 10, zs - 20, gx + 55, y + 40, zs + 40); a.box(gx - 40, y, zs + 40, gx + 40, y + 30, zs + gh - 40); }
      a.box(gx - 40, by0 - 70, zs + gh - 110, gx + 40, by1 + 70, zs + gh - 40); a.box(gx - 30, by0 - 70 - 8, zs + gh - 100, gx + 30, by1 + 70 + 8, zs + gh - 96);
      const ky = yc - v.by * 0.1; a.box(gx - 46, ky - 60, zs + gh - 190, gx + 46, ky + 60, zs + gh - 30); a.box(gx - 30, ky - 40, zs + 90, gx + 30, ky + 40, zs + gh - 190); a.cyl(gx, ky - 10, zs + 24, zs + 94, 34, 18); a.cone(gx, ky - 10, zs + 24, zs + 40, 34, 20, 18); a.cone(gx, ky - 10, zs + 2, zs + 26, 44, 34, 16); a.cyl(gx, ky - 10, zs + 90, zs + 130, 44, 18); a.box(gx - 28, ky - 50, zs + 130, gx + 28, ky - 10, zs + gh - 192);
      a.cyl(gx, ky - 10, zs - 20, zs + 2, 5, 8); a.box(gx + 40, by1 + 70, zs + gh - 110, gx + 130, by1 + 130, zs + gh - 40); a.box(bx1 + 70, yc - 60, zs - 18, bx1 + 130, yc + 60, zs + 24);
      a.tube([[gx + 30, ky, zs + gh - 40], [gx + 30, ky + 120, zs + gh + 20], [gx + 30, by1 + 70, zs + gh - 30]], [20, 20, 20], 8);
      const cxb = bx1 + 40; a.box(cxb - 60, by1 + 70, Z0 + (v.leg ? 380 : zs + 30), cxb + 100, by1 + 160, Z0 + (v.leg ? 380 : zs + 30) + 200); a.cyl(cxb + 20, by1 + 160, Z0 + (v.leg ? 380 : zs + 30) + 150, Z0 + (v.leg ? 380 : zs + 30) + 180, 18, 12); a.cyl(cxb + 20, by1 + 160, Z0 + (v.leg ? 380 : zs + 30) + 180, Z0 + (v.leg ? 380 : zs + 30) + 190, 22, 12);
      a.log('Added the ' + (v.leg ? 'tube frame on legs with a shelf' : 'base frame') + ', ' + (v.vac ? 'vacuum-zoned ' : '') + 'bed, side rails, moving gantry and cross beam, Z carriage with spindle and dust shoe, motors, drag chain and the controller box with emergency stop (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic hydraulic shop press',
    desc: (v) => `${v.t} ton H-frame hydraulic shop press: two upright column pairs with a row of pin holes, a top crown carrying a hydraulic cylinder and ram with a press plate, an adjustable bed of two beams held on pins, a hand pump with a lever, a pressure gauge, return springs and a base with two feet.`,
    vs: PRS.map(([l, p]) => [l, U(p.iw + 2 * p.col * 2 + 200), U(p.d), U(p.h), 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, H } = a, yc = YF / 2, c = v.col, ix = v.iw / 2, d = v.d * 0.4; a.outline();
      for (const s of [-1, 1]) { const xc = cx + s * (ix + c); a.box(xc - c, yc - d, Z0, xc + c, yc - d * 0.6, Z1 - c * 1.1); a.box(xc - c, yc + d * 0.6, Z0, xc + c, yc + d, Z1 - c * 1.1); a.box(xc - c * 1.2, yc - d - 20, Z0, xc + c * 1.2, yc + d + 20, Z0 + 40); a.box(xc - c * 1.15, yc - d, Z0 + 40, xc + c * 1.15, yc + d, Z0 + 56); a.box(xc - c, yc - d * 0.6, Z0 + 56, xc + c, yc + d * 0.6, Z0 + 76);
        for (let i = 0; i < 9; i++) a.ycyl(yc - d - 1, yc - d * 0.6 + 1, xc, Z0 + 260 + i * ((H - 600) / 8), c * 0.3, 10); }
      a.box(cx - ix - c * 2, yc - d, Z1 - c * 2.2, cx + ix + c * 2, yc + d, Z1); a.box(cx - ix - c * 2, yc - d, Z1 - c * 2.2, cx + ix + c * 2, yc - d, Z1);
      const bz = Z0 + H * 0.34; for (const y of [yc - d * 0.9, yc + d * 0.55]) a.box(cx - ix - c, y, bz, cx + ix + c, y + d * 0.35, bz + c * 1.2); for (const s of [-1, 1]) for (const y of [yc - d - 4, yc + d + 4 - 6]) a.ycyl(y - 2, y + 8, cx + s * (ix + c), bz + c * 0.6, c * 0.28, 10);
      const rz = Z1 - c * 2.2; a.cyl(cx, yc, rz - 260, rz, c * 1.5, 18); a.cyl(cx, yc, rz - 270, rz - 260, c * 1.1, 16); a.cyl(cx, yc, rz - 430, rz - 270, c * 0.55, 14); a.box(cx - c * 1.2, yc - d * 0.5, rz - 460, cx + c * 1.2, yc + d * 0.5, rz - 430); a.box(cx - c * 0.9, yc - d * 0.5, rz - 495, cx + c * 0.9, yc + d * 0.5, rz - 460);
      for (const s of [-1, 1]) a.tube([[cx + s * c * 1.4, yc - d * 0.55, rz - 20], [cx + s * c * 1.2, yc - d * 0.55, rz - 440]], [3, 3], 6);
      gauge(a, cx + c * 2.6, yc - d - 4, rz - 120, 30); a.cyl(cx - ix - c * 3, yc, Z0 + H * 0.45, Z0 + H * 0.45 + 130, 36, 14); a.cyl(cx - ix - c * 3, yc, Z0 + H * 0.45 + 130, Z0 + H * 0.45 + 160, 24, 12);
      a.tube([[cx - ix - c * 3, yc, Z0 + H * 0.45 + 160], [cx - ix - c * 3 - 200, yc, Z0 + H * 0.45 + 200], [cx - ix - c * 3 - 460, yc, Z0 + H * 0.45 + 300]].map(([x, y, z]) => [Math.max(x, X0 + 20), y, z]), [8, 8, 8], 6);
      a.tube([[cx - ix - c * 3, yc, Z0 + H * 0.45 + 120], [cx - ix - c * 2.3, yc, rz - 150]], [6, 6], 6); a.cyl(cx - ix - c * 3, yc, Z0, Z0 + H * 0.45, 70, 16);
      a.circ(cx, yc, c * 1.5, 'EQUIP-DETAIL'); a.log('Added the two upright column pairs with pin holes, top crown, cylinder with ram and press plate, pinned bed beams, return springs, gauge, hand pump with lever and the feet (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic horizontal metal bandsaw',
    desc: (v) => `Horizontal metal-cutting bandsaw, ${m.round(v.cap / IN)} in capacity: ${v.stand ? 'a steel stand with a coolant tank and pump, ' : ''}a base with a swivel vise and a screw handle, a hinged saw head with a wheel cover, blade guide arms, a gearbox and motor, a lift handle and a hydraulic feed damper.`,
    vs: MBS.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, H } = a, yc = YF / 2; a.outline(); const bz = Z0 + (v.stand ? H * 0.52 : 70);
      if (v.stand) { for (const [x, y] of [[X0 + 60, YF + 50], [X1 - 60, YF + 50], [X0 + 60, YB - 50], [X1 - 60, YB - 50]]) a.box(x - 20, y - 20, Z0, x + 20, y + 20, bz); a.box(X0 + 40, YF + 30, Z0 + 140, X1 - 40, YB - 30, Z0 + 160); a.box(cx - 220, yc - 120, Z0 + 160, cx - 40, yc + 120, Z0 + 330); a.cyl(cx + 100, yc, Z0 + 160, Z0 + 260, 40, 14); a.tube([[cx + 100, yc, Z0 + 260], [cx + 100, yc, bz]], [8, 8], 6); }
      a.box(X0 + 20, YF + 30, bz - 10, X1 - 20, YB - 30, bz + 70); a.rect(X0 + 20, YF + 30, X1 - 20, YB - 30);
      const vx0 = cx - 40 - v.cap * 0.55, vx1 = cx + 40 + v.cap * 0.55 - 60; a.box(vx0 - 20, yc - 80, bz + 70, vx0 + 20, yc + 80, bz + 70 + v.cap * 0.55); a.box(vx1 - 20, yc - 80, bz + 70, vx1 + 20, yc + 80, bz + 70 + v.cap * 0.55); a.cyl(vx0 + 20, yc, bz + 70 + v.cap * 0.25, bz + 70 + v.cap * 0.25 + 1, 1, 3); a.xcyl(vx1 + 20, vx1 + 200, yc, bz + 70 + v.cap * 0.25, 9, 8); a.ell(vx1 + 204, yc, bz + 70 + v.cap * 0.25, 20, 16, 16, 8, 6); a.tube([[vx1 + 100, yc, bz + 70 + v.cap * 0.25 - 70], [vx1 + 160, yc, bz + 70 + v.cap * 0.25 - 70]], [4, 4], 6);
      const hz = bz + 70 + v.cap * 0.55 + 30, hr = H * 0.14 + 40; a.box(X0 + 24, yc - 70, hz - 40, X1 - 24, yc + 70, hz + 120); a.ycyl(yc - 70, yc - 150, X0 + 60 + hr, hz + 40, hr, 22); a.ycyl(yc - 150, yc - 156, X0 + 60 + hr, hz + 40, hr * 0.7, 18); a.ycyl(yc - 70, yc - 150, X1 - 60 - hr, hz + 40, hr, 22);
      a.box(X0 + 60 + hr, yc - 150, hz - 6, X1 - 60 - hr, yc - 70, hz + 80); for (const x of [vx0 + 40, vx1 - 40]) { a.box(x - 24, yc - 20, bz + 70 + v.cap * 0.55 - 10, x + 24, yc + 20, hz - 40); a.box(x - 6, yc - 30, bz + 70 + v.cap * 0.55 - v.cap * 0.1, x + 6, yc + 30, hz - 40); }
      a.box(X1 - 200, yc + 70, hz - 40, X1 - 24, yc + 170, hz + 70); a.cyl(X1 - 112, yc + 170, hz - 20, hz + 50, 34, 14); a.tube([[cx, yc - 150, hz + 60], [cx + 60, yc - 190, hz + 120], [cx + 140, yc - 190, hz + 120], [cx + 150, yc - 160, hz + 80]], [8, 8, 8, 8], 8);
      a.cyl(X0 + 60, yc + 70, bz + 70, hz - 20, 14, 10); a.cyl(X0 + 60, yc + 70, hz - 40, hz + 100, 10, 8); a.ell(X0 + 60, yc + 70, hz + 105, 20, 20, 12, 10, 6);
      a.log('Added the base' + (v.stand ? ', stand with coolant tank and pump' : '') + ', swivel vise with screw handle, hinged saw head with wheel cover, blade guides, gearbox and motor, lift handle and the feed damper (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic abrasive cut-off saw',
    desc: (v) => `${m.round(v.R * 2 / IN)} in abrasive cut-off saw: a steel base with a fence and a screw vise with a handle, a rear pivot arm carrying the motor head, a thin abrasive wheel under a half guard, a D handle with a trigger, a spark deflector and a stop bolt.`,
    vs: CHP.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, cx, W, D } = a, R = v.R; a.outline(); const wz = Z0 + 40 + R * 0.88, wy = YF + D * 0.55;
      a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 40); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20); a.box(X0 + 20, wy + 60, Z0 + 40, X1 - 20, wy + 90, Z0 + 40 + 80);
      const vx = cx - 80; a.box(vx - 40, wy - 130, Z0 + 40, vx + 80, wy - 60, Z0 + 40 + 60); a.box(vx - 40, wy - 70, Z0 + 100, vx - 20, wy - 10, Z0 + 140); a.cyl(vx + 20, wy - 130, Z0 + 70, Z0 + 76, 30, 14); a.xcyl(vx - 80, vx + 80, wy - 180, Z0 + 76, 6, 8); a.ell(vx - 82, wy - 180, Z0 + 76, 10, 10, 10, 8, 5); a.ell(vx + 82, wy - 180, Z0 + 76, 10, 10, 10, 8, 5); a.cyl(vx + 20, wy - 180, Z0 + 40, Z0 + 76, 5, 8);
      a.xcyl(cx - 2, cx + 2, wy, wz, R, 40); a.xcyl(cx - 12, cx + 12, wy, wz, R * 0.28, 18); a.xcyl(cx - 4, cx + 4, wy, wz, 8, 10);
      for (let k = 0; k < 14; k++) { const t = PI * (0.05 + 1.0 * k / 14), t2 = PI * (0.05 + 1.0 * (k + 1) / 14); a.prism([[cx - 16, wy + m.cos(t) * (R + 12)], [cx + 16, wy + m.cos(t) * (R + 12)], [cx + 16, wy + m.cos(t2) * (R + 12)], [cx - 16, wy + m.cos(t2) * (R + 12)]], wz + m.sin(t) * (R + 12) - 2.5, wz + m.sin(t2) * (R + 12) + 2.5); }
      a.box(cx - 16, wy - R - 8, wz + R * 0.1, cx + 16, wy - R, wz + R * 0.9); a.box(cx + 14, wy - R, wz + R * 0.1, cx + 40, wy - R + 20, wz + R * 0.8);
      a.xcyl(cx + 24, cx + 150, wy, wz, R * 0.34, 18); a.xcyl(cx + 150, cx + 190, wy, wz, R * 0.3, 18); for (let i = 0; i < 4; i++) a.box(cx + 50 + i * 20, wy - R * 0.36, wz - R * 0.1, cx + 54 + i * 20, wy - R * 0.32, wz + R * 0.2);
      a.tube([[cx + 70, wy - R * 0.3, wz + R * 0.2], [cx + 70, wy - R - 50, wz + R * 0.5], [cx + 70, wy - R - 90, wz + R * 0.1], [cx + 70, wy - R - 60, wz - R * 0.3]], [11, 11, 11, 11], 10);
      a.tube([[cx + 40, wy + R * 0.2, wz], [cx + 40, wy + R * 0.9, wz - R * 0.2], [cx + 40, wy + 150, Z0 + 150]], [18, 18, 20], 10); a.box(cx + 20, wy + 150, Z0 + 40, cx + 60, wy + 200, Z0 + 150); a.ycyl(wy + 150, wy + 210, cx + 40, Z0 + 150, 12, 10);
      a.rect(cx - 16, wy - R, cx + 190, wy + R * 0.4, 'EQUIP-DETAIL'); a.log('Added the base with fence and screw vise, rear pivot arm, motor head, abrasive wheel with half guard, D handle with trigger, spark deflector and stop bolt (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic plasma cutter',
    desc: (v) => v.k === 'case' ? 'Portable inverter plasma cutter: a rectangular case with a carry handle, side vents, a front panel with a current dial, two indicator lights, an air pressure gauge and the torch and ground sockets, a torch lead with a handled torch and a clamp lead with a ground clamp.' : 'Plasma cutter on a two-wheel cart: the power case on a tube cart with a rear handle, front panel with dial, gauge and sockets, an air filter and regulator bowl on a bracket, a torch lead with a handled torch, a ground clamp lead and a tool tray.',
    vs: [[PLS[0][0], 12, 20, 14, 0, PLS[0][1]], [PLS[1][0], 20, 34, 38, 0, PLS[1][1]]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a, yc = YF / 2; a.outline();
      const caseP = (x0, x1, y0, y1, z0, z1) => { a.box(x0, y0, z0, x1, y1, z1); a.rect(x0, y0, x1, y1); a.box(x0 + 8, y0 - 4, z0 + (z1 - z0) * 0.35, x1 - 8, y0, z1 - 14); for (let i = 0; i < 5; i++) a.box(x0 - 3, y0 + 20 + i * 18, z0 + 30, x0, y0 + 26 + i * 18, z1 - 40); a.ycyl(y0 - 12, y0 - 4, x0 + 50, z1 - 50, 24, 16); for (const dx of [100, 130]) a.ycyl(y0 - 8, y0 - 4, x0 + dx, z1 - 40, 6, 10); gauge(a, x1 - 60, y0 - 4, z1 - 52, 22); for (const dx of [50, 110]) a.ycyl(y0 - 14, y0 - 4, x0 + dx, z0 + 54, 14, 12); };
      if (v.k === 'case') {
        caseP(X0 + 20, X1 - 20, YF + 80, YB - 70, Z0, Z0 + 270); a.tube([[X0 + 50, yc + 40, Z0 + 270], [X0 + 50, yc + 40, Z0 + 320], [X1 - 50, yc + 40, Z0 + 320], [X1 - 50, yc + 40, Z0 + 270]], [9, 9, 9, 9], 8);
        a.tube([[X0 + 70, YF + 76, Z0 + 54], [X0 + 20, YF + 40, Z0 + 20], [cx - 20, YF + 22, Z0 + 14]], [8, 8, 8], 6); a.tube([[cx - 20, YF + 22, Z0 + 14], [cx + 20, YF + 18, Z0 + 12]], [10, 22], 10); a.tube([[cx + 20, YF + 18, Z0 + 12], [cx + 60, YF + 14, Z0 + 10]], [22, 12], 10); a.cone(cx + 60, YF + 14, Z0 + 10, Z0 + 12, 12, 12, 8); a.xcyl(cx + 60, cx + 90, YF + 14, Z0 + 14, 8, 8); a.xcyl(cx + 90, cx + 110, YF + 14, Z0 + 14, 5, 8);
        a.tube([[X0 + 130, YF + 76, Z0 + 54], [X0 + 150, YF + 50, Z0 + 20], [X1 - 120, YF + 40, Z0 + 10]], [8, 8, 8], 6); a.box(X1 - 120, YF + 26, Z0, X1 - 70, YF + 56, Z0 + 12); a.box(X1 - 70, YF + 26, Z0 + 4, X1 - 40, YF + 56, Z0 + 10); return a.log('Added the case with handle, vents, front panel with dial, lights, gauge and sockets, the torch lead with handled torch and the ground clamp lead (plan and 3D).');
      }
      a.box(X0 + 10, YB - 700, Z0 + 270, X1 - 10, YB - 90, Z0 + 270 + 56); a.rect(X0 + 10, YB - 700, X1 - 10, YB - 90); caseP(X0 + 40, X1 - 40, YB - 700, YB - 200, Z0 + 326, Z0 + 640 + 0); a.box(X0 + 40, YB - 200, Z0 + 326, X1 - 40, YB - 110, Z0 + 640);
      for (const x of [X0 + 4, X1 - 4]) a.xcyl(x - 22, x + 22, YB - 110, Z0 + 110, 110, 18); a.xcyl(cx - 220, cx + 220, YB - 110, Z0 + 110, 12, 8); a.tube([[X0 + 60, YB - 110, Z0 + 640], [X0 + 60, YB - 90, Z0 + 740], [X1 - 60, YB - 90, Z0 + 740], [X1 - 60, YB - 110, Z0 + 640]], [10, 10, 10, 10], 8);
      a.cyl(cx, YF + 100, Z0, Z0 + 12, 14, 8); a.cyl(cx, YF + 100, Z0 + 12, Z0 + 270, 10, 8); a.box(cx - 60, YF + 40, Z0 + 270, cx + 60, YF + 200, Z0 + 276);
      a.box(X1 - 230, YB - 60, Z0 + 700, X1 - 140, YB - 20, Z0 + 740); a.cyl(X1 - 120, YB - 40, Z0 + 700, Z0 + 770, 30, 16); a.cyl(X1 - 120, YB - 40, Z0 + 770, Z0 + 800, 40, 16); a.cyl(X1 - 120, YB - 40, Z0 + 800, Z0 + 810, 16, 12); gauge(a, X1 - 120, YB - 10, Z0 + 740, 20);
      a.tube([[X0 + 120, YB - 706, Z0 + 380], [X0 + 100, YB - 780, Z0 + 330], [X0 + 130, YB - 850, Z0 + 290]], [8, 8, 8], 6); a.box(X0 + 112, YB - 870, Z0 + 284, X0 + 150, YB - 840, Z0 + 296);
      a.log('Added the cart with handle and wheels, the power case with front panel, dial, gauge and sockets, the air filter and regulator bowl, the torch lead and ground clamp lead and the tool tray (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic pedestal grinder',
    desc: (v) => `${m.round(v.R * 2 / IN)} in pedestal grinder: a cast column on a bolted base plate, a motor barrel with end bells, two ${m.round(v.R * 2 / IN)} in wheels under half guards, two tool rests with spark guards, clear eye shields, a rocker switch${v.pot ? ' and a water pot on a side bracket' : ''}.`,
    vs: PGR.map(([l, p]) => [l, U(p.R * 2 + 260 + (p.pot ? 160 : 0)), U(p.R * 2 + 140), p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, cy = YF / 2, R = v.R; a.outline(); const zc = Z1 - R - 70;
      a.box(cx - 150, cy - 150 > YF + 8 ? cy - 150 : YF + 8, Z0, cx + 150, m.min(cy + 150, YB - 8), Z0 + 26); for (const [dx, dy] of [[-120, -120], [120, -120], [-120, 120], [120, 120]]) { if (cy + dy > YF + 20 && cy + dy < YB - 20) a.cyl(cx + dx, cy + dy, Z0 + 26, Z0 + 38, 12, 6); }
      a.cone(cx, cy, Z0 + 26, zc - 150, 90, 56, 22); a.cyl(cx, cy, zc - 150, zc - 100, 80, 20); a.box(cx - 120, cy - R * 0.6, zc - 100, cx + 120, cy + R * 0.6, zc - 80);
      a.xcyl(cx - 160, cx + 160, cy, zc, R * 0.52, 22); a.box(cx - 40, cy - R * 0.62, zc - R * 0.42, cx + 40, cy - R * 0.5, zc - R * 0.15);
      for (const s of [-1, 1]) { const x = cx + s * 200; a.xcyl(cx + s * 160, x + s * 18, cy, zc, R * 0.42, 18); const x0 = x + s * 18, x1 = x0 + s * 24; a.xcyl(m.min(x0, x1), m.max(x0, x1), cy, zc, R, 36); a.xcyl(m.min(x0, x1) - 1, m.max(x0, x1) + 1, cy, zc, R * 0.25, 14);
        const g0 = x0 - s * 14, g1 = x1 + s * 22; hood(a, m.min(g0, g1), m.max(g0, g1), cy, zc, R + 12, 0.1, 1.1, 14); a.box(m.min(x0, x1) - 10, cy - R * 0.3, zc - R * 1.05, m.max(x0, x1) + 10, cy + R * 0.3, zc - R * 0.55); a.box(m.min(g0, g1), cy - R - 14, zc + R * 0.05, m.max(g0, g1), cy - R - 6, zc + R * 0.9); a.box(m.min(x0, x1), cy - R - 30, zc - 20, m.max(x0, x1) + s * 60, cy - R + 20, zc - 10); }
      if (v.pot) { const px = X1 - 60; a.box(cx + 250, cy - 12, zc - 120, px + 20, cy + 12, zc - 100); a.cyl(px, cy, zc - 100, zc + 10, 60, 18); a.cyl(px, cy, zc + 10, zc + 24, 62, 18); a.cyl(px, cy, zc + 24, zc + 40, 18, 10); }
      a.box(cx - 40, cy - R * 0.5 - 4, zc - 180, cx + 40, cy - R * 0.5, zc - 150); a.line(cx - 160, cy, cx + 160, cy); a.log('Added the base plate with bolts, cast column, motor barrel, two wheels with half guards, tool rests, eye shields and switch' + (v.pot ? ', and the water pot' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic workshop dust collector',
    desc: (v) => v.k === 'bag' ? 'Portable two-bag dust collector: a caster base with a motor and a blower housing, a round inlet port on the front, an upper cloth filter bag on a ring and a lower clear collection bag clamped below.' : v.k === 'canopy' ? 'Dust collector with a canopy filter: a caster base, motor and blower housing with an inlet port, a pleated canopy filter cylinder on top and a lower collection bag on a clamp ring.' : `Cyclone dust collector with a ${v.big ? '55' : '35'} gallon drum: a tripod base with casters, a motor and blower on top, a cone-shaped cyclone with a tangent inlet, an outlet pipe to the blower, a pleated filter canister and a ${v.big ? '55' : '35'} gallon collection drum with a clamp lid and side handles.`,
    vs: DCL.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, H } = a, cy = YF / 2; a.outline();
      const star = (r, z) => { for (let i = 0; i < 5; i++) { const t = i * 2 * PI / 5 + PI / 2, x = cx + m.cos(t) * r, y = cy + m.sin(t) * r; a.tube([[cx, cy, z + 40], [x, y, z + 10]], [12, 9], 8); a.ell(x, y, Z0 + 20, 14, 14, 20, 8, 6); } };
      const R = m.min(W, YB - YF) / 2 - 24; star(R, Z0 + 30);
      if (v.k === 'cy') {
        const dr = v.dr; a.cyl(cx, cy, Z0 + 60, Z0 + 60 + dr * 2.5, dr, 28); a.cyl(cx, cy, Z0 + 60 + dr * 2.5, Z0 + 76 + dr * 2.5, dr + 14, 28); for (const s of [-1, 1]) { a.tube([[cx + s * dr, cy, Z0 + 60 + dr * 1.7], [cx + s * (dr + 40), cy, Z0 + 60 + dr * 1.7]], [14, 14], 8); }
        const zc = Z0 + 76 + dr * 2.5; a.cone(cx, cy, zc, zc + dr * 1.8, dr * 0.2, dr * 1.1, 26); a.cyl(cx, cy, zc + dr * 1.8, zc + dr * 2.4, dr * 1.1, 26); a.box(cx + dr * 1.1 - 10, cy - dr * 0.5, zc + dr * 1.8, cx + dr * 1.1 + 70, cy + dr * 0.5, zc + dr * 2.4); a.cyl(cx + dr * 1.1 + 40, cy + dr * 0.5, zc + dr * 1.2, zc + dr * 1.8, 40, 14);
        const zt = zc + dr * 2.4; a.cyl(cx, cy, zt, zt + 80, dr * 0.35, 16); a.xcyl(cx, cx + dr * 0.5, cy, zt + 70, dr * 0.35, 16); a.cyl(cx - dr * 0.1, cy, zt + 80, zt + 200, dr * 0.5, 20); a.ycyl(cy - dr * 0.5, cy + dr * 0.5, cx - dr * 0.2, zt + 150, dr * 0.55, 20);
        a.cyl(cx, cy, zt + 80, zt + 90, dr * 0.2, 8); const zf = zt + 60; a.cyl(cx + dr * 0.55, cy, zf + 80, Z1 - 40, dr * 0.6, 22); for (let i = 0; i < 12; i++) { const t = i * PI / 6; a.box(cx + dr * 0.55 + m.cos(t) * dr * 0.6 - 3, cy + m.sin(t) * dr * 0.6 - 3, zf + 120, cx + dr * 0.55 + m.cos(t) * dr * 0.62 + 3, cy + m.sin(t) * dr * 0.62 + 3, Z1 - 70); }
        for (const s of [-1, 1]) a.box(cx + s * (dr + 14), cy - 30, Z0 + 60 + dr * 1.2, cx + s * (dr + 40), cy + 30, Z0 + 60 + dr * 1.5); a.circ(cx, cy, dr, 'EQUIP'); return a.log('Added the tripod caster base, the collection drum with clamp lid and handles, cyclone cone with tangent inlet, outlet pipe, motor and blower and the pleated filter canister (plan and 3D).');
      }
      const mz = Z0 + 140; a.cyl(cx, cy, Z0 + 70, mz, 46, 18); a.ycyl(cy - 150, cy + 150, cx, mz + 170, 150, 24); a.xcyl(cx - 140, cx + 140, cy - 160, mz + 170, 70, 18); a.ycyl(cy - 160, cy - 120, cx, mz + 170, 70, 18); a.box(cx + 30, cy + 140, mz + 100, cx + 150, cy + 180, mz + 260);
      for (let i = 0; i < 6; i++) a.xcyl(cx - 100 + i * 40, cx - 96 + i * 40, cy, mz + 20, 52, 12);
      const zb = mz + 340; if (v.k === 'bag') { a.cyl(cx, cy, zb, Z1 - 80, 190, 24); a.ell(cx, cy, Z1 - 80, 190, 190, 70, 22, 8); a.cyl(cx, cy, zb - 20, zb, 196, 24); a.cyl(cx, cy, Z0 + 70 + 0, Z0 + 100, 190, 24); a.cyl(cx, cy, Z0 + 100, mz - 20, 180, 24); }
      else { a.cyl(cx, cy, zb, Z1 - 60, 200, 28); for (let i = 0; i < 16; i++) { const t = i * PI / 8; a.box(cx + m.cos(t) * 200 - 3, cy + m.sin(t) * 200 - 3, zb + 30, cx + m.cos(t) * 204 + 3, cy + m.sin(t) * 204 + 3, Z1 - 90); } a.cone(cx, cy, Z1 - 60, Z1 - 20, 200, 40, 28); a.cyl(cx, cy, zb - 14, zb, 206, 28); a.cyl(cx, cy, Z0 + 70, Z0 + 90, 190, 24); a.cyl(cx, cy, Z0 + 90, mz - 20, 170, 24); }
      a.circ(cx, cy, 190, 'EQUIP'); a.log('Added the caster base, motor and blower housing with inlet port, ' + (v.k === 'bag' ? 'upper filter bag on its ring and lower bag' : 'pleated canopy filter and the lower collection bag') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic sheet metal brake',
    desc: (v) => `${v.bw} in box and pan sheet metal brake on a ${v.floor ? 'floor stand with two legs and a cross brace' : 'bench stand'}: a heavy base beam, a clamping bar made of separate finger segments with two clamp handles, a hinged bending leaf with a lift handle and two counterweights, and stop pins at the back.`,
    vs: BRK.map(([l, p]) => [l, p.bw + 8, 22, p.floor ? 40 : 30, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, H } = a; a.outline(); const bw = v.bw * IN, bx0 = cx - bw / 2, bx1 = cx + bw / 2, bz = Z0 + (v.floor ? H * 0.62 : 120);
      for (const s of [-1, 1]) { const x = cx + s * (bw / 2 - 40); a.box(x - 30, YF + 120, Z0, x + 30, YB - 120, Z0 + 14); a.box(x - 22, YF + 190, Z0 + 14, x + 22, YB - 190, bz - 40); if (v.floor) { a.tube([[x, YF + 200, Z0 + 14], [x, YB - 200, bz - 40]], [0.1, 0.1], 3); } }
      if (v.floor) a.box(cx - bw / 2 + 60, YF + 200, Z0 + 200, cx + bw / 2 - 60, YF + 218, Z0 + 225);
      a.box(bx0 - 20, YF + 140, bz - 40, bx1 + 20, YB - 140, bz + 40); a.rect(bx0 - 20, YF + 140, bx1 + 20, YB - 140);
      const nf = m.round(v.bw / 4); const fw = bw / nf; for (let i = 0; i < nf; i++) { a.box(bx0 + i * fw + 1.5, YF + 170, bz + 40, bx0 + (i + 1) * fw - 1.5, YF + 270, bz + 100); a.line(bx0 + i * fw, YF + 170, bx0 + i * fw, YF + 270, 'EQUIP-DETAIL'); }
      a.box(bx0 - 30, YF + 160, bz + 100, bx1 + 30, YF + 290, bz + 130);
      for (const s of [-1, 1]) { const x = cx + s * bw * 0.38; a.tube([[x, YF + 290, bz + 130], [x, YF + 330, bz + 240], [x + s * 10, YF + 330, bz + 340]], [10, 10, 10], 8); a.ell(x + s * 10, YF + 330, bz + 346, 14, 14, 14, 8, 5); }
      a.box(bx0 - 20, YF + 100, bz - 20, bx1 + 20, YF + 140, bz + 28); a.tube([[bx0 - 10, YF + 100, bz - 6], [bx0 - 10, YF + 20, bz - 40]], [10, 12], 8); a.tube([[bx1 + 10, YF + 100, bz - 6], [bx1 + 10, YF + 20, bz - 40]], [10, 12], 8); a.tube([[bx0 - 10, YF + 24, bz - 40], [bx1 + 10, YF + 24, bz - 40]], [11, 11], 8);
      for (const x of [bx0 - 20, bx1 + 20]) { a.cyl(x, YF + 60, bz - 120, bz - 40, 16, 12); a.tube([[x, YF + 100, bz - 6], [x, YF + 60, bz - 40]], [8, 8], 6); } for (const s of [-1, 1]) a.box(cx + s * bw * 0.3 - 8, YB - 160, bz + 40, cx + s * bw * 0.3 + 8, YB - 140, bz + 110);
      a.log('Added the base beam and legs, finger-segment clamping bar with two handles, hinged bending leaf with lift handle and counterweights and the back stop pins (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic portable generator',
    desc: (v) => v.k === 'inv' ? 'Enclosed inverter generator: a two-part plastic case with a carry handle, side vent louvres, a fuel cap, a front panel with two outlets, a USB port, a mode switch and an indicator light, and an exhaust outlet at the rear.' : `Open-frame portable generator, ${v.big ? 'large' : 'mid-size'}: a round tube frame, an engine with finned cylinder head, an alternator drum, a fuel tank on top with a cap, a muffler, a front control panel with outlets, breakers and a meter, a recoil starter handle${v.wheels ? ', two wheels and a fold-up handle' : ' and rubber feet'}.`,
    vs: GEN.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, cy = YF / 2; a.outline();
      if (v.k === 'inv') { a.box(X0 + 10, YF + 20, Z0 + 14, X1 - 10, YB - 20, Z1 - 60); a.box(X0 + 30, YF + 40, Z1 - 60, X1 - 30, YB - 40, Z1 - 30); a.tube([[X0 + 80, cy, Z1 - 30], [X0 + 80, cy, Z1 - 6], [X1 - 80, cy, Z1 - 6], [X1 - 80, cy, Z1 - 30]], [10, 10, 10, 10], 8); for (const x of [X0 + 24, X1 - 24]) a.box(x - 20, YF + 30, Z0, x + 20, YB - 30, Z0 + 14);
        a.box(X0 + 30, YF + 14, Z0 + 80, X1 - 30, YF + 20, Z1 - 100); for (const dx of [-90, -40]) a.ycyl(YF + 8, YF + 14, cx + dx, Z0 + 180, 14, 12); a.box(cx + 10, YF + 8, Z0 + 140, cx + 40, YF + 14, Z0 + 150); a.ycyl(YF + 8, YF + 14, cx + 80, Z0 + 150, 12, 10); a.ycyl(YF + 8, YF + 14, cx + 80, Z0 + 200, 4, 8);
        for (let i = 0; i < 8; i++) a.box(X0 + 4, YF + 60 + i * 22, Z0 + 60, X0 + 10, YF + 66 + i * 22, Z0 + 260); a.cyl(X1 - 50, YB - 60, Z1 - 60, Z1 - 40, 22, 12); a.xcyl(X1 - 6, X1 + 0, cy + 10, Z0 + 100, 24, 12); a.rect(X0 + 10, YF + 20, X1 - 10, YB - 20, 'EQUIP-DETAIL');
        return a.log('Added the two-part case with handle, side vents, fuel cap, front panel with outlets, USB port, mode switch and light, exhaust and the feet (plan and 3D).'); }
      const fh = 40, zf = Z0 + (v.wheels ? 120 : 50), zt = Z1 - 10; for (const [x, y] of [[X0 + 20, YF + 20], [X1 - 20, YF + 20], [X0 + 20, YB - 20], [X1 - 20, YB - 20]]) a.tube([[x, y, zf], [x, y, zt - 40]], [14, 14], 8);
      for (const z of [zf, zt - 40]) { a.tube([[X0 + 20, YF + 20, z], [X1 - 20, YF + 20, z], [X1 - 20, YB - 20, z], [X0 + 20, YB - 20, z], [X0 + 20, YF + 20, z]], [14, 14, 14, 14, 14], 8); }
      a.tube([[X0 + 20, YF + 20, zt - 40], [X0 + 20, YF + 20, zt], [X1 - 20, YF + 20, zt], [X1 - 20, YF + 20, zt - 40]], [14, 14, 14, 14], 8); a.tube([[X0 + 20, YB - 20, zt - 40], [X0 + 20, YB - 20, zt], [X1 - 20, YB - 20, zt], [X1 - 20, YB - 20, zt - 40]], [14, 14, 14, 14], 8);
      if (v.wheels) for (const y of [YB - 30]) { a.xcyl(X0 + 4, X0 + 36, y, Z0 + 100, 100, 20); a.xcyl(X1 - 36, X1 - 4, y, Z0 + 100, 100, 20); a.xcyl(X0, X1, y, Z0 + 100, 8, 8); a.tube([[X0 + 20, YF + 20, zf], [X0 + 20, YF - 0 + 20, Z0 + 14]], [14, 14], 8); a.tube([[X1 - 20, YF + 20, zf], [X1 - 20, YF + 20, Z0 + 14]], [14, 14], 8); a.tube([[X0 + 30, YB - 20, zt - 40], [X0 + 30, YB - 120, zt + 0], [X1 - 30, YB - 120, zt + 0], [X1 - 30, YB - 20, zt - 40]], [10, 10, 10, 10], 8); }
      else for (const [x, y] of [[X0 + 20, YF + 20], [X1 - 20, YF + 20], [X0 + 20, YB - 20], [X1 - 20, YB - 20]]) a.cyl(x, y, Z0, zf, 24, 10);
      const ew = v.ew, ex = X0 + 120, ez = zf + 90; a.xcyl(ex, ex + 260 * ew, cy + 20, ez + 60, 120 * ew + 40, 20); a.box(ex + 270 * ew, cy - 80 * ew, ez, ex + 450 * ew, cy + 100 * ew, ez + 140 * ew); for (let i = 0; i < 5; i++) a.box(ex + 280 * ew + i * 30 * ew, cy - 84 * ew, ez + 20, ex + 285 * ew + i * 30 * ew, cy + 104 * ew, ez + 130 * ew);
      a.xcyl(ex + 450 * ew, ex + 620 * ew, cy + 20, ez + 70 * ew, 70 * ew + 30, 18); a.ycyl(cy - 130, cy + 110, ex + 140 * ew, ez + 10, 30, 14); a.box(ex + 600 * ew, cy - 110, ez - 20, ex + 700 * ew, cy - 30, ez + 70);
      a.box(ex + 20, cy - 60, zt - 50, X1 - 120, cy + 90, zt - 6); a.ell((ex + X1 - 120) / 2, cy + 15, zt - 50, (X1 - 120 - ex) / 2 - 10, 80, 24, 18, 7); a.cyl(ex + 120, cy + 15, zt - 30, zt - 10, 18, 10);
      const px0 = X1 - 40 - W * 0.36, pw = W * 0.36; a.box(px0, YF + 4, zt - 270, X1 - 40, YF + 20, zt - 56); for (let i = 0; i < 4; i++) a.ycyl(YF - 6, YF + 4, px0 + 36 + i * (pw - 72) / 3, zt - 120, 14, 10); for (let i = 0; i < 4; i++) a.box(px0 + 30 + i * 22, YF - 2, zt - 190, px0 + 42 + i * 22, YF + 4, zt - 160); a.box(px0 + 20, YF - 4, zt - 250, px0 + 90, YF + 4, zt - 210);
      a.box(X0 - 0 + 14, cy - 30, zf + 40, X0 + 70, cy + 40, zf + 120); a.xcyl(X0 + 8, X0 + 40, cy, zf + 90, 18, 10); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL');
      a.log('Added the tube frame, engine with finned head, alternator drum, fuel tank with cap, muffler, front panel with outlets, breakers and meter, recoil starter and ' + (v.wheels ? 'the two wheels with fold-up handle' : 'the rubber feet') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic wet tile saw',
    desc: (v) => `${m.round(v.R * 2 / IN)} in wet tile saw${v.stand ? ' on a folding X-leg stand' : ''}: a plastic water tray with raised sides, a ${m.round(v.R * 2 / IN)} in diamond blade under a splash guard, a sliding table on two guide rails with a rip fence and miter gauge, a motor housing at the side, a water pump and hose.`,
    vs: TLS.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, cy = YF / 2, R = v.R; a.outline(); const zt = v.stand ? Z0 + H * 0.5 : Z0 + 30;
      if (v.stand) { for (const s of [-1, 1]) { a.tube([[cx + s * (W * 0.36), YF + 60, zt], [cx - s * (W * 0.36), YB - 60, Z0 + 14]], [14, 14], 8); a.tube([[cx + s * (W * 0.36), YB - 60, zt], [cx - s * (W * 0.36), YF + 60, Z0 + 14]], [14, 14], 8); } a.tube([[cx - W * 0.36, cy, zt - 40], [cx + W * 0.36, cy, zt - 40]], [14, 14], 8); a.box(X0 + 40, YF + 30, zt - 28, X1 - 40, YB - 30, zt); for (const x of [cx - W * 0.36, cx + W * 0.36]) { a.box(x - 40, YF + 40, Z0, x + 40, YF + 70, Z0 + 14); a.box(x - 40, YB - 70, Z0, x + 40, YB - 40, Z0 + 14); } }
      const tz = zt + 10; a.box(X0 + 20, YF + 20, zt, X1 - 20, YB - 20, tz + 20); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20); a.box(X0 + 40, YF + 40, tz + 20, X1 - 40, YF + 46, tz + 30); a.box(X0 + 40, YB - 46, tz + 20, X1 - 40, YB - 40, tz + 30);
      const bx = cx - 30; a.xcyl(bx - 1, bx + 1, cy, tz + R * 0.7 + 20, R, 36); a.xcyl(bx - 6, bx + 6, cy, tz + R * 0.7 + 20, R * 0.22, 14); hood(a, bx - 10, bx + 10, cy, tz + R * 0.7 + 20, R + 10, 0.0, 1.0, 12);
      a.box(bx - 14, cy - R * 0.4, tz + R * 1.6, bx + 14, cy + R * 0.2, tz + R * 1.6 + 16); a.box(bx + 12, cy + 10, tz + 20, bx + 90 + R * 0.2, cy + R * 0.5, tz + R * 1.0);
      a.box(bx + 90, cy - 40, tz + 20, bx + 90 + R * 1.6, cy + 20, tz + 20 + R * 0.9); a.xcyl(bx + 60, bx + 90 + R * 1.6, cy - 40, tz + R * 0.45 + 20, R * 0.4, 18); a.xcyl(bx + 90 + R * 1.6, bx + 120 + R * 1.6, cy - 40, tz + R * 0.45 + 20, R * 0.44, 18);
      const sy = [cy - R * 0.9 - 20, cy + R * 0.9 + 20]; for (const y of sy) a.xcyl(X0 + 10, X1 - 10, y, tz + 50, 10, 10); a.box(cx - 220, sy[0] - 20, tz + 50, cx + 160, sy[1] + 20, tz + 74); a.rect(cx - 220, sy[0] - 20, cx + 160, sy[1] + 20, 'EQUIP-DETAIL');
      a.box(cx - 140, cy - R - 30, tz + 74, cx + 120, cy - R - 20, tz + 100); a.box(cx - 100, sy[1] - 10, tz + 74, cx - 70, sy[1] + 40, tz + 94);
      a.cyl(X0 + 60, YB - 70, tz + 20, tz + 70, 20, 12); a.tube([[X0 + 60, YB - 70, tz + 70], [bx - 10, cy - 30, tz + R * 0.7 + 60]], [5, 5], 6);
      a.log('Added the water tray with raised sides, diamond blade with splash guard, motor housing, sliding table on two rails with fence and miter gauge, pump with hose' + (v.stand ? ' and the folding X-leg stand' : '') + ' (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ tool storage
const PO = [['24 drawers, 4 x 6', { r: 4, c: 6, w: 18, h: 12 }], ['40 drawers, 5 x 8', { r: 5, c: 8, w: 24, h: 15 }], ['60 drawers, 6 x 10', { r: 6, c: 10, w: 30, h: 18 }], ['96 drawers, 8 x 12', { r: 8, c: 12, w: 36, h: 24 }]];
const SC = [['compact, 17 in', { k: 'one', w: 17, d: 11, h: 7, n: 2 }], ['standard, 22 in', { k: 'one', w: 22, d: 14, h: 9, n: 2 }], ['deep, 22 in', { k: 'one', w: 22, d: 14, h: 14, n: 3 }], ['three-case stack on rolling dolly', { k: 'stack', w: 22, d: 14, h: 36, n: 2 }]];
const TB = [['open tote, 14 in', { k: 'tote', w: 14, d: 8, h: 14 }], ['wide-mouth bag, 18 in', { k: 'wide', w: 18, d: 10, h: 15 }], ['rolling bag, 18 in, telescoping handle', { k: 'roll', w: 18, d: 11, h: 34 }]];
const SH2 = [['wood trestle, 36 in', { k: 'wood', w: 36, d: 20, h: 30 }], ['steel folding, 32 in beam', { k: 'steel', w: 32, d: 24, h: 32 }], ['plastic folding, 24 in', { k: 'plastic', w: 24, d: 20, h: 24 }], ['adjustable steel, 42 in beam', { k: 'adj', w: 42, d: 22, h: 36 }]];
const SK = [['quarter-inch drive, 28 sockets', { n: 14, pitch: 20, r: 7.5, sh: 30, w: 14, d: 4, h: 2 }], ['three-eighths drive, 24 sockets', { n: 12, pitch: 26, r: 10, sh: 34, w: 15, d: 5, h: 2.25 }], ['half-inch drive, 16 deep sockets', { n: 8, pitch: 36, r: 14, sh: 56, w: 13, d: 6, h: 3 }]];
const GB = [['36 in, closed lid', { w: 36, d: 18, h: 20, bw: 36 }], ['48 in, closed lid, side handles', { w: 48, d: 20, h: 22, bw: 48 }], ['60 in, open lid with lift-out tray', { w: 60, d: 22, h: 44, bw: 60, open: true }]];
const TK = [['crossover, 70 in', { k: 'cross', w: 70, d: 20, h: 18 }], ['low-profile crossover, 60 in', { k: 'cross', w: 60, d: 18, h: 13 }], ['underbody, 48 in, drop-down door', { k: 'under', w: 48, d: 18, h: 18 }]];
const FB = [['clamp-top, 30 in', { k: 'plain', w: 30, d: 24, h: 32 }], ['clamp-top with tool tray, 36 in', { k: 'tray', w: 36, d: 25, h: 33 }], ['folding with bench vise, 38 in', { k: 'vise', w: 38, d: 25, h: 34 }]];
const FC = [['12 gallon, undercounter', { w: 22, d: 18, h: 35, doors: 1 }], ['30 gallon, two door', { w: 43, d: 18, h: 44, doors: 2 }], ['45 gallon, two door', { w: 43, d: 18, h: 65, doors: 2 }]];
const BK = [['10 slots, floor standing', { n: 10, w: 28, d: 18, h: 60, mob: false }], ['18 slots, mobile on casters', { n: 18, w: 38, d: 22, h: 66, mob: true }]];
const GC = [['single cylinder hand truck', { n: 1, w: 18, d: 20, h: 56 }], ['two-cylinder cart with tray', { n: 2, w: 30, d: 24, h: 56 }]];
const CK = [['wall rack, 16 bar clamps', { k: 'wall', w: 36, d: 12, h: 40, z: 36, n: 16 }], ['mobile pipe-clamp cart, 12 clamps', { k: 'cart', w: 30, d: 22, h: 40, z: 0, n: 12 }]];
const WT = [['3 x 2 ft, slotted top', { w: 36, d: 24, h: 34, drawer: false }], ['4 x 2 ft, drawer and lower shelf', { w: 48, d: 24, h: 34, drawer: true }]];

/** rounded-profile case body helper: box with chamfered bottom edge, lid ridge, latches */
function chest(a, x0, x1, y0, y1, z0, hb, o = {}) {
  const t = 10; a.box(x0 + t, y0 + t, z0, x1 - t, y1 - t, z0 + 6); prismX(a, [[y0 + t, z0 + 6], [y1 - t, z0 + 6], [y1, z0 + 6 + t], [y1, z0 + hb], [y0, z0 + hb], [y0, z0 + 6 + t]], x0, x1);
  a.box(x0 + 8, y0 - 0, z0 + hb, x1 - 8, y1, z0 + hb + (o.lid ?? 14)); return z0 + hb + (o.lid ?? 14);
}

const STORE = [
  fam({ cat: 'tools/storage', title: 'Generic small parts organizer cabinet',
    desc: (v) => `Wall-hung small-parts cabinet with ${v.r * v.c} drawers in ${v.r} rows of ${v.c}: a steel carcass with a rear mounting rail, a bank of drawer fronts with a finger pull and a label holder on each, and side stiffening ribs.`,
    vs: PO.map(([l, p]) => [l, p.w, 6.5, p.h, 40, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, H } = a; a.outline(); a.box(X0, YF + 14, Z0, X1, YB, Z1); a.box(X0 + 20, YB - 8, Z0 + 20, X1 - 20, YB, Z1 - 20);
      for (const x of [X0 + 30, X1 - 30]) a.box(x - 15, YB - 24, Z0 - 0, x + 15, YB - 8, Z1);
      const mx = 10, mz = 12, dw = (W - 2 * mx) / v.c, dh = (H - 2 * mz) / v.r;
      for (let i = 0; i < v.r; i++) for (let j = 0; j < v.c; j++) { const x0 = X0 + mx + j * dw + 1.5, z0 = Z0 + mz + i * dh + 1.5; a.box(x0, YF + 6, z0, x0 + dw - 3, YF + 14, z0 + dh - 3); a.box(x0 + dw * 0.3, YF + 1, z0 + dh * 0.5 - 4, x0 + dw * 0.7, YF + 6, z0 + dh * 0.5 + 2); a.box(x0 + dw * 0.12, YF + 3, z0 + dh * 0.65, x0 + dw * 0.88, YF + 6, z0 + dh - 8); }
      a.box(X0, YF + 2, Z0, X0 + 4, YF + 14, Z1); a.box(X1 - 4, YF + 2, Z0, X1, YF + 14, Z1); a.line(X0, YF + 14, X1, YF + 14); a.log('Added the carcass with mounting rail, ' + v.r * v.c + ' drawer fronts with finger pulls and label holders and the side ribs (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic stackable tool case',
    desc: (v) => v.k === 'stack' ? 'Three modular tool cases stacked and latched on a rolling dolly: each case has a ribbed body, a recessed lid that locks to the case above, two front latches and a top carry handle; the dolly has a platform with a rail and four swivel casters.' : `Modular stackable tool case, ${v.n} front latches: a ribbed body with a chamfered base, a lid with a stacking recess and a folding carry handle, rubber feet, a hinged lid line and latches with hooks.`,
    vs: SC.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline();
      const one = (z0, hb) => {
        const top = chest(a, X0 + 14, X1 - 14, YF + 12, YB - 12, z0, hb - 14, { lid: 14 }); a.box(X0 + 70, YF + 40, top, X1 - 70, YB - 40, top + 4);
        a.tube([[cx - 90, (YF + YB) / 2, top + 4], [cx - 70, (YF + YB) / 2, top + 30], [cx + 70, (YF + YB) / 2, top + 30], [cx + 90, (YF + YB) / 2, top + 4]], [8, 8, 8, 8], 8);
        const nl = v.n; for (let i = 0; i < nl; i++) { const x = X0 + 14 + 40 + i * ((X1 - X0 - 28 - 80) / (nl - 1)); a.box(x - 22, YF + 4, z0 + hb - 70, x + 22, YF + 12, z0 + hb + 4); a.box(x - 16, YF + 2, z0 + hb - 30, x + 16, YF + 4, z0 + hb - 10); }
        for (let i = 0; i < 4; i++) a.box(X0 + 14 + 30 + i * 30, YF + 11, z0 + 30, X0 + 14 + 40 + i * 30, YF + 12, z0 + hb - 90); return top; };
      if (v.k === 'stack') {
        a.box(X0 + 10, YF + 10, Z0 + 50, X1 - 10, YB - 10, Z0 + 78); a.box(X0 + 10, YF + 10, Z0 + 78, X1 - 10, YF + 20, Z0 + 110); a.box(X0 + 10, YB - 20, Z0 + 78, X1 - 10, YB - 10, Z0 + 110); caster4(a, X0 + 4, X1 - 4, YF + 4, YB - 4, 24);
        let z = Z0 + 80; for (const h of [230, 230, 250]) { z = one(z, h) + 4; }
      } else one(Z0, v.h * IN);
      a.rect(X0 + 14, YF + 12, X1 - 14, YB - 12); a.log('Added the ribbed body, stacking lid with carry handle, ' + v.n + ' latches' + (v.k === 'stack' ? ', three stacked cases and the rolling dolly' : ' and the feet') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic tool bag',
    desc: (v) => v.k === 'roll' ? 'Rolling tool bag: a stiff fabric body with a zipped top, two front pockets with flaps and a webbing carry handle, a telescoping pull handle on two tubes, two wheels at the base and a moulded base plate.' : `${v.k === 'tote' ? 'Open tote' : 'Wide-mouth'} tool bag: a rigid base with fabric walls, a rolled open mouth, two webbing handles, outer pockets with flaps and a row of tools standing in the bag.`,
    vs: TB.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, yc = YF / 2; a.outline();
      if (v.k === 'roll') {
        a.box(X0 + 12, YF + 20, Z0 + 40, X1 - 12, YB - 90, Z0 + 520); prismX(a, [[YF + 20, Z0 + 520], [YB - 90, Z0 + 520], [YB - 100, Z0 + 560], [YF + 30, Z0 + 560]], X0 + 20, X1 - 20); a.box(X0 + 6, YF + 14, Z0 + 20, X1 - 6, YB - 84, Z0 + 56);
        for (const x of [X0 + 70, X1 - 70]) { a.xcyl(x - 14, x + 14, YB - 40, Z0 + 40, 40, 16); a.box(x - 16, YB - 80, Z0 + 40, x + 16, YB - 40, Z0 + 56); a.tube([[x, YB - 70, Z0 + 520], [x, YB - 70, Z1 - 30]], [8, 8], 8); a.cyl(x, YB - 70, Z0 + 520, Z0 + 560, 14, 10); }
        a.tube([[X0 + 70, YB - 70, Z1 - 30], [X0 + 70, YB - 70, Z1 - 10], [X1 - 70, YB - 70, Z1 - 10], [X1 - 70, YB - 70, Z1 - 30]], [10, 10, 10, 10], 8); a.tube([[cx - 90, yc * 0.4, Z0 + 560], [cx - 70, yc * 0.4, Z0 + 600], [cx + 70, yc * 0.4, Z0 + 600], [cx + 90, yc * 0.4, Z0 + 560]], [8, 8, 8, 8], 8);
        for (const dx of [-1, 1]) { a.box(cx + dx * 100 - 80, YF + 10, Z0 + 120, cx + dx * 100 + 80, YF + 22, Z0 + 330); a.box(cx + dx * 100 - 84, YF + 8, Z0 + 300, cx + dx * 100 + 84, YF + 20, Z0 + 340); a.box(cx + dx * 100 - 60, YF + 4, Z0 + 305, cx + dx * 100 + 60, YF + 8, Z0 + 330); }
        a.rect(X0 + 12, YF + 20, X1 - 12, YB - 90); return a.log('Added the fabric body with zipped top, front pockets with flaps, carry handle, telescoping pull handle, wheels and base plate (plan and 3D).');
      }
      const bh = H * 0.72, ww = W - 24, dd = D - 24; a.box(X0 + 12, YF + 12, Z0, X1 - 12, YB - 12, Z0 + 16); for (const s of [0, 1]) { a.box(X0 + 12, s ? YB - 20 : YF + 12, Z0 + 16, X1 - 12, s ? YB - 12 : YF + 20, Z0 + bh); a.box(s ? X1 - 20 : X0 + 12, YF + 20, Z0 + 16, s ? X1 - 12 : X0 + 20, YB - 20, Z0 + bh); }
      a.box(X0 + 8, YF + 8, Z0 + bh - 10, X1 - 8, YF + 22, Z0 + bh + 10); a.box(X0 + 8, YB - 22, Z0 + bh - 10, X1 - 8, YB - 8, Z0 + bh + 10);
      for (const s of [-1, 1]) a.tube([[cx + s * W * 0.3, yc, Z0 + bh], [cx + s * W * 0.22, yc, Z1 - 40], [cx + s * W * 0.05, yc, Z1 - 10], [cx, yc, Z1 - 8]], [8, 8, 8, 8], 8);
      const pw = (W - 80) / 3; for (let i = 0; i < 3; i++) a.box(X0 + 30 + i * pw, YF + 4, Z0 + 40, X0 + 30 + i * pw + pw - 8, YF + 12, Z0 + bh * 0.55); for (let i = 0; i < 3; i++) a.box(X0 + 36 + i * pw, YF, Z0 + bh * 0.45, X0 + 22 + i * pw + pw - 8, YF + 4, Z0 + bh * 0.55);
      for (let i = 0; i < 5; i++) { const x = X0 + 50 + i * (W - 100) / 4, h = 140 + (i % 3) * 40; a.tube([[x, yc + 10, Z0 + bh * 0.4], [x, yc + 10, m.min(Z1 - 40, Z0 + bh + h * 0.3)], [x, yc + 10, m.min(Z1 - 14, Z0 + bh + h * 0.45)]], [i % 2 ? 6 : 10, i % 2 ? 6 : 12, i % 2 ? 4 : 9], 8); }
      a.rect(X0 + 12, YF + 12, X1 - 12, YB - 12); a.log('Added the rigid base, fabric walls with rolled mouth, two webbing handles, outer pockets with flaps and the row of tool handles in the bag (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic sawhorse',
    desc: (v) => ({ wood: 'Timber trestle sawhorse: a planed top beam with two gusset plates, four flat splayed legs fixed to the beam sides, a lower stretcher and a pencil notch.', steel: 'Folding steel sawhorse: a channel top beam, two pairs of tube legs that splay out and fold, a cross brace with a hinge and four rubber feet.', plastic: 'Folding moulded sawhorse: a ribbed top beam with a hand slot and rubber top pads, two pairs of wide ribbed leg plates with cut-outs and wide feet.', adj: 'Adjustable steel sawhorse: a channel top beam with end caps, two-section telescoping legs with spring pin locks, splayed feet and a cross brace.' })[v.k],
    vs: SH2.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, yc = YF / 2; a.outline(); const bx0 = X0 + 16, bx1 = X1 - 16;
      if (v.k === 'wood') { a.box(bx0, yc - 45, Z1 - 90, bx1, yc + 45, Z1); for (const x of [bx0 + 90, bx1 - 90]) { prismX(a, [[yc - 45, Z1 - 90], [yc - 45 - 20, Z1 - 90], [yc - 190, Z0 + 20], [yc - 190, Z0], [yc - 150, Z0], [yc - 25, Z1 - 90]], x - 19, x + 19); prismX(a, [[yc + 45, Z1 - 90], [yc + 45 + 20, Z1 - 90], [yc + 190, Z0 + 20], [yc + 190, Z0], [yc + 150, Z0], [yc + 25, Z1 - 90]].slice(0, 6), x - 19, x + 19); a.box(x - 30, yc - 48, Z1 - 200, x + 30, yc + 48, Z1 - 90); }
        a.box(bx0 + 90, yc - 14, Z0 + 230, bx1 - 90, yc + 14, Z0 + 262); a.rect(bx0, yc - 45, bx1, yc + 45); }
      else if (v.k === 'steel') { a.box(bx0, yc - 50, Z1 - 60, bx1, yc + 50, Z1 - 50); a.box(bx0, yc - 50, Z1 - 50, bx1, yc - 40, Z1); a.box(bx0, yc + 40, Z1 - 50, bx1, yc + 50, Z1); a.box(bx0, yc - 40, Z1 - 60, bx1, yc + 40, Z1 - 50);
        for (const x of [bx0 + 70, bx1 - 70]) for (const s of [-1, 1]) { a.tube([[x, yc + s * 30, Z1 - 60], [x, yc + s * 210, Z0 + 10]], [11, 11], 8); a.box(x - 24, yc + s * 210 - 24, Z0, x + 24, yc + s * 210 + 24, Z0 + 14); }
        a.tube([[bx0 + 70, yc, Z0 + 330], [bx1 - 70, yc, Z0 + 330]], [8, 8], 8); a.rect(bx0, yc - 50, bx1, yc + 50); }
      else if (v.k === 'plastic') { a.box(bx0, yc - 60, Z1 - 80, bx1, yc + 60, Z1); for (let i = 0; i < 7; i++) a.box(bx0 + 30 + i * (W - 92) / 6, yc - 62, Z1 - 70, bx0 + 38 + i * (W - 92) / 6, yc + 62, Z1 - 10); a.box(cx - 60, yc - 30, Z1 - 4, cx + 60, yc + 30, Z1 + 0);
        for (const x of [bx0 + 70, bx1 - 70]) for (const s of [-1, 1]) { prismX(a, [[yc + s * 50, Z1 - 80], [yc + s * 150, Z0 + 20], [yc + s * 190, Z0], [yc + s * 90, Z0], [yc + s * 60, Z1 - 80]].map(([y, z]) => [y, z]).sort((p, q) => 0), x - 30, x + 30); }
        a.rect(bx0, yc - 60, bx1, yc + 60); }
      else { a.box(bx0, yc - 50, Z1 - 80, bx1, yc + 50, Z1); a.box(bx0, yc - 38, Z1 - 80, bx1, yc + 38, Z1 + 0); a.box(bx0 - 10, yc - 52, Z1 - 84, bx0, yc + 52, Z1 + 2); a.box(bx1, yc - 52, Z1 - 84, bx1 + 10, yc + 52, Z1 + 2);
        for (const x of [bx0 + 70, bx1 - 70]) for (const s of [-1, 1]) { a.tube([[x, yc + s * 30, Z1 - 80], [x, yc + s * 150, Z0 + 330]], [15, 15], 8); a.tube([[x, yc + s * 150, Z0 + 330], [x, yc + s * 210, Z0 + 14]], [11, 11], 8); a.cyl(x, yc + s * 150, Z0 + 300, Z0 + 320, 18, 10); a.ell(x + 22, yc + s * 150, Z0 + 330, 8, 8, 8, 6, 4); a.box(x - 26, yc + s * 210 - 26, Z0, x + 26, yc + s * 210 + 26, Z0 + 14); }
        a.tube([[bx0 + 70, yc, Z0 + 420], [bx1 - 70, yc, Z0 + 420]], [8, 8], 8); a.rect(bx0 - 10, yc - 52, bx1 + 10, yc + 52); }
      a.log('Added the ' + ({ wood: 'timber top beam with gussets, flat splayed legs and the stretcher', steel: 'channel beam, splayed tube legs, cross brace and feet', plastic: 'ribbed top beam with pads, ribbed leg plates and feet', adj: 'channel beam with end caps, telescoping legs with pin locks, feet and the brace' })[v.k] + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic socket tray',
    desc: (v) => `Socket organizer tray with ${v.n * 2} sockets in two rows of ${v.n}: a pressed steel tray with raised edges, two long rails with a spring clip for each socket, hex sockets standing on the clips and a size plate at the front of each.`,
    vs: SK.map(([l, p]) => [l, p.w, p.d, U(p.h * IN + p.sh + 14), 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, cx } = a, yc = YF / 2; a.outline(); a.box(X0 + 6, YF + 6, Z0, X1 - 6, YB - 6, Z0 + 8); for (const [y0, y1] of [[YF + 6, YF + 14], [YB - 14, YB - 6]]) a.box(X0 + 6, y0, Z0 + 8, X1 - 6, y1, Z0 + 20); for (const x of [X0 + 6, X1 - 14]) a.box(x, YF + 6, Z0 + 8, x + 8, YB - 6, Z0 + 20);
      const ys = [yc - v.d * IN * 0.25, yc + v.d * IN * 0.25], x0 = cx - (v.n - 1) * v.pitch / 2; for (const y of ys) { a.box(X0 + 20, y - 3, Z0 + 8, X1 - 20, y + 3, Z0 + 16); }
      for (const y of ys) for (let i = 0; i < v.n; i++) { const x = x0 + i * v.pitch; a.cyl(x, y, Z0 + 16, Z0 + 16 + v.sh * (0.8 + 0.2 * ((i * 7) % 5) / 4), v.r, 6); a.cyl(x, y, Z0 + 16 + v.sh * 0.2, Z0 + 18 + v.sh * 0.2, v.r + 1.2, 6); a.circ(x, y, v.r, 'EQUIP-DETAIL'); a.box(x - v.r * 0.7, y - v.r - 5, Z0 + 12, x + v.r * 0.7, y - v.r - 1, Z0 + 16); }
      a.rect(X0 + 6, YF + 6, X1 - 6, YB - 6); a.log('Added the pressed tray, two clip rails, ' + v.n * 2 + ' hex sockets and their size plates (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic lockable gang box',
    desc: (v) => v.open ? 'Steel gang box with the lid open: a ribbed body with side handles and runners, a hinged lid standing open at the back on stays, a lift-out tray with dividers sitting in the body, a hasp and padlock loop and corner protectors.' : `${v.w} in steel gang box, lid closed: a ribbed body with a flat lid, a hasp and padlock loop at the front, ${v.w > 40 ? 'two side handles, ' : ''}corner protectors, runners and a ribbed front panel.`,
    vs: GB.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, cx, W, D } = a, yc = YF / 2, bh = (v.open ? 20 : v.h) * IN - (v.open ? 0 : 36), lz = Z0 + 36 + bh; a.outline();
      for (const y of [YF + 30, YB - 70]) a.box(X0 + 10, y, Z0, X1 - 10, y + 40, Z0 + 36); a.box(X0 + 6, YF + 12, Z0 + 36, X1 - 6, YB - 12, lz); a.rect(X0 + 6, YF + 12, X1 - 6, YB - 12);
      for (let i = 0; i < m.floor(W / 140); i++) a.box(X0 + 50 + i * 140, YF + 8, Z0 + 70, X0 + 62 + i * 140, YF + 12, lz - 40); for (const x of [X0 + 6, X1 - 18]) for (const z of [Z0 + 36, lz - 26]) a.box(x, YF + 8, z, x + 18, YF + 12, z + 26);
      for (const x of [X0 + 6, X1 - 6]) { a.tube([[x + (x < cx ? -1 : 1) * 2, yc - 60, lz - 60], [x + (x < cx ? -1 : 1) * 24, yc - 60, lz - 50], [x + (x < cx ? -1 : 1) * 24, yc + 60, lz - 50], [x + (x < cx ? -1 : 1) * 2, yc + 60, lz - 60]], [8, 8, 8, 8], 8); }
      if (v.open) { const lh = (D - 28), lt = 14, yb = YB - 12; a.box(X0 + 6, YB - 24, lz, X1 - 6, YB - 12, lz + lh); a.box(X0 + 6, YB - 24 - 18, lz + 8, X1 - 6, YB - 24, lz + lh - 8); a.rect(X0 + 6, YB - 24, X1 - 6, YB - 12, 'EQUIP-DETAIL'); for (const x of [X0 + 100, X1 - 100]) a.tube([[x, yb - 12, lz + lh * 0.7], [x, yb - 150, lz + 40]], [4, 4], 6);
        a.box(X0 + 30, YF + 30, lz - 40, X1 - 30, YB - 120, lz + 50); a.box(X0 + 36, YF + 36, lz - 34, X1 - 36, YB - 126, lz + 44); for (let i = 1; i < 4; i++) a.box(X0 + 30 + i * (W - 60) / 4 - 3, YF + 32, lz - 36, X0 + 30 + i * (W - 60) / 4 + 3, YB - 122, lz + 50); a.box(X0 + 30, yc - 3 - 60, lz - 36, X1 - 30, yc + 3 - 60, lz + 50); return a.log('Added the ribbed body with runners and side handles, the hinged lid standing open on stays and the lift-out tray with dividers (plan and 3D).'); }
      a.box(X0 + 4, YF + 4, lz, X1 - 4, YB - 4, lz + 36); a.box(cx - 40, YF + 4, lz - 70, cx + 40, YF + 8, lz + 20); a.tube([[cx - 18, YF + 2, lz - 50], [cx - 18, YF - 0 + 2, lz - 70], [cx + 18, YF + 2, lz - 70], [cx + 18, YF + 2, lz - 50]], [5, 5, 5, 5], 6); a.box(cx - 25, YF + 2, lz - 18, cx + 25, YF + 8, lz + 4);
      a.log('Added the ribbed body with runners, flat lid, hasp and padlock loop, corner protectors' + (v.w > 40 ? ' and side handles' : ' and side handles') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic truck tool box',
    desc: (v) => v.k === 'under' ? 'Underbody truck tool box: a diamond-plate steel box with a full-width drop-down front door on two hinges, a paddle latch with a lock, an internal shelf outline, top mounting brackets and a bottom skid rail.' : 'Crossover truck tool box: a diamond-plate steel box with two sloped lids on piano hinges and gas struts, a paddle latch and lock on each lid, side mounting brackets and a raised centre divider.',
    vs: TK.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline();
      if (v.k === 'under') { a.box(X0 + 10, YF + 10, Z0 + 20, X1 - 10, YB - 10, Z1 - 40); a.box(X0 + 10, YF + 4, Z0 + 20, X1 - 10, YF + 10, Z1 - 40); a.box(X0, YF + 10, Z0 + 20, X0 + 10, YB - 10, Z1 - 40); a.box(X1 - 10, YF + 10, Z0 + 20, X1, YB - 10, Z1 - 40); a.box(X0 + 40, YF + 10, Z0, X1 - 40, YB - 10, Z0 + 20);
        for (const x of [X0 + 40, X1 - 40]) a.box(x - 25, YF + 10, Z1 - 40, x + 25, YB - 40, Z1 - 20); for (const x of [X0 + 120, X1 - 120]) { a.box(x - 25, YF, Z1 - 100, x + 25, YF + 4, Z1 - 60); } a.box(cx - 45, YF, Z0 + 150, cx + 45, YF + 4, Z0 + 180); a.cyl(cx, YF + 2, Z0 + 150, Z0 + 150.1, 0.1, 3); a.ycyl(YF - 0, YF + 4, cx + 25, Z0 + 165, 12, 10);
        for (let i = 0; i < 8; i++) a.box(X0 + 60 + i * (W - 120) / 7, YF + 1, Z0 + 60, X0 + 70 + i * (W - 120) / 7, YF + 4, Z1 - 100); a.rect(X0, YF + 4, X1, YB - 10); return a.log('Added the diamond-plate box, drop-down door with paddle latch and lock, mounting brackets and the skid rail (plan and 3D).'); }
      const zl = Z0 + H * 0.62, lw = (W - 40) / 2; a.box(X0 + 12, YF + 10, Z0, X1 - 12, YB - 10, zl); a.rect(X0 + 12, YF + 10, X1 - 12, YB - 10);
      for (const s of [0, 1]) { const x0 = X0 + 20 + s * (lw + 0), x1 = x0 + lw; prismX(a, [[YF + 10, zl], [YB - 10, zl], [YB - 20, Z1 - 4], [YF + 40, Z1 - 4]], x0 + 4, x1 - 4); a.box(x0 + 6, YF + 4, zl - 20, x1 - 6, YF + 10, zl + 4); a.box(x0 + lw / 2 - 30, YF - 0, zl - 50, x0 + lw / 2 + 30, YF + 4, zl - 20); a.ycyl(YF, YF + 4, x0 + lw / 2, zl - 36, 10, 10);
        a.tube([[s ? x1 - 10 : x0 + 10, YB - 60, zl + 4], [s ? x1 - 10 : x0 + 10, YB - 100, Z1 - 40]], [5, 5], 6); for (let i = 0; i < 5; i++) a.box(x0 + 30 + i * (lw - 60) / 4, YF + 60, Z1 - 8, x0 + 36 + i * (lw - 60) / 4, YB - 40, Z1 - 4); }
      a.box(cx - 22, YF + 10, zl, cx + 22, YB - 10, Z1 - 2); for (const x of [X0, X1 - 12]) a.box(x, YF + 60, Z0 + 20, x + 12, YB - 60, zl - 20); for (const x of [X0 + 50, X1 - 50]) { a.box(x - 30, YF + 20, Z0 - 0, x + 30, YF + 60, Z0 + 12); a.box(x - 30, YB - 60, Z0, x + 30, YB - 20, Z0 + 12); }
      a.log('Added the diamond-plate box, two sloped lids with gas struts, paddle latches with locks, centre divider and the side mounting brackets (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic folding workbench',
    desc: (v) => `Portable folding workbench, ${v.w} in: a two-board clamping top with a gap and a crank screw with a handle, ${v.k === 'vise' ? 'a row of bench dog holes with a steel jaw plate, ' : v.k === 'tray' ? 'a pull-out side tray and a lower tool shelf, ' : ''}two folding A-frame leg sets with a cross bar and rubber feet.`,
    vs: FB.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, yc = YF / 2; a.outline(); const zt = Z1 - 38, gap = 90;
      a.box(X0 + 10, YF + 40, zt, X1 - 10, YF + 40 + (D - 80 - gap) / 2, Z1); a.box(X0 + 10, YB - 40 - (D - 80 - gap) / 2, zt, X1 - 10, YB - 40, Z1); a.rect(X0 + 10, YF + 40, X1 - 10, YB - 40);
      a.box(X0 + 10, YF + 30, zt - 30, X1 - 10, YF + 50, zt); a.box(X0 + 10, YB - 50, zt - 30, X1 - 10, YB - 30, zt);
      for (const x of [X0 + 70, X1 - 70]) { a.tube([[x, YF + 30, zt - 20], [x, YF + 8, Z0 + 14]], [14, 14], 8); a.tube([[x, YB - 30, zt - 20], [x, YB - 8, Z0 + 14]], [14, 14], 8); a.cyl(x, YF + 8, Z0, Z0 + 14, 22, 10); a.cyl(x, YB - 8, Z0, Z0 + 14, 22, 10); a.tube([[x, YF + 18, Z0 + 260], [x, YB - 18, Z0 + 260]], [10, 10], 8); }
      a.ycyl(YF + 20, YF - 0 + 40, X0 + 10, zt + 20, 7, 8); a.xcyl(X0 - 0, X0 + 90, YF + 4, zt + 30, 9, 8); a.ell(X0 + 6, YF + 4, zt + 30, 14, 14, 14, 8, 5); a.cyl(X0 + 60, yc, zt + 10, zt + 14, 16, 10);
      if (v.k === 'vise') { for (let i = 0; i < 6; i++) { a.cyl(X0 + 180 + i * (W - 360) / 5, YF + 80, Z1 - 24, Z1 + 0, 11, 10); a.circ(X0 + 180 + i * (W - 360) / 5, YF + 80, 11, 'EQUIP-DETAIL'); } a.box(X0 + 10, YF + 40, Z1 - 4, X0 + 40, YB - 40, Z1); }
      if (v.k === 'tray') { a.box(X0 + 100, YF + 30, Z0 + 260, X1 - 100, YB - 30, Z0 + 276); for (const [y0, y1] of [[YF + 30, YF + 38], [YB - 38, YB - 30]]) a.box(X0 + 100, y0, Z0 + 276, X1 - 100, y1, Z0 + 330); for (const x of [X0 + 100, X1 - 108]) a.box(x, YF + 38, Z0 + 276, x + 8, YB - 38, Z0 + 330); a.box(X1 - 10, YF + 60, zt - 40, X1 + 0, YB - 60, zt - 10); }
      a.log('Added the two-board clamping top with crank screw, two folding A-frame leg sets, cross bars and rubber feet' + (v.k === 'vise' ? ', dog holes and the jaw plate' : v.k === 'tray' ? ' and the lower tool tray' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic flammable liquids cabinet',
    desc: (v) => `${v.w > 30 ? (v.h > 50 ? '45' : '30') : '12'} gallon flammable liquids safety cabinet: a double-wall steel carcass with an air gap, ${v.doors === 1 ? 'one self-closing door' : 'two self-closing doors'} with a three-point latch handle, two vent bungs on top, a grounding lug at the side, a caution label on the door, levelling feet and an inner liquid-tight sill.`,
    vs: FC.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, H } = a; cab(a, { doors: v.doors, pull: 'vbar', toe: 0, legs: 60, shelves: v.h > 50 ? 3 : 1, lock: false });
      a.box(X0 + 8, YF - 0, Z0 + 140, X1 - 8, YF + 2, Z0 + 144); for (const x of [X0 + 60, X1 - 60]) { a.cyl(x, YB - 60, Z1, Z1 + 0.01, 0.01, 3); a.cyl(x, YB - 70, Z1 - 18, Z1, 14, 12); }
      a.box(cx - 120, YF - 2, Z0 + H * 0.55, cx + 120, YF, Z0 + H * 0.55 + 110); a.box(cx - 100, YF - 4, Z0 + H * 0.55 + 70, cx + 100, YF - 2, Z0 + H * 0.55 + 100); a.box(X1, YF + 80, Z0 + H * 0.4, X1 - 0 + 0, YF + 120, Z0 + H * 0.4 + 40);
      a.box(X0 + 60, YF - 2, Z0 + 150, X1 - 60, YF, Z0 + 160); a.box(X1 - 1, YB - 160, Z0 + H * 0.4, X1, YB - 100, Z0 + H * 0.4 + 40);
      a.log('Added the double-wall carcass, self-closing door' + (v.doors > 1 ? 's' : '') + ' with the three-point latch, vent bungs, grounding lug, caution label and levelling feet (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic bar stock rack',
    desc: (v) => `Vertical bar and tube stock rack with ${v.n} slots: a welded base frame with a sleeve cell under each slot, a top frame with matching cells, standing rods and tubes of mixed diameter and height${v.mob ? ', four swivel casters and a push handle' : ' and levelling feet'}.`,
    vs: BK.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, yc = YF / 2; a.outline(); const zb = Z0 + (v.mob ? 110 : 30), zt = Z1 - 150, cols = v.n > 12 ? 6 : 5, rows = v.n > 12 ? 3 : 2, dx = (W - 120) / cols, dy = (D - 120) / rows;
      a.box(X0 + 30, YF + 30, zb, X1 - 30, YB - 30, zb + 40); a.box(X0 + 30, YF + 30, zt, X1 - 30, YB - 30, zt + 30); for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 40], [X1 - 40, YB - 40]]) a.box(x - 16, y - 16, zb + 40, x + 16, y + 16, zt);
      if (v.mob) { caster4(a, X0 + 30, X1 - 30, YF + 30, YB - 30, 50); a.tube([[X1 - 40, YB - 40, zt], [X1 - 40, YB - 40, Z1 - 20], [X1 - 40, YF + 40, Z1 - 20], [X1 - 40, YF + 40, zt]], [10, 10, 10, 10], 8); } else for (const [x, y] of [[X0 + 50, YF + 50], [X1 - 50, YF + 50], [X0 + 50, YB - 50], [X1 - 50, YB - 50]]) a.cyl(x, y, Z0, zb, 22, 10);
      let k = 0; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { if (k >= v.n) break; const x = X0 + 60 + dx * (i + 0.5), y = YF + 60 + dy * (j + 0.5), r = 8 + ((k * 5) % 4) * 3.5, h = zt + 20 + ((k * 7) % 5) * 22; a.cyl(x, y, zb + 40, zb + 90, r + 8, 12); a.cyl(x, y, zt - 10, zt + 40, r + 8, 12); a.cyl(x, y, zb + 40, m.min(h, Z1 - 60), r, k % 2 ? 6 : 14); a.circ(x, y, r + 8, 'EQUIP-DETAIL'); k++; }
      a.rect(X0 + 30, YF + 30, X1 - 30, YB - 30); a.log('Added the base frame with sleeve cells, top frame with cells, ' + v.n + ' standing rods and tubes' + (v.mob ? ', casters and push handle' : ' and feet') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic gas cylinder cart',
    desc: (v) => v.n === 1 ? 'Single cylinder hand truck: two upright rails with a nose plate, a lower axle with two rubber wheels, a top handle loop, a chain with a hook and a standing cylinder with a domed top, a valve and a guard cap.' : 'Two-cylinder welding cart: a steel tube frame with a rear upright, two standing cylinders of different size with valves and guard caps held by chains, two large rear wheels, front feet, a handle, hose hooks and a small tool tray.',
    vs: GC.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, yc = YF / 2; a.outline();
      const cyl = (x, y, z0, r, hh) => { a.cyl(x, y, z0, z0 + hh, r, 24); a.ell(x, y, z0 + hh, r, r, r * 0.55, 24, 7); a.cyl(x, y, z0 + hh + r * 0.4, z0 + hh + r * 0.85, r * 0.18, 10); a.cyl(x, y, z0 + hh + r * 0.85, z0 + hh + r * 1.05, r * 0.28, 10); a.xcyl(x - r * 0.45, x + r * 0.45, y, z0 + hh + r * 0.7, 6, 8); ring(a, 'xy', x, y, z0 + hh - r * 0.1, r * 0.4, 5, 16, 5); a.circ(x, y, r, 'EQUIP'); };
      if (v.n === 1) { const x = cx, y = yc + 20, r = 115, z0 = Z0 + 200; a.tube([[x - 130, y + 60, Z0 + 150], [x - 130, y + 60, Z1 - 30], [x + 130, y + 60, Z1 - 30], [x + 130, y + 60, Z0 + 150]], [11, 11, 11, 11], 8); a.box(x - 130, y + 30, Z0 + 40, x + 130, y + 60, Z0 + 56); a.box(x - 140, y - 90, Z0 + 28, x + 140, y + 60, Z0 + 40); a.box(x - 140, y - 140, Z0 + 20, x + 140, y - 90, Z0 + 40);
        a.xcyl(X0 + 6, X1 - 6, y + 60, Z0 + 110, 8, 8); for (const s of [-1, 1]) { a.xcyl(x + s * 190 - 20, x + s * 190 + 20, y + 60, Z0 + 110, 110, 20); } cyl(x, y - 10, Z0 + 56, r, 1050); a.tube([[x - r, y - 10, Z0 + 640], [x, y - 10 - r, Z0 + 640], [x + r, y - 10, Z0 + 640]], [4, 4, 4], 6); a.tube([[x - 130, y + 60, Z0 + 700], [x - 90, y + 20, Z0 + 700]], [4, 4], 6);
        return a.log('Added the two upright rails with nose plate, axle with two wheels, top handle loop, chain and the standing cylinder with domed top, valve and guard cap (plan and 3D).'); }
      const y = yc + 20; a.tube([[X0 + 30, YB - 50, Z0 + 150], [X0 + 30, YB - 50, Z1 - 20], [X1 - 30, YB - 50, Z1 - 20], [X1 - 30, YB - 50, Z0 + 150]], [11, 11, 11, 11], 8); a.box(X0 + 30, YF + 40, Z0 + 50, X1 - 30, YB - 40, Z0 + 66); for (const x of [X0 + 40, X1 - 40]) a.tube([[x, YB - 50, Z0 + 200], [x, YF + 40, Z0 + 66]], [10, 10], 8);
      a.box(cx - 50, YB - 50, Z0 + 350, cx + 50, YB - 20, Z0 + 750); for (const x of [X0 + 60, X1 - 60]) { a.xcyl(x - 22, x + 22, YB - 50, Z0 + 130, 130, 20); } a.xcyl(X0 + 20, X1 - 20, YB - 50, Z0 + 130, 9, 8); for (const x of [X0 + 50, X1 - 50]) { a.cyl(x, YF + 50, Z0, Z0 + 50, 20, 10); }
      cyl(cx - 140, y - 20, Z0 + 66, 115, 1000); cyl(cx + 140, y - 20, Z0 + 66, 95, 900); for (const s of [-1, 1]) a.tube([[cx + s * 140 - 100 * s, y + 60, Z0 + 640], [cx + s * 140, y + 60 - 80, Z0 + 640], [cx + s * 140 + 100 * s, y + 60, Z0 + 640]].slice(0, 3), [4, 4, 4], 6);
      a.tube([[cx - 40, YB - 50, Z0 + 1000], [cx - 120, YB - 80, Z0 + 1050], [cx - 140, y + 120, Z0 + 1000]], [5, 5, 5], 6); a.box(cx - 220, YB - 160, Z0 + 330, cx + 220, YB - 52, Z0 + 346); for (const [y0, y1] of [[YB - 160, YB - 152]]) a.box(cx - 220, y0, Z0 + 346, cx + 220, y1, Z0 + 380); a.box(cx + 70, YB - 52, Z0 + 700, cx + 80, YB - 30, Z0 + 760); a.box(cx + 130, YB - 52, Z0 + 700, cx + 140, YB - 30, Z0 + 760);
      a.log('Added the tube frame, two cylinders of different size with valves, caps and chains, rear wheels, handle, hose hooks and the tool tray (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic clamp rack',
    desc: (v) => v.k === 'wall' ? 'Wall-mounted clamp rack holding 16 bar clamps: a back board with two long steel rails with spaced notches, and sixteen bar clamps hung by their bars, each with a fixed head and a sliding head with a screw handle.' : 'Mobile pipe-clamp cart holding 12 pipe clamps: a welded A-frame on a base with four swivel casters, three horizontal peg pairs on each side, twelve pipe clamps hung across them with a head and a tail stop each, and a push handle.',
    vs: CK.map(([l, p]) => [l, p.w, p.d, p.h, p.z, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, yc = YF / 2; a.outline();
      if (v.k === 'wall') { a.box(X0, YB - 18, Z0, X1, YB, Z1); for (const z of [Z0 + 80, Z1 - 100]) { a.box(X0 + 10, YB - 40, z, X1 - 10, YB - 18, z + 36); for (let i = 0; i < 16; i++) a.box(X0 + 22 + i * (W - 44) / 16, YB - 44, z + 36, X0 + 30 + i * (W - 44) / 16, YB - 18, z + 44); }
        for (let i = 0; i < 16; i++) { const x = X0 + 30 + i * (W - 60) / 15, ln = H - 240 - (i % 3) * 80; a.box(x - 4, YB - 62, Z1 - 100 - ln + 40, x + 4, YB - 44, Z1 - 100 + 40); a.box(x - 10, YB - 72, Z1 - 140 - ln + 100, x + 10, YB - 44, Z1 - 100 - ln + 130); a.box(x - 10, YB - 72, Z1 - 140, x + 10, YB - 44, Z1 - 110); a.cyl(x, YB - 72, Z1 - 100 - ln + 50, Z1 - 100 - ln + 40, 0.1, 3); a.ell(x, YB - 78, Z1 - 100 - ln + 90, 6, 10, 6, 6, 4); }
        a.rect(X0, YB - 40, X1, YB, 'EQUIP-DETAIL'); return a.log('Added the back board with two notched rails and sixteen bar clamps with fixed and sliding heads and screw handles (plan and 3D).'); }
      const zb = Z0 + 120; a.box(X0 + 20, YF + 30, zb - 30, X1 - 20, YB - 30, zb); caster4(a, X0 + 20, X1 - 20, YF + 30, YB - 30, 40); for (const x of [X0 + 60, X1 - 60]) { a.tube([[x, YF + 60, zb], [x, yc, Z1 - 60], [x, YB - 60, zb]], [12, 12, 12], 8); a.tube([[x, YF + 60, zb], [x, YB - 60, zb]], [12, 12], 8); }
      a.tube([[cx, yc, Z1 - 60], [cx, yc, Z1 - 20]], [10, 10], 8); a.tube([[X0 + 60, yc, Z1 - 60], [X1 - 60, yc, Z1 - 60]], [12, 12], 8);
      for (let i = 0; i < 3; i++) { const z = zb + 140 + i * 170, t = (z - zb) / (Z1 - 60 - zb), yo = (YB - 60 - (YF + 60)) / 2 * (1 - t); for (const s of [-1, 1]) for (const x of [X0 + 60, X1 - 60]) a.tube([[x, yc + s * yo, z], [x, yc + s * (yo + 70), z + 4]], [7, 7], 6); }
      for (let i = 0; i < 12; i++) { const lvl = i % 3, z = zb + 140 + lvl * 170 + 10, t = (z - zb) / (Z1 - 60 - zb), yo = (YB - 60 - (YF + 60)) / 2 * (1 - t) + 40, s = i < 6 ? -1 : 1, yy = yc + s * yo + (i % 2 ? 6 : -6); a.xcyl(X0 + 40, X1 - 40, yy, z + 10, 10, 8); a.box(X0 + 20, yy - 16, z - 24, X0 + 56, yy + 16, z + 40); a.box(X0 + 80 + (i % 4) * 30, yy - 16, z - 24, X0 + 110 + (i % 4) * 30, yy + 16, z + 40); a.ell(X0 + 100 + (i % 4) * 30, yy, z + 56, 8, 8, 12, 6, 4); }
      a.rect(X0 + 20, YF + 30, X1 - 20, YB - 30, 'EQUIP-DETAIL'); a.log('Added the A-frame on a caster base, peg pairs on each side, twelve pipe clamps with head and tail stops and the push handle (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic welding table',
    desc: (v) => `${v.w} in steel welding table: a 10 mm plate top with a grid of clamp slots and a ground lug, four square-tube legs with a lower frame and levelling feet${v.drawer ? ', a lower plate shelf and a two-door and drawer cabinet at one end' : ' and a vise mounting plate at one corner'}.`,
    vs: WT.map(([l, p]) => [l, p.w, p.d, p.h, 0, p]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, yc = YF / 2; a.outline(); const zt = Z1 - 12, ns = m.floor((W - 60) / 56);
      for (let i = 0; i <= ns; i++) a.box(X0 + 10 + i * (W - 20) / (ns + 1) + 0, YF + 10, zt, X0 + 10 + (i + 1) * (W - 20) / (ns + 1) - 16, YB - 10, Z1); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10); for (let i = 0; i <= ns; i++) a.line(X0 + 10 + (i + 1) * (W - 20) / (ns + 1) - 8, YF + 20, X0 + 10 + (i + 1) * (W - 20) / (ns + 1) - 8, YB - 20, 'EQUIP-DETAIL');
      a.box(X0 + 10, YF + 10, zt - 8, X1 - 10, YB - 10, zt); a.box(X0 + 10, YF + 10, zt - 40, X1 - 10, YF + 30, zt - 8); a.box(X0 + 10, YB - 30, zt - 40, X1 - 10, YB - 10, zt - 8);
      for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 40], [X1 - 40, YB - 40]]) { a.box(x - 25, y - 25, Z0 + 20, x + 25, y + 25, zt - 40); a.cyl(x, y, Z0, Z0 + 20, 20, 10); a.cyl(x, y, Z0 + 10, Z0 + 20, 32, 10); }
      for (const y of [YF + 40, YB - 40]) a.box(X0 + 40, y - 18, Z0 + 120, X1 - 40, y + 18, Z0 + 156); for (const x of [X0 + 40, X1 - 40]) a.box(x - 18, YF + 40, Z0 + 120, x + 18, YB - 40, Z0 + 156);
      a.cyl(X1 - 50, YF + 60, Z1, Z1 + 0.01, 0.01, 3); a.box(X1 - 34, YF + 50, zt - 40, X1 - 10, YF + 70, zt - 8); a.cyl(X1 - 6, YF + 60, zt - 28, zt - 18, 8, 8);
      if (v.drawer) { a.box(X0 + 70, YF + 60, Z0 + 164, cx + 120, YB - 60, Z0 + 180); subCab(a, X1 - 40 - 520, 490, Z0 + 160, zt - 40 - Z0 - 160, { drawers: 1, drawerH: 150, doors: 1, pull: 'bar', hinge: 'R' }, YF + 50); }
      else { a.box(X0 + 14, YF + 14, zt - 8, X0 + 160, YF + 160, zt); a.box(X0 + 14, YF + 14, Z1 - 0, X0 + 160, YF + 160, Z1 + 0); }
      a.log('Added the slotted plate top with ground lug, frame, square-tube legs with feet, lower frame' + (v.drawer ? ', plate shelf and the drawer and door cabinet' : ' and the vise plate') + ' (plan and 3D).');
    } }),
];

// @@END
const ALL = [...HAND, ...POWER, ...MACH, ...STORE];
export default ALL;

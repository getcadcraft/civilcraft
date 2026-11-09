/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, tools: hand tools, power tools, workshop machines, tool storage. Original geometry; generic shapes by type and size, no maker or model. */
import { fam, cab, Acc } from './r4-kit.mjs';

const IN = 25.4, FT = 304.8, m = Math, PI = m.PI;

// ------------------------------------------------------------------------------------------ helpers
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
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
/** a base disc with a short post (the tool rests on the post top at z = Z0 + h) */
function stand(a, cx, cy, r, h) { r = m.min(r, a.D / 2 - 3, a.W / 2 - 3); a.cyl(cx, cy, a.Z0, a.Z0 + 14, r, 22); a.cyl(cx, cy, a.Z0 + 14, a.Z0 + h, 12, 10); a.circ(cx, cy, r, 'EQUIP-DETAIL'); }
/** a rounded slab handle for power tools etc: stacked boxes approximating a rounded profile (x0..x1, y centred, z0..z1) */
function rbox(a, x0, y0, z0, x1, y1, z1, r = 10) { a.box(x0 + r, y0, z0, x1 - r, y1, z1); a.box(x0, y0 + r, z0 + r, x1, y1 - r, z1 - r); a.box(x0 + r, y0 + r * 0.3, z0 - 0, x1 - r, y1 - r * 0.3, z1); }
function cylZ(a, x, y, z0, z1, r, seg = 14) { a.cyl(x, y, z0, z1, r, seg); }
/** an oval (stadium) grip tube from p to q (3D) with a given radius, slightly swollen in the middle */
function grip(a, p, q, r, sides = 10) { const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2]; a.tube([p, mid, q], [r * 0.9, r * 1.08, r * 0.9], sides); }

// ------------------------------------------------------------------------------------------ hand tools
const HAND = [
  fam({ cat: 'tools/hand', title: 'Generic hammer on stand',
    desc: (v) => `${v.kind} hammer, ${v.len} in overall, standing on a small stand: a tapered handle with a wrapped grip and ${v.type === 'sledge' ? 'a heavy double-faced steel head' : v.type === 'peen' ? 'a flat striking face on one side and a rounded peen on the other' : 'a striking face on one side and a ' + (v.type === 'framing' ? 'straight' : 'curved') + ' split claw on the other, with an eye block around the handle'}.`,
    vs: [['claw, 16 oz, 13 in', 8, 5, 14.5, 0, { kind: 'Claw', type: 'claw', len: 13, hl: 330 }], ['framing, 22 oz, 16 in', 9, 5, 17.5, 0, { kind: 'Framing', type: 'framing', len: 16, hl: 406 }],
      ['ball-peen, 12 oz, 11 in', 6, 5, 12.5, 0, { kind: 'Ball-peen', type: 'peen', len: 11, hl: 280 }], ['sledge, 4 lb, 16 in', 6, 5, 17.5, 0, { kind: 'Sledge', type: 'sledge', len: 16, hl: 406 }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 70, hl = a.H - 70 - (v.type === 'sledge' ? 62 : 64), zt = zb + hl; a.outline(); stand(a, cx, cy, 80, 70);
      a.tube([[cx, cy, zb], [cx, cy, zb + hl * 0.35], [cx, cy, zb + hl * 0.7], [cx, cy, zt]], [17, 14, 12.5, 13], 12); a.tube([[cx, cy, zb], [cx, cy, zb + hl * 0.34]], [19, 17.5], 12); a.cyl(cx, cy, zb - 6, zb + 4, 20, 12);
      if (v.type === 'sledge') { a.xcyl(cx - 60, cx + 60, cy, zt + 20, 36, 18); a.xcyl(cx - 68, cx - 60, cy, zt + 20, 32, 18); a.xcyl(cx + 60, cx + 68, cy, zt + 20, 32, 18); a.box(cx - 24, cy - 24, zt - 4, cx + 24, cy + 24, zt + 20); a.rect(cx - 68, cy - 36, cx + 68, cy + 36); return a.log('Added the stand, handle with grip and the double-faced head (plan and 3D).'); }
      a.box(cx - 17, cy - 17, zt - 4, cx + 17, cy + 17, zt + 46); a.rect(cx - 17, cy - 17, cx + 17, cy + 17, 'EQUIP');
      if (v.type === 'peen') { a.xcyl(cx - 8, cx + 40, cy, zt + 24, 17, 16); a.xcyl(cx + 40, cx + 52, cy, zt + 24, 15, 16); a.xcyl(cx - 12, cx - 8, cy, zt + 24, 8, 12); a.tube([[cx - 8, cy, zt + 24], [cx - 36, cy, zt + 24]], [14, 17], 12); a.ell(cx - 56, cy, zt + 24, 20, 20, 20, 12, 8); a.rect(cx - 76, cy - 20, cx + 52, cy + 20); return a.log('Added the stand, handle with grip, eye block, striking face and ball peen (plan and 3D).'); }
      const L = v.type === 'framing' ? 1.25 : 1;
      a.xcyl(cx + 12, cx + 56, cy, zt + 26, 20 * L * 0.9, 16); a.xcyl(cx + 52, cx + 62, cy, zt + 26, 17, 16); a.box(cx + 12, cy - 17, zt + 6, cx + 20, cy + 17, zt + 46);
      const cl = v.type === 'framing' ? [[cx - 14, zt + 40], [cx - 80, zt + 52], [cx - 150, zt + 40]] : [[cx - 14, zt + 40], [cx - 70, zt + 52], [cx - 120, zt + 20], [cx - 135, zt - 15]];
      for (const sy of [-1, 1]) a.tube(cl.map(([x, z]) => [x, cy + sy * 7, z]), cl.map((_, i) => 12 - i * 2.2), 8); a.box(cx - 14, cy - 17, zt + 8, cx - 4, cy + 17, zt + 46);
      if (v.type === 'framing') for (let i = 0; i < 4; i++) a.box(cx + 62 + 0, cy - 12 + i * 6, zt + 16, cx + 63, cy - 9 + i * 6, zt + 36);
      a.rect(cx - 150 * (v.type === 'framing' ? 1 : 0.9), cy - 20, cx + 62, cy + 20, 'EQUIP-DETAIL'); a.log('Added the stand, handle with grip, eye block, striking face and split claw (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic spanner on stand',
    desc: (v) => v.adj ? `Adjustable spanner ${v.L} in long on a stand: a flat tapered handle with a hang hole, a fixed jaw, a sliding jaw and a thumb wheel on the worm screw.` : `Combination spanner for ${v.sz} mm nuts, ${v.L} in long, on a stand: a ring end at the bottom, a flat tapered shank and an open jaw head at the top.`,
    vs: [['combination, 10 mm', 6, 4, 7.5, 0, { sz: 10, L: 6.3 }], ['combination, 19 mm', 10, 4, 11.5, 0, { sz: 19, L: 10.2 }], ['adjustable, 10 in', 4, 4, 11.5, 0, { adj: true, L: 10, sz: 30 }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, th = 8, zb = Z0 + 60, L = v.L * IN; a.outline(); stand(a, cx, cy, 70, 60);
      if (v.adj) {
        const hw = 15, z1 = zb + L - 135; prismY(a, [[cx - hw, zb], [cx + hw, zb], [cx + hw * 0.7, z1], [cx - hw * 0.7, z1]], cy - 7, cy + 7); a.ycyl(cy - 8, cy + 8, cx, zb + 24, 5, 10);
        const hz = z1, jw = v.sz * 0.55; a.box(cx - 30, cy - 7, hz, cx + 30, cy + 7, hz + 50); a.box(cx - 30, cy - 7, hz + 50, cx - 8, cy + 7, hz + 130); a.box(cx + 8, cy - 7, hz + 60, cx + 30, cy + 7, hz + 130);
        a.cyl(cx + 40, cy, hz - 6, hz + 56, 7, 10); a.cyl(cx + 40, cy, hz + 6, hz + 40, 12, 14); a.circ(cx + 40, cy, 12, 'EQUIP-DETAIL'); a.rect(cx - hw, cy - 7, cx + hw, cy + 7);
        return a.log('Added the stand, handle with hang hole, fixed and sliding jaws and the thumb wheel (plan and 3D).');
      }
      const s = v.sz, rr = s * 0.95, hr = s * 0.9, z1 = zb + L - hr * 2.4, zc = zb + rr;
      ring(a, 'xz', cx, cy, zc, rr * 0.72, th / 2 + 1, 24, 6); a.cyl(cx, cy, zb, zb + 1, 1, 3);
      prismY(a, [[cx - s * 0.3, zc + rr * 0.6], [cx + s * 0.3, zc + rr * 0.6], [cx + s * 0.28, z1], [cx - s * 0.28, z1]], cy - th / 2, cy + th / 2);
      const jz = z1; a.box(cx - hr, cy - th / 2, jz, cx + hr, cy + th / 2, jz + hr * 0.7); a.box(cx - hr, cy - th / 2, jz + hr * 0.7, cx - s / 2, cy + th / 2, jz + hr * 2.4); a.box(cx + s / 2, cy - th / 2, jz + hr * 0.7, cx + hr, cy + th / 2, jz + hr * 2.4);
      a.rect(cx - hr, cy - th / 2, cx + hr, cy + th / 2); a.log('Added the stand, ring end, tapered shank and open jaw head (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic screwdriver on stand',
    desc: (v) => `${v.kind} screwdriver, ${v.len} in overall, on a stand: a ribbed handle with a rounded cap, a collar and a ${v.tip === 'flat' ? 'flat blade tip' : v.tip === 'cross' ? 'cross-point tip with four wings' : 'small flat tip on a slim shaft'}.`,
    vs: [['slotted, 6 in blade', 4, 3, 12, 0, { kind: 'Slotted', tip: 'flat', len: 11, sl: 152, hr: 17 }], ['cross-point, 4 in blade', 4, 3, 9.5, 0, { kind: 'Cross-point', tip: 'cross', len: 9, sl: 102, hr: 16 }], ['precision, 3 in blade', 3, 3, 6, 0, { kind: 'Precision', tip: 'fine', len: 5.5, sl: 76, hr: 8 }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 60, hl = v.len * IN - v.sl, r = v.hr; a.outline(); stand(a, cx, cy, 60, 60);
      a.tube([[cx, cy, zb], [cx, cy, zb + 6], [cx, cy, zb + hl * 0.25], [cx, cy, zb + hl * 0.75], [cx, cy, zb + hl * 0.95], [cx, cy, zb + hl]], [r * 0.55, r * 0.95, r * 1.12, r * 1.1, r * 0.8, r * 0.55], 14);
      for (let i = 0; i < 6; i++) { const t = (i / 6) * 2 * PI; a.tube([[cx + m.cos(t) * r * 1.1, cy + m.sin(t) * r * 1.1, zb + hl * 0.28], [cx + m.cos(t) * r * 1.1, cy + m.sin(t) * r * 1.1, zb + hl * 0.72]], [1.8, 1.8], 4); }
      a.cyl(cx, cy, zb + hl, zb + hl + r * 1.3, r * 0.45, 10); const sr = v.tip === 'fine' ? 2.4 : 4.5, zt = zb + hl + v.sl; a.cyl(cx, cy, zb + hl, zt - 14, sr, 10);
      if (v.tip === 'flat') a.box(cx - 8, cy - 1.8, zt - 24, cx + 8, cy + 1.8, zt); else if (v.tip === 'fine') a.box(cx - 3, cy - 0.8, zt - 10, cx + 3, cy + 0.8, zt); else { a.box(cx - 4.5, cy - 1.2, zt - 24, cx + 4.5, cy + 1.2, zt); a.box(cx - 1.2, cy - 4.5, zt - 24, cx + 1.2, cy + 4.5, zt); }
      a.circ(cx, cy, r * 1.1, 'EQUIP'); a.log('Added the stand, ribbed handle with cap, collar, shaft and tip (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic pliers on stand',
    desc: (v) => `${v.kind} pliers, ${v.len} in long, standing on a stand with the jaws up: two handles with grips, a pivot rivet, ${v.kind === 'Long-nose' ? 'long tapered jaws' : v.kind === 'Diagonal cutter' ? 'angled cutting jaws' : 'flat gripping jaws with a pipe notch and a cutter at the joint'}.`,
    vs: [['combination, 8 in', 4, 3, 9.2, 0, { kind: 'Combination', len: 8 }], ['long-nose, 6 in', 3, 3, 7.2, 0, { kind: 'Long-nose', len: 6 }], ['diagonal cutter, 7 in', 4, 3, 8.2, 0, { kind: 'Diagonal cutter', len: 7 }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 60, L = v.len * IN, hl = L * 0.5, th = 14; a.outline(); stand(a, cx, cy, 60, 60);
      const jl = L - hl, zp = zb + hl;
      for (const s of [-1, 1]) {
        a.tube([[cx + s * 22, cy, zb], [cx + s * 22, cy, zb + hl * 0.3], [cx + s * 12, cy, zp - 15]], [10, 11, 8], 10); a.tube([[cx + s * 22, cy, zb], [cx + s * 22.5, cy, zb + hl * 0.62]], [12, 12.5], 10);
        const jw = v.kind === 'Long-nose' ? [[0.5, 0.15], [0.9, 0.04]] : v.kind === 'Diagonal cutter' ? [[0.4, 0.3], [0.9, 0.22]] : [[0.4, 0.28], [0.95, 0.2]];
        prismY(a, [[cx + s * 14, zp - 12], [cx + s * 2, zp - 12], [cx + s * jw[1][1] * jl * 0.05 + s * 1, zp + jl * 0.9], [cx + s * 12 + (v.kind === 'Diagonal cutter' ? s * 14 : 0), zp + jl * (v.kind === 'Diagonal cutter' ? 0.55 : 0.9)]].map(([x, z]) => [x, z]), cy - th / 2, cy + th / 2);
      }
      a.ycyl(cy - th / 2 - 2, cy + th / 2 + 2, cx, zp, 11, 12); a.box(cx - 26, cy - th / 2, zp - 18, cx + 26, cy + th / 2, zp + 6);
      a.rect(cx - 30, cy - th / 2, cx + 30, cy + th / 2); a.log('Added the stand, two handles with grips, pivot rivet and the jaws (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic handsaw',
    desc: (v) => `${v.kind}, ${v.len} in overall, standing on its handle on a stand: ${v.type === 'hack' ? 'a tubular frame with a thumb-screw tension nut, a thin blade between pins and a pistol handle' : 'a tapered steel blade with a toothed edge and a closed handle with a hand hole and a rivet plate'}.`,
    vs: [['panel saw, 20 in blade', 8, 4, 32, 0, { kind: 'Panel saw', len: 26, bl: 508, type: 'panel' }], ['back saw, 14 in blade', 8, 4, 24, 0, { kind: 'Back saw', len: 18, bl: 356, type: 'back' }], ['hacksaw, 12 in blade', 17, 4, 12, 0, { kind: 'Hacksaw', len: 16, bl: 300, type: 'hack' }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 60; a.outline(); stand(a, v.type === 'hack' ? cx + 170 : cx, cy, 70, 60);
      if (v.type === 'hack') {
        const xh = cx + 170, xl = cx - 190, zbl = zb + 130; a.D; a.cyl(xl, cy, Z0, zbl - 6, 7, 8); a.cyl(xl, cy, Z0, Z0 + 12, 30, 12);
        a.tube([[xh, cy, zb], [xh + 6, cy, zb + 60], [xh, cy, zb + 125]], [16, 18, 15], 12); a.box(xh - 18, cy - 14, zb + 118, xh + 18, cy + 14, zb + 140);
        a.tube([[xh - 20, cy, zb + 135], [xh - 55, cy, zb + 250], [xl + 30, cy, zb + 250], [xl, cy, zbl + 6]], [10, 10, 10, 10], 8);
        a.box(xl - 18, cy - 10, zbl - 10, xl + 8, cy + 10, zbl + 22); a.cyl(xl - 14, cy, zbl + 22, zbl + 40, 12, 10); a.box(xh - 30, cy - 9, zbl - 12, xh - 6, cy + 9, zbl + 14);
        a.box(xl, cy - 0.7, zbl, xh - 20, cy + 0.7, zbl + 13); for (let k = 0; k < 40; k++) a.box(xl + 20 + k * 7, cy - 0.7, zbl - 2, xl + 23 + k * 7, cy + 0.7, zbl);
        a.rect(xl - 18, cy - 10, xh + 18, cy + 10); a.circ(xh, cy, 16, 'EQUIP-DETAIL');
        return a.log('Added the post and stand, pistol handle, tube frame, tension nut and the toothed blade (plan and 3D).');
      }
      const hl = 150, bl = v.bl, zt = zb + hl + bl, h0 = v.type === 'back' ? 52 : 64, h1 = v.type === 'back' ? 52 : 32;
      prismY(a, [[cx - 40, zb], [cx + 40, zb], [cx + 52, zb + hl * 0.65], [cx + 50, zb + hl], [cx - 40, zb + hl], [cx - 52, zb + hl * 0.65]], cy - 11, cy + 11); a.ycyl(cy - 12, cy + 12, cx, zb + hl * 0.52, 18, 14); a.circ(cx, cy, 14, 'EQUIP-DETAIL');
      for (const dz of [0.15, 0.85]) a.ycyl(cy - 12, cy + 12, cx - 18, zb + hl * dz, 4, 8);
      prismY(a, [[cx - 50, zb + hl], [cx + 50 + 0, zb + hl], [cx + h1 / 2 + 0, zt], [cx - h1 * 0.5, zt]].slice(0, 4), cy - 1.2, cy + 1.2);
      for (let i = 0; i < 24; i++) { const z = zb + hl + 14 + i * ((bl - 28) / 24); a.prism([[cx + 50 - (50 - h1 / 2) * (z - zb - hl) / bl + 0, cy - 1.2], [cx + 50 - (50 - h1 / 2) * (z - zb - hl) / bl + 8, cy], [cx + 50 - (50 - h1 / 2) * (z - zb - hl) / bl, cy + 1.2]], z, z + 6); }
      if (v.type === 'back') a.box(cx - 52, cy - 5, zb + hl + 20, cx + 52, cy + 5, zt - 4 - 0);
      a.rect(cx - 52, cy - 11, cx + 52, cy + 11); a.log('Added the stand, closed handle with hand hole, the blade with teeth' + (v.type === 'back' ? ' and the stiffening back' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic wood chisel on stand',
    desc: (v) => `Bevel-edge wood chisel with a ${v.bw} in wide blade, ${v.len} in overall, on a stand: a round-topped handle with a hoop ferrule, a collar and a flat steel blade with ground edges.`,
    vs: [['1/2 in blade', 3, 3, 11, 0, { bw: 0.5, len: 10 }], ['1 in blade', 3, 3, 12.5, 0, { bw: 1, len: 11.5 }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 60, bw = v.bw * IN, L = v.len * IN, hl = L * 0.48; a.outline(); stand(a, cx, cy, 60, 60);
      a.tube([[cx, cy, zb], [cx, cy, zb + 8], [cx, cy, zb + hl * 0.3], [cx, cy, zb + hl * 0.8], [cx, cy, zb + hl]], [11, 16, 17, 15, 10], 12); a.cyl(cx, cy, zb + hl - 6, zb + hl + 14, 12, 12); a.cyl(cx, cy, zb + hl * 0.78, zb + hl * 0.84, 17.5, 12);
      prismY(a, [[cx - 5, zb + hl], [cx + 5, zb + hl], [cx + bw / 2 * 0.7, zb + hl + (L - hl) * 0.6], [cx + bw / 2, zb + L], [cx - bw / 2, zb + L], [cx - bw / 2 * 0.7, zb + hl + (L - hl) * 0.6]], cy - 2.2, cy + 2.2);
      a.box(cx - bw / 2, cy - 2.2, zb + L - 14, cx + bw / 2, cy + 2.2, zb + L); a.rect(cx - 17, cy - 17, cx + 17, cy + 17); a.log('Added the stand, round-topped handle with ferrule, collar and the flat blade (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic bench plane',
    desc: (v) => `${v.kind}, ${v.len} in long, resting on its sole: a cast body with a flat sole and a mouth, a lever cap and blade, an adjuster wheel, ${v.tote ? 'a rear tote handle and a front knob' : 'a palm rest at the back and a finger recess at the front'}.`,
    vs: [['block plane, 7 in', 3, 7, 3.2, 0, { kind: 'Block plane', len: 7, tote: false }], ['jack plane, 14 in', 3, 14, 6.2, 0, { kind: 'Jack plane', len: 14, tote: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, cx, W } = a, L = v.len * IN, hw = W / 2 - 14, y0 = YF + 12, y1 = YB - 12; a.outline();
      a.box(cx - hw, y0, Z0, cx + hw, y1, Z0 + 18); a.box(cx - hw + 4, y0 + L * 0.3, Z0 + 18, cx - hw + 14, y1 - L * 0.1, Z0 + 58); a.box(cx + hw - 14, y0 + L * 0.3, Z0 + 18, cx + hw - 4, y1 - L * 0.1, Z0 + 58);
      a.box(cx - hw, y0 + L * 0.05, Z0 + 18, cx + hw, y0 + L * 0.3, Z0 + 30); a.box(cx - hw, y1 - L * 0.1, Z0 + 18, cx + hw, y1, Z0 + 32);
      prismX(a, [[y0 + L * 0.32, Z0 + 18], [y0 + L * 0.6, Z0 + 18], [y0 + L * 0.55, Z0 + 52], [y0 + L * 0.44, Z0 + 58]], cx - hw + 12, cx + hw - 12);
      prismX(a, [[y0 + L * 0.5, Z0 + 52], [y0 + L * 0.62, Z0 + 40], [y0 + L * 0.62, Z0 + 18], [y0 + L * 0.35, Z0 + 18]].slice(0, 0).concat([[y0 + L * 0.34, Z0 + 18], [y0 + L * 0.75, Z0 + 94 + (v.tote ? 20 : 0)], [y0 + L * 0.8, Z0 + 94 + (v.tote ? 20 : 0)], [y0 + L * 0.38, Z0 + 18]]), cx - 8, cx + 8);
      a.ycyl(y0 + L * 0.3, y0 + L * 0.3 + 6, cx, Z0 + 52, 16, 14);
      if (v.tote) { prismX(a, [[y1 - 14, Z0 + 28], [y1 - L * 0.12, Z0 + 28], [y1 - L * 0.1, Z0 + 135], [y1 - L * 0.04, Z0 + 140], [y1, Z0 + 100]], cx - 12, cx + 12); a.ell(cx, y0 + L * 0.1, Z0 + 55, 14, 14, 24, 10, 6); a.cyl(cx, y0 + L * 0.1, Z0 + 28, Z0 + 40, 14, 10); }
      a.rect(cx - hw, y0, cx + hw, y1); a.line(cx - hw + 6, y0 + L * 0.3, cx + hw - 6, y0 + L * 0.3, 'EQUIP-DETAIL'); a.log('Added the cast body and sole, side walls, lever cap and blade, adjuster wheel and handles (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic try square',
    desc: (v) => v.frame ? `Framing square with a ${v.bl} in body and a ${v.tl} in tongue: a flat steel L with graduation lines on the face, standing on its tongue edge on a stand.` : `Combination square with a ${v.bl} in blade: a ruled steel blade with a slot, a cast head with a 90 degree and a 45 degree face, a spirit level vial and a locking knob.`,
    vs: [['combination, 12 in blade', 12, 3, 14, 0, { bl: 12, tl: 0 }], ['framing, 24 x 16 in', 18, 3, 26, 0, { frame: true, bl: 24, tl: 16 }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 60; a.outline(); stand(a, cx, cy, 80, 60);
      if (v.frame) { const bl = 24 * IN, tl = 16 * IN, w = 50, t = 6; prismY(a, [[cx - tl / 2, zb], [cx - tl / 2 + w, zb], [cx - tl / 2 + w, zb + bl - w], [cx - tl / 2 + w, zb + bl]].slice(0, 0).concat([[cx - tl / 2, zb], [cx - tl / 2 + w, zb], [cx - tl / 2 + w, zb + bl], [cx - tl / 2, zb + bl]]), cy - t / 2, cy + t / 2);
        prismY(a, [[cx - tl / 2 + w, zb], [cx + tl / 2, zb], [cx + tl / 2, zb + 40], [cx - tl / 2 + w, zb + 40]], cy - t / 2, cy + t / 2); for (let i = 1; i < 24; i++) a.box(cx - tl / 2 + (i % 4 === 0 ? 4 : 20), cy - t / 2 - 0.4, zb + i * IN - 1, cx - tl / 2 + w - 4, cy - t / 2, zb + i * IN + 1);
        for (let i = 1; i < 16; i++) a.box(cx - tl / 2 + w + i * IN - 1, cy - t / 2 - 0.4, zb + 4, cx - tl / 2 + w + i * IN + 1, cy - t / 2, zb + 30); a.rect(cx - tl / 2, cy - t / 2, cx + tl / 2, cy + t / 2); return a.log('Added the stand, the long body and the tongue with graduation marks (plan and 3D).'); }
      const bl = 12 * IN; a.box(cx - 14, cy - 2.5, zb + 6, cx + 14, cy + 2.5, zb + 6 + bl); for (let i = 0; i < 24; i++) a.box(cx - 14, cy - 2.7, zb + 20 + i * (IN / 2), cx - 14 + (i % 2 ? 8 : 14), cy - 2.5, zb + 21 + i * (IN / 2)); a.box(cx - 4, cy - 2.7, zb + 40, cx + 4, cy - 2.5, zb + bl - 20);
      prismY(a, [[cx - 40, zb + 6], [cx + 40, zb + 6], [cx + 40, zb + 6 + 36], [cx - 40 + 30, zb + 6 + 66]].slice(0, 4).concat([[cx - 40, zb + 6 + 66]]), cy - 12, cy + 12); a.ell(cx, cy, zb + 40, 10, 10, 6, 10, 6); a.cyl(cx + 0, cy - 12, zb + 70, zb + 76, 12, 12);
      a.ycyl(cy - 24, cy - 12, cx + 24, zb + 50, 12, 12); a.rect(cx - 40, cy - 12, cx + 40, cy + 12); a.log('Added the stand, the ruled blade, the cast head with level vial and the locking knob (plan and 3D).');
    } }),

  fam({ cat: 'tools/hand', title: 'Generic bench clamp',
    desc: (v) => `${v.kind}, ${v.cap} in capacity: ${v.g ? 'a cast C frame with a screw, a swivel pad and a cross handle' : 'a steel bar with a fixed jaw, a sliding jaw, a screw with a handle and a pad'}, standing on its jaw foot.`,
    vs: [['bar clamp, 12 in', 8, 3, 18, 0, { kind: 'Bar clamp', cap: 12 }], ['bar clamp, 24 in', 8, 3, 30, 0, { kind: 'Bar clamp', cap: 24 }], ['G clamp, 6 in', 8, 3, 11, 0, { kind: 'G clamp', cap: 6, g: true }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, L = v.cap * IN; a.outline();
      if (v.g) {
        const R = L * 0.5; a.box(cx - 70, cy - 12, Z0, cx + 80, cy + 12, Z0 + 28); prismY(a, [[cx - 70, Z0], [cx - 40, Z0], [cx - 40, Z0 + L + 60], [cx - 70, Z0 + L + 60]], cy - 12, cy + 12); a.box(cx - 70, cy - 12, Z0 + L + 60, cx + 80, cy + 12, Z0 + L + 88);
        a.cyl(cx + 40, cy, Z0 + 20, Z0 + L + 100, 7, 10); a.cyl(cx + 40, cy, Z0 + 28, Z0 + 56, 20, 12); a.xcyl(cx + 10, cx + 70, cy, Z0 + L + 110, 5, 8); a.ell(cx + 40, cy, Z0 + L + 111, 9, 9, 9, 8, 5); a.rect(cx - 70, cy - 12, cx + 80, cy + 12);
        return a.log('Added the cast C frame, the screw with swivel pad, the cross handle and foot (plan and 3D).');
      }
      a.box(cx - 24, cy - 8, Z0, cx + 24, cy + 8, Z0 + 14); a.box(cx - 100, cy - 10, Z0 + 14, cx - 20, cy + 10, Z0 + 56); a.box(cx - 100, cy - 10, Z0 + 56, cx + 24, cy + 10, Z0 + 14 + L + 40);
      a.box(cx + 20, cy - 8, Z0 + 20, cx + 24, cy + 8, Z0 + 14 + L + 6);
      a.box(cx - 14, cy - 3, Z0 + 14, cx - 10, cy + 3, Z0 + 14 + L + 160);
      a.prism([[cx - 36, cy - 12], [cx + 40, cy - 12], [cx + 40, cy + 12], [cx - 36, cy + 12]], Z0 + L - 100, Z0 + L - 20);
      a.box(cx - 30, cy - 12, Z0 + L - 100, cx + 40, cy + 12, Z0 + L - 20); a.cyl(cx, cy, Z0 + L + 40, Z0 + L + 140, 8, 10); a.xcyl(cx - 50, cx + 50, cy, Z0 + L + 150, 7, 8); a.cyl(cx, cy, Z0 + L + 20, Z0 + L + 40, 16, 10); a.ell(cx - 50, cy, Z0 + L + 150, 12, 12, 12, 8, 5); a.ell(cx + 50, cy, Z0 + L + 150, 12, 12, 12, 8, 5); a.rect(cx - 100, cy - 10, cx + 24, cy + 10);
      a.log('Added the foot, fixed jaw, bar, sliding jaw, screw with pad and the cross handle (plan and 3D).');
    } }),
];


// ------------------------------------------------------------------------------------------ power tools
/** a pistol-grip body: motor/body axis along X at height zb, from x0 (front) to x1 (back); handle down to the floor on a battery or foot */
function pistol(a, o) {
  const { Z0, cx } = a, cy = a.YF / 2, zb = Z0 + o.zb, hx = o.hx, hr = o.hr ?? 22;
  grip(a, [hx, cy, zb - o.Rm * 0.7], [hx + o.lean, cy, Z0 + o.bat], hr);
  a.box(hx - o.bw / 2 + o.lean, cy - o.bd / 2, Z0, hx + o.bw / 2 + o.lean, cy + o.bd / 2, Z0 + o.bat); a.rect(hx - o.bw / 2 + o.lean, cy - o.bd / 2, hx + o.bw / 2 + o.lean, cy + o.bd / 2, 'EQUIP');
  a.box(hx - o.bw * 0.45 + o.lean, cy - o.bd / 2 - 2, Z0 + o.bat - 14, hx + o.bw * 0.45 + o.lean, cy + o.bd / 2 + 2, Z0 + o.bat - 10);
  if (o.trigger !== false) { a.box(hx - hr * 1.5, cy - hr * 0.3, zb - o.Rm * 0.7 - 36, hx - hr * 0.85, cy + hr * 0.3, zb - o.Rm * 0.7 - 2); }
}
const POWER = [
  fam({ cat: 'tools/power', title: 'Generic drill driver',
    desc: (v) => `${v.kind}: a keyless chuck with a clutch ring, a gear housing, a motor body with vents, a pistol grip with a trigger and a forward and reverse switch, ${v.cord ? 'a corded base with a strain relief and a looped cord, a side handle and a depth rod' : 'a slide-on battery pack at the foot and a work light above the trigger'}.`,
    vs: [['cordless compact, 12 volt class', 7.5, 3.4, 8.6, 0, { kind: 'Compact cordless drill driver', L: 7.5, Rm: 31, bat: 62, bw: 55, bd: 40 }], ['cordless, 18 volt class, 1/2 in chuck', 9.5, 3.8, 9.8, 0, { kind: 'Cordless drill driver', L: 9.5, Rm: 37, bat: 74, bw: 70, bd: 50 }], ['corded hammer drill, 1/2 in chuck', 14, 5.8, 9.8, 0, { kind: 'Corded hammer drill', L: 11.5, Rm: 42, bat: 40, bw: 54, bd: 48, cord: true }]],
    build: (a, v) => {
      const { X0, X1, Z0, cx, W, H } = a, cy = a.YF / 2, L = v.L * IN, Rm = v.Rm, zb = H * 0.74 - (v.cord ? 0 : 0), xf = cx - L / 2; a.outline();
      const cl = L * 0.17; a.xcyl(xf, xf + cl, cy, Z0 + zb, Rm * 0.58, 14); a.xcyl(xf + cl * 0.55, xf + cl, cy, Z0 + zb, Rm * 0.66, 14); a.xcyl(xf - 22, xf, cy, Z0 + zb, Rm * 0.2, 8);
      for (let i = 0; i < 3; i++) { const t = (i / 3) * 2 * PI + 0.4; a.tube([[xf + 4, cy + m.cos(t) * Rm * 0.35, Z0 + zb + m.sin(t) * Rm * 0.35], [xf - 20, cy + m.cos(t) * Rm * 0.18, Z0 + zb + m.sin(t) * Rm * 0.18]], [3, 2], 4); }
      a.xcyl(xf + cl, xf + cl + L * 0.15, cy, Z0 + zb, Rm * 0.96, 16); ring(a, 'yz', xf + cl + L * 0.08, cy, Z0 + zb, Rm * 0.96, 3, 20, 5);
      a.tube([[xf + cl + L * 0.15, cy, Z0 + zb], [xf + L * 0.55, cy, Z0 + zb], [cx + L * 0.5 - 6, cy, Z0 + zb]], [Rm, Rm * 1.12, Rm * 0.9], 16);
      for (let i = 0; i < 5; i++) a.box(xf + L * 0.38 + i * 12, cy - Rm * 1.14, Z0 + zb - Rm * 0.2, xf + L * 0.38 + i * 12 + 4, cy - Rm * 1.1, Z0 + zb + Rm * 0.5);
      pistol(a, { zb, hx: xf + L * 0.56, Rm, lean: v.cord ? 0 : 8, bat: v.bat, bw: v.bw, bd: v.bd, hr: Rm * 0.62 });
      a.box(xf + L * 0.38, cy - 8, Z0 + zb + Rm * 0.95, xf + L * 0.38 + 26, cy + 8, Z0 + zb + Rm * 1.05); a.box(xf + cl + 6, cy - 10, Z0 + zb - Rm * 1.05, xf + cl + 38, cy + 10, Z0 + zb - Rm * 0.9);
      if (v.cord) { a.tube([[xf + L * 0.56, cy, Z0 + v.bat], [xf + L * 0.56 + 40, cy + 30, Z0 + 10], [xf + L * 0.56 + 120, cy + 60, Z0 + 8]], [10, 6, 5], 8); a.tube([[xf + cl + 20, cy, Z0 + zb - Rm], [xf + cl + 20, cy - 30, Z0 + zb - Rm - 100]], [14, 16], 8); a.tube([[xf + cl + 22, cy, Z0 + zb + Rm * 0.1], [xf - 34, cy - Rm * 1.2 * 0, Z0 + zb + Rm * 0.1]], [3, 3], 5); a.xcyl(xf + 6, xf + 60, cy - Rm * 1.4, Z0 + zb + Rm * 0.9, 4, 6); }
      a.rect(xf - 20, cy - Rm, cx + L / 2, cy + Rm, 'EQUIP-DETAIL'); a.log('Added the chuck, gear housing, motor body, pistol grip with trigger and ' + (v.cord ? 'cord, side handle and depth rod' : 'battery pack') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic angle grinder',
    desc: (v) => `Angle grinder for ${v.dia} in discs: a motor body with vent slots and a rear cap, a gear head with a spindle and flange, a half-round wheel guard, a ${v.dia} in abrasive disc and a side handle screwed into the head, with a paddle switch under the body.`,
    vs: [['4.5 in disc', 13, 6.5, 4.5, 0, { dia: 4.5, Rm: 38, L: 11.5 }], ['5 in disc', 14, 7.5, 4.8, 0, { dia: 5, Rm: 40, L: 12.2 }], ['7 in disc', 18, 9.5, 5.5, 0, { dia: 7, Rm: 46, L: 15.4 }]],
    build: (a, v) => {
      const { Z0, cx, W } = a, cy = a.YF / 2, Rm = v.Rm, R = (v.dia * IN) / 2, L = v.L * IN, xf = cx - L / 2 + R * 0.7, zd = Z0 + 4; a.outline();
      a.cyl(xf, cy, zd, zd + 4, R, 36); a.cyl(xf, cy, zd + 4, zd + 14, R * 0.2, 16); ring(a, 'xy', xf, cy, zd + 2, R, 0.5, 20, 4);
      const zg = zd + 18; prismX(a, [[cy - R * 0.1, zg], [cy + R * 0.5, zg], [cy + R * 0.5, zg + 30], [cy - R * 0.1, zg + 30]], xf - R * 0.2, xf + R * 0.2);
      a.cyl(xf, cy, zg, zg + 34, R + 6, 36); a.cyl(xf, cy, zg + 34, zg + 46, R * 0.9, 36); a.cyl(xf, cy, zg + 46, zg + 66, R * 0.45, 20);
      a.ell(xf, cy, zg + 80, R * 0.5, R * 0.5, Rm * 1.15, 16, 8); a.cyl(xf, cy, zg + 66, zg + 94, R * 0.28, 14);
      const zm = zg + 88; a.tube([[xf + R * 0.1, cy, zm], [xf + L * 0.3, cy, zm], [cx + L / 2 - 28, cy, zm]], [Rm * 1.05, Rm * 1.12, Rm * 0.95], 16); a.cyl(cx + L / 2 - 28, cy, zm, zm + 0.01, 1, 3);
      a.ell(cx + L / 2 - 28, cy, zm, 28, Rm * 0.95, Rm * 0.95, 8, 6); a.box(cx + L / 2 - 50, cy - Rm * 0.6, Z0, cx + L / 2 - 6, cy + Rm * 0.6, zm - Rm * 0.5);
      for (let i = 0; i < 6; i++) a.box(xf + L * 0.28 + i * 12, cy - Rm * 1.15, zm - Rm * 0.2, xf + L * 0.28 + i * 12 + 4, cy - Rm * 1.1, zm + Rm * 0.5);
      a.box(xf + L * 0.35, cy - Rm * 0.8, zm - Rm * 1.12, xf + L * 0.35 + L * 0.28, cy + Rm * 0.8, zm - Rm * 0.85);
      const sy = cy + Rm * 1.8; a.tube([[xf + 10, cy, zg + 70], [xf + 10, cy + Rm * 1.4, zg + 70]], [8, 8], 6); a.tube([[xf + 10, cy + Rm * 1.4, zg + 70], [xf + 10, cy + Rm * 2.6, zg + 80]], [14, 15], 10);
      a.circ(xf, cy, R, 'EQUIP'); a.rect(xf, cy - Rm, cx + L / 2, cy + Rm, 'EQUIP-DETAIL'); a.log('Added the disc, wheel guard, gear head, motor body with vents, paddle switch, side handle and rear cap (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic circular saw',
    desc: (v) => `${v.kind}: a flat shoe plate with a blade slot, a ${v.dia} in toothed blade behind a fixed upper guard with a spring lower guard, a side-mounted motor with vents, a rear D handle with trigger, a front knob and a depth lever.`,
    vs: [['cordless, 6.5 in blade', 13, 9, 9.5, 0, { kind: 'Cordless circular saw', dia: 6.5, bat: true }], ['corded, 7.25 in blade', 15, 10, 10.5, 0, { kind: 'Corded circular saw', dia: 7.25 }], ['corded, 10.25 in blade', 18, 12.5, 13, 0, { kind: 'Large circular saw', dia: 10.25 }]],
    build: (a, v) => {
      const { X0, X1, Z0, cx, W, D, H } = a, cy = a.YF / 2, R = (v.dia * IN) / 2, sh = 6; a.outline();
      const sw = W * 0.8, sd = D * 0.62; a.box(cx - sw / 2, cy - sd / 2, Z0, cx + sw / 2, cy + sd / 2, Z0 + sh);
      a.rect(cx - sw / 2, cy - sd / 2, cx + sw / 2, cy + sd / 2); a.rect(cx - sw * 0.4, cy - 3, cx + sw * 0.4, cy + 3, 'EQUIP-DETAIL');
      const zc = Z0 + sh + R - 4;
      a.ycyl(cy - 1.2, cy + 1.2, cx, zc, R, 40); ring(a, 'xz', cx, cy, zc, R - 2, 0.6, 40, 4);
      for (let i = 0; i < 36; i++) { const t = (i / 36) * 2 * PI; a.box(cx + m.cos(t) * R - 2, cy - 1.3, zc + m.sin(t) * R - 2, cx + m.cos(t) * R + 2, cy + 1.3, zc + m.sin(t) * R + 2); }
      const g0 = cy - sd * 0.18;   // upper guard: half shell as a ring of stacked ycyls
      for (let k = 0; k < 18; k++) { const t = ((k / 18) * PI) + 0.0, t2 = ((k + 1) / 18) * PI; a.prism([[cx + m.cos(t) * (R + 12), g0], [cx + m.cos(t2) * (R + 12), g0], [cx + m.cos(t2) * (R + 12), g0 + sd * 0.18 + 24], [cx + m.cos(t) * (R + 12), g0 + sd * 0.18 + 24]], zc + m.sin(t) * (R + 12) - 1, zc + m.sin(t2) * (R + 12) + 1); }
      a.box(cx - R - 12, g0 - 4, zc - 3, cx + R + 12, g0 + sd * 0.18 + 24, zc + 2);
      const mx = cx, my = cy + sd * 0.18 + 24 + 4; a.ycyl(my, my + D * 0.22, cx + R * 0.1, zc + R * 0.2, R * 0.4, 18); a.ycyl(my + D * 0.22, my + D * 0.22 + 6, cx + R * 0.1, zc + R * 0.2, R * 0.3, 14);
      const zt = zc + R * 0.95; a.tube([[cx - W * 0.28, cy + sd * 0.18, zt - 20], [cx - W * 0.32, cy + sd * 0.18, zt + 52], [cx - W * 0.1, cy + sd * 0.18, zt + 62], [cx + W * 0.2, cy + sd * 0.18, zt + 50], [cx + W * 0.28, cy + sd * 0.18, zt - 10]], [16, 16, 16, 16, 16], 10);
      a.box(cx + W * 0.27, cy + sd * 0.18 - 14, Z0 + sh, cx + W * 0.34, cy + sd * 0.18 + 14, zt - 10); if (v.bat) a.box(cx + W * 0.24, cy + sd * 0.18 - 28, Z0 + sh + 30, cx + W * 0.42, cy + sd * 0.18 + 28, Z0 + sh + 85);
      a.cyl(cx - W * 0.35, cy - sd * 0.1, Z0 + sh, Z0 + sh + 36, 9, 8); a.ell(cx - W * 0.35, cy - sd * 0.1, Z0 + sh + 52, 22, 22, 28, 10, 7); a.box(cx - W * 0.1, cy - sd * 0.5, Z0 + sh, cx - W * 0.1 + 12, cy - sd * 0.42, Z0 + sh + 40);
      a.log('Added the shoe plate, toothed blade, fixed upper guard, motor, D handle with trigger, front knob and depth lever (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic jigsaw',
    desc: (v) => `${v.kind}: a flat shoe plate with a blade slot, a thin blade in a roller guide above the plate, a gear head with an orbit dial, a ${v.top ? 'top bow handle with a thumb trigger' : 'barrel body held in the hand with a rear cord strain relief'} and a motor housing with vents.`,
    vs: [['top-handle, corded', 12, 4.3, 8.6, 0, { kind: 'Top-handle jigsaw', top: true }], ['barrel-grip, corded', 15, 4.6, 6.5, 0, { kind: 'Barrel-grip jigsaw', top: false }]],
    build: (a, v) => {
      const { Z0, cx, W, H } = a, cy = a.YF / 2, L = W; a.outline(); a.box(cx - L * 0.28, cy - 52, Z0, cx + L * 0.28, cy + 52, Z0 + 5); a.rect(cx - L * 0.28, cy - 52, cx + L * 0.28, cy + 52);
      a.box(cx - L * 0.28 + 4, cy - 4, Z0 + 5, cx - L * 0.28 + 50, cy + 4, Z0 + 12); a.box(cx - L * 0.2, cy - 1.2, Z0 + 12, cx - L * 0.2 + 6, cy + 1.2, Z0 + 124);
      a.ycyl(cy - 7, cy + 7, cx - L * 0.2 + 3, Z0 + 14, 9, 10);
      const hz = Z0 + (v.top ? 140 : 54);
      a.box(cx - L * 0.25, cy - 38, Z0 + 12, cx - L * 0.05, cy + 38, hz + (v.top ? 0 : 40)); a.ell(cx - L * 0.15, cy, hz + (v.top ? 30 : 36), L * 0.12, 44, v.top ? 38 : 40, 14, 8);
      if (v.top) { a.tube([[cx - L * 0.2, cy, hz + 50], [cx - L * 0.22, cy, Z0 + H - 24], [cx + L * 0.12, cy, Z0 + H - 14], [cx + L * 0.3, cy, Z0 + H - 50], [cx + L * 0.26, cy, hz - 20]], [24, 26, 26, 26, 22], 12); a.box(cx + L * 0.12, cy - 10, Z0 + H - 70, cx + L * 0.2, cy + 10, Z0 + H - 40); a.tube([[cx + L * 0.28, cy, hz], [cx + L * 0.38, cy, hz - 20]], [10, 6], 8); }
      else { a.tube([[cx - L * 0.05, cy, hz + 36], [cx + L * 0.1, cy, hz + 36], [cx + L * 0.46, cy, hz + 36]], [37, 40, 33], 16); a.tube([[cx + L * 0.46, cy, hz + 36], [cx + L * 0.5 - 4, cy, hz + 36]], [14, 8], 8); a.box(cx + L * 0.1, cy - 8, hz + 76, cx + L * 0.2, cy + 8, hz + 84); }
      for (let i = 0; i < 4; i++) a.box(cx - L * 0.22 + i * 12, cy - 40, hz + 4, cx - L * 0.22 + i * 12 + 4, cy + 40, hz + 30);
      a.box(cx - L * 0.19, cy - 14, Z0 + 14, cx - L * 0.1, cy + 14, Z0 + 28); a.log('Added the shoe plate, blade and roller guide, gear head, motor body, ' + (v.top ? 'top bow handle with trigger' : 'barrel grip') + ' and vents (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic reciprocating saw',
    desc: (v) => `${v.kind}: a long gear head with an adjustable shoe at the front, a blade clamp and a straight blade, a motor body with vents, a pistol grip with trigger and ${v.bat ? 'a slide-on battery foot' : 'a cord strain relief at the tail'}.`,
    vs: [['cordless, compact', 16, 3.4, 8.5, 0, { kind: 'Compact cordless reciprocating saw', bat: true }], ['corded, full size', 20, 4.2, 9, 0, { kind: 'Corded reciprocating saw', bat: false }]],
    build: (a, v) => {
      const { Z0, cx, W, H } = a, cy = a.YF / 2, Rm = 34, zb = H * 0.62, xf = cx - W / 2; a.outline();
      a.box(xf + 10, cy - 3, Z0 + zb - 6, xf + W * 0.5, cy + 3, Z0 + zb + 8); for (let i = 0; i < 18; i++) a.box(xf + 14 + i * 9, cy - 3, Z0 + zb - 8, xf + 16 + i * 9, cy + 3, Z0 + zb - 6);
      a.box(xf + W * 0.18, cy - 28, Z0 + zb - 30, xf + W * 0.22, cy + 28, Z0 + zb + 30); a.tube([[xf + W * 0.2, cy, Z0 + zb + 34], [xf + W * 0.3, cy, Z0 + zb + 14]], [10, 10], 6);
      a.tube([[xf + W * 0.3, cy, Z0 + zb], [xf + W * 0.45, cy, Z0 + zb], [xf + W * 0.95, cy, Z0 + zb]], [Rm * 0.75, Rm * 1.1, Rm * 0.85], 16); a.ell(xf + W * 0.97, cy, Z0 + zb, 30, Rm * 0.85, Rm * 0.85, 8, 6);
      for (let i = 0; i < 5; i++) a.box(xf + W * 0.55 + i * 12, cy - Rm * 1.14, Z0 + zb - Rm * 0.3, xf + W * 0.55 + i * 12 + 4, cy - Rm * 1.1, Z0 + zb + Rm * 0.5);
      a.box(xf + W * 0.3, cy - Rm * 0.9, Z0 + zb - Rm * 0.4, xf + W * 0.45, cy + Rm * 0.9, Z0 + zb + Rm * 0.8);
      pistol(a, { zb, hx: xf + W * 0.72, Rm: Rm * 0.9, lean: 16, bat: v.bat ? 56 : 12, bw: v.bat ? 60 : 40, bd: v.bat ? 40 : 30, hr: 21 }); a.rect(xf + W * 0.18, cy - 28, xf + W * 0.22, cy + 28, 'EQUIP-DETAIL');
      a.log('Added the shoe, blade clamp and blade, gear head, motor body with vents, pistol grip with trigger and ' + (v.bat ? 'battery foot' : 'tail') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic sander',
    desc: (v) => v.kind === 'belt' ? 'Belt sander: a flat sanding belt looped over a front and a rear roller, a cast body above the belt, a rear D handle with a trigger, a front knob, a dust port and a belt tracking knob.' : v.kind === 'orbit' ? 'Random-orbit sander: a round 5 in hook-and-loop pad with dust holes, a low dome body with a palm grip and a rear dust port.' : 'Quarter-sheet sander: a rectangular pad with two spring clamps, a ribbed palm body, a power cord and a dust port.',
    vs: [['random orbit, 5 in pad', 6.2, 6.2, 5.2, 0, { kind: 'orbit' }], ['quarter sheet, palm', 5.2, 7.2, 5.2, 0, { kind: 'quarter' }], ['belt sander, 3 x 21 in', 6, 15, 7.5, 0, { kind: 'belt' }]],
    build: (a, v) => {
      const { Z0, cx, YF, D, W, H } = a, cy = YF / 2; a.outline();
      if (v.kind === 'orbit') {
        const R = 63; a.cyl(cx, cy, Z0, Z0 + 10, R, 28); for (let i = 0; i < 8; i++) { const t = (i / 8) * 2 * PI; a.circ(cx + m.cos(t) * 32, cy + m.sin(t) * 32, 4, 'EQUIP-DETAIL'); }
        a.cyl(cx, cy, Z0 + 10, Z0 + 22, R * 0.92, 28); a.ell(cx, cy, Z0 + 66, R * 0.85, R * 0.85, 46, 18, 10); a.cyl(cx, cy, Z0 + 22, Z0 + 40, R * 0.8, 20); a.ell(cx, cy, Z0 + 114, 42, 42, 22, 12, 7); a.box(cx - 10, cy + R * 0.6, Z0 + 28, cx + 10, cy + R + 18, Z0 + 52); a.cyl(cx - R * 0.45, cy - R * 0.35, Z0 + 40, Z0 + 62, 8, 8);
        a.circ(cx, cy, R, 'EQUIP'); return a.log('Added the round pad with dust holes, the dome body with palm grip and the dust port (plan and 3D).');
      }
      if (v.kind === 'quarter') {
        const pw = W * 0.9, pd = D * 0.64; a.box(cx - pw / 2, cy - D * 0.45, Z0, cx + pw / 2, cy + D * 0.19, Z0 + 12); a.box(cx - pw / 2, cy - D * 0.45, Z0 + 12, cx + pw / 2, cy - D * 0.45 + 8, Z0 + 38); a.box(cx - pw / 2, cy + D * 0.19 - 8, Z0 + 12, cx + pw / 2, cy + D * 0.19, Z0 + 38);
        for (let i = 0; i < 6; i++) a.circ(cx - pw * 0.36 + i * pw * 0.145, cy - D * 0.13, 5, 'EQUIP-DETAIL');
        a.ell(cx, cy - D * 0.12, Z0 + 76, pw * 0.4, D * 0.28, 44, 16, 9); a.box(cx - pw * 0.3, cy - D * 0.3, Z0 + 28, cx + pw * 0.3, cy, Z0 + 56); a.box(cx - 14, cy + D * 0.19, Z0 + 18, cx + 14, cy + D * 0.36, Z0 + 48);
        a.tube([[cx, cy + D * 0.36, Z0 + 30], [cx + 20, cy + D * 0.45, Z0 + 8], [cx + 60, cy + D * 0.48, Z0 + 6]], [5, 4, 4], 6); a.rect(cx - pw / 2, cy - D * 0.45, cx + pw / 2, cy + D * 0.19); return a.log('Added the pad with clamps, the ribbed palm body, dust port and cord (plan and 3D).');
      }
      const xb0 = cx - W * 0.42, xb1 = cx + W * 0.42, yb0 = YF + 40, yb1 = cy + D * 0.4, rr = 34;
      for (const y of [yb0 + rr, yb1 - rr]) { a.xcyl(xb0, xb1, y, Z0 + rr + 2, rr, 18); }
      a.box(xb0 - 2, yb0 + rr, Z0, xb1 + 2, yb1 - rr, Z0 + 3); a.box(xb0 - 2, yb0 + rr, Z0 + 2 * rr + 2, xb1 + 2, yb1 - rr, Z0 + 2 * rr + 5); a.rect(xb0, yb0, xb1, yb1);
      a.box(cx - W * 0.4, yb0 + rr + 10, Z0 + 2 * rr + 8, cx + W * 0.4 - 30, yb1 - rr - 10, Z0 + 2 * rr + 70); a.ell(cx - 10, cy + D * 0.1, Z0 + 2 * rr + 78, W * 0.3, D * 0.2, 36, 14, 8);
      a.tube([[cx + W * 0.1, cy + D * 0.38, Z0 + 2 * rr + 70], [cx + W * 0.12, cy + D * 0.46, Z0 + 2 * rr + 150], [cx + W * 0.0, cy + D * 0.47, Z0 + 2 * rr + 166], [cx - W * 0.1, cy + D * 0.4, Z0 + 2 * rr + 110]], [20, 20, 20, 18], 10);
      a.ell(cx, yb0 + rr + 20, Z0 + 2 * rr + 60, 26, 26, 28, 10, 7); a.box(cx + W * 0.25, cy + D * 0.1, Z0 + 2 * rr + 40, cx + W * 0.42, cy + D * 0.28, Z0 + 2 * rr + 70); a.xcyl(cx + W * 0.4, cx + W * 0.46, yb0 + 70, Z0 + 2 * rr + 40, 14, 10);
      a.log('Added the belt over two rollers, the cast body, D handle with trigger, front knob, dust port and tracking knob (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic router',
    desc: (v) => v.plunge ? 'Plunge router: a round base plate with a bit hole, two spring-loaded columns, a motor barrel with vents, two side handles with knobs, a depth turret and a cutter below the collet.' : 'Compact trim router: a small round base with a bit hole, a one-hand motor barrel with vents, a depth ring, an on switch on the barrel and a cutter below the collet.',
    vs: [['plunge router, 1/2 in collet', 11.5, 8.8, 9.2, 0, { plunge: true, R: 3.9 }], ['trim router, 1/4 in collet', 6.5, 6.5, 8, 0, { plunge: false, R: 2.5 }]],
    build: (a, v) => {
      const { Z0, cx, YF, W, H } = a, cy = YF / 2, Rb = v.R * IN * 0.5 * 1.04, zbp = Z0 + 38; a.outline();
      a.cyl(cx, cy, zbp, zbp + 8, Rb, 32); a.cyl(cx, cy, Z0 + 4, zbp, Rb * 0.5 * 0.3, 10); a.cone(cx, cy, Z0 + 3, Z0 + 38, 7, 7, 8); a.circ(cx, cy, Rb, 'EQUIP'); a.circ(cx, cy, 14, 'EQUIP-DETAIL');
      const Rm = v.plunge ? 55 : 38; a.tube([[cx, cy, zbp + 8], [cx, cy, zbp + 60], [cx, cy, Z0 + H - 8]], [Rm * 1.05, Rm, Rm * 0.92], 18); ring(a, 'xy', cx, cy, zbp + 70, Rm * 1.04, 3, 28, 5);
      for (let i = 0; i < 6; i++) a.box(cx - Rm * 1.05 + (i * 2 * Rm * 1.05) / 6.5, cy - Rm * 1.08, zbp + 110, cx - Rm * 1.05 + (i * 2 * Rm * 1.05) / 6.5 + 4, cy - Rm * 0.9, zbp + 190);
      if (v.plunge) {
        for (const s of [-1, 1]) { a.cyl(cx + s * (Rb * 0.78), cy, zbp + 8, Z0 + H - 36, 9, 10); a.tube([[cx + s * Rb * 0.78, cy, zbp + 20], [cx + s * Rb * 0.78, cy, zbp + 70]], [12, 12], 10); }
        for (const s of [-1, 1]) { const hx = cx + s * (W / 2 - 24); a.tube([[cx + s * (Rm + 2), cy, Z0 + H - 80], [hx, cy, Z0 + H - 80], [hx, cy, Z0 + H - 96]], [14, 14, 14], 10); a.ell(hx, cy, Z0 + H - 80, 18, 18, 26, 10, 6); a.circ(hx, cy, 18, 'EQUIP-DETAIL'); }
        a.box(cx - 24, cy - Rm - 22, Z0 + H - 80, cx + 24, cy - Rm, Z0 + H - 50); a.cyl(cx, cy - Rm * 1.4, zbp + 90, zbp + 150, 10, 8);
      } else { a.box(cx + Rm * 0.3, cy - Rm - 12, Z0 + H - 100, cx + Rm * 0.9, cy - Rm, Z0 + H - 80); ring(a, 'xy', cx, cy, zbp + 200, Rm * 1.08, 3, 24, 5); }
      a.log('Added the base plate with bit hole, cutter, motor barrel with vents' + (v.plunge ? ', two plunge columns, handles with knobs and the depth turret' : ', depth ring and switch') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic pneumatic nailer',
    desc: (v) => `${v.kind}: a cylindrical body with an end cap, a rear handle with trigger, an angled magazine holding a nail strip, a nose with a spring contact tip, an air fitting at the foot of the grip and an adjustable exhaust cap.`,
    vs: [['framing nailer, 21 degree, 3-1/2 in', 15, 5.5, 14, 0, { kind: 'Framing nailer', Rm: 54, mag: 1, len: 3.5 }], ['brad nailer, 18 gauge', 11, 3.6, 11, 0, { kind: 'Brad nailer', Rm: 38, mag: 0, len: 2 }]],
    build: (a, v) => {
      const { Z0, cx, YF, W, H } = a, cy = YF / 2, Rm = v.Rm, nl = v.len * IN * 0.7, xr = cx + W * 0.4; a.outline();
      const zb = Z0 + H - Rm - 10; a.tube([[cx - W * 0.2, cy, zb], [cx - W * 0.2 + 6, cy, zb], [xr - Rm * 0.3, cy, zb]], [Rm, Rm, Rm], 18); a.ell(xr - Rm * 0.2, cy, zb, Rm * 0.5, Rm, Rm, 14, 10); a.cyl(cx - W * 0.2 + 4, cy, zb - Rm - 4, zb - Rm + 6, 3, 4);
      a.tube([[cx - W * 0.2, cy, zb - Rm * 0.2], [cx - W * 0.2, cy, Z0 + nl + 12], [cx - W * 0.2, cy, Z0 + 8]], [Rm * 0.75, Rm * 0.4, Rm * 0.18], 14); a.cone(cx - W * 0.2, cy, Z0, Z0 + 12, 12, 6, 10);
      a.tube([[cx - W * 0.2, cy, Z0 + nl * 0.5], [cx - W * 0.2, cy, Z0 + 8]], [Rm * 0.32, 14], 10); a.rect(cx - W * 0.2 - Rm * 0.3, cy - 14, cx - W * 0.2 + Rm * 0.3, cy + 14, 'EQUIP-DETAIL');
      const gx = xr - Rm * 1.5; grip(a, [gx, cy, zb - Rm * 0.8], [gx + 10, cy, zb - Rm * 0.8 - 90], 20, 10); a.tube([[gx + 8, cy, zb - Rm * 0.8 - 90], [gx + 22, cy, zb - Rm * 0.8 - 118]], [22, 22], 10); a.cyl(gx + 22, cy, Z0 + 70, zb - Rm * 0.8 - 118, 10, 8); a.xcyl(gx + 14, gx + 52, cy, Z0 + 70, 8, 8); a.box(gx - 50, cy - 8, zb - Rm - 34, gx - 24, cy + 8, zb - Rm * 0.8 - 4);
      const ml = v.mag ? 300 : 210, ang = v.mag ? -0.38 : 0;
      a.tube([[cx - W * 0.2 - 4, cy + 0, Z0 + nl * 0.55], [cx - W * 0.2 + ml * m.cos(ang), cy + 0, Z0 + nl * 0.55 + ml * m.sin(ang) * -1]], [Rm * 0.16, Rm * 0.16], 6);
      a.box(cx - W * 0.2 + Rm * 0.7, cy - 18, Z0 + 4, cx - W * 0.2 + Rm * 0.7 + (v.mag ? 280 : 190), cy + 18, Z0 + 4 + 36 + (v.mag ? 80 : 0));
      a.log('Added the body, end cap, grip with trigger and air fitting, magazine, nose with contact tip and exhaust cap (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic heat gun',
    desc: (v) => `Heat gun, ${v.l} in long: a barrel with an air intake grille at the rear and a metal nozzle, a pistol grip with a switch slider and a cord relief, and a flat rear stand foot so it rests on the bench pointing up.`,
    vs: [['1500 watt class', 10, 3.4, 8, 0, { l: 10, Rm: 32 }], ['2000 watt class, with dial', 12, 4, 9.4, 0, { l: 12, Rm: 38, dial: true }]],
    build: (a, v) => {
      const { Z0, cx, YF, W, H } = a, cy = YF / 2, Rm = v.Rm, xf = cx - W / 2; a.outline(); const zb = Z0 + H * 0.62;
      a.tube([[xf + W * 0.1, cy, zb], [xf + W * 0.18, cy, zb], [xf + W * 0.78, cy, zb], [xf + W * 0.98, cy, zb]], [Rm * 0.58, Rm * 0.7, Rm, Rm * 0.95], 18); a.tube([[xf + 2, cy, zb], [xf + W * 0.12, cy, zb]], [Rm * 0.42, Rm * 0.55], 14); a.circ(xf + 8, cy, Rm * 0.42, 'EQUIP-DETAIL');
      ring(a, 'yz', xf + W * 0.5, cy, zb, Rm, 3, 28, 5); for (let i = 0; i < 6; i++) a.box(xf + W * 0.7 + i * 8, cy - Rm * 1.05, zb - Rm * 0.4, xf + W * 0.7 + i * 8 + 3, cy - Rm * 0.9, zb + Rm * 0.4);
      const hx = xf + W * 0.62; grip(a, [hx, cy, zb - Rm * 0.8], [hx + 14, cy, Z0 + 14], 20, 10); a.box(hx - 22, cy - 22, Z0, hx + 44, cy + 22, Z0 + 14); a.box(hx - 26, cy - 8, zb - Rm * 0.8 - 40, hx - 14, cy + 8, zb - Rm * 0.8 - 6);
      a.box(hx - 4, cy - 12, zb - Rm * 0.8 - 6, hx + 20, cy + 12, zb - Rm * 0.8 + 4); a.box(xf + W * 0.82, cy - 6, Z0, xf + W * 0.9, cy + 6, zb - Rm); a.box(xf + W * 0.8, cy - 18, Z0, xf + W * 0.93, cy + 18, Z0 + 10);
      a.box(xf + W * 0.25, cy - Rm * 1.05, zb + Rm * 0.2, xf + W * 0.36, cy - Rm * 0.9, zb + Rm * 0.5);
      if (v.dial) a.cyl(xf + W * 0.4, cy, zb + Rm, zb + Rm + 16, 14, 14);
      a.rect(xf, cy - Rm, xf + W, cy + Rm, 'EQUIP-DETAIL'); a.log('Added the barrel with nozzle, intake grille, pistol grip with switch and the rear stand foot (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic oscillating multi-tool',
    desc: (v) => `Oscillating multi-tool, ${v.kind}: a slim motor barrel with vents and a rear cap, a gear head angled down to a flat blade clamp with a ${v.blade} blade, a speed dial, a slide switch${v.cord ? ' and a cord strain relief' : ' and a slide-on battery at the tail'}.`,
    vs: [['cordless, with plunge blade', 11, 2.6, 5.2, 0, { kind: 'cordless', blade: 'plunge-cut', bat: true }], ['corded, with sanding pad', 11.5, 3.6, 5.4, 0, { kind: 'corded', blade: 'triangular sanding', cord: true }]],
    build: (a, v) => {
      const { Z0, cx, YF, W, H } = a, cy = YF / 2, Rm = 28, xf = cx - W / 2, zb = Z0 + H * 0.55; a.outline();
      a.tube([[xf + W * 0.14, cy, zb + 2], [xf + W * 0.22, cy, zb], [xf + W * 0.6, cy, zb], [xf + W * 0.98, cy, zb]], [Rm * 0.85, Rm * 1.05, Rm * 1.05, Rm * 0.88], 16);
      a.xcyl(xf + W * 0.04, xf + W * 0.22, cy, zb + 2, Rm * 0.7, 14); a.box(xf + 4, cy - 22, Z0 + 6, xf + W * 0.12, cy + 22, Z0 + 12);
      a.cyl(xf + W * 0.08, cy, Z0 + 12, zb, 22, 12); a.ell(xf + W * 0.08, cy, Z0 + 32, 30, 24, 24, 10, 7);
      a.box(xf + W * 0.02, cy - 14, Z0 + 8, xf + W * 0.18, cy + 14, Z0 + 14); a.cone(xf + W * 0.08, cy, Z0 + 2, Z0 + 8, 8, 8, 8);
      if (v.bat) a.box(xf + W * 0.78, cy - 24, zb - Rm * 1.05 - 30, xf + W * 0.98, cy + 24, zb - Rm * 0.3); else a.tube([[xf + W * 0.98, cy, zb], [xf + W * 1.0 - 4, cy, zb - 20]], [14, 8], 8);
      for (let i = 0; i < 5; i++) a.box(xf + W * 0.4 + i * 12, cy - Rm * 1.1, zb - Rm * 0.2, xf + W * 0.4 + i * 12 + 4, cy - Rm * 1.05, zb + Rm * 0.5);
      a.cyl(xf + W * 0.55, cy, zb + Rm * 1.0, zb + Rm * 1.0 + 12, 16, 14); a.box(xf + W * 0.3, cy - 8, zb + Rm * 0.95, xf + W * 0.42, cy + 8, zb + Rm * 1.1);
      a.rect(xf, cy - Rm, xf + W, cy + Rm, 'EQUIP-DETAIL'); a.log('Added the motor barrel with vents, gear head, blade clamp with blade, speed dial and switch and the ' + (v.bat ? 'battery' : 'cord relief') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/power', title: 'Generic impact driver',
    desc: 'Compact impact driver: a quarter-inch hex quick-release collet, a hammer case, a motor body with vents, a pistol grip with trigger, a forward and reverse switch and a work light, on a slide-on battery foot.',
    vs: [['cordless, 1/4 in hex', 5.8, 3, 9, 0, {}]],
    build: (a) => {
      const { Z0, cx, W, H } = a, cy = a.YF / 2, Rm = 28, zb = H * 0.74, xf = cx - W / 2; a.outline();
      a.xcyl(xf - 0, xf + 28, cy, Z0 + zb, 10, 10); a.xcyl(xf + 28, xf + 66, cy, Z0 + zb, Rm * 0.62, 14); a.xcyl(xf + 66, xf + 120, cy, Z0 + zb, Rm * 0.85, 16); ring(a, 'yz', xf + 90, cy, Z0 + zb, Rm * 0.86, 2.5, 20, 5);
      a.tube([[xf + 120, cy, Z0 + zb], [xf + W * 0.55, cy, Z0 + zb], [xf + W - 6, cy, Z0 + zb]], [Rm * 0.95, Rm * 1.05, Rm * 0.8], 16);
      for (let i = 0; i < 4; i++) a.box(xf + W * 0.5 + i * 12, cy - Rm * 1.06, Z0 + zb - Rm * 0.2, xf + W * 0.5 + i * 12 + 4, cy - Rm * 1.01, Z0 + zb + Rm * 0.5);
      pistol(a, { zb, hx: xf + W * 0.62, Rm, lean: 6, bat: 62, bw: 56, bd: 42, hr: 21 }); a.box(xf + 70, cy - 8, Z0 + zb + Rm * 0.78, xf + 96, cy + 8, Z0 + zb + Rm * 0.9); a.box(xf + 74, cy - 8, Z0 + zb - Rm * 0.95, xf + 98, cy + 8, Z0 + zb - Rm * 0.7);
      a.rect(xf, cy - Rm, xf + W, cy + Rm, 'EQUIP-DETAIL'); a.log('Added the hex collet, hammer case, motor body with vents, pistol grip with trigger, work light and battery foot (plan and 3D).');
    } }),
];


// ------------------------------------------------------------------------------------------ workshop machines
/** a flat top slab with legs: corners inset, tubes down to the floor */
function legs4(a, x0, x1, y0, y1, z0, z1, r = 20, splay = 0) { for (const [x, y, sx, sy] of [[x0, y0, -1, -1], [x1, y0, 1, -1], [x0, y1, -1, 1], [x1, y1, 1, 1]]) a.tube([[x, y, z1], [x + sx * splay, y + sy * splay, z0]], [r, r], 8); }
function handwheel(a, x, y, z, R, axis = 'y') {
  if (axis === 'y') { ring(a, 'xz', x, y, z, R, 4, 22, 5); a.ycyl(y - 8, y + 8, x, z, 12, 8); for (let i = 0; i < 4; i++) { const t = (i / 4) * PI * 2; a.tube([[x, y, z], [x + m.cos(t) * R, y, z + m.sin(t) * R]], [3, 3], 4); } a.ell(x + R * 0.7, y - 4, z + R * 0.7, 9, 9, 9, 6, 4); }
  else { ring(a, 'yz', x, y, z, R, 4, 22, 5); a.xcyl(x - 8, x + 8, y, z, 12, 8); for (let i = 0; i < 4; i++) { const t = (i / 4) * PI * 2; a.tube([[x, y, z], [x, y + m.cos(t) * R, z + m.sin(t) * R]], [3, 3], 4); } }
}
const MACH = [
  fam({ cat: 'tools/machine', title: 'Generic table saw',
    desc: (v) => `${v.kind}: a flat cast top with a throat plate and miter slot, a 10 in blade through the slot with a riving knife and clear guard, ${v.cab ? 'an enclosed cabinet base with a rear dust port, a front handwheel and a switch box' : v.jobsite ? 'a folding tube stand with cross rails, a front handwheel and a switch' : 'an open leg base with a motor under the top, a handwheel and a switch'}, and a rip fence on front and rear rails${v.ext ? ' with a right extension table' : ''}.`,
    vs: [['jobsite, folding stand', 28, 30, 38, 0, { kind: 'Jobsite table saw', jobsite: true }], ['contractor, open stand, 52 in rails', 62, 32, 40, 0, { kind: 'Contractor table saw', ext: true }], ['cabinet, 52 in rails', 72, 34, 40, 0, { kind: 'Cabinet table saw', cab: true, ext: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const zt = Z0 + H * 0.84, tw = v.jobsite ? W : v.cab ? 27 * IN : 27 * IN, td = v.jobsite ? 20 * IN : 26 * IN, ty0 = YB - 60 - td, ty1 = YB - 60, tx0 = v.ext ? X0 + 14 * IN - 0 : cx - tw / 2, tx1 = v.ext ? tx0 + tw : cx + tw / 2;
      a.box(tx0, ty0, zt - 40, tx1, ty1, zt); a.rect(tx0, ty0, tx1, ty1);
      if (v.ext) { a.box(tx1, ty0 + 20, zt - 30, X1 - 2, ty1 - 20, zt); a.rect(tx1, ty0 + 20, X1 - 2, ty1 - 20, 'EQUIP-DETAIL'); a.box(X0 + 2, ty0 + 40, zt - 30, tx0, ty1 - 40, zt); a.rect(X0 + 2, ty0 + 40, tx0, ty1 - 40, 'EQUIP-DETAIL'); }
      const bx = tx0 + tw * 0.4, R = 127; a.box(bx - 40, ty0 + td * 0.38, zt, bx + 40, ty0 + td * 0.62, zt + 3); a.xcyl(bx - 1.5, bx + 1.5, (ty0 + ty1) / 2, zt - R + 72, R, 40);
      for (let i = 0; i < 40; i++) { const t = (i / 40) * PI * 2; a.box(bx - 1.7, (ty0 + ty1) / 2 + m.cos(t) * R - 2, zt - R + 72 + m.sin(t) * R - 2, bx + 1.7, (ty0 + ty1) / 2 + m.cos(t) * R + 2, zt - R + 72 + m.sin(t) * R + 2); }
      a.line(bx, ty0, bx, ty1, 'EQUIP-DETAIL'); a.line(bx - 150, ty0, bx - 150, ty1, 'EQUIP-DETAIL');
      const by = (ty0 + ty1) / 2; a.box(bx - 1.5, by + R * 0.6, zt, bx + 1.5, by + R * 0.85, zt + R * 0.45 * 2 + 20); a.tube([[bx, by + R * 0.65, zt + 190], [bx, by - R * 0.5, zt + 120]], [7, 7], 6); a.box(bx - 40, by - R * 0.5, zt + 100, bx + 40, by + R * 0.3, zt + 120);
      const fx = bx + (v.cab ? 260 : 220), rail0 = ty0 - 20 - 30, rail1 = ty1 + 6; a.box(tx0 - 10, ty0 - 52, zt - 50, (v.ext ? X1 - 10 : tx1 + 10), ty0 - 12, zt - 8); a.tube([[tx0, ty1 + 14, zt - 20], [v.ext ? X1 - 10 : tx1 + 10, ty1 + 14, zt - 20]], [14, 14], 8);
      a.box(fx - 20, ty0 - 52, zt - 8, fx + 20, ty1 + 20, zt + 60); a.box(fx - 24, ty0 - 70, zt + 20, fx + 24, ty0 - 10, zt + 90); a.rect(fx - 20, ty0 - 52, fx + 20, ty1 + 20, 'EQUIP-DETAIL'); a.xcyl(fx - 30, fx + 30, ty0 - 62, zt + 60, 8, 6);
      handwheel(a, bx, ty0 - 12 - 8, zt - 110, 80); a.box(tx0 + 40, ty0 - 40, zt - 250, tx0 + 140, ty0 - 12, zt - 160); a.ell(tx0 + 90, ty0 - 40, zt - 200, 20, 6, 20, 8, 5);
      if (v.cab) { a.box(tx0 + 20, ty0 + 20, Z0 + 60, tx1 - 20, ty1 - 20, zt - 40); a.box(tx0 + 40, ty0 + 12, Z0, tx1 - 40, ty1 - 12, Z0 + 60); a.ycyl(ty1 - 20, ty1 + 40, bx, zt - 300, 52, 14); a.box(tx0 + 120, ty0 + 14, zt - 600, tx0 + 160, ty0 + 20, zt - 530); a.box(bx - 100, ty0 + 14, Z0 + 120, bx + 100, ty0 + 20, Z0 + 560); }
      else if (v.jobsite) { legs4(a, tx0 + 40, tx1 - 40, ty0 + 40, ty1 - 40, Z0, zt - 40, 14, 120); for (const y of [ty0 + 40, ty1 - 40]) a.tube([[tx0 + 40 - 120 * 0, y, Z0 + 120], [tx1 - 40, y, Z0 + 120]], [10, 10], 6); a.box(tx0 + 30, ty0 + 50, zt - 140, tx1 - 30, ty1 - 50, zt - 40); }
      else { legs4(a, tx0 + 40, tx1 - 40, ty0 + 40, ty1 - 40, Z0, zt - 40, 22, 20); for (const y of [ty0 + 40, ty1 - 40]) a.tube([[tx0 + 40, y, Z0 + 180], [tx1 - 40, y, Z0 + 180]], [14, 14], 8); a.box(tx0 + 40, ty0 + 160, Z0 + 90, tx1 - 40, ty1 - 160, Z0 + 160); a.xcyl(tx0 + 100, tx1 - 100, by, zt - 190, 85, 16); a.box(tx0, ty0, Z0, tx1, ty0 + 20, Z0 + 14); a.box(tx0, ty1 - 20, Z0, tx1, ty1, Z0 + 14); }
      a.log('Added the cast top and throat plate, blade with riving knife and guard, fence on rails, handwheel, switch and the ' + (v.cab ? 'enclosed cabinet with dust port' : v.jobsite ? 'folding stand' : 'open stand with motor') + (v.ext ? ' and extension tables' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic drill press',
    desc: (v) => `${v.kind}: a flat base plate, a round column, a crank-raised table with a slot, a head with a three-step belt cover and a motor on top, a quill with a keyed chuck, three feed handles with balls and a depth scale.`,
    vs: [['benchtop, 8 in swing', 16, 10, 25, 0, { kind: 'Benchtop drill press', sw: 8, hc: 0.78 }], ['benchtop, 12 in swing', 20, 14, 34, 0, { kind: 'Benchtop drill press', sw: 12, hc: 0.8 }], ['floor standing, 17 in swing', 24, 20, 66, 0, { kind: 'Floor drill press', sw: 17, hc: 0.9, floor: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const cy = YB - D * 0.28, cr = 28 + v.sw * 2;
      a.box(X0 + 30, YF + 20, Z0, X1 - 30, YB - 20, Z0 + (v.floor ? 40 : 28)); a.rect(X0 + 30, YF + 20, X1 - 30, YB - 20); a.cyl(cx, cy, Z0 + 28, Z1 - 20, cr, 20); a.circ(cx, cy, cr, 'EQUIP');
      const tz = Z0 + H * 0.44; a.box(cx - D * 0.36, cy - D * 0.36, tz, cx + D * 0.36, cy + D * 0.36 + 0, tz + 20); a.box(cx - 8, cy - D * 0.36, tz + 20, cx + 8, cy + D * 0.2, tz + 22); a.cyl(cx, cy - D * 0.36 + 40, tz - 70, tz, 5, 6); a.box(cx - cr - 30, cy - 36, tz - 60, cx + cr + 30, cy + 36, tz); a.box(cx + cr, cy - 20, tz - 90, cx + cr + 90, cy + 20, tz - 50); a.ell(cx + cr + 94, cy, tz - 70, 12, 12, 12, 8, 5); a.rect(cx - D * 0.36, cy - D * 0.36, cx + D * 0.36, cy + D * 0.36, 'EQUIP-DETAIL');
      const hz = Z1 - 190; a.box(cx - cr - 40, cy - D * 0.32, hz, cx + cr + 40, cy + D * 0.2, hz + 150); a.box(cx - cr - 50, cy - D * 0.32 - 10, hz - 10, cx + cr + 50, cy - D * 0.32, hz + 160);
      const my = cy + m.min(D * 0.2 + 60, YB - cy - 80); a.xcyl(cx - cr - 30, cx + cr + 30, my, hz + 120, 70, 18); a.box(cx - 70, cy + D * 0.2 - 4, hz + 10, cx + 70, my, hz + 100);
      a.cyl(cx, cy - D * 0.22, tz + 20, hz, 14, 10); a.cyl(cx, cy - D * 0.22, tz + 26, tz + 90, 12, 10); a.cone(cx, cy - D * 0.22, tz + 90, tz + 120, 12, 18, 10); a.cyl(cx, cy - D * 0.22, tz + 120, tz + 150, 20, 14); a.cyl(cx, cy - D * 0.22, hz - 40, hz, 22, 14);
      for (let i = 0; i < 3; i++) { const t = (i / 3) * PI * 2 + 0.6, hl = m.min(150, W * 0.22); a.tube([[cx + cr + 40, cy - D * 0.22, hz + 70], [cx + cr + 40 + m.cos(t) * hl, cy - D * 0.22 - 40, hz + 70 + m.sin(t) * hl * 0.87]], [6, 6], 6); a.ell(cx + cr + 40 + m.cos(t) * hl, cy - D * 0.22 - 40, hz + 70 + m.sin(t) * hl * 0.87, 12, 12, 12, 8, 5); }
      a.box(cx - 12, cy - cr - 30, hz + 12, cx + 12, cy - cr - 4, hz + 120); a.log('Added the base plate, column, crank table, head with belt cover and motor, quill with chuck and feed handles (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic lathe',
    desc: (v) => v.metal ? 'Bench metal lathe: a cast bed with flat ways, a headstock with a three-jaw chuck and a speed dial, a carriage with a cross slide, compound rest and tool post, a lead screw with half-nut lever, a tailstock with a quill handwheel and a stand tray.' : `Wood lathe, ${v.sw} in swing: a bed of two round bars on legs, a headstock with a drive spur and a speed dial, a tool rest on a banjo, a tailstock with a live centre and handwheel, and a motor belt cover${v.floor ? ', on a pedestal stand' : ''}.`,
    vs: [['wood, 10 in swing, bench', 40, 14, 17, 0, { sw: 10, bedL: 33 }], ['wood, 16 in swing, floor stand', 60, 20, 44, 0, { sw: 16, bedL: 50, floor: true }], ['metal bench lathe, 8 x 16 in', 44, 20, 21, 0, { metal: true, bedL: 38 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const cy = YF / 2, zb = Z0 + (v.floor ? H - 260 : 70), by0 = cy - 70, by1 = cy + 70;
      if (v.floor) for (const x of [X0 + 80, X1 - 80]) { a.box(x - 50, YF + 40, Z0, x + 50, YB - 40, Z0 + 30); a.box(x - 25, cy - 50, Z0 + 30, x + 25, cy + 50, zb - 20); } else a.box(X0 + 10, YF + 15, Z0, X1 - 10, YB - 15, Z0 + 55 - (v.metal ? 0 : 0));
      if (v.metal) a.box(X0 + 10, YF + 10, zb - 10, X1 - 10, YB - 10, zb + 40); else { for (const y of [cy - 45, cy + 45]) a.xcyl(X0 + 40, X1 - 40, y, zb + 25, 20, 12); }
      const hs = X0 + 30, hl = W * 0.2, zc = zb + (v.metal ? 160 : 100); a.box(hs, cy - 110 + 0, zb + 40, hs + hl, cy + 110, zb + (v.metal ? 240 : 190)); a.rect(hs, cy - 110, hs + hl, cy + 110);
      a.xcyl(hs + hl, hs + hl + 60, cy, zc, v.metal ? 60 : 26, 18); if (v.metal) { a.xcyl(hs + hl + 60, hs + hl + 100, cy, zc, 62, 18); for (let i = 0; i < 3; i++) { const t = (i / 3) * PI * 2; a.box(hs + hl + 70, cy + m.cos(t) * 40 - 6, zc + m.sin(t) * 40 - 6, hs + hl + 120, cy + m.cos(t) * 62 + 6, zc + m.sin(t) * 62 + 6); } } else a.cone(cx - 0 + 0, cy, zc, zc + 0.01, 1, 1, 3), a.xcyl(hs + hl + 60, hs + hl + 90, cy, zc, 10, 8);
      a.cyl(hs + hl * 0.5, cy - 112, Z0 + 0, Z0 + 0.01, 1, 3); a.cyl(hs + hl * 0.5, cy - 118, zb + 150, zb + 170, 20, 14); a.circ(hs + hl * 0.5, cy - 118, 20, 'EQUIP-DETAIL');
      if (!v.metal) a.box(hs + 10, cy + 30, zb + 190, hs + hl - 10, cy + 110, zb + 240);
      const tsx = X1 - W * 0.22; a.box(tsx, cy - 60, zb + 40 - 0, tsx + W * 0.14, cy + 60, zb + (v.metal ? 160 : 130)); a.xcyl(tsx - 70, tsx, cy, zc, v.metal ? 16 : 14, 10); a.cone(tsx - 110, cy, zc, zc + 0.01, 1, 1, 3); a.xcyl(tsx - 100, tsx - 70, cy, zc, v.metal ? 8 : 6, 8); handwheel(a, tsx + W * 0.14 + 8, cy, zc, 44, 'x');
      const cxp = cx - W * 0.05; if (v.metal) { a.box(cxp - 100, cy - 100, zb + 40, cxp + 100, cy + 100, zb + 90); a.box(cxp - 60, cy - 80, zb + 90, cxp + 60, cy + 40, zb + 110); a.box(cxp - 40, cy - 40, zb + 110, cxp + 40, cy + 20, zb + 140); a.box(cxp - 10, cy - 10, zb + 140, cxp + 10, cy + 10, zb + 210); a.xcyl(cxp - 200, cxp + 200, cy + 90, zb + 60, 10, 8); handwheel(a, cxp, cy - 112, zb + 70, 40, 'y'); a.xcyl(cxp - 130, cxp - 100, cy + 100, zb + 70, 20, 10); }
      else { a.box(cxp - 40, cy - 70, zb + 50, cxp + 40, cy - 10, zb + 80); a.cyl(cxp, cy - 40, zb + 80, zb + 140, 12, 8); a.tube([[cxp - 130, cy - 40, zb + 150], [cxp + 130, cy - 40, zb + 150]], [11, 11], 6); a.box(cxp - 12, cy - 30, zb + 140, cxp + 12, cy - 22, zb + 160); }
      a.log('Added the bed and legs or stand, headstock with spindle, ' + (v.metal ? 'chuck, carriage with cross slide and tool post, lead screw' : 'drive spur, banjo and tool rest') + ' and the tailstock with handwheel (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic milling machine',
    desc: (v) => v.knee ? 'Knee mill: a base with a tall column, a knee with a crank handle, a saddle and a long table with T slots, a ram with a swivel head, a motor on top and a quill handwheel, a spindle with collet and feed handles on the front.' : 'Benchtop mill-drill: a base with a column, a dovetail head with a motor and belt cover, a spindle with chuck, a cross table with T slots, two crank handles for X and Y and a coarse feed lever.',
    vs: [['benchtop mill-drill, 9 x 32 in table', 36, 24, 36, 0, { knee: false }], ['knee mill, 9 x 49 in table', 64, 62, 84, 0, { knee: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const cy = YB - D * 0.18, cw = v.knee ? D * 0.42 : D * 0.32;
      a.box(X0 + 30, YF + 20, Z0, X1 - 30, YB - 20, Z0 + (v.knee ? 280 : 60));
      a.box(cx - cw * 0.5, cy - cw * 0.5, Z0 + 60, cx + cw * 0.5, cy + cw * 0.5, Z1 - (v.knee ? 280 : 260)); a.rect(cx - cw * 0.5, cy - cw * 0.5, cx + cw * 0.5, cy + cw * 0.5);
      const kz = Z0 + H * (v.knee ? 0.28 : 0.2), ty = YF + D * 0.1; a.box(cx - W * 0.3, cy - D * 0.3, kz, cx + W * 0.3, cy + 0.0, kz + (v.knee ? 280 : 90)); const sz = kz + (v.knee ? 280 : 90);
      a.box(cx - W * 0.28, ty, sz, cx + W * 0.28, cy - D * 0.16, sz + 90); a.box(cx - W * 0.46, ty + 20, sz + 90, cx + W * 0.46, cy - D * 0.16 - 20, sz + 150); for (let i = 0; i < 4; i++) a.line(cx - W * 0.46, ty + 60 + i * (D * 0.04), cx + W * 0.46, ty + 60 + i * (D * 0.04), 'EQUIP-DETAIL');
      for (const s of [-1, 1]) a.box(cx + s * W * 0.46 - 14, ty + 40, sz + 70, cx + s * W * 0.46 + 14, cy - D * 0.16 - 40, sz + 90); handwheel(a, cx + W * 0.46 + 20, ty + 80, sz + 100, 52, 'x');
      handwheel(a, cx + W * 0.1, ty - 10, sz + 40, 50, 'y'); if (v.knee) handwheel(a, cx - W * 0.2, ty + 20, kz + 160, 56, 'y'); a.box(cx + W * 0.1 - 14, ty - 2, sz + 36, cx + W * 0.1 + 14, ty + 4, sz + 44);
      const hz = Z1 - (v.knee ? 270 : 250); a.box(cx - cw * 0.6, cy - cw * 0.9, hz, cx + cw * 0.6, cy + cw * 0.5, hz + (v.knee ? 240 : 180)); a.cyl(cx, cy - cw * 0.45, hz - 140, hz, v.knee ? 30 : 26, 16); a.cyl(cx, cy - cw * 0.45, hz - 200, hz - 140, 14, 12); a.cone(cx, cy - cw * 0.45, hz - 230, hz - 200, 8, 15, 10);
      a.ycyl(cy + cw * 0.5, cy + cw * 0.5 + (v.knee ? 110 : 90), cx, hz + (v.knee ? 120 : 90), v.knee ? 100 : 70, 18); handwheel(a, cx + cw * 0.6 + 14, cy - cw * 0.3, hz + 100, 46, 'x');
      a.line(cx - W * 0.46, ty, cx + W * 0.46, ty, 'EQUIP'); a.log('Added the base, column, ' + (v.knee ? 'knee with crank, saddle, long table, ram head' : 'cross table with handles, dovetail head') + ', motor and the spindle with chuck (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic band saw',
    desc: (v) => `${v.sw} in wood band saw: a C-shaped cast frame with an upper and a lower wheel behind hinged doors, a tilting table with a blade slot and a miter slot, an adjustable guide post with blade guard, a tension knob, a fence, ${v.floor ? 'a steel stand with a motor cabinet and a dust port' : 'a bench base with a motor under the table'}.`,
    vs: [['10 in, benchtop', 18, 14, 30, 0, { sw: 10, floor: false, R: 127 }], ['14 in, floor stand', 24, 28, 68, 0, { sw: 14, floor: true, R: 178 }], ['18 in, heavy floor stand', 30, 34, 76, 0, { sw: 18, floor: true, R: 228 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const R = v.R, zl = Z0 + (v.floor ? H * 0.34 : 70) + R, zu = Z1 - R - 40, fy = YB - 120, fd = 70, tz = Z0 + H * (v.floor ? 0.5 : 0.42) + 20;
      if (v.floor) { a.box(X0 + 20, fy - 200, Z0 + 20, X1 - 20, fy + 130, Z0 + H * 0.34 - 10); a.box(X0 + 10, fy - 220, Z0, X1 - 10, fy + 150, Z0 + 20); a.ycyl(fy + 130, fy + 200, cx, Z0 + H * 0.2, 50, 14); a.box(cx - 120, fy - 204, Z0 + 60, cx + 120, fy - 200, Z0 + H * 0.3); } else a.box(X0 + 15, YF + 30, Z0, X1 - 15, YB - 30, Z0 + 70);
      a.box(cx - 40, fy - 30, zl - R, cx + 40, fy + 60, zu + R); a.box(cx + R * 0.55, fy - 30, zl + R * 0.3, cx + R * 0.8, fy + 60, zu); for (const [zc_] of [[zl], [zu]]) { a.ycyl(fy - 60, fy + 60, cx - R * 0.7 + (zc_ === zl ? 0 : 0), zc_, R + 8, 28); ring(a, 'xz', cx - R * 0.7, fy - 62, zc_, R, 4, 28, 5); a.circ(cx - R * 0.7, fy, 20, 'EQUIP-DETAIL'); }
      a.ycyl(fy - 66, fy - 56, cx - R * 0.7, zu, 20, 10); a.ycyl(fy - 66, fy - 56, cx - R * 0.7, zl, 20, 10); a.box(cx - R * 0.7 - R * 1.05, fy - 66, zl - R - 14, cx + R * 0.25, fy - 60, zu + R + 14);
      a.box(cx + R * 0.2, fy - 70, zl - 10, cx + R * 0.28, fy + 70, zu + 10); a.box(cx - R * 0.1 - 6, fy + 60, zl, cx + R * 0.1 + 6, fy + 160, zu);
      const bx = cx + R * 0.1; a.box(bx - 1, fy - 1, zl, bx + 1, fy + 1, zu);
      a.cyl(cx - R * 0.7, fy + 60, zu + R + 14, zu + R + 80, 22, 12); a.ell(cx - R * 0.7, fy + 60, zu + R + 84, 30, 14, 10, 8, 5);
      const tw = v.sw * IN * 0.9; a.box(bx - tw * 0.5 - 10, fy - tw * 0.5 + 40, tz - 20, bx + tw * 0.5 - 10, fy + tw * 0.5 - 10, tz); a.rect(bx - tw * 0.5 - 10, fy - tw * 0.5 + 40, bx + tw * 0.5 - 10, fy + tw * 0.5 - 10);
      a.box(bx - 6, fy - tw * 0.5 + 40, tz, bx + 6, fy - 20, tz + 3); a.box(bx - 30, fy - 24, tz - 70, bx + 30, fy + 24, tz - 20); a.tube([[bx - tw * 0.4, fy - tw * 0.45 + 40, tz - 20], [bx - tw * 0.4, fy - tw * 0.45 + 40, tz - 90]], [8, 8], 6);
      a.cyl(bx, fy - 70, tz, zu + R * 0.25, 14, 10); a.box(bx - 24, fy - 110, tz + 20, bx + 24, fy - 50, tz + 90); a.box(bx - 14, fy - 90, tz + 90, bx + 14, fy - 60, tz + 110); handwheel(a, cx - R * 0.7, fy - 80, zu + R + 40, 30, 'y');
      a.tube([[bx - 150, fy - tw * 0.5 + 30, tz], [bx - 150, fy + tw * 0.4, tz]], [10, 10], 6); a.box(bx - 200, fy - tw * 0.5 + 40, tz, bx - 120, fy + tw * 0.4, tz + 90); a.ell(cx + R * 0.45, fy - 50, zl + R * 0.1, 8, 8, 8, 6, 4);
      a.log('Added the C-frame, two wheels behind doors, table with slots, guide post and guard, tension knob, fence and the ' + (v.floor ? 'stand cabinet with dust port' : 'bench base') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic bench grinder',
    desc: (v) => `${v.sw} in bench grinder: a heavy cast base plate, a motor barrel with end bells, two ${v.sw} in wheels (coarse and fine) behind half-round guards, two tool rests with spark guards, clear eye shields and a rocker switch on the front.`,
    vs: [['6 in wheels', 18, 9, 9.5, 0, { sw: 6 }], ['8 in wheels', 24, 11, 12.5, 0, { sw: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const cy = YF / 2, R = (v.sw * IN) / 2, zc = Z0 + 40 + R * 0.92 + 20; a.box(X0 + 10, YF + 10, Z0, X1 - 10, YB - 10, Z0 + 28); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10);
      a.box(cx - W * 0.16, cy - R * 0.6, Z0 + 28, cx + W * 0.16, cy + R * 0.6, zc - R * 0.2); a.xcyl(cx - W * 0.28, cx + W * 0.28, cy, zc, R * 0.55, 20); a.box(cx - 30, cy - R * 0.62, zc - R * 0.45, cx + 30, cy - R * 0.52, zc - R * 0.2);
      for (const s of [-1, 1]) { const x = cx + s * (W * 0.28 + 30); a.xcyl(cx + s * (W * 0.28), x + s * 18, cy, zc, R * 0.45, 18);
        const x0 = x + s * 18, x1 = x0 + s * 22; a.xcyl(m.min(x0, x1), m.max(x0, x1), cy, zc, R, 36); a.xcyl(m.min(x0, x1) - 1, m.max(x0, x1) + 1, cy, zc, R * 0.25, 14); a.rect(m.min(x0, x1), cy - R, m.max(x0, x1), cy + R, 'EQUIP-DETAIL');
        const g0 = x0 - s * 14, g1 = x1 + s * 22; for (let k = 0; k < 14; k++) { const t = PI * (0.1 + (k / 14) * 1.0), t2 = PI * (0.1 + ((k + 1) / 14) * 1.0); a.prism([[m.min(g0, g1), cy + m.cos(t) * (R + 12)], [m.max(g0, g1), cy + m.cos(t) * (R + 12)], [m.max(g0, g1), cy + m.cos(t2) * (R + 12)], [m.min(g0, g1), cy + m.cos(t2) * (R + 12)]], zc + m.sin(t) * (R + 12) - 3, zc + m.sin(t2) * (R + 12) + 3); }
        a.box(m.min(x0, x1) - 10, cy - R * 0.3, zc - R * 1.05, m.max(x0, x1) + 10, cy + R * 0.3, zc - R * 0.2 - R * 0.35); a.box(m.min(g0, g1), cy - R - 14, zc + R * 0.05, m.max(g0, g1), cy - R - 6, zc + R * 0.9); a.box(m.min(x0, x1), cy - R - 30, zc - 20, m.max(x0, x1) + s * 60, cy - R + 20, zc - 10); a.box(x1 + s * 30 - 12, cy - R - 28, zc - 70, x1 + s * 30 + 12, cy - R - 20, zc - 10); }
      a.box(cx - 40, cy - R * 0.6 - 4, zc - R * 0.4, cx + 40, cy - R * 0.6, zc - R * 0.2); a.log('Added the base plate, motor barrel, two wheels with half-round guards, tool rests, eye shields and the switch (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic welder',
    desc: (v) => v.kind === 'mig' ? 'Wire-feed welder on a cart: a rectangular power case with a front panel of two selector knobs and a display, a hinged wire spool door, a wire feed handle on top, a gas bottle at the rear with a strap on a two-wheel cart, front caster and a torch cable coiled with a gun on a hook.' : v.kind === 'stick' ? 'Portable inverter stick welder: a compact case with a carry handle on top, a front panel with a current dial and two sockets, side vents and a shoulder strap loop, with a clamp lead and an electrode holder coiled on pegs.' : 'TIG welder: a bench case with a front panel of dials and sockets, a torch with a cable and a gas valve hung on a side bracket, a foot pedal on a lead and a ground clamp.',
    vs: [['wire-feed on cart, 200 amp class', 20, 36, 43, 0, { kind: 'mig' }], ['inverter stick, 160 amp class', 15, 8, 12, 0, { kind: 'stick' }], ['TIG, 200 amp class', 17, 28, 22, 0, { kind: 'tig' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const cy = YF / 2;
      if (v.kind === 'mig') {
        a.box(X0 + 20, YB - 800, Z0 + 270, X1 - 20, YB - 100, Z0 + 270 + 60); a.box(X0 + 40, YB - 700, Z0 + 330, X1 - 40, YB - 200, Z0 + 640); a.box(X0 + 40, YB - 220, Z0 + 330, X1 - 40, YB - 110, Z0 + 640);
        a.rect(X0 + 20, YB - 800, X1 - 20, YB - 100); a.box(X0 + 70, YB - 710, Z0 + 350, X1 - 70, YB - 700, Z0 + 600); for (const [dx, zz] of [[-1, 520], [1, 520]]) a.ycyl(YB - 712, YB - 700, cx + dx * 80, Z0 + zz, 22, 14); a.ell(cx, YB - 706, Z0 + 440, 22, 6, 22, 8, 5);
        a.box(X0 + 120, YB - 706, Z0 + 580, X1 - 120, YB - 698, Z0 + 625); a.tube([[X0 + 90, YB - 600, Z0 + 640], [X0 + 60, YB - 600, Z0 + 700], [X1 - 60, YB - 600, Z0 + 700], [X1 - 90, YB - 600, Z0 + 640]], [10, 10, 10, 10], 8);
        a.cyl(cx, YB - 130, Z0 + 150, Z0 + 1000 - 0, 100, 18); a.ell(cx, YB - 130, Z0 + 1000, 100, 100, 50, 14, 6); a.cyl(cx, YB - 130, Z0 + 1050, Z0 + 1090, 25, 10); a.circ(cx, YB - 130, 100, 'EQUIP');
        a.tube([[cx - 100, YB - 130, Z0 + 800], [cx - 100, YB - 380, Z0 + 700]], [14, 14], 6); a.tube([[cx + 100, YB - 130, Z0 + 800], [cx + 100, YB - 380, Z0 + 700]], [14, 14], 6);
        for (const x of [X0 + 14, X1 - 14]) a.xcyl(x - 14, x + 14, YB - 110, Z0 + 110, 110, 16); a.xcyl(cx - 140, cx + 140, YB - 110, Z0 + 110, 12, 8); a.cyl(cx, YF + 100, Z0, Z0 + 12, 12, 8); a.cyl(cx, YF + 100, Z0 + 12, Z0 + 270, 10, 8);
        ring(a, 'xz', cx + 140, YB - 800 + 20, Z0 + 520, 70, 6, 20, 5); a.box(X1 - 100, YB - 810, Z0 + 580, X1 - 40, YB - 790, Z0 + 640);
        a.tube([[cx - 140, YB - 800, Z0 + 330], [cx - 220, YB - 830, Z0 + 260], [cx - 150, YB - 850, Z0 + 230]], [10, 10, 10], 6); a.log('Added the cart, power case with front panel, wire spool door, gas bottle with strap, wheels and caster and the torch hook (plan and 3D).'); return;
      }
      if (v.kind === 'stick') {
        a.box(X0 + 10, cy - 90, Z0, X1 - 10, cy + 90, Z0 + 250); a.rect(X0 + 10, cy - 90, X1 - 10, cy + 90); for (let i = 0; i < 6; i++) a.box(X0 + 6, cy - 70 + i * 28, Z0 + 100, X0 + 10, cy - 60 + i * 28, Z0 + 200);
        a.tube([[X0 + 40, cy, Z0 + 250], [X0 + 40, cy, Z0 + 300], [X1 - 40, cy, Z0 + 300], [X1 - 40, cy, Z0 + 250]], [10, 10, 10, 10], 8); a.box(X0 + 20, cy - 92, Z0 + 150, X1 - 20, cy - 90, Z0 + 235); a.ycyl(cy - 100, cy - 90, cx - 40, Z0 + 190, 28, 18); for (const dx of [60, 120]) a.ycyl(cy - 100, cy - 90, cx + dx, Z0 + 130, 12, 12);
        a.box(X0 + 20, cy - 98, Z0 + 28, X0 + 74, cy - 90, Z0 + 88); a.ell(X1 - 40, cy, Z0 + 270, 6, 6, 6, 6, 4); a.rect(X0 + 20, cy - 98, X1 - 20, cy - 90, 'EQUIP-DETAIL');
        return a.log('Added the case with vents, carry handle, front panel with dial and sockets and the strap loops (plan and 3D).');
      }
      a.box(X0 + 20, cy - 25 - 0, Z0, X1 - 20, YB - 80, Z0 + 460); a.rect(X0 + 20, cy - 25, X1 - 20, YB - 80); a.box(X0 + 30, cy - 33, Z0 + 150, X1 - 30, cy - 25, Z0 + 420);
      for (const dx of [-130, -70, 0, 70, 130]) a.ycyl(cy - 48, cy - 33, cx + dx, Z0 + 350, 20, 14); a.box(cx - 120, cy - 38, Z0 + 250, cx + 120, cy - 33, Z0 + 310);
      for (const dx of [-110, -30, 50, 130]) a.ycyl(cy - 44, cy - 33, cx + dx, Z0 + 200, 14, 10);
      a.box(X1 - 20, YB - 380, Z0 + 180, X1 - 4, YB - 200, Z0 + 300); a.tube([[X1 - 12, YB - 340, Z0 + 300], [X1 - 12, YB - 290, Z0 + 440], [X1 - 12, YB - 240, Z0 + 440]], [10, 10, 10], 8); a.tube([[X1 - 12, YB - 340, Z0 + 270], [X1 - 60, cy + 0, Z0 + 40], [X1 - 120, cy - 60, Z0 + 6]], [8, 8, 8], 6);
      a.box(X0 + 100, YF + 20, Z0, X0 + 220, YF + 140, Z0 + 30); a.ell(X0 + 160, YF + 80, Z0 + 38, 40, 50, 18, 10, 6); a.cyl(X0 + 40, cy + 30, Z0 + 460, Z0 + 500, 8, 8);
      a.log('Added the bench case with front panel and dials, torch bracket, torch with cable, foot pedal and the ground clamp lead (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic air compressor',
    desc: (v) => `${v.kind}: ${v.horiz ? 'a horizontal tank on a steel frame' : v.pancake ? 'a round pancake tank in a handle cage' : v.twin ? 'two stacked horizontal tanks in a carry frame' : 'a vertical tank on legs'}, a belt-driven or direct-drive pump head with finned cylinders, an electric motor, a regulator with two gauges, a quick-connect outlet, a drain valve at the bottom, a pressure switch and ${v.wheels ? 'two wheels and a handle' : 'rubber feet'}.`,
    vs: [['pancake, 6 gallon', 18, 19, 18, 0, { kind: 'Pancake compressor', pancake: true, cap: 6 }], ['twin stack, 4 gallon', 22, 18, 28, 0, { kind: 'Twin-stack compressor', twin: true, cap: 4 }], ['horizontal, 30 gallon, wheels', 52, 20, 40, 0, { kind: 'Horizontal compressor', horiz: true, cap: 30, wheels: true }], ['vertical, 60 gallon, two stage', 30, 24, 66, 0, { kind: 'Vertical compressor', vert: true, cap: 60 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const cy = YF / 2;
      const gauge = (x, y, z) => { a.ycyl(y - 14, y, x, z, 22, 14); a.circ(x, y, 22, 'EQUIP-DETAIL'); };
      if (v.pancake) {
        const R = W * 0.48, zt = Z0 + 90; a.cyl(cx, cy, zt, zt + 150, R, 32); a.ell(cx, cy, zt + 150, R, R, 50, 24, 7); a.ell(cx, cy, zt, R, R, 38, 24, 5); a.circ(cx, cy, R, 'EQUIP'); for (const t of [0.8, 2.4, 3.9, 5.5]) a.cyl(cx + m.cos(t) * R * 0.78, cy + m.sin(t) * R * 0.78, Z0, zt, 18, 8);
        a.tube([[cx - R * 0.9, cy, zt + 180], [cx - R * 0.9, cy, zt + 280], [cx + R * 0.9, cy, zt + 280], [cx + R * 0.9, cy, zt + 180]], [12, 12, 12, 12], 8);
        a.box(cx - R * 0.45, cy - R * 0.5, zt + 190, cx + R * 0.45, cy + R * 0.5, zt + 250); a.ycyl(cy - R * 0.5 - 40, cy - R * 0.5, cx + R * 0.15, zt + 220, 50, 20); a.box(cx - R * 0.35, cy - R * 0.8, zt + 190, cx - R * 0.1, cy - R * 0.5, zt + 210); gauge(cx - R * 0.2, cy - R * 0.8, zt + 235); gauge(cx + R * 0.35, cy - R * 0.8, zt + 235); a.xcyl(cx + R * 0.7, cx + R * 0.7 + 26, cy - R * 0.4, zt + 170, 8, 8); a.cyl(cx - R * 0.65, cy - R * 0.2, zt - 30, zt, 6, 8);
        a.cyl(cx + R * 0.15, cy + R * 0.2, zt + 250, zt + 320, 32, 14); return a.log('Added the pancake tank with cage handle, pump head, motor shroud, two gauges, outlet, drain and feet (plan and 3D).');
      }
      if (v.vert) {
        const R = 190, zt = Z0 + 190; a.cyl(cx, cy, zt, zt + 1000, R, 28); a.ell(cx, cy, zt + 1000, R, R, 80, 22, 7); a.ell(cx, cy, zt, R, R, 70, 22, 5); a.circ(cx, cy, R, 'EQUIP');
        for (const t of [0.8, 2.4, 3.9, 5.5]) a.tube([[cx + m.cos(t) * R * 0.85, cy + m.sin(t) * R * 0.85, zt - 20], [cx + m.cos(t) * R * 1.05, cy + m.sin(t) * R * 1.05, Z0 + 14]], [16, 16], 8); for (const t of [0.8, 2.4, 3.9, 5.5]) a.box(cx + m.cos(t) * R * 1.05 - 40, cy + m.sin(t) * R * 1.05 - 40, Z0, cx + m.cos(t) * R * 1.05 + 40, cy + m.sin(t) * R * 1.05 + 40, Z0 + 14);
        const pz = zt + 1080; a.box(cx - 220, cy - 160, pz, cx + 220, cy + 160, pz + 90); a.xcyl(cx - 140, cx + 140, cy, pz + 190, 90, 18); a.xcyl(cx - 40, cx + 40, cy, pz + 190 + 0, 100, 18); for (let i = 0; i < 6; i++) a.box(cx - 140 + i * 50, cy - 95, pz + 130, cx - 140 + i * 50 + 20, cy + 95, pz + 250); a.ycyl(cy - 160, cy + 160, cx + 150, pz + 120, 60, 14); a.cyl(cx - 90, cy, pz + 110, pz + 300, 40, 12);
        a.box(cx - 170, cy - 140, pz + 90, cx - 40, cy + 140, pz + 270); a.ycyl(cy + 160, cy + 200, cx + 150, pz + 120, 40, 12); gauge(cx - 120, cy - 150, zt + 900); gauge(cx - 40, cy - 150, zt + 900); a.cyl(cx + 130, cy - R * 0.7, zt + 100, zt + 160, 8, 8); a.box(cx + 100, cy - R * 1.1, zt + 880, cx + 180, cy - R * 0.9, zt + 940);
        return a.log('Added the vertical tank on legs, the two-stage pump with fins and pulley, motor, gauges, switch and drain (plan and 3D).');
      }
      const L = W * 0.78, R = v.twin ? 76 : 130, zt = Z0 + (v.horiz ? 280 : 120);
      const tanks = v.twin ? [zt + R, zt + R * 3 + 20] : [zt + R];
      for (const z of tanks) { a.xcyl(cx - L / 2 + 20, cx + L / 2 - 20, cy, z, R, 28); a.ell(cx - L / 2 + 20, cy, z, 36, R, R, 12, 8); a.ell(cx + L / 2 - 20, cy, z, 36, R, R, 12, 8); }
      a.rect(cx - L / 2, cy - R, cx + L / 2, cy + R); const ft = v.twin ? 18 : 40;
      if (v.horiz) { for (const x of [cx - L * 0.32, cx + L * 0.32]) { a.box(x - 30, cy - R - 20, Z0 + 60, x + 30, cy + R + 20, zt + 10); a.box(x - 60, cy - R - 40, Z0, x + 60, cy + R + 40, Z0 + 20); } a.tube([[cx - L / 2 + 40, cy + R + 10, zt + 220], [cx - L / 2 - 6, cy + R + 10, zt + 80], [cx - L / 2 - 6, cy + R + 10, Z0 + 20]], [14, 14, 14], 8); a.xcyl(cx + L / 2 + 6, cx + L / 2 + 40, cy, Z0 + 100, 90, 18); }
      else { for (const sx of [-1, 1]) { a.tube([[cx + sx * L * 0.46, cy, zt + R], [cx + sx * L * 0.46, cy, Z0 + 12]], [14, 14], 8); a.box(cx + sx * L * 0.46 - 30, cy - R, Z0, cx + sx * L * 0.46 + 30, cy + R, Z0 + 12); } a.tube([[cx - L * 0.4, cy, Z1 - 10], [cx - L * 0.4, cy, Z1 - 30], [cx + L * 0.4, cy, Z1 - 30], [cx + L * 0.4, cy, Z1 - 10]], [10, 10, 10, 10], 8); }
      const zp = (v.twin ? tanks[1] + R : zt + R * 2) + 40; a.box(cx - L * 0.2, cy - 90, zp, cx + L * 0.12, cy + 90, zp + 60); a.xcyl(cx - L * 0.2, cx + L * 0.02, cy, zp + 130, 80, 16); for (let i = 0; i < 5; i++) a.box(cx - L * 0.19 + i * 38, cy - 86, zp + 90, cx - L * 0.19 + i * 38 + 14, cy + 86, zp + 180); a.xcyl(cx + L * 0.02, cx + L * 0.3, cy, zp + 110, 70, 18);
      gauge(cx - L * 0.35, cy - R - 20, zp - 30); gauge(cx - L * 0.28 + 20, cy - R - 20, zp - 30); a.box(cx + L * 0.1, cy - 70, zp - 70, cx + L * 0.2, cy + 70, zp); a.cyl(cx + L / 2 - 30, cy, Z0, Z0 + 12, 12, 8);
      a.log('Added the tank' + (v.twin ? 's in a carry frame' : '') + ', pump head with finned cylinders, motor, regulator with two gauges, outlet and the ' + (v.wheels ? 'wheels with handle' : 'feet') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/machine', title: 'Generic mitre saw',
    desc: (v) => `${v.kind}: a base with a rotating turntable and two fence wings with a blade slot, a ${v.dia} in blade under a guard, a motor on a pivot arm, a D handle with trigger, ${v.slide ? 'two slide rails for the head' : 'a bevel lock'}, a miter handle and a dust port.`,
    vs: [['10 in blade, compound', 24, 22, 20, 0, { kind: 'Compound mitre saw', dia: 10, R: 127 }], ['12 in blade, sliding', 30, 34, 22, 0, { kind: 'Sliding compound mitre saw', dia: 12, R: 152, slide: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const R = v.R, by = YB - 40;
      a.box(X0 + 10, YF + 20, Z0, X1 - 10, YB - 20, Z0 + 70); a.cyl(cx, YF + D * 0.38, Z0 + 70, Z0 + 95, D * 0.3, 32); a.circ(cx, YF + D * 0.38, D * 0.3, 'EQUIP'); a.rect(X0 + 10, YF + 20, X1 - 10, YB - 20, 'EQUIP-DETAIL');
      for (const s of [-1, 1]) { a.box(s > 0 ? cx + 14 : X0 + 6, YB - 150, Z0 + 70, s > 0 ? X1 - 6 : cx - 14, YB - 120, Z0 + 140); a.box(s > 0 ? cx + 14 : X0 + 6, YB - 150, Z0 + 140, s > 0 ? X1 - 6 : cx - 14, YB - 130, Z0 + 210); }
      a.box(cx - 25, YF + D * 0.38 - 20, Z0 + 95, cx + 25, YB - 120, Z0 + 100); a.box(cx - 50, YF + 20 - 4, Z0 + 20, cx + 50, YF + 70, Z0 + 52); a.cyl(cx, YF + 14, Z0 + 52, Z0 + 56, 30, 12); a.xcyl(cx + 30, cx + 140, YF + 40, Z0 + 60, 10, 8); a.ell(cx + 150, YF + 40, Z0 + 60, 18, 18, 18, 8, 5);
      const zc = Z0 + 95 + R * 0.88, yc = YF + D * 0.52;
      a.xcyl(cx - 1.5, cx + 1.5, yc, zc, R, 40); ring(a, 'yz', cx, yc, zc, R - 2, 0.6, 40, 4); for (let i = 0; i < 40; i++) { const t = (i / 40) * PI * 2; a.box(cx - 1.7, yc + m.cos(t) * R - 2, zc + m.sin(t) * R - 2, cx + 1.7, yc + m.cos(t) * R + 2, zc + m.sin(t) * R + 2); }
      for (let k = 0; k < 16; k++) { const t = PI * 0.05 + (k / 16) * PI * 0.95, t2 = PI * 0.05 + ((k + 1) / 16) * PI * 0.95; a.prism([[cx - 26, yc + m.cos(t) * (R + 14)], [cx + 26, yc + m.cos(t) * (R + 14)], [cx + 26, yc + m.cos(t2) * (R + 14)], [cx - 26, yc + m.cos(t2) * (R + 14)]], zc + m.sin(t) * (R + 14) - 3, zc + m.sin(t2) * (R + 14) + 3); }
      a.xcyl(cx + 10, cx + 150, yc, zc, 70, 18); a.xcyl(cx + 150, cx + 190, yc, zc, 62, 18); a.box(cx + 60, yc + R * 0.2, zc - 40, cx + 130, yc + R * 0.9, zc + 40);
      a.tube([[cx, yc + R * 0.9, zc + R * 0.5], [cx, yc + R * 1.1 + 40, zc + R * 0.85], [cx, YB - 100, zc + R * 0.7]], [24, 22, 20], 10); a.tube([[cx, yc + R * 0.9, zc + R * 0.5], [cx, YB - 100, zc]], [24, 20], 10); a.box(cx - 14, YB - 140, zc - 60, cx + 14, YB - 60, zc + 90); a.box(cx - 14, YB - 160, zc + R * 0.2, cx + 14, YB - 120, zc + R * 0.35);
      if (v.slide) for (const dx of [-70, 70]) a.tube([[cx + dx, YF + D * 0.2, zc - 20], [cx + dx, YB - 60, zc - 20]], [14, 14], 8); else a.box(cx - 30, YB - 90, Z0 + 95, cx + 30, YB - 30, zc - R * 0.2);
      a.cyl(cx + 120, yc + 140, zc + 80, zc + 160, 26, 10); a.ycyl(YB - 30, YB + 0, cx + 80, zc - 40, 28, 12); a.line(cx, YF + 20, cx, YB - 20, 'EQUIP-DETAIL');
      a.log('Added the base and turntable, fence wings, blade with guards, motor on its pivot arm, D handle, miter handle with detents' + (v.slide ? ' and the slide rails' : ' and the bevel lock') + ' (plan and 3D).');
    } }),
];


// ------------------------------------------------------------------------------------------ storage
/** a sub-cabinet in its own body box on top of or beside another; merged back into a */
function subCab(a, x0, w, z0, h, o, yf = a.YF) { const sub = new Acc({ x: x0, y: yf, z: z0, w, h }); cab(sub, o); for (const t of sub.t) a.t.push(t); for (const p of sub.p) a.p.push(p); }
function rails(a, x0, x1, y, z0, z1, r = 10) { a.tube([[x0, y, z0], [x0, y, z1]], [r, r], 7); a.tube([[x1, y, z0], [x1, y, z1]], [r, r], 7); }
/** wheels on the four leg stems cab draws at the corners (legs: lift) */
function caster4(a, x0, x1, y0, y1, r = 38) { for (const [x, y] of [[x0 + 40, y0 + 40], [x1 - 40, y0 + 40], [x0 + 40, y1 - 40], [x1 - 40, y1 - 40]]) { a.box(x - 22, y - 22, a.Z0 + r * 2 - 4, x + 22, y + 22, a.Z0 + r * 2 + 6); a.xcyl(x - 14, x + 14, y, a.Z0 + r, r, 14); a.box(x - 18, y - 4, a.Z0 + r, x - 14, y + 4, a.Z0 + r * 2); a.box(x + 14, y - 4, a.Z0 + r, x + 18, y + 4, a.Z0 + r * 2); } }
const STORE = [
  fam({ cat: 'tools/storage', title: 'Generic portable toolbox',
    desc: (v) => `${v.l} in portable toolbox: a flared body, a hinged lid with a moulded top and a shallow tray, ${v.metal ? 'two steel latches' : 'two snap latches'} on the front, a carry handle over the top, back hinges and ${v.metal ? 'rubber' : 'moulded'} feet.`,
    vs: [['plastic, 16 in', 16, 8, 8.4, 0, { l: 16 }], ['plastic, 19 in', 19, 9.5, 9.6, 0, { l: 19 }], ['steel, 24 in', 24, 10, 10, 0, { l: 24, metal: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const bh = H * 0.5, lh = H * 0.34;
      prismX(a, [[YB - 6, Z0 + 12], [YF + 6, Z0 + 12], [YF, Z0 + bh], [YB, Z0 + bh]], X0 + 6, X1 - 6); for (const x of [X0 + 40, X1 - 40]) a.box(x - 25, YF + 14, Z0, x + 25, YF + 40, Z0 + 12), a.box(x - 25, YB - 40, Z0, x + 25, YB - 14, Z0 + 12);
      prismX(a, [[YB, Z0 + bh], [YF, Z0 + bh], [YF + 20, Z0 + bh + lh * 0.7], [YF + D * 0.3, Z0 + bh + lh], [YB - 20, Z0 + bh + lh * 0.85], [YB, Z0 + bh + lh * 0.55]], X0 + 4, X1 - 4);
      a.box(X0 + 20, YF + D * 0.35, Z0 + bh + lh * 0.97, X1 - 20, YB - D * 0.25, Z0 + bh + lh * 1.0 + 4);
      for (const x of [cx - W * 0.3, cx + W * 0.3]) { a.box(x - 18, YF - 6, Z0 + bh - 26, x + 18, YF + 10, Z0 + bh + 14); if (v.metal) a.box(x - 22, YF - 10, Z0 + bh - 30, x + 22, YF, Z0 + bh - 10); a.box(x - 22, YB - 6, Z0 + bh - 10, x + 22, YB + 0, Z0 + bh + 20); }
      const hy = YF + D * 0.5, hz = Z0 + bh + lh * 0.92; for (const s of [-1, 1]) a.tube([[cx + s * W * 0.32, hy, hz], [cx + s * W * 0.3, hy, Z1 - 4]], [8, 8], 6); a.tube([[cx - W * 0.3, hy, Z1 - 4], [cx + W * 0.3, hy, Z1 - 4]], [11, 11], 8);
      for (const s of [-1, 1]) { a.box(s > 0 ? X1 - 30 : X0, YF + D * 0.3, Z0 + bh * 0.5, s > 0 ? X1 : X0 + 30, YF + D * 0.7, Z0 + bh * 0.7); }
      a.rect(X0 + 6, YF + 6, X1 - 6, YB - 6); a.line(X0 + 6, YF + D * 0.3, X1 - 6, YF + D * 0.3, 'EQUIP-DETAIL'); a.log('Added the flared body, hinged lid with tray, two front latches, back hinges, the carry handle and the feet (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic rolling tool chest',
    desc: (v) => `Tool chest set: a ${v.td}-drawer top chest with a hinged lid and side handles on a ${v.bd}-drawer roller cabinet with a lockable bank of drawers, bar pulls, a lock bar and four casters, ${v.w} in wide.`,
    vs: [['26 in, 5 + 4 drawers', 26, 18, 52, 0, { td: 5, bd: 4, w: 26 }], ['36 in, 6 + 5 drawers', 36, 20, 60, 0, { td: 6, bd: 5, w: 36 }], ['41 in, 7 + 6 drawers', 41, 22, 64, 0, { td: 7, bd: 6, w: 41 }], ['56 in, 9 + 8 drawers, side locker', 56, 24, 68, 0, { td: 9, bd: 8, w: 56, side: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const hb = (H - 140) * 0.58, ht = H - 140 - hb, zc = Z0 + 140 + hb;
      const bw = v.side ? W - 330 : W; subCab(a, X0, bw, Z0, hb + 140, { drawers: v.bd, legs: 100, pull: 'bar', topT: 24, inset: 0 }); caster4(a, X0, X0 + bw, YF, YB, 50);
      const cw = v.side ? bw - 100 : bw - 80, cx0 = X0 + (bw - cw) / 2; subCab(a, cx0, cw, zc, ht, { drawers: v.td, pull: 'bar', topT: 0 });
      a.box(cx0, YF + 20, zc + ht, cx0 + cw, YB, zc + ht + 22); a.box(cx0 - 6, YF, zc + ht, cx0 + cw + 6, YF + 22, zc + ht + 30); for (const s of [-1, 1]) a.tube([[s > 0 ? cx0 + cw + 24 : cx0 - 24, YF + D * 0.25, zc + ht * 0.6], [s > 0 ? cx0 + cw + 24 : cx0 - 24, YF + D * 0.75, zc + ht * 0.6]], [10, 10], 7), a.box(s > 0 ? cx0 + cw : cx0 - 20, YF + D * 0.25 - 8, zc + ht * 0.6 - 8, s > 0 ? cx0 + cw + 20 : cx0, YF + D * 0.25 + 8, zc + ht * 0.6 + 8), a.box(s > 0 ? cx0 + cw : cx0 - 20, YF + D * 0.75 - 8, zc + ht * 0.6 - 8, s > 0 ? cx0 + cw + 20 : cx0, YF + D * 0.75 + 8, zc + ht * 0.6 + 8);
      a.box(cx0 + 30, YF - 6, zc + ht - 60, cx0 + cw - 30, YF, zc + ht - 40); a.box(X0 + 10, YF - 10, Z0 + 160, X0 + 26, YF, Z0 + hb + 120);
      if (v.side) { subCab(a, X0 + bw + 10, 320, Z0, H - 140, { doors: 2, legs: 100, pull: 'bar', lock: true, swing: true }); caster4(a, X0 + bw + 10, X0 + bw + 330, YF, YB, 50); }
      a.log('Added the top chest with lid and side handles, the roller cabinet with drawers, bar pulls, lock bar and casters' + (v.side ? ' and the side locker' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic pegboard tool wall',
    desc: (v) => `Pegboard wall panel ${v.w} x ${v.h} in on furring strips: a hole grid with ${v.hooks} hooks of different lengths, a shelf bracket, two open bins on hooks and drawn tool shapes (hammer, pliers, wrench, saw) hung from the hooks.`,
    vs: [['24 x 48 in', 24, 8, 48, 60, { w: 24, h: 48, hooks: 12 }], ['48 x 48 in', 48, 8, 48, 60, { w: 48, h: 48, hooks: 24 }], ['96 x 48 in', 96, 8, 48, 60, { w: 96, h: 48, hooks: 44 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, H } = a; a.outline(); const pw = W, ph = H;
      for (let x = X0 + 20; x < X1 - 10; x += 400) a.box(x, YB - 40, Z0, x + 40, YB - 22, Z1); a.box(X0, YB - 22, Z0, X1, YB - 16, Z1);
      for (let i = 0; i < v.hooks; i++) { const col = (i * 7) % 9, row = (i * 5) % 8, hx = X0 + 60 + (col / 9) * (pw - 120) + (i % 3) * 20, hz = Z0 + 80 + (row / 8) * (ph - 260), L = 50 + (i % 4) * 25;
        hx > X0 + 40 && hx < X1 - 40 && a.tube([[hx, YB - 16, hz], [hx, YB - 16 - L, hz], [hx, YB - 16 - L, hz + 22]], [3.5, 3.5, 3.5], 5);
        const k = i % 4, tx = hx, ty = YB - 16 - L - 6;
        if (k === 0) { a.box(tx - 3, ty - 4, hz - 150, tx + 3, ty, hz + 20); a.box(tx - 26, ty - 6, hz - 190, tx + 26, ty, hz - 150); }
        else if (k === 1) { a.box(tx - 14, ty - 5, hz - 150, tx - 5, ty, hz + 10); a.box(tx + 5, ty - 5, hz - 150, tx + 14, ty, hz + 10); a.box(tx - 18, ty - 6, hz - 160, tx + 18, ty, hz - 120); }
        else if (k === 2) { prismY(a, [[tx - 8, hz + 10], [tx + 8, hz + 10], [tx + 5, hz - 210], [tx - 5, hz - 210]], ty - 5, ty); }
        else { a.box(tx - 20, ty - 4, hz - 90, tx + 20, ty, hz + 15); a.box(tx - 3, ty - 4, hz - 160, tx + 3, ty, hz - 90); } }
      a.tube([[cx - 190, YB - 16, Z0 + 130], [cx - 190, YB - 120, Z0 + 130]], [5, 5], 6); a.tube([[cx + 190, YB - 16, Z0 + 130], [cx + 190, YB - 120, Z0 + 130]], [5, 5], 6); a.box(cx - 220, YB - 130, Z0 + 120, cx + 220, YB - 16, Z0 + 128); a.box(cx - 220, YB - 132, Z0 + 128, cx + 220, YB - 124, Z0 + 170);
      for (const bx of [X0 + W * 0.2, X1 - W * 0.2]) { a.box(bx - 80, YB - 140, Z0 + H * 0.55, bx + 80, YB - 16, Z0 + H * 0.55 + 8); a.box(bx - 80, YB - 142, Z0 + H * 0.55, bx + 80, YB - 136, Z0 + H * 0.55 + 90); a.box(bx - 80, YB - 140, Z0 + H * 0.55, bx - 74, YB - 16, Z0 + H * 0.55 + 90); a.box(bx + 74, YB - 140, Z0 + H * 0.55, bx + 80, YB - 16, Z0 + H * 0.55 + 90); }
      a.rect(X0, YB - 40, X1, YB, 'EQUIP-DETAIL'); a.log('Added the panel on strips, hooks of different lengths, shelf bracket, two bins and hung tool shapes (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic workbench with vise',
    desc: (v) => `${v.ft} ft workbench: a thick laminated top with a row of dog holes, square legs with front and side aprons${v.drawers ? ', a bank of two drawers and a door cabinet at the right end' : ', a lower shelf'}, a cast bench vise at the front left corner with a screw and handle${v.board ? ', a pegboard back panel with hooks and a power strip' : ''} and a back stop.`,
    vs: [['4 ft, lower shelf', 48, 34, 41, 0, { ft: 4, shelf: true }], ['6 ft, lower shelf, back panel', 72, 38, 66, 0, { ft: 6, shelf: true, board: true }], ['6 ft, drawers and cabinet', 72, 38, 41, 0, { ft: 6, drawers: true }], ['8 ft, shelf, pegboard, vise', 96, 40, 66, 0, { ft: 8, shelf: true, board: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline(); const yf = a.YF + 230; const zt = Z0 + 36 * IN - 44 + 44 - (v.board ? 0 : 0) - 0, th = 44, zT = Z0 + 34 * IN + (v.board ? 0 : 0);
      a.box(X0, yf, zT - th, X1, YB - (v.board ? 90 : 0), zT); a.rect(X0, yf, X1, YB - (v.board ? 90 : 0));
      for (let i = 0; i < 10; i++) a.circ(X0 + 150 + i * ((W - 300) / 9), YB - (v.board ? 90 : 0) - 120, 10, 'EQUIP-DETAIL'); a.box(X0 + 40, YB - (v.board ? 90 : 0) - 50, zT, X1 - 40, YB - (v.board ? 90 : 0) - 28, zT + 28);
      const ly = [yf + 70, YB - (v.board ? 90 : 0) - 70], lx0 = X0 + 60, lx1 = X1 - 60;
      for (const x of [lx0, lx1]) for (const y of ly) a.box(x - 45, y - 45, Z0, x + 45, y + 45, zT - th);
      for (const y of ly) a.box(lx0, y - 18, zT - th - 120, lx1, y + 18, zT - th); for (const x of [lx0, lx1]) a.box(x - 18, ly[0], zT - th - 120, x + 18, ly[1], zT - th);
      if (v.shelf) { a.box(lx0, ly[0], Z0 + 180, lx1, ly[1], Z0 + 215); for (const y of ly) a.box(lx0, y - 14, Z0 + 150, lx1, y + 14, Z0 + 215); }
      if (v.drawers) { subCab(a, X1 - 62 - 640, 640, Z0 + 60, zT - th - Z0 - 60 + 0, { drawers: 2, drawerH: 330, doors: 1, pull: 'bar', hinge: 'R' }, yf + 0); a.box(X1 - 62 - 640, yf + 90, Z0, X1 - 62, ly[1] + 40, Z0 + 60); }
      const vx = X0 + 170, vy = yf; a.box(vx - 90, vy - 20, zT, vx + 90, vy + 170, zT + 40); a.box(vx - 90, vy - 30, zT + 40, vx - 10, vy + 170, zT + 120 + 40); a.box(vx + 10, vy - 80, zT + 40, vx + 90, vy - 30, zT + 160); a.box(vx - 90, vy - 20, zT + 40, vx + 90, vy + 10, zT + 100);
      a.ycyl(vy - 190, vy - 40, vx + 50, zT + 80, 12, 8); a.tube([[vx + 50 - 70, vy - 220, zT + 80], [vx + 50 + 70, vy - 220, zT + 80]], [7, 7], 6); a.ell(vx + 50 - 74, vy - 220, zT + 80, 10, 10, 10, 6, 4); a.ell(vx + 50 + 74, vy - 220, zT + 80, 10, 10, 10, 6, 4); a.box(vx - 20, vy - 30, zT + 40, vx + 20, vy + 20, zT + 30); a.rect(vx - 90, vy - 80, vx + 90, vy + 170, 'EQUIP-DETAIL');
      if (v.board) { a.box(X0 + 20, YB - 60, zT + 40, X1 - 20, YB - 40, Z1 - 20); for (let i = 0; i < 8; i++) { const hx = X0 + 100 + i * ((W - 200) / 7); a.tube([[hx, YB - 60, Z0 + 1260 + (i % 3) * 120], [hx, YB - 130, Z0 + 1260 + (i % 3) * 120], [hx, YB - 130, Z0 + 1285 + (i % 3) * 120]], [3.5, 3.5, 3.5], 5); } a.box(X0 + 40, YB - 140, zT + 100, X1 - 40, YB - 90, zT + 160); a.box(X0 + 30, YB - 100, Z0 + 1080, X1 - 30, YB - 60, Z0 + 1110); for (let i = 0; i < 3; i++) a.box(X0 + 150 + i * 70, YB - 108, Z0 + 1084, X0 + 190 + i * 70, YB - 100, Z0 + 1096); }
      a.log('Added the thick top with dog holes, legs and aprons, ' + (v.shelf ? 'lower shelf, ' : '') + (v.drawers ? 'drawer bank and cabinet, ' : '') + 'the cast vise with screw and handle' + (v.board ? ', pegboard back panel and power strip' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic tool cart',
    desc: (v) => `${v.tiers}-tier steel utility cart ${v.w} in long: rectangular tube frame, ${v.tiers} lipped shelves, a tall push handle at one end and four swivel casters (two with brakes).`,
    vs: [['2 tier, 30 in', 30, 16, 34, 0, { tiers: 2, w: 30 }], ['3 tier, 36 in', 36, 19, 34, 0, { tiers: 3, w: 36 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const cz = 120, zs0 = Z0 + cz + 40, zs1 = Z0 + H * 0.72 + 40;
      const levels = v.tiers === 2 ? [zs0, zs1] : [zs0, (zs0 + zs1) / 2, zs1];
      for (const [x, y] of [[X0 + 24, YF + 24], [X1 - 24, YF + 24], [X0 + 24, YB - 24], [X1 - 24, YB - 24]]) { a.tube([[x, y, Z0 + cz - 10], [x, y, zs1 + 10]], [11, 11], 8); a.xcyl(x - 7, x + 7, y, Z0 + 40, 40, 14); a.box(x - 16, y - 16, Z0 + cz - 20, x + 16, y + 16, Z0 + cz); }
      for (const z of levels) { a.box(X0 + 8, YF + 8, z - 3, X1 - 8, YB - 8, z + 3); a.box(X0 + 8, YF + 8, z + 3, X1 - 8, YF + 14, z + 28); a.box(X0 + 8, YB - 14, z + 3, X1 - 8, YB - 8, z + 28); a.box(X0 + 8, YF + 14, z + 3, X0 + 14, YB - 14, z + 28); a.box(X1 - 14, YF + 14, z + 3, X1 - 8, YB - 14, z + 28); }
      a.tube([[X1 - 24, YF + 24, zs1 + 10], [X1 - 24, YF + 24, Z1 - 20], [X1 - 24, YB - 24, Z1 - 20], [X1 - 24, YB - 24, zs1 + 10]], [11, 11, 11, 11], 8); a.rect(X0 + 8, YF + 8, X1 - 8, YB - 8); a.log('Added the tube frame, ' + v.tiers + ' lipped shelves, push handle and four swivel casters (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic steel storage cabinet',
    desc: (v) => v.wall ? `Wall-hung steel cabinet ${v.w} x ${v.h} in: two flush doors with recessed pulls and a lock, a slim carcass with one internal shelf, a recessed hanging rail on the back.` : v.base ? `Steel base cabinet ${v.w} in wide: a top drawer and two flush doors below with bar pulls and a lock, a toe space and a work surface top.` : `Tall two-door steel storage cabinet ${v.w} x ${v.h} in: flush doors with a three-point latch and a lock, vent slots, adjustable shelves and levelling feet.`,
    vs: [['tall, 36 x 72 in, two door', 36, 18, 72, 0, { w: 36, h: 72 }], ['base, 36 in, drawer and doors', 36, 24, 36, 0, { w: 36, h: 36, base: true }], ['wall, 36 x 30 in, two door', 36, 12, 30, 54, { w: 36, h: 30, wall: true }]],
    build: (a, v) => {
      if (v.wall) cab(a, { doors: 2, shelves: 1, pull: 'recess', lock: true, toe: 0, hidden: false });
      else if (v.base) cab(a, { doors: 2, drawers: 1, drawerH: 200, pull: 'bar', lock: true, toe: 90, topT: 40 });
      else cab(a, { doors: 2, pull: 'vbar', lock: true, louver: true, toe: 60, shelves: 3 });
      if (!v.wall && !v.base) for (let i = 0; i < 6; i++) a.box(a.X0 + 30 + i * 14, a.YF - 2, a.Z0 + 60 + (a.H - 200), a.X0 + 33 + i * 14, a.YF, a.Z0 + 60 + (a.H - 200) + 24);
      a.log('Added the carcass, flush doors with pulls and lock' + (v.base ? ', top drawer and work surface' : v.wall ? ' and the internal shelf' : ', vent slots and the adjustable shelves') + ' (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic French cleat tool wall',
    desc: (v) => `French cleat wall ${v.w} x ${v.h} in: a plywood panel with ${v.cleats} bevelled cleats, with ${v.n} holders hung on them: hook blocks, a shelf, two open bins, a drill holder block and a saw rack.`,
    vs: [['48 x 48 in, 5 cleats', 48, 8, 48, 54, { w: 48, h: 48, cleats: 5, n: 7 }], ['96 x 48 in, 5 cleats', 96, 8, 48, 54, { w: 96, h: 48, cleats: 5, n: 14 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, H } = a; a.outline(); a.box(X0, YB - 18, Z0, X1, YB, Z1);
      for (let i = 0; i < v.cleats; i++) { const z = Z0 + 90 + i * ((H - 220) / (v.cleats - 1)); prismX(a, [[YB - 18, z], [YB - 36, z + 24], [YB - 18, z + 24]], X0 + 10, X1 - 10); a.line(X0 + 10, YB - 18, X1 - 10, YB - 18, 'EQUIP-DETAIL'); }
      let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
      for (let i = 0; i < v.n; i++) { const x = X0 + 80 + (i / v.n) * (W - 200) + rnd() * 40, row = i % (v.cleats - 1), z = Z0 + 90 + row * ((H - 220) / (v.cleats - 1)) + 30, k = i % 5;
        if (k === 0) { a.box(x - 40, YB - 120, z, x + 40, YB - 36, z + 40); for (const dx of [-25, 0, 25]) a.tube([[x + dx, YB - 120, z + 20], [x + dx, YB - 150, z + 20]], [4, 4], 5); }
        else if (k === 1) { a.box(x - 120, YB - 190, z, x + 120, YB - 36, z + 20); a.box(x - 120, YB - 192, z, x + 120, YB - 186, z + 60); }
        else if (k === 2) { a.box(x - 80, YB - 160, z - 60, x + 80, YB - 36, z + 6); a.box(x - 80, YB - 162, z - 60, x + 80, YB - 156, z + 60); a.box(x - 80, YB - 160, z + 54, x + 80, YB - 36, z + 60); }
        else if (k === 3) { a.box(x - 50, YB - 150, z - 20, x + 50, YB - 36, z + 80); for (const dx of [-25, 25]) a.cyl(x + dx, YB - 110, z + 80, z + 94, 10, 8); }
        else { a.box(x - 10, YB - 100, z, x + 10, YB - 36, z + 200); a.box(x - 80, YB - 100, z + 40, x + 80, YB - 80, z + 60); } }
      a.log('Added the plywood panel, bevelled cleats and the hung holders, shelf, bins, drill block and saw rack (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic mobile drawer cabinet',
    desc: (v) => `${v.n}-drawer mobile cabinet ${v.w} in wide: a steel carcass with a flush ball-bearing drawer bank, long bar pulls, a central lock bar, a work top and four swivel casters, two with brakes.`,
    vs: [['2 drawer, 24 in', 24, 20, 30, 0, { n: 2 }], ['5 drawer, 27 in', 27, 22, 34, 0, { n: 5 }]],
    build: (a, v) => {
      cab(a, { drawers: v.n, legs: 76, pull: 'bar', topT: 30 }); caster4(a, a.X0, a.X1, a.YF, a.YB, 38); a.box(a.X0 + 10, a.YF - 8, a.Z0 + 140, a.X0 + 26, a.YF, a.Z1 - 60); a.box(a.X0 + 40, a.YF - 6, a.Z1 - 90, a.X1 - 40, a.YF, a.Z1 - 70);
      a.log('Added the carcass, drawer bank with bar pulls, lock bar, work top and casters (plan and 3D).');
    } }),

  fam({ cat: 'tools/storage', title: 'Generic wall lumber rack',
    desc: (v) => `Wall-mounted lumber rack: two steel upright channels bolted to the wall, ${v.arms} welded horizontal arms with an upturned lip, each carrying a stack of sawn boards of mixed width, and a lower sheet-stock shelf.`,
    vs: [['4 arms, 48 in', 48, 24, 66, 0, { arms: 4 }], ['6 arms, 96 in', 96, 24, 72, 0, { arms: 6 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline(); const ar = D - 60;
      for (const x of [X0 + 70, X1 - 70]) { a.box(x - 30, YB - 30, Z0, x + 30, YB, Z1); a.box(x - 30, YB - 30, Z0 + 30, x - 24, YB, Z1); }
      const zs = Array.from({ length: v.arms }, (_, i) => Z0 + 180 + i * ((H - 350) / (v.arms - 1)));
      for (const x of [X0 + 70, X1 - 70]) for (const z of zs) { a.box(x - 18, YB - ar, z, x + 18, YB - 30, z + 26); a.box(x - 18, YB - ar, z + 26, x + 18, YB - ar + 12, z + 90); a.tube([[x, YB - 30, z - 20], [x, YB - ar * 0.6, z]], [8, 8], 5); }
      for (let i = 0; i < v.arms; i++) { const z = zs[i], k = i % 3; for (let j = 0; j < 2 + (k === 0 ? 1 : 0); j++) a.box(X0 + 110 + j * 4, YB - ar + 20 + j * 30, z + 28 + 0, X1 - 110, YB - 40 - j * 24, z + 28 + 30 + (j % 2) * 20); }
      a.box(X0 + 70, YB - ar, Z0 + 60, X1 - 70, YB - 30, Z0 + 80); a.rect(X0 + 70, YB - ar, X1 - 70, YB, 'EQUIP-DETAIL'); a.log('Added the two upright channels, the welded arms with lips, the boards on each arm and the lower sheet shelf (plan and 3D).');
    } }),
];

// @@END
const ALL = [...HAND, ...POWER, ...MACH, ...STORE];
export default ALL;

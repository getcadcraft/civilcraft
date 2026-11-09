/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, sport: courts and fields, sports equipment, fitness equipment, venue items. Original geometry; generic shapes, no brand, team or league. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, FT = 304.8, m = Math, PI = m.PI;

// ------------------------------------------------------------------------------------------ helpers
/** a flat line (quad prism) from (x0,y0) to (x1,y1), width w, between z0 and z1; also a plan line */
function seg(a, x0, y0, x1, y1, w, z0, z1, plan = true) {
  const dx = x1 - x0, dy = y1 - y0, l = m.hypot(dx, dy) || 1, nx = (-dy / l) * w / 2, ny = (dx / l) * w / 2;
  a.prism([[x0 - nx, y0 - ny], [x1 - nx, y1 - ny], [x1 + nx, y1 + ny], [x0 + nx, y0 + ny]], z0, z1);
  if (plan) a.line(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
/** extrude a convex polygon given as [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** extrude a convex polygon given as [x, z] points between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** a closed ring (torus-like tube). plane: 'xz' (axis Y), 'yz' (axis X), 'xy' (axis Z) */
function ring(a, plane, cx, cy, cz, R, r, seg_ = 24, sides = 6) {
  const P = (i, j) => {
    const t = (i / seg_) * 2 * PI, f = (j / sides) * 2 * PI, rr = R + r * m.cos(f), q = r * m.sin(f), c = m.cos(t) * rr, s2 = m.sin(t) * rr;
    return plane === 'xz' ? [cx + c, cy + q, cz + s2] : plane === 'yz' ? [cx + q, cy + c, cz + s2] : [cx + c, cy + s2, cz + q];
  };
  for (let i = 0; i < seg_; i++) for (let j = 0; j < sides; j++) { const A = P(i, j), B = P(i + 1, j), C = P(i + 1, j + 1), D = P(i, j + 1); a.t.push([A, B, C], [A, C, D]); }
}
/** polyline of points -> list of line segments in plan and flat on the floor */
function polySeg(a, pts, w, z0, z1) { for (let i = 0; i < pts.length - 1; i++) seg(a, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w, z0, z1); }
function arcPts(cx, cy, r, a0, a1, n = 16) { const p = []; for (let i = 0; i <= n; i++) { const t = ((a0 + ((a1 - a0) * i) / n) * PI) / 180; p.push([cx + r * m.cos(t), cy + r * m.sin(t)]); } return p; }
/** a quad of strands between four 3D corners A B C D (A-B and D-C are the n1 direction) */
function strands(a, A, B, C, D, n1, n2, t = 3) {
  const L = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, p[2] + (q[2] - p[2]) * f];
  for (let i = 0; i <= n1; i++) { const f = i / n1; a.tube([L(A, B, f), L(D, C, f)], [t, t], 4); }
  for (let j = 0; j <= n2; j++) { const f = j / n2; a.tube([L(A, D, f), L(B, C, f)], [t, t], 4); }
}
/** a vertical net in the X-Z plane at y */
function netXZ(a, x0, x1, y, z0, z1, nx, nz, t = 2.5) { strands(a, [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], nx, nz, t); }
/** a round-section stand: base disc, post and optional cradle prongs (for objects shown upright) */
function stand(a, cx, cy, r, h, prongs = 0, pw = 0) {
  a.cyl(cx, cy, a.Z0, a.Z0 + 14, r, 20); a.cyl(cx, cy, a.Z0 + 14, a.Z0 + h, 12, 10); a.circ(cx, cy, r, 'EQUIP-DETAIL');
  for (let i = 0; i < prongs; i++) { const x = cx + (i - (prongs - 1) / 2) * pw; a.box(x - 5, cy - 14, a.Z0 + h - 40, x + 5, cy + 14, a.Z0 + h + 40); }
}
function wheelYZ(a, cx, cy, cz, R, tyre, spokes = 0, sides = 6) { // a wheel with its axis along X
  ring(a, 'yz', cx, cy, cz, R - tyre, tyre, 28, sides); a.xcyl(cx - 12, cx + 12, cy, cz, 16, 8);
  for (let i = 0; i < spokes; i++) { const t = (i / spokes) * PI; a.tube([[cx, cy + m.cos(t) * (R - tyre), cz + m.sin(t) * (R - tyre)], [cx, cy - m.cos(t) * (R - tyre), cz - m.sin(t) * (R - tyre)]], [1.6, 1.6], 4); }
  a.rect(cx - 12, cy - R, cx + 12, cy + R, 'EQUIP-DETAIL');
}

// ------------------------------------------------------------------------------------------ courts
/** net on two posts across a court: posts at x = ±px, net across at y, height hn (centre) and hp (posts) */
function netAcross(a, px, y, hn, hp, post = 45, ant = false, nd = 900) {
  const { Z0 } = a;
  for (const s of [-1, 1]) { a.cyl(s * px, y, Z0, Z0 + hp, post, 12); a.cyl(s * px, y, Z0, Z0 + 12, post * 2.4, 14); a.circ(s * px, y, post * 1.2, 'EQUIP-DETAIL'); a.box(s * px - 40, y - 60, Z0 + hn - 60, s * px + 40, y + 60, Z0 + hn + 30); }
  netXZ(a, -px, px, y, Z0 + hn - nd, Z0 + hn - 40, m.round(px / 55), 7);
  a.box(-px, y - 6, Z0 + hn - 55, px, y + 6, Z0 + hn); a.box(-px, y - 3, Z0 + hn - nd - 6, px, y + 3, Z0 + hn - nd);
  a.line(-px, y, px, y, 'EQUIP-DETAIL');
  if (ant) for (const s of [-1, 1]) a.tube([[s * (px - 600), y, Z0 + hn], [s * (px - 600), y, Z0 + hn + 800]], [5, 5], 6);
}
/** line-marked slab covering the body; returns helper to add lines */
function slab(a, t = 30) { a.box(a.X0, a.YF, a.Z0, a.X1, a.YB, a.Z0 + t); a.outline(); return a.Z0 + t; }

/** a basketball-style hoop assembly at (x, y) facing −Y or +Y: dir = -1 faces the front. bw/bh board size, rimH rim height, arm length (mm) */
function hoopAt(a, x, y, dir, o) {
  const zr = a.Z0 + o.rimH, bz0 = zr - (o.low ?? 150), bh = o.bh, bw = o.bw;
  a.cyl(x, y, a.Z0, a.Z0 + o.poleH, o.pr ?? 70, 12);
  a.box(x - 220, y - 220, a.Z0, x + 220, y + 220, a.Z0 + 30);
  a.tube([[x, y, a.Z0 + o.poleH - 80], [x, y + dir * o.arm * 0.5, a.Z0 + o.poleH - 80], [x, y + dir * o.arm, zr + bh * 0.4]], [55, 45, 40], 8);
  const by = y + dir * o.arm;
  a.box(x - bw / 2, by - 25, bz0, x + bw / 2, by + 25, bz0 + bh);
  a.box(x - 280, by + dir * 30 - 12, zr, x + 280, by + dir * 30 + 12, zr + 100);   // shooter square block
  a.frame(x - 300, zr + 20, x + 300, zr + 520, by - dir * 26 - 5, by - dir * 26 + 5, 10);
  const ry = by + dir * (25 + 230 + 10); ring(a, 'xy', x, ry, zr, 229, 8, 24, 6);
  a.box(x - 30, by + dir * 25 - 10, zr - 10, x + 30, ry - dir * 220, zr + 10);
  for (let i = 0; i < 12; i++) { const t = (i / 12) * 2 * PI; a.tube([[x + m.cos(t) * 229, ry + m.sin(t) * 229, zr - 8], [x + m.cos(t) * 130, ry + m.sin(t) * 130, zr - 400]], [2.5, 2.5], 4); }
  ring(a, 'xy', x, ry, zr - 400, 130, 2.5, 14, 4);
  a.rect(x - bw / 2, by - 25, x + bw / 2, by + 25, 'EQUIP'); a.circ(x, ry, 229, 'EQUIP-DETAIL'); a.circ(x, y, 70, 'EQUIP-DETAIL');
}

const COURTS = [
  fam({ cat: 'sport/courts', ft: true, title: 'Generic tennis court',
    desc: (v) => `${v.label.split(',')[0][0].toUpperCase() + v.label.split(',')[0].slice(1)} marked on a hard slab: baselines, ${v.singles ? 'singles' : 'singles and doubles'} sidelines, service lines and centre mark, two net posts with a net, centre strap and top band${v.run ? ', with run-off areas around the lines' : ''}.`,
    vs: [['doubles, 78 x 36 ft lines', 42, 78, 44, 0, { cw: 36, cl: 78, run: 0, nh: 36, ph: 42 }], ['singles with posts, 78 x 27 ft lines', 33, 78, 44, 0, { cw: 27, cl: 78, run: 0, nh: 36, ph: 42, singles: true }],
      ['club doubles with run-off, 120 x 60 ft', 60, 120, 44, 0, { cw: 36, cl: 78, run: 1, nh: 36, ph: 42 }], ['junior court, 60 x 21 ft lines', 27, 60, 40, 0, { cw: 21, cl: 60, run: 0, nh: 31, ph: 36, junior: true }]],
    build: (a, v) => {
      const zt = slab(a, 35), Z0 = zt, w = 55, cw = v.cw * FT, cl = v.cl * FT, cy = a.YF / 2, y0 = cy - cl / 2, y1 = cy + cl / 2, hx = cw / 2;
      const L = (x0, y0_, x1, y1_) => seg(a, x0, y0_, x1, y1_, w, Z0, Z0 + 4);
      L(-hx, y0, hx, y0); L(-hx, y1, hx, y1); L(-hx, y0, -hx, y1); L(hx, y0, hx, y1);
      const sx = v.singles || v.junior ? 0 : 4.5 * FT; if (!v.singles && !v.junior) { L(-hx + sx, y0, -hx + sx, y1); L(hx - sx, y0, hx - sx, y1); }
      const sv = v.junior ? 10.5 * FT : 21 * FT; L(-hx + sx, cy - sv, hx - sx, cy - sv); L(-hx + sx, cy + sv, hx - sx, cy + sv); L(0, cy - sv, 0, cy + sv);
      L(-60, y0, 60, y0 + 0); L(-60, y1, 60, y1);
      netAcross(a, hx + 3 * FT * (v.singles ? 1 : 1) - (v.singles ? 0 : 0), cy, v.nh * IN - 25 + 25, v.ph * IN, 50);
      a.log('Added the slab, court lines, two net posts, the net with centre strap and top band (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', title: 'Generic basketball hoop',
    desc: (v) => `Basketball hoop: a ${v.pole} pole, an extension arm, a ${v.bw} in wide backboard with a target square, a rim of 18 in inner diameter with a net${v.wall ? ' and a wall plate' : ''}${v.base ? ' on a ballasted base' : ''}.`,
    vs: [['in-ground pole, 72 in board, 10 ft rim', 72, 78, 160, 0, { bw: 72, bh: 42, rimH: 10, arm: 4, pole: 'steel', poleH: 3500, bigPole: true }], ['in-ground adjustable, 54 in board, 10 ft rim', 54, 66, 152, 0, { bw: 54, bh: 36, rimH: 10, arm: 4, pole: 'steel', poleH: 3300 }],
      ['portable with ballast base, 50 in board', 50, 100, 150, 0, { bw: 50, bh: 33, rimH: 10, arm: 3.5, pole: 'steel', poleH: 3200, base: true }], ['wall mounted, 48 in board, 10 ft rim', 48, 60, 148, 0, { bw: 48, bh: 32, rimH: 10, arm: 3, pole: 'steel', poleH: 0, wall: true }],
      ['youth portable, 44 in board, 7.5 ft rim', 44, 80, 116, 0, { bw: 44, bh: 30, rimH: 7.5, arm: 3, pole: 'steel', poleH: 2300, base: true }]],
    build: (a, v) => {
      const { Z0, YB, YF, cx } = a, by_ = v.wall ? YB - 70 : YB - 330, rimH = v.rimH * FT, bw = v.bw * IN, bh = v.bh * IN, zr = Z0 + rimH, bz0 = zr - 150;
      let boardY;
      if (v.wall) { boardY = YB - 330; a.box(cx - 300, YB - 40, bz0, cx + 300, YB, bz0 + bh); a.tube([[cx - 150, YB - 40, bz0 + bh * 0.2], [cx - 150, boardY, bz0 + bh * 0.2]], [26, 26], 6); a.tube([[cx + 150, YB - 40, bz0 + bh * 0.2], [cx + 150, boardY, bz0 + bh * 0.2]], [26, 26], 6); a.tube([[cx - 150, YB - 40, bz0 + bh * 0.8], [cx - 150, boardY, bz0 + bh * 0.8]], [26, 26], 6); a.tube([[cx + 150, YB - 40, bz0 + bh * 0.8], [cx + 150, boardY, bz0 + bh * 0.8]], [26, 26], 6); }
      else {
        const px = YB - 150; boardY = px - v.arm * FT * 0.5 - 400;
        if (v.base) { a.box(cx - 300, YB - 1400 - 150, Z0 + 40, cx + 300, YB - 100, Z0 + 330); a.rect(cx - 300, YB - 1550, cx + 300, YB - 100); for (const s of [-1, 1]) { a.xcyl(cx + s * 230 - 25, cx + s * 230 + 25, YB - 1450, Z0 + 40, 40, 10); } }
        else { a.box(cx - 220, px - 220, Z0, cx + 220, px + 220, Z0 + 30); a.circ(cx, px, 220, 'EQUIP'); }
        a.cyl(cx, px, Z0 + 30, Z0 + v.poleH, v.bigPole ? 95 : 70, 12);
        a.tube([[cx, px, Z0 + v.poleH - 60], [cx, px - 100, Z0 + v.poleH + 40], [cx, boardY + 60, bz0 + bh - 120]], [55, 45, 40], 8);
        a.tube([[cx, px, Z0 + v.poleH - 500], [cx, boardY + 120, bz0 + 60]], [28, 28], 6);
        a.circ(cx, px, v.bigPole ? 95 : 70, 'EQUIP-DETAIL'); a.line(cx, px, cx, boardY, 'EQUIP-DETAIL');
      }
      a.box(cx - bw / 2, boardY - 25, bz0, cx + bw / 2, boardY + 25, bz0 + bh);
      a.frame(cx - bw * 0.2, bz0 + 150, cx + bw * 0.2, bz0 + 150 + bh * 0.5, boardY - 33, boardY - 25, 12);
      const ry = boardY - 25 - 240; ring(a, 'xy', cx, ry, zr, 229, 9, 28, 6); a.box(cx - 35, ry + 200, zr - 12, cx + 35, boardY - 24, zr + 12);
      for (let i = 0; i < 12; i++) { const t = (i / 12) * 2 * PI; a.tube([[cx + m.cos(t) * 229, ry + m.sin(t) * 229, zr - 10], [cx + m.cos(t) * 140, ry + m.sin(t) * 140, zr - 420]], [2.5, 2.5], 4); }
      ring(a, 'xy', cx, ry, zr - 420, 140, 2.5, 14, 4);
      a.rect(cx - bw / 2, boardY - 25, cx + bw / 2, boardY + 25); a.circ(cx, ry, 229, 'EQUIP-DETAIL');
      a.log('Added the pole or wall plate' + (v.base ? ', ballast base' : '') + ', arm, backboard with target square, rim and net (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', ft: true, title: 'Generic basketball court',
    desc: (v) => `${v.label.split(',')[0][0].toUpperCase() + v.label.split(',')[0].slice(1)}: a slab with boundary lines, ${v.full ? 'centre line and circle, ' : ''}key lanes with free-throw circles, three-point arcs and ${v.hoops === 1 ? 'one hoop' : 'a hoop at each end'} on a pole with backboard, rim and net.`,
    vs: [['full court, 94 x 50 ft lines', 62, 106, 160, 0, { cl: 94, cw: 50, full: true, hoops: 2, key: 12, r3: 22.15 }], ['school court, 84 x 50 ft lines', 62, 96, 160, 0, { cl: 84, cw: 50, full: true, hoops: 2, key: 12, r3: 19.75 }],
      ['half court, 47 x 50 ft lines', 56, 53, 160, 0, { cl: 47, cw: 50, full: false, hoops: 1, key: 12, r3: 20 }], ['three-on-three half court, 49 x 36 ft lines', 42, 55, 160, 0, { cl: 49, cw: 36, full: false, hoops: 1, key: 12, r3: 20 }]],
    build: (a, v) => {
      const Z0 = slab(a, 40), cw = v.cw * FT, cl = v.cl * FT, w = 50, hx = cw / 2, cx = 0;
      const yB = a.YB - 6 * FT, y0 = v.hoops === 2 ? a.YF + 6 * FT : a.YF + (a.D - cl) / 2 * 0.0 + 600;   // baseline back (hoop end), front
      const yBase = yB, yOther = yBase - cl;
      const L = (p, q, r, s) => seg(a, p, q, r, s, w, Z0, Z0 + 4);
      L(-hx, yOther, hx, yOther); L(-hx, yBase, hx, yBase); L(-hx, yOther, -hx, yBase); L(hx, yOther, hx, yBase);
      const ends = v.hoops === 2 ? [[yBase, -1], [yOther, 1]] : [[yBase, -1]];
      for (const [yb, d] of ends) {
        const kx = v.key * FT / 2, kl = 19 * FT; L(-kx, yb, -kx, yb + d * kl); L(kx, yb, kx, yb + d * kl); L(-kx, yb + d * kl, kx, yb + d * kl);
        const fy = yb + d * kl; polySeg(a, arcPts(0, fy, 6 * FT, d > 0 ? 0 : 180, d > 0 ? 180 : 360, 14).map((p) => p), w, Z0, Z0 + 4);
        const hy = yb + d * 5.25 * FT; const r3 = v.r3 * FT, ex = hx - 3 * FT;
        const exx = m.min(ex, r3 * 0.999), a0 = m.acos(exx / r3) * 180 / PI, yEnd = hy + d * m.sqrt(r3 * r3 - exx * exx);
        if (r3 > ex) { L(-ex, yb, -ex, yEnd); L(ex, yb, ex, yEnd); }
        const arc = d > 0 ? arcPts(0, hy, r3, a0, 180 - a0, 18) : arcPts(0, hy, r3, 180 + a0, 360 - a0, 18); polySeg(a, arc, w, Z0, Z0 + 4);
        }
      if (v.full) { const ym = (yBase + yOther) / 2; L(-hx, ym, hx, ym); polySeg(a, arcPts(0, ym, 6 * FT, 0, 360, 24), w, Z0, Z0 + 4); }
      const o = { bw: 1829, bh: 1067, rimH: 3048, arm: 2700, poleH: 3600, low: 150 };
      for (const [yb, d] of ends) { hoopAt(a, 0, yb - d * 1500, d, { ...o }); }
      a.log('Added the slab, boundary lines' + (v.full ? ', centre line and circle' : '') + ', key lanes, free-throw circles, three-point arcs and the hoop assemblies (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', ft: true, title: 'Generic volleyball court',
    desc: (v) => `${v.kind} court: ${v.sand ? 'a sand bed in a frame' : 'a slab'} with boundary lines${v.attack ? ', a centre line and attack lines' : ''}, two net posts with a net at ${v.nhFt} ft${v.ref ? ', antenna rods and a referee stand with ladder and seat' : ''}.`,
    vs: [['indoor, 59 x 29.5 ft lines', 38, 59, 130, 0, { kind: 'Indoor', cl: 59, cw: 29.5, attack: true, nh: 7.92, nhFt: '7.9', sand: false }], ['indoor with referee stand, 59 x 29.5 ft', 38, 62, 130, 0, { kind: 'Indoor', cl: 59, cw: 29.5, attack: true, nh: 7.92, nhFt: '7.9', ref: true }],
      ['beach sand court, 52.5 x 26.2 ft', 30, 59, 130, 0, { kind: 'Beach', cl: 52.5, cw: 26.2, attack: false, nh: 7.92, nhFt: '7.9', sand: true }], ['school court, 39 x 20 ft, lower net', 26, 39, 115, 0, { kind: 'School', cl: 39, cw: 20, attack: true, nh: 6.5, nhFt: '6.5' }]],
    build: (a, v) => {
      const Z0 = v.sand ? (a.box(a.X0, a.YF, a.Z0, a.X1, a.YB, a.Z0 + 350), a.outline(), a.Z0 + 350) : slab(a, 30);
      const cw = v.cw * FT, cl = v.cl * FT, hx = cw / 2, cy = a.YF / 2 - (v.ref ? 120 : 0), y0 = cy - cl / 2, y1 = cy + cl / 2, w = v.sand ? 50 : 50;
      const L = (p, q, r, s) => seg(a, p, q, r, s, w, Z0, Z0 + 4);
      L(-hx, y0, hx, y0); L(-hx, y1, hx, y1); L(-hx, y0, -hx, y1); L(hx, y0, hx, y1);
      if (v.attack) { L(-hx, cy, hx, cy); L(-hx, cy - 3 * FT, hx, cy - 3 * FT); L(-hx, cy + 3 * FT, hx, cy + 3 * FT); }
      const px = hx + 600, nh = v.nh * FT, save = a.Z0; a.Z0 = Z0;
      netAcross(a, px, cy, nh, nh + 160, 45, true, 1000); a.Z0 = save;
      if (v.ref) { const rx = -px - 900, ry = cy; for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.tube([[rx + dx * 380, ry + dy * 380, Z0], [rx + dx * 250, ry + dy * 250, Z0 + 1800]], [22, 22], 6); a.box(rx - 330, ry - 330, Z0 + 1780, rx + 330, ry + 330, Z0 + 1830); a.box(rx - 160, ry - 160, Z0 + 1830, rx + 160, ry + 160, Z0 + 2100);
        for (let i = 0; i < 6; i++) a.box(rx + 250, ry - 160, Z0 + 250 + i * 270, rx + 520, ry + 160, Z0 + 275 + i * 270); a.rect(rx - 380, ry - 380, rx + 380, ry + 380); }
      a.log('Added the ' + (v.sand ? 'sand bed' : 'slab') + ', court lines, net posts, net' + (v.ref ? ', antenna rods and the referee stand' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', ft: true, title: 'Generic badminton court',
    desc: (v) => `Badminton court marked on a ${v.floor}: boundary and ${v.singles ? 'singles' : 'doubles and singles'} lines, short and long service lines, centre lines, two net posts and a net 5 ft high at the posts.`,
    vs: [['doubles, 44 x 20 ft lines', 24, 44, 66, 0, { cw: 20, cl: 44, floor: 'sprung floor slab' }], ['singles, 44 x 17 ft lines', 20, 44, 66, 0, { cw: 17, cl: 44, singles: true, floor: 'sprung floor slab' }], ['short junior court, 36 x 16 ft lines', 20, 38, 62, 0, { cw: 16, cl: 36, short: true, floor: 'hard floor slab' }]],
    build: (a, v) => {
      const Z0 = slab(a, 30), cw = v.cw * FT, cl = v.cl * FT, hx = cw / 2, cy = a.YF / 2, y0 = cy - cl / 2, y1 = cy + cl / 2, w = 40;
      const L = (p, q, r, s) => seg(a, p, q, r, s, w, Z0, Z0 + 4);
      L(-hx, y0, hx, y0); L(-hx, y1, hx, y1); L(-hx, y0, -hx, y1); L(hx, y0, hx, y1);
      const sx = v.singles ? 0 : 1.5 * FT; if (!v.singles) { L(-hx + sx, y0, -hx + sx, y1); L(hx - sx, y0, hx - sx, y1); }
      const ss = 6.5 * FT; L(-hx + sx, cy - ss, hx - sx, cy - ss); L(-hx + sx, cy + ss, hx - sx, cy + ss); L(0, y0, 0, cy - ss); L(0, cy + ss, 0, y1);
      if (!v.singles) { L(-hx, y0 + 2.5 * FT, hx, y0 + 2.5 * FT); L(-hx, y1 - 2.5 * FT, hx, y1 - 2.5 * FT); }
      const sv = a.Z0; a.Z0 = Z0; netAcross(a, hx + 150, cy, 1524, 1550, 30, false, 760); a.Z0 = sv;
      a.log('Added the slab, boundary and service lines, two net posts and the net (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', title: 'Generic football goal',
    desc: (v) => `Football goal ${v.gw} ft wide and ${v.gh} ft high: two posts and a crossbar, ${v.depth} ft rear stanchions on each side, and a ${v.gw === 24 ? 'full' : ''} net on the back and both sides drawn as strands${v.ground ? ' with ground sockets' : ''}.`,
    vs: [['five-a-side, 12 x 4 ft', 150, 54, 52, 0, { gw: 12, gh: 4, depth: 4.5, pr: 38 }], ['seven-a-side, 12 x 6 ft', 150, 66, 76, 0, { gw: 12, gh: 6, depth: 5.5, pr: 45 }], ['youth, 18.5 x 6.5 ft', 226, 78, 82, 0, { gw: 18.5, gh: 6.5, depth: 6, pr: 55, ground: true }], ['full size, 24 x 8 ft', 292, 96, 102, 0, { gw: 24, gh: 8, depth: 7.5, pr: 60, ground: true }], ['handball, 3 x 2 m', 122, 46, 82, 0, { gw: 9.84, gh: 6.56, depth: 3.5, pr: 40, hb: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1 } = a, hw = v.gw * FT / 2, gh = v.gh * FT, y0 = YF + 90, yb = YB - 40, r = v.pr * 0.5 * 1.0 * 1;
      a.outline();
      for (const s of [-1, 1]) { a.cyl(s * hw, y0, Z0, Z0 + gh, 62 * v.pr / 55 + 8, 14); a.circ(s * hw, y0, 62 * v.pr / 55 + 8, 'EQUIP'); a.tube([[s * hw, y0, Z0 + gh - 40], [s * hw, yb - 300, Z0 + gh * 0.55], [s * hw, yb, Z0 + 40]], [24, 24, 24], 6); a.box(s * hw - 22, y0 - 40, Z0, s * hw + 22, yb, Z0 + 30); }
      a.xcyl(-hw, hw, y0, Z0 + gh - 62, 62 * v.pr / 55 + 8, 14);
      a.xcyl(-hw, hw, yb - 300, Z0 + gh * 0.55, 22, 8);
      const zb = Z0 + gh - 62;
      strands(a, [-hw, y0, zb], [hw, y0, zb], [hw, yb, Z0 + 40], [-hw, yb, Z0 + 40], 22, 7, 2.5);
      for (const s of [-1, 1]) strands(a, [s * hw, y0, zb], [s * hw, yb - 300, Z0 + gh * 0.55], [s * hw, yb, Z0 + 40], [s * hw, y0, Z0 + 40], 6, 6, 2.5);
      a.box(-hw, y0 - 8, Z0, hw, y0 + 8, Z0 + 12); a.line(-hw, y0, hw, y0, 'EQUIP'); a.rect(-hw, y0, hw, yb, 'EQUIP-DETAIL');
      a.log('Added the posts and crossbar, rear stanchions and the net on the back and sides (plan and 3D).');
    } }),
];


// ------------------------------------------------------------------------------------------ equipment
function ellRing(a, cx, cy, cz, rx, rz, r, n = 28, sides = 6) { const p = []; for (let i = 0; i <= n; i++) { const t = (i / n) * 2 * PI; p.push([cx + rx * m.cos(t), cy, cz + rz * m.sin(t)]); } a.tube(p, p.map(() => r), sides); }
/** a dome of revolution about the Z axis: radius R, height H, from z0; circular section */
function dome(a, cx, cy, z0, R, H, n = 7, seg_ = 20) { const pts = [], rs = []; for (let i = 0; i <= n; i++) { const th = (i / n) * 82 * PI / 180; pts.push([cx, cy, z0 + H * m.sin(th)]); rs.push(R * m.cos(th)); } a.tube(pts, rs, seg_); }
function domeRib(a, cx, cy, z0, R, H, phi, r = 6, n = 7) { const p = []; for (let i = 0; i <= n; i++) { const th = (i / n) * 80 * PI / 180, rr = R * m.cos(th) * 1.02; p.push([cx + rr * m.cos(phi), cy + rr * m.sin(phi), z0 + H * m.sin(th) * 1.02]); } a.tube(p, p.map(() => r), 5); }

const EQUIP = [
  fam({ cat: 'sport/equipment', title: 'Generic racket on stand',
    desc: (v) => `${v.kind} racket ${v.L} in long shown upright on a round display stand: a wrapped handle with butt cap, a Y-shaped throat, an oval frame of ${v.hw} x ${v.hh} in and a crossed string bed of ${v.nv + v.nc} strands.`,
    vs: [['tennis, adult, 27 in', 27, 10.5, 12.5, 8, 7, 18, { L: 27, hw: 10.5, hh: 12.5, hl: 8, nv: 16, nc: 18, kind: 'Tennis' }], ['tennis, junior, 23 in', 23, 9.5, 11, 8, 7, 16, { L: 23, hw: 9.5, hh: 11, hl: 7, nv: 14, nc: 16, kind: 'Junior tennis' }],
      ['badminton, 26 in', 26, 8, 10, 8, 8, 14, { L: 26, hw: 7.2, hh: 9, hl: 8.5, nv: 11, nc: 13, kind: 'Badminton', th: 1.5 }], ['squash, 27 in', 27, 8, 11, 8, 9, 14, { L: 27, hw: 7.5, hh: 9.2, hl: 8.5, nv: 11, nc: 12, kind: 'Squash', th: 0.9 }]]
      .map(([l, L, , , w, , , p]) => [l, 9, 9, L + 5, 0, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, L = v.L * IN, hw = (v.hw * IN) / 2, hh = (v.hh * IN) / 2, zb = Z0 + 110, hl = v.hl * IN;
      a.outline(); stand(a, cx, cy, 100, 110); ring(a, 'xy', cx, cy, zb + 60, 24, 4, 14, 5);
      a.cyl(cx, cy, zb, zb + hl, 16, 10); a.cyl(cx, cy, zb, zb + 14, 20, 10); a.cyl(cx, cy, zb + hl - 4, zb + hl + 6, 20, 10);
      const zc = zb + L - hh, zbot = zc - hh;
      for (const s of [-1, 1]) a.tube([[cx + s * 10, cy, zb + hl], [cx + s * hw * 0.3, cy, zbot - 4 - (zbot - zb - hl) * 0.35], [cx + s * hw * 0.82, cy, zc - hh * 0.55 + 6]], [11, 10, 9], 6);
      ellRing(a, cx, cy, zc, hw, hh, 9, 30, 6);
      for (let i = 1; i < v.nv; i++) { const x = -hw + (2 * hw * i) / v.nv, h = hh * m.sqrt(1 - (x / hw) ** 2); a.tube([[cx + x, cy, zc - h], [cx + x, cy, zc + h]], [1.4, 1.4], 4); }
      for (let j = 1; j < v.nc; j++) { const z = -hh + (2 * hh * j) / v.nc, w = hw * m.sqrt(1 - (z / hh) ** 2); a.tube([[cx - w, cy, zc + z], [cx + w, cy, zc + z]], [1.4, 1.4], 4); }
      a.ellp(cx, cy, hw, 10, 'EQUIP-DETAIL'); a.log('Added the base and stand, grip with butt cap, Y-throat, oval frame and string bed (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', title: 'Generic sports ball',
    desc: (v) => `${v.kind} ${v.dia} in ${v.kind === 'Rugby' ? 'long' : 'across'}, resting in a low cup: ${v.detail}.`,
    vs: [['soccer, size 5', 8.7, 8.7, 10, 0, { kind: 'Soccer', dia: 8.7, detail: 'a round shell with panel seams and six raised patches' }], ['basketball, size 7', 9.5, 9.5, 11, 0, { kind: 'Basketball', dia: 9.4, detail: 'a round shell with a raised channel pattern of four seams' }],
      ['volleyball', 8.4, 8.4, 9.5, 0, { kind: 'Volleyball', dia: 8.3, detail: 'a round shell with long panel seams' }], ['tennis, felt', 4, 4, 4.4, 0, { kind: 'Tennis', dia: 2.7, detail: 'a round shell with a wave seam' }], ['rugby, size 5', 12, 8, 8.2, 0, { kind: 'Rugby', dia: 11.4, detail: 'a pointed oval with four panel seams and a lace panel' }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, D = v.dia * IN, R = D / 2, cz = Z0 + (v.kind === 'Rugby' ? 3.3 * IN : R * 1.0) + 14;
      a.outline(); a.cone(cx, cy, Z0, Z0 + 18, R * 0.5, R * 0.42, 18); a.circ(cx, cy, R * 0.5, 'EQUIP-DETAIL');
      const rr = (r) => r * 1.012;
      if (v.kind === 'Rugby') {
        const Lh = D / 2, Rw = 3.5 * IN, pr = [10, Rw * 0.78, Rw, Rw, Rw * 0.78, 10], px = [-Lh, -Lh * 0.7, -Lh * 0.3, Lh * 0.3, Lh * 0.7, Lh];
        a.tube(px.map((x) => [cx + x, cy, cz]), pr, 18);
        for (const t of [0, PI / 2, PI, 3 * PI / 2]) a.tube(px.map((x, i) => [cx + x, cy + m.cos(t) * pr[i] * 1.02, cz + m.sin(t) * pr[i] * 1.02]), [2, 2, 2, 2, 2, 2], 4);
        a.box(cx - Lh * 0.28, cy - 8, cz + Rw * 0.98, cx + Lh * 0.28, cy + 8, cz + Rw * 1.04); for (let i = -2; i <= 2; i++) a.box(cx + i * Lh * 0.1 - 3, cy - 24, cz + Rw * 1.0, cx + i * Lh * 0.1 + 3, cy + 24, cz + Rw * 1.05);
        a.ellp(cx, cy, Lh, Rw); return a.log('Added the cup, pointed oval shell, panel seams and lace panel (plan and 3D).');
      }
      a.ell(cx, cy, cz, R, R, R, 24, 14);
      if (v.kind === 'Soccer') { for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) a.ell(cx + dx * R * 0.97, cy + dy * R * 0.97, cz + dz * R * 0.97, R * 0.24 * (dx ? 0.35 : 1), R * 0.24 * (dy ? 0.35 : 1), R * 0.24 * (dz ? 0.35 : 1), 10, 5); ring(a, 'xz', cx, cy, cz, rr(R), 1.8, 28, 4); ring(a, 'yz', cx, cy, cz, rr(R), 1.8, 28, 4); }
      else if (v.kind === 'Basketball') { ring(a, 'xz', cx, cy, cz, rr(R), 2.2, 28, 4); ring(a, 'yz', cx, cy, cz, rr(R), 2.2, 28, 4); ring(a, 'xy', cx, cy, cz, rr(R), 2.2, 28, 4); for (const ph of [PI / 4, -PI / 4]) { const p = []; for (let i = 0; i <= 28; i++) { const t = (i / 28) * 2 * PI; p.push([cx + m.cos(t) * rr(R) * m.cos(ph), cy + m.cos(t) * rr(R) * m.sin(ph), cz + m.sin(t) * rr(R)]); } a.tube(p, p.map(() => 2.2), 4); } }
      else if (v.kind === 'Volleyball') { for (const ph of [0, PI / 3, 2 * PI / 3]) { const p = []; for (let i = 0; i <= 28; i++) { const t = (i / 28) * 2 * PI; p.push([cx + m.cos(t) * rr(R) * m.cos(ph), cy + m.cos(t) * rr(R) * m.sin(ph), cz + m.sin(t) * rr(R)]); } a.tube(p, p.map(() => 1.8), 4); } }
      else { const p = [], q = []; for (let i = 0; i <= 28; i++) { const t = (i / 28) * 2 * PI; p.push([cx + m.cos(t) * rr(R), cy + m.sin(t) * rr(R) * 0.0 + 0, cz + m.sin(t) * rr(R) * 0.95 + m.sin(2 * t) * R * 0.18]); } a.tube(p.map(([x, , z]) => [x, cy + (z - cz) * 0.0 + m.sin((x - cx) / R * 3) * R * 0.35, z]), p.map(() => 1.3), 4); }
      a.circ(cx, cy, R, 'EQUIP'); a.log('Added the cup, round shell and seam detail (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', title: 'Generic bat on stand',
    desc: (v) => `${v.kind} bat ${v.len} in long on a display stand with two prongs: ${v.cricket ? 'a cylindrical wrapped handle, a flat-faced blade with a back ridge and a splice' : 'a round barrel tapering to a thin handle with a grip and a flared knob'}.`,
    vs: [['baseball, 32 in', 32, 3.5, 3.5, 0, { len: 32, kind: 'Baseball', bd: 2.6 }], ['softball, 34 in', 34, 3.5, 3.5, 0, { len: 34, kind: 'Softball', bd: 2.25 }], ['cricket, 34 in', 34, 5, 3.5, 0, { len: 34, kind: 'Cricket', cricket: true }]]
      .map(([l, L, w, d, z, p]) => [l, 8, 8, L + 5, z, p]),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, L = v.len * IN, zb = Z0 + 120; a.outline(); stand(a, cx, cy, 100, 120); ring(a, 'xy', cx, cy, zb + 50, 26, 4, 14, 5);
      if (v.cricket) {
        a.cyl(cx, cy, zb, zb + 10.5 * IN, 15, 10); a.cyl(cx, cy, zb + 1.5 * IN, zb + 8 * IN, 17.5, 10);
        a.box(cx - 54, cy - 13, zb + 10.5 * IN, cx + 54, cy + 13, zb + L); a.box(cx - 22, cy + 13, zb + 11 * IN, cx + 22, cy + 22, zb + L - 14);
        a.prism([[cx - 22, cy - 13], [cx + 22, cy - 13], [cx + 54, cy - 13], [cx, cy - 13]].slice(0, 3), zb + 10 * IN, zb + 10.5 * IN);
        a.box(cx - 54, cy - 15, zb + L - 60, cx + 54, cy - 13, zb + L - 20); a.ellp(cx, cy, 54, 15);
      } else {
        const bd = v.bd * IN / 2;
        a.tube([[cx, cy, zb], [cx, cy, zb + 12 * IN], [cx, cy, zb + 17 * IN], [cx, cy, zb + 22 * IN], [cx, cy, zb + 26 * IN], [cx, cy, zb + L]], [14, 14, bd * 0.55, bd * 0.95, bd, bd * 0.98], 14);
        a.cyl(cx, cy, zb + 1 * IN, zb + 11 * IN, 16, 10); a.cone(cx, cy, zb - 4, zb + 12, 22, 17, 12); a.cyl(cx, cy, zb + L - 6, zb + L, bd * 0.9, 14); a.circ(cx, cy, bd, 'EQUIP');
      }
      a.log('Added the stand with prongs, handle, grip and ' + (v.cricket ? 'blade' : 'barrel') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', title: 'Generic helmet',
    desc: (v) => `${v.kind} helmet: a ${v.cage ? 'rounded shell with ear covers and a front face cage of vertical and horizontal bars' : 'ribbed ventilated shell with a front peak, inner pad ring'}, with a chin strap and buckle laid out in front.`,
    vs: [['cycling, adult', 9, 11, 6.5, 0, { kind: 'Cycling', R: 4.2, H: 4.6, cage: false }], ['cycling, child', 8, 10, 6, 0, { kind: 'Child cycling', R: 3.6, H: 4.1, cage: false }], ['hockey, with face cage', 9.5, 13, 9, 0, { kind: 'Hockey', R: 4.3, H: 5.2, cage: true }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF * 0.38, R = v.R * IN, H = v.H * IN, z0 = Z0; a.outline();
      dome(a, cx, cy, z0 + 18, R, H, 8, 22); a.cyl(cx, cy, z0 + 18, z0 + 22, R, 22); ring(a, 'xy', cx, cy, z0 + 26, R * 0.92, 7, 24, 5); a.circ(cx, cy, R, 'EQUIP');
      if (v.cage) {
        for (const s of [-1, 1]) { a.xcyl(cx + s * (R - 4), cx + s * (R + 22), cy, z0 + 80, 52, 14); a.rect(cx + s * R - 20, cy - 52, cx + s * (R + 22), cy + 52, 'EQUIP-DETAIL'); }
        const yf = (x) => cy - m.sqrt(m.max(0, R * R * 1.05 - x * x)) - 4;
        for (let i = -2; i <= 2; i++) { const x = i * R * 0.34; a.tube([[cx + x, yf(x), z0 + 150], [cx + x, yf(x) - 24, z0 + 70], [cx + x, yf(x) - 40, z0 + 8]], [3, 3, 3], 5); }
        for (const zz of [28, 80, 135]) { const p = []; for (let i = -6; i <= 6; i++) { const x = (i / 6) * R * 0.8; p.push([cx + x, yf(x) - (150 - zz) * 0.24, z0 + zz]); } a.tube(p, p.map(() => 3), 4); }
      } else {
        for (let k = 0; k < 8; k++) domeRib(a, cx, cy, z0 + 18, R, H, (k / 8) * 2 * PI + 0.2, 5.5, 8);
        a.prism([[cx - R * 0.7, cy - R * 0.9], [cx + R * 0.7, cy - R * 0.9], [cx + R * 0.55, cy - R * 1.28], [cx - R * 0.55, cy - R * 1.28]], z0 + 50, z0 + 58);
      }
      for (const s of [-1, 1]) a.box(cx + s * R * 0.75 - 8, YF + 60, z0, cx + s * R * 0.75 + 8, cy - R * 0.5, z0 + 3);
      a.box(cx - R * 0.75, YF + 25, z0, cx + R * 0.75, YF + 50, z0 + 12);
      a.log('Added the shell, ' + (v.cage ? 'ear covers and face cage' : 'vent ribs and peak') + ', pad ring and chin strap (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', title: 'Generic pair of skis',
    desc: (v) => `Pair of ${v.kind} skis ${v.cm} cm long, standing upright in a floor stand: waisted outlines, curled tips, ${v.bind ? 'bindings with toe and heel pieces' : 'a simple three-pin style toe plate'} and a base plate with two slots.`,
    vs: [['alpine, 160 cm', 14, 9, 63 + 4, 0, { cm: 160, kind: 'alpine', wt: 5.5, ww: 2.7, wc: 3.1, bind: true }], ['alpine, 180 cm', 14, 9, 71 + 4, 0, { cm: 180, kind: 'alpine', wt: 6, ww: 2.9, wc: 3.3, bind: true }], ['cross-country, 200 cm', 11, 9, 79 + 4, 0, { cm: 200, kind: 'cross-country', wt: 4.5, ww: 4.2, wc: 4.4, bind: false }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, L = v.cm * 10, zb = Z0 + 90, sp = v.bind ? 110 : 95; a.outline();
      a.box(cx - sp - 90, cy - 70, Z0, cx + sp + 90, cy + 70, zb - 40); a.rect(cx - sp - 90, cy - 70, cx + sp + 90, cy + 70);
      for (const s of [-1, 1]) {
        const x0 = cx + s * sp, N = 32, ww = v.ww * 5, wc = v.wc * 5, wt = v.wt * 5;
        const W = (f) => (f > 0.62 ? ww + (wt - ww) * ((f - 0.62) / 0.38) ** 2 : f < 0.38 ? ww + (wc - ww) * ((0.38 - f) / 0.38) ** 2 : ww);
        for (let i = 0; i < N; i++) { const f = (i + 0.5) / N, z0 = zb + (L * i) / N, z1 = zb + (L * (i + 1)) / N, tip = f > 0.94 ? (f - 0.94) * 600 : 0; a.box(x0 - W(f), cy - 7 - tip, z0, x0 + W(f), cy + 7 - tip, z1); }
        a.box(x0 - 30, cy - 18, zb + L * 0.45, x0 + 30, cy - 7, zb + L * 0.45 + 60);
        if (v.bind) { a.box(x0 - 34, cy - 42, zb + L * 0.4, x0 + 34, cy - 7, zb + L * 0.4 + 70); a.box(x0 - 34, cy - 40, zb + L * 0.55, x0 + 34, cy - 7, zb + L * 0.55 + 110); } else a.box(x0 - 36, cy - 22, zb + L * 0.5, x0 + 36, cy - 7, zb + L * 0.5 + 40);
        a.rect(x0 - 30, cy - 7, x0 + 30, cy + 7, 'EQUIP-DETAIL');
      }
      a.log('Added the floor stand and the two skis with waisted outline, tip, binding pieces (plan and 3D).');
    } }),
];


/** a wheel in the X-Z plane (axle along Y) at (cx, cy, cz) */
function wheelXZ(a, cx, cy, cz, R, tyre, spokes = 12) {
  ring(a, 'xz', cx, cy, cz, R - tyre, tyre, 30, 7); ring(a, 'xz', cx, cy, cz, R - tyre * 2.1, 2.5, 24, 4); a.ycyl(cy - 30, cy + 30, cx, cz, 9, 8);
  for (let i = 0; i < spokes; i++) { const t = (i / spokes) * 2 * PI; a.tube([[cx, cy + (i % 2 ? 12 : -12), cz], [cx + m.cos(t) * (R - tyre * 2.1), cy, cz + m.sin(t) * (R - tyre * 2.1)]], [1.1, 1.1], 4); }
  a.rect(cx - R, cy - tyre, cx + R, cy + tyre, 'EQUIP-DETAIL');
}
/** a stadium-shaped convex polygon (rounded ends) from x0 to x1, half width w, n points per end */
function stadium(x0, x1, w, cy, n = 7) { const p = []; for (let i = 0; i <= n; i++) { const t = -PI / 2 + (PI * i) / n; p.push([x1 - w + w * m.cos(t), cy + w * m.sin(t)]); } for (let i = 0; i <= n; i++) { const t = PI / 2 + (PI * i) / n; p.push([x0 + w + w * m.cos(t), cy + w * m.sin(t)]); } return p; }
function skate(a, o) {
  const { Z0, YF } = a, cy = YF / 2, L = a.W, w = o.wid / 2, zd = Z0 + o.wr * 2 + o.tk + 8; a.outline();
  const half = L / 2 - 4, flat = half - o.kick;
  a.prism(stadium(-flat, flat, w, cy, 8), zd, zd + 17);
  for (const s of [-1, 1]) {
    const xa = s * flat, xb = s * (flat + o.kick * 0.5), xc = s * half;
    const k1 = [[xa, cy - w], [xb, cy - w], [xb + s * w * 0.8, cy - w * 0.5], [xb + s * w, cy], [xb + s * w * 0.8, cy + w * 0.5], [xb, cy + w], [xa, cy + w]];
    a.prism(s > 0 ? k1 : k1.slice().reverse(), zd + 8, zd + 28);
    const k2 = [[xb, cy - w * 0.95], [xc, cy - w * 0.6], [xc, cy + w * 0.6], [xb, cy + w * 0.95]];
    a.prism(s > 0 ? k2 : k2.slice().reverse(), zd + 24, zd + 44);
    const tx = s * o.truck;
    a.box(tx - 38, cy - w * 0.6, zd - 8, tx + 38, cy + w * 0.6, zd);
    a.box(tx - 20, cy - w * 0.88, Z0 + o.wr * 2 - 4, tx + 20, cy + w * 0.88, Z0 + o.wr * 2 + o.tk * 0.5);
    a.box(tx - 14, cy - w * 0.4, Z0 + o.wr * 2, tx + 14, cy + w * 0.4, zd - 8);
    a.ycyl(cy - w * 0.94, cy + w * 0.94, tx, Z0 + o.wr, 5, 8);
    for (const sy of [-1, 1]) { const y0 = cy + sy * (w * 0.62), y1 = cy + sy * (w * 0.62 + o.ww); a.ycyl(m.min(y0, y1), m.max(y0, y1), tx, Z0 + o.wr, o.wr, 18); a.rect(tx - o.wr, m.min(y0, y1), tx + o.wr, m.max(y0, y1), 'EQUIP-DETAIL'); }
  }
  a.line(-flat, cy, flat, cy, 'EQUIP-DETAIL'); a.log('Added the deck with raised ends, two trucks with axles and four wheels (plan and 3D).');
}
/** an upright board (surf or snow): stepped slices of a width curve, optional fins or binding plates. o: len(mm) wmax(mm) shape(f)->0..1 thick */
function boardUp(a, o) {
  const { Z0, YF, cx } = a, cy = YF / 2, zb = Z0 + 120, N = 60; a.outline(); stand(a, cx, cy, 130, 120); a.box(cx - 120, cy - 15, zb - 30, cx + 120, cy + 15, zb + 20);
  for (let i = 0; i < N; i++) { const f = (i + 0.5) / N, z0 = zb + (o.len * i) / N, z1 = zb + (o.len * (i + 1)) / N, w = (o.wmax / 2) * o.shape(f), th = o.thick * (0.55 + 0.45 * m.sin(m.min(1, f * 1.05) * PI)) ; a.box(cx - w, cy - th / 2 + o.rocker(f), z0, cx + w, cy + th / 2 + o.rocker(f), z1); }
  o.extra && o.extra(a, cx, cy, zb); a.ellp(cx, cy, o.wmax / 2, 20); a.log(o.log);
}

const BOARDS = [
  fam({ cat: 'sport/equipment', title: 'Generic skateboard',
    desc: (v) => `${v.kind} ${v.len} in long, lying on its wheels: a deck with raised nose and tail, two trucks with baseplates and axles, and four wheels of ${v.wd} mm.`,
    vs: [['street deck, 31 in', 31, 8, 5.5, 0, { len: 31, wid: 8, wd: 52, kind: 'Skateboard' }], ['cruiser deck, 28 in', 28, 8.5, 6.2, 0, { len: 28, wid: 8.5, wd: 60, kind: 'Cruiser skateboard' }], ['longboard, 42 in', 42, 9.5, 7.2, 0, { len: 42, wid: 9.5, wd: 70, kind: 'Longboard skateboard' }]],
    build: (a, v) => skate(a, { wid: v.wid * IN, wr: v.wd / 2, tk: 22, kick: v.len * IN * 0.17, truck: v.len * IN * 0.25, ww: 32 }) }),

  fam({ cat: 'sport/equipment', title: 'Generic snowboard on stand',
    desc: (v) => `Snowboard ${v.cm} cm long standing upright on a floor stand: a waisted outline with turned nose and tail, a flat deck and two binding plates with straps.`,
    vs: [['freeride, 152 cm', 12, 10, 60 + 6, 0, { cm: 152, wm: 25 }], ['all-mountain, 158 cm', 12, 10, 62 + 6, 0, { cm: 158, wm: 25.5 }], ['wide deck, 164 cm', 12, 10, 64.5 + 6, 0, { cm: 164, wm: 26.5 }]],
    build: (a, v) => boardUp(a, { len: v.cm * 10, wmax: v.wm * 10, thick: 22, shape: (f) => 0.9 + 0.1 * m.pow(m.abs(f - 0.5) * 2, 2) - (f > 0.94 ? (f - 0.94) * 6 : f < 0.06 ? (0.06 - f) * 6 : 0), rocker: (f) => -(f > 0.9 ? (f - 0.9) * 200 : f < 0.1 ? (0.1 - f) * 200 : 0),
      extra: (a_, cx, cy, zb) => { for (const f of [0.34, 0.66]) { const z = zb + v.cm * 10 * f; a.ycyl(cy - 50, cy - 12, cx, z, 100, 14); a.box(cx - 90, cy - 62, z - 70, cx + 90, cy - 40, z + 70); a.box(cx - 100, cy - 50, z + 60, cx + 100, cy - 44, z + 100); } }, log: 'Added the stand, the waisted deck with turned ends and two binding plates (plan and 3D).' }) }),

  fam({ cat: 'sport/equipment', title: 'Generic surfboard on stand',
    desc: (v) => `Surfboard ${v.ft} ft long standing upright on a floor stand: a pointed nose, a rounded tail, a stringer ridge and ${v.fins} fins at the tail.`,
    vs: [['shortboard, 6 ft 2 in, three fins', 12, 10, 74 + 6, 0, { ft: 6.17, fins: 3, wm: 19.5 }], ['funboard, 7 ft 6 in, three fins', 12, 10, 90 + 6, 0, { ft: 7.5, fins: 3, wm: 21.5 }], ['longboard, 9 ft 2 in, single fin', 12, 10, 110 + 6, 0, { ft: 9.17, fins: 1, wm: 22.5 }]],
    build: (a, v) => boardUp(a, { len: v.ft * FT, wmax: v.wm * IN, thick: 60, shape: (f) => m.pow(m.sin(m.pow(f, 0.78) * PI), 0.62) * 0.98 + (f > 0.96 ? 0 : 0), rocker: () => 0,
      extra: (a_, cx, cy, zb) => { a.box(cx - 4, cy - 34, zb + 40, cx + 4, cy - 30, zb + v.ft * FT - 150); const fz = zb + 300; const fin = (x, h, w) => { a.box(x - 5, cy + 28, fz - 20, x + 5, cy + 28 + w * 0.7, fz + h); };
        if (v.fins === 3) { fin(cx - 140, 120, 120); fin(cx + 140, 120, 120); fin(cx, 130, 130); } else { a.box(cx - 5, cy + 28, zb + 150, cx + 5, cy + 28 + 190, zb + 330); } }, log: 'Added the stand, the outline from nose to tail, the stringer ridge and the fins (plan and 3D).' }) }),

  fam({ cat: 'sport/equipment', title: 'Generic bicycle',
    desc: (v) => `${v.kind} bicycle standing on its two ${v.wheel} wheels: a diamond frame of top, down, seat tube and stays, a fork, ${v.drop ? 'drop' : 'flat'} handlebars on a stem, a saddle on a post, a chainring with crank and pedals and a rear sprocket.`,
    vs: [['road, 700c wheels', 68, 17, 41, 0, { kind: 'Road', wheel: '700c', R: 340, tyre: 11, wb: 985, cs: 410, st: 540, tt: 540, ha: 73, drop: true, bar: 420 }], ['mountain, 29 in wheels', 72, 28, 43, 0, { kind: 'Mountain', wheel: '29 in', R: 372, tyre: 26, wb: 1170, cs: 435, st: 450, tt: 610, ha: 69, drop: false, bar: 740 }], ['child, 16 in wheels', 46, 18, 31, 0, { kind: 'Child', wheel: '16 in', R: 205, tyre: 22, wb: 760, cs: 260, st: 250, tt: 330, ha: 70, drop: false, bar: 420 }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, R = v.R, Rz = Z0 + R, rax = cx - v.wb / 2 - 0, fax = cx + v.wb / 2, bb = [rax + v.cs, cy, Z0 + R - (R > 300 ? 70 : 20)], ha = (v.ha * PI) / 180, fl = R * 1.05;
      a.outline(); wheelXZ(a, rax, cy, Rz, R, v.tyre); wheelXZ(a, fax, cy, Rz, R, v.tyre);
      const sa = (73 * PI) / 180, S = [bb[0] - m.cos(sa) * v.st, cy, bb[2] + m.sin(sa) * v.st], H0 = [fax - m.cos(ha) * fl, cy, Rz + m.sin(ha) * fl], H1 = [H0[0] - m.cos(ha) * 120, cy, H0[2] + m.sin(ha) * 120];
      const T = (p, q, r = 14) => a.tube([p, q], [r, r], 7);
      T(bb, S); T(S, H1); T(bb, H0, 16); T(H0, H1, 17);
      for (const sy of [-1, 1]) { T([bb[0], cy + sy * 55, bb[2]], [rax, cy + sy * 55, Rz], 9); T([S[0], cy + sy * 45, S[2] - 20], [rax, cy + sy * 55, Rz], 8); T([H0[0] + 20, cy + sy * 50, H0[2]], [fax, cy + sy * 50, Rz], 11); }
      a.tube([[H0[0] - 10, cy - 50, H0[2] + 10], [H0[0] - 10, cy + 50, H0[2] + 10]], [14, 14], 6);
      const stm = [H1[0] - m.cos(ha) * 40, cy, H1[2] + m.sin(ha) * 40 + 15]; T(H1, [stm[0] - 40, cy, stm[2] + 40], 11);
      const hb = [stm[0] - 40, cy, stm[2] + 40]; a.tube([[hb[0], cy - v.bar / 2, hb[2]], [hb[0], cy + v.bar / 2, hb[2]]], [11, 11], 7);
      if (v.drop) for (const sy of [-1, 1]) a.tube([[hb[0], cy + sy * v.bar / 2, hb[2]], [hb[0] + 80, cy + sy * v.bar / 2, hb[2] + 0], [hb[0] + 110, cy + sy * v.bar / 2, hb[2] - 90], [hb[0] + 60, cy + sy * v.bar / 2, hb[2] - 170]], [11, 11, 11, 11], 6);
      else for (const sy of [-1, 1]) a.box(hb[0] - 60, cy + sy * v.bar / 2 - 15 * sy - 16, hb[2] - 14, hb[0] + 60, cy + sy * v.bar / 2 + 16 - 15 * sy, hb[2] + 14);
      const sp = [S[0] - m.cos(sa) * 70, cy, S[2] + m.sin(sa) * 70]; T(S, sp, 12); a.box(sp[0] - 140, cy - 70, sp[2], sp[0] + 120, cy + 70, sp[2] + 50); a.tube([[sp[0] - 120, cy, sp[2] + 30], [sp[0] + 100, cy, sp[2] + 30]], [22, 22], 6);
      a.ycyl(cy - 55, cy + 55, bb[0], bb[2], 18, 10); ring(a, 'xz', bb[0], cy + 62, bb[2], R > 300 ? 90 : 60, 4, 20, 4); ring(a, 'xz', rax, cy + 52, Rz, 55, 3, 14, 4);
      for (const [sy, ang] of [[-1, 0.5], [1, 0.5 + PI]]) { const px = bb[0] + m.cos(ang) * 170, pz = bb[2] + m.sin(ang) * 170; a.tube([[bb[0], cy + sy * 60, bb[2]], [px, cy + sy * 70, pz]], [8, 8], 5); a.box(px - 50, cy + sy * 70 - 40 + 40 * (sy > 0 ? 0 : 0), pz - 8, px + 50, cy + sy * 70 + (sy > 0 ? 60 : -60), pz + 8); }
      a.tube([[bb[0], cy + 60, bb[2] + 60], [rax, cy + 52, Rz + 55]], [2, 2], 4); a.tube([[bb[0], cy + 60, bb[2] - 60], [rax, cy + 52, Rz - 55]], [2, 2], 4);
      a.log('Added the wheels with spokes, diamond frame, fork, handlebars, saddle, chainring, crank and pedals (plan and 3D).');
    } }),
];


// ------------------------------------------------------------------------------------------ fitness
/** a plate-loaded or selectorised weight stack: n plates of size w x d, plate height ph, gap g, from z0, with guide rods and a selector pin */
function wstack(a, cx, cy, z0, w, d, n, ph, g, pinAt = 2) {
  for (let i = 0; i < n; i++) a.box(cx - w / 2, cy - d / 2, z0 + i * (ph + g), cx + w / 2, cy + d / 2, z0 + i * (ph + g) + ph);
  for (const s of [-1, 1]) a.cyl(cx + s * (w / 2 - 14), cy, z0, z0 + n * (ph + g) + 30, 6, 6);
  a.box(cx - w / 2 - 4, cy - d / 2 - 4, z0 + n * (ph + g), cx + w / 2 + 4, cy + d / 2 + 4, z0 + n * (ph + g) + 24);
  a.ycyl(cy - d / 2 - 40, cy + d / 2, cx, z0 + pinAt * (ph + g) + ph / 2, 7, 6); a.rect(cx - w / 2, cy - d / 2, cx + w / 2, cy + d / 2, 'EQUIP-DETAIL');
}
/** a square steel upright (x,y) between z0 and z1, size s */
function up(a, x, y, z0, z1, s = 38) { a.box(x - s / 2, y - s / 2, z0, x + s / 2, y + s / 2, z1); }
/** a pad (cushion): box with rounded ends along X */
function pad(a, x0, y0, z0, x1, y1, z1) { a.box(x0, y0, z0, x1, y1, z1 - 8); a.box(x0 + 6, y0 + 6, z1 - 10, x1 - 6, y1 - 6, z1); }

const FIT = [
  fam({ cat: 'sport/fitness', title: 'Generic treadmill',
    desc: (v) => v.pad ? 'Walking pad treadmill: a flat deck with side rails, front and rear rollers, a low motor cover and a small remote shelf; no uprights or handrails.' : `Treadmill with a ${v.dk} in running deck: side rails, front and rear rollers, a motor hood, two uprights, handrails and a console with a display and a tray${v.fold ? ', and transport wheels on the folding base' : ''}.`,
    vs: [['compact folding, 55 in deck', 28, 70, 58, 0, { dk: 55, fold: true }], ['commercial, 60 in deck', 35, 80, 62, 0, { dk: 60 }], ['walking pad, 47 in deck', 22, 56, 6, 0, { dk: 47, pad: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const hood = YB - (v.pad ? 300 : 0.2 * D), rw = W / 2 - (v.pad ? 25 : 60), zr = Z0 + (v.pad ? 40 : 130);
      for (const s of [-1, 1]) { a.box(cx + s * rw - 30, YF + 20, zr, cx + s * rw + 30, hood + 40, zr + (v.pad ? 52 : 90)); a.box(cx + s * (rw - 50) - 12, YF + 40, zr + 20, cx + s * (rw - 50) + 12, hood, zr + (v.pad ? 52 : 110)); }
      a.box(cx - rw + 30, YF + 70, zr + (v.pad ? 36 : 70), cx + rw - 30, hood, zr + (v.pad ? 46 : 100)); a.box(cx - rw + 30, YF + 80, zr + (v.pad ? 46 : 100), cx + rw - 30, hood - 20, zr + (v.pad ? 52 : 108));
      for (const y of [YF + 60, hood - 30]) a.xcyl(cx - rw + 10, cx + rw - 10, y, zr + (v.pad ? 40 : 76), v.pad ? 30 : 40, 14);
      for (let i = 1; i < 14; i++) a.line(cx - rw + 40, YF + 80 + i * ((hood - YF - 120) / 14), cx + rw - 40, YF + 80 + i * ((hood - YF - 120) / 14), 'EQUIP-DETAIL');
      a.box(cx - rw + 30, hood, Z0 + (v.pad ? 20 : 110), cx + rw - 30, YB - 10, Z0 + (v.pad ? 120 : 470)); a.rect(cx - rw + 30, hood, cx + rw - 30, YB - 10, 'EQUIP');
      if (v.pad) { a.box(cx - 90, YB - 280, Z0 + 120, cx + 90, YB - 240, Z0 + 135); return a.log('Added the deck, side rails, rollers, motor cover and remote shelf (plan and 3D).'); }
      for (const s of [-1, 1]) { a.tube([[cx + s * (rw - 20), YB - 100, Z0 + 440], [cx + s * (rw - 30), YB - 130, Z1 - 230]], [26, 24], 8); a.tube([[cx + s * (rw - 30), YB - 130, Z1 - 240], [cx + s * (rw - 20), YB - 330, Z1 - 330], [cx + s * (rw - 10), YF + D * 0.55, Z0 + 0.62 * a.H]], [16, 16, 16], 6); }
      a.box(cx - rw + 10, YB - 330, Z1 - 250, cx + rw - 10, YB - 90, Z1 - 120); a.box(cx - rw + 60, YB - 345, Z1 - 235, cx + rw - 60, YB - 330, Z1 - 150); a.box(cx - 80, YB - 360, Z1 - 120, cx + 80, YB - 330, Z1 - 115);
      a.tube([[cx - rw + 10, YB - 330, Z1 - 190], [cx + rw - 10, YB - 330, Z1 - 190]], [14, 14], 7); a.rect(cx - rw + 10, YB - 330, cx + rw - 10, YB - 90, 'EQUIP-DETAIL');
      if (v.fold) for (const s of [-1, 1]) a.xcyl(cx + s * rw - 40, cx + s * rw + 40, YF + 50, Z0 + 60, 50, 12);
      a.log('Added the deck, side rails, rollers, motor hood, uprights, handrails and the console with display (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic weight bench',
    desc: (v) => `${v.kind} bench: ${v.adj ? 'a seat pad and a back pad that sits at ' + v.ang + ' degrees on a ratchet bar' : 'a long padded top'} on a steel frame of tube rails with floor feet${v.dec ? ', with ankle roller pads at the foot end' : ''}.`,
    vs: [['flat utility, 48 in pad', 24, 56, 18, 0, { kind: 'Flat utility', adj: false, ang: 0 }], ['adjustable incline, 45 degrees', 26, 56, 46, 0, { kind: 'Adjustable', adj: true, ang: 45 }], ['decline, 18 degrees with ankle rollers', 26, 60, 36, 0, { kind: 'Decline', adj: false, dec: true, ang: -18 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const rail = (x, y0, y1, z) => a.tube([[x, y0, z], [x, y1, z]], [22, 22], 8);
      if (v.adj) {
        const zs = Z0 + 440; pad(a, cx - 140, YB - 420, zs, cx + 140, YB - 120, zs + 70);   // seat at the back? seat toward back
        const zt = zs + 40, bl = 780, ang = (v.ang * PI) / 180, y0 = YB - 430;  // back pad goes toward the front, rising
        prismX(a, [[y0, zt], [y0 - bl * m.cos(ang), zt + bl * m.sin(ang)], [y0 - bl * m.cos(ang), zt + bl * m.sin(ang) + 55], [y0, zt + 55]], cx - 140, cx + 140);
        a.tube([[cx, y0 - bl * 0.3 * m.cos(ang), zt], [cx, YB - 250, Z0 + 200]], [20, 20], 8); a.tube([[cx, y0 - bl * 0.8 * m.cos(ang), zt + bl * 0.8 * m.sin(ang) - 20], [cx, y0 - bl * 0.8 * m.cos(ang) + 20, Z0 + 140]], [20, 20], 8);
        rail(cx, YB - 480, YB - 80, Z0 + 150); rail(cx, YB - 800, YB - 500, Z0 + 55); a.xcyl(cx - 200, cx + 200, YB - 90, Z0 + 50, 22, 8); a.xcyl(cx - 220, cx + 220, y0 - bl * 0.9 * m.cos(ang) + 120, Z0 + 28, 20, 8);
        for (const [x, y] of [[cx - 220, YB - 90], [cx + 220, YB - 90]]) a.box(x - 30, y - 90, Z0, x + 30, y + 40, Z0 + 28);
        a.rect(cx - 150, y0 - bl * m.cos(ang), cx + 150, y0, 'EQUIP'); a.rect(cx - 140, YB - 420, cx + 140, YB - 120, 'EQUIP-DETAIL');
      } else {
        const zs = Z0 + 410, tilt = v.dec ? 0.31 : 0, len = 1230, y0 = YB - 100;
        prismX(a, [[y0, zs], [y0 - len, zs + len * tilt], [y0 - len, zs + len * tilt + 70], [y0, zs + 70]], cx - 140, cx + 140);
        rail(cx, y0 - len + 60, y0 - 60, zs - 20 + (v.dec ? 200 : 0)); 
        for (const f of [0.15, 0.85]) { const y = y0 - len * f, z = zs + (v.dec ? len * f * tilt : 0); a.tube([[cx - 220, y, Z0 + 15], [cx - 130, y, z]], [20, 20], 8); a.tube([[cx + 220, y, Z0 + 15], [cx + 130, y, z]], [20, 20], 8); a.box(cx - 260, y - 40, Z0, cx + 260, y + 40, Z0 + 25); a.tube([[cx - 220, y, Z0 + 15], [cx + 220, y, Z0 + 15]], [20, 20], 8); }
        a.rect(cx - 140, y0 - len, cx + 140, y0, 'EQUIP');
        if (v.dec) { const yl = y0 - len - 90, zl = zs + len * tilt - 60; a.tube([[cx, y0 - len + 40, zs + len * tilt], [cx, yl, zl + 20]], [18, 18], 8); a.xcyl(cx - 220, cx + 220, yl, zl, 55, 12); a.rect(cx - 220, yl - 55, cx + 220, yl + 55, 'EQUIP-DETAIL'); }
      }
      a.log('Added the pad or pads, the frame rails, legs and floor feet' + (v.dec ? ', ankle rollers' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic squat and power rack',
    desc: (v) => `${v.kind}: ${v.posts} steel uprights with hole columns, a top cross-member, ${v.hooks} barbell hooks, ${v.safe ? 'two spotter safety arms, ' : ''}${v.pull ? 'a pull-up bar, ' : ''}base feet${v.pegs ? ' and plate storage pegs on the rear uprights' : ''}.`,
    vs: [['squat stand, 2 posts', 50, 54, 80, 0, { kind: 'Squat stand', posts: 2, hooks: 2, safe: false, pull: false }], ['half rack, 4 posts', 48, 52, 86, 0, { kind: 'Half rack', posts: 4, hooks: 2, safe: true, pull: true }], ['full power cage, 4 posts, pegs', 52, 58, 90, 0, { kind: 'Power cage', posts: 4, hooks: 2, safe: true, pull: true, pegs: true, cage: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline(); const hx = W / 2 - 80, hy = v.posts === 2 ? 0 : D / 2 - 90, up_ = 76;
      const fy = v.posts === 2 ? YB - 120 : YB - 100 - hy * 2, by = YB - 100;
      const posts = v.posts === 2 ? [[-hx, by], [hx, by]] : [[-hx, fy], [hx, fy], [-hx, by], [hx, by]];
      for (const [x, y] of posts) { up(a, cx + x, y, Z0 + 50, Z1 - 20, up_); for (let k = 0; k < 14; k++) a.box(cx + x - 12, y - up_ / 2 - 2, Z0 + 250 + k * 110, cx + x + 12, y - up_ / 2, Z0 + 280 + k * 110); a.circ(cx + x, y, up_ / 2, 'EQUIP-DETAIL'); }
      if (v.posts === 2) { for (const x of [-hx, hx]) a.box(cx + x - 40, YF + 40, Z0, cx + x + 40, YB - 20, Z0 + 50); a.tube([[cx - hx, by, Z1 - 30], [cx + hx, by, Z1 - 30]], [28, 28], 8); }
      else { for (const x of [-hx, hx]) { a.box(cx + x - 38, fy - 100, Z0, cx + x + 38, by + 100, Z0 + 50); a.tube([[cx + x, fy, Z1 - 30], [cx + x, by, Z1 - 30]], [28, 28], 8); a.tube([[cx + x, fy, Z0 + 700], [cx + x, by, Z0 + 700]], [24, 24], 8); } a.box(cx - hx, fy - 20, Z1 - 80, cx + hx, fy + 20, Z1 - 20); a.box(cx - hx, by - 20, Z1 - 80, cx + hx, by + 20, Z1 - 20); a.box(cx - hx, fy - 20, Z0 + 55, cx + hx, fy + 20, Z0 + 105); a.box(cx - hx, by - 20, Z0 + 55, cx + hx, by + 20, Z0 + 105); }
      for (const x of [-hx, hx]) { const y = v.posts === 2 ? by - 50 : fy - 50; a.box(cx + x - 24, y - 70, Z0 + 1230, cx + x + 24, y + 20, Z0 + 1260); a.box(cx + x - 24, y - 70, Z0 + 1240, cx + x + 24, y - 40, Z0 + 1320); }
      if (v.safe) for (const x of [-hx, hx]) { a.tube([[cx + x, fy, Z0 + 600], [cx + x, fy - 150, Z0 + 600]], [20, 20], 8); a.tube([[cx + x, by, Z0 + 600], [cx + x, fy - 150, Z0 + 600]], [20, 20], 8); }
      if (v.pull) a.tube([[cx - hx, fy, Z1 - 150], [cx + hx, fy, Z1 - 150]], [20, 20], 8);
      if (v.pegs) for (const x of [-hx, hx]) for (const z of [500, 620, 740]) a.tube([[cx + x, by + up_ / 2, Z0 + z], [cx + x, by + up_ / 2 + 40, Z0 + z]], [18, 18], 8);
      if (v.cage) for (const z of [1000]) a.tube([[cx - hx, by, Z0 + z], [cx + hx, by, Z0 + z]], [18, 18], 8);
      a.log('Added the uprights with hole columns, base feet, cross-members, barbell hooks' + (v.safe ? ', safety arms' : '') + (v.pull ? ', pull-up bar' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic cable machine',
    desc: (v) => v.kind === 'lat' ? 'Lat pulldown and low row machine: a weight stack in a shroud, a tall frame with a top pulley, a wide pull bar on a cable, thigh pads and a seat, and a low row foot platform with a handle.' : `${v.kind === 'dual' ? 'Dual adjustable pulley trainer' : 'Cable crossover frame'}: ${v.kind === 'dual' ? 'two weight-stack towers with carriages, two pulley handles and a top cross-bar' : 'two tall columns with a top cross-bar, high pulleys, two weight stacks and two handles on cables'}.`,
    vs: [['dual stack functional trainer', 72, 36, 84, 0, { kind: 'dual' }], ['lat pulldown and low row', 48, 70, 88, 0, { kind: 'lat' }], ['cable crossover, 120 in frame', 120, 40, 92, 0, { kind: 'cross' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      if (v.kind === 'lat') {
        const bx = cx, back = YB - 80; a.box(cx - 330, back - 500, Z0, cx + 330, back + 60, Z0 + 40);
        wstack(a, cx, back - 230, Z0 + 60, 360, 400, 12, 70, 12, 3); a.box(cx - 220, back - 450, Z0 + 40, cx + 220, back - 10, Z0 + 70); a.box(cx - 210, back - 440, Z1 - 580, cx + 210, back - 20, Z1 - 540);
        for (const s of [-1, 1]) { up(a, cx + s * 205, back - 440, Z0 + 40, Z1 - 20, 44); up(a, cx + s * 205, back, Z0 + 40, Z1 - 160, 44); a.tube([[cx + s * 205, back - 440, Z1 - 20], [cx + s * 205, back, Z1 - 160]], [22, 22], 8); }
        a.xcyl(cx - 230, cx + 230, back - 440, Z1 - 40, 40, 14); a.xcyl(cx - 60, cx + 60, back - 140, Z1 - 200, 40, 14);
        a.tube([[cx, back - 440, Z1 - 80], [cx, YF + 800, Z1 - 260]], [3.5, 3.5], 5); a.tube([[cx - 480, YF + 800, Z1 - 260], [cx + 480, YF + 800, Z1 - 260]], [14, 14], 8); a.tube([[cx - 480, YF + 800, Z1 - 260], [cx - 560, YF + 800, Z1 - 340]], [14, 14], 8); a.tube([[cx + 480, YF + 800, Z1 - 260], [cx + 560, YF + 800, Z1 - 340]], [14, 14], 8);
        pad(a, cx - 170, YF + 680, Z0 + 480, cx + 170, YF + 1000, Z0 + 540); a.tube([[cx, YF + 840, Z0 + 480], [cx, YF + 840, Z0 + 60]], [30, 30], 8); a.box(cx - 220, YF + 700, Z0, cx + 220, YF + 1060, Z0 + 30);
        for (const s of [-1, 1]) a.tube([[cx + s * 160, back - 580, Z0 + 560], [cx + s * 160, back - 700, Z0 + 690]], [24, 24], 8); a.box(cx - 150, back - 700, Z0 + 670, cx + 150, back - 650, Z0 + 750);
        a.tube([[cx - 130, YF + 100, Z0 + 140], [cx + 130, YF + 100, Z0 + 140]], [20, 20], 8); a.box(cx - 170, YF + 80, Z0 + 15, cx + 170, YF + 230, Z0 + 40); a.rect(cx - 330, YF + 80, cx + 330, back + 60, 'EQUIP-DETAIL');
        return a.log('Added the stack with shroud, frame, pulleys, pull bar, thigh pads, seat and low row platform (plan and 3D).');
      }
      const tx = v.kind === 'dual' ? W / 2 - 330 : W / 2 - 300, by = YB - 140, fy = YB - 140 - 520;
      for (const s of [-1, 1]) {
        const x = cx + s * tx; up(a, x - 190, fy, Z0, Z1 - 60, 48); up(a, x + 190, fy, Z0, Z1 - 60, 48); up(a, x - 190, by, Z0, Z1 - 60, 48); up(a, x + 190, by, Z0, Z1 - 60, 48);
        for (const y of [fy, by]) a.box(x - 220, y - 25, Z1 - 80, x + 220, y + 25, Z1 - 30); a.box(x - 220, fy, Z1 - 80, x + 220, by, Z1 - 60); a.box(x - 220, fy - 30, Z0, x + 220, by + 30, Z0 + 40);
        wstack(a, x, (fy + by) / 2, Z0 + 60, 300, 300, v.kind === 'dual' ? 14 : 12, 60, 14, 3);
        a.xcyl(x - 36, x + 36, fy + 20, Z1 - 120, 55, 14); a.xcyl(x - 36, x + 36, fy + 20, Z0 + 260, 55, 14);
        a.box(x - 80, fy - 26, Z0 + 780, x + 80, fy, Z0 + 960);
        a.tube([[x, fy, Z0 + 960], [x, fy, Z1 - 120]], [3.5, 3.5], 5); a.tube([[x, fy - 20, Z0 + 780], [x, fy - 120, Z0 + 520]], [3.5, 3.5], 5);
        a.box(x - 45, fy - 200, Z0 + 500, x + 45, fy - 130, Z0 + 530); a.tube([[x - 45, fy - 160, Z0 + 520], [x + 45, fy - 160, Z0 + 520]], [11, 11], 7);
        a.circ(x - 190, fy, 24, 'EQUIP-DETAIL'); a.rect(x - 220, fy - 30, x + 220, by + 30, 'EQUIP-DETAIL');
      }
      a.tube([[cx - tx, fy, Z1 - 30], [cx + tx, fy, Z1 - 30]], [26, 26], 8);
      if (v.kind === 'cross') a.tube([[cx - tx, by, Z1 - 30], [cx + tx, by, Z1 - 30]], [26, 26], 8); else a.tube([[cx - tx, fy, Z1 - 300], [cx + tx, fy, Z1 - 300]], [20, 20], 8);
      a.log('Added the two towers with weight stacks, carriages with pulleys, cables, handles and the top cross-bar (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic rowing machine',
    desc: (v) => v.air ? 'Air rowing machine: a long monorail on two legs, a sliding seat, foot plates with straps at the front, a caged flywheel with spokes, a pull handle on a chain and a small monitor on an arm.' : 'Water rowing machine: two wooden-style side rails, a sliding seat, foot plates with straps, a horizontal water tank with a flywheel inside, a pull handle on a cord and a monitor.',
    vs: [['air, monorail 96 in', 24, 96, 38, 0, { air: true }], ['water tank, twin rail 84 in', 22, 84, 24, 0, { air: false }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline(); const f0 = YF + 40;
      if (v.air) {
        a.box(cx - 40, f0 + 300, Z0 + 260, cx + 40, YB - 40, Z0 + 320); a.box(cx - 150, YB - 80, Z0, cx + 150, YB - 20, Z0 + 50); a.box(cx - 150, f0 + 320, Z0, cx + 150, f0 + 380, Z0 + 40); a.tube([[cx, f0 + 340, Z0 + 40], [cx, f0 + 340, Z0 + 270]], [30, 30], 8);
        a.ycyl(f0 + 20, f0 + 280, cx, Z0 + 480, 250, 24); a.rect(cx - 250, f0 + 20, cx + 250, f0 + 280); for (let i = 0; i < 12; i++) { const t = (i / 12) * 2 * PI; a.tube([[cx, f0 + 5, Z0 + 480], [cx + m.cos(t) * 250, f0 + 5, Z0 + 480 + m.sin(t) * 250]], [2, 2], 4); } ring(a, 'xz', cx, f0 + 4, Z0 + 480, 250, 4, 28, 5);
        a.tube([[cx, f0 + 150, Z0 + 480], [cx, f0 + 300, Z0 + 320]], [28, 28], 8); a.box(cx - 220, f0 + 600, Z0 + 340, cx + 220, f0 + 650, Z0 + 400);
      } else {
        for (const s of [-1, 1]) a.box(cx + s * 160 - 30, f0 + 380, Z0 + 270, cx + s * 160 + 30, YB - 40, Z0 + 330);
        a.box(cx - 190, f0 + 380, Z0 + 270, cx + 190, f0 + 440, Z0 + 330); a.ycyl(f0, f0 + 440, cx, Z0 + 420, 150, 24); a.rect(cx - 150, f0, cx + 150, f0 + 440);
        for (const s of [-1, 1]) { a.box(cx + s * 160 - 30, f0 + 380, Z0, cx + s * 160 + 30, f0 + 430, Z0 + 270); a.box(cx + s * 160 - 30, YB - 120, Z0, cx + s * 160 + 30, YB - 60, Z0 + 270); }
        a.box(cx - 230, f0 + 100, Z0, cx + 230, f0 + 160, Z0 + 40); a.box(cx - 230, YB - 140, Z0, cx + 230, YB - 80, Z0 + 20);
        a.box(cx - 120, f0 + 560, Z0 + 400, cx + 120, f0 + 650, Z0 + 450);
      }
      const sy = YB - 700; a.box(cx - 130, sy - 120, Z0 + 330, cx + 130, sy + 120, Z0 + 380); a.box(cx - 100, sy - 100, Z0 + 300, cx + 100, sy + 100, Z0 + 335); a.rect(cx - 130, sy - 120, cx + 130, sy + 120, 'EQUIP-DETAIL');
      for (const s of [-1, 1]) { a.box(cx + s * 100 - 50, f0 + 400, Z0 + 330, cx + s * 100 + 50, f0 + 640, Z0 + 350); a.prism([[cx + s * 100 - 50, f0 + 480], [cx + s * 100 + 50, f0 + 480], [cx + s * 100 + 50, f0 + 640], [cx + s * 100 - 50, f0 + 640]], Z0 + 350, Z0 + 520); a.rect(cx + s * 100 - 50, f0 + 480, cx + s * 100 + 50, f0 + 640, 'EQUIP-DETAIL'); }
      a.tube([[cx, f0 + 300, Z0 + 500], [cx, f0 + 700, Z0 + 520]], [3, 3], 4); a.box(cx - 140, f0 + 280, Z0 + 500, cx + 140, f0 + 320, Z0 + 520);
      a.log('Added the rail or rails, seat, foot plates with straps, flywheel or tank, handle and monitor (plan and 3D).');
    } }),
];


const FIT2 = [
  fam({ cat: 'sport/fitness', title: 'Generic exercise bike',
    desc: (v) => `${v.kind} exercise bike: ${v.rec ? 'a long floor frame with a reclined seat and back rest, side handles, pedals on forward cranks' : 'a floor frame with front and rear stabiliser feet, a mast, a saddle on a post, handlebars' + (v.console ? ' with a console' : '') + ', a ' + (v.fw) + ' mm flywheel and pedals on cranks'}.`,
    vs: [['upright, console', 22, 44, 52, 0, { kind: 'Upright', fw: 300, console: true }], ['recumbent, reclined seat', 26, 62, 42, 0, { kind: 'Recumbent', rec: true, fw: 250 }], ['indoor cycle, heavy flywheel', 22, 46, 54, 0, { kind: 'Indoor cycle', fw: 440, console: false }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const fx = YF + 60, rx = YB - 60;
      a.box(cx - 260, fx - 20, Z0, cx + 260, fx + 60, Z0 + 40); a.box(cx - 240, rx - 40, Z0, cx + 240, rx + 40, Z0 + 40); a.tube([[cx, fx + 20, Z0 + 30], [cx, rx, Z0 + 30]], [32, 32], 8);
      if (v.rec) {
        const sy = YB - 420; pad(a, cx - 190, sy - 200, Z0 + 330, cx + 190, sy + 160, Z0 + 390); prismX(a, [[sy + 180, Z0 + 360], [sy + 340, Z0 + 700], [sy + 400, Z0 + 700], [sy + 240, Z0 + 360]], cx - 200, cx + 200);
        a.tube([[cx, sy, Z0 + 330], [cx, sy, Z0 + 30]], [30, 30], 8); a.tube([[cx, sy + 160, Z0 + 330], [cx, YB - 100, Z0 + 330 - 100]], [24, 24], 8);
        const px = fx + 380; a.tube([[cx, fx + 20, Z0 + 30], [cx, fx + 140, Z0 + 330], [cx, px, Z0 + 600]], [30, 28, 26], 8); a.box(cx - 130, px - 50, Z0 + 600, cx + 130, px + 50, Z0 + 700); a.box(cx - 80, px - 51, Z0 + 640, cx + 80, px - 49, Z0 + 690);
        a.ycyl(fx + 140 - 80, fx + 140 + 80, cx, Z0 + 330, 100, 16); for (const [s, ang] of [[-1, 0.4], [1, 0.4 + PI]]) { const py = fx + 140 + m.cos(ang) * 170, pz = Z0 + 330 + m.sin(ang) * 170; a.tube([[cx + s * 100, fx + 140, Z0 + 330], [cx + s * 100, py, pz]], [8, 8], 5); a.box(cx + s * 100 - 60, py - 50, pz - 8, cx + s * 100 + 60, py + 50, pz + 8); }
        for (const s of [-1, 1]) a.tube([[cx + s * 230, sy + 60, Z0 + 460], [cx + s * 240, sy - 120, Z0 + 520]], [20, 20], 8);
        a.rect(cx - 190, sy - 200, cx + 190, sy + 400, 'EQUIP-DETAIL');
        return a.log('Added the floor frame, reclined seat and back rest, handles, crank with pedals and the console (plan and 3D).');
      }
      const my = fx + 120; a.tube([[cx, fx + 30, Z0 + 30], [cx, my, Z0 + 700], [cx, my + 40, Z1 - 100]], [34, 30, 28], 8);
      a.ycyl(my + 20, my + 100, cx, Z0 + 360, v.fw / 2, 24); a.circ(cx, my + 60, 60, 'EQUIP-DETAIL'); a.ycyl(my - 50, my + 150, cx, Z0 + 360, 30, 12);
      for (const [s, ang] of [[-1, 0.8], [1, 0.8 + PI]]) { const py = my + 60 + m.cos(ang) * 175, pz = Z0 + 360 + m.sin(ang) * 175; a.tube([[cx + s * 110, my + 60, Z0 + 360], [cx + s * 110, py, pz]], [9, 9], 5); a.box(cx + s * 110 - 70, py - 60, pz - 9, cx + s * 110 + 70, py + 60, pz + 9); }
      const sy = YB - 220; a.tube([[cx, my + 160, Z0 + 520], [cx, sy, Z0 + 520], [cx, sy, Z1 - 140]], [30, 28, 24], 8); a.tube([[cx, sy, Z1 - 140], [cx, sy + 50, Z1 - 80]], [16, 16], 6); a.box(cx - 130, sy - 130, Z1 - 80, cx + 130, sy + 120, Z1 - 30);
      a.tube([[cx, my + 20, Z1 - 100], [cx - 250, my - 90, Z1 - 100]], [16, 16], 6); a.tube([[cx, my + 20, Z1 - 100], [cx + 250, my - 90, Z1 - 100]], [16, 16], 6); a.tube([[cx - 250, my - 90, Z1 - 100], [cx - 250, my - 150, Z1 - 160]], [16, 16], 6); a.tube([[cx + 250, my - 90, Z1 - 100], [cx + 250, my - 150, Z1 - 160]], [16, 16], 6);
      if (v.console) { a.box(cx - 130, my - 30, Z1 - 80, cx + 130, my + 60, Z1 + 10 - 20); a.box(cx - 100, my - 32, Z1 - 70, cx + 100, my - 30, Z1 - 20); }
      else a.box(cx - 40, my - 20, Z1 - 100, cx + 40, my + 40, Z1 - 60);
      a.log('Added the floor frame with stabiliser feet, mast, flywheel, crank with pedals, saddle and handlebars (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic barbell',
    desc: (v) => `Barbell ${v.kind} lying on the floor: a knurled ${v.kg} kg-class bar 86 in long with two sleeves${v.n ? `, ${v.n} round plates each side (${v.plates}) and spring collars` : ' resting on two V saddles'}.`,
    vs: [['empty bar on saddles', 88, 20, 18, 0, { kind: 'bar', n: 0, kg: 20, plates: '' }], ['loaded, two plates each side', 88, 18, 19, 0, { kind: 'bar', n: 2, kg: 20, plates: 'one thick and one thin' }], ['loaded, four plates each side', 88, 18, 19, 0, { kind: 'bar', n: 4, kg: 20, plates: 'graded thicknesses' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, cx } = a, cy = YF / 2, zc = v.n ? Z0 + 225 : Z0 + 300; a.outline();
      a.xcyl(cx - 1100, cx + 1100, cy, zc, 14, 12); for (const s of [-1, 1]) { a.xcyl(cx + s * 650, cx + s * 1100, cy, zc, 25, 14); a.xcyl(cx + s * 460, cx + s * 650, cy, zc, 17, 8); a.xcyl(cx - 140, cx + 140, cy, zc, 15.5, 12); }
      for (const s of [-1, 1]) a.xcyl(cx + s * 100 - 4, cx + s * 100 + 4, cy, zc, 16, 12);
      if (!v.n) for (const s of [-1, 1]) { const x = cx + s * 700; a.box(x - 40, cy - 90, Z0, x + 40, cy + 90, Z0 + 40); a.prism([[x - 40, cy - 90], [x + 40, cy - 90], [x + 40, cy + 90], [x - 40, cy + 90]], Z0 + 40, Z0 + 150); a.box(x - 40, cy - 90, Z0 + 150, x + 40, cy - 40, Z0 + zc - Z0 + 10); a.box(x - 40, cy + 40, Z0 + 150, x + 40, cy + 90, zc + 10); a.rect(x - 40, cy - 90, x + 40, cy + 90, 'EQUIP-DETAIL'); }
      const th = [45, 30, 25, 20].slice(0, v.n); const dia = [225, 225, 190, 150];
      for (const s of [-1, 1]) { let x = 670; for (let i = 0; i < v.n; i++) { const r = i === 0 ? 225 : i === 1 ? 225 : i === 2 ? 190 : 150; const t = th[i]; const x0 = cx + s * x, x1 = cx + s * (x + t); a.xcyl(m.min(x0, x1), m.max(x0, x1), cy, zc, r, 28); a.xcyl(m.min(x0, x1) - 1, m.max(x0, x1) + 1, cy, zc, 52, 14); a.rect(m.min(x0, x1), cy - r, m.max(x0, x1), cy + r, 'EQUIP-DETAIL'); x += t + 3; }
        a.xcyl(cx + s * x, cx + s * (x + 28), cy, zc, 36, 12); }
      a.line(cx - 1100, cy, cx + 1100, cy, 'EQUIP');
      a.log('Added the bar with knurled grip, sleeves' + (v.n ? ', round plates and collars' : ' and the two saddles') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic dumbbell rack',
    desc: (v) => `Two-tier dumbbell rack ${v.n} stations wide with ${v.n * 2} hex-head dumbbells: a steel frame with two end frames, two shelf rails with saddles and dumbbells graded in size from the left.`,
    vs: [['5 pair, 2 tier, 60 in', 60, 22, 32, 0, { n: 5 }], ['8 pair, 2 tier, 96 in', 96, 22, 32, 0, { n: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline(); const stW = (W - 120) / v.n, cy = YF / 2, zs = [Z0 + 300, Z0 + 600];
      for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 40); a.box(x - 25, YF + 60, Z0, x + 25, YB - 60, Z0 + 40); for (const y of [YF + 100, YB - 100]) up(a, x, y, Z0 + 40, Z1 - 20, 50); a.tube([[x, YF + 100, Z1 - 20], [x, YB - 100, Z1 - 20]], [24, 24], 8); for (const z of zs) a.tube([[x, YF + 100, z - 20], [x, YB - 100, z - 20]], [20, 20], 8); }
      for (const z of zs) for (const y of [YF + 100, YB - 100]) a.box(cx - W / 2 + 60, y - 30, z - 36, cx + W / 2 - 60, y + 30, z - 8);
      for (let t = 0; t < 2; t++) for (let i = 0; i < v.n; i++) { const x = cx - W / 2 + 60 + stW * (i + 0.5), sz = 0.7 + 0.3 * (i / (v.n - 1)) + t * 0.0; const r = 40 + 60 * sz * (t ? 1 : 0.85) + 0;
        for (const y of [YF + 100, YB - 100]) a.box(x - stW * 0.4, y - 30, zs[t] - 8, x + stW * 0.4, y + 30, zs[t] + 6);
        const z = zs[t] + r + 6; a.ycyl(YF + 130, YB - 130, x, z, 17, 8); const hl = 85; for (const y of [YF + 130 + hl * 0.5, YB - 130 - hl * 0.5]) a.ycyl(y - hl / 2, y + hl / 2, x, z, r, 6); a.rect(x - r, YF + 130, x + r, YF + 130 + hl, 'EQUIP-DETAIL'); a.rect(x - r, YB - 130 - hl, x + r, YB - 130, 'EQUIP-DETAIL'); }
      a.log('Added the end frames, two shelf rails with saddles and the graded hex dumbbells (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic kettlebell',
    desc: (v) => `${v.kg} kg kettlebell: a round cast body ${v.dia} mm across on a flat ring base with a round handle ring above it, joined to the body by two short necks.`,
    vs: [['8 kg', 7, 7, 9, 0, { kg: 8, dia: 160 }], ['16 kg', 8.5, 8.5, 11.5, 0, { kg: 16, dia: 200 }], ['24 kg', 9.5, 9.5, 13, 0, { kg: 24, dia: 225 }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, R = v.dia / 2, zc = Z0 + R * 0.95 + 6; a.outline();
      a.cyl(cx, cy, Z0, Z0 + 8, R * 0.52, 20); a.ell(cx, cy, zc, R, R, R * 0.95, 22, 14);
      const hw = R * 0.5; ring(a, 'xz', cx, cy, zc + R * 1.22, hw, R * 0.14, 28, 8); for (const sx of [-1, 1]) a.tube([[cx + sx * hw * 0.8, cy, zc + R * 0.85], [cx + sx * hw * 0.95, cy, zc + R * 1.1]], [R * 0.2, R * 0.16], 8);
      a.circ(cx, cy, R, 'EQUIP'); a.rect(cx - hw, cy - R * 0.14, cx + hw, cy + R * 0.14, 'EQUIP-DETAIL'); a.log('Added the ring base, round body, two necks and the handle ring (plan and 3D).');
    } }),
];


// ------------------------------------------------------------------------------------------ venues
const SEG7 = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
/** a seven-segment digit on a face at y (facing −Y): x0..x1 width, z0 base, h height */
function digit(a, x0, y, z0, w, h, n, t) {
  const on = SEG7[n], zm = z0 + h / 2, B = (xa, za, xb, zb_) => a.box(xa, y - 40, za, xb, y + 6, zb_);
  if (on.includes('a')) B(x0 + t, z0 + h - t, x0 + w - t, z0 + h); if (on.includes('g')) B(x0 + t, zm - t / 2, x0 + w - t, zm + t / 2); if (on.includes('d')) B(x0 + t, z0, x0 + w - t, z0 + t);
  if (on.includes('f')) B(x0, zm + t / 2, x0 + t, z0 + h - t / 2); if (on.includes('b')) B(x0 + w - t, zm + t / 2, x0 + w, z0 + h - t / 2); if (on.includes('e')) B(x0, z0 + t / 2, x0 + t, zm - t / 2); if (on.includes('c')) B(x0 + w - t, z0 + t / 2, x0 + w, zm - t / 2);
}
function climbHolds(a, x0, x1, y, z0, z1, n, seed, nz = 0) {
  let r = seed; const rnd = () => { r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x7fffffff; };
  for (let i = 0; i < n; i++) { const x = x0 + 120 + rnd() * (x1 - x0 - 240), z = z0 + 120 + rnd() * (z1 - z0 - 300), s = 28 + rnd() * 36; a.ell(x, y - s * 0.5 - nz * 0, z, s * 1.1, s * 0.7, s * 0.8, 6, 4); }
}

const VENUES = [
  fam({ cat: 'sport/venues', title: 'Generic aluminium bleacher',
    desc: (v) => `Bleacher of ${v.rows} rows and ${v.ft} ft long: seat and foot planks on each row, A-frame trusses with sloping stringers and posts, ${v.stairs ? 'a centre aisle stair with handrails, ' : ''}a back guard rail with balusters and end rails.`,
    vs: [['3 rows, 15 ft', 180, 84, 74, 0, { rows: 3, ft: 15, stairs: false, rise: 8 }], ['5 rows, 21 ft', 252, 130, 90, 0, { rows: 5, ft: 21, stairs: false, rise: 8 }], ['10 rows, 27 ft, aisle stair', 324, 264, 130, 0, { rows: 10, ft: 27, stairs: true, rise: 8 }], ['15 rows, 27 ft, aisle stair', 324, 384, 170, 0, { rows: 15, ft: 27, stairs: true, rise: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline(); const n = v.rows, rd = (D - 120) / n, rise = v.rise * IN, hrail = 1070;
      const zRow = (i) => Z0 + 380 + i * rise, y0 = YF + 40;
      const nTruss = m.max(2, m.round(W / 2400) + 1);
      for (let k = 0; k < nTruss; k++) { const x = X0 + 50 + ((W - 100) * k) / (nTruss - 1);
        a.tube([[x, y0, Z0 + 60], [x, y0 + rd * n, zRow(n - 1) - 40]], [25, 25], 6); a.tube([[x, y0, Z0 + 340], [x, y0 + rd * n, Z0 + 150 + (n - 1) * rise * 0.0 + 60]], [20, 20], 6);
        for (let i = 0; i < n; i += 1) { a.tube([[x, y0 + rd * (i + 0.5), zRow(i) - 30], [x, y0 + rd * (i + 0.5), Z0 + 10]], [18, 18], 6); } a.box(x - 30, y0 + rd * n - 40, Z0, x + 30, y0 + rd * n + 40, Z0 + 20); a.box(x - 30, y0 - 40, Z0, x + 30, y0 + 40, Z0 + 20); }
      for (let i = 0; i < n; i++) {
        const ya = y0 + rd * i, z = zRow(i);
        a.box(X0 + 20, ya + 20, z - 30, X1 - 20, ya + rd * 0.55, z + 20); a.box(X0 + 20, ya + rd * 0.6, z - 90, X1 - 20, ya + rd - 10, z - 50);
        a.line(X0, ya, X1, ya, 'EQUIP-DETAIL');
      }
      if (v.stairs) { const sx = cx, sw = 700; for (let i = 0; i < n; i++) { const ya = y0 + rd * i; a.box(sx - sw / 2, ya + 10, zRow(i) - 20, sx + sw / 2, ya + rd - 10, zRow(i)); } for (const s of [-1, 1]) a.tube([[sx + s * sw / 2, y0, Z0 + 1100], [sx + s * sw / 2, y0 + rd * n, zRow(n - 1) + 900]], [18, 18], 6); }
      const zt = zRow(n - 1), yb = y0 + rd * n;
      for (let x = X0 + 40; x <= X1 - 40; x += (W - 80) / m.round(W / 1200)) { a.tube([[x, yb, zt - 30], [x, yb, zt + hrail]], [16, 16], 6); }
      a.tube([[X0 + 40, yb, zt + hrail], [X1 - 40, yb, zt + hrail]], [18, 18], 6); a.tube([[X0 + 40, yb, zt + hrail * 0.55], [X1 - 40, yb, zt + hrail * 0.55]], [14, 14], 6);
      for (let x = X0 + 130; x < X1 - 100; x += 130) a.tube([[x, yb, zt], [x, yb, zt + hrail * 0.55]], [5, 5], 4);
      for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 25); a.tube([[x, y0, Z0 + 960], [x, yb, zt + hrail]], [18, 18], 6); a.tube([[x, y0, Z0 + 480], [x, yb, zt + hrail * 0.55 + (zt - Z0 - 380) * 0]], [14, 14], 6); }
      a.log('Added the A-frame trusses, seat and foot planks on each row' + (v.stairs ? ', aisle stair' : '') + ', back guard rail and end rails (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', title: 'Generic team dugout',
    desc: (v) => `Team dugout ${v.ft} ft long: a block back wall and end walls, a sloped roof slab on posts over the opening, a continuous bench with a back rail, a bat rack and helmet shelf on the back wall, a water cooler stand and a step-down floor slab.`,
    vs: [['20 ft, roofed', 240, 108, 112, 0, { ft: 20 }], ['30 ft, roofed with fence', 360, 108, 112, 0, { ft: 30, fence: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 60); const wt = 200;
      a.box(X0, YB - wt, Z0 + 60, X1, YB, Z1 - 330); for (const s of [-1, 1]) a.box(s > 0 ? X1 - wt : X0, YF + 300, Z0 + 60, s > 0 ? X1 : X0 + wt, YB, Z1 - 330);
      for (const x of [X0 + 80, X1 - 80, cx, cx - W / 4, cx + W / 4]) a.tube([[x, YF + 80, Z0 + 60], [x, YF + 80, Z1 - 330]], [34, 34], 8);
      prismX(a, [[YB, Z1 - 330], [YF, Z1 - 380], [YF, Z1 - 330], [YB, Z1 - 270]], X0 - 20 > a.X0 ? X0 : X0, X1);
      a.box(X0, YF, Z1 - 350, X1, YB, Z1 - 330);
      const by = YB - wt - 380; a.box(X0 + wt + 40, by, Z0 + 60 + 400, X1 - wt - 40, by + 360, Z0 + 60 + 450); for (let x = X0 + wt + 120; x < X1 - wt - 60; x += 600) a.box(x - 25, by + 30, Z0 + 60, x + 25, by + 330, Z0 + 460);
      a.box(X0 + wt + 40, YB - wt - 40, Z0 + 60 + 800, X1 - wt - 40, YB - wt - 10, Z0 + 60 + 860); a.tube([[X0 + wt + 60, YB - wt - 20, Z0 + 60 + 1450], [X1 - wt - 60, YB - wt - 20, Z0 + 60 + 1450]], [15, 15], 6);
      for (let x = X0 + wt + 160; x < X1 - wt - 120; x += 150) a.tube([[x, YB - wt - 20, Z0 + 60 + 1100], [x, YB - wt - 20, Z0 + 60 + 1450]], [10, 10], 6);
      a.tube([[X0 + wt + 60, YB - wt - 20, Z0 + 60 + 1100], [X1 - wt - 60, YB - wt - 20, Z0 + 60 + 1100]], [12, 12], 6);
      const wx = cx + W / 4; a.cyl(wx, by + 80, Z0 + 60, Z0 + 60 + 900, 130, 16); a.cyl(wx, by + 80, Z0 + 60 + 900, Z0 + 60 + 1000, 150, 16);
      a.ycyl(by - 60, by + 100, wx + 90, Z0 + 60 + 800, 8, 6);
      if (v.fence) for (let x = X0 + 100; x < X1 - 100; x += 200) a.tube([[x, YF + 20, Z0 + 60], [x, YF + 20, Z0 + 60 + 900]], [8, 8], 5);
      if (v.fence) { a.tube([[X0 + 100, YF + 20, Z0 + 60 + 900], [X1 - 100, YF + 20, Z0 + 60 + 900]], [14, 14], 6); a.tube([[X0 + 100, YF + 20, Z0 + 60 + 450], [X1 - 100, YF + 20, Z0 + 60 + 450]], [10, 10], 6); }
      a.rect(X0 + wt + 40, by, X1 - wt - 40, by + 360, 'EQUIP-DETAIL'); a.log('Added the walls, roof slab on posts, the bench with back rail, bat rack, helmet shelf and water cooler stand (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', title: 'Generic scoreboard',
    desc: (v) => `${v.kind}: a ${v.pw} x ${v.ph} in panel with ${v.digits} seven-segment digits for time and scores in two score fields, a steel frame, ${v.mount === 'pole' ? 'two support posts with base plates and a cross brace' : v.mount === 'hang' ? 'four faces hung from a centre cable with a top plate' : 'a wall bracket frame'} and a horn housing on top.`,
    vs: [['pole-mounted, 144 x 72 in panel', 156, 30, 180, 0, { kind: 'Pole-mounted scoreboard', pw: 144, ph: 72, mount: 'pole', digits: 8 }], ['wall-mounted gym board, 96 x 48 in', 100, 12, 56, 96, { kind: 'Wall-mounted gym scoreboard', pw: 96, ph: 48, mount: 'wall', digits: 6 }], ['four-face hanging cube, 54 x 36 in faces', 60, 60, 60, 120, { kind: 'Hanging four-face scoreboard', pw: 54, ph: 36, mount: 'hang', digits: 6 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline(); const pw = v.pw * IN, ph = v.ph * IN, th = v.mount === 'hang' ? pw : 250;
      const by = v.mount === 'hang' ? YF / 2 : YB - 100, zb = v.mount === 'pole' ? Z0 + (a.H - ph - 600) : Z0 + 200, zb2 = v.mount === 'hang' ? Z0 + 140 : zb;
      const face = (x0, w_, y, z0_, h_) => {
        a.box(x0, y - 120, z0_, x0 + w_, y + 120, z0_ + h_); a.box(x0 + 40, y - 126, z0_ + 40, x0 + w_ - 40, y - 120, z0_ + h_ - 40);
        const n = v.digits, dw = m.min(h_ * 0.42 * 0.55, (w_ - 80) / (n + 1.8)), dh = dw / 0.55, tt = dh * 0.14; const gap = (w_ - 80 - n * dw) / (n + 1.5);
        let k = 0; const nums = [0, 3, 1, 4, 7, 2, 5, 8];
        for (let i = 0; i < n; i++) { const xx = x0 + 40 + gap * (i + (i >= n / 2 ? 1.5 : 0.5)) + dw * i; digit(a, xx, y - 126, z0_ + h_ * 0.5 - dh / 2 + (i < 2 || i >= n - 2 ? 0 : 0), dw, dh, nums[k++ % 8], tt); }
        a.box(x0 + w_ / 2 - 20, y - 130, z0_ + h_ * 0.72, x0 + w_ / 2 + 20, y - 126, z0_ + h_ * 0.72 + 40); a.box(x0 + w_ / 2 - 20, y - 130, z0_ + h_ * 0.35, x0 + w_ / 2 + 20, y - 126, z0_ + h_ * 0.35 + 40);
      };
      if (v.mount === 'hang') {
        const zc = Z0 + 140, hy = cy_(a), c0 = hy - pw / 2; a.box(cx - pw / 2, c0, zc, cx + pw / 2, hy + pw / 2, zc + ph);
        face(cx - pw / 2, pw, c0 + 120, zc, ph);
        for (const s2 of [-1, 1]) { a.box(cx + s2 * pw / 2 - (s2 < 0 ? 12 : 0) - 0, hy - pw / 2 + 60, zc + 50, cx + s2 * pw / 2 + (s2 > 0 ? 12 : 0), hy + pw / 2 - 60, zc + ph - 50); }
        a.box(cx - pw / 2 + 50, hy + pw / 2, zc + 50, cx + pw / 2 - 50, hy + pw / 2 + 12, zc + ph - 50);
        a.box(cx - pw / 2 - 20, c0 - 10, zc + ph, cx + pw / 2 + 20, hy + pw / 2 + 10, zc + ph + 40); a.box(cx - 100, hy - 100, zc + ph + 40, cx + 100, hy + 100, zc + ph + 100);
        a.tube([[cx, hy, zc + ph + 100], [cx, hy, Z1]], [10, 10], 6); a.box(cx - 200, hy - 200, Z1 - 20, cx + 200, hy + 200, Z1);
        return a.log('Added the four faces with digit fields, the frame, centre cable and top plate (plan and 3D).');
      }
      face(cx - pw / 2, pw, by - 100, zb, ph); a.box(cx - 150, by - 220, zb + ph, cx + 150, by + 100, zb + ph + 110);
      for (let k = 0; k < 3; k++) a.box(cx - pw / 2 + k * (pw / 2 - 20), by - 30, zb - 30, cx - pw / 2 + k * (pw / 2 - 20) + 40, by + 120, zb);
      if (v.mount === 'pole') { for (const s of [-1, 1]) { const x = cx + s * (pw / 2 - 250); a.tube([[x, by + 130, Z0], [x, by + 130, zb + ph - 100]], [55, 55], 10); a.box(x - 160, by + 40, Z0, x + 160, by + 220, Z0 + 20); } a.tube([[cx - pw / 2 + 250, by + 130, Z0 + 1400], [cx + pw / 2 - 250, by + 130, Z0 + 2300]], [24, 24], 8); a.tube([[cx + pw / 2 - 250, by + 130, Z0 + 1400], [cx - pw / 2 + 250, by + 130, Z0 + 2300]], [24, 24], 8); }
      else for (const s of [-1, 1]) a.box(cx + s * (pw / 2 - 200) - 25, YB - 60, zb, cx + s * (pw / 2 - 200) + 25, YB, zb + ph);
      a.log('Added the panel with seven-segment digit fields, frame, ' + (v.mount === 'pole' ? 'two posts with base plates and cross brace' : 'wall brackets') + ' and the horn housing (plan and 3D).');
    } }),
];
function cy_(a) { return a.YF / 2; }


const VENUES2 = [
  fam({ cat: 'sport/venues', title: 'Generic entry turnstile',
    desc: (v) => v.kind === 'tripod' ? 'Waist-high tripod turnstile: a stainless-style cabinet with a top cover, a hub with three rotating arms, a card reader pad and a pictogram light on the face.' : v.kind === 'full' ? 'Full-height rotary turnstile: a centre rotor post with four bar arms, a surrounding cage of upright bars and a roof, and two end posts with a reader.' : 'Waist-high flap gate: two cabinets with a lane between them, retractable flaps on each cabinet, reader pads and direction lights.',
    vs: [['tripod, waist-high', 44, 36, 42, 0, { kind: 'tripod' }], ['full-height rotary, 4 arm', 54, 54, 90, 0, { kind: 'full' }], ['flap gate, 900 mm passage', 52, 40, 40, 0, { kind: 'flap' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline(); const cy = YF / 2;
      if (v.kind === 'tripod') {
        const bx0 = X0 + 40, bx1 = X0 + 40 + 260; a.box(bx0, YF + 40, Z0, bx1, YB - 40, Z0 + 940); a.box(bx0 - 10, YF + 30, Z0 + 940, bx1 + 10, YB - 30, Z0 + 975); a.box(bx0 + 40, YF + 30, Z0 + 700, bx1 - 40, YF + 40, Z0 + 800); a.box(bx0 + 60, YF + 30, Z0 + 820, bx1 - 60, YF + 40, Z0 + 840);
        const hx = bx1 + 10, hz = Z0 + 880; a.xcyl(bx1, hx + 80, cy, hz, 55, 14); for (const [dx, dy, dz] of [[520, 0, 0], [320, -300, -300], [320, 300, -300]]) { a.tube([[hx + 60, cy, hz], [hx + 60 + dx, cy + dy, hz + dz]], [24, 20], 8); a.line(hx + 60, cy, hx + 60 + dx, cy + dy, 'EQUIP-DETAIL'); } a.circ(hx + 40, cy, 55, 'EQUIP-DETAIL'); a.rect(bx0, YF + 40, bx1, YB - 40);
        a.box(X1 - 300, YF + 40, Z0, X1 - 40, YB - 40, Z0 + 100); a.rect(X1 - 300, YF + 40, X1 - 40, YB - 40, 'EQUIP-DETAIL');
        return a.log('Added the cabinet and cover, hub, three arms, reader pad and the floor plate (plan and 3D).');
      }
      if (v.kind === 'full') {
        const R = 560; a.cyl(cx, cy, Z0 + 20, Z1 - 60, 55, 14); for (const ang of [0, 90, 180, 270]) { const t = (ang * PI) / 180, ex = cx + m.cos(t) * R, ey = cy + m.sin(t) * R; for (const zz of [250, 1100, 2050]) a.tube([[cx, cy, Z0 + zz], [ex, ey, Z0 + zz]], [16, 16], 6); for (let k = 1; k <= 4; k++) { const f = k / 4.5; a.tube([[cx + m.cos(t) * R * f, cy + m.sin(t) * R * f, Z0 + 250], [cx + m.cos(t) * R * f, cy + m.sin(t) * R * f, Z0 + 2050]], [8, 8], 5); } a.line(cx, cy, ex, ey, 'EQUIP-DETAIL'); }
        a.circ(cx, cy, R + 60, 'EQUIP-HIDDEN'); const rr = R + 90;
        for (let i = 0; i < 24; i++) { const t = (i / 24) * 2 * PI; if ((t > 0.35 && t < 1.2) || (t > 3.5 && t < 4.35)) continue; a.tube([[cx + m.cos(t) * rr, cy + m.sin(t) * rr, Z0 + 20], [cx + m.cos(t) * rr, cy + m.sin(t) * rr, Z1 - 100]], [11, 11], 5); }
        for (const zz of [20, 700, 1400, 2150]) ring(a, 'xy', cx, cy, Z0 + zz, rr, 12, 28, 5);
        ring(a, 'xy', cx, cy, Z1 - 100, rr, 20, 28, 5); a.cyl(cx, cy, Z1 - 100, Z1 - 70, rr, 28); a.box(X0 + 20, cy + rr - 40, Z0, X0 + 160, cy + rr + 40, Z0 + 1300);
        return a.log('Added the rotor with four bar arms, the cage of upright bars with rings, the roof and the reader post (plan and 3D).');
      }
      for (const s of [-1, 1]) { const x0 = s > 0 ? X1 - 300 : X0, x1 = s > 0 ? X1 : X0 + 300; a.box(x0, YF + 30, Z0, x1, YB - 30, Z0 + 990); a.box(x0 - 8, YF + 22, Z0 + 990, x1 + 8, YB - 22, Z0 + 1020); a.rect(x0, YF + 30, x1, YB - 30);
        const fx0 = s > 0 ? X1 - 300 - 520 : X0 + 300, fx1 = fx0 + 520; a.box(fx0, cy - 15, Z0 + 680, fx1, cy + 15, Z0 + 940); a.rect(fx0, cy - 15, fx1, cy + 15, 'EQUIP-DETAIL');
        a.box(s > 0 ? x0 + 30 : x0 + 80, YF + 24, Z0 + 780, s > 0 ? x0 + 220 : x1 - 30, YF + 30, Z0 + 840); a.box(x0 + 80, YF + 28, Z0 + 900, x0 + 120, YF + 30, Z0 + 950); a.box(x0 + 100, YB - 30, Z0 + 1020, x1 - 100, YB - 20, Z0 + 1050); }
      a.log('Added the two cabinets with covers, the two flaps, reader pads and direction lights (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', title: 'Generic diving board',
    desc: (v) => v.plat ? `Diving tower platform ${v.ht} m high: a ${v.pw} in wide platform slab on a tubular tower frame with a ladder stair up the back, a rail on the sides and back, and a front lip.` : `Springboard at ${v.ht} m: a ${v.len} in plank on a stand with a rear fulcrum roller, a base frame, ${v.ht === 3 ? 'a side ladder with handrails, ' : ''}and non-slip top surface lines.`,
    vs: [['1 m springboard', 28, 240, 56, 0, { ht: 1, len: 192 }], ['3 m springboard with ladder', 36, 260, 150, 0, { ht: 3, len: 192 }], ['5 m platform tower', 104, 160, 252, 0, { ht: 5, plat: true, pw: 80 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      if (v.plat) {
        const zp = Z0 + 5000, pw = 80 * IN, yy = YB - 100; a.box(cx - pw / 2, YF + 120, zp, cx + pw / 2, yy, zp + 120); a.box(cx - pw / 2, YF + 100, zp + 110, cx + pw / 2, YF + 130, zp + 160);
        for (const sx of [-1, 1]) for (const sy of [YF + 220, yy - 80]) { a.tube([[cx + sx * (pw / 2 - 100), sy, Z0], [cx + sx * (pw / 2 - 100), sy, zp]], [60, 60], 10); }
        for (const z of [1200, 2500, 3800]) { for (const sx of [-1, 1]) a.tube([[cx + sx * (pw / 2 - 100), YF + 220, Z0 + z], [cx + sx * (pw / 2 - 100), yy - 80, Z0 + z]], [20, 20], 6); a.tube([[cx - pw / 2 + 100, YF + 220, Z0 + z], [cx + pw / 2 - 100, YF + 220, Z0 + z]], [20, 20], 6); a.tube([[cx - pw / 2 + 100, yy - 80, Z0 + z], [cx + pw / 2 - 100, yy - 80, Z0 + z]], [20, 20], 6); }
        for (let i = 0; i < 4; i++) { a.tube([[cx - pw / 2 + 100, YF + 220, Z0 + 1200 + i * 1200], [cx + pw / 2 - 100, yy - 80, Z0 + 2400 + i * 1200 - 1200 + 0]], [12, 12], 5); }
        for (const sx of [-1, 1]) { a.tube([[cx + sx * (pw / 2 - 40), yy, zp + 120], [cx + sx * (pw / 2 - 40), yy, zp + 1250]], [15, 15], 6); a.tube([[cx + sx * (pw / 2 - 40), YF + 130, zp + 120], [cx + sx * (pw / 2 - 40), YF + 130, zp + 1250]], [15, 15], 6); a.tube([[cx + sx * (pw / 2 - 40), YF + 130, zp + 1250], [cx + sx * (pw / 2 - 40), yy, zp + 1250]], [15, 15], 6); }
        a.tube([[cx - pw / 2 + 40, yy, zp + 1250], [cx + pw / 2 - 40, yy, zp + 1250]], [15, 15], 6);
        for (let i = 0; i <= 22; i++) a.box(cx - 380, yy - 100 - 0 + 60, Z0 + 200 + i * 205, cx + 380, yy + 20, Z0 + 215 + i * 205);
        for (const sx of [-1, 1]) a.tube([[cx + sx * 380, yy + 20, Z0], [cx + sx * 380, yy + 20, zp + 120]], [15, 15], 6);
        a.box(cx - pw / 2 - 300, YF + 40, Z0, cx + pw / 2 + 300, yy + 80, Z0 + 20); a.rect(cx - pw / 2, YF + 120, cx + pw / 2, yy); a.rect(cx - 380, yy, cx + 380, yy + 60, 'EQUIP-DETAIL');
        return a.log('Added the platform slab with front lip, tower frame, ladder stair, side and back rails (plan and 3D).');
      }
      const ht = v.ht * 1000, len = v.len * IN, bw = 500, yf = YF + 120, zs = Z0 + ht - 260 + (v.ht === 1 ? 140 : 0) - (v.ht === 1 ? 0 : 0);
      const zt = Z0 + (v.ht === 1 ? 940 : 2900), by0 = YB - 600;
      a.box(cx - 300, by0 - 200, Z0, cx + 300, YB - 40, Z0 + 60);
      for (const sx of [-1, 1]) { a.tube([[cx + sx * 250, YB - 80, Z0 + 60], [cx + sx * 250, YB - 80, zt - 60]], [40, 40], 8); a.tube([[cx + sx * 250, by0 - 140, Z0 + 60], [cx + sx * 250, YB - 80, zt - 60]], [30, 30], 8); a.tube([[cx + sx * 250, by0 + 120, Z0 + 60], [cx + sx * 250, by0 + 120, zt - 60]], [30, 30], 8); }
      a.box(cx - 270, by0 + 100, zt - 70, cx + 270, YB - 40, zt - 20); a.xcyl(cx - 220, cx + 220, by0 + 180, zt + 15, 38, 12);
      a.xcyl(cx - 260, cx + 260, by0 + 180, zt - 80, 24, 8);
      const yEnd = YF + 80, y0 = YB - 330, zb = zt + 40, rise = len * 0.02;
      prismX(a, [[YB - 40, zb], [yEnd, zb + rise], [yEnd, zb + rise + 55], [YB - 40, zb + 55]], cx - bw / 2, cx + bw / 2);
      for (let i = 0; i < 10; i++) { const y = yEnd + 100 + i * 200; seg(a, cx - 230, y, cx + 230, y, 14, zb + rise + 55, zb + rise + 58, false); }
      a.line(cx, yEnd, cx, YB - 40, 'EQUIP-DETAIL');
      if (v.ht === 3) { const lx = cx + 500; for (const sy of [-1, 1]) a.tube([[lx + 0, by0 + sy * 300 + 100, Z0], [lx, by0 + sy * 300 + 100, Z0 + 3100]], [18, 18], 6); for (let i = 0; i <= 12; i++) a.box(lx - 170, by0 - 200 + 100, Z0 + 250 + i * 215, lx + 170, by0 - 180 + 100, Z0 + 265 + i * 215); a.tube([[lx - 170, by0 + 100, Z0 + 3300], [lx + 170, by0 + 100, Z0 + 3300]], [15, 15], 6); }
      a.log('Added the base frame, support legs, fulcrum roller, the plank with non-slip lines' + (v.ht === 3 ? ' and a side ladder' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', title: 'Generic climbing wall',
    desc: (v) => `Indoor climbing wall ${v.wft} ft wide and ${v.hft} ft high: ${v.kind}, a steel back frame, bolted wall panels with an offset grid of holds, a ${v.mat} in crash mat at the base and a top-out rail.`,
    vs: [['vertical, 12 x 12 ft', 144, 70, 156, 0, { wft: 12, hft: 12, kind: 'one vertical plane', ang: 0, nh: 70, mat: 8, seed: 11 }], ['with overhang, 15 x 15 ft', 180, 130, 190, 0, { wft: 15, hft: 15, kind: 'a vertical lower plane and a 25 degree overhanging upper plane', ang: 25, nh: 110, mat: 8, seed: 23 }], ['arch, 20 x 20 ft', 240, 150, 252, 0, { wft: 20, hft: 20, kind: 'a vertical plane, a 30 degree overhang and a roof panel', ang: 30, nh: 170, mat: 12, seed: 5, roof: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline(); const H = v.hft * FT, mt = v.mat * IN, zb = Z0 + mt, yw = YB - 200, t = 90;
      a.box(X0 + 20, YF + 40, Z0, X1 - 20, YF + 40 + 1500, Z0 + mt);
      const lower = v.ang ? H * 0.5 : H, ang = (v.ang * PI) / 180;
      prismX(a, [[yw, zb], [yw, zb + lower], [yw + t, zb + lower], [yw + t, zb]], X0 + 100, X1 - 100);
      climbHolds(a, X0 + 100, X1 - 100, yw, zb, zb + lower, v.nh * 0.55 | 0, v.seed);
      if (v.ang) { const up_ = H - lower, dy = up_ * m.sin(ang), dz = up_ * m.cos(ang);
        prismX(a, [[yw, zb + lower], [yw - dy, zb + lower + dz], [yw - dy + t, zb + lower + dz], [yw + t, zb + lower]], X0 + 100, X1 - 100);
        climbHolds(a, X0 + 100, X1 - 100, yw - dy * 0.5, zb + lower, zb + lower + dz, v.nh * 0.45 | 0, v.seed + 7);
        for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 100); a.tube([[x, yw + 70, zb], [x, yw + 70, zb + lower]], [38, 38], 8); a.tube([[x, yw + 70, zb + lower], [x, yw - dy + 70, zb + lower + dz]], [38, 38], 8); a.tube([[x, yw + 70, zb + lower * 0.5], [x, YB - 30, zb]], [26, 26], 8); }
        if (v.roof) { const rz = zb + lower + dz, ry = yw - dy; prismX(a, [[ry, rz], [ry - 1300, rz - 40], [ry - 1300, rz - 40 + t], [ry, rz + t]], X0 + 100, X1 - 100); climbHolds(a, X0 + 100, X1 - 100, ry - 650, rz - 800, rz + 0, 26, v.seed + 3); }
        a.tube([[X0 + 100, yw - dy + 40, zb + lower + dz + 60], [X1 - 100, yw - dy + 40, zb + lower + dz + 60]], [20, 20], 7);
      } else { for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 100); a.tube([[x, yw + 70, zb], [x, yw + 70, zb + lower]], [38, 38], 8); a.tube([[x, yw + 70, zb + lower * 0.5], [x, YB - 30, zb]], [26, 26], 8); } a.tube([[X0 + 100, yw + t + 40, zb + lower + 60], [X1 - 100, yw + t + 40, zb + lower + 60]], [20, 20], 7); }
      for (let i = 1; i < 4; i++) a.line(X0 + 100, yw + 10, X1 - 100, yw + 10, 'EQUIP-DETAIL');
      a.log('Added the crash mat, back frame, wall panels with holds' + (v.ang ? ', the overhang' : '') + (v.roof ? ' and roof panel' : '') + ' and the top-out rail (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', title: 'Generic race starting gate',
    desc: (v) => `Starting gate of ${v.n} stalls, each ${v.sw} in wide and ${v.len} in long: tube-frame partitions with rails and posts, a front gate of bars on each stall, a rear door, a top rail along the run and a base rail on short feet.`,
    vs: [['4 stalls', 156, 90, 84, 0, { n: 4, sw: 36, len: 84 }], ['8 stalls', 300, 90, 84, 0, { n: 8, sw: 36, len: 84 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline(); const sw = v.sw * IN, n = v.n, x0 = cx - (n * sw) / 2, yf = YF + 100, yb = YB - 100, ht = Z1 - 40;
      for (let i = 0; i <= n; i++) { const x = x0 + i * sw; for (const y of [yf, yb]) a.tube([[x, y, Z0 + 40], [x, y, ht]], [30, 30], 8);
        for (const z of [350, 750, 1150, 1550, 1900]) if (Z0 + z < ht) a.tube([[x, yf, Z0 + z], [x, yb, Z0 + z]], [14, 14], 6);
        a.tube([[x, yf, Z0 + 40], [x, yb, Z0 + 40]], [18, 18], 6); a.box(x - 25, yf - 20, Z0, x + 25, yf + 80, Z0 + 20); a.box(x - 25, yb - 80, Z0, x + 25, yb + 20, Z0 + 20); }
      for (let i = 0; i < n; i++) { const xa = x0 + i * sw + 30, xb = x0 + (i + 1) * sw - 30; for (const z of [300, 700, 1100, 1500]) a.tube([[xa, yf - 10, Z0 + z], [xb, yf - 10, Z0 + z]], [11, 11], 6); for (const f of [0.25, 0.5, 0.75]) a.tube([[xa + (xb - xa) * f, yf - 10, Z0 + 300], [xa + (xb - xa) * f, yf - 10, Z0 + 1500]], [9, 9], 5); a.box(xa + 20, yf - 30, Z0 + 1550, xb - 20, yf - 10, Z0 + 1640);
        for (const z of [400, 900, 1400]) a.tube([[xa, yb + 10, Z0 + z], [xb, yb + 10, Z0 + z]], [11, 11], 6); a.rect(x0 + i * sw + 30, yf - 20, x0 + (i + 1) * sw - 30, yf, 'EQUIP-DETAIL'); a.rect(x0 + i * sw + 30, yb, x0 + (i + 1) * sw - 30, yb + 20, 'EQUIP-DETAIL'); }
      a.tube([[x0, yf, ht], [x0 + n * sw, yf, ht]], [20, 20], 7); a.tube([[x0, yb, ht], [x0 + n * sw, yb, ht]], [20, 20], 7);
      a.log('Added the tube-frame partitions, front gate bars, rear doors and the top and base rails for each stall (plan and 3D).');
    } }),
];

// @@END
const ALL = [...COURTS, ...EQUIP, ...BOARDS, ...FIT, ...FIT2, ...VENUES, ...VENUES2];
for (const f of ALL) if (f.ft) f.vs = f.vs.map(([l, w, d, ...r]) => [l, w * 12, d * 12, ...r]);
export default ALL;

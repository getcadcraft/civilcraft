/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, educational: more classroom furniture, school laboratory ware, teaching models, early-years and sports-hall play. Original geometry; generic by type and size class. */
import { fam, cab, tbl, pull } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = m.PI;

// ------------------------------------------------------------------------------------------ helpers (copied from round 6)
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
/** solid of revolution about a vertical axis at (cx, cy): prof = [[radius, height above z0], …] bottom to top */
function lathe(a, cx, cy, z0, prof, seg = 16, a0 = 0, a1 = 2 * PI, cap = true) {
  const P = (r, z, j) => { const t = a0 + ((a1 - a0) * j) / seg; return [cx + r * m.cos(t), cy + r * m.sin(t), z0 + z]; };
  for (let i = 0; i < prof.length - 1; i++) for (let j = 0; j < seg; j++) {
    const [r0, h0] = prof[i], [r1, h1] = prof[i + 1];
    a.t.push([P(r0, h0, j), P(r0, h0, j + 1), P(r1, h1, j + 1)], [P(r0, h0, j), P(r1, h1, j + 1), P(r1, h1, j)]);
  }
  if (cap) {
    const [rb, hb] = prof[0], [rt, ht] = prof[prof.length - 1];
    for (let j = 0; j < seg; j++) {
      if (rb > 0.01) a.t.push([[cx, cy, z0 + hb], P(rb, hb, j + 1), P(rb, hb, j)]);
      if (rt > 0.01) a.t.push([[cx, cy, z0 + ht], P(rt, ht, j), P(rt, ht, j + 1)]);
    }
  }
  return a;
}
function ring(a, cx, cy, z, R, r, n = 18, seg = 6) { const pts = []; for (let i = 0; i <= n; i++) { const t = (2 * PI * i) / n; pts.push([cx + R * m.cos(t), cy + R * m.sin(t), z]); } a.tube(pts, pts.map(() => r), seg); }
function sph(a, x, y, z, r, nu = 12, nv = 7) { a.ell(x, y, z, r, r, r, nu, nv); }
/** a drawer or door front panel with a bar pull; the pull sticks out 34 mm in front of yf */
function drw(a, x0, x1, z0, z1, yf) { a.box(x0, yf, z0, x1, yf + 18, z1); pull(a, 'bar', (x0 + x1) / 2, (z0 + z1) / 2, yf); }
/** a small deterministic pseudo-random in 0..1 */
const rnd = (i) => { const s = m.sin(i * 12.9898 + 4.1414) * 43758.5453; return s - m.floor(s); };

// ------------------------------------------------------------------------------------------ classroom
const classroom = [
  fam({ cat: 'educational/classroom', title: 'Generic teacher desk with drawer pedestals',
    desc: (v) => `Teacher desk ${v.w} in wide with a ${v.ped === 2 ? 'drawer pedestal at each end' : 'drawer pedestal on the right and a panel leg on the left'}, ${v.rows} drawers per pedestal with bar pulls, a shallow centre drawer, a modesty panel and a plain top.`,
    vs: [['48 x 24 in, one pedestal', 48, 24, 30, 0, { ped: 1, rows: 3 }], ['60 x 30 in, one pedestal', 60, 30, 30, 0, { ped: 1, rows: 3 }], ['60 x 30 in, two pedestals', 60, 30, 30, 0, { ped: 2, rows: 3 }], ['72 x 30 in, two pedestals, four drawers each', 72, 30, 30, 0, { ped: 2, rows: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx } = a, tT = 34, topZ = Z1 - tT, pw = 440, fy = YF + 40;
      a.outline(); a.box(X0, YF, topZ, X1, 0, Z1); a.rect(X0 + 15, YF + 15, X1 - 15, -15, 'EQUIP-DETAIL');
      const peds = v.ped === 2 ? [[X0 + 30, X0 + 30 + pw], [X1 - 30 - pw, X1 - 30]] : [[X1 - 30 - pw, X1 - 30]];
      for (const [x0, x1] of peds) {
        a.box(x0, fy + 18, Z0 + 60, x1, -20, topZ); a.box(x0 + 12, YF + 70, Z0, x1 - 12, -40, Z0 + 60); a.rect(x0, fy, x1, -20, 'EQUIP-HIDDEN');
        const dz = (topZ - 10 - Z0 - 70) / v.rows;
        for (let i = 0; i < v.rows; i++) { const z1 = topZ - 8 - i * dz; drw(a, x0 + 6, x1 - 6, z1 - dz + 6, z1, fy); }
      }
      if (v.ped === 1) { a.box(X0 + 30, YF + 70, Z0, X0 + 56, -20, topZ); a.rect(X0 + 30, YF + 70, X0 + 56, -20, 'EQUIP-HIDDEN'); }
      const ix0 = v.ped === 2 ? X0 + 30 + pw : X0 + 56, ix1 = X1 - 30 - pw;
      a.box(ix0, -50, Z0 + 200, ix1, -20, topZ - 4); a.line(ix0, -35, ix1, -35, 'EQUIP-HIDDEN');
      drw(a, ix0 + 40, ix1 - 40, topZ - 90, topZ - 6, fy + 100);
      a.log('Added the top, drawer pedestal' + (v.ped === 2 ? 's' : ' and panel leg') + ' with drawers and pulls, the centre drawer and the modesty panel (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic flip-top trapezoid group table',
    desc: (v) => v.kind === 'half' ? `Half-round group table ${v.w} in across the straight edge, with a rounded edge band, a steel apron and four tube legs on glides.` : `Trapezoid group table, ${v.w} in on the long edge and half that on the short edge, with an edge band, a steel apron and four tube legs on glides.`,
    vs: [['trapezoid, 60 x 30 in, 24 in high', 60, 30, 24, 0, {}], ['trapezoid, 60 x 30 in, 29 in high', 60, 30, 29, 0, {}], ['trapezoid, 72 x 36 in, 29 in high', 72, 36, 29, 0, {}], ['half round, 60 x 30 in, 26 in high', 60, 30, 26, 0, { kind: 'half' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, W, D } = a, tT = 32, topZ = Z1 - tT;
      let pts;
      if (v.kind === 'half') { pts = []; for (let i = 0; i <= 14; i++) { const t = (PI * i) / 14; pts.push([cx + (W / 2) * m.cos(t), -(D) * m.sin(t)]); } pts.reverse(); }
      else pts = [[X0, 0], [X1, 0], [cx + W / 4, YF], [cx - W / 4, YF]];
      a.prism(pts, topZ, Z1); a.poly(pts);
      const ins = pts.map(([x, y]) => [cx + (x - cx) * 0.92, y * 0.9 - (y < -1 ? 0 : 10)]); a.poly(pts.map(([x, y]) => [cx + (x - cx) * 0.94, y * 0.92 - (y > -1 ? 25 : 0)]), 'EQUIP-DETAIL');
      const lg = v.kind === 'half' ? [[X0 + 90, -60], [X1 - 90, -60], [cx - 160, YF + D * 0.55], [cx + 160, YF + D * 0.55]] : [[X0 + 70, -60], [X1 - 70, -60], [cx - W / 4 + 60, YF + 70], [cx + W / 4 - 60, YF + 70]];
      for (const [x, y] of lg) { a.tube([[x, y, Z0 + 12], [x, y, topZ - 4]], [14, 14], 8); a.cyl(x, y, Z0, Z0 + 14, 20, 10); a.circ(x, y, 14, 'EQUIP-HIDDEN'); }
      a.tube([[lg[0][0], lg[0][1], topZ - 60], [lg[1][0], lg[1][1], topZ - 60]], [10, 10], 6); a.tube([[lg[2][0], lg[2][1], topZ - 60], [lg[3][0], lg[3][1], topZ - 60]], [10, 10], 6);
      a.tube([[lg[0][0], lg[0][1], topZ - 60], [lg[3][0], lg[3][1], topZ - 60]], [10, 10], 6); a.tube([[lg[1][0], lg[1][1], topZ - 60], [lg[2][0], lg[2][1], topZ - 60]], [10, 10], 6);
      a.log('Added the ' + (v.kind === 'half' ? 'half-round' : 'trapezoid') + ' top, apron rails and four tube legs with glides (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic classroom bookcase with books',
    desc: (v) => `Open bookcase, ${v.w} in wide with ${v.cols} bay${v.cols > 1 ? 's' : ''}, ${v.sh + 1} levels, a plinth and a back panel, with rows of books standing on the shelves.`,
    vs: [['24 in wide, 30 in high', 24, 12, 30, 0, { cols: 1, sh: 1 }], ['36 in wide, 36 in high', 36, 12, 36, 0, { cols: 2, sh: 2 }], ['36 in wide, 48 in high', 36, 12, 48, 0, { cols: 2, sh: 3 }], ['48 in wide, 60 in high', 48, 12, 60, 0, { cols: 3, sh: 4 }], ['48 in wide, 72 in high', 48, 12, 72, 0, { cols: 3, sh: 5 }], ['72 in wide, 48 in high', 72, 12, 48, 0, { cols: 4, sh: 3 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1 } = a, toe = 70, T = 19, base = Z0 + toe, lv = v.sh + 1;
      cab(a, { open: true, cols: v.cols, shelves: v.sh, toe });
      const bw = (X1 - X0 - 2 * T) / v.cols;
      for (let k = 0; k < lv; k++) {
        const zA = base + T + ((Z1 - base) * k) / lv - (k ? 0 : 0) + (k ? T : 0), zB = base + ((Z1 - base) * (k + 1)) / lv - (k === lv - 1 ? T : 0), hh = zB - zA - 18;
        for (let c = 0; c < v.cols; c++) {
          let x = X0 + T + c * bw + T / 2 + 10; const xe = X0 + T + (c + 1) * bw - T / 2 - 10 - (c % 2 ? 0 : bw * 0.18);
          let i = k * 31 + c * 7;
          while (x < xe - 18) { const w = 18 + rnd(i) * 22, h = hh * (0.55 + rnd(i + 3) * 0.4), tilt = i % 9 === 0; a.box(x, YF + 40, zA, x + w, YB - T - 25, zA + h); x += w + 2; i++; if (tilt) break; }
        }
      }
      a.log('Added the plinth, sides, shelves, back and the rows of books (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic tote tray cart',
    desc: (v) => `Mobile cart with ${v.n} shallow tote trays in ${v.cols} columns, two side panels, a top and a base shelf, a push handle and four swivel casters.`,
    vs: [['6 trays', 29, 14, 30, 0, { n: 6, cols: 2 }], ['9 trays', 36, 14, 32, 0, { n: 9, cols: 3 }], ['12 trays', 36, 14, 40, 0, { n: 12, cols: 3 }], ['15 trays, tall', 36, 14, 50, 0, { n: 15, cols: 3 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1 } = a, ch = 100, T = 19, rows = v.n / v.cols, cw = (a.W - 2 * T) / v.cols, zb = Z0 + ch + 30, zt = Z1 - 30 - T;
      a.outline();
      a.box(X0, YF, Z0 + ch - 20, X0 + T, 0, Z1 - 30); a.box(X1 - T, YF, Z0 + ch - 20, X1, 0, Z1 - 30); a.box(X0, -T, Z0 + ch - 20, X1, 0, Z1 - 30);
      a.box(X0, YF, Z0 + ch - 20, X1, 0, zb - 10); a.box(X0, YF, zt, X1, 0, Z1 - 30);
      for (const [x, y] of [[X0 + 50, YF + 50], [X1 - 50, YF + 50], [X0 + 50, -50], [X1 - 50, -50]]) { a.caster(x, y, ch); a.circ(x, y, 22, 'EQUIP-HIDDEN'); }
      const th = (zt - zb) / rows;
      for (let r = 0; r < rows; r++) for (let c = 0; c < v.cols; c++) {
        const x0 = X0 + T + c * cw + 6, x1 = X0 + T + (c + 1) * cw - 6, z0 = zb + r * th + 4, z1 = zb + (r + 1) * th - 4;
        a.box(x0, YF + 30, z0, x1, -T, z1); a.box(x0 + 10, YF + 4, z0 + (z1 - z0) * 0.5, x1 - 10, YF + 30, z1); a.box((x0 + x1) / 2 - 50, YF, z1 - 40, (x0 + x1) / 2 + 50, YF + 30, z1 - 12);
        if (r === 0) a.line(x0, YF + 30, x1, YF + 30, 'EQUIP-DETAIL');
      }
      a.tube([[X0 + 40, -50, Z1 - 34], [X0 + 40, -90, Z1 + 0], [X1 - 40, -90, Z1 + 0], [X1 - 40, -50, Z1 - 34]].map(([x, y, z]) => [x, y, m.min(z, Z1 - 4)]), [12, 12, 12, 12], 8);
      a.log('Added the side panels, base shelf, top, ' + v.n + ' tote trays with grips, the push handle and casters (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic projector screen',
    desc: (v) => v.tri ? `Tripod projection screen, ${v.sw} in wide: a roller case at the top, a tensioned white screen with a weighted bar, a telescoping centre column and three splayed legs with feet.` : `Wall pull-down projection screen, ${v.sw} in wide: a roller case with end caps and brackets, a white screen with a black drop border, a weighted bar and a pull cord.`,
    vs: [['wall pull-down, 72 x 54 in screen', 78, 5, 62, 36, { sw: 72, sh: 54 }], ['wall pull-down, 96 x 54 in widescreen', 102, 5, 62, 36, { sw: 96, sh: 54 }], ['tripod, 60 x 60 in screen', 66, 30, 84, 0, { sw: 60, sh: 60, tri: true }], ['tripod, 84 x 63 in screen', 90, 34, 96, 0, { sw: 84, sh: 63, tri: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, W } = a, sw = v.sw * IN, sh = v.sh * IN, cr = 48;
      a.outline('EQUIP-DETAIL');
      if (!v.tri) {
        const zc = Z1 - cr - 6;
        a.xcyl(X0 + 10, X1 - 10, -70, zc, cr, 14); for (const x of [X0 + 6, X1 - 6]) a.box(x - 6, -80, zc - cr - 6, x + 6, -4, zc + cr + 6);
        a.box(cx - sw / 2, -74, zc - cr - sh, cx + sw / 2, -68, zc - cr + 5); a.box(cx - sw / 2, -76, zc - cr - sh, cx + sw / 2, -66, zc - cr - sh + 40);
        a.box(cx - sw / 2 - 10, -80, zc - cr - sh - 4, cx + sw / 2 + 10, -60, zc - cr - sh + 4); a.xcyl(cx - sw / 2, cx + sw / 2, -70, zc - cr - sh + 8, 14, 8);
        a.tube([[cx + sw / 2 - 150, -70, zc - cr - sh], [cx + sw / 2 - 150, -70, zc - cr - sh - 0.1]], [3, 3], 4);
        a.rect(X0 + 10, -80, X1 - 10, -60, 'EQUIP');
        a.xcyl(X0 + 10, X1 - 10, -70, zc, cr, 14);
        return a.log('Added the roller case with end caps and brackets, the screen with its bar and the pull cord ring (plan and 3D).');
      }
      const ty = -110, zc = Z1 - cr - 6;
      a.xcyl(cx - sw / 2 - 10, cx + sw / 2 + 10, ty, zc, cr, 14); a.box(cx - sw / 2, ty - 5, zc - cr - sh, cx + sw / 2, ty + 1, zc - cr + 5); a.box(cx - sw / 2 - 10, ty - 12, zc - cr - sh - 6, cx + sw / 2 + 10, ty + 8, zc - cr - sh + 6);
      a.cyl(cx, ty - 2, Z0 + 600, zc - cr, 22, 10); a.cyl(cx, ty - 2, Z0 + 400, Z0 + 640, 28, 10);
      const sp = m.min(W / 2 - 90, 520), fy = YF + 60;
      for (const [fx, fyy] of [[cx - sp, -60], [cx + sp, -60], [cx, fy]]) { a.tube([[cx, ty - 2, Z0 + 560], [fx, fyy, Z0 + 30]], [14, 12], 8); a.cyl(fx, fyy, Z0, Z0 + 30, 26, 10); a.circ(fx, fyy, 26, 'EQUIP-HIDDEN'); a.line(cx, ty, fx, fyy, 'EQUIP-DETAIL'); }
      a.rect(cx - sw / 2, ty - 5, cx + sw / 2, ty + 1, 'EQUIP');
      a.log('Added the roller case, the tensioned screen with bar, the centre column and three splayed legs with feet (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic art room table with storage',
    desc: (v) => v.kind === 'round' ? `Round art table ${v.w} in across on a pedestal with a spread foot and a rotating pot caddy at the centre holding six cups.` : v.kind === 'roll' ? `Art table ${v.w} in long with a paper-roll holder at the back (two posts, a roll and a hanging sheet) and an under-shelf with three bins.` : `Art table ${v.w} in long with an edge lip, an apron, four legs and an under-shelf with three bins.`,
    vs: [['rectangular with bins, 60 x 30 in', 60, 30, 30, 0, { kind: 'rect' }], ['with paper roll holder, 72 x 30 in', 72, 30, 52, 0, { kind: 'roll' }], ['round with pot caddy, 48 in', 48, 48, 34, 0, { kind: 'round' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy } = a;
      if (v.kind === 'round') {
        const top = Z0 + 28 * IN, rad = a.W / 2;
        a.ell(cx, cy, top - 19, rad, rad, 19, 28, 4); a.cone(cx, cy, Z0 + 30, top - 38, 70, 55, 14); a.ell(cx, cy, Z0 + 15, rad * 0.4, rad * 0.4, 15, 18, 4); a.circ(cx, cy, rad); a.circ(cx, cy, rad - 25, 'EQUIP-DETAIL'); a.circ(cx, cy, rad * 0.4, 'EQUIP-HIDDEN');
        a.cyl(cx, cy, top, top + 95, 150, 16); for (let i = 0; i < 6; i++) { const t = (2 * PI * i) / 6; a.cyl(cx + m.cos(t) * 95, cy + m.sin(t) * 95, top + 95, top + 175, 32, 10); a.circ(cx + m.cos(t) * 95, cy + m.sin(t) * 95, 32, 'EQUIP-DETAIL'); }
        return a.log('Added the round top, pedestal foot, the pot caddy and six cups (plan and 3D).');
      }
      const top = Z0 + 30 * IN;
      tbl(a, { base: 'legs', topT: 36, apron: 70, shelf: 150, edge: 12 });
      const bw = (a.W - 260) / 3;
      for (let i = 0; i < 3; i++) { const x0 = X0 + 130 + i * bw + 8, x1 = X0 + 130 + (i + 1) * bw - 8; a.box(x0, YF + 110, Z0 + 168, x1, -110, Z0 + 300); a.box(x0 + 30, YF + 100, Z0 + 270, x1 - 30, YF + 110, Z0 + 296); a.rect(x0, YF + 110, x1, -110, 'EQUIP-HIDDEN'); }
      if (v.kind === 'roll') {
        for (const x of [X0 + 50, X1 - 50]) a.box(x - 14, -70, top, x + 14, -42, top + 330);
        a.xcyl(X0 + 50, X1 - 50, -56, top + 300, 36, 14); a.xcyl(X0 + 40, X1 - 40, -56, top + 300, 8, 8);
        a.box(X0 + 90, -92, top + 12, X1 - 90, -88, top + 300); a.line(X0 + 90, -90, X1 - 90, -90, 'EQUIP-DETAIL');
        a.rect(X0 + 36, -70, X1 - 36, -42, 'EQUIP-DETAIL');
      }
      a.log('Added the top with edge lip, apron, legs, the under-shelf with three bins' + (v.kind === 'roll' ? ' and the paper-roll holder' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic study carrel',
    desc: (v) => `${v.n === 1 ? 'Single' : v.n === 2 ? 'Double' : 'Triple'} study carrel, ${v.n} station${v.n > 1 ? 's' : ''}: a desk top at 29 in, end and divider panels to the floor, and privacy screens on the top at the sides and back.`,
    vs: [['single station, 30 in', 30, 24, 54, 0, { n: 1 }], ['double station, 60 in', 60, 24, 54, 0, { n: 2 }], ['triple station, 90 in', 90, 24, 54, 0, { n: 3 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1 } = a, tz = Z0 + 29 * IN, sw = a.W / v.n, T = 25;
      a.outline(); a.box(X0, YF, tz - 28, X1, 0, tz);
      for (let i = 0; i <= v.n; i++) { const x = X0 + i * sw; const x0 = i === 0 ? x : i === v.n ? x - T : x - T / 2; a.box(x0, YF + 40, Z0 + 20, x0 + T, -20, Z1); a.box(x0 - 40, YF + 40, Z0, x0 + T + 40, -20, Z0 + 20); }
      a.box(X0, -30, tz, X1, -6, Z1); a.line(X0, -18, X1, -18, 'EQUIP-DETAIL');
      for (let i = 0; i < v.n; i++) { const x0 = X0 + i * sw + T + 60, x1 = X0 + (i + 1) * sw - T - 60; a.box(x0, -100, tz - 160, x1, -50, tz - 28); a.rect(x0, YF + 80, x1, -60, 'EQUIP-HIDDEN'); a.box((x0 + x1) / 2 - 120, -70, tz + 380, (x0 + x1) / 2 + 120, -30, tz + 420); }
      for (let i = 0; i <= v.n; i++) a.line(X0 + i * sw, YF + 40, X0 + i * sw, -20, 'EQUIP-DETAIL');
      a.log('Added the desk top, end and divider panels with floor skids, the back privacy screen and the under-top rail (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic cubby storage unit with bins',
    desc: (v) => `Open cubby unit, ${v.cols} columns by ${v.rows} rows (${v.cols * v.rows} cubbies), with a plinth, a back and a shallow bin in every second cubby.`,
    vs: [['2 x 2 cubbies, 24 in', 24, 12, 24, 0, { cols: 2, rows: 2 }], ['3 x 3 cubbies, 36 in', 36, 12, 36, 0, { cols: 3, rows: 3 }], ['4 x 3 cubbies, 48 in', 48, 12, 36, 0, { cols: 4, rows: 3 }], ['5 x 5 cubbies, 60 in', 60, 12, 60, 0, { cols: 5, rows: 5 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1 } = a, toe = 60, T = 19, base = Z0 + toe;
      cab(a, { open: true, cols: v.cols, shelves: v.rows - 1, toe });
      const cw = (a.W - 2 * T) / v.cols, ch = (Z1 - base) / v.rows;
      for (let r = 0; r < v.rows; r++) for (let c = 0; c < v.cols; c++) if ((r + c) % 2 === 0) {
        const x0 = X0 + T + c * cw + 14, x1 = X0 + T + (c + 1) * cw - 14, z0 = base + r * ch + T + 6, z1 = z0 + ch * 0.55;
        a.box(x0, YF + 30, z0, x1, -T - 8, z1); a.box(x0 + 8, YF + 6, z0 + (z1 - z0) * 0.5, x1 - 8, YF + 30, z1); a.box((x0 + x1) / 2 - 40, YF, z1 - 34, (x0 + x1) / 2 + 40, YF + 30, z1 - 10);
      }
      a.log('Added the plinth, frame, back, the cubbies and the bins with grips (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic AV and media cart',
    desc: (v) => v.pole ? 'Tall monitor trolley: two uprights, a shelf at mid height and one at the base, a vertical pole with a bracket and a flat monitor on it, a handle and four casters.' : `Presentation cart with ${v.shelves} shelves with lipped edges, four uprights, a push handle, a power strip on the lower shelf and four swivel casters.`,
    vs: [['projector cart, 2 shelves, 24 x 18 in', 24, 18, 34, 0, { shelves: 2 }], ['media cart, 3 shelves, 30 x 20 in', 30, 20, 42, 0, { shelves: 3 }], ['monitor trolley with pole, 32 x 24 in', 32, 24, 72, 0, { shelves: 2, pole: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx } = a, ch = 110, n = v.shelves;
      a.outline();
      const up = [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, -40], [X1 - 40, -40]];
      const topZ = v.pole ? Z0 + 900 : Z1 - 10;
      for (const [x, y] of up) { a.tube([[x, y, Z0 + ch - 20], [x, y, topZ]], [14, 14], 8); a.caster(x, y, ch); a.circ(x, y, 14, 'EQUIP-HIDDEN'); }
      for (let i = 0; i < n; i++) {
        const z = Z0 + ch - 10 + ((topZ - 24 - Z0 - ch + 10) * i) / (n - 1 || 1) + (i === n - 1 ? 0 : 30); const zz = i === n - 1 ? topZ - 24 : z;
        a.box(X0 + 12, YF + 12, zz, X1 - 12, -12, zz + 22); a.box(X0 + 12, YF + 12, zz + 22, X1 - 12, YF + 22, zz + 44); a.box(X0 + 12, -22, zz + 22, X1 - 12, -12, zz + 44);
        if (i === 0 && !v.pole) { a.box(X0 + 80, -150, zz + 22, X0 + 330, -80, zz + 50); a.line(X0 + 80, -150, X0 + 330, -80, 'EQUIP-DETAIL'); }
      }
      a.rect(X0 + 12, YF + 12, X1 - 12, -12, 'EQUIP-DETAIL');
      if (v.pole) {
        a.cyl(cx, -60, Z0 + 900, Z1 - 120, 24, 10); a.box(cx - 90, -110, Z1 - 560, cx + 90, -50, Z1 - 500); a.box(cx - 70, -130, Z1 - 160, cx + 70, -90, Z1 - 100);
        a.box(X0 + 60, -118, Z1 - 560, X1 - 60, -98, Z1 - 20); a.box(X0 + 70, -128, Z1 - 550, X1 - 70, -118, Z1 - 30); a.rect(X0 + 60, -128, X1 - 60, -98, 'EQUIP-DETAIL');
        a.tube([[X0 + 40, -40, Z0 + 900], [X0 + 40, -150, Z0 + 940], [X1 - 40, -150, Z0 + 940], [X1 - 40, -40, Z0 + 900]], [12, 12, 12, 12], 8);
      } else a.tube([[X0 + 40, -40, Z1 - 12], [X0 + 40, -100, Z1 - 4], [X1 - 40, -100, Z1 - 4], [X1 - 40, -40, Z1 - 12]].map(([x, y, z]) => [x, y, m.min(z, Z1 - 3)]), [12, 12, 12, 12], 8);
      a.log('Added the uprights, lipped shelves, casters' + (v.pole ? ', pole, bracket and flat monitor' : ', push handle and power strip') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic folding lunch table with attached benches',
    desc: (v) => `Cafeteria table ${v.len} in long: a ${v.len} by 30 in top between two bench seats, joined by tube end frames with floor feet, with a fold line drawn along each frame.`,
    vs: [['6 ft', 72, 60, 29, 0, { len: 72 }], ['8 ft', 96, 60, 29, 0, { len: 96 }], ['10 ft', 120, 60, 29, 0, { len: 120 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cy } = a, tz = Z1 - 36, bz = Z0 + 17 * IN, tw = 380;
      a.outline('EQUIP-DETAIL'); a.box(X0, cy - tw, tz, X1, cy + tw, Z1); a.rect(X0, cy - tw, X1, cy + tw);
      for (const [y0, y1] of [[YF + 20, YF + 20 + 290], [-20 - 290, -20]]) { a.box(X0 + 20, y0, bz - 34, X1 - 20, y1, bz); a.rect(X0 + 20, y0, X1 - 20, y1, 'EQUIP-DETAIL'); }
      for (const x of [X0 + 160, X1 - 160]) {
        for (const s of [-1, 1]) { a.tube([[x, cy + s * 330, Z0 + 20], [x, cy + s * 330, tz]], [17, 17], 8); a.tube([[x, cy + s * 330, bz - 40], [x, cy + s * 560, bz - 40]], [14, 14], 8); a.tube([[x, cy + s * 560, bz - 40], [x, cy + s * 560, Z0 + 20]], [14, 14], 8); a.circ(x, cy + s * 330, 17, 'EQUIP-HIDDEN'); a.circ(x, cy + s * 560, 14, 'EQUIP-HIDDEN'); }
        a.tube([[x, cy - 560, Z0 + 14], [x, cy + 560, Z0 + 14]], [16, 16], 8); a.line(x, YF + 20, x, -20, 'EQUIP-HIDDEN');
      }
      a.log('Added the top, two bench seats, the tube end frames with posts, bench arms and floor feet (plan and 3D).');
    } }),
];


// ------------------------------------------------------------------------------------------ laboratory
const lab = [
  fam({ cat: 'educational/laboratory', title: 'Generic school bunsen burner',
    desc: (v) => `Gas burner on a round weighted foot: a side gas barb, a needle valve knob, a ${v.chim ? 'barrel with an air collar and a tall chimney tube' : 'barrel with an air collar and a flared top'}. Drawn at full size.`,
    vs: [['small, 5 in', 3, 3, 5, 0, {}], ['standard, 7 in', 3, 3, 7, 0, {}], ['with chimney, 9 in', 3, 3, 9, 0, { chim: true }]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W } = a, R = W / 2 - 2, bh = 14, bt = Z0 + bh * 2.4, top = v.chim ? Z1 - 70 : Z1;
      lathe(a, cx, cy, Z0, [[R, 0], [R, bh * 0.7], [R * 0.5, bh * 1.7], [R * 0.2, bh * 2.4]], 24); a.circ(cx, cy, R); a.circ(cx, cy, R * 0.2, 'EQUIP-DETAIL');
      a.cyl(cx, cy, bt, top, 8, 14); a.cone(cx, cy, top - 8, top, 8, 10.5, 14);
      const cz = Z0 + (top - Z0) * 0.3; a.cyl(cx, cy, cz, cz + 26, 12, 14); for (const s of [-1, 1]) a.box(cx + s * 11 - 1, cy - 3, cz + 6, cx + s * 11 + 1, cy + 3, cz + 18);
      a.xcyl(cx, cx + R * 0.97, cy, Z0 + 14, 5.5, 10); a.xcyl(cx + R * 0.7, cx + R * 0.97, cy, Z0 + 14, 7, 10); a.ycyl(cy - R * 0.55, cy - R * 0.2, cx - R * 0.15, Z0 + 20, 6, 10); a.ycyl(cy - R * 0.6, cy - R * 0.5, cx - R * 0.15, Z0 + 20, 10, 12);
      a.line(cx, cy, cx + R, cy, 'EQUIP-DETAIL');
      if (v.chim) { a.cyl(cx, cy, top, Z1, 13, 14); a.cone(cx, cy, Z1 - 4, Z1, 13, 15, 14); a.circ(cx, cy, 13, 'EQUIP-DETAIL'); }
      a.log('Added the weighted foot, gas barb, needle valve, barrel with air collar' + (v.chim ? ' and the chimney tube' : ' and flared top') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic test tube rack',
    desc: (v) => `Wooden rack with ${v.cols * v.rows} holes in ${v.rows} rows of ${v.cols} (the upper plate drawn solid, the holes shown in plan), end walls, a base plate and ${v.fill} glass test tubes standing in it.`,
    vs: [['6 hole, 1 row', 9.5, 2.2, 5, 0, { cols: 6, rows: 1, fill: 4 }], ['12 hole, 2 rows', 9.5, 4, 5, 0, { cols: 6, rows: 2, fill: 7 }], ['24 hole, 3 rows', 12, 5.2, 5, 0, { cols: 8, rows: 3, fill: 14 }], ['40 hole, 4 rows', 14.2, 6.3, 5, 0, { cols: 10, rows: 4, fill: 24 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy } = a, sp = 30, ox = cx - ((v.cols - 1) * sp) / 2, oy = cy - ((v.rows - 1) * sp) / 2 * 0 + ((v.rows - 1) * sp) / 2;
      a.outline(); a.box(X0, YF, Z0, X1, 0, Z0 + 12); a.box(X0, YF, Z0 + 12, X0 + 14, 0, Z0 + 95); a.box(X1 - 14, YF, Z0 + 12, X1, 0, Z0 + 95); a.box(X0, YF, Z0 + 76, X1, 0, Z0 + 92);
      a.box(X0 + 14, YF, Z0 + 34, X1 - 14, 0, Z0 + 44);
      let k = 0;
      for (let r = 0; r < v.rows; r++) for (let c = 0; c < v.cols; c++) {
        const x = ox + c * sp, y = cy + ((v.rows - 1) * sp) / 2 - r * sp; a.circ(x, y, 9, 'EQUIP-DETAIL');
        if (k++ < v.fill) { a.cyl(x, y, Z0 + 22, Z1 - 12, 8, 10); sph(a, x, y, Z0 + 22, 8, 10, 5); a.cyl(x, y, Z1 - 12, Z1 - 8, 9.5, 10); }
      }
      a.log('Added the base plate, end walls, upper hole plate and ' + v.fill + ' test tubes (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic laboratory glassware',
    desc: (v) => ({ beaker: `Thin-walled beaker, ${v.ml} mL class, a straight cylinder with a flared rim and printed graduation marks on the front.`, conical: `Conical flask, ${v.ml} mL class: a wide flat base, a sloped shoulder, a narrow neck and a rolled lip, with graduation marks.`, cylinder: `Graduated measuring cylinder, ${v.ml} mL class: a round foot, a tall narrow tube with a pouring lip and graduation marks every few millimetres.`, volumetric: `Volumetric flask, ${v.ml} mL class: a round bulb, a long narrow neck with a ring mark and a stopper.` })[v.kind],
    vs: [['beaker, 100 mL', 2.2, 2.2, 2.9, 0, { kind: 'beaker', ml: 100 }], ['beaker, 250 mL', 2.9, 2.9, 3.8, 0, { kind: 'beaker', ml: 250 }], ['beaker, 600 mL', 3.6, 3.6, 5, 0, { kind: 'beaker', ml: 600 }], ['beaker, 1000 mL', 4.2, 4.2, 5.8, 0, { kind: 'beaker', ml: 1000 }],
      ['conical flask, 125 mL', 2.7, 2.7, 4.2, 0, { kind: 'conical', ml: 125 }], ['conical flask, 250 mL', 3.4, 3.4, 5.4, 0, { kind: 'conical', ml: 250 }], ['conical flask, 500 mL', 4.2, 4.2, 6.9, 0, { kind: 'conical', ml: 500 }],
      ['measuring cylinder, 100 mL', 2.5, 2.5, 10, 0, { kind: 'cylinder', ml: 100 }], ['measuring cylinder, 500 mL', 3.5, 3.5, 14.4, 0, { kind: 'cylinder', ml: 500 }], ['volumetric flask, 250 mL', 3.8, 3.8, 9.4, 0, { kind: 'volumetric', ml: 250 }]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W, H } = a, R = W / 2 - 1.5, wt = 2.2, tick = (z, r, n = 1) => { for (let i = 0; i < n; i++) a.box(cx - r * 0.3 - (i ? 0 : 0), cy - r - 0, z, cx + r * 0.3, cy - r + 1.4, z + 1.2); };
      if (v.kind === 'beaker') {
        lathe(a, cx, cy, Z0, [[0, 0], [R, 0], [R, H * 0.96], [R + 1.4, H], [R - wt + 0.4, H], [R - wt, H * 0.96], [R - wt, 4], [0, 4]], 28);
        for (let i = 1; i <= 5; i++) a.box(cx - R * 0.35, cy - R + 0.2, Z0 + H * (0.1 + i * 0.15), cx + R * 0.35, cy - R + 1.6, Z0 + H * (0.1 + i * 0.15) + 1.3);
        a.box(cx - R * 0.3, cy - R - 0.2 + 1, Z0 + H * 0.84, cx + R * 0.3, cy - R + 1.7, Z0 + H * 0.84 + 12);
      } else if (v.kind === 'conical') {
        lathe(a, cx, cy, Z0, [[0, 0], [R, 0], [R, H * 0.1], [R * 0.3, H * 0.7], [R * 0.24, H * 0.86], [R * 0.3, H * 0.9], [R * 0.3, H], [R * 0.24, H], [R * 0.21, H * 0.86], [R * 0.2, H * 0.78], [R * 0.9, H * 0.11], [R * 0.9, 4], [0, 4]], 28);
        for (let i = 0; i < 3; i++) { const z = H * (0.2 + i * 0.12); const rr = R - (R * 0.7) * ((z - H * 0.1) / (H * 0.6)); a.box(cx - 6, cy - rr + 0.2, Z0 + z, cx + 6, cy - rr + 1.5, Z0 + z + 1.2); }
        a.circ(cx, cy, R * 0.3, 'EQUIP-DETAIL');
      } else if (v.kind === 'cylinder') {
        const tr = R * 0.58, fh = H * 0.045;
        lathe(a, cx, cy, Z0, [[R, 0], [R, fh * 0.6], [R * 0.78, fh * 1.6], [tr + 2, fh * 3.2], [tr, fh * 4]], 28); a.cyl(cx, cy, Z0 + fh * 4, Z0 + H - 4, tr, 24); a.cone(cx, cy, Z0 + H - 4, Z0 + H, tr, tr + 2, 24);
        for (let i = 0; i < 18; i++) a.box(cx - tr * (i % 5 === 0 ? 0.6 : 0.35), cy - tr + 0.1, Z0 + H * (0.12 + i * 0.048), cx + tr * (i % 5 === 0 ? 0.6 : 0.35), cy - tr + 1.3, Z0 + H * (0.12 + i * 0.048) + 1.1);
        a.circ(cx, cy, tr, 'EQUIP-DETAIL');
      } else {
        const br = R, bh = H * 0.34;
        lathe(a, cx, cy, Z0, [[0, 0], [br * 0.45, 0], [br * 0.9, bh * 0.2], [br, bh * 0.5], [br * 0.85, bh * 0.9], [br * 0.3, bh * 1.2], [br * 0.17, bh * 1.35]], 28, 0, 2 * PI, false);
        a.cyl(cx, cy, Z0 + bh * 1.3, Z0 + H * 0.86, br * 0.17, 16); a.cone(cx, cy, Z0 + H * 0.86, Z0 + H * 0.9, br * 0.17, br * 0.24, 16); a.cone(cx, cy, Z0 + H * 0.9, Z0 + H * 0.95, br * 0.24, br * 0.2, 16);
        a.cone(cx, cy, Z0 + H * 0.93, Z0 + H, br * 0.2, br * 0.26, 16); a.box(cx - br * 0.12, cy - br * 0.17 - 0.2, Z0 + H * 0.7, cx + br * 0.12, cy - br * 0.17 + 1, Z0 + H * 0.7 + 1.2);
        a.circ(cx, cy, br * 0.17, 'EQUIP-DETAIL');
      }
      a.circ(cx, cy, R); a.log('Added the ' + v.kind + ' glassware body with its rim' + (v.kind === 'volumetric' ? ', ring mark and stopper' : ' and graduation marks') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic laboratory balance',
    desc: (v) => ({ top: 'Top-loading electronic balance: a housing with a sloped front panel carrying a display window and three keys, a round weighing pan on a short stem and four feet.', ana: 'Analytical balance with a draft shield: a housing with a display panel, a glass-sided weighing chamber with a roof door and a small pan inside, on four levelling feet.', beam: 'Triple beam balance: a base with a pillar, three graduated beams with sliding weights and a pointer, and a round pan on a stem at the left.' })[v.kind],
    vs: [['top-loading, 7 x 8 in', 7, 8, 3.4, 0, { kind: 'top' }], ['analytical with draft shield, 9.5 x 15 in', 9.5, 15, 13.5, 0, { kind: 'ana' }], ['triple beam, 15 x 6 in', 15, 6, 9, 0, { kind: 'beam' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W, D, H } = a;
      a.outline('EQUIP-DETAIL');
      if (v.kind === 'top') {
        prismX(a, [[YF, Z0 + 8], [YF, Z0 + 28], [YF + 70, Z0 + 52], [-6, Z0 + 52], [-6, Z0 + 8]], X0, X1); for (const [x, y] of [[X0 + 14, YF + 14], [X1 - 14, YF + 14], [X0 + 14, -14], [X1 - 14, -14]]) a.cyl(x, y, Z0, Z0 + 9, 7, 8);
        a.box(cx - 40, YF + 4, Z0 + 28, cx + 40, YF + 34, Z0 + 42); for (const i of [-1, 0, 1]) a.box(cx + i * 22 - 7, YF + 36, Z0 + 38, cx + i * 22 + 7, YF + 56, Z0 + 46);
        a.cyl(cx, -100, Z0 + 52, Z0 + 66, 6, 8); a.cyl(cx, -100, Z0 + 66, Z1, 52, 20); a.circ(cx, -100, 52); a.rect(cx - 40, YF + 4, cx + 40, YF + 34, 'EQUIP-DETAIL');
        return a.log('Added the housing with sloped panel, display, keys, weighing pan on its stem and four feet (plan and 3D).');
      }
      if (v.kind === 'ana') {
        prismX(a, [[YF, Z0 + 8], [YF, Z0 + 40], [YF + 110, Z0 + 80], [-8, Z0 + 80], [-8, Z0 + 8]], X0, X1); for (const [x, y] of [[X0 + 14, YF + 14], [X1 - 14, YF + 14], [X0 + 14, -14], [X1 - 14, -14]]) a.cyl(x, y, Z0, Z0 + 9, 8, 8);
        a.box(cx - 55, YF + 4, Z0 + 40, cx + 55, YF + 50, Z0 + 64); for (const i of [-1, 1]) a.box(cx + i * 85 - 12, YF + 60, Z0 + 56, cx + i * 85 + 12, YF + 86, Z0 + 68);
        const y0 = YF + 190, y1 = -10, z0 = Z0 + 80;
        a.frame(X0 + 20, z0, X1 - 20, Z1, y0, y0 + 10, 14); a.frame(X0 + 20, z0, X1 - 20, Z1, y1 - 10, y1, 14);
        for (const x of [X0 + 20, X1 - 34]) a.box(x, y0, z0, x + 14, y1, Z1); a.box(X0 + 20, y0, Z1 - 14, X1 - 20, y1, Z1);
        for (const x of [X0 + 36, X1 - 38]) a.box(x, y0 + 8, z0 + 14, x + 3, y1 - 8, Z1 - 16);
        a.box(X0 + 34, y0 + 2, z0 + 14, X1 - 34, y0 + 7, Z1 - 16);
        a.cyl(cx, (y0 + y1) / 2, z0, z0 + 22, 6, 8); a.cyl(cx, (y0 + y1) / 2, z0 + 22, z0 + 26, 44, 16); a.rect(X0 + 20, y0, X1 - 20, y1, 'EQUIP-DETAIL'); a.circ(cx, (y0 + y1) / 2, 44, 'EQUIP-DETAIL');
        return a.log('Added the housing with display panel and keys, the glass draft shield with frame, roof and pan inside, and four feet (plan and 3D).');
      }
      a.box(X0 + 10, YF + 10, Z0 + 14, X1 - 10, -10, Z0 + 30); a.box(X0, YF, Z0, X1, 0, Z0 + 14); a.rect(X0, YF, X1, 0);
      const px = X0 + W * 0.3, bz = Z0 + 120; a.box(px - 18, cy - 20, Z0 + 30, px + 18, cy + 20, bz + 50); a.box(px - 24, cy - 26, bz + 20, px + 24, cy + 26, bz + 62);
      for (let i = 0; i < 3; i++) { const z = bz + 4 + i * 18 + 0, L = X1 - 20 - px; a.box(px + 20, cy - 8, z, px + 20 + L, cy + 8, z + 8); a.box(px + 20 + L * (0.3 + i * 0.2), cy - 12, z - 4, px + 20 + L * (0.3 + i * 0.2) + 14, cy + 12, z + 16); for (let k = 1; k < 9; k++) a.line(px + 20 + (L * k) / 9, cy - 8, px + 20 + (L * k) / 9, cy + 8, 'EQUIP-DETAIL'); }
      a.box(X1 - 26, cy - 6, bz - 12, X1 - 20, cy + 6, bz + 56);
      a.tube([[px - 20, cy, bz + 20], [X0 + W * 0.12, cy, bz - 20], [X0 + W * 0.12, cy, Z0 + 56]], [6, 6, 6], 8); a.cyl(X0 + W * 0.12, cy, Z0 + 56, Z0 + 62, 62, 20); a.circ(X0 + W * 0.12, cy, 62);
      a.log('Added the base, pillar, three graduated beams with sliding weights, the pointer and the pan on its arm (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic hot plate and stirrer',
    desc: (v) => v.rod ? 'Square ceramic-top hot plate with a stirrer function: a housing with front dial and indicator light, four feet, and a vertical support rod with a boss head and a clamp ring.' : 'Round-top hot plate: a rectangular housing, a round metal top plate on a rim, two front dials, an indicator light and four feet.',
    vs: [['round top, 7 in', 7, 7, 3.6, 0, {}], ['square top with support rod, 10 in', 10, 10, 16, 0, { rod: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W } = a, bh = v.rod ? 95 : 80;
      a.outline('EQUIP-DETAIL'); const bx1 = v.rod ? X1 - 70 : X1;
      a.box(X0, YF, Z0 + 10, bx1, 0, Z0 + bh); for (const [x, y] of [[X0 + 16, YF + 16], [bx1 - 16, YF + 16], [X0 + 16, -16], [bx1 - 16, -16]]) a.cyl(x, y, Z0, Z0 + 11, 9, 8);
      const tx = (X0 + bx1) / 2;
      if (v.rod) { a.box(X0 + 14, YF + 14, Z0 + bh, bx1 - 14, -14, Z0 + bh + 8); a.rect(X0 + 14, YF + 14, bx1 - 14, -14, 'EQUIP-DETAIL'); }
      else { a.cyl(tx, cy, Z0 + bh, Z0 + bh + 8, W * 0.4, 28); a.cyl(tx, cy, Z0 + bh - 6, Z0 + bh, W * 0.42, 28); a.circ(tx, cy, W * 0.4); }
      for (const s of [-1, 1]) { const x = tx + s * 50; a.ycyl(YF - 0.1 + 0, YF + 14, x, Z0 + bh * 0.45, 17, 14); a.circ(x, YF + 8, 17, 'EQUIP-DETAIL'); }
      a.cyl(tx + (v.rod ? 0 : 0), YF + 20, Z0 + bh * 0.8, Z0 + bh * 0.8 + 0.1, 5, 6); a.ycyl(YF, YF + 6, tx, Z0 + bh * 0.78, 5, 8);
      if (v.rod) { const rx = X1 - 40; a.cyl(rx, -80, Z0 + 10, Z1 - 20, 7, 10); a.cyl(rx, -80, Z0 + 10, Z0 + 20, 30, 12); a.circ(rx, -80, 30, 'EQUIP-DETAIL'); a.box(rx - 14, -94, Z0 + 230, rx + 14, -66, Z0 + 262); a.xcyl(X0 + 40, rx, -80, Z0 + 246, 5, 8); ring(a, X0 + 140, -80, Z0 + 246, 60, 4, 18, 6); }
      a.log('Added the housing, ' + (v.rod ? 'ceramic top, dials, support rod with boss and clamp ring' : 'round top plate, dials and light') + ' and feet (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic school bench centrifuge',
    desc: (v) => `Benchtop centrifuge for ${v.slots} tubes: a housing with a sloped front, a lid with a round viewing window and a front latch, a front display with three keys and a dial, vent slots on the sides and four feet.`,
    vs: [['8 place, 12 in wide', 12, 14, 9, 0, { slots: 8 }], ['16 place, 16 in wide', 16, 18, 11, 0, { slots: 16 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W, D, H } = a, lz = Z0 + H * 0.52;
      a.outline('EQUIP-DETAIL');
      prismX(a, [[YF, Z0 + 10], [YF, lz], [-8, lz], [-8, Z0 + 10]], X0, X1);
      prismX(a, [[YF + 12, lz], [-8, lz], [-8, Z1 - 12], [-D * 0.1, Z1], [YF + D * 0.22, Z1], [YF + 12, lz + (Z1 - lz) * 0.8]], X0 + 6, X1 - 6);
      for (const [x, y] of [[X0 + 22, YF + 22], [X1 - 22, YF + 22], [X0 + 22, -22], [X1 - 22, -22]]) a.cyl(x, y, Z0, Z0 + 11, 11, 8);
      a.box(cx - W * 0.28, YF - 0.1, Z0 + H * 0.12, cx + W * 0.28, YF + 6, lz - 14); for (let i = -1; i <= 1; i++) a.box(cx + i * W * 0.1 - 9, YF + 6, Z0 + H * 0.2, cx + i * W * 0.1 + 9, YF + 12, Z0 + H * 0.2 + 12);
      a.ycyl(YF + 6, YF + 20, cx + W * 0.36, Z0 + H * 0.26, 14, 12); a.box(cx - 25, YF + 8, lz + 6, cx + 25, YF + 26, lz + 24);
      const wr = D * 0.28; a.cyl(cx, cy - D * 0.02 + 0, Z1 - 1.4, Z1, wr, 24); a.circ(cx, cy, wr, 'EQUIP-DETAIL'); for (let i = 0; i < v.slots; i++) { const t = (2 * PI * i) / v.slots; a.circ(cx + m.cos(t) * wr * 0.55, cy + m.sin(t) * wr * 0.55, 6, 'EQUIP-HIDDEN'); }
      for (const s of [0, 1]) for (let k = 0; k < 5; k++) { const x = s ? X1 - 6 : X0 + 6; a.box(x - 1, -D * 0.3 - k * 20, Z0 + H * 0.2, x + 1, -D * 0.3 - k * 20 - 8, Z0 + H * 0.4); }
      a.rect(X0 + 6, YF + 12, X1 - 6, -8, 'EQUIP-DETAIL'); a.log('Added the housing, lid with viewing window and latch, display and keys, dial, side vents and feet (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic glassware drying rack',
    desc: (v) => `Wall-mounted drying rack: a back panel, a frame, ${v.cols * v.rows} angled pegs in ${v.rows} rows of ${v.cols} for inverted glassware and a sloped drip tray at the base with a drain spout.`,
    vs: [['24 x 18 in, 24 pegs', 24, 4, 18, 36, { cols: 6, rows: 4 }], ['36 x 24 in, 45 pegs', 36, 4, 24, 36, { cols: 9, rows: 5 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx } = a, tray = 70;
      a.outline('EQUIP-DETAIL'); a.box(X0, -14, Z0, X1, 0, Z1); a.frame(X0, Z0, X1, Z1, -22, -14, 16);
      const cw = (a.W - 80) / v.cols, rh = (a.H - tray - 80) / v.rows;
      for (let r = 0; r < v.rows; r++) for (let c = 0; c < v.cols; c++) { const x = X0 + 40 + (c + 0.5) * cw, z = Z0 + tray + 50 + (r + 0.5) * rh; a.tube([[x, -14, z], [x, YF + 8, z + 38]], [5, 4], 6); a.circ(x, YF + 8, 4, 'EQUIP-DETAIL'); }
      prismX(a, [[-14, Z0 + 8], [YF, Z0 + 24], [YF, Z0 + tray - 10], [YF + 8, Z0 + tray - 10], [YF + 8, Z0 + 32], [-14, Z0 + 14]], X0 + 10, X1 - 10);
      a.box(X0 + 10, YF, Z0 + 20, X0 + 18, -14, Z0 + tray); a.box(X1 - 18, YF, Z0 + 20, X1 - 10, -14, Z0 + tray); a.xcyl(X1 - 60, X1 - 10, YF + 10, Z0 + 18, 8, 8);
      a.rect(X0 + 10, YF, X1 - 10, -14, 'EQUIP-DETAIL'); a.log('Added the back panel and frame, angled pegs, the sloped drip tray and its spout (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic dissection tray with pad',
    desc: (v) => `Shallow metal tray ${v.w} in long with a raised rim, a flat wax pad filling the floor, ${v.pins} pins pushed into the pad and a pair of end handles.`,
    vs: [['10 x 7 in', 10, 7, 1.8, 0, { pins: 6 }], ['14 x 10 in', 14, 10, 2.2, 0, { pins: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy } = a, hn = 22, t = 6;
      a.outline(); a.box(X0 + hn, YF, Z0, X1 - hn, 0, Z0 + 4); a.box(X0 + hn, YF, Z0, X1 - hn, YF + t, Z1 - 8); a.box(X0 + hn, -t, Z0, X1 - hn, 0, Z1 - 8); a.box(X0 + hn, YF, Z0, X0 + hn + t, 0, Z1 - 8); a.box(X1 - hn - t, YF, Z0, X1 - hn, 0, Z1 - 8);
      a.box(X0 + hn, YF, Z1 - 8, X1 - hn, YF + 11, Z1 - 2); a.box(X0 + hn, -11, Z1 - 8, X1 - hn, 0, Z1 - 2); a.box(X0 + hn, YF, Z1 - 8, X0 + hn + 11, 0, Z1 - 2); a.box(X1 - hn - 11, YF, Z1 - 8, X1 - hn, 0, Z1 - 2);
      a.box(X0 + hn + t + 1, YF + t + 1, Z0 + 4, X1 - hn - t - 1, -t - 1, Z0 + (Z1 - Z0) * 0.55); a.rect(X0 + hn + t, YF + t, X1 - hn - t, -t, 'EQUIP-DETAIL');
      for (const s of [-1, 1]) { const x = s < 0 ? X0 : X1 - hn; a.box(x + (s < 0 ? 0 : 0), cy - 30, Z1 - 12, x + hn, cy + 30, Z1 - 6); }
      for (let i = 0; i < v.pins; i++) { const x = X0 + hn + 60 + ((a.W - 2 * hn - 120) * (i % (v.pins / 2))) / (v.pins / 2 - 1 || 1), y = i < v.pins / 2 ? YF + 40 : -40; a.cyl(x, y, Z0 + (Z1 - Z0) * 0.55, Z1 - 4, 1.6, 6); a.cyl(x, y, Z1 - 5, Z1 - 3, 4.5, 8); a.circ(x, y, 3, 'EQUIP-DETAIL'); }
      a.log('Added the tray floor and rim, the wax pad, pins and end handles (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic corrosive chemicals storage cabinet',
    desc: (v) => `${v.doors === 2 ? 'Two-door' : 'One-door'} storage cabinet for bottled chemicals, ${v.w} in wide: a body set between two side vent bungs, a spill sill, doors with a bar handle and lock, an identification plate and ${v.legs ? 'four adjustable feet' : 'a plinth'}.`,
    vs: [['under-bench, 36 in, two doors', 36, 22, 34, 0, { doors: 2, legs: false }], ['tall narrow, 24 in, one door', 24, 18, 72, 0, { doors: 1, legs: true }], ['wide, 48 in, two doors', 48, 24, 66, 0, { doors: 2, legs: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx } = a, ins = 28;
      cab(a, { doors: v.doors, toe: v.legs ? 0 : 70, legs: v.legs ? 90 : 0, pull: 'bar', lock: true, inset: ins });
      for (const s of [-1, 1]) { const x = s < 0 ? X0 : X1 - ins; a.xcyl(x, x + ins, YF + 120, Z1 - 130, 20, 12); a.circ(s < 0 ? X0 + ins / 2 : X1 - ins / 2, YF + 120, 14, 'EQUIP-DETAIL'); }
      a.box(X0 + ins + 8, YF + 30, Z1 - 120, X1 - ins - 8, YF + 36, Z1 - 70); a.box(cx - 60, YF + 20, Z1 - 24, cx + 60, YF + 38, Z1 - 4);
      a.log('Added the body, doors with handle and lock, side vent bungs, sill, identification plate' + (v.legs ? ' and adjustable feet' : ' and plinth') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic reagent bottle',
    desc: (v) => v.drop ? 'Dropper bottle: a round body with a shoulder and neck, a screw collar and a rubber bulb on top, and a wrap-around label.' : `Narrow-mouth reagent bottle, ${v.ml} mL class: a round body, a sloped shoulder, a neck, a ribbed screw cap and a half-wrap label.`,
    vs: [['dropper, 60 mL', 1.7, 1.7, 5.2, 0, { drop: true }], ['250 mL', 2.6, 2.6, 6.4, 0, { ml: 250 }], ['1000 mL', 4, 4, 9.6, 0, { ml: 1000 }]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W, H } = a, r = W / 2 - 1.5, bh = v.drop ? H * 0.62 : H * 0.7, nr = r * (v.drop ? 0.42 : 0.38);
      lathe(a, cx, cy, Z0, [[0, 0], [r * 0.7, 0], [r, 3], [r, bh], [r * 0.7, bh + H * 0.08], [nr, bh + H * 0.14], [nr, bh + H * 0.2], [0, bh + H * 0.2]], 26);
      lathe(a, cx, cy, Z0, [[r + 0.8, H * 0.1], [r + 0.8, bh * 0.82]], 24, -PI * 0.95, -PI * 0.05, false);
      const cz = Z0 + bh + H * 0.14;
      if (v.drop) { a.cone(cx, cy, cz, Z0 + H * 0.78, nr * 1.3, nr * 1.15, 14); a.ell(cx, cy, Z0 + H * 0.86, nr * 1.1, nr * 1.1, H * 0.14, 12, 8); }
      else { a.cyl(cx, cy, cz, Z1, nr * 1.3, 18); for (let i = 0; i < 16; i++) { const t = (2 * PI * i) / 16; a.box(cx + m.cos(t) * nr * 1.3 - 0.7, cy + m.sin(t) * nr * 1.3 - 0.7, cz + 2, cx + m.cos(t) * nr * 1.3 + 0.7, cy + m.sin(t) * nr * 1.3 + 0.7, Z1 - 2); } }
      a.circ(cx, cy, r); a.circ(cx, cy, nr * 1.3, 'EQUIP-DETAIL'); a.log('Added the bottle body with shoulder and neck, ' + (v.drop ? 'the dropper collar and bulb' : 'the ribbed screw cap') + ' and the label (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic laboratory safety wall station',
    desc: (v) => `Wall-mounted safety station on a back panel: a fire blanket case with two pull tapes, a fire extinguisher on a bracket with a strap, a hose and a handle${v.aid ? ', and a first aid box with a raised white cross' : ''}.`,
    vs: [['fire blanket and extinguisher, 24 in', 24, 8, 30, 36, {}], ['with first aid box, 36 in', 36, 8, 30, 36, { aid: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, W } = a;
      a.outline('EQUIP-DETAIL'); a.box(X0, -12, Z0, X1, 0, Z1); a.rect(X0, -12, X1, 0);
      const bx = X0 + 130, ex = v.aid ? cx : X1 - 150, ax = X1 - 130;
      a.box(bx - 110, -80, Z1 - 420, bx + 110, -12, Z1 - 120); a.box(bx - 110, -86, Z1 - 440, bx + 110, -80, Z1 - 400); for (const s of [-1, 1]) a.box(bx + s * 50 - 8, -96, Z1 - 520, bx + s * 50 + 8, -86, Z1 - 380 - 0);
      a.box(bx - 90, -84, Z1 - 330, bx + 90, -80, Z1 - 270);
      a.cyl(ex, -75, Z0 + 20, Z0 + 440, 55, 18); a.cone(ex, -75, Z0 + 440, Z0 + 500, 55, 18, 18); a.cyl(ex, -75, Z0 + 500, Z0 + 540, 20, 12); a.box(ex - 50, -95, Z0 + 520, ex + 6, -55, Z0 + 545); a.box(ex - 5, -95, Z0 + 495, ex + 45, -55, Z0 + 510);
      a.tube([[ex + 15, -55, Z0 + 520], [ex + 70, -45, Z0 + 420], [ex + 55, -95, Z0 + 250]], [5, 5, 6], 6);
      for (const z of [Z0 + 130, Z0 + 370]) a.box(ex - 62, -12, z, ex + 62, -82, z + 14);
      a.circ(ex, -75, 55, 'EQUIP-DETAIL');
      if (v.aid) { a.box(ax - 120, -70, Z1 - 330, ax + 120, -12, Z1 - 120); a.box(ax - 20, -74, Z1 - 290, ax + 20, -70, Z1 - 160); a.box(ax - 60, -74, Z1 - 240, ax + 60, -70, Z1 - 210); a.box(ax - 8, -30, Z1 - 120, ax + 8, -12, Z1 - 100); }
      a.log('Added the back panel, the fire blanket case with tapes, the extinguisher with bracket, straps and hose' + (v.aid ? ' and the first aid box' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic optical bench with carriers',
    desc: (v) => `Physics optical bench, ${v.len} in rail on two end feet, with ${v.carr.length} sliding carriers on the rail (${v.carr.join(', ')}), each on a post, and tick marks along the rail in plan.`,
    vs: [['24 in rail, lamp, lens and screen', 26, 6, 11, 0, { len: 24, carr: ['lamp', 'lens', 'screen'] }], ['40 in rail, lamp, two lenses and screen', 42, 6, 11, 0, { len: 40, carr: ['lamp', 'lens', 'lens', 'screen'] }], ['60 in rail, lamp, slit, two lenses and screen', 62, 6, 11, 0, { len: 60, carr: ['lamp', 'slit', 'lens', 'lens', 'screen'] }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy } = a, rz = Z0 + 40, n = v.carr.length;
      a.outline('EQUIP-DETAIL'); a.box(X0 + 20, cy - 22, rz, X1 - 20, cy + 22, rz + 36); a.box(X0 + 20, cy - 5, rz + 36, X1 - 20, cy + 5, rz + 42);
      for (const x of [X0 + 60, X1 - 60]) { a.box(x - 25, YF + 20, Z0, x + 25, -20, 40); a.box(x - 10, cy - 24, 38, x + 10, cy + 24, rz + 2); }
      const L = X1 - X0 - 120;
      for (let k = 0; k <= 12; k++) a.line(X0 + 60 + (L * k) / 12, cy - 22, X0 + 60 + (L * k) / 12, cy - 12, 'EQUIP-DETAIL');
      v.carr.forEach((c, i) => {
        const x = X0 + 110 + ((X1 - X0 - 220) * i) / (n - 1);
        a.box(x - 24, cy - 30, rz + 12, x + 24, cy + 30, rz + 40);
        if (c === 'lamp') { a.box(x - 36, cy - 36, rz + 40, x + 36, cy + 36, rz + 130); a.cyl(x, cy, rz + 130, rz + 160, 14, 10); a.xcyl(x + 36, x + 50, cy, rz + 85, 24, 12); }
        else if (c === 'screen') { a.cyl(x, cy, rz + 40, rz + 120, 6, 8); a.box(x - 60, cy - 3, rz + 100, x + 60, cy + 3, rz + 230); a.box(x - 66, cy - 6, rz + 96, x + 66, cy + 6, rz + 104); }
        else if (c === 'slit') { a.cyl(x, cy, rz + 40, rz + 120, 6, 8); a.box(x - 45, cy - 3, rz + 120, x + 45, cy + 3, rz + 180); a.box(x - 5, cy - 4, rz + 125, x + 5, cy + 4, rz + 175); }
        else { a.cyl(x, cy, rz + 40, rz + 130, 6, 8); const zc = rz + 175; a.xcyl(x - 4, x + 4, cy, zc, 42, 20); ring(a, x, cy, zc, 0, 1, 3, 3); const pts = []; for (let j = 0; j <= 20; j++) { const t = (2 * PI * j) / 20; pts.push([x, cy + 48 * m.cos(t), zc + 48 * m.sin(t)]); } a.tube(pts, pts.map(() => 4), 6); }
        a.circ(x, cy, 6, 'EQUIP-DETAIL'); a.rect(x - 24, cy - 30, x + 24, cy + 30, 'EQUIP-DETAIL');
      });
      a.log('Added the rail with its scale bar and end feet, and the sliding carriers with their posts and fittings (plan and 3D).');
    } }),
];


// ------------------------------------------------------------------------------------------ models
/** a wedge-cut spherical shell between radii Ro and Ri, swept from angle a0 to a1 about the vertical axis */
function shell(a, cx, cy, zc, Ro, Ri, a0, a1, nu = 24, nv = 12) {
  const P = (r, u, v) => { const ph = (PI * v) / nv, th = a0 + ((a1 - a0) * u) / nu; return [cx + r * m.sin(ph) * m.cos(th), cy + r * m.sin(ph) * m.sin(th), zc - r * m.cos(ph)]; };
  for (let v = 0; v < nv; v++) for (let u = 0; u < nu; u++) {
    a.t.push([P(Ro, u, v), P(Ro, u + 1, v), P(Ro, u + 1, v + 1)], [P(Ro, u, v), P(Ro, u + 1, v + 1), P(Ro, u, v + 1)]);
    if (Ri > 1) a.t.push([P(Ri, u, v), P(Ri, u + 1, v + 1), P(Ri, u + 1, v)], [P(Ri, u, v), P(Ri, u, v + 1), P(Ri, u + 1, v + 1)]);
  }
  for (let v = 0; v < nv; v++) {
    a.t.push([P(Ro, 0, v), P(Ro, 0, v + 1), P(Ri, 0, v + 1)], [P(Ro, 0, v), P(Ri, 0, v + 1), P(Ri, 0, v)]);
    a.t.push([P(Ro, nu, v), P(Ri, nu, v + 1), P(Ro, nu, v + 1)], [P(Ro, nu, v), P(Ri, nu, v), P(Ri, nu, v + 1)]);
  }
  return a;
}
/** a convex solid from vertices and faces (index lists), every face turned outward */
function solid(a, V, F) {
  const c = [0, 1, 2].map((k) => V.reduce((s, p) => s + p[k], 0) / V.length);
  for (const f of F) {
    let ids = f; const [p, q, r] = [V[f[0]], V[f[1]], V[f[2]]];
    const u = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], w = [r[0] - p[0], r[1] - p[1], r[2] - p[2]], n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    if (n[0] * (p[0] - c[0]) + n[1] * (p[1] - c[1]) + n[2] * (p[2] - c[2]) < 0) ids = [...f].reverse();
    for (let i = 1; i < ids.length - 1; i++) a.t.push([V[ids[0]], V[ids[i]], V[ids[i + 1]]]);
  }
  return a;
}
const rod = (a, p, q, r, seg = 8) => a.tube([p, q], [r, r], seg);

const models = [
  fam({ cat: 'educational/models', title: 'Generic earth layers cutaway model',
    desc: (v) => `${v.dia} in earth model on a ring cradle: a crust and mantle shell cut away in a quarter wedge to show the stepped outer core shell and a full inner core sphere, held on three posts above a round foot.`,
    vs: [['8 in ball', 8, 8, 8.9, 0, { dia: 8 }], ['12 in ball', 12, 12, 12.9, 0, { dia: 12 }], ['16 in ball', 16, 16, 16.9, 0, { dia: 16 }]],
    build: (a, v) => {
      const { cx, cy, Z0 } = a, R = v.dia * IN / 2, fh = 14, zc = Z0 + fh + 10 + R, a0 = PI * 0.0, a1 = PI * 1.5, st = 14;
      lathe(a, cx, cy, Z0, [[R * 0.8, 0], [R * 0.8, fh * 0.6], [R * 0.6, fh]], 28); a.circ(cx, cy, R * 0.8);
      const rr = R * 0.64, rz = zc - R * 0.766; ring(a, cx, cy, rz, rr, 5, 28, 6); a.circ(cx, cy, rr, 'EQUIP-DETAIL');
      for (let i = 0; i < 3; i++) { const t = (2 * PI * i) / 3 + 0.5; a.tube([[cx + m.cos(t) * R * 0.6, cy + m.sin(t) * R * 0.6, Z0 + fh * 0.8], [cx + m.cos(t) * rr, cy + m.sin(t) * rr, rz]], [6, 5], 8); }
      shell(a, cx, cy, zc, R, R * 0.95, a0, a1, 30, 14); shell(a, cx, cy, zc, R * 0.95, R * 0.56, a0, a1, 30, 14); shell(a, cx, cy, zc, R * 0.56, R * 0.3, a0, a1, 24, 12); sph(a, cx, cy, zc, R * 0.3, 16, 9);
      a.circ(cx, cy, R); a.circ(cx, cy, R * 0.56, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.3, 'EQUIP-DETAIL'); a.line(cx, cy, cx + R, cy, 'EQUIP-DETAIL'); a.line(cx, cy, cx, cy - R, 'EQUIP-DETAIL');
      a.log('Added the round foot, three posts and ring cradle, the wedge-cut crust, mantle and outer core shells and the inner core sphere (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic atom model with orbit rings',
    desc: (v) => `${v.name} atom model: a nucleus of ${v.nuc} touching spheres, ${v.sh.length} tilted orbit ring${v.sh.length > 1 ? 's' : ''} each carried on a radial rod, ${v.sh.reduce((s, x) => s + x, 0)} electron sphere${v.sh.reduce((s, x) => s + x, 0) > 1 ? 's' : ''} on the rings and a round foot with a stem.`,
    vs: [['hydrogen, 1 ring', 8, 8, 10.2, 0, { name: 'Hydrogen', nuc: 1, sh: [1] }], ['helium, 1 ring', 8, 8, 10.2, 0, { name: 'Helium', nuc: 4, sh: [2] }], ['carbon, 2 rings', 10, 10, 12.2, 0, { name: 'Carbon', nuc: 12, sh: [2, 4] }], ['sodium, 3 rings', 14, 14, 16.2, 0, { name: 'Sodium', nuc: 23, sh: [2, 8, 1] }]],
    build: (a, v) => {
      const { cx, cy, Z0, W } = a, Rm = W / 2 - 8, zc = Z0 + 60 + Rm, k = v.sh.length, pr = Rm * (v.nuc > 1 ? 0.13 : 0.16);
      lathe(a, cx, cy, Z0, [[W * 0.3, 0], [W * 0.3, 10], [W * 0.18, 24], [8, 40]], 24); a.circ(cx, cy, W * 0.3); a.cyl(cx, cy, Z0 + 30, zc - pr * 1.3, 6, 10);
      const nr = v.nuc > 1 ? pr * 1.05 * m.cbrt(v.nuc) * 0.75 : 0;
      for (let i = 0; i < v.nuc; i++) { if (v.nuc === 1) { sph(a, cx, cy, zc, pr, 14, 8); break; } const zz = 1 - (2 * (i + 0.5)) / v.nuc, rr = m.sqrt(1 - zz * zz), t = i * 2.399963; sph(a, cx + m.cos(t) * rr * nr, cy + m.sin(t) * rr * nr, zc + zz * nr, pr * 0.75, 8, 5); }
      for (let s = 0; s < k; s++) {
        const R = Rm * (k === 1 ? 0.9 : 0.42 + (0.58 * s) / (k - 1)), psi = [0, 1.05, -1.05][s % 3] * (s === 0 ? 0.5 : 1), P = (t) => [cx + R * m.cos(t), cy + R * m.sin(t) * m.cos(psi), zc + R * m.sin(t) * m.sin(psi)];
        const pts = []; for (let i = 0; i <= 36; i++) pts.push(P((2 * PI * i) / 36)); a.tube(pts, pts.map(() => 2.6), 5);
        const q = P(PI * (s % 2 ? 0.5 : 1.5)); rod(a, [cx, cy, zc], q, 2.6, 6);
        for (let e = 0; e < v.sh[s]; e++) { const t = (2 * PI * e) / v.sh[s] + 0.3 + s, p = P(t); sph(a, p[0], p[1], p[2], pr * 0.6, 10, 6); a.circ(p[0], p[1], pr * 0.6, 'EQUIP-DETAIL'); }
        a.ellp(cx, cy, R, R * m.abs(m.cos(psi)) + 0.01, 'EQUIP-DETAIL');
      }
      a.circ(cx, cy, pr * 1.2); a.log('Added the foot and stem, the nucleus spheres, tilted orbit rings on radial rods and the electron spheres (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic crystal lattice unit cell model',
    desc: (v) => `${v.name} unit cell: ${v.n} atom spheres joined by round bonds along the cube edges${v.extra}, on a stem and a round foot.`,
    vs: [['simple cubic', 7, 7, 8.2, 0, { name: 'Simple cubic', kind: 'sc', n: 8, extra: '' }], ['body-centred cubic', 7, 7, 8.2, 0, { name: 'Body-centred cubic', kind: 'bcc', n: 9, extra: ' and from the centre atom to each corner' }], ['face-centred cubic', 7, 7, 8.2, 0, { name: 'Face-centred cubic', kind: 'fcc', n: 14, extra: ' and from each face-centre atom to the corners of its face' }], ['diamond cubic', 7, 7, 8.2, 0, { name: 'Diamond cubic', kind: 'dia', n: 18, extra: ', the face-centre atoms and four inner atoms each bonded to four neighbours' }]],
    build: (a, v) => {
      const { cx, cy, Z0, W } = a, ed = W * 0.58, r = ed * 0.1, z0 = Z0 + 55 + r, ox = cx - ed / 2, oy = cy - ed / 2;
      lathe(a, cx, cy, Z0, [[W * 0.32, 0], [W * 0.32, 10], [W * 0.2, 22], [8, 36]], 24); a.circ(cx, cy, W * 0.32);
      const Pt = ([x, y, zz]) => [ox + x * ed, oy + y * ed, z0 + zz * ed], atoms = [], bonds = [];
      const corners = []; for (const x of [0, 1]) for (const y of [0, 1]) for (const zz of [0, 1]) corners.push([x, y, zz]);
      atoms.push(...corners);
      for (const c of corners) for (const d of corners) { const df = c.reduce((s, x, i) => s + (x !== d[i] ? 1 : 0), 0); if (df === 1 && c < d) bonds.push([c, d]); }
      if (v.kind === 'bcc') { atoms.push([0.5, 0.5, 0.5]); for (const c of corners) bonds.push([c, [0.5, 0.5, 0.5]]); }
      const faces = [[0.5, 0.5, 0], [0.5, 0.5, 1], [0.5, 0, 0.5], [0.5, 1, 0.5], [0, 0.5, 0.5], [1, 0.5, 0.5]];
      if (v.kind === 'fcc' || v.kind === 'dia') { atoms.push(...faces); for (const f of faces) for (const c of corners) { const d = m.hypot(f[0] - c[0], f[1] - c[1], f[2] - c[2]); if (d < 0.72) bonds.push([c, f]); } }
      if (v.kind === 'dia') { const inn = [[0.25, 0.25, 0.25], [0.75, 0.75, 0.25], [0.75, 0.25, 0.75], [0.25, 0.75, 0.75]]; const sites = [...corners, ...faces]; for (const p of inn) { atoms.push(p); for (const q of sites) if (m.abs(m.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) - m.sqrt(3) / 4) < 0.01) bonds.push([p, q]); } }
      if (v.kind === 'sc' || v.kind === 'bcc') { rod(a, Pt([0, 0, 0]), Pt([1, 1, 0]), 2.2, 6); rod(a, Pt([1, 0, 0]), Pt([0, 1, 0]), 2.2, 6); }
      rod(a, [cx, cy, Z0 + 30], [cx, cy, z0 - 2], 5, 8);
      for (const [p, q] of bonds) { const A = Pt(p), B = Pt(q); rod(a, A, B, 2.4, 6); a.line(A[0], A[1], B[0], B[1], 'EQUIP-DETAIL'); }
      for (const p of atoms) { const A = Pt(p); sph(a, A[0], A[1], A[2], r * (p.every((x) => x === 0 || x === 1) ? 1 : 0.85), 10, 6); a.circ(A[0], A[1], r, 'EQUIP-DETAIL'); }
      a.log('Added the foot and stem, ' + v.n + ' atom spheres and the bonds of the ' + v.name.toLowerCase() + ' cell (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic momentum ball cradle',
    desc: (v) => `Desk cradle with ${v.n} steel-look balls, each hung by two V strings from a pair of top rails, between four posts on a base plate with feet; the end ball is lifted aside on its strings.`,
    vs: [['3 ball', 8, 5, 7, 0, { n: 3 }], ['5 ball', 9.5, 5.5, 7.5, 0, { n: 5 }], ['7 ball', 11.5, 5.5, 7.5, 0, { n: 7 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy } = a, br = 19, zr = Z1 - 12, zb = Z0 + 14 + 40 + br, dy = a.D / 2 - 30, L = zr - zb;
      a.outline('EQUIP-DETAIL'); a.box(X0 + 4, YF + 4, Z0 + 8, X1 - 4, -4, Z0 + 22); for (const [x, y] of [[X0 + 24, YF + 24], [X1 - 24, YF + 24], [X0 + 24, -24], [X1 - 24, -24]]) a.cyl(x, y, Z0, Z0 + 9, 11, 8);
      for (const x of [X0 + 22, X1 - 22]) for (const y of [cy - dy, cy + dy]) { a.tube([[x, y, Z0 + 22], [x, y, zr]], [6, 6], 8); a.circ(x, y, 6, 'EQUIP-HIDDEN'); }
      for (const y of [cy - dy, cy + dy]) a.tube([[X0 + 22, y, zr], [X1 - 22, y, zr]], [3.4, 3.4], 8);
      const x0 = cx - ((v.n - 1) * (2 * br + 0.6)) / 2, th = 0.55;
      for (let i = 0; i < v.n; i++) {
        const px = x0 + i * (2 * br + 0.6); let bx = px, bz = zb; if (i === 0) { bx = px - L * m.sin(th); bz = zr - L * m.cos(th); }
        for (const y of [cy - dy, cy + dy]) a.tube([[px, y, zr], [bx, cy, bz + br * 0.9]], [0.9, 0.9], 4);
        sph(a, bx, cy, bz, br, 14, 8); a.circ(bx, cy, br, 'EQUIP-DETAIL');
      }
      a.line(X0 + 22, cy - dy, X1 - 22, cy - dy, 'EQUIP-DETAIL'); a.line(X0 + 22, cy + dy, X1 - 22, cy + dy, 'EQUIP-DETAIL');
      a.log('Added the base plate with feet, four posts, two top rails, ' + v.n + ' balls on V strings with one lifted aside (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic bead counting frame',
    desc: (v) => `Counting frame with ${v.rows} horizontal rods of 10 beads, some slid to the left and some to the right, in a wooden frame${v.div ? ' with a vertical divider bar' : ''}, on two floor feet.`,
    vs: [['10 rods, 18 in', 18, 6, 14, 0, { rows: 10 }], ['5 rods, 12 in', 12, 6, 8, 0, { rows: 5 }], ['10 rods with divider, 24 in', 24, 6, 18, 0, { rows: 10, div: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy } = a, fw = 22, fz0 = Z0 + 26, ix0 = X0 + fw, ix1 = X1 - fw, iz0 = fz0 + fw, iz1 = Z1 - fw, sp = (iz1 - iz0) / (v.rows + 0.5), br = m.min(sp * 0.42, (ix1 - ix0) / 24);
      a.outline('EQUIP-DETAIL'); for (const [x0, x1] of [[X0, X0 + fw + 6], [X1 - fw - 6, X1]]) { a.box(x0, cy - 20, fz0, x1, cy + 20, Z1); a.box(x0 - 4, YF + 6, Z0, x1 + 4, -6, Z0 + 26); }
      a.box(X0, cy - 20, Z1 - fw, X1, cy + 20, Z1); a.box(X0, cy - 20, fz0, X1, cy + 20, fz0 + fw);
      if (v.div) a.box(cx - 8, cy - 18, iz0, cx + 8, cy + 18, iz1);
      for (let r = 0; r < v.rows; r++) {
        const z = iz0 + (r + 0.75) * sp, left = (r * 3 + 2) % 11; a.xcyl(ix0, ix1, cy, z, 2.4, 6);
        for (let b = 0; b < 10; b++) { const x = b < left ? ix0 + br * (1 + 2 * b) + 2 : ix1 - br * (1 + 2 * (9 - b)) - 2; a.ell(x, cy, z, br, br, br, 6, 4); }
        a.line(ix0, cy, ix1, cy, 'EQUIP-DETAIL');
      }
      a.rect(X0, cy - 20, X1, cy + 20, 'EQUIP'); a.rect(X0 - 4, YF + 6, X0 + fw + 10, -6, 'EQUIP-HIDDEN'); a.rect(X1 - fw - 10, YF + 6, X1 + 4, -6, 'EQUIP-HIDDEN');
      a.log('Added the frame, floor feet, ' + v.rows + ' rods with their beads' + (v.div ? ' and the divider bar' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic place value block',
    desc: (v) => ({ unit: 'Single place value cube, 20 mm on each side, with a small chamfer.', rod: 'Place value rod: ten unit cubes in a row, drawn as ten blocks joined by a core, with grooves between them.', flat: 'Place value flat: ten rods side by side with grooves between them, 10 by 10 units.', cube: 'Place value cube: ten flats stacked with grooves between them, 10 by 10 by 10 units.' })[v.kind],
    vs: [['unit cube', 0.79, 0.79, 0.79, 0, { kind: 'unit' }], ['ten rod', 7.87, 0.79, 0.79, 0, { kind: 'rod' }], ['hundred flat', 7.87, 7.87, 0.79, 0, { kind: 'flat' }], ['thousand cube', 7.87, 7.87, 7.87, 0, { kind: 'cube' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy } = a, u = 20, g = 1.4, c = 6;
      a.outline();
      if (v.kind === 'unit') { a.box(X0 + 1.5, YF + 1.5, Z0, X1 - 1.5, -1.5, Z1); a.box(X0, YF + 1.5, Z0 + 1.5, X1, -1.5, Z1 - 1.5); a.box(X0 + 1.5, YF, Z0 + 1.5, X1 - 1.5, 0, Z1 - 1.5); }
      else if (v.kind === 'rod') { for (let i = 0; i < 10; i++) { const x0 = X0 + i * u, x1 = x0 + u - g; a.box(x0, YF, Z0, x1, 0, Z1); if (i) a.line(x0 - g / 2, YF, x0 - g / 2, 0, 'EQUIP-DETAIL'); } a.box(X0, YF + c, Z0 + c, X1, -c, Z1 - c); }
      else if (v.kind === 'flat') { for (let i = 0; i < 10; i++) { const x0 = X0 + i * u, x1 = x0 + u - g; a.box(x0, YF, Z0, x1, 0, Z1); if (i) a.line(x0 - g / 2, YF, x0 - g / 2, 0, 'EQUIP-DETAIL'); } a.box(X0, YF + c, Z0 + c * 0.5, X1, -c, Z1 - c * 0.5); for (let j = 1; j < 10; j++) a.line(X0, YF + j * u, X1, YF + j * u, 'EQUIP-DETAIL'); }
      else { for (let i = 0; i < 10; i++) { const z0 = Z0 + i * u, z1 = z0 + u - g; a.box(X0, YF, z0, X1, 0, z1); } a.box(X0 + c, YF + c, Z0, X1 - c, -c, Z1); for (let j = 1; j < 10; j++) { a.line(X0 + j * u, YF, X0 + j * u, 0, 'EQUIP-DETAIL'); a.line(X0, YF + j * u, X1, YF + j * u, 'EQUIP-DETAIL'); } }
      a.log('Added the ' + v.kind + ' with its unit grooves (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic human skull teaching model',
    desc: (v) => `Skull model at ${v.s === 1 ? 'life size' : 'one and a half times life size'}: a cranium, face block with two eye sockets rimmed and a nasal ridge, cheek arches, upper and lower tooth rows, a jaw and a pole stand on a round base.`,
    vs: [['life size', 7, 9, 10, 0, { s: 1 }], ['1.5 times life size', 10.5, 13.5, 15, 0, { s: 1.5 }]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W, D, H } = a, k = W / (7 * IN), Y = (f) => -D * f, zc = Z0 + H * 0.64;
      lathe(a, cx, cy, Z0, [[W * 0.36, 0], [W * 0.36, 12 * k], [W * 0.14, 24 * k], [8 * k, 34 * k]], 24); a.circ(cx, cy, W * 0.36); a.cyl(cx, Y(0.36), Z0 + 30 * k, zc - 55 * k, 7 * k, 10);
      a.ell(cx, Y(0.38), zc + 12 * k, W * 0.36, D * 0.36, H * 0.25, 20, 11);
      a.box(cx - 44 * k, Y(0.8), zc - 85 * k, cx + 44 * k, Y(0.52), zc - 20 * k); a.box(cx - 46 * k, Y(0.74), zc - 20 * k, cx + 46 * k, Y(0.52), zc + 14 * k);
      a.box(cx - 44 * k, Y(0.8), zc - 22 * k, cx + 44 * k, Y(0.74), zc + 18 * k);
      for (const s of [-1, 1]) { const ex = cx + s * 27 * k; const pts = []; for (let i = 0; i <= 14; i++) { const t = (2 * PI * i) / 14; pts.push([ex + 17 * k * m.cos(t), Y(0.82), zc - 8 * k + 15 * k * m.sin(t)]); } a.tube(pts, pts.map(() => 3.5 * k), 5); a.circ(ex, Y(0.82), 16 * k, 'EQUIP-DETAIL'); a.tube([[cx + s * 56 * k, Y(0.7), zc - 30 * k], [cx + s * 64 * k, Y(0.56), zc - 26 * k], [cx + s * 66 * k, Y(0.44), zc - 14 * k]], [5 * k, 5 * k, 5 * k], 6); }
      a.box(cx - 8 * k, Y(0.88), zc - 38 * k, cx + 8 * k, Y(0.8), zc - 4 * k);
      for (let i = 0; i < 12; i++) { const t = -PI * 0.42 + (PI * 0.84 * i) / 11; a.box(cx + m.sin(t) * 38 * k - 3 * k, Y(0.8) - m.cos(t) * 4 * k - 4 * k + 0, zc - 94 * k, cx + m.sin(t) * 38 * k + 3 * k, Y(0.8) + 0, zc - 85 * k); }
      const jaw = []; for (let i = 0; i <= 12; i++) { const t = -PI * 0.5 + (PI * i) / 12; jaw.push([cx + m.sin(t) * 40 * k, Y(0.7) - m.cos(t) * 0 + (1 - m.cos(t * 0.9)) * 0 - (m.cos(t) * 0.0), zc - 104 * k]); }
      const jp = [[cx - 58 * k, Y(0.42), zc - 34 * k], [cx - 56 * k, Y(0.5), zc - 100 * k], [cx - 38 * k, Y(0.72), zc - 108 * k], [cx - 12 * k, Y(0.8), zc - 110 * k], [cx + 12 * k, Y(0.8), zc - 110 * k], [cx + 38 * k, Y(0.72), zc - 108 * k], [cx + 56 * k, Y(0.5), zc - 100 * k], [cx + 58 * k, Y(0.42), zc - 34 * k]];
      a.tube(jp, jp.map(() => 7 * k), 6);
      for (let i = 0; i < 10; i++) { const t = -PI * 0.38 + (PI * 0.76 * i) / 9; a.box(cx + m.sin(t) * 36 * k - 3 * k, Y(0.8) + 2 * k, zc - 100 * k, cx + m.sin(t) * 36 * k + 3 * k, Y(0.8) + 8 * k, zc - 94 * k); }
      a.ellp(cx, Y(0.38), W * 0.36, D * 0.36, 'EQUIP-DETAIL'); a.line(cx - 44 * k, Y(0.8), cx + 44 * k, Y(0.8), 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the base and pole, cranium, face block, rimmed eye sockets, nasal ridge, cheek arches, tooth rows and the jaw (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic relief map model',
    desc: (v) => `${v.what}, on a framed base board: ${v.n} domed hills of different heights built up on the board, with contour rings drawn in plan.`,
    vs: [['mountain range, 18 x 12 in', 18, 12, 6, 0, { n: 9, what: 'Mountain range model with a main ridge line of tall peaks and lower foothills' }], ['island with hills, 18 x 18 in', 18, 18, 6, 0, { n: 8, what: 'Island model with a central peak, a ring of lower hills and a flat coastal shelf' }], ['valley between two ridges, 24 x 12 in', 24, 12, 6, 0, { n: 12, what: 'Valley model with two parallel chains of hills and a flat valley floor between them' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W, D, H } = a, bt = 22;
      a.outline(); a.box(X0, YF, Z0, X1, 0, Z0 + bt); a.box(X0, YF, Z0 + bt, X1, YF + 14, Z0 + bt + 12); a.box(X0, -14, Z0 + bt, X1, 0, Z0 + bt + 12); a.box(X0, YF, Z0 + bt, X0 + 14, 0, Z0 + bt + 12); a.box(X1 - 14, YF, Z0 + bt, X1, 0, Z0 + bt + 12);
      const hill = (x, y, R, h) => { lathe(a, x, y, Z0 + bt, [[R, 0], [R * 0.82, h * 0.28], [R * 0.58, h * 0.62], [R * 0.3, h * 0.9], [0, h]], 14); a.circ(x, y, R, 'EQUIP-DETAIL'); a.circ(x, y, R * 0.55, 'EQUIP-DETAIL'); };
      const hmax = H - bt - 4, rr = (i) => rnd(i + 5);
      if (v.n === 9) { for (let i = 0; i < 5; i++) hill(X0 + W * (0.14 + i * 0.18), cy + (rr(i) - 0.5) * D * 0.1, D * 0.19, hmax * (0.65 + 0.35 * m.sin(PI * (i + 0.5) / 5))); for (let i = 0; i < 4; i++) hill(X0 + W * (0.23 + i * 0.18), cy + (i % 2 ? 1 : -1) * D * 0.28, D * 0.12, hmax * (0.25 + 0.2 * rr(i + 9))); }
      else if (v.n === 8) { hill(cx, cy, D * 0.3, hmax); for (let i = 0; i < 7; i++) { const t = (2 * PI * i) / 7 + 0.3; hill(cx + m.cos(t) * D * 0.38, cy + m.sin(t) * D * 0.38, D * 0.11, hmax * (0.2 + 0.25 * rr(i))); } }
      else { for (let i = 0; i < 6; i++) { hill(X0 + W * (0.1 + i * 0.16), cy + D * 0.28, D * 0.15, hmax * (0.55 + 0.4 * rr(i + 2))); hill(X0 + W * (0.1 + i * 0.16) + 8, cy - D * 0.28, D * 0.15, hmax * (0.5 + 0.45 * rr(i + 20))); } }
      a.rect(X0 + 14, YF + 14, X1 - 14, -14, 'EQUIP-DETAIL');
      a.log('Added the framed base board and ' + v.n + ' domed hills with contour rings (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic wind turbine teaching model',
    desc: (v) => `Wind turbine model ${v.h} in tall: a round base plate, a tapered tower, a nacelle with a spinner and a three-blade rotor facing the front, the blades tapered with a wide root and a narrow tip.`,
    vs: [['12 in', 10, 6, 12, 0, {}], ['24 in', 20, 11, 24, 0, {}], ['36 in', 28, 16, 36, 0, {}]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W, D } = a, Rb = W / 2 - 8, hz = Z1 - Rb - 5, ny = YF + D * 0.5, nl = D * 0.2, bt = 12 + D * 0.04;
      a.outline('EQUIP-DETAIL'); lathe(a, cx, cy, Z0, [[D * 0.5, 0], [D * 0.5, bt * 0.7], [D * 0.3, bt]], 28); a.circ(cx, cy, D * 0.5);
      a.cone(cx, ny, Z0 + bt, hz - D * 0.1, D * 0.075, D * 0.04, 16); a.circ(cx, ny, D * 0.075, 'EQUIP-DETAIL');
      a.ell(cx, ny, hz, D * 0.11, nl, D * 0.1, 14, 8); const yr = ny - nl;
      a.tube([[cx, yr + D * 0.03, hz], [cx, yr - D * 0.1, hz]], [D * 0.07, D * 0.015], 14);
      const yb = yr - D * 0.015; const th = [0.3, 0.3 + 2 * PI / 3, 0.3 + 4 * PI / 3];
      for (const t of th) { const pts = [[0.07, -0.045], [1, -0.012], [1, 0.012], [0.07, 0.07]].map(([r, c]) => { const rr = r * Rb, cc = c * Rb; return [cx + rr * m.cos(t) - cc * m.sin(t), hz + rr * m.sin(t) + cc * m.cos(t)]; }); const ordered = (() => { const ar = pts.reduce((s, p, i) => s + (p[0] * pts[(i + 1) % 4][1] - pts[(i + 1) % 4][0] * p[1]), 0); return ar < 0 ? pts : [...pts].reverse(); })(); prismY(a, ordered, yb - 3, yb + 3); a.line(cx, yb, cx + Rb * m.cos(t), yb, 'EQUIP-DETAIL'); }
      a.rect(cx - Rb, yb - 3, cx + Rb, yb + 3, 'EQUIP-DETAIL'); a.log('Added the base plate, tapered tower, nacelle, spinner and the three tapered blades (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic truss bridge teaching model',
    desc: (v) => ({ warren: 'Warren truss bridge model: two side trusses of a straight top and bottom chord joined by zigzag diagonals only, a deck between them, top cross ties and two abutment blocks.', pratt: 'Pratt truss bridge model: two side trusses with vertical posts and diagonals sloping toward the middle, a deck, top cross ties and two abutment blocks.', arch: 'Tied arch bridge model: two arches over a deck with a vertical hanger at every panel point, a cross tie at the crown and two abutment blocks.' })[v.kind],
    vs: [['Warren truss, 30 in span', 34, 8, 9, 0, { kind: 'warren' }], ['Pratt truss, 36 in span', 40, 8, 10, 0, { kind: 'pratt' }], ['tied arch, 30 in span', 34, 8, 10, 0, { kind: 'arch' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W } = a, ab = 80, zd = Z0 + a.H * 0.3, xs = X0 + ab, xe = X1 - ab, L = xe - xs, N = 6, yA = YF + 22, yB = -22, zb = zd + 8, zt = Z1 - 6, cr = 5, dr = 3.2;
      a.outline('EQUIP-DETAIL'); for (const [x0, x1] of [[X0, xs], [xe, X1]]) { a.box(x0, YF, Z0, x1, 0, zd); a.rect(x0, YF, x1, 0, 'EQUIP-DETAIL'); }
      a.box(xs, YF + 8, zd - 12, xe, -8, zd); a.box(xs - 4, YF + 8, zd, xe + 4, YF + 14, zd + 8); a.box(xs - 4, -14, zd, xe + 4, -8, zd + 8);
      const px = (i) => xs + (L * i) / N;
      for (const y of [yA, yB]) {
        a.tube([[xs, y, zb], [xe, y, zb]], [cr, cr], 8);
        if (v.kind === 'warren') { const tz = zt, top = []; for (let i = 0; i < N; i++) top.push([px(i + 0.5), tz]); a.tube(top.map(([x, z]) => [x, y, z]), top.map(() => cr), 8); a.tube([[xs, y, zb], [top[0][0], y, tz]], [dr, dr], 6); a.tube([[xe, y, zb], [top[N - 1][0], y, tz]], [dr, dr], 6); for (let i = 0; i < N; i++) { a.tube([[px(i), y, zb], [top[i][0], y, tz]], [dr, dr], 6); a.tube([[top[i][0], y, tz], [px(i + 1), y, zb]], [dr, dr], 6); } }
        else if (v.kind === 'pratt') { a.tube([[px(1), y, zt], [px(N - 1), y, zt]], [cr, cr], 8); a.tube([[xs, y, zb], [px(1), y, zt]], [cr, cr], 8); a.tube([[xe, y, zb], [px(N - 1), y, zt]], [cr, cr], 8); for (let i = 1; i < N; i++) { a.tube([[px(i), y, zb], [px(i), y, zt]], [dr, dr], 6); if (i < N / 2) a.tube([[px(i), y, zt], [px(i + 1), y, zb]], [dr, dr], 6); else if (i > N / 2) a.tube([[px(i), y, zt], [px(i - 1), y, zb]], [dr, dr], 6); } }
        else { const arc = []; for (let i = 0; i <= 18; i++) { const f = i / 18, x = xs + L * f; arc.push([x, y, zb + (zt - zb) * (1 - (2 * f - 1) ** 2)]); } a.tube(arc, arc.map(() => cr), 8); for (let i = 1; i < N; i++) { const f = i / N; a.tube([[px(i), y, zb], [px(i), y, zb + (zt - zb) * (1 - (2 * f - 1) ** 2)]], [dr, dr], 6); } }
        a.line(xs, y, xe, y, 'EQUIP-DETAIL');
      }
      const ties = v.kind === 'arch' ? [N / 2] : [1, 3, 5].map((i) => (v.kind === 'warren' ? i - 0.5 : i)).filter((i) => i > 0 && i < N);
      for (const i of v.kind === 'arch' ? [N / 2] : v.kind === 'warren' ? [0.5, 2.5, 5.5].map((q) => q) : [1, 3, 5]) { const x = v.kind === 'warren' ? px(i) : px(i); a.tube([[x, yA, zt], [x, yB, zt]], [dr, dr], 6); a.line(x, yA, x, yB, 'EQUIP-DETAIL'); }
      a.log('Added the abutment blocks, deck, two side ' + (v.kind === 'arch' ? 'arches with hangers' : 'trusses') + ' and the cross ties (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic lever and fulcrum teaching set',
    desc: (v) => `Lever demonstration: a base board, a triangular fulcrum block, a ${v.len} in beam with marked positions resting on its apex, and ${v.hooks.length} hanging weights on hooks at different distances.`,
    vs: [['24 in beam, two weights', 26, 6, 10, 0, { len: 24, hooks: [[-0.62, 30, 50], [0.31, 22, 36]] }], ['36 in beam, three weights', 38, 6, 12, 0, { len: 36, hooks: [[-0.7, 34, 56], [-0.25, 26, 40], [0.55, 28, 44]] }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W, H } = a, bt = 20, bz = Z0 + H * 0.72, half = (v.len * IN) / 2;
      a.outline('EQUIP-DETAIL'); a.box(X0, YF, Z0, X1, 0, Z0 + bt); for (const [x, y] of [[X0 + 20, YF + 20], [X1 - 20, YF + 20], [X0 + 20, -20], [X1 - 20, -20]]) a.cyl(x, y, Z0 - 0, Z0 + 1, 1, 3);
      prismY(a, [[cx - 45, Z0 + bt], [cx + 45, Z0 + bt], [cx + 5, bz - 12], [cx - 5, bz - 12]], cy - 22, cy + 22); a.rect(cx - 45, cy - 22, cx + 45, cy + 22);
      a.box(cx - half, cy - 12, bz - 12, cx + half, cy + 12, bz + 8); a.box(cx - 10, cy - 14, bz - 14, cx + 10, cy + 14, bz + 10);
      for (let k = -10; k <= 10; k++) a.line(cx + (half * k) / 10, cy - 12, cx + (half * k) / 10, cy + 12, 'EQUIP-DETAIL');
      for (const [f, r, hh] of v.hooks) { const x = cx + half * f; a.tube([[x, cy, bz - 12], [x, cy, bz - 12 - 26]], [1.8, 1.8], 5); a.cyl(x, cy, bz - 12 - 26 - hh, bz - 12 - 26, r, 14); a.cyl(x, cy, bz - 12 - 26 - hh - 3, bz - 12 - 26 - hh, r * 0.8, 14); a.circ(x, cy, r); }
      a.log('Added the base board, fulcrum block, graduated beam and the hanging weights with hooks (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic geometry polyhedron model',
    desc: (v) => ({ tetra: 'Tetrahedron: four equilateral triangle faces, resting on one face.', octa: 'Octahedron: eight triangle faces, resting point-down in a small socket stand.', icosa: 'Icosahedron: twenty triangle faces with a vertex at top and bottom, resting point-down in a small socket stand.', hex: 'Hexagonal prism: two regular hexagon ends and six rectangle faces, standing on one end.' })[v.kind],
    vs: [['tetrahedron, 4 in edge', 3.6, 4, 3.8, 0, { kind: 'tetra' }], ['octahedron on stand, 4 in', 4.2, 4.2, 5.4, 0, { kind: 'octa' }], ['icosahedron on stand, 4.5 in', 4.5, 4.5, 6.3, 0, { kind: 'icosa' }], ['hexagonal prism, 3 in across, 5 in high', 3, 2.6, 5, 0, { kind: 'hex' }]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W, D } = a;
      if (v.kind === 'tetra') { const e = D - 0.2, r = e / m.sqrt(3), h = e * m.sqrt(2 / 3), x0 = cx - r / 4, zb = Z0 + 6, A = [x0 + r, cy, zb], B = [x0 - r / 2, cy + e / 2, zb], C = [x0 - r / 2, cy - e / 2, zb], T = [x0, cy, zb + h]; a.box(a.X0, a.YF, Z0, a.X1, 0, zb); solid(a, [A, B, C, T], [[0, 1, 2], [0, 1, 3], [1, 2, 3], [2, 0, 3]]); a.poly([[A[0], A[1]], [B[0], B[1]], [C[0], C[1]]]); a.line(x0, cy, A[0], A[1], 'EQUIP-DETAIL'); a.line(x0, cy, B[0], B[1], 'EQUIP-DETAIL'); a.line(x0, cy, C[0], C[1], 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN'); }
      else if (v.kind === 'hex') { const s = W / 2, hx = []; for (let i = 0; i < 6; i++) { const t = (PI * i) / 3; hx.push([cx + s * m.cos(t), cy + s * m.sin(t)]); } a.prism(hx, Z0, Z1); a.poly(hx); a.circ(cx, cy, s * 0.5, 'EQUIP-DETAIL'); for (const p of hx) a.line(cx, cy, p[0], p[1], 'EQUIP-DETAIL'); }
      else {
        const sk = 30; lathe(a, cx, cy, Z0, [[W * 0.3, 0], [W * 0.3, 8], [W * 0.1, 20], [6, sk]], 20); a.circ(cx, cy, W * 0.3);
        if (v.kind === 'octa') { const s = W / 2 - 1, z = Z0 + sk + s; const V = [[cx + s, cy, z], [cx - s, cy, z], [cx, cy + s, z], [cx, cy - s, z], [cx, cy, z + s], [cx, cy, z - s]]; solid(a, V, [[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [0, 2, 5], [2, 1, 5], [1, 3, 5], [3, 0, 5]]); a.poly([[cx + s, cy], [cx, cy + s], [cx - s, cy], [cx, cy - s]]); a.line(cx - s, cy, cx + s, cy, 'EQUIP-DETAIL'); a.line(cx, cy - s, cx, cy + s, 'EQUIP-DETAIL'); }
        else { const R = (Z1 - Z0 - sk) / 2, z = Z0 + sk + R, rr = (2 * R) / m.sqrt(5), zh = R / m.sqrt(5), V = [[cx, cy, z + R], [cx, cy, z - R]]; for (let k = 0; k < 5; k++) V.push([cx + rr * m.cos((2 * PI * k) / 5), cy + rr * m.sin((2 * PI * k) / 5), z + zh]); for (let k = 0; k < 5; k++) V.push([cx + rr * m.cos((2 * PI * k) / 5 + PI / 5), cy + rr * m.sin((2 * PI * k) / 5 + PI / 5), z - zh]);
          const F = []; for (let k = 0; k < 5; k++) { const k1 = (k + 1) % 5; F.push([0, 2 + k, 2 + k1], [1, 7 + k1, 7 + k], [2 + k, 7 + k, 2 + k1], [7 + k, 7 + k1, 2 + k1]); } solid(a, V, F);
          const pl = []; for (let k = 0; k < 5; k++) pl.push([cx + rr * m.cos((2 * PI * k) / 5), cy + rr * m.sin((2 * PI * k) / 5)]); a.poly(pl); a.circ(cx, cy, rr, 'EQUIP-DETAIL'); }
      }
      a.log('Added the ' + (v.kind === 'tetra' ? 'four faces' : v.kind === 'hex' ? 'two hexagon ends and six side faces' : v.kind === 'octa' ? 'eight faces and the socket stand' : 'twenty faces and the socket stand') + ' (plan and 3D).');
    } }),
];


// ------------------------------------------------------------------------------------------ playground
/** a box with rounded edges and corners (foam blocks, cushions) */
function rbox(a, x0, y0, z0, x1, y1, z1, r) {
  a.box(x0 + r, y0, z0 + r, x1 - r, y1, z1 - r); a.box(x0, y0 + r, z0 + r, x1, y1 - r, z1 - r); a.box(x0 + r, y0 + r, z0, x1 - r, y1 - r, z1);
  for (const y of [y0 + r, y1 - r]) for (const z of [z0 + r, z1 - r]) a.xcyl(x0 + r, x1 - r, y, z, r, 8);
  for (const x of [x0 + r, x1 - r]) for (const z of [z0 + r, z1 - r]) a.ycyl(y0 + r, y1 - r, x, z, r, 8);
  for (const x of [x0 + r, x1 - r]) for (const y of [y0 + r, y1 - r]) { a.cyl(x, y, z0 + r, z1 - r, r, 8); for (const z of [z0 + r, z1 - r]) sph(a, x, y, z, r, 8, 5); }
}
/** a hollow tube along Y: outer radius ro, inner radius ri, centre (cx, zc), from y0 to y1 */
function hollowY(a, cx, zc, y0, y1, ro, ri, seg = 24) {
  const P = (r, y, j) => { const t = (2 * PI * j) / seg; return [cx + r * m.cos(t), y, zc + r * m.sin(t)]; };
  for (let j = 0; j < seg; j++) {
    a.t.push([P(ro, y0, j), P(ro, y1, j), P(ro, y1, j + 1)], [P(ro, y0, j), P(ro, y1, j + 1), P(ro, y0, j + 1)]);
    a.t.push([P(ri, y0, j), P(ri, y1, j + 1), P(ri, y1, j)], [P(ri, y0, j), P(ri, y0, j + 1), P(ri, y1, j + 1)]);
    a.t.push([P(ro, y0, j), P(ro, y0, j + 1), P(ri, y0, j + 1)], [P(ro, y0, j), P(ri, y0, j + 1), P(ri, y0, j)]);
    a.t.push([P(ro, y1, j), P(ri, y1, j + 1), P(ro, y1, j + 1)], [P(ro, y1, j), P(ri, y1, j), P(ri, y1, j + 1)]);
  }
}
/** a wall made of boxes with openings: ax 'x' runs along x (thickness in y: o0..o1), 'y' runs along y (thickness in x); holes [{c0, c1, h0, h1}] */
function wall(a, ax, c0, c1, o0, o1, z0, z1, holes = []) {
  const B = (u0, u1, zz0, zz1) => (u1 - u0 > 0.5 && zz1 - zz0 > 0.5) && (ax === 'x' ? a.box(u0, o0, zz0, u1, o1, zz1) : a.box(o0, u0, zz0, o1, u1, zz1));
  const hs = [...holes].sort((p, q) => p.c0 - q.c0); let u = c0;
  for (const h of hs) { B(u, h.c0, z0, z1); B(h.c0, h.c1, z0, h.h0); B(h.c0, h.c1, h.h1, z1); u = h.c1; }
  B(u, c1, z0, z1);
}

const play = [
  fam({ cat: 'educational/playground', title: 'Generic gym wall bars',
    desc: (v) => `Wall bars (ribstall), ${v.bays} bay${v.bays > 1 ? 's' : ''}: wooden uprights on a top and bottom rail with a round rung every 5 in, fixed flat to the wall${v.bar ? ', and a pull-up bar on two arms at the top' : ''}.`,
    vs: [['single bay, 32 in wide', 32, 4, 96, 0, { bays: 1 }], ['double bay, 64 in wide', 64, 4, 96, 0, { bays: 2 }], ['triple bay with pull-up bar, 96 in wide', 96, 10, 96, 0, { bays: 3, bar: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, W } = a, uw = 50, ud = 90, bw = (W - uw) / v.bays;
      a.outline('EQUIP-DETAIL');
      for (let i = 0; i <= v.bays; i++) { const x = X0 + i * bw; a.box(x, -ud, Z0, x + uw, 0, Z1); a.rect(x, -ud, x + uw, 0, 'EQUIP'); }
      a.box(X0, -ud, Z0, X1, -ud + 40, Z0 + 70); a.box(X0, -ud, Z1 - 70, X1, -ud + 40, Z1);
      const n = m.floor((Z1 - Z0 - 220) / 127);
      for (let b = 0; b < v.bays; b++) for (let k = 0; k <= n; k++) { const z = Z0 + 110 + (k * (Z1 - Z0 - 220)) / n; a.xcyl(X0 + b * bw + uw, X0 + (b + 1) * bw, -ud / 2, z, 15, 10); a.line(X0 + b * bw + uw, -ud / 2, X0 + (b + 1) * bw, -ud / 2, 'EQUIP-DETAIL'); }
      if (v.bar) { const bz = Z1 - 150; for (const x of [X0 + bw * 0.5, X1 - bw * 0.5 - 20]) a.tube([[x, -ud, bz], [x, YF + 40, bz + 0.1]], [14, 14], 8); a.xcyl(X0 + bw * 0.5, X1 - bw * 0.5, YF + 40, bz, 16, 10); a.line(X0 + bw * 0.5, YF + 40, X1 - bw * 0.5, YF + 40, 'EQUIP-DETAIL'); }
      a.log('Added the uprights, top and bottom rails and the ' + (n + 1) + ' rungs per bay' + (v.bar ? ', and the pull-up bar on two arms' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic folding gym mat stood up',
    desc: (v) => `Folding gym mat with ${v.n} padded panels stood in a zig-zag on the floor: each panel a thick slab with a hinge strip and two carry handles, folded at an angle so it stands without support.`,
    vs: [['2 panels, V fold, 36 in wide', 36, 24, 18, 0, { n: 2 }], ['3 panels, zig-zag, 54 in wide', 54, 24, 20, 0, { n: 3 }], ['4 panels, zig-zag, 72 in wide', 72, 24, 24, 0, { n: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, W, H } = a, t = 50, th = m.atan((v.n * (H - t)) / (W - t)), p = (H - t) / m.sin(th), dx = p * m.cos(th), dz = p * m.sin(th);
      a.outline('EQUIP-DETAIL');
      const x0 = X0 + t * 0.5 * m.sin(th) + 2;
      let px = x0, pz = Z0 + t * 0.5 * m.cos(th);
      for (let i = 0; i < v.n; i++) {
        const up = i % 2 === 0, sx = px, sz = up ? Z0 + t * 0.5 : Z0 + dz + t * 0.0 - 0 + t * 0.5 - t * 0.5 + (Z1 - Z0 - dz - t) * 0 ;
        const A = [px, up ? Z0 + t * 0.6 : Z1 - t * 0.6], B = [px + dx, up ? Z1 - t * 0.6 : Z0 + t * 0.6], d = [B[0] - A[0], B[1] - A[1]], L = m.hypot(...d), nn = [(-d[1] / L) * (t / 2), (d[0] / L) * (t / 2)];
        const poly = [[A[0] + nn[0], A[1] + nn[1]], [B[0] + nn[0], B[1] + nn[1]], [B[0] - nn[0], B[1] - nn[1]], [A[0] - nn[0], A[1] - nn[1]]];
        const ar = poly.reduce((s2, q, k) => s2 + (q[0] * poly[(k + 1) % 4][1] - poly[(k + 1) % 4][0] * q[1]), 0);
        prismY(a, ar < 0 ? poly : [...poly].reverse(), YF + 6, -6);
        const mx = (A[0] + B[0]) / 2, mz = (A[1] + B[1]) / 2; for (const y of [YF + 130, -130]) a.tube([[mx - 60 * (d[0] / L) + nn[0] * 1.6, y, mz - 60 * (d[1] / L) + nn[1] * 1.6], [mx + nn[0] * 2.4, y, mz + nn[1] * 2.4], [mx + 60 * (d[0] / L) + nn[0] * 1.6, y, mz + 60 * (d[1] / L) + nn[1] * 1.6]].map(([x, yy, z]) => [m.min(m.max(x, X0 + 3), X1 - 3), yy, m.min(m.max(z, Z0 + 3), Z1 - 3)]), [6, 6, 6], 6);
        a.line(px, YF + 6, px, -6, 'EQUIP-DETAIL'); px += dx;
      }
      a.line(px, YF + 6, px, -6, 'EQUIP-DETAIL'); a.log('Added ' + v.n + ' padded panels in a zig-zag fold, with carry handles on each (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic spring rocker ride-on',
    desc: (v) => `Spring rocker for ${v.age}: a flat base plate, a coil spring, a rounded body with a saddle seat, a neck and head with two ears and a snout, a handle bar through the head, side footrests and a short tail.`,
    vs: [['toddler, 26 in high', 12, 26, 26, 0, { age: 'toddlers' }], ['junior, 30 in high', 13, 30, 30, 0, { age: 'young children' }], ['large, 34 in high', 15, 34, 34, 0, { age: 'older children' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W, D, H } = a, zb = Z0 + H * 0.5;
      a.ell(cx, cy, Z0 + 14, W * 0.42, D * 0.4, 14, 20, 4); a.ellp(cx, cy, W * 0.42, D * 0.4, 'EQUIP');
      const hel = []; const T = 6 * 2 * PI; for (let i = 0; i <= 90; i++) { const t = (T * i) / 90; hel.push([cx + 36 * m.cos(t), cy + 36 * m.sin(t), Z0 + 22 + ((zb - 40 - Z0 - 22) * i) / 90]); } a.tube(hel, hel.map(() => 6), 6); a.circ(cx, cy, 42, 'EQUIP-HIDDEN');
      a.ell(cx, cy, zb, W * 0.32, D * 0.27, H * 0.13, 16, 9); a.ell(cx, cy + D * 0.02, zb + H * 0.1, W * 0.27, D * 0.16, H * 0.045, 14, 6); a.ellp(cx, cy, W * 0.32, D * 0.27, 'EQUIP-DETAIL');
      const hy = YF + D * 0.16, hz = Z1 - H * 0.12;
      a.tube([[cx, cy - D * 0.18, zb + H * 0.07], [cx, cy - D * 0.3, zb + H * 0.22], [cx, hy + D * 0.06, hz - H * 0.04]], [W * 0.1, W * 0.08, W * 0.07], 10);
      a.ell(cx, hy, hz, W * 0.14, D * 0.09, H * 0.075, 14, 8); a.ell(cx, YF + D * 0.05, hz - H * 0.025, W * 0.1, D * 0.05, H * 0.045, 12, 7); a.ellp(cx, hy, W * 0.14, D * 0.09, 'EQUIP-DETAIL');
      for (const s of [-1, 1]) { a.cone(cx + s * W * 0.07, hy + D * 0.03, hz + H * 0.05, Z1 - 3, W * 0.035, 3, 8); a.box(cx + s * W * 0.4 - 22, cy - 80, Z0 + H * 0.3, cx + s * W * 0.4 + 22, cy + 80, Z0 + H * 0.3 + 14); a.tube([[cx + s * W * 0.28, cy, zb - H * 0.06], [cx + s * W * 0.4, cy, Z0 + H * 0.3 + 14]], [8, 8], 6); }
      a.xcyl(cx - W * 0.4, cx + W * 0.4, hy - D * 0.035, hz - H * 0.015, 9, 8); for (const s of [-1, 1]) a.xcyl(cx + s * W * 0.4 - (s > 0 ? 0 : -40), cx + s * W * 0.4 + (s > 0 ? 40 : 0) * 0, hy - D * 0.035, hz - H * 0.015, 13, 8);
      a.tube([[cx, cy + D * 0.24, zb + H * 0.02], [cx, -D * 0.06, zb - H * 0.06]], [W * 0.05, W * 0.02], 8);
      a.outline('EQUIP-HIDDEN'); a.log('Added the base plate, coil spring, body with saddle, neck, head with ears and snout, handle bar, footrests and tail (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic early years playhouse',
    desc: (v) => `Child-size cottage, ${v.w} in wide: four walls with a front door opening, a leaf with a knob, ${v.win} window${v.win > 1 ? 's' : ''} with frames and cross bars, a pitched roof with overhang and a floor${v.porch ? ', and a front porch under the roof overhang on two posts' : ''}.`,
    vs: [['small cottage, 36 x 36 in', 36, 36, 48, 0, { win: 1, porch: false }], ['large cottage, 48 x 48 in', 48, 48, 60, 0, { win: 2, porch: false }], ['cottage with porch, 48 x 60 in', 48, 60, 56, 0, { win: 2, porch: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W, D, H } = a, t = 30, ov = 40, pd = v.porch ? D * 0.22 : 0, hx0 = X0 + ov, hx1 = X1 - ov, hy0 = YF + ov + pd, Hw = H * 0.62, zw = Z0 + Hw, dw = W * 0.28, dh = Hw * 0.74;
      a.outline('EQUIP-DETAIL'); a.box(hx0 - 10, hy0 - 10, Z0, hx1 + 10, 0, Z0 + 20);
      const door = { c0: cx - dw / 2, c1: cx + dw / 2, h0: Z0 + 20, h1: Z0 + 20 + dh };
      wall(a, 'x', hx0, hx1, hy0, hy0 + t, Z0 + 20, zw, [door]);
      wall(a, 'x', hx0, hx1, -t, 0, Z0 + 20, zw);
      const wy = (hy0 + 0) / 2, ww = m.min(D * 0.2, 380), wz0 = Z0 + Hw * 0.42, wz1 = Z0 + Hw * 0.82;
      const sideHoles = v.win === 2 ? [{ c0: wy - ww * 1.0, c1: wy - ww * 1.0 + ww, h0: wz0, h1: wz1 }, { c0: wy + ww * 0.0, c1: wy + ww, h0: wz0, h1: wz1 }].filter((h) => h.c0 > hy0 + 60 && h.c1 < -60) : [{ c0: wy - ww / 2, c1: wy + ww / 2, h0: wz0, h1: wz1 }];
      for (const [x0, x1] of [[hx0, hx0 + t], [hx1 - t, hx1]]) { wall(a, 'y', hy0 + t, -t, x0, x1, Z0 + 20, zw, sideHoles); for (const h of sideHoles) { const xm = (x0 + x1) / 2; a.box(xm - 4, h.c0 + 8, h.h0 + 8, xm + 4, h.c1 - 8, h.h1 - 8); a.box(xm - 6, (h.c0 + h.c1) / 2 - 3, h.h0 + 8, xm + 6, (h.c0 + h.c1) / 2 + 3, h.h1 - 8); a.box(xm - 6, h.c0 + 8, (h.h0 + h.h1) / 2 - 3, xm + 6, h.c1 - 8, (h.h0 + h.h1) / 2 + 3); a.box(x0 - 14, h.c0 - 20, h.h0 - 24, x0, h.c1 + 20, h.h0 - 2 + 0); }
      }
      a.box(door.c0 + 10, hy0 + t / 2 - 6, door.h0, door.c1 - 10, hy0 + t / 2 + 6, door.h1 - 6); a.cyl(door.c1 - 50, hy0 + t / 2, door.h0 + dh * 0.45, door.h0 + dh * 0.45 + 0.1, 0.1, 3); a.ycyl(hy0 + t / 2 - 30, hy0 + t / 2 - 6, door.c1 - 50, door.h0 + dh * 0.45, 14, 10);
      a.frame(door.c0 - 12, door.h0, door.c1 + 12, door.h1 + 12, hy0 - 6, hy0 + t + 4, 14); a.arc(door.c0, hy0, dw, 270, 360); a.line(door.c0, hy0, door.c0, hy0 - dw, 'EQUIP-SWING');
      a.box(hx0, hy0, zw, hx1, hy0 + t, zw + 1); const rz = zw;
      prismY(a, [[hx0, zw], [hx1, zw], [cx, Z1 - 40]], hy0, hy0 + t); prismY(a, [[hx0, zw], [hx1, zw], [cx, Z1 - 40]], -t, 0);
      for (const sg of [-1, 1]) { const L0 = [sg < 0 ? X0 : X1, zw - 30], T = [cx, Z1], d = [T[0] - L0[0], T[1] - L0[1]], Ld = m.hypot(...d), nn = [(d[1] / Ld) * 32 * (sg < 0 ? 1 : -1), (-d[0] / Ld) * 32 * (sg < 0 ? 1 : -1)]; const poly = [L0, T, [T[0] + nn[0], T[1] + nn[1]], [L0[0] + nn[0], L0[1] + nn[1]]]; const ar = poly.reduce((s2, q, k) => s2 + (q[0] * poly[(k + 1) % 4][1] - poly[(k + 1) % 4][0] * q[1]), 0); prismY(a, ar < 0 ? poly : [...poly].reverse(), YF + (v.porch ? 0 : 6), -2); }
      if (v.porch) { for (const x of [hx0 + 20, hx1 - 20]) { a.box(x - 20, YF + 40, Z0, x + 20, YF + 80, zw); } a.box(hx0, YF + 20, Z0, hx1, hy0, Z0 + 20); a.rect(hx0 + 20, YF + 40, hx1 - 20, YF + 80, 'EQUIP-HIDDEN'); }
      a.rect(hx0, hy0, hx1, 0, 'EQUIP-DETAIL'); a.log('Added the floor, walls with door and window openings, door leaf with knob, window frames with bars, the pitched roof' + (v.porch ? ' and the porch with two posts and floor' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic play kitchen unit',
    desc: (v) => `Child-height play kitchen, ${v.w} in wide: ${v.mods.join(', ')}; a counter top, a back panel with a shelf, knobs and a rail with hanging utensils.`,
    vs: [['compact, 24 in: cooker only', 24, 12, 36, 0, { mods: ['cooker with oven and four-ring hob'] }], ['standard, 36 in: cooker, sink and cupboard', 36, 13, 36, 0, { mods: ['cooker with oven and four-ring hob', 'sink with tap', 'cupboard with two doors'] }], ['large, 48 in: cooker, sink, cupboard and fridge', 48, 13, 40, 0, { mods: ['cooker with oven and four-ring hob', 'sink with tap', 'cupboard with two doors', 'fridge with two doors'] }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, W, H } = a, n = v.mods.length, mw = W / n, ch = H * 0.55, bt = 28, T = 19;
      a.outline('EQUIP-DETAIL'); a.box(X0, YF + 24, Z0 + 40, X1, 0, Z0 + ch); a.box(X0 + 10, YF + 30, Z0, X1 - 10, 0, Z0 + 40); a.box(X0, YF, Z0 + ch, X1, YF + 60, Z0 + ch + 18); a.box(X0, -T, Z0 + ch, X1, 0, Z1);
      a.box(X0, -T - 60, Z0 + ch + H * 0.28, X1, 0, Z0 + ch + H * 0.28 + T); a.tube([[X0 + 20, -T - 14, Z0 + ch + H * 0.2], [X1 - 20, -T - 14, Z0 + ch + H * 0.2]], [5, 5], 6);
      for (let i = 0; i < 4; i++) { const x = X0 + W * (0.2 + 0.2 * i); a.box(x - 5, -T - 24, Z0 + ch + H * 0.12, x + 5, -T - 12, Z0 + ch + H * 0.2); a.cyl(x, -T - 36, Z0 + ch + H * 0.06, Z0 + ch + H * 0.12, 16, 10); }
      for (let i = 0; i < n; i++) {
        const x0 = X0 + i * mw, x1 = x0 + mw, mx = (x0 + x1) / 2, mod = v.mods[i];
        if (mod.startsWith('fridge')) { a.box(x0 + 4, YF + 12, Z0 + 40, x1 - 4, -T, Z1 - 30); a.box(x0 + 6, YF, Z0 + 44, x1 - 6, YF + 12, Z0 + (Z1 - Z0) * 0.5); a.box(x0 + 6, YF, Z0 + (Z1 - Z0) * 0.5 + 6, x1 - 6, YF + 12, Z1 - 34); pull(a, 'bar', x1 - 40, Z0 + (Z1 - Z0) * 0.5 - 60, YF + 34); a.line(x0 + 6, YF + 6, x1 - 6, YF + 6, 'EQUIP-DETAIL'); continue; }
        if (mod.startsWith('cooker')) {
          a.box(x0 + 22, YF + 2, Z0 + 56, x1 - 22, YF + 20, Z0 + ch - 80); a.frame(x0 + 40, Z0 + 76, x1 - 40, Z0 + ch - 120, YF - 0.1 + 2, YF + 26, 14); a.box(x0 + 54, YF + 18, Z0 + 90, x1 - 54, YF + 22, Z0 + ch - 134);
          a.ycyl(YF + 26, YF + 28, mx, Z0 + ch - 100, 1, 3); a.xcyl(x0 + 60, x1 - 60, YF + 32, Z0 + ch - 100 + 0, 7, 8);
          for (let k = 0; k < 4; k++) { const rx = mx + ((k % 2) - 0.5) * m.min(mw * 0.5, 190), ry = YF + 150 + (k >> 1) * 130; ring(a, rx, ry, Z0 + ch + 18, 38, 5, 14, 6); a.circ(rx, ry, 38, 'EQUIP-DETAIL'); }
          for (let k = 0; k < 4; k++) { const kx = mx + (k - 1.5) * m.min(mw * 0.2, 60); a.ycyl(YF + 2, YF + 18, kx, Z0 + ch - 40, 12, 8); a.circ(kx, YF + 8, 12, 'EQUIP-DETAIL'); }
        } else if (mod.startsWith('sink')) {
          lathe(a, mx, YF + 130, Z0 + ch + 18, [[0, 0], [mw * 0.34, 0], [mw * 0.34, 28], [mw * 0.34 - 5, 28], [mw * 0.34 - 5, 8], [0, 8]], 20); a.circ(mx, YF + 130, mw * 0.34);
          a.tube([[mx, -T - 20, Z0 + ch + 18], [mx, -T - 20, Z0 + ch + 140], [mx, -T - 90, Z0 + ch + 150], [mx, -T - 120, Z0 + ch + 100]].map(([x, y, z]) => [x, y, z]), [8, 8, 7, 7], 8);
          for (const s of [-1, 1]) a.box(mx + s * 60 - 6, -T - 30, Z0 + ch + 18, mx + s * 60 + 6, -T - 18, Z0 + ch + 60);
          for (const d of [0, 1]) { a.box(x0 + 6 + d * 0, YF + 2, Z0 + 56, x1 - 6, YF + 20, Z0 + ch - 20); break; } pull(a, 'knob', mx, Z0 + ch - 100, YF + 24);
        } else { const L2 = [[x0 + 6, mx - 2], [mx + 2, x1 - 6]]; for (const [d0, d1] of L2) { a.box(d0, YF + 2, Z0 + 56, d1, YF + 20, Z0 + ch - 20); pull(a, 'knob', d0 === L2[0][0] ? d1 - 40 : d0 + 40, Z0 + ch - 140, YF + 24); a.line(d0, YF + 20, d1, YF + 20, 'EQUIP-DETAIL'); } }
        if (i) a.line(x0, YF, x0, 0, 'EQUIP-DETAIL');
      }
      a.log('Added the counter, back panel with shelf and utensil rail, and the ' + v.mods.join(', ') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic soft foam play block',
    desc: (v) => ({ cube: 'Foam block in a wipe-clean cover: a rounded cube with a carry strap loop on top.', long: 'Long foam block in a wipe-clean cover: a rounded rectangular block with a carry strap loop on top.', ramp: 'Foam ramp: a wedge with chamfered edges and a rounded top edge, sloping from the high end to the low end.', cyl: 'Foam round bolster: a squat cylinder with rounded top and bottom edges.' })[v.kind],
    vs: [['cube, 12 in', 12, 12, 12, 0, { kind: 'cube' }], ['long block, 24 x 12 x 6 in', 24, 12, 6, 0, { kind: 'long' }], ['ramp wedge, 24 x 24 x 12 in', 24, 24, 12, 0, { kind: 'ramp' }], ['round bolster, 18 in x 12 in high', 18, 18, 12, 0, { kind: 'cyl' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W, D, H } = a;
      if (v.kind === 'cube' || v.kind === 'long') { const r = m.min(H * 0.2, 45), hz = Z1 - 16; rbox(a, X0, YF, Z0, X1, 0, hz, r); const x = cx; a.tube([[x - 90, cy, hz - 2], [x - 70, cy, Z1 - 4], [x + 70, cy, Z1 - 4], [x + 90, cy, hz - 2]], [6, 6, 6, 6], 6); a.outline(); a.rect(X0 + 14, YF + 14, X1 - 14, -14, 'EQUIP-DETAIL'); }
      else if (v.kind === 'ramp') { const r = 22; prismX(a, [[YF, Z0], [0, Z0], [0, Z1 - r], [-r, Z1], [YF + 40, Z0 + 40], [YF + 10, Z0 + 10]].filter((p, i, ar) => i < 5 || true).slice(0, 5), X0, X1); a.outline(); for (let i = 1; i < 6; i++) a.line(X0, YF + (D * i) / 6, X1, YF + (D * i) / 6, 'EQUIP-DETAIL'); a.line(X0, 0, X1, 0, 'EQUIP-DETAIL'); }
      else { const R = W / 2, r = 40; lathe(a, cx, cy, Z0, [[0, 0], [R - r, 0], [R - r * 0.3, r * 0.3], [R, r], [R, H - r], [R - r * 0.3, H - r * 0.3], [R - r, H], [0, H]], 28); a.circ(cx, cy, R); a.circ(cx, cy, R - 40, 'EQUIP-DETAIL'); }
      a.log('Added the ' + (v.kind === 'ramp' ? 'wedge body with its rounded top edge' : v.kind === 'cyl' ? 'rounded bolster body' : 'rounded block with strap loop') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic soft play tunnel',
    desc: (v) => `Crawl-through play tunnel, ${v.len} in long and ${v.dia} in across: a hollow ribbed tube with open ends, lying on the floor with a wedge foot at each end.`,
    vs: [['36 in long, 16 in across', 16, 36, 17, 0, { len: 36, dia: 16 }], ['72 in long, 20 in across', 20, 72, 21, 0, { len: 72, dia: 20 }], ['96 in long, 24 in across', 24, 96, 25, 0, { len: 96, dia: 24 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, cx, cy, W, D } = a, R = W / 2 - 6, zc = Z0 + 14 + R, n = m.round((D - 100) / 100), sec = (D - 100) / n;
      a.outline('EQUIP-DETAIL');
      for (let i = 0; i < n; i++) { const y0 = YF + 50 + i * sec; hollowY(a, cx, zc, y0, y0 + sec * 0.55, R, R - 14, 24); hollowY(a, cx, zc, y0 + sec * 0.55, y0 + sec, R - 22, R - 36, 24); }
      hollowY(a, cx, zc, YF + 50 + n * sec, YF + 50 + n * sec + 0.01, R - 22, R - 36, 24);
      for (const y of [YF + 20, -20 - 90]) { prismY(a, [[cx - R * 0.5, Z0 + 14], [cx + R * 0.5, Z0 + 14], [cx + R * 0.7, Z0], [cx - R * 0.7, Z0]], y, y + 90); }
      a.rect(cx - R, YF + 50, cx + R, YF + 50 + n * sec, 'EQUIP'); for (let i = 1; i < n; i++) a.line(cx - R, YF + 50 + i * sec, cx + R, YF + 50 + i * sec, 'EQUIP-DETAIL');
      a.log('Added the ribbed hollow tube with open ends and the two wedge feet (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic sand pit with edging',
    desc: (v) => v.round ? `Round sand pit ${v.w} in across: a ring of ${v.logs} half-log edge posts around a sand fill with a low mound, a bucket and a spade standing in it.` : `Square sand pit ${v.w} in wide: four edge boards, a corner seat block at each corner and a sand fill with a low mound.`,
    vs: [['square with corner seats, 48 in', 48, 48, 12, 0, {}], ['square with corner seats, 72 in', 72, 72, 14, 0, {}], ['round with log edging, 72 in', 72, 72, 14, 0, { round: true, logs: 18 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W, D, H } = a, bh = H * 0.7;
      if (v.round) {
        const R = W / 2 - 40; for (let i = 0; i < v.logs; i++) { const t = (2 * PI * i) / v.logs, x = cx + m.cos(t) * R, y = cy + m.sin(t) * R; a.cyl(x, y, Z0, Z0 + (i % 3 === 0 ? H : H * 0.88), 40, 10); a.circ(x, y, 40, 'EQUIP-DETAIL'); }
        lathe(a, cx, cy, Z0, [[0, 0], [R, 0], [R, H * 0.4], [R * 0.55, H * 0.55], [0, H * 0.58]], 28); a.circ(cx, cy, R, 'EQUIP-DETAIL');
        a.cone(cx + R * 0.2, cy - R * 0.2, Z0 + H * 0.55, Z0 + H * 0.55 + 90, 38, 50, 12); a.tube([[cx - R * 0.35, cy - R * 0.3, Z0 + H * 0.5], [cx - R * 0.25, cy - R * 0.3, Z0 + H * 0.5 + 120]], [6, 6], 6); a.box(cx - R * 0.25 - 30, cy - R * 0.3 - 4, Z0 + H * 0.5 + 120, cx - R * 0.25 + 30, cy - R * 0.3 + 4, Z0 + H * 0.5 + 180);
        a.outline('EQUIP-HIDDEN'); return a.log('Added the ring of half-log posts, the sand fill with mound, a bucket and a spade (plan and 3D).');
      }
      a.outline(); const bt = 38, hb = H * 0.8;
      a.box(X0, YF, Z0, X1, YF + bt, Z0 + hb); a.box(X0, -bt, Z0, X1, 0, Z0 + hb); a.box(X0, YF + bt, Z0, X0 + bt, -bt, Z0 + hb); a.box(X1 - bt, YF + bt, Z0, X1, -bt, Z0 + hb);
      const sd = 230; for (const [sx, sy] of [[X0, YF], [X1 - sd, YF], [X0, -sd], [X1 - sd, -sd]]) { prismX(a, [[sy + (sy < 0 ? 0 : 0), Z0], [sy + sd, Z0], [sy + sd, Z1], [sy, Z0 + hb]], sx, sx + sd); a.rect(sx, sy, sx + sd, sy + sd, 'EQUIP-DETAIL'); }
      lathe(a, cx, cy, Z0 + 6, [[0, 0], [W * 0.38, 0], [W * 0.3, hb * 0.3], [W * 0.12, hb * 0.55], [0, hb * 0.6]], 24); a.box(X0 + bt, YF + bt, Z0 + 4, X1 - bt, -bt, Z0 + hb * 0.5);
      a.rect(X0 + bt, YF + bt, X1 - bt, -bt, 'EQUIP-DETAIL'); a.log('Added the four edge boards, the corner seat blocks and the sand fill with mound (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic floor cushion and pouf',
    desc: (v) => ({ sq: 'Square floor cushion: a rounded pillow shape with a centre button and a carry loop at one edge.', pouf: 'Round pouf: a drum with rounded edges, a top seam and a strap handle on top.', bean: 'Bean bag seat: a tapered rounded bag with a flat base, a fold at the top and a grab loop.' })[v.kind],
    vs: [['square cushion, 20 in', 20, 20, 6, 0, { kind: 'sq' }], ['round pouf, 24 in x 12 in', 24, 24, 13, 0, { kind: 'pouf' }], ['bean bag, 30 in', 30, 30, 22, 0, { kind: 'bean' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy, W, D, H } = a;
      if (v.kind === 'sq') { rbox(a, X0, YF, Z0, X1, 0, Z1, 60); sph(a, cx, cy, Z1 - 20, 22, 8, 5); a.tube([[cx - 50, 0 - 12, Z0 + 40], [cx - 50, -4, Z0 + 40 + 40], [cx + 50, -4, Z0 + 40 + 40], [cx + 50, 0 - 12, Z0 + 40]].map(([x, y, z]) => [x, y, z]), [5, 5, 5, 5], 6); a.rect(X0 + 40, YF + 40, X1 - 40, -40, 'EQUIP-DETAIL'); a.circ(cx, cy, 22, 'EQUIP-DETAIL'); a.outline(); }
      else if (v.kind === 'pouf') { const R = W / 2, r = 70, hh = H - 28; lathe(a, cx, cy, Z0, [[0, 0], [R - r, 0], [R - r * 0.3, r * 0.1], [R, r * 0.6], [R, hh - r * 0.6], [R - r * 0.3, hh - r * 0.1], [R - r, hh], [0, hh]], 28); a.tube([[cx - 90, cy, Z0 + hh - 2], [cx - 70, cy, Z1 - 4], [cx + 70, cy, Z1 - 4], [cx + 90, cy, Z0 + hh - 2]], [8, 8, 8, 8], 8); a.circ(cx, cy, R); a.circ(cx, cy, R - r, 'EQUIP-DETAIL'); }
      else { const R = W / 2; lathe(a, cx, cy, Z0, [[0, 0], [R * 0.55, 0], [R * 0.9, H * 0.12], [R, H * 0.35], [R * 0.92, H * 0.62], [R * 0.6, H * 0.84], [R * 0.3, H * 0.9], [0, H * 0.88]], 26); a.tube([[cx - 40, cy, Z0 + H * 0.88], [cx - 30, cy, Z1 - 3], [cx + 30, cy, Z1 - 3], [cx + 40, cy, Z0 + H * 0.88]], [9, 9, 9, 9], 8); a.circ(cx, cy, R); a.circ(cx, cy, R * 0.55, 'EQUIP-DETAIL'); }
      a.log('Added the ' + (v.kind === 'sq' ? 'rounded cushion with button and loop' : v.kind === 'pouf' ? 'drum body with strap handle' : 'tapered bag with grab loop') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic stackable nap cot',
    desc: (v) => `${v.n === 1 ? 'Single nap cot' : `Stack of ${v.n} nap cots`}: a tube frame with four legs, a taut fabric bed with raised side edges, two end rails and floor feet.${v.n > 1 ? ' Each cot rests on the one below with legs offset.' : ''}`,
    vs: [['single cot, 52 x 23 in', 52, 23, 6, 0, { n: 1 }], ['stack of 3 cots, 52 x 23 in', 52, 23, 12, 0, { n: 3 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, cx, cy } = a, lg = 90, rr = 13;
      for (let k = 0; k < v.n; k++) {
        const z0 = Z0 + k * 64, zr = z0 + lg, yw = (a.D - 40) / 2;
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const x = cx + sx * (a.W / 2 - 40), y = cy + sy * yw; a.tube([[x, y, z0 + (k ? 0 : 0)], [x, y, zr]], [rr, rr], 8); a.cyl(x, y, z0 - 0, z0 + 6, 16, 8); a.circ(x, y, rr, 'EQUIP-HIDDEN'); }
        for (const sy of [-1, 1]) a.tube([[cx - a.W / 2 + 40, cy + sy * yw, zr], [cx + a.W / 2 - 40, cy + sy * yw, zr]], [rr, rr], 8);
        for (const sx of [-1, 1]) a.tube([[cx + sx * (a.W / 2 - 40), cy - yw, zr], [cx + sx * (a.W / 2 - 40), cy + yw, zr]], [rr, rr], 8);
        a.box(X0 + 30, YF + 20, zr + rr - 6, X1 - 30, -20, zr + rr + 10); a.box(X0 + 30, YF + 20, zr + rr + 10, X1 - 30, YF + 34, zr + rr + 44); a.box(X0 + 30, -34, zr + rr + 10, X1 - 30, -20, zr + rr + 44);
        a.line(X0 + 30, YF + 27, X1 - 30, YF + 27, 'EQUIP-DETAIL');
      }
      a.outline(); a.rect(X0 + 30, YF + 20, X1 - 30, -20, 'EQUIP-DETAIL'); a.log('Added the tube frame with legs and end rails, the fabric bed with raised edges' + (v.n > 1 ? ' and the stacking of ' + v.n + ' cots' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic children art easel',
    desc: (v) => `${v.tab ? 'Tabletop' : 'Floor-standing'} double-sided easel: an A-frame of two tube legs pairs spread front and back, a board on each side with a paper clip bar and a ledge tray, and a cross brace between the legs.`,
    vs: [['tabletop, 24 in high', 24, 20, 24, 0, { tab: true }], ['floor standing, 48 in high', 28, 30, 48, 0, { tab: false }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy } = a, tz = Z1 - 20, bw = a.W - 100, bh = a.H * 0.6;
      a.outline('EQUIP-DETAIL');
      for (const sx of [-1, 1]) { const x = cx + sx * (a.W / 2 - 30); a.tube([[x, YF + 30, Z0 + 6], [x, cy, tz]], [14, 14], 8); a.tube([[x, -30, Z0 + 6], [x, cy, tz]], [14, 14], 8); a.tube([[x, YF + 30, Z0 + 6], [x, -30, Z0 + 6]], [13, 13], 8); a.cyl(x, YF + 30, Z0, Z0 + 8, 20, 8); a.cyl(x, -30, Z0, Z0 + 8, 20, 8); a.circ(x, YF + 30, 14, 'EQUIP-HIDDEN'); a.circ(x, -30, 14, 'EQUIP-HIDDEN'); a.line(x, YF + 30, x, -30, 'EQUIP-DETAIL'); }
      a.xcyl(cx - a.W / 2 + 30, cx + a.W / 2 - 30, cy, tz, 14, 8); a.xcyl(cx - a.W / 2 + 30, cx + a.W / 2 - 30, cy, Z0 + a.H * 0.32, 11, 8);
      for (const sg of [-1, 1]) {
        const yb = sg < 0 ? YF + 56 : -56, yt = cy + (sg < 0 ? -20 : 20), zt = tz - 40, zb2 = zt - bh;
        const poly = sg < 0 ? [[yb, zb2], [yt - 8, zt], [yt + 8, zt], [yb + 16, zb2]] : [[yt - 8, zt], [yt + 8, zt], [yb, zb2], [yb - 16, zb2]];
        const pp = sg < 0 ? [[yb, zb2], [yb + 16, zb2], [yt + 8, zt], [yt - 8, zt]] : [[yb - 16, zb2], [yb, zb2], [yt + 8, zt], [yt - 8, zt]]; void poly;
        prismX(a, pp, cx - bw / 2, cx + bw / 2); a.box(cx - bw / 2 - 6, yb + sg * (sg < 0 ? -2 : 2) - (sg < 0 ? 0 : 60), zb2 - 22, cx + bw / 2 + 6, yb + (sg < 0 ? 60 : 0) + sg * 0, zb2 - 6);
        a.box(cx - bw * 0.4, yt - 20, zt - 4, cx + bw * 0.4, yt + 20, zt + 12);
      }
      a.rect(cx - bw / 2, YF + 40, cx + bw / 2, -40, 'EQUIP'); a.log('Added the A-frame legs with feet and braces, a board on each side with a ledge tray, and the paper clip bars (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic mini trampoline',
    desc: (v) => `Round mini trampoline, ${v.dia} in: a steel tube frame ring on six legs with rubber feet, a jump mat fixed by coiled springs all round, a padded cover over the springs${v.bar ? ' and a T-shaped handle bar on two uprights' : ''}.`,
    vs: [['36 in', 36, 36, 9, 0, { dia: 36 }], ['40 in', 40, 40, 9, 0, { dia: 40 }], ['48 in with handle bar', 48, 48, 36, 0, { dia: 48, bar: true }]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W } = a, R = W / 2 - 8, fz = Z0 + 190, n = 24;
      a.circ(cx, cy, R); ring(a, cx, cy, fz, R - 40, 11, 36, 6); a.circ(cx, cy, R - 40, 'EQUIP-DETAIL');
      for (let i = 0; i < 6; i++) { const t = (2 * PI * i) / 6 + 0.26, x = cx + (R - 40) * m.cos(t), y = cy + (R - 40) * m.sin(t), xf = cx + (R - 5) * m.cos(t), yf = cy + (R - 5) * m.sin(t); a.tube([[x, y, fz], [xf, yf, Z0 + 12]], [10, 10], 8); a.cyl(xf, yf, Z0, Z0 + 14, 20, 8); a.circ(xf, yf, 20, 'EQUIP-HIDDEN'); }
      a.cyl(cx, cy, fz - 8, fz - 3, R - 120, 32); for (let i = 0; i < n; i++) { const t = (2 * PI * i) / n, x1 = cx + (R - 42) * m.cos(t), y1 = cy + (R - 42) * m.sin(t), x2 = cx + (R - 118) * m.cos(t), y2 = cy + (R - 118) * m.sin(t); a.tube([[x1, y1, fz - 5], [x2, y2, fz - 5]], [3.5, 3.5], 5); }
      lathe(a, cx, cy, fz - 6, [[R, 0], [R, 18], [R - 80, 22], [R - 80, 14]], 36, 0, 2 * PI, false); lathe(a, cx, cy, fz - 6, [[R - 80, 22], [R, 18]], 36, 0, 2 * PI, false);
      if (v.bar) { const bx = cx + (R - 40), zt = Z1 - 24; for (const s of [-1, 1]) a.tube([[cx + s * 160, cy + R - 60, fz], [cx + s * 160, cy + R - 60, zt]], [11, 11], 8); a.tube([[cx - 160, cy + R - 60, zt], [cx + 160, cy + R - 60, zt]], [13, 13], 8); void bx; a.xcyl(cx - 130, cx + 130, cy + R - 60, zt, 17, 10); }
      a.log('Added the frame ring with six legs and feet, the mat, the coiled springs, the padded cover' + (v.bar ? ' and the handle bar on two uprights' : '') + ' (plan and 3D).');
    } }),
];

export default [...classroom, ...lab, ...models, ...play];

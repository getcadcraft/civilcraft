/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, educational: classroom furniture, school laboratory, teaching models, early-years and sports-hall play. Original geometry; generic by type and size class. */
import { fam, cab, tbl, pull } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = m.PI;

// ------------------------------------------------------------------------------------------ helpers
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
/** a solid of revolution about a vertical axis at (cx, cy): prof is [[radius, height above z0], …] bottom to top; optional end caps */
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
/** a flat horizontal ring (tube loop) */
function ring(a, cx, cy, z, R, r, n = 18, seg = 6) { const pts = []; for (let i = 0; i <= n; i++) { const t = (2 * PI * i) / n; pts.push([cx + R * m.cos(t), cy + R * m.sin(t), z]); } a.tube(pts, pts.map(() => r), seg); }
function sph(a, x, y, z, r, nu = 14, nv = 8) { a.ell(x, y, z, r, r, r, nu, nv); }
function whl(a, x, y, r, w = 20, z = null) { const zc = z ?? a.Z0 + r; a.xcyl(x - w / 2, x + w / 2, y, zc, r, 16); a.xcyl(x - w / 2 - 2, x + w / 2 + 2, y, zc, r * 0.45, 10); a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL'); }
/** a four-legged plastic-shell chair facing −Y, seat spanning y0..y1 (y0 front), back at y1 */
function chair(a, o) {
  const { cx, y0, y1, sw, sh, bh, dz = 0, r = 11 } = o, Z0 = a.Z0 + dz;
  a.box(cx - sw / 2, y0, Z0 + sh - 28, cx + sw / 2, y1, Z0 + sh);
  a.xcyl(cx - sw / 2 + 8, cx + sw / 2 - 8, y0 + 12, Z0 + sh - 14, 14, 8);
  a.box(cx - sw / 2 + 10, y1 - 34, Z0 + sh + 40, cx + sw / 2 - 10, y1 - 8, Z0 + sh + bh - 14);
  a.xcyl(cx - sw / 2 + 24, cx + sw / 2 - 24, y1 - 21, Z0 + sh + bh - 14, 14, 8);
  for (const s of [-1, 1]) {
    const x = cx + s * (sw / 2 - 34);
    a.tube([[x, y1 - 30, Z0], [x, y1 - 26, Z0 + sh], [x, y1 - 20, Z0 + sh + bh - 14]], [r, r, r], 8);
    a.tube([[x, y0 + 34, Z0], [x, y0 + 34, Z0 + sh - 28]], [r, r], 8);
    a.tube([[x, y0 + 34, Z0 + sh * 0.3], [x, y1 - 30, Z0 + sh * 0.3]], [r * 0.7, r * 0.7], 6);
    a.circ(x, y0 + 34, r, 'EQUIP-HIDDEN'); a.circ(x, y1 - 30, r, 'EQUIP-HIDDEN');
  }
  a.tube([[cx - sw / 2 + 34, y1 - 30, Z0 + sh * 0.45], [cx + sw / 2 - 34, y1 - 30, Z0 + sh * 0.45]], [r * 0.7, r * 0.7], 6);
  a.rect(cx - sw / 2, y0, cx + sw / 2, y1, 'EQUIP-DETAIL'); a.line(cx - sw / 2 + 10, y1 - 21, cx + sw / 2 - 10, y1 - 21, 'EQUIP-DETAIL');
}

// ------------------------------------------------------------------------------------------ classroom
const classroom = [
  fam({ cat: 'educational/classroom', title: 'Generic combination school desk and chair',
    desc: (v) => `Student desk with the seat fixed on a tubular steel frame: a ${v.dh} in desk top with a book shelf under it, a shaped seat and back, floor runners and a pencil groove. Seat height ${v.sh} in.`,
    vs: [['kindergarten, 11 in seat', 24, 30, 27, 0, { sh: 11, dh: 19 }], ['primary, 14 in seat', 26, 32, 30, 0, { sh: 14, dh: 23 }], ['middle school, 16 in seat', 28, 34, 32, 0, { sh: 16, dh: 26 }], ['secondary, 18 in seat', 30, 36, 34, 0, { sh: 18, dh: 29 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, cx, W, D } = a, sh = v.sh * IN, dh = v.dh * IN, sd = m.min(D * 0.4, 380), sy0 = YF + 30, sy1 = sy0 + sd, dy0 = YF + D * 0.42;
      a.outline();
      a.box(X0 + 20, dy0, Z0 + dh - 22, X1 - 20, -20, Z0 + dh); a.box(X0 + 20, -20, Z0 + dh, X1 - 20, -8, Z0 + dh + 12);
      a.rect(X0 + 20, dy0, X1 - 20, -20, 'EQUIP-DETAIL'); a.line(X0 + 40, -50, X1 - 40, -50, 'EQUIP-DETAIL');
      a.box(X0 + 90, dy0 + 60, Z0 + dh - 150, X1 - 90, -60, Z0 + dh - 142); for (const x of [X0 + 90, X1 - 98]) a.box(x, dy0 + 60, Z0 + dh - 142, x + 8, -60, Z0 + dh - 100); a.box(X0 + 90, -68, Z0 + dh - 142, X1 - 90, -60, Z0 + dh - 100);
      a.rect(X0 + 90, dy0 + 60, X1 - 90, -60, 'EQUIP-HIDDEN');
      const sw = W * 0.7; a.box(cx - sw / 2, sy0 + 40, Z0 + sh - 24, cx + sw / 2, sy1, Z0 + sh); a.xcyl(cx - sw / 2 + 6, cx + sw / 2 - 6, sy1 - 10, Z0 + sh - 12, 12, 8);
      a.box(cx - sw / 2 + 10, sy0, Z0 + sh + 70, cx + sw / 2 - 10, sy0 + 24, Z0 + sh + 360); a.rect(cx - sw / 2, sy0, cx + sw / 2, sy1, 'EQUIP-DETAIL');
      for (const s of [-1, 1]) {
        const x = cx + s * (W / 2 - 55);
        a.tube([[x, sy0 + 12, Z0 + sh + 240], [x, sy0 + 12, Z0 + sh - 10], [x, sy0 + 80, Z0 + sh - 20], [x, dy0 + 60, Z0 + dh - 40]], [11, 11, 11, 11], 8);
        a.tube([[x, sy0 + 40, Z0 + 20], [x, sy0 + 40, Z0 + sh - 20]], [11, 11], 8);
        a.tube([[x, -60, Z0 + 20], [x, -60, Z0 + dh - 22]], [11, 11], 8);
        a.tube([[x, sy0 + 40, Z0 + 20], [x, -60, Z0 + 20]], [12, 12], 8);
        a.circ(x, sy0 + 40, 11, 'EQUIP-HIDDEN'); a.circ(x, -60, 11, 'EQUIP-HIDDEN');
      }
      a.log('Added the desk top with a pencil groove, the book shelf, the shaped seat and back, and the tubular frame with floor runners (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic classroom table',
    desc: (v) => v.round ? `Round classroom table on a single pedestal with a cast foot, top ${v.w} in across.` : `Rectangular classroom table ${v.w} in by ${v.d} in with edge band, apron and four legs${v.shelf ? ' and an under-table book shelf' : ''}.`,
    vs: [['rectangular, 48 x 24 in, 20 in high', 48, 24, 20, 0, {}], ['rectangular, 60 x 30 in, 26 in high', 60, 30, 26, 0, {}], ['rectangular, 72 x 30 in with book shelf, 29 in high', 72, 30, 29, 0, { shelf: 6 }], ['round, 42 in, 24 in high', 42, 42, 24, 0, { round: true }]],
    build: (a, v) => {
      if (v.round) tbl(a, { round: true, base: 'pedestal', topT: 32 });
      else { tbl(a, { base: 'legs', topT: 30, apron: 70, shelf: v.shelf ? v.shelf * IN : 0 }); for (const sx of [-1, 1]) for (const sy of [0, 1]) a.cyl(a.cx + sx * (a.W / 2 - 60), sy ? -60 : a.YF + 60, a.Z0, a.Z0 + 10, 20, 10); }
      a.log('Added the top, apron, legs and floor glides (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic stacking classroom chair',
    desc: (v) => `Plastic shell chair with a ${v.sh} in seat, curved back panel and four tube legs with stretchers${v.tab ? ', and a writing tablet arm on the right' : ''}.`,
    vs: [['12 in seat', 14, 16, 24, 0, { sh: 12 }], ['14 in seat', 15, 17, 27, 0, { sh: 14 }], ['16 in seat', 16, 18, 31, 0, { sh: 16 }], ['18 in seat with tablet arm', 26, 20, 34, 0, { sh: 18, tab: true }]],
    build: (a, v) => {
      const sh = v.sh * IN, sw = (v.tab ? v.w - 10 : v.w) * IN * 0.95;
      const cx = v.tab ? a.X0 + sw / 2 + 10 : a.cx;
      chair(a, { cx, y0: a.YF + 20, y1: -20, sw, sh, bh: a.H - sh - 20 });
      if (v.tab) {
        const px = cx + sw / 2 + 20;
        a.tube([[px, -150, a.Z0 + sh], [px, -150, a.Z0 + sh + 190]], [10, 10], 8); a.box(px - 10, a.YF + 150, a.Z0 + sh + 190, a.X1 - 10, -60, a.Z0 + sh + 212); a.rect(px - 10, a.YF + 150, a.X1 - 10, -60, 'EQUIP-DETAIL');
        a.tube([[px, -150, a.Z0 + sh + 190], [px, -100, a.Z0 + sh + 205]], [10, 10], 6);
      }
      a.outline('EQUIP-DETAIL'); a.log('Added the seat shell, back panel, tube legs with stretchers' + (v.tab ? ' and the tablet arm' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic wall whiteboard',
    desc: (v) => `${v.w} by ${v.h} in markerboard in an aluminium frame with a marker tray, three markers and an eraser${v.cork ? ', and a pinboard wing on each side' : ''}.`,
    vs: [['48 x 36 in', 48, 3, 36, 36, {}], ['72 x 48 in', 72, 3, 48, 36, {}], ['96 x 48 in', 96, 3, 48, 36, {}], ['120 x 48 in with pinboard wings', 168, 3, 48, 36, { cork: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1 } = a, wing = v.cork ? 24 * IN : 0, bx0 = X0 + wing, bx1 = X1 - wing, t = 28;
      a.outline();
      a.box(bx0, -22, Z0 + 40, bx1, 0, Z1); a.frame(bx0, Z0 + 40, bx1, Z1, -30, 0, 22); a.rect(bx0, -30, bx1, 0, 'EQUIP-DETAIL');
      a.box(bx0 + 60, YF, Z0, bx1 - 60, -30, Z0 + 14); a.box(bx0 + 60, YF, Z0 + 14, bx1 - 60, YF + 10, Z0 + 40); a.box(bx0 + 60, -34, Z0 + 14, bx1 - 60, -30, Z0 + 46);
      a.rect(bx0 + 60, YF, bx1 - 60, -30, 'EQUIP-DETAIL');
      for (let i = 0; i < 3; i++) a.xcyl(bx0 + 200 + i * 130, bx0 + 200 + i * 130 + 120, YF + 40, Z0 + 14 + 9, 9, 8);
      a.box(bx1 - 400, YF + 30, Z0 + 14, bx1 - 280, YF + 90, Z0 + 14 + 30);
      if (v.cork) for (const [x0, x1] of [[X0, bx0], [bx1, X1]]) { a.frame(x0, Z0 + 40, x1, Z1, -26, 0, 14); a.box(x0 + 14, -20, Z0 + 54, x1 - 14, -2, Z1 - 14); a.rect(x0, -26, x1, 0, 'EQUIP-DETAIL'); }
      a.log('Added the aluminium frame, board face, marker tray with markers and eraser' + (v.cork ? ' and pinboard wings' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic mobile flip-over whiteboard',
    desc: (v) => `Double-sided ${v.bw} by ${v.bh} in markerboard on two uprights with pivot knobs, T-shaped feet on casters and a marker tray on each side.`,
    vs: [['36 x 48 in board', 44, 24, 74, 0, { bw: 36, bh: 48 }], ['48 x 36 in board, wide', 56, 26, 70, 0, { bw: 48, bh: 36 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx } = a, bw = v.bw * IN, bh = v.bh * IN, zc = Z0 + 1180 - (v.bh === 36 ? 40 : 0);
      for (const s of [-1, 1]) {
        const x = cx + s * (bw / 2 + 36);
        a.tube([[x, YF / 2, Z0 + 140], [x, YF / 2, Z1 - 40]], [24, 24], 10); a.tube([[x, YF + 60, Z0 + 120], [x, -60, Z0 + 120]], [26, 26], 8);
        a.caster(x, YF + 60, 110); a.caster(x, -60, 110); a.xcyl(x - (s > 0 ? 0 : 50), x + (s > 0 ? 50 : 0), YF / 2, zc, 30, 10);
        a.circ(x, YF / 2, 24, 'EQUIP'); a.line(x, YF + 60, x, -60, 'EQUIP-DETAIL');
      }
      a.box(cx - bw / 2, YF / 2 - 14, zc - bh / 2, cx + bw / 2, YF / 2 + 14, zc + bh / 2); a.frame(cx - bw / 2 - 6, zc - bh / 2 - 6, cx + bw / 2 + 6, zc + bh / 2 + 6, YF / 2 - 18, YF / 2 + 18, 14);
      for (const y of [YF / 2 - 70, YF / 2 + 70]) a.box(cx - bw / 2 + 40, y - 40, zc - bh / 2 - 22, cx + bw / 2 - 40, y + 40, zc - bh / 2 - 8);
      a.rect(cx - bw / 2 - 6, YF / 2 - 18, cx + bw / 2 + 6, YF / 2 + 18, 'EQUIP-DETAIL');
      a.log('Added the framed double-sided board, uprights with pivot knobs, trays and T-feet on casters (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic teaching lectern',
    desc: (v) => v.top ? 'Tabletop lectern with a sloped reading surface, a book stop at the lower edge and a closed base.' : `Floor lectern with a sloped reading surface and book stop, a closed body with a shelf, a plinth${v.mic ? ' and a gooseneck microphone arm' : ''}.`,
    vs: [['floor, 24 in wide', 24, 20, 46, 0, {}], ['floor with microphone arm, 28 in wide', 28, 22, 48, 0, { mic: true }], ['tabletop, 24 in wide', 24, 18, 14, 0, { top: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx } = a;
      a.outline();
      if (v.top) {
        prismX(a, [[YF + 20, Z0 + 40], [-20, Z0 + 40], [-20, Z0 + 150], [YF + 20, Z1 - 20]], X0 + 10, X1 - 10);
        a.box(X0 + 10, -20, Z0 + 150, X1 - 10, 0, Z0 + 160); prismX(a, [[YF + 20, Z1 - 20], [-20, Z0 + 150], [-20, Z0 + 150 + 20], [YF + 20, Z1]], X0, X1);
        a.box(X0, YF, Z0 + 150, X1, YF + 14, Z0 + 150 + 8); a.box(X0, -20, Z0 + 150, X1, -6, Z0 + 150 + 26); a.box(X0 + 20, YF + 20, Z0, X1 - 20, -20, Z0 + 40);
      } else {
        const ph = 110;
        a.box(X0 + 20, YF + 40, Z0, X1 - 20, -20, Z0 + ph); a.rect(X0 + 20, YF + 40, X1 - 20, -20, 'EQUIP-HIDDEN');
        prismX(a, [[YF + 60, Z0 + ph], [-40, Z0 + ph], [-40, Z1 - 230], [YF + 60, Z1 - 330]].map(([y, z]) => [y, z]), X0 + 40, X1 - 40);
        a.box(X0 + 40, YF + 70, Z0 + ph + 30, X1 - 40, YF + 74 + 20, Z0 + ph + 34 + 380);
        a.box(X0 + 55, YF + 74, Z0 + 420, X1 - 55, -50, Z0 + 440); a.line(X0 + 55, YF + 74, X1 - 55, YF + 74, 'EQUIP-DETAIL');
        prismX(a, [[YF + 20, Z1 - 70], [-30, Z1 - 160], [-30, Z1 - 120], [YF + 20, Z1]], X0, X1);
        a.box(X0, YF, Z1 - 70, X1, YF + 14, Z1 - 70 + 40); a.box(X0, -30, Z1 - 160, X1, -10, Z1 - 120 + 30);
        a.rect(X0, YF + 20, X1, -30, 'EQUIP-DETAIL'); a.line(X0, YF + 40, X1, YF + 40, 'EQUIP-DETAIL');
        if (v.mic) { a.tube([[X1 - 90, -70, Z1 - 140], [X1 - 90, -70, Z1 - 20], [X1 - 100, -140, Z1 + 0.1]].map(([x, y, z]) => [x, y, m.min(z, Z1 - 4)]), [7, 7, 7], 6); a.ell(X1 - 100, -150, Z1 - 20, 14, 10, 14, 8, 5); a.circ(X1 - 90, -70, 8, 'EQUIP-DETAIL'); }
      }
      a.log('Added the sloped reading surface with book stop, body, shelf and plinth (plan and 3D).');
    } }),
  fam({ cat: 'educational/classroom', title: 'Generic school locker bank',
    desc: (v) => `Steel locker bank, ${v.cols} columns by ${v.tiers} tier${v.tiers > 1 ? 's' : ''} (${v.cols * v.tiers} doors), each with top and bottom vent slots, a latch handle and a number plate, on a recessed base${v.slope ? ', with a sloped top' : ''}.`,
    vs: [['single tier, 3 wide', 36, 15, 78, 0, { cols: 3, tiers: 1 }], ['single tier, 6 wide, sloped top', 72, 15, 78, 0, { cols: 6, tiers: 1, slope: true }], ['two tier, 4 wide', 48, 15, 78, 0, { cols: 4, tiers: 2 }], ['four tier, 3 wide', 36, 12, 66, 0, { cols: 3, tiers: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1 } = a, base = 100, top = v.slope ? 150 : 0, cw = a.W / v.cols, th = (a.H - base - top) / v.tiers;
      a.outline(); a.box(X0 + 20, YF + 30, Z0, X1 - 20, -10, Z0 + base);
      a.box(X0, YF, Z0 + base, X1, 0, Z1 - top);
      if (v.slope) prismX(a, [[YF, Z1 - top], [0, Z1 - top], [0, Z1 - 20], [YF, Z1 - top + 40]], X0, X1);
      for (let c = 0; c < v.cols; c++) for (let t = 0; t < v.tiers; t++) {
        const x0 = X0 + c * cw + 4, x1 = X0 + (c + 1) * cw - 4, z0 = Z0 + base + t * th + 4, z1 = Z0 + base + (t + 1) * th - 4;
        a.box(x0, YF - 6, z0, x1, YF, z1); a.rect(x0, YF - 6, x1, YF, 'EQUIP-DETAIL');
        for (let k = 0; k < 3; k++) { const zk = z1 - 40 - k * 16; a.box(x0 + 40, YF - 9, zk, x1 - 40, YF - 5, zk + 6); }
        for (let k = 0; k < 3; k++) { const zk = z0 + 30 + k * 16; a.box(x0 + 40, YF - 9, zk, x1 - 40, YF - 5, zk + 6); }
        const hz = z0 + (z1 - z0) * (v.tiers > 1 ? 0.55 : 0.6); a.box((x0 + x1) / 2 - 12, YF - 20, hz - 50, (x0 + x1) / 2 + 12, YF - 6, hz + 50); a.box((x0 + x1) / 2 - 12, YF - 20, hz - 50, (x0 + x1) / 2 + 12, YF - 6, hz - 40);
        a.box((x0 + x1) / 2 - 30, YF - 9, z1 - 120, (x0 + x1) / 2 + 30, YF - 6, z1 - 90);
      }
      a.log('Added the recessed base, doors with vent slots, latch handles and number plates' + (v.slope ? ', and the sloped top' : '') + ' (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ laboratory
const lab = [
  fam({ cat: 'educational/laboratory', title: 'Generic school lab bench',
    desc: (v) => `${v.wall ? 'Wall' : 'Island'} science bench, ${v.w} in long, resin top with a drip edge, ${v.sinks} sink${v.sinks > 1 ? 's' : ''} with gooseneck taps, a ${v.wall ? 'back' : 'centre'} service spine with gas taps and sockets, base cabinets with doors${v.shelf ? ' and a reagent shelf above' : ''}.`,
    vs: [['island for 4 students, 72 in', 72, 36, 50, 0, { sinks: 1, taps: 4 }], ['island for 6 students, 96 in', 96, 40, 50, 0, { sinks: 2, taps: 6 }], ['island for 8 students, 120 in', 120, 42, 50, 0, { sinks: 2, taps: 8 }], ['wall bench with reagent shelf, 96 in', 96, 30, 77, 0, { sinks: 1, taps: 4, wall: true, shelf: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, cx, W, D } = a, topZ = Z0 + 914, cy = v.wall ? -160 : a.cy;
      a.outline();
      a.box(X0, YF, topZ - 38, X1, 0, topZ); a.box(X0, YF, topZ, X1, YF + 8, topZ + 10); a.rect(X0 + 10, YF + 10, X1 - 10, -10, 'EQUIP-DETAIL');
      const cabW = 640; a.box(X0 + 30, YF + 50, Z0 + 100, X0 + 30 + cabW, -30, topZ - 38); a.box(X1 - 30 - cabW, YF + 50, Z0 + 100, X1 - 30, -30, topZ - 38);
      for (const x0 of [X0 + 30, X1 - 30 - cabW]) {
        a.box(x0 + 8, YF + 38, Z0 + 108, x0 + cabW / 2 - 3, YF + 50, topZ - 46); a.box(x0 + cabW / 2 + 3, YF + 38, Z0 + 108, x0 + cabW - 8, YF + 50, topZ - 46);
        pull(a, 'bar', x0 + cabW / 2 - 50, topZ - 200, YF + 38); pull(a, 'bar', x0 + cabW / 2 + 50, topZ - 200, YF + 38);
        a.rect(x0, YF + 38, x0 + cabW, -30, 'EQUIP-HIDDEN');
        if (!v.wall) { a.box(x0 + 8, -30, Z0 + 108, x0 + cabW / 2 - 3, -18, topZ - 46); a.box(x0 + cabW / 2 + 3, -30, Z0 + 108, x0 + cabW - 8, -18, topZ - 46); }
      }
      a.box(X0 + 30, YF + 50, Z0, X0 + 30 + cabW, -30, Z0 + 100); a.box(X1 - 30 - cabW, YF + 50, Z0, X1 - 30, -30, Z0 + 100);
      for (const x of [cx - 90 + (cx - 90) * 0, cx + 90]) { a.tube([[x, YF + 90, Z0], [x, YF + 90, topZ - 38]], [16, 16], 8); a.tube([[x, -70, Z0], [x, -70, topZ - 38]], [16, 16], 8); }
      a.tube([[cx - 90, YF + 90, Z0 + 140], [cx + 90, YF + 90, Z0 + 140]], [11, 11], 6);
      // service spine
      const sy = cy; a.box(X0 + 700, sy - 70, topZ, X1 - 700, sy + 70, topZ + 110); a.rect(X0 + 700, sy - 70, X1 - 700, sy + 70, 'EQUIP-DETAIL');
      const n = v.taps, span = W - 1500;
      for (let i = 0; i < n; i++) {
        const x = X0 + 750 + (span * (i + 0.5)) / n, s = i % 2 ? 1 : -1;
        a.cyl(x, sy + s * 70, topZ + 70, topZ + 130, 12, 8); a.xcyl(x - 22, x + 22, sy + s * 70, topZ + 135, 6, 6); a.box(x - 60, sy + s * 70 - (s > 0 ? 0 : 6), topZ + 20, x - 30, sy + s * 70 + (s > 0 ? 6 : 0), topZ + 60);
        a.circ(x, sy + s * 70, 12, 'EQUIP-DETAIL');
      }
      // sinks
      for (let k = 0; k < v.sinks; k++) {
        const x = v.sinks === 1 ? cx : (k ? X1 - 560 : X0 + 560);
        a.box(x - 200, cy - 150 + (v.wall ? 0 : 0), topZ, x + 200, cy + 150, topZ + 16); a.box(x - 170, cy - 120, topZ + 16, x + 170, cy + 120, topZ + 22);
        a.tube([[x, cy - 160, topZ + 10], [x, cy - 160, topZ + 300], [x, cy - 80, topZ + 340], [x, cy - 50, topZ + 300]], [11, 11, 9, 9], 8); a.circ(x, cy, 7, 'EQUIP-DETAIL'); a.rect(x - 200, cy - 150, x + 200, cy + 150, 'EQUIP-DETAIL');
      }
      if (v.shelf) { for (const x of [X0 + 40, X1 - 40]) a.box(x - 15, -150, topZ + 100, x + 15, -90, topZ + 1000); a.box(X0 + 40, -170, topZ + 650, X1 - 40, -50, topZ + 676); a.box(X0 + 40, -170, topZ + 1000, X1 - 40, -50, topZ + 1026); a.box(X0 + 40, -170, topZ + 1000 - 330, X1 - 40, -50, topZ + 1000 - 304); }
      a.log('Added the resin top, base cabinets with doors, sinks with gooseneck taps, the service spine with gas taps' + (v.shelf ? ' and the reagent shelf' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic teaching fume hood',
    desc: (v) => `${v.w} in fume hood: a base cabinet with doors, a work surface, an enclosure with a glass sash raised part way, an airfoil sill, side service fixtures, a light and a round exhaust collar on the plenum.`,
    vs: [['48 in wide', 48, 30, 90, 0, {}], ['60 in wide', 60, 30, 90, 0, {}], ['72 in wide', 72, 32, 92, 0, {}]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, W } = a, wt = 914, hood = 1500, t = 40;
      a.outline();
      a.box(X0, YF + 40, Z0 + 90, X1, 0, Z0 + wt - 40); a.box(X0 + 20, YF + 60, Z0, X1 - 20, -20, Z0 + 90); a.box(X0 - 0, YF + 40, Z0 + wt - 40, X1, 0, Z0 + wt);
      const nd = m.round(W / 480);
      for (let i = 0; i < nd; i++) { const x0 = X0 + 12 + (i * (W - 24)) / nd + 3, x1 = X0 + 12 + ((i + 1) * (W - 24)) / nd - 3; a.box(x0, YF + 28, Z0 + 100, x1, YF + 40, Z0 + wt - 52); pull(a, 'bar', (x0 + x1) / 2, Z0 + wt - 170, YF + 28); }
      a.rect(X0, YF + 28, X1, 0, 'EQUIP-DETAIL');
      const hz = Z0 + wt;
      for (const x of [X0, X1 - 150]) a.box(x, YF + 100, hz, x + 150, 0, hz + hood - 100);
      a.box(X0, -40, hz, X1, 0, hz + hood); a.box(X0, YF + 100, hz + hood - 400, X1, 0, hz + hood - 100 + 0);
      a.box(X0 + 150, YF + 100, hz + 250 - 250, X1 - 150, YF + 150, hz + 0.01 + 10);
      a.box(X0 + 150, YF + 80, hz + 10, X1 - 150, YF + 160, hz + 60);
      a.frame(X0 + 160, hz + 600, X1 - 160, hz + hood - 400 - 10, YF + 112, YF + 124, 30); a.box(X0 + 190, YF + 114, hz + 630, X1 - 190, YF + 122, hz + hood - 440);
      a.box(cx - 120, YF + 100, hz + 560, cx + 120, YF + 130, hz + 600);
      a.box(X0 + 160, YF + 100, hz + hood - 440, X1 - 160, YF + 160, hz + hood - 400);
      a.cone(cx, -150, hz + hood, Z1 - 1, 160, 140, 16); a.circ(cx, -150, 160, 'EQUIP-DETAIL');
      a.box(cx - 220, -260, Z1 - 160, cx + 220, -40, Z1 - 100); a.box(cx - 220, -260, hz + hood, cx + 220, -40, hz + hood + 30);
      a.box(X0 + 200, YF + 160, hz + hood - 440 - 60, X1 - 200, -80, hz + hood - 440);
      for (const s of [-1, 1]) { const x = s < 0 ? X0 + 60 : X1 - 60; a.cyl(x, YF + 60, hz + 400, hz + 450, 14, 8); a.xcyl(x - 20, x + 20, YF + 40, hz + 460, 7, 6); a.box(x - 25, YF + 20, hz + 600, x + 25, YF + 34, hz + 680); a.circ(x, YF + 60, 14, 'EQUIP-DETAIL'); }
      a.line(X0 + 150, YF + 120, X1 - 150, YF + 120, 'EQUIP-DETAIL'); a.rect(X0 + 150, YF + 100, X1 - 150, 0, 'EQUIP-HIDDEN');
      a.log('Added the base cabinet, work surface, side posts, sash with handle, airfoil sill, service fixtures and exhaust collar (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic school microscope',
    desc: (v) => `${v.kind === 'stereo' ? 'Stereo dissecting microscope on a pillar stand with a twin-eyepiece head, a stage plate and a boom arm' : `${v.eyes === 2 ? 'Binocular' : 'Monocular'} compound microscope: base, curved arm, stage with clips, ${v.eyes === 2 ? 'a twin-eyepiece head, ' : 'an inclined eyepiece tube, '}a three-objective nosepiece and coarse and fine focus knobs`}. Drawn as a plain shape at full size.`,
    vs: [['monocular compound, 11 in', 6, 8, 11, 0, { eyes: 1 }], ['binocular compound, 14 in', 7, 9, 14, 0, { eyes: 2 }], ['stereo dissecting, 10 in', 8, 9, 10, 0, { kind: 'stereo' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, W, D, H } = a;
      a.outline();
      if (v.kind === 'stereo') {
        a.box(X0 + 10, YF + 10, Z0, X1 - 10, -10, Z0 + 30); a.ell(cx, YF / 2, Z0 + 38, W * 0.42, D * 0.4, 14, 16, 4); a.cyl(cx, -D * 0.28, Z0 + 30, Z1 - 70, 12, 12); a.circ(cx, -D * 0.28, 12, 'EQUIP-DETAIL');
        a.cyl(cx, YF / 2, Z0 + 52, Z0 + 56, W * 0.3, 16); a.circ(cx, YF / 2, W * 0.3, 'EQUIP-DETAIL');
        a.box(cx - 15, -D * 0.28 - 90, Z0 + H * 0.45, cx + 15, -D * 0.28 + 10, Z0 + H * 0.45 + 24); a.box(cx - 40, YF + D * 0.2, Z0 + H * 0.5, cx + 40, -D * 0.28 - 90, Z0 + H * 0.5 + 34);
        a.box(cx - 55, YF + D * 0.18, Z0 + H * 0.5 - 110, cx + 55, YF + D * 0.42, Z0 + H * 0.5 + 100);
        for (const s of [-1, 1]) { a.tube([[cx + s * 28, YF + D * 0.3, Z0 + H * 0.5 + 100], [cx + s * 36, YF + D * 0.35, Z0 + H * 0.5 + 150], [cx + s * 50, YF + D * 0.5, Z1 - 20]], [18, 18, 20], 10); a.cyl(cx + s * 28, YF + D * 0.3, Z0 + H * 0.5 - 110, Z0 + H * 0.5 - 60, 22, 10); a.circ(cx + s * 28, YF + D * 0.3, 22, 'EQUIP-DETAIL'); }
        return a.log('Added the base and stage plate, pillar, boom arm, twin-eyepiece head and objective pods (plan and 3D).');
      }
      a.ell(cx, YF / 2, Z0 + 14, W * 0.46, D * 0.46, 14, 16, 4); a.box(cx - W * 0.4, YF * 0.9, Z0, cx + W * 0.4, -D * 0.08, Z0 + 28);
      const ay = -D * 0.18;
      a.tube([[cx, ay, Z0 + 28], [cx, ay - 10, Z0 + H * 0.3], [cx, ay - 60, Z0 + H * 0.58], [cx, ay - 30, Z0 + H * 0.82], [cx, ay + 55 - 80, Z1 - H * 0.12]].map(([x, y, z]) => [x, y, z]), [30, 30, 28, 26, 24], 10);
      a.box(cx - 24, ay - 40, Z0 + H * 0.18, cx + 24, ay + 40 - 10, Z0 + H * 0.4);
      a.box(cx - W * 0.36, YF * 0.88, Z0 + H * 0.4, cx + W * 0.36, ay - 10, Z0 + H * 0.4 + 14); a.rect(cx - W * 0.36, YF * 0.88, cx + W * 0.36, ay - 10, 'EQUIP-DETAIL');
      for (const s of [-1, 1]) a.box(cx + s * W * 0.2 - 3, YF * 0.7, Z0 + H * 0.4 + 14, cx + s * W * 0.2 + 3, YF * 0.45, Z0 + H * 0.4 + 24);
      a.circ(cx, YF * 0.72, 14, 'EQUIP-DETAIL'); a.cyl(cx, YF * 0.72, Z0 + 28, Z0 + H * 0.4, 6, 8);
      const hy = YF * 0.74, hz = Z0 + H * 0.82;
      a.tube([[cx, ay - 40, hz + 10], [cx, hy, hz - 60]], [30, 30], 12);
      a.cyl(cx, hy, Z0 + H * 0.4 + 40, hz - 50, 18, 12); a.cone(cx, hy, Z0 + H * 0.4 + 14, Z0 + H * 0.4 + 40, 10, 18, 10);
      const noseZ = hz - 80;
      a.cyl(cx, hy, noseZ, noseZ + 24, 40, 14); for (const k of [-1, 0, 1]) { const ox = cx + k * 26; a.cone(ox, hy, noseZ - (k === 0 ? 70 : 50), noseZ, 7 + (k === 0 ? 2 : 0), 14, 8); }
      if (v.eyes === 2) for (const s of [-1, 1]) { a.tube([[cx + s * 10, ay - 30, hz + 20], [cx + s * 45, ay - 80, hz + 70], [cx + s * 80, ay - 150, Z1 - 4]], [24, 22, 18], 10); } else a.tube([[cx, ay - 30, hz + 20], [cx, ay - 90, hz + 80], [cx, ay - 160, Z1 - 4]], [24, 22, 18], 10);
      for (const s of [-1, 1]) { a.xcyl(cx + s * (W * 0.05 + 12), cx + s * (W * 0.05 + 54), ay + 5, Z0 + H * 0.3, 32, 14); a.xcyl(cx + s * (W * 0.05 + 54), cx + s * (W * 0.05 + 82), ay + 5, Z0 + H * 0.3, 15, 12); }
      a.log('Added the horseshoe base, curved arm, stage with clips, nosepiece with three objectives, eyepiece tube and focus knobs (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic lab stool',
    desc: (v) => `${v.back ? 'Round lab stool, 30 in high, with a back hoop, ' : `Round lab stool, ${v.h} in high, `}a cushioned seat, four splayed tube legs and ${v.back ? 'a foot ring and a second ring at mid-height' : 'a foot ring'}.`,
    vs: [['18 in high', 14, 14, 18, 0, {}], ['24 in high', 15, 15, 24, 0, {}], ['30 in high with back', 17, 17, 36, 0, { back: true }]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W } = a, sz = Z0 + (v.back ? 30 : v.h) * IN, R = W / 2 - 30;
      a.ell(cx, cy, sz - 28, R, R, 28, 20, 5); a.cyl(cx, cy, sz - 60, sz - 40, R * 0.55, 14); a.circ(cx, cy, R); a.circ(cx, cy, R * 0.55, 'EQUIP-DETAIL');
      for (let i = 0; i < 4; i++) { const t = PI / 4 + (i * PI) / 2, xa = cx + m.cos(t) * R * 0.5, ya = cy + m.sin(t) * R * 0.5, xb = cx + m.cos(t) * (R * 0.85), yb = cy + m.sin(t) * (R * 0.85); a.tube([[xa, ya, sz - 50], [xb, yb, Z0 + 12]], [13, 13], 8); a.cyl(xb, yb, Z0, Z0 + 14, 18, 8); a.circ(xb, yb, 13, 'EQUIP-HIDDEN'); }
      ring(a, cx, cy, Z0 + (sz - Z0) * 0.38, R * 0.74, 8, 20, 6);
      if (v.back) { const bz = sz + 140; for (const s of [-1, 1]) a.tube([[cx + s * R * 0.7, cy + R * 0.7, sz - 40], [cx + s * R * 0.7, cy + R * 0.8, sz + 200]], [11, 11], 8); const pts = []; for (let i = 0; i <= 10; i++) { const t = PI * 0.15 + (PI * 0.7 * i) / 10; pts.push([cx + m.cos(t) * R * 0.8, cy + m.sin(t) * R * 0.8 + R * 0.05, sz + 190]); } a.tube(pts, pts.map(() => 11), 6); }
      a.log('Added the cushioned seat, splayed legs and foot ring' + (v.back ? ', back posts and the back hoop' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic emergency eyewash and shower',
    desc: (v) => v.kind === 'wall' ? 'Wall-mounted eyewash: a bowl with two spray heads, a push paddle and a supply pipe to the wall plate.' : v.kind === 'ped' ? 'Pedestal eyewash and face wash: a floor flange, a vertical riser, a bowl with two spray heads, a face-wash ring and a push paddle.' : 'Emergency shower with eyewash: floor flange, riser, a round shower head, a pull rod with a triangle handle, a bowl on a bracket and a push paddle.',
    vs: [['wall mounted', 14, 14, 12, 36, { kind: 'wall' }], ['pedestal', 20, 20, 44, 0, { kind: 'ped' }], ['shower and eyewash combination', 36, 28, 96, 0, { kind: 'combo' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy } = a;
      const bowl = (x, y, z, r) => { a.cone(x, y, z, z + 60, r * 0.6, r, 18); a.ring2 = null; a.circ(x, y, r); a.circ(x, y, r * 0.5, 'EQUIP-DETAIL'); for (const s of [-1, 1]) { a.cyl(x + s * r * 0.6, y, z + 60, z + 120, 7, 8); a.ell(x + s * r * 0.6, y, z + 125, 14, 14, 8, 8, 4); } };
      if (v.kind === 'wall') {
        a.box(X0 + 30, -14, Z0 - 0 + 10, X1 - 30, 0, Z1); a.rect(X0 + 30, -14, X1 - 30, 0, 'EQUIP-DETAIL');
        a.tube([[cx, -14, Z0 + 110], [cx, -60, Z0 + 110], [cx, a.YF / 2, Z0 + 60]], [12, 12, 12], 8); bowl(cx, a.YF / 2, Z0 + 20, 120);
        a.box(cx - 60, YF + 10, Z0 + 170, cx + 60, YF + 30, Z0 + 205); a.outline('EQUIP-HIDDEN');
      } else if (v.kind === 'ped') {
        a.cyl(cx, cy, Z0, Z0 + 14, 150, 18); a.circ(cx, cy, 150); a.cyl(cx, cy, Z0 + 14, Z0 + 760, 22, 12);
        bowl(cx, cy, Z0 + 760, 140); a.box(cx - 70, cy - 190 + 100, Z0 + 700, cx + 70, cy - 150 + 100, Z0 + 740); a.circ(cx, cy, 22, 'EQUIP-DETAIL');
        a.box(cx - 50, YF + 20, Z0 + 930, cx + 50, YF + 40, Z0 + 960); a.outline('EQUIP-HIDDEN');
      } else {
        const px = X0 + 260, py = cy;
        a.cyl(px, py, Z0, Z0 + 14, 200, 18); a.circ(px, py, 200); a.cyl(px, py, Z0 + 14, Z1 - 120, 26, 12); a.tube([[px, py, Z1 - 160], [px + 150, py, Z1 - 100], [px + 280, py, Z1 - 80]], [26, 22, 22], 10);
        const sx = px + 280; a.cone(sx, py, Z1 - 100, Z1 - 60, 40, 130, 20); a.circ(sx, py, 130);
        a.tube([[sx, py, Z1 - 100], [sx, py, Z1 - 520]], [5, 5], 6); a.tube([[sx - 70, py, Z1 - 520], [sx + 70, py, Z1 - 520], [sx, py, Z1 - 640], [sx - 70, py, Z1 - 520]], [5, 5, 5, 5], 6);
        const ex = px - 20; a.tube([[ex, py + 60, Z0 + 700], [ex, py + 60, Z0 + 900]], [10, 10], 8); bowl(ex, py + 120, Z0 + 900, 100); a.box(px - 50, py - 120, Z0 + 960, px + 50, py - 80, Z0 + 1000);
        a.cyl(px, py, Z0 + 700, Z0 + 740, 36, 12); a.outline('EQUIP-HIDDEN');
      }
      a.log('Added the supply pipe or riser, spray bowl with heads and the push paddle' + (v.kind === 'combo' ? ', shower head with pull rod and handle' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic retort stand with rings and clamp',
    desc: (v) => `Cast base plate with a ${v.h} in steel rod, ${v.rings} ring${v.rings > 1 ? 's' : ''} on boss heads${v.clamp ? ' and a burette clamp with two jaw arms' : ''}.`,
    vs: [['18 in rod, one ring', 13, 10, 20, 0, { h: 18, rings: 1 }], ['24 in rod, ring and clamp', 14, 10, 26, 0, { h: 24, rings: 1, clamp: true }], ['30 in rod, two rings and clamp', 15, 10, 32, 0, { h: 30, rings: 2, clamp: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx } = a, bx = X0 + 80, by = YF + 90;
      a.outline(); a.box(X0, YF, Z0, X1, 0, Z0 + 28); a.rect(X0 + 40, YF + 40, X1 - 40, -40, 'EQUIP-DETAIL');
      a.cyl(bx, -by * 0 - 80, Z0 + 28, Z0 + 28 + v.h * IN, 8, 10); a.circ(bx, -80, 8, 'EQUIP-DETAIL');
      const arm = (z, len, kind) => {
        a.box(bx - 14, -80 - 14, z - 14, bx + 14, -80 + 14, z + 14); a.cyl(bx + 20, -80, z - 8, z + 8, 7, 8);
        if (kind === 'ring') { a.xcyl(bx + 14, bx + 90, -80, z, 5, 6); ring(a, bx + 90 + 70, -80, z, 70, 5, 20, 6); a.circ(bx + 160, -80, 70, 'EQUIP-DETAIL'); }
        else { a.xcyl(bx + 14, bx + 60, -80, z, 6, 6); for (const s of [-1, 1]) a.tube([[bx + 60, -80, z], [bx + 130, -80 + s * 20, z], [bx + 150, -80 + s * 35, z]], [5, 4, 4], 6); a.box(bx + 58, -80 - 16, z - 16, bx + 74, -80 + 16, z + 16); }
      };
      for (let i = 0; i < v.rings; i++) arm(Z0 + 28 + (v.h * IN) * (0.45 + i * 0.22), 80, 'ring');
      if (v.clamp) arm(Z0 + 28 + v.h * IN * 0.85, 80, 'clamp');
      a.log('Added the base plate, rod, boss heads, rings' + (v.clamp ? ' and the burette clamp' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic science trolley',
    desc: (v) => `Push trolley with ${v.shelves} shelves with raised lips, four corner uprights, a push handle and four swivel casters${v.cab ? ', and a lockable cupboard on the lower shelf' : ''}.`,
    vs: [['2 shelf, 30 in', 30, 18, 34, 0, { shelves: 2 }], ['3 shelf, 30 in', 30, 18, 34, 0, { shelves: 3 }], ['3 shelf with cupboard, 36 in', 36, 20, 36, 0, { shelves: 3, cab: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx } = a, ch = 110, n = v.shelves;
      a.outline();
      for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, -40], [X1 - 40, -40]]) { a.tube([[x, y, Z0 + ch], [x, y, Z1 - 10]], [13, 13], 8); a.caster(x, y, ch); a.circ(x, y, 13, 'EQUIP-HIDDEN'); }
      for (let i = 0; i < n; i++) {
        const z = Z0 + ch + ((Z1 - 160 - Z0 - ch) * i) / (n - 1 || 1) + 20, top = i === n - 1; const zz = top ? Z1 - 160 : z;
        a.box(X0 + 14, YF + 14, zz, X1 - 14, -14, zz + 22);
        a.box(X0 + 14, YF + 14, zz + 22, X1 - 14, YF + 24, zz + 50); a.box(X0 + 14, -24, zz + 22, X1 - 14, -14, zz + 50); a.box(X0 + 14, YF + 24, zz + 22, X0 + 24, -24, zz + 50); a.box(X1 - 24, YF + 24, zz + 22, X1 - 14, -24, zz + 50);
      }
      a.rect(X0 + 14, YF + 14, X1 - 14, -14, 'EQUIP-DETAIL');
      a.tube([[X0 + 40, -40, Z1 - 10], [X0 + 40, -90, Z1 + 0.1], [X1 - 40, -90, Z1 + 0.1], [X1 - 40, -40, Z1 - 10]].map(([x, y, z]) => [x, y, m.min(z, Z1 - 5)]), [12, 12, 12, 12], 8);
      if (v.cab) { a.box(X0 + 30, YF + 30, Z0 + ch + 30, X1 - 30, -30, Z0 + ch + 30 + 330); a.box(X0 + 32, YF + 22, Z0 + ch + 36, cx - 3, YF + 30, Z0 + ch + 30 + 322); a.box(cx + 3, YF + 22, Z0 + ch + 36, X1 - 32, YF + 30, Z0 + ch + 30 + 322); pull(a, 'lock', cx - 20, Z0 + ch + 190, YF + 22); }
      a.log('Added the corner uprights, lipped shelves, push handle and casters' + (v.cab ? ' and the cupboard' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/laboratory', title: 'Generic flammable liquids safety cabinet',
    desc: (v) => `Double-wall steel cabinet, ${v.gal} gal class, ${v.doors === 2 ? 'two' : 'one'} self-closing door${v.doors === 2 ? 's' : ''} with a three-point handle, two side vent bungs, a raised sill and adjustable shelves.`,
    vs: [['22 gal class, 35 in', 23, 23, 44, 0, { gal: 22, doors: 1 }], ['45 gal class, 43 in', 43, 18, 65, 0, { gal: 45, doors: 2 }], ['90 gal class, 43 in', 43, 34, 65, 0, { gal: 90, doors: 2 }]],
    build: (a, v) => {
      cab(a, { doors: v.doors, toe: 0, pull: 'bar', lock: true, shelves: 2 });
      const { X0, X1, YF, Z1 } = a;
      for (const s of [X0, X1]) a.xcyl(s - (s === X0 ? 22 : 0), s + (s === X0 ? 0 : 22), YF + 120, Z1 - 140, 20, 10);
      a.box(X0 + 6, YF - 6, a.Z0 + 4, X1 - 6, YF, a.Z0 + 50); a.box(X0 + 8, YF - 2, a.Z1 - 40, X1 - 8, YF, a.Z1 - 6);
      a.log('Added the double-wall body, doors with handle and lock, sill, shelves and side vent bungs (plan and 3D).');
    } }),
];


// ------------------------------------------------------------------------------------------ models
const models = [
  fam({ cat: 'educational/models', title: 'Generic teaching globe',
    desc: (v) => v.floor ? `Floor globe, ${v.dia} in ball with raised land areas, a tilted axis rod, a meridian arc and a horizon ring on three splayed legs.` : `Desk globe, ${v.dia} in ball with raised land areas on a tilted axis, a meridian arc and a turned base.`,
    vs: [['desk, 8 in ball', 11, 11, 14, 0, { dia: 8 }], ['desk, 12 in ball', 15, 15, 19, 0, { dia: 12 }], ['desk, 16 in ball', 19, 19, 24, 0, { dia: 16 }], ['floor, 16 in ball on legs', 28, 28, 42, 0, { dia: 16, floor: true }]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W } = a, r = v.dia * IN / 2, tilt = 23.5 * PI / 180, zc = v.floor ? Z0 + a.H * 0.7 : Z0 + a.H * 0.55;
      const u = [m.sin(tilt), 0, m.cos(tilt)], w = [m.cos(tilt), 0, -m.sin(tilt)];
      sph(a, cx, cy, zc, r, 20, 12);
      const lands = [[0.3, 0.6, 0.5], [-0.5, 0.3, 0.6], [0.1, -0.2, 0.7], [-0.2, 0.7, 0.2], [0.6, 0.1, 0.4]];
      for (const [lx, lz, ly] of lands) { const L = m.hypot(lx, lz, ly); a.ell(cx + lx / L * r * 0.97, cy - m.abs(ly) / L * r * 0.97, zc + lz / L * r * 0.97, r * 0.22, r * 0.05, r * 0.2, 8, 5); }
      a.tube([[cx - u[0] * r * 1.18, cy, zc - u[2] * r * 1.18], [cx + u[0] * r * 1.2, cy, zc + u[2] * r * 1.2]], [r * 0.025, r * 0.025], 6);
      const R = r * 1.12, pts = []; for (let i = 0; i <= 24; i++) { const t = -PI / 2 + (PI * i) / 24; pts.push([cx + R * (m.cos(t) * w[0] + m.sin(t) * u[0]), cy, zc + R * (m.cos(t) * w[2] + m.sin(t) * u[2])]); }
      a.tube(pts, pts.map(() => r * 0.03), 6);
      const sx = pts[0][0], sz = pts[0][2];
      if (v.floor) {
        const hz = Z0 + a.H * 0.42, HR = r * 1.3; ring(a, cx, cy, hz, HR, 14, 24, 8);
        for (let i = 0; i < 3; i++) { const t = (2 * PI * i) / 3 + PI / 2; const x = cx + m.cos(t) * HR * 1.15, y = cy + m.sin(t) * HR * 1.15; a.tube([[cx + m.cos(t) * HR, cy + m.sin(t) * HR, hz], [x, y, Z0 + 12]], [14, 12], 8); a.cyl(x, y, Z0, Z0 + 12, 22, 10); a.circ(x, y, 22, 'EQUIP-HIDDEN'); }
        a.tube([[sx, cy, sz], [cx, cy, hz]], [r * 0.03, r * 0.03], 6); a.circ(cx, cy, HR);
      } else {
        a.tube([[sx, cy, sz], [cx, cy, Z0 + 60]], [r * 0.04, r * 0.05], 8); lathe(a, cx, cy, Z0, [[r * 0.9, 0], [r * 0.9, 12], [r * 0.55, 40], [r * 0.5, 60]], 24); a.circ(cx, cy, r * 0.9);
      }
      a.circ(cx, cy, r, 'EQUIP-DETAIL'); a.log('Added the ball with raised land areas, the tilted axis, meridian arc' + (v.floor ? ', horizon ring and three legs' : ' and turned base') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic solar system model',
    desc: (v) => `Orrery with a central sun, ${v.n} planet${v.n > 1 ? 's' : ''} on horizontal arms of different lengths around a central column${v.moon ? ', a ring on the sixth planet and a moon on a short arm' : ''}, on a round base.`,
    vs: [['tabletop, 4 planets', 18, 18, 14, 0, { n: 4 }], ['tabletop, 8 planets', 26, 26, 16, 0, { n: 8 }], ['floor standing, 8 planets with ring and moon', 48, 48, 60, 0, { n: 8, moon: true }]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W } = a, R = W / 2, baseH = 30, top = a.H;
      lathe(a, cx, cy, Z0, [[R * 0.95, 0], [R * 0.95, 26], [R * 0.7, baseH + 8], [R * 0.08, baseH + 14]], 28); a.circ(cx, cy, R * 0.95);
      const colH = top * 0.62; a.cyl(cx, cy, Z0 + baseH, Z0 + baseH + colH, R * 0.02 + 6, 10);
      const sunR = R * 0.13; sph(a, cx, cy, Z0 + baseH + colH + sunR * 0.4, sunR, 18, 10); a.circ(cx, cy, sunR, 'EQUIP-DETAIL');
      const pr = [0.35, 0.55, 0.6, 0.45, 1.0, 0.9, 0.7, 0.7].slice(0, v.n); const pl = pr.length;
      for (let i = 0; i < pl; i++) {
        const t = (2 * PI * i) / pl + 0.4, len = R * (0.28 + (0.62 * (i + 1)) / pl), z = Z0 + baseH + 30 + ((colH - 30) * (i + 1)) / (pl + 1), rr = R * 0.045 * pr[i] + R * 0.02;
        const px = cx + m.cos(t) * len, py = cy + m.sin(t) * len;
        a.tube([[cx, cy, z], [px, py, z]], [3, 3], 6); a.cyl(cx, cy, z - 4, z + 4, 8, 8); sph(a, px, py, z + rr * 0.6, rr, 12, 7); a.line(cx, cy, px, py, 'EQUIP-DETAIL'); a.circ(px, py, rr, 'EQUIP-DETAIL');
        if (v.moon && i === 5) { ring(a, px, py, z + rr * 0.6, rr * 1.8, 2.5, 18, 5); }
        if (v.moon && i === 2) { const mx = px + m.cos(t + 1.4) * rr * 3, my = py + m.sin(t + 1.4) * rr * 3; a.tube([[px, py, z + rr * 0.6], [mx, my, z + rr * 0.6]], [2, 2], 5); sph(a, mx, my, z + rr * 0.6, rr * 0.3, 8, 5); }
      }
      a.log('Added the base, central column, sun and ' + v.n + ' planets on arms (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic geometry solid',
    desc: (v) => v.kind === 'set' ? 'Tray holding six teaching solids (cube, cylinder, cone, square pyramid, triangular prism and sphere) in a lipped wooden tray.' : `Teaching solid, a ${v.label}, with a flat base so it stands on a desk.`,
    vs: [['cube, 2 in edge', 2, 2, 2, 0, { kind: 'cube' }], ['cylinder, 3 in diameter, 4 in high', 3, 3, 4, 0, { kind: 'cylinder' }], ['cone, 3 in diameter, 4 in high', 3, 3, 4, 0, { kind: 'cone' }], ['square pyramid, 4 in base, 4 in high', 4, 4, 4, 0, { kind: 'pyramid' }], ['triangular prism, 3 in sides, 5 in long', 3, 5, 2.6, 0, { kind: 'prism' }], ['sphere, 4 in diameter', 4, 4, 4, 0, { kind: 'sphere' }], ['set of six on a tray', 20, 10, 5, 0, { kind: 'set' }]],
    build: (a, v) => {
      const one = (kind, cx, cy, s, h) => {
        const Z0 = a.Z0, r = s / 2;
        if (kind === 'cube') { a.box(cx - r, cy - r, Z0, cx + r, cy + r, Z0 + s); a.rect(cx - r, cy - r, cx + r, cy + r); }
        else if (kind === 'cylinder') { a.cyl(cx, cy, Z0, Z0 + h, r, 24); a.circ(cx, cy, r); }
        else if (kind === 'cone') { a.cone(cx, cy, Z0, Z0 + h, r, 0.5, 24); a.circ(cx, cy, r); }
        else if (kind === 'pyramid') { a.box(cx - r, cy - r, Z0, cx + r, cy + r, Z0 + 6); const ap = [cx, cy, Z0 + h], c = [[cx - r, cy - r], [cx + r, cy - r], [cx + r, cy + r], [cx - r, cy + r]]; for (let i = 0; i < 4; i++) { const p = c[i], q = c[(i + 1) % 4]; a.t.push([[p[0], p[1], Z0 + 6], [q[0], q[1], Z0 + 6], ap]); } a.rect(cx - r, cy - r, cx + r, cy + r); a.line(cx - r, cy - r, cx + r, cy + r, 'EQUIP-DETAIL'); a.line(cx + r, cy - r, cx - r, cy + r, 'EQUIP-DETAIL'); }
        else if (kind === 'prism') { const L = h * 0, tri = [[cx - r, cy - r * 1.4], [cx + r, cy - r * 1.4], [cx, cy + r * 1.4]]; a.box(cx - r, cy - r * 1.4, Z0, cx + r, cy + r * 1.4, Z0 + 6); a.prism(tri, Z0 + 6, Z0 + s * 0.866); a.poly(tri); }
        else if (kind === 'sphere') { a.cyl(cx, cy, Z0, Z0 + 8, r * 0.35, 14); sph(a, cx, cy, Z0 + r + 6, r - 3, 20, 12); a.circ(cx, cy, r); }
      };
      if (v.kind === 'set') {
        a.outline(); a.box(a.X0, a.YF, a.Z0, a.X1, 0, a.Z0 + 12); a.box(a.X0, a.YF, a.Z0 + 12, a.X1, a.YF + 10, a.Z0 + 40); a.box(a.X0, -10, a.Z0 + 12, a.X1, 0, a.Z0 + 40);
        const xs = [-0.78, -0.46, -0.14, 0.18, 0.5, 0.82].map((f) => a.cx + f * a.W / 2), s = 60;
        const hh = a.H - 12;
        a.box(xs[0] - s / 2, a.cy - s / 2 + 0, a.Z0 + 12, xs[0] + s / 2, a.cy + s / 2, a.Z0 + 12 + s); a.cyl(xs[1], a.cy, a.Z0 + 12, a.Z0 + 12 + s * 1.2, s / 2, 20); a.cone(xs[2], a.cy, a.Z0 + 12, a.Z0 + 12 + s * 1.2, s / 2, 0.5, 20);
        const ap = [xs[3], a.cy, a.Z0 + 12 + s * 1.1], r = s / 2, c = [[xs[3] - r, a.cy - r], [xs[3] + r, a.cy - r], [xs[3] + r, a.cy + r], [xs[3] - r, a.cy + r]]; for (let i = 0; i < 4; i++) { const p = c[i], q = c[(i + 1) % 4]; a.t.push([[p[0], p[1], a.Z0 + 12], [q[0], q[1], a.Z0 + 12], ap]); }
        a.prism([[xs[4] - r, a.cy - r], [xs[4] + r, a.cy - r], [xs[4], a.cy + r]], a.Z0 + 12, a.Z0 + 12 + s * 0.9); sph(a, xs[5], a.cy, a.Z0 + 12 + r, r, 14, 8);
        for (const x of xs) a.circ(x, a.cy, r, 'EQUIP-DETAIL');
      } else { one(v.kind, a.cx, a.cy, v.w * IN, v.h * IN); }
      a.log('Added the ' + (v.kind === 'set' ? 'tray and six solids' : v.kind + ' solid') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic ball and stick molecule model',
    desc: (v) => `${v.mol} molecule model: ${v.atoms} spheres joined by round bonds on a short stem and a round base. Atom sizes differ by element.`,
    vs: [['water', 10, 10, 9, 0, { mol: 'water', atoms: 3 }], ['methane', 10, 10, 11, 0, { mol: 'methane', atoms: 5 }], ['carbon dioxide', 14, 8, 8, 0, { mol: 'carbon dioxide', atoms: 3 }], ['ammonia', 10, 10, 10, 0, { mol: 'ammonia', atoms: 4 }]],
    build: (a, v) => {
      const S = {
        water: [[[0, 0, 0, 1.0], [0.76, 0, 0.59, 0.6], [-0.76, 0, 0.59, 0.6]], [[0, 1], [0, 2]]],
        methane: [[[0, 0, 0, 0.9], [0.6, 0.6, 0.6, 0.55], [-0.6, -0.6, 0.6, 0.55], [-0.6, 0.6, -0.6, 0.55], [0.6, -0.6, -0.6, 0.55]], [[0, 1], [0, 2], [0, 3], [0, 4]]],
        'carbon dioxide': [[[0, 0, 0, 0.9], [1.3, 0, 0, 1.0], [-1.3, 0, 0, 1.0]], [[0, 1], [0, 2]]],
        ammonia: [[[0, 0, 0.2, 0.95], [0.75, 0.0, -0.4, 0.55], [-0.38, 0.65, -0.4, 0.55], [-0.38, -0.65, -0.4, 0.55]], [[0, 1], [0, 2], [0, 3]]],
      }[v.mol], atoms = S[0], bonds = S[1];
      const bx = a.X0 + 40, bz = a.Z0 + 60, ext = (k) => m.max(...atoms.map((p) => m.abs(p[k]) + p[3] * 0.5));
      const kx = (a.W / 2 - 40) / (ext(0) * 1.0 || 1), kz = (a.H - 90) / 2 / (ext(2) || 1), sc = m.min(kx, kz * 1.0, (a.D / 2 - 30) / (ext(1) || 1));
      const rs = sc * 0.5, zc = a.Z0 + 70 + (a.H - 70) / 2;
      lathe(a, a.cx, a.cy, a.Z0, [[a.W * 0.34, 0], [a.W * 0.34, 14], [a.W * 0.3, 20]], 24); a.circ(a.cx, a.cy, a.W * 0.34 > a.D / 2 - 5 ? a.D / 2 - 5 : a.W * 0.34);
      const P = atoms.map(([x, y, z, r]) => [a.cx + x * sc, a.cy + y * sc, zc + z * sc * 0.9, r * rs]);
      for (const [i, j] of bonds) { a.tube([[P[i][0], P[i][1], P[i][2]], [P[j][0], P[j][1], P[j][2]]], [rs * 0.14, rs * 0.14], 8); a.line(P[i][0], P[i][1], P[j][0], P[j][1], 'EQUIP-DETAIL'); }
      for (const p of P) { sph(a, p[0], p[1], p[2], p[3], 16, 9); a.circ(p[0], p[1], p[3], 'EQUIP-DETAIL'); }
      const low = P.reduce((q, p) => (p[2] < q[2] ? p : q)); a.tube([[a.cx, a.cy, a.Z0 + 20], [low[0], low[1], low[2]]], [6, 6], 8);
      a.outline('EQUIP-HIDDEN'); a.log('Added the base, support stem, atom spheres and bonds (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic DNA double helix model',
    desc: (v) => `Double helix on a round base and stem: two backbone strands wound ${v.turns} turns and ${v.rungs} cross rungs between them.`,
    vs: [['12 in, 1.5 turns', 6, 6, 12, 0, { turns: 1.5, rungs: 16 }], ['24 in, 3 turns', 8, 8, 24, 0, { turns: 3, rungs: 30 }], ['36 in, 4 turns on tripod', 14, 14, 38, 0, { turns: 4, rungs: 40, tri: true }]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W } = a, R = W * 0.3, h0 = Z0 + (v.tri ? 140 : 50), h1 = Z1 - 20, N = m.round(v.turns * 20);
      if (v.tri) { lathe(a, cx, cy, Z0, [[W * 0.45, 0], [W * 0.45, 14], [W * 0.1, 40], [12, 60]], 20); a.cyl(cx, cy, Z0 + 60, h0, 9, 10); a.circ(cx, cy, W * 0.45); }
      else { lathe(a, cx, cy, Z0, [[W * 0.45, 0], [W * 0.45, 18], [W * 0.35, 28]], 20); a.cyl(cx, cy, Z0 + 28, h0, 7, 10); a.circ(cx, cy, W * 0.45); }
      const hp = (k, t) => [cx + R * m.cos(t + k * PI), cy + R * m.sin(t + k * PI), h0 + ((h1 - h0) * t) / (2 * PI * v.turns)];
      for (const k of [0, 1]) { const pts = []; for (let i = 0; i <= N; i++) pts.push(hp(k, (2 * PI * v.turns * i) / N)); a.tube(pts, pts.map(() => R * 0.12), 6); }
      for (let i = 1; i < v.rungs; i++) { const t = (2 * PI * v.turns * i) / v.rungs; const p = hp(0, t), q = hp(1, t); a.tube([p, q], [R * 0.06, R * 0.06], 6); const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; sph(a, mx, my, p[2], R * 0.1, 8, 5); a.line(p[0], p[1], q[0], q[1], 'EQUIP-DETAIL'); }
      a.cyl(cx, cy, h0 - 10, h0, R * 0.9, 12); a.circ(cx, cy, R * 1.12, 'EQUIP-DETAIL'); a.log('Added the base, stem, two helical strands and the rungs (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic volcano cutaway model',
    desc: (v) => `Half-cone volcano model, ${v.w} in across, on a base board: the cut face shows a vertical conduit, a magma chamber and three rock layers, with a crater at the top.`,
    vs: [['16 in base', 16, 14, 11, 0, {}], ['24 in base', 24, 20, 16, 0, {}]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, W } = a, bt = 16, cy = YF + a.D * 0.5, R = W / 2 - 20, H = a.H - bt;
      a.outline(); a.box(X0, YF, Z0, X1, 0, Z0 + bt);
      const prof = [[R, 0], [R * 0.78, H * 0.2], [R * 0.5, H * 0.55], [R * 0.22, H * 0.93], [R * 0.17, H * 0.98], [R * 0.11, H * 0.93]];
      lathe(a, cx, cy, Z0 + bt, prof, 28, 0, PI, false);
      const cut = [[cx - R, Z0 + bt], [cx + R, Z0 + bt], [cx + R * 0.22, Z0 + bt + H * 0.93], [cx + R * 0.11, Z0 + bt + H * 0.93], [cx - R * 0.11, Z0 + bt + H * 0.93], [cx - R * 0.22, Z0 + bt + H * 0.93]];
      prismY(a, [[cx - R, Z0 + bt], [cx + R, Z0 + bt], [cx + R * 0.22, Z0 + bt + H * 0.93], [cx - R * 0.22, Z0 + bt + H * 0.93]], cy - 6, cy);
      a.ell(cx, cy - 2, Z0 + bt + H * 0.16, R * 0.45, 16, H * 0.14, 20, 8); a.box(cx - R * 0.07, cy - 12, Z0 + bt + H * 0.2, cx + R * 0.07, cy - 6, Z0 + bt + H * 0.95);
      for (const f of [0.3, 0.55, 0.75]) { const rr = R * (1 - 0.6 * f) + 0; a.box(cx - rr * 0.94, cy - 10, Z0 + bt + H * f - 5, cx - R * 0.1, cy - 6, Z0 + bt + H * f + 5); a.box(cx + R * 0.1, cy - 10, Z0 + bt + H * f - 5, cx + rr * 0.94, cy - 6, Z0 + bt + H * f + 5); }
      for (const [x, y] of [[-0.5, -0.6], [0.5, -0.4]]) a.ell(cx + x * R, cy + y * 0 + 0, Z0 + bt + 10, 18, 18, 10, 8, 4);
      a.arc(cx, cy, R, 0, 180, 'EQUIP-DETAIL'); a.line(cx - R, cy, cx + R, cy, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.15, 'EQUIP-DETAIL');
      a.log('Added the base board, the half cone with its crater, the cut face with magma chamber, conduit and rock layers (plan and 3D).');
    } }),
  fam({ cat: 'educational/models', title: 'Generic teaching skeleton on stand',
    desc: (v) => `${v.h} in skeleton model: skull with jaw, spine, ribcage rings, pelvis, arms and legs with joint spheres, on a pole with a five-arm base on casters.`,
    vs: [['full size, 66 in', 26, 24, 74, 0, { s: 1 }], ['half size, 34 in', 18, 16, 40, 0, { s: 0.5 }]],
    build: (a, v) => {
      const { cx, cy, Z0, Z1, W } = a, k = v.s, H = (a.H - 120 * k) , z = (f) => Z0 + 120 * k + f * H, ar = 14 * k + 4;
      for (let i = 0; i < 5; i++) { const t = (2 * PI * i) / 5 + PI / 2, x = cx + m.cos(t) * W * 0.42, y = cy + m.sin(t) * W * 0.42 * (a.D / a.W); a.tube([[cx, cy, Z0 + 70 * k], [x, y, Z0 + 60 * k]], [9 * k + 3, 9 * k + 3], 6); a.caster(x, y, 100 * k + 20); a.line(cx, cy, x, y, 'EQUIP-DETAIL'); }
      a.cyl(cx, cy, Z0 + 60 * k, z(0.45), 8 * k + 3, 10);
      a.box(cx - 12 * k, cy - 24 * k, z(0.4), cx + 12 * k, cy + 4, z(0.45));
      sph(a, cx, cy, z(0.935), 85 * k + 20, 14, 9); a.ell(cx, cy - 40 * k, z(0.91), 60 * k + 12, 40 * k + 12, 30 * k + 8, 10, 6); a.box(cx - 35 * k, cy - 70 * k, z(0.88), cx + 35 * k, cy - 20 * k, z(0.9));
      a.tube([[cx, cy, z(0.86)], [cx, cy, z(0.5)]], [14 * k + 4, 14 * k + 4], 8);
      for (let i = 0; i < 8; i++) { const f = 0.8 - i * 0.03, rw = (0.5 - i * 0.02 + (i < 3 ? i * 0.04 : 0)) * 150 * k + 40; a.ell(cx, cy - 22 * k, z(f), rw, 50 * k + 10, 6 * k + 3, 14, 4); }
      a.box(cx - 8 * k - 4, cy - 40 * k, z(0.73), cx + 8 * k + 4, cy - 30 * k, z(0.82));
      sph(a, cx - 90 * k - 10, cy, z(0.5), 55 * k + 10, 10, 6); sph(a, cx + 90 * k + 10, cy, z(0.5), 55 * k + 10, 10, 6); a.ell(cx, cy, z(0.5), 100 * k + 20, 40 * k + 10, 40 * k + 10, 12, 5);
      for (const s of [-1, 1]) {
        const sx = cx + s * 170 * k, ax = cx + s * 205 * k;
        sph(a, sx, cy, z(0.84), 24 * k + 5, 8, 5);
        a.tube([[sx, cy, z(0.84)], [ax, cy, z(0.62)], [ax + s * 10 * k, cy, z(0.46)]], [11 * k + 3, 9 * k + 3, 8 * k + 3], 8); sph(a, ax, cy, z(0.62), 15 * k + 4, 8, 5); sph(a, ax + s * 10 * k, cy, z(0.45), 13 * k + 3, 8, 5);
        const lx = cx + s * 80 * k;
        a.tube([[lx, cy, z(0.46)], [lx + s * 6 * k, cy, z(0.24)], [lx + s * 4 * k, cy, z(0.04)]], [17 * k + 4, 12 * k + 3, 10 * k + 3], 8); sph(a, lx + s * 6 * k, cy, z(0.24), 18 * k + 4, 8, 5); a.box(lx + s * 4 * k - 20 * k, cy - 70 * k, z(0.0), lx + s * 4 * k + 20 * k, cy + 15 * k, z(0.04));
        a.circ(lx, cy, 14 * k + 3, 'EQUIP-DETAIL');
      }
      a.circ(cx, cy, W * 0.42, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN'); a.log('Added the base with casters, pole, skull, spine, ribcage, pelvis, arms and legs (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ playground
const play = [
  fam({ cat: 'educational/playground', title: 'Generic early years sand and water table',
    desc: (v) => `${v.two ? 'Twin-trough' : 'Single-trough'} activity table with a ${v.fill} fill, a rim and a drain plug${v.lid ? ', and a fitted lid in two halves with finger grips' : ''}, on four splayed legs.`,
    vs: [['sand, 36 x 24 in, toddler height', 36, 24, 16, 0, { fill: 'sand', two: false, lid: true }], ['sand, 48 x 30 in', 48, 30, 20, 0, { fill: 'sand', two: false, lid: false }], ['water, 48 x 30 in with lid', 48, 30, 20, 0, { fill: 'water', two: false, lid: true }], ['sand and water twin trough, 60 x 30 in', 60, 30, 20, 0, { fill: 'sand and water', two: true, lid: false }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, W } = a, topT = 40, rz = Z1 - topT - 130;
      a.outline();
      const troughs = v.two ? [[X0 + 20, 0.5], [0.5, 1]] : [[0, 1]];
      const tx = v.two ? [[X0 + 20, a.cx - 15], [a.cx + 15, X1 - 20]] : [[X0 + 20, X1 - 20]];
      for (const [i, [x0, x1]] of tx.entries()) {
        const y0 = YF + 20, y1 = -20, z0 = Z1 - topT - 140;
        a.box(x0, y0, z0, x1, y1, z0 + 14); a.box(x0, y0, z0, x0 + 14, y1, Z1); a.box(x1 - 14, y0, z0, x1, y1, Z1); a.box(x0, y0, z0, x1, y0 + 14, Z1); a.box(x0, y1 - 14, z0, x1, y1, Z1);
        const sand = v.two ? i === 0 : v.fill === 'sand', surf = Z1 - (sand ? 40 : 55); a.box(x0 + 14, y0 + 14, z0 + 14, x1 - 14, y1 - 14, surf);
        if (!sand) a.rect(x0 + 40, y0 + 40, x1 - 40, y1 - 40, 'EQUIP-DETAIL'); else a.line(x0 + 30, y0 + 30, x1 - 30, y1 - 30, 'EQUIP-DETAIL');
        a.rect(x0, y0, x1, y1);
        a.cyl((x0 + x1) / 2, a.cy, z0 - 20, z0 + 2, 18, 10); a.circ((x0 + x1) / 2, a.cy, 18, 'EQUIP-HIDDEN');
        if (v.lid) { const mx = (x0 + x1) / 2; for (const [lx0, lx1] of [[x0 - 4, mx - 2], [mx + 2, x1 + 4]]) { a.box(lx0, y0 - 4, Z1 - 12, lx1, y1 + 4, Z1); } a.box(mx - 40, y0 + 30, Z1, mx - 6, y0 + 50, Z1 + 0.01); }
      }
      for (const [x, y] of [[X0 + 50, YF + 50], [X1 - 50, YF + 50], [X0 + 50, -50], [X1 - 50, -50]]) { a.tube([[x * 0.97, y * 0.95, Z0], [x, y, rz + 20]], [18, 15], 8); a.circ(x, y, 17, 'EQUIP-HIDDEN'); }
      a.tube([[X0 + 55, YF + 55, Z0 + 150], [X1 - 55, YF + 55, Z0 + 150]], [10, 10], 6); a.tube([[X0 + 55, -55, Z0 + 150], [X1 - 55, -55, Z0 + 150]], [10, 10], 6);
      a.log('Added the trough' + (v.two ? 's' : '') + ' with rim, fill, drain plug' + (v.lid ? ', lid halves' : '') + ' and splayed legs (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic picture book display shelf',
    desc: (v) => `Low display unit for early years: a frame with a back panel and ${v.rows} tilted book troughs with front lips${v.bins ? ', and a row of deep storage bins at the base' : ''}.`,
    vs: [['3 trough, 36 in wide', 36, 14, 30, 0, { rows: 3, bins: false }], ['4 trough with bins, 48 in wide', 48, 16, 42, 0, { rows: 4, bins: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx } = a, t = 18, bin = v.bins ? 230 : 0;
      a.outline(); a.box(X0, YF, Z0, X0 + t, 0, Z1); a.box(X1 - t, YF, Z0, X1, 0, Z1); a.box(X0, -12, Z0, X1, 0, Z1);
      a.box(X0, YF, Z0, X1, 0, Z0 + 50);
      const zz0 = Z0 + 50 + bin, zh = (Z1 - zz0 - 10) / v.rows;
      for (let i = 0; i < v.rows; i++) {
        const z = zz0 + i * zh; prismX(a, [[YF + 10, z + 30], [-12, z + 100], [-12, z + 120], [YF + 10, z + 50]], X0 + t, X1 - t);
        a.box(X0 + t, YF, z + 20, X1 - t, YF + 22, z + 70); a.box(X0 + t, YF, z + 20, X1 - t, YF + 22, z + 22);
        for (let k = 0; k < 7; k++) { const bx = X0 + t + 40 + k * ((X1 - X0 - 2 * t - 120) / 6); a.prism([[bx, YF + 40], [bx + 28, YF + 40], [bx + 28, -20], [bx, -20]], z + 40, z + 60 + zh * 0.25 + (k % 3) * 20); }
      }
      a.box(X0, YF, Z1 - 20, X1, 0, Z1);
      if (v.bins) { const n = 3, bw = (X1 - X0 - 2 * t) / n; for (let i = 0; i < n; i++) { const x0 = X0 + t + i * bw + 6, x1 = X0 + t + (i + 1) * bw - 6; a.box(x0, YF + 6, Z0 + 56, x1, YF + 20, Z0 + 50 + bin - 6); a.box((x0 + x1) / 2 - 50, YF - 4, Z0 + 50 + bin - 80, (x0 + x1) / 2 + 50, YF + 6, Z0 + 50 + bin - 50); } }
      a.rect(X0 + t, YF + 10, X1 - t, -12, 'EQUIP-DETAIL'); a.log('Added the frame, back panel, tilted troughs with lips and books' + (v.bins ? ' and the storage bins' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic reading nook',
    desc: (v) => v.arch ? `Reading nook with an arched back wall, two side wings, a cushioned bench seat and a low shelf on each side, ${v.w} in wide.` : `Reading nook with a back panel, a roof canopy on two posts, a floor cushion platform with a bolster and a book ledge, ${v.w} in wide.`,
    vs: [['arched, 48 in', 48, 30, 60, 0, { arch: true }], ['canopy, 60 in', 60, 40, 66, 0, { arch: false }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, W } = a;
      a.outline();
      if (v.arch) {
        const ar = W / 2 - 30, aw = 30; const pts = []; for (let i = 0; i <= 16; i++) { const t = (PI * i) / 16; pts.push([cx + ar * m.cos(PI - t), Z0 + a.H - ar + ar * m.sin(t) - 0]); }
        a.box(X0, -aw, Z0, X0 + 30, 0, Z1 - ar); a.box(X1 - 30, -aw, Z0, X1, 0, Z1 - ar);
        for (let i = 0; i < 16; i++) { const p = pts[i], q = pts[i + 1]; a.prism([[p[0], 0], [q[0], 0], [q[0], -aw], [p[0], -aw]], m.min(p[1], q[1]) - 20, m.max(p[1], q[1])); }
        a.box(X0 + 30, -aw, Z0 + 150, X1 - 30, 0, Z1 - ar + 40); for (const s of [-1, 1]) { a.box(cx + s * (W / 2 - 15) - 15, YF + 150, Z0, cx + s * (W / 2 - 15) + 15, 0, Z0 + 700); a.box(cx + s * (W / 2 - 15) - 15, YF + 150, Z0 + 700, cx + s * (W / 2 - 15) + 15, YF + 180, Z0 + 700 + 20); }
        a.box(X0 + 30, YF + 200, Z0 + 330, X1 - 30, -aw, Z0 + 400); a.ell(cx, (YF + 200 - aw) / 2, Z0 + 440, W / 2 - 80, (YF + 200 + aw) / -2 + 20, 55, 14, 6);
        a.box(X0 + 30, YF + 200, Z0, X1 - 30, YF + 220, Z0 + 330); for (const s of [-1, 1]) { a.box(cx + s * W * 0.32 - 120, -aw - 4, Z0 + 600, cx + s * W * 0.32 + 120, -aw, Z0 + 620); a.box(cx + s * W * 0.32 - 120, -aw - 60, Z0 + 590, cx + s * W * 0.32 + 120, -aw - 4, Z0 + 606); }
      } else {
        a.box(X0, -30, Z0 + 150, X1, 0, Z1 - 150); a.box(X0 + 5, YF + 100, Z0, X0 + 45, YF + 140, Z1); a.box(X1 - 45, YF + 100, Z0, X1 - 5, YF + 140, Z1);
        prismX(a, [[YF + 40, Z1 - 120], [0, Z1 - 120], [0, Z1 - 30], [YF + 40, Z1 - 80]], X0, X1); a.box(X0, YF + 40, Z1 - 80, X1, 0, Z1 - 50 + 0.01);
        a.box(X0 + 20, YF + 200, Z0, X1 - 20, -30, Z0 + 250); a.ell(cx, (YF + 200 - 30) / 2, Z0 + 300, W / 2 - 70, (-YF - 230) / 2 - 10, 70, 14, 6);
        a.ycyl(-200, -50, cx - W * 0.2, Z0 + 440, 70, 12); a.ycyl(-200, -50, cx + W * 0.2, Z0 + 440, 70, 12);
        a.box(X0 + 45, YF + 140, Z0 + 330, X1 - 45, YF + 170, Z0 + 350); for (let i = 0; i < 8; i++) a.box(X0 + 90 + i * (W - 260) / 7, YF + 142, Z0 + 350, X0 + 90 + i * (W - 260) / 7 + 36, YF + 168, Z0 + 350 + 150 + (i % 3) * 30);
      }
      a.rect(X0 + 30, YF + 200, X1 - 30, -20, 'EQUIP-DETAIL'); a.log('Added the back wall, side supports, bench cushion and book storage (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic indoor climbing frame with slide',
    desc: (v) => `Early years climber: a ${v.deck} in high platform with four posts and guard rails, a ladder of rungs up one side and a slide down the other${v.rail2 ? ', plus a rope-net side' : ''}.`,
    vs: [['toddler, 18 in deck', 60, 36, 40, 0, { deck: 18 }], ['small, 24 in deck', 76, 38, 48, 0, { deck: 24 }], ['medium, 36 in deck, rope net', 100, 44, 60, 0, { deck: 36, rail2: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx } = a, dz = Z0 + v.deck * IN, px0 = X0 + 20, px1 = X0 + 20 + 760 + (v.deck - 18) * 8;
      a.outline();
      const dw = px1 - px0, y0 = YF + 40, y1 = -30;
      for (const [x, y] of [[px0, y0], [px1, y0], [px0, y1], [px1, y1]]) { a.box(x - 25, y - 25, Z0, x + 25, y + 25, dz + 760 > Z1 ? Z1 : dz + 760); a.circ(x, y, 25, 'EQUIP-HIDDEN'); }
      a.box(px0 - 25, y0 - 25, dz - 40, px1 + 25, y1 + 25, dz);
      for (const f of [px0, px1]) { /* side rails */ }
      for (const y of [y0, y1]) for (const zz of [dz + 300, dz + 600]) a.box(px0, y - 10, zz - 15, px1, y + 10, zz + 15);
      for (const zz of [dz + 300, dz + 600]) { a.box(px0 - 10, y0, zz - 15, px0 + 10, y1, zz + 15); }
      for (let i = 0; i < 9; i++) a.box(px0 + 30 + i * ((dw - 60) / 8), y0, dz + 300, px0 + 38 + i * ((dw - 60) / 8), y0 + 4, dz + 600);
      for (let i = 0; i < 9; i++) a.box(px0 + 30 + i * ((dw - 60) / 8), y1 - 4, dz + 300, px0 + 38 + i * ((dw - 60) / 8), y1, dz + 600);
      // ladder on the right
      const lx = px1 + 110; a.tube([[lx - 130, a.cy, Z0 + 30], [px1 + 20, a.cy, dz - 20]], [14, 14], 8); a.tube([[lx + 130 - 130 + 0, a.cy, Z0 + 30], [px1 + 20, a.cy, dz - 20]], [14, 14], 8);
      for (let i = 1; i <= 5; i++) { const f = i / 6; a.tube([[lx - 130 + (px1 - lx + 150) * f - 0, y0 + 60, Z0 + 30 + (dz - 50 - Z0) * f], [lx - 130 + (px1 - lx + 150) * f, y1 - 60, Z0 + 30 + (dz - 50 - Z0) * f]], [10, 10], 6); }
      a.line(px1, y0, X1 - 20, y0, 'EQUIP-DETAIL'); a.line(px1, y1, X1 - 20, y1, 'EQUIP-DETAIL');
      // slide on the left
      const sx0 = X0 + 20, wid = 380; a.box(px0 - 10, a.cy - wid / 2, dz - 10, px0, a.cy + wid / 2, dz + 10);
      a.log('Added the corner posts, deck, guard rails and balusters, the rung ladder and the slide (plan and 3D).');
      prismY(a, [[X0 + 10, Z0 + 160], [px0 - 10, dz + 40], [px0 - 10, dz - 10], [X0 + 10, Z0 + 110]], a.cy - wid / 2, a.cy + wid / 2);
      for (const s of [-1, 1]) prismY(a, [[X0 + 10, Z0 + 160], [px0 - 10, dz + 40], [px0 - 10, dz + 130], [X0 + 10, Z0 + 240]], a.cy + s * (wid / 2) - (s > 0 ? 0 : 22), a.cy + s * (wid / 2) + (s > 0 ? 22 : 0));
      a.rect(X0 + 10, a.cy - wid / 2, px0 - 10, a.cy + wid / 2, 'EQUIP-DETAIL');
      if (v.rail2) { for (let i = 0; i < 6; i++) a.tube([[px0 + 30, y0 - 5, dz + 40 + i * 100], [px1 - 30, y0 - 5, dz + 40 + i * 100]], [3, 3], 4); for (let i = 0; i < 8; i++) a.tube([[px0 + 30 + i * (dw - 60) / 7, y0 - 5, dz + 40], [px0 + 30 + i * (dw - 60) / 7, y0 - 5, dz + 540]], [3, 3], 4); }
    } }),
  fam({ cat: 'educational/playground', title: 'Generic climbing arch',
    desc: (v) => `Climbing arch: two ${v.w} in curved tube legs with ${v.rungs} rungs across each leg and a top bar, on four floor feet.`,
    vs: [['small, 36 in', 36, 24, 30, 0, { rungs: 5 }], ['large, 60 in', 60, 30, 48, 0, { rungs: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, W } = a, R = W / 2 - 40;
      a.outline();
      for (const y of [YF + 50, -50]) {
        const pts = []; for (let i = 0; i <= 20; i++) { const t = (PI * i) / 20; pts.push([cx - R * m.cos(t), y, Z0 + 20 + (Z1 - Z0 - 40) * m.sin(t)]); }
        a.tube(pts, pts.map(() => 16), 8);
        for (const x of [cx - R, cx + R]) { a.box(x - 60, y - 40, Z0, x + 60, y + 40, Z0 + 20); }
        for (let i = 1; i <= v.rungs; i++) { const t = (PI / 2) * (i / (v.rungs + 1)); for (const s of [-1, 1]) { const x = cx + s * R * m.cos(t), z = Z0 + 20 + (Z1 - Z0 - 40) * m.sin(t); a.xcyl(x - 0, x + 0.01, y, z, 1, 3); } }
      }
      for (let i = 1; i <= v.rungs; i++) { const t = (PI / 2) * (i / (v.rungs + 1)); for (const s of [-1, 1]) { const x = cx + s * R * m.cos(t), z = Z0 + 20 + (Z1 - Z0 - 40) * m.sin(t); a.ycyl(YF + 50, -50, x, z, 11, 8); } }
      a.ycyl(YF + 50, -50, cx, Z1 - 22, 14, 8);
      a.line(cx - R, YF + 50, cx - R, -50); a.line(cx + R, YF + 50, cx + R, -50); a.log('Added the two curved legs, the rungs, the top bar and floor feet (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic low balance beam',
    desc: (v) => `Balance beam ${v.len} in long and 4 in wide on two splayed trestles, ${v.h} in high, with rubber end caps.`,
    vs: [['4 in high, 72 in', 72, 6, 5, 0, { len: 72, h: 4 }], ['12 in high, 96 in', 96, 6, 13, 0, { len: 96, h: 12 }], ['24 in high, 120 in', 120, 8, 25, 0, { len: 120, h: 24 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, cy } = a, bz = Z1 - 100;
      a.outline(); a.box(X0 + 10, cy - 50, bz, X1 - 10, cy + 50, Z1); a.box(X0, cy - 44, bz + 10, X0 + 10, cy + 44, Z1 - 10); a.box(X1 - 10, cy - 44, bz + 10, X1, cy + 44, Z1 - 10);
      a.box(X0 + 10, cy - 50, bz - 8, X1 - 10, cy + 50, bz);
      for (const x of [X0 + a.W * 0.17, X1 - a.W * 0.17]) { a.tube([[x, cy - 40, bz], [x, YF + 30, Z0 + 10]], [18, 18], 8); a.tube([[x, cy + 40, bz], [x, -30, Z0 + 10]], [18, 18], 8); a.box(x - 20, YF + 10, Z0, x + 20, -10, Z0 + 14); a.rect(x - 20, YF + 10, x + 20, -10, 'EQUIP-DETAIL'); }
      a.rect(X0 + 10, cy - 50, X1 - 10, cy + 50, 'EQUIP-DETAIL'); a.log('Added the beam with end caps and the two splayed trestles (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic stepping stone set',
    desc: (v) => `${v.n} domed stepping stones of different sizes, each with a non-slip rim and a flat base, laid out on a staggered path.`,
    vs: [['6 stones', 60, 18, 3, 0, { n: 6 }], ['9 stones', 84, 20, 3, 0, { n: 9 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, cy } = a;
      for (let i = 0; i < v.n; i++) {
        const r = 120 + (i % 3) * 25, x = X0 + r + 10 + (i * (a.W - 2 * r - 20)) / (v.n - 1), y = cy + (i % 2 ? 1 : -1) * (a.D * 0.18 + (i % 3) * 20);
        lathe(a, x, y, Z0, [[r, 0], [r, 20], [r * 0.92, 40], [r * 0.7, 62], [r * 0.3, 74]], 20); a.circ(x, y, r); a.circ(x, y, r * 0.7, 'EQUIP-DETAIL');
        a.cyl(x, y, Z0 + 62, Z0 + 76, r * 0.25, 12);
      }
      a.outline('EQUIP-HIDDEN'); a.log('Added the domed stones with rims and flat bases (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic sports hall vaulting box',
    desc: (v) => `${v.sec}-section vaulting box, ${v.h} in high: wooden frames stacked with a tapered profile, a padded top with a stitched edge and carry handles on the sides.`,
    vs: [['3 section, 36 in', 48, 24, 36, 0, { sec: 3 }], ['4 section, 48 in', 56, 28, 48, 0, { sec: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx } = a, topH = 90, fh = (a.H - topH) / v.sec;
      a.outline();
      for (let i = 0; i < v.sec; i++) { const inset = (v.sec - 1 - i) * 0 + i * 18, z0 = Z0 + i * fh, z1 = z0 + fh; const x0 = X0 + inset * 0.6 + 6, x1 = X1 - inset * 0.6 - 6, y0 = YF + inset * 0.6 + 6, y1 = -inset * 0.6 - 6; a.box(x0, y0, z0, x1, y0 + 25, z1); a.box(x0, y1 - 25, z0, x1, y1, z1); a.box(x0, y0, z0, x0 + 25, y1, z1); a.box(x1 - 25, y0, z0, x1, y1, z1); a.box(x0 + 5, y0 - 4, z1 - 14, x1 - 5, y1 + 4, z1); if (i > 0) a.line(x0, y0, x1, y0, 'EQUIP-DETAIL'); }
      const tz = Z1 - topH, ti = v.sec * 8; a.box(X0 + 4, YF + 4, tz + 20, X1 - 4, -4, Z1 - 20); a.ell(cx, a.cy, Z1 - 24, a.W / 2 - 4, a.D / 2 - 4, 24, 20, 5); a.box(X0 + 4, YF + 4, tz, X1 - 4, -4, tz + 24);
      for (const x of [X0, X1]) { a.box(x - (x > 0 ? 4 : -4) - 3, a.cy - 70, Z0 + fh * 1.2, x + (x > 0 ? -1 : 1) * 0, a.cy + 70, Z0 + fh * 1.2 + 24); }
      a.rect(X0 + 4, YF + 4, X1 - 4, -4, 'EQUIP-DETAIL'); a.log('Added the stacked frames, padded top with stitched edge and side handles (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic gym bench',
    desc: (v) => `Gym bench, ${v.len} in long, with a ${v.hook ? 'plain top and hooked ends to hang from wall bars' : 'plain top'}, two end frames and a floor rail between them.`,
    vs: [['plain, 96 in', 96, 11, 12, 0, { hook: false }], ['hooked ends, 120 in', 120, 11, 18, 0, { hook: true }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cy } = a, tz = Z0 + (v.hook ? 290 : 280);
      a.outline(); a.box(X0, YF, tz, X1, 0, tz + 36); a.box(X0 + 20, cy - 25, tz - 30, X1 - 20, cy + 25, tz);
      for (const x of [X0 + 120, X1 - 120]) { a.box(x - 20, YF + 8, Z0 + 20, x + 20, YF + 40, tz); a.box(x - 20, -40, Z0 + 20, x + 20, -8, tz); a.box(x - 25, YF, Z0, x + 25, 0, Z0 + 20); }
      a.box(X0 + 120, cy - 15, Z0 + 60, X1 - 120, cy + 15, Z0 + 90);
      if (v.hook) for (const s of [0, 1]) { const x = s ? X1 - 8 : X0 + 8; a.box(x - 8, cy - 60, tz - 120, x + 8, cy + 60, tz); a.tube([[x, cy - 60, tz - 120], [x, cy - 60, Z1 - 4]].map(([xx, y, z]) => [xx, y, m.min(z, Z1 - 4)]), [8, 8], 6); a.box(x - 8, cy - 70, tz - 130, x + 8, cy + 70, tz - 120); }
      a.rect(X0, YF, X1, 0, 'EQUIP-DETAIL'); a.log('Added the top, end frames, floor rail' + (v.hook ? ' and the hooked ends' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'educational/playground', title: 'Generic kids coat and bag unit',
    desc: (v) => `Cloakroom bench unit for early years: ${v.n} open bays each with a hook rail and a shelf, a seat bench with shoe storage below, and a name plate per bay.`,
    vs: [['6 bay, 48 in', 48, 15, 48, 0, { n: 6 }], ['8 bay, 64 in', 64, 15, 48, 0, { n: 8 }], ['10 bay, 80 in', 80, 15, 48, 0, { n: 10 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1 } = a, t = 18, bw = (a.W - t) / v.n, sz = Z0 + 330;
      a.outline(); a.box(X0, -t, Z0, X1, 0, Z1);
      a.box(X0, YF, sz - 30, X1, YF + 200 > -t ? -t : YF + 200, sz);
      for (let i = 0; i <= v.n; i++) { const x = X0 + i * bw; a.box(x, YF + 80, Z0, x + t, 0, Z1 - 520); }
      a.box(X0, YF + 150, Z0 + 20, X1, 0, Z0 + 40); a.box(X0, YF + 150, Z0 + 20, X0 + t, 0, sz); a.box(X1 - t, YF + 150, Z0 + 20, X1, 0, sz);
      for (let i = 0; i < v.n; i++) {
        const x0 = X0 + i * bw + t, x1 = X0 + (i + 1) * bw;
        a.box(x0 + 20, YF + 150, Z0 + 40, x1 - 20, -t - 40, Z0 + 260);
        a.box(x0, -t - 150, Z1 - 520 - 10, x1, 0, Z1 - 520); a.box(x0 - t, -t - 150, Z1 - 530, x1, -t - 140, Z1 - 520 + 20);
        a.box(x0 + 20, -t - 8, Z1 - 440, x1 - 20, -t - 0, Z1 - 420); a.cyl((x0 + x1) / 2 - 20, -t - 20, Z1 - 330, Z1 - 330 + 0.01, 0.01, 3); a.ycyl(-t - 40, -t, (x0 + x1) / 2 - 24, Z1 - 330, 8, 8); a.ycyl(-t - 40, -t, (x0 + x1) / 2 + 24, Z1 - 330, 8, 8);
        a.box((x0 + x1) / 2 - 40, -t - 2, Z1 - 200, (x0 + x1) / 2 + 40, -t, Z1 - 160);
      }
      a.box(X0, -t - 4, Z1 - 520 + 20, X1, -t, Z1 - 520 + 40);
      a.log('Added the back panel, hook bays with shelves, bench seat, shoe storage and name plates (plan and 3D).');
    } }),
];

export default [...classroom, ...lab, ...models, ...play];

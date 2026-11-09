/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, marine: original generic scale shapes (no maker, model or brand). */
import { fam } from './r4-kit.mjs';

const I = 25.4, m = Math, TAU = m.PI * 2;
const sg = (v) => (v < 0 ? -1 : 1);

// ------------------------------------------------------------------------------------------ helpers (copied patterns)
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
/** a lofted superellipse solid: stations [{y, x, rx, z0, z1}] (rounded body, cabin, tank, bus, pod). n = squareness (2 = ellipse, 4 = boxy) */
function sup(a, st, o = {}) {
  const seg = o.seg ?? 16, e = 2 / (o.n ?? 3);
  const rings = st.map((s) => { const zm = (s.z0 + s.z1) / 2, rz = (s.z1 - s.z0) / 2; return Array.from({ length: seg }, (_, k) => { const t = (k / seg) * TAU, c = m.cos(t), sn = m.sin(t); return [s.x + s.rx * sg(c) * m.abs(c) ** e, s.y, zm + rz * sg(sn) * m.abs(sn) ** e]; }); });
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < seg; k++) { const k2 = (k + 1) % seg; a.t.push([rings[i][k], rings[i + 1][k], rings[i + 1][k2]], [rings[i][k], rings[i + 1][k2], rings[i][k2]]); }
  for (const [ri, s] of [[0, st[0]], [rings.length - 1, st[st.length - 1]]]) { const c = [s.x, s.y, (s.z0 + s.z1) / 2]; for (let k = 0; k < seg; k++) a.t.push([c, rings[ri][k], rings[ri][(k + 1) % seg]]); }
  return a;
}
/** a plan outline polygon from stations (right side forward then left side back) */
function planOf(a, st, layer = 'EQUIP') { const R = st.map((s) => [s.x + s.rx, s.y]), L = st.map((s) => [s.x - s.rx, s.y]).reverse(); return a.poly([...R, ...L], layer); }
/** a wheel with tyre, rim, five spokes, hub cap, on a lateral axle at (x, y): radius r, tyre width w. Plan: the tread. */
function whl(a, x, y, r, w = 200, o = {}) {
  const z = o.z ?? a.Z0 + r, s = x >= a.cx ? 1 : -1, rr = r * (o.rim ?? 0.66), seg = o.seg ?? 18;
  a.tube([[x - w / 2, y, z], [x - w * 0.43, y, z], [x + w * 0.43, y, z], [x + w / 2, y, z]], [r * 0.8, r, r, r * 0.8], seg);
  a.xcyl(x - w * 0.46, x + w * 0.46, y, z, rr, 14);
  const xo = x + s * (w / 2 + 4);
  if (!o.plain) {
    a.xcyl(xo - 4, xo + 4, y, z, rr * 0.97, 14); a.xcyl(xo, xo + s * 10, y, z, rr * 0.28, 8);
    for (let k = 0; k < 5; k++) { const t = (k / 5) * TAU + 0.3; a.tube([[xo + s * 4, y, z], [xo + s * 6, y + m.cos(t) * rr * 0.9, z + m.sin(t) * rr * 0.9]], [rr * 0.1, rr * 0.07], 4); }
  }
  a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL');
}
function box2(a, x, y, z, w, d, h) { a.box(x - w / 2, y - d / 2, z, x + w / 2, y + d / 2, z + h); }
/** a post-and-rail run from (x0,y0) to (x1,y1) */
function rail(a, x0, y0, x1, y1, z0, z1, t = 14, posts = 3, rails = 1) {
  for (let r = 0; r < rails; r++) { const z = z1 - (rails > 1 ? ((z1 - z0) * 0.45 * r) / (rails - 1) : 0); a.tube([[x0, y0, z], [x1, y1, z]], [t, t], 6); }
  for (let i = 0; i < posts; i++) { const f = posts === 1 ? 0 : i / (posts - 1); a.tube([[x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z0], [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z1]], [t * 0.8, t * 0.8], 6); }
  a.line(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
/** an X-braced bay between two vertical lines at (xa,ya) and (xb,yb) from z0 to z1 */
function xbay(a, xa, ya, xb, yb, z0, z1, t = 8) { a.tube([[xa, ya, z0], [xb, yb, z1]], [t, t], 5); a.tube([[xb, yb, z0], [xa, ya, z1]], [t, t], 5); }
/** a closed tube loop (a tyre, a ring, a hoop) around axis 'z' | 'x' | 'y' */
function ring3(a, x, y, z, R, r, n = 14, ax = 'z') {
  const pts = []; for (let k = 0; k <= n; k++) { const t = (k / n) * TAU; pts.push(ax === 'z' ? [x + m.cos(t) * R, y + m.sin(t) * R, z] : ax === 'x' ? [x, y + m.cos(t) * R, z + m.sin(t) * R] : [x + m.cos(t) * R, y, z + m.sin(t) * R]); }
  a.tube(pts, pts.map(() => r), 6);
}
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
/**
 * A hull skin lofted over stations from y0 (bow, front) to y1 (stern). o.fn(f) -> { x, hb (half beam at the deck edge), zd (deck z), zk (keel z), p (section power: 1 = V, 2 = round, 4 = flat bottom) }.
 * o.open = wall thickness for an open boat (inner skin and a gunwale), else a deck cap closes the top. Returns the station rows.
 */
function hull(a, o) {
  const n = o.n ?? 16, np = o.np ?? 11, th = o.open ?? 0, S = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n, s = o.fn(f), y = o.y0 + (o.y1 - o.y0) * f, row = [], row2 = [];
    for (let k = 0; k < np; k++) { const t = -1 + (2 * k) / (np - 1), pw = s.p ?? 2; row.push([s.x + s.hb * t, y, s.zk + (s.zd - s.zk) * m.abs(t) ** pw]); if (th) { const hb2 = m.max(s.hb - th, 1), zk2 = s.zk + th; row2.push([s.x + hb2 * t, y, zk2 + m.max(s.zd - zk2, 1) * m.abs(t) ** pw]); } }
    S.push({ row, row2, s, y });
  }
  const quad = (p, q, r, t) => a.t.push([p, q, r], [p, r, t]);
  for (let i = 0; i < n; i++) for (let k = 0; k < np - 1; k++) {
    quad(S[i].row[k], S[i + 1].row[k], S[i + 1].row[k + 1], S[i].row[k + 1]);
    if (th) quad(S[i].row2[k], S[i + 1].row2[k], S[i + 1].row2[k + 1], S[i].row2[k + 1]);
  }
  for (let i = 0; i < n; i++) {
    if (th) { for (const k of [0, np - 1]) quad(S[i].row[k], S[i + 1].row[k], S[i + 1].row2[k], S[i].row2[k]); }
    else quad(S[i].row[0], S[i].row[np - 1], S[i + 1].row[np - 1], S[i + 1].row[0]);
  }
  if (th && o.cap) for (let i = 0; i < n; i++) if ((i + 1) / n <= o.cap) quad(S[i].row[0], S[i].row[np - 1], S[i + 1].row[np - 1], S[i + 1].row[0]);
  for (const i of [0, n]) { const r = S[i].row; if (S[i].s.hb < 8) continue; const c = [S[i].s.x, S[i].y, (S[i].s.zd + S[i].s.zk) / 2]; for (let k = 0; k < np - 1; k++) a.t.push([c, r[k], r[k + 1]]); }
  a.poly([...S.map((r) => [r.row[np - 1][0], r.y]), ...S.map((r) => [r.row[0][0], r.y]).reverse()]);
  return S;
}
/** the gunwale / sheer line points of a hull, side -1 or +1, raised by dz */
function sheer(S, side, dz = 0) { return S.map((r) => { const p = r.row[side > 0 ? r.row.length - 1 : 0]; return [p[0], p[1], p[2] + dz]; }); }
function sheerTube(a, S, dz = 12, r = 12) { for (const s of [-1, 1]) { const p = sheer(S, s, dz); a.tube(p, p.map(() => r), 6); } }
/** an outboard motor on a transom at (x, y), top of the mounting bracket at z */
function outboard(a, x, y, z, big = 1, leg = 700 * big) {
  sup(a, [{ y: y + 20, x, rx: 150 * big, z0: z, z1: z + 420 * big }, { y: y + 200 * big, x, rx: 190 * big, z0: z - 30, z1: z + 470 * big }, { y: y + 400 * big, x, rx: 150 * big, z0: z, z1: z + 400 * big }], { seg: 14, n: 2.6 });
  a.box(x - 60, y - 20, z - 60, x + 60, y + 70, z + 340 * big); a.tube([[x, y + 160 * big, z], [x, y + 160 * big, z - leg]], [95 * big, 80 * big], 10);
  a.ell(x, y + 160 * big, z - leg - 70 * big, 110 * big, 260 * big, 90 * big, 12, 7); a.box(x - 220 * big, y + 20, z - leg * 0.96, x + 220 * big, y + 440 * big, z - leg * 0.96 + 40);
  a.ell(x, y + 440 * big, z - leg - 70 * big, 40 * big, 70 * big, 40 * big, 8, 5);
  for (let k = 0; k < 3; k++) { const t = (k / 3) * TAU; a.tube([[x, y + 480 * big, z - leg - 70 * big], [x + m.cos(t) * 200 * big, y + 510 * big, z - leg - 70 * big + m.sin(t) * 200 * big]], [24, 12], 4); }
  a.box(x - 200 * big, y + 40, z + 450 * big - 60, x + 200 * big, y + 120, z + 450 * big - 20);
  a.rect(x - 190 * big, y, x + 190 * big, y + 400 * big, 'EQUIP-DETAIL'); a.circ(x, y + 160 * big, 95 * big, 'EQUIP-DETAIL');
}
/** a bench seat across the boat between two stations (x0..x1, y centre, z top) */
function bench(a, x0, x1, y, z, d = 280, t = 30, lh = 360) { a.box(x0, y - d / 2, z - t, x1, y + d / 2, z); a.box(x0 + 20, y - d / 2 + 30, z - lh, x0 + 60, y + d / 2 - 30, z - t); a.box(x1 - 60, y - d / 2 + 30, z - lh, x1 - 20, y + d / 2 - 30, z - t); a.rect(x0, y - d / 2, x1, y + d / 2, 'EQUIP-DETAIL'); }
/** an ellipse tube loop in the horizontal plane at height z */
function ellLoop(a, x, y, z, rx, ry, r = 12, n = 20) { const pts = []; for (let k = 0; k <= n; k++) { const t = (k / n) * TAU; pts.push([x + m.cos(t) * rx, y + m.sin(t) * ry, z]); } a.tube(pts, pts.map(() => r), 6); a.ellp(x, y, rx, ry, 'EQUIP-DETAIL'); }
/** a band of raised window panes on both sides of a house: x edge half-width hx, between y0..y1 and z0..z1, n panes with a gap */
function paneBand(a, cx, hx, y0, y1, z0, z1, n, gap = 24, th = 16) {
  for (const s of [-1, 1]) { const xa = cx + s * (hx - 4), xb = cx + s * (hx + th); a.box(xa, y0, z1, xb, y1, z1 + 26); a.box(xa, y0, z0 - 26, xb, y1, z0); for (let i = 0; i < n; i++) { const f0 = y0 + ((y1 - y0) * i) / n, f1 = y0 + ((y1 - y0) * (i + 1)) / n; a.box(xa, f0 + gap, z0 + gap, xb, f1 - gap, z1 - gap); } a.line(cx + s * hx, y0, cx + s * hx, y1, 'EQUIP-DETAIL'); }
}

const FAMS = [
  // ===================================================== boats =====================================================
  fam({ cat: 'marine/boats', title: 'Generic rowing dinghy',
    desc: (v) => `Rowing dinghy shape, ${v.ft} ft long: a rounded flat-bottomed open hull with a transom, a gunwale rail, a bow seat, ${v.thw} thwarts and a stern seat, two oarlocks on posts, a pair of oars stowed on the floor, a bow painter ring and a skeg.`,
    vs: [['8 ft', 56, 96, 20, 0, { ft: 8, thw: 1 }], ['10 ft', 60, 120, 21, 0, { ft: 10, thw: 2 }], ['12 ft', 66, 144, 22, 0, { ft: 12, thw: 2 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, B = W / 2 - 20;
      const fn = (f) => ({ x: cx, hb: B * (f < 0.3 ? m.sin((f / 0.3) * m.PI / 2) ** 0.7 : 1 - 0.18 * ((f - 0.3) / 0.7)), zd: Z0 + H * (0.74 + 0.26 * (1 - f) ** 2.2), zk: Z0 + 40 + H * 0.2 * (1 - f) ** 3, p: 3 });
      const S = hull(a, { y0: YF + 10, y1: YB - 10, open: 20, fn }); sheerTube(a, S, 14, 14);
      const Y = (f) => YF + 10 + (D - 20) * f, hb = (f) => fn(f).hb;
      const seats = v.thw === 1 ? [0.5] : [0.4, 0.62];
      for (const f of seats) bench(a, cx - hb(f) + 30, cx + hb(f) - 30, Y(f), fn(f).zd - 70, 250, 28, 100);
      bench(a, cx - hb(0.93) + 30, cx + hb(0.93) - 30, Y(0.93), fn(0.93).zd - 60, 300, 28, 100);
      prismY(a, [[cx - hb(0.15) + 20, fn(0.15).zd - 70], [cx + hb(0.15) - 20, fn(0.15).zd - 70], [cx + hb(0.15) - 60, fn(0.15).zd - 110], [cx - hb(0.15) + 60, fn(0.15).zd - 110]], Y(0.1), Y(0.2));
      for (const s of [-1, 1]) { const f = seats[seats.length - 1] - 0.03 + 0.0, x = cx + s * (hb(0.5) + 6), y = Y(0.5), z = fn(0.5).zd; a.cyl(x, y, z, z + 90, 15, 8); a.xcyl(x - 25 * s, x + 25 * s, y, z + 100, 20, 8); a.circ(x, y, 18, 'EQUIP-DETAIL'); a.tube([[cx + s * 140, YF + D * 0.2, Z0 + 90], [cx + s * 140, YB - D * 0.1, Z0 + 90]], [16, 16], 6); a.ell(cx + s * 140, YF + D * 0.16, Z0 + 90, 45, 100, 12, 8, 5); }
      a.box(cx - hb(0.5) * 0.3, Y(0.12), Z0 + 56, cx + hb(0.5) * 0.3, Y(0.9), Z0 + 72);
      for (let k = 0; k < 4; k++) a.line(cx - hb(0.5) * 0.3, Y(0.2 + k * 0.17), cx + hb(0.5) * 0.3, Y(0.2 + k * 0.17), 'EQUIP-DETAIL');
      a.box(cx - 10, Y(0.3), Z0 + 10, cx + 10, Y(0.9), Z0 + 42);
      ring3(a, cx, Y(0.02), fn(0.02).zd - 60, 40, 8, 10, 'x');
      a.log('Added the open hull with gunwale rail, bow, thwart and stern seats, oarlocks on posts, stowed oars, floor boards, skeg and painter ring (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic kayak',
    desc: (v) => `${v.kindText} kayak shape, ${v.ft} ft long: a slim pointed hull with rocker, ${v.cock} deck${v.sea ? ' with two hatch covers, a skeg box and deck lines' : ' with moulded footwells, bungee cords and carry handles'}${v.n > 1 ? ', two seats with back bands' : ', a seat with a back band'}.`,
    vs: [['single sit-on-top, 10 ft', 28, 120, 14, 0, { ft: 10, n: 1, kindText: 'Single sit-on-top', cock: 'an open seat well in the', sea: false, B: 0.5 }], ['tandem sit-on-top, 13 ft', 34, 156, 14, 0, { ft: 13, n: 2, kindText: 'Tandem sit-on-top', cock: 'two open seat wells in the', sea: false, B: 0.5 }], ['touring sea kayak, 16 ft', 24, 192, 14, 0, { ft: 16, n: 1, kindText: 'Touring sea', cock: 'a coaming ring cockpit in the', sea: true, B: 0.5 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, B = W / 2 - 4;
      const fn = (f) => { const e = m.abs(2 * f - 1); return { x: cx, hb: B * m.max(m.sin(m.PI * f), 0.0) ** 0.55, zd: Z0 + H * (0.62 + 0.3 * e * e), zk: Z0 + 10 + H * 0.22 * e ** 3, p: 2.4 }; };
      const S = hull(a, { y0: YF + 6, y1: YB - 6, fn, n: 20 });
      const Y = (f) => YF + 6 + (D - 12) * f, zd = (f) => fn(f).zd;
      const seatsF = v.n === 2 ? [0.4, 0.62] : [0.5];
      for (const f of seatsF) {
        if (v.sea) { ellLoop(a, cx, Y(f), zd(f) + 18, W * 0.26, 260, 14, 20); a.ell(cx, Y(f) + 120, zd(f) + 50, 140, 120, 50, 8, 5); }
        else { a.box(cx - W * 0.28, Y(f) - 140, zd(f), cx + W * 0.28, Y(f) + 260, zd(f) + 12); a.box(cx - W * 0.2, Y(f) + 200, zd(f), cx + W * 0.2, Y(f) + 260, zd(f) + 200); a.box(cx - W * 0.22, Y(f) - 80, zd(f), cx + W * 0.22, Y(f) + 200, zd(f) + 40); a.rect(cx - W * 0.28, Y(f) - 140, cx + W * 0.28, Y(f) + 260, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.box(cx + s * W * 0.2 - 14, Y(f) - 320, zd(f) - 8, cx + s * W * 0.2 + 14, Y(f) - 160, zd(f) + 36); }
      }
      if (v.sea) { for (const f of [0.18, 0.82]) { a.cyl(cx, Y(f), zd(f), zd(f) + 22, 190, 16); a.cyl(cx, Y(f), zd(f) + 22, zd(f) + 30, 160, 16); a.circ(cx, Y(f), 190, 'EQUIP-DETAIL'); } a.box(cx - 20, Y(0.88), Z0 + 4, cx + 20, Y(0.97), Z0 + 60); }
      for (const f of [0.1, 0.9]) { a.tube([[cx - 60, Y(f), zd(f) + 8], [cx, Y(f) + (f < 0.5 ? -30 : 30), zd(f) + 80], [cx + 60, Y(f), zd(f) + 8]], [9, 9, 9], 6); }
      for (const s of [-1, 1]) { const p = []; for (let i = 3; i <= 17; i++) { const r = S[i].row[S[i].row.length - 3 + (s > 0 ? 0 : -(S[i].row.length - 5))]; p.push([r[0], r[1], r[2] + 12]); } a.tube(p, p.map(() => 7), 5); }
      a.line(cx, YF + 6, cx, YB - 6, 'EQUIP-DETAIL');
      a.log('Added the pointed hull with rocker, ' + (v.sea ? 'coaming cockpit, two hatches, skeg and deck lines' : 'seat wells, back bands, footrests, bungee cords and carry handles') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic canoe',
    desc: (v) => `Open canoe shape, ${v.ft} ft long: a double-ended hull with raised bow and stern, a gunwale rail, ${v.n} caned seats on hangers, a carrying yoke at the centre and a thwart on each side of it.`,
    vs: [['14 ft', 34, 168, 17, 0, { ft: 14, n: 2 }], ['17 ft', 36, 204, 17, 0, { ft: 17, n: 2 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, B = W / 2 - 3;
      const fn = (f) => { const e = m.abs(2 * f - 1); return { x: cx, hb: B * m.max(m.sin(m.PI * f), 0) ** 0.5, zd: Z0 + H * (0.68 + 0.32 * e * e), zk: Z0 + 20 + H * 0.15 * e ** 3, p: 2.6 }; };
      const S = hull(a, { y0: YF + 4, y1: YB - 4, open: 12, fn, n: 22 }); sheerTube(a, S, 8, 10);
      const Y = (f) => YF + 4 + (D - 8) * f, hb = (f) => fn(f).hb;
      for (const f of [0.26, 0.74]) { const z = Z0 + H * 0.5; a.box(cx - hb(f) * 0.62, Y(f) - 120, z, cx + hb(f) * 0.62, Y(f) + 120, z + 14); for (let k = 0; k < 6; k++) a.line(cx - hb(f) * 0.62, Y(f) - 100 + k * 40, cx + hb(f) * 0.62, Y(f) - 100 + k * 40, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.tube([[cx + s * hb(f) * 0.55, Y(f), z], [cx + s * (hb(f) - 6), Y(f), fn(f).zd - 20]], [9, 9], 5); }
      for (const f of [0.4, 0.6]) a.tube([[cx - hb(f), Y(f), fn(f).zd - 12], [cx + hb(f), Y(f), fn(f).zd - 12]], [14, 14], 8);
      a.tube([[cx - hb(0.5), Y(0.5), fn(0.5).zd - 16], [cx + hb(0.5), Y(0.5), fn(0.5).zd - 16]], [16, 16], 8);
      a.tube([[cx - 130, Y(0.5), fn(0.5).zd - 16], [cx - 60, Y(0.5), fn(0.5).zd + 80], [cx + 60, Y(0.5), fn(0.5).zd + 80], [cx + 130, Y(0.5), fn(0.5).zd - 16]], [14, 12, 12, 14], 8);
      for (const f of [0.02, 0.98]) { const y = Y(f), z = fn(f).zd; a.cyl(cx, y, z - 80, z + 4, 30, 8); ring3(a, cx, y, z - 40, 40, 6, 10, 'x'); }
      a.line(cx, YF + 4, cx, YB - 4, 'EQUIP-DETAIL');
      a.log('Added the double-ended open hull with gunwale rails, two caned seats, thwarts, the carrying yoke and the end decks with grab loops (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic runabout boat',
    desc: (v) => `Open runabout, ${v.ft} ft hull: a V-bottom hull with a closed foredeck, a raked windshield frame with glass, a console with a steering wheel, a helm and a passenger seat, a rear bench, a bow cleat, a grab rail and an outboard motor on the transom.`,
    vs: [['16 ft', 72, 210, 54, 0, { ft: 16, hl: 16 }], ['19 ft', 82, 250, 58, 0, { ft: 19, hl: 19 }], ['22 ft', 92, 290, 62, 0, { ft: 22, hl: 22 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, B = W / 2 - 8, hy1 = YB - 470, hlen = hy1 - YF - 10;
      const fn = (f) => ({ x: cx, hb: B * (f < 0.38 ? m.sin((f / 0.38) * m.PI / 2) ** 0.75 : 1 - 0.1 * ((f - 0.38) / 0.62)), zd: Z0 + 560 + 140 * (1 - f) ** 2, zk: Z0 + 100 + 260 * (1 - f) ** 3, p: f > 0.6 ? 1.3 : 1.15 });
      const S = hull(a, { y0: YF + 10, y1: hy1, open: 22, fn, cap: 0.3, n: 18 }); sheerTube(a, S, 14, 14);
      const Y = (f) => YF + 10 + hlen * f, hb = (f) => fn(f).hb, zd = (f) => fn(f).zd;
      a.box(cx - hb(0.95) - 8, hy1 - 40, Z0 + 170, cx + hb(0.95) + 8, hy1, zd(1) + 30);
      a.box(cx - hb(0.9) + 40, Y(0.32), Z0 + 150, cx + hb(0.9) - 40, Y(0.96), Z0 + 170);
      // windshield: frame with a raked glass panel
      const wy = Y(0.36), wz = zd(0.36), whh = 520;
      for (const s of [-1, 1]) a.tube([[cx + s * (hb(0.36) - 40), wy, wz], [cx + s * (hb(0.36) - 70), wy + 150, wz + whh]], [18, 18], 8);
      a.tube([[cx - (hb(0.36) - 70), wy + 150, wz + whh], [cx + (hb(0.36) - 70), wy + 150, wz + whh]], [18, 18], 8); a.tube([[cx, wy, wz], [cx, wy + 150, wz + whh]], [14, 14], 6);
      prismX(a, [[wy + 6, wz + 30], [wy + 150 + 6, wz + whh - 20], [wy + 150 + 14, wz + whh - 20], [wy + 14, wz + 30]], cx - hb(0.36) + 70, cx - 12); prismX(a, [[wy + 6, wz + 30], [wy + 150 + 6, wz + whh - 20], [wy + 150 + 14, wz + whh - 20], [wy + 14, wz + 30]], cx + 12, cx + hb(0.36) - 70);
      a.rect(cx - hb(0.36) + 40, wy, cx + hb(0.36) - 40, wy + 150, 'EQUIP-DETAIL');
      // console and wheel, seats
      const cy2 = Y(0.5);
      a.box(cx + hb(0.5) * 0.15, cy2 - 200, Z0 + 170, cx + hb(0.5) - 40, cy2 + 120, wz + 330); a.box(cx + hb(0.5) * 0.15 - 6, cy2 - 220, wz + 250, cx + hb(0.5) - 34, cy2 - 190, wz + 340);
      ring3(a, cx + hb(0.5) * 0.55, cy2 - 215, wz + 330, 170, 12, 16, 'y'); a.tube([[cx + hb(0.5) * 0.55, cy2 - 200, wz + 330], [cx + hb(0.5) * 0.55, cy2 - 215, wz + 330]], [30, 30], 8);
      for (const s of [1]) { a.box(cx + hb(0.5) * 0.15, cy2 + 160, Z0 + 170, cx + hb(0.5) * 0.7, cy2 + 520, wz - 10); a.box(cx + hb(0.5) * 0.15, cy2 + 480, wz - 10, cx + hb(0.5) * 0.7, cy2 + 540, wz + 400); }
      a.box(cx - hb(0.5) * 0.8, cy2 + 160, Z0 + 170, cx - hb(0.5) * 0.2, cy2 + 520, wz - 10); a.box(cx - hb(0.5) * 0.8, cy2 + 480, wz - 10, cx - hb(0.5) * 0.2, cy2 + 540, wz + 400);
      a.box(cx - hb(0.88) + 20, Y(0.8), Z0 + 170, cx + hb(0.88) - 20, Y(0.8) + 500, zd(0.8) - 20); a.box(cx - hb(0.88) + 20, Y(0.8) + 470, zd(0.8) - 20, cx + hb(0.88) - 20, Y(0.8) + 530, zd(0.8) + 380);
      a.rect(cx - hb(0.88) + 20, Y(0.8), cx + hb(0.88) - 20, Y(0.8) + 500, 'EQUIP-DETAIL'); a.rect(cx + hb(0.5) * 0.15, cy2 - 200, cx + hb(0.5) - 40, cy2 + 120, 'EQUIP-DETAIL');
      // foredeck: cleat, grab rail, bow eye
      a.box(cx - 90, Y(0.12) - 20, zd(0.12), cx + 90, Y(0.12) + 20, zd(0.12) + 40); for (const s of [-1, 1]) a.cyl(cx + s * 80, Y(0.12), zd(0.12) + 40, zd(0.12) + 70, 14, 6);
      a.tube([[cx - 150, Y(0.2), zd(0.2)], [cx - 150, Y(0.2), zd(0.2) + 70], [cx + 150, Y(0.2), zd(0.2) + 70], [cx + 150, Y(0.2), zd(0.2)]], [10, 10, 10, 10], 5);
      ring3(a, cx, Y(0.01) + 10, zd(0.01) - 70, 40, 7, 10, 'x');
      { const big = 1.15 + (v.ft - 16) * 0.05; outboard(a, cx, hy1, zd(1) - 60, big, zd(1) - 60 - Z0 - 150 * big); }
      a.line(cx, YF + 10, cx, hy1, 'EQUIP-DETAIL');
      a.log('Added the V hull with closed foredeck, windshield frame and glass, console with wheel, two helm seats, rear bench, bow cleat, grab rail and the outboard motor (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic sloop sailboat',
    desc: (v) => `Cruising sloop, ${v.ft} ft long: a rounded hull with a cabin trunk and hatches, a cockpit with benches and a wheel, a mast with spreaders, boom, shrouds, forestay and backstay, bow pulpit and stern lifeline stanchions, a fin keel with bulb and a rudder.`,
    vs: [['22 ft trailerable', 90, 264, 420, 0, { ft: 22, bm: 90, dr: 480, hh: 760, mast: 330, tr: true }], ['28 ft', 106, 336, 460, 0, { ft: 28, bm: 106, dr: 900, hh: 900, mast: 420 }], ['34 ft', 124, 408, 540, 0, { ft: 34, bm: 124, dr: 1150, hh: 1000, mast: 510 }], ['40 ft', 144, 480, 620, 0, { ft: 40, bm: 144, dr: 1350, hh: 1120, mast: 590 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, B = W / 2 - 10, hb0 = Z0 + v.dr, hh = v.hh;
      const fn = (f) => ({ x: cx, hb: B * (f < 0.42 ? m.sin((f / 0.42) * m.PI / 2) ** 0.85 : 1 - 0.3 * ((f - 0.42) / 0.58) ** 1.6), zd: hb0 + hh * (0.82 + 0.34 * (1 - f) ** 2 - 0.08 * f), zk: hb0 + hh * 0.12 + hh * 0.1 * (1 - f) ** 2.5 - hh * 0.05 * f, p: 2.2 });
      const S = hull(a, { y0: YF + 10, y1: YB - 10, fn, n: 22 });
      const Y = (f) => YF + 10 + (D - 20) * f, hb = (f) => fn(f).hb, zd = (f) => fn(f).zd;
      // cabin trunk with window strips and hatches
      sup(a, [{ y: Y(0.3), x: cx, rx: hb(0.3) * 0.5, z0: zd(0.3) - 20, z1: zd(0.3) + hh * 0.12 }, { y: Y(0.36), x: cx, rx: hb(0.36) * 0.62, z0: zd(0.36) - 20, z1: zd(0.36) + hh * 0.34 }, { y: Y(0.55), x: cx, rx: hb(0.55) * 0.62, z0: zd(0.55) - 20, z1: zd(0.55) + hh * 0.34 }, { y: Y(0.62), x: cx, rx: hb(0.62) * 0.55, z0: zd(0.62) - 20, z1: zd(0.62) + hh * 0.26 }], { seg: 12, n: 3.2 });
      for (const s of [-1, 1]) a.box(cx + s * hb(0.45) * 0.62 - (s > 0 ? 2 : 14), Y(0.37), zd(0.45) + hh * 0.14, cx + s * hb(0.45) * 0.62 + (s > 0 ? 14 : 2), Y(0.55), zd(0.45) + hh * 0.26);
      a.box(cx - hb(0.45) * 0.28, Y(0.4), zd(0.45) + hh * 0.34, cx + hb(0.45) * 0.28, Y(0.5), zd(0.45) + hh * 0.34 + 25);
      a.box(cx - hb(0.2) * 0.25, Y(0.18), zd(0.2), cx + hb(0.2) * 0.25, Y(0.24), zd(0.2) + 25);
      // cockpit: coaming, benches, wheel
      for (const s of [-1, 1]) { a.box(cx + s * (hb(0.78) - 70) - 25, Y(0.64), zd(0.7), cx + s * (hb(0.78) - 70) + 25, Y(0.94), zd(0.7) + 190); a.box(cx + s * (hb(0.74) * 0.55) - 110, Y(0.66), zd(0.7) - 30, cx + s * (hb(0.74) * 0.55) + 110, Y(0.88), zd(0.7) + 100); }
      a.box(cx - hb(0.64) * 0.6, Y(0.62), zd(0.62), cx + hb(0.64) * 0.6, Y(0.65), zd(0.62) + 160);
      a.cyl(cx, Y(0.82), zd(0.8), zd(0.8) + 420, 40, 10); ring3(a, cx, Y(0.82), zd(0.8) + 620 * 0 + 480, 260, 18, 18, 'y');
      // keel and rudder
      prismX(a, [[Y(0.4), hb0 + hh * 0.18], [Y(0.62), hb0 + hh * 0.18], [Y(0.55), Z0 + 140], [Y(0.47), Z0 + 140]], cx - 55, cx + 55);
      a.ell(cx, Y(0.51), Z0 + 150, 120, 380, 110, 12, 7);
      prismX(a, [[Y(0.93), hb0 + hh * 0.2], [Y(0.97), hb0 + hh * 0.2], [Y(0.97), Z0 + v.dr * 0.45], [Y(0.915), Z0 + v.dr * 0.45]], cx - 28, cx + 28);
      // mast, boom, rigging
      const my = Y(0.4), mz = zd(0.4) + hh * 0.3, top = Z1 - 20;
      a.tube([[cx, my, mz], [cx, my, top]], [60, 34], 10);
      for (const [zf, wd] of [[0.55, 0.36], [0.8, 0.22]]) { const z = lerp(mz, top, zf); a.tube([[cx - hb(0.4) * wd * 2, my + 20, z], [cx, my, z], [cx + hb(0.4) * wd * 2, my + 20, z]], [14, 14, 14], 5); }
      const bz = mz + hh * 0.28; a.tube([[cx, my + 40, bz], [cx, Y(0.9), bz + 30]], [38, 30], 8); a.box(cx - 30, Y(0.9) - 40, bz + 10, cx + 30, Y(0.9) + 10, bz + 50);
      a.tube([[cx, my, top], [cx, Y(0.03), zd(0.03) + 100]], [9, 9], 5); a.tube([[cx, my, top], [cx, Y(0.97), zd(0.97) + 60]], [9, 9], 5);
      for (const s of [-1, 1]) { const x = cx + s * (hb(0.4) - 30); a.tube([[cx + s * hb(0.4) * 0.72, my + 20, lerp(mz, top, 0.55)], [x, my + 20, zd(0.4)]], [9, 9], 5); a.tube([[cx, my, lerp(mz, top, 0.8)], [cx + s * hb(0.4) * 0.44, my + 20, lerp(mz, top, 0.8)], [x, my - 60, zd(0.4)]], [8, 8, 8], 5); }
      // pulpit, lifelines, stanchions
      for (const s of [-1, 1]) { const pts = []; for (let i = 3; i <= 19; i += 2) pts.push([S[i].row[s > 0 ? 10 : 0][0], S[i].y, S[i].row[0][2] + 520]); a.tube(pts, pts.map(() => 7), 4); for (let i = 3; i <= 19; i += 4) { const r = S[i].row[s > 0 ? 10 : 0]; a.tube([[r[0], r[1], r[2]], [r[0], r[1], r[2] + 520]], [10, 10], 5); } }
      a.tube([[cx - hb(0.08) + 20, Y(0.07), zd(0.07) + 520], [cx, Y(0.015), zd(0.015) + 540], [cx + hb(0.08) - 20, Y(0.07), zd(0.07) + 520]], [10, 10, 10], 5);
      for (const s of [-1, 1]) for (const f of [0.15, 0.4, 0.8]) a.box(cx + s * (hb(f) - 70) - 25, Y(f) - 40, zd(f), cx + s * (hb(f) - 70) + 25, Y(f) + 40, zd(f) + 30);
      a.line(cx, YF + 10, cx, YB - 10, 'EQUIP-DETAIL'); a.rect(cx - hb(0.45) * 0.62, Y(0.36), cx + hb(0.45) * 0.62, Y(0.62), 'EQUIP-DETAIL'); a.circ(cx, Y(0.82), 260, 'EQUIP-DETAIL');
      a.log('Added the rounded hull, cabin trunk with windows and hatches, cockpit with benches and wheel, fin keel with bulb, rudder, mast with spreaders, boom, shrouds, stays, pulpit and lifelines (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic workboat',
    desc: (v) => `Harbour workboat, ${v.ft} ft long: a full-bodied hull with bulwarks and a push knee at the bow, a forward wheelhouse with windows and a roof rail, a mast with lights and a radar box, an open aft deck with ${v.crane ? 'a deck crane, ' : ''}towing bollards, fenders along the sides and an exhaust stack.`,
    vs: [['28 ft', 120, 336, 148, 0, { ft: 28, crane: false }], ['36 ft', 144, 432, 168, 0, { ft: 36, crane: true }], ['46 ft', 168, 552, 192, 0, { ft: 46, crane: true }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, B = W / 2 - 40, hd = H * 0.3;
      const fn = (f) => ({ x: cx, hb: B * (f < 0.3 ? m.sin((f / 0.3) * m.PI / 2) ** 0.7 : 1 - 0.1 * ((f - 0.3) / 0.7)), zd: Z0 + hd + hd * 0.28 * (1 - f) ** 2, zk: Z0 + 20 + hd * 0.2 * (1 - f) ** 3, p: 3 });
      const S = hull(a, { y0: YF + 10, y1: YB - 10, fn, n: 20 });
      const Y = (f) => YF + 10 + (D - 20) * f, hb = (f) => fn(f).hb, zd = (f) => fn(f).zd;
      for (const s of [-1, 1]) { const p = sheer(S, s, 0); a.tube(p.map(([x, y, z]) => [x, y, z + 180]), p.map(() => 14), 6); for (let i = 1; i < S.length - 1; i += 2) { const r = S[i].row[s > 0 ? 10 : 0]; a.box(r[0] - (s > 0 ? 8 : 0), r[1] - 10, r[2], r[0] + (s > 0 ? 0 : 8), r[1] + 10, r[2] + 180); } }
      a.box(cx - 130, Y(0.01), zd(0.01), cx + 130, Y(0.05), zd(0.01) + 170);
      // wheelhouse
      const w0 = 0.24, w1 = 0.5, hz0 = zd(0.4), hz1 = Z0 + H * 0.62;
      sup(a, [{ y: Y(w0), x: cx, rx: hb(w0) * 0.72, z0: hz0 - 10, z1: hz1 - 60 }, { y: Y(w0) + 40, x: cx, rx: hb(w0) * 0.78, z0: hz0 - 10, z1: hz1 }, { y: Y(w1) - 40, x: cx, rx: hb(w1) * 0.8, z0: hz0 - 10, z1: hz1 }, { y: Y(w1), x: cx, rx: hb(w1) * 0.78, z0: hz0 - 10, z1: hz1 - 20 }], { seg: 14, n: 5 });
      paneBand(a, cx, hb(0.4) * 0.8, Y(w0) + 120, Y(w1) - 50, hz0 + (hz1 - hz0) * 0.4, hz1 - 70, 4);
      a.frame(cx - hb(w0) * 0.62, hz0 + (hz1 - hz0) * 0.4, cx + hb(w0) * 0.62, hz1 - 70, Y(w0) - 8, Y(w0) + 24, 22);
      a.box(cx - hb(w0) * 0.9, Y(w0) - 20, hz1, cx + hb(w0) * 0.9, Y(w1) + 40, hz1 + 25);
      a.tube([[cx, Y(w0 + 0.1), hz1 + 25], [cx, Y(w0 + 0.1), Z1 - 60]], [24, 18], 8); a.box(cx - 120, Y(w0 + 0.1) - 40, Z1 - 160, cx + 120, Y(w0 + 0.1) + 40, Z1 - 60); a.ell(cx, Y(w0 + 0.1), Z1 - 30, 40, 40, 40, 8, 5);
      a.box(cx - 70, Y(w1 - 0.06), hz1 + 25, cx + 70, Y(w1 - 0.06) + 160, hz1 + 120);
      a.tube([[cx + hb(w1) * 0.45, Y(w1) - 100, hz1], [cx + hb(w1) * 0.45, Y(w1) - 100, hz1 + 330]], [60, 50], 8);
      // aft deck: bollards, crane, fenders
      for (const s of [-1, 1]) { a.cyl(cx + s * hb(0.85) * 0.7, Y(0.88), zd(0.88), zd(0.88) + 160, 55, 10); a.cyl(cx + s * hb(0.85) * 0.7, Y(0.88), zd(0.88) + 160, zd(0.88) + 190, 80, 10); a.circ(cx + s * hb(0.85) * 0.7, Y(0.88), 70, 'EQUIP-DETAIL'); }
      a.cyl(cx, Y(0.7), zd(0.7), zd(0.7) + 120, 70, 10); a.cyl(cx, Y(0.7), zd(0.7) + 120, zd(0.7) + 150, 100, 10);
      if (v.crane) { const cy = Y(0.66), cxx = cx - hb(0.66) * 0.6; a.box(cxx - 140, cy - 140, zd(0.66), cxx + 140, cy + 140, zd(0.66) + 160); a.tube([[cxx, cy, zd(0.66) + 160], [cxx, cy, zd(0.66) + 1150]], [70, 55], 10); a.tube([[cxx, cy, zd(0.66) + 1100], [cxx + hb(0.66) * 0.9, cy + 80, zd(0.66) + 1450], [cxx + hb(0.66) * 1.3, cy + 80, zd(0.66) + 1200]], [48, 40, 32], 8); a.tube([[cxx + hb(0.66) * 1.3, cy + 80, zd(0.66) + 1200], [cxx + hb(0.66) * 1.3, cy + 80, zd(0.66) + 500]], [5, 5], 4); a.circ(cxx, cy, 140, 'EQUIP-DETAIL'); a.line(cxx, cy, cxx + hb(0.66) * 1.3, cy + 80, 'EQUIP-DETAIL'); }
      for (const s of [-1, 1]) for (const f of [0.3, 0.6, 0.85]) { const r = S[m.round(f * 20)].row[s > 0 ? 10 : 0]; a.ycyl(r[1] - 180, r[1] + 180, r[0] + s * 70, r[2] - 130, 60, 8); }
      a.line(cx, YF + 10, cx, YB - 10, 'EQUIP-DETAIL'); a.rect(cx - hb(w0) * 0.78, Y(w0), cx + hb(w1) * 0.78, Y(w1), 'EQUIP-DETAIL');
      a.log('Added the hull with bulwarks and push knee, wheelhouse with windows, roof rail, mast with lights and radar, aft deck bollards' + (v.crane ? ', deck crane' : '') + ', fenders and exhaust stack (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic passenger ferry',
    desc: (v) => `Passenger ferry, ${v.ft} ft long: a wide hull with a bow ramp, a main cabin with window bands and side doors, an upper deck with rails and ${v.rafts} life-raft canisters, a wheelhouse with a mast and radar, a funnel and fenders along the sides.`,
    vs: [['70 ft', 240, 840, 330, 0, { ft: 70, rafts: 4, up: 0.5 }], ['100 ft', 336, 1200, 420, 0, { ft: 100, rafts: 6, up: 0.6 }], ['140 ft', 432, 1680, 520, 0, { ft: 140, rafts: 8, up: 0.62 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, B = W / 2 - 20, hd = H * 0.2;
      const fn = (f) => ({ x: cx, hb: B * (f < 0.12 ? m.sin((f / 0.12) * m.PI / 2) ** 0.7 : f > 0.94 ? 1 - 0.1 * (f - 0.94) / 0.06 : 1), zd: Z0 + hd + hd * 0.1 * (1 - f) ** 2, zk: Z0 + 30 + hd * 0.25 * (1 - f) ** 3, p: 3 });
      const S = hull(a, { y0: YF + 10, y1: YB - 10, fn, n: 20 });
      const Y = (f) => YF + 10 + (D - 20) * f, hb = (f) => fn(f).hb, zd = (f) => fn(f).zd, dz = zd(0.5);
      // bow ramp and bollards
      prismX(a, [[Y(0.01), dz + 20], [Y(0.06), dz + 140], [Y(0.06), dz + 40], [Y(0.01), dz + 10]].map((p2) => p2), cx - hb(0.06) * 0.7, cx + hb(0.06) * 0.7);
      // main cabin with window band
      const c0 = 0.1, c1 = 0.9, cz1 = dz + H * 0.3;
      sup(a, [{ y: Y(c0), x: cx, rx: hb(c0) * 0.9, z0: dz - 10, z1: cz1 - 40 }, { y: Y(c0) + 60, x: cx, rx: hb(c0 + 0.02) * 0.94, z0: dz - 10, z1: cz1 }, { y: Y(c1) - 60, x: cx, rx: hb(c1) * 0.94, z0: dz - 10, z1: cz1 }, { y: Y(c1), x: cx, rx: hb(c1) * 0.9, z0: dz - 10, z1: cz1 - 40 }], { seg: 16, n: 5 });
      paneBand(a, cx, hb(0.5) * 0.94, Y(c0) + 200, Y(c1) - 200, dz + H * 0.12, cz1 - H * 0.04, m.round(D / I / 40));
      for (const s of [-1, 1]) for (const f of [0.3, 0.7]) a.box(cx + s * (hb(f) * 0.94 - 2) - (s > 0 ? 0 : 14), Y(f) - 80, dz, cx + s * (hb(f) * 0.94 - 2) + (s > 0 ? 14 : 0), Y(f) + 80, dz + H * 0.2);
      // upper deck, wheelhouse, rails
      const u0 = 0.2, u1 = 0.78, uz0 = cz1, uz1 = cz1 + H * 0.2;
      sup(a, [{ y: Y(u0), x: cx, rx: hb(0.5) * 0.7, z0: uz0 - 10, z1: uz1 - 30 }, { y: Y(u0) + 40, x: cx, rx: hb(0.5) * 0.76, z0: uz0 - 10, z1: uz1 }, { y: Y(u1) - 40, x: cx, rx: hb(0.5) * 0.76, z0: uz0 - 10, z1: uz1 }, { y: Y(u1), x: cx, rx: hb(0.5) * 0.7, z0: uz0 - 10, z1: uz1 - 30 }], { seg: 14, n: 5 });
      paneBand(a, cx, hb(0.5) * 0.76, Y(u0) + 120, Y(u1) - 120, uz0 + H * 0.05, uz1 - H * 0.03, m.round(D / I / 70));
      const wy0 = Y(0.3), wy1 = Y(0.42), wz = uz1;
      sup(a, [{ y: wy0, x: cx, rx: hb(0.4) * 0.5, z0: wz - 10, z1: wz + H * 0.1 }, { y: wy1, x: cx, rx: hb(0.4) * 0.5, z0: wz - 10, z1: wz + H * 0.1 }], { seg: 12, n: 5 });
      paneBand(a, cx, hb(0.4) * 0.5, wy0 + 40, wy1 - 40, wz + H * 0.02, wz + H * 0.08, 2, 14);
      a.frame(cx - hb(0.4) * 0.4, wz + H * 0.02, cx + hb(0.4) * 0.4, wz + H * 0.08, wy0 - 6, wy0 + 20, 16);
      a.tube([[cx, wy0 + 100, wz + H * 0.1], [cx, wy0 + 100, Z1 - 40]], [30, 20], 8); a.box(cx - 200, wy0 + 40, Z1 - 140, cx + 200, wy0 + 160, Z1 - 40);
      a.ell(cx, wy1 + 400 + 300, wz + H * 0.1 + 200, hb(0.5) * 0.18, 260, 260, 12, 8); a.cyl(cx, wy1 + 700, wz + H * 0.1, wz + H * 0.1 + 200, hb(0.5) * 0.17, 12);
      for (const s of [-1, 1]) { const p = [[cx + s * hb(0.5) * 0.76, Y(u0), uz1 + 0], [cx + s * hb(0.5) * 0.76, Y(u1), uz1]]; a.tube(p.map(([x, y, z]) => [x, y, z + 210]), [10, 10], 5); for (let i = 0; i <= 10; i++) a.tube([[p[0][0], lerp(p[0][1], p[1][1], i / 10), uz1], [p[0][0], lerp(p[0][1], p[1][1], i / 10), uz1 + 210]], [8, 8], 5); }
      for (let k = 0; k < v.rafts; k++) { const s = k % 2 ? 1 : -1, f = 0.46 + 0.07 * m.floor(k / 2); a.ycyl(Y(f) - 220, Y(f) + 220, cx + s * hb(0.5) * 0.5, uz1 + 110, 100, 12); a.box(cx + s * hb(0.5) * 0.5 - 40, Y(f) - 150, uz1, cx + s * hb(0.5) * 0.5 + 40, Y(f) + 150, uz1 + 20); }
      for (const s of [-1, 1]) { const p = sheer(S, s, 30); a.tube(p.map(([x, y, z]) => [x, y, z + 220]), p.map(() => 10), 5); for (let i = 3; i < S.length - 3; i += 2) { const r = S[i].row[s > 0 ? 10 : 0]; a.tube([[r[0], r[1], r[2]], [r[0], r[1], r[2] + 220]], [8, 8], 5); } for (const f of [0.25, 0.5, 0.75]) { const r = S[m.round(f * 20)].row[s > 0 ? 10 : 0]; a.ycyl(r[1] - 200, r[1] + 200, r[0] + s * 60, r[2] - 140, 70, 8); } }
      a.line(cx, YF + 10, cx, YB - 10, 'EQUIP-DETAIL'); a.rect(cx - hb(0.5) * 0.94, Y(c0), cx + hb(0.5) * 0.94, Y(c1), 'EQUIP-DETAIL'); a.rect(cx - hb(0.5) * 0.76, Y(u0), cx + hb(0.5) * 0.76, Y(u1), 'EQUIP-DETAIL');
      a.log('Added the hull with bow ramp, main cabin with window band and doors, upper deck with rails and life-raft canisters, wheelhouse with mast, funnel and fenders (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic pontoon boat',
    desc: (v) => `Pontoon boat, ${v.ft} ft deck: two round pontoon tubes with pointed noses, a frame and flat deck, a railed fence with a gate, perimeter bench seats, a helm console with wheel, a shade top on four posts and an outboard motor on the stern.`,
    vs: [['20 ft', 100, 290, 100, 0, { ft: 20 }], ['24 ft', 104, 335, 104, 0, { ft: 24 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, dl = D - 500, dy0 = YF + 160, dy1 = YF + 160 + dl - 100, pr = 190, px = W / 2 - pr - 40, dz = Z0 + 520;
      for (const s of [-1, 1]) { const x = cx + s * px; a.tube([[x, YF + 10, Z0 + pr], [x, YF + 120, Z0 + pr * 0.75], [x, YF + 260, Z0 + pr], [x, dy1 - 140, Z0 + pr], [x, dy1 + 50, Z0 + pr * 0.8], [x, dy1 + 80, Z0 + pr * 0.4]], [8, pr * 0.55, pr, pr, pr * 0.7, pr * 0.2], 14); a.rect(x - pr, YF + 10, x + pr, dy1 + 80, 'EQUIP'); a.line(x, YF + 10, x, dy1 + 80, 'EQUIP-DETAIL'); }
      for (let i = 0; i < 6; i++) { const y = lerp(dy0, dy1, i / 5); a.box(cx - px - 40, y - 30, dz - 90, cx + px + 40, y + 30, dz - 20); for (const s of [-1, 1]) a.box(cx + s * px - 30, y - 30, Z0 + pr * 2 - 20, cx + s * px + 30, y + 30, dz - 90); }
      a.box(cx - W / 2 + 30, dy0 - 20, dz - 20, cx + W / 2 - 30, dy1, dz); a.box(cx - W / 2 + 30, dy0 - 20, dz, cx + W / 2 - 30, dy0 + 6, dz + 12);
      for (let k = 0; k < 12; k++) a.line(cx - W / 2 + 30, lerp(dy0, dy1, k / 12), cx + W / 2 - 30, lerp(dy0, dy1, k / 12), 'EQUIP-DETAIL');
      const fx = W / 2 - 50; const rz = dz + 700;
      for (const s of [-1, 1]) { rail(a, cx + s * fx, dy0, cx + s * fx, dy1, dz, rz, 16, m.round(dl / 280), 2); }
      rail(a, cx - fx, dy0, cx - 380, dy0, dz, rz, 16, 3, 2); rail(a, cx + 380, dy0, cx + fx, dy0, dz, rz, 16, 3, 2); a.tube([[cx - 380, dy0, rz], [cx - 380, dy0, dz + 30]], [14, 14], 6); a.tube([[cx + 380, dy0, rz], [cx + 380, dy0, dz + 30]], [14, 14], 6);
      rail(a, cx - fx, dy1, cx + fx, dy1, dz, rz, 16, 6, 2);
      for (const s of [-1, 1]) { bench(a, cx + s * fx - (s > 0 ? 400 : 0) + (s > 0 ? 0 : 0), cx + s * fx - (s > 0 ? 0 : -400) , dy0 + 600, dz + 420, 800, 30, 400); }
      for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { const y0 = dy0 + 700 + k * 1000; if (y0 + 800 > dy1 - 300) continue; a.box(cx + s * fx - (s > 0 ? 440 : 0), y0, dz, cx + s * fx + (s > 0 ? 0 : 440), y0 + 900, dz + 380); a.box(cx + s * fx - (s > 0 ? 100 : 0), y0, dz + 380, cx + s * fx + (s > 0 ? 0 : 100), y0 + 900, dz + 720); a.rect(cx + s * fx - (s > 0 ? 440 : 0), y0, cx + s * fx + (s > 0 ? 0 : 440), y0 + 900, 'EQUIP-DETAIL'); }
      const hy = dy0 + 380; a.box(cx - 340, hy - 120, dz, cx - 40, hy + 280, dz + 760); ring3(a, cx - 190, hy - 130, dz + 700, 190, 14, 16, 'y'); a.tube([[cx - 190, hy - 120, dz + 700], [cx - 190, hy - 130, dz + 700]], [30, 30], 6); bench(a, cx - 340, cx - 40, hy + 520, dz + 450, 400, 40, 450); a.box(cx - 340, hy + 690, dz + 450, cx - 40, hy + 760, dz + 880); a.rect(cx - 340, hy - 120, cx - 40, hy + 280, 'EQUIP-DETAIL');
      const th = dz + 2300;
      for (const [x, y] of [[cx - fx + 20, dy0 + 40], [cx + fx - 20, dy0 + 40], [cx - fx + 20, dy1 - 40], [cx + fx - 20, dy1 - 40]]) a.tube([[x, y, rz], [x, y, th]], [22, 22], 8);
      a.box(cx - fx - 40, dy0 - 80, th, cx + fx + 40, dy1 + 80, th + 40); a.box(cx - fx - 80, dy0 - 80, th - 40, cx + fx + 80, dy0 - 40, th); a.rect(cx - fx - 40, dy0 - 80, cx + fx + 40, dy1 + 80, 'EQUIP-HIDDEN');
      outboard(a, cx, dy1 + 60, dz + 100, 1.2, 500);
      a.log('Added the two pontoon tubes with nose cones, frame, deck, railed fence with gate, bench seats, helm console with wheel, shade top on four posts and the outboard motor (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic rigid inflatable boat',
    desc: (v) => `Rigid inflatable boat, ${v.ft} ft: a deep-V rigid hull with a flat deck, a tapered tube collar around the rim, a centre console with a steering wheel and a bolster seat, bow grab lines and an outboard motor on the transom.`,
    vs: [['14 ft', 80, 232, 54, 0, { ft: 14, big: 1 }], ['20 ft', 98, 330, 62, 0, { ft: 20, big: 1.3 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, tr = W * 0.09, B = W / 2 - tr * 1.5, hy1 = YB - 480 * v.big, L = hy1 - YF - 10;
      const fn = (f) => ({ x: cx, hb: B * (f < 0.3 ? m.sin((f / 0.3) * m.PI / 2) ** 0.8 : 1), zd: Z0 + 380, zk: Z0 + 60 + 160 * (1 - f) ** 3, p: 1.3 });
      const S = hull(a, { y0: YF + 10, y1: hy1, fn, n: 16 });
      const Y = (f) => YF + 10 + L * f, hb = (f) => fn(f).hb;
      for (const s of [-1, 1]) { const pts = []; for (let i = 0; i <= 14; i++) { const f = m.max(0.98 - i * 0.07, 0.01), hbb = hb(f) + tr * 0.9; pts.push([cx + s * hbb, Y(f), 380 + Z0 + tr * 0.4 + 0.5 * (1 - f) * 120]); } pts.push([cx, Y(0.0), Z0 + 380 + tr * 0.4 + 120]); a.tube(s < 0 ? pts : pts.slice(0, -1), (s < 0 ? pts : pts.slice(0, -1)).map((p, i, arr) => tr * (i > arr.length - 4 ? 0.7 : 1)), 12); }
      a.tube([[cx - hb(0.02) - tr * 0.9, Y(0.03), Z0 + 380 + tr * 0.4 + 110], [cx, Y(0.0) - 0, Z0 + 380 + tr * 0.4 + 120], [cx + hb(0.02) + tr * 0.9, Y(0.03), Z0 + 380 + tr * 0.4 + 110]], [tr * 0.6, tr * 0.5, tr * 0.6], 10);
      a.box(cx - hb(1) - tr * 2, hy1 - 60, Z0 + 150, cx + hb(1) + tr * 2, hy1, Z0 + 460);
      for (const s of [-1, 1]) a.tube([[cx + s * (hb(1) + tr * 0.9), hy1 - tr, Z0 + 380 + tr * 0.4], [cx + s * (hb(1) + tr * 0.9), hy1 + 60, Z0 + 380 + tr * 0.4]], [tr, tr * 0.7], 12);
      const cy = Y(0.52);
      a.box(cx - 220, cy - 220, Z0 + 380, cx + 220, cy + 260, Z0 + 1050); a.box(cx - 240, cy - 240, Z0 + 960, cx + 240, cy - 200, Z0 + 1060);
      ring3(a, cx, cy - 260, Z0 + 1010, 210, 16, 16, 'y'); a.tube([[cx, cy - 240, Z0 + 1010], [cx, cy - 262, Z0 + 1010]], [34, 34], 8);
      sup(a, [{ y: cy + 300, x: cx, rx: 170, z0: Z0 + 380, z1: Z0 + 830 }, { y: cy + 560, x: cx, rx: 200, z0: Z0 + 380, z1: Z0 + 900 }, { y: cy + 700, x: cx, rx: 150, z0: Z0 + 380, z1: Z0 + 1000 }], { seg: 12, n: 3 });
      for (let k = 0; k < 4; k++) a.line(cx - hb(0.5) - tr * 0.9 * 0, Y(0.25 + 0.15 * k), cx + hb(0.5), Y(0.25 + 0.15 * k), 'EQUIP-DETAIL');
      for (const s of [-1, 1]) { const x = cx + s * (hb(0.4) + tr * 0.9); a.tube([[x - s * 8, Y(0.2), Z0 + 380 + tr * 1.45], [x - s * 8, Y(0.2) + 90, Z0 + 380 + tr * 1.45 + 60], [x - s * 8, Y(0.2) + 180, Z0 + 380 + tr * 1.45]], [10, 10, 10], 5); }
      outboard(a, cx, hy1, Z0 + 470, v.big * 1.1, 330 * v.big);
      a.rect(cx - hb(0.5) - tr * 1.8, YF + 10, cx + hb(0.5) + tr * 1.8, hy1, 'EQUIP-DETAIL'); a.line(cx, YF + 10, cx, hy1, 'EQUIP-DETAIL');
      a.log('Added the deep-V rigid hull and deck, tapered tube collar with bow join, transom, centre console with wheel, bolster seat, grab lines and the outboard motor (plan and 3D).');
    } }),

  // ===================================================== deck =====================================================
  fam({ cat: 'marine/deck', title: 'Generic horn cleat',
    desc: (v) => `${v.len} in horn cleat: a base with two feet and four bolt heads, a central saddle and two raised horns with rounded tips, sized for ${v.line}.`,
    vs: [['6 in', 6, 2.2, 2.2, 0, { len: 6, line: '3/8 in line' }], ['10 in', 10, 3.1, 3.4, 0, { len: 10, line: '1/2 in line' }], ['14 in', 14, 4.2, 4.6, 0, { len: 14, line: '3/4 in line' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, t = D * 0.42, bz = Z0 + H * 0.28;
      a.box(X0 + W * 0.04, cy - D * 0.46, Z0, X0 + W * 0.28, cy + D * 0.46, bz); a.box(X1 - W * 0.28, cy - D * 0.46, Z0, X1 - W * 0.04, cy + D * 0.46, bz);
      prismY(a, [[X0, bz], [X0 + W * 0.3, bz], [X0 + W * 0.3, bz + H * 0.24], [X0 + W * 0.1, Z1], [X0, Z1]].map((p2) => p2), cy - t / 2, cy + t / 2);
      prismY(a, [[X1, bz], [X1 - W * 0.3, bz], [X1 - W * 0.3, bz + H * 0.24], [X1 - W * 0.1, Z1], [X1, Z1]].map((p2) => p2).reverse(), cy - t / 2, cy + t / 2);
      a.box(X0 + W * 0.26, cy - t * 0.42, bz - 0.01 + 1, X1 - W * 0.26, cy + t * 0.42, bz + H * 0.3);
      a.ell(X0 + W * 0.07, cy, Z1 - H * 0.05, W * 0.08, t * 0.5, H * 0.1, 10, 6); a.ell(X1 - W * 0.07, cy, Z1 - H * 0.05, W * 0.08, t * 0.5, H * 0.1, 10, 6);
      for (const [x, y] of [[X0 + W * 0.15, cy - D * 0.32], [X0 + W * 0.15, cy + D * 0.32], [X1 - W * 0.15, cy - D * 0.32], [X1 - W * 0.15, cy + D * 0.32]]) { a.cyl(x, y, bz - 0.01 + 1, bz + H * 0.06, D * 0.07, 6); a.circ(x, y, D * 0.07, 'EQUIP-DETAIL'); }
      a.rect(X0 + W * 0.04, cy - D * 0.46, X1 - W * 0.04, cy + D * 0.46); a.rect(X0, cy - t / 2, X1, cy + t / 2, 'EQUIP-DETAIL');
      a.log('Added the two feet, bridge saddle, raised horns with rounded tips and four bolt heads (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic sheet winch',
    desc: (v) => `${v.kindText} sheet winch with a ${v.dr} in drum: a base skirt with a bolt ring, a grooved drum, ${v.st ? 'a self-tailing arm with two jaws and a stripper on top, ' : 'a plain top cap, '}a handle socket${v.two ? ', a second-speed gear ring' : ''}${v.handle ? ' and a removable handle with a grip' : ''}.`,
    vs: [['single speed, 4 in drum', 6.5, 6.5, 6, 0, { kindText: 'Single-speed', dr: 4, st: false, two: false }], ['self-tailing, 6 in drum', 9, 9, 8.5, 0, { kindText: 'Self-tailing', dr: 6, st: true, two: false }], ['two speed, 8 in drum, with handle', 20, 12, 11.5, 0, { kindText: 'Two-speed self-tailing', dr: 8, st: true, two: true, handle: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = m.min(W, D) / 2, bx = v.handle ? X0 + R : cx, by = cy;
      const dr = R * (v.handle ? 0.66 : 0.64);
      a.cyl(bx, by, Z0, Z0 + H * 0.12, R, 24); a.cone(bx, by, Z0 + H * 0.12, Z0 + H * 0.2, R, R * 0.8, 24);
      for (let k = 0; k < 6; k++) { const t = (k / 6) * TAU; a.cyl(bx + m.cos(t) * R * 0.88, by + m.sin(t) * R * 0.88, Z0 + H * 0.12, Z0 + H * 0.16, R * 0.05, 6); a.circ(bx + m.cos(t) * R * 0.88, by + m.sin(t) * R * 0.88, R * 0.05, 'EQUIP-DETAIL'); }
      if (v.two) a.cyl(bx, by, Z0 + H * 0.2, Z0 + H * 0.28, R * 0.84, 24);
      const dz0 = Z0 + H * (v.two ? 0.28 : 0.2);
      a.tube([[bx, by, dz0], [bx, by, dz0 + H * 0.05], [bx, by, Z0 + H * 0.52], [bx, by, Z0 + H * 0.6]], [dr * 0.8, dr, dr * 0.76, dr * 0.9], 24);
      for (let k = 0; k < 3; k++) a.cyl(bx, by, dz0 + H * 0.1 + k * H * 0.1, dz0 + H * 0.1 + k * H * 0.1 + 4, dr * 1.03, 24);
      if (v.st) { a.cyl(bx, by, Z0 + H * 0.6, Z0 + H * 0.68, dr * 1.1, 24); a.cyl(bx, by, Z0 + H * 0.68, Z0 + H * 0.84, dr * 0.9, 24); a.cyl(bx, by, Z0 + H * 0.84, Z0 + H * 0.88, dr * 1.08, 24); a.box(bx - dr * 1.15, by - dr * 0.2, Z0 + H * 0.7, bx + dr * 1.15, by + dr * 0.2, Z0 + H * 0.75); a.box(bx + dr * 0.8, by + dr * 0.3, Z0 + H * 0.84, bx + dr * 1.1, by + dr * 0.9, Z0 + H * 0.94); }
      else a.cyl(bx, by, Z0 + H * 0.6, Z0 + H * 0.78, dr * 0.9, 24);
      a.cyl(bx, by, Z1 - H * 0.04, Z1, dr * 0.5, 12);
      if (v.handle) { const hz = Z1 - H * 0.14; a.tube([[bx, by, hz], [bx + R * 1.7, by + R * 0.3, hz + R * 0.05]], [R * 0.1, R * 0.08], 8); a.ell(bx + R * 1.7, by + R * 0.3, hz + R * 0.05, R * 0.2, R * 0.1, R * 0.1, 8, 5); a.line(bx, by, bx + R * 1.7, by + R * 0.3, 'EQUIP-DETAIL'); }
      a.circ(bx, by, R, 'EQUIP'); a.circ(bx, by, dr, 'EQUIP-DETAIL'); a.circ(bx, by, R * 0.88, 'EQUIP-HIDDEN');
      a.log('Added the base skirt with bolts, ' + (v.two ? 'gear ring, ' : '') + 'grooved drum, ' + (v.st ? 'self-tailing jaws and stripper' : 'top cap') + ' and the handle socket' + (v.handle ? ' with handle' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic anchor windlass',
    desc: () => 'Horizontal anchor windlass: a base plate with bolts, a gear housing and motor on one side, a horizontal shaft with a chain gypsy wheel and a rope drum, a brake wheel, a clutch handle and a chain pipe opening.',
    vs: [['horizontal, 1,000 W class', 24, 14, 12, 0, {}]],
    build: (a) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, az = Z0 + H * 0.48;
      a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.1); for (const [x, y] of [[X0 + 20, YF + 20], [X1 - 20, YF + 20], [X0 + 20, YB - 20], [X1 - 20, YB - 20]]) { a.cyl(x, y, Z0 + H * 0.1, Z0 + H * 0.14, 12, 6); a.circ(x, y, 12, 'EQUIP-DETAIL'); }
      a.box(X0 + W * 0.04, cy - D * 0.3, Z0 + H * 0.1, X0 + W * 0.3, cy + D * 0.3, az + H * 0.28); a.xcyl(X0 + W * 0.04, X0 + W * 0.3, cy, az, D * 0.32, 18);
      a.xcyl(X0 - 0 + 2, X0 + W * 0.04, cy, az, D * 0.1, 10);
      a.box(X1 - W * 0.3, cy - D * 0.3, Z0 + H * 0.1, X1 - W * 0.04, cy + D * 0.3, az + H * 0.28);
      a.xcyl(X0 + W * 0.3, X1 - W * 0.3, cy, az, H * 0.06, 12);
      a.xcyl(X0 + W * 0.34, X0 + W * 0.46, cy, az, H * 0.32, 20); for (let k = 0; k < 7; k++) { const t = (k / 7) * TAU; a.box(X0 + W * 0.34, cy + m.cos(t) * H * 0.32 - 8, az + m.sin(t) * H * 0.32 - 8, X0 + W * 0.46, cy + m.cos(t) * H * 0.32 + 8, az + m.sin(t) * H * 0.32 + 8); }
      a.xcyl(X0 + W * 0.5, X0 + W * 0.64, cy, az, H * 0.3, 20);
      a.xcyl(X0 + W * 0.64, X0 + W * 0.66, cy, az, H * 0.34, 20); a.xcyl(X0 + W * 0.46, X0 + W * 0.48, cy, az, H * 0.34, 20); a.xcyl(X0 + W * 0.5, X0 + W * 0.52, cy, az, H * 0.34, 20);
      a.xcyl(X1 - W * 0.34, X1 - W * 0.3, cy, az, H * 0.28, 16); a.tube([[X1 - W * 0.17, cy, az + H * 0.3], [X1 - W * 0.17, cy + D * 0.2, az + H * 0.5], [X1 - W * 0.17, cy + D * 0.2, Z1]], [8, 8, 8], 6); a.ell(X1 - W * 0.17, cy + D * 0.2, Z1 - 5, 14, 14, 14, 8, 5);
      a.box(X0 + W * 0.4, YF + 10, Z0 + H * 0.1, X0 + W * 0.58, YF + D * 0.2, Z0 + H * 0.3);
      a.rect(X0, YF, X1, YB); a.rect(X0 + W * 0.04, cy - D * 0.3, X0 + W * 0.3, cy + D * 0.3, 'EQUIP-DETAIL'); a.circ(X0 + W * 0.4, cy, D * 0.3, 'EQUIP-DETAIL'); a.circ(X0 + W * 0.57, cy, D * 0.28, 'EQUIP-DETAIL');
      a.log('Added the base plate, motor and gear housings, shaft, chain gypsy, rope drum, brake wheel, clutch handle and the chain-pipe stop (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic deck chock and fairlead',
    desc: (v) => `${v.kindText}, ${v.len} in: ${v.kind === 'closed' ? 'an oval ring chock on a base plate with two bolts and a smooth rope opening' : v.kind === 'roller' ? 'two side plates on a base with a rotating roller and a retaining pin' : 'an open-topped U-shaped Panama chock with a flared base and rolled lips'}.`,
    vs: [['closed chock', 8, 4, 3, 0, { kindText: 'Closed chock', kind: 'closed', len: 8 }], ['roller fairlead', 12, 5, 4, 0, { kindText: 'Roller fairlead', kind: 'roller', len: 12 }], ['Panama chock', 16, 6, 5, 0, { kindText: 'Open chock', kind: 'panama', len: 16 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
      a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.1);
      for (const s of [-1, 1]) { a.cyl(cx + s * W * 0.4, cy, Z0 + H * 0.1, Z0 + H * 0.16, D * 0.08, 6); a.circ(cx + s * W * 0.4, cy, D * 0.08, 'EQUIP-DETAIL'); }
      if (v.kind === 'closed') { const pts = []; for (let k = 0; k <= 20; k++) { const t = (k / 20) * TAU; pts.push([cx + m.cos(t) * W * 0.34, cy + m.sin(t) * D * 0.3, Z0 + H * 0.55 + m.sin(t * 2) * 0]); } a.tube(pts.map(([x, y, z]) => [x, y, Z0 + H * 0.1 + (z - Z0 - H * 0.1)]), pts.map(() => H * 0.28), 8); a.box(cx - W * 0.32, cy - D * 0.3, Z0 + H * 0.1, cx + W * 0.32, cy + D * 0.3, Z0 + H * 0.2); a.ellp(cx, cy, W * 0.32, D * 0.28, 'EQUIP-DETAIL'); }
      else if (v.kind === 'roller') { for (const s of [-1, 1]) a.box(cx + s * W * 0.3 - (s > 0 ? 0 : D * 0.0) - W * 0.04, YF + D * 0.1, Z0 + H * 0.1, cx + s * W * 0.3 + W * 0.04, YB - D * 0.1, Z1); a.xcyl(cx - W * 0.3, cx + W * 0.3, cy, Z0 + H * 0.58, H * 0.28, 14); a.xcyl(cx - W * 0.34, cx - W * 0.3, cy, Z0 + H * 0.58, H * 0.12, 8); a.line(cx - W * 0.3, cy, cx + W * 0.3, cy, 'EQUIP-DETAIL'); a.rect(cx - W * 0.3 - W * 0.04, YF + D * 0.1, cx + W * 0.3 + W * 0.04, YB - D * 0.1, 'EQUIP-DETAIL'); }
      else { for (const s of [-1, 1]) { prismX(a, [[YF + D * 0.1, Z0 + H * 0.1], [YB - D * 0.1, Z0 + H * 0.1], [YB - D * 0.2, Z1], [YF + D * 0.2, Z1]], cx + s * W * 0.34 - (s > 0 ? 0 : W * 0.1), cx + s * W * 0.34 + (s > 0 ? W * 0.1 : 0)); a.tube([[cx + s * W * 0.39, YF + D * 0.2, Z1], [cx + s * W * 0.39, YB - D * 0.2, Z1]], [H * 0.12, H * 0.12], 6); } a.box(cx - W * 0.34, YF + D * 0.1, Z0 + H * 0.1, cx + W * 0.34, YB - D * 0.1, Z0 + H * 0.28); a.rect(cx - W * 0.34, YF + D * 0.15, cx + W * 0.34, YB - D * 0.15, 'EQUIP-DETAIL'); }
      a.rect(X0, YF, X1, YB);
      a.log('Added the base plate with bolts and the ' + (v.kind === 'closed' ? 'oval ring' : v.kind === 'roller' ? 'side plates with roller' : 'U-shaped open body with rolled lips') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic deck hatch',
    desc: (v) => v.kind === 'round' ? `Round deck hatch, ${v.len} in: a raised ring frame, a domed lid with a central handle, two quarter-turn dogs and a hinge on the rear edge.` : v.kind === 'flush' ? `Flush rectangular deck hatch, ${v.len} in: a raised coaming frame, a flat lid with four dogs, a recessed pull and two rear hinges, shown closed.` : `Companionway hatch, ${v.len} in wide: a coaming with side rails, three stacked washboards in slots, a sliding curved cover with a grab handle at each side and a rear garage opening.`,
    vs: [['round, 12 in', 14, 14, 3, 0, { kind: 'round', len: 12 }], ['flush, 20 x 20 in', 22, 22, 3, 0, { kind: 'flush', len: 20 }], ['companionway, 24 in', 32, 40, 22, 0, { kind: 'comp', len: 24 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
      if (v.kind === 'round') {
        const R = W / 2; ring3(a, cx, cy, Z0 + H * 0.25, R * 0.85, H * 0.25, 20, 'z'); a.cyl(cx, cy, Z0, Z0 + H * 0.3, R, 24); a.cone(cx, cy, Z0 + H * 0.3, Z1 - H * 0.12, R * 0.82, R * 0.7, 24); a.ell(cx, cy, Z1 - H * 0.12, R * 0.7, R * 0.7, H * 0.18, 18, 6);
        a.tube([[cx - R * 0.2, cy, Z1 - 1], [cx - R * 0.2, cy, Z1 + 0.0 + H * 0.06 - 1], [cx + R * 0.2, cy, Z1 + H * 0.06 - 1], [cx + R * 0.2, cy, Z1 - 1]], [4, 4, 4, 4], 5);
        for (const s of [-1, 1]) { a.box(cx + s * R * 0.7 - 10, cy - R * 0.14, Z0 + H * 0.3, cx + s * R * 0.7 + 10, cy + R * 0.14, Z0 + H * 0.46); a.line(cx + s * R * 0.55, cy, cx + s * R * 0.85, cy, 'EQUIP-DETAIL'); }
        a.box(cx - R * 0.2, cy + R * 0.82, Z0 + H * 0.3, cx + R * 0.2, cy + R, Z0 + H * 0.5); a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 0.82, 'EQUIP-DETAIL');
      } else if (v.kind === 'flush') {
        a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.4); a.box(X0 + W * 0.08, YF + D * 0.08, Z0 + H * 0.4, X1 - W * 0.08, YB - D * 0.08, Z1); a.box(X0 + W * 0.2, YF + D * 0.2, Z1, X1 - W * 0.2, YF + D * 0.28, Z1 + 0.5 + 6);
        for (const [x, y] of [[X0 + W * 0.18, YF + D * 0.18], [X1 - W * 0.18, YF + D * 0.18], [X0 + W * 0.18, YB - D * 0.18], [X1 - W * 0.18, YB - D * 0.18]]) { a.cyl(x, y, Z1, Z1 + 8, W * 0.05, 8); a.box(x - W * 0.1, y - 3, Z1 + 8, x + W * 0.1, y + 3, Z1 + 12); a.circ(x, y, W * 0.05, 'EQUIP-DETAIL'); }
        for (const s of [-1, 1]) a.box(cx + s * W * 0.3 - 20, YB - 6, Z0 + H * 0.4, cx + s * W * 0.3 + 20, YB + 0 - 0.01 + 0, Z1);
        a.rect(X0, YF, X1, YB); a.rect(X0 + W * 0.08, YF + D * 0.08, X1 - W * 0.08, YB - D * 0.08, 'EQUIP-DETAIL');
      } else {
        a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.1);
        for (const s of [-1, 1]) { a.box(s > 0 ? X1 - W * 0.12 : X0, YF + D * 0.1, Z0 + H * 0.1, s > 0 ? X1 : X0 + W * 0.12, YB, Z1 - H * 0.1); a.tube([[cx + s * W * 0.4, YF + D * 0.12, Z1 - H * 0.1], [cx + s * W * 0.4, YB, Z1 - H * 0.1]], [10, 10], 6); a.tube([[cx + s * W * 0.43, YF + D * 0.55, Z1], [cx + s * W * 0.43, YF + D * 0.7, Z1], [cx + s * W * 0.43, YF + D * 0.7, Z1 - H * 0.12]], [8, 8, 8], 5); }
        for (let k = 0; k < 3; k++) a.box(X0 + W * 0.12 + 4, YF + D * 0.1, Z0 + H * 0.1 + k * H * 0.24, X1 - W * 0.12 - 4, YF + D * 0.1 + 28, Z0 + H * 0.1 + (k + 1) * H * 0.24 - 6);
        a.box(X0 + W * 0.12, YF + D * 0.1, Z1 - H * 0.1, X1 - W * 0.12, YF + D * 0.2, Z1 - H * 0.1 + 6);
        prismX(a, [[YF + D * 0.2, Z1 - H * 0.1], [YF + D * 0.36, Z1 + 0], [YB - D * 0.1, Z1 + 0], [YB - D * 0.1, Z1 - H * 0.1]], X0 + W * 0.04, X1 - W * 0.04);
        a.box(cx - W * 0.1, YF + D * 0.3, Z1, cx + W * 0.1, YF + D * 0.34, Z1 + 12); a.line(cx, YF + D * 0.1, cx, YB, 'EQUIP-DETAIL');
        a.rect(X0, YF, X1, YB); a.rect(X0 + W * 0.12, YF + D * 0.1, X1 - W * 0.12, YB - D * 0.1, 'EQUIP-DETAIL');
      }
      a.log('Added the ' + (v.kind === 'round' ? 'ring frame, domed lid, handle, dogs and hinge' : v.kind === 'flush' ? 'coaming, lid, four dogs, pull and hinges' : 'coaming rails, washboards, sliding cover and grab handles') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic guard rail section',
    desc: (v) => `Guard rail section, ${v.len} ft long and 24 in high: ${v.n} stanchions on base plates, two lifelines through each stanchion eye, end pull-pins with turnbuckles${v.gate ? ' and a gate with a hinged opening at one end' : ''}.`,
    vs: [['4 ft', 48, 4, 26, 0, { len: 4, n: 2, gate: false }], ['8 ft, with gate', 96, 4, 26, 0, { len: 8, n: 3, gate: true }], ['12 ft', 144, 4, 26, 0, { len: 12, n: 4, gate: false }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, sr = 14, zt = Z0 + H * 0.92, zm = Z0 + H * 0.52;
      const xs = Array.from({ length: v.n }, (_, i) => X0 + W * 0.04 + (i * W * 0.92) / (v.n - 1));
      xs.forEach((x, i) => { a.cyl(x, cy, Z0, Z0 + 14, D * 0.4, 12); a.cyl(x, cy, Z0 + 14, Z0 + 60, D * 0.22, 12); a.tube([[x, cy, Z0 + 14], [x, cy, zt]], [sr, sr * 0.9], 8); a.xcyl(x - 22, x + 22, cy, zt, sr * 0.6, 6); a.xcyl(x - 22, x + 22, cy, zm, sr * 0.6, 6); a.ell(x, cy, zt + sr, sr * 1.1, sr * 1.1, sr * 0.7, 8, 4); a.circ(x, cy, D * 0.4, 'EQUIP-DETAIL'); for (const [bx, by] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.cyl(x + bx * D * 0.28, cy + by * D * 0.2, Z0 + 14, Z0 + 24, 6, 5); });
      for (const z of [zt, zm]) a.tube(xs.map((x) => [x, cy, z]), xs.map(() => 5), 5);
      if (v.gate) { a.box(xs[1] - 18, cy - 10, zm - 40, xs[1] + 18, cy + 10, zt + 10); }
      for (const [x, s] of [[xs[0], -1], [xs[xs.length - 1], 1]]) for (const z of [zt, zm]) { a.xcyl(x + s * 20, x + s * 120, cy, z, 8, 6); a.box(x + s * 120 - 14, cy - 12, z - 12, x + s * 120 + 14, cy + 12, z + 12); }
      a.rect(X0, cy - D * 0.4, X1, cy + D * 0.4, 'EQUIP-DETAIL'); a.line(X0, cy, X1, cy, 'EQUIP'); xs.forEach((x) => a.circ(x, cy, D * 0.3, 'EQUIP'));
      a.log('Added ' + v.n + ' stanchions with base plates and eyes, two lifelines, end pull-pins' + (v.gate ? ' and the gate' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic boat anchor',
    desc: (v) => v.kind === 'fluke' ? `Fluke-type anchor, ${v.len} in long: a flat shank with a shackle eye, a crown with two broad pivoting flukes with pointed tips and a cross stock through the crown, lying flat.` : `Plough-type anchor, ${v.len} in long: a bent shank with a shackle eye, a ploughshare blade with a pointed tip and a hinged shank pivot, lying flat.`,
    vs: [['fluke, 28 in', 14, 28, 5, 0, { kind: 'fluke', len: 28 }], ['fluke, 44 in', 22, 44, 7, 0, { kind: 'fluke', len: 44 }], ['plough, 36 in', 18, 36, 11, 0, { kind: 'plough', len: 36 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
      if (v.kind === 'fluke') {
        prismX(a, [[YF + D * 0.04, Z0 + H * 0.5], [YF + D * 0.04, Z1 - H * 0.1], [YF + D * 0.6, Z1 - H * 0.1], [YF + D * 0.66, Z0 + H * 0.5]], cx - W * 0.04, cx + W * 0.04);
        a.xcyl(cx - W * 0.04, cx + W * 0.04, YF + D * 0.04, Z0 + H * 0.6, H * 0.36, 12); a.circ(cx, YF + D * 0.04, H * 0.36, 'EQUIP-DETAIL');
        a.box(cx - W * 0.1, YF + D * 0.58, Z0, cx + W * 0.1, YF + D * 0.72, Z1 - H * 0.2);
        for (const s of [-1, 1]) prismY(a, [[cx + s * W * 0.06, Z0 + H * 0.1], [cx + s * W * 0.5, Z0 + H * 0.12], [cx + s * W * 0.5, Z0 + H * 0.35], [cx + s * W * 0.06, Z0 + H * 0.4]].map((q) => q), s > 0 ? YF + D * 0.5 : YF + D * 0.5, YB - D * 0.0 - 6);
        a.xcyl(cx - W * 0.5, cx + W * 0.5, YF + D * 0.7, Z0 + H * 0.65, H * 0.1, 8); for (const s of [-1, 1]) a.ell(cx + s * W * 0.5, YF + D * 0.7, Z0 + H * 0.65, H * 0.16, H * 0.16, H * 0.16, 8, 5);
        a.poly([[cx - W * 0.04, YF + D * 0.04], [cx + W * 0.04, YF + D * 0.04], [cx + W * 0.1, YF + D * 0.58], [cx + W * 0.5, YF + D * 0.5], [cx + W * 0.5, YB], [cx - W * 0.5, YB], [cx - W * 0.5, YF + D * 0.5], [cx - W * 0.1, YF + D * 0.58]]);
        a.line(cx - W * 0.5, YF + D * 0.7, cx + W * 0.5, YF + D * 0.7, 'EQUIP-DETAIL');
      } else {
        a.tube([[cx, YF + D * 0.03, Z0 + H * 0.6], [cx, YF + D * 0.3, Z0 + H * 0.65], [cx, YF + D * 0.6, Z0 + H * 0.5], [cx, YB - D * 0.2, Z0 + H * 0.4]], [H * 0.1, H * 0.12, H * 0.12, H * 0.12], 10);
        a.xcyl(cx - W * 0.05, cx + W * 0.05, YF + D * 0.03, Z0 + H * 0.6, H * 0.34, 12); a.circ(cx, YF + D * 0.03, H * 0.34, 'EQUIP-DETAIL');
        prismY(a, [[cx - W * 0.1, Z0 + H * 0.15], [cx + W * 0.1, Z0 + H * 0.15], [cx + W * 0.5, Z0 + H * 0.4], [cx - W * 0.5, Z0 + H * 0.4]], YF + D * 0.58, YB - D * 0.1);
        prismY(a, [[cx - W * 0.5, Z0 + H * 0.4], [cx + W * 0.5, Z0 + H * 0.4], [cx + W * 0.4, Z0 + H * 0.5], [cx - W * 0.4, Z0 + H * 0.5]], YF + D * 0.62, YB - D * 0.18);
        a.poly([[cx - W * 0.05, YF + D * 0.03], [cx + W * 0.05, YF + D * 0.03], [cx + W * 0.1, YF + D * 0.58], [cx + W * 0.5, YF + D * 0.7], [cx, YB], [cx - W * 0.5, YF + D * 0.7], [cx - W * 0.1, YF + D * 0.58]]);
      }
      a.log('Added the shank with shackle eye and the ' + (v.kind === 'fluke' ? 'crown, two flukes and cross stock' : 'ploughshare blade') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic anchor chain pile',
    desc: () => 'Coiled anchor chain pile, about 100 ft of 3/8 in chain: five stacked rings of chain laid in a circle with a rope-tail end and a shackle on top, as stowed in a chain locker.',
    vs: [['100 ft of 3/8 in', 26, 26, 14, 0, {}]],
    build: (a) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, H } = a, R = W * 0.38;
      for (let k = 0; k < 5; k++) { const zz = Z0 + 30 + k * (H - 90) / 5; for (let j = 0; j < 2; j++) ring3(a, cx + (k % 2) * 8, cy, zz + j * 24, R * (1 - k * 0.07) - j * 36, 14, 22, 'z'); }
      for (let k = 0; k < 18; k++) { const t = (k / 18) * TAU; const rr = R * 0.9; a.box(cx + m.cos(t) * rr - 22, cy + m.sin(t) * rr - 22, Z0 + 12, cx + m.cos(t) * rr + 22, cy + m.sin(t) * rr + 22, Z0 + 40); }
      a.cyl(cx, cy, Z0 + 5, Z0 + 18, W * 0.5 - 10, 24);
      a.tube([[cx + R * 0.4, cy, Z1 - 40], [cx + R * 0.7, cy + 40, Z1 - 20], [cx + R * 0.9, cy + R * 0.5, Z0 + 40]], [18, 18, 18], 8); a.box(cx + R * 0.35, cy - 30, Z1 - 70, cx + R * 0.5, cy + 30, Z1 - 20);
      a.circ(cx, cy, W / 2, 'EQUIP'); a.circ(cx, cy, R, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.55, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.25, 'EQUIP-DETAIL');
      a.log('Added the base ring, five stacked coils of chain links, the shackle and the rope tail (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic mast and boom',
    desc: (v) => v.kind === 'boom' ? `Sailboat boom, ${v.len} ft: an oval aluminium-style section with a gooseneck fitting at the mast end, an end sheave box, a kicker bracket, a mainsheet bail and a slot along the top for the sail.` : `Sailboat mast, ${v.len} ft: a tapered oval section on a deck boot, two sets of spreaders, a masthead cap with a wind vane, halyard sheave boxes, a sail track on the back and shroud tangs.`,
    vs: [['mast, 30 ft', 12, 14, 372, 0, { kind: 'mast', len: 30, sp: 2 }], ['mast, 45 ft', 18, 20, 560, 0, { kind: 'mast', len: 45, sp: 3 }], ['boom, 14 ft', 8, 170, 8, 0, { kind: 'boom', len: 14 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
      if (v.kind === 'boom') {
        const bz = Z0 + H * 0.5; a.tube([[cx, YF + 30, bz], [cx, (YF + YB) / 2, bz], [cx, YB - 30, bz]], [H * 0.38, H * 0.42, H * 0.3], 12);
        a.box(cx - 30, YF + 4, bz - H * 0.4, cx + 30, YF + D * 0.04, bz + H * 0.3); a.box(cx - 24, YF + D * 0.04, bz + H * 0.3, cx + 24, YF + D * 0.1, bz + H * 0.4);
        a.box(cx - 18, YB - 150, bz - H * 0.4, cx + 18, YB - 20, bz + H * 0.4); a.box(cx - 30, YB - 60, bz - H * 0.2, cx + 30, YB - 20, bz + H * 0.2);
        a.box(cx - 8, YF + D * 0.1, bz + H * 0.4, cx + 8, YB - 150, bz + H * 0.46);
        a.box(cx - 20, YF + D * 0.22, bz - H * 0.46, cx + 20, YF + D * 0.28, bz - H * 0.3); a.tube([[cx, YF + D * 0.25, bz - H * 0.5], [cx, YF + D * 0.25, bz - H * 0.5 - 40]], [6, 6], 5);
        a.tube([[cx, YB * 0.5 + YF * 0.5, bz - H * 0.4], [cx, YB * 0.5 + YF * 0.5 + 40, bz - H * 0.4 - 60], [cx, YB * 0.5 + YF * 0.5 + 80, bz - H * 0.4]], [8, 8, 8], 5);
        a.rect(cx - 30, YF, cx + 30, YB); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL');
        a.log('Added the boom section with gooseneck fitting, end sheave box, kicker bracket, mainsheet bail and sail slot (plan and 3D).');
        return;
      }
      const R = W * 0.3, Ry = D * 0.42;
      a.box(cx - R * 1.6, cy - Ry * 1.2, Z0, cx + R * 1.6, cy + Ry * 1.2, Z0 + 30); a.cone(cx, cy, Z0 + 30, Z0 + 120, R * 1.5, R * 1.15, 14);
      const pts = [[cx, cy, Z0 + 100], [cx, cy, Z0 + H * 0.4], [cx, cy, Z0 + H * 0.8], [cx, cy, Z1 - 120], [cx, cy, Z1 - 60]]; a.tube(pts, [R * 1.05, R, R * 0.8, R * 0.52, R * 0.4], 14);
      a.box(cx - 6, cy + Ry * 0.9, Z0 + 200, cx + 6, cy + Ry * 1.05, Z1 - 200);
      for (let k = 0; k < v.sp; k++) { const z = Z0 + H * (0.35 + k * (0.45 / v.sp)), sw = W * (0.46 - k * 0.07); a.tube([[cx - sw, cy, z + 40], [cx, cy, z], [cx + sw, cy, z + 40]], [R * 0.2, R * 0.28, R * 0.2], 6); a.tube([[cx - sw, cy, z + 40], [cx - sw * 0.5, cy, z + 280]], [8, 8], 4); a.tube([[cx + sw, cy, z + 40], [cx + sw * 0.5, cy, z + 280]], [8, 8], 4); a.line(cx - sw, cy, cx + sw, cy, 'EQUIP-DETAIL'); }
      a.box(cx - R * 1.1, cy - Ry * 0.9, Z1 - 100, cx + R * 1.1, cy + Ry * 0.9, Z1 - 60); a.cyl(cx, cy, Z1 - 60, Z1 - 20, R * 0.3, 8); a.tube([[cx, cy, Z1 - 20], [cx, cy + 100, Z1 - 4]], [4, 4], 4);
      for (const z of [0.78, 0.92]) a.box(cx - R * 0.5, cy - Ry * 1.05, Z0 + H * z, cx + R * 0.5, cy - Ry * 0.9, Z0 + H * z + 90);
      for (const s of [-1, 1]) for (const z of [0.4, 0.6]) a.box(cx + s * R * 0.95 - 6, cy - 12, Z0 + H * z, cx + s * R * 0.95 + 6, cy + 12, Z0 + H * z + 60);
      a.ellp(cx, cy, R, Ry); a.line(cx - W * 0.46, cy, cx + W * 0.46, cy, 'EQUIP-DETAIL'); a.rect(cx - R * 1.6, cy - Ry * 1.2, cx + R * 1.6, cy + Ry * 1.2, 'EQUIP-HIDDEN');
      a.log('Added the deck boot, tapered oval mast, ' + v.sp + ' spreader sets with shroud tangs, halyard sheave boxes, sail track and the masthead cap with vane (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic boat steering pedestal',
    desc: (v) => `Steering pedestal with a ${v.wheel} in wheel: a base flange with bolts, a tapered column, a compass binnacle with a domed glass, a ${v.spokes}-spoke wheel with a rim and hub nut, a single-lever throttle and a grab rail across the top.`,
    vs: [['24 in wheel', 28, 28, 42, 0, { wheel: 24, spokes: 6 }], ['32 in wheel', 36, 32, 46, 0, { wheel: 32, spokes: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, wr = v.wheel * I / 2, wz = Z1 - v.wheel * I / 2 - 30, wy = cy - D * 0.1;
      a.cyl(cx, cy, Z0, Z0 + 20, D * 0.38, 20); for (let k = 0; k < 4; k++) { const t = (k / 4) * TAU + 0.78; a.cyl(cx + m.cos(t) * D * 0.3, cy + m.sin(t) * D * 0.3, Z0 + 20, Z0 + 30, 9, 6); a.circ(cx + m.cos(t) * D * 0.3, cy + m.sin(t) * D * 0.3, 9, 'EQUIP-DETAIL'); }
      a.tube([[cx, cy, Z0 + 20], [cx, cy, Z0 + H * 0.3], [cx, cy, Z0 + H * 0.7]], [D * 0.27, D * 0.2, D * 0.16], 16);
      sup(a, [{ y: cy - D * 0.2, x: cx, rx: D * 0.18, z0: Z0 + H * 0.7, z1: Z0 + H * 0.74 }, { y: cy - D * 0.05, x: cx, rx: D * 0.2, z0: Z0 + H * 0.66, z1: Z0 + H * 0.78 }, { y: cy + D * 0.2, x: cx, rx: D * 0.16, z0: Z0 + H * 0.68, z1: Z0 + H * 0.74 }], { seg: 12, n: 2.4 });
      a.ycyl(wy - 30, cy + D * 0.1, cx, wz, D * 0.09, 12); a.ycyl(wy - 40, wy - 30, cx, wz, D * 0.06, 10);
      ring3(a, cx, wy - 20, wz, wr, 14, 24, 'y');
      for (let k = 0; k < v.spokes; k++) { const t = (k / v.spokes) * TAU; a.tube([[cx, wy - 10, wz], [cx + m.cos(t) * wr, wy - 20, wz + m.sin(t) * wr]], [14, 10], 6); a.ell(cx + m.cos(t) * wr * 1.0, wy - 20, wz + m.sin(t) * wr * 1.0, 14, 14, 14, 6, 4); }
      a.ell(cx + D * 0.25, cy + D * 0.05, Z0 + H * 0.74 + 30, 38, 38, 32, 10, 6); a.cyl(cx + D * 0.25, cy + D * 0.05, Z0 + H * 0.74, Z0 + H * 0.74 + 20, 36, 10);
      a.tube([[cx - D * 0.17, cy + D * 0.15, Z0 + H * 0.72], [cx - D * 0.3, cy + D * 0.15, Z0 + H * 0.82]], [9, 9], 5); a.ell(cx - D * 0.3, cy + D * 0.15, Z0 + H * 0.83, 14, 14, 14, 6, 4);
      a.circ(cx, cy, D * 0.38, 'EQUIP'); a.circ(cx, cy, D * 0.16, 'EQUIP-DETAIL'); a.ellp(cx, wy - 20, wr, 14, 'EQUIP-DETAIL');
      a.log('Added the flange, tapered column, binnacle with compass, spoked wheel, throttle lever and bolts (plan and 3D).');
    } }),

  // ===================================================== harbour =====================================================
  fam({ cat: 'marine/harbour', title: 'Generic floating pontoon section',
    desc: (v) => `Floating pontoon section, ${v.ft} ft long and ${v.wd} ft wide: a hollow-style float with sloped sides, a timber-strip deck, rubbing strakes along both edges, four horn cleats, end connector hinges and a ${v.fin ? 'finger berth side with a bumper' : 'flush access hatch'}.`,
    vs: [['10 ft walkway', 72, 120, 20, 0, { ft: 10, wd: 6, fin: false }], ['20 ft berth', 96, 240, 22, 0, { ft: 20, wd: 8, fin: true }], ['30 ft main walkway', 120, 360, 24, 0, { ft: 30, wd: 10, fin: false }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, dz = Z0 + H * 0.72;
      prismX(a, [[YF + 20, dz - 20], [YF + 120, Z0 + 20], [YB - 120, Z0 + 20], [YB - 20, dz - 20]], X0 + 60, X1 - 60);
      prismY(a, [[X0 + 20, dz - 10], [X0 + W * 0.1, Z0 + 30], [X1 - W * 0.1, Z0 + 30], [X1 - 20, dz - 10]], YF + 10, YB - 10);
      a.box(X0 + 20, YF + 20, dz - 20, X1 - 20, YB - 20, Z1 - H * 0.08);
      for (let k = 1; k < 20; k++) a.line(X0 + 20, YF + 20 + ((D - 40) * k) / 20, X1 - 20, YF + 20 + ((D - 40) * k) / 20, 'EQUIP-DETAIL');
      for (const s of [-1, 1]) { a.box(s > 0 ? X1 - 36 : X0, YF + 10, dz - 60, s > 0 ? X1 : X0 + 36, YB - 10, Z1 - H * 0.04); }
      for (const [fx, fy] of [[0.12, 0.1], [0.12, 0.9], [0.88, 0.1], [0.88, 0.9]]) { const x = X0 + W * fx, y = YF + D * fy; a.box(x - 60, y - 14, Z1 - H * 0.08, x + 60, y + 14, Z1 - H * 0.08 + 14); for (const s of [-1, 1]) a.ell(x + s * 55, y, Z1 - H * 0.08 + 26, 22, 18, 24, 8, 5); a.rect(x - 60, y - 14, x + 60, y + 14, 'EQUIP-DETAIL'); }
      for (const y of [YF + 6, YB - 6]) for (const z of [0.3, 0.6]) for (const s of [-1, 1]) a.box(cx + s * W * 0.28 - 50, y - 6, Z0 + H * z, cx + s * W * 0.28 + 50, y + 6, Z0 + H * z + 36);
      if (v.fin) { a.ell(X1, cy, dz - 40, 30, D * 0.2, 60, 8, 5); a.rect(X1 - 40, cy - D * 0.2, X1, cy + D * 0.2, 'EQUIP-DETAIL'); }
      else { a.box(cx - 180, cy - 180, Z1 - H * 0.08, cx + 180, cy + 180, Z1 - H * 0.08 + 10); a.box(cx - 40, cy + 170, Z1 - H * 0.08, cx + 40, cy + 190, Z1 - H * 0.08 + 20); a.rect(cx - 180, cy - 180, cx + 180, cy + 180, 'EQUIP-DETAIL'); }
      a.outline();
      a.log('Added the sloped float, timber-strip deck, rubbing strakes, four cleats, end connector hinges and ' + (v.fin ? 'the finger bumper' : 'the access hatch') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic fixed jetty section',
    desc: (v) => `Fixed timber jetty section, ${v.ft} ft by ${v.wd} ft: ${v.np} round piles with cap beams, longitudinal stringers, a plank deck with joint lines, ${v.rail ? 'a posted handrail on both edges, ' : ''}two bollards and ${v.lad ? 'a boarding ladder over the side' : 'a kerb strip along the edges'}.`,
    vs: [['10 ft bay', 72, 120, 90, 0, { ft: 10, wd: 6, np: 4, rail: false, lad: false }], ['20 ft bay with handrail', 96, 240, 132, 0, { ft: 20, wd: 8, np: 6, rail: true, lad: true }], ['T-head, 20 by 20 ft', 240, 240, 132, 0, { ft: 20, wd: 20, np: 9, rail: true, lad: false }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, dz = Z0 + H * 0.62, pr = 130;
      const nx = v.np === 9 ? 3 : 2, ny = v.np / nx;
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const x = X0 + 120 + (i * (W - 240)) / (nx - 1), y = YF + 120 + (j * (D - 240)) / (ny - 1); a.cyl(x, y, Z0, dz - 100, pr, 12); a.circ(x, y, pr, 'EQUIP-DETAIL'); a.box(x - pr * 1.1, y - pr * 1.1, dz - 160, x + pr * 1.1, y + pr * 1.1, dz - 100); }
      for (let j = 0; j < ny; j++) { const y = YF + 120 + (j * (D - 240)) / (ny - 1); a.box(X0 + 40, y - 100, dz - 100, X1 - 40, y + 100, dz - 30); }
      for (let i = 0; i < nx + 1; i++) { const x = X0 + 80 + (i * (W - 160)) / nx; a.box(x - 40, YF + 40, dz - 30, x + 40, YB - 40, dz); }
      const np = m.round((D - 80) / 120);
      for (let k = 0; k < np; k++) { const y0 = YF + 40 + ((D - 80) * k) / np; a.box(X0 + 20, y0 + 4, dz, X1 - 20, y0 + (D - 80) / np - 4, dz + 40); }
      for (const [bx, by] of [[0.2, 0.06], [0.8, 0.94]]) { const x = X0 + W * bx, y = YF + D * by; a.cyl(x, y, dz + 40, dz + 200, 55, 10); a.cyl(x, y, dz + 200, dz + 240, 80, 10); a.circ(x, y, 70, 'EQUIP-DETAIL'); }
      if (v.rail) for (const s of [-1, 1]) { rail(a, s > 0 ? X1 - 30 : X0 + 30, YF + 40, s > 0 ? X1 - 30 : X0 + 30, YB - 40, dz + 40, dz + 1000, 22, m.round(D / 700) + 1, 2); }
      else for (const s of [-1, 1]) a.box(s > 0 ? X1 - 70 : X0 + 10, YF + 40, dz + 40, s > 0 ? X1 - 10 : X0 + 70, YB - 40, dz + 100);
      if (v.lad) for (const s of [1]) { for (const k of [-1, 1]) a.tube([[X1 + 0 - 60, cy + k * 220, dz + 40], [X1 - 60, cy + k * 220, Z0 + H * 0.1]], [16, 16], 6); for (let r = 0; r < 6; r++) a.xcyl(X1 - 70, X1 - 50, cy, dz - 100 - r * 140, 14, 6); a.rect(X1 - 80, cy - 240, X1 - 40, cy + 240, 'EQUIP-DETAIL'); }
      a.outline(); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL');
      a.log('Added the piles with caps, stringers, plank deck, two bollards, ' + (v.rail ? 'posted handrails' : 'edge kerbs') + (v.lad ? ' and the boarding ladder' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic harbour fender',
    desc: (v) => v.kind === 'cyl' ? `Cylindrical rubber fender, ${v.dia} in by ${v.len} in: a hollow rubber tube with a through bore, hung horizontally on a steel chain from two eye brackets, with end caps.` : v.kind === 'D' ? `D-profile rubber fender, ${v.dia} in by ${v.len} in: an extruded D section with a flat mounting face, a bolt row and two end chamfers, standing along its length.` : `Pneumatic fender, ${v.dia} in by ${v.len} in: a cylindrical rubber body with domed ends, end flanges with eyes, a chain-and-tyre net stage and a pressure valve.`,
    vs: [['cylindrical, 12 x 48 in', 14, 50, 14, 0, { kind: 'cyl', dia: 12, len: 48 }], ['D profile, 10 x 72 in', 12, 14, 76, 0, { kind: 'D', dia: 10, len: 72 }], ['pneumatic, 36 x 72 in', 40, 76, 40, 0, { kind: 'pneu', dia: 36, len: 72 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
      if (v.kind === 'cyl') {
        const R = H * 0.42, zc = Z0 + H * 0.5; a.ycyl(YF + 20, YB - 20, cx, zc, R, 18); a.ycyl(YF + 20, YF + 34, cx, zc, R * 1.05, 18); a.ycyl(YB - 34, YB - 20, cx, zc, R * 1.05, 18);
        a.ycyl(YF + 40, YB - 40, cx, zc, R * 0.3, 10); 
        for (const y of [YF + D * 0.18, YB - D * 0.18]) { a.tube([[cx, y, zc + R], [cx - 25, y, Z1 - 4], [cx + 25, y, Z1 - 4], [cx, y, zc + R]], [4, 4, 4, 4], 5); a.ell(cx, y, Z1 - 10, 24, 10, 12, 8, 5); }
        a.rect(X0 + 10, YF + 20, X1 - 10, YB - 20); a.line(X0 + 10, cy, X1 - 10, cy, 'EQUIP-DETAIL');
      } else if (v.kind === 'D') {
        const nSeg = 10;
        const hx = W * 0.45, hy = D * 0.8;
        for (let i = 0; i < nSeg; i++) { const t0 = (i / nSeg) * m.PI, t1 = ((i + 1) / nSeg) * m.PI, p0 = [cx + m.cos(t0) * hx, YB - 20 - m.sin(t0) * hy], p1 = [cx + m.cos(t1) * hx, YB - 20 - m.sin(t1) * hy]; a.t.push([[p0[0], p0[1], Z0 + 20], [p1[0], p1[1], Z0 + 20], [cx, YB - 20, Z0 + 20]], [[p0[0], p0[1], Z1 - 20], [cx, YB - 20, Z1 - 20], [p1[0], p1[1], Z1 - 20]], [[p0[0], p0[1], Z0 + 20], [p1[0], p1[1], Z0 + 20], [p1[0], p1[1], Z1 - 20]], [[p0[0], p0[1], Z0 + 20], [p1[0], p1[1], Z1 - 20], [p0[0], p0[1], Z1 - 20]]); }
        a.box(cx - hx, YB - 26, Z0, cx + hx, YB - 14, Z1);
        for (let k = 0; k < 5; k++) { a.cyl(cx - hx * 0.6, YB - 30, Z0 + H * (0.12 + k * 0.19), Z0 + H * (0.12 + k * 0.19) + 4, 10, 6); a.cyl(cx + hx * 0.6, YB - 30, Z0 + H * (0.12 + k * 0.19), Z0 + H * (0.12 + k * 0.19) + 4, 10, 6); }
        a.poly([[cx + hx, YB - 20], ...Array.from({ length: nSeg + 1 }, (_, i) => { const t = (i / nSeg) * m.PI; return [cx + m.cos(t) * hx, YB - 20 - m.sin(t) * hy]; })]);
        a.rect(cx - hx, YB - 26, cx + hx, YB - 14, 'EQUIP-DETAIL');
      } else {
        const R = H * 0.4, zc = Z0 + H * 0.5, e0 = YF + R * 0.85, e1 = YB - R * 0.85; a.ycyl(e0, e1, cx, zc, R, 20); a.ell(cx, e0, zc, R, R * 0.8, R, 14, 8); a.ell(cx, e1, zc, R, R * 0.8, R, 14, 8);
        for (const y of [e0 + R * 0.1, e1 - R * 0.1]) { ring3(a, cx, y, zc, R * 1.0, 10, 20, 'x'); }
        for (let k = 0; k < 8; k++) { const t = (k / 8) * TAU; a.tube([[cx + m.cos(t) * R * 1.01, e0, zc + m.sin(t) * R * 1.01], [cx + m.cos(t + 0.5) * R * 1.01, cy, zc + m.sin(t + 0.5) * R * 1.01], [cx + m.cos(t) * R * 1.01, e1, zc + m.sin(t) * R * 1.01]], [8, 8, 8], 4); }
        for (let k = 0; k < 4; k++) { const y = lerp(e0 + R * 0.5, e1 - R * 0.5, k / 3); a.xcyl(cx - R * 1.05, cx + R * 1.05, y, zc, 22, 8); }
        for (const y of [YF + 40, YB - 40]) { a.xcyl(cx - 18, cx + 18, y, zc, 40, 8); }
        a.cyl(cx, cy, zc + R, zc + R + 40, 18, 8); a.rect(X0 + W * 0.05, YF + R * 0.4, X1 - W * 0.05, YB - R * 0.4); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL');
      }
      a.log('Added the ' + (v.kind === 'cyl' ? 'rubber tube with end caps and hanging chain eyes' : v.kind === 'D' ? 'D-section body, mounting flange and bolt row' : 'domed body, end flanges, chain-and-tyre net and valve') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic quay bollard',
    desc: (v) => `${v.kindText} quay bollard, ${v.pull} class: a base plate with ${v.bolts} anchor bolts, ${v.kind === 'mush' ? 'a short column with a wide domed mushroom head' : v.kind === 'tee' ? 'a casting with a tee head and a curved neck' : 'two upright bitts on a shared base with a cross-over line groove'}.`,
    vs: [['tee head, 30 t pull', 18, 18, 18, 0, { kindText: 'Tee-head', kind: 'tee', pull: '30 tonne', bolts: 4 }], ['double bitt, 60 t pull', 36, 22, 22, 0, { kindText: 'Double-bitt', kind: 'bitt', pull: '60 tonne', bolts: 6 }], ['mushroom head, 100 t pull', 30, 30, 26, 0, { kindText: 'Mushroom-head', kind: 'mush', pull: '100 tonne', bolts: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pt = H * 0.08;
      a.box(X0, YF, Z0, X1, YB, Z0 + pt);
      for (let k = 0; k < v.bolts; k++) { const t = (k / v.bolts) * TAU + 0.4, x = cx + m.cos(t) * (W * 0.44), y = cy + m.sin(t) * (D * 0.44); a.cyl(x, y, Z0 + pt, Z0 + pt + 22, 18, 6); a.circ(x, y, 18, 'EQUIP-DETAIL'); }
      if (v.kind === 'bitt') { for (const s of [-1, 1]) { a.cyl(cx + s * W * 0.25, cy, Z0 + pt, Z1 - H * 0.12, D * 0.22, 14); a.cone(cx + s * W * 0.25, cy, Z1 - H * 0.12, Z1, D * 0.26, D * 0.2, 14); a.circ(cx + s * W * 0.25, cy, D * 0.22, 'EQUIP-DETAIL'); } a.box(cx - W * 0.25, cy - D * 0.12, Z0 + pt, cx + W * 0.25, cy + D * 0.12, Z0 + H * 0.35); a.rect(X0, YF, X1, YB); }
      else if (v.kind === 'mush') { a.cone(cx, cy, Z0 + pt, Z0 + H * 0.62, D * 0.3, D * 0.2, 16); a.tube([[cx, cy, Z0 + H * 0.6], [cx, cy, Z0 + H * 0.68], [cx, cy, Z0 + H * 0.78], [cx, cy, Z1]], [D * 0.2, D * 0.34, D * 0.44, D * 0.1], 18); a.circ(cx, cy, D * 0.44, 'EQUIP'); a.circ(cx, cy, D * 0.2, 'EQUIP-DETAIL'); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); }
      else { a.cone(cx, cy, Z0 + pt, Z0 + H * 0.55, D * 0.3, D * 0.2, 16); a.box(cx - W * 0.4, cy - D * 0.2, Z0 + H * 0.5, cx + W * 0.4, cy + D * 0.2, Z0 + H * 0.68); a.xcyl(cx - W * 0.4, cx + W * 0.4, cy, Z0 + H * 0.78, D * 0.17, 14); a.ell(cx - W * 0.4, cy, Z0 + H * 0.78, D * 0.17, D * 0.17, D * 0.17, 10, 6); a.ell(cx + W * 0.4, cy, Z0 + H * 0.78, D * 0.17, D * 0.17, D * 0.17, 10, 6); a.rect(cx - W * 0.4, cy - D * 0.2, cx + W * 0.4, cy + D * 0.2, 'EQUIP-DETAIL'); a.rect(X0, YF, X1, YB); }
      a.log('Added the base plate with ' + v.bolts + ' anchor bolts and the ' + (v.kind === 'bitt' ? 'two bitts with caps' : v.kind === 'mush' ? 'column and domed mushroom head' : 'tee-head casting') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic boat slipway',
    desc: (v) => `Boat slipway, ${v.ft} ft long: a sloping concrete ramp with edge kerbs, two steel rails with sleepers, a launching cradle with four wheels, keel bunks and side supports, and a winch shed with a drum and a haul cable at the top.`,
    vs: [['40 ft ramp', 150, 480, 84, 0, { ft: 40 }], ['60 ft ramp', 168, 720, 110, 0, { ft: 60 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, rz = (y) => Z0 + 40 + (H - 360) * ((y - YF) / D) * 0.8;
      const yw = YB - 700, zw = Z0 + 300;
      prismX(a, [[YF, Z0], [YF, Z0 + 60], [yw, Z0 + 60 + (H - 400) * 0.6], [yw, Z0 + 20 + (H - 400) * 0.6]].map((p2) => p2), X0 + 20, X1 - 20);
      a.box(X0 + 10, yw, Z0, X1 - 10, YB, Z0 + 60 + (H - 400) * 0.6);
      for (const s of [-1, 1]) prismX(a, [[YF, Z0 + 60], [YF, Z0 + 130], [yw, Z0 + 130 + (H - 400) * 0.6], [yw, Z0 + 60 + (H - 400) * 0.6]], s > 0 ? X1 - 70 : X0 + 20, s > 0 ? X1 - 20 : X0 + 70);
      const ry = (y) => Z0 + 60 + (H - 400) * 0.6 * ((y - YF) / (yw - YF));
      for (const s of [-1, 1]) { const x = cx + s * W * 0.22; a.tube([[x, YF + 10, ry(YF + 10) + 40], [x, yw, ry(yw) + 40]], [20, 20], 6); for (let k = 0; k < 14; k++) { const y = lerp(YF + 30, yw - 30, k / 13); a.box(x - 60, y - 14, ry(y) + 8, x + 60, y + 14, ry(y) + 28); } a.line(x, YF, x, yw, 'EQUIP-DETAIL'); }
      const cyc = YF + (yw - YF) * 0.3, cl = 900;
      for (const s of [-1, 1]) for (const dy of [-0.32, 0.32]) { const x = cx + s * W * 0.22, y = cyc + dy * cl, z = ry(y) + 40; a.xcyl(x - 40, x + 40, y, z + 70, 70, 10); }
      prismX(a, [[cyc - cl / 2, ry(cyc - cl / 2) + 120], [cyc + cl / 2, ry(cyc + cl / 2) + 120], [cyc + cl / 2, ry(cyc + cl / 2) + 220], [cyc - cl / 2, ry(cyc - cl / 2) + 220]], cx - W * 0.25, cx + W * 0.25);
      for (const s of [-1, 1]) { a.box(cx + s * W * 0.07 - 16, cyc - cl / 2, ry(cyc) + 220, cx + s * W * 0.07 + 16, cyc + cl / 2, ry(cyc) + 300); a.box(cx + s * W * 0.2 - 20, cyc - cl * 0.3, ry(cyc) + 160, cx + s * W * 0.2 + 20, cyc + cl * 0.3, ry(cyc) + 520); }
      a.box(cx - W * 0.4, YB - 640, Z0 + 60 + (H - 400) * 0.6, cx + W * 0.4, YB - 20, Z0 + 60 + (H - 400) * 0.6 + 260); a.box(cx - W * 0.44, YB - 660, Z0 + 60 + (H - 400) * 0.6 + 260, cx + W * 0.44, YB - 10, Z0 + 60 + (H - 400) * 0.6 + 300);
      a.xcyl(cx - W * 0.3, cx + W * 0.3, YB - 320, Z0 + 60 + (H - 400) * 0.6 + 130, 90, 12);
      a.tube([[cx, YB - 640, Z0 + 60 + (H - 400) * 0.6 + 130], [cx, cyc + 200, ry(cyc + 200) + 220]], [8, 8], 4);
      a.rect(X0 + 20, YF, X1 - 20, yw, 'EQUIP'); for (const s of [-1, 1]) a.line(cx + s * W * 0.22, YF, cx + s * W * 0.22, yw, 'EQUIP-DETAIL'); a.rect(cx - W * 0.4, YB - 640, cx + W * 0.4, YB - 20, 'EQUIP-DETAIL'); a.rect(cx - W * 0.25, cyc - cl / 2, cx + W * 0.25, cyc + cl / 2, 'EQUIP-DETAIL');
      a.log('Added the sloping ramp with kerbs, two steel rails with sleepers, the wheeled launching cradle with bunks and side supports, and the winch shed with drum and haul cable (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic quay jib crane',
    desc: (v) => `Quayside jib crane, ${v.cap} t class: a fixed pedestal on a base plate, a slewing deck with a cab and a counterweight, a luffing lattice jib with a sheave head, a hoist rope with a hook block and a ladder up the pedestal.`,
    vs: [['5 t', 160, 200, 330, 0, { cap: 5, jl: 0.86 }], ['25 t', 260, 340, 540, 0, { cap: 25, jl: 0.9 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pr = W * 0.18, cz = Z0 + H * 0.34, hz = Z0 + H * 0.5;
      a.box(cx - W * 0.4, cy - W * 0.4, Z0, cx + W * 0.4, cy + W * 0.4, Z0 + 30); a.cone(cx, cy, Z0 + 30, cz, pr * 1.2, pr, 16);
      a.cyl(cx, cy, cz, cz + 60, pr * 1.3, 16); a.circ(cx, cy, pr * 1.2, 'EQUIP-DETAIL');
      sup(a, [{ y: cy - D * 0.3, x: cx, rx: W * 0.2, z0: cz + 60, z1: cz + H * 0.12 }, { y: cy - D * 0.1, x: cx, rx: W * 0.24, z0: cz + 60, z1: cz + H * 0.16 }, { y: cy + D * 0.35, x: cx, rx: W * 0.22, z0: cz + 60, z1: cz + H * 0.16 }, { y: cy + D * 0.4, x: cx, rx: W * 0.18, z0: cz + 60, z1: cz + H * 0.12 }], { seg: 10, n: 4 });
      a.box(cx + W * 0.18, cy - D * 0.2, cz + 60, cx + W * 0.3, cy + D * 0.1, cz + H * 0.17); a.box(cx + W * 0.19, cy - D * 0.16, cz + H * 0.09, cx + W * 0.3 + 4, cy + D * 0.06, cz + H * 0.15);
      a.box(cx - W * 0.2, cy + D * 0.35, cz + 60, cx + W * 0.2, cy + D * 0.48, cz + H * 0.18);
      const bx = cx, by = cy - D * 0.2, bz = cz + H * 0.14;
      const tipy = YF + D * 0.06, tipz = Z0 + H * 0.9;
      for (const s of [-1, 1]) { a.tube([[bx + s * W * 0.07, by, bz], [bx + s * W * 0.04, tipy, tipz]], [14, 11], 6); }
      for (let k = 1; k < 8; k++) { const f = k / 8, y = lerp(by, tipy, f), z = lerp(bz, tipz, f), w = lerp(W * 0.07, W * 0.04, f); a.tube([[bx - w, y, z], [bx + w, y, z]], [7, 7], 4); }
      a.box(bx - W * 0.05, tipy - 40, tipz - 20, bx + W * 0.05, tipy + 40, tipz + 40); a.xcyl(bx - W * 0.04, bx + W * 0.04, tipy - 20, tipz + 10, 30, 8);
      a.tube([[cx + W * 0.1, cy + D * 0.1, cz + H * 0.17 + 50], [bx, tipy - 20, tipz + 10]], [5, 5], 4); a.tube([[cx + W * 0.1, cy + D * 0.1, cz + H * 0.17 + 50], [cx, cy + D * 0.25, cz + H * 0.17 + 160], [cx - W * 0.1, cy + D * 0.4, cz + H * 0.17]], [8, 8, 8], 4);
      a.tube([[bx, tipy - 20, tipz - 10], [bx, tipy - 20, Z0 + H * 0.55]], [4, 4], 4); a.box(bx - 40, tipy - 50, Z0 + H * 0.5, bx + 40, tipy + 10, Z0 + H * 0.55); a.tube([[bx, tipy - 20, Z0 + H * 0.5], [bx + 24, tipy - 20, Z0 + H * 0.44], [bx, tipy - 20, Z0 + H * 0.4]], [10, 10, 10], 5);
      for (const s of [-1, 1]) a.tube([[cx + s * pr * 0.6, cy - pr * 1.0, Z0 + 30], [cx + s * pr * 0.6, cy - pr * 1.0, cz]], [8, 8], 4); for (let k = 0; k < 10; k++) a.xcyl(cx - pr * 0.6, cx + pr * 0.6, cy - pr * 1.0, Z0 + 80 + k * ((cz - Z0 - 100) / 9), 6, 4);
      a.circ(cx, cy, pr, 'EQUIP'); a.rect(cx - W * 0.4, cy - W * 0.4, cx + W * 0.4, cy + W * 0.4, 'EQUIP-DETAIL'); a.line(cx, cy, cx, tipy, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.26, 'EQUIP-DETAIL');
      a.log('Added the base plate and pedestal, slewing deck with cab and counterweight, lattice jib with sheave head, hoist rope and hook block, and the ladder (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic boat hoist',
    desc: (v) => `Travelling boat hoist, ${v.cap} t class: a U-shaped steel gantry with two legs on each side, each leg on a steerable wheel pair, a top cross beam, an open stern, an operator cab, an engine bay and two hoisting slings with a spreader on each side.`,
    vs: [['35 t', 200, 300, 220, 0, { cap: 35 }], ['75 t', 260, 420, 300, 0, { cap: 75 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, lw = W * 0.12, wr = H * 0.14, gz = Z0 + wr * 2;
      for (const s of [-1, 1]) { const x = cx + s * (W / 2 - lw / 2);
        a.box(x - lw / 2, YF + D * 0.06, gz, x + lw / 2, YB - D * 0.04, gz + 70); a.box(x - lw / 2, YF + D * 0.06, Z1 - H * 0.2, x + lw / 2, YB - D * 0.04, Z1);
        for (const y of [YF + D * 0.12, YB - D * 0.08]) { a.box(x - lw * 0.36, y - lw * 0.36, gz + 70, x + lw * 0.36, y + lw * 0.36, Z1 - H * 0.2); for (const dx of [-1, 1]) a.xcyl(x + dx * lw * 0.3 - lw * 0.16, x + dx * lw * 0.3 + lw * 0.16, y, Z0 + wr, wr, 14); a.box(x - lw * 0.5, y - lw * 0.5, Z0 + wr * 1.5, x + lw * 0.5, y + lw * 0.5, gz + 20); a.rect(x - lw * 0.5, y - lw * 0.5, x + lw * 0.5, y + lw * 0.5, 'EQUIP-DETAIL'); }
        a.tube([[x, YF + D * 0.12, gz + 70], [x, YB - D * 0.08, Z1 - H * 0.2]], [10, 10], 5); a.tube([[x, YB - D * 0.08, gz + 70], [x, YF + D * 0.12, Z1 - H * 0.2]], [10, 10], 5);
        a.rect(x - lw / 2, YF + D * 0.06, x + lw / 2, YB - D * 0.04); }
      for (const y of [YF + D * 0.12, YF + D * 0.45]) { a.box(cx - W / 2 + lw, y - 20, Z1 - H * 0.14, cx + W / 2 - lw, y + 20, Z1 - H * 0.02); a.rect(cx - W / 2 + lw, y - 20, cx + W / 2 - lw, y + 20, 'EQUIP-DETAIL'); }
      a.box(cx - W * 0.45, YF + D * 0.06, Z1 - H * 0.02, cx + W * 0.45, YF + D * 0.12 + 40, Z1);
      for (const s of [-1, 1]) for (const y of [YF + D * 0.2, YF + D * 0.38]) { a.tube([[cx + s * W * 0.3, y, Z1 - H * 0.16], [cx + s * W * 0.3, y, Z0 + H * 0.32]], [5, 5], 4); a.box(cx + s * W * 0.3 - 40, y - 20, Z0 + H * 0.3, cx + s * W * 0.3 + 40, y + 20, Z0 + H * 0.34); a.tube([[cx + s * W * 0.3 - 50, y, Z0 + H * 0.3], [cx + s * W * 0.3, y, Z0 + H * 0.22], [cx + s * W * 0.3 + 50, y, Z0 + H * 0.3]], [14, 14, 14], 5); }
      a.box(cx - W * 0.4, YB - D * 0.3, Z1 - H * 0.35, cx + W * 0.4, YB - D * 0.04, Z1 - H * 0.2); a.box(cx + W * 0.2, YF + D * 0.04, Z1 - H * 0.3, cx + W * 0.35, YF + D * 0.18, Z1 - H * 0.05);
      a.box(cx - W * 0.4, YB - D * 0.26, Z1 - H * 0.2, cx - W * 0.1, YB - D * 0.1, Z1 - H * 0.1); a.cyl(cx + W * 0.28, YB - D * 0.2, Z1 - H * 0.2, Z1 + 0.0 - 1, 14, 6);
      a.rect(cx - W * 0.4, YB - D * 0.3, cx + W * 0.4, YB - D * 0.04, 'EQUIP-DETAIL'); a.rect(cx + W * 0.2, YF + D * 0.04, cx + W * 0.35, YF + D * 0.18, 'EQUIP-DETAIL');
      a.log('Added the two gantry sides with braced legs and steerable wheel pairs, cross beams, operator cab, engine bay, and two hoisting slings with spreaders (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic navigation buoy',
    desc: (v) => `${v.kindText} navigation buoy, ${v.dia} in float: ${v.kind === 'can' ? 'a cylindrical float with a flat top, a framed tower and a can topmark' : v.kind === 'cone' ? 'a conical float, a framed tower and a cone topmark' : v.kind === 'pillar' ? 'a tall pillar float with a long tower and a double-cone topmark' : 'a spherical float with a short tower and a ball topmark'}, a lantern, lifting eye, daymark bands and a bottom shackle.`,
    vs: [['lateral can, 48 in float', 56, 56, 160, 0, { kindText: 'Lateral can', kind: 'can', dia: 48 }], ['lateral cone, 48 in float', 56, 56, 170, 0, { kindText: 'Lateral cone', kind: 'cone', dia: 48 }], ['cardinal pillar, 60 in float', 66, 66, 258, 0, { kindText: 'Cardinal pillar', kind: 'pillar', dia: 60 }], ['safe water sphere, 72 in float', 76, 76, 150, 0, { kindText: 'Safe-water sphere', kind: 'sphere', dia: 72 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = W * 0.43, zf = Z0 + H * 0.2;
      a.cyl(cx, cy, Z0, Z0 + H * 0.05, R * 0.18, 8); a.ell(cx, cy, Z0 + H * 0.06, 40, 40, 16, 8, 4); a.cyl(cx, cy, Z0 + H * 0.05, zf - H * 0.02, R * 0.14, 8);
      if (v.kind === 'sphere') { a.ell(cx, cy, zf + R * 0.9, R, R, R * 0.95, 20, 12); a.tube([[cx, cy, zf - 20], [cx, cy, zf + R * 1.9]], [R * 0.5, R * 0.3], 14); }
      else if (v.kind === 'cone') { a.cone(cx, cy, zf, zf + H * 0.24, R, R * 0.28, 20); a.cyl(cx, cy, zf, zf + H * 0.03, R * 1.04, 20); }
      else { const hh = v.kind === 'pillar' ? H * 0.22 : H * 0.2; a.cyl(cx, cy, zf, zf + hh, R * (v.kind === 'pillar' ? 0.72 : 1), 20); a.cone(cx, cy, zf + hh, zf + hh + H * 0.03, R * (v.kind === 'pillar' ? 0.72 : 1), R * (v.kind === 'pillar' ? 0.6 : 0.82), 20); a.ell(cx, cy, zf + hh * 0.5, R * 1.02, R * 1.02, 0.1 + 20, 18, 3); }
      const tz0 = zf + (v.kind === 'sphere' ? R * 1.7 : v.kind === 'cone' ? H * 0.2 : H * (v.kind === 'pillar' ? 0.22 : 0.2)), tz1 = Z1 - H * 0.3;
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.tube([[cx + sx * R * 0.7, cy + sy * R * 0.7, tz0], [cx + sx * R * 0.18, cy + sy * R * 0.18, tz1]], [10, 7], 6);
      for (const f of [0.3, 0.62]) for (const [sx, sy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const w = lerp(R * 0.7, R * 0.18, f); a.tube([[cx - w * (sy ? 1 : 0) + sx * w, cy - w * (sx ? 1 : 0) + sy * w, lerp(tz0, tz1, f)], [cx + w * (sy ? 1 : 0) + sx * w, cy + w * (sx ? 1 : 0) + sy * w, lerp(tz0, tz1, f)]], [5, 5], 4); }
      a.cyl(cx, cy, tz1, tz1 + H * 0.04, R * 0.24, 10); a.ell(cx, cy, tz1 + H * 0.07, R * 0.2, R * 0.2, R * 0.2, 10, 6);
      const tp = tz1 + H * 0.1;
      if (v.kind === 'can') a.cyl(cx, cy, tp, tp + H * 0.12, R * 0.3, 14);
      else if (v.kind === 'cone') a.cone(cx, cy, tp, tp + H * 0.14, R * 0.34, 1, 14);
      else if (v.kind === 'pillar') { a.cone(cx, cy, tp, tp + H * 0.08, R * 0.34, 1, 14); a.cone(cx, cy, tp + H * 0.09, tp + H * 0.17, R * 0.34, 1, 14); }
      else a.ell(cx, cy, tp + R * 0.3, R * 0.3, R * 0.3, R * 0.3, 12, 8);
      for (const s of [-1, 1]) a.ell(cx + s * R * 0.7, cy, zf + (v.kind === 'sphere' ? R * 0.9 : H * 0.12), 20, 40, 30, 6, 4);
      ring3(a, cx, cy, zf + (v.kind === 'sphere' ? R * 1.9 : H * 0.24) - 10, R * 0.3, 10, 12, 'z');
      a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 0.7, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.18, 'EQUIP-DETAIL');
      a.log('Added the ' + v.kind + ' float, framed tower, lantern, topmark, lifting eye and bottom shackle (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic pile beacon',
    desc: () => 'Fixed pile beacon: a round steel pile with a base collar, a service platform with a rail and a ladder, a radar reflector frame, a lantern and a square topmark on a short mast.',
    vs: [['steel pile, 30 ft', 52, 52, 360, 0, {}]],
    build: (a) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pr = W * 0.08;
      a.cyl(cx, cy, Z0, Z0 + H * 0.06, W * 0.3, 14); a.cyl(cx, cy, Z0, Z1 - H * 0.18, pr, 14); a.cone(cx, cy, Z0 + H * 0.06, Z0 + H * 0.2, pr * 2.2, pr * 1.2, 14);
      const pz = Z0 + H * 0.52; a.box(cx - W * 0.4, cy - W * 0.4, pz, cx + W * 0.4, cy + W * 0.4, pz + 20); rail(a, cx - W * 0.4, cy - W * 0.4, cx + W * 0.4, cy - W * 0.4, pz + 20, pz + 360, 14, 4, 2); rail(a, cx + W * 0.4, cy - W * 0.4, cx + W * 0.4, cy + W * 0.4, pz + 20, pz + 360, 14, 4, 2); rail(a, cx + W * 0.4, cy + W * 0.4, cx - W * 0.4, cy + W * 0.4, pz + 20, pz + 360, 14, 4, 2); rail(a, cx - W * 0.4, cy + W * 0.4, cx - W * 0.4, cy - W * 0.4, pz + 20, pz + 360, 14, 4, 2);
      for (const s of [-1, 1]) a.tube([[cx + s * pr * 1.2, cy - pr, Z0 + H * 0.12], [cx + s * pr * 1.2, cy - pr, pz]], [9, 9], 5); for (let k = 0; k < 14; k++) a.xcyl(cx - pr * 1.2, cx + pr * 1.2, cy - pr, Z0 + H * 0.14 + k * ((pz - Z0 - H * 0.16) / 13), 6, 4);
      a.cyl(cx, cy, Z1 - H * 0.2, Z1 - H * 0.15, pr * 1.6, 10); a.ell(cx, cy, Z1 - H * 0.12, pr * 1.8, pr * 1.8, pr * 2, 10, 6);
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.tube([[cx + sx * W * 0.2, cy + sy * W * 0.2, Z1 - H * 0.16], [cx + sx * W * 0.08, cy + sy * W * 0.08, Z1 - H * 0.12]], [4, 4], 4);
      a.box(cx - W * 0.28, cy - 4, Z1 - H * 0.08, cx + W * 0.28, cy + 4, Z1); a.box(cx - 4, cy - W * 0.28, Z1 - H * 0.08, cx + 4, cy + W * 0.28, Z1);
      a.circ(cx, cy, W * 0.3, 'EQUIP'); a.circ(cx, cy, pr, 'EQUIP-DETAIL'); a.rect(cx - W * 0.4, cy - W * 0.4, cx + W * 0.4, cy + W * 0.4, 'EQUIP-DETAIL');
      a.log('Added the pile with base collar, platform with rails and ladder, radar reflector frame, lantern and the cross topmark (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic harbour lighthouse',
    desc: (v) => `Harbour lighthouse tower, ${v.ft} ft: a tapered masonry-style tower on a round plinth with a door and four small windows, a gallery deck with a rail, a glazed lantern room with posts and a domed roof with a vane.`,
    vs: [['40 ft tower', 168, 168, 480 + 24, 0, { ft: 40 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = W * 0.4;
      a.cyl(cx, cy, Z0, Z0 + H * 0.04, R * 1.1, 24); a.cone(cx, cy, Z0 + H * 0.04, Z0 + H * 0.74, R, R * 0.62, 24);
      for (const f of [0.2, 0.4, 0.58]) a.cyl(cx, cy, Z0 + H * f, Z0 + H * f + 8, R * lerp(1, 0.62, (f - 0.04) / 0.7) * 1.03, 24);
      a.box(cx - 40, cy - R * 1.0, Z0 + H * 0.04, cx + 40, cy - R * 0.9, Z0 + H * 0.04 + 170);
      for (const [f, ang] of [[0.3, 0], [0.45, 1.6], [0.6, 3.1]]) { const rr = R * lerp(1, 0.62, (f - 0.04) / 0.7); a.box(cx + m.cos(ang) * rr - 14, cy + m.sin(ang) * rr - 14, Z0 + H * f, cx + m.cos(ang) * rr + 14, cy + m.sin(ang) * rr + 14, Z0 + H * f + 50); }
      const gz = Z0 + H * 0.74; a.cyl(cx, cy, gz, gz + 16, R * 0.92, 24); a.cone(cx, cy, gz - 40, gz, R * 0.62, R * 0.9, 24);
      for (let k = 0; k < 24; k++) { const t = (k / 24) * TAU; a.tube([[cx + m.cos(t) * R * 0.9, cy + m.sin(t) * R * 0.9, gz + 16], [cx + m.cos(t) * R * 0.9, cy + m.sin(t) * R * 0.9, gz + 110]], [4, 4], 4); }
      ring3(a, cx, cy, gz + 110, R * 0.9, 5, 24, 'z'); ring3(a, cx, cy, gz + 60, R * 0.9, 4, 24, 'z');
      const lz0 = gz + 16, lz1 = gz + H * 0.14; a.cyl(cx, cy, lz0, lz0 + 10, R * 0.55, 18); for (let k = 0; k < 8; k++) { const t = (k / 8) * TAU; a.tube([[cx + m.cos(t) * R * 0.5, cy + m.sin(t) * R * 0.5, lz0 + 10], [cx + m.cos(t) * R * 0.5, cy + m.sin(t) * R * 0.5, lz1]], [7, 7], 5); }
      a.cyl(cx, cy, lz0 + 10, lz1 - 40, R * 0.14, 10); a.ell(cx, cy, lz0 + 60, R * 0.18, R * 0.18, 40, 10, 6);
      a.cyl(cx, cy, lz1, lz1 + 12, R * 0.6, 18); a.ell(cx, cy, lz1 + 12, R * 0.58, R * 0.58, R * 0.38, 18, 8); a.tube([[cx, cy, lz1 + 12 + R * 0.36], [cx, cy, Z1 - 20], [cx, cy, Z1]], [8, 5, 3], 6); a.box(cx, cy - 4, Z1 - 70, cx + 70, cy + 4, Z1 - 40);
      a.circ(cx, cy, R * 1.1, 'EQUIP'); a.circ(cx, cy, R * 0.62, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.9, 'EQUIP-DETAIL');
      a.log('Added the plinth, tapered tower with door, windows and string courses, gallery deck with rail, glazed lantern room with posts, domed roof and vane (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic lifeboat station',
    desc: () => 'Lifeboat station: a boat shed with a gabled roof, a wide front door with side doors and a loading dock, a launch slip with two rails and sleepers running into the water, a small control hut and a flagpole; a lifeboat hull is shown on its carriage inside the door opening.',
    vs: [['boathouse and slip', 420, 960, 300, 0, {}]],
    build: (a) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, sy0 = YF + D * 0.45;
      const bx0 = X0 + W * 0.1, bx1 = X1 - W * 0.1, by0 = sy0, by1 = YB - 40;
      const wt = 40, dh = Z0 + H * 0.4, dw = W * 0.2;
      a.box(bx0, by0, Z0, bx1, by1, Z0 + 20);                                              // floor slab
      a.box(bx0, by1 - wt, Z0, bx1, by1, Z0 + H * 0.5);                                    // back wall
      for (const s of [-1, 1]) a.box(s > 0 ? bx1 - wt : bx0, by0, Z0, s > 0 ? bx1 : bx0 + wt, by1, Z0 + H * 0.5);   // side walls
      a.box(bx0, by0, Z0, cx - dw, by0 + wt, Z0 + H * 0.5); a.box(cx + dw, by0, Z0, bx1, by0 + wt, Z0 + H * 0.5);   // front wall around the door
      a.box(cx - dw, by0, dh, cx + dw, by0 + wt, Z0 + H * 0.5);                            // lintel
      a.frame(cx - dw, Z0 + 20, cx + dw, dh, by0 - 6, by0 + 6, 18);
      prismY(a, [[bx0 - 30, Z0 + H * 0.5], [bx1 + 30, Z0 + H * 0.5], [cx, Z0 + H * 0.82]], by0 - 40, by1 + 20);
      for (const s of [-1, 1]) { a.box(cx + s * W * 0.32 - 30, by0 - 8, Z0 + 40, cx + s * W * 0.32 + 30, by0 + 4, Z0 + H * 0.3); a.box(cx + s * W * 0.31 - 8, by0 - 12, Z0 + H * 0.24, cx + s * W * 0.31 + 8, by0 - 4, Z0 + H * 0.28); }
      a.box(X0 + W * 0.02, YB - 400, Z0, X0 + W * 0.1, YB - 40, Z0 + H * 0.3);
      for (const s of [-1, 1]) { const x = cx + s * W * 0.14; a.tube([[x, YF + 10, Z0 + 50], [x, by0 - 20, Z0 + 40]], [18, 18], 6); for (let k = 0; k < 12; k++) { const y = lerp(YF + 30, by0 - 30, k / 11); a.box(x - 80, y - 12, Z0 + 20, x + 80, y + 12, Z0 + 40 + 20 * (1 - k / 11)); } a.line(x, YF, x, by0, 'EQUIP-DETAIL'); a.tube([[x, by0, Z0 + 30], [x, by1 - wt, Z0 + 30]], [10, 10], 5); }
      const hy0 = by0 - 1500, hy1 = by0 + 5800;
      sup(a, [{ y: hy0, x: cx, rx: 30, z0: Z0 + 120, z1: Z0 + 140 }, { y: hy0 + 800, x: cx, rx: W * 0.1, z0: Z0 + 120, z1: Z0 + H * 0.2 }, { y: (hy0 + hy1) / 2, x: cx, rx: W * 0.11, z0: Z0 + 110, z1: Z0 + H * 0.22 }, { y: hy1, x: cx, rx: W * 0.09, z0: Z0 + 130, z1: Z0 + H * 0.18 }], { seg: 12, n: 2.6 });
      a.box(cx - W * 0.07, hy0 + 2600, Z0 + H * 0.2, cx + W * 0.07, hy0 + 3800, Z0 + H * 0.3); a.tube([[cx, hy0 + 3200, Z0 + H * 0.3], [cx, hy0 + 3200, Z0 + H * 0.4]], [14, 10], 6);
      for (const s of [-1, 1]) a.box(cx + s * W * 0.11 - 12, hy0 + 1800, Z0 + 70, cx + s * W * 0.11 + 12, hy1 - 500, Z0 + 120);
      a.tube([[X1 - W * 0.05, YF + D * 0.3, Z0], [X1 - W * 0.05, YF + D * 0.3, Z1 - 4]], [10, 6], 6); a.box(X1 - W * 0.05, YF + D * 0.3 - 3, Z1 - 80, X1 - W * 0.05 + 70, YF + D * 0.3 + 3, Z1 - 30);
      a.outline('EQUIP-HIDDEN'); a.rect(bx0, by0, bx1, by1); a.rect(cx - W * 0.22, by0 - 12, cx + W * 0.22, by0 + 6, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.line(cx + s * W * 0.17, YF, cx + s * W * 0.17, by0, 'EQUIP-DETAIL');
      a.log('Added the boat shed with gabled roof, wide door and side doors, the launch slip with two rails and sleepers, the lifeboat hull on its carriage, the control hut and the flagpole (plan and 3D).');
    } }),

  // ===================================================== offshore =====================================================
  fam({ cat: 'marine/offshore', title: 'Generic jack-up leg',
    desc: (v) => `Jack-up rig leg, ${v.ft} ft long: a triangular lattice of three chords with rack plates on each chord, horizontal ring frames and X bracing in every bay on each face, a leg-head collar at the top and a round spud can at the foot.`,
    vs: [['120 ft leg', 200, 180, 1440 + 120, 0, { ft: 120, bays: 6 }], ['240 ft leg', 220, 200, 2880 + 120, 0, { ft: 240, bays: 10 }], ['360 ft leg', 240, 220, 4320 + 120, 0, { ft: 360, bays: 14 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cr = W * 0.05, sc = W * 0.32, zb = Z0 + 340, zt = Z1 - 80, n = v.bays;
      const C = [[cx, cy - D * 0.36], [cx - sc, cy + D * 0.3], [cx + sc, cy + D * 0.3]];
      for (const [x, y] of C) { a.tube([[x, y, zb], [x, y, zt]], [cr, cr], 10); }
      for (const [x, y] of C) { const dx = (x - cx) * 0.0, dy = y < cy ? -cr * 1.1 : cr * 1.1; a.box(x - cr * 0.3, y + dy - cr * 0.3, zb, x + cr * 0.3, y + dy + cr * 0.3, zt); }
      for (let i = 0; i <= n; i++) { const z = lerp(zb, zt, i / n); for (let k = 0; k < 3; k++) { const p = C[k], q = C[(k + 1) % 3]; a.tube([[p[0], p[1], z], [q[0], q[1], z]], [cr * 0.45, cr * 0.45], 5); } }
      for (let i = 0; i < n; i++) { const z0 = lerp(zb, zt, i / n), z1 = lerp(zb, zt, (i + 1) / n); for (let k = 0; k < 3; k++) { const p = C[k], q = C[(k + 1) % 3]; a.tube([[p[0], p[1], z0], [q[0], q[1], z1]], [cr * 0.4, cr * 0.4], 5); a.tube([[q[0], q[1], z0], [p[0], p[1], z1]], [cr * 0.4, cr * 0.4], 5); } }
      a.cone(cx, cy + D * 0.08, Z0, Z0 + 150, W * 0.4, W * 0.4, 20); a.cone(cx, cy + D * 0.08, Z0 + 150, zb + 40, W * 0.4, W * 0.14, 20);
      for (let k = 0; k < 12; k++) { const t = (k / 12) * TAU; a.box(cx + m.cos(t) * W * 0.4 - 6, cy + D * 0.08 + m.sin(t) * W * 0.4 - 6, Z0, cx + m.cos(t) * W * 0.4 + 6, cy + D * 0.08 + m.sin(t) * W * 0.4 + 6, Z0 + 150); }
      a.box(cx - W * 0.44, cy - D * 0.42, zt - 120, cx + W * 0.44, cy + D * 0.4, Z1); a.box(cx - W * 0.4, cy - D * 0.38, zt, cx + W * 0.4, cy + D * 0.36, Z1 - 0);
      a.poly([[C[0][0], C[0][1]], [C[2][0], C[2][1]], [C[1][0], C[1][1]]]); for (const [x, y] of C) a.circ(x, y, cr, 'EQUIP-DETAIL'); a.circ(cx, cy + D * 0.08, W * 0.4, 'EQUIP-HIDDEN'); a.rect(cx - W * 0.44, cy - D * 0.42, cx + W * 0.44, cy + D * 0.4, 'EQUIP-DETAIL');
      a.log('Added the three chords with rack plates, ' + (n + 1) + ' ring frames, X bracing on every face, the leg-head collar and the spud can (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic jacket platform',
    desc: (v) => `Four-leg fixed jacket platform for ${v.wd} ft of water: battered legs, ${v.lv} horizontal frames with X bracing on all four faces, two conductor guides, a boat landing on one face, riser clamps and a two-level topside deck with a crane and a flare boom.`,
    vs: [['150 ft water depth', 1100, 900, 2700, 0, { wd: 150, lv: 4, up: 700 }], ['300 ft water depth', 1700, 1400, 5000, 0, { wd: 300, lv: 6, up: 900 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, lr = W * 0.018, jz1 = Z1 - v.up, bx = W * 0.44, by = D * 0.42, tx = W * 0.3, ty = D * 0.28;
      const at = (f, sx, sy) => [cx + sx * lerp(bx, tx, f), cy + sy * lerp(by, ty, f), lerp(Z0, jz1, f)];
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.tube([at(0, sx, sy), at(1, sx, sy)], [lr, lr * 0.9], 10);
      const L = v.lv; for (let i = 0; i <= L; i++) { const f = i / L; for (const [s1, s2, t1, t2] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) a.tube([at(f, s1, s2), at(f, t1, t2)], [lr * 0.5, lr * 0.5], 6); }
      for (let i = 0; i < L; i++) for (const [s1, s2, t1, t2] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) { a.tube([at(i / L, s1, s2), at((i + 1) / L, t1, t2)], [lr * 0.4, lr * 0.4], 5); a.tube([at(i / L, t1, t2), at((i + 1) / L, s1, s2)], [lr * 0.4, lr * 0.4], 5); }
      for (const [dx, dy] of [[-0.3, 0.2], [0.3, 0.2]]) a.tube([[cx + dx * W, cy + dy * D, Z0 + 20], [cx + dx * W, cy + dy * D, jz1 + 60]], [lr * 0.5, lr * 0.5], 7);
      for (const dx of [0.1, 0.16]) { a.tube([[cx + dx * W, cy - by * 0.96, Z0 + 100], [cx + dx * W, cy - ty * 0.96, jz1]], [lr * 0.3, lr * 0.3], 6); }
      for (let k = 0; k < 6; k++) a.box(cx + W * 0.07, cy - lerp(by, ty, k / 6) - 20, lerp(Z0, jz1, k / 6) - 20, cx + W * 0.19, cy - lerp(by, ty, k / 6) + 20, lerp(Z0, jz1, k / 6) + 20);
      a.box(cx - W * 0.1, cy - by - W * 0.06, lerp(Z0, jz1, 0.78), cx + W * 0.1, cy - by * 0.9, lerp(Z0, jz1, 0.78) + 25); for (const s of [-1, 1]) a.tube([[cx + s * W * 0.1, cy - by - W * 0.06, lerp(Z0, jz1, 0.78)], [cx + s * W * 0.1, cy - by * 0.9, lerp(Z0, jz1, 0.5)]], [lr * 0.3, lr * 0.3], 5);
      const dk = jz1 + 60; a.box(cx - W * 0.46, cy - D * 0.46, dk, cx + W * 0.46, cy + D * 0.46, dk + 120);
      a.box(cx - W * 0.4, cy - D * 0.4, dk + 120, cx + W * 0.4, cy + D * 0.4, dk + v.up * 0.35); a.box(cx - W * 0.36, cy - D * 0.36, dk + v.up * 0.35, cx + W * 0.36, cy + D * 0.36, dk + v.up * 0.35 + 60);
      for (let k = 0; k < 3; k++) { a.xcyl(cx - W * 0.3, cx + W * 0.1, cy + D * (-0.2 + k * 0.2), dk + v.up * 0.35 + 160, 100, 14); }
      a.cyl(cx + W * 0.3, cy + D * 0.3, dk + v.up * 0.35 + 60, dk + v.up * 0.35 + 460, W * 0.02, 10); a.tube([[cx + W * 0.3, cy + D * 0.3, dk + v.up * 0.35 + 440], [cx + W * 0.4, cy + D * 0.36, dk + v.up * 0.35 + 560], [cx + W * 0.46, cy + D * 0.4, dk + v.up * 0.35 + 220]], [30, 24, 18], 6);
      a.tube([[cx - W * 0.36, cy - D * 0.36, dk + v.up * 0.35 + 60], [cx - W * 0.5 + 10, cy - D * 0.46 + 10, Z1 - 20]], [24, 20], 6);
      a.rect(cx - W * 0.46, cy - D * 0.46, cx + W * 0.46, cy + D * 0.46); a.rect(cx - bx, cy - by, cx + bx, cy + by, 'EQUIP-HIDDEN'); a.rect(cx - W * 0.4, cy - D * 0.4, cx + W * 0.4, cy + D * 0.4, 'EQUIP-DETAIL');
      a.log('Added the battered legs, ' + (L + 1) + ' framing levels with X bracing, conductor guides, boat landing, riser clamps and the two-level topside deck with crane and flare boom (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic riser assembly',
    desc: (v) => v.n === 1 ? `Single steel riser, ${v.od} in pipe and ${v.ft} ft long: a vertical pipe with guide clamps every ${v.sp} ft on a support frame, a flared bell mouth at the bottom, an emergency shutdown valve with an actuator at the top and a flanged top connection.` : `Riser bundle of ${v.n} pipes of ${v.od} in and ${v.ft} ft long: three parallel vertical pipes held by clamp plates every ${v.sp} ft on a support frame, bell mouths at the bottom and emergency shutdown valves with actuators at the top.`,
    vs: [['single, 16 in x 100 ft', 48, 40, 1260, 0, { n: 1, od: 16, ft: 100, sp: 20 }], ['bundle of three, 12 in x 100 ft', 90, 50, 1260, 0, { n: 3, od: 12, ft: 100, sp: 20 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pr = (v.od * I) / 2 * 0.8, nb = v.n, zb = Z0 + 140, zt = Z1 - 360;
      const xs = nb === 1 ? [cx] : [cx - W * 0.3, cx, cx + W * 0.3], fy = cy - (D * 0.2);
      for (const x of xs) {
        a.tube([[x, cy, Z0 + 20], [x, cy, zb], [x, cy, zt], [x, cy, zt + 160]], [pr * 1.9, pr, pr, pr * 1.1], 14);
        a.cone(x, cy, Z0, Z0 + 140, pr * 2.3, pr * 1.1, 14);
        a.cyl(x, cy, zt + 160, zt + 190, pr * 1.8, 14);
        a.box(x - pr * 1.1, cy - pr * 1.1, zt + 190, x + pr * 1.1, cy + pr * 1.1, zt + 330); a.cyl(x, cy, zt + 330, zt + 520, pr * 0.5, 10); a.cyl(x, cy, zt + 520, zt + 560, pr * 0.8, 10);
        a.xcyl(x - pr * 1.6, x + pr * 1.6, cy, zt + 260, pr * 0.5, 8);
        a.circ(x, cy, pr, 'EQUIP'); a.circ(x, cy, pr * 1.8, 'EQUIP-DETAIL');
      }
      const ns = m.floor((zt - zb) / (v.sp * 12 * I));
      for (let k = 0; k <= ns; k++) { const z = zb + 150 + k * ((zt - zb - 300) / m.max(ns, 1)); for (const x of xs) { a.cyl(x, cy, z, z + 90, pr * 1.45, 14); a.box(x - pr * 1.6, cy - pr * 1.6, z + 20, x + pr * 1.6, cy + pr * 1.6, z + 70); } if (nb > 1) a.box(xs[0] - pr * 1.6, cy - 20, z + 20, xs[2] + pr * 1.6, cy + 20, z + 70); a.box(xs[0] - pr * 1.6, cy + pr * 1.6, z + 10, xs[xs.length - 1] + pr * 1.6, cy + pr * 1.6 + 24, z + 90); }
      for (const s of [-1, 1]) a.tube([[cx + s * (xs[xs.length - 1] - cx + pr * 2.6) * 1.0, cy + pr * 1.6 + 12, Z0 + 100], [cx + s * (xs[xs.length - 1] - cx + pr * 2.6), cy + pr * 1.6 + 12, zt + 100]], [16, 16], 6);
      a.box(X0 + 10, cy + pr * 1.6 + 6, Z0, X1 - 10, cy + pr * 1.6 + 30, Z0 + 100);
      a.rect(X0 + 10, cy + pr * 1.6 + 6, X1 - 10, cy + pr * 1.6 + 30, 'EQUIP-DETAIL');
      a.log('Added the ' + (nb === 1 ? 'pipe' : nb + ' pipes') + ' with bell mouths, guide clamps' + (nb > 1 ? ' and clamp plates' : '') + ', support frame and the shutdown valves with actuators and top flanges (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic subsea tree',
    desc: (v) => `${v.kindText} subsea tree, ${v.psi} psi class: a guide frame with four corner posts and a mud mat, a vertical production bore with master, swab and wing valves with actuators, a wing branch to a flowline connector hub, a choke body, a debris cap and a diver-free ROV panel with torque tool buckets.`,
    vs: [['shallow, 5,000 psi', 96, 96, 120, 0, { psi: '5,000', kindText: 'Shallow-water', sc: 1 }], ['10,000 psi', 112, 112, 150, 0, { psi: '10,000', kindText: 'Standard', sc: 1.15 }], ['deepwater, 15,000 psi', 140, 128, 180, 0, { psi: '15,000', kindText: 'Deepwater', sc: 1.4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pr = W * 0.05;
      a.box(X0, YF, Z0, X1, YB, Z0 + 60); for (const x of [X0 + 40, X1 - 40]) for (const y of [YF + 40, YB - 40]) { a.tube([[x, y, Z0 + 60], [x, y, Z1 - 40]], [24, 24], 8); a.cone(x, y, Z1 - 90, Z1, 70, 12, 8); a.cyl(x, y, Z0 + 60, Z0 + 100, 60, 8); }
      for (const z of [0.45, 0.95]) { a.tube([[X0 + 40, YF + 40, Z0 + H * z], [X1 - 40, YF + 40, Z0 + H * z]], [16, 16], 5); a.tube([[X0 + 40, YB - 40, Z0 + H * z], [X1 - 40, YB - 40, Z0 + H * z]], [16, 16], 5); a.tube([[X0 + 40, YF + 40, Z0 + H * z], [X0 + 40, YB - 40, Z0 + H * z]], [16, 16], 5); a.tube([[X1 - 40, YF + 40, Z0 + H * z], [X1 - 40, YB - 40, Z0 + H * z]], [16, 16], 5); }
      const bz = Z0 + 100; a.cyl(cx, cy, bz, bz + H * 0.08, pr * 2.6, 16); a.tube([[cx, cy, bz + H * 0.08], [cx, cy, Z0 + H * 0.82]], [pr * 1.3, pr * 1.2], 12);
      for (const [f, kind] of [[0.2, 'm'], [0.36, 'w'], [0.7, 's']]) { const z = Z0 + H * f; a.box(cx - pr * 1.8, cy - pr * 1.8, z, cx + pr * 1.8, cy + pr * 1.8, z + H * 0.1); a.cyl(cx, cy, z + H * 0.1, z + H * 0.16, pr * 1.1, 10); a.cyl(cx, cy, z + H * 0.16, z + H * 0.2, pr * 1.6, 10); a.circ(cx, cy, pr * 1.2, 'EQUIP-DETAIL'); }
      a.box(cx - pr * 1.8, cy - pr * 1.8, Z0 + H * 0.36, cx + pr * 1.8, cy + pr * 1.8, Z0 + H * 0.46); a.xcyl(cx, X1 - 40, cy, Z0 + H * 0.4, pr, 12); a.box(X1 - 80 - pr * 3, cy - pr * 3, Z0 + H * 0.36, X1 - 80, cy + pr * 3, Z0 + H * 0.46);
      a.xcyl(X1 - 40, X1 - 5, cy, Z0 + H * 0.4, pr * 1.8, 14); a.xcyl(X1 - 12, X1 - 5, cy, Z0 + H * 0.4, pr * 2.2, 14);
      a.box(cx - pr * 3, cy + pr * 2, Z0 + H * 0.55, cx - pr, cy + pr * 4, Z0 + H * 0.64); a.tube([[cx - pr, cy + pr * 3, Z0 + H * 0.6], [cx, cy, Z0 + H * 0.6]], [pr * 0.4, pr * 0.4], 6);
      a.cyl(cx, cy, Z0 + H * 0.82, Z0 + H * 0.9, pr * 1.8, 14); a.ell(cx, cy, Z0 + H * 0.9, pr * 1.8, pr * 1.8, pr * 1.2, 12, 6);
      a.box(X0 + 20, cy - pr * 4, Z0 + H * 0.58, X0 + 60, cy + pr * 4, Z0 + H * 0.82); for (let k = 0; k < 3; k++) { a.xcyl(X0 + 60, X0 + 100, cy - pr * 2.5 + k * pr * 2.5, Z0 + H * 0.7, 22, 8); a.xcyl(X0 + 100, X0 + 108, cy - pr * 2.5 + k * pr * 2.5, Z0 + H * 0.7, 14, 8); }
      a.rect(X0, YF, X1, YB, 'EQUIP-HIDDEN'); a.circ(cx, cy, pr * 2.6, 'EQUIP'); a.rect(X1 - 80 - pr * 3, cy - pr * 3, X1 - 80, cy + pr * 3, 'EQUIP-DETAIL'); a.line(cx, cy, X1 - 5, cy, 'EQUIP-DETAIL'); a.rect(X0 + 20, cy - pr * 4, X0 + 60, cy + pr * 4, 'EQUIP-DETAIL');
      a.log('Added the guide frame with corner posts and mud mat, production bore with three valves and actuators, wing branch with choke body and connector hub, debris cap and the ROV torque-tool panel (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic ROV frame',
    desc: (v) => `${v.kindText} remotely operated vehicle: ${v.kind === 'obs' ? 'a compact open frame of tubes' : v.kind === 'light' ? 'a tubular frame with a skid and a single manipulator arm' : 'a heavy tubular frame on skids with a tool skid and two manipulator arms'}, a syntactic-foam block on top, ${v.th} ducted thrusters, a pan-and-tilt camera, ${v.lamps} lamps and a tether bracket.`,
    vs: [['observation class', 30, 40, 26, 0, { kind: 'obs', kindText: 'Observation-class', th: 4, lamps: 2, sc: 0.6 }], ['light work class', 52, 78, 40, 0, { kind: 'light', kindText: 'Light work-class', th: 6, lamps: 4, sc: 1 }], ['heavy work class', 90, 150, 76, 0, { kind: 'heavy', kindText: 'Heavy work-class', th: 8, lamps: 6, sc: 1.6 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, tr = H * 0.018, fz0 = Z0 + H * 0.12, fz1 = Z0 + H * 0.58;
      const fx = W * 0.4, fy = D * (v.kind === 'obs' ? 0.4 : 0.27);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.tube([[cx + sx * fx, cy + sy * fy, fz0], [cx + sx * fx, cy + sy * fy, fz1]], [tr, tr], 8);
      for (const z of [fz0, fz1]) { a.tube([[cx - fx, cy - fy, z], [cx + fx, cy - fy, z], [cx + fx, cy + fy, z], [cx - fx, cy + fy, z], [cx - fx, cy - fy, z]], [tr, tr, tr, tr, tr], 8); a.tube([[cx - fx, cy, z], [cx + fx, cy, z]], [tr * 0.8, tr * 0.8], 6); }
      for (const sy of [-1, 1]) for (const sx of [-1, 1]) a.tube([[cx + sx * fx, cy + sy * fy, fz0], [cx - sx * fx * 0.0 + sx * fx, cy + sy * fy * 0.2, fz1]], [tr * 0.6, tr * 0.6], 5);
      for (const sx of [-1, 1]) { a.tube([[cx + sx * fx * 0.9, cy - fy * 1.1, Z0 + H * 0.03], [cx + sx * fx * 0.9, cy + fy * 1.1, Z0 + H * 0.03]], [tr * 1.1, tr * 1.1], 8); for (const sy of [-1, 1]) a.tube([[cx + sx * fx * 0.9, cy + sy * fy * 0.8, Z0 + H * 0.03], [cx + sx * fx, cy + sy * fy, fz0]], [tr * 0.7, tr * 0.7], 5); }
      a.box(cx - fx * 1.0, cy - fy * 1.0, fz1, cx + fx * 1.0, cy + fy * 1.0, Z1 - H * 0.02);
      a.box(cx - fx * 0.7, cy - fy * 0.8, Z1 - H * 0.02, cx + fx * 0.7, cy + fy * 0.8, Z1);
      const tr2 = H * 0.11;
      for (let k = 0; k < 4; k++) { const sx = k % 2 ? 1 : -1, sy = k < 2 ? -1 : 1; a.ycyl(cy + sy * fy * 0.9 - H * 0.07, cy + sy * fy * 0.9 + H * 0.07, cx + sx * fx * 0.9, fz1 - H * 0.08, tr2, 12); ring3(a, cx + sx * fx * 0.9, cy + sy * fy * 0.9 - H * 0.07 * sy, fz1 - H * 0.08, tr2 * 1.05, 3, 12, 'y'); a.circ(cx + sx * fx * 0.9, cy + sy * fy * 0.9, tr2, 'EQUIP-DETAIL'); }
      for (let k = 4; k < v.th; k++) { const sx = k % 2 ? 1 : -1; a.cyl(cx + sx * fx * 0.5, cy, fz0 + H * 0.02, fz0 + H * 0.2, tr2 * 0.8, 10); a.circ(cx + sx * fx * 0.5, cy, tr2 * 0.8, 'EQUIP-DETAIL'); }
      a.ell(cx, cy - fy * 1.02, fz1 - H * 0.05, H * 0.06, H * 0.06, H * 0.06, 10, 6); a.tube([[cx, cy - fy * 1.0, fz1], [cx, cy - fy * 1.02, fz1 - H * 0.05]], [tr * 0.8, tr * 0.8], 5);
      for (let k = 0; k < v.lamps; k++) { const sx = (k % 2 ? 1 : -1) * (0.5 + 0.2 * m.floor(k / 2)); a.ycyl(cy - fy * 1.02, cy - fy * 0.9, cx + sx * fx, fz1 + H * 0.02, H * 0.04, 8); }
      if (v.kind !== 'obs') { const arm = (x, s) => { a.tube([[x, cy - fy * 0.9, fz0], [x, cy - fy * 1.1, fz0 - 0], [x + s * fx * 0.1, cy - fy * 1.25, fz0 + H * 0.15], [x + s * fx * 0.1, cy - fy * 1.5, fz0 + H * 0.1]].slice(0, 4), [tr * 1.4, tr * 1.1, tr * 0.9, tr * 0.8], 8); a.box(x + s * fx * 0.1 - 20, cy - fy * 1.6, fz0 + H * 0.06, x + s * fx * 0.1 + 20, cy - fy * 1.5, fz0 + H * 0.14); a.tube([[x + s * fx * 0.1 - 18, cy - fy * 1.75, fz0 + H * 0.1], [x + s * fx * 0.1 + 18, cy - fy * 1.75, fz0 + H * 0.1]], [tr * 0.4, tr * 0.4], 5); }; arm(cx + fx * 0.5, 1); if (v.kind === 'heavy') arm(cx - fx * 0.5, -1); }
      if (v.kind === 'heavy') { a.box(cx - fx * 0.7, cy - fy * 0.5, Z0 + H * 0.05, cx + fx * 0.7, cy + fy * 0.5, fz0); a.rect(cx - fx * 0.7, cy - fy * 0.5, cx + fx * 0.7, cy + fy * 0.5, 'EQUIP-DETAIL'); }
      a.box(cx - 25, cy + fy * 1.0, fz1 + H * 0.02, cx + 25, cy + fy * 1.1, Z1 - H * 0.04);
      a.rect(cx - fx, cy - fy, cx + fx, cy + fy); a.rect(cx - fx * 1.0, cy - fy * 1.0, cx + fx * 1.0, cy + fy * 1.0, 'EQUIP-DETAIL'); a.line(cx, cy - fy, cx, cy + fy, 'EQUIP-DETAIL');
      a.log('Added the tubular frame and skids, foam block, ' + v.th + ' ducted thrusters, camera, ' + v.lamps + ' lamps' + (v.kind === 'obs' ? '' : v.kind === 'light' ? ' and one manipulator arm' : ', tool skid and two manipulator arms') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic mooring buoy',
    desc: (v) => v.kind === 'calm' ? `Catenary anchor leg mooring buoy, ${v.ft} ft across: a flat round hull with a ring of rubber fenders and a deck, a rotating turntable with a hose manifold and two floating hose stubs, a light mast with a lantern and ${v.legs} chain stubs hanging below to the anchor points.` : `Spar mooring buoy, ${v.ft} ft tall: a long slender cylindrical float with a conical top, a mooring eye ring, a lantern on a short mast, a band of fenders at the waterline and a bottom chain shackle.`,
    vs: [['CALM type, 36 ft', 456, 456, 250, 0, { kind: 'calm', ft: 36, legs: 6 }], ['spar type, 22 ft', 70, 70, 270, 0, { kind: 'spar', ft: 22 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = W * 0.46;
      if (v.kind === 'calm') {
        const hz0 = Z0 + H * 0.45, hz1 = hz0 + H * 0.2;
        sup(a, [{ y: cy - R, x: cx, rx: 40, z0: hz0 + H * 0.03, z1: hz1 - H * 0.03 }, { y: cy - R * 0.8, x: cx, rx: R * 0.6, z0: hz0, z1: hz1 }, { y: cy, x: cx, rx: R, z0: hz0, z1: hz1 }, { y: cy + R * 0.8, x: cx, rx: R * 0.6, z0: hz0, z1: hz1 }, { y: cy + R, x: cx, rx: 40, z0: hz0 + H * 0.03, z1: hz1 - H * 0.03 }], { seg: 24, n: 3 });
        a.cyl(cx, cy, hz0, hz1, R, 28); ring3(a, cx, cy, hz0 + H * 0.1, R, H * 0.045, 28, 'z');
        a.cyl(cx, cy, hz1, hz1 + H * 0.04, R * 0.42, 20); a.cyl(cx, cy, hz1 + H * 0.04, hz1 + H * 0.1, R * 0.3, 18);
        for (let k = 0; k < 2; k++) { const t = k * m.PI + 0.7; a.tube([[cx + m.cos(t) * R * 0.28, cy + m.sin(t) * R * 0.28, hz1 + H * 0.08], [cx + m.cos(t) * R * 0.6, cy + m.sin(t) * R * 0.6, hz1 + H * 0.05], [cx + m.cos(t) * R * 0.92, cy + m.sin(t) * R * 0.92, hz1 + 4]], [H * 0.02, H * 0.018, H * 0.016], 8); }
        a.tube([[cx - R * 0.18, cy, hz1 + H * 0.1], [cx - R * 0.18, cy, Z1 - H * 0.08]], [H * 0.012, H * 0.01], 6); a.cyl(cx - R * 0.18, cy, Z1 - H * 0.08, Z1 - H * 0.04, H * 0.03, 8); a.ell(cx - R * 0.18, cy, Z1 - H * 0.02, H * 0.035, H * 0.035, H * 0.04, 8, 5);
        for (let k = 0; k < v.legs; k++) { const t = (k / v.legs) * TAU, c = m.cos(t), s = m.sin(t); a.tube([[cx + c * R * 0.8, cy + s * R * 0.8, hz0], [cx + c * R * 0.88, cy + s * R * 0.88, hz0 - H * 0.2], [cx + c * R * 0.96, cy + s * R * 0.96, Z0 + 20]], [H * 0.014, H * 0.014, H * 0.014], 6); a.box(cx + c * R * 0.8 - 20, cy + s * R * 0.8 - 20, hz0 - 40, cx + c * R * 0.8 + 20, cy + s * R * 0.8 + 20, hz0); }
        a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 0.42, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.9, 'EQUIP-HIDDEN'); a.line(cx, cy, cx + R * 0.92 * m.cos(0.7), cy + R * 0.92 * m.sin(0.7), 'EQUIP-DETAIL');
      } else {
        const fr = W * 0.34; a.tube([[cx, cy, Z0 + H * 0.06], [cx, cy, Z0 + H * 0.1], [cx, cy, Z0 + H * 0.78], [cx, cy, Z0 + H * 0.9]], [fr * 0.5, fr, fr, fr * 0.2], 18);
        a.cone(cx, cy, Z0 + H * 0.78, Z0 + H * 0.9, fr, fr * 0.2, 18); ring3(a, cx, cy, Z0 + H * 0.58, fr * 1.04, H * 0.025, 20, 'z'); ring3(a, cx, cy, Z0 + H * 0.64, fr * 1.04, H * 0.025, 20, 'z');
        a.cyl(cx, cy, Z0 + H * 0.9, Z0 + H * 0.95, fr * 0.14, 8); a.cyl(cx, cy, Z0 + H * 0.95, Z0 + H * 0.97, fr * 0.3, 8); a.ell(cx, cy, Z0 + H * 0.985, fr * 0.3, fr * 0.3, H * 0.015, 8, 5);
        ring3(a, cx + fr * 0.0, cy, Z0 + H * 0.84, fr * 0.45, H * 0.012, 12, 'x');
        a.cyl(cx, cy, Z0, Z0 + H * 0.06, fr * 0.1, 8); ring3(a, cx, cy, Z0 + H * 0.02, fr * 0.28, H * 0.012, 10, 'x');
        a.circ(cx, cy, fr, 'EQUIP'); a.circ(cx, cy, fr * 0.2, 'EQUIP-DETAIL'); a.circ(cx, cy, fr * 1.04, 'EQUIP-DETAIL');
      }
      a.log('Added the ' + (v.kind === 'calm' ? 'flat hull, fender ring, turntable with hose manifold and stubs, light mast and chain stubs' : 'slender float, conical top, mooring eye, fender bands, lantern and bottom shackle') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic wind turbine foundation',
    desc: (v) => v.kind === 'mono' ? `Monopile foundation with transition piece, ${v.dia} ft pile: a thick round pile section with a conical grout skirt, a transition piece with a top flange, a work platform with a rail, a boat landing with a ladder, two cable J-tubes and an anode ring.` : v.kind === 'jacket' ? `Four-leg jacket foundation for a wind turbine: four battered legs with X bracing in three bays, a transition piece on top with a flange, a platform with a rail, a boat landing and a ladder, and a pile sleeve at each foot.` : `Gravity-base foundation: a wide flat round base with a ring of ballast pockets, a conical shaft with a central column and a top flange, a work platform with a rail and a boat landing with a ladder.`,
    vs: [['monopile, 20 ft pile', 560, 560, 3400, 0, { kind: 'mono', dia: 20 }], ['four-leg jacket', 1000, 1000, 3600, 0, { kind: 'jacket' }], ['gravity base', 1100, 1100, 2000, 0, { kind: 'grav' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
      const platform = (zc, rr) => { a.cyl(cx, cy, zc, zc + 24, rr, 28); for (let k = 0; k < 20; k++) { const t = (k / 20) * TAU; a.tube([[cx + m.cos(t) * rr * 0.97, cy + m.sin(t) * rr * 0.97, zc + 24], [cx + m.cos(t) * rr * 0.97, cy + m.sin(t) * rr * 0.97, zc + 24 + 400]], [7, 7], 4); } ring3(a, cx, cy, zc + 24 + 400, rr * 0.97, 7, 24, 'z'); ring3(a, cx, cy, zc + 24 + 200, rr * 0.97, 5, 24, 'z'); a.circ(cx, cy, rr, 'EQUIP-DETAIL'); };
      const landing = (zc, r0) => { for (const s of [-1, 1]) { a.tube([[cx + s * 110, cy - r0, zc], [cx + s * 110, cy - r0 - 260, zc - 80]], [14, 14], 6); a.tube([[cx + s * 110, cy - r0 - 80, zc - 20], [cx + s * 110, cy - r0 - 260, Z0 + H * 0.28]], [10, 10], 5); } for (let k = 0; k < 8; k++) a.xcyl(cx - 110, cx + 110, cy - r0 - 80 - k * 8, zc - 40 - k * ((zc - Z0 - H * 0.28) / 8), 8, 5); a.box(cx - 150, cy - r0 - 280, zc - 90, cx + 150, cy - r0 - 80, zc - 60); a.rect(cx - 150, cy - r0 - 280, cx + 150, cy - r0 - 80, 'EQUIP-DETAIL'); };
      if (v.kind === 'mono') {
        const pr = (v.dia * 12 * I) / 2 * 0.6, tz = Z0 + H * 0.5;
        a.tube([[cx, cy, Z0], [cx, cy, tz - 160], [cx, cy, tz + 160], [cx, cy, Z1 - 160]], [pr, pr, pr * 1.1, pr * 0.9], 28); a.cone(cx, cy, tz - 160, tz + 40, pr * 1.0, pr * 1.18, 28);
        a.cyl(cx, cy, tz - 20, tz, pr * 1.26, 28); a.cyl(cx, cy, Z1 - 160, Z1 - 110, pr * 1.05, 28);
        ring3(a, cx, cy, tz - 260, pr * 1.04, H * 0.01, 28, 'z');
        for (const s of [-1, 1]) { a.tube([[cx + s * pr * 0.62, cy - pr * 0.8, Z0 + 150], [cx + s * pr * 0.65, cy - pr * 0.8, tz + 380], [cx + s * pr * 0.45, cy - pr * 0.5, tz + 480]], [20, 20, 20], 8); }
        platform(Z0 + H * 0.64, pr * 1.55); landing(tz + 60, pr * 1.2);
        a.circ(cx, cy, pr, 'EQUIP');
      } else if (v.kind === 'jacket') {
        const bx = W * 0.4, tx = W * 0.14, tz = Z0 + H * 0.66, lr = W * 0.011;
        const at = (f, sx, sy) => [cx + sx * lerp(bx, tx, f), cy + sy * lerp(bx, tx, f), lerp(Z0 + 80, tz, f)];
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) { a.tube([at(0, sx, sy), at(1, sx, sy)], [lr, lr * 0.9], 10); a.cyl(cx + sx * bx, cy + sy * bx, Z0, Z0 + 140, lr * 2.4, 10); a.circ(cx + sx * bx, cy + sy * bx, lr * 2.4, 'EQUIP-DETAIL'); }
        for (let i = 0; i <= 3; i++) for (const [s1, s2, t1, t2] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) a.tube([at(i / 3, s1, s2), at(i / 3, t1, t2)], [lr * 0.5, lr * 0.5], 6);
        for (let i = 0; i < 3; i++) for (const [s1, s2, t1, t2] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) { a.tube([at(i / 3, s1, s2), at((i + 1) / 3, t1, t2)], [lr * 0.4, lr * 0.4], 5); a.tube([at(i / 3, t1, t2), at((i + 1) / 3, s1, s2)], [lr * 0.4, lr * 0.4], 5); }
        a.box(cx - tx * 1.3, cy - tx * 1.3, tz, cx + tx * 1.3, cy + tx * 1.3, tz + H * 0.08); a.cyl(cx, cy, tz + H * 0.08, Z1 - 60, tx * 0.9, 24); a.cyl(cx, cy, Z1 - 60, Z1 - 20, tx * 1.05, 24);
        platform(tz + H * 0.14, tx * 1.9); landing(tz + H * 0.05, tx * 1.3 + 100);
        a.rect(cx - bx, cy - bx, cx + bx, cy + bx, 'EQUIP');
      } else {
        const br = W * 0.46, sh = W * 0.12;
        a.cyl(cx, cy, Z0, Z0 + H * 0.06, br, 36); a.cone(cx, cy, Z0 + H * 0.06, Z0 + H * 0.12, br, br * 0.8, 36);
        for (let k = 0; k < 12; k++) { const t = (k / 12) * TAU; a.cyl(cx + m.cos(t) * br * 0.88, cy + m.sin(t) * br * 0.88, Z0 + H * 0.06, Z0 + H * 0.1, br * 0.1, 10); a.circ(cx + m.cos(t) * br * 0.88, cy + m.sin(t) * br * 0.88, br * 0.1, 'EQUIP-DETAIL'); }
        a.cone(cx, cy, Z0 + H * 0.12, Z0 + H * 0.52, br * 0.8, sh * 1.2, 30); a.cone(cx, cy, Z0 + H * 0.5, Z0 + H * 0.52, sh * 1.6, sh * 1.25, 24); a.tube([[cx, cy, Z0 + H * 0.52], [cx, cy, Z1 - 80], [cx, cy, Z1 - 30]], [sh * 1.25, sh * 1.0, sh * 1.1], 24);
        platform(Z0 + H * 0.56, sh * 2.2); landing(Z0 + H * 0.5, sh * 1.2 + 100);
        a.circ(cx, cy, br, 'EQUIP'); a.circ(cx, cy, sh * 1.25, 'EQUIP-DETAIL');
      }
      a.log('Added the ' + (v.kind === 'mono' ? 'pile, transition piece with flange, J-tubes, anode ring' : v.kind === 'jacket' ? 'battered legs with X bracing, pile sleeves and transition piece' : 'ballast base, conical shaft and column') + ', work platform with rail, and the boat landing with ladder (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic offshore deck module',
    desc: (v) => v.kind === 'heli' ? `Helideck, ${v.ft} ft across: an octagonal landing deck with a painted ring and perimeter safety net, support trusses with a stair tower, perimeter lights and a fire-hose box.` : `Process deck module, ${v.ft} ft long: a skid frame with a plate deck and railings, two horizontal vessels on saddles, a pipe rack with a row of pipes and valves, a small crane pedestal and a pair of stairs.`,
    vs: [['helideck, 60 ft', 780, 780, 150, 0, { kind: 'heli', ft: 60 }], ['process module, 40 ft', 480, 288, 216, 0, { kind: 'proc', ft: 40 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
      if (v.kind === 'heli') {
        const R = W * 0.46, dz = Z0 + H * 0.62, pts = Array.from({ length: 8 }, (_, k) => { const t = (k / 8) * TAU + TAU / 16; return [cx + m.cos(t) * R, cy + m.sin(t) * R]; });
        a.prism(pts, dz, dz + 100); a.poly(pts);
        for (let k = 0; k < 8; k++) { const p = pts[k], q = pts[(k + 1) % 8]; a.tube([[p[0], p[1], dz + 100], [p[0] * 0.98 + cx * 0.02, p[1] * 0.98 + cy * 0.02, dz + 400]], [8, 8], 4); a.tube([[p[0], p[1], dz + 300], [q[0], q[1], dz + 300]], [6, 6], 4); a.tube([[p[0], p[1], dz + 100], [q[0], q[1], dz + 100]], [6, 6], 4); a.box(p[0] - 30, p[1] - 30, dz + 100, p[0] + 30, p[1] + 30, dz + 150); a.tube([[cx + (p[0] - cx) * 0.4, cy + (p[1] - cy) * 0.4, Z0 + H * 0.12], [p[0], p[1], dz]], [26, 26], 6); a.tube([[p[0], p[1], Z0 + H * 0.1], [p[0], p[1], dz]], [26, 26], 6); }
        ring3(a, cx, cy, Z0 + H * 0.12, R * 0.4, 30, 20, 'z'); a.cyl(cx, cy, Z0, Z0 + H * 0.12, R * 0.12, 14);
        a.box(cx + R * 0.5, cy - R * 1.0 * 0.0 - 70, Z0, cx + R * 0.62, cy + 70, dz - 10); for (let k = 0; k < 10; k++) a.box(cx + R * 0.5, cy + 70, dz - 80 - k * ((dz - Z0 - 80) / 10), cx + R * 0.7, cy + 360, dz - 60 - k * ((dz - Z0 - 80) / 10));
        a.circ(cx, cy, R * 0.82, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.5, 'EQUIP-DETAIL'); a.line(cx - R * 0.16, cy - R * 0.2, cx - R * 0.16, cy + R * 0.2, 'EQUIP-DETAIL'); a.line(cx + R * 0.16, cy - R * 0.2, cx + R * 0.16, cy + R * 0.2, 'EQUIP-DETAIL'); a.line(cx - R * 0.16, cy, cx + R * 0.16, cy, 'EQUIP-DETAIL'); a.circ(cx, cy, R, 'EQUIP-HIDDEN');
      } else {
        const dz = Z0 + H * 0.14;
        for (const x of [X0 + 40, cx, X1 - 40]) for (const y of [YF + 40, cy, YB - 40]) a.tube([[x, y, Z0], [x, y, dz]], [30, 30], 8);
        a.box(X0, YF, dz, X1, YB, dz + 30); for (let k = 1; k < 6; k++) a.line(X0, YF + (D * k) / 6, X1, YF + (D * k) / 6, 'EQUIP-DETAIL');
        rail(a, X0 + 20, YF + 20, X1 - 20, YF + 20, dz + 30, dz + 390, 10, 10, 2); rail(a, X0 + 20, YB - 20, X1 - 20, YB - 20, dz + 30, dz + 390, 10, 10, 2); rail(a, X0 + 20, YF + 20, X0 + 20, YB - 20, dz + 30, dz + 390, 10, 6, 2); rail(a, X1 - 20, YF + 20, X1 - 20, YB - 20, dz + 30, dz + 390, 10, 6, 2);
        for (const [x0, x1, yy] of [[X0 + 600, X0 + 3300, YF + D * 0.28], [X0 + 3600, X1 - 700, YF + D * 0.28]]) { a.xcyl(x0, x1, yy, dz + 30 + 560, 520, 18); a.ell(x0, yy, dz + 30 + 560, 200, 520, 520, 12, 8); a.ell(x1, yy, dz + 30 + 560, 200, 520, 520, 12, 8); for (const x of [x0 + (x1 - x0) * 0.2, x0 + (x1 - x0) * 0.8]) a.box(x - 80, yy - 520, dz + 30, x + 80, yy + 520, dz + 30 + 220); a.rect(x0 - 200, yy - 520, x1 + 200, yy + 520, 'EQUIP-DETAIL'); a.cyl(x0 + (x1 - x0) * 0.5, yy, dz + 30 + 1080, dz + 30 + 1260, 150, 10); }
        const ry = YB - D * 0.2; for (let k = 0; k < 3; k++) { a.xcyl(X0 + 300, X1 - 300, ry + k * 220 - 220, dz + 30 + 1200 + (k % 2) * 160, 90, 12); a.box(X0 + 1000, ry + k * 220 - 260, dz + 30 + 1100 + (k % 2) * 160, X0 + 1180, ry + k * 220 - 180, dz + 30 + 1400 + (k % 2) * 160); }
        for (const x of [X0 + 500, X1 - 500, cx]) { a.tube([[x, ry - 300, dz + 30], [x, ry - 300, dz + 30 + 1200]], [30, 30], 6); a.tube([[x, ry + 300, dz + 30], [x, ry + 300, dz + 30 + 1200]], [30, 30], 6); a.tube([[x, ry - 300, dz + 30 + 1250], [x, ry + 300, dz + 30 + 1250]], [26, 26], 6); }
        a.cyl(X1 - 700, YF + D * 0.7, dz + 30, dz + 30 + 800, 140, 12); a.tube([[X1 - 700, YF + D * 0.7, dz + 830], [X1 - 1500, YF + D * 0.7 - 400, dz + 1100], [X1 - 2100, YF + D * 0.7 - 800, dz + 800]], [60, 48, 36], 8);
        a.rect(X0, YF, X1, YB); a.rect(X0, ry - 440, X1, ry + 440, 'EQUIP-HIDDEN'); a.circ(X1 - 700, YF + D * 0.7, 140, 'EQUIP-DETAIL');
      }
      a.log('Added the ' + (v.kind === 'heli' ? 'octagonal deck with ring, safety net, support trusses, stair tower and perimeter lights' : 'skid frame, plate deck with railings, two saddled vessels, pipe rack with valves and the crane pedestal') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic subsea manifold',
    desc: (v) => `Subsea production manifold with ${v.slots} well slots: a mud mat and welded frame, two parallel headers with isolation valves at each end, ${v.slots} branch pipes each with a valve block, actuator and connector hub on the front face, a pigging loop at the rear and ROV torque-tool buckets.`,
    vs: [['4 slots', 224, 144, 96, 0, { slots: 4 }], ['6 slots', 296, 144, 96, 0, { slots: 6 }], ['8 slots', 368, 144, 100, 0, { slots: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.slots, hp = H * 0.07;
      a.box(X0, YF, Z0, X1, YB, Z0 + 50); const fz = Z0 + H * 0.12;
      for (const x of [X0 + 30, X1 - 30]) for (const y of [YF + 40, YB - 40]) { a.tube([[x, y, Z0 + 50], [x, y, Z1 - 30]], [22, 22], 8); a.cone(x, y, Z1 - 70, Z1, 60, 12, 8); }
      for (const z of [fz, Z1 - 30]) { a.tube([[X0 + 30, YF + 40, z], [X1 - 30, YF + 40, z]], [16, 16], 5); a.tube([[X0 + 30, YB - 40, z], [X1 - 30, YB - 40, z]], [16, 16], 5); for (const x of [X0 + 30, X1 - 30]) a.tube([[x, YF + 40, z], [x, YB - 40, z]], [16, 16], 5); }
      const bx = n; for (let i = 0; i <= n; i += 2) { const x = lerp(X0 + 30, X1 - 30, i / n); a.tube([[x, YF + 40, fz], [x, YB - 40, Z1 - 30]], [10, 10], 5); }
      const hz = Z0 + H * 0.5; for (const [y, hz2] of [[cy + D * 0.1, hz], [cy + D * 0.22, hz + hp * 2.2]]) { a.xcyl(X0 + 80, X1 - 80, y, hz2, hp, 14); for (const x of [X0 + 80, X1 - 80]) a.xcyl(x - 10, x + 10, y, hz2, hp * 1.5, 14); }
      for (let i = 0; i < n; i++) { const x = lerp(X0 + 120, X1 - 120, n === 1 ? 0 : i / (n - 1)); a.tube([[x, cy + D * 0.1, hz], [x, cy - D * 0.1, hz - hp], [x, YF + 90, hz - hp * 1.5]], [hp * 0.55, hp * 0.55, hp * 0.55], 8); a.box(x - hp * 1.4, cy - D * 0.2, hz - hp * 2.4, x + hp * 1.4, cy - D * 0.02, hz + hp * 0.6); a.cyl(x, cy - D * 0.11, hz + hp * 0.6, hz + hp * 2.4, hp * 0.8, 10); a.cyl(x, cy - D * 0.11, hz + hp * 2.4, hz + hp * 2.8, hp * 1.1, 10); a.ycyl(YF + 20, YF + 90, x, hz - hp * 1.5, hp * 1.2, 12); a.circ(x, YF + 55, hp * 1.2, 'EQUIP-DETAIL'); a.rect(x - hp * 1.4, cy - D * 0.2, x + hp * 1.4, cy - D * 0.02, 'EQUIP-DETAIL'); }
      for (const x of [X0 + 80, X1 - 80]) { a.box(x - hp * 1.6, cy + D * 0.06, hz - hp * 1.5, x + hp * 1.6, cy + D * 0.26, hz + hp * 3.2); a.cyl(x, cy + D * 0.16, hz + hp * 3.2, hz + hp * 4, hp * 0.9, 10); }
      a.tube([[X0 + 80, cy + D * 0.1, hz], [X0 + 30, cy + D * 0.3, hz], [X1 - 30, cy + D * 0.3, hz], [X1 - 80, cy + D * 0.1, hz]], [hp * 0.6, hp * 0.6, hp * 0.6, hp * 0.6], 8);
      for (let k = 0; k < 3; k++) { a.box(X0 + 120 + k * 120, YB - 90, Z0 + H * 0.62, X0 + 120 + k * 120 + 60, YB - 40, Z0 + H * 0.78); a.xcyl(X0 + 120 + k * 120 + 10, X0 + 120 + k * 120 + 50, YB - 66, Z0 + H * 0.7 + 0, 14, 8); }
      a.rect(X0, YF, X1, YB, 'EQUIP-HIDDEN'); a.line(X0 + 80, cy + D * 0.1, X1 - 80, cy + D * 0.1, 'EQUIP'); a.line(X0 + 80, cy + D * 0.22, X1 - 80, cy + D * 0.22, 'EQUIP'); a.outline();
      a.log('Added the mud mat and frame, two headers with end valves, ' + n + ' branch pipes with valve blocks, actuators and connector hubs, the pigging loop and the ROV buckets (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic suction anchor',
    desc: (v) => `Suction anchor, ${v.dia} ft across and ${v.ft} ft long: a closed-top steel cylinder with an open skirt, stiffener rings along the wall, a padeye on the side with a shackle, an ROV panel with a vent valve and a hot-stab receptacle, and four lifting lugs on the top plate.`,
    vs: [['12 ft by 30 ft', 156, 156, 372, 0, { dia: 12, ft: 30 }], ['18 ft by 45 ft', 228, 228, 560, 0, { dia: 18, ft: 45 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = W * 0.38;
      a.tube([[cx, cy, Z0], [cx, cy, Z1 - 120]], [R, R], 28); a.cyl(cx, cy, Z1 - 120, Z1 - 80, R * 1.04, 28); ring3(a, cx, cy, Z0 + 4, R * 1.01, H * 0.006, 28, 'z');
      for (const f of [0.2, 0.4, 0.6, 0.8, 0.92]) ring3(a, cx, cy, Z0 + H * f, R * 1.02, H * 0.008, 28, 'z');
      for (let k = 0; k < 12; k++) { const t = (k / 12) * TAU; a.box(cx + m.cos(t) * R - 4, cy + m.sin(t) * R - 4, Z0 + H * 0.2, cx + m.cos(t) * R * 1.03 + 4, cy + m.sin(t) * R * 1.03 + 4, Z1 - 130); }
      a.cyl(cx, cy, Z1 - 80, Z1 - 70, R * 0.8, 28); a.cyl(cx, cy, Z1 - 80, Z1 - 20, R * 0.12, 12); a.cyl(cx, cy, Z1 - 20, Z1 - 10, R * 0.2, 12);
      for (let k = 0; k < 4; k++) { const t = (k / 4) * TAU + 0.78; ring3(a, cx + m.cos(t) * R * 0.7, cy + m.sin(t) * R * 0.7, Z1 - 70, 40, 8, 10, 'z'); a.box(cx + m.cos(t) * R * 0.7 - 30, cy + m.sin(t) * R * 0.7 - 12, Z1 - 80, cx + m.cos(t) * R * 0.7 + 30, cy + m.sin(t) * R * 0.7 + 12, Z1 - 60); }
      const pz = Z0 + H * 0.34; a.box(cx - 30, cy - R - 120, pz - 90, cx + 30, cy - R + 6, pz + 90); ring3(a, cx, cy - R - 120, pz, 60, 14, 12, 'y'); a.xcyl(cx - 55, cx + 55, cy - R - 100, pz - 34, 16, 6);
      a.box(cx + R * 0.45, cy - R * 0.9, Z1 - 160, cx + R * 0.75, cy - R * 0.6, Z1 - 90); a.xcyl(cx + R * 0.5, cx + R * 0.7, cy - R * 0.9, Z1 - 125, 26, 8); a.cyl(cx + R * 0.6, cy - R * 0.74, Z1 - 90, Z1 - 20, 20, 8);
      a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 0.8, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 1.04, 'EQUIP-DETAIL'); a.line(cx, cy - R, cx, cy - R - 120, 'EQUIP-DETAIL');
      a.log('Added the closed-top cylinder with skirt and stiffener rings, the side padeye with shackle, ROV vent panel, lifting lugs and the top plate (plan and 3D).');
    } }),
];
export default FAMS;

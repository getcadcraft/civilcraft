/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, marine (150 more): original generic scale shapes (no maker, model or brand). */
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


/** the shared vessel builder: hull + deckhouses + funnel + mast + hatches + bollards + fenders; o.extra(a, c) adds the family's own parts. Returns the context. */
function ship(a, o) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, B = W / 2 - 10, hd = H * (o.hd ?? 0.3), bf = o.bf ?? 0.22, sf = o.sf ?? 0.12, st = o.st ?? 0.3;
  const fn = (f) => ({ x: cx, hb: B * (f < bf ? m.sin((f / bf) * m.PI / 2) ** (o.bp ?? 0.75) : 1) * (f > 1 - sf ? 1 - st * ((f - 1 + sf) / sf) : 1), zd: Z0 + hd + hd * (o.sheer ?? 0.15) * (1 - f) ** 2, zk: Z0 + 12 + hd * (o.keel ?? 0.2) * (1 - f) ** 3, p: o.p ?? 2.6 });
  const S = hull(a, { y0: YF + 10, y1: YB - 10, fn, n: o.n ?? 20 });
  const Y = (f) => YF + 10 + (D - 20) * f, hb = (f) => fn(f).hb, zd = (f) => fn(f).zd;
  const c = { S, Y, hb, zd, fn, cx, hd, B };
  if (o.bulwark) for (const s of [-1, 1]) { const p = sheer(S, s, 0); a.tube(p.map(([x, y, z]) => [x, y, z + o.bulwark]), p.map(() => 16), 6); for (let i = 1; i < S.length - 1; i += 2) { const r = S[i].row[s > 0 ? S[i].row.length - 1 : 0]; a.box(r[0] - (s > 0 ? 10 : 0), r[1] - 12, r[2], r[0] + (s > 0 ? 0 : 10), r[1] + 12, r[2] + o.bulwark); } }
  for (const h of o.houses ?? []) {
    const z0 = zd(h.f0) + (h.zo ?? 0) - 10, z1 = z0 + h.h, wd = h.w ?? 0.8, hh = (f) => hb(f) * wd;
    sup(a, [{ y: Y(h.f0), x: cx, rx: hh(h.f0) * 0.9, z0, z1: z1 - h.h * 0.15 }, { y: Y(h.f0) + 40, x: cx, rx: hh(h.f0), z0, z1 }, { y: Y(h.f1) - 40, x: cx, rx: hh(h.f1), z0, z1 }, { y: Y(h.f1), x: cx, rx: hh(h.f1) * 0.92, z0, z1: z1 - h.h * 0.1 }], { seg: 12, n: h.n ?? 5 });
    if (h.panes) paneBand(a, cx, hh((h.f0 + h.f1) / 2), Y(h.f0) + h.pm, Y(h.f1) - h.pm, z0 + h.h * 0.42, z1 - h.h * 0.14, h.panes, 16, 12);
    a.box(cx - hh(h.f0) - 14, Y(h.f0), z1, cx + hh(h.f0) + 14, Y(h.f1), z1 + 20);
    if (h.rail) for (const s of [-1, 1]) { a.tube([[cx + s * (hh((h.f0 + h.f1) / 2) + 6), Y(h.f0) + 20, z1 + 120], [cx + s * (hh((h.f0 + h.f1) / 2) + 6), Y(h.f1) - 20, z1 + 120]], [8, 8], 5); }
    a.rect(cx - hh((h.f0 + h.f1) / 2), Y(h.f0), cx + hh((h.f0 + h.f1) / 2), Y(h.f1), 'EQUIP-DETAIL');
    h.top = z1;
  }
  if (o.funnel) { const f = o.funnel, hz = zd(f.f) + (f.zo ?? 0); a.tube([[cx + (f.dx ?? 0), Y(f.f), hz], [cx + (f.dx ?? 0), Y(f.f) + f.rake, hz + f.h]], [f.r, f.r * 0.8], 14); a.cyl(cx + (f.dx ?? 0), Y(f.f) + f.rake, hz + f.h, hz + f.h + 20, f.r * 0.86, 14); a.ell(cx + (f.dx ?? 0), Y(f.f) + f.rake * 0.5, hz + f.h * 0.7, f.r * 0.15, f.r * 0.25, 60, 6, 4); a.circ(cx + (f.dx ?? 0), Y(f.f), f.r, 'EQUIP-DETAIL'); }
  if (o.mast) { const mt = o.mast; a.tube([[cx, Y(mt.f), mt.z], [cx, Y(mt.f), Z1 - 30]], [mt.r ?? 22, (mt.r ?? 22) * 0.6], 8); a.box(cx - 120, Y(mt.f) - 20, Z1 - 120, cx + 120, Y(mt.f) + 20, Z1 - 80); a.ell(cx, Y(mt.f), Z1 - 30, 28, 28, 30, 8, 5); }
  for (const hc of o.hatches ?? []) for (let k = 0; k < hc.n; k++) { const f0 = hc.f0 + ((hc.f1 - hc.f0) * k) / hc.n, f1 = hc.f0 + ((hc.f1 - hc.f0) * (k + 0.85)) / hc.n, ww = hb(f0) * hc.w; a.box(cx - ww - 10, Y(f0), zd(f0), cx + ww + 10, Y(f1), zd(f0) + 40); a.box(cx - ww, Y(f0) + 14, zd(f0) + 40, cx + ww, Y(f1) - 14, zd(f0) + 70); for (let j = 1; j < 4; j++) a.line(cx - ww + (2 * ww * j) / 4, Y(f0) + 14, cx - ww + (2 * ww * j) / 4, Y(f1) - 14, 'EQUIP-DETAIL'); a.rect(cx - ww, Y(f0), cx + ww, Y(f1), 'EQUIP-DETAIL'); }
  for (const f of o.bollards ?? []) for (const s of [-1, 1]) { const x = cx + s * (hb(f) - 70), y = Y(f), z = zd(f); a.cyl(x, y, z, z + 130, 32, 10); a.cyl(x, y, z + 130, z + 160, 46, 10); a.circ(x, y, 40, 'EQUIP-DETAIL'); }
  for (let k = 0; k < (o.fenders ?? 0); k++) for (const s of [-1, 1]) { const f = 0.25 + (0.5 * k) / m.max((o.fenders ?? 1) - 1, 1), r = S[m.round(f * (S.length - 1))].row[s > 0 ? S[0].row.length - 1 : 0]; a.ycyl(r[1] - 110, r[1] + 110, r[0] + s * 34, r[2] - 90, 36, 8); }
  if (o.extra) o.extra(a, c);
  a.line(cx, YF + 10, cx, YB - 10, 'EQUIP-DETAIL');
  return c;
}

/** a proxy of an Acc that scales small radii (authored in plain millimetre-ish units) by U, for very large objects (offshore, cranes) */
function sc(a, U) {
  const r = (x) => (x < 40 ? x * U : x);
  return new Proxy(a, { get(t, k) {
    const f = t[k];
    if (k === 'tube') return (p, rs, sg2) => t.tube(p, rs.map(r), sg2);
    if (k === 'cyl' || k === 'xcyl' || k === 'ycyl') return (...g) => { g[4] = r(g[4]); return t[k](...g); };
    if (k === 'cone') return (...g) => { g[4] = r(g[4]); g[5] = r(g[5]); return t.cone(...g); };
    if (k === 'ell') return (...g) => { g[3] = r(g[3]); g[4] = r(g[4]); g[5] = r(g[5]); return t.ell(...g); };
    if (k === 'circ') return (x, y, R, l) => t.circ(x, y, r(R), l);
    return typeof f === 'function' ? f.bind(t) : f;
  } });
}

const FAMS = [
  // ===================================================== boats =====================================================
  fam({ cat: 'marine/boats', title: 'Generic flybridge motor yacht',
    desc: (v) => `Motor yacht, ${v.ft} ft: a deep-V displacement hull with bulwark rail, a raised salon with window bands, an upper flybridge with rails and a radar arch, a foredeck sun pad, bow rail and ${v.fenders} fenders along each side.`,
    vs: [['36 ft', 144, 432, 150, 0, { ft: 36, fenders: 3 }], ['46 ft', 168, 552, 180, 0, { ft: 46, fenders: 4 }], ['60 ft', 200, 720, 224, 0, { ft: 60, fenders: 5 }]],
    build: (a, v) => {
      const H = a.H;
      ship(a, { hd: 0.34, bf: 0.28, sf: 0.08, st: 0.12, p: 1.6, sheer: 0.2, fenders: v.fenders, bulwark: 90,
        houses: [{ f0: 0.3, f1: 0.84, h: H * 0.28, w: 0.78, panes: m.round(v.ft / 9), pm: 160, n: 4 }, { f0: 0.46, f1: 0.74, h: H * 0.2, w: 0.58, zo: H * 0.28, panes: 3, pm: 100, rail: true, n: 4 }],
        mast: { f: 0.6, z: a.Z0 + H * 0.82, r: 24 },
        extra: (a, c) => {
          const { Y, hb, zd, cx } = c, top = a.Z0 + H * 0.82;
          for (const s of [-1, 1]) a.tube([[cx + s * hb(0.6) * 0.5, Y(0.62), top], [cx + s * hb(0.6) * 0.5, Y(0.62), top + H * 0.1], [cx, Y(0.62), top + H * 0.14]], [14, 12, 10], 6);
          a.box(cx - hb(0.12) * 0.45, Y(0.1), zd(0.1), cx + hb(0.12) * 0.45, Y(0.2), zd(0.1) + 30);
          for (const s of [-1, 1]) { a.tube([[cx + s * hb(0.07) * 0.8, Y(0.06), zd(0.06) + 10], [cx + s * hb(0.07) * 0.8, Y(0.06), zd(0.06) + 150]], [9, 9], 5); }
          a.tube([[cx - hb(0.07) * 0.8, Y(0.06), zd(0.06) + 150], [cx, Y(0.012), zd(0.012) + 150], [cx + hb(0.07) * 0.8, Y(0.06), zd(0.06) + 150]], [9, 9, 9], 5);
          a.box(cx - hb(0.9) * 0.7, Y(0.86), zd(0.86), cx + hb(0.9) * 0.7, Y(0.96), zd(0.86) + 16);
          a.ellp(cx, Y(0.55), hb(0.55) * 0.4, 90, 'EQUIP-DETAIL');
        } });
      a.log('Added the hull with bulwark, salon with windows, flybridge with rails, radar arch, sun pad, bow rail and fenders (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic harbour tugboat',
    desc: (v) => `Harbour tug, ${v.ft} ft: a stubby round-bilge hull with a push knee at the bow, a two-level wheelhouse with window bands, a funnel and mast, a towing hook arch and winch on the aft deck, bollards and ${v.tyres} tyre fenders hung along the sides.`,
    vs: [['40 ft', 168, 480, 200, 0, { ft: 40, tyres: 4 }], ['55 ft', 216, 660, 250, 0, { ft: 55, tyres: 5 }], ['75 ft', 270, 900, 320, 0, { ft: 75, tyres: 7 }]],
    build: (a, v) => {
      const H = a.H;
      ship(a, { hd: 0.34, bf: 0.2, sf: 0.14, st: 0.5, p: 2.2, sheer: 0.1, bulwark: 70, bollards: [0.28, 0.7],
        houses: [{ f0: 0.3, f1: 0.58, h: H * 0.24, w: 0.66, panes: 4, pm: 110 }, { f0: 0.34, f1: 0.52, h: H * 0.2, w: 0.5, zo: H * 0.24, panes: 3, pm: 70, n: 4 }],
        funnel: { f: 0.62, r: a.W * 0.1, h: H * 0.34, rake: 40, zo: 0 }, mast: { f: 0.42, z: a.Z0 + H * 0.78, r: 20 },
        extra: (a, c) => {
          const { Y, hb, zd, cx, S } = c;
          a.box(cx - hb(0.05) * 0.7, Y(0.0) + 10, zd(0.0) - 60, cx + hb(0.05) * 0.7, Y(0.06), zd(0.0) + 140);
          for (let k = 0; k < 2; k++) a.line(cx - hb(0.05) * 0.7, Y(0.015 + k * 0.02), cx + hb(0.05) * 0.7, Y(0.015 + k * 0.02), 'EQUIP-DETAIL');
          const ay = Y(0.72), az = zd(0.72); a.tube([[cx - hb(0.72) * 0.8, ay, az], [cx - hb(0.72) * 0.8, ay, az + H * 0.22], [cx + hb(0.72) * 0.8, ay, az + H * 0.22], [cx + hb(0.72) * 0.8, ay, az]], [16, 16, 16, 16], 8);
          a.ell(cx, ay, az + H * 0.22 - 20, 30, 30, 36, 8, 5); a.xcyl(cx - 110, cx + 110, Y(0.8), az + 70, 55, 12); a.box(cx - 140, Y(0.8) - 80, az, cx + 140, Y(0.8) + 80, az + 30);
          for (let k = 0; k < v.tyres; k++) for (const s of [-1, 1]) { const r = S[m.round((0.2 + (0.6 * k) / (v.tyres - 1)) * (S.length - 1))].row[s > 0 ? 10 : 0]; ring3(a, r[0] + s * 30, r[1], r[2] - 60, 52, 18, 12, 'x'); }
        } });
      a.log('Added the round-bilge hull with push knee, two-level wheelhouse, funnel, mast, towing arch with winch, bollards and tyre fenders (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic stern trawler',
    desc: (v) => `Stern trawler, ${v.ft} ft: a high-bowed hull with bulwarks, a forward wheelhouse with windows and mast, a net drum and an A-frame gantry across the stern with a trawl door hung on each side, ${v.holds} fish-hold hatches and a stern ramp opening.`,
    vs: [['50 ft', 192, 600, 260, 0, { ft: 50, holds: 2 }], ['70 ft', 240, 840, 330, 0, { ft: 70, holds: 3 }], ['90 ft', 288, 1080, 400, 0, { ft: 90, holds: 4 }]],
    build: (a, v) => {
      const H = a.H;
      ship(a, { hd: 0.34, bf: 0.26, sf: 0.1, st: 0.2, p: 2.8, sheer: 0.3, bulwark: 110, bollards: [0.5, 0.9],
        houses: [{ f0: 0.14, f1: 0.36, h: H * 0.26, w: 0.74, panes: 4, pm: 90 }, { f0: 0.18, f1: 0.3, h: H * 0.16, w: 0.5, zo: H * 0.26, panes: 2, pm: 50, n: 4 }],
        hatches: [{ f0: 0.42, f1: 0.66, n: v.holds - 1, w: 0.4 }],
        funnel: { f: 0.36, r: a.W * 0.05, h: H * 0.22, rake: 20, dx: a.W * 0.2, zo: 0 }, mast: { f: 0.24, z: a.Z0 + H * 0.78, r: 18 },
        extra: (a, c) => {
          const { Y, hb, zd, cx } = c, gy = Y(0.8), gz = zd(0.8);
          a.xcyl(cx - hb(0.7) * 0.7, cx + hb(0.7) * 0.7, Y(0.7), gz + 120, 100, 14); for (const s of [-1, 1]) a.xcyl(cx + s * hb(0.7) * 0.7, cx + s * (hb(0.7) * 0.7 + 14), Y(0.7), gz + 120, 150, 14);
          for (const s of [-1, 1]) { a.tube([[cx + s * hb(0.85) * 0.9, gy, gz], [cx + s * hb(0.85) * 0.28, gy - 120, gz + H * 0.5], [cx + s * 50, gy - 140, gz + H * 0.62]], [22, 18, 14], 8); a.box(cx + s * hb(0.85) * 0.75 - 9, gy - 40, gz + 40, cx + s * hb(0.85) * 0.75 + 9, gy + 40, gz + 210); a.box(cx + s * hb(0.85) * 0.75 - 40, gy - 30, gz + 210, cx + s * hb(0.85) * 0.75 + 40, gy + 30, gz + 250); }
          a.tube([[cx - 60, gy - 140, gz + H * 0.62], [cx + 60, gy - 140, gz + H * 0.62]], [20, 20], 8);
          prismX(a, [[Y(0.97), zd(0.97)], [Y(0.995), zd(0.97) - 50], [Y(0.995), zd(0.97) - 130], [Y(0.97), zd(0.97) - 130]], cx - hb(0.97) * 0.35, cx + hb(0.97) * 0.35);
          a.rect(cx - hb(0.7) * 0.7, Y(0.7) - 100, cx + hb(0.7) * 0.7, Y(0.7) + 100, 'EQUIP-DETAIL');
        } });
      a.log('Added the high-bowed hull with bulwarks, wheelhouse, mast, net drum, A-frame gantry with trawl doors, hold hatches and stern ramp (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic sailing catamaran',
    desc: (v) => `Cruising catamaran, ${v.ft} ft: two slim hulls joined by a bridge deck with a cabin and cockpit, trampolines between the bows, a mast with boom and stays, two rudders and a stern rail.`,
    vs: [['30 ft', 168, 360, 440, 0, { ft: 30, hbm: 0.22 }], ['40 ft', 216, 480, 540, 0, { ft: 40, hbm: 0.2 }], ['50 ft', 264, 600, 640, 0, { ft: 50, hbm: 0.19 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, hbw = W * v.hbm, off = W / 2 - hbw - 8, Y = (f) => YF + 10 + (D - 20) * f, zdk = Z0 + H * 0.22;
      const mk = (x) => hull(a, { y0: YF + 10, y1: YB - 10, n: 18, fn: (f) => ({ x, hb: hbw * m.sin(m.PI * (0.12 + 0.88 * f) ** 1 * 0.5 + 0) ** 0.6 * (f < 0.12 ? m.sin((f / 0.12) * m.PI / 2) ** 0.8 : 1), zd: zdk + H * 0.08 * (1 - f) ** 2, zk: Z0 + 12 + H * 0.04 * (1 - f) ** 3, p: 2.2 }) });
      const SL = mk(cx - off), SR = mk(cx + off);
      prismY(a, [[cx - off, zdk + 40], [cx + off, zdk + 40], [cx + off, zdk + 80], [cx - off, zdk + 80]], Y(0.22), Y(0.86));
      sup(a, [{ y: Y(0.3), x: cx, rx: off * 0.7, z0: zdk + 70, z1: zdk + H * 0.12 }, { y: Y(0.36), x: cx, rx: off * 0.84, z0: zdk + 70, z1: zdk + H * 0.28 }, { y: Y(0.62), x: cx, rx: off * 0.84, z0: zdk + 70, z1: zdk + H * 0.28 }, { y: Y(0.68), x: cx, rx: off * 0.7, z0: zdk + 70, z1: zdk + H * 0.2 }], { seg: 12, n: 4 });
      paneBand(a, cx, off * 0.84, Y(0.38), Y(0.6), zdk + H * 0.14, zdk + H * 0.24, 4, 16, 10);
      for (let k = 0; k < 7; k++) { const f = 0.02 + k * 0.03; a.tube([[cx - off + hbw * 0.3, Y(f), zdk + 20], [cx + off - hbw * 0.3, Y(f), zdk + 20]], [5, 5], 4); }
      a.box(cx - off + hbw * 0.3, Y(0.0) + 10, zdk + 14, cx + off - hbw * 0.3, Y(0.2), zdk + 20); a.line(cx - off, Y(0.2), cx + off, Y(0.2), 'EQUIP-DETAIL');
      const my = Y(0.4), mz = zdk + H * 0.28; a.tube([[cx, my, mz], [cx, my, Z1 - 20]], [40, 24], 10);
      a.tube([[cx, my, mz + H * 0.25], [cx, Y(0.85), mz + H * 0.27]], [26, 20], 8);
      a.tube([[cx, my, Z1 - 20], [cx, Y(0.02), zdk + 40]], [7, 7], 5); a.tube([[cx, my, Z1 - 20], [cx - off, my + 30, zdk + 40]], [7, 7], 5); a.tube([[cx, my, Z1 - 20], [cx + off, my + 30, zdk + 40]], [7, 7], 5); a.tube([[cx, my, Z1 - 20], [cx, Y(0.98), zdk + 40]], [7, 7], 5);
      for (const x of [cx - off, cx + off]) { prismX(a, [[Y(0.95), zdk - 20], [Y(0.99), zdk - 20], [Y(0.99), Z0 + 60], [Y(0.96), Z0 + 60]], x - 12, x + 12); a.tube([[x, Y(0.88), zdk + 40], [x, Y(0.88), zdk + 140]], [12, 12], 6); }
      for (const s of [-1, 1]) a.tube([[cx + s * (off + hbw * 0.6), Y(0.7), zdk + 20], [cx + s * (off + hbw * 0.6), Y(0.7), zdk + 160], [cx + s * (off + hbw * 0.6), Y(0.98), zdk + 160]], [8, 8, 8], 5);
      a.log('Added both hulls, the bridge deck with cabin and windows, trampolines, mast, boom, stays, rudders and rails (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic personal watercraft',
    desc: (v) => `Personal watercraft, ${v.seats}-seat: a rounded jet-drive hull with an upswept bow, a hand-grip steering column with a mirror pod, a long saddle seat with a back rest, footwells with side steps, a bow grab handle and a rear boarding step with a jet nozzle.`,
    vs: [['2-seat', 48, 132, 40, 0, { seats: 2 }], ['3-seat', 52, 148, 42, 0, { seats: 3 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, Y = (f) => YF + 10 + (D - 20) * f;
      sup(a, [{ y: Y(0), x: cx, rx: 40, z0: Z0 + H * 0.35, z1: Z0 + H * 0.5 }, { y: Y(0.12), x: cx, rx: W * 0.36, z0: Z0 + H * 0.14, z1: Z0 + H * 0.62 }, { y: Y(0.5), x: cx, rx: W * 0.5, z0: Z0 + 12, z1: Z0 + H * 0.56 }, { y: Y(0.9), x: cx, rx: W * 0.44, z0: Z0 + 12, z1: Z0 + H * 0.5 }, { y: Y(1), x: cx, rx: W * 0.3, z0: Z0 + H * 0.12, z1: Z0 + H * 0.44 }], { seg: 16, n: 2.8 });
      planOf(a, [{ y: Y(0), x: cx, rx: 30 }, { y: Y(0.12), x: cx, rx: W * 0.36 }, { y: Y(0.5), x: cx, rx: W * 0.5 }, { y: Y(0.9), x: cx, rx: W * 0.44 }, { y: Y(1), x: cx, rx: W * 0.3 }]);
      const sy0 = Y(0.5), sy1 = Y(0.94), sz = Z0 + H * 0.56;
      sup(a, [{ y: sy0, x: cx, rx: W * 0.14, z0: sz - 10, z1: sz + 60 }, { y: sy0 + 60, x: cx, rx: W * 0.17, z0: sz - 10, z1: sz + 110 }, { y: sy1 - 90, x: cx, rx: W * 0.17, z0: sz - 10, z1: sz + 90 }, { y: sy1, x: cx, rx: W * 0.14, z0: sz - 10, z1: sz + 200 }], { seg: 10, n: 3 });
      a.rect(cx - W * 0.17, sy0, cx + W * 0.17, sy1, 'EQUIP-DETAIL');
      const hy = Y(0.36), hz = Z0 + H * 0.6; a.tube([[cx, hy + 160, sz], [cx, hy, hz + 120], [cx, hy - 20, hz + 230]], [26, 24, 22], 8); a.tube([[cx - W * 0.28, hy - 20, hz + 230], [cx + W * 0.28, hy - 20, hz + 230]], [14, 14], 8); for (const s of [-1, 1]) a.ell(cx + s * W * 0.29, hy - 20, hz + 230, 40, 14, 14, 8, 5);
      a.box(cx - 70, hy - 50, hz + 200, cx + 70, hy + 20, hz + 270);
      a.tube([[cx, Y(0.06), Z0 + H * 0.62], [cx - 40, Y(0.12), Z0 + H * 0.66], [cx + 40, Y(0.12), Z0 + H * 0.66], [cx, Y(0.06), Z0 + H * 0.62]], [8, 8, 8, 8], 5);
      for (const s of [-1, 1]) { a.box(cx + s * W * 0.38 - 50, Y(0.52), Z0 + H * 0.36, cx + s * W * 0.38 + 50, Y(0.93), Z0 + H * 0.36 + 20); a.line(cx + s * W * 0.3, Y(0.52), cx + s * W * 0.3, Y(0.93), 'EQUIP-DETAIL'); }
      a.cone(cx, Y(1) - 14, Z0 + H * 0.26, Z0 + H * 0.26 + 1, 4, 4, 4); a.ycyl(YB - 80, YB - 6, cx, Z0 + H * 0.26, 70, 12); a.box(cx - W * 0.2, YB - 70, Z0 + H * 0.12, cx + W * 0.2, YB - 8, Z0 + H * 0.16);
      a.log('Added the jet hull, saddle seat with back rest, steering column with grips and mirror pod, footwells, grab handle, jet nozzle and boarding step (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic stand-up paddle board on rack',
    desc: (v) => `Stand-up paddle board, ${v.ft} ft, resting on a two-cradle rack: a lofted pointed-nose board with a deck pad, a bow carry handle, a leash plug and ${v.fins} fins at the tail, the rack drawn with two padded U-cradles on feet and a stretcher bar.`,
    vs: [["9 ft 6 in all-round", 34, 114, 26, 0, { ft: '9.5', fins: 3, thick: 0.34 }], ["10 ft 6 in all-round", 34, 126, 27, 0, { ft: '10.5', fins: 3, thick: 0.36 }], ["12 ft 6 in touring", 30, 150, 26, 0, { ft: '12.5', fins: 1, thick: 0.34 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, Y = (f) => YF + 6 + (D - 12) * f, bz = Z1 - 70, t = 90;
      const rx = (f) => (W * 0.46) * m.max(m.sin(m.PI * (0.02 + 0.96 * f) ** 0.9), 0.02) ** 0.5 * (f > 0.7 ? 1 - 0.25 * ((f - 0.7) / 0.3) : 1);
      const st = []; for (let i = 0; i <= 20; i++) { const f = i / 20; st.push({ y: Y(f), x: cx, rx: rx(f), z0: bz - t * 0.5 + (f < 0.1 ? (0.1 - f) * 300 : 0), z1: bz + t * 0.5 + (f < 0.1 ? (0.1 - f) * 600 : 0) }); }
      sup(a, st, { seg: 12, n: 2.4 }); planOf(a, st);
      sup(a, [0.3, 0.4, 0.62, 0.7].map((f) => ({ y: Y(f), x: cx, rx: rx(f) * 0.72, z0: bz + t * 0.5 - 4, z1: bz + t * 0.5 + 10 })), { seg: 8, n: 3 });
      a.tube([[cx - 80, Y(0.47), bz + t * 0.5], [cx - 80, Y(0.47), bz + t * 0.5 + 18], [cx + 80, Y(0.47), bz + t * 0.5 + 18], [cx + 80, Y(0.47), bz + t * 0.5]], [8, 8, 8, 8], 5);
      a.cyl(cx, Y(0.95), bz + t * 0.5, bz + t * 0.5 + 16, 14, 8);
      for (let k = 0; k < v.fins; k++) { const x = v.fins === 1 ? cx : cx + (k - 1) * 48, y0 = Y(0.84) + (k === 1 ? 0 : 40) , l = v.fins === 1 ? 250 : (k === 1 ? 190 : 120); prismX(a, [[y0, bz - t * 0.5], [y0 + l, bz - t * 0.5], [y0 + l * 0.7, bz - t * 0.5 - 130], [y0 + l * 0.35, bz - t * 0.5 - 130]], x - 5, x + 5); }
      for (const f of [0.3, 0.62]) { const y = Y(f); a.box(cx - rx(f) * 0.85, y - 55, bz - t * 0.5 - 40, cx + rx(f) * 0.85, y + 55, bz - t * 0.5); for (const s of [-1, 1]) { a.box(cx + s * rx(f) * 0.85 - 12, y - 50, bz - t * 0.5, cx + s * rx(f) * 0.85 + 12, y + 50, bz + t * 0.1); a.box(cx + s * rx(f) * 0.9 - 24, y - 60, Z0, cx + s * rx(f) * 0.9 + 24, y + 60, bz - t * 0.5 - 40); } a.box(cx - rx(f) * 0.9, y - 6, Z0 + 150, cx + rx(f) * 0.9, y + 6, Z0 + 180); }
      a.line(cx, YF + 6, cx, YB - 6, 'EQUIP-DETAIL');
      a.log('Added the lofted board with deck pad, carry handle, leash plug and fins, resting on a two-cradle rack with feet and a stretcher bar (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic racing rowing shell',
    desc: (v) => `Racing rowing shell for ${v.n} rower${v.n > 1 ? 's' : ''} (${v.kind}), ${v.ft} ft long, on a two-trestle rack: a very slim covered hull with a cockpit rim, ${v.n} sliding seats on rails with foot stretchers, ${v.n * 2} outrigger frames with oarlock gates, a skeg at the stern and bow ball, stored with the oars off.`,
    vs: [['single scull', 62, 324, 30, 0, { n: 1, ft: 27, kind: 'single scull' }], ['double scull', 76, 372, 30, 0, { n: 2, ft: 31, kind: 'double scull' }], ['quad scull', 100, 528, 30, 0, { n: 4, ft: 44, kind: 'quad scull' }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, Y = (f) => YF + 6 + (D - 12) * f, bz = Z0 + 560, hw = 130;
      const rx = (f) => hw * m.max(m.sin(m.PI * (0.01 + 0.98 * f)), 0.04) ** 0.45;
      const st = []; for (let i = 0; i <= 24; i++) { const f = i / 24; st.push({ y: Y(f), x: cx, rx: rx(f), z0: bz - 70 + 40 * m.abs(f - 0.5), z1: bz + 70 - 20 * m.abs(2 * f - 1) ** 3 }); }
      sup(a, st, { seg: 12, n: 2.2 }); planOf(a, st);
      a.ell(cx, Y(0.002), bz, 30, 30, 30, 8, 5);
      const c0 = 0.2, c1 = 0.8; a.tube([[cx - 90, Y(c0), bz + 55], [cx - 90, Y(c1), bz + 55]], [9, 9], 5); a.tube([[cx + 90, Y(c0), bz + 55], [cx + 90, Y(c1), bz + 55]], [9, 9], 5);
      for (const x of [cx - 90, cx + 90]) a.line(x, Y(c0), x, Y(c1), 'EQUIP-DETAIL');
      for (let k = 0; k < v.n; k++) { const f = 0.74 - (k * 0.5) / m.max(v.n, 1) * 1 + (v.n === 1 ? -0.2 : 0.05) - 0.0; const y = Y(m.max(0.32, m.min(0.74, f))); a.box(cx - 80, y - 60, bz + 55, cx + 80, y + 60, bz + 75); a.box(cx - 62, y - 70, bz + 75, cx + 62, y + 70, bz + 85); a.rect(cx - 80, y - 60, cx + 80, y + 60, 'EQUIP-DETAIL'); const yo = y + 40; for (const s of [-1, 1]) { a.tube([[cx + s * 100, yo, bz + 70], [cx + s * W * 0.43, yo - 20, bz + 130]], [12, 9], 6); a.tube([[cx + s * 100, yo - 90, bz + 20], [cx + s * W * 0.43, yo - 20, bz + 130]], [12, 9], 6); a.tube([[cx + s * W * 0.43, yo - 20, bz + 130], [cx + s * W * 0.43, yo - 20, bz + 200]], [9, 9], 5); a.xcyl(cx + s * W * 0.43 - 16, cx + s * W * 0.43 + 16, yo - 20, bz + 205, 20, 8); a.line(cx + s * 100, yo, cx + s * W * 0.43, yo - 20, 'EQUIP-DETAIL'); } a.box(cx - 70, y - 150, bz - 40, cx + 70, y - 130, bz + 30); }
      prismX(a, [[Y(0.97), bz - 70], [Y(0.995), bz - 120], [Y(0.995), bz - 200], [Y(0.96), bz - 70]], cx - 5, cx + 5);
      for (const f of [0.28, 0.72]) { const y = Y(f); for (const s of [-1, 1]) { a.tube([[cx + s * 100, y, Z0], [cx + s * 40, y, bz - 80]], [16, 14], 6); } a.tube([[cx - 100, y, Z0 + 140], [cx + 100, y, Z0 + 140]], [10, 10], 5); a.box(cx - 120, y - 40, Z0, cx - 80, y + 40, Z0 + 12); a.box(cx + 80, y - 40, Z0, cx + 120, y + 40, Z0 + 12); }
      a.log('Added the slim covered hull with cockpit rim, sliding seats on rails, foot stretchers, outrigger frames with oarlock gates, skeg, bow ball and the trestle rack (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic enclosed lifeboat on cradle',
    desc: (v) => `Totally enclosed lifeboat, ${v.ft} ft, for ${v.seats} seats, on a launch cradle: a fully decked hull with a rounded canopy, side entry hatches, a top lookout hatch, a lifting hook ring, a skeg, a propeller guard and a cradle with two skid beams and chocks.`,
    vs: [['26 ft, 20 seats', 90, 312, 108, 0, { ft: 26, seats: 20 }], ['32 ft, 40 seats', 108, 384, 126, 0, { ft: 32, seats: 40 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, Y = (f) => YF + 10 + (D - 20) * f, bz = Z0 + 190;
      const rx = (f) => W * 0.4 * (f < 0.18 ? m.sin((f / 0.18) * m.PI / 2) ** 0.7 : f > 0.9 ? 1 - 0.5 * (f - 0.9) / 0.1 : 1);
      const st = [];
      for (let i = 0; i <= 18; i++) { const f = i / 18; st.push({ y: Y(f), x: cx, rx: rx(f), z0: bz - 40 + 160 * (1 - f) ** 3 * 0.3, z1: bz + H * 0.5 * m.min(1, 0.4 + f * 3.5, (1 - f) * 8 + 0.3) }); }
      sup(a, st, { seg: 14, n: 2.6 }); planOf(a, st);
      sup(a, [{ y: Y(0.2), x: cx, rx: rx(0.2) * 0.9, z0: bz + 60, z1: bz + H * 0.55 }, { y: Y(0.3), x: cx, rx: rx(0.3) * 0.9, z0: bz + 60, z1: bz + H * 0.62 }, { y: Y(0.78), x: cx, rx: rx(0.78) * 0.9, z0: bz + 60, z1: bz + H * 0.62 }, { y: Y(0.86), x: cx, rx: rx(0.86) * 0.8, z0: bz + 60, z1: bz + H * 0.5 }], { seg: 14, n: 3 });
      for (const s of [-1, 1]) for (const f of [0.42, 0.62]) a.box(cx + s * rx(f) * 0.9 - (s > 0 ? 6 : 14), Y(f) - 70, bz + H * 0.14, cx + s * rx(f) * 0.9 + (s > 0 ? 14 : 6), Y(f) + 70, bz + H * 0.52);
      a.cyl(cx, Y(0.5), bz + H * 0.62, bz + H * 0.62 + 30, 90, 12); ring3(a, cx, Y(0.5), bz + H * 0.62 + 90, 55, 10, 12, 'x');
      a.ell(cx, Y(0.35), bz + H * 0.62 + 20, 110, 70, 30, 10, 6);
      prismX(a, [[Y(0.9), bz - 40], [Y(0.97), bz - 40], [Y(0.97), Z0 + 90], [Y(0.92), Z0 + 90]], cx - 8, cx + 8); ring3(a, cx, Y(0.98), bz - 70, 100, 8, 14, 'x');
      for (const f of [0.28, 0.72]) { const y = Y(f); for (const s of [-1, 1]) a.box(cx + s * W * 0.2 - 18, y - 60, Z0, cx + s * W * 0.2 + 18, y + 60, bz - 20); a.box(cx - W * 0.28, y - 60, Z0, cx + W * 0.28, y + 60, Z0 + 12); a.rect(cx - W * 0.28, y - 60, cx + W * 0.28, y + 60, 'EQUIP-DETAIL'); }
      for (const s of [-1, 1]) a.box(cx + s * W * 0.2 - 18, Y(0.05), Z0, cx + s * W * 0.2 + 18, Y(0.95), Z0 + 28);
      a.log('Added the decked hull with rounded canopy, side hatches, lookout hatch, lifting ring, skeg, propeller guard and the skid cradle (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic deck cargo barge',
    desc: (v) => `Flat deck cargo barge, ${v.ft} ft: a box hull with raked bow and stern, a coaming round the deck, ${v.bitts} pairs of mooring bitts, ${v.spuds ? 'two vertical spud poles in wells, ' : ''}${v.house ? 'a small deckhouse at the stern with windows and a roof rail, ' : ''}cargo lashing eyes along the edges and fender rubbing strakes down the sides.`,
    vs: [['60 ft', 240, 720, 90, 0, { ft: 60, bitts: 2, spuds: false, house: false }], ['100 ft', 336, 1200, 150, 0, { ft: 100, bitts: 3, spuds: true, house: false }], ['150 ft', 480, 1800, 200, 0, { ft: 150, bitts: 4, spuds: true, house: true }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, hd = H * (v.house ? 0.42 : 0.7), Y = (f) => YF + 10 + (D - 20) * f;
      const hx = W / 2 - 14, rk = 0.07;
      const fn = (f) => ({ x: cx, hb: hx * (f < rk ? 0.76 + 0.24 * f / rk : f > 1 - rk ? 0.8 + 0.2 * (1 - f) / rk : 1), zd: Z0 + hd, zk: Z0 + 20 + (f < rk ? (rk - f) / rk * hd * 0.5 : f > 1 - rk ? (f - 1 + rk) / rk * hd * 0.4 : 0), p: 12 });
      const S = hull(a, { y0: YF + 10, y1: YB - 10, fn, n: 20, np: 7 });
      for (const s of [-1, 1]) { const p = sheer(S, s, 0); a.tube(p.map(([x, y, z]) => [x, y, z + 22]), p.map(() => 22), 6); const r0 = S[4].row[s > 0 ? 6 : 0], r1 = S[16].row[s > 0 ? 6 : 0]; a.box(r0[0] - 10 + s * 10, r0[1], Z0 + hd * 0.2, r1[0] + 10 + s * 10, r1[1], Z0 + hd * 0.34); }
      for (let k = 0; k < v.bitts; k++) { const f = 0.12 + (0.76 * k) / m.max(v.bitts - 1, 1); for (const s of [-1, 1]) for (const d of [-90, 90]) { const x = cx + s * (hx - 60), y = Y(f) + d, z = Z0 + hd + 22; a.cyl(x, y, z, z + 110, 30, 8); a.cyl(x, y, z + 110, z + 136, 44, 8); a.circ(x, y, 34, 'EQUIP-DETAIL'); } }
      for (let k = 0; k < 8; k++) for (const s of [-1, 1]) ring3(a, cx + s * (hx - 130), Y(0.14 + 0.1 * k), Z0 + hd + 24, 28, 7, 8, 'z');
      if (v.spuds) for (const s of [-1, 1]) { const x = cx + s * (hx - 170), y = Y(0.9); a.cyl(x, y, Z0 + hd - 30, Z0 + hd + 18, 100, 12); a.tube([[x, y, Z0 - 0 + 30], [x, y, Z1 - 20]], [48, 48], 10); a.cone(x, y, Z0, Z0 + 30, 10, 48, 10); a.circ(x, y, 100, 'EQUIP-DETAIL'); }
      if (v.house) { const hz = Z0 + hd + 22, f0 = 0.74, f1 = 0.86, hh = Z1 - hz - 220; sup(a, [{ y: Y(f0), x: cx, rx: hx * 0.38, z0: hz, z1: hz + hh * 0.85 }, { y: Y(f0) + 30, x: cx, rx: hx * 0.42, z0: hz, z1: hz + hh }, { y: Y(f1) - 30, x: cx, rx: hx * 0.42, z0: hz, z1: hz + hh }, { y: Y(f1), x: cx, rx: hx * 0.38, z0: hz, z1: hz + hh * 0.9 }], { seg: 12, n: 5 }); paneBand(a, cx, hx * 0.42, Y(f0) + 60, Y(f1) - 60, hz + hh * 0.4, hz + hh * 0.8, 3, 14, 10); a.box(cx - hx * 0.46, Y(f0), hz + hh, cx + hx * 0.46, Y(f1), hz + hh + 20); a.rect(cx - hx * 0.42, Y(f0), cx + hx * 0.42, Y(f1), 'EQUIP-DETAIL'); a.tube([[cx, Y(0.8), hz + hh + 20], [cx, Y(0.8), hz + hh + 200]], [16, 12], 6); }
      a.log('Added the box hull with raked ends, deck coaming, mooring bitts, lashing eyes, rubbing strakes' + (v.spuds ? ', spud poles' : '') + (v.house ? ' and the stern deckhouse' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic coastal cargo ship',
    desc: (v) => `Coastal general cargo ship, ${v.ft} ft: a long hull with a raised bow and bulwark, ${v.holds} hatch-covered holds with coamings, a ${v.crane ? 'deck crane between the holds, ' : ''}stern accommodation block with window bands and a bridge wing, a funnel and a mast with radar.`,
    vs: [['150 ft', 300, 1800, 520, 0, { ft: 150, holds: 2, crane: false }], ['220 ft', 420, 2640, 700, 0, { ft: 220, holds: 3, crane: true }], ['300 ft', 540, 3600, 900, 0, { ft: 300, holds: 4, crane: true }]],
    build: (a, v) => {
      const H = a.H;
      ship(a, { hd: 0.3, bf: 0.2, sf: 0.06, st: 0.2, p: 3.2, sheer: 0.3, bulwark: 100, bollards: [0.1, 0.9], fenders: 0,
        houses: [{ f0: 0.8, f1: 0.95, h: H * 0.26, w: 0.8, panes: 3, pm: 120 }, { f0: 0.82, f1: 0.93, h: H * 0.18, w: 0.84, zo: H * 0.26, panes: 3, pm: 60, n: 4 }, { f0: 0.83, f1: 0.91, h: H * 0.12, w: 0.68, zo: H * 0.44, panes: 2, pm: 40, n: 4 }],
        hatches: [{ f0: 0.18, f1: 0.76, n: v.holds, w: 0.55 }],
        funnel: { f: 0.86, r: a.W * 0.06, h: H * 0.2, rake: 30, zo: H * 0.56 }, mast: { f: 0.87, z: a.Z0 + H * 0.74, r: 22 },
        extra: (a, c) => {
          const { Y, hb, zd, cx } = c;
          for (const s of [-1, 1]) { a.tube([[cx + s * hb(0.86) * 0.8, Y(0.86), zd(0.86) + H * 0.46], [cx + s * hb(0.9), Y(0.87), zd(0.86) + H * 0.46]], [18, 18], 6); }
          if (v.crane) { const cy = Y(0.5), cz = zd(0.5); a.cyl(cx, cy, cz, cz + 110, 80, 12); a.tube([[cx, cy, cz + 110], [cx, cy, cz + H * 0.4]], [48, 40], 10); a.tube([[cx, cy, cz + H * 0.36], [cx + hb(0.5) * 0.7, cy, cz + H * 0.52], [cx + hb(0.5) * 0.9, cy, cz + H * 0.3]], [32, 26, 20], 8); a.circ(cx, cy, 80, 'EQUIP-DETAIL'); }
          const sy = Y(0.02); a.tube([[cx, sy, zd(0.02) + 100], [cx, sy, zd(0.02) + 250]], [14, 14], 6); a.box(cx - 60, sy + 10, zd(0.02), cx + 60, sy + 70, zd(0.02) + 60);
        } });
      a.log('Added the hull with bulwark, hatch-covered holds, ' + (v.crane ? 'deck crane, ' : '') + 'three-tier stern accommodation with bridge wings, funnel, mast and bollards (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic single-sail dinghy on launch trolley',
    desc: (v) => `Sailing dinghy, ${v.ft} ft, on a launch trolley: an open hull with a centreboard case, a mast with one sail panel on a boom, a rudder with tiller, ${v.crew} thwart seat${v.crew > 1 ? 's' : ''} and hiking straps, the trolley with two wheels and a cradle.`,
    vs: [['11 ft, single sail', 54, 168, 190, 0, { ft: 11, crew: 1, sail: 0.7, ms: 190 }], ['14 ft, main and jib', 66, 204, 240, 0, { ft: 14, crew: 2, sail: 0.8, ms: 240 }], ['16 ft, with spinnaker pole', 78, 240, 280, 0, { ft: 16, crew: 2, sail: 0.88, ms: 280 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, B = W * 0.42, bz = Z0 + 220, Y = (f) => YF + 10 + (D - 20) * f;
      const fn = (f) => ({ x: cx, hb: B * (f < 0.35 ? m.sin((f / 0.35) * m.PI / 2) ** 0.7 : 1 - 0.12 * (f - 0.35) / 0.65), zd: bz + 140 + 40 * (1 - f) ** 2, zk: bz + 12 + 40 * (1 - f) ** 3, p: 2.4 });
      const S = hull(a, { y0: YF + 10, y1: YB - 40, n: 18, open: 14, fn }); sheerTube(a, S, 10, 10);
      const hb = (f) => fn(f).hb; const yy = (f) => YF + 10 + (D - 50) * f;
      a.box(cx - 14, yy(0.4), bz + 30, cx + 14, yy(0.6), bz + 150); a.ell(cx, yy(0.5), bz + 150, 20, 120, 14, 8, 4);
      for (let k = 0; k < v.crew; k++) { const f = 0.62 + k * 0.14; bench(a, cx - hb(f) + 30, cx + hb(f) - 30, yy(f), fn(f).zd - 20, 160, 22, 80); }
      a.box(cx - hb(0.96) - 4, YB - 90, bz + 10, cx + hb(0.96) + 4, YB - 40, fn(1).zd);
      const my = yy(0.3), top = Z1 - 10; a.tube([[cx, my, bz + 130], [cx, my, top]], [26, 12], 8); a.tube([[cx, my, bz + 160], [cx, yy(0.88), bz + 220]], [14, 12], 6);
      prismX(a, [[my + 20, bz + 260], [yy(0.9) - 20, bz + 240], [my + 20, top - 40]], cx - 3, cx + 3);
      if (v.crew > 1) prismX(a, [[my - 30, bz + 220], [my - 30, top - 100], [yy(0.05), bz + 250]], cx - 3, cx + 3);
      for (const s of [-1, 1]) a.tube([[cx + s * hb(0.3) * 0.7, my + 30, fn(0.3).zd], [cx, my, bz + 130 + (top - bz - 130) * 0.8]], [5, 5], 4);
      a.tube([[cx, YB - 60, bz + 20], [cx, YB - 60, fn(1).zd - 10]], [12, 10], 6); a.tube([[cx, YB - 60, fn(1).zd - 10], [cx, YB - 260, fn(1).zd + 20]], [10, 8], 6);
      for (const f of [0.3, 0.72]) { const y = yy(f); for (const s of [-1, 1]) a.tube([[cx + s * 50, y, Z0 + 120], [cx + s * hb(f) * 0.5, y, bz + 6]], [14, 12], 6); a.tube([[cx - 50, y, Z0 + 120], [cx + 50, y, Z0 + 120]], [12, 12], 6); }
      a.tube([[cx, yy(0.3), Z0 + 120], [cx, yy(0.72), Z0 + 120]], [14, 14], 6);
      for (const s of [-1, 1]) whl(a, cx + s * 70, yy(0.5), 95, 90, { z: Z0 + 95, plain: true });
      a.line(cx, YF + 10, cx, YB - 40, 'EQUIP-DETAIL');
      a.log('Added the open hull with centreboard case, seats, rudder and tiller, mast, boom, sail panels, stays and the launch trolley with wheels (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic sport fishing boat',
    desc: (v) => `Sport fishing boat, ${v.ft} ft: a deep-V hull with a raised bow, a deckhouse with windows and an open flybridge, a tuna tower with a platform, two folding outrigger poles, a cockpit with a fish box and a row of rod holders along the stern rail.`,
    vs: [['32 ft', 132, 384, 190, 0, { ft: 32 }], ['42 ft', 160, 504, 240, 0, { ft: 42 }]],
    build: (a, v) => {
      const H = a.H;
      ship(a, { hd: 0.3, bf: 0.3, sf: 0.08, st: 0.1, p: 1.5, sheer: 0.35, bulwark: 70, fenders: 3,
        houses: [{ f0: 0.3, f1: 0.62, h: H * 0.24, w: 0.76, panes: 4, pm: 90, n: 4 }, { f0: 0.4, f1: 0.58, h: H * 0.15, w: 0.5, zo: H * 0.24, panes: 2, pm: 40, rail: true, n: 4 }],
        extra: (a, c) => {
          const { Y, hb, zd, cx } = c, Z1 = a.Z1, tz = zd(0.5) + H * 0.38, ty = Y(0.52);
          for (const s of [-1, 1]) { a.tube([[cx + s * hb(0.5) * 0.7, Y(0.6), zd(0.6)], [cx + s * hb(0.5) * 0.4, ty, tz + H * 0.1]], [14, 10], 6); a.tube([[cx + s * hb(0.5) * 0.7, Y(0.48), zd(0.48)], [cx + s * hb(0.5) * 0.4, ty, tz + H * 0.1]], [14, 10], 6); a.tube([[cx + s * hb(0.5) * 0.4, ty, tz + H * 0.1], [cx + s * hb(0.5) * 0.4, ty, Z1 - H * 0.12]], [10, 10], 5); }
          a.box(cx - hb(0.5) * 0.5, ty - 70, Z1 - H * 0.12, cx + hb(0.5) * 0.5, ty + 70, Z1 - H * 0.1); a.tube([[cx - hb(0.5) * 0.5, ty - 70, Z1 - H * 0.1], [cx - hb(0.5) * 0.5, ty - 70, Z1 - 6], [cx + hb(0.5) * 0.5, ty - 70, Z1 - 6], [cx + hb(0.5) * 0.5, ty - 70, Z1 - H * 0.1]], [7, 7, 7, 7], 5);
          for (const s of [-1, 1]) a.tube([[cx + s * hb(0.5) * 0.5, Y(0.5), zd(0.5) + H * 0.3], [cx + s * hb(0.5) * 0.95, Y(0.72), zd(0.5) + H * 0.62]], [9, 5], 5);
          a.box(cx - hb(0.8) * 0.5, Y(0.8), zd(0.8), cx + hb(0.8) * 0.5, Y(0.9), zd(0.8) + 70); a.rect(cx - hb(0.8) * 0.5, Y(0.8), cx + hb(0.8) * 0.5, Y(0.9), 'EQUIP-DETAIL');
          for (let k = 0; k < 4; k++) a.tube([[cx - hb(0.96) * 0.7 + k * hb(0.96) * 0.47, Y(0.97), zd(0.97) + 70], [cx - hb(0.96) * 0.7 + k * hb(0.96) * 0.47, Y(0.97), zd(0.97) + 120]], [8, 8], 5);
          a.tube([[cx, Y(0.1), zd(0.1)], [cx, Y(0.04), zd(0.04) + 50]], [8, 6], 5);
          a.line(cx - hb(0.5) * 0.5, ty, cx + hb(0.5) * 0.5, ty, 'EQUIP-DETAIL');
        } });
      a.log('Added the deep-V hull with deckhouse, open flybridge, tuna tower with platform, outrigger poles, cockpit fish box and rod holders (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic flat-bottom jon boat',
    desc: (v) => `Flat-bottom jon boat, ${v.ft} ft: a square-bowed open hull with a flat floor, rolled gunwales, ${v.n} bench seats, a transom with an outboard bracket, a bow eye and a bow-mounted trolling motor on a deck pad with a lowered shaft and propeller.`,
    vs: [['10 ft', 44, 120, 24, 0, { ft: 10, n: 2 }], ['12 ft', 50, 144, 26, 0, { ft: 12, n: 2 }], ['14 ft', 56, 168, 28, 0, { ft: 14, n: 3 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, B = W / 2 - 20, Y = (f) => YF + 24 + (D - 48) * f;
      const fn = (f) => ({ x: cx, hb: B * (f < 0.1 ? 0.7 + 3 * f : 1), zd: Z0 + H * 0.72 + H * 0.08 * (1 - f) ** 2, zk: Z0 + H * 0.12 + H * 0.12 * (f < 0.1 ? (0.1 - f) * 10 : 0), p: 8 });
      const S = hull(a, { y0: YF + 24, y1: YB - 24, n: 14, np: 7, open: 14, fn }); sheerTube(a, S, 8, 8);
      for (let k = 0; k < v.n; k++) { const f = 0.35 + (0.5 * k) / v.n; const hb = fn(f).hb; bench(a, cx - hb + 14, cx + hb - 14, Y(f), fn(f).zd - 50, 160, 20, 100); }
      a.box(cx - B * 0.8, YB - 22, Z0 + H * 0.22, cx + B * 0.8, YB - 8, fn(1).zd + 20); a.box(cx - 40, YB - 8, Z0 + H * 0.3, cx + 40, YB + 0, fn(1).zd + 30);
      const bz = fn(0.08).zd - 10; a.box(cx - B * 0.5, Y(0.04), bz - 10, cx + B * 0.5, Y(0.18), bz); a.cyl(cx, Y(0.12), bz, bz + 30, 55, 10);
      a.tube([[cx, Y(0.12), bz + 30], [cx, Y(0.12), bz + 90], [cx + 20, Y(0.1), bz + 110]], [10, 10, 14], 6); a.tube([[cx, Y(0.12), bz + 30], [cx, Y(0.12) - 0, bz - 200]], [16, 14], 8); a.ell(cx, Y(0.12), bz - 210, 36, 80, 30, 8, 5);
      for (let k = 0; k < 3; k++) { const t = (k / 3) * TAU; a.tube([[cx, Y(0.12) - 70, bz - 210], [cx + m.cos(t) * 90, Y(0.12) - 70, bz - 210 + m.sin(t) * 90]], [10, 6], 4); }
      ring3(a, cx, Y(0.01), fn(0.01).zd - 40, 30, 6, 8, 'x');
      for (let i = 0; i < 4; i++) a.line(cx - B * 0.9, Y(0.2 + i * 0.2), cx + B * 0.9, Y(0.2 + i * 0.2), 'EQUIP-DETAIL');
      a.log('Added the flat-bottom open hull with bench seats, transom bracket, bow eye and the trolling motor with shaft and propeller (plan and 3D).');
    } }),

  fam({ cat: 'marine/boats', title: 'Generic lapstrake dory',
    desc: (v) => `Traditional dory, ${v.ft} ft: a narrow flat-bottomed hull with flared planked sides, a pointed bow and a tombstone transom, ${v.thw} thwarts on knees, a bow breasthook, two oarlock pads and ${v.laps} lap lines along each side.`,
    vs: [['12 ft', 44, 144, 20, 0, { ft: 12, thw: 2, laps: 3 }], ['16 ft', 52, 192, 22, 0, { ft: 16, thw: 3, laps: 4 }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, D, H } = a, B = W / 2 - 6, Y = (f) => YF + 8 + (D - 16) * f;
      const fn = (f) => ({ x: cx, hb: B * m.max(m.sin((f * 0.96 + 0.04) * m.PI * 0.92) ** 0.8, 0.02), zd: Z0 + H * 0.78 + H * 0.22 * m.abs(f - 0.5) ** 2 * 2 + H * 0.12 * (1 - f) ** 2, zk: Z0 + H * 0.12 + H * 0.1 * m.abs(2 * f - 1) ** 3, p: 1.6 });
      const S = hull(a, { y0: YF + 8, y1: YB - 8, n: 18, open: 12, fn }); sheerTube(a, S, 8, 9);
      for (let k = 0; k < v.thw; k++) { const f = 0.3 + (0.45 * k) / m.max(v.thw - 1, 1); const hb = fn(f).hb; bench(a, cx - hb + 18, cx + hb - 18, Y(f), fn(f).zd - 36, 150, 20, 80); }
      a.box(cx - 50, YB - 40, Z0 + H * 0.3, cx + 50, YB - 8, fn(1).zd + 4);
      for (const s of [-1, 1]) { const f = 0.46, hb = fn(f).hb, x = cx + s * (hb + 2); a.cyl(x, Y(f), fn(f).zd, fn(f).zd + 40, 10, 6); a.circ(x, Y(f), 10, 'EQUIP-DETAIL'); for (let k = 1; k <= v.laps; k++) { const f0 = 0.15, f1 = 0.88; const p = []; for (let i = 0; i <= 8; i++) { const ff = f0 + ((f1 - f0) * i) / 8, r = S[m.round(ff * (S.length - 1))].row; const rw = r[s > 0 ? Math.round(10 - k * 1.2) : Math.round(k * 1.2)]; p.push([rw[0], rw[1], rw[2] + 6]); } a.tube(p, p.map(() => 4), 4); } }
      a.box(cx - 30, Y(0.04), fn(0.04).zd - 50, cx + 30, Y(0.12), fn(0.04).zd - 24);
      a.line(cx, YF + 8, cx, YB - 8, 'EQUIP-DETAIL');
      a.log('Added the flared planked hull with lap lines, thwarts, breasthook, tombstone transom and oarlock pads (plan and 3D).');
    } }),

  // ===================================================== deck =====================================================
  fam({ cat: 'marine/deck', title: 'Generic mooring bitt',
    desc: (v) => `${v.kindText} mooring bitt, ${v.len} in: a base plate with ${v.bolts} bolts, ${v.n === 1 ? 'one hollow post' : 'two hollow posts'} with turned-out caps${v.cross ? ', a horizontal cross bar welded between the posts' : ''} and a gusset at the foot of each post.`,
    vs: [['single post', 8, 8, 10, 0, { kindText: 'Single', len: 8, n: 1, bolts: 4, cross: false }], ['double post', 18, 9, 12, 0, { kindText: 'Double', len: 18, n: 2, bolts: 6, cross: false }], ['double post with cross bar', 26, 10, 16, 0, { kindText: 'Double', len: 26, n: 2, bolts: 8, cross: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = D * 0.2, xs = v.n === 1 ? [cx] : [X0 + W * 0.26, X1 - W * 0.26];
      a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.07);
      xs.forEach((x) => { a.tube([[x, cy, Z0 + H * 0.07], [x, cy, Z0 + H * 0.72]], [R * 1.1, R], 14); a.cone(x, cy, Z0 + H * 0.72, Z0 + H * 0.8, R * 1.1, R * 1.6, 14); a.cyl(x, cy, Z0 + H * 0.8, Z1, R * 1.6, 14); for (const s of [-1, 1]) prismX(a, [[cy - R * 1.9, Z0 + H * 0.07], [cy + R * 1.9, Z0 + H * 0.07], [cy, Z0 + H * 0.4]], x + s * R * 1.05 - 3, x + s * R * 1.05 + 3); a.circ(x, cy, R * 1.6, 'EQUIP'); a.circ(x, cy, R, 'EQUIP-DETAIL'); });
      if (v.cross) a.xcyl(xs[0], xs[1], cy, Z0 + H * 0.5, R * 0.45, 10);
      for (let k = 0; k < v.bolts; k++) { const x = X0 + W * 0.08 + ((W * 0.84) * (k >> 1)) / m.max((v.bolts >> 1) - 1, 1), y = k % 2 ? cy + D * 0.4 : cy - D * 0.4; a.cyl(x, y, Z0 + H * 0.07, Z0 + H * 0.12, 7, 6); a.circ(x, y, 7, 'EQUIP-DETAIL'); }
      a.rect(X0, YF, X1, YB);
      a.log('Added the base plate with bolts, hollow post' + (v.n > 1 ? 's' : '') + ' with turned-out caps, foot gussets' + (v.cross ? ' and the cross bar' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic boat davit',
    desc: (v) => `Boat davit with a ${v.reach} in reach: a base flange with bolts, a pedestal, a curved lifting arm that swings out over the side, a head sheave block, a tackle wire falling to a lifting hook and a stay bracket on the arm.`,
    vs: [['small, 48 in reach', 56, 20, 84, 0, { reach: 48 }], ['medium, 84 in reach', 96, 24, 120, 0, { reach: 84 }], ['large, 120 in reach', 132, 30, 160, 0, { reach: 120 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bx = X0 + D * 0.5, R = D * 0.28;
      a.cyl(bx, cy, Z0, Z0 + H * 0.03, D * 0.5, 18); for (let k = 0; k < 6; k++) { const t = (k / 6) * TAU; a.cyl(bx + m.cos(t) * D * 0.4, cy + m.sin(t) * D * 0.4, Z0 + H * 0.03, Z0 + H * 0.05, 8, 6); }
      a.tube([[bx, cy, Z0 + H * 0.03], [bx, cy, Z0 + H * 0.4]], [R * 1.2, R], 14); a.cyl(bx, cy, Z0 + H * 0.4, Z0 + H * 0.43, R * 1.3, 14);
      const pts = [[bx, cy, Z0 + H * 0.43], [bx, cy, Z0 + H * 0.78], [bx + W * 0.1, cy, Z0 + H * 0.95], [bx + W * 0.4, cy, Z1 - H * 0.05], [X1 - D * 0.3, cy, Z1 - H * 0.1]];
      a.tube(pts, [R * 0.85, R * 0.8, R * 0.7, R * 0.55, R * 0.5], 10);
      a.box(X1 - D * 0.55, cy - R * 0.6, Z1 - H * 0.16, X1 - D * 0.1, cy + R * 0.6, Z1 - H * 0.04); a.xcyl(X1 - D * 0.55, X1 - D * 0.1, cy, Z1 - H * 0.1, R * 0.7, 12);
      a.tube([[X1 - D * 0.3, cy, Z1 - H * 0.16], [X1 - D * 0.3, cy, Z0 + H * 0.2]], [3, 3], 4); a.ell(X1 - D * 0.3, cy, Z0 + H * 0.2 - 12, 10, 10, 16, 8, 5); ring3(a, X1 - D * 0.3, cy, Z0 + H * 0.2 - 30, 10, 4, 8, 'x');
      a.tube([[bx + W * 0.06, cy, Z0 + H * 0.4], [bx + W * 0.4, cy, Z0 + H * 0.9]], [R * 0.3, R * 0.3], 6);
      a.circ(bx, cy, D * 0.5, 'EQUIP'); a.line(bx, cy, X1 - D * 0.3, cy, 'EQUIP-DETAIL'); a.circ(X1 - D * 0.3, cy, R * 0.7, 'EQUIP-DETAIL');
      a.log('Added the flange, pedestal, curved lifting arm, head sheave block, tackle wire with hook and the stay bracket (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic bow roller and anchor keeper',
    desc: (v) => `Bow roller for an anchor, ${v.len} in long: a base plate with bolts, two cheek plates, ${v.rollers} grooved roller${v.rollers > 1 ? 's' : ''} on pins${v.keeper ? ', a spring-loaded anchor keeper pin with a retaining chain and a bumper lip' : ''} and a rounded lip at the bow end.`,
    vs: [['single roller, 12 in', 12, 5, 6, 0, { len: 12, rollers: 1, keeper: false }], ['twin roller, 18 in', 18, 7, 8, 0, { len: 18, rollers: 2, keeper: false }], ['twin roller with keeper, 24 in', 24, 8, 10, 0, { len: 24, rollers: 2, keeper: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
      a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.1);
      for (const s of [-1, 1]) prismX(a, [[YF + D * 0.1, Z0 + H * 0.1], [YB - D * 0.05, Z0 + H * 0.1], [YB - D * 0.05, Z1 - H * 0.2], [YF + D * 0.3, Z1], [YF + D * 0.1, Z1 - H * 0.1]], s > 0 ? X1 - W * 0.05 - 0.01 * W : cx - W * 0.5 + 0, s > 0 ? X1 : X0 + W * 0.05);
      for (let k = 0; k < v.rollers; k++) { const y = v.rollers === 1 ? YF + D * 0.4 : YF + D * (0.3 + 0.4 * k); a.xcyl(X0 + W * 0.05, X1 - W * 0.05, y, Z0 + H * 0.58, H * 0.28, 14); for (let j = 1; j < 3; j++) a.xcyl(X0 + W * (0.05 + 0.3 * j), X0 + W * (0.05 + 0.3 * j) + 3, y, Z0 + H * 0.58, H * 0.31, 14); a.line(X0, y, X1, y, 'EQUIP-DETAIL'); }
      a.xcyl(X0, X1, YF + D * 0.08, Z0 + H * 0.72, H * 0.12, 10);
      if (v.keeper) { a.cyl(cx, YB - D * 0.3, Z0 + H * 0.6, Z1 + 0, 6, 8); a.cyl(cx, YB - D * 0.3, Z1, Z1 + 0, 10, 8); a.tube([[cx, YB - D * 0.3, Z1 - 4], [cx + W * 0.2, YB - D * 0.3, Z1 - 20], [cx + W * 0.3, YB - D * 0.5, Z0 + H * 0.6]], [4, 4, 4], 5); a.box(X0 + W * 0.3, YB - D * 0.15, Z0 + H * 0.1, X1 - W * 0.3, YB - D * 0.02, Z0 + H * 0.5); }
      for (const s of [-1, 1]) { a.cyl(cx + s * W * 0.42, YB - D * 0.2, Z0 + H * 0.1, Z0 + H * 0.13, 6, 6); a.circ(cx + s * W * 0.42, YB - D * 0.2, 6, 'EQUIP-DETAIL'); }
      a.rect(X0, YF, X1, YB); a.rect(X0 + W * 0.05, YF + D * 0.1, X1 - W * 0.05, YB - D * 0.05, 'EQUIP-DETAIL');
      a.log('Added the base plate, two cheek plates, ' + v.rollers + ' grooved roller(s), the bow lip' + (v.keeper ? ', keeper pin with chain and bumper' : '') + ' and bolts (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic boat deck crane',
    desc: (v) => `Knuckle-boom deck crane, ${v.cap} class: a bolted base flange, a slewing column with a hydraulic housing, a lower boom, an elbow knuckle with a ram, an upper boom with a sheave and a hook on a wire, a ladder rung set and a hand control box.`,
    vs: [['0.5 t class', 48, 36, 90, 0, { cap: '0.5 t' }], ['1.5 t class', 72, 48, 132, 0, { cap: '1.5 t' }], ['4 t class', 108, 66, 190, 0, { cap: '4 t' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bx = X0 + D * 0.5, R = D * 0.2;
      a.cyl(bx, cy, Z0, Z0 + H * 0.04, D * 0.5, 18); for (let k = 0; k < 8; k++) { const t = (k / 8) * TAU; a.cyl(bx + m.cos(t) * D * 0.42, cy + m.sin(t) * D * 0.42, Z0 + H * 0.04, Z0 + H * 0.06, 8, 6); }
      a.cyl(bx, cy, Z0 + H * 0.04, Z0 + H * 0.32, D * 0.32, 16); a.box(bx - D * 0.22, cy - D * 0.4, Z0 + H * 0.12, bx + D * 0.22, cy - D * 0.2, Z0 + H * 0.28);
      for (let k = 0; k < 5; k++) a.box(bx + D * 0.3, cy - 4, Z0 + H * 0.06 + k * H * 0.05, bx + D * 0.4, cy + 4, Z0 + H * 0.08 + k * H * 0.05);
      a.box(bx - D * 0.2, cy - D * 0.2, Z0 + H * 0.32, bx + D * 0.2, cy + D * 0.2, Z0 + H * 0.4);
      const k1 = [bx + W * 0.08, cy, Z1 - H * 0.04], k0 = [bx + D * 0.0, cy, Z0 + H * 0.38];
      a.tube([k0, [bx + W * 0.04, cy, Z0 + H * 0.7], k1], [R * 0.9, R * 0.8, R * 0.7], 10); a.ell(k1[0], k1[1], k1[2], R * 0.9, R * 0.9, R * 0.9, 10, 6);
      a.tube([[bx + D * 0.3, cy, Z0 + H * 0.4], [bx + W * 0.04, cy, Z0 + H * 0.72]], [R * 0.3, R * 0.3], 8);
      const e1 = [X1 - D * 0.2, cy, Z0 + H * 0.78]; a.tube([k1, [(k1[0] + e1[0]) / 2, cy, Z1 - H * 0.02], e1], [R * 0.66, R * 0.55, R * 0.42], 10);
      a.tube([[k1[0] + 8, cy, k1[2] - 10], [(k1[0] + e1[0]) / 2, cy, Z1 - H * 0.12]], [R * 0.25, R * 0.25], 6);
      a.xcyl(e1[0] - R * 0.5, e1[0] + R * 0.5, cy, e1[2], R * 0.5, 10); a.tube([[e1[0], cy, e1[2] - R * 0.5], [e1[0], cy, Z0 + H * 0.4]], [3, 3], 4); a.ell(e1[0], cy, Z0 + H * 0.38, R * 0.35, R * 0.35, R * 0.5, 8, 5);
      a.circ(bx, cy, D * 0.5, 'EQUIP'); a.circ(bx, cy, D * 0.32, 'EQUIP-DETAIL'); a.line(bx, cy, X1 - D * 0.2, cy, 'EQUIP-DETAIL'); a.rect(bx - D * 0.22, cy - D * 0.4, bx + D * 0.22, cy - D * 0.2, 'EQUIP-DETAIL');
      a.log('Added the flange, slewing column with hydraulic housing, lower boom, knuckle with ram, upper boom, sheave, hook and the control box (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic radar arch',
    desc: (v) => `Boat radar arch, ${v.wd} in wide: two tubular legs on base plates, a curved cross tube, a platform on top carrying a radar dome and a small antenna, two spotlights and a rod-holder strip, with a back brace between the legs.`,
    vs: [['60 in wide', 60, 36, 72, 0, { wd: 60 }], ['84 in wide', 84, 42, 90, 0, { wd: 84 }], ['108 in wide, with rod holders', 108, 48, 108, 0, { wd: 108, rods: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, lx = [X0 + 40, X1 - 40], tz = Z1 - H * 0.2;
      for (const x of lx) { a.box(x - 60, cy - 60, Z0, x + 60, cy + 60, Z0 + 14); a.tube([[x, cy, Z0 + 14], [x, cy, Z0 + H * 0.5], [x * 0.9 + cx * 0.1, cy, tz]], [30, 28, 26], 10); a.circ(x, cy, 30, 'EQUIP'); }
      a.tube([[lx[0] * 0.9 + cx * 0.1, cy, tz], [cx, cy, tz + 30], [lx[1] * 0.9 + cx * 0.1, cy, tz]], [26, 26, 26], 10); a.tube([[lx[0], cy - 80, Z0 + H * 0.3], [lx[1], cy - 80, Z0 + H * 0.3]], [14, 14], 8);
      for (const x of lx) a.tube([[x, cy, Z0 + H * 0.3], [x, cy - 80, Z0 + H * 0.3]], [14, 14], 6);
      a.box(cx - W * 0.28, cy - D * 0.3, tz + 20, cx + W * 0.28, cy + D * 0.3, tz + 40);
      a.ell(cx, cy, tz + 40 + H * 0.12, D * 0.3, D * 0.3, H * 0.13, 14, 8); a.cyl(cx, cy, tz + 40, tz + 40 + H * 0.05, D * 0.3, 14);
      a.tube([[cx + W * 0.28, cy, tz + 40], [cx + W * 0.28, cy, Z1 - 20]], [8, 4], 6);
      for (const s of [-1, 1]) { a.ell(cx + s * W * 0.2, cy - D * 0.35, tz + 80, 36, 40, 36, 8, 5); a.cyl(cx + s * W * 0.2, cy - D * 0.3, tz + 40, tz + 60, 20, 8); }
      if (v.rods) for (let k = 0; k < 5; k++) a.cyl(cx - W * 0.3 + k * W * 0.15, cy + 10, Z0 + H * 0.2, Z0 + H * 0.34, 22, 8);
      a.circ(cx, cy, D * 0.3, 'EQUIP-DETAIL'); a.rect(cx - W * 0.28, cy - D * 0.3, cx + W * 0.28, cy + D * 0.3, 'EQUIP-DETAIL'); a.line(lx[0], cy - 80, lx[1], cy - 80, 'EQUIP-DETAIL');
      a.log('Added the two tubular legs on base plates, curved cross tube, back brace, top platform, radar dome, antenna, spotlights' + (v.rods ? ' and rod holders' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic boat bimini top',
    desc: (v) => `Bimini top with ${v.bows} bows, ${v.wd} in wide: ${v.bows} curved tube bows on deck hinge feet, a lengthwise rail on each side, a fabric canopy stretched over the bows with a drop at the rear, two aft support poles and ${v.straps} tie-down straps to the deck.`,
    vs: [['2 bows, 60 in', 60, 54, 54, 0, { bows: 2, wd: 60, straps: 2 }], ['3 bows, 84 in', 84, 78, 58, 0, { bows: 3, wd: 84, straps: 4 }], ['4 bows, 108 in', 108, 102, 62, 0, { bows: 4, wd: 108, straps: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, ys = Array.from({ length: v.bows }, (_, i) => YF + D * 0.08 + (i * D * 0.76) / (v.bows - 1));
      for (const y of ys) { for (const s of [-1, 1]) a.box(cx + s * W * 0.46 - 20, y - 20, Z0, cx + s * W * 0.46 + 20, y + 20, Z0 + 10); a.tube([[cx - W * 0.46, y, Z0 + 10], [cx - W * 0.44, y, Z0 + H * 0.5], [cx - W * 0.3, y, Z1 - H * 0.12], [cx, y, Z1 - 30], [cx + W * 0.3, y, Z1 - H * 0.12], [cx + W * 0.44, y, Z0 + H * 0.5], [cx + W * 0.46, y, Z0 + 10]], [10, 10, 10, 10, 10, 10, 10], 6); }
      for (const s of [-1, 1]) a.tube([[cx + s * W * 0.44, ys[0], Z0 + H * 0.55], [cx + s * W * 0.44, ys[ys.length - 1], Z0 + H * 0.55]], [8, 8], 5);
      sup(a, [...ys, YF + D * 0.88].map((y, i) => ({ y, x: cx, rx: W * 0.46 * (i === ys.length ? 0.98 : 1), z0: Z0 + H * 0.52, z1: Z1 - 20 - (i === ys.length ? H * 0.2 : 0) })), { seg: 14, n: 2.2 });
      for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.44, YF + D * 0.88, Z0 + H * 0.6], [cx + s * W * 0.46, YB - 20, Z0 + 10]], [8, 8], 5); a.box(cx + s * W * 0.46 - 20, YB - 40, Z0, cx + s * W * 0.46 + 20, YB - 8, Z0 + 10); }
      for (let k = 0; k < v.straps; k++) { const s = k % 2 ? 1 : -1; const y = ys[m.min(ys.length - 1, k >> 1)]; a.box(cx + s * W * 0.46 - 3, y - 20, Z0 + 10, cx + s * W * 0.46 + 3, y + 20, Z0 + H * 0.5); }
      a.rect(cx - W * 0.46, YF + D * 0.08, cx + W * 0.46, YF + D * 0.88, 'EQUIP'); ys.forEach((y) => a.line(cx - W * 0.46, y, cx + W * 0.46, y, 'EQUIP-DETAIL'));
      a.log('Added ' + v.bows + ' curved bows on hinge feet, side rails, the stretched canopy, aft support poles and tie-down straps (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic folding swim ladder',
    desc: (v) => `Folding boarding ladder with ${v.steps} steps: a mounting plate with two hinge brackets and bolts, two curved side rails, ${v.steps} flat treads with a non-slip ribbed face, a lifting handle at the top and rubber end caps on the lowest rails.`,
    vs: [['3 steps', 14, 5, 34, 0, { steps: 3 }], ['4 steps', 16, 5, 44, 0, { steps: 4 }], ['5 steps', 18, 6, 56, 0, { steps: 5 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, rx = [X0 + W * 0.12, X1 - W * 0.12];
      a.box(X0, YB - D * 0.3, Z0 + H * 0.78, X1, YB, Z1);
      for (const x of rx) { a.tube([[x, YB - D * 0.2, Z1 - H * 0.04], [x, YB - D * 0.45, Z0 + H * 0.6], [x, YF + D * 0.5, Z0 + H * 0.3], [x, YF + D * 0.2, Z0 + 10]], [5, 5, 5, 5], 6); a.cyl(x, YF + D * 0.2, Z0, Z0 + 12, 7, 6); a.circ(x, YF + D * 0.2, 7, 'EQUIP-DETAIL'); a.box(x - 8, YB - D * 0.3, Z0 + H * 0.8, x + 8, YB - D * 0.1, Z1 - H * 0.02); }
      for (let k = 0; k < v.steps; k++) { const f = (k + 0.5) / v.steps, z = Z0 + H * 0.12 + f * H * 0.55, y = lerp(YF + D * 0.28, YB - D * 0.45, f * f * 0.5 + f * 0.5); a.box(rx[0], y - D * 0.14, z, rx[1], y + D * 0.14, z + 3); for (let j = 0; j < 4; j++) a.line(rx[0], y - D * 0.1 + j * D * 0.07, rx[1], y - D * 0.1 + j * D * 0.07, 'EQUIP-DETAIL'); }
      a.tube([[rx[0], YB - D * 0.3, Z1], [rx[0], YB - D * 0.3, Z1 + 0], [rx[1], YB - D * 0.3, Z1]], [6, 6, 6], 6);
      a.rect(rx[0], YF + D * 0.2, rx[1], YB - D * 0.1, 'EQUIP'); a.rect(X0, YB - D * 0.3, X1, YB, 'EQUIP-DETAIL');
      a.log('Added the mounting plate with hinge brackets, two curved rails, ' + v.steps + ' ribbed treads, the handle and the rubber end caps (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic folding ship hatch cover',
    desc: (v) => `Cargo hatch cover with ${v.panels} folding panels, ${v.len} in long: a raised coaming frame with a compression bar, ${v.panels} stiffened panels with edge hinges between them, rolling wheels on side tracks, cleats and a pair of lifting lugs, with a hydraulic ram at one end.`,
    vs: [['2 panels, 160 in', 120, 160, 36, 0, { panels: 2, len: 160 }], ['3 panels, 240 in', 144, 240, 40, 0, { panels: 3, len: 240 }], ['4 panels, 340 in', 168, 340, 44, 0, { panels: 4, len: 340 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cz = Z0 + H * 0.45;
      a.box(X0, YF, Z0, X1, YB, cz); a.box(X0 + W * 0.04, YF + D * 0.03, cz, X1 - W * 0.04, YB - D * 0.03, cz + 16);
      a.box(X0, YF, Z0, X0 + W * 0.04, YB, Z0 + H * 0.1);
      const pw = (D * 0.94) / v.panels;
      for (let k = 0; k < v.panels; k++) { const y0 = YF + D * 0.03 + k * pw; a.box(X0 + W * 0.06, y0 + 8, cz + 16, X1 - W * 0.06, y0 + pw - 8, Z1 - H * 0.15); for (let j = 1; j < 4; j++) a.box(X0 + W * 0.06 + (W * 0.88 * j) / 4 - 4, y0 + 12, Z1 - H * 0.15, X0 + W * 0.06 + (W * 0.88 * j) / 4 + 4, y0 + pw - 12, Z1 - H * 0.08); a.rect(X0 + W * 0.06, y0 + 8, X1 - W * 0.06, y0 + pw - 8, 'EQUIP-DETAIL'); if (k > 0) for (const s of [-1, 1]) a.xcyl(cx + s * W * 0.3 - 20, cx + s * W * 0.3 + 20, y0, Z1 - H * 0.14, 8, 8); for (const s of [-1, 1]) { a.cyl(cx + s * W * 0.41, y0 + pw / 2, cz + 16, Z1 - H * 0.15 + 12, 6, 6); } }
      for (const s of [-1, 1]) { a.box(cx + s * W * 0.47 - 7, YF + D * 0.04, cz - 4, cx + s * W * 0.47 + 7, YB - D * 0.04, cz + 6); for (let k = 0; k <= v.panels; k++) a.ycyl(YF + D * 0.03 + k * pw - 12, YF + D * 0.03 + k * pw + 12, cx + s * W * 0.47, cz + 22, 14, 8); }
      for (const s of [-1, 1]) { a.box(cx + s * W * 0.2 - 12, YF + D * 0.035, Z1 - H * 0.15, cx + s * W * 0.2 + 12, YF + D * 0.035 + 14, Z1); }
      a.ycyl(YB - D * 0.3, YB - D * 0.04, X1 - W * 0.12, Z1 - H * 0.35, 12, 10);
      a.rect(X0, YF, X1, YB); a.rect(X0 + W * 0.04, YF + D * 0.03, X1 - W * 0.04, YB - D * 0.03, 'EQUIP-DETAIL');
      a.log('Added the coaming with compression bar, ' + v.panels + ' stiffened folding panels with hinges, wheels on tracks, cleats, lifting lugs and the ram (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic watertight door in bulkhead',
    desc: (v) => `${v.kindText} watertight door, ${v.dw} x ${v.dh} in clear opening, set in a steel bulkhead panel standing on foot plates: a coaming sill, a door leaf with a ${v.dogs}-dog closing set, ${v.slide ? 'a bottom track, a hand wheel and a sliding leaf' : 'two hinges, a lever handle and a rubber gasket line'}.`,
    vs: [['hinged, 26 x 66 in', 44, 10, 78, 0, { kindText: 'Hinged', dw: 26, dh: 66, dogs: 6, slide: false }], ['hinged, 30 x 72 in, 8 dogs', 50, 10, 84, 0, { kindText: 'Hinged', dw: 30, dh: 72, dogs: 8, slide: false }], ['sliding, 36 x 78 in', 60, 12, 92, 0, { kindText: 'Sliding', dw: 36, dh: 78, dogs: 4, slide: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, dw = v.dw * I, dh = v.dh * I, sz = Z0 + 90;
      for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 40, YF, Z0, cx + s * W * 0.4 + 40, YB, Z0 + 40);
      a.box(X0, cy - 6, Z0 + 40, X1, cy + 6, Z1);
      a.box(cx - dw / 2 - 40, YF + D * 0.1, sz - 10, cx + dw / 2 + 40, YB - D * 0.1, sz + 70); a.box(cx - dw / 2 - 40, YF + D * 0.1, sz + dh + 10, cx + dw / 2 + 40, YB - D * 0.1, sz + dh + 50);
      for (const s of [-1, 1]) a.box(cx + s * (dw / 2 + 20) - 20, YF + D * 0.1, sz, cx + s * (dw / 2 + 20) + 20, YB - D * 0.1, sz + dh);
      const lx = v.slide ? cx - dw * 0.12 : cx;
      a.box(lx - dw / 2 + 12, YF + D * 0.02, sz + 70, lx + dw / 2 - 12, YF + D * 0.4, sz + dh - 10);
      for (let k = 0; k < v.dogs; k++) { const side = k % 2 ? 1 : -1, row = k >> 1, rows = m.ceil(v.dogs / 2), z = sz + 90 + (row * (dh - 190)) / m.max(rows - 1, 1); a.box(lx + side * (dw / 2 - 40) - 14, YF - 14 + 0, z - 14, lx + side * (dw / 2 - 40) + 14, YF + D * 0.04, z + 14); a.xcyl(lx + side * (dw / 2 - 40) - 40, lx + side * (dw / 2 - 40) + 40, YF - 6, z, 8, 6); }
      if (v.slide) { a.box(cx - dw * 0.7, YF, sz + dh + 50, cx + dw * 0.7, YF + 30, sz + dh + 90); a.box(cx - dw * 0.7, YF, sz - 40, cx + dw * 0.7, YF + 30, sz); a.ycyl(YF - 50, YF, cx + dw * 0.3, sz + dh * 0.5, 7, 8); ring3(a, cx + dw * 0.3, YF - 50, sz + dh * 0.5, 80, 8, 14, 'y'); }
      else { for (const z of [sz + 200, sz + dh - 200]) { a.cyl(lx - dw / 2 + 10, YF + D * 0.05, z - 40, z + 40, 14, 8); a.box(lx - dw / 2 - 20, YF + 2, z - 40, lx - dw / 2 + 10, YF + D * 0.1, z + 40); } a.tube([[lx + dw * 0.3, YF - 6, sz + dh * 0.45], [lx + dw * 0.3, YF - 80, sz + dh * 0.45], [lx + dw * 0.05, YF - 80, sz + dh * 0.45]], [8, 8, 8], 6); }
      a.rect(X0, cy - 6, X1, cy + 6); a.rect(cx - dw / 2, YF + D * 0.1, cx + dw / 2, YB - D * 0.1, 'EQUIP-DETAIL');
      a.log('Added the bulkhead panel on foot plates, sill and head coaming, the door leaf with ' + v.dogs + ' dogs' + (v.slide ? ', tracks and hand wheel' : ', hinges and lever handle') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic ship porthole',
    desc: (v) => `${v.kindText} porthole, ${v.dia} in clear glass, in a ${v.pl} in square mounting plate on foot plates: a thick ring frame, a glass disc in a retaining ring, a rain-visor eyebrow${v.open ? ', a hinged ring with ' + v.dogs + ' butterfly dogs' : ''}${v.dead ? ' and a hinged deadlight cover on the inside' : ''}.`,
    vs: [['fixed, 8 in', 14, 6, 14, 0, { kindText: 'Fixed', dia: 8, pl: 14, open: false, dogs: 0, dead: false }], ['opening, 12 in, 3 dogs', 20, 7, 20, 0, { kindText: 'Opening', dia: 12, pl: 20, open: true, dogs: 3, dead: false }], ['opening, 16 in, deadlight', 24, 8, 24, 0, { kindText: 'Opening', dia: 16, pl: 24, open: true, dogs: 4, dead: true }], ['opening, 20 in, 6 dogs', 28, 8, 28, 0, { kindText: 'Opening', dia: 20, pl: 28, open: true, dogs: 6, dead: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.dia * I / 2, cz = Z0 + H * 0.5;
      a.box(X0, cy - D * 0.2, Z0 + H * 0.08, X1, cy + D * 0.2, Z1); for (const s of [-1, 1]) a.box(cx + s * W * 0.38 - 30, cy - D * 0.45, Z0, cx + s * W * 0.38 + 30, cy + D * 0.45, Z0 + H * 0.08);
      a.ycyl(cy - D * 0.2 - D * 0.2, cy - D * 0.2, cx, cz, R * 1.22, 24); a.ycyl(cy - D * 0.2 - D * 0.28, cy - D * 0.2 - D * 0.2, cx, cz, R * 1.1, 24);
      a.ycyl(cy - D * 0.2 - D * 0.22, cy - D * 0.2 - D * 0.14, cx, cz, R * 0.88, 20); a.circ(cx, cy, R, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 1.22, 'EQUIP-DETAIL');
      a.tube([[cx - R * 1.1, cy - D * 0.3, cz + R * 0.5], [cx - R * 0.7, cy - D * 0.42, cz + R * 1.15], [cx + R * 0.7, cy - D * 0.42, cz + R * 1.15], [cx + R * 1.1, cy - D * 0.3, cz + R * 0.5]], [6, 6, 6, 6], 5);
      if (v.open) { for (let k = 0; k < v.dogs; k++) { const t = (k / v.dogs) * TAU + 0.5, x = cx + m.cos(t) * R * 1.15, z = cz + m.sin(t) * R * 1.15; a.ycyl(cy - D * 0.2 - D * 0.3, cy - D * 0.2 - D * 0.2, x, z, 6, 6); a.box(x - R * 0.12, cy - D * 0.2 - D * 0.36, z - R * 0.12, x + R * 0.12, cy - D * 0.2 - D * 0.3, z + R * 0.12); } a.box(cx - R * 1.25, cy - D * 0.2 - 10, cz - R * 1.3, cx - R * 1.1, cy - D * 0.2, cz - R * 0.5); }
      if (v.dead) { a.ycyl(cy + D * 0.2, cy + D * 0.28, cx, cz, R * 1.15, 24); a.box(cx + R * 1.1, cy + D * 0.2, cz - R * 0.3, cx + R * 1.3, cy + D * 0.3, cz + R * 0.3); a.ycyl(cy + D * 0.28, cy + D * 0.36, cx - R * 0.2, cz, R * 0.12, 8); }
      a.rect(X0, cy - D * 0.2, X1, cy + D * 0.2);
      a.log('Added the plate on foot plates, ring frame, glass disc, visor' + (v.open ? ', hinged ring with butterfly dogs' : '') + (v.dead ? ' and the deadlight cover' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic ship funnel stack',
    desc: (v) => `Ship funnel, ${v.hh} in tall: an oval stack on a base casing with a bolted flange, a top band with a rain cap, ${v.pipes} exhaust pipes up the back, a mast-mounted whistle pair, a vertical ladder${v.grid ? ' and a spark-arrestor grating on the top' : ''}.`,
    vs: [['small, 36 in', 36, 24, 36, 0, { hh: 36, pipes: 1, grid: false }], ['medium, 72 in', 60, 40, 72, 0, { hh: 72, pipes: 2, grid: false }], ['large, 120 in with grating', 96, 60, 120, 0, { hh: 120, pipes: 2, grid: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, rx = W * 0.4, ry = D * 0.4, zc = Z0 + H * 0.1;
      a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.04); a.box(X0 + W * 0.06, YF + D * 0.06, Z0 + H * 0.04, X1 - W * 0.06, YB - D * 0.06, zc);
      const st = []; for (let i = 0; i <= 8; i++) { const f = i / 8; st.push({ y: cy + (f - 0.5) * 0, x: cx, rx: rx * (1 - 0.14 * f), z0: 0, z1: 0 }); }
      const rings = [[0, zc, 1], [1, Z1 - H * 0.12, 0.84]]; const seg = 20; const R = (k) => rings[k];
      const poly = (r, z) => Array.from({ length: seg }, (_, k) => { const t = (k / seg) * TAU; return [cx + m.cos(t) * rx * r, cy + m.sin(t) * ry * r, z]; });
      const r0 = poly(1, zc), r1 = poly(0.84, Z1 - H * 0.12), r2 = poly(0.9, Z1 - H * 0.12 + 1), r3 = poly(0.9, Z1 - H * 0.02);
      for (const [A, B2] of [[r0, r1], [r2, r3]]) for (let k = 0; k < seg; k++) { const k2 = (k + 1) % seg; a.t.push([A[k], B2[k], B2[k2]], [A[k], B2[k2], A[k2]]); }
      for (let k = 0; k < seg; k++) { const k2 = (k + 1) % seg; a.t.push([[cx, cy, Z1 - H * 0.02], r3[k], r3[k2]]); a.t.push([[cx, cy, zc], r0[k2], r0[k]]); }
      a.tube([[cx, cy, Z1 - H * 0.14], [cx, cy, Z1 - H * 0.1]], [rx * 0.86, rx * 0.86], 20);
      a.tube([[cx, cy, Z1 - H * 0.02], [cx, cy, Z1]], [rx * 0.78, rx * 0.78], 20);
      for (let k = 0; k < v.pipes; k++) { const x = cx + (k - (v.pipes - 1) / 2) * rx * 0.6; a.tube([[x, cy + ry * 0.92, zc + H * 0.02], [x, cy + ry * 0.92, Z1 - H * 0.2]], [rx * 0.1, rx * 0.08], 8); a.cyl(x, cy + ry * 0.92, Z1 - H * 0.2, Z1 - H * 0.16, rx * 0.12, 8); }
      for (const s of [-1, 1]) { a.tube([[cx + s * rx * 0.35, cy - ry * 0.9, zc + H * 0.5], [cx + s * rx * 0.35, cy - ry * 0.9, zc + H * 0.62]], [rx * 0.07, rx * 0.07], 6); a.cone(cx + s * rx * 0.35, cy - ry * 1.0, zc + H * 0.62, zc + H * 0.7, rx * 0.08, rx * 0.2, 8); }
      for (const s of [-1, 1]) a.tube([[cx + s * rx * 0.2, cy - ry * 0.98, zc + 10], [cx + s * rx * 0.2, cy - ry * 0.98, Z1 - H * 0.2]], [4, 4], 4);
      for (let k = 0; k < 8; k++) a.box(cx - rx * 0.2, cy - ry * 1.0 - 3, zc + 20 + k * (H * 0.7) / 8, cx + rx * 0.2, cy - ry * 0.98, zc + 24 + k * (H * 0.7) / 8);
      if (v.grid) for (let k = -2; k <= 2; k++) { a.box(cx + k * rx * 0.3 - 3, cy - ry * 0.7, Z1 - H * 0.03, cx + k * rx * 0.3 + 3, cy + ry * 0.7, Z1 + 0); }
      a.ellp(cx, cy, rx, ry); a.ellp(cx, cy, rx * 0.84, ry * 0.84, 'EQUIP-DETAIL'); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
      a.log('Added the base casing and flange, oval stack with band and rain cap, exhaust pipes, whistles, ladder' + (v.grid ? ' and the grating' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/deck', title: 'Generic life raft canister cradle',
    desc: (v) => `Life raft canister for ${v.ppl} people, ${v.len} in long, on a deck cradle: a ribbed glass-fibre canister with two end caps, two stainless straps with a hydrostatic release unit, a painter line coil, a lifting handle and two saddle supports on a base frame with bolts.`,
    vs: [['4 person, 28 in', 24, 16, 14, 0, { ppl: 4, len: 28 }], ['6 person, 32 in', 28, 18, 16, 0, { ppl: 6, len: 32 }], ['12 person, 40 in', 34, 22, 20, 0, { ppl: 12, len: 40 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = D * 0.38, cz = Z0 + H * 0.16 + R;
      a.box(X0, YF + D * 0.1, Z0, X1, YF + D * 0.18, Z0 + H * 0.1); a.box(X0, YB - D * 0.18, Z0, X1, YB - D * 0.1, Z0 + H * 0.1); a.box(X0 + W * 0.2, YF + D * 0.1, Z0, X0 + W * 0.28, YB - D * 0.1, Z0 + H * 0.08);
      for (const x of [X0 + W * 0.2, X1 - W * 0.2]) { a.box(x - W * 0.05, cy - R * 0.6, Z0 + H * 0.1, x + W * 0.05, cy + R * 0.6, cz - R * 0.5); a.box(x - W * 0.05, cy - R, cz - R * 0.8, x + W * 0.05, cy + R, cz - R * 0.1); }
      a.xcyl(X0 + W * 0.04, X1 - W * 0.04, cy, cz, R, 18);
      for (const x of [X0 + W * 0.04, X1 - W * 0.04]) a.ell(x, cy, cz, W * 0.03, R, R, 8, 12);
      for (let k = 1; k < 6; k++) a.xcyl(X0 + W * (0.04 + k * 0.15), X0 + W * (0.04 + k * 0.15) + 5, cy, cz, R * 1.04, 18);
      for (const x of [X0 + W * 0.32, X1 - W * 0.32]) ring3(a, x, cy, cz, R * 1.06, 4, 18, 'x');
      a.box(X0 + W * 0.45, cy + R * 0.9, cz + R * 0.5, X1 - W * 0.45, cy + R * 1.2, cz + R * 1.0); a.cyl(cx, cy + R * 1.05, cz + R, cz + R * 1.4, R * 0.18, 8);
      a.tube([[cx - W * 0.08, cy, cz + R * 1.04], [cx - W * 0.08, cy, cz + R * 1.3], [cx + W * 0.08, cy, cz + R * 1.3], [cx + W * 0.08, cy, cz + R * 1.04]], [6, 6, 6, 6], 5);
      ring3(a, X0 + W * 0.12, cy - R * 1.0, cz, R * 0.4, 4, 12, 'x');
      a.rect(X0 + W * 0.04, cy - R, X1 - W * 0.04, cy + R, 'EQUIP'); a.rect(X0, YF + D * 0.1, X1, YB - D * 0.1, 'EQUIP-DETAIL');
      for (const x of [X0 + W * 0.32, X1 - W * 0.32]) a.line(x, cy - R, x, cy + R, 'EQUIP-DETAIL');
      a.log('Added the base frame with saddles, ribbed canister with end caps, two straps, hydrostatic release, painter line coil and lifting handle (plan and 3D).');
    } }),

  // ===================================================== harbour =====================================================
  fam({ cat: 'marine/harbour', title: 'Generic pile mooring dolphin',
    desc: (v) => `${v.kindText} mooring dolphin, ${v.pl} piles: ${v.pl} steel tube piles driven to the seabed with collar bands, ${v.pl > 1 ? 'a capping platform with a handrail, ' : 'a pile head cap, '}a bollard on top, a rung ladder up one pile and rubber fender${v.pl > 1 ? 's' : ''} on the berthing side.`,
    vs: [['single pile', 44, 44, 260, 0, { kindText: 'Single-pile', pl: 1 }], ['three-pile cluster', 130, 110, 260, 0, { kindText: 'Three-pile', pl: 3 }], ['five-pile with walkway', 200, 170, 280, 0, { kindText: 'Five-pile', pl: 5 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pr = v.pl === 1 ? W * 0.3 : W * 0.085, tz = Z1 - H * 0.12;
      const pos = v.pl === 1 ? [[cx, cy]] : v.pl === 3 ? [[cx - W * 0.28, cy + D * 0.2], [cx + W * 0.28, cy + D * 0.2], [cx, cy - D * 0.26]] : [[cx - W * 0.34, cy + D * 0.28], [cx + W * 0.34, cy + D * 0.28], [cx - W * 0.34, cy - D * 0.28], [cx + W * 0.34, cy - D * 0.28], [cx, cy]];
      pos.forEach(([x, y]) => { a.tube([[x, y, Z0], [x, y, tz]], [pr, pr], 14); for (const z of [Z0 + H * 0.25, Z0 + H * 0.5]) a.cyl(x, y, z, z + 6, pr * 1.12, 14); a.circ(x, y, pr, 'EQUIP'); });
      if (v.pl > 1) { const px0 = X0 + W * 0.1, px1 = X1 - W * 0.1, py0 = YF + D * 0.1, py1 = YB - D * 0.1; a.box(px0, py0, tz, px1, py1, tz + 16); a.rect(px0, py0, px1, py1, 'EQUIP-DETAIL'); for (let k = 0; k < 6; k++) a.line(px0, py0 + (k * (py1 - py0)) / 5, px1, py0 + (k * (py1 - py0)) / 5, 'EQUIP-DETAIL'); rail(a, px0, py0, px1, py0, tz + 16, tz + 16 + H * 0.12, 6, 4, 2); rail(a, px0, py1, px1, py1, tz + 16, tz + 16 + H * 0.12, 6, 4, 2); }
      else a.cyl(cx, cy, tz, tz + 14, pr * 1.2, 14);
      const bx = v.pl === 1 ? cx : cx, by = v.pl === 1 ? cy : cy, bz = tz + (v.pl > 1 ? 16 : 14); a.cyl(bx, by, bz, bz + H * 0.07, 10, 10); a.cyl(bx, by, bz + H * 0.07, bz + H * 0.09, 15, 10); a.circ(bx, by, 15, 'EQUIP-DETAIL');
      const [lx, ly] = pos[0]; for (const s of [-1, 1]) a.tube([[lx + s * pr * 0.35, ly - pr * 1.05, Z0 + H * 0.25], [lx + s * pr * 0.35, ly - pr * 1.05, tz + 20]], [2.5, 2.5], 4); for (let k = 0; k < 8; k++) a.xcyl(lx - pr * 0.35, lx + pr * 0.35, ly - pr * 1.05, Z0 + H * 0.28 + k * (tz - Z0 - H * 0.25) / 8, 2, 4);
      pos.filter((p, i) => v.pl === 1 || p[1] <= cy).forEach(([x, y]) => { a.ycyl(y - pr * 1.9, y - pr * 1.0, x, Z0 + H * 0.4, pr * 0.8, 10); a.ycyl(y - pr * 1.9, y - pr * 1.0, x, Z0 + H * 0.62, pr * 0.8, 10); });
      a.log('Added ' + v.pl + ' tube pile(s) with collar bands, ' + (v.pl > 1 ? 'the capping platform with handrail, ' : 'the head cap, ') + 'bollard, ladder and rubber fenders (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic quick-release mooring hook',
    desc: (v) => `Quick-release mooring hook unit with ${v.hooks} hook${v.hooks > 1 ? 's' : ''}: a base frame with bolts, ${v.hooks} pivoting hook${v.hooks > 1 ? 's' : ''} on a shaft with a tongue and a release lever, a capstan-style rope guide post and a pull handle on the release linkage.`,
    vs: [['single hook', 26, 20, 34, 0, { hooks: 1 }], ['double hook', 46, 22, 36, 0, { hooks: 2 }], ['triple hook', 66, 24, 38, 0, { hooks: 3 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pw = W / v.hooks;
      a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.08); for (let k = 0; k <= v.hooks; k++) for (const y of [YF + D * 0.1, YB - D * 0.1]) { const x = X0 + (W * k) / v.hooks; a.cyl(m.min(m.max(x, X0 + 14), X1 - 14), y, Z0 + H * 0.08, Z0 + H * 0.12, 7, 6); }
      for (let k = 0; k < v.hooks; k++) {
        const x = X0 + pw * (k + 0.5), bz = Z0 + H * 0.3;
        for (const s of [-1, 1]) a.box(x + s * pw * 0.22 - 5, cy - D * 0.3, Z0 + H * 0.08, x + s * pw * 0.22 + 5, cy + D * 0.3, bz + H * 0.2);
        a.xcyl(x - pw * 0.25, x + pw * 0.25, cy, bz, H * 0.05, 10);
        prismX(a, [[cy - D * 0.3, bz - H * 0.06], [cy + D * 0.3, bz - H * 0.06], [cy + D * 0.35, bz + H * 0.22], [cy + D * 0.1, bz + H * 0.36], [cy - D * 0.1, bz + H * 0.2]], x - pw * 0.08, x + pw * 0.08);
        a.tube([[x, cy + D * 0.1, bz + H * 0.36], [x, cy - D * 0.3, bz + H * 0.45], [x, cy - D * 0.38, bz + H * 0.3]], [H * 0.03, H * 0.03, H * 0.03], 6);
        a.tube([[x, cy - D * 0.3, bz - H * 0.04], [x, cy - D * 0.42, Z0 + H * 0.2]], [4, 4], 5); a.ell(x, cy - D * 0.43, Z0 + H * 0.2, 8, 8, 8, 6, 4);
        a.cyl(x, YF + D * 0.04, Z0 + H * 0.08, Z1, D * 0.06, 10); a.cyl(x, YF + D * 0.04, Z1 - H * 0.06, Z1, D * 0.1, 10);
        a.rect(x - pw * 0.25, cy - D * 0.3, x + pw * 0.25, cy + D * 0.3, 'EQUIP-DETAIL'); a.circ(x, YF + D * 0.04, D * 0.1, 'EQUIP-DETAIL');
      }
      a.rect(X0, YF, X1, YB);
      a.log('Added the base frame with bolts, ' + v.hooks + ' pivoting hook(s) with tongue and release lever, rope guide post and the pull handle (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic floating breakwater module',
    desc: (v) => `Floating breakwater module, ${v.ft} ft long: a buoyant box deck with a sloped top and tyre-strip bumpers, ${v.skirts} vertical wave-screen plates hanging below the float, a toe rail on both edges, two chain eyes at each end and a connector hinge between modules.`,
    vs: [['20 ft', 120, 240, 80, 0, { ft: 20, skirts: 3 }], ['30 ft', 150, 360, 96, 0, { ft: 30, skirts: 4 }], ['40 ft, deep screen', 180, 480, 124, 0, { ft: 40, skirts: 5 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, fz = Z1 - H * 0.28, sd = Z0;
      prismX(a, [[YF + 12, fz], [YF + 22, Z1 - H * 0.04], [YB - 22, Z1 - H * 0.04], [YB - 12, fz]], X0 + W * 0.06, X1 - W * 0.06);
      prismX(a, [[YF + 12, fz], [YB - 12, fz], [YB - 40, fz - H * 0.18], [YF + 40, fz - H * 0.18]], X0 + W * 0.06, X1 - W * 0.06);
      for (let k = 0; k < v.skirts; k++) { const y = YF + D * (0.12 + (0.76 * k) / (v.skirts - 1)); a.box(X0 + W * 0.1, y - 3, sd, X1 - W * 0.1, y + 3, fz - H * 0.18); a.line(X0 + W * 0.1, y, X1 - W * 0.1, y, 'EQUIP-DETAIL'); }
      a.box(X0 + W * 0.1, YF + D * 0.1, sd, X0 + W * 0.14, YB - D * 0.1, sd + H * 0.1); a.box(X1 - W * 0.14, YF + D * 0.1, sd, X1 - W * 0.1, YB - D * 0.1, sd + H * 0.1);
      for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.46, YF + 24, Z1 - H * 0.04], [cx + s * W * 0.46, YB - 24, Z1 - H * 0.04]], [8, 8], 5); for (let k = 0; k < 6; k++) a.cyl(cx + s * W * 0.46, YF + 24 + k * (D - 48) / 5, Z1 - H * 0.04, Z1 - H * 0.04 + 36, 5, 5); a.tube([[cx + s * W * 0.46, YF + 24, Z1 - H * 0.04 + 36], [cx + s * W * 0.46, YB - 24, Z1 - H * 0.04 + 36]], [4, 4], 4); }
      for (let k = 0; k < 7; k++) ring3(a, cx - W * 0.3 + k * W * 0.1, YF + D * 0.5, Z1 - H * 0.04 + 6, 12, 5, 8, 'z');
      for (const y of [YF, YB]) for (const s of [-1, 1]) { ring3(a, cx + s * W * 0.2, y + (y === YF ? 12 : -12), fz + 20, 12, 4, 8, 'y'); }
      for (const y of [YF + 10, YB - 10]) for (const s of [-1, 1]) a.box(cx + s * W * 0.32 - 14, y - 6, fz + 6, cx + s * W * 0.32 + 14, y + 6, fz + 30);
      a.rect(X0 + W * 0.06, YF + 12, X1 - W * 0.06, YB - 12);
      a.log('Added the buoyant sloped float, ' + v.skirts + ' hanging wave screens, toe rails, tyre-strip bumpers, chain eyes and end connectors (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic marina gangway',
    desc: (v) => `Aluminium marina gangway, ${v.ft} ft long: a sloping truss ramp with an anti-slip deck, two side trusses with cross braces and handrails, a pivot hinge at the high end on two bearing blocks, wheels on a roller beam at the low end and kick plates along the deck.`,
    vs: [['24 ft', 48, 288, 54, 0, { ft: 24 }], ['36 ft', 54, 432, 74, 0, { ft: 36 }], ['48 ft', 60, 576, 96, 0, { ft: 48 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, zl = Z0 + 40, zh = Z1 - H * 0.42, Zy = (y) => lerp(zl, zh, (y - YF) / D);
      prismX(a, [[YF + 30, zl], [YB - 20, zh], [YB - 20, zh + 14], [YF + 30, zl + 14]], X0 + W * 0.08, X1 - W * 0.08);
      for (let k = 0; k < 14; k++) { const y = YF + 40 + (k * (D - 70)) / 13; a.line(X0 + W * 0.1, y, X1 - W * 0.1, y, 'EQUIP-DETAIL'); }
      for (const s of [-1, 1]) { const x = cx + s * (W * 0.42);
        a.tube([[x, YF + 30, zl], [x, YB - 20, zh]], [18, 18], 6); const nb = m.round(v.ft / 4);
        for (let k = 0; k <= nb; k++) { const y = YF + 30 + ((D - 50) * k) / nb; a.tube([[x, y, Zy(y) + 8], [x, y, Zy(y) + H * 0.46]], [8, 8], 5); if (k < nb) { const y2 = YF + 30 + ((D - 50) * (k + 1)) / nb; a.tube([[x, y, Zy(y) + 8], [x, y2, Zy(y2) + H * 0.46]], [6, 6], 4); } }
        a.tube([[x, YF + 30, zl + H * 0.46], [x, YB - 20, zh + H * 0.46]], [11, 11], 6); a.tube([[x, YF + 30, zl + H * 0.24], [x, YB - 20, zh + H * 0.24]], [7, 7], 5); a.box(x - 4 + 0, YF + 30, zl + 14, x + 4, YB - 20, zh + 14 + 10); }
      a.box(X0, YB - 80, zh - 20, X1, YB - 20, zh + 6); for (const s of [-1, 1]) a.box(cx + s * W * 0.3 - 20, YB - 60, zh - 60, cx + s * W * 0.3 + 20, YB - 20, zh - 20);
      a.xcyl(X0 + W * 0.05, X1 - W * 0.05, YB - 50, zh - 20, 12, 10);
      a.xcyl(X0 + 5, X1 - 5, YF + 30, zl - 10, 14, 10); for (const s of [-1, 1]) { a.xcyl(cx + s * W * 0.32 - 12, cx + s * W * 0.32 + 12, YF + 30, Z0 + 28, 28, 14); a.circ(cx + s * W * 0.32, YF + 30, 28, 'EQUIP-DETAIL'); }
      a.rect(X0 + W * 0.08, YF + 30, X1 - W * 0.08, YB - 20); for (const s of [-1, 1]) a.line(cx + s * W * 0.42, YF + 30, cx + s * W * 0.42, YB - 20, 'EQUIP-DETAIL');
      a.log('Added the sloping deck, side trusses with handrails and braces, pivot hinge on bearing blocks, roller wheels and kick plates (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic ship-to-shore container crane',
    desc: (v) => `Quay container crane, ${v.out} ft outreach: four portal legs with sill beams on rail trucks, a sea-side and land-side portal beam, a lattice boom over the water, a forestay from an A-frame, a trolley with an operator cab and container spreader, a machinery room and X-bracing.`,
    vs: [['feeder, 100 ft outreach', 540, 1700, 1250, 0, { out: 100 }], ['panamax, 150 ft outreach', 660, 2300, 1620, 0, { out: 150 }]],
    build: (a0, v) => { const a = sc(a0, 15);
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, ly = YB - D * 0.1, wy = YF + D * 0.62, lx = W * 0.44, tz = Z0 + H * 0.58, tq = Z1 - H * 0.2;
      for (const s of [-1, 1]) { a.box(cx + s * lx - 24, ly - 20, Z0 + 20, cx + s * lx + 24, wy + 20, Z0 + 50); a.box(cx + s * lx - 30, wy - 20, Z0, cx + s * lx + 30, ly + 20, Z0 + 20); for (const y of [wy, ly]) { a.tube([[cx + s * lx, y, Z0 + 50], [cx + s * lx, y, tz]], [16, 14], 8); for (const t of [-1, 1]) a.xcyl(cx + s * lx - 24, cx + s * lx + 24, y + t * 20, Z0 + 12, 12, 8); } a.tube([[cx + s * lx, wy, tz], [cx + s * lx, ly, tz]], [14, 14], 8); a.tube([[cx + s * lx, wy, tz], [cx + s * lx * 0.8, wy, tq]], [14, 12], 8); a.tube([[cx + s * lx, ly, tz], [cx + s * lx * 0.8, ly, tq]], [14, 12], 8); xbay(a, cx + s * lx, wy, cx + s * lx, ly, Z0 + 60, tz, 7); xbay(a, cx + s * lx, wy, cx + s * lx * 0.8, ly, tz, tq, 6); }
      for (const y of [wy, ly]) { a.tube([[cx - lx, y, tz], [cx + lx, y, tz]], [18, 18], 8); a.tube([[cx - lx * 0.8, y, tq], [cx + lx * 0.8, y, tq]], [16, 16], 8); xbay(a, cx - lx, y, cx + lx, y, Z0 + 60, tz, 6); }
      for (const s of [-1, 1]) { const x = cx + s * lx * 0.34; a.tube([[x, YF + 20, tq - 40], [x, ly, tq + 10]], [14, 14], 8); a.tube([[x, YF + 20, tq - 130], [x, wy, tq - 60]], [12, 12], 8); for (let k = 0; k < 14; k++) { const y0 = YF + 40 + k * (ly - YF - 60) / 14; a.tube([[x, y0, tq - 40 - (y0 - YF) * 0.02 - 90], [x, y0, tq - 30]], [3, 3], 4); } a.tube([[x, wy, tq + 10], [x, wy, Z1 - 30], [x, YF + 20, tq - 40]], [14, 8, 8], 6); }
      a.tube([[cx - lx * 0.34, wy, Z1 - 30], [cx + lx * 0.34, wy, Z1 - 30]], [12, 12], 6); a.tube([[cx, wy, tq], [cx, wy, Z1 - 30]], [10, 10], 6);
      const ty = YF + D * 0.28; a.box(cx - lx * 0.34, ty - 60, tq - 40, cx + lx * 0.34, ty + 60, tq + 30); a.box(cx - 50, ty - 40, tq - 150, cx + 50, ty + 40, tq - 40); a.tube([[cx - lx * 0.2, ty - 40, tq - 40], [cx - lx * 0.2, ty - 40, tq - 190]], [4, 4], 4); a.tube([[cx + lx * 0.2, ty - 40, tq - 40], [cx + lx * 0.2, ty - 40, tq - 190]], [4, 4], 4);
      a.box(cx - lx * 0.32, ty - 40, tq - 270, cx + lx * 0.32, ty + 40, tq - 190); for (const s of [-1, 1]) a.box(cx + s * lx * 0.3 - 6, ty - 40, tq - 300, cx + s * lx * 0.3 + 6, ty + 40, tq - 270);
      a.box(cx - lx * 0.5, ly - 180, tq - 30, cx + lx * 0.5, ly - 20, tq + 120); a.box(cx - lx * 0.4, ly - 160, tq + 120, cx + lx * 0.4, ly - 40, tq + 150);
      a.rect(cx - lx - 30, ly - 20, cx + lx + 30, wy + 20, 'EQUIP'); for (const s of [-1, 1]) { a.line(cx + s * lx * 0.34, YF + 20, cx + s * lx * 0.34, ly, 'EQUIP-DETAIL'); a.rect(cx + s * lx - 30, ly - 20, cx + s * lx + 30, wy + 20, 'EQUIP-DETAIL'); } a.rect(cx - lx * 0.32, ty - 40, cx + lx * 0.32, ty + 40, 'EQUIP-DETAIL');
      a.log('Added the portal legs on rail trucks, sill and portal beams with X-bracing, the lattice boom with forestay, trolley with cab and spreader and the machinery house (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic marina fuel dispenser',
    desc: (v) => `${v.kindText} marina fuel dispenser: a base plate with bolts, a tall housing with a metre display, a keypad panel, ${v.hoses} nozzle holster${v.hoses > 1 ? 's' : ''} with ${v.hoses} hose loop${v.hoses > 1 ? 's' : ''}${v.roof ? ', a roof canopy on two posts' : ''}${v.reel ? ' and a hose reel drum on the side' : ''}.`,
    vs: [['single hose', 24, 18, 60, 0, { kindText: 'Single', hoses: 1, roof: false, reel: false }], ['dual hose', 34, 20, 66, 0, { kindText: 'Dual', hoses: 2, roof: false, reel: false }], ['dual hose, canopy and reel', 60, 40, 110, 0, { kindText: 'Dual', hoses: 2, roof: true, reel: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, hw = v.roof ? W * 0.4 : W * 0.8, hd = v.roof ? D * 0.5 : D * 0.8, hz = v.roof ? Z0 + H * 0.64 : Z1;
      a.box(cx - hw / 2 - 6, cy - hd / 2 - 6, Z0, cx + hw / 2 + 6, cy + hd / 2 + 6, Z0 + H * 0.04);
      for (const s of [-1, 1]) for (const t of [-1, 1]) a.cyl(cx + s * (hw / 2 - 2), cy + t * (hd / 2 - 2), Z0 + H * 0.04, Z0 + H * 0.07, 3, 6);
      sup(a, [{ y: cy - hd / 2, x: cx, rx: hw / 2, z0: Z0 + H * 0.04, z1: hz - 4 }, { y: cy - hd / 2 + 2, x: cx, rx: hw / 2, z0: Z0 + H * 0.04, z1: hz }, { y: cy + hd / 2 - 2, x: cx, rx: hw / 2, z0: Z0 + H * 0.04, z1: hz }, { y: cy + hd / 2, x: cx, rx: hw / 2 - 2, z0: Z0 + H * 0.04, z1: hz - 4 }], { seg: 12, n: 5 });
      a.box(cx - hw * 0.4, cy - hd / 2 - 2, hz - H * 0.18, cx + hw * 0.4, cy - hd / 2 + 1, hz - H * 0.06); a.box(cx - hw * 0.28, cy - hd / 2 - 2, hz - H * 0.34, cx + hw * 0.28, cy - hd / 2 + 1, hz - H * 0.24);
      for (let k = 0; k < v.hoses; k++) { const x = v.hoses === 1 ? cx : cx + (k - 0.5) * hw * 0.5; a.box(x - 4, cy - hd / 2 - 8, hz - H * 0.55, x + 4, cy - hd / 2, hz - H * 0.4); a.tube([[x, cy - hd / 2 - 3, hz - H * 0.4], [x, cy - hd / 2 - 8, hz - H * 0.22], [x + 8, cy - hd / 2 - 18, hz - H * 0.45]], [3, 3, 4], 5); a.box(x - 5, cy - hd / 2 - 20, hz - H * 0.62, x + 5, cy - hd / 2 - 8, hz - H * 0.5); }
      a.box(cx - hw / 2 - 2, cy - hd / 2 - 2, hz, cx + hw / 2 + 2, cy + hd / 2 + 2, hz + H * 0.03);
      if (v.reel) { a.xcyl(cx + hw / 2, cx + hw / 2 + 12, cy, Z0 + H * 0.4, H * 0.18, 16); a.xcyl(cx + hw / 2 + 12, cx + hw / 2 + 14, cy, Z0 + H * 0.4, H * 0.2, 16); a.xcyl(cx + hw / 2 + 28, cx + hw / 2 + 30, cy, Z0 + H * 0.4, H * 0.2, 16); a.xcyl(cx + hw / 2 + 14, cx + hw / 2 + 28, cy, Z0 + H * 0.4, H * 0.18, 16); }
      if (v.roof) { for (const s of [-1, 1]) a.tube([[cx + s * W * 0.46, cy - D * 0.38, Z0], [cx + s * W * 0.46, cy - D * 0.38, Z1 - H * 0.06]], [4, 4], 8); a.box(X0, YF, Z1 - H * 0.06, X1, YB, Z1); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); }
      a.rect(cx - hw / 2, cy - hd / 2, cx + hw / 2, cy + hd / 2);
      a.log('Added the base plate, housing with display and keypad, ' + v.hoses + ' nozzle holster(s) with hose loops' + (v.roof ? ', canopy and posts' : '') + (v.reel ? ' and the hose reel' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic marina power and water pedestal',
    desc: (v) => `Marina service pedestal with ${v.bays} berth${v.bays > 1 ? 's' : ''}: a base plate on a plinth, a tall housing with ${v.bays} hinged socket covers, ${v.bays} breaker panels, ${v.bays} water outlet${v.bays > 1 ? 's' : ''} with taps and hose hooks and a small light on the top.`,
    vs: [['one berth', 14, 12, 40, 0, { bays: 1 }], ['two berth', 20, 12, 40, 0, { bays: 2 }], ['four berth', 38, 14, 44, 0, { bays: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bw = W / v.bays;
      a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.08); a.box(X0 + 6, YF + 6, Z0 + H * 0.08, X1 - 6, YB - 6, Z1 - H * 0.08);
      for (let k = 0; k < v.bays; k++) {
        const x = X0 + bw * (k + 0.5);
        a.box(x - bw * 0.36, YF - 3, Z0 + H * 0.66, x + bw * 0.36, YF + 6, Z1 - H * 0.1); a.box(x - bw * 0.3, YF - 5, Z0 + H * 0.74, x + bw * 0.3, YF - 3, Z0 + H * 0.84);
        a.cyl(x - bw * 0.12, YF - 3, Z0 + H * 0.72, Z0 + H * 0.74, 4, 8); a.cyl(x + bw * 0.12, YF - 3, Z0 + H * 0.72, Z0 + H * 0.74, 4, 8);
        a.box(x - bw * 0.3, YF - 3, Z0 + H * 0.4, x + bw * 0.3, YF + 6, Z0 + H * 0.58); a.box(x - 5, YF - 5, Z0 + H * 0.44, x + 5, YF - 3, Z0 + H * 0.54);
        a.cyl(x, YF + 2, Z0 + H * 0.2, Z0 + H * 0.26, 8, 8); a.ycyl(YF - 22, YF + 2, x, Z0 + H * 0.3, 4, 8); a.tube([[x + bw * 0.25, YF - 2, Z0 + H * 0.3], [x + bw * 0.25, YF - 8, Z0 + H * 0.3]], [3, 3], 4);
        a.line(x - bw * 0.36, YF, x + bw * 0.36, YF, 'EQUIP-DETAIL');
      }
      a.box(X0 + 3, YF + 3, Z1 - H * 0.08, X1 - 3, YB - 3, Z1 - H * 0.02); a.ell(cx, cy, Z1 - H * 0.02, W * 0.3, D * 0.3, H * 0.04, 12, 5);
      a.rect(X0, YF, X1, YB); a.rect(X0 + 6, YF + 6, X1 - 6, YB - 6, 'EQUIP-DETAIL');
      a.log('Added the plinth, housing with ' + v.bays + ' socket cover(s), breaker panel(s), water outlet(s) with taps and hose hooks and the top light (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic quay ladder in recess',
    desc: (v) => `Quay-wall ladder with ${v.rungs} rungs, set in a concrete recess: a concrete wall block with a vertical slot, two stand-off rails with ${v.rungs} round rungs, a top grab handle bending out over the quay edge, a rubber edge strip and a fender strip beside the ladder.`,
    vs: [['4 rungs', 30, 16, 60, 0, { rungs: 4 }], ['6 rungs', 30, 16, 92, 0, { rungs: 6 }], ['8 rungs', 30, 16, 124, 0, { rungs: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, sl = [cx - W * 0.2, cx + W * 0.2];
      a.box(X0, cy, Z0, sl[0] - W * 0.04, YB, Z1); a.box(sl[1] + W * 0.04, cy, Z0, X1, YB, Z1); a.box(X0, cy, Z0, X1, YB, Z0 + H * 0.12); a.box(X0, cy, Z1 - H * 0.04, X1, YB, Z1);
      for (const x of sl) { a.tube([[x, cy + D * 0.2, Z0 + H * 0.1], [x, cy + D * 0.2, Z1 - H * 0.06], [x, YF + D * 0.2, Z1 + 0 - H * 0.0]], [3, 3, 3], 6); }
      for (let k = 0; k < v.rungs; k++) a.xcyl(sl[0], sl[1], cy + D * 0.2, Z0 + H * 0.16 + k * (H * 0.72) / v.rungs, 2.4, 6);
      a.tube([[sl[0], YF + D * 0.2, Z1], [sl[0], YF + D * 0.1, Z1 - H * 0.08]], [3, 3], 5); a.tube([[sl[1], YF + D * 0.2, Z1], [sl[1], YF + D * 0.1, Z1 - H * 0.08]], [3, 3], 5);
      a.box(X0, cy, Z1, X1, YB, Z1 + 0); a.box(X0, YB - D * 0.1, Z1 - H * 0.02, X1, YB, Z1);
      a.box(X1 - W * 0.12, cy - D * 0.1, Z0 + H * 0.12, X1 - W * 0.04, cy, Z1 - H * 0.04);
      a.rect(X0, cy, X1, YB); a.rect(sl[0], cy, sl[1], cy + D * 0.4, 'EQUIP-DETAIL');
      a.log('Added the concrete wall block with recess, two stand-off rails, ' + v.rungs + ' round rungs, the top handle, edge strip and fender strip (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic boat launch trolley',
    desc: (v) => `Boat launch trolley for a ${v.ft} ft boat: a tubular main frame with two cross tubes, two adjustable padded side supports, a keel roller, a pair of wheels on a stub axle with mudguards, a bow winch post with a strap and a jockey wheel on a tow tongue with a coupler.`,
    vs: [['8 ft dinghy', 40, 90, 36, 0, { ft: 8 }], ['12 ft boat', 48, 138, 42, 0, { ft: 12 }], ['16 ft boat', 54, 186, 46, 0, { ft: 16 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, hw = W * 0.3, fz = Z0 + H * 0.35;
      for (const s of [-1, 1]) a.tube([[cx + s * hw, YF + D * 0.28, fz], [cx + s * hw, YB - D * 0.1, fz]], [12, 12], 8);
      for (const f of [0.5, 0.78]) a.tube([[cx - hw, YF + D * f - D * 0.0, fz], [cx + hw, YF + D * f, fz]], [11, 11], 8);
      a.tube([[cx - hw, YB - D * 0.1, fz], [cx + hw, YB - D * 0.1, fz]], [10, 10], 8);
      a.tube([[cx, YF + D * 0.28, fz], [cx, YF + D * 0.06, fz - 10], [cx, YF, fz - 20]], [12, 12, 12], 8); a.box(cx - 16, YF - 0, fz - 40, cx + 16, YF + 40, fz); a.cyl(cx, YF + 24, fz, fz + 28, 22, 10);
      a.tube([[cx, YF + D * 0.14, fz - 6], [cx, YF + D * 0.14, Z0 + 55]], [8, 8], 6); a.xcyl(cx - 6, cx + 6, YF + D * 0.14, Z0 + 40, 40, 14); a.circ(cx, YF + D * 0.14, 6, 'EQUIP-DETAIL');
      for (const f of [0.55, 0.82]) for (const s of [-1, 1]) { const y = YF + D * f; a.tube([[cx + s * hw, y, fz], [cx + s * hw * 0.86, y, fz + H * 0.35]], [9, 9], 6); a.box(cx + s * hw * 0.86 - 40, y - D * 0.08, fz + H * 0.35, cx + s * hw * 0.86 + 40, y + D * 0.08, fz + H * 0.35 + 30); a.rect(cx + s * hw * 0.86 - 40, y - D * 0.08, cx + s * hw * 0.86 + 40, y + D * 0.08, 'EQUIP-DETAIL'); }
      a.xcyl(cx - 60, cx + 60, YF + D * 0.66, fz + H * 0.22, 24, 12);
      a.tube([[cx, YF + D * 0.3, fz], [cx, YF + D * 0.3, fz + H * 0.5]], [10, 10], 6); a.box(cx - 24, YF + D * 0.3 - 20, fz + H * 0.4, cx + 24, YF + D * 0.3 + 20, fz + H * 0.52); a.cyl(cx, YF + D * 0.3, fz + H * 0.52, fz + H * 0.56, 14, 8);
      const wy = YF + D * 0.62; a.xcyl(cx - hw - 80, cx + hw + 80, wy, Z0 + 70, 9, 8); for (const s of [-1, 1]) { a.xcyl(cx + s * (hw + 20) - 40, cx + s * (hw + 20) + 40, wy, Z0 + 150, 150, 18); a.xcyl(cx + s * (hw + 20) - 60, cx + s * (hw + 20) + 60, wy, Z0 + 150, 150, 18); a.xcyl(cx + s * (hw + 20) - 62, cx + s * (hw + 20) + 62, wy, Z0 + 150, 70, 10); a.tube([[cx + s * (hw + 20), wy, fz + 20], [cx + s * (hw + 20), wy + 10, fz + 20]], [4, 4], 4); a.rect(cx + s * (hw + 20) - 60, wy - 150, cx + s * (hw + 20) + 60, wy + 150, 'EQUIP-DETAIL'); a.box(cx + s * (hw + 20) - 70, wy - 160, Z0 + 310, cx + s * (hw + 20) + 70, wy + 160, Z0 + 324); }
      a.rect(cx - hw, YF + D * 0.28, cx + hw, YB - D * 0.1, 'EQUIP'); a.line(cx, YF, cx, YF + D * 0.28, 'EQUIP');
      a.log('Added the main frame with cross tubes, adjustable padded supports, keel roller, wheels with mudguards, bow winch post and the tow tongue with coupler and jockey wheel (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic boat storage stand',
    desc: (v) => v.kind === 'jack' ? `Adjustable boat jack stand, ${v.hh} in: a splayed three-leg base with a foot pad each, a threaded centre pole, a cross-bar with a padded V-head and a chain linking the legs.` : `Boat storage cradle for a ${v.ft} ft hull: a long bed frame on two cross skids, ${v.pads} adjustable padded posts with threaded stems and hand cranks, a bow post with a keel pad and a stern bar with a boarding ladder rack.`,
    vs: [['jack stand, 24 in', 24, 24, 24, 0, { kind: 'jack', hh: 24 }], ['cradle, 18 ft, 4 pads', 78, 216, 54, 0, { kind: 'cradle', ft: 18, pads: 4 }], ['cradle, 26 ft, 6 pads', 96, 312, 62, 0, { kind: 'cradle', ft: 26, pads: 6 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
      if (v.kind === 'jack') {
        for (let k = 0; k < 3; k++) { const t = (k / 3) * TAU + 1.0, x = cx + m.cos(t) * W * 0.42, y = cy + m.sin(t) * D * 0.42; a.tube([[x, y, Z0 + 6], [cx + m.cos(t) * W * 0.06, cy + m.sin(t) * D * 0.06, Z0 + H * 0.7]], [8, 7], 6); a.cyl(x, y, Z0, Z0 + 6, 18, 8); a.circ(x, y, 18, 'EQUIP-DETAIL'); a.line(cx, cy, x, y, 'EQUIP'); }
        a.tube([[cx, cy, Z0 + H * 0.2], [cx, cy, Z1 - H * 0.12]], [12, 12], 10); a.cyl(cx, cy, Z0 + H * 0.5, Z0 + H * 0.56, 16, 10); a.cyl(cx, cy, Z0 + H * 0.66, Z0 + H * 0.72, 18, 10);
        a.box(cx - W * 0.4, cy - 7, Z1 - H * 0.12, cx + W * 0.4, cy + 7, Z1 - H * 0.07); a.box(cx - W * 0.4, cy - 7, Z1 - H * 0.07, cx - W * 0.25, cy + 7, Z1); a.box(cx + W * 0.25, cy - 7, Z1 - H * 0.07, cx + W * 0.4, cy + 7, Z1);
        a.circ(cx, cy, 12, 'EQUIP-DETAIL');
      } else {
        const fz = Z0 + H * 0.2; for (const f of [0.15, 0.85]) { a.box(X0, YF + D * f - 20, Z0, X1, YF + D * f + 20, Z0 + H * 0.1); a.box(X0, YF + D * f - 10, Z0 + H * 0.1, X1, YF + D * f + 10, fz); }
        for (const s of [-1, 1]) a.tube([[cx + s * W * 0.34, YF + D * 0.04, fz], [cx + s * W * 0.34, YB - D * 0.04, fz]], [14, 14], 8);
        for (let k = 0; k < v.pads / 2; k++) { const y = YF + D * (0.2 + (0.6 * k) / m.max(v.pads / 2 - 1, 1)); a.tube([[cx - W * 0.34, y, fz], [cx + W * 0.34, y, fz]], [10, 10], 8); for (const s of [-1, 1]) { const x = cx + s * W * 0.34; a.tube([[x, y, fz], [x + s * 16, y, Z1 - H * 0.12]], [8, 7], 6); a.box(x + s * 16 - 34, y - 60, Z1 - H * 0.12, x + s * 16 + 34, y + 60, Z1 - H * 0.12 + 24); a.rect(x + s * 16 - 34, y - 60, x + s * 16 + 34, y + 60, 'EQUIP-DETAIL'); a.xcyl(x + s * 16 - 20, x + s * 16 + 20, y, fz + H * 0.45, 5, 6); } }
        a.tube([[cx, YF + D * 0.04, fz], [cx, YF + D * 0.04, Z1 - H * 0.1]], [12, 12], 8); a.box(cx - 70, YF + D * 0.04 - 40, Z1 - H * 0.1, cx + 70, YF + D * 0.04 + 40, Z1 - H * 0.1 + 22);
        a.box(cx - W * 0.3, YB - 40, fz, cx + W * 0.3, YB - 20, fz + H * 0.4); for (let k = 0; k < 4; k++) a.line(cx - W * 0.3 + k * W * 0.2, YB - 30, cx - W * 0.3 + k * W * 0.2, YB - 30 + 0, 'EQUIP-DETAIL');
        a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.line(cx, YF, cx, YB, 'EQUIP');
      }
      a.log('Added the ' + (v.kind === 'jack' ? 'splayed legs with foot pads, threaded pole, chain and V-head' : 'bed frame on skids, padded posts with threaded stems, bow keel post and stern ladder rack') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic boathouse shed',
    desc: (v) => `Boathouse shed, ${v.wd} x ${v.ln} ft: a slab floor, framed walls with board lines, a pitched roof with eaves and a ridge cap, ${v.doors > 1 ? 'a pair of big sliding doors' : 'a big hinged double door'} at the front, a side man door, ${v.win} side windows and a roof vent.`,
    vs: [['14 x 20 ft', 168, 240, 130, 0, { wd: 14, ln: 20, doors: 1, win: 2 }], ['20 x 30 ft', 240, 360, 160, 0, { wd: 20, ln: 30, doors: 2, win: 3 }], ['30 x 50 ft', 360, 600, 200, 0, { wd: 30, ln: 50, doors: 2, win: 5 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, wz = Z0 + H * 0.64, ex = W * 0.03;
      a.box(X0 + ex, YF + ex, Z0, X1 - ex, YB - ex, Z0 + 6);
      a.box(X0 + ex * 1.5, YB - ex * 3, Z0 + 6, X1 - ex * 1.5, YB - ex * 1.5, wz); a.box(X0 + ex * 1.5, YF + ex * 1.5, Z0 + 6, X0 + ex * 3, YB - ex * 1.5, wz); a.box(X1 - ex * 3, YF + ex * 1.5, Z0 + 6, X1 - ex * 1.5, YB - ex * 1.5, wz);
      const dw = W * 0.7, dh = wz - Z0 - H * 0.1; a.box(X0 + ex * 1.5, YF + ex * 1.5, wz - H * 0.06, X1 - ex * 1.5, YF + ex * 3, wz); a.box(X0 + ex * 1.5, YF + ex * 1.5, Z0 + 6, cx - dw / 2, YF + ex * 3, wz); a.box(cx + dw / 2, YF + ex * 1.5, Z0 + 6, X1 - ex * 1.5, YF + ex * 3, wz);
      const d0 = v.doors > 1 ? 2 : 2; for (let k = 0; k < d0; k++) { const x0 = cx - dw / 2 + (dw * k) / d0, x1 = cx - dw / 2 + (dw * (k + 1)) / d0; a.box(x0 + 4, YF + 1, Z0 + 8, x1 - 4, YF + ex * 1.2, Z0 + 8 + dh - 20); a.frame(x0 + 14, Z0 + 20, x1 - 14, Z0 + 8 + dh - 30, YF + 1, YF + 6, 8); a.box(x1 - 24, YF + 1, Z0 + dh * 0.45, x1 - 18, YF + 6, Z0 + dh * 0.55); }
      if (v.doors > 1) a.box(cx - dw / 2, YF + 1, Z0 + dh + 6, cx + dw / 2, YF + 4, Z0 + dh + 18);
      a.box(X0 + 1, cy - 16, Z0 + 8, X0 + ex * 1.5, cy + 16, Z0 + 8 + 74 * 1.0); a.box(X0 + 1, cy + 16, Z0 + 8, X0 + ex * 1.5, cy + 20, Z0 + 8 + 80);
      for (let k = 0; k < v.win; k++) { const y = YF + D * (0.2 + (0.7 * k) / m.max(v.win - 1, 1)); a.box(X1 - ex * 2 - 2, y - 18, Z0 + H * 0.38, X1 - 1, y + 18, Z0 + H * 0.56); }
      prismY(a, [[X0 + 1, wz], [X1 - 1, wz], [cx, Z1 - 2]], YF + 1, YB - 1); a.box(cx - 4, YF + 1, Z1 - 4, cx + 4, YB - 1, Z1);
      a.box(cx - 20, cy + D * 0.1, Z1 - 12, cx + 20, cy + D * 0.1 + 40, Z1 - 2);
      a.rect(X0 + ex, YF + ex, X1 - ex, YB - ex); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL'); a.rect(cx - dw / 2, YF, cx + dw / 2, YF + ex * 1.5, 'EQUIP-DETAIL');
      a.log('Added the slab, walls with board lines, pitched roof with ridge cap, front doors with frames, side man door, windows and the roof vent (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic tide gauge staff',
    desc: (v) => `Tide gauge staff, ${v.ft} ft range: a vertical board bolted to a pile with alternating bands every foot, tick lines and bold numbers drawn as raised blocks, a footplate with two diagonal braces, a top cap and two bracket ties to the pile.`,
    vs: [['8 ft range', 16, 12, 100, 0, { ft: 8 }], ['12 ft range', 16, 12, 150, 0, { ft: 12 }], ['18 ft range', 18, 14, 220, 0, { ft: 18 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bw = W * 0.34, n = v.ft, bh = (H * 0.86) / n;
      a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.02); a.tube([[cx, cy + D * 0.2, Z0 + H * 0.02], [cx, cy + D * 0.2, Z1]], [D * 0.22, D * 0.22], 12);
      a.box(cx - bw, YF + D * 0.22, Z0 + H * 0.06, cx + bw, YF + D * 0.32, Z1 - H * 0.04);
      for (let k = 0; k < n; k++) { if (k % 2 === 0) a.box(cx - bw * 0.9, YF + D * 0.12, Z0 + H * 0.08 + k * bh, cx + bw * 0.9, YF + D * 0.22, Z0 + H * 0.08 + (k + 1) * bh); for (let j = 1; j < 5; j++) a.box(cx + bw * 0.1, YF + D * 0.12, Z0 + H * 0.08 + k * bh + (bh * j) / 5 - 1, cx + bw * 0.9, YF + D * 0.2, Z0 + H * 0.08 + k * bh + (bh * j) / 5 + 1); }
      for (let k = 1; k <= n; k += 1) if (k % 2 === 0 || n <= 8) a.box(cx - bw * 0.85, YF + D * 0.08, Z0 + H * 0.08 + k * bh - bh * 0.4, cx - bw * 0.15, YF + D * 0.12, Z0 + H * 0.08 + k * bh - bh * 0.1);
      for (const s of [-1, 1]) a.tube([[cx + s * bw * 0.5, YF + D * 0.28, Z0 + H * 0.06], [cx + s * W * 0.34, cy + D * 0.2, Z0 + H * 0.3]], [3, 3], 4);
      for (const z of [0.4, 0.8]) a.box(cx - bw, cy - D * 0.05, Z0 + H * z, cx + bw, cy + D * 0.35, Z0 + H * z + 10);
      a.box(cx - bw * 1.1, YF + D * 0.2, Z1 - H * 0.04, cx + bw * 1.1, YF + D * 0.34, Z1);
      a.rect(X0, YF, X1, YB); a.rect(cx - bw, YF + D * 0.22, cx + bw, YF + D * 0.32, 'EQUIP-DETAIL'); a.circ(cx, cy + D * 0.2, D * 0.22, 'EQUIP');
      a.log('Added the footplate and pile, the gauge board with ' + n + ' alternating bands, tick lines and number blocks, braces, ties and top cap (plan and 3D).');
    } }),

  fam({ cat: 'marine/harbour', title: 'Generic channel daymark on pile',
    desc: (v) => `Channel daymark: a steel tube pile with collar bands, a service platform with a rail near the top and a ${v.kindText} board on a short mast${v.rad ? ', a radar reflector on the board and a solar lamp above it' : ', a ladder up the pile'}, an anode lug band at the bottom and a rubber tyre fender ring.`,
    vs: [['square board, 36 in', 60, 40, 190, 0, { kindText: 'square', bd: 36, shape: 'sq' }], ['triangle board, 48 in', 72, 40, 210, 0, { kindText: 'triangular', bd: 48, shape: 'tri' }], ['diamond board, 60 in, radar reflector', 84, 48, 240, 0, { kindText: 'diamond', bd: 60, shape: 'dia', rad: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pr = D * 0.16, bz = Z0 + H * 0.58, bw = v.bd * I / 2;
      a.tube([[cx, cy, Z0], [cx, cy, bz + H * 0.1]], [pr, pr * 0.9], 14); for (const z of [0.18, 0.32]) a.cyl(cx, cy, Z0 + H * z, Z0 + H * z + 6, pr * 1.12, 14);
      a.box(cx - 16, cy - pr - 6, Z0 + H * 0.02, cx + 16, cy - pr, Z0 + H * 0.1); ring3(a, cx, cy, Z0 + H * 0.5, pr * 1.5, 14, 12, 'z');
      a.cyl(cx, cy, bz - 4, bz + 6, D * 0.46, 16); rail(a, cx - D * 0.46, cy, cx + D * 0.46, cy, bz + 6, bz + 6 + H * 0.12, 4, 3, 2); a.circ(cx, cy, D * 0.46, 'EQUIP');
      a.tube([[cx, cy, bz + H * 0.1], [cx, cy, Z1 - H * 0.04]], [pr * 0.55, pr * 0.4], 8);
      const bzc = Z1 - H * 0.2; const poly = v.shape === 'sq' ? [[cx - bw * 0.7, bzc - bw * 0.7], [cx + bw * 0.7, bzc - bw * 0.7], [cx + bw * 0.7, bzc + bw * 0.7], [cx - bw * 0.7, bzc + bw * 0.7]] : v.shape === 'tri' ? [[cx - bw, bzc - bw * 0.6], [cx + bw, bzc - bw * 0.6], [cx, bzc + bw * 0.9]] : [[cx - bw * 0.85, bzc], [cx, bzc - bw * 0.85], [cx + bw * 0.85, bzc], [cx, bzc + bw * 0.85]];
      prismY(a, poly, cy - pr * 1.3 - 10, cy - pr * 1.3 + 10);
      const inset = poly.map(([x, z]) => [cx + (x - cx) * 0.6, bzc + (z - bzc) * 0.6]); prismY(a, inset, cy - pr * 1.3 - 14, cy - pr * 1.3 - 10);
      a.tube([[cx, cy, bz + H * 0.1], [cx, cy - pr * 1.3, bzc - bw * 0.5]], [6, 6], 5);
      if (v.rad) { a.ell(cx, cy - pr * 1.3 - 10, Z1 - H * 0.04, bw * 0.2, bw * 0.2, bw * 0.2, 8, 5); a.cyl(cx, cy, Z1 - H * 0.04, Z1 - 4, 24, 10); a.ell(cx, cy, Z1 - 4, 24, 24, 20, 10, 5); }
      else for (let k = 0; k < 10; k++) a.xcyl(cx - 7, cx + 7, cy - pr - 1, Z0 + H * 0.12 + k * H * 0.04, 1.6, 4);
      a.circ(cx, cy, pr, 'EQUIP'); a.circ(cx, cy, pr * 1.12, 'EQUIP-DETAIL'); a.line(cx - bw, cy - pr * 1.3, cx + bw, cy - pr * 1.3, 'EQUIP-DETAIL');
      a.log('Added the tube pile with collars and anode lug, the railed service platform, mast, ' + v.kindText + ' board with raised face' + (v.rad ? ', radar reflector and solar lamp' : ' and ladder') + ' (plan and 3D).');
    } }),

  // ===================================================== offshore =====================================================
  fam({ cat: 'marine/offshore', title: 'Generic unmanned wellhead platform',
    desc: (v) => `Unmanned wellhead platform on ${v.legs === 1 ? 'a single caisson' : v.legs + ' battered jacket legs'}: ${v.legs === 1 ? 'a large caisson with guide collars' : 'horizontal frames and X-bracing between the legs'}, a boat landing with a fender and ladder at the splash zone, a main deck with a wellbay grid, a vent stack, a small crane stub and a navigation-light mast.`,
    vs: [['caisson, single leg', 240, 240, 1000, 0, { legs: 1 }], ['three-leg jacket', 360, 330, 1300, 0, { legs: 3 }], ['four-leg jacket', 440, 440, 1500, 0, { legs: 4 }]],
    build: (a0, v) => { const a = sc(a0, 22);
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, dz = Z0 + H * 0.74, sp = Z0 + H * 0.66, tr = 20;
      if (v.legs === 1) { a.tube([[cx, cy, Z0], [cx, cy, dz]], [60, 56], 18); for (const z of [0.15, 0.35, 0.55]) a.cyl(cx, cy, Z0 + H * z, Z0 + H * z + 12, 72, 18); a.circ(cx, cy, 60, 'EQUIP'); }
      else { const pos = v.legs === 3 ? [[cx - W * 0.3, cy + D * 0.3], [cx + W * 0.3, cy + D * 0.3], [cx, cy - D * 0.32]] : [[cx - W * 0.32, cy - D * 0.32], [cx + W * 0.32, cy - D * 0.32], [cx - W * 0.32, cy + D * 0.32], [cx + W * 0.32, cy + D * 0.32]]; const top = pos.map(([x, y]) => [cx + (x - cx) * 0.72, cy + (y - cy) * 0.72]);
        pos.forEach(([x, y], i) => { a.tube([[x, y, Z0], [top[i][0], top[i][1], dz]], [tr, tr * 0.9], 12); a.circ(x, y, tr, 'EQUIP'); });
        for (const f of [0.15, 0.4, 0.62]) { const z = Z0 + H * f, k = 1 - 0.28 * ((z - Z0) / (dz - Z0)); const ring = pos.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k, z]); for (let i = 0; i < ring.length; i++) { const p = ring[i], q = ring[(i + 1) % ring.length]; a.tube([p, q], [9, 9], 6); } }
        for (let i = 0; i < pos.length; i++) { const j = (i + 1) % pos.length; for (const [f0, f1] of [[0.0, 0.15], [0.15, 0.4], [0.4, 0.62]]) { const k0 = 1 - 0.28 * ((f0 * H) / (dz - Z0)), k1 = 1 - 0.28 * ((f1 * H) / (dz - Z0)); const P = (q, k, f) => [cx + (pos[q][0] - cx) * k, cy + (pos[q][1] - cy) * k, Z0 + H * f]; a.tube([P(i, k0, f0), P(j, k1, f1)], [6, 6], 4); } } }
      a.box(X0 + W * 0.06, YF + D * 0.06, dz, X1 - W * 0.06, YB - D * 0.06, dz + H * 0.03); a.box(X0 + W * 0.1, YF + D * 0.1, dz + H * 0.03, X1 - W * 0.1, YB - D * 0.1, dz + H * 0.05);
      const gx0 = cx - W * 0.2, gx1 = cx + W * 0.2, gy0 = cy - D * 0.2, gy1 = cy + D * 0.2; a.rect(gx0, gy0, gx1, gy1, 'EQUIP-DETAIL'); for (let k = 1; k < 5; k++) { a.line(gx0 + (gx1 - gx0) * k / 5, gy0, gx0 + (gx1 - gx0) * k / 5, gy1, 'EQUIP-DETAIL'); a.line(gx0, gy0 + (gy1 - gy0) * k / 5, gx1, gy0 + (gy1 - gy0) * k / 5, 'EQUIP-DETAIL'); }
      for (let k = 0; k < 4; k++) a.cyl(gx0 + (gx1 - gx0) * (k + 0.5) / 4, cy, dz + H * 0.05, dz + H * 0.11, 14, 8);
      rail(a, X0 + W * 0.06, YF + D * 0.06, X1 - W * 0.06, YF + D * 0.06, dz + H * 0.03, dz + H * 0.07, 4, 8, 2); rail(a, X0 + W * 0.06, YB - D * 0.06, X1 - W * 0.06, YB - D * 0.06, dz + H * 0.03, dz + H * 0.07, 4, 8, 2);
      a.tube([[X1 - W * 0.18, YB - D * 0.18, dz + H * 0.05], [X1 - W * 0.18, YB - D * 0.18, Z1 - H * 0.08]], [12, 8], 8); a.cyl(X1 - W * 0.18, YB - D * 0.18, Z1 - H * 0.08, Z1 - H * 0.06, 16, 8);
      a.tube([[X0 + W * 0.15, YB - D * 0.15, dz + H * 0.05], [X0 + W * 0.15, YB - D * 0.15, dz + H * 0.17], [X0 + W * 0.4, YB - D * 0.15, dz + H * 0.2]], [16, 12, 8], 8); a.cyl(X0 + W * 0.15, YB - D * 0.15, dz + H * 0.03, dz + H * 0.07, 30, 10);
      a.tube([[cx, cy + D * 0.35, dz + H * 0.05], [cx, cy + D * 0.35, Z1]], [5, 4], 5); a.ell(cx, cy + D * 0.35, Z1, 10, 10, 10, 6, 4);
      a.box(cx - W * 0.28, YF + D * 0.02, sp - 4, cx + W * 0.28, YF + D * 0.18, sp + 4); a.tube([[cx + W * 0.24, YF + D * 0.08, sp], [cx + W * 0.24, YF + D * 0.08, sp - H * 0.28]], [3, 3], 4); a.ycyl(YF + D * 0.01, YF + D * 0.18, cx - W * 0.2, sp - H * 0.06, 14, 8); a.ycyl(YF + D * 0.01, YF + D * 0.18, cx + W * 0.2, sp - H * 0.06, 14, 8);
      a.rect(X0 + W * 0.06, YF + D * 0.06, X1 - W * 0.06, YB - D * 0.06); a.rect(cx - W * 0.28, YF + D * 0.02, cx + W * 0.28, YF + D * 0.18, 'EQUIP-DETAIL');
      a.log('Added ' + (v.legs === 1 ? 'the caisson with guide collars' : v.legs + ' battered legs with frames and bracing') + ', boat landing with fender, main deck with wellbay grid, vent stack, crane stub and the light mast (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic offshore helideck',
    desc: (v) => `${v.kindText} helideck, ${v.dia} ft: a raised landing plate with a painted ring and H mark drawn as raised bars, a perimeter walkway with a safety net frame, edge lights, a firefighting monitor post, cantilever support trusses and a stair tower down to the deck below.`,
    vs: [['round, 40 ft', 560, 560, 150, 0, { kindText: 'Round', dia: 40, shape: 'round' }], ['octagonal, 55 ft', 720, 720, 180, 0, { kindText: 'Octagonal', dia: 55, shape: 'oct' }], ['square, 65 ft', 860, 860, 210, 0, { kindText: 'Square', dia: 65, shape: 'sq' }]],
    build: (a0, v) => { const a = sc(a0, 25);
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = W * 0.42, pz = Z1 - H * 0.2, sg2 = v.shape === 'round' ? 28 : v.shape === 'oct' ? 8 : 4, ph = v.shape === 'sq' ? m.PI / 4 : v.shape === 'oct' ? m.PI / 8 : 0, RR = v.shape === 'sq' ? R * 1.3 : R;
      const outl = Array.from({ length: sg2 }, (_, k) => { const t = (k / sg2) * TAU + ph; return [cx + m.cos(t) * RR, cy + m.sin(t) * RR]; });
      prismY(a, [[0, 0]], 0, 0); a.prism(outl, pz, pz + 14); a.poly(outl);
      a.prism(outl.map(([x, y]) => [cx + (x - cx) * 0.96, cy + (y - cy) * 0.96]), pz - 8, pz);
      a.circ(cx, cy, R * 0.72, 'EQUIP-DETAIL');
      ring3(a, cx, cy, pz + 16, R * 0.72, 2.5, 28, 'z');
      for (const s of [-1, 1]) a.box(cx + s * R * 0.2 - 4, cy - R * 0.3, pz + 14, cx + s * R * 0.2 + 4, cy + R * 0.3, pz + 18); a.box(cx - R * 0.2, cy - 4, pz + 14, cx + R * 0.2, cy + 4, pz + 18);
      for (let k = 0; k < sg2; k++) { const p = outl[k], q = outl[(k + 1) % sg2]; a.tube([[p[0], p[1], pz + 14], [p[0], p[1], pz + 14 + H * 0.1]], [4, 4], 5); a.tube([[p[0], p[1], pz + 14 + H * 0.1], [q[0], q[1], pz + 14 + H * 0.1]], [3, 3], 4); a.tube([[p[0], p[1], pz + 14 + H * 0.05], [q[0], q[1], pz + 14 + H * 0.05]], [2, 2], 4); if (k % 2 === 0) a.ell(p[0] * 1.0 - (p[0] - cx) * 0.04, p[1] - (p[1] - cy) * 0.04, pz + 18, 8, 8, 5, 6, 4); }
      for (let k = 0; k < 6; k++) { const t = (k / 6) * TAU + 0.3; const x = cx + m.cos(t) * R * 0.7, y = cy + m.sin(t) * R * 0.7; a.tube([[x, y, Z0 + 30], [x * 0.95 + cx * 0.05 + 0, y, pz - 8]], [10, 9], 6); }
      for (let k = 0; k < 4; k++) { const t = (k / 4) * TAU + 0.8; a.tube([[cx + m.cos(t) * RR * 0.95, cy + m.sin(t) * RR * 0.95, pz - 8], [cx + m.cos(t) * RR * 0.4, cy + m.sin(t) * RR * 0.4, Z0 + H * 0.2]], [8, 7], 6); }
      a.cyl(cx, cy, Z0, Z0 + H * 0.2, R * 0.12, 12); for (let k = 0; k < 4; k++) { const t = (k / 4) * TAU; a.tube([[cx + m.cos(t) * R * 0.12, cy + m.sin(t) * R * 0.12, Z0 + H * 0.15], [cx + m.cos(t) * RR * 0.5, cy + m.sin(t) * RR * 0.5, pz - 8]], [5, 5], 4); }
      const mx = cx + RR * 0.85, my = cy - RR * 0.1; a.cyl(mx, my, pz + 14, pz + 14 + H * 0.12, 10, 8); a.tube([[mx, my, pz + 14 + H * 0.12], [mx - 16, my, pz + 14 + H * 0.14]], [6, 5], 5);
      const sx = cx - RR * 0.9; for (let k = 0; k < 6; k++) { a.box(sx - 20, cy - 18 + k * 8, Z0 + H * 0.2 + k * (pz - Z0 - H * 0.2) / 6, sx + 20, cy + 6 + k * 8, Z0 + H * 0.2 + (k + 0.4) * (pz - Z0 - H * 0.2) / 6); }
      a.log('Added the landing plate with ring and H mark, perimeter rail with net frame and edge lights, monitor post, support trusses and stair treads (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic offshore flare boom',
    desc: (v) => `Flare boom, ${v.ft} ft: a triangular lattice boom with three chord tubes and zig-zag bracing leaning out from a base frame, a tie-back stay to a pylon, a flare tip with a cone and pilot burners, a pipe run along the boom and a walkway rail at the root.`,
    vs: [['60 ft', 60, 480, 480, 0, { ft: 60, bays: 8 }], ['90 ft', 72, 720, 700, 0, { ft: 90, bays: 12 }], ['130 ft', 84, 1040, 980, 0, { ft: 130, bays: 16 }]],
    build: (a0, v) => { const a = sc(a0, 12);
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bw = W * 0.3, ang = m.atan2(H * 0.68, D * 0.86), len = m.hypot(D * 0.86, H * 0.68), by = YB - D * 0.06, bz = Z0 + H * 0.06;
      const P = (f, dx, dz) => [cx + dx, by - D * 0.86 * f + dz * m.sin(ang) * 0, bz + H * 0.68 * f + dz];
      const ch = [[-bw, 0], [bw, 0], [0, bw * 1.4]]; const tubes = ch.map(([dx, dz]) => { const p0 = [cx + dx, by - 0, bz + dz], p1 = [cx + dx, by - D * 0.86, bz + H * 0.68 + dz]; return [p0, p1]; });
      tubes.forEach(([p0, p1], i) => a.tube([p0, p1], [i === 2 ? 9 : 10, 7], 8));
      const bb = v.bays; for (let k = 0; k <= bb; k++) { const f = k / bb, pt = (i) => [tubes[i][0][0], lerp(tubes[i][0][1], tubes[i][1][1], f), lerp(tubes[i][0][2], tubes[i][1][2], f)]; const sc = 1 - f * 0.55; const q = [0, 1, 2].map((i) => { const c = [cx, by - D * 0.86 * f, bz + H * 0.68 * f + bw * 0.5 * (1 - sc)]; return [cx + ch[i][0] * sc, c[1], bz + H * 0.68 * f + ch[i][1] * sc]; }); a.tube([q[0], q[1]], [4, 4], 4); a.tube([q[1], q[2]], [4, 4], 4); a.tube([q[2], q[0]], [4, 4], 4); if (k < bb) { const f2 = (k + 1) / bb, sc2 = 1 - f2 * 0.55, q2 = [0, 1, 2].map((i) => [cx + ch[i][0] * sc2, by - D * 0.86 * f2, bz + H * 0.68 * f2 + ch[i][1] * sc2]); a.tube([q[0], q2[1]], [3, 3], 4); a.tube([q[1], q2[2]], [3, 3], 4); a.tube([q[2], q2[0]], [3, 3], 4); } }
      const tip = [cx, by - D * 0.86, bz + H * 0.68 + bw * 0.3]; a.cone(tip[0], tip[1], tip[2], tip[2] + H * 0.1, bw * 0.45, bw * 0.9, 12); for (let k = 0; k < 4; k++) { const t = (k / 4) * TAU; a.tube([[tip[0] + m.cos(t) * bw * 0.9, tip[1] + m.sin(t) * bw * 0.9, tip[2] + H * 0.1], [tip[0] + m.cos(t) * bw * 0.9, tip[1] + m.sin(t) * bw * 0.9, tip[2] + H * 0.14]], [3, 2], 4); }
      a.tube([[cx - bw * 0.4, by, bz + bw * 0.7], [cx - bw * 0.4, by - D * 0.86, bz + H * 0.68 + bw * 0.7]], [9, 7], 8);
      a.box(cx - bw * 2.2, by - 30, Z0, cx + bw * 2.2, by + D * 0.05, bz); a.tube([[cx - bw * 1.5, by + D * 0.02, bz], [cx - bw * 1.5, by + D * 0.02, Z1 - H * 0.04]], [8, 7], 6); a.tube([[cx + bw * 1.5, by + D * 0.02, bz], [cx + bw * 1.5, by + D * 0.02, Z1 - H * 0.04]], [8, 7], 6);
      a.tube([[cx - bw * 1.5, by + D * 0.02, Z1 - H * 0.04], [cx, by - D * 0.86 * 0.7, bz + H * 0.68 * 0.7 + bw]], [3, 3], 4); a.tube([[cx + bw * 1.5, by + D * 0.02, Z1 - H * 0.04], [cx, by - D * 0.86 * 0.7, bz + H * 0.68 * 0.7 + bw]], [3, 3], 4);
      a.tube([[cx - bw * 1.5, by + D * 0.02, Z1 - H * 0.04], [cx + bw * 1.5, by + D * 0.02, Z1 - H * 0.04]], [5, 5], 6);
      rail(a, cx - bw * 2.2, by - 20, cx + bw * 2.2, by - 20, bz, bz + H * 0.05, 3, 4, 2);
      a.rect(cx - bw * 2.2, by - 30, cx + bw * 2.2, by + D * 0.05); a.line(cx - bw, by, cx - bw, by - D * 0.86, 'EQUIP-DETAIL'); a.line(cx + bw, by, cx + bw, by - D * 0.86, 'EQUIP-DETAIL'); a.circ(tip[0], tip[1], bw * 0.9, 'EQUIP-DETAIL');
      a.log('Added the base frame, three-chord lattice boom with zig-zag bracing, pipe run, flare tip with burners, back pylon with stays and the root walkway rail (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic offshore pedestal crane',
    desc: (v) => `Offshore pedestal crane, ${v.cap} class: a tubular pedestal on a flange, a slewing ring and a turntable body with a glazed cab and counterweight, an A-frame with luffing wires and a ${v.ft} ft lattice boom with a hook block on a fall wire.`,
    vs: [['20 t, 50 ft boom', 720, 240, 780, 0, { cap: '20 t', ft: 50 }], ['40 t, 80 ft boom', 1040, 300, 1000, 0, { cap: '40 t', ft: 80 }], ['80 t, 110 ft boom', 1400, 360, 1260, 0, { cap: '80 t', ft: 110 }]],
    build: (a0, v) => { const a = sc(a0, 12);
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bx = X0 + D * 0.5, R = D * 0.2, pz = Z0 + H * 0.3;
      a.cyl(bx, cy, Z0, Z0 + 14, D * 0.5, 20); for (let k = 0; k < 8; k++) { const t = (k / 8) * TAU; a.cyl(bx + m.cos(t) * D * 0.42, cy + m.sin(t) * D * 0.42, Z0 + 14, Z0 + 26, 8, 6); }
      a.tube([[bx, cy, Z0 + 14], [bx, cy, pz]], [R * 1.3, R * 1.1], 18); a.cyl(bx, cy, pz, pz + 12, R * 1.5, 18);
      a.box(bx - D * 0.34, cy - D * 0.3, pz + 12, bx + D * 0.34, cy + D * 0.3, pz + 12 + H * 0.12); a.box(bx - D * 0.46, cy - D * 0.22, pz + 12, bx - D * 0.34, cy + D * 0.22, pz + 12 + H * 0.1);
      a.box(bx - D * 0.14, cy - D * 0.5, pz + 12, bx + D * 0.14, cy - D * 0.3, pz + 12 + H * 0.1); a.box(bx - D * 0.1, cy - D * 0.5 - 4, pz + 20 + H * 0.03, bx + D * 0.1, cy - D * 0.5, pz + 12 + H * 0.09);
      const af = [bx + D * 0.1, cy, pz + 12 + H * 0.12]; a.tube([[bx - D * 0.3, cy - D * 0.2, pz + 12 + H * 0.12], [bx, cy - D * 0.1, pz + H * 0.38], [bx + D * 0.15, cy, pz + 12 + H * 0.12]], [8, 6, 8], 6); a.tube([[bx - D * 0.3, cy + D * 0.2, pz + 12 + H * 0.12], [bx, cy + D * 0.1, pz + H * 0.38], [bx + D * 0.15, cy, pz + 12 + H * 0.12]], [8, 6, 8], 6);
      const b0 = [bx + D * 0.22, cy, pz + 12 + H * 0.06], b1 = [X1 - D * 0.3, cy, Z1 - H * 0.06]; a.tube([b0, b1], [R * 0.6, R * 0.35], 8);
      const nb = m.round(v.ft / 7); for (let k = 0; k <= nb; k++) { const f = k / nb, p = [lerp(b0[0], b1[0], f), cy, lerp(b0[2], b1[2], f)], sc = 1 - f * 0.45; a.tube([[p[0], cy - R * 0.6 * sc, p[2]], [p[0], cy + R * 0.6 * sc, p[2]]], [4, 4], 4); a.tube([[p[0], cy - R * 0.6 * sc, p[2] + R * 0.5 * sc], [p[0], cy - R * 0.6 * sc, p[2] - R * 0.2]], [3, 3], 4); if (k < nb) { const f2 = (k + 1) / nb, p2 = [lerp(b0[0], b1[0], f2), cy, lerp(b0[2], b1[2], f2)]; a.tube([[p[0], cy - R * 0.6 * sc, p[2]], [p2[0], cy + R * 0.6 * (1 - f2 * 0.45), p2[2]]], [3, 3], 4); } }
      for (const s of [-1, 1]) { a.tube([[b0[0], cy + s * R * 0.6, b0[2]], [b1[0], cy + s * R * 0.28, b1[2]]], [7, 5], 6); }
      a.tube([[af[0], cy, af[2] + H * 0.22], [b1[0] - D * 0.1, cy, b1[2] - 8]], [2.5, 2.5], 4); a.tube([[b1[0], cy, b1[2]], [b1[0], cy, Z0 + H * 0.36]], [3, 3], 4);
      a.box(b1[0] - 16, cy - 16, Z0 + H * 0.28, b1[0] + 16, cy + 16, Z0 + H * 0.37); a.ell(b1[0], cy, Z0 + H * 0.26, 18, 18, 16, 8, 5); a.xcyl(b1[0] - 14, b1[0] + 14, cy, b1[2] - 2, 12, 10);
      a.circ(bx, cy, D * 0.5, 'EQUIP'); a.circ(bx, cy, R * 1.3, 'EQUIP-DETAIL'); a.line(bx, cy, b1[0], cy, 'EQUIP-DETAIL'); a.rect(bx - D * 0.34, cy - D * 0.3, bx + D * 0.34, cy + D * 0.3, 'EQUIP-DETAIL');
      a.log('Added the flanged pedestal, slewing house with cab and counterweight, A-frame, lattice boom with luffing wires, main hook block and boom rest (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic drilling derrick',
    desc: (v) => `Drilling derrick, ${v.ft} ft tall: a tapered four-leg lattice mast with horizontal ties and X-bracing in ${v.bays} bays, a crown block with sheaves on top, a racking platform with fingers and a rail, a caged ladder${v.sub ? ', a substructure box with a rig floor and a small hut' : ' and a base frame'}.`,
    vs: [['120 ft', 216, 216, 1440, 0, { ft: 120, bays: 8, sub: false }], ['160 ft, with substructure', 288, 288, 1920, 0, { ft: 160, bays: 10, sub: true }], ['200 ft', 336, 336, 2400, 0, { ft: 200, bays: 12, sub: false }], ['200 ft, with substructure', 360, 360, 2400, 0, { ft: 200, bays: 12, sub: true }]],
    build: (a0, v) => { const a = sc(a0, 12);
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, sbz = v.sub ? H * 0.12 : 0, bz = Z0 + sbz + (v.sub ? 0 : 20), hw0 = W * 0.38, hw1 = W * 0.09, tz = Z1 - H * 0.04, nb = v.bays;
      if (v.sub) { a.box(X0 + W * 0.04, YF + D * 0.04, Z0, X1 - W * 0.04, YB - D * 0.04, Z0 + sbz - 10); a.box(X0, YF, Z0 + sbz - 10, X1, YB, Z0 + sbz); a.box(X0 + W * 0.06, YF + D * 0.06, Z0 + sbz - 40, X0 + W * 0.2, YB - D * 0.06, Z0 + sbz - 10); a.box(X1 - W * 0.2, YF + D * 0.06, Z0 + sbz - 40, X1 - W * 0.06, YB - D * 0.06, Z0 + sbz - 10); a.box(X0 + W * 0.05, YF + 2, Z0 + sbz, X0 + W * 0.2, YF + D * 0.22, Z0 + sbz + 100); a.box(cx - 60, YB - D * 0.3, Z0 + sbz, cx + 60, YB - D * 0.06, Z0 + sbz + 150); }
      else { a.box(cx - hw0 - 40, cy - hw0 - 40, Z0, cx + hw0 + 40, cy + hw0 + 40, bz); }
      const hw = (f) => lerp(hw0, hw1, f), zz = (f) => lerp(bz + 0, tz, f);
      const C = (f) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => [cx + sx * hw(f), cy + sy * hw(f), zz(f)]);
      for (let i = 0; i < 4; i++) a.tube([C(0)[i], C(1)[i]], [14, 9], 8);
      for (let k = 0; k <= nb; k++) { const f = k / nb, c = C(f); for (let i = 0; i < 4; i++) a.tube([c[i], c[(i + 1) % 4]], [5, 5], 4); if (k < nb) { const c2 = C((k + 1) / nb); for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; a.tube([c[i], c2[j]], [3, 3], 4); a.tube([c[j], c2[i]], [3, 3], 4); } } }
      a.box(cx - hw1 * 1.1, cy - hw1 * 0.6, tz, cx + hw1 * 1.1, cy + hw1 * 0.6, tz + H * 0.03); for (let k = 0; k < 5; k++) { a.xcyl(cx - hw1 * 0.9 + k * hw1 * 0.45, cx - hw1 * 0.9 + k * hw1 * 0.45 + 10, cy, tz + H * 0.03 + 14, 14, 10); } a.box(cx - hw1 * 0.5, cy - hw1 * 0.5, tz + H * 0.03, cx + hw1 * 0.5, cy + hw1 * 0.5, Z1);
      const rz = zz(0.66), rh = hw(0.66); a.box(cx - rh - 20, cy - rh - 20, rz, cx + rh + 20, cy + rh + 20, rz + 6); for (let k = 0; k < 6; k++) a.box(cx - rh, cy - rh * 0.8 + k * rh * 0.3, rz + 6, cx + rh * 0.4, cy - rh * 0.8 + k * rh * 0.3 + 5, rz + 40);
      rail(a, cx - rh - 20, cy - rh - 20, cx + rh + 20, cy - rh - 20, rz + 6, rz + 50, 3, 5, 2); rail(a, cx - rh - 20, cy + rh + 20, cx + rh + 20, cy + rh + 20, rz + 6, rz + 50, 3, 5, 2);
      const ly = cy + hw(0) + 6; for (const s of [-1, 1]) a.tube([[cx + s * 12, ly, bz], [cx + s * 12, cy + hw(0.8) + 6, zz(0.8)]], [2.5, 2.5], 4); for (let k = 0; k < 40; k++) { const f = k / 40 * 0.8; a.xcyl(cx - 12, cx + 12, cy + hw(f) + 6, zz(f), 1.6, 4); }
      if (v.sub) { a.box(cx + hw0 * 0.55, cy - hw0 - 120, Z0 + sbz, cx + hw0 + 60, cy - hw0 - 20, Z0 + sbz + 120); }
      a.rect(cx - hw0, cy - hw0, cx + hw0, cy + hw0); a.rect(cx - hw1, cy - hw1, cx + hw1, cy + hw1, 'EQUIP-DETAIL'); a.rect(cx - rh, cy - rh, cx + rh, cy + rh, 'EQUIP-DETAIL'); if (v.sub) a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
      a.log('Added the tapered four-leg lattice mast in ' + nb + ' bays, crown block with sheaves, racking platform with fingers and rail, caged ladder' + (v.sub ? ', substructure with rig floor, V-door gap and hut' : ' and base frame') + ' (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic offshore accommodation module',
    desc: (v) => `Offshore accommodation module, ${v.tiers} tiers, ${v.ln} ft long: a stacked steel block with window bands on each tier, entrance doors, a deck stair tower at the end with landings, roof ventilation units, a satellite dome, two lifeboat davit pads and a helicopter-approach light mast.`,
    vs: [['2 tiers, 40 ft', 288, 480, 220, 0, { tiers: 2, ln: 40 }], ['3 tiers, 60 ft', 336, 720, 330, 0, { tiers: 3, ln: 60 }], ['4 tiers, 90 ft', 400, 1080, 440, 0, { tiers: 4, ln: 90 }]],
    build: (a0, v) => { const a = sc(a0, 10);
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, th = (H * 0.92) / v.tiers, bw = W * 0.7, sx = bw / 2;
      a.box(cx - bw / 2 - 20, YF + D * 0.04, Z0, cx + bw / 2 + 20, YB - D * 0.04, Z0 + 14);
      for (let t = 0; t < v.tiers; t++) { const z0 = Z0 + 14 + t * th; a.box(cx - sx, YF + D * 0.06, z0, cx + sx, YB - D * 0.06, z0 + th - 4); paneBand(a, cx, sx, YF + D * 0.1, YB - D * 0.1, z0 + th * 0.35, z0 + th * 0.78, m.round(v.ln / 6), 12, 8); for (const y of [YF + D * 0.5]) a.box(cx + sx - 2, y - 24, z0 + 4, cx + sx + 8, y + 24, z0 + th * 0.8); const nw = m.round(v.ln / 10); for (let k = 0; k < nw; k++) { const x0 = cx - sx + (2 * sx * (k + 0.15)) / nw, x1 = cx - sx + (2 * sx * (k + 0.85)) / nw; if (t > 0 || k !== (nw >> 1)) a.box(x0, YF + D * 0.06 - 5, z0 + th * 0.38, x1, YF + D * 0.06 + 2, z0 + th * 0.76); else a.box(x0, YF + D * 0.06 - 5, z0 + 6, x1, YF + D * 0.06 + 2, z0 + th * 0.7); } a.rect(cx - sx, YF + D * 0.06, cx + sx, YB - D * 0.06, 'EQUIP-DETAIL'); if (t) a.box(cx - sx - 6, YF + D * 0.06, z0 - 6, cx + sx + 6, YB - D * 0.06, z0 + 2); }
      const rz = Z0 + 14 + v.tiers * th - 4; for (let k = 0; k < 3; k++) a.box(cx - sx * 0.6 + k * sx * 0.5, cy - D * 0.12, rz, cx - sx * 0.6 + k * sx * 0.5 + sx * 0.4, cy + D * 0.1, rz + th * 0.2);
      a.ell(cx + sx * 0.4, YF + D * 0.18, rz + 20, 48, 48, 34, 10, 6); a.cyl(cx + sx * 0.4, YF + D * 0.18, rz, rz + 20, 20, 8);
      for (const s of [-1, 1]) { a.box(cx + s * sx * 0.5 - 40, YB - D * 0.18, rz, cx + s * sx * 0.5 + 40, YB - D * 0.08, rz + 6); a.tube([[cx + s * sx * 0.5, YB - D * 0.13, rz + 6], [cx + s * sx * 0.5, YB - D * 0.13, rz + 70]], [6, 5], 5); a.tube([[cx + s * sx * 0.5, YB - D * 0.13, rz + 70], [cx + s * sx * 0.5 + s * 40, YB - D * 0.13, rz + 40]], [4, 3], 4); }
      a.tube([[cx - sx * 0.7, cy, rz], [cx - sx * 0.7, cy, Z1]], [6, 4], 6); a.ell(cx - sx * 0.7, cy, Z1, 9, 9, 9, 6, 4);
      const stx = cx + sx + 40, stw = 70; for (let t = 0; t <= v.tiers; t++) { const z = Z0 + 14 + t * th - 4; if (t > 0) a.box(stx - 10, YB - D * 0.06 - 150, z - 6, stx + stw, YB - D * 0.06, z); }
      for (let t = 0; t < v.tiers; t++) { const z0 = Z0 + 14 + t * th; for (let k = 0; k < 8; k++) a.box(stx + stw * 0.1, YB - D * 0.06 - 140 + (k * 130) / 8, z0 + (k * th) / 8, stx + stw * 0.9, YB - D * 0.06 - 140 + ((k + 1) * 130) / 8 - 2, z0 + ((k + 1) * th) / 8 - 2); a.tube([[stx + stw, YB - D * 0.06 - 150, z0 + th * 0.2], [stx + stw, YB - D * 0.06, z0 + th * 0.2 + th * 0.8]], [3, 3], 4); }
      a.rect(stx - 10, YB - D * 0.06 - 150, stx + stw, YB - D * 0.06, 'EQUIP-DETAIL'); a.rect(cx - sx, YF + D * 0.06, cx + sx, YB - D * 0.06);
      a.log('Added the stacked ' + v.tiers + '-tier block with window bands, doors, the stair tower with landings, roof ventilation units, satellite dome, davit pads and the light mast (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic pipeline end termination',
    desc: (v) => `Pipeline end termination for ${v.dn} in pipe: a flat mudmat with skirts, a bolted tubular frame, a pipe hub with a clamp connector and a bend, two lifting padeyes, a guide funnel at the stab end and a protection cover of ${v.bars} bars over the connector.`,
    vs: [['8 in pipe', 96, 120, 54, 0, { dn: 8, bars: 4 }], ['12 in pipe', 120, 156, 66, 0, { dn: 12, bars: 5 }], ['16 in pipe', 150, 200, 80, 0, { dn: 16, bars: 6 }]],
    build: (a0, v) => { const a = sc(a0, 4);
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pr = v.dn * I / 2 * 0.9, pz = Z0 + H * 0.35;
      a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.06); a.box(X0, YF, Z0 - 0, X1, YF + 6, Z0 + H * 0.14); a.box(X0, YB - 6, Z0, X1, YB, Z0 + H * 0.14); a.rect(X0, YF, X1, YB);
      for (const s of [-1, 1]) for (const f of [0.15, 0.85]) a.tube([[cx + s * W * 0.34, YF + D * f, Z0 + H * 0.06], [cx + s * W * 0.34, YF + D * f, Z0 + H * 0.58]], [7, 7], 6);
      for (const s of [-1, 1]) a.tube([[cx + s * W * 0.34, YF + D * 0.15, Z0 + H * 0.58], [cx + s * W * 0.34, YF + D * 0.85, Z0 + H * 0.58]], [6, 6], 6); a.tube([[cx - W * 0.34, YF + D * 0.5, Z0 + H * 0.58], [cx + W * 0.34, YF + D * 0.5, Z0 + H * 0.58]], [6, 6], 6);
      a.tube([[cx, YB - 4, pz], [cx, YF + D * 0.55, pz]], [pr, pr], 12); a.cyl(cx, YF + D * 0.5, pz - pr * 0, pz + 0, 1, 4); a.ycyl(YF + D * 0.4, YF + D * 0.52, cx, pz, pr * 1.3, 16); a.ycyl(YF + D * 0.36, YF + D * 0.4, cx, pz, pr * 1.55, 16); a.ycyl(YF + D * 0.52, YF + D * 0.56, cx, pz, pr * 1.55, 16);
      a.ycyl(YF + D * 0.12, YF + D * 0.36, cx, pz, pr * 0.95, 14); a.cone(cx, YF + D * 0.12, pz, pz + 1, 1, 1, 4); a.tube([[cx, YF + D * 0.36, pz], [cx, YF + D * 0.12, pz]], [pr * 0.95, pr * 1.2], 14);
      for (let k = 0; k < 6; k++) { const t = (k / 6) * TAU; a.xcyl(cx - 3, cx + 3, YF + D * 0.38, pz, 1, 3); a.ycyl(YF + D * 0.36, YF + D * 0.4, cx + m.cos(t) * pr * 1.4, pz + m.sin(t) * pr * 1.4, 4, 5); }
      for (let k = 0; k < v.bars; k++) { const x = cx - W * 0.3 + (W * 0.6 * k) / (v.bars - 1); a.tube([[x, YF + D * 0.2, Z0 + H * 0.6], [x, YF + D * 0.7, Z0 + H * 0.6]], [4, 4], 4); }
      for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.3, YF + D * 0.2, Z0 + H * 0.58], [cx + s * W * 0.3, YF + D * 0.2, Z1 - 4]], [3, 3], 4); a.tube([[cx + s * W * 0.3, YF + D * 0.7, Z0 + H * 0.58], [cx + s * W * 0.3, YF + D * 0.7, Z1 - 4]], [3, 3], 4); }
      a.tube([[cx - W * 0.3, YF + D * 0.2, Z1 - 4], [cx + W * 0.3, YF + D * 0.2, Z1 - 4]], [4, 4], 4); a.tube([[cx - W * 0.3, YF + D * 0.7, Z1 - 4], [cx + W * 0.3, YF + D * 0.7, Z1 - 4]], [4, 4], 4);
      for (const s of [-1, 1]) { a.box(cx + s * W * 0.4 - 8, YF + D * 0.3 - 8, Z0 + H * 0.6, cx + s * W * 0.4 + 8, YF + D * 0.3 + 8, Z0 + H * 0.66); ring3(a, cx + s * W * 0.4, YF + D * 0.3, Z0 + H * 0.66, 12, 3, 8, 'y'); }
      a.circ(cx, YF + D * 0.45, pr * 1.55, 'EQUIP-DETAIL'); a.line(cx, YB, cx, YF + D * 0.1, 'EQUIP-DETAIL'); a.rect(cx - W * 0.34, YF + D * 0.15, cx + W * 0.34, YF + D * 0.85, 'EQUIP-DETAIL');
      a.log('Added the skirted mudmat, tubular frame, pipe hub with clamp connector and bend, guide funnel, ' + v.bars + '-bar protection cover and lifting padeyes (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic ROV launch cage',
    desc: (v) => `ROV launch cage and tether management system, ${v.sz} in cage: a welded tube frame with an open front, a hinged garage door, a tether drum on a side shelf with a level wind, a lifting bridle of four slings up to a master ring, a skid base and an ROV nose seen inside the frame.`,
    vs: [['60 in cage', 60, 72, 84, 0, { sz: 60 }], ['84 in cage', 84, 96, 110, 0, { sz: 84 }], ['108 in cage', 108, 120, 140, 0, { sz: 108 }]],
    build: (a0, v) => { const a = sc(a0, 2.5);
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, fz = Z1 - H * 0.28, hx = W * 0.4, hy = D * 0.4;
      for (const s of [-1, 1]) a.box(cx + s * hx - 20, YF + D * 0.05, Z0, cx + s * hx + 20, YB - D * 0.05, Z0 + 20); a.tube([[cx - hx, YF + D * 0.1, Z0 + 10], [cx + hx, YF + D * 0.1, Z0 + 10]], [14, 14], 8); a.tube([[cx - hx, YB - D * 0.1, Z0 + 10], [cx + hx, YB - D * 0.1, Z0 + 10]], [14, 14], 8);
      const cp = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => [cx + sx * hx, cy + sy * hy]);
      cp.forEach(([x, y]) => a.tube([[x, y, Z0 + 10], [x, y, fz]], [14, 14], 8));
      for (const z of [Z0 + 10, fz]) for (let i = 0; i < 4; i++) { const p = cp[i], q = cp[(i + 1) % 4]; a.tube([[p[0], p[1], z], [q[0], q[1], z]], [11, 11], 6); }
      for (const s of [-1, 1]) { xbay(a, cx + s * hx, cy - hy, cx + s * hx, cy + hy, Z0 + 10, fz, 6); }
      xbay(a, cx - hx, cy + hy, cx + hx, cy + hy, Z0 + 10, fz, 6);
      for (const s of [-1, 1]) a.tube([[cx + s * hx * 0.5, cy - hy, Z0 + 10], [cx + s * hx * 0.5, cy - hy, fz]], [8, 8], 5);
      sup(a, [{ y: cy - hy * 0.9, x: cx, rx: hx * 0.42, z0: Z0 + H * 0.12, z1: Z0 + H * 0.3 }, { y: cy - hy * 0.4, x: cx, rx: hx * 0.55, z0: Z0 + H * 0.1, z1: Z0 + H * 0.34 }, { y: cy + hy * 0.5, x: cx, rx: hx * 0.55, z0: Z0 + H * 0.1, z1: Z0 + H * 0.34 }], { seg: 12, n: 3 });
      a.box(cx - hx - 70, cy - hy * 0.3, Z0 + H * 0.2, cx - hx - 10, cy + hy * 0.3, Z0 + H * 0.24); a.xcyl(cx - hx - 60, cx - hx - 14, cy, Z0 + H * 0.4, H * 0.14, 16); for (const x of [cx - hx - 62, cx - hx - 12]) a.xcyl(x, x + 3, cy, Z0 + H * 0.4, H * 0.18, 16); a.tube([[cx - hx - 30, cy, Z0 + H * 0.26], [cx - hx - 30, cy, Z0 + H * 0.2]], [4, 4], 4); a.box(cx - hx - 60, cy - hy * 0.1, Z0 + H * 0.24, cx - hx - 10, cy + hy * 0.1, Z0 + H * 0.26);
      for (let k = 0; k < 4; k++) { const sx = k % 2 ? 1 : -1, sy = k < 2 ? -1 : 1; a.tube([[cx + sx * hx, cy + sy * hy, fz], [cx, cy, Z1 - H * 0.04]], [2.5, 2.5], 4); }
      ring3(a, cx, cy, Z1 - H * 0.04, 24, 6, 12, 'x'); a.box(cx - 30, cy - 30, fz, cx + 30, cy + 30, fz + H * 0.03);
      a.rect(cx - hx - 70, cy - hy * 0.3, cx - hx - 10, cy + hy * 0.3, 'EQUIP-DETAIL'); a.rect(cx - hx, cy - hy, cx + hx, cy + hy); a.rect(cx - hx * 0.55, cy - hy * 0.9, cx + hx * 0.55, cy + hy * 0.5, 'EQUIP-DETAIL');
      a.log('Added the skid base, welded tube cage with bracing, tether drum on a side shelf, lifting bridle with master ring and the ROV nose inside (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic floating wind semi-submersible',
    desc: (v) => `Floating wind semi-submersible platform, ${v.col} ft columns: three round columns with a flared base each, three pontoon tubes joining the column feet, three upper brace tubes, a turbine tower stub with a base flange on the centre-line column, a boat landing, and ${v.moor} mooring fairleads with chain stoppers.`,
    vs: [['20 ft columns', 800, 700, 640, 0, { col: 20, moor: 3 }], ['30 ft columns', 1100, 960, 800, 0, { col: 30, moor: 3 }], ['40 ft columns', 1500, 1300, 960, 0, { col: 40, moor: 6 }]],
    build: (a0, v) => { const a = sc(a0, 4);
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cr = v.col * I / 2, fz = Z0 + H * 0.18, tz = Z0 + H * 0.62;
      const cs = [[cx - W * 0.5 + cr + 10, YB - cr - 10], [cx + W * 0.5 - cr - 10, YB - cr - 10], [cx, YF + cr + 10]];
      cs.forEach(([x, y]) => { a.cone(x, y, Z0, fz, cr * 1.25, cr * 1.1, 24); a.tube([[x, y, fz], [x, y, tz]], [cr, cr], 24); a.cyl(x, y, tz, tz + 12, cr * 1.04, 24); a.circ(x, y, cr, 'EQUIP'); a.circ(x, y, cr * 1.25, 'EQUIP-DETAIL'); });
      for (let i = 0; i < 3; i++) { const p = cs[i], q = cs[(i + 1) % 3]; a.tube([[p[0], p[1], Z0 + H * 0.06], [q[0], q[1], Z0 + H * 0.06]], [cr * 0.4, cr * 0.4], 12); a.tube([[p[0], p[1], tz - 20], [q[0], q[1], tz - 20]], [cr * 0.16, cr * 0.16], 8); const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; a.tube([[p[0], p[1], Z0 + H * 0.06], [mx, my, tz - 20]], [cr * 0.12, cr * 0.1], 6); }
      const tcx = cx, tcy = cy + 0; const col3 = cs[2]; const pcx = (cs[0][0] + cs[1][0]) / 2, pcy = (cs[0][1] + cs[1][1]) / 2;
      for (let i = 0; i < 3; i++) { const p = cs[i]; a.tube([[p[0], p[1], tz + 12], [pcx * 0.5 + p[0] * 0.5 * 0 + (cx) * 0.5 + 0, cy + 0, tz + H * 0.14]], [cr * 0.08, cr * 0.08], 6); }
      a.tube([[col3[0], col3[1], tz + 12], [col3[0], col3[1], Z1 - 20]], [cr * 0.65, cr * 0.45], 16); a.cyl(col3[0], col3[1], tz + 12, tz + 30, cr * 0.85, 16); for (let k = 0; k < 10; k++) { const t = (k / 10) * TAU; a.cyl(col3[0] + m.cos(t) * cr * 0.72, col3[1] + m.sin(t) * cr * 0.72, tz + 30, tz + 44, 4, 5); }
      cs.forEach(([x, y], i) => { for (let k = 0; k < v.moor / 3 + (i === 2 ? 0 : 0); k++) { const dir = i === 2 ? [0, -1] : [i === 0 ? -1 : 1, 0.4]; const l = m.hypot(dir[0], dir[1]); a.box(x + dir[0] / l * cr * 1.15 - 18, y + dir[1] / l * cr * 1.15 - 18, fz - 40, x + dir[0] / l * cr * 1.15 + 18, y + dir[1] / l * cr * 1.15 + 18, fz + 10); a.ell(x + dir[0] / l * cr * 1.18, y + dir[1] / l * cr * 1.18, fz + 10, 14, 14, 14, 6, 4); } });
      a.box(cx - 70, YF + cr * 2.3, fz + 40, cx + 70, YF + cr * 2.3 + 100, fz + 48); a.tube([[cx, YF + cr * 2.3, fz + 48], [cx, YF + cr * 1.8, fz + 80]], [4, 4], 4);
      a.line(cs[0][0], cs[0][1], cs[1][0], cs[1][1], 'EQUIP-DETAIL'); a.line(cs[1][0], cs[1][1], cs[2][0], cs[2][1], 'EQUIP-DETAIL'); a.line(cs[2][0], cs[2][1], cs[0][0], cs[0][1], 'EQUIP-DETAIL');
      a.log('Added three round columns with flared feet, pontoon and upper brace tubes, the tower stub with flange and bolts, boat landing and mooring fairleads with chain stoppers (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic offshore met mast',
    desc: (v) => `Offshore meteorological mast, ${v.ft} ft: a triangular lattice mast on a deck, ${v.arms} sensor arms with cup anemometers and vanes at stepped heights, a ladder, a top lightning rod and light, a boat landing and an equipment cabinet.`,
    vs: [['100 ft', 160, 160, 1200, 0, { ft: 100, arms: 3 }], ['150 ft', 200, 200, 1800, 0, { ft: 150, arms: 4 }], ['200 ft', 240, 240, 2400, 0, { ft: 200, arms: 5 }]],
    build: (a0, v) => { const a = sc(a0, 10);
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, dz = Z0 + H * 0.1, mw0 = W * 0.2, mw1 = W * 0.05, tz = Z1 - H * 0.04, nb = m.round(v.ft / 12);
      a.tube([[cx, cy, Z0], [cx, cy, dz]], [W * 0.14, W * 0.12], 16); a.cyl(cx, cy, dz - 6, dz, W * 0.2, 16); a.box(X0, YF, dz, X1, YB, dz + 12); a.rect(X0, YF, X1, YB);
      const tri = (f) => { const r = lerp(mw0, mw1, f), z = lerp(dz + 12, tz, f); return [0, 1, 2].map((i) => [cx + m.cos((i / 3) * TAU + 1.57) * r, cy + m.sin((i / 3) * TAU + 1.57) * r, z]); };
      for (let i = 0; i < 3; i++) a.tube([tri(0)[i], tri(1)[i]], [8, 5], 6);
      for (let k = 0; k <= nb; k++) { const f = k / nb, c = tri(f); for (let i = 0; i < 3; i++) a.tube([c[i], c[(i + 1) % 3]], [3, 3], 4); if (k < nb) { const c2 = tri((k + 1) / nb); for (let i = 0; i < 3; i++) a.tube([c[i], c2[(i + 1) % 3]], [2.5, 2.5], 4); } }
      for (let k = 0; k < v.arms; k++) { const f = 0.3 + (0.6 * k) / m.max(v.arms - 1, 1), r = lerp(mw0, mw1, f), z = lerp(dz + 12, tz, f), dir = k % 2 ? 1 : -1; a.tube([[cx, cy, z], [cx + dir * (r + 90), cy, z]], [4, 3], 5); a.tube([[cx + dir * (r + 90), cy, z], [cx + dir * (r + 90), cy, z + 28]], [2, 2], 4); for (let j = 0; j < 3; j++) { const t = (j / 3) * TAU; a.tube([[cx + dir * (r + 90), cy, z + 28], [cx + dir * (r + 90) + m.cos(t) * 14, cy + m.sin(t) * 14, z + 28]], [2, 2], 3); a.ell(cx + dir * (r + 90) + m.cos(t) * 14, cy + m.sin(t) * 14, z + 28, 4, 4, 4, 5, 3); } a.tube([[cx - dir * r * 0.4, cy, z], [cx - dir * (r + 70), cy, z]], [3, 3], 4); prismX(a, [[cy - 3, z], [cy + 3, z], [cy + 3, z + 18], [cy - 3, z + 24]], cx - dir * (r + 70) - 1, cx - dir * (r + 70) + 1); }
      for (const s of [-1, 1]) a.tube([[cx + s * 7, cy + mw0 * 0.5 + 8, dz + 12], [cx + s * 7, cy + mw0 * 0.1, tz * 0.7 + Z0 * 0.3]], [1.8, 1.8], 4);
      a.box(cx - 24, cy + mw0 * 0.3, Z0 + H * 0.45, cx + 24, cy + mw0 * 0.7, Z0 + H * 0.45 + 6);
      a.tube([[cx, cy, tz], [cx, cy, Z1]], [3, 1.5], 5); a.ell(cx, cy, tz + 6, 6, 6, 6, 6, 4);
      a.box(X1 - W * 0.32, YB - D * 0.34, dz + 12, X1 - W * 0.08, YB - D * 0.1, dz + 12 + H * 0.045); a.box(cx - W * 0.1, YF - 0, Z0 + H * 0.02, cx + W * 0.1, YF + D * 0.16, Z0 + H * 0.045); a.tube([[cx, YF + D * 0.04, Z0 + H * 0.045], [cx, YF + D * 0.04, dz]], [4, 4], 4);
      rail(a, X0, YF + 6, X1, YF + 6, dz + 12, dz + 12 + H * 0.045, 2, 5, 2);
      a.circ(cx, cy, mw0, 'EQUIP'); a.circ(cx, cy, mw1, 'EQUIP-DETAIL'); a.rect(X1 - W * 0.32, YB - D * 0.34, X1 - W * 0.08, YB - D * 0.1, 'EQUIP-DETAIL');
      a.log('Added the base column and deck, triangular lattice mast with zig-zag bracing, ' + v.arms + ' sensor arms with cup anemometers and vanes, ladder, lightning rod and light, boat landing and cabinet (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic riser bend stiffener',
    desc: (v) => `Riser bend stiffener, ${v.ft} ft long, standing upright: a tapered polymer cone with ${v.ribs} moulded ring grooves, a steel mounting flange with eight bolts at the large end, a short steel collar and a riser pipe stub passing through the centre and out of the small end with a clamp ring.`,
    vs: [['4 ft', 36, 36, 56, 0, { ft: 4, ribs: 6 }], ['6 ft', 44, 44, 84, 0, { ft: 6, ribs: 9 }], ['8 ft', 52, 52, 108, 0, { ft: 8, ribs: 12 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = W * 0.36;
      a.cyl(cx, cy, Z0, Z0 + H * 0.05, W * 0.5, 24); for (let k = 0; k < 8; k++) { const t = (k / 8) * TAU + 0.2; a.cyl(cx + m.cos(t) * W * 0.43, cy + m.sin(t) * W * 0.43, Z0 + H * 0.05, Z0 + H * 0.08, W * 0.03, 6); a.circ(cx + m.cos(t) * W * 0.43, cy + m.sin(t) * W * 0.43, W * 0.03, 'EQUIP-DETAIL'); }
      a.cyl(cx, cy, Z0 + H * 0.05, Z0 + H * 0.13, W * 0.4, 24);
      a.cone(cx, cy, Z0 + H * 0.13, Z1 - H * 0.06, R, R * 0.22, 24);
      for (let k = 1; k <= v.ribs; k++) { const f = k / (v.ribs + 1), z = Z0 + H * 0.13 + f * (H * 0.81), r = lerp(R, R * 0.22, f); a.cyl(cx, cy, z, z + 4, r * 1.04, 24); }
      a.tube([[cx, cy, Z0 - 0 + 2], [cx, cy, Z1]], [W * 0.075, W * 0.075], 14); a.cyl(cx, cy, Z1 - H * 0.08, Z1 - H * 0.04, R * 0.3, 14); a.cyl(cx, cy, Z1 - H * 0.04, Z1, R * 0.22, 14);
      a.circ(cx, cy, W * 0.5, 'EQUIP'); a.circ(cx, cy, R, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.075, 'EQUIP-DETAIL');
      a.log('Added the bolted flange, steel collar, tapered ribbed polymer cone, the riser pipe stub through the centre and the clamp ring (plan and 3D).');
    } }),

  fam({ cat: 'marine/offshore', title: 'Generic subsea drilling template',
    desc: (v) => `Subsea drilling template with ${v.slots} well slots: a rectangular base of welded tube beams on four levelling mudmats, ${v.slots} guide funnels with conductor sleeves on a grid, a top deck of cross bars, a central manifold run, corner guideposts and two lifting padeyes.`,
    vs: [['4 slots', 240, 240, 100, 0, { slots: 4, c: 2, r: 2 }], ['6 slots', 330, 240, 100, 0, { slots: 6, c: 3, r: 2 }], ['9 slots', 360, 360, 110, 0, { slots: 9, c: 3, r: 3 }]],
    build: (a0, v) => { const a = sc(a0, 12);
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bz = Z0 + H * 0.12, tz = Z0 + H * 0.58, hx = W * 0.44, hy = D * 0.44;
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { a.box(cx + sx * hx - 40, cy + sy * hy - 40, Z0, cx + sx * hx + 40, cy + sy * hy + 40, Z0 + H * 0.06); a.tube([[cx + sx * hx, cy + sy * hy, Z0 + H * 0.06], [cx + sx * hx, cy + sy * hy, Z1 - H * 0.08]], [6, 5], 6); a.cone(cx + sx * hx, cy + sy * hy, Z1 - H * 0.08, Z1, 6, 14, 8); a.circ(cx + sx * hx, cy + sy * hy, 40, 'EQUIP-DETAIL'); }
      for (const z of [bz, tz]) { a.tube([[cx - hx, cy - hy, z], [cx + hx, cy - hy, z]], [7, 7], 6); a.tube([[cx - hx, cy + hy, z], [cx + hx, cy + hy, z]], [7, 7], 6); a.tube([[cx - hx, cy - hy, z], [cx - hx, cy + hy, z]], [7, 7], 6); a.tube([[cx + hx, cy - hy, z], [cx + hx, cy + hy, z]], [7, 7], 6); }
      for (const s of [-1, 1]) { a.tube([[cx + s * hx, cy - hy, bz], [cx + s * hx, cy + hy, tz]], [4, 4], 4); a.tube([[cx + s * hx, cy + hy, bz], [cx + s * hx, cy - hy, tz]], [4, 4], 4); }
      for (let i = 0; i < v.c; i++) for (let j = 0; j < v.r; j++) { const x = cx + (v.c === 1 ? 0 : (i / (v.c - 1) - 0.5) * hx * 1.3), y = cy + (v.r === 1 ? 0 : (j / (v.r - 1) - 0.5) * hy * 1.2); a.tube([[x, y, bz], [x, y, tz + 20]], [14, 14], 12); a.cone(x, y, tz + 20, tz + H * 0.18, 14, 34, 14); a.circ(x, y, 34, 'EQUIP'); a.circ(x, y, 14, 'EQUIP-DETAIL'); a.cyl(x, y, bz - 4, bz + 6, 22, 12); }
      for (let j = 0; j < v.r; j++) { const y = cy + (v.r === 1 ? 0 : (j / (v.r - 1) - 0.5) * hy * 1.2); a.tube([[cx - hx, y, tz], [cx + hx, y, tz]], [5, 5], 5); }
      for (let i = 0; i < v.c; i++) { const x = cx + (v.c === 1 ? 0 : (i / (v.c - 1) - 0.5) * hx * 1.3); a.tube([[x, cy - hy, tz], [x, cy + hy, tz]], [5, 5], 5); }
      a.tube([[cx - hx * 0.6, cy, bz + H * 0.14], [cx + hx * 0.6, cy, bz + H * 0.14]], [9, 9], 8);
      for (const s of [-1, 1]) { a.box(cx + s * hx * 0.5 - 8, cy - 8, tz, cx + s * hx * 0.5 + 8, cy + 8, tz + H * 0.06); ring3(a, cx + s * hx * 0.5, cy, tz + H * 0.06, 12, 3, 8, 'y'); }
      a.rect(cx - hx, cy - hy, cx + hx, cy + hy); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
      a.log('Added the tube-beam base on four mudmats, ' + v.slots + ' guide funnels with conductor sleeves, the top deck bars, manifold run, corner guideposts and padeyes (plan and 3D).');
    } }),
];
export default FAMS;

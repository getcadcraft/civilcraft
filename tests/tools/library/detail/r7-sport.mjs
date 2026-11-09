/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, sport: 150 more variants. Courts and fields, sports equipment, fitness equipment, venue items. Original geometry; generic shapes, no brand, team or league. */
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
function ellRing(a, cx, cy, cz, rx, rz, r, n = 28, sides = 6) { const p = []; for (let i = 0; i <= n; i++) { const t = (i / n) * 2 * PI; p.push([cx + rx * m.cos(t), cy, cz + rz * m.sin(t)]); } a.tube(p, p.map(() => r), sides); }
/** a dome of revolution about the Z axis: radius R, height H, from z0; circular section */
function dome(a, cx, cy, z0, R, H, n = 7, seg_ = 20) { const pts = [], rs = []; for (let i = 0; i <= n; i++) { const th = (i / n) * 82 * PI / 180; pts.push([cx, cy, z0 + H * m.sin(th)]); rs.push(R * m.cos(th)); } a.tube(pts, rs, seg_); }
function domeRib(a, cx, cy, z0, R, H, phi, r = 6, n = 7) { const p = []; for (let i = 0; i <= n; i++) { const th = (i / n) * 80 * PI / 180, rr = R * m.cos(th) * 1.02; p.push([cx + rr * m.cos(phi), cy + rr * m.sin(phi), z0 + H * m.sin(th) * 1.02]); } a.tube(p, p.map(() => r), 5); }
function wheelXZ(a, cx, cy, cz, R, tyre, spokes = 12) {
  ring(a, 'xz', cx, cy, cz, R - tyre, tyre, 30, 7); ring(a, 'xz', cx, cy, cz, R - tyre * 2.1, 2.5, 24, 4); a.ycyl(cy - 30, cy + 30, cx, cz, 9, 8);
  for (let i = 0; i < spokes; i++) { const t = (i / spokes) * 2 * PI; a.tube([[cx, cy + (i % 2 ? 12 : -12), cz], [cx + m.cos(t) * (R - tyre * 2.1), cy, cz + m.sin(t) * (R - tyre * 2.1)]], [1.1, 1.1], 4); }
  a.rect(cx - R, cy - tyre, cx + R, cy + tyre, 'EQUIP-DETAIL');
}
/** a stadium-shaped convex polygon (rounded ends) from x0 to x1, half width w, n points per end */
function stadium(x0, x1, w, cy, n = 7) { const p = []; for (let i = 0; i <= n; i++) { const t = -PI / 2 + (PI * i) / n; p.push([x1 - w + w * m.cos(t), cy + w * m.sin(t)]); } for (let i = 0; i <= n; i++) { const t = PI / 2 + (PI * i) / n; p.push([x0 + w + w * m.cos(t), cy + w * m.sin(t)]); } return p; }
function up(a, x, y, z0, z1, s = 38) { a.box(x - s / 2, y - s / 2, z0, x + s / 2, y + s / 2, z1); }
/** a pad (cushion): box with rounded ends along X */
function pad(a, x0, y0, z0, x1, y1, z1) { a.box(x0, y0, z0, x1, y1, z1 - 8); a.box(x0 + 6, y0 + 6, z1 - 10, x1 - 6, y1 - 6, z1); }
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const onSlab = (a, t, fn) => { const s = a.Z0; a.Z0 += t; fn(); a.Z0 = s; };
/** square (side s) rotated 45 degrees about (x,y) */
const diamond = (x, y, s) => [[x, y - s * 0.7071], [x + s * 0.7071, y], [x, y + s * 0.7071], [x - s * 0.7071, y]];
/** a goal frame opening toward the front (-Y): posts at +-hw on the line y0, crossbar at gh, net depth dBase at the ground and dTop at the top (mm) */
function goalFrame(a, y0, hw, gh, dBase, dTop, o = {}) {
  const Z0 = a.Z0, t = o.t ?? 38, yb = y0 + dBase, yt = y0 + dTop, zt = Z0 + gh * (o.topF ?? 0.9), ns = o.ns ?? 7;
  for (const s of [-1, 1]) {
    a.tube([[s * hw, y0, Z0 + 20], [s * hw, y0, Z0 + gh]], [t, t], 8);
    a.tube([[s * hw, y0, Z0 + gh], [s * hw, yt, zt]], [t * 0.7, t * 0.7], 6);
    a.tube([[s * hw, yt, zt], [s * hw, yb, Z0 + 20]], [t * 0.7, t * 0.7], 6);
    a.tube([[s * hw, y0, Z0 + 20], [s * hw, yb, Z0 + 20]], [t * 0.7, t * 0.7], 6);
    a.circ(s * hw, y0, t, 'EQUIP');
  }
  a.tube([[-hw, y0, Z0 + gh], [hw, y0, Z0 + gh]], [t, t], 8); a.tube([[-hw, yt, zt], [hw, yt, zt]], [t * 0.7, t * 0.7], 6); a.tube([[-hw, yb, Z0 + 20], [hw, yb, Z0 + 20]], [t * 0.7, t * 0.7], 6);
  const net = o.net ?? 1;
  if (net) {
    strands(a, [-hw, yt, zt], [hw, yt, zt], [hw, yb, Z0 + 20], [-hw, yb, Z0 + 20], ns * 2, 5, 2.2);
    for (const s of [-1, 1]) strands(a, [s * hw, y0, Z0 + gh], [s * hw, yt, zt], [s * hw, yb, Z0 + 20], [s * hw, y0, Z0 + 20], 4, 4, 2.2);
    strands(a, [-hw, y0, Z0 + gh], [hw, y0, Z0 + gh], [hw, yt, zt], [-hw, yt, zt], ns * 2, 3, 2.2);
  }
  a.line(-hw, y0, hw, y0, 'EQUIP'); a.rect(-hw, y0, hw, yb, 'EQUIP-DETAIL');
}
/** a sports stump set: three stumps with two bails at (x,y), facing along y */
function stumps(a, x, y, z0, h = 711) {
  for (let i = -1; i <= 1; i++) a.cyl(x + i * 114, y, z0, z0 + h, 19, 8);
  for (const s of [-0.5, 0.5]) a.xcyl(x + s * 114 - 55, x + s * 114 + 55, y, z0 + h + 6, 6, 6);
  a.rect(x - 130, y - 25, x + 130, y + 25, 'EQUIP-DETAIL');
}
function wstack(a, cx, cy, z0, w, d, n, ph, g, pinAt = 2) {
  for (let i = 0; i < n; i++) a.box(cx - w / 2, cy - d / 2, z0 + i * (ph + g), cx + w / 2, cy + d / 2, z0 + i * (ph + g) + ph);
  for (const s of [-1, 1]) a.cyl(cx + s * (w / 2 - 14), cy, z0, z0 + n * (ph + g) + 30, 6, 6);
  a.box(cx - w / 2 - 4, cy - d / 2 - 4, z0 + n * (ph + g), cx + w / 2 + 4, cy + d / 2 + 4, z0 + n * (ph + g) + 24);
  a.ycyl(cy - d / 2 - 40, cy + d / 2, cx, z0 + pinAt * (ph + g) + ph / 2, 7, 6); a.rect(cx - w / 2, cy - d / 2, cx + w / 2, cy + d / 2, 'EQUIP-DETAIL');
}
/** a square steel upright (x,y) between z0 and z1, size s */

// ------------------------------------------------------------------------------------------ courts
const COURTS = [
  fam({ cat: 'sport/courts', ft: true, title: 'Generic pickleball court',
    desc: (v) => `${cap(v.kind)} pickleball court on a hard slab: baselines and sidelines, centre service lines, non-volley zone lines ${v.kz} ft from the net, two net posts with a ${v.nh} in net, top tape and bottom cord.`,
    vs: [['doubles, 44 x 20 ft lines', 30, 60, 40, 0, { kind: 'doubles', cw: 20, cl: 44, kz: 7, nh: 36 }], ['tournament with run-off, 64 x 34 ft', 34, 64, 40, 0, { kind: 'tournament', cw: 20, cl: 44, kz: 7, nh: 36 }],
      ['junior short court, 30 x 14 ft lines', 20, 40, 36, 0, { kind: 'junior', cw: 14, cl: 30, kz: 5, nh: 30 }]],
    build: (a, v) => {
      const Z = slab(a, 30), cw = v.cw * FT, cl = v.cl * FT, hx = cw / 2, cy = a.YF / 2, y0 = cy - cl / 2, y1 = cy + cl / 2, kz = v.kz * FT;
      const L = (p, q, r, s) => seg(a, p, q, r, s, 50, Z, Z + 4);
      L(-hx, y0, hx, y0); L(-hx, y1, hx, y1); L(-hx, y0, -hx, y1); L(hx, y0, hx, y1);
      L(-hx, cy - kz, hx, cy - kz); L(-hx, cy + kz, hx, cy + kz); L(0, y0, 0, cy - kz); L(0, cy + kz, 0, y1);
      onSlab(a, 30, () => netAcross(a, hx + 280, cy, v.nh * IN, v.nh * IN + 30, 32, false, v.nh * IN - 60));
      a.log('Added the slab, boundary, non-volley zone and centre lines, two net posts and the net (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', ft: true, title: 'Generic small-sided football pitch',
    desc: (v) => `${cap(v.kind)} pitch on a ${v.surf} slab: touchlines and goal lines, halfway line, centre circle and spot, ${v.arc ? 'curved penalty areas' : 'penalty areas'}, penalty spots and a ${v.gw} ft wide frame goal with net at each end.`,
    vs: [['five-a-side, 98 x 49 ft', 58, 114, 56, 0, { kind: 'five-a-side', pl: 98, pw: 49, cr: 6, pa: 26, pd: 13, sp: 10, gw: 12, gh: 4, gd: 3.5, surf: 'turf' }],
      ['futsal court, 131 x 66 ft', 74, 147, 84, 0, { kind: 'futsal', pl: 131, pw: 66, cr: 9.8, arc: 19.7, sp: 19.7, gw: 9.8, gh: 6.56, gd: 3.2, surf: 'sports floor' }],
      ['seven-a-side, 180 x 100 ft', 108, 196, 80, 0, { kind: 'seven-a-side', pl: 180, pw: 100, cr: 10, pa: 36, pd: 18, sp: 18, gw: 12, gh: 6, gd: 4.5, surf: 'turf' }]],
    build: (a, v) => {
      const Z = slab(a, 30), hx = (v.pw * FT) / 2, cy = a.YF / 2, y0 = cy - (v.pl * FT) / 2, y1 = cy + (v.pl * FT) / 2, ym = cy, w = 50, hg = (v.gw * FT) / 2;
      const L = (p, q, r, s) => seg(a, p, q, r, s, w, Z, Z + 4);
      L(-hx, y0, hx, y0); L(-hx, y1, hx, y1); L(-hx, y0, -hx, y1); L(hx, y0, hx, y1); L(-hx, ym, hx, ym);
      polySeg(a, arcPts(0, ym, v.cr * FT, 0, 360, 28), w, Z, Z + 4); a.cyl(0, ym, Z, Z + 5, 90, 10);
      for (const [yg, d] of [[y0, 1], [y1, -1]]) {
        if (v.arc) { const r = v.arc * FT; L(-hg, yg + d * r, hg, yg + d * r); polySeg(a, arcPts(hg, yg, r, d > 0 ? 0 : 270, d > 0 ? 90 : 360, 10), w, Z, Z + 4); polySeg(a, arcPts(-hg, yg, r, d > 0 ? 90 : 180, d > 0 ? 180 : 270, 10), w, Z, Z + 4); }
        else { const pa = (v.pa * FT) / 2, pd = v.pd * FT; L(-pa, yg, -pa, yg + d * pd); L(pa, yg, pa, yg + d * pd); L(-pa, yg + d * pd, pa, yg + d * pd); }
        a.cyl(0, yg + d * v.sp * FT, Z, Z + 5, 70, 10);
      }
      onSlab(a, 30, () => {
        goalFrame(a, y0, hg, v.gh * FT, -v.gd * FT, -v.gd * FT * 0.6, { t: 40, ns: 6 });
        goalFrame(a, y1, hg, v.gh * FT, v.gd * FT, v.gd * FT * 0.6, { t: 40, ns: 6 });
      });
      a.log('Added the slab, pitch lines, centre circle, penalty areas and the two net goals (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', title: 'Generic stick-sport goal',
    desc: (v) => `${cap(v.kind)} goal ${v.gw} in wide and ${v.gh} in high: a tube frame of two posts and a crossbar, sloping top rails and a base frame, with a net on the back, sides and top drawn as strands${v.skid ? ' and a pair of skid plates under the posts' : ''}.`,
    vs: [['ice hockey, 72 x 48 in opening', 84, 48, 52, 0, { kind: 'ice hockey', gw: 72, gh: 48, dB: 44, dT: 22, topF: 0.85, skid: true }], ['lacrosse, 72 x 72 in opening', 84, 88, 78, 0, { kind: 'lacrosse', gw: 72, gh: 72, dB: 84, dT: 42, topF: 0.95, skid: false }],
      ['field hockey, 12 x 7 ft opening', 156, 60, 88, 0, { kind: 'field hockey', gw: 144, gh: 84, dB: 48, dT: 40, topF: 0.9, skid: false }]],
    build: (a, v) => {
      const { YF, Z0 } = a, hw = (v.gw * IN) / 2, y0 = YF + 60;
      a.outline(); goalFrame(a, y0, hw, v.gh * IN, v.dB * IN, v.dT * IN, { t: 24, topF: v.topF, ns: 8 });
      if (v.skid) for (const s of [-1, 1]) a.box(s * hw - 60, y0 - 30, Z0, s * hw + 60, y0 + v.dB * IN * 0.9, Z0 + 14);
      a.log('Added the post and crossbar frame, rear frame, base rails and the net on back, sides and top (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', title: 'Generic rugby goalposts',
    desc: (v) => `H-shaped rugby goalposts: two ${v.hFt} ft uprights ${v.wFt} ft apart joined by a crossbar ${v.cb} in above the ground, base sockets and ${v.pad ? 'foam pads wrapped round the lower posts' : 'plain base sleeves'}.`,
    vs: [['club, 40 ft uprights', 252, 36, 490, 0, { hFt: 40, wFt: 18.5, cb: 118, pad: true, r: 62 }], ['school, 30 ft uprights', 252, 36, 372, 0, { hFt: 30, wFt: 18.5, cb: 118, pad: true, r: 55 }], ['junior, 20 ft uprights, 12 ft bar', 168, 30, 250, 0, { hFt: 20, wFt: 12, cb: 96, pad: false, r: 45 }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, y = YF / 2, hw = (v.wFt * FT) / 2, H = v.hFt * FT, zb = Z0 + v.cb * IN; a.outline();
      for (const s of [-1, 1]) {
        a.box(cx + s * hw - 160, y - 160, Z0, cx + s * hw + 160, y + 160, Z0 + 60); a.cyl(cx + s * hw, y, Z0 + 60, Z0 + 500, v.r + 18, 14);
        a.tube([[cx + s * hw, y, Z0 + 500], [cx + s * hw, y, Z0 + H - 4]], [v.r, v.r * 0.8], 12); a.circ(cx + s * hw, y, v.r + 18, 'EQUIP');
        if (v.pad) a.cyl(cx + s * hw, y, Z0 + 60, Z0 + 1800, v.r + 55, 14);
        a.cone(cx + s * hw, y, Z0 + H - 140, Z0 + H, v.r * 0.8 + 6, v.r * 0.8 + 6, 10);
      }
      a.tube([[cx - hw, y, zb], [cx + hw, y, zb]], [v.r * 0.7, v.r * 0.7], 10); a.line(cx - hw, y, cx + hw, y, 'EQUIP-DETAIL');
      a.log('Added the base sockets, two uprights, foam pads and the crossbar (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', ft: true, title: 'Generic baseball diamond',
    desc: (v) => `${cap(v.kind)} infield: a grass slab with a dirt infield, three bases and a home plate, a pitcher's mound with rubber ${v.pitch} ft from the plate, batter's box lines, base and foul lines, and a backstop of tube posts and net strands behind the plate.`,
    vs: [['T-ball, 50 ft bases', 99, 101, 130, 0, { kind: 'T-ball', b: 50, pitch: 30 }], ['youth, 60 ft bases', 113, 115, 130, 0, { kind: 'youth', b: 60, pitch: 46 }], ['full size, 90 ft bases', 155, 157, 130, 0, { kind: 'full size', b: 90, pitch: 60.5 }]],
    build: (a, v) => {
      const Z = slab(a, 30), b = v.b * FT, yh = a.YF + 12 * FT, k = b * 0.7071, w = 80;
      a.prism([[0, yh - 7 * FT], [k + 5 * FT, yh + k], [0, yh + 2 * k + 5 * FT], [-k - 5 * FT, yh + k]], Z, Z + 6);
      a.prism([[-5 * FT, yh - 2 * FT], [-5 * FT, yh - 7 * FT], [5 * FT, yh - 7 * FT], [5 * FT, yh - 2 * FT]], Z, Z + 7);
      const bases = [[k, yh + k], [0, yh + 2 * k], [-k, yh + k]];
      for (const [x, y] of bases) { a.prism(diamond(x, y, 381), Z + 6, Z + 104); a.poly(diamond(x, y, 381)); }
      a.prism([[-215, yh + 110], [215, yh + 110], [215, yh - 110], [0, yh - 215], [-215, yh - 110]].map(([x, y]) => [x, y]), Z + 6, Z + 30);
      for (const [x, y] of [[k, yh + k], [0, yh + 2 * k], [-k, yh + k], [0, yh]]) a.circ(x, y, 150, 'EQUIP-DETAIL');
      seg(a, 0, yh, k, yh + k, w, Z + 6, Z + 10); seg(a, k, yh + k, 0, yh + 2 * k, w, Z + 6, Z + 10); seg(a, 0, yh + 2 * k, -k, yh + k, w, Z + 6, Z + 10); seg(a, -k, yh + k, 0, yh, w, Z + 6, Z + 10);
      const ex = a.X1 - 300; seg(a, 0, yh, m.min(ex, k + 28 * FT), yh + m.min(ex, k + 28 * FT), w, Z + 6, Z + 10); seg(a, 0, yh, -m.min(ex, k + 28 * FT), yh + m.min(ex, k + 28 * FT), w, Z + 6, Z + 10);
      for (const s of [-1, 1]) { a.rect(s * 760 - 610 * 0.5 * 1, yh - 760, s * 760 + 305, yh + 760, 'EQUIP-DETAIL'); }
      const ym = yh + v.pitch * FT; a.cone(0, ym, Z + 6, Z + 260, 2.9 * FT, 0.9 * FT, 20); a.box(-305, ym - 76, Z + 260, 305, ym + 76, Z + 290); a.circ(0, ym, 2.9 * FT, 'EQUIP-DETAIL');
      const R = 3.2 * FT, ys = yh - 1.2 * FT, bh = 3300, pts = [];
      for (let i = 0; i <= 8; i++) { const t = (PI * (0.15 + 0.7 * i / 8)); pts.push([R * 1.0 * m.cos(t) * 2.4, ys - R * 1.5 * m.sin(t) * 0.8]); }
      for (const [x, y] of pts) { a.cyl(x, y, Z, Z + bh, 28, 8); a.circ(x, y, 28, 'EQUIP-DETAIL'); }
      for (let i = 0; i < pts.length - 1; i++) { a.tube([[...pts[i], Z + bh], [...pts[i + 1], Z + bh]], [22, 22], 6); a.tube([[...pts[i], Z + bh * 0.5], [...pts[i + 1], Z + bh * 0.5]], [3, 3], 4); for (let f = 1; f < 4; f++) { const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f / 4, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f / 4; a.tube([[x, y, Z + 20], [x, y, Z + bh]], [2.2, 2.2], 4); } }
      a.log('Added the grass slab, dirt infield, bases, home plate, mound, base and foul lines and the backstop (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', title: 'Generic netball and korfball post',
    desc: (v) => `${v.kind} post ${v.hFt} ft to the ring: ${v.portable ? 'a weighted base with two transport wheels, ' : 'a base plate bolted to the floor, '}a round pole, a short ring arm, a ${v.ring} in ring${v.basket ? ' carrying a cylindrical basket of slats' : ' with a hanging net'}.`,
    vs: [['netball, 10 ft ring, floor plate', 34, 44, 128, 0, { kind: 'Netball', hFt: 10, ring: 15, portable: false }], ['netball, portable on weighted base', 34, 56, 128, 0, { kind: 'Netball', hFt: 10, ring: 15, portable: true }], ['korfball, 11.5 ft basket', 34, 50, 146, 0, { kind: 'Korfball', hFt: 11.5, ring: 16, basket: true }]],
    build: (a, v) => {
      const { Z0, YB, YF, cx } = a, py = YB - 220, zr = Z0 + v.hFt * FT, rr = (v.ring * IN) / 2, ry = py - 150 - rr; a.outline();
      if (v.portable) { a.box(cx - 350, YF + 60, Z0 + 40, cx + 350, YB - 60, Z0 + 150); for (const s of [-1, 1]) a.xcyl(cx + s * 350, cx + s * 350 + s * 40, YB - 120, Z0 + 55, 55, 12); a.rect(cx - 350, YF + 60, cx + 350, YB - 60); }
      else { a.box(cx - 220, py - 220, Z0, cx + 220, py + 220, Z0 + 20); a.circ(cx, py, 220, 'EQUIP'); }
      a.cyl(cx, py, Z0 + 20, zr, 45, 14); a.circ(cx, py, 45, 'EQUIP-DETAIL');
      a.tube([[cx, py, zr - 20], [cx, py - 80, zr], [cx, ry + rr, zr]], [26, 24, 22], 8);
      ring(a, 'xy', cx, ry, zr, rr, 9, 24, 6); a.circ(cx, ry, rr, 'EQUIP-DETAIL');
      if (v.basket) { for (let i = 0; i < 14; i++) { const t = (i / 14) * 2 * PI; a.tube([[cx + m.cos(t) * rr, ry + m.sin(t) * rr, zr], [cx + m.cos(t) * rr, ry + m.sin(t) * rr, zr - 260]], [4, 4], 4); } ring(a, 'xy', cx, ry, zr - 260, rr, 5, 22, 5); }
      else for (let i = 0; i < 12; i++) { const t = (i / 12) * 2 * PI; a.tube([[cx + m.cos(t) * rr, ry + m.sin(t) * rr, zr - 8], [cx + m.cos(t) * rr * 0.5, ry + m.sin(t) * rr * 0.5, zr - 380]], [2.5, 2.5], 4); }
      a.log('Added the base, pole, ring arm, ring and ' + (v.basket ? 'slatted basket' : 'net') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', ft: true, title: 'Generic cricket pitch',
    desc: (v) => `${cap(v.kind)}: a ${v.yd} yard ${v.mat ? 'matting strip on a slab' : 'rolled turf strip'} with a stump set and bails at each end, a popping crease and two return creases at each end, and the width of the strip shown as a darker bed.`,
    vs: [['full length, 22 yard strip', 14, 80, 32, 0, { kind: 'full-length pitch', yd: 22, mat: false }], ['junior, 18 yard strip', 12, 66, 32, 0, { kind: 'junior pitch', yd: 18, mat: false }], ['practice, 20 yard matting strip', 12, 74, 32, 0, { kind: 'practice pitch', yd: 20, mat: true }]],
    build: (a, v) => {
      const Z = slab(a, 30), L = v.yd * 3 * FT, cy = a.YF / 2, y0 = cy - L / 2, y1 = cy + L / 2, hw = 5 * FT;
      a.box(-hw, y0 - 6 * FT / 2, Z, hw, y1 + 6 * FT / 2, Z + 10); a.rect(-hw, y0 - 900, hw, y1 + 900, 'EQUIP-DETAIL');
      if (v.mat) a.box(-1.1 * FT, y0 - 600, Z + 10, 1.1 * FT, y1 + 600, Z + 16);
      for (const [yw, d] of [[y0, 1], [y1, -1]]) {
        stumps(a, 0, yw, Z + 10); const yc = yw + d * 4 * FT, hc = 4.3 * FT / 2 * 1.0;
        seg(a, -hc, yc, hc, yc, 50, Z + 10, Z + 14); seg(a, -hc * 0.5, yw, -hc * 0.5, yw + d * 8 * FT, 40, Z + 10, Z + 14); seg(a, hc * 0.5, yw, hc * 0.5, yw + d * 8 * FT, 40, Z + 10, Z + 14);
        seg(a, -hc, yw, hc, yw, 40, Z + 10, Z + 14);
      }
      a.log('Added the strip, stump sets with bails and the popping and return creases at both ends (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', title: 'Generic table tennis table',
    desc: (v) => `${cap(v.kind)} table tennis table ${v.len} in long: a two-tone top with centre line and edge lines, an apron frame, ${v.fold ? 'two folding leg frames with cross bars and four transport wheels' : 'four steel legs with cross bars and levelling feet'}, and a net with two clamp posts at the middle.`,
    vs: [['full size, 108 in long', 60, 108, 37, 0, { kind: 'full-size', len: 108, wd: 60, th: 30, fold: false }], ['folding with wheels, 108 in long', 60, 108, 37, 0, { kind: 'folding', len: 108, wd: 60, th: 30, fold: true }], ['mini, 72 in long', 36, 72, 33, 0, { kind: 'mini', len: 72, wd: 36, th: 26, fold: false }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, L = v.len * IN, Wd = v.wd * IN, zt = Z0 + v.th * IN, cy = YF / 2, hx = Wd / 2 - 20; a.outline();
      a.box(cx - hx, cy - L / 2 + 10, zt - 24, cx + hx, cy + L / 2 - 10, zt); a.box(cx - hx + 40, cy - L / 2 + 50, zt - 70, cx + hx - 40, cy + L / 2 - 50, zt - 24);
      for (const y of [-1, 1]) a.box(cx - hx, cy + y * (L / 2 - 10) - 12, zt, cx + hx, cy + y * (L / 2 - 10) + 12, zt + 4);
      a.box(cx - 8, cy - L / 2 + 10, zt, cx + 8, cy + L / 2 - 10, zt + 4); for (const s of [-1, 1]) a.box(cx + s * hx - 10, cy - L / 2 + 10, zt, cx + s * hx + 10, cy + L / 2 - 10, zt + 4);
      for (const s of [-1, 1]) { a.cyl(cx + s * (hx + 40), cy, zt, zt + 155, 9, 8); a.box(cx + s * (hx + 10) - 40, cy - 14, zt + 4, cx + s * (hx + 10) + 40, cy + 14, zt + 50); }
      a.box(cx - hx, cy - 4, zt + 60, cx + hx, cy + 4, zt + 152); strands(a, [cx - hx, cy, zt + 8], [cx + hx, cy, zt + 8], [cx + hx, cy, zt + 148], [cx - hx, cy, zt + 148], 22, 4, 1.8); a.box(cx - hx, cy - 5, zt + 140, cx + hx, cy + 5, zt + 156);
      for (const sy of [-1, 1]) { const y = cy + sy * (L / 2 - 180);
        if (v.fold) { a.tube([[cx - hx + 60, y, zt - 70], [cx - hx + 60, y, Z0 + 90]], [20, 20], 8); a.tube([[cx + hx - 60, y, zt - 70], [cx + hx - 60, y, Z0 + 90]], [20, 20], 8); a.tube([[cx - hx + 60, y, Z0 + 90], [cx + hx - 60, y, Z0 + 90]], [18, 18], 8); a.tube([[cx - hx + 60, y, zt - 220], [cx + hx - 60, y, zt - 220]], [14, 14], 8); for (const s of [-1, 1]) { a.xcyl(cx + s * (hx - 60) - 14, cx + s * (hx - 60) + 14, y, Z0 + 56, 56, 12); } }
        else { for (const s of [-1, 1]) { a.tube([[cx + s * (hx - 60), y, zt - 70], [cx + s * (hx - 60), y, Z0 + 12]], [22, 22], 8); a.cyl(cx + s * (hx - 60), y, Z0, Z0 + 14, 30, 8); a.circ(cx + s * (hx - 60), y, 22, 'EQUIP-DETAIL'); } a.tube([[cx - hx + 60, y, Z0 + 250], [cx + hx - 60, y, Z0 + 250]], [12, 12], 6); }
      }
      if (!v.fold) a.tube([[cx, cy - L / 2 + 180, Z0 + 250], [cx, cy + L / 2 - 180, Z0 + 250]], [12, 12], 6);
      a.line(cx - hx, cy, cx + hx, cy, 'EQUIP-DETAIL'); a.log('Added the top with lines, apron, ' + (v.fold ? 'folding leg frames and wheels' : 'legs, cross bars and feet') + ', and the net with clamps (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', ft: true, title: 'Generic walled racket court',
    desc: (v) => `${cap(v.kind)} court ${v.cl} x ${v.cw} ft with a floor and floor lines, a front wall with a tin or marked band, two side walls stepping down to the back, and a back wall drawn as a frame with a glass opening.`,
    vs: [['squash, 32 x 21 ft', 25, 36, 190, 0, { kind: 'squash', cl: 32, cw: 21, hf: 15, hb: 7, tin: 19 }], ['racquetball, 40 x 20 ft', 24, 44, 245, 0, { kind: 'racquetball', cl: 40, cw: 20, hf: 20, hb: 12, tin: 0 }]],
    build: (a, v) => {
      const Z = slab(a, 30), cw = v.cw * FT, cl = v.cl * FT, hx = cw / 2, yb = a.YB - 250, yf = yb - cl, t = 120, hF = v.hf * FT, hB = v.hb * FT;
      a.box(-hx - t, yb, Z, hx + t, yb + t, Z + hF); a.box(-hx, yb - 40, Z + v.tin * IN, hx, yb, Z + v.tin * IN + 30); if (v.tin) a.box(-hx, yb - 20, Z, hx, yb, Z + v.tin * IN);
      for (const s of [-1, 1]) { prismX(a, [[yb + t, Z], [yb + t, Z + hF], [yf, Z + hB], [yf, Z]], s > 0 ? hx : -hx - t, s > 0 ? hx + t : -hx); }
      for (const s of [-1, 1]) a.tube([[s * (hx - 40), yf, Z], [s * (hx - 40), yf, Z + hB + 1200]], [30, 30], 8);
      a.tube([[-hx + 40, yf, Z + hB], [hx - 40, yf, Z + hB]], [30, 30], 8); a.tube([[-hx + 40, yf, Z + hB + 1200], [hx - 40, yf, Z + hB + 1200]], [24, 24], 8); a.tube([[0, yf, Z], [0, yf, Z + hB + 1200]], [22, 22], 8);
      const L = (p, q, r, s) => seg(a, p, q, r, s, 50, Z, Z + 4);
      L(-hx, yb - cl * 0.55, hx, yb - cl * 0.55); L(0, yb - cl * 0.55, 0, yf); L(-hx, yb - cl * 0.55 - 1600, -hx + 1600, yb - cl * 0.55 - 1600); L(-hx + 1600, yb - cl * 0.55, -hx + 1600, yb - cl * 0.55 - 1600); L(hx, yb - cl * 0.55 - 1600, hx - 1600, yb - cl * 0.55 - 1600); L(hx - 1600, yb - cl * 0.55, hx - 1600, yb - cl * 0.55 - 1600);
      a.rect(-hx, yf, hx, yb, 'EQUIP-DETAIL'); a.log('Added the floor lines, front wall with band, stepped side walls and the framed back wall (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', title: 'Generic umpire chair',
    desc: (v) => `${cap(v.kind)} umpire chair with a seat ${v.seat} in above the floor: four sloping legs with cross bracing, a ladder of two rails and rungs, a seat with a backrest, arm rests, a footrest${v.canopy ? ' and an umbrella canopy on a pole' : ''} and a floor base frame.`,
    vs: [['tennis, 72 in seat with umbrella', 44, 50, 124, 0, { kind: 'tennis', seat: 72, canopy: true }], ['volleyball, 60 in seat', 34, 46, 98, 0, { kind: 'volleyball', seat: 60, canopy: false }], ['badminton, 48 in low seat', 30, 40, 80, 0, { kind: 'badminton', seat: 48, canopy: false }]],
    build: (a, v) => {
      const { Z0, YF, YB, cx } = a, zs = Z0 + v.seat * IN, hw = 300, hwT = 230, yb = YB - 150, yt = YB - 480; a.outline();
      for (const sx of [-1, 1]) { a.tube([[cx + sx * hw, yb, Z0 + 20], [cx + sx * hwT, yb - 120, zs]], [26, 24], 8); a.tube([[cx + sx * hw, yb - 450, Z0 + 20], [cx + sx * hwT, yt, zs]], [26, 24], 8); a.tube([[cx + sx * hw, yb, Z0 + 20], [cx + sx * hw, yb - 450, Z0 + 20]], [20, 20], 8); a.tube([[cx + sx * (hw - 30), yb - 30, Z0 + 340], [cx + sx * (hw - 30), yb - 420, Z0 + v.seat * IN * 0.45]], [12, 12], 6); }
      a.tube([[cx - hw, yb, Z0 + 20], [cx + hw, yb, Z0 + 20]], [20, 20], 8); a.tube([[cx - hw, yb - 450, Z0 + 20], [cx + hw, yb - 450, Z0 + 20]], [20, 20], 8);
      a.box(cx - hwT - 40, yt - 40, zs, cx + hwT + 40, yb - 40, zs + 40); a.box(cx - hwT, yb - 40, zs + 40, cx + hwT, yb - 10, zs + 520); a.box(cx - hwT + 30, yb - 55, zs + 130, cx + hwT - 30, yb - 40, zs + 450);
      for (const sx of [-1, 1]) { a.tube([[cx + sx * (hwT + 30), yt, zs + 30], [cx + sx * (hwT + 30), yt - 80, zs + 330], [cx + sx * (hwT + 30), yb - 30, zs + 330]], [14, 14, 14], 6); }
      const lyF = YF + 150, lz = zs - 40;
      for (const sx of [-1, 1]) a.tube([[cx + sx * 220, yt - 40, lz], [cx + sx * 260, lyF, Z0 + 20]], [18, 18], 6);
      const nr = m.max(3, m.round(v.seat / 11)); for (let i = 1; i <= nr; i++) { const f = i / (nr + 1), y = lyF + (yt - 40 - lyF) * f, z = Z0 + 20 + (lz - Z0 - 20) * f; a.xcyl(cx - 240 + 30 * (1 - f), cx + 240 - 30 * (1 - f), y, z, 11, 6); }
      a.box(cx - 280, lyF - 60, Z0, cx + 280, lyF + 40, Z0 + 20);
      a.box(cx - 240, yt - 160, zs - 5, cx + 240, yt - 40, zs + 20);
      if (v.canopy) { a.tube([[cx + 150, yb - 300, zs + 300], [cx + 150, yb - 300, zs + 1050]], [14, 12], 6); dome(a, cx + 150, yb - 300, zs + 1020, 400, 200, 5, 20); a.circ(cx + 150, yb - 300, 400, 'EQUIP-DETAIL'); }
      a.rect(cx - hw, yb - 450, cx + hw, yb, 'EQUIP'); a.rect(cx - 260, lyF, cx + 260, yt - 40, 'EQUIP-DETAIL');
      a.log('Added the sloping legs and bracing, ladder with rungs, seat, backrest, arm rests, footrest' + (v.canopy ? ' and the umbrella canopy' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', ft: true, title: 'Generic athletics field event area',
    desc: (v) => v.kind === 'long' ? 'Long jump area: a raised runway strip with a take-off board and plasticine strip, a sand pit in a timber frame with a rake and a rake rest.' : v.kind === 'high' ? 'High jump area: two uprights with bar pegs and a crossbar, and a stack of landing mattresses with a cover top.' : 'Discus throwing circle: a ring set in the floor with a toe-board, a ground sector line and a C-shaped throwing cage of tall posts with net strands.',
    vs: [['long jump, 60 ft runway and pit', 9, 76, 12, 0, { kind: 'long' }], ['high jump, mattress and uprights', 20, 16, 150, 0, { kind: 'high' }], ['discus circle with C-shaped cage', 26, 26, 160, 0, { kind: 'cage' }]],
    build: (a, v) => {
      const Z = slab(a, 20), { YF, YB } = a;
      if (v.kind === 'long') {
        const hx = 1.2 * FT, yp = YB - 5 * FT, yr = YF + 2 * FT; a.box(-hx, yr, Z, hx, yp, Z + 50); a.rect(-hx, yr, hx, yp, 'EQUIP-DETAIL'); a.box(-hx, yp - 600, Z + 50, hx, yp - 200, Z + 54); a.box(-hx, yp - 200, Z + 50, hx, yp, Z + 60);
        a.box(-hx - 120, yp, Z, hx + 120, YB - 80, Z + 300); a.box(-hx, yp + 50, Z + 300, hx, YB - 130, Z + 306); a.rect(-hx - 120, yp, hx + 120, YB - 80, 'EQUIP');
        for (let i = 0; i < 6; i++) seg(a, -hx, yp + 300 + i * 450, hx, yp + 300 + i * 450, 8, Z + 306, Z + 318);
        a.box(hx + 260, yp + 400, Z, hx + 330, yp + 1400, Z + 5); a.tube([[hx + 295, yp + 400, Z + 5], [hx + 295, yp + 1400, Z + 5]], [10, 10], 6); a.line(-hx, yp, hx, yp, 'EQUIP');
      } else if (v.kind === 'high') {
        const ux = 2000, y = YB - 2800, pad = 4800, mat = 2800;
        for (let i = 0; i < 3; i++) a.box(-pad / 2 + i * 40, y - mat / 2 + i * 40, Z + i * 230, pad / 2 - i * 40, y + mat / 2 - i * 40, Z + (i + 1) * 230);
        a.box(-pad / 2 + 80, y - mat / 2 + 80, Z + 690, pad / 2 - 80, y + mat / 2 - 80, Z + 720); a.rect(-pad / 2, y - mat / 2, pad / 2, y + mat / 2, 'EQUIP');
        for (const s of [-1, 1]) { a.box(s * ux - 200, y + mat / 2 + 420 - 200, Z, s * ux + 200, y + mat / 2 + 420 + 200, Z + 40); a.tube([[s * ux, y + mat / 2 + 420, Z + 40], [s * ux, y + mat / 2 + 420, Z + 2400]], [40, 34], 8); a.circ(s * ux, y + mat / 2 + 420, 40, 'EQUIP-DETAIL'); a.box(s * ux - 30, y + mat / 2 + 420 - 200, Z + 1900, s * ux + 30, y + mat / 2 + 420 - 20, Z + 1925); }
        a.tube([[-ux, y + mat / 2 + 220, Z + 1930], [ux, y + mat / 2 + 220, Z + 1930]], [15, 15], 8);
      } else {
        const cy = YB - 8 * FT, cR = 1250, ringR = 1250;
        a.cyl(0, cy, Z, Z + 6, ringR + 20, 28); a.circ(0, cy, ringR, 'EQUIP'); ring(a, 'xy', 0, cy, Z + 6, ringR, 12, 28, 5);
        a.prism(arcPts(0, cy + ringR + 40, 80, 0, 180, 2).map(([x, y]) => [x, y]).concat([[0, cy + ringR]]), Z, Z + 1);
        a.box(-400, cy - ringR - 160, Z + 6, 400, cy - ringR - 80, Z + 120); a.box(-500, cy - ringR - 80 - 4, Z, 500, cy - ringR + 4, Z + 6);
        const R = 3600, N = 9, hh = 4300, cage = [];
        for (let i = 0; i <= N; i++) { const t = PI * (0.05 + 0.9 * i / N); cage.push([R * 0.87 * m.cos(t), cy + R * 0.5 * (0.35 - m.sin(t))]); }
        for (const [x, y] of cage) { a.cyl(x, y, Z, Z + hh, 42, 8); a.circ(x, y, 42, 'EQUIP-DETAIL'); }
        for (let i = 0; i < cage.length - 1; i++) { a.tube([[...cage[i], Z + hh], [...cage[i + 1], Z + hh]], [20, 20], 6); a.tube([[...cage[i], Z + hh * 0.62], [...cage[i + 1], Z + hh * 0.62]], [3, 3], 4); a.tube([[...cage[i], Z + hh * 0.3], [...cage[i + 1], Z + hh * 0.3]], [3, 3], 4); }
        seg(a, 0, cy, 900, cy + 2100, 30, Z, Z + 4); seg(a, 0, cy, -900, cy + 2100, 30, Z, Z + 4);
      }
      a.log('Added the ' + (v.kind === 'long' ? 'runway, take-off board and sand pit' : v.kind === 'high' ? 'landing mattresses, uprights and crossbar' : 'circle, toe-board and throwing cage') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', ft: true, title: 'Generic cricket practice net lane',
    desc: (v) => `Practice net with ${v.lanes === 1 ? 'one lane' : 'two lanes and a middle net'}, ${v.len} ft long: a matting strip on a slab, steel arch frames at intervals joined by top rails, and net strands on both sides, the roof and the far end, with a stump set at the batter's end.`,
    vs: [['single lane, 60 ft long', 12, 62, 124, 0, { lanes: 1, len: 60, hh: 9.5 }], ['twin lane, 60 ft long', 22, 62, 124, 0, { lanes: 2, len: 60, hh: 9.5 }], ['indoor single lane, 40 ft long', 12, 42, 114, 0, { lanes: 1, len: 40, hh: 8.5 }]],
    build: (a, v) => {
      const Z = slab(a, 30), { YF, YB } = a, L = v.len * FT, y0 = YB - 150 - L, y1 = YB - 150, wl = 10 * FT, hh = v.hh * FT, W = wl * v.lanes, x0 = -W / 2, xs = [];
      for (let i = 0; i <= v.lanes; i++) xs.push(x0 + i * wl);
      for (let i = 0; i < v.lanes; i++) a.box(xs[i] + 1100, y0 + 400, Z, xs[i + 1] - 1100, y1 - 400, Z + 12);
      const nA = m.round(v.len / 10) + 1;
      for (let k = 0; k < nA; k++) { const y = y0 + (L * k) / (nA - 1); for (const x of xs) a.tube([[x, y, Z], [x, y, Z + hh]], [22, 22], 8); a.tube([[xs[0], y, Z + hh], [xs[xs.length - 1], y, Z + hh]], [20, 20], 8); }
      for (const x of xs) { a.tube([[x, y0, Z + hh], [x, y1, Z + hh]], [20, 20], 8); a.tube([[x, y0, Z + hh * 0.5], [x, y1, Z + hh * 0.5]], [10, 10], 6); }
      for (const [x] of [[xs[0]], [xs[xs.length - 1]]]) strands(a, [x, y0, Z], [x, y1, Z], [x, y1, Z + hh], [x, y0, Z + hh], m.round(v.len / 3), 4, 2);
      if (v.lanes === 2) strands(a, [0, y0, Z], [0, y1, Z], [0, y1, Z + hh], [0, y0, Z + hh], m.round(v.len / 3), 4, 2);
      strands(a, [xs[0], y1, Z], [xs[xs.length - 1], y1, Z], [xs[xs.length - 1], y1, Z + hh], [xs[0], y1, Z + hh], 6 * v.lanes, 4, 2);
      strands(a, [xs[0], y0, Z + hh], [xs[xs.length - 1], y0, Z + hh], [xs[xs.length - 1], y1, Z + hh], [xs[0], y1, Z + hh], 4 * v.lanes, m.round(v.len / 3), 2);
      for (let i = 0; i < v.lanes; i++) stumps(a, (xs[i] + xs[i + 1]) / 2, y0 + 700, Z + 12);
      a.rect(x0, y0, x0 + W, y1, 'EQUIP-DETAIL'); a.log('Added the slab and matting, arch frames, rails, net strands and stump sets (plan and 3D).');
    } }),

  fam({ cat: 'sport/courts', ft: true, title: 'Generic bocce and boules court',
    desc: (v) => `${cap(v.kind)}: a ${v.cl} x ${v.cw} ft playing bed of fine gravel inside timber side and end boards on a slab, foul lines and pallino lines, with four balls and a small jack placed on the bed.`,
    vs: [['bocce, 76 x 13 ft', 17, 80, 14, 0, { kind: 'bocce court', cl: 76, cw: 13, bh: 12 }], ['compact bocce, 60 x 10 ft', 14, 64, 14, 0, { kind: 'compact bocce court', cl: 60, cw: 10, bh: 10 }], ['boules terrain, 50 x 13 ft', 17, 54, 12, 0, { kind: 'boules terrain', cl: 50, cw: 13, bh: 6 }]],
    build: (a, v) => {
      const Z = slab(a, 40), cw = v.cw * FT, cl = v.cl * FT, bh = v.bh * IN, cy = a.YF / 2, hx = cw / 2, y0 = cy - cl / 2, y1 = cy + cl / 2, t = 70;
      a.box(-hx - 4 * t, y0 - 4 * t, Z, hx + 4 * t, y1 + 4 * t, Z + 20); a.box(-hx, y0, Z + 20, hx, y1, Z + 80);
      for (const s of [-1, 1]) a.box(s > 0 ? hx : -hx - t, y0 - t, Z, s > 0 ? hx + t : -hx, y1 + t, Z + bh);
      for (const s of [-1, 1]) a.box(-hx - t, s > 0 ? y1 : y0 - t, Z, hx + t, s > 0 ? y1 + t : y0, Z + bh * 0.9);
      const L = (p, q, r, s) => seg(a, p, q, r, s, 30, Z + 80, Z + 84);
      L(-hx, y0 + cl * 0.25, hx, y0 + cl * 0.25); L(-hx, y1 - cl * 0.25, hx, y1 - cl * 0.25); L(-hx, cy, hx, cy);
      for (const [x, y, c] of [[-hx * 0.3, y1 - 900, 0], [hx * 0.4, y1 - 1500, 1], [0, y1 - 500, 0], [-hx * 0.55, y1 - 2300, 1]]) a.ell(x, y, Z + 80 + 54, 54, 54, 54, 12, 8);
      a.ell(hx * 0.05, y1 - 1100, Z + 80 + 14, 14, 14, 14, 8, 6); a.rect(-hx, y0, hx, y1, 'EQUIP');
      a.log('Added the slab, timber boards, gravel bed, foul and pallino lines, four balls and the jack (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ equipment
/** a square-section bar from p to q (a tube of four sides turned 45 degrees is fine for display) */
const bar = (a, p, q, r, s = 4) => a.tube([p, q], [r, r], s);
/** a rounded bag-like body of revolution about Z: list of [z, r] */
function lathe(a, cx, cy, prof, seg_ = 22) { a.tube(prof.map(([z]) => [cx, cy, z]), prof.map(([, r]) => r), seg_); }

const EQUIP = [
  fam({ cat: 'sport/equipment', title: 'Generic golf club on stand',
    desc: (v) => `${cap(v.kind)} golf club ${v.L} in long shown upright on a round display stand: a wrapped grip with end cap, a tapered shaft, a hosel and ${v.hd}.`,
    vs: [['driver, 45 in', 12, 10, 50, 0, { kind: 'driver', L: 45, hd: 'a large rounded wood-style head with a flat face and a sole plate' }], ['iron, 37 in', 10, 10, 42, 0, { kind: 'iron', L: 37, hd: 'a flat angled blade head with grooves on the face' }], ['putter, 35 in', 10, 10, 40, 0, { kind: 'putter', L: 35, hd: 'a mallet head with a sight line and a short bent hosel' }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, L = v.L * IN, zb = Z0 + 110, zt = zb + L; a.outline(); stand(a, cx, cy, 120, 110); ring(a, 'xy', cx, cy, zb + 40, 26, 4, 14, 5);
      a.cyl(cx, cy, zb, zb + 10.5 * IN, 15, 12); a.cyl(cx, cy, zb - 3, zb + 10, 19, 12); for (let i = 1; i < 6; i++) ring(a, 'xy', cx, cy, zb + i * 45, 15, 2, 12, 4);
      const hz = v.kind === 'driver' ? 95 : v.kind === 'iron' ? 85 : 150;
      a.tube([[cx, cy, zb + 10.5 * IN], [cx, cy, zt - hz], [cx + 8, cy, zt - hz + 60]], [8, 6.5, 6], 8);
      const hx = cx + 10, hzz = zt - hz;
      if (v.kind === 'driver') { a.ell(hx + 60, cy, hzz + 55, 60, 55, 42, 16, 10); a.ell(hx + 60, cy, hzz + 18, 48, 40, 10, 12, 6); a.ell(hx + 20, cy, hzz + 30, 14, 14, 30, 8, 5); }
      else if (v.kind === 'iron') { prismY(a, [[hx - 6, hzz + 25], [hx + 105, hzz + 5], [hx + 112, hzz + 62], [hx + 8, hzz + 88]], cy - 8, cy + 8); for (let i = 0; i < 5; i++) a.box(hx + 10, cy - 10, hzz + 12 + i * 11, hx + 100, cy - 8, hzz + 15 + i * 11); a.tube([[hx - 8, cy, hzz - 30], [hx - 5, cy, hzz + 60]], [8, 11], 8); }
      else { a.box(hx + 10, cy - 30, hzz + 20, hx + 150, cy + 30, hzz + 70); a.box(hx + 40, cy - 31, hzz + 62, hx + 120, cy - 29, hzz + 66); a.tube([[cx, cy, zt - hz], [hx + 35, cy, hzz + 20]], [7, 8], 8); a.rect(hx + 10, cy - 30, hx + 150, cy + 30, 'EQUIP-DETAIL'); }
      a.circ(cx, cy, 15, 'EQUIP-DETAIL'); a.log('Added the stand, grip with end cap, shaft, hosel and ' + v.kind + ' head (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', title: 'Generic stick on leaning rack',
    desc: (v) => `${cap(v.kind)} stick ${v.L} in long leaning on a floor rack: a base plate and a back post with two clips, a straight shaft${v.net ? ', a triangular head frame with a woven net pocket' : ''}${v.hook ? ' and a curved head with a rounded toe' : ''}${v.blade ? ', and an angled flat blade resting on the floor with a taped edge' : ''}.`,
    vs: [['ice hockey, 63 in', 18, 26, 66, 0, { kind: 'ice hockey', L: 63, blade: true }], ['field hockey, 36 in', 18, 18, 38, 0, { kind: 'field hockey', L: 36, hook: true }], ['lacrosse, 40 in', 16, 20, 42, 0, { kind: 'lacrosse', L: 40, net: true }]],
    build: (a, v) => {
      const { Z0, YF, YB, cx } = a, L = v.L * IN, ang = (v.kind === 'field hockey' ? 14 : 15) * PI / 180, lean = L * m.sin(ang), yb = YB - 120, yf = yb - lean, zb = Z0 + 36; a.outline();
      a.box(cx - 150, yb - 160, Z0, cx + 150, yb + 100, Z0 + 28); a.box(cx - 30, yb + 40, Z0 + 28, cx + 30, yb + 90, Z0 + L * 0.8 * m.cos(ang)); a.rect(cx - 150, yb - 160, cx + 150, yb + 100);
      for (const f of [0.55, 0.78]) { const z = zb + L * m.cos(ang) * f, y = yf + lean * f; a.box(cx - 40, y + 20, z - 25, cx + 40, yb + 90, z + 25); a.box(cx - 25, y - 14, z - 12, cx + 25, y + 20, z + 12); }
      const x0 = v.hook || v.net ? cx - 15 : cx - 100;
      const sh = (f) => [x0, yf + lean * f, zb + L * m.cos(ang) * f];
      const top = L - (v.net ? 270 : 0);
      a.tube([sh(0.06), sh(1)], [13, 13], 4);
      if (v.blade) { a.box(x0 - 15, yf - 40, zb - 30, x0 + 300, yf + 40, zb + 55); a.box(x0 - 15, yf - 42, zb - 30, x0 + 300, yf - 38, zb + 55); a.box(x0 + 60, yf - 44, zb - 28, x0 + 240, yf - 38, zb - 20); a.rect(x0 - 15, yf - 40, x0 + 300, yf + 40, 'EQUIP-DETAIL'); }
      if (v.hook) { const p = []; for (let i = 0; i <= 8; i++) { const t = (i / 8) * 1.2; p.push([x0 + 250 * (1 - m.cos(t)) * 0.8 + 0, yf, zb + 70 * m.sin(t) * 0.55 + 15 + (1 - i / 8) * 60 * 0]); } a.tube([[x0, yf, zb + 120], [x0 + 20, yf, zb + 60], [x0 + 120, yf, zb + 22], [x0 + 260, yf, zb + 14]], [14, 14, 12, 11], 6); a.rect(x0, yf - 14, x0 + 260, yf + 14, 'EQUIP-DETAIL'); }
      if (v.net) { const t0 = sh(0.96), c = [t0[0], t0[1], t0[2]]; const hz = 270, w2 = 150;
        a.tube([[c[0] - w2, c[1] - 6, c[2] - hz * 0.92 + 40], [c[0] - 12, c[1], c[2]], [c[0] + w2, c[1] - 6, c[2] - hz * 0.92 + 40]], [9, 9, 9], 6); a.tube([[c[0] - w2, c[1] - 6, c[2] - hz * 0.92 + 40], [c[0] + w2, c[1] - 6, c[2] - hz * 0.92 + 40]], [9, 9], 6);
        for (let i = 1; i < 7; i++) { const f = i / 7, x = c[0] - w2 + 2 * w2 * f, h = 1 - m.abs(f - 0.5) * 1.8; a.tube([[x, c[1] - 6, c[2] - hz * 0.92 + 40], [x, c[1] - 3, c[2] - (hz * 0.92 - 40) * (1 - h)]], [1.6, 1.6], 4); } }
      a.log('Added the base, back post with clips, the leaning shaft and the ' + (v.blade ? 'blade' : v.hook ? 'curved head' : 'net head') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', title: 'Generic bow on stand',
    desc: (v) => `${cap(v.kind)} bow ${v.L} in long on a display stand: a round base, a post with an arm to the riser, ${v.comp ? 'a short riser, two limbs with round cams and cables' : 'a handle riser with a wrapped grip and two curved limbs'}, and a string with a serving drawn tip to tip.`,
    vs: [['recurve, 66 in', 14, 12, 72, 0, { kind: 'recurve', L: 66, bend: 150 }], ['longbow, 68 in', 14, 12, 74, 0, { kind: 'long', L: 68, bend: 110 }], ['compound, 38 in', 14, 12, 44, 0, { kind: 'compound', L: 38, bend: 105, comp: true }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, L = v.L * IN, zm = Z0 + 80 + L / 2, bend = v.bend, N = 14; a.outline();
      a.cyl(cx, cy + 40, Z0, Z0 + 14, 130, 20); a.circ(cx, cy + 40, 130, 'EQUIP-DETAIL'); a.cyl(cx, cy + 40, Z0 + 14, zm - 20, 12, 8); a.box(cx - 10, cy - 20, zm - 30, cx + 10, cy + 40, zm - 10);
      const rx = (u) => -bend * (1 - u * u), u0 = v.comp ? 0.92 : 1;
      for (const sgn of [1, -1]) { const p = [], r = []; for (let i = 0; i <= N; i++) { const u = sgn * u0 * (i / N); p.push([cx + rx(u), cy, zm + u * L / 2]); r.push((v.comp ? 11 : 15) - (i / N) * 6); } a.tube(p, r, 6); }
      a.box(cx + rx(0) - 18, cy - 16, zm - 100, cx + rx(0) + 18, cy + 16, zm + 100); a.cyl(cx + rx(0), cy, zm - 60, zm + 60, 20, 10);
      const zt = zm + u0 * L / 2, zbt = zm - u0 * L / 2;
      a.tube([[cx, cy, zt], [cx, cy, zbt]], [1.8, 1.8], 4); a.box(cx - 3, cy - 3, zm - 90, cx + 3, cy + 3, zm + 90);
      if (v.comp) for (const z of [zt, zbt]) { a.ycyl(cy - 10, cy + 10, cx, z, 62, 16); a.ycyl(cy - 12, cy + 12, cx, z, 10, 8); }
      a.rect(cx + rx(0) - 18, cy - 16, cx + rx(0) + 18, cy + 16, 'EQUIP-DETAIL'); a.log('Added the base, post and arm, riser with grip, curved limbs and the string' + (v.comp ? ', cams and cables' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', title: 'Generic skate',
    desc: (v) => `${cap(v.kind)} skate seen from the side: a ${v.boot} boot with a padded cuff and laces, ${v.under}.`,
    vs: [['ice hockey', 13, 5, 10, 0, { kind: 'ice hockey', boot: 'hard-shell', blade: true, holder: 2, toe: 0 }], ['figure', 13, 5, 10, 0, { kind: 'figure', boot: 'leather-style', blade: true, holder: 1, toe: 1 }], ['inline, four wheels', 14, 5, 10, 0, { kind: 'inline', boot: 'shell', blade: false }]]
      .map((r) => { r[5].under = r[5].blade ? 'a steel blade with a curved rocker held by ' + (r[5].holder === 2 ? 'a two-piece holder' : 'two pillars') + (r[5].toe ? ' and a toe pick' : '') : 'a rail frame with four in-line wheels and axle bolts'; return r; }),
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2, w = 52; a.outline();
      const zs = Z0 + (v.blade ? 66 : 62), x = (px) => cx + px;
      prismY(a, [[-150, 40], [165, 40], [172, 80], [150, 118], [62, 150], [0, 212], [-22, 235], [-150, 235]].map(([px, z]) => [x(px), zs + z * 0.7 - 20]), cy - w, cy + w);
      a.box(x(-150), cy - w - 6, zs - 20, x(172), cy + w + 6, zs + 8);
      a.box(x(-155), cy - w - 8, zs + 40, x(-125), cy + w + 8, zs + 150);
      for (const [px, pz] of [[150, 118], [118, 130], [86, 142], [48, 168], [14, 204], [-12, 232]]) { a.tube([[x(px), cy - w * 0.55, zs + pz * 0.7 - 12], [x(px), cy + w * 0.55, zs + pz * 0.7 - 12]], [2.6, 2.6], 4); }
      if (v.blade) {
        const bl = v.kind === 'figure' ? 300 : 310, zb2 = Z0 + 4;
        prismY(a, [[x(-bl / 2), zb2 + 6], [x(bl / 2 - 20), zb2], [x(bl / 2 + 14), zb2 + 22], [x(bl / 2 - 15), zb2 + 60], [x(-bl / 2), zb2 + 60]].reverse().reverse(), cy - 3, cy + 3);
        if (v.holder === 2) { a.box(x(-130), cy - 14, zb2 + 40, x(-50), cy + 14, zs - 20); a.box(x(90), cy - 14, zb2 + 40, x(170), cy + 14, zs - 20); a.box(x(-135), cy - 22, zs - 28, x(175), cy + 22, zs - 20); }
        else { for (const px of [-120, 120]) a.box(x(px) - 14, cy - 8, zb2 + 40, x(px) + 14, cy + 8, zs - 20); a.box(x(-140), cy - 20, zs - 28, x(172), cy + 20, zs - 20); }
        if (v.toe) for (let i = 0; i < 4; i++) a.box(x(bl / 2 + 10 + i * 8), cy - 3, zb2 + 40 + i * 6, x(bl / 2 + 26 + i * 8), cy + 3, zb2 + 52 + i * 6);
        a.rect(x(-bl / 2), cy - 3, x(bl / 2), cy + 3, 'EQUIP-DETAIL');
      } else {
        const R = 40, zc = Z0 + R + 2; a.box(x(-165), cy - 20, zc + 22, x(170), cy + 20, zs - 20); a.box(x(-165), cy - 22, zc + 40, x(170), cy - 18, zs - 20);
        for (let i = 0; i < 4; i++) { const px = -135 + i * 90; a.ycyl(cy - 30, cy + 30, x(px), zc, R, 16); a.ycyl(cy - 36, cy + 36, x(px), zc, 9, 8); a.rect(x(px) - R, cy - 30, x(px) + R, cy + 30, 'EQUIP-DETAIL'); }
        for (const px of [-150, 150]) a.box(x(px) - 14, cy - 30, zc, x(px) + 14, cy + 30, zs - 20);
      }
      a.log('Added the boot with sole, cuff and laces and the ' + (v.blade ? 'blade with its holder' : 'wheel frame') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', title: 'Generic paddle on rack',
    desc: (v) => `${cap(v.kind)} paddle ${v.L} in long held upright on a floor rack: a base plate, a back post with two clips, ${v.dbl ? 'a shaft with a blade at each end set at right angles to each other' : 'a shaft with ' + (v.tgrip ? 'a T-grip at the top and ' : 'a handle and ') + 'one ' + (v.tilt ? 'angled ' : '') + 'blade'}.`,
    vs: [['kayak, 88 in double blade', 22, 14, 92, 0, { kind: 'kayak', L: 88, dbl: true }], ['canoe, 54 in with T-grip', 18, 14, 58, 0, { kind: 'canoe', L: 54, tgrip: true, bw: 190 }], ['stand-up board, 68 in angled blade', 18, 16, 72, 0, { kind: 'stand-up board', L: 68, tilt: true, bw: 230 }]],
    build: (a, v) => {
      const { Z0, YF, YB, cx } = a, L = v.L * IN, y = YF + 150, zb = Z0 + 40; a.outline();
      a.box(cx - 220, y - 100, Z0, cx + 220, YB - 50, Z0 + 28); a.rect(cx - 220, y - 100, cx + 220, YB - 50);
      a.box(cx - 30, YB - 120, Z0 + 28, cx + 30, YB - 60, Z0 + L * 0.75);
      for (const f of [0.45, 0.7]) { const z = zb + L * f; a.box(cx - 50, y + 20, z - 22, cx + 50, YB - 60, z + 22); a.box(cx - 30, y - 22, z - 12, cx + 30, y + 22, z + 12); }
      a.tube([[cx, y, zb], [cx, y, zb + L]], [14, 14], 8);
      const blade = (zc, h, wv, rot, tilt = 0) => { for (let i = 0; i < 10; i++) { const f = (i + 0.5) / 10, z0 = zc - h / 2 + (h * i) / 10, wd = wv * m.sin(m.PI * (0.18 + 0.64 * f)) * 0.5 + 8; if (rot) a.box(cx - 10 + tilt * f, y - wd, z0, cx + 10 + tilt * f, y + wd, z0 + h / 10 + 1); else a.box(cx - wd, y - 8 - tilt * f, z0, cx + wd, y + 8 - tilt * f, z0 + h / 10 + 1); } };
      if (v.dbl) { blade(zb + 250, 480, 220, false); blade(zb + L - 250, 480, 220, true); a.tube([[cx, y, zb + 250 + 240], [cx, y, zb + L - 250 - 240]], [15, 15], 8); }
      else { blade(zb + 330, 640, v.bw, false, v.tilt ? -140 : 0); if (v.tgrip) { a.xcyl(cx - 75, cx + 75, y, zb + L - 8, 14, 8); a.box(cx - 80, y - 20, zb + L - 36, cx + 80, y + 20, zb + L - 8); } else a.cyl(cx, y, zb + L - 220, zb + L, 18, 10); }
      a.rect(cx - 200, y - 18, cx + 200, y + 18, 'EQUIP-DETAIL'); a.log('Added the rack, the shaft and ' + (v.dbl ? 'both blades' : 'the blade and grip') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', title: 'Generic punching bag',
    desc: (v) => v.kind === 'speed' ? `Speed bag on a platform stand: a floor base, a post, a rebound platform at head height with a swivel and a small bulb bag hanging under it.` : `${cap(v.kind)} bag ${v.bag} in tall: ${v.hang ? 'a floor frame with a base plate, a mast, a boom to the front and three chains holding a stitched cylinder bag with a top cap' : 'a round water base, a short pad-covered mast and a long cylinder bag with a rounded top'}.`,
    vs: [['heavy bag on frame, 48 in', 36, 52, 96, 0, { kind: 'heavy', bag: 48, hang: true, r: 190 }], ['free-standing base bag, 68 in', 32, 32, 91, 0, { kind: 'free-standing', bag: 68, hang: false, r: 175 }], ['speed bag on platform stand', 30, 30, 90, 0, { kind: 'speed' }]],
    build: (a, v) => {
      const { Z0, YF, YB, cx } = a, cy = YF / 2; a.outline();
      if (v.kind === 'speed') {
        a.box(cx - 330, cy - 330, Z0, cx + 330, cy + 330, Z0 + 30); a.rect(cx - 330, cy - 330, cx + 330, cy + 330); a.cyl(cx, cy, Z0 + 30, Z0 + 1500, 50, 12);
        a.box(cx - 380, cy - 300, Z0 + 1500, cx + 380, cy + 300, Z0 + 1540); a.box(cx - 120, cy - 100, Z0 + 1440, cx + 120, cy + 100, Z0 + 1500); a.rect(cx - 380, cy - 300, cx + 380, cy + 300, 'EQUIP-DETAIL');
        a.cyl(cx, cy, Z0 + 1400, Z0 + 1440, 14, 8); a.ell(cx, cy, Z0 + 1330, 24, 24, 24, 10, 6); a.ell(cx, cy, Z0 + 1190, 110, 110, 150, 14, 10); a.cyl(cx, cy, Z0 + 1060, Z0 + 1090, 25, 10); return a.log('Added the base, post, platform, swivel and bulb bag (plan and 3D).');
      }
      const bh = v.bag * IN;
      if (v.hang) {
        const yb = YB - 150; a.box(cx - 400, yb - 320, Z0, cx + 400, yb + 100, Z0 + 40); a.rect(cx - 400, yb - 320, cx + 400, yb + 100);
        a.tube([[cx, yb, Z0 + 40], [cx, yb, Z0 + 2400]], [38, 38], 8); a.tube([[cx, yb, Z0 + 2350], [cx, yb - 1000, Z0 + 2350]], [30, 30], 8); a.tube([[cx, yb - 60, Z0 + 600], [cx, yb - 940, Z0 + 2300]], [20, 20], 6); a.line(cx, yb, cx, yb - 1000, 'EQUIP-DETAIL');
        const by = yb - 1000, zt = Z0 + 2300 - 320; for (const t of [0, 2.1, 4.2]) a.tube([[cx, by, Z0 + 2340], [cx + m.cos(t) * v.r * 0.7, by + m.sin(t) * v.r * 0.7, zt]], [4, 4], 4);
        lathe(a, cx, by, [[zt - bh, 0.1], [zt - bh + 20, v.r * 0.9], [zt - bh + 60, v.r], [zt - 40, v.r], [zt - 10, v.r * 0.9], [zt, v.r * 0.4]], 22); for (const f of [0.2, 0.5, 0.8]) ring(a, 'xy', cx, by, zt - bh * f, v.r, 3, 22, 4); a.circ(cx, by, v.r, 'EQUIP');
      } else {
        a.cyl(cx, cy, Z0, Z0 + 520, 400, 24); a.circ(cx, cy, 400, 'EQUIP'); a.cyl(cx, cy, Z0 + 520, Z0 + 560, 330, 24);
        lathe(a, cx, cy, [[Z0 + 560, v.r * 1.1], [Z0 + 900, v.r * 1.05], [Z0 + 560 + bh * 0.85, v.r], [Z0 + 560 + bh * 0.97, v.r * 0.8], [Z0 + 560 + bh, v.r * 0.35]], 22); for (const f of [0.3, 0.55, 0.8]) ring(a, 'xy', cx, cy, Z0 + 560 + bh * f, v.r, 3, 22, 4); a.circ(cx, cy, v.r, 'EQUIP-DETAIL');
      }
      a.log('Added the ' + (v.hang ? 'base plate, mast, boom, chains and stitched bag' : 'water base and padded bag') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', ft: true, title: 'Generic cue sports table',
    desc: (v) => `${cap(v.kind)} table ${v.len} ft long: a slate bed under green cloth, timber rails with diamond sights, cushions, six pockets with leather-style jaws, ${v.legs} turned legs with a skirt, and a triangle of 15 balls with a cue ball${v.snooker ? ' on the baulk line' : ''}.`,
    vs: [['pool table, 7 ft', 4.2, 7.6, 33, 0, { kind: 'pool', len: 7, snooker: false, legs: 4, br: 29 }], ['pool table, 8 ft', 4.8, 8.4, 33, 0, { kind: 'pool', len: 8, snooker: false, legs: 4, br: 29 }], ['pool table, 9 ft', 5.2, 9.2, 33, 0, { kind: 'pool', len: 9, snooker: false, legs: 4, br: 29 }], ['snooker table, 12 ft', 6.3, 12.2, 34, 0, { kind: 'snooker', len: 12, snooker: true, legs: 6, br: 26 }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, cx } = a, W = a.W, D = a.D, zs = Z0 + (v.snooker ? 860 : 800), rail = 140, bed = zs - 40; a.outline();
      a.box(X0 + 40, YF + 40, bed - 40, X1 - 40, -40, bed); a.box(X0 + 60, YF + 60, bed - 160, X1 - 60, -60, bed - 40);
      a.box(X0 + 55, YF + 55, bed, X1 - 55, -55, bed + 12);
      const cl = X0 + 55 + rail * 0.8, cr = X1 - 55 - rail * 0.8, cf = YF + 55 + rail * 0.8, cb = -55 - rail * 0.8;
      for (const [x0, y0, x1, y1] of [[X0 + 40, YF + 40, X1 - 40, cf], [X0 + 40, cb, X1 - 40, -40], [X0 + 40, YF + 40, cl, -40], [cr, YF + 40, X1 - 40, -40]]) a.box(x0, y0, bed, x1, y1, zs + 50);
      for (const [x0, y0, x1, y1] of [[cl, cf + 0, cr, cf + 70], [cl, cb - 70, cr, cb], [cl, cf, cl + 70, cb], [cr - 70, cf, cr, cb]]) a.box(x0, y0, bed + 12, x1, y1, bed + 52);
      for (let i = 1; i < 8; i++) { const x = cl + (cr - cl) * i / 8; for (const y of [YF + 50 + rail * 0.4, -50 - rail * 0.4]) a.cyl(x, y, zs + 50, zs + 56, 11, 8); }
      for (let i = 1; i < 4; i++) { const y = cf + (cb - cf) * i / 4; for (const x of [X0 + 50 + rail * 0.4, X1 - 50 - rail * 0.4]) a.cyl(x, y, zs + 50, zs + 56, 11, 8); }
      const pr = v.snooker ? 48 : 62; const pk = [[cl, cf], [cr, cf], [cl, cb], [cr, cb], [cl, (cf + cb) / 2], [cr, (cf + cb) / 2]];
      for (const [x, y] of pk) { a.cyl(x, y, bed + 12, zs + 56, pr, 14); a.circ(x, y, pr, 'EQUIP-DETAIL'); a.cyl(x, y, zs + 56, zs + 60, pr * 0.7, 12); }
      const sx = (x) => x, R = v.br; const tx = 0, ty = cf + (cb - cf) * 0.28, bz = bed + 12 + R;
      let k = 0; for (let r = 0; r < 5; r++) for (let c = 0; c <= r; c++) { if (k++ >= 15) break; a.ell(tx + (c - r / 2) * R * 2.05, ty + r * R * 1.8, bz, R, R, R, 8, 5); }
      a.ell(0, cf + (cb - cf) * 0.78, bz, R, R, R, 8, 5); a.line(cl, cf + (cb - cf) * 0.78, cr, cf + (cb - cf) * 0.78, 'EQUIP-DETAIL');
      const lg = v.legs === 4 ? [[X0 + 90, YF + 90], [X1 - 90, YF + 90], [X0 + 90, -90], [X1 - 90, -90]] : [[X0 + 90, YF + 90], [X1 - 90, YF + 90], [X0 + 90, -90], [X1 - 90, -90], [X0 + 90, YF / 2], [X1 - 90, YF / 2]];
      for (const [x, y] of lg) { a.cone(x, y, Z0 + 20, Z0 + 240, 62, 52, 14); a.cyl(x, y, Z0 + 240, bed - 160, 78, 14); a.cyl(x, y, Z0, Z0 + 20, 70, 12); a.circ(x, y, 78, 'EQUIP-DETAIL'); }
      a.log('Added the slate bed and cloth, rails with sights, cushions, six pockets, turned legs with skirt and the set of balls (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', title: 'Generic golf bag',
    desc: (v) => `${cap(v.kind)} golf bag: a tapered body with a top cuff and dividers, a long shoulder strap and side pockets, ${v.stand ? 'two folding legs and a stand hinge' : 'a wheeled trolley frame with two large wheels, a handle and a base cradle'}, and ${v.n} clubs with head covers standing in it.`,
    vs: [['carry stand bag, 6 clubs', 21, 17, 63, 0, { kind: 'carry stand', stand: true, n: 6 }], ['cart bag on trolley, 12 clubs', 22, 30, 70, 0, { kind: 'cart', stand: false, n: 12 }]],
    build: (a, v) => {
      const { Z0, YF, YB, cx } = a, cy = v.stand ? YF / 2 : YB - 330, zo = Z0 + (v.stand ? 280 : 450), bh = 880, r = 120; a.outline();
      lathe(a, cx, cy, [[zo, r * 0.82], [zo + 80, r * 0.9], [zo + bh * 0.55, r * 0.98], [zo + bh, r * 1.05], [zo + bh + 30, r * 1.05]], 20); ring(a, 'xy', cx, cy, zo + bh + 40, r * 1.02, 12, 20, 5);
      for (let i = 0; i < 3; i++) { const t = i * 2.1; a.box(cx + m.cos(t) * r * 0.9 - 4, cy + m.sin(t) * r * 0.9 - 4, zo + bh * 0.8, cx + m.cos(t) * r * 0.9 + 4, cy + m.sin(t) * r * 0.9 + 4, zo + bh + 20); }
      a.box(cx + r * 0.95, cy - 70, zo + 60, cx + r * 1.28, cy + 70, zo + 500); a.box(cx - r * 1.2, cy - 60, zo + 150, cx - r * 0.95, cy + 60, zo + 450);
      a.tube([[cx - r, cy - r * 0.9, zo + bh * 0.9], [cx - r * 1.5, cy - r * 1.2, zo + bh * 0.55], [cx - r * 0.9, cy - r * 0.95, zo + bh * 0.1]], [14, 14, 14], 6);
      for (let i = 0; i < v.n; i++) { const t = (i / v.n) * 2 * PI, rr = r * 0.55 * (i % 2 ? 0.6 : 1), x = cx + m.cos(t) * rr, y = cy + m.sin(t) * rr, h = bh + 100 + (i % 4) * 70; a.tube([[x, y, zo + bh * 0.2], [x, y, zo + h]], [7, 6], 6); a.ell(x, y, zo + h + 52, 40, 40, 58, 10, 6); a.cone(x, y, zo + h, zo + h + 14, 38, 20, 10); }
      if (v.stand) { for (const s of [-1, 1]) a.tube([[cx + s * 60, cy + 40, zo + 100], [cx + s * 250, cy + 150, Z0 + 20]], [10, 10], 6); a.tube([[cx - 40, cy - 60, zo + 100], [cx - 40, cy - 190, Z0 + 20]], [10, 10], 6); a.box(cx + 60, cy + 90, zo + 100, cx + 140, cy + 110, zo + 160); }
      else { a.box(cx - 150, cy - 150, Z0 + 330, cx + 150, cy + 150, zo - 0); a.tube([[cx - 150, YB - 150, Z0 + 150], [cx - 150, YB - 40, zo + 400], [cx + 150, YB - 40, zo + 400], [cx + 150, YB - 150, Z0 + 150]], [12, 12, 12, 12], 6); for (const s of [-1, 1]) { a.xcyl(cx + s * 250 - 18, cx + s * 250 + 18, YB - 150, Z0 + 150, 150, 18); a.tube([[cx + s * 160, YB - 150, Z0 + 150], [cx + s * 160, cy, zo]], [12, 12], 6); } a.tube([[cx, YF + 90, Z0 + 60], [cx, cy - 100, Z0 + 330]], [12, 12], 6); a.xcyl(cx - 60, cx + 60, YF + 90, Z0 + 30, 30, 10); }
      a.circ(cx, cy, r * 1.05, 'EQUIP'); a.log('Added the tapered body, cuff, strap, pockets, ' + (v.stand ? 'folding legs' : 'trolley frame and wheels') + ' and the clubs with head covers (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', title: 'Generic gymnastics apparatus',
    desc: (v) => v.k === 'beam' ? 'Balance beam: a long padded beam with a rounded top, two telescoping end columns with a height pin and wide base feet joined by a floor bar.' : v.k === 'vault' ? 'Vaulting table: a padded top that slopes slightly, a long runway edge and a steel base frame with four slanted legs, cross braces and floor pads.' : v.k === 'pommel' ? 'Pommel horse: a long padded body, two arched pommels on top, a column with a base and four splayed floor feet.' : v.k === 'bars' ? 'Parallel bars: two long rails on adjustable end posts with floor bases and a cross bar low between the posts.' : v.k === 'high' ? 'High bar: a steel bar on two posts with base plates, braced by four tensioned cables to floor anchors.' : 'Rings frame: two posts and a top beam braced by cables, with two straps hanging from the beam, each ending in a ring.',
    vs: [['balance beam, 16 ft long', 200, 26, 56, 0, { k: 'beam' }], ['vaulting table, 47 in high', 40, 60, 52, 0, { k: 'vault' }], ['pommel horse, 63 in long', 72, 28, 56, 0, { k: 'pommel' }], ['parallel bars, 138 in long', 150, 40, 64, 0, { k: 'bars' }], ['high bar, 9 ft high', 136, 84, 118, 0, { k: 'high' }], ['rings frame, 11 ft high', 120, 70, 150, 0, { k: 'rings' }]],
    build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, cx, W } = a, cy = YF / 2; a.outline();
      if (v.k === 'beam') {
        const L = 4900, bz = Z0 + 1200; a.box(cx - L / 2, cy - 50, bz - 100, cx + L / 2, cy + 50, bz); a.box(cx - L / 2, cy - 45, bz, cx + L / 2, cy + 45, bz + 40); a.box(cx - L / 2 + 20, cy - 52, bz - 100, cx - L / 2 + 50, cy + 52, bz + 30); a.box(cx + L / 2 - 50, cy - 52, bz - 100, cx + L / 2 - 20, cy + 52, bz + 30);
        for (const s of [-1, 1]) { const x = cx + s * 1750; a.cyl(x, cy, Z0 + 300, bz - 100, 55, 14); a.cyl(x, cy, Z0 + 60, Z0 + 500, 70, 14); a.box(x - 80, cy - 280, Z0, x + 80, cy + 280, Z0 + 60); a.box(x - 230, cy - 25, Z0 + 20, x + 230, cy + 25, Z0 + 60); a.circ(x, cy, 70, 'EQUIP-DETAIL'); a.rect(x - 80, cy - 280, x + 80, cy + 280, 'EQUIP-DETAIL'); }
        a.box(cx - 1750, cy - 25, Z0 + 10, cx + 1750, cy + 25, Z0 + 40); a.rect(cx - L / 2, cy - 50, cx + L / 2, cy + 50, 'EQUIP');
      } else if (v.k === 'vault') {
        const bz = Z0 + 1190, yb = -120, yf = YF + 120;
        prismX(a, [[yf, bz - 110], [yb, bz - 150], [yb, bz - 30], [yf, bz]], cx - 300, cx + 300); a.box(cx - 305, yf - 4, bz - 100, cx + 305, yb + 4, bz - 40);
        for (const sx of [-1, 1]) for (const [y, ytop] of [[yf - 40, yf + 40], [yb + 40, yb - 40]]) a.tube([[cx + sx * 330, y, Z0 + 30], [cx + sx * 240, ytop, bz - 110]], [24, 22], 8);
        for (const sx of [-1, 1]) { a.tube([[cx + sx * 330, yf - 40, Z0 + 30], [cx + sx * 330, yb + 40, Z0 + 30]], [20, 20], 6); a.box(cx + sx * 330 - 40, yf - 80, Z0, cx + sx * 330 + 40, yf, Z0 + 30); a.box(cx + sx * 330 - 40, yb, Z0, cx + sx * 330 + 40, yb + 80, Z0 + 30); }
        a.tube([[cx - 330, (yf + yb) / 2, Z0 + 400], [cx + 330, (yf + yb) / 2, Z0 + 400]], [14, 14], 6); a.rect(cx - 300, yf, cx + 300, yb, 'EQUIP-DETAIL'); a.line(cx - 300, yf, cx - 300, yb, 'EQUIP');
      } else if (v.k === 'pommel') {
        const bz = Z0 + 1100, L = 1600; a.xcyl(cx - L / 2, cx + L / 2, cy, bz, 180, 20); for (const s of [-1, 1]) a.ell(cx + s * L / 2, cy, bz, 40, 180, 180, 10, 8);
        for (const s of [-1, 1]) { const x = cx + s * 190; a.tube([[x - 60, cy, bz + 150], [x - 60, cy, bz + 330], [x + 60, cy, bz + 330], [x + 60, cy, bz + 150]], [26, 30, 30, 26], 10); a.rect(x - 90, cy - 30, x + 90, cy + 30, 'EQUIP-DETAIL'); }
        a.cyl(cx, cy, Z0 + 80, bz - 170, 110, 16); a.cyl(cx, cy, Z0 + 20, Z0 + 100, 260, 18); for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.tube([[cx, cy, Z0 + 90], [cx + dx * 620, cy + dy * 230, Z0 + 20]], [30, 24], 8);
        for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.cyl(cx + dx * 620, cy + dy * 230, Z0, Z0 + 20, 48, 10);
      } else if (v.k === 'bars') {
        const L = 3500, sp = 520, bz = Z0 + 1500;
        for (const s of [-1, 1]) { a.box(cx - L / 2 - 40, cy + s * sp / 2 - 30, bz - 15, cx + L / 2 + 40, cy + s * sp / 2 + 30, bz + 15); a.xcyl(cx - L / 2, cx + L / 2, cy + s * sp / 2, bz, 20, 8);
          for (const e of [-1, 1]) { const x = cx + e * (L / 2 - 400); a.tube([[x, cy + s * sp / 2, Z0 + 40], [x, cy + s * sp / 2, bz - 20]], [26, 24], 8); } }
        for (const e of [-1, 1]) { const x = cx + e * (L / 2 - 400); a.box(x - 40, cy - 330, Z0, x + 40, cy + 330, Z0 + 40); a.tube([[x, cy - sp / 2, Z0 + 420], [x, cy + sp / 2, Z0 + 420]], [14, 14], 6); a.rect(x - 40, cy - 330, x + 40, cy + 330, 'EQUIP-DETAIL'); }
        a.line(cx - L / 2, cy - sp / 2, cx + L / 2, cy - sp / 2, 'EQUIP'); a.line(cx - L / 2, cy + sp / 2, cx + L / 2, cy + sp / 2, 'EQUIP');
      } else if (v.k === 'high') {
        const hw = 1200, bz = Z0 + 2700; for (const s of [-1, 1]) { a.tube([[cx + s * hw, cy, Z0 + 40], [cx + s * hw, cy, bz + 60]], [48, 40], 10); a.box(cx + s * hw - 250, cy - 250, Z0, cx + s * hw + 250, cy + 250, Z0 + 40); a.circ(cx + s * hw, cy, 48, 'EQUIP-DETAIL'); a.rect(cx + s * hw - 250, cy - 250, cx + s * hw + 250, cy + 250, 'EQUIP-DETAIL');
          for (const y of [YF + 160, -160]) { a.tube([[cx + s * hw, cy, bz], [cx + s * (hw + 450), y, Z0 + 30]], [5, 5], 4); a.cyl(cx + s * (hw + 450), y, Z0, Z0 + 30, 40, 10); } }
        a.xcyl(cx - hw, cx + hw, cy, bz, 14, 8);
      } else {
        const hw = 1150, bz = Z1 - 150; for (const s of [-1, 1]) { a.tube([[cx + s * hw, cy, Z0 + 40], [cx + s * hw, cy, bz]], [50, 45], 10); a.box(cx + s * hw - 300, cy - 300, Z0, cx + s * hw + 300, cy + 300, Z0 + 40); a.rect(cx + s * hw - 300, cy - 300, cx + s * hw + 300, cy + 300, 'EQUIP-DETAIL');
          for (const y of [YF + 150, -150]) { a.tube([[cx + s * hw, cy, bz - 100], [cx + s * (hw + 500), y, Z0 + 30]], [5, 5], 4); a.cyl(cx + s * (hw + 500), y, Z0, Z0 + 30, 36, 10); } }
        a.box(cx - hw, cy - 40, bz, cx + hw, cy + 40, bz + 70);
        for (const s of [-1, 1]) { const x = cx + s * 260; a.box(x - 25, cy - 3, bz - 1700, x + 25, cy + 3, bz); ring(a, 'xz', x, cy, bz - 1700 - 90, 90, 12, 20, 5); a.rect(x - 90, cy - 12, x + 90, cy + 12, 'EQUIP-DETAIL'); }
      }
      a.log('Added the apparatus frame, supports, base and the ' + (v.k === 'beam' ? 'beam' : v.k === 'vault' ? 'padded top' : v.k === 'pommel' ? 'body and pommels' : v.k === 'bars' ? 'rails' : v.k === 'high' ? 'bar and cables' : 'straps and rings') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', title: 'Generic track hurdle',
    desc: (v) => `Track hurdle set to ${v.h} in: two L-shaped feet with sliding counterweights, two uprights joined by a top board with ${v.bands} alternating colour bands, and a height adjustment plate on each side.`,
    vs: [['senior, 42 in', 52, 28, 44, 0, { h: 42, bands: 5 }], ['mid, 33 in', 52, 28, 35, 0, { h: 33, bands: 5 }], ['low youth, 27 in', 48, 24, 29, 0, { h: 27, bands: 3 }]],
    build: (a, v) => {
      const { Z0, YF, YB, cx } = a, hw = a.W / 2 - 110, H = v.h * IN, tb = 180; a.outline();
      for (const s of [-1, 1]) { const x = cx + s * hw; a.box(x - 22, YF + 30, Z0 + 4, x + 22, YB - 30, Z0 + 34); a.box(x - 40, YF + 120, Z0 + 34, x + 40, YF + 340, Z0 + 76); a.tube([[x, YB - 130, Z0 + 34], [x, YB - 130, Z0 + H - tb]], [17, 17], 8); a.box(x - 30, YB - 160, Z0 + H - tb - 80, x + 30, YB - 100, Z0 + H - tb - 20); a.rect(x - 22, YF + 30, x + 22, YB - 30, 'EQUIP-DETAIL'); a.rect(x - 40, YF + 120, x + 40, YF + 340, 'EQUIP-DETAIL'); }
      a.box(cx - hw - 20, YB - 200, Z0 + H - tb, cx + hw + 20, YB - 120, Z0 + H);
      const n = v.bands, L = 2 * hw + 40; for (let i = 0; i < n; i++) if (i % 2 === 0) a.box(cx - hw - 20 + (L * i) / n, YB - 204, Z0 + H - tb + 4, cx - hw - 20 + (L * (i + 1)) / n, YB - 200, Z0 + H - 4);
      a.rect(cx - hw - 20, YB - 200, cx + hw + 20, YB - 120, 'EQUIP'); a.log('Added the L-shaped feet, counterweights, uprights, striped top board and adjustment plates (plan and 3D).');
    } }),

  fam({ cat: 'sport/equipment', title: 'Generic throwing implement on stand',
    desc: (v) => v.k === 'javelin' ? 'Javelin 102 in long standing upright in a floor stand with a ring cradle: a pointed metal head, a swelling shaft, a cord grip at the middle and a tapering tail.' : v.k === 'discus' ? 'Discus 8.7 in across standing on edge in a round cradle stand: a lens-shaped body with a raised rim and a flat centre plate.' : v.k === 'shot' ? 'Shot put ball 4.7 in across resting in a ring on a pedestal stand: a heavy smooth sphere.' : 'Hammer throw implement on a stand: a heavy ball, a thin steel wire and a double-bar handle, hung upright from the stand arm.',
    vs: [['javelin, 102 in', 10, 10, 106, 0, { k: 'javelin' }], ['discus, 8.7 in', 12, 8, 14, 0, { k: 'discus' }], ['shot, 4.7 in', 8, 8, 9, 0, { k: 'shot' }], ['hammer, 47 in wire', 10, 8, 54, 0, { k: 'hammer' }]],
    build: (a, v) => {
      const { Z0, YF, cx } = a, cy = YF / 2; a.outline();
      if (v.k === 'javelin') { const L = 2590, zb = Z0 + 80; stand(a, cx, cy, 110, 80); ring(a, 'xy', cx, cy, zb, 22, 5, 12, 5);
        a.tube([[cx, cy, zb], [cx, cy, zb + L * 0.12], [cx, cy, zb + L * 0.45], [cx, cy, zb + L * 0.75], [cx, cy, zb + L * 0.95], [cx, cy, zb + L]], [4, 12, 13, 12, 7, 1.5], 12); for (let i = 0; i < 6; i++) ring(a, 'xy', cx, cy, zb + L * 0.42 + i * 24, 13.5, 2, 12, 4); a.cone(cx, cy, zb + L * 0.93, zb + L * 0.98, 7, 2, 10); }
      else if (v.k === 'discus') { stand(a, cx, cy, 130, 10); a.cyl(cx, cy - 40, Z0 + 10, Z0 + 70, 30, 10); ring(a, 'xz', cx, cy, Z0 + 150, 110, 8, 24, 5); a.box(cx - 140, cy - 24, Z0 + 14, cx + 140, cy + 24, Z0 + 40); a.ell(cx, cy, Z0 + 150, 111, 20, 111, 24, 10); ring(a, 'xz', cx, cy, Z0 + 150, 100, 3, 24, 4); a.ycyl(cy - 24, cy + 24, cx, Z0 + 150, 42, 14); a.cyl(cx, cy, Z0 + 10, Z0 + 46, 34, 10); }
      else if (v.k === 'shot') { stand(a, cx, cy, 90, 40); ring(a, 'xy', cx, cy, Z0 + 52, 40, 6, 20, 5); a.ell(cx, cy, Z0 + 40 + 60, 60, 60, 60, 18, 12); a.circ(cx, cy, 60, 'EQUIP'); }
      else { const zb = Z0 + 40; stand(a, cx, cy, 120, 30); a.cyl(cx, cy + 60, Z0 + 30, zb + 1400, 14, 8); a.tube([[cx, cy + 60, zb + 1380], [cx, cy, zb + 1380]], [12, 12], 6);
        a.ell(cx, cy, zb + 1380 - 40 - 60, 60, 60, 60, 16, 10); a.tube([[cx, cy, zb + 1380 - 100 - 30], [cx, cy, zb + 220]], [2, 2], 4); a.tube([[cx, cy, zb + 220], [cx - 60, cy, zb + 150], [cx - 60, cy, zb + 40], [cx + 60, cy, zb + 40], [cx + 60, cy, zb + 150], [cx, cy, zb + 220]], [4, 4, 4, 4, 4, 4], 6); }
      a.log('Added the stand and the ' + v.k + ' (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ fitness
/** a pad (cushion): box with an inset top */
function padB(a, x0, y0, z0, x1, y1, z1) { a.box(x0, y0, z0, x1, y1, z1 - 8); a.box(x0 + 6, y0 + 6, z1 - 10, x1 - 6, y1 - 6, z1); }
/** a weight plate (axis along X) centred at (x,y,z) */
function plateX(a, x, y, z, R, t) { a.xcyl(x - t / 2, x + t / 2, y, z, R, 22); a.xcyl(x - t / 2 - 2, x + t / 2 + 2, y, z, R * 0.18, 12); }

const FIT = [
  fam({ cat: 'sport/fitness', title: 'Generic elliptical trainer',
    desc: (v) => `${cap(v.kind)} elliptical trainer ${v.len} in long: a floor frame with two stabiliser feet and levelling pads, a flywheel housing at the ${v.front ? 'front' : 'rear'}, two crank arms with long foot pedals, a front post carrying moving handles, fixed grips and a console with a display.`,
    vs: [['front drive, 70 in long', 28, 70, 66, 0, { kind: 'front-drive', len: 70, front: true }], ['rear drive, 66 in long', 28, 66, 66, 0, { kind: 'rear-drive', len: 66, front: false }], ['compact, 54 in long', 25, 54, 60, 0, { kind: 'compact', len: 54, front: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, hx = W / 2 - 70; a.outline();
      for (const s of [-1, 1]) { a.box(cx + s * hx - 25, YF + 40, Z0 + 20, cx + s * hx + 25, YB - 40, Z0 + 70); a.box(cx + s * hx - 40, YF + 30, Z0, cx + s * hx + 40, YF + 90, Z0 + 20); a.box(cx + s * hx - 40, YB - 90, Z0, cx + s * hx + 40, YB - 30, Z0 + 20); }
      a.box(cx - hx - 30, YF + 40, Z0 + 20, cx + hx + 30, YF + 110, Z0 + 70); a.box(cx - hx - 30, YB - 110, Z0 + 20, cx + hx + 30, YB - 40, Z0 + 70);
      const yh = v.front ? YF + 360 : YB - 330, yp = YF + 280, zc = Z0 + 340; a.ell(cx, yh, zc, W / 2 - 100, 280, 250, 18, 10); a.rect(cx - (W / 2 - 100), yh - 280, cx + (W / 2 - 100), yh + 280, 'EQUIP-DETAIL');
      const fy = v.front ? YB - 300 : YF + 760;
      for (const s of [-1, 1]) { const x = cx + s * (hx - 20); a.xcyl(x - 20, x + 20, yh, zc, 45, 12); a.tube([[x, yh, zc], [x, (yh + fy) / 2, Z0 + 200], [x, fy, Z0 + 230]], [22, 20, 20], 6); a.box(x - 70, fy - 220, Z0 + 230, x + 70, fy + 220, Z0 + 270); a.rect(x - 70, fy - 220, x + 70, fy + 220, 'EQUIP-DETAIL'); }
      a.tube([[cx, yp, Z0 + 70], [cx, yp, Z1 - 330]], [48, 40], 10); a.circ(cx, yp, 48, 'EQUIP-DETAIL');
      a.box(cx - 200, yp - 60, Z1 - 330, cx + 200, yp + 40, Z1 - 120); a.box(cx - 170, yp + 40, Z1 - 300, cx + 170, yp + 50, Z1 - 170);
      for (const s of [-1, 1]) { const x = cx + s * (hx - 20); a.tube([[x, yp, Z1 - 420], [x + s * 10, (yp + fy) / 2 - 100, Z0 + 800], [x, fy - 100, Z0 + 1050]], [14, 14, 14], 6); a.cyl(x, fy - 100, Z0 + 1040, Z0 + 1160, 22, 10); a.tube([[cx + s * 160, yp + 100, Z1 - 250], [cx + s * 280, yp + 400, Z1 - 450], [cx + s * 300, yp + 420, Z0 + 1000]], [14, 14, 14], 6); }
      a.log('Added the floor frame, flywheel housing, crank arms, foot pedals, post, moving handles, grips and console (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic stair stepper',
    desc: (v) => v.k === 'mini' ? 'Mini stepper: a base platform with two pedal pads on hinged arms and hydraulic cylinders beneath, a short post with a bar and a small console.' : v.k === 'tall' ? 'Stepper with handles: a floor frame, two long pedal arms with pads and hydraulic cylinders, a front post with two side handles and a console.' : 'Rotating stair climber: a slanted frame with a loop of steps on chains, side handrails, a front post and a console.',
    vs: [['mini stepper, 40 in high', 18, 20, 40, 0, { k: 'mini' }], ['stepper with handles, 58 in high', 22, 36, 58, 0, { k: 'tall' }], ['rotating stair climber, 88 in high', 30, 40, 88, 0, { k: 'stair' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      if (v.k !== 'stair') {
        const hx = W / 2 - 100, tall = v.k === 'tall';
        a.box(cx - hx - 40, YF + 40, Z0, cx + hx + 40, YB - 40, Z0 + 40); a.rect(cx - hx - 40, YF + 40, cx + hx + 40, YB - 40);
        for (const [i, s] of [[0, -1], [1, 1]]) { const z = Z0 + 140 + i * 120; a.box(cx + s * hx - 90, YF + 140, z, cx + s * hx + 90, YF + 140 + (tall ? 330 : 240), z + 36); a.tube([[cx + s * hx, YB - 90, Z0 + 100], [cx + s * hx, YF + 200, z]], [18, 18], 6); a.cyl(cx + s * hx, YF + 280, Z0 + 40, z, 16, 8); a.rect(cx + s * hx - 90, YF + 140, cx + s * hx + 90, YF + 140 + (tall ? 330 : 240), 'EQUIP-DETAIL'); }
        a.tube([[cx, YB - 80, Z0 + 40], [cx, YB - 80, Z1 - (tall ? 160 : 60)]], [34, 30], 10); a.circ(cx, YB - 80, 34, 'EQUIP-DETAIL');
        if (tall) { a.box(cx - 150, YB - 150, Z1 - 330, cx + 150, YB - 20, Z1 - 150); for (const s of [-1, 1]) a.tube([[cx + s * 20, YB - 80, Z1 - 250], [cx + s * 270, YB - 160, Z1 - 330], [cx + s * 300, YB - 400, Z1 - 420]], [14, 14, 14], 6); } else a.tube([[cx - 220, YB - 80, Z1 - 80], [cx + 220, YB - 80, Z1 - 80]], [14, 14], 6);
      } else {
        const hx = W / 2 - 80, y0 = YF + 160, y1 = YB - 200, z0 = Z0 + 200, z1 = Z1 - 500, n = 9;
        for (const s of [-1, 1]) { a.tube([[cx + s * hx, y0, z0], [cx + s * hx, y1, z1]], [30, 30], 8); a.tube([[cx + s * hx, y0 + 60, z0 - 80], [cx + s * hx, y1 + 60, z1 - 120]], [22, 22], 8); a.tube([[cx + s * hx, y0, z0], [cx + s * hx, y0 + 60, z0 - 80]], [24, 24], 8); a.tube([[cx + s * hx, y1, z1], [cx + s * hx, y1 + 60, z1 - 120]], [24, 24], 8); a.cyl(cx + s * hx, y1 + 100, Z0, z1 - 200, 40, 10); a.box(cx + s * hx - 40, y0 - 100, Z0, cx + s * hx + 40, y1 + 140, Z0 + 30); a.tube([[cx + s * (hx + 40), y0 + 100, z0 + 700], [cx + s * (hx + 40), y1, z1 - 40]], [14, 14], 6);  }
        for (let i = 0; i < n; i++) { const f = i / (n - 1), y = y0 + (y1 - y0) * f, z = z0 + (z1 - z0) * f + 30; a.box(cx - hx + 30, y - 90, z, cx + hx - 30, y + 90, z + 30); a.box(cx - hx + 30, y - 94, z + 12, cx + hx - 30, y - 90, z + 30); }
        a.box(cx - hx + 20, y1 + 90, z1 - 200, cx + hx - 20, YB - 40, z1 + 40); a.box(cx - 180, YB - 160, Z1 - 330, cx + 180, YB - 60, Z1 - 120); a.tube([[cx - 60, YB - 100, z1], [cx - 60, YB - 100, Z1 - 330]], [18, 18], 6); a.tube([[cx + 60, YB - 100, z1], [cx + 60, YB - 100, Z1 - 330]], [18, 18], 6); a.rect(cx - hx - 40, y0 - 100, cx + hx + 40, y1 + 140, 'EQUIP-DETAIL');
      }
      a.log('Added the base frame, steps or pedals, post, handrails and console (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic leg press machine',
    desc: (v) => v.k === 'sled' ? 'Plate-loaded leg press: a slanted pair of runners on a floor frame, a sliding carriage with a foot plate, side plate horns, a padded seat and back rest, two safety stop bars and hand grips.' : v.k === 'stack' ? 'Seated leg press with a weight stack: a seat and reclined back pad, a foot plate on two arms, a stack of plates on guide rods with a pin, a shroud and hand grips.' : 'Hack squat machine: a slanted back pad and shoulder pads on a sliding carriage, a foot platform, two plate horns, safety stops and a floor frame.',
    vs: [['plate-loaded 45 degree, 76 in long', 44, 76, 56, 0, { k: 'sled' }], ['seated with weight stack', 34, 66, 70, 0, { k: 'stack' }], ['hack squat, plate-loaded', 38, 70, 66, 0, { k: 'hack' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, hx = W / 2 - (v.k === 'sled' ? 290 : 90); a.outline();
      if (v.k === 'stack') {
        a.box(cx - hx - 60, YF + 40, Z0, cx + hx + 60, YB - 40, Z0 + 50); a.rect(cx - hx - 60, YF + 40, cx + hx + 60, YB - 40);
        padB(a, cx - 220, YF + 700, Z0 + 250, cx + 220, YF + 1100, Z0 + 330); prismX(a, [[YF + 1000, Z0 + 330], [YF + 1130, Z0 + 330], [YF + 1480, Z0 + 600], [YF + 1350, Z0 + 640]], cx - 220, cx + 220);
        for (const s of [-1, 1]) { a.tube([[cx + s * 200, YF + 880, Z0 + 330], [cx + s * 200, YF + 500, Z0 + 520], [cx + s * 220, YF + 170, Z0 + 640]], [20, 20, 20], 6); a.tube([[cx + s * 260, YF + 1000, Z0 + 400], [cx + s * 260, YF + 1000, Z0 + 520]], [14, 14], 6); }
        a.box(cx - 280, YF + 160, Z0 + 560, cx + 280, YF + 200, Z0 + 860); a.rect(cx - 280, YF + 160, cx + 280, YF + 200, 'EQUIP-DETAIL');
        wstack(a, cx, YB - 260, Z0 + 60, 360, 300, 16, 40, 8, 5); a.box(cx - 200, YB - 440, Z0 + 60, cx + 200, YB - 100, Z1 - 100); a.box(cx - 40, YB - 100, Z0, cx + 40, YB - 30, Z1 - 20); a.tube([[cx, YB - 120, Z1 - 80], [cx, YF + 180, Z0 + 700]], [8, 8], 6);
      } else {
        const sled = v.k === 'sled', ang = sled ? 0.78 : 1.2, L = sled ? 1500 : 1300, yb = YF + 160, zb = Z0 + 80, dy = m.cos(ang) * L, dz = m.sin(ang) * L;
        for (const s of [-1, 1]) { a.tube([[cx + s * hx, yb + 240, zb], [cx + s * hx, yb + 240 + (sled ? dy * 0.0 + 0 : 0), zb]], [20, 20], 6); }
        a.box(cx - hx - 70, YF + 40, Z0, cx + hx + 70, YF + 140, Z0 + 60); a.box(cx - hx - 70, YB - 140, Z0, cx + hx + 70, YB - 40, Z0 + 60); a.box(cx - hx - 70, YF + 40, Z0, cx - hx - 10, YB - 40, Z0 + 60); a.box(cx + hx + 10, YF + 40, Z0, cx + hx + 70, YB - 40, Z0 + 60); a.rect(cx - hx - 70, YF + 40, cx + hx + 70, YB - 40);
        const p0 = [YB - 160, Z0 + 60], p1 = [YF + 220, Z0 + 60 + (sled ? 1000 : 1200)]; if (!sled) { p0[0] = YB - 220; p0[1] = Z0 + 60; p1[0] = YB - 500; p1[1] = Z1 - 100; }
        const pt = (f) => [p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f];
        for (const s of [-1, 1]) { a.tube([[cx + s * hx, ...pt(0)], [cx + s * hx, ...pt(1)]], [28, 28], 8); }
        if (sled) {
          const u = pt(0.62), w = pt(0.8); for (const s of [-1, 1]) a.tube([[cx + s * hx, ...pt(0)], [cx + s * hx, ...pt(0.1)]], [30, 30], 8);
          for (const s of [-1, 1]) a.tube([[cx + s * hx, ...pt(0.9)], [cx + s * hx, pt(0.9)[0] - 20, pt(0.9)[1] - 320]], [30, 30], 8);
          a.tube([[cx - hx, pt(0.1)[0], pt(0.1)[1] + 40], [cx + hx, pt(0.1)[0], pt(0.1)[1] + 40]], [22, 22], 8);
          padB(a, cx - 230, YB - 700, Z0 + 200, cx + 230, YB - 330, Z0 + 270); prismX(a, [[YB - 330, Z0 + 270], [YB - 200, Z0 + 300], [YB - 80, Z0 + 780], [YB - 190, Z0 + 800]], cx - 230, cx + 230);
          const c = pt(0.55); a.box(cx - 260, c[0] - 40, c[1] + 0, cx + 260, c[0] + 40, c[1] + 30); a.box(cx - 330, c[0] - 80, c[1] + 30, cx + 330, c[0] + 80, c[1] + 90); a.box(cx - hx - 30, c[0] - 70, c[1] - 140, cx + hx + 30, c[0] + 70, c[1] + 10);
          for (const s of [-1, 1]) { a.xcyl(cx + s * (hx + 30), cx + s * (hx + 330), c[0], c[1] - 70, 24, 10); plateX(a, cx + s * (hx + 160), c[0], c[1] - 70, 210, 40); }
          for (const s of [-1, 1]) a.tube([[cx + s * 300, YB - 300, Z0 + 270], [cx + s * 300, YB - 300, Z0 + 520]], [14, 14], 6);
        } else {
          const c = pt(0.35), d = pt(0.65); prismX(a, [[c[0] + 100, c[1]], [c[0] - 100, c[1] + 60], [d[0] - 130, d[1] + 70], [d[0] + 80, d[1]]], cx - 250, cx + 250);
          for (const s of [-1, 1]) { a.cyl(cx + s * 150, d[0] - 40, d[1] + 30, d[1] + 290, 40, 12); a.xcyl(cx + s * 100, cx + s * 300, c[0] + 60, c[1] - 20, 28, 10); plateX(a, cx + s * 150, c[0] + 60, c[1] - 20, 200, 40); a.tube([[cx + s * 140, d[0] - 150, d[1] + 210], [cx + s * 250, d[0] - 330, d[1] + 130]], [26, 26], 6); }
          a.box(cx - 280, YF + 140, Z0 + 60, cx + 280, YF + 700, Z0 + 100); a.rect(cx - 280, YF + 140, cx + 280, YF + 700, 'EQUIP-DETAIL');
        }
      }
      a.log('Added the floor frame, ' + (v.k === 'stack' ? 'seat, foot plate and weight stack' : v.k === 'sled' ? 'runners, carriage, foot plate, plate horns and seat' : 'carriage, pads, foot platform and plate horns') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic lat pulldown station',
    desc: (v) => `${v.low ? 'Lat pulldown and low row combination' : 'Lat pulldown'}: two tall uprights with a top pulley and a long bar on a cable, an adjustable thigh pad arm and a seat${v.low ? ', a second low pulley with a foot plate and a seat for rowing' : ''}, and a weight stack with pin behind.`,
    vs: [['with weight stack, 84 in high', 44, 56, 84, 0, { low: false }], ['combination with low row, 84 in high', 44, 76, 84, 0, { low: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, hx = W / 2 - 100, zt = Z1 - 100; a.outline();
      a.box(cx - hx - 60, YF + 40, Z0, cx + hx + 60, YB - 40, Z0 + 50); a.rect(cx - hx - 60, YF + 40, cx + hx + 60, YB - 40);
      wstack(a, cx, YB - 270, Z0 + 60, 360, 300, 18, 40, 8, 6); a.box(cx - 200, YB - 440, Z0 + 60, cx + 200, YB - 100, Z1 - 20);
      for (const s of [-1, 1]) a.box(cx + s * hx - 25, YB - 500, Z0 + 40, cx + s * hx + 25, YB - 450, zt + 60);
      a.box(cx - hx - 25, YB - 500, zt, cx + hx + 25, YB - 440, zt + 60); a.box(cx - 40, YB - 440, zt - 20, cx + 40, YB - 100, zt + 40);
      a.xcyl(cx - 40, cx + 40, YB - 580, zt - 10, 80, 20); a.tube([[cx, YB - 580, zt - 90], [cx, YB - 700, zt - 600]], [4, 4], 6);
      a.xcyl(cx - 560, cx + 560, YB - 700, zt - 640, 16, 10); for (const s of [-1, 1]) { a.tube([[cx + s * 560, YB - 700, zt - 640], [cx + s * 640, YB - 700, zt - 840]], [16, 16], 6); a.cyl(cx + s * 640, YB - 700, zt - 940, zt - 840, 18, 8); }
      padB(a, cx - 190, YB - 900, Z0 + 440, cx + 190, YB - 560, Z0 + 500);
      for (const s of [-1, 1]) { a.tube([[cx + s * 210, YB - 560, Z0 + 600], [cx + s * 210, YB - 1000, Z0 + 640]], [26, 26], 6); a.cyl(cx + s * 210, YB - 1000, Z0 + 640, Z0 + 790, 60, 12); }
      if (v.low) { const yf = YF + 160; a.box(cx - 130, YF + 120, Z0 + 50, cx + 130, YF + 520, Z0 + 410); a.box(cx - 150, YF + 700, Z0 + 50, cx + 150, YF + 1160, Z0 + 100); padB(a, cx - 200, YF + 1160, Z0 + 330, cx + 200, YF + 1600, Z0 + 400); a.tube([[cx, YF + 560, Z0 + 340], [cx, YB - 440, Z0 + 340]], [4, 4], 6); a.box(cx - 150, YF + 180, Z0 + 410, cx + 150, YF + 220, Z0 + 700); }
      a.log('Added the base, uprights, top pulley, bar, thigh pad arm, seat and weight stack' + (v.low ? ', the low pulley, foot plate and rowing seat' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic pull-up station',
    desc: (v) => v.k === 'tower' ? 'Power tower: a floor frame of two rails and cross feet, four tall posts, a pull-up bar with neutral grips on top, dip handles, a back pad and forearm pads for knee raises.' : v.k === 'free' ? 'Free-standing pull-up frame: a floor frame, two posts braced to the base, a top bar with outer grips, a mid-height dip bar pair and plate pegs at the rear.' : 'Wall mounting pull-up bar: a floor-standing backing board on a base, two arms to a multi-grip bar with a V bend, and fixing plates.',
    vs: [['power tower, 90 in high', 40, 52, 90, 0, { k: 'tower' }], ['free-standing frame, 96 in high', 52, 44, 96, 0, { k: 'free' }], ['backing board and multi-grip bar, 54 in wide', 54, 30, 40, 0, { k: 'wall' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      if (v.k === 'wall') {
        a.box(cx - 660, YB - 600, Z0, cx + 660, YB - 40, Z0 + 40); a.box(cx - 640, YB - 90, Z0 + 40, cx + 640, YB - 40, Z1 - 20); a.rect(cx - 660, YB - 600, cx + 660, YB - 40);
        for (const s of [-1, 1]) { a.box(cx + s * 520 - 45, YB - 40 - 4, Z0 + 520, cx + s * 520 + 45, YB - 30, Z0 + 700); a.tube([[cx + s * 520, YB - 90, Z0 + 620], [cx + s * 520, YB - 460, Z0 + 620]], [22, 22], 8); }
        a.tube([[cx - 520, YB - 460, Z0 + 620], [cx - 330, YB - 560, Z0 + 640], [cx - 160, YB - 560, Z0 + 640], [cx + 160, YB - 560, Z0 + 640], [cx + 330, YB - 560, Z0 + 640], [cx + 520, YB - 460, Z0 + 620]], [20, 20, 20, 20, 20, 20], 8);
        for (const x of [-250, 0, 250]) a.tube([[cx + x, YB - 560, Z0 + 640], [cx + x, YB - 460, Z0 + 640]], [14, 14], 6);
        a.rect(cx - 640, YB - 90, cx + 640, YB - 40, 'EQUIP-DETAIL'); return a.log('Added the base, backing board, fixing plates, arms and the multi-grip bar (plan and 3D).');
      }
      const hx = W / 2 - 120, yf = YF + 140, yb = YB - 140, zt = Z1 - 120;
      for (const s of [-1, 1]) { a.box(cx + s * hx - 25, YF + 40, Z0, cx + s * hx + 25, YB - 40, Z0 + 50); a.box(cx + s * hx - 80, YF + 30, Z0, cx + s * hx + 80, YF + 90, Z0 + 20); a.box(cx + s * hx - 80, YB - 90, Z0, cx + s * hx + 80, YB - 30, Z0 + 20);
        for (const y of v.k === 'tower' ? [yf, yb] : [yb - 300, yb]) { a.box(cx + s * hx - 25, y - 25, Z0 + 50, cx + s * hx + 25, y + 25, zt); } if (v.k === 'free') { a.tube([[cx + s * hx, yb - 300, Z0 + 1700], [cx + s * hx, YF + 100, Z0 + 30]], [20, 20], 6); } }
      a.rect(cx - hx - 80, YF + 30, cx + hx + 80, YB - 30);
      if (v.k === 'tower') {
        a.tube([[cx - hx, yb, zt], [cx + hx, yb, zt]], [22, 22], 8); a.tube([[cx - hx, yf, zt], [cx + hx, yf, zt]], [22, 22], 8); for (const s of [-1, 1]) a.tube([[cx + s * hx, yf, zt], [cx + s * hx, yb, zt]], [22, 22], 8);
        for (const s of [-1, 1]) { a.tube([[cx + s * hx * 0.45, yf, zt - 300], [cx + s * hx * 0.45, yf + 560, zt - 300]], [22, 22], 8); a.cyl(cx + s * hx * 0.45, yf, zt - 300, zt, 22, 8); }
        for (const s of [-1, 1]) { a.tube([[cx + s * hx, yf, Z0 + 1050], [cx + s * hx * 0.5, yf, Z0 + 1050]], [20, 20], 8); a.box(cx + s * hx * 0.5 - 70, yf - 40, Z0 + 1000, cx + s * hx * 0.5 + 70, yf + 40, Z0 + 1020); }
        padB(a, cx - 220, yf + 40, Z0 + 700, cx + 220, yf + 90, Z0 + 1800 > zt ? zt - 200 : Z0 + 1800); for (const s of [-1, 1]) { a.tube([[cx + s * hx, yb, Z0 + 1050], [cx + s * hx * 0.45, yb - 100, Z0 + 1050]], [22, 22], 8); a.cyl(cx + s * hx * 0.45, yb - 160, Z0 + 1010, Z0 + 1080, 40, 10); }
      } else {
        a.tube([[cx - hx, yb, zt], [cx + hx, yb, zt]], [24, 24], 8); a.tube([[cx - hx, yb - 300, zt], [cx + hx, yb - 300, zt]], [24, 24], 8); for (const s of [-1, 1]) { a.tube([[cx + s * hx, yb - 300, zt], [cx + s * hx, yb, zt]], [24, 24], 8); a.tube([[cx + s * hx, yb - 300, zt - 0], [cx + s * (hx - 100), yb - 520, zt + 0 - 140]], [16, 16], 6); a.tube([[cx + s * hx, yb - 150, Z0 + 1200], [cx + s * hx, yf + 260, Z0 + 1200]], [18, 18], 8); a.cyl(cx + s * hx, yb - 90, Z0 + 40, Z0 + 320, 18, 8); }
      }
      a.log('Added the floor frame, posts, bars and ' + (v.k === 'tower' ? 'back pad, forearm pads and dip handles' : 'dip bars and plate pegs') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic smith machine',
    desc: (v) => `Smith machine ${v.hh} in high: a base frame, two vertical guide rods with a sliding bar and hook latches every few inches, ${v.pegs ? 'four plate storage pegs, ' : ''}two safety stop rods with a cross plate at the top and a bar catch.`,
    vs: [['standard, 82 in high', 84, 56, 82, 0, { hh: 82, pegs: false }], ['with plate pegs, 90 in high', 88, 62, 90, 0, { hh: 90, pegs: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, hx = W / 2 - 300, y = YB - 200; a.outline();
      a.box(cx - W / 2 + 50, YF + 40, Z0, cx + W / 2 - 50, YF + 140, Z0 + 55); a.box(cx - W / 2 + 50, YB - 140, Z0, cx + W / 2 - 50, YB - 40, Z0 + 55); for (const s of [-1, 1]) a.box(cx + s * (W / 2 - 100) - 25, YF + 40, Z0, cx + s * (W / 2 - 100) + 25, YB - 40, Z0 + 55); a.rect(cx - W / 2 + 50, YF + 40, cx + W / 2 - 50, YB - 40);
      for (const s of [-1, 1]) { a.box(cx + s * hx - 50, y - 50, Z0 + 55, cx + s * hx + 50, y + 50, Z1 - 40); a.cyl(cx + s * hx, y - 70, Z0 + 150, Z1 - 70, 12, 8); for (let k = 0; k < 18; k++) a.box(cx + s * hx - 28, y - 60, Z0 + 300 + k * 85, cx + s * hx + 28, y - 50, Z0 + 312 + k * 85); a.cyl(cx + s * (hx + 200), y + 140, Z0 + 55, Z0 + 700, 14, 8); a.tube([[cx + s * hx, y, Z0 + 600], [cx + s * (hx + 200), y + 140, Z0 + 600]], [14, 14], 6); a.tube([[cx + s * hx, y, Z0 + 1300], [cx + s * (hx + 200), y + 140, Z0 + 1300]], [14, 14], 6); }
      a.box(cx - hx - 50, y - 50, Z1 - 80, cx + hx + 50, y + 50, Z1 - 40); const zb = Z0 + 1100; a.xcyl(cx - hx - 250, cx + hx + 250, y - 90, zb, 14, 10); for (const s of [-1, 1]) { a.box(cx + s * hx - 50, y - 100, zb - 60, cx + s * hx + 50, y - 50, zb + 60); a.xcyl(cx + s * (hx + 250) - 20, cx + s * (hx + 250) + 20, y - 90, zb, 24, 10); }
      if (v.pegs) for (const s of [-1, 1]) for (const z of [500, 800]) { a.ycyl(y + 50, y + 150, cx + s * (hx - 50), Z0 + z, 22, 8); a.cyl(cx + s * (hx - 50), y + 150, Z0 + z - 20, Z0 + z + 60, 28, 8); }
      a.line(cx - hx, y, cx + hx, y, 'EQUIP'); a.log('Added the base, guide rods with latches, sliding bar, stop rods, top plate' + (v.pegs ? ' and plate pegs' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic plyometric box',
    desc: (v) => v.k === 'wood' ? 'Wooden plyo box 24 in high: a plywood shell with hand slots in the front and back and rubber feet, and edge strips.' : v.k === 'foam' ? 'Soft foam plyo box set: three stacked boxes of 12, 18 and 24 in laid out in a row, each with a bevelled top edge and a slotted base.' : 'Aerobic step: a long platform with a non-slip top ridge, rubber end feet and two stacked riser blocks.',
    vs: [['wooden box, 24 in high', 30, 24, 24, 0, { k: 'wood' }], ['foam box set, 12 18 24 in', 84, 24, 24, 0, { k: 'foam' }], ['aerobic step with two risers', 44, 16, 10, 0, { k: 'step' }]],
    build: (a, v) => {
      const { Z0, YF, YB, cx, W } = a; a.outline();
      if (v.k === 'wood') { const x0 = cx - 380, x1 = cx + 380, y0 = YF + 40, y1 = YB - 40, zt = Z0 + 600, t = 18, cyc = (y0 + y1) / 2;
        a.box(x0, y0, Z0 + 14, x0 + t, y1, zt); a.box(x1 - t, y0, Z0 + 14, x1, y1, zt); a.box(x0, y0, zt - t, x1, y1, zt); a.box(x0, y0, Z0 + 14, x1, y0 + t, Z0 + 150); a.box(x0, y0, Z0 + 340, x1, y0 + t, zt - t); a.box(x0, y0, Z0 + 150, x0 + 130, y0 + t, Z0 + 340); a.box(x1 - 130, y0, Z0 + 150, x1, y0 + t, Z0 + 340);
        a.box(x0, y1 - t, Z0 + 14, x1, y1, Z0 + 150); a.box(x0, y1 - t, Z0 + 340, x1, y1, zt - t); a.box(x0, y1 - t, Z0 + 150, x0 + 130, y1, Z0 + 340); a.box(x1 - 130, y1 - t, Z0 + 150, x1, y1, Z0 + 340);
        for (const [x, y] of [[x0 + 40, y0 + 40], [x1 - 40, y0 + 40], [x0 + 40, y1 - 40], [x1 - 40, y1 - 40]]) a.cyl(x, y, Z0, Z0 + 14, 26, 10); a.box(x0 + 60, y0 + 60, zt, x1 - 60, y1 - 60, zt + 3); a.rect(x0, y0, x1, y1);
      } else if (v.k === 'foam') { const hs = [12, 18, 24], bw = 560, gap = 30, x00 = cx - (3 * bw + 2 * gap) / 2, y0 = YF + 40, y1 = YB - 40;
        hs.forEach((h, i) => { const x0 = x00 + i * (bw + gap), x1 = x0 + bw, zt = Z0 + h * IN; a.box(x0, y0, Z0, x1, y1, zt - 30); a.box(x0 + 30, y0 + 30, zt - 30, x1 - 30, y1 - 30, zt); a.box(x0 + 8, y0 + 8, zt - 40, x1 - 8, y1 - 8, zt - 30); a.box(x0 + 80, y0 - 3, Z0 + 20, x1 - 80, y0, Z0 + 20 + h * IN * 0.35); a.rect(x0, y0, x1, y1); }); }
      else { const x0 = cx - 540, x1 = cx + 540, y0 = YF + 30, y1 = YB - 30; a.box(x0 + 50, y0, Z0 + 20, x1 - 50, y1, Z0 + 150); a.box(x0, y0, Z0 + 150, x1, y1, Z0 + 200); for (let i = 0; i < 7; i++) a.box(x0 + 120 + i * 120, y0 + 20, Z0 + 200, x0 + 150 + i * 120, y1 - 20, Z0 + 215); for (const s of [-1, 1]) { a.box(s > 0 ? x1 - 60 : x0, y0, Z0, s > 0 ? x1 : x0 + 60, y1, Z0 + 50); a.box(s > 0 ? x1 - 150 : x0 + 100, y0 + 20, Z0 + 20, s > 0 ? x1 - 100 : x0 + 150, y1 - 20, Z0 + 150); } a.rect(x0, y0, x1, y1); a.line(x0 + 120, (y0 + y1) / 2, x1 - 120, (y0 + y1) / 2, 'EQUIP-DETAIL'); }
      a.log('Added the ' + (v.k === 'wood' ? 'plywood shell, hand slots and feet' : v.k === 'foam' ? 'three foam boxes with bevelled tops' : 'platform, grip ridges, end feet and riser blocks') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic medicine ball rack',
    desc: (v) => v.tree ? `Medicine ball tree: a round base, a tall post and ${v.n} ring cradles stepping down the post, each holding a weighted ball.` : `Two-tier medicine ball shelf rack with ${v.n} slots: end frames, two slanted shelves of rails with a front lip, and a ball in each slot.`,
    vs: [['tree with 5 balls', 26, 26, 52, 0, { tree: true, n: 5 }], ['two-tier shelf rack, 6 balls', 54, 22, 34, 0, { tree: false, n: 6 }]],
    build: (a, v) => {
      const { Z0, YF, cx, W, D, Z1 } = a, cy = YF / 2; a.outline();
      if (v.tree) { a.cyl(cx, cy, Z0, Z0 + 30, 300, 24); a.circ(cx, cy, 300, 'EQUIP'); a.cyl(cx, cy, Z0 + 30, Z1 - 20, 30, 10);
        for (let i = 0; i < v.n; i++) { const t = (i / v.n) * 2 * PI, r = 210, x = cx + m.cos(t) * r, y = cy + m.sin(t) * r, z = Z0 + 280 + i * 190; a.tube([[cx, cy, z], [x, y, z]], [10, 10], 6); ring(a, 'xy', x, y, z, 92, 6, 18, 5); a.ell(x, y, z + 92, 105, 105, 105, 14, 9); a.circ(x, y, 105, 'EQUIP-DETAIL'); } }
      else { const hw = W / 2 - 60; for (const s of [-1, 1]) { a.box(cx + s * hw - 20, YF + 50, Z0, cx + s * hw + 20, YF + 80, Z1 - 30); a.box(cx + s * hw - 20, -80, Z0, cx + s * hw + 20, -50, Z1 - 30); a.box(cx + s * hw - 20, YF + 40, Z0, cx + s * hw + 20, -40, Z0 + 30); a.box(cx + s * hw - 20, YF + 40, Z1 - 60, cx + s * hw + 20, -40, Z1 - 30); }
        for (const z of [Z0 + 180, Z0 + 560]) { for (let k = 0; k < 5; k++) a.tube([[cx - hw, YF + 60 + k * (D - 120) / 4, z], [cx + hw, YF + 60 + k * (D - 120) / 4, z]], [9, 9], 6); a.box(cx - hw, YF + 40, z + 20, cx + hw, YF + 60, z + 90); a.rect(cx - hw, YF + 40, cx + hw, -40, 'EQUIP-DETAIL'); }
        for (let i = 0; i < v.n; i++) { const tier = i < v.n / 2 ? 0 : 1, k = i % (v.n / 2), x = cx - hw + 100 + (k + 0.5) * ((2 * hw - 200) / (v.n / 2)), z = (tier ? Z0 + 560 : Z0 + 180) + 20 + 105; a.ell(x, YF / 2, z, 105, 105, 105, 14, 9); } }
      a.log('Added the ' + (v.tree ? 'base, post, ring cradles' : 'end frames, shelf rails and lips') + ' and the medicine balls (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic cardio bike',
    desc: (v) => v.k === 'air' ? 'Air resistance fan bike: a large front fan wheel with a cage, a long frame on two wide feet, a saddle, two pedals with cranks and two long moving handles linked to the fan, and a small display.' : `${cap(v.k)} recumbent exercise bike: a long floor frame with wide feet, a ${v.k === 'step-through' ? 'low step-through seat rail' : 'sloped seat rail'}, a contoured seat with a back rest, forward pedals with straps, side grips and a console on a short post.`,
    vs: [['recumbent', 26, 64, 46, 0, { k: 'recumbent' }], ['step-through recumbent', 26, 58, 46, 0, { k: 'step-through' }], ['air fan bike', 24, 54, 52, 0, { k: 'air' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      a.box(cx - W / 2 + 40, YF + 40, Z0, cx + W / 2 - 40, YF + 110, Z0 + 40); a.box(cx - W / 2 + 40, YB - 110, Z0, cx + W / 2 - 40, YB - 40, Z0 + 40); a.rect(cx - W / 2 + 40, YF + 40, cx + W / 2 - 40, YB - 40, 'EQUIP-DETAIL');
      if (v.k === 'air') {
        const yw = YF + 290, zw = Z0 + 440; ring(a, 'yz', cx, yw, zw, 330, 14, 28, 5); a.xcyl(cx - 50, cx + 50, yw, zw, 40, 12); for (let i = 0; i < 12; i++) { const t = (i / 12) * 2 * PI; a.tube([[cx, yw, zw], [cx + 0, yw + m.cos(t) * 320, zw + m.sin(t) * 320]], [3, 3], 4); a.box(cx - 10, yw + m.cos(t) * 150 - 40, zw + m.sin(t) * 150 - 5, cx + 10, yw + m.cos(t) * 150 + 40, zw + m.sin(t) * 150 + 5); } ring(a, 'yz', cx, yw, zw, 336, 6, 28, 4);
        a.tube([[cx, YF + 60, Z0 + 40], [cx, yw + 10, zw - 340], [cx, yw + 160, zw]], [32, 32, 32], 8); a.tube([[cx, yw + 130, Z0 + 40], [cx, YB - 420, Z0 + 700]], [30, 30], 8); a.cyl(cx, YB - 380, Z0 + 600, Z0 + 700, 32, 10); padB(a, cx - 130, YB - 560, Z0 + 700, cx + 130, YB - 250, Z0 + 770); a.tube([[cx, YB - 420, Z0 + 700], [cx, YB - 440, Z0 + 580]], [20, 20], 8);
        for (const s of [-1, 1]) { a.xcyl(cx + s * 200, cx + s * 240, yw + 340, Z0 + 340, 26, 10); a.tube([[cx + s * 220, yw + 340, Z0 + 340], [cx + s * 220, yw + 560, Z0 + 260]], [14, 14], 6); a.box(cx + s * 220 - 60, yw + 540, Z0 + 250, cx + s * 220 + 60, yw + 680, Z0 + 275); a.tube([[cx + s * 280, yw + 200, Z0 + 1020], [cx + s * 280, yw + 700, Z0 + 1050], [cx + s * 280, yw + 800, Z0 + 600]], [16, 16, 16], 6); }
        a.box(cx - 130, yw + 200, Z1 - 160, cx + 130, yw + 300, Z1 - 60); a.tube([[cx, yw + 230, Z0 + 600], [cx, yw + 250, Z1 - 160]], [24, 22], 8);
      } else {
        const low = v.k === 'step-through' ? 220 : 320;
        a.tube([[cx, YF + 80, Z0 + 40], [cx, YF + 300, Z0 + 520], [cx, YF + 760, Z0 + 480]], [30, 30, 30], 8); a.tube([[cx, YF + 760, Z0 + 480], [cx, YB - 520, Z0 + low]], [32, 32], 8); a.tube([[cx, YB - 520, Z0 + low], [cx, YB - 150, Z0 + 40]], [28, 28], 8);
        padB(a, cx - 200, YB - 640, Z0 + low + 40, cx + 200, YB - 290, Z0 + low + 130); prismX(a, [[YB - 290, Z0 + low + 130], [YB - 190, Z0 + low + 120], [YB - 80, Z0 + low + 660], [YB - 190, Z0 + low + 670]], cx - 200, cx + 200);
        a.tube([[cx, YF + 300, Z0 + 520], [cx, YF + 260, Z1 - 200]], [26, 24], 8); a.box(cx - 150, YF + 180, Z1 - 230, cx + 150, YF + 290, Z1 - 80);
        for (const s of [-1, 1]) { a.xcyl(cx + s * 100, cx + s * 250, YF + 430, Z0 + 440, 30, 10); a.tube([[cx + s * 190, YF + 430, Z0 + 440], [cx + s * 190, YF + 330, Z0 + 330]], [14, 14], 6); a.box(cx + s * 190 - 70, YF + 200, Z0 + 310, cx + s * 190 + 70, YF + 360, Z0 + 335); a.tube([[cx + s * 270, YB - 620, Z0 + low + 130], [cx + s * 270, YB - 760, Z0 + low + 300], [cx + s * 230, YB - 800, Z0 + low + 480]], [14, 14, 14], 6); }
      }
      a.log('Added the floor frame and feet, ' + (v.k === 'air' ? 'fan wheel with cage, moving handles, cranks, pedals and saddle' : 'seat with back rest, cranks, pedals, side grips and console') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic weight plate tree',
    desc: (v) => `Weight plate tree with ${v.n} horns: a wide cross-foot base, a tall post and ${v.n} horns in pairs on ${v.n / 2} levels, each loaded with two round plates of different diameters.`,
    vs: [['4 horns', 32, 24, 54, 0, { n: 4 }], ['6 horns', 32, 24, 70, 0, { n: 6 }], ['8 horns', 32, 24, 86, 0, { n: 8 }]],
    build: (a, v) => {
      const { Z0, YF, cx, Z1 } = a, cy = YF / 2; a.outline();
      a.box(cx - 380, cy - 40, Z0, cx + 380, cy + 40, Z0 + 40); a.box(cx - 40, cy - 280, Z0, cx + 40, cy + 280, Z0 + 40); a.cyl(cx, cy, Z0 + 40, Z1 - 20, 38, 12); a.rect(cx - 380, cy - 40, cx + 380, cy + 40); a.rect(cx - 40, cy - 280, cx + 40, cy + 280);
      for (let i = 0; i < v.n / 2; i++) { const z = Z0 + 300 + i * 440; for (const s of [-1, 1]) { a.tube([[cx + s * 38, cy, z + 40], [cx + s * 300, cy, z]], [24, 22], 8); plateX(a, cx + s * 170, cy, z + 40 + 60, i % 2 ? 160 : 225, 34); plateX(a, cx + s * 220, cy, z + 100, i % 2 ? 130 : 180, 30); } a.cyl(cx, cy, z - 30, z + 70, 46, 10); }
      a.log('Added the cross-foot base, post, horns and the plates (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic push sled',
    desc: (v) => v.high ? 'Push sled with high handles: two ski-shaped runners, a rectangular frame, two tall upright posts carrying plate horns, two push handles at shoulder height and a pull ring at the front.' : 'Low push sled: two ski-shaped runners, a rectangular frame, four short plate horns, a pair of low push posts with grips and a pull ring at the front.',
    vs: [['low frame, 4 plate horns', 28, 54, 40, 0, { high: false }], ['high handles, 2 tall posts', 30, 58, 62, 0, { high: true }]],
    build: (a, v) => {
      const { Z0, YF, YB, cx, Z1 } = a, hx = a.W / 2 - 100; a.outline();
      for (const s of [-1, 1]) { const x = cx + s * hx; prismX(a, [[YF + 40, Z0 + 90], [YF + 120, Z0 + 20], [YB - 40, Z0 + 20], [YB - 40, Z0 + 60], [YF + 100, Z0 + 100]], x - 28, x + 28); a.tube([[x, YF + 90, Z0 + 95], [x, YF + 300, Z0 + 150]], [20, 20], 6); }
      a.box(cx - hx, YF + 200, Z0 + 110, cx + hx, YF + 280, Z0 + 150); a.box(cx - hx, YB - 260, Z0 + 110, cx + hx, YB - 180, Z0 + 150); for (const s of [-1, 1]) a.box(cx + s * hx - 30, YF + 200, Z0 + 110, cx + s * hx + 30, YB - 180, Z0 + 150); a.rect(cx - hx - 30, YF + 40, cx + hx + 30, YB - 40);
      a.ycyl(YF + 40, YF + 160, cx, Z0 + 150, 12, 8); ring(a, 'yz', cx, YF + 60, Z0 + 150, 60, 7, 18, 5);
      const hh = v.high ? Z1 - 90 : Z0 + 560;
      for (const s of [-1, 1]) { const x = cx + s * (hx - 70); if (v.high) { a.tube([[x, YB - 300, Z0 + 150], [x, YB - 340, hh]], [22, 22], 8); a.cyl(x, YB - 340, hh, hh + 80, 25, 8); a.xcyl(x - 60, x + 60, YB - 340, hh + 40, 18, 8); a.cyl(x, YF + 370, Z0 + 150, Z0 + 440, 20, 8); } else { a.tube([[x, YB - 300, Z0 + 150], [x, YB - 330, hh]], [22, 22], 8); a.xcyl(x - 70, x + 70, YB - 330, hh, 18, 8); a.cyl(x, YF + 420, Z0 + 150, Z0 + 440, 20, 8); a.cyl(x, YF + 600, Z0 + 150, Z0 + 440, 20, 8); } }
      for (const s of [-1, 1]) if (v.high) { plateX(a, cx + s * (hx - 70), YF + 370, Z0 + 270, 140, 40); }
      a.log('Added the runners, frame, plate horns, push posts with grips and the pull ring (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic back extension bench',
    desc: (v) => `${cap(v.kind)}: a floor frame with two wide feet, ${v.ang === 0 ? 'a level' : 'an angled'} thigh pad and an adjustable hip pad on a post, a footplate with two ankle roller pads and hand grips.`,
    vs: [['roman chair, 45 degree', 30, 52, 40, 0, { kind: 'roman chair at 45 degrees', ang: 45 }], ['hyperextension, level 90 degree', 28, 56, 44, 0, { kind: 'hyperextension bench at 90 degrees', ang: 0 }], ['glute ham developer', 30, 62, 46, 0, { kind: 'glute ham developer', ang: 20, ghd: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, hx = W / 2 - 70; a.outline();
      a.box(cx - hx - 60, YF + 40, Z0, cx + hx + 60, YF + 120, Z0 + 40); a.box(cx - hx - 60, YB - 120, Z0, cx + hx + 60, YB - 40, Z0 + 40); for (const s of [-1, 1]) a.box(cx + s * hx - 25, YF + 40, Z0, cx + s * hx + 25, YB - 40, Z0 + 50); a.rect(cx - hx - 60, YF + 40, cx + hx + 60, YB - 40);
      const pa = v.ang * PI / 180, sy = YB - 380;
      for (const s of [-1, 1]) { a.tube([[cx + s * hx, YB - 80, Z0 + 50], [cx + s * hx, sy, Z0 + 700]], [24, 24], 8); a.tube([[cx + s * hx, YF + 300, Z0 + 50], [cx + s * hx, YF + 320, Z0 + 500]], [22, 22], 8); }
      const ty = sy - 100, tz = Z0 + 780; prismX(a, [[ty - 420, tz - 40 - 420 * m.sin(pa)], [ty - 420, tz + 20 - 420 * m.sin(pa)], [ty, tz + 40], [ty, tz - 20]], cx - 200, cx + 200);
      a.box(cx - 180, sy + 40, tz - 160, cx + 180, sy + 140, tz + 40); a.tube([[cx, sy + 90, tz - 200], [cx, sy + 90, Z0 + 700]], [20, 20], 8);
      const fy = YF + 340; a.box(cx - 220, YF + 200, Z0 + 520, cx + 220, fy + 130, Z0 + 560); for (const s of [-1, 1]) for (const z of [Z0 + 640, Z0 + 740]) a.xcyl(cx + s * 120 - 100, cx + s * 120 + 100, fy + 160, z, 42, 12);
      if (v.ghd) a.tube([[cx - hx, YF + 300, Z0 + 420], [cx + hx, YF + 300, Z0 + 420]], [16, 16], 6);
      a.log('Added the floor frame, thigh pad, hip pad, footplate with ankle rollers and the grips (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', ft: true, title: 'Generic functional training rig',
    desc: (v) => `Free-standing functional training rig with ${v.n} stations: a row of square posts front and back joined by top and mid beams, a pull-up bar per bay, two hanging ring straps in the end bays, base plates and plate pegs on the end posts.`,
    vs: [['4 stations, 12 ft', 12, 4, 108, 0, { n: 4 }], ['6 stations, 18 ft', 18, 4, 108, 0, { n: 6 }], ['8 stations, 24 ft', 24, 4, 108, 0, { n: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, bay = (W - 200) / v.n, x0 = X0 + 100, yf = YF + 100, yb = YB - 100, zt = Z1 - 60; a.outline();
      for (let i = 0; i <= v.n; i++) { const x = x0 + i * bay; for (const y of [yf, yb]) { a.box(x - 40, y - 40, Z0 + 20, x + 40, y + 40, zt); a.box(x - 100, y - 100, Z0, x + 100, y + 100, Z0 + 20); } a.tube([[x, yf, zt], [x, yb, zt]], [30, 30], 6); a.tube([[x, yf, Z0 + 1500], [x, yb, Z0 + 1500]], [20, 20], 6); a.tube([[x, yf, Z0 + 600], [x, yb, Z0 + 600]], [20, 20], 6); }
      for (const y of [yf, yb]) { a.tube([[x0, y, zt], [x0 + v.n * bay, y, zt]], [30, 30], 6); a.tube([[x0, y, Z0 + 1500], [x0 + v.n * bay, y, Z0 + 1500]], [18, 18], 6); }
      for (let i = 0; i < v.n; i++) a.tube([[x0 + (i + 0.5) * bay, yf, zt - 120], [x0 + (i + 0.5) * bay, yb, zt - 120]], [20, 20], 6);
      for (const [i, f] of [[0, 0.3], [v.n - 1, 0.7]]) for (const s of [-0.18, 0.18]) { const x = x0 + (i + 0.5 + s) * bay; a.tube([[x, yf, zt - 30], [x, yf, zt - 700]], [8, 8], 4); ring(a, 'xz', x, yf, zt - 760, 60, 8, 18, 5); }
      for (const [x, y] of [[x0, yf], [x0, yb], [x0 + v.n * bay, yf], [x0 + v.n * bay, yb]]) for (const dz of [500, 900]) a.ycyl(y + (y === yf ? -1 : 1) * 60, y + (y === yf ? -1 : 1) * 240, x, Z0 + dz, 24, 8);
      a.rect(x0 - 100, yf - 100, x0 + v.n * bay + 100, yb + 100, 'EQUIP-DETAIL'); a.log('Added the posts with base plates, top and mid beams, pull-up bars, ring straps and plate pegs (plan and 3D).');
    } }),

  fam({ cat: 'sport/fitness', title: 'Generic mat and roller rack',
    desc: (v) => `${v.n} ${v.roll ? 'foam rollers' : 'rolled exercise mats'} stored on a floor rack: two end frames on feet, ${v.rows} rows of cross rails, and each ${v.roll ? 'roller 6 in across' : 'mat rolled to 5 in across with a strap'} lying along the rack.`,
    vs: [['10 rolled mats', 44, 24, 36, 0, { n: 10, rows: 2, roll: false, rad: 64 }], ['8 foam rollers', 40, 22, 30, 0, { n: 8, rows: 2, roll: true, rad: 76 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, per = v.n / v.rows, hw = W / 2 - 60; a.outline();
      for (const s of [-1, 1]) { a.box(cx + s * hw - 22, YF + 40, Z0, cx + s * hw + 22, YB - 40, Z0 + 40); a.box(cx + s * hw - 22, YF + 60, Z0, cx + s * hw + 22, YF + 100, Z1 - 30); a.box(cx + s * hw - 22, YB - 100, Z0, cx + s * hw + 22, YB - 60, Z1 - 30); a.box(cx + s * hw - 22, YF + 60, Z1 - 70, cx + s * hw + 22, YB - 60, Z1 - 30); }
      const zs = [Z0 + 80, Z0 + 80 + (Z1 - Z0 - 220) / 2 + 40]; for (const z of zs) for (const y of [YF + 80, YB - 80, 0 + YF / 2]) a.tube([[cx - hw, y, z], [cx + hw, y, z]], [10, 10], 6);
      const r = v.rad, ys = [YF + 80 + r + 20, YB - 80 - r - 20];
      for (let i = 0; i < v.n; i++) { const row = i % v.rows, k = m.floor(i / v.rows), y = ys[row] , z = zs[row] + 10 + r, x0 = cx - hw + 40 + k * ((2 * hw - 80) / per); a.xcyl(x0 + 4, x0 + (2 * hw - 80) / per - 4, y, z, r, 16); if (!v.roll) { a.xcyl(x0 + 20, x0 + 26, y, z, r + 3, 16); } else a.xcyl(x0 + 4, x0 + (2 * hw - 80) / per - 4, y, z, r * 0.4, 10); }
      a.rect(cx - hw, YF + 40, cx + hw, YB - 40, 'EQUIP-DETAIL'); a.log('Added the end frames, cross rails and the ' + (v.roll ? 'foam rollers' : 'rolled mats') + ' (plan and 3D).');
    } }),
];

// ------------------------------------------------------------------------------------------ venues
function climbHolds(a, pts, seed, n, sMin = 26, sMax = 54) {
  let r = seed; const rnd = () => { r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x7fffffff; };
  for (let i = 0; i < n; i++) { const [x, y, z] = pts(rnd(), rnd()); const s = sMin + rnd() * (sMax - sMin); a.ell(x, y, z, s * 1.1, s * 0.7, s * 0.8, 6, 4); }
}

const VENUES = [
  fam({ cat: 'sport/venues', title: 'Generic stadium floodlight mast',
    desc: (v) => `Floodlight mast ${v.hFt} ft high: a tapered round pole on a base plate with anchor bolts, a cage ladder with hoops, a service platform with a rail, and a lamp head of ${v.rows} rows of ${v.cols} round lamps with lenses on a steel frame.`,
    vs: [['65 ft, 6 lamps', 72, 44, 790, 0, { hFt: 65, rows: 2, cols: 3, rb: 150 }], ['100 ft, 12 lamps', 84, 52, 1210, 0, { hFt: 100, rows: 3, cols: 4, rb: 190 }], ['130 ft, 20 lamps', 108, 56, 1570, 0, { hFt: 130, rows: 4, cols: 5, rb: 230 }]],
    build: (a, v) => {
      const { Z0, YB, cx } = a, py = YB - 420, H = v.hFt * FT, hh = H - 20; a.outline();
      a.box(cx - 380, py - 380, Z0, cx + 380, py + 380, Z0 + 40); a.rect(cx - 380, py - 380, cx + 380, py + 380); for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.cyl(cx + dx * 300, py + dy * 300, Z0 + 40, Z0 + 90, 18, 8);
      a.tube([[cx, py, Z0 + 40], [cx, py, Z0 + hh * 0.55], [cx, py, Z0 + hh]], [v.rb, v.rb * 0.78, v.rb * 0.56], 12); a.circ(cx, py, v.rb, 'EQUIP-DETAIL');
      const ly = py - v.rb - 30; a.tube([[cx - 70, ly, Z0 + 150], [cx - 70, ly, Z0 + hh - 400]], [9, 9], 6); a.tube([[cx + 70, ly, Z0 + 150], [cx + 70, ly, Z0 + hh - 400]], [9, 9], 6);
      for (let z = Z0 + 300; z < Z0 + hh - 400; z += 300) a.xcyl(cx - 70, cx + 70, ly, z, 6, 5); for (let z = Z0 + 2400; z < Z0 + hh - 400; z += 2400) ring(a, 'xy', cx, py - v.rb * 0.4, z, v.rb + 120, 5, 12, 4);
      const zp = Z0 + hh - 300; ring(a, 'xy', cx, py, zp, 330, 12, 18, 4); a.cyl(cx, py, zp - 8, zp, 330, 18);
      const cw = v.cols * 340, ch = v.rows * 340, zc = Z0 + hh + 150 > Z0 + H ? Z0 + H - ch / 2 - 20 : Z0 + hh; a.frame(cx - cw / 2 - 40, zc - ch / 2 - 40 + 20, cx + cw / 2 + 40, zc + ch / 2 + 40 + 20, py - 240, py - 200, 30); a.box(cx - cw / 2, py - 200, zc - ch / 2, cx + cw / 2, py - 40, zc + ch / 2 + 40);
      for (let r = 0; r < v.rows; r++) for (let c = 0; c < v.cols; c++) { const x = cx - cw / 2 + (c + 0.5) * 340, z = zc - ch / 2 + (r + 0.5) * 340 + 20; a.ycyl(py - 330, py - 240, x, z, 140, 12); ring(a, 'xz', x, py - 330, z, 130, 7, 14, 4); a.circ(x, py, 20, 'EQUIP-DETAIL'); }
      a.tube([[cx, py, zp], [cx, py - 100, zc - ch / 2]], [20, 20], 6); a.log('Added the base plate with bolts, tapered pole, cage ladder with hoops, service platform and the lamp frame with round lamps (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', title: 'Generic lifeguard stand',
    desc: (v) => v.k === 'chair' ? 'Pool lifeguard chair: four legs with cross bracing on a base frame, a seat with a back rest and arm rails, a footrest, a step ladder at the front and a flat sun shade on two posts.' : v.k === 'cabin' ? 'Beach lifeguard tower: four stilts with cross braces, a deck with three walls of rails, a sloped roof on four posts, a front stair with handrails and a flag pole.' : 'Tall lifeguard platform: four splayed legs with braces, a railed platform, a ladder with side rails and rungs, and a roof canopy on two posts.',
    vs: [['pool chair, 6 ft seat', 48, 60, 134, 0, { k: 'chair', sh: 1830 }], ['beach tower, 8 ft deck with roof', 96, 128, 176, 0, { k: 'cabin', sh: 2440 }], ['tall platform, 10 ft deck', 62, 84, 186, 0, { k: 'tall', sh: 3000 }]],
    build: (a, v) => {
      const { Z0, YF, YB, cx, W, Z1 } = a, zs = Z0 + v.sh; a.outline();
      if (v.k === 'cabin') {
        const hw = W / 2 - 200, yb = YB - 300, yf = YB - 1700, ysp = YF + 100;
        for (const [x, y] of [[-hw, yb], [hw, yb], [-hw, yf], [hw, yf]]) { a.box(cx + x - 55, y - 55, Z0, cx + x + 55, y + 55, zs); }
        for (const [y0, y1] of [[yb, yf]]) for (const s of [-1, 1]) { a.tube([[cx + s * hw, y0, Z0 + 150], [cx + s * hw, y1, zs - 300]], [14, 14], 6); a.tube([[cx + s * hw, y1, Z0 + 150], [cx + s * hw, y0, zs - 300]], [14, 14], 6); }
        for (const y of [yb, yf]) { a.tube([[cx - hw, y, Z0 + 150], [cx + hw, y, zs - 300]], [14, 14], 6); a.tube([[cx + hw, y, Z0 + 150], [cx - hw, y, zs - 300]], [14, 14], 6); }
        a.box(cx - hw - 200, yf - 200, zs, cx + hw + 200, yb + 200, zs + 80); a.rect(cx - hw - 200, yf - 200, cx + hw + 200, yb + 200, 'EQUIP');
        for (const s of [-1, 1]) { a.box(cx + s * (hw + 200) - 25, yf - 200, zs + 80, cx + s * (hw + 200) + 25, yb + 200, zs + 1000); for (let i = 1; i < 9; i++) a.tube([[cx + s * (hw + 200), yf - 200 + i * (yb - yf + 400) / 9, zs + 80], [cx + s * (hw + 200), yf - 200 + i * (yb - yf + 400) / 9, zs + 1000]], [8, 8], 5); }
        a.box(cx - hw - 200, yb + 150, zs + 80, cx + hw + 200, yb + 200, zs + 1000);
        for (const [x, y] of [[-hw, yb], [hw, yb], [-hw, yf + 100], [hw, yf + 100]]) a.box(cx + x - 30, y - 30, zs + 80, cx + x + 30, y + 30, zs + 1800); prismX(a, [[yb + 250, zs + 1800], [yf - 450, zs + 1640], [yf - 450, zs + 1740], [yb + 250, zs + 1910]], cx - hw - 190, cx + hw + 190);
        a.tube([[cx + hw, yf - 150, zs + 1800], [cx + hw, yf - 150, Z1 - 20]], [10, 10], 6);
        for (let i = 0; i <= 10; i++) { const f = i / 10, y = yf - 200 - 1200 * f + 150, z = zs - (zs - Z0 - 60) * f; if (i < 10) a.box(cx - 350, y - 150, z - 70, cx + 350, y, z - 40); }
        for (const s of [-1, 1]) { a.tube([[cx + s * 380, yf - 200, zs], [cx + s * 380, yf - 1500, Z0 + 20]], [18, 18], 6); a.tube([[cx + s * 380, yf - 200, zs + 900], [cx + s * 380, yf - 1500 + 200, Z0 + 900]], [14, 14], 6); }
        a.rect(cx - 380, yf - 1500, cx + 380, yf - 200, 'EQUIP-DETAIL'); return a.log('Added the stilts and braces, deck, rails, roof, stair with handrails and the flag pole (plan and 3D).');
      }
      const hw = v.k === 'chair' ? 330 : 380, ht = v.k === 'chair' ? 260 : 300, yb = YB - 150, yt = YB - 150 - (v.k === 'chair' ? 520 : 760), ysp = v.k === 'chair' ? 150 : 250;
      for (const s of [-1, 1]) for (const [y, yy] of [[yb, yb - 80], [yb - (v.k === 'chair' ? 520 : 760) - ysp, yt]]) { a.tube([[cx + s * (hw + 60), y, Z0 + 20], [cx + s * ht, yy, zs]], [26, 24], 8); }
      for (const f of [0.35, 0.7]) for (const y of [yb - 0, yb - (v.k === 'chair' ? 520 : 760) - ysp]) a.tube([[cx - (hw + 60) + (hw + 60 - ht) * f, y, Z0 + 20 + (zs - Z0 - 20) * f], [cx + (hw + 60) - (hw + 60 - ht) * f, y, Z0 + 20 + (zs - Z0 - 20) * f]], [12, 12], 6);
      a.box(cx - hw - 60 - 20, yb - 520 - ysp - 40, Z0, cx + hw + 60 + 20, yb + 40, Z0 + 20);
      a.box(cx - ht - 120, yt - 60, zs, cx + ht + 120, yb + 40, zs + 50); a.rect(cx - ht - 120, yt - 60, cx + ht + 120, yb + 40, 'EQUIP'); if (v.k === 'chair') { a.box(cx - ht, yb - 20, zs + 50, cx + ht, yb + 40, zs + 640); a.box(cx - ht + 60, yb - 40, zs + 130, cx + ht - 60, yb - 20, zs + 560); for (const s of [-1, 1]) a.tube([[cx + s * (ht + 100), yt + 100, zs + 50], [cx + s * (ht + 100), yt + 100, zs + 300], [cx + s * (ht + 100), yb, zs + 300]], [14, 14, 14], 6); } else { for (const s of [-1, 1]) { a.box(cx + s * (ht + 120) - 20, yt - 60, zs + 50, cx + s * (ht + 120) + 20, yb + 40, zs + 1000); for (let i = 1; i < 6; i++) a.tube([[cx + s * (ht + 120), yt - 60 + i * (yb - yt + 100) / 6, zs + 50], [cx + s * (ht + 120), yt - 60 + i * (yb - yt + 100) / 6, zs + 1000]], [7, 7], 5); } a.tube([[cx - ht - 120, yb + 20, zs + 1000], [cx + ht + 120, yb + 20, zs + 1000]], [18, 18], 6); a.box(cx - ht - 120, yb, zs + 50, cx + ht + 120, yb + 40, zs + 1000); }
      const ly = YF + 120, lz = zs - 40;
      for (const s of [-1, 1]) a.tube([[cx + s * 230, yt - 130, lz], [cx + s * 280, ly, Z0 + 20]], [18, 18], 6);
      const nr = m.max(4, m.round(v.sh / 330)); for (let i = 1; i <= nr; i++) { const f = i / (nr + 1), y = ly + (yt - 130 - ly) * f, z = Z0 + 20 + (lz - Z0 - 20) * f; a.xcyl(cx - 250 + 20 * (1 - f), cx + 250 - 20 * (1 - f), y, z, 11, 6); }
      a.box(cx - 300, ly - 60, Z0, cx + 300, ly + 40, Z0 + 20);
      const cz = zs + (v.k === 'chair' ? 1500 : 1650); for (const s of [-1, 1]) a.tube([[cx + s * (ht + 60), yb - 80, zs + 50], [cx + s * (ht + 60), yb - 80, cz]], [14, 14], 6);
      a.box(cx - ht - 300, yt - 300, cz, cx + ht + 300, yb + 100, cz + 40); a.rect(cx - ht - 300, yt - 300, cx + ht + 300, yb + 100, 'EQUIP-DETAIL'); a.rect(cx - 300, ly - 60, cx + 300, ly + 40, 'EQUIP-DETAIL');
      a.log('Added the legs and bracing, seat or platform, ' + (v.k === 'chair' ? 'back rest and arm rails' : 'rails') + ', ladder with rungs and the shade or roof (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', ft: true, title: 'Generic swimming pool with lane ropes',
    desc: (v) => `Swimming pool with ${v.n} lanes, ${v.len} ft long: a deck slab, a tank with rim walls around a water body, ${v.n + 1} lane ropes with floats every few feet, end-wall touch pads for each lane and a lane number plate at the deck edge.`,
    vs: [['4 lanes, 60 ft training pool', 37, 65, 40, 0, { n: 4, len: 60, lw: 8 }], ['6 lanes, 75 ft pool', 53, 80, 40, 0, { n: 6, len: 75, lw: 8 }], ['8 lanes, 164 ft long course', 69, 169, 40, 0, { n: 8, len: 164, lw: 8 }]],
    build: (a, v) => {
      const Z = slab(a, 30), iw = v.n * v.lw * FT, il = v.len * FT, cy = a.YF / 2, y0 = cy - il / 2, y1 = cy + il / 2, x0 = -iw / 2, t = 300, wt = Z + 900;
      for (const [xa, ya, xb, yb] of [[x0 - t, y0 - t, x0, y1 + t], [iw / 2, y0 - t, iw / 2 + t, y1 + t], [x0, y0 - t, iw / 2, y0], [x0, y1, iw / 2, y1 + t]]) a.box(xa, ya, Z, xb, yb, wt);
      a.box(x0, y0, Z, iw / 2, y1, Z + 700); a.rect(x0, y0, iw / 2, y1, 'EQUIP');
      const lw = iw / v.n, step = m.max(6 * FT, il / 14), nf = m.floor(il / step);
      for (let i = 0; i <= v.n; i++) { const x = x0 + i * lw; a.tube([[x, y0 + 100, Z + 640], [x, y1 - 100, Z + 640]], [8, 8], 5); a.line(x, y0, x, y1, 'EQUIP-DETAIL'); if (i > 0 && i < v.n) for (let f = 0; f < nf; f++) a.ycyl(y0 + 200 + f * step, y0 + 200 + f * step + 1000, x, Z + 640, 60, 6); }
      for (let i = 0; i < v.n; i++) { const xc = x0 + (i + 0.5) * lw; for (const [y, d] of [[y0, 1], [y1, -1]]) { a.box(xc - 600, y + (d > 0 ? 0 : -12), Z + 560, xc + 600, y + (d > 0 ? 12 : 0), Z + 860); a.box(xc - 160, y + (d > 0 ? -t : 0), wt, xc + 160, y + (d > 0 ? 0 : t), wt + 6); } }
      a.log('Added the deck, tank rim walls, water body, lane ropes with floats, touch pads and lane plates (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', title: 'Generic swimming starting block',
    desc: (v) => `Swimming starting block ${v.hh} in high: a deck base plate with bolts, two tube legs with cross bar, a ${v.wedge ? 'tilted top with a rear wedge plate and a front grip bar' : 'flat top with a non-slip surface and a front grip bar'}${v.side ? ', two side grab handles and a number plate' : ''}.`,
    vs: [['flat top, 30 in high', 28, 36, 34, 0, { hh: 30, wedge: false }], ['tilted top with wedge, 30 in high', 28, 38, 36, 0, { hh: 30, wedge: true }], ['relay block with grab handles, 28 in', 30, 38, 34, 0, { hh: 28, wedge: true, side: true }]],
    build: (a, v) => {
      const { Z0, YF, YB, cx } = a, zt = Z0 + v.hh * IN, hw = 290, yf = YF + 150, yb = YB - 150; a.outline();
      a.box(cx - hw - 60, yf - 40, Z0, cx + hw + 60, yb + 40, Z0 + 25); for (const [x, y] of [[-hw - 20, yf], [hw + 20, yf], [-hw - 20, yb], [hw + 20, yb]]) a.cyl(cx + x, y, Z0 + 25, Z0 + 40, 14, 8); a.rect(cx - hw - 60, yf - 40, cx + hw + 60, yb + 40);
      for (const s of [-1, 1]) for (const y of [yf + 40, yb - 40]) a.tube([[cx + s * (hw - 20), y, Z0 + 25], [cx + s * (hw - 20), y, zt - 60]], [24, 24], 8);
      a.tube([[cx - hw + 20, yf + 40, Z0 + 300], [cx + hw - 20, yf + 40, Z0 + 300]], [14, 14], 6); a.tube([[cx - hw + 20, yb - 40, Z0 + 300], [cx + hw - 20, yb - 40, Z0 + 300]], [14, 14], 6);
      if (v.wedge) { prismX(a, [[yf - 40, zt - 70], [yb + 40, zt - 20], [yb + 40, zt + 20], [yf - 40, zt - 40]], cx - hw - 20, cx + hw + 20); a.box(cx - hw, yf - 20, zt - 62, cx + hw, yb, zt - 30); a.box(cx - hw + 20, yb - 140, zt - 16, cx + hw - 20, yb + 50, zt + 80); a.box(cx - hw + 20, yb + 40, zt - 30, cx + hw - 20, yb + 60, zt + 130); }
      else { a.box(cx - hw - 20, yf - 40, zt - 60, cx + hw + 20, yb + 40, zt); for (let i = 0; i < 7; i++) a.box(cx - hw + 20, yf + i * ((yb - yf) / 7), zt, cx + hw - 20, yf + i * ((yb - yf) / 7) + 12, zt + 4); }
      for (const s of [-1, 1]) a.tube([[cx + s * (hw - 30), yf - 30, zt - 40], [cx + s * (hw - 30), yf - 90, zt - 140], [cx + s * (hw + 0), yf - 90, zt - 140]], [10, 10, 10], 6);
      a.tube([[cx - hw + 40, yf - 90, zt - 140], [cx + hw - 40, yf - 90, zt - 140]], [10, 10], 6);
      if (v.side) { for (const s of [-1, 1]) { a.tube([[cx + s * (hw + 20), yf + 80, zt - 20], [cx + s * (hw + 70), yf + 80, zt + 130], [cx + s * (hw + 70), yb - 80, zt + 130], [cx + s * (hw + 20), yb - 80, zt - 20]], [10, 10, 10, 10], 6); } a.box(cx - 110, yf - 40, zt - 150, cx + 110, yf - 30, zt - 60); }
      a.log('Added the base plate with bolts, legs, cross bars, ' + (v.wedge ? 'tilted top with rear wedge' : 'flat non-slip top') + ' and the front grip bar (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', title: 'Generic pool entry ladder',
    desc: (v) => `Pool entry ladder with ${v.steps} treads: two curved handrails of stainless tube that rise over the pool edge, a set of ${v.steps} flat treads between them, round anchor flanges on the deck and a pair of end caps.`,
    vs: [['3 steps', 27, 40, 54, 0, { steps: 3 }], ['4 steps', 27, 40, 60, 0, { steps: 4 }]],
    build: (a, v) => {
      const { Z0, YF, YB, cx } = a, hw = 280, yo = YB - 200; a.outline();
      const path = []; const n = 14, hr = 340, zT = Z0 + (v.steps === 3 ? 1250 : 1400);
      for (let i = 0; i <= n; i++) { const t = (i / n) * PI; path.push([yo - hr + hr * m.cos(t), zT - hr + hr * m.sin(t) ]); }
      const yBot = yo - 2 * hr - 40, zBot = Z0 + 120;
      for (const s of [-1, 1]) { const p = [[cx + s * hw, yBot, zBot], [cx + s * hw, yBot + 60, zBot + 260], [cx + s * hw, yo - 2 * hr, zT - hr]]; a.tube(p, [18, 18, 18], 8);
        a.tube(path.map(([y, z]) => [cx + s * hw, y, z]), path.map(() => 18), 8); a.tube([[cx + s * hw, yo, zT - hr], [cx + s * hw, yo, Z0 + 40]], [18, 18], 8); a.cyl(cx + s * hw, yo, Z0, Z0 + 30, 55, 14); a.circ(cx + s * hw, yo, 55, 'EQUIP'); a.cyl(cx + s * hw, yBot, Z0, zBot, 22, 8); }
      for (let i = 0; i < v.steps; i++) { const f = (i + 1) / (v.steps + 1), y = yBot + (yo - 2 * hr - yBot) * (0.1 + 0.5 * f) + 0 * i, z = zBot + 260 + (zT - hr - zBot - 260) * f * 0.85; a.box(cx - hw, y - 90, z, cx + hw, y + 90, z + 22); a.rect(cx - hw, y - 90, cx + hw, y + 90, 'EQUIP-DETAIL'); }
      a.log('Added the curved handrails, treads, deck flanges and end caps (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', title: 'Generic ice rink boards',
    desc: (v) => v.k === 'corner' ? 'Ice rink corner: four board panels laid on a 90 degree arc, each with a kick plate, a dasher board, a cap rail, tall glass frames with posts, and a back strut with a floor foot at every joint.' : `Ice rink boards, ${v.len} in long${v.gate ? ' with a swing gate bay' : ''}: a kick plate, a dasher board, a cap rail, ${v.gate ? 'a gate leaf on two hinges beside the glass frames' : 'glass frames between uprights'} and back struts with floor feet.`,
    vs: [['straight section, 96 in', 102, 40, 114, 0, { k: 'straight', len: 96, gate: false }], ['section with gate, 120 in', 126, 60, 114, 0, { k: 'straight', len: 120, gate: true }], ['corner, 90 degree arc', 124, 124, 114, 0, { k: 'corner' }]],
    build: (a, v) => {
      const { Z0, YF, YB, X0, X1, cx } = a, hD = 1067, zT = a.Z1 - 20;
      const panel = (xa, ya, xb, yb, gate) => {
        seg(a, xa, ya, xb, yb, 80, Z0 + 30, Z0 + 305, false); seg(a, xa, ya, xb, yb, 60, Z0 + 305, Z0 + hD); seg(a, xa, ya, xb, yb, 90, Z0 + hD, Z0 + hD + 40, false);
        const L = m.hypot(xb - xa, yb - ya), dx = (xb - xa) / L, dy = (yb - ya) / L, n = m.max(1, m.round(L / 1000));
        if (!gate) for (let i = 0; i <= n; i++) { const x = xa + dx * L * i / n, y = ya + dy * L * i / n; a.tube([[x, y, Z0 + hD + 40], [x, y, zT]], [20, 20], 6); }
        if (!gate) for (const z of [Z0 + hD + 40, zT]) a.tube([[xa, ya, z], [xb, yb, z]], [14, 14], 6);
        if (!gate) for (let i = 0; i < n; i++) { const x0 = xa + dx * L * (i + 0.5) / n, y0 = ya + dy * L * (i + 0.5) / n; a.tube([[x0, y0, Z0 + hD + 700], [x0 + dx * 8, y0 + dy * 8, Z0 + hD + 720]], [1, 1], 3); }
      };
      a.outline();
      const strut = (x, y, ex, ey) => { a.tube([[x, y, Z0 + hD], [x + ex * 450, y + ey * 450, Z0 + 40]], [18, 18], 6); a.box(x + ex * 450 - 60, y + ey * 450 - 60, Z0, x + ex * 450 + 60, y + ey * 450 + 60, Z0 + 20); };
      if (v.k === 'corner') {
        const R = 2400, cxm = X0 + 450, cym = YF + 450, pts = arcPts(cxm, cym, R, 0, 90, 4).map(([x, y]) => [x, y]);
        for (let i = 0; i < 4; i++) { panel(...pts[i], ...pts[i + 1], false); } for (const [x, y] of pts) { const ex = (x - cxm) / R, ey = (y - cym) / R; strut(x, y, ex, ey); a.tube([[x, y, Z0 + hD + 40], [x, y, zT]], [22, 22], 6); }
        a.poly([...pts, [pts[4][0] - 80, pts[4][1]], [pts[0][0], pts[0][1] - 80]].slice(0, 5), 'EQUIP-DETAIL'); polySeg(a, pts, 80, Z0, Z0 + 20);
      } else {
        const L = v.len * IN, x0 = cx - L / 2, y = YF + (v.gate ? 1050 : 450), gl = v.gate ? 1050 : 0, gx = x0 + L * 0.35;
        if (!v.gate) panel(x0, y, x0 + L, y, false); else { panel(x0, y, gx, y, false); panel(gx + gl, y, x0 + L, y, false);
          for (const xx of [gx, gx + gl]) a.tube([[xx, y, Z0 + 30], [xx, y, zT]], [26, 26], 6); const th = -0.9; const hx = gx + gl, ex = hx + m.cos(th + 0) * 0, gy = y - 900; a.tube([[gx + gl, y, Z0 + 305], [gx + gl, gy, Z0 + 305]], [20, 20], 6); a.box(gx + gl - 26, gy, Z0 + 305, gx + gl + 26, y, Z0 + hD); a.tube([[gx + gl, gy, Z0 + hD], [gx + gl, y, Z0 + hD]], [20, 20], 6); a.tube([[gx + gl, gy, zT - 400], [gx + gl, y, zT - 400]], [14, 14], 6); for (const yy of [y - 100, gy]) a.tube([[gx + gl, yy, Z0 + hD], [gx + gl, yy, zT - 400]], [14, 14], 6); a.arc(gx + gl, y, 900, 180, 270); }
        for (const f of [0, 0.35, 0.7, 1]) strut(x0 + L * f, y, 0, 1); a.rect(x0, y - 45, x0 + L, y + 45, 'EQUIP');
      }
      a.log('Added the kick plate, dasher boards, cap rail, glass frames with posts' + (v.gate ? ', the gate leaf' : '') + ' and back struts with feet (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', ft: true, title: 'Generic players bench shelter',
    desc: (v) => `Players' bench shelter for ${v.n} seats, ${v.w} ft wide: a bench with ${v.n} moulded seats on steel legs, three or more curved arch frames, a curved clear roof and back drawn as a frame with sheet, side walls, a foot rail and a rear kick board.`,
    vs: [['6 seats, 12 ft', 12.5, 5, 96, 0, { n: 6, w: 12 }], ['10 seats, 18 ft', 18.5, 5, 96, 0, { n: 10, w: 18 }], ['14 seats, 24 ft', 24.5, 5, 100, 0, { n: 14, w: 24 }]],
    build: (a, v) => {
      const { Z0, Z1, YF, YB, X0, X1, cx } = a, W = v.w * FT, x0 = cx - W / 2, ya = YB - 100, yb = YF + 100, na = m.max(3, m.round(W / 2400) + 1); a.outline();
      const profile = (f) => { const t = f * PI * 0.55; return [ya - (ya - yb) * (1 - m.cos(t)) / (1 - m.cos(PI * 0.55)) * 1, Z0 + 450 + (Z1 - Z0 - 560) * m.sin(t) / m.sin(PI * 0.55)]; };
      const arch = []; for (let i = 0; i <= 10; i++) arch.push(profile(i / 10));
      for (let k = 0; k < na; k++) { const x = x0 + (W * k) / (na - 1); a.tube(arch.map(([y, z]) => [x, y, z]), arch.map(() => 24), 6); a.tube([[x, ya, Z0 + 30], [x, ya, Z0 + 450]], [24, 24], 6); a.box(x - 80, ya - 80, Z0, x + 80, ya + 20, Z0 + 30); }
      for (let i = 1; i < 10; i += 1) { const [y, z] = arch[i]; a.tube([[x0, y, z], [x0 + W, y, z]], [8, 8], 5); }
      for (let k = 0; k < na - 1; k++) { const xa = x0 + (W * k) / (na - 1), xb = x0 + (W * (k + 1)) / (na - 1); for (let i = 3; i < 10; i++) { const [y0, z0] = arch[i], [y1, z1] = arch[i + 1]; a.prism([[xa + 40, y0], [xb - 40, y0], [xb - 40, y1], [xa + 40, y1]], m.min(z0, z1) + 10, m.max(z0, z1) + 26); } }
      for (let k = 0; k < na - 1; k++) { const xa = x0 + (W * k) / (na - 1), xb = x0 + (W * (k + 1)) / (na - 1); a.box(xa + 40, ya, Z0 + 450, xb - 40, ya + 14, arch[10][1] - 200); }
      a.box(x0, ya - 4, Z0 + 30, x0 + W, ya + 14, Z0 + 330); a.box(x0 - 20, ya - 460, Z0 + 440, x0 + W + 20, ya - 100, Z0 + 470);
      const sw = W / v.n; for (let i = 0; i < v.n; i++) { const x = x0 + (i + 0.5) * sw; a.box(x - sw / 2 + 25, ya - 420, Z0 + 440, x + sw / 2 - 25, ya - 120, Z0 + 480); prismX(a, [[ya - 120, Z0 + 470], [ya - 40, Z0 + 470], [ya - 40, Z0 + 840], [ya - 120, Z0 + 840]], x - sw / 2 + 30, x + sw / 2 - 30); }
      for (let i = 0; i <= 3; i++) { const x = x0 + (W * i) / 3; for (const y of [ya - 400, ya - 140]) a.tube([[x, y, Z0 + 30], [x, y, Z0 + 440]], [18, 18], 6); a.rect(x - 20, ya - 420, x + 20, ya - 120, 'EQUIP-DETAIL'); }
      a.tube([[x0, yb + 150, Z0 + 180], [x0 + W, yb + 150, Z0 + 180]], [16, 16], 6); a.rect(x0, yb, x0 + W, ya, 'EQUIP');
      a.log('Added the arch frames, curved roof sheet, back panel, bench with moulded seats and legs and the foot rail (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', ft: true, title: 'Generic covered grandstand',
    desc: (v) => `Covered grandstand of ${v.rows} rows and ${v.w} ft wide: stepped concrete terraces with plank seats, a rear wall, a front guard rail with balusters, side steps, steel columns at the back carrying roof beams that slope down to the front and a sheet roof.`,
    vs: [['5 rows, 20 ft wide', 20, 20, 168, 0, { rows: 5, w: 20 }], ['8 rows, 30 ft wide', 30, 28, 204, 0, { rows: 8, w: 30 }], ['12 rows, 40 ft wide', 40, 38, 252, 0, { rows: 12, w: 40 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, n = v.rows, rd = 760, rise = 380, y0 = YF + 300; a.outline();
      for (let i = 0; i < n; i++) { const ya = y0 + i * rd; a.box(X0 + 120, ya, Z0, X1 - 120, ya + rd, Z0 + 200 + (i + 1) * rise * 0.0 + rise * (i + 1) - 120); a.box(X0 + 120, ya + 60, Z0 + rise * (i + 1) - 120 + 40, X1 - 120, ya + rd * 0.55, Z0 + rise * (i + 1) - 120 + 80); a.line(X0 + 120, ya, X1 - 120, ya, 'EQUIP-DETAIL'); }
      const yE = y0 + n * rd, zE = Z0 + rise * n + 100; a.box(X0 + 120, yE, Z0, X1 - 120, yE + 150, zE + 1200);
      for (const s of [-1, 1]) { const xs = s > 0 ? X1 - 120 : X0; for (let i = 0; i < n; i++) a.box(s > 0 ? X1 - 120 : X0, y0 + i * rd, Z0, s > 0 ? X1 : X0 + 120, y0 + (i + 1) * rd, Z0 + rise * (i + 1) - 80); }
      const rx = [X0 + 200, X1 - 200]; for (const x of rx) { a.box(x - 100, y0 - 200, Z0, x + 100, y0 - 100, Z0 + 1100); }
      const nc = m.max(3, m.round(W / 5000) + 1); const yc = YB - 250, zr0 = Z1 - 120, zr1 = Z1 - 800;
      for (let k = 0; k < nc; k++) { const x = X0 + 150 + ((W - 300) * k) / (nc - 1); a.tube([[x, yc, Z0], [x, yc, zr0]], [90, 80], 8); a.box(x - 110, yc - 110, Z0, x + 110, yc + 110, Z0 + 20); a.tube([[x, yc, zr0], [x, YF + 100, zr1]], [60, 50], 8); a.tube([[x, y0 + n * rd * 0.55, zr0 - 350 - (zr0 - zr1) * 0.0], [x, y0 + n * rd * 0.55, zr0 - (zr0 - zr1) * ((yc - y0 - n * rd * 0.55) / (yc - YF - 100))]], [30, 30], 6); }
      for (let k = 0; k < nc - 1; k++) { const xa = X0 + 150 + ((W - 300) * k) / (nc - 1) - 60, xb = X0 + 150 + ((W - 300) * (k + 1)) / (nc - 1) + 60; prismX(a, [[YF + 40, zr1 - 40], [yc + 100, zr0 - 40], [yc + 100, zr0 + 30], [YF + 40, zr1 + 30]], xa, xb); }
      a.tube([[X0 + 120, YF + 100, zr1 + 20], [X1 - 120, YF + 100, zr1 + 20]], [30, 30], 6); a.rect(X0 + 120, y0, X1 - 120, yE, 'EQUIP'); a.rect(X0 + 120, yE, X1 - 120, yE + 150, 'EQUIP-DETAIL');
      a.log('Added the stepped terraces with plank seats, side walls, rear wall, back columns, sloping roof beams and the sheet roof (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', ft: true, title: 'Generic ball stop net',
    desc: (v) => v.k === 'back' ? 'Baseball backstop: five tall tube posts in a shallow arc with angled wings at each end, top rails, a net of strands on the whole face and a base rail, each post on a baseplate.' : v.k === 'golf' ? 'Golf driving net: a rectangular frame of tube on two floor feet with a base tray, a back net of wide strands that sags toward the front, and a low ball catching tray at the foot.' : 'Ball stop fence: a row of tall posts in baseplates with a top rail, a mid rail and a net drawn as strands from top rail to the ground.',
    vs: [['baseball backstop with wings, 28 ft', 28, 12, 204, 0, { k: 'back', hFt: 17 }], ['golf driving net, 10 ft frame', 11, 7, 126, 0, { k: 'golf', hFt: 9 }], ['ball stop fence, 30 ft run, 20 ft high', 32, 4, 246, 0, { k: 'fence', hFt: 20 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, H = v.hFt * FT; a.outline();
      if (v.k === 'golf') {
        const hw = (W - 400) / 2, yb = YB - 700, yf = YF + 400; for (const s of [-1, 1]) { a.tube([[cx + s * hw, yb, Z0 + 30], [cx + s * hw, yb, Z0 + H]], [30, 30], 8); a.box(cx + s * hw - 60, yf, Z0, cx + s * hw + 60, yb + 60, Z0 + 30); a.tube([[cx + s * hw, yb, Z0 + H], [cx + s * hw, yb + 200, Z0 + 600]], [16, 16], 6); } a.tube([[cx - hw, yb, Z0 + H], [cx + hw, yb, Z0 + H]], [26, 26], 8); a.tube([[cx - hw, yb, Z0 + 340], [cx + hw, yb, Z0 + 340]], [16, 16], 6);
        strands(a, [cx - hw, yb, Z0 + H], [cx + hw, yb, Z0 + H], [cx + hw, yb - 120, Z0 + 340], [cx - hw, yb - 120, Z0 + 340], 14, 14, 2.5); a.box(cx - hw, yf, Z0 + 20, cx + hw, yb - 100, Z0 + 60); a.box(cx - hw, yb - 120, Z0 + 60, cx + hw, yb - 100, Z0 + 340); a.rect(cx - hw - 60, yf, cx + hw + 60, yb + 60, 'EQUIP');
      } else {
        const np = v.k === 'back' ? 5 : m.round(W / 3000) + 1, hw = (W - 400) / 2, yb = v.k === 'back' ? YB - 300 : YB - 250, curve = v.k === 'back' ? 1500 : 0, pts = [];
        for (let i = 0; i < np; i++) { const f = i / (np - 1), x = cx - hw + 2 * hw * f, y = yb - curve * m.sin(PI * f) * 0 - (v.k === 'back' ? curve * (1 - m.abs(2 * f - 1) ** 2) * -0.0 : 0); pts.push([x, y - (v.k === 'back' ? 0 : 0)]); }
        let all = pts.map(([x, y]) => [x, y]); if (v.k === 'back') { all = [[cx - hw, YF + 700], ...pts.slice(0), [cx + hw, YF + 700]].slice(0, 0); const wx = hw, wy = YF + 900; all = [[-wx, wy], [-wx * 0.55, yb], [0, yb + 0], [wx * 0.55, yb], [wx, wy]].map(([x, y]) => [cx + x, y]); }
        const P = v.k === 'back' ? all : pts; for (const [x, y] of P) { a.tube([[x, y, Z0 + 20], [x, y, Z0 + H]], [32, 28], 8); a.box(x - 100, y - 100, Z0, x + 100, y + 100, Z0 + 20); a.circ(x, y, 32, 'EQUIP-DETAIL'); }
        for (let i = 0; i < P.length - 1; i++) { const [x0, y0] = P[i], [x1, y1] = P[i + 1]; for (const z of [Z0 + H, Z0 + H * 0.5]) a.tube([[x0, y0, z], [x1, y1, z]], [z === Z0 + H ? 20 : 10, z === Z0 + H ? 20 : 10], 6); const nn = m.max(2, m.round(m.hypot(x1 - x0, y1 - y0) / 400)); strands(a, [x0, y0, Z0 + H], [x1, y1, Z0 + H], [x1, y1, Z0 + 30], [x0, y0, Z0 + 30], nn, 2, 2); a.tube([[x0, y0, Z0 + H * 0.75], [x1, y1, Z0 + H * 0.75]], [2, 2], 4); a.tube([[x0, y0, Z0 + H * 0.25], [x1, y1, Z0 + H * 0.25]], [2, 2], 4); a.line(x0, y0, x1, y1, 'EQUIP'); }
      }
      a.log('Added the posts with base plates, rails and the net strands' + (v.k === 'golf' ? ', the base tray and ball catcher' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', ft: true, title: 'Generic driving range bay row',
    desc: (v) => `Driving range hitting row of ${v.n} bays, each 5.5 ft wide: a turf hitting mat with a tee line, tall divider screens of frame and panel, a back rail at hip height, a roof beam on posts and a ball bucket stand in each bay.`,
    vs: [['2 bays', 11.5, 12, 100, 0, { n: 2 }], ['4 bays', 22.5, 12, 100, 0, { n: 4 }], ['6 bays', 33.5, 12, 100, 0, { n: 6 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, bw = 5.5 * FT, x0 = cx - (v.n * bw) / 2, yb = YB - 150, yf = YF + 1800; a.outline();
      a.box(X0 + 20, YF + 600, Z0, X1 - 20, YB - 20, Z0 + 40); a.rect(X0 + 20, YF + 600, X1 - 20, YB - 20);
      for (let i = 0; i <= v.n; i++) { const x = x0 + i * bw; a.box(x - 35, yb - 35, Z0 + 40, x + 35, yb + 35, Z1 - 80); a.box(x - 25, yf - 25, Z0 + 40, x + 25, yf + 25, Z0 + 1900); a.tube([[x, yb, Z0 + 1900], [x, yf, Z0 + 1900]], [18, 18], 6); a.tube([[x, yb, Z0 + 1050], [x, yf, Z0 + 1050]], [18, 18], 6); if (i > 0 && i < v.n) { a.box(x - 12, yf, Z0 + 1050, x + 12, yb, Z0 + 1900); } }
      a.box(x0 - 60, yb - 60, Z1 - 80, x0 + v.n * bw + 60, yb + 60, Z1 - 30); a.tube([[x0, yb, Z0 + 1050], [x0 + v.n * bw, yb, Z0 + 1050]], [20, 20], 6); a.box(x0 - 60, yb - 6, Z0 + 700, x0 + v.n * bw + 60, yb + 6, Z0 + 1050);
      for (let i = 0; i < v.n; i++) { const xc = x0 + (i + 0.5) * bw; a.box(xc - 750, yf + 200, Z0 + 40, xc + 750, yf + 1500, Z0 + 60); for (let k = 0; k < 6; k++) a.box(xc - 750, yf + 200 + k * 220, Z0 + 60, xc + 750, yf + 200 + k * 220 + 14, Z0 + 66); seg(a, xc - 650, yf + 800, xc + 650, yf + 800, 30, Z0 + 60, Z0 + 68);
        a.cyl(xc + 900, yb - 500, Z0 + 40, Z0 + 500, 12, 8); ring(a, 'xy', xc + 900, yb - 500, Z0 + 500, 200, 10, 18, 5); a.cone(xc + 900, yb - 500, Z0 + 300, Z0 + 500, 120, 200, 16); a.rect(xc - 750, yf + 200, xc + 750, yf + 1500, 'EQUIP-DETAIL'); }
      a.log('Added the base slab, hitting mats with tee lines, divider screens, back rail, roof beam and the ball bucket stands (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', title: 'Generic bouldering boulder',
    desc: (v) => `${cap(v.kind)} freestanding artificial boulder ${v.hFt} ft high: a faceted climbing form lofted from ${v.facets} facet sections, ${v.nh} bolted holds in varied sizes on its front faces and a thick crash pad around the base.`,
    vs: [['slab, leaning back', 108, 96, 112, 0, { kind: 'slab', hFt: 8, facets: 5, nh: 18, prof: [[0, -80, 0, 520], [900, 40, 90, 460], [1900, 160, 200, 360], [2300, 170, 230, 280]], seed: 11 }],
      ['overhang, 9 ft', 120, 108, 126, 0, { kind: 'overhang', hFt: 9, facets: 6, nh: 22, prof: [[0, 140, 0, 520], [1000, 50, -60, 520], [2000, -120, -160, 450], [2700, -240, -240, 330]], seed: 23 }],
      ['arete, 12 ft with pad', 144, 132, 160, 0, { kind: 'arete', hFt: 12, facets: 4, nh: 26, prof: [[0, 0, 0, 700], [1200, 40, 60, 620], [2600, 120, 150, 480], [3550, 170, 190, 300]], seed: 37 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, cx } = a, cy = YF / 2, pad = 110; a.outline();
      a.box(X0 + 40, YF + 40, Z0, X1 - 40, YB - 40, Z0 + pad); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-DETAIL');
      const P = v.prof.map(([z, dx, dy, r]) => [cx + dx, cy + dy * 0.6, Z0 + pad + z, r]);
      a.tube(P.map(([x, y, z]) => [x, y, z]), P.map(([, , , r]) => r), v.facets); a.cyl(P[P.length - 1][0], P[P.length - 1][1], P[P.length - 1][2], P[P.length - 1][2] + 20, P[P.length - 1][3] * 0.7, v.facets); a.circ(P[0][0], P[0][1], P[0][3], 'EQUIP');
      climbHolds(a, (u, w) => { const f = u * 0.88 + 0.06, k = m.min(2, m.floor(f * 3)), g = f * 3 - k, A = P[k], B = P[k + 1], x = A[0] + (B[0] - A[0]) * g, y = A[1] + (B[1] - A[1]) * g, z = A[2] + (B[2] - A[2]) * g, r = (A[3] + (B[3] - A[3]) * g) * 0.86, th = PI * (1.12 + 0.76 * w); return [x + r * m.cos(th), y + r * m.sin(th), z]; }, v.seed, v.nh);
      a.log('Added the crash pad, faceted boulder body and the bolted holds (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', title: 'Generic stadium seat row',
    desc: (v) => `Row of ${v.n} stadium seats on a concrete step: moulded seat pans, curved back rests, ${v.arm ? 'armrests between every seat, ' : ''}steel end standards with floor plates and a row number plate on the first standard.`,
    vs: [['3 seats', 66, 30, 40, 0, { n: 3, arm: false }], ['4 seats with armrests', 86, 30, 40, 0, { n: 4, arm: true }], ['5 seats with armrests', 106, 30, 40, 0, { n: 5, arm: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a, sw = 520, x0 = cx - (v.n * sw) / 2; a.outline();
      a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 150); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL');
      const ys = YF + 300, z0 = Z0 + 150;
      for (let i = 0; i <= v.n; i++) { const x = x0 + i * sw, end = i === 0 || i === v.n; a.box(x - 12, ys + 40, z0, x + 12, ys + 360, z0 + (end ? 420 : 380)); a.box(x - 60, ys + 40, z0, x + 60, ys + 360, z0 + 12); if (end || v.arm) a.box(x - 20, ys - 280, z0 + 540, x + 20, ys + 260, z0 + 580); a.tube([[x, ys + 120, z0 + 380], [x, ys + 120, z0 + 540]], [10, 10], 6); }
      for (let i = 0; i < v.n; i++) { const xc = x0 + (i + 0.5) * sw; a.box(xc - sw / 2 + 36, ys - 340, z0 + 400, xc + sw / 2 - 36, ys + 40, z0 + 440); a.box(xc - sw / 2 + 46, ys - 330, z0 + 440, xc + sw / 2 - 46, ys + 30, z0 + 470); prismX(a, [[ys + 30, z0 + 420], [ys + 120, z0 + 420], [ys + 190, z0 + 960], [ys + 100, z0 + 960]], xc - sw / 2 + 40, xc + sw / 2 - 40); a.rect(xc - sw / 2 + 36, ys - 340, xc + sw / 2 - 36, ys + 40, 'EQUIP-DETAIL'); }
      a.box(x0 - 14, ys - 14, z0 + 300, x0 + 90, ys + 4, z0 + 370); a.log('Added the concrete step, seat pans, back rests, end standards and the number plate' + (v.arm ? ', and armrests' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'sport/venues', title: 'Generic changing room bench',
    desc: (v) => `Changing room bench ${v.len} in long: a three-slat seat on two end frames and a centre frame, a slatted shoe shelf below, a back panel with ${v.hooks} coat hooks, a hat shelf on brackets above and a lower rail.`,
    vs: [['6 ft, 6 hooks', 72, 18, 76, 0, { len: 72, hooks: 6 }], ['8 ft, 8 hooks', 96, 18, 76, 0, { len: 96, hooks: 8 }], ['10 ft, 10 hooks', 120, 18, 76, 0, { len: 120, hooks: 10 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      const nf = v.len > 100 ? 4 : 3, yb = YB - 30, sy = YF + 20;
      for (let i = 0; i < nf; i++) { const x = X0 + 60 + ((W - 120) * i) / (nf - 1); a.box(x - 20, sy + 60, Z0, x + 20, YB - 120, Z0 + 440); a.box(x - 20, sy + 60, Z0 + 440, x + 20, YB - 120, Z0 + 470); a.box(x - 12, YB - 120, Z0 + 440, x + 12, YB - 90, Z1 - 150); a.box(x - 40, sy + 60, Z0, x + 40, YB - 120, Z0 + 14); }
      for (let k = 0; k < 3; k++) { const ya = sy + 60 + k * ((YB - 120 - sy - 60) / 3); a.box(X0 + 40, ya + 10, Z0 + 440, X1 - 40, ya + (YB - 120 - sy - 60) / 3 - 10, Z0 + 470); }
      for (let k = 0; k < 4; k++) { const ya = sy + 80 + k * 80; a.box(X0 + 40, ya, Z0 + 200, X1 - 40, ya + 60, Z0 + 218); } a.tube([[X0 + 40, YB - 140, Z0 + 150], [X1 - 40, YB - 140, Z0 + 150]], [10, 10], 6);
      a.box(X0 + 40, YB - 90, Z0 + 520, X1 - 40, YB - 60, Z1 - 150); a.box(X0 + 40, YB - 100, Z0 + 1350, X1 - 40, YB - 70, Z0 + 1400);
      for (let i = 0; i < v.hooks; i++) { const x = X0 + 100 + ((W - 200) * (i + 0.5)) / v.hooks; a.tube([[x, YB - 100, Z0 + 1330], [x, YB - 160, Z0 + 1330], [x, YB - 190, Z0 + 1380]], [6, 6, 8], 6); a.ell(x, YB - 190, Z0 + 1390, 14, 14, 14, 6, 4); }
      const sh = Z0 + 1600; a.box(X0 + 30, YB - 340, sh, X1 - 30, YB - 60, sh + 24); for (const x of [X0 + 100, X1 - 100, cx]) a.tube([[x, YB - 70, sh - 220], [x, YB - 300, sh]], [8, 8], 5);
      a.rect(X0 + 20, sy + 40, X1 - 20, YB - 60, 'EQUIP'); a.log('Added the three-slat seat, end and centre frames, shoe shelf, back panel with hooks and the hat shelf on brackets (plan and 3D).');
    } }),
];

// @@END
const ALL = [...COURTS, ...EQUIP, ...FIT, ...VENUES];
for (const f of ALL) if (f.ft) f.vs = f.vs.map(([l, w, d, ...r]) => [l, w * 12, d * 12, ...r]);
export default ALL;

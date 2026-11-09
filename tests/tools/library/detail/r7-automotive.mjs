/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, automotive: original generic scale shapes (no maker, model or brand). */
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

// ------------------------------------------------------------------------------------------ vehicles
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
/** lamp pair + bumper + plate + mirrors common to road vehicles. o: hw half width, zb body bottom, zl lamp z, yMir, zMir */
function roadDetails(a, o) {
  const { cx, YF, YB } = a, hw = o.hw;
  a.box(cx - hw * 0.92, YF, o.zb + 30, cx + hw * 0.92, YF + 85, o.zb + o.bh * 0.8);               // front bumper
  a.box(cx - hw * 0.92, YB - 85, o.zb + 30, cx + hw * 0.92, YB, o.zb + o.bh * 0.8);               // rear bumper
  a.box(cx - 260, YF + 6, o.zb + o.bh * 0.35, cx + 260, YF + 24, o.zb + o.bh * 0.35 + 110);  // plate recess / grille
  for (const s of [-1, 1]) {
    a.ell(cx + s * hw * 0.7, YF + 70, o.zl, 150, 55, 70, 10, 6);                                  // headlamp
    a.box(cx + s * hw * 0.78 - 80, YB - 30, o.zl2 - 60, cx + s * hw * 0.78 + 80, YB, o.zl2 + 60);  // tail lamp
    a.box(cx + s * (hw + 38) - 14, o.yMir, o.zMir, cx + s * (hw + 38) + 14, o.yMir + 150, o.zMir + 110);   // mirror
    a.tube([[cx + s * (hw * 0.84), o.yMir + 80, o.zMir + 30], [cx + s * (hw + 38), o.yMir + 80, o.zMir + 50]], [12, 12], 5);
    a.circ(cx + s * hw * 0.7, YF + 70, 50, 'EQUIP-DETAIL');
  }
  a.line(cx - hw * 0.94, YF + 85, cx + hw * 0.94, YF + 85, 'EQUIP-DETAIL');
}

const CAR = {
  hatch: { fa: 0.27, fr: 0.41, fs: 0.73, fb: 0.97, belt: 0.6, hood: 0.5, deck: 0.7, bot: 0.15, roofK: 0.85, doors: 4 },
  sedan: { fa: 0.29, fr: 0.43, fs: 0.62, fb: 0.74, belt: 0.6, hood: 0.5, deck: 0.62, bot: 0.15, roofK: 0.85, doors: 4 },
  estate: { fa: 0.28, fr: 0.42, fs: 0.84, fb: 0.98, belt: 0.6, hood: 0.5, deck: 0.7, bot: 0.15, roofK: 0.85, doors: 4 },
  coupe: { fa: 0.32, fr: 0.5, fs: 0.62, fb: 0.78, belt: 0.62, hood: 0.5, deck: 0.64, bot: 0.15, roofK: 0.82, doors: 2 },
  micro: { fa: 0.2, fr: 0.34, fs: 0.82, fb: 0.98, belt: 0.55, hood: 0.52, deck: 0.6, bot: 0.15, roofK: 0.9, doors: 2 },
  mini: { fa: 0.24, fr: 0.38, fs: 0.78, fb: 0.97, belt: 0.58, hood: 0.52, deck: 0.7, bot: 0.15, roofK: 0.9, doors: 2 },
  mpv: { fa: 0.2, fr: 0.32, fs: 0.88, fb: 0.98, belt: 0.58, hood: 0.66, deck: 0.7, bot: 0.17, roofK: 0.9, doors: 4 },
  liftback: { fa: 0.3, fr: 0.46, fs: 0.62, fb: 0.9, belt: 0.6, hood: 0.5, deck: 0.64, bot: 0.15, roofK: 0.82, doors: 4 },
  roadster: { fa: 0.34, fr: 0.5, fs: 0.58, fb: 0.7, belt: 0.62, hood: 0.52, deck: 0.62, bot: 0.15, roofK: 0.82, doors: 2, open: true },
  suv: { fa: 0.27, fr: 0.38, fs: 0.84, fb: 0.97, belt: 0.64, hood: 0.6, deck: 0.7, bot: 0.2, roofK: 0.9, doors: 4, rails: true },
};
/** a passenger car: lofted lower body, cabin with roof, wheels with tyres, lamps, bumpers, mirrors, handles. */
function car(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, t = CAR[v.type], hw = W / 2 - 75, zb = Z0 + H * t.bot;
  const Y = (f) => YF + D * (0.012 + 0.976 * f);
  const topz = (f) => Z0 + H * (f < t.fa ? lerp(t.hood, t.belt, smooth(f / t.fa)) : f <= t.fb ? t.belt : lerp(t.belt, t.deck, smooth((f - t.fb) / (1 - t.fb))));
  const fs = [0, 0.025, 0.07, 0.16, 0.3, 0.5, 0.7, 0.86, 0.95, 0.985, 1];
  const body = fs.map((f) => ({ y: Y(f), x: cx, rx: hw * (f < 0.05 ? 0.8 + f * 3.6 : f > 0.94 ? 1 - (f - 0.94) * 3 : 1), z0: zb + H * (f < 0.03 || f > 0.97 ? 0.07 : f < 0.1 || f > 0.9 ? 0.02 : 0), z1: topz(f) }));
  sup(a, body, { seg: 18, n: 3.2 }); planOf(a, body);
  const cabF = [t.fa, lerp(t.fa, t.fr, 0.5), t.fr, lerp(t.fr, t.fs, 0.5), t.fs, lerp(t.fs, t.fb, 0.5), t.fb];
  const roofZ = Z0 + H, beltZ = Z0 + H * t.belt;
  const cab = cabF.map((f, i) => { const k = [0.12, 0.7, 1, 1, 1, 0.7, 0.12][i]; return { y: Y(f), x: cx, rx: hw * [0.8, 0.84, 0.86, 0.86, 0.86, 0.84, 0.78][i], z0: beltZ - H * 0.05, z1: lerp(beltZ, roofZ, k) }; });
  if (!t.open) {
    sup(a, cab, { seg: 14, n: 2.8 });
  a.poly([[cx + cab[2].rx, cab[2].y], [cx + cab[4].rx, cab[4].y], [cx + cab[6].rx, cab[6].y], [cx - cab[6].rx, cab[6].y], [cx - cab[4].rx, cab[4].y], [cx - cab[2].rx, cab[2].y], [cx - cab[0].rx, cab[0].y], [cx + cab[0].rx, cab[0].y]], 'EQUIP-DETAIL');
  } else {
    const y0 = Y(t.fa), y1 = Y(lerp(t.fa, t.fr, 0.75));
    prismX(a, [[y0, beltZ], [y1, roofZ - 30], [y1 + 26, roofZ - 30], [y0 + 26, beltZ]], cx - hw * 0.82, cx + hw * 0.82);
    a.box(cx - hw * 0.84, y0 - 10, beltZ - 10, cx + hw * 0.84, y0 + 40, beltZ + 20);
    for (const q of [-1, 1]) { const sx = cx + q * hw * 0.42, sy = Y(t.fr) + 120; a.box(sx - 200, sy, beltZ - 330, sx + 200, sy + 520, beltZ - 190); prismX(a, [[sy + 520, beltZ - 190], [sy + 640, beltZ - 190], [sy + 700, beltZ + 190], [sy + 600, beltZ + 190]], sx - 200, sx + 200); a.ell(sx, sy + 640, beltZ + 280, 120, 50, 90, 10, 6); a.tube([[sx - 220, sy + 690, beltZ - 180], [sx - 200, sy + 700, roofZ - 150], [sx + 200, sy + 700, roofZ - 150], [sx + 220, sy + 690, beltZ - 180]], [14, 14, 14, 14], 6); }
    a.box(cx - hw * 0.84, Y(t.fr) - 120, beltZ - 80, cx + hw * 0.84, Y(t.fr) + 80, beltZ + 10);
    ring3(a, cx - hw * 0.42, Y(t.fr) + 20, beltZ + 120, 170, 11, 14, 'y'); a.box(cx - hw * 0.84, Y(t.fb) - 80, beltZ - 10, cx + hw * 0.84, Y(t.fb) + 700, beltZ + 40);
    a.rect(cx - hw * 0.84, Y(t.fa), cx + hw * 0.84, Y(t.fb), 'EQUIP-DETAIL');
  }
  for (const s of [-1, 1]) {
    a.tube([[cx + s * hw * 0.8, Y(t.fa), beltZ], [cx + s * hw * 0.84, Y(lerp(t.fa, t.fr, 0.5)), lerp(beltZ, roofZ, 0.72)]], [18, 18], 5);
    if (t.rails) { a.tube([[cx + s * hw * 0.5, Y(t.fr + 0.02), roofZ + 8], [cx + s * hw * 0.5, Y(t.fs - 0.02), roofZ + 8]], [14, 14], 6); for (const f of [t.fr + 0.04, t.fs - 0.04]) a.box(cx + s * hw * 0.5 - 12, Y(f) - 12, roofZ - 30, cx + s * hw * 0.5 + 12, Y(f) + 12, roofZ + 8); }
  }
  const r = v.wr ?? m.min(H * (v.type === 'suv' ? 0.2 : 0.235), 400), tw = r * 0.62, wx = hw - tw * 0.2;
  const fy = Y(0.2), ry = Y(v.type === 'suv' ? 0.8 : 0.79);
  for (const y of [fy, ry]) for (const s of [-1, 1]) whl(a, cx + s * wx, y, r, tw, { z: Z0 + r });
  roadDetails(a, { hw, zb, bh: H * 0.15, zl: Z0 + H * t.hood - 80, zl2: Z0 + H * t.deck - 120, yMir: Y(t.fa) + 20, zMir: beltZ + 20 });
  const dl = t.doors === 4 ? [t.fa + 0.1, lerp(t.fr, t.fs, 0.52), t.fs + 0.06] : [t.fa + 0.12, lerp(t.fs, t.fb, 0.2)];
  for (const f of dl) for (const s of [-1, 1]) { a.line(cx + s * hw, Y(f), cx + s * (hw - 120), Y(f), 'EQUIP-DETAIL'); }
  for (const f of dl.slice(0, -1)) for (const s of [-1, 1]) a.box(cx + s * hw - 10, Y(f + 0.07), beltZ - 90, cx + s * hw + 12, Y(f + 0.07) + 130, beltZ - 55);
  for (const s of [-1, 1]) a.ell(cx + s * (hw - 5), Y(t.fa + 0.04), beltZ - 40, 8, 280, 10, 6, 4);
  a.log('Added the lofted body and roof section, four wheels with tyres and spokes, bumpers, head and tail lamps, mirrors, door handles and door lines (plan and 3D).');
}

/** a panel van: one rounded body with a long roof, cab windscreen, sliding door rail and rear doors. */
function bus(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, hw = W / 2 - 90, Y = (f) => YF + D * f, zf = Z0 + H * v.floor;
  const body = [[0.004, 0.94], [0.03, 1], [0.97, 1], [0.996, 0.94]].map(([f, k]) => ({ y: Y(f), x: cx, rx: hw * k, z0: zf + (k < 1 ? 60 : 0), z1: Z1 - (k < 1 ? 50 : 0) - (v.coach ? 0 : 0) }));
  sup(a, body, { seg: 20, n: 5 }); planOf(a, body);
  const wz0 = Z0 + H * (v.coach ? 0.5 : 0.4), wz1 = Z0 + H * (v.coach ? 0.88 : 0.86);
  // window band: raised glass panes in frames between top and bottom strips; kerb-side doors with two leaves
  const nb = v.bays;
  for (const s of [-1, 1]) {
    const xa = cx + s * (hw - 4), xb = cx + s * (hw + 14);
    a.box(xa, Y(0.05), wz1, xb, Y(0.96), wz1 + 30); a.box(xa, Y(0.05), wz0 - 30, xb, Y(0.96), wz0);
    for (let i = 0; i < nb; i++) {
      const f0 = lerp(0.16, 0.95, i / nb), f1 = lerp(0.16, 0.95, (i + 1) / nb);
      if (s > 0 && v.doorsAt.some(([d0, d1]) => f1 > d0 && f0 < d1)) continue;
      a.box(xa, Y(f0) + 22, wz0 + 24, xb, Y(f1) - 22, wz1 - 24); a.line(cx + s * hw, Y(f1), cx + s * (hw - 90), Y(f1), 'EQUIP-DETAIL');
    }
    if (s > 0) for (const [d0, d1] of v.doorsAt) {
      const dm = (d0 + d1) / 2, dz = Z0 + H * v.floor + 120;
      a.box(xa, Y(d0), dz - 120, xb, Y(d0) + 26, wz1 + 30); a.box(xa, Y(d1) - 26, dz - 120, xb, Y(d1), wz1 + 30);
      for (const [g0, g1] of [[d0 + 0.004, dm - 0.003], [dm + 0.003, d1 - 0.004]]) { a.box(xa, Y(g0) + 20, dz, xb, Y(g1) - 20, wz1 - 20); a.box(xa, Y(g0) + 20, dz, xb + 12, Y(g1) - 20, dz + 24); }
      a.rect(cx + hw - 40, Y(d0), cx + hw + 20, Y(d1), 'EQUIP-DETAIL');
    }
    if (v.coach) for (let i = 0; i < 4; i++) { const f0 = lerp(0.3, 0.9, i / 4); a.box(xa, Y(f0) + 20, Z0 + H * 0.22, xb, Y(f0 + 0.13) - 20, Z0 + H * 0.4); }
  }
  // windscreen and destination sign on the front face
  const fy = Y(0.004);
  a.frame(cx - hw * 0.86, Z0 + H * 0.5, cx + hw * 0.86, Z0 + H * 0.88, fy - 14, fy + 20, 40); a.box(cx - 25, fy - 14, Z0 + H * 0.5, cx + 25, fy + 20, Z0 + H * 0.88);
  a.box(cx - hw * 0.55, fy - 12, Z0 + H * 0.9, cx + hw * 0.55, fy + 20, Z0 + H * 0.97);
  roadDetails(a, { hw: hw * 1.02, zb: zf - 60, bh: H * 0.14, zl: Z0 + H * 0.33, zl2: Z0 + H * 0.33, yMir: Y(0.012), zMir: Z0 + H * 0.52 });
  // wipers, roof pod
  for (const s of [-1, 1]) a.tube([[cx + s * 100, fy - 10, Z0 + H * 0.54], [cx + s * 560, fy - 10, Z0 + H * 0.66]], [9, 9], 4);
  // wheels
  const r = v.coach ? 530 : 500, tw = 280;
  for (const s of [-1, 1]) { whl(a, cx + s * (hw - tw * 0.3), Y(v.axles[0]), r, tw); for (const f of v.axles.slice(1)) { whl(a, cx + s * (hw - tw * 0.3), Y(f), r, tw); whl(a, cx + s * (hw - tw * 1.2), Y(f), r, tw, { plain: true }); } }
  a.log('Added the boxy body with window band, pillars, kerb-side doors, windscreen with destination sign, wipers, mirrors, lamps, bumpers and the axles with wheels (plan and 3D).');
}

/** a motorcycle or scooter. v.kind: scooter | standard | cruiser. */
function moto(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, k = v.kind, wr = v.wr, tw = v.tw, fy = YF + wr + 30, ry = fy + v.wb, ZB = Z0;
  const hz = Z0 + H * (k === 'scooter' ? 0.7 : 0.6), hy = fy + (k === 'cruiser' ? 330 : 200);
  const wheel = (y) => { a.tube([[cx - tw / 2, y, ZB + wr], [cx - tw * 0.4, y, ZB + wr], [cx + tw * 0.4, y, ZB + wr], [cx + tw / 2, y, ZB + wr]], [wr * 0.78, wr, wr, wr * 0.78], 18); a.xcyl(cx - tw * 0.45, cx + tw * 0.45, y, ZB + wr, wr * 0.68, 14); a.xcyl(cx - 60, cx + 60, y, ZB + wr, 28, 8); a.rect(cx - tw / 2, y - wr, cx + tw / 2, y + wr, 'EQUIP-DETAIL'); for (let q = 0; q < 6; q++) { const t = (q / 6) * TAU; a.tube([[cx - tw * 0.38, y, ZB + wr], [cx - tw * 0.38, y + m.cos(t) * wr * 0.66, ZB + wr + m.sin(t) * wr * 0.66]], [6, 6], 4); } };
  wheel(fy); wheel(ry);
  // fork, bars, headlamp
  for (const s of [-1, 1]) { a.tube([[cx + s * 95, hy, hz], [cx + s * 85, fy, ZB + wr]], [22, 20], 8); a.tube([[cx + s * 95, hy, hz], [cx + s * 80, hy + 20, hz + 120]], [22, 20], 6); }
  a.box(cx - 100, hy - 20, hz - 30, cx + 100, hy + 40, hz + 10);
  const bw = k === 'scooter' ? 330 : k === 'cruiser' ? 440 : 390, bz = hz + (k === 'scooter' ? 190 : 190);
  a.tube([[cx - bw, hy + (k === 'cruiser' ? 180 : 40), bz], [cx - bw * 0.3, hy + 20, bz + 10], [cx + bw * 0.3, hy + 20, bz + 10], [cx + bw, hy + (k === 'cruiser' ? 180 : 40), bz]], [14, 14, 14, 14], 6);
  a.tube([[cx - 60, hy + 40, hz + 100], [cx - 40, hy + 20, bz]], [18, 18], 6);
  for (const s of [-1, 1]) { a.xcyl(cx + s * bw - 60, cx + s * bw + 60, hy + (k === 'cruiser' ? 180 : 40), bz, 20, 8); a.box(cx + s * bw * 0.65 - 12, hy - 6, bz - 40, cx + s * bw * 0.65 + 12, hy + 24, bz); }
  a.ell(cx, hy - 70, hz + 20, 140, 90, 120, 12, 8); a.circ(cx, hy - 70, 90, 'EQUIP-DETAIL');
  a.ell(cx, hy + 30, bz + 100, 150, 70, 40, 10, 5);   // dash / instrument
  // front mudguard as a short arc over the wheel
  { const pts = []; for (let q = -3; q <= 3; q++) { const t = q * 0.32; pts.push([cx, fy + m.sin(t) * (wr + 30), ZB + wr + m.cos(t) * (wr + 30)]); } a.tube(pts, pts.map(() => 26), 6); }
  if (k === 'scooter') {
    // leg shield, floor deck, body and seat
    sup(a, [{ y: hy + 30, x: cx, rx: 230, z0: ZB + 240, z1: hz + 150 }, { y: hy + 140, x: cx, rx: 240, z0: ZB + 180, z1: hz + 140 }, { y: hy + 260, x: cx, rx: 220, z0: ZB + 170, z1: hz + 110 }], { seg: 10, n: 2.6 });
    a.box(cx - 270, hy + 200, ZB + 190, cx + 270, ry - 620, ZB + 260); a.rect(cx - 270, hy + 200, cx + 270, ry - 620, 'EQUIP-DETAIL');
    sup(a, [{ y: ry - 700, x: cx, rx: 200, z0: ZB + 250, z1: ZB + H * 0.5 }, { y: ry - 420, x: cx, rx: 300, z0: ZB + 200, z1: ZB + H * 0.54 }, { y: ry + 20, x: cx, rx: 290, z0: ZB + 240, z1: ZB + H * 0.5 }, { y: ry + 230, x: cx, rx: 190, z0: ZB + 330, z1: ZB + H * 0.46 }], { seg: 12, n: 2.6 });
    a.ell(cx, ry - 280, ZB + H * 0.53, 170, 330, 60, 12, 6);
    a.box(cx - 150, ry + 190, ZB + H * 0.4, cx + 150, ry + 250, ZB + H * 0.46);
    a.xcyl(cx - 140, cx + 140, ry, ZB + wr, 65, 8);
  } else {
    // frame, engine, tank, seat, swing arm, exhaust
    const ey = (hy + ry) / 2 + (k === 'cruiser' ? 20 : 0), ez = ZB + H * 0.3;
    a.tube([[cx, hy + 20, hz - 20], [cx, ey - 80, hz - 100], [cx, ry - 250, ZB + H * 0.5]], [32, 30, 28], 8);
    a.tube([[cx, hy + 40, hz - 90], [cx, ey - 40, ez + 30], [cx, ry - 280, ZB + H * 0.34]], [28, 26, 24], 8);
    a.box(cx - 120, ey - 220, ez - 120, cx + 120, ey + 120, ez + 150); a.box(cx - 150, ey - 120, ez + 40, cx + 150, ey + 80, ez + 130);
    a.ycyl(ey - 220, ey - 30, cx, ez + 200, 80, 10);
    if (k === 'cruiser') { for (const s of [-1, 1]) a.tube([[cx + s * 100, ey - 140, ez + 170], [cx + s * 200, ey - 120, ez + 220], [cx + s * 210, ey, ez + 220]], [40, 40, 40], 8); a.box(cx - 90, ey - 260, ez - 190, cx + 90, ey + 180, ez - 120); }
    const tz = hz + (k === 'cruiser' ? 40 : 80);
    a.ell(cx, hy + (k === 'cruiser' ? 330 : 320), tz + 20, k === 'cruiser' ? 190 : 170, k === 'cruiser' ? 340 : 300, k === 'cruiser' ? 150 : 140, 14, 8);
    const sy = hy + (k === 'cruiser' ? 620 : 640), sz = ZB + H * (k === 'cruiser' ? 0.5 : 0.56);
    a.ell(cx, sy + 180, sz, 170, 330, 45, 12, 6); a.rect(cx - 170, sy - 150, cx + 170, sy + 510, 'EQUIP-DETAIL');
    for (const s of [-1, 1]) { a.tube([[cx + s * 90, ey + 130, ez + 40], [cx + s * 90, ry, ZB + wr]], [28, 26], 8); a.tube([[cx + s * 110, sy + 300, sz - 40], [cx + s * 90, ry, ZB + wr + 90]], [14, 14], 6); }
    // rear fender, lamp and plate
    { const pts = []; for (let q = -2; q <= 5; q++) { const t = q * 0.3; pts.push([cx, ry + m.sin(t) * (wr + 35), ZB + wr + m.cos(t) * (wr + 35)]); } a.tube(pts, pts.map(() => 34), 6); }
    a.box(cx - 80, ry + wr * 0.6, ZB + wr * 1.5, cx + 80, ry + wr + 120, ZB + wr * 1.5 + 25); a.box(cx - 70, ry + wr + 110, ZB + wr * 1.1, cx + 70, ry + wr + 150, ZB + wr * 1.1 + 90);
    // exhaust pipes
    for (const s of (k === 'cruiser' ? [-1, 1] : [1])) { a.tube([[cx + s * 120, ey - 120, ez - 60], [cx + s * 150, ey + 80, ez - 160], [cx + s * 160, ry - 200, ZB + 280], [cx + s * 170, ry + 260, ZB + 330]], [26, 26, 44, 44], 8); a.line(cx + s * 160, ey - 100, cx + s * 170, ry + 260, 'EQUIP-DETAIL'); }
    // footpegs
    for (const s of [-1, 1]) a.xcyl(cx + s * 160, cx + s * 300, ey + 140, ZB + 270, 16, 6);
  }
  // sidestand, plan outline
  a.tube([[cx - 150, ry - 200, ZB + 300], [cx - 330, ry - 150, ZB + 20]], [14, 14], 5);
  a.rect(cx - bw, YF, cx + bw, YB, 'EQUIP-HIDDEN'); a.outline('EQUIP-DETAIL');
  a.line(cx, fy, cx, ry, 'EQUIP-DETAIL');
  a.log('Added the wheels with tyres and spokes, forks, handlebar, headlamp, fender, ' + (k === 'scooter' ? 'leg shield, floor deck, body and seat' : 'frame, engine, tank, seat, swing arm, shocks and exhaust') + ' (plan and 3D).');
}

/** a bicycle. v.kind: road | mountain | city. */

// ------------------------------------------------------------------------------------------ round 7 fuel and charging
/** a gas dispenser: plinth, rounded cabinet with header, display, hose holsters with hanging hoses and nozzles, gauge, stop button. v.kind lpg | cng | h2 */
function gasdisp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, zq = (f) => Z0 + H * f, k = v.kind;
  a.box(X0, YF, Z0, X1, YB, Z0 + 100);
  const bw = W * 0.62, by = D * 0.8, st = [{ y: cy - by / 2, x: cx, rx: bw / 2 * 0.92, z0: Z0 + 100, z1: zq(0.88) }, { y: cy - by / 2 + 40, x: cx, rx: bw / 2, z0: Z0 + 100, z1: zq(0.9) }, { y: cy + by / 2 - 40, x: cx, rx: bw / 2, z0: Z0 + 100, z1: zq(0.9) }, { y: cy + by / 2, x: cx, rx: bw / 2 * 0.92, z0: Z0 + 100, z1: zq(0.88) }];
  sup(a, st, { seg: 16, n: 4 });
  a.box(cx - bw / 2 - 20, cy - by / 2 - 20, zq(0.9), cx + bw / 2 + 20, cy + by / 2 + 20, Z1); a.box(cx - bw * 0.3, cy - by / 2 - 24, zq(0.92), cx + bw * 0.3, cy - by / 2 - 4, Z1 - 40);
  const fy = cy - by / 2 - 6;
  a.box(cx - bw * 0.34, fy - 14, zq(0.62), cx + bw * 0.34, fy + 8, zq(0.82)); a.box(cx - bw * 0.3, fy - 18, zq(0.66), cx + bw * 0.3, fy - 14, zq(0.78));
  a.ell(cx - bw * 0.2, fy - 10, zq(0.5), 60, 12, 60, 14, 6); a.ell(cx + bw * 0.2, fy - 10, zq(0.5), 40, 12, 40, 12, 6);
  a.cyl(cx - bw * 0.05, fy - 8, zq(0.43), zq(0.43) + 28, 30, 10);
  for (const s of [-1, 1]) for (let q = 0; q < (k === 'h2' ? 2 : 3); q++) a.box(cx + s * bw * 0.46 - 6, cy - by * 0.3 + q * 80, zq(0.38 + q * 0.08), cx + s * bw * 0.46 + 6, cy - by * 0.3 + q * 80 + 50, zq(0.38 + q * 0.08) + 40);
  const hs = k === 'cng' ? [-1, 1] : [1];
  for (const s of hs) { const hx = cx + s * (bw / 2 + 4), hz = zq(0.44); a.box(hx + (s > 0 ? 0 : -110), cy - 50, hz, hx + (s > 0 ? 110 : 0), cy + 50, hz + 150); a.cyl(hx + s * 55, cy, hz + 100, hz + 190, k === 'h2' ? 32 : 26, 10); a.ycyl(cy - 30, cy + 30, hx + s * 55, hz + 190, k === 'h2' ? 28 : 22, 8);
    a.tube([[hx + s * 55, cy, hz + 100], [hx + s * 110, cy, hz + 20], [hx + s * 130, cy, Z0 + 260], [hx + s * 70, cy + 60, Z0 + 160], [hx + s * 40, cy - 30, hz - 120]], [k === 'h2' ? 22 : 18, 20, 20, 20, 20], 8);
    if (k === 'h2') { a.ycyl(cy - 30, cy + 30, hx + s * 125, Z0 + 330, 34, 12); a.ycyl(cy - 20, cy + 20, hx + s * 125, Z0 + 330, 40, 12); } else a.ycyl(cy - 24, cy + 24, hx + s * 118, Z0 + 330, 30, 10); }
  a.box(cx - bw * 0.1, fy - 20, zq(0.22), cx + bw * 0.1, fy + 6, zq(0.34)); a.cyl(cx - bw * 0.35, fy - 14, zq(0.3), zq(0.34), 28, 10); a.cyl(cx - bw * 0.35, fy - 14, zq(0.34), zq(0.36), 36, 10);
  if (k === 'h2') { a.cyl(cx + bw * 0.28, cy + by * 0.2, Z1 - 40, Z1 + 0, 40, 10); for (let q = 0; q < 5; q++) a.box(cx - bw / 2 - 6, cy - by * 0.3, zq(0.22 + q * 0.07), cx - bw / 2 + 4, cy + by * 0.3, zq(0.22 + q * 0.07) + 24); }
  if (k === 'lpg') for (let q = 0; q < 4; q++) a.box(cx + bw / 2 - 4, cy - by * 0.2, zq(0.12 + q * 0.05), cx + bw / 2 + 6, cy + by * 0.2, zq(0.12 + q * 0.05) + 20);
  a.outline(); a.rect(cx - bw / 2, cy - by / 2, cx + bw / 2, cy + by / 2, 'EQUIP-DETAIL'); a.line(cx - bw * 0.3, fy, cx + bw * 0.3, fy, 'EQUIP-DETAIL'); for (const s of hs) a.circ(cx + s * (bw / 2 + 59), cy, 26, 'EQUIP-DETAIL');
  a.log('Added the plinth, rounded cabinet with a header and light panel, a display with grade buttons, a pressure gauge and emergency stop button, ' + hs.length + ' nozzle holster' + (hs.length > 1 ? 's' : '') + ' with hanging hoses' + (k === 'h2' ? ', a breakaway coupling and a vent stack' : '') + ' and nozzles (plan and 3D).');
}

/** a forecourt canopy: roof slab with sloped fascia, columns on plinths with collars and drain pipes, underside lights */
function canopy(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, rz = Z0 + H * 0.86, ft = H * 0.14, cw = 400;
  const xs = Array.from({ length: v.cols }, (_, i) => X0 + W * 0.14 + (i * W * 0.72) / (v.cols - 1)), ys = [YF + D * 0.3, YB - D * 0.3];
  for (const x of xs) for (const y of ys) { a.box(x - cw / 2 - 100, y - cw / 2 - 100, Z0, x + cw / 2 + 100, y + cw / 2 + 100, Z0 + 120); a.box(x - cw / 2, y - cw / 2, Z0 + 120, x + cw / 2, y + cw / 2, rz); a.box(x - cw / 2 - 40, y - cw / 2 - 40, Z0 + 1000, x + cw / 2 + 40, y + cw / 2 + 40, Z0 + 1060); a.cyl(x + cw / 2 + 30, y, Z0 + 150, rz, 40, 10); a.box(x - cw / 2 - 80, y - cw / 2 - 80, rz - 60, x + cw / 2 + 80, y + cw / 2 + 80, rz); a.rect(x - cw / 2 - 100, y - cw / 2 - 100, x + cw / 2 + 100, y + cw / 2 + 100, 'EQUIP'); a.rect(x - cw / 2, y - cw / 2, x + cw / 2, y + cw / 2, 'EQUIP-DETAIL'); }
  a.box(X0 + 200, YF + 200, rz, X1 - 200, YB - 200, rz + 200);
  prismX(a, [[YF, rz], [YF + 200, rz], [YF + 200, rz + 200], [YF + 60, rz + ft * 0.7 + 200], [YF, rz + ft]], X0 + 200, X1 - 200); prismX(a, [[YB, rz], [YB - 200, rz], [YB - 200, rz + 200], [YB - 60, rz + ft * 0.7 + 200], [YB, rz + ft]], X0 + 200, X1 - 200);
  prismY(a, [[X0, rz], [X0 + 200, rz], [X0 + 200, rz + 200], [X0 + 60, rz + ft * 0.7 + 200], [X0, rz + ft]], YF + 200, YB - 200); prismY(a, [[X1, rz], [X1 - 200, rz], [X1 - 200, rz + 200], [X1 - 60, rz + ft * 0.7 + 200], [X1, rz + ft]], YF + 200, YB - 200);
  a.box(X0, YF, rz - 60, X1, YF + 200, rz); a.box(X0, YB - 200, rz - 60, X1, YB, rz); a.box(X0, YF + 200, rz - 60, X0 + 200, YB - 200, rz); a.box(X1 - 200, YF + 200, rz - 60, X1, YB - 200, rz); a.box(X0 + 200, YF + 200, rz - 40, X1 - 200, YB - 200, rz);
  a.box(X0 + 60, YF + 60, rz - 70, X1 - 60, YF + 90, rz - 60);
  for (let i = 0; i < v.cols * 2; i++) for (const y of [cy - D * 0.2, cy + D * 0.2]) { const x = X0 + W * 0.1 + (i * W * 0.8) / (v.cols * 2 - 1); a.box(x - 160, y - 70, rz - 80, x + 160, y + 70, rz - 60); }
  a.outline('EQUIP-HIDDEN'); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.rect(X0 + 200, YF + 200, X1 - 200, YB - 200, 'EQUIP-DETAIL');
  a.log('Added ' + v.cols * 2 + ' columns on stepped plinths with collar bands and drain pipes, the roof slab with a sloped fascia on all four sides, edge beams, and a grid of underside light panels (plan and 3D).');
}

/** a price pylon sign: footing, mast, stacked price panels with digit windows, a blank header panel and a cap */
function pylon(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, sw = W * 0.86, sd = D * 0.5, pz = Z0 + H * 0.3;
  a.box(X0, YF, Z0, X1, YB, Z0 + 150); a.box(cx - sd, cy - sd, Z0 + 150, cx + sd, cy + sd, Z0 + 260);
  a.box(cx - 150, cy - 150, Z0 + 260, cx + 150, cy + 150, pz); a.box(cx - 180, cy - 180, Z0 + 260, cx + 180, cy + 180, Z0 + 300);
  const pn = v.rows, ph = (Z1 - 520 - pz - H * 0.14) / pn;
  a.box(cx - sw / 2, cy - sd / 2, pz, cx + sw / 2, cy + sd / 2, Z1 - H * 0.02 - 0);
  let z = Z1 - H * 0.02 - H * 0.13; a.box(cx - sw / 2 - 20, cy - sd / 2 - 20, z, cx + sw / 2 + 20, cy + sd / 2 + 20, Z1 - H * 0.02); a.box(cx - sw * 0.38, cy - sd / 2 - 26, z + H * 0.02, cx + sw * 0.38, cy - sd / 2 - 20, Z1 - H * 0.04);
  for (let i = 0; i < pn; i++) { const z1 = z - 10 - i * ph, z0 = z1 - ph + 20; a.box(cx - sw / 2 - 12, cy - sd / 2 - 12, z0, cx + sw / 2 + 12, cy + sd / 2 + 12, z1); a.box(cx - sw * 0.44, cy - sd / 2 - 22, z0 + 14, cx + sw * 0.44, cy - sd / 2 - 12, z1 - 14); for (let d = 0; d < 4; d++) a.box(cx - sw * 0.38 + d * sw * 0.2, cy - sd / 2 - 30, z0 + ph * 0.25, cx - sw * 0.38 + d * sw * 0.2 + sw * 0.14, cy - sd / 2 - 22, z1 - ph * 0.25); a.box(cx + sw * 0.42, cy - sd / 2 - 20, z0 + ph * 0.3, cx + sw * 0.42 + 16, cy - sd / 2 - 12, z1 - ph * 0.3); }
  a.box(cx - sw / 2 - 10, cy - sd / 2 - 10, Z1 - H * 0.02, cx + sw / 2 + 10, cy + sd / 2 + 10, Z1);
  for (const s of [-1, 1]) a.tube([[cx + s * 160, cy + 150, Z0 + 300], [cx + s * 190, cy + 170, Z0 + 700]], [30, 24], 6);
  a.outline('EQUIP-HIDDEN'); a.rect(cx - sw / 2, cy - sd / 2, cx + sw / 2, cy + sd / 2, 'EQUIP'); a.rect(cx - 150, cy - 150, cx + 150, cy + 150, 'EQUIP-DETAIL'); a.rect(cx - sd, cy - sd, cx + sd, cy + sd, 'EQUIP-DETAIL');
  a.log('Added the footing and base plinth, the mast with a collar plate, the sign cabinet with a blank header panel, ' + pn + ' price panels each with four digit windows and a unit lamp, and a cap (plan and 3D).');
}

/** a fuel storage tank on a skid in a bund: horizontal tank on saddles, manway, fill port, vent stack, gauge, pump cabinet with hose, nozzle and holster */
function fuelskid(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bw = 120, bh = H * 0.22, tr = W * 0.31, tz = Z0 + bh + 60 + tr, tx = cx - W * 0.16;
  a.box(X0, YF, Z0, X1, YB, Z0 + 40); for (const [x0, y0, x1, y1] of [[X0, YF, X1, YF + bw], [X0, YB - bw, X1, YB], [X0, YF + bw, X0 + bw, YB - bw], [X1 - bw, YF + bw, X1, YB - bw]]) a.box(x0, y0, Z0 + 40, x1, y1, Z0 + bh);
  const tl = D - 2 * bw - 260; a.ycyl(cy - tl / 2, cy + tl / 2, tx, tz, tr, 28); a.ell(tx, cy - tl / 2, tz, tr, 80, tr, 20, 10); a.ell(tx, cy + tl / 2, tz, tr, 80, tr, 20, 10);
  for (const f of [-0.32, 0.32]) { a.box(tx - tr * 0.8, cy + tl * f - 70, Z0 + 40, tx + tr * 0.8, cy + tl * f + 70, tz - tr * 0.5); prismY(a, [[tx - tr * 0.95, tz - tr * 0.2], [tx + tr * 0.95, tz - tr * 0.2], [tx + tr * 0.5, tz - tr * 0.85], [tx - tr * 0.5, tz - tr * 0.85]], cy + tl * f - 70, cy + tl * f + 70); a.tube([[tx - tr * 0.9, cy + tl * f, tz], [tx - tr * 0.9, cy + tl * f, tz + tr * 0.6], [tx + tr * 0.9, cy + tl * f, tz + tr * 0.6], [tx + tr * 0.9, cy + tl * f, tz]], [8, 8, 8, 8], 5); }
  a.cyl(tx, cy - tl * 0.15, tz + tr - 20, tz + tr + 140, 200, 16); a.cyl(tx, cy - tl * 0.15, tz + tr + 140, tz + tr + 170, 220, 16); a.cyl(tx + 40, cy + tl * 0.3, tz + tr - 20, tz + tr + 120, 50, 10); a.cyl(tx + 40, cy + tl * 0.3, tz + tr + 120, tz + tr + 150, 62, 10);
  a.cyl(tx - tr * 0.5, cy + tl * 0.4, tz + tr - 20, Z1 - 120, 24, 8); a.cone(tx - tr * 0.5, cy + tl * 0.4, Z1 - 120, Z1 - 40, 24, 70, 10); a.cyl(tx - tr * 0.5, cy + tl * 0.4, Z1 - 40, Z1 - 30, 90, 10);
  a.ycyl(cy - tl / 2 - 4, cy - tl / 2 + 20, tx, tz - tr * 0.3, 50, 12); a.box(tx - 70, cy - tl / 2 - 40, tz - tr * 0.5, tx + 70, cy - tl / 2, tz - tr * 0.1); a.ell(tx, cy - tl / 2 - 44, tz + tr * 0.35, 50, 12, 50, 12, 6);
  const px = X1 - W * 0.14, py = cy; a.box(px - W * 0.1, py - D * 0.12, Z0 + bh, px + W * 0.1, py + D * 0.12, Z0 + bh + H * 0.4); a.box(px - W * 0.11, py - D * 0.13, Z0 + bh + H * 0.4, px + W * 0.11, py + D * 0.13, Z0 + bh + H * 0.43);
  a.box(px - W * 0.07, py - D * 0.125 - 14, Z0 + bh + H * 0.24, px + W * 0.07, py - D * 0.12, Z0 + bh + H * 0.36); a.ell(px, py - D * 0.12 - 16, Z0 + bh + H * 0.3, 40, 8, 40, 10, 6);
  a.box(px - 70, py + D * 0.12, Z0 + bh + H * 0.24, px + 70, py + D * 0.12 + 80, Z0 + bh + H * 0.38); a.cyl(px, py + D * 0.12 + 40, Z0 + bh + H * 0.38, Z0 + bh + H * 0.44, 28, 10);
  a.tube([[px - W * 0.1, py, Z0 + bh + H * 0.3], [px - W * 0.17, py, Z0 + bh + H * 0.18], [px - W * 0.15, py + 60, Z0 + bh + 140], [px - W * 0.17, py - 40, Z0 + bh + H * 0.26]], [20, 20, 20, 20], 8); a.ycyl(py - 26, py + 26, px - W * 0.17, Z0 + bh + H * 0.27, 30, 10);
  a.tube([[tx + tr * 0.9, cy, tz - tr * 0.5], [tx + tr * 1.1, cy, Z0 + bh + 80], [px - W * 0.1, py, Z0 + bh + 80]], [22, 22, 22], 8);
  a.outline(); a.rect(X0 + bw, YF + bw, X1 - bw, YB - bw, 'EQUIP-DETAIL'); a.ellp(tx, cy, tr, tl / 2, 'EQUIP-DETAIL'); a.circ(tx, cy - tl * 0.15, 200, 'EQUIP-DETAIL'); a.rect(px - W * 0.1, py - D * 0.12, px + W * 0.1, py + D * 0.12, 'EQUIP-DETAIL');
  a.log('Added the base plate with a bund wall, the ' + v.gal + ' gallon horizontal tank on two saddles with straps, a manway, a fill port, a vent stack with a cap, a gauge, and a pump cabinet with a delivery hose, nozzle holster and a suction line (plan and 3D).');
}

/** a diesel exhaust fluid dispenser: kind tote (a cage tote with pump and hose reel) or pedestal (a rounded pedestal with display and holster) */
function defdisp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  if (v.kind === 'tote') {
    const YT = YF + 350;
    a.box(X0, YT, Z0, X1, YB, Z0 + 150); for (let k = 0; k < 3; k++) a.box(X0 + 40 + k * ((W - 120) / 2), YT, Z0, X0 + 160 + k * ((W - 120) / 2), YB, Z0 + 150);
    const tt = Z0 + 150, th = H * 0.72; a.box(X0 + 30, YT + 30, tt, X1 - 30, YB - 30, tt + th * 0.94); sup(a, [{ y: YT + 30, x: cx, rx: (W - 60) / 2, z0: tt + th * 0.94, z1: tt + th }, { y: YB - 30, x: cx, rx: (W - 60) / 2, z0: tt + th * 0.94, z1: tt + th }], { seg: 8, n: 3 });
    for (let k = 1; k < 5; k++) { a.box(X0 + 16, YT + 16, tt + (th * k) / 5 - 8, X1 - 16, YB - 16, tt + (th * k) / 5 + 8); }
    for (const x of [X0 + 16, X1 - 16]) for (const y of [YT + 16, YB - 16]) a.box(x - 16, y - 16, tt, x + 16, y + 16, tt + th); for (let k = 1; k < 4; k++) for (const s of [YT + 16, YB - 16]) a.box(X0 + 16 + (W - 32) * k / 4 - 8, s - 8, tt, X0 + 16 + (W - 32) * k / 4 + 8, s + 8, tt + th);
    a.cyl(cx, cy, tt + th, tt + th + 40, 100, 14); a.ycyl(YT - 6, YT + 30, cx, tt + 140, 40, 10); a.box(cx - 60, YT - 90, tt + 100, cx + 60, YT - 4, tt + 190);
    const pz = tt + th * 0.5; a.box(cx - 130, YT - 270, pz - 120, cx + 130, YT - 6, pz + 120); a.ycyl(YT - 330, YT - 270, cx - 60, pz, 50, 14); a.cyl(cx + 60, YT - 140, pz + 120, pz + 220, 50, 12);
    const rz = tt + th * 0.85; a.ycyl(YT - 120, YT - 6, cx + W * 0.25, rz, 190, 22); a.ycyl(YT - 130, YT - 120, cx + W * 0.25, rz, 210, 22); for (let k = 0; k < 4; k++) ring3(a, cx + W * 0.25, YT - 60 - k * 12, rz, 120, 9, 14, 'y'); a.tube([[cx + W * 0.25 + 120, YT - 60, rz], [cx + W * 0.25 + 190, YT - 100, rz - 120], [cx + W * 0.25 + 190, YT - 100, Z0 + 700]], [14, 14, 14], 6); a.ycyl(YT - 130, YT - 90, cx + W * 0.25 + 190, Z0 + 700, 30, 8);
    a.outline(); a.rect(X0 + 30, YT + 30, X1 - 30, YB - 30, 'EQUIP-DETAIL');
    a.log('Added the pallet base, the tote bottle inside a tubular cage with ring bands, a top fill cap, a bottom outlet valve, a wall-style pump with a dial and a transfer hose, and a hose reel with a nozzle (plan and 3D).');
  } else {
    a.box(X0, YF, Z0, X1, YB, Z0 + 90); sup(a, [{ y: YF + 20, x: cx, rx: W * 0.4, z0: Z0 + 90, z1: Z1 - H * 0.12 }, { y: YF + 60, x: cx, rx: W * 0.46, z0: Z0 + 90, z1: Z1 - H * 0.08 }, { y: YB - 60, x: cx, rx: W * 0.46, z0: Z0 + 90, z1: Z1 - H * 0.08 }, { y: YB - 20, x: cx, rx: W * 0.4, z0: Z0 + 90, z1: Z1 - H * 0.12 }], { seg: 16, n: 4 });
    a.box(cx - W * 0.5, YF + 10, Z1 - H * 0.08, cx + W * 0.5, YB - 10, Z1); a.box(cx - W * 0.3, YF - 6, Z1 - H * 0.2, cx + W * 0.3, YF + 20, Z1 - H * 0.1);
    const fy = YF + 14; a.box(cx - W * 0.3, fy - 14, Z0 + H * 0.52, cx + W * 0.3, fy + 6, Z0 + H * 0.74); a.ell(cx, fy - 10, Z0 + H * 0.42, 36, 10, 36, 12, 6); a.cyl(cx - W * 0.2, fy - 6, Z0 + H * 0.34, Z0 + H * 0.37, 20, 8);
    a.box(cx + W * 0.4 - 4, cy - 40, Z0 + H * 0.45, cx + W * 0.4 + 90, cy + 40, Z0 + H * 0.6); a.cyl(cx + W * 0.4 + 40, cy, Z0 + H * 0.58, Z0 + H * 0.66, 26, 8);
    a.tube([[cx + W * 0.4 + 40, cy, Z0 + H * 0.58], [cx + W * 0.4 + 90, cy, Z0 + H * 0.3], [cx + W * 0.4 + 50, cy + 50, Z0 + 200]], [14, 14, 14], 6);
    a.outline(); a.rect(cx - W * 0.4, YF + 20, cx + W * 0.4, YB - 20, 'EQUIP-DETAIL');
    a.log('Added the plinth, the rounded pedestal with a roof cap and header, a display with a card slot, a nozzle holster with a hanging hose and a locking nozzle (plan and 3D).');
  }
}

/** an overhead bus charger: kind mast (single post with a reaching pantograph) or gantry (two posts and a beam carrying one or two pantographs) */
function panto(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pc = v.kind === 'gantry' ? (v.bays ?? 1) : 1, cw = 300;
  const head = (x, y, topz) => { a.box(x - 60, y - 60, topz - 120, x + 60, y + 60, topz); a.tube([[x, y, topz - 120], [x - 220, y, topz - 700]], [26, 26], 8); a.tube([[x, y, topz - 120], [x + 220, y, topz - 700]], [26, 26], 8); a.tube([[x - 220, y, topz - 700], [x + 220, y, topz - 1200]], [20, 20], 8); a.tube([[x + 220, y, topz - 700], [x - 220, y, topz - 1200]], [20, 20], 8); a.tube([[x - 220, y, topz - 1200], [x + 220, y, topz - 1200]], [16, 16], 8); a.box(x - 260, y - 140, topz - 1280, x + 260, y + 140, topz - 1200); for (const q of [-1, 1]) a.box(x - 220, y + q * 80 - 12, topz - 1340, x + 220, y + q * 80 + 12, topz - 1280); a.ycyl(y - 80, y + 80, x, topz - 400, 40, 10); a.rect(x - 260, y - 140, x + 260, y + 140, 'EQUIP-DETAIL'); };
  if (v.kind === 'mast') {
    a.box(cx - W * 0.45, cy + D * 0.25, Z0, cx + W * 0.45, cy + D * 0.46, Z0 + 120);
    const my = cy + D * 0.35; a.box(cx - cw / 2, my - cw / 2, Z0 + 120, cx + cw / 2, my + cw / 2, Z1 - 300); a.box(cx - cw / 2 - 20, my - cw / 2 - 20, Z1 - 300, cx + cw / 2 + 20, my + cw / 2 + 20, Z1 - 240);
    a.tube([[cx, my, Z1 - 240], [cx, my, Z1 - 170], [cx, cy - D * 0.4, Z1 - 170]], [90, 80, 60], 10); a.tube([[cx, my, Z1 - 900], [cx, cy - D * 0.1, Z1 - 200]], [40, 40], 8);
    head(cx, cy - D * 0.4, Z1 - 120);
    a.box(cx - 130, my + cw / 2, Z0 + 150, cx + 130, my + cw / 2 + 200, Z0 + 1300); a.box(cx - 100, my + cw / 2 + 200, Z0 + 700, cx + 100, my + cw / 2 + 210, Z0 + 1000); a.cyl(cx, my + cw / 2 + 100, Z0 + 1300, Z0 + 1340, 30, 8);
    a.rect(cx - W * 0.45, cy + D * 0.25, cx + W * 0.45, cy + D * 0.46, 'EQUIP'); a.rect(cx - cw / 2, my - cw / 2, cx + cw / 2, my + cw / 2, 'EQUIP-DETAIL');
  } else {
    const xs = [X0 + 200, X1 - 200], bw = (X1 - X0 - 400) / pc;
    for (const x of xs) { a.box(x - 280, cy - 280, Z0, x + 280, cy + 280, Z0 + 120); a.box(x - cw / 2, cy - cw / 2, Z0 + 120, x + cw / 2, cy + cw / 2, Z1 - 200); a.rect(x - 280, cy - 280, x + 280, cy + 280, 'EQUIP'); a.rect(x - cw / 2, cy - cw / 2, x + cw / 2, cy + cw / 2, 'EQUIP-DETAIL'); }
    a.box(X0 + 120, cy - 250, Z1 - 200, X1 - 120, cy + 250, Z1); a.box(X0 + 120, cy - 250, Z1 - 200, X1 - 120, cy - 230, Z1 - 100); a.rect(X0 + 120, cy - 250, X1 - 120, cy + 250, 'EQUIP-DETAIL');
    for (let b = 0; b < pc; b++) head(X0 + 200 + bw * (b + 0.5), cy, Z1 - 210);
    a.box(X1 - 200 - 140, cy + cw / 2 + 10, Z0 + 150, X1 - 200 + 140, cy + cw / 2 + 210, Z0 + 1400); a.box(X0 + 200 - 100, cy + cw / 2 + 10, Z0 + 150, X0 + 200 + 100, cy + cw / 2 + 150, Z0 + 1000); for (let k = 0; k < 6; k++) a.box(X1 - 200 + 140, cy + cw / 2 + 30, Z0 + 300 + k * 60, X1 - 200 + 150, cy + cw / 2 + 190, Z0 + 320 + k * 60);
  }
  a.outline('EQUIP-HIDDEN');
  a.log('Added the ' + (v.kind === 'mast' ? 'base plate, mast with a collar and a reaching boom' : 'footed columns, a lattice beam') + ', ' + pc + ' pantograph' + (pc > 1 ? 's' : '') + ' with scissor arms and a contact head with two contact bars, and the power cabinet with louvres (plan and 3D).');
}

/** a power cabinet feeding a row of satellite dispenser posts through ground conduits: each post with display, status bar and holstered cable */
function satellites(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.n, cw = W * 0.28, cd = D * 0.7;
  a.box(X0, cy - cd / 2 - 40, Z0, X0 + cw + 80, cy + cd / 2 + 40, Z0 + 120); a.box(X0 + 40, cy - cd / 2, Z0 + 120, X0 + cw + 40, cy + cd / 2, Z1 - 40); a.box(X0 + 20, cy - cd / 2 - 20, Z1 - 80, X0 + cw + 60, cy + cd / 2 + 20, Z1);
  for (let k = 0; k < 10; k++) a.box(X0 + 80, cy - cd / 2 - 8, Z0 + 260 + k * 70, X0 + cw, cy - cd / 2, Z0 + 290 + k * 70); a.box(X0 + cw + 40, cy - cd * 0.3, Z0 + 600, X0 + cw + 52, cy + cd * 0.3, Z0 + 1400); for (let k = 0; k < 5; k++) a.box(X0 + cw + 52, cy - cd * 0.3, Z0 + 600 + k * 120, X0 + cw + 60, cy + cd * 0.3, Z0 + 640 + k * 120);
  a.box(X0 + 100, cy + cd / 2, Z0 + 1200, X0 + 250, cy + cd / 2 + 10, Z0 + 1500); a.cyl(X0 + 340, cy + cd / 2 + 10, Z0 + 1450, Z0 + 1490, 30, 10); a.circ(X0 + 340, cy + cd / 2 + 10, 30, 'EQUIP-DETAIL');
  const x0 = X0 + cw + 400, pitch = (X1 - x0 - 160) / Math.max(1, n - 1);
  for (let i = 0; i < n; i++) {
    const x = n === 1 ? (x0 + X1) / 2 : x0 + i * pitch, py = cy;
    a.box(x - 200, py - 130, Z0, x + 200, py + 130, Z0 + 100); a.box(x - 130, py - 100, Z0 + 100, x + 130, py + 100, Z1 - H * 0.28); a.box(x - 150, py - 110, Z1 - H * 0.28, x + 150, py + 110, Z1 - H * 0.22); a.box(x - 100, py - 102, Z0 + H * 0.5, x + 100, py - 100, Z0 + H * 0.66); a.box(x - 100, py - 106, Z0 + H * 0.5, x + 100, py - 100, Z0 + H * 0.66); a.box(x - 100, py - 100, Z0 + H * 0.38, x + 100, py - 94, Z0 + H * 0.44);
    a.box(x - 80, py - 108, Z0 + H * 0.58, x + 80, py - 100, Z0 + H * 0.62); a.ycyl(py - 106, py - 100, x - 70, Z0 + H * 0.32, 20, 10);
    a.box(x + 130, py - 40, Z0 + H * 0.2, x + 210, py + 40, Z0 + H * 0.4); a.cyl(x + 170, py, Z0 + H * 0.36, Z0 + H * 0.46, 22, 8); a.tube([[x + 170, py, Z0 + H * 0.4], [x + 240, py, Z0 + H * 0.26], [x + 230, py + 60, Z0 + 140], [x + 150, py + 40, Z0 + H * 0.22]], [14, 14, 14, 14], 6);
    a.tube([[x, py, Z0 + 45], [X0 + cw + 80, cy, Z0 + 45]], [30, 30], 6);
    a.rect(x - 200, py - 130, x + 200, py + 130, 'EQUIP'); a.rect(x - 130, py - 100, x + 130, py + 100, 'EQUIP-DETAIL'); a.circ(x + 170, py, 22, 'EQUIP-DETAIL');
  }
  a.rect(X0, cy - cd / 2 - 40, X0 + cw + 80, cy + cd / 2 + 40, 'EQUIP'); a.rect(X0 + 40, cy - cd / 2, X0 + cw + 40, cy + cd / 2, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
  a.log('Added the power cabinet on its plinth with louvres, a door handle and a roof, and ' + n + ' satellite dispenser posts on their own plinths with display, light bar, card reader and holstered cable, joined to the cabinet by ground conduits (plan and 3D).');
}

/** a wireless charging bay: ground pad on a raised plate, wheel stop with rubber end caps, a status post, optional alignment lamps */
function wireless(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pw = W * v.pf, pd = D * 0.5, py = cy - D * 0.1;
  a.box(cx - pw / 2 - 40, py - pd / 2 - 40, Z0, cx + pw / 2 + 40, py + pd / 2 + 40, Z0 + 40); prismX(a, [[py - pd / 2 - 40, Z0 + 40], [py - pd / 2, Z0 + 70], [py + pd / 2, Z0 + 70], [py + pd / 2 + 40, Z0 + 40]], cx - pw / 2, cx + pw / 2);
  a.cyl(cx, py, Z0 + 70, Z0 + 80, pw * 0.3, 28); ring3(a, cx, py, Z0 + 82, pw * 0.3, 8, 24, 'z'); ring3(a, cx, py, Z0 + 82, pw * 0.18, 6, 20, 'z');
  for (let k = 0; k < 4; k++) { const t = (k / 4) * TAU + m.PI / 4; a.box(cx + m.cos(t) * pw * 0.4 - 16, py + m.sin(t) * pd * 0.4 - 16, Z0 + 70, cx + m.cos(t) * pw * 0.4 + 16, py + m.sin(t) * pd * 0.4 + 16, Z0 + 90); }
  const wy = YB - 260; a.box(cx - W * 0.4, wy - 90, Z0, cx + W * 0.4, wy + 90, Z0 + 150); for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - (s > 0 ? 40 : 0), wy - 95, Z0, cx + s * W * 0.4 + (s > 0 ? 0 : 40), wy + 95, Z0 + 170); for (const s of [-1, 1]) a.cyl(cx + s * W * 0.25, wy, Z0 + 150, Z0 + 170, 20, 8);
  const sx = X1 - W * 0.12, sy = YB - 80; a.box(sx - 100, sy - 100, Z0, sx + 100, sy + 100, Z0 + 60); a.box(sx - 60, sy - 60, Z0 + 60, sx + 60, sy + 60, Z1 - H * 0.2); a.box(sx - 80, sy - 80, Z1 - H * 0.2, sx + 80, sy + 80, Z1); a.ell(sx, sy - 82, Z1 - H * 0.1, 40, 8, 40, 10, 6); a.box(sx - 40, sy - 64, Z0 + H * 0.4, sx + 40, sy - 58, Z0 + H * 0.5);
  a.outline(); a.rect(cx - pw / 2 - 40, py - pd / 2 - 40, cx + pw / 2 + 40, py + pd / 2 + 40, 'EQUIP'); a.circ(cx, py, pw * 0.3, 'EQUIP-DETAIL'); a.circ(cx, py, pw * 0.18, 'EQUIP-DETAIL'); a.rect(cx - W * 0.4, wy - 90, cx + W * 0.4, wy + 90, 'EQUIP-DETAIL'); a.rect(sx - 100, sy - 100, sx + 100, sy + 100, 'EQUIP-DETAIL');
  a.log('Added the raised plate with chamfered edges, the round charging pad with two coil rings and four alignment studs, a wheel stop with rubber end caps, and a status post with a light head and an indicator window (plan and 3D).');
}

/** charging cable handling: kind wall (a bracket with a holster and a hook), reel (a ceiling plate and spring reel with a hanging connector), boom (a floor post with a swing boom) */
function cablehandling(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, k = v.kind;
  if (k === 'wall') {
    a.box(X0, YB - 14, Z0, X1, YB, Z1); a.box(X0 + 20, YB - 40, Z0 + H * 0.55, X1 - 20, YB - 14, Z1 - 20); a.box(cx - W * 0.3, YB - 80, Z0 + H * 0.6, cx + W * 0.3, YB - 40, Z0 + H * 0.85); a.cyl(cx, YB - 90, Z0 + H * 0.66, Z0 + H * 0.78, W * 0.18, 12);
    a.tube([[cx, YB - 100, Z0 + H * 0.72], [cx - W * 0.1, YB - 160, Z0 + H * 0.4], [cx + W * 0.05, YB - 150, Z0 + H * 0.2]], [14, 14, 14], 6); a.box(cx - 40, YB - 180, Z0 + H * 0.16, cx + 40, YB - 140, Z0 + H * 0.22);
    a.tube([[cx + W * 0.3, YB - 14, Z0 + H * 0.35], [cx + W * 0.3, YB - 90, Z0 + H * 0.35], [cx + W * 0.3, YB - 110, Z0 + H * 0.3]], [8, 8, 8], 5); for (let q = 0; q < 4; q++) ring3(a, cx - W * 0.15, YB - 60 - q * 14, Z0 + H * 0.42, H * 0.16, 7, 14, 'y'); a.box(cx - W * 0.45, YB - 30, Z0 + 20, cx + W * 0.45, YB - 14, Z0 + 60);
    a.outline(); a.rect(cx - W * 0.3, YB - 80, cx + W * 0.3, YB - 40, 'EQUIP-DETAIL'); a.circ(cx, YB - 90, W * 0.18, 'EQUIP-DETAIL');
    a.log('Added the back plate and mounting plate, the upper plug holster with a retaining ring, the coiled cable on a side hook and a lower connector cradle (plan and 3D).');
  } else if (k === 'reel') {
    a.box(X0, YF, Z1 - 40, X1, YB, Z1); a.box(cx - W * 0.4, cy - D * 0.4, Z1 - 120, cx + W * 0.4, cy + D * 0.4, Z1 - 40);
    a.ycyl(cy - D * 0.35, cy + D * 0.35, cx, Z1 - 380, W * 0.36, 24); a.ycyl(cy - D * 0.4, cy - D * 0.35, cx, Z1 - 380, W * 0.4, 24); a.ycyl(cy + D * 0.35, cy + D * 0.4, cx, Z1 - 380, W * 0.4, 24);
    for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - (s > 0 ? 6 : 0), cy - D * 0.42, Z1 - 400, cx + s * W * 0.4 + (s > 0 ? 0 : 6), cy + D * 0.42, Z1 - 120);
    a.tube([[cx, cy, Z1 - 380 - W * 0.36], [cx, cy, Z1 - 620], [cx + 40, cy, Z1 - 900], [cx, cy, Z1 - 1220]], [20, 20, 20, 20], 8); a.box(cx - 60, cy - 40, Z1 - 1500, cx + 60, cy + 40, Z1 - 1220); a.cyl(cx, cy, Z1 - 1560, Z1 - 1500, 44, 12); a.cyl(cx, cy, Z1 - 1620, Z1 - 1560, 30, 12);
    a.ycyl(cy - D * 0.3, cy + D * 0.3, cx, Z1 - 160, 12, 8);
    a.outline(); a.circ(cx, cy, W * 0.36, 'EQUIP-DETAIL'); a.rect(cx - W * 0.4, cy - D * 0.4, cx + W * 0.4, cy + D * 0.4, 'EQUIP-DETAIL');
    a.log('Added the ceiling plate, the spring reel drum with two flanges and side plates, the guide eye, the cable hanging down to a connector body with a locking sleeve and the tip (plan and 3D).');
  } else {
    const pz = Z1 - H * 0.12; a.box(X0 + 10, cy - D * 0.45, Z0, X1 - 10, cy + D * 0.45, Z0 + 40); a.box(cx - 70, cy - 70, Z0 + 40, cx + 70, cy + 70, pz); a.cyl(cx, cy, pz, pz + 40, 90, 14);
    a.tube([[cx, cy, pz + 20], [cx + W * 0.2, cy, pz + 160], [cx + W * 0.4, cy, pz + 120]], [46, 40, 36], 10); a.tube([[cx, cy, pz + 20], [cx + W * 0.2, cy, pz + 360], [cx + W * 0.38, cy, pz + 130]], [14, 14, 14], 6);
    a.tube([[cx + W * 0.4, cy, pz + 120], [cx + W * 0.44, cy, pz - 400], [cx + W * 0.42, cy, pz - 900], [cx + W * 0.36, cy + 50, pz - 1150]], [20, 20, 20, 20], 8); a.box(cx + W * 0.34 - 40, cy - 25, pz - 1450, cx + W * 0.34 + 40, cy + 25, pz - 1150); a.box(cx - 140, cy - 120, Z0 + 700, cx + 140, cy + 120, Z0 + 1300); a.box(cx - 100, cy - 124, Z0 + 900, cx + 100, cy - 120, Z0 + 1100);
    a.outline(); a.circ(cx, cy, 90, 'EQUIP-DETAIL'); a.line(cx, cy, cx + W * 0.4, cy, 'EQUIP-DETAIL'); a.rect(cx - 140, cy - 120, cx + 140, cy + 120, 'EQUIP-DETAIL');
    a.log('Added the base plate, the post with a collar, a swing boom with a tie bar and the cable hanging from it to a connector body, and a control box with a display on the post (plan and 3D).');
  }
}

/** an e-bike charging locker bank: plinth, rows of cabinets with doors, handles, vent slots, status lamps and a sloped roof */
function bikelocker(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pl = 100, cols = v.cols, rows = v.rows, bw = (W - 40) / cols, bh = (H - pl - 120) / rows;
  a.box(X0, YF, Z0, X1, YB, Z0 + pl);
  a.box(X0 + 20, YF + 20, Z0 + pl, X1 - 20, YB - 10, Z1 - 120);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x0 = X0 + 20 + c * bw, z0 = Z0 + pl + r * bh;
    a.box(x0 + 6, YF + 6, z0 + 6, x0 + bw - 6, YF + 22, z0 + bh - 6); a.box(x0 + bw * 0.74, YF - 8, z0 + bh * 0.42, x0 + bw * 0.88, YF + 6, z0 + bh * 0.58);
    for (let q = 0; q < 4; q++) a.box(x0 + bw * 0.2, YF + 2, z0 + bh * 0.72 + q * 14, x0 + bw * 0.62, YF + 8, z0 + bh * 0.72 + q * 14 + 6);
    a.ell(x0 + bw * 0.3, YF + 4, z0 + bh * 0.3, 14, 6, 14, 8, 4); a.box(x0 + bw * 0.4, YF + 2, z0 + bh * 0.24, x0 + bw * 0.62, YF + 10, z0 + bh * 0.3);
    a.line(x0 + 6, YF + 6, x0 + bw - 6, YF + 6, 'EQUIP-DETAIL'); a.line(x0 + 6, YF + 6, x0 + 6, YF + 22, 'EQUIP-DETAIL');
  }
  prismX(a, [[YF - 30, Z1 - 120], [YB, Z1 - 120], [YB, Z1], [YF - 30, Z1 - 60]], X0 - 0, X1); a.box(X0 + 10, YF - 30, Z1 - 120, X1 - 10, YB, Z1 - 100);
  for (const x of [X0 + 10, X1 - 10]) a.box(x - 10, YF, Z0 + pl, x + 10, YB, Z1 - 120);
  a.outline(); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 10, 'EQUIP-HIDDEN'); for (let c = 1; c < cols; c++) a.line(X0 + 20 + c * bw, YF + 6, X0 + 20 + c * bw, YF + 22, 'EQUIP-DETAIL');
  a.log('Added the plinth, the carcass, ' + cols * rows + ' lockable charging compartments each with a door, a handle, vent slots and a status lamp with a socket plate, side posts and a sloped roof (plan and 3D).');
}

/** a car vacuum station: kind post (a single hose on a tower), twin (a double tower with two hose reels), boom (a post with an overhead boom and a hanging hose) */
function vacstation(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, k = v.kind;
  a.box(X0, YF, Z0, X1, YB, Z0 + 80);
  if (k === 'boom') {
    a.box(cx - W * 0.3, cy - D * 0.3, Z0 + 80, cx + W * 0.3, cy + D * 0.3, Z0 + H * 0.45); sup(a, [{ y: cy - D * 0.3, x: cx, rx: W * 0.3, z0: Z0 + H * 0.45, z1: Z1 - H * 0.12 }, { y: cy + D * 0.3, x: cx, rx: W * 0.3, z0: Z0 + H * 0.45, z1: Z1 - H * 0.12 }], { seg: 10, n: 3 });
    a.box(cx - W * 0.3, cy - D * 0.3 - 6, Z0 + H * 0.3, cx + W * 0.3, cy - D * 0.3, Z0 + H * 0.4); a.ell(cx, cy - D * 0.3 - 8, Z0 + H * 0.36, 30, 6, 12, 10, 4); a.box(cx - 50, cy - D * 0.3 - 8, Z0 + H * 0.2, cx + 50, cy - D * 0.3, Z0 + H * 0.26);
    const bz = Z1 - 100; a.cyl(cx, cy, Z1 - H * 0.12, bz + 60, 70, 12); a.tube([[cx, cy, bz], [cx + W * 0.22, cy, bz + 120], [cx + W * 0.4, cy, bz + 60]], [40, 34, 30], 10);
    a.tube([[cx + W * 0.4, cy, bz + 60], [cx + W * 0.42, cy, bz - 500], [cx + W * 0.4, cy, bz - 1000], [cx + W * 0.3, cy, bz - 1300]], [24, 24, 22, 22], 8); a.tube([[cx + W * 0.3, cy, bz - 1300], [cx + W * 0.24, cy, bz - 1500]], [32, 60], 8); a.box(cx + W * 0.24 - 140, cy - 12, bz - 1560, cx + W * 0.24 + 40, cy + 12, bz - 1500);
    a.line(cx, cy, cx + W * 0.4, cy, 'EQUIP-DETAIL');
  } else {
    const nt = k === 'twin' ? 2 : 1;
    for (let q = 0; q < nt; q++) { const x = nt === 1 ? cx : cx + (q ? 1 : -1) * W * 0.24, tw = nt === 1 ? W * 0.62 : W * 0.36;
      sup(a, [{ y: cy - D * 0.4, x, rx: tw / 2 * 0.9, z0: Z0 + 80, z1: Z1 - H * 0.1 }, { y: cy - D * 0.4 + 40, x, rx: tw / 2, z0: Z0 + 80, z1: Z1 - H * 0.08 }, { y: cy + D * 0.4 - 40, x, rx: tw / 2, z0: Z0 + 80, z1: Z1 - H * 0.08 }, { y: cy + D * 0.4, x, rx: tw / 2 * 0.9, z0: Z0 + 80, z1: Z1 - H * 0.1 }], { seg: 14, n: 4 });
      a.box(x - tw / 2 - 12, cy - D * 0.42, Z1 - H * 0.08, x + tw / 2 + 12, cy + D * 0.42, Z1); const fy = cy - D * 0.4 - 4; a.box(x - tw * 0.35, fy - 12, Z0 + H * 0.58, x + tw * 0.35, fy + 8, Z0 + H * 0.8); a.box(x - tw * 0.1, fy - 14, Z0 + H * 0.42, x + tw * 0.1, fy + 4, Z0 + H * 0.5); a.box(x - tw * 0.3, fy - 10, Z0 + H * 0.28, x + tw * 0.3, fy + 4, Z0 + H * 0.34);
      a.ycyl(cy + D * 0.4 - 0, cy + D * 0.4 + 40, x, Z0 + H * 0.62, 40, 12);
      a.tube([[x, cy - D * 0.1, Z1 - H * 0.08], [x + tw * 0.2, cy - D * 0.1, Z1 + 0 - 40], [x + tw * 0.55, cy - D * 0.1, Z1 - H * 0.12]], [34, 30, 28], 8);
      a.tube([[x + tw * 0.55, cy - D * 0.1, Z1 - H * 0.12], [x + tw * 0.62, cy - D * 0.1, Z0 + H * 0.45], [x + tw * 0.5, cy + D * 0.1, Z0 + H * 0.2], [x + tw * 0.3, cy + D * 0.3, Z0 + H * 0.25]], [24, 22, 22, 22], 8); a.tube([[x + tw * 0.3, cy + D * 0.3, Z0 + H * 0.25], [x + tw * 0.25, cy + D * 0.33, Z0 + H * 0.12]], [30, 56], 8);
      a.rect(x - tw / 2, cy - D * 0.4, x + tw / 2, cy + D * 0.4, 'EQUIP-DETAIL'); }
  }
  a.outline();
  a.log('Added the plinth, ' + (k === 'boom' ? 'the tower with a payment panel, a swing boom with a drop hose and a crevice nozzle' : k === 'twin' ? 'two towers each with a coin and card panel, a roof cap, a hose arm, a hanging hose and a crevice nozzle' : 'the tower with a payment panel, a roof cap, a hose arm, a hanging hose and a crevice nozzle') + ' (plan and 3D).');
}

/** a portable fuel container. kind round (round-shouldered plastic can with a pour spout), jerry (rectangular can with three handles and an X-pressed side), safety (a can with a flame arrestor spout and a spring lid) */
function fuelcan(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, k = v.kind;
  if (k === 'jerry') {
    sup(a, [{ y: cy - D / 2 + 4, x: cx, rx: W * 0.5 - 6, z0: Z0 + 10, z1: Z0 + H * 0.83 }, { y: cy - D / 2 + 12, x: cx, rx: W * 0.5, z0: Z0, z1: Z0 + H * 0.85 }, { y: cy + D / 2 - 12, x: cx, rx: W * 0.5, z0: Z0, z1: Z0 + H * 0.85 }, { y: cy + D / 2 - 4, x: cx, rx: W * 0.5 - 6, z0: Z0 + 10, z1: Z0 + H * 0.83 }], { seg: 10, n: 6 });
    for (const s of [-1, 1]) { const x = cx + s * W * 0.2; a.tube([[x, cy - D / 2 + 20, Z0 + H * 0.3], [x, cy - D / 2 + 4, Z0 + H * 0.3]], [4, 4], 4); }
    a.tube([[cx - W * 0.46, cy - D / 2 + 3, Z0 + H * 0.12], [cx + W * 0.46, cy - D / 2 + 3, Z0 + H * 0.78]], [4, 4], 4); a.tube([[cx + W * 0.46, cy - D / 2 + 3, Z0 + H * 0.12], [cx - W * 0.46, cy - D / 2 + 3, Z0 + H * 0.78]], [4, 4], 4);
    a.tube([[cx - W * 0.46, cy + D / 2 - 3, Z0 + H * 0.12], [cx + W * 0.46, cy + D / 2 - 3, Z0 + H * 0.78]], [4, 4], 4); a.tube([[cx + W * 0.46, cy + D / 2 - 3, Z0 + H * 0.12], [cx - W * 0.46, cy + D / 2 - 3, Z0 + H * 0.78]], [4, 4], 4);
    a.box(cx - W * 0.3, cy - D * 0.4, Z0 + H * 0.85, cx + W * 0.3, cy + D * 0.4, Z0 + H * 0.91); a.tube([[cx - W * 0.28, cy - D * 0.38, Z0 + H * 0.91], [cx - W * 0.28, cy - D * 0.38, Z0 + H * 0.98], [cx + W * 0.28, cy - D * 0.38, Z0 + H * 0.98], [cx + W * 0.28, cy - D * 0.38, Z0 + H * 0.91]], [5, 5, 5, 5], 5);
    a.tube([[cx - W * 0.28, cy + D * 0.38, Z0 + H * 0.91], [cx - W * 0.28, cy + D * 0.38, Z0 + H * 0.98], [cx + W * 0.28, cy + D * 0.38, Z0 + H * 0.98], [cx + W * 0.28, cy + D * 0.38, Z0 + H * 0.91]], [5, 5, 5, 5], 5); a.box(cx - W * 0.12, cy - D * 0.4, Z0 + H * 0.91, cx + W * 0.12, cy + D * 0.4, Z0 + H * 0.97);
    a.cyl(cx + W * 0.34, cy - D * 0.3, Z0 + H * 0.85, Z0 + H * 0.93, 14, 12); a.cyl(cx + W * 0.34, cy - D * 0.3, Z0 + H * 0.93, Z0 + H * 0.96, 17, 12); a.cyl(cx - W * 0.28, cy + D * 0.3, Z0 + H * 0.85, Z0 + H * 0.91, 7, 8);
    a.outline(); a.rect(cx - W * 0.45, cy - D * 0.45, cx + W * 0.45, cy + D * 0.45, 'EQUIP-DETAIL'); a.circ(cx + W * 0.34, cy - D * 0.3, 14, 'EQUIP-DETAIL');
  } else if (k === 'round') {
    sup(a, [{ y: cy - D / 2 + 3, x: cx, rx: W * 0.42, z0: Z0 + 6, z1: Z0 + H * 0.74 }, { y: cy - D * 0.35, x: cx, rx: W * 0.5, z0: Z0, z1: Z0 + H * 0.78 }, { y: cy + D * 0.35, x: cx, rx: W * 0.5, z0: Z0, z1: Z0 + H * 0.78 }, { y: cy + D / 2 - 3, x: cx, rx: W * 0.42, z0: Z0 + 6, z1: Z0 + H * 0.74 }], { seg: 16, n: 2.6 });
    a.ell(cx, cy, Z0 + H * 0.76, W * 0.42, D * 0.42, H * 0.1, 16, 6); a.tube([[cx - W * 0.3, cy - D * 0.2, Z0 + H * 0.78], [cx - W * 0.3, cy - D * 0.2, Z0 + H * 0.97], [cx + W * 0.1, cy - D * 0.2, Z0 + H * 0.97], [cx + W * 0.1, cy - D * 0.2, Z0 + H * 0.8]], [8, 8, 8, 8], 6);
    a.cyl(cx + W * 0.26, cy + D * 0.1, Z0 + H * 0.82, Z0 + H * 0.92, 16, 12); a.cone(cx + W * 0.26, cy + D * 0.1, Z0 + H * 0.92, Z0 + H * 0.99, 16, 24, 12); a.cyl(cx - W * 0.02, cy + D * 0.2, Z0 + H * 0.84, Z0 + H * 0.91, 8, 8);
    for (let q = 0; q < 3; q++) a.box(cx - W * 0.46, cy - D * 0.2 + q * D * 0.2, Z0 + H * 0.2, cx + W * 0.46, cy - D * 0.2 + q * D * 0.2 + 6, Z0 + H * 0.64);
    a.outline(); a.ellp(cx, cy, W * 0.48, D * 0.48, 'EQUIP-DETAIL'); a.circ(cx + W * 0.26, cy + D * 0.1, 16, 'EQUIP-DETAIL');
  } else {
    a.box(cx - W * 0.5, cy - D * 0.5, Z0, cx + W * 0.5, cy + D * 0.5, Z0 + H * 0.76); a.box(cx - W * 0.46, cy - D * 0.46, Z0 + H * 0.76, cx + W * 0.46, cy + D * 0.46, Z0 + H * 0.82); for (const q of [0.2, 0.5, 0.8]) a.box(cx - W * 0.52, cy - D * 0.5 - 2, Z0 + H * q * 0.9, cx + W * 0.52, cy - D * 0.5 + 3, Z0 + H * q * 0.9 + 8);
    a.tube([[cx - W * 0.4, cy, Z0 + H * 0.82], [cx - W * 0.4, cy, Z0 + H * 0.94], [cx + W * 0.4, cy, Z0 + H * 0.94], [cx + W * 0.4, cy, Z0 + H * 0.82]], [10, 10, 10, 10], 6);
    a.cyl(cx - W * 0.24, cy, Z0 + H * 0.82, Z0 + H * 0.9, 30, 14); a.cyl(cx - W * 0.24, cy, Z0 + H * 0.9, Z0 + H * 0.93, 34, 14); a.box(cx - W * 0.24 - 4, cy - 30, Z0 + H * 0.93, cx - W * 0.24 + 4, cy + 30, Z0 + H * 0.96);
    a.tube([[cx + W * 0.3, cy, Z0 + H * 0.82], [cx + W * 0.34, cy, Z0 + H * 0.9], [cx + W * 0.4, cy, Z0 + H * 0.98]], [14, 12, 8], 8); a.cyl(cx + W * 0.3, cy, Z0 + H * 0.82, Z0 + H * 0.86, 16, 10);
    a.outline(); a.rect(cx - W * 0.46, cy - D * 0.46, cx + W * 0.46, cy + D * 0.46, 'EQUIP-DETAIL'); a.circ(cx - W * 0.24, cy, 30, 'EQUIP-DETAIL');
  }
  a.log('Added the ' + { round: 'round-shouldered body with a grip handle, a pour spout with a cap and a vent', jerry: 'rectangular body with an X-pressed side, three handles, a screw cap and a vent', safety: 'ribbed body with a carry handle, a spring lid with a flame arrestor cap and a pour spout' }[k] + ' (plan and 3D).');
}

/** a fuel drum: kind cradle (one drum horizontal on a cradle with a pump), rack (two drums on a rack), pallet (a drum upright on a spill pallet with a hand pump) */
function fueldrum(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, k = v.kind, dr = 290;
  const drum = (x, y, z0, h, vertical) => { if (vertical) { a.cyl(x, y, z0, z0 + h, dr, 24); for (const q of [0.12, 0.5, 0.88]) a.cyl(x, y, z0 + h * q - 8, z0 + h * q + 8, dr + 10, 24); a.cyl(x, y, z0 + h, z0 + h + 24, dr + 12, 24); a.cyl(x + 100, y, z0 + h + 24, z0 + h + 50, 30, 10); a.cyl(x - 100, y + 60, z0 + h + 24, z0 + h + 44, 20, 10); } };
  if (k === 'pallet') {
    a.box(X0, YF, Z0 + 100, X1, YB, Z0 + 140); a.box(X0 + 20, YF + 20, Z0 + 140, X1 - 20, YB - 20, Z0 + 160); for (const [x0, y0, x1, y1] of [[X0, YF, X1, YF + 40], [X0, YB - 40, X1, YB], [X0, YF, X0 + 40, YB], [X1 - 40, YF, X1, YB]]) a.box(x0, y0, Z0 + 100, x1, y1, Z0 + 220); for (let i = 0; i < 4; i++) a.box(X0 + 40, YF + (D - 80) * (i / 3) + 20 - 20 + 0, Z0, X1 - 40, YF + (D - 80) * (i / 3) + 60, Z0 + 100);
    a.box(X0 + 60, YF + 60, Z0 + 160, X1 - 60, YB - 60, Z0 + 175); drum(cx, cy + 40, Z0 + 175, 880, true);
    a.cyl(cx + 100, cy + 40, Z0 + 175 + 880 + 50, Z0 + 175 + 880 + 400, 20, 10); a.tube([[cx + 100, cy + 40, Z0 + 175 + 880 + 400], [cx + 220, cy + 40, Z0 + 175 + 880 + 420], [cx + 360, cy + 40, Z0 + 175 + 880 + 300]], [20, 20, 20], 8); a.tube([[cx + 360, cy + 40, Z0 + 175 + 880 + 300], [cx + 400, cy + 40, Z0 + 175 + 880 + 100]], [14, 14], 6); a.tube([[cx + 360, cy + 40, Z0 + 175 + 880 + 300], [cx + 480, cy + 40, Z0 + 175 + 880 + 330]], [12, 12], 6); a.tube([[cx - 120, cy + 40, Z0 + 175 + 880 + 400], [cx + 100, cy + 40, Z0 + 175 + 880 + 420]], [26, 26], 8);
    a.outline(); a.circ(cx, cy + 40, dr, 'EQUIP'); a.rect(X0 + 60, YF + 60, X1 - 60, YB - 60, 'EQUIP-DETAIL');
  } else if (k === 'cradle') {
    const zc = Z0 + 420; a.box(X0, YF, Z0, X1, YB, Z0 + 60); for (const x of [cx - 300, cx + 300]) { a.box(x - 40, YF + 60, Z0 + 60, x + 40, YB - 60, Z0 + 140); prismX(a, [[YF + 80, Z0 + 140], [YB - 80, Z0 + 140], [YB - 330, zc - 80], [YF + 330, zc - 80]], x - 40, x + 40); }
    a.xcyl(cx - 500, cx + 500, cy + 0, zc, dr, 26); for (const q of [-0.35, 0, 0.35]) a.xcyl(cx + q * 900 - 10, cx + q * 900 + 10, cy, zc, dr + 10, 26); a.xcyl(cx - 500 - 20, cx - 500, cy, zc, dr + 12, 26); a.xcyl(cx + 500, cx + 520, cy, zc, dr + 12, 26);
    a.cyl(cx + 150, cy, zc + dr, zc + dr + 20, 40, 10); a.cyl(cx - 150, cy + 100, zc + dr, zc + dr + 20, 22, 10); a.box(cx + 520, cy - 80, zc - 120, cx + 640, cy + 80, zc + 120); a.tube([[cx + 580, cy, zc + 120], [cx + 580, cy, zc + 420]], [18, 18], 8); a.ycyl(cy - 80, cy + 80, cx + 580, zc + 420, 18, 8);
    a.tube([[cx + 580, cy + 80, zc + 60], [cx + 700, cy + 180, zc - 100], [cx + 760, cy + 100, Z0 + 140]], [16, 16, 16], 6); a.ycyl(cy + 60, cy + 140, cx + 770, Z0 + 140, 26, 10);
    a.outline(); a.rect(cx - 500, cy - dr, cx + 500, cy + dr, 'EQUIP'); for (const x of [cx - 300, cx + 300]) a.rect(x - 40, YF + 60, x + 40, YB - 60, 'EQUIP-DETAIL');
  } else {
    a.box(X0, YF, Z0, X1, YB, Z0 + 80); for (const y of [cy - D * 0.22, cy + D * 0.22]) { a.box(X0 + 30, y - 40, Z0 + 80, X1 - 30, y + 40, Z0 + 150); }
    for (const x of [X0 + 60, X1 - 60]) { a.box(x - 30, YF + 40, Z0 + 80, x + 30, YF + 100, Z1 - 40); a.box(x - 30, YB - 100, Z0 + 80, x + 30, YB - 40, Z1 - 40); }
    for (const z of [Z0 + H * 0.4, Z1 - 80]) { a.box(X0 + 30, YF + 40, z, X1 - 30, YF + 90, z + 50); a.box(X0 + 30, YB - 90, z, X1 - 30, YB - 40, z + 50); }
    for (const q of [-1, 1]) { const x = cx + q * W * 0.24; a.xcyl(x - 270, x + 270, cy, Z0 + 150 + dr, dr, 24); for (const f of [-0.3, 0.3]) a.xcyl(x + f * 540 - 10, x + f * 540 + 10, cy, Z0 + 150 + dr, dr + 10, 24); a.cyl(x + 80, cy, Z0 + 150 + 2 * dr - 10, Z0 + 150 + 2 * dr + 20, 30, 10); a.cyl(x + 20, cy - 100, Z0 + 150 + 2 * dr - 10, Z0 + 150 + 2 * dr + 16, 20, 8); }
    a.outline(); for (const q of [-1, 1]) a.rect(cx + q * W * 0.24 - 270, cy - dr, cx + q * W * 0.24 + 270, cy + dr, 'EQUIP-DETAIL');
  }
  a.log('Added the ' + { pallet: 'spill pallet with a grating, an upright 55 gallon drum with rolling hoops and bung caps, a hand pump with a delivery hose and nozzle', cradle: 'steel base with two shaped cradles, a 55 gallon drum with rolling hoops and bung caps, a pump stand with a handle and a transfer hose with a nozzle', rack: 'steel two-level rack with posts and rails, two 55 gallon drums lying on it with rolling hoops and bung caps' }[k] + ' (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ round 7 components
/** a helix of tube around a vertical axis */
function helix(a, cx, cy, z0, z1, R, turns, r, seg = 6, steps = 10) {
  const pts = [], n = m.round(turns * steps);
  for (let k = 0; k <= n; k++) { const t = k / n, an = t * turns * TAU; pts.push([cx + R * m.cos(an), cy + R * m.sin(an), z0 + (z1 - z0) * t]); }
  a.tube(pts, pts.map(() => r), seg);
}
/** a bolt circle of small studs on a disc (axis y) */
function studsY(a, x, y0, y1, z, R, n, r) { for (let k = 0; k < n; k++) { const t = (k / n) * TAU + 0.4; a.ycyl(y0, y1, x + m.cos(t) * R, z + m.sin(t) * R, r, 6); } }
/** a suspension strut: damper body and rod, coil spring with seats, bump stop, dust boot, top mount, lower knuckle bracket */
function strut(a, v) {
  const { X0, Z0, cx, cy, W, H } = a, zq = (f) => Z0 + H * f, R = W * 0.4;
  a.box(cx - W * 0.4, cy - W * 0.3, Z0, cx + W * 0.4, cy + W * 0.3, Z0 + 16);                       // foot
  a.box(cx - W * 0.12, cy - W * 0.3, Z0 + 16, cx + W * 0.12, cy + W * 0.3, zq(0.2));                // knuckle ears
  a.ycyl(cy - W * 0.36, cy + W * 0.36, cx, zq(0.06), 11, 8); a.ycyl(cy - W * 0.36, cy + W * 0.36, cx, zq(0.14), 11, 8);
  a.cyl(cx, cy, zq(0.12), zq(0.64), W * 0.17, 16);                                                       // damper body
  a.cyl(cx, cy, zq(0.2), zq(0.28), W * 0.21, 16);                                                        // clamp collar
  a.cyl(cx, cy, zq(0.25), zq(0.265), R + 8, 20);                                                         // lower spring seat
  a.cyl(cx, cy, zq(0.64), zq(0.9), W * 0.05, 8);                                                         // rod
  a.cyl(cx, cy, zq(0.66), zq(0.82), W * 0.13, 14);                                                       // dust boot
  for (let k = 0; k < 6; k++) a.cyl(cx, cy, zq(0.66 + k * 0.026), zq(0.672 + k * 0.026), W * 0.15, 14);
  a.cyl(cx, cy, zq(0.82), zq(0.86), W * 0.1, 12);                                                        // bump stop
  helix(a, cx, cy, zq(0.27), zq(0.86), R, v.turns, W * 0.035, 6, 9);
  a.cyl(cx, cy, zq(0.86), zq(0.875), R + 8, 20);                                                         // upper seat
  a.cyl(cx, cy, zq(0.875), zq(0.93), W * 0.28, 18); a.cyl(cx, cy, zq(0.93), H + Z0 - 4, W * 0.17, 14);   // top mount
  for (let k = 0; k < 3; k++) { const t = (k / 3) * TAU + 0.5; a.cyl(cx + m.cos(t) * W * 0.22, cy + m.sin(t) * W * 0.22, zq(0.93), zq(0.99), 6, 6); }
  a.outline(); a.circ(cx, cy, R + 8, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.17, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.28, 'EQUIP-DETAIL'); a.rect(cx - W * 0.4, cy - W * 0.3, cx + W * 0.4, cy + W * 0.3, 'EQUIP-HIDDEN');
  a.log('Added the foot and knuckle ears with clamp bolts, damper body and rod, dust boot, bump stop, coil spring on its two seats and the top mount with studs (plan and 3D).');
}

/** a leaf spring pack: nested arched leaves with eyes, centre bolt, clips and a U-bolt plate */
function leafspring(a, v) {
  const { cx, cy, Z0, W, D, H } = a, n = v.n, wx = W * 0.82, thk = v.t, eyeR = 26, Lm = D - 2 * eyeR - 8, c = H - eyeR - thk - 44;
  const zAt = (y, i) => Z0 + eyeR + c * (1 - ((2 * (y - cy)) / Lm) ** 2) - i * (thk + 2);
  for (let i = 0; i < n; i++) {
    const L = i === 0 ? Lm : Lm * (1 - (0.78 * i) / n), seg = 12;
    for (let j = 0; j < seg; j++) { const y0 = cy - L / 2 + (L * j) / seg, y1 = cy - L / 2 + (L * (j + 1)) / seg; prismX(a, [[y0, zAt(y0, i)], [y1, zAt(y1, i)], [y1, zAt(y1, i) + thk], [y0, zAt(y0, i) + thk]], cx - wx / 2, cx + wx / 2); }
  }
  for (const s of [-1, 1]) { const y = cy + s * Lm / 2, z = zAt(y, 0); a.xcyl(cx - wx / 2, cx + wx / 2, y + s * 4, Z0 + eyeR, eyeR, 14); a.xcyl(cx - wx / 2 - 6, cx + wx / 2 + 6, y + s * 4, Z0 + eyeR, eyeR * 0.55, 10); }
  const top = zAt(cy, 0) + thk;
  a.box(cx - wx * 0.55, cy - 70, top, cx + wx * 0.55, cy + 70, top + 14);
  a.cyl(cx, cy, zAt(cy, n - 1) - 14, top + 30, 8, 8); a.cyl(cx, cy, top + 14, top + 28, 14, 8);
  for (const s of [-1, 1]) for (const q of [-1, 1]) a.tube([[cx + s * wx * 0.4, cy + q * 55, top + 10], [cx + s * wx * 0.4, cy + q * 55, zAt(cy, n - 1) - 20]], [7, 7], 6);
  for (const f of n > 3 ? [0.3, 0.7] : [0.35]) for (const s of [-1, 1]) { const y = cy + s * Lm * (0.5 - f) * -1 * -1; a.box(cx - wx / 2 - 3, y - 8, zAt(y, n - 1) - 5, cx + wx / 2 + 3, y + 8, zAt(y, 0) + thk + 5); }
  for (const s of [-1, 1]) a.box(cx - 100, cy + s * (Lm / 2 - 30) - 16, Z0, cx + 100, cy + s * (Lm / 2 - 30) + 16, Z0 + 12);
  a.outline(); a.rect(cx - wx / 2, cy - Lm / 2, cx + wx / 2, cy + Lm / 2, 'EQUIP-DETAIL'); a.rect(cx - wx * 0.55, cy - 70, cx + wx * 0.55, cy + 70, 'EQUIP-DETAIL');
  a.log('Added ' + n + ' arched leaves of graded length with rolled eyes and bushes, a centre bolt, rebound clips, a U-bolt plate and ties, and two rest blocks (plan and 3D).');
}

/** a 12 V lead-acid battery: case with hold-down ledge, cell caps, two terminal posts with clamps, handle ridge */
function battery(a, v) {
  const { X0, X1, YF, YB, Z0, cx, cy, W, D, H } = a, zq = (f) => Z0 + H * f;
  a.box(X0, YF, Z0, X1, YB, zq(0.1));                                                    // hold-down ledge
  a.box(X0 + 8, YF + 14, zq(0.1), X1 - 8, YB - 14, zq(0.86));                          // case
  a.box(X0 + 4, YF + 8, zq(0.86), X1 - 4, YB - 8, zq(0.92));                           // lid
  for (let k = 1; k < 8; k++) a.box(X0 + 6 + ((W - 12) * k) / 8 - 2, YF + 8, zq(0.12), X0 + 6 + ((W - 12) * k) / 8 + 2, YF + 14, zq(0.82));   // case ribs
  for (let k = 0; k < 6; k++) { const x = X0 + W * (0.12 + k * 0.152); a.cyl(x, cy + D * 0.1, zq(0.92), zq(0.965), D * 0.06, 10); a.cyl(x, cy + D * 0.1, zq(0.965), zq(0.975), D * 0.075, 10); a.circ(x, cy + D * 0.1, D * 0.06, 'EQUIP-DETAIL'); }
  a.box(X0 + W * 0.3, YF + D * 0.22, zq(0.92), X1 - W * 0.3, YF + D * 0.45, zq(0.94));                 // label panel
  for (const [s, rr] of [[-1, D * 0.095], [1, D * 0.082]]) { const x = cx + s * (W / 2 - D * 0.2), y = YF + D * 0.25; a.cone(x, y, zq(0.92), zq(0.99), rr, rr * 0.78, 12); a.box(x - rr * 1.3, y - rr * 0.5, zq(0.92), x + rr * 1.3, y + rr * 0.5, zq(0.95)); a.circ(x, y, rr, 'EQUIP-DETAIL'); }
  if (v.handle) { a.tube([[X0 + W * 0.12, cy + D * 0.28, zq(0.9)], [X0 + W * 0.12, cy + D * 0.28, zq(0.94)], [X1 - W * 0.12, cy + D * 0.28, zq(0.94)], [X1 - W * 0.12, cy + D * 0.28, zq(0.9)]].map((p) => p), [11, 11, 11, 11], 6); }
  a.outline(); a.rect(X0 + 8, YF + 14, X1 - 8, YB - 14, 'EQUIP-DETAIL');
  a.log('Added the case with hold-down ledge and ribs, lid, six cell caps, a label panel, positive and negative terminal posts with clamps' + (v.handle ? ' and a swing carry handle' : '') + ' (plan and 3D).');
}

/** a fuel tank: lofted saddle tank, filler neck and hose, pump flange, vent tubes, two straps and mounting tabs */
function fueltank(a, v) {
  const { X0, X1, YF, YB, Z0, cx, cy, W, D, H } = a, zq = (f) => Z0 + H * f;
  const st = [0.02, 0.08, 0.25, 0.5, 0.75, 0.92, 0.98].map((f, i) => ({ y: YF + D * f, x: cx, rx: W * [0.3, 0.44, 0.49, 0.5, 0.49, 0.44, 0.3][i] * 0.97, z0: zq(0.16 + (i === 0 || i === 6 ? 0.06 : 0)), z1: zq(0.8 - (i === 0 || i === 6 ? 0.08 : 0)) }));
  sup(a, st, { seg: 18, n: 3 });
  for (const s of [-1, 1]) a.ell(cx + s * W * 0.26, cy, zq(0.84), W * 0.17, D * 0.34, H * 0.12, 14, 6);          // saddle humps
  a.box(cx - W * 0.2, cy - D * 0.4, zq(0.12), cx + W * 0.2, cy + D * 0.4, zq(0.18));                           // under-tunnel shield
  for (const s of [-1, 1]) { a.box(cx + s * W * 0.34 - 90, YF + D * 0.12, Z0, cx + s * W * 0.34 + 90, YF + D * 0.18, zq(0.18)); a.box(cx + s * W * 0.34 - 90, YB - D * 0.18, Z0, cx + s * W * 0.34 + 90, YB - D * 0.12, zq(0.18)); }
  for (const f of [0.3, 0.7]) for (const s of [-1, 1]) a.tube([[cx + s * W * 0.2, YF + D * f, zq(0.18)], [cx + s * W * 0.2, YF + D * f, zq(0.18) - 3], [cx + s * W * 0.2, YF + D * f, zq(0.9)]], [6, 6, 6], 5);
  for (const f of [0.3, 0.7]) a.tube([[cx - W * 0.46, YF + D * f, zq(0.7)], [cx - W * 0.46, YF + D * f, zq(0.18)], [cx + W * 0.46, YF + D * f, zq(0.18)], [cx + W * 0.46, YF + D * f, zq(0.7)]], [14, 14, 14, 14], 6);   // straps under the tank
  a.cyl(cx - W * 0.1, cy, zq(0.9), zq(0.97), W * 0.07, 14); a.cyl(cx - W * 0.1, cy, zq(0.97), zq(0.99), W * 0.085, 14);
  a.tube([[cx + W * 0.34, YB - D * 0.18, zq(0.8)], [cx + W * 0.4, YB - D * 0.1, zq(0.9)], [cx + W * 0.46, YB - 30, zq(0.95)], [cx + W * 0.47, YB - 30, zq(0.99)]], [34, 34, 30, 40], 10);
  a.tube([[cx + W * 0.2, YF + D * 0.8, zq(0.9)], [cx + W * 0.1, YF + D * 0.7, zq(0.99)]], [8, 8], 5); a.tube([[cx + W * 0.1, YF + D * 0.3, zq(0.9)], [cx + W * 0.0, YF + D * 0.2, zq(0.99)]], [8, 8], 5);
  a.outline(); a.circ(cx - W * 0.1, cy, W * 0.07, 'EQUIP-DETAIL'); a.rect(cx - W * 0.5, YF + D * 0.28, cx + W * 0.5, YF + D * 0.32, 'EQUIP-HIDDEN'); a.rect(cx - W * 0.5, YF + D * 0.68, cx + W * 0.5, YF + D * 0.72, 'EQUIP-HIDDEN');
  a.log('Added the lofted saddle tank with raised humps, under shield, two mounting straps with feet, filler neck with hose, pump flange and vent tubes (plan and 3D).');
}

/** a steering wheel on a display column: rim, spokes, hub with horn pad and a base disc */
function steering(a, v) {
  const { X0, Z0, cx, cy, W, D, H } = a, R = (W - 10) / 2, zc = Z0 + H - R - 6, rr = v.rim;
  ring3(a, cx, cy, zc, R - rr, rr, 28, 'y');
  a.ycyl(cy - 40, cy + 40, cx, zc, R * 0.2, 16); a.ycyl(cy - 60, cy - 40, cx, zc, R * 0.28, 16);
  for (let k = 0; k < v.spokes; k++) { const t = (v.spokes === 3 ? -m.PI / 2 : m.PI / 4) + (k / v.spokes) * TAU - (v.spokes === 3 ? 0 : 0); a.tube([[cx + m.cos(t) * R * 0.2, cy, zc + m.sin(t) * R * 0.2], [cx + m.cos(t) * (R - rr), cy + 10, zc + m.sin(t) * (R - rr)]], [R * 0.07, R * 0.045], 6); }
  a.ycyl(cy + 40, cy + 70, cx, zc, R * 0.12, 10); a.tube([[cx, cy + 55, zc], [cx, cy + 55, Z0 + 60]], [R * 0.1, R * 0.1], 8);
  a.cyl(cx, cy + 55, Z0, Z0 + 20, D * 0.3, 24); a.cyl(cx, cy + 55, Z0 + 20, Z0 + 60, R * 0.12, 12);
  a.rect(cx - R, cy - 40, cx + R, cy + 40, 'EQUIP'); a.circ(cx, cy + 55, D * 0.3, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
  a.log('Added the rim with grip section, ' + v.spokes + ' spokes, hub with horn pad, a short column and a round base disc (plan and 3D).');
}

/** a turbocharger: compressor scroll with inlet and outlet, bearing housing, turbine scroll with flange, wastegate can, oil and coolant lines, base plate */
function turbo(a, v) {
  const { X0, X1, YF, YB, Z0, cx, cy, W, D, H } = a, zq = (f) => Z0 + H * f, zc = zq(0.5);
  a.box(cx + W * 0.1, YF + D * 0.1, Z0, cx + W * 0.46, YB - D * 0.1, zq(0.06));
  a.box(cx + W * 0.16, YF + D * 0.2, zq(0.06), cx + W * 0.4, YB - D * 0.2, zq(0.3)); for (const q of [-1, 1]) for (const s of [-1, 1]) a.cyl(cx + W * 0.28 + s * W * 0.07, cy + q * D * 0.3, zq(0.06), zq(0.12), 9, 6);
  a.xcyl(cx - W * 0.1, cx + W * 0.14, cy, zc, H * 0.15, 16); a.xcyl(cx - W * 0.1, cx - W * 0.06, cy, zc, H * 0.2, 16); a.xcyl(cx + W * 0.1, cx + W * 0.14, cy, zc, H * 0.2, 16);
  a.ell(cx - W * 0.26, cy, zc, W * 0.16, D * 0.35, H * 0.35, 18, 10); a.xcyl(cx - W * 0.5, cx - W * 0.3, cy, zc, H * 0.2, 16); a.xcyl(cx - W * 0.5, cx - W * 0.47, cy, zc, H * 0.24, 16);
  a.tube([[cx - W * 0.28, cy + D * 0.3, zc + H * 0.12], [cx - W * 0.28, cy + D * 0.45, zc + H * 0.25], [cx - W * 0.28, YB - 20, zc + H * 0.28]], [H * 0.12, H * 0.11, H * 0.11], 12);
  a.ell(cx + W * 0.3, cy, zc, W * 0.16, D * 0.33, H * 0.33, 18, 10); a.xcyl(cx + W * 0.28, cx + W * 0.5, cy, zc + H * 0.02, H * 0.17, 16); a.xcyl(cx + W * 0.5 - 4, cx + W * 0.5, cy, zc + H * 0.02, H * 0.21, 16);
  a.ycyl(cy + D * 0.1, cy + D * 0.3, cx + W * 0.26, zq(0.86), H * 0.1, 12); a.ycyl(cy + D * 0.3, cy + D * 0.36, cx + W * 0.26, zq(0.86), H * 0.12, 12); a.tube([[cx + W * 0.26, cy + D * 0.1, zq(0.86)], [cx + W * 0.3, cy, zc + H * 0.2]], [5, 5], 5);
  a.tube([[cx + W * 0.02, cy, zc + H * 0.15], [cx + W * 0.02, cy - D * 0.1, zq(0.78)], [cx - W * 0.02, cy - D * 0.25, zq(0.9)]], [9, 9, 9], 6);
  a.tube([[cx + W * 0.04, cy, zc - H * 0.15], [cx + W * 0.04, cy + D * 0.06, zq(0.3)]], [12, 12], 6);
  for (const s of [-1, 1]) a.cyl(cx + W * 0.02 + s * W * 0.05, cy - D * 0.12, zc + H * 0.1, zc + H * 0.2, 7, 6);
  a.outline(); a.circ(cx - W * 0.26, cy, D * 0.3, 'EQUIP-DETAIL'); a.circ(cx + W * 0.3, cy, D * 0.28, 'EQUIP-DETAIL'); a.rect(cx + W * 0.1, YF + D * 0.1, cx + W * 0.46, YB - D * 0.1, 'EQUIP-HIDDEN');
  a.log('Added the compressor scroll with inlet and outlet pipe, bearing housing with oil feed and drain, turbine scroll with exhaust outlet and inlet flange on a base plate, wastegate can with rod and coolant fittings (plan and 3D).');
}

/** a propeller shaft lying on two V-block cradles: tube, universal joints with yokes, flanges, optional centre support and slip yoke */
function driveshaft(a, v) {
  const { X0, YF, YB, Z0, cx, cy, W, D, H } = a, rr = v.r, zc = Z0 + H - rr * 2.5 - 4, Y = (f) => YF + 30 + (D - 60) * f;
  for (const f of [0.22, 0.78]) { const y = YF + D * f; prismY(a, [[cx - W * 0.4, Z0], [cx + W * 0.4, Z0], [cx + W * 0.4, zc - rr * 1.5], [cx + rr * 1.6, zc - rr * 0.9], [cx - rr * 1.6, zc - rr * 0.9], [cx - W * 0.4, zc - rr * 1.5]], y - 60, y + 60); a.rect(cx - W * 0.4, y - 60, cx + W * 0.4, y + 60, 'EQUIP-HIDDEN'); }
  const joints = v.joints, ju = (y) => { a.xcyl(cx - rr * 1.1, cx + rr * 1.1, y, zc, rr * 0.28, 8); a.cyl(cx, y, zc - rr * 1.1, zc + rr * 1.1, rr * 0.28, 8); a.box(cx - rr * 1.5, y - rr * 0.6, zc - rr * 0.25, cx - rr * 0.95, y + rr * 0.6, zc + rr * 0.25); a.box(cx + rr * 0.95, y - rr * 0.6, zc - rr * 0.25, cx + rr * 1.5, y + rr * 0.6, zc + rr * 0.25); };
  const segs = v.split ? [[0.05, 0.47], [0.53, 0.95]] : [[0.05, 0.95]];
  for (const [f0, f1] of segs) { a.ycyl(Y(f0), Y(f1), cx, zc, rr, 18); a.ycyl(Y(f0), Y(f0) + 14, cx, zc, rr * 1.1, 18); }
  ju(Y(0.04)); ju(Y(0.96)); if (v.split) { ju(Y(0.47)); ju(Y(0.53)); }
  for (const [f, s] of [[0.0, 1], [1.0, -1]]) { const y = Y(f) + s * 14; a.ycyl(y - 10, y + 10, cx, zc, rr * 2.1, 22); studsY(a, cx, y - 16, y + 16, zc, rr * 1.55, 4, rr * 0.2); a.ycyl(y - 10, y - 8, cx, zc, rr * 0.7, 10); }
  a.ycyl(Y(0.62), Y(0.8), cx, zc, rr * 1.25, 16); for (let k = 0; k < 5; k++) a.ycyl(Y(0.63 + k * 0.03), Y(0.635 + k * 0.03), cx, zc, rr * 1.3, 16);
  if (v.centre) { const y = Y(0.5); ring3(a, cx, y, zc, rr * 1.6, rr * 0.55, 14, 'y'); a.box(cx - rr * 2.6, y - rr * 0.9, zc + rr * 1.6, cx + rr * 2.6, y + rr * 0.9, zc + rr * 2.2); a.cyl(cx - rr * 2, y, zc + rr * 2.2, zc + rr * 2.45, 8, 6); a.cyl(cx + rr * 2, y, zc + rr * 2.2, zc + rr * 2.45, 8, 6); }
  a.outline('EQUIP-HIDDEN'); a.rect(cx - rr, Y(0.05), cx + rr, Y(0.95)); a.rect(cx - rr * 2.1, YF, cx + rr * 2.1, YF + 40, 'EQUIP-DETAIL'); a.rect(cx - rr * 2.1, YB - 40, cx + rr * 2.1, YB, 'EQUIP-DETAIL');
  a.log('Added the propeller shaft tube' + (v.split ? 's with a middle joint and a rubber-mounted centre support' : '') + ', universal joints with cross and yokes, drive flanges with studs, a splined slip yoke with ribs, and two V-block cradles (plan and 3D).');
}

/** a live rear axle assembly: banjo housing with differential cover, pinion nose and yoke, brake drums or discs at the hubs, spring perches, on two axle stands */
function axle(a, v) {
  const { X0, X1, YF, YB, Z0, cx, cy, W, D, H } = a, R = H * 0.32, zc = Z0 + H * 0.5;
  for (const s of [-1, 1]) { a.box(cx + s * W * 0.2 - 100, cy - D * 0.2, Z0, cx + s * W * 0.2 + 100, cy + D * 0.2, zc - H * 0.1); a.box(cx + s * W * 0.2 - 130, cy - D * 0.24, Z0, cx + s * W * 0.2 + 130, cy + D * 0.24, Z0 + 14); }
  a.xcyl(X0 + W * 0.12, X1 - W * 0.12, cy, zc, H * 0.1, 16);
  a.ell(cx, cy - D * 0.02, zc, W * 0.1, D * 0.3, H * 0.25, 18, 12); a.ycyl(cy + D * 0.06, cy + D * 0.3, cx, zc, H * 0.2, 20);   // pumpkin and cover
  for (let k = 0; k < 10; k++) { const t = (k / 10) * TAU; a.ycyl(cy + D * 0.29, cy + D * 0.33, cx + m.cos(t) * H * 0.17, zc + m.sin(t) * H * 0.17, 7, 6); }
  a.ycyl(cy + D * 0.3, cy + D * 0.34, cx, zc, H * 0.1, 12);
  a.ycyl(YF + D * 0.04, cy - D * 0.22, cx, zc, H * 0.07, 12); a.ycyl(YF + D * 0.02, YF + D * 0.1, cx, zc, H * 0.12, 16); studsY(a, cx, YF + D * 0.0, YF + D * 0.04, zc, H * 0.09, 4, 7);
  for (const s of [-1, 1]) {
    const hx = cx + s * (W / 2 - 160);
    a.xcyl(hx - 70, hx + 70, cy, zc, R, 24); a.xcyl(hx - 60 + s * 70, hx + 60 + s * 70, cy, zc, R * 0.34, 14);
    if (v.dual) { a.xcyl(hx + s * 90, hx + s * 160, cy, zc, R * 0.92, 24); }
    if (v.disc) { a.xcyl(hx + s * 78, hx + s * 90, cy, zc, R * 1.02, 28); a.box(hx + s * 40 - 40, cy - R * 0.5, zc + R * 0.7, hx + s * 40 + 40, cy + R * 0.5, zc + R * 1.15); }
    for (let k = 0; k < 6; k++) { const t = (k / 6) * TAU; a.xcyl(hx + s * 78, hx + s * 118, cy + m.cos(t) * R * 0.5, zc + m.sin(t) * R * 0.5, 8, 6); }
    a.box(cx + s * W * 0.31 - 90, cy - 55, zc + H * 0.1, cx + s * W * 0.31 + 90, cy + 55, zc + H * 0.17); for (const q of [-1, 1]) a.cyl(cx + s * W * 0.31 + q * 60, cy, zc + H * 0.17, zc + H * 0.22, 8, 6);
    a.box(cx + s * W * 0.37 - 20, cy + D * 0.22, zc - H * 0.05, cx + s * W * 0.37 + 20, cy + D * 0.3, zc + H * 0.12);
    a.tube([[cx + s * W * 0.36, cy, zc + H * 0.1], [cx + s * W * 0.2, cy + D * 0.1, zc + H * 0.2], [cx + s * W * 0.02, cy + D * 0.2, zc + H * 0.22]], [6, 6, 6], 5);
  }
  a.outline('EQUIP-HIDDEN'); a.rect(X0 + W * 0.12, cy - 80, X1 - W * 0.12, cy + 80, 'EQUIP'); a.circ(cx, cy + D * 0.3, H * 0.2, 'EQUIP-DETAIL'); a.rect(cx - 50, YF, cx + 50, cy, 'EQUIP-DETAIL');
  for (const s of [-1, 1]) a.rect(cx + s * (W / 2 - 160) - 70, cy - R, cx + s * (W / 2 - 160) + 70, cy + R, 'EQUIP-DETAIL');
  a.log('Added the banjo housing with differential cover and bolts, pinion nose with yoke, ' + (v.disc ? 'disc rotors with calipers' : 'brake drums') + (v.dual ? ' and dual hub flanges' : '') + ' with studs at both hubs, spring perches with U-bolt studs, shock mounts, a brake line and two axle stands (plan and 3D).');
}

/** an electric drive unit: motor barrel(s), reduction gearbox, inverter box with fins, output flanges, coolant ports, mounting feet, on a transport skid */
function eudrive(a, v) {
  const { X0, X1, YF, YB, Z0, cx, cy, W, D, H } = a, zq = (f) => Z0 + H * f, zc = zq(0.5), R = H * 0.3;
  a.box(X0, YF, Z0, X1, YB, zq(0.08)); for (const s of [-1, 1]) a.box(cx + s * W * 0.34 - 40, YF, zq(0.08), cx + s * W * 0.34 + 40, YB, zq(0.14));
  const mc = v.dual ? [-0.3, 0.3] : [-0.22];
  for (const f of mc) { const x = cx + W * f; a.xcyl(x - W * 0.13, x + W * 0.13, cy, zc, R, 24); for (let k = 0; k < 7; k++) a.xcyl(x - W * 0.11 + k * W * 0.036, x - W * 0.11 + k * W * 0.036 + 6, cy, zc, R * 1.06, 24); a.xcyl(x + (f < 0 ? -W * 0.15 : W * 0.15), x + (f < 0 ? -W * 0.13 : W * 0.13), cy, zc, R * 0.9, 20); a.box(x - W * 0.12, cy - R * 0.4, zc + R * 0.96, x + W * 0.12, cy + R * 0.4, zc + R * 1.08); }
  const gx = v.dual ? cx : cx + W * 0.12; const gw = v.dual ? W * 0.2 : W * 0.2;
  a.ell(gx, cy, zc, gw, D * 0.36, H * 0.34, 18, 10); a.box(gx - gw * 0.7, cy - D * 0.3, zc - H * 0.28, gx + gw * 0.7, cy + D * 0.3, zc - H * 0.1);
  { const xr = X1 - 45; a.xcyl(xr - 40, xr + 30, cy, zc, H * 0.1, 14); a.xcyl(xr + 20, xr + 38, cy, zc, H * 0.15, 18); const xl = v.dual ? X0 + 45 : X0 + 30; a.xcyl(xl - 30, v.dual ? xl + 40 : cx - W * 0.36, cy, zc, v.dual ? H * 0.1 : H * 0.06, 14); a.xcyl(xl - 30, xl - 12, cy, zc, H * 0.15, 18); }
  a.box(cx - W * 0.2, cy - D * 0.3, zq(0.76), cx + W * 0.2, cy + D * 0.3, zq(0.94)); for (let k = 0; k < 9; k++) a.box(cx - W * 0.2 + 18 + k * (W * 0.4 - 36) / 8 - 3, cy - D * 0.3, zq(0.94), cx - W * 0.2 + 18 + k * (W * 0.4 - 36) / 8 + 3, cy + D * 0.3, zq(0.98));
  for (const [dx, dy] of [[-0.14, 0.34], [0.0, 0.34], [0.14, 0.34]]) a.cyl(cx + W * dx, cy + D * dy, zq(0.76), zq(0.82), 18, 8);
  a.tube([[cx + W * 0.05, cy - D * 0.3, zq(0.8)], [cx + W * 0.05, cy - D * 0.4, zq(0.62)], [cx - W * 0.1, cy - D * 0.4, zc + R * 0.9]], [14, 14, 14], 8); a.tube([[cx + W * 0.12, cy - D * 0.3, zq(0.8)], [cx + W * 0.12, cy - D * 0.45, zq(0.62)], [cx + W * 0.2, cy - D * 0.45, zq(0.3)]], [14, 14, 14], 8);
  for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 80, cy - D * 0.2, zq(0.08), cx + s * W * 0.4 + 80, cy + D * 0.2, zq(0.3));
  a.outline(); for (const f of mc) a.rect(cx + W * f - W * 0.13, cy - R, cx + W * f + W * 0.13, cy + R, 'EQUIP-DETAIL'); a.rect(cx - W * 0.2, cy - D * 0.3, cx + W * 0.2, cy + D * 0.3, 'EQUIP-DETAIL'); a.ellp(gx, cy, gw, D * 0.36, 'EQUIP-DETAIL');
  a.log('Added the transport skid, ' + (v.dual ? 'two finned motor barrels with end bells' : 'a finned motor barrel with end bell') + ', reduction gearbox with output flanges, a finned inverter box with cable glands, coolant lines and mounting feet (plan and 3D).');
}

/** an EV battery pack on a forklift cradle: case with flange, lid ribs, underside shield, connectors, coolant ports, lifting eyes */
function evpack(a, v) {
  const { X0, X1, YF, YB, Z0, cx, cy, W, D, H } = a, cz = Z0 + H * 0.42, pt = H * 0.5;
  for (const s of [-1, 1]) { a.box(cx + s * W * 0.34 - 100, YF + 20, Z0, cx + s * W * 0.34 + 100, YB - 20, Z0 + 70); a.box(cx + s * W * 0.34 - 60, YF + 20, Z0 + 70, cx + s * W * 0.34 + 60, YB - 20, cz - 12); }
  for (const f of [0.1, 0.5, 0.9]) a.box(X0 + 30, YF + D * f - 40, Z0 + 20, X1 - 30, YF + D * f + 40, Z0 + 60);
  a.box(X0, YF, cz, X1, YB, cz + 40); a.box(X0 + 30, YF + 30, cz + 40, X1 - 30, YB - 30, cz + pt * 0.94); a.box(X0 + 10, YF + 10, cz + pt * 0.94, X1 - 10, YB - 10, cz + pt);
  for (let k = 1; k < 6; k++) a.box(X0 + (W * k) / 6 - 6, YF + 50, cz + pt, X0 + (W * k) / 6 + 6, YB - 50, cz + pt + 14);
  for (let k = 1; k < 3; k++) a.box(X0 + 50, YF + (D * k) / 3 - 6, cz + pt, X1 - 50, YF + (D * k) / 3 + 6, cz + pt + 14);
  for (let k = 0; k < 14; k++) { const x = X0 + 60 + ((W - 120) * k) / 13; a.cyl(x, YF + 14, cz + 6, cz + 30, 12, 6); a.cyl(x, YB - 14, cz + 6, cz + 30, 12, 6); }
  a.box(cx - W * 0.07, YF - 0, cz + 70, cx + W * 0.07, YF + 80, cz + 70 + pt * 0.5); a.box(cx - W * 0.1, YF + 6, cz + 80, cx - W * 0.075, YF + 20, cz + 130); a.ycyl(YF, YF + 70, cx - W * 0.02, cz + 70 + pt * 0.25, 30, 12); a.ycyl(YF, YF + 70, cx + W * 0.03, cz + 70 + pt * 0.25, 30, 12);
  for (const s of [-1, 1]) { a.ycyl(YB - 10, YB, cx + s * W * 0.18, cz + 80, 18, 10); a.tube([[cx + s * W * 0.18, YB - 10, cz + 80], [cx + s * W * 0.18, YB, cz + 80]], [18, 18], 8); }
  for (const [x, y] of [[X0 + 45, YF + 45], [X1 - 45, YF + 45], [X0 + 45, YB - 45], [X1 - 45, YB - 45]]) { ring3(a, x, y, cz + pt + 14, 22, 6, 10, 'y'); a.cyl(x, y, cz + pt, cz + pt + 14, 12, 6); }
  a.box(X0 + W * 0.6, YB - D * 0.3, cz + pt, X0 + W * 0.7, YB - D * 0.1, cz + pt + 26);
  a.outline(); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.rect(cx + s * W * 0.34 - 100, YF + 20, cx + s * W * 0.34 + 100, YB - 20, 'EQUIP-HIDDEN');
  a.log('Added the forklift cradle with skids and cross rails, the sealed case with bolted flange, ribbed lid, underside bolt rows, high-voltage and low-voltage connector block, coolant ports, four lifting eyes and a service disconnect cover (plan and 3D).');
}

/** a piston and connecting rod standing on the rod big end: crown, ring grooves, wrist pin, I-beam rod, split big end with cap bolts */
function pistonrod(a, v) {
  const { cx, cy, Z0, Z1, W, H } = a, b = v.bore, br = b / 2, rl = H - b * 1.41, zr = Z0 + b * 0.55;
  a.cyl(cx, cy, Z0, Z0 + b * 0.3, b * 0.38, 24); a.cyl(cx, cy, Z0 + b * 0.02, Z0 + b * 0.28, b * 0.41, 24);
  for (const s of [-1, 1]) { a.cyl(cx + s * b * 0.33, cy, Z0, Z0 + b * 0.36, b * 0.05, 8); a.cyl(cx + s * b * 0.33, cy, Z0 + b * 0.36, Z0 + b * 0.4, b * 0.07, 8); }
  a.box(cx - b * 0.14, cy - b * 0.12, Z0 + b * 0.3, cx + b * 0.14, cy + b * 0.12, Z0 + b * 0.55);
  a.box(cx - b * 0.1, cy - b * 0.1, zr, cx + b * 0.1, cy + b * 0.1, zr + rl); a.box(cx - b * 0.14, cy - b * 0.1, zr, cx + b * 0.14, cy + b * 0.1, zr + rl); a.box(cx - b * 0.05, cy - b * 0.1, zr, cx + b * 0.05, cy + b * 0.1, zr + rl);
  a.box(cx - b * 0.14, cy - b * 0.04, zr, cx - b * 0.1, cy + b * 0.04, zr + rl); a.box(cx + b * 0.1, cy - b * 0.04, zr, cx + b * 0.14, cy + b * 0.04, zr + rl);
  const zs = zr + rl; a.ycyl(cy - b * 0.13, cy + b * 0.13, cx, zs, b * 0.12, 14);
  const zp = zs + b * 0.08;
  a.cyl(cx, cy, zp - b * 0.1, zp + b * 0.7, br, 28);
  for (let k = 0; k < 3; k++) a.cyl(cx, cy, zp + b * (0.5 - k * 0.07), zp + b * (0.53 - k * 0.07), br * 1.02, 28);
  a.cyl(cx, cy, zp + b * 0.7, zp + b * 0.72, br * 0.96, 28);
  if (v.bowl) { ring3(a, cx, cy, zp + b * 0.72, br * 0.45, b * 0.03, 16, 'z'); a.cyl(cx, cy, zp + b * 0.72, zp + b * 0.74, br * 0.35, 20); }
  a.ycyl(cy - br * 0.95, cy + br * 0.95, cx, zs, b * 0.1, 12);
  for (const s of [-1, 1]) a.box(cx + s * b * 0.18 - b * 0.06, cy - br * 0.7, zp - b * 0.1, cx + s * b * 0.18 + b * 0.06, cy + br * 0.7, zs + b * 0.02);
  a.outline('EQUIP-HIDDEN'); a.circ(cx, cy, br, 'EQUIP'); a.circ(cx, cy, b * 0.4, 'EQUIP-DETAIL'); a.circ(cx, cy, b * 0.1, 'EQUIP-DETAIL'); a.rect(cx - b * 0.14, cy - b * 0.1, cx + b * 0.14, cy + b * 0.1, 'EQUIP-DETAIL');
  a.log('Added the piston with three ring grooves' + (v.bowl ? ' and a combustion bowl in the crown' : '') + ', wrist pin and bosses, the I-beam connecting rod and the split big end with cap and two bolts (plan and 3D).');
}

/** a crankshaft lying on two V-blocks: main journals, throws with webs and counterweights, flange with bolt circle, snout with keyway */
function crank(a, v) {
  const { X0, YF, YB, Z0, cx, cy, W, D, H } = a, jr = v.jr, st = v.stroke, ch = 70, rmax = W / 2 - 4, zc = Z0 + ch + rmax, n = v.n;
  const ang = n === 3 ? [90, 210, 330] : n === 4 ? [0, 180, 180, 0] : [0, 120, 240, 240, 120, 0];
  const y0b = YF + D * 0.06, y1b = YB - D * 0.1, pb = (y1b - y0b) / (n + 0.6);
  for (const y of [y0b + 0.23 * pb, y1b - 0.26 * pb]) { prismY(a, [[cx - W * 0.44, Z0], [cx + W * 0.44, Z0], [cx + W * 0.44, Z0 + ch * 0.6], [cx + jr * 1.6, zc - jr * 1.1], [cx - jr * 1.6, zc - jr * 1.1], [cx - W * 0.44, Z0 + ch * 0.6]], y - 20, y + 20); a.rect(cx - W * 0.44, y - 20, cx + W * 0.44, y + 20, 'EQUIP-HIDDEN'); }
  const y0 = YF + D * 0.06, y1 = YB - D * 0.1, pitch = (y1 - y0) / (n + 0.6);
  a.ycyl(YF + 20, y0 + 30, cx, zc, jr * 0.8, 14); a.ycyl(YF + 20, YF + 80, cx, zc, jr * 1.05, 16); a.box(cx - jr * 0.15, YF + 28, zc + jr * 0.75, cx + jr * 0.15, YF + 90, zc + jr * 1.0);
  a.ycyl(y0, y1, cx, zc, jr, 18);
  const web = (y, pa, wt) => { const t = (pa * m.PI) / 180, px = cx + m.cos(t) * st / 2, pz = zc + m.sin(t) * st / 2; a.tube([[cx, y, zc], [px, y, pz]], [jr * 1.45, jr * 1.1], 12); a.ell(cx - m.cos(t) * st * 0.38, y, zc - m.sin(t) * st * 0.38, jr * 1.3, wt, jr * 1.3, 10, 6); };
  for (let i = 0; i < n; i++) { const yc = y0 + pitch * (i + 0.8), wt = jr * 0.45, t = (ang[i] * m.PI) / 180, px = cx + m.cos(t) * st / 2, pz = zc + m.sin(t) * st / 2; web(yc - pitch * 0.28, ang[i], wt); web(yc + pitch * 0.28, ang[i], wt); a.ycyl(yc - pitch * 0.3, yc + pitch * 0.3, px, pz, jr * 0.8, 14); a.ycyl(yc - pitch * 0.5, yc - pitch * 0.28, cx, zc, jr * 1.12, 14); }
  a.ycyl(y1, YB - 20, cx, zc, jr * 1.5, 24); studsY(a, cx, YB - 40, YB - 14, zc, jr * 1.1, 6, jr * 0.14); a.ycyl(YB - 20, YB - 12, cx, zc, jr * 0.6, 10);
  a.outline('EQUIP-HIDDEN'); a.rect(cx - jr, y0, cx + jr, y1, 'EQUIP'); for (let i = 0; i < n; i++) { const yc = y0 + pitch * (i + 0.8); a.rect(cx - st / 2 - jr * 0.8, yc - pitch * 0.3, cx + st / 2 + jr * 0.8, yc + pitch * 0.3, 'EQUIP-DETAIL'); } a.circ(cx, YB - 30, jr * 1.5, 'EQUIP-DETAIL');
  a.log('Added the main journals, ' + n + ' throws with webs, crank pins and counterweights, the rear flange with a bolt circle, the front snout with a keyway and two V-block cradles (plan and 3D).');
}

/** a motorcycle engine: crankcase with covers, finned cylinders and heads, rocker covers, header and intake stubs, sprocket, clutch cover, oil filter */
function motoengine(a, v) {
  const { X0, X1, YF, YB, Z0, cx, cy, W, D, H } = a, zq = (f) => Z0 + H * f, n = v.cyl, bore = v.bore, rb = bore / 2 + 8;
  const px = (i) => cx + (n === 1 ? 0 : -((n - 1) / 2) * v.pitch + i * v.pitch) + (v.shift || 0);
  a.box(X0, YF + D * 0.1, Z0, X1, YB - D * 0.05, zq(0.05));
  prismY(a, [[X0 + 14, zq(0.05)], [X1 - 14, zq(0.05)], [X1 - 8, zq(0.34)], [X0 + 8, zq(0.34)]], YF + D * 0.08, YB - D * 0.06);
  prismY(a, [[X0 + W * 0.04, zq(0.34)], [X1 - W * 0.04, zq(0.34)], [X1 - W * 0.1, zq(0.46)], [X0 + W * 0.1, zq(0.46)]], YF + D * 0.2, YB - D * 0.18);
  a.xcyl(X1 - 4, X1 + 0, cy, zq(0.22), H * 0.2, 24); a.xcyl(X1 - 30, X1 - 4, cy, zq(0.22), H * 0.19, 24); a.xcyl(X1 - 38, X1 - 30, cy, zq(0.22), H * 0.13, 20);
  for (let k = 0; k < 6; k++) { const t = (k / 6) * TAU; a.xcyl(X1 - 14, X1 - 4, cy + m.cos(t) * H * 0.15, zq(0.22) + m.sin(t) * H * 0.15, 7, 6); }
  a.xcyl(X0 + 4, X0 + 40, cy, zq(0.2), H * 0.14, 20); a.xcyl(X0 - 0, X0 + 4, cy, zq(0.2), H * 0.17, 20);
  a.xcyl(X0 + 40, X0 + 90, cy - D * 0.28, zq(0.17), H * 0.07, 14); a.cyl(cx - W * 0.1, cy - D * 0.3, zq(0.05), zq(0.2), H * 0.09, 14);
  for (let i = 0; i < n; i++) {
    const x = px(i), yc = cy + (v.fwd || 0);
    a.cyl(x, yc, zq(0.46), zq(0.74), bore / 2 + 4, 20);
    for (let k = 0; k < 8; k++) a.cyl(x, yc, zq(0.48 + k * 0.032), zq(0.48 + k * 0.032) + 5, rb + (v.fin ?? 12), 20);
    a.box(x - rb - 8, yc - rb - 6, zq(0.74), x + rb + 8, yc + rb + 6, zq(0.86)); a.box(x - rb * 0.85, yc - rb * 0.8, zq(0.86), x + rb * 0.85, yc + rb * 0.8, zq(0.94)); a.cyl(x - rb * 0.6, yc, zq(0.94), zq(0.945) + 4, 6, 6);
    a.box(x - rb * 0.9, yc - rb * 0.75, zq(0.94), x + rb * 0.9, yc + rb * 0.75, zq(0.96));
    a.cyl(x + rb * 0.4, yc + rb * 0.9, zq(0.78), zq(0.9), 7, 6); a.cyl(x + rb * 0.4, yc + rb * 0.9, zq(0.9), zq(0.93), 9, 6);
    a.tube([[x, yc - rb * 0.7, zq(0.78)], [x, yc - rb * 1.4, zq(0.72)], [x, yc - rb * 1.4, zq(0.55)]], [26, 26, 26], 8);
    a.tube([[x, yc + rb * 0.7, zq(0.8)], [x, yc + rb * 1.3, zq(0.84)]], [30, 30], 8); a.box(x - 28, yc + rb * 1.3, zq(0.76), x + 28, yc + rb * 1.3 + 60, zq(0.9));
    a.circ(x, yc, bore / 2 + 4, 'EQUIP-DETAIL'); a.rect(x - rb - 8, yc - rb - 6, x + rb + 8, yc + rb + 6, 'EQUIP-DETAIL');
  }
  a.tube([[px(0), cy + (v.fwd || 0) - rb * 1.4, zq(0.55)], [px(n - 1), cy + (v.fwd || 0) - rb * 1.4, zq(0.55)], [X1 - 10, cy + (v.fwd || 0) - rb * 1.6, zq(0.3)]], [30, 30, 36], 8);
  a.outline('EQUIP-HIDDEN'); a.rect(X0, YF + D * 0.08, X1, YB - D * 0.06, 'EQUIP'); a.circ(X1 - 4, cy, 2, 'EQUIP-DETAIL');
  a.log('Added the crankcase halves with a clutch cover and generator cover, ' + n + (n === 1 ? ' finned cylinder' : ' finned cylinders') + ' with heads, rocker covers and spark plugs, the exhaust header, intake stubs, drive sprocket and oil filter (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ round 7 vehicles
/** a cab-over truck cab at the front of the body box: lofted shell, windscreen, grille, bumper, lamps, mirrors, steps. o: hw, gz (ground z), cl (cab length), ch (cab top z), sleeper length sl */
function truckCab(a, o) {
  const { cx, YF } = a, { hw, gz, cl, ch } = o;
  sup(a, [{ y: YF + 20, x: cx, rx: hw * 0.9, z0: gz + 520, z1: ch - 380 }, { y: YF + 110, x: cx, rx: hw * 0.97, z0: gz + 440, z1: ch - 90 }, { y: YF + 330, x: cx, rx: hw, z0: gz + 440, z1: ch }, { y: YF + cl, x: cx, rx: hw, z0: gz + 440, z1: ch }], { seg: 16, n: 4 });
  a.frame(cx - hw * 0.84, gz + 800, cx + hw * 0.84, ch - 210, YF + 8, YF + 46, 36); a.box(cx - 18, YF + 8, gz + 800, cx + 18, YF + 46, ch - 210);
  a.box(cx - hw * 0.46, YF + 14, gz + 260, cx + hw * 0.46, YF + 54, gz + 700);
  for (let i = 1; i < 7; i++) a.box(cx - hw * 0.46, YF + 8, gz + 260 + i * 60, cx + hw * 0.46, YF + 18, gz + 270 + i * 60);
  a.box(cx - hw, YF - 10, gz + 40, cx + hw, YF + 90, gz + 260);
  for (const s of [-1, 1]) {
    a.ell(cx + s * hw * 0.76, YF + 54, gz + 500, 150, 38, 95, 8, 5); a.circ(cx + s * hw * 0.76, YF + 40, 60, 'EQUIP-DETAIL');
    a.box(cx + s * (hw + 24) - 18, YF + 230, ch - 1160, cx + s * (hw + 24) + 18, YF + 310, ch - 520);
    a.tube([[cx + s * hw, YF + 260, ch - 700], [cx + s * (hw + 24), YF + 270, ch - 700]], [10, 10], 4);
    for (const [k, zz] of [[0, 120], [1, 360]]) a.box(cx + s * (hw - 20) - (s > 0 ? 0 : 140), YF + 140 + k * 20, gz + zz, cx + s * (hw - 20) + (s > 0 ? 140 : 0), YF + 420 + k * 20, gz + zz + 26);
    a.line(cx + s * hw, YF + 520, cx + s * (hw - 60), YF + 520, 'EQUIP-DETAIL');
  }
  a.rect(cx - hw, YF, cx + hw, YF + cl, 'EQUIP'); a.line(cx - hw, YF + 330, cx + hw, YF + 330, 'EQUIP-DETAIL');
}
/** a tractor unit: truckCab, optional sleeper and roof deflector, frame rails, fifth wheel, tanks, stacks, axles. v: wb (rear axle offsets from the back), sleeper */
function tractor(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, hw = W / 2 - 70, gz = Z0, r = 520, tw = 300;
  const ch = Z0 + H - 200, cl = 1500;
  truckCab(a, { hw, gz, cl, ch });
  if (v.sleeper) { a.box(cx - hw, YF + cl, gz + 700, cx + hw, YF + cl + v.sleeper, ch - 160); a.rect(cx - hw, YF + cl, cx + hw, YF + cl + v.sleeper, 'EQUIP'); for (const s of [-1, 1]) { a.box(cx + s * (hw + 4) - 6, YF + cl + 160, ch - 900, cx + s * (hw + 4) + 6, YF + cl + v.sleeper - 160, ch - 560); a.box(cx + s * (hw + 4) - 10, YF + cl + 100, gz + 760, cx + s * (hw + 4) + 10, YF + cl + 480, gz + 1260); } }
  prismX(a, [[YF + cl * 0.35, ch], [YF + cl, ch], [YF + cl + (v.sleeper || 300), ch - 20], [YF + cl + (v.sleeper || 300), Z1 - 30], [YF + cl * 0.45, ch + 120]], cx - hw * 0.8, cx + hw * 0.8);
  const rear = v.rear.map((o) => YB - o);
  const yf = YF + 700;
  for (const s of [-1, 1]) a.box(cx + s * hw * 0.5 - 50, YF + cl - 200, gz + 560, cx + s * hw * 0.5 + 50, YB - 40, gz + 760);
  for (let i = 0; i < 4; i++) a.box(cx - hw * 0.5, YF + cl + 300 + i * 600, gz + 600, cx + hw * 0.5, YF + cl + 340 + i * 600, gz + 740);
  for (const s of [-1, 1]) { a.ycyl(YF + cl + 340, YF + cl + 1240, cx + s * (hw - 100), gz + 680, 215, 12); a.ycyl(YF + cl + 380, YF + cl + 1200, cx + s * (hw - 100), gz + 680, 170, 10); }
  const fy = rear[rear.length - 1] - 600 + 40;
  a.box(cx - hw * 0.62, rear[0] - 800, gz + 760, cx + hw * 0.62, rear[0] + 400, gz + 810);   // fifth-wheel base plate
  a.cyl(cx, rear[0] - 100, gz + 810, gz + 880, 330, 16); a.box(cx - 330, rear[0] - 100, gz + 810, cx + 330, rear[0] + 230, gz + 880);
  a.circ(cx, rear[0] - 100, 330, 'EQUIP-DETAIL'); a.line(cx - 330, rear[0] + 200, cx + 330, rear[0] + 200, 'EQUIP-DETAIL');
  for (const s of [-1, 1]) { a.cyl(cx + s * (hw * 0.55), YF + cl * 0.9 + (v.sleeper || 0), gz + 760, ch + 300 > Z1 - 20 ? Z1 - 80 : ch + 300, 55, 10); a.cyl(cx + s * (hw * 0.55), YF + cl * 0.9 + (v.sleeper || 0), Z1 - 80, Z1 - 70, 62, 10); }
  for (const s of [-1, 1]) a.xcyl(cx + s * hw * 0.25 - 150, cx + s * hw * 0.25 + 150, rear[0] - 900, gz + 820, 120, 10);
  for (const y of [yf, ...rear]) { for (const s of [-1, 1]) { whl(a, cx + s * (hw - tw * 0.45), y, r, tw); if (y !== yf) whl(a, cx + s * (hw - tw * 1.45), y, r, tw, { plain: true }); } a.xcyl(cx - hw + tw, cx + hw - tw, y, gz + r, 55, 8); }
  for (const s of [-1, 1]) for (const y of rear) a.box(cx + s * (hw - 10) - (s > 0 ? 0 : 20), y + 380, gz + 120, cx + s * (hw - 10) + (s > 0 ? 20 : 0), y + 420, gz + 700);
  a.box(cx - hw * 0.8, YB - 60, gz + 160, cx + hw * 0.8, YB, gz + 320);
  for (const s of [-1, 1]) a.box(cx + s * hw * 0.7 - 70, YB - 14, gz + 400, cx + s * hw * 0.7 + 70, YB, gz + 520);
  a.rect(cx - hw * 0.5, YF + cl, cx + hw * 0.5, YB - 40, 'EQUIP-HIDDEN');
  a.log('Added the cab-over cab' + (v.sleeper ? ' with a sleeper box' : '') + ', roof deflector, frame rails and cross-members, fuel tanks, fifth wheel with its base plate, exhaust stacks, air tanks, axles with dual wheels, mud flaps and lamps (plan and 3D).');
}

/** a semi-trailer: kingpin plate, landing legs, I-beam frame, axle group with dual wheels, and a box, curtain, flat or tank body. v.kind */
function artTrailer(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, hw = W / 2 - 60, k = v.kind, fz = Z0 + 1150, r = 520, tw = 290;
  for (const s of [-1, 1]) { a.box(cx + s * hw * 0.55 - 40, YF + 900, fz - 300, cx + s * hw * 0.55 + 40, YB - 120, fz - 150); a.box(cx + s * hw * 0.55 - 14, YF + 900, fz - 150, cx + s * hw * 0.55 + 14, YB - 120, fz - 80); }
  for (let i = 0; i < 9; i++) { const y = YF + 1300 + (i * (D - 1500)) / 8; a.box(cx - hw * 0.55, y - 20, fz - 220, cx + hw * 0.55, y + 20, fz - 100); }
  a.box(cx - hw * 0.6, YF + 80, fz - 130, cx + hw * 0.6, YF + 1500, fz - 60);   // upper coupler plate
  a.cyl(cx, YF + 520, fz - 130, fz - 270, 30, 8);   // kingpin
  prismY(a, [[cx - hw * 0.6, fz - 130], [cx + hw * 0.6, fz - 130], [cx + hw * 0.42, fz - 290], [cx - hw * 0.42, fz - 290]], YF + 700, YF + 1500);
  for (const s of [-1, 1]) { const x = cx + s * (hw * 0.62); a.box(x - 45, YF + 2000, Z0 + 330, x + 45, YF + 2100, fz - 170); a.box(x - 70, YF + 1980, Z0, x + 70, YF + 2120, Z0 + 40); a.box(x - 70, YF + 2050, Z0 + 40, x + 70, YF + 2070, Z0 + 330); a.xcyl(x + s * 60, x + s * 170, YF + 2000, fz - 460, 14, 6); a.xcyl(x + s * 150, x + s * 190, YF + 2000, fz - 460, 28, 6); a.line(x - 70, YF + 1980, x + 70, YF + 1980, 'EQUIP-DETAIL'); }
  const ax = v.axles, gy = YB - 700 - (ax - 1) * 0;
  for (let i = 0; i < ax; i++) { const y = YB - 780 - i * 1340; for (const s of [-1, 1]) { whl(a, cx + s * (hw - tw * 0.5), y, r, tw); whl(a, cx + s * (hw - tw * 1.45), y, r, tw, { plain: true }); } a.xcyl(cx - hw + tw, cx + hw - tw, y, Z0 + r, 60, 8); a.box(cx - hw * 0.5, y - 80, Z0 + r + 60, cx + hw * 0.5, y + 80, fz - 220); }
  for (const s of [-1, 1]) a.box(cx + s * hw * 0.98 - 25, YB - 780 - (ax - 1) * 1340 - 640, Z0 + 1060, cx + s * hw * 0.98 + 25, YB - 780 + 640, Z0 + 1110);   // wheel guard rail
  a.box(cx - hw * 0.9, YB - 60, Z0 + 520, cx + hw * 0.9, YB - 20, Z0 + 640);   // underride bar
  for (const s of [-1, 1]) a.box(cx + s * hw * 0.85 - 60, YB - 14, fz - 80, cx + s * hw * 0.85 + 60, YB, fz + 40);
  for (const s of [-1, 1]) a.box(cx + s * (hw * 0.96) - 8, YF + 1000, fz - 20, cx + s * (hw * 0.96) + 8, YB - 200, fz - 10);
  const by0 = YF + 40, by1 = YB;
  if (k === 'box') {
    a.box(cx - hw, by0, fz - 60, cx + hw, by1, Z1 - 120); a.box(cx - hw * 0.96, by0, Z1 - 120, cx + hw * 0.96, by1, Z1 - 40); a.box(cx - hw * 0.88, by0 + 100, Z1 - 40, cx + hw * 0.88, by1 - 100, Z1);
    for (let i = 1; i < 26; i++) { const y = by0 + ((by1 - by0) * i) / 26; for (const s of [-1, 1]) a.box(cx + s * hw - 7, y - 12, fz - 40, cx + s * hw + 7, y + 12, Z1 - 160); }
    for (const s of [-1, 1]) for (const z of [0.25, 0.7]) a.box(cx + s * hw * 0.55 - 40, by1 - 8, fz + (Z1 - fz) * z, cx + s * hw * 0.55 + 40, by1 + 0, fz + (Z1 - fz) * z + 200);
    for (const s of [-1, 1]) { a.box(cx + s * hw * 0.48 - 8, by1 - 24, fz + 60, cx + s * hw * 0.48 + 8, by1, Z1 - 200); a.box(cx + s * hw - 30, by1 - 24, fz + 160, cx + s * hw + 30, by1 - 4, fz + 240); a.box(cx + s * hw - 30, by1 - 24, Z1 - 420, cx + s * hw + 30, by1 - 4, Z1 - 340); }
    a.line(cx, by1 - 60, cx, by1, 'EQUIP-DETAIL'); a.rect(cx - hw, by0, cx + hw, by1, 'EQUIP');
  } else if (k === 'curtain') {
    a.box(cx - hw, by0, fz - 60, cx + hw, by1, fz + 30); const hb = Z1 - 100;
    a.box(cx - hw, by0, fz + 30, cx + hw, by0 + 50, Z1 - 60);
    for (let i = 0; i <= 8; i++) { const y = by0 + ((by1 - by0 - 80) * i) / 8; for (const s of [-1, 1]) a.box(cx + s * hw - 22, y, fz + 30, cx + s * hw + 22, y + 60, Z1 - 130); }
    for (const s of [-1, 1]) { a.box(cx + s * hw - 22, by0 + 50, Z1 - 150, cx + s * hw + 22, by1, Z1 - 100); a.box(cx + s * hw - 6, by0 + 50, fz + 30, cx + s * hw + 12, by1 - 60, Z1 - 150); for (let i = 1; i < 40; i++) a.line(cx + s * hw, by0 + ((by1 - by0) * i) / 40, cx + s * (hw - 60), by0 + ((by1 - by0) * i) / 40, 'EQUIP-DETAIL'); }
    a.box(cx - hw, by1 - 60, fz + 30, cx + hw, by1, Z1 - 100); a.box(cx - hw, by1 - 50, Z1 - 100, cx + hw, by1, Z1);
    a.rect(cx - hw, by0, cx + hw, by1, 'EQUIP');
  } else if (k === 'flat') {
    a.box(cx - hw, by0, fz - 60, cx + hw, by1, fz + 60); for (let i = 0; i < 10; i++) { const y = by0 + 150 + ((by1 - by0 - 300) * i) / 9; for (const s of [-1, 1]) a.box(cx + s * hw - 22, y - 20, fz - 30, cx + s * hw + 40 * s, y + 20, fz + 160); }
    a.box(cx - hw, by0, fz + 60, cx + hw, by0 + 40, fz + 1250); a.frame(cx - hw, fz + 60, cx + hw, fz + 1250, by0, by0 + 40, 40);
    for (const x of [-0.7, -0.35, 0, 0.35, 0.7]) a.box(cx + x * hw - 20, by0 + 40, fz + 60, cx + x * hw + 20, by0 + 60, fz + 1250);
    for (let i = 1; i < 40; i++) a.line(cx - hw, by0 + ((by1 - by0) * i) / 40, cx + hw, by0 + ((by1 - by0) * i) / 40, 'EQUIP-DETAIL');
    a.rect(cx - hw, by0, cx + hw, by1, 'EQUIP');
  } else {   // tank
    const tr = hw * 0.86, tz = fz + tr + 40;
    a.ycyl(by0 + 150, by1 - 150, cx, tz, tr, 24); a.ell(cx, by0 + 150, tz, tr, 150, tr, 20, 10); a.ell(cx, by1 - 150, tz, tr, 150, tr, 20, 10);
    for (let i = 1; i < 6; i++) ring3(a, cx, by0 + 150 + ((by1 - by0 - 300) * i) / 6, tz, tr + 6, 9, 24, 'y');
    for (const f of [0.18, 0.5, 0.82]) { const y = by0 + (by1 - by0) * f; a.cyl(cx, y, tz + tr - 20, tz + tr + 140, 230, 14); a.cyl(cx, y, tz + tr + 140, tz + tr + 170, 250, 14); a.circ(cx, y, 230, 'EQUIP-DETAIL'); }
    a.box(cx - 170, by0 + 220, tz + tr - 10, cx + 170, by1 - 260, tz + tr + 40);
    for (const s of [-1, 1]) a.tube([[cx + s * 170, by0 + 220, tz + tr + 40], [cx + s * 170, by0 + 220, tz + tr + 640], [cx + s * 170, by0 + 220 + 600, tz + tr + 640]], [14, 14, 14], 6);
    for (const f of [0.15, 0.5, 0.85]) a.box(cx - hw * 0.95, by0 + (by1 - by0) * f - 60, fz - 60, cx + hw * 0.95, by0 + (by1 - by0) * f + 60, fz + 60);
    a.box(cx - 220, by1 - 150, fz + 60, cx + 220, by1 - 30, fz + 560); a.ycyl(by1 - 140, by1 - 20, cx, fz + 160, 70, 10);
    a.ellp(cx, (by0 + by1) / 2, tr, (by1 - by0) / 2 - 150, 'EQUIP'); a.rect(cx - hw, by0, cx + hw, by1, 'EQUIP-DETAIL');
  }
  a.rect(cx - hw * 0.55, YF + 900, cx + hw * 0.55, YB - 120, 'EQUIP-HIDDEN'); a.circ(cx, YF + 520, 30, 'EQUIP-DETAIL');
  a.log('Added the kingpin and upper coupler, I-beam frame, landing legs with cranks, ' + v.axles + '-axle group with dual wheels, wheel guards, underride bar, lamps and the ' + { box: 'closed box body with ribs, hinged rear doors and locking bars', curtain: 'curtain-side body with posts, rails and curtain panels', flat: 'flat deck with stake pockets and headboard', tank: 'cylindrical tank with baffle bands, manway domes, walkway and rear cabinet' }[k] + ' (plan and 3D).');
}

/** a light trailer on a drawbar: kind open | flat | box | tipper. Single or twin axle, fenders, jockey wheel, coupler, safety chain, lamps. */
function utrailer(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, hw = W / 2 - 40, k = v.kind, wr = v.wr ?? 190, fz = Z0 + wr * 1.6 + 80, tw = 150;
  const by0 = YF + v.draw, by1 = YB;
  // A-frame drawbar, coupler, jockey wheel, chain
  a.tube([[cx - hw * 0.8, by0 + 200, fz - 40], [cx, YF + 80, fz - 20]], [20, 20], 6); a.tube([[cx + hw * 0.8, by0 + 200, fz - 40], [cx, YF + 80, fz - 20]], [20, 20], 6);
  a.tube([[cx, by0 + 100, fz - 20], [cx, YF + 30, fz - 20]], [24, 24], 6); a.cyl(cx, YF + 70, fz - 130, fz - 20, 40, 10); a.ell(cx, YF + 70, fz - 100, 60, 60, 40, 10, 6);
  a.tube([[cx, YF + 500, fz + 30], [cx, YF + 500, fz + 360]], [18, 18], 6); a.xcyl(cx - 30, cx + 30, YF + 500, Z0 + 90, 90, 12); a.cyl(cx, YF + 500, Z0 + 90, fz + 20, 12, 6);
  a.tube([[cx + 60, YF + 100, fz - 10], [cx + 110, YF + 260, fz - 80], [cx + 40, by0 + 80, fz - 20]], [5, 5, 5], 4);
  for (const s of [-1, 1]) a.box(cx + s * hw * 0.94 - 30, by0, fz - 70, cx + s * hw * 0.94 + 30, by1, fz);   // chassis rails
  a.box(cx - hw, by0, fz, cx + hw, by1, fz + 50);
  const ax = v.axles, ay = (by0 + by1) / 2 + (v.axles === 2 ? 0 : 120);
  for (let i = 0; i < ax; i++) { const y = ay + (ax === 2 ? (i ? 420 : -420) : 0); for (const s of [-1, 1]) { whl(a, cx + s * (hw - tw * 0.5 + 20), y, wr, tw, { rim: 0.6 }); const fx = cx + s * (hw - tw * 0.5 + 20); a.tube([[fx - tw * 0.5 * 1, y - wr * 1.15, Z0 + wr * 2 + 60], [fx, y - wr * 0.5, Z0 + wr * 2 + 100], [fx, y + wr * 0.5, Z0 + wr * 2 + 100], [fx + 0, y + wr * 1.15, Z0 + wr * 2 + 60]], [20, 20, 20, 20], 6); a.box(cx + s * (hw - tw * 0.5 + 20) - 50, y - wr * 1.2, Z0 + wr * 2 + 50, cx + s * (hw - tw * 0.5 + 20) + 50, y + wr * 1.2, Z0 + wr * 2 + 70); } a.xcyl(cx - hw + 80, cx + hw - 80, y, Z0 + wr, 26, 8); a.box(cx - hw * 0.4, y - 40, Z0 + wr + 30, cx + hw * 0.4, y + 40, fz - 70); }
  const hs = (k === 'box' ? 1500 : k === 'tipper' ? 650 : k === 'flat' ? 0 : 520);
  if (k === 'open') {
    a.box(cx - hw, by0, fz + 50, cx + hw, by1, fz + 70);
    for (const s of [-1, 1]) a.box(cx + s * hw - (s > 0 ? 30 : 0), by0, fz + 70, cx + s * hw + (s > 0 ? 0 : 30), by1, fz + hs);
    a.box(cx - hw, by0, fz + 70, cx + hw, by0 + 30, fz + hs); a.box(cx - hw, by1 - 30, fz + 70, cx + hw, by1, fz + hs - 120);
    for (const s of [-1, 1]) a.tube([[cx + s * hw, by1 - 30, fz + 120], [cx + s * hw, by1 - 30, fz + hs - 120]], [8, 8], 4);
    for (let i = 1; i < 8; i++) a.box(cx - hw + 10, by0 + ((by1 - by0) * i) / 8 - 6, fz + hs - 20, cx + hw - 10, by0 + ((by1 - by0) * i) / 8 + 6, fz + hs);
  } else if (k === 'flat') {
    for (let i = 0; i < 12; i++) a.box(cx - hw, by0 + ((by1 - by0) * i) / 12 + 6, fz + 50, cx + hw, by0 + ((by1 - by0) * (i + 1)) / 12 - 6, fz + 90);
    for (const s of [-1, 1]) { a.box(cx + s * hw - (s > 0 ? 30 : 0), by0, fz + 50, cx + s * hw + (s > 0 ? 0 : 30), by1, fz + 130); for (let i = 0; i < 5; i++) a.box(cx + s * hw - 10, by0 + 120 + i * ((by1 - by0 - 240) / 4) - 15, fz + 130, cx + s * hw + 10, by0 + 120 + i * ((by1 - by0 - 240) / 4) + 15, fz + 190); }
    a.box(cx - hw * 0.96, by0, fz + 90, cx + hw * 0.96, by0 + 40, fz + 480);
    prismX(a, [[by1, fz + 50], [by1 + 0, fz + 90], [by1 - 600, fz + 90], [by1 - 600, fz + 50]], cx - hw * 0.45, cx + hw * 0.45); a.rect(cx - hw * 0.45, by1 - 600, cx + hw * 0.45, by1, 'EQUIP-DETAIL');
  } else if (k === 'box') {
    a.box(cx - hw, by0, fz + 50, cx + hw, by1, fz + hs); sup(a, [{ y: by0 + 20, x: cx, rx: hw * 0.97, z0: fz + hs - 40, z1: fz + hs + 30 }, { y: by1 - 20, x: cx, rx: hw * 0.97, z0: fz + hs - 40, z1: fz + hs + 30 }], { seg: 8, n: 3 });
    prismY(a, [[cx - hw * 0.5, fz + hs], [cx + hw * 0.5, fz + hs], [cx + hw * 0.4, fz + hs + 50], [cx - hw * 0.4, fz + hs + 50]], by0 + 600, by0 + 1000);
    a.box(cx - hw * 0.86, by1 - 6, fz + 80, cx + hw * 0.86, by1, fz + hs - 40); a.box(cx - 8, by1 - 12, fz + 80, cx + 8, by1, fz + hs - 40);
    for (let i = 1; i < 7; i++) a.box(cx - hw - 6, by0 + ((by1 - by0) * i) / 7 - 8, fz + 60, cx + hw + 6, by0 + ((by1 - by0) * i) / 7 + 8, fz + hs - 10);
    a.box(cx + hw - 6, by0 + 400, fz + 300, cx + hw + 10, by0 + 1100, fz + hs - 200); a.box(cx + hw - 6, by0 + 400, fz + 480, cx + hw + 12, by0 + 440, fz + 520);
    for (let i = 0; i < 3; i++) a.box(cx - hw * 0.92, by0 - 8, fz + 200 + i * 400, cx + hw * 0.92, by0, fz + 220 + i * 400);
    a.rect(cx - hw, by0, cx + hw, by1, 'EQUIP');
  } else {   // tipper
    a.box(cx - hw * 0.9, by0 + 300, fz + 50, cx + hw * 0.9, by1 - 100, fz + 150);
    a.tube([[cx, by0 + 500, fz + 150], [cx, by0 + 900, fz + 500]], [60, 50], 10); a.tube([[cx, by0 + 450, fz + 120], [cx, by0 + 700, fz + 280]], [80, 80], 10);
    for (const s of [-1, 1]) a.box(cx + s * hw - (s > 0 ? 40 : 0), by0 + 250, fz + 150, cx + s * hw + (s > 0 ? 0 : 40), by1, fz + hs);
    a.box(cx - hw, by0 + 250, fz + 150, cx + hw, by0 + 300, fz + hs + 80); a.box(cx - hw, by1 - 40, fz + 150, cx + hw, by1, fz + hs - 40);
    a.box(cx - hw, by0 + 300, fz + 150, cx + hw, by1 - 40, fz + 190);
    for (const z of [fz + hs - 30]) a.box(cx - hw - 12, by0 + 250, z, cx + hw + 12, by1, z + 30);
    a.rect(cx - hw, by0 + 250, cx + hw, by1, 'EQUIP');
  }
  for (const s of [-1, 1]) a.box(cx + s * hw * 0.8 - 50, by1 - 14, fz - 20, cx + s * hw * 0.8 + 50, by1, fz + 50);
  a.box(cx - 100, by1 - 10, fz + 50, cx + 100, by1, fz + 130);
  a.rect(cx - hw * 0.94, by0, cx + hw * 0.94, by1, 'EQUIP-DETAIL'); a.line(cx - hw * 0.8, by0 + 200, cx, YF + 80, 'EQUIP'); a.line(cx + hw * 0.8, by0 + 200, cx, YF + 80, 'EQUIP'); a.circ(cx, YF + 500, 90, 'EQUIP-DETAIL');
  a.log('Added the A-frame drawbar with coupler, jockey wheel and safety chain, chassis rails, ' + ax + (ax > 1 ? ' axles' : ' axle') + ' with leaf springs, wheels and fenders, lamps and the ' + { open: 'open box with side boards and tailgate', flat: 'flat deck with ramp, side rails and stake pockets', box: 'enclosed body with ramp door, side door and roof vent', tipper: 'hinged tipping tub with hydraulic ram' }[k] + ' (plan and 3D).');
}

/** a touring caravan: rounded body, windows, entrance door, roof lights, drawbar with hitch, corner steadies, axle(s) and wheels. */
function caravan(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, hw = W / 2 - 60, wr = 330, fz = Z0 + 420, tw = 190, by0 = YF + v.draw, by1 = YB;
  const bl = by1 - by0, Y = (f) => by0 + bl * f;
  const st = [[0, 0.78, 0.35, 0.8], [0.03, 0.92, 0.2, 0.93], [0.1, 1, 0.1, 1], [0.9, 1, 0.1, 1], [0.97, 0.93, 0.2, 0.93], [1, 0.8, 0.35, 0.8]];
  sup(a, st.map(([f, k, zk, zt]) => ({ y: Y(f), x: cx, rx: hw * k, z0: fz + zk * 60, z1: Z1 - (1 - zt) * 300 })), { seg: 18, n: 4 }); planOf(a, st.map(([f, k]) => ({ y: Y(f), x: cx, rx: hw * k })));
  a.box(cx - hw * 0.9, by0 + 60, fz - 60, cx + hw * 0.9, by1 - 60, fz + 60);
  for (const s of [-1, 1]) { const xa = cx + s * (hw - 6), xb = cx + s * (hw + 14);
    a.box(xa, Y(0.2), Z0 + H * 0.5, xb, Y(0.2) + bl * 0.16, Z0 + H * 0.84); a.box(xa, Y(0.55), Z0 + H * 0.5, xb, Y(0.55) + bl * 0.16, Z0 + H * 0.84);
    a.frame(s > 0 ? xa : xb, Z0 + H * 0.5, s > 0 ? xb : xa, Z0 + H * 0.84, Y(0.2) - 14, Y(0.2) + bl * 0.16 + 14, 22);
    a.box(cx + s * (hw + 8) - 12, Y(0.76), Z0 + H * 0.2, cx + s * (hw + 8) + 12, Y(0.9), Z0 + H * 0.7);
    a.line(cx + s * hw, Y(0.2), cx + s * (hw - 90), Y(0.2), 'EQUIP-DETAIL');
  }
  a.box(cx + hw - 6, Y(0.76), Z0 + H * 0.2, cx + hw + 18, Y(0.9), Z0 + H * 0.74); a.box(cx + hw - 4, Y(0.76) + 40, Z0 + H * 0.52, cx + hw + 22, Y(0.9) - 40, Z0 + H * 0.68);
  a.frame(cx - hw * 0.6, Z0 + H * 0.52, cx + hw * 0.6, Z0 + H * 0.84, by0 - 6, by0 + 20, 20); a.box(cx - hw * 0.6, by0 - 4, Z0 + H * 0.52, cx + hw * 0.6, by0 + 14, Z0 + H * 0.84);
  for (const f of [0.28, 0.7]) a.box(cx - 220, Y(f) - 220, Z1 - 70, cx + 220, Y(f) + 220, Z1 - 30);
  a.box(cx - 80, Y(0.45), Z1 - 55, cx + 80, Y(0.5), Z1 - 25);
  a.box(cx - hw * 0.5, by0 + 40, fz + 120, cx + hw * 0.5, by0 + 360, fz + 480); a.box(cx - hw * 0.5 - 8, by0 + 30, fz + 440, cx + hw * 0.5 + 8, by0 + 380, fz + 470);
  a.tube([[cx - hw * 0.5, by0 + 20, fz - 20], [cx, YF + 120, fz - 80]], [22, 22], 6); a.tube([[cx + hw * 0.5, by0 + 20, fz - 20], [cx, YF + 120, fz - 80]], [22, 22], 6); a.box(cx - 55, YF, fz - 130, cx + 55, YF + 200, fz - 40); a.cyl(cx, YF + 90, fz - 40, fz + 40, 38, 10);
  a.tube([[cx, YF + 420, fz - 40], [cx, YF + 420, fz + 220]], [18, 18], 6); a.xcyl(cx - 25, cx + 25, YF + 420, Z0 + 80, 80, 12);
  const ax = v.axles, ay = by0 + bl * (v.axles === 1 ? 0.52 : 0.46);
  for (let i = 0; i < ax; i++) { const y = ay + i * 780; for (const s of [-1, 1]) { whl(a, cx + s * (hw - tw * 0.45), y, wr, tw); const fx = cx + s * (hw - tw * 0.45 + 40); a.tube([[fx, y - wr * 1.2, Z0 + wr * 2 + 50], [fx, y - wr * 0.6, Z0 + wr * 2 + 100], [fx, y + wr * 0.6, Z0 + wr * 2 + 100], [fx, y + wr * 1.2, Z0 + wr * 2 + 50]], [30, 30, 30, 30], 6); } a.xcyl(cx - hw + 100, cx + hw - 100, y, Z0 + wr, 30, 8); }
  for (const s of [-1, 1]) for (const f of [0.1, 0.9]) { const y = Y(f), x = cx + s * (hw * 0.86); a.cyl(x, y, Z0 + 90, fz, 18, 6); a.box(x - 90, y - 90, Z0, x + 90, y + 90, Z0 + 28); a.circ(x, y, 90, 'EQUIP-DETAIL'); }
  for (const s of [-1, 1]) a.box(cx + s * hw * 0.82 - 70, by1 - 14, fz + 200, cx + s * hw * 0.82 + 70, by1, fz + 340);
  a.rect(cx - hw, by0, cx + hw, by1, 'EQUIP-DETAIL'); a.line(cx - hw * 0.5, by0, cx, YF + 120, 'EQUIP'); a.line(cx + hw * 0.5, by0, cx, YF + 120, 'EQUIP'); a.line(cx, by0, cx, by1, 'EQUIP-HIDDEN');
  a.log('Added the rounded body with side windows, entrance door, front window and gas locker, roof lights, A-frame drawbar with hitch and jockey wheel, ' + ax + (ax > 1 ? ' axles' : ' axle') + ' with wheels and arches, four corner steadies and tail lamps (plan and 3D).');
}

/** a small electric utility vehicle: kind cart2 | cart4 | bed | trike. Floor pan, cowl, seats, canopy on posts, steering, wheels, lamps. */
function cart(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, hw = W / 2 - 50, k = v.kind, r = v.wr ?? 230, tw = 170, fz = Z0 + r + 50, Y = (f) => YF + D * f, trike = k === 'trike';
  a.box(cx - hw * 0.88, Y(0.1), fz - 70, cx + hw * 0.88, YB - 50, fz); for (const s of [-1, 1]) a.box(cx + s * hw * 0.85 - 30, Y(0.1), fz - 110, cx + s * hw * 0.85 + 30, YB - 50, fz - 70);
  const fk = trike ? 0.5 : 1;
  sup(a, [{ y: Y(0.012), x: cx, rx: hw * 0.7 * fk, z0: fz + 40, z1: fz + 330 }, { y: Y(0.05), x: cx, rx: hw * 0.92 * fk, z0: fz - 30, z1: fz + 470 }, { y: Y(0.26), x: cx, rx: hw * fk, z0: fz - 30, z1: fz + 560 }], { seg: 14, n: 3 });
  const fy = trike ? [Y(0.13)] : [Y(0.15), Y(0.15)], ry = Y(k === 'cart2' ? 0.8 : k === 'cart4' ? 0.84 : 0.8);
  if (trike) whl(a, cx, fy[0], r, tw); else for (const s of [-1, 1]) whl(a, cx + s * (hw - tw * 0.4), fy[0], r, tw);
  for (const s of [-1, 1]) whl(a, cx + s * (hw - tw * 0.4), ry, r, tw);
  a.xcyl(cx - hw + tw, cx + hw - tw, ry, Z0 + r, 36, 8); if (!trike) a.xcyl(cx - hw + tw, cx + hw - tw, fy[0], Z0 + r, 30, 8);
  for (const s of [-1, 1]) { a.box(cx + s * (hw - tw * 0.4) - tw * 0.55, ry - r * 1.1, fz + 10, cx + s * (hw - tw * 0.4) + tw * 0.55, ry + r * 1.1, fz + 50); if (!trike) a.box(cx + s * (hw - tw * 0.4) - tw * 0.55, fy[0] - r * 1.1, fz + 460, cx + s * (hw - tw * 0.4) + tw * 0.55, fy[0] + r * 1.1, fz + 500); }
  if (trike) { a.box(cx - hw * 0.34, fy[0] - r * 1.1, fz + 440, cx + hw * 0.34, fy[0] + r * 1.1, fz + 480); a.tube([[cx, fy[0], Z0 + r], [cx, fy[0] + 60, fz + 440]], [30, 30], 8); }
  const bx = cx - hw * 0.86, bX = cx + hw * 0.86;
  a.box(bx, Y(0.3), fz, bX, Y(0.5), fz + 130); prismX(a, [[Y(0.5), fz + 130], [Y(0.5) + 70, fz + 130], [Y(0.5) + 110, fz + 560], [Y(0.5) + 30, fz + 560]], bx, bX);
  if (k === 'cart4') { a.box(bx, Y(0.6), fz, bX, Y(0.78), fz + 130); prismX(a, [[Y(0.6), fz + 130], [Y(0.6) - 70, fz + 130], [Y(0.6) - 100, fz + 540], [Y(0.6) - 30, fz + 540]], bx, bX); a.box(bx, Y(0.78), fz - 20, bX, Y(0.95), fz + 20); }
  else if (k === 'bed') { a.box(bx, Y(0.58), fz, bX, YB - 30, fz + 40); for (const s of [-1, 1]) a.box(s > 0 ? bX - 30 : bx, Y(0.58), fz + 40, s > 0 ? bX : bx + 30, YB - 30, fz + 320); a.box(bx, Y(0.58), fz + 40, bX, Y(0.58) + 30, fz + 320); a.box(bx, YB - 60, fz + 40, bX, YB - 30, fz + 300); a.rect(bx + 30, Y(0.58) + 30, bX - 30, YB - 60, 'EQUIP-DETAIL'); }
  else if (k === 'cart2') { a.box(bx, Y(0.6), fz - 20, bX, YB - 40, fz + 30); for (const s of [-1, 1]) a.tube([[cx + s * hw * 0.4, Y(0.66), fz + 30], [cx + s * hw * 0.4, Y(0.62) + 60, fz + 420]], [16, 16], 6); a.tube([[cx - hw * 0.4, Y(0.66), fz + 350], [cx + hw * 0.4, Y(0.66), fz + 350]], [14, 14], 6); a.box(cx - hw * 0.5, Y(0.82), fz + 30, cx + hw * 0.5, Y(0.84), fz + 110); }
  else { a.box(bx, Y(0.55), fz, bX, Y(0.97), fz + 130); prismX(a, [[Y(0.9), fz + 130], [Y(0.97), fz + 130], [Y(0.97), fz + 560], [Y(0.92), fz + 560]], bx, bX); }
  const rf = k === 'trike' ? 0.97 : k === 'cart4' ? 0.95 : k === 'bed' ? 0.55 : 0.88;
  a.box(cx - hw * 0.98, Y(0.24), Z1 - 60, cx + hw * 0.98, Y(rf), Z1); a.box(cx - hw, Y(0.22), Z1 - 90, cx + hw, Y(0.24) + 30, Z1 - 55);
  for (const s of [-1, 1]) { a.tube([[cx + s * hw * 0.88, Y(0.27), fz + 540], [cx + s * hw * 0.88, Y(0.24), Z1 - 60]], [17, 17], 6); a.tube([[cx + s * hw * 0.88, Y(rf) - 40, fz + 140], [cx + s * hw * 0.88, Y(rf) - 40, Z1 - 60]], [17, 17], 6); if (k === 'cart4' || trike) a.tube([[cx + s * hw * 0.88, Y(0.55), fz + 130], [cx + s * hw * 0.88, Y(0.55), Z1 - 60]], [15, 15], 6); }
  a.frame(cx - hw * 0.86, fz + 560, cx + hw * 0.86, Z1 - 110, Y(0.255), Y(0.275), 22); if (!trike) a.box(cx - hw * 0.84, Y(0.258), fz + 580, cx + hw * 0.84, Y(0.268), Z1 - 130);
  const sx = cx - hw * 0.45, sy = Y(0.275) + 230;
  a.tube([[sx, Y(0.26), fz + 340], [sx, sy - 60, fz + 560]], [16, 16], 6); ring3(a, sx, sy, fz + 600, 170, 12, 14, 'y');
  if (trike) { a.tube([[cx - hw * 0.35, Y(0.27), fz + 560], [cx + hw * 0.35, Y(0.27), fz + 560]], [14, 14], 6); }
  a.box(cx + hw * 0.1, Y(0.04), fz + 20, cx + hw * 0.55, Y(0.1), fz + 120); a.box(cx - hw * 0.2, Y(0.06), fz + 20, cx + hw * 0.0, Y(0.1), fz + 90);
  for (const s of [-1, 1]) { a.ell(cx + s * hw * 0.55 * fk, Y(0.03), fz + 330, 100, 40, 70, 10, 6); a.box(cx + s * hw * 0.7 - 50, YB - 12, fz + 120, cx + s * hw * 0.7 + 50, YB, fz + 200); }
  a.box(cx - hw * 0.5 * fk, Y(0.0), fz - 60, cx + hw * 0.5 * fk, Y(0.04), fz + 100);
  a.rect(cx - hw * 0.9, YF, cx + hw * 0.9, YB); a.rect(cx - hw * 0.84, Y(0.24), cx + hw * 0.84, Y(rf), 'EQUIP-DETAIL'); a.line(cx - hw * 0.86, Y(0.5), cx + hw * 0.86, Y(0.5), 'EQUIP-DETAIL');
  a.log('Added the floor pan and chassis rails, cowl, ' + (k === 'cart4' ? 'forward and rear-facing bench seats' : k === 'bed' ? 'bench seat and cargo bed with side walls and tailgate' : k === 'trike' ? 'bench seat, handlebar and single front wheel' : 'bench seat and golf-bag deck') + ', canopy on posts, windscreen, steering wheel, pedals, lamps and wheels (plan and 3D).');
}

/** a quad bike: four fat tyres, body, seat, bars, racks (utility) or low sport body. */
function quad(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, hw = W / 2, r = v.wr, tw = v.tw, Y = (f) => YF + D * f, wx = hw - tw * 0.5 - 10;
  const fy = Y(0.2), ry = Y(0.78), zc = Z0 + r;
  for (const y of [fy, ry]) { for (const s of [-1, 1]) { whl(a, cx + s * wx, y, r, tw, { plain: true }); a.xcyl(cx + s * (wx - tw * 0.5), cx + s * (wx - tw * 0.5 - 40), y, zc, r * 0.5, 12); for (let q = 0; q < 6; q++) { const t = (q / 6) * TAU; a.xcyl(cx + s * (wx + tw * 0.5 - 6), cx + s * (wx + tw * 0.5 + 6), y + m.cos(t) * r * 0.45, zc + m.sin(t) * r * 0.45, 12, 6); } } a.xcyl(cx - wx, cx + wx, y, zc, 28, 8); }
  for (const y of [fy, ry]) for (const s of [-1, 1]) { a.tube([[cx + s * 150, y + 20, zc + 100], [cx + s * (wx - tw * 0.5), y, zc]], [18, 18], 6); a.tube([[cx + s * 150, y - 200, zc + 40], [cx + s * (wx - tw * 0.5), y, zc]], [18, 18], 6); a.tube([[cx + s * (wx - tw * 0.5 - 40), y, zc + 60], [cx + s * 150, y, zc + r * 0.9 + 100]], [20, 20], 6); }
  sup(a, [{ y: Y(0.04), x: cx, rx: wx * 0.62, z0: zc + 160, z1: zc + 400 }, { y: Y(0.14), x: cx, rx: wx * 0.9, z0: zc + 100, z1: zc + 520 }, { y: Y(0.34), x: cx, rx: wx * 0.9, z0: zc + 100, z1: zc + 560 }, { y: Y(0.4), x: cx, rx: wx * 0.42, z0: zc + 160, z1: zc + 560 }], { seg: 14, n: 2.8 });
  a.ell(cx, Y(0.45), zc + 520, wx * 0.42, 230, 110, 12, 7);
  a.ell(cx, Y(0.64), zc + 450, wx * 0.45, 340, 80, 12, 6); a.rect(cx - wx * 0.45, Y(0.5), cx + wx * 0.45, Y(0.8), 'EQUIP-DETAIL');
  sup(a, [{ y: Y(0.78), x: cx, rx: wx * 0.72, z0: zc + 160, z1: zc + 500 }, { y: Y(0.9), x: cx, rx: wx * 0.88, z0: zc + 140, z1: zc + 460 }, { y: Y(0.98), x: cx, rx: wx * 0.7, z0: zc + 160, z1: zc + 400 }], { seg: 12, n: 2.8 });
  for (const s of [-1, 1]) { a.box(cx + s * (wx * 0.7) - 140, Y(0.28), zc + 60, cx + s * (wx * 0.7) + 140, Y(0.72), zc + 120); for (let q = 0; q < 6; q++) a.box(cx + s * (wx * 0.7) - 140, Y(0.3 + q * 0.07) - 8, zc + 120, cx + s * (wx * 0.7) + 140, Y(0.3 + q * 0.07) + 8, zc + 140); }
  const sz = zc + 780; a.tube([[cx, Y(0.28), zc + 560], [cx, Y(0.3), sz]], [26, 26], 8); a.tube([[cx - 380, Y(0.34), sz + 20], [cx - 140, Y(0.3), sz + 40], [cx + 140, Y(0.3), sz + 40], [cx + 380, Y(0.34), sz + 20]], [14, 14, 14, 14], 6);
  for (const s of [-1, 1]) { a.xcyl(cx + s * 380 - 60, cx + s * 380 + 60, Y(0.34), sz + 20, 17, 8); a.ell(cx + s * (wx * 0.62), Y(0.05), zc + 400, 110, 50, 80, 10, 6); a.box(cx + s * wx * 0.55 - 40, Y(0.27), sz - 150, cx + s * wx * 0.55 + 40, Y(0.3), sz - 40); }
  a.ell(cx, Y(0.27), sz - 70, 170, 80, 80, 10, 6);
  if (v.util) { a.frame(cx - wx * 0.6, zc + 340, cx + wx * 0.6, zc + 600, Y(0.0), Y(0.06) + 0, 24); a.box(cx - wx * 0.6, Y(0.01), zc + 560, cx + wx * 0.6, Y(0.12), zc + 600); for (const s of [-1, 1]) a.tube([[cx + s * wx * 0.6, Y(0.01), zc + 560], [cx + s * wx * 0.6, Y(0.12), zc + 560], [cx + s * wx * 0.6, Y(0.14), zc + 380]], [11, 11, 11], 6); a.frame(cx - wx * 0.6, zc + 580, cx + wx * 0.6, zc + 600, Y(0.8), Y(0.97), 18); a.box(cx - wx * 0.6, Y(0.8), zc + 560, cx + wx * 0.6, Y(0.97), zc + 600); for (const s of [-1, 1]) a.tube([[cx + s * wx * 0.6, Y(0.8), zc + 560], [cx + s * wx * 0.6, Y(0.8), zc + 380]], [12, 12], 6); a.box(cx - wx * 0.7, YF, zc + 100, cx + wx * 0.7, YF + 70, zc + 240); a.xcyl(cx - 110, cx + 110, YF + 100, zc + 150, 60, 12); }
  else { a.tube([[cx - 90, Y(0.7), zc + 160], [cx - 160, Y(0.96), zc + 220], [cx - 160, YB - 40, zc + 240]], [22, 22, 30], 8); a.ell(cx, Y(0.96), zc + 440, 120, 100, 60, 10, 6); }
  a.rect(cx - wx - tw * 0.5, YF, cx + wx + tw * 0.5, YB, 'EQUIP-HIDDEN'); a.outline('EQUIP-DETAIL'); a.line(cx, fy, cx, ry, 'EQUIP-DETAIL');
  a.log('Added four knobbly tyres on wheels, A-arm suspension with shocks, ' + (v.util ? 'front and rear racks, front bumper and winch, ' : 'low body and sport exhaust, ') + 'tank cover, seat, handlebar with grips, headlamps, fenders and footboards (plan and 3D).');
}

/** spoked cycle wheel in the Y-Z plane at x */
function cwheel(a, x, y, R, tr = 22) { const zc = a.Z0 + R; ring3(a, x, y, zc, R - tr, tr, 28, 'x'); ring3(a, x, y, zc, R - tr * 2 - 8, 6, 24, 'x'); a.xcyl(x - 45, x + 45, y, zc, 15, 8); for (let q = 0; q < 16; q++) { const t = (q / 16) * TAU, sx = q % 2 ? 30 : -30; a.tube([[x + sx, y, zc], [x, y + m.cos(t) * (R - tr * 2 - 8), zc + m.sin(t) * (R - tr * 2 - 8)]], [3, 3], 3); } a.rect(x - tr, y - R, x + tr, y + R, 'EQUIP'); }
/** a cargo bicycle: kind long (extended rear rack) | box (front box) | trike (two front wheels and a box). */
function cargo(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, k = v.kind, R = 330, zc = Z0 + R, fy = YF + R + 30, ry = YB - R - 40, T = (p, q, rr = 14, n = 6) => a.tube([p, q], [rr, rr], n);
  const wb = ry - fy;
  if (k === 'long') {
    cwheel(a, cx, fy, R); cwheel(a, cx, ry, R, 28);
    const bb = [cx, ry - 560, Z0 + 330], st = [cx, ry - 600, Z0 + 840], ht0 = [cx, fy + 140, zc + 340], ht1 = [cx, fy + 210, zc + 640];
    T(ht0, ht1, 22); T(bb, st, 17); T(ht0, bb, 22); T(ht1, [cx, st[1] + 20, st[2] - 60], 17); T(bb, [cx, st[1] + 20, st[2] - 60], 14);
    for (const s of [-1, 1]) { T([cx + s * 60, bb[1], bb[2]], [cx + s * 62, ry, zc], 12); T([cx + s * 22, st[1] + 10, st[2] - 90], [cx + s * 60, ry, zc], 10); T([cx + s * 50, ht0[1] - 10, ht0[2] + 10], [cx + s * 50, fy, zc], 14); }
    T([cx - 50, ht0[1] - 10, ht0[2] + 10], [cx + 50, ht0[1] - 10, ht0[2] + 10], 14);
    T(ht1, [cx, ht1[1] - 30, ht1[2] + 120], 15); T([cx - 330, ht1[1] - 120, ht1[2] + 100], [cx + 330, ht1[1] - 120, ht1[2] + 100], 13); for (const s of [-1, 1]) a.xcyl(cx + s * 300 - 60, cx + s * 300 + 60, ht1[1] - 120, ht1[2] + 100, 17, 8);
    a.ell(cx, st[1] - 10, st[2] + 70, 80, 130, 25, 10, 5); T([cx, st[1], st[2] - 30], [cx, st[1] - 5, st[2] + 50], 14);
    a.xcyl(cx + 40, cx + 54, bb[1], bb[2], 95, 14); for (const s of [-1, 1]) { T([cx + s * 82, bb[1], bb[2]], [cx + s * 82, bb[1] + s * 150, bb[2] - s * 70 + 70], 12); a.box(cx + s * 82, bb[1] + s * 150 - 50, bb[2] - s * 70 + 62, cx + s * 150, bb[1] + s * 150 + 50, bb[2] - s * 70 + 78); }
    const dz = zc + 330, dy0 = ry - 700, dy1 = YB - 20;
    a.box(cx - 140, dy0, dz, cx + 140, dy1, dz + 30); a.box(cx - 140, dy0 + 120, Z0 + 130, cx - 118, dy1 - 60, dz); a.box(cx + 118, dy0 + 120, Z0 + 130, cx + 140, dy1 - 60, dz);
    for (const s of [-1, 1]) { a.tube([[cx + s * 140, dy0 + 40, dz + 30], [cx + s * 145, dy0 + 40, dz + 180], [cx + s * 145, dy1 - 40, dz + 180], [cx + s * 140, dy1 - 40, dz + 30]], [9, 9, 9, 9], 5); a.box(cx + s * 140 - (s > 0 ? 0 : 150), dy0 + 200, dz - 220, cx + s * 140 + (s > 0 ? 150 : 0), dy1 - 120, dz - 40); a.box(cx + s * 120 - 150, dy0 + 120, Z0 + 150, cx + s * 120 + 150, dy0 + 160, Z0 + 170); }
    T([cx - 110, dy0 + 90, dz + 30], [cx - 110, dy0 + 90, dz + 370], 12); T([cx + 110, dy0 + 90, dz + 30], [cx + 110, dy0 + 90, dz + 370], 12); T([cx - 110, dy0 + 90, dz + 370], [cx + 110, dy0 + 90, dz + 370], 12);
    T([cx - 190, ry + 120, Z0 + 220], [cx - 190, ry - 200, Z0], 8); a.rect(cx - 140, dy0, cx + 140, dy1, 'EQUIP-DETAIL');
  } else if (k === 'box') {
    cwheel(a, cx, fy, R - 40); cwheel(a, cx, ry, R);
    const bY0 = fy + 280, bY1 = bY0 + 1080, bz0 = Z0 + 300, bh = 380, hw = 330;
    a.box(cx - hw, bY0, bz0, cx + hw, bY1, bz0 + 40); for (const s of [-1, 1]) a.box(s > 0 ? cx + hw - 30 : cx - hw, bY0, bz0 + 40, s > 0 ? cx + hw : cx - hw + 30, bY1, bz0 + bh); a.box(cx - hw, bY0, bz0 + 40, cx + hw, bY0 + 30, bz0 + bh); a.box(cx - hw, bY1 - 30, bz0 + 40, cx + hw, bY1, bz0 + bh);
    a.box(cx - hw + 30, bY0 + 600, bz0 + 40, cx + hw - 30, bY0 + 780, bz0 + 200); for (const s of [-1, 1]) { a.tube([[cx + s * 180, bY0 + 40, bz0], [cx + s * 180, bY0 + 40, Z0 + R * 0.4]], [11, 11], 5); a.tube([[cx + s * 180, bY1 - 40, bz0], [cx + s * 180, bY1 - 40, Z0 + R * 0.4]], [11, 11], 5); }
    a.tube([[cx - 150, bY0 + 100, bz0 - 20], [cx - 150, bY1 - 60, bz0 - 20]], [24, 24], 6); a.tube([[cx + 150, bY0 + 100, bz0 - 20], [cx + 150, bY1 - 60, bz0 - 20]], [24, 24], 6);
    for (const s of [-1, 1]) T([cx + s * 45, fy, zc - 50 + 50], [cx + s * 45, bY0 + 100, bz0 + 40], 15);
    const hy = bY1 + 120, hz = bz0 + 500, st = [cx, ry - 560, Z0 + 330];
    T([cx, bY1 - 40, bz0 - 20], [cx, ry - 560, Z0 + 330], 24); T([cx, ry - 560, Z0 + 330], [cx, ry - 600, Z0 + 800], 17); T([cx, hy, Z0 + 400], [cx, hy, hz + 100], 18);
    T([cx, bY0 + 30, zc - 60], [cx, hy - 20, hz - 150], 11, 5); T([cx - 330, hy - 40, hz + 100], [cx + 330, hy - 40, hz + 100], 13); for (const s of [-1, 1]) a.xcyl(cx + s * 310 - 60, cx + s * 310 + 60, hy - 40, hz + 100, 17, 8);
    for (const s of [-1, 1]) { T([cx + s * 60, ry - 560, Z0 + 330], [cx + s * 62, ry, zc], 13); T([cx + s * 20, ry - 600, Z0 + 780], [cx + s * 60, ry, zc], 10); }
    a.ell(cx, ry - 610, Z0 + 880, 85, 130, 25, 10, 5); a.xcyl(cx + 40, cx + 54, ry - 560, Z0 + 330, 95, 14); a.box(cx - 90, ry - 130, zc + R * 0.9, cx + 90, YB - 20, zc + R * 0.9 + 24);
    T([cx + 140, bY1 - 120, Z0 + 330], [cx + 190, bY1 + 160, Z0], 9); a.rect(cx - hw, bY0, cx + hw, bY1, 'EQUIP-DETAIL');
  } else {   // trike: two front wheels, cargo box on a frame between them, rider behind
    const wxo = W / 2 - 40; for (const s of [-1, 1]) cwheel(a, cx + s * wxo, fy, R - 40); cwheel(a, cx, ry, R);
    const bY0 = fy - 340, bY1 = bY0 + 1000 + 0, bz0 = Z0 + 330; const by0 = fy - 300, by1 = by0 + 1020;
    a.box(cx - wxo + 40, by0, bz0, cx + wxo - 40, by1, bz0 + 40); for (const s of [-1, 1]) a.box(s > 0 ? cx + wxo - 70 : cx - wxo + 40, by0, bz0 + 40, s > 0 ? cx + wxo - 40 : cx - wxo + 70, by1, bz0 + 360); a.box(cx - wxo + 40, by0, bz0 + 40, cx + wxo - 40, by0 + 30, bz0 + 360); a.box(cx - wxo + 40, by1 - 30, bz0 + 40, cx + wxo - 40, by1, bz0 + 280);
    a.xcyl(cx - wxo, cx + wxo, fy, zc - 30, 22, 8); for (const s of [-1, 1]) { T([cx + s * (wxo - 60), fy, zc - 30], [cx + s * (wxo - 90), by0 + 120, bz0], 18); T([cx + s * (wxo - 60), fy, zc - 30], [cx + s * 40, ry - 560, Z0 + 330], 20); }
    T([cx, by1 - 40, bz0], [cx, ry - 560, Z0 + 330], 26); T([cx, ry - 560, Z0 + 330], [cx, ry - 600, Z0 + 800], 17);
    const hy = by1 + 120, hz = bz0 + 560; T([cx, hy, bz0], [cx, hy, hz + 100], 18); T([cx - 300, hy - 30, hz + 100], [cx + 300, hy - 30, hz + 100], 13); for (const s of [-1, 1]) a.xcyl(cx + s * 280 - 60, cx + s * 280 + 60, hy - 30, hz + 100, 17, 8);
    T([cx, hy, bz0 + 30], [cx, by0 + 100, bz0 + 30], 11, 5);
    for (const s of [-1, 1]) { T([cx + s * 60, ry - 560, Z0 + 330], [cx + s * 62, ry, zc], 13); T([cx + s * 20, ry - 600, Z0 + 780], [cx + s * 60, ry, zc], 10); }
    a.ell(cx, ry - 610, Z0 + 880, 85, 130, 25, 10, 5); a.xcyl(cx + 40, cx + 54, ry - 560, Z0 + 330, 95, 14);
    a.rect(cx - wxo + 40, by0, cx + wxo - 40, by1, 'EQUIP-DETAIL');
  }
  a.rect(cx - 25, YF, cx + 25, YB, 'EQUIP-HIDDEN');
  a.log('Added the spoked wheels with tyres, frame tubes, fork, stem and handlebar, saddle, chainring, cranks and pedals, kickstand and ' + (k === 'long' ? 'an extended rear deck with side bags, foot boards and a child grab rail' : k === 'box' ? 'a front cargo box with side walls, a bench and a long steering linkage' : 'a front cargo box on two steered front wheels') + ' (plan and 3D).');
}

/** a standing electric kick scooter: deck with battery, two wheels, folding stem, handlebar, lamp, mudguard, kickstand. */
function kick(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, R = v.R, tw = v.tw, zc = Z0 + R, fy = YF + R + 25, ry = YB - R - 25, dz = Z0 + v.deck;
  for (const y of [fy, ry]) { a.tube([[cx - tw / 2, y, zc], [cx - tw * 0.42, y, zc], [cx + tw * 0.42, y, zc], [cx + tw / 2, y, zc]], [R * 0.82, R, R, R * 0.82], 16); a.xcyl(cx - tw * 0.4, cx + tw * 0.4, y, zc, R * 0.62, 12); a.xcyl(cx - 52, cx + 52, y, zc, 14, 8); a.rect(cx - tw / 2, y - R, cx + tw / 2, y + R, 'EQUIP-DETAIL'); }
  for (const s of [-1, 1]) { a.tube([[cx + s * (tw / 2 + 12), fy, zc], [cx + s * 34, fy + 40, dz + 20]], [12, 12], 6); a.tube([[cx + s * (tw / 2 + 12), ry, zc], [cx + s * 40, ry - 50, dz + 20]], [12, 12], 6); }
  const dy0 = fy + 90, dy1 = ry + 10, dw = v.dw; a.box(cx - dw / 2, dy0, dz, cx + dw / 2, dy1, dz + 40); a.box(cx - dw / 2 + 8, dy0 + 30, dz + 40, cx + dw / 2 - 8, dy1 - 30, dz + 52);
  a.box(cx - dw / 2 + 20, dy0 + 90, dz - v.bat, cx + dw / 2 - 20, dy1 - 260, dz); for (let q = 0; q < 5; q++) a.box(cx - dw / 2 + 24, dy0 + 120 + q * 90, dz + 52, cx + dw / 2 - 24, dy0 + 140 + q * 90, dz + 58);
  { const pts = []; for (let q = -2; q <= 4; q++) { const t = q * 0.35; pts.push([cx, ry + m.sin(t) * (R + 22), zc + m.cos(t) * (R + 22)]); } a.tube(pts, pts.map(() => 20), 6); }
  a.box(cx - 40, YB - 10, dz + 60, cx + 40, YB, dz + 120);
  const sx = [cx, fy + 40, dz + 30], sz = Z0 + v.stem; a.cyl(cx, sx[1] - 20, dz + 20, dz + 130, 34, 10);
  a.tube([[sx[0], sx[1], sx[2]], [cx, fy + 10, sz]], [18, 15], 8); a.box(cx - 26, fy - 18, dz + 150, cx + 26, fy + 22, dz + 215);
  a.tube([[cx - v.bw, fy - 10, sz + 5], [cx, fy - 5, sz + 10], [cx + v.bw, fy - 10, sz + 5]], [13, 13, 13], 6);
  for (const s of [-1, 1]) { a.xcyl(cx + s * (v.bw - 60) - (s > 0 ? 0 : 80), cx + s * (v.bw - 60) + (s > 0 ? 80 : 0), fy - 10, sz + 5, 17, 8); a.box(cx + s * (v.bw * 0.6) - 25, fy - 40, sz + 12, cx + s * (v.bw * 0.6) + 25, fy + 20, sz + 80); }
  a.box(cx - 60, fy - 38, sz - 70, cx + 60, fy + 12, sz - 15); a.ell(cx, fy - 52, sz + 70, 30, 14, 30, 8, 5);
  a.tube([[cx - 150, dy1 - 340, dz + 30], [cx - 215, dy1 - 330, Z0 + 16]], [8, 8], 4);
  a.outline('EQUIP-DETAIL'); a.rect(cx - dw / 2, dy0, cx + dw / 2, dy1, 'EQUIP'); a.line(cx, fy, cx, ry, 'EQUIP-DETAIL');
  a.log('Added two wheels with tyres and hubs, a ribbed deck with battery pack underneath, folding stem with latch, handlebar with grips, headlamp, mudguard with tail lamp and kickstand (plan and 3D).');
}

/** a recovery truck: cab-over cab, chassis, axles and either a tilting flat bed with winch or a boom with outriggers. */
function recovery(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, hw = W / 2 - 70, gz = Z0, r = 480, tw = 290, ch = Z0 + 2850, fz = gz + 1100;
  truckCab(a, { hw, gz, cl: 1500, ch });
  prismX(a, [[YF + 700, ch], [YF + 1500, ch], [YF + 1500, ch + 100], [YF + 800, ch + 130]], cx - hw * 0.7, cx + hw * 0.7);
  const rear = v.rear.map((o) => YB - o), yf = YF + 700;
  for (const s of [-1, 1]) a.box(cx + s * hw * 0.5 - 50, YF + 1300, gz + 620, cx + s * hw * 0.5 + 50, YB - 60, gz + 800);
  for (const y of [yf, ...rear]) { for (const s of [-1, 1]) { whl(a, cx + s * (hw - tw * 0.45), y, r, tw); if (y !== yf) whl(a, cx + s * (hw - tw * 1.45), y, r, tw, { plain: true }); } a.xcyl(cx - hw + tw, cx + hw - tw, y, gz + r, 55, 8); }
  for (const s of [-1, 1]) for (const y of rear) a.box(cx + s * (hw - 10) - (s > 0 ? 0 : 20), y + 400, gz + 140, cx + s * (hw - 10) + (s > 0 ? 20 : 0), y + 440, gz + 700);
  const b0 = YF + 1560, b1 = YB;
  if (v.kind === 'tilt') {
    const tilt = b1 - 1900;
    a.box(cx - hw, b0, gz + 800, cx + hw, tilt, fz); for (const s of [-1, 1]) a.box(cx + s * hw - (s > 0 ? 50 : 0), b0, fz, cx + s * hw + (s > 0 ? 0 : 50), tilt, fz + 130);
    prismX(a, [[tilt, fz - 200], [b1 - 120, gz + 520], [b1, gz + 520], [b1, gz + 620], [b1 - 120, gz + 640], [tilt, fz]], cx - hw, cx + hw);
    for (const s of [-1, 1]) { a.box(cx + s * hw - 30, b1 - 1900, gz + 560, cx + s * hw + 30, b1, gz + 700); a.tube([[cx + s * hw * 0.5, tilt + 500, gz + 800], [cx + s * hw * 0.5, tilt + 200, fz - 60]], [50, 50], 8); }
    for (let i = 1; i < 14; i++) { const y = tilt + (b1 - tilt) * (i / 14); a.box(cx - hw * 0.9, y - 8, gz + 560, cx + hw * 0.9, y + 8, gz + 600); }
    a.frame(cx - hw, fz, cx + hw, fz + 1350, b0, b0 + 40, 44); a.box(cx - hw, b0, fz, cx + hw, b0 + 40, fz + 500); for (const x of [-0.6, -0.2, 0.2, 0.6]) a.box(cx + x * hw - 15, b0 + 10, fz + 500, cx + x * hw + 15, b0 + 30, fz + 1350);
    a.ycyl(b0 + 120, b0 + 760, cx, fz + 160, 130, 14); a.box(cx - hw * 0.4, b0 + 60, fz + 40, cx + hw * 0.4, b0 + 160, fz + 300);
    for (const s of [-1, 1]) a.box(cx + s * hw * 0.5 - 90, b0 + 60, fz + 1350, cx + s * hw * 0.5 + 90, b0 + 160, fz + 1420);
    a.ell(cx, b0 + 50, fz + 1500, 380, 40, 45, 12, 6); a.rect(cx - hw, b0, cx + hw, b1, 'EQUIP'); a.line(cx - hw, tilt, cx + hw, tilt, 'EQUIP-DETAIL');
    a.log('Added the cab-over cab, chassis, axles with dual wheels, tilting flat bed with a sloping tail section and rails, winch drum, headboard frame with roof light bar and tilt rams (plan and 3D).');
  } else {
    a.box(cx - hw, b0, gz + 800, cx + hw, b1 - 200, fz - 80);
    for (const s of [-1, 1]) { a.box(cx + s * hw - (s > 0 ? 30 : 0), b0 + 100, fz - 80, cx + s * hw + (s > 0 ? 0 : 30), b0 + 1700, fz + 480); a.box(cx + s * hw - (s > 0 ? 30 : 0), b0 + 100, fz + 480, cx + s * hw + (s > 0 ? 0 : 30), b0 + 1700, fz + 530); for (let i = 0; i < 3; i++) a.box(cx + s * hw - (s > 0 ? 8 : 0) - 0, b0 + 150 + i * 520, fz + 40, cx + s * hw + (s > 0 ? 8 : 0), b0 + 600 + i * 520, fz + 440); }
    const px = cx, py = b0 + 1400;
    a.box(cx - hw * 0.8, b0 + 1000, fz - 80, cx + hw * 0.8, b1 - 200, fz + 40);
    a.ycyl(b0 + 260, b0 + 900, cx, fz + 200, 190, 14); a.box(cx - hw * 0.45, b0 + 150, fz - 80, cx + hw * 0.45, b0 + 990, fz + 60);
    for (const s of [-1, 1]) { a.tube([[cx + s * 140, py - 300, fz + 40], [cx + s * 140, py + 700, fz + 1500]], [100, 90], 10); a.tube([[cx + s * 140, py + 600, fz + 1380], [cx + s * 140, py + 1300, fz + 2000]], [70, 70], 10); }
    a.tube([[cx - 140, py - 300, fz + 40], [cx + 140, py - 300, fz + 40]], [90, 90], 8); a.tube([[cx, py + 1300, fz + 2000], [cx, py + 1300, fz + 1100]], [9, 9], 4); a.box(cx - 70, py + 1250, fz + 960, cx + 70, py + 1350, fz + 1100);
    a.tube([[cx, py - 100, fz + 150], [cx, py + 800, fz + 1650]], [30, 30], 6);
    for (const s of [-1, 1]) { a.box(cx + s * hw * 0.95 - 170, b1 - 700, gz + 700, cx + s * hw * 0.95 + 170, b1 - 100, gz + 800); a.tube([[cx + s * hw * 0.95, b1 - 400, gz + 700], [cx + s * (hw + 0), b1 - 400, gz + 90]], [50, 50], 8); a.box(cx + s * hw * 0.95 - 160, b1 - 560, gz, cx + s * hw * 0.95 + 160, b1 - 240, gz + 50); }
    a.tube([[cx - 480, b1 - 30, gz + 460], [cx + 480, b1 - 30, gz + 460]], [45, 45], 8); for (const s of [-1, 1]) a.tube([[cx + s * 480, b1 - 30, gz + 460], [cx + s * 300, b1 - 600, gz + 700]], [40, 40], 8);
    a.rect(cx - hw, b0, cx + hw, b1, 'EQUIP'); a.circ(cx, py - 300, 140, 'EQUIP-DETAIL');
    a.log('Added the cab-over cab, chassis, axles with dual wheels, side tool lockers, a heavy winch, a two-stage boom on a slewing base with hook block, rear outriggers and an underlift beam (plan and 3D).');
  }
  a.box(cx - hw * 0.9, YF + 14, Z0 + 140, cx + hw * 0.9, YF + 90, Z0 + 330);
  for (const s of [-1, 1]) a.box(cx + s * hw * 0.8 - 70, YB - 14, gz + 300, cx + s * hw * 0.8 + 70, YB, gz + 420);
}

/** a trail, adventure or sport motorcycle: the round-6 motorbike with the extras that make each class (guards, panniers, fairing). */
function moto2(a, v) {
  moto(a, v);
  const { YF, YB, Z0, Z1, cx, W, H } = a, wr = v.wr, fy = YF + wr + 30, ry = fy + v.wb, hz = Z0 + H * 0.6, hy = fy + 200, k = v.cls;
  if (k === 'trail') {
    for (const s of [-1, 1]) { a.box(cx + s * 420 - 20, hy + 10, hz + 200, cx + s * 420 + 20, hy + 150, hz + 330); a.tube([[cx + s * 360, hy + 20, hz + 200], [cx + s * 420, hy + 80, hz + 250]], [8, 8], 4); }
    a.box(cx - 150, fy + 360, Z0 + wr * 1.1, cx + 150, fy + 620, Z0 + wr * 1.1 + 20); a.box(cx - 90, hy - 190, hz - 160, cx + 90, hy - 40, hz + 120);
    a.rect(cx - 150, fy + 360, cx + 150, fy + 620, 'EQUIP-DETAIL');
  } else if (k === 'adventure') {
    prismX(a, [[hy - 30, hz + 180], [hy + 60, hz + 180], [hy + 140, hz + 480], [hy + 100, hz + 490]], cx - 160, cx + 160);
    for (const s of [-1, 1]) { a.box(cx + s * 230 - 120, ry - 80, Z0 + wr * 1.1, cx + s * 230 + 120, ry + 520, Z0 + wr * 1.1 + 330); a.tube([[cx + s * 140, ry - 250, Z0 + wr * 1.1 + 160], [cx + s * 230, ry - 80, Z0 + wr * 1.1 + 160]], [12, 12], 5); a.tube([[cx + s * 190, hy + 160, Z0 + H * 0.42], [cx + s * 190, hy + 320, Z0 + H * 0.34], [cx + s * 190, hy + 480, Z0 + H * 0.42]], [14, 14, 14], 6); }
    a.box(cx - 170, ry + 120, Z0 + wr * 1.1 + 280, cx + 170, ry + 560, Z0 + wr * 1.1 + 540);
  } else {
    sup(a, [{ y: hy - 130, x: cx, rx: 110, z0: hz - 40, z1: hz + 150 }, { y: hy - 20, x: cx, rx: 210, z0: hz - 150, z1: hz + 280 }, { y: hy + 260, x: cx, rx: 230, z0: Z0 + H * 0.3, z1: hz + 220 }, { y: hy + 500, x: cx, rx: 200, z0: Z0 + H * 0.3, z1: hz + 80 }], { seg: 12, n: 2.6 });
    prismX(a, [[hy - 10, hz + 220], [hy + 90, hz + 220], [hy + 170, hz + 420], [hy + 120, hz + 430]], cx - 130, cx + 130);
    a.ell(cx, ry + 140, Z0 + H * 0.62, 150, 330, 90, 12, 6);
  }
  a.log('Added the wheels with tyres and spokes, forks, handlebar, frame, engine, tank, seat, swing arm and exhaust, plus ' + { trail: 'hand guards, a front number plate and a bash plate', adventure: 'a windscreen, crash bars, side panniers and a top box', sport: 'a front fairing with screen and a tail cowl' }[k] + ' (plan and 3D).');
}

/** a double-decker bus: boxy two-storey body with two window bands, kerb-side door, stair window, windscreens, axles. */
function dd(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, hw = W / 2 - 90, Y = (f) => YF + D * f, zf = Z0 + H * 0.17;
  const body = [[0.004, 0.95], [0.03, 1], [0.97, 1], [0.996, 0.95]].map(([f, k]) => ({ y: Y(f), x: cx, rx: hw * k, z0: zf + (k < 1 ? 60 : 0), z1: Z1 - (k < 1 ? 70 : 0) }));
  sup(a, body, { seg: 20, n: 6 }); planOf(a, body);
  const bands = [[Z0 + H * 0.31, Z0 + H * 0.5], [Z0 + H * 0.68, Z0 + H * 0.88]], nb = v.bays;
  for (const s of [-1, 1]) {
    const xa = cx + s * (hw - 4), xb = cx + s * (hw + 14);
    for (const [w0, w1] of bands) { a.box(xa, Y(0.05), w1, xb, Y(0.96), w1 + 28); a.box(xa, Y(0.05), w0 - 28, xb, Y(0.96), w0);
      for (let i = 0; i < nb; i++) { const f0 = lerp(0.16, 0.95, i / nb), f1 = lerp(0.16, 0.95, (i + 1) / nb); if (s > 0 && w0 < Z0 + H * 0.5 && v.doorAt.some(([d0, d1]) => f1 > d0 && f0 < d1)) continue; a.box(xa, Y(f0) + 20, w0 + 14, xb, Y(f1) - 20, w1 - 14); a.line(cx + s * hw, Y(f1), cx + s * (hw - 90), Y(f1), 'EQUIP-DETAIL'); } }
    a.box(xa, Y(0.05), Z0 + H * 0.5 + 28, xb, Y(0.96), Z0 + H * 0.68 - 28);
    a.box(xa, Y(0.05), zf - 10, xb, Y(0.96), zf + 40);
  }
  { const [d0, d1] = v.doorAt[0], dm = (d0 + d1) / 2, xa = cx + hw - 4, xb = cx + hw + 14;
    a.box(xa, Y(d0), zf + 40, xb, Y(d0) + 26, Z0 + H * 0.5 + 28); a.box(xa, Y(d1) - 26, zf + 40, xb, Y(d1), Z0 + H * 0.5 + 28);
    for (const [g0, g1] of [[d0 + 0.004, dm - 0.003], [dm + 0.003, d1 - 0.004]]) { a.box(xa, Y(g0) + 20, zf + 60, xb, Y(g1) - 20, Z0 + H * 0.5); a.box(xa, Y(g0) + 20, zf + 60, xb + 12, Y(g1) - 20, zf + 84); }
    a.rect(cx + hw - 40, Y(d0), cx + hw + 20, Y(d1), 'EQUIP-DETAIL'); }
  const fy = Y(0.004);
  a.frame(cx - hw * 0.88, Z0 + H * 0.31, cx + hw * 0.88, Z0 + H * 0.5, fy - 12, fy + 20, 40); a.box(cx - 25, fy - 12, Z0 + H * 0.31, cx + 25, fy + 20, Z0 + H * 0.5);
  a.frame(cx - hw * 0.88, Z0 + H * 0.68, cx + hw * 0.88, Z0 + H * 0.88, fy - 12, fy + 20, 36); a.box(cx - hw * 0.5, fy - 12, Z0 + H * 0.5 + 30, cx + hw * 0.5, fy + 20, Z0 + H * 0.64);
  roadDetails(a, { hw: hw * 1.02, zb: zf - 60, bh: H * 0.1, zl: Z0 + H * 0.24, zl2: Z0 + H * 0.24, yMir: Y(0.012), zMir: Z0 + H * 0.42 });
  for (const s of [-1, 1]) a.tube([[cx + s * 100, fy - 10, Z0 + H * 0.34], [cx + s * 560, fy - 10, Z0 + H * 0.42]], [9, 9], 4);
  const r = 520, tw = 290;
  for (const s of [-1, 1]) { whl(a, cx + s * (hw - tw * 0.3), Y(v.axles[0]), r, tw); for (const f of v.axles.slice(1)) { whl(a, cx + s * (hw - tw * 0.3), Y(f), r, tw); whl(a, cx + s * (hw - tw * 1.2), Y(f), r, tw, { plain: true }); } }
  for (let q = 0; q < 2; q++) a.box(cx - 200, Y(0.3 + q * 0.4), Z1 - 30, cx + 200, Y(0.3 + q * 0.4) + 400, Z1);
  a.rect(cx - hw, YF, cx + hw, YB, 'EQUIP-DETAIL'); a.line(cx, Y(0.02), cx, Y(0.98), 'EQUIP-HIDDEN');
  a.log('Added the two-storey boxy body with lower and upper window bands, pillars, kerb-side double door, front screens with destination sign, roof pods, mirrors, lamps, bumpers and ' + v.axles.length + ' axles with wheels (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ round 7 workshop
/** a tyre standing on its tread (axis x) at (x, y, zc): outer radius R, width w. */
function tyreX(a, x, y, R, w, n = 20, zb = a.Z0) { const zc = zb + R; const r = w * 0.5, RR = R - r; ring3(a, x, y, zc, RR, r, n, 'x'); a.xcyl(x - w * 0.46, x + w * 0.46, y, zc, RR - r * 0.35, 12); a.xcyl(x - w * 0.4, x + w * 0.4, y, zc, R * 0.28, 8); }
/** a tyre of outer radius R lying flat (axis z) with its lower face at z0 */
function tyreZ(a, x, y, z0, R, w, n = 14) { const r = w * 0.5, RR = R - r; ring3(a, x, y, z0 + r, RR, r, n, 'z'); a.cyl(x, y, z0 + w * 0.08, z0 + w * 0.92, RR - r * 0.35, 12); }

/** a roller tool cabinet with drawers, side handles, casters and an optional top chest */
function toolchest(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, cas = 110, bz = Z0 + cas;
  const chH = v.chest ? H * 0.34 : 0, top = Z1 - chH, rows = v.rows;
  for (const [x, y] of [[X0 + 55, YF + 55], [X1 - 55, YF + 55], [X0 + 55, YB - 55], [X1 - 55, YB - 55]]) { a.caster(x, y, cas); a.circ(x, y, 24, 'EQUIP-HIDDEN'); }
  a.box(X0 + 10, YF + 10, bz, X1 - 10, YB - 10, top - 36); a.box(X0, YF, top - 36, X1, YB, top);
  a.box(X0 + 14, YF, bz + 8, X1 - 14, YF + 10, top - 40);
  const hz = top - 36 - bz - 20, ws = Array.from({ length: rows }, (_, i) => 1 + (rows - 1 - i) * (v.taper ?? 0.28) / Math.max(1, rows - 1) * 1 + (i === rows - 1 ? 0.15 : 0)), tw = ws.reduce((s, q) => s + q, 0);
  let z = top - 44;
  for (let i = 0; i < rows; i++) { const h = (hz * ws[i]) / tw - 6; a.box(X0 + 18, YF - 16, z - h, X1 - 18, YF + 4, z); a.box(X0 + W * 0.15, YF - 36, z - h / 2 - 9, X1 - W * 0.15, YF - 16, z - h / 2 + 9); for (const s of [-1, 1]) a.box(cx + s * (W * 0.35 - 6) - 7, YF - 36, z - h / 2 - 9, cx + s * (W * 0.35 - 6) + 7, YF - 14, z - h / 2 + 9); a.line(X0 + 18, YF, X1 - 18, YF, 'EQUIP-DETAIL'); z -= h + 6; }
  a.cyl(X1 - 55, YF - 6, top - 120, top - 70, 0.1, 3); a.ycyl(YF - 12, YF, X1 - 50, top - 80, 14, 8);
  for (const s of [-1, 1]) { const x = s > 0 ? X1 : X0; a.tube([[x + s * 6, YF + 70, top - 130], [x + s * 46, YF + 70, top - 120], [x + s * 46, YB - 70, top - 120], [x + s * 6, YB - 70, top - 130]], [10, 10, 10, 10], 6); }
  a.box(X0 + 4, YF + 4, top, X1 - 4, YB - 4, top + 8);
  if (v.chest) {
    const c0 = top + 8, c1 = Z1 - 36; a.box(X0 + 20, YF + 24, c0, X1 - 20, YB - 40, c1); a.box(X0 + 10, YF + 14, c1, X1 - 10, YB - 30, Z1);
    const n = v.chest, ch = (c1 - c0 - 30) / n; for (let i = 0; i < n; i++) { const zz = c1 - 10 - i * ch; a.box(X0 + 30, YF + 8, zz - ch + 8, X1 - 30, YF + 28, zz); a.box(X0 + W * 0.2, YF - 8, zz - ch / 2 - 7, X1 - W * 0.2, YF + 8, zz - ch / 2 + 7); }
    a.box(cx - 60, YF + 6, c1 + 6, cx + 60, YF + 18, c1 + 30); for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 25, YB - 40, c1 + 2, cx + s * W * 0.4 + 25, YB - 28, c1 + 30);
    a.rect(X0 + 10, YF + 14, X1 - 10, YB - 30, 'EQUIP-DETAIL');
  }
  a.outline(); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-HIDDEN');
  a.log('Added the carcass on four casters with a top plate, ' + rows + ' graded drawer fronts with full-width handles and a lock' + (v.chest ? ', plus a top chest with ' + v.chest + ' drawers, a hinged lid and a latch' : '') + ', and side carry handles (plan and 3D).');
}

/** a garage workbench: timber top on steel posts, lower shelf, back pegboard with hooks, drawer unit, bench vice(s), strip light */
function garagebench(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, YG = YF + 170, tz = Z0 + 910, tt = 44;
  for (const x of [X0 + 40, X1 - 40]) for (const y of [YG + 40, YB - 40]) { a.box(x - 30, y - 30, Z0, x + 30, y + 30, tz); a.box(x - 40, y - 40, Z0, x + 40, y + 40, Z0 + 10); }
  a.box(X0 + 20, YG + 40, tz - 150, X1 - 20, YG + 55, tz - 40); a.box(X0 + 20, YB - 55, tz - 150, X1 - 20, YB - 40, tz - 40);
  for (const x of [X0 + 40, X1 - 40]) a.box(x - 20, YG + 40, tz - 150, x + 20, YB - 40, tz - 130);
  a.box(X0 + 15, YG + 20, Z0 + 150, X1 - 15, YB - 20, Z0 + 190); a.box(X0 + 15, YG + 20, Z0 + 190, X1 - 15, YG + 30, Z0 + 230);
  a.box(X0, YG, tz, X1, YB - 30, tz + tt); a.box(X0, YG, tz + tt - 12, X1, YG + 20, tz + tt);
  if (v.drawers) { const dw = W * 0.24, x1 = X1 - 90, x0 = x1 - dw; a.box(x0, YG + 60, tz - 460, x1, YB - 60, tz); for (let i = 0; i < v.drawers; i++) { const z = tz - 8 - i * (440 / v.drawers); a.box(x0 + 8, YG + 36, z - 440 / v.drawers + 8, x1 - 8, YG + 62, z); a.box(x0 + dw * 0.2, YG + 20, z - 220 / v.drawers - 7, x1 - dw * 0.2, YG + 38, z - 220 / v.drawers + 7); } a.rect(x0, YG + 60, x1, YB - 60, 'EQUIP-DETAIL'); }
  const pb = tz + tt + 50, pt = Z1 - 40; a.box(X0 + 10, YB - 30, tz + tt, X1 - 10, YB - 20, Z1 - 30); a.frame(X0 + 6, tz + tt, X1 - 6, Z1 - 30, YB - 34, YB - 16, 22);
  for (let r = 0; r < 4; r++) for (let c = 0; c < Math.floor(W / 150); c++) { const x = X0 + 120 + c * 150 + (r % 2) * 70, z = pb + r * 130; if (x > X1 - 80 || z > pt - 40) continue; a.tube([[x, YB - 20, z], [x, YB - 52, z], [x, YB - 66, z + 28]], [4, 4, 4], 4); if (c % 2 === 0) a.box(x - 60, YB - 76, z + 4, x + 60, YB - 62, z + 22); }
  a.box(X0 + 40, YB - 24, Z1 - 30, X1 - 40, YB - 4, Z1); a.box(X0 + 10, YB - 24, Z1 - 70, X1 - 10, YB - 44, Z1 - 30); for (let i = 0; i < Math.floor(W / 300); i++) a.box(X0 + 60 + i * 280, YB - 70, Z1 - 66, X0 + 300 + i * 280, YB - 46, Z1 - 40);
  for (let k = 0; k < v.vises; k++) { const x = v.vises === 1 ? X0 + W * 0.18 : X0 + W * (k ? 0.14 : 0.8) * (k ? 1 : 0.9) + 0; const vx = k ? X0 + 220 : X0 + W * 0.18 + (v.vises === 1 ? 0 : 400); a.box(vx - 80, YG + 20, tz + tt, vx + 80, YG + 150, tz + tt + 30); a.box(vx - 70, YG + 16, tz + tt + 30, vx + 70, YG + 60, tz + tt + 130); a.box(vx - 70, YG - 36, tz + tt + 30, vx + 70, YG + 10, tz + tt + 130); a.tube([[vx, YG + 4, tz + tt + 70], [vx, YG - 160, tz + tt + 70]], [11, 11], 6); a.tube([[vx - 80, YG - 160, tz + tt + 70], [vx + 80, YG - 160, tz + tt + 70]], [7, 7], 5); a.rect(vx - 80, YG - 36, vx + 80, YG + 150, 'EQUIP-DETAIL'); }
  a.outline(); a.rect(X0 + 15, YG + 20, X1 - 15, YB - 20, 'EQUIP-HIDDEN');
  a.log('Added the steel posts with foot plates, rails, timber top with a front lip, lower shelf, back pegboard with hooks and tool rails, a strip light' + (v.drawers ? ', a ' + v.drawers + '-drawer unit' : '') + ' and ' + v.vises + (v.vises > 1 ? ' bench vices' : ' bench vice') + ' with screw and handle (plan and 3D).');
}

/** an engine stand: H-frame base on casters, mast, rotating head plate with four adjustable arms, worm gear box and hand wheel */
function enginestand(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cas = 90, bz = Z0 + cas, hz = Z0 + H * 0.78;
  for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 55); a.box(x - 35, YF + 30, bz, x + 35, YB - 30, bz + 70); a.tube([[x, YF + 55, bz + 35], [x, YF + 55, bz]], [8, 8], 4); for (const y of [YF + 55, YB - 55]) a.caster(x, y, cas); }
  a.box(X0 + 70, cy - 40, bz, X1 - 70, cy + 40, bz + 90); a.box(cx - 70, cy - 70, bz + 90, cx + 70, cy + 70, bz + 120);
  a.box(cx - 55, cy - 55, bz + 120, cx + 55, cy + 55, hz - 40);
  for (const s of [-1, 1]) a.tube([[cx + s * (W / 2 - 55), cy - 30, bz + 70], [cx + s * 45, cy - 40, bz + 330]], [14, 14], 6);
  a.box(cx - 90, cy - 100, hz - 90, cx + 90, cy + 90, hz + 40); a.ycyl(cy - 160, cy - 100, cx, hz - 20, 80, 16); a.cyl(cx, cy - 70, hz - 140, hz - 90, 40, 10); a.tube([[cx, cy - 70, hz - 140], [cx + 180, cy - 70, hz - 140]], [10, 10], 6); a.xcyl(cx + 150, cx + 230, cy - 70, hz - 140, 28, 8);
  a.ycyl(cy - 190, cy - 160, cx, hz - 20, 150, 22); a.ycyl(cy - 210, cy - 190, cx, hz - 20, 70, 14);
  for (let k = 0; k < 4; k++) { const t = (k / 4) * TAU + m.PI / 4, ex = cx + m.cos(t) * H * 0.2, ez = hz - 20 + m.sin(t) * H * 0.2; a.box(m.min(cx, ex) - 20, cy - 232, m.min(hz - 20, ez) - 20, m.max(cx, ex) + 20, cy - 190, m.max(hz - 20, ez) + 20); a.ycyl(cy - 300, cy - 232, ex, ez, 12, 6); a.ycyl(cy - 232, cy - 226, ex, ez, 26, 8); }
  a.outline('EQUIP-HIDDEN'); for (const s of [-1, 1]) a.rect(cx + s * (W / 2 - 55) - 35, YF + 30, cx + s * (W / 2 - 55) + 35, YB - 30, 'EQUIP'); a.rect(X0 + 70, cy - 40, X1 - 70, cy + 40, 'EQUIP'); a.circ(cx, cy - 175, 150, 'EQUIP-DETAIL'); a.rect(cx - 55, cy - 55, cx + 55, cy + 55, 'EQUIP-DETAIL');
  a.log('Added the H-frame base with four casters, the mast with gussets, the rotating head plate with four adjustable mounting arms and bolts, the worm gear box with hand wheel and the cross beam (plan and 3D).');
}

/** a low transmission jack: rail base on casters, telescoping column, tilting saddle with chain, foot pedal and pump handle */
function transjack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cas = 70, bz = Z0 + cas, sz = Z0 + v.lift;
  for (const s of [-1, 1]) { a.box(cx + s * (W / 2 - 60) - 30, YF + 20, bz, cx + s * (W / 2 - 60) + 30, YB - 20, bz + 60); for (const y of [YF + 50, YB - 50]) a.caster(cx + s * (W / 2 - 60), y, cas); }
  a.box(X0 + 60, YB - 220, bz, X1 - 60, YB - 100, bz + 60); a.box(X0 + 60, YF + 160, bz, X1 - 60, YF + 260, bz + 50);
  const cb = YB - 160; a.box(cx - 90, cb - 90, bz + 60, cx + 90, cb + 90, bz + (sz - bz) * 0.45); a.box(cx - 70, cb - 70, bz + (sz - bz) * 0.4, cx + 70, cb + 70, sz - 60);
  a.box(cx - 90, cb - 90, bz + 60, cx + 90, cb - 80, sz - 80); a.cyl(cx, cb, sz - 60, sz - 30, 90, 16);
  a.box(cx - W * 0.3, cb - 160, sz - 30, cx + W * 0.3, cb + 160, sz - 10); a.cyl(cx, cb, sz - 10, sz + 6, W * 0.32, 22); for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.box(cx + dx * W * 0.26 - 24, cb + dy * 130 - 24, sz + 6, cx + dx * W * 0.26 + 24, cb + dy * 130 + 24, sz + 30);
  a.tube([[cx - W * 0.28, cb - 100, sz + 20], [cx, cb, sz + 40], [cx + W * 0.28, cb - 100, sz + 20]], [5, 5, 5], 4); a.ycyl(cb - 40, cb + 40, cx, sz + 28, 10, 6);
  a.box(cx - 120, YF + 80, bz + 50, cx + 120, YF + 250, bz + 78); a.tube([[cx, YF + 200, bz + 78], [cx, cb - 130, bz + 220]], [14, 14], 6);
  a.tube([[cx + W * 0.32, YB - 150, bz + 30], [cx + W * 0.4, YB - 20, bz + 330]], [12, 12], 6); a.ycyl(YB - 50, YB - 10, cx + W * 0.4, bz + 330, 20, 8);
  a.cyl(cx + W * 0.32, YB - 150, bz + 30, bz + 90, 30, 10);
  a.outline(); a.circ(cx, cb, W * 0.32, 'EQUIP-DETAIL'); a.rect(cx - W * 0.3, cb - 160, cx + W * 0.3, cb + 160, 'EQUIP-DETAIL'); a.rect(cx - 120, YF + 80, cx + 120, YF + 250, 'EQUIP-DETAIL');
  a.log('Added the two rails with four casters, cross members, the telescoping column and ram, the tilting round saddle with four fixed pads and a retaining chain, the foot pedal with linkage, the pump handle and release valve (plan and 3D).');
}

/** a mobile oil drain: tank on casters, telescoping pole, funnel bowl with grate, handle, drain hose and gauge */
function oildrain(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cas = 70, R = W * 0.4, tz = Z0 + cas + H * 0.4;
  a.cyl(cx, cy + D * 0.08, Z0 + cas, tz, R, 28); a.cyl(cx, cy + D * 0.08, tz, tz + 14, R + 6, 28); a.cyl(cx, cy + D * 0.08, Z0 + cas, Z0 + cas + 14, R + 6, 28);
  for (const [x, y] of [[cx - W * 0.4, YF + D * 0.18], [cx + W * 0.4, YF + D * 0.18], [cx - W * 0.4, YB - 30], [cx + W * 0.4, YB - 30]]) { a.caster(x, y, cas); a.circ(x, y, 22, 'EQUIP-HIDDEN'); }
  a.box(X0 + 50, cy - D * 0.2, Z0 + cas - 20, X1 - 50, cy + D * 0.4, Z0 + cas); 
  const py = cy + D * 0.08; a.cyl(cx, py, tz + 14, Z1 - H * 0.2, 28, 10); a.cyl(cx, py, tz + 14, tz + 14 + (Z1 - H * 0.2 - tz) * 0.5, 36, 10);
  const bz = Z1 - H * 0.2; a.cone(cx, py, bz, Z1 - H * 0.04, W * 0.12, W * 0.46, 24); a.cyl(cx, py, Z1 - H * 0.04, Z1, W * 0.47, 24);
  for (let k = -2; k <= 2; k++) a.box(cx + k * W * 0.16 - 6, py - W * 0.4, Z1 - H * 0.06, cx + k * W * 0.16 + 6, py + W * 0.4, Z1 - H * 0.03);
  a.tube([[cx - W * 0.35, YB - 28, Z0 + cas + H * 0.1], [cx - W * 0.35, YB - 28, Z0 + H * 0.74], [cx + W * 0.35, YB - 28, Z0 + H * 0.74], [cx + W * 0.35, YB - 28, Z0 + cas + H * 0.1]], [11, 11, 11, 11], 6);
  a.tube([[cx + R, py, Z0 + cas + 60], [cx + R + 50, py - 40, Z0 + cas + 20], [cx + R + 30, YF + 30, Z0 + cas + 30]], [14, 14, 14], 6); a.cyl(cx + R * 0.55, py - R * 0.8, tz + 14, tz + 50, 22, 10); a.ycyl(py - R - 10, py - R, cx - R * 0.5, tz - H * 0.1, 32, 14);
  a.outline('EQUIP-HIDDEN'); a.circ(cx, py, R, 'EQUIP'); a.circ(cx, py, W * 0.46, 'EQUIP-DETAIL'); a.circ(cx, py, 28, 'EQUIP-DETAIL');
  a.log('Added the cylindrical tank on a base frame with four casters, a telescoping pole carrying the funnel bowl with a grate, the push handle, the drain hose with a nozzle, a gauge and a filler cap (plan and 3D).');
}

/** a tyre rack: end frames, tier rails and tyres standing on their treads; free-standing or wall-mounted */
function tyrerack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.R, tw = v.tw, pitch = tw + 30, tz0 = Z0 + 140, tierH = R * 2 + 120;
  for (let t = 0; t < v.tiers; t++) {
    const z = tz0 + t * tierH, x0 = cx - (pitch * v.per) / 2 + 20;
    for (const y of [cy - R * 0.55, cy + R * 0.55]) a.box(X0 + 70, y - 25, z - 20, X1 - 70, y + 25, z + 20);
    for (let k = 0; k < v.per; k++) { const x = x0 + pitch * (k + 0.5) - 10; tyreX(a, x, cy, R, tw, 14, z + 20); }
    a.box(X0 + 70, cy - R * 0.55 - 25, z + 20, X0 + 94, cy + R * 0.55 + 25, z + 30);
  }
  const hz = Z1 - 6;
  for (const x of [X0 + 50, X1 - 50]) { a.box(x - 25, cy - D * 0.45, Z0, x + 25, cy - D * 0.45 + 50, hz); a.box(x - 25, cy + D * 0.45 - 50, Z0, x + 25, cy + D * 0.45, hz); a.box(x - 25, cy - D * 0.45, Z0, x + 25, cy + D * 0.45, Z0 + 40); a.box(x - 25, cy - D * 0.45, tz0 - 40, x + 25, cy + D * 0.45, tz0 - 20); for (let t = 1; t < v.tiers; t++) a.box(x - 25, cy - D * 0.45, tz0 + t * tierH - 40, x + 25, cy + D * 0.45, tz0 + t * tierH - 20); a.box(x - 25, cy - D * 0.45, hz - 40, x + 25, cy + D * 0.45, hz); }
  if (v.wall) a.box(X0 + 10, YB - 24, Z0 + 20, X1 - 10, YB - 4, hz - 20); else for (const t of [0, 1]) a.tube([[X0 + 50, cy - D * 0.45 + 25, Z0 + 40], [X1 - 50, cy + D * 0.45 - 25, hz - 60]], [10, 10], 5);
  a.outline(); for (const y of [cy - R * 0.55, cy + R * 0.55]) a.rect(X0 + 70, y - 25, X1 - 70, y + 25, 'EQUIP-DETAIL'); for (let k = 0; k < v.per; k++) a.rect(cx - (pitch * v.per) / 2 + 20 + pitch * k + 10, cy - R, cx - (pitch * v.per) / 2 + 20 + pitch * (k + 1) - 20, cy + R, 'EQUIP-HIDDEN');
  a.log('Added the end frames with feet, ' + v.tiers + ' tier' + (v.tiers > 1 ? 's' : '') + ' of paired rails, ' + v.tiers * v.per + ' tyres standing on their treads on wheel rims' + (v.wall ? ' and the wall mounting plate' : ' and diagonal braces') + ' (plan and 3D).');
}

/** a tyre inflation safety cage: base plate, corner posts, top frame, mesh bars, hinged door with latch, a wheel on a cradle, air chuck on a bracket with hose and gauge */
function tyrecage(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, p = 36, bt = 14;
  a.box(X0, YF, Z0, X1, YB, Z0 + 30);
  for (const x of [X0 + p, X1 - p]) for (const y of [YF + p, YB - p]) a.box(x - p / 2, y - p / 2, Z0 + 30, x + p / 2, y + p / 2, Z1 - 40);
  a.frame(X0 + 10, Z1 - 40, X1 - 10, Z1, YF + 10, YF + 10 + p, p * 0.9); a.frame(X0 + 10, Z1 - 40, X1 - 10, Z1, YB - 10 - p, YB - 10, p * 0.9); a.box(X0 + 10, YF + 10, Z1 - 40, X0 + 10 + p, YB - 10, Z1); a.box(X1 - 10 - p, YF + 10, Z1 - 40, X1 - 10, YB - 10, Z1);
  const nb = v.bars;
  for (let i = 1; i < nb; i++) { const x = X0 + p + ((W - 2 * p) * i) / nb; a.box(x - bt / 2, YB - p / 2 - 3, Z0 + 30, x + bt / 2, YB - p / 2 + 3, Z1 - 40); a.box(x - bt / 2, YF + p / 2 - 3, Z0 + 30, x + bt / 2, YF + p / 2 + 3, Z1 - 40); }
  for (let i = 1; i < nb - 1; i++) { const z = Z0 + 30 + ((H - 70) * i) / nb; a.box(X0 + p / 2, YF + p, z - bt / 2, X0 + p / 2 + 6, YB - p, z + bt / 2); a.box(X1 - p / 2 - 6, YF + p, z - bt / 2, X1 - p / 2, YB - p, z + bt / 2); a.box(X0 + p, YB - p / 2 - 3, z - bt / 2, X1 - p, YB - p / 2 + 3, z + bt / 2); a.box(X0 + p + 0, YF + p / 2 - 3, z - bt / 2, cx - 40, YF + p / 2 + 3, z + bt / 2); }
  for (const z of [Z0 + H * 0.25, Z0 + H * 0.7]) a.box(X0 + p, YF - 14, z - 25, X0 + p + 30, YF + 6, z + 25);
  a.box(cx - 60, YF - 16, Z0 + H * 0.45, cx + 60, YF + 4, Z0 + H * 0.45 + 70);
  const wr = m.min(W, D) * 0.34, wz = Z0 + 30 + wr + 60; a.box(cx - wr * 0.7, cy - 30, Z0 + 30, cx + wr * 0.7, cy + 30, Z0 + 90); a.cyl(cx, cy, Z0 + 90, Z0 + 150, 50, 10);
  tyreX(a, cx, cy, wr, wr * 0.58); a.box(cx - 60, cy - wr * 0.6, Z0 + 60, cx + 60, cy + wr * 0.6, Z0 + 90);
  a.tube([[X1 - p, YB - p - 10, Z1 - 120], [X1 - p - 120, YB - p - 10, Z1 - 160], [X1 - p - 260, cy, wr * 1.1 + Z0 + 40]], [12, 12, 12], 6); a.ycyl(YB - 100, YB - 50, X1 - 8, Z1 - 140, 30, 12);
  a.outline(); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL'); a.line(X0 + p, YF + p / 2, X1 - p, YF + p / 2, 'EQUIP-HIDDEN'); a.arc(X0 + p, YF, W * 0.5, 0, 90, 'EQUIP-SWING');
  a.log('Added the base plate, four corner posts, a top frame, mesh bars on the back and sides, a hinged front door with a latch, a wheel on a cradle and an air chuck on a bracket with hose and gauge (plan and 3D).');
}

/** a battery booster cart: upright battery case on two wheels and two casters, push handle, gauge panel, coiled cables with clamps on hooks */
function boostercart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, wr = v.wr, zc = Z0 + wr;
  for (const s of [-1, 1]) { a.xcyl(cx + s * (W / 2 - 30) - 25, cx + s * (W / 2 - 30) + 25, YB - wr - 30, zc, wr, 18); a.xcyl(cx + s * (W / 2 - 30) - 12, cx + s * (W / 2 - 30) + 12, YB - wr - 30, zc, wr * 0.55, 12); a.caster(cx + s * (W / 2 - 60), YF + 60, 130); }
  a.xcyl(X0 + 30, X1 - 30, YB - wr - 30, zc, 14, 6); a.box(X0 + 50, YF + 40, Z0 + 130, X1 - 50, YB - 40, Z0 + 170);
  a.box(X0 + 60, YF + 60, Z0 + 170, X1 - 60, YB - 60, Z0 + H * 0.62); sup(a, [{ y: YF + 60, x: cx, rx: (W - 120) / 2, z0: Z0 + H * 0.62, z1: Z0 + H * 0.66 }, { y: YB - 60, x: cx, rx: (W - 120) / 2, z0: Z0 + H * 0.62, z1: Z0 + H * 0.66 }], { seg: 8, n: 3 });
  a.box(X0 + 70, YF + 54, Z0 + H * 0.44, X1 - 70, YF + 62, Z0 + H * 0.6); a.ell(cx - W * 0.2, YF + 50, Z0 + H * 0.54, 60, 8, 60, 14, 6); a.ell(cx + W * 0.2, YF + 50, Z0 + H * 0.54, 60, 8, 60, 14, 6); a.box(cx - 60, YF + 52, Z0 + H * 0.46, cx + 60, YF + 62, Z0 + H * 0.5);
  for (const x of [cx - W * 0.28, cx + W * 0.28]) a.cyl(x, YF + 58, Z0 + H * 0.4, Z0 + H * 0.43, 24, 10);
  a.tube([[cx - W * 0.4, YB - 70, Z0 + H * 0.6], [cx - W * 0.4, YB - 70, Z0 + H * 0.97], [cx + W * 0.4, YB - 70, Z0 + H * 0.97], [cx + W * 0.4, YB - 70, Z0 + H * 0.6]], [14, 14, 14, 14], 8); a.xcyl(cx - W * 0.2, cx + W * 0.2, YB - 70, Z0 + H * 0.97, 20, 8);
  for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 10); a.tube([[x, cy, Z0 + H * 0.5], [x + s * 30, cy, Z0 + H * 0.5]], [10, 10], 5); for (let k = 0; k < 5; k++) ring3(a, x + s * 38, cy, Z0 + H * 0.4 - k * 6, H * 0.12, 6, 14, 'x'); a.box(x + s * 34 - 12, YF + 90, Z0 + H * 0.2, x + s * 34 + 12, YF + 170, Z0 + H * 0.28); a.box(x + s * 34 - 12, YF + 180, Z0 + H * 0.2, x + s * 34 + 12, YF + 260, Z0 + H * 0.28); }
  a.outline(); a.rect(X0 + 60, YF + 60, X1 - 60, YB - 60, 'EQUIP-DETAIL');
  a.log('Added the upright battery case on a base tray with two pneumatic wheels and two casters, the push handle, a panel with two gauges and a switch, and coiled leads with clamps resting on hooks (plan and 3D).');
}

/** a pair of drive-on ramps: stepped, ribbed wedges with a top platform and a wheel stop */
function ramps(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, rw = (W - 120) / 2;
  for (const s of [-1, 1]) {
    const xa = s < 0 ? X0 : X1 - rw, xb = xa + rw, ytop = YB - v.top;
    prismX(a, [[YF, Z0], [YB, Z0], [YB, Z1 - 0], [ytop, Z1], [YF, Z0 + 40]], xa, xb);
    for (let k = 1; k < v.ribs; k++) { const f = k / v.ribs, y = YF + (ytop - YF) * f, z = Z0 + 40 + (Z1 - Z0 - 40) * f; a.box(xa - 4, y - 14, z - 6, xa, y + 14, z + 14); a.box(xb, y - 14, z - 6, xb + 4, y + 14, z + 14); a.box(xa + 20, y - 10, z, xb - 20, y + 10, z + 8); }
    a.box(xa, ytop - 20, Z1, xb, ytop + 20, Z1 + 40); a.box(xa, YB - 14, Z0, xb, YB, Z1 - 20); a.box(xa + rw * 0.3, YF - 30, Z0, xa + rw * 0.7, YF, Z0 + 14);
    a.tube([[xa + rw * 0.25, YB - 60, Z1 - 100], [xa + rw * 0.25, YB + 0, Z1 - 100], [xb - rw * 0.25, YB + 0, Z1 - 100], [xb - rw * 0.25, YB - 60, Z1 - 100]].map(([x, y, z]) => [x, m.min(y, YB - 10), z]), [10, 10, 10, 10], 5);
    a.rect(xa, YF, xb, YB); a.line(xa, ytop, xb, ytop, 'EQUIP-DETAIL'); for (let k = 1; k < v.ribs; k++) a.line(xa + 20, YF + (ytop - YF) * (k / v.ribs), xb - 20, YF + (ytop - YF) * (k / v.ribs), 'EQUIP-DETAIL');
  }
  a.log('Added two drive-on wedges with a sloping rib deck and side lips, a flat top platform with a wheel stop, a rear wall with carry handles and non-slip feet (plan and 3D).');
}

/** a paint spray booth room: panel walls, double front doors with vision panels, windows, roof filter plenum, exhaust duct and stack, lights, control cabinet */
function spraybooth(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, wt = 100, fz = Z0 + 60, rh = H * 0.16, rt = Z1 - rh;
  a.box(X0, YF, Z0, X1, YB, fz);
  a.box(X0, YF, fz, X0 + wt, YB, rt); a.box(X1 - wt, YF, fz, X1, YB, rt); a.box(X0 + wt, YB - wt, fz, X1 - wt, YB, rt);
  const dw = W * 0.62, dx0 = cx - dw / 2, dx1 = cx + dw / 2, dh = H * 0.72;
  a.box(X0 + wt, YF, fz, dx0, YF + wt, rt); a.box(dx1, YF, fz, X1 - wt, YF + wt, rt); a.box(dx0, YF, fz + dh, dx1, YF + wt, rt);
  for (const [xa, xb] of [[dx0 + 20, cx - 8], [cx + 8, dx1 - 20]]) { a.frame(xa, fz + 10, xb, fz + dh - 10, YF - 30, YF - 6, 60); a.box(xa + 60, YF - 28, fz + dh * 0.5, xb - 60, YF - 8, fz + dh - 70); a.box(xb - 30, YF - 44, fz + dh * 0.48, xb - 8, YF - 28, fz + dh * 0.52); a.box(xa, YF - 30, fz + 10, xb, YF - 6, fz + dh * 0.3); }
  a.arc(dx0 + 20, YF - 6, (dx1 - dx0) / 2 - 28, 180, 270, 'EQUIP-SWING');
  const nw = v.windows;
  for (const s of [-1, 1]) for (let k = 0; k < nw; k++) { const y = YF + 500 + k * ((D - 1000) / nw); a.frame(s > 0 ? X1 - wt - 6 : X0 - 6, fz + H * 0.38, s > 0 ? X1 + 6 : X0 + wt + 6, fz + H * 0.62, y, y + 560, 40); }
  for (const s of [-1, 1]) for (let k = 0; k < Math.floor(D / 700); k++) { const y = YF + 300 + k * 700; a.box(s > 0 ? X1 + 2 : X0 - 90, y, fz + H * 0.7, s > 0 ? X1 + 90 : X0 - 2, y + 160, fz + H * 0.74); }
  a.box(X0, YF, rt, X1, YB, rt + 80); const cols = m.floor((W - 300) / 360), rows = m.floor((D - 600) / 360);
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) a.box(X0 + 160 + c * 360, YF + 300 + r * 360, rt + 80, X0 + 160 + c * 360 + 330, YF + 300 + r * 360 + 330, rt + 120);
  a.box(X0 + W * 0.2, YF + 100, rt + 120, X1 - W * 0.2, YB - 100, Z1 - 80); for (let k = 0; k < 6; k++) a.box(X0 + W * 0.2 + 10, YF + 100 + (k * (D - 200)) / 6 - 4, Z1 - 80, X1 - W * 0.2 - 10, YF + 100 + (k * (D - 200)) / 6 + 4, Z1 - 60);
  a.box(cx - 400, YB - wt - 700, rt + 80, cx + 400, YB - wt, rt + 130); a.cyl(cx + W * 0.25, YB - 400, rt + 80, Z1 - 20, 300, 20); a.cyl(cx + W * 0.25, YB - 400, Z1 - 20, Z1, 340, 20); a.cyl(cx + W * 0.25, YB - 400, rt + 80, Z1 - 20, 340, 20);
  a.box(X0 - 160, YF + 240, fz + 600, X0 - 4, YF + 600, fz + 1500); a.box(X0 - 150, YF + 250, fz + 1100, X0 - 160, YF + 440, fz + 1400); a.ell(X0 - 150, YF + 330, fz + 1300, 12, 60, 60, 8, 6);
  for (let k = 0; k < Math.floor(D / 600); k++) a.line(X0 + wt, YF + wt + k * 600, X1 - wt, YF + wt + k * 600, 'EQUIP-DETAIL');
  a.outline(); a.rect(X0 + wt, YF + wt, X1 - wt, YB - wt, 'EQUIP-HIDDEN'); a.circ(cx + W * 0.25, YB - 400, 300, 'EQUIP-DETAIL');
  a.log('Added the floor frame, panel walls, the double front doors with vision panels and latches, side windows, wall lights, a roof plenum with filter pads, a rear exhaust duct and stack, and a control cabinet with gauges (plan and 3D).');
}

/** a set of mobile column lifts: 4 or 6 columns each with a base, mast, carriage, fork arms, motor head and a control box */
function columnlifts(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.n, per = n / 2, cw = 300;
  for (const s of [-1, 1]) for (let i = 0; i < per; i++) {
    const x = cx + s * (W / 2 - 220), y = YF + 220 + (i * (D - 440)) / (per - 1), lz = Z0 + v.lift;
    a.box(x - 220, y - 300, Z0, x + 220, y + 300, Z0 + 70); a.box(x - 100, y - 100, Z0 + 70, x + 100, y + 100, Z0 + 600); for (const q of [-1, 1]) a.box(x - 140, y + q * 270 - 40, Z0 + 70, x + 140, y + q * 270 + 40, Z0 + 160);
    a.box(x - cw / 2, y - cw / 2, Z0 + 70, x + cw / 2, y + cw / 2, Z1 - 150); a.box(x - cw / 2 - 20, y - cw / 2 - 20, Z1 - 150, x + cw / 2 + 20, y + cw / 2 + 20, Z1 - 60);
    a.box(x - cw / 2 - 40, y - cw / 2 - 40, lz, x + cw / 2 + 40, y + cw / 2 + 40, lz + 380);
    const dir = -s; a.box(x + (dir > 0 ? cw / 2 + 40 : -cw / 2 - 40 - 500), y - 60, lz + 40, x + (dir > 0 ? cw / 2 + 40 + 500 : -cw / 2 - 40), y + 60, lz + 100); a.box(x + dir * (cw / 2 + 400) - 90, y - 140, lz + 40, x + dir * (cw / 2 + 400) + 90, y + 140, lz + 80); a.box(x + dir * (cw / 2 + 400) - 90, y - 140, lz + 80, x + dir * (cw / 2 + 400) + 90, y - 120, lz + 140);
    a.box(x - cw / 2 + 20, y - cw / 2 - 60, Z1 - 60, x + cw / 2 - 20, y + cw / 2 + 60, Z1 - 20); a.cyl(x, y, Z1 - 20, Z1 - 10, 90, 12);
    a.box(x - 80, y + cw / 2 + 4, Z0 + 1050, x + 80, y + cw / 2 + 100, Z0 + 1350); a.ell(x, y + cw / 2 + 4, Z0 + 1250, 40, 6, 24, 8, 4);
    a.rect(x - 220, y - 300, x + 220, y + 300, 'EQUIP'); a.rect(x - cw / 2, y - cw / 2, x + cw / 2, y + cw / 2, 'EQUIP-DETAIL'); a.rect(x + (dir > 0 ? cw / 2 : -cw / 2 - 500), y - 60, x + (dir > 0 ? cw / 2 + 500 : -cw / 2), y + 60, 'EQUIP-DETAIL');
  }
  for (const s of [-1, 1]) for (let i = 0; i < per - 1; i++) a.tube([[cx + s * (W / 2 - 220) , YF + 220 + (i * (D - 440)) / (per - 1) + 150, Z0 + 20], [cx + s * (W / 2 - 220), YF + 220 + ((i + 1) * (D - 440)) / (per - 1) - 150, Z0 + 20]], [12, 12], 5);
  a.log('Added ' + n + ' columns on base frames with outrigger feet, masts with motor heads and carriages raised on the masts with telescoping fork arms and wheel cradles, control boxes and the ground cables between the columns (plan and 3D).');
}

/** a chassis dynamometer: floor frame with roller pairs, entry and exit ramps, restraint arms, a control pedestal and a cooling fan stand */
function dyno(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, rr = 190, zr = Z0 + 120 + rr * 0.6, n = v.axles;
  const ys = n === 1 ? [cy] : [cy - D * 0.2, cy + D * 0.2];
  a.box(X0 + 200, cy - D * 0.42, Z0, X1 - 200, cy + D * 0.42, Z0 + 80);
  for (const y of ys) for (const s of [-1, 1]) { const x = cx + s * W * 0.2; a.box(x - 260, y - 360, Z0 + 80, x + 260, y - 340, zr - 20); a.box(x - 260, y + 340, Z0 + 80, x + 260, y + 360, zr - 20); for (const q of [-1, 1]) { a.xcyl(x - 240, x + 240, y + q * 190, zr, rr, 22); a.xcyl(x - 250, x - 240, y + q * 190, zr, rr * 0.5, 14); a.xcyl(x + 240, x + 262, y + q * 190, zr, rr * 0.3, 10); a.box(x - 280, y + q * 190 - 20, Z0 + 80, x + 280, y + q * 190 + 20, zr - rr * 0.8); } a.box(x - 250, y - 20, zr - rr * 0.7, x + 250, y + 20, zr - rr * 0.2); a.xcyl(x - 250, x - 220, y, zr - rr * 0.3, 90, 14); }
  prismX(a, [[cy - D * 0.42, Z0], [cy - D * 0.42, Z0 + 80], [ys[0] - 360, Z0 + 80 + 120], [ys[0] - 360, Z0]], X0 + 120, X1 - 120);
  prismX(a, [[cy + D * 0.42, Z0], [cy + D * 0.42, Z0 + 80], [ys[ys.length - 1] + 360, Z0 + 80 + 120], [ys[ys.length - 1] + 360, Z0]], X0 + 120, X1 - 120);
  for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.43, cy - D * 0.42, Z0 + 80], [cx + s * W * 0.43, cy - D * 0.42, Z0 + 700]], [30, 30], 8); a.tube([[cx + s * W * 0.43, cy - D * 0.42, Z0 + 700], [cx + s * W * 0.43, cy - D * 0.2, Z0 + 740]], [20, 20], 8); a.cyl(cx + s * W * 0.43, cy - D * 0.42, Z0, Z0 + 60, 120, 10); }
  const px = X1 - 150, py = YB - 200; a.box(px - 160, py - 160, Z0, px + 160, py + 160, Z0 + 80); a.box(px - 130, py - 130, Z0 + 80, px + 130, py + 130, Z0 + 1050); a.box(px - 150, py - 160, Z0 + 1050, px + 150, py + 30, Z0 + 1300); a.box(px - 120, py - 164, Z0 + 1090, px + 120, py - 150, Z0 + 1260); a.cyl(px, py, Z0 + 1050, Z0 + 1300, 0.01, 3);
  const fx = X0 + 300, fy = cy - D * 0.45 - 0; a.cyl(fx, YF + 380, Z0, Z0 + 40, 220, 14); a.cyl(fx, YF + 380, Z0 + 40, Z0 + 900, 30, 8); a.ycyl(YF + 320, YF + 440, fx, Z0 + 1100, 380, 22); ring3(a, fx, YF + 320, Z0 + 1100, 380, 12, 18, 'y'); for (let k = 0; k < 6; k++) { const t = (k / 6) * TAU; a.tube([[fx, YF + 380, Z0 + 1100], [fx + m.cos(t) * 360, YF + 360, Z0 + 1100 + m.sin(t) * 360]], [22, 10], 4); }
  a.outline('EQUIP-HIDDEN'); for (const y of ys) for (const s of [-1, 1]) a.rect(cx + s * W * 0.2 - 260, y - 360, cx + s * W * 0.2 + 260, y + 360, 'EQUIP'); a.circ(fx, YF + 380, 380, 'EQUIP-DETAIL'); a.rect(px - 160, py - 160, px + 160, py + 160, 'EQUIP-DETAIL');
  a.log('Added the floor frame with ' + (n === 1 ? 'one' : 'two') + ' axle position' + (n > 1 ? 's' : '') + ' of paired rollers on both sides, an entry and an exit ramp, restraint posts with arms, a control pedestal with screen and a cooling fan on a stand (plan and 3D).');
}

/** a portable gantry crane: I-beam with trolley and chain hoist on two A-frames with casters */
function gantry(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cas = 110, bz = Z0 + cas, bh = Z1 - 150, T = (p, q, r = 30, n = 8) => a.tube([p, q], [r, r], n);
  for (const s of [-1, 1]) {
    const x = cx + s * (W / 2 - 90);
    for (const y of [cy - D * 0.45, cy + D * 0.45]) { a.box(x - 45, y - 45, bz, x + 45, y + 45, bz + 20); a.caster(x, y, cas); }
    a.box(x - 40, cy - D * 0.45, bz + 20, x + 40, cy + D * 0.45, bz + 80);
    for (const q of [-1, 1]) T([x, cy + q * D * 0.42, bz + 80], [x, cy + q * 90, bh - 20], 34);
    a.box(x - 70, cy - 90, bh - 30, x + 70, cy + 90, bh + 20); T([x, cy - D * 0.3, bz + (bh - bz) * 0.35], [x, cy + D * 0.3, bz + (bh - bz) * 0.35], 22);
    a.box(x - 40, cy - 40, bz + 80, x + 40, cy + 40, bz + (bh - bz) * 0.35);
    for (const q of [-1, 1]) a.cyl(x + q * 28, cy + D * 0.34, bz + 150, bz + 180, 12, 6);
  }
  a.box(X0 + 60, cy - 70, bh, X1 - 60, cy + 70, bh + 22); a.box(X0 + 60, cy - 70, bh + 22, X1 - 60, cy + 70, bh + 130 - 22 - 0); a.box(X0 + 60, cy - 14, bh + 22, X1 - 60, cy + 14, bh + 108); a.box(X0 + 60, cy - 70, bh + 108, X1 - 60, cy + 70, bh + 130);
  const tx = cx + v.tpos * W; a.box(tx - 60, cy - 90, bh - 10, tx + 60, cy + 90, bh + 8); a.xcyl(tx - 40, tx + 40, cy - 66, bh - 4, 20, 8); a.xcyl(tx - 40, tx + 40, cy + 66, bh - 4, 20, 8);
  a.box(tx - 70, cy - 60, bh - 330, tx + 70, cy + 60, bh - 10); a.ycyl(cy - 80, cy + 80, tx, bh - 200, 90, 14);
  a.tube([[tx + 90, cy - 40, bh - 100], [tx + 130, cy - 40, bh - 350], [tx + 100, cy - 40, bh - 600], [tx + 140, cy - 40, bh - 800]], [5, 5, 5, 5], 4);
  a.tube([[tx, cy, bh - 330], [tx, cy, bh - 640]], [8, 8], 5); a.box(tx - 40, cy - 25, bh - 780, tx + 40, cy + 25, bh - 640); a.tube([[tx, cy, bh - 780], [tx + 30, cy, bh - 900], [tx + 70, cy, bh - 950], [tx, cy, bh - 990]], [16, 14, 12, 10], 6);
  a.outline('EQUIP-HIDDEN'); for (const s of [-1, 1]) a.rect(cx + s * (W / 2 - 90) - 45, cy - D * 0.45 - 45, cx + s * (W / 2 - 90) + 45, cy + D * 0.45 + 45, 'EQUIP'); a.rect(X0 + 60, cy - 70, X1 - 60, cy + 70, 'EQUIP-DETAIL'); a.rect(tx - 60, cy - 90, tx + 60, cy + 90, 'EQUIP-DETAIL');
  a.log('Added two A-frame legs on cross feet with four casters, braces and top gussets, the I-beam with a trolley on its lower flange, the chain hoist with hand chain, load chain and hook block (plan and 3D).');
}

/** a floor-standing H-frame shop press: uprights, pin-adjusted bed beams, head beam, hydraulic cylinder with gauge, pump unit with handle, ram and press plate */
function shoppress(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, uw = 110, tb = Z1 - 200;
  for (const s of [-1, 1]) { const x = cx + s * (W / 2 - uw); a.box(x - uw, YF, Z0, x + uw, YB, Z0 + 50); for (let k = 0; k < 2; k++) { const y = k ? cy + D * 0.15 : cy - D * 0.15; a.box(x - 40, y - 22, Z0 + 50, x + 40, y + 22, tb); a.box(x - 100, y - 22, Z0 + 50, x - 40, y + 22 - 0, Z0 + 80); } for (let q = 0; q < 12; q++) { const z = Z0 + 300 + q * ((tb - Z0 - 400) / 11); a.ycyl(cy - D * 0.2, cy + D * 0.2, x, z, 14, 6); } }
  a.box(X0 + 20, cy - D * 0.3, tb, X1 - 20, cy + D * 0.3, Z1 - 100); a.box(X0 + 20, cy - D * 0.32, Z1 - 100, X1 - 20, cy + D * 0.32, Z1 - 70);
  const bz = Z0 + H * 0.34; for (const s of [-1, 1]) { const x = cx + s * W * 0.2; a.xcyl(cx - W * 0.46, cx + W * 0.46, cy + s * D * 0.18, bz, 24, 8); a.box(cx + s * W * 0.4 - 40, cy + s * D * 0.18 - 40, bz - 40, cx + s * W * 0.4 + 40, cy + s * D * 0.18 + 40, bz + 40); }
  a.box(cx - W * 0.3, cy - D * 0.3, bz + 24, cx + W * 0.3, cy + D * 0.3, bz + 70); for (let k = 0; k < 3; k++) a.xcyl(cx - W * 0.3, cx + W * 0.3, cy - D * 0.2 + k * D * 0.2, bz + 70, 12, 6);
  const rz = Z1 - 100; a.cyl(cx, cy, rz - H * 0.18, rz, 75, 20); a.cyl(cx, cy, rz - H * 0.22, rz - H * 0.18, 100, 20); a.cyl(cx, cy, rz - H * 0.3, rz - H * 0.22, 30, 10); a.box(cx - 90, cy - 90, rz - H * 0.34, cx + 90, cy + 90, rz - H * 0.3);
  a.ycyl(cy - 120, cy - 60, cx - 150, rz - H * 0.1, 50, 14); a.ycyl(cy - 130, cy - 120, cx - 150, rz - H * 0.1, 56, 14); a.ell(cx - 150, cy - 140, rz - H * 0.1, 40, 6, 40, 12, 6);
  const px = cx + W * 0.3, pz = Z0 + H * 0.12; a.box(px - 70, cy - 80, pz - 50, px + 70, cy + 80, pz + 50); a.cyl(px, cy, pz + 50, pz + 160, 60, 14); a.tube([[px, cy - 80, pz + 100], [px - 40, cy - 280, pz + 100], [px - 40, cy - 380, pz + 60]], [18, 18, 18], 6); a.tube([[px, cy, pz + 160], [px + 60, cy, pz + 700]], [12, 12], 6); a.ycyl(cy - 110, cy + 110, px + 60, pz + 700, 16, 6);
  a.tube([[px - 60, cy, pz + 120], [cx + 60, cy, rz - H * 0.18]], [8, 8], 5); a.tube([[px, cy - 60, pz + 100], [cx + 80, cy - 60, rz - H * 0.22]], [8, 8], 5);
  a.outline('EQUIP-HIDDEN'); for (const s of [-1, 1]) a.rect(cx + s * (W / 2 - uw) - uw, YF, cx + s * (W / 2 - uw) + uw, YB, 'EQUIP'); a.rect(X0 + 20, cy - D * 0.3, X1 - 20, cy + D * 0.3, 'EQUIP-DETAIL'); a.circ(cx, cy, 75, 'EQUIP-DETAIL'); a.rect(cx - W * 0.3, cy - D * 0.3, cx + W * 0.3, cy + D * 0.3, 'EQUIP-DETAIL');
  a.log('Added the two footed uprights with pin holes, the head beam, two pin-set bed bars with a stepped table, the hydraulic cylinder with ram and press plate, a pressure gauge, and the pump unit with handle and hoses (plan and 3D).');
}

const FAMS = [
  // ===================================================== vehicles =====================================================
  fam({ cat: 'automotive/vehicles', title: 'Generic articulated tractor unit',
    desc: (v) => `${v.kindText} tractor unit, ${v.len} in long: a cab-over cab${v.sleeper ? ' with a sleeper box' : ''}, roof deflector, grille and windscreen, frame rails, fuel and air tanks, a fifth wheel on its base plate, twin exhaust stacks and ${v.rear.length * 2 + 1 > 3 ? 'three axles with dual rear wheels' : 'two axles with dual rear wheels'}.`,
    vs: [['4x2 day cab, 230 in', 98, 230, 138, 0, { kindText: '4x2 day-cab', len: 230, sleeper: 0, rear: [1250] }], ['4x2 sleeper cab, 262 in', 98, 262, 144, 0, { kindText: '4x2 sleeper-cab', len: 262, sleeper: 1000, rear: [1250] }], ['6x4 sleeper cab, 300 in', 98, 300, 146, 0, { kindText: '6x4 sleeper-cab', len: 300, sleeper: 1100, rear: [2600, 1250] }]],
    build: tractor }),

  fam({ cat: 'automotive/vehicles', title: 'Generic semi-trailer',
    desc: (v) => `${v.kindText} semi-trailer, ${v.len} in long: kingpin and upper coupler, I-beam frame, landing legs with cranks, a ${v.axles}-axle group with dual wheels, underride bar and lamps, carrying ${v.bodyText}.`,
    vs: [['dry van, 40 ft, tandem axle', 102, 492, 160, 0, { kind: 'box', axles: 2, len: 492, kindText: '40 ft dry-van', bodyText: 'a closed box body with ribs, hinged rear doors and locking bars' }], ['dry van, 53 ft, tandem axle', 102, 640, 162, 0, { kind: 'box', axles: 2, len: 640, kindText: '53 ft dry-van', bodyText: 'a closed box body with ribs, hinged rear doors and locking bars' }], ['curtain-side, 45 ft, tri-axle', 102, 545, 160, 0, { kind: 'curtain', axles: 3, len: 545, kindText: '45 ft curtain-side', bodyText: 'a curtain-side body with posts, top rails and curtain panels' }], ['flatbed, 40 ft with headboard, tri-axle', 102, 492, 96, 0, { kind: 'flat', axles: 3, len: 492, kindText: '40 ft flatbed', bodyText: 'a flat deck with stake pockets and a headboard' }], ['tanker, 36 ft, tandem axle', 102, 440, 148, 0, { kind: 'tank', axles: 2, len: 440, kindText: '36 ft tanker', bodyText: 'a cylindrical tank with baffle bands, manway domes, a walkway and a rear valve cabinet' }]],
    build: artTrailer }),

  fam({ cat: 'automotive/vehicles', title: 'Generic light drawbar trailer',
    desc: (v) => `${v.kindText} light trailer, ${v.len} in long including the drawbar: A-frame with coupler, jockey wheel and safety chain, ${v.axles === 2 ? 'twin axles' : 'a single axle'} with leaf springs, wheels and fenders, and ${v.bodyText}.`,
    vs: [['open box, single axle, 96 in', 66, 96, 30, 0, { kind: 'open', axles: 1, draw: 330, len: 96, kindText: 'Single-axle open-box', bodyText: 'an open box with side boards and a drop tailgate' }], ['flat deck with ramp, twin axle, 168 in', 80, 168, 36, 0, { kind: 'flat', axles: 2, draw: 600, len: 168, wr: 190, kindText: 'Twin-axle flat-deck', bodyText: 'a flat deck with side rails, stake pockets and a fold-down loading ramp' }], ['enclosed cargo, single axle, 144 in', 78, 144, 78, 0, { kind: 'box', axles: 1, draw: 520, len: 144, kindText: 'Single-axle enclosed cargo', bodyText: 'an enclosed body with a ramp door, a side door and a roof vent' }], ['tipper, twin axle, 150 in', 72, 150, 52, 0, { kind: 'tipper', axles: 2, draw: 500, len: 150, kindText: 'Twin-axle tipper', bodyText: 'a hinged tipping tub with a hydraulic ram' }]],
    build: utrailer }),

  fam({ cat: 'automotive/vehicles', title: 'Generic touring caravan',
    desc: (v) => `Touring caravan, ${v.len} in long: a rounded body with side windows, an entrance door, front window and gas locker, roof lights, an A-frame drawbar with hitch and jockey wheel, ${v.axles === 2 ? 'twin axles' : 'a single axle'}, four corner steadies and tail lamps.`,
    vs: [['two-berth, single axle, 190 in', 82, 190, 104, 0, { len: 190, axles: 1, draw: 520 }], ['four-berth, single axle, 220 in', 86, 220, 108, 0, { len: 220, axles: 1, draw: 540 }], ['family, twin axle, 260 in', 90, 260, 110, 0, { len: 260, axles: 2, draw: 560 }]],
    build: caravan }),

  fam({ cat: 'automotive/vehicles', title: 'Generic electric utility cart',
    desc: (v) => `${v.kindText} electric utility cart, ${v.len} in long: a floor pan and chassis, a cowl, ${v.seatText}, a canopy on four posts with a windscreen, a steering ${v.kind === 'trike' ? 'handlebar' : 'wheel'}, pedals, lamps and ${v.kind === 'trike' ? 'three' : 'four'} wheels.`,
    vs: [['two-seat, golf-bag deck, 96 in', 48, 96, 72, 0, { kind: 'cart2', len: 96, kindText: 'Two-seat', seatText: 'a bench seat and a golf-bag deck with a strap bar' }], ['four-seat, rear-facing bench, 118 in', 48, 118, 74, 0, { kind: 'cart4', len: 118, kindText: 'Four-seat', seatText: 'a forward bench and a rear-facing bench' }], ['cargo bed, 104 in', 50, 104, 70, 0, { kind: 'bed', len: 104, kindText: 'Cargo-bed', seatText: 'a bench seat and a cargo bed with side walls and tailgate' }], ['three-wheeler passenger, 108 in', 56, 108, 72, 0, { kind: 'trike', len: 108, wr: 220, kindText: 'Three-wheeler passenger', seatText: 'a bench seat and a single steered front wheel' }]],
    build: cart }),

  fam({ cat: 'automotive/vehicles', title: 'Generic quad bike',
    desc: (v) => `${v.kindText} quad bike, ${v.len} in long: four knobbly tyres, A-arm suspension with shocks, tank cover, seat, handlebar, headlamps and fenders, ${v.util ? 'front and rear racks, a front bumper and a winch' : 'a low sport body with a raised exhaust'}.`,
    vs: [['sport, 70 in', 44, 70, 44, 0, { wr: 260, tw: 230, util: false, len: 70, kindText: 'Sport' }], ['utility with racks, 78 in', 48, 78, 48, 0, { wr: 290, tw: 250, util: true, len: 78, kindText: 'Utility' }]],
    build: quad }),

  fam({ cat: 'automotive/vehicles', title: 'Generic cargo bicycle',
    desc: (v) => `${v.kindText} cargo bicycle, ${v.len} in long: spoked wheels with tyres, frame tubes, fork, stem and handlebar, saddle, chainring and pedals, and ${v.text}.`,
    vs: [['longtail, 88 in', 28, 88, 47, 0, { kind: 'long', len: 88, kindText: 'Longtail', text: 'an extended rear deck with side bags, foot boards and a child grab rail' }], ['front box, 100 in', 32, 100, 48, 0, { kind: 'box', len: 100, kindText: 'Front-box', text: 'a front cargo box with side walls and a bench, steered through a long rod' }], ['two-wheel front trike, 96 in', 42, 96, 48, 0, { kind: 'trike', len: 96, kindText: 'Front-box trike', text: 'a cargo box between two steered front wheels' }]],
    build: cargo }),

  fam({ cat: 'automotive/vehicles', title: 'Generic electric kick scooter',
    desc: (v) => `Electric kick scooter, ${v.len} in long, with ${v.dia} in wheels: a ribbed deck with a battery pack underneath, folding stem with a latch, handlebar with grips, headlamp, mudguard with a tail lamp and a kickstand.`,
    vs: [['commuter, 8.5 in wheels, 43 in', 22, 43, 46, 0, { R: 108, tw: 50, deck: 130, stem: 1100, dl: 520, dw: 140, bat: 30, bw: 230, len: 43, dia: '8.5' }], ['big-wheel, 10 in wheels, 52 in', 26, 52, 49, 0, { R: 135, tw: 70, deck: 170, stem: 1180, dl: 620, dw: 170, bat: 45, bw: 290, len: 52, dia: '10' }]],
    build: kick }),

  fam({ cat: 'automotive/vehicles', title: 'Generic city and specialist car',
    desc: (v) => `${v.kindText} car shape, ${v.len} in long: a lofted body ${v.type === 'roadster' ? 'with an open cabin, a raked windscreen, two seats with headrests, roll hoops and a steering wheel' : 'with a raised glazed roof section'}, four wheels with tyres and spokes, bumpers, lamps, mirrors and door lines.`,
    vs: [['microcar, two seats, 118 in', 62, 118, 60, 0, { type: 'micro', wr: 250, len: 118, kindText: 'Two-seat microcar' }], ['mini three-door, 144 in', 64, 144, 58, 0, { type: 'mini', wr: 270, len: 144, kindText: 'Three-door mini hatchback' }], ['compact people carrier, 178 in', 70, 178, 66, 0, { type: 'mpv', wr: 310, len: 178, kindText: 'Tall compact people-carrier' }], ['liftback, 182 in', 72, 182, 54, 0, { type: 'liftback', wr: 320, len: 182, kindText: 'Sloping-tail liftback' }], ['roadster, open top, 160 in', 68, 160, 48, 0, { type: 'roadster', wr: 300, len: 160, kindText: 'Open-top roadster' }]],
    build: car }),

  fam({ cat: 'automotive/vehicles', title: 'Generic recovery truck',
    desc: (v) => `${v.kindText} recovery truck, ${v.len} in long: a cab-over cab, chassis rails, axles with dual rear wheels, and ${v.text}.`,
    vs: [['tilt-bed, 300 in', 98, 300, 130, 0, { kind: 'tilt', rear: [1100], len: 300, kindText: 'Tilt-bed', text: 'a tilting flat bed with a sloping tail, winch drum, headboard frame, light bar and tilt rams' }], ['boom wrecker, 320 in', 98, 320, 142, 0, { kind: 'boom', rear: [1900, 600], len: 320, kindText: 'Boom wrecker', text: 'a two-stage boom on a slewing base with a hook block, side tool lockers, a heavy winch, rear outriggers and an underlift beam' }]],
    build: recovery }),

  fam({ cat: 'automotive/vehicles', title: 'Generic trail and sport motorcycle',
    desc: (v) => `${v.kindText} motorcycle shape, ${v.len} in long: two spoked wheels, forks, handlebar, frame, engine, tank, seat, swing arm and exhaust, with ${v.text}.`,
    vs: [['enduro trail bike, 92 in', 36, 92, 50, 0, { kind: 'standard', cls: 'trail', wb: 1450, wr: 350, tw: 110, len: 92, kindText: 'Enduro trail', text: 'hand guards, a front number plate and a bash plate' }], ['adventure tourer with panniers, 98 in', 38, 98, 56, 0, { kind: 'standard', cls: 'adventure', wb: 1560, wr: 330, tw: 150, len: 98, kindText: 'Adventure-tourer', text: 'a windscreen, crash bars, side panniers and a top box' }], ['sport bike with fairing, 82 in', 30, 82, 44, 0, { kind: 'standard', cls: 'sport', wb: 1400, wr: 310, tw: 180, len: 82, kindText: 'Sport', text: 'a front fairing with a screen and a tail cowl' }]],
    build: moto2 }),

  fam({ cat: 'automotive/vehicles', title: 'Generic double-decker bus',
    desc: (v) => `${v.kindText} double-decker bus shape, ${v.len} in long: a boxy two-storey body with lower and upper window bands, a kerb-side double door, front screens with a destination sign, mirrors, lamps and ${v.axles.length} axles with wheels.`,
    vs: [['two-axle, 390 in', 100, 390, 168, 0, { len: 390, kindText: 'Two-axle', bays: 7, axles: [0.12, 0.78], doorAt: [[0.06, 0.12]] }], ['three-axle, 440 in', 102, 440, 172, 0, { len: 440, kindText: 'Three-axle', bays: 8, axles: [0.1, 0.76, 0.86], doorAt: [[0.05, 0.11]] }]],
    build: dd }),

  // ===================================================== components =====================================================
  fam({ cat: 'automotive/components', title: 'Generic suspension strut',
    desc: (v) => `Coil-over suspension strut, ${v.h} in tall: a foot with knuckle ears and clamp bolts, a damper body and rod, a dust boot and bump stop, a ${v.turns}-turn coil spring on lower and upper seats, and a top mount with three studs.`,
    vs: [['compact car, 20 in', 5, 5, 20, 0, { turns: 5, h: 20 }], ['saloon, 26 in', 6, 6, 26, 0, { turns: 6, h: 26 }], ['heavy duty, 32 in', 7.5, 7.5, 32, 0, { turns: 7, h: 32 }]],
    build: strut }),

  fam({ cat: 'automotive/components', title: 'Generic leaf spring pack',
    desc: (v) => `Leaf spring pack with ${v.n} arched leaves of graded length, ${v.len} in long: rolled eyes with bushes, a centre bolt, rebound clips, a U-bolt plate with ties and two rest blocks.`,
    vs: [['3 leaf, 34 in', 2.4, 34, 5, 0, { n: 3, t: 6, len: 34 }], ['5 leaf, 46 in', 3, 46, 7, 0, { n: 5, t: 8, len: 46 }], ['7 leaf, 58 in', 3.5, 58, 9, 0, { n: 7, t: 10, len: 58 }]],
    build: leafspring }),

  fam({ cat: 'automotive/components', title: 'Generic vehicle battery',
    desc: (v) => `12 V lead-acid battery, ${v.len} in long: a ribbed case with a hold-down ledge, a lid with six cell caps and a label panel, positive and negative terminal posts with clamps${v.handle ? ' and a swing carry handle' : ''}.`,
    vs: [['compact, 9.5 in', 9.5, 6.9, 8.6, 0, { handle: false, len: '9.5' }], ['standard, 12.4 in', 12.4, 6.9, 9, 0, { handle: false, len: '12.4' }], ['heavy duty with handle, 13.1 in', 13.1, 7.5, 10, 0, { handle: true, len: '13.1' }]],
    build: battery }),

  fam({ cat: 'automotive/components', title: 'Generic fuel tank',
    desc: (v) => `${v.kindText} vehicle fuel tank, ${v.len} in wide: a lofted saddle tank with raised humps, an under shield, two mounting straps with feet, a filler neck with hose, a pump flange and vent tubes.`,
    vs: [['saloon, 13 gal, 36 in', 36, 24, 10, 0, { len: 36, kindText: 'Saloon-car' }], ['truck, 26 gal, 56 in', 56, 18, 14, 0, { len: 56, kindText: 'Truck' }]],
    build: fueltank }),

  fam({ cat: 'automotive/components', title: 'Generic steering wheel',
    desc: (v) => `${v.dia} in steering wheel on a display column: a rim with grip section, ${v.spokes} spokes, a hub with a horn pad and a round base disc.`,
    vs: [['sport, 14 in, three spokes', 14.6, 9, 22, 0, { rim: 16, spokes: 3, dia: 14 }], ['truck, 18 in, four spokes', 18.6, 9, 26, 0, { rim: 18, spokes: 4, dia: 18 }]],
    build: steering }),

  fam({ cat: 'automotive/components', title: 'Generic turbocharger',
    desc: (v) => `${v.size} turbocharger: a compressor scroll with inlet and outlet pipe, a bearing housing with oil feed and drain, a turbine scroll with exhaust outlet and inlet flange on a base plate, a wastegate can with rod and coolant fittings.`,
    vs: [['small, 12 in wide', 12, 9, 9, 0, { size: 'Small' }], ['medium, 16 in wide', 16, 12, 12, 0, { size: 'Medium' }], ['large, 22 in wide', 22, 16, 16, 0, { size: 'Large' }]],
    build: turbo }),

  fam({ cat: 'automotive/components', title: 'Generic propeller shaft',
    desc: (v) => `Propeller shaft, ${v.len} in long${v.split ? ', in two pieces with a middle joint and a rubber-mounted centre support' : ''}: universal joints with cross and yokes, drive flanges with studs and a splined slip yoke, shown on two V-block cradles.`,
    vs: [['one-piece, 38 in', 7, 38, 8, 0, { r: 36, split: false, centre: false, joints: 2, len: 38 }], ['two-piece with centre support, 56 in', 8, 56, 9, 0, { r: 40, split: true, centre: true, joints: 4, len: 56 }], ['heavy two-piece, 72 in', 9, 72, 10, 0, { r: 48, split: true, centre: true, joints: 4, len: 72 }]],
    build: driveshaft }),

  fam({ cat: 'automotive/components', title: 'Generic rear axle assembly',
    desc: (v) => `${v.kindText} rear axle, ${v.track} in track: a banjo housing with differential cover and bolts, a pinion nose with yoke, ${v.disc ? 'disc rotors with calipers' : 'brake drums'}${v.dual ? ' with dual hub flanges' : ''} and studs at both hubs, spring perches with U-bolt studs and two axle stands.`,
    vs: [['light, 52 in track, drums', 52, 28, 22, 0, { disc: false, dual: false, track: 52, kindText: 'Light drum-brake' }], ['medium, 60 in track, discs', 60, 30, 24, 0, { disc: true, dual: false, track: 60, kindText: 'Medium disc-brake' }], ['heavy, 76 in track, dual drums', 76, 34, 30, 0, { disc: false, dual: true, track: 76, kindText: 'Heavy dual-wheel' }]],
    build: axle }),

  fam({ cat: 'automotive/components', title: 'Generic electric propulsion unit',
    desc: (v) => `${v.kindText} electric propulsion unit, ${v.len} in wide: ${v.dual ? 'two finned motor barrels with end bells' : 'a finned motor barrel with end bell'}, a reduction gearbox with output flanges, a finned inverter box with cable glands, coolant lines and mounting feet, on a transport skid.`,
    vs: [['single motor, 100 kW class', 26, 16, 18, 0, { dual: false, len: 26, kindText: 'Single-motor 100 kW class' }], ['single motor, 200 kW class', 32, 18, 22, 0, { dual: false, len: 32, kindText: 'Single-motor 200 kW class' }], ['dual motor, 2 x 120 kW class', 40, 18, 20, 0, { dual: true, len: 40, kindText: 'Dual-motor 2 x 120 kW class' }]],
    build: eudrive }),

  fam({ cat: 'automotive/components', title: 'Generic electric vehicle battery pack',
    desc: (v) => `${v.kindText} traction battery pack, ${v.len} in long, on a forklift cradle: a sealed case with a bolted flange, a ribbed lid, underside bolt rows, a high-voltage and low-voltage connector block, coolant ports, four lifting eyes and a service disconnect cover.`,
    vs: [['40 kWh class, 52 in', 52, 34, 12, 0, { len: 52, kindText: '40 kWh class' }], ['75 kWh class, 72 in', 72, 46, 14, 0, { len: 72, kindText: '75 kWh class' }], ['100 kWh class, 86 in', 86, 52, 16, 0, { len: 86, kindText: '100 kWh class' }]],
    build: evpack }),

  fam({ cat: 'automotive/components', title: 'Generic piston and connecting rod',
    desc: (v) => `Piston and connecting rod, ${v.bd} in bore, standing on the rod big end: a piston with three ring grooves${v.bowl ? ' and a combustion bowl in the crown' : ''}, a wrist pin and bosses, an I-beam rod and a split big end with cap and two bolts.`,
    vs: [['2.6 in bore, petrol', 2.9, 2.9, 8, 0, { bore: 66, bd: '2.6', bowl: false }], ['3.5 in bore, petrol', 3.8, 3.8, 10, 0, { bore: 89, bd: '3.5', bowl: false }], ['4.5 in bore, diesel', 4.8, 4.8, 12, 0, { bore: 114, bd: '4.5', bowl: true }]],
    build: pistonrod }),

  fam({ cat: 'automotive/components', title: 'Generic crankshaft',
    desc: (v) => `${v.n}-cylinder crankshaft, ${v.len} in long, on two V-block cradles: main journals, ${v.n} throws with webs, crank pins and counterweights, a rear flange with a bolt circle and a front snout with a keyway.`,
    vs: [['3 cylinder, 18 in', 8.2, 18, 10.5, 0, { n: 3, jr: 24, stroke: 80, len: 18 }], ['4 cylinder, 24 in', 8.4, 24, 10.5, 0, { n: 4, jr: 26, stroke: 90, len: 24 }], ['6 cylinder, 34 in', 9, 34, 11, 0, { n: 6, jr: 30, stroke: 94, len: 34 }]],
    build: crank }),

  fam({ cat: 'automotive/components', title: 'Generic motorcycle engine',
    desc: (v) => `${v.kindText} motorcycle engine, ${v.len} in wide: crankcase halves with a clutch cover and generator cover, ${v.cyl} ${v.cyl === 1 ? 'finned cylinder' : 'cylinders'} with heads, rocker covers and spark plugs, an exhaust header, intake stubs, a drive sprocket and an oil filter.`,
    vs: [['single cylinder, air cooled', 14, 11, 17, 0, { cyl: 1, bore: 84, pitch: 0, len: 14, kindText: 'Single-cylinder air-cooled' }], ['parallel twin, air cooled', 20, 11, 16, 0, { cyl: 2, bore: 70, pitch: 120, len: 20, kindText: 'Parallel-twin air-cooled' }], ['inline four, liquid cooled', 24, 11, 14, 0, { cyl: 4, bore: 56, pitch: 90, fin: 4, len: 24, kindText: 'Inline-four liquid-cooled' }]],
    build: motoengine }),

  // ===================================================== workshop =====================================================
  fam({ cat: 'automotive/workshop', title: 'Generic roller tool cabinet',
    desc: (v) => `${v.kindText} roller tool cabinet, ${v.w} in wide: a carcass on four casters with a top plate, ${v.rows} graded drawer fronts with full-width handles and a lock, side carry handles${v.chest ? ', and a top chest with ' + v.chest + ' drawers, a hinged lid and a latch' : ''}.`,
    vs: [['five drawer, 27 in', 27, 18, 37, 0, { rows: 5, chest: 0, w: 27, kindText: 'Five-drawer' }], ['seven drawer, 41 in', 41, 18, 40, 0, { rows: 7, chest: 0, w: 41, kindText: 'Seven-drawer', taper: 0.4 }], ['chest and roller combination, 56 in', 56, 24, 64, 0, { rows: 7, chest: 4, w: 56, kindText: 'Chest-and-roller combination' }]],
    build: toolchest }),

  fam({ cat: 'automotive/workshop', title: 'Generic garage workbench',
    desc: (v) => `${v.len} in garage workbench: steel posts with foot plates, a timber top with a front lip, a lower shelf, a back pegboard with hooks and tool rails, a strip light${v.drawers ? ', a ' + v.drawers + '-drawer unit' : ''} and ${v.vises} bench vice${v.vises > 1 ? 's' : ''} with screw and handle.`,
    vs: [['6 ft, one vice', 72, 34, 76, 0, { len: 72, drawers: 0, vises: 1 }], ['8 ft, drawers and one vice', 96, 36, 78, 0, { len: 96, drawers: 3, vises: 1 }], ['10 ft, drawers and two vices', 120, 36, 80, 0, { len: 120, drawers: 4, vises: 2 }]],
    build: garagebench }),

  fam({ cat: 'automotive/workshop', title: 'Generic engine stand',
    desc: (v) => `Engine stand, ${v.cap} lb class: an H-frame base with four casters and a cross beam, a mast with gussets, a rotating head plate with four adjustable mounting arms and bolts, and a worm gear box with a hand wheel.`,
    vs: [['750 lb class', 28, 30, 38, 0, { cap: '750' }], ['1,000 lb class', 30, 32, 42, 0, { cap: '1,000' }], ['1,500 lb class', 34, 36, 48, 0, { cap: '1,500' }]],
    build: enginestand }),

  fam({ cat: 'automotive/workshop', title: 'Generic transmission jack',
    desc: (v) => `${v.kind} transmission jack, ${v.cap} lb class, shown raised: two rails on four casters, a telescoping column, a tilting round saddle with four pads and a chain, a foot pedal and a pump handle with a release valve.`,
    vs: [['low-lift, 600 lb', 24, 40, 24, 0, { lift: 540, cap: '600', kind: 'Low-lift' }], ['mid-lift, 1,000 lb', 26, 44, 40, 0, { lift: 960, cap: '1,000', kind: 'Mid-lift' }], ['high-lift, 2,000 lb', 30, 50, 68, 0, { lift: 1640, cap: '2,000', kind: 'High-lift' }]],
    build: transjack }),

  fam({ cat: 'automotive/workshop', title: 'Generic mobile oil drain',
    desc: (v) => `Mobile oil drain, ${v.gal} gal: a cylindrical tank on a base frame with four casters, a telescoping pole carrying a funnel bowl with a grate, a push handle, a drain hose with a nozzle, a gauge and a filler cap.`,
    vs: [['15 gal', 18, 22, 38, 0, { gal: 15 }], ['30 gal', 24, 28, 48, 0, { gal: 30 }], ['70 gal', 30, 34, 62, 0, { gal: 70 }]],
    build: oildrain }),

  fam({ cat: 'automotive/workshop', title: 'Generic tyre rack',
    desc: (v) => `${v.kindText} tyre rack for ${v.tiers * v.per} tyres: end frames with feet, ${v.tiers} tier${v.tiers > 1 ? 's' : ''} of paired rails with tyres standing on their treads on rims${v.wall ? ' and a wall mounting plate' : ' and diagonal braces'}.`,
    vs: [['wall mounted, 8 car tyres', 52, 30, 70, 0, { tiers: 2, per: 4, R: 320, tw: 205, wall: true, kindText: 'Wall-mounted' }], ['free standing, 12 car tyres', 52, 34, 98, 0, { tiers: 3, per: 4, R: 320, tw: 205, wall: false, kindText: 'Free-standing' }], ['free standing, 6 truck tyres', 54, 52, 94, 0, { tiers: 2, per: 3, R: 520, tw: 290, wall: false, kindText: 'Free-standing truck' }]],
    build: tyrerack }),

  fam({ cat: 'automotive/workshop', title: 'Generic tyre inflation cage',
    desc: (v) => `${v.kindText} tyre inflation safety cage: a base plate, four corner posts, a top frame, mesh bars on the back and sides, a hinged front door with a latch, a wheel on a cradle and an air chuck on a bracket with hose and gauge.`,
    vs: [['car wheel, 30 in', 30, 30, 36, 0, { bars: 6, kindText: 'Car-wheel' }], ['truck wheel, 52 in', 52, 52, 62, 0, { bars: 9, kindText: 'Truck-wheel' }]],
    build: tyrecage }),

  fam({ cat: 'automotive/workshop', title: 'Generic battery booster cart',
    desc: (v) => `${v.kindText} battery booster cart: an upright battery case on a base tray with two pneumatic wheels and two casters, a push handle, a panel with two gauges and a switch, and coiled leads with clamps resting on hooks.`,
    vs: [['12 V cart, 1,000 A', 16, 18, 40, 0, { wr: 160, kindText: '12 V' }], ['12 and 24 V cart, 2,000 A', 20, 24, 46, 0, { wr: 190, kindText: '12 and 24 V' }]],
    build: boostercart }),

  fam({ cat: 'automotive/workshop', title: 'Generic drive-on ramps',
    desc: (v) => `Pair of ${v.kindText} drive-on ramps with a ${v.rise} in rise: sloping rib decks with side lips, a flat top platform with a wheel stop, a rear wall with carry handles and non-slip feet.`,
    vs: [['plastic car ramps, 6 in rise', 40, 26, 6, 0, { top: 190, ribs: 5, rise: 6, kindText: 'plastic car' }], ['steel service ramps, 12 in rise', 50, 40, 12, 0, { top: 230, ribs: 7, rise: 12, kindText: 'steel service' }], ['heavy truck ramps, 18 in rise', 70, 64, 18, 0, { top: 320, ribs: 9, rise: 18, kindText: 'heavy truck' }]],
    build: ramps }),

  fam({ cat: 'automotive/workshop', title: 'Generic paint spray booth',
    desc: (v) => `${v.kindText} spray booth, ${v.len} ft long: a floor frame, panel walls, double front doors with vision panels and latches, side windows, wall lights, a roof plenum with filter pads, a rear exhaust duct and stack, and a control cabinet with gauges.`,
    vs: [['cross draft, 20 ft', 168, 240, 132, 0, { windows: 3, len: 20, kindText: 'Cross-draft' }], ['cross draft, 30 ft with prep zone', 168, 360, 132, 0, { windows: 4, len: 30, kindText: 'Prep-zone cross-draft' }], ['truck booth, 45 ft', 204, 540, 192, 0, { windows: 6, len: 45, kindText: 'Drive-through truck' }]],
    build: spraybooth }),

  fam({ cat: 'automotive/workshop', title: 'Generic mobile column lift set',
    desc: (v) => `Set of ${v.n} mobile column lifts, ${v.cap} lb class in all: each column has a base frame with outrigger feet, a mast with a motor head, a carriage raised on the mast with telescoping fork arms and a wheel cradle, a control box and ground cables between the columns.`,
    vs: [['four columns, 18,000 lb', 140, 180, 120, 0, { n: 4, lift: 1500, cap: '18,000' }], ['six columns, 30,000 lb', 140, 300, 120, 0, { n: 6, lift: 1500, cap: '30,000' }]],
    build: columnlifts }),

  fam({ cat: 'automotive/workshop', title: 'Generic chassis dynamometer',
    desc: (v) => `${v.axles === 1 ? 'Two-wheel-drive' : 'Four-wheel-drive'} chassis dynamometer: a floor frame with ${v.axles === 1 ? 'one axle position' : 'two axle positions'} of paired rollers on both sides, entry and exit ramps, restraint posts with arms, a control pedestal with a screen and a cooling fan on a stand.`,
    vs: [['two-wheel drive', 110, 92, 56, 0, { axles: 1 }], ['four-wheel drive', 110, 150, 56, 0, { axles: 2 }]],
    build: dyno }),

  fam({ cat: 'automotive/workshop', title: 'Generic portable gantry crane',
    desc: (v) => `Portable gantry crane, ${v.cap} ton, ${v.span} in span: two A-frame legs on cross feet with four casters, braces and top gussets, an I-beam with a trolley on its lower flange, and a chain hoist with hand chain, load chain and hook block.`,
    vs: [['1 ton, 96 in span', 108, 48, 100, 0, { cap: 1, span: 96, tpos: 0.1 }], ['2 ton, 132 in span', 144, 60, 112, 0, { cap: 2, span: 132, tpos: -0.12 }], ['5 ton, 180 in span', 192, 84, 138, 0, { cap: 5, span: 180, tpos: 0.15 }]],
    build: gantry }),

  fam({ cat: 'automotive/workshop', title: 'Generic hydraulic shop press',
    desc: (v) => `${v.t} ton floor-standing H-frame shop press: two footed uprights with pin holes, a head beam, two pin-set bed bars with a stepped table, a hydraulic cylinder with ram and press plate, a pressure gauge, and a pump unit with handle and hoses.`,
    vs: [['12 ton', 30, 20, 62, 0, { t: 12 }], ['30 ton', 38, 26, 70, 0, { t: 30 }], ['50 ton', 48, 30, 78, 0, { t: 50 }]],
    build: shoppress }),

  // ===================================================== fuel and charging =====================================================
  fam({ cat: 'automotive/charging', title: 'Generic gas vehicle dispenser',
    desc: (v) => `${v.kindText} dispenser: a plinth, a rounded cabinet with a header and light panel, a display with grade buttons, a pressure gauge and an emergency stop button, ${v.k === 'cng' ? 'two nozzle holsters' : 'a nozzle holster'} with hanging hose${v.k === 'cng' ? 's' : ''} and nozzle${v.k === 'cng' ? 's' : ''}${v.k === 'h2' ? ', a breakaway coupling and a vent stack' : ''}.`,
    vs: [['autogas, one hose', 36, 22, 76, 0, { kind: 'lpg', k: 'lpg', kindText: 'Liquefied petroleum gas (autogas)' }], ['compressed gas, two hoses', 54, 24, 84, 0, { kind: 'cng', k: 'cng', kindText: 'Compressed natural gas' }], ['hydrogen, vented', 44, 26, 96, 0, { kind: 'h2', k: 'h2', kindText: 'Hydrogen' }]],
    build: gasdisp }),

  fam({ cat: 'automotive/charging', title: 'Generic forecourt canopy',
    desc: (v) => `Forecourt canopy, ${v.cols * 2} columns over ${v.size}: columns on stepped plinths with collar bands and drain pipes, a roof slab with a sloped fascia on all four sides, edge beams and a grid of underside light panels.`,
    vs: [['four columns, 30 x 20 ft', 360, 240, 204, 0, { cols: 2, size: '30 x 20 ft' }], ['six columns, 48 x 24 ft', 576, 288, 204, 0, { cols: 3, size: '48 x 24 ft' }], ['eight columns, 72 x 30 ft', 864, 360, 216, 0, { cols: 4, size: '72 x 30 ft' }]],
    build: canopy }),

  fam({ cat: 'automotive/charging', title: 'Generic fuel price pylon sign',
    desc: (v) => `${v.h} ft price pylon sign: a footing and base plinth, a mast with a collar plate, a sign cabinet with a blank header panel, ${v.rows} price panels each with four digit windows and a unit lamp, and a cap.`,
    vs: [['16 ft, three prices', 60, 30, 192, 0, { rows: 3, h: 16 }], ['24 ft, four prices', 66, 30, 288, 0, { rows: 4, h: 24 }], ['32 ft, five prices', 72, 34, 384, 0, { rows: 5, h: 32 }]],
    build: pylon }),

  fam({ cat: 'automotive/charging', title: 'Generic fuel storage tank skid',
    desc: (v) => `${v.gal} gallon fuel storage tank skid: a base plate with a bund wall, a horizontal tank on two saddles with straps, a manway, a fill port, a vent stack with a cap, a gauge, and a pump cabinet with a delivery hose, a nozzle holster and a suction line.`,
    vs: [['500 gal, bunded', 62, 100, 84, 0, { gal: 500 }], ['1,000 gal, bunded', 70, 120, 92, 0, { gal: '1,000' }], ['2,000 gal, bunded', 94, 150, 110, 0, { gal: '2,000' }]],
    build: fuelskid }),

  fam({ cat: 'automotive/charging', title: 'Generic exhaust fluid dispenser',
    desc: (v) => v.kind === 'tote' ? 'Exhaust fluid dispenser on a cage tote: a pallet base, a tote bottle inside a tubular cage with ring bands, a top fill cap, a bottom outlet valve, a wall-style pump with a dial and a transfer hose, and a hose reel with a nozzle.' : 'Exhaust fluid pedestal dispenser: a plinth, a rounded pedestal with a roof cap and header, a display with a card slot, a nozzle holster with a hanging hose and a locking nozzle.',
    vs: [['275 gal tote with pump', 48, 54, 62, 0, { kind: 'tote' }], ['pedestal with display', 30, 24, 66, 0, { kind: 'pedestal' }]],
    build: defdisp }),

  fam({ cat: 'automotive/charging', title: 'Generic overhead bus charger',
    desc: (v) => `${v.kindText} overhead bus charger: ${v.kind === 'mast' ? 'a base plate, a mast with a collar and a reaching boom' : 'footed columns and a lattice beam'}, ${v.bays ?? 1} inverted pantograph${(v.bays ?? 1) > 1 ? 's' : ''} with scissor arms and a contact head with two contact bars, and a power cabinet with louvres.`,
    vs: [['mast with reaching boom', 60, 140, 240, 0, { kind: 'mast', kindText: 'Mast-type' }], ['gantry, one bay', 168, 96, 240, 0, { kind: 'gantry', bays: 1, kindText: 'One-bay gantry' }], ['gantry, two bays', 312, 96, 240, 0, { kind: 'gantry', bays: 2, kindText: 'Two-bay gantry' }]],
    build: panto }),

  fam({ cat: 'automotive/charging', title: 'Generic charging cabinet with satellite posts',
    desc: (v) => `Power cabinet with ${v.n} satellite charging posts: a cabinet on a plinth with louvres, a door handle and a roof, and ${v.n} satellite dispenser posts on their own plinths with display, light bar, card reader and a holstered cable, joined by ground conduits.`,
    vs: [['two posts', 168, 60, 96, 0, { n: 2 }], ['four posts', 280, 60, 96, 0, { n: 4 }], ['six posts', 420, 60, 96, 0, { n: 6 }]],
    build: satellites }),

  fam({ cat: 'automotive/charging', title: 'Generic wireless charging bay',
    desc: (v) => `Wireless charging bay, ${v.kw} kW class: a raised plate with chamfered edges, a round charging pad with two coil rings and four alignment studs, a wheel stop with rubber end caps and a status post with a light head and an indicator window.`,
    vs: [['3.7 kW class, single pad', 60, 120, 52, 0, { pf: 0.55, kw: '3.7' }], ['11 kW class, wide bay', 78, 144, 56, 0, { pf: 0.62, kw: '11' }]],
    build: wireless }),

  fam({ cat: 'automotive/charging', title: 'Generic charging cable holder',
    desc: (v) => `${v.kindText} for an electric vehicle charging cable: ${v.text}.`,
    vs: [['wall holster and hook', 14, 10, 30, 0, { kind: 'wall', kindText: 'Wall holster and cable hook', text: 'a back plate and mounting plate, an upper plug holster with a retaining ring, a coiled cable on a side hook and a lower connector cradle' }], ['ceiling spring reel', 16, 16, 72, 36, { kind: 'reel', kindText: 'Ceiling spring reel', text: 'a ceiling plate, a spring reel drum with two flanges and side plates, a guide eye, and a cable hanging down to a connector body with a locking sleeve' }], ['floor post with swing boom', 62, 24, 96, 0, { kind: 'boom', kindText: 'Floor post with a swing boom', text: 'a base plate, a post with a collar, a swing boom with a tie bar carrying the cable down to a connector body, and a control box with a display on the post' }]],
    build: cablehandling }),

  fam({ cat: 'automotive/charging', title: 'Generic e-bike charging locker',
    desc: (v) => `E-bike charging locker bank with ${v.cols * v.rows} compartments: a plinth, a carcass, lockable doors each with a handle, vent slots and a status lamp, side posts and a sloped roof.`,
    vs: [['four bays', 38, 28, 52, 0, { cols: 2, rows: 2 }], ['eight bays', 74, 28, 52, 0, { cols: 4, rows: 2 }], ['twelve bays', 74, 28, 72, 0, { cols: 4, rows: 3 }]],
    build: bikelocker }),

  fam({ cat: 'automotive/charging', title: 'Generic car vacuum station',
    desc: (v) => `${v.kindText} car vacuum station: a plinth, ${v.text}.`,
    vs: [['single tower', 24, 20, 80, 0, { kind: 'post', kindText: 'Single-tower', text: 'a tower with a payment panel, a roof cap, a hose arm, a hanging hose and a crevice nozzle' }], ['twin tower', 44, 22, 80, 0, { kind: 'twin', kindText: 'Twin-tower', text: 'two towers each with a payment panel, a roof cap, a hose arm, a hanging hose and a crevice nozzle' }], ['overhead boom', 60, 28, 108, 0, { kind: 'boom', kindText: 'Overhead-boom', text: 'a tower with a payment panel, a swing boom with a drop hose and a crevice nozzle' }]],
    build: vacstation }),

  fam({ cat: 'automotive/charging', title: 'Generic portable fuel can',
    desc: (v) => `${v.kindText} fuel can: ${v.text}.`,
    vs: [['round plastic, 1 gal', 6.5, 3.5, 8, 0, { kind: 'round', kindText: 'Round plastic 1 gallon', text: 'a round-shouldered body with a grip handle, a pour spout with a cap and a vent' }], ['jerry can, 5 gal', 13.5, 6, 18, 0, { kind: 'jerry', kindText: 'Jerry can, 5 gallon', text: 'a rectangular body with an X-pressed side, three handles, a screw cap and a vent' }], ['safety can, 2 gal', 10, 6, 11, 0, { kind: 'safety', kindText: 'Safety can, 2 gallon', text: 'a ribbed body with a carry handle, a spring lid with a flame arrestor cap and a pour spout' }]],
    build: fuelcan }),

  fam({ cat: 'automotive/charging', title: 'Generic fuel drum station',
    desc: (v) => `${v.kindText} fuel drum station: ${v.text}.`,
    vs: [['drum on spill pallet', 50, 50, 62, 0, { kind: 'pallet', kindText: 'Upright drum on a spill pallet', text: 'a spill pallet with a grating, an upright 55 gallon drum with rolling hoops and bung caps, a hand pump with a delivery hose and a nozzle' }], ['drum on cradle with pump', 63, 30, 36, 0, { kind: 'cradle', kindText: 'Horizontal drum on a cradle', text: 'a steel base with two shaped cradles, a 55 gallon drum with rolling hoops and bung caps, a pump stand with a handle and a transfer hose with a nozzle' }], ['two-drum rack', 64, 34, 34, 0, { kind: 'rack', kindText: 'Two-drum rack', text: 'a steel rack with posts and rails, two 55 gallon drums lying on it with rolling hoops and bung caps' }]],
    build: fueldrum }),
];
export default FAMS;

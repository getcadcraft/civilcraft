/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, automotive: original generic scale shapes (no maker, model or brand). */
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
  sup(a, cab, { seg: 14, n: 2.8 });
  a.poly([[cx + cab[2].rx, cab[2].y], [cx + cab[4].rx, cab[4].y], [cx + cab[6].rx, cab[6].y], [cx - cab[6].rx, cab[6].y], [cx - cab[4].rx, cab[4].y], [cx - cab[2].rx, cab[2].y], [cx - cab[0].rx, cab[0].y], [cx + cab[0].rx, cab[0].y]], 'EQUIP-DETAIL');
  for (const s of [-1, 1]) {
    a.tube([[cx + s * hw * 0.8, Y(t.fa), beltZ], [cx + s * hw * 0.84, Y(lerp(t.fa, t.fr, 0.5)), lerp(beltZ, roofZ, 0.72)]], [18, 18], 5);
    if (t.rails) { a.tube([[cx + s * hw * 0.5, Y(t.fr + 0.02), roofZ + 8], [cx + s * hw * 0.5, Y(t.fs - 0.02), roofZ + 8]], [14, 14], 6); for (const f of [t.fr + 0.04, t.fs - 0.04]) a.box(cx + s * hw * 0.5 - 12, Y(f) - 12, roofZ - 30, cx + s * hw * 0.5 + 12, Y(f) + 12, roofZ + 8); }
  }
  const r = m.min(H * (v.type === 'suv' ? 0.2 : 0.235), 400), tw = r * 0.62, wx = hw - tw * 0.2;
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
function van(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, hw = W / 2 - 75, zb = Z0 + H * 0.15, Y = (f) => YF + D * (0.012 + 0.976 * f);
  const ws = v.ws;
  const prof = [[0, 0.46, 0.8], [0.025, 0.52, 0.9], [0.07, 0.56, 1], [ws, 0.6, 1], [ws + 0.07, 0.86, 1], [ws + 0.14, 0.985, 1], [0.6, 1, 1], [0.95, 1, 1], [0.985, 0.97, 0.95], [1, 0.9, 0.9]];
  const body = prof.map(([f, hz, k]) => ({ y: Y(f), x: cx, rx: hw * k, z0: zb + (f < 0.03 || f > 0.98 ? H * 0.06 : 0), z1: Z0 + H * hz }));
  sup(a, body, { seg: 18, n: 4 }); planOf(a, body);
  const r = m.min(H * 0.19, 340), tw = 235, wx = hw - tw * 0.2;
  for (const y of [Y(0.17), Y(v.ry)]) for (const s of [-1, 1]) { whl(a, cx + s * wx, y, r, tw); if (v.dual && y > Y(0.5)) whl(a, cx + s * (wx - tw * 0.95), y, r, tw, { plain: true }); }
  roadDetails(a, { hw, zb, bh: H * 0.14, zl: Z0 + H * 0.5, zl2: Z0 + H * 0.5, yMir: Y(ws) + 30, zMir: Z0 + H * 0.62 });
  for (const s of [-1, 1]) {
    const x = cx + s * (hw + 4);
    a.box(x - 8, Y(ws + 0.21), Z0 + H * 0.36, x + 8, Y(ws + 0.58), Z0 + H * 0.4);
    a.box(x - 8, Y(ws + 0.21), Z0 + H * 0.78, x + 8, Y(ws + 0.58), Z0 + H * 0.81);
    a.box(x - 10, Y(ws + 0.46), Z0 + H * 0.55, x + 10, Y(ws + 0.5), Z0 + H * 0.62);
    a.line(cx + s * hw, Y(ws + 0.21), cx + s * (hw - 80), Y(ws + 0.21), 'EQUIP-DETAIL'); a.line(cx + s * hw, Y(ws + 0.58), cx + s * (hw - 80), Y(ws + 0.58), 'EQUIP-DETAIL');
  }
  a.box(cx - 8, YB - 22, zb + H * 0.12, cx + 8, YB - 6, Z0 + H * 0.9);
  for (const s of [-1, 1]) for (const z of [0.3, 0.75]) a.box(cx + s * hw * 0.98 - 16, YB - 16, Z0 + H * z, cx + s * hw * 0.98 + 16, YB, Z0 + H * z + 90);
  a.line(cx, YB - 40, cx, YB, 'EQUIP-DETAIL');
  if (v.rack) for (const f of [0.35, 0.6, 0.85]) a.tube([[cx - hw * 0.9, Y(f), Z0 + H - 10], [cx + hw * 0.9, Y(f), Z0 + H - 10]], [22, 22], 6);
  for (const s of [-1, 1]) a.tube([[cx + s * 100, Y(ws + 0.075), Z0 + H * 0.72], [cx + s * 400, Y(ws + 0.075) - 20, Z0 + H * 0.78]], [8, 8], 4);
  a.log('Added the rounded body with long roof, cab windscreen and wipers, sliding door rails and handles, rear doors with hinges, wheels, lamps, bumpers and mirrors (plan and 3D).');
}

/** a pickup: front body and cab, open load bed with side walls, wheel arches, tailgate, headboard and chassis. */
function pickup(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, hw = W / 2 - 75, zb = Z0 + H * 0.2, Y = (f) => YF + D * (0.012 + 0.976 * f);
  const ce = v.cab;
  const cl = v.cabLen, ca = ce - cl;
  const prof = [[0, 0.5, 0.8], [0.025, 0.58, 0.9], [0.07, 0.64, 1], [0.15, 0.68, 1], [ca, 0.7, 1], [ce - 0.02, 0.7, 1], [ce, 0.7, 1]];
  const body = prof.map(([f, hz, k]) => ({ y: Y(f), x: cx, rx: hw * k, z0: zb + (f < 0.03 ? H * 0.06 : 0), z1: Z0 + H * hz }));
  sup(a, body, { seg: 16, n: 3.4 });
  const cabF = [ca, ca + cl * 0.18, ca + cl * 0.34, ce - cl * 0.25, ce - cl * 0.08, ce], cabK = [0.12, 0.7, 1, 1, 0.8, 0.3];
  sup(a, cabF.map((f, i) => ({ y: Y(f), x: cx, rx: hw * 0.86, z0: Z0 + H * 0.66, z1: lerp(Z0 + H * 0.7, Z0 + H, cabK[i]) })), { seg: 14, n: 3 });
  const by0 = Y(ce) + 20, by1 = YB - 30, bz = Z0 + H * 0.52, bt = 55;
  a.box(cx - hw, by0, bz - 40, cx + hw, by1, bz);
  for (const s of [-1, 1]) a.box(s > 0 ? cx + hw - bt : cx - hw, by0, bz, s > 0 ? cx + hw : cx - hw + bt, by1, Z0 + H * 0.72);
  a.box(cx - hw, by0, bz, cx + hw, by0 + bt, Z0 + H * 0.78); a.box(cx - hw, by1 - bt * 0.8, bz, cx + hw, by1, Z0 + H * 0.72);
  const r = m.min(H * 0.21, 380), tw = 245, wx = hw - tw * 0.2, ry = by1 - (by1 - by0) * 0.25, fyw = Y(0.19);
  for (const s of [-1, 1]) { a.box(cx + s * (hw - 230) - 130, ry - 330, bz, cx + s * (hw - 230) + 130, ry + 330, bz + 160); a.rect(cx + s * (hw - 330) - 0, ry - 330, cx + s * (hw - bt), ry + 330, 'EQUIP-DETAIL'); }
  for (const y of [fyw, ry]) for (const s of [-1, 1]) whl(a, cx + s * wx, y, r, tw);
  for (const s of [-1, 1]) a.box(cx + s * hw * 0.55 - 40, Y(0.1), zb - 40, cx + s * hw * 0.55 + 40, YB - 100, zb + 50);
  a.xcyl(cx - wx, cx + wx, ry, Z0 + r, 55, 8);
  roadDetails(a, { hw, zb, bh: H * 0.17, zl: Z0 + H * 0.58, zl2: Z0 + H * 0.64, yMir: Y(ca) + 20, zMir: Z0 + H * 0.74 });
  for (const s of [-1, 1]) { a.line(cx + s * hw, Y(ca + cl * 0.5), cx + s * (hw - 100), Y(ca + cl * 0.5), 'EQUIP-DETAIL'); a.box(cx + s * hw - 10, Y(ca + cl * 0.35), Z0 + H * 0.68, cx + s * hw + 10, Y(ca + cl * 0.35) + 130, Z0 + H * 0.7); }
  a.rect(cx - hw + bt, by0 + bt, cx + hw - bt, by1 - 40, 'EQUIP-DETAIL');
  a.line(cx - hw, Y(ca), cx + hw, Y(ca), 'EQUIP-DETAIL'); a.line(cx - hw, Y(ce), cx + hw, Y(ce), 'EQUIP-DETAIL');
  a.rect(cx - hw, YF, cx + hw, YB);
  a.log('Added the hood and cab, open load bed with walls, wheel arches, headboard and tailgate, chassis rails, rear axle, wheels, lamps and mirrors (plan and 3D).');
}

/** a bus: boxy lofted body, window band with frames, doors on the kerb side, windscreen with destination sign, roof pod, axles with wheels. */
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
function bike(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, k = v.kind, wr = v.wr, tw = v.tw, fy = YF + wr + 40, ry = fy + v.wb, ZB = Z0;
  const wheel = (y) => {
    const zc = ZB + wr; ring3(a, cx, y, zc, wr - tw / 2, tw / 2, 28, 'x'); ring3(a, cx, y, zc, wr - tw - 6, 7, 24, 'x'); a.xcyl(cx - 50, cx + 50, y, zc, 18, 8);
    for (let q = 0; q < 16; q++) { const t = (q / 16) * TAU, sx = q % 2 ? 40 : -40; a.tube([[cx + sx, y, zc], [cx, y + m.cos(t) * (wr - tw - 6), zc + m.sin(t) * (wr - tw - 6)]], [3, 3], 3); }
    a.rect(cx - tw / 2, y - wr, cx + tw / 2, y + wr, 'EQUIP');
  };
  wheel(fy); wheel(ry);
  const bbY = ry - v.cs, bbZ = ZB + 290, stTop = [bbY + 70, bbZ + v.seat], ht0 = [fy + 75, ZB + wr + 330], ht1 = [fy + 75 + 55, ZB + wr + 330 + 150];
  const T = (p, q, r = 14) => a.tube([[cx, p[0], p[1]], [cx, q[0], q[1]]], [r, r], 6);
  T(ht0, ht1, 20);
  T([bbY, bbZ], stTop, 15);                                     // seat tube
  T(ht0, [bbY, bbZ], 18);                                       // down tube
  if (k === 'city') T([ht1[0], ht1[1] - 20], [stTop[0] - 40, bbZ + 120], 16); else T(ht1, [stTop[0] + 14, stTop[1] - 60], 16);
  if (k === 'city') T([stTop[0] - 40, bbZ + 120], [bbY, bbZ], 14);
  for (const s of [-1, 1]) {
    a.tube([[cx + s * 55, bbY, bbZ], [cx + s * 60, ry, ZB + wr]], [11, 9], 5);            // chain stay
    a.tube([[cx + s * 20, stTop[0], stTop[1] - 70], [cx + s * 58, ry, ZB + wr]], [9, 9], 5); // seat stay
    a.tube([[cx + s * 45, ht0[0] - 12, ht0[1] + 10], [cx + s * 45, fy, ZB + wr]], [13, 10], 6);   // fork blade
  }
  a.tube([[cx - 45, ht0[0] - 12, ht0[1] + 10], [cx + 45, ht0[0] - 12, ht0[1] + 10]], [12, 12], 5);
  // stem, bars
  a.tube([[cx, ht1[0], ht1[1]], [cx, ht1[0] - 10, ht1[1] + v.stem]], [14, 14], 6);
  const bz = ht1[1] + v.stem, by = ht1[0] - 40, bw = v.bw;
  if (k === 'road') { a.tube([[cx - bw, by - 130, bz - 110], [cx - bw, by - 90, bz - 20], [cx - bw * 0.3, by, bz], [cx + bw * 0.3, by, bz], [cx + bw, by - 90, bz - 20], [cx + bw, by - 130, bz - 110]], [12, 12, 12, 12, 12, 12], 6); }
  else if (k === 'mountain') { a.tube([[cx - bw, by + 60, bz], [cx - bw * 0.3, by, bz + 10], [cx + bw * 0.3, by, bz + 10], [cx + bw, by + 60, bz]], [12, 12, 12, 12], 6); }
  else { a.tube([[cx - bw, by + 140, bz - 30], [cx - bw * 0.85, by, bz], [cx + bw * 0.85, by, bz], [cx + bw, by + 140, bz - 30]], [12, 12, 12, 12], 6); }
  for (const s of [-1, 1]) a.xcyl(cx + s * bw * 0.9 - 60, cx + s * bw * 0.9 + 60, k === 'road' ? by - 120 : k === 'mountain' ? by + 60 : by + 140, k === 'road' ? bz - 110 : bz - 20, 16, 6);
  // saddle, seat post, cranks, chainring, pedals
  const sz = stTop[1] + 70; a.tube([[cx, stTop[0], stTop[1]], [cx, stTop[0] - 8, sz]], [13, 13], 6);
  a.ell(cx, stTop[0] - 10, sz + 25, k === 'city' ? 95 : 65, k === 'road' ? 140 : 130, 25, 10, 5); a.rect(cx - 70, stTop[0] - 150, cx + 70, stTop[0] + 120, 'EQUIP-DETAIL');
  a.xcyl(cx + 40, cx + 52, bbY, bbZ, 95, 14); a.xcyl(cx - 90, cx + 90, bbY, bbZ, 18, 8);
  for (const s of [-1, 1]) { a.tube([[cx + s * 82, bbY, bbZ], [cx + s * 82, bbY + s * 150, bbZ - s * 12 - 100 * s * 0 - 70 + (s > 0 ? 120 : 0)]], [13, 11], 5); a.box(cx + s * 82 - 4, bbY + s * 150 - 50, bbZ - 8 - 70 + (s > 0 ? 120 : 0) - 8, cx + s * 82 + s * 80, bbY + s * 150 + 50, bbZ - 70 + (s > 0 ? 120 : 0) + 8); }
  a.xcyl(cx + 38, cx + 55, ry, ZB + wr, 40, 10);
  // city: mudguards and rear rack; mountain: fork crown shock
  if (k === 'city') {
    for (const [yc] of [[fy], [ry]]) { const pts = []; for (let q = -5; q <= 5; q++) { const t = q * 0.3; pts.push([cx, yc + m.sin(t) * (wr + 18), ZB + wr + m.cos(t) * (wr + 18)]); } a.tube(pts, pts.map(() => 22), 6); }
    a.box(cx - 70, ry - 40, ZB + wr * 2 + 40, cx + 70, ry + 240, ZB + wr * 2 + 52); for (const s of [-1, 1]) a.tube([[cx + s * 60, ry + 230, ZB + wr * 2 + 46], [cx + s * 55, ry, ZB + wr]], [7, 7], 4);
  }
  a.line(cx, fy, cx, ry, 'EQUIP-DETAIL'); a.line(cx - bw, by, cx + bw, by, 'EQUIP-DETAIL');
  a.log('Added the wheels with rims, spokes and tyres, frame tubes, fork, stem and handlebar, saddle, chainring, cranks and pedals' + (k === 'city' ? ', mudguards and rear rack' : '') + ' (plan and 3D).');
}

/** a rigid truck: lofted cab with windscreen and grille, chassis, wheels, and a box, flatbed or tipper body. */
function rigid(a, v) {
  const { YF, YB, Z0, Z1, cx, W, D, H } = a, hw = W / 2 - 80, gz = Z0 + v.ground, r = v.wr, tw = v.tw;
  const cl = v.cabL, ch = v.cabH;
  const Y = (f) => YF + f;
  sup(a, [{ y: YF + 30, x: cx, rx: hw * 0.9, z0: gz + 160, z1: Z0 + ch - 250 }, { y: YF + 90, x: cx, rx: hw * 0.97, z0: gz + 100, z1: Z0 + ch - 80 }, { y: YF + 300, x: cx, rx: hw, z0: gz + 100, z1: Z0 + ch }, { y: YF + cl, x: cx, rx: hw, z0: gz + 100, z1: Z0 + ch }], { seg: 16, n: 4 });
  a.frame(cx - hw * 0.82, gz + 760, cx + hw * 0.82, Z0 + ch - 180, YF + 14, YF + 50, 36); a.box(cx - 20, YF + 14, gz + 760, cx + 20, YF + 50, Z0 + ch - 180);
  a.box(cx - hw * 0.45, YF + 16, gz + 240, cx + hw * 0.45, YF + 56, gz + 640); for (let i = 1; i < 6; i++) a.box(cx - hw * 0.45, YF + 10, gz + 240 + i * 65, cx + hw * 0.45, YF + 20, gz + 250 + i * 65);   // grille
  a.box(cx - hw * 0.98, YF, gz + 30, cx + hw * 0.98, YF + 90, gz + 240);
  for (const s of [-1, 1]) { a.ell(cx + s * hw * 0.75, YF + 60, gz + 500, 140, 40, 90, 8, 5); a.box(cx + s * (hw + 20) - 20, YF + 220, Z0 + ch * 0.6, cx + s * (hw + 20) + 20, YF + 300, Z0 + ch * 0.6 + 330); a.tube([[cx + s * hw, YF + 250, Z0 + ch * 0.6 + 100], [cx + s * (hw + 20), YF + 260, Z0 + ch * 0.6 + 100]], [10, 10], 4); a.box(cx + s * (hw + 4) - 6, YF + 120, gz + 200, cx + s * (hw + 4) + 6, YF + 420, gz + 220); a.line(cx + s * hw, YF + 480, cx + s * (hw - 60), YF + 480, 'EQUIP-DETAIL'); }
  a.rect(cx - hw, YF, cx + hw, YF + cl, 'EQUIP'); a.line(cx - hw, YF + 300, cx + hw, YF + 300, 'EQUIP-DETAIL');
  // chassis rails, fuel tank, axles and wheels
  for (const s of [-1, 1]) a.box(cx + s * hw * 0.5 - 45, YF + cl - 100, gz + 40, cx + s * hw * 0.5 + 45, YB - 80, gz + 200);
  const rearY = v.rear.map((f) => Y(f));
  for (const f of [v.front, ...v.rear]) { const y = Y(f), rr = f !== v.front; for (const s of [-1, 1]) { whl(a, cx + s * (hw - tw * 0.45), y, r, tw); if (rr && v.dual) whl(a, cx + s * (hw - tw * 1.45), y, r, tw, { plain: true }); } a.xcyl(cx - hw + tw, cx + hw - tw, y, Z0 + r, 55, 8); }
  a.ycyl(YF + cl + 100, YF + cl + 700, cx + hw - 190, gz + 120, 200, 12);
  // body
  const by0 = YF + v.bodyStart, by1 = YB - 20, bz = gz + 230 + (v.body === 'tip' ? 60 : 0);
  if (v.body === 'box') {
    a.box(cx - hw, by0, bz, cx + hw, by1, Z1 - 60); for (let i = 1; i < 9; i++) a.box(cx - hw - 8, by0 + ((by1 - by0) * i) / 9 - 10, bz + 40, cx + hw + 8, by0 + ((by1 - by0) * i) / 9 + 10, Z1 - 70);
    a.box(cx - hw - 4, by0, Z1 - 60, cx + hw + 4, by1, Z1 - 30); a.box(cx - hw * 0.8, by0 + 100, Z1 - 30, cx + hw * 0.8, by1 - 100, Z1);
    a.box(cx - hw + 80, by1 - 8, bz + 180, cx + hw - 80, by1, Z1 - 160); a.line(cx - hw + 80, by1 - 20, cx + hw - 80, by1 - 20, 'EQUIP-DETAIL');
    for (let i = 1; i < 10; i++) a.line(cx - hw, by0 + ((by1 - by0) * i) / 10, cx + hw, by0 + ((by1 - by0) * i) / 10, 'EQUIP-DETAIL');
  } else if (v.body === 'flat') {
    a.box(cx - hw, by0, bz, cx + hw, by1, bz + 90); a.box(cx - hw, by0, bz + 90, cx + hw, by0 + 40, bz + 1100); a.frame(cx - hw, bz + 90, cx + hw, bz + 1100, by0, by0 + 40, 40);
    for (const s of [-1, 1]) { a.box(cx + s * hw - (s > 0 ? 40 : 0), by0 + 40, bz + 90, cx + s * hw + (s > 0 ? 0 : 40), by1, bz + 420); for (let i = 1; i < 6; i++) a.box(cx + s * hw - 10, by0 + ((by1 - by0) * i) / 6 - 12, bz + 420, cx + s * hw + 10, by0 + ((by1 - by0) * i) / 6 + 12, bz + 520); }
    for (let i = 1; i < 12; i++) a.line(cx - hw, by0 + ((by1 - by0) * i) / 12, cx + hw, by0 + ((by1 - by0) * i) / 12, 'EQUIP-DETAIL');
  } else {   // tipper: floor, side walls, sloped canopy over the cab, tailgate, subframe and hoist ram
    a.box(cx - hw, by0 + 150, bz, cx + hw, by1, bz + 90);
    for (const s of [-1, 1]) { a.box(s > 0 ? cx + hw - 60 : cx - hw, by0 + 150, bz + 90, s > 0 ? cx + hw : cx - hw + 60, by1, bz + 1000); a.box(cx + s * hw - 40, by0 + 150, bz + 1000, cx + s * hw + 40, by1, bz + 1060); }
    a.box(cx - hw, by0 + 150, bz + 90, cx + hw, by0 + 230, bz + 1000);
    prismX(a, [[by0 + 230, bz + 1000], [by0 - 250, bz + 1050], [by0 - 250, bz + 1120], [by0 + 230, bz + 1120]], cx - hw * 0.95, cx + hw * 0.95);
    a.box(cx - hw, by1 - 70, bz + 90, cx + hw, by1, bz + 960); a.box(cx - hw - 10, by1 - 70, bz + 940, cx + hw + 10, by1 - 40, bz + 1000);
    a.box(cx - hw * 0.8, by0, bz - 100, cx + hw * 0.8, by1 - 80, bz); a.tube([[cx, by0 + 500, bz - 100], [cx, by0 + 800, bz + 90]], [75, 60], 10); a.tube([[cx, by0 + 520, bz - 100], [cx, by0 + 650, bz - 20]], [100, 100], 10);
    a.rect(cx - hw + 60, by0 + 230, cx + hw - 60, by1 - 70, 'EQUIP-DETAIL');
  }
  a.rect(cx - hw, by0, cx + hw, by1, 'EQUIP'); a.rect(cx - 15, by0, cx + 15, by1, 'EQUIP-HIDDEN');
  // rear bumper and lamps
  a.box(cx - hw * 0.95, YB - 90, gz + 30, cx + hw * 0.95, YB - 10, gz + 170);
  for (const s of [-1, 1]) a.box(cx + s * hw * 0.85 - 70, YB - 14, gz + 280, cx + s * hw * 0.85 + 70, YB, gz + 420);
  a.log('Added the lofted cab with windscreen, grille, lamps and mirrors, chassis rails, fuel tank, axles with wheels and the ' + (v.body === 'box' ? 'closed box body with roof ribs and rear doors' : v.body === 'flat' ? 'flatbed with drop sides and headboard' : 'tipper tub with hoist ram and tailgate') + ' (plan and 3D).');
}

const FAMS = [
  // ===================================================== vehicles =====================================================
  fam({ cat: 'automotive/vehicles', title: 'Generic passenger car',
    desc: (v) => `${v.kindText} passenger car shape, ${v.len} in long: a lofted body with a raised glazed roof section, four wheels with tyres and spokes, bumpers, head and tail lamps, mirrors and ${v.type === 'coupe' ? 'two' : 'four'} door lines with handles.`,
    vs: [['hatchback, 160 in', 72, 160, 58, 0, { type: 'hatch', len: 160, kindText: 'Five-door hatchback' }], ['saloon, 190 in', 76, 190, 57, 0, { type: 'sedan', len: 190, kindText: 'Four-door saloon' }], ['estate, 194 in', 76, 194, 59, 0, { type: 'estate', len: 194, kindText: 'Five-door wagon' }],
      ['coupe, 178 in', 75, 178, 53, 0, { type: 'coupe', len: 178, kindText: 'Two-door coupe' }], ['sport utility, 188 in', 82, 188, 69, 0, { type: 'suv', len: 188, kindText: 'Tall sport utility' }]],
    build: car }),

  fam({ cat: 'automotive/vehicles', title: 'Generic panel van',
    desc: (v) => `Panel van shape, ${v.len} in long and ${v.h} in high: a rounded body with a long roof, cab windscreen with wipers, sliding side door rails, hinged rear doors, ${v.dual ? 'dual rear wheels' : 'four wheels'}${v.rack ? ' and a roof rack' : ''}.`,
    vs: [['compact, 170 in', 74, 170, 76, 0, { len: 170, h: 76, ws: 0.2, ry: 0.78 }], ['medium roof, 215 in', 80, 215, 98, 0, { len: 215, h: 98, ws: 0.17, ry: 0.78, rack: true }], ['long high roof, 250 in', 80, 250, 112, 0, { len: 250, h: 112, ws: 0.15, ry: 0.8, dual: true }]],
    build: van }),

  fam({ cat: 'automotive/vehicles', title: 'Generic pickup truck',
    desc: (v) => `${v.kindText} pickup truck shape, ${v.len} in long: hood and cab, open load bed with walls, wheel arches, headboard and tailgate, chassis rails, rear axle, wheels, lamps and mirrors.`,
    vs: [['single cab, 200 in', 78, 200, 71, 0, { len: 200, cab: 0.5, cabLen: 0.2, kindText: 'Single-cab' }], ['extended cab, 215 in', 80, 215, 72, 0, { len: 215, cab: 0.56, cabLen: 0.26, kindText: 'Extended-cab' }], ['double cab, 230 in', 80, 230, 74, 0, { len: 230, cab: 0.62, cabLen: 0.32, kindText: 'Double-cab' }]],
    build: pickup }),

  fam({ cat: 'automotive/vehicles', title: 'Generic bus',
    desc: (v) => `${v.kindText} shape, ${v.len} in long: a boxy lofted body with a window band and pillars, kerb-side door${v.doorsAt.length > 1 ? 's' : ''}, windscreen with destination sign, mirrors, lamps and ${v.axles.length} axles with wheels${v.coach ? ', plus underfloor luggage hatches' : ''}.`,
    vs: [['minibus, 250 in', 82, 250, 100, 0, { len: 250, kindText: 'Minibus', floor: 0.2, bays: 5, doorsAt: [[0.07, 0.15]], axles: [0.15, 0.82], pod: [0.4, 0.6] }],
      ['midi city bus, 360 in', 94, 360, 118, 0, { len: 360, kindText: 'Midi city bus', floor: 0.17, bays: 7, doorsAt: [[0.06, 0.13], [0.6, 0.67]], axles: [0.12, 0.8], pod: [0.4, 0.6] }],
      ['city bus, 480 in', 102, 480, 124, 0, { len: 480, kindText: 'Twelve-metre city bus', floor: 0.16, bays: 9, doorsAt: [[0.05, 0.1], [0.42, 0.47], [0.66, 0.71]], axles: [0.1, 0.78], pod: [0.4, 0.6] }],
      ['coach, 540 in', 102, 540, 144, 0, { len: 540, kindText: 'Three-axle coach', coach: true, floor: 0.27, bays: 10, doorsAt: [[0.06, 0.11]], axles: [0.1, 0.76, 0.86], pod: [0.3, 0.7] }]],
    build: bus }),

  fam({ cat: 'automotive/vehicles', title: 'Generic motorbike',
    desc: (v) => `${v.kindText} motorbike shape, ${v.len} in long: two spoked wheels, telescopic forks, handlebar and headlamp, ${v.kind === 'scooter' ? 'leg shield, floor deck, body panel and seat' : 'frame, engine block, tank, seat, swing arm, shocks and exhaust'}.`,
    vs: [['step-through scooter, 72 in', 31, 72, 46, 0, { kind: 'scooter', wb: 1300, wr: 230, tw: 120, len: 72, kindText: 'Step-through scooter' }], ['standard, 84 in', 32, 84, 46, 0, { kind: 'standard', wb: 1450, wr: 330, tw: 150, len: 84, kindText: 'Standard-class' }], ['cruiser, 94 in', 36, 94, 46, 0, { kind: 'cruiser', wb: 1650, wr: 330, tw: 200, len: 94, kindText: 'Cruiser-style' }]],
    build: moto }),

  fam({ cat: 'automotive/vehicles', title: 'Generic bicycle',
    desc: (v) => `${v.kindText} bicycle shape, ${v.len} in long: two spoked wheels with tyres, diamond or step-through frame, fork, stem and ${v.kind === 'road' ? 'drop' : v.kind === 'mountain' ? 'flat' : 'upright'} handlebar, saddle, chainring, cranks and pedals${v.kind === 'city' ? ', mudguards and a rear rack' : ''}.`,
    vs: [['road, 68 in', 17, 68, 40, 0, { kind: 'road', wr: 340, tw: 28, wb: 990, cs: 410, seat: 560, stem: 90, bw: 210, len: 68 }], ['mountain, 70 in', 28, 70, 42, 0, { kind: 'mountain', wr: 368, tw: 58, wb: 1100, cs: 440, seat: 500, stem: 60, bw: 380, len: 70 }], ['city step-through, 72 in', 24, 72, 44, 0, { kind: 'city', wr: 340, tw: 40, wb: 1080, cs: 450, seat: 520, stem: 190, bw: 300, len: 72 }]],
    build: bike }),

  fam({ cat: 'automotive/vehicles', title: 'Generic rigid truck',
    desc: (v) => `${v.kindText} rigid truck shape, ${v.len} in long: a lofted cab with windscreen, grille, lamps and mirrors, chassis rails, fuel tank, ${v.axTxt}, and ${v.bodyTxt}.`,
    vs: [['light box truck, 260 in', 80, 260, 114, 0, { len: 260, kindText: 'Light', body: 'box', axTxt: 'two axles with dual rear wheels', bodyTxt: 'a closed box body with roof ribs and rear doors', cabL: 1500, cabH: 2300, ground: 480, wr: 340, tw: 215, front: 700, rear: [4100], dual: true, bodyStart: 1600 }],
      ['medium box truck, 340 in', 94, 340, 128, 0, { len: 340, kindText: 'Medium', body: 'box', axTxt: 'two axles with dual rear wheels', bodyTxt: 'a closed box body with roof ribs and rear doors', cabL: 1700, cabH: 2500, ground: 540, wr: 400, tw: 250, front: 800, rear: [5900], dual: true, bodyStart: 1850 }],
      ['flatbed, 330 in', 94, 330, 112, 0, { len: 330, kindText: 'Medium', body: 'flat', axTxt: 'two axles with dual rear wheels', bodyTxt: 'a flatbed with drop sides and headboard', cabL: 1700, cabH: 2500, ground: 540, wr: 400, tw: 250, front: 800, rear: [5700], dual: true, bodyStart: 1850 }],
      ['tipper, 300 in', 94, 300, 128, 0, { len: 300, kindText: 'Heavy', body: 'tip', axTxt: 'three axles with dual rear wheels', bodyTxt: 'a tipper tub with hoist ram and tailgate', cabL: 1700, cabH: 2600, ground: 600, wr: 450, tw: 280, front: 800, rear: [4700, 5700], dual: true, bodyStart: 1850 }]],
    build: rigid }),

  // ===================================================== components =====================================================
  fam({ cat: 'automotive/components', title: 'Generic wheel and tyre',
    desc: (v) => `Road wheel with a ${v.rim} in rim and tyre, ${v.dia} in overall: a rounded tyre with tread grooves, rim barrel and lip, ${v.sp === 0 ? 'a pressed steel face with vent holes' : v.sp + ' spokes'}, ${v.lugs} lug nuts, a centre cap and a valve stem.`,
    vs: [['13 in rim, compact', 6.1, 22.1, 22.1, 0, { rim: 13, dia: 22.1, sp: 0, lugs: 4 }], ['15 in rim, saloon', 7.4, 25.5, 25.5, 0, { rim: 15, dia: 25.5, sp: 5, lugs: 5 }], ['17 in rim, sport', 8.5, 26.5, 26.5, 0, { rim: 17, dia: 26.5, sp: 7, lugs: 5 }], ['19 in rim, wide', 9.6, 28.1, 28.1, 0, { rim: 19, dia: 28.1, sp: 10, lugs: 5 }], ['17 in rim, off-road', 10.2, 31.5, 31.5, 0, { rim: 17, dia: 31.5, sp: 6, lugs: 6, knob: true }]],
    build: (a, v) => {
      const R = a.D / 2, y = a.YF + R, z = a.Z0 + R, w = a.W, cx = a.cx, rr = (v.rim * I / 2) * 0.98, seg = 28;
      a.tube([[cx - w / 2, y, z], [cx - w * 0.44, y, z], [cx - w * 0.3, y, z], [cx + w * 0.3, y, z], [cx + w * 0.44, y, z], [cx + w / 2, y, z]], [rr * 1.08, R * 0.9, R, R, R * 0.9, rr * 1.08], seg);
      for (const gx of [-0.18, 0, 0.18]) a.tube([[cx + w * gx - 4, y, z], [cx + w * gx + 4, y, z]], [R * 1.012, R * 1.012], seg);
      if (v.knob) for (let k = 0; k < 24; k++) { const t = (k / 24) * TAU; for (const sx of [-0.2, 0.2]) a.box(cx + w * sx - 22, y + m.cos(t) * R - 22, z + m.sin(t) * R - 22, cx + w * sx + 22, y + m.cos(t) * R + 22, z + m.sin(t) * R + 22); }
      a.xcyl(cx - w * 0.36, cx + w * 0.34, y, z, rr, seg);
      ring3(a, cx + w * 0.4, y, z, rr, 9, 24, 'x'); ring3(a, cx - w * 0.4, y, z, rr, 9, 24, 'x');
      const fx = cx + w * 0.34;
      a.xcyl(fx - 4, fx + 18, y, z, rr * 0.9, 24);
      a.xcyl(fx + 18, fx + 40, y, z, rr * 0.32, 14);
      if (v.sp === 0) for (let k = 0; k < 8; k++) { const t = (k / 8) * TAU; a.xcyl(fx + 14, fx + 28, y + m.cos(t) * rr * 0.68, z + m.sin(t) * rr * 0.68, rr * 0.1, 8); }
      else for (let k = 0; k < v.sp; k++) { const t = (k / v.sp) * TAU + 0.2, dx = v.sp > 6 ? 1.2 : 2.2; a.tube([[fx + 18, y, z], [fx + 22, y + m.cos(t) * rr * 0.55, z + m.sin(t) * rr * 0.55], [fx + 14, y + m.cos(t) * rr * 0.93, z + m.sin(t) * rr * 0.93]], [rr * 0.13 * dx / 2, rr * 0.1, rr * 0.08], 4); }
      for (let k = 0; k < v.lugs; k++) { const t = (k / v.lugs) * TAU; a.xcyl(fx + 30, fx + 46, y + m.cos(t) * rr * 0.28, z + m.sin(t) * rr * 0.28, 15, 6); }
      a.tube([[fx - 6, y + rr * 0.97, z - rr * 0.1], [fx + 10, y + rr * 1.03, z - rr * 0.13]], [8, 8], 5);
      a.rect(cx - w / 2, y - R, cx + w / 2, y + R, 'EQUIP'); a.rect(cx - w * 0.36, y - rr, cx + w * 0.34, y + rr, 'EQUIP-DETAIL'); a.line(cx, y - R, cx, y + R, 'EQUIP-HIDDEN');
      a.log('Added the tyre with tread grooves, rim barrel and lips, face with ' + (v.sp ? v.sp + ' spokes' : 'vent holes') + ', centre cap, lug nuts and valve stem (plan and 3D).');
    } }),

  fam({ cat: 'automotive/components', title: 'Generic inline engine',
    desc: (v) => `Inline ${v.n}-cylinder engine block, ${v.litre} litre class: oil pan, block and head with cam cover and ${v.n} ignition coils, an intake manifold with ${v.n} runners${v.turbo ? ' and a turbocharger' : ''}, an exhaust manifold, front pulleys with an alternator, and a bell housing flange at the rear.`,
    vs: [['3 cylinder, 1.0 litre', 17, 22, 26, 0, { n: 3, litre: 1.0 }], ['4 cylinder turbo diesel, 2.0 litre', 20, 29, 30, 0, { n: 4, litre: 2.0, turbo: true }], ['6 cylinder, 3.0 litre', 20, 36, 30, 0, { n: 6, litre: 3.0 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, cx, W, H, D } = a, n = v.n, fr = 150, rr = 190, y0 = YF + fr, y1 = YB - rr, L = y1 - y0, pitch = (L - 60) / n;
      a.box(cx - W * 0.26, y0 + 40, Z0 + H * 0.04, cx + W * 0.26, y1 - 40, Z0 + H * 0.24);                     // oil pan
      a.box(cx - W * 0.31, y0, Z0 + H * 0.2, cx + W * 0.31, y1, Z0 + H * 0.52);                               // block
      a.box(cx - W * 0.3, y0 + 6, Z0 + H * 0.52, cx + W * 0.3, y1 - 6, Z0 + H * 0.68);                         // head
      a.box(cx - W * 0.24, y0 + 30, Z0 + H * 0.68, cx + W * 0.24, y1 - 30, Z0 + H * 0.78);                       // cam cover
      a.box(cx - W * 0.2, y0 + 20, Z0 + H * 0.78, cx + W * 0.2, y1 - 20, Z0 + H * 0.8);
      for (let i = 0; i < n; i++) { const y = y0 + 30 + pitch * (i + 0.5); a.cyl(cx, y, Z0 + H * 0.8, Z0 + H * 0.88, W * 0.035, 8); a.box(cx - W * 0.05, y - 22, Z0 + H * 0.88, cx + W * 0.05, y + 22, Z0 + H * 0.92); a.line(cx - W * 0.24, y0 + 30 + pitch * i, cx + W * 0.24, y0 + 30 + pitch * i, 'EQUIP-DETAIL'); }
      for (let i = 0; i <= n; i++) a.box(cx - W * 0.315, y0 + 30 + pitch * i - 10, Z0 + H * 0.2, cx + W * 0.315, y0 + 30 + pitch * i + 10, Z0 + H * 0.5);   // block ribs
      // intake (left) with runners, exhaust (right) with collector
      a.ycyl(y0 + 40, y1 - 60, cx - W * 0.42, Z0 + H * 0.78, W * 0.07, 12);
      for (let i = 0; i < n; i++) { const y = y0 + 30 + pitch * (i + 0.5); a.tube([[cx - W * 0.42, y, Z0 + H * 0.74], [cx - W * 0.36, y, Z0 + H * 0.62], [cx - W * 0.3, y, Z0 + H * 0.6]], [W * 0.028, W * 0.028, W * 0.028], 6); }
      a.cyl(cx - W * 0.42, y0 + 20, Z0 + H * 0.74, Z0 + H * 0.8, W * 0.06, 10);
      for (let i = 0; i < n; i++) { const y = y0 + 30 + pitch * (i + 0.5); a.tube([[cx + W * 0.3, y, Z0 + H * 0.58], [cx + W * 0.38, y, Z0 + H * 0.52], [cx + W * 0.38, y, Z0 + H * 0.4]], [W * 0.03, W * 0.03, W * 0.03], 6); }
      a.ycyl(y0 + 60, y1 - 30, cx + W * 0.38, Z0 + H * 0.38, W * 0.035, 10);
      a.tube([[cx + W * 0.38, y1 - 30, Z0 + H * 0.38], [cx + W * 0.38, y1 + 60, Z0 + H * 0.3]], [W * 0.04, W * 0.04], 8);
      if (v.turbo) { a.ell(cx + W * 0.4, y0 + L * 0.5, Z0 + H * 0.58, W * 0.1, 100, W * 0.1, 12, 7); a.tube([[cx + W * 0.4, y0 + L * 0.5 - 60, Z0 + H * 0.62], [cx - W * 0.4, y0 + 20, Z0 + H * 0.84]], [W * 0.025, W * 0.025], 6); }
      // front: crank pulley, alternator, belt, water pump cover
      a.box(cx - W * 0.28, YF + 60, Z0 + H * 0.1, cx + W * 0.28, y0, Z0 + H * 0.66);
      a.ycyl(YF + 10, y0, cx, Z0 + H * 0.16, W * 0.13, 14); a.ycyl(YF + 40, YF + 80, cx, Z0 + H * 0.16, W * 0.07, 10);
      a.ycyl(YF + 40, y0 - 10, cx - W * 0.2, Z0 + H * 0.6, W * 0.075, 12); a.ycyl(YF + 30, y0 - 10, cx + W * 0.2, Z0 + H * 0.6, W * 0.06, 12);
      a.ycyl(YF + 40, y0 - 10, cx + W * 0.19, Z0 + H * 0.3, W * 0.06, 12);
      a.ycyl(YF + 30, y0 - 10, cx - W * 0.22, Z0 + H * 0.32, W * 0.1, 12);
      a.rect(cx - W * 0.13, YF + 10, cx + W * 0.13, y0, 'EQUIP-DETAIL');
      // rear flange and bell housing, mounts
      a.ycyl(y1, YB - 20, cx, Z0 + H * 0.32, H * 0.3, 18); a.ycyl(YB - 40, YB - 5, cx, Z0 + H * 0.32, H * 0.34, 18);
      for (const s of [-1, 1]) { a.box(cx + s * W * 0.33 - 30, y0 + L * 0.3, Z0 + H * 0.3, cx + s * W * 0.42, y0 + L * 0.5, Z0 + H * 0.38); a.box(cx + s * W * 0.43 - 60, y0 + L * 0.28, Z0 + H * 0.26, cx + s * W * 0.43 + 60, y0 + L * 0.52, Z0 + H * 0.31); }
      a.rect(cx - W * 0.31, y0, cx + W * 0.31, y1); a.rect(cx - W * 0.24, y0 + 30, cx + W * 0.24, y1 - 30, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log(`Added the oil pan, block, head and cam cover, ${n} coils, intake runners, exhaust manifold, front pulleys with alternator and the bell housing flange (plan and 3D).`);
    } }),

  fam({ cat: 'automotive/components', title: 'Generic V engine',
    desc: (v) => `V${v.n} engine block, ${v.litre} litre class: two cylinder banks at 60 degrees on a common crankcase, a cam cover on each bank, an intake plenum with runners between the banks, an exhaust manifold on each outer side, front pulleys and a bell housing flange.`,
    vs: [['V6, 3.5 litre', 28, 26, 28, 0, { n: 6, litre: 3.5 }], ['V8, 6.2 litre truck', 32, 32, 31, 0, { n: 8, litre: 6.2 }]],
    build: (a, v) => {
      const { YF, YB, Z0, cx, W, H } = a, n = v.n, per = n / 2, y0 = YF + 150, y1 = YB - 190, L = y1 - y0, pitch = (L - 40) / per;
      a.box(cx - W * 0.2, y0 + 20, Z0 + H * 0.03, cx + W * 0.2, y1 - 20, Z0 + H * 0.26);        // oil pan
      a.box(cx - W * 0.22, y0, Z0 + H * 0.2, cx + W * 0.22, y1, Z0 + H * 0.5);                  // crankcase
      for (const s of [-1, 1]) {
        const bank = [[0, 0.36], [0.2 * s, 0.36], [0.46 * s, 0.7], [0.3 * s, 0.7]].map(([x, f]) => [cx + x * W, Z0 + f * H]);
        const fix = s > 0 ? bank : bank.slice().reverse();
        prismY(a, [[cx, Z0 + H * 0.34], [cx + s * W * 0.2, Z0 + H * 0.34], [cx + s * W * 0.44, Z0 + H * 0.68], [cx + s * W * 0.28, Z0 + H * 0.68], [cx, Z0 + H * 0.5]].filter(Boolean).map((p) => p), y0 + (s > 0 ? 0 : 40), y1 - (s > 0 ? 40 : 0));
        prismY(a, [[cx + s * W * 0.24, Z0 + H * 0.66], [cx + s * W * 0.44, Z0 + H * 0.66], [cx + s * W * 0.47, Z0 + H * 0.78], [cx + s * W * 0.27, Z0 + H * 0.78]], y0 + (s > 0 ? 20 : 60), y1 - (s > 0 ? 60 : 20));
        for (let i = 0; i < per; i++) { const y = y0 + 40 + pitch * (i + 0.5) + (s > 0 ? 0 : 30); a.tube([[cx + s * W * 0.46, y, Z0 + H * 0.68], [cx + s * W * 0.52, y, Z0 + H * 0.58], [cx + s * W * 0.52, y, Z0 + H * 0.42]], [W * 0.03, W * 0.03, W * 0.03], 6); a.cyl(cx + s * W * 0.37, y, Z0 + H * 0.78, Z0 + H * 0.86, W * 0.03, 8); a.line(cx + s * W * 0.27, y - pitch / 2, cx + s * W * 0.47, y - pitch / 2, 'EQUIP-DETAIL'); }
        a.ycyl(y0 + 60, y1, cx + s * W * 0.52, Z0 + H * 0.4, W * 0.035, 10);
      }
      a.box(cx - W * 0.09, y0 + 40, Z0 + H * 0.5, cx + W * 0.09, y1 - 80, Z0 + H * 0.7);       // plenum in the V
      for (let i = 0; i < per; i++) { const y = y0 + 40 + pitch * (i + 0.5); for (const s of [-1, 1]) a.tube([[cx + s * W * 0.08, y + 15 * s, Z0 + H * 0.58], [cx + s * W * 0.2, y + 15 * s, Z0 + H * 0.64]], [W * 0.025, W * 0.025], 6); }
      a.cyl(cx, y0 + 40, Z0 + H * 0.7, Z0 + H * 0.78, W * 0.06, 10); a.cyl(cx, y1 - 110, Z0 + H * 0.7, Z0 + H * 0.74, W * 0.05, 10);
      a.box(cx - W * 0.2, YF + 60, Z0 + H * 0.1, cx + W * 0.2, y0, Z0 + H * 0.62);
      a.ycyl(YF + 10, y0, cx, Z0 + H * 0.16, W * 0.1, 14); a.ycyl(YF + 40, y0 - 10, cx - W * 0.3, Z0 + H * 0.55, W * 0.07, 12); a.ycyl(YF + 40, y0 - 10, cx + W * 0.3, Z0 + H * 0.55, W * 0.06, 12); a.ycyl(YF + 40, y0 - 10, cx, Z0 + H * 0.58, W * 0.075, 12);
      a.ycyl(y1, YB - 20, cx, Z0 + H * 0.3, H * 0.3, 18); a.ycyl(YB - 40, YB - 5, cx, Z0 + H * 0.3, H * 0.33, 18);
      for (const s of [-1, 1]) a.box(cx + s * W * 0.2 - 40, y0 + L * 0.3, Z0 + H * 0.28, cx + s * W * 0.4, y0 + L * 0.5, Z0 + H * 0.36);
      a.rect(cx - W * 0.22, y0, cx + W * 0.22, y1); for (const s of [-1, 1]) a.rect(cx + s * W * 0.04 - (s > 0 ? 0 : W * 0.24), y0 + (s > 0 ? 0 : 40), cx + s * W * 0.04 + (s > 0 ? W * 0.24 : 0), y1 - (s > 0 ? 40 : 0), 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log(`Added the oil pan, crankcase, two ${per}-cylinder banks with cam covers, intake plenum and runners, exhaust manifolds, front pulleys and the bell housing flange (plan and 3D).`);
    } }),

  fam({ cat: 'automotive/components', title: 'Generic gearbox',
    desc: (v) => v.kind === 'trans' ? 'Front-drive transaxle: a transverse housing with a clutch-side bell, differential bulge, two output flanges, a selector cover with lever and mounting lugs.' : `${v.kindText} gearbox: a bell housing, main case with ${v.kind === 'auto' ? 'a deep pan, valve body cover and cooler lines' : 'cover plate and gear lever turret'}, a tail housing with output flange and mounting feet.`,
    vs: [['five-speed manual', 19, 32, 21, 0, { kind: 'manual', kindText: 'Five-speed manual' }], ['eight-speed automatic', 21, 36, 23, 0, { kind: 'auto', kindText: 'Eight-speed automatic' }], ['front-drive transaxle', 30, 20, 17, 0, { kind: 'trans' }]],
    build: (a, v) => {
      const { YF, YB, Z0, cx, W, H, D } = a, zc = Z0 + H * (v.kind === 'trans' ? 0.45 : 0.42);
      if (v.kind === 'trans') {
        a.xcyl(a.X0 + 150, a.X1 - 250, YF + D * 0.5, zc, H * 0.38, 18); a.xcyl(a.X1 - 250, a.X1 - 20, YF + D * 0.5, zc, H * 0.3, 16);
        a.xcyl(a.X0 + 20, a.X0 + 160, YF + D * 0.5, zc, H * 0.45, 20); a.xcyl(a.X0 + 5, a.X0 + 30, YF + D * 0.5, zc, H * 0.5, 20);
        a.ell(cx + W * 0.1, YF + D * 0.55, zc - H * 0.18, W * 0.14, D * 0.3, H * 0.3, 14, 8);
        a.box(cx - W * 0.1, YF + D * 0.2, zc + H * 0.25, cx + W * 0.2, YB - 60, zc + H * 0.4); a.cyl(cx + W * 0.05, YF + D * 0.3, zc + H * 0.4, zc + H * 0.62, 14, 8); a.ell(cx + W * 0.05, YF + D * 0.3, zc + H * 0.66, 30, 30, 30, 8, 5);
        a.xcyl(a.X1 - 70, a.X1 - 5, YF + D * 0.5, zc, H * 0.14, 14); a.box(a.X0 + 300, YF + 30, zc - H * 0.3, a.X0 + 420, YF + 130, zc + H * 0.3); a.box(a.X1 - 480, YB - 130, zc - H * 0.3, a.X1 - 360, YB - 30, zc + H * 0.3);
        a.rect(a.X0 + 20, YF + 40, a.X1 - 20, YB - 40); a.circ(cx + W * 0.1, YF + D * 0.55, H * 0.2, 'EQUIP-DETAIL'); a.line(a.X0 + 160, YF, a.X0 + 160, YB, 'EQUIP-DETAIL');
        a.log('Added the bell, transverse case, differential bulge, output flanges, selector cover with lever and mounting lugs (plan and 3D).');
        return;
      }
      const bell = v.kind === 'auto' ? H * 0.4 : H * 0.38, bl = D * (v.kind === 'auto' ? 0.3 : 0.26);
      a.ycyl(YF + 20, YF + bl, cx, zc, bell, 20); a.ycyl(YF + 5, YF + 40, cx, zc, bell * 1.07, 20);
      a.ycyl(YF + bl, YB - D * 0.22, cx, zc, H * 0.3, 18);
      a.box(cx - W * 0.35, YF + bl + 20, zc - H * 0.25, cx + W * 0.35, YB - D * 0.27, zc + H * 0.3);
      a.ycyl(YB - D * 0.3, YB - 40, cx, zc, H * 0.24, 14); a.ycyl(YB - 80, YB - 5, cx, zc, H * 0.14, 12); a.ycyl(YB - 12, YB, cx, zc, H * 0.2, 12);
      for (const f of [0.35, 0.5, 0.65]) a.box(cx - W * 0.4, YF + bl + (YB - D * 0.27 - YF - bl) * f - 10, zc - H * 0.15, cx + W * 0.4, YF + bl + (YB - D * 0.27 - YF - bl) * f + 10, zc + H * 0.2);
      if (v.kind === 'auto') {
        a.box(cx - W * 0.34, YF + bl + 40, Z0 + H * 0.02, cx + W * 0.34, YB - D * 0.3, zc - H * 0.12);
        a.box(cx - W * 0.3, YF + bl + 60, zc + H * 0.3, cx + W * 0.3, YB - D * 0.34, zc + H * 0.38);
        for (const s of [-1, 1]) a.tube([[cx + s * W * 0.4, YF + bl + 60, zc + H * 0.05], [cx + s * W * 0.5, YF + bl + 80, zc + H * 0.2], [cx + s * W * 0.5, YF + bl + 320, zc + H * 0.2]], [14, 14, 14], 6);
        a.box(cx - W * 0.1, YB - D * 0.5, zc + H * 0.3, cx + W * 0.1, YB - D * 0.38, zc + H * 0.44);
      } else {
        a.box(cx - W * 0.2, YF + bl + 60, zc + H * 0.28, cx + W * 0.2, YB - D * 0.35, zc + H * 0.38);
        a.cyl(cx, YB - D * 0.42, zc + H * 0.4, zc + H * 0.46, 12, 8); a.ell(cx, YB - D * 0.42, zc + H * 0.5, 30, 30, 32, 10, 6);
      }
      for (const s of [-1, 1]) { a.box(cx + s * W * 0.34 - 20, YB - D * 0.3, zc - H * 0.25, cx + s * W * 0.5, YB - D * 0.18, zc - H * 0.15); }
      a.rect(cx - W * 0.35, YF + bl + 20, cx + W * 0.35, YB - D * 0.27); a.circ(cx, YF + bl / 2, bell, 'EQUIP-DETAIL'); a.rect(cx - bell, YF + 5, cx + bell, YF + bl, 'EQUIP'); a.rect(cx - H * 0.24, YB - D * 0.3, cx + H * 0.24, YB, 'EQUIP');
      a.log('Added the bell housing, main case, ' + (v.kind === 'auto' ? 'deep pan, valve body cover and cooler lines' : 'cover plate and gear lever turret') + ', tail housing, output flange and mounting feet (plan and 3D).');
    } }),

  fam({ cat: 'automotive/components', title: 'Generic vehicle seat',
    desc: (v) => `${v.kindText} vehicle seat: a cushion with side bolsters, a reclined backrest, ${v.heads} head restraint${v.heads > 1 ? 's' : ''} on posts, a pair of floor slide rails and an adjuster bar${v.split ? ', with a split line between the two backrest sections' : ''}.`,
    vs: [['front bucket', 22, 30, 38, 0, { kindText: 'Front bucket', heads: 1, bolster: true, wi: 22 }], ['front bench for three', 58, 30, 38, 0, { kindText: 'Front bench for three', heads: 3, bolster: false, wi: 58 }], ['rear split bench', 56, 26, 36, 0, { kindText: 'Rear split bench', heads: 3, bolster: false, wi: 56, split: true }]],
    build: (a, v) => {
      const { YF, YB, Z0, cx, W, H, D } = a, w2 = W / 2 - 10, sz = Z0 + H * 0.28, bt = 110;
      for (const s of [-1, 1]) { const x = cx + s * (W * (v.heads === 1 ? 0.34 : 0.4)); a.box(x - 22, YF + 40, Z0 + 10, x + 22, YB - 60, Z0 + 55); a.box(x - 30, YF + 60, Z0 + 55, x + 30, YF + 120, sz - bt * 0.4); a.box(x - 30, YB - 200, Z0 + 55, x + 30, YB - 140, sz - bt * 0.4); }
      a.box(cx - W * 0.4, YF + 30, Z0 + 20, cx + W * 0.4, YF + 50, Z0 + 40);
      prismX(a, [[YF + 30, sz - bt * 0.6], [YF + 30, sz + 40], [YB - D * 0.28, sz + 70], [YB - D * 0.28, sz - bt * 0.6]], cx - w2, cx + w2);
      if (v.bolster) for (const s of [-1, 1]) prismX(a, [[YF + 60, sz + 40], [YF + 60, sz + 85], [YB - D * 0.3, sz + 130], [YB - D * 0.3, sz + 70]], s > 0 ? cx + w2 - 70 : cx - w2, s > 0 ? cx + w2 : cx - w2 + 70);
      const by = YB - D * 0.3, bh = H * 0.5;
      const back = (x0, x1) => { prismX(a, [[by, sz + 40], [by + 150, sz + 40], [by + 150 + bh * 0.3, sz + 40 + bh], [by + 40, sz + 40 + bh]], x0, x1); };
      if (v.split) { back(cx - w2, cx + w2 * 0.2 - 8); back(cx + w2 * 0.2 + 8, cx + w2); a.line(cx + w2 * 0.2, by, cx + w2 * 0.2, YB, 'EQUIP-DETAIL'); } else back(cx - w2, cx + w2);
      if (v.bolster) for (const s of [-1, 1]) prismX(a, [[by - 80, sz + 100], [by + 150, sz + 100], [by + 130 + bh * 0.3, sz + 40 + bh * 0.9], [by - 40, sz + 40 + bh * 0.9]], s > 0 ? cx + w2 - 70 : cx - w2, s > 0 ? cx + w2 : cx - w2 + 70);
      const hz = sz + 40 + bh;
      const hxs = v.heads === 1 ? [0] : [-0.62, 0, 0.62];
      for (const f of hxs) { const x = cx + f * (W / 2 - (v.heads === 1 ? 0 : 150) - 100), yh = by + 40 + bh * 0.3 + 30; for (const s of [-1, 1]) a.tube([[x + s * 55, yh, hz - 30], [x + s * 55, yh, hz + 110]], [8, 8], 5); a.box(x - 130, yh - 50, hz + 60, x + 130, yh + 50, hz + 250); a.rect(x - 130, yh - 50, x + 130, yh + 50, 'EQUIP-DETAIL'); }
      a.rect(cx - w2, YF + 30, cx + w2, by + 150 + bh * 0.3); a.line(cx - w2, by, cx + w2, by, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.rect(cx + s * W * (v.heads === 1 ? 0.34 : 0.4) - 22, YF + 40, cx + s * W * (v.heads === 1 ? 0.34 : 0.4) + 22, YB - 60, 'EQUIP-HIDDEN');
      a.log('Added the cushion, bolsters, reclined backrest, head restraints on posts, slide rails and adjuster bar (plan and 3D).');
    } }),

  fam({ cat: 'automotive/components', title: 'Generic exhaust system',
    desc: (v) => `${v.kindText} exhaust system, ${v.len} in long: manifold flanges, down pipe, catalytic converter, ${v.res ? 'a resonator, ' : ''}${v.dual ? 'a crossover, two' : 'a'} oval muffler${v.dual ? 's' : ''}, tail pipe${v.dual ? 's' : ''} with trim tips and rubber hangers.`,
    vs: [['single, 110 in', 12, 110, 11, 0, { kindText: 'Single', len: 110, res: false, dual: false }], ['single with resonator, 124 in', 12, 124, 11, 0, { kindText: 'Single', len: 124, res: true, dual: false }], ['dual with resonators, 132 in', 34, 132, 12, 0, { kindText: 'Dual', len: 132, res: true, dual: true }]],
    build: (a, v) => {
      const { YF, YB, Z0, cx, W, H, D } = a, zc = Z0 + H * 0.45, rp = 28, xs = v.dual ? [-1, 1] : [0], sp = v.dual ? W * 0.36 : 0;
      for (const s of xs) {
        const x = cx + s * sp;
        a.box(x - 60, YF, zc - 40, x + 60, YF + 20, zc + 40);
        a.tube([[x, YF + 20, zc], [x, YF + 200, zc], [x, YF + 380, zc - H * 0.12], [x, YF + D * 0.25, zc - H * 0.12]], [rp, rp, rp, rp], 10);
        a.ell(x, YF + D * 0.28, zc - H * 0.1, 70, 230, 70, 12, 7);   // converter
        a.tube([[x, YF + D * 0.28 + 220, zc - H * 0.1], [x, YF + D * 0.5, zc - H * 0.1]], [rp, rp], 10);
        if (v.res) { a.ell(x, YF + D * 0.5, zc - H * 0.1, 55, 200, 55, 12, 7); a.tube([[x, YF + D * 0.5 + 190, zc - H * 0.1], [x, YF + D * 0.58, zc - H * 0.1]], [rp, rp], 10); }
        const my = YF + D * (v.res ? 0.78 : 0.7);
        a.ell(x, my, zc - H * 0.04, W * (v.dual ? 0.15 : 0.35), D * 0.1, H * 0.3, 16, 9);
        a.tube([[x, YF + D * (v.res ? 0.58 : 0.5), zc - H * 0.1], [x, my - D * 0.09, zc - H * 0.06]], [rp, rp], 10);
        a.tube([[x, my + D * 0.09, zc - H * 0.04], [x, YB - 70, zc], [x, YB - 5, zc + 20]], [rp, rp, rp * 1.3], 10); a.ycyl(YB - 90, YB, x, zc + 20, rp * 1.5, 12);
        for (const f of [0.2, 0.55, 0.9]) a.cyl(x + 70, YF + D * f, zc + 40, Z0 + H * 0.95, 12, 6);
        a.rect(x - W * (v.dual ? 0.075 : 0.17), my - D * 0.1, x + W * (v.dual ? 0.075 : 0.17), my + D * 0.1); a.line(x, YF, x, YB, 'EQUIP-DETAIL'); a.circ(x, YB - 40, rp * 1.5, 'EQUIP-DETAIL');
      }
      if (v.dual) { a.tube([[cx - sp, YF + D * 0.38, zc - H * 0.1], [cx + sp, YF + D * 0.44, zc - H * 0.1]], [rp * 0.8, rp * 0.8], 8); a.tube([[cx + sp, YF + D * 0.38, zc - H * 0.1], [cx - sp, YF + D * 0.44, zc - H * 0.1]], [rp * 0.8, rp * 0.8], 8); }
      a.log('Added the flange, down pipe, converter, ' + (v.res ? 'resonator, ' : '') + 'muffler' + (v.dual ? 's with a crossover' : '') + ', tail pipe tips and hangers (plan and 3D).');
    } }),

  fam({ cat: 'automotive/components', title: 'Generic disc brake',
    desc: (v) => `Disc brake with a ${v.dia} in vented rotor: friction ring with slots, hat with wheel studs and a centre bore, plus a ${v.pots === 1 ? 'single-piston sliding' : v.pots + '-piston fixed'} caliper with bracket, pads and a bleed nipple.`,
    vs: [['10 in rotor, sliding caliper', 5.4, 10.8, 10.8, 0, { dia: 10, pots: 1 }], ['12 in rotor, sliding caliper', 5.8, 12.8, 12.8, 0, { dia: 12, pots: 1 }], ['14 in rotor, four-piston caliper', 6.6, 14.8, 14.8, 0, { dia: 14, pots: 4 }]],
    build: (a, v) => {
      const { Z0, cx, W, D, YF } = a, R = (v.dia * I) / 2 * 0.97, y = YF + a.D / 2, z = Z0 + a.D / 2, xr = cx - W * 0.12, wt = 24;
      a.xcyl(xr - wt / 2, xr + wt / 2, y, z, R, 36);
      for (let k = 0; k < 24; k++) { const t = (k / 24) * TAU; a.xcyl(xr - wt / 2 - 2, xr + wt / 2 + 2, y + m.cos(t) * R * 0.84, z + m.sin(t) * R * 0.84, 5, 5); }
      a.xcyl(xr, cx + W * 0.34, y, z, R * 0.5, 24); a.xcyl(cx + W * 0.3, cx + W * 0.45, y, z, R * 0.56, 24);
      for (let k = 0; k < 5; k++) { const t = (k / 5) * TAU; a.xcyl(cx + W * 0.45, cx + W * 0.5, y + m.cos(t) * R * 0.34, z + m.sin(t) * R * 0.34, 9, 6); }
      const ca = z + R * 0.5, cw = v.pots === 1 ? R * 0.5 : R * 0.68, ch = R * 0.5;
      a.box(xr - 52, y - cw, ca - ch * 0.5, xr - 14, y + cw, ca + ch * 0.5);                  // inboard half
      a.box(xr + 14, y - cw, ca - ch * 0.5, xr + 46, y + cw, ca + ch * 0.5);                  // outboard half
      a.box(xr - 52, y - cw, ca + ch * 0.5, xr + 46, y + cw, ca + ch * 0.5 + 26);             // bridge over the rotor
      const ps = v.pots === 1 ? [0] : [-0.55, -0.18, 0.18, 0.55];
      for (const p2 of ps) a.xcyl(xr - 64, xr - 40, y + p2 * cw, ca, cw * (v.pots === 1 ? 0.5 : 0.2), 10);
      a.box(xr - 52, y + cw, ca - ch * 0.3, xr + 46, y + cw + 50, ca + ch * 0.3);               // carrier arm
      a.cyl(xr - 33, y - cw * 0.6, ca + ch * 0.5 + 26, ca + ch * 0.5 + 60, 9, 6);
      a.rect(xr - 52, y - cw, xr + 46, y + cw + 50, 'EQUIP'); a.rect(xr - wt / 2, y - R, xr + wt / 2, y + R, 'EQUIP-DETAIL'); a.rect(xr, y - R * 0.5, cx + W * 0.5, y + R * 0.5, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the vented rotor ring with slots, hat with studs, ' + (v.pots === 1 ? 'sliding' : 'fixed') + ' caliper with ' + v.pots + ' piston' + (v.pots > 1 ? 's' : '') + ', bracket, pads and bleed nipple (plan and 3D).');
    } }),

  fam({ cat: 'automotive/components', title: 'Generic radiator',
    desc: (v) => `Cooling radiator, ${v.core}: a finned core with ${v.rows} tube rows, top and bottom tanks with hose outlets, a filler cap, mounting brackets${v.fan ? ', and a fan shroud with a seven-blade fan' : ''}.`,
    vs: [['small core, 20 x 14 in', 20, 4, 14, 0, { core: '20 x 14 in', rows: 1 }], ['medium core with fan, 26 x 18 in', 26, 9, 18, 0, { core: '26 x 18 in', rows: 2, fan: true }], ['large core with fan, 32 x 24 in', 32, 11, 24, 0, { core: '32 x 24 in', rows: 3, fan: true }]],
    build: (a, v) => {
      const { YF, YB, Z0, Z1, cx, W, H, D, X0 } = a, tk = 110, cd = v.fan ? D * 0.42 : D * 0.8, cy0 = YF + (v.fan ? 0 : D * 0.1), cy1 = cy0 + cd;
      a.box(X0 + tk, cy0, Z0 + tk, X0 + W - tk, cy1, Z1 - tk);
      const nf = m.floor((W - 2 * tk) / 12); for (let i = 0; i < nf; i++) { const x = X0 + tk + ((W - 2 * tk) * (i + 0.5)) / nf; a.box(x - 2, cy0 - 6, Z0 + tk, x + 2, cy1 + 6, Z1 - tk); }
      a.box(X0, cy0 - 10, Z1 - tk, X0 + W, cy1 + 10, Z1); a.box(X0, cy0 - 10, Z0, X0 + W, cy1 + 10, Z0 + tk);
      a.box(X0, cy0 - 6, Z0 + tk, X0 + 30, cy1 + 6, Z1 - tk); a.box(X0 + W - 30, cy0 - 6, Z0 + tk, X0 + W, cy1 + 6, Z1 - tk);
      a.cyl(X0 + W * 0.78, cy0 + cd / 2, Z1, Z1 + 45, 32, 10); a.cyl(X0 + W * 0.78, cy0 + cd / 2, Z1 + 45, Z1 + 55, 40, 10);
      a.tube([[X0 + W * 0.18, cy0 + cd / 2, Z1 - 20], [X0 + W * 0.18 - 50, cy0 + cd / 2, Z1 + 50]], [34, 34], 10);
      a.tube([[X0 + W * 0.82, cy0 + cd / 2, Z0 + 20], [X0 + W * 0.82 + 40, cy0 + cd / 2, Z0 - 0]], [34, 34], 10);
      a.xcyl(X0 + W - 5, X0 + W, cy0 + cd / 2, Z0 + tk / 2, 20, 6);
      if (v.rows > 1) a.line(X0 + tk, cy0 + cd * 0.5, X0 + W - tk, cy0 + cd * 0.5, 'EQUIP-DETAIL');
      if (v.fan) {
        const fy = cy1 + (YB - cy1) * 0.5, fr = m.min(W, H) * 0.43, fz = Z0 + H / 2;
        for (const [x0, z0, x1, z1] of [[X0 + tk, Z0 + tk, X0 + tk + 22, Z1 - tk], [X0 + W - tk - 22, Z0 + tk, X0 + W - tk, Z1 - tk], [X0 + tk, Z1 - tk - 22, X0 + W - tk, Z1 - tk], [X0 + tk, Z0 + tk, X0 + W - tk, Z0 + tk + 22]]) a.box(x0, cy1, z0, x1, YB - 30, z1);
        a.frame(X0 + tk, Z0 + tk, X0 + W - tk, Z1 - tk, YB - 52, YB - 30, m.max(24, (m.min(W, H) - 2 * tk) / 2 - fr * 1.0));
        a.ycyl(fy - 40, fy + 40, cx, fz, fr * 0.2, 12);
        for (let k = 0; k < 7; k++) { const t = (k / 7) * TAU; a.tube([[cx + m.cos(t) * fr * 0.18, fy, fz + m.sin(t) * fr * 0.18], [cx + m.cos(t + 0.15) * fr * 0.9, fy + 20, fz + m.sin(t + 0.15) * fr * 0.9]], [fr * 0.1, fr * 0.07], 4); }
        for (const [x, z] of [[X0 + 70, Z0 + 70], [X0 + W - 70, Z0 + 70], [X0 + 70, Z1 - 70], [X0 + W - 70, Z1 - 70]]) a.ycyl(cy1, YB - 30, x, z, 10, 6);
        a.circ(cx, fy, fr, 'EQUIP-DETAIL'); a.rect(X0 + tk, cy1, X0 + W - tk, YB - 30, 'EQUIP-DETAIL');
      }
      for (const s of [-1, 1]) a.box(cx + s * W * 0.3 - 40, cy0 + 20, Z0, cx + s * W * 0.3 + 40, cy1 - 20, Z0 + 22);
      a.rect(X0, cy0 - 10, X0 + W, cy1 + 10); a.outline('EQUIP-HIDDEN'); a.circ(X0 + W * 0.78, cy0 + cd / 2, 20, 'EQUIP-DETAIL');
      a.log('Added the finned core, side and end tanks, hose outlets, filler cap' + (v.fan ? ', fan shroud and seven-blade fan' : '') + ' (plan and 3D).');
    } }),

  // ===================================================== workshop =====================================================
  fam({ cat: 'automotive/workshop', title: 'Generic two-post vehicle lift',
    desc: (v) => `Two-post vehicle lift, ${v.cap} lb class, shown raised: two columns on floor plates, ${v.clear ? 'a clear-floor design with the top of the columns open' : 'an overhead beam across the columns'}, carriages with four swing arms and lift pads, a power unit and a row of lock-rack notches.`,
    vs: [['7,000 lb, overhead beam', 118, 54, 124, 0, { cap: '7,000', clear: false, lift: 600 }], ['9,000 lb, overhead beam', 134, 60, 144, 0, { cap: '9,000', clear: false, lift: 700 }], ['12,000 lb, clear floor', 146, 64, 148, 0, { cap: '12,000', clear: true, lift: 800 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, cw = 300, cd = 440, xc = W / 2 - cw / 2 - 20 - 400, yc = YF + D * 0.5, lz = Z0 + v.lift;
      for (const s of [-1, 1]) {
        const x = cx + s * xc;
        a.box(x - cw / 2 - 90, yc - cd / 2 - 100, Z0, x + cw / 2 + 90, yc + cd / 2 + 100, Z0 + 24);                       // floor plate
        a.box(x - cw / 2, yc - cd / 2, Z0 + 24, x + cw / 2, yc + cd / 2, Z1 - 20); a.box(x - cw / 2 - 10, yc - cd / 2 - 10, Z1 - 20, x + cw / 2 + 10, yc + cd / 2 + 10, Z1);
        for (let k = 0; k < 14; k++) a.box(x - s * (cw / 2) - 8 + (s > 0 ? -2 : 2), yc - 80, Z0 + 300 + k * (Z1 - Z0 - 600) / 14, x - s * (cw / 2) + 8 + (s > 0 ? -2 : 2), yc + 80, Z0 + 312 + k * (Z1 - Z0 - 600) / 14);   // lock-rack notches (inner face)
        a.box(x - cw / 2 - 20, yc - cd / 2 - 30, lz - 150, x + cw / 2 + 20, yc + cd / 2 + 30, lz + 250);                        // carriage
        for (const [dy, ang, len] of [[-cd / 2 - 20, -0.55, 1000], [cd / 2 + 20, 0.5, 1150]]) {
          const px = x - s * (cw / 2 + 10), py = yc + dy, ex = px - s * m.cos(ang) * len * 0.62, ey = py + m.sin(ang) * len * 0.62 + (dy < 0 ? 380 : -380) * 0 - dy * 0.3;
          a.box(px - 30, py - 40, lz - 30, px + 30, py + 40, lz + 90);
          a.tube([[px, py, lz + 30], [(px + ex) / 2, (py + ey) / 2, lz + 30], [ex, ey, lz + 30]], [46, 40, 36], 8);
          a.cyl(ex, ey, lz + 30, lz + 105, 62, 12); a.line(px, py, ex, ey, 'EQUIP-DETAIL'); a.circ(ex, ey, 62, 'EQUIP-DETAIL');
        }
        a.rect(x - cw / 2, yc - cd / 2, x + cw / 2, yc + cd / 2); a.rect(x - cw / 2 - 90, yc - cd / 2 - 100, x + cw / 2 + 90, yc + cd / 2 + 100, 'EQUIP-HIDDEN');
      }
      const sx = cx + xc * 1; a.box(cx + xc + cw / 2, yc - 120, Z0 + 700, cx + xc + cw / 2 + 200, yc + 120, Z0 + 1300); a.xcyl(cx + xc + cw / 2 + 200, cx + xc + cw / 2 + 330, yc, Z0 + 1000, 100, 10);
      if (!v.clear) {
        a.box(cx - xc - cw / 2, yc - 120, Z1 - 160, cx + xc + cw / 2, yc + 120, Z1 - 20); a.box(cx - 300, yc - 160, Z1 - 20, cx + 300, yc + 160, Z1);
        a.rect(cx - xc, yc - 120, cx + xc, yc + 120, 'EQUIP-DETAIL');
      } else { a.tube([[cx - xc, yc, Z0 + 40], [cx + xc, yc, Z0 + 40]], [10, 10], 5); a.box(cx - xc, yc - 40, Z0 + 24, cx + xc, yc + 40, Z0 + 36); }
      a.outline('EQUIP-HIDDEN');
      a.log('Added the floor plates, columns with lock-rack notches, carriages, four swing arms with pads, power unit and ' + (v.clear ? 'the clear-floor cover plate' : 'the overhead beam') + ' (plan and 3D).');
    } }),

  fam({ cat: 'automotive/workshop', title: 'Generic four-post vehicle lift',
    desc: (v) => `Four-post drive-on vehicle lift, ${v.cap} lb class, shown raised: four columns with top cross beams and side rails, two long runways with rear ramps and front wheel stops, lifting cables and a power unit${v.turn ? ', plus front turn plates and rear slip plates for wheel alignment' : ''}.`,
    vs: [['9,000 lb, 200 in runways', 118, 232, 86, 0, { cap: '9,000', lift: 700, rw: 560 }], ['14,000 lb, alignment, 240 in runways', 126, 280, 90, 0, { cap: '14,000', lift: 800, rw: 600, turn: true }], ['18,000 lb, truck, 300 in runways', 134, 340, 104, 0, { cap: '18,000', lift: 900, rw: 640 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, pc = 170, lz = Z0 + v.lift, rl = D - 560;
      const px = [X0 + pc / 2 + 30, X1 - pc / 2 - 30], py = [YF + pc / 2 + 30, YB - pc / 2 - 30];
      for (const x of px) for (const y of py) { a.box(x - pc / 2 - 40, y - pc / 2 - 40, Z0, x + pc / 2 + 40, y + pc / 2 + 40, Z0 + 20); a.box(x - pc / 2, y - pc / 2, Z0 + 20, x + pc / 2, y + pc / 2, Z1 - 80); a.box(x - pc / 2 - 10, y - pc / 2 - 10, Z1 - 80, x + pc / 2 + 10, y + pc / 2 + 10, Z1); }
      for (const y of py) a.box(px[0], y - 80, Z1 - 160, px[1], y + 80, Z1 - 80);
      for (const x of px) a.tube([[x, py[0], Z1 - 40], [x, py[1], Z1 - 40]], [28, 28], 6);
      const rwx = [cx - W * 0.28, cx + W * 0.28], rwW = v.rw / 2;
      for (const x of rwx) {
        a.box(x - rwW, YF + 340, lz, x + rwW, YB - 340, lz + 160); a.box(x - rwW, YF + 340, lz + 160, x - rwW + 50, YB - 340, lz + 240); a.box(x + rwW - 50, YF + 340, lz + 160, x + rwW, YB - 340, lz + 240);
        prismX(a, [[YB - 340, lz + 160], [YB - 340, lz], [YB - 40, lz - 10], [YB - 40, lz]].map((p2) => p2), x - rwW, x + rwW);
        a.box(x - rwW + 40, YF + 380, lz + 160, x + rwW - 40, YF + 380 + 90, lz + 270);
        a.line(x - rwW, YF + 340, x - rwW, YB - 340, 'EQUIP-DETAIL'); a.rect(x - rwW, YF + 340, x + rwW, YB - 40, 'EQUIP');
        if (v.turn) { a.cyl(x, YF + 700, lz + 160, lz + 175, 220, 14); a.cyl(x, YB - 700, lz + 160, lz + 175, 220, 14); a.circ(x, YF + 700, 220, 'EQUIP-DETAIL'); a.circ(x, YB - 700, 220, 'EQUIP-DETAIL'); }
      }
      for (const x of px) for (const y of py) a.tube([[x, y, Z1 - 80], [x + (x > cx ? -1 : 1) * 140, y, lz + 60]], [9, 9], 5);
      a.box(px[1] + pc / 2, py[0] - 120, Z0 + 600, px[1] + pc / 2 + 180, py[0] + 120, Z0 + 1200);
      for (const y of [YF + 340, YB - 340]) a.line(rwx[0] - rwW, y, rwx[1] + rwW, y, 'EQUIP-HIDDEN');
      for (const x of px) for (const y of py) a.rect(x - pc / 2, y - pc / 2, x + pc / 2, y + pc / 2, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the four columns with top beams and rails, two runways with ramps and wheel stops, cables and power unit' + (v.turn ? ', front turn plates and rear slip plates' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'automotive/workshop', title: 'Generic scissor lift',
    desc: (v) => `${v.kindText} scissor vehicle lift shown raised: two runway platforms with side curbs and ramps, a crossed pair of scissor arms with pivot pins and a hydraulic cylinder under each platform, base frames and a power unit.`,
    vs: [['low-rise, 6,000 lb', 98, 84, 34, 0, { kindText: 'Low-rise', lift: 700, pw: 560 }], ['mid-rise, 8,000 lb', 106, 108, 54, 0, { kindText: 'Mid-rise', lift: 1100, pw: 600 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, lz = Z0 + v.lift, pw = v.pw, xs = [cx - W * 0.27, cx + W * 0.27], L = D - 160;
      for (const x of xs) {
        a.box(x - pw / 2 + 40, YF + 80, Z0, x + pw / 2 - 40, YB - 80, Z0 + 80);
        a.box(x - pw / 2, YF + 80, lz, x + pw / 2, YB - 80, lz + 90); a.box(x - pw / 2, YF + 80, lz + 90, x - pw / 2 + 40, YB - 80, lz + 160); a.box(x + pw / 2 - 40, YF + 80, lz + 90, x + pw / 2, YB - 80, lz + 160);
        const y0 = YF + 160, y1 = YB - 160, zlo = Z0 + 80, zhi = lz;
        for (const s of [-1, 1]) { const xx = x + s * (pw / 2 - 90); a.tube([[xx, y0, zlo + 20], [xx, y1, zhi - 20]], [34, 34], 6); a.tube([[xx, y1, zlo + 20], [xx, y0, zhi - 20]], [34, 34], 6); a.xcyl(xx - 30, xx + 30, (y0 + y1) / 2, (zlo + zhi) / 2, 26, 8); }
        a.tube([[x, y0 + L * 0.3, zlo + 60], [x, y1 - L * 0.25, zhi - 60]], [70, 70], 10);
        prismX(a, [[YF + 80, lz + 90], [YF + 80, lz], [YF - 0 + 360, lz + 90]].map((p2) => p2), x - pw / 2 + 20, x + pw / 2 - 20);
        a.rect(x - pw / 2, YF + 80, x + pw / 2, YB - 80); a.rect(x - pw / 2 + 40, YF + 80 + 280, x + pw / 2 - 40, YB - 80 - 40, 'EQUIP-DETAIL'); a.line(x, YF + 80, x, YB - 80, 'EQUIP-HIDDEN');
      }
      a.box(xs[1] + pw / 2 + 20, YB - 500, Z0, xs[1] + pw / 2 + 400, YB - 100, Z0 + 1000);
      a.log('Added the two runway platforms with curbs and ramps, scissor arms with pivot pins, hydraulic cylinders, base frames and the power unit (plan and 3D).');
    } }),

  fam({ cat: 'automotive/workshop', title: 'Generic hydraulic floor jack',
    desc: (v) => `${v.cap} floor jack: a long welded chassis on two front rollers and two swivel casters, a lifting arm with a saddle cup, a hydraulic cylinder, a release valve and a pumping handle with a grip.`,
    vs: [['2 ton, low profile', 14, 34, 34, 0, { cap: '2 ton', len: 0.7 }], ['3 ton, standard', 15, 38, 38, 0, { cap: '3 ton', len: 0.8 }], ['4 ton, long reach', 17, 44, 40, 0, { cap: '4 ton', len: 0.9 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, hw = W * 0.4, yf = YF + 60;
      a.box(cx - hw, yf + 60, Z0 + 55, cx + hw, YB - D * 0.34, Z0 + 115);              // chassis
      a.box(cx - W * 0.28, YB - D * 0.34, Z0 + 55, cx + W * 0.28, YB - D * 0.1, Z0 + 140);   // rear housing
      for (const s of [-1, 1]) { a.xcyl(cx + s * hw - 20, cx + s * hw + 20, yf + 20, Z0 + 55, 55, 12); a.rect(cx + s * hw - 20, yf - 35, cx + s * hw + 20, yf + 75, 'EQUIP-DETAIL'); a.caster(cx + s * hw, YB - D * 0.06, 110); a.circ(cx + s * hw, YB - D * 0.06, 26, 'EQUIP-HIDDEN'); }
      a.box(cx - W * 0.3, yf + 20, Z0 + 115, cx + W * 0.3, yf + 140, Z0 + 140); a.box(cx - hw, YB - D * 0.06 - 35, Z0 + 92, cx + hw, YB - D * 0.06 + 35, Z0 + 130);
      prismX(a, [[yf + 20, Z0 + 140], [YB - D * 0.3, Z0 + 140 + 55], [YB - D * 0.3, Z0 + 135 + 105], [yf + 20, Z0 + 175]], cx - hw * 0.55, cx - hw * 0.55 + 36); prismX(a, [[yf + 20, Z0 + 140], [YB - D * 0.3, Z0 + 195], [YB - D * 0.3, Z0 + 240], [yf + 20, Z0 + 175]], cx + hw * 0.55 - 36, cx + hw * 0.55);
      a.box(cx - hw * 0.55, yf + 20, Z0 + 140, cx + hw * 0.55, yf + 60, Z0 + 175);
      a.cyl(cx, yf + 90, Z0 + 175, Z0 + 215, 55, 14); a.cyl(cx, yf + 90, Z0 + 215, Z0 + 225, 70, 14); a.circ(cx, yf + 90, 70, 'EQUIP-DETAIL');
      a.tube([[cx, YB - D * 0.3 + 30, Z0 + 160], [cx, YB - D * 0.45, Z0 + 150]], [38, 38], 10);
      a.tube([[cx, YB - D * 0.08, Z0 + 140], [cx, YB - D * 0.02, Z0 + 330], [cx, YB - 15, Z1 - 120]], [18, 18, 16], 8);
      a.ycyl(YB - 140, YB - 10, cx, Z1 - 100, 24, 10); a.xcyl(cx - 12, cx + 12, YB - D * 0.28, Z0 + 150, 0.01 + 18, 6);
      a.rect(cx - hw, yf, cx + hw, YB - D * 0.08); a.rect(cx - W * 0.28, YB - D * 0.34, cx + W * 0.28, YB - D * 0.1, 'EQUIP-DETAIL'); a.line(cx, YB - D * 0.08, cx, YB - 15, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the chassis, front rollers, swivel casters, lifting arm with saddle cup, ram, release valve and pumping handle (plan and 3D).');
    } }),

  fam({ cat: 'automotive/workshop', title: 'Generic jack stand',
    desc: (v) => `${v.cap} ratcheting jack stand: four splayed legs with floor feet and cross braces, a central column with ${v.teeth} ratchet teeth, a pawl and release lever, and a cupped saddle.`,
    vs: [['3 ton', 10, 10, 17, 0, { cap: '3 ton', teeth: 8 }], ['6 ton', 13, 12.5, 22, 0, { cap: '6 ton', teeth: 11 }], ['12 ton', 17, 16, 28, 0, { cap: '12 ton', teeth: 14 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, top = Z0 + H * 0.62, ft = 40;
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const fx = cx + sx * (W / 2 - ft * 1.5), fy = cy + sy * (D / 2 - ft * 1.5);
        a.tube([[cx + sx * W * 0.1, cy + sy * D * 0.1, top], [fx, fy, Z0 + 18]], [W * 0.05, W * 0.05], 6); a.box(fx - ft * 1.2, fy - ft * 1.2, Z0, fx + ft * 1.2, fy + ft * 1.2, Z0 + 18);
      }
      for (const z of [0.18, 0.42]) { const rr = W * (0.43 - z * 0.7), zz = Z0 + H * z; a.tube([[cx - rr, cy - rr * (D / W), zz], [cx + rr, cy - rr * (D / W), zz], [cx + rr, cy + rr * (D / W), zz], [cx - rr, cy + rr * (D / W), zz], [cx - rr, cy - rr * (D / W), zz]], [9, 9, 9, 9, 9], 5); }
      a.box(cx - W * 0.17, cy - D * 0.17, top - 30, cx + W * 0.17, cy + D * 0.17, top + 20);
      a.cyl(cx, cy, top, Z1 - H * 0.12, W * 0.12, 12);
      for (let k = 0; k < v.teeth; k++) a.box(cx - W * 0.14, cy - D * 0.02 + D * 0.1, top + 10 + k * (Z1 - H * 0.14 - top) / v.teeth, cx + W * 0.14, cy + D * 0.2, top + 10 + k * (Z1 - H * 0.14 - top) / v.teeth + 6);
      a.box(cx - W * 0.1, cy + D * 0.12, top - 20, cx + W * 0.1, cy + D * 0.28, top + 10); a.tube([[cx, cy + D * 0.2, top], [cx, cy + D * 0.42, top + 40]], [7, 7], 5);
      a.cyl(cx, cy, Z1 - H * 0.12, Z1 - H * 0.07, W * 0.2, 14); a.cyl(cx, cy, Z1 - H * 0.07, Z1 - 4, W * 0.17, 14);
      a.rect(X0 + 15, YF + 15, X1 - 15, YB - 15); a.circ(cx, cy, W * 0.17, 'EQUIP-DETAIL'); a.line(X0 + 15, YF + 15, X1 - 15, YB - 15, 'EQUIP-HIDDEN'); a.line(X1 - 15, YF + 15, X0 + 15, YB - 15, 'EQUIP-HIDDEN');
      a.log('Added the four splayed legs with feet and braces, ratchet column with teeth, pawl and release lever, and the cupped saddle (plan and 3D).');
    } }),

  fam({ cat: 'automotive/workshop', title: 'Generic tyre changer',
    desc: (v) => `${v.kindText} tyre changer: a floor-standing base with a turntable and four clamp jaws, a swing-back tower with a horizontal arm and mount head, a side bead-breaker arm with a shovel, three foot pedals and a lubricant bottle shelf.`,
    vs: [['car and light truck', 44, 46, 76, 0, { kindText: 'Car and light-truck', tt: 0.36 }], ['heavy truck', 64, 66, 84, 0, { kindText: 'Heavy-truck', tt: 0.44 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, ty = YF + D * 0.55, tr = W * v.tt * 0.5, bz = Z0 + H * 0.4;
      a.box(cx - W * 0.4, YF + D * 0.18, Z0 + 30, cx + W * 0.4, YB - D * 0.14, bz); a.box(cx - W * 0.42, YF + D * 0.16, Z0, cx + W * 0.42, YB - D * 0.12, Z0 + 30);
      a.cyl(cx - W * 0.08, ty, bz, bz + 50, tr, 24); a.cyl(cx - W * 0.08, ty, bz + 50, bz + 90, tr * 0.2, 10);
      for (let k = 0; k < 4; k++) { const t = (k / 4) * TAU + 0.78, x = cx - W * 0.08 + m.cos(t) * tr * 0.72, y = ty + m.sin(t) * tr * 0.72; a.box(x - 36, y - 36, bz + 50, x + 36, y + 36, bz + 130); a.line(cx - W * 0.08, ty, x, y, 'EQUIP-DETAIL'); }
      a.box(cx + W * 0.28, YB - D * 0.3, bz, cx + W * 0.4, YB - D * 0.14, Z1 - 60);      // tower
      a.box(cx + W * 0.26, YB - D * 0.32, Z1 - 160, cx + W * 0.42, YB - D * 0.12, Z1);
      a.box(cx - W * 0.08 - 60, ty - 40, Z1 - 150, cx + W * 0.42, ty + 40, Z1 - 80);    // arm
      a.cyl(cx - W * 0.08, ty, Z1 - 80, Z1 - 150 - 140, 38, 10); a.box(cx - W * 0.08 - 60, ty - 12, Z1 - 330, cx - W * 0.08 + 60, ty + 12, Z1 - 250);
      a.xcyl(cx - W * 0.48 + 0, cx - W * 0.28, YB - D * 0.3, bz + 200, 30, 8);
      a.box(cx - W * 0.46, YF + D * 0.22, bz, cx - W * 0.36, YF + D * 0.42, bz + 340);   // bead breaker post
      a.tube([[cx - W * 0.36, YF + D * 0.3, bz + 300], [cx - W * 0.2, YF + D * 0.3, bz + 150]], [26, 22], 8); a.box(cx - W * 0.26, YF + D * 0.3 - 40, bz + 90, cx - W * 0.16, YF + D * 0.3 + 40, bz + 170);
      for (let k = 0; k < 3; k++) a.box(cx - W * 0.28 + k * 150, YF + 20, Z0 + 30, cx - W * 0.28 + k * 150 + 110, YF + D * 0.14, Z0 + 70);
      a.box(cx + W * 0.1, YF + D * 0.2, bz, cx + W * 0.38, YF + D * 0.3, bz + 40); for (let k = 0; k < 3; k++) a.cyl(cx + W * 0.14 + k * W * 0.1, YF + D * 0.25, bz + 40, bz + 150, 25, 8);
      a.outline(); a.circ(cx - W * 0.08, ty, tr, 'EQUIP-DETAIL'); a.rect(cx + W * 0.28, YB - D * 0.3, cx + W * 0.4, YB - D * 0.14, 'EQUIP-DETAIL');
      a.log('Added the base, turntable with four clamp jaws, swing tower with arm and mount head, bead-breaker arm, pedals and bottle shelf (plan and 3D).');
    } }),

  fam({ cat: 'automotive/workshop', title: 'Generic wheel balancer',
    desc: (v) => `${v.kindText} wheel balancer: a housing on feet with a cone-ready shaft, a hinged half-round wheel guard shown open, a tilted display panel, and a weight tray with pegs.`,
    vs: [['car', 38, 44, 62, 0, { kindText: 'Car', sr: 0.9 }], ['truck', 54, 56, 68, 0, { kindText: 'Truck', sr: 1.2 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, hz = Z0 + H * 0.3;
      sup(a, [{ y: YB - D * 0.62, x: cx, rx: W * 0.28, z0: Z0 + 40, z1: Z0 + H * 0.52 }, { y: YB - D * 0.3, x: cx, rx: W * 0.3, z0: Z0 + 40, z1: Z0 + H * 0.48 }, { y: YB - 40, x: cx, rx: W * 0.26, z0: Z0 + 40, z1: Z0 + H * 0.5 }], { seg: 14, n: 4 });
      a.box(cx - W * 0.3, YB - D * 0.62, Z0, cx + W * 0.3, YB - 30, Z0 + 40);
      a.ycyl(YB - D * 0.62 - 40, YB - D * 0.62, cx, hz + 120, 70, 14); a.ycyl(YF + D * 0.18, YB - D * 0.6, cx, hz + 120, 32 * v.sr, 12); a.ycyl(YF + D * 0.12, YF + D * 0.18, cx, hz + 120, 55 * v.sr, 12);
      a.box(cx - W * 0.28, YB - 140, Z0 + H * 0.48, cx + W * 0.28, YB - 20, Z1 - 110);
      prismX(a, [[YB - 120, Z0 + H * 0.78], [YB - 120, Z0 + H * 0.78 + 230], [YB - 70, Z0 + H * 0.78 + 230], [YB - 10, Z0 + H * 0.78]], cx - W * 0.2, cx + W * 0.2);
      for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.26, YB - D * 0.5, Z0 + H * 0.48], [cx + s * W * 0.26, YB - D * 0.5 + 20, Z0 + H * 0.48 + 40], [cx + s * W * 0.26, YB - D * 0.45, Z1 - 20]], [20, 20, 20], 8); }
      for (let k = 0; k < 14; k++) { const t = (k / 14) * m.PI; a.tube([[cx + m.cos(t) * W * 0.26, YB - D * 0.55, Z0 + H * 0.48 + m.sin(t) * W * 0.26 + 30], [cx + m.cos(t + 0.22) * W * 0.26, YB - D * 0.55, Z0 + H * 0.48 + m.sin(t + 0.22) * W * 0.26 + 30]], [10, 10], 4); }
      a.tube([[cx - W * 0.26, YB - D * 0.4, Z0 + H * 0.48 + 30], [cx - W * 0.26, YB - D * 0.4, Z0 + H * 0.48 + W * 0.26 + 30], [cx + W * 0.26, YB - D * 0.4, Z0 + H * 0.48 + W * 0.26 + 30], [cx + W * 0.26, YB - D * 0.4, Z0 + H * 0.48 + 30]], [8, 8, 8, 8], 4);
      a.box(cx - W * 0.4, YB - D * 0.5, Z0 + H * 0.38, cx - W * 0.28, YB - D * 0.18, Z0 + H * 0.4); for (let k = 0; k < 4; k++) a.cyl(cx - W * 0.34, YB - D * 0.44 + k * 70, Z0 + H * 0.4, Z0 + H * 0.46, 9, 6);
      a.rect(cx - W * 0.3, YB - D * 0.62, cx + W * 0.3, YB - 30); a.circ(cx, YF + D * 0.15, 55 * v.sr, 'EQUIP-DETAIL'); a.line(cx, YF + D * 0.15, cx, YB - D * 0.62, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the housing, measuring shaft with flange, open wheel guard hoops, tilted display and the weight tray with pegs (plan and 3D).');
    } }),

  fam({ cat: 'automotive/workshop', title: 'Generic parts washer',
    desc: (v) => `${v.kindText} parts washer: a steel cabinet with a work sink and grate, a hinged lid shown open on a strut, a flexible-neck spout with nozzle, a solvent drum under the sink and a foot-pump pedal.`,
    vs: [['bench-top, 30 in', 30, 24, 44, 0, { kindText: 'Bench-top', stand: false }], ['floor-standing, 40 in', 40, 30, 60, 0, { kindText: 'Floor-standing', stand: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, st = v.stand ? H * 0.5 : H * 0.42, sz = Z0 + H * (v.stand ? 0.6 : 0.5);
      a.box(X0 + 20, YF + 20, Z0 + 60, X1 - 20, YB - 20, sz - 30); a.box(X0, YF, sz - 30, X1, YB, sz);
      for (const s of [-1, 1]) { a.box(s > 0 ? X1 - 40 : X0, YF, sz, s > 0 ? X1 : X0 + 40, YB, sz + 60); } a.box(X0, YF, sz, X1, YF + 40, sz + 60); a.box(X0, YB - 80, sz, X1, YB, sz + 150);
      a.box(X0 + 70, YF + 70, sz + 2, X1 - 70, YB - 130, sz + 22); for (let k = 0; k < 7; k++) a.box(X0 + 70, YF + 70 + k * ((YB - 130 - YF - 70) / 7), sz + 22, X1 - 70, YF + 80 + k * ((YB - 130 - YF - 70) / 7), sz + 32);
      if (v.stand) { for (const [x, y] of [[X0 + 30, YF + 30], [X1 - 30, YF + 30], [X0 + 30, YB - 30], [X1 - 30, YB - 30]]) a.cyl(x, y, Z0, Z0 + 60, 24, 8); a.cyl(cx, cx * 0 + (YF + YB) / 2, Z0 + 80, sz - 60, W * 0.22, 16); a.box(X1 - 30, YF + 50, Z0 + 20, X1 + 0.1, YF + 170, Z0 + 60); }
      prismX(a, [[YB - 80, sz + 150], [YB - 80 - H * 0.28, sz + 150 + H * 0.24], [YB - 60 - H * 0.28, sz + 150 + H * 0.24], [YB - 20, sz + 150]], X0 + 10, X1 - 10);   // open lid on its hinge
      a.tube([[X1 - 40, YB - 120, sz + 150], [X1 - 40, YB - 80 - H * 0.2, sz + 150 + H * 0.16]], [10, 10], 5);
      a.tube([[cx, YB - 150, sz + 20], [cx, YB - 210, sz + 150], [cx - W * 0.15, YB - 230, sz + 270], [cx - W * 0.2, YB - 300, sz + 250]], [20, 18, 16, 12], 8); a.cyl(cx - W * 0.2, YB - 300, sz + 200, sz + 250, 22, 8);
      a.rect(X0, YF, X1, YB); a.rect(X0 + 70, YF + 70, X1 - 70, YB - 130, 'EQUIP-DETAIL'); a.rect(X0 + 10, YB - 80 - H * 0.28, X1 - 10, YB - 20, 'EQUIP-HIDDEN');
      a.log('Added the cabinet, work sink with grate, open lid on its strut, flexible spout with nozzle' + (v.stand ? ', solvent drum and pump pedal' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'automotive/workshop', title: 'Generic wheel alignment camera tower',
    desc: (v) => `Wheel alignment camera tower with a ${v.beam} in beam: a cabinet base on four casters with a monitor and keyboard shelf, a vertical mast, a horizontal camera beam at the top with a pod at each end and a pair of sensor heads, and cable arms.`,
    vs: [['64 in beam', 70, 34, 76, 0, { beam: 64 }], ['82 in beam', 88, 36, 82, 0, { beam: 82 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, bz = Z0 + H * 0.3, my = YB - D * 0.4;
      a.box(cx - W * 0.17, YB - D * 0.84, Z0 + 110, cx + W * 0.17, YB - D * 0.1, bz); for (const [x, y] of [[cx - W * 0.15, YB - D * 0.8], [cx + W * 0.15, YB - D * 0.8], [cx - W * 0.15, YB - D * 0.14], [cx + W * 0.15, YB - D * 0.14]]) a.caster(x, y, 110);
      a.box(cx - W * 0.17, YB - D * 0.95, bz, cx + W * 0.17, YB - D * 0.84, bz + 40); a.box(cx - W * 0.1, YB - D * 0.84, bz + 40, cx + W * 0.1, YB - D * 0.68, bz + 55);
      a.box(cx - W * 0.16, YB - D * 0.7, bz + 40, cx + W * 0.16, YB - D * 0.62, bz + 560);
      a.box(cx - W * 0.14, YB - D * 0.75, bz + 100, cx + W * 0.14, YB - D * 0.7, bz + 460);
      a.tube([[cx, my, bz], [cx, my, Z1 - 60]], [50, 50], 12);
      a.box(cx - W * 0.5 + 40, my - 50, Z1 - 120, cx + W * 0.5 - 40, my + 50, Z1 - 40);
      for (const s of [-1, 1]) { const x = cx + s * (W * 0.5 - 130); a.box(x - 140, my - 90, Z1 - 200, x + 140, my + 90, Z1); a.ycyl(my - 110, my - 90, x - 50, Z1 - 100, 36, 10); a.ycyl(my - 110, my - 90, x + 50, Z1 - 100, 36, 10); a.circ(x - 50, my - 100, 36, 'EQUIP-DETAIL'); a.circ(x + 50, my - 100, 36, 'EQUIP-DETAIL'); }
      for (const s of [-1, 1]) a.tube([[cx + s * 60, my, bz + 200], [cx + s * W * 0.3, my + 10, bz + 400], [cx + s * W * 0.42, my + 10, Z1 - 200]], [8, 8, 8], 5);
      a.rect(cx - W * 0.17, YB - D * 0.95, cx + W * 0.17, YB - D * 0.1); a.rect(cx - W * 0.5 + 40, my - 50, cx + W * 0.5 - 40, my + 50, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the casters and cabinet, monitor and keyboard shelf, mast, camera beam with two pods and sensor heads, and cable arms (plan and 3D).');
    } }),

  fam({ cat: 'automotive/workshop', title: 'Generic engine hoist',
    desc: (v) => `${v.cap} folding engine hoist: a U-shaped base with two splayed legs on casters, a vertical mast, a telescoping boom with a chain and hook, a hydraulic ram with a pumping handle and a foot release.`,
    vs: [['1 ton', 26, 54, 80, 0, { cap: '1 ton' }], ['2 ton', 34, 66, 88, 0, { cap: '2 ton' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, by = YB - D * 0.25, bz = Z0 + 90;
      for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.06, by, bz], [cx + s * W * 0.06, YB - 60, bz], [cx + s * (W / 2 - 60), YF + 100, bz]].map((p2, i) => i === 1 ? [cx + s * W * 0.06, by + 10, bz] : p2), [34, 34, 34], 6); a.caster(cx + s * (W / 2 - 60), YF + 100, 130); a.circ(cx + s * (W / 2 - 60), YF + 100, 28, 'EQUIP-DETAIL'); a.line(cx + s * W * 0.06, by, cx + s * (W / 2 - 60), YF + 100, 'EQUIP-DETAIL'); }
      a.tube([[cx - W * 0.06, by, bz], [cx + W * 0.06, by, bz]], [34, 34], 6); a.caster(cx - W * 0.05, YB - 80, 130); a.caster(cx + W * 0.05, YB - 80, 130);
      a.box(cx - 55, by - 50, bz, cx + 55, by + 60, Z1 - 330);
      a.box(cx - 70, by - 60, Z1 - 330, cx + 70, by + 70, Z1 - 200);
      a.tube([[cx, by, Z1 - 280], [cx, YF + D * 0.35, Z1 - 120], [cx, YF + 80, Z1 - 20]], [60, 48, 38], 8); a.box(cx - 25, YF + 60, Z1 - 60, cx + 25, YF + 110, Z1 - 12);
      a.tube([[cx, YF + 90, Z1 - 60], [cx, YF + 90, Z1 - 340]], [5, 5], 4);
      for (let k = 0; k < 6; k++) a.xcyl(cx - 12, cx + 12, YF + 90, Z1 - 350 - k * 28, 14, 6);
      a.tube([[cx, YF + 90, Z1 - 560], [cx + 70, YF + 90, Z1 - 600], [cx + 70, YF + 90, Z1 - 720]], [20, 20, 20], 6);
      a.tube([[cx, by + 10, bz + 140], [cx, by - D * 0.2, Z1 - 320]], [34, 34], 10); a.tube([[cx, by + 60, bz + 140], [cx, by + D * 0.15, bz + 90 + 220], [cx, YB - 15, bz + 380]], [14, 14, 12], 6); a.ycyl(YB - 150, YB - 8, cx, bz + 380, 20, 8);
      a.line(cx - W * 0.06, by, cx + W * 0.06, by, 'EQUIP-DETAIL'); a.line(cx, YF + 80, cx, by, 'EQUIP-DETAIL'); a.circ(cx, YF + 90, 25, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the splayed legs with casters, mast, telescoping boom with chain and hook, ram and the pumping handle (plan and 3D).');
    } }),

  fam({ cat: 'automotive/workshop', title: 'Generic mechanic creeper',
    desc: () => 'Mechanic creeper: a moulded lying board with raised side rails, a padded head rest, a tool tray lip at the foot end and six swivel casters under the frame.',
    vs: [['low profile, 40 in', 17, 40, 4.5, 0, {}]],
    build: (a) => {
      const { X0, X1, YF, YB, Z0, cx, W, D } = a, bz = Z0 + 55;
      a.box(X0 + 30, YF + 90, bz, X1 - 30, YB - 20, bz + 30);
      for (const s of [-1, 1]) a.box(s > 0 ? X1 - 60 : X0, YF + 20, bz, s > 0 ? X1 : X0 + 60, YB, bz + 50);
      a.box(X0 + 30, YF + 20, bz, X1 - 30, YF + 110, bz + 50); a.ell(cx, YF + 60, bz + 50, W * 0.3, 80, 25, 10, 5);
      for (const [x, y] of [[X0 + 50, YF + 70], [X1 - 50, YF + 70], [X0 + 50, (YF + YB) / 2], [X1 - 50, (YF + YB) / 2], [X0 + 50, YB - 50], [X1 - 50, YB - 50]]) { a.caster(x, y, 90); a.circ(x, y, 25, 'EQUIP-HIDDEN'); }
      a.box(X0 + 30, YB - 20, bz + 30, X1 - 30, YB, bz + 60);
      a.outline(); a.rect(X0 + 60, YF + 110, X1 - 60, YB - 40, 'EQUIP-DETAIL');
      a.log('Added the board with side rails, head rest, foot lip and six casters (plan and 3D).');
    } }),

  // ===================================================== fuel and charging =====================================================
  fam({ cat: 'automotive/charging', title: 'Generic charging post',
    desc: (v) => `${v.kindText} electric vehicle charging post: a base plinth and ${v.dc ? 'a tall power cabinet with louvred sides' : 'a slim pedestal'}, a display screen, a status light bar, a card reader${v.dc ? ', an emergency stop' : ''}, and ${v.guns} charging cable${v.guns > 1 ? 's' : ''} with connector${v.guns > 1 ? 's' : ''} resting in holster${v.guns > 1 ? 's' : ''}.`,
    vs: [['7 kW AC, single', 9, 9, 56, 0, { kindText: '7 kW AC single-outlet', guns: 1, dc: false }], ['22 kW AC, dual', 14, 10, 60, 0, { kindText: '22 kW AC two-outlet', guns: 2, dc: false }], ['50 kW DC, one cable', 30, 20, 76, 0, { kindText: '50 kW DC', guns: 1, dc: true }], ['150 kW DC, two cables', 44, 24, 84, 0, { kindText: '150 kW DC', guns: 2, dc: true, boom: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pl = 90;
      a.box(X0, YF, Z0, X1, YB, Z0 + pl);
      const bw = v.dc ? W * 0.62 : W * 0.7, by = v.dc ? D * 0.8 : D * 0.82;
      if (v.dc) {
        sup(a, [{ y: cy - by / 2, x: cx, rx: bw / 2 * 0.96, z0: Z0 + pl, z1: Z1 - H * 0.18 }, { y: cy - by / 2 + 40, x: cx, rx: bw / 2, z0: Z0 + pl, z1: Z1 - H * 0.12 }, { y: cy + by / 2 - 40, x: cx, rx: bw / 2, z0: Z0 + pl, z1: Z1 - H * 0.12 }, { y: cy + by / 2, x: cx, rx: bw / 2 * 0.96, z0: Z0 + pl, z1: Z1 - H * 0.18 }], { seg: 16, n: 5 });
        for (const s of [-1, 1]) for (let k = 0; k < 8; k++) a.box(cx + s * bw / 2 - 6, cy - by * 0.3, Z0 + pl + 150 + k * 40, cx + s * bw / 2 + 6, cy + by * 0.3, Z0 + pl + 170 + k * 40);
        a.box(cx - bw / 2 - 5, cy - by / 2 - 10, Z1 - H * 0.12, cx + bw / 2 + 5, cy + by / 2 + 10, Z1);
      } else {
        sup(a, [{ y: cy - by / 2, x: cx, rx: bw / 2 * 0.9, z0: Z0 + pl, z1: Z1 - 60 }, { y: cy - by / 2 + 20, x: cx, rx: bw / 2, z0: Z0 + pl, z1: Z1 - 20 }, { y: cy + by / 2 - 20, x: cx, rx: bw / 2, z0: Z0 + pl, z1: Z1 - 20 }, { y: cy + by / 2, x: cx, rx: bw / 2 * 0.9, z0: Z0 + pl, z1: Z1 - 60 }], { seg: 16, n: 3.5 });
        a.box(cx - bw / 2 - 4, cy - by / 2 - 4, Z1 - 60, cx + bw / 2 + 4, cy + by / 2 + 4, Z1);
      }
      const fy = cy - by / 2 - 6, sz = Z0 + H * 0.58;
      a.box(cx - bw * 0.3, fy - 14, sz, cx + bw * 0.3, fy + 8, sz + (v.dc ? 230 : 150));       // display
      a.box(cx - bw * 0.3, fy - 6, sz - 70, cx + bw * 0.3, fy + 6, sz - 40);                  // light bar
      a.box(cx + bw * 0.12, fy - 8, sz - 200, cx + bw * 0.3, fy + 8, sz - 120); a.ell(cx + bw * 0.21, fy - 10, sz - 160, 24, 10, 24, 8, 4);   // card reader
      if (v.dc) { a.ycyl(fy - 24, fy, cx - bw * 0.3 + 30, sz - 160, 24, 10); a.circ(cx - bw * 0.3 + 30, fy - 12, 24, 'EQUIP-DETAIL'); }
      const hs = v.guns === 1 ? [0] : [-1, 1];
      for (const h of hs) {
        const hx = v.guns === 1 ? cx + bw / 2 + 5 : cx + h * (bw / 2 + 5), side = v.guns === 1 ? 1 : h, hz = Z0 + H * 0.4, hy = cy;
        if (v.boom) {
          a.tube([[hx, hy, hz + 80], [hx + side * 140, hy, hz + 30]], [30, 30], 6);
        }
        a.box(hx + (side > 0 ? 0 : -90), hy - 40, hz, hx + (side > 0 ? 90 : 0), hy + 40, hz + 130);                      // holster
        a.cyl(hx + side * 45, hy, hz + 100, hz + 150, 28, 8);
        a.tube([[hx + side * 45, hy, hz + 130], [hx + side * 100, hy, hz + 20], [hx + side * 120, hy, Z0 + pl + 120], [hx + side * 60, hy + 60, Z0 + pl + 40], [hx + side * 20, hy - 40, hz - 140]], [20, 20, 20, 20, 20], 8);
        a.circ(hx + side * 45, hy, 28, 'EQUIP-DETAIL');
      }
      a.outline(); a.rect(cx - bw / 2, cy - by / 2, cx + bw / 2, cy + by / 2, 'EQUIP-DETAIL'); a.line(cx - bw * 0.3, fy, cx + bw * 0.3, fy, 'EQUIP-DETAIL');
      a.log('Added the plinth, ' + (v.dc ? 'louvred power cabinet' : 'pedestal') + ', display, light bar, card reader, ' + v.guns + ' holster' + (v.guns > 1 ? 's' : '') + ' and hanging cable' + (v.guns > 1 ? 's' : '') + ' with connector' + (v.guns > 1 ? 's' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'automotive/charging', title: 'Generic wall-mounted charger',
    desc: (v) => `${v.kindText} wall-mounted charging unit: a wall plate and housing, a front cover with a status light ring${v.kind === 'socket' ? ', a socket with a hinged cap' : v.kind === 'dual' ? ', two sockets with hinged caps' : ', a plug holster and a coiled tethered cable'}, and a cable entry gland.`,
    vs: [['socket, single outlet', 9, 5, 14, 40, { kindText: 'Single-outlet socket-type', kind: 'socket' }], ['tethered cable, 7 kW', 10, 9, 15, 40, { kindText: 'Tethered 7 kW', kind: 'cable' }], ['tethered cable, 22 kW', 12, 10, 18, 40, { kindText: 'Tethered 22 kW', kind: 'cable' }], ['dual outlet, 22 kW', 18, 6, 14, 40, { kindText: 'Dual-outlet 22 kW', kind: 'dual' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
      const fr = v.kind === 'cable' ? 100 : 0;
      a.box(X0 + 10, YB - 14, Z0 + 10, X1 - 10, YB, Z1 - 10);
      sup(a, [{ y: YB - 14, x: cx, rx: W * 0.5 - 6, z0: Z0 + 4, z1: Z1 - 4 }, { y: YF + fr + (YB - YF - fr) * 0.6, x: cx, rx: W * 0.5 - 4, z0: Z0 + 2, z1: Z1 - 2 }, { y: YF + fr + 20, x: cx, rx: W * 0.46, z0: Z0 + H * 0.04, z1: Z1 - H * 0.04 }, { y: YF + fr, x: cx, rx: W * 0.44, z0: Z0 + H * 0.08, z1: Z1 - H * 0.08 }], { seg: 16, n: 4 });
      const fy = YF + fr;
      ring3(a, cx, fy + 2, Z1 - H * 0.2, W * 0.07, 6, 16, 'y');
      if (v.kind === 'socket') { a.ycyl(fy - 14, fy + 10, cx, Z0 + H * 0.45, W * 0.2, 16); a.ycyl(fy - 22, fy - 14, cx, Z0 + H * 0.45, W * 0.15, 16); a.box(cx - W * 0.1, fy - 28, Z0 + H * 0.45 + 12, cx + W * 0.1, fy - 20, Z0 + H * 0.45 + 40); }
      else if (v.kind === 'dual') for (const s of [-1, 1]) { a.ycyl(fy - 14, fy + 10, cx + s * W * 0.25, Z0 + H * 0.42, W * 0.14, 16); a.ycyl(fy - 22, fy - 14, cx + s * W * 0.25, Z0 + H * 0.42, W * 0.1, 16); ring3(a, cx + s * W * 0.25, fy - 26, Z0 + H * 0.42 + 0, W * 0.08, 5, 12, 'y'); }
      else {
        a.box(cx + W * 0.1, fy - 50, Z0 + H * 0.12, cx + W * 0.5 - 4, fy + 0.5, Z0 + H * 0.4); a.ycyl(fy - 60, fy - 40, cx + W * 0.3, Z0 + H * 0.28, W * 0.09, 12);
        for (let k = 0; k < 6; k++) ring3(a, cx - W * 0.1, fy - 20 - k * 8, Z0 + H * 0.45, H * 0.25, 7, 18, 'y');
        a.tube([[cx - W * 0.1, fy - 30, Z0 + H * 0.2], [cx + W * 0.12, fy - 50, Z0 + H * 0.28]], [9, 9], 5);
      }
      a.ycyl(YB - 40, YB - 14, cx, Z0 + 14, 14, 8);
      a.outline(); a.rect(X0 + 10, YB - 14, X1 - 10, YB, 'EQUIP-DETAIL'); a.circ(cx, fy, W * 0.14, 'EQUIP-DETAIL');
      a.log('Added the wall plate, housing, status ring, ' + (v.kind === 'cable' ? 'plug holster and coiled cable' : v.kind === 'dual' ? 'two capped sockets' : 'capped socket') + ' and the gland (plan and 3D).');
    } }),

  fam({ cat: 'automotive/charging', title: 'Generic fuel pump',
    desc: (v) => `${v.kindText} fuel dispenser: a raised island plinth, a rounded cabinet with a header carrying price displays and a light panel, ${v.hoses} nozzle boots with hanging hoses and nozzles, grade buttons and a hose swivel${v.hi ? ', with a large-bore hose and a high-flow nozzle' : ''}.`,
    vs: [['single hose', 16, 18, 62, 0, { kindText: 'Single-hose', hoses: 1 }], ['two products, two hoses', 24, 20, 66, 0, { kindText: 'Two-product', hoses: 2 }], ['four products, four hoses', 32, 22, 68, 0, { kindText: 'Four-product', hoses: 4 }], ['high-flow truck dispenser', 30, 30, 84, 0, { kindText: 'High-flow truck', hoses: 2, hi: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pl = 160, bw = W * 0.6, bd = D * 0.5;
      a.box(X0, YF, Z0, X1, YB, Z0 + pl);
      sup(a, [{ y: cy - bd / 2, x: cx, rx: bw / 2 * 0.92, z0: Z0 + pl, z1: Z1 - H * 0.2 }, { y: cy - bd / 2 + 30, x: cx, rx: bw / 2, z0: Z0 + pl, z1: Z1 - H * 0.16 }, { y: cy + bd / 2 - 30, x: cx, rx: bw / 2, z0: Z0 + pl, z1: Z1 - H * 0.16 }, { y: cy + bd / 2, x: cx, rx: bw / 2 * 0.92, z0: Z0 + pl, z1: Z1 - H * 0.2 }], { seg: 16, n: 4 });
      a.box(cx - bw / 2 - 20, cy - bd / 2 - 20, Z1 - H * 0.16, cx + bw / 2 + 20, cy + bd / 2 + 20, Z1);
      for (const s of [-1, 1]) { a.box(cx - bw * 0.35, cy + s * (bd / 2 + 22) - 3, Z1 - H * 0.14, cx + bw * 0.35, cy + s * (bd / 2 + 22) + 3, Z1 - H * 0.04); a.box(cx - bw * 0.35, cy + s * (bd / 2) - 5 * s, Z1 - H * 0.5, cx + bw * 0.35, cy + s * (bd / 2) + 6 * s, Z1 - H * 0.3); for (let k = 0; k < 4; k++) a.cyl(cx - bw * 0.3 + k * bw * 0.2, cy + s * (bd / 2 + 8), Z1 - H * 0.56, Z1 - H * 0.54, 20, 8); }
      const n = v.hoses, perSide = n === 1 ? 1 : n === 2 ? 1 : 2;
      const slots = n === 1 ? [[1]] : n === 2 ? [[-1], [1]] : [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const sl of (n === 1 ? [[1, 0]] : n === 2 ? [[-1, 0], [1, 0]] : [[-1, -0.5], [-1, 0.5], [1, -0.5], [1, 0.5]])) {
        const [side, off] = sl, bx = cx + side * (bw / 2 + 5), by = cy + off * bd * 0.7, hr = v.hi ? 34 : 20;
        a.box(bx + (side > 0 ? 0 : -110), by - 60, Z0 + H * 0.44, bx + (side > 0 ? 110 : 0), by + 60, Z0 + H * 0.44 + 150);       // nozzle boot
        a.tube([[bx + side * 55, by, Z0 + H * 0.44 + 130], [bx + side * 55, by, Z0 + H * 0.44 + 250]], [30, 30], 8);          // nozzle
        a.box(bx + side * 25 - 20, by - 8, Z0 + H * 0.44 + 150, bx + side * 25 + 20, by + 8, Z0 + H * 0.44 + 190);
        a.tube([[bx + side * 55, by, Z0 + H * 0.44 + 250], [bx + side * 20, by, Z0 + H * 0.44 + 420], [cx + side * bw * 0.2, by, Z1 - H * 0.3], [cx + side * bw * 0.25, by, Z1 - H * 0.2]], [hr, hr, hr, hr], 8);
        a.tube([[bx + side * 55, by, Z0 + H * 0.44 + 170], [bx + side * 110, by, Z0 + H * 0.3], [bx + side * 110, by, Z0 + pl + 100], [bx + side * 40, by, Z0 + pl + 60]], [hr, hr, hr, hr], 8);
        a.circ(bx + side * 55, by, 30, 'EQUIP-DETAIL');
      }
      a.outline(); a.rect(cx - bw / 2, cy - bd / 2, cx + bw / 2, cy + bd / 2, 'EQUIP-DETAIL'); a.line(cx - W * 0.5, cy, cx + W * 0.5, cy, 'EQUIP-HIDDEN');
      a.log('Added the island plinth, rounded cabinet, header with displays, grade buttons, ' + v.hoses + ' nozzle boots, hanging hoses and nozzles (plan and 3D).');
    } }),

  fam({ cat: 'automotive/charging', title: 'Generic air and water stand',
    desc: (v) => `${v.kindText} service stand for a forecourt: a column on a plinth with a hooded top, a tyre inflation gauge, a hanging air hose with a chuck${v.water ? ', a water spout with a drip grate and bucket' : ''}${v.vac ? ', and a vacuum boom with a coiled hose and nozzle' : ''}.`,
    vs: [['air only', 12, 14, 56, 0, { kindText: 'Air-only', water: false, vac: false }], ['air and water', 20, 18, 56, 0, { kindText: 'Air and water', water: true, vac: false }], ['air, water and vacuum', 28, 20, 84, 0, { kindText: 'Air, water and vacuum', water: true, vac: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pl = 120, cw = v.water || v.vac ? W * 0.22 : W * 0.5;
      const px = v.vac ? cx - W * 0.3 : v.water ? cx - W * 0.2 : cx;
      a.box(px - cw / 2 - 50, YB - D * 0.4, Z0, px + cw / 2 + 50, YB - 20, Z0 + pl);
      a.box(px - cw / 2, YB - D * 0.4 + 50, Z0 + pl, px + cw / 2, YB - 70, Z1 - H * (v.vac ? 0.28 : 0.1));
      a.box(px - cw / 2 - 25, YB - D * 0.4 + 25, Z1 - H * (v.vac ? 0.28 : 0.1), px + cw / 2 + 25, YB - 45, Z1 - H * (v.vac ? 0.28 : 0.1) + 70);
      const gz = Z0 + H * 0.52 + (v.vac ? H * 0.0 : 0), gy = YB - D * 0.4 + 40;
      a.ycyl(gy - 30, gy, px, gz, 80, 18); a.ycyl(gy - 36, gy - 30, px, gz, 70, 18); a.circ(px, gy - 30, 70, 'EQUIP-DETAIL');
      a.box(px - cw * 0.35, gy - 14, gz - 230, px + cw * 0.35, gy, gz - 120);
      a.box(px - cw * 0.3, gy - 40, Z0 + H * 0.3, px + cw * 0.3, gy, Z0 + H * 0.3 + 90);      // hose holster
      for (let k = 0; k < 4; k++) ring3(a, px, gy - 60 - k * 12, Z0 + H * 0.52 - 250, 120, 9, 16, 'y');
      a.tube([[px + 130, gy - 40, Z0 + H * 0.52 - 250], [px + 200, gy - 40, Z0 + H * 0.52 - 330]], [9, 9], 5); a.box(px + 190, gy - 60, Z0 + H * 0.52 - 400, px + 230, gy - 30, Z0 + H * 0.52 - 320);
      if (v.water) {
        const wx = px + W * 0.4; a.box(wx - 90, YB - D * 0.4, Z0, wx + 90, YB - 20, Z0 + pl); a.box(wx - 60, YB - D * 0.4 + 50, Z0 + pl, wx + 60, YB - 80, Z0 + H * 0.4);
        a.tube([[wx, YB - D * 0.4 + 60, Z0 + H * 0.38], [wx, YB - D * 0.4 - 90, Z0 + H * 0.4], [wx, YB - D * 0.4 - 140, Z0 + H * 0.34]], [18, 18, 14], 8); a.cyl(wx, YB - D * 0.4 + 50, Z0 + H * 0.38, Z0 + H * 0.38 + 90, 12, 6);
        a.box(wx - 120, YB - D * 0.4 - 200, Z0 + pl, wx + 120, YB - D * 0.4 + 40, Z0 + pl + 30); for (let k = 0; k < 6; k++) a.box(wx - 120, YB - D * 0.4 - 190 + k * 38, Z0 + pl + 30, wx + 120, YB - D * 0.4 - 180 + k * 38, Z0 + pl + 40);
        a.rect(wx - 120, YB - D * 0.4 - 200, wx + 120, YB - D * 0.4 + 40, 'EQUIP-DETAIL'); a.rect(wx - 60, YB - D * 0.4 + 50, wx + 60, YB - 80, 'EQUIP-DETAIL');
      }
      if (v.vac) {
        const vx = cx + W * 0.34; a.box(vx - 140, YB - D * 0.45, Z0, vx + 140, YB - 20, Z0 + pl); a.box(vx - 110, YB - D * 0.45 + 40, Z0 + pl, vx + 110, YB - 80, Z0 + H * 0.5);
        a.tube([[vx, YB - D * 0.4, Z0 + H * 0.5], [vx, YB - D * 0.4, Z1 - 40], [vx - W * 0.16, YB - D * 0.4, Z1 - 20]], [30, 30, 24], 8);
        for (let k = 0; k < 5; k++) ring3(a, vx - W * 0.16, YB - D * 0.4 - 20, Z1 - 140 - k * 60, 200, 25, 14, 'y');
        a.rect(vx - 140, YB - D * 0.45, vx + 140, YB - 20, 'EQUIP-DETAIL');
      }
      a.rect(px - cw / 2 - 50, YB - D * 0.4, px + cw / 2 + 50, YB - 20); a.circ(px, gy - 30, 70, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the plinth, column with hood, gauge, hanging air hose and chuck' + (v.water ? ', water spout with grate' : '') + (v.vac ? ', vacuum boom with coiled hose' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'automotive/charging', title: 'Generic battery swap rack',
    desc: (v) => v.kind === 'cab' ? `Battery swap cabinet for light vehicles, ${v.slots} slots: a tall locker with ${v.slots} charging bays in rows, each with a door, a status light and a recessed pull, plus a display and a base plinth.` : `Battery swap station rack with ${v.slots} battery packs: a steel frame of uprights and shelf levels, ${v.slots} flat battery packs with handles and connectors, a stacker mast with a shuttle platform on a floor rail and a control cabinet.`,
    vs: [['scooter cabinet, 6 slots', 36, 22, 66, 0, { kind: 'cab', slots: 6, cols: 2 }], ['scooter cabinet, 12 slots', 60, 22, 72, 0, { kind: 'cab', slots: 12, cols: 4 }], ['vehicle rack, 12 packs', 150, 96, 108, 0, { kind: 'rack', slots: 12, cols: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
      if (v.kind === 'cab') {
        const rows = v.slots / v.cols, pl = 80, top = Z1 - 260;
        a.box(X0, YF, Z0, X1, YB, Z0 + pl); a.box(X0 + 20, YF + 20, Z0 + pl, X1 - 20, YB, Z1);
        a.box(X0 + 20, YF + 10, top, X1 - 20, YF + 40, Z1); a.box(X0 + 70, YF, top + 40, X1 - 70, YF + 20, Z1 - 40);
        const bw = (W - 80) / v.cols, bh = (top - Z0 - pl - 60) / rows;
        for (let c = 0; c < v.cols; c++) for (let r = 0; r < rows; r++) {
          const x0 = X0 + 40 + c * bw + 10, x1 = X0 + 40 + (c + 1) * bw - 10, z0 = Z0 + pl + 30 + r * bh + 10, z1 = Z0 + pl + 30 + (r + 1) * bh - 10;
          a.box(x0, YF, z0, x1, YF + 24, z1); a.box(x0 + (x1 - x0) * 0.3, YF - 12, (z0 + z1) / 2 - 10, x0 + (x1 - x0) * 0.7, YF, (z0 + z1) / 2 + 10); a.box(x0 + 20, YF - 4, z1 - 40, x0 + 60, YF, z1 - 24);
          a.rect(x0, YF, x1, YF + 24, 'EQUIP-DETAIL');
        }
        a.outline();
        a.log('Added the plinth, locker body, ' + v.slots + ' bay doors with status lights and pulls, and the display header (plan and 3D).');
        return;
      }
      const bays = 4, levels = 3, uw = 70, lv = (H - 400) / levels, rw = (W - 800) / bays, packD = 700, sy = YF + 900;
      for (let i = 0; i <= bays; i++) for (const y of [sy + 20, sy + packD + 60]) a.box(X0 + 400 + i * rw - uw / 2, y - 25, Z0, X0 + 400 + i * rw + uw / 2, y + 25, Z1 - 120);
      for (let l = 0; l <= levels; l++) { const z = Z0 + 120 + l * lv * 0.92; for (const y of [sy + 20, sy + packD + 60]) a.box(X0 + 400 - uw / 2, y - 20, z, X0 + 400 + bays * rw + uw / 2, y + 20, z + 50); if (l < levels) for (let i = 0; i < bays; i++) { const x0 = X0 + 400 + i * rw + 50, x1 = X0 + 400 + (i + 1) * rw - 50; a.box(x0, sy + 50, z + 50, x1, sy + packD + 30, z + 50 + lv * 0.5); a.box(x0 + 80, sy + 10, z + 50 + lv * 0.18, x1 - 80, sy + 50, z + 50 + lv * 0.32); a.box(x0 + 40, sy + packD + 30, z + 50 + lv * 0.1, x0 + 90, sy + packD + 60, z + 50 + lv * 0.4); } }
      a.box(X0 + 20, YF + 20, Z0, X1 - 20, YF + 60, Z0 + 20);
      for (const x of [X0 + 400 - 150, X0 + 400 + bays * rw + 150]) a.box(x - 25, YF + 400, Z0 + 20, x + 25, YB - 200, Z0 + 60);
      const mx2 = X0 + 400 - 200; a.tube([[mx2, sy - 300, Z0 + 60], [mx2, sy - 300, Z1 - 60]], [45, 45], 10); a.box(mx2 - 160, sy - 420, Z0 + H * 0.35, mx2 + 160, sy - 160, Z0 + H * 0.35 + 50); a.box(mx2 - 100, sy - 390, Z0 + H * 0.35 + 50, mx2 + 100, sy - 190, Z0 + H * 0.35 + 120);
      a.tube([[mx2, sy - 300, Z1 - 60], [X0 + 400 + bays * rw, sy - 300, Z1 - 60]], [20, 20], 6);
      a.box(X1 - 600, YB - 400, Z0, X1 - 20, YB - 20, Z0 + 1700); a.box(X1 - 560, YB - 410, Z0 + 1200, X1 - 300, YB - 400, Z0 + 1600);
      a.rect(X0 + 400, sy + 20, X0 + 400 + bays * rw, sy + packD + 60); a.rect(X1 - 600, YB - 400, X1 - 20, YB - 20, 'EQUIP-DETAIL'); a.line(X0 + 20, YF + 40, X1 - 20, YF + 40, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the rack uprights and shelf levels, 12 battery packs with handles and connectors, the stacker mast with shuttle platform, floor rail and control cabinet (plan and 3D).');
    } }),

  fam({ cat: 'automotive/charging', title: 'Generic solar charging canopy',
    desc: (v) => `Cantilever charging canopy over ${v.bays} bays: ${v.posts} posts with a roof beam, a tilted photovoltaic roof of panels with a fascia and a light strip, one charging pedestal between each pair of bays and a wheel stop in each bay.`,
    vs: [['2 bays', 216, 216, 156, 0, { bays: 2, posts: 2 }], ['4 bays', 432, 216, 156, 0, { bays: 4, posts: 3 }], ['6 bays', 648, 216, 156, 0, { bays: 6, posts: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, bw = W / v.bays, zb = Z0 + H * 0.88, zf = Z0 + H * 0.72;
      const px = Array.from({ length: v.posts }, (_, i) => X0 + 160 + (i * (W - 320)) / (v.posts - 1));
      for (const x of px) { a.box(x - 130, YB - 400, Z0, x + 130, YB - 100, Z0 + 150); a.box(x - 90, YB - 360, Z0 + 150, x + 90, YB - 140, Z0 + 150 + 1100); a.box(x - 100, YB - 380, Z0 + 150, x + 100, YB - 120, Z0 + 150 + 80); a.rect(x - 100, YB - 380, x + 100, YB - 120, 'EQUIP-DETAIL'); a.rect(x - 130, YB - 400, x + 130, YB - 100, 'EQUIP-HIDDEN'); }
      a.box(X0 + 40, YB - 330, zb - 330, X1 - 40, YB - 170, zb - 100);
      for (const x of px) a.tube([[x, YB - 250, Z0 + 1250], [x, YB - 250, zb - 330]], [70, 70], 10);
      prismX(a, [[YF + 120, zf - 90], [YB - 120, zb - 90], [YB - 120, zb + 20], [YF + 120, zf + 20]], X0 + 20, X1 - 20);
      for (let i = 0; i <= v.bays * 2; i++) { const x = X0 + 20 + ((W - 40) * i) / (v.bays * 2); a.tube([[x, YF + 120, zf + 26], [x, YB - 120, zb + 26]], [9, 9], 4); }
      a.box(X0 + 20, YF + 100, zf - 120, X1 - 20, YF + 140, zf + 40); a.box(X0 + 60, YF + 90, zf - 60, X1 - 60, YF + 102, zf - 40);
      a.rect(X0 + 20, YF + 120, X1 - 20, YB - 120, 'EQUIP-DETAIL');
      for (let i = 0; i <= v.bays; i++) { const x = X0 + i * bw; a.line(x, YF + 100, x, YB - 450, 'EQUIP-DETAIL'); }
      for (let i = 0; i < v.bays; i++) { const x = X0 + (i + 0.5) * bw; a.box(x - 280, YB - 560, Z0, x + 280, YB - 500, Z0 + 110); a.rect(x - 280, YB - 560, x + 280, YB - 500, 'EQUIP-DETAIL'); }
      for (let i = 1; i < v.bays; i += 2) { const x = X0 + i * bw; a.box(x - 100, YB - 480, Z0, x + 100, YB - 360, Z0 + 1150); a.box(x - 60, YB - 484, Z0 + 700, x + 60, YB - 480, Z0 + 960); a.rect(x - 100, YB - 480, x + 100, YB - 360); }
      a.line(X0, YB - 450, X1, YB - 450, 'EQUIP-HIDDEN');
      a.log('Added the posts, roof beam, tilted PV roof with panel ribs, fascia and light strip, charging pedestals and wheel stops (plan and 3D).');
    } }),

  fam({ cat: 'automotive/charging', title: 'Generic charging bollard',
    desc: (v) => `${v.kindText} charging bollard: a base flange with anchor bolts, ${v.kind === 'lamp' ? 'a tall lamp pole with a luminaire arm and a charging unit with socket near the base' : v.kind === 'boom' ? 'a rounded post with a swing arm that carries the cable overhead to a connector' : v.kind === 'dual' ? 'a slim post with two capped sockets, one on each side' : 'a slim post with a capped socket and a status light ring'}.`,
    vs: [['single-socket post', 8, 8, 44, 0, { kindText: 'Single-socket', kind: 'single' }], ['dual-socket post', 8, 8, 48, 0, { kindText: 'Dual-socket', kind: 'dual' }], ['cable-arm post', 14, 14, 72, 0, { kindText: 'Cable-arm', kind: 'boom' }], ['lamp-post charger', 16, 12, 144, 0, { kindText: 'Lamp-post', kind: 'lamp' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, k = v.kind, pw = k === 'lamp' ? W * 0.2 : W * 0.3;
      a.box(cx - W * 0.46, cy - D * 0.46, Z0, cx + W * 0.46, cy + D * 0.46, Z0 + 18); for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { a.cyl(cx + sx * W * 0.36, cy + sy * D * 0.36, Z0 + 18, Z0 + 38, 10, 6); a.circ(cx + sx * W * 0.36, cy + sy * D * 0.36, 10, 'EQUIP-DETAIL'); }
      if (k === 'lamp') {
        a.cyl(cx, cy, Z0 + 18, Z1 - 150, W * 0.13, 12); a.cone(cx, cy, Z0 + 18, Z0 + 150, W * 0.18, W * 0.13, 12);
        a.tube([[cx, cy, Z1 - 160], [cx, cy, Z1 - 80], [cx + W * 0.2, cy, Z1 - 20], [cx + W * 0.4, cy, Z1 - 40]], [W * 0.11, W * 0.1, W * 0.06, W * 0.06], 8); a.box(cx + W * 0.28, cy - D * 0.2, Z1 - 70, cx + W * 0.5 - 4, cy + D * 0.2, Z1 - 30);
        a.box(cx - W * 0.17, cy - D * 0.25, Z0 + 700, cx + W * 0.17, cy + D * 0.25, Z0 + 1300); a.ycyl(cy - D * 0.25 - 20, cy - D * 0.25, cx, Z0 + 1000, 80, 14); a.ycyl(cy - D * 0.25 - 28, cy - D * 0.25 - 20, cx, Z0 + 1000, 60, 14); ring3(a, cx, cy - D * 0.25 - 30, Z0 + 1240, 40, 7, 12, 'y');
        a.circ(cx, cy, W * 0.13, 'EQUIP-DETAIL');
      } else {
        sup(a, [{ y: cy, x: cx, rx: pw / 2 * 0.9, z0: Z0 + 18, z1: Z0 + 40 }, { y: cy, x: cx, rx: pw / 2, z0: Z0 + 18, z1: Z1 - 20 }], { seg: 14, n: 3 });
        a.cyl(cx, cy, Z0 + 18, Z1 - 30, pw / 2, 14); a.cyl(cx, cy, Z1 - 30, Z1 - 12, pw / 2 * 1.06, 14); a.cone(cx, cy, Z1 - 12, Z1, pw / 2 * 1.04, pw / 2 * 0.7, 14);
        ring3(a, cx, cy, Z1 - 150, pw / 2 + 6, 8, 16, 'z');
        const sks = k === 'dual' ? [-1, 1] : [0];
        for (const s of sks) { const sy = k === 'dual' ? cy + s * (pw / 2) : cy - pw / 2; a.ycyl(s === 0 ? sy - 24 : (s > 0 ? sy : sy - 24), s === 0 ? sy + 6 : (s > 0 ? sy + 24 : sy), cx, Z0 + H * 0.58, pw * 0.34, 14); }
        if (k === 'boom') {
          a.tube([[cx, cy, Z1 - 10], [cx + W * 0.5 - 60, cy, Z1 - 60], [cx + W * 0.5 - 40, cy, Z1 - 110]], [24, 20, 20], 8);
          a.tube([[cx + W * 0.5 - 40, cy, Z1 - 120], [cx + W * 0.48, cy, Z1 - 420], [cx + W * 0.3, cy + 40, Z1 - 560]], [14, 14, 14], 6); a.box(cx + W * 0.26, cy + 10, Z1 - 640, cx + W * 0.34, cy + 70, Z1 - 520);
        }
        a.circ(cx, cy, pw / 2, 'EQUIP-DETAIL');
      }
      a.outline('EQUIP-HIDDEN'); a.rect(cx - W * 0.46, cy - D * 0.46, cx + W * 0.46, cy + D * 0.46, 'EQUIP');
      a.log('Added the base flange with anchor bolts, ' + (k === 'lamp' ? 'lamp pole with arm and a charging unit' : k === 'boom' ? 'post with swing cable arm' : 'post with capped socket' + (k === 'dual' ? 's' : '') + ' and status ring') + ' (plan and 3D).');
    } }),
];
export default FAMS;

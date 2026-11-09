/* SPDX-License-Identifier: Apache-2.0 */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = m.PI;
// ------------------------------------------------------------------------------------------ helpers (copied patterns; mm, z up, front -Y)
/** extrude a convex polygon of [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** extrude a convex polygon of [x, z] points between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** a crowned tyre with a rim, a hub and tread lugs; axle along X at (x, y), radius r, width w; lugs = 0 for a smooth tyre */
function tyre(a, x, y, r, w, lugs = 16, zc = null, rim = 0.58) {
  const z = zc ?? a.Z0 + r, rb = lugs ? r * 0.95 : r;
  a.tube([[x - w / 2, y, z], [x - w * 0.36, y, z], [x + w * 0.36, y, z], [x + w / 2, y, z]], [rb * 0.9, rb, rb, rb * 0.9], 22);
  a.xcyl(x - w * 0.52, x + w * 0.52, y, z, r * rim, 14);
  a.xcyl(x - w * 0.6, x + w * 0.6, y, z, r * 0.2, 10);
  for (let k = 0; k < lugs; k++) for (const h of [0, 1]) {
    const th = ((k + h * 0.5) / lugs) * 2 * PI, c = m.cos(th), s = m.sin(th), tw = PI * rb / lugs * 0.32;
    const P = (rad, off) => [y + c * rad - s * off, z + s * rad + c * off];
    const xa = h ? x : x - w * 0.46, xb = h ? x + w * 0.46 : x;
    prismX(a, [P(rb * 0.98, -tw), P(r, -tw * 0.8), P(r, tw * 0.8), P(rb * 0.98, tw)], xa, xb);
  }
  a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL');
}
/** a smooth wheel pair on an axle at y: left and right, centres at +-gx */
function pair(a, gx, y, r, w, lugs = 0, zc = null) { for (const s of [-1, 1]) tyre(a, a.cx + s * gx, y, r, w, lugs, zc); a.xcyl(a.cx - gx, a.cx + gx, y, zc ?? a.Z0 + r, r * 0.12, 8); }
/** a post-and-rail line */
function rail(a, x0, y0, x1, y1, z0, z1, t = 14, posts = 3) {
  a.tube([[x0, y0, z1], [x1, y1, z1]], [t, t], 6);
  for (let i = 0; i < posts; i++) { const f = posts === 1 ? 0 : i / (posts - 1); a.tube([[x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z0], [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z1]], [t * 0.8, t * 0.8], 6); }
  a.line(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
/** cross braces on an X-Z plane at y */
function xbrace(a, x0, x1, y, z0, z1, t = 10) { a.tube([[x0, y, z0], [x1, y, z1]], [t, t], 5); a.tube([[x1, y, z0], [x0, y, z1]], [t, t], 5); }
/** a ladder in the Y-Z plane at x from (y0,z0) to (y1,z1) */
function ladder(a, x, y0, z0, y1, z1, w = 400, rungs = 6) {
  for (const s of [-1, 1]) a.tube([[x + s * w / 2, y0, z0], [x + s * w / 2, y1, z1]], [12, 12], 5);
  for (let i = 0; i <= rungs; i++) { const f = i / rungs; a.box(x - w / 2, y0 + (y1 - y0) * f - 10, z0 + (z1 - z0) * f - 8, x + w / 2, y0 + (y1 - y0) * f + 10, z0 + (z1 - z0) * f + 8); }
  a.line(x - w / 2, y0, x - w / 2, y1, 'EQUIP-DETAIL'); a.line(x + w / 2, y0, x + w / 2, y1, 'EQUIP-DETAIL');
}
/** a tube-and-axle mesh of vertical corrugation rings on a vertical cylinder */
function rings(a, cx, cy, z0, z1, r, n, seg = 28) { for (let i = 1; i < n; i++) { const z = z0 + ((z1 - z0) * i) / n; a.cyl(cx, cy, z - 6, z + 6, r + 7, seg); } }

// ------------------------------------------------------------------------------------------ machinery
/** A wheeled farm tractor. v: rr, fr (tyre radii in), tw, ftw (tyre widths in), cab (true/false), hitch */
function tractor(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, rr = v.rr * IN, fr = v.fr * IN, tw = v.tw * IN, ftw = v.ftw * IN;
  const ry = YB - D * 0.23, fy = YF + D * 0.2, gx = W / 2 - tw / 2 - 6, fgx = gx * 0.86;
  tyre(a, cx - gx, ry, rr, tw, 18); tyre(a, cx + gx, ry, rr, tw, 18);
  tyre(a, cx - fgx, fy, fr, ftw, 14); tyre(a, cx + fgx, fy, fr, ftw, 14);
  a.xcyl(cx - gx, cx + gx, ry, Z0 + rr, rr * 0.1, 8); a.xcyl(cx - fgx, cx + fgx, fy, Z0 + fr, fr * 0.1, 8);
  const zb = Z0 + H * 0.3, zh = Z0 + H * 0.56, hw = W * 0.17, yc = YF + D * 0.5;
  // frame / engine block and bonnet
  a.box(cx - hw * 0.8, YF + D * 0.05, zb - 40, cx + hw * 0.8, YB - D * 0.1, zb + 40);
  prismX(a, [[YF + D * 0.03, zb], [yc, zb], [yc, zh], [YF + D * 0.1, zh - H * 0.015], [YF + D * 0.03, zh - H * 0.07]], cx - hw, cx + hw);
  a.box(cx - hw * 0.8, YF + D * 0.02, zb + H * 0.04, cx + hw * 0.8, YF + D * 0.035, zh - H * 0.1);   // grille
  for (let i = 1; i < 5; i++) a.box(cx - hw * 0.8, YF + D * 0.015, zb + H * 0.04 + i * (zh - H * 0.14 - zb) / 5, cx + hw * 0.8, YF + D * 0.03, zb + H * 0.04 + i * (zh - H * 0.14 - zb) / 5 + 12);
  for (const s of [-1, 1]) a.box(cx + s * hw * 0.78 - 45, YF + D * 0.012, zh - H * 0.11, cx + s * hw * 0.78 + 45, YF + D * 0.03, zh - H * 0.05);   // headlamps
  if (v.weights) a.box(cx - hw * 0.7, YF - 0 + 4, zb - H * 0.06, cx + hw * 0.7, YF + D * 0.035, zb + H * 0.05);
  a.box(cx - fgx, fy - 40, Z0 + fr + 20, cx + fgx, fy + 40, zb);   // front axle housing
  a.tube([[cx + hw * 0.55, YF + D * 0.2, zh - 10], [cx + hw * 0.55, YF + D * 0.2, Z0 + H * (v.cab ? 0.84 : 0.7)]], [32, 26], 8);   // exhaust
  a.cyl(cx + hw * 0.55, YF + D * 0.2, Z0 + H * (v.cab ? 0.84 : 0.7), Z0 + H * (v.cab ? 0.84 : 0.7) + 40, 40, 8);
  // transmission housing and rear axle
  a.box(cx - hw * 1.1, yc, zb - 70, cx + hw * 1.1, YB - D * 0.1, zb + 120);
  // mudguards
  for (const s of [-1, 1]) {
    const x0 = cx + s * gx - tw * 0.58, x1 = cx + s * gx + tw * 0.58, zt = Z0 + rr * 2 + rr * 0.13;
    a.box(x0, ry - rr * 0.8, zt, x1, ry + rr * 0.8, zt + 22);
    prismX(a, [[ry - rr * 0.8, zt + 22], [ry - rr * 1.05, zt - rr * 0.32], [ry - rr * 0.8, zt - rr * 0.1]], x0, x1);
    prismX(a, [[ry + rr * 0.8, zt + 22], [ry + rr * 1.05, zt - rr * 0.32], [ry + rr * 0.8, zt - rr * 0.1]], x0, x1);
    a.rect(x0, ry - rr * 1.02, x1, ry + rr * 1.02, 'EQUIP-DETAIL');
    a.box(cx + s * (hw * 1.1 + 5) - 4, ry - 90, zt - rr * 0.34, cx + s * gx - s * tw * 0.4, ry + 90, zt - rr * 0.3);   // fender bracket
    a.box(cx + s * hw * 1.1, ry - 140, zb - 30, cx + s * (gx - tw * 0.55), ry + 140, zb + 25);   // step plate
    a.box(cx + s * (hw * 1.05), ry - 200, zb + H * 0.06, cx + s * (hw * 1.05) + s * 40, ry + 200, zb + H * 0.06 + 14);
  }
  if (v.cab) {
    const cw = m.min(W - 2 * tw - 160, W * 0.58), y0 = yc - D * 0.02, y1 = YB - D * 0.17, z0 = zb + 100, z1 = Z0 + H, t = 36;
    a.box(cx - cw / 2, y0, z0 - 40, cx + cw / 2, y1, z0 + 20);
    for (const sx of [-1, 1]) for (const [py, pk] of [[y0 + 20, 1], [y1 - 20, 1]]) a.tube([[cx + sx * (cw / 2 - 20), py === y0 + 20 ? y0 - 6 : py, z0], [cx + sx * (cw / 2 - 20), py === y0 + 20 ? y0 - 6 : py, z1 - 30]], [t * 0.5, t * 0.5], 6);
    for (const sx of [-1, 1]) a.tube([[cx + sx * (cw / 2 - 20), y0 + 20, z1 - 40], [cx + sx * (cw / 2 - 20), y1 - 20, z1 - 40]], [t * 0.4, t * 0.4], 6);
    a.box(cx - cw / 2 - 20, y0 - 20, z1 - 50, cx + cw / 2 + 20, y1 + 30, z1);   // roof
    a.box(cx - cw / 2 + 25, y0 + 4, z0 + 20, cx + cw / 2 - 25, y0 + 14, z1 - 55);  // windscreen glass
    a.box(cx - cw / 2 + 25, y1 - 14, z0 + 20, cx + cw / 2 - 25, y1 - 4, z1 - 55);   // rear glass
    for (const sx of [-1, 1]) a.box(cx + sx * (cw / 2 - 28) - 6, y0 + 40, z0 + 20, cx + sx * (cw / 2 - 28) + 6, y1 - 40, z1 - 55);
    a.box(cx - cw * 0.36, y0 + 60, z0 + 20, cx - cw * 0.36 + 30, y1 - 60, z0 + 140);  // seat block
    for (const sx of [-1, 1]) { a.tube([[cx + sx * (cw / 2), y0 + 40, z1 - 120], [cx + sx * (cw / 2 + 120), y0 + 10, z1 - 140]], [8, 8], 5); a.box(cx + sx * (cw / 2 + 120) - 15, y0, z1 - 330, cx + sx * (cw / 2 + 120) + 15, y0 + 20, z1 - 130); }   // mirrors
    a.box(cx - cw / 2 + 25, y0 - 6, z0 + (z1 - z0) * 0.5, cx + cw / 2 - 25, y0 + 4, z0 + (z1 - z0) * 0.5 + 18);   // windscreen mid rail
    a.rect(cx - cw / 2, y0, cx + cw / 2, y1, 'EQUIP');
    a.rect(cx - cw / 2 + 25, y0 + 25, cx + cw / 2 - 25, y1 - 25, 'EQUIP-DETAIL');
    a.box(cx - 40, y0 + 18, z0 + 40, cx + 40, y0 + 90, z0 + 120);   // wheel/steering
    a.cyl(cx, y0 + 60, z1 - 5, z1 + 0.01, 1, 3);
    a.box(cx - 60, y0 + 120, z1, cx + 60, y0 + 250, z1 + 38);   // roof beacon pod
  } else {
    // open platform: seat, steering wheel, rollover frame
    const sy = YB - D * 0.3, sz = zb + 120;
    a.box(cx - 220, sy - 220, sz - 30, cx + 220, sy + 260, sz);   // platform
    a.box(cx - 150, sy, sz, cx + 150, sy + 260, sz + 70);   a.box(cx - 150, sy + 220, sz + 70, cx + 150, sy + 280, sz + 400);   // seat
    a.tube([[cx, yc + 120, zh], [cx, yc + 260, zh + 380]], [18, 18], 6); a.xcyl(cx - 170, cx + 170, yc + 270, zh + 400, 20, 14);   // column and steering wheel
    for (const s of [-1, 1]) a.tube([[cx + s * (hw * 1.15), YB - D * 0.12, zb + 40], [cx + s * (hw * 1.15), YB - D * 0.12, Z0 + H - 30], [cx + s * (hw * 1.15), YB - D * 0.1, Z0 + H]], [30, 30, 30], 8);
    a.tube([[cx - hw * 1.15, YB - D * 0.12, Z0 + H - 15], [cx + hw * 1.15, YB - D * 0.12, Z0 + H - 15]], [30, 30], 8);
    a.rect(cx - 220, sy - 220, cx + 220, sy + 260, 'EQUIP-DETAIL');
  }
  // rear linkage: lower links, lift rods, top link, drawbar
  const hz = Z0 + H * 0.26, ytail = YB - 16;
  for (const s of [-1, 1]) {
    a.tube([[cx + s * hw * 1.05, YB - D * 0.1, hz + 30], [cx + s * hw * 1.45, ytail, hz]], [18, 14], 6);
    a.tube([[cx + s * hw * 1.2, YB - D * 0.12, zb + 150], [cx + s * hw * 1.3, YB - D * 0.07, hz + 30]], [12, 12], 5);
  }
  a.tube([[cx, YB - D * 0.11, zb + 190], [cx, ytail, zb + 20]], [14, 14], 6);
  a.box(cx - hw * 0.6, YB - D * 0.07, hz - 40, cx + hw * 0.6, ytail, hz - 10);
  a.rect(cx - hw * 1.5, YB - D * 0.1, cx + hw * 1.5, ytail, 'EQUIP-DETAIL');
  a.rect(cx - hw, YF + D * 0.03, cx + hw, yc, 'EQUIP-DETAIL');
  a.outline();
  a.log('Added the tyres with tread lugs, bonnet with grille and lamps, ' + (v.cab ? 'glazed cab with roof' : 'open seat platform with a rollover frame') + ', mudguards, exhaust and the rear three-point linkage (plan and 3D).');
}
const TRAC = (t, n) => fam({ cat: 'agriculture/machinery', title: t, desc: (v) => `Wheeled farm tractor, ${v.cab ? 'glazed cab' : 'open platform with a rollover frame'}, crowned rear tyres with tread lugs, smaller front tyres, bonnet and grille, exhaust and a rear three-point linkage.`, build: tractor, vs: n });
const tractors = TRAC('Generic farm tractor', [
  ['30 hp class, compact, open platform', 56, 108, 82, 0, { rr: 15, fr: 10, tw: 11, ftw: 7, cab: false }],
  ['55 hp class, open platform', 72, 128, 92, 0, { rr: 21, fr: 14, tw: 15, ftw: 9, cab: false }],
  ['100 hp class, cab', 96, 156, 117, 0, { rr: 28, fr: 20, tw: 18, ftw: 13, cab: true }],
  ['170 hp class, cab', 108, 184, 126, 0, { rr: 31, fr: 24, tw: 20, ftw: 15, cab: true, weights: true }],
  ['260 hp class, cab, front weights', 122, 208, 134, 0, { rr: 36, fr: 27, tw: 24, ftw: 17, cab: true, weights: true }],
]);

/** Combine harvester: header at the front (-Y), body, cab, grain tank, unloading auger, big drive tyres and small rear tyres. */
function combine(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, bw = m.min(W * 0.4, 150 * IN * 0.9), hw = W, hd = 100 * IN, yb0 = YF + hd;
  const dr = v.dr * IN, rr = 0.62 * dr;
  // header: floor, back wall, side walls, cutter bar, reel, auger
  const hz = Z0 + 22 * IN;
  a.box(X0, YF + 10, hz - 8 * IN, X1, yb0 - 160, hz - 5 * IN);
  a.box(X0, yb0 - 170, hz - 8 * IN, X1, yb0 - 150, hz + 24 * IN);
  a.box(X0, YF + 10, hz - 8 * IN, X0 + 40, yb0 - 150, hz + 24 * IN); a.box(X1 - 40, YF + 10, hz - 8 * IN, X1, yb0 - 150, hz + 24 * IN);
  a.box(X0, YF, hz - 9 * IN, X1, YF + 70, hz - 7 * IN);  // cutter bar
  for (let i = 0; i < 40; i++) { const x = X0 + 60 + i * (W - 120) / 39; a.box(x - 12, YF - 2, hz - 8.8 * IN, x + 12, YF + 100, hz - 7.8 * IN); }
  a.xcyl(X0 + 10, X1 - 10, YF + 420, hz + 22 * IN, 14 * IN * 0.5, 14);   // reel
  for (let k = 0; k < 6; k++) { const th = k / 6 * 2 * PI; a.xcyl(X0 + 30, X1 - 30, YF + 420 + m.cos(th) * 10 * IN, hz + 22 * IN + m.sin(th) * 10 * IN, 12, 6); }
  for (const s of [-1, 1]) for (const f of [0.0, 0.5, 1.0]) a.tube([[cx + s * (W / 2 - 55) * (f === 0 ? 0.999 : 1), YF + 420, hz + 22 * IN], [cx + s * (W / 2 - 55), yb0 - 400, hz + 34 * IN]], [10, 10], 5);
  a.xcyl(X0 + 40, X1 - 40, yb0 - 330, hz - 3 * IN, 8 * IN, 14);   // cross auger
  for (const s of [-1, 1]) a.tube([[cx + s * (W / 2 - 60), YF + 600, hz + 24 * IN], [cx + s * (W / 2 - 40), YF + 300, hz + 24 * IN + 2 * IN]], [8, 8], 5);   // divider tips
  a.rect(X0, YF, X1, yb0 - 150, 'EQUIP'); a.line(X0 + 20, YF + 420, X1 - 20, YF + 420, 'EQUIP-DETAIL'); a.line(X0, yb0 - 330, X1, yb0 - 330, 'EQUIP-DETAIL');
  // feeder house
  prismX(a, [[yb0 - 160, hz - 4 * IN], [yb0 + 20, hz + 6 * IN], [yb0 + 20, hz + 40 * IN], [yb0 - 160, hz + 20 * IN]], cx - 34 * IN, cx + 34 * IN);
  // body, grain tank, engine, cab
  const bz = Z0 + 40 * IN;
  prismX(a, [[yb0, bz], [YB - 20, bz], [YB - 20, bz + 76 * IN], [yb0 + 60 * IN, bz + 84 * IN], [yb0, bz + 62 * IN]], cx - bw / 2, cx + bw / 2);
  // tank (sloped sides) upper
  prismY(a, [[cx - bw / 2 - 20, bz + 70 * IN], [cx + bw / 2 + 20, bz + 70 * IN], [cx + bw / 2 - 10, Z0 + H - 38 * IN], [cx - bw / 2 + 10, Z0 + H - 38 * IN]], yb0 + 70 * IN, YB - 120 * IN);
  a.box(cx - bw / 2 + 20, yb0 + 70 * IN, Z0 + H - 38 * IN, cx + bw / 2 - 20, YB - 120 * IN, Z0 + H - 36 * IN);
  // engine hood at rear
  prismX(a, [[YB - 120 * IN, bz + 70 * IN], [YB - 8, bz + 56 * IN], [YB - 8, bz + 90 * IN], [YB - 120 * IN, bz + 100 * IN]], cx - bw * 0.36, cx + bw * 0.36);
  for (let i = 0; i < 6; i++) a.box(cx + bw * 0.36, YB - 100 * IN + i * 14 * IN, bz + 74 * IN, cx + bw * 0.36 + 5, YB - 100 * IN + i * 14 * IN + 6 * IN, bz + 94 * IN);   // intake grille
  // cab
  const cy0 = yb0 + 30, cy1 = yb0 + 66 * IN, cz0 = bz + 62 * IN, cz1 = Z0 + H, cw = 62 * IN;
  a.box(cx - cw / 2, cy0, cz0, cx + cw / 2, cy1, cz0 + 8);
  for (const sx of [-1, 1]) for (const py of [cy0 + 14, cy1 - 14]) a.tube([[cx + sx * (cw / 2 - 14), py, cz0], [cx + sx * (cw / 2 - 14), py, cz1 - 10]], [10, 10], 6);
  a.box(cx - cw / 2 - 12, cy0 - 20, cz1 - 14, cx + cw / 2 + 12, cy1 + 16, cz1);
  a.box(cx - cw / 2 + 16, cy0, cz0 + 8, cx + cw / 2 - 16, cy0 + 8, cz1 - 14);
  for (const sx of [-1, 1]) a.box(cx + sx * (cw / 2 - 14) - 4, cy0 + 20, cz0 + 8, cx + sx * (cw / 2 - 14) + 4, cy1 - 20, cz1 - 14);
  a.rect(cx - cw / 2, cy0, cx + cw / 2, cy1, 'EQUIP-DETAIL');
  // unloading auger: folded diagonally across the side of the tank
  a.tube([[cx + bw / 2 + 40, YB - 140 * IN, bz + 74 * IN], [cx + bw / 2 + 60, yb0 + 100 * IN, Z0 + H - 36 * IN + 1 * IN]], [7 * IN, 7 * IN], 10);
  // wheels: big drive tyres at the front of the body, small steer tyres at the back
  const dy = yb0 + 40 * IN, gx = bw / 2 + 4 * IN;
  tyre(a, cx - gx - 8 * IN, dy, dr, 22 * IN, 18); tyre(a, cx + gx + 8 * IN, dy, dr, 22 * IN, 18);
  a.xcyl(cx - gx, cx + gx, dy, Z0 + dr, 5 * IN, 10);
  tyre(a, cx - bw / 2 - 2 * IN, YB - 40 * IN, rr, 14 * IN, 14); tyre(a, cx + bw / 2 + 2 * IN, YB - 40 * IN, rr, 14 * IN, 14);
  a.rect(cx - bw / 2, yb0, cx + bw / 2, YB - 20, 'EQUIP');
  a.rect(cx + bw / 2 + 20, yb0 + 100 * IN, cx + bw / 2 + 120, YB - 140 * IN, 'EQUIP-DETAIL');
  a.log('Added the header with cutter bar, reel and cross auger, feeder house, threshing body, grain tank, cab, folded unloading auger and the front drive and rear steer tyres (plan and 3D).');
}
const combines = fam({ cat: 'agriculture/machinery', title: 'Generic combine harvester', desc: (v) => `Self-propelled grain combine with a ${v.hdr} ft header (cutter bar, reel, cross auger), feeder, cab, grain tank, folded unloading auger and big front drive tyres.`, build: combine, vs: [
  ['20 ft header', 262, 430, 156, 0, { dr: 31, hdr: 20 }], ['25 ft header', 318, 440, 160, 0, { dr: 33, hdr: 25 }], ['30 ft header', 380, 452, 166, 0, { dr: 35, hdr: 30 }] ] });

/** Spray boom across the width at y, height z: a lattice truss with nozzle drops; folding hinges every third. */
function boom(a, y, z, nz = 36) {
  const { X0, X1, cx } = a, sp = (X1 - X0) / (nz - 1);
  a.tube([[X0 + 30, y, z + 160], [X1 - 30, y, z + 160]], [18, 18], 6); a.tube([[X0 + 30, y - 140, z], [X1 - 30, y - 140, z]], [16, 16], 6);
  const n = m.round((X1 - X0) / 480);
  for (let i = 0; i <= n; i++) { const x = X0 + 30 + (i * (X1 - X0 - 60)) / n; a.tube([[x, y, z + 160], [x, y - 140, z]], [8, 8], 4); }
  for (let i = 0; i < n; i++) { const x0 = X0 + 30 + (i * (X1 - X0 - 60)) / n, x1 = X0 + 30 + ((i + 1) * (X1 - X0 - 60)) / n; a.tube([[x0, y, z + 160], [x1, y - 140, z]], [6, 6], 4); }
  a.tube([[X0 + 30, y - 140, z - 90], [X1 - 30, y - 140, z - 90]], [10, 10], 6);   // spray line
  for (let i = 0; i < nz; i++) a.box(X0 + 30 + i * (X1 - X0 - 60) / (nz - 1) - 8, y - 150, z - 150, X0 + 30 + i * (X1 - X0 - 60) / (nz - 1) + 8, y - 130, z - 85);
  a.line(X0 + 30, y, X1 - 30, y, 'EQUIP'); a.line(X0 + 30, y - 140, X1 - 30, y - 140, 'EQUIP');
  a.rect(X0 + 30, y - 150, X1 - 30, y + 18, 'EQUIP');
}
/** A trailed field sprayer: horizontal tank on a chassis, two big wheels, drawbar, pump and a full-width boom at the back. */
function sprayerTrailed(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, r = v.wr * IN, ay = YB - D * 0.42 - 300;
  const tr = v.tank * IN / 2;
  a.box(cx - 450, YF + 20, Z0 + r + 120, cx + 450, YB - 700, Z0 + r + 200);  // chassis + A-frame
  a.tube([[cx - 300, YB - 600, Z0 + r + 160], [cx, YF + 20, Z0 + r + 260], [cx + 300, YB - 600, Z0 + r + 160]], [38, 38, 38], 8);  // drawbar
  a.ycyl(YF + 400, YF + 400 + v.len * IN, cx, Z0 + r + 200 + tr + 20, tr, 24);  // tank
  a.ell(cx, YF + 400, Z0 + r + 200 + tr + 20, tr, 80, tr, 14, 6); a.ell(cx, YF + 400 + v.len * IN, Z0 + r + 200 + tr + 20, tr, 80, tr, 14, 6);
  a.cyl(cx, YF + 400 + v.len * IN * 0.5, Z0 + r + 200 + tr * 2 + 20, Z0 + r + 200 + tr * 2 + 110, 170, 14);   // filler dome
  for (const s of [-1, 1]) a.box(cx + s * tr * 0.55 - 160 * 0.5, YF + 400 + v.len * IN * 0.25, Z0 + r + 200 + 8, cx + s * tr * 0.55 + 80, YF + 400 + v.len * IN * 0.75, Z0 + r + 330); // saddle blocks
  const ay2 = YF + 400 + v.len * IN * 0.62;
  pair(a, W * 0.0 + (v.track * IN) / 2, ay2, r, 14 * IN, 12); // wheels (track set by param)
  a.ycyl(ay2 - 40, ay2 + 40, cx, Z0 + r, 40, 8);
  for (const s of [-1, 1]) a.box(cx + s * v.track * IN / 2 - 14, ay2 - 100, Z0 + r, cx + s * v.track * IN / 2 + 14, ay2 + 100, Z0 + r + 400);   // stub axle legs
  // pump and hose box at the front of the chassis
  a.box(cx - 220, YF + 140, Z0 + r + 200, cx + 220, YF + 360, Z0 + r + 420); a.cyl(cx + 120, YF + 250, Z0 + r + 420, Z0 + r + 500, 60, 10);
  a.box(cx - 200, YB - 940, Z0 + r + 120, cx + 200, YB - 700, Z0 + r + 200);
  // boom frame at the rear and a parking leg
  a.box(cx - 500, YB - 900, Z0 + r + 120, cx + 500, YB - 860, Z0 + H * 0.7);
  a.box(cx - 500, YB - 900, Z0 + r + 120, cx - 460, YB - 160, Z0 + r + 200); a.box(cx + 460, YB - 900, Z0 + r + 120, cx + 500, YB - 160, Z0 + r + 200);
  a.tube([[cx + 280, YF + 120, Z0 + r + 150], [cx + 280, YF + 120, Z0 + 50]], [20, 20], 6); a.box(cx + 230, YF + 80, Z0, cx + 330, YF + 170, Z0 + 20);
  boom(a, YB - 30, Z0 + 470, v.noz);
  for (const x of [-1, 1]) a.tube([[cx + x * 500, YB - 880, Z0 + H * 0.7 - 30], [cx + x * (W / 2 - 60), YB - 40, Z0 + 470 + 160]], [8, 8], 4);
  a.rect(cx - 450, YF, cx + 450, YB - 700, 'EQUIP'); a.circ(cx, ay2 - 50, tr, 'EQUIP-DETAIL'); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL');
  a.log('Added the chassis and drawbar, horizontal tank with filler dome, pump, two big wheels and the lattice spray boom with nozzle drops (plan and 3D).');
}
const sprayT = fam({ cat: 'agriculture/machinery', title: 'Generic trailed field sprayer', desc: (v) => `Trailed crop sprayer: ${v.tank > 70 ? 'large' : 'medium'} horizontal tank on a chassis with drawbar, pump, two wheels and a ${v.boomft} ft lattice boom with nozzle drops.`, build: sprayerTrailed, vs: [
  ['40 ft boom, 900 gal tank', 480, 210, 118, 0, { wr: 28, tank: 54, len: 82, track: 100, noz: 28, boomft: 40 }], ['60 ft boom, 1,300 gal tank', 720, 230, 124, 0, { wr: 30, tank: 60, len: 100, track: 108, noz: 40, boomft: 60 }] ] });
/** A self-propelled sprayer: tall four-wheel chassis, cab at the front, tank behind and a rear boom. */
function sprayerSP(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, r = v.wr * IN, wy = [YF + D * 0.2, YB - D * 0.45], gx = 1.0 * v.track * IN / 2;
  for (const y of wy) { tyre(a, cx - gx, y, r, 14 * IN, 0); tyre(a, cx + gx, y, r, 14 * IN, 0); }
  for (const y of wy) for (const s of [-1, 1]) a.tube([[cx + s * gx, y, Z0 + r], [cx + s * 440, y, Z0 + r + 700]], [34, 30], 8);   // tall legs
  a.box(cx - 430, YF + 60, Z0 + r + 600, cx + 430, YB - 800, Z0 + r + 800);
  // cab at the front, bonnet behind it
  const cz0 = Z0 + r + 800, cz1 = Z0 + H - 520;
  a.box(cx - 560, YF + 80, cz0, cx + 560, YF + 80 + 1050, cz0 + 40);
  for (const sx of [-1, 1]) for (const py of [YF + 100, YF + 1100]) a.tube([[cx + sx * 530, py, cz0], [cx + sx * 530, py, cz1]], [22, 22], 6);
  a.box(cx - 580, YF + 70, cz1 - 10, cx + 580, YF + 1150, cz1 + 40);
  a.box(cx - 520, YF + 94, cz0 + 40, cx + 520, YF + 104, cz1 - 10);
  for (const sx of [-1, 1]) a.box(cx + sx * 530 - 6, YF + 120, cz0 + 40, cx + sx * 530 + 6, YF + 1080, cz1 - 10);
  a.box(cx - 400, YF + 1150, cz0, cx + 400, YF + 2000, cz0 + 420);   // engine bonnet
  a.box(cx - 430, YF + 40, cz0 - 30, cx + 430, YF + 80, cz0 + 280);  // front guard
  // tank behind with hoops
  const tr = 520, ty = YF + 2250, tl = D * 0.3;
  a.ycyl(ty, ty + tl, cx, cz0 + 180, tr, 22); a.ell(cx, ty, cz0 + 180, tr, 100, tr, 12, 6); a.ell(cx, ty + tl, cz0 + 180, tr, 100, tr, 12, 6);
  a.cyl(cx, ty + tl * 0.5, cz0 + 180 + tr, cz0 + 180 + tr + 100, 160, 12);
  ladder(a, cx - 430, YF + 2150, Z0 + r + 150, YF + 2150, cz0 + 20, 380, 6);
  // rear boom frame + boom
  a.box(cx - 600, YB - 520, Z0 + r + 600, cx + 600, YB - 470, Z0 + H * 0.58);
  boom(a, YB - 20, Z0 + r + 200 + 0, v.noz);
  a.tube([[cx - 520, YB - 490, Z0 + H * 0.58], [cx - W / 2 + 80, YB - 40, Z0 + r + 370]], [9, 9], 4); a.tube([[cx + 520, YB - 490, Z0 + H * 0.58], [cx + W / 2 - 80, YB - 40, Z0 + r + 370]], [9, 9], 4);
  a.rect(cx - 560, YF + 60, cx + 560, YB - 470, 'EQUIP'); a.circ(cx, ty + tl / 2, 20, 'EQUIP-DETAIL'); a.line(cx - 560, YF + 1100, cx + 560, YF + 1100, 'EQUIP-DETAIL');
  a.log('Added four tall legs with tyres, cab, bonnet, tank with filler, rear ladder, boom mount and a full-width spray boom (plan and 3D).');
}
const spraySP = fam({ cat: 'agriculture/machinery', title: 'Generic self-propelled field sprayer', desc: (v) => `Self-propelled crop sprayer: four tall legs and tyres, cab at the front, bonnet, ${v.gal} gallon tank with filler, rear ladder and a ${v.boomft} ft spray boom with nozzle drops.`, build: sprayerSP, vs: [
  ['80 ft boom, 1,000 gal tank', 960, 300, 150, 0, { wr: 32, track: 124, noz: 44, boomft: 80, gal: 1000 }], ['100 ft boom, 1,600 gal tank', 1200, 330, 156, 0, { wr: 34, track: 130, noz: 54, boomft: 100, gal: 1600 }] ] });

/** Round baler: a chamber drum, side plates, pickup, drawbar, wheels, rear gate. */
function balerRound(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, r = v.wr * IN, rc = v.bale * IN / 2, cz = Z0 + r + rc * 0.9 + 60, cy = YB - D * 0.4;
  a.xcyl(X0 + 80, X1 - 80, cy, cz, rc, 26);   // the bale itself in the chamber
  for (const s of [-1, 1]) { a.xcyl(s < 0 ? X0 + 40 : X1 - 80, s < 0 ? X0 + 80 : X1 - 40, cy, cz, rc + 110, 26); a.xcyl(s < 0 ? X0 + 30 : X1 - 90, s < 0 ? X0 + 90 : X1 - 30, cy, cz, rc * 0.3, 12); }   // round side plates
  for (const s of [-1, 1]) a.xcyl(s < 0 ? X0 + 80 : X1 - 120, s < 0 ? X0 + 120 : X1 - 80, cy, cz, rc * 0.28, 10);
  a.box(X0 + 60, cy - rc * 0.7, cz + rc + 100, X1 - 60, cy + rc * 0.7, cz + rc + 150);   // top cover
  a.box(X0 + 80, YB - 40, cz - rc - 30, X1 - 80, YB, cz + rc + 90);   // rear gate frame
  for (const s of [-1, 1]) a.tube([[cx + s * (W / 2 - 70), cy - rc + 80, cz + rc + 100], [cx + s * (W / 2 - 70), YB - 40, cz + rc + 60]], [18, 18], 6);
  // pickup reel and drawbar
  const py = YF + D * 0.1;
  a.xcyl(cx - W * 0.32, cx + W * 0.32, py + 50, Z0 + r * 0.9, 150, 12);
  for (let i = 0; i < 24; i++) a.box(cx - W * 0.32 + i * (W * 0.64) / 23 - 5, py - 140, Z0 + r * 0.9 - 8, cx - W * 0.32 + i * (W * 0.64) / 23 + 5, py + 60, Z0 + r * 0.9 + 8);
  a.box(cx - W * 0.34, py + 100, Z0 + r * 0.9 + 90, cx + W * 0.34, cy - rc, Z0 + r * 0.9 + 110);
  a.tube([[cx, py + 200, Z0 + r * 1.5], [cx, YF + 10, Z0 + r * 1.9]], [34, 34], 8);
  a.tube([[cx - 200, cy - rc - 100, Z0 + r * 1.5], [cx, YF + 80, Z0 + r * 1.9], [cx + 200, cy - rc - 100, Z0 + r * 1.5]], [30, 30, 30], 8);
  a.box(cx - 70, YF, Z0 + r * 1.9 - 50, cx + 70, YF + 90, Z0 + r * 1.9 + 30);   // hitch eye
  pair(a, W / 2 - 80, cy + 120, r, 13 * IN, 14);
  a.box(cx - 150, cy - rc - 110, cz + rc + 110, cx + 150, cy - rc + 100, cz + rc + 270);   // twine box
  a.outline(); a.circ(cx, cy, rc * 0.6, 'EQUIP-DETAIL'); a.line(X0 + 80, cy - rc, X1 - 80, cy - rc, 'EQUIP-DETAIL'); a.line(X0 + 80, cy + rc, X1 - 80, cy + rc, 'EQUIP-DETAIL');
  a.log('Added the bale chamber with a round bale, side plates and gate, the tined pickup, drawbar and hitch, twine box and two wheels (plan and 3D).');
}
const balerR = fam({ cat: 'agriculture/machinery', title: 'Generic round baler', desc: (v) => `Round baler for ${v.bale} in diameter bales: chamber with a bale, side plates, rear gate, tined pickup reel, drawbar and hitch eye, twine box and two wheels.`, build: balerRound, vs: [
  ['fixed chamber, 48 in bale', 100, 150, 92, 0, { wr: 16, bale: 48 }], ['variable chamber, 60 in bale', 112, 162, 104, 0, { wr: 17, bale: 60 }] ] });
/** Large square baler: long rectangular chamber, a feeder duct, pickup, bale chute, tandem wheels. */
function balerSq(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, r = v.wr * IN, bw = W * 0.55, zc = Z0 + r * 1.9;
  a.box(cx - bw / 2, YF + D * 0.28, zc, cx + bw / 2, YB - D * 0.05, zc + H * 0.62);   // bale chamber
  a.box(cx - bw / 2 - 20, YF + D * 0.28, zc + H * 0.62, cx + bw / 2 + 20, YB - D * 0.05, zc + H * 0.62 + 30);
  for (let i = 0; i < 6; i++) { const y = YF + D * 0.36 + i * D * 0.1; a.box(cx - bw / 2 - 12, y, zc + 20, cx + bw / 2 + 12, y + 14, zc + H * 0.62 - 20); }   // tension frames
  prismX(a, [[YF + D * 0.28, zc + 40], [YF + D * 0.14, zc - 20], [YF + D * 0.14, zc + H * 0.3], [YF + D * 0.28, zc + H * 0.45]], cx - bw * 0.35, cx + bw * 0.35);   // feeder duct
  for (const s of [-1, 1]) a.box(cx + s * bw / 2 - 40 + (s > 0 ? 40 : 0), YB - D * 0.3, zc + H * 0.2, cx + s * bw / 2 + 40 + (s > 0 ? 40 : 0), YB - D * 0.05, zc + H * 0.55);
  a.box(cx - bw / 2 - 60, YF + D * 0.38, zc + H * 0.35, cx - bw / 2, YF + D * 0.52, zc + H * 0.6);  // gearbox
  // pickup
  const py = YF + D * 0.1;
  a.xcyl(cx - bw * 0.46, cx + bw * 0.46, py, Z0 + r * 0.8, 140, 12);
  for (let i = 0; i < 22; i++) a.box(cx - bw * 0.46 + i * bw * 0.92 / 21 - 5, py - 120, Z0 + r * 0.8 - 8, cx - bw * 0.46 + i * bw * 0.92 / 21 + 5, py + 60, Z0 + r * 0.8 + 8);
  // chute
  prismX(a, [[YB - D * 0.06, zc + 40], [YB, zc - r * 0.5], [YB, zc - r * 0.5 + 40], [YB - D * 0.06, zc + 90]], cx - bw / 2, cx + bw / 2);
  a.box(cx - 70, YF + 20, zc - 50, cx + 70, YF + D * 0.14, zc);
  a.tube([[cx - 120, YF + D * 0.28, zc + 40], [cx, YF + 30, zc - 20], [cx + 120, YF + D * 0.28, zc + 40]], [34, 34, 34], 8);
  for (const ys of [YB - D * 0.32, YB - D * 0.32 + r * 2.3]) pair(a, W / 2 - 80, ys, r, 12 * IN, 0);
  a.box(cx - bw / 2 - 40, YB - D * 0.42, Z0 + r * 1.5, cx + bw / 2 + 40, YB - D * 0.1, Z0 + r * 1.7);  // axle beam
  a.outline(); a.rect(cx - bw / 2, YF + D * 0.28, cx + bw / 2, YB - D * 0.05, 'EQUIP-DETAIL');
  a.log('Added the long bale chamber with tension frames, feeder duct, tined pickup, gearbox, bale chute, drawbar and tandem wheels (plan and 3D).');
}
const balerS = fam({ cat: 'agriculture/machinery', title: 'Generic large square baler', desc: (v) => `Large square baler for ${v.bale} in wide bales: long chamber with tension frames, feeder duct, tined pickup, bale chute, drawbar and tandem wheels.`, build: balerSq, vs: [
  ['48 in bale', 112, 340, 112, 0, { wr: 18, bale: 48 }] ] });

/** Seed drill: a seed hopper across the width, delivery tubes, a coulter bar with discs, packer wheels and drawbar. */
function drill(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, r = 14 * IN, hy0 = YF + D * 0.3, hy1 = YB - D * 0.22;
  a.box(X0, hy0 - 30, Z0 + H * 0.55, X1, hy1 + 30, Z0 + H * 0.58);
  prismY(a, [[X0 + 30, Z0 + H * 0.58], [X1 - 30, Z0 + H * 0.58], [X1 - 8, Z0 + H], [X0 + 8, Z0 + H]], hy0, hy1);   // hopper, sloped sides
  for (let i = 1; i < v.lids; i++) a.box(X0 + i * W / v.lids - 8, hy0 - 6, Z0 + H * 0.58, X0 + i * W / v.lids + 8, hy1 + 6, Z0 + H);
  for (let i = 0; i < v.lids; i++) { const x = X0 + (i + 0.5) * W / v.lids; a.box(x - 120, hy0 + 20, Z0 + H, x + 120, hy1 - 20, Z0 + H + 16); }
  // tool bars and coulters
  a.tube([[X0 + 20, hy1 + 60, Z0 + H * 0.3], [X1 - 20, hy1 + 60, Z0 + H * 0.3]], [30, 30], 6);
  a.tube([[X0 + 20, hy0 - 120, Z0 + H * 0.3], [X1 - 20, hy0 - 120, Z0 + H * 0.3]], [30, 30], 6);
  const n = v.rows;
  for (let i = 0; i < n; i++) {
    const x = X0 + 60 + i * (W - 120) / (n - 1), y = i % 2 ? hy1 + 60 : hy0 - 120;
    a.tube([[x, y, Z0 + H * 0.3], [x, y + 20, Z0 + 60]], [10, 10], 5);   // leg
    a.xcyl(x - 4, x + 4, y + 20, Z0 + 100, 140, 14);   // disc coulter
    a.tube([[x, hy0 + 60, Z0 + H * 0.56], [x + (i % 2 ? 1 : -1) * 20, y, Z0 + H * 0.3]], [6, 6], 4);   // seed tube
    a.circ(x, y, 5, 'EQUIP-DETAIL');
  }
  // packer wheels at the back
  a.xcyl(X0 + 40, X1 - 40, YB - 110, Z0 + 130, 130, 16);
  for (let i = 0; i <= 8; i++) a.xcyl(X0 + 40 + i * (W - 80) / 8 - 5, X0 + 40 + i * (W - 80) / 8 + 5, YB - 110, Z0 + 130, 148, 12);
  a.tube([[X0 + 40, hy1 + 60, Z0 + H * 0.3], [X0 + 40, YB - 110, Z0 + 130]], [10, 10], 5); a.tube([[X1 - 40, hy1 + 60, Z0 + H * 0.3], [X1 - 40, YB - 110, Z0 + 130]], [10, 10], 5);
  // transport wheels and drawbar
  for (const s of [-1, 1]) { tyre(a, cx + s * (W / 2 - 15), hy0 + (hy1 - hy0) * 0.5, r, 8 * IN, 0); a.box(cx + s * (W / 2 - 15) - 4, hy0 + (hy1 - hy0) * 0.5 - 20, Z0 + r, cx + s * (W / 2 - 15) + 4, hy0 + (hy1 - hy0) * 0.5 + 20, Z0 + H * 0.55); }
  a.tube([[cx - 200, hy0 - 120, Z0 + H * 0.4], [cx, YF + 20, Z0 + H * 0.5], [cx + 200, hy0 - 120, Z0 + H * 0.4]], [28, 28, 28], 8); a.box(cx - 60, YF, Z0 + H * 0.5 - 40, cx + 60, YF + 80, Z0 + H * 0.5 + 30);
  a.rect(X0, hy0, X1, hy1, 'EQUIP'); a.line(X0, hy0 - 120, X1, hy0 - 120, 'EQUIP-DETAIL'); a.line(X0, hy1 + 60, X1, hy1 + 60, 'EQUIP-DETAIL'); a.line(X0 + 40, YB - 110, X1 - 40, YB - 110, 'EQUIP-DETAIL');
  a.poly([[cx - 200, hy0 - 120], [cx, YF + 20], [cx + 200, hy0 - 120]], 'EQUIP-DETAIL');
  a.log('Added the seed hopper with lids, two staggered tool bars with disc coulters and seed tubes, packer wheels, transport wheels and the drawbar (plan and 3D).');
}
const drills = fam({ cat: 'agriculture/machinery', title: 'Generic trailed seed drill', desc: (v) => `Trailed seed drill, ${v.ft} ft working width: sloped seed hopper with ${v.lids} lids, ${v.rows} disc coulters on two staggered bars with seed tubes, rear packer wheels, transport wheels and a drawbar.`, build: drill, vs: [
  ['10 ft, 20 coulters', 128, 124, 70, 0, { ft: 10, lids: 2, rows: 16 }], ['15 ft, 30 coulters', 190, 130, 76, 0, { ft: 15, lids: 3, rows: 22 }], ['20 ft, 40 coulters', 250, 136, 80, 0, { ft: 20, lids: 4, rows: 28 }] ] });

/** Tipping farm trailer: chassis, axle(s) with wheels, a bed with ribbed sides and a tailgate, drawbar and a tipping ram. */
function trailer(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, r = v.wr * IN, bz = Z0 + r * 1.55, bh = H - r * 1.55 - 6;
  a.box(cx - 250, YF + 400, bz - 120, cx + 250, YB - 20, bz - 20);  // chassis
  a.tube([[cx - 200, YF + 400, bz - 90], [cx, YF + 20, bz + 40]], [34, 34], 8); a.tube([[cx + 200, YF + 400, bz - 90], [cx, YF + 20, bz + 40]], [34, 34], 8);
  a.box(cx - 70, YF, bz, cx + 70, YF + 90, bz + 80);
  // bed
  a.box(X0 + 20, YF + 420, bz - 20, X1 - 20, YB - 10, bz + 20);
  for (const s of [-1, 1]) a.box(s < 0 ? X0 + 20 : X1 - 40, YF + 420, bz + 20, s < 0 ? X0 + 40 : X1 - 20, YB - 10, bz + bh);
  a.box(X0 + 20, YF + 420, bz + 20, X1 - 20, YF + 440, bz + bh + 80);   // front headboard, taller
  a.box(X0 + 20, YB - 30, bz + 20, X1 - 20, YB - 10, bz + bh);   // tailgate
  for (let i = 1; i < 6; i++) { const y = YF + 440 + i * (D - 460) / 6; for (const s of [-1, 1]) a.box(s < 0 ? X0 + 8 : X1 - 8 - 12, y - 10, bz + 20, s < 0 ? X0 + 20 : X1 - 8, y + 10, bz + bh); }
  a.box(X0 + 8, YF + 420, bz + bh - 10, X1 - 8, YB - 5, bz + bh + 8);   // rim
  // axles and tyres
  const ax = v.axles === 2 ? [YB - D * 0.3 - r * 1.2, YB - D * 0.3 + r * 1.2] : [YB - D * 0.3];
  for (const y of ax) { pair(a, W / 2 - 8 * IN, y, r, 14 * IN, 12); a.box(cx - 400, y - 60, bz - 220, cx + 400, y + 60, bz - 120); }
  if (v.axles === 2) a.box(cx - 150, ax[0], bz - 160, cx + 150, ax[1], bz - 120);
  // ram
  a.tube([[cx, YF + 500, bz - 100], [cx, YF + 700, bz + bh * 0.8]], [40, 56], 10);
  a.box(cx - 200, YB - 160, bz - 110, cx + 200, YB - 100, bz - 70);   // lights board
  for (const s of [-1, 1]) a.box(cx + s * (W / 2 - 80) - 40, YB - 8, bz + 100, cx + s * (W / 2 - 80) + 40, YB, bz + 180);
  a.outline(); a.rect(X0 + 20, YF + 420, X1 - 20, YB - 10, 'EQUIP-DETAIL'); a.poly([[cx - 200, YF + 400], [cx, YF + 20], [cx + 200, YF + 400]], 'EQUIP-DETAIL');
  a.log('Added the chassis and drawbar, the bed with ribbed sides, headboard and tailgate, the tipping ram, ' + (v.axles === 2 ? 'tandem' : 'single') + ' axle with tyres and tail lamps (plan and 3D).');
}
const trailers = fam({ cat: 'agriculture/machinery', title: 'Generic tipping farm trailer', desc: (v) => `Tipping farm trailer, ${v.t} tonne class: chassis and drawbar, bed with ribbed sides, taller headboard and tailgate, tipping ram, ${v.axles === 2 ? 'tandem' : 'single'} axle with tyres.`, build: trailer, vs: [
  ['6 tonne, single axle', 84, 192, 78, 0, { t: 6, axles: 1, wr: 17 }], ['10 tonne, tandem axle', 94, 252, 96, 0, { t: 10, axles: 2, wr: 18 }], ['16 tonne, tandem axle', 100, 312, 112, 0, { t: 16, axles: 2, wr: 21 }] ] });

/** Reversible mounted plough: diagonal beam, headstock, bodies with legs, shares and mouldboards, depth wheel. */
function plough(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, n = v.n, by0 = YF + D * 0.2, by1 = YB - 40;
  const px = (f) => X0 + 80 + f * (W - 200), py = (f) => by0 + f * (by1 - by0);
  a.box(cx - W * 0.28, YF + 20, Z0 + H * 0.78, cx + W * 0.28, YF + 160, Z0 + H);   // headstock
  a.tube([[cx - W * 0.2, YF + 20, Z0 + H * 0.82], [cx, YF + 20, Z0 + H * 0.98], [cx + W * 0.2, YF + 20, Z0 + H * 0.82]], [26, 26, 26], 8);
  a.tube([[cx, YF + 90, Z0 + H * 0.9], [px(0.05), py(0.05), Z0 + H * 0.74], [px(1), py(1), Z0 + H * 0.6]], [34, 34, 34], 8);   // beam (diagonal)
  a.tube([[cx, YF + 90, Z0 + H * 0.9], [px(0.45), py(0.45), Z0 + H * 0.65]], [20, 20], 6);   // brace
  for (let i = 0; i < n; i++) {
    const f = (i + 0.5) / n, x = px(f), y = py(f) - 20;
    a.tube([[x, y, Z0 + H * 0.69 - 0.0 * i], [x - 10, y + 40, Z0 + 60]], [20, 20], 6);   // leg
    prismX(a, [[y - 80, Z0 + 30], [y + 360, Z0 + 20], [y + 380, Z0 + 150], [y + 60, Z0 + H * 0.4]], x - 90, x + 40);   // mouldboard
    prismX(a, [[y - 110, Z0 + 4], [y + 120, Z0 + 24], [y + 120, Z0 + 70]], x - 100, x + 20);   // share
    a.xcyl(x + 50 - 4, x + 50 + 4, y - 160, Z0 + 150, 190, 14);   // disc coulter
    a.tube([[x, y, Z0 + H * 0.6], [x + 50, y - 160, Z0 + 200]], [9, 9], 4);
    a.poly([[x - 100, y - 100], [x + 40, y - 100], [x + 40, y + 380], [x - 100, y + 380]], 'EQUIP-DETAIL');
  }
  const lx = px(1) + 80;   // depth wheel at the rear
  a.tube([[px(1), py(1), Z0 + H * 0.62], [lx, py(1) - 20, Z0 + 180]], [18, 18], 6); a.xcyl(lx - 40, lx + 40, py(1) - 20, Z0 + 180, 180, 14);
  a.tube([[cx, YF + 90, Z0 + H * 0.88], [cx, YF + 90, Z0 + H * 0.66]], [16, 16], 5);
  a.line(cx, YF + 90, px(1), py(1), 'EQUIP'); a.rect(cx - W * 0.28, YF + 20, cx + W * 0.28, YF + 160, 'EQUIP');
  a.log('Added the headstock, the diagonal beam and ' + n + ' bodies each with a leg, share, mouldboard and disc coulter, and the rear depth wheel (plan and 3D).');
}
const ploughs = fam({ cat: 'agriculture/machinery', title: 'Generic mounted reversible plough', desc: (v) => `Mounted plough with ${v.n} bodies: headstock, diagonal beam, and for each body a leg, share, mouldboard and disc coulter, with a rear depth wheel.`, build: plough, vs: [
  ['4 furrow', 126, 190, 68, 0, { n: 4 }], ['6 furrow', 168, 240, 72, 0, { n: 6 }] ] });

/** Trailed offset disc harrow: two gangs of discs in a V on tube frames, wheels and drawbar. */
function harrow(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, rd = 12 * IN, gy0 = YF + D * 0.45, gy1 = YB - 40, nd = v.discs;
  for (const s of [-1, 1]) {
    const xa = cx + s * 30, xb = cx + s * (W / 2 - 30), ya = gy0, yb = gy1 - D * 0.18;
    a.tube([[xa, ya, Z0 + H * 0.85], [xb, yb, Z0 + H * 0.85]], [24, 24], 6);   // gang frame
    a.tube([[xa, ya, Z0 + rd], [xb, yb, Z0 + rd]], [14, 14], 6);   // gang shaft
    for (let i = 0; i < nd; i++) {
      const f = (i + 0.5) / nd, x = xa + (xb - xa) * f, y = ya + (yb - ya) * f;
      a.xcyl(x - 5, x + 5, y, Z0 + rd, rd, 16); a.tube([[x, y, Z0 + rd], [x, y, Z0 + H * 0.85]], [5, 5], 4);
    }
    a.line(xa, ya, xb, yb, 'EQUIP'); a.rect(xb - rd * 0.1, yb - rd, xb + rd * 0.1, yb + rd, 'EQUIP-DETAIL');
  }
  a.tube([[cx, gy0, Z0 + H * 0.85], [cx, YF + 20, Z0 + H * 0.78]], [32, 32], 8); a.tube([[cx - 150, gy0 + 120, Z0 + H * 0.85], [cx, YF + 20, Z0 + H * 0.78], [cx + 150, gy0 + 120, Z0 + H * 0.85]], [20, 20, 20], 6);
  a.box(cx - 60, YF, Z0 + H * 0.78 - 40, cx + 60, YF + 80, Z0 + H * 0.78 + 30);
  for (const s of [-1, 1]) { tyre(a, cx + s * (W * 0.18), gy1 - D * 0.1, 11 * IN, 7 * IN, 0); a.tube([[cx + s * W * 0.18, gy1 - D * 0.1, Z0 + 11 * IN], [cx + s * W * 0.18, gy0 + 200, Z0 + H * 0.85]], [14, 14], 5); }
  a.log('Added two angled gangs of discs on shafts with tube frames, the centre beam and drawbar, and two transport wheels (plan and 3D).');
}
const harrows = fam({ cat: 'agriculture/machinery', title: 'Generic trailed disc harrow', desc: (v) => `Trailed disc harrow, ${v.ft} ft: two angled gangs of ${v.discs} discs each on shafts and tube frames, a centre beam with drawbar and two transport wheels.`, build: harrow, vs: [
  ['12 ft, 2 gangs', 150, 130, 54, 0, { ft: 12, discs: 10 }], ['18 ft, 2 gangs', 222, 150, 58, 0, { ft: 18, discs: 15 }] ] });

// ------------------------------------------------------------------------------------------ buildings
/** Gable or gambrel barn: walls with battens, a roof with overhang, a sliding door with an X brace and a track, a loft hatch, windows. v: gam (gambrel), eave (in), ridge via H */
function barn(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, ov = 14, t = 6 * IN * 0.5, e = v.eave * IN, wx0 = X0 + ov + 30, wx1 = X1 - ov - 30, wy0 = YF + ov + 30, wy1 = YB - ov - 30;
  a.box(X0 + ov, YF + ov, Z0, X1 - ov, YB - ov, Z0 + 14);   // sill / slab edge
  // walls
  a.box(wx0, wy0, Z0 + 14, wx0 + t, wy1, Z0 + e); a.box(wx1 - t, wy0, Z0 + 14, wx1, wy1, Z0 + e); a.box(wx0, wy1 - t, Z0 + 14, wx1, wy1, Z0 + e);
  // front wall, with a door opening
  const dw = m.min(W * 0.34, 168 * IN), dh = e * 0.82, dx0 = cx - dw / 2, dx1 = cx + dw / 2;
  a.box(wx0, wy0, Z0 + 14, dx0, wy0 + t, Z0 + e); a.box(dx1, wy0, Z0 + 14, wx1, wy0 + t, Z0 + e); a.box(dx0, wy0, Z0 + 14 + dh, dx1, wy0 + t, Z0 + e);
  // gable end walls above eave
  const roof = v.gam ? [[wx0, Z0 + e], [wx1, Z0 + e], [wx1 - W * 0.07, Z0 + e + (H - e) * 0.62], [cx, Z0 + H - 18], [wx0 + W * 0.07, Z0 + e + (H - e) * 0.62]]
    : [[wx0, Z0 + e], [wx1, Z0 + e], [cx, Z0 + H - 18]];
  prismY(a, roof, wy0, wy0 + t); prismY(a, roof, wy1 - t, wy1);
  // battens
  const nb = m.floor((wx1 - wx0) / (24 * IN * 0.6));
  for (let i = 1; i < nb; i++) { const x = wx0 + i * (wx1 - wx0) / nb; if (x < dx0 - 20 || x > dx1 + 20) a.box(x - 12, wy0 - 6, Z0 + 14, x + 12, wy0, Z0 + e); a.box(x - 12, wy1, Z0 + 14, x + 12, wy1 + 6, Z0 + e); }
  const ns = m.floor((wy1 - wy0) / (24 * IN * 0.6));
  for (let i = 1; i < ns; i++) { const y = wy0 + i * (wy1 - wy0) / ns; a.box(wx0 - 6, y - 12, Z0 + 14, wx0, y + 12, Z0 + e); a.box(wx1, y - 12, Z0 + 14, wx1 + 6, y + 12, Z0 + e); }
  // sliding doors with an X brace on a track
  a.box(dx0 - 60, wy0 - 34, Z0 + 14, cx - 6, wy0 - 4, Z0 + 14 + dh + 20); a.box(cx + 6, wy0 - 34, Z0 + 14, dx1 + 60, wy0 - 4, Z0 + 14 + dh + 20);
  for (const [xa, xb] of [[dx0 - 60, cx], [cx, dx1 + 60]]) { a.frame(xa + 10, Z0 + 24, xb - 10, Z0 + 14 + dh + 10, wy0 - 52, wy0 - 34, 60); xbrace(a, xa + 30, xb - 30, wy0 - 44, Z0 + 44, Z0 + 14 + dh - 10, 22); }
  a.box(dx0 - 140, wy0 - 40, Z0 + 14 + dh + 40, dx1 + 140, wy0 - 28, Z0 + 14 + dh + 66);   // track
  // hayloft hatch and a window above the door (front), small windows on the long sides
  a.frame(cx - 160, Z0 + e + 60, cx + 160, Z0 + e + 60 + 420, wy0 - 30, wy0 + 4, 40);
  a.box(cx - 130, wy0 - 6, Z0 + e + 90, cx + 130, wy0 + 2, Z0 + e + 450);
  for (const s of [-1, 1]) for (let i = 1; i < 4; i++) { const y = wy0 + i * (wy1 - wy0) / 4, xo = s < 0 ? wx0 - 24 : wx1; a.box(xo, y - 260, Z0 + e * 0.55, xo + 24, y + 260, Z0 + e * 0.55 + 450); a.box(xo - (s < 0 ? 4 : 0), y - 10, Z0 + e * 0.55, xo + 24 + (s < 0 ? 0 : 4), y + 10, Z0 + e * 0.55 + 450); }
  // roof: two or four slabs with eaves overhang and a ridge cap
  const ro = 20;
  if (v.gam) {
    const kx = W * 0.07 + ov + 30, zk = Z0 + e + (H - e) * 0.62;
    for (const s of [-1, 1]) { prismY(a, s < 0 ? [[X0 + ov - ro, Z0 + e - 30], [wx0 + 0, Z0 + e + 20], [wx0 + W * 0.07 + 0, zk + 22], [wx0 + W * 0.07 - 6, zk - 10]] : [[X1 - ov + ro, Z0 + e - 30], [wx1, Z0 + e + 20], [wx1 - W * 0.07, zk + 22], [wx1 - W * 0.07 + 6, zk - 10]], YF + ov - ro, YB - ov + ro); }
    for (const s of [-1, 1]) { const xa = s < 0 ? wx0 + W * 0.07 - 6 : wx1 - W * 0.07 + 6; prismY(a, s < 0 ? [[xa, zk - 10], [xa + 6, zk + 22], [cx, Z0 + H + 6], [cx, Z0 + H - 26]] : [[xa, zk - 10], [cx, Z0 + H - 26], [cx, Z0 + H + 6], [xa - 6, zk + 22]], YF + ov - ro, YB - ov + ro); }
  } else {
    prismY(a, [[X0 + ov - ro, Z0 + e - 40], [cx, Z0 + H - 30], [cx, Z0 + H + 2], [X0 + ov - ro, Z0 + e - 8]], YF + ov - ro, YB - ov + ro);
    prismY(a, [[X1 - ov + ro, Z0 + e - 40], [cx, Z0 + H - 30], [cx, Z0 + H + 2], [X1 - ov + ro, Z0 + e - 8]].reverse(), YF + ov - ro, YB - ov + ro);
  }
  a.box(cx - 16, YF + ov - ro, Z0 + H - 8, cx + 16, YB - ov + ro, Z0 + H + 10);
  a.outline(); a.rect(wx0, wy0, wx1, wy1, 'EQUIP-DETAIL'); a.line(dx0, wy0, dx1, wy0, 'EQUIP-SWING'); a.line(cx, YF + ov, cx, YB - ov, 'EQUIP-DETAIL');
  a.log('Added the walls with battens, the front door opening with two sliding doors on a track, hayloft hatch, windows and the ' + (v.gam ? 'gambrel' : 'gable') + ' roof with ridge cap (plan and 3D).');
}
const barns = fam({ cat: 'agriculture/buildings', title: 'Generic farm barn', desc: (v) => `${v.gam ? 'Gambrel' : 'Gable'} roof barn, ${v.sp} by ${v.len} ft: battened walls, wide sliding doors on a track with an X brace, a hayloft hatch, side windows and a ridge cap.`, build: barn, vs: [
  ['gable roof, 24 x 36 ft', 300, 440, 220, 0, { gam: false, eave: 132, sp: 24, len: 36 }], ['gable roof, 36 x 60 ft', 444, 732, 288, 0, { gam: false, eave: 156, sp: 36, len: 60 }],
  ['gambrel roof, 36 x 60 ft', 444, 732, 330, 0, { gam: true, eave: 132, sp: 36, len: 60 }], ['gambrel roof, 48 x 80 ft', 588, 972, 420, 0, { gam: true, eave: 144, sp: 48, len: 80 }] ] });

/** A corrugated steel grain silo: ribbed cylinder, cone roof with vent, ladder with cage, door, base ring. */
function silo(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, H } = a, r = W / 2 - 14, hb = v.base * IN, zr = Z1 - r * v.cone;
  a.cyl(cx, cy, Z0, Z0 + hb, r + 12, 28);   // base ring
  a.cyl(cx, cy, Z0 + hb, zr, r, 36);
  rings(a, cx, cy, Z0 + hb, zr, r, v.courses, 30);
  for (let i = 0; i < 14; i++) { const th = i / 14 * 2 * PI; a.tube([[cx + m.cos(th) * (r + 10), cy + m.sin(th) * (r + 10), Z0 + hb], [cx + m.cos(th) * (r + 10), cy + m.sin(th) * (r + 10), zr]], [9, 9], 4); }   // stiffeners
  a.cone(cx, cy, zr, Z1 - 30, r + 24, r * 0.12, 36);
  a.cyl(cx, cy, Z1 - 70, Z1, 70, 12); a.cone(cx, cy, Z1 - 40, Z1, 85, 14, 12);   // roof vent cap
  for (let i = 0; i < 8; i++) { const th = i / 8 * 2 * PI; a.tube([[cx + m.cos(th) * (r + 24), cy + m.sin(th) * (r + 24), zr - 4], [cx + m.cos(th) * r * 0.3, cy + m.sin(th) * r * 0.3, Z1 - 50]], [8, 8], 4); }   // roof ribs
  // door and ladder on the front (-Y)
  a.box(cx - 150, cy - r - 24, Z0 + hb, cx + 150, cy - r + 10, Z0 + hb + 640); a.box(cx - 130, cy - r - 32, Z0 + hb + 40, cx + 130, cy - r - 24, Z0 + hb + 600);
  const lx = cx + r * 0.5, ly = cy - m.sqrt(m.max(1, (r + 40) * (r + 40) - (r * 0.5) * (r * 0.5)));
  ladder(a, lx, ly, Z0 + hb, ly, zr + 60, 450, m.round((zr - Z0 - hb) / 300));
  a.tube([[lx - 225, ly - 4, Z0 + hb + 2200], [lx - 225, ly - 4 - 340, Z0 + hb + 2200], [lx + 225, ly - 4 - 340, Z0 + hb + 2200], [lx + 225, ly - 4, Z0 + hb + 2200]], [6, 6, 6, 6], 4);
  if (v.stave) for (let i = 1; i < v.courses; i++) { /* hoops already drawn as rings */ }
  a.circ(cx, cy, r, 'EQUIP'); a.circ(cx, cy, r + 12, 'EQUIP-DETAIL'); a.circ(cx, cy, r * 0.12, 'EQUIP-DETAIL'); a.rect(cx - 150, cy - r - 30, cx + 150, cy - r, 'EQUIP-DETAIL');
  a.log('Added the base ring, ribbed corrugated shell with stiffeners, roof cone with ribs and vent cap, access door and the caged side ladder (plan and 3D).');
}
const silos = fam({ cat: 'agriculture/buildings', title: 'Generic corrugated grain silo', desc: (v) => `Flat-bottom grain silo, ${v.d} ft diameter: base ring, corrugated shell with rings and stiffeners, cone roof with vent cap, door and a caged ladder.`, build: silo, vs: [
  ['18 ft diameter, 28 ft eave', 228, 228, 440, 0, { d: 18, base: 10, courses: 12, cone: 0.22 }], ['24 ft diameter, 36 ft eave', 300, 300, 560, 0, { d: 24, base: 10, courses: 14, cone: 0.2 }],
  ['30 ft diameter, 46 ft eave', 372, 372, 690, 0, { d: 30, base: 12, courses: 18, cone: 0.2 }], ['36 ft diameter, 54 ft eave', 444, 444, 800, 0, { d: 36, base: 12, courses: 20, cone: 0.2 }] ] });

/** A tall tower silo of concrete staves with hoop bands, a dome roof and a vertical chute. */
function tower(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, H } = a, r = (W - 60) / 2;
  a.cyl(cx, cy, Z0, Z1 - r * 0.45, r, 32);
  for (let i = 1; i < v.hoops; i++) a.cyl(cx, cy, Z0 + (Z1 - r * 0.45 - Z0) * i / v.hoops - 8, Z0 + (Z1 - r * 0.45 - Z0) * i / v.hoops + 8, r + 8, 32);
  a.ell(cx, cy, Z1 - r * 0.45, r, r, r * 0.45, 22, 8);
  a.cyl(cx, cy, Z1 - 40, Z1, 60, 10);
  a.box(cx - 220, cy - r - 160, Z0, cx + 220, cy - r + 10, Z1 - r * 0.45 - 200);   // chute enclosure
  const n = 12; for (let i = 0; i < n; i++) a.box(cx - 150, cy - r - 168, Z0 + 700 + i * ((Z1 - r * 0.45 - 900 - Z0 - 700) / n), cx + 150, cy - r - 150, Z0 + 700 + i * ((Z1 - r * 0.45 - 900 - Z0 - 700) / n) + 120);   // chute doors
  a.box(cx - 400, cy - r * 0.6, Z0, cx + 400, cy + r * 0.6, Z0 + 12);
  a.circ(cx, cy, r, 'EQUIP'); a.rect(cx - 220, cy - r - 160, cx + 220, cy - r, 'EQUIP-DETAIL');
  a.log('Added the cylindrical stave shell with hoop bands, the dome roof, the vertical chute enclosure with its hatches (plan and 3D).');
}
const towers = fam({ cat: 'agriculture/buildings', title: 'Generic tower silo', desc: () => 'Tall round tower silo with hoop bands, a domed roof, a vent stack and a vertical chute enclosure with stacked hatches on the front.', build: tower, vs: [
  ['16 ft diameter, 50 ft tall', 196, 214, 600, 0, { hoops: 24 }] ] });

/** A hopper-bottom grain bin on legs: cylinder, cone hopper, braced legs, roof cone, ladder, discharge. */
function bin(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, H } = a, r = W / 2 - 10, hz = Z0 + v.leg * IN, bz = hz + v.hop * IN, tz = Z1 - r * 0.35;
  for (let i = 0; i < v.legs; i++) { const th = i / v.legs * 2 * PI + PI / v.legs, x = cx + m.cos(th) * (r - 16), y = cy + m.sin(th) * (r - 16); a.tube([[x, y, Z0], [x, y, bz]], [9, 9], 6); a.tube([[x, y, Z0 + (bz - Z0) * 0.5], [cx + m.cos(th + 2 * PI / v.legs) * (r - 16), cy + m.sin(th + 2 * PI / v.legs) * (r - 16), Z0 + 60]], [5, 5], 4); }
  a.cone(cx, cy, hz, bz, 60, r, 28);   // hopper
  a.cyl(cx, cy, hz - 60, hz, 80, 12); a.box(cx - 100, cy - 100, hz - 150, cx + 100, cy + 100, hz - 60);   // outlet and slide gate
  a.cyl(cx, cy, bz, tz, r, 28); rings(a, cx, cy, bz, tz, r, v.courses, 28);
  a.cone(cx, cy, tz, Z1 - 12, r + 8, r * 0.1, 28); a.cyl(cx, cy, Z1 - 40, Z1, 40, 10);
  ladder(a, cx + r * 0.6, cy - m.sqrt(m.max(1, (r + 30) * (r + 30) - (r * 0.6) * (r * 0.6))), bz, cy - m.sqrt(m.max(1, (r + 30) * (r + 30) - (r * 0.6) * (r * 0.6))), tz, 360, 8);
  a.box(cx - 80, cy - r - 20, tz - 140, cx + 80, cy - r + 4, tz - 20);   // sample door
  a.circ(cx, cy, r, 'EQUIP'); a.circ(cx, cy, 60, 'EQUIP-DETAIL');
  for (let i = 0; i < v.legs; i++) { const th = i / v.legs * 2 * PI + PI / v.legs; a.circ(cx + m.cos(th) * (r - 16), cy + m.sin(th) * (r - 16), 9, 'EQUIP-DETAIL'); }
  a.log('Added ' + v.legs + ' braced legs, the cone hopper with outlet and slide gate, the ribbed shell, roof cone with cap, the ladder and the sample door (plan and 3D).');
}
const bins = fam({ cat: 'agriculture/buildings', title: 'Generic hopper-bottom grain bin', desc: (v) => `Hopper-bottom grain bin on ${v.legs} braced legs: cone hopper with outlet and slide gate, ribbed shell, roof cone with cap, ladder and sample door.`, build: bin, vs: [
  ['8 ft diameter, on legs', 100, 100, 172, 0, { legs: 4, leg: 38, hop: 40, courses: 5 }], ['12 ft diameter, on legs', 148, 148, 238, 0, { legs: 6, leg: 44, hop: 58, courses: 7 }], ['15 ft diameter, on legs', 184, 184, 290, 0, { legs: 8, leg: 52, hop: 70, courses: 9 }] ] });

/** Greenhouse: hoop tunnel (ribs and purlins, end walls, door) or glass gable (glazing bars, vent, door). */
function greenhouse(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, nr = m.round(D / (v.pitch * IN)) + 1, pts = [];
  const sw = v.glass ? H * 0.5 : 0;
  const prof = (f) => v.glass ? null : [cx + m.cos(PI * (1 - f)) * (W / 2 - 14), Z0 + 14 + m.sin(PI * f) * (H - 28)];
  if (!v.glass) {
    for (let i = 0; i < nr; i++) { const y = YF + 14 + i * (D - 28) / (nr - 1); a.tube(Array.from({ length: 13 }, (_, k) => { const f = k / 12; return [cx - m.cos(PI * f) * (W / 2 - 14), y, Z0 + 4 + m.sin(PI * f) * (H - 12)]; }), Array(13).fill(11), 5); a.line(X0 + 14, y, X1 - 14, y, 'EQUIP-DETAIL'); }
    for (const f of [0.08, 0.25, 0.5, 0.75, 0.92]) a.tube([[cx - m.cos(PI * f) * (W / 2 - 14), YF + 14, Z0 + 4 + m.sin(PI * f) * (H - 12)], [cx - m.cos(PI * f) * (W / 2 - 14), YB - 14, Z0 + 4 + m.sin(PI * f) * (H - 12)]], [8, 8], 4);
    a.tube([[cx, YF + 14, Z0 + H - 4], [cx, YB - 14, Z0 + H - 4]], [12, 12], 5);
    for (const y of [YF + 14, YB - 14]) { a.box(X0 + 14, y - 12, Z0, X1 - 14, y + 12, Z0 + 30); }
    // front end wall with a door
    for (const x of [-0.7, 0.7, -0.35, 0.35]) a.tube([[cx + x * (W / 2 - 14), YF + 14, Z0 + 30], [cx + x * (W / 2 - 14), YF + 14, Z0 + 4 + m.sqrt(1 - x * x) * (H - 12)]], [7, 7], 4);
    a.frame(cx - W * 0.12, Z0 + 14, cx + W * 0.12, Z0 + H * 0.78, YF + 4, YF + 24, 30);
    for (const f of [0.15, 0.5]) a.box(X0 + 14, YF + 14, Z0 + 4, X1 - 14, YB - 14, Z0 + 12);
  } else {
    const eh = H * 0.6, bars = nr;
    for (let i = 0; i < bars; i++) { const y = YF + 14 + i * (D - 28) / (bars - 1); a.tube([[X0 + 14, y, Z0 + 20], [X0 + 14, y, Z0 + eh], [cx, y, Z0 + H - 8], [X1 - 14, y, Z0 + eh], [X1 - 14, y, Z0 + 20]], [12, 12, 12, 12, 12], 5); a.line(X0 + 14, y, X1 - 14, y, 'EQUIP-DETAIL'); }
    for (const s of [-1, 1]) for (const f of [0.35, 0.7]) a.tube([[cx + s * (W / 2 - 14) * (1 - f * 0.0), YF + 14, Z0 + 20 + (eh - 20) * f], [cx + s * (W / 2 - 14), YB - 14, Z0 + 20 + (eh - 20) * f]], [6, 6], 4);
    for (const s of [-1, 1]) for (const f of [0.3, 0.6]) a.tube([[cx + s * (W / 2 - 14) * (1 - f), YF + 14, Z0 + eh + (H - 8 - eh) * f], [cx + s * (W / 2 - 14) * (1 - f), YB - 14, Z0 + eh + (H - 8 - eh) * f]], [6, 6], 4);
    a.tube([[cx, YF + 14, Z0 + H - 8], [cx, YB - 14, Z0 + H - 8]], [14, 14], 5);
    a.box(X0 + 8, YF + 8, Z0, X1 - 8, YF + 22, Z0 + 20); a.box(X0 + 8, YB - 22, Z0, X1 - 8, YB - 8, Z0 + 20); a.box(X0 + 8, YF + 8, Z0, X0 + 22, YB - 8, Z0 + 20); a.box(X1 - 22, YF + 8, Z0, X1 - 8, YB - 8, Z0 + 20);
    // vent flap along the ridge, glazing bars across the end
    for (const x of [0.2, 0.4, 0.6, 0.8]) { a.tube([[cx + (x - 0.5) * 2 * (W / 2 - 14), YF + 14, Z0 + 20], [cx + (x - 0.5) * 2 * (W / 2 - 14), YF + 14, Z0 + (Math.abs(x - 0.5) < 0.0001 ? H : eh + (H - eh) * (1 - Math.abs(x - 0.5) * 2))]], [6, 6], 4); }
    a.tube([[X0 + 14, YF + 14, Z0 + eh * 0.5], [X1 - 14, YF + 14, Z0 + eh * 0.5]], [7, 7], 4);
    a.frame(cx - W * 0.1, Z0 + 20, cx + W * 0.1, Z0 + H * 0.66, YF + 4, YF + 24, 28);
    a.box(cx - W * 0.2, YF + 14, Z0 + H - 80, cx + W * 0.2, YB - 14, Z0 + H - 60);   // ridge vent flap
  }
  a.outline(); a.rect(X0 + 14, YF + 14, X1 - 14, YB - 14, 'EQUIP-DETAIL'); a.line(cx, YF + 14, cx, YB - 14, 'EQUIP-DETAIL');
  a.log(v.glass ? 'Added the glazing-bar frame with a ridge vent, base rails and a glazed end door (plan and 3D); glass panes are not drawn.' : 'Added the hoop ribs, purlins and ridge pole, base rails, a framed end door and end-wall bows (plan and 3D); the film cover is not drawn.');
}
const greenhouses = fam({ cat: 'agriculture/buildings', title: 'Generic greenhouse', desc: (v) => v.glass ? `Glass-style gable greenhouse, ${v.wf} by ${v.lf} ft: glazing-bar frame, base rails, ridge vent and a framed door. Panes are not drawn.` : `Hoop tunnel greenhouse, ${v.wf} by ${v.lf} ft: bowed ribs, purlins, ridge pole, base rails and a framed end door. The film cover is not drawn.`, build: greenhouse, vs: [
  ['hoop tunnel, 14 x 30 ft', 168, 360, 96, 0, { glass: false, pitch: 36, wf: 14, lf: 30 }], ['hoop tunnel, 20 x 48 ft', 240, 576, 116, 0, { glass: false, pitch: 48, wf: 20, lf: 48 }],
  ['glass gable, 8 x 12 ft', 96, 144, 102, 0, { glass: true, pitch: 24, wf: 8, lf: 12 }], ['glass gable, 12 x 24 ft', 144, 288, 120, 0, { glass: true, pitch: 36, wf: 12, lf: 24 }] ] });

/** Open-sided pole barn / hay store: poles, roof trusses, roof sheets, a back wall, bales stacked inside. v: bale ('sq'|'rd'), rows, lean (mono-pitch) */
function hayStore(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, e = v.eave * IN, np = m.round(D / (v.bay * IN)) + 1, pw = 8 * IN * 0.9;
  const roofAt = (x) => v.lean ? Z0 + e + (H - e) * (x - X0) / W : (Math.abs(x - cx) < 1 ? Z0 + H - 12 : Z0 + e + (H - e - 12) * (1 - m.abs(x - cx) / (W / 2)));
  for (let i = 0; i < np; i++) {
    const y = YF + 30 + i * (D - 60) / (np - 1);
    for (const x of [X0 + 40, X1 - 40]) a.box(x - pw / 2, y - pw / 2, Z0, x + pw / 2, y + pw / 2, v.lean ? (x < cx ? Z0 + e : Z0 + H - 14) : Z0 + e);
    // truss: rafters, tie beam and a king post
    if (v.lean) { a.tube([[X0 + 40, y, Z0 + e], [X1 - 40, y, Z0 + H - 14]], [18, 18], 5); }
    else { a.tube([[X0 + 40, y, Z0 + e], [cx, y, Z0 + H - 24]], [20, 20], 5); a.tube([[X1 - 40, y, Z0 + e], [cx, y, Z0 + H - 24]], [20, 20], 5); a.tube([[X0 + 40, y, Z0 + e - 12], [X1 - 40, y, Z0 + e - 12]], [16, 16], 5); a.tube([[cx, y, Z0 + e - 12], [cx, y, Z0 + H - 24]], [12, 12], 4); }
  }
  if (v.lean) prismY(a, [[X0 - 50, Z0 + e - 10], [X1 + 50, Z0 + H + 10], [X1 + 50, Z0 + H + 28], [X0 - 50, Z0 + e + 8]], YF - 20, YB + 0);
  else { prismY(a, [[X0 - 50, Z0 + e - 40], [cx, Z0 + H - 18], [cx, Z0 + H + 4], [X0 - 50, Z0 + e - 18]], YF - 20, YB); prismY(a, [[X1 + 50, Z0 + e - 40], [cx, Z0 + H - 18], [cx, Z0 + H + 4], [X1 + 50, Z0 + e - 18]].reverse(), YF - 20, YB); }
  for (const z of [0.4, 0.8]) for (const x of [X0 + 40, X1 - 40]) a.tube([[x, YF + 30, Z0 + e * z], [x, YB - 30, Z0 + e * z]], [10, 10], 4);   // side rails
  a.box(X0 + 40, YB - 50, Z0 + 20, X1 - 40, YB - 40, Z0 + e + (v.lean ? (H - e) : 0) - 40);   // back wall sheeting
  // bales
  const bw = (v.bale === 'sq' ? 18 : 48) * IN, bl = (v.bale === 'sq' ? 36 : 48) * IN, bh = v.bale === 'sq' ? 14 * IN : 48 * IN;
  const nx = m.max(1, m.floor((W - 140) / bl)), ny = m.max(1, m.floor((D - 160) / bw)), nz = v.rows;
  for (let k = 0; k < nz; k++) for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    if (v.bale === 'rd' && k > 0 && (i + j) % 2) continue;
    const x0 = X0 + 70 + i * bl + (W - 140 - nx * bl) / 2, y0 = YB - 80 - (j + 1) * bw, z0 = Z0 + 10 + k * bh;
    if (v.lean && z0 + bh > roofAt(x0 + bl) - 60) continue;
    if (v.bale === 'sq') a.box(x0 + 8, y0 + 4, z0, x0 + bl - 8, y0 + bw - 4, z0 + bh - 4); else a.ycyl(y0 + 6, y0 + bw - 6, x0 + bl / 2, z0 + bh / 2, bh / 2 - 6, 14);
  }
  a.outline(); for (let i = 0; i < np; i++) { const y = YF + 30 + i * (D - 60) / (np - 1); a.circ(X0 + 40, y, pw / 2, 'EQUIP-DETAIL'); a.circ(X1 - 40, y, pw / 2, 'EQUIP-DETAIL'); }
  a.rect(X0 + 70, YB - 80 - ny * bw, X1 - 70, YB - 80, 'EQUIP-HIDDEN');
  a.log('Added the poles with ' + (v.lean ? 'sloping rafters' : 'trusses') + ', roof sheets, side rails, a back wall and stacked ' + (v.bale === 'sq' ? 'square' : 'round') + ' bales (plan and 3D).');
}
const hay = fam({ cat: 'agriculture/buildings', title: 'Generic hay store', desc: (v) => `Open-sided hay store, ${v.wf} by ${v.lf} ft: pole frame with ${v.lean ? 'lean-to rafters' : 'roof trusses'}, roof sheets, back wall and stacked ${v.bale === 'sq' ? 'small square' : 'round'} bales.`, build: hayStore, vs: [
  ['lean-to, square bales, 16 x 30 ft', 192, 360, 132, 0, { lean: true, eave: 96, bay: 120, bale: 'sq', rows: 5, wf: 16, lf: 30 }], ['gable, square bales, 30 x 48 ft', 360, 576, 168, 0, { lean: false, eave: 120, bay: 144, bale: 'sq', rows: 7, wf: 30, lf: 48 }],
  ['gable, round bales, 36 x 60 ft', 432, 720, 192, 0, { lean: false, eave: 144, bay: 144, bale: 'rd', rows: 3, wf: 36, lf: 60 }], ['gable, round bales, 48 x 96 ft', 576, 1152, 216, 0, { lean: false, eave: 156, bay: 192, bale: 'rd', rows: 3, wf: 48, lf: 96 }] ] });

/** Machinery shed: mono-pitch, steel columns, bays with roller doors, one open bay. */
function mshed(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, nb = v.bays, bw = (W - 80) / nb, eh = H * 0.82;
  for (let i = 0; i <= nb; i++) { const x = X0 + 40 + i * bw; a.box(x - 60, YF + 40, Z0, x + 60, YF + 160, Z0 + H); a.box(x - 60, YB - 160, Z0, x + 60, YB - 40, Z0 + eh); a.tube([[x, YF + 100, Z0 + H - 100], [x, YB - 100, Z0 + eh - 100]], [20, 20], 5); }
  prismX(a, [[YF - 40, Z0 + H - 20], [YB + 10, Z0 + eh + 4], [YB + 10, Z0 + eh + 28], [YF - 40, Z0 + H + 4]], X0 - 30, X1 + 30);
  a.box(X0 + 40, YB - 40, Z0, X1 - 40, YB - 10, Z0 + eh);   // back
  for (let i = 0; i < nb; i++) {
    const x0 = X0 + 40 + i * bw + 60, x1 = X0 + 40 + (i + 1) * bw - 60;
    if (i === nb - 1 && v.open) continue;
    const dh = H * 0.8;
    a.box(x0, YF + 60, Z0 + 20, x1, YF + 80, Z0 + dh);   // roller door
    for (let k = 1; k < 9; k++) a.box(x0 + 8, YF + 50, Z0 + 20 + (dh - 20) * k / 9 - 5, x1 - 8, YF + 60, Z0 + 20 + (dh - 20) * k / 9 + 5);
    a.box(x0 - 20, YF + 44, Z0 + dh, x1 + 20, YF + 80, Z0 + dh + 90);   // door hood
    a.box(x0, YF + 40, Z0 + dh * 0.5 - 8, x0 + 80, YF + 52, Z0 + dh * 0.5 + 8);
    a.line(x0, YF + 60, x1, YF + 60, 'EQUIP-DETAIL');
  }
  for (const s of [-1, 1]) for (const z of [0.3, 0.6]) a.box(s < 0 ? X0 + 34 : X1 - 46, YF + 160, Z0 + H * z, s < 0 ? X0 + 46 : X1 - 34, YB - 160, Z0 + H * z + 10 + 0);
  a.box(X0 + 30, YF + 160, Z0, X0 + 40, YB - 160, Z0 + eh * 0.9); a.box(X1 - 40, YF + 160, Z0, X1 - 30, YB - 160, Z0 + eh * 0.9);   // end sheeting
  a.outline(); a.rect(X0 + 40, YF + 60, X1 - 40, YB - 10, 'EQUIP-DETAIL');
  a.log('Added the steel columns and roof beams, the sloping roof sheet, back and end sheeting, ' + (v.open ? 'roller doors on all but one bay (left open)' : 'a roller door with hood on every bay') + ' (plan and 3D).');
}
const msheds = fam({ cat: 'agriculture/buildings', title: 'Generic machinery shed', desc: (v) => `Mono-pitch machinery shed with ${v.bays} bays: steel columns, sloping roof sheet, sheeted back and ends, ${v.open ? 'roller doors with hoods and one open bay' : 'a roller door and hood on each bay'}.`, build: mshed, vs: [
  ['2 bays, roller doors', 300, 300, 168, 0, { bays: 2 }], ['3 bays, one open', 440, 340, 180, 0, { bays: 3, open: true }], ['4 bays, roller doors', 580, 360, 190, 0, { bays: 4 }] ] });

/** Silage clamp: concrete floor, two or three walls of pushed-up panels, a sloped clamp of silage with a covering sheet and a row of tyres. */
function clamp(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, wh = H * 0.7, t = 14 * IN * 0.5;
  a.box(X0, YF, Z0, X1, YB, Z0 + 8);
  for (const [x0, x1] of [[X0, X0 + t], [X1 - t, X1]]) { a.box(x0, YF + (v.open ? 0 : 40), Z0 + 8, x1, YB, Z0 + wh); for (let i = 1; i < 8; i++) a.box(x0 - 1, YF + 20 + i * (D - 20) / 8 - 10, Z0 + 8, x1 + 1, YF + 20 + i * (D - 20) / 8 + 10, Z0 + wh + 8); }
  a.box(X0, YB - t, Z0 + 8, X1, YB, Z0 + wh + (v.back ? 0 : 0));   // back wall
  // silage heap: a humped prism with sloped front
  prismY(a, [[X0 + t + 20, Z0 + 8], [X1 - t - 20, Z0 + 8], [X1 - t - 20, Z0 + wh - 20], [cx + W * 0.25, Z0 + H - 100], [cx - W * 0.25, Z0 + H - 100], [X0 + t + 20, Z0 + wh - 20]], YF + 300, YB - t);
  prismX(a, [[YF + 300, Z0 + 8], [YF + 300, Z0 + wh - 20], [YF + 40 + (D * 0.18), Z0 + 8]], X0 + t + 20, X1 - t - 20);
  for (let i = 0; i < 7; i++) for (let j = 0; j < 3; j++) { const x = cx - W * 0.22 + i * W * 0.44 / 6; a.cyl(x, YF + D * (0.35 + 0.2 * j), Z0 + H - 100, Z0 + H - 10, 150, 12); a.cyl(x, YF + D * (0.35 + 0.2 * j), Z0 + H - 80, Z0 + H - 10 + 0.01, 90, 10); }   // tyres on the sheet
  a.outline(); a.rect(X0 + t, YF + 300, X1 - t, YB - t, 'EQUIP-DETAIL'); a.line(cx, YF + 300, cx, YB - t, 'EQUIP-DETAIL');
  a.log('Added the concrete floor, two ribbed push-up walls, the back wall, the sloped silage heap and the row of tyres on top (plan and 3D).');
}
const clamps = fam({ cat: 'agriculture/buildings', title: 'Generic silage clamp', desc: (v) => `Silage clamp, ${v.wf} ft wide: concrete floor, ribbed side walls, back wall and a sloped heap of silage with a row of tyres holding the cover.`, build: clamp, vs: [
  ['20 ft wide, 60 ft long', 240, 720, 120, 0, { wf: 20, open: true }], ['30 ft wide, 90 ft long', 360, 1080, 144, 0, { wf: 30, open: true }] ] });

// ------------------------------------------------------------------------------------------ livestock
/** Hay ring feeder: a round tube ring on legs with a bale inside; v: dia in the box, bale. */
function ring(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, H } = a, r = W / 2 - 18, rh = v.rh * IN;
  a.tube(Array.from({ length: 25 }, (_, k) => [cx + m.cos(k / 24 * 2 * PI) * r, cy + m.sin(k / 24 * 2 * PI) * r, Z0 + H - 14]), Array(25).fill(14), 6);   // top ring
  a.tube(Array.from({ length: 25 }, (_, k) => [cx + m.cos(k / 24 * 2 * PI) * r, cy + m.sin(k / 24 * 2 * PI) * r, Z0 + rh]), Array(25).fill(12), 6);
  a.tube(Array.from({ length: 25 }, (_, k) => [cx + m.cos(k / 24 * 2 * PI) * r, cy + m.sin(k / 24 * 2 * PI) * r, Z0 + H * 0.55]), Array(25).fill(10), 6);
  const n = v.posts; for (let i = 0; i < n; i++) { const th = i / n * 2 * PI; a.tube([[cx + m.cos(th) * r, cy + m.sin(th) * r, Z0 + 4], [cx + m.cos(th) * r, cy + m.sin(th) * r, Z0 + H - 14]], [11, 11], 6); }
  a.cyl(cx, cy, Z0 + 4, Z0 + 12, r, 28);   // base skirt
  for (let i = 0; i < 6; i++) { const th = i / 6 * 2 * PI; a.box(cx + m.cos(th) * r * 0.5 - 40, cy + m.sin(th) * r * 0.5 - 40, Z0, cx + m.cos(th) * r * 0.5 + 40, cy + m.sin(th) * r * 0.5 + 40, Z0 + 4); }
  a.cyl(cx, cy, Z0 + 14, Z0 + 14 + v.bale * IN * 0.8, v.bale * IN / 2, 22);   // a round bale
  a.circ(cx, cy, r, 'EQUIP'); a.circ(cx, cy, r * 0.8, 'EQUIP-DETAIL'); for (let i = 0; i < n; i++) { const th = i / n * 2 * PI; a.circ(cx + m.cos(th) * r, cy + m.sin(th) * r, 11, 'EQUIP-DETAIL'); }
  a.log('Added the vertical bars, three ring rails, the base skirt and a round bale inside (plan and 3D).');
}
const rings_ = fam({ cat: 'agriculture/livestock', title: 'Generic hay ring feeder', desc: (v) => `Round hay feeder for a ${v.bale} in bale: ${v.posts} vertical bars between a top ring and two lower rail rings, base skirt and a bale inside.`, build: ring, vs: [
  ['sheep, 40 in bale', 54, 54, 36, 0, { rh: 8, posts: 16, bale: 36 }], ['cattle, 60 in bale', 78, 78, 52, 0, { rh: 10, posts: 22, bale: 60 }], ['cattle, 66 in bale', 90, 90, 58, 0, { rh: 10, posts: 26, bale: 66 }] ] });

/** Water trough: open galvanised tub with rolled rim, end plates, legs, a float valve with a supply pipe and a water surface. */
function trough(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, t = 8, h0 = Z0 + 6 * IN, lh = v.legs ? 5 * IN : 0, hb = Z0 + lh;
  a.box(X0, YF, hb, X1, YB, hb + 14); a.box(X0, YF, hb, X0 + t, YB, Z1 - 10); a.box(X1 - t, YF, hb, X1, YB, Z1 - 10);
  a.box(X0, YF, hb, X1, YF + t, Z1 - 10); a.box(X0, YB - t, hb, X1, YB, Z1 - 10);
  a.box(X0 + t, YF + t, hb + 14, X1 - t, YB - t, Z1 - 70);   // water
  a.tube([[X0 + 4, YF + 4, Z1 - 8], [X1 - 4, YF + 4, Z1 - 8]], [12, 12], 6); a.tube([[X0 + 4, YB - 4, Z1 - 8], [X1 - 4, YB - 4, Z1 - 8]], [12, 12], 6);
  a.tube([[X0 + 4, YF + 4, Z1 - 8], [X0 + 4, YB - 4, Z1 - 8]], [12, 12], 6); a.tube([[X1 - 4, YF + 4, Z1 - 8], [X1 - 4, YB - 4, Z1 - 8]], [12, 12], 6);
  const nr = m.max(2, m.round(W / (36 * IN))); for (let i = 0; i <= nr; i++) { const x = X0 + 20 + i * (W - 40) / nr; a.box(x - 12, YF - 2, hb, x + 12, YB + 0, Z1 - 20); }   // ribs
  if (lh) for (const x of [X0 + 80, X1 - 80]) for (const y of [YF + 70, YB - 70]) a.leg(x, y, Z0, hb, 18);
  // float valve and supply
  a.tube([[X1 - 70, YB - 40, Z1 - 10], [X1 - 70, YB - 40, Z1 + 0]], [12, 12], 6);
  a.tube([[X1 - 70, YB - 40, Z1 - 10], [X1 - 70, YB - 40, Z1 - 10 + 1]], [1, 1], 3);
  a.xcyl(X1 - 200, X1 - 70, YB - 40, Z1 - 60, 12, 8); a.ell(X1 - 220, YB - 40, Z1 - 75, 30, 30, 30, 8, 5);
  a.rect(X0, YF, X1, YB, 'EQUIP'); a.rect(X0 + t, YF + t, X1 - t, YB - t, 'EQUIP-DETAIL'); a.circ(X1 - 220, YB - 40, 30, 'EQUIP-DETAIL');
  a.log('Added the tub with rolled rim, end plates and ribs, ' + (v.legs ? 'four legs, ' : '') + 'the water surface and a float valve with a supply pipe (plan and 3D).');
}
const troughs = fam({ cat: 'agriculture/livestock', title: 'Generic stock water trough', desc: (v) => `Galvanised-style stock trough, ${v.lf} ft: tub with rolled rim, ribs and end plates, ${v.legs ? 'legs, ' : ''}water surface and a float valve with a supply pipe.`, build: trough, vs: [
  ['6 ft, on legs', 72, 24, 28, 0, { legs: true, lf: 6 }], ['10 ft, low', 120, 28, 24, 0, { legs: false, lf: 10 }], ['12 ft, low, deep', 144, 30, 30, 0, { legs: false, lf: 12 }] ] });

/** Cattle crush: parallel side frames with rails, a head gate with a lever at the front, rear and side entry gates. */
function crush(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, pw = 16, rails = 5;
  for (const x of [X0 + 20, X1 - 20]) {
    for (let i = 0; i < 6; i++) { const y = YF + 40 + i * (D - 80) / 5; a.box(x - 36, y - 36, Z0, x + 36, y + 36, Z0 + H); }
    for (let k = 0; k < rails; k++) { const z = Z0 + 120 + k * (H - 220) / (rails - 1); a.tube([[x, YF + 40, z], [x, YB - 40, z]], [14, 14], 6); }
    a.box(x - 2, YF + 40, Z0 + H * 0.3, x + 2, YB - 40, Z0 + H * 0.34);
    a.tube([[x, YF + 40, Z0 + H * 0.2], [x, YB - 40, Z0 + H * 0.2]], [9, 9], 4);
  }
  a.box(X0 + 20, YF + 40, Z0 + 20, X1 - 20, YB - 40, Z0 + 34);   // floor
  // head gate at the front: two swinging bars and a frame
  a.frame(X0 + 20, Z0 + 60, X1 - 20, Z0 + H, YF + 20, YF + 60, 55);
  for (const s of [-1, 1]) a.tube([[cx + s * 220, YF + 40, Z0 + H * 0.45], [cx + s * 80, YF + 40, Z0 + H * 0.88]], [18, 18], 6);
  a.tube([[cx - 220, YF + 40, Z0 + H * 0.45], [cx + 220, YF + 40, Z0 + H * 0.45]], [9, 9], 4);
  a.tube([[X1 - 20, YF + 60, Z0 + H * 0.7], [X1 + 0, YF + 60 + 220, Z0 + H * 0.7 + 220]], [14, 14], 6); a.ell(X1 - 2, YF + 280, Z0 + H * 0.7 + 230, 26, 26, 26, 8, 5);   // lever
  // rear sliding gate
  a.frame(X0 + 30, Z0 + 60, X1 - 30, Z0 + H * 0.92, YB - 40, YB - 18, 40); for (let k = 1; k < 4; k++) a.box(X0 + 30, YB - 34, Z0 + 60 + k * (H * 0.92 - 60) / 4 - 6, X1 - 30, YB - 24, Z0 + 60 + k * (H * 0.92 - 60) / 4 + 6);
  a.rect(X0 + 20 - 36, YF + 4, X0 + 20 + 36, YB, 'EQUIP'); a.rect(X1 - 20 - 36, YF + 4, X1 - 20 + 36, YB, 'EQUIP'); a.rect(X0 + 56, YF + 20, X1 - 56, YF + 60, 'EQUIP-DETAIL'); a.rect(X0 + 56, YB - 40, X1 - 56, YB - 18, 'EQUIP-DETAIL');
  a.log('Added the two rail-and-post side frames, the floor, the head gate with its lever and the rear slam gate (plan and 3D).');
}
const crushes = fam({ cat: 'agriculture/livestock', title: 'Generic cattle crush', desc: () => 'Cattle crush: two five-rail side frames on posts, a floor, a head gate with swinging bars and an operating lever, and a rear slam gate.', build: crush, vs: [
  ['standard, 28 in wide', 44, 108, 60, 0, {}], ['wide, 34 in chute', 50, 132, 62, 0, {}] ] });

/** Herringbone milking parlour: a pit between two rows of angled stalls with breast rails, feed troughs and cluster arms. v.n stalls each side. */
function parlour(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, pit = 80 * IN * 0.6, pitz = 30 * IN, st = 30 * IN, sw = (W - pit) / 2;
  a.box(cx - pit / 2 - 60, YF, Z0, cx + pit / 2 + 60, YB, Z0 + 20);   // pit floor
  for (const s of [-1, 1]) {
    const xi = cx + s * pit / 2, xo = s < 0 ? X0 : X1;
    a.box(s < 0 ? xo : xi, YF, Z0 + pitz, s < 0 ? xi : xo, YB, Z0 + pitz + 12);   // cow platform
    a.box(s < 0 ? xo : xi, YF, Z0 + 20, s < 0 ? xi : xo, YB, Z0 + pitz);
    a.box(xi - 6, YF, Z0 + pitz, xi + 6, YB, Z0 + pitz + 100);   // kerb
    for (let i = 0; i <= v.n; i++) {
      const y = YF + 120 + i * (D - 540) / v.n;
      a.tube([[xi + s * 80, y, Z0 + pitz + 12], [xi + s * 80, y, Z0 + pitz + 1040]], [16, 16], 6);   // stall post
      a.tube([[xi + s * 80, y, Z0 + pitz + 1040], [xo - s * 120, y + 300, Z0 + pitz + 1040]], [12, 12], 6);   // stall top rail
      a.tube([[xi + s * 80, y, Z0 + pitz + 540], [xo - s * 120, y + 300, Z0 + pitz + 540]], [12, 12], 6);   // mid rail
    }
    for (let i = 0; i < v.n; i++) { const y = YF + 120 + (i + 0.5) * (D - 540) / v.n + 150; a.box(s < 0 ? xo + 20 : xo - 180, y - 120, Z0 + pitz + 12, s < 0 ? xo + 180 : xo - 20, y + 120, Z0 + pitz + 220); }   // feed troughs
    a.tube([[xi + s * 50, YF + 120, Z0 + pitz + 640], [xi + s * 50, YB - 420, Z0 + pitz + 640]], [24, 24], 8);   // breast rail
    // milking units hung in the pit
    for (let i = 0; i < v.n; i++) { const y = YF + 120 + (i + 0.5) * (D - 540) / v.n + 150; a.tube([[xi - s * 20, y, Z0 + pitz + 440], [xi - s * 10, y, Z0 + pitz + 220]], [10, 10], 5); a.cyl(xi - s * 20, y, Z0 + pitz + 200, Z0 + pitz + 440, 42, 10); }
    a.rect(xo, YF, xi, YB, 'EQUIP'); 
    for (let i = 0; i <= v.n; i++) { const y = YF + 120 + i * (D - 540) / v.n; a.line(xi + s * 80, y, xo - s * 120, y + 300, 'EQUIP-DETAIL'); }
  }
  a.rect(cx - pit / 2, YF, cx + pit / 2, YB, 'EQUIP-DETAIL');
  a.log('Added the raised cow platforms, the central pit, angled stall posts with top and mid rails, breast rails, feed troughs and a milking cluster at each stall (plan and 3D).');
}
const parlours = fam({ cat: 'agriculture/livestock', title: 'Generic herringbone milking parlour', desc: (v) => `Herringbone milking parlour with ${v.n} angled stalls a side: raised platforms around a central pit, stall posts and rails, breast rail, feed troughs and a milking cluster per stall.`, build: parlour, vs: [
  ['2 x 4 stalls', 190, 210, 74, 0, { n: 4 }], ['2 x 6 stalls', 190, 300, 74, 0, { n: 6 }], ['2 x 8 stalls', 190, 390, 74, 0, { n: 8 }] ] });

/** Tubular farm gate: five rails, a heel and head stile, a diagonal brace, a latch and hinge posts. */
function gate(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, H } = a, y = cy, rails = v.rails, t = 26;
  a.tube([[X0 + 40, y, Z0 + 2], [X0 + 40, y, Z1 - 2]], [34, 34], 8); a.tube([[X1 - 40, y, Z0 + 2], [X1 - 40, y, Z1 - 2]], [34, 34], 8);   // posts
  const hz0 = Z0 + H * 0.1, hz1 = Z1 - 60, gx0 = X0 + 90, gx1 = X1 - 90;
  a.tube([[gx0, y, hz0], [gx0, y, hz1]], [t, t], 8); a.tube([[gx1 - 80, y, hz0], [gx1 - 80, y, hz1]], [t, t], 8);
  for (let k = 0; k < rails; k++) { const z = hz0 + k * (hz1 - hz0) / (rails - 1); a.tube([[gx0, y, z], [gx1 - 80, y, z]], [t * 0.7, t * 0.7], 6); }
  a.tube([[gx0, y, hz0], [gx1 - 80, y, hz1]], [t * 0.6, t * 0.6], 6);
  a.tube([[gx0 + (gx1 - gx0) * 0.45, y, hz0], [gx0 + (gx1 - gx0) * 0.45, y, hz1]], [t * 0.5, t * 0.5], 5);
  for (const z of [hz0 + 40, hz1 - 40]) a.box(X0 + 56, y - 20, z - 40, X0 + 110, y + 20, z + 40);   // hinge straps
  a.box(gx1 - 170, y - 22, hz1 - (hz1 - hz0) * 0.55 - 20, X1 - 70, y + 22, hz1 - (hz1 - hz0) * 0.55 + 20);   // latch plate
  a.rect(X0 + 40 - 17, y - 17, X0 + 40 + 17, y + 17, 'EQUIP'); a.rect(X1 - 40 - 17, y - 17, X1 - 40 + 17, y + 17, 'EQUIP'); a.line(gx0, y, gx1 - 80, y, 'EQUIP'); a.arc(X0 + 40, y, gx1 - 80 - X0 - 40, 0, 90, 'EQUIP-SWING');
  a.log('Added the hinge and latch posts, the gate frame with ' + rails + ' rails, a diagonal brace, a centre stay, hinge straps and a latch plate (plan and 3D).');
}
const gates = fam({ cat: 'agriculture/livestock', title: 'Generic tubular farm gate', desc: (v) => `Tubular steel farm gate, ${v.lf} ft: two posts, a frame with ${v.rails} rails, a diagonal brace and a centre stay, hinge straps and a latch plate.`, build: gate, vs: [
  ['10 ft, 5 rail', 130, 6, 52, 0, { rails: 5, lf: 10 }], ['12 ft, 5 rail', 154, 6, 52, 0, { rails: 5, lf: 12 }], ['14 ft, 6 rail', 178, 6, 60, 0, { rails: 6, lf: 14 }] ] });

/** Chicken coop: a raised hen shelter on legs with a pitched roof, a pop hole with ramp, an external nest box with a lid, perches, and a run in front when v.run. */
function coop(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, rd = v.run ? D * 0.5 : 540, sy0 = YF + rd, lh = v.lh * IN, nb = v.nest;
  const sw0 = X0 + (nb ? 60 : 20), sw1 = X1 - 60, hh = H * (v.run ? 0.5 : 0.55);
  for (const x of [sw0 + 30, sw1 - 30]) for (const y of [sy0 + 30, YB - 30]) a.box(x - 25, y - 25, Z0, x + 25, y + 25, Z0 + lh);   // legs
  a.box(sw0, sy0, Z0 + lh, sw1, YB, Z0 + lh + 24);   // floor
  const wt = 20, ry = Z0 + lh + 24;
  a.box(sw0, sy0, ry, sw0 + wt, YB, ry + hh); a.box(sw1 - wt, sy0, ry, sw1, YB, ry + hh); a.box(sw0, YB - wt, ry, sw1, YB, ry + hh);
  a.box(sw0, sy0, ry, sw1, sy0 + wt, ry + hh * 0.35); a.box(sw0, sy0, ry + hh * 0.35 + 150, sw1, sy0 + wt, ry + hh);   // front with pop hole between
  a.box(sw0 + (sw1 - sw0) * 0.35, sy0, ry + hh * 0.35, sw0 + (sw1 - sw0) * 0.35 + 20, sy0 + wt, ry + hh * 0.35 + 150);
  a.box(sw1 - (sw1 - sw0) * 0.35, sy0, ry + hh * 0.35, sw1 - (sw1 - sw0) * 0.35 + 20, sy0 + wt, ry + hh * 0.35 + 150);
  a.box(sw0, sy0 - 18, ry + hh - 10, sw1, sy0, ry + hh + 6);
  // pitched roof (front-to-back slope), overhang
  prismX(a, [[sy0 - 80, ry + hh], [YB - 2, ry + hh + 100], [YB - 2, ry + hh + 122], [sy0 - 80, ry + hh + 22]], sw0 - 40, sw1 + 40);
  // pop hole ramp
  const px = cx + 0.0;
  a.box(sw0 + (sw1 - sw0) * 0.38 + 20, sy0 - 520, Z0 + 60, sw1 - (sw1 - sw0) * 0.38 - 20, sy0 - 20, Z0 + 60 + 14 + 0);
  a.tube([[(sw0 + sw1) / 2 - 90, sy0 - 20, ry + hh * 0.35 - 10], [(sw0 + sw1) / 2 - 90, sy0 - 520, Z0 + 70]], [8, 8], 4); a.tube([[(sw0 + sw1) / 2 + 90, sy0 - 20, ry + hh * 0.35 - 10], [(sw0 + sw1) / 2 + 90, sy0 - 520, Z0 + 70]], [8, 8], 4);
  for (let i = 1; i < 6; i++) { const f = i / 6; a.box((sw0 + sw1) / 2 - 90, sy0 - 20 - 500 * f - 6, ry + hh * 0.35 - 10 - (ry + hh * 0.35 - 10 - Z0 - 70) * f - 6, (sw0 + sw1) / 2 + 90, sy0 - 20 - 500 * f + 6, ry + hh * 0.35 - 10 - (ry + hh * 0.35 - 10 - Z0 - 70) * f + 6); }
  // external nest box with hinged lid on the left
  if (nb) { a.box(X0 + 10, sy0 + 100, ry + 60, sw0, sy0 + 100 + m.max(300, D * 0.35), ry + 60 + hh * 0.5); prismX(a, [[sy0 + 90, ry + 60 + hh * 0.5], [sy0 + 110 + m.max(300, D * 0.35), ry + 60 + hh * 0.5 + 40], [sy0 + 110 + m.max(300, D * 0.35), ry + 60 + hh * 0.5 + 64], [sy0 + 90, ry + 60 + hh * 0.5 + 24]], X0 + 4, sw0 + 10); a.rect(X0 + 10, sy0 + 100, sw0, sy0 + 100 + m.max(300, D * 0.35), 'EQUIP-DETAIL'); }
  // perches inside (shown through the pop hole line)
  a.tube([[sw0 + 40, YB - 150, ry + hh * 0.55], [sw1 - 40, YB - 150, ry + hh * 0.55]], [14, 14], 5);
  // run in front: a frame of posts and wire panels
  if (v.run) {
    const ry0 = YF + 8;
    for (const x of [X0 + 18, X1 - 18]) for (const y of [ry0, sy0 - 10]) a.box(x - 20, y - 20, Z0, x + 20, y + 20, Z0 + H * 0.78);
    for (const z of [Z0 + H * 0.15, Z0 + H * 0.45, Z0 + H * 0.78]) { a.tube([[X0 + 18, ry0, z], [X1 - 18, ry0, z]], [8, 8], 4); a.tube([[X0 + 18, ry0, z], [X0 + 18, sy0 - 10, z]], [8, 8], 4); a.tube([[X1 - 18, ry0, z], [X1 - 18, sy0 - 10, z]], [8, 8], 4); }
    for (let i = 1; i < 8; i++) a.tube([[X0 + 18 + i * (W - 36) / 8, ry0, Z0], [X0 + 18 + i * (W - 36) / 8, ry0, Z0 + H * 0.78]], [3, 3], 3);
    for (const z of [Z0 + H * 0.78]) a.tube([[X0 + 18, ry0, z], [X1 - 18, sy0 - 10, z]], [5, 5], 4);
    a.rect(X0 + 18, ry0, X1 - 18, sy0 - 10, 'EQUIP-DETAIL');
  }
  a.rect(sw0, sy0, sw1, YB, 'EQUIP'); a.line(sw0, sy0 + wt, sw1, sy0 + wt, 'EQUIP-DETAIL'); a.circ((sw0 + sw1) / 2, sy0 - 260, 20, 'EQUIP-HIDDEN');
  a.log('Added the raised hen shelter on legs with a pitched roof overhang, pop hole and cleated ramp' + (nb ? ', an external nest box with a hinged lid' : '') + (v.run ? ' and a wire run in front' : '') + ' (plan and 3D).');
}
const coops = fam({ cat: 'agriculture/livestock', title: 'Generic chicken coop', desc: (v) => `Chicken coop for about ${v.birds} birds: raised shelter with pitched roof, pop hole and ramp${v.nest ? ', external nest box with lid' : ''}${v.run ? ' and a framed wire run' : ''}.`, build: coop, vs: [
  ['4 hens, raised, nest box', 52, 52, 54, 0, { lh: 14, nest: 1, run: false, birds: 4 }], ['12 hens, raised, with run', 72, 138, 66, 0, { lh: 16, nest: 1, run: true, birds: 12 }], ['30 hens, walk-in shelter with run', 96, 192, 80, 0, { lh: 12, nest: 0, run: true, birds: 30 }] ] });

/** Rabbit hutch: a raised two-tier hutch with wire fronts, hinged doors, a sloped roof and a sleeping box per tier. */
function hutch(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, lh = H * 0.28, tiers = v.tiers, th = (H - lh - 90) / tiers, wt = 14;
  for (const x of [X0 + 30, X1 - 30]) for (const y of [YF + 30, YB - 30]) a.box(x - 20, y - 20, Z0, x + 20, y + 20, Z0 + lh);
  for (let k = 0; k < tiers; k++) {
    const z0 = Z0 + lh + k * th, z1 = z0 + th - 6;
    a.box(X0, YF, z0, X1, YB, z0 + 16); a.box(X0, YF, z0, X0 + wt, YB, z1); a.box(X1 - wt, YF, z0, X1, YB, z1); a.box(X0, YB - wt, z0, X1, YB, z1);
    const sb = W * 0.34;   // sleeping box on the left, with a pop hole
    a.box(X0 + wt, YF, z0 + 16, X0 + sb, YF + wt, z1); a.box(X0 + sb, YF, z0 + 16, X0 + sb + 12, YF + D * 0.55, z1);
    a.box(X0 + wt, YF, z0 + 16, X0 + sb, YF + D * 0.55, z0 + 30 + 0);
    // wire front on the right: frame and wires
    a.frame(X0 + sb + 12, z0 + 30, X1 - wt, z1 - 10, YF, YF + 14, 22);
    for (let i = 1; i < 12; i++) a.box(X0 + sb + 12 + i * (W - sb - wt - 12) / 12 - 1.5, YF + 2, z0 + 30, X0 + sb + 12 + i * (W - sb - wt - 12) / 12 + 1.5, YF + 8, z1 - 10);
    a.box(X0 + wt + 10, YF - 12, z0 + 24, X0 + sb - 10, YF, z1 - 24);   // door on the sleeping box with a latch
    a.box(X0 + sb - 34, YF - 20, z0 + th * 0.45, X0 + sb - 20, YF - 12, z0 + th * 0.45 + 30);
    a.box(X0 + sb + 12, YF - 6, z0 + 16, X1 - wt, YF, z0 + 20 + 0);
    a.line(X0 + sb, YF, X0 + sb, YF + D * 0.55);
  }
  prismX(a, [[YF - 40, Z0 + lh + tiers * th - 6], [YB + 0, Z0 + H - 4 - 0], [YB + 0, Z0 + H], [YF - 40, Z0 + lh + tiers * th + 6]], X0 - 20, X1 + 0 - 0);
  a.outline(); a.rect(X0 + 14, YF + 14, X1 - 14, YB - 14, 'EQUIP-DETAIL');
  a.log('Added four legs, ' + tiers + ' tier' + (tiers > 1 ? 's' : '') + ' each with a sleeping box and door, a wire-front run with a frame, a latch and the sloped roof (plan and 3D).');
}
const hutches = fam({ cat: 'agriculture/livestock', title: 'Generic rabbit hutch', desc: (v) => `Rabbit hutch with ${v.tiers} tier${v.tiers > 1 ? 's' : ''}: raised on legs, each tier has a boxed sleeping area with a door and a wire-front run, with a sloped roof.`, build: hutch, vs: [
  ['single tier, 36 in', 36, 24, 36, 0, { tiers: 1 }], ['two tier, 48 in', 48, 28, 60, 0, { tiers: 2 }] ] });

/** Calf hutch: an arched hutch shell with an open front and a wire pen on the front. */
function calfHutch(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, pen = D * 0.4, hy0 = YF + pen, hw = W / 2 - 8;
  const arch = (y0, y1, ths) => { for (let k = 0; k < 18; k++) { const f0 = k / 18, f1 = (k + 1) / 18, p = (f) => [cx - m.cos(PI * f) * hw, Z0 + 4 + m.sin(PI * f) * (H - 8)]; const [xa, za] = p(f0), [xb, zb] = p(f1); const ix = (xx) => cx + (xx - cx) * (1 - ths / hw), iz = (zz) => Z0 + 4 + (zz - Z0 - 4) * (1 - ths / (H - 8)); prismY(a, [[xa, za], [xb, zb], [ix(xb), iz(zb)], [ix(xa), iz(za)]], y0, y1); } };
  arch(hy0, YB, 18);   // the shell
  // the back is closed with a half-ellipse plate
  for (let k = 0; k < 18; k++) { const f0 = k / 18, f1 = (k + 1) / 18; const p = (f) => [cx - m.cos(PI * f) * hw, Z0 + 4 + m.sin(PI * f) * (H - 8)]; const [xa, za] = p(f0), [xb, zb] = p(f1); prismY(a, [[xa, Z0 + 4], [xb, Z0 + 4], [xb, zb], [xa, za]], YB - 14, YB); }
  a.box(cx - hw, hy0, Z0, cx + hw, YB, Z0 + 14);   // floor
  // pen: posts, rails and a feed bucket ring
  for (const x of [cx - hw, cx + hw]) { a.box(x - 14, YF + 10, Z0, x + 14, YF + 38, Z0 + H * 0.62); a.tube([[x, YF + 24, Z0 + H * 0.62], [x, hy0, Z0 + H * 0.62]], [8, 8], 4); a.tube([[x, YF + 24, Z0 + H * 0.3], [x, hy0, Z0 + H * 0.3]], [8, 8], 4); }
  a.tube([[cx - hw, YF + 24, Z0 + H * 0.62], [cx + hw, YF + 24, Z0 + H * 0.62]], [8, 8], 4); a.tube([[cx - hw, YF + 24, Z0 + H * 0.3], [cx + hw, YF + 24, Z0 + H * 0.3]], [8, 8], 4);
  for (let i = 1; i < 10; i++) a.tube([[cx - hw + i * hw * 2 / 10, YF + 24, Z0 + 14], [cx - hw + i * hw * 2 / 10, YF + 24, Z0 + H * 0.62]], [3, 3], 3);
  a.cyl(cx + hw * 0.5, YF + 140, Z0 + 14, Z0 + 230, 120, 12);   // water bucket
  a.rect(cx - hw, hy0, cx + hw, YB, 'EQUIP'); a.rect(cx - hw, YF + 10, cx + hw, hy0, 'EQUIP-DETAIL'); a.circ(cx + hw * 0.5, YF + 140, 120, 'EQUIP-DETAIL');
  a.log('Added the arched hutch shell with a closed back and floor, the front pen with posts, rails and wires, and a water bucket (plan and 3D).');
}
const calfs = fam({ cat: 'agriculture/livestock', title: 'Generic calf hutch', desc: (v) => `Arched calf hutch, ${v.sz} class: open-front arch shell with a closed back and floor, and a wire-and-rail pen in front with a water bucket.`, build: calfHutch, vs: [
  ['standard, 48 in wide', 48, 108, 52, 0, { sz: 'single calf' }], ['large, 60 in wide', 60, 132, 62, 0, { sz: 'large calf' }] ] });

/** Horse stall: a box with partitions of boards over a grille, a Dutch door, a feed manger, a water bucket and a hay rack. */
function stall(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, t = 14, wh = H * 0.55;
  a.box(X0, YF, Z0, X1, YB, Z0 + 6);
  for (const x of [X0, X1 - t]) { a.box(x, YB - 0, Z0, x + t, YF, Z0 + wh); for (let i = 0; i < 9; i++) a.tube([[x + t / 2, YF + 40 + i * (D - 80) / 8, Z0 + wh], [x + t / 2, YF + 40 + i * (D - 80) / 8, Z1 - 60]], [9, 9], 4); a.tube([[x + t / 2, YF + 40, Z1 - 60], [x + t / 2, YB - 40, Z1 - 60]], [14, 14], 5); a.tube([[x + t / 2, YF + 40, Z0 + (wh + Z1 - 60 - Z0) / 2], [x + t / 2, YB - 40, Z0 + (wh + Z1 - 60 - Z0) / 2]], [8, 8], 4); }
  a.box(X0, YB - t, Z0, X1, YB, Z0 + wh); for (let i = 0; i < 12; i++) a.tube([[X0 + 30 + i * (W - 60) / 11, YB - t / 2, Z0 + wh], [X0 + 30 + i * (W - 60) / 11, YB - t / 2, Z1 - 60]], [9, 9], 4);
  // front: posts, a lower half door and upper half door open with grille
  const dw = m.min(W * 0.75, 52 * IN * 1.0), dx0 = cx - dw / 2, dx1 = cx + dw / 2;
  a.box(X0, YF, Z0, dx0, YF + t, Z1 - 60); a.box(dx1, YF, Z0, X1, YF + t, Z1 - 60);
  a.box(dx0, YF - 6, Z0 + 20, dx1, YF + 8, Z0 + wh);   // lower door
  for (let i = 1; i < 5; i++) a.box(dx0, YF - 12, Z0 + 20 + (wh - 20) * i / 5 - 5, dx1, YF - 6, Z0 + 20 + (wh - 20) * i / 5 + 5);
  a.frame(dx0, Z0 + wh + 10, dx1, Z1 - 70, YF - 6, YF + 8, 36); for (let i = 1; i < 8; i++) a.tube([[dx0 + i * dw / 8, YF, Z0 + wh + 20], [dx0 + i * dw / 8, YF, Z1 - 80]], [6, 6], 4);   // upper grille
  a.box(dx1 - 90, YF - 20, Z0 + wh * 0.6, dx1 - 30, YF - 6, Z0 + wh * 0.6 + 60);   // bolt
  a.tube([[X0, YF, Z1 - 60], [X1, YF, Z1 - 60]], [20, 20], 6);
  // manger and hay rack in the corner, bucket
  a.box(X1 - t - 560, YB - t - 380, Z0 + 600, X1 - t, YB - t, Z0 + 900); a.box(X1 - t - 540, YB - t - 360, Z0 + 640, X1 - t - 20, YB - t - 20, Z0 + 900);
  a.box(X0 + t + 20, YB - t - 500, Z0 + 1100, X0 + t + 20 + 700, YB - t - 40, Z0 + 1160); a.tube([[X0 + t + 20, YB - t - 500, Z0 + 1100], [X0 + t + 20, YB - t - 40, Z0 + 1400]], [8, 8], 4);
  a.cyl(X0 + t + 280, YB - t - 250, Z0 + 6, Z0 + 340, 130, 12);
  a.outline(); a.line(dx0, YF, dx1, YF, 'EQUIP-SWING'); a.rect(X0 + t, YF + t, X1 - t, YB - t, 'EQUIP-DETAIL');
  a.log('Added the kick-board partitions topped by grilles, the front with posts and a Dutch door (lower and upper half), a corner manger, hay rack and water bucket (plan and 3D).');
}
const stalls = fam({ cat: 'agriculture/livestock', title: 'Generic horse stall', desc: (v) => `Horse stall, ${v.sz}: boarded partitions topped by bar grilles, a Dutch door with an upper grille, a corner manger, a hay rack and a water bucket.`, build: stall, vs: [
  ['10 x 10 ft', 120, 120, 96, 0, { sz: '10 by 10 ft' }], ['12 x 12 ft', 144, 144, 102, 0, { sz: '12 by 12 ft' }] ] });

/** Sheep or pig pen hurdle panel set: a panel and a gate on posts with bars, and a short corner return. */
function pen(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, n = v.panels, pw = (W - 80) / n, bars = v.bars;
  for (let i = 0; i <= n; i++) a.box(X0 + 40 + i * pw - 25, YB - 40, Z0, X0 + 40 + i * pw + 25, YB, Z1);   // posts
  for (let i = 0; i < n; i++) {
    const x0 = X0 + 40 + i * pw + 25, x1 = X0 + 40 + (i + 1) * pw - 25;
    for (let k = 0; k < bars; k++) a.tube([[x0, YB - 20, Z0 + 60 + k * (H - 120) / (bars - 1)], [x1, YB - 20, Z0 + 60 + k * (H - 120) / (bars - 1)]], [9, 9], 5);
    for (let k = 1; k < 5; k++) a.tube([[x0 + k * (x1 - x0) / 5, YB - 20, Z0 + 60], [x0 + k * (x1 - x0) / 5, YB - 20, Z1 - 60]], [5, 5], 4);
    a.line(x0, YB - 20, x1, YB - 20, 'EQUIP');
  }
  if (v.gate) { const gx0 = X0 + 40 + (n - 1) * pw + 40; a.tube([[gx0, YB - 70, Z0 + 60], [gx0 + pw - 80, YB - 70, Z1 - 60]], [8, 8], 4); }
  for (let k = 0; k < bars; k++) a.tube([[X0 + 40, YB - 20, Z0 + 60 + k * (H - 120) / (bars - 1)], [X0 + 40, YF + 40, Z0 + 60 + k * (H - 120) / (bars - 1)]], [9, 9], 5);   // return
  a.box(X0 + 15, YF + 15, Z0, X0 + 65, YF + 65, Z1);
  a.outline(); a.rect(X0 + 40, YB - 40, X1 - 40, YB, 'EQUIP-DETAIL'); a.line(X0 + 40, YB - 20, X0 + 40, YF + 40, 'EQUIP');
  a.log('Added ' + (n + 1) + ' posts, ' + n + ' panels of ' + bars + ' rails with vertical stays, a corner return' + (v.gate ? ' and a diagonal gate brace' : '') + ' (plan and 3D).');
}
const pens = fam({ cat: 'agriculture/livestock', title: 'Generic stock pen panels', desc: (v) => `Run of ${v.panels} stock panels for ${v.an}: posts, ${v.bars}-rail panels with vertical stays, a corner return${v.gate ? ' and a braced gate' : ''}.`, build: pen, vs: [
  ['sheep, 4 panels', 180, 40, 40, 0, { panels: 4, bars: 6, an: 'sheep', gate: false }], ['pigs, 6 panels with gate', 240, 40, 36, 0, { panels: 6, bars: 5, an: 'pigs', gate: true }] ] });

// ------------------------------------------------------------------------------------------ irrigation
/** One span of a centre pivot: a truss pipe on an A-frame tower with two wheels, drop pipes and sprinkler heads, and a coupling at the far end. */
function pivot(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pz = Z0 + H * 0.78, pr = 85, wr = 21 * IN, tx = X1 - 400;
  a.tube([[X0 + 40, cy, pz], [X1 - 120, cy, pz]], [pr, pr], 14);   // main pipe
  for (let i = 0; i <= 3; i++) { const x = X0 + 160 + i * (tx - X0 - 160) / 3; a.ell(x, cy, pz, 110, 110, 110, 10, 5); }
  const nt = m.round((W - 500) / 600);
  for (let i = 0; i <= nt; i++) { const x = X0 + 120 + i * (tx - X0 - 120) / nt; a.tube([[x, cy - 120, pz - 500], [x, cy + 120, pz - 500]], [18, 18], 5); a.tube([[x, cy - 120, pz - 500], [x, cy, pz + pr]], [10, 10], 4); a.tube([[x, cy + 120, pz - 500], [x, cy, pz + pr]], [10, 10], 4); }
  a.tube([[X0 + 100, cy - 120, pz - 500], [tx, cy - 120, pz - 500]], [14, 14], 6); a.tube([[X0 + 100, cy + 120, pz - 500], [tx, cy + 120, pz - 500]], [14, 14], 6);
  for (let i = 0; i < nt; i++) { const x0 = X0 + 120 + i * (tx - X0 - 120) / nt, x1 = X0 + 120 + (i + 1) * (tx - X0 - 120) / nt; a.tube([[x0, cy - 120, pz - 500], [x1, cy, pz + pr]], [7, 7], 4); a.tube([[x0, cy + 120, pz - 500], [x1, cy, pz + pr]], [7, 7], 4); }
  // drops with sprinklers
  const nd = m.round(W / (v.drop * IN));
  for (let i = 0; i < nd; i++) { const x = X0 + 400 + i * (W - 900) / (nd - 1); a.tube([[x, cy, pz - pr], [x, cy, pz - 900 - (i % 2) * 120]], [8, 8], 4); a.cone(x, cy, pz - 960 - (i % 2) * 120, pz - 900 - (i % 2) * 120, 40, 40, 8); a.cyl(x, cy, pz - 1000 - (i % 2) * 120, pz - 960 - (i % 2) * 120, 50, 8); }
  // tower: A-frame legs, gear boxes and two wheels
  for (const s of [-1, 1]) {
    a.tube([[tx, cy + s * 120, pz - 500], [tx - 20, cy + s * (D / 2 - wr * 0.75), Z0 + wr]], [24, 24], 8);
    a.tube([[tx + 60, cy + s * 120, pz - 500], [tx + 80, cy + s * (D / 2 - wr * 0.75), Z0 + wr]], [24, 24], 8);
    a.ycyl(cy + s * (D / 2 - wr * 0.75) - 150 * (s < 0 ? 1 : -1), cy + s * (D / 2 - wr * 0.75) + 150 * (s < 0 ? 1 : -1), tx + 30, Z0 + wr, wr, 18);
    a.ycyl(cy + s * (D / 2 - wr * 0.75) - 160 * (s < 0 ? 1 : -1), cy + s * (D / 2 - wr * 0.75) + 160 * (s < 0 ? 1 : -1), tx + 30, Z0 + wr, wr * 0.4, 12);
    a.box(tx - 70, cy + s * (D / 2 - wr * 0.75) - 100, Z0 + wr + wr * 0.4, tx + 130, cy + s * (D / 2 - wr * 0.75) + 100, Z0 + wr + wr * 0.4 + 260);
  }
  a.tube([[tx, cy - 120, pz - 500], [tx, cy + 120, pz - 500]], [24, 24], 8); a.tube([[tx - 20, cy - (D / 2 - wr * 0.75), Z0 + wr], [tx - 20, cy + (D / 2 - wr * 0.75), Z0 + wr]], [20, 20], 6);
  a.box(tx - 150, cy - 160, pz - 760, tx + 250, cy + 160, pz - 520);   // control box
  a.box(X1 - 130, cy - 130, pz - 130, X1, cy + 130, pz + 130);   // end coupling flange
  a.line(X0, cy, X1, cy, 'EQUIP'); a.rect(tx - 40, cy - D / 2 + wr * 0.75 - 22, tx + 100, cy - D / 2 + wr * 0.75 + 22, 'EQUIP-DETAIL'); a.rect(tx - 40, cy + D / 2 - wr * 0.75 - 22, tx + 100, cy + D / 2 - wr * 0.75 + 22, 'EQUIP-DETAIL');
  a.rect(X0, cy - pr, X1, cy + pr, 'EQUIP'); a.rect(tx - 150, cy - 160, tx + 250, cy + 160, 'EQUIP-DETAIL');
  a.log('Added the main pipe with a truss, the A-frame tower with two driven wheels and gear boxes, a control box, drop pipes with sprinkler heads and the end coupling (plan and 3D).');
}
const pivots = fam({ cat: 'agriculture/irrigation', title: 'Generic centre pivot span', desc: (v) => `One centre-pivot span, ${v.ft} ft: 6 in main pipe on a bottom truss, a wheeled A-frame tower with control box, drop pipes with sprinkler heads at ${v.drop} in spacing.`, build: pivot, vs: [
  ['100 ft span, tower', 1200, 140, 176, 0, { ft: 100, drop: 78 }], ['130 ft span, tower', 1560, 140, 180, 0, { ft: 130, drop: 78 }], ['160 ft span, tower', 1920, 144, 184, 0, { ft: 160, drop: 90 }], ['180 ft span, tower, tall', 2160, 150, 196, 0, { ft: 180, drop: 90 }] ] });

/** Irrigation pump set: a skid with a horizontal electric motor, coupling guard, a volute pump with suction and discharge pipes, a gauge and a check valve. */
function pump(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, my = YB - D * 0.3, mr = H * 0.2, mz = Z0 + H * 0.3, mw = D * 0.34, nk = H * 0.2, ol = m.min(mr * 3.2, W / 2 - 60);
  a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 40);
  for (const x of [X0 + 80, X1 - 80]) a.box(x - 30, YF + 40, Z0 + 40, x + 30, YB - 40, Z0 + 70);
  // motor along Y
  a.ycyl(my - mw / 2, my + mw / 2, cx, mz, mr, 22); a.ycyl(my - mw / 2 - 10, my - mw / 2 + 10, cx, mz, mr * 1.02, 22);
  for (let i = 0; i < 10; i++) a.ycyl(my - mw / 2 + 30 + i * (mw - 60) / 9 - 4, my - mw / 2 + 30 + i * (mw - 60) / 9 + 4, cx, mz, mr * 1.08, 20);   // fins
  a.box(cx - mr * 0.5, my - mw * 0.2, mz + mr, cx + mr * 0.5, my + mw * 0.2, mz + mr + mr * 0.5);   // terminal box
  a.box(cx - mr * 0.9, my - mw / 2, Z0 + 70, cx + mr * 0.9, my - mw / 2 + mw * 0.7, mz - mr * 0.6);   // motor feet
  a.ycyl(my - mw / 2 - 100, my - mw / 2, cx, mz, mr * 0.9, 16);   // coupling guard
  // pump volute at the front
  const py = my - mw / 2 - 100 - 120;
  a.ycyl(py - 90, py + 120, cx, mz, mr * 1.25, 22); a.ell(cx, py - 90, mz, mr * 1.25, 40, mr * 1.25, 14, 5);
  a.cyl(cx, py, mz + mr * 1.2, mz + mr * 1.2 + nk, mr * 0.55, 14);   // discharge neck up
  a.xcyl(cx, cx + ol, py, mz + mr * 1.2 + nk, mr * 0.55, 14); a.xcyl(cx + ol - 12, cx + ol + 12, py, mz + mr * 1.2 + nk, mr * 0.85, 14);
  a.ycyl(YF + 20, py - 130, cx, mz, mr * 0.7, 14); a.ycyl(YF + 20, YF + 36, cx, mz, mr * 1.0, 14);   // suction inlet and flange
  a.cyl(cx + mr * 1.0, py + 40, mz + mr * 1.2 + nk - 10, mz + mr * 1.2 + nk + 40, 14, 8); a.ell(cx + mr * 1.0, py + 40, mz + mr * 1.2 + nk + 60, 38, 22, 38, 10, 5);   // gauge
  a.circ(cx, my, mr, 'EQUIP'); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP'); a.rect(cx - mr * 0.9, my - mw / 2, cx + mr * 0.9, my + mw / 2, 'EQUIP-DETAIL'); a.circ(cx, py, mr * 1.25, 'EQUIP-DETAIL'); a.rect(cx, py - mr * 0.55, cx + ol, py + mr * 0.55, 'EQUIP-DETAIL');
  a.log('Added the skid with rails, the finned electric motor with terminal box and coupling guard, the volute pump with suction flange and a discharge elbow with flange and pressure gauge (plan and 3D).');
}
const pumps = fam({ cat: 'agriculture/irrigation', title: 'Generic irrigation pump set', desc: (v) => `Skid-mounted irrigation pump, ${v.hp} hp class: finned electric motor with terminal box, coupling guard, volute pump with suction flange, discharge elbow and a pressure gauge.`, build: pump, vs: [
  ['5 hp, 2 in discharge', 20, 40, 26, 0, { hp: 5 }], ['25 hp, 4 in discharge', 28, 64, 36, 0, { hp: 25 }], ['75 hp, 6 in discharge', 40, 88, 46, 0, { hp: 75 }] ] });

/** Vertical poly water tank: ribbed barrel with a domed lid, manway, outlet fitting and a level gauge; or an elevated steel tank on a braced tower. */
function tank(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, r = W / 2 - 14;
  if (v.tower) {
    const lh = H * 0.5, th = H - lh;
    for (let i = 0; i < 4; i++) { const th2 = i / 4 * 2 * PI + PI / 4; const x = cx + m.cos(th2) * r * 0.85, y = cy + m.sin(th2) * r * 0.85; a.tube([[x, y, Z0], [x * 0.92 + cx * 0.08, y * 0.92 + cy * 0.08, Z0 + lh]], [14, 14], 6); a.box(x - 60, y - 60, Z0, x + 60, y + 60, Z0 + 10); }
    for (const f of [0.35, 0.7]) { const ps = Array.from({ length: 5 }, (_, i) => { const t2 = i / 4 * 2 * PI + PI / 4; return [cx + m.cos(t2) * r * (0.85 - 0.08 * f), cy + m.sin(t2) * r * (0.85 - 0.08 * f), Z0 + lh * f]; }); a.tube(ps, Array(5).fill(8), 4); }
    xbrace(a, cx - r * 0.6, cx + r * 0.6, cy - r * 0.6, Z0 + 40, Z0 + lh - 40, 8); xbrace(a, cx - r * 0.6, cx + r * 0.6, cy + r * 0.6, Z0 + 40, Z0 + lh - 40, 8);
    a.cyl(cx, cy, Z0 + lh, Z0 + lh + th * 0.78, r, 28); a.cone(cx, cy, Z0 + lh + th * 0.78, Z1 - 20, r, r * 0.12, 28); a.cyl(cx, cy, Z1 - 70, Z1, 60, 10);
    rings(a, cx, cy, Z0 + lh, Z0 + lh + th * 0.78, r, 6, 28);
    a.cone(cx, cy, Z0 + lh - 160, Z0 + lh, 60, r, 24); a.cyl(cx, cy, Z0 + 100, Z0 + lh - 160, 40, 10);   // bottom cone and downpipe
    ladder(a, cx + r * 0.3, cy - r - 40, Z0, cy - r - 40, Z0 + lh + th * 0.78, 400, 14);
  } else {
    a.cyl(cx, cy, Z0, Z0 + H * 0.92, r, 32);
    for (let i = 0; i < v.ribs; i++) a.cyl(cx, cy, Z0 + (H * 0.92) * (i + 0.5) / v.ribs - 18, Z0 + (H * 0.92) * (i + 0.5) / v.ribs + 18, r + 14, 32);
    a.cone(cx, cy, Z0 + H * 0.92, Z1 - 20, r * 0.96, r * 0.4, 32); a.cyl(cx, cy, Z1 - 20, Z1, r * 0.4, 20);
    a.cyl(cx + r * 0.5, cy + r * 0.2, Z1 - 50, Z1, 110, 14);   // manway lid on the dome
    a.cyl(cx, cy, Z0, Z0 + 8, r + 40, 32);
    a.xcyl(cx - 10, cx + 10, cy - r - 80, Z0 + 140, 28, 8); a.ycyl(cy - r - 120, cy - r + 6, cx, Z0 + 140, 28, 10); a.cyl(cx, cy - r - 120, Z0 + 60, Z0 + 140, 30, 8);   // outlet fitting
    a.tube([[cx + r * 0.0 + 80, cy - r - 18, Z0 + 140], [cx + r * 0.0 + 80, cy - r - 18, Z0 + H * 0.88]], [7, 7], 4);   // level gauge pipe
  }
  a.circ(cx, cy, r, 'EQUIP'); a.circ(cx, cy, r * 0.4, 'EQUIP-DETAIL'); a.circ(cx, cy - r - 60, 30, 'EQUIP-DETAIL');
  a.log(v.tower ? 'Added the four braced legs, the cylindrical tank with ribs, cone roof and vent, the bottom cone and down pipe and a caged-style ladder (plan and 3D).' : 'Added the ribbed barrel, domed lid with manway, base ring, outlet fitting and level gauge tube (plan and 3D).');
}
const tanksP = fam({ cat: 'agriculture/irrigation', title: 'Generic vertical water tank', desc: (v) => v.tower ? `Elevated steel water tank, ${v.gal} gallon: tank with ribs and cone roof on a braced four-leg tower with a ladder and a bottom downpipe.` : `Vertical poly water tank, ${v.gal} gallon: ribbed barrel, domed lid with manway, base ring, outlet fitting and a level gauge tube.`, build: tank, vs: [
  ['poly, 1,000 gal', 52, 52, 72, 0, { gal: 1000, ribs: 6 }], ['poly, 5,000 gal', 100, 100, 108, 0, { gal: '5,000', ribs: 8 }], ['poly, 10,000 gal', 134, 134, 120, 0, { gal: '10,000', ribs: 9 }],
  ['steel on tower, 5,000 gal', 120, 120, 250, 0, { gal: '5,000', tower: true }], ['steel on tower, 15,000 gal', 168, 168, 320, 0, { gal: '15,000', tower: true }] ] });

/** Impact sprinkler on a riser: base plate, riser pipe, body with a spring arm, two nozzles, a flow-straightening vane, and a stake leg set. */
function sprinkler(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, H } = a, rz = Z0 + v.riser * IN;
  a.cyl(cx, cy, Z0, Z0 + 8, W * 0.46, 16);
  for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.4, cy, Z0 + 8], [cx, cy, Z0 + v.riser * IN * 0.45]], [7, 7], 4); a.tube([[cx, cy + s * W * 0.4, Z0 + 8], [cx, cy, Z0 + v.riser * IN * 0.45]], [7, 7], 4); }
  a.cyl(cx, cy, Z0 + 8, rz, 16, 10); a.cyl(cx, cy, Z0 + v.riser * IN * 0.45 - 20, Z0 + v.riser * IN * 0.45 + 20, 24, 10);
  a.cyl(cx, cy, rz, rz + 70, 34, 12); a.cone(cx, cy, rz + 70, rz + 140, 34, 22, 12);   // head body
  a.ycyl(cy - 20, cy - 20 - v.noz, cx, rz + 110, 18, 10); a.ycyl(cy - 20 - v.noz, cy - 20 - v.noz - 36, cx, rz + 110, 12, 10);   // main nozzle
  a.xcyl(cx + 20, cx + 20 + v.noz * 0.55, cy + 10, rz + 118, 9, 8);   // second nozzle
  a.tube([[cx, cy + 20, rz + 150], [cx - 60, cy + 40, rz + 170], [cx - 60, cy - 70, rz + 120]], [4, 4, 4], 4);   // spring arm
  a.box(cx - 40, cy - 50 - v.noz * 0.5, rz + 130, cx + 40, cy - 50, rz + 150);   // arm head
  a.circ(cx, cy, W * 0.46, 'EQUIP'); a.circ(cx, cy, 16, 'EQUIP-DETAIL'); a.line(cx, cy, cx, cy - v.noz, 'EQUIP-DETAIL');
  a.log('Added the base plate with stake braces, the riser with a collar, the rotating head body, two nozzles and the spring arm (plan and 3D).');
}
const sprinklers = fam({ cat: 'agriculture/irrigation', title: 'Generic impact sprinkler on riser', desc: (v) => `Impact sprinkler on a ${v.riser} in riser: base plate with stake braces, riser pipe with a collar, head body, two nozzles and a spring-loaded arm.`, build: sprinkler, vs: [
  ['24 in riser', 16, 16, 38, 0, { riser: 24, noz: 100 }], ['48 in riser, large', 20, 20, 62, 0, { riser: 48, noz: 130 }] ] });

/** Travelling rain gun on a wheeled cart: a trailer frame, a big gun on a riser with a long barrel, a hose reel inlet and a hose coil. */
function raingun(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, wr = 10 * IN, bz = Z0 + wr * 1.5;
  a.box(cx - W * 0.3, YF + D * 0.2, bz - 30, cx + W * 0.3, YB - D * 0.1, bz + 30);   // chassis
  for (const s of [-1, 1]) { a.xcyl(cx + s * (W / 2 - 100), cx + s * (W / 2 - 20), cy + D * 0.15, Z0 + wr, wr, 16); }
  a.xcyl(cx - W / 2 + 60, cx + W / 2 - 60, cy + D * 0.15, Z0 + wr, 12, 6);
  a.tube([[cx, YF + D * 0.2, bz], [cx, YF + 20, bz + 120]], [22, 22], 6);   // drawbar
  a.cyl(cx, cy, bz + 30, bz + H * 0.45, 28, 12); a.cyl(cx, cy, bz + H * 0.45, bz + H * 0.45 + 160, 40, 12);   // riser and gun base
  a.tube([[cx, cy, bz + H * 0.45 + 160], [cx, cy - D * 0.4, bz + H * 0.45 + 340]], [32, 14], 10);   // barrel
  a.cyl(cx, cy - D * 0.4, bz + H * 0.45 + 330, bz + H * 0.45 + 350, 20, 8); a.box(cx - 20, cy - D * 0.4, bz + H * 0.45 + 340, cx + 20, cy - D * 0.4 - 40, bz + H * 0.45 + 360);
  a.tube([[cx, cy + 80, bz + H * 0.45 + 160], [cx + 160, cy + 140, bz + H * 0.45 + 250]], [8, 8], 4);   // arm
  // hose coil on the cart
  a.xcyl(cx - 200, cx + 200, cy + D * 0.28, bz + 330, 290, 18); a.xcyl(cx - 230, cx - 210, cy + D * 0.28, bz + 330, 320, 18); a.xcyl(cx + 210, cx + 230, cy + D * 0.28, bz + 330, 320, 18);
  a.box(cx - 40, cy + D * 0.28 - 60, bz + 30, cx + 40, cy + D * 0.28 + 60, bz + 330);
  a.rect(cx - W * 0.3, YF + D * 0.2, cx + W * 0.3, YB - D * 0.1, 'EQUIP'); a.circ(cx, cy, 40, 'EQUIP-DETAIL'); a.line(cx, cy, cx, cy - D * 0.4, 'EQUIP-DETAIL'); a.rect(cx - 230, cy + D * 0.28 - 290, cx + 230, cy + D * 0.28 + 290, 'EQUIP-DETAIL');
  a.rect(cx - W / 2 + 60, cy + D * 0.15 - wr, cx - W / 2 + 140, cy + D * 0.15 + wr, 'EQUIP-DETAIL'); a.rect(cx + W / 2 - 140, cy + D * 0.15 - wr, cx + W / 2 - 60, cy + D * 0.15 + wr, 'EQUIP-DETAIL');
  a.log('Added the wheeled chassis with drawbar, the riser with a long gun barrel and nozzle, and a hose reel (plan and 3D).');
}
const guns = fam({ cat: 'agriculture/irrigation', title: 'Generic travelling rain gun cart', desc: () => 'Rain gun on a two-wheel cart: chassis and drawbar, riser with a long barrel and nozzle, an arm and a hose coil on a reel.', build: raingun, vs: [
  ['2 wheel, 1.5 in nozzle', 54, 72, 66, 0, {}] ] });

/** Hose-reel irrigator: a big hose drum on a wheeled frame with a legs, a gun cart at the free end, a drive turbine, and a pivoting stand. */
function reel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, wr = v.wr * IN, dr = v.drum * IN / 2, dz = Z0 + wr + dr * 0.6, dw = W * 0.7;
  a.box(cx - W * 0.4, YF + D * 0.25, Z0 + wr * 1.2, cx + W * 0.4, YB - D * 0.15, Z0 + wr * 1.2 + 40);
  a.tube([[cx, YF + D * 0.25, Z0 + wr * 1.3], [cx, YF + 10, Z0 + wr * 1.5]], [30, 30], 8); a.box(cx - 60, YF, Z0 + wr * 1.5 - 30, cx + 60, YF + 70, Z0 + wr * 1.5 + 30);
  for (const s of [-1, 1]) { a.xcyl(cx + s * (W / 2 - 80), cx + s * (W / 2 - 20), YB - D * 0.35, Z0 + wr, wr, 16); a.xcyl(cx + s * (W / 2 - 110), cx + s * (W / 2 - 90), YB - D * 0.35, Z0 + wr, wr * 0.55, 10); }
  a.xcyl(cx - W / 2 + 80, cx + W / 2 - 80, YB - D * 0.35, Z0 + wr, 14, 6);
  // drum with flanges
  const dy = YB - D * 0.4;
  a.xcyl(cx - dw / 2, cx + dw / 2, dy, dz, dr * 0.45, 20); a.xcyl(cx - dw / 2 - 10, cx - dw / 2 + 20, dy, dz, dr, 22); a.xcyl(cx + dw / 2 - 20, cx + dw / 2 + 10, dy, dz, dr, 22);
  a.xcyl(cx - dw / 2 + 20, cx + dw / 2 - 20, dy, dz, dr * 0.9, 22);   // hose coil
  for (let i = 0; i < 8; i++) { const th = i / 8 * 2 * PI; a.box(cx - dw / 2 - 10 - 20, dy + m.cos(th) * dr * 0.6 - 15, dz + m.sin(th) * dr * 0.6 - 15, cx - dw / 2 - 10, dy + m.cos(th) * dr * 0.6 + 15, dz + m.sin(th) * dr * 0.6 + 15); }
  a.tube([[cx - dw / 2 - 30, dy, dz - dr * 0.9], [cx - dw / 2 - 30, dy, Z0 + wr * 1.2 + 40]], [20, 20], 6);   // drive shaft
  a.box(cx - dw / 2 - 60, dy - 90, Z0 + wr * 1.2 + 40, cx - dw / 2 + 20, dy + 90, Z0 + wr * 1.2 + 260);   // turbine housing
  a.tube([[cx, dy, dz + dr], [cx, YF + D * 0.35, dz + dr * 0.6]], [16, 16], 6);   // guide arm
  a.tube([[cx - dw / 2, dy, Z0 + wr * 1.2 + 40], [cx - dw / 2, dy, dz]], [14, 14], 6); a.tube([[cx + dw / 2, dy, Z0 + wr * 1.2 + 40], [cx + dw / 2, dy, dz]], [14, 14], 6);
  for (const s of [-1, 1]) a.tube([[cx + s * dw * 0.45, YB - 60, Z0 + wr * 1.2 + 40], [cx + s * dw * 0.5, YB - 40, Z0 + 4]], [14, 14], 6);   // rear legs
  a.rect(cx - W * 0.4, YF + D * 0.25, cx + W * 0.4, YB - D * 0.15, 'EQUIP'); a.rect(cx - dw / 2, dy - dr, cx + dw / 2, dy + dr, 'EQUIP-DETAIL'); a.circ(cx, YF + D * 0.35, 30, 'EQUIP-DETAIL');
  a.log('Added the chassis with drawbar and two wheels, the flanged hose drum with a coil and spokes, the drive turbine housing, a guide arm and rear legs (plan and 3D).');
}
const reels = fam({ cat: 'agriculture/irrigation', title: 'Generic hose reel irrigator', desc: (v) => `Hose reel irrigator, ${v.hose} ft of hose: wheeled chassis with drawbar, a flanged hose drum with a coil, a drive turbine, a guide arm and rear legs.`, build: reel, vs: [
  ['330 ft hose', 84, 150, 78, 0, { wr: 15, drum: 66, hose: 330 }], ['660 ft hose', 96, 186, 92, 0, { wr: 17, drum: 80, hose: 660 }], ['1,000 ft hose', 110, 220, 108, 0, { wr: 20, drum: 96, hose: '1,000' }] ] });

/** Tower grain dryer: a tall column of perforated plenum walls, a hopper above, a burner and fan on the side, a plenum duct, an unloading auger at the foot, a ladder and a platform. */
function dryer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cw = W * 0.5, cd = D * 0.5, ch0 = H * 0.18, ch1 = H * 0.78;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * cw / 2 - 25, cy + sy * cd / 2 - 25, Z0, cx + sx * cw / 2 + 25, cy + sy * cd / 2 + 25, Z0 + ch0);
  a.cone(cx, cy, Z0 + ch0 - 200, Z0 + ch0, 60, cw * 0.6, 4);   // lower pyramid hopper (as a 4-seg cone)
  a.box(cx - cw / 2, cy - cd / 2, Z0 + ch0, cx + cw / 2, cy + cd / 2, Z0 + ch1);   // column
  for (let i = 1; i < 14; i++) { const z = Z0 + ch0 + (ch1 - ch0) * i / 14; a.box(cx - cw / 2 - 6, cy - cd / 2 - 6, z - 5, cx + cw / 2 + 6, cy + cd / 2 + 6, z + 5); }   // perforation courses
  prismY(a, [[cx - cw / 2, Z0 + ch1], [cx + cw / 2, Z0 + ch1], [cx + cw * 0.3, Z1 - 120], [cx - cw * 0.3, Z1 - 120]], cy - cd / 2, cy + cd / 2);   // top hopper
  a.box(cx - cw * 0.32, cy - cd * 0.32, Z1 - 120, cx + cw * 0.32, cy + cd * 0.32, Z1 - 60); a.cone(cx, cy, Z1 - 60, Z1, cw * 0.28, cw * 0.1, 12);   // fill dome
  // fan and burner on one side (+X), plenum duct
  const fz = Z0 + (ch0 + ch1) / 2;
  a.box(cx + cw / 2, cy - cd * 0.28, fz - 300, cx + cw / 2 + 280, cy + cd * 0.28, fz + 300);   // plenum duct
  a.xcyl(cx + cw / 2 + 280, cx + cw / 2 + 280 + (W / 2 - cw / 2 - 280) * 0.6, cy, fz, 270, 20);   // fan housing
  a.xcyl(cx + W / 2 - (W / 2 - cw / 2 - 280) * 0.35, cx + W / 2 - 10, cy, fz, 150, 14);   // burner
  a.box(cx + W / 2 - 160, cy - 100, fz + 150, cx + W / 2 - 20, cy + 100, fz + 330);   // control
  // unloading auger at the foot
  a.tube([[cx, cy, Z0 + ch0 - 150], [cx - cw * 0.9, cy - cd * 0.2, Z0 + 150]], [60, 60], 10);
  a.xcyl(cx - cw * 0.6, cx - cw * 0.9, cy - cd * 0.2, Z0 + 150, 80, 10);
  ladder(a, cx - cw * 0.25, cy - cd / 2 - 70, Z0 + 20, cy - cd / 2 - 70, Z1 - 200, 400, 20);
  a.box(cx - cw * 0.55, cy - cd / 2 - 160, Z1 - 240, cx + cw * 0.15, cy - cd / 2 + 10, Z1 - 220);   // platform at the top
  a.rect(cx - cw / 2, cy - cd / 2, cx + cw / 2, cy + cd / 2, 'EQUIP'); a.rect(cx + cw / 2, cy - cd * 0.28, cx + cw / 2 + 280, cy + cd * 0.28, 'EQUIP-DETAIL'); a.circ(cx + cw / 2 + 280 + (W / 2 - cw / 2 - 280) * 0.3, cy, 270, 'EQUIP-DETAIL');
  a.log('Added the legs and hopper foot, the perforated column with courses, the top hopper and fill dome, the plenum duct, fan housing and burner, the unloading auger, ladder and platform (plan and 3D).');
}
const dryers = fam({ cat: 'agriculture/irrigation', title: 'Generic tower grain dryer', desc: (v) => `Tower grain dryer, ${v.bu} bushel per hour class: perforated column, top hopper with fill dome, plenum duct with fan and burner, unloading auger, ladder and platform.`, build: dryer, vs: [
  ['300 bu per hour', 150, 90, 330, 0, { bu: 300 }], ['600 bu per hour', 190, 108, 420, 0, { bu: 600 }], ['1,200 bu per hour', 240, 130, 520, 0, { bu: '1,200' }] ] });

/** Optical grain sorter: a cabinet on legs with a feed hopper, chutes, an ejector bar, a touchscreen and a reject tray. */
function sorter(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, lh = H * 0.22;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * (W / 2 - 60) - 30, cy + sy * (D / 2 - 60) - 30, Z0, cx + sx * (W / 2 - 60) + 30, cy + sy * (D / 2 - 60) + 30, Z0 + lh);
  a.box(cx - W / 2 + 40, YF + 40, Z0 + lh - 30, cx + W / 2 - 40, YB - 40, Z0 + lh);   // frame
  a.box(X0 + 20, YF + 20, Z0 + lh, X1 - 20, YB - 20, Z0 + H * 0.68);   // cabinet
  a.box(X0 + 10, YF + 20, Z0 + H * 0.68, X1 - 10, YB - 20, Z0 + H * 0.7);
  a.box(X0 + 40, YF + 6, Z0 + lh + H * 0.12, X1 - 40, YF + 20, Z0 + H * 0.6);   // front door
  a.frame(X0 + 70, Z0 + lh + H * 0.2, X1 - 70, Z0 + H * 0.56, YF, YF + 8, 22);   // viewing window frame
  a.box(X0 + 85, YF + 3, Z0 + lh + H * 0.22, X1 - 85, YF + 8, Z0 + H * 0.54);   // glass
  a.box(cx + W * 0.2, YF - 28, Z0 + lh + H * 0.14, cx + W * 0.2 + 130, YF + 6, Z0 + lh + H * 0.14 + 90);   // touchscreen
  a.box(X0 + 90, YF - 6, Z0 + lh + H * 0.06, X0 + 160, YF + 6, Z0 + lh + H * 0.06 + 40);   // key switch
  // hopper above, with vibratory feeder
  prismY(a, [[X0 + 20, Z0 + H * 0.7], [X1 - 20, Z0 + H * 0.7], [X1 - W * 0.2, Z1 - 30], [X0 + W * 0.2, Z1 - 30]], YF + D * 0.2, YB - D * 0.2);
  a.box(X0 + W * 0.2 - 10, YF + D * 0.2 - 10, Z1 - 30, X1 - W * 0.2 + 10, YB - D * 0.2 + 10, Z1);
  a.box(cx - W * 0.2, YF + D * 0.15, Z0 + H * 0.7, cx + W * 0.2, YF + D * 0.2, Z0 + H * 0.76);   // feeder tray
  // product and reject outlets underneath
  a.cone(cx - W * 0.18, cy, Z0 + lh - 160, Z0 + lh, 50, 120, 12); a.cone(cx + W * 0.18, cy, Z0 + lh - 80, Z0 + lh, 40, 90, 12);
  a.box(cx + W * 0.1, cy - 80, Z0 + 10, cx + W * 0.26, cy + 80, Z0 + lh - 90);   // reject tray
  a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP'); a.rect(X0 + W * 0.2, YF + D * 0.2, X1 - W * 0.2, YB - D * 0.2, 'EQUIP-DETAIL'); a.circ(cx - W * 0.18, cy, 60, 'EQUIP-DETAIL'); a.circ(cx + W * 0.18, cy, 40, 'EQUIP-DETAIL');
  a.log('Added the four-leg frame, the cabinet with a window and a front door, the touchscreen and key switch, the feed hopper with a vibratory tray and the accept and reject outlets (plan and 3D).');
}
const sorters = fam({ cat: 'agriculture/irrigation', title: 'Generic optical grain sorter', desc: (v) => `Optical grain sorter with ${v.ch} channels: legged frame, cabinet with a viewing window, front door, touchscreen, sloped feed hopper with a vibratory tray, and accept and reject outlets.`, build: sorter, vs: [
  ['3 channel, small', 36, 30, 66, 0, { ch: 3 }], ['5 channel, large', 56, 38, 78, 0, { ch: 5 }] ] });

/** Drip filter station: a skid with two or three media filters, a manifold, valves with handles, pressure gauges and an outlet header. */
function filterStation(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, n = v.n, fw = (W - 100) / n, fr = fw * 0.36, pz = Z0 + 14 * IN * 0.4;
  a.box(X0 + 10, YF + 10, Z0, X1 - 10, YB - 10, Z0 + 40);
  for (let i = 0; i < n; i++) {
    const x = X0 + 50 + (i + 0.5) * fw, y = cy + D * 0.1;
    a.cyl(x, y, Z0 + 40, Z0 + H * 0.74, fr, 22); a.ell(x, y, Z0 + H * 0.74, fr, fr, fr * 0.5, 16, 5); a.cyl(x, y, Z0 + H * 0.74 + fr * 0.4, Z0 + H * 0.74 + fr * 0.6, fr * 0.3, 12);   // vessel and cap
    for (let k = 0; k < 3; k++) a.cyl(x, y, Z0 + 40 + k * (H * 0.74 - 40) / 3 - 2, Z0 + 40 + k * (H * 0.74 - 40) / 3 + 12, fr + 6, 22);
    a.cyl(x + fr * 0.0, y - fr - 0, Z0 + H * 0.15, Z0 + H * 0.15 + 4, 1, 3);
    a.ycyl(YF + 60, y - fr, x, Z0 + H * 0.12, 24, 10);   // inlet pipe to front manifold
    a.ycyl(y + fr, YB - 70, x, Z0 + H * 0.66, 24, 10);   // outlet pipe to rear header
    a.cyl(x, YF + 60, Z0 + H * 0.12, Z0 + H * 0.12 + H * 0.12, 22, 8); a.xcyl(x - 60, x + 60, YF + 60, Z0 + H * 0.12 + H * 0.12, 10, 6);   // valve stem with handle
    a.cyl(x + fr * 0.6, y - fr * 0.8, Z0 + H * 0.74, Z0 + H * 0.74 + 60, 10, 6); a.ell(x + fr * 0.6, y - fr * 0.8, Z0 + H * 0.74 + 90, 34, 14, 34, 10, 5);   // gauge
    a.circ(x, y, fr, 'EQUIP'); a.circ(x, y, fr * 0.3, 'EQUIP-DETAIL');
  }
  a.xcyl(X0 + 30, X1 - 30, YF + 60, Z0 + H * 0.12, 32, 12); a.xcyl(X0 + 30, X1 - 30, YB - 70, Z0 + H * 0.66, 32, 12);   // headers
  a.xcyl(X1 - 30, X1 - 8, YF + 60, Z0 + H * 0.12, 50, 12); a.xcyl(X0 + 8, X0 + 30, YB - 70, Z0 + H * 0.66, 50, 12);   // flanges
  a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP'); a.line(X0 + 30, YF + 60, X1 - 30, YF + 60, 'EQUIP-DETAIL'); a.line(X0 + 30, YB - 70, X1 - 30, YB - 70, 'EQUIP-DETAIL');
  a.log('Added the skid, ' + n + ' ringed media filter vessels with caps, the inlet and outlet headers with flanges, branch pipes, valves with handles and pressure gauges (plan and 3D).');
}
const filters = fam({ cat: 'agriculture/irrigation', title: 'Generic drip filter station', desc: (v) => `Drip irrigation filter station with ${v.n} media filter vessels on a skid: inlet and outlet headers, branch pipes, hand valves and pressure gauges.`, build: filterStation, vs: [
  ['2 filters, 2 in', 54, 30, 46, 0, { n: 2 }], ['3 filters, 3 in', 84, 36, 54, 0, { n: 3 }] ] });
export default [tractors, combines, sprayT, spraySP, balerR, balerS, drills, trailers, ploughs, harrows, barns, silos, towers, bins, greenhouses, hay, msheds, clamps, rings_, troughs, crushes, parlours, gates, coops, hutches, calfs, stalls, pens, pivots, pumps, tanksP, sprinklers, guns, reels, dryers, sorters, filters];

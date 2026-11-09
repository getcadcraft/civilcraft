/* SPDX-License-Identifier: Apache-2.0 */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = m.PI;
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
/** a vertical ring of N boxes' worth of wall: a closed ring of quads between radii ri and ro, N segments, z0..z1 */
function ringWall(a, cx, cy, ri, ro, z0, z1, n = 24) {
  for (let i = 0; i < n; i++) {
    const t0 = (i / n) * 2 * PI, t1 = ((i + 1) / n) * 2 * PI, c0 = m.cos(t0), s0 = m.sin(t0), c1 = m.cos(t1), s1 = m.sin(t1);
    a.prism([[cx + ri * c0, cy + ri * s0], [cx + ro * c0, cy + ro * s0], [cx + ro * c1, cy + ro * s1], [cx + ri * c1, cy + ri * s1]], z0, z1);
  }
}
/** a tilted slab: thin parallelogram in the X-Z plane from (xa,za) to (xb,zb), thickness t, between y0 and y1 */
function slabXZ(a, xa, za, xb, zb, t, y0, y1) { prismY(a, [[xa, za], [xb, zb], [xb, zb + t], [xa, za + t]], y0, y1); }
const FT = 12 * IN;

// ============================================================================================ machinery
/** Trailed tine cultivator: A-frame headstock, two staggered toolbars of curved tines with shares, depth wheels and a rear crumbler roller. */
function cultivator(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, zb = Z0 + H * 0.62, n = v.n, y1 = YF + D * 0.46, y2 = YF + D * 0.62;
  for (const y of [y1, y2]) a.box(X0 + 90, y - 40, zb - 40, X1 - 90, y + 40, zb + 40);
  a.tube([[X0 + W * 0.12, y1, zb + 40], [cx, YF + 30, zb + H * 0.2], [X1 - W * 0.12, y1, zb + 40]], [28, 34, 28], 8);
  a.tube([[cx, YF + 30, zb + H * 0.2], [cx, YF + D * 0.1, zb]], [30, 30], 8);
  a.box(cx - 50, YF, zb + H * 0.12, cx + 50, YF + 60, zb + H * 0.28);
  a.tube([[cx, y1, zb + 40], [cx, y2, zb + 40]], [24, 24], 6);
  for (let i = 0; i < n; i++) {
    const x = X0 + 130 + (W - 260) * i / (n - 1), y = i % 2 ? y2 : y1, zt = zb - 40, zh = Z0 + 60;
    a.tube([[x, y, zt], [x, y + 20, zt - (zt - zh) * 0.45], [x, y + 90, zh + 30], [x, y + 140, zh]], [20, 18, 16, 12], 6);
    a.box(x - 30, y + 90, Z0, x + 30, y + 190, Z0 + 55);
    a.line(x, y, x, y + 140, 'EQUIP-DETAIL');
  }
  const ry = YB - 190, rr = 190;
  a.xcyl(X0 + 120, X1 - 120, ry, Z0 + rr, rr, 20);
  for (let i = 1; i < 12; i++) { const x = X0 + 120 + (W - 240) * i / 12; a.xcyl(x - 8, x + 8, ry, Z0 + rr, rr + 14, 20); }
  for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 100); a.box(x - 18, ry - 20, Z0 + rr - 20, x + 18, y2 + 30, Z0 + rr + 60); a.tube([[x, y2, zb], [x, y2 + 30, Z0 + rr]], [24, 20], 6); }
  for (const s of [-1, 1]) tyre(a, cx + s * (W / 2 - 160), y1 - 160, 210, 190, 0);
  a.rect(X0 + 90, y1 - 40, X1 - 90, y1 + 40, 'EQUIP-DETAIL'); a.rect(X0 + 90, y2 - 40, X1 - 90, y2 + 40, 'EQUIP-DETAIL'); a.rect(X0 + 120, ry - rr, X1 - 120, ry + rr, 'EQUIP-DETAIL');
  a.line(X0 + W * 0.12, y1, cx, YF + 30, 'EQUIP-DETAIL'); a.line(X1 - W * 0.12, y1, cx, YF + 30, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the A-frame headstock, two staggered toolbars, ' + n + ' curved tines with shares, two depth wheels and the rear crumbler roller (plan and 3D).');
}
const cultivators = fam({ cat: 'agriculture/machinery', title: 'Generic trailed tine cultivator', desc: (v) => `Trailed cultivator, ${v.ft} ft: A-frame headstock, two staggered toolbars carrying ${v.n} curved tines with shares, depth wheels and a rear crumbler roller.`, build: cultivator, vs: [
  ['8 ft, 7 tines', 100, 104, 46, 0, { ft: 8, n: 7 }], ['12 ft, 11 tines', 148, 108, 48, 0, { ft: 12, n: 11 }], ['16 ft, 15 tines', 196, 112, 50, 0, { ft: 16, n: 15 }], ['20 ft, 19 tines', 244, 116, 52, 0, { ft: 20, n: 19 }] ] });

/** Mounted power harrow: a row of vertical rotors with tines on a gearbox beam, side plates, a rear packer roller, top link and drive shaft. */
function powerHarrow(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, n = v.n, sp = (W - 240) / n, gy = YF + D * 0.45, zg = Z0 + H * 0.5;
  a.box(X0 + 60, gy - 130, zg - 70, X1 - 60, gy + 130, zg + 70);
  a.box(cx - 190, gy - 150, zg + 70, cx + 190, gy + 150, zg + 240);
  for (let i = 0; i < n; i++) {
    const x = X0 + 120 + sp * (i + 0.5);
    a.cyl(x, gy, Z0 + H * 0.2, zg - 70, 26, 8);
    a.cyl(x, gy, Z0 + H * 0.2 - 10, Z0 + H * 0.2 + 12, sp * 0.45, 14);
    for (const s of [-1, 1]) a.box(x + s * sp * 0.38 - 18, gy - 24, Z0 + 14, x + s * sp * 0.38 + 18, gy + 24, Z0 + H * 0.2);
    a.circ(x, gy, sp * 0.45, 'EQUIP-DETAIL');
  }
  for (const s of [-1, 1]) { a.box(cx + s * (W / 2 - 60) - 18, gy - 190, Z0 + 30, cx + s * (W / 2 - 60) + 18, YB - 60, zg + 120); }
  const ry = YB - 130; a.xcyl(X0 + 90, X1 - 90, ry, Z0 + 130, 130, 18); for (let i = 1; i < 14; i++) { const x = X0 + 90 + (W - 180) * i / 14; a.xcyl(x - 7, x + 7, ry, Z0 + 130, 142, 18); }
  a.tube([[cx - 110, gy + 150, zg + 230], [cx - 110, YF + 30, zg + H * 0.1], [cx, YF + 20, zg + H * 0.1]], [24, 24, 24], 6); a.tube([[cx + 110, gy + 150, zg + 230], [cx + 110, YF + 30, zg + H * 0.1]], [24, 24], 6);
  a.tube([[cx, gy, zg + 240], [cx, YF + 40, zg + H * 0.38]], [40, 40], 8); a.tube([[cx, YF + 5, zg + H * 0.12], [cx, YF + 100, zg + H * 0.12]], [18, 18], 6);
  a.tube([[cx, gy + 10, zg + 240], [cx, gy - 5, zg + H * 0.42], [cx, YF + 20, zg + H * 0.22]], [16, 20, 16], 6);
  a.rect(X0 + 60, gy - 130, X1 - 60, gy + 130, 'EQUIP-DETAIL'); a.rect(X0 + 90, ry - 130, X1 - 90, ry + 130, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the gearbox beam, ' + n + ' vertical rotors with tines, side plates, the rear packer roller, top link and drive shaft (plan and 3D).');
}
const harrowsP = fam({ cat: 'agriculture/machinery', title: 'Generic mounted power harrow', desc: (v) => `Mounted power harrow, ${v.ft} ft: a gearbox beam carrying ${v.n} vertical rotors with tines, side plates, a rear packer roller, top link and drive shaft.`, build: powerHarrow, vs: [
  ['6 ft, 6 rotors', 76, 62, 36, 0, { ft: 6, n: 6 }], ['8 ft, 8 rotors', 100, 62, 38, 0, { ft: 8, n: 8 }], ['10 ft, 10 rotors', 124, 64, 38, 0, { ft: 10, n: 10 }], ['13 ft, 12 rotors', 156, 66, 40, 0, { ft: 13, n: 12 }] ] });

/** Rear-mounted flail or rotary mower: deck, skids, rear roller, belt guard, gearbox, A-frame headstock and a rear chain curtain. */
function mower(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, dz = Z0 + H * 0.5, dy0 = YF + D * 0.32;
  a.box(X0 + 20, dy0, Z0 + 110, X1 - 20, YB - 90, dz);
  prismY(a, [[X0 + 20, dz], [X1 - 20, dz], [X1 - 70, dz + 80], [X0 + 70, dz + 80]], dy0, YB - 90);
  a.box(X0 + 20, dy0 - 30, dz - 40, X1 - 20, dy0, dz + 60);
  for (const s of [-1, 1]) a.box(cx + s * (W / 2 - 60) - 14, dy0 + 20, Z0 + 20, cx + s * (W / 2 - 60) + 14, YB - 120, Z0 + 125);   // skids
  a.xcyl(X0 + 20, X1 - 20, YB - 60, Z0 + 110, 110, 16);
  for (let i = 0; i <= v.fl; i++) { const x = X0 + 60 + (W - 120) * i / v.fl; a.box(x - 22, dy0 - 20, Z0 + 20, x + 22, dy0 - 4, Z0 + 150); }   // front flaps
  a.box(cx - 220, dy0 + 40, dz + 80, cx + 220, dy0 + 230, dz + 330);   // gearbox / belt guard
  a.box(X1 - 260, dy0 + 60, dz + 80, X1 - 30, dy0 + 220, dz + 220);
  a.tube([[X0 + W * 0.15, dy0 + 120, dz + 80], [cx, YF + 30, dz + H * 0.35], [X1 - W * 0.15, dy0 + 120, dz + 80]], [26, 32, 26], 8);
  a.tube([[cx, dy0 + 200, dz + 330], [cx, YF + 30, dz + H * 0.35]], [28, 28], 8); a.tube([[cx, YF + 25, dz + H * 0.3], [cx, YF + 200, dz + H * 0.2]], [18, 18], 6);
  a.box(cx - 60, YF, dz + H * 0.26, cx + 60, YF + 60, dz + H * 0.4);
  a.rect(X0 + 20, dy0, X1 - 20, YB - 90, 'EQUIP'); a.rect(cx - 220, dy0 + 40, cx + 220, dy0 + 230, 'EQUIP-DETAIL'); a.xcyl(X0 + 20, X1 - 20, YB - 60, Z0 + 110, 110, 4);
  a.line(X0 + W * 0.15, dy0 + 120, cx, YF + 30, 'EQUIP-DETAIL'); a.line(X1 - W * 0.15, dy0 + 120, cx, YF + 30, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the cutting deck with a raised belt guard and gearbox, skids, front flaps, the rear roller and the A-frame headstock (plan and 3D).');
}
const mowers = fam({ cat: 'agriculture/machinery', title: 'Generic rear-mounted flail mower', desc: (v) => `Rear-mounted flail mower, ${v.ft} ft cut: cutting deck with front flaps, skids, rear roller, belt guard with gearbox and an A-frame headstock with top mast.`, build: mower, vs: [
  ['5 ft cut', 68, 52, 34, 0, { ft: 5, fl: 6 }], ['6.5 ft cut', 86, 54, 34, 0, { ft: 6.5, fl: 8 }], ['8 ft cut', 106, 56, 36, 0, { ft: 8, fl: 10 }], ['10 ft cut', 128, 58, 36, 0, { ft: 10, fl: 12 }] ] });

/** Box manure spreader: ribbed box on a chassis with beater drums at the rear, tandem or single axle, drawbar and a front headboard. */
function manure(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, rr = v.rr * IN, gx = W / 2 - 110, by0 = YF + D * 0.2, bz0 = Z0 + H * 0.32, bz1 = Z0 + H * 0.78, wt = 30;
  const axy = v.ax === 2 ? [YB - D * 0.4, YB - D * 0.2] : [YB - D * 0.28];
  for (const y of axy) for (const s of [-1, 1]) tyre(a, cx + s * gx, y, rr, 280, 14);
  for (const y of axy) a.xcyl(cx - gx, cx + gx, y, Z0 + rr, 40, 8);
  for (const s of [-1, 1]) a.box(cx + s * (W / 2 - 280) - 30, by0, bz0 - 90, cx + s * (W / 2 - 280) + 30, YB - 30, bz0);
  a.box(X0 + 110, by0, bz0, X1 - 110, YB - 30, bz0 + 40);
  for (const s of [-1, 1]) { const x = s < 0 ? X0 + 110 : X1 - 110 - wt; a.box(x, by0, bz0, x + wt, YB - 30, bz1); for (let i = 1; i < 6; i++) { const y = by0 + (YB - 30 - by0) * i / 6; a.box(s < 0 ? x - 14 : x + wt, y - 12, bz0 + 20, s < 0 ? x : x + wt + 14, y + 12, bz1); } a.box(s < 0 ? x - 14 : x, by0, bz1 - 10, s < 0 ? x + wt : x + wt + 14, YB - 30, bz1 + 20); }
  a.box(X0 + 110, by0, bz0, X1 - 110, by0 + wt, bz1 + H * 0.1);
  a.box(X0 + 110, YB - 30 - wt, bz0, X1 - 110, YB - 30, bz1 - 120);
  for (const z of [bz1 - 40, bz0 + 200]) for (const k of [0, 1]) a.xcyl(X0 + 140, X1 - 140, YB - 60 - k * 0, z - k * 130 + 130, 60, 12);
  for (let k = 0; k < 7; k++) { const x = X0 + 180 + (W - 360) * k / 6; for (const z of [bz1 - 40, bz0 + 330]) a.box(x - 18, YB - 120, z - 80, x + 18, YB - 34, z + 80); }
  a.tube([[cx - 160, by0, bz0 - 60], [cx, YF + 40, bz0 - 90], [cx + 160, by0, bz0 - 60]], [30, 36, 30], 8); a.box(cx - 40, YF, bz0 - 140, cx + 40, YF + 70, bz0 - 60);
  a.rect(X0 + 110, by0, X1 - 110, YB - 30, 'EQUIP'); a.line(X0 + 140, YB - 60, X1 - 140, YB - 60, 'EQUIP-DETAIL'); a.line(cx - 160, by0, cx, YF + 40, 'EQUIP-DETAIL'); a.line(cx + 160, by0, cx, YF + 40, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the ribbed spreader box with headboard, rear panel and two beater drums with paddles, ' + (v.ax === 2 ? 'tandem' : 'single') + ' axle with tyres and the drawbar (plan and 3D).');
}
const manures = fam({ cat: 'agriculture/machinery', title: 'Generic box manure spreader', desc: (v) => `Rear-beater manure spreader, ${v.cy} cubic yard class: ribbed box with a headboard, two beater drums with paddles, ${v.ax === 2 ? 'tandem' : 'single'} axle with tyres and a drawbar.`, build: manure, vs: [
  ['4 cubic yard, single axle', 84, 150, 62, 0, { cy: 4, ax: 1, rr: 17 }], ['6 cubic yard, single axle', 92, 170, 66, 0, { cy: 6, ax: 1, rr: 19 }], ['9 cubic yard, tandem', 98, 204, 72, 0, { cy: 9, ax: 2, rr: 19 }], ['14 cubic yard, tandem', 108, 240, 80, 0, { cy: 14, ax: 2, rr: 22 }] ] });

/** Slurry tanker: a horizontal barrel with domed ends and rings on a chassis, with a top manway, a rear valve and pipe, ladder, drawbar and wheels. */
function slurry(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, rr = v.rr * IN, rt = m.min(W * 0.4, H * 0.3), zc = Z0 + H - rt - 40, y0 = YF + D * 0.2, y1 = YB - 30;
  a.ycyl(y0 + rt * 0.5, y1 - rt * 0.5, cx, zc, rt, 26); a.ell(cx, y0 + rt * 0.5, zc, rt * 0.62, rt * 0.55, rt, 18, 10); a.ell(cx, y1 - rt * 0.5, zc, rt * 0.62, rt * 0.55, rt, 18, 10);
  for (let i = 1; i < v.rings; i++) { const y = y0 + (y1 - y0) * i / v.rings; a.ycyl(y - 10, y + 10, cx, zc, rt + 12, 26); }
  a.cyl(cx, (y0 + y1) / 2, zc + rt - 10, zc + rt + 70, 150, 16); a.cyl(cx, (y0 + y1) / 2, zc + rt + 70, zc + rt + 90, 165, 16);
  a.cyl(cx, y0 + (y1 - y0) * 0.2, zc + rt - 10, zc + rt + 50, 60, 10); a.tube([[cx, y1 - rt * 0.4, zc - rt * 0.3], [cx, y1 + 0, zc - rt * 0.6]], [75, 75], 10);
  for (const s of [-1, 1]) a.box(cx + s * rt * 0.55 - 40, y0, zc - rt - 90, cx + s * rt * 0.55 + 40, y1, zc - rt * 0.7);   // chassis rails
  const axy = v.ax === 2 ? [YB - D * 0.34, YB - D * 0.16] : [YB - D * 0.25], gx = W / 2 - 150;
  for (const y of axy) { for (const s of [-1, 1]) tyre(a, cx + s * gx, y, rr, 300, 14); a.xcyl(cx - gx, cx + gx, y, Z0 + rr, 40, 8); for (const s of [-1, 1]) a.box(cx + s * gx - 160, y - rr * 0.9, Z0 + rr * 2 + 30, cx + s * gx + 160, y + rr * 0.9, Z0 + rr * 2 + 52); }
  a.tube([[cx - 200, y0, zc - rt - 40], [cx, YF + 40, zc - rt * 0.6], [cx + 200, y0, zc - rt - 40]], [34, 40, 34], 8);
  ladder(a, cx + rt * 0.6, y1 - 120, Z0 + rr * 2 + 80, y1 - 120, zc + rt * 0.5, 300, 4);
  a.rect(cx - rt, y0 + rt * 0.5, cx + rt, y1 - rt * 0.5, 'EQUIP'); a.ellp(cx, (y0 + y1) / 2, 150, 150, 'EQUIP-DETAIL'); a.line(cx - 200, y0, cx, YF + 40, 'EQUIP-DETAIL'); a.line(cx + 200, y0, cx, YF + 40, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the barrel with domed ends and rings, top manway and filler, rear valve and pipe, chassis rails, ' + (v.ax === 2 ? 'tandem' : 'single') + ' axle with tyres and mudguards, ladder and drawbar (plan and 3D).');
}
const slurries = fam({ cat: 'agriculture/machinery', title: 'Generic slurry tanker', desc: (v) => `Trailed slurry tanker, ${v.gal} gallon: horizontal barrel with domed ends and rings, top manway, rear valve, ${v.ax === 2 ? 'tandem' : 'single'} axle with tyres and mudguards, ladder and drawbar.`, build: slurry, vs: [
  ['1,500 gallon, single axle', 86, 190, 100, 0, { gal: 1500, ax: 1, rr: 21, rings: 4 }], ['2,500 gallon, single axle', 94, 216, 108, 0, { gal: 2500, ax: 1, rr: 24, rings: 5 }], ['3,500 gallon, tandem', 100, 250, 114, 0, { gal: 3500, ax: 2, rr: 24, rings: 6 }], ['4,500 gallon, tandem', 106, 288, 120, 0, { gal: 4500, ax: 2, rr: 26, rings: 7 }] ] });

/** Grain cart: a sloping-sided hopper on a chassis with a big pair of tyres, a corner auger and a folded unloading tube, ladder and drawbar. */
function grainCart(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, rr = v.rr * IN, ty = YF + D * 0.58, hy0 = YF + D * 0.2, hy1 = YB - 30, hz0 = Z0 + H * 0.3, hz1 = Z0 + H * 0.78, gx = W / 2 - 220;
  for (const s of [-1, 1]) tyre(a, cx + s * gx, ty, rr, 380, 18); a.xcyl(cx - gx, cx + gx, ty, Z0 + rr, 60, 8);
  prismY(a, [[cx - W * 0.46, hz1], [cx + W * 0.46, hz1], [cx + W * 0.1, hz0], [cx - W * 0.1, hz0]], hy0, hy1);
  prismY(a, [[cx - W * 0.46, hz1], [cx + W * 0.46, hz1], [cx + W * 0.46, hz1 + 120], [cx - W * 0.46, hz1 + 120]], hy0, hy1);
  a.box(cx - W * 0.46, hy0, hz1, cx + W * 0.46, hy0 + 40, hz1 + H * 0.12); a.box(cx - W * 0.46, hy1 - 40, hz1, cx + W * 0.46, hy1, hz1 + H * 0.12);
  for (const s of [-1, 1]) a.box(cx + s * W * 0.2 - 60, hy0 + 10, hz0 - 80, cx + s * W * 0.2 + 60, hy1 - 10, hz0 + 20);
  a.box(cx - 200, hy0 + 40, hz0 - 60, cx + 200, hy1 - 40, hz0 + 10);
  const sx = cx + W * 0.34;
  a.tube([[sx, hy0 + 80, hz0 + 10], [sx, hy0 - 10, hz1 + H * 0.02], [sx + W * 0.04, YF + 12, hz1 + H * 0.24]], [90, 90, 70], 10);
  a.cone(sx + W * 0.04, YF + 12, hz1 + H * 0.2, hz1 + H * 0.3, 70, 90, 10);
  a.tube([[cx - 220, hy0, hz0 - 40], [cx, YF + 40, hz0 - 70], [cx + 220, hy0, hz0 - 40]], [40, 48, 40], 8); a.box(cx - 50, YF, hz0 - 130, cx + 50, YF + 80, hz0 - 40);
  ladder(a, cx - W * 0.3, hy1 + 0, Z0 + rr * 1.6, hy1 - 10, hz1 + 80, 380, 5);
  for (const s of [-1, 1]) a.box(cx + s * gx - 220, ty - rr * 0.9, Z0 + rr * 2 + 20, cx + s * gx + 220, ty + rr * 0.9, Z0 + rr * 2 + 44);
  a.rect(cx - W * 0.46, hy0, cx + W * 0.46, hy1, 'EQUIP'); a.circ(sx + W * 0.04, YF + 12, 80, 'EQUIP-DETAIL'); a.line(sx, hy0 + 80, sx + W * 0.04, YF + 12, 'EQUIP-DETAIL'); a.line(cx - 220, hy0, cx, YF + 40, 'EQUIP-DETAIL'); a.line(cx + 220, hy0, cx, YF + 40, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the sloping hopper with end boards, floor augers, the corner auger and folded unloading tube, a big tyre pair, ladder and drawbar (plan and 3D).');
}
const carts = fam({ cat: 'agriculture/machinery', title: 'Generic grain cart', desc: (v) => `Grain cart, ${v.bu} bushel class: sloping hopper with end boards, floor augers, a corner auger and folded unloading tube, a pair of large tyres, ladder and drawbar.`, build: grainCart, vs: [
  ['600 bushel', 118, 200, 124, 0, { bu: 600, rr: 26 }], ['850 bushel', 130, 224, 136, 0, { bu: 850, rr: 29 }], ['1,100 bushel', 144, 244, 146, 0, { bu: 1100, rr: 31 }], ['1,500 bushel', 156, 270, 156, 0, { bu: 1500, rr: 34 }] ] });

/** Front loader attachment: bucket with teeth (or pallet forks with a backrest), lift arms, cross tube, mounting uprights and tilt and lift cylinders. */
function loader(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, bw = W - 240;
  if (v.fork) {
    for (const s of [-1, 1]) { const x = cx + s * bw * 0.28; a.box(x - 60, YF, Z0, x + 60, YF + D * 0.55, Z0 + 45); prismX(a, [[YF + D * 0.55, Z0], [YF + D * 0.6, Z0], [YF + D * 0.6, Z0 + H * 0.5], [YF + D * 0.55, Z0 + H * 0.5]], x - 60, x + 60); }
    a.box(cx - bw / 2, YF + D * 0.56, Z0 + 20, cx + bw / 2, YF + D * 0.6, Z0 + 110);
    for (let i = 0; i < 6; i++) { const x = cx - bw / 2 + 20 + (bw - 40) * i / 5; a.tube([[x, YF + D * 0.58, Z0 + 110], [x, YF + D * 0.58, Z0 + H * 0.9]], [16, 16], 6); }
    for (const z of [Z0 + H * 0.4, Z0 + H * 0.9]) a.tube([[cx - bw / 2, YF + D * 0.58, z], [cx + bw / 2, YF + D * 0.58, z]], [20, 20], 6);
    for (const s of [-1, 1]) a.rect(cx + s * bw * 0.28 - 60, YF, cx + s * bw * 0.28 + 60, YF + D * 0.55, 'EQUIP-DETAIL');
  } else {
    const by0 = YF + 20, by1 = YF + D * 0.5, bz1 = Z0 + H * 0.52;
    prismX(a, [[by0, Z0 + 60], [by1 * 0.2 + by0 * 0.8 + 70, Z0], [by1, Z0 + 30], [by1, bz1], [by0 + 30, bz1 - 60]], cx - bw / 2, cx + bw / 2);
    a.box(cx - bw / 2, by1 - 30, Z0 + 30, cx + bw / 2, by1, bz1 + 90);
    for (const s of [-1, 1]) prismX(a, [[by0, Z0 + 60], [by1, Z0 + 30], [by1, bz1 + 20], [by0 + 30, bz1 - 40]], cx + s * bw / 2 - (s > 0 ? 24 : 0), cx + s * bw / 2 + (s > 0 ? 0 : 24));
    for (let i = 0; i <= v.teeth; i++) { const x = cx - bw / 2 + 30 + (bw - 60) * i / v.teeth; prismX(a, [[by0 - 90, Z0 + 56], [by0 + 20, Z0 + 80], [by0 + 20, Z0 + 30]], x - 22, x + 22); }
    a.rect(cx - bw / 2, by0, cx + bw / 2, by1, 'EQUIP-DETAIL');
  }
  const ay = YF + D * 0.62, az = Z0 + H * 0.62;
  for (const s of [-1, 1]) {
    const x = cx + s * (bw / 2 + 40);
    a.tube([[x, YF + D * (v.fork ? 0.58 : 0.46), Z0 + H * 0.34], [x, ay, az], [x, YB - 40, Z0 + H * 0.82]], [32, 36, 36], 8);
    a.tube([[x, YB - 40, Z0 + H * 0.82], [x, YB - 30, Z0 + 60]], [48, 48], 8);
    const xi = cx + s * (bw * 0.26);
    a.tube([[xi, YF + D * 0.52, Z0 + H * 0.4], [xi, ay + 60, az + H * 0.1]], [30, 30], 8);
  }
  a.tube([[cx - bw / 2 - 40, ay, az], [cx + bw / 2 + 40, ay, az]], [38, 38], 8);
  a.box(cx - bw / 2 - 60, YB - 90, Z0, cx + bw / 2 + 60, YB - 10, Z0 + 70);
  a.rect(cx - bw / 2 - 40, ay - 20, cx + bw / 2 + 40, ay + 20, 'EQUIP-DETAIL'); a.rect(cx - bw / 2 - 60, YB - 90, cx + bw / 2 + 60, YB - 10, 'EQUIP'); a.outline();
  a.log('Added ' + (v.fork ? 'two forks with a gridded backrest' : 'the ' + 'bucket with side plates and ' + (v.teeth + 1) + ' teeth') + ', lift arms, cross tube, mounting uprights and the tilt and lift cylinders (plan and 3D).');
}
const loaders = fam({ cat: 'agriculture/machinery', title: 'Generic tractor front loader attachment', desc: (v) => v.fork ? 'Tractor front loader fitted with pallet forks: two forks and a gridded backrest on lift arms with cross tube, uprights and cylinders.' : `Tractor front loader with a ${v.ft} ft bucket: bucket with side plates and teeth on lift arms with cross tube, uprights and cylinders.`, build: loader, vs: [
  ['5 ft bucket', 70, 86, 56, 0, { ft: 5, teeth: 4 }], ['6 ft bucket', 82, 90, 58, 0, { ft: 6, teeth: 5 }], ['7 ft bucket', 94, 94, 60, 0, { ft: 7, teeth: 6 }], ['pallet forks, 4 ft', 70, 90, 62, 0, { fork: true }] ] });

/** Bale carrier trailer: a flat deck on a chassis with stanchions and a tailgate rail, tandem axle, mudguards, and round bales lying across the deck. */
function baleTrailer(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, rr = v.rr * IN, dz = Z0 + H * 0.3, gx = W / 2 - 100, ays = v.ax === 2 ? [YB - D * 0.3, YB - D * 0.15] : [YB - D * 0.22];
  for (const y of ays) { for (const s of [-1, 1]) tyre(a, cx + s * gx, y, rr, 260, 14); a.xcyl(cx - gx, cx + gx, y, Z0 + rr, 36, 8); for (const s of [-1, 1]) a.box(cx + s * gx - 150, y - rr * 0.9, Z0 + rr * 2 + 24, cx + s * gx + 150, y + rr * 0.9, Z0 + rr * 2 + 44); }
  for (const s of [-1, 1]) a.box(cx + s * (W / 2 - 200) - 40, YF + D * 0.18, dz - 100, cx + s * (W / 2 - 200) + 40, YB - 20, dz);
  a.box(X0 + 80, YF + D * 0.18, dz, X1 - 80, YB - 20, dz + 40);
  for (let i = 0; i < 5; i++) { const y = YF + D * 0.2 + (YB - 20 - YF - D * 0.2) * i / 4; a.box(X0 + 80, y - 30, dz - 70, X1 - 80, y + 30, dz); }
  a.tube([[cx - 150, YF + D * 0.18, dz - 40], [cx, YF + 40, dz - 80], [cx + 150, YF + D * 0.18, dz - 40]], [34, 38, 34], 8); a.box(cx - 40, YF, dz - 140, cx + 40, YF + 70, dz - 60);
  const br = v.bd * IN / 2, bl = v.bd * IN, per = v.n / 2, y00 = YF + D * 0.18 + 40;
  for (const sx of [-1, 1]) for (let k = 0; k < per; k++) {
    const ya = y00 + k * (bl + 10), xc = cx + sx * (br + 6);
    a.ycyl(ya, ya + bl, xc, dz + 40 + br, br, 22);
    a.circ(xc, ya + bl / 2, br * 0.5, 'EQUIP-HIDDEN'); a.rect(xc - br, ya, xc + br, ya + bl, 'EQUIP-DETAIL');
  }
  for (const s of [-1, 1]) for (const y of [YF + D * 0.22, YF + D * 0.5, YB - 40]) a.tube([[cx + s * (W / 2 - 90), y, dz + 40], [cx + s * (W / 2 - 90), y, Z0 + H * 0.95]], [24, 24], 6);
  a.tube([[X0 + 90, YB - 22, Z0 + H * 0.7], [X1 - 90, YB - 22, Z0 + H * 0.7]], [18, 18], 6);
  a.rect(X0 + 80, YF + D * 0.18, X1 - 80, YB - 20, 'EQUIP'); a.line(cx - 150, YF + D * 0.18, cx, YF + 40, 'EQUIP-DETAIL'); a.line(cx + 150, YF + D * 0.18, cx, YF + 40, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the chassis and flat deck, drawbar, ' + (v.ax === 2 ? 'tandem' : 'single') + ' axle with tyres and mudguards, side stanchions, a tail rail and ' + v.n + ' round bales (plan and 3D).');
}
const baleTrailers = fam({ cat: 'agriculture/machinery', title: 'Generic bale carrier trailer', desc: (v) => `Bale carrier trailer for ${v.n} round bales of ${v.bd} in diameter: flat deck on a chassis with drawbar, ${v.ax === 2 ? 'tandem' : 'single'} axle, mudguards, side stanchions and a tail rail.`, build: baleTrailer, vs: [
  ['4 bales, single axle', 100, 200, 78, 0, { n: 4, bd: 48, ax: 1, rr: 17 }], ['6 bales, single axle', 100, 276, 90, 0, { n: 6, bd: 48, ax: 1, rr: 18 }], ['8 bales, tandem', 104, 330, 94, 0, { n: 8, bd: 48, ax: 2, rr: 18 }], ['10 bales, tandem', 108, 400, 98, 0, { n: 10, bd: 48, ax: 2, rr: 19 }] ] });

/** Farm quad bike or side-by-side utility vehicle: four tyres, body panels, seat, bars, racks; the side-by-side adds a roll cage, bench, dash and a cargo bed. */
function utility(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, rr = v.rr * IN, gx = W / 2 - v.tw * IN / 2 - 4, fy = YF + D * 0.2, ry = YB - D * 0.2, tw = v.tw * IN;
  for (const y of [fy, ry]) for (const s of [-1, 1]) tyre(a, cx + s * gx, y, rr, tw, 12);
  a.xcyl(cx - gx, cx + gx, fy, Z0 + rr, rr * 0.12, 8); a.xcyl(cx - gx, cx + gx, ry, Z0 + rr, rr * 0.12, 8);
  const bw = W * (v.sbs ? 0.56 : 0.3), bz = Z0 + rr * 1.35;
  a.box(cx - bw / 2, fy - 100, bz, cx + bw / 2, ry + 100, bz + 60);
  prismX(a, [[YF + 10, bz + 20], [fy + 160, bz + 20], [fy + 160, bz + H * 0.25], [YF + 40, bz + H * 0.2]], cx - bw * 0.52, cx + bw * 0.52);
  for (const s of [-1, 1]) prismX(a, [[fy - rr * 1.1, Z0 + rr * 1.9], [fy + rr * 1.1, Z0 + rr * 1.9], [fy + rr * 0.8, Z0 + rr * 2.1], [fy - rr * 0.8, Z0 + rr * 2.1]], cx + s * gx - tw * 0.55, cx + s * gx + tw * 0.55);
  for (const s of [-1, 1]) prismX(a, [[ry - rr * 1.1, Z0 + rr * 1.9], [ry + rr * 1.1, Z0 + rr * 1.9], [ry + rr * 0.8, Z0 + rr * 2.1], [ry - rr * 0.8, Z0 + rr * 2.1]], cx + s * gx - tw * 0.55, cx + s * gx + tw * 0.55);
  if (!v.sbs) {
    a.box(cx - bw * 0.4, fy + 200, bz + 60, cx + bw * 0.4, fy + 520, bz + 150);
    a.box(cx - bw * 0.36, fy + 560, bz + 60, cx + bw * 0.36, ry - 80, bz + 190);
    a.box(cx - 60, fy + 150, bz + 60, cx + 60, fy + 560, bz + 340);
    a.tube([[cx, fy + 360, bz + 340], [cx, fy + 330, bz + 520]], [26, 26], 6); a.xcyl(cx - 330, cx + 330, fy + 320, bz + 540, 14, 8);
    for (const s of [-1, 1]) a.box(cx + s * 80 - 40, YF + 4, bz + H * 0.14, cx + s * 80 + 40, YF + 30, bz + H * 0.24);
    for (const y0 of [YF + 30, ry + 60]) { for (const x of [-1, 1]) a.tube([[cx + x * bw * 0.4, y0, bz + 160], [cx + x * bw * 0.4, y0 + 240, bz + 160]], [14, 14], 5); for (let i = 0; i < 4; i++) a.tube([[cx - bw * 0.4, y0 + i * 70, bz + 160], [cx + bw * 0.4, y0 + i * 70, bz + 160]], [10, 10], 4); }
    a.rect(cx - bw * 0.4, YF + 30, cx + bw * 0.4, YF + 270, 'EQUIP-DETAIL'); a.rect(cx - bw * 0.4, ry + 60, cx + bw * 0.4, ry + 300, 'EQUIP-DETAIL');
  } else {
    const cz = Z0 + H, seatY = fy + 340, cd = ry - fy - 420;
    a.box(cx - bw / 2, fy + 80, bz + 60, cx + bw / 2, fy + 300, bz + H * 0.18);
    for (const row of v.rows === 2 ? [0, 1] : [0]) { const y = seatY + row * 560; a.box(cx - bw * 0.46, y, bz + 60, cx + bw * 0.46, y + 380, bz + 160); a.box(cx - bw * 0.46, y + 340, bz + 160, cx + bw * 0.46, y + 380, bz + 420); }
    for (const s of [-1, 1]) for (const y of [fy + 160, seatY + (v.rows === 2 ? 940 : 380)]) a.tube([[cx + s * bw * 0.48, y, bz + 60], [cx + s * bw * 0.48, y, cz - 30]], [26, 26], 6);
    for (const s of [-1, 1]) a.tube([[cx + s * bw * 0.48, fy + 160, cz - 30], [cx + s * bw * 0.48, seatY + (v.rows === 2 ? 940 : 380), cz - 30]], [26, 26], 6);
    for (const y of [fy + 160, seatY + (v.rows === 2 ? 940 : 380)]) a.tube([[cx - bw * 0.48, y, cz - 30], [cx + bw * 0.48, y, cz - 30]], [26, 26], 6);
    a.box(cx - bw * 0.52, fy + 160, cz - 20, cx + bw * 0.52, seatY + (v.rows === 2 ? 940 : 380), cz);
    a.box(cx - 150, fy + 120, bz + H * 0.2, cx + 150, fy + 200, bz + H * 0.34); a.xcyl(cx - 160, cx + 160, fy + 220, bz + H * 0.3, 14, 10);
    const by = seatY + (v.rows === 2 ? 1000 : 440), bh = Z0 + H * 0.5;
    a.box(cx - bw / 2, by, bz + 40, cx + bw / 2, YB - 20, bz + 70);
    for (const s of [-1, 1]) a.box(cx + s * bw / 2 - (s > 0 ? 24 : 0), by, bz + 40, cx + s * bw / 2 + (s > 0 ? 0 : 24), YB - 20, bh);
    a.box(cx - bw / 2, by, bz + 40, cx + bw / 2, by + 24, bh); a.box(cx - bw / 2, YB - 44, bz + 40, cx + bw / 2, YB - 20, bh);
    a.rect(cx - bw / 2, by, cx + bw / 2, YB - 20, 'EQUIP-DETAIL'); a.rect(cx - bw * 0.48, seatY, cx + bw * 0.48, by - 40, 'EQUIP-DETAIL');
  }
  a.outline();
  a.log('Added four tyres with fenders, the body panels and ' + (v.sbs ? 'a roll cage, ' + v.rows + '-seat bench row' + (v.rows > 1 ? 's' : '') + ', dash and a cargo bed' : 'a seat, tank cover, handlebars, headlamps and front and rear racks') + ' (plan and 3D).');
}
const utils = fam({ cat: 'agriculture/machinery', title: 'Generic farm utility vehicle', desc: (v) => v.sbs ? `Side-by-side farm utility vehicle with ${v.rows * 2} seats: four tyres, a roll cage, bench seating, dash and a cargo bed.` : 'Farm quad bike: four tyres with fenders, seat, tank cover, handlebars, headlamps and front and rear racks.', build: utility, vs: [
  ['quad bike, 300 cc class', 46, 78, 46, 0, { rr: 11, tw: 8, sbs: false }], ['quad bike, 450 cc class', 48, 80, 46, 0, { rr: 12, tw: 9, sbs: false }], ['quad bike, 700 cc class', 50, 84, 48, 0, { rr: 12, tw: 9, sbs: false }],
  ['side-by-side, 2 seats', 62, 120, 76, 0, { rr: 14, tw: 10, sbs: true, rows: 1 }], ['side-by-side, 4 seats', 62, 150, 76, 0, { rr: 14, tw: 10, sbs: true, rows: 2 }], ['side-by-side, 2 seats, long bed', 62, 138, 76, 0, { rr: 15, tw: 10, sbs: true, rows: 1 }] ] });

// ============================================================================================ buildings
/** Broiler or layer house: long low-walled shed with a gable roof, curtain sides, ridge vent, doors in the gable end, side fans and two feed bins with augers. */
function poultryHouse(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, hw0 = X0 + 20, hw1 = X1 - 20 - (v.bins ? 1250 : 0), hcx = (hw0 + hw1) / 2, wz = Z0 + H * 0.4, rz = Z0 + H * 0.82, y0 = YF + 20, y1 = YB - 20;
  a.box(hw0, y0, Z0, hw1, y1, Z0 + 70);
  for (const x of [hw0, hw1 - 30]) { a.box(x, y0, Z0 + 70, x + 30, y1, Z0 + 70 + H * 0.12); a.box(x, y0, wz - 120, x + 30, y1, wz); for (let i = 0; i <= v.bays; i++) { const y = y0 + (y1 - y0 - 30) * i / v.bays; a.box(x, y, Z0 + 70, x + 30, y + 30, wz); } }
  for (const x of [hw0 + 6, hw1 - 6]) a.box(x - 4, y0 + 30, Z0 + 70 + H * 0.12, x + 4, y1 - 30, wz - 120);   // curtain
  slabXZ(a, hw0 - 140, wz - 10, hcx, rz, 40, y0 - 40, y1 + 20); slabXZ(a, hcx, rz, hw1 + 140, wz - 10, 40, y0 - 40, y1 + 20);
  prismY(a, [[hw0, wz], [hw1, wz], [hw1, wz + 8], [hw0, wz + 8]], y0, y0 + 18);
  prismY(a, [[hw0, wz], [hw1, wz], [hcx, rz - 30]], y0, y0 + 24);
  a.box(hcx - 120, y0 - 20, rz - 20, hcx + 120, y1 + 10, rz + 160);   // ridge vent
  const dw = 700; a.box(hcx - dw / 2, y0 - 8, Z0 + 70, hcx + dw / 2, y0 + 12, Z0 + 70 + H * 0.4); a.box(hcx - dw / 2 - 30, y0 - 12, Z0 + 70, hcx - dw / 2, y0 + 16, Z0 + 70 + H * 0.4 + 30); a.box(hcx + dw / 2, y0 - 12, Z0 + 70, hcx + dw / 2 + 30, y0 + 16, Z0 + 70 + H * 0.4 + 30);
  for (let i = 0; i < v.fans; i++) { const y = y0 + 300 + (y1 - y0 - 600) * (v.fans > 1 ? i / (v.fans - 1) : 0.5); a.box(hw1 - 4, y - 260, Z0 + 140, hw1 + 140, y + 260, Z0 + 140 + 520); a.xcyl(hw1 + 140, hw1 + 220, y, Z0 + 400, 230, 14); }
  if (v.bins) for (let b = 0; b < 2; b++) {
    const bx = X1 - 640, by = y0 + 1000 + b * 1500, br = 520, bz0 = Z0 + H * 0.3, bz1 = Z0 + H * 0.78;
    for (const dx of [-340, 340]) for (const dy of [-340, 340]) a.tube([[bx + dx, by + dy, Z0], [bx + dx * 0.7, by + dy * 0.7, bz0]], [26, 26], 6);
    a.cone(bx, by, bz0 - 160, bz0, 60, br, 14); a.cyl(bx, by, bz0, bz1, br, 16); a.cone(bx, by, bz1, bz1 + 260, br, 40, 14);
    a.tube([[bx, by, bz0 - 120], [hw1 + 300, by, Z0 + H * 0.34], [hw1, by, Z0 + H * 0.3]], [40, 40, 40], 6);
    a.circ(bx, by, br, 'EQUIP');
  }
  a.rect(hw0, y0, hw1, y1, 'EQUIP'); a.rect(hw0 - 140, y0 - 40, hw1 + 140, y1 + 20, 'EQUIP-DETAIL'); a.line(hcx, y0, hcx, y1, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the base and sidewalls with curtain panels, the gable roof with ridge vent, the end door with frame, ' + v.fans + ' side fans' + (v.bins ? ' and two feed bins with augers' : '') + ' (plan and 3D).');
}
const poultryH = fam({ cat: 'agriculture/buildings', title: 'Generic long poultry shed', desc: (v) => `Poultry shed, ${v.wf} by ${v.lf} ft: sidewalls with curtain panels, gable roof with ridge vent, end door with frame, ${v.fans} side fans${v.bins ? ' and two feed bins with augers' : ''}.`, build: poultryHouse, vs: [
  ['30 by 80 ft, 2 fans', 372, 960, 168, 0, { wf: 30, lf: 80, fans: 2, bays: 8 }], ['40 by 100 ft, 4 fans, feed bins', 540, 1200, 190, 0, { wf: 40, lf: 100, fans: 4, bins: true, bays: 10 }], ['40 by 200 ft, 6 fans, feed bins', 540, 2400, 190, 0, { wf: 40, lf: 200, fans: 6, bins: true, bays: 20 }], ['50 by 300 ft, 8 fans, feed bins', 660, 3600, 204, 0, { wf: 50, lf: 300, fans: 8, bins: true, bays: 30 }], ['24 by 40 ft, small layer shed', 300, 480, 150, 0, { wf: 24, lf: 40, fans: 1, bays: 4 }] ] });

/** Free-stall dairy barn: open-sided with columns, trussed gable roof, rows of cubicle partitions with neck rails, a feed barrier and a water trough along the alley. */
function freeStall(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, cols = m.round(D / (20 * FT)) + 1, ez = Z0 + H * 0.68, rz = Z0 + H;
  for (let i = 0; i < cols; i++) { const y = YF + 40 + (D - 80) * i / (cols - 1); for (const x of [X0 + 50, X1 - 50, cx]) a.box(x - 20, y - 20, Z0, x + 20, y + 20, v.rows > 2 || x !== cx ? ez : ez); a.tube([[X0 + 50, y, ez], [cx, y, rz - 30], [X1 - 50, y, ez]], [14, 14, 14], 6); if (i % 2 === 0) a.tube([[X0 + 50, y, ez - 150], [cx, y, ez - 20]], [10, 10], 5); }
  slabXZ(a, X0 - 120, ez - 10, cx, rz, 28, YF + 10, YB - 10); slabXZ(a, cx, rz, X1 + 120, ez - 10, 28, YF + 10, YB - 10);
  a.box(cx - 180, YF + 10, rz - 14, cx + 180, YB - 10, rz + 40);
  a.box(X0 + 60, YF + 30, Z0, X1 - 60, YB - 30, Z0 + 30);
  const rows = v.rows, rw = (W - 340) / rows;
  for (let r = 0; r < rows; r++) {
    const xr = X0 + 170 + rw * (r + 0.5), np = m.floor((D - 400) / 1200);
    for (let k = 0; k <= np; k++) { const y = YF + 200 + (D - 400) * k / np; a.tube([[xr - rw * 0.4, y, Z0 + 60], [xr - rw * 0.4, y, Z0 + 700], [xr + rw * 0.2, y, Z0 + 740]], [20, 20, 20], 6); a.tube([[xr + rw * 0.2, y, Z0 + 740], [xr + rw * 0.2, y, Z0 + 60]], [20, 20], 6); }
    a.tube([[xr + rw * 0.2, YF + 200, Z0 + 920], [xr + rw * 0.2, YB - 200, Z0 + 920]], [28, 28], 6); a.tube([[xr - rw * 0.4, YF + 200, Z0 + 1050], [xr - rw * 0.4, YB - 200, Z0 + 1050]], [24, 24], 6);
    a.rect(xr - rw * 0.4, YF + 200, xr + rw * 0.2, YB - 200, 'EQUIP-DETAIL');
  }
  for (const x of [X0 + 120, X1 - 120]) { a.tube([[x, YF + 100, Z0 + 1100], [x, YB - 100, Z0 + 1100]], [30, 30], 6); for (let i = 0; i < 20; i++) a.tube([[x, YF + 140 + (D - 280) * i / 19, Z0 + 150], [x, YF + 140 + (D - 280) * i / 19, Z0 + 1100]], [14, 14], 5); a.rect(x - 20, YF + 100, x + 20, YB - 100, 'EQUIP-DETAIL'); }
  a.box(cx - 100, YF + D * 0.4, Z0 + 30, cx + 100, YF + D * 0.4 + 1800, Z0 + 650); a.box(cx - 80, YF + D * 0.4 + 40, Z0 + 600, cx + 80, YF + D * 0.4 + 1760, Z0 + 660);
  a.outline();
  a.log('Added ' + cols + ' columns with trusses, the gable roof with ridge cap, the slab, ' + rows + ' rows of cubicle partitions with neck rails, feed barriers along both sides and a water trough (plan and 3D).');
}
const freeStalls = fam({ cat: 'agriculture/buildings', title: 'Generic free-stall dairy barn', desc: (v) => `Open-sided free-stall barn, ${v.wf} by ${v.lf} ft: columns with trusses, gable roof with ridge cap, ${v.rows} rows of cubicle partitions with neck rails, feed barriers and a water trough.`, build: freeStall, vs: [
  ['2 rows, 36 by 80 ft', 432, 960, 192, 0, { wf: 36, lf: 80, rows: 2 }], ['4 rows, 60 by 120 ft', 720, 1440, 216, 0, { wf: 60, lf: 120, rows: 4 }], ['4 rows, 72 by 180 ft', 864, 2160, 228, 0, { wf: 72, lf: 180, rows: 4 }], ['6 rows, 96 by 160 ft', 1152, 1920, 252, 0, { wf: 96, lf: 160, rows: 6 }], ['2 rows, 40 by 120 ft', 480, 1440, 198, 0, { wf: 40, lf: 120, rows: 2 }] ] });

/** Roadside farm stand: a raised deck under a sloping awning with posts, tilted display tables of crates, a counter with a scale and a sign board. */
function farmStand(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, pz = Z0 + H * 0.74;
  a.box(X0 + 30, YF + 30, Z0, X1 - 30, YB - 30, Z0 + 110);
  for (const x of [X0 + 70, X1 - 70]) for (const y of [YF + 100, YB - 100]) a.box(x - 35, y - 35, Z0 + 110, x + 35, y + 35, y === YF + 100 ? pz : pz + 200);
  for (let i = 1; i < v.bays; i++) { const x = X0 + 70 + (W - 140) * i / v.bays; a.box(x - 25, YF + 100 - 25, Z0 + 110, x + 25, YF + 100 + 25, pz); }
  prismX(a, [[YF + 20, pz], [YB - 20, pz + 240], [YB - 20, pz + 280], [YF + 20, pz + 60]], X0 + 10, X1 - 10);
  a.box(X0 + 100, YB - 160, Z0 + 110, X1 - 100, YB - 60, Z0 + 130);
  for (let b = 0; b < v.bays; b++) {
    const x0 = X0 + 110 + (W - 220) * b / v.bays, x1 = X0 + 110 + (W - 220) * (b + 0.9) / v.bays;
    a.box(x0, YF + 200, Z0 + 110, x1, YF + 230, Z0 + 700);
    prismX(a, [[YF + 220, Z0 + 700], [YF + 220 + 520, Z0 + 520], [YF + 220 + 520, Z0 + 560], [YF + 220, Z0 + 740]], x0, x1);
    for (let c = 0; c < 3; c++) a.box(x0 + 30 + c * (x1 - x0 - 60) / 3, YF + 280 + c * 30, Z0 + 600 - c * 0, x0 + 30 + (c + 0.85) * (x1 - x0 - 60) / 3, YF + 640, Z0 + 760);
    a.rect(x0, YF + 200, x1, YF + 740, 'EQUIP-DETAIL');
  }
  a.box(cx - 450, YB - 520, Z0 + 110, cx + 450, YB - 200, Z0 + 110 + 900); a.box(cx - 480, YB - 540, Z0 + 110 + 880, cx + 480, YB - 180, Z0 + 110 + 930);
  a.box(cx - 150, YB - 420, Z0 + 110 + 930, cx + 150, YB - 300, Z0 + 110 + 1000); a.cyl(cx + 330, YB - 360, Z0 + 110 + 930, Z0 + 110 + 1010, 90, 12);
  a.box(cx - W * 0.3, YB - 70, pz + 280, cx + W * 0.3, YB - 50, pz + 280 + H * 0.2);
  a.rect(cx - 450, YB - 520, cx + 450, YB - 200, 'EQUIP'); a.rect(X0 + 10, YF + 20, X1 - 10, YB - 20, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the raised deck, awning posts and sloping roof, ' + v.bays + ' tilted display tables with crates, a counter with a scale and a back sign board (plan and 3D).');
}
const farmStands = fam({ cat: 'agriculture/buildings', title: 'Generic roadside farm stand', desc: (v) => `Roadside farm stand, ${v.bays} bays: raised deck under a sloping awning on posts, tilted display tables with crates, a counter with a scale and a sign board.`, build: farmStand, vs: [
  ['2 bays, 8 ft', 100, 96, 112, 0, { bays: 2 }], ['3 bays, 12 ft', 148, 100, 114, 0, { bays: 3 }], ['4 bays, 16 ft', 196, 104, 116, 0, { bays: 4 }], ['5 bays, 20 ft', 244, 108, 118, 0, { bays: 5 }], ['6 bays, 24 ft', 292, 112, 120, 0, { bays: 6 }] ] });

/** Corn crib: a narrow slatted crib on piers with a gable roof overhang, a door on the end and a ladder; the double version has a centre aisle between two cribs. */
function cornCrib(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, pz = Z0 + 150, wz = Z0 + H * 0.66, rz = Z0 + H - 20, cw = v.dbl ? (W - 240 - 900) / 2 : W - 300;
  const boxes = v.dbl ? [[X0 + 120, X0 + 120 + cw], [X1 - 120 - cw, X1 - 120]] : [[X0 + 150, X1 - 150]];
  for (const [x0, x1] of boxes) {
    for (const x of [x0 + 40, x1 - 40]) for (let i = 0; i <= v.bays; i++) { const y = YF + 120 + (D - 240) * i / v.bays; a.box(x - 40, y - 40, Z0, x + 40, y + 40, pz); }
    a.box(x0, YF + 100, pz, x1, YB - 100, pz + 40);
    for (const x of [x0, x1 - 24]) { for (let i = 0; i <= v.bays; i++) { const y = YF + 100 + (D - 200 - 40) * i / v.bays; a.box(x, y, pz + 40, x + 24, y + 40, wz); } for (const z of [pz + 40, wz - 40]) a.box(x, YF + 100, z, x + 24, YB - 100, z + 40); }
    const ns = m.floor((D - 200) / 80);
    for (let k = 0; k < ns; k++) for (const x of [x0 + 30, x1 - 30]) { const y = YF + 110 + 80 * k + 20; a.box(x - 8, y, pz + 80, x + 8, y + 32, wz - 50); }
    a.box(x0, YF + 100, pz + 40, x1, YF + 124, wz); a.box(x0 + (x1 - x0) * 0.3, YF + 90, pz + 40, x0 + (x1 - x0) * 0.7, YF + 108, pz + (wz - pz) * 0.8);
    a.rect(x0, YF + 100, x1, YB - 100, 'EQUIP'); a.rect(x0 + 40, YF + 120, x1 - 40, YB - 120, 'EQUIP-DETAIL');
  }
  slabXZ(a, X0 - 10 + 0, wz - 10, cx, rz, 36, YF + 10, YB - 10); slabXZ(a, cx, rz, X1 + 0, wz - 10, 36, YF + 10, YB - 10);
  prismY(a, [[X0 + 20, wz + 20], [X1 - 20, wz + 20], [cx, rz - 8]], YF + 24, YF + 48);
  if (v.dbl) { a.box(cx - 460, YF + 100, pz - 4, cx + 460, YB - 100, pz + 6); a.rect(cx - 460, YF + 100, cx + 460, YB - 100, 'EQUIP-DETAIL'); }
  ladder(a, boxes[0][0] + 150, YF + 60, Z0, YF + 60, pz + 40, 360, 4);
  a.outline();
  a.log('Added the corner piers and floor, the slatted crib walls with posts and rails, the gable roof and end gable, an end door with frame' + (v.dbl ? ', a centre aisle between two cribs' : '') + ' and a ladder (plan and 3D).');
}
const cribs = fam({ cat: 'agriculture/buildings', title: 'Generic slatted corn crib', desc: (v) => `${v.dbl ? 'Double' : 'Single'} corn crib, ${v.wf} by ${v.lf} ft: slatted walls with posts and rails on piers, gable roof with an end gable, a door and a ladder${v.dbl ? ', and a centre aisle between the cribs' : ''}.`, build: cornCrib, vs: [
  ['single, 6 by 16 ft', 90, 216, 132, 0, { wf: 6, lf: 16, bays: 4, dbl: false }], ['single, 8 by 24 ft', 110, 300, 138, 0, { wf: 8, lf: 24, bays: 6, dbl: false }], ['single, 10 by 32 ft', 130, 396, 144, 0, { wf: 10, lf: 32, bays: 8, dbl: false }], ['double, 24 by 32 ft with centre aisle', 300, 396, 168, 0, { wf: 24, lf: 32, bays: 8, dbl: true }], ['double, 30 by 40 ft with centre aisle', 372, 492, 180, 0, { wf: 30, lf: 40, bays: 10, dbl: true }] ] });

/** Lean-to greenhouse: a brick back wall, a low front wall, a sloping glazed roof of bars and glazing rails, glazed ends with a door and potting benches. */
function leanTo(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, bz = Z0 + H, fz = Z0 + H * 0.52, fy = YF + 30, by = YB - 90;
  a.box(X0 + 20, YB - 100, Z0, X1 - 20, YB - 10, bz);
  for (let i = 0; i < 9; i++) a.box(X0 + 20, YB - 104, Z0 + (bz - Z0) * i / 9 + 40, X1 - 20, YB - 100, Z0 + (bz - Z0) * i / 9 + 46);
  a.box(X0 + 20, fy, Z0, X1 - 20, fy + 60, Z0 + 250);
  const n = v.bars;
  for (let i = 0; i <= n; i++) { const x = X0 + 30 + (W - 60) * i / n; a.tube([[x, fy + 20, fz], [x, by, bz - 30]], [14, 14], 5); a.tube([[x, fy + 30, Z0 + 250], [x, fy + 30, fz]], [14, 14], 5); }
  for (let k = 0; k <= 3; k++) { const f = k / 3; a.tube([[X0 + 30, fy + 20 + (by - fy - 20) * f, fz + (bz - 30 - fz) * f], [X1 - 30, fy + 20 + (by - fy - 20) * f, fz + (bz - 30 - fz) * f]], [12, 12], 5); }
  a.tube([[X0 + 30, fy + 30, fz], [X1 - 30, fy + 30, fz]], [18, 18], 6); a.tube([[X0 + 30, fy + 30, Z0 + 250], [X1 - 30, fy + 30, Z0 + 250]], [18, 18], 6);
  for (const x of [X0 + 24, X1 - 24]) { a.tube([[x, fy + 30, Z0 + 250], [x, by, bz - 30]], [14, 14], 5); a.tube([[x, fy + 30, fz], [x, by, bz - 30]], [14, 14], 5); a.tube([[x, by, Z0], [x, by, bz - 30]], [16, 16], 5); }
  a.box(X1 - 20 - 700, fy, Z0 + 250, X1 - 20 - 30, fy + 40, fz); a.box(X1 - 20 - 700, fy, fz - 40, X1 - 20 - 30, fy + 50, fz);   // door frame region
  for (let b = 0; b < 2; b++) { const x0 = X0 + 120 + b * (W - 240 - 700) * 0.55, x1 = x0 + (W - 240 - 700) * 0.42; a.box(x0, by - 400, Z0 + 700, x1, by - 40, Z0 + 740); a.box(x0, by - 400, Z0, x0 + 30, by - 360, Z0 + 700); a.box(x1 - 30, by - 400, Z0, x1, by - 360, Z0 + 700); }
  a.rect(X0 + 20, YB - 100, X1 - 20, YB - 10, 'EQUIP'); a.rect(X0 + 20, fy, X1 - 20, fy + 60, 'EQUIP-DETAIL'); a.rect(X0 + 120, by - 400, X1 - 840, by - 40, 'EQUIP-DETAIL');
  a.arc(X1 - 20 - 30, fy + 20, 640, 180, 270, 'EQUIP-SWING'); a.outline();
  a.log('Added the brick back wall, low front wall, the sloping glazing bars and rails, end frames with a door and potting benches (plan and 3D). Panes are not drawn.');
}
const leanTos = fam({ cat: 'agriculture/buildings', title: 'Generic lean-to greenhouse', desc: (v) => `Lean-to greenhouse, ${v.wf} ft wide: brick back wall, low front wall, ${v.bars + 1} sloping glazing bars with rails, glazed end frames with a door and potting benches. Panes are not drawn.`, build: leanTo, vs: [
  ['8 ft wide', 96, 64, 96, 0, { wf: 8, bars: 6 }], ['12 ft wide', 144, 72, 100, 0, { wf: 12, bars: 9 }], ['16 ft wide', 192, 80, 104, 0, { wf: 16, bars: 12 }], ['24 ft wide', 288, 88, 108, 0, { wf: 24, bars: 18 }] ] });

/** Circular slurry store: a ring wall of panels with vertical joints, a top rail, an access ramp or stair, a filling pipe, an agitator bridge with a mixer and a safety fence. */
function slurryStore(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = m.min(W, D) / 2 - 300, wz = Z0 + H * 0.9;
  ringWall(a, cx, cy, R - 150, R, Z0, wz, 32);
  a.cyl(cx, cy, Z0, Z0 + H * 0.12, R - 150, 32);
  a.cyl(cx, cy, Z0 + H * 0.12, Z0 + H * 0.58, R - 150, 32); a.cyl(cx, cy, Z0 + H * 0.58, Z0 + H * 0.585, R - 160, 32);
  for (let i = 0; i < 16; i++) { const t = (i / 16) * 2 * PI; a.box(cx + (R + 10) * m.cos(t) - 22, cy + (R + 10) * m.sin(t) - 22, Z0, cx + (R + 10) * m.cos(t) + 22, cy + (R + 10) * m.sin(t) + 22, wz); }
  for (let i = 0; i < 32; i++) { const t = (i / 32) * 2 * PI, t2 = ((i + 1) / 32) * 2 * PI; a.tube([[cx + (R + 40) * m.cos(t), cy + (R + 40) * m.sin(t), wz + 400], [cx + (R + 40) * m.cos(t2), cy + (R + 40) * m.sin(t2), wz + 400]], [16, 16], 5); }
  for (let i = 0; i < 16; i++) { const t = (i / 16) * 2 * PI; a.tube([[cx + (R + 40) * m.cos(t), cy + (R + 40) * m.sin(t), wz], [cx + (R + 40) * m.cos(t), cy + (R + 40) * m.sin(t), wz + 400]], [14, 14], 5); }
  a.box(cx - 100, cy - R + 150, wz - 40, cx + 100, cy + R - 150, wz + 20);
  for (let i = 0; i <= 8; i++) a.box(cx - 130, cy - R + 150 + (2 * R - 300) * i / 8 - 8, wz + 20, cx + 130, cy - R + 150 + (2 * R - 300) * i / 8 + 8, wz + 30);
  a.tube([[cx, cy, wz + 20], [cx, cy, Z0 + H * 0.3]], [60, 60], 10); a.cone(cx, cy, Z0 + H * 0.3, Z0 + H * 0.36, 40, 140, 10);
  ladder(a, cx + R * 0.55, cy - R - 20, Z0, cy - R - 20, wz + 400, 460, 9);
  a.tube([[cx - R * 0.6, cy - R - 120, Z0 + 600], [cx - R * 0.6, cy - R + 20, wz - 100], [cx - R * 0.5, cy - R * 0.9, wz - 100]], [90, 90, 90], 10);
  a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R - 150, 'EQUIP-DETAIL'); a.circ(cx, cy, 120, 'EQUIP-DETAIL'); a.line(cx, cy - R + 150, cx, cy + R - 150, 'EQUIP-DETAIL'); a.outline('EQUIP-DETAIL');
  a.log('Added the ring wall with buttress ribs, the slurry body and crust, a top fence rail with posts, a bridge walkway with a mixer, a caged ladder and a filling pipe (plan and 3D).');
}
const slurryStores = fam({ cat: 'agriculture/buildings', title: 'Generic circular slurry store', desc: (v) => `Circular above-ground slurry store, ${v.df} ft diameter: ring wall with buttress ribs, a fence rail on posts, a bridge walkway with a mixer, a ladder and a filling pipe.`, build: slurryStore, vs: [
  ['40 ft diameter', 540, 540, 150, 0, { df: 40 }], ['60 ft diameter', 780, 780, 160, 0, { df: 60 }], ['80 ft diameter', 1020, 1020, 170, 0, { df: 80 }], ['100 ft diameter', 1260, 1260, 180, 0, { df: 100 }] ] });

/** Container-style cold room: a corrugated insulated box on a base frame with double doors and locking bars, a refrigeration unit on the end, a step and a door seal. */
function coldBox(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, bz0 = Z0 + 110, ct = 100;
  a.box(X0 + 20, YF + 20, Z0 + 30, X1 - 20, YB - 20, bz0);
  for (const s of [-1, 1]) a.box(cx + s * (W / 2 - 110) - 50, YF + 20, Z0, cx + s * (W / 2 - 110) + 50, YB - 20, Z0 + 40);
  a.box(X0 + 20, YF + 20, bz0, X1 - 20, YB - 20, Z0 + H);
  const nr = m.floor((D - 400) / 90);
  for (let i = 0; i < nr; i++) for (const x of [X0 + 8, X1 - 8]) { const y = YF + 200 + 90 * i; a.box(x - 12, y, bz0 + 40, x + 12, y + 44, Z0 + H - 40); }
  for (let i = 0; i < 12; i++) { const x = X0 + 60 + (W - 120) * i / 11; a.box(x - 22, YF + 4, Z0 + H - 36, x + 22, YF + 20, Z0 + H - 14); }
  for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 22); for (const z of [bz0, Z0 + H - 22]) a.box(x - 22, YF + 14, z, x + 22, YF + 20 + 22, z + 22); }
  for (const s of [-1, 1]) { const x0 = s < 0 ? X0 + 40 : cx + 8, x1 = s < 0 ? cx - 8 : X1 - 40; a.box(x0, YF + 4, bz0 + 40, x1, YF + 24, Z0 + H - 50); for (const dx of [0.22, 0.72]) a.tube([[x0 + (x1 - x0) * dx, YF - 4, bz0 + 60], [x0 + (x1 - x0) * dx, YF - 4, Z0 + H - 70]], [18, 18], 6); a.box(x0 + (x1 - x0) * (s < 0 ? 0.78 : 0.1), YF - 10, bz0 + H * 0.3, x0 + (x1 - x0) * (s < 0 ? 0.9 : 0.22), YF + 4, bz0 + H * 0.3 + 120); }
  a.box(cx - 10, YF + 4, bz0 + 40, cx + 10, YF + 26, Z0 + H - 50);
  a.box(X0 + 60, YF - 60, bz0 - 50, X1 - 60, YF + 4, bz0);   // step plate
  if (v.unit) { a.box(cx - W * 0.4, YB - 20, bz0 + H * 0.2, cx + W * 0.4, YB + 0 - 0, Z0 + H - 100); }
  a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP'); a.line(cx, YF + 20, cx, YB - 20, 'EQUIP-DETAIL'); a.rect(X0 + 60, YF - 60, X1 - 60, YF + 4, 'EQUIP-DETAIL'); a.rect(cx - W * 0.32, YB - 160, cx + W * 0.32, YB - 40, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the base frame with fork pockets, the corrugated insulated box, double doors with locking bars, handles and a step plate, with a plan line for the unit on the end (plan and 3D).');
}
const coldBoxes = fam({ cat: 'agriculture/buildings', title: 'Generic farm cold room container', desc: (v) => `Farm cold room built as a ${v.ft} ft container-style box: base frame with fork pockets, corrugated insulated walls, double doors with locking bars and a step plate.`, build: coldBox, vs: [
  ['10 ft', 94, 120, 104, 0, { ft: 10 }], ['20 ft', 98, 240, 104, 0, { ft: 20 }], ['40 ft', 98, 480, 104, 0, { ft: 40 }], ['40 ft, high cube', 98, 480, 114, 0, { ft: 40 }] ] });

/** Potting shed: a small gable-front shed on a base with a boarded front, a door with handle, a window with bars, side windows and a gutter. */
function pottingShed(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, wz = Z0 + H * 0.72, rz = Z0 + H, wt = 22;
  a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 90);
  for (const x of [X0 + 40, X1 - 40]) for (const y of [YF + 40, YB - 40]) a.box(x - 30, y - 30, Z0 + 90, x + 30, y + 30, wz);
  a.box(X0 + 40, YB - 40 - wt, Z0 + 90, X1 - 40, YB - 40, wz); a.box(X0 + 40, YF + 40, Z0 + 90, X0 + 40 + wt, YB - 40, wz); a.box(X1 - 40 - wt, YF + 40, Z0 + 90, X1 - 40, YB - 40, wz);
  const dw = 760, dx0 = cx - W * 0.2 - dw / 2, ww = W * 0.34, wx0 = cx + W * 0.2 - ww / 2;
  a.box(X0 + 40, YF + 40, Z0 + 90, dx0, YF + 40 + wt, wz); a.box(dx0 + dw, YF + 40, Z0 + 90, X1 - 40, YF + 40 + wt, wz); a.box(dx0, YF + 40, Z0 + 90 + 1900, dx0 + dw, YF + 40 + wt, wz);
  a.box(wx0, YF + 40, Z0 + 90, wx0 + ww, YF + 40 + wt, Z0 + 90 + 700); a.box(wx0, YF + 40, Z0 + 90 + 700 + 700, wx0 + ww, YF + 40 + wt, wz);
  a.box(dx0 + 10, YF + 24, Z0 + 90, dx0 + dw - 10, YF + 40, Z0 + 90 + 1890); a.box(dx0 + dw - 90, YF + 14, Z0 + 90 + 900, dx0 + dw - 40, YF + 24, Z0 + 90 + 1000);
  a.box(wx0 - 30, YF + 30, Z0 + 90 + 690, wx0 + ww + 30, YF + 46, Z0 + 90 + 710); a.box(wx0 - 30, YF + 30, Z0 + 90 + 1390, wx0 + ww + 30, YF + 46, Z0 + 90 + 1410);
  a.box(wx0 + ww / 2 - 8, YF + 36, Z0 + 90 + 700, wx0 + ww / 2 + 8, YF + 44, Z0 + 90 + 1400);
  slabXZ(a, X0 - 80, wz - 10, cx, rz, 28, YF + 10, YB - 10); slabXZ(a, cx, rz, X1 + 80, wz - 10, 28, YF + 10, YB - 10);
  prismY(a, [[X0 + 40, wz], [X1 - 40, wz], [cx, rz - 18]], YF + 30, YF + 56);
  a.tube([[X0 - 80, YF + 10, wz - 30], [X1 + 80, YF + 10, wz - 30]], [26, 26], 6);
  if (v.bench) a.box(X1 - 40 - wt - 400, YB - 40 - 700, Z0 + 90 + 780, X1 - 40 - wt, YB - 40 - wt, Z0 + 90 + 820);
  a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP'); a.rect(dx0, YF + 30, dx0 + dw, YF + 50, 'EQUIP-DETAIL'); a.rect(wx0, YF + 30, wx0 + ww, YF + 50, 'EQUIP-DETAIL'); a.arc(dx0, YF + 40, dw, 270, 360, 'EQUIP-SWING'); a.outline();
  a.log('Added the base, corner posts and boarded walls, the front door with handle, a barred window, the gable roof with overhang, end gable and a front gutter' + (v.bench ? ', and an inside potting bench' : '') + ' (plan and 3D).');
}
const sheds = fam({ cat: 'agriculture/buildings', title: 'Generic potting shed', desc: (v) => `Small gable-front potting shed, ${v.wf} by ${v.lf} ft: base, boarded walls with corner posts, front door with handle, a barred window, gable roof with overhang and a gutter${v.bench ? ', plus an inside potting bench' : ''}.`, build: pottingShed, vs: [
  ['6 by 4 ft', 80, 56, 90, 0, { wf: 6, lf: 4 }], ['8 by 6 ft, bench', 104, 80, 96, 0, { wf: 8, lf: 6, bench: true }], ['10 by 8 ft, bench', 128, 104, 98, 0, { wf: 10, lf: 8, bench: true }], ['12 by 8 ft, bench', 152, 104, 100, 0, { wf: 12, lf: 8, bench: true }], ['12 by 10 ft, bench', 152, 128, 102, 0, { wf: 12, lf: 10, bench: true }] ] });

// ============================================================================================ livestock
/** Cattle feed bunk: a concrete apron, a sloped-floor trough with side walls and a head rail with posts, neck rail and vertical feed-barrier bars. */
function bunk(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, tz = Z0 + H * 0.4, bw = D * 0.5;
  a.box(X0, YF, Z0, X1, YB, Z0 + 60);
  prismY(a, [[X0 + 20, Z0 + 60], [X1 - 20, Z0 + 60], [X1 - 20, tz], [X0 + 20, tz]], YB - bw - 40, YB - 20);
  a.box(X0 + 20, YB - bw - 40, Z0 + 60, X1 - 20, YB - bw, tz + 60);
  a.box(X0 + 20, YB - 40, Z0 + 60, X1 - 20, YB - 20, tz + 120);
  prismY(a, [[X0 + 60, tz + 4], [X1 - 60, tz + 4], [X1 - 60, tz + 20], [X0 + 60, tz + 20]], YB - bw, YB - 40);
  for (const x of [X0 + 60, X1 - 60]) a.box(x - 20, YB - bw - 36, tz, x + 20, YB - bw - 6, tz + 20);
  const sy = YB - bw - 120, np = m.round(W / 2400);
  for (let i = 0; i <= np; i++) { const x = X0 + 80 + (W - 160) * i / np; a.tube([[x, sy, Z0 + 60], [x, sy, Z0 + H * 0.95]], [40, 40], 8); }
  const nb = m.floor((W - 200) / 200);
  for (let k = 0; k <= nb; k++) { const x = X0 + 100 + (W - 200) * k / nb; a.tube([[x, sy, Z0 + 60 + 60], [x, sy + 30, Z0 + H * 0.5], [x + 40, sy + 60, Z0 + H * 0.86]], [14, 14, 14], 5); }
  for (const z of [Z0 + H * 0.97, Z0 + H * 0.5]) a.tube([[X0 + 80, sy, z], [X1 - 80, sy, z]], [30, 30], 6);
  a.rect(X0 + 20, YB - bw - 40, X1 - 20, YB - 20, 'EQUIP'); a.line(X0 + 60, YB - bw, X1 - 60, YB - bw, 'EQUIP-DETAIL'); a.line(X0 + 80, sy, X1 - 80, sy, 'EQUIP'); a.outline('EQUIP-DETAIL');
  a.log('Added the apron slab, the sloped trough with end and side walls and a rear lip, ' + (np + 1) + ' barrier posts, ' + (nb + 1) + ' angled feed-barrier bars and two rails (plan and 3D).');
}
const bunks = fam({ cat: 'agriculture/livestock', title: 'Generic cattle feed bunk', desc: (v) => `Cattle feed bunk, ${v.lf} ft long: concrete apron, sloped trough with side walls and a lip, posts, angled feed-barrier bars and a top and a neck rail.`, build: bunk, vs: [
  ['10 ft', 124, 84, 52, 0, { lf: 10 }], ['16 ft', 196, 84, 52, 0, { lf: 16 }], ['20 ft', 244, 84, 52, 0, { lf: 20 }], ['24 ft', 292, 84, 52, 0, { lf: 24 }] ] });

/** Sheep hay rack: two A-frame ends carrying V-shaped bar sides over a feed trough, with hay inside. */
function sheepRack(a, v) {
  const { X0, X1, YF, YB, Z0, cx, cy, W, D, H } = a, th = Z0 + H * 0.3;
  for (const x of [X0 + 40, X1 - 40]) { for (const y of [YF + 40, YB - 40]) a.tube([[x, y, Z0], [x, y, th + 40]], [34, 34], 8); a.tube([[x, YF + 40, th + 40], [x, YB - 40, th + 40]], [34, 34], 8); a.tube([[x, YF + 40, th + 40], [x, YF + 10, Z0 + H]], [26, 26], 6); a.tube([[x, YB - 40, th + 40], [x, YB - 10, Z0 + H]], [26, 26], 6); a.tube([[x, YF + 10, Z0 + H], [x, YB - 10, Z0 + H]], [26, 26], 6); }
  prismY(a, [[X0 + 40, th], [X1 - 40, th], [X1 - 70, th + 110], [X0 + 70, th + 110]], YF + 40, YB - 40);
  const nb = m.floor((W - 160) / 110);
  for (let k = 0; k <= nb; k++) { const x = X0 + 80 + (W - 160) * k / nb; for (const s of [0, 1]) { const y0 = s ? YB - 40 : YF + 40, y1 = s ? YB - 10 : YF + 10; a.tube([[x, y0, th + 80], [x, y1, Z0 + H]], [11, 11], 5); } }
  for (const f of [0.35, 0.7]) for (const s of [0, 1]) { const y = s ? YB - 40 + 30 * f : YF + 40 - 30 * f, z = th + 80 + (Z0 + H - th - 80) * f; a.tube([[X0 + 40, y, z], [X1 - 40, y, z]], [14, 14], 5); }
  a.box(X0 + 120, YF + 90, th + 110, X1 - 120, YB - 90, Z0 + H * 0.82);
  a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP'); a.rect(X0 + 120, YF + 90, X1 - 120, YB - 90, 'EQUIP-DETAIL'); a.line(X0 + 40, cy, X1 - 40, cy, 'EQUIP-DETAIL'); a.outline('EQUIP-DETAIL');
  a.log('Added four legs per end frame, the V-sided bar racks with rails, the feed trough and a hay load (plan and 3D).');
}
const sheepRacks = fam({ cat: 'agriculture/livestock', title: 'Generic sheep hay rack', desc: (v) => `Sheep hay rack, ${v.lf} ft: A-frame ends on legs, V-shaped bar sides with rails over a feed trough, with a hay load inside.`, build: sheepRack, vs: [
  ['4 ft', 56, 32, 42, 0, { lf: 4 }], ['6 ft', 80, 32, 42, 0, { lf: 6 }], ['8 ft', 104, 34, 44, 0, { lf: 8 }], ['10 ft', 128, 36, 44, 0, { lf: 10 }] ] });

/** Farrowing crate: a slatted floor with a sow cage in the middle (side rails, rear and front bars, bar sections), creep areas with heat lamps at the sides and a front feeder. */
function farrowing(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, cw = v.cage * IN, cx0 = cx - cw / 2, cx1 = cx + cw / 2, fz = Z0 + 260;
  for (const x of [X0 + 30, X1 - 30, cx0 - 60, cx1 + 60]) for (const y of [YF + 30, YB - 30]) a.tube([[x, y, Z0], [x, y, fz]], [26, 26], 6);
  a.box(X0 + 10, YF + 10, fz, X1 - 10, YB - 10, fz + 30);
  for (let i = 0; i < 30; i++) { const y = YF + 40 + (D - 80) * i / 29; a.box(X0 + 20, y - 4, fz + 30, X1 - 20, y + 4, fz + 42); }
  for (const x of [cx0, cx1]) { for (const f of [0, 0.3, 0.6, 1]) { const y = YF + 80 + (D - 160) * f; a.tube([[x, y, fz + 40], [x, y, Z0 + H * 0.62]], [26, 26], 6); } for (const z of [Z0 + H * 0.62, Z0 + H * 0.44, fz + 150]) a.tube([[x, YF + 80, z], [x, YB - 80, z]], [24, 24], 6); }
  a.tube([[cx0, YB - 80, Z0 + H * 0.62], [cx1, YB - 80, Z0 + H * 0.62]], [26, 26], 6); a.tube([[cx0, YF + 80, Z0 + H * 0.62], [cx1, YF + 80, Z0 + H * 0.62]], [26, 26], 6); a.tube([[cx0, YB - 80, Z0 + H * 0.78], [cx1, YB - 80, Z0 + H * 0.78]], [22, 22], 6);
  for (const x of [X0 + 10, X1 - 10]) { a.box(x - 10, YF + 10, fz + 30, x + 10, YB - 10, fz + 230); }
  for (const s of [-1, 1]) { const x = cx + s * (cw / 2 + (W / 2 - cw / 2) * 0.55); a.box(x - 160, YF + D * 0.25, fz + 230, x + 160, YF + D * 0.25 + 30, fz + 250); a.tube([[x, YF + D * 0.25 + 15, fz + 240], [x, YF + D * 0.25 + 15, Z0 + H * 0.96]], [12, 12], 5); a.cone(x, YF + D * 0.25 + 15, Z0 + H * 0.84, Z0 + H * 0.96, 120, 40, 12); a.circ(x, YF + D * 0.25 + 15, 120, 'EQUIP-DETAIL'); }
  a.box(cx - 150, YF + 20, fz + 130, cx + 150, YF + 150, fz + 190); a.box(cx - 150, YF + 20, fz + 190, cx + 150, YF + 40, fz + 330);
  a.rect(cx0, YF + 80, cx1, YB - 80, 'EQUIP-DETAIL'); a.rect(cx - 150, YF + 20, cx + 150, YF + 150, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the raised slatted floor with end rails, the sow cage with side bars and rails, the two creep areas with heat lamps and the front feeder (plan and 3D).');
}
const farrowings = fam({ cat: 'agriculture/livestock', title: 'Generic farrowing crate', desc: (v) => `Farrowing crate, ${v.cage} in cage width: slatted raised floor, sow cage with side bars and rails, two creep areas with heat lamps and a front feeder.`, build: farrowing, vs: [
  ['22 in cage, 84 in long', 66, 84, 60, 0, { cage: 22 }], ['24 in cage, 84 in long', 72, 84, 60, 0, { cage: 24 }], ['26 in cage, 90 in long', 80, 90, 62, 0, { cage: 26 }], ['28 in cage, 96 in long', 90, 96, 64, 0, { cage: 28 }] ] });

/** Pig arc: a corrugated half-barrel hut built from curved sections, with a ribbed shell, an end wall and a front with a door gap and a skirting bar. */
function pigArc(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, rx = W / 2 - 20, rz = H - 10, t = 30, N = 14;
  const P = (k, f) => [cx + (rx - f) * m.cos(PI - (PI * k) / N), Z0 + (rz - f) * m.sin(PI - (PI * k) / N) * (1.0)];
  for (let k = 0; k < N; k++) { const o0 = P(k, 0), o1 = P(k + 1, 0), i1 = P(k + 1, t), i0 = P(k, t); prismY(a, [o0, o1, i1, i0], YF + 10, YB - 10); }
  const nr = m.floor(D / 190);
  for (let r = 0; r <= nr; r++) { const y = YF + 30 + (D - 60) * r / nr; for (let k = 0; k < N; k++) { const o0 = P(k, -14), o1 = P(k + 1, -14), i1 = P(k + 1, 4), i0 = P(k, 4); prismY(a, [o0, o1, i1, i0], y - 10, y + 10); } }
  const e = []; for (let k = 0; k <= N; k++) e.push(P(k, t)); prismY(a, e, YB - 24, YB - 10);
  a.box(X0 + 20, YF + 10, Z0, X0 + 20 + t, YB - 10, Z0 + 80); a.box(X1 - 20 - t, YF + 10, Z0, X1 - 20, YB - 10, Z0 + 80);
  const dh = H * 0.6, dw = W * 0.42, za = (x) => Z0 + rz * m.sqrt(m.max(0, 1 - ((x - cx) / rx) ** 2));
  const pts = []; for (let k = 0; k <= N; k++) pts.push(P(k, 0));
  const lp = pts.filter((p) => p[0] < cx - dw / 2), rp2 = pts.filter((p) => p[0] > cx + dw / 2), mp = pts.filter((p) => p[0] >= cx - dw / 2 && p[0] <= cx + dw / 2);
  prismY(a, [[cx - rx, Z0], ...lp, [cx - dw / 2, za(cx - dw / 2)], [cx - dw / 2, Z0]], YF + 4, YF + 14);
  prismY(a, [[cx + dw / 2, Z0], [cx + dw / 2, za(cx + dw / 2)], ...rp2, [cx + rx, Z0]], YF + 4, YF + 14);
  prismY(a, [[cx - dw / 2, Z0 + dh], [cx + dw / 2, Z0 + dh], [cx + dw / 2, za(cx + dw / 2)], ...mp.slice().reverse(), [cx - dw / 2, za(cx - dw / 2)]], YF + 4, YF + 14);
  a.tube([[cx - dw / 2, YF + 6, Z0 + 140], [cx + dw / 2, YF + 6, Z0 + 140]], [20, 20], 6);
  a.rect(X0 + 20, YF + 10, X1 - 20, YB - 10, 'EQUIP'); for (let r = 0; r <= nr; r++) { const y = YF + 30 + (D - 60) * r / nr; a.line(X0 + 20, y, X1 - 20, y, 'EQUIP-DETAIL'); } a.outline('EQUIP-DETAIL');
  a.log('Added the curved corrugated shell in ' + N + ' sections with ' + (nr + 1) + ' ribs, the rear end wall, skid rails and a front with a door gap and a guard bar (plan and 3D).');
}
const pigArcs = fam({ cat: 'agriculture/livestock', title: 'Generic pig arc hut', desc: (v) => `Pig arc, ${v.wf} ft wide: curved corrugated half-barrel shell with ribs, a rear end wall, skid rails and a front with a door gap and a guard bar.`, build: pigArc, vs: [
  ['6 ft wide, 8 ft long', 74, 96, 48, 0, { wf: 6 }], ['8 ft wide, 8 ft long', 98, 96, 54, 0, { wf: 8 }], ['8 ft wide, 12 ft long', 98, 144, 54, 0, { wf: 8 }], ['10 ft wide, 12 ft long', 122, 144, 60, 0, { wf: 10 }] ] });

/** Beehive: a stand, floor board with landing and entrance, stacked boxes with hand grips, an inner cover and a gabled lid; or a top-bar hive when v.topbar. */
function beehive(a, v) {
  const { X0, X1, YF, YB, Z0, cx, cy, W, D, H } = a;
  if (v.topbar) {
    const lz = Z0 + H * 0.38, tz = Z0 + H * 0.72;
    for (const s2 of [-1, 1]) for (const y of [YF + 40, YB - 40]) a.tube([[cx + s2 * (W / 2 - 70) * 0.5, y, Z0], [cx + s2 * (W / 2 - 70) * 0.5, y, lz]], [18, 18], 6);
    prismY(a, [[X0 + 70, tz], [X1 - 70, tz], [cx + (W / 2 - 70) * 0.5, lz], [cx - (W / 2 - 70) * 0.5, lz]], YF + 20, YB - 20);
    a.box(X0 + 70, YF + 20, tz, X1 - 70, YF + 40, tz + 40);
    for (let i = 0; i < 20; i++) { const y = YF + 60 + (D - 120) * i / 19; a.box(X0 + 62, y - 14, tz, X1 - 62, y + 14, tz + 14); }
    prismY(a, [[X0 + 30, tz + 14], [X1 - 30, tz + 14], [cx, tz + 14 + H * 0.2]], YF + 10, YB - 10);
    a.box(cx - 20, YF + 12, lz + 20, cx + 20, YF + 22, lz + 40);
    a.rect(X0 + 70, YF + 20, X1 - 70, YB - 20, 'EQUIP'); for (let i = 0; i < 20; i++) a.line(X0 + 70, YF + 60 + (D - 120) * i / 19, X1 - 70, YF + 60 + (D - 120) * i / 19, 'EQUIP-DETAIL'); a.outline('EQUIP-DETAIL');
    a.log('Added the stand legs, the sloped-sided hive body, twenty top bars, an entrance slot and a gabled roof (plan and 3D).'); return;
  }
  const bw = W - 110, bh = v.bh * IN, bx0 = cx - bw / 2, bx1 = cx + bw / 2, by0 = YF + 170, by1 = YB - 50, sh = 300;
  for (const x of [bx0 + 40, bx1 - 40]) for (const y of [by0 + 40, by1 - 40]) a.box(x - 30, y - 30, Z0, x + 30, y + 30, Z0 + sh);
  a.box(bx0, by0, Z0 + sh, bx1, by1, Z0 + sh + 30);
  a.box(bx0 + 10, by0 - 140, Z0 + sh, bx1 - 10, by0, Z0 + sh + 18);
  a.box(bx0 + 20, by0, Z0 + sh + 30, bx1 - 20, by0 + 20, Z0 + sh + 70);
  let z = Z0 + sh + 30;
  for (let b = 0; b < v.boxes; b++) {
    a.box(bx0, by0, z, bx1, by1, z + bh); a.box(bx0 - 6, by0 - 6, z, bx1 + 6, by0 + 6, z + 18);
    for (const x of [bx0, bx1]) a.box(x - (x === bx0 ? 14 : 0), (by0 + by1) / 2 - 80, z + bh * 0.62, x + (x === bx0 ? 0 : 14), (by0 + by1) / 2 + 80, z + bh * 0.62 + 36);
    a.line(bx0, by0, bx1, by0, 'EQUIP-DETAIL');
    z += bh;
  }
  a.box(bx0, by0, z, bx1, by1, z + 20); a.box(bx0 - 40, by0 - 40, z + 20, bx1 + 40, by1 + 40, z + 60);
  prismY(a, [[bx0 - 30, z + 60], [bx1 + 30, z + 60], [cx, z + 60 + m.min(H * 0.1, 120)]], by0 - 40, by1 + 40);
  a.rect(bx0, by0, bx1, by1, 'EQUIP'); a.rect(bx0 - 40, by0 - 40, bx1 + 40, by1 + 40, 'EQUIP-DETAIL'); a.rect(bx0 + 10, by0 - 140, bx1 - 10, by0, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the stand, the floor board with landing and entrance, ' + v.boxes + ' stacked box' + (v.boxes > 1 ? 'es' : '') + ' with hand grips, the inner cover and a gabled lid (plan and 3D).');
}
const hives = fam({ cat: 'agriculture/livestock', title: 'Generic beehive', desc: (v) => v.topbar ? 'Top-bar beehive: stand legs, a sloped-sided hive body with twenty top bars and an entrance slot under a gabled roof.' : `Stacked beehive with ${v.boxes} box${v.boxes > 1 ? 'es' : ''}: stand, floor board with landing, hand-grip boxes, inner cover and a gabled lid.`, build: beehive, vs: [
  ['5-frame nucleus box, 1 box', 11, 17, 28, 0, { boxes: 1, bh: 9 }], ['8-frame, 2 boxes', 17, 23, 39, 0, { boxes: 2, bh: 9.6 }], ['10-frame, 2 boxes', 20, 24, 39, 0, { boxes: 2, bh: 9.6 }], ['10-frame, 3 boxes', 20, 24, 50, 0, { boxes: 3, bh: 9.6 }], ['top-bar hive, 40 in', 24, 56, 34, 0, { topbar: true }] ] });

/** Headlock feed barrier: end and intermediate posts, a top and a bottom rail, and a row of stalls with angled bars and a fixed neck gap. */
function headlock(a, v) {
  const { X0, X1, YF, YB, Z0, cx, cy, W, D, H } = a, y = cy, n = v.n, pw = (W - 160) / n;
  for (let i = 0; i <= n; i++) { const x = X0 + 80 + pw * i; a.tube([[x, y, Z0], [x, y, Z0 + H]], [38, 38], 8); a.box(x - 60, y - 70, Z0, x + 60, y + 70, Z0 + 20); a.circ(x, y, 38, 'EQUIP'); }
  for (const z of [Z0 + H * 0.97, Z0 + H * 0.72, Z0 + H * 0.12]) a.tube([[X0 + 80, y, z], [X1 - 80, y, z]], [30, 30], 6);
  for (let i = 0; i < n; i++) {
    const xa = X0 + 80 + pw * i, xb = xa + pw;
    a.tube([[xa + pw * 0.24, y, Z0 + H * 0.12], [xa + pw * 0.24, y - 20, Z0 + H * 0.5], [xa + pw * 0.04, y - 40, Z0 + H * 0.72]], [20, 20, 20], 6);   // fixed neck bar
    a.tube([[xb - pw * 0.04, y, Z0 + H * 0.12], [xb - pw * 0.04, y, Z0 + H * 0.72]], [20, 20], 6);
    a.tube([[xa + pw * 0.24, y - 20, Z0 + H * 0.5], [xa + pw * 0.24, y + 20, Z0 + H * 0.5]], [10, 10], 4);
    a.tube([[xa + pw * 0.5, y, Z0 + H * 0.12], [xa + pw * 0.5, y, Z0 + H * 0.72]], [16, 16], 6);
    a.box(xa + pw * 0.52, y - 28, Z0 + H * 0.56, xa + pw * 0.9, y + 28, Z0 + H * 0.64); a.line(xa + pw * 0.24, y, xa + pw * 0.9, y, 'EQUIP-DETAIL');
  }
  a.line(X0 + 80, y, X1 - 80, y, 'EQUIP'); a.outline('EQUIP-DETAIL');
  a.log('Added ' + (n + 1) + ' posts with base plates, top, middle and bottom rails, and for each of the ' + n + ' stalls a fixed neck bar, a centre bar and a catch (plan and 3D).');
}
const headlocks = fam({ cat: 'agriculture/livestock', title: 'Generic headlock feed barrier', desc: (v) => `Headlock feed barrier with ${v.n} stalls: posts on base plates, three rails, and per stall a fixed neck bar, a centre bar and a catch.`, build: headlock, vs: [
  ['4 stalls', 84, 6, 60, 0, { n: 4 }], ['6 stalls', 124, 6, 60, 0, { n: 6 }], ['8 stalls', 164, 6, 60, 0, { n: 8 }], ['10 stalls', 204, 6, 60, 0, { n: 10 }] ] });

/** Livestock loading chute: a sloped cleated floor between solid-board side rails on posts, adjustable legs, a top landing and a hinged tail gate. */
function chute(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, rise = H * 0.4, lz = Z0 + rise, cw = W - 360, y0 = YF + 30, y1 = YB - 30, ly = y1 - 700;
  prismX(a, [[y0, Z0 + 90], [ly, lz], [ly, lz + 60], [y0, Z0 + 150]], cx - cw / 2, cx + cw / 2);
  a.box(cx - cw / 2, ly, lz, cx + cw / 2, y1, lz + 60);
  const nc = m.floor((ly - y0) / 280);
  for (let k = 1; k <= nc; k++) { const f = k / (nc + 1), y = y0 + (ly - y0) * f, z = Z0 + 150 + (lz + 60 - Z0 - 150) * f; a.box(cx - cw / 2, y - 14, z, cx + cw / 2, y + 14, z + 40); a.line(cx - cw / 2, y, cx + cw / 2, y, 'EQUIP-DETAIL'); }
  for (const s of [-1, 1]) {
    const x = cx + s * (cw / 2 + 20);
    prismX(a, [[y0, Z0 + 150], [ly, lz + 60], [ly, lz + 60 + 1000], [y0, Z0 + 150 + 800]], s < 0 ? x - 40 : x, s < 0 ? x : x + 40);
    for (const f of [0, 0.5, 1]) { const y = y0 + (ly - y0) * f, zt = Z0 + 150 + (lz + 60 - Z0 - 150) * f; a.tube([[x, y, zt - (f > 0 ? 0 : 0)], [x, y, zt + (f > 0.9 ? 1000 : 800)]], [36, 36], 8); }
    a.tube([[x, y0, Z0 + 150 + 800], [x, ly, lz + 60 + 1000]], [26, 26], 6);
    a.tube([[x, ly + 100, Z0], [x, ly + 100, lz]], [40, 40], 8); a.tube([[x, y1 - 100, Z0], [x, y1 - 100, lz]], [40, 40], 8);
    a.line(x, y0, x, y1, 'EQUIP');
  }
  a.tube([[cx - cw / 2, ly + 100, Z0 + 300], [cx + cw / 2, y1 - 100, Z0 + 20]], [14, 14], 5); a.tube([[cx + cw / 2, ly + 100, Z0 + 300], [cx - cw / 2, y1 - 100, Z0 + 20]], [14, 14], 5);
  const gx0 = cx - cw / 2, gx1 = cx + cw / 2; for (const z of [Z0 + 150 + 300, Z0 + 150 + 650]) a.tube([[gx0, y0 - 6, z], [gx1, y0 - 6, z]], [20, 20], 6);
  for (const x of [gx0, gx1]) a.tube([[x, y0 - 6, Z0 + 150], [x, y0 - 6, Z0 + 150 + 800]], [20, 20], 6);
  a.rect(cx - cw / 2, y0, cx + cw / 2, y1, 'EQUIP'); a.rect(cx - cw / 2, ly, cx + cw / 2, y1, 'EQUIP-DETAIL'); a.arc(cx - cw / 2, y0, cw, 180, 270, 'EQUIP-SWING'); a.outline('EQUIP-DETAIL');
  a.log('Added the sloped floor with ' + nc + ' cleats, solid side rails on posts, the top landing on braced legs and a tail gate with two rails (plan and 3D).');
}
const chutes = fam({ cat: 'agriculture/livestock', title: 'Generic livestock loading chute', desc: (v) => `Livestock loading chute for a ${v.use} ramp: sloped cleated floor between solid side rails on posts, a braced top landing and a tail gate.`, build: chute, vs: [
  ['sheep, 10 ft ramp', 56, 150, 74, 0, { use: 'sheep' }], ['calves, 12 ft ramp', 66, 176, 80, 0, { use: 'calf' }], ['cattle, 14 ft ramp', 78, 202, 90, 0, { use: 'cattle' }], ['cattle, 18 ft ramp', 78, 254, 96, 0, { use: 'cattle' }] ] });

/** Goat shelter with a climbing platform: a three-sided shed with a sloping roof, an open front, a raised play deck on posts with steps, and a hay rack. */
function goatShed(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, sw = W * 0.6, sx1 = X0 + sw, hz = Z0 + H * 0.7, lz = Z0 + H * 0.52, wt = 24, sd = D * 0.7, sy0 = YB - sd;
  a.box(X0 + 10, sy0, Z0, sx1, YB - 10, Z0 + 60);
  a.box(X0 + 10, YB - 10 - wt, Z0 + 60, sx1, YB - 10, hz); a.box(X0 + 10, sy0, Z0 + 60, X0 + 10 + wt, YB - 10, hz); prismX(a, [[sy0, lz], [YB - 10, hz], [YB - 10, hz - 4], [sy0, lz - 4]], sx1 - wt, sx1);
  a.box(sx1 - wt, sy0, Z0 + 60, sx1, YB - 10, lz - 4);
  prismX(a, [[sy0 - 100, lz], [YB, hz + 40], [YB, hz + 70], [sy0 - 100, lz + 30]], X0, sx1 + 60);
  a.tube([[X0 + 20, sy0, Z0 + 60], [X0 + 20, sy0, lz]], [30, 30], 6); a.tube([[sx1 - 20, sy0, Z0 + 60], [sx1 - 20, sy0, lz]], [30, 30], 6);
  const px0 = sx1 + 140, px1 = X1 - 20, pz = Z0 + H * 0.4, py0 = YB - D * 0.62, py1 = YB - 40;
  for (const x of [px0 + 30, px1 - 30]) for (const y of [py0 + 30, py1 - 30]) a.tube([[x, y, Z0], [x, y, pz]], [30, 30], 6);
  a.box(px0, py0, pz, px1, py1, pz + 40);
  for (let i = 0; i < 4; i++) { const f = i / 3; a.box(px0 - 360 + 0, py0 + 40, Z0 + (pz - Z0) * (i + 1) / 4 - 20, px0 + 0, py0 + 40 + 360, Z0 + (pz - Z0) * (i + 1) / 4 + 10); }
  for (const s of [px0 - 360, px0]) a.box(s - 10, py0 + 40, Z0, s + 10, py0 + 400, Z0 + 40);
  a.tube([[px1 - 20, py0, pz + 40], [px1 - 20, py0, pz + 700]], [20, 20], 6); a.tube([[px1 - 20, py1, pz + 40], [px1 - 20, py1, pz + 700]], [20, 20], 6); a.tube([[px1 - 20, py0, pz + 700], [px1 - 20, py1, pz + 700]], [20, 20], 6);
  a.box(px0 + 120, YB - 90, pz + 40, px1 - 120, YB - 60, pz + 300);
  a.rect(X0 + 10, sy0, sx1, YB - 10, 'EQUIP'); a.rect(px0, py0, px1, py1, 'EQUIP'); a.rect(px0 - 360, py0 + 40, px0, py0 + 400, 'EQUIP-DETAIL'); a.line(sx1, sy0, sx1, YB - 10, 'EQUIP-DETAIL'); a.outline('EQUIP-DETAIL');
  a.log('Added the three-sided shed with a sloping roof and an open front, the raised play deck on four posts with stepped planks, a rear guard rail and a hay board (plan and 3D).');
}
const goatSheds = fam({ cat: 'agriculture/livestock', title: 'Generic goat shelter with climbing deck', desc: (v) => `Goat shelter for about ${v.gt} goats: three-sided shed with a sloping roof, plus a raised climbing deck on posts with stepped planks, a rail and a hay board.`, build: goatShed, vs: [
  ['2 goats, 4 by 6 ft', 112, 96, 66, 0, { gt: 2 }], ['4 goats, 6 by 8 ft', 150, 120, 72, 0, { gt: 4 }], ['6 goats, 8 by 10 ft', 188, 144, 78, 0, { gt: 6 }], ['10 goats, 10 by 12 ft', 230, 168, 84, 0, { gt: 10 }] ] });

/** Hanging poultry feeder: a tube with a lid, a cone and a pan with a grill, a hanger bracket and chain. */
function henFeeder(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = W / 2 - 4, tr = R * 0.5, pz = Z0 + H * 0.22;
  a.cyl(cx, cy, pz - 20, pz, R, 24); a.cone(cx, cy, pz, pz + H * 0.07, R, R * 0.92, 24); a.cone(cx, cy, pz + H * 0.07, pz + H * 0.15, R * 0.92, tr * 0.5, 24);
  a.cyl(cx, cy, pz + H * 0.14, pz + H * 0.72, tr, 20); a.cone(cx, cy, pz + H * 0.72, pz + H * 0.78, tr, tr * 1.1, 20);
  a.cone(cx, cy, pz + H * 0.78, pz + H * 0.84, tr * 1.1, tr * 0.5, 20);
  for (let i = 0; i < v.ports; i++) { const t = (i / v.ports) * 2 * PI; a.tube([[cx + R * 0.95 * m.cos(t), cy + R * 0.95 * m.sin(t), pz], [cx + R * 0.95 * m.cos(t), cy + R * 0.95 * m.sin(t), pz + H * 0.1]], [R * 0.06, R * 0.06], 6); }
  a.tube([[cx - tr * 0.8, cy, pz + H * 0.84], [cx, cy, Z0 + H * 0.97], [cx + tr * 0.8, cy, pz + H * 0.84]], [4, 6, 4], 5); a.cyl(cx, cy, Z0 + H * 0.97, Z1 - 1, 12, 8);
  a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, tr, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.5, 'EQUIP-DETAIL'); a.outline('EQUIP-DETAIL');
  a.log('Added the feed pan with ' + v.ports + ' grill posts, the sloped cone, the feed tube with lid and the hanger bail (plan and 3D).');
}
const henFeeders = fam({ cat: 'agriculture/livestock', title: 'Generic hanging poultry feeder', desc: (v) => `Hanging poultry feeder, ${v.lb} lb class: a round pan with ${v.ports} grill posts, a cone, a feed tube with a lid and a hanger bail.`, build: henFeeder, vs: [
  ['10 lb', 11, 11, 17, 0, { lb: 10, ports: 6 }], ['20 lb', 14, 14, 21, 0, { lb: 20, ports: 8 }], ['30 lb', 16, 16, 25, 0, { lb: 30, ports: 10 }], ['50 lb', 18, 18, 29, 0, { lb: 50, ports: 12 }] ] });

// ============================================================================================ irrigation, water and grain handling
/** Multi-blade windmill pump: a tapering four-leg lattice tower with girts and braces, a head with a gearbox, a bladed wheel with a hoop and spokes, a tail vane, and a pump rod down to a pump cylinder and spout at the base. */
function windmill(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, wr = v.wd * FT / 2, hz = Z0 + H - wr - 60, hy = YF + D * 0.42, bw = m.min(W * 0.62, H * 0.2), tw = bw * 0.28;
  const leg = (sx, sy) => [[cx + sx * bw / 2, hy + sy * bw / 2, Z0], [cx + sx * tw / 2, hy + sy * tw / 2, hz - 80]];
  const L = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (const [sx, sy] of L) a.tube(leg(sx, sy), [26, 18], 6);
  const lv = 6;
  for (let k = 1; k <= lv; k++) {
    const f = k / (lv + 1), w = bw + (tw - bw) * f, z = Z0 + (hz - 80 - Z0) * f, w0 = bw + (tw - bw) * ((k - 1) / (lv + 1)), z0 = Z0 + (hz - 80 - Z0) * ((k - 1) / (lv + 1));
    for (const [x0, y0, x1, y1] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) a.tube([[cx + x0 * w / 2, hy + y0 * w / 2, z], [cx + x1 * w / 2, hy + y1 * w / 2, z]], [10, 10], 4);
    for (const sx of [-1, 1]) { a.tube([[cx + sx * w0 / 2, hy - w0 / 2, z0], [cx - sx * w / 2, hy - w / 2, z]], [8, 8], 4); a.tube([[cx + sx * w0 / 2, hy + w0 / 2, z0], [cx - sx * w / 2, hy + w / 2, z]], [8, 8], 4); }
  }
  a.rect(cx - bw / 2, hy - bw / 2, cx + bw / 2, hy + bw / 2, 'EQUIP'); a.rect(cx - tw / 2, hy - tw / 2, cx + tw / 2, hy + tw / 2, 'EQUIP-DETAIL'); a.line(cx - bw / 2, hy - bw / 2, cx + bw / 2, hy + bw / 2, 'EQUIP-DETAIL'); a.line(cx + bw / 2, hy - bw / 2, cx - bw / 2, hy + bw / 2, 'EQUIP-DETAIL');
  a.box(cx - tw * 0.6, hy - tw * 0.5, hz - 80, cx + tw * 0.6, hy + tw * 0.5, hz - 20);
  a.box(cx - 110, hy - 220, hz - 40, cx + 110, hy + 220, hz + 90);
  const wy = hy - 260, nb = v.blades;
  a.xcyl(cx - 40, cx + 40, wy, hz, 70, 10); a.ycyl(wy, hy + 200, cx, hz, 24, 8);
  for (const rr of [wr, wr * 0.52]) { for (let k = 0; k < 24; k++) { const t0 = (k / 24) * 2 * PI, t1 = ((k + 1) / 24) * 2 * PI; a.tube([[cx + rr * m.cos(t0), wy, hz + rr * m.sin(t0)], [cx + rr * m.cos(t1), wy, hz + rr * m.sin(t1)]], [12, 12], 4); } }
  for (let k = 0; k < nb; k++) {
    const t = (k / nb) * 2 * PI, c = m.cos(t), s = m.sin(t), tw2 = 0.075;
    a.tube([[cx + 30 * c, wy, hz + 30 * s], [cx + wr * c, wy, hz + wr * s]], [8, 8], 4);
    const P = (r, o) => [cx + r * c - s * o, hz + r * s + c * o];
    const pts = [P(wr * 0.2, -wr * tw2), P(wr, -wr * tw2 * 1.5), P(wr, wr * tw2 * 1.5), P(wr * 0.2, wr * tw2)];
    prismY(a, pts, wy - 12, wy + 12);
  }
  a.tube([[cx, hy + 200, hz], [cx, YB - 200, hz]], [30, 30], 8); a.box(cx - 8, YB - 700, hz - 50, cx + 8, YB - 30, hz + 520);
  a.tube([[cx, hy, Z0 + 40], [cx, hy, hz - 80]], [10, 10], 4);
  a.cyl(cx, hy + bw * 0.9, Z0, Z0 + H * 0.06, 150, 14); a.cyl(cx, hy + bw * 0.9, Z0 + H * 0.06, Z0 + H * 0.18, 80, 12);
  a.tube([[cx, hy + bw * 0.9, Z0 + H * 0.15], [cx + 220, hy + bw * 0.9, Z0 + H * 0.15], [cx + 300, hy + bw * 0.9, Z0 + H * 0.12]], [34, 34, 38], 8);
  a.circ(cx, hy, 24, 'EQUIP-DETAIL'); a.circ(cx, hy + bw * 0.9, 150, 'EQUIP-DETAIL'); a.line(cx, hy, cx, YB - 30, 'EQUIP-DETAIL'); a.outline('EQUIP-DETAIL');
  a.log('Added the four-leg tapered lattice tower with girts and braces, the head and gearbox, the ' + nb + '-blade wheel with hoops and spokes, the tail vane and the pump rod, pump cylinder and spout (plan and 3D).');
}
const windmills = fam({ cat: 'agriculture/irrigation', title: 'Generic windmill water pump', desc: (v) => `Multi-blade windmill pump with a ${v.wd} ft wheel of ${v.blades} blades: tapered four-leg lattice tower with girts and braces, a head with gearbox, a tail vane, a pump rod, pump cylinder and spout.`, build: windmill, vs: [
  ['6 ft wheel, 20 ft tower', 112, 120, 340, 0, { wd: 6, blades: 18 }], ['8 ft wheel, 25 ft tower', 140, 150, 420, 0, { wd: 8, blades: 20 }], ['10 ft wheel, 30 ft tower', 170, 180, 510, 0, { wd: 10, blades: 24 }], ['12 ft wheel, 35 ft tower', 200, 210, 600, 0, { wd: 12, blades: 24 }], ['14 ft wheel, 40 ft tower', 232, 240, 690, 0, { wd: 14, blades: 30 }] ] });

/** Solar pump set: a row of tilted panels on a pipe frame with legs and braces, a controller box, a wellhead with a riser pipe and a delivery pipe. */
function solarPump(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, n = v.n, pw = (W - 400) / n, ty = YF + 60, by = YF + D * 0.45, tz0 = Z0 + H * 0.45, tz1 = Z0 + H * 0.92;
  for (let i = 0; i < n; i++) { const x0 = X0 + 40 + pw * i + 8, x1 = X0 + 40 + pw * (i + 1) - 8; prismX(a, [[by, tz0], [ty, tz1], [ty, tz1 + 36], [by, tz0 + 36]], x0, x1); for (let k = 1; k < 6; k++) a.line(x0 + (x1 - x0) * k / 6, ty, x0 + (x1 - x0) * k / 6, by, 'EQUIP-DETAIL'); a.rect(x0, ty, x1, by, 'EQUIP'); }
  const nl = m.max(2, m.round(n / 2) + 1);
  for (let k = 0; k < nl; k++) { const x = X0 + 40 + (n * pw) * k / (nl - 1); a.tube([[x, by, Z0], [x, by, tz0 + 18]], [24, 24], 6); a.tube([[x, ty, Z0], [x, ty, tz1 + 18]], [24, 24], 6); a.tube([[x, by + 10, Z0 + 40], [x, ty, tz1 - 100]], [14, 14], 5); a.box(x - 60, by - 40, Z0, x + 60, by + 40, Z0 + 20); }
  for (const z of [tz0 + 18, tz1 + 18]) { a.tube([[X0 + 40, z === tz0 + 18 ? by : ty, z], [X0 + 40 + n * pw, z === tz0 + 18 ? by : ty, z]], [26, 26], 6); }
  a.box(X1 - 300, YB - 400, Z0, X1 - 40, YB - 100, Z0 + 600); a.box(X1 - 290, YB - 410, Z0 + 20, X1 - 50, YB - 400, Z0 + 580);
  const wx = X1 - 520; a.cyl(wx, YB - 250, Z0, Z0 + 60, 260, 18); a.cyl(wx, YB - 250, Z0 + 60, Z0 + 620, 100, 14); a.cyl(wx, YB - 250, Z0 + 620, Z0 + 650, 130, 14);
  a.tube([[wx, YB - 250, Z0 + 520], [wx + 260, YB - 250, Z0 + 520], [wx + 260, YB - 250, Z0 + 520]], [40, 40, 40], 8);
  a.tube([[wx, YB - 250, Z0 + 520], [wx - 600, YB - 250, Z0 + 520], [wx - 600, YB - 250, Z0 + 60]], [40, 40, 40], 8);
  a.tube([[X0 + 40 + n * pw, ty + 20, Z0 + H * 0.5], [X1 - 300, YB - 250, Z0 + 400]], [10, 10], 4);
  a.circ(wx, YB - 250, 260, 'EQUIP-DETAIL'); a.rect(X1 - 300, YB - 400, X1 - 40, YB - 100, 'EQUIP'); a.outline('EQUIP-DETAIL');
  a.log('Added ' + n + ' tilted solar panels with cells, the pipe frame with legs and braces, a controller box, the wellhead with a riser pipe and a delivery pipe (plan and 3D).');
}
const solarPumps = fam({ cat: 'agriculture/irrigation', title: 'Generic solar pump set', desc: (v) => `Solar water pump set with ${v.n} tilted panels on a pipe frame, a controller box, a wellhead with a riser pipe and a delivery pipe.`, build: solarPump, vs: [
  ['2 panels', 120, 90, 80, 0, { n: 2 }], ['4 panels', 180, 90, 84, 0, { n: 4 }], ['6 panels', 240, 96, 88, 0, { n: 6 }], ['8 panels', 300, 100, 92, 0, { n: 8 }] ] });

/** Field hydrant riser: a concrete pad, a valve box ring, a riser pipe with flanges, a gate valve with stem and hand wheel, a side outlet with a capped nozzle and chain. */
function hydrant(a, v) {
  const { X0, X1, YF, YB, Z0, cx, cy, W, D, H } = a, rp = v.dn * IN / 2 * 1.25, rz = Z0 + H * 0.5;
  a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.cyl(cx, cy, Z0 + 60, Z0 + 140, W * 0.4, 24); a.cyl(cx, cy, Z0 + 60, Z0 + 150, W * 0.3, 24);
  a.cyl(cx, cy, Z0 + 60, rz, rp, 18);
  for (const z of [Z0 + 130, rz - 40]) a.cyl(cx, cy, z, z + 30, rp * 1.5, 18);
  a.cyl(cx, cy, rz, rz + H * 0.14, rp * 1.35, 18); a.cyl(cx, cy, rz + H * 0.14, rz + H * 0.17, rp * 1.5, 18);
  a.cyl(cx, cy, rz + H * 0.17, Z0 + H * 0.88, 16, 8); a.xcyl(cx - rp * 1.8, cx + rp * 1.8, cy, Z0 + H * 0.9, 10, 8);
  a.cyl(cx, cy, Z0 + H * 0.84, Z0 + H * 0.92, 40, 10);
  for (let k = 0; k < 16; k++) { const t0 = (k / 16) * 2 * PI, t1 = ((k + 1) / 16) * 2 * PI; a.tube([[cx + rp * 1.8 * m.cos(t0), cy + rp * 1.8 * m.sin(t0), Z0 + H * 0.9], [cx + rp * 1.8 * m.cos(t1), cy + rp * 1.8 * m.sin(t1), Z0 + H * 0.9]], [8, 8], 4); }
  for (const dx of [-1, 1]) a.tube([[cx + dx * rp * 1.8, cy, Z0 + H * 0.9], [cx, cy, Z0 + H * 0.88]], [6, 6], 4);
  a.tube([[cx, cy, rz - 100], [cx + rp * 4, cy, rz - 100]], [rp * 0.8, rp * 0.8], 14); a.cyl(cx + rp * 4, cy, rz - 100 - rp * 1.2, rz - 100 + rp * 1.2, rp * 1.1, 14);
  a.xcyl(cx + rp * 4, cx + rp * 4 + 60, cy, rz - 100, rp * 1.05, 14); a.xcyl(cx + rp * 4 + 60, cx + rp * 4 + 80, cy, rz - 100, rp * 1.25, 14);
  a.tube([[cx + rp * 4 + 70, cy, rz - 100 + rp], [cx + rp * 2.5, cy, rz - 20]], [4, 4], 4);
  a.circ(cx, cy, rp, 'EQUIP'); a.circ(cx, cy, W * 0.3, 'EQUIP-DETAIL'); a.line(cx, cy, cx + rp * 4 + 80, cy, 'EQUIP-DETAIL'); a.circ(cx, cy, rp * 1.8, 'EQUIP-DETAIL'); a.outline('EQUIP-DETAIL');
  a.log('Added the pad, valve box ring, riser pipe with flanges, the gate valve bonnet with stem and hand wheel, and a side outlet with a capped nozzle on a chain (plan and 3D).');
}
const hydrants = fam({ cat: 'agriculture/irrigation', title: 'Generic field hydrant riser', desc: (v) => `Field irrigation hydrant, ${v.dn} in riser: pad, valve box ring, flanged riser pipe, a gate valve with stem and hand wheel and a capped side outlet on a chain.`, build: hydrant, vs: [
  ['4 in', 40, 40, 38, 0, { dn: 4 }], ['6 in', 44, 44, 42, 0, { dn: 6 }], ['8 in', 52, 52, 46, 0, { dn: 8 }], ['10 in', 58, 58, 50, 0, { dn: 10 }] ] });

/** Centre pivot point: a pad with a riser pipe and swivel elbow, an A-frame with a control panel, a gooseneck into the first span and a drive tower stub. */
function pivotPoint(a, v) {
  const { X0, X1, YF, YB, Z0, cx, cy, W, D, H } = a, rp = v.dn * IN / 2, bw = W * 0.36;
  a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 80);
  a.cyl(cx, cy, Z0 + 80, Z0 + H * 0.38, rp, 18); a.cyl(cx, cy, Z0 + 80, Z0 + 140, rp * 1.5, 18);
  a.cone(cx, cy, Z0 + H * 0.38, Z0 + H * 0.44, rp * 1.3, rp * 1.3, 18); a.cyl(cx, cy, Z0 + H * 0.42, Z0 + H * 0.46, rp * 1.5, 18);
  for (const s of [-1, 1]) for (const t of [-1, 1]) a.tube([[cx + s * bw, cy + t * bw * 0.6, Z0 + 80], [cx, cy, Z0 + H * 0.72]], [30, 18], 6);
  a.tube([[cx, cy, Z0 + H * 0.46], [cx, cy, Z0 + H * 0.72], [cx - W * 0.1, cy, Z0 + H * 0.84], [cx - W * 0.28, cy, Z0 + H * 0.86]], [rp, rp, rp, rp], 14);
  a.tube([[cx - W * 0.28, cy, Z0 + H * 0.86], [X0 + 20, cy, Z0 + H * 0.86]], [rp * 1.1, rp * 1.1], 14);
  for (const x of [cx - W * 0.28, X0 + 70]) { a.cyl(x, cy, Z0 + H * 0.86 - rp * 1.6, Z0 + H * 0.86 + rp * 1.6, rp * 1.45, 18); }
  a.xcyl(X0 + 20, X0 + 120, cy, Z0 + H * 0.86, rp * 1.6, 18);
  for (const s of [-1, 1]) a.tube([[X0 + 80, cy + s * 30, Z0 + H * 0.86 - rp], [X0 + 80, cy + s * 160, Z0 + 80]], [34, 34], 8);
  a.box(cx + bw * 0.55, cy - 260, Z0 + 80 + H * 0.12, cx + bw * 1.15, cy + 100, Z0 + 80 + H * 0.12 + 700); a.box(cx + bw * 0.55 - 4, cy + 100, Z0 + 80 + H * 0.12 + 60, cx + bw * 1.15 + 4, cy + 112, Z0 + 80 + H * 0.12 + 640);
  a.tube([[cx - 100, cy - bw * 0.6, Z0 + 140], [cx + 100, cy + bw * 0.6, Z0 + H * 0.5]], [10, 10], 4);
  a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP'); a.circ(cx, cy, rp * 1.5, 'EQUIP-DETAIL'); a.line(cx, cy, X0 + 70, cy, 'EQUIP-DETAIL'); a.rect(cx + bw * 0.55, cy - 260, cx + bw * 1.15, cy + 100, 'EQUIP-DETAIL'); a.outline('EQUIP-DETAIL');
  a.log('Added the pad, ' + v.dn + ' in riser with swivel elbow, a braced A-frame, the gooseneck feeding the first span, a drive tower stub and the control panel (plan and 3D).');
}
const pivotPoints = fam({ cat: 'agriculture/irrigation', title: 'Generic pivot point tower', desc: (v) => `Centre pivot point: pad, ${v.dn} in riser with a swivel elbow, a braced A-frame, a gooseneck feeding the first span, a drive tower stub and a control panel.`, build: pivotPoint, vs: [
  ['6 in riser', 120, 96, 120, 0, { dn: 6 }], ['8 in riser', 130, 100, 126, 0, { dn: 8 }], ['10 in riser', 144, 108, 134, 0, { dn: 10 }], ['12 in riser, tall', 156, 116, 150, 0, { dn: 12 }] ] });

/** Irrigation pipe trailer: a flat chassis on two axles with a headboard, side stakes and layers of aluminium pipes with couplers, strapped on. */
function pipeTrailer(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, dz = Z0 + H * 0.26, rr = 17 * IN, pr = v.dn * IN / 2, gx = W / 2 - 110;
  for (const y of [YB - D * 0.28, YB - D * 0.14]) { for (const s of [-1, 1]) tyre(a, cx + s * gx, y, rr, 230, 12); a.xcyl(cx - gx, cx + gx, y, Z0 + rr, 36, 8); for (const s of [-1, 1]) a.box(cx + s * gx - 130, y - rr * 0.9, Z0 + rr * 2 + 20, cx + s * gx + 130, y + rr * 0.9, Z0 + rr * 2 + 40); }
  for (const s of [-1, 1]) a.box(cx + s * (W / 2 - 190) - 40, YF + D * 0.16, dz - 100, cx + s * (W / 2 - 190) + 40, YB - 20, dz);
  a.box(X0 + 70, YF + D * 0.16, dz, X1 - 70, YB - 20, dz + 40);
  a.tube([[cx - 140, YF + D * 0.16, dz - 40], [cx, YF + 40, dz - 80], [cx + 140, YF + D * 0.16, dz - 40]], [34, 38, 34], 8); a.box(cx - 40, YF, dz - 140, cx + 40, YF + 70, dz - 60);
  const y0 = YF + D * 0.16 + 60, y1 = YB - 40, rows = [m.floor((W - 260) / (pr * 2)), m.floor((W - 260) / (pr * 2)) - 1, m.floor((W - 260) / (pr * 2)) - 2];
  for (let l = 0; l < 3; l++) for (let k = 0; k < rows[l]; k++) {
    const x = cx + (k - (rows[l] - 1) / 2) * pr * 2, z = dz + 40 + pr + l * pr * 1.75;
    a.ycyl(y0, y1, x, z, pr, 12); a.ycyl(y0 - 30, y0, x, z, pr * 1.25, 12); a.ycyl(y1, y1 + 0.01, x, z, pr * 1.25, 12);
    if (l === 0) a.circ(x, (y0 + y1) / 2, pr, 'EQUIP-HIDDEN');
  }
  a.box(X0 + 60, y0 - 40, dz + 40, X1 - 60, y0 - 10, Z0 + H); for (const s of [-1, 1]) for (const y of [y0 + 200, (y0 + y1) / 2, y1 - 200]) a.tube([[cx + s * (W / 2 - 75), y, dz + 40], [cx + s * (W / 2 - 75), y, Z0 + H * 0.86]], [24, 24], 6);
  for (const y of [y0 + 500, y1 - 500]) a.box(X0 + 80, y - 10, Z0 + H * 0.9, X1 - 80, y + 10, Z0 + H * 0.9 + 16);
  a.rect(X0 + 70, YF + D * 0.16, X1 - 70, YB - 20, 'EQUIP'); a.rect(X0 + 100, y0, X1 - 100, y1, 'EQUIP-DETAIL'); a.line(cx - 140, YF + D * 0.16, cx, YF + 40, 'EQUIP-DETAIL'); a.line(cx + 140, YF + D * 0.16, cx, YF + 40, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the chassis and deck with drawbar, two axles with tyres and mudguards, a headboard, side stakes, three layers of ' + v.dn + ' in pipes with couplers and strapping (plan and 3D).');
}
const pipeTrailers = fam({ cat: 'agriculture/irrigation', title: 'Generic irrigation pipe trailer', desc: (v) => `Pipe trailer for ${v.ft} ft lengths of ${v.dn} in aluminium irrigation pipe: chassis and deck with drawbar, two axles with tyres, headboard, side stakes and three layers of pipes with couplers.`, build: pipeTrailer, vs: [
  ['20 ft lengths of 4 in pipe', 92, 290, 62, 0, { dn: 4, ft: 20 }], ['30 ft lengths of 5 in pipe', 96, 420, 70, 0, { dn: 5, ft: 30 }], ['40 ft lengths of 6 in pipe', 100, 540, 76, 0, { dn: 6, ft: 40 }], ['40 ft lengths of 8 in pipe', 108, 540, 88, 0, { dn: 8, ft: 40 }] ] });

/** Portable grain auger: a long tube on a truss with a lower hopper and an upper spout, an axle with wheels and a hitch, a lift winch, a drive motor and guards. */
function auger(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, tr = v.tube * IN / 2, wr = 14 * IN, y0 = YF + 120, y1 = YB - 80, z0 = Z0 + 340, z1 = Z0 + H - tr * 2 - 120, mid = (y0 + y1) / 2, mz = (z0 + z1) / 2 - 40;
  a.tube([[cx, y0, z0], [cx, y1, z1]], [tr, tr], 14);
  for (let k = 1; k < 10; k++) { const f = k / 10; a.tube([[cx, y0 + (y1 - y0) * f, z0 + (z1 - z0) * f], [cx, y0 + (y1 - y0) * f + 4, z0 + (z1 - z0) * f + 4]], [tr * 1.12, tr * 1.12], 14); }
  a.tube([[cx - tr * 0.9, y0 + 120, z0 - 40], [cx - tr * 0.9, y1, z1 - tr * 0.8]], [14, 14], 5); a.tube([[cx + tr * 0.9, y0 + 120, z0 - 40], [cx + tr * 0.9, y1, z1 - tr * 0.8]], [14, 14], 5);
  a.tube([[cx, y0 + 200, z0 - tr * 1.8], [cx, y1 - 200, z1 - tr * 1.8]], [14, 14], 5);
  for (let k = 0; k < 9; k++) { const f = 0.05 + k * 0.1, y = y0 + (y1 - y0) * f, z = z0 + (z1 - z0) * f; a.tube([[cx - tr * 0.9, y, z - 20], [cx, y, z - tr * 1.8]], [8, 8], 4); a.tube([[cx + tr * 0.9, y, z - 20], [cx, y, z - tr * 1.8]], [8, 8], 4); }
  a.box(cx - tr * 2.2, y0 - 100, z0 - tr, cx + tr * 2.2, y0 + 360, z0 + tr * 1.4); a.box(cx - tr * 2.6, y0 - 100, z0 + tr * 1.4, cx + tr * 2.6, y0 + 360, z0 + tr * 1.6);
  prismX(a, [[y1 - 150, z1 - tr * 1.2], [y1 + 20, z1 - tr * 2.6], [y1 + 20, z1 - tr * 2.6 + 20], [y1 - 150, z1 - tr * 1.2 + 20]], cx - tr * 0.8, cx + tr * 0.8);
  const gx = W / 2 - 160;
  for (const s of [-1, 1]) tyre(a, cx + s * gx, mid, wr, 200, 12); a.xcyl(cx - gx, cx + gx, mid, Z0 + wr, 30, 8); a.tube([[cx - gx * 0.8, mid, Z0 + wr], [cx - tr * 0.9, mid, mz]], [20, 20], 6); a.tube([[cx + gx * 0.8, mid, Z0 + wr], [cx + tr * 0.9, mid, mz]], [20, 20], 6);
  a.tube([[cx, y0 + 80, z0 - tr], [cx, YF + 20, Z0 + 150]], [24, 24], 6); a.box(cx - 70, YF, Z0 + 100, cx + 70, YF + 60, Z0 + 230);
  a.box(cx + tr * 1.2, y0 + 50, z0 - 300, cx + tr * 1.2 + 360, y0 + 360, z0 - 40); a.cyl(cx + tr * 2.4, y0 + 220, z0 - 40, z0 + 80, 70, 10);
  a.box(cx - 200, mid + 120, mz - 80, cx - 40, mid + 320, mz + 100); a.cyl(cx - 120, mid + 220, mz + 100, mz + 160, 60, 10);
  a.rect(cx - tr, y0, cx + tr, y1, 'EQUIP'); a.rect(cx - tr * 2.2, y0 - 100, cx + tr * 2.2, y0 + 360, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.rect(cx + s * gx - 100, mid - wr, cx + s * gx + 100, mid + wr, 'EQUIP-DETAIL'); a.line(cx, y0, cx, YF + 20, 'EQUIP-DETAIL'); a.outline('EQUIP-DETAIL');
  a.log('Added the ' + v.tube + ' in tube with flight rings and a truss, the lower hopper, upper spout, axle with wheels and lift struts, hitch, drive motor and the lift winch (plan and 3D).');
}
const augers = fam({ cat: 'agriculture/irrigation', title: 'Generic portable grain auger', desc: (v) => `Portable grain auger, ${v.ft} ft: ${v.tube} in tube on a truss with a lower hopper and an upper spout, axle with wheels, hitch, drive motor and a lift winch.`, build: auger, vs: [
  ['31 ft, 6 in tube', 70, 400, 170, 0, { ft: 31, tube: 6 }], ['41 ft, 8 in tube', 76, 520, 210, 0, { ft: 41, tube: 8 }], ['51 ft, 8 in tube', 80, 620, 250, 0, { ft: 51, tube: 8 }], ['61 ft, 10 in tube', 86, 740, 290, 0, { ft: 61, tube: 10 }], ['71 ft, 13 in tube', 94, 860, 330, 0, { ft: 71, tube: 13 }] ] });

/** Grain bucket elevator: a tall rectangular leg on a boot with an inlet hopper, a head with a discharge spout and a motor platform, a caged ladder, inspection doors and guy-stay braces. */
function elevator(a, v) {
  const { X0, X1, YF, YB, Z0, cx, cy, W, D, H } = a, lw = W * 0.3, ld = D * 0.34, hz = Z0 + H - 600, bz = Z0 + 500;
  a.box(cx - lw, cy - ld, bz, cx + lw, cy + ld, hz);
  for (let k = 1; k < v.secs; k++) { const z = bz + (hz - bz) * k / v.secs; a.box(cx - lw - 14, cy - ld - 14, z - 14, cx + lw + 14, cy + ld + 14, z + 14); }
  a.box(cx - lw - 40, cy - ld - 40, Z0, cx + lw + 40, cy + ld + 40, bz); a.box(cx - lw - 160, cy - ld - 160, Z0, cx + lw + 160, cy + ld + 160, 70);
  prismY(a, [[cx - lw - 400, bz + 400], [cx - lw, bz + 120], [cx - lw, bz - 100], [cx - lw - 100, bz - 100]], cy - ld, cy + ld);
  a.box(cx - lw - 40, cy - ld - 40, hz, cx + lw + 40, cy + ld + 40, hz + 600); prismY(a, [[cx - lw - 40, hz + 600], [cx + lw + 40, hz + 600], [cx + lw + 40, hz + 640], [cx - lw - 40, hz + 640]], cy - ld - 60, cy + ld + 60);
  a.tube([[cx + lw, cy, hz + 380], [cx + lw + 380, cy, hz + 40], [cx + lw + 380, cy, hz - 400]], [160, 160, 160], 10);
  a.box(cx - lw - 700, cy - ld, hz - 500, cx - lw - 40, cy + ld, hz - 460); a.box(cx - lw - 700, cy - 200, hz - 460, cx - lw - 200, cy + 200, hz - 100); a.xcyl(cx - lw - 700, cx - lw - 200, cy, hz - 280, 140, 14);
  for (const s of [-1, 1]) { a.tube([[cx - lw - 40, cy + s * ld * 0.8, hz - 20], [cx - lw - 700, cy + s * ld, hz - 460]], [14, 14], 5); }
  ladder(a, cx, cy + ld + 120, Z0, cy + ld + 120, hz, 460, m.floor((hz - Z0) / 300));
  for (let k = 0; k < m.floor((hz - Z0) / 900); k++) { const z = Z0 + 700 + k * 900; for (const t of [-1, 1]) a.tube([[cx - 240, cy + ld + 120 + 0, z], [cx - 240, cy + ld + 120 + 0, z + 5]], [4, 4], 3); }
  a.box(cx - 200, cy - ld - 50, bz + 300, cx + 200, cy - ld - 30, bz + 800); a.box(cx - 200, cy - ld - 50, hz - 900, cx + 200, cy - ld - 30, hz - 400);
  for (const s of [-1, 1]) { a.tube([[cx + s * lw, cy - ld, hz - 200], [cx + s * (lw + 800), cy - ld - 700, Z0]], [10, 10], 4); }
  a.rect(cx - lw, cy - ld, cx + lw, cy + ld, 'EQUIP'); a.rect(cx - lw - 160, cy - ld - 160, cx + lw + 160, cy + ld + 160, 'EQUIP-DETAIL'); a.rect(cx - lw - 700, cy - 200, cx - lw - 200, cy + 200, 'EQUIP-DETAIL'); a.outline('EQUIP-DETAIL');
  a.log('Added the boot with an inlet hopper, the leg in ' + v.secs + ' bolted sections with inspection doors, the head with a discharge spout and the motor platform, a caged ladder and guy stays (plan and 3D).');
}
const elevators = fam({ cat: 'agriculture/irrigation', title: 'Generic grain bucket elevator', desc: (v) => `Grain bucket elevator, ${v.ft} ft: boot with an inlet hopper, a leg in ${v.secs} bolted sections with inspection doors, a head with a discharge spout, a motor platform, a ladder and guy stays.`, build: elevator, vs: [
  ['40 ft leg', 120, 80, 520, 0, { ft: 40, secs: 4 }], ['60 ft leg', 130, 84, 760, 0, { ft: 60, secs: 6 }], ['80 ft leg', 140, 88, 1000, 0, { ft: 80, secs: 8 }], ['100 ft leg', 150, 92, 1240, 0, { ft: 100, secs: 10 }] ] });

/** Grain aeration fan: a centrifugal scroll housing with an inlet cone and guard, a motor on a base frame, a transition to a round discharge duct with a clamp collar. */
function aerFan(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, sr = H * 0.4, sz = Z0 + H * 0.52, sy = YF + D * 0.4;
  a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 70);
  for (const x of [X0 + 100, X1 - 100]) a.box(x - 30, YF + 60, Z0 + 70, x + 30, YB - 60, Z0 + 150);
  a.ycyl(sy - 160, sy + 160, cx, sz, sr, 26); a.ycyl(sy - 220, sy - 160, cx, sz, sr * 0.7, 22);
  for (let k = 0; k < 8; k++) { const t = (k / 8) * 2 * PI; a.tube([[cx + sr * 0.62 * m.cos(t), sy - 224, sz + sr * 0.62 * m.sin(t)], [cx, sy - 250, sz]], [6, 6], 4); }
  a.cone(cx, sy - 250, sz, sz + 0.01, 1, 1, 3); a.ycyl(sy - 270, sy - 220, cx, sz, sr * 0.72, 22);
  a.box(cx - sr * 0.3, sy - 160, Z0 + 150, cx + sr * 0.3, sy + 160, sz - sr * 0.4);
  a.xcyl(cx + sr * 0.4, cx + sr * 1.4, sy + 280, sz, sr * 0.38, 16); a.box(cx + sr * 1.4, sy + 240, sz - 60, cx + sr * 1.5, sy + 320, sz + 60);
  a.ycyl(sy + 160, sy + 320, cx, sz, sr * 0.48, 20); a.box(cx - sr * 0.3, sy + 160, sz - sr * 0.4, cx + sr * 0.3, sy + 320, sz + sr * 0.4);
  const dx = X1 - 340; a.box(cx + sr * 0.4, sy - 140, sz, dx - 40, sy + 140, sz + sr * 0.9);
  a.xcyl(cx + sr * 0.9, cx + sr * 1.6, sy, sz + sr * 0.5, sr * 0.48, 20);
  a.box(cx - sr * 0.15, sy - 320, Z0 + H * 0.78, cx + sr * 0.15, sy - 200, Z0 + H * 0.78 + 160);
  a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL'); a.circ(cx, sy, sr, 'EQUIP'); a.rect(cx + sr * 0.4, sy - 140, dx - 40, sy + 140, 'EQUIP'); a.rect(cx + sr * 0.4, sy + 240, cx + sr * 1.5, sy + 320, 'EQUIP-DETAIL'); a.outline('EQUIP-DETAIL');
  a.log('Added the base frame and skids, the scroll housing with an inlet cone and a guard, the motor on its mount, the discharge transition duct and clamp collar (plan and 3D).');
}
const aerFans = fam({ cat: 'agriculture/irrigation', title: 'Generic grain aeration fan', desc: (v) => `Grain bin aeration fan, ${v.hp} hp class: base frame on skids, centrifugal scroll housing with an inlet cone and guard, a motor on a mount and a discharge duct.`, build: aerFan, vs: [
  ['3 hp', 54, 38, 36, 0, { hp: 3 }], ['5 hp', 60, 42, 40, 0, { hp: 5 }], ['7.5 hp', 68, 46, 44, 0, { hp: 7.5 }], ['10 hp', 74, 50, 48, 0, { hp: 10 }] ] });

/** Fertigation skid: a steel skid with two tall chemical tanks, an injector pump with a motor, a manifold of pipes with valves, a pressure gauge and a control box on a post. */
function fertSkid(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D, H } = a, tr = v.tr * IN, n = v.tanks, tz1 = Z0 + H * 0.78;
  a.box(X0 + 10, YF + 10, Z0, X1 - 10, YB - 10, Z0 + 60);
  for (const x of [X0 + 10, X1 - 10 - 50]) a.box(x, YF + 10, Z0 + 60, x + 50, YB - 10, Z0 + 110);
  for (let k = 0; k < n; k++) { const x = X0 + 40 + tr + (W - 80 - 2 * tr) * (n > 1 ? k / (n - 1) : 0.5) * 0.7, y = YB - tr - 80; a.cyl(x, y, Z0 + 110, tz1, tr, 24); a.cone(x, y, tz1, tz1 + H * 0.05, tr, tr * 0.5, 24); a.cyl(x, y, tz1 + H * 0.05, tz1 + H * 0.08, tr * 0.3, 12); a.cyl(x, y, Z0 + 110, Z0 + 150, tr * 1.04, 24); a.tube([[x + tr, y, Z0 + 250], [x + tr + 80, y, Z0 + 250]], [30, 30], 8); a.tube([[x + tr * 1.05, y - 12, Z0 + 160], [x + tr * 1.05, y - 12, tz1 - 60]], [10, 10], 4); a.circ(x, y, tr, 'EQUIP'); }
  const px = X1 - 780, py = YF + 280;
  a.box(px - 150, py - 130, Z0 + 110, px + 150, py + 130, Z0 + 330); a.xcyl(px + 150, px + 520, py, Z0 + 220, 90, 14); a.box(px + 520, py - 110, Z0 + 130, px + 700, py + 110, Z0 + 330);
  a.tube([[px - 140, py, Z0 + 330], [px - 140, py, Z0 + 520], [X0 + 60, py, Z0 + 520]], [24, 24, 24], 8); a.tube([[px + 100, py, Z0 + 330], [px + 100, py, Z0 + 640], [X0 + 60, py, Z0 + 640]], [26, 26, 26], 8);
  for (const [x, z] of [[X0 + 260, Z0 + 520], [X0 + 260, Z0 + 640]]) { a.box(x - 40, py - 30, z - 50, x + 40, py + 30, z + 50); a.tube([[x, py, z + 50], [x, py, z + 180]], [8, 8], 4); a.xcyl(x - 50, x + 50, py, z + 180, 22, 12); }
  a.cyl(px - 140, py + 120, Z0 + 520, Z0 + 600, 60, 14); a.circ(px - 140, py + 120, 60, 'EQUIP-DETAIL');
  a.tube([[X0 + 100, YB - 120, Z0 + 60], [X0 + 100, YB - 120, Z0 + H]], [20, 20], 6); a.box(X0 + 20, YB - 140, Z0 + H * 0.7, X0 + 220, YB - 100, Z0 + H);
  a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL'); a.rect(px - 150, py - 130, px + 700, py + 130, 'EQUIP-DETAIL'); a.line(X0 + 60, py, px - 150, py, 'EQUIP-DETAIL'); a.outline();
  a.log('Added the steel skid, ' + n + ' chemical tanks with cone lids and outlets, the injector pump and motor, suction and discharge manifolds with valves and a pressure gauge, and a control box on a post (plan and 3D).');
}
const fertSkids = fam({ cat: 'agriculture/irrigation', title: 'Generic fertigation injector skid', desc: (v) => `Fertigation skid with ${v.tanks} chemical tanks (${v.gal} gallon), an injector pump and motor, suction and discharge manifolds with valves, a pressure gauge and a control box.`, build: fertSkid, vs: [
  ['1 tank, 50 gallon', 60, 46, 54, 0, { tanks: 1, gal: 50, tr: 9 }], ['2 tanks, 100 gallon', 90, 56, 62, 0, { tanks: 2, gal: 100, tr: 12 }], ['3 tanks, 200 gallon', 120, 64, 72, 0, { tanks: 3, gal: 200, tr: 15 }], ['4 tanks, 300 gallon', 150, 72, 80, 0, { tanks: 4, gal: 300, tr: 17 }] ] });
export default [cultivators, harrowsP, mowers, manures, slurries, carts, loaders, baleTrailers, utils, poultryH, freeStalls, farmStands, cribs, leanTos, slurryStores, coldBoxes, sheds, bunks, sheepRacks, farrowings, pigArcs, hives, headlocks, chutes, goatSheds, henFeeders, windmills, solarPumps, hydrants, pivotPoints, pipeTrailers, augers, elevators, aerFans, fertSkids];

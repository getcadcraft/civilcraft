/* SPDX-License-Identifier: Apache-2.0 */
/** Round 5, aviation: aircraft by type and size class, ground support equipment, airfield, hangar and maintenance, rescue and fire fighting. Original geometry; scale shapes, not particular aircraft or vehicles. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, FT = 304.8, m = Math;
const R2 = (n) => m.round(n * 10) / 10;

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
/** a wheel on a lateral axle at (x, y), radius r resting on the floor (or at height zc), width w */
function whl(a, x, y, r, w = 150, zc = null) { const z = zc ?? a.Z0 + r; a.xcyl(x - w / 2, x + w / 2, y, z, r, 16); a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL'); a.xcyl(x - w / 2 - 4, x + w / 2 + 4, y, z, r * 0.45, 10); }
function wheelPairs(a, ys, r, w = 150, inset = 10) { for (const y of ys) for (const sx of [a.X0 + inset + w / 2, a.X1 - inset - w / 2]) whl(a, sx, y, r, w); }
/** a post-and-rail from (x0,y0) to (x1,y1) */
function rail(a, x0, y0, x1, y1, z0, z1, t = 14, posts = 3) {
  a.tube([[x0, y0, z1], [x1, y1, z1]], [t, t], 6);
  for (let i = 0; i < posts; i++) { const f = posts === 1 ? 0 : i / (posts - 1); a.tube([[x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z0], [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z1]], [t * 0.8, t * 0.8], 6); }
  a.line(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
/** a lattice of cross braces between two x positions on a y plane */
function brace(a, x0, x1, y, z0, z1, t = 10) { a.tube([[x0, y, z0], [x1, y, z1]], [t, t], 5); a.tube([[x1, y, z0], [x0, y, z1]], [t, t], 5); }
/** a truck front: frame rails, cab block with hood, windscreen, bumper, lamps and wheel pairs. o: cabL, cabH, ground, wr, axles, nose */
function cabTruck(a, o) {
  const { X0, X1, YF, YB, Z0, cx, W } = a, gz = Z0 + (o.ground ?? 450);
  a.box(X0 + 110, YF + 60, gz, X1 - 110, YB - 40, gz + 260);
  const nose = o.nose ?? 650;
  a.box(X0 + 80, YF + nose, gz + 140, X1 - 80, YF + o.cabL, Z0 + o.cabH); a.box(X0 + 120, YF + 30, gz + 140, X1 - 120, YF + nose, gz + 800);
  a.frame(X0 + 140, Z0 + o.cabH * 0.55, X1 - 140, Z0 + o.cabH - 160, YF + nose - 6, YF + nose + 20, 40);
  for (const sx of [-1, 1]) { a.box(cx + sx * (W / 2 - 80) - 8, YF + nose + 300, Z0 + o.cabH * 0.55, cx + sx * (W / 2 - 80) + 8, YF + o.cabL - 200, Z0 + o.cabH - 160); a.box(cx + sx * (W / 2 + 10) - 12, YF + nose + 120, Z0 + o.cabH * 0.6, cx + sx * (W / 2 + 10) + 12, YF + nose + 200, Z0 + o.cabH * 0.6 + 400); }
  a.box(X0 + 60, YF, gz, X1 - 60, YF + 70, gz + 220); for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 330) - 110, YF + 22, gz + 480, cx + sx * (W / 2 - 330) + 110, YF + 40, gz + 600);
  a.rect(X0 + 80, YF + 30, X1 - 80, YF + o.cabL, 'EQUIP-DETAIL'); a.line(X0 + 80, YF + nose, X1 - 80, YF + nose, 'EQUIP-DETAIL');
  wheelPairs(a, o.axles.map((y) => YF + y), o.wr, 300, 20);
  return a;
}
/** a beacon on a short stalk */
function beacon(a, x, y, z, r = 70) { a.cyl(x, y, z, z + r * 0.5, r * 0.6, 8); a.ell(x, y, z + r * 0.5, r, r, r * 0.9, 10, 5); a.circ(x, y, r, 'EQUIP-DETAIL'); }
/** a hose coil / reel drum on a lateral axle */
function reel(a, x0, x1, y, z, r) { a.xcyl(x0, x1, y, z, r, 14); a.xcyl(x0 - 10, x0 + 10, y, z, r * 1.25, 14); a.xcyl(x1 - 10, x1 + 10, y, z, r * 1.25, 14); a.xcyl(x0, x1, y, z, r * 0.4, 8); a.rect(x0, y - r, x1, y + r, 'EQUIP-DETAIL'); }
/** a small ladder on the Y-Z plane at x, from y0 (low) to y1 (high) */
function ladder(a, x, y0, z0, y1, z1, w = 400, rungs = 6) {
  for (const s of [-1, 1]) a.tube([[x + s * w / 2, y0, z0], [x + s * w / 2, y1, z1]], [12, 12], 5);
  for (let i = 0; i <= rungs; i++) { const f = i / rungs; a.box(x - w / 2, y0 + (y1 - y0) * f - 10, z0 + (z1 - z0) * f - 8, x + w / 2, y0 + (y1 - y0) * f + 10, z0 + (z1 - z0) * f + 8); }
  a.line(x - w / 2, y0, x - w / 2, y1, 'EQUIP-DETAIL'); a.line(x + w / 2, y0, x + w / 2, y1, 'EQUIP-DETAIL');
}
/** a stair run going up toward +Y... from (x, y0, z0) to (y1, z1) with width w and n treads, closed stringers */
function stairs(a, x, y0, z0, y1, z1, w, n) {
  prismX(a, [[y0, z0], [y1, z1 - 30], [y1, z1 - 90], [y0, z0 + 0.01 + 2]].slice(0, 4), x - w / 2 - 25, x - w / 2);
  prismX(a, [[y0, z0], [y1, z1 - 30], [y1, z1 - 90], [y0, z0 + 2]], x + w / 2, x + w / 2 + 25);
  for (let i = 0; i < n; i++) { const f = (i + 1) / n, y = y0 + (y1 - y0) * f, z = z0 + (z1 - z0) * f; a.box(x - w / 2, y - (y1 - y0) / n, z - 20, x + w / 2, y, z); }
  a.rect(x - w / 2 - 25, m.min(y0, y1), x + w / 2 + 25, m.max(y0, y1), 'EQUIP-DETAIL');
  for (let i = 1; i < n; i++) { const y = y0 + ((y1 - y0) * i) / n; a.line(x - w / 2, y, x + w / 2, y, 'EQUIP-DETAIL'); }
}

// ------------------------------------------------------------------------------------------ aircraft
/**
 * A generic aircraft: fuselage tube, wings, engines, tail and gear. Nose at −Y. o: fd (mm fuselage diameter), gear (mm), wing {r,c0,c1,sw}, eng 'wing'|'aft'|'prop'|'nose'|'wingnose'|'none',
 * ne (engines, 2 or 4), hi (high wing), tt (T-tail), st (fuselage stations), wt (wing thickness), er (engine radius), strut, fixed (fixed gear), tail (tailwheel), bogie, nowin, cargo, floats, winglet, twinprop.
 */
function plane(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, R = o.fd / 2, zc = Z0 + o.gear + R, S2 = W / 2;
  const st = o.st ?? [[0, 0.1], [0.025, 0.5], [0.07, 0.82], [0.12, 0.97], [0.18, 1], [0.6, 1], [0.78, 0.8], [0.92, 0.45], [1, 0.1]];
  a.tube(st.map(([f]) => [cx, YF + f * L, zc + (f > 0.6 ? ((f - 0.6) / 0.4) * R * 0.4 : 0)]), st.map(([, r]) => R * r), 20);
  a.ellp(cx, (YF + YB) / 2, R, L / 2); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL');
  if (!o.nowin) for (const sx of [-1, 1]) a.box(cx + sx * (R * 0.97) - 4, YF + L * 0.22, zc + R * 0.18, cx + sx * (R * 0.97) + 4, YF + L * 0.62, zc + R * 0.32);
  a.box(cx - R * 0.65, YF + L * (o.nose ? 0.1 : 0.045), zc + R * 0.3, cx + R * 0.65, YF + L * (o.nose ? 0.14 : 0.075), zc + R * 0.62);
  if (o.cargo) { for (const sx of [-1, 1]) { a.box(cx + sx * R * 0.96 - 8, YF + L * 0.2, zc - R * 0.35, cx + sx * R * 0.96 + 8, YF + L * 0.31, zc + R * 0.55); } a.box(cx - R * 0.5, YF + L * 0.5, zc - R * 0.3, cx + R * 0.5, YF + L * 0.5 + 10, zc + R * 0.5); }
  // wings
  const w = o.wing, wt = o.wt ?? 90, yr = YF + L * w.r, zw = o.hi ? zc + R * 0.85 : zc - R * 0.55, sweep = w.sw * L;
  for (const s of [-1, 1]) {
    const pts = [[cx + s * R * 0.8, yr], [cx + s * S2, yr + sweep], [cx + s * S2, yr + sweep + w.c1 * L], [cx + s * R * 0.8, yr + w.c0 * L]];
    a.prism(s > 0 ? pts : pts.slice().reverse(), zw, zw + wt);
    a.poly(pts);
    if (o.winglet) a.box(cx + s * S2 - 14, yr + sweep, zw + wt, cx + s * S2, yr + sweep + w.c1 * L, zw + wt + 420);
    if (o.strut) a.tube([[cx + s * R * 0.7, yr + w.c0 * L * 0.5, zc - R * 0.75], [cx + s * S2 * 0.5, yr + (sweep + w.c0 * L) * 0.5, zw]], [16, 16], 6);
    if (o.floats) { const fx = cx + s * R * 2.4; a.ell(fx, YF + L * 0.5, Z0 + 250, 260, L * 0.3, 250, 12, 7); a.ellp(fx, YF + L * 0.5, 260, L * 0.3); a.tube([[cx + s * R * 0.7, yr + 400, zc - R * 0.6], [fx, YF + L * 0.4, Z0 + 400]], [16, 16], 6); a.tube([[cx + s * R * 0.7, yr + 400, zc - R * 0.6], [fx, YF + L * 0.6, Z0 + 400]], [16, 16], 6); }
  }
  // engines
  const er = o.er ?? R * 0.32;
  if (o.eng === 'wing' || o.eng === 'prop') {
    const xs = o.ne === 4 ? [0.33, 0.62] : [0.38];
    for (const f of xs) for (const s of [-1, 1]) {
      const x = cx + s * S2 * f, y0 = yr + sweep * f - er * (o.eng === 'prop' ? 1.8 : 2.8), len = er * (o.eng === 'prop' ? 5.5 : 5), zE = o.hi ? zw - er * 0.2 : zw - er * 1.1;
      a.tube([[x, y0, zE], [x, y0 + len * 0.15, zE], [x, y0 + len * 0.9, zE], [x, y0 + len, zE]], [er * 0.85, er, er, er * 0.5], 16);
      a.box(x - 20, y0 + len * 0.25, o.hi ? zE : zE + er * 0.5, x + 20, y0 + len * 0.85, o.hi ? zw : zw + 5);
      a.rect(x - er, y0, x + er, y0 + len, 'EQUIP'); a.circ(x, y0, er, 'EQUIP-DETAIL');
      if (o.eng === 'prop') { const pr = er * 2.0; a.box(x - 25, y0 - 40, zE - pr, x + 25, y0 - 10, zE + pr); a.box(x - pr, y0 - 40, zE - 25, x + pr, y0 - 10, zE + 25); a.ell(x, y0 - 40, zE, 70, 70, 70, 8, 5); a.line(x - pr, y0 - 25, x + pr, y0 - 25, 'EQUIP-DETAIL'); }
    }
  } else if (o.eng === 'aft') {
    for (const s of [-1, 1]) { const x = cx + s * (R + er * 0.9), y0 = YF + L * 0.62, len = er * 5.2, zE = zc + R * 0.35; a.tube([[x, y0, zE], [x, y0 + len * 0.2, zE], [x, y0 + len * 0.9, zE], [x, y0 + len, zE]], [er * 0.8, er, er, er * 0.45], 14); a.box(x - 18 * s, y0 + len * 0.2, zE - er * 0.2, cx + s * R * 0.7, y0 + len * 0.8, zE + er * 0.2); a.rect(x - er, y0, x + er, y0 + len, 'EQUIP'); a.circ(x, y0, er, 'EQUIP-DETAIL'); }
  }
  if (o.eng === 'nose') {   // a cowl and a two-blade propeller at the nose
    const cl = L * 0.12; a.cone(cx, YF + 70, zc, zc + 0.01, 1, 1, 3);
    a.ycyl(YF + 70, YF + 70 + cl, cx, zc, R * 0.85, 16); a.ell(cx, YF + 80, zc, R * 0.3, 90, R * 0.3, 10, 5);
    const pr = o.pr ?? R * 1.5; a.box(cx - 30, YF + 20, zc - pr, cx + 30, YF + 48, zc + pr); a.line(cx - pr, YF + 30, cx + pr, YF + 30, 'EQUIP-DETAIL'); a.circ(cx, YF + 34, R * 0.85, 'EQUIP-DETAIL');
  }
  if (o.eng === 'wingnose') {  // two tractor props on the wings of a light twin
    for (const s of [-1, 1]) { const x = cx + s * S2 * 0.3, y0 = yr - 380, len = 1500, zE = zw + wt * 0.5; a.tube([[x, y0, zE], [x, y0 + 100, zE], [x, y0 + len, zE], [x, y0 + len + 300, zE]], [er * 0.8, er, er, er * 0.4], 12); a.rect(x - er, y0, x + er, y0 + len + 300); const pr = er * 2.6; a.box(x - 25, y0 - 40, zE - pr, x + 25, y0 - 12, zE + pr); a.ell(x, y0 - 30, zE, 60, 60, 60, 8, 5); a.line(x - pr, y0 - 25, x + pr, y0 - 25, 'EQUIP-DETAIL'); }
  }
  // tail: fin and stabilisers
  const fy0 = YB - L * 0.2, fy1 = YB - L * 0.03, zf0 = zc + R * 0.6, zTop = Z1;
  prismX(a, [[fy0 - L * 0.012, zf0 - 40], [fy1, zf0 - 40], [fy1, zTop - 20], [fy0 + (fy1 - fy0) * 0.35, zTop]], cx - 38, cx + 38);
  a.rect(cx - 38, fy0, cx + 38, fy1, 'EQUIP-DETAIL');
  const sz = o.tt ? zTop - 40 : zc + R * 0.55, ss = o.stab ?? S2 * 0.36, sy = YB - L * 0.13;
  for (const s of [-1, 1]) { const pts = [[cx + s * 30, sy], [cx + s * ss, sy + L * 0.04], [cx + s * ss, sy + L * 0.085], [cx + s * 30, sy + L * 0.105]]; a.prism(s > 0 ? pts : pts.slice().reverse(), sz, sz + 50); a.poly(pts); }
  // gear
  const gz = Z0 + o.gear;
  if (!o.floats) {
    const gr = o.gr ?? 330, gx = o.gx ?? R * 1.3;
    for (const s of [-1, 1]) {
      const x = cx + s * gx, y = yr + L * 0.075 + sweep * (gx / S2), ys = o.bogie ? [y - gr * 1.9, y, y + gr * 1.9] : [y];
      a.tube([[x, y, gz + gr * 0.5], [x, y, o.fixed ? zc - R * 0.4 : zw]], [28, 28], 8);
      for (const yy of ys) { a.xcyl(x - gr * 0.45, x + gr * 0.45, yy, Z0 + gr, gr, 16); a.rect(x - gr * 0.45, yy - gr, x + gr * 0.45, yy + gr, 'EQUIP-DETAIL'); }
    }
    if (o.tail) { a.tube([[cx, YB - L * 0.08, zc], [cx, YB - L * 0.08, Z0 + 100]], [14, 14], 6); a.xcyl(cx - 25, cx + 25, YB - L * 0.08, Z0 + 90, 90, 8); }
    else { a.tube([[cx, YF + L * 0.1, gz + 120], [cx, YF + L * 0.1, zc - R * 0.5]], [24, 24], 8); const nr = gr * 0.8; a.xcyl(cx - nr * 0.4, cx + nr * 0.4, YF + L * 0.1, Z0 + nr, nr, 14); }
  }
  a.log(o.log ?? 'Added the fuselage, cockpit and window bands, wings, engines, fin, tailplanes and landing gear (plan and 3D).');
}

/** a helicopter: cabin, tail boom, fin, tail rotor, mast and blades, skids or wheels. o: nb (blades), skids, ne (engines), cabin radii */
function heli(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, Rr = W / 2, my = YF + m.min(Rr * 0.98, L * 0.55), cw = o.cw, ch = o.ch, gz = Z0 + o.gear;
  const ny = my - o.noseOff, cl = o.cl;    // nose y, cabin length
  const zc = gz + ch / 2 + 60;
  a.ell(cx, ny + cl * 0.5, zc, cw / 2, cl / 2, ch / 2, 18, 10);
  a.ell(cx, ny + cl * 0.3, zc + ch * 0.25, cw * 0.38, cl * 0.2, ch * 0.28, 12, 6);
  a.ellp(cx, ny + cl * 0.5, cw / 2, cl / 2);
  const bz = zc + ch * 0.18, bt = o.bt ?? 150;
  a.tube([[cx, ny + cl * 0.85, bz], [cx, ny + cl + (YB - ny - cl) * 0.5, bz + 40], [cx, YB - 260, bz + o.tailUp * 0.5]], [cw * 0.28, bt * 0.8, bt * 0.5], 10);
  a.line(cx, ny + cl, cx, YB - 200, 'EQUIP-DETAIL');
  prismX(a, [[YB - 650, bz + 20], [YB - 120, bz + o.tailUp - 60], [YB - 20, bz + o.tailUp + 380], [YB - 440, bz + o.tailUp + 380]].slice(0, 4), cx - 30, cx + 30);
  a.rect(cx - 30, YB - 650, cx + 30, YB - 20, 'EQUIP-DETAIL');
  const tz = bz + o.tailUp + 100;   // tail rotor: a two-blade disc on the left side of the fin
  a.xcyl(cx + 40, cx + 150, YB - 160, tz, 55, 10);
  a.box(cx + 130, YB - 160 - 25, tz - 360, cx + 150, YB - 160 + 25, tz + 360);
  const mz = zc + ch / 2 + o.mastH;
  a.box(cx - cw * 0.3, my - o.cowl / 2, zc + ch * 0.35, cx + cw * 0.3, my + o.cowl / 2, mz - o.mastH * 0.6);
  a.cyl(cx, my, zc + ch * 0.4, mz, 70, 10); a.cyl(cx, my, mz, mz + 90, 150, 12);
  if (o.ne === 2) for (const s of [-1, 1]) a.ycyl(my - o.cowl * 0.1, my + o.cowl * 0.7, cx + s * cw * 0.28, zc + ch * 0.5, 190, 10);
  const nb = o.nb;
  for (let i = 0; i < nb; i++) {
    const g = (i / nb) * m.PI * 2 + 0.35, bx = m.cos(g) * (Rr - 40), by = m.sin(g) * (Rr - 40);
    const px = -m.sin(g) * 130, py = m.cos(g) * 130, yb = by, ok = my + by - 40 > YF && my + by + 40 < YB;
    const tx = cx + bx, ty = ok ? my + yb : my + m.sign(yb) * m.min(m.abs(yb), (yb < 0 ? my - YF : YB - my) - 60);
    a.prism([[cx + px * 0.6, my + py * 0.6], [tx + px, ty + py], [tx - px, ty - py], [cx - px * 0.6, my - py * 0.6]], mz + 90, mz + 130);
  }
  a.circ(cx, my, Rr - 20, 'EQUIP-HIDDEN'); a.circ(cx, my, 170, 'EQUIP-DETAIL');
  if (o.skids) {
    for (const s of [-1, 1]) { const x = cx + s * (cw * 0.62), y0 = ny + cl * 0.02, y1 = ny + cl * 0.98; a.tube([[x, y0 - 120, Z0 + 140], [x, y0, Z0 + 40], [x, y1, Z0 + 40], [x, y1 + 120, Z0 + 140]].map((p) => p), [28, 28, 28, 28], 8); for (const y of [ny + cl * 0.3, ny + cl * 0.72]) a.tube([[x, y, Z0 + 40], [cx + s * cw * 0.3, y, gz + ch * 0.3]], [22, 22], 6); a.line(x, y0, x, y1, 'EQUIP-DETAIL'); }
  } else {
    for (const s of [-1, 1]) { const x = cx + s * cw * 0.45, y = ny + cl * 0.55; a.tube([[x, y, zc - ch * 0.3], [x + s * 60, y, Z0 + 220]], [30, 30], 8); a.xcyl(x + s * 60 - 60, x + s * 60 + 60, y, Z0 + 220, 220, 12); a.rect(x + s * 60 - 60, y - 220, x + s * 60 + 60, y + 220, 'EQUIP-DETAIL'); }
    a.tube([[cx, ny + cl * 0.15, zc - ch * 0.3], [cx, ny + cl * 0.15, Z0 + 180]], [26, 26], 8); a.xcyl(cx - 40, cx + 40, ny + cl * 0.15, Z0 + 180, 180, 12);
  }
  a.log(o.log ?? 'Added the cabin, tail boom with fin and tail rotor, engine cowl, mast, rotor blades and landing skids or wheels (plan and 3D).');
}

const FAMS = [
  // ===================================================== aircraft =====================================================
  fam({ cat: 'aviation/aircraft', title: 'Generic light single-engine aircraft',
    desc: (v) => `Light single-engine ${v.seats}-seat aircraft shape, ${v.len} ft long with a ${v.span} ft span: a slim fuselage, ${v.hi ? 'a high wing with two struts' : 'a low straight wing'}, a nose-mounted two-blade propeller, a fin with tailplanes and ${v.tail ? 'main wheels with a tail wheel' : 'fixed tricycle gear'}.`,
    vs: [['two seat, high wing, 23 ft', 23, 30, 8, 2, true, false], ['four seat, high wing, 27 ft', 27, 36, 9, 4, true, false], ['six seat, high wing, 28 ft', 28, 36, 9.5, 6, true, false], ['four seat, low wing, 26 ft', 26, 35, 8.5, 4, false, false], ['two seat, tail wheel, 22 ft', 22, 34, 7.5, 2, true, true]]
      .map(([l, len, span, h, seats, hi, tail]) => [l, span * 12, len * 12, h * 12, 0, { len, span, seats, hi, tail }]),
    build: (a, v) => plane(a, { fd: 1150, gear: 480, hi: v.hi, strut: v.hi, fixed: true, tail: v.tail, eng: 'nose', nowin: true, nose: true, gr: 230, gx: 1050, wt: 130, wing: { r: 0.3, c0: 0.1, c1: 0.075, sw: 0.0 }, stab: a.W * 0.17, pr: 950,
      st: [[0, 0.5], [0.04, 0.8], [0.13, 1], [0.4, 1], [0.7, 0.55], [0.9, 0.3], [1, 0.12]], log: 'Added the fuselage and windscreen, nose cowl and propeller, wings' + (v.hi ? ' with struts' : '') + ', fin, tailplanes and fixed landing gear (plan and 3D).' }) }),

  fam({ cat: 'aviation/aircraft', title: 'Generic light twin-engine aircraft',
    desc: (v) => `Light twin-engine ${v.seats}-seat aircraft shape, ${v.len} ft long with a ${v.span} ft span: a slim fuselage, a low straight wing with two propeller engines, a fin with tailplanes and retractable-style tricycle gear drawn down.`,
    vs: [['four seat, 29 ft', 29, 38, 9.5, 4], ['six seat, 31 ft', 31, 40, 10.5, 6], ['eight seat, 35 ft', 35, 46, 12, 8], ['nine seat, 39 ft', 39, 49, 13, 9]].map(([l, len, span, h, seats]) => [l, span * 12, len * 12, h * 12, 0, { len, span, seats }]),
    build: (a, v) => plane(a, { fd: 1300 + v.seats * 40, gear: 560, eng: 'wingnose', er: 280, nowin: false, nose: true, gr: 260, gx: 1500, wt: 140, wing: { r: 0.3, c0: 0.1, c1: 0.07, sw: 0.0 }, stab: a.W * 0.2, tt: false,
      st: [[0, 0.3], [0.04, 0.75], [0.13, 1], [0.45, 1], [0.75, 0.5], [0.92, 0.28], [1, 0.12]], log: 'Added the fuselage and cockpit, straight wing with two propeller engines, fin, tailplanes and tricycle landing gear (plan and 3D).' }) }),

  fam({ cat: 'aviation/aircraft', title: 'Generic commuter turboprop aircraft',
    desc: (v) => `Commuter turboprop shape, ${v.len} ft long with a ${v.span} ft span: a round fuselage with window bands, a high straight wing, two nacelles with propellers, a T-tail and tricycle landing gear.`,
    vs: [['19 seat, 58 ft', 58, 57, 19], ['30 seat, 64 ft', 64, 70, 20], ['50 seat, 80 ft', 80, 88, 25], ['70 seat, 89 ft', 89, 89, 25]].map(([l, len, span, h]) => [l, span * 12, len * 12, h * 12, 0, { len, span }]),
    build: (a, v) => plane(a, { fd: 2200 + v.len * 8, gear: 460, wing: { r: 0.34, c0: 0.11, c1: 0.07, sw: 0.02 }, eng: 'prop', ne: 2, hi: true, tt: true, er: 320, stab: a.W * 0.17 }) }),

  fam({ cat: 'aviation/aircraft', title: 'Generic regional jet aircraft',
    desc: (v) => `Regional jet shape, ${v.len} ft long with a ${v.span} ft span: a slim fuselage with window bands, low swept wings, two rear fuselage engines, a T-tail and tricycle landing gear.`,
    vs: [['50 seat, 87 ft', 87, 70], ['70 seat, 98 ft', 98, 76], ['90 seat, 118 ft', 118, 94], ['110 seat, 124 ft', 124, 95]].map(([l, len, span]) => [l, span * 12, len * 12, 23 * 12 + (len - 87) * 1.2, 0, { len, span }]),
    build: (a, v) => plane(a, { fd: 2650, gear: 520, wing: { r: 0.36, c0: 0.12, c1: 0.045, sw: 0.1 }, eng: 'aft', ne: 2, tt: true, er: 420, stab: a.W * 0.2 }) }),

  fam({ cat: 'aviation/aircraft', title: 'Generic narrow-body jet aircraft',
    desc: (v) => `Twin-engine narrow-body jet shape, ${v.len} ft long with a ${v.span} ft span: a round fuselage with window bands, swept low wings with winglets, two underwing engines, a fin with tailplanes and tricycle gear.`,
    vs: [['110 ft, 100 seat class', 110, 94, 36], ['124 ft, 150 seat class', 124, 112, 38], ['138 ft, 180 seat class', 138, 118, 39], ['154 ft, 200 seat class', 154, 118, 41], ['129 ft, long-range', 129, 118, 40]].map(([l, len, span, h]) => [l, span * 12, len * 12, h * 12, 0, { len, span }]),
    build: (a, v) => plane(a, { fd: 3950, gear: 650, wing: { r: 0.37, c0: 0.1, c1: 0.035, sw: 0.095 }, eng: 'wing', ne: 2, er: 1000, winglet: true }) }),

  fam({ cat: 'aviation/aircraft', title: 'Generic wide-body jet aircraft',
    desc: (v) => `${v.ne === 4 ? 'Four' : 'Two'}-engine wide-body jet shape, ${v.len} ft long with a ${v.span} ft span: a large round fuselage with window bands, swept wings, ${v.ne} underwing engines, a tall fin with tailplanes and multi-wheel main gear.`,
    vs: [[165, 164, 2], [200, 197, 2], [225, 212, 2], [242, 211, 2], [232, 224, 4], [251, 213, 4]].map(([len, span, ne]) => [`${ne === 4 ? 'four' : 'twin'} engine, ${len} ft`, span * 12, len * 12, (len > 230 ? 63 : 54) * 12, 0, { len, span, ne }]),
    build: (a, v) => plane(a, { fd: 6000, gear: 950, bogie: true, gr: 520, wing: { r: 0.35, c0: 0.12, c1: 0.03, sw: 0.14 }, eng: 'wing', ne: v.ne, er: 1450, winglet: true, log: 'Added the fuselage and window bands, swept wings, ' + v.ne + ' underwing engines, fin, tailplanes and main gear with wheel trucks (plan and 3D).' }) }),

  fam({ cat: 'aviation/aircraft', title: 'Generic light business jet aircraft',
    desc: (v) => `Business jet shape, ${v.len} ft long with a ${v.span} ft span: a small round fuselage, swept low wings with winglets, two rear engines, a T-tail and tricycle landing gear.`,
    vs: [['very light, 33 ft', 33, 36, 13], ['light, 48 ft', 48, 50, 16], ['midsize, 55 ft', 55, 55, 19], ['large cabin, 68 ft', 68, 68, 21], ['long-range, 99 ft', 99, 94, 26]].map(([l, len, span, h]) => [l, span * 12, len * 12, h * 12, 0, { len, span }]),
    build: (a, v) => plane(a, { fd: 1500 + v.len * 10, gear: 380, wing: { r: 0.4, c0: 0.12, c1: 0.045, sw: 0.1 }, eng: 'aft', ne: 2, tt: true, er: 230 + v.len * 3, stab: a.W * 0.22, winglet: true }) }),

  fam({ cat: 'aviation/aircraft', title: 'Generic freighter aircraft',
    desc: (v) => `${v.kind} freighter shape, ${v.len} ft long with a ${v.span} ft span: a windowless round fuselage with a side cargo door, ${v.hi ? 'a high straight wing with four propeller engines' : 'swept low wings with underwing jet engines'}, a fin with tailplanes and wheel-truck main gear.`,
    vs: [['narrow-body, 124 ft', 124, 112, 39, false, 'Narrow-body'], ['wide-body twin, 209 ft', 209, 197, 56, false, 'Wide-body'], ['wide-body large, 231 ft', 231, 212, 62, false, 'Wide-body'], ['turboprop cargo, 98 ft', 98, 132, 38, true, 'Turboprop']]
      .map(([l, len, span, h, hi, kind]) => [l, span * 12, len * 12, h * 12, 0, { len, span, hi, kind }]),
    build: (a, v) => plane(a, v.hi ? { fd: 3300, gear: 620, hi: true, nowin: true, cargo: true, tt: true, eng: 'prop', ne: 4, er: 330, bogie: false, gr: 420, wing: { r: 0.32, c0: 0.1, c1: 0.05, sw: 0.0 }, stab: a.W * 0.17, log: 'Added the fuselage with a cargo door, high wing with four propeller engines, T-tail and landing gear (plan and 3D).' }
      : { fd: v.len > 150 ? 6000 : 3950, gear: v.len > 150 ? 950 : 650, bogie: v.len > 150, gr: v.len > 150 ? 520 : 330, nowin: true, cargo: true, wing: { r: 0.36, c0: 0.12, c1: 0.035, sw: v.len > 150 ? 0.14 : 0.095 }, eng: 'wing', ne: 2, er: v.len > 150 ? 1450 : 1000, log: 'Added the windowless fuselage with a side cargo door, swept wings, underwing engines, fin, tailplanes and main gear (plan and 3D).' }) }),

  fam({ cat: 'aviation/aircraft', title: 'Generic sailplane',
    desc: (v) => `${v.seats === 1 ? 'Single' : 'Two'}-seat sailplane shape, ${v.len} ft long with a ${v.span} ft span: a slim fuselage with a canopy, long narrow wings, a T-tail and one main wheel with a nose skid.`,
    vs: [['single seat, 49 ft span', 21, 49, 1], ['single seat, 59 ft span', 22, 59, 1], ['two seat, 55 ft span', 27, 55, 2]].map(([l, len, span, seats]) => [l, span * 12, len * 12, 6.2 * 12 + seats * 6, 0, { len, span, seats }]),
    build: (a, v) => plane(a, { fd: 700, gear: 220, nowin: true, nose: true, hi: false, wing: { r: 0.3, c0: 0.1, c1: 0.045, sw: 0.0 }, wt: 70, eng: 'none', tt: true, stab: a.W * 0.1, gr: 190, gx: 40, tail: true,
      st: [[0, 0.3], [0.05, 0.8], [0.14, 1], [0.35, 0.9], [0.65, 0.5], [0.9, 0.22], [1, 0.12]], log: 'Added the slim fuselage with a canopy, long wings, T-tail and the main wheel (plan and 3D).' }) }),

  fam({ cat: 'aviation/aircraft', title: 'Generic floatplane',
    desc: (v) => `Single-engine ${v.seats}-seat floatplane shape, ${v.len} ft long with a ${v.span} ft span: a slim fuselage, a high wing with struts, a nose propeller, a fin with tailplanes and two floats on struts.`,
    vs: [['two seat, 25 ft', 25, 34, 2], ['four seat, 29 ft', 29, 38, 4], ['six seat, 32 ft', 32, 48, 6]].map(([l, len, span, seats]) => [l, span * 12, len * 12, (len > 30 ? 11.5 : 10) * 12, 0, { len, span, seats }]),
    build: (a, v) => plane(a, { fd: 1250, gear: 800, hi: true, strut: true, floats: true, eng: 'nose', nowin: true, nose: true, wt: 140, wing: { r: 0.3, c0: 0.1, c1: 0.08, sw: 0.0 }, stab: a.W * 0.17, pr: 1000,
      st: [[0, 0.5], [0.04, 0.8], [0.13, 1], [0.4, 1], [0.7, 0.55], [0.9, 0.3], [1, 0.12]], log: 'Added the fuselage, nose propeller, high wing with struts, fin, tailplanes and two floats on struts (plan and 3D).' }) }),

  fam({ cat: 'aviation/aircraft', title: 'Generic light helicopter',
    desc: (v) => `Light helicopter shape for ${v.seats} occupants: a rounded passenger bay with a glazed bubble, a tail boom with fin and tail rotor, a mast with ${v.nb} rotor blades of ${v.rot} ft diameter and ${v.skids ? 'a pair of skids on cross tubes' : 'wheeled gear'}.`,
    vs: [['two seat, 25 ft rotor', 25, 29, 3, 2, 2], ['four seat, 33 ft rotor', 33, 38, 3, 4, 2], ['five seat, 35 ft rotor', 35, 42, 3, 5, 2], ['five seat, four blade, 36 ft rotor', 36, 42, 4, 5, 2], ['seven seat, 36 ft rotor', 36, 44, 4, 7, 2]]
      .map(([l, rot, len, nb, seats]) => [l, rot * 12, len * 12, 9.6 * 12 + (seats > 4 ? 12 : 0), 0, { rot, nb, seats, skids: true }]),
    build: (a, v) => heli(a, { nb: v.nb, skids: true, ne: 1, gear: 300, cw: 1300 + v.seats * 40, ch: 1500, cl: 2800 + v.seats * 150, noseOff: 700, tailUp: 450, mastH: 450, cowl: 1100 }) }),

  fam({ cat: 'aviation/aircraft', title: 'Generic medium helicopter',
    desc: (v) => `Twin-engine medium helicopter shape for ${v.seats} occupants: a boxy passenger bay with a sliding side door, two engine cowls, a tail boom with fin and tail rotor, a ${v.nb}-blade rotor of ${v.rot} ft and ${v.skids ? 'skids' : 'wheeled landing gear'}.`,
    vs: [['eight seat, skids, 39 ft rotor', 39, 46, 4, 8, true], ['twelve seat, wheels, 46 ft rotor', 46, 54, 4, 12, false], ['fourteen seat, wheels, 51 ft rotor', 51, 62, 4, 14, false], ['six seat rescue, skids, 36 ft rotor', 36, 44, 4, 6, true]]
      .map(([l, rot, len, nb, seats, skids]) => [l, rot * 12, len * 12, 11.5 * 12 + (seats > 10 ? 18 : 0), 0, { rot, nb, seats, skids }]),
    build: (a, v) => heli(a, { nb: v.nb, skids: v.skids, ne: 2, gear: v.skids ? 340 : 360, cw: 1800 + v.seats * 20, ch: 1900, cl: 3600 + v.seats * 120, noseOff: 900, tailUp: 600, mastH: 600, cowl: 1700, bt: 190 }) }),

  fam({ cat: 'aviation/aircraft', title: 'Generic heavy-lift helicopter',
    desc: (v) => `Heavy helicopter shape, ${v.len} ft long with a ${v.nb}-blade rotor of ${v.rot} ft: a deep passenger bay, three engine cowls, a tail boom with fin and tail rotor and four-wheel landing gear.`,
    vs: [['five blade, 62 ft rotor', 62, 85, 5], ['six blade, 72 ft rotor', 72, 100, 6], ['seven blade, 79 ft rotor', 79, 108, 7]].map(([l, rot, len, nb]) => [l, rot * 12, len * 12, (rot > 70 ? 21 : 18) * 12, 0, { rot, len, nb }]),
    build: (a, v) => heli(a, { nb: v.nb, skids: false, ne: 2, gear: 450, cw: 2500, ch: 2600, cl: 6500 + v.nb * 150, noseOff: 1400, tailUp: 900, mastH: 800, cowl: 2400, bt: 300 }) }),

  // ===================================================== ground support =====================================================
  fam({ cat: 'aviation/groundsupport', title: 'Generic apron baggage tractor',
    desc: (v) => `Baggage tractor for ${v.ton} ton of towing, with ${v.cab ? 'an enclosed glazed cab' : 'an open canopy on four posts'}, a hood, a steering wheel, four wheels with fenders, a beacon, a rear ballast deck and a tow hitch with pin.`,
    vs: [['4 ton tow, open canopy', 58, 138, 72, 4, false], ['6 ton tow, enclosed cab', 60, 150, 76, 6, true], ['10 ton tow, enclosed cab', 64, 166, 78, 10, true], ['15 ton tow, heavy, enclosed cab', 70, 186, 82, 15, true]]
      .map(([l, w, d, h, ton, cab]) => [l, w, d, h, 0, { ton, cab }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const wr = 280 + v.ton * 6; wheelPairs(a, [YF + D * 0.2, YB - D * 0.2], wr, 170, 30);
      for (const y of [YF + D * 0.2, YB - D * 0.2]) for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 15) - 140 * sx - 5, y - wr - 30, Z0 + wr * 2 - 20, cx + sx * (W / 2 - 15) + 140 * sx + 5, y + wr + 30, Z0 + wr * 2 + 10);
      a.box(X0 + 80, YF + 80, Z0 + wr * 0.8, X1 - 80, YB - 140, Z0 + wr * 1.5);
      a.box(X0 + 90, YF + 40, Z0 + wr * 1.5, X1 - 90, YF + D * 0.34, Z0 + wr * 1.5 + 420); a.rect(X0 + 90, YF + 40, X1 - 90, YF + D * 0.34, 'EQUIP-DETAIL');
      for (const x of [cx - W * 0.28, cx + W * 0.28]) a.box(x - 120, YF + 25, Z0 + wr * 1.5 + 200, x + 120, YF + 45, Z0 + wr * 1.5 + 300);
      const cy0 = YF + D * 0.36, cy1 = YB - D * 0.22, zf = Z0 + wr * 1.5, zt = Z1 - 60;
      a.box(X0 + 90, cy0, zf, X1 - 90, YB - 140, zf + 40);
      for (const [x, y] of [[X0 + 100, cy0 + 30], [X1 - 100, cy0 + 30], [X0 + 100, cy1], [X1 - 100, cy1]]) a.box(x - 18, y - 18, zf + 40, x + 18, y + 18, zt);
      a.box(X0 + 70, cy0 - 20, zt, X1 - 70, cy1 + 60, zt + 60);
      for (const sx of [-1, 1]) { const x = cx + sx * W * 0.2; a.box(x - 200, cy0 + 150, zf + 40, x + 200, cy0 + 600, zf + 120); a.box(x - 200, cy0 + 560, zf + 120, x + 200, cy0 + 620, zf + 520); a.rect(x - 200, cy0 + 150, x + 200, cy0 + 600, 'EQUIP-DETAIL'); }
      a.ycyl(cy0 - 10, cy0 + 40, cx - W * 0.2, zf + 700, 150, 14);
      if (v.cab) { a.frame(X0 + 100, zf + 40, X1 - 100, zt, cy0 - 5, cy0 + 20, 40); for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 100) - 10, cy0 + 60, zf + 140, cx + sx * (W / 2 - 100) + 10, cy1 - 20, zt - 60); }
      if (v.ton > 9) a.tube([[X0 + 160, YF + 30, Z0 + 350], [X0 + 160, YF, Z0 + 700], [X1 - 160, YF, Z0 + 700], [X1 - 160, YF + 30, Z0 + 350]], [22, 22, 22, 22], 8);
      beacon(a, cx, cy0 + 300, zt + 60);
      a.box(cx - 90, YB - 140, Z0 + wr, cx + 90, YB, Z0 + wr + 100); a.cyl(cx, YB - 40, Z0 + wr + 100, Z0 + wr + 200, 22, 8); a.circ(cx, YB - 40, 22, 'EQUIP-DETAIL');
      a.log('Added the chassis, hood, ' + (v.cab ? 'glazed cab' : 'open canopy with two seats') + ', steering wheel, four wheels with fenders, beacon, rear deck and tow hitch (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic apron baggage dolly',
    desc: (v) => `Towed baggage dolly with ${v.cover ? 'a roll-curtain frame of hoops over' : 'open'} a low deck, four small wheels, corner posts with side rails and a drawbar with a coupling eye, ${v.len} ft long.`,
    vs: [['open deck, 8 ft', 8, false], ['open deck, 10 ft', 10, false], ['covered, 8 ft', 8, true], ['covered, 12 ft', 12, true]].map(([l, len, cover]) => [l, 64, len * 12 + 40, cover ? 62 : 44, 0, { len, cover }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); const d0 = YF + 900, y1 = YB - 20;
      a.box(X0 + 40, d0, Z0 + 330, X1 - 40, y1, Z0 + 390); a.box(X0 + 40, d0, Z0 + 270, X0 + 90, y1, Z0 + 330); a.box(X1 - 90, d0, Z0 + 270, X1 - 40, y1, Z0 + 330);
      a.rect(X0 + 40, d0, X1 - 40, y1); a.line(cx, d0, cx, y1, 'EQUIP-DETAIL');
      for (const y of [d0 + 250, y1 - 250]) for (const sx of [-1, 1]) { const x = cx + sx * (X1 - X0) * 0.41; a.xcyl(x - 50, x + 50, y, Z0 + 170, 170, 14); a.rect(x - 50, y - 170, x + 50, y + 170, 'EQUIP-DETAIL'); }
      const zt = v.cover ? Z1 - 20 : Z0 + 760;
      for (const [x, y] of [[X0 + 60, d0 + 20], [X1 - 60, d0 + 20], [X0 + 60, y1 - 20], [X1 - 60, y1 - 20]]) a.tube([[x, y, Z0 + 390], [x, y, zt]], [14, 14], 6);
      for (const x of [X0 + 60, X1 - 60]) a.tube([[x, d0 + 20, zt], [x, y1 - 20, zt]], [12, 12], 6);
      if (v.cover) for (let k = 0; k < 5; k++) { const y = d0 + 20 + ((y1 - d0 - 40) * k) / 4; a.tube([[X0 + 60, y, Z0 + 390], [X0 + 60, y, Z1 - 20], [cx, y, Z1], [X1 - 60, y, Z1 - 20], [X1 - 60, y, Z0 + 390]], [8, 8, 8, 8, 8], 6); }
      else for (const x of [X0 + 60, X1 - 60]) a.tube([[x, d0 + 20, Z0 + 580], [x, y1 - 20, Z0 + 580]], [10, 10], 5);
      a.tube([[cx, d0, Z0 + 400], [cx, YF + 60, Z0 + 320]], [18, 18], 8); a.ell(cx, YF + 60, Z0 + 320, 50, 50, 16, 10, 4); a.circ(cx, YF + 60, 40, 'EQUIP-DETAIL');
      a.log('Added the deck, wheels, corner posts, side rails' + (v.cover ? ', roll-curtain hoops' : '') + ' and the drawbar with its coupling eye (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic container transport dolly',
    desc: (v) => `Towed air-cargo dolly for ${v.n} container or pallet position${v.n > 1 ? 's' : ''}: a low frame with a roller bed, side guides, ${v.n * 2 + 2} twist-lock stops, four wheels and a drawbar with a coupling eye.`,
    vs: [1, 2].flatMap((n) => [[`${n} position, 4 wheel`, n], ...(n === 1 ? [['1 position, long deck', 1.4]] : [])]).concat([['3 position, 4 wheel', 3]]).map(([l, n]) => [l, 100, n * 130 + 70, 24, 0, { n: m.round(n) , len: n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); const d0 = YF + 1100, y1 = YB - 10, nr = m.max(3, m.round((y1 - d0) / 120));
      a.box(X0 + 60, d0, Z0 + 250, X1 - 60, y1, Z1 - 70); a.box(X0 + 60, d0, Z1 - 70, X0 + 150, y1, Z1); a.box(X1 - 150, d0, Z1 - 70, X1 - 60, y1, Z1);
      for (let i = 0; i < nr; i++) { const y = d0 + 60 + ((y1 - d0 - 120) * i) / (nr - 1); a.xcyl(X0 + 160, X1 - 160, y, Z1 - 50, 22, 8); a.line(X0 + 160, y, X1 - 160, y, 'EQUIP-DETAIL'); }
      for (let i = 0; i <= v.n; i++) { const y = d0 + 120 + ((y1 - d0 - 240) * i) / v.n; for (const x of [X0 + 220, X1 - 220]) { a.box(x - 40, y - 40, Z1, x + 40, y + 40, Z1 + 0.1); a.cyl(x, y, Z1 - 70, Z1, 30, 8); a.circ(x, y, 30, 'EQUIP-DETAIL'); } }
      for (const y of [d0 + 300, y1 - 300]) for (const sx of [-1, 1]) { const x = cx + sx * (X1 - X0) * 0.4; a.xcyl(x - 60, x + 60, y, Z0 + 200, 200, 14); a.rect(x - 60, y - 200, x + 60, y + 200, 'EQUIP-DETAIL'); }
      a.rect(X0 + 60, d0, X1 - 60, y1, 'EQUIP-DETAIL');
      a.tube([[X0 + 300, d0, Z0 + 300], [cx, YF + 60, Z0 + 300], [X1 - 300, d0, Z0 + 300]], [20, 20, 20], 8); a.ell(cx, YF + 60, Z0 + 300, 50, 50, 16, 10, 4); a.line(X0 + 300, d0, cx, YF + 60, 'EQUIP-DETAIL'); a.line(X1 - 300, d0, cx, YF + 60, 'EQUIP-DETAIL');
      a.log('Added the frame, roller bed, side guides, twist-lock stops, four wheels and the drawbar with its coupling eye (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic apron belt conveyor loader',
    desc: (v) => `Self-propelled belt loader with a ${v.belt} ft conveyor: an inclined belt between side rails, a rubber bumper at the top end, an operator station with canopy at the low front corner, four wheels and a drive chassis.`,
    vs: [[20, 'standard'], [24, 'long'], [28, 'long reach'], [32, 'wide-body reach']].map(([belt]) => [`${belt} ft belt`, 90, belt * 12 + 54, 94 + (belt > 24 ? 14 : 0), 0, { belt }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, D } = a; a.outline();
      wheelPairs(a, [YF + D * 0.25, YB - D * 0.18], 340, 220, 40);
      a.box(X0 + 120, YF + 100, Z0 + 300, X1 - 120, YB - 200, Z0 + 700);
      const bx0 = cx - 200, bx1 = cx + 700, yh = YF + 200, yl = YB - 200, zh = Z1 - 380, zl = Z0 + 780;
      prismX(a, [[yh, zh], [yl, zl], [yl, zl + 160], [yh, zh + 160]], bx0, bx1);
      for (const [x0, x1] of [[bx0 - 50, bx0], [bx1, bx1 + 50]]) prismX(a, [[yh, zh], [yl, zl], [yl, zl + 330], [yh, zh + 330]], x0, x1);
      for (let k = 1; k < 14; k++) { const t = k / 14; a.line(bx0, yh + (yl - yh) * t, bx1, yh + (yl - yh) * t, 'EQUIP-DETAIL'); }
      a.rect(bx0 - 50, yh, bx1 + 50, yl, 'EQUIP-DETAIL');
      a.box(bx0 - 50, yh - 60, zh - 20, bx1 + 50, yh, zh + 200); a.box(bx0 - 50, yh, zh + 330, bx1 + 50, yh + 300, zh + 360);
      a.tube([[cx + 200, yh + 700, zh - 50], [cx + 200, yh + 800, Z0 + 600]], [30, 30], 8);
      a.box(X0 + 40, YB - 1450, Z0 + 700, X0 + 800, YB - 250, Z0 + 1650); a.frame(X0 + 40, Z0 + 1000, X0 + 800, Z0 + 1650, YB - 1470, YB - 1440, 40);
      a.box(X0 + 20, YB - 1470, Z0 + 1650, X0 + 820, YB - 230, Z0 + 1720);
      for (const sx of [0, 1]) a.box(X0 + 40 + sx * 700, YB - 1100, Z0 + 700, X0 + 60 + sx * 720, YB - 450, Z0 + 1650);
      a.rect(X0 + 40, YB - 1450, X0 + 800, YB - 250, 'EQUIP-DETAIL');
      a.log('Added the chassis, ' + v.belt + ' ft inclined belt with side rails, top bumper, operator station with canopy and four wheels (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic cargo container loader',
    desc: (v) => `Self-propelled loader with a ${v.dk} ft long platform deck that raises to ${v.up} ft on a scissor lift, roller bed with side guides and rails, an operator cab, four outrigger pads and four wheels.`,
    vs: [[14, 10, 'short deck, 10 ft lift'], [20, 14, 'standard deck, 14 ft lift'], [24, 18, 'long deck, 18 ft lift'], [28, 24, 'wide-body deck, 24 ft lift']].map(([dk, up, l]) => [l, 120, dk * 12 + 200, (up * 0.55 + 6) * 12 + 60, 0, { dk, up }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, D } = a; a.outline();
      wheelPairs(a, [YF + 700, YB - 600], 380, 240, 30);
      a.box(X0 + 140, YF + 300, Z0 + 420, X1 - 140, YB - 300, Z0 + 800);
      const dz = Z1 - 360, d0 = YF + 1500, d1 = YB - 80;
      a.box(X0 + 80, d0, dz, X1 - 80, d1, dz + 200);
      for (let y = d0 + 120; y < d1 - 60; y += 160) { a.xcyl(X0 + 260, X1 - 260, y, dz + 230, 28, 8); a.line(X0 + 260, y, X1 - 260, y, 'EQUIP-DETAIL'); }
      a.box(X0 + 80, d0, dz + 200, X0 + 200, d1, dz + 360); a.box(X1 - 200, d0, dz + 200, X1 - 80, d1, dz + 360);
      // scissor arms
      for (const sx of [-1, 1]) { const x = cx + sx * (X1 - X0) * 0.36; a.tube([[x, d0 + 600, Z0 + 800], [x, d1 - 600, dz]], [34, 34], 6); a.tube([[x, d1 - 600, Z0 + 800], [x, d0 + 600, dz]], [34, 34], 6); a.line(x, d0 + 600, x, d1 - 600, 'EQUIP-DETAIL'); }
      for (const [x, y] of [[X0 + 40, YF + 300], [X1 - 40, YF + 300], [X0 + 40, YB - 300], [X1 - 40, YB - 300]]) { a.tube([[x, y, Z0 + 700], [x, y, Z0 + 40]], [34, 34], 6); a.box(x - 120, y - 120, Z0, x + 120, y + 120, Z0 + 40); a.rect(x - 120, y - 120, x + 120, y + 120, 'EQUIP-DETAIL'); }
      a.box(X0 + 60, YF + 60, Z0 + 800, X0 + 1000, YF + 1400, Z0 + 2300); a.frame(X0 + 60, Z0 + 1200, X0 + 1000, Z0 + 2300, YF + 50, YF + 80, 40);
      a.rect(X0 + 80, d0, X1 - 80, d1, 'EQUIP-DETAIL'); a.rect(X0 + 60, YF + 60, X0 + 1000, YF + 1400, 'EQUIP-DETAIL');
      a.log('Added the chassis, scissor lift, roller platform deck with side guides, operator cab, four outrigger pads and wheels (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic air cargo container',
    desc: (v) => `Air cargo unit load device, ${v.w} by ${v.d} in on the base, ${v.h} in tall: a ${v.cut ? 'contoured' : 'straight-sided'} frame with a rigid base plate, fork pockets, corner posts, wall panel ribs and a roll-up door curtain on the front face.`,
    vs: [['half-width, 61 x 60 x 64 in', 61, 60, 64, true], ['full-width contoured, 125 x 60 x 64 in', 125, 60, 64, true], ['full-width, 125 x 96 x 64 in', 125, 96, 64, true], ['main-deck, 125 x 96 x 96 in', 125, 96, 96, false], ]
      .map(([l, w, d, h, cut]) => [l, w, d, h, 0, { cut }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D, H } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0 + W * 0.18, YF + 20, Z0 - 0 + 1, X0 + W * 0.18 + 120, YB - 20, Z0 + 60.1);
      const ct = v.cut ? [[X0, Z0 + 60], [X1, Z0 + 60], [X1, Z0 + H * 0.62], [X1 - W * 0.18, Z1], [X0, Z1]] : [[X0, Z0 + 60], [X1, Z0 + 60], [X1, Z1], [X0, Z1]];
      prismY(a, ct, YF, YB);
      for (const y of [YF, YB]) { for (const [x, z] of ct.slice(0, 1)) a.box(x, y - 20, z, x + 40, y + 20, Z1); }
      for (let i = 1; i < 6; i++) { const y = YF + (D * i) / 6; a.line(X0, y, X1, y, 'EQUIP-DETAIL'); }
      a.box(X0 + 6, YF - 0.1, Z0 + 100, X1 - 6, YF + 0.1 + 12, Z1 - 80);
      for (let z = Z0 + 140; z < Z1 - 100; z += 60) a.box(X0 + 30, YF - 0.1, z, X1 - 30, YF + 10, z + 8);
      a.log('Added the base plate with fork pockets, the ' + (v.cut ? 'contoured' : 'straight') + ' walls with ribs, corner posts and the door curtain (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic air cargo pallet with net',
    desc: (v) => `Air cargo pallet, ${v.w} by ${v.d} in, with a rim, a ${v.ld} in high cargo stack of cartons and a cargo net drawn as straps over the load.`,
    vs: [['88 x 125 in, 63 in load', 88, 125, 63], ['96 x 125 in, 64 in load', 96, 125, 64], ['96 x 125 in, 96 in load', 96, 125, 96], ['96 x 196 in, 63 in load', 96, 196, 63]].map(([l, w, d, ld]) => [l, w, d, ld + 3, 0, { ld }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0, YF, Z0 + 60, X1, YF + 20, Z0 + 90); a.box(X0, YB - 20, Z0 + 60, X1, YB, Z0 + 90); a.box(X0, YF, Z0 + 60, X0 + 20, YB, Z0 + 90); a.box(X1 - 20, YF, Z0 + 60, X1, YB, Z0 + 90);
      const n = m.max(1, m.round(D / 1300)), top = Z1 - 8;
      for (let i = 0; i < n; i++) { const y0 = YF + 60 + ((D - 120) * i) / n, y1 = YF + 60 + ((D - 120) * (i + 1)) / n - 15; a.box(X0 + 60, y0, Z0 + 90, X1 - 60, y1, top - (i % 2) * 180); a.rect(X0 + 60, y0, X1 - 60, y1, 'EQUIP-DETAIL'); }
      for (let i = 0; i <= 5; i++) { const y = YF + 60 + ((D - 120) * i) / 5; a.tube([[X0 + 40, y, Z0 + 90], [X0 + 40, y, top], [X1 - 40, y, top], [X1 - 40, y, Z0 + 90]], [8, 8, 8, 8], 5); }
      for (let i = 0; i <= 3; i++) { const x = X0 + 60 + ((W - 120) * i) / 3; a.tube([[x, YF + 40, top + 5], [x, YB - 40, top + 5]], [7, 7], 5); a.line(x, YF + 40, x, YB - 40, 'EQUIP-DETAIL'); }
      a.log('Added the pallet and rim, the carton stack and the cargo net straps (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic aircraft tow bar',
    desc: (v) => `${v.k} aircraft tow bar, ${v.len} in long: two tubular legs meeting at a lunette eye, a cross brace, a nose-gear head with a locking pin, a raised front wheel pair and a hand tow handle.`,
    vs: [['regional, 110 in', 'Regional', 110, 18, 32], ['narrow-body, 150 in', 'Narrow-body', 150, 28, 40], ['wide-body, 200 in', 'Wide-body', 200, 38, 52], ['heavy cargo, 240 in', 'Heavy cargo', 240, 44, 58]].map(([l, k, len, h, w]) => [l, w, len, h, 0, { len, k }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const t = 18 + v.len * 0.06, zl = Z0 + 90 + (a.H - 90) * 0.25;
      for (const s of [-1, 1]) { a.tube([[cx + s * (W / 2 - 60), YB - 140, zl], [cx + s * 40, YF + 160, Z0 + a.H * 0.6]], [t, t * 0.8], 8); a.line(cx + s * (W / 2 - 60), YB - 140, cx + s * 40, YF + 160, 'EQUIP'); }
      a.box(X0 + 30, YB - 360, zl - 20, X1 - 30, YB - 300, zl + 20);
      a.ell(cx, YF + 90, Z0 + a.H * 0.6, 70, 90, 60, 10, 6); a.circ(cx, YF + 90, 60, 'EQUIP-DETAIL');
      a.box(cx - 100, YB - 280, Z0 + 60, cx + 100, YB - 20, zl + 60); a.rect(cx - 100, YB - 280, cx + 100, YB - 20); a.cyl(cx, YB - 150, zl + 60, zl + 200, 24, 8);
      for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 40); a.xcyl(x - 25, x + 25, YB - 100, Z0 + 90, 90, 10); a.rect(x - 25, YB - 190, x + 25, YB - 10, 'EQUIP-DETAIL'); a.tube([[x, YB - 100, Z0 + 90], [x, YB - 140, zl]], [10, 10], 5); }
      a.tube([[cx - 80, YF + 260, Z0 + a.H * 0.6], [cx - 80, YF + 260, Z1 - 20], [cx + 80, YF + 260, Z1 - 20], [cx + 80, YF + 260, Z0 + a.H * 0.6]], [10, 10, 10, 10], 5);
      a.log('Added the two legs, lunette eye, cross brace, nose-gear head with locking pin, wheel pair and tow handle (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic apron pushback tug',
    desc: (v) => `${v.k} pushback tug with ${v.kind === 'bar' ? 'a tow-bar hitch bracket at the front' : 'a nose-wheel cradle with arms at the front'}, ballast deck, a raised glazed cab, mirrors, a beacon and four large wheels.`,
    vs: [['towbar, 40 ton class', 100, 250, 96, 'bar', 'Light'], ['towbar, 100 ton class', 108, 290, 100, 'bar', 'Medium'], ['towbarless, 100 ton class', 108, 270, 102, 'cradle', 'Medium'], ['towbarless, 300 ton class', 126, 360, 114, 'cradle', 'Heavy']].map(([l, w, d, h, kind, k]) => [l, w, d, h, 0, { kind, k }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const wr = 400; wheelPairs(a, [YF + D * 0.3, YB - D * 0.16], wr, 300, 20);
      a.box(X0 + 100, YF + 100, Z0 + 420, X1 - 100, YB - 60, Z0 + 1100);
      a.box(X0 + 50, YB - D * 0.34, Z0 + 1100, X1 - 50, YB - 80, Z0 + 1300); a.rect(X0 + 50, YB - D * 0.34, X1 - 50, YB - 80, 'EQUIP-DETAIL');
      const cy0 = YF + D * 0.2, cy1 = YF + D * 0.5;
      a.box(X0 + 120, cy0, Z0 + 1100, X1 - 120, cy1, Z1 - 80); a.frame(X0 + 150, Z0 + 1400, X1 - 150, Z1 - 120, cy0 - 5, cy0 + 20, 45);
      for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 130) - 8, cy0 + 100, Z0 + 1400, cx + sx * (W / 2 - 130) + 8, cy1 - 100, Z1 - 120);
      a.box(X0 + 100, cy0 - 20, Z1 - 80, X1 - 100, cy1 + 20, Z1 - 20);
      for (const sx of [-1, 1]) { const x = cx + sx * (W / 2 + 4); a.box(x - 14, cy0 + 60, Z0 + 1500, x + 14, cy0 + 120, Z0 + 1900); }
      beacon(a, cx, cy1 - 150, Z1 - 20, 60);
      if (v.kind === 'bar') { a.box(cx - 220, YF, Z0 + 520, cx + 220, YF + 120, Z0 + 860); a.cyl(cx, YF + 60, Z0 + 860, Z0 + 960, 40, 8); a.circ(cx, YF + 60, 40, 'EQUIP-DETAIL'); }
      else { for (const s of [-1, 1]) { a.box(cx + s * 560 - 55, YF, Z0 + 460, cx + s * 560 + 55, YF + 520, Z0 + 720); a.rect(cx + s * 560 - 55, YF, cx + s * 560 + 55, YF + 520, 'EQUIP-DETAIL'); } a.box(cx - 560, YF, Z0 + 540, cx + 560, YF + 80, Z0 + 640); a.cyl(cx, YF + 300, Z0 + 460, Z0 + 700, 60, 10); }
      a.log('Added the chassis, ' + (v.kind === 'bar' ? 'tow-bar hitch' : 'nose-wheel cradle') + ', ballast deck, glazed cab with mirrors, beacon and four large wheels (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic mobile ground power cart',
    desc: (v) => `${v.kva} kVA mobile ground power cart: a louvered generator housing on a frame with ${v.n} wheels, a hinged service door, a control panel, a cable reel with a heavy connector and a drawbar handle.`,
    vs: [['60 kVA, 2 wheel', 60, 2, 70, 96, 52], ['90 kVA, 4 wheel', 90, 4, 72, 120, 58], ['120 kVA, 4 wheel', 120, 4, 76, 140, 62], ['180 kVA, 4 wheel', 180, 4, 82, 160, 66]].map(([l, kva, n, w, d, h]) => [l, w, d, h, 0, { kva, n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const wr = 240, by = YF + 700;
      a.box(X0 + 20, by, Z0 + wr, X1 - 20, YB - 20, Z1 - 40); a.rect(X0 + 20, by, X1 - 20, YB - 20, 'EQUIP');
      a.box(X0 + 10, by - 10, Z1 - 40, X1 - 10, YB - 10, Z1);
      for (const [x, y] of [[X0 + 60, by + 30], [X1 - 60, by + 30]]) a.box(x - 30, y - 10, Z0 + wr, x + 30, y + 10, Z1 - 80);
      for (let z = Z0 + wr + 200; z < Z1 - 200; z += 70) { a.box(X0 + 20, by - 8, z, cx - 100, by + 2, z + 14); }
      a.box(cx - 80, by - 14, Z0 + wr + 100, X1 - 40, by + 4, Z1 - 240); a.line(cx - 80, by, cx - 80, by + 10, 'EQUIP-DETAIL'); a.box(X1 - 120, by - 30, Z0 + wr + 600, X1 - 60, by - 14, Z0 + wr + 680);
      for (let i = 0; i < 4; i++) a.cyl(cx + 40 + i * 70, by - 20, Z1 - 420, Z1 - 380, 20, 8);
      const ry = by + (YB - by) * 0.5; reel(a, X0 + 30, X0 + 30 + 80, ry, Z1 - 200, 140);
      const nw = v.n === 4 ? [by + 200, YB - 160] : [(by + YB) / 2];
      for (const y of nw) whl(a, X0 + 30, y, wr, 110, Z0 + wr); for (const y of nw) whl(a, X1 - 30, y, wr, 110, Z0 + wr);
      a.tube([[cx, by + 80, Z0 + wr + 100], [cx, YF + 100, Z0 + wr + 100]], [18, 18], 8); a.tube([[cx - 220, YF + 100, Z0 + wr + 120], [cx + 220, YF + 100, Z0 + wr + 120]], [14, 14], 6); a.ell(cx, YF + 60, Z0 + wr, 50, 50, 20, 8, 4);
      a.tube([[X1 - 40, ry, Z0 + wr + 500], [X1 + 0, ry + 60, Z0 + wr + 240], [X1 - 20, ry + 200, Z0 + wr + 110]], [20, 20, 20], 6); a.box(X1 - 90, ry + 190, Z0 + wr + 40, X1 - 10, ry + 330, Z0 + wr + 170);
      a.log('Added the louvered housing with service door, control panel, cable reel and connector, wheels and drawbar handle (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic mobile air conditioning cart',
    desc: (v) => `${v.ton} ton mobile air conditioning cart for parked aircraft: a louvered cabinet with a fan section, a control panel, a coiled flexible duct with a cone nozzle, ${v.n} wheels and a drawbar.`,
    vs: [['15 ton, 2 wheel', 15, 2, 62, 110, 66], ['25 ton, 4 wheel', 25, 4, 70, 130, 72], ['40 ton, 4 wheel', 40, 4, 80, 160, 80], ['60 ton, 4 wheel', 60, 4, 90, 192, 90]].map(([l, ton, n, w, d, h]) => [l, w, d, h, 0, { ton, n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const wr = 260, by = YF + 900;
      a.box(X0 + 20, by, Z0 + wr, X1 - 20, YB - 20, Z1 - 20); a.rect(X0 + 20, by, X1 - 20, YB - 20, 'EQUIP');
      for (let z = Z0 + wr + 150; z < Z1 - 250; z += 70) a.box(X0 + 60, by - 8, z, cx - 40, by + 2, z + 14);
      a.ell(cx + W * 0.22, by - 10, Z1 - 400, 260, 30, 260, 14, 6); a.circ(cx + W * 0.22, by - 5, 260, 'EQUIP-DETAIL');
      a.box(X1 - 340, by - 14, Z0 + wr + 100, X1 - 60, by + 4, Z0 + wr + 700);
      a.box(X0 + 40, YB - 700, Z1 - 20, X1 - 40, YB - 100, Z1); // roof cap
      const hy = by - 20;   // duct loops on a hose rack at the front
      a.tube([[cx - W * 0.3, hy, Z0 + wr + 700], [cx - W * 0.3, hy - 700, Z0 + wr + 500], [cx, hy - 800, Z0 + wr + 300], [cx + W * 0.3, hy - 600, Z0 + wr + 450], [cx + W * 0.3, hy - 80, Z0 + wr + 900]], [150, 160, 160, 160, 150], 12);
      a.cone(cx + W * 0.3, hy - 80, Z0 + wr + 900, Z0 + wr + 901, 1, 1, 3); a.ycyl(hy - 250, hy - 80, cx + W * 0.3, Z0 + wr + 900, 170, 12); a.circ(cx + W * 0.3, hy - 160, 170, 'EQUIP-DETAIL');
      const ys = v.n === 4 ? [by + 200, YB - 180] : [by + (YB - by) * 0.55];
      for (const y of ys) for (const x of [X0 + 10, X1 - 10]) whl(a, x, y, wr, 110, Z0 + wr);
      a.tube([[cx, by, Z0 + wr + 80], [cx, YF + 60, Z0 + wr + 80]], [18, 18], 8); a.tube([[cx - 220, YF + 60, Z0 + wr + 100], [cx + 220, YF + 60, Z0 + wr + 100]], [14, 14], 6);
      a.line(cx - W * 0.3, hy - 700, cx + W * 0.3, hy - 600, 'EQUIP-DETAIL');
      a.log('Added the louvered cabinet with fan section and panel, the coiled flexible duct with cone nozzle, wheels and drawbar (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic towable boarding stairs',
    desc: (v) => `Towable boarding stairs for a ${v.sill} ft door sill: a stair run of ${v.n} treads with handrails on both sides, a top platform with a canopy and gate rail, a steel chassis with four wheels and a drawbar.`,
    vs: [[7, 'regional sill'], [9, 'narrow-body sill'], [11, 'tall narrow-body sill'], [14, 'wide-body sill']].map(([sill, l]) => [`${sill} ft, ${l}`, 62, sill * 12 * 1.55 + 120, sill * 12 + 84, 0, { sill, n: m.round(sill * 1.7) }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const pz = Z0 + v.sill * FT - 120, py = YB - 1000;
      wheelPairs(a, [py - 700, YB - 220], 230, 110, 25);
      a.box(X0 + 60, YF + 700, Z0 + 250, X1 - 60, YB - 80, Z0 + 400);
      a.box(X0 + 20, py, pz - 120, X1 - 20, YB - 20, pz); for (const [x, y] of [[X0 + 50, py + 40], [X1 - 50, py + 40], [X0 + 50, YB - 60], [X1 - 50, YB - 60]]) a.tube([[x, y, Z0 + 400], [x, y, pz - 120]], [18, 18], 6);
      stairs(a, cx, YF + 200, Z0 + 120, py, pz, W - 200, v.n);
      for (const sx of [-1, 1]) rail(a, cx + sx * (W / 2 - 40), YF + 220, cx + sx * (W / 2 - 40), py, Z0 + 1000, pz + 1000, 16, 4);
      for (const sx of [-1, 1]) { a.tube([[cx + sx * (W / 2 - 40), py, pz], [cx + sx * (W / 2 - 40), py, Z1 - 60]], [14, 14], 6); a.tube([[cx + sx * (W / 2 - 40), YB - 30, pz], [cx + sx * (W / 2 - 40), YB - 30, Z1 - 60]], [14, 14], 6); a.tube([[cx + sx * (W / 2 - 40), py, Z1 - 60], [cx + sx * (W / 2 - 40), YB - 30, Z1 - 60]], [14, 14], 6); }
      a.box(X0 + 10, py - 20, Z1 - 60, X1 - 10, YB - 10, Z1);
      a.tube([[cx, YF + 700, Z0 + 330], [cx, YF + 60, Z0 + 300]], [18, 18], 8); a.ell(cx, YF + 60, Z0 + 300, 40, 40, 16, 8, 4);
      a.log('Added the stair run with treads and handrails, top platform with canopy, chassis, four wheels and drawbar (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic self-propelled boarding stair truck',
    desc: (v) => `Self-propelled stair truck for a ${v.sill} ft door sill: a cab with glazing, a stair run with handrails climbing over the hood to a top platform with rails and canopy, a hydraulic lift frame and four wheels.`,
    vs: [[7, 'regional'], [9, 'narrow-body'], [12, 'tall narrow-body'], [16, 'wide-body']].map(([sill, l]) => [`${sill} ft sill, ${l}`, 88, sill * 12 * 1.6 + 220, sill * 12 + 110, 0, { sill, n: m.round(sill * 1.6) }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const pz = Z0 + v.sill * FT - 100, cy1 = YF + 1500;
      wheelPairs(a, [YF + 800, YB - 560], 340, 200, 25);
      a.box(X0 + 80, YF + 100, Z0 + 420, X1 - 80, YB - 60, Z0 + 800);
      a.box(X0 + 70, YF + 60, Z0 + 800, X1 - 70, cy1, Z0 + 1900); a.frame(X0 + 120, Z0 + 1150, X1 - 120, Z0 + 1850, YF + 50, YF + 80, 45);
      a.rect(X0 + 70, YF + 60, X1 - 70, cy1, 'EQUIP-DETAIL');
      const sx0 = cx + 0, sw = W - 460;
      stairs(a, sx0, cy1 + 80, Z0 + 1000, YB - 500, pz, sw, v.n);
      a.box(X0 + 20, YB - 500, pz - 120, X1 - 20, YB - 20, pz); a.tube([[cx - 160, YB - 300, Z0 + 800], [cx - 160, YB - 300, pz - 120]], [40, 40], 8); a.tube([[cx + 160, YB - 300, Z0 + 800], [cx + 160, YB - 300, pz - 120]], [40, 40], 8);
      for (const s of [-1, 1]) { rail(a, sx0 + s * (sw / 2 + 10), cy1 + 100, sx0 + s * (sw / 2 + 10), YB - 500, Z0 + 1900, pz + 1000, 16, 4); a.tube([[X0 + 30 + (s > 0 ? W - 60 : 0), YB - 500, pz], [X0 + 30 + (s > 0 ? W - 60 : 0), YB - 500, Z1 - 40], [X0 + 30 + (s > 0 ? W - 60 : 0), YB - 30, Z1 - 40], [X0 + 30 + (s > 0 ? W - 60 : 0), YB - 30, pz]], [14, 14, 14, 14], 6); }
      a.box(X0 + 10, YB - 520, Z1 - 40, X1 - 10, YB - 10, Z1);
      a.log('Added the chassis, glazed cab, stair run with handrails, top platform with rails and canopy, lift frame and four wheels (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic towable lavatory service cart',
    desc: (v) => `Towable lavatory service cart with a ${v.gal} gal waste tank on a frame, a rinse tank, a hinged top hatch, a service hose with a coupling on a rack, ${v.n} wheels and a drawbar.`,
    vs: [[30, 2], [50, 2], [80, 4], [120, 4]].map(([gal, n]) => [`${gal} gal, ${n} wheel`, 36 + gal * 0.12, 70 + gal * 0.55, 40 + gal * 0.12, 0, { gal, n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline(); const wr = 220, by = YF + 600;
      a.box(X0 + 40, by, Z0 + wr, X1 - 40, YB - 20, Z0 + wr + 120);
      const tr = (W - 160) / 2, tz = Z0 + wr + 120 + tr * 0.9, tl = YB - 40 - by;
      a.ycyl(by + 20, YB - 40, cx, tz, tr, 20); a.ell(cx, by + 20, tz, tr * 0.3, 0.1 + tr * 0.1, tr, 8, 5);
      a.rect(cx - tr, by + 20, cx + tr, YB - 40, 'EQUIP-DETAIL');
      a.cyl(cx, by + tl * 0.5, tz + tr * 0.95, tz + tr + 70, 130, 14); a.circ(cx, by + tl * 0.5, 130, 'EQUIP-DETAIL');
      a.box(X0 + 20, by + tl * 0.5 - 140, Z1 - 120, X1 - 20, by + tl * 0.5 + 140, Z1 - 100);
      for (const s of [-1, 1]) a.box(cx + s * (tr + 20) - 10, by + 60, Z0 + wr + 120, cx + s * (tr + 20) + 10, YB - 80, tz);
      a.tube([[X1 - 20, by + 200, Z0 + wr + 260], [X1 + 0, by + 400, Z0 + wr + 140], [X1 - 20, by + 600, Z0 + wr + 260], [X1 - 20, by + 700, Z0 + wr + 80]], [28, 28, 28, 28], 8);
      for (const y of v.n === 4 ? [by + 200, YB - 160] : [(by + YB) / 2]) for (const x of [X0 + 10, X1 - 10]) whl(a, x, y, wr, 100, Z0 + wr);
      a.tube([[cx, by, Z0 + wr + 60], [cx, YF + 60, Z0 + wr + 60]], [18, 18], 8); a.tube([[cx - 200, YF + 60, Z0 + wr + 80], [cx + 200, YF + 60, Z0 + wr + 80]], [14, 14], 6);
      a.log('Added the frame, waste tank with top hatch, service hose on its rack, wheels and the drawbar (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic towable potable water cart',
    desc: (v) => `Towable potable water cart with a ${v.gal} gal tank on a frame, a top fill hatch, a hose reel with a nozzle, a pump housing, ${v.n} wheels and a drawbar.`,
    vs: [[40, 2], [60, 2], [100, 4], [150, 4]].map(([gal, n]) => [`${gal} gal, ${n} wheel`, 36 + gal * 0.12, 70 + gal * 0.5, 42 + gal * 0.1, 0, { gal, n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline(); const wr = 220, by = YF + 600;
      a.box(X0 + 40, by, Z0 + wr, X1 - 40, YB - 20, Z0 + wr + 120);
      const tr = (W - 200) / 2, tz = Z0 + wr + 120 + tr * 0.95, tl = YB - 40 - by - 400;
      a.ycyl(by + 20, by + 20 + tl, cx, tz, tr, 20); a.rect(cx - tr, by + 20, cx + tr, by + 20 + tl, 'EQUIP-DETAIL');
      a.cyl(cx, by + tl * 0.4, tz + tr * 0.95, tz + tr + 60, 120, 14);
      a.box(X0 + 60, YB - 400, Z0 + wr + 120, X1 - 60, YB - 30, Z0 + wr + 600); a.rect(X0 + 60, YB - 400, X1 - 60, YB - 30, 'EQUIP-DETAIL');
      for (let z = Z0 + wr + 200; z < Z0 + wr + 560; z += 60) a.box(X0 + 80, YB - 404, z, X1 - 80, YB - 398, z + 10);
      reel(a, X0 + 100, X0 + 240, YB - 420, Z0 + wr + 420, 130);
      for (const s of [-1, 1]) a.box(cx + s * (tr + 20) - 10, by + 60, Z0 + wr + 120, cx + s * (tr + 20) + 10, by + tl, tz);
      for (const y of v.n === 4 ? [by + 200, YB - 160] : [(by + YB) / 2]) for (const x of [X0 + 10, X1 - 10]) whl(a, x, y, wr, 100, Z0 + wr);
      a.tube([[cx, by, Z0 + wr + 60], [cx, YF + 60, Z0 + wr + 60]], [18, 18], 8); a.tube([[cx - 200, YF + 60, Z0 + wr + 80], [cx + 200, YF + 60, Z0 + wr + 80]], [14, 14], 6);
      a.log('Added the frame, tank with fill hatch, pump housing, hose reel with a nozzle, wheels and the drawbar (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic aircraft de-icing truck',
    desc: (v) => `De-icing truck with a ${v.gal} gal fluid tank behind the cab, an articulated boom reaching ${v.reach} ft with a spray nozzle and a basket at the tip, ${v.out ? 'four outrigger pads, ' : ''}a glazed cab, a beacon and ${v.ax} axles.`,
    vs: [['2500 gal, 30 ft boom', 2500, 30, 2, false], ['3500 gal, 40 ft boom', 3500, 40, 2, true], ['5000 gal, 50 ft boom', 5000, 50, 3, true], ['7000 gal, 60 ft boom', 7000, 60, 3, true]].map(([l, gal, reach, ax, out]) => [l, 100, 300 + gal * 0.03, 168 + reach * 1.2, 0, { gal, reach, ax, out }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline();
      const axles = v.ax === 3 ? [900, D * 0.7 - 0, D * 0.7 + 1400] : [900, D * 0.74];
      cabTruck(a, { cabL: 1900, cabH: 3400, wr: 520, ground: 600, nose: 800, axles });
      const ty0 = YF + 2100, ty1 = YB - 1500 + 0;
      a.box(X0 + 110, ty0, Z0 + 860, X1 - 110, YB - 40, Z0 + 1050);
      const tr = (W - 360) / 2; a.ycyl(ty0 + 60, ty1, cx, Z0 + 1050 + tr, tr, 20); a.rect(cx - tr, ty0 + 60, cx + tr, ty1, 'EQUIP-DETAIL');
      // turret and boom
      const by = ty1 + 400; a.cyl(cx, by, Z0 + 1050, Z0 + 1500, 330, 16); a.circ(cx, by, 330, 'EQUIP-DETAIL');
      a.box(cx - 400, YB - 1400, Z0 + 1050, cx + 400, YB - 40, Z0 + 1500);
      const bz = Z0 + 1500, topz = Z1 - 300;
      a.tube([[cx, by, bz], [cx, by - 900, bz + (topz - bz) * 0.5], [cx, YF + 2400, topz - 100]], [150, 120, 90], 10);
      a.tube([[cx, YF + 2400, topz - 100], [cx, YF + 900, topz]], [90, 70], 10); a.line(cx, by, cx, YF + 900, 'EQUIP-DETAIL');
      a.box(cx - 450, YF + 500, topz - 100, cx + 450, YF + 1200, topz + 300); a.frame(cx - 450, topz - 60, cx + 450, topz + 300, YF + 480, YF + 520, 40); a.rect(cx - 450, YF + 500, cx + 450, YF + 1200, 'EQUIP-DETAIL');
      a.ycyl(YF + 20, YF + 500, cx, topz + 120, 40, 8);
      if (v.out) for (const sx of [-1, 1]) { a.tube([[cx + sx * (W / 2 - 150), YB - 900, Z0 + 700], [cx + sx * (W / 2 - 20), YB - 900, Z0 + 700], [cx + sx * (W / 2 - 20), YB - 900, Z0 + 60]], [30, 30, 30], 6); a.box(cx + sx * (W / 2 - 20) - 130, YB - 1030, Z0, cx + sx * (W / 2 - 20) + 130, YB - 770, Z0 + 40); }
      beacon(a, cx, YF + 1400, Z0 + 3400, 70);
      a.log('Added the cab, fluid tank, boom turret, articulated boom with spray nozzle and basket' + (v.out ? ', outrigger pads' : '') + ' and axles (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic hydrant fuel dispenser',
    desc: (v) => `Hydrant fuel dispenser on a ${v.ax}-axle chassis with a cab, ${v.f} filter vessels, a hydrant coupler hose reel at the rear, a lift platform with rails, an emergency stop and a delivery hose with a nozzle, ${v.gpm} gal per minute class.`,
    vs: [['600 gpm, 2 filters', 600, 2, 2], ['900 gpm, 3 filters', 900, 3, 2], ['1200 gpm, 4 filters', 1200, 4, 3], ['1800 gpm, 4 filters', 1800, 4, 3]].map(([l, gpm, f, ax]) => [l, 100, 270 + f * 10 + (ax === 3 ? 40 : 0), 118, 0, { gpm, f, ax }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      cabTruck(a, { cabL: 1900, cabH: 2900, wr: 480, ground: 560, nose: 800, axles: v.ax === 3 ? [900, D * 0.66, D * 0.66 + 1300] : [900, D * 0.7] });
      const y0 = YF + 2100, y1 = YB - 900, vr = 330;
      a.box(X0 + 110, y0, Z0 + 800, X1 - 110, YB - 40, Z0 + 980);
      const sp = (y1 - y0) / v.f; for (let i = 0; i < v.f; i++) { const y = y0 + sp * (i + 0.5), x = cx + (i % 2 ? 1 : -1) * 380; a.cyl(x, y, Z0 + 980, Z0 + 980 + 1300, vr, 18); a.circ(x, y, vr, 'EQUIP-DETAIL'); a.cyl(x, y, Z0 + 2280, Z0 + 2380, vr * 0.5, 10); }
      a.box(X0 + 110, y0, Z0 + 2400, X1 - 110, y1 + 100, Z0 + 2430); rail(a, X0 + 130, y0, X0 + 130, y1 + 90, Z0 + 2430, Z0 + 3000, 14, 4); rail(a, X1 - 130, y0, X1 - 130, y1 + 90, Z0 + 2430, Z0 + 3000, 14, 4);
      a.box(X0 + 100, YB - 900, Z0 + 1000, X1 - 100, YB - 60, Z0 + 2000); reel(a, cx - 600, cx + 600, YB - 480, Z0 + 1500, 330);
      a.box(cx - 60, YB - 900, Z0 + 2000, cx + 60, YB - 860, Z0 + 2200); beacon(a, cx, YF + 1400, Z0 + 2900, 60);
      a.tube([[X1 - 110, YB - 900, Z0 + 1000], [X1 + 0, YB - 1200, Z0 + 700], [X1 - 60, YB - 1500, Z0 + 620]], [28, 28, 28], 8);
      a.log('Added the cab, ' + v.f + ' filter vessels, lift platform with rails, hydrant coupler reel, delivery hose and axles (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic aircraft wheel chock pair',
    desc: (v) => `Pair of aircraft wheel chocks, each a wedge with a flat grip face, a stepped back and a lifting handle, joined by a ${v.rope} in rope; ${v.h} in tall for wheels up to ${v.wheel} in diameter.`,
    vs: [[8, 30, 'regional', 18, 36], [11, 42, 'narrow-body', 24, 48], [14, 52, 'wide-body', 32, 60], [18, 62, 'heavy cargo', 40, 72]].map(([h, rope, k, wheel, pw]) => [`${k}, ${h} in tall`, pw, h * 2.4 + 6, h, 0, { rope, h, wheel }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline();
      const cw = W * 0.36, g = W * 0.12, ch = D * 0.9;
      for (const s of [-1, 1]) { const x0 = cx + s * g, x1 = cx + s * (g + cw), xa = m.min(x0, x1), xb = m.max(x0, x1);
        prismY(a, [[xa, Z0], [xb, Z0], [xb, Z0 + H], [xa, Z0 + H * 0.3]].slice(0, 4), YF + 10, YB - 10);
        prismX(a, [[YF + 10, Z0], [YB - 10, Z0], [YB - 10, Z0 + H], [YF + 10, Z0 + H * 0.15]], xa, xb);
        for (let i = 1; i < 5; i++) a.line(xa, YF + 10 + ((D - 20) * i) / 5, xb, YF + 10 + ((D - 20) * i) / 5, 'EQUIP-DETAIL');
        a.rect(xa, YF + 10, xb, YB - 10); a.tube([[(xa + xb) / 2, YB - 30, Z0 + H], [(xa + xb) / 2, YB - 30, Z0 + H * 1.0 + 0.1]], [10, 10], 5); }
      a.tube([[cx - g - cw * 0.5, YB - 40, Z0 + H * 0.9], [cx - g - cw * 0.5, YB - 40, Z0 + H], [cx - g, YB - 40, Z0 + H], [cx + g, YB - 40, Z0 + H], [cx + g + cw * 0.5, YB - 40, Z0 + H], [cx + g + cw * 0.5, YB - 40, Z0 + H * 0.9]], [9, 9, 9, 9, 9, 9], 5);
      a.log('Added the two wedge chocks with stepped backs and handles and the joining rope (plan and 3D).');
    } }),

  fam({ cat: 'aviation/groundsupport', title: 'Generic apron safety cone',
    desc: (v) => `Apron safety cone, ${v.h} in tall: a hollow cone with ${v.band} reflective bands on a square weighted base, a top handle ring and chamfered base corners.`,
    vs: [[18, 1], [28, 2], [36, 2]].map(([h, band]) => [`${h} in tall`, h * 0.5 + 6, h * 0.5 + 6, h, 0, { h, band }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a; a.outline();
      a.prism([[X0, YF + 40], [X0 + 40, YF], [X1 - 40, YF], [X1, YF + 40], [X1, YB - 40], [X1 - 40, YB], [X0 + 40, YB], [X0, YB - 40]], Z0, Z0 + H * 0.07);
      const r0 = W * 0.38, r1 = 14; a.cone(cx, cy, Z0 + H * 0.07, Z1, r0, r1, 20); a.circ(cx, cy, r0, 'EQUIP-DETAIL'); a.circ(cx, cy, r1, 'EQUIP-DETAIL');
      for (let i = 0; i < v.band; i++) { const f = 0.42 + i * 0.22, rr = r0 + (r1 - r0) * (f - 0.07) / 0.93; a.cone(cx, cy, Z0 + H * f, Z0 + H * (f + 0.1), rr + 2, rr - (r0 - r1) * 0.1 / 0.93 + 2, 20); }
      a.log('Added the weighted base, the cone and its reflective bands (plan and 3D).');
    } }),

  // ===================================================== airfield =====================================================
  fam({ cat: 'aviation/airfield', title: 'Generic taxiway edge light on frangible stem',
    desc: (v) => `Elevated taxiway edge light, ${v.h} in tall: a round base plate with bolts, a frangible stem with a breakpoint coupling, a lens head with ${v.lens} lens band and a cable gland.`,
    vs: [[14, 'a single'], [20, 'a single'], [24, 'a double'], [30, 'a double']].map(([h, lens]) => [`${h} in stem`, 8, 8, h, 0, { lens, h }]),
    build: (a, v) => {
      const { cx, cy, Z0, Z1, H } = a; a.outline(); a.circ(cx, cy, 90, 'EQUIP-DETAIL');
      a.cyl(cx, cy, Z0, Z0 + 14, 100, 16); for (let i = 0; i < 4; i++) { const g = i * m.PI / 2; a.cyl(cx + m.cos(g) * 70, cy + m.sin(g) * 70, Z0 + 14, Z0 + 28, 8, 6); }
      a.cyl(cx, cy, Z0 + 14, Z0 + H * 0.5, 24, 10); a.cyl(cx, cy, Z0 + H * 0.5, Z0 + H * 0.5 + 22, 38, 10);
      a.cyl(cx, cy, Z0 + H * 0.5 + 22, Z1 - 80, 22, 10); a.cyl(cx, cy, Z1 - 80, Z1 - 40, 70, 14); a.cone(cx, cy, Z1 - 40, Z1, 70, 34, 14);
      a.tube([[cx, cy, Z1 - 70], [cx, cy, Z1 - 30]], [92, 92], 14); if (v.lens === 'a double') a.box(cx - 95, cy - 25, Z1 - 70, cx + 95, cy + 25, Z1 - 30);
      a.box(cx + 24, cy - 8, Z0 + 28, cx + 70, cy + 8, Z0 + 60);
      a.log('Added the base plate with bolts, the frangible stem with breakpoint coupling, the lens head and the cable gland (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic inset runway light fixture',
    desc: (v) => `Inset runway light fitting, ${v.d} in across and ${v.h} in high: a shallow can with a flange ring, a raised prism housing with ${v.way} lens ports and a sloped nose.`,
    vs: [[12, 'one-way', 1], [12, 'two-way', 2], [14, 'two-way, high intensity', 2]].map(([d, way, n]) => [`${way}, ${d} in`, d, d, 2.5, 0, { way, n, h: 2.5 }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W } = a; a.circ(cx, cy, W / 2); a.circ(cx, cy, W * 0.36, 'EQUIP-DETAIL');
      a.cyl(cx, cy, Z0, Z0 + 20, W / 2, 20); a.cyl(cx, cy, Z0 + 20, Z0 + 30, W * 0.36, 20);
      a.prism([[cx - W * 0.28, cy - W * 0.12], [cx + W * 0.28, cy - W * 0.12], [cx + W * 0.2, cy + W * 0.12], [cx - W * 0.2, cy + W * 0.12]], Z0 + 20, Z1 - 4);
      a.box(cx - W * 0.2, cy - W * 0.13, Z0 + 28, cx + W * 0.2, cy - W * 0.12, Z1 - 12); if (v.n === 2) a.box(cx - W * 0.2, cy + W * 0.12, Z0 + 28, cx + W * 0.2, cy + W * 0.13, Z1 - 12);
      for (let i = 0; i < 6; i++) { const g = i * m.PI / 3; a.cyl(cx + m.cos(g) * W * 0.43, cy + m.sin(g) * W * 0.43, Z0 + 20, Z0 + 28, 7, 6); }
      a.log('Added the can with its flange ring, the prism housing and the lens ports (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic approach light mast with crossbar',
    desc: (v) => `Approach light mast, ${v.h} ft tall: a tapered lattice-style tube mast on a base plate, a crossbar of ${v.n} light heads with lens boxes, a ladder-free frangible coupling and a flasher head on top.`,
    vs: [[8, 5], [15, 5], [25, 7], [60, 9]].map(([h, n]) => [`${h} ft, ${n} lights`, (n > 5 ? 16 : 10) * 12, 40, h * 12 + 24, 0, { h, n }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, H } = a; a.outline();
      a.box(cx - 140, cy - 140, Z0, cx + 140, cy + 140, Z0 + 30); a.cone(cx, cy, Z0 + 30, Z1 - 200, 60 + v.h * 1.6, 22, 14); a.circ(cx, cy, 60 + v.h * 1.6, 'EQUIP-DETAIL');
      a.cyl(cx, cy, Z0 + 30 + H * 0.3, Z0 + 30 + H * 0.3 + 30, 90 + v.h * 1.6, 14);
      const zb = Z1 - 190; a.box(X0 + 10, cy - 20, zb, X1 - 10, cy + 20, zb + 30); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
      for (let i = 0; i < v.n; i++) { const x = X0 + 40 + ((W - 80) * i) / (v.n - 1); a.box(x - 36, cy - 50, zb + 30, x + 36, cy + 30, zb + 120); a.box(x - 30, cy - 52, zb + 38, x + 30, cy - 50, zb + 112); a.cyl(x, cy, zb, zb + 30, 16, 6); }
      a.cyl(cx, cy, Z1 - 160, Z1 - 30, 18, 8); a.ell(cx, cy, Z1 - 20, 60, 60, 60, 10, 5);
      a.log('Added the base plate, the tapered mast, the crossbar with ' + v.n + ' light heads and the flasher head (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic taxiway guidance sign on frangible legs',
    desc: (v) => `Taxiway guidance sign with ${v.p} panel${v.p > 1 ? 's' : ''} ${v.h} in tall and ${v.w} in wide: a framed face with border and an arrow bar, two frangible legs with couplings and a concrete pad.`,
    vs: [[1, 18, 36], [2, 24, 60], [3, 30, 90], [5, 36, 150]].map(([p, h, w]) => [`${p} panel, ${h} in high`, w, 10, h + 16, 0, { p, h, w }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, H } = a; a.outline();
      a.box(X0 + 20, YF, Z0, X1 - 20, YB, Z0 + 12);
      const fz = Z0 + 130, ft = Z1;
      for (const x of [X0 + W * 0.2, X1 - W * 0.2]) { a.cyl(x, cy, Z0 + 12, fz - 60, 18, 8); a.cyl(x, cy, fz - 60, fz - 40, 30, 8); a.cyl(x, cy, fz - 40, fz, 18, 8); a.circ(x, cy, 18, 'EQUIP-DETAIL'); }
      a.box(X0, cy - 100, fz, X1, cy + 100, ft); a.rect(X0, cy - 100, X1, cy + 100, 'EQUIP');
      a.frame(X0 + 12, fz + 12, X1 - 12, ft - 12, cy - 112, cy - 98, 14);
      const pw = (W - 40) / v.p; for (let i = 1; i < v.p; i++) a.box(X0 + 20 + pw * i - 6, cy - 112, fz + 12, X0 + 20 + pw * i + 6, cy - 98, ft - 12);
      for (let i = 0; i < v.p; i++) { const x = X0 + 20 + pw * (i + 0.5); a.box(x - pw * 0.28, cy - 114, fz + (ft - fz) * 0.42, x + pw * 0.28, cy - 108, fz + (ft - fz) * 0.58); a.box(x + pw * 0.2, cy - 114, fz + (ft - fz) * 0.3, x + pw * 0.34, cy - 108, fz + (ft - fz) * 0.7); }
      a.log('Added the concrete pad, frangible legs with couplings, the sign body with its frame, panel dividers and arrow bars (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic lighted wind cone on mast',
    desc: (v) => `Lighted wind cone, ${v.l} ft sock on a ${v.h} ft mast: a hinged tapered pole on a base plate, a sock ring and swivel arm, a banded striped sock streaming sideways and a floodlight ring of lamps on short brackets.`,
    vs: [[8, 15], [12, 20], [18, 30]].map(([l, h]) => [`${l} ft sock, ${h} ft mast`, l * 12 + 20, 24, h * 12 + 20, 0, { l, h }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, H } = a; a.outline();
      const bx = X0 + 40; a.box(bx - 140, cy - 140, Z0, bx + 140, cy + 140, Z0 + 20); a.cone(bx, cy, Z0 + 20, Z1 - 70, 70, 28, 12); a.circ(bx, cy, 70, 'EQUIP-DETAIL');
      const ty = Z1 - 100, sl = v.l * FT; a.cyl(bx, cy, Z1 - 100, Z1 - 70, 36, 10);
      a.xcyl(bx, bx + 120, cy, ty, 30, 8);   // swivel arm
      const r0 = 150 + v.l * 5, r1 = 70 + v.l * 2.5; for (let i = 0; i < 6; i++) { const x0 = bx + 120 + (sl * i) / 6, x1 = bx + 120 + (sl * (i + 1)) / 6, ra = r0 + (r1 - r0) * i / 6, rb = r0 + (r1 - r0) * (i + 1) / 6; a.tube([[x0, cy, ty], [x1, cy, ty]], [ra, rb], 14); }
      a.line(bx + 120, cy, bx + 120 + sl, cy, 'EQUIP-DETAIL');
      for (let i = 0; i < 4; i++) { const g = i * m.PI / 2; a.box(bx + m.cos(g) * 160 - 30, cy + m.sin(g) * 160 - 30, Z1 - 240, bx + m.cos(g) * 160 + 30, cy + m.sin(g) * 160 + 30, Z1 - 200); }
      a.log('Added the base plate, tapered mast, swivel arm, banded wind sock and the ring of floodlights (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic precision approach path indicator unit',
    desc: (v) => `Approach path indicator light bar with ${v.n} lamp boxes in a row on a bar, each box with a lens, a hood and a lamp window, on a pair of frangible legs with a base frame and a tilt adjustment arm.`,
    vs: [[2], [3], [4]].map(([n]) => [`${n} box bar, ${n * 38} in wide`, n * 38, 36, 40, 0, { n }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, H } = a; a.outline(); const bw = (W - 40) / v.n;
      a.box(X0, YF, Z0, X1, YB, Z0 + 30);
      for (const x of [X0 + 60, X1 - 60]) { a.cyl(x, cy, Z0 + 30, Z0 + H * 0.4, 18, 8); a.cyl(x, cy, Z0 + H * 0.4, Z0 + H * 0.4 + 20, 26, 8); }
      a.box(X0, YF + 200, Z0 + H * 0.4 + 20, X1, YB - 20, Z0 + H * 0.4 + 60);
      for (let i = 0; i < v.n; i++) { const x0 = X0 + 20 + bw * i, x1 = x0 + bw - 14; a.box(x0, YF + 40, Z0 + H * 0.4 + 60, x1, YB - 40, Z1 - 70); a.box(x0 + 30, YF + 20, Z0 + H * 0.4 + 120, x1 - 30, YF + 40, Z1 - 130); a.box(x0 + 10, YF + 20, Z1 - 70, x1 - 10, YB - 20, Z1 - 55); a.rect(x0, YF + 40, x1, YB - 40, 'EQUIP-DETAIL'); a.ell((x0 + x1) / 2, YF + 28, Z0 + H * 0.4 + 190, (x1 - x0) * 0.3, 14, 70, 10, 5); }
      a.tube([[X0 + 40, YB - 10, Z0 + H * 0.4 + 40], [X0 + 40, YB + 0 - 10, Z0 + 60]], [12, 12], 5);
      a.log('Added the base frame, frangible legs, the bar with ' + v.n + ' lamp boxes, hoods, lenses and the tilt arm (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic aerodrome rotating beacon on tower',
    desc: (v) => `Aerodrome beacon on a ${v.h} ft tower: a square lattice of four legs with cross bracing, a service platform with rail and a trap door, a rotating head with two lens drums and a lantern roof.`,
    vs: [[20], [30], [45]].map(([h]) => [`${h} ft lattice tower`, 80, 80, h * 12 + 40, 0, { h }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, H } = a; a.outline();
      const pz = Z1 - 60 - 140, w0 = W * 0.45, w1 = W * 0.2;
      const leg = (s, t, z) => [cx + s * (w0 + (w1 - w0) * ((z - Z0) / (pz - Z0))), cy + t * (w0 + (w1 - w0) * ((z - Z0) / (pz - Z0))), z];
      for (const [s, t] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) a.tube([leg(s, t, Z0), leg(s, t, pz)], [30, 24], 8);
      const nb = m.max(3, m.round(v.h / 7)); for (let i = 0; i < nb; i++) { const za = Z0 + ((pz - Z0) * i) / nb, zb = Z0 + ((pz - Z0) * (i + 1)) / nb; for (const [s, t, s2, t2] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) { a.tube([leg(s, t, za), leg(s2, t2, zb)], [8, 8], 5); a.tube([leg(s2, t2, za), leg(s, t, zb)], [8, 8], 5); } }
      a.rect(cx - w0, cy - w0, cx + w0, cy + w0, 'EQUIP-DETAIL'); a.rect(cx - w1, cy - w1, cx + w1, cy + w1, 'EQUIP-DETAIL');
      a.box(cx - w1 - 70, cy - w1 - 70, pz, cx + w1 + 70, cy + w1 + 70, pz + 30);
      for (const [x0, y0, x1, y1] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) a.tube([[cx + x0 * (w1 + 60), cy + y0 * (w1 + 60), pz + 30 + 330], [cx + x1 * (w1 + 60), cy + y1 * (w1 + 60), pz + 30 + 330]], [10, 10], 5);
      a.cyl(cx, cy, pz + 30, pz + 130, 90, 12);
      for (const s of [-1, 1]) a.xcyl(cx + s * 40 - (s > 0 ? 0 : 0) , cx + s * 190, cy, pz + 250, 120, 14);
      a.cyl(cx, cy, pz + 130, pz + 250, 50, 10); a.cone(cx, cy, pz + 370, Z1, 180, 30, 12);
      a.log('Added the lattice tower with bracing, the service platform with rail, the rotating head with two lens drums and the lantern roof (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic radio navigation beacon antenna on counterpoise',
    desc: (v) => `Omnidirectional radio navigation beacon: a central cylindrical antenna housing of ${v.dia} in diameter on a raised ring base, ${v.n} monitor posts around it and a round counterpoise plate of ${v.cp} ft on short legs.`,
    vs: [[30, 3, 20], [36, 4, 30], [44, 6, 36]].map(([dia, n, cp]) => [`${cp} ft counterpoise, ${n} monitor posts`, cp * 12, cp * 12, (dia > 40 ? 150 : 130), 0, { dia, n, cp }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, H } = a; a.circ(cx, cy, W / 2); a.circ(cx, cy, v.dia * 12.7, 'EQUIP-DETAIL');
      const cz = Z0 + 120; a.cyl(cx, cy, cz, cz + 24, W / 2, 24);
      for (let i = 0; i < 8; i++) { const g = (i * m.PI) / 4; a.cyl(cx + m.cos(g) * W * 0.4, cy + m.sin(g) * W * 0.4, Z0, cz, 22, 8); }
      for (let i = 1; i < 4; i++) a.circ(cx, cy, (W / 2) * (i / 4), 'EQUIP-HIDDEN');
      a.cyl(cx, cy, cz + 24, cz + 24 + 200, v.dia * 17, 18); a.cyl(cx, cy, cz + 224, Z1 - 70, v.dia * 12.7, 18); a.cone(cx, cy, Z1 - 70, Z1, v.dia * 12.7, v.dia * 4, 18);
      for (let i = 0; i < v.n; i++) { const g = (i * 2 * m.PI) / v.n, r = W * 0.3; a.cyl(cx + m.cos(g) * r, cy + m.sin(g) * r, cz + 24, cz + 24 + 520, 16, 8); a.ell(cx + m.cos(g) * r, cy + m.sin(g) * r, cz + 24 + 540, 40, 40, 30, 8, 4); a.circ(cx + m.cos(g) * r, cy + m.sin(g) * r, 16, 'EQUIP-DETAIL'); }
      a.log('Added the counterpoise plate on legs, the central antenna housing on its ring base and the ' + v.n + ' monitor posts (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic localizer antenna array',
    desc: (v) => `Runway localizer array of ${v.n} antenna elements: a long ground-level base rail with a shelter at one end, ${v.n} vertical dipole masts with a cross arm and a reflector screen behind the row, ${v.w} ft wide.`,
    vs: [[8, 40], [12, 60], [16, 80]].map(([n, w]) => [`${n} element, ${w} ft wide`, w * 12, 96, 96, 0, { n, w }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, H } = a; a.outline();
      a.box(X0, YB - 40, Z0, X1, YB, Z0 + 14); a.box(X0 + 40, YB - 50, Z0 + 14, X1 - 40, YB - 30, Z0 + 600);
      const sp = (W - 400) / (v.n - 1);
      for (let i = 0; i < v.n; i++) { const x = X0 + 200 + sp * i; a.cyl(x, cy, Z0 + 14, Z1 - 100, 22, 8); a.box(x - 220, cy - 12, Z1 - 420, x + 220, cy + 12, Z1 - 396); a.box(x - 220, cy - 12, Z1 - 600, x + 220, cy + 12, Z1 - 576); a.cyl(x, cy, Z1 - 100, Z1 - 50, 12, 6); a.circ(x, cy, 22, 'EQUIP-DETAIL'); a.line(x - 220, cy, x + 220, cy, 'EQUIP-DETAIL'); a.box(x - 20, cy - 30, Z0, x + 20, cy + 30, Z0 + 14); }
      a.box(X0 + 20, YB - 400, Z0, X0 + 700, YB - 100, Z0 + 700); a.rect(X0 + 20, YB - 400, X0 + 700, YB - 100, 'EQUIP-DETAIL');
      a.log('Added the base rail, the reflector screen, ' + v.n + ' dipole masts with cross arms and the equipment shelter (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic aviation fuel hydrant pit',
    desc: (v) => `Flush aviation fuel hydrant pit with a ${v.lid} in lid: a recessed chamber with a hinged cover plate, a coupler riser with a quick-connect and a drain, a ring frame and ${v.n} coupler position${v.n > 1 ? 's' : ''}.`,
    vs: [[18, 1], [24, 1], [36, 2]].map(([lid, n]) => [`${lid} in lid, ${n} coupler`, lid + 8, lid + 8, 16, -10, { lid, n }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 6); a.box(X0, YF, Z0, X0 + 12, YB, Z0 + 300); a.box(X1 - 12, YF, Z0, X1, YB, Z0 + 300); a.box(X0, YF, Z0, X1, YF + 12, Z0 + 300); a.box(X0, YB - 12, Z0, X1, YB, Z0 + 300);
      a.box(X0 - 0.1, YF, Z1 - 30, X1 + 0.1, YB, Z1);
      const lw = (W - 60) / 2; a.box(X0 + 30, YF + 30, Z1 - 24, X1 - 30, YB - 30, Z1 - 8);
      a.rect(X0 + 30, YF + 30, X1 - 30, YB - 30, 'EQUIP-DETAIL'); a.line(X0 + 30, cy, X1 - 30, cy, 'EQUIP-DETAIL'); a.circ(cx - W * 0.28, cy, 30, 'EQUIP-DETAIL');
      for (let i = 0; i < v.n; i++) { const y = v.n === 1 ? cy : cy + (i ? 1 : -1) * D * 0.2; a.cyl(cx, y, Z0 + 6, Z0 + 260, 42, 12); a.cyl(cx, y, Z0 + 260, Z0 + 300, 60, 12); a.circ(cx, y, 42, 'EQUIP-DETAIL'); }
      a.box(X1 - 70, YB - 70, Z0 + 6, X1 - 20, YB - 20, Z0 + 70);
      a.log('Added the recessed chamber, ring frame, hinged cover plate, coupler riser with quick-connect and drain (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic jet blast fence',
    desc: (v) => `Jet blast fence, ${v.w} ft long and ${v.h} ft high: ${v.k} deflector panels angled back at the top, set in a row on steel posts with cross rails, a concrete footing and bolted base plates.`,
    vs: [[20, 10, 'corrugated'], [30, 12, 'corrugated'], [40, 14, 'louvered'], [60, 18, 'louvered']].map(([w, h, k]) => [`${w} ft long, ${h} ft high, ${k}`, w * 12, 48, h * 12 + 4, 0, { w, h, k }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D, H } = a; a.outline();
      a.box(X0, YF + 40, Z0, X1, YB - 40, Z0 + 18);
      const nb = m.max(3, m.round(W / 1600)); const bw = (W - 200) / nb;
      for (let i = 0; i <= nb; i++) { const x = X0 + 100 + bw * i; a.box(x - 30, YB - 120, Z0 + 18, x + 30, YB - 60, Z1 - 150); a.box(x - 80, YB - 180, Z0 + 18, x + 80, YB - 40, Z0 + 40); a.rect(x - 30, YB - 120, x + 30, YB - 60); }
      for (let i = 0; i < nb; i++) { const x0 = X0 + 100 + bw * i + 40, x1 = x0 + bw - 80;
        if (v.k === 'louvered') { const ns = m.round((H - 300) / 330); for (let k = 0; k < ns; k++) { const z = Z0 + 200 + k * 330; prismX(a, [[YB - 60, z], [YB - 60, z + 40], [YF + 60 + 100, z + 330 * 0.45 + 40], [YF + 60 + 100, z + 330 * 0.45]], x0, x1); } }
        else { prismX(a, [[YB - 60, Z0 + 150], [YB - 40, Z0 + 150], [YB - 40, Z1 - 560], [YF + 100, Z1 - 120], [YF + 100, Z1 - 160], [YB - 60, Z1 - 600]], x0, x1); for (let r = 0; r < 5; r++) { const x = x0 + ((x1 - x0) * (r + 0.5)) / 5; a.line(x, YB - 40, x, YF + 100, 'EQUIP-DETAIL'); } } }
      a.box(X0 + 60, YB - 130, Z0 + H * 0.45, X1 - 60, YB - 90, Z0 + H * 0.45 + 50);
      a.log('Added the footing, posts with base plates, the cross rail and the ' + v.k + ' angled deflector panels (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic airport control tower',
    desc: (v) => `Airport control tower, ${v.h} ft to the cab floor: a tapered concrete shaft with a stair-core door and slit windows, a base building, a flared glazed control cab with a sloped roof, an outside catwalk with rail and a mast with antennas.`,
    vs: [[40, 'small'], [70, 'medium'], [130, 'tall']].map(([h, k]) => [`${h} ft shaft, ${k}`, 20 + h * 0.5, 20 + h * 0.5, (h + 40) * 12 + 144, 0, { h }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, H } = a; a.outline();
      const bw = W * 0.48, sr = W * 0.12 + v.h * 6, tz = Z0 + v.h * FT, cz = tz + 700;
      a.box(cx - bw, cy - bw, Z0, cx + bw, cy + bw, Z0 + 3200); a.rect(cx - bw, cy - bw, cx + bw, cy + bw, 'EQUIP');
      a.box(cx - 500, cy - bw - 120, Z0, cx + 500, cy - bw, Z0 + 2200);
      a.tube([[cx, cy, Z0 + 3200], [cx, cy, tz]], [sr * 1.5, sr], 20);
      for (let z = Z0 + 4000; z < tz - 600; z += 2000) a.box(cx - 120, cy - sr - 12, z, cx + 120, cy - sr * 0.7, z + 900);
      a.circ(cx, cy, sr, 'EQUIP-DETAIL');
      a.cone(cx, cy, tz, tz + 700, sr, sr * 2.2, 20);
      a.cyl(cx, cy, tz + 700, tz + 700 + 2400, sr * 2.2, 24); a.circ(cx, cy, sr * 2.2, 'EQUIP-DETAIL');
      const ct = tz + 700 + 2400; a.frame(cx - sr * 2.1, tz + 800, cx + sr * 2.1, ct - 100, cy - sr * 2.3 - 10, cy - sr * 2.3 + 20, 60);
      a.cyl(cx, cy, tz + 800, ct - 100, sr * 2.25, 24);
      a.cone(cx, cy, ct, ct + 600, sr * 2.8, sr * 0.9, 24); a.cyl(cx, cy, ct + 600, ct + 700, sr * 0.9, 14);
      const cr = sr * 2.7; for (let i = 0; i < 16; i++) { const g = (i * m.PI) / 8; a.cyl(cx + m.cos(g) * cr, cy + m.sin(g) * cr, tz + 700, tz + 700 + 1100, 12, 5); }
      a.tube([...Array(17).keys()].map((i) => [cx + m.cos((i * m.PI) / 8) * cr, cy + m.sin((i * m.PI) / 8) * cr, tz + 1800]), Array(17).fill(14), 5);
      a.circ(cx, cy, cr, 'EQUIP-DETAIL');
      a.cyl(cx, cy, ct + 700, Z1 - 60, 14, 8); a.box(cx - 300, cy - 8, Z1 - 360, cx + 300, cy + 8, Z1 - 340); a.box(cx - 8, cy - 300, Z1 - 560, cx + 8, cy + 300, Z1 - 540);
      a.log('Added the base building, tapered shaft with stair-core door and slit windows, flared control cab with glazing, roof, catwalk rail and the antenna mast (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic runway distance remaining marker',
    desc: (v) => `Runway distance marker board: a ${v.w} in wide by ${v.h} in high panel with a raised border and a number plate, on two posts with a base pad, lit by a pair of small lamps on the top rail.`,
    vs: [[36, 72], [48, 96], [60, 120]].map(([w, h]) => [`${w} x ${h} in board`, w, 12, h + 30, 0, { w, h }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 10);
      for (const x of [X0 + 50, X1 - 50]) { a.box(x - 25, cy - 25, Z0 + 10, x + 25, cy + 25, Z0 + 240); a.circ(x, cy, 25, 'EQUIP-DETAIL'); }
      a.box(X0, cy - 30, Z0 + 240, X1, cy + 30, Z1 - 60); a.frame(X0 + 10, Z0 + 250, X1 - 10, Z1 - 70, cy - 40, cy - 28, 28);
      a.box(X0 + W * 0.2, cy - 44, Z0 + (Z1 - Z0) * 0.3, X1 - W * 0.2, cy - 36, Z0 + (Z1 - Z0) * 0.6);
      a.box(X0 + 10, cy - 30, Z1 - 60, X1 - 10, cy + 30, Z1 - 50);
      for (const x of [X0 + W * 0.25, X1 - W * 0.25]) { a.box(x - 50, cy - 80, Z1 - 50, x + 50, cy - 20, Z1 - 20); a.rect(x - 50, cy - 80, x + 50, cy - 20, 'EQUIP-DETAIL'); }
      a.log('Added the base pad, two posts, the bordered board with its number plate and the pair of top lamps (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic automated weather observation mast',
    desc: (v) => `Weather observation mast, ${v.h} ft tall: a guyed or free-standing tube mast on a base plate with a wind sensor on a cross arm, a temperature shield, a cloud height sensor on a box, a solar panel and an equipment cabinet at the foot.`,
    vs: [[10], [20], [33]].map(([h]) => [`${h} ft mast`, 70 + h * 3, 70 + h * 3, h * 12 + 24, 0, { h }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, H } = a; a.outline();
      a.box(cx - 150, cy - 150, Z0, cx + 150, cy + 150, Z0 + 20); a.cone(cx, cy, Z0 + 20, Z1 - 120, 45, 20, 12); a.circ(cx, cy, 45, 'EQUIP-DETAIL');
      a.box(cx + 120, cy - 150, Z0, cx + 520, cy + 150, Z0 + 900); a.rect(cx + 120, cy - 150, cx + 520, cy + 150, 'EQUIP-DETAIL');
      a.box(cx - 400, cy - 12, Z1 - 180, cx + 400, cy + 12, Z1 - 160); a.cyl(cx - 400, cy, Z1 - 160, Z1 - 100, 25, 8); a.xcyl(cx + 400, cx + 460, cy, Z1 - 170, 30, 8);
      for (const s of [-1, 1]) { a.cyl(cx + s * 400, cy, Z1 - 160, Z1 - 60, 8, 6); a.ell(cx + s * 400, cy, Z1 - 50, 44, 44, 20, 10, 5); }
      a.cyl(cx, cy, Z1 - 120, Z1 - 20, 18, 8); a.box(cx - 160, cy - 200, Z0 + H * 0.45, cx + 160, cy + 200, Z0 + H * 0.45 + 400); a.rect(cx - 160, cy - 200, cx + 160, cy + 200, 'EQUIP-DETAIL');
      a.prism([[cx - 520, cy + 100], [cx - 120, cy + 100], [cx - 120, cy + 500], [cx - 520, cy + 500]], Z0 + 1300, Z0 + 1330);
      for (let i = 0; i < 3; i++) { const g = i * 2 * m.PI / 3, r = W * 0.42; a.tube([[cx, cy, Z0 + H * 0.6], [cx + m.cos(g) * r, cy + m.sin(g) * r, Z0 + 20]], [4, 4], 4); }
      a.log('Added the base plate, mast, cross arm with wind sensors, temperature shield, cloud sensor box, solar panel and the equipment cabinet (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic airfield surveillance radar tower',
    desc: (v) => `Surveillance radar on a ${v.h} ft tower: a four-legged braced tower, a machinery room on top, a turntable with a curved reflector of ${v.ant} ft width, a feed arm and a service stair and ladder up one side.`,
    vs: [[20, 12], [35, 18], [50, 25]].map(([h, ant]) => [`${h} ft tower, ${ant} ft antenna`, ant * 12, ant * 12, h * 12 + ant * 7 + 60, 0, { h, ant }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, H } = a; a.outline();
      const tz = Z0 + v.h * FT, w0 = W * 0.22, w1 = W * 0.13;
      const lg = (s, t, z) => { const f = (z - Z0) / (tz - Z0); return [cx + s * (w0 + (w1 - w0) * f), cy + t * (w0 + (w1 - w0) * f), z]; };
      for (const [s, t] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) a.tube([lg(s, t, Z0), lg(s, t, tz)], [34, 28], 8);
      const nb = m.max(3, m.round(v.h / 6)); for (let i = 0; i < nb; i++) { const za = Z0 + ((tz - Z0) * i) / nb, zb = Z0 + ((tz - Z0) * (i + 1)) / nb; for (const [s, t, s2, t2] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) { a.tube([lg(s, t, za), lg(s2, t2, zb)], [9, 9], 5); a.tube([lg(s2, t2, za), lg(s, t, zb)], [9, 9], 5); } }
      a.rect(cx - w0, cy - w0, cx + w0, cy + w0, 'EQUIP-DETAIL');
      a.box(cx - w1 - 80, cy - w1 - 80, tz, cx + w1 + 80, cy + w1 + 80, tz + 1600); a.rect(cx - w1 - 80, cy - w1 - 80, cx + w1 + 80, cy + w1 + 80, 'EQUIP-DETAIL');
      a.cyl(cx, cy, tz + 1600, tz + 1900, 420, 18); a.box(cx - 120, cy - 120, tz + 1900, cx + 120, cy + 120, tz + 2300);
      const ar = W * 0.46, az = tz + 2300 + (Z1 - tz - 2300) * 0.5, ah = (Z1 - tz - 2300) * 0.5 - 60;
      const pts = []; for (let i = 0; i <= 12; i++) { const f = i / 12; pts.push([cx - ar + 2 * ar * f, cy + 40 - m.sin(f * m.PI) * 30, az - ah + m.sin(f * m.PI) * 0]); }
      a.prism([[cx - ar, cy - 80], [cx + ar, cy - 80], [cx + ar, cy + 40], [cx - ar, cy + 40]], az - ah, az + ah);
      a.box(cx - ar, cy - 160, az - ah - 20, cx + ar, cy - 80, az - ah + 20); a.box(cx - ar, cy - 160, az + ah - 20, cx + ar, cy - 80, az + ah + 20);
      a.tube([[cx, cy, tz + 2300], [cx, cy - 350, az]], [30, 30], 6); a.box(cx - 40, cy - 520, az - 80, cx + 40, cy - 330, az + 80);
      a.line(cx - ar, cy, cx + ar, cy, 'EQUIP-DETAIL');
      ladder(a, cx + w0 + 120, cy - 150, Z0, cy - 150 + 0.01, tz, 450, m.round(v.h / 2.2));
      a.log('Added the braced four-leg tower, machinery room, turntable, curved antenna with its feed arm and the service ladder (plan and 3D).');
    } }),

  fam({ cat: 'aviation/airfield', title: 'Generic runway sweeper truck',
    desc: (v) => `Runway sweeper truck with a ${v.sw} ft sweeping width: a glazed cab, a front broom head and side broom, a rear hopper body with a hinged lid, a blower duct, a beacon and ${v.ax} axles.`,
    vs: [[8, 2, 'compact'], [12, 2, 'standard'], [16, 3, 'high capacity']].map(([sw, ax, k]) => [`${sw} ft width, ${k}`, 100, 300 + sw * 12, 120, 0, { sw, ax }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline();
      cabTruck(a, { cabL: 1900, cabH: 3100, wr: 500, ground: 580, nose: 800, axles: v.ax === 3 ? [900, D * 0.62, D * 0.62 + 1300] : [900, D * 0.72] });
      const y0 = YF + 2100; a.box(X0 + 110, y0, Z0 + 860, X1 - 110, YB - 40, Z0 + 1000);
      a.prism([[X0 + 100, y0], [X1 - 100, y0], [X1 - 100, YB - 100], [X0 + 100, YB - 100]], Z0 + 1000, Z1 - 380); a.box(X0 + 90, y0 + 40, Z1 - 380, X1 - 90, YB - 110, Z1 - 330);
      a.rect(X0 + 100, y0, X1 - 100, YB - 100, 'EQUIP-DETAIL');
      a.box(X0 + 110, YB - 100, Z0 + 1000, X1 - 110, YB - 40, Z1 - 600);
      a.xcyl(X0 + 60, X1 - 60, YF + 1500, Z0 + 260, 260, 18); a.rect(X0 + 60, YF + 1240, X1 - 60, YF + 1760, 'EQUIP-DETAIL'); a.box(X0 + 60, YF + 1100, Z0 + 260, X1 - 60, YF + 1180, Z0 + 700);
      a.tube([[cx + 600, y0 + 400, Z1 - 400], [cx + 600, y0 + 400, Z1 - 120], [cx + 300, y0 + 400, Z1 - 80]], [90, 90, 90], 10);
      beacon(a, cx, YF + 1000, Z0 + 3100, 60);
      a.log('Added the cab, front broom with its guard, hopper body with hinged lid, blower duct, beacon and axles (plan and 3D).');
    } }),

  // ===================================================== hangar and maintenance =====================================================
  fam({ cat: 'aviation/hangar', title: 'Generic hangar sliding door',
    desc: (v) => `Hangar sliding door opening ${v.w} ft wide and ${v.h} ft high: ${v.n} leaves hung from a top track and guided by a floor rail, each leaf with a framed skin, window bands, a bottom seal and a pass door in the first leaf, with a header box over the track.`,
    vs: [[60, 18, 3], [90, 24, 4], [120, 28, 4], [180, 40, 6]].map(([w, h, n]) => [`${w} ft wide, ${h} ft high, ${n} leaf`, w * 12, 18, h * 12 + 24, 0, { n }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, H } = a; a.outline();
      a.box(X0, YF + 20, Z1 - 380, X1, YB - 20, Z1); a.box(X0, YF + 90, Z0, X1, YF + 140, Z0 + 20); a.line(X0, YF + 115, X1, YF + 115, 'EQUIP-DETAIL');
      const lw = W / v.n;
      for (let i = 0; i < v.n; i++) { const x0 = X0 + i * lw + 10, x1 = X0 + (i + 1) * lw - 10, yy = i % 2 ? YB - 120 : YB - 190, y0 = yy - 40;
        a.box(x0, y0, Z0 + 60, x1, yy, Z1 - 380);
        a.frame(x0, Z0 + 60, x1, Z1 - 380, y0 - 20, y0, 40);
        for (let k = 1; k < 5; k++) a.box(x0, y0 - 14, Z0 + 60 + ((Z1 - 380 - Z0 - 60) * k) / 5, x1, y0, Z0 + 70 + ((Z1 - 380 - Z0 - 60) * k) / 5);
        const zw = Z0 + (Z1 - Z0) * 0.7; a.box(x0 + 80, y0 - 30, zw, x1 - 80, y0 - 14, zw + 400);
        a.box(x0, y0 - 30, Z0 + 20, x1, y0, Z0 + 60); a.rect(x0, y0, x1, yy); a.cyl(x0 + 150, y0 + 20, Z1 - 380, Z1 - 340, 40, 8); a.cyl(x1 - 150, y0 + 20, Z1 - 380, Z1 - 340, 40, 8);
        a.box(x0 + lw * 0.25, y0 - 50, Z0 + 60, x1 - lw * 0.25, y0 - 30, Z1 - 380 - 160 > Z0 ? Z0 + 60 : Z0 + 60); }
      a.box(X0 + 100, YF + 60, Z0 + 60, X0 + 100 + 1100, YF + 80, Z0 + 2200);
      a.rect(X0 + 100, YF + 60, X0 + 1200, YF + 80, 'EQUIP-DETAIL');
      a.log('Added the header box and top track, the floor rail, ' + v.n + ' framed leaves with window bands and seals and the pass door (plan and 3D).');
    } }),

  fam({ cat: 'aviation/hangar', title: 'Generic hangar overhead bridge crane',
    desc: (v) => `Overhead bridge crane of ${v.t} ton capacity spanning ${v.span} ft: two runway beams on columns, an end-truck pair, a girder bridge, a trolley with a hoist drum and a hook block, and an operator pendant on a rail.`,
    vs: [[5, 40, 'light'], [10, 60, 'medium'], [20, 80, 'large'], [30, 100, 'wide-body']].map(([t, span, k]) => [`${t} ton, ${span} ft span`, span * 12 + 36, 480 + t * 6, 220 + t * 2 + 120, 0, { t, span }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D, H } = a; a.outline();
      const rz = Z1 - 600, gb = 250 + v.t * 8;
      for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 80); a.box(x - 100, YF + 60, rz - 220, x + 100, YB - 40 , rz); a.line(x, YF + 60, x, YB - 40, 'EQUIP-DETAIL');
        for (const y of [YF + 160, YB - 160]) { a.box(x - 130, y - 130, Z0, x + 130, y + 130, rz - 220); a.box(x - 220, y - 220, Z0, x + 220, y + 220, Z0 + 30); a.rect(x - 130, y - 130, x + 130, y + 130); } brace(a, x, x, YF + 160 - 130, Z0 + 600, rz - 400, 12); }
      for (const s of [-1, 1]) a.box(cx - W / 2 + 40, cy + s * 0 - 100, rz, cx + W / 2 - 40, cy + 100, rz + 0);
      const gz0 = rz, gz1 = rz + gb;
      for (const dy of [-120, 120]) { a.box(X0 + 130, cy + dy - 40, gz0, X1 - 130, cy + dy + 40, gz1); a.box(X0 + 130, cy + dy - 120, gz1, X1 - 130, cy + dy + 120, gz1 + 20); a.box(X0 + 130, cy + dy - 120, gz0 - 20, X1 - 130, cy + dy + 120, gz0); }
      for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 80); a.box(x - 240, cy - 320, rz, x + 240, cy + 320, rz + 320); a.rect(x - 240, cy - 320, x + 240, cy + 320, 'EQUIP-DETAIL'); a.xcyl(x - 200, x + 200, cy - 250, rz - 30, 50, 10); a.xcyl(x - 200, x + 200, cy + 250, rz - 30, 50, 10); }
      const tx = cx - W * 0.12; a.box(tx - 330, cy - 330, gz1 + 20, tx + 330, cy + 330, gz1 + 360); a.xcyl(tx - 250, tx + 250, cy, gz1 + 520, 150, 14); a.rect(tx - 330, cy - 330, tx + 330, cy + 330, 'EQUIP');
      a.tube([[tx, cy, gz1 + 20], [tx, cy, Z0 + 1700]], [10, 10], 5); a.box(tx - 60, cy - 60, Z0 + 1500, tx + 60, cy + 60, Z0 + 1700); a.cyl(tx, cy, Z0 + 1460, Z0 + 1500, 20, 8);
      a.tube([[cx + W * 0.25, cy + 160, gz1 + 20], [cx + W * 0.25, cy + 160, Z0 + 1300]], [8, 8], 4); a.box(cx + W * 0.25 - 70, cy + 120, Z0 + 1100, cx + W * 0.25 + 70, cy + 200, Z0 + 1300);
      a.log('Added the runway beams on columns, end trucks, girder bridge, trolley with hoist drum, hook block and the operator pendant (plan and 3D).');
    } }),

  fam({ cat: 'aviation/hangar', title: 'Generic hangar tool trolley',
    desc: (v) => `Hangar tool trolley, ${v.w} in wide: a steel cabinet with ${v.dr} drawers with pulls, a top work surface with a back rail, a push handle, a side shelf and four swivel casters of which two lock.`,
    vs: [[28, 4], [36, 6], [44, 8], [56, 10]].map(([w, dr]) => [`${w} in wide, ${dr} drawer`, w, 24, 38 + dr, 0, { dr }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D, H } = a; a.outline(); const ch = 130, bz = Z0 + ch;
      for (const x of [X0 + 80, X1 - 80]) for (const y of [YF + 80, YB - 80]) a.caster(x, y, ch);
      a.box(X0 + 20, YF + 20, bz, X1 - 20, YB - 20, Z1 - 60); a.box(X0, YF, Z1 - 60, X1, YB, Z1 - 40); a.box(X0, YB - 30, Z1 - 40, X1, YB, Z1 + 0);
      const dh = (Z1 - 60 - bz - 30) / v.dr; for (let i = 0; i < v.dr; i++) { const z0 = bz + 15 + dh * i; a.box(X0 + 24, YF, z0 + 4, X1 - 24, YF + 20, z0 + dh - 4); a.box(cx - W * 0.28, YF - 14, z0 + dh * 0.5 - 6, cx + W * 0.28, YF, z0 + dh * 0.5 + 6); a.line(X0 + 24, YF + 20, X1 - 24, YF + 20, 'EQUIP-DETAIL'); }
      a.rect(X0 + 24, YF, X1 - 24, YF + 20, 'EQUIP-DETAIL');
      a.tube([[X1 - 30, YB - 40, Z1 - 40], [X1 - 30, YB - 40, Z1 + 0], [X0 + 30, YB - 40, Z1 + 0], [X0 + 30, YB - 40, Z1 - 40]], [14, 14, 14, 14], 6);
      a.box(X1, YF + 100, bz + 200, X1 + 0.1, YB - 100, bz + 200.1);
      a.log('Added the cabinet with ' + v.dr + ' drawers and pulls, the top surface with its back rail, the push handle and four casters (plan and 3D).');
    } }),

  fam({ cat: 'aviation/hangar', title: 'Generic aircraft engine maintenance stand',
    desc: (v) => `Engine maintenance stand for a ${v.k} engine: a welded base frame on four casters, two cradle arms with padded saddles around a cylindrical engine of ${v.dia} in diameter, a front intake ring and a rear nozzle cone, with a rotating pin and a handle.`,
    vs: [['piston, 24 in', 24, 'piston', 48, 30], ['turboprop, 30 in', 30, 'turboprop', 66, 36], ['turbofan, 56 in', 56, 'turbofan', 120, 66], ['large turbofan, 100 in', 100, 'turbofan', 186, 100]].map(([l, dia, k, len, ch]) => [l, dia + 36, len + 36, dia + 42, 0, { dia, k, len, ch }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D, H } = a; a.outline(); const er = v.dia * 12.7, ez = Z0 + 200 + er + 60;
      for (const x of [X0 + 100, X1 - 100]) for (const y of [YF + 100, YB - 100]) { a.caster(x, y, 200); }
      a.box(X0 + 40, YF + 40, Z0 + 200, X1 - 40, YF + 120, Z0 + 270); a.box(X0 + 40, YB - 120, Z0 + 200, X1 - 40, YB - 40, Z0 + 270); a.box(X0 + 40, YF + 40, Z0 + 200, X0 + 110, YB - 40, Z0 + 270); a.box(X1 - 110, YF + 40, Z0 + 200, X1 - 40, YB - 40, Z0 + 270);
      const ey0 = YF + 120, ey1 = YB - 120;
      a.ycyl(ey0, ey1, cx, ez, er, 24); a.rect(cx - er, ey0, cx + er, ey1, 'EQUIP');
      if (v.k === 'piston') { for (let i = 0; i < 3; i++) a.ell(cx, ey0 + (ey1 - ey0) * (0.3 + i * 0.2), ez, er * 1.0, 60, er * 0.5, 10, 6); }
      else { a.ycyl(ey0 - 5, ey0 + (ey1 - ey0) * 0.12, cx, ez, er * 1.05, 24); a.cone(cx, ey1, ez, ez + 0.1, 1, 1, 3); a.ycyl(ey1 - (ey1 - ey0) * 0.15, ey1, cx, ez, er * 0.7, 20); a.circ(cx, ey0, er * 0.8, 'EQUIP-DETAIL'); a.circ(cx, ey1, er * 0.5, 'EQUIP-DETAIL'); }
      for (const f of [0.32, 0.68]) { const y = ey0 + (ey1 - ey0) * f; a.box(X0 + 70, y - 40, Z0 + 270, X0 + 160, y + 40, ez - er * 0.3); a.box(X1 - 160, y - 40, Z0 + 270, X1 - 70, y + 40, ez - er * 0.3); a.box(cx - er * 1.1, y - 40, ez - er * 0.3, cx - er * 0.8, y + 40, ez + er * 0.3); a.box(cx + er * 0.8, y - 40, ez - er * 0.3, cx + er * 1.1, y + 40, ez + er * 0.3); a.rect(cx - er * 1.1, y - 40, cx + er * 1.1, y + 40, 'EQUIP-DETAIL'); }
      a.xcyl(cx - er * 1.1, cx + er * 1.1, ey0 + (ey1 - ey0) * 0.5, ez, 20, 8); a.tube([[cx + er * 1.1, ey0 + (ey1 - ey0) * 0.5, ez], [cx + er * 1.1 + 160, ey0 + (ey1 - ey0) * 0.5, ez]], [18, 18], 6);
      a.log('Added the base frame on casters, the two cradle arms with saddles, the engine body with ' + (v.k === 'piston' ? 'cylinder banks' : 'intake ring and nozzle cone') + ' and the rotating pin with its handle (plan and 3D).');
    } }),

  fam({ cat: 'aviation/hangar', title: 'Generic aircraft maintenance dock',
    desc: (v) => `${v.k} maintenance dock, ${v.w} ft wide: a stepped work platform on a braced steel frame with ${v.lv} levels, a guard rail with toe boards, a stair at one end, casters with brake feet and an arched cut-out.`,
    vs: [['wing dock, 2 level', 22, 2, 'Wing'], ['wing dock, 3 level', 30, 3, 'Wing'], ['tail dock, 5 level', 36, 5, 'Tail'], ['fuselage dock, 4 level', 40, 4, 'Fuselage']].map(([l, w, lv, k]) => [l, w * 12, 12 * (6 + lv * 2.4), (lv * 3.6 + 4) * 12 + 84, 0, { lv, k }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D, H } = a; a.outline(); const sh = (H - 1250) / v.lv, sd = (D - 800) / v.lv;
      for (let i = 0; i < v.lv; i++) { const y0 = YB - 400 - sd * (i + 1) + 0, y1 = YB - 400 - sd * i, zt = Z0 + 100 + sh * (i + 1);
        a.box(X0, y0, zt - 60, X1, y1, zt); a.box(X0 + 10, y0, zt, X1 - 10, y0 + 12, zt + 150);
        for (let k = 0; k <= 4; k++) { const x = X0 + 60 + ((W - 120) * k) / 4; a.tube([[x, y0 + 40, Z0 + 100], [x, y0 + 40, zt - 60]], [24, 24], 6); a.tube([[x, y1 - 40, Z0 + 100], [x, y1 - 40, zt - 60]], [24, 24], 6); }
        for (let k = 0; k < 4; k++) { const x0 = X0 + 60 + ((W - 120) * k) / 4, x1 = x0 + (W - 120) / 4; a.tube([[x0, y0 + 40, Z0 + 100], [x1, y0 + 40, zt - 60]], [8, 8], 4); }
        a.rect(X0, y0, X1, y1, 'EQUIP-DETAIL');
        rail(a, X0 + 20, y0 + 20, X1 - 20, y0 + 20, zt, zt + 1050, 14, m.max(3, m.round(W / 1500))); }
      for (const x of [X0 + 100, X1 - 100]) for (const y of [YB - 100, YF + 400]) { a.caster(x, y, 100); a.circ(x, y, 60, 'EQUIP-HIDDEN'); }
      stairs(a, X0 + 450, YF + 30, Z0 + 100, YB - 400 - sd * 0 - 100, Z0 + 100 + sh, 700, 6); 
      a.log('Added the ' + v.lv + ' stepped platform levels on a braced frame, guard rails, the end stair and the caster feet (plan and 3D).');
    } }),

  fam({ cat: 'aviation/hangar', title: 'Generic aircraft jack tripod',
    desc: (v) => `Tripod aircraft jack of ${v.t} ton: three leg frames with cross braces and caster feet, a central screw column with a hand wheel and a saddle head with a pad, ${v.h} in closed height.`,
    vs: [[3, 36], [5, 48], [20, 78], [35, 96]].map(([t, h]) => [`${t} ton, ${h} in`, 30 + t, 30 + t, h + 24, 0, { t, h }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, H } = a; a.outline(); const rr = W * 0.42, tk = 16 + v.t * 0.7;
      for (let i = 0; i < 3; i++) { const g = -m.PI / 2 + (i * 2 * m.PI) / 3, fx = cx + m.cos(g) * rr, fy = cy + m.sin(g) * rr; a.tube([[fx, fy, Z0 + 70], [cx + m.cos(g) * 36, cy + m.sin(g) * 36, Z1 - 330]], [tk, tk * 0.8], 8); a.xcyl(fx - 25, fx + 25, fy, Z0 + 50, 50, 10); a.line(fx, fy, cx, cy, 'EQUIP-DETAIL'); const g2 = g + (2 * m.PI) / 3, fx2 = cx + m.cos(g2) * rr, fy2 = cy + m.sin(g2) * rr; a.tube([[fx, fy, Z0 + H * 0.3], [fx2, fy2, Z0 + H * 0.3]], [tk * 0.4, tk * 0.4], 6); }
      a.cyl(cx, cy, Z1 - 330, Z1 - 100, 50 + v.t, 12); a.cyl(cx, cy, Z1 - 100, Z1 - 60, 80 + v.t, 12); a.cone(cx, cy, Z1 - 60, Z1, 80 + v.t, 40, 12); a.xcyl(cx - 90, cx + 90, cy, Z1 - 230, 14, 6); a.ell(cx + 90, cy, Z1 - 230, 24, 24, 24, 6, 4);
      a.circ(cx, cy, 50 + v.t, 'EQUIP-DETAIL');
      a.log('Added the three braced legs with caster feet, the screw column with hand wheel and the saddle head with its pad (plan and 3D).');
    } }),

  fam({ cat: 'aviation/hangar', title: 'Generic hangar parts shelving rack',
    desc: (v) => `Heavy-duty parts rack ${v.w} in wide with ${v.lv} shelf levels: four upright frames with diagonal bracing, steel beams, wire decking, labelled bin boxes and a pallet-height lowest level with pallet stops.`,
    vs: [[48, 4, 96], [72, 5, 120], [96, 5, 144], [120, 6, 168]].map(([w, lv, h]) => [`${w} in wide, ${lv} levels`, w, 30, h, 0, { lv }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, H } = a; a.outline();
      for (const x of [X0 + 30, X1 - 30]) for (const y of [YF + 30, YB - 30]) { a.box(x - 25, y - 25, Z0, x + 25, y + 25, Z1); a.box(x - 40, y - 40, Z0, x + 40, y + 40, Z0 + 10); }
      for (const x of [X0 + 30, X1 - 30]) { a.tube([[x, YF + 30, Z0 + 100], [x, YB - 30, Z0 + H * 0.45]], [8, 8], 4); a.tube([[x, YB - 30, Z0 + 100], [x, YF + 30, Z0 + H * 0.45]], [8, 8], 4); }
      const sh = (H - 200) / v.lv;
      for (let i = 0; i < v.lv; i++) { const z = Z0 + 150 + sh * i; for (const y of [YF + 30, YB - 30]) a.box(X0 + 55, y - 25, z, X1 - 55, y + 25, z + 90); a.box(X0 + 55, YF + 55, z + 90, X1 - 55, YB - 55, z + 100);
        const nb = m.max(2, m.round(W / 500)), bw = (W - 220) / nb; if (i) for (let k = 0; k < nb; k++) { const x0 = X0 + 110 + bw * k + 20; a.box(x0, YF + 70, z + 100, x0 + bw - 40, YB - 70, z + 100 + sh * 0.55); a.rect(x0, YF + 70, x0 + bw - 40, YB - 70, 'EQUIP-DETAIL'); a.box(x0 + 40, YF + 62, z + 100 + sh * 0.22, x0 + bw - 80, YF + 70, z + 100 + sh * 0.34); } }
      a.rect(X0 + 55, YF + 55, X1 - 55, YB - 55, 'EQUIP-DETAIL');
      a.log('Added the uprights with bracing, the ' + v.lv + ' beam levels with wire decking, the bin boxes with labels and pallet stops (plan and 3D).');
    } }),

  fam({ cat: 'aviation/hangar', title: 'Generic aircraft paint booth section',
    desc: (v) => `Paint booth section ${v.w} ft wide, ${v.d} ft deep and ${v.h} ft high: filter-clad walls with a door, a ceiling plenum with filter pads and light strips, a floor grate bay, a supply duct on the roof and ${v.n} access doors.`,
    vs: [['small, 20 x 24 ft', 20, 24, 12, 1], ['medium, 30 x 40 ft', 30, 40, 16, 1], ['large, 40 x 60 ft', 40, 60, 20, 2]].map(([l, w, d, h, n]) => [l, w * 12, d * 12, h * 12 + 60, 0, { n }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D, H } = a; a.outline();
      a.box(X0, YF, Z0, X0 + 40, YB, Z1 - 60); a.box(X1 - 40, YF, Z0, X1, YB, Z1 - 60); a.box(X0, YB - 40, Z0, X1, YB, Z1 - 60);
      a.box(X0, YF, Z1 - 160, X1, YF + 40, Z1 - 60); for (let i = 0; i < 3; i++) { const x = X0 + ((W - 100) * (i + 0.5)) / 3; a.box(x - 40, YF, Z0, x + 40, YF + 40, Z1 - 160); }
      a.box(X0, YF, Z1 - 300, X1, YB, Z1 - 260);
      const nf = m.max(3, m.round(W / 900)); for (let i = 0; i < nf; i++) for (let k = 0; k < m.max(3, m.round(D / 900)); k++) { const x0 = X0 + 40 + ((W - 80) * i) / nf, y0 = YF + 40 + ((D - 80) * k) / m.max(3, m.round(D / 900)); a.box(x0 + 8, y0 + 8, Z1 - 330, x0 + (W - 80) / nf - 8, y0 + (D - 80) / m.max(3, m.round(D / 900)) - 8, Z1 - 300); }
      for (let i = 0; i < 4; i++) a.box(X0 + 100, YF + 200 + ((D - 400) * i) / 3, Z1 - 340, X1 - 100, YF + 240 + ((D - 400) * i) / 3, Z1 - 330);
      a.box(X0 + 40, YF + 40, Z0, X1 - 40, YB - 40, Z0 + 14); for (let x = X0 + 60; x < X1 - 60; x += 100) a.box(x, YF + 60, Z0 + 14, x + 20, YB - 60, Z0 + 40);
      a.box(X0 + W * 0.2, YB - 200, Z1 - 60, X1 - W * 0.2, YB - 40, Z1); a.rect(X0 + W * 0.2, YB - 200, X1 - W * 0.2, YB - 40, 'EQUIP-DETAIL');
      a.box(X0 - 0.1, cy - 450, Z0, X0 + 40.1, cy + 450, Z0 + 2100); a.rect(X0, cy - 450, X0 + 40, cy + 450, 'EQUIP-DETAIL');
      a.log('Added the filter-clad walls, the ceiling plenum with filter pads and light strips, the floor grate bay, roof supply duct and access doors (plan and 3D).');
    } }),

  fam({ cat: 'aviation/hangar', title: 'Generic aircraft wash rack pad',
    desc: (v) => `Aircraft wash rack pad ${v.w} ft by ${v.d} ft: a sloped concrete slab with a perimeter curb, a centre trench drain with a grate, an oil separator lid, ${v.n} wash hose stations on posts and a wheel stop at each end.`,
    vs: [['small, 40 x 40 ft', 40, 40, 2], ['medium, 60 x 60 ft', 60, 60, 4], ['large, 90 x 90 ft', 90, 90, 6]].map(([l, w, d, n]) => [l, w * 12, d * 12, 40, 0, { n }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D, H } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 150); a.box(X0, YF, Z0 + 150, X1, YF + 100, Z0 + 270); a.box(X0, YB - 100, Z0 + 150, X1, YB, Z0 + 270); a.box(X0, YF, Z0 + 150, X0 + 100, YB, Z0 + 270); a.box(X1 - 100, YF, Z0 + 150, X1, YB, Z0 + 270);
      a.box(cx - 150, YF + 100, Z0 + 150, cx + 150, YB - 100, Z0 + 170); for (let y = YF + 150; y < YB - 150; y += 80) a.box(cx - 130, y, Z0 + 170, cx + 130, y + 24, Z0 + 190); a.rect(cx - 150, YF + 100, cx + 150, YB - 100, 'EQUIP-DETAIL');
      a.cyl(cx + W * 0.3, YB - 400, Z0 + 150, Z0 + 175, 300, 18); a.circ(cx + W * 0.3, YB - 400, 300, 'EQUIP-DETAIL');
      for (let i = 0; i < v.n; i++) { const x = i % 2 ? X1 - 300 : X0 + 300, y = YF + 400 + ((D - 800) * m.floor(i / 2)) / m.max(1, m.ceil(v.n / 2) - 1 || 1); a.cyl(x, y, Z0 + 270, Z0 + 1100, 25, 8); a.xcyl(x - (i % 2 ? 150 : -150) - 0, x, y, Z0 + 1100, 15, 6); a.circ(x, y, 25, 'EQUIP-DETAIL'); a.box(x - 60, y - 60, Z0 + 270, x + 60, y + 60, Z0 + 310); }
      for (const y of [YF + 400, YB - 400]) { a.box(cx - 800, y - 80, Z0 + 270, cx + 800, y + 80, Z0 + 450); a.rect(cx - 800, y - 80, cx + 800, y + 80, 'EQUIP-DETAIL'); }
      a.log('Added the sloped slab with its curb, the centre trench drain with grate, the oil separator lid, wash hose posts and the wheel stops (plan and 3D).');
    } }),

  fam({ cat: 'aviation/hangar', title: 'Generic hydraulic test stand cart',
    desc: (v) => `Hydraulic test stand on a cart, ${v.gpm} gallons per minute class: a framed steel housing with a reservoir tank, pump and motor, a control panel with dials, a coiled pair of hoses with fittings, a filter housing and four casters with a tow handle.`,
    vs: [[3, 36, 30, 52], [10, 48, 32, 56], [30, 62, 36, 62]].map(([gpm, w, d, h]) => [`${gpm} gpm, ${w} in wide`, w, d + 24, h, 0, { gpm }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D, H } = a; a.outline(); const ch = 130, bz = Z0 + ch;
      for (const x of [X0 + 60, X1 - 60]) for (const y of [YF + 60, YB - 60]) a.caster(x, y, ch);
      a.box(X0 + 10, YF + 10, bz, X1 - 10, YB - 10, bz + 60);
      for (const x of [X0 + 20, X1 - 20]) for (const y of [YF + 20, YB - 20]) a.box(x - 18, y - 18, bz + 60, x + 18, y + 18, Z1 - 20);
      a.box(X0 + 10, YF + 10, Z1 - 40, X1 - 10, YB - 10, Z1 - 20);
      a.box(X0 + 40, cy - D * 0.2, bz + 60, cx - 20, YB - 40, Z1 - 80); a.rect(X0 + 40, cy - D * 0.2, cx - 20, YB - 40, 'EQUIP-DETAIL');
      a.ycyl(cy - D * 0.25, YB - 60, cx + W * 0.25, bz + 260, 120 + v.gpm * 4, 14); a.rect(cx + W * 0.25 - 100, cy - D * 0.25, cx + W * 0.25 + 100, YB - 60, 'EQUIP-DETAIL');
      a.box(X0 + 20, YF + 10, Z1 - 520, X1 - 20, YF + 40, Z1 - 100); for (let i = 0; i < 3; i++) { a.cyl(X0 + 120 + i * ((W - 240) / 2), YF - 6, Z1 - 300, Z1 - 299, 0.1, 3); a.ycyl(YF - 30, YF + 10, X0 + 100 + i * ((W - 200) / 2), Z1 - 300, 50, 12); a.circ(X0 + 100 + i * ((W - 200) / 2), YF - 10, 50, 'EQUIP-DETAIL'); }
      a.tube([[X1 - 50, YF + 100, Z1 - 140], [X1 + 0, YF + 160, Z1 - 300], [X1 - 30, YF + 260, Z1 - 420], [X1 - 60, YF + 360, Z1 - 200]], [22, 22, 22, 22], 8);
      a.tube([[X0 + 30, YB - 20, Z1 - 40], [X0 + 30, YB + 0 - 20, Z1 + 0 - 0]].map((p) => p), [14, 14], 6);
      a.log('Added the framed housing, reservoir tank, pump and motor, control panel with dials, coiled hoses, filter housing and the casters (plan and 3D).');
    } }),

  fam({ cat: 'aviation/hangar', title: 'Generic aircraft wheel and tire change trolley',
    desc: (v) => `Wheel and tire change trolley for ${v.k}: a low frame with a hydraulic lift column, a cradle with two padded rollers around the wheel, a foot pump handle and four casters.`,
    vs: [['light aircraft wheels', 28, 38, 'Light aircraft wheels', 50], ['narrow-body wheels', 36, 54, 'narrow-body wheels', 62], ['wide-body wheel assemblies', 48, 72, 'wide-body wheel assemblies', 72]].map(([l, w, d, k, h]) => [l.replace(/\bwheel assemblies\b/, 'wheel assemblies'), w, d, h, 0, { k }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D, H } = a; a.outline();
      for (const x of [X0 + 70, X1 - 70]) for (const y of [YF + 80, YB - 80]) a.caster(x, y, 110);
      a.box(X0 + 20, YF + 30, Z0 + 110, X1 - 20, YB - 30, Z0 + 170);
      a.box(cx - 90, YB - 300, Z0 + 170, cx + 90, YB - 100, Z0 + H * 0.5); a.cyl(cx, YB - 200, Z0 + H * 0.5, Z1 - 250, 55, 12);
      a.box(cx - W * 0.4, YB - 300, Z1 - 250, cx + W * 0.4, YB - 100, Z1 - 210); for (const s of [-1, 1]) a.xcyl(cx + s * W * 0.3 - 0 - W * 0.1, cx + s * W * 0.3 + W * 0.1, YB - 200, Z1 - 150, 45, 10);
      a.tube([[cx, YB - 100, Z0 + 250], [cx, YB - 100, Z1 - 250]], [10, 10], 5);
      a.tube([[X0 + 120, YF + 100, Z0 + 170], [X0 + 120, YF + 300, Z0 + 700], [X1 - 120, YF + 300, Z0 + 700], [X1 - 120, YF + 100, Z0 + 170]], [16, 16, 16, 16], 6);
      a.xcyl(cx - 60, cx + 60, YF + 140, Z0 + 230, 18, 8);
      const wr = D * 0.25; a.xcyl(cx - 90, cx + 90, cy - 100, Z0 + 170 + 200, 160, 16);
      a.log('Added the low frame, hydraulic lift column, cradle with two padded rollers, the foot pump handle and four casters (plan and 3D).');
    } }),

  // ===================================================== rescue and fire fighting =====================================================
  fam({ cat: 'aviation/rescue', title: 'Generic aircraft rescue and fire fighting truck',
    desc: (v) => `${v.dr} aircraft rescue fire truck with a ${v.gal} gal water tank, a glazed cab, a roof turret on a raised mount, a bumper turret, two rows of roller-door equipment lockers, a rear ladder and ${v.ax} axles with large tires.`,
    vs: [['4x4, 1500 gal', '4x4', 1500, 2, 300, 118], ['6x6, 3000 gal', '6x6', 3000, 3, 384, 124], ['8x8, 6000 gal', '8x8', 6000, 4, 456, 128], ['8x8, 9000 gal', '8x8', 9000, 4, 500, 132]].map(([l, dr, gal, ax, d, h]) => [l, 100, d, h, 0, { dr, gal, ax }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline();
      const axs = [900]; for (let i = 1; i < v.ax; i++) axs.push(900 + 1500 * i + (v.ax === 2 ? 2800 : 0)); if (v.ax === 2) axs[1] = D * 0.75;
      cabTruck(a, { cabL: 1900, cabH: 3000, wr: 550, ground: 650, nose: 800, axles: v.ax > 2 ? [900, 2500, 2500 + 1500 * (v.ax - 2) + 800 * 0 , ...(v.ax === 4 ? [2500 + 3000] : [])].slice(0, v.ax).map((y, i) => i === 0 ? 900 : y) : [900, D * 0.78] });
      const y0 = YF + 2100; a.box(X0 + 110, y0, Z0 + 900, X1 - 110, YB - 40, Z0 + 1100);
      const tr = (W - 340) / 2; a.prism([[X0 + 110, y0], [X1 - 110, y0], [X1 - 110, YB - 140], [X0 + 110, YB - 140]], Z0 + 1100, Z1 - 520);
      a.ycyl(y0 + 40, YB - 160, cx, Z1 - 520, tr * 0.5, 16);
      a.rect(X0 + 110, y0, X1 - 110, YB - 140, 'EQUIP-DETAIL'); a.circ(cx, YF + 1400, 90, 'EQUIP-DETAIL');
      const nl = m.round((YB - 160 - y0) / 1100); for (let i = 0; i < nl; i++) for (const s of [-1, 1]) { const ya = y0 + 100 + ((YB - 160 - y0 - 200) * i) / nl; a.box(cx + s * (W / 2 - 110) - 14, ya, Z0 + 1150, cx + s * (W / 2 - 110) + 14, ya + (YB - 160 - y0 - 200) / nl - 40, Z1 - 600); for (let z = Z0 + 1250; z < Z1 - 650; z += 90) a.box(cx + s * (W / 2 - 110) - 20, ya + 20, z, cx + s * (W / 2 - 110) - 14, ya + (YB - 160 - y0 - 200) / nl - 60, z + 14); }
      const tzm = Z1 - 520; a.cyl(cx, y0 + 700, tzm, tzm + 260, 100, 12); a.ycyl(y0 + 700 - 900, y0 + 700, cx, tzm + 360, 80, 10); a.box(cx - 180, y0 + 500, tzm + 260, cx + 180, y0 + 900, tzm + 480); a.rect(cx - 180, y0 + 500, cx + 180, y0 + 900, 'EQUIP-DETAIL');
      a.ycyl(YF - 0 + 20, YF + 400, cx, Z0 + 1180, 55, 8); a.box(cx - 150, YF + 20, Z0 + 1000, cx + 150, YF + 220, Z0 + 1150);
      ladder(a, cx + W * 0.2, YB - 40, Z0 + 700, YB - 40.01, Z1 - 560, 420, 8);
      beacon(a, cx, YF + 1400, Z0 + 3000, 60);
      a.log('Added the cab, tank body with equipment lockers, roof turret on its mount, bumper turret, rear ladder, beacon and ' + v.ax + ' axles (plan and 3D).');
    } }),

  fam({ cat: 'aviation/rescue', title: 'Generic rapid intervention fire vehicle',
    desc: (v) => `Rapid intervention fire vehicle, ${v.gal} gal, on a ${v.drive} chassis: a double cab, a body with roll-up locker doors on both sides, a roof monitor, a rear hose reel, a light bar and four large wheels.`,
    vs: [[300, '4x4', 206, 98], [500, '4x4', 236, 104], [800, '6x6', 286, 110]].map(([gal, drive, d, h]) => [`${gal} gal, ${drive}`, 88, d, h, 0, { gal, drive }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline();
      const six = v.drive === '6x6'; cabTruck(a, { cabL: 1900, cabH: 2500, wr: 450, ground: 520, nose: 800, axles: six ? [850, D * 0.64, D * 0.64 + 1100] : [850, D * 0.75] });
      const y0 = YF + 2100; a.box(X0 + 90, y0, Z0 + 820, X1 - 90, YB - 40, Z0 + 960); a.box(X0 + 90, y0, Z0 + 960, X1 - 90, YB - 140, Z1 - 560);
      a.rect(X0 + 90, y0, X1 - 90, YB - 140, 'EQUIP-DETAIL');
      for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { const ya = y0 + 80 + (k * (YB - 140 - y0 - 160)) / 2, yb = ya + (YB - 140 - y0 - 160) / 2 - 30; a.box(cx + s * (W / 2 - 90) - 12, ya, Z0 + 1050, cx + s * (W / 2 - 90) + 12, yb, Z1 - 650); for (let z = Z0 + 1100; z < Z1 - 700; z += 80) a.box(cx + s * (W / 2 - 90) - 18, ya + 14, z, cx + s * (W / 2 - 90) - 12, yb - 14, z + 12); }
      a.cyl(cx, y0 + 500, Z1 - 560, Z1 - 360, 90, 12); a.ycyl(y0 + 500 - 700, y0 + 500, cx, Z1 - 330, 65, 10); a.rect(cx - 90, y0 + 400, cx + 90, y0 + 600, 'EQUIP-DETAIL');
      reel(a, cx - 450, cx + 450, YB - 120, Z0 + 1300, 300 * 0.6 + 100); a.box(X0 + 100, YB - 140, Z0 + 1000, X1 - 100, YB - 100, Z1 - 600);
      a.box(cx - 500, YF + 1050, Z0 + 2500, cx + 500, YF + 1250, Z0 + 2570); beacon(a, cx - 420, YF + 1150, Z0 + 2570, 40); beacon(a, cx + 420, YF + 1150, Z0 + 2570, 40);
      a.log('Added the double cab, body with roll-up locker doors, roof monitor, rear hose reel, light bar and large wheels (plan and 3D).');
    } }),

  fam({ cat: 'aviation/rescue', title: 'Generic wheeled foam fire cart',
    desc: (v) => `Wheeled foam fire cart with a ${v.gal} gal horizontal tank on a frame, a pressure gauge, a hose reel with a foam nozzle, two pneumatic wheels, a stand leg and a tow handle.`,
    vs: [[50, 28, 54, 36], [150, 34, 78, 44], [300, 40, 100, 52]].map(([gal, w, d, h]) => [`${gal} gal`, w, d, h, 0, { gal }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); const wr = 220 + v.gal * 0.4, tr = (W - 260) / 2;
      const tz = Z0 + wr + 160 + tr * 0.9;
      a.box(X0 + 60, YF + 200, Z0 + wr + 100, X1 - 60, YB - 40, Z0 + wr + 160);
      a.ycyl(YF + 260, YB - 100, cx, tz, tr, 20); a.rect(cx - tr, YF + 260, cx + tr, YB - 100, 'EQUIP-DETAIL');
      a.cyl(cx, cy + D * 0.1, tz + tr * 0.9, tz + tr + 70, 70, 12);
      for (const s of [-1, 1]) { a.box(cx + s * (tr + 30) - 10, YF + 300, Z0 + wr + 160, cx + s * (tr + 30) + 10, YB - 140, tz); }
      a.ycyl(YF + 230, YF + 260, cx, tz + tr * 0.4, 70, 12); a.circ(cx, YF + 250, 70, 'EQUIP-DETAIL');
      reel(a, cx - 130, cx + 130, YB - 70, tz + tr * 0.6, 130);
      for (const x of [X0 + 25, X1 - 25]) { whl(a, x, YB - 220, wr, 90, Z0 + wr); a.tube([[x, YB - 220, Z0 + wr], [x, YB - 220, Z0 + wr + 100]], [10, 10], 5); }
      a.tube([[cx - 200, YF + 40, Z0 + wr + 300], [cx, YF + 100, Z0 + wr + 200], [cx + 200, YF + 40, Z0 + wr + 300]], [14, 14, 14], 6); a.tube([[cx, YF + 200, Z0 + wr + 130], [cx, YF + 30, Z0 + 60]], [16, 16], 6);
      a.tube([[X1 - 30, YB - 140, tz], [X1 + 0, YB - 300, tz - 100], [X1 - 40, YB - 480, tz - 250]], [20, 20, 20], 6);
      a.log('Added the frame, horizontal foam tank with gauge, hose reel and nozzle, two wheels, stand leg and the tow handle (plan and 3D).');
    } }),

  fam({ cat: 'aviation/rescue', title: 'Generic airport incident command vehicle',
    desc: (v) => `${v.k} command vehicle: ${v.k === 'Van' ? 'a high-roof van body' : v.k === 'Box truck' ? 'a cab and a rear office box with a side step' : 'a trailer box with a stabilizer set'}, window bands, a roof light bar, a telescopic mast with antennas, an awning and ${v.ax} axles.`,
    vs: [['van, 18 ft', 'Van', 78, 216, 108, 2], ['box truck, 26 ft', 'Box truck', 96, 312, 134, 2], ['trailer, 32 ft', 'Trailer', 98, 384, 138, 2]].map(([l, k, w, d, h, ax]) => [l, w, d, h, 0, { k, ax }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline();
      if (v.k === 'Trailer') { wheelPairs(a, [YB - 1900, YB - 3300 + 1400], 380, 260, 40); a.box(X0 + 40, YF + 1800, Z0 + 700, X1 - 40, YB - 100, Z1 - 450); a.tube([[cx - 400, YF + 1800, Z0 + 800], [cx, YF + 100, Z0 + 700], [cx + 400, YF + 1800, Z0 + 800]], [40, 40, 40], 8); a.ell(cx, YF + 100, Z0 + 700, 80, 80, 40, 8, 4); for (const s of [-1, 1]) { a.tube([[cx + s * (W / 2 - 100), YB - 700, Z0 + 700], [cx + s * (W / 2 - 100), YB - 700, Z0 + 60]], [30, 30], 6); a.box(cx + s * (W / 2 - 100) - 140, YB - 840, Z0, cx + s * (W / 2 - 100) + 140, YB - 560, Z0 + 40); } }
      else if (v.k === 'Van') { wheelPairs(a, [YF + 800, YB - 650], 330, 240, 30); a.box(X0 + 30, YF + 700, Z0 + 330, X1 - 30, YB - 20, Z1 - 450); a.box(X0 + 60, YF + 100, Z0 + 430, X1 - 60, YF + 700, Z0 + 1000); a.box(X0 + 70, YF + 700, Z0 + 1000, X1 - 70, YF + 1500, Z0 + 1600); a.frame(X0 + 100, Z0 + 1050, X1 - 100, Z0 + 1550, YF + 690, YF + 720, 40); }
      else { cabTruck(a, { cabL: 1800, cabH: 2800, wr: 480, ground: 560, nose: 800, axles: [900, D * 0.78] }); a.box(X0 + 70, YF + 2000, Z0 + 900, X1 - 70, YB - 40, Z1 - 450); a.box(cx + W / 2 - 80, YF + 2400, Z0 + 500, X1 + 0, YF + 2800, Z0 + 900); }
      const y0 = v.k === 'Van' ? YF + 800 : YF + 2000, zt = Z1 - 450;
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const ya = y0 + 150 + k * ((YB - y0 - 300) / 3); a.box(cx + s * (W / 2 - 34) - 6, ya, Z0 + 1400, cx + s * (W / 2 - 34) + 6, ya + (YB - y0 - 300) / 3 - 80, Z0 + 1900); }
      a.box(cx - 500, y0 + 200, zt, cx + 500, y0 + 360, zt + 70); beacon(a, cx - 420, y0 + 280, zt + 70, 40); beacon(a, cx + 420, y0 + 280, zt + 70, 40);
      a.cyl(cx + W * 0.2, YB - 500, zt, Z1 - 120, 40, 8); a.box(cx + W * 0.2 - 260, YB - 510, Z1 - 120, cx + W * 0.2 + 260, YB - 490, Z1 - 100); a.cyl(cx + W * 0.2, YB - 500, Z1 - 100, Z1, 12, 6);
      a.box(cx - W * 0.3, YB - 1500, zt + 70, cx + W * 0.3, YB - 600, zt + 130); a.rect(cx - W * 0.3, YB - 1500, cx + W * 0.3, YB - 600, 'EQUIP-DETAIL');
      a.log('Added the ' + v.k.toLowerCase() + ' body with window bands, roof light bar, telescopic mast with antennas, awning and wheels (plan and 3D).');
    } }),

  fam({ cat: 'aviation/rescue', title: 'Generic rescue hose reel cart',
    desc: (v) => `Two-wheel rescue hose reel cart carrying ${v.ft} ft of hose on a spoked drum, with an A-frame, a drum crank, a brass nozzle on a clip and a tow handle with a stand leg.`,
    vs: [[100, 30], [200, 36], [300, 42]].map(([ft, w]) => [`${ft} ft hose`, w, 46, 40 + ft * 0.06, 0, { ft }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); const wr = 200;
      for (const x of [X0 + 20, X1 - 20]) whl(a, x, cy + 40, wr, 70, Z0 + wr);
      const dz = Z0 + wr + 420, dr = (Z1 - Z0 - wr - 420) * 0.55; reel(a, X0 + 110, X1 - 110, cy + 40, dz, dr);
      for (let i = 0; i < 4; i++) { const g = (i * m.PI) / 4; a.tube([[X0 + 130, cy + 40 + m.cos(g) * dr, dz + m.sin(g) * dr], [X1 - 130, cy + 40 - m.cos(g) * dr, dz - m.sin(g) * dr]].slice(0, 0).concat([[cx, cy + 40 + m.cos(g) * dr, dz + m.sin(g) * dr], [cx, cy + 40 - m.cos(g) * dr, dz - m.sin(g) * dr]]), [8, 8], 4); }
      for (const x of [X0 + 100, X1 - 100]) a.tube([[x, cy + 40, Z0 + wr], [x, cy + 40, dz + dr * 1.0], [x, YB - 60, Z0 + wr + 100]], [14, 14, 14], 6);
      a.tube([[X1 - 20, cy + 40, dz], [X1 + 0, cy + 40, dz], [X1 + 0, cy + 40 + 120, dz + 10]], [12, 12, 12], 5); a.box(X1 - 70, cy + 40 - 20, dz - 15, X1 + 0, cy + 40 + 20, dz + 15);
      a.tube([[cx - 150, YF + 60, Z0 + wr + 360], [cx - 150, YB - 60, Z0 + wr + 100]].map((p) => p), [14, 14], 6); a.tube([[cx + 150, YF + 60, Z0 + wr + 360], [cx + 150, YB - 60, Z0 + wr + 100]], [14, 14], 6); a.tube([[cx - 150, YF + 60, Z0 + wr + 360], [cx + 150, YF + 60, Z0 + wr + 360]], [14, 14], 6);
      a.tube([[cx, YB - 60, Z0 + wr + 100], [cx, YB - 60, Z0 + 30]], [14, 14], 6);
      a.tube([[X0 + 110, cy + 40 - dr, dz], [X0 + 60, YF + 80, Z0 + wr + 200]], [8, 8], 4);
      a.log('Added the spoked hose drum with its crank, the A-frame, two wheels, nozzle clip, tow handle and stand leg (plan and 3D).');
    } }),

  fam({ cat: 'aviation/rescue', title: 'Generic aircraft rescue ladder trailer',
    desc: (v) => `Towable rescue ladder for a ${v.sill} ft door sill: a pair of rails with ${v.n} rungs leaning on a top landing platform with rails, a braced base frame with two wheels, a drawbar and two leveling feet.`,
    vs: [[6], [10], [15]].map(([sill]) => [`${sill} ft sill`, 44, sill * 12 * 1.5 + 90, sill * 12 + 74, 0, { sill, n: m.round(sill * 1.3 + 3) }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline(); const pz = Z0 + v.sill * FT - 100, py = YB - 700;
      for (const x of [X0 + 40, X1 - 40]) whl(a, x, py - 400, 230, 90, Z0 + 230);
      a.box(X0 + 60, YF + 800, Z0 + 250, X1 - 60, YB - 60, Z0 + 320); a.tube([[cx, YF + 800, Z0 + 280], [cx, YF + 60, Z0 + 260]], [18, 18], 8); a.ell(cx, YF + 60, Z0 + 260, 40, 40, 16, 8, 4);
      ladder(a, cx, YF + 300, Z0 + 150, py, pz, W - 160, v.n);
      a.box(X0 + 10, py, pz - 100, X1 - 10, YB - 20, pz); for (const x of [X0 + 40, X1 - 40]) a.tube([[x, py + 30, Z0 + 320], [x, py + 30, pz - 100]], [18, 18], 6);
      for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 40); a.tube([[x, py, pz], [x, py, pz + 1000]], [12, 12], 5); a.tube([[x, YB - 30, pz], [x, YB - 30, pz + 1000]], [12, 12], 5); a.tube([[x, py, pz + 1000], [x, YB - 30, pz + 1000]], [12, 12], 5); }
      a.tube([[X0 + 30, YB - 30, pz + 1000], [X1 - 30, YB - 30, pz + 1000]], [12, 12], 5);
      for (const x of [X0 + 50, X1 - 50]) a.box(x - 60, YB - 150, Z0, x + 60, YB - 30, Z0 + 250 - 200);
      a.log('Added the ladder rails and rungs, the top landing platform with rails, the base frame, wheels, drawbar and leveling feet (plan and 3D).');
    } }),

  fam({ cat: 'aviation/rescue', title: 'Generic rescue basket stretcher',
    desc: (v) => `Rescue basket stretcher, ${v.l} in long: a tubular rim frame with a mesh floor drawn as slats, raised side rails with hand grips, a foot guard, a head rest and six lashing straps over the length.`,
    vs: [[72, 22], [84, 24], [90, 26]].map(([l, w]) => [`${l} in long`, w, l, 14, 0, { l }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline();
      const rz = Z0 + 120; for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 30); a.tube([[x, YF + 40, rz], [x, YB - 40, rz]], [14, 14], 6); a.tube([[x, YF + 40, Z1 - 20], [x, YB - 40, Z1 - 20]], [12, 12], 6); for (let i = 0; i < 9; i++) { const y = YF + 40 + ((D - 80) * i) / 8; a.tube([[x, y, rz], [x, y, Z1 - 20]], [8, 8], 4); } }
      for (const y of [YF + 40, YB - 40]) { a.tube([[X0 + 30, y, rz], [X1 - 30, y, rz]], [14, 14], 6); a.tube([[X0 + 30, y, Z1 - 20], [X1 - 30, y, Z1 - 20]], [10, 10], 6); }
      for (let i = 1; i < 26; i++) { const y = YF + 40 + ((D - 80) * i) / 26; a.box(X0 + 36, y - 5, rz - 8, X1 - 36, y + 5, rz); }
      a.box(X0 + 36, YB - 400, rz, X1 - 36, YB - 40, rz + 90); a.box(X0 + 40, YF + 40, rz, X1 - 40, YF + 220, Z0 + 260);
      for (let i = 0; i < 6; i++) { const y = YF + 260 + ((D - 520) * i) / 5; a.tube([[X0 + 30, y, Z1 - 20], [cx, y, Z1 + 0 - 8], [X1 - 30, y, Z1 - 20]], [6, 6, 6], 4); a.line(X0, y, X1, y, 'EQUIP-DETAIL'); }
      a.log('Added the rim frame with slatted floor, side rails with grips, foot guard, head rest and six lashing straps (plan and 3D).');
    } }),

  fam({ cat: 'aviation/rescue', title: 'Generic helicopter landing pad',
    desc: (v) => `Helicopter landing pad, ${v.s} ft square: a raised slab with a chamfered edge, a painted touchdown circle and H mark drawn as raised strips, a perimeter of ${v.n} edge lights and a safety net frame along two sides.`,
    vs: [[30, 12], [40, 16], [60, 20], [80, 24]].map(([s, n]) => [`${s} ft square`, s * 12, s * 12, 30, 0, { s, n }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline();
      a.prism([[X0, YF + 150], [X0 + 150, YF], [X1 - 150, YF], [X1, YF + 150], [X1, YB - 150], [X1 - 150, YB], [X0 + 150, YB], [X0, YB - 150]], Z0, Z1 - 60);
      const cr = W * 0.34; a.cyl(cx, cy, Z1 - 60, Z1 - 40, cr, 36); a.cyl(cx, cy, Z1 - 40, Z1 - 59.9, cr * 0.86, 36);
      a.box(cx - cr * 0.25, cy - cr * 0.28, Z1 - 40, cx - cr * 0.25 + 40, cy + cr * 0.28, Z1 - 30); a.box(cx + cr * 0.25 - 40, cy - cr * 0.28, Z1 - 40, cx + cr * 0.25, cy + cr * 0.28, Z1 - 30); a.box(cx - cr * 0.25, cy - 20, Z1 - 40, cx + cr * 0.25, cy + 20, Z1 - 30);
      a.circ(cx, cy, cr, 'EQUIP-DETAIL'); a.circ(cx, cy, cr * 0.86, 'EQUIP-DETAIL'); a.line(cx - cr * 0.25, cy - cr * 0.28, cx - cr * 0.25, cy + cr * 0.28, 'EQUIP-DETAIL'); a.line(cx + cr * 0.25, cy - cr * 0.28, cx + cr * 0.25, cy + cr * 0.28, 'EQUIP-DETAIL'); a.line(cx - cr * 0.25, cy, cx + cr * 0.25, cy, 'EQUIP-DETAIL');
      const per = 4 * (W - 400), step = per / v.n;
      for (let i = 0; i < v.n; i++) { const t = (i * step) % (4 * (W - 400)), side = m.floor(t / (W - 400)), f = (t % (W - 400)) / (W - 400); const [x, y] = [[X0 + 200 + (W - 400) * f, YF + 100], [X1 - 100, YF + 200 + (W - 400) * f], [X1 - 200 - (W - 400) * f, YB - 100], [X0 + 100, YB - 200 - (W - 400) * f]][side]; a.cyl(x, y, Z1 - 60, Z1 - 20, 40, 8); a.circ(x, y, 40, 'EQUIP-DETAIL'); }
      for (const y of [YF + 40, YB - 40]) { a.tube([[X0 + 100, y, Z1 - 60], [X0 + 100, y, Z1 - 20], [X1 - 100, y, Z1 - 20], [X1 - 100, y, Z1 - 60]], [10, 10, 10, 10], 5); }
      a.log('Added the chamfered slab, the touchdown circle and H mark, the perimeter edge lights and the safety net frame (plan and 3D).');
    } }),

  fam({ cat: 'aviation/rescue', title: 'Generic rescue boat on trailer',
    desc: (v) => `Inflatable rescue boat ${v.l} ft long on a trailer: two tubular sponsons joined at a pointed bow, a floor with a console, a transom with an outboard motor, a single-axle trailer with two wheels, bunks and a winch post.`,
    vs: [[14, 70], [18, 82]].map(([l, w]) => [`${l} ft, outboard`, w, l * 12 + 70, 64, 0, { l }]),
    build: (a, v) => {
      const { cx, cy, X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline();
      const bz = Z0 + 560, r = 190, bl = D - 700;
      a.box(X0 + 140, YF + 150, Z0 + 330, X1 - 140, YB - 300, Z0 + 380);
      wheelPairs(a, [YB - 900], 300, 200, 25); a.box(X0 + 120, YB - 960, Z0 + 300, X1 - 120, YB - 840, Z0 + 340);
      a.tube([[cx, YF + 150, Z0 + 350], [cx, YF + 20, Z0 + 360]], [24, 24], 8); a.box(cx - 40, YF + 130, Z0 + 380, cx + 40, YF + 250, Z0 + 900);
      for (const x of [cx - W * 0.2, cx + W * 0.2]) a.box(x - 120, YF + 400, Z0 + 380, x + 120, YB - 400, bz - r);
      for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 200); a.tube([[cx, YF + 200, bz + 40], [x - s * 50, YF + 700, bz + 40], [x, YF + 1400, bz + 40], [x, YB - 500, bz + 40], [x, YB - 330, bz + 40]], [r * 0.3, r, r, r, r * 0.9], 14); }
      a.box(X0 + 340, YF + 700, bz - r * 0.5, X1 - 340, YB - 500, bz - r * 0.5 + 30); a.rect(X0 + 340, YF + 700, X1 - 340, YB - 500, 'EQUIP-DETAIL'); a.circ(cx, YF + 20, 18, 'EQUIP-DETAIL');
      a.box(cx - 280, YB - 1100, bz - r * 0.5 + 30, cx + 280, YB - 800, bz + 500); a.box(cx - 130, YB - 330, bz - r * 0.3, cx + 130, YB - 230, bz + 150); a.box(cx - 100, YB - 230, bz - r * 0.2, cx + 100, YB - 150, bz + 700);
      a.log('Added the sponsons with a pointed bow, floor with console, transom and outboard motor, the road trailer with bunks and winch post (plan and 3D).');
    } }),
];
export default FAMS;

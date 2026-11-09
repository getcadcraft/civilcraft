/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, aerospace: launch vehicles and pads, spacecraft and satellites, airframe and propulsion structures, ground and test equipment. Original geometry; generic scale shapes, no particular vehicle, programme or maker. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = m.PI;

// ------------------------------------------------------------------------------------------ helpers
/** extrude a polygon given as [x, z] points between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** engine positions for a cluster of n inside radius R (offsets) with the bell exit radius that fits */
function cluster(n, R) {
  const P = (k, r, ph = 0) => Array.from({ length: k }, (_, i) => [m.cos(ph + (i / k) * PI * 2) * r, m.sin(ph + (i / k) * PI * 2) * r]);
  if (n === 1) return { p: [[0, 0]], re: R * 0.55 };
  if (n === 3) return { p: P(3, R * 0.5, PI / 2), re: R * 0.4 };
  if (n === 4) return { p: P(4, R * 0.5, PI / 4), re: R * 0.34 };
  if (n === 5) return { p: [[0, 0], ...P(4, R * 0.55, PI / 4)], re: R * 0.27 };
  if (n === 7) return { p: [[0, 0], ...P(6, R * 0.62)], re: R * 0.27 };
  return { p: [[0, 0], ...P(8, R * 0.68)], re: R * 0.22 };
}
/** extrude a polygon given as [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** a bell nozzle from a throat at zTop down to the exit at zTop-h */
function bell(a, cx, cy, zTop, h, rt, re, seg = 14) {
  const N = 6, pts = [], rads = [];
  for (let i = 0; i <= N; i++) { const f = i / N; pts.push([cx, cy, zTop - h * f]); rads.push(rt + (re - rt) * m.pow(f, 0.55)); }
  a.tube(pts, rads, seg); a.cyl(cx, cy, zTop - 1, zTop + h * 0.18, rt * 1.5, seg); a.cyl(cx, cy, zTop - h * 0.45, zTop - h * 0.4, (rt + (re - rt) * 0.7) * 1.06, seg);
  a.cyl(cx, cy, zTop - h - 0.0, zTop - h + h * 0.04, re * 1.06, seg);
}
/** a tangent-ogive style nose from z0 (radius R) to z1 (tip) */
function ogive(a, cx, cy, z0, z1, R, seg = 22) {
  const N = 9, pts = [], rads = [];
  for (let i = 0; i <= N; i++) { const f = i / N; pts.push([cx, cy, z0 + (z1 - z0) * f]); rads.push(m.max(R * m.pow(1 - f * f, 0.6), R * 0.05)); }
  a.tube(pts, rads, seg);
}
/** a thin circular band (stiffening or joint ring) */
function band(a, cx, cy, z, r, h = 40, seg = 24) { a.cyl(cx, cy, z - h / 2, z + h / 2, r, seg); }
/** a solar panel in the X-Z plane at y, with cell strips */
function panel(a, x0, x1, y, z0, z1, cols, rows, t = 18) {
  a.box(x0, y - t / 2, z0, x1, y + t / 2, z1);
  for (let i = 1; i < cols; i++) { const x = x0 + ((x1 - x0) * i) / cols; a.box(x - 3, y - t / 2 - 2, z0, x + 3, y + t / 2 + 2, z1); }
  for (let j = 1; j < rows; j++) { const z = z0 + ((z1 - z0) * j) / rows; a.box(x0, y - t / 2 - 2, z - 3, x1, y + t / 2 + 2, z + 3); }
}
/** a flat solar panel lying in the X-Y plane at height z */
function panelH(a, x0, x1, y0, y1, z, cols, rows, t = 18) {
  a.box(x0, y0, z - t / 2, x1, y1, z + t / 2);
  for (let i = 1; i < cols; i++) { const x = x0 + ((x1 - x0) * i) / cols; a.box(x - 3, y0, z - t / 2 - 2, x + 3, y1, z + t / 2 + 2); a.line(x, y0, x, y1, 'EQUIP-DETAIL'); }
  for (let j = 1; j < rows; j++) { const y = y0 + ((y1 - y0) * j) / rows; a.box(x0, y - 3, z - t / 2 - 2, x1, y + 3, z + t / 2 + 2); a.line(x0, y, x1, y, 'EQUIP-DETAIL'); }
  a.rect(x0, y0, x1, y1, 'EQUIP');
}
/** a wheel on a lateral axle with hub and tread lugs */
function whl(a, x, y, r, w, zc, lugs = 0) {
  a.xcyl(x - w / 2, x + w / 2, y, zc, r, 16); a.xcyl(x - w / 2 - 6, x + w / 2 + 6, y, zc, r * 0.42, 10);
  a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL');
  for (let i = 0; i < lugs; i++) { const g = (i / lugs) * PI * 2; a.box(x - w / 2, y + m.cos(g) * r * 0.97 - r * 0.07, zc + m.sin(g) * r * 0.97 - r * 0.07, x + w / 2, y + m.cos(g) * r * 0.97 + r * 0.07, zc + m.sin(g) * r * 0.97 + r * 0.07); }
}
/** a lattice of cross braces on a y plane between two x */
function braceXZ(a, x0, x1, y, z0, z1, t = 10) { a.tube([[x0, y, z0], [x1, y, z1]], [t, t], 4); a.tube([[x1, y, z0], [x0, y, z1]], [t, t], 4); }
function braceYZ(a, x, y0, y1, z0, z1, t = 10) { a.tube([[x, y0, z0], [x, y1, z1]], [t, t], 4); a.tube([[x, y1, z0], [x, y0, z1]], [t, t], 4); }
/** a web in the X-Z plane made of vertical slices: zlo(x), zhi(x); holes between slices marked by holeAt(i). flanges are wide in y (fw), the web is thin (wt). */
function webSlices(a, xs, zlo, zhi, ycen, fw, wt, holeAt, fl = 0.16) {
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[i], x1 = xs[i + 1], l0 = zlo(x0), l1 = zlo(x1), h0 = zhi(x0), h1 = zhi(x1), e0 = (h0 - l0) * fl, e1 = (h1 - l1) * fl;
    prismY(a, [[x0, l0], [x1, l1], [x1, l1 + e1], [x0, l0 + e0]], ycen - fw / 2, ycen + fw / 2);
    prismY(a, [[x0, h0 - e0], [x1, h1 - e1], [x1, h1], [x0, h0]], ycen - fw / 2, ycen + fw / 2);
    if (!holeAt(i)) prismY(a, [[x0, l0 + e0 - 1], [x1, l1 + e1 - 1], [x1, h1 - e1 + 1], [x0, h0 - e0 + 1]], ycen - wt / 2, ycen + wt / 2);
  }
}

const FAMS = [
  // ===================================================== launch =====================================================
  fam({ cat: 'aerospace/launch', title: 'Generic launch vehicle first stage',
    desc: (v) => `Vertical first stage, ${v.dia} in across and ${v.len} ft tall, standing on ${v.n === 1 ? 'one bell nozzle' : v.n + ' bell nozzles'}: an engine bay skirt, a propellant tank barrel with weld bands, a domed forward end under a narrower interstage ring and a fuel line running up the side.`,
    vs: [['48 in dia, 1 engine', 48, 40, 1], ['78 in dia, 3 engines', 78, 75, 3], ['120 in dia, 5 engines', 120, 110, 5], ['168 in dia, 7 engines', 168, 150, 7], ['198 in dia, 9 engines', 198, 190, 9]].map(([l, dia, len, n]) => [l, dia, dia, len * 12, 0, { dia, len, n }]),
    build: (a, v) => {
      const R = a.W / 2, cx = a.cx, cy = a.cy, bh = a.H * 0.07, zs = a.Z0 + bh * 0.55, zt = a.Z1 - R * 0.55, { p, re } = cluster(v.n, R * 0.94);
      for (const [dx, dy] of p) bell(a, cx + dx, cy + dy, a.Z0 + bh, bh, re * 0.28, re);
      a.cyl(cx, cy, zs, zs + bh * 1.3, R * 0.95, 28); a.cyl(cx, cy, zs + bh * 1.3, a.Z0 + bh * 2.6, R * 0.93, 28);
      a.cyl(cx, cy, a.Z0 + bh * 2.6, zt, R * 0.975, 32);
      for (const f of [0.18, 0.4, 0.62, 0.8]) band(a, cx, cy, a.Z0 + bh * 2.6 + (zt - a.Z0 - bh * 2.6) * f, R, R * 0.07);
      a.ell(cx, cy, zt, R * 0.975, R * 0.975, R * 0.3, 20, 6); a.cyl(cx, cy, zt + R * 0.2, a.Z1 - R * 0.12, R * 0.82, 28); band(a, cx, cy, a.Z1 - R * 0.12, R * 0.9, R * 0.1);
      a.cyl(cx, cy - R * 0.955, a.Z0 + bh * 2.6, zt - R * 0.2, R * 0.035, 8);
      for (const f of [0.1, 0.5, 0.9]) a.box(cx - R * 0.05, cy - R * 0.995, a.Z0 + bh * 2.6 + (zt - a.Z0 - bh * 2.6) * f, cx + R * 0.05, cy - R * 0.9, a.Z0 + bh * 2.6 + (zt - a.Z0 - bh * 2.6) * f + R * 0.06);
      a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 0.82, 'EQUIP-DETAIL'); for (const [dx, dy] of p) a.circ(cx + dx, cy + dy, re, 'EQUIP-DETAIL');
      a.log('Added the engine bells, skirt, tank barrel with weld bands, domed forward end, interstage ring and fuel line (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/launch', title: 'Generic launch vehicle upper stage',
    desc: (v) => `Vertical upper stage, ${v.dia} in across and ${v.len} ft tall: a long single bell nozzle, a thrust structure, a tank barrel with a common bulkhead ring, four attitude thruster pods and a conical payload adapter with a clamp ring on top.`,
    vs: [['48 in dia', 48, 14], ['78 in dia', 78, 22], ['120 in dia', 120, 32], ['168 in dia', 168, 42]].map(([l, dia, len]) => [l, dia, dia, len * 12, 0, { dia, len }]),
    build: (a, v) => {
      const R = a.W / 2, cx = a.cx, cy = a.cy, bh = a.H * 0.22, zb = a.Z0 + bh * 0.8, zt = a.Z1 - a.H * 0.12;
      bell(a, cx, cy, a.Z0 + bh, bh, R * 0.14, R * 0.62, 18);
      a.cone(cx, cy, a.Z0 + bh * 0.8, a.Z0 + bh * 1.5, R * 0.62, R * 0.94, 24);
      a.cyl(cx, cy, a.Z0 + bh * 1.5, zt, R * 0.97, 30); band(a, cx, cy, a.Z0 + bh * 1.5, R, R * 0.08); band(a, cx, cy, (a.Z0 + bh * 1.5 + zt) / 2, R, R * 0.07); band(a, cx, cy, zt - R * 0.05, R, R * 0.08);
      for (let i = 0; i < 4; i++) { const g = PI / 4 + (i * PI) / 2, px = cx + m.cos(g) * R * 0.97, py = cy + m.sin(g) * R * 0.97; a.box(px - R * 0.07, py - R * 0.07, a.Z0 + bh * 1.6, px + R * 0.07, py + R * 0.07, a.Z0 + bh * 1.6 + R * 0.35); a.cyl(px, py, a.Z0 + bh * 1.45, a.Z0 + bh * 1.6, R * 0.035, 8); a.circ(px, py, R * 0.07, 'EQUIP-DETAIL'); }
      a.cone(cx, cy, zt, a.Z1 - R * 0.1, R * 0.88, R * 0.42, 26); a.cyl(cx, cy, a.Z1 - R * 0.1, a.Z1, R * 0.45, 24); band(a, cx, cy, a.Z1 - R * 0.05, R * 0.5, R * 0.06);
      a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 0.62, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.45, 'EQUIP-DETAIL');
      a.log('Added the long bell nozzle, thrust structure, tank barrel with bulkhead ring, four thruster pods and the payload adapter with clamp ring (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/launch', title: 'Generic launch vehicle payload fairing',
    desc: (v) => `Two-half payload fairing, ${v.dia} in across and ${v.len} ft tall: a cylindrical barrel under a smooth ogive nose, a vertical separation seam, joint rings and acoustic vent ports.`,
    vs: [['60 in dia', 60, 22], ['90 in dia', 90, 32], ['120 in dia', 120, 42], ['168 in dia', 168, 60]].map(([l, dia, len]) => [l, dia, dia, len * 12, 0, { dia, len }]),
    build: (a, v) => {
      const R = a.W / 2, cx = a.cx, cy = a.cy, zc = a.Z0 + a.H * 0.42;
      a.cyl(cx, cy, a.Z0, zc, R * 0.98, 32); a.cone(cx, cy, zc, zc + R * 0.35, R * 0.98, R * 0.9, 32); ogive(a, cx, cy, zc + R * 0.35, a.Z1, R * 0.9, 28);
      a.cyl(cx, cy, a.Z0, a.Z0 + R * 0.12, R, 32); band(a, cx, cy, zc * 0.5 + a.Z0 * 0.5, R, R * 0.05);
      a.box(cx - 6, cy - R * 0.995, a.Z0, cx + 6, cy - R * 0.9, a.Z1 - R * 0.3); a.box(cx - 6, cy + R * 0.9, a.Z0, cx + 6, cy + R * 0.995, a.Z1 - R * 0.3);
      for (const i of [0, 1, 2, 3]) { const g = PI / 4 + i * PI / 2; a.box(cx + m.cos(g) * R * 0.975 - R * 0.05, cy + m.sin(g) * R * 0.975 - R * 0.05, a.Z0 + a.H * 0.12, cx + m.cos(g) * R * 0.975 + R * 0.05, cy + m.sin(g) * R * 0.975 + R * 0.05, a.Z0 + a.H * 0.12 + R * 0.14); }
      a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 0.9, 'EQUIP-DETAIL'); a.line(cx, cy - R, cx, cy + R, 'EQUIP-DETAIL');
      a.log('Added the barrel, ogive nose, base ring, separation seam, joint ring and vent ports (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/launch', title: 'Generic strap-on rocket booster',
    desc: (v) => `Strap-on booster, ${v.dia} in across the barrel and ${v.len} ft tall: a conical nose cap, a barrel with joint rings, an aft skirt, one bell nozzle and four stabilising fins.`,
    vs: [['36 in dia', 36, 30], ['48 in dia', 48, 45], ['60 in dia', 60, 60], ['78 in dia', 78, 80]].map(([l, dia, len]) => [l, dia * 1.75, dia * 1.75, len * 12, 0, { dia, len }]),
    build: (a, v) => {
      const R = v.dia * IN / 2, cx = a.cx, cy = a.cy, bh = a.H * 0.06, zb = a.Z0 + bh * 1.4;
      bell(a, cx, cy, a.Z0 + bh * 1.2, bh * 1.2, R * 0.16, R * 0.5, 16);
      a.cone(cx, cy, a.Z0 + bh * 0.7, zb + bh * 1.2, R * 0.6, R, 26); a.cyl(cx, cy, zb + bh * 1.2, a.Z1 - R * 2.8, R * 0.99, 30);
      for (const f of [0.2, 0.45, 0.7, 0.9]) band(a, cx, cy, zb + (a.Z1 - R * 2.8 - zb) * f, R * 1.01, R * 0.06);
      a.cone(cx, cy, a.Z1 - R * 2.8, a.Z1 - R * 0.35, R * 0.99, R * 0.3, 26); a.ell(cx, cy, a.Z1 - R * 0.35, R * 0.3, R * 0.3, R * 0.35, 12, 6);
      const fw = (a.W / 2 - R) * 0.95;
      for (let i = 0; i < 4; i++) { const g = i * PI / 2; const ux = m.cos(g), uy = m.sin(g), px = -uy, py = ux; const b0 = [cx + ux * R * 0.95, cy + uy * R * 0.95], b1 = [cx + ux * (R + fw), cy + uy * (R + fw)];
        a.prism([[b0[0] + px * 6, b0[1] + py * 6], [b1[0] + px * 6, b1[1] + py * 6], [b1[0] - px * 6, b1[1] - py * 6], [b0[0] - px * 6, b0[1] - py * 6]], a.Z0 + bh * 0.8, a.Z0 + bh * 0.8 + R * 1.4); a.line(b0[0], b0[1], b1[0], b1[1], 'EQUIP-DETAIL'); }
      a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 0.5, 'EQUIP-DETAIL'); a.circ(cx, cy, R + fw, 'EQUIP-HIDDEN');
      a.log('Added the nose cap, barrel with joint rings, aft skirt, bell nozzle and four fins (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/launch', title: 'Generic launch pad umbilical tower',
    desc: (v) => `Four-leg lattice tower ${v.hft} ft tall with cross braces in each bay, work platforms, ${v.arms} swing arms reaching toward the vehicle position, an elevator shaft on one face and a lightning mast on top.`,
    vs: [['120 ft, 2 arms', 120, 2, 12], ['180 ft, 3 arms', 180, 3, 16], ['240 ft, 4 arms', 240, 4, 20], ['300 ft, 5 arms', 300, 5, 24]].map(([l, hft, arms, wft]) => [l, wft * 12, wft * 12 * 2.1, hft * 12, 0, { hft, arms, wft }]),
    build: (a, v) => {
      const s = a.W, x0 = a.X0 + 40, x1 = a.X1 - 40, yb = a.YB - 40, yf = a.YB - s + 40, Ht = a.H * 0.94, bays = m.round(v.hft / 20), bh = Ht / bays, t = s * 0.045;
      for (const [x, y] of [[x0, yb], [x1, yb], [x0, yf], [x1, yf]]) a.tube([[x, y, a.Z0], [x, y, a.Z0 + Ht]], [t, t], 6);
      for (let k = 0; k <= bays; k++) { const z = a.Z0 + k * bh; a.tube([[x0, yb, z], [x1, yb, z], [x1, yf, z], [x0, yf, z], [x0, yb, z]], [t * 0.6, t * 0.6, t * 0.6, t * 0.6, t * 0.6], 4); }
      for (let k = 0; k < bays; k++) { const z0 = a.Z0 + k * bh, z1 = z0 + bh; braceXZ(a, x0, x1, yb, z0, z1, t * 0.4); braceXZ(a, x0, x1, yf, z0, z1, t * 0.4); braceYZ(a, x0, yf, yb, z0, z1, t * 0.4); braceYZ(a, x1, yf, yb, z0, z1, t * 0.4); }
      for (let k = 2; k < bays; k += 3) a.box(x0 - 20, yf - 20, a.Z0 + k * bh - 8, x1 + 20, yb + 20, a.Z0 + k * bh + 8);
      a.box(x1 - s * 0.28, yf - 90, a.Z0, x1 + 20, yf - 5, a.Z0 + Ht * 0.97);
      a.tube([[a.cx, yb - s * 0.4, a.Z0 + Ht], [a.cx, yb - s * 0.4, a.Z1]], [t * 0.5, t * 0.15], 6);
      const armLen = a.D - s - 120, zs = a.Z0 + Ht * 0.28, zt = a.Z0 + Ht * 0.92;
      for (let i = 0; i < v.arms; i++) { const z = zs + (zt - zs) * (v.arms === 1 ? 0 : i / (v.arms - 1)); a.tube([[a.cx - s * 0.3, yf, z], [a.cx - s * 0.3, a.YF + 60, z]], [t * 0.5, t * 0.5], 5); a.tube([[a.cx + s * 0.3, yf, z], [a.cx + s * 0.3, a.YF + 60, z]], [t * 0.5, t * 0.5], 5);
        a.box(a.cx - s * 0.3, a.YF + 60, z - t, a.cx + s * 0.3, a.YF + 100, z + t); a.box(a.cx - s * 0.3, yf - armLen * 0.5, z - t * 1.6, a.cx + s * 0.3, yf, z - t * 0.6); }
      a.rect(a.X0 + 40, yf, a.X1 - 40, yb, 'EQUIP'); a.circ(a.cx, a.YF + 90, 0.6 * s * 0.5, 'EQUIP-HIDDEN'); a.line(a.cx - s * 0.3, yf, a.cx - s * 0.3, a.YF + 60, 'EQUIP-DETAIL'); a.line(a.cx + s * 0.3, yf, a.cx + s * 0.3, a.YF + 60, 'EQUIP-DETAIL');
      a.log('Added the lattice legs, bay braces, work platforms, swing arms, elevator shaft and lightning mast (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/launch', title: 'Generic launch pad mount with flame trench',
    desc: (v) => `Launch mount: a table deck on ${v.legs} concrete pedestals over a central exhaust opening, four hold-down clamp posts, a flame trench with side walls and a wedge flame deflector below, ${v.w} ft across.`,
    vs: [['small, 20 ft table', 20, 34, 14, 4], ['medium, 30 ft table', 30, 50, 20, 4], ['large, 44 ft table', 44, 72, 28, 6], ['heavy, 60 ft table', 60, 100, 36, 6]].map(([l, w, d, h, legs]) => [l, w * 12, d * 12, h * 12, 0, { w, legs }]),
    build: (a, v) => {
      const W = a.W, ty = a.YB - W * 0.5, tz = a.Z0 + a.H * 0.7, hole = W * 0.28, th = a.H * 0.12;
      a.box(a.X0, a.YF, a.Z0, a.X1, a.YB, a.Z0 + a.H * 0.06);
      for (const s of [-1, 1]) a.box(a.cx + s * (hole * 0.9) - a.W * 0.04, a.YF + 40, a.Z0, a.cx + s * (hole * 0.9) + a.W * 0.04, a.YB - 40, tz - th);
      a.prism([[a.cx - hole * 0.9, a.YF + 200], [a.cx, a.YF + 20], [a.cx + hole * 0.9, a.YF + 200], [a.cx + hole * 0.9, ty + hole * 0.3], [a.cx - hole * 0.9, ty + hole * 0.3]].map((q) => q), a.Z0 + a.H * 0.06, a.Z0 + a.H * 0.2);
      prismY(a, [[a.cx - hole * 0.9, a.Z0 + a.H * 0.06], [a.cx + hole * 0.9, a.Z0 + a.H * 0.06], [a.cx, a.Z0 + a.H * 0.55]], ty - hole * 0.5, ty + hole * 0.5);
      const lx = v.legs === 4 ? [-1, 1] : [-1, 0, 1];
      for (const sx of lx) for (const sy of [-1, 1]) { const x = a.cx + sx * (W / 2 - W * 0.07), y = ty + sy * (W / 2 - W * 0.07); a.box(x - W * 0.045, y - W * 0.045, a.Z0 + a.H * 0.06, x + W * 0.045, y + W * 0.045, tz - th); }
      a.box(a.X0 + 20, ty - W / 2, tz - th, a.cx - hole / 2, ty + W / 2, tz); a.box(a.cx + hole / 2, ty - W / 2, tz - th, a.X1 - 20, ty + W / 2, tz);
      a.box(a.cx - hole / 2, ty - W / 2, tz - th, a.cx + hole / 2, ty - hole / 2, tz); a.box(a.cx - hole / 2, ty + hole / 2, tz - th, a.cx + hole / 2, ty + W / 2, tz);
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.box(a.cx + dx * hole * 0.62 - 40, ty + dy * hole * 0.62 - 40, tz, a.cx + dx * hole * 0.62 + 40, ty + dy * hole * 0.62 + 40, tz + a.H * 0.12);
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP'); a.rect(a.X0 + 20, ty - W / 2, a.X1 - 20, ty + W / 2, 'EQUIP-DETAIL'); a.rect(a.cx - hole / 2, ty - hole / 2, a.cx + hole / 2, ty + hole / 2, 'EQUIP-DETAIL');
      a.rect(a.cx - hole * 0.9, a.YF + 20, a.cx + hole * 0.9, ty + hole * 0.3, 'EQUIP-HIDDEN');
      a.log('Added the base slab, trench walls and flame deflector, table deck around the opening on pedestals and four hold-down clamp posts (plan and 3D).');
    } }),

  // ===================================================== spacecraft =====================================================
  fam({ cat: 'aerospace/spacecraft', title: 'Generic crew capsule with service module',
    desc: (v) => `Crew capsule for ${v.crew} crew, ${v.dia} in across: a conical capsule with a heat-shield base ring, windows and a docking port, a cylindrical service module with a main engine bell, four thruster pods, two radiator panels and two three-panel solar wings.`,
    vs: [['2 crew, 100 in dia', 100, 2, 190], ['4 crew, 160 in dia', 160, 4, 300], ['6 crew, 200 in dia', 200, 6, 370], ['deep-space, 230 in dia', 230, 4, 420]].map(([l, dia, crew, h]) => [l, dia * 3.5, dia, h, 0, { dia, crew }]),
    build: (a, v) => {
      const R = a.D / 2, cx = a.cx, cy = a.cy, H = a.H, zs0 = a.Z0 + H * 0.12, zs1 = a.Z0 + H * 0.5;
      bell(a, cx, cy, zs0 + 20, H * 0.12, R * 0.12, R * 0.4, 16);
      a.cyl(cx, cy, zs0, zs1, R * 0.98, 30); band(a, cx, cy, zs0 + 30, R, 30); band(a, cx, cy, zs1 - 30, R, 30);
      a.cone(cx, cy, zs1, zs1 + H * 0.34, R * 0.96, R * 0.3, 30); a.ell(cx, cy, zs1 + 6, R * 0.97, R * 0.97, R * 0.1, 20, 5);
      a.cyl(cx, cy, zs1 + H * 0.34, zs1 + H * 0.4, R * 0.3, 20); a.cone(cx, cy, zs1 + H * 0.4, zs1 + H * 0.46, R * 0.3, R * 0.2, 16);
      for (let i = 0; i < v.crew && i < 4; i++) { const g = PI / 2 + (i - (m.min(v.crew, 4) - 1) / 2) * 0.5; a.box(cx + m.cos(g) * R * 0.66 - R * 0.06, cy + m.sin(g) * R * 0.66 - R * 0.06 - R * 0.0, zs1 + H * 0.1, cx + m.cos(g) * R * 0.66 + R * 0.06, cy + m.sin(g) * R * 0.66 + R * 0.06, zs1 + H * 0.1 + R * 0.16); }
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const px = cx + sx * R * 0.7, py = cy + sy * R * 0.7; a.box(px - R * 0.08, py - R * 0.08, zs1 - H * 0.12, px + R * 0.08, py + R * 0.08, zs1 - H * 0.04); a.cyl(px, py, zs1 - H * 0.04, zs1 - H * 0.04 + R * 0.08, R * 0.04, 8); }
      for (const s of [-1, 1]) { a.box(cx + s * R * 0.95 - 6, cy - R * 0.5, zs0 + H * 0.06, cx + s * R * 0.95 + 6, cy + R * 0.5, zs1 - H * 0.06);
        const x0 = cx + s * R * 1.06, wl = (a.W / 2 - R * 1.1) / 3, bz = (zs0 + zs1) / 2; a.tube([[cx + s * R * 0.96, cy, bz], [cx + s * a.W / 2, cy, bz]], [R * 0.04, R * 0.04], 6);
        for (let k = 0; k < 3; k++) { const xa = cx + s * (R * 1.06 + wl * k + 12 * k), xb = cx + s * (R * 1.06 + wl * (k + 1) + 12 * k); panel(a, m.min(xa, xb), m.max(xa, xb), cy, bz - H * 0.18, bz + H * 0.18, 4, 6); } }
      a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 0.3, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.4, 'EQUIP-HIDDEN'); a.rect(a.X0, cy - 100, a.X1, cy + 100, 'EQUIP-DETAIL');
      a.log('Added the capsule cone with windows and docking port, service module with engine bell, thruster pods, radiators and two three-panel solar wings (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic satellite with solar wings',
    desc: (v) => `${v.cls} satellite: a ${v.bus} in box bus with ${v.pn} solar panels on each of two booms, a thruster, a star tracker, a radiator face and a dish antenna with a feed horn on a short mast.`,
    vs: [['micro class', 'Micro', 24, 2], ['mini class', 'Mini', 40, 3], ['medium class', 'Medium', 60, 4], ['large class', 'Large', 84, 5]].map(([l, cls, bus, pn]) => [l, bus * (1 + pn * 0.95), bus * 1.0, bus * 1.5, 0, { cls, bus, pn }]),
    build: (a, v) => {
      const B = v.bus * IN, cx = a.cx, cy = a.cy, zc = a.Z0 + a.H * 0.45, bh = a.H * 0.72, pw = (a.W - B) / 2 / v.pn - 8;
      a.box(cx - B / 2, cy - B / 2, zc - bh / 2, cx + B / 2, cy + B / 2, zc + bh / 2);
      for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.box(cx + x * B / 2 - 6, cy + y * B / 2 - 6, zc - bh / 2, cx + x * B / 2 + 6, cy + y * B / 2 + 6, zc + bh / 2);
      a.box(cx - B * 0.35, cy - B / 2 - 8, zc - bh * 0.3, cx + B * 0.35, cy - B / 2, zc + bh * 0.3);
      a.cyl(cx + B * 0.28, cy - B / 2 - 20, zc + bh * 0.1, zc + bh * 0.42, B * 0.07, 10); a.cyl(cx - B * 0.25, cy, zc - bh / 2 - B * 0.12, zc - bh / 2, B * 0.1, 12); a.cone(cx - B * 0.25, cy, zc - bh / 2 - B * 0.2, zc - bh / 2 - B * 0.12, B * 0.16, B * 0.1, 12);
      for (const s of [-1, 1]) { a.tube([[cx + s * B / 2, cy, zc], [cx + s * a.W / 2, cy, zc]], [B * 0.025, B * 0.025], 6);
        for (let k = 0; k < v.pn; k++) { const xa = cx + s * (B / 2 + 8 + k * (pw + 8)), xb = cx + s * (B / 2 + 8 + k * (pw + 8) + pw); panel(a, m.min(xa, xb), m.max(xa, xb), cy, zc - bh * 0.52, zc + bh * 0.52, 3, 5); a.line(xa, cy - 4, xa, cy + 4); } }
      a.tube([[cx, cy + B * 0.2, zc + bh / 2], [cx, cy + B * 0.2, zc + bh / 2 + B * 0.22]], [B * 0.025, B * 0.025], 6);
      a.cone(cx, cy + B * 0.2, zc + bh / 2 + B * 0.22, zc + bh / 2 + B * 0.3, B * 0.02, B * 0.3, 18); a.cyl(cx, cy + B * 0.2, zc + bh / 2 + B * 0.3, zc + bh / 2 + B * 0.4 > a.Z1 ? a.Z1 : zc + bh / 2 + B * 0.4, B * 0.28, 18);
      a.rect(cx - B / 2, cy - B / 2, cx + B / 2, cy + B / 2, 'EQUIP'); a.circ(cx, cy + B * 0.2, B * 0.28, 'EQUIP-DETAIL'); a.rect(a.X0, cy - 9, cx - B / 2, cy + 9, 'EQUIP-DETAIL'); a.rect(cx + B / 2, cy - 9, a.X1, cy + 9, 'EQUIP-DETAIL');
      a.log('Added the bus with corner rails, star tracker, thruster, radiator face, two panelled solar booms and the dish antenna on its mast (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic communications satellite with reflectors',
    desc: (v) => `Large communications satellite: a ${v.bus} in box bus, two long solar wings of ${v.pn} panels each, two reflector dishes on side booms with feed horns, an earth-facing antenna panel and an apogee engine bell underneath.`,
    vs: [['small, 80 in bus', 80, 3, 36], ['medium, 100 in bus', 100, 4, 50], ['large, 120 in bus', 120, 5, 62], ['heavy, 140 in bus', 140, 6, 72]].map(([l, bus, pn, dish]) => [l, bus * (1 + pn * 0.95) + 20, bus * 1.0 + dish * 1.4, bus * 1.7, 0, { bus, pn, dish }]),
    build: (a, v) => {
      const B = v.bus * IN * 0.6, Bd = v.bus * IN, cx = a.cx, yb = a.YB - (a.D - Bd) / 2 - Bd * 0.2, cy = yb - Bd / 2, zc = a.Z0 + a.H * 0.5, bh = a.H * 0.62, pw = (a.W - Bd) / 2 / v.pn - 8, dr = v.dish * IN / 2;
      a.box(cx - Bd / 2, cy - Bd / 2, zc - bh / 2, cx + Bd / 2, cy + Bd / 2, zc + bh / 2);
      a.box(cx - Bd * 0.4, cy - Bd / 2 - 25, zc - bh * 0.4, cx + Bd * 0.4, cy - Bd / 2, zc + bh * 0.4);
      for (let i = 0; i < 3; i++) a.box(cx - Bd * 0.35 + i * Bd * 0.25, cy + Bd / 2, zc - bh * 0.3, cx - Bd * 0.35 + i * Bd * 0.25 + Bd * 0.15, cy + Bd / 2 + 20, zc + bh * 0.3);
      bell(a, cx, cy, zc - bh / 2, a.H * 0.12, Bd * 0.05, Bd * 0.18, 14);
      for (const s of [-1, 1]) { a.tube([[cx + s * Bd / 2, cy, zc], [cx + s * a.W / 2, cy, zc]], [Bd * 0.02, Bd * 0.02], 6);
        for (let k = 0; k < v.pn; k++) { const xa = cx + s * (Bd / 2 + 8 + k * (pw + 8)), xb = xa + s * pw; panel(a, m.min(xa, xb), m.max(xa, xb), cy, zc - bh * 0.5, zc + bh * 0.5, 3, 6); }
        const dx = cx + s * (Bd / 2 + dr * 1.05), dy = a.YF + dr * 1.05 + 20, dz = zc + bh * 0.35;
        a.tube([[cx + s * Bd / 2, cy - Bd * 0.3, zc + bh * 0.3], [dx, dy + dr * 0.6, dz - dr * 0.4]], [Bd * 0.018, Bd * 0.018], 6);
        a.cone(dx, dy, dz - dr * 0.25, dz + dr * 0.05, dr * 0.18, dr, 22); a.tube([[dx, dy, dz - dr * 0.25], [dx, dy, dz - dr * 0.9]], [dr * 0.05, dr * 0.05], 8); a.cyl(dx, dy, dz - dr * 0.95, dz - dr * 0.8, dr * 0.12, 10);
        a.circ(dx, dy, dr, 'EQUIP'); a.circ(dx, dy, dr * 0.18, 'EQUIP-DETAIL'); }
      a.rect(cx - Bd / 2, cy - Bd / 2, cx + Bd / 2, cy + Bd / 2, 'EQUIP'); a.rect(a.X0, cy - 9, cx - Bd / 2, cy + 9, 'EQUIP-DETAIL'); a.rect(cx + Bd / 2, cy - 9, a.X1, cy + 9, 'EQUIP-DETAIL');
      a.log('Added the bus with earth-facing antenna panel, apogee engine, two panelled solar wings and two reflector dishes with feed horns on booms (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic small satellite unit (cube format)',
    desc: (v) => `${v.u}-unit cube-format satellite, ${v.w} by ${v.d} by ${v.h} in: four corner rails, end plates, recessed solar cell faces, a camera aperture on the end plate, deployment feet and a short antenna stub.`,
    vs: [['1U', 1, 3.9, 3.9, 3.9], ['2U', 2, 3.9, 3.9, 8.9], ['3U', 3, 3.9, 3.9, 13.4], ['6U', 6, 9.4, 3.9, 13.4], ['12U', 12, 9.4, 9.4, 13.4]].map(([l, u, w, d, h]) => [l, w, d, h, 0, { u, w, d, h }]),
    build: (a, v) => {
      const r = 4.5, e = 5, hz = a.H * 0.05, z0 = a.Z0 + hz, z1 = a.Z1 - a.H * 0.05 - (v.h > 8 ? 12 : 8);
      a.box(a.X0 + r, a.YF + r, z0, a.X1 - r, a.YB - r, z1);
      for (const [x, y] of [[a.X0, a.YF], [a.X1 - 2 * r, a.YF], [a.X0, a.YB - 2 * r], [a.X1 - 2 * r, a.YB - 2 * r]]) a.box(x, y, z0, x + 2 * r, y + 2 * r, z1);
      for (const [x, y] of [[a.X0 + r, a.YF + r], [a.X1 - r, a.YF + r], [a.X0 + r, a.YB - r], [a.X1 - r, a.YB - r]]) a.cyl(x, y, a.Z0, z0 + 1, r * 0.8, 8);
      for (const z of [z0, z1 - 4]) a.box(a.X0 + 2, a.YF + 2, z, a.X1 - 2, a.YB - 2, z + 4);
      a.box(a.X0 + r + 4, a.YF + r - 1.5, z0 + 12, a.X1 - r - 4, a.YF + r, z1 - 12); a.box(a.X0 + r - 1.5, a.YF + r + 4, z0 + 12, a.X0 + r, a.YB - r - 4, z1 - 12);
      a.cyl(a.cx, a.cy, z1 + 4, a.Z1 - 1, 5, 8); a.cyl(a.cx, a.cy, z1, z1 + 4, Math.min(a.W, a.D) * 0.28, 12);
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP'); a.rect(a.X0 + r, a.YF + r, a.X1 - r, a.YB - r, 'EQUIP-DETAIL'); a.circ(a.cx, a.cy, Math.min(a.W, a.D) * 0.28, 'EQUIP-DETAIL');
      a.log('Added the corner rails, end plates, recessed solar faces, deployment feet and antenna stub (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic six-wheel planetary rover',
    desc: (v) => `Six-wheel rover, ${v.len} in long: a chassis deck with solar panel, a rocker-bogie suspension of linked arms on each side, six cleated wheels with hubs, a mast with a camera head, a dish antenna and a front instrument arm.`,
    vs: [['micro, 28 in', 28], ['small, 60 in', 60], ['mid-size, 108 in', 108], ['large, 150 in', 150]].map(([l, len]) => [l, len * 0.85, len, len * 0.7, 0, { len }]),
    build: (a, v) => {
      const L = a.D, r = a.H * 0.21, ww = a.W * 0.14, zc = a.Z0 + r, xo = a.W / 2 - ww / 2 - 4, ys = [a.YF + L * 0.1 + r, a.YF + L * 0.52, a.YB - L * 0.1 - r], dz = a.Z0 + a.H * 0.48;
      a.box(a.cx - a.W * 0.3, a.YF + L * 0.22, dz, a.cx + a.W * 0.3, a.YB - L * 0.2, dz + a.H * 0.18);
      a.box(a.cx - a.W * 0.24, a.YF + L * 0.26, dz + a.H * 0.18, a.cx + a.W * 0.24, a.YB - L * 0.24, dz + a.H * 0.22);
      for (const s of [-1, 1]) { const x = a.cx + s * xo;
        a.tube([[x, ys[0], zc], [x, ys[0] + L * 0.15, dz + a.H * 0.1], [x, ys[1] - L * 0.02, zc + r * 0.3]], [a.W * 0.015, a.W * 0.015, a.W * 0.015], 6);
        a.tube([[x, ys[1], zc + r * 0.3], [x, ys[2] - L * 0.12, dz + a.H * 0.06], [x, ys[2], zc]], [a.W * 0.015, a.W * 0.015, a.W * 0.015], 6);
        a.tube([[x, ys[1], dz + a.H * 0.05], [x, a.cy + L * 0.08, dz + a.H * 0.09], [a.cx + s * a.W * 0.3, a.cy + L * 0.08, dz + a.H * 0.09]], [a.W * 0.015, a.W * 0.015, a.W * 0.015], 6);
        for (const y of ys) whl(a, x, y, r, ww, zc, 8); a.line(x, ys[0], x, ys[2], 'EQUIP-DETAIL'); }
      const mx = a.cx + a.W * 0.17, my = a.YF + L * 0.32; a.tube([[mx, my, dz + a.H * 0.2], [mx, my, a.Z1 - a.H * 0.1]], [a.W * 0.018, a.W * 0.018], 6);
      a.box(mx - a.W * 0.07, my - a.W * 0.03, a.Z1 - a.H * 0.12, mx + a.W * 0.07, my + a.W * 0.03, a.Z1); a.cyl(mx - a.W * 0.05, my, a.Z1 - a.H * 0.04, a.Z1 - a.H * 0.01, a.W * 0.015, 8);
      const dx = a.cx - a.W * 0.16, dy = a.YB - L * 0.3; a.tube([[dx, dy, dz + a.H * 0.2], [dx, dy, dz + a.H * 0.34]], [a.W * 0.012, a.W * 0.012], 6); a.cone(dx, dy, dz + a.H * 0.34, dz + a.H * 0.38, a.W * 0.015, a.W * 0.13, 16);
      a.tube([[a.cx - a.W * 0.1, a.YF + L * 0.24, dz + a.H * 0.1], [a.cx - a.W * 0.1, a.YF + L * 0.12, dz + a.H * 0.12], [a.cx - a.W * 0.1, a.YF + L * 0.03, dz + a.H * 0.04]], [a.W * 0.015, a.W * 0.012, a.W * 0.015], 6);
      a.rect(a.cx - a.W * 0.3, a.YF + L * 0.22, a.cx + a.W * 0.3, a.YB - L * 0.2, 'EQUIP'); a.circ(mx, my, a.W * 0.04, 'EQUIP-DETAIL'); a.circ(dx, dy, a.W * 0.13, 'EQUIP-DETAIL');
      a.log('Added the chassis deck and solar panel, rocker-bogie arms, six cleated wheels with hubs, camera mast, dish antenna and instrument arm (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic space station module',
    desc: (v) => `Pressurised space station module, ${v.dia} in across and ${v.len} ft long: a cylindrical hull with blanket rings and handrails, a docking port with cone at each end, ${v.radial} radial berthing ports, two flat solar arrays on booms and a radiator panel.`,
    vs: [['node, 120 in dia', 120, 14, 4], ['laboratory, 168 in dia', 168, 30, 2], ['habitat, 180 in dia', 180, 36, 3], ['logistics, 144 in dia', 144, 24, 2]].map(([l, dia, len, radial]) => [l, dia * 3.2, len * 12, dia * 1.6, 0, { dia, len, radial }]),
    build: (a, v) => {
      const R = v.dia * IN / 2, cx = a.cx, zc = a.Z0 + a.H / 2, pl = a.D * 0.12;
      a.ycyl(a.YF + pl, a.YB - pl, cx, zc, R, 30);
      for (let i = 1; i < 6; i++) a.ycyl(a.YF + pl + (a.D - 2 * pl) * (i / 6) - 40, a.YF + pl + (a.D - 2 * pl) * (i / 6) + 40, cx, zc, R * 1.03, 30);
      for (const [y0, y1, q] of [[a.YF, a.YF + pl, -1], [a.YB - pl, a.YB, 1]]) { a.tube(q < 0 ? [[cx, y0, zc], [cx, y1, zc]] : [[cx, y1, zc], [cx, y0, zc]], [R * 0.4, R * 0.6], 20); a.ycyl(y0, y0 + 40, cx, zc, R * 0.42, 20); a.ycyl(y1 - 40, y1, cx, zc, R * 0.62, 20); }
      for (let i = 0; i < v.radial; i++) { const yy = i % 2 ? a.YB - a.D * 0.35 : a.YF + a.D * 0.35, z = i < 2 ? zc + R : zc - R, d = i < 2 ? 1 : -1; a.cyl(cx, yy, d > 0 ? zc + R * 0.9 : zc - R - R * 0.35, d > 0 ? zc + R + R * 0.35 : zc - R * 0.9, R * 0.3, 18); a.cyl(cx, yy, d > 0 ? zc + R + R * 0.3 : zc - R - R * 0.38, d > 0 ? zc + R + R * 0.38 : zc - R - R * 0.3, R * 0.36, 18); a.circ(cx, yy, R * 0.3, 'EQUIP-DETAIL'); }
      for (let i = 0; i < 3; i++) { const g = -0.7 + i * 0.7; a.tube([[cx + m.sin(g) * R * 1.02, a.YF + pl + 160, zc + m.cos(g) * R * 1.02], [cx + m.sin(g) * R * 1.02, a.YB - pl - 160, zc + m.cos(g) * R * 1.02]], [14, 14], 5); }
      for (const s of [-1, 1]) { a.tube([[cx + s * R, a.cy, zc], [cx + s * (a.W / 2 - 40), a.cy, zc]], [R * 0.06, R * 0.06], 8);
        const ax0 = cx + s * R * 1.25, ax1 = cx + s * (a.W / 2 - 20), ay = a.D * 0.3; panelH(a, m.min(ax0, ax1), m.max(ax0, ax1), a.cy - ay, a.cy + ay, zc, 6, 4, 24); }
      a.box(cx - R * 0.5, a.YF + a.D * 0.4, zc + R, cx + R * 0.5, a.YB - a.D * 0.4, zc + R + 30);
      a.rect(cx - R, a.YF + pl, cx + R, a.YB - pl, 'EQUIP'); a.line(cx - R, a.cy, cx + R, a.cy, 'EQUIP-DETAIL');
      a.log('Added the hull with blanket rings and handrails, end docking ports with cones, radial berthing ports, boomed solar arrays and a radiator panel (plan and 3D).');
    } }),

  // ===================================================== structures =====================================================
  fam({ cat: 'aerospace/structures', title: 'Generic wing rib',
    desc: (v) => `Wing rib, ${v.chord} in chord: a cambered aerofoil web cut into lightening holes between posts, wide top and bottom flanges, end attach angles and rivet pad strips.`,
    vs: [['24 in chord', 24, 2.5], ['36 in chord', 36, 3], ['48 in chord', 48, 4], ['72 in chord', 72, 5], ['120 in chord', 120, 6]].map(([l, chord, fw]) => [l, chord, fw, chord * 0.16, 0, { chord, fw }]),
    build: (a, v) => {
      const N = 24, C = a.W, th = (u) => 5 * 0.12 * (0.2969 * m.sqrt(u) - 0.126 * u - 0.3516 * u * u + 0.2843 * u ** 3 - 0.1015 * u ** 4) / 0.0594 * 0.8, xs = [];
      for (let i = 0; i <= N; i++) xs.push(a.X0 + C * (0.02 + 0.96 * i / N));
      const U = (x) => (x - a.X0) / C, mid = (x) => a.Z0 + a.H * 0.5 + a.H * 0.08 * m.sin(PI * U(x)) * 0, lo = (x) => mid(x) - (a.H * th(U(x))) / 2 * 1.0, hi = (x) => mid(x) + (a.H * th(U(x))) / 2 * 1.0;
      webSlices(a, xs, lo, hi, a.cy, a.D, a.D * 0.22, (i) => i > 2 && i < N - 3 && i % 3 !== 0, 0.17);
      for (const i of [0, N - 1]) { const x = xs[i]; a.box(x - a.D * 0.1, a.cy - a.D * 0.4, lo(x), x + a.D * 0.5, a.cy + a.D * 0.4, hi(x)); }
      for (let i = 3; i < N - 3; i += 3) { const x = (xs[i] + xs[i + 1]) / 2; a.box(x - a.D * 0.08, a.cy - a.D * 0.12, lo(x) + a.H * 0.12, x + a.D * 0.08, a.cy + a.D * 0.12, hi(x) - a.H * 0.12); }
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP'); a.line(a.X0, a.cy - a.D * 0.11, a.X1, a.cy - a.D * 0.11, 'EQUIP-DETAIL'); a.line(a.X0, a.cy + a.D * 0.11, a.X1, a.cy + a.D * 0.11, 'EQUIP-DETAIL');
      a.log('Added the aerofoil web with lightening holes between posts, top and bottom flanges and end attach angles (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic wing spar',
    desc: (v) => `Tapered wing spar, ${v.len} in long: a deep web that narrows toward the tip with lightening holes between stiffener posts, wide top and bottom caps and clevis lugs at the root.`,
    vs: [['96 in', 96, 14], ['180 in', 180, 20], ['300 in', 300, 28], ['480 in', 480, 40]].map(([l, len, dp]) => [l, len, dp * 0.36, dp, 0, { len, dp }]),
    build: (a, v) => {
      const N = m.round(v.len / 7), xs = []; for (let i = 0; i <= N; i++) xs.push(a.X0 + a.W * 0.04 + (a.W * 0.96 * i) / N);
      const zc = a.Z0 + a.H / 2, dep = (x) => a.H * (1 - 0.55 * (x - a.X0) / a.W);
      webSlices(a, xs, (x) => zc - dep(x) / 2, (x) => zc + dep(x) / 2, a.cy, a.D, a.D * 0.12, (i) => i > 1 && i < N - 1 && i % 4 !== 0, 0.12);
      for (let i = 4; i < N - 1; i += 4) { const x = xs[i]; a.box(x - 12, a.cy - a.D * 0.2, zc - dep(x) / 2, x + 12, a.cy + a.D * 0.2, zc + dep(x) / 2); }
      for (const dz of [-1, 1]) { a.box(a.X0, a.cy - a.D * 0.35, zc + dz * dep(a.X0) * 0.25 - a.H * 0.05, a.X0 + a.H * 0.4, a.cy + a.D * 0.35, zc + dz * dep(a.X0) * 0.25 + a.H * 0.05); a.ycyl(a.cy - a.D * 0.4, a.cy + a.D * 0.4, a.X0 + a.H * 0.18, zc + dz * dep(a.X0) * 0.25, a.H * 0.055, 10); }
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP'); a.line(a.X0, a.cy - a.D * 0.06, a.X1, a.cy - a.D * 0.06, 'EQUIP-DETAIL'); a.line(a.X0, a.cy + a.D * 0.06, a.X1, a.cy + a.D * 0.06, 'EQUIP-DETAIL');
      a.log('Added the tapered web with lightening holes, stiffener posts, top and bottom caps and the root clevis lugs (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic fuselage frame ring',
    desc: (v) => `Fuselage frame ring, ${v.dia} in across: a circular channel section with wide outer and inner flanges, a web with stringer cut-outs and shear clips, and a cross floor beam on two stanchions.`,
    vs: [['60 in dia', 60, 3], ['100 in dia', 100, 4], ['156 in dia', 156, 5], ['244 in dia', 244, 6]].map(([l, dia, dp]) => [l, dia, dp, dia, 0, { dia, dp }]),
    build: (a, v) => {
      const R = a.W / 2, cx = a.cx, zc = a.Z0 + a.H / 2, n = 44, hd = R * 0.085, t = hd * 0.16, ring = (r1, r2, i, y0, y1) => { const g0 = (i / n) * PI * 2, g1 = ((i + 1) / n) * PI * 2; prismY(a, [[cx + r2 * m.cos(g0), zc + r2 * m.sin(g0)], [cx + r2 * m.cos(g1), zc + r2 * m.sin(g1)], [cx + r1 * m.cos(g1), zc + r1 * m.sin(g1)], [cx + r1 * m.cos(g0), zc + r1 * m.sin(g0)]], y0, y1); };
      for (let i = 0; i < n; i++) { ring(R - t, R * 0.9999, i, a.cy - a.D * 0.5, a.cy + a.D * 0.5); ring(R - hd, R - hd + t, i, a.cy - a.D * 0.4, a.cy + a.D * 0.4); ring(R - hd, R - hd * 0.45, i, a.cy - a.D * 0.07, a.cy + a.D * 0.07); if (i % 4 !== 0) ring(R - hd * 0.45, R - t, i, a.cy - a.D * 0.07, a.cy + a.D * 0.07); else { const g = ((i + 0.5) / n) * PI * 2; a.box(cx + (R - t * 3) * m.cos(g) - 14, a.cy - a.D * 0.3, zc + (R - t * 3) * m.sin(g) - 14, cx + (R - t * 3) * m.cos(g) + 14, a.cy + a.D * 0.3, zc + (R - t * 3) * m.sin(g) + 14); } }
      const fz = zc - R * 0.12, hw = m.sqrt(R * R * (1 - 0.12 * 0.12)) - hd; a.box(cx - hw, a.cy - a.D * 0.35, fz - R * 0.03, cx + hw, a.cy + a.D * 0.35, fz); a.box(cx - hw, a.cy - a.D * 0.45, fz - R * 0.05, cx + hw, a.cy + a.D * 0.45, fz - R * 0.03);
      for (const s of [-0.5, 0, 0.5]) a.box(cx + s * hw - 10, a.cy - 8, zc - R + hd, cx + s * hw + 10, a.cy + 8, fz - R * 0.05);
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP'); a.rect(a.X0 + hd, a.cy - a.D * 0.07, a.X1 - hd, a.cy + a.D * 0.07, 'EQUIP-DETAIL');
      a.log('Added the ring with outer and inner flanges, web with stringer cut-outs and shear clips, floor beam and stanchions (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic rocket engine bell assembly',
    desc: (v) => `Liquid rocket engine, ${v.exit} in exit diameter: a bell nozzle with stiffener rings and a manifold ring, a chamber and injector head, two turbopump units with feed lines and a gimbal mount with two actuators.`,
    vs: [['20 in exit', 20], ['36 in exit', 36], ['60 in exit', 60], ['96 in exit', 96]].map(([l, ex]) => [l, ex * 1.5, ex * 1.2, ex * 1.9, 0, { exit: ex }]),
    build: (a, v) => {
      const E = v.exit * IN / 2, cx = a.cx, cy = a.cy, bh = a.H * 0.62, zt = a.Z0 + bh, ch = a.H * 0.16;
      bell(a, cx, cy, zt, bh, E * 0.3, E, 24);
      a.tube(Array.from({ length: 25 }, (_, i) => [cx + m.cos((i / 24) * PI * 2) * E * 0.66, cy + m.sin((i / 24) * PI * 2) * E * 0.66, zt - bh * 0.5]), Array(25).fill(E * 0.06), 8);
      a.cyl(cx, cy, zt, zt + ch, E * 0.36, 20); a.ell(cx, cy, zt + ch, E * 0.36, E * 0.36, E * 0.2, 16, 5); a.cyl(cx, cy, zt + ch * 1.15, zt + ch * 1.3, E * 0.22, 16);
      a.box(cx - E * 0.3, cy - E * 0.1, zt + ch * 1.3, cx + E * 0.3, cy + E * 0.1, zt + ch * 1.5);
      for (const s of [-1, 1]) { a.tube([[cx + s * E * 0.26, cy, zt + ch * 1.5], [cx + s * E * 0.5, cy, a.Z1 - a.H * 0.02]], [E * 0.035, E * 0.035], 6); a.ell(cx + s * E * 0.5, cy, a.Z1 - a.H * 0.05, E * 0.07, E * 0.07, E * 0.07, 8, 4);
        const px = cx + s * E * 0.62, pz = zt + ch * 0.6; a.cyl(px, cy - E * 0.25, pz - E * 0.2, pz + E * 0.22, E * 0.16, 14); a.cyl(px, cy + E * 0.25, pz - E * 0.15, pz + E * 0.15, E * 0.2, 14); a.xcyl(px - E * 0.12, px + E * 0.12, cy, pz, E * 0.12, 10);
        a.tube([[px, cy - E * 0.25, pz + E * 0.22], [cx + s * E * 0.3, cy - E * 0.2, zt + ch * 0.9], [cx + s * E * 0.25, cy, zt + ch * 0.9]], [E * 0.035, E * 0.035, E * 0.035], 6); a.circ(px, cy - E * 0.25, E * 0.16, 'EQUIP-DETAIL'); a.circ(px, cy + E * 0.25, E * 0.2, 'EQUIP-DETAIL'); }
      for (const s of [-1, 1]) a.tube([[cx, cy + s * E * 0.3, zt + ch * 0.9], [cx, cy + s * E * 0.4, zt + ch * 0.2]], [E * 0.04, E * 0.04], 6);
      a.circ(cx, cy, E, 'EQUIP'); a.circ(cx, cy, E * 0.66, 'EQUIP-DETAIL'); a.circ(cx, cy, E * 0.36, 'EQUIP-DETAIL');
      a.log('Added the bell nozzle with stiffener and manifold rings, chamber and injector head, two turbopump units, feed lines and the gimbal mount with actuators (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic propellant tank on cradle',
    desc: (v) => `Cylindrical propellant tank, ${v.dia} in across and ${v.len} ft long, lying on two saddle cradles: domed ends, weld bands, end skirt flanges, a top manway, a vent line and fill ports.`,
    vs: [['36 in dia', 36, 8], ['60 in dia', 60, 15], ['96 in dia', 96, 25], ['144 in dia', 144, 35]].map(([l, dia, len]) => [l, len * 12, dia * 1.05, dia * 1.35, 0, { dia, len }]),
    build: (a, v) => {
      const R = a.D / 2 / 1.05, zc = a.Z0 + a.H * 0.2 + R, dl = R * 0.55, x0 = a.X0 + 30, x1 = a.X1 - 30;
      a.xcyl(x0 + dl, x1 - dl, a.cy, zc, R * 0.98, 30);
      for (const [xe, q] of [[x0 + dl, -1], [x1 - dl, 1]]) { a.ell(xe, a.cy, zc, dl, R * 0.98, R * 0.98, 16, 10); a.xcyl(xe - 30, xe + 30, a.cy, zc, R * 1.03, 30); a.xcyl(xe - 12 * q, xe + 12 * q, a.cy, zc, R * 1.04, 30); }
      for (let i = 1; i < 5; i++) { const x = x0 + dl + ((x1 - x0 - 2 * dl) * i) / 5; a.xcyl(x - 14, x + 14, a.cy, zc, R * 1.01, 30); }
      for (const f of [0.28, 0.72]) { const x = x0 + dl + (x1 - x0 - 2 * dl) * f; a.box(x - R * 0.25, a.cy - R * 1.02, a.Z0, x + R * 0.25, a.cy + R * 1.02, zc - R * 0.55); a.prism([[x - R * 0.25, a.cy - R * 0.9], [x + R * 0.25, a.cy - R * 0.9], [x + R * 0.25, a.cy + R * 0.9], [x - R * 0.25, a.cy + R * 0.9]], zc - R * 0.55, zc - R * 0.45); a.xcyl(x - R * 0.28, x + R * 0.28, a.cy, zc, R * 1.0, 24); }
      a.cyl((x0 + x1) / 2, a.cy, zc + R * 0.9, zc + R * 1.12, R * 0.22, 16); a.cyl((x0 + x1) / 2, a.cy, zc + R * 1.12, zc + R * 1.18 > a.Z1 ? a.Z1 : zc + R * 1.18, R * 0.26, 16);
      a.tube([[x0 + dl * 0.3, a.cy, zc + R * 0.7], [x0 + dl * 0.3, a.cy, zc + R * 1.15]], [R * 0.04, R * 0.04], 6); a.tube([[x1 - dl * 0.3, a.cy - R * 0.5, zc + R * 0.7], [x1 - dl * 0.3, a.cy - R * 0.5, zc + R * 1.05]], [R * 0.05, R * 0.05], 6);
      a.rect(a.X0 + 30, a.cy - R, a.X1 - 30, a.cy + R, 'EQUIP'); a.circ((x0 + x1) / 2, a.cy, R * 0.22, 'EQUIP-DETAIL');
      for (const f of [0.28, 0.72]) { const x = x0 + dl + (x1 - x0 - 2 * dl) * f; a.rect(x - R * 0.25, a.cy - R * 1.02, x + R * 0.25, a.cy + R * 1.02, 'EQUIP-DETAIL'); }
      a.log('Added the barrel, domed ends, weld bands, skirt flanges, two saddle cradles, manway, vent line and fill ports (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic aircraft landing gear leg',
    desc: (v) => `${v.label}: a ${v.h} in leg with a trunnion housing, a telescoping oleo strut, scissor torque links, ${v.n === 6 ? 'a bogie beam carrying six wheels on three axles' : v.n === 2 ? 'an axle with two wheels' : 'an axle with one wheel'}, a drag brace, a retraction actuator and brake units.`,
    vs: [['light aircraft main leg, 1 wheel', 36, 1, 8], ['regional main leg, 2 wheels', 64, 2, 15], ['narrow-body main leg, 2 wheels', 100, 2, 24], ['wide-body main leg, 6 wheels', 160, 6, 27]].map(([l, h, n, wr]) => [l, n === 6 ? wr * 2.6 + 30 : n === 2 ? wr * 2.2 + 40 : wr * 1.4 + 40, n === 6 ? wr * 2 * 3.6 + 24 : wr * 2 + 30, h, 0, { h, n, wr, label: l }]),
    build: (a, v) => {
      const r = v.wr * IN, cx = a.cx, cy = a.cy, zA = a.Z0 + r, H = a.H, sr = H * 0.04, ww = v.n === 1 ? r * 0.5 : r * 0.55;
      a.box(cx - a.W * 0.16, cy - r * 0.35, a.Z1 - H * 0.1, cx + a.W * 0.16, cy + r * 0.35, a.Z1); a.xcyl(cx - a.W * 0.3, cx + a.W * 0.3, cy, a.Z1 - H * 0.05, H * 0.035, 10);
      a.cyl(cx, cy, zA + H * 0.4, a.Z1 - H * 0.1, sr * 1.5, 16); a.cyl(cx, cy, zA + H * 0.06, zA + H * 0.4, sr, 14);
      a.box(cx - sr * 1.7, cy - sr * 1.2, zA + H * 0.36, cx + sr * 1.7, cy + sr * 1.2, zA + H * 0.4);
      a.tube([[cx, cy - sr * 1.4, zA + H * 0.4], [cx, cy - sr * 2.6, zA + H * 0.22], [cx, cy - sr * 1.2, zA + H * 0.08]], [sr * 0.3, sr * 0.3, sr * 0.3], 6); a.tube([[cx, cy + sr * 1.4, zA + H * 0.4], [cx, cy + sr * 2.6, zA + H * 0.22], [cx, cy + sr * 1.2, zA + H * 0.08]], [sr * 0.3, sr * 0.3, sr * 0.3], 6);
      a.tube([[cx + sr * 1.5, cy, a.Z1 - H * 0.12], [cx + sr * 2.5, cy + r * 0.5, zA + H * 0.36]], [sr * 0.35, sr * 0.35], 6); a.tube([[cx + a.W * 0.3, cy - r * 0.2, a.Z1 - H * 0.05], [cx + sr * 1.2, cy - r * 0.2, zA + H * 0.5]], [sr * 0.35, sr * 0.35], 6);
      if (v.n === 6) {
        const bl = r * 2 * 3.6 / 2; a.box(cx - sr * 1.4, cy - bl, zA + H * 0.02, cx + sr * 1.4, cy + bl, zA + H * 0.08); a.box(cx - sr * 1.2, cy - sr * 1.2, zA + H * 0.08, cx + sr * 1.2, cy + sr * 1.2, zA + H * 0.14);
        for (const dy of [-1, 0, 1]) { const y = cy + dy * (r * 2.3); a.xcyl(cx - a.W * 0.45, cx + a.W * 0.45, y, zA, sr * 0.45, 8); for (const s of [-1, 1]) { whl(a, cx + s * (a.W * 0.31), y, r, ww, zA); } }
        a.rect(cx - a.W * 0.45, cy - bl, cx + a.W * 0.45, cy + bl, 'EQUIP-DETAIL');
      } else {
        a.xcyl(cx - (v.n === 2 ? a.W * 0.43 : ww * 0.9), cx + (v.n === 2 ? a.W * 0.43 : ww * 0.9), cy, zA, sr * 0.5, 10);
        if (v.n === 2) for (const s of [-1, 1]) { whl(a, cx + s * a.W * 0.28, cy, r, ww, zA); a.box(cx + s * a.W * 0.28 - ww * 0.5, cy - r * 0.35, zA - r * 0.35, cx + s * a.W * 0.28 - ww * 0.5 - 8 * s, cy + r * 0.35, zA + r * 0.35); } else { whl(a, cx, cy, r, ww, zA); a.xcyl(cx - ww * 0.45, cx + ww * 0.45, cy, zA, r * 0.5, 10); }
      }
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP-DETAIL'); a.circ(cx, cy, sr * 1.5, 'EQUIP');
      a.log('Added the trunnion housing, oleo strut, torque links, axle and wheels with brake units, drag brace and retraction actuator (plan and 3D).');
    } }),

  // ===================================================== ground =====================================================
  fam({ cat: 'aerospace/ground', title: 'Generic cleanroom laminar flow bench',
    desc: (v) => `Cleanroom work bench, ${v.w} in wide, with a ${v.sash} front sash: a stainless worktop on frame legs with a lower shelf and casters, side and rear panels, a filter plenum with grille on top, light bar, a raised sash frame with glass and an anti-static mat.`,
    vs: [['48 in wide, half sash', 48, 30, 78, 'half'], ['72 in wide, half sash', 72, 34, 80, 'half'], ['96 in wide, full-open', 96, 36, 82, 'open'], ['60 in wide, tall vertical-flow', 60, 36, 96, 'half']].map(([l, w, d, h, sash]) => [l, w, d, h, 0, { w, sash }]),
    build: (a, v) => {
      const wt = a.Z0 + 36 * IN, T = 40;
      for (const [x, y] of [[a.X0 + 40, a.YF + 40], [a.X1 - 40, a.YF + 40], [a.X0 + 40, a.YB - 40], [a.X1 - 40, a.YB - 40]]) { a.cyl(x, y, a.Z0 + 90, wt - 30, 22, 8); a.caster(x, y, 90); }
      a.box(a.X0 + 40, a.YF + 40, a.Z0 + 260, a.X1 - 40, a.YB - 40, a.Z0 + 290); a.frame(a.X0 + 40, wt - 80, a.X1 - 40, wt - 30, a.YF + 40, a.YF + 80, 30); a.frame(a.X0 + 40, wt - 80, a.X1 - 40, wt - 30, a.YB - 80, a.YB - 40, 30);
      a.box(a.X0, a.YF, wt - 30, a.X1, a.YB, wt); a.box(a.X0 + 150, a.YF + 120, wt, a.X1 - 150, a.YB - 140, wt + 6);
      const hz = a.Z1 - 20 * IN; a.box(a.X0, a.YB - T, wt, a.X1, a.YB, hz); for (const s of [0, 1]) a.box(s ? a.X1 - T : a.X0, a.YF + 120, wt, s ? a.X1 : a.X0 + T, a.YB, hz);
      a.box(a.X0, a.YF + 90, hz, a.X1, a.YB, a.Z1 - 80); a.box(a.X0 + 30, a.YF + 60, a.Z1 - 80, a.X1 - 30, a.YB - 30, a.Z1);
      const n = m.round(a.W / 260); for (let i = 0; i < n; i++) { const x = a.X0 + 80 + ((a.W - 160) * (i + 0.5)) / n; a.box(x - 80, a.YF + 120, a.Z1 - 90, x + 80, a.YF + 180, a.Z1 - 80); }
      a.box(a.X0 + T, a.YF + 120, hz - 60, a.X1 - T, a.YF + 150, hz);
      const sz1 = v.sash === 'half' ? wt + (hz - wt) * 0.5 : wt + (hz - wt) * 0.82; a.frame(a.X0 + T, wt + 50, a.X1 - T, sz1, a.YF + 110, a.YF + 130, 28);
      a.box(a.X0 + T + 28, a.YF + 118, wt + 78, a.X1 - T - 28, a.YF + 122, sz1 - 28);
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP'); a.rect(a.X0 + 150, a.YF + 120, a.X1 - 150, a.YB - 140, 'EQUIP-DETAIL'); a.line(a.X0, a.YF + 120, a.X1, a.YF + 120, 'EQUIP-DETAIL'); a.clear('Operator', a.X0, a.YF - 700, a.X1, a.YF, 80);
      a.log('Added the worktop on a frame with shelf and casters, side and rear panels, the filter plenum with grille, light bar, glazed sash frame and anti-static mat (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic rocket engine handling stand',
    desc: (v) => `Engine handling stand, ${v.len} in long: a welded tube base frame on four swivel casters, a tow handle, two uprights carrying V-block saddle cradles with strap clamps and a rotating ring clamp at the nose end.`,
    vs: [['small, 60 in', 60, 30, 34], ['medium, 96 in', 96, 38, 44], ['large, 144 in', 144, 52, 60], ['heavy, 192 in', 192, 72, 80]].map(([l, len, w, h]) => [l, len, w, h, 0, { len }]),
    build: (a, v) => {
      const t = m.max(30, a.D * 0.05), bx0 = a.X0 + 30, bx1 = a.X1 - 90, by0 = a.YF + 40, by1 = a.YB - 40, zb = a.Z0 + 180, zs = a.Z0 + a.H * 0.62, vd = a.H * 0.2, sw = a.D * 0.36;
      a.tube([[bx0, by0, zb], [bx1, by0, zb], [bx1, by1, zb], [bx0, by1, zb], [bx0, by0, zb]], Array(5).fill(t), 6); a.tube([[a.cx, by0, zb], [a.cx, by1, zb]], [t, t], 6);
      for (const [x, y] of [[bx0, by0], [bx1, by0], [bx0, by1], [bx1, by1]]) a.caster(x, y, 180);
      a.tube([[bx1, a.cy, zb], [a.X1 - 10, a.cy, zb + 300], [a.X1 - 10, a.cy, a.Z0 + a.H * 0.4]], [14, 14, 14], 6);
      const R = m.min(a.H * 0.15, a.D * 0.3), zc = zs + R * 0.35;
      for (const fx of [0.28, 0.72]) { const x = a.X0 + a.W * fx; for (const y of [by0, by1]) a.tube([[x, y, zb], [x, y, zs - 20]], [t, t], 6); a.tube([[x, by0, zs - 20], [x, by1, zs - 20]], [t, t], 6);
        a.box(x - 90, a.cy - sw, zs - 20, x + 90, a.cy + sw, zs);
        prismX(a, [[a.cy - sw, zs], [a.cy - sw * 0.08, zs - vd], [a.cy + sw * 0.08, zs - vd], [a.cy + sw, zs], [a.cy + sw * 0.86, zs], [a.cy, zs - vd * 0.7], [a.cy - sw * 0.86, zs]].slice(0, 4), x - 90, x + 90);
        a.box(x - 90, a.cy - sw, zs, x + 90, a.cy - sw + 40, zs + vd * 0.8); a.box(x - 90, a.cy + sw - 40, zs, x + 90, a.cy + sw, zs + vd * 0.8);
        a.tube([[x, a.cy - sw * 0.9, zs + vd * 0.8], [x, a.cy, zc + R * 1.1], [x, a.cy + sw * 0.9, zs + vd * 0.8]], [8, 8, 8], 4); }
      a.tube([[a.X0 + a.W * 0.06, a.cy, zc], [a.X0 + a.W * 0.3, a.cy, zc], [a.X0 + a.W * 0.6, a.cy, zc], [a.X1 - a.W * 0.2, a.cy, zc]], [R * 0.9, R * 0.5, R * 0.45, R * 0.35], 16);
      a.xcyl(a.X0 + a.W * 0.02, a.X0 + a.W * 0.08, a.cy, zc, R * 1.05, 16); a.box(a.X1 - a.W * 0.26, a.cy - R * 0.5, zc - R * 0.5, a.X1 - a.W * 0.2, a.cy + R * 0.5, zc + R * 0.5);
      a.rect(bx0, by0, bx1, by1, 'EQUIP'); a.line(a.cx, by0, a.cx, by1, 'EQUIP-DETAIL'); for (const fx of [0.28, 0.72]) a.rect(a.X0 + a.W * fx - 90, a.cy - sw, a.X0 + a.W * fx + 90, a.cy + sw, 'EQUIP-DETAIL');
      a.log('Added the tube base frame, casters, tow handle, uprights with slanted V-block saddles and strap clamps and the engine bell resting in them (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic launch stage transporter trailer',
    desc: (v) => `Self-propelled stage transporter, ${v.ax} axle lines of four wheels each: a low deck frame with a drawbar, two saddle cradles carrying a cylindrical stage on strap bands, an operator platform with a rail and warning lights.`,
    vs: [['4 axle lines, 60 ft', 4, 60, 144], ['6 axle lines, 90 ft', 6, 90, 168], ['8 axle lines, 120 ft', 8, 120, 192], ['12 axle lines, 160 ft', 12, 160, 216]].map(([l, ax, len, w]) => [l, w, len * 12, (ax >= 8 ? 190 : 150) + (ax * 0), 0, { ax, len }]),
    build: (a, v) => {
      const dz = a.Z0 + 36 * IN * 0.62, ww = a.W * 0.09, wr = 22 * IN * 0.6, L = a.D, sr = a.W * 0.36, zc = dz + 8 * IN + sr;
      a.box(a.X0 + a.W * 0.12, a.YF + L * 0.06, dz - 14 * IN, a.X1 - a.W * 0.12, a.YB - L * 0.03, dz); a.tube([[a.cx, a.YF + L * 0.06, dz - 8 * IN], [a.cx, a.YF, dz - 8 * IN]], [60, 60], 8);
      for (let i = 0; i < v.ax; i++) { const y = a.YF + L * 0.14 + (L * 0.8 * i) / (v.ax - 1 || 1); for (const sx of [-1, 1]) for (const k of [0, 1]) whl(a, a.cx + sx * (a.W * 0.37 - k * (ww + 40)), y, wr, ww, a.Z0 + wr); a.xcyl(a.cx - a.W * 0.38, a.cx + a.W * 0.38, y, a.Z0 + wr, 36, 8); }
      a.xcyl(a.X0 + a.W * 0.1, a.X1 - a.W * 0.1, a.YF + L * 0.18, dz - 8 * IN, 60, 8);
      a.ycyl(a.YF + L * 0.18, a.YB - L * 0.04, a.cx, zc, sr, 26); a.ell(a.cx, a.YB - L * 0.04, zc, sr * 0.98, sr * 0.55, sr * 0.98, 14, 6);
      for (const f of [0.3, 0.7]) { const y = a.YF + L * f; a.prism([[a.cx - sr * 0.9, y - 80], [a.cx + sr * 0.9, y - 80], [a.cx + sr * 0.9, y + 80], [a.cx - sr * 0.9, y + 80]], dz, dz + 8 * IN); a.ycyl(y - 40, y + 40, a.cx, zc, sr * 1.03, 26); a.box(a.cx - sr * 1.05, y - 50, dz + 8 * IN, a.cx - sr * 0.6, y + 50, zc); a.box(a.cx + sr * 0.6, y - 50, dz + 8 * IN, a.cx + sr * 1.05, y + 50, zc); }
      a.box(a.X0 + a.W * 0.14, a.YF + L * 0.08, dz, a.X0 + a.W * 0.14 + 700, a.YF + L * 0.08 + 800, dz + 24); a.tube([[a.X0 + a.W * 0.14, a.YF + L * 0.08, dz + 1100], [a.X0 + a.W * 0.14 + 700, a.YF + L * 0.08, dz + 1100]], [20, 20], 5);
      a.cyl(a.X0 + a.W * 0.16, a.YF + L * 0.09, dz + 24, dz + 1100, 20, 6); a.cyl(a.X0 + a.W * 0.14 + 680, a.YF + L * 0.09, dz + 24, dz + 1100, 20, 6);
      a.cyl(a.X1 - a.W * 0.2, a.YF + L * 0.1, dz, dz + 300, 35, 8); a.ell(a.X1 - a.W * 0.2, a.YF + L * 0.1, dz + 300, 80, 80, 70, 8, 4);
      a.rect(a.X0 + a.W * 0.12, a.YF + L * 0.06, a.X1 - a.W * 0.12, a.YB - L * 0.03, 'EQUIP'); a.ellp(a.cx, a.YF + L * 0.55, sr, L * 0.47, 'EQUIP-DETAIL');
      for (let i = 0; i < v.ax; i++) { const y = a.YF + L * 0.14 + (L * 0.8 * i) / (v.ax - 1 || 1); for (const sx of [-1, 1]) for (const k of [0, 1]) a.rect(a.cx + sx * (a.W * 0.37 - k * (ww + 40)) - ww / 2, y - wr, a.cx + sx * (a.W * 0.37 - k * (ww + 40)) + ww / 2, y + wr, 'EQUIP-DETAIL'); }
      a.log('Added the deck frame and drawbar, axle lines with paired wheels, two saddle cradles with strap bands, the carried stage, operator platform with rail and warning light (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic static fire test stand',
    desc: (v) => `Engine static fire stand, ${v.hft} ft tall: four braced lattice columns, a heavy thrust frame at the top holding a vertical engine with its bell pointing down, two propellant run tanks, a flame trench with a wedge deflector below and a service platform with rail.`,
    vs: [['sub-scale, 40 ft', 40, 20], ['engine, 70 ft', 70, 28], ['stage, 120 ft', 120, 44], ['heavy, 180 ft', 180, 60]].map(([l, hft, wft]) => [l, wft * 12, wft * 12 * 1.6, hft * 12, 0, { hft, wft }]),
    build: (a, v) => {
      const s = a.W, ty = a.YB - s / 2, x0 = a.X0 + 40, x1 = a.X1 - 40, yb = ty + s / 2 - 40, yf = ty - s / 2 + 40, Hh = a.H * 0.93, t = s * 0.035, tz = a.Z0 + Hh * 0.74, bays = m.round(v.hft / 15), bh = Hh / bays;
      a.box(a.X0, a.YF, a.Z0, a.X1, a.YB, a.Z0 + a.H * 0.03);
      for (const [x, y] of [[x0, yb], [x1, yb], [x0, yf], [x1, yf]]) a.tube([[x, y, a.Z0 + a.H * 0.03], [x, y, a.Z0 + Hh]], [t, t], 6);
      for (let k = 0; k < bays; k++) { const z0 = a.Z0 + a.H * 0.03 + k * (Hh - a.H * 0.03) / bays, z1 = z0 + (Hh - a.H * 0.03) / bays; braceXZ(a, x0, x1, yb, z0, z1, t * 0.4); braceXZ(a, x0, x1, yf, z0, z1, t * 0.4); braceYZ(a, x0, yf, yb, z0, z1, t * 0.4); braceYZ(a, x1, yf, yb, z0, z1, t * 0.4); }
      a.box(x0 - 20, yf - 20, tz - s * 0.07, x1 + 20, yb + 20, tz + s * 0.04); a.box(a.cx - s * 0.18, ty - s * 0.18, tz + s * 0.04, a.cx + s * 0.18, ty + s * 0.18, tz + s * 0.12);
      a.cyl(a.cx, ty, tz - s * 0.2, tz + s * 0.04, s * 0.13, 20); bell(a, a.cx, ty, tz - s * 0.2, s * 0.28, s * 0.05, s * 0.15, 16);
      for (const sx of [-1, 1]) { a.cyl(a.cx + sx * s * 0.34, ty, a.Z0 + a.H * 0.03, tz - s * 0.1, s * 0.09, 18); a.ell(a.cx + sx * s * 0.34, ty, tz - s * 0.1, s * 0.09, s * 0.09, s * 0.06, 12, 5); a.tube([[a.cx + sx * s * 0.34, ty, tz - s * 0.15], [a.cx + sx * s * 0.1, ty, tz + s * 0.05]], [s * 0.015, s * 0.015], 6); a.circ(a.cx + sx * s * 0.34, ty, s * 0.09, 'EQUIP-DETAIL'); }
      prismY(a, [[a.cx - s * 0.3, a.Z0 + a.H * 0.03], [a.cx + s * 0.3, a.Z0 + a.H * 0.03], [a.cx, a.Z0 + a.H * 0.03 + s * 0.35]], ty - s * 0.3, ty + s * 0.3);
      a.box(a.X0 + 20, yf - s * 0.5 + 40, tz - s * 0.2, x1 + 20, yf - 10, tz - s * 0.2 + 25); a.tube([[a.X0 + 20, yf - s * 0.5 + 40, tz - s * 0.2 + 900], [x1 + 20, yf - s * 0.5 + 40, tz - s * 0.2 + 900]], [16, 16], 5);
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP'); a.rect(x0, yf, x1, yb, 'EQUIP-DETAIL'); a.circ(a.cx, ty, s * 0.15, 'EQUIP-DETAIL'); for (const sx of [-1, 1]) a.circ(a.cx + sx * s * 0.34, ty, s * 0.09, 'EQUIP-DETAIL');
      a.log('Added the base slab, braced lattice columns, thrust frame with vertical engine and bell, two run tanks with feed lines, flame deflector and service platform (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic payload adapter handling dolly',
    desc: (v) => `Handling dolly for a ${v.ring} in payload adapter: a square tube base on four locking casters, a turntable ring, a conical fixture ending in a clamp ring with bolt blocks, a push handle and two lifting eyes.`,
    vs: [['24 in ring', 24, 36], ['37 in ring', 37, 48], ['62 in ring', 62, 72], ['94 in ring', 94, 108]].map(([l, ring, w]) => [l, w, w, ring * 0.9 + 22, 0, { ring }]),
    build: (a, v) => {
      const Rr = v.ring * IN / 2, cx = a.cx, cy = a.cy, bz = a.Z0 + 6 * IN, t = 28;
      a.tube([[a.X0 + t, a.YF + t, bz], [a.X1 - t, a.YF + t, bz], [a.X1 - t, a.YB - t, bz], [a.X0 + t, a.YB - t, bz], [a.X0 + t, a.YF + t, bz]], Array(5).fill(t), 4); a.tube([[a.X0 + t, a.YF + t, bz], [a.X1 - t, a.YB - t, bz]], [t * 0.7, t * 0.7], 4); a.tube([[a.X1 - t, a.YF + t, bz], [a.X0 + t, a.YB - t, bz]], [t * 0.7, t * 0.7], 4);
      for (const [x, y] of [[a.X0 + t, a.YF + t], [a.X1 - t, a.YF + t], [a.X0 + t, a.YB - t], [a.X1 - t, a.YB - t]]) { a.caster(x, y, 6 * IN * 0.95); }
      a.cyl(cx, cy, bz + t, bz + 70, Rr * 0.4, 20); a.cyl(cx, cy, bz + 70, bz + 100, Rr * 0.82, 28);
      const zt = a.Z1 - 20; a.cone(cx, cy, bz + 100, zt - 60, Rr * 0.82, Rr * 0.9 * 0.82, 28);
      a.cyl(cx, cy, zt - 60, zt, Rr, 32); for (let i = 0; i < 12; i++) { const g = (i / 12) * PI * 2; a.box(cx + m.cos(g) * Rr - 22, cy + m.sin(g) * Rr - 22, zt - 80, cx + m.cos(g) * Rr + 22, cy + m.sin(g) * Rr + 22, zt + 0.0); }
      a.tube([[a.X0 + t, a.YB - t, bz], [a.X0 + t, a.YB - t, bz + 700], [a.X1 - t, a.YB - t, bz + 700], [a.X1 - t, a.YB - t, bz]], Array(4).fill(15), 5);
      a.circ(cx, cy, Rr, 'EQUIP'); a.circ(cx, cy, Rr * 0.82, 'EQUIP-DETAIL'); a.rect(a.X0 + t, a.YF + t, a.X1 - t, a.YB - t, 'EQUIP-DETAIL'); a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP-HIDDEN');
      a.log('Added the tube base with casters, turntable ring, conical fixture, clamp ring with bolt blocks and push handle (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic rolling access platform for stage work',
    desc: (v) => `Rolling access platform, ${v.hft} ft working height: a braced tube tower on four locking casters with outriggers, ${v.lv} working levels with toe boards and guard rails, a stair run between levels and a gate at the top.`,
    vs: [['8 ft, 1 level', 8, 1], ['12 ft, 2 levels', 12, 2], ['16 ft, 2 levels', 16, 2], ['24 ft, 3 levels', 24, 3], ['32 ft, 4 levels', 32, 4]].map(([l, hft, lv]) => [l, 72 + hft * 3, 96 + hft * 4, hft * 12 + 42, 0, { hft, lv }]),
    build: (a, v) => {
      const t = 24, x0 = a.X0 + 150, x1 = a.X1 - 150, y1 = a.YB - 80, y0 = a.YF + 400, zb = a.Z0 + 160, Ht = a.H - 1100;
      for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) { a.tube([[x, y, zb], [x, y, zb + Ht]], [t, t], 6); a.caster(x, y, 160); }
      for (const [x, y] of [[a.X0 + 40, a.YF + 40], [a.X1 - 40, a.YF + 40]]) { a.tube([[x, y, a.Z0 + 60], [x < a.cx ? x0 : x1, y0, zb + 200]], [18, 18], 5); a.cyl(x, y, a.Z0, a.Z0 + 60, 50, 8); }
      const nb = v.lv * 2, bh = Ht / nb;
      for (let k = 0; k < nb; k++) { const z0 = zb + k * bh, z1 = z0 + bh; braceXZ(a, x0, x1, y1, z0, z1, 9); braceYZ(a, x0, y0, y1, z0, z1, 9); braceYZ(a, x1, y0, y1, z0, z1, 9); }
      for (let L = 1; L <= v.lv; L++) { const z = zb + (Ht * L) / v.lv - (L === v.lv ? 0 : 0);
        a.box(x0 - 60, y0 - 60, z - 30, x1 + 60, y1 + 60, z);
        a.box(x0 - 60, y0 - 60, z, x1 + 60, y0 - 50, z + 150); a.box(x0 - 60, y1 + 50, z, x1 + 60, y1 + 60, z + 150); a.box(x0 - 60, y0 - 60, z, x0 - 50, y1 + 60, z + 150); a.box(x1 + 50, y0 - 60, z, x1 + 60, y1 + 60, z + 150);
        a.tube([[x0 - 55, y0 - 55, z + 1050], [x1 + 55, y0 - 55, z + 1050], [x1 + 55, y1 + 55, z + 1050], [x0 - 55, y1 + 55, z + 1050], [x0 - 55, y0 - 55, z + 1050]], Array(5).fill(16), 5);
        for (const [x, y] of [[x0 - 55, y0 - 55], [x1 + 55, y0 - 55], [x0 - 55, y1 + 55], [x1 + 55, y1 + 55]]) a.tube([[x, y, z], [x, y, z + 1050]], [14, 14], 5); }
      const sx = a.X0 + 100, stairZ1 = zb + Ht / v.lv;
      a.prism([[sx, a.YF + 20], [sx + 700, a.YF + 20], [sx + 700, y0 - 60], [sx, y0 - 60]], a.Z0 + 40, a.Z0 + 70);
      for (let i = 0; i < 6; i++) { const y = a.YF + 40 + i * ((y0 - 60 - a.YF - 40) / 6), z = zb + 120 + i * ((stairZ1 - zb - 120) / 6); a.box(sx, y, z - 20, sx + 700, y + (y0 - a.YF - 100) / 6, z); }
      a.tube([[sx, a.YF + 40, zb + 120], [sx, y0 - 60, stairZ1 + 900]], [14, 14], 5);
      a.rect(a.X0, a.YF, a.X1, a.YB, 'EQUIP-HIDDEN'); a.rect(x0 - 60, y0 - 60, x1 + 60, y1 + 60, 'EQUIP'); a.rect(sx, a.YF + 20, sx + 700, y0 - 60, 'EQUIP-DETAIL');
      for (let i = 1; i < 6; i++) a.line(sx, a.YF + 20 + i * ((y0 - 80 - a.YF) / 6), sx + 700, a.YF + 20 + i * ((y0 - 80 - a.YF) / 6), 'EQUIP-DETAIL');
      a.log('Added the braced tube tower on locking casters with outriggers, working levels with toe boards and guard rails, and the stair run (plan and 3D).');
    } }),
];
export default FAMS;

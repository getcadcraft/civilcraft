/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, aerospace: more launch-site structures and vehicles, spacecraft and payload hardware, airframe and propulsion structures on jigs and stands, and ground, test and cleanroom equipment. Original geometry; generic scale shapes, no particular vehicle, programme or maker. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = m.PI;

// ------------------------------------------------------------------------------------------ helpers
const add3 = (p, u, s) => [p[0] + u[0] * s, p[1] + u[1] * s, p[2] + u[2] * s];
const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const unit = (u) => { const l = m.hypot(...u) || 1; return [u[0] / l, u[1] / l, u[2] / l]; };
/** two unit vectors perpendicular to u */
function basis(u) { const e1 = unit(m.abs(u[2]) > 0.95 ? cross(u, [1, 0, 0]) : cross(u, [0, 0, 1])); return [e1, unit(cross(u, e1))]; }
/** a flat convex polygon of 3D points, thickened by t along n */
function plate3(a, pts, n, t) {
  const h = t / 2, A = pts.map((p) => add3(p, n, -h)), B = pts.map((p) => add3(p, n, h)), k = pts.length;
  for (let i = 1; i < k - 1; i++) a.t.push([A[0], A[i + 1], A[i]], [B[0], B[i], B[i + 1]]);
  for (let i = 0; i < k; i++) { const j = (i + 1) % k; a.t.push([A[i], A[j], B[j]], [A[i], B[j], B[i]]); }
}
/** extrude a polygon given as [x, z] points between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** extrude a polygon given as [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** a closed ring (loop) of small tube around axis u at c */
function ring3(a, c, u, r, tr, seg = 24) {
  const [e1, e2] = basis(u), pts = [];
  for (let i = 0; i <= seg; i++) { const g = (i / seg) * PI * 2; pts.push(add3(add3(c, e1, m.cos(g) * r), e2, m.sin(g) * r)); }
  a.tube(pts, pts.map(() => tr), 5);
}
/** a solid dish: bowl profile along u from c, radius R, depth dp; with rim ring, three feed struts and a feed horn */
function dish(a, c, u, R, dp, feedLen, seg = 22) {
  const pts = [], rads = [], N = 7;
  for (let i = 0; i <= N; i++) { const f = i / N; pts.push(add3(c, u, dp * f)); rads.push(R * m.sqrt(0.1 + 0.9 * f)); }
  a.tube(pts, rads, seg);
  const top = add3(c, u, dp), [e1, e2] = basis(u), fp = add3(c, u, dp + feedLen);
  ring3(a, top, u, R, R * 0.025, seg);
  for (let i = 0; i < 3; i++) { const g = (i / 3) * PI * 2 + 0.5, q = add3(add3(top, e1, m.cos(g) * R * 0.97), e2, m.sin(g) * R * 0.97); a.tube([q, fp], [R * 0.012, R * 0.012], 4); }
  a.tube([add3(fp, u, -R * 0.12), add3(fp, u, R * 0.08)], [R * 0.06, R * 0.1], 8);
}
/** a bell nozzle from a throat at zTop down to the exit at zTop-h */
function bell(a, cx, cy, zTop, h, rt, re, seg = 14) {
  const N = 6, pts = [], rads = [];
  for (let i = 0; i <= N; i++) { const f = i / N; pts.push([cx, cy, zTop - h * f]); rads.push(rt + (re - rt) * m.pow(f, 0.55)); }
  a.tube(pts, rads, seg); a.cyl(cx, cy, zTop - 1, zTop + h * 0.18, rt * 1.5, seg); a.cyl(cx, cy, zTop - h, zTop - h + h * 0.04, re * 1.06, seg);
}
/** a tangent-ogive style nose from z0 (radius R) to z1 (tip) */
function ogive(a, cx, cy, z0, z1, R, seg = 20) {
  const N = 8, pts = [], rads = [];
  for (let i = 0; i <= N; i++) { const f = i / N; pts.push([cx, cy, z0 + (z1 - z0) * f]); rads.push(m.max(R * m.pow(1 - f * f, 0.6), R * 0.05)); }
  a.tube(pts, rads, seg);
}
function band(a, cx, cy, z, r, h = 40, seg = 24) { a.cyl(cx, cy, z - h / 2, z + h / 2, r, seg); }
/** a solar panel in the X-Z plane at y, with cell strips */
function panel(a, x0, x1, y, z0, z1, cols, rows, t = 18) {
  a.box(x0, y - t / 2, z0, x1, y + t / 2, z1);
  for (let i = 1; i < cols; i++) { const x = x0 + ((x1 - x0) * i) / cols; a.box(x - 3, y - t / 2 - 2, z0, x + 3, y + t / 2 + 2, z1); }
  for (let j = 1; j < rows; j++) { const z = z0 + ((z1 - z0) * j) / rows; a.box(x0, y - t / 2 - 2, z - 3, x1, y + t / 2 + 2, z + 3); }
}
function whl(a, x, y, r, w, zc) {
  a.xcyl(x - w / 2, x + w / 2, y, zc, r, 16); a.xcyl(x - w / 2 - 6, x + w / 2 + 6, y, zc, r * 0.42, 10);
  a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL');
}
/** cross braces on an x-z plane (y fixed) and a y-z plane (x fixed) */
function braceXZ(a, x0, x1, y, z0, z1, t = 10) { a.tube([[x0, y, z0], [x1, y, z1]], [t, t], 4); a.tube([[x1, y, z0], [x0, y, z1]], [t, t], 4); }
function braceYZ(a, x, y0, y1, z0, z1, t = 10) { a.tube([[x, y0, z0], [x, y1, z1]], [t, t], 4); a.tube([[x, y1, z0], [x, y0, z1]], [t, t], 4); }
/** a square lattice tower: four legs from half-width h0 at z0 to h1 at z1, ties and cross braces at each of n levels */
function lattice(a, cx, cy, z0, z1, h0, h1, n, t) {
  const hw = (z) => h0 + (h1 - h0) * ((z - z0) / (z1 - z0));
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) a.tube([[cx + sx * h0, cy + sy * h0, z0], [cx + sx * h1, cy + sy * h1, z1]], [t * 1.4, t * 1.4], 6);
  for (let i = 0; i <= n; i++) {
    const z = z0 + ((z1 - z0) * i) / n, h = hw(z);
    if (i > 0 && i < n) a.tube([[cx - h, cy - h, z], [cx + h, cy - h, z], [cx + h, cy + h, z], [cx - h, cy + h, z], [cx - h, cy - h, z]], Array(5).fill(t), 4);
    if (i < n) { const zb = z + (z1 - z0) / n, hb = hw(zb); braceXZ(a, cx - h, cx + hb, cy - h, z, zb, t * 0.8); braceXZ(a, cx - h, cx + hb, cy + h, z, zb, t * 0.8); braceYZ(a, cx - h, cy - h, cy + hb, z, zb, t * 0.8); braceYZ(a, cx + h, cy - h, cy + hb, z, zb, t * 0.8); }
  }
}
/** guard rail around a rectangle at height z: posts and two rails */
function guard(a, x0, y0, x1, y1, z, h = 1050, r = 14) {
  const P = [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
  for (const k of [h, h * 0.5]) a.tube(P.map(([x, y]) => [x, y, z + k]), Array(5).fill(r * 0.8), 4);
  for (const [x, y] of P.slice(0, 4)) a.tube([[x, y, z], [x, y, z + h]], [r, r], 5);
}

/** a cradle under a round body whose axis runs along x (saddle at x, width w) or along y: strips cut to the body curve */
function saddleX(a, x, w, R, zc, cy, zbase, n = 12) {
  for (let k = 0; k < n; k++) { const y0 = cy - R + (2 * R * k) / n, y1 = cy - R + (2 * R * (k + 1)) / n, ym = (y0 + y1) / 2 - cy, zb = zc - m.sqrt(m.max(R * R - ym * ym, 0)) - 4; a.box(x - w / 2, y0, zbase, x + w / 2, y1, m.max(zb, zbase + 20)); }
}
function saddleY(a, y, w, R, zc, cx, zbase, n = 12) {
  for (let k = 0; k < n; k++) { const x0 = cx - R + (2 * R * k) / n, x1 = cx - R + (2 * R * (k + 1)) / n, xm = (x0 + x1) / 2 - cx, zb = zc - m.sqrt(m.max(R * R - xm * xm, 0)) - 4; a.box(x0, y - w / 2, zbase, x1, y + w / 2, m.max(zb, zbase + 20)); }
}
/** a thin shell around the y axis through stations [y, r] (open ends), both faces drawn */
function shellY(a, cx, zc, st, seg = 24, t = 6) {
  for (let i = 0; i < st.length - 1; i++) for (let k = 0; k < seg; k++) {
    const g0 = (k / seg) * PI * 2, g1 = ((k + 1) / seg) * PI * 2, P = (s, g, d) => [cx + m.cos(g) * (s[1] + d), s[0], zc + m.sin(g) * (s[1] + d)];
    for (const d of [0, -t]) a.t.push([P(st[i], g0, d), P(st[i + 1], g0, d), P(st[i + 1], g1, d)], [P(st[i], g0, d), P(st[i + 1], g1, d), P(st[i], g1, d)], [P(st[i], g0, d), P(st[i + 1], g1, d), P(st[i + 1], g0, d)], [P(st[i], g0, d), P(st[i], g1, d), P(st[i + 1], g1, d)]);
  }
}
/** a plate from 3D points, normal taken from the first three points */
function plateN(a, pts, t) { plate3(a, pts, unit(cross([pts[1][0] - pts[0][0], pts[1][1] - pts[0][1], pts[1][2] - pts[0][2]], [pts[2][0] - pts[0][0], pts[2][1] - pts[0][1], pts[2][2] - pts[0][2]])), t); }
/** a bare or cowled turbofan along y from y0 (front, negative) toward the back: fan face, spinner, blades, cases and a nozzle */
function turbofan(a, cx, zc, y0, Rf, L, cowl) {
  const Ro = Rf * (cowl ? 1.3 : 1.1), y1 = y0 + L, ci = y0 + L * 0.14;
  shellY(a, cx, zc, [[y0, Rf * 1.02], [y0 + L * 0.06, Rf * 1.0], [ci, Rf * 1.0]], 28, Rf * 0.03);
  ring3(a, [cx, y0 + 4, zc], [0, 1, 0], Rf * (cowl ? 1.12 : 1.04), Rf * (cowl ? 0.08 : 0.04), 28);
  a.tube([[cx, ci, zc], [cx, ci + L * 0.34, zc], [cx, ci + L * 0.62, zc], [cx, y1 - L * 0.08, zc]], [Ro, Ro * (cowl ? 0.96 : 0.9), Ro * (cowl ? 0.82 : 0.72), Rf * 0.52], 30);
  a.tube([[cx, ci, zc], [cx, y1 + L * 0.12, zc]], [Rf * 0.12, Rf * 0.16], 10);
  a.tube([[cx, y1 - L * 0.1, zc], [cx, y1 + L * 0.12, zc]], [Rf * 0.46, Rf * 0.1], 16); ring3(a, [cx, y1 - L * 0.09, zc], [0, 1, 0], Rf * 0.5, Rf * 0.03, 20);
  a.tube([[cx, ci - 4, zc], [cx, y0 + L * 0.075, zc]], [Rf * 0.34, Rf * 0.03], 14);
  for (let k = 0; k < 18; k++) { const g = (k / 18) * PI * 2, d = [m.cos(g), 0, m.sin(g)], tg = [-m.sin(g), 0, m.cos(g)], P = (r, y, tt) => [cx + d[0] * r + tg[0] * tt, y, zc + d[2] * r + tg[2] * tt];
    plateN(a, [P(Rf * 0.3, ci - L * 0.02, 0), P(Rf * 0.98, ci - L * 0.06, Rf * 0.12), P(Rf * 0.98, ci - L * 0.11, Rf * 0.2), P(Rf * 0.3, ci - L * 0.07, Rf * 0.03)], Rf * 0.012 + 3); }
  for (const sg of [-1, 1]) a.tube([[cx, ci + L * 0.1, zc], [cx + sg * Rf * 0.4, ci + L * 0.1, zc + sg * 0 - Rf * 0.4], [cx + sg * Rf * 0.4, ci + L * 0.3, zc - Rf * 0.4]], [Rf * 0.012, Rf * 0.012, Rf * 0.012], 4);
  if (!cowl) { a.box(cx + Ro * 0.85, ci + L * 0.1, zc - Rf * 0.2, cx + Ro * 1.15, ci + L * 0.38, zc + Rf * 0.2); a.tube([[cx + Ro * 1.15, ci + L * 0.2, zc], [cx + Ro * 0.85, ci + L * 0.55, zc + Rf * 0.25]], [Rf * 0.025, Rf * 0.025], 5); }
}
const FAMS = [
  // ===================================================== launch =====================================================
  fam({ cat: 'aerospace/launch', title: 'Generic sounding rocket on a launch rail',
    desc: (v) => `Unguided sounding rocket, ${v.dia} in across and ${v.len} ft long, leaning 12 degrees on a twin-tube launch rail with guide buttons, tie rods and an A-frame base: ogive nose, body tube with stage joint ring, four swept fins and a small nozzle.`,
    vs: [['4 in rocket, 10 ft', 4, 10], ['6 in rocket, 16 ft', 6, 16], ['8 in rocket, 22 ft', 8, 22], ['12 in rocket, 30 ft', 12, 30], ['16 in rocket, 38 ft', 16, 38]].map(([l, dia, len]) => {
      const L = len * 12 + 18; return [l, 70 + dia * 4, L * m.sin(0.2094) + 30, L * m.cos(0.2094) + 28, 0, { dia, len, L }]; }),
    build: (a, v) => {
      const th = 0.2094, s = m.sin(th), c = m.cos(th), u = [0, -s, c], w = [0, c, s], r = (v.dia / 2) * IN, Lr = v.L * IN, rl = v.len * 12 * IN;
      const B = [a.cx, -r - 380, a.Z0 + 520], P = (t) => add3(B, u, t), xr = r * 2 + 90;
      // rail: twin tubes, ties and buttons
      for (const sx of [-1, 1]) a.tube([add3(P(-60), [1, 0, 0], sx * xr), add3(P(Lr), [1, 0, 0], sx * xr)], [24, 24], 6);
      for (let t = 0; t <= Lr; t += Math.max(500, Lr / 7)) a.tube([add3(add3(P(t), w, r + 60), [1, 0, 0], -xr), add3(add3(P(t), w, r + 60), [1, 0, 0], xr)], [10, 10], 4);
      // rocket
      const tt = [0.02, 0.1, 0.45, 0.8, 0.84].map((f) => rl * f);
      a.tube([P(60), P(rl * 0.05), P(rl * 0.8)], [r * 0.5, r, r], 18);
      a.tube([P(rl * 0.8), P(rl * 0.88), P(rl * 0.95), P(rl)], [r, r * 0.8, r * 0.45, r * 0.06], 18);
      a.tube([P(60), P(-40)], [r * 0.55, r * 0.3], 10);
      ring3(a, P(rl * 0.45), u, r * 1.01, r * 0.04, 18); ring3(a, P(rl * 0.8), u, r * 1.01, r * 0.04, 18);
      for (const d of [[0.707, 0.707], [-0.707, 0.707], [0.707, -0.707], [-0.707, -0.707]]) {
        const dir = unit([d[0], d[1] * w[1], d[1] * w[2]]), n = unit(cross(u, dir)), sp = r * 1.35;
        plate3(a, [add3(P(rl * 0.03), dir, r * 0.97), add3(P(rl * 0.2), dir, r * 0.97), add3(P(rl * 0.15), dir, r + sp), add3(P(rl * 0.03), dir, r + sp * 0.9)], n, r * 0.06 + 6);
      }
      for (const t of [rl * 0.12, rl * 0.5, rl * 0.78]) for (const sx of [-1, 1]) a.box(...[0, 1, 2].map((k) => [sx > 0 ? P(t)[0] + r : P(t)[0] - xr + 12, P(t)[1] - 30, P(t)[2] - 30][k]), ...[0, 1, 2].map((k) => [sx > 0 ? P(t)[0] + xr - 12 : P(t)[0] - r, P(t)[1] + 30, P(t)[2] + 30][k]));
      // base
      const bw = a.W * 0.38; a.box(a.cx - bw, a.YF + 120, a.Z0, a.cx + bw, a.YB - 60, a.Z0 + 110);
      for (const sx of [-1, 1]) { a.tube([[a.cx + sx * bw * 0.85, a.YF + 260, a.Z0 + 110], [a.cx + sx * xr, P(Lr * 0.6)[1], P(Lr * 0.6)[2]]], [30, 30], 6); a.tube([[a.cx + sx * bw * 0.85, a.YB - 200, a.Z0 + 110], [a.cx + sx * xr, P(Lr * 0.25)[1], P(Lr * 0.25)[2]]], [30, 30], 6); a.cyl(a.cx + sx * xr, B[1], a.Z0 + 110, B[2], 36, 8); }
      a.rect(a.cx - bw, a.YF + 120, a.cx + bw, a.YB - 60, 'EQUIP'); for (const sx of [-1, 1]) a.line(a.cx + sx * xr, B[1], a.cx + sx * xr, P(Lr)[1], 'EQUIP-DETAIL'); a.circ(a.cx, B[1], r, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the twin-tube rail with ties and buttons, the leaning rocket with ogive nose, stage ring and four fins, and the A-frame base (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/launch', title: 'Generic launch pad lightning mast tower',
    desc: (v) => `Guyed lattice lightning mast, ${v.ht} ft to the air terminal: a four-leg tapered tower with ties and cross braces, a top rod with a crossbar and ball terminal, four guy wires to concrete anchor blocks and a footing slab.`,
    vs: [['80 ft', 80], ['120 ft', 120], ['160 ft', 160], ['200 ft', 200]].map(([l, ht]) => [l, ht * 12 * 0.9 + 60, ht * 12 * 0.9 + 60, ht * 12 + 40, 0, { ht }]),
    build: (a, v) => {
      const H = a.H, h0 = H * 0.035, h1 = H * 0.008, zt = a.Z0 + H * 0.9, ra = a.W / 2 - 400, cx = a.cx, cy = a.cy;
      a.box(cx - h0 * 1.6, cy - h0 * 1.6, a.Z0, cx + h0 * 1.6, cy + h0 * 1.6, a.Z0 + 260);
      lattice(a, cx, cy, a.Z0 + 260, zt, h0, h1, Math.round(v.ht / 12) + 2, H * 0.0014 + 6);
      a.cyl(cx, cy, zt, a.Z1 - 120, 26, 8); a.ell(cx, cy, a.Z1 - 90, 90, 90, 90, 10, 6); a.box(cx - 520, cy - 12, zt + (a.Z1 - zt) * 0.4, cx + 520, cy + 12, zt + (a.Z1 - zt) * 0.4 + 24); a.box(cx - 12, cy - 520, zt + (a.Z1 - zt) * 0.4 + 26, cx + 12, cy + 520, zt + (a.Z1 - zt) * 0.4 + 50);
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const k = ra * 0.707 * 2 / 2; const ax = cx + sx * k, ay = cy + sy * k;
        a.box(ax - 300, ay - 300, a.Z0, ax + 300, ay + 300, a.Z0 + 380); a.tube([[ax, ay, a.Z0 + 380], [cx + sx * h1 * 1.4, cy + sy * h1 * 1.4, a.Z0 + H * 0.84]], [9, 9], 4); a.tube([[ax, ay, a.Z0 + 380], [cx + sx * h1 * 2, cy + sy * h1 * 2, a.Z0 + H * 0.56]], [8, 8], 4); a.rect(ax - 300, ay - 300, ax + 300, ay + 300, 'EQUIP'); a.line(ax, ay, cx, cy, 'EQUIP-DETAIL'); }
      a.rect(cx - h0 * 1.6, cy - h0 * 1.6, cx + h0 * 1.6, cy + h0 * 1.6, 'EQUIP'); a.rect(cx - h0, cy - h0, cx + h0, cy + h0, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the footing slab, tapered lattice mast with cross braces, top rod with crossbar and ball terminal and four guy wires to anchor blocks (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/launch', title: 'Generic launch pad water deluge tower',
    desc: (v) => `Elevated water tank for pad deluge, a ${v.dia} ft tank with dished ends on six braced legs ${v.leg} ft up: ring girder, two tiers of cross bracing, a caged ladder, a down pipe with an elbow and flanged discharge, and a valve enclosure at the foot.`,
    vs: [['12 ft tank, 60 ft legs', 12, 60], ['16 ft tank, 75 ft legs', 16, 75], ['20 ft tank, 90 ft legs', 20, 90], ['26 ft tank, 110 ft legs', 26, 110]].map(([l, dia, leg]) => [l, dia * 12 + 110, dia * 12 + 110, (leg + dia * 1.25 + 4) * 12, 0, { dia, leg }]),
    build: (a, v) => {
      const R = v.dia * 152.4, RL = R * 0.88, zt0 = a.Z0 + v.leg * 12 * IN, hs = v.dia * 0.85 * 12 * IN, cx = a.cx, cy = a.cy, tl = (z, k) => [cx + m.cos((k / 6) * PI * 2) * RL, cy + m.sin((k / 6) * PI * 2) * RL, z];
      for (let k = 0; k < 6; k++) { a.box(tl(a.Z0, k)[0] - 360, tl(a.Z0, k)[1] - 360, a.Z0, tl(a.Z0, k)[0] + 360, tl(a.Z0, k)[1] + 360, a.Z0 + 240); a.tube([tl(a.Z0 + 240, k), tl(zt0, k)], [R * 0.035, R * 0.035], 8);
        for (const [f0, f1] of [[0.02, 0.5], [0.5, 0.98]]) { const k2 = (k + 1) % 6; a.tube([tl(a.Z0 + 240 + (zt0 - a.Z0 - 240) * f0, k), tl(a.Z0 + 240 + (zt0 - a.Z0 - 240) * f1, k2)], [R * 0.013, R * 0.013], 4); a.tube([tl(a.Z0 + 240 + (zt0 - a.Z0 - 240) * f0, k2), tl(a.Z0 + 240 + (zt0 - a.Z0 - 240) * f1, k)], [R * 0.013, R * 0.013], 4); } }
      for (const f of [0.5, 1]) { const z = a.Z0 + 240 + (zt0 - a.Z0 - 240) * f; a.tube(Array.from({ length: 7 }, (_, k) => tl(z, k)), Array(7).fill(R * 0.02), 5); }
      a.cyl(cx, cy, zt0, zt0 + hs, R, 32); a.ell(cx, cy, zt0, R, R, R * 0.32, 26, 6); a.ell(cx, cy, zt0 + hs, R, R, R * 0.32, 26, 6); band(a, cx, cy, zt0 + hs * 0.5, R * 1.02, 60, 32);
      a.cone(cx, cy, zt0 + hs + R * 0.28, zt0 + hs + R * 0.45, R * 0.12, R * 0.04, 10); a.cyl(cx, cy + R * 0.4, zt0 + hs + R * 0.3, zt0 + hs + R * 0.42, R * 0.12, 10);
      const lx = cx - RL * 0.5 - R * 0.55, ly = cy - R * 1.02; for (const o of [-170, 170]) a.tube([[lx + o, ly, a.Z0], [lx + o, ly, zt0 + hs]], [14, 14], 5);
      for (let z = a.Z0 + 320; z < zt0 + hs; z += 330) a.tube([[lx - 170, ly, z], [lx + 170, ly, z]], [8, 8], 4);
      for (let z = a.Z0 + 2200; z < zt0 + hs - 600; z += 1500) ring3(a, [lx, ly, z], [0, 0, 1], 340, 7, 12);
      a.cyl(cx, cy, a.Z0 + 600, zt0 - R * 0.28, R * 0.075, 12); a.cyl(cx, cy, a.Z0 + 450, a.Z0 + 600, R * 0.12, 12); a.xcyl(cx, cx + R * 1.25, cy, a.Z0 + 520, R * 0.075, 12); a.xcyl(cx + R * 1.25, cx + R * 1.25 + 80, cy, a.Z0 + 520, R * 0.12, 12);
      a.box(cx + R * 0.2, cy + R * 0.2, a.Z0, cx + R * 0.9, cy + R * 0.85, a.Z0 + 1900); a.box(cx + R * 0.15, cy + R * 0.15, a.Z0 + 1900, cx + R * 0.95, cy + R * 0.9, a.Z0 + 2000);
      a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, RL, 'EQUIP-DETAIL'); for (let k = 0; k < 6; k++) a.rect(tl(0, k)[0] - 360, tl(0, k)[1] - 360, tl(0, k)[0] + 360, tl(0, k)[1] + 360, 'EQUIP-DETAIL'); a.rect(cx + R * 0.2, cy + R * 0.2, cx + R * 0.9, cy + R * 0.85, 'EQUIP'); a.line(cx, cy, cx + R * 1.25, cy, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added six footed legs with two tiers of cross bracing and a ring girder, the dished-end tank with weld band and roof vent, caged ladder, down pipe with flanged discharge and the valve enclosure (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/launch', title: 'Generic rail-mounted mobile service tower',
    desc: (v) => `Mobile gantry ${v.ht} ft tall on rails: a four-column braced tower, open-front C-shaped working platforms with guard rails, a top hoist beam and a bogie carriage with eight wheels running on twin rails.`,
    vs: [['60 ft tall', 60], ['90 ft tall', 90], ['120 ft tall', 120], ['150 ft tall', 150]].map(([l, ht]) => { const tw = ht * 0.12 + 12; return [l, (tw + 12) * 12, (tw + 26) * 12, (ht + 6) * 12, 0, { ht, tw }]; }),
    build: (a, v) => {
      const tw = v.tw * 12 * IN, hw = tw / 2, cx = a.cx, cy = a.YB - hw - 900, z0 = a.Z0 + 760, z1 = a.Z1 - 380, n = Math.round(v.ht / 14);
      // carriage on two rails (rails run in y)
      const rx = hw * 1.15; for (const sx of [-1, 1]) { a.box(cx + sx * rx - 70, a.YF + 100, a.Z0, cx + sx * rx + 70, a.YB - 100, a.Z0 + 110); a.box(cx + sx * rx - 120, a.YF + 100, a.Z0 + 110, cx + sx * rx + 120, a.YB - 100, a.Z0 + 330);
        for (let k = 0; k < 4; k++) { const yy = cy - hw + (k / 3) * 2 * hw; whl(a, cx + sx * rx, yy, 330, 180, a.Z0 + 440); } a.box(cx + sx * rx - 160, cy - hw - 100, a.Z0 + 440, cx + sx * rx + 160, cy + hw + 100, z0); }
      a.box(cx - rx - 160, cy - hw - 100, z0 - 60, cx + rx + 160, cy + hw + 100, z0); a.box(cx - rx - 160, cy - 100, z0 - 280, cx + rx + 160, cy + 100, z0 - 60);
      lattice(a, cx, cy, z0, z1, hw, hw * 0.95, n, 24);
      for (let k = 1; k <= Math.min(5, Math.round(v.ht / 22)); k++) { const z = z0 + ((z1 - z0) * k) / (Math.min(5, Math.round(v.ht / 22)) + 1), gx = hw * 0.4, py = cy - hw, depth = 3200;
        a.box(cx - hw - 700, py - depth, z - 60, cx - gx, cy + hw, z); a.box(cx + gx, py - depth, z - 60, cx + hw + 700, cy + hw, z); a.box(cx - hw, py - depth, z - 60, cx + hw, py - depth + 700, z);
        a.tube([[cx - gx, py - depth, z + 1050], [cx - gx, py, z + 1050], [cx - hw - 700, py, z + 1050], [cx - hw - 700, py - depth, z + 1050], [cx - gx, py - depth, z + 1050]], Array(5).fill(14), 4);
        a.tube([[cx + gx, py - depth, z + 1050], [cx + gx, py, z + 1050], [cx + hw + 700, py, z + 1050], [cx + hw + 700, py - depth, z + 1050], [cx + gx, py - depth, z + 1050]], Array(5).fill(14), 4); }
      a.box(cx - hw - 200, cy - 140, z1, cx + hw + 200, cy + 140, z1 + 240); a.box(cx - 90, cy - 90, z1 + 240, cx + 90, cy + 90, z1 + 340);
      a.rect(cx - rx - 160, a.YF + 100, cx + rx + 160, a.YB - 100, 'EQUIP-HIDDEN'); a.rect(cx - hw, cy - hw, cx + hw, cy + hw, 'EQUIP'); for (const sx of [-1, 1]) { a.line(cx + sx * rx, a.YF + 100, cx + sx * rx, a.YB - 100, 'EQUIP-DETAIL'); a.rect(cx + sx * rx - 120, a.YF + 100, cx + sx * rx + 120, a.YB - 100, 'EQUIP'); }
      a.rect(cx - hw - 700, cy - hw - 3200, cx + hw + 700, cy - hw, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the twin rails and eight-wheel carriage, braced four-column tower, open-front working platforms with guard rails and the top hoist beam (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/launch', title: 'Generic launch table with hold-down posts and exhaust opening',
    desc: (v) => `Square launch table ${v.s} ft across on four braced pedestals: a ring deck round a central exhaust opening, an angled deflector wedge beneath, four hold-down posts with clamp arms and a deluge ring pipe with nozzles round the opening.`,
    vs: [['12 ft table', 12], ['18 ft table', 18], ['26 ft table', 26], ['36 ft table', 36]].map(([l, s]) => [l, s * 12 * 1.1, s * 12 * 1.1, s * 12 * 0.6 + 30, 0, { s }]),
    build: (a, v) => {
      const S = v.s * 12 * IN, hs = S / 2, o = S * 0.19, cx = a.cx, cy = a.cy, zd = a.Z0 + a.H * 0.62, td = S * 0.07;
      a.box(cx - hs, cy - hs, zd, cx + hs, cy - o, zd + td); a.box(cx - hs, cy + o, zd, cx + hs, cy + hs, zd + td); a.box(cx - hs, cy - o, zd, cx - o, cy + o, zd + td); a.box(cx + o, cy - o, zd, cx + hs, cy + o, zd + td);
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const px = cx + sx * hs * 0.82, py = cy + sy * hs * 0.82; a.box(px - S * 0.06, py - S * 0.06, a.Z0, px + S * 0.06, py + S * 0.06, a.Z0 + S * 0.03); a.cyl(px, py, a.Z0 + S * 0.03, zd, S * 0.034, 12);
        a.cyl(cx + sx * o * 1.15, cy + sy * o * 1.15, zd + td, zd + td + S * 0.17, S * 0.018, 8); a.tube([[cx + sx * o * 1.15, cy + sy * o * 1.15, zd + td + S * 0.17], [cx + sx * o * 0.85, cy + sy * o * 0.85, zd + td + S * 0.2]], [S * 0.012, S * 0.02], 6); a.box(cx + sx * o * 1.15 - S * 0.04, cy + sy * o * 1.15 - S * 0.04, zd + td, cx + sx * o * 1.15 + S * 0.04, cy + sy * o * 1.15 + S * 0.04, zd + td + S * 0.02); }
      braceXZ(a, cx - hs * 0.82, cx + hs * 0.82, cy - hs * 0.82, a.Z0 + S * 0.05, zd, S * 0.01); braceXZ(a, cx - hs * 0.82, cx + hs * 0.82, cy + hs * 0.82, a.Z0 + S * 0.05, zd, S * 0.01); braceYZ(a, cx - hs * 0.82, cy - hs * 0.82, cy + hs * 0.82, a.Z0 + S * 0.05, zd, S * 0.01); braceYZ(a, cx + hs * 0.82, cy - hs * 0.82, cy + hs * 0.82, a.Z0 + S * 0.05, zd, S * 0.01);
      prismX(a, [[cy - o * 1.2, zd - S * 0.02], [cy + o * 1.2, zd - S * 0.02], [cy, zd - S * 0.2]], cx - o * 1.1, cx + o * 1.1);
      const zr = zd + td + S * 0.045, q = o * 1.25; a.tube([[cx - q, cy - q, zr], [cx + q, cy - q, zr], [cx + q, cy + q, zr], [cx - q, cy + q, zr], [cx - q, cy - q, zr]], Array(5).fill(S * 0.009), 5);
      for (let k = 0; k < 8; k++) { const t = (k + 0.5) / 8 * 2 - 1; for (const [x, y] of [[cx + t * q, cy - q], [cx + t * q, cy + q]]) a.cyl(x, y, zr, zr + S * 0.025, S * 0.008, 6); }
      a.rect(cx - hs, cy - hs, cx + hs, cy + hs, 'EQUIP'); a.rect(cx - o, cy - o, cx + o, cy + o, 'EQUIP'); a.rect(cx - q, cy - q, cx + q, cy + q, 'EQUIP-DETAIL'); for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { a.circ(cx + sx * o * 1.15, cy + sy * o * 1.15, S * 0.018, 'EQUIP-DETAIL'); a.rect(cx + sx * hs * 0.82 - S * 0.06, cy + sy * hs * 0.82 - S * 0.06, cx + sx * hs * 0.82 + S * 0.06, cy + sy * hs * 0.82 + S * 0.06, 'EQUIP-DETAIL'); }
      a.log('Added the ring deck round the exhaust opening, four braced pedestals, the deflector wedge, four hold-down posts with clamp arms and the deluge ring with nozzles (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/launch', title: 'Generic cryogenic propellant sphere on legs',
    desc: (v) => `Spherical propellant storage tank, ${v.dia} ft across, on ${v.legs} braced legs with an equator ring: a top vent stack and manway, a bottom fill line to a flanged valve stand, a caged ladder and an insulation seam band.`,
    vs: [['8 ft sphere', 8, 6], ['12 ft sphere', 12, 6], ['16 ft sphere', 16, 8], ['22 ft sphere', 22, 8], ['30 ft sphere', 30, 10]].map(([l, dia, legs]) => [l, dia * 12 + 44, dia * 12 + 44, dia * 18.8, 0, { dia, legs }]),
    build: (a, v) => {
      const R = v.dia * 152.4, cx = a.cx, cy = a.cy, zc = a.Z0 + R * 1.6, rl = R * 0.97, lp = (k, z) => [cx + m.cos((k / v.legs) * PI * 2) * rl, cy + m.sin((k / v.legs) * PI * 2) * rl, z];
      a.ell(cx, cy, zc, R, R, R, 28, 16); a.tube(Array.from({ length: 29 }, (_, i) => [cx + m.cos((i / 28) * PI * 2) * R * 1.02, cy + m.sin((i / 28) * PI * 2) * R * 1.02, zc]), Array(29).fill(R * 0.02), 5);
      a.tube(Array.from({ length: 25 }, (_, i) => [cx + m.cos((i / 24) * PI * 2) * R * 0.8, cy + m.sin((i / 24) * PI * 2) * R * 0.8, zc + R * 0.6]), Array(25).fill(R * 0.012), 4);
      for (let k = 0; k < v.legs; k++) { const p = lp(k, a.Z0 + 200); a.box(p[0] - R * 0.08, p[1] - R * 0.08, a.Z0, p[0] + R * 0.08, p[1] + R * 0.08, a.Z0 + 200); a.tube([p, lp(k, zc)], [R * 0.04, R * 0.04], 8);
        const k2 = (k + 1) % v.legs; for (const f of [0.35, 0.7]) { a.tube([lp(k, a.Z0 + 200 + (zc - a.Z0 - 200) * (f - 0.2)), lp(k2, a.Z0 + 200 + (zc - a.Z0 - 200) * f)], [R * 0.012, R * 0.012], 4); a.tube([lp(k2, a.Z0 + 200 + (zc - a.Z0 - 200) * (f - 0.2)), lp(k, a.Z0 + 200 + (zc - a.Z0 - 200) * f)], [R * 0.012, R * 0.012], 4); } }
      a.cyl(cx, cy, zc + R * 0.95, a.Z1 - 80, R * 0.05, 12); a.cyl(cx, cy, a.Z1 - 80, a.Z1, R * 0.08, 12); a.cyl(cx + R * 0.3, cy, zc + R * 0.9, zc + R * 1.08, R * 0.16, 14); a.cyl(cx + R * 0.3, cy, zc + R * 1.08, zc + R * 1.13, R * 0.18, 14);
      a.cyl(cx, cy, a.Z0 + R * 0.5, zc - R * 0.98, R * 0.05, 10); a.tube([[cx, cy, a.Z0 + R * 0.5], [cx, cy, a.Z0 + R * 0.35], [cx + R * 0.3, cy, a.Z0 + R * 0.3], [cx + R * 0.9, cy, a.Z0 + R * 0.3]], Array(4).fill(R * 0.05), 8); a.xcyl(cx + R * 0.9, cx + R * 0.9 + 70, cy, a.Z0 + R * 0.3, R * 0.09, 12); a.box(cx + R * 0.95, cy - 300, a.Z0, cx + R * 0.95 + 700, cy + 300, a.Z0 + 500);
      const lx = cx - R * 1.02, ly = cy - R * 0.4; for (const o of [-150, 150]) a.tube([[lx, ly + o, a.Z0], [cx - R * 0.5, ly + o, zc + R * 0.95]], [12, 12], 5); for (let t = 0.05; t < 0.97; t += 0.075) { const x = lx + (cx - R * 0.5 - lx) * t, z = a.Z0 + (zc + R * 0.95 - a.Z0) * t; a.tube([[x, ly - 150, z], [x, ly + 150, z]], [7, 7], 4); }
      a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, rl, 'EQUIP-DETAIL'); for (let k = 0; k < v.legs; k++) a.circ(lp(k, 0)[0], lp(k, 0)[1], R * 0.08, 'EQUIP-DETAIL'); a.circ(cx + R * 0.3, cy, R * 0.16, 'EQUIP-DETAIL'); a.line(cx, cy, cx + R * 0.9, cy, 'EQUIP-DETAIL'); a.rect(cx + R * 0.95, cy - 300, cx + R * 0.95 + 700, cy + 300, 'EQUIP'); a.outline('EQUIP-HIDDEN');
      a.log('Added the sphere with equator ring and seam band, braced legs on footings, vent stack and manway, bottom fill line to the valve stand and the caged ladder (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/launch', title: 'Generic launch vehicle on a tilting erector',
    desc: (v) => `Launch vehicle, ${v.dia} in across and ${v.len} ft long, raised 60 degrees on a transporter-erector: twin-beam cradle with cross ties, tail hinge pedestals, a lift cylinder and a skid base. Plain tube with ogive nose, stage rings and a bell.`,
    vs: [['24 in vehicle, 20 ft', 24, 20], ['48 in vehicle, 38 ft', 48, 38], ['78 in vehicle, 70 ft', 78, 70], ['120 in vehicle, 100 ft', 120, 100]].map(([l, dia, len]) => [l, dia * 1.5 + 90, len * 12 * 0.5 + dia + 34, len * 12 * 0.866 + dia * 0.5 + 62, 0, { dia, len }]),
    build: (a, v) => {
      const r = (v.dia / 2) * IN, rl = v.len * 12 * IN, L = rl * 1.04, s = 0.5, c = 0.866, u = [0, -s, c], w = [0, c, s], yb = -(r + 300), B = [a.cx, yb, a.Z0 + 700], P = (t) => add3(B, u, t), xr = r + 130;
      a.tube([P(-200), P(rl * 0.03), P(rl * 0.8)], [r * 0.55, r, r], 22); a.tube([P(rl * 0.8), P(rl * 0.88), P(rl * 0.95), P(rl)], [r, r * 0.8, r * 0.45, r * 0.06], 22);
      a.tube([P(-380), P(-200)], [r * 0.45, r * 0.3], 12); ring3(a, P(rl * 0.45), u, r * 1.01, r * 0.03, 22); ring3(a, P(rl * 0.8), u, r * 1.01, r * 0.03, 22); ring3(a, P(rl * 0.1), u, r * 1.01, r * 0.03, 22);
      for (const sx of [-1, 1]) a.tube([add3(add3(P(-300), w, -(r + 90)), [1, 0, 0], sx * xr), add3(add3(P(L), w, -(r + 90)), [1, 0, 0], sx * xr)], [r * 0.09 + 20, r * 0.09 + 20], 8);
      for (let t = 0; t <= L; t += L / 6) a.tube([add3(add3(P(t - 300 + 300 * (t / L)), w, -(r + 90)), [1, 0, 0], -xr), add3(add3(P(t - 300 + 300 * (t / L)), w, -(r + 90)), [1, 0, 0], xr)], [30, 30], 5);
      for (const t of [rl * 0.2, rl * 0.55, rl * 0.85]) for (const sx of [-1, 1]) { const q0 = add3(add3(P(t), w, -(r + 90)), [1, 0, 0], sx * xr), q1 = add3(add3(P(t), w, -r * 0.5), [1, 0, 0], sx * r * 0.88); a.tube([q0, q1], [r * 0.07, r * 0.07], 6); }
      // hinge pedestal and skid base
      const bx = a.W * 0.4; a.box(a.cx - bx, a.YF + 100, a.Z0, a.cx + bx, a.YB - 80, a.Z0 + 180);
      for (const sx of [-1, 1]) { a.box(a.cx + sx * xr - 100, yb - 160, a.Z0 + 180, a.cx + sx * xr + 100, yb + 260, B[2] - 100); a.cyl(a.cx + sx * xr, yb, B[2] - 120, B[2] - 60, 160, 10); a.xcyl(a.cx + sx * xr - 160, a.cx + sx * xr + 160, yb, B[2] - 90, 70, 10); }
      const q0 = [a.cx, yb - rl * 0.62 * s - 600, a.Z0 + 180], q1 = add3(add3(P(rl * 0.5), w, -(r + 90)), [1, 0, 0], 0), mid = [q0[0] + (q1[0] - q0[0]) * 0.55, q0[1] + (q1[1] - q0[1]) * 0.55, q0[2] + (q1[2] - q0[2]) * 0.55];
      a.box(a.cx - 300, q0[1] - 260, a.Z0 + 180, a.cx + 300, q0[1] + 260, a.Z0 + 420); a.tube([q0, mid], [r * 0.12 + 40, r * 0.12 + 40], 10); a.tube([mid, q1], [r * 0.07 + 24, r * 0.07 + 24], 8); a.tube([[q1[0] - xr, q1[1], q1[2]], [q1[0] + xr, q1[1], q1[2]]], [26, 26], 6);
      a.rect(a.cx - bx, a.YF + 100, a.cx + bx, a.YB - 80, 'EQUIP'); for (const sx of [-1, 1]) { a.line(a.cx + sx * xr, yb, a.cx + sx * xr, P(L)[1], 'EQUIP-DETAIL'); a.rect(a.cx + sx * xr - 100, yb - 160, a.cx + sx * xr + 100, yb + 260, 'EQUIP-DETAIL'); } a.line(a.cx, yb, a.cx, P(rl)[1], 'EQUIP-DETAIL'); a.circ(a.cx, yb, r, 'EQUIP-DETAIL'); a.rect(a.cx - 300, q0[1] - 260, a.cx + 300, q0[1] + 260, 'EQUIP');
      a.log('Added the vehicle tube with nose, stage rings and bell, the twin-beam cradle with cross ties and saddles, the hinge pedestals, lift cylinder with rod and the skid base (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/launch', title: 'Generic rocket motor segment on a transport cradle',
    desc: (v) => `Solid-propellant style motor segment, ${v.dia} in across and ${v.len} ft long, lying in three saddles on a skid cradle: a cylindrical case with three joint rings, a forward dome with an igniter boss, an aft dome with a capped nozzle stub, two lifting lugs and tie-down straps over the saddles.`,
    vs: [['36 in motor, 12 ft', 36, 12], ['60 in motor, 20 ft', 60, 20], ['96 in motor, 28 ft', 96, 28], ['120 in motor, 34 ft', 120, 34]].map(([l, dia, len]) => [l, len * 12 + 30, dia + 50, dia + 56, 0, { dia, len }]),
    build: (a, v) => {
      const R = (v.dia / 2) * IN, cy = a.cy, x0 = a.X0 + 400, x1 = a.X1 - 400, zc = a.Z0 + R * 1.0 + 300 + 80, cl = x1 - x0, ex = R * 0.42;
      a.xcyl(x0 + ex * 0.6, x1 - ex * 0.6, cy, zc, R, 30); a.ell(x0 + ex * 0.6, cy, zc, ex, R, R, 18, 8); a.ell(x1 - ex * 0.6, cy, zc, ex, R, R, 18, 8);
      a.xcyl(x0 - 60, x0 + ex * 0.2, cy, zc, R * 0.16, 12); a.xcyl(x0 - 140, x0 - 60, cy, zc, R * 0.22, 12); a.xcyl(x1 - ex * 0.2, x1 + 20, cy, zc, R * 0.32, 14); a.xcyl(x1 + 20, x1 + 70, cy, zc, R * 0.4, 14);
      for (const f of [0.28, 0.5, 0.72]) a.xcyl(x0 + cl * f - R * 0.045, x0 + cl * f + R * 0.045, cy, zc, R * 1.03, 30);
      for (const f of [0.33, 0.67]) { const x = x0 + cl * f; a.box(x - R * 0.06, cy - R * 0.06, zc + R * 0.98, x + R * 0.06, cy + R * 0.06, zc + R * 1.2); a.xcyl(x - R * 0.06, x + R * 0.06, cy, zc + R * 1.12, R * 0.045, 8); }
      for (const f of [0.14, 0.5, 0.86]) { const x = x0 + cl * f, sw = R * 0.18; a.box(x - R * 0.2, cy - R * 1.08, a.Z0 + 300, x + R * 0.2, cy + R * 1.08, a.Z0 + 380);
        for (let k = 0; k < 14; k++) { const y0 = cy - R + (2 * R * k) / 14, y1 = cy - R + (2 * R * (k + 1)) / 14, ym = (y0 + y1) / 2 - cy, zb = zc - m.sqrt(m.max(R * R - ym * ym, 0)) - 4; a.box(x - R * 0.2, y0, a.Z0 + 380, x + R * 0.2, y1, m.max(zb, a.Z0 + 400)); }
        a.tube([[x - sw * 0.2, cy - R * 1.1, zc - R * 0.2], [x - sw * 0.2, cy - R * 0.4, zc + R * 0.95], [x - sw * 0.2, cy + R * 0.4, zc + R * 0.95], [x - sw * 0.2, cy + R * 1.1, zc - R * 0.2]], Array(4).fill(10), 5); }
      for (const sy of [-1, 1]) a.box(x0 - 200, cy + sy * R * 1.0 - 90, a.Z0, x1 + 250, cy + sy * R * 1.0 + 90, a.Z0 + 300);
      a.rect(x0 - 200, cy - R * 1.0 - 90, x1 + 250, cy + R * 1.0 + 90, 'EQUIP'); a.ellp((x0 + x1) / 2, cy, cl / 2 + 100, R, 'EQUIP-DETAIL'); for (const f of [0.14, 0.5, 0.86]) a.rect(x0 + cl * f - R * 0.2, cy - R * 1.08, x0 + cl * f + R * 0.2, cy + R * 1.08, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the segment case with joint rings, domed ends, igniter boss and capped nozzle stub, the lifting lugs, three saddles with straps and the skid rails (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/launch', title: 'Generic launch pad vent and flare stack',
    desc: (v) => `Guyed vent stack ${v.len} ft tall at a launch site: a stack pipe on a base flange, a flame tip with pilot ring, a caged ladder, three guy wires to anchor blocks and a horizontal knockout drum on two saddles with a feed pipe at the foot.`,
    vs: [['40 ft stack', 40], ['60 ft stack', 60], ['80 ft stack', 80], ['100 ft stack', 100]].map(([l, len]) => [l, len * 12 * 0.78 + 60, len * 12 * 0.78 + 60, len * 12 + 24, 0, { len }]),
    build: (a, v) => {
      const H = a.H, r = (6 + v.len * 0.07) * IN, cx = a.cx, cy = a.cy, ra = a.W / 2 - 300, zt = a.Z1 - 60;
      a.cyl(cx, cy, a.Z0, a.Z0 + 200, r * 1.9, 20); a.cyl(cx, cy, a.Z0 + 200, zt - r * 3, r, 18); a.cone(cx, cy, zt - r * 3, zt - r * 1.2, r, r * 1.3, 16); a.cyl(cx, cy, zt - r * 1.2, zt, r * 1.3, 18); ring3(a, [cx, cy, zt - r * 0.7], [0, 0, 1], r * 1.6, r * 0.12, 14);
      for (let k = 0; k < 4; k++) { const g = (k / 4) * PI * 2 + 0.4; a.tube([[cx + m.cos(g) * r * 1.6, cy + m.sin(g) * r * 1.6, zt - r * 1.2], [cx + m.cos(g) * r * 1.3, cy + m.sin(g) * r * 1.3, zt - r * 0.2]], [r * 0.06, r * 0.06], 4); }
      for (const f of [0.3, 0.6]) band(a, cx, cy, a.Z0 + (zt - a.Z0) * f, r * 1.1, 80, 18);
      for (let k = 0; k < 3; k++) { const g = (k / 3) * PI * 2 + 0.9, ax = cx + m.cos(g) * ra, ay = cy + m.sin(g) * ra; a.box(ax - 280, ay - 280, a.Z0, ax + 280, ay + 280, a.Z0 + 320); for (const f of [0.55, 0.9]) a.tube([[ax, ay, a.Z0 + 320], [cx + m.cos(g) * r, cy + m.sin(g) * r, a.Z0 + (zt - a.Z0) * f]], [8, 8], 4); a.rect(ax - 280, ay - 280, ax + 280, ay + 280, 'EQUIP'); a.line(ax, ay, cx, cy, 'EQUIP-DETAIL'); }
      const lx = cx + r * 1.1, ly = cy - r * 1.7; for (const o of [-150, 150]) a.tube([[lx + o, ly, a.Z0 + 200], [lx + o, ly, zt - r * 3]], [10, 10], 5); for (let z = a.Z0 + 500; z < zt - r * 3; z += 330) a.tube([[lx - 150, ly, z], [lx + 150, ly, z]], [6, 6], 4);
      const dr = H * 0.034, dx0 = cx + r * 3, dx1 = cx + r * 3 + H * 0.12; a.xcyl(dx0, dx1, cy, a.Z0 + 600 + dr, dr, 20); a.ell(dx0, cy, a.Z0 + 600 + dr, dr * 0.4, dr, dr, 10, 5); a.ell(dx1, cy, a.Z0 + 600 + dr, dr * 0.4, dr, dr, 10, 5);
      for (const x of [dx0 + (dx1 - dx0) * 0.2, dx0 + (dx1 - dx0) * 0.8]) a.box(x - 140, cy - dr * 0.9, a.Z0, x + 140, cy + dr * 0.9, a.Z0 + 600 + dr * 0.35);
      a.tube([[dx0, cy, a.Z0 + 600 + dr * 1.9], [cx + r, cy, a.Z0 + 600 + dr * 1.9], [cx + r, cy, a.Z0 + 1400]], [r * 0.3, r * 0.3, r * 0.3], 8);
      a.circ(cx, cy, r, 'EQUIP'); a.circ(cx, cy, r * 1.9, 'EQUIP-DETAIL'); a.ellp((dx0 + dx1) / 2, cy, (dx1 - dx0) / 2, dr, 'EQUIP'); a.line(dx0, cy, cx + r, cy, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the base flange, stack pipe with weld bands and flame tip with pilot ring, caged ladder, three guy wires to anchor blocks and the knockout drum on saddles (plan and 3D).');
    } }),

  // ===================================================== spacecraft =====================================================
  fam({ cat: 'aerospace/spacecraft', title: 'Generic lunar lander with four landing legs',
    desc: (v) => `Landing craft with a ${v.bw} in octagonal descent stage on four splayed legs with footpads: a descent engine bell, two tank spheres, a smaller ascent stage with a ladder, a dish on a mast and four thruster quads.`,
    vs: [['small, 72 in stage', 72], ['medium, 108 in stage', 108], ['large, 144 in stage', 144], ['crew, 200 in stage', 200]].map(([l, bw]) => [l, bw * 2.7, bw * 2.7, bw * 1.75, 0, { bw }]),
    build: (a, v) => {
      const B = v.bw * IN, Rb = B / 2, cx = a.cx, cy = a.cy, zb = a.Z0 + B * 0.56, oct = (r, ph = PI / 8) => Array.from({ length: 8 }, (_, i) => [cx + m.cos(ph + (i / 8) * PI * 2) * r, cy + m.sin(ph + (i / 8) * PI * 2) * r]);
      a.prism(oct(Rb), zb, zb + B * 0.5); a.prism(oct(Rb * 1.03), zb + B * 0.04, zb + B * 0.1); a.prism(oct(Rb * 1.03), zb + B * 0.4, zb + B * 0.46);
      bell(a, cx, cy, zb, B * 0.32, B * 0.05, B * 0.2, 16); a.cyl(cx, cy, zb - 2, zb + 30, B * 0.14, 14);
      for (const sx of [-1, 1]) { a.ell(cx + sx * (Rb + B * 0.13), cy, zb + B * 0.25, B * 0.14, B * 0.14, B * 0.14, 12, 8); a.tube([[cx + sx * Rb, cy, zb + B * 0.25], [cx + sx * (Rb + B * 0.1), cy, zb + B * 0.25]], [B * 0.03, B * 0.03], 6); }
      a.prism(oct(Rb * 0.6, 0), zb + B * 0.5, zb + B * 0.88); a.cyl(cx, cy, zb + B * 0.88, zb + B * 0.9, Rb * 0.5, 14); a.box(cx - Rb * 0.18, cy - Rb * 0.64, zb + B * 0.62, cx + Rb * 0.18, cy - Rb * 0.58, zb + B * 0.76);
      a.cyl(cx + Rb * 0.25, cy + Rb * 0.2, zb + B * 0.9, zb + B * 1.04, 12, 6); dish(a, [cx + Rb * 0.25, cy + Rb * 0.2, zb + B * 1.04], [0.4, 0, 0.92], B * 0.17, B * 0.05, B * 0.07, 14);
      for (let i = 0; i < 4; i++) { const g = PI / 4 + (i * PI) / 2, ux = m.cos(g), uy = m.sin(g), pr = Rb * 1.2 + B * 0.5, px = cx + ux * pr, py = cy + uy * pr;
        a.tube([[cx + ux * Rb * 0.98, cy + uy * Rb * 0.98, zb + B * 0.42], [px, py, a.Z0 + B * 0.07]], [B * 0.025, B * 0.025], 6); a.tube([[cx + ux * Rb * 0.98, cy + uy * Rb * 0.98, zb + B * 0.08], [cx + ux * (pr * 0.7 + Rb * 0.3), cy + uy * (pr * 0.7 + Rb * 0.3), a.Z0 + B * 0.3]], [B * 0.015, B * 0.015], 5);
        a.cone(px, py, a.Z0 + B * 0.035, a.Z0 + B * 0.07, B * 0.13, B * 0.12, 14); a.box(cx + ux * Rb * 1.06 - B * 0.04, cy + uy * Rb * 1.06 - B * 0.04, zb + B * 0.32, cx + ux * Rb * 1.06 + B * 0.04, cy + uy * Rb * 1.06 + B * 0.04, zb + B * 0.42); a.circ(px, py, B * 0.13, 'EQUIP-DETAIL'); a.line(cx, cy, px, py, 'EQUIP-DETAIL'); }
      const ly = cy - Rb * 0.64; for (const o of [-60, 60]) a.tube([[cx + o, ly - B * 0.08, a.Z0 + B * 0.2], [cx + o, ly, zb + B * 0.64]], [6, 6], 4);
      a.poly(oct(Rb), 'EQUIP'); a.poly(oct(Rb * 0.6, 0), 'EQUIP-DETAIL'); a.circ(cx, cy, B * 0.2, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the octagonal descent stage with engine bell and tank spheres, the ascent stage with ladder, mast dish, four splayed legs with footpads and thruster quads (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic space telescope with sun shade and solar wings',
    desc: (v) => `Space telescope, ${v.tube} in main tube, standing on its launch adapter: an octagonal equipment bay, an open tube with a baffle lip and a hinged aperture door, two star trackers, a dish on a boom and two two-panel solar wings on yokes.`,
    vs: [['36 in tube', 36], ['60 in tube', 60], ['96 in tube', 96], ['140 in tube', 140]].map(([l, tube]) => [l, tube * 6.2, tube * 1.75, tube * 4.4, 0, { tube }]),
    build: (a, v) => {
      const T = v.tube * IN, R = T / 2, cx = a.cx, cy = a.cy, zb0 = a.Z0 + T * 0.2, zb1 = zb0 + T * 0.62, zt = a.Z1 - T * 0.62, oct = (r) => Array.from({ length: 8 }, (_, i) => [cx + m.cos(PI / 8 + (i / 8) * PI * 2) * r, cy + m.sin(PI / 8 + (i / 8) * PI * 2) * r]);
      a.cone(cx, cy, a.Z0, zb0, R * 0.62, R * 0.62, 20); band(a, cx, cy, a.Z0 + 30, R * 0.66, 60, 20); a.cone(cx, cy, a.Z0 + T * 0.02, zb0, R * 0.62, R * 0.9, 20);
      a.prism(oct(R * 1.18), zb0, zb1); a.prism(oct(R * 1.22), zb1 - T * 0.03, zb1);
      a.cyl(cx, cy, zb1, zt, R, 30); band(a, cx, cy, (zb1 + zt) / 2, R * 1.03, 50, 30); a.cone(cx, cy, zt - T * 0.18, zt, R * 1.0, R * 1.1, 30); ring3(a, [cx, cy, zt], [0, 0, 1], R * 1.1, T * 0.012, 30);
      plate3(a, [[cx + R * 1.12, cy - R * 0.85, zt], [cx + R * 1.12, cy + R * 0.85, zt], [cx + R * 1.5, cy + R * 0.85, zt + R * 1.0], [cx + R * 1.5, cy - R * 0.85, zt + R * 1.0]], unit([0.93, 0, -0.36]), T * 0.03); // aperture door
      for (const sy of [-1, 1]) a.cyl(cx + R * 1.0, cy + sy * R * 0.5, zb1 - T * 0.02, zb1 + T * 0.14, T * 0.045, 8);
      for (const sx of [-1, 1]) { const x0 = cx + sx * R * 1.22, xe = cx + sx * (R * 1.22 + T * 0.3); a.tube([[x0, cy, zb0 + T * 0.3], [xe, cy, zb0 + T * 0.3]], [T * 0.018, T * 0.018], 6); a.box(Math.min(x0, x0 + sx * 30), cy - T * 0.05, zb0 + T * 0.22, Math.max(x0, x0 + sx * 30), cy + T * 0.05, zb0 + T * 0.38);
        for (let k = 0; k < 2; k++) { const px0 = cx + sx * (R * 1.22 + T * 0.3 + k * T * 1.04), px1 = px0 + sx * T * 1.0; panel(a, Math.min(px0, px1), Math.max(px0, px1), cy, zb0 + T * 0.05, zb0 + T * 0.55, 4, 6, T * 0.025); a.rect(Math.min(px0, px1), cy - T * 0.02, Math.max(px0, px1), cy + T * 0.02, 'EQUIP'); } }
      a.tube([[cx - R * 1.15, cy, zb1 - T * 0.1], [cx - R * 1.15, cy, zb1 + T * 0.35]], [T * 0.012, T * 0.012], 5); dish(a, [cx - R * 1.15, cy, zb1 + T * 0.35], [-0.5, 0, 0.87], T * 0.1, T * 0.03, T * 0.06, 12);
      a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 1.1, 'EQUIP-DETAIL'); a.poly(oct(R * 1.18), 'EQUIP'); a.outline('EQUIP-HIDDEN');
      a.log('Added the launch adapter, octagonal equipment bay, main tube with baffle lip and hinged aperture door, star trackers, boom dish and two solar wings of two panels (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic docking adapter with guide petals',
    desc: (v) => `Docking port module, ${v.hatch} in hatch: a bolted base flange, a short tunnel with a capture ring carrying twelve latches, three guide petals, a hinged hatch lid and a small handrail pair.`,
    vs: [['32 in hatch', 32], ['44 in hatch', 44], ['60 in hatch', 60], ['80 in hatch', 80]].map(([l, hatch]) => [l, hatch * 1.9, hatch * 1.9, hatch * 1.3, 0, { hatch }]),
    build: (a, v) => {
      const h = v.hatch * IN, cx = a.cx, cy = a.cy, Rf = h * 0.9, Rt = h * 0.62, z1 = a.Z0 + h * 0.18, z2 = a.Z0 + h * 0.78;
      a.cyl(cx, cy, a.Z0, z1, Rf, 32); for (let k = 0; k < 16; k++) { const g = (k / 16) * PI * 2; a.cyl(cx + m.cos(g) * Rf * 0.88, cy + m.sin(g) * Rf * 0.88, z1, z1 + h * 0.03, h * 0.035, 8); a.circ(cx + m.cos(g) * Rf * 0.88, cy + m.sin(g) * Rf * 0.88, h * 0.035, 'EQUIP-DETAIL'); }
      a.cone(cx, cy, z1, z1 + h * 0.2, Rf * 0.82, Rt, 28); a.cyl(cx, cy, z1 + h * 0.2, z2, Rt, 28); a.cyl(cx, cy, z2, z2 + h * 0.12, Rt * 1.12, 28);
      for (let k = 0; k < 12; k++) { const g = (k / 12) * PI * 2; a.box(cx + m.cos(g) * Rt * 1.12 - h * 0.03, cy + m.sin(g) * Rt * 1.12 - h * 0.03, z2 + h * 0.02, cx + m.cos(g) * Rt * 1.12 + h * 0.03, cy + m.sin(g) * Rt * 1.12 + h * 0.03, z2 + h * 0.15); }
      for (let k = 0; k < 3; k++) { const g = (k / 3) * PI * 2 + 0.5, d = [m.cos(g), m.sin(g), 0], n = [-m.sin(g), m.cos(g), 0], o = (r, z) => [cx + d[0] * r, cy + d[1] * r, z];
        plate3(a, [add3(o(Rt * 1.05, z2 + h * 0.12), n, -h * 0.17), add3(o(Rt * 1.05, z2 + h * 0.12), n, h * 0.17), add3(o(Rt * 1.38, z2 + h * 0.4), n, h * 0.1), add3(o(Rt * 1.38, z2 + h * 0.4), n, -h * 0.1)], unit(cross(n, [d[0] * 0.6, d[1] * 0.6, 0.8])), h * 0.02); a.line(cx + d[0] * Rt * 1.05, cy + d[1] * Rt * 1.05, cx + d[0] * Rt * 1.38, cy + d[1] * Rt * 1.38, 'EQUIP-DETAIL'); }
      a.cyl(cx, cy, z2 + h * 0.12, z2 + h * 0.2, Rt * 0.82, 26); a.cyl(cx + Rt * 0.82, cy, z2 + h * 0.12, z2 + h * 0.23, h * 0.025, 8); a.cyl(cx, cy, z2 + h * 0.2, z2 + h * 0.23, h * 0.07, 12);
      for (const sy of [-1, 1]) a.tube([[cx - Rt * 0.3, cy + sy * Rt * 0.4, z2 + h * 0.22], [cx + Rt * 0.3, cy + sy * Rt * 0.4, z2 + h * 0.22]], [h * 0.012, h * 0.012], 5);
      a.circ(cx, cy, Rf, 'EQUIP'); a.circ(cx, cy, Rt * 1.12, 'EQUIP-DETAIL'); a.circ(cx, cy, Rt * 0.82, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the bolted base flange, tunnel with capture ring and twelve latches, three guide petals, the hinged hatch lid and the handrails (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic deep-space probe with high-gain dish and instrument booms',
    desc: (v) => `Outer-planet probe on its launch adapter: a hexagonal bus under a ${v.d} in dish on three feed struts, a power-source boom with cooling fins, a science boom with an instrument cluster, a magnetometer mast and four thruster pods.`,
    vs: [['60 in dish', 60], ['90 in dish', 90], ['120 in dish', 120], ['160 in dish', 160]].map(([l, d]) => [l, d * 2.15, d * 1.08, d * 0.9, 0, { d }]),
    build: (a, v) => {
      const D = v.d * IN, R = D / 2, cx = a.cx, cy = a.cy, Rb = D * 0.22, z0 = a.Z0 + D * 0.14, z1 = z0 + D * 0.3, hex = (r) => Array.from({ length: 6 }, (_, i) => [cx + m.cos((i / 6) * PI * 2) * r, cy + m.sin((i / 6) * PI * 2) * r]);
      a.cone(cx, cy, a.Z0, z0, Rb * 0.9, Rb * 0.9, 18); band(a, cx, cy, a.Z0 + 40, Rb * 0.95, 80, 18); a.prism(hex(Rb), z0, z1); a.prism(hex(Rb * 1.05), z1 - D * 0.02, z1);
      dish(a, [cx, cy, z1], [0, 0, 1], R, D * 0.14, D * 0.27, 28);
      for (const sx of [-1, 1]) { const x1 = cx + sx * (Rb + D * 0.78); a.tube([[cx + sx * Rb, cy, z0 + D * 0.12], [x1, cy, z0 + D * 0.12]], [D * 0.01, D * 0.01], 6); a.tube([[cx + sx * Rb, cy, z0 + D * 0.12], [cx + sx * (Rb + D * 0.4), cy + D * 0.05, z0 + D * 0.02]], [D * 0.006, D * 0.006], 4); }
      const xr = cx + Rb + D * 0.5, xe = cx + Rb + D * 0.88; a.xcyl(xr, xe, cy, z0 + D * 0.12, D * 0.035, 14); for (let k = 0; k < 6; k++) a.xcyl(xr + (xe - xr) * (k / 6) + 20, xr + (xe - xr) * (k / 6) + 60, cy, z0 + D * 0.12, D * 0.065, 14);
      const xs = cx - Rb - D * 0.78; a.box(xs - D * 0.07, cy - D * 0.06, z0 + D * 0.05, xs + D * 0.07, cy + D * 0.06, z0 + D * 0.19); a.ell(xs, cy, z0 + D * 0.12, D * 0.05, D * 0.05, D * 0.05, 10, 6); a.cyl(xs - D * 0.12, cy, z0 + D * 0.05, z0 + D * 0.2, D * 0.03, 10);
      a.tube([[cx - Rb * 0.5, cy + Rb * 0.7, z0 + D * 0.2], [cx - Rb * 0.5, cy + R * 0.9, z0 + D * 0.5]], [D * 0.006, D * 0.006], 4); a.box(cx - Rb * 0.5 - 40, cy + R * 0.9 - 40, z0 + D * 0.5, cx - Rb * 0.5 + 40, cy + R * 0.9 + 40, z0 + D * 0.54);
      for (let k = 0; k < 4; k++) { const g = (k / 4) * PI * 2 + PI / 4; a.box(cx + m.cos(g) * Rb * 1.1 - D * 0.025, cy + m.sin(g) * Rb * 1.1 - D * 0.025, z0 + D * 0.03, cx + m.cos(g) * Rb * 1.1 + D * 0.025, cy + m.sin(g) * Rb * 1.1 + D * 0.025, z0 + D * 0.1); }
      a.circ(cx, cy, R, 'EQUIP'); a.poly(hex(Rb), 'EQUIP-DETAIL'); a.line(cx + Rb, cy, xe, cy, 'EQUIP-DETAIL'); a.line(cx - Rb, cy, xs, cy, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the adapter, hexagonal bus, high-gain dish on three struts, finned power boom, instrument boom with cluster, magnetometer mast and four thruster pods (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic Earth-observation satellite with sensor barrel',
    desc: (v) => `Imaging satellite, ${v.bw} in bus on its adapter: a box bus with side radiator panels, a sensor barrel with a hood and cover, two star trackers, a three-panel solar wing on a yoke, a small dish on a boom and four thruster blocks.`,
    vs: [['small, 40 in bus', 40], ['medium, 60 in bus', 60], ['large, 84 in bus', 84], ['heavy, 120 in bus', 120]].map(([l, bw]) => [l, bw * 4.9, bw * 1.25, bw * 2.65, 0, { bw }]),
    build: (a, v) => {
      const B = v.bw * IN, cx = a.X0 + B * 3.7, cy = a.cy, zb0 = a.Z0 + B * 0.14, zb1 = zb0 + B * 1.5;
      a.cone(a.cx * 0 + cx, cy, a.Z0, zb0, B * 0.34, B * 0.34, 20); band(a, cx, cy, a.Z0 + 30, B * 0.37, 60, 20); a.box(cx - B / 2, cy - B / 2, zb0, cx + B / 2, cy + B / 2, zb1);
      for (const sy of [-1, 1]) a.box(cx - B * 0.46, cy + sy * B * 0.5 - (sy > 0 ? 0 : 20), zb0 + B * 0.1, cx + B * 0.46, cy + sy * B * 0.5 + (sy > 0 ? 20 : 0), zb0 + B * 1.38);
      a.cyl(cx, cy, zb1, zb1 + B * 0.62, B * 0.3, 22); a.cone(cx, cy, zb1 + B * 0.62, zb1 + B * 0.94, B * 0.3, B * 0.36, 22); a.cyl(cx, cy, zb1 + B * 0.94, zb1 + B * 0.97, B * 0.37, 22); a.cyl(cx, cy, zb1 + B * 0.97, zb1 + B * 1.0, B * 0.31, 22);
      for (const sx of [-1, 1]) { a.cyl(cx + sx * B * 0.32, cy + B * 0.22, zb1, zb1 + B * 0.24, B * 0.05, 8); a.cone(cx + sx * B * 0.32, cy + B * 0.22, zb1 + B * 0.24, zb1 + B * 0.3, B * 0.05, B * 0.07, 8); }
      a.tube([[cx - B / 2, cy, zb0 + B * 0.8], [cx - B * 0.75, cy, zb0 + B * 0.8]], [B * 0.025, B * 0.025], 6);
      for (let k = 0; k < 3; k++) { const x1 = cx - B * 0.75 - k * B * 0.96, x0 = x1 - B * 0.92; panel(a, x0, x1, cy, zb0 + B * 0.2, zb0 + B * 1.4, 4, 8, B * 0.03); a.rect(x0, cy - B * 0.02, x1, cy + B * 0.02, 'EQUIP'); }
      a.tube([[cx + B / 2, cy, zb0 + B * 1.0], [cx + B * 0.8, cy, zb0 + B * 1.2]], [B * 0.015, B * 0.015], 5); dish(a, [cx + B * 0.8, cy, zb0 + B * 1.2], [0.6, 0, 0.8], B * 0.2, B * 0.05, B * 0.07, 14);
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) a.box(cx + sx * B * 0.42 - B * 0.05, cy + sy * B * 0.42 - B * 0.05, zb0 - B * 0.02, cx + sx * B * 0.42 + B * 0.05, cy + sy * B * 0.42 + B * 0.05, zb0 + B * 0.08);
      a.rect(cx - B / 2, cy - B / 2, cx + B / 2, cy + B / 2, 'EQUIP'); a.circ(cx, cy, B * 0.3, 'EQUIP-DETAIL'); a.line(cx - B / 2, cy, cx - B * 0.75 - 2.88 * B, cy, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the adapter, box bus with side radiators, sensor barrel with hood and cover, star trackers, a three-panel solar wing on a yoke, boom dish and thruster blocks (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic solar array wing on a test stand',
    desc: (v) => `Deployed solar array wing of ${v.n} panels standing on a ground test stand: a yoke with drive motor, hinged panels with cell grid and back ribs, a base rail, clamps, uprights with footplates and a top tie rail.`,
    vs: [['2 panels', 2], ['3 panels', 3], ['4 panels', 4], ['6 panels', 6]].map(([l, n]) => [l, n * 66 + 62, 40, 112, 0, { n }]),
    build: (a, v) => {
      const pw = 60 * IN, gap = 6 * IN, x0 = a.X0 + 50 * IN, cy = a.cy, zb = a.Z0 + 10 * IN, ph = 90 * IN;
      a.cyl(a.X0 + 22 * IN, cy, zb + 20 * IN, zb + 70 * IN, 4 * IN, 12); a.xcyl(a.X0 + 22 * IN, x0, cy, zb + ph / 2, 2 * IN, 10); a.box(a.X0 + 14 * IN, cy - 8 * IN, a.Z0, a.X0 + 30 * IN, cy + 8 * IN, a.Z0 + 10 * IN);
      for (let i = 0; i < v.n; i++) { const px0 = x0 + i * (pw + gap), px1 = px0 + pw; panel(a, px0, px1, cy, zb, zb + ph, 4, 6, 2.2 * IN);
        for (const sz of [0.2, 0.8]) a.box(px0 + 4 * IN, cy + 1.2 * IN, zb + ph * sz - 1 * IN, px1 - 4 * IN, cy + 2.6 * IN, zb + ph * sz + 1 * IN); a.box(px0 + pw * 0.5 - 1 * IN, cy + 1.2 * IN, zb, px0 + pw * 0.5 + 1 * IN, cy + 2.6 * IN, zb + ph);
        if (i > 0) for (const sz of [0.15, 0.85]) a.xcyl(px0 - gap, px0 + 4, cy, zb + ph * sz, 0.9 * IN, 8); a.rect(px0, cy - 1.1 * IN, px1, cy + 1.1 * IN, 'EQUIP'); a.line(px0 + pw / 2, cy - 1 * IN, px0 + pw / 2, cy + 1 * IN, 'EQUIP-DETAIL'); }
      const xe = x0 + v.n * (pw + gap) - gap; a.box(a.X0 + 30 * IN, cy - 4 * IN, zb - 5 * IN, xe + 4 * IN, cy + 4 * IN, zb); a.tube([[a.X0 + 30 * IN, cy + 9 * IN, zb + ph + 3 * IN], [xe + 3 * IN, cy + 9 * IN, zb + ph + 3 * IN]], [1.2 * IN, 1.2 * IN], 6);
      const ups = [x0 + 2 * IN, ...Array.from({ length: v.n }, (_, i) => x0 + (i + 1) * (pw + gap) - gap - 2 * IN)]; for (const ux of ups) { a.tube([[ux, cy + 9 * IN, a.Z0 + 10 * IN], [ux, cy + 9 * IN, zb + ph + 3 * IN]], [1.6 * IN, 1.6 * IN], 6); a.box(ux - 6 * IN, cy - 2 * IN, a.Z0, ux + 6 * IN, cy + 16 * IN, a.Z0 + 10 * IN); a.tube([[ux, cy + 9 * IN, zb + ph * 0.5], [ux, cy + 1.6 * IN, zb + ph * 0.5]], [0.8 * IN, 0.8 * IN], 4); a.rect(ux - 6 * IN, cy - 2 * IN, ux + 6 * IN, cy + 16 * IN, 'EQUIP-DETAIL'); }
      a.rect(a.X0 + 14 * IN, cy - 8 * IN, a.X0 + 30 * IN, cy + 8 * IN, 'EQUIP'); a.outline('EQUIP-HIDDEN');
      a.log('Added the yoke with drive motor, hinged panels with cell grid and back ribs, base rail, uprights with footplates and the top tie rail (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic deployable mesh reflector antenna spacecraft',
    desc: (v) => `Large-reflector spacecraft: a ${v.d} in tilted reflector with a rim hoop, an inner hoop and a feed horn on three struts, carried on a folding boom from a box bus with two solar panels and an adapter ring.`,
    vs: [['60 in reflector', 60], ['100 in reflector', 100], ['150 in reflector', 150], ['200 in reflector', 200]].map(([l, d]) => [l, d * 1.55, d * 1.4, d * 1.35, 0, { d }]),
    build: (a, v) => {
      const D = v.d * IN, R = D / 2, cx = a.cx, cy = a.cy, bs = D * 0.3, zb0 = a.Z0 + D * 0.1, th = 0.6, u = [m.sin(th), 0, m.cos(th)], cb = [cx + D * 0.08, cy, zb0 + bs + D * 0.32];
      a.cone(cx, cy, a.Z0, zb0, bs * 0.55, bs * 0.55, 18); a.box(cx - bs / 2, cy - bs / 2, zb0, cx + bs / 2, cy + bs / 2, zb0 + bs);
      a.tube([[cx, cy, zb0 + bs], [cx - bs * 0.2, cy, zb0 + bs + D * 0.1], [cb[0] - u[0] * D * 0.02, cb[1], cb[2] - D * 0.04]], [D * 0.016, D * 0.014, D * 0.014], 6); a.cyl(cx, cy, zb0 + bs, zb0 + bs + D * 0.04, D * 0.03, 10);
      dish(a, cb, u, R, R * 0.28, D * 0.4, 28); ring3(a, add3(cb, u, R * 0.28 * 0.45), u, R * 0.62, D * 0.01, 24);
      const [e1, e2] = basis(u); for (let k = 0; k < 6; k++) { const g = (k / 6) * PI * 2; a.tube([cb, add3(add3(add3(cb, u, R * 0.28), e1, m.cos(g) * R * 0.98), e2, m.sin(g) * R * 0.98)], [D * 0.004, D * 0.004], 4); }
      for (const sy of [-1, 1]) { a.tube([[cx, cy + sy * bs / 2, zb0 + bs * 0.5], [cx, cy + sy * (bs / 2 + D * 0.09), zb0 + bs * 0.5]], [D * 0.01, D * 0.01], 5); panel(a, cx - bs * 0.9, cx + bs * 0.9, cy + sy * (bs / 2 + D * 0.09), zb0 + bs * 0.1, zb0 + bs * 0.9, 5, 3, D * 0.015); }
      a.circ(cb[0], cb[1], R * m.cos(th), 'EQUIP'); a.rect(cx - bs / 2, cy - bs / 2, cx + bs / 2, cy + bs / 2, 'EQUIP'); a.rect(cx - bs * 0.9, cy - bs / 2 - D * 0.1, cx + bs * 0.9, cy + bs / 2 + D * 0.1, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the adapter ring and box bus, the folding boom, tilted reflector with rim hoop, inner hoop, rib lines and feed horn on struts, and two side solar panels (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic orbital transfer stage with sphere tanks on a truss',
    desc: (v) => `Orbit-transfer stage, ${v.dia} in across: four corner truss posts with rings and braces carrying two propellant spheres, a central bell engine on a gimbal mount, four thruster quads, a payload ring on top and a lower adapter skirt.`,
    vs: [['60 in stage', 60], ['84 in stage', 84], ['108 in stage', 108], ['132 in stage', 132]].map(([l, dia]) => [l, dia * 1.15, dia * 1.15, dia * 1.9, 0, { dia }]),
    build: (a, v) => {
      const D = v.dia * IN, cx = a.cx, cy = a.cy, h = D * 0.38, zl = a.Z0 + D * 0.62, zu = a.Z1 - D * 0.18, pt = (sx, sy, z) => [cx + sx * h, cy + sy * h, z];
      a.cone(cx, cy, a.Z0, a.Z0 + D * 0.1, D * 0.52, D * 0.52, 24); bell(a, cx, cy, zl - D * 0.02, D * 0.5, D * 0.045, D * 0.2, 16); a.cyl(cx, cy, zl - D * 0.02, zl + D * 0.12, D * 0.12, 16);
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) a.tube([pt(sx, sy, a.Z0 + D * 0.1), pt(sx, sy, zu)], [D * 0.018, D * 0.018], 6);
      for (const [z0, z1] of [[zl - D * 0.02, zl + D * 0.14], [zl + D * 0.14, zu - D * 0.02], [a.Z0 + D * 0.1, zl - D * 0.02]]) { braceXZ(a, cx - h, cx + h, cy - h, z0, z1, D * 0.007); braceXZ(a, cx - h, cx + h, cy + h, z0, z1, D * 0.007); braceYZ(a, cx - h, cy - h, cy + h, z0, z1, D * 0.007); braceYZ(a, cx + h, cy - h, cy + h, z0, z1, D * 0.007); }
      for (const z of [a.Z0 + D * 0.1, zl - D * 0.02, zu]) a.tube([pt(-1, -1, z), pt(1, -1, z), pt(1, 1, z), pt(-1, 1, z), pt(-1, -1, z)], Array(5).fill(D * 0.014), 5);
      for (const sx of [-1, 1]) { a.ell(cx + sx * D * 0.2, cy, (zl + zu) / 2 + D * 0.12, D * 0.2, D * 0.2, D * 0.2, 18, 10); a.cyl(cx + sx * D * 0.2, cy, zl + D * 0.12, zl + D * 0.17, D * 0.08, 10); }
      a.cyl(cx, cy, zu, a.Z1 - D * 0.1, D * 0.34, 24); a.cyl(cx, cy, a.Z1 - D * 0.1, a.Z1, D * 0.38, 24); ring3(a, [cx, cy, a.Z1 - D * 0.05], [0, 0, 1], D * 0.38, D * 0.012, 24);
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { a.box(cx + sx * (h + D * 0.05) - D * 0.04, cy + sy * (h + D * 0.05) - D * 0.04, zu - D * 0.18, cx + sx * (h + D * 0.05) + D * 0.04, cy + sy * (h + D * 0.05) + D * 0.04, zu - D * 0.06); }
      a.circ(cx, cy, D * 0.52, 'EQUIP'); a.rect(cx - h, cy - h, cx + h, cy + h, 'EQUIP-DETAIL'); for (const sx of [-1, 1]) a.circ(cx + sx * D * 0.2, cy, D * 0.2, 'EQUIP-DETAIL'); a.circ(cx, cy, D * 0.34, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the lower skirt, four truss posts with rings and braces, two propellant spheres, the gimballed bell engine, thruster quads and the payload ring (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic inflatable habitat module with docking cones',
    desc: (v) => `Expandable habitat standing on end, ${v.d} in across: a central core tube with two end bulkheads and docking cones, a fat inflated shell with six restraint straps, two radiator panels on arms and a hatch ring at the top.`,
    vs: [['120 in habitat', 120], ['180 in habitat', 180], ['260 in habitat', 260]].map(([l, d]) => [l, d * 2.15, d * 1.1, d * 1.55, 0, { d }]),
    build: (a, v) => {
      const D = v.d * IN, R = D / 2, cx = a.cx, cy = a.cy, zc = a.Z0 + D * 0.78, zb = a.Z0 + D * 0.12, zt = a.Z1 - D * 0.1;
      a.cone(cx, cy, a.Z0, zb, D * 0.3, D * 0.3, 20); a.cyl(cx, cy, zb, zt, D * 0.17, 22); a.cone(cx, cy, zb, zb + D * 0.12, D * 0.3, D * 0.2, 20); a.cone(cx, cy, zt - D * 0.12, zt, D * 0.2, D * 0.3, 20);
      a.ell(cx, cy, zc, R, R, D * 0.5, 28, 16); for (let k = 0; k < 6; k++) { const g = (k / 6) * PI * 2; a.tube(Array.from({ length: 9 }, (_, i) => { const t = (i / 8) * PI - PI / 2; return [cx + m.cos(g) * R * 1.01 * m.cos(t), cy + m.sin(g) * R * 1.01 * m.cos(t), zc + D * 0.505 * m.sin(t)]; }), Array(9).fill(D * 0.008), 4); }
      for (const dz of [-0.28, 0, 0.28]) ring3(a, [cx, cy, zc + D * dz], [0, 0, 1], R * m.sqrt(1 - (dz * 2) ** 2) * 1.01, D * 0.007, 26);
      a.cyl(cx, cy, zt, a.Z1, D * 0.16, 18); a.cyl(cx, cy, a.Z1 - D * 0.02, a.Z1, D * 0.2, 18); for (let k = 0; k < 8; k++) { const g = (k / 8) * PI * 2; a.cyl(cx + m.cos(g) * D * 0.18, cy + m.sin(g) * D * 0.18, a.Z1 - D * 0.03, a.Z1, D * 0.012, 6); }
      for (const sx of [-1, 1]) { a.tube([[cx + sx * R * 0.9, cy, zc], [cx + sx * (R + D * 0.12), cy, zc]], [D * 0.012, D * 0.012], 5); panel(a, Math.min(cx + sx * (R + D * 0.12), cx + sx * (R + D * 0.6)), Math.max(cx + sx * (R + D * 0.12), cx + sx * (R + D * 0.6)), cy, zc - D * 0.35, zc + D * 0.35, 4, 4, D * 0.015); a.rect(Math.min(cx + sx * (R + D * 0.12), cx + sx * (R + D * 0.6)), cy - D * 0.01, Math.max(cx + sx * (R + D * 0.12), cx + sx * (R + D * 0.6)), cy + D * 0.01, 'EQUIP'); }
      a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, D * 0.17, 'EQUIP-DETAIL'); a.circ(cx, cy, D * 0.3, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the core tube with docking cones, the inflated shell with six straps and hoops, the hatch ring with bolts and two radiator panels on arms (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/spacecraft', title: 'Generic sample return capsule on a cradle',
    desc: (v) => `Blunt return capsule, ${v.dia} in across, sitting heat-shield down in a ring cradle on three legs: a rounded heat shield, a conical backshell, a parachute canister with cap, a short antenna stub and two lifting eyes.`,
    vs: [['24 in capsule', 24], ['36 in capsule', 36], ['60 in capsule', 60]].map(([l, dia]) => [l, dia * 1.4, dia * 1.4, dia * 1.06, 0, { dia }]),
    build: (a, v) => {
      const R = (v.dia / 2) * IN, cx = a.cx, cy = a.cy, zs = a.Z0 + R * 0.42;
      for (let k = 0; k < 3; k++) { const g = (k / 3) * PI * 2 + 0.5; a.tube([[cx + m.cos(g) * R * 1.1, cy + m.sin(g) * R * 1.1, a.Z0 + R * 0.04], [cx + m.cos(g) * R * 0.78, cy + m.sin(g) * R * 0.78, a.Z0 + R * 0.3]], [R * 0.04, R * 0.04], 6); a.cyl(cx + m.cos(g) * R * 1.1, cy + m.sin(g) * R * 1.1, a.Z0, a.Z0 + R * 0.04, R * 0.1, 10); a.circ(cx + m.cos(g) * R * 1.1, cy + m.sin(g) * R * 1.1, R * 0.1, 'EQUIP-DETAIL'); }
      ring3(a, [cx, cy, a.Z0 + R * 0.32], [0, 0, 1], R * 0.78, R * 0.045, 26);
      a.ell(cx, cy, zs, R, R, R * 0.3, 26, 8); a.cone(cx, cy, zs + R * 0.02, zs + R * 0.95, R * 0.99, R * 0.4, 26); a.cyl(cx, cy, zs + R * 0.95, zs + R * 1.12, R * 0.3, 18); a.cyl(cx, cy, zs + R * 1.12, zs + R * 1.16, R * 0.24, 18); a.cyl(cx, cy, zs + R * 1.16, zs + R * 1.4, R * 0.02, 6);
      for (const sx of [-1, 1]) { ring3(a, [cx + sx * R * 0.38, cy, zs + R * 0.78], [0, 1, 0], R * 0.06, R * 0.014, 10); }
      a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, R * 0.4, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.78, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the ring cradle on three legs, the rounded heat shield, conical backshell, parachute canister with cap, antenna stub and lifting eyes (plan and 3D).');
    } }),

  // ===================================================== structures =====================================================
  fam({ cat: 'aerospace/structures', title: 'Generic wing box section on an assembly jig',
    desc: (v) => `Wing box section, ${v.span} in span with its root end to the front on two jig stands: front and rear I-section spars, ${v.nr} ribs with flanges and lightening holes, a lower skin with four stringers, an upper skin over the outer half only, root lugs with pins and cushioned jig pads.`,
    vs: [['span 60 in', 60, 5], ['span 96 in', 96, 6], ['span 144 in', 144, 8], ['span 192 in', 192, 10]].map(([l, span, nr]) => { const C = 34 + span * 0.2; return [l, C + 20, span + 40, 38 + C * 0.2, 0, { span, nr, C }]; }),
    build: (a, v) => {
      const C = v.C * IN, x0 = a.X0 + 10 * IN, x1 = x0 + C, yf = a.YF + 14 * IN, yb = a.YB - 14 * IN, th = C * 0.2, zl = a.Z0 + 28 * IN, tf = (f) => th * (0.3 + 0.7 * (1 - (2 * f - 1) ** 2)), top = (x) => zl + tf((x - x0) / C), n = 14;
      const xs = Array.from({ length: n + 1 }, (_, i) => x0 + (C * i) / n);
      const rib = (y, holes) => { for (let i = 0; i < n; i++) { const xa = xs[i], xb = xs[i + 1], fa = top(xa), fb = top(xb), e = th * 0.07; prismY(a, [[xa, zl], [xb, zl], [xb, zl + e], [xa, zl + e]], y - 24, y + 24); prismY(a, [[xa, fa - e], [xb, fb - e], [xb, fb], [xa, fa]], y - 24, y + 24); if (!holes.includes(i)) prismY(a, [[xa, zl + e - 1], [xb, zl + e - 1], [xb, fb - e + 1], [xa, fa - e + 1]], y - 7, y + 7); } };
      for (let k = 0; k < v.nr; k++) rib(yf + 12 + ((yb - yf - 24) * k) / (v.nr - 1), [3, 4, 5, 9, 10, 11].filter((h) => k < v.nr - 1 || h > 100));
      for (const f of [0.2, 0.72]) { const x = x0 + C * f, h = tf(f); a.box(x - 20 * 1.5, yf, zl, x + 30, yb, zl + th * 0.08); a.box(x - 30, yf, zl + h - th * 0.08, x + 30, yb, zl + h); a.box(x - 4, yf, zl + th * 0.08, x + 4, yb, zl + h - th * 0.08); a.rect(x - 30, yf, x + 30, yb, 'EQUIP-DETAIL'); a.ycyl(yf - 3 * IN, yf, x, zl + h / 2, 0.9 * IN, 10); a.box(x - 1.6 * IN, yf - 1.6 * IN, zl + h / 2 - 1.6 * IN, x + 1.6 * IN, yf, zl + h / 2 + 1.6 * IN); }
      a.box(x0, yf, zl - 6, x1, yb, zl); for (let k = 1; k <= 4; k++) { const x = x0 + (C * k) / 5; a.box(x - 18, yf, zl - 40, x + 18, yb, zl - 6); }
      for (let i = 0; i < n; i++) { const xa = xs[i], xb = xs[i + 1]; a.box(xa, (yf + yb) / 2, top(Math.min(xa, xb)) - 0, xb, yb, Math.max(top(xa), top(xb)) + 7 - 0 * 1); }
      for (const f of [0.35, 0.55]) a.box(x0 + C * f - 14, (yf + yb) / 2, top(x0 + C * f) + 6, x0 + C * f + 14, yb, top(x0 + C * f) + 40);
      a.box(x0 - 20, yb, zl, x1 + 20, yb + 8, top(x0 + C * 0.5)); 
      for (const jy of [yf + (yb - yf) * 0.18, yf + (yb - yf) * 0.82]) { a.box(x0 - 3 * IN, jy - 6 * IN, a.Z0, x1 + 3 * IN, jy + 6 * IN, a.Z0 + 3 * IN); for (const jx of [x0 + C * 0.25, x0 + C * 0.7]) { a.cyl(jx, jy, a.Z0 + 3 * IN, zl - 3 * IN, 1.4 * IN, 8); a.box(jx - 4 * IN, jy - 5 * IN, zl - 3 * IN, jx + 4 * IN, jy + 5 * IN, zl - 5); } a.rect(x0 - 3 * IN, jy - 6 * IN, x1 + 3 * IN, jy + 6 * IN, 'EQUIP-DETAIL'); }
      a.rect(x0, yf, x1, yb, 'EQUIP'); for (let k = 0; k < v.nr; k++) { const y = yf + 12 + ((yb - yf - 24) * k) / (v.nr - 1); a.line(x0, y, x1, y, 'EQUIP-DETAIL'); } a.line(x0, (yf + yb) / 2, x1, (yf + yb) / 2, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the I-section spars with root lugs, flanged ribs with lightening holes, the lower skin with stringers, the half upper skin with stiffeners and two cushioned jig stands (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic fuselage barrel section on cradles',
    desc: (v) => `Fuselage barrel ${v.dia} in across and ${v.len} ft long on two cradles: ring frames every 24 in, 24 stringers, a lower skin panel run, a cabin floor with seat tracks and cross beams, and four window frames each side.`,
    vs: [['100 in dia, 8 ft', 100, 8], ['130 in dia, 10 ft', 130, 10], ['160 in dia, 14 ft', 160, 14], ['230 in dia, 18 ft', 230, 18]].map(([l, dia, len]) => [l, len * 12 + 20, dia + 20, dia + 50, 0, { dia, len }]),
    build: (a, v) => {
      const R = (v.dia / 2) * IN, cy = a.cy, x0 = a.X0 + 10 * IN, x1 = a.X1 - 10 * IN, zc = a.Z0 + R + 26 * IN, nf = Math.round(v.len / 2) + 1, zf = zc - R * 0.12;
      for (let i = 0; i < nf; i++) { const x = x0 + ((x1 - x0 - 30) * i) / (nf - 1) + 15; ring3(a, [x, cy, zc], [1, 0, 0], R, 18, 28); a.box(x - 15, cy - R * 0.97, zf - 70, x + 15, cy + R * 0.97, zf); }
      for (let k = 0; k < 24; k++) { const g = (k / 24) * PI * 2; a.tube([[x0, cy + m.cos(g) * R * 0.985, zc + m.sin(g) * R * 0.985], [x1, cy + m.cos(g) * R * 0.985, zc + m.sin(g) * R * 0.985]], [9, 9], 4); }
      const ns = 18; for (let k = 0; k < ns; k++) { const g0 = PI - 0.4 + ((PI + 0.8) * k) / ns, g1 = PI - 0.4 + ((PI + 0.8) * (k + 1)) / ns, q = (x, g) => [x, cy + m.cos(g) * (R + 4), zc + m.sin(g) * (R + 4)]; plateN(a, [q(x0, g0), q(x1, g0), q(x1, g1), q(x0, g1)], 5); }
      a.box(x0, cy - R * 0.97, zf, x1, cy + R * 0.97, zf + 8); for (const o of [-0.45, -0.15, 0.15, 0.45]) a.box(x0, cy + o * R - 12, zf + 8, x1, cy + o * R + 12, zf + 38);
      for (const sy of [-1, 1]) for (let k = 0; k < 4; k++) { const xm = x0 + (x1 - x0) * ((k + 0.7) / 4.4); a.frame(xm - 11 * IN, zc + R * 0.08, xm + 11 * IN, zc + R * 0.08 + 15 * IN, cy + sy * (R * 0.995) - 12, cy + sy * (R * 0.995) + 12, 40); }
      for (const xs of [x0 + (x1 - x0) * 0.2, x0 + (x1 - x0) * 0.8]) { a.box(xs - 5 * IN, cy - R * 0.82, a.Z0, xs + 5 * IN, cy + R * 0.82, a.Z0 + 6 * IN); saddleX(a, xs, 5 * IN, R, zc, cy, a.Z0 + 6 * IN); a.rect(xs - 5 * IN, cy - R * 0.82, xs + 5 * IN, cy + R * 0.82, 'EQUIP-DETAIL'); }
      a.rect(x0, cy - R, x1, cy + R, 'EQUIP'); for (let i = 0; i < nf; i++) { const x = x0 + ((x1 - x0 - 30) * i) / (nf - 1) + 15; a.line(x, cy - R, x, cy + R, 'EQUIP-DETAIL'); } a.line(x0, cy, x1, cy, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the ring frames with floor beams, 24 stringers, the lower skin panels, cabin floor with seat tracks, window frames and two cradles (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic turbofan engine nacelle on a stand',
    desc: (v) => `Podded engine nacelle with a ${v.fan} in fan on a floor stand, nose to the front: an open inlet with lip ring and fan blades behind a spinner, a tapering outer cowl with a thrust-reverser band, a core nozzle with plug and a pylon stub on top.`,
    vs: [['40 in fan', 40], ['60 in fan', 60], ['90 in fan', 90], ['120 in fan', 120]].map(([l, fan]) => [l, fan * 1.5, fan * 2.7, fan * 1.9 + 22, 0, { fan }]),
    build: (a, v) => {
      const Rf = (v.fan / 2) * IN, cx = a.cx, L = Rf * 2 * 2.2, y0 = a.YF + Rf * 0.12, zc = a.Z0 + 14 * IN + Rf * 1.32 + 6 * IN;
      turbofan(a, cx, zc, y0, Rf, L, true);
      a.box(cx - Rf * 0.16, y0 + L * 0.3, zc + Rf * 1.25, cx + Rf * 0.16, y0 + L * 0.85, zc + Rf * 1.55); a.box(cx - Rf * 0.5, y0 + L * 0.34, zc + Rf * 1.55, cx + Rf * 0.5, y0 + L * 0.82, zc + Rf * 1.6);
      for (const yy of [y0 + L * 0.3, y0 + L * 0.7]) { a.box(cx - Rf * 1.1, yy - 4 * IN, a.Z0, cx + Rf * 1.1, yy + 4 * IN, a.Z0 + 6 * IN); saddleY(a, yy, 6 * IN, Rf * 1.28, zc, cx, a.Z0 + 6 * IN); a.rect(cx - Rf * 1.1, yy - 4 * IN, cx + Rf * 1.1, yy + 4 * IN, 'EQUIP-DETAIL'); }
      a.ellp(cx, y0 + L * 0.1, Rf * 1.3, L * 0.1, 'EQUIP'); a.poly([[cx - Rf * 1.22, y0 + L * 0.12], [cx + Rf * 1.22, y0 + L * 0.12], [cx + Rf * 0.9, y0 + L * 0.8], [cx - Rf * 0.9, y0 + L * 0.8]], 'EQUIP'); a.rect(cx - Rf * 0.5, y0 + L * 0.34, cx + Rf * 0.5, y0 + L * 0.82, 'EQUIP-DETAIL'); a.circ(cx, y0 + L * 0.06, Rf, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the inlet with lip ring and fan blades behind a spinner, the tapering cowl with reverser band, the core nozzle and plug, the pylon stub and two stand saddles (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic engine pressure bottle rack',
    desc: (v) => `Bottle rack of ${v.n} domed pressure bottles standing in a frame: a footplate, four corner posts and a top frame, two strap rings round each bottle, a manifold tube across the valves with a branch to each and a gauge.`,
    vs: [['4 bottles', 2, 2], ['6 bottles', 3, 2], ['9 bottles', 3, 3]].map(([l, cx2, cy2]) => [l, cx2 * 26 + 14, cy2 * 26 + 14, 84, 0, { n: cx2 * cy2, cx2, cy2 }]),
    build: (a, v) => {
      const pitch = 26 * IN, r = 10 * IN, x0 = a.cx - ((v.cx2 - 1) * pitch) / 2, y0 = a.cy - ((v.cy2 - 1) * pitch) / 2, zb = a.Z0 + 5 * IN, zt = zb + 60 * IN;
      a.box(a.X0 + 2 * IN, a.YF + 2 * IN, a.Z0, a.X1 - 2 * IN, a.YB - 2 * IN, zb);
      for (let i = 0; i < v.cx2; i++) for (let j = 0; j < v.cy2; j++) { const x = x0 + i * pitch, y = y0 + j * pitch; a.cyl(x, y, zb, zt, r, 20); a.ell(x, y, zb + r * 0.4, r, r, r * 0.55, 16, 5); a.ell(x, y, zt - r * 0.4, r, r, r * 0.55, 16, 5); a.cyl(x, y, zt + r * 0.1, zt + 4 * IN, 1.3 * IN, 8); a.box(x - 2 * IN, y - 2 * IN, zt + 4 * IN, x + 2 * IN, y + 2 * IN, zt + 6 * IN);
        for (const f of [0.28, 0.72]) ring3(a, [x, y, zb + (zt - zb) * f], [0, 0, 1], r * 1.03, 8, 18); a.circ(x, y, r, 'EQUIP'); a.circ(x, y, 2 * IN, 'EQUIP-DETAIL'); }
      const xe = a.X1 - 5 * IN, ye = a.YB - 5 * IN, xs = a.X0 + 5 * IN, ys = a.YF + 5 * IN; for (const [x, y] of [[xs, ys], [xe, ys], [xe, ye], [xs, ye]]) a.tube([[x, y, zb], [x, y, zt + 4 * IN]], [20, 20], 6);
      a.tube([[xs, ys, zt + 4 * IN], [xe, ys, zt + 4 * IN], [xe, ye, zt + 4 * IN], [xs, ye, zt + 4 * IN], [xs, ys, zt + 4 * IN]], Array(5).fill(16), 5); a.tube([[xs, ys, zb + 20 * IN], [xe, ys, zb + 20 * IN]], [10, 10], 4); a.tube([[xs, ye, zb + 20 * IN], [xe, ye, zb + 20 * IN]], [10, 10], 4);
      for (let j = 0; j < v.cy2; j++) { const y = y0 + j * pitch; a.tube([[a.X0 + 3 * IN, y, zt + 7 * IN], [a.X1 - 3 * IN, y, zt + 7 * IN]], [22, 22], 6); for (let i = 0; i < v.cx2; i++) a.tube([[x0 + i * pitch, y, zt + 6 * IN], [x0 + i * pitch, y, zt + 7 * IN]], [10, 10], 5); }
      a.ycyl(y0, y0 + (v.cy2 - 1) * pitch, a.X1 - 3 * IN, zt + 7 * IN, 28, 8); a.ycyl(a.cy - 3 * IN, a.cy + 3 * IN, a.X1 - 2 * IN, zt + 12 * IN, 2.4 * IN, 12);
      a.outline('EQUIP'); a.line(a.X0 + 3 * IN, a.cy, a.X1 - 3 * IN, a.cy, 'EQUIP-DETAIL');
      a.log('Added the footplate, corner posts and top frame, domed bottles with strap rings and valves, the manifold with branches and the gauge (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic trailing-edge flap section on a jig',
    desc: (v) => `Trailing-edge flap, ${v.span} in span, lifted onto two jig stands: an aerofoil section with an internal rib at each end, three hinge brackets with pins, two track fairings underneath, a linear actuator with its rod and pad cushions on the stands.`,
    vs: [['span 60 in', 60], ['span 90 in', 90], ['span 130 in', 130], ['span 180 in', 180]].map(([l, span]) => { const C = 18 + span * 0.18; return [l, span + 24, C + 26, 58 + C * 0.14, 0, { span, C }]; }),
    build: (a, v) => {
      const S = v.span * IN, C = v.C * IN, x0 = a.X0 + 12 * IN, x1 = a.X1 - 12 * IN, yle = a.YF + 12 * IN, zb = a.Z0 + 36 * IN, af = [[0, 0], [0.05, 0.075], [0.3, 0.12], [0.62, 0.085], [1, 0.012], [1, -0.004], [0.6, -0.045], [0.25, -0.075], [0.04, -0.05]].map(([f, g]) => [yle + f * C, zb + g * C + 0.08 * C]);
      prismX(a, af, x0, x1); const zmid = zb + 0.08 * C;
      for (const x of [x0 + 20, x1 - 40]) prismX(a, af.map(([y, z]) => [y + (y > yle + C / 2 ? -C * 0.02 : C * 0.02), z]), x, x + 20);
      for (const f of [0.18, 0.5, 0.82]) { const x = x0 + (x1 - x0) * f; a.box(x - 2 * IN, yle + C * 0.3, zb - 5 * IN, x + 2 * IN, yle + C * 0.5, zmid - C * 0.06); a.xcyl(x - 2.4 * IN, x + 2.4 * IN, yle + C * 0.4, zb - 5 * IN, 0.8 * IN, 8); }
      for (const f of [0.33, 0.67]) { const x = x0 + (x1 - x0) * f; prismX(a, [[yle + C * 0.2, zmid - C * 0.06], [yle + C * 1.0, zmid - C * 0.05], [yle + C * 1.02, zb - 14 * IN + C * 0.02], [yle + C * 0.6, zb - 15 * IN], [yle + C * 0.25, zb - 8 * IN]], x - 1.6 * IN, x + 1.6 * IN); a.rect(x - 1.6 * IN, yle + C * 0.2, x + 1.6 * IN, yle + C * 1.02, 'EQUIP-DETAIL'); }
      const xa = x0 + (x1 - x0) * 0.5; a.tube([[xa, yle + C * 0.35, zb - 6 * IN], [xa, yle + C * 0.75, zmid - C * 0.04]], [1.3 * IN, 1.3 * IN], 8); a.tube([[xa, yle + C * 0.75, zmid - C * 0.04], [xa, yle + C * 0.85, zmid - C * 0.03]], [0.7 * IN, 0.7 * IN], 6);
      for (const jx of [x0 + (x1 - x0) * 0.1, x0 + (x1 - x0) * 0.9]) { a.box(jx - 4 * IN, yle - 2 * IN, a.Z0, jx + 4 * IN, yle + C + 2 * IN, a.Z0 + 3 * IN); for (const jy of [yle + C * 0.18, yle + C * 0.82]) { a.cyl(jx, jy, a.Z0 + 3 * IN, zb - 18 * IN, 1.3 * IN, 8); a.box(jx - 3 * IN, jy - 2.5 * IN, zb - 18 * IN, jx + 3 * IN, jy + 2.5 * IN, zb - 14 * IN); } a.rect(jx - 4 * IN, yle - 2 * IN, jx + 4 * IN, yle + C + 2 * IN, 'EQUIP-DETAIL'); }
      a.rect(x0, yle, x1, yle + C, 'EQUIP'); for (const f of [0.18, 0.5, 0.82]) a.rect(x0 + (x1 - x0) * f - 2 * IN, yle + C * 0.3, x0 + (x1 - x0) * f + 2 * IN, yle + C * 0.5, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the aerofoil flap section with end ribs, three hinge brackets with pins, two track fairings, the linear actuator and two cushioned jig stands (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic vertical tail fin assembly on a stand',
    desc: (v) => `Swept vertical tail fin, ${v.h} in tall, upright on a floor stand with its side to the front: a fixed fin with rib lines and a root fitting, a separate rudder on three hinges, a rounded tip fairing, side clamps and a base plate.`,
    vs: [['60 in tall', 60], ['90 in tall', 90], ['130 in tall', 130], ['200 in tall', 200]].map(([l, h]) => [l, h * 0.95, 34 + h * 0.25, h + 16, 0, { h }]),
    build: (a, v) => {
      const Hh = v.h * IN, cy = a.cy, t = Hh * 0.03, zb = a.Z0 + 10 * IN, x0 = a.X0 + 3 * IN, cw = a.W - 6 * IN, ztip = a.Z1 - Hh * 0.03 - 3 * IN, sw = (z) => x0 + 0.32 * (z - zb), zr = ztip - Hh * 0.05;
      prismY(a, [[x0, zb], [x0 + cw * 0.5, zb], [sw(ztip) + cw * 0.2, ztip], [sw(ztip), ztip]], cy - t, cy + t);
      prismY(a, [[x0 + cw * 0.55, zb + Hh * 0.04], [x0 + cw * 0.95, zb + Hh * 0.04], [sw(zr) + cw * 0.42, zr], [sw(zr) + cw * 0.24, zr]], cy - t * 0.8, cy + t * 0.8);
      a.ell(sw(ztip) + cw * 0.1, cy, ztip, cw * 0.14, t * 1.1, Hh * 0.03, 12, 6);
      const xte = (z) => x0 + cw * 0.5 + ((sw(ztip) + cw * 0.2) - (x0 + cw * 0.5)) * ((z - zb) / (ztip - zb));
      for (const f of [0.12, 0.5, 0.86]) { const z = zb + (ztip - zb) * f; a.box(xte(z) - cw * 0.02, cy - t * 1.3, z - 25, xte(z) + cw * 0.07, cy + t * 1.3, z + 25); }
      for (const f of [0.2, 0.4, 0.6, 0.8]) { const z = zb + (ztip - zb) * f; a.box(sw(z) + 10, cy - t * 1.04, z - 7, xte(z) - 10, cy + t * 1.04, z + 7); }
      a.box(x0 - 2 * IN, cy - t * 3, a.Z0 + 4 * IN, x0 + cw * 0.5, cy + t * 3, zb + 3 * IN); a.box(a.X0 + 2 * IN, a.YF + 2 * IN, a.Z0, a.X1 - 2 * IN, a.YB - 2 * IN, a.Z0 + 4 * IN);
      for (const px of [x0 + cw * 0.12, x0 + cw * 0.4]) for (const sy of [-1, 1]) { a.tube([[px, cy + sy * (t * 3 + 20), zb + 3 * IN], [px, cy + sy * (a.D / 2 - 4 * IN), a.Z0 + 4 * IN]], [Hh * 0.008 + 6, Hh * 0.008 + 6], 6); a.box(px - 40, cy + sy * t * 3 - 30 + (sy > 0 ? 0 : -t * 0), zb + 3 * IN - Hh * 0.04, px + 40, cy + sy * (t * 3 + 40), zb + 3 * IN); }
      a.rect(a.X0 + 2 * IN, a.YF + 2 * IN, a.X1 - 2 * IN, a.YB - 2 * IN, 'EQUIP-DETAIL'); a.rect(x0, cy - t, sw(ztip) + cw * 0.2, cy + t, 'EQUIP'); a.rect(x0 + cw * 0.55, cy - t * 0.8, sw(zr) + cw * 0.42, cy + t * 0.8, 'EQUIP'); a.rect(x0 - 2 * IN, cy - t * 3, x0 + cw * 0.5, cy + t * 3, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the swept fin with rib lines and root fitting, the separate rudder on three hinges, the tip fairing, four side clamps and the base plate (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic helicopter rotor hub with blade stubs',
    desc: (v) => `Main rotor head with ${v.bl} blades on a floor pedestal: a mast with a hub plate, a blade grip and pitch link for each blade, a swashplate with control rods and ${v.len} in tapered blade stubs with root bolts.`,
    vs: [['2 blades, 80 in stubs', 2, 80], ['3 blades, 100 in stubs', 3, 100], ['4 blades, 120 in stubs', 4, 120], ['5 blades, 150 in stubs', 5, 150]].map(([l, bl, len]) => [l, 2 * (len + 26) + 14, 2 * (len + 26) + 14, 96, 0, { bl, len }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, rh = 12 * IN, len = v.len * IN, zh = a.Z0 + 74 * IN, zs = a.Z0 + 52 * IN;
      a.box(cx - 24 * IN, cy - 24 * IN, a.Z0, cx + 24 * IN, cy + 24 * IN, a.Z0 + 8 * IN); a.cyl(cx, cy, a.Z0 + 8 * IN, a.Z0 + 40 * IN, 11 * IN, 20);
      for (let k = 0; k < 4; k++) { const g = (k / 4) * PI * 2 + PI / 4; a.tube([[cx + m.cos(g) * 20 * IN, cy + m.sin(g) * 20 * IN, a.Z0 + 8 * IN], [cx + m.cos(g) * 7 * IN, cy + m.sin(g) * 7 * IN, a.Z0 + 36 * IN]], [1.6 * IN, 1.6 * IN], 6); }
      a.cyl(cx, cy, a.Z0 + 40 * IN, zh + 4 * IN, 4.4 * IN, 16); a.cyl(cx, cy, zh - 3 * IN, zh + 3 * IN, rh, 22); a.cyl(cx, cy, zh + 3 * IN, zh + 6 * IN, 5 * IN, 16); a.cyl(cx, cy, zh + 6 * IN, zh + 7.5 * IN, 2.4 * IN, 10);
      a.cyl(cx, cy, zs - 1.5 * IN, zs + 1.5 * IN, 8.5 * IN, 24); a.cyl(cx, cy, zs + 1.5 * IN, zs + 4 * IN, 6.5 * IN, 24); ring3(a, [cx, cy, zs], [0, 0, 1], 8.6 * IN, 1 * IN, 24);
      for (let k = 0; k < v.bl; k++) { const g = (k / v.bl) * PI * 2 + 0.3, d = [m.cos(g), m.sin(g)], P = (r, z, o = 0) => [cx + d[0] * r - d[1] * o, cy + d[1] * r + d[0] * o, z];
        a.tube([P(rh * 0.7, zh), P(rh + 14 * IN, zh)], [3.4 * IN, 3.8 * IN], 12); a.tube([P(rh + 14 * IN, zh), P(rh + 16 * IN, zh)], [4.6 * IN, 4.6 * IN], 12);
        plateN(a, [P(rh + 16 * IN, zh + 0.7 * IN, -6 * IN), P(rh + 16 * IN + len, zh + 0.7 * IN + len * 0.09, -4.2 * IN), P(rh + 16 * IN + len, zh + 0.7 * IN + len * 0.09, 4.2 * IN), P(rh + 16 * IN, zh + 0.7 * IN, 6 * IN)], 3.2 * IN);
        for (const o of [-3.5 * IN, 3.5 * IN]) a.cyl(...[P(rh + 17.5 * IN, zh + 1 * IN, o)[0], P(rh + 17.5 * IN, zh + 1 * IN, o)[1], zh, zh + 2.4 * IN, 0.7 * IN, 6]);
        a.tube([P(8 * IN, zs + 4 * IN, 2 * IN), P(rh + 11 * IN, zh + 1 * IN, 3 * IN)], [0.7 * IN, 0.7 * IN], 5); a.tube([P(6 * IN, zs - 2 * IN, 0), P(6.4 * IN, a.Z0 + 36 * IN, 0)], [0.9 * IN, 0.9 * IN], 5);
        a.line(cx, cy, P(rh + 16 * IN + len, 0, 0)[0], P(rh + 16 * IN + len, 0, 0)[1], 'EQUIP-DETAIL'); a.poly([[P(rh + 16 * IN, 0, -6 * IN)[0], P(rh + 16 * IN, 0, -6 * IN)[1]], [P(rh + 16 * IN + len, 0, -4.2 * IN)[0], P(rh + 16 * IN + len, 0, -4.2 * IN)[1]], [P(rh + 16 * IN + len, 0, 4.2 * IN)[0], P(rh + 16 * IN + len, 0, 4.2 * IN)[1]], [P(rh + 16 * IN, 0, 6 * IN)[0], P(rh + 16 * IN, 0, 6 * IN)[1]]], 'EQUIP'); }
      a.circ(cx, cy, rh, 'EQUIP'); a.circ(cx, cy, 8.5 * IN, 'EQUIP-DETAIL'); a.rect(cx - 24 * IN, cy - 24 * IN, cx + 24 * IN, cy + 24 * IN, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the base pedestal on a plate, the mast, hub plate with a blade grip and pitch link per blade, the swashplate with control rods and the tapered blade stubs with root bolts (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic main landing gear bogie with brakes',
    desc: (v) => `Main gear leg with a ${v.wd} in wheel bogie, ${v.ax} axles and ${v.ax * 2} wheels: an oleo strut with a chrome piston, a bogie beam with pivot, torque links, a drag brace and side brace to the top fitting and a brake disc and hub on every wheel.`,
    vs: [['28 in wheels, 4 wheels', 28, 2], ['36 in wheels, 4 wheels', 36, 2], ['44 in wheels, 4 wheels', 44, 2], ['54 in wheels, 6 wheels', 54, 3]].map(([l, wd, ax]) => [l, wd * 1.55 + 6, (ax - 1) * wd * 1.25 + wd + 40, wd * 4.1, 0, { wd, ax }]),
    build: (a, v) => {
      const Rw = (v.wd / 2) * IN, cx = a.cx, ysp = Rw * 2.5, ys = Array.from({ length: v.ax }, (_, i) => a.cy + (i - (v.ax - 1) / 2) * ysp), xw = Rw * 0.75, zc = a.Z0 + Rw, zp = zc + Rw * 0.9, ztop = a.Z1 - Rw * 0.18;
      for (const y of ys) for (const sx of [-1, 1]) { a.xcyl(cx + sx * xw - Rw * 0.3, cx + sx * xw + Rw * 0.3, y, zc, Rw, 22); a.xcyl(cx + sx * xw - Rw * 0.33, cx + sx * xw + Rw * 0.33, y, zc, Rw * 0.55, 16); a.xcyl(cx + sx * xw - Rw * 0.4, cx + sx * xw + Rw * 0.4, y, zc, Rw * 0.22, 10); a.rect(cx + sx * xw - Rw * 0.3, y - Rw, cx + sx * xw + Rw * 0.3, y + Rw, 'EQUIP'); }
      for (const y of ys) a.xcyl(cx - xw - Rw * 0.4, cx + xw + Rw * 0.4, y, zc, Rw * 0.1, 10);
      a.tube([[cx, ys[0], zp], [cx, ys[ys.length - 1], zp]], [Rw * 0.16, Rw * 0.16], 10); a.box(cx - Rw * 0.2, ys[0] - Rw * 0.3, zc, cx + Rw * 0.2, ys[ys.length - 1] + Rw * 0.3, zp);
      a.cyl(cx, a.cy, zp, zp + Rw * 0.5, Rw * 0.2, 14); a.cyl(cx, a.cy, zp + Rw * 0.5, zp + Rw * 1.5, Rw * 0.15, 14); a.cyl(cx, a.cy, zp + Rw * 1.5, ztop - Rw * 0.1, Rw * 0.26, 18); a.cyl(cx, a.cy, ztop - Rw * 0.1, ztop, Rw * 0.3, 18);
      a.xcyl(cx - Rw * 0.4, cx + Rw * 0.4, a.cy, ztop - Rw * 0.1, Rw * 0.16, 12); a.box(cx - Rw * 0.5, a.cy - Rw * 0.3, ztop - Rw * 0.05, cx + Rw * 0.5, a.cy + Rw * 0.3, ztop + 1);
      const ph = zp + Rw * 0.9; a.tube([[cx - Rw * 0.12, a.cy + Rw * 0.14, zp + Rw * 0.5], [cx - Rw * 0.12, a.cy + Rw * 0.5, ph - Rw * 0.1], [cx - Rw * 0.12, a.cy + Rw * 0.18, ph + Rw * 0.35]], [Rw * 0.045, Rw * 0.045, Rw * 0.045], 6);
      a.tube([[cx + Rw * 0.12, a.cy - Rw * 0.14, zp + Rw * 0.5], [cx + Rw * 0.12, a.cy - Rw * 0.5, ph - Rw * 0.1], [cx + Rw * 0.12, a.cy - Rw * 0.18, ph + Rw * 0.35]], [Rw * 0.045, Rw * 0.045, Rw * 0.045], 6);
      a.tube([[cx, a.cy + Rw * 0.26, ztop - Rw * 0.1], [cx, a.cy + Rw * 1.0, zp + Rw * 0.2]], [Rw * 0.07, Rw * 0.07], 6); a.tube([[cx - Rw * 0.26, a.cy, ztop - Rw * 0.2], [cx - Rw * 1.0, a.cy, zp + Rw * 0.3]], [Rw * 0.06, Rw * 0.06], 6);
      a.circ(cx, a.cy, Rw * 0.26, 'EQUIP'); a.circ(cx, a.cy, Rw * 0.15, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the wheels with hubs and brake discs on every axle, the bogie beam and pivot, oleo strut with piston, torque links, drag brace, side brace and top fitting (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic bare turbofan engine on a transport stand',
    desc: (v) => `Bare engine with a ${v.fan} in fan on a wheeled transport stand, nose to the front: an open fan case with eighteen blades behind a spinner, a core cowl with a gearbox pod and a pipe, a core exhaust cone, two cradles on a base frame and four casters.`,
    vs: [['40 in fan', 40], ['60 in fan', 60], ['84 in fan', 84], ['110 in fan', 110]].map(([l, fan]) => [l, fan * 1.3 + 12, fan * 2.5 + 12, fan * 1.5 + 22, 0, { fan }]),
    build: (a, v) => {
      const Rf = (v.fan / 2) * IN, cx = a.cx, L = Rf * 2 * 2.0, y0 = a.YF + 10 * IN, zc = a.Z0 + 11 * IN + Rf * 1.1 + 5 * IN;
      turbofan(a, cx, zc, y0, Rf, L, false);
      a.box(a.X0 + 2 * IN, y0 - 2 * IN, a.Z0 + 8 * IN, a.X1 - 2 * IN, a.YB - 4 * IN, a.Z0 + 11 * IN); a.box(a.X0 + 2 * IN, y0 - 2 * IN, a.Z0 + 8 * IN, a.X0 + 5 * IN, a.YB - 4 * IN, a.Z0 + 14 * IN); a.box(a.X1 - 5 * IN, y0 - 2 * IN, a.Z0 + 8 * IN, a.X1 - 2 * IN, a.YB - 4 * IN, a.Z0 + 14 * IN);
      for (const yy of [y0 + L * 0.2, y0 + L * 0.72]) { saddleY(a, yy, 5 * IN, Rf * 1.1, zc, cx, a.Z0 + 11 * IN); a.rect(cx - Rf * 1.1, yy - 2.5 * IN, cx + Rf * 1.1, yy + 2.5 * IN, 'EQUIP-DETAIL'); }
      for (const sx of [-1, 1]) for (const yy of [y0 + 3 * IN, a.YB - 8 * IN]) { a.cyl(a.cx + sx * (a.W / 2 - 4 * IN), yy, a.Z0 + 4 * IN, a.Z0 + 8 * IN, 0.8 * IN, 6); a.xcyl(a.cx + sx * (a.W / 2 - 4 * IN) - 0.8 * IN, a.cx + sx * (a.W / 2 - 4 * IN) + 0.8 * IN, yy, a.Z0 + 2.2 * IN, 2.2 * IN, 10); }
      a.poly([[cx - Rf * 1.04, y0 + L * 0.14], [cx + Rf * 1.04, y0 + L * 0.14], [cx + Rf * 0.52, y0 + L * 1.0], [cx - Rf * 0.52, y0 + L * 1.0]], 'EQUIP'); a.circ(cx, y0 + L * 0.06, Rf, 'EQUIP-DETAIL'); a.rect(a.X0 + 2 * IN, y0 - 2 * IN, a.X1 - 2 * IN, a.YB - 4 * IN, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the open fan case with eighteen blades and spinner, the core cowl with gearbox pod and pipe, the exhaust cone, two cradles, the base frame and four casters (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/structures', title: 'Generic lattice grid fin on an actuator post',
    desc: (v) => `Grid fin, ${v.size} in across, standing on a post: an outer frame with a lattice of crossing cell walls, a hinge shaft with bearing blocks, an actuator housing with a horn arm, a column and a footplate.`,
    vs: [['24 in fin', 24], ['52 in fin', 52]].map(([l, size]) => [l, size * 2.0, size * 0.7, size * 1.36, 0, { size }]),
    build: (a, v) => {
      const S = v.size * IN, cx = a.cx + v.size * IN * 0.2, cy = a.cy, zb = a.Z0 + S * 0.55, h = S * 0.78, w = S, dp = S * 0.22, n = 6, t = S * 0.012;
      a.frame(cx - w / 2, zb, cx + w / 2, zb + h, cy - dp / 2, cy + dp / 2, S * 0.05);
      for (let i = 1; i < n; i++) { const x = cx - w / 2 + (w * i) / n; a.box(x - t, cy - dp / 2, zb, x + t, cy + dp / 2, zb + h); }
      for (let j = 1; j < n; j++) { const z = zb + (h * j) / n; a.box(cx - w / 2, cy - dp / 2, z - t, cx + w / 2, cy + dp / 2, z + t); }
      a.xcyl(cx - w / 2 - S * 0.25, cx - w / 2 + S * 0.04, cy, zb + h * 0.5, S * 0.035, 12); a.box(cx - w / 2 - S * 0.06, cy - S * 0.07, zb + h * 0.5 - S * 0.07, cx - w / 2 + S * 0.04, cy + S * 0.07, zb + h * 0.5 + S * 0.07);
      a.box(cx - w / 2 - S * 0.5, cy - S * 0.12, zb + h * 0.5 - S * 0.1, cx - w / 2 - S * 0.22, cy + S * 0.12, zb + h * 0.5 + S * 0.1); a.tube([[cx - w / 2 - S * 0.36, cy, zb + h * 0.5 + S * 0.1], [cx - w / 2 - S * 0.36, cy - S * 0.12, zb + h * 0.5 + S * 0.3]], [S * 0.015, S * 0.015], 5);
      a.cyl(cx - w / 2 - S * 0.36, cy, a.Z0 + S * 0.06, zb + h * 0.5 - S * 0.1, S * 0.07, 14); a.box(cx - w / 2 - S * 0.6, cy - S * 0.2, a.Z0, cx - w / 2 - S * 0.12, cy + S * 0.2, a.Z0 + S * 0.06);
      a.tube([[cx + w / 2 - S * 0.1, cy, zb], [cx + w / 2 + S * 0.05, cy, a.Z0 + S * 0.06]], [S * 0.03, S * 0.03], 6); a.box(cx + w / 2 - S * 0.12, cy - S * 0.16, a.Z0, cx + w / 2 + S * 0.2, cy + S * 0.16, a.Z0 + S * 0.06);
      a.box(cx - w / 2, cy - dp / 2, zb, cx + w / 2, cy + dp / 2, zb + 4); a.rect(cx - w / 2, cy - dp / 2, cx + w / 2, cy + dp / 2, 'EQUIP'); for (let i = 1; i < n; i++) a.line(cx - w / 2 + (w * i) / n, cy - dp / 2, cx - w / 2 + (w * i) / n, cy + dp / 2, 'EQUIP-DETAIL'); a.rect(cx - w / 2 - S * 0.6, cy - S * 0.2, cx - w / 2 - S * 0.12, cy + S * 0.2, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the outer frame with a six by six lattice of cell walls, the hinge shaft and bearing blocks, the actuator housing with horn arm, the column and the two footplates (plan and 3D).');
    } }),

  // ===================================================== ground =====================================================
  fam({ cat: 'aerospace/ground', title: 'Generic thermal vacuum test chamber',
    desc: (v) => `Horizontal vacuum chamber, ${v.dia} in across and ${v.len} ft long, door end to the front: a domed hinged door with a bolt ring and a viewport, a fixed rear dome, three pump stubs on top, three saddles on a base frame, a control rack beside it and a roughing pump skid behind.`,
    vs: [['60 in chamber, 8 ft', 60, 8], ['96 in chamber, 12 ft', 96, 12], ['144 in chamber, 16 ft', 144, 16], ['216 in chamber, 22 ft', 216, 22]].map(([l, dia, len]) => [l, dia + 62, len * 12 + dia * 0.62 + 50, dia + 66, 0, { dia, len }]),
    build: (a, v) => {
      const R = (v.dia / 2) * IN, L = v.len * 12 * IN, cx = a.cx - 10 * IN, zc = a.Z0 + 22 * IN + R, yf = a.YF + 12 * IN + R * 0.3, yb = yf + L;
      a.ycyl(yf, yb, cx, zc, R, 36); a.ell(cx, yf, zc, R, R * 0.3, R, 30, 10); a.ell(cx, yb, zc, R, R * 0.3, R, 30, 10);
      a.ycyl(yf - R * 0.04, yf + R * 0.06, cx, zc, R * 1.08, 36); a.ycyl(yf + 4, yf + R * 0.1, cx, zc, R * 1.1, 36);
      for (let k = 0; k < 24; k++) { const g = (k / 24) * PI * 2; a.ycyl(yf - R * 0.06, yf + R * 0.1, cx + m.cos(g) * R * 1.04, zc + m.sin(g) * R * 1.04, R * 0.018, 6); }
      a.ycyl(yf - R * 0.3, yf - R * 0.2, cx, zc + R * 0.25, R * 0.16, 14); a.ycyl(yf - R * 0.32, yf - R * 0.3, cx, zc + R * 0.25, R * 0.19, 14);
      a.box(cx + R * 1.08, yf - R * 0.02, zc - R * 0.5, cx + R * 1.24, yf + R * 0.12, zc + R * 0.5); a.box(cx + R * 1.08, yf - R * 0.04, zc - R * 0.06, cx + R * 1.34, yf, zc + R * 0.06); a.ycyl(yf - R * 0.12, yf - R * 0.04, cx - R * 0.5, zc - R * 0.2, R * 0.04, 8);
      for (const f of [0.22, 0.5, 0.78]) { const y = yf + L * f; a.cyl(cx, y, zc + R * 0.95, zc + R * 1.32, R * 0.16, 16); a.cyl(cx, y, zc + R * 1.32, zc + R * 1.38, R * 0.2, 16); a.circ(cx, y, R * 0.16, 'EQUIP-DETAIL'); }
      for (const f of [0.1, 0.5, 0.9]) { const y = yf + L * f; saddleY(a, y, R * 0.12, R, zc, cx, a.Z0 + 14 * IN); a.box(cx - R * 1.0, y - R * 0.08, a.Z0, cx + R * 1.0, y + R * 0.08, a.Z0 + 14 * IN); }
      a.box(a.X1 - 28 * IN, a.YF + 20 * IN, a.Z0, a.X1 - 4 * IN, a.YF + 40 * IN, a.Z0 + 74 * IN); for (let k = 0; k < 6; k++) a.box(a.X1 - 27 * IN, a.YF + 39.5 * IN, a.Z0 + (6 + k * 11) * IN, a.X1 - 5 * IN, a.YF + 40.5 * IN, a.Z0 + (6 + k * 11 + 8) * IN);
      a.box(cx - 24 * IN, yb + R * 0.35, a.Z0, cx + 24 * IN, yb + R * 0.35 + 30 * IN, a.Z0 + 28 * IN); a.cyl(cx - 10 * IN, yb + R * 0.35 + 15 * IN, a.Z0 + 28 * IN, a.Z0 + 36 * IN, 6 * IN, 12);
      a.circ(cx, yf + L * 0.22, R * 0.16, 'EQUIP-DETAIL'); a.rect(cx - R, yf, cx + R, yb, 'EQUIP'); a.ellp(cx, yf, R, R * 0.3, 'EQUIP'); a.ellp(cx, yb, R, R * 0.3, 'EQUIP'); a.rect(a.X1 - 28 * IN, a.YF + 20 * IN, a.X1 - 4 * IN, a.YF + 40 * IN, 'EQUIP-DETAIL'); a.rect(cx - 24 * IN, yb + R * 0.35, cx + 24 * IN, yb + R * 0.35 + 30 * IN, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the cylindrical chamber with domed hinged door, bolt ring and viewport, rear dome, three pump stubs, three saddles with base beams, the control rack and the roughing pump (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic vibration shaker table on trunnion yoke',
    desc: (v) => `Electrodynamic shaker for payload testing with a ${v.h} in round head table: a tall armature body on trunnion pins in a U yoke, a head with a ring of mounting inserts, four air isolators under a base frame, a cooling duct to a blower and a drive cable tray.`,
    vs: [['12 in head', 12], ['20 in head', 20], ['30 in head', 30], ['44 in head', 44]].map(([l, h]) => [l, h * 5.5 + 20, h * 3.2 + 20, h * 1.95 + 10, 0, { h }]),
    build: (a, v) => {
      const Hh = v.h * IN, cx = a.X0 + 1.85 * Hh + 10 * IN, cy = a.cy, Rb = Hh * 0.9, zb = a.Z0 + Hh * 0.45, zt = zb + Hh * 1.4, xb = Rb + Hh * 0.45;
      a.box(cx - Rb * 1.9, cy - Rb * 1.5, a.Z0 + Hh * 0.2, cx + Rb * 1.9, cy + Rb * 1.5, zb - Hh * 0.05); for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { a.cyl(cx + sx * Rb * 1.5, cy + sy * Rb * 1.2, a.Z0, a.Z0 + Hh * 0.2, Hh * 0.14, 14); a.cyl(cx + sx * Rb * 1.5, cy + sy * Rb * 1.2, a.Z0 + Hh * 0.2 - 4, a.Z0 + Hh * 0.2 + 4, Hh * 0.18, 14); a.circ(cx + sx * Rb * 1.5, cy + sy * Rb * 1.2, Hh * 0.14, 'EQUIP-DETAIL'); }
      for (const sx of [-1, 1]) { a.box(cx + sx * xb - Hh * 0.1, cy - Hh * 0.35, zb - Hh * 0.05, cx + sx * xb + Hh * 0.1, cy + Hh * 0.35, zb + Hh * 1.12); a.xcyl(cx + sx * Rb, cx + sx * xb, cy, zb + Hh * 0.7, Hh * 0.12, 14); }
      a.cyl(cx, cy, zb, zt - Hh * 0.2, Rb, 32); band(a, cx, cy, zb + Hh * 0.45, Rb * 1.03, Hh * 0.06, 32); band(a, cx, cy, zb + Hh * 0.95, Rb * 1.03, Hh * 0.06, 32);
      a.cone(cx, cy, zt - Hh * 0.2, zt - Hh * 0.04, Rb * 0.62, Hh * 0.5, 28); a.cyl(cx, cy, zt - Hh * 0.04, zt + Hh * 0.04, Hh * 0.5, 36); for (let k = 0; k < 12; k++) { const g = (k / 12) * PI * 2; a.cyl(cx + m.cos(g) * Hh * 0.38, cy + m.sin(g) * Hh * 0.38, zt + Hh * 0.04, zt + Hh * 0.075, Hh * 0.022, 6); }
      a.cyl(cx, cy, zt + Hh * 0.04, zt + Hh * 0.075, Hh * 0.05, 10);
      const bx = cx + Rb * 2.4 + Hh * 0.3; a.box(bx, cy - Hh * 0.45, a.Z0, bx + Hh * 1.2, cy + Hh * 0.45, Hh * 1.1 + a.Z0); a.tube([[cx + Rb, cy + Rb * 0.2, zb + Hh * 0.6], [cx + Rb * 1.5, cy + Rb * 0.2, zb + Hh * 0.6], [bx, cy, a.Z0 + Hh * 0.7]], [Hh * 0.13, Hh * 0.13, Hh * 0.13], 12); a.cyl(bx + Hh * 0.6, cy, a.Z0 + Hh * 1.1, a.Z0 + Hh * 1.2, Hh * 0.3, 16);
      a.box(cx - Rb * 1.2, cy + Rb * 1.5, a.Z0, cx + Rb * 0.4, cy + Rb * 1.5 + Hh * 0.2, a.Z0 + Hh * 0.12); a.circ(cx, cy, Rb, 'EQUIP'); a.circ(cx, cy, Hh * 0.5, 'EQUIP-DETAIL'); a.rect(cx - Rb * 1.9, cy - Rb * 1.5, cx + Rb * 1.9, cy + Rb * 1.5, 'EQUIP-DETAIL'); a.rect(bx, cy - Hh * 0.45, bx + Hh * 1.2, cy + Hh * 0.45, 'EQUIP'); a.outline('EQUIP-HIDDEN');
      a.log('Added the base frame on four air isolators, the yoke with trunnion pins, the armature body with bands, the head with a ring of inserts, the cooling duct to the blower and the cable tray (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic cleanroom air shower enclosure',
    desc: (v) => `Air shower enclosure at a cleanroom entry for ${v.lab}: panelled walls on a threshold sill, a front door with a window and lever handle, ${v.nz} nozzle strips on each side wall, a roof plenum with a filter plate, a status light bar and a control panel by the door.`,
    vs: [['one person', 'one person', 44, 48, 92, 4], ['two people', 'two people', 68, 48, 92, 6], ['cart through', 'a trolley', 96, 76, 100, 8]].map(([l, lab, w, d, h, nz]) => [l, w, d, h, 0, { lab, nz }]),
    build: (a, v) => {
      const x0 = a.X0, x1 = a.X1, yf = a.YF, yb = a.YB, th = 3 * IN, zr = a.Z1 - 12 * IN;
      a.box(x0, yf, a.Z0, x1, yb, a.Z0 + 3 * IN); a.box(x0, yb - th, a.Z0 + 3 * IN, x1, yb, zr); a.box(x0, yf + 6 * IN, a.Z0 + 3 * IN, x0 + th, yb - th, zr); a.box(x1 - th, yf + 6 * IN, a.Z0 + 3 * IN, x1, yb - th, zr); a.box(x0, yf, zr - 12 * IN + 12 * IN - 4 * IN, x1, yb, zr);
      a.box(x0 + 2 * IN, yf, a.Z0 + 3 * IN, x0 + 8 * IN, yf + th, zr - 2 * IN); a.box(x1 - 8 * IN, yf, a.Z0 + 3 * IN, x1 - 2 * IN, yf + th, zr - 2 * IN);
      a.frame(x0 + 8 * IN, a.Z0 + 3 * IN, x1 - 8 * IN, zr - 4 * IN, yf, yf + th, 2.4 * IN); a.box(x0 + 11 * IN, yf + 0.5 * IN, a.Z0 + 5 * IN, x1 - 11 * IN, yf + 1.2 * IN, zr - 7 * IN); a.frame(x0 + 14 * IN, a.Z0 + 44 * IN, x1 - 14 * IN, a.Z0 + 70 * IN, yf - 0.6 * IN, yf + th, 1.2 * IN);
      a.box(x1 - 14 * IN, yf - 2 * IN, a.Z0 + 36 * IN, x1 - 12 * IN, yf, a.Z0 + 38 * IN); a.box(x1 - 20 * IN, yf - 3 * IN, a.Z0 + 35 * IN, x1 - 12 * IN, yf - 1.2 * IN, a.Z0 + 37 * IN);
      a.box(x0, yf, zr, x1, yb, a.Z1); a.box(x0 + 3 * IN, yf + 3 * IN, a.Z1, x1 - 3 * IN, yb - 3 * IN, a.Z1 + 0.01); a.box(x0 + 6 * IN, yf + 6 * IN, zr + 1, x1 - 6 * IN, yb - 6 * IN, a.Z1 + 0);
      a.box(x0 + 5 * IN, yf - 1.6 * IN, zr + 1 * IN, x1 - 5 * IN, yf, zr + 4 * IN); for (let k = 0; k < 5; k++) { const x = x0 + 9 * IN + ((x1 - x0 - 18 * IN) * k) / 4; a.cyl(x, yf - 1 * IN, zr + 4 * IN - 20, zr + 4 * IN, 1.4 * IN, 8); }
      for (const sx of [-1, 1]) for (let k = 0; k < v.nz; k++) { const zz = a.Z0 + 18 * IN + (k * (zr - a.Z0 - 30 * IN)) / (v.nz - 1), xs = sx < 0 ? x0 + th : x1 - th; a.xcyl(xs - (sx < 0 ? 0 : 2.2 * IN), xs + (sx < 0 ? 2.2 * IN : 0), (yf + yb) / 2 + 4 * IN, zz, 1.1 * IN, 8); }
      a.outline('EQUIP'); a.rect(x0 + th, yf + 6 * IN, x1 - th, yb - th, 'EQUIP-DETAIL'); a.line(x0 + 8 * IN, yf, x1 - 8 * IN, yf, 'EQUIP-DETAIL'); a.arc(x1 - 8 * IN, yf, (x1 - x0 - 16 * IN), PI / 2 + 0.2, PI, 'EQUIP-SWING');
      a.log('Added the sill and panelled walls, the front door with window and handle, the side nozzle strips, the roof plenum with filter plate and the status light bar (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic satellite turnover fixture ring',
    desc: (v) => `Rotating assembly ring for a spacecraft, ${v.ring} in ring: a tube ring with four spokes and a central clamp plate with six bolts, two trunnion hubs in A-frame uprights on base beams, a worm gearbox with a hand wheel and a pin lock.`,
    vs: [['60 in ring', 60], ['96 in ring', 96], ['144 in ring', 144], ['200 in ring', 200]].map(([l, ring]) => [l, ring * 1.55, ring * 0.7 + 30, ring * 1.4, 0, { ring }]),
    build: (a, v) => {
      const R = (v.ring / 2) * IN, cx = a.cx, cy = a.cy, zc = a.Z0 + R * 1.18, xb = R + R * 0.14, hy = R * 0.3;
      a.tube(Array.from({ length: 41 }, (_, i) => [cx + m.cos((i / 40) * PI * 2) * R, cy, zc + m.sin((i / 40) * PI * 2) * R]), Array(41).fill(R * 0.04), 8); a.tube(Array.from({ length: 41 }, (_, i) => [cx + m.cos((i / 40) * PI * 2) * R * 0.9, cy, zc + m.sin((i / 40) * PI * 2) * R * 0.9]), Array(41).fill(R * 0.015), 5);
      for (let k = 0; k < 4; k++) { const g = (k / 4) * PI * 2 + PI / 4; a.tube([[cx, cy, zc], [cx + m.cos(g) * R, cy, zc + m.sin(g) * R]], [R * 0.025, R * 0.025], 6); }
      a.ycyl(cy - R * 0.03, cy + R * 0.03, cx, zc, R * 0.36, 26); for (let k = 0; k < 6; k++) { const g = (k / 6) * PI * 2; a.ycyl(cy - R * 0.08, cy + R * 0.03, cx + m.cos(g) * R * 0.27, zc + m.sin(g) * R * 0.27, R * 0.022, 6); } a.ycyl(cy - R * 0.1, cy + R * 0.1, cx, zc, R * 0.1, 14);
      for (const sx of [-1, 1]) { a.xcyl(cx + sx * R, cx + sx * xb, cy, zc, R * 0.07, 14); a.xcyl(cx + sx * xb, cx + sx * (xb + R * 0.06), cy, zc, R * 0.11, 14);
        for (const sy of [-1, 1]) a.tube([[cx + sx * xb, cy + sy * R * 0.05, zc - R * 0.04], [cx + sx * xb, cy + sy * hy, a.Z0 + R * 0.08]], [R * 0.035, R * 0.035], 8); a.tube([[cx + sx * xb, cy - hy, a.Z0 + R * 0.08], [cx + sx * xb, cy + hy, a.Z0 + R * 0.08]], [R * 0.04, R * 0.04], 8); a.box(cx + sx * xb - R * 0.1, cy - hy - R * 0.06, a.Z0, cx + sx * xb + R * 0.1, cy + hy + R * 0.06, a.Z0 + R * 0.06); a.rect(cx + sx * xb - R * 0.1, cy - hy - R * 0.06, cx + sx * xb + R * 0.1, cy + hy + R * 0.06, 'EQUIP'); }
      a.box(cx + xb + R * 0.06, cy - R * 0.14, zc - R * 0.3, cx + xb + R * 0.3, cy + R * 0.14, zc + R * 0.02); ring3(a, [cx + xb + R * 0.18, cy - R * 0.18, zc - R * 0.14], [0, 1, 0], R * 0.14, R * 0.014, 18); a.tube([[cx + xb + R * 0.18, cy - R * 0.14, zc - R * 0.14], [cx + xb + R * 0.18, cy - R * 0.2, zc - R * 0.14]], [R * 0.02, R * 0.02], 6);
      a.tube([[cx - xb - R * 0.12, cy, zc], [cx - xb - R * 0.12, cy + R * 0.12, zc + R * 0.3]], [R * 0.018, R * 0.018], 5);
      a.circ(cx, cy, R, 'EQUIP-DETAIL'); a.rect(cx - R, cy - R * 0.045, cx + R, cy + R * 0.045, 'EQUIP'); a.outline('EQUIP-HIDDEN');
      a.log('Added the tube ring with four spokes and bolted clamp plate, two trunnion hubs in A-frame uprights on base beams, the worm gearbox with hand wheel and the pin lock (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic portal gantry crane on casters',
    desc: (v) => `Portable lifting portal, ${v.span} ft span and ${v.t} ton capacity: two A-frame legs on foot beams with casters, an I-section bridge beam, a hoist trolley on the beam with a hook block and wire rope, stop plates at the beam ends and a hanging pendant.`,
    vs: [['12 ft span, 2 ton', 12, 2], ['18 ft span, 5 ton', 18, 5], ['26 ft span, 10 ton', 26, 10], ['36 ft span, 20 ton', 36, 20]].map(([l, span, t]) => [l, span * 12 + 30, 54 + t * 2.2, span * 12 * 0.62 + 96, 0, { span, t }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, xl = a.X0 + 14 * IN, xr = a.X1 - 14 * IN, zt = a.Z1 - 16 * IN, fy = a.D / 2 - 6 * IN, bw = 5 * IN + v.t * 0.12 * IN;
      for (const x of [xl, xr]) { a.box(x - 3 * IN, cy - fy, a.Z0 + 8 * IN, x + 3 * IN, cy + fy, a.Z0 + 14 * IN); for (const sy of [-1, 1]) { a.tube([[x, cy + sy * fy * 0.9, a.Z0 + 14 * IN], [x, cy + sy * 4 * IN, zt - 8 * IN]], [2 * IN + v.t * 0.06 * IN, 2 * IN + v.t * 0.06 * IN], 8); a.cyl(x, cy + sy * fy * 0.9, a.Z0 + 3.5 * IN, a.Z0 + 8 * IN, 0.7 * IN, 6); a.xcyl(x - 1.2 * IN, x + 1.2 * IN, cy + sy * fy * 0.9, a.Z0 + 2.4 * IN, 2.4 * IN, 10); }
        a.box(x - 4 * IN, cy - 5 * IN, zt - 10 * IN, x + 4 * IN, cy + 5 * IN, zt); braceYZ(a, x, cy - fy * 0.9, cy + fy * 0.9, a.Z0 + 14 * IN, a.Z0 + 14 * IN + 0, 1); a.tube([[x, cy - fy * 0.45, a.Z0 + (zt - a.Z0) * 0.4], [x, cy + fy * 0.45, a.Z0 + (zt - a.Z0) * 0.4]], [1.2 * IN, 1.2 * IN], 6); a.rect(x - 3 * IN, cy - fy, x + 3 * IN, cy + fy, 'EQUIP'); }
      a.box(xl - 8 * IN, cy - bw / 2 + 0, zt, xr + 8 * IN, cy + bw / 2, zt + 1.2 * IN); a.box(xl - 8 * IN, cy - 0.4 * IN, zt + 1.2 * IN, xr + 8 * IN, cy + 0.4 * IN, zt + 7 * IN + v.t * 0.12 * IN); a.box(xl - 8 * IN, cy - bw / 2, zt + 7 * IN + v.t * 0.12 * IN, xr + 8 * IN, cy + bw / 2, zt + 8.2 * IN + v.t * 0.12 * IN);
      const tx = cx + (xr - xl) * 0.12, zbr = zt + 8.2 * IN + v.t * 0.12 * IN; a.box(tx - 8 * IN, cy - bw * 0.7, zbr, tx + 8 * IN, cy + bw * 0.7, zbr + 6 * IN); a.cyl(tx, cy, zbr + 6 * IN, zbr + 9 * IN, 3 * IN, 12);
      for (const sx of [-1, 1]) a.box(xr + 8 * IN - 1.2 * IN, cy - bw / 2, zt - 2 * IN, xr + 8 * IN, cy + bw / 2, zt + 9 * IN + v.t * 0.12 * IN); a.box(xl - 8 * IN, cy - bw / 2, zt - 2 * IN, xl - 8 * IN + 1.2 * IN, cy + bw / 2, zt + 9 * IN + v.t * 0.12 * IN);
      a.tube([[tx - 1.5 * IN, cy, zbr], [tx - 1.5 * IN, cy, a.Z0 + 36 * IN]], [0.5 * IN, 0.5 * IN], 4); a.tube([[tx + 1.5 * IN, cy, zbr], [tx + 1.5 * IN, cy, a.Z0 + 36 * IN]], [0.5 * IN, 0.5 * IN], 4); a.box(tx - 3.5 * IN, cy - 2 * IN, a.Z0 + 28 * IN, tx + 3.5 * IN, cy + 2 * IN, a.Z0 + 36 * IN); a.tube([[tx, cy, a.Z0 + 28 * IN], [tx, cy, a.Z0 + 22 * IN], [tx + 1.6 * IN, cy, a.Z0 + 20 * IN]], [1 * IN, 1.1 * IN, 0.8 * IN], 8);
      a.tube([[tx + 8 * IN, cy + 2 * IN, zbr + 1 * IN], [tx + 8 * IN, cy + 5 * IN, a.Z0 + 54 * IN]], [0.3 * IN, 0.3 * IN], 4); a.box(tx + 6.5 * IN, cy + 3.5 * IN, a.Z0 + 48 * IN, tx + 9.5 * IN, cy + 6.5 * IN, a.Z0 + 54 * IN);
      a.line(xl - 8 * IN, cy, xr + 8 * IN, cy, 'EQUIP-DETAIL'); a.rect(tx - 8 * IN, cy - bw * 0.7, tx + 8 * IN, cy + bw * 0.7, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the two A-frame legs on foot beams with casters, the I-section bridge with end stops, the hoist trolley with wire rope and hook block and the pendant (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic cryogenic dewar service cart',
    desc: (v) => `Wheeled liquid-gas dewar, ${v.l} litre: an upright insulated vessel with dished ends and a collar ring on a trolley with two large wheels and two swivel casters, three hand-wheel valves on a manifold, a gauge, a vent stack with a relief valve, a hose coil and a push handle.`,
    vs: [['50 litre', 50, 14, 30], ['100 litre', 100, 18, 38], ['230 litre', 230, 24, 52], ['500 litre', 500, 30, 66]].map(([l, lit, dia, ht]) => [l, dia + 14, dia + 26, ht + 34, 0, { l: lit, dia, ht }]),
    build: (a, v) => {
      const R = (v.dia / 2) * IN, ht = v.ht * IN, cx = a.cx, cy = a.cy - 4 * IN, zb = a.Z0 + 7 * IN;
      a.box(cx - R * 1.04, cy - R * 1.04, zb, cx + R * 1.04, cy + R * 1.04, zb + 2 * IN); a.cyl(cx, cy, zb + 2 * IN, zb + ht, R, 30); a.ell(cx, cy, zb + 2 * IN + R * 0.25, R, R, R * 0.4, 24, 6); a.ell(cx, cy, zb + ht - R * 0.1, R, R, R * 0.4, 24, 6); band(a, cx, cy, zb + ht * 0.5, R * 1.03, 1.2 * IN, 30); a.cyl(cx, cy, zb + 2 * IN, zb + 8 * IN, R * 1.01, 30);
      a.cyl(cx, cy, zb + ht + R * 0.1, zb + ht + 9 * IN, 1.6 * IN, 10); a.cyl(cx + R * 0.5, cy, zb + ht + R * 0.1, zb + ht + 5 * IN, 1.1 * IN, 8); a.ell(cx + R * 0.5, cy, zb + ht + 5 * IN, 1.7 * IN, 1.7 * IN, 1.2 * IN, 8, 5);
      for (let k = 0; k < 3; k++) { const x = cx - R * 0.55 + k * R * 0.55; a.tube([[x, cy - R, zb + ht * 0.62], [x, cy - R - 5 * IN, zb + ht * 0.62]], [1 * IN, 1 * IN], 6); ring3(a, [x, cy - R - 5.4 * IN, zb + ht * 0.62], [0, 1, 0], 2.2 * IN, 0.4 * IN, 12); a.circ(x, cy - R - 5 * IN, 1.2 * IN, 'EQUIP-DETAIL'); }
      a.tube([[cx - R * 0.8, cy - R, zb + ht * 0.62], [cx + R * 0.8, cy - R, zb + ht * 0.62]], [0.8 * IN, 0.8 * IN], 6); a.ycyl(cy - R - 3 * IN, cy - R, cx + R * 0.72, zb + ht * 0.78, 2.4 * IN, 14);
      ring3(a, [cx - R * 1.0, cy, zb + ht * 0.3], [1, 0, 0], 3.4 * IN, 0.5 * IN, 14);
      for (const sx of [-1, 1]) { a.xcyl(cx + sx * (R * 1.05) - 0.8 * IN, cx + sx * (R * 1.05) + 0.8 * IN, cy + R * 0.7, a.Z0 + 5.5 * IN, 5.5 * IN, 16); a.cyl(cx + sx * R * 0.9, cy - R * 0.85, a.Z0 + 2 * IN, zb, 0.6 * IN, 6); a.xcyl(cx + sx * R * 0.9 - 0.6 * IN, cx + sx * R * 0.9 + 0.6 * IN, cy - R * 0.85, a.Z0 + 2 * IN, 2 * IN, 10); }
      a.tube([[cx - R * 0.7, cy + R * 1.0, zb + 2 * IN], [cx - R * 0.7, cy + R * 1.22, zb + ht * 0.7], [cx + R * 0.7, cy + R * 1.22, zb + ht * 0.7], [cx + R * 0.7, cy + R * 1.0, zb + 2 * IN]], Array(4).fill(0.7 * IN), 6);
      a.circ(cx, cy, R, 'EQUIP'); a.rect(cx - R * 1.04, cy - R * 1.04, cx + R * 1.04, cy + R * 1.04, 'EQUIP-DETAIL'); for (const sx of [-1, 1]) a.rect(cx + sx * R * 1.05 - 0.8 * IN, cy + R * 0.7 - 5.5 * IN, cx + sx * R * 1.05 + 0.8 * IN, cy + R * 0.7 + 5.5 * IN, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the insulated vessel with dished ends and collar, the vent stack and relief valve, the manifold with three hand wheels and gauge, the hose coil, two wheels, two casters and the push handle (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic engine canister transport trailer',
    desc: (v) => `Low trailer, ${v.n} axle${v.n > 1 ? 's' : ''}, carrying a ${v.cd} in canister ${v.cl} ft long: two main beams with cross members, dual wheels with fenders, a drawbar with a lunette eye, a drop leg, two saddles with strap rings and tie-downs, lifting lugs on the canister and rear lights.`,
    vs: [['single axle, 36 in canister', 1, 36, 14], ['two axles, 60 in canister', 2, 60, 22], ['three axles, 84 in canister', 3, 84, 30]].map(([l, n, cd, cl]) => [l, cl * 12 + 70 + n * 5, Math.max(cd + 40, 96), cd + 52, 0, { n, cd, cl }]),
    build: (a, v) => {
      const R = (v.cd / 2) * IN, cl = v.cl * 12 * IN, cy = a.cy, x0 = a.X0 + 60 * IN, x1 = x0 + cl + 8 * IN, zf = a.Z0 + 24 * IN, zc = zf + 6 * IN + R, tw = (a.D / 2) - 14 * IN;
      for (const sy of [-1, 1]) a.box(x0 - 6 * IN, cy + sy * tw * 0.55 - 3 * IN, zf - 8 * IN, x1 + 4 * IN, cy + sy * tw * 0.55 + 3 * IN, zf);
      for (let k = 0; k <= 6; k++) { const x = x0 - 4 * IN + ((x1 - x0 + 6 * IN) * k) / 6; a.box(x - 1.5 * IN, cy - tw * 0.55, zf - 6 * IN, x + 1.5 * IN, cy + tw * 0.55, zf - 2 * IN); }
      for (let k = 0; k < v.n; k++) { const ax = x1 - 30 * IN - k * 44 * IN; a.xcyl(ax, ax, 0, 0, 0, 3); a.ycyl(cy - tw, cy + tw, ax, a.Z0 + 14 * IN, 1.6 * IN, 8); for (const sy of [-1, 1]) { a.ycyl(cy + sy * (tw - 0.5 * IN) - 5 * IN, cy + sy * (tw - 0.5 * IN) + 5 * IN, ax, a.Z0 + 14 * IN, 14 * IN, 20); a.ycyl(cy + sy * tw - 7 * IN, cy + sy * tw + 7 * IN, ax, a.Z0 + 14 * IN, 6 * IN, 12);
        a.box(ax - 18 * IN, cy + sy * tw - 7 * IN, a.Z0 + 28 * IN, ax + 18 * IN, cy + sy * tw + 7 * IN, a.Z0 + 29.5 * IN); a.rect(ax - 14 * IN, cy + sy * tw - 5 * IN, ax + 14 * IN, cy + sy * tw + 5 * IN, 'EQUIP'); }
        a.box(ax - 3 * IN, cy - tw * 0.55, zf - 12 * IN, ax + 3 * IN, cy + tw * 0.55, zf - 8 * IN); }
      a.ycyl(cy - 5 * IN, cy + 5 * IN, x0 - 40 * IN, zf - 2 * IN, 0.1, 3); a.tube([[x0 - 6 * IN, cy, zf - 6 * IN], [x0 - 52 * IN, cy, zf - 2 * IN]], [2 * IN, 1.6 * IN], 8); a.tube([[x0 - 52 * IN, cy - 3 * IN, zf - 2 * IN], [x0 - 52 * IN, cy + 3 * IN, zf - 2 * IN]], [0.1, 0.1], 3); ring3(a, [x0 - 55 * IN, cy, zf - 2 * IN], [1, 0, 0], 3.4 * IN, 1 * IN, 14);
      a.tube([[x0 + 10 * IN, cy, zf - 8 * IN], [x0 + 10 * IN, cy, a.Z0 + 5 * IN]], [1.8 * IN, 1.8 * IN], 8); a.box(x0 + 6 * IN, cy - 4 * IN, a.Z0, x0 + 14 * IN, cy + 4 * IN, a.Z0 + 2 * IN);
      a.xcyl(x0 + 6 * IN, x1 - 6 * IN, cy, zc, R, 30); a.ell(x0 + 6 * IN, cy, zc, R * 0.28, R, R, 14, 8); a.ell(x1 - 6 * IN, cy, zc, R * 0.28, R, R, 14, 8);
      for (const f of [0.18, 0.5, 0.82]) { const x = x0 + (x1 - x0) * f; a.xcyl(x - 1.5 * IN, x + 1.5 * IN, cy, zc, R * 1.03, 30); }
      for (const f of [0.15, 0.85]) { const x = x0 + (x1 - x0) * f; saddleX(a, x, 8 * IN, R, zc, cy, zf); a.tube([[x, cy - R * 1.1, zf + 6 * IN], [x, cy - R * 0.5, zc + R * 0.95], [x, cy + R * 0.5, zc + R * 0.95], [x, cy + R * 1.1, zf + 6 * IN]], Array(4).fill(0.6 * IN), 5); }
      for (const f of [0.38, 0.62]) { const x = x0 + (x1 - x0) * f; ring3(a, [x, cy, zc + R * 1.0], [0, 1, 0], 3 * IN, 0.5 * IN, 12); a.box(x - 1.5 * IN, cy - 0.6 * IN, zc + R * 0.97, x + 1.5 * IN, cy + 0.6 * IN, zc + R * 1.03); }
      for (const sy of [-1, 1]) a.box(x1 + 4 * IN, cy + sy * (tw - 4 * IN) - 1.5 * IN, zf - 6 * IN, x1 + 6 * IN, cy + sy * (tw - 4 * IN) + 1.5 * IN, zf - 2 * IN);
      a.rect(x0 - 6 * IN, cy - tw * 0.55 - 3 * IN, x1 + 4 * IN, cy + tw * 0.55 + 3 * IN, 'EQUIP'); a.ellp((x0 + x1) / 2, cy, (x1 - x0) / 2, R, 'EQUIP-DETAIL'); a.line(x0 - 6 * IN, cy, x0 - 52 * IN, cy, 'EQUIP'); a.outline('EQUIP-HIDDEN');
      a.log('Added the main beams with cross members, dual wheels with fenders on each axle, the drawbar and lunette eye, drop leg, the canister with rings and lifting lugs on two saddles with straps and the rear lights (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic satellite ground tracking antenna',
    desc: (v) => `Tracking antenna with a ${v.d} in dish raised 55 degrees: a pad and pedestal with a turntable ring, a U yoke with elevation hubs, a dish with a rim hoop and a feed on three struts, a counterweight arm behind and an equipment room with a door beside the base.`,
    vs: [['120 in dish', 120], ['180 in dish', 180], ['300 in dish', 300], ['480 in dish', 480]].map(([l, d]) => [l, d * 1.55, d * 0.97, d * 1.08 + 30, 0, { d }]),
    build: (a, v) => {
      const D = v.d * IN, R = D / 2, cx = a.X0 + D * 0.58, cy = a.cy + R * 0.12, ze = a.Z0 + R * 0.82, el = 0.96, u = [0, -m.cos(el), m.sin(el)], c = add3([cx, cy, ze], u, -R * 0.1);
      a.cyl(cx, cy, a.Z0, a.Z0 + 4 * IN + R * 0.02, R * 0.62, 28); a.cyl(cx, cy, a.Z0 + 4 * IN, ze - R * 0.45, R * 0.2, 22); a.cyl(cx, cy, ze - R * 0.5, ze - R * 0.4, R * 0.5, 28); ring3(a, [cx, cy, ze - R * 0.44], [0, 0, 1], R * 0.5, R * 0.025, 28);
      for (const sx of [-1, 1]) { a.box(cx + sx * R * 0.46 - R * 0.045, cy - R * 0.14, ze - R * 0.4, cx + sx * R * 0.46 + R * 0.045, cy + R * 0.14, ze + R * 0.1); a.xcyl(cx + sx * R * 0.4, cx + sx * R * 0.56, cy, ze, R * 0.07, 12); }
      dish(a, c, u, R, R * 0.16, R * 0.34, 30); a.tube([[cx - R * 0.4, cy, ze], [cx + R * 0.4, cy, ze]], [R * 0.035, R * 0.035], 10); a.tube([[cx, cy, ze], add3([cx, cy, ze], u, -R * 0.3)], [R * 0.03, R * 0.07], 8);
      const cw = add3([cx, cy, ze], [0, m.cos(el), -m.sin(el)], R * 0.58); a.tube([[cx, cy, ze], cw], [R * 0.03, R * 0.03], 6); a.box(cw[0] - R * 0.14, cw[1] - R * 0.1, cw[2] - R * 0.12, cw[0] + R * 0.14, cw[1] + R * 0.1, cw[2] + R * 0.12);
      const bx0 = a.X0 + D * 1.15, bx1 = a.X0 + D * 1.5; a.box(bx0, a.cy - R * 0.4, a.Z0, bx1, a.cy + R * 0.4, a.Z0 + R * 0.36); a.box(bx0 - 4, a.cy - R * 0.42, a.Z0 + R * 0.36, bx1 + 4, a.cy + R * 0.42, a.Z0 + R * 0.4); a.box(bx0 + R * 0.12, a.cy - R * 0.4 - 6, a.Z0, bx0 + R * 0.3, a.cy - R * 0.4, a.Z0 + R * 0.28); a.cyl(bx1 - R * 0.1, a.cy, a.Z0 + R * 0.4, a.Z0 + R * 0.46, R * 0.05, 8);
      a.tube([[cx + R * 0.2, cy, a.Z0 + R * 0.1], [bx0, a.cy, a.Z0 + R * 0.1]], [R * 0.025, R * 0.025], 6);
      a.circ(cx, cy, R * 0.62, 'EQUIP'); a.circ(cx, cy, R * 0.2, 'EQUIP-DETAIL'); a.ellp(cx, cy - R * 0.4, R, R * m.sin(el) * 1.0, 'EQUIP-DETAIL'); a.rect(bx0, a.cy - R * 0.4, bx1, a.cy + R * 0.4, 'EQUIP'); a.outline('EQUIP-HIDDEN');
      a.log('Added the pad, pedestal and turntable ring, the U yoke with elevation hubs, the dish at 55 degrees with rim hoop and feed on struts, the counterweight arm and the equipment room (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic gas bottle trolley with chain bar',
    desc: (v) => `Hand trolley carrying ${v.n} tall gas bottles upright: a deck with two large wheels and a front prop foot, a back frame with two chains across the bottles, a push handle, a bottle with a domed shoulder, valve and cap for each place and a regulator on the first.`,
    vs: [['2 bottles', 2, 1, 2], ['4 bottles', 4, 2, 2], ['6 bottles', 6, 3, 2]].map(([l, n, cols, rows]) => [l, cols * 10.5 + 18, rows * 10.5 + 34, 74, 0, { n, cols, rows }]),
    build: (a, v) => {
      const pitch = 10.5 * IN, r = 4.5 * IN, zd = a.Z0 + 9 * IN, x0 = a.cx - ((v.cols - 1) * pitch) / 2, y0 = a.YF + 12 * IN + r;
      a.box(a.X0 + 2 * IN, a.YF + 4 * IN, zd - 2 * IN, a.X1 - 2 * IN, a.YB - 14 * IN, zd); for (const sx of [-1, 1]) { a.xcyl(a.cx + sx * (a.W / 2 - 1 * IN) - 0.9 * IN, a.cx + sx * (a.W / 2 - 1 * IN) + 0.9 * IN, a.YB - 18 * IN, a.Z0 + 8 * IN, 8 * IN, 20); a.xcyl(a.cx + sx * (a.W / 2 - 1 * IN) - 1.2 * IN, a.cx + sx * (a.W / 2 - 1 * IN) + 1.2 * IN, a.YB - 18 * IN, a.Z0 + 8 * IN, 2.4 * IN, 10); a.rect(a.cx + sx * (a.W / 2 - 1 * IN) - 0.9 * IN, a.YB - 26 * IN, a.cx + sx * (a.W / 2 - 1 * IN) + 0.9 * IN, a.YB - 10 * IN, 'EQUIP'); }
      a.tube([[a.cx, a.YB - 18 * IN, a.Z0 + 8 * IN], [a.cx - a.W / 2 + 1 * IN, a.YB - 18 * IN, a.Z0 + 8 * IN]], [0.01, 0.01], 3); a.xcyl(a.X0 + 1 * IN, a.X1 - 1 * IN, a.YB - 18 * IN, a.Z0 + 8 * IN, 0.9 * IN, 8); a.cyl(a.cx, a.YF + 6 * IN, a.Z0 + 2 * IN, zd - 2 * IN, 0.9 * IN, 8); a.cyl(a.cx, a.YF + 6 * IN, a.Z0, a.Z0 + 2 * IN, 2 * IN, 10);
      let n = 0; for (let i = 0; i < v.cols; i++) for (let j = 0; j < v.rows; j++) { const x = x0 + i * pitch, y = y0 + j * pitch; a.cyl(x, y, zd, a.Z1 - 9 * IN, r, 18); a.ell(x, y, a.Z1 - 9 * IN - 2 * IN, r, r, 3 * IN, 14, 5); a.cyl(x, y, a.Z1 - 7 * IN, a.Z1 - 3.5 * IN, 1 * IN, 8); a.box(x - 1.6 * IN, y - 1.2 * IN, a.Z1 - 4 * IN, x + 1.6 * IN, y + 1.2 * IN, a.Z1 - 1.5 * IN); a.cyl(x, y, a.Z1 - 1.5 * IN, a.Z1, 1.3 * IN, 8); band(a, x, y, zd + 12 * IN, r * 1.02, 0.8 * IN, 18); a.circ(x, y, r, 'EQUIP'); if (n++ === 0) { a.cyl(x - 2.5 * IN, y, a.Z1 - 6 * IN, a.Z1 - 2 * IN, 0.7 * IN, 6); a.cyl(x - 2.5 * IN, y - 1.5 * IN, a.Z1 - 4.8 * IN, a.Z1 - 3.4 * IN, 1.6 * IN, 10); } }
      const yb = a.YB - 8 * IN; for (const sx of [-1, 1]) { a.tube([[a.cx + sx * (a.W / 2 - 3 * IN), yb, zd], [a.cx + sx * (a.W / 2 - 3 * IN), yb, a.Z1 - 14 * IN]], [0.8 * IN, 0.8 * IN], 6); } a.tube([[a.X0 + 3 * IN, yb, a.Z1 - 14 * IN], [a.X1 - 3 * IN, yb, a.Z1 - 14 * IN]], [0.8 * IN, 0.8 * IN], 6);
      a.tube([[a.X0 + 3 * IN, yb, a.Z1 - 18 * IN], [a.X1 - 3 * IN, yb, a.Z1 - 18 * IN]], [0.6 * IN, 0.6 * IN], 6); for (const f of [0.35, 0.65]) a.tube([[a.X0 + 3 * IN, y0 + r * 0.2 + (yb - y0) * 0 - 0, a.Z0 + 0], [a.X0 + 3 * IN, y0 + r * 0.2, a.Z0 + 0]], [0.01, 0.01], 3);
      for (const z of [a.Z1 - 24 * IN, a.Z1 - 42 * IN]) a.tube([[a.X0 + 3 * IN, yb, z], [a.X0 + 3 * IN, y0 - r * 0.9, z], [a.X1 - 3 * IN, y0 - r * 0.9, z], [a.X1 - 3 * IN, yb, z]], Array(4).fill(0.35 * IN), 4);
      a.rect(a.X0 + 2 * IN, a.YF + 4 * IN, a.X1 - 2 * IN, a.YB - 14 * IN, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the deck with two large wheels and a prop foot, the back frame with push handle and two chains, and the upright bottles with shoulders, valves, caps and a regulator (plan and 3D).');
    } }),

  fam({ cat: 'aerospace/ground', title: 'Generic hardwall cleanroom pod with filter ceiling',
    desc: (v) => `Modular cleanroom pod, ${v.w} by ${v.d} ft: a floor frame, a wall of panels with seams and a sealed window, a double door with a window at the front, a ceiling plenum with a grid of fan filter units and light strips, corner return risers and a pass-through box on the side wall.`,
    vs: [['8 x 10 ft pod', 8, 10], ['10 x 16 ft pod', 10, 16], ['12 x 24 ft pod', 12, 24], ['16 x 32 ft pod', 16, 32]].map(([l, w, d]) => [l, w * 12 + 8, d * 12 + 8, 146, 0, { w, d }]),
    build: (a, v) => {
      const x0 = a.X0 + 4 * IN, x1 = a.X1 - 4 * IN, yf = a.YF + 4 * IN, yb = a.YB - 4 * IN, th = 3.5 * IN, zf = a.Z0 + 4 * IN, zw = zf + 104 * IN, dw = 52 * IN;
      a.box(a.X0, a.YF, a.Z0, a.X1, a.YB, zf);
      a.box(x0, yb - th, zf, x1, yb, zw); a.box(x0, yf + th, zf, x0 + th, yb - th, zw); a.box(x1 - th, yf + th, zf, x1, yb - th, zw);
      a.box(x0, yf, zf, a.cx - dw, yf + th, zw); a.box(a.cx + dw, yf, zf, x1, yf + th, zw); a.box(a.cx - dw, yf, zf + 84 * IN, a.cx + dw, yf + th, zw);
      for (const sx of [-1, 1]) { const dx = a.cx + sx * dw * 0.5; a.frame(dx - dw * 0.46, zf + 1 * IN, dx + dw * 0.46, zf + 84 * IN, yf - 1.2 * IN, yf + th * 0.5, 2.4 * IN); a.frame(dx - dw * 0.22, zf + 46 * IN, dx + dw * 0.22, zf + 74 * IN, yf - 2 * IN, yf + th * 0.5, 1.2 * IN); a.box(a.cx + sx * 4 * IN - 0.5 * IN, yf - 2.4 * IN, zf + 38 * IN, a.cx + sx * 4 * IN + 0.5 * IN, yf - 1 * IN, zf + 46 * IN); }
      for (const x of [x0 + (a.cx - dw - x0) * 0.5, a.cx + dw + (x1 - a.cx - dw) * 0.5]) a.frame(x - 12 * IN, zf + 44 * IN, x + 12 * IN, zf + 80 * IN, yf - 0.8 * IN, yf + th, 1.6 * IN);
      for (let x = x0 + 48 * IN; x < x1 - 20 * IN; x += 48 * IN) if (m.abs(x - a.cx) > dw + 3 * IN) a.box(x - 0.4 * IN, yf - 0.4 * IN, zf, x + 0.4 * IN, yf, zw);
      for (let y = yf + 48 * IN; y < yb - 20 * IN; y += 48 * IN) { a.box(x0 - 0.4 * IN, y - 0.4 * IN, zf, x0, y + 0.4 * IN, zw); a.box(x1, y - 0.4 * IN, zf, x1 + 0.4 * IN, y + 0.4 * IN, zw); }
      const px = x1, py = (yf + yb) / 2; a.box(px, py - 18 * IN, zf + 38 * IN, px + 4 * IN, py + 18 * IN, zf + 66 * IN); a.frame(px + 0.5 * IN, zf + 44 * IN, px + 3.5 * IN, zf + 60 * IN, py - 12 * IN, py + 12 * IN, 1 * IN);
      for (const [x, y] of [[x0 + th, yb - th], [x1 - th, yb - th]]) a.box(x - 6 * IN, y - 6 * IN, zf, x + 6 * IN, y + 6 * IN, zw + 14 * IN);
      a.box(x0 - 2 * IN, yf - 2 * IN, zw, x1 + 2 * IN, yb + 2 * IN, zw + 20 * IN);
      const nx = Math.max(1, Math.round((x1 - x0) / (48 * IN))), ny = Math.max(1, Math.round((yb - yf) / (24 * IN)));
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const fx0 = x0 + ((x1 - x0) * i) / nx + 2 * IN, fx1 = x0 + ((x1 - x0) * (i + 1)) / nx - 2 * IN, fy0 = yf + ((yb - yf) * j) / ny + 2 * IN, fy1 = yf + ((yb - yf) * (j + 1)) / ny - 2 * IN; a.box(fx0, fy0, zw + 20 * IN, fx1, fy1, zw + 22.5 * IN); a.box(fx0 + 4 * IN, fy0 + 4 * IN, zw + 22.5 * IN, fx1 - 4 * IN, fy1 - 4 * IN, a.Z1 - 0.0 + 0); a.line(fx0, fy0, fx1, fy0, 'EQUIP-DETAIL'); a.line(fx0, fy1, fx1, fy1, 'EQUIP-DETAIL'); }
      a.rect(x0, yf, x1, yb, 'EQUIP'); a.rect(x0 + th, yf + th, x1 - th, yb - th, 'EQUIP'); a.arc(a.cx - dw, yf, dw, 0, PI / 2 * 1.0, 'EQUIP-SWING'); a.arc(a.cx + dw, yf, dw, PI / 2, PI, 'EQUIP-SWING'); a.rect(px, py - 18 * IN, px + 4 * IN, py + 18 * IN, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
      a.log('Added the floor frame, seamed wall panels with sealed windows, the double door with window and handles, the pass-through box, corner return risers and the ceiling plenum with fan filter units (plan and 3D).');
    } }),
];
export default FAMS;

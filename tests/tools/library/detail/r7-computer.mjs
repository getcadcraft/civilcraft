/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, computer: 150 more objects (desktop accessories and displays, peripherals, data-centre and rack gear, network and telecom equipment). Original geometry; generic size classes, no makers or models. */
import { fam } from './r4-kit.mjs';
import { loft } from './com-core.mjs';

const IN = 25.4, m = Math, U = 44.45;

// ------------------------------------------------------------------------------------------ helpers
function rr(x0, z0, x1, z1, r, n = 4) {
  r = m.min(r, (x1 - x0) / 2 - 0.01, (z1 - z0) / 2 - 0.01); const p = [];
  for (const [cx, cz, a0] of [[x1 - r, z1 - r, 0], [x0 + r, z1 - r, 90], [x0 + r, z0 + r, 180], [x1 - r, z0 + r, 270]]) for (let i = 0; i <= n; i++) { const t = ((a0 + (90 * i) / n) * m.PI) / 180; p.push([cx + r * m.cos(t), cz + r * m.sin(t)]); }
  return p;
}
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
function slab(a, x0, y0, x1, y1, z0, z1, r = 20) { a.prism(rr(x0, y0, x1, y1, r), z0, z1); a.poly(rr(x0, y0, x1, y1, r)); }
function plate(a, x0, z0, x1, z1, y0, y1, r = 20) { prismY(a, rr(x0, z0, x1, z1, r), y0, y1); }
/** any convex solid from points and faces (3 or 4 indices), faces turned to face outward */
function solid(a, pts, faces) {
  const c = [0, 1, 2].map((k) => pts.reduce((s, p) => s + p[k], 0) / pts.length);
  const tri = (i, j, k) => { const A = pts[i], B = pts[j], C = pts[k], u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], w = [C[0] - A[0], C[1] - A[1], C[2] - A[2]], n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]; a.t.push(n[0] * (A[0] - c[0]) + n[1] * (A[1] - c[1]) + n[2] * (A[2] - c[2]) >= 0 ? [A, B, C] : [A, C, B]); };
  for (const f of faces) { tri(f[0], f[1], f[2]); if (f.length === 4) tri(f[0], f[2], f[3]); }
}
/** a frustum between a rectangle [x0,z0,x1,z1] at y0 and another at y1 */
function frus(a, r0, y0, r1, y1) { solid(a, [[r0[0], y0, r0[1]], [r0[2], y0, r0[1]], [r0[2], y0, r0[3]], [r0[0], y0, r0[3]], [r1[0], y1, r1[1]], [r1[2], y1, r1[1]], [r1[2], y1, r1[3]], [r1[0], y1, r1[3]]], [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]); }
function ribs(a, x0, z0, x1, z1, y, n, hor = true, t = 3, dy = 3) {
  for (let i = 0; i < n; i++) { const f = (i + 0.5) / n; if (hor) a.box(x0, y, z0 + (z1 - z0) * f - t / 2, x1, y + dy, z0 + (z1 - z0) * f + t / 2); else a.box(x0 + (x1 - x0) * f - t / 2, y, z0, x0 + (x1 - x0) * f + t / 2, y + dy, z1); }
}
function fan(a, x, z, r, y0, y1) { a.ycyl(y0, y1, x, z, r, 20); a.ycyl(y0, y1 + 0.5, x, z, r * 0.22, 10); for (const t of [0, 1]) a.box(x - (t ? r * 0.9 : 3), y0, z - (t ? 3 : r * 0.9), x + (t ? r * 0.9 : 3), y1 + 0.4, z + (t ? 3 : r * 0.9)); }
function dome(a, ox, oy, z0, rx, ry, h, n = 9, shift = 0) { const secs = []; for (let i = 0; i <= n; i++) { const th = (i / n) * m.PI * 0.5 * 0.985, r = m.cos(th); secs.push({ z: z0 + h * m.sin(th), x: ox, y: oy + shift * m.sin(th) * ry, rx: rx * r + 0.01, ry: ry * r + 0.01 }); } a.add(loft(secs, 24)); }
function feet(a, x0, x1, y0, y1, r = 12, h = 10) { for (const x of [x0, x1]) for (const y of [y0, y1]) a.cyl(x, y, a.Z0, a.Z0 + h, r, 8); }
/** rack ears on a rack-mount unit of u units; the face is at y */
function ears(a, u, y = a.YF, t = 3) {
  const ear = (a.W - 17.75 * IN) / 2 > 12 ? (a.W - 17.75 * IN) / 2 : 14;
  for (const [x0, x1] of [[a.X0, a.X0 + ear], [a.X1 - ear, a.X1]]) { a.box(x0, y, a.Z0 + 0.5, x1, y + t, a.Z1 - 0.5); for (let i = 0; i < u; i++) for (const zz of [0.17, 0.83]) a.box(x0 + 3, y - 0.8, a.Z0 + (i + zz) * U - 4, x1 - 3, y + t, a.Z0 + (i + zz) * U + 4); }
  return ear;
}
/** a row of small port openings on a front face */
function ports(a, x0, x1, z0, z1, y, n, dy = 4) { const w = (x1 - x0) / n; for (let i = 0; i < n; i++) a.box(x0 + i * w + w * 0.12, y, z0, x0 + (i + 1) * w - w * 0.12, y + dy, z1); }
const led = (a, x, z, y, r = 2) => a.ycyl(y, y + 1.4, x, z, r, 6);
const uh = (u) => m.round((u * 1.75 - 0.03) * 100) / 100;

// ------------------------------------------------------------------------------------------ desktop
/** a laptop stand: sloped riser, riser with a shelf, folding angle stand or tall adjustable stand */
function lapStand(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, t = 6, zb = Z1 - t;
  a.outline();
  if (v.kind === 'riser' || v.kind === 'shelf') {
    const zf = Z0 + H * (v.kind === 'shelf' ? 0.62 : 0.5);
    prismX(a, [[YF, zf], [YB, zb], [YB, zb + t], [YF, zf + t]], X0, X1);
    prismX(a, [[YF, zf + t], [YF + 8, zf + t], [YF + 8, zf + t + 9], [YF, zf + t + 9]], X0, X1);
    for (const [x0, x1] of [[X0 + 2, X0 + 12], [X1 - 12, X1 - 2]]) prismX(a, [[YF + 4, Z0], [YB - 4, Z0], [YB - 4, zb], [YF + 4, zf]], x0, x1);
    a.box(X0 + 12, YB - 10, Z0 + H * 0.2, X1 - 12, YB - 4, zb);
    for (let i = 0; i < 5; i++) a.box(X0 + W * 0.15, YF + D * (0.2 + i * 0.15), zf + t + (zb - zf) * (0.2 + i * 0.15), X1 - W * 0.15, YF + D * (0.2 + i * 0.15) + 6, zf + t + (zb - zf) * (0.2 + i * 0.15) + 1.2);
    if (v.kind === 'shelf') { a.box(X0 + 12, YF + 14, Z0 + H * 0.2, X1 - 12, YB - 14, Z0 + H * 0.2 + 7); a.box(X0 + 12, YF + 14, Z0 + H * 0.2 + 7, X1 - 12, YF + 20, Z0 + H * 0.2 + 22); a.line(X0 + 12, YF + 14, X1 - 12, YF + 14); }
    for (const x of [X0 + 8, X1 - 8]) for (const y of [YF + 10, YB - 10]) a.cyl(x, y, Z0, Z0 + 2, 5, 6);
    a.line(X0 + 12, YF, X0 + 12, YB); a.line(X1 - 12, YF, X1 - 12, YB);
    a.log(`Added the ${v.kind === 'shelf' ? 'sloped plate with a front lip, side cheeks, rear brace and a lower storage shelf' : 'sloped plate with a front lip and rubber strips, side cheeks and rear brace'} (plan and 3D).`);
  } else if (v.kind === 'angle') {
    prismX(a, [[YF, Z0 + 14], [YB - 30, zb], [YB - 30, zb + t], [YF, Z0 + 14 + t]], X0 + 4, X1 - 4);
    prismX(a, [[YF, Z0 + 14 + t], [YF + 10, Z0 + 14 + t + 1], [YF + 10, Z0 + 14 + t + 14], [YF, Z0 + 14 + t + 13]], X0 + 4, X1 - 4);
    for (const x of [X0 + W * 0.2, X1 - W * 0.2]) { a.tube([[x, YB - 34, zb], [x, YB - 8, Z0 + 12], [x, YB - 4, Z0 + 3]], [6, 6, 6], 8); a.tube([[x, YF + 30, Z0 + 14 + t * 2], [x, YF + 30, Z0 + 4]], [6, 6], 8); a.xcyl(x - 10, x + 10, YB - 4, Z0 + 5, 5, 8); a.xcyl(x - 8, x + 8, YF + 30, Z0 + 8, 5, 8); }
    a.xcyl(X0 + W * 0.2, X1 - W * 0.2, YB - 34, zb - 3, 4, 8);
    for (const x of [X0 + 20, X1 - 20]) a.box(x - 12, YF + 2, Z0 + 14 + t + 15, x + 12, YF + 6, Z0 + 14 + t + 22);
    a.log('Added the sloped plate with a front lip, two folding rear legs with a cross bar, front feet and grip pads (plan and 3D).');
  } else {
    const zf = Z1 - 70;
    prismX(a, [[YF, zf], [YB - 60, zb], [YB - 60, zb + t], [YF, zf + t]], X0 + 6, X1 - 6);
    prismX(a, [[YF, zf + t], [YF + 10, zf + t], [YF + 10, zf + t + 16], [YF, zf + t + 15]], X0 + 6, X1 - 6);
    for (const x of [X0 + W * 0.22, X1 - W * 0.22]) { a.cyl(x, YB - 70, Z0 + 20, zf + 30, 14, 12); a.cyl(x, YB - 70, Z0 + 20, zf - 20, 18, 12); a.cyl(x + 18, YB - 70, zf - 70, zf - 62, 6, 8); a.box(x - 12, YB - 90, zf + 20, x + 12, YB - 50, zb); }
    a.box(X0 + 20, YB - 110, Z0, X1 - 20, YB - 30, Z0 + 20); a.box(X0 + 30, YB - 135, Z0 + 4, X0 + 56, YB - 5, Z0 + 20); a.box(X1 - 56, YB - 135, Z0 + 4, X1 - 30, YB - 5, Z0 + 20);
    a.rect(X0 + 20, YB - 110, X1 - 20, YB - 30, 'EQUIP-DETAIL');
    a.log('Added the sloped tray with a front lip, two telescoping posts with lock knobs, a base bar and two floor feet (plan and 3D).');
  }
}

/** an old tube monitor: bezel, glass, tapering rear cone, swivel base and a row of controls */
function crt(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, by = YF + D * 0.2, bz0 = Z0 + H * 0.12, ww = W / 2;
  a.outline(); a.circ(cx, YB - D * 0.3, W * 0.22, 'EQUIP-DETAIL');
  plate(a, X0, bz0, X1, Z1, YF, by, 24);
  plate(a, X0 + W * 0.07, bz0 + H * 0.12, X1 - W * 0.07, Z1 - H * 0.05, YF - 0 > YF ? YF : YF, YF + 3, 30);
  frus(a, [X0 + W * 0.04, bz0 + H * 0.03, X1 - W * 0.04, Z1 - H * 0.03], by, [cx - ww * 0.36, bz0 + H * 0.3, cx + ww * 0.36, Z1 - H * 0.34], YB);
  frus(a, [cx - ww * 0.36, bz0 + H * 0.3, cx + ww * 0.36, Z1 - H * 0.34], YB - 6, [cx - ww * 0.3, bz0 + H * 0.36, cx + ww * 0.3, Z1 - H * 0.4], YB);
  a.cyl(cx, cy + D * 0.1, Z0 + 6, bz0 + 4, W * 0.12, 14); a.cyl(cx, cy + D * 0.1, Z0, Z0 + 12, W * 0.26, 24); a.circ(cx, cy + D * 0.1, W * 0.26);
  for (let i = 0; i < 5; i++) a.box(X1 - W * 0.38 + i * 14, YF + 1, bz0 + 5, X1 - W * 0.38 + i * 14 + 9, YF + 5, bz0 + 12);
  led(a, X1 - W * 0.08, bz0 + 9, YF + 1, 3); a.box(X0 + W * 0.1, YF + 1, bz0 + 4, X0 + W * 0.4, YF + 2, bz0 + 9);
  for (let i = 0; i < 6; i++) a.box(cx - 40 + i * 14, YB - 6, Z1 - H * 0.36, cx - 40 + i * 14 + 8, YB - 1, Z1 - H * 0.36 + 3);
  a.log('Added the thick bezel with glass, controls and a power light, the tapering rear cone with vent slots, a neck and a round swivel base (plan and 3D).');
}

/** a convertible laptop standing in tent mode: screen panel and keyboard panel meeting at the hinge */
function tent(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, th = 14, my = (YF + YB) / 2;
  a.outline(); a.line(X0, my, X1, my, 'EQUIP-DETAIL');
  const pan = (yb, yt, z0, z1, x0, x1) => { prismX(a, [[yb - th * 0.6, z0], [yb + th * 0.6, z0], [yt + th * 0.6, z1], [yt - th * 0.6, z1]], x0, x1); };
  pan(YF + th, my - th * 0.3, Z0 + 6, Z1, X0 + 4, X1 - 4);       // screen
  pan(YB - th, my + th * 0.3, Z0 + 6, Z1, X0 + 4, X1 - 4);       // keyboard deck, seen from behind
  const f = (k) => [YF + th + (my - th * 0.3 - YF - th) * k - th * 0.6 - 1.4, Z0 + 6 + (Z1 - Z0 - 6) * k];
  const [p0, p1] = [f(0.1), f(0.86)]; prismX(a, [[p0[0], p0[1]], [p0[0] + 1.4, p0[1]], [p1[0] + 1.4, p1[1]], [p1[0], p1[1]]], X0 + 14, X1 - 14);
  const c = f(0.93); a.box(cx - 5, c[0] - 1, c[1] - 3, cx + 5, c[0] + 1.4, c[1]);
  a.xcyl(X0 + 4, X1 - 4, my, Z1 - 5, 6, 12);
  for (const x of [X0 + 30, X1 - 30]) for (const k of [0.15, 0.9]) { const [yy, zz] = [YB - th + (my + th * 0.3 - YB + th) * k + th * 0.6, Z0 + 6 + (Z1 - Z0 - 6) * k]; a.box(x - 8, yy, zz - 2, x + 8, yy + 2.4, zz + 2); }
  for (const x of [X0 + 24, X1 - 24]) a.cyl(x, YF + th, Z0, Z0 + 7, 7, 8);
  for (let i = 0; i < 4; i++) a.box(X0 + W * 0.3 + i * 18, YB - th * 0.1, Z0 + 20, X0 + W * 0.3 + i * 18 + 8, YB, Z0 + 30);
  a.log('Added the screen panel with glass and a camera, the keyboard panel with rubber feet and vents, and the hinge barrel at the ridge (plan and 3D).');
}

/** closed laptops standing on edge in a vertical stand with silicone slots */
function vstand(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, n = v.n, sw = (W - 30) / n;
  slab(a, X0, YF, X1, YB, Z0, Z0 + 18, 16); a.box(X0 + 6, YF + 4, Z0 + 18, X1 - 6, YF + 12, Z0 + 28);
  for (let i = 0; i < n; i++) {
    const x0 = X0 + 15 + i * sw, x1 = x0 + sw;
    a.box(x0, YF + 14, Z0 + 18, x1, YB - 14, Z0 + 56);
    const lx = (x0 + x1) / 2;
    prismY(a, rr(lx - 7, Z0 + 40, lx + 7, Z1 - 4, 4), YF + 24, YB - 24);
    a.box(lx - 4, YF + 26, Z0 + 60, lx + 4, YB - 26, Z0 + 61.5);
    for (let k = 0; k < 4; k++) a.xcyl(lx - 5, lx + 5, YB - 24 - 6, Z1 - 20 - k * 3, 1.2, 5);
    a.rect(lx - 7, YF + 24, lx + 7, YB - 24, 'EQUIP-DETAIL');
  }
  for (let i = 0; i <= n; i++) a.box(X0 + 15 + i * sw - 2, YF + 14, Z0 + 18, X0 + 15 + i * sw + 2, YB - 14, Z0 + 70);
  a.box(X0 + 4, YB - 8, Z0 + 18, X1 - 4, YB - 4, Z0 + 80);
  a.log(`Added the weighted base with ${n} silicone-lined slots and a rear brace, each holding a closed laptop on its edge (plan and 3D).`);
}

/** a portrait (pivoted) monitor: tall bezel and panel, pillar neck and round base */
function pmon(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, t = 20, pz = Z0 + 130;
  a.outline(); a.circ(cx, YB - D * 0.4, D * 0.38, 'EQUIP-DETAIL');
  plate(a, X0, pz, X1, Z1, YF, YF + t, 10); a.frame(X0, pz, X1, Z1, YF - 0 > YF ? YF : YF, YF + 4, 12);
  a.box(X0 + 12, YF + 4, pz + 12, X1 - 12, YF + t + 1, Z1 - 12);
  a.prism(rr(cx - W * 0.3, YF + t, cx + W * 0.3, YF + t + 30, 10), pz + (Z1 - pz) * 0.3, pz + (Z1 - pz) * 0.7);
  const by = YB - D * 0.4;
  a.box(cx - 30, by - 14, Z0 + 14, cx + 30, by + 14, pz + 80); a.box(cx - 22, YF + t + 10, pz + 40, cx + 22, by, pz + 100);
  a.cyl(cx, by, Z0, Z0 + 14, D * 0.38, 24); a.cyl(cx, by, Z0 + 14, Z0 + 20, 36, 16);
  a.box(cx - 40, YF + 3, pz - 0.1 + 4, cx + 40, YF + 5, pz + 8); a.box(X1 - 40, YF, pz + 2, X1 - 28, YF + 5, pz + 6);
  a.log('Added the tall panel with bezel, a rear housing, a pillar neck with a pivot collar and a round weighted base (plan and 3D).');
}

/** three monitors in a row, the outer two angled in, on a stand rail */
function triple(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, pw = v.pw * IN, ph = v.ph * IN, ang = (v.ang * m.PI) / 180, t = 20, pz0 = Z1 - ph;
  const panel = (px, rot) => {
    const c = m.cos(rot), s = m.sin(rot), hw = pw / 2, pt = (u, y) => [px + u * c - y * s, YF + 6 + u * s + y * c];
    const poly = [pt(-hw, 0), pt(hw, 0), pt(hw, t), pt(-hw, t)];
    a.prism(poly, pz0, Z1); a.poly(poly);
    const g = [pt(-hw + 12, -2), pt(hw - 12, -2), pt(hw - 12, 0.5), pt(-hw + 12, 0.5)]; a.prism(g, pz0 + 12, Z1 - 12);
  };
  const off = (pw / 2) * (1 + m.cos(ang)) + 4;
  panel(cx - off, -ang); panel(cx + off, ang); panel(cx, 0);
  a.rect(cx - 50, YB - 90, cx + 50, YB - 10, 'EQUIP-DETAIL');
  a.box(cx - 50, YB - 90, Z0, cx + 50, YB - 10, Z0 + 10);
  a.box(cx - 30, YB - 70, Z0 + 10, cx + 30, YB - 30, pz0 + ph * 0.5); a.box(cx - 90, YB - 78, pz0 + ph * 0.4, cx + 90, YB - 62, pz0 + ph * 0.5);
  a.box(cx - 46, YB - 40, Z0 + 10, cx + 46, YB - 10, Z0 + 70);
  for (const s of [-1, 1]) { a.tube([[cx + s * 90, YB - 70, pz0 + ph * 0.45], [cx + s * off, YB - 50, pz0 + ph * 0.45], [cx + s * off, YB - 30, pz0 + ph * 0.5]], [8, 8, 8], 6); }
  a.log('Added three panels with bezels (the outer two angled in), a rear stand rail with arms and a clamped base (plan and 3D).');
}

/** an open-air test bench: acrylic base, uprights, board tray with board, cooler tower, memory, long graphics card and power supply */
function bench(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline();
  a.box(X0, YF, Z0 + 14, X1, YB, Z0 + 20); feet(a, X0 + 14, X1 - 14, YF + 14, YB - 14, 10, 14);
  const tx0 = X0 + W * 0.16, tx1 = X1 - W * 0.12, ty = YB - D * 0.42;
  a.box(tx0 - 14, ty - 3, Z0 + 20, tx0, ty + 3, Z1 - 4); a.box(X1 - 22, ty - 3, Z0 + 20, X1 - 8, ty + 3, Z1 - 4);
  a.box(tx0 - 14, ty - 3, Z1 - 12, X1 - 8, ty + 3, Z1 - 4);
  a.box(tx0, ty - 22, Z0 + 56, tx1, ty - 3, Z1 - 24);             // board
  const bw = tx1 - tx0, bh = Z1 - 24 - Z0 - 56;
  a.box(tx0 + bw * 0.18, ty - 80, Z0 + 56 + bh * 0.55, tx0 + bw * 0.18 + 70, ty - 22, Z0 + 56 + bh * 0.55 + 70); a.box(tx0 + bw * 0.18 + 6, ty - 130 + 50, Z0 + 56 + bh * 0.55 + 6, tx0 + bw * 0.18 + 64, ty - 80, Z0 + 56 + bh * 0.55 + 64);
  for (let i = 0; i < 6; i++) a.box(tx0 + bw * 0.18 + 6 + i * 11, ty - 130 + 50, Z0 + 56 + bh * 0.55 + 8, tx0 + bw * 0.18 + 12 + i * 11, ty - 80, Z0 + 56 + bh * 0.55 + 64);
  for (let i = 0; i < v.ram; i++) a.box(tx0 + bw * 0.6 + i * 12, ty - 30, Z0 + 56 + bh * 0.52, tx0 + bw * 0.6 + i * 12 + 7, ty - 22, Z0 + 56 + bh * 0.52 + 120 * (v.ram > 2 ? 1 : 1));
  const gz = Z0 + 56 + bh * 0.28;
  a.box(tx0 + 8, ty - 22 - 52, gz, tx1 - 12, ty - 22, gz + 36);
  for (const i of [0, 1, 2].slice(0, v.gpuf)) a.ycyl(ty - 22 - 52 - 2, ty - 22 - 52, tx0 + 8 + (tx1 - tx0 - 20) * (0.2 + i * 0.3), gz + 18, 15, 16);
  a.box(X0 + 10, ty - 110, Z0 + 20, X0 + 10 + bw * 0.42, ty - 14, Z0 + 20 + 62);
  a.box(X1 - 80, ty - 60, Z0 + 20, X1 - 14, ty - 10, Z0 + 56);
  for (let i = 0; i < v.cab; i++) a.tube([[tx0 + 20 + i * 8, ty - 22, Z0 + 56 + bh * 0.1], [tx0 + 20 + i * 8, ty - 40, Z0 + 56 + bh * 0.1 - 14], [X0 + 30 + i * 6, ty - 80, Z0 + 50]], [3, 3, 3], 5);
  a.rect(tx0, ty - 22, tx1, ty - 3, 'EQUIP-DETAIL');
  a.log(`Added the base plate, uprights and top bar, the open board tray with a board, cooler tower, ${v.ram} memory sticks, a long graphics card with ${v.gpuf} fan${v.gpuf > 1 ? 's' : ''}, a power supply and cables (plan and 3D).`);
}

/** a laptop cooling pad: sloped wedge with fan rings, mesh top, front ledge and a side port */
function coolpad(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, n = v.fans;
  a.outline();
  prismX(a, [[YF, Z0 + 4], [YB, Z0 + 4], [YB, Z1 - 4], [YF, Z0 + H * 0.3]], X0, X1);
  prismX(a, [[YF, Z0 + H * 0.3], [YF + 14, Z0 + H * 0.3 + 2], [YF + 14, Z0 + H * 0.3 + 12], [YF, Z0 + H * 0.3 + 11]], X0, X1);
  for (let i = 0; i < n; i++) {
    const fx = n === 1 ? cx : n === 2 ? cx + (i - 0.5) * W * 0.5 : n === 3 ? cx + (i - 1) * W * 0.32 : X0 + W * (0.18 + 0.64 * (i % 3) / 2) ;
    const fyc = n === 5 && i > 2 ? YF + D * 0.3 : n === 5 ? YF + D * 0.7 : (YF + YB) / 2, rr_ = n >= 3 ? W * 0.11 : W * 0.2;
    const zt = Z0 + H * 0.3 + (Z1 - 4 - Z0 - H * 0.3) * ((fyc - YF) / D);
    a.cyl(fx, fyc, zt, zt + 4, rr_, 20); a.cyl(fx, fyc, zt + 4, zt + 4.6, rr_ * 0.3, 10); a.circ(fx, fyc, rr_, 'EQUIP-DETAIL');
    for (const t of [0, 1]) a.box(fx - (t ? rr_ * 0.9 : 1.4), fyc - (t ? 1.4 : rr_ * 0.9), zt + 4, fx + (t ? rr_ * 0.9 : 1.4), fyc + (t ? 1.4 : rr_ * 0.9), zt + 4.8);
  }
  for (const x of [X0 + 20, X1 - 20]) a.box(x - 12, YB - 6, Z0, x + 12, YB, Z0 + 10);
  a.box(X1 - 12, YF + D * 0.4, Z0 + 6, X1, YF + D * 0.55, Z0 + 12);
  a.log(`Added the sloped wedge with ${n} fan ring${n > 1 ? 's' : ''}, a front ledge, rear support tabs and a side USB port (plan and 3D).`);
}

/** an under-desk holder for a computer tower: top plate on the desk underside with side cheeks, base and strap */
function cpuhold(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline(); a.rect(X0 + 6, YF + 6, X1 - 6, YB - 6, 'EQUIP-DETAIL');
  a.box(X0, YF, Z1 - 6, X1, YB, Z1); for (const x of [X0 + 14, X1 - 14]) for (const y of [YF + 20, YB - 20]) a.cyl(x, y, Z1, Z1 + 0.01, 0.01, 3);
  if (v.kind === 'slide') {
    for (const x of [X0 + 8, X1 - 8 - 12]) { a.box(x, YF + 8, Z1 - 30, x + 12, YB - 8, Z1 - 6); a.box(x + 2, YF + 4, Z1 - 26, x + 10, YB - 4, Z1 - 12); }
    a.box(X0 + 20, YF + 2, Z0 + 14, X1 - 20, YB - 40, Z0 + 20); a.box(X0 + 20, YF + 2, Z0 + 20, X0 + 28, YB - 40, Z0 + 70); a.box(X1 - 28, YF + 2, Z0 + 20, X1 - 20, YB - 40, Z0 + 70);
    a.box(X0 + 20, YF + 2, Z0 + 20, X1 - 20, YF + 8, Z0 + 70); a.box(cx - 30, YF, Z0 + 38, cx + 30, YF + 4, Z0 + 44);
    for (const x of [X0 + 16, X1 - 24]) a.box(x, YF + 12, Z0 + 20, x + 8, YB - 36, Z1 - 30);
    a.log('Added the top mounting plate, two slide rails and a sliding tray with a front pull and side stops (plan and 3D).');
  } else if (v.kind === 'hang') {
    for (const x of [X0 + 6, X1 - 6 - 10]) { a.box(x, YF + 6, Z0 + 40, x + 10, YB - 6, Z1 - 6); a.box(x, YF + 6, Z0 + 40, x + 10, YF + 24, Z0 + 20); }
    a.box(X0 + 6, YF + 6, Z0 + 14, X1 - 6, YB - 6, Z0 + 40);
    for (let i = 0; i < 4; i++) a.ycyl(YF + 6, YB - 6, X0 + 22 + i * ((W - 44) / 3), Z0 + 27, 3, 6);
    for (const z of [Z0 + H * 0.45, Z0 + H * 0.7]) a.box(X0 + 16, YF + 4, z, X1 - 16, YF + 10, z + 14);
    a.log('Added the top mounting plate, two side plates with open slots, a lipped base and two cross straps (plan and 3D).');
  } else {
    for (const x of [X0 + 6, X1 - 6 - 8]) a.box(x, YF + 6, Z0 + 20, x + 8, YB - 6, Z1 - 6);
    a.box(X0 + 6, YF + 6, Z0 + 12, X1 - 6, YB - 6, Z0 + 20); a.box(X0 + 6, YF + 6, Z0 + 20, X1 - 6, YF + 12, Z0 + 52);
    for (let i = 0; i < 4; i++) a.cyl(X0 + 28 + i * ((W - 56) / 3), YB - 20, Z0 + 12, Z0 + 14.4, 6, 8);
    a.box(cx - 40, YF + 4, Z0 + 30, cx + 40, YF + 8, Z0 + 38);
    a.log('Added the top mounting plate, two upright side plates, a base with rubber pads and a front retaining lip (plan and 3D).');
  }
}

/** a tilting touchscreen computer in a drafting stand: panel, thick lower bezel, stylus tray, A-frame legs with hinge */
function draft(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, th = 26, ph = H * 0.74;
  a.outline();
  const tilt = v.tilt, y0 = YF + 20;
  const zt = (y) => Z0 + 60 + (Z1 - Z0 - 60 - ph) * 0 + (y - y0) * m.tan((tilt * m.PI) / 180);
  prismX(a, [[y0, Z0 + 80], [y0 + th, Z0 + 80 + th * m.tan((tilt * m.PI) / 180)], [y0 + th + ph * m.sin(((90 - tilt) * m.PI) / 180) * 0.55, Z1 - 4], [y0 + ph * 0.3, Z1 - 2]], X0 + 6, X1 - 6);
  prismX(a, [[y0 - 6, Z0 + 80], [y0 + 4, Z0 + 80], [y0 + 4, Z0 + 92], [y0 - 6, Z0 + 92]], X0 + 10, X1 - 10);
  a.box(X0 + 20, YF, Z0 + 86, X1 - 20, y0 - 4, Z0 + 96);        // stylus tray
  a.tube([[X0 + 40, YF + 6, Z0 + 99], [X0 + 40, YF + 24, Z0 + 99]], [3, 3], 6);
  for (const x of [X0 + 16, X1 - 16]) { a.tube([[x, y0 + 30, Z0 + 100], [x, YB - 30, Z0 + 20], [x, YB - 14, Z0 + 4]], [10, 10, 10], 8); a.xcyl(x - 12, x + 12, YB - 14, Z0 + 6, 6, 8); a.ycyl(YF + 20, YF + 60, x, Z0 + 6, 10, 8); }
  a.box(X0 + 16, YB - 40, Z0 + 40, X1 - 16, YB - 28, Z0 + 52);
  a.box(X0 + 30, YF + 20, Z0, X1 - 30, YF + 70, Z0 + 12);
  a.log(`Added the touchscreen panel tilted ${tilt} degrees with a thick lower bezel and a stylus tray, A-frame legs, a cross bar and a front foot rail (plan and 3D).`);
}

/** a monitor riser: top shelf on two end panels, with a drawer, cubbies or a USB hub */
function riser(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, t = 14;
  slab(a, X0, YF, X1, YB, Z1 - t, Z1, 14);
  for (const x of [X0 + 10, X1 - 10 - t]) a.box(x, YF + 10, Z0, x + t, YB - 10, Z1 - t);
  a.box(X0 + 10 + t, YB - 12, Z0 + 6, X1 - 10 - t, YB - 8, Z1 - t);
  for (const x of [X0 + 24, X1 - 24]) a.cyl(x, YF + 20, Z0 - 0, Z0 + 4, 8, 8);
  if (v.kind === 'drawer') { a.box(X0 + 10 + t, YF + 14, Z0 + 12, X1 - 10 - t, YF + 20, Z1 - t - 6); a.box(cx - 30, YF + 4, Z0 + (Z1 - Z0) * 0.4, cx + 30, YF + 14, Z0 + (Z1 - Z0) * 0.4 + 8); a.rect(X0 + 10 + t, YF + 14, X1 - 10 - t, YF + 20, 'EQUIP-DETAIL'); }
  if (v.kind === 'shelves') { for (const z of [Z0 + H * 0.35]) a.box(X0 + 10 + t, YF + 14, z, X1 - 10 - t, YB - 14, z + 6); a.box(cx - 3, YF + 14, Z0 + H * 0.35 + 6, cx + 3, YB - 14, Z1 - t); for (let i = 0; i < 3; i++) a.box(X1 - 10 - t - 26 + i * 8, YF + 4, Z1 - t - 4, X1 - 10 - t - 22 + i * 8, YF + 10, Z1 - t); a.box(X0 + 10 + t + 4, YF + 14, Z0 + H * 0.35 + 6, X0 + 10 + t + 30, YB - 30, Z0 + H * 0.35 + 22); }
  if (v.kind === 'bench') { a.box(X0 + 10 + t, YF + 10, Z1 - t - 8, X1 - 10 - t, YF + 14, Z1 - t); }
  a.line(X0 + 10, YF, X0 + 10, YB); a.line(X1 - 10, YF, X1 - 10, YB);
  a.log(`Added the rounded top board on two end panels with a rear brace and rubber feet${v.kind === 'drawer' ? ', and a front drawer with a pull' : v.kind === 'shelves' ? ', a lower shelf with a divider and a row of USB ports' : ''} (plan and 3D).`);
}

const DESK = [
  fam({ cat: 'computer/desktop', title: 'Generic laptop stand, aluminium',
    desc: (v) => v.kind === 'angle' ? 'Folding angle stand with a sloped plate, front lip, two hinged rear legs, cross bar and grip pads.' : v.kind === 'tall' ? 'Tall adjustable laptop stand: sloped tray with lip on two telescoping posts, lock knobs and a floor base bar.' : v.kind === 'shelf' ? 'Sloped laptop riser on side cheeks with a front lip, rear brace, rubber strips and a lower storage shelf.' : 'Sloped laptop riser on two side cheeks with a front lip, rear brace and rubber strips.',
    vs: [['low riser, 3 in', 11, 9, 3, 0, { kind: 'riser' }], ['high riser, 6 in', 11.5, 10, 6, 0, { kind: 'riser' }], ['riser with shelf', 14, 10.5, 6, 0, { kind: 'shelf' }], ['folding angle stand', 11, 9.5, 5.5, 0, { kind: 'angle' }], ['tall adjustable stand', 12.5, 11, 13.5, 0, { kind: 'tall' }]],
    build: lapStand }),
  fam({ cat: 'computer/desktop', title: 'Generic tube monitor, desktop',
    desc: 'Old-style tube monitor with a thick bezel and glass, controls and a power light, a tapering rear cone with vent slots and a round swivel base.',
    vs: [['14 in', 14, 14.5, 13, 0, {}], ['15 in', 14.8, 15.5, 13.8, 0, {}], ['17 in', 16.2, 17.5, 15.2, 0, {}], ['19 in', 17.8, 19, 16.8, 0, {}], ['21 in', 19.5, 20.5, 18.4, 0, {}]],
    build: crt }),
  fam({ cat: 'computer/desktop', title: 'Generic convertible laptop, tent mode',
    desc: 'Convertible laptop folded into a tent: a screen panel with glass and camera and the keyboard panel with feet and vents meeting at the hinge barrel.',
    vs: [['11.6 in', 11, 8.4, 5.6, 0, {}], ['13.3 in', 12, 9.6, 6.2, 0, {}], ['15.6 in', 14.2, 11, 7.2, 0, {}]],
    build: tent }),
  fam({ cat: 'computer/desktop', title: 'Generic vertical laptop stand',
    desc: (v) => `Weighted base with ${v.n} silicone-lined slot${v.n > 1 ? 's' : ''} and a rear brace, each holding a closed laptop standing on its edge.`,
    vs: [['1 laptop', 3.4, 11, 8.5, 0, { n: 1 }], ['2 laptops', 5.6, 11, 8.5, 0, { n: 2 }], ['3 laptops', 7.8, 11, 8.5, 0, { n: 3 }]],
    build: vstand }),
  fam({ cat: 'computer/desktop', title: 'Generic portrait monitor',
    desc: 'Monitor turned upright: tall panel with bezel, a rear housing, a pillar neck with a pivot collar and a round weighted base.',
    vs: [['24 in portrait', 13.4, 9.5, 25, 0, {}], ['27 in portrait', 15, 10, 27.8, 0, {}], ['32 in portrait', 17.4, 11, 31.8, 0, {}]],
    build: pmon }),
  fam({ cat: 'computer/desktop', title: 'Generic triple monitor setup',
    desc: 'Three monitors in a row, the outer two angled in, on a rear stand rail with arms and a clamped base.',
    vs: [24, 27, 32].map((s) => { const pw = m.round(((s * 16) / m.hypot(16, 9)) * 10) / 10, ph = m.round((pw * 9 / 16) * 10) / 10, ang = s === 24 ? 14 : s === 27 ? 18 : 22; return [`3 x ${s} in`, m.round((pw * (1 + 2 * m.cos((ang * m.PI) / 180)) + 2) * 10) / 10, m.round((pw * m.sin((ang * m.PI) / 180) + 8) * 10) / 10, m.round((ph + 4.2) * 10) / 10, 0, { pw, ph, ang }]; }),
    build: triple }),
  fam({ cat: 'computer/desktop', title: 'Generic open-air test bench',
    desc: (v) => `Open test frame with a base plate, two uprights and a top bar, a board tray with a board, a cooler tower, ${v.ram} memory sticks, a long graphics card with ${v.gpuf} fan${v.gpuf > 1 ? 's' : ''}, a power supply and cables.`,
    vs: [['small board', 10, 8, 11, 0, { ram: 2, gpuf: 1, cab: 3 }], ['standard board', 13, 9.5, 14.5, 0, { ram: 4, gpuf: 2, cab: 4 }], ['large board', 16, 11, 17.5, 0, { ram: 8, gpuf: 3, cab: 6 }]],
    build: bench }),
  fam({ cat: 'computer/desktop', title: 'Generic laptop cooling pad',
    desc: (v) => `Sloped wedge pad with ${v.fans} fan ring${v.fans > 1 ? 's' : ''}, a front ledge, rear support tabs and a side USB port.`,
    vs: [['1 fan', 14, 10.5, 1.6, 0, { fans: 1 }], ['3 fans', 16, 11.5, 1.9, 0, { fans: 3 }], ['5 fans', 17.5, 12.5, 2.2, 0, { fans: 5 }]],
    build: coolpad }),
  fam({ cat: 'computer/desktop', title: 'Generic under-desk computer holder',
    desc: (v) => v.kind === 'slide' ? 'Under-desk holder with a top mounting plate, two slide rails and a sliding tray with a front pull and side stops.' : v.kind === 'hang' ? 'Under-desk holder with a top mounting plate, two side plates with open slots, a lipped base and two cross straps.' : 'Under-desk holder with a top mounting plate, two upright side plates, a base with rubber pads and a front retaining lip.',
    vs: [['fixed cradle', 7.5, 17, 18, 0, { kind: 'fixed' }], ['hanging sling', 9, 18, 19, 0, { kind: 'hang' }], ['sliding tray', 8.5, 18, 20, 0, { kind: 'slide' }]],
    build: cpuhold }),
  fam({ cat: 'computer/desktop', title: 'Generic tilting touchscreen computer',
    desc: (v) => `Touchscreen computer on a drafting stand: panel tilted ${v.tilt} degrees with a thick lower bezel and a stylus tray, A-frame legs and a foot rail.`,
    vs: [['22 in, 20 degrees', 21, 19, 21, 0, { tilt: 20 }], ['27 in, 25 degrees', 25.5, 20, 24, 0, { tilt: 25 }], ['32 in, 30 degrees', 30, 22, 27, 0, { tilt: 30 }]],
    build: draft }),
  fam({ cat: 'computer/desktop', title: 'Generic monitor riser shelf',
    desc: (v) => `Rounded top board on two end panels with a rear brace and rubber feet${v.kind === 'drawer' ? ', and a front drawer with a pull' : v.kind === 'shelves' ? ', a lower shelf with a divider and a row of USB ports' : ''}.`,
    vs: [['bench, 3.5 in', 20, 9.5, 3.5, 0, { kind: 'bench' }], ['with drawer', 22, 10, 4.5, 0, { kind: 'drawer' }], ['with shelf and USB', 24, 10, 5, 0, { kind: 'shelves' }]],
    build: riser }),
];

// ------------------------------------------------------------------------------------------ peripherals
/** computer speakers: a pair of satellites, a pair with a subwoofer, or a soundbar */
function speaker(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  const sat = (x0, x1, h) => {
    a.prism(rr(x0, YF, x1, YB, 8), Z0 + 4, Z0 + h); a.poly(rr(x0, YF, x1, YB, 8)); a.box(x0 + 4, YF + 4, Z0, x1 - 4, YB - 4, Z0 + 4);
    const sx = (x0 + x1) / 2, w = x1 - x0;
    a.ycyl(YF - 0, YF + 3, sx, Z0 + h * 0.34, w * 0.36, 22); a.ycyl(YF, YF + 4.5, sx, Z0 + h * 0.34, w * 0.2, 14); a.ycyl(YF, YF + 3, sx, Z0 + h * 0.8, w * 0.17, 16); a.ycyl(YF, YF + 4, sx, Z0 + h * 0.8, w * 0.08, 10);
    a.ycyl(YF, YF + 2, sx, Z0 + h * 0.08 + 4, w * 0.06, 8);
  };
  if (v.kind === 'bar') {
    a.outline(); a.prism(rr(X0, YF, X1, YB, 10), Z0 + 6, Z1); a.ycyl(YF, YF + 4, X0 + 10, (Z0 + Z1) / 2, H * 0.3, 14); a.ycyl(YF, YF + 4, X1 - 10, (Z0 + Z1) / 2, H * 0.3, 14);
    ribs(a, X0 + 24, Z0 + 12, X1 - 24, Z1 - 8, YF, 6, true, 3, 2); for (const x of [X0 + 40, X1 - 40]) a.box(x - 20, YF + 4, Z0, x + 20, YB - 4, Z0 + 6);
    led(a, cx, Z0 + 12, YF, 2); for (let i = 0; i < 4; i++) a.box(X1 - 90 + i * 14, YB - 14, Z1, X1 - 82 + i * 14, YB - 6, Z1 + 0.01);
    a.log('Added the long cabinet with end drivers, a ribbed front grille, two feet, a power light and top buttons (plan and 3D).'); return;
  }
  const sw = v.kind === 'sub' ? W * 0.2 : W * 0.28, sh = v.kind === 'sub' ? H * 0.72 : H;
  sat(X0, X0 + sw, sh); sat(X1 - sw, X1, sh); a.rect(X0, YF, X0 + sw, YB, 'EQUIP-DETAIL');
  a.tube([[X0 + sw, YB - 6, Z0 + 10], [cx, YB - 4, Z0 + 4], [X1 - sw, YB - 6, Z0 + 10]], [2.5, 2.5, 2.5], 5);
  if (v.kind === 'sub') {
    const x0 = cx - W * 0.17, x1 = cx + W * 0.17;
    a.prism(rr(x0, YF, x1, YB, 10), Z0 + 8, Z1); a.poly(rr(x0, YF, x1, YB, 10)); for (const x of [x0 + 20, x1 - 20]) for (const y of [YF + 20, YB - 20]) a.cyl(x, y, Z0, Z0 + 8, 8, 8);
    a.ycyl(YF, YF + 5, cx, Z0 + H * 0.62, W * 0.12, 26); a.ycyl(YF, YF + 8, cx, Z0 + H * 0.62, W * 0.05, 14); a.ycyl(YF, YF + 3, cx, Z0 + H * 0.2, W * 0.035, 10); a.cyl(x1 - 20, YF + 2, Z1, Z1 + 0.01, 0.01, 3);
    a.box(cx - 30, YB - 3, Z0 + H * 0.3, cx + 30, YB, Z0 + H * 0.45);
    a.log('Added two satellite cabinets with woofer and tweeter, a subwoofer with a large driver and port, and a link lead (plan and 3D).'); return;
  }
  a.log('Added two cabinets, each with a woofer, a tweeter, a port and a rubber foot, and a link lead (plan and 3D).');
}

/** a trackball: low shell with a ball in a cup ring, buttons and a scroll ring or wheel */
function trackball(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, br = v.r * IN / 2;
  if (v.kind === 'pro') {
    a.prism(rr(X0 + W * 0.05, YF, X1 - W * 0.05, YF + D * 0.28, 24), Z0, Z0 + H * 0.28);
    a.poly(rr(X0 + W * 0.05, YF, X1 - W * 0.05, YF + D * 0.28, 24));
  }
  const by0 = v.kind === 'pro' ? YF + D * 0.32 : YF;
  slab(a, X0, by0, X1, YB, Z0 + 2, Z0 + H * 0.58, 30);
  const bx = v.kind === 'thumb' ? X1 - br * 1.5 : cx, byy = v.kind === 'thumb' ? by0 + (YB - by0) * 0.42 : by0 + (YB - by0) * 0.5;
  a.cyl(bx, byy, Z0 + H * 0.58, Z0 + H * 0.7, br * 1.22, 24); a.circ(bx, byy, br * 1.22, 'EQUIP-DETAIL');
  a.ell(bx, byy, Z0 + H * 0.58 + br * 0.3, br, br, br, 16, 10);
  for (const [dx, dy] of [[1, 0], [-1, 0]]) a.cyl(bx + dx * br * 1.0, byy + dy * br, Z0 + H * 0.7, Z0 + H * 0.74, 2.2, 6);
  if (v.kind === 'thumb') { a.prism(rr(X0 + 10, by0 + (YB - by0) * 0.1, X0 + W * 0.34, YB - 18, 6), Z0 + H * 0.58, Z0 + H * 0.66); a.prism(rr(X0 + W * 0.36, by0 + (YB - by0) * 0.1, X0 + W * 0.62, YB - 18, 6), Z0 + H * 0.58, Z0 + H * 0.66); a.xcyl(X0 + W * 0.32, X0 + W * 0.38, by0 + (YB - by0) * 0.55, Z0 + H * 0.7, 6, 10); }
  else { const bw = W * 0.3; for (const sx of [-1, 1]) for (const sy of [0, 1]) a.prism(rr(sx < 0 ? X0 + 8 : X1 - 8 - bw, sy ? by0 + (YB - by0) * 0.55 : by0 + 12, sx < 0 ? X0 + 8 + bw : X1 - 8, sy ? YB - 12 : by0 + (YB - by0) * 0.45, 6), Z0 + H * 0.58, Z0 + H * 0.66); }
  for (const x of [X0 + 24, X1 - 24]) a.cyl(x, YB - 20, Z0, Z0 + 3, 7, 6);
  a.log(`Added the low shell, a ${v.r} in ball in a cup ring with sensor lugs, ${v.kind === 'thumb' ? 'two large buttons and a scroll wheel' : 'four buttons'}${v.kind === 'pro' ? ' and a padded wrist rest' : ''} (plan and 3D).`);
}

/** a joystick: weighted base, rubber boot, grip with trigger, hat switch and buttons; optional throttle lever */
function joystick(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  const sx = v.kind === 'compact' ? cx : X0 + W * 0.24, br = m.min(D * 0.42, v.kind === 'compact' ? W * 0.4 : W * 0.2);
  a.outline();
  slab(a, X0, YF, v.kind === 'compact' ? X1 : X0 + W * 0.5, YB, Z0 + 3, Z0 + 28, 20);
  a.cone(sx, cy, Z0 + 28, Z0 + 44, br * 0.55, br * 0.3, 16);
  a.tube([[sx, cy, Z0 + 44], [sx, cy - 2, Z0 + 80], [sx, cy - 4, Z1 - 70], [sx, cy - 6, Z1 - 40], [sx, cy - 6, Z1 - 10]], [11, 13, 17, 19, 15], 12);
  a.box(sx - 8, cy - 40, Z1 - 100, sx + 8, cy - 14, Z1 - 70); a.ell(sx, cy - 6, Z1 - 12, 14, 14, 10, 10, 6);
  a.cyl(sx - 8, cy - 10, Z1 - 4, Z1 - 1, 5, 8); a.cyl(sx + 8, cy - 10, Z1 - 4, Z1 - 1, 5, 8); a.cyl(sx, cy + 2, Z1 - 1.5, Z1, 4, 8);
  for (let i = 0; i < 3; i++) a.cyl(sx - 8 + i * 8, cy + 10, Z1 - 40 - i * 2, Z1 - 37 - i * 2, 3.2, 6);
  for (let i = 0; i < 4; i++) a.cyl(sx + 8, cy + 12 + 0, Z0 + 30, Z0 + 31, 0.01, 3);
  for (const x of [X0 + 20, X0 + (v.kind === 'compact' ? W : W * 0.5) - 20]) for (const y of [YF + 18, YB - 18]) a.cyl(x, y, Z0, Z0 + 3, 9, 8);
  for (let i = 0; i < 4; i++) a.cyl(sx - 30 + i * 20, YF + 14, Z0 + 28, Z0 + 29.5, 4, 6);
  if (v.kind !== 'compact') {
    const tx0 = X0 + W * 0.56;
    slab(a, tx0, YF, X1, YB, Z0 + 3, Z0 + 30, 20); a.box(tx0 + 14, YF + 12, Z0 + 30, X1 - 14, YB - 12, Z0 + 34);
    a.box(tx0 + 24, cy - 12, Z0 + 34, X1 - 24, cy + 12, Z0 + 38);                             // slot
    for (const [x, hh] of v.kind === 'throttle' ? [[(tx0 + X1) / 2, 62]] : [[tx0 + (X1 - tx0) * 0.3, 62], [tx0 + (X1 - tx0) * 0.7, 54]]) { a.tube([[x, cy, Z0 + 36], [x, cy - 8, Z0 + 36 + hh * 0.7], [x, cy - 12, Z0 + 36 + hh]], [7, 9, 11], 10); a.ell(x, cy - 12, Z0 + 36 + hh + 4, 12, 12, 9, 10, 6); }
    for (let i = 0; i < 5; i++) a.cyl(tx0 + 20 + i * 14, YF + 24, Z0 + 30, Z0 + 31.5, 3.2, 6);
  }
  a.log(`Added the weighted base, rubber boot, tilting stick with a trigger, hat switch and buttons${v.kind === 'compact' ? '' : v.kind === 'throttle' ? ', and a second base with one throttle lever' : ', and a second base with two throttle levers'} (plan and 3D).`);
}

/** a document camera: base pad, jointed gooseneck, camera head with lens and LED bars */
function doccam(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline(); slab(a, X0, YF, X1, YB, Z0, Z0 + 14, 22);
  const bx = cx, by = YB - D * 0.18, hy = YF + D * 0.28, hz = Z1 - 24;
  a.box(bx - 20, by - 18, Z0 + 14, bx + 20, by + 18, Z0 + 40);
  a.tube([[bx, by, Z0 + 40], [bx, by - 6, Z0 + H * 0.4], [bx, by - D * 0.12, Z0 + H * 0.7], [bx, hy + D * 0.2, hz - 10], [bx, hy + D * 0.1, hz - 6]], [12, 10, 10, 10, 10], 8);
  for (let i = 0; i < 6; i++) a.cyl(bx, by - i * 1, Z0 + 60 + i * 3.2, Z0 + 61 + i * 3.2, 0.01, 3);
  a.prism(rr(bx - W * 0.2, hy - 4, bx + W * 0.2, hy + D * 0.36, 8), hz - 16, hz + 16); a.ycyl(hy - 8, hy - 3, bx, hz, 12, 14);
  a.cyl(bx, hy + D * 0.17, hz - 28, hz - 16, 12, 14); a.cyl(bx, hy + D * 0.17, hz - 30, hz - 28, 8, 12);
  const arms = v.arms; for (let i = 0; i < arms; i++) { const s = i ? 1 : -1; a.tube([[bx + s * W * 0.2, hy + D * 0.1, hz - 6], [bx + s * W * 0.34, hy - 6, hz - 20], [bx + s * W * 0.4, hy - 16, hz - 40]], [5, 5, 5], 6); a.box(bx + s * W * 0.4 - 24, hy - 24, hz - 50, bx + s * W * 0.4 + 24, hy - 8, hz - 38); }
  for (let i = 0; i < 4; i++) a.box(bx + W * 0.08 + i * 8, hy - 2, hz + 12, bx + W * 0.08 + i * 8 + 5, hy + D * 0.22, hz + 16);
  a.rect(bx - W * 0.2, hy - 4, bx + W * 0.2, hy + D * 0.36, 'EQUIP-DETAIL'); a.circ(bx, by, 16, 'EQUIP-DETAIL');
  a.log(`Added the rounded base pad, a jointed gooseneck, the camera head with a lens and ${arms > 1 ? 'two lamp arms with LED bars' : 'an LED bar'} (plan and 3D).`);
}

/** a desktop microphone on a stand, on a boom arm with a pop filter, or in a shock mount */
function usbmic(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  const head = (x, y, z, r, len) => { a.ell(x, y, z + len, r, r, r * 0.9, 16, 9); a.cyl(x, y, z, z + len, r, 22); for (let i = 0; i < 4; i++) a.cyl(x, y, z + len * (0.15 + i * 0.2), z + len * (0.15 + i * 0.2) + 1.2, r * 1.03, 22); };
  if (v.kind === 'boom') {
    a.box(cx - 30, YB - 90, Z1 - 80, cx + 30, YB - 10, Z1 - 66); a.box(cx - 30, YB - 18, Z1 - 140, cx + 30, YB - 10, Z1 - 66); a.cyl(cx, YB - 50, Z1 - 66, Z1 - 55, 10, 10); a.rect(cx - 30, YB - 90, cx + 30, YB - 10);
    a.tube([[cx, YB - 50, Z1 - 55], [cx, YB - 50, Z1 - 30], [cx, YB - 150, Z1 - 20], [cx, YF + 110, Z1 - 60]], [8, 7, 6, 6], 8);
    for (let i = 0; i < 10; i++) a.cyl(cx, YB - 50 - i * 0, Z1 - 100, Z1 - 100, 0.01, 3);
    a.tube([[cx, YF + 110, Z1 - 60], [cx, YF + 90, Z1 - 80]], [7, 7], 8);
    const my = YF + 70, mz = Z1 - 190; a.ycyl(my - 28, my + 28, cx, mz + 40, 33, 22); a.ycyl(my - 4, my + 4, cx, mz + 40, 31, 22);
    head(cx, my, mz - 10, 20, 90); a.tube([[cx - 34, my, mz + 20], [cx - 34, my, mz + 80], [cx + 34, my, mz + 80], [cx + 34, my, mz + 20]], [2, 2, 2, 2], 5);
    a.ycyl(YF + 2, YF + 6, cx, mz + 40, 64, 30); a.ycyl(YF, YF + 2, cx, mz + 40, 64, 30); a.cyl(cx, YF + 40, mz - 40, mz - 20, 3, 6);
    a.log('Added the desk clamp, a two-section boom arm with a spring, a mic body with a mesh head in a shock cradle, and a round pop filter (plan and 3D).'); return;
  }
  a.cyl(cx, cy, Z0, Z0 + 14, D * 0.4, 28); a.circ(cx, cy, D * 0.4); a.cyl(cx, cy, Z0 + 14, Z0 + H * 0.3, 12, 10);
  if (v.kind === 'stand') {
    a.tube([[cx - W * 0.42, cy, Z0 + H * 0.45], [cx - W * 0.42, cy, Z0 + H * 0.3], [cx, cy, Z0 + H * 0.26], [cx + W * 0.42, cy, Z0 + H * 0.3], [cx + W * 0.42, cy, Z0 + H * 0.45]], [5, 5, 5, 5, 5], 8);
    a.xcyl(cx - W * 0.5, cx - W * 0.4, cy, Z0 + H * 0.45, 9, 12); a.xcyl(cx + W * 0.4, cx + W * 0.5, cy, Z0 + H * 0.45, 9, 12);
    head(cx, cy, Z0 + H * 0.34, W * 0.34, H * 0.55);
    a.cyl(cx, cy - D * 0.3, Z0 + 14, Z0 + 16, 8, 8);
    a.log('Added the round weighted base, a stem, a U yoke with side knobs, and a capsule body with a mesh head and ring bands (plan and 3D).');
  } else {
    const r = W * 0.3;
    a.cyl(cx, cy, Z0 + H * 0.3, Z0 + H * 0.4, 14, 10); a.ycyl(cy - W * 0.45, cy + W * 0.45, cx, Z0 + H * 0.52, W * 0.44, 28); a.ycyl(cy - W * 0.45 + 2, cy - W * 0.45 + 5, cx, Z0 + H * 0.52, W * 0.45, 28); a.ycyl(cy + W * 0.45 - 5, cy + W * 0.45 - 2, cx, Z0 + H * 0.52, W * 0.45, 28);
    head(cx, cy, Z0 + H * 0.3 + 12, r * 0.75, H * 0.58);
    for (let i = 0; i < 6; i++) { const t = (i / 6) * m.PI * 2; a.tube([[cx + r * 1.1 * m.cos(t), cy + r * 1.1 * m.sin(t) * 0.6, Z0 + H * 0.45], [cx + r * 0.75 * m.cos(t), cy + r * 0.75 * m.sin(t), Z0 + H * 0.45]], [1.2, 1.2], 4); }
    a.log('Added the round base, a short stem, a shock-mount ring with elastic bands, and a large-capsule mic body with a mesh head (plan and 3D).');
  }
}

/** a handheld barcode scanner: gun shaped (corded), in a cradle, or a presentation head on a pole */
function barcode(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  const gun = (gx, gz) => {
    a.prism(rr(gx - W * 0.28, YF, gx + W * 0.28, YF + D * 0.55, 10), gz + H * 0.58, gz + H);
    a.box(gx - W * 0.22, YF - 0 + 0.5, gz + H * 0.64, gx + W * 0.22, YF + 3, gz + H * 0.92); a.cyl(gx, YF + 6, gz + H * 0.98, gz + H, 3, 6);
    a.tube([[gx, YF + D * 0.5, gz + H * 0.62], [gx, YF + D * 0.6, gz + H * 0.3], [gx, YF + D * 0.66, gz + 4]], [W * 0.17, W * 0.2, W * 0.2], 10);
    a.box(gx - 3, YF + D * 0.3, gz + H * 0.45, gx + 3, YF + D * 0.5, gz + H * 0.6);
    led(a, gx + W * 0.12, gz + H * 0.97, YF + D * 0.2, 1.6);
  };
  if (v.kind === 'cord') {
    a.outline(); gun(cx, Z0); a.tube([[cx, YF + D * 0.66, Z0 + 6], [cx, YB - 8, Z0 + 3], [cx + W * 0.3, YB - 4, Z0 + 2]], [3, 3, 3], 5); a.rect(cx - W * 0.28, YF, cx + W * 0.28, YF + D * 0.55, 'EQUIP-DETAIL');
    a.log('Added the gun-shaped body with a window, a trigger, a sloped grip, a status light and a rear cord (plan and 3D).');
  } else if (v.kind === 'cradle') {
    slab(a, X0, YF + D * 0.25, X1, YB, Z0, Z0 + H * 0.28, 16); a.box(cx - W * 0.2, YF + D * 0.5, Z0 + H * 0.28, cx + W * 0.2, YB - 10, Z0 + H * 0.5);
    for (const s of [-1, 1]) a.box(cx + s * W * 0.17 - 3, YF + D * 0.45, Z0 + H * 0.28, cx + s * W * 0.17 + 3, YB - 6, Z0 + H * 0.86);
    gun(cx, Z0 + H * 0.22); a.ycyl(YF + D * 0.25, YF + D * 0.25 + 3, cx, Z0 + H * 0.1, 3, 6); a.rect(cx - W * 0.28, YF + D * 0.25 + 5, cx + W * 0.28, YB - 6, 'EQUIP-DETAIL'); a.outline();
    a.log('Added the base with a back rest and two guides, the scanner standing in it with window, trigger, grip and a charge light (plan and 3D).');
  } else {
    a.outline(); a.cyl(cx, cy, Z0, Z0 + 12, D * 0.42, 24); a.cyl(cx, cy, Z0 + 12, Z0 + H * 0.62, 10, 10);
    a.tube([[cx, cy, Z0 + H * 0.62], [cx, cy + 6, Z0 + H * 0.78]], [8, 8], 8);
    a.prism(rr(cx - W * 0.34, cy - D * 0.4, cx + W * 0.34, cy + D * 0.4, 14), Z0 + H * 0.74, Z1);
    prismX(a, [[YF + 4, Z0 + H * 0.78], [YF + 4, Z1 - 8], [YF + D * 0.3, Z1 - 6], [YF + D * 0.3, Z0 + H * 0.78 + 4]], cx - W * 0.28, cx + W * 0.28);
    a.box(cx - W * 0.22, YF + 2, Z0 + H * 0.8, cx + W * 0.22, YF + 5, Z1 - 14); a.cyl(cx + W * 0.3, YF + 12, Z1, Z1 + 0.01, 0.01, 3); a.circ(cx, cy, D * 0.42, 'EQUIP-DETAIL');
    a.log('Added the round base, a pole with a tilt joint and a wide presentation head with a flat window and indicators (plan and 3D).');
  }
}

/** a thermal receipt printer: rounded body, roll cover, paper out the front, cutter lip, buttons and a light */
function receipt(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, bh = H * 0.5;
  a.outline(); feet(a, X0 + 18, X1 - 18, YF + 18, YB - 18, 7, 4);
  a.prism(rr(X0, YF + 6, X1, YB, 14), Z0 + 4, Z0 + bh); a.poly(rr(X0, YF, X1, YB, 14));
  prismX(a, [[YF + 6, Z0 + bh], [YB, Z0 + bh], [YB, Z1 - 4], [YF + D * 0.18, Z1 - 4], [YF + 6, Z0 + bh + H * 0.12]], X0 + 3, X1 - 3);
  a.box(X0 + W * 0.12, YF, Z0 + bh - 12, X1 - W * 0.12, YF + 8, Z0 + bh);                                      // output slot lip
  a.box(X0 + W * 0.18, YF + 2, Z0 + bh - 2, X1 - W * 0.18, YF + 28, Z0 + bh - 0.5);                               // paper
  a.box(X0 + W * 0.1, YF + D * 0.05, Z0 + bh + H * 0.14, X1 - W * 0.1, YF + D * 0.18, Z0 + bh + H * 0.14 + 3);  // cutter bar
  a.cyl(X0 + W * 0.22, YF + 22, Z0 + bh * 0.62, Z0 + bh * 0.62 + 1.2, 5, 8); led(a, X1 - W * 0.2, Z0 + bh * 0.6, YF + 6, 2.4);
  a.box(X0 + W * 0.7, YF + 6, Z0 + bh * 0.4, X0 + W * 0.84, YF + 9, Z0 + bh * 0.5);
  a.cyl(X1 - 6, YB - 4, Z0 + 14, Z0 + 28, 8, 8);
  if (v.kind === 'kitchen') { a.box(X0 + 20, YF + 6, Z1 - 4, X1 - 20, YB - 20, Z1 - 1); a.box(X0 + 8, YF + 2, Z0 + bh + 6, X1 - 8, YF + 6, Z0 + bh + H * 0.1); }
  a.line(X0 + 3, YF + D * 0.18, X1 - 3, YF + D * 0.18, 'EQUIP-DETAIL');
  a.log(`Added the rounded body, a hinged roll cover, the paper slot with a cutter lip and paper tail, a feed button and a status light${v.kind === 'kitchen' ? ', and a tear bar and impact head cover' : ''} (plan and 3D).`);
}

/** a desktop label printer: compact roll printer, with an outside roll holder, or an industrial case with a window and display */
function labelp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline();
  if (v.kind === 'compact') {
    a.prism(rr(X0, YF, X1, YB, 20), Z0 + 4, Z0 + H * 0.72); a.poly(rr(X0, YF, X1, YB, 20)); feet(a, X0 + 20, X1 - 20, YF + 20, YB - 20, 7, 4);
    prismX(a, [[YF, Z0 + H * 0.72], [YB, Z0 + H * 0.72], [YB - 10, Z1], [YF + 6, Z1 - 6]], X0 + 4, X1 - 4);
    a.box(X0 + W * 0.14, YF - 0, Z0 + H * 0.42, X1 - W * 0.14, YF + 5, Z0 + H * 0.52); a.box(X0 + W * 0.2, YF - 0, Z0 + H * 0.28, X1 - W * 0.2, YF + 16, Z0 + H * 0.3);
    a.cyl(cx, YF + 3, Z0 + H * 0.2, Z0 + H * 0.22, 8, 8); led(a, cx - W * 0.25, Z0 + H * 0.58, YF + 2, 2);
    a.log('Added the rounded body, a domed roll cover, the label exit slot with an extended label, a feed button and a light (plan and 3D).'); return;
  }
  if (v.kind === 'wide') {
    a.prism(rr(X0, YF, X1, YF + D * 0.7, 14), Z0 + 4, Z0 + H * 0.5); a.poly(rr(X0, YF, X1, YF + D * 0.7, 14)); feet(a, X0 + 20, X1 - 20, YF + 20, YF + D * 0.7 - 20, 7, 4);
    a.box(X0 + 6, YF + D * 0.36, Z0 + H * 0.5, X1 - 6, YF + D * 0.7, Z0 + H * 0.64); a.box(X0 + W * 0.1, YF + 4, Z0 + H * 0.14, X1 - W * 0.1, YF + 12, Z0 + H * 0.2);
    a.box(X0 + W * 0.15, YF, Z0 + H * 0.38, X1 - W * 0.15, YF + 4, Z0 + H * 0.45);
    a.box(X0 + 20, YF + D * 0.1, Z0 + H * 0.5, X0 + 70, YF + D * 0.32, Z0 + H * 0.58);
    for (const x of [X0 + W * 0.18, X1 - W * 0.18]) a.tube([[x, YB - 40, Z0 + H * 0.4], [x, YB - 40, Z1 - 6], [x, YF + D * 0.7, Z0 + H * 0.64]], [4, 4, 4], 6);
    a.xcyl(X0 + W * 0.18 + 6, X1 - W * 0.18 - 6, YB - 40, Z1 - 14, 3, 8);
    a.xcyl(X0 + W * 0.26, X1 - W * 0.26, YB - 40, Z1 - 20 - H * 0.0, H * 0.24, 22); a.xcyl(X0 + W * 0.26, X1 - W * 0.26, YB - 40, Z1 - 20, H * 0.07, 12);
    a.log('Added the printer body with an exit slot and a control strip, a rear roll holder on two arms carrying a large label roll (plan and 3D).'); return;
  }
  a.box(X0, YF + 8, Z0 + 4, X1, YB, Z1 - H * 0.3); feet(a, X0 + 24, X1 - 24, YF + 24, YB - 24, 8, 4);
  prismX(a, [[YF + 8, Z1 - H * 0.3], [YB, Z1 - H * 0.3], [YB, Z1], [YF + D * 0.25, Z1]], X0, X1);
  plate(a, X0 + 20, Z0 + H * 0.28, X1 - 20, Z1 - H * 0.36, YF, YF + 8, 14); a.box(X0 + 30, YF + 3, Z0 + H * 0.3, X1 - 30, YF + 9, Z1 - H * 0.38);
  a.xcyl(X0 + 40, X0 + 60, YF + 30, Z0 + H * 0.52, H * 0.18, 20); a.xcyl(X0 + 40, X0 + 60, YF + 30, Z0 + H * 0.52, H * 0.05, 10); a.xcyl(X1 - 90, X1 - 60, YF + 30, Z0 + H * 0.52, H * 0.12, 16);
  a.box(cx - 30, YF + 6, Z1 - H * 0.28, cx + 30, YF + 10, Z1 - H * 0.08); a.box(X1 - 80, YF + 4, Z1 - H * 0.26, X1 - 24, YF + 9, Z1 - H * 0.12);
  for (let i = 0; i < 3; i++) a.cyl(X0 + 30 + i * 14, YF + 4, Z1 - H * 0.12, Z1 - H * 0.12 + 1, 4, 6);
  a.box(X0 + 10, YF, Z0 + H * 0.12, X1 - 10, YF + 6, Z0 + H * 0.22);
  a.log('Added the metal case with a clear window showing a label roll and a ribbon roll, a display and keys, an exit lip and a hinged top lid (plan and 3D).');
}

/** a wide-format plotter on its stand: body with roll bays and a touch panel, a basket, two legs with a cross bar */
function plotter(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bz = Z0 + H * 0.4;
  a.outline(); a.rect(X0 + 40, YF + 20, X1 - 40, YB - 20, 'EQUIP-DETAIL');
  a.prism(rr(X0, YF + D * 0.1, X1, YB - D * 0.08, 30), bz, Z1 - H * 0.1); prismX(a, [[YF + D * 0.1, Z1 - H * 0.1], [YB - D * 0.08, Z1 - H * 0.1], [YB - D * 0.08 - 60, Z1], [YF + D * 0.1 + 50, Z1]], X0 + 20, X1 - 20);
  a.box(X0 + W * 0.08, YF + D * 0.1 - 2, bz + H * 0.08, X1 - W * 0.08, YF + D * 0.1, bz + H * 0.12);                // media slot
  a.box(X0 + W * 0.05, YF + D * 0.1 - 6, Z1 - H * 0.28, X0 + W * 0.05 + 18, YF + D * 0.1, Z1 - H * 0.12);
  plate(a, X1 - W * 0.22, Z1 - H * 0.28, X1 - W * 0.06, Z1 - H * 0.12, YF + D * 0.1 - 10, YF + D * 0.1, 8);
  for (let i = 0; i < 4; i++) a.cyl(X1 - W * 0.2 + i * 14, YF + D * 0.1 - 10, Z1 - H * 0.2, Z1 - H * 0.2 + 1, 3, 6);
  for (const z of [bz + H * 0.2, bz + H * 0.33]) a.box(X0 + W * 0.2, YF + D * 0.1 - 1.5, z, X1 - W * 0.2, YF + D * 0.1, z + H * 0.09);
  a.box(X0, YF + D * 0.1 + 6, Z1 - H * 0.1, X0 + 30, YF + D * 0.1 + 30, Z1 - H * 0.1 + 14); a.box(X1 - 30, YF + D * 0.1 + 6, Z1 - H * 0.1, X1, YF + D * 0.1 + 30, Z1 - H * 0.1 + 14);
  const lx = [X0 + W * 0.08, X1 - W * 0.08];
  for (const x of lx) { a.box(x - 20, YF + D * 0.2, Z0 + 40, x + 20, YB - D * 0.18, bz); a.box(x - 24, YF + D * 0.2, Z0 + 14, x + 24, YB - D * 0.14, Z0 + 40); for (const y of [YF + D * 0.24, YB - D * 0.2]) a.caster(x, y, 40); }
  a.box(lx[0], YB - D * 0.17, Z0 + H * 0.2, lx[1], YB - D * 0.17 + 10, Z0 + H * 0.2 + 20);
  const by = YF + D * 0.1 - 6;
  for (const x of lx) a.tube([[x, by - 6, bz - H * 0.1], [x, YF + 4, bz - H * 0.18], [x, YF + 4, bz - H * 0.24]], [6, 6, 6], 6);
  a.xcyl(lx[0], lx[1], YF + 4, bz - H * 0.24, 5, 8);
  prismX(a, [[by - 6, bz - H * 0.1], [YF + 14, bz - H * 0.26], [YF + 4, bz - H * 0.22], [YF + 4, bz - H * 0.18]], lx[0] + 2, lx[1] - 2);
  a.log(`Added the wide body with a media slot, two roll bays, a touch panel and a top lid, a stand of two legs on casters with a cross bar, and a front basket with a sagging sheet catcher (plan and 3D).`);
}

/** a USB flash drive lying flat: swivel with a metal band, capped body with a lanyard loop, or a body with a slider */
function flash(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, plugD = D * 0.34;
  a.outline();
  const bd0 = YF + plugD;
  if (v.kind === 'swivel') {
    a.prism(rr(X0 + 1, bd0 + D * 0.34, X1 - 1, YB, 3), Z0 + H * 0.1, Z1 - H * 0.1); a.poly(rr(X0, bd0, X1, YB, 3));
    a.frame(X0, Z0, X1, Z1, bd0 - 2, YB, 2); a.box(X0, bd0 - 2, Z0, X1, bd0 + D * 0.5, Z0 + 1.2); a.box(X0, bd0 - 2, Z1 - 1.2, X1, bd0 + D * 0.5, Z1);
    a.xcyl(X0, X1, bd0 + D * 0.3, (Z0 + Z1) / 2, H * 0.1, 8); a.box(X0 + W * 0.15, YB - 3, Z0 + H * 0.2, X1 - W * 0.15, YB, Z1 - H * 0.2);
  } else if (v.kind === 'cap') {
    slab(a, X0 + 0.5, bd0, X1 - 0.5, YB - D * 0.28, Z0, Z1, 3); a.prism(rr(X0, YB - D * 0.3, X1, YB, 3), Z0, Z1); a.ycyl(YB - 6, YB, cx, (Z0 + Z1) / 2, H * 0.38, 12); a.ycyl(YB - 3, YB - 1, cx, (Z0 + Z1) / 2, H * 0.14, 8);
    a.line(X0, YB - D * 0.3, X1, YB - D * 0.3, 'EQUIP-DETAIL'); a.ycyl(bd0, bd0 + 1.5, cx, Z0 + H * 0.5, 1.2, 6);
  } else {
    slab(a, X0, bd0, X1, YB, Z0, Z1, 3); a.box(cx - 1.5, bd0 + D * 0.2, Z1, cx + 1.5, bd0 + D * 0.55, Z1 + 0.01); a.box(cx - W * 0.25, bd0 + D * 0.2, Z1 - 0.01, cx + W * 0.25, bd0 + D * 0.3, Z1); a.box(cx - W * 0.3, YB - D * 0.1, Z0 + 1, cx + W * 0.3, YB - D * 0.05, Z1 - 1);
    a.box(cx - 1.2, bd0 + D * 0.2, Z1 - 0.8, cx + 1.2, bd0 + D * 0.55, Z1);
  }
  a.box(cx - W * 0.4, YF + 1, Z0 + H * 0.2, cx + W * 0.4, bd0 + 1, Z1 - H * 0.2); a.box(cx - W * 0.28, YF, Z0 + H * 0.3, cx + W * 0.28, YF + 2, Z1 - H * 0.3); a.rect(cx - W * 0.4, YF, cx + W * 0.4, bd0, 'EQUIP-DETAIL');
  a.log(`Added the metal plug with contacts and ${v.kind === 'swivel' ? 'a swivelling metal band around the body' : v.kind === 'cap' ? 'a removable cap with a lanyard loop beside the rounded body' : 'a rounded body with a retraction slider'} (plan and 3D).`);
}

/** a pen display: thin sloped screen on rear stand legs with an express key column and a pen */
function pendisp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, th = 12;
  a.outline();
  prismX(a, [[YF, Z0 + 20], [YF + th * 1.3, Z0 + 20 + th * 0.2], [YB - 60, Z1], [YB - 60 - th, Z1 - 1]], X0, X1 - W * 0.05);
  const f = (k) => [YF + (YB - 60 - YF) * k, Z0 + 20 + (Z1 - Z0 - 20) * k];
  const [p0, p1] = [f(0.1), f(0.93)]; prismX(a, [[p0[0] - 2, p0[1]], [p0[0] + 0.6, p0[1]], [p1[0] + 0.6, p1[1]], [p1[0] - 2, p1[1]]], X0 + W * 0.1, X1 - W * 0.12);
  for (let i = 0; i < v.keys; i++) { const k = 0.2 + (i * 0.6) / m.max(1, v.keys - 1), [yy, zz] = f(k); a.box(X0 + 10, yy - 3, zz - 6, X0 + W * 0.06, yy + 1, zz + 6); }
  a.xcyl(cx - 60, cx + 60, YB - 60, Z1 - 6, 4, 8);
  for (const x of [X0 + W * 0.22, X1 - W * 0.22]) { a.tube([[x, YB - 70, Z1 - 20], [x, YB - 4, Z0 + 6]], [4, 4], 6); a.box(x - 9, YB - 12, Z0, x + 9, YB, Z0 + 8); }
  a.box(X0 + 14, YF, Z0 + 4, X1 - 14, YF + 12, Z0 + 14);
  a.tube([[X1 - 34, YF + 6, Z0 + 22], [X1 - 28, YF + 6, Z0 + 16 + 100]].slice(0, 2), [3, 3], 6);
  a.rect(X0, YF, X1, YB - 60, 'EQUIP-DETAIL');
  a.log(`Added the thin sloped screen with a glass inset, ${v.keys} express keys down one side, a rear stand with two legs and a bar, and a pen on its shelf (plan and 3D).`);
}

/** a CAD-style 3D mouse: weighted base with a pushable knob cap, optionally flanked by key columns */
function mouse3d(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline();
  slab(a, X0, YF, X1, YB, Z0 + 2, Z0 + H * 0.45, m.min(W, D) * (v.keys ? 0.16 : 0.5)); feet(a, X0 + 14, X1 - 14, YF + 14, YB - 14, 5, 2);
  const kr = m.min(W, D) * (v.keys ? 0.3 : 0.38);
  a.cyl(cx, cy, Z0 + H * 0.45, Z0 + H * 0.6, kr * 1.1, 28); a.cyl(cx, cy, Z0 + H * 0.6, Z1 - 4, kr * 0.85, 28); a.cone(cx, cy, Z1 - 4, Z1, kr * 0.85, kr * 0.7, 28);
  a.circ(cx, cy, kr * 1.1, 'EQUIP-DETAIL'); a.circ(cx, cy, kr * 0.85, 'EQUIP-DETAIL');
  if (v.keys) {
    for (const s of [-1, 1]) for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
      const x0 = s < 0 ? X0 + 10 + c * 26 : X1 - 10 - 24 - c * 26, y0 = YF + 14 + r * ((D - 28) / 4);
      a.prism(rr(x0, y0, x0 + 24, y0 + (D - 28) / 4 - 4, 3), Z0 + H * 0.45, Z0 + H * 0.45 + 4);
    }
    a.box(cx - kr * 1.1, YF + 6, Z0 + H * 0.45, cx + kr * 1.1, YF + 14, Z0 + H * 0.45 + 3);
    a.log('Added the weighted base with eight keys on each side, and a pushable knob cap with a ring collar (plan and 3D).');
  } else a.log('Added the weighted round base with rubber feet and a pushable knob cap on a ring collar (plan and 3D).');
}

/** a macro key pad: wedge with a grid of keys, an LCD strip and rotary dials */
function macropad(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, sl = (y) => Z0 + 8 + (H * 0.6 - 8) * ((y - YF) / D);
  prismX(a, [[YF, Z0 + 2], [YB, Z0 + 2], [YB, Z0 + H * 0.6], [YF, Z0 + 8]], X0, X1); a.rect(X0, YF, X1, YB);
  const kx0 = X0 + W * 0.08, kx1 = X1 - W * 0.08 - (v.dials ? W * 0.18 : 0), ky0 = YF + D * 0.1, ky1 = YB - D * (v.lcd ? 0.32 : 0.1);
  const cw = (kx1 - kx0) / v.cols, rh = (ky1 - ky0) / v.rows;
  for (let r = 0; r < v.rows; r++) for (let c = 0; c < v.cols; c++) { const yc = ky0 + rh * (r + 0.5); a.prism(rr(kx0 + c * cw + 2, ky0 + r * rh + 2, kx0 + (c + 1) * cw - 2, ky0 + (r + 1) * rh - 2, 3), sl(yc), sl(yc) + 6); }
  a.rect(kx0, ky0, kx1, ky1, 'EQUIP-DETAIL');
  if (v.lcd) a.box(kx0, YB - D * 0.26, sl(YB - D * 0.26) - 0.5, kx1, YB - D * 0.1, sl(YB - D * 0.1) + 1);
  for (let i = 0; i < v.dials; i++) { const dy = YF + D * (0.25 + i * 0.4); a.cyl((kx1 + X1 - W * 0.04) / 2 + 2, dy, sl(dy), sl(dy) + 14, W * 0.07, 16); a.circ((kx1 + X1 - W * 0.04) / 2 + 2, dy, W * 0.07, 'EQUIP-DETAIL'); }
  a.box(X1 - 14, YB - 3, Z0 + 4, X1 - 4, YB, Z0 + 10);
  a.log(`Added the wedge body with a ${v.cols} by ${v.rows} grid of keys${v.lcd ? ', an LCD strip' : ''}${v.dials ? ' and rotary dials' : ''} (plan and 3D).`);
}

const PER = [
  fam({ cat: 'computer/peripherals', title: 'Generic computer speakers',
    desc: (v) => v.kind === 'bar' ? 'Soundbar for a desk: long cabinet with end drivers, a ribbed front grille, two feet, a power light and top buttons.' : v.kind === 'sub' ? 'Two satellite cabinets with woofer and tweeter plus a subwoofer with a large driver and a port, joined by a link lead.' : 'Two cabinets, each with a woofer, a tweeter, a port and a rubber foot, joined by a link lead.',
    vs: [['stereo pair', 14, 5, 7, 0, { kind: 'pair' }], ['2.1 with subwoofer', 22, 9.5, 9.5, 0, { kind: 'sub' }], ['desk soundbar', 24, 3.2, 2.8, 0, { kind: 'bar' }]],
    build: speaker }),
  fam({ cat: 'computer/peripherals', title: 'Generic trackball',
    desc: (v) => `Trackball with a low shell, a ${v.r} in ball in a cup ring with sensor lugs, ${v.kind === 'thumb' ? 'two large buttons and a scroll wheel' : 'four buttons'}${v.kind === 'pro' ? ' and a padded wrist rest' : ''}.`,
    vs: [['thumb ball', 5.4, 4.8, 2.6, 0, { kind: 'thumb', r: 1.4 }], ['finger ball', 5.6, 5.6, 2.8, 0, { kind: 'finger', r: 2.2 }], ['with wrist rest', 6.2, 8.2, 3.2, 0, { kind: 'pro', r: 2.2 }]],
    build: trackball }),
  fam({ cat: 'computer/peripherals', title: 'Generic joystick',
    desc: (v) => `Joystick on a weighted base with a rubber boot, a stick with trigger, hat switch and buttons${v.kind === 'compact' ? '' : v.kind === 'throttle' ? ', plus a second base with one throttle lever' : ', plus a second base with two throttle levers'}.`,
    vs: [['compact stick', 7, 8, 11, 0, { kind: 'compact' }], ['stick and throttle', 14, 8.5, 11.5, 0, { kind: 'throttle' }], ['stick and dual throttle', 15.5, 8.5, 11.5, 0, { kind: 'dual' }]],
    build: joystick }),
  fam({ cat: 'computer/peripherals', title: 'Generic document camera',
    desc: (v) => `Document camera with a rounded base pad, a jointed gooseneck and a camera head with a lens and ${v.arms > 1 ? 'two lamp arms with LED bars' : 'an LED bar'}.`,
    vs: [['compact, A4', 7, 9, 14, 0, { arms: 1 }], ['standard, A3', 10, 12, 18, 0, { arms: 2 }], ['large, tabloid', 13, 15.5, 24, 0, { arms: 2 }]],
    build: doccam }),
  fam({ cat: 'computer/peripherals', title: 'Generic USB microphone',
    desc: (v) => v.kind === 'boom' ? 'Desk-clamp boom arm with a spring, a mic body with a mesh head in a shock cradle, and a round pop filter.' : v.kind === 'shock' ? 'Podcast microphone with a large capsule head, a shock-mount ring with elastic bands, a short stem and a round base.' : 'Desk microphone with a round weighted base, a U yoke with side knobs and a capsule body with a mesh head and ring bands.',
    vs: [['desk stand', 6, 6, 11, 0, { kind: 'stand' }], ['shock mount podcast', 5, 5, 11, 0, { kind: 'shock' }], ['boom arm and pop filter', 5, 18, 14, 0, { kind: 'boom' }]],
    build: usbmic }),
  fam({ cat: 'computer/peripherals', title: 'Generic barcode scanner',
    desc: (v) => v.kind === 'cord' ? 'Gun-shaped scanner with a window, a trigger, a sloped grip, a status light and a rear cord.' : v.kind === 'cradle' ? 'Gun-shaped scanner standing in a base with a back rest and two guides, with a charge light.' : 'Presentation scanner: round base, a pole with a tilt joint and a wide flat-window head with indicators.',
    vs: [['corded gun', 3.4, 6.4, 6.6, 0, { kind: 'cord' }], ['gun in cradle', 4.6, 7.6, 7, 0, { kind: 'cradle' }], ['presentation stand', 5, 6, 9, 0, { kind: 'stand' }]],
    build: barcode }),
  fam({ cat: 'computer/peripherals', title: 'Generic receipt printer',
    desc: (v) => `Thermal receipt printer with a rounded body, a hinged roll cover, the paper slot with a cutter lip and paper tail, a feed button and a status light${v.kind === 'kitchen' ? ', and a tear bar and impact head cover' : ''}.`,
    vs: [['58 mm compact', 4.6, 6, 4.6, 0, { kind: 'std' }], ['80 mm counter', 5.8, 7.4, 5.4, 0, { kind: 'std' }], ['80 mm kitchen', 6.6, 8, 6.4, 0, { kind: 'kitchen' }]],
    build: receipt }),
  fam({ cat: 'computer/peripherals', title: 'Generic label printer',
    desc: (v) => v.kind === 'compact' ? 'Compact label printer with a domed roll cover, an exit slot with an extended label, a feed button and a light.' : v.kind === 'wide' ? 'Label printer with an exit slot and control strip and a rear roll holder on two arms carrying a large roll.' : 'Industrial label printer with a metal case, a clear window showing label and ribbon rolls, a display and keys, and a hinged lid.',
    vs: [['compact', 4.4, 7, 5, 0, { kind: 'compact' }], ['wide with roll holder', 8, 10.5, 9, 0, { kind: 'wide' }], ['industrial', 10, 14, 11.5, 0, { kind: 'industrial' }]],
    build: labelp }),
  fam({ cat: 'computer/peripherals', title: 'Generic wide-format plotter',
    desc: 'Large-format plotter on its stand: a wide body with a media slot, two roll bays, a touch panel and a top lid, two legs on casters with a cross bar, and a front sheet basket.',
    vs: [['24 in, roll fed', 41, 26, 44, 0, {}], ['36 in, roll fed', 52, 28, 46, 0, {}], ['44 in, roll fed', 63, 29, 48, 0, {}]],
    build: plotter }),
  fam({ cat: 'computer/peripherals', title: 'Generic USB flash drive',
    desc: (v) => `USB flash drive lying flat with a metal plug and contacts and ${v.kind === 'swivel' ? 'a swivelling metal band around the body' : v.kind === 'cap' ? 'a removable cap with a lanyard loop beside the rounded body' : 'a rounded body with a retraction slider'}.`,
    vs: [['swivel band', 0.75, 2.2, 0.45, 0, { kind: 'swivel' }], ['capped', 0.7, 2.5, 0.4, 0, { kind: 'cap' }], ['slider', 0.8, 2.1, 0.4, 0, { kind: 'slide' }]],
    build: flash }),
  fam({ cat: 'computer/peripherals', title: 'Generic pen display',
    desc: (v) => `Thin sloped pen screen with a glass inset, ${v.keys} express keys down one side, a rear stand with two legs and a bar, and a pen on its shelf.`,
    vs: [['13 in, 4 keys', 13.5, 7.5, 10.5, 0, { keys: 4 }], ['16 in, 6 keys', 17, 9, 13, 0, { keys: 6 }], ['22 in, 8 keys', 23, 11, 17.5, 0, { keys: 8 }]],
    build: pendisp }),
  fam({ cat: 'computer/peripherals', title: 'Generic 3D navigation mouse',
    desc: (v) => v.keys ? 'Weighted base with eight keys on each side and a pushable knob cap on a ring collar.' : 'Weighted round base with rubber feet and a pushable knob cap on a ring collar.',
    vs: [['knob only', 3.4, 3.4, 2.1, 0, { keys: 0 }], ['knob with keys', 9.5, 5.4, 2.4, 0, { keys: 1 }]],
    build: mouse3d }),
  fam({ cat: 'computer/peripherals', title: 'Generic macro key pad',
    desc: (v) => `Wedge key pad with a ${v.cols} by ${v.rows} grid of keys${v.lcd ? ', an LCD strip' : ''}${v.dials ? ' and rotary dials' : ''}.`,
    vs: [['6 keys', 4.2, 3.4, 1.2, 0, { cols: 3, rows: 2, lcd: 0, dials: 0 }], ['15 keys, LCD and dials', 8.4, 5.4, 1.7, 0, { cols: 5, rows: 3, lcd: 1, dials: 2 }]],
    build: macropad }),
];

// ------------------------------------------------------------------------------------------ servers and data-centre gear
/** a chassis box between rack ears with the face set back */
function rackBody(a, u, face = 8) { a.outline(); a.rect(a.X0 + 16, a.YF + 5, a.X1 - 16, a.YB, 'EQUIP-DETAIL'); a.box(a.X0 + 18, a.YF + face, a.Z0 + 1.5, a.X1 - 18, a.YB, a.Z1 - 1); return ears(a, u, a.YF + 2, 4); }

/** a rack shelf: pan between ears with a front flange, side lips; vented slots or slide rails */
function rshelf(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, u = v.u, ear = ears(a, u, YF, 4);
  a.outline(); a.rect(X0 + ear, YF, X1 - ear, YB, 'EQUIP-DETAIL');
  a.box(X0 + ear, YF, Z0 + 1, X1 - ear, YF + 3, Z1 - 1);                                                  // front flange
  for (let i = 0; i < 6; i++) a.box(X0 + ear + 30 + i * ((W - 2 * ear - 60) / 5), YF - 1.2, Z0 + H * 0.3, X0 + ear + 38 + i * ((W - 2 * ear - 60) / 5), YF + 0.5, Z1 - H * 0.3);
  if (v.kind === 'vent') for (let i = 0; i < 22; i++) a.box(X0 + ear + 4 + i * ((W - 2 * ear - 8) / 22), YF + 3, Z0 + 2, X0 + ear + 4 + i * ((W - 2 * ear - 8) / 22) + (W - 2 * ear - 8) / 22 - 6, YB - 24, Z0 + 5);
  else a.box(X0 + ear, YF + 3, Z0 + 2, X1 - ear, YB - (v.kind === 'slide' ? D * 0.55 : 24), Z0 + 5);
  for (const x of [X0 + ear, X1 - ear - 3]) a.box(x, YF + 3, Z0 + 2, x + 3, YB - (v.kind === 'slide' ? D * 0.55 : 24), Z0 + H * 0.55);
  if (v.kind === 'slide') {
    for (const x of [X0 + ear - 0, X1 - ear - 6]) { a.box(x, YF + 3, Z0 + H * 0.5, x + 6, YB, Z0 + H * 0.5 + 10); a.box(x, YF + 3, Z0 + H * 0.5 + 10, x + 6, YF + D * 0.5, Z0 + H * 0.5 + 12); }
    a.box(X0 + ear + 4, YB - D * 0.55, Z0 + 2, X1 - ear - 4, YB - 20, Z0 + 5); a.box(X0 + ear + 4, YB - 40, Z0 + 5, X1 - ear - 4, YB - 20, Z0 + 12);
    a.box(cx - 40, YF - 0, Z0 + H * 0.4, cx + 40, YF + 6, Z0 + H * 0.4 + 10); a.log(`Added the ${u}U pan with a front flange and side lips, two telescoping slide rails with a rear stop and a pull handle (plan and 3D).`); return;
  }
  a.box(X0 + ear, YB - 24, Z0 + 2, X1 - ear, YB - 20, Z0 + H * 0.6); for (let i = 0; i < 4; i++) a.box(X0 + ear + 40 + i * ((W - 2 * ear - 80) / 3), YB - 20, Z0 + 12, X0 + ear + 52 + i * ((W - 2 * ear - 80) / 3), YB - 14, Z0 + 22);
  a.log(`Added the ${u}U ${v.kind === 'vent' ? 'slotted ' : ''}pan with a front flange, side lips, a rear lip with tie-down loops and rack ears (plan and 3D).`);
}

/** a tape library: magazine doors, a robot window, drive sleds and a small touch display */
function tape(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, u = v.u, ear = rackBody(a, u, 10), fx0 = X0 + ear + 6, fx1 = X1 - ear - 6, fw = fx1 - fx0;
  const mw = fw * 0.28;
  for (const x0 of [fx0, fx0 + mw + 4]) { a.box(x0, YF + 6, Z0 + 5, x0 + mw, YF + 10, Z1 - 5); const rows = m.max(2, u * 2 + 1); for (let r = 0; r < rows; r++) a.box(x0 + 4, YF + 2, Z0 + 10 + r * ((Z1 - Z0 - 20) / rows), x0 + mw - 4, YF + 6, Z0 + 10 + r * ((Z1 - Z0 - 20) / rows) + (Z1 - Z0 - 20) / rows - 3); a.box(x0 + mw * 0.3, YF, Z0 + (Z1 - Z0) * 0.45, x0 + mw * 0.7, YF + 3, Z0 + (Z1 - Z0) * 0.55); }
  const wx0 = fx0 + 2 * mw + 8, wx1 = fx0 + 2 * mw + 8 + fw * 0.26; a.frame(wx0, Z0 + 5, wx1, Z1 - 5, YF + 4, YF + 10, 6); a.box(wx0 + 6, YF + 6, Z0 + 11, wx1 - 6, YF + 8, Z1 - 11); a.box(wx0 + 14, YF + 8, Z0 + 14, wx0 + 24, YF + 14, Z1 - 14);
  const dx0 = wx1 + 6, nd = u >= 4 ? 4 : 2;
  for (let i = 0; i < nd; i++) { const zz0 = Z0 + 6 + i * ((Z1 - Z0 - 12 - (u >= 2 ? 40 : 0)) / nd), zz1 = zz0 + (Z1 - Z0 - 12 - (u >= 2 ? 40 : 0)) / nd - 3; a.box(dx0, YF + 5, zz0, fx1, YF + 10, zz1); a.box(dx0 + 10, YF + 2, (zz0 + zz1) / 2 - 3, fx1 - 30, YF + 5, (zz0 + zz1) / 2 + 3); led(a, fx1 - 12, (zz0 + zz1) / 2, YF + 10, 2); a.box(fx1 - 24, YF + 3, zz0 + 4, fx1 - 18, YF + 5, zz1 - 4); }
  if (u >= 2) { a.box(dx0, YF + 5, Z1 - 40, fx1, YF + 9, Z1 - 6); a.box(dx0 + 4, YF + 9, Z1 - 36, fx1 - 4, YF + 10, Z1 - 10); for (let i = 0; i < 3; i++) a.cyl(dx0 + 14 + i * 14, YF + 10, Z1 - 8, Z1 - 7, 3, 6); }
  for (let i = 0; i < 2; i++) a.box(X0 + ear + 10 + i * 90, YB - 3, Z0 + 4, X0 + ear + 90 + i * 90, YB, Z1 - 5); a.box(cx + 10, YB - 3, Z0 + 4, X1 - ear - 10, YB, Z1 - 5);
  a.log(`Added the ${u}U chassis with two magazine doors with cartridge slots, a robot window, ${nd} drive sleds${u >= 2 ? ', a small touch display' : ''}, and rear power and fan bays (plan and 3D).`);
}

/** an in-row cooling unit: tall perforated door, a display, status lights, rear fan bank, top pipe stubs, levelling plinth */
function inrow(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, pl = 80;
  a.outline(); a.rect(X0 + 6, YF + 6, X1 - 6, YB - 6, 'EQUIP-DETAIL');
  a.box(X0 + 6, YF + 6, Z0 + 20, X1 - 6, YB - 6, Z1 - 34);
  a.box(X0, YF, Z0 + 20, X1, YB, Z0 + pl); for (const x of [X0 + 24, X1 - 24]) for (const y of [YF + 24, YB - 24]) a.cyl(x, y, Z0, Z0 + 20, 12, 8);
  a.box(X0 + 4, YF + 2, Z0 + pl + 6, X1 - 4, YF + 12, Z1 - 160);
  ribs(a, X0 + 14, Z0 + pl + 20, X1 - 14, Z1 - 180, YF, m.round((Z1 - Z0 - pl - 200) / 14), true, 3, 2);
  a.box(X0 + W * 0.12, YF, Z1 - 150, X1 - W * 0.12, YF + 8, Z1 - 70); a.box(X0 + W * 0.2, YF + 8, Z1 - 138, X1 - W * 0.2, YF + 9, Z1 - 100);
  for (let i = 0; i < 4; i++) led(a, X0 + W * 0.2 + i * (W * 0.6 / 3), Z1 - 60, YF + 6, 3);
  a.box(X1 - 36, YF, Z0 + (Z1 - Z0) * 0.5, X1 - 28, YF + 12, Z0 + (Z1 - Z0) * 0.6);
  for (const s of [0, 1]) a.xcyl(X0 - 0, X0 + 8, YF + 10, Z0 + pl + 60 + s * (Z1 - Z0 - 380), 6, 8);
  const nf = v.fans, fr = m.min(W * 0.42, 70);
  for (let i = 0; i < nf; i++) fan(a, cx, Z0 + pl + 80 + fr + i * ((Z1 - Z0 - pl - 340 - fr) / m.max(1, nf - 1)), fr, YB - 8, YB);
  a.cyl(cx - W * 0.2, YB - 60, Z1 - 34, Z1 - 4, 22, 12); a.cyl(cx + W * 0.2, YB - 60, Z1 - 34, Z1 - 4, 22, 12);
  a.cyl(cx - W * 0.2, YB - 60, Z1 - 4, Z1 - 1, 30, 12); a.cyl(cx + W * 0.2, YB - 60, Z1 - 4, Z1 - 1, 30, 12);
  a.box(X0 + 6, YB - 34, Z1 - 34, X1 - 6, YB - 6, Z1 - 20);
  a.log(`Added the plinth with levelling feet, a perforated front door with a display and status lights, ${nf} rear fans, and two pipe stubs on the roof (plan and 3D).`);
}

/** a horizontal cable manager: finger duct with a hinged cover, brush slot or D-rings */
function hcm(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, u = v.u, ear = ears(a, u, YF, 4);
  a.outline(); a.rect(X0 + ear, YF, X1 - ear, YB, 'EQUIP-DETAIL');
  a.box(X0 + ear, YB - 6, Z0 + 1, X1 - ear, YB, Z1 - 1); a.box(X0 + ear, YF, Z0 + 1, X1 - ear, YB, Z0 + 4); a.box(X0 + ear, YF, Z1 - 4, X1 - ear, YB, Z1 - 1);
  if (v.kind === 'finger') {
    const n = 16, step = (W - 2 * ear - 20) / n;
    for (let i = 0; i <= n; i++) a.box(X0 + ear + 10 + i * step - 3, YF, Z0 + 4, X0 + ear + 10 + i * step + 3, YB - 6, Z1 - 4);
    a.box(X0 + ear + 6, YF + 0, Z0 + 4, X1 - ear - 6, YF + 1.5, Z1 - 4); for (let i = 0; i < 4; i++) a.cyl(X0 + ear + 20 + i * ((W - 2 * ear - 40) / 3), YF - 0.01 + 1.5, Z0 + H * 0.5, Z0 + H * 0.5 + 0.1, 2, 6);
    a.log(`Added the ${u}U duct with ${n + 1} slotted fingers, a hinged front cover, back wall and rack ears (plan and 3D).`);
  } else if (v.kind === 'brush') {
    a.box(X0 + ear, YF, Z0 + 4, X1 - ear, YF + 12, Z0 + H * 0.38); a.box(X0 + ear, YF, Z1 - H * 0.38, X1 - ear, YF + 12, Z1 - 4);
    for (let i = 0; i < 40; i++) a.box(X0 + ear + 8 + i * ((W - 2 * ear - 16) / 40), YF + 2, Z0 + H * 0.38, X0 + ear + 8 + i * ((W - 2 * ear - 16) / 40) + 3, YF + 12, Z0 + H * 0.38 + 3 + (i % 2));
    a.log(`Added the ${u}U box with a brush-lined cable slot, back wall and rack ears (plan and 3D).`);
  } else {
    for (let i = 0; i < 4; i++) { const x = X0 + ear + 50 + i * ((W - 2 * ear - 100) / 3); a.tube([[x - 22, YF, Z0 + 4], [x - 22, YF + 36, Z0 + 4], [x - 22, YF + 36, Z1 - 4], [x - 22, YF, Z1 - 4]], [3, 3, 3, 3], 6); a.tube([[x + 22, YF, Z0 + 4], [x + 22, YF + 36, Z0 + 4], [x + 22, YF + 36, Z1 - 4], [x + 22, YF, Z1 - 4]], [3, 3, 3, 3], 6); a.box(x - 22, YF + 33, Z0 + 4, x + 22, YF + 36, Z1 - 4); }
    a.log(`Added the ${u}U bar with four open D-rings, back wall and rack ears (plan and 3D).`);
  }
}

/** a vertical cable manager: tall duct with fingers each side and a slotted door */
function vcm(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, n = m.floor((Z1 - Z0 - 120) / (2 * U));
  a.outline(); a.rect(X0 + 4, YF + 4, X1 - 4, YB - 4, 'EQUIP-DETAIL');
  a.box(X0, YB - 6, Z0 + 14, X1, YB, Z1 - 8); a.box(X0, YF, Z0 + 14, X0 + 5, YB, Z1 - 8); a.box(X1 - 5, YF, Z0 + 14, X1, YB, Z1 - 8);
  a.box(X0, YF, Z0 + 4, X1, YB, Z0 + 14); a.box(X0, YF, Z1 - 8, X1, YB, Z1);
  for (let i = 0; i < n; i++) { const z = Z0 + 60 + i * 2 * U; for (const s of [0, 1]) a.box(s ? X1 - 22 : X0 + 5, YF + 10, z, s ? X1 - 5 : X0 + 22, YF + 30 + (s && v.dbl ? 8 : 0), z + 40); }
  const dx0 = X0 + 22, dx1 = X1 - 22;
  for (let i = 0; i < n * 2; i++) a.box(dx0 + 4, YF, Z0 + 60 + i * U, dx1 - 4, YF + 3, Z0 + 60 + i * U + U * 0.7);
  a.box(dx0 - 4, YF + 8, Z0 + 14, dx0, YF + 14, Z1 - 8);
  a.log(`Added the ${v.dbl ? 'deep' : 'narrow'} duct with fingers on both sides at every second unit, a slotted front door with hinge strip, back wall and top and bottom caps (plan and 3D).`);
}

/** a sliding glass door for an aisle containment: header track, hangers, glazing, push bars, brush seal */
function contain(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, n = v.leaves, lw = (W - 80) / n;
  a.outline(); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.box(X0, YF, Z1 - 90, X1, YB, Z1); a.box(X0 + 10, YF - 0 + 8, Z1 - 100, X1 - 10, YB - 8, Z1 - 90);
  for (const x of [X0, X1 - 40]) a.box(x, YF, Z0, x + 40, YB, Z1 - 90);
  for (let i = 0; i < n; i++) {
    const x0 = X0 + 40 + i * lw + (i ? 8 : 0), x1 = X0 + 40 + (i + 1) * lw - 4;
    a.frame(x0, Z0 + 20, x1, Z1 - 120, YF + 14, YF + 40, 28); a.box(x0 + 28, YF + 22, Z0 + 48, x1 - 28, YF + 30, Z1 - 148);
    for (const hx of [x0 + lw * 0.2, x1 - lw * 0.2]) { a.cyl(hx, YF + 27, Z1 - 120, Z1 - 100, 10, 10); a.xcyl(hx - 8, hx + 8, YF + 27, Z1 - 100, 6, 8); }
    const px = (i === 0 ? x1 - 38 : x0 + 38) * 1; a.box(px - 3, YF + 4, Z0 + H * 0.3, px + 3, YF + 14, Z0 + H * 0.62); a.box(px - 3, YF + 4, Z0 + H * 0.3, px + 3, YF + 14, Z0 + H * 0.3 + 6); a.box(px - 3, YF + 4, Z0 + H * 0.62 - 6, px + 3, YF + 14, Z0 + H * 0.62);
    for (let k = 0; k < 14; k++) a.box(x0 + 4 + k * ((x1 - x0 - 8) / 14), YF + 16, Z0, x0 + 4 + k * ((x1 - x0 - 8) / 14) + 5, YF + 38, Z0 + 20);
  }
  a.box(X0 + 40, YB - 10, Z0, X1 - 40, YB - 4, Z0 + 12);
  a.log(`Added the posts, header with a track and ${n * 2} roller hangers, ${n} glazed sliding leaf${n > 1 ? 'es' : ''} in frames, push bars, brush seals and a floor guide (plan and 3D).`);
}

/** a raised-floor tile on four pedestals with stringers: solid, perforated lattice or slotted grate */
function rfloor(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, t = 34, tz = Z1 - t;
  a.outline(); a.rect(X0 + 12, YF + 12, X1 - 12, YB - 12, 'EQUIP-DETAIL');
  const ps = [[X0 + 20, YF + 20], [X1 - 20, YF + 20], [X0 + 20, YB - 20], [X1 - 20, YB - 20]];
  for (const [x, y] of ps) { a.box(x - 50, y - 50, Z0, x + 50, y + 50, Z0 + 4); a.cyl(x, y, Z0 + 4, tz - 8, 14, 12); a.cyl(x, y, Z0 + 14, tz - 20, 5, 6); a.box(x - 28, y - 28, tz - 8, x + 28, y + 28, tz); }
  for (const y of [YF + 20, YB - 20]) a.box(X0 + 20, y - 8, tz - 20, X1 - 20, y + 8, tz - 8);
  for (const x of [X0 + 20, X1 - 20]) a.box(x - 8, YF + 20, tz - 20, x + 8, YB - 20, tz - 8);
  const fr = 14;
  a.box(X0, YF, tz, X0 + fr, YB, Z1); a.box(X1 - fr, YF, tz, X1, YB, Z1); a.box(X0 + fr, YF, tz, X1 - fr, YF + fr, Z1); a.box(X0 + fr, YB - fr, tz, X1 - fr, YB, Z1);
  if (v.kind === 'solid') { a.box(X0 + fr, YF + fr, tz + 4, X1 - fr, YB - fr, Z1 - 2); a.cyl(cx, cy, Z1 - 2, Z1, 12, 10); for (let i = 0; i < 3; i++) a.box(X0 + fr + 30 + i * 30, YF + fr, Z1 - 3, X0 + fr + 34 + i * 30, YB - fr, Z1); }
  else if (v.kind === 'perf') { const n = 12, st = (W - 2 * fr) / n; for (let i = 0; i <= n; i++) { a.box(X0 + fr + i * st - 3, YF + fr, tz + 6, X0 + fr + i * st + 3, YB - fr, Z1 - 2); a.box(X0 + fr, YF + fr + i * ((D - 2 * fr) / n) - 3, tz + 6, X1 - fr, YF + fr + i * ((D - 2 * fr) / n) + 3, Z1 - 2); } }
  else { const n = 18; for (let i = 0; i < n; i++) a.box(X0 + fr, YF + fr + 4 + i * ((D - 2 * fr - 8) / n), tz + 6, X1 - fr, YF + fr + 4 + i * ((D - 2 * fr - 8) / n) + (D - 2 * fr - 8) / n * 0.42, Z1 - 2); a.box(cx - 3, YF + fr, tz + 6, cx + 3, YB - fr, Z1 - 4); }
  a.log(`Added the 24 in ${v.kind === 'solid' ? 'solid steel-cased' : v.kind === 'perf' ? 'perforated (lattice) ' : 'slotted grate '}tile with an edge frame, four pedestals on base plates and stringers between them (plan and 3D).`);
}

/** a fibre enclosure: slide-out tray with duplex adapter plates, cassette modules or a glass door */
function fibre(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, u = v.u, ear = rackBody(a, u, 6), fx0 = X0 + ear + 6, fx1 = X1 - ear - 6;
  if (v.kind === 'tray') {
    a.box(fx0, YF + 3, Z0 + 4, fx1, YF + 8, Z1 - 4); const n = 12, w = (fx1 - fx0 - 40) / n; for (let i = 0; i < n; i++) { a.box(fx0 + 20 + i * w + 1.5, YF + 1, Z0 + H * 0.28, fx0 + 20 + (i + 1) * w - 1.5, YF + 4, Z0 + H * 0.66); a.box(fx0 + 20 + i * w + w * 0.2, YF - 1, Z0 + H * 0.4, fx0 + 20 + i * w + w * 0.4, YF + 1, Z0 + H * 0.54); a.box(fx0 + 20 + i * w + w * 0.6, YF - 1, Z0 + H * 0.4, fx0 + 20 + i * w + w * 0.8, YF + 1, Z0 + H * 0.54); }
    for (const x of [fx0 + 4, fx1 - 14]) a.box(x, YF - 3, Z0 + H * 0.3, x + 10, YF + 3, Z0 + H * 0.7);
    a.line(fx0, YF + 8, fx1, YF + 8);
    a.log('Added the slide-out tray front with twelve duplex adapter plates, two pull handles and a label strip, in the rack chassis (plan and 3D).');
  } else if (v.kind === 'cassette') {
    const rows = 2, cw = (fx1 - fx0 - 10) / 6;
    for (let r = 0; r < rows; r++) for (let c = 0; c < 6; c++) { const x0 = fx0 + 5 + c * cw, z0 = Z0 + 6 + r * ((Z1 - Z0 - 12) / rows); a.box(x0 + 2, YF + 3, z0 + 2, x0 + cw - 2, YF + 8, z0 + (Z1 - Z0 - 12) / rows - 2); for (let k = 0; k < 6; k++) a.box(x0 + 5 + k * ((cw - 10) / 6), YF, z0 + ((Z1 - Z0 - 12) / rows) * 0.4, x0 + 5 + k * ((cw - 10) / 6) + (cw - 10) / 6 - 2, YF + 3, z0 + ((Z1 - Z0 - 12) / rows) * 0.62); a.box(x0 + cw * 0.3, YF + 4, z0 + 5, x0 + cw * 0.7, YF + 8, z0 + 11); }
    a.log('Added the chassis with twelve splice cassette modules in two rows, each with six adapter ports and a latch, and rack ears (plan and 3D).');
  } else {
    a.frame(fx0, Z0 + 4, fx1, Z1 - 4, YF, YF + 8, 14); a.box(fx0 + 14, YF + 3, Z0 + 18, fx1 - 14, YF + 5, Z1 - 18);
    a.box(fx0 - 4, YF - 2, Z0 + 10, fx0 + 4, YF + 8, Z0 + 18); a.box(fx0 - 4, YF - 2, Z1 - 18, fx0 + 4, YF + 8, Z1 - 10); a.box(fx1 - 14, YF - 5, Z0 + H * 0.45, fx1 - 4, YF + 4, Z0 + H * 0.55);
    for (let i = 0; i < 4; i++) { a.box(fx0 + 26, YF + 9, Z0 + 26 + i * ((Z1 - Z0 - 60) / 4), fx1 - 26, YF + 14, Z0 + 26 + i * ((Z1 - Z0 - 60) / 4) + (Z1 - Z0 - 60) / 4 - 4); for (let k = 0; k < 12; k++) a.box(fx0 + 34 + k * ((fx1 - fx0 - 68) / 12), YF + 14, Z0 + 28 + i * ((Z1 - Z0 - 60) / 4), fx0 + 34 + k * ((fx1 - fx0 - 68) / 12) + 12, YF + 17, Z0 + 42 + i * ((Z1 - Z0 - 60) / 4)); }
    a.log('Added the chassis with a framed glass door with two hinges and a latch, and four splice modules with adapter rows behind it (plan and 3D).');
  }
}

/** a pedestal (tower) server: front bezel with hot-swap bays, optical slot, lock door, top handle, feet or casters */
function pedserv(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, fz = v.cast ? 40 : 14;
  a.outline();
  a.box(X0 + 4, YF + 24, Z0 + fz, X1 - 4, YB, Z1); plate(a, X0, Z0 + fz, X1, Z1 - 6, YF + 6, YF + 28, 12);
  if (v.cast) { for (const x of [X0 + 24, X1 - 24]) for (const y of [YF + 50, YB - 50]) a.caster(x, y, fz + 10); a.box(X0 + 8, YF + 30, Z0 + fz - 8, X1 - 8, YB - 6, Z0 + fz); }
  else for (const x of [X0 + 24, X1 - 24]) for (const y of [YF + 40, YB - 40]) a.cyl(x, y, Z0, Z0 + fz, 12, 8);
  const cols = v.cols, rows = v.rows, bx0 = X0 + W * 0.1, bx1 = X1 - W * 0.1, by0 = Z0 + fz + 30, by1 = Z0 + fz + (Z1 - Z0 - fz) * 0.6;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x0 = bx0 + c * ((bx1 - bx0) / cols), z0 = by0 + r * ((by1 - by0) / rows); a.box(x0 + 1.5, YF + 3, z0 + 1.5, x0 + (bx1 - bx0) / cols - 1.5, YF + 8, z0 + (by1 - by0) / rows - 1.5); a.box(x0 + 5, YF, z0 + ((by1 - by0) / rows) * 0.35, x0 + (bx1 - bx0) / cols - 5, YF + 3, z0 + ((by1 - by0) / rows) * 0.65); }
  a.box(bx0, YF + 3, by1 + 12, bx1, YF + 8, by1 + 32); a.box(bx0 + 4, YF + 1, by1 + 18, bx1 - 4, YF + 3, by1 + 26);
  a.box(bx0, YF + 6, Z1 - 70, bx1, YF + 9, Z1 - 20); for (let i = 0; i < 3; i++) a.cyl(bx0 + 20 + i * 18, YF + 9, Z1 - 45, Z1 - 43.5, 5, 8); a.ycyl(YF, YF + 8, bx1 - 20, Z1 - 45, 8, 10);
  a.box(bx0, YF + 6, by0 - 22, bx0 + 60, YF + 10, by0 - 6); led(a, bx1 - 14, by0 - 14, YF + 8, 2.5);
  a.tube([[cx - W * 0.2, YF + 60, Z1], [cx - W * 0.2, YF + 60, Z1 + 0.01]], [2, 2], 4);
  a.box(cx - W * 0.2, YF + D * 0.3, Z1 - 16, cx + W * 0.2, YF + D * 0.4, Z1);
  a.rect(X0 + 4, YF + 24, X1 - 4, YB, 'EQUIP-DETAIL'); a.line(X0, YF + 28, X1, YF + 28);
  a.box(X0 + 20, YB - 3, Z0 + fz + 10, X0 + W * 0.45, YB, Z0 + fz + 100); a.box(X1 - W * 0.45, YB - 3, Z0 + fz + 120, X1 - 20, YB, Z1 - 30);
  a.log(`Added the tower case with a bezel carrying ${cols * rows} drive bays, an optical slot, a lock door, power button and ports, a top handle, and ${v.cast ? 'four casters' : 'four feet'} (plan and 3D).`);
}

/** a server lift: casters on a base with outriggers, a mast with carriage, a winch crank and a tilting platform with side stops */
function slift(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline(); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL');
  for (const x of [X0 + 14, X1 - 14]) { a.box(x - 14, YF + D * 0.1, Z0 + 36, x + 14, YB - 14, Z0 + 76); for (const y of [YF + D * 0.1 + 16, YB - 30]) a.caster(x, y, 50); }
  a.box(X0 + 14, YB - 60, Z0 + 36, X1 - 14, YB - 30, Z0 + 76);
  a.box(cx - 36, YB - 70, Z0 + 76, cx + 36, YB - 14, Z1 - 40); a.box(cx - 30, YB - 74, Z0 + 90, cx + 30, YB - 70, Z1 - 60);
  for (const s of [-1, 1]) a.box(cx + s * 26 - 4, YB - 78, Z0 + 90, cx + s * 26 + 4, YB - 74, Z1 - 60);
  const pz = Z0 + H * v.lvl;
  a.box(cx - 44, YB - 90, pz, cx + 44, YB - 70, pz + 70);
  a.box(X0 + 36, YF + 20, pz, X1 - 36, YB - 70, pz + 10); for (const x of [X0 + 36, X1 - 46]) a.box(x, YF + 20, pz + 10, x + 10, YB - 70, pz + 40);
  a.box(X0 + 46, YF + 20, pz + 10, X1 - 46, YF + 30, pz + 30);
  a.tube([[cx, YB - 40, Z1 - 40], [cx, YB - 40, Z1 - 4], [cx, YB - 90, Z1 - 4]], [8, 8, 8], 8); a.cyl(cx, YB - 90, pz + 70, Z1 - 4, 0.01, 3);
  a.xcyl(cx - 80, cx + 80, YB - 30, Z0 + H * 0.5, 4, 8); a.cyl(cx + 80, YB - 30, Z0 + H * 0.5 - 20, Z0 + H * 0.5, 4, 6); a.xcyl(cx + 56, cx + 100, YB - 70, Z0 + H * 0.38, 12, 10); a.cyl(cx + 100, YB - 70, Z0 + H * 0.38 - 36, Z0 + H * 0.38 + 6, 5, 8);
  a.tube([[cx - 36, YB - 30, Z0 + H * 0.7], [cx - 36, YB - 6, Z0 + H * 0.7], [cx + 36, YB - 6, Z0 + H * 0.7], [cx + 36, YB - 30, Z0 + H * 0.7]], [8, 8, 8, 8], 8);
  a.log(`Added the base with two outriggers on casters, a ${m.round(H / IN)} in mast with a carriage, a hand winch with crank, a tilting platform with side stops and a push bar (plan and 3D).`);
}

/** a crash cart: tubular frame, shelves, monitor on an arm, keyboard shelf, drawer and battery box on casters */
function crash(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline();
  for (const x of [X0 + 16, X1 - 16]) for (const y of [YF + 16, YB - 16]) { a.tube([[x, y, Z0 + 70], [x, y, Z1 - (v.tall ? 380 : 100)]], [8, 8], 8); a.caster(x, y, 70); }
  const sh = (z, t = 8) => { slab(a, X0 + 6, YF + 6, X1 - 6, YB - 6, z, z + t, 14); a.box(X0 + 6, YF + 6, z + t, X1 - 6, YF + 12, z + t + 20); a.box(X0 + 6, YB - 12, z + t, X1 - 6, YB - 6, z + t + 20); };
  sh(Z0 + 90); sh(Z0 + H * (v.tall ? 0.36 : 0.45));
  a.box(X0 + 30, YF + 30, Z0 + 98, X1 - 30, YB - 30, Z0 + 98 + (v.tall ? 150 : 100));
  if (v.tall) { a.box(X0 + 30, YF + 20, Z0 + H * 0.36 + 8, X1 - 30, YB - 30, Z0 + H * 0.36 + 90); a.box(cx - 40, YF + 14, Z0 + H * 0.36 + 44, cx + 40, YF + 20, Z0 + H * 0.36 + 52); }
  const kz = Z0 + H * (v.tall ? 0.62 : 0.45) + 8;
  if (v.tall) { sh(Z0 + H * 0.62, 6); }
  a.box(X0 + 40, YF + 10, kz + (v.tall ? 6 : 0), X1 - 40, YF + 190, kz + 14 + (v.tall ? 6 : 0));
  for (let i = 0; i < 4; i++) a.box(X0 + 56, YF + 20 + i * 34, kz + (v.tall ? 6 : 0) + 14, X1 - 56, YF + 20 + i * 34 + 26, kz + (v.tall ? 6 : 0) + 18);
  const mz = Z1 - H * 0.28;
  a.tube([[cx, YB - 40, kz + 20], [cx, YB - 40, mz]], [14, 14], 8);
  a.tube([[cx, YB - 40, mz], [cx, YB - 120, mz + 30], [cx, YF + 80, mz + 60]], [9, 8, 8], 8);
  plate(a, X0 + 20, mz + 20, X1 - 20, mz + 20 + H * 0.28, YF + 50, YF + 76, 6); a.box(X0 + 34, YF + 46, mz + 34, X1 - 34, YF + 50, mz + 14 + H * 0.28);
  a.tube([[X0 + 16, YB - 20, Z0 + H * 0.5], [X0 + 16, YB + -4 > YB ? YB : YB - 4, Z0 + H * 0.5 + 100], [X1 - 16, YB - 4, Z0 + H * 0.5 + 100], [X1 - 16, YB - 20, Z0 + H * 0.5]], [6, 6, 6, 6], 8);
  a.log(`Added the tubular frame on four casters with ${v.tall ? 'three shelves, a drawer, ' : 'two shelves, '}a keyboard shelf, a monitor on a jointed arm, a battery box and a push handle (plan and 3D).`);
}

/** a rack fan tray: panel of round fan grills with a vented flange and ears */
function fantray(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, u = v.u, ear = rackBody(a, u, 4), fx0 = X0 + ear + 6, fx1 = X1 - ear - 6;
  const cols = v.cols, rows = v.rows, cw = (fx1 - fx0) / cols, rh = (Z1 - Z0 - 6) / rows, r = m.min(cw, rh) * 0.42;
  for (let q = 0; q < rows; q++) for (let c = 0; c < cols; c++) { const x = fx0 + cw * (c + 0.5), z = Z0 + 3 + rh * (q + 0.5); a.ycyl(YF + 2, YF + 8, x, z, r, 18); a.ycyl(YF, YF + 8, x, z, r * 0.22, 10); for (const t of [0, 1]) a.box(x - (t ? r : 1.4), YF + 5, z - (t ? 1.4 : r), x + (t ? r : 1.4), YF + 8.4, z + (t ? 1.4 : r)); for (const k of [0.45, 0.7, 0.95]) a.ycyl(YF + 7, YF + 8.6, x, z, r * k, 18); }
  a.box(fx1 - 18, YF + 2, Z0 + 5, fx1 - 6, YF + 6, Z0 + 12); led(a, fx0 + 6, Z0 + 8, YF + 4, 2);
  a.log(`Added the ${u}U chassis with ${cols * rows} round fans behind guards, a status light and rack ears (plan and 3D).`);
}

/** an edge box: finned fanless case with mounting ears, a front port row and antenna posts */
function edge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline();
  if (v.kind === 'rack') { const ear = rackBody(a, 1, 8); const fx0 = X0 + ear + 8, fx1 = X1 - ear - 8; for (let i = 0; i < 14; i++) a.box(fx0 + i * ((fx1 - fx0 - 120) / 14), YF + 8, Z1 - 1, fx0 + i * ((fx1 - fx0 - 120) / 14) + 5, YB - 20, Z1 + 0.01); ports(a, fx1 - 220, fx1 - 20, Z0 + 12, Z1 - 12, YF + 6, 8, 4); led(a, fx0 + 10, Z0 + 12, YF + 8, 2.4); a.box(fx0 + 20, YF + 6, Z0 + 10, fx0 + 60, YF + 9, Z1 - 10); for (let i = 0; i < 2; i++) a.cyl(fx0 + 100 + i * 24, YB - 3, Z0 + 20, Z0 + 21, 8, 8);
    a.log('Added the short 1U case with rack ears, heat-sink ribs on the lid, a front port row, a status light and rear connectors (plan and 3D).'); return; }
  a.prism(rr(X0 + (v.kind === 'wall' ? 36 : 0), YF, X1 - (v.kind === 'wall' ? 36 : 0), YB, 8), Z0, Z1 - H * 0.28); a.poly(rr(X0 + (v.kind === 'wall' ? 36 : 0), YF, X1 - (v.kind === 'wall' ? 36 : 0), YB, 8));
  const fx0 = X0 + (v.kind === 'wall' ? 36 : 0) + 4, fx1 = X1 - (v.kind === 'wall' ? 36 : 0) - 4, n = m.round((fx1 - fx0) / 9);
  for (let i = 0; i < n; i++) a.box(fx0 + i * ((fx1 - fx0) / n), YF + 4, Z1 - H * 0.28, fx0 + i * ((fx1 - fx0) / n) + ((fx1 - fx0) / n) * 0.5, YB - 4, Z1);
  if (v.kind === 'wall') for (const x of [X0, X1 - 36]) { a.box(x, YF + 10, Z0, x + 36, YB - 10, Z0 + 5); a.box(x + 10, YF + 20, Z0 + 5, x + 26, YF + 30, Z0 + 5.4); }
  ports(a, fx0 + 6, fx1 - 6, Z0 + 6, Z0 + (Z1 - Z0) * 0.4, YF, v.kind === 'wall' ? 5 : 4, 4); led(a, fx0 + 10, Z1 - H * 0.28 - 8, YF, 2);
  for (let i = 0; i < v.ant; i++) { const x = fx0 + 14 + i * ((fx1 - fx0 - 28) / m.max(1, v.ant - 1)); a.cyl(x, YB - 6, Z1 - H * 0.28, Z1 - 2, 3.4, 6); }
  a.log(`Added the case with ${n} cooling ribs on top${v.kind === 'wall' ? ', two mounting ears with slots' : ''}, a front port row, a status light and ${v.ant} antenna connector posts (plan and 3D).`);
}

/** a rear-door heat exchanger: framed coil door with fins, a fan grid, hinges, a handle and two hoses */
function rdhx(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline(); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL');
  a.frame(X0, Z0 + 30, X1, Z1, YF, YB, 24); a.box(X0 + 24, YB - 20, Z0 + 54, X1 - 24, YB - 4, Z1 - 24);
  for (let i = 0; i < 26; i++) a.box(X0 + 30 + i * ((W - 60) / 26), YB - 40, Z0 + 56, X0 + 30 + i * ((W - 60) / 26) + 3, YB - 20, Z1 - 26);
  const nf = v.fans, fr = m.min((W - 60) / 2 * 0.46, 85), rows = nf / 2;
  for (let q = 0; q < rows; q++) for (const s of [0, 1]) { const z = Z0 + 56 + fr + 20 + q * ((Z1 - Z0 - 56 - 2 * fr - 60) / m.max(1, rows - 1)); fan(a, cx + (s ? 1 : -1) * ((W - 60) / 4), z, fr, YF + 2, YF + 24); a.rect(cx + (s ? 1 : -1) * ((W - 60) / 4) - fr, YF, cx + (s ? 1 : -1) * ((W - 60) / 4) + fr, YF + 2, 'EQUIP-DETAIL'); }
  for (const z of [Z0 + 110, (Z0 + Z1) / 2, Z1 - 110]) { a.box(X0 - 0, YB - 30, z - 18, X0 + 14, YB - 6, z + 18); a.cyl(X0 + 7, YB - 18, z - 20, z + 20, 7, 8); }
  a.box(X1 - 44, YF - 0, (Z0 + Z1) / 2 - 80, X1 - 36, YF + 20, (Z0 + Z1) / 2 + 80);
  for (const x of [cx - W * 0.2, cx + W * 0.2]) a.tube([[x, YB - 40, Z0 + 56], [x, YB - 40, Z0 + 40], [x - 0, YF + 40, Z0 + 32], [x, YF + 40, Z0 + 31]], [14, 14, 14, 14], 10);
  a.box(X0, YF, Z0 + 30, X0 + 24, YF + 8, Z1);
  a.log(`Added the framed coil door with ${26} vertical fins, a grid of ${nf} fans, three hinge knuckles, a vertical handle and two supply and return hoses at the foot (plan and 3D).`);
}

const SRV = [
  fam({ cat: 'computer/servers', title: 'Generic rack shelf',
    desc: (v) => v.kind === 'slide' ? `${v.u}U rack shelf with a front flange, side lips and two telescoping slide rails with a rear stop and a pull handle.` : `${v.u}U rack shelf with a front flange, side lips and a rear lip with tie-down loops${v.kind === 'vent' ? ', the pan slotted for airflow' : ''}.`,
    vs: [['fixed, 1U', 19, 14, uh(1), 0, { kind: 'fixed', u: 1 }], ['vented, 2U', 19, 18, uh(2), 0, { kind: 'vent', u: 2 }], ['sliding, 2U', 19, 26, uh(2), 0, { kind: 'slide', u: 2 }]],
    build: rshelf }),
  fam({ cat: 'computer/servers', title: 'Generic tape library',
    desc: (v) => `${v.u}U tape library with two magazine doors with cartridge slots, a robot window, drive sleds${v.u >= 2 ? ', a small touch display' : ''}, rack ears and rear power and fan bays.`,
    vs: [['2U', 19, 28, uh(2), 0, { u: 2 }], ['4U', 19, 30, uh(4), 0, { u: 4 }], ['8U', 19, 31, uh(8), 0, { u: 8 }]],
    build: tape }),
  fam({ cat: 'computer/servers', title: 'Generic in-row cooling unit',
    desc: (v) => `In-row cooling unit on a levelling plinth: perforated front door with a display and status lights, ${v.fans} rear fans and two pipe stubs on the roof.`,
    vs: [['12 in wide', 12, 42, 78, 0, { fans: 3 }], ['24 in wide', 24, 42, 78, 0, { fans: 4 }], ['24 in wide, tall', 24, 44, 90, 0, { fans: 5 }]],
    build: inrow }),
  fam({ cat: 'computer/servers', title: 'Generic horizontal cable manager',
    desc: (v) => v.kind === 'finger' ? `${v.u}U duct with slotted fingers, a hinged front cover, back wall and rack ears.` : v.kind === 'brush' ? `${v.u}U box with a brush-lined cable slot, back wall and rack ears.` : `${v.u}U bar with four open D-rings, back wall and rack ears.`,
    vs: [['1U finger duct', 19, 3.5, uh(1), 0, { kind: 'finger', u: 1 }], ['2U finger duct', 19, 5, uh(2), 0, { kind: 'finger', u: 2 }], ['1U brush slot', 19, 3, uh(1), 0, { kind: 'brush', u: 1 }]],
    build: hcm }),
  fam({ cat: 'computer/servers', title: 'Generic vertical cable manager',
    desc: (v) => `${v.dbl ? 'Deep' : 'Narrow'} duct with fingers on both sides at every second unit, a slotted front door with a hinge strip, back wall and top and bottom caps.`,
    vs: [['narrow, 24U', 4, 5, 42, 0, { dbl: 0 }], ['deep, 42U', 10, 9, 80, 0, { dbl: 1 }]],
    build: vcm }),
  fam({ cat: 'computer/servers', title: 'Generic aisle containment door',
    desc: (v) => `Aisle containment end door: posts, a header with a track and roller hangers, ${v.leaves} glazed sliding leaf${v.leaves > 1 ? 'es' : ''} in frames, push bars, brush seals and a floor guide.`,
    vs: [['single leaf, 48 in', 48, 4, 84, 0, { leaves: 1 }], ['double leaf, 72 in', 72, 4, 90, 0, { leaves: 2 }]],
    build: contain }),
  fam({ cat: 'computer/servers', title: 'Generic raised floor tile assembly',
    desc: (v) => `24 in raised-floor tile with an edge frame${v.kind === 'solid' ? ' and a solid cased face' : v.kind === 'perf' ? ' and a perforated lattice face' : ' and a slotted grate face'}, on four pedestals with base plates and stringers.`,
    vs: [['solid, 12 in height', 24, 24, 12, 0, { kind: 'solid' }], ['perforated, 18 in height', 24, 24, 18, 0, { kind: 'perf' }], ['grate, 24 in height', 24, 24, 24, 0, { kind: 'grate' }]],
    build: rfloor }),
  fam({ cat: 'computer/servers', title: 'Generic fibre rack enclosure',
    desc: (v) => v.kind === 'tray' ? 'Rack fibre enclosure with a slide-out tray front, twelve duplex adapter plates, two pull handles and a label strip.' : v.kind === 'cassette' ? 'Rack fibre enclosure with twelve splice cassette modules in two rows, each with six adapter ports and a latch.' : 'Rack fibre enclosure with a framed glass door on two hinges with a latch and four splice modules behind it.',
    vs: [['1U tray', 19, 11, uh(1), 0, { kind: 'tray', u: 1 }], ['2U cassettes', 19, 12, uh(2), 0, { kind: 'cassette', u: 2 }], ['4U glass door', 19, 14, uh(4), 0, { kind: 'door', u: 4 }]],
    build: fibre }),
  fam({ cat: 'computer/servers', title: 'Generic tower server',
    desc: (v) => `Tower server with a bezel carrying ${v.cols * v.rows} drive bays, an optical slot, a lock door, power button and ports, a top handle and ${v.cast ? 'four casters' : 'four feet'}.`,
    vs: [['4 bays', 8.7, 24, 17, 0, { cols: 2, rows: 2, cast: 0 }], ['8 bays', 9.2, 26, 18.5, 0, { cols: 4, rows: 2, cast: 0 }], ['16 bays on casters', 9.6, 27.5, 21, 0, { cols: 8, rows: 2, cast: 1 }]],
    build: pedserv }),
  fam({ cat: 'computer/servers', title: 'Generic server lift',
    desc: (v) => `Server lift on a base with two outriggers on casters, a mast with a carriage, a hand winch with crank, a tilting platform with side stops and a push bar.`,
    vs: [['66 in mast', 28, 38, 66, 0, { lvl: 0.34 }], ['80 in mast', 28, 40, 80, 0, { lvl: 0.4 }], ['96 in mast', 30, 42, 96, 0, { lvl: 0.46 }]],
    build: slift }),
  fam({ cat: 'computer/servers', title: 'Generic server room crash cart',
    desc: (v) => `Tubular cart on four casters with ${v.tall ? 'three shelves, a drawer, ' : 'two shelves, '}a keyboard shelf, a monitor on a jointed arm, a battery box and a push handle.`,
    vs: [['two shelves', 24, 24, 52, 0, { tall: 0 }], ['three shelves and drawer', 26, 26, 64, 0, { tall: 1 }]],
    build: crash }),
  fam({ cat: 'computer/servers', title: 'Generic rack fan tray',
    desc: (v) => `${v.u}U fan tray with ${v.cols * v.rows} round fans behind guards, a status light and rack ears.`,
    vs: [['1U, 6 fans', 19, 7, uh(1), 0, { u: 1, cols: 6, rows: 1 }], ['2U, 10 fans', 19, 7, uh(2), 0, { u: 2, cols: 5, rows: 2 }]],
    build: fantray }),
  fam({ cat: 'computer/servers', title: 'Generic edge compute box',
    desc: (v) => v.kind === 'rack' ? 'Short 1U case with rack ears, heat-sink ribs on the lid, a front port row, a status light and rear connectors.' : `Finned fanless case${v.kind === 'wall' ? ' with two mounting ears' : ''}, a front port row, a status light and ${v.ant} antenna posts.`,
    vs: [['palm size', 6, 4.5, 1.8, 0, { kind: 'plain', ant: 2 }], ['wall mount', 11, 7, 2.8, 0, { kind: 'wall', ant: 4 }], ['short-depth 1U', 19, 9, uh(1), 0, { kind: 'rack', ant: 0 }]],
    build: edge }),
  fam({ cat: 'computer/servers', title: 'Generic rear door heat exchanger',
    desc: (v) => `Framed coil door with 26 vertical fins, a grid of ${v.fans} fans, three hinge knuckles, a vertical handle and two supply and return hoses at the foot.`,
    vs: [['24 in, 42U', 24, 6, 80, 0, { fans: 6 }], ['29.5 in, 42U', 29.5, 6.5, 80, 0, { fans: 8 }], ['31.5 in, 48U', 31.5, 7, 90, 0, { fans: 10 }]],
    build: rdhx }),
];

// ------------------------------------------------------------------------------------------ network and telecom
/** a wall outlet plate with keystone jacks, shutters, screws and a label window, on a back box */
function wallplate(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, n = v.n, gang = v.gang;
  a.outline(); a.rect(X0 + 8, YF + 8, X1 - 8, YB, 'EQUIP-DETAIL');
  a.box(X0 + 8, YF + 5, Z0 + 8, X1 - 8, YB, Z1 - 8);
  plate(a, X0, Z0, X1, Z1, YF, YF + 5, 12);
  for (const z of [Z0 + 14, Z1 - 14]) for (const g of (gang > 1 ? [0.25, 0.75] : [0.5])) { a.ycyl(YF - 1.2, YF, X0 + W * g, z, 3.2, 8); }
  const cols = n > 2 ? 2 : n, rows = n > 2 ? 2 : 1, cw = (W - 30) / cols, rh = (H - 66) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x0 = X0 + 15 + c * cw + 4, z0 = Z0 + 30 + r * rh + 2; a.frame(x0, z0, x0 + cw - 8, z0 + rh - 4, YF - 3, YF, 3.4); a.box(x0 + 4, YF - 1.5, z0 + 4, x0 + cw - 12, YF, z0 + rh - 8); a.box(x0 + (cw - 8) * 0.3, YF - 2.4, z0 + (rh - 4) * 0.3, x0 + (cw - 8) * 0.7, YF - 1.5, z0 + (rh - 4) * 0.7); }
  a.box(X0 + W * 0.25, YF - 1.4, Z1 - 24, X1 - W * 0.25, YF, Z1 - 14);
  a.log(`Added the ${gang > 1 ? 'two-gang ' : ''}faceplate with ${n} keystone jack opening${n > 1 ? 's' : ''} with dust shutters, label window, four screws and a back box (plan and 3D).`);
}

/** a PoE injector: a body with a data-in and a data-out port, a link light and a DC lead; the 4-port midspan has wall slots */
function poe(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  slab(a, X0, YF, X1, YB, Z0 + 3, Z1, 10); feet(a, X0 + 14, X1 - 14, YF + 14, YB - 14, 5, 3);
  const n = v.n;
  for (let i = 0; i < n; i++) { const x0 = X0 + 16 + i * ((W - 32) / n) + 2, w = (W - 32) / n - 4; a.box(x0, YF, Z0 + H * 0.3, x0 + w * 0.45, YF + 4, Z0 + H * 0.7); a.box(x0 + w * 0.5, YF, Z0 + H * 0.3, x0 + w, YF + 4, Z0 + H * 0.7); led(a, x0 + w * 0.48, Z1 - 3, YF + 4, 1.6); }
  a.box(cx - W * 0.2, YB - 3, Z0 + H * 0.3, cx + W * 0.2, YB, Z0 + H * 0.6); a.tube([[X1 - 10, YB - 3, Z0 + H * 0.45], [X1 - 10, YB + 0, Z0 + H * 0.45]], [4, 4], 6);
  if (n > 1) for (const x of [X0 + 24, X1 - 24]) a.box(x - 6, YB - 4, Z1 - 1, x + 6, YB - 1, Z1);
  a.line(X0, YF + 6, X1, YF + 6, 'EQUIP-DETAIL');
  a.log(`Added the rounded body with ${n} pair${n > 1 ? 's' : ''} of data in and power-out ports, link lights, rubber feet and a DC input${n > 1 ? ' with two wall slots on top' : ''} (plan and 3D).`);
}

/** a mesh Wi-Fi node: round pillar or compact cube with a light ring, vent slits and a rear port */
function mesh(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  if (v.kind === 'cube') {
    a.outline(); slab(a, X0, YF, X1, YB, Z0 + 3, Z1, 24); feet(a, X0 + 16, X1 - 16, YF + 16, YB - 16, 5, 3);
    a.box(X0 + 10, YF, Z0 + H * 0.1 + 3, X1 - 10, YF + 2, Z0 + H * 0.16 + 3); for (let i = 0; i < 8; i++) a.box(X0 + 16 + i * ((W - 32) / 8), YF + 12, Z1, X0 + 16 + i * ((W - 32) / 8) + 4, YB - 12, Z1 + 0.01);
    ports(a, cx - W * 0.2, cx + W * 0.2, Z0 + H * 0.3, Z0 + H * 0.5, YB - 3, 2, 3); a.cyl(cx, YB - 4, Z0 + H * 0.25, Z0 + H * 0.26, 5, 8);
    a.log('Added the rounded cube body with a light bar on the front, a vent slit pattern on top, rubber feet and rear ports (plan and 3D).'); return;
  }
  a.circ(cx, cy, W / 2); a.cyl(cx, cy, Z0, Z0 + 6, W * 0.5, 28); a.cyl(cx, cy, Z0 + 6, Z1 - W * 0.3, W * 0.46, 28);
  a.ell(cx, cy, Z1 - W * 0.3, W * 0.46, W * 0.46, W * 0.3, 20, 8);
  a.cyl(cx, cy, Z0 + 6, Z0 + 12, W * 0.52, 28); a.cyl(cx, cy, Z0 + H * 0.2, Z0 + H * 0.2 + 3, W * 0.475, 28);
  for (let i = 0; i < 24; i++) { const t = (i / 24) * m.PI * 2; a.cyl(cx + W * 0.47 * m.cos(t), cy + W * 0.47 * m.sin(t), Z0 + H * 0.3, Z0 + H * 0.3 + H * 0.28, 1.4, 4); }
  a.box(cx - W * 0.14, YB - W * 0.06, Z0 + 14, cx + W * 0.14, YB - 1, Z0 + 30);
  a.log(`Added the round base ring, a ${v.kind === 'tall' ? 'tall' : 'compact'} pillar body with a domed top, a light ring, a band of 24 vent slits and a rear port recess (plan and 3D).`);
}

/** an outdoor antenna: panel on a pole bracket, a dish with a feed arm, or an omni radome on a mast */
function antenna(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  const py = YB - D * 0.18;
  if (v.kind === 'panel') {
    a.cyl(cx, py, Z0, Z1, 22, 14); a.circ(cx, py, 22, 'EQUIP-DETAIL');
    a.box(X0, YF + 10, Z0 + H * 0.12, X1, YF + 10 + D * 0.34, Z1 - H * 0.12); a.box(X0 + 6, YF + 4, Z0 + H * 0.12 + 6, X1 - 6, YF + 10, Z1 - H * 0.12 - 6);
    for (let i = 0; i < 6; i++) a.box(X0 + 14, YF + 2, Z0 + H * 0.12 + 16 + i * ((H * 0.76 - 32) / 6), X1 - 14, YF + 4, Z0 + H * 0.12 + 20 + i * ((H * 0.76 - 32) / 6));
    for (const z of [Z0 + H * 0.3, Z0 + H * 0.7]) { a.box(cx - 30, py - 14, z - 8, cx + 30, py + 14, z + 8); a.tube([[cx, py - 14, z], [cx, YF + 10 + D * 0.34, z]], [8, 8], 6); }
    for (let i = 0; i < 2; i++) a.cyl(X0 + W * (0.3 + i * 0.4), YF + 10 + D * 0.17, Z0 + H * 0.12 - 14, Z0 + H * 0.12, 6, 8);
    a.rect(X0, YF + 10, X1, YF + 10 + D * 0.34); a.log('Added the flat sector panel with a face cover and ribs, two clamp brackets on a mast pipe and two connector stubs underneath (plan and 3D).'); return;
  }
  if (v.kind === 'dish') {
    const r = W / 2, dy = YF + D * 0.66;
    a.cyl(cx, py, Z0, Z1 - H * 0.2, 22, 14); a.circ(cx, py, 22, 'EQUIP-DETAIL');
    const dz = Z0 + H * 0.55, dr = r;
    a.tube([[cx, dy - D * 0.3, dz], [cx, dy + 4, dz]], [dr, dr * 0.2], 32); a.tube([[cx, dy - D * 0.3 - 2, dz], [cx, dy - D * 0.3, dz]], [dr * 0.99, dr], 32);
    a.ycyl(dy + 4, dy + D * 0.3, cx, dz, 20, 12); a.tube([[cx, dy + D * 0.3, dz], [cx, py - 18, dz - 0]], [14, 14], 8);
    a.box(cx - 34, py - 18, dz - 34, cx + 34, py + 18, dz + 34); for (const s of [-1, 1]) a.tube([[cx + s * 30, py - 14, dz - 20], [cx + s * dr * 0.5, dy - D * 0.3 + 4, dz - dr * 0.5]], [5, 5], 6);
    a.tube([[cx, dy - D * 0.3, dz + dr * 0.95], [cx, dy - D * 0.3 - D * 0.18, dz], [cx, dy - D * 0.3, dz - dr * 0.95]], [3, 3, 3], 6); a.box(cx - 14, dy - D * 0.3 - D * 0.18 - 14, dz - 14, cx + 14, dy - D * 0.3 - D * 0.18, dz + 14);
    a.log(`Added the ${m.round(W / IN)} in parabolic dish with a rim, a feed arm with a feed box, rear housing, two struts, a bracket and a mast pipe (plan and 3D).`); return;
  }
  a.cyl(cx, cy, Z0, Z0 + 24, W * 0.46, 22); a.cyl(cx, cy, Z0 + 24, Z0 + 34, W * 0.3, 18); a.circ(cx, cy, W * 0.46);
  a.cyl(cx, cy, Z0 + 34, Z1 - W * 0.4, W * 0.38, 22); a.ell(cx, cy, Z1 - W * 0.4, W * 0.38, W * 0.38, W * 0.4, 20, 8);
  for (let i = 0; i < 6; i++) a.cyl(cx, cy, Z0 + 34 + i * ((H - 34 - W * 0.8) / 6), Z0 + 34 + i * ((H - 34 - W * 0.8) / 6) + 3, W * 0.4, 22);
  a.cyl(cx, cy, Z0 - 0, Z0 + 4, W * 0.46, 22); a.cyl(cx + W * 0.5 - 0.1, cy, Z0 + 10, Z0 + 20, 6, 6);
  a.log('Added the flange base with a mast clamp collar, a tall cylindrical radome with joint rings, a domed cap and a connector (plan and 3D).');
}

/** a cellular router: body with swivelling antennas, a SIM door and a light row; or a DIN-rail unit with terminals */
function cell(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline();
  if (v.kind === 'din') {
    a.box(X0, YF + 10, Z0 + 20, X1, YB - 10, Z1 - 20); a.box(X0 + 4, YF + 4, Z0 + 14, X1 - 4, YB - 4, Z0 + 20 + 6);
    for (let i = 0; i < 6; i++) { const x = X0 + 14 + i * ((W - 28) / 6); a.box(x, YF + 6, Z1 - 26, x + (W - 28) / 6 - 4, YF + 14, Z1 - 6); a.cyl(x + (W - 28) / 12 - 2, YF + 14, Z1 - 20, Z1 - 18, 3, 8); a.box(x, YF + 6, Z0 + 6, x + (W - 28) / 6 - 4, YF + 14, Z0 + 26); }
    for (let i = 0; i < 5; i++) led(a, X0 + 16 + i * 12, Z0 + H * 0.5, YF + 4, 2.4);
    a.box(X0 + 20, YF + 2, Z0 + H * 0.28, X0 + 70, YF + 14, Z0 + H * 0.4); a.box(X1 - 60, YF + 3, Z0 + H * 0.58, X1 - 18, YF + 9, Z0 + H * 0.74);
    for (let i = 0; i < 2; i++) a.cyl(X1 - 20 - i * 18, YB - 6, Z1 - 22, Z1 - 4, 3.4, 8); a.box(cx - 18, YB - 3, Z0 + 10, cx + 18, YB, Z1 - 10);
    a.log('Added the narrow case with terminal blocks above and below, a SIM door, status lights, two antenna posts and a rear DIN-rail clip (plan and 3D).'); return;
  }
  const bh = H * 0.34;
  slab(a, X0 + 6, YF + 6, X1 - 6, YB - 6, Z0 + 4, Z0 + bh, 16); feet(a, X0 + 24, X1 - 24, YF + 24, YB - 24, 6, 4);
  for (let i = 0; i < 5; i++) led(a, X0 + W * 0.2 + i * 14, Z0 + bh * 0.55, YF + 4.6, 2.2);
  a.box(X1 - W * 0.3, YF + 3, Z0 + bh * 0.3, X1 - W * 0.12, YF + 6.5, Z0 + bh * 0.75); ports(a, X0 + 20, X1 - 20, Z0 + 8, Z0 + bh - 8, YB - 10, 5, 4);
  ribs(a, X0 + 20, Z0 + bh - 1, X1 - 20, Z0 + bh, YF + 20, 1, true, 1, 0.5);
  const n = v.ant;
  for (let i = 0; i < n; i++) { const x = n === 1 ? cx : X0 + 24 + i * ((W - 48) / (n - 1)); a.box(x - 8, YB - 24, Z0 + bh - 6, x + 8, YB - 8, Z0 + bh + 10); a.cyl(x, YB - 16, Z0 + bh + 10, Z0 + bh + 18, 6, 8); a.tube([[x, YB - 16, Z0 + bh + 18], [x, YB - 16, Z1 - 4], [x, YB - 16 - (i % 2 ? 2 : 0), Z1]], [5, 5, 4], 8); }
  a.log(`Added the low body with a status light row, a SIM door, rear ports, rubber feet and ${n} hinged antennas (plan and 3D).`);
}

/** a desktop NAS: tower with columns of drive trays, latches and lights, a vented top, rear fan and feet */
function nas(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cols = v.cols, rows = v.rows;
  a.prism(rr(X0, YF + 6, X1, YB, 10), Z0 + 6, Z1); a.poly(rr(X0, YF, X1, YB, 10)); a.outline(); feet(a, X0 + 14, X1 - 14, YF + 20, YB - 20, 6, 6);
  const bx0 = X0 + 10, bx1 = X1 - 10, bz0 = Z0 + H * 0.2, bz1 = Z1 - 10, cw = (bx1 - bx0) / cols, rh = (bz1 - bz0) / rows;
  a.box(X0 + 4, YF + 3, Z0 + 8, X1 - 4, YF + 8, Z1 - 4);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x0 = bx0 + c * cw + 1.5, z0 = bz0 + r * rh + 1.5; a.box(x0, YF, z0, x0 + cw - 3, YF + 6, z0 + rh - 3); a.box(x0 + 3, YF - 1.5, z0 + rh * 0.4, x0 + cw - 6, YF, z0 + rh * 0.5); led(a, x0 + cw - 6, z0 + rh - 8, YF + 6, 1.3); a.box(x0 + cw * 0.3, YF - 0.5, z0 + 4, x0 + cw * 0.7, YF, z0 + 7); }
  a.cyl(cx - W * 0.3, YF + 3, Z0 + H * 0.1, Z0 + H * 0.1 + 1, 4, 8); a.box(cx, YF + 3, Z0 + H * 0.07, cx + W * 0.25, YF + 4, Z0 + H * 0.13);
  for (let i = 0; i < 12; i++) a.box(X0 + 12 + i * ((W - 24) / 12), YF + 16, Z1, X0 + 12 + i * ((W - 24) / 12) + 4, YB - 16, Z1 + 0.01);
  fan(a, cx, Z0 + H * 0.5, m.min(W * 0.32, H * 0.28), YB - 5, YB); a.box(cx - W * 0.3, YB - 3, Z0 + 10, cx + W * 0.3, YB, Z0 + H * 0.2);
  a.log(`Added the tower with ${cols * rows} drive trays with latches and activity lights, a power button, a vented top, a rear fan and rear ports (plan and 3D).`);
}

/** a structured media enclosure: wall box with a flange, hinged door with louvers, a latch and a label window */
function smedia(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline(); a.rect(X0 + 14, YF + 4, X1 - 14, YB, 'EQUIP-DETAIL');
  a.box(X0 + 12, YF + 6, Z0 + 12, X1 - 12, YB, Z1 - 12); a.frame(X0, Z0, X1, Z1, YF, YF + 6, 12);
  a.box(X0 + 20, YF + 2, Z0 + 20, X1 - 20, YF + 6, Z1 - 20);
  ribs(a, X0 + W * 0.18, Z0 + H * 0.12, X1 - W * 0.18, Z0 + H * 0.3, YF, m.round(H / 60), true, 2.4, 2); ribs(a, X0 + W * 0.18, Z1 - H * 0.3, X1 - W * 0.18, Z1 - H * 0.12, YF, m.round(H / 60), true, 2.4, 2);
  for (const z of [Z0 + H * 0.2, Z0 + H * 0.5, Z0 + H * 0.8]) a.xcyl(X0 - 0, X0 + 12, YF + 4, z, 4, 8);
  a.box(X1 - 32, YF - 3, (Z0 + Z1) / 2 - 14, X1 - 22, YF + 2, (Z0 + Z1) / 2 + 14); a.cyl(X1 - 27, YF - 3, (Z0 + Z1) / 2, (Z0 + Z1) / 2 + 0.01, 0.01, 3); a.ycyl(YF - 3, YF + 2, X1 - 27, (Z0 + Z1) / 2 + 22, 3, 8);
  a.box(cx - W * 0.2, YF - 0.5, Z0 + H * 0.4, cx + W * 0.2, YF + 2, Z0 + H * 0.46);
  for (const x of [X0 + 20, X1 - 20]) for (const z of [Z0 + 20, Z1 - 20]) a.ycyl(YF + 2, YF + 3.4, x, z, 3, 6);
  a.log(`Added the flange frame, a hinged door with two louvered vent bands, a latch, a label strip and three hinge knuckles over a ${m.round(H / IN)} in tall box (plan and 3D).`);
}

/** a fibre splice closure: vertical dome on a base with cable ports and a clamp band, or a wall box with hinged cover and glands */
function splice(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  if (v.kind === 'wall') {
    a.outline(); a.box(X0, YF + 10, Z0, X1, YB, Z1); a.box(X0 + 4, YF + 4, Z0 + 4, X1 - 4, YF + 10, Z1 - 4); a.box(X0 + 14, YF + 2, Z0 + 14, X1 - 14, YF + 4, Z1 - 14);
    for (const z of [Z0 + H * 0.25, Z1 - H * 0.25]) a.xcyl(X0 - 0, X0 + 12, YF + 8, z, 4, 8);
    a.box(X1 - 20, YF, (Z0 + Z1) / 2 - 12, X1 - 10, YF + 8, (Z0 + Z1) / 2 + 12);
    for (let i = 0; i < 4; i++) { const x = X0 + 24 + i * ((W - 48) / 3); a.ycyl(YF + 12, YB - 4, x, Z0, 0.01, 3); a.cyl(x, YB - 24, Z0 - 0, Z0 + 0.01, 0.01, 3); a.cyl(x, YB - 20, Z0, Z0 + 12, 7, 8); }
    for (let i = 0; i < 2; i++) a.box(X0 + 20, YF + 2, Z0 + H * 0.3 + i * (H * 0.3), X1 - 20, YF + 3, Z0 + H * 0.3 + i * (H * 0.3) + 3); a.box(X0 + 30, YB - 3, Z1 - 20, X1 - 30, YB, Z1 - 10);
    a.log('Added the box with a hinged cover on two hinges and a latch, a label plate, four cable glands underneath and two mounting tabs (plan and 3D).'); return;
  }
  a.outline(); const r = W / 2;
  a.cyl(cx, cy, Z0, Z0 + 20, r, 28); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.8, 'EQUIP-DETAIL');
  for (let i = 0; i < 4; i++) { const t = (i / 4) * m.PI * 2 + 0.4; a.cyl(cx + r * 0.58 * m.cos(t), cy + r * 0.58 * m.sin(t), Z0 - 0, Z0 + 20, 6, 8); }
  a.cyl(cx, cy, Z0 + 20, Z1 - r * 0.8 - 4, r * 0.88, 28); a.ell(cx, cy, Z1 - r * 0.8, r * 0.88, r * 0.88, r * 0.8, 20, 8);
  a.cyl(cx, cy, Z0 + 20, Z0 + 30, r * 0.98, 28); for (const k of [Z0 + 36, Z0 + 52]) a.cyl(cx, cy, k, k + 3, r * 0.95, 28);
  for (const s of [-1, 1]) a.box(cx + s * r * 0.9 - 4, cy - 10, Z0 + 20, cx + s * r * 0.9 + 4, cy + 10, Z0 + 56);
  a.log('Added the base plate with four cable port stubs, a clamp band, a cylindrical dome with seam rings, a domed cap and two clamp bolts (plan and 3D).');
}

/** a desk IP phone: wedge base with a keypad, display and speaker, a handset in a cradle, optional key module */
function voip(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, bw = v.exp ? W * 0.6 : W, px1 = X0 + bw;
  a.outline();
  prismX(a, [[YF, Z0 + 4], [YB, Z0 + 4], [YB, Z0 + H * 0.75], [YF, Z0 + H * 0.3]], X0, px1);
  const zt = (y) => Z0 + H * 0.3 + (H * 0.45) * ((y - YF) / D);
  const kx0 = X0 + bw * 0.38, kx1 = px1 - bw * 0.05;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const y = YF + D * 0.1 + r * D * 0.1; a.box(kx0 + c * ((kx1 - kx0) / 3) + 2, y, zt(y), kx0 + (c + 1) * ((kx1 - kx0) / 3) - 2, y + D * 0.085, zt(y) + 4); }
  a.rect(kx0, YF + D * 0.1, kx1, YF + D * 0.5, 'EQUIP-DETAIL');
  const dy = YF + D * 0.6, dh = v.big ? D * 0.36 : D * 0.28; a.box(X0 + bw * 0.38, dy, zt(dy), px1 - bw * 0.05, dy + dh, zt(dy) + 2.5);
  for (let i = 0; i < 4; i++) a.box(X0 + bw * 0.38 + i * 14, dy - D * 0.06, zt(dy - D * 0.06), X0 + bw * 0.38 + i * 14 + 10, dy - D * 0.02, zt(dy - D * 0.02) + 3);
  const hx = X0 + bw * 0.16;
  a.box(hx - 10, YF + D * 0.1, zt(YF + D * 0.1), hx + 10, YB - D * 0.12, zt(YB - D * 0.12) + 14);
  a.tube([[hx, YF + D * 0.04, zt(YF + D * 0.1) + 24], [hx, YF + D * 0.3, zt(YF + D * 0.3) + 18], [hx, YB - D * 0.3, zt(YB - D * 0.3) + 18], [hx, YB - D * 0.08, zt(YB - D * 0.08) + 24]], [14, 9, 9, 14], 10);
  a.ell(hx, YF + D * 0.06, zt(YF + D * 0.1) + 22, 14, 18, 10, 10, 6); a.ell(hx, YB - D * 0.1, zt(YB - D * 0.08) + 22, 14, 18, 10, 10, 6);
  a.tube([[X0 + 18, YB - 4, Z0 + 8], [X0 + 18, YB, Z0 + 6]], [3, 3], 6);
  if (v.exp) { slab(a, px1 + 6, YF, X1, YB, Z0 + 4, Z0 + H * 0.5, 10); for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) a.box(px1 + 14 + c * ((X1 - px1 - 22) / 2), YF + 14 + r * ((D - 28) / 6), Z0 + H * 0.5, px1 + 14 + (c + 1) * ((X1 - px1 - 22) / 2) - 4, YF + 14 + (r + 1) * ((D - 28) / 6) - 4, Z0 + H * 0.5 + 3); a.rect(px1 + 6, YF, X1, YB, 'EQUIP-DETAIL'); }
  for (const x of [X0 + 24, px1 - 24]) a.cyl(x, YB - 20, Z0, Z0 + 4, 7, 6);
  a.log(`Added the wedge base with a 12-key pad, ${v.big ? 'a large' : 'a'} display, soft keys, the handset in its cradle with a coiled lead${v.exp ? ' and a side module of 12 line keys' : ''} (plan and 3D).`);
}

/** a conference speakerphone: round puck with a mic ring, buttons and a light band, or a three-arm star */
function spkphone(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  if (v.kind === 'puck') {
    a.circ(cx, cy, W / 2); a.cyl(cx, cy, Z0, Z1 - 4, W * 0.5, 36); a.cyl(cx, cy, Z1 - 4, Z1 - 1, W * 0.46, 36); a.cyl(cx, cy, Z1 - 1, Z1, W * 0.18, 20);
    a.cyl(cx, cy, Z0, Z0 + 3, W * 0.52, 36);
    for (let i = 0; i < 6; i++) { const t = (i / 6) * m.PI * 2; a.cyl(cx + W * 0.34 * m.cos(t), cy + W * 0.34 * m.sin(t), Z1 - 1, Z1, 3, 6); }
    for (let i = 0; i < 3; i++) a.cyl(cx + (i - 1) * 24, cy - W * 0.1, Z1 - 1, Z1 + 0, 6, 8);
    a.cyl(cx, cy, Z0 + (Z1 - Z0) * 0.3, Z0 + (Z1 - Z0) * 0.3 + 2, W * 0.505, 36);
    a.log('Added the round puck with a light band, a recessed top with a ring of six microphone holes, a speaker cap and three buttons (plan and 3D).'); return;
  }
  const arm = (ang) => { const c = m.cos(ang), s = m.sin(ang), w = W * 0.1; const pts = [[0, -w], [W * 0.46, -w * 0.8], [W * 0.46, w * 0.8], [0, w]].map(([u, t]) => [cx + u * c - t * s, cy + u * s + t * c]); a.prism(pts, Z0, Z1 - 2); a.cyl(cx + W * 0.38 * c, cy + W * 0.38 * s, Z1 - 2, Z1, 4, 8); };
  for (const g of [-90, 30, 150]) arm((g * m.PI) / 180);
  a.cyl(cx, cy, Z0, Z1, W * 0.16, 24); a.circ(cx, cy, W * 0.16, 'EQUIP-DETAIL'); a.cyl(cx, cy, Z1, Z1 + 0, W * 0.1, 18);
  a.log('Added the three-arm star with a microphone hole on each arm tip, a central body with a light ring and buttons (plan and 3D).');
}

/** a modular core switch chassis: line cards stacked in slots with port rows, two supervisor cards, a fan column and bottom power supplies */
function coresw(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, u = v.u, ear = rackBody(a, u, 10), fx0 = X0 + ear + 8, fx1 = X1 - ear - 8 - 70, pz1 = Z0 + 6 + 62;
  const n = v.slots, sh = (Z1 - Z0 - 12 - 70) / n;
  for (let i = 0; i < n; i++) {
    const z0 = Z0 + 6 + 70 + i * sh + 1.5, z1 = z0 + sh - 3, sup = v.sup && (i === n / 2 - 1 || i === n / 2);
    a.box(fx0, YF + 6, z0, fx1, YF + 11, z1); a.box(fx0 + 2, YF + 3, z0 + 2, fx0 + 10, YF + 6, z1 - 2); a.box(fx1 - 10, YF + 3, z0 + 2, fx1 - 2, YF + 6, z1 - 2);
    if (sup) { a.box(fx0 + 30, YF + 4, z0 + sh * 0.3, fx0 + 130, YF + 11, z0 + sh * 0.7); for (let k = 0; k < 4; k++) led(a, fx1 - 30 - k * 12, (z0 + z1) / 2, YF + 11, 2); }
    else for (let k = 0; k < 24; k++) { const w = (fx1 - fx0 - 60) / 24; a.box(fx0 + 20 + k * w + 1, YF + 3, z0 + sh * 0.25, fx0 + 20 + (k + 1) * w - 1, YF + 6, z0 + sh * 0.65); }
  }
  for (let i = 0; i < 4; i++) { const w = (fx1 + 70 - fx0) / 4; a.box(fx0 + i * w + 3, YF + 6, Z0 + 8, fx0 + (i + 1) * w - 3, YF + 14, Z0 + 66); a.box(fx0 + i * w + w * 0.3, YF + 3, Z0 + 28, fx0 + i * w + w * 0.7, YF + 14, Z0 + 38); }
  const fwx = fx1 + 6; a.box(fwx, YF + 6, Z0 + 76, fwx + 60, YF + 11, Z1 - 8); for (let i = 0; i < n; i++) fan(a, fwx + 30, Z0 + 76 + 24 + i * ((Z1 - Z0 - 76 - 8 - 48) / m.max(1, n - 1)), 22, YF + 3, YF + 8);
  a.box(X0 + ear + 10, YB - 3, Z0 + 8, X1 - ear - 10, YB, Z1 - 10);
  a.log(`Added the ${u}U chassis with ${n} horizontal slots carrying line cards of 24 ports${v.sup ? ' and two supervisor cards' : ''}, a fan column, ${4} bottom power supplies and rack ears (plan and 3D).`);
}

/** an outdoor wall-mount telecom enclosure: door with latches, hinges, roof shield, mounting tabs, gland plate and a louvered vent */
function outdoor(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, tab = 22;
  a.outline(); a.rect(X0 + tab, YF + 6, X1 - tab, YB, 'EQUIP-DETAIL');
  a.box(X0 + tab, YF + 12, Z0, X1 - tab, YB, Z1 - 20); a.box(X0 + tab, YF + 4, Z0 + 4, X1 - tab, YF + 12, Z1 - 24);
  prismX(a, [[YB, Z1 - 20], [YF - 0 + 0, Z1 - 20], [YF, Z1 - 8], [YB, Z1]], X0 + tab - 10, X1 - tab + 10);
  for (const z of [Z0 + 10, Z1 - 40]) for (const s of [0, 1]) { a.box(s ? X1 - tab : X0, YB - 6, z, s ? X1 : X0 + tab, YB, z + 28); a.ycyl(YB - 8, YB, s ? X1 - 10 : X0 + 10, z + 14, 4.4, 8); }
  for (const z of [Z0 + H * 0.3, Z0 + H * 0.7].slice(0, v.latch)) a.box(X1 - tab - 20, YF, z - 12, X1 - tab - 8, YF + 6, z + 12);
  a.box(X1 - tab - 28, YF - 3, Z0 + H * 0.45, X1 - tab - 14, YF + 4, Z0 + H * 0.5); a.cyl(X1 - tab - 21, YF + 2, Z0 + H * 0.5 - 12, Z0 + H * 0.5 - 6, 5, 8);
  for (const z of [Z0 + 20, Z0 + H * 0.5, Z1 - 60]) a.xcyl(X0 + tab - 4, X0 + tab + 6, YF + 8, z, 4, 8);
  ribs(a, X0 + tab + 20, Z0 + H * 0.22, X1 - tab - 40, Z0 + H * 0.34, YF, 4, true, 2.4, 2);
  a.box(X0 + tab + 20, YF + 2, Z0 + H * 0.58, X0 + tab + 60, YF + 6, Z0 + H * 0.58 + 24);
  const gp = Z0; a.box(X0 + tab + 10, YF + 20, gp - 0, X1 - tab - 10, YB - 20, gp + 4); for (let i = 0; i < v.glands; i++) { const x = X0 + tab + 30 + i * ((W - 2 * tab - 60) / m.max(1, v.glands - 1)); a.cyl(x, YF + D * 0.5, gp, gp + 0, 0.01, 3); a.cyl(x, YF + D * 0.55, Z0, Z0 + 14, 9, 10); }
  a.log(`Added the box with a gasketed hinged door on two hinges, ${v.latch} latch${v.latch > 1 ? 'es' : ''} with a padlock tab, a sloped roof shield, four mounting tabs, a louvered vent and ${v.glands} cable glands underneath (plan and 3D).`);
}

/** a powerline adapter or Wi-Fi extender: wall-plug body with LAN port and lights, optional pass-through socket or antennas */
function plug(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline(); const bz1 = v.ant ? Z0 + H * 0.62 : Z1;
  a.prism(rr(X0, YF, X1, YB - 14, 10), Z0, bz1); a.poly(rr(X0, YF, X1, YB - 14, 10));
  for (const s of [-1, 1]) a.box(cx + s * W * 0.2 - 3.6, YB - 14, Z0 + (bz1 - Z0) * 0.5 - 12, cx + s * W * 0.2 + 3.6, YB, Z0 + (bz1 - Z0) * 0.5 + 12);
  a.cyl(cx, YB - 8, Z0 + (bz1 - Z0) * 0.5 - 20, Z0 + (bz1 - Z0) * 0.5 - 12, 3, 6);
  if (v.sock) { a.ycyl(YF - 0.5, YF + 2, cx, Z0 + H * 0.62, W * 0.32, 22); for (const s of [-1, 1]) a.ycyl(YF - 0.5, YF + 2.4, cx + s * W * 0.14, Z0 + H * 0.62, 2.8, 6); a.ycyl(YF - 0.5, YF + 2.4, cx, Z0 + H * 0.62 - W * 0.14, 2.8, 6); }
  a.box(cx - W * 0.28, YF - 2.5, Z0 + 4, cx + W * 0.28, YF, Z0 + 14);
  for (let i = 0; i < 3; i++) led(a, X0 + W * 0.2 + i * 10, bz1 - 14, YF - 1.4, 1.8);
  if (v.ant) for (const s of [-1, 1]) { a.cyl(cx + s * W * 0.28, YB - 30, bz1 - 6, bz1 + 6, 5, 8); a.tube([[cx + s * W * 0.28, YB - 30, bz1 + 6], [cx + s * W * 0.28, YB - 30, Z1 - 4]], [3.6, 3.2], 8); a.cyl(cx + s * W * 0.28, YB - 30, Z1 - 4, Z1, 3.2, 8); }
  a.log(`Added the rounded wall-plug body with two plug blades and an earth pin behind, a LAN port underneath, status lights${v.sock ? ', and a pass-through mains socket on the front' : ''}${v.ant ? ' and two external antennas' : ''} (plan and 3D).`);
}

const NET = [
  fam({ cat: 'computer/network', title: 'Generic network wall plate',
    desc: (v) => `${v.gang > 1 ? 'Two-gang ' : ''}faceplate with ${v.n} keystone jack opening${v.n > 1 ? 's' : ''} with dust shutters, label window, four screws and a back box.`,
    vs: [['1 port', 2.75, 1.6, 4.5, 0, { n: 1, gang: 1 }], ['2 ports', 2.75, 1.6, 4.5, 0, { n: 2, gang: 1 }], ['4 ports, two-gang', 4.6, 1.6, 4.5, 0, { n: 4, gang: 2 }]],
    build: wallplate }),
  fam({ cat: 'computer/network', title: 'Generic PoE injector',
    desc: (v) => `Rounded body with ${v.n} pair${v.n > 1 ? 's' : ''} of data in and power-out ports, link lights, rubber feet and a DC input${v.n > 1 ? ' with two wall slots on top' : ''}.`,
    vs: [['single port', 3.6, 2.2, 1.3, 0, { n: 1 }], ['4 port midspan', 10, 5.2, 1.7, 0, { n: 4 }]],
    build: poe }),
  fam({ cat: 'computer/network', title: 'Generic mesh Wi-Fi node',
    desc: (v) => v.kind === 'cube' ? 'Rounded cube body with a light bar on the front, a vent slit pattern on top, rubber feet and rear ports.' : `Round ${v.kind === 'tall' ? 'tall' : 'compact'} pillar with a base ring, a domed top, a light ring, a band of 24 vent slits and a rear port recess.`,
    vs: [['tall pillar', 4.3, 4.3, 9.5, 0, { kind: 'tall' }], ['compact pillar', 3.8, 3.8, 5.2, 0, { kind: 'compact' }], ['cube', 4.6, 4.6, 4.2, 0, { kind: 'cube' }]],
    build: mesh }),
  fam({ cat: 'computer/network', title: 'Generic outdoor wireless antenna',
    desc: (v) => v.kind === 'panel' ? 'Flat sector panel with a face cover and ribs, two clamp brackets on a mast pipe and two connector stubs underneath.' : v.kind === 'dish' ? 'Parabolic dish with a rim, a feed arm with a feed box, a rear housing, two struts, a bracket and a mast pipe.' : 'Tall cylindrical radome on a flange base with a mast clamp collar, joint rings, a domed cap and a connector.',
    vs: [['sector panel', 12, 6.5, 26, 0, { kind: 'panel' }], ['dish, 24 in', 24, 14, 32, 0, { kind: 'dish' }], ['omni radome', 3.2, 3.2, 36, 0, { kind: 'omni' }]],
    build: antenna }),
  fam({ cat: 'computer/network', title: 'Generic cellular router',
    desc: (v) => v.kind === 'din' ? 'Narrow case with terminal blocks above and below, a SIM door, status lights, two antenna posts and a rear DIN-rail clip.' : `Low body with a status light row, a SIM door, rear ports, rubber feet and ${v.ant} hinged antennas.`,
    vs: [['desktop, 2 antennas', 7, 5, 8.5, 0, { kind: 'desk', ant: 2 }], ['desktop, 4 antennas', 9, 5.5, 9.5, 0, { kind: 'desk', ant: 4 }], ['DIN rail unit', 3.5, 4.5, 4.8, 0, { kind: 'din' }]],
    build: cell }),
  fam({ cat: 'computer/network', title: 'Generic desktop NAS',
    desc: (v) => `Tower with ${v.cols * v.rows} drive trays with latches and activity lights, a power button, a vented top, a rear fan and rear ports.`,
    vs: [['2 bay', 4.2, 8, 6.4, 0, { cols: 2, rows: 1 }], ['4 bay', 7.4, 9.5, 7, 0, { cols: 4, rows: 1 }], ['8 bay', 8.6, 11, 12, 0, { cols: 4, rows: 2 }]],
    build: nas }),
  fam({ cat: 'computer/network', title: 'Generic structured media enclosure',
    desc: 'Wall enclosure with a flange frame, a hinged door with two louvered vent bands, a latch, a label strip and three hinge knuckles.',
    vs: [['14 in', 14.25, 3.75, 14.5, 0, {}], ['20 in', 14.25, 3.75, 20.5, 0, {}], ['28 in', 14.25, 3.75, 28.5, 0, {}]],
    build: smedia }),
  fam({ cat: 'computer/network', title: 'Generic fibre splice closure',
    desc: (v) => v.kind === 'wall' ? 'Wall box with a hinged cover on two hinges and a latch, a label plate, four cable glands underneath and two mounting tabs.' : 'Base plate with four cable port stubs, a clamp band, a cylindrical dome with seam rings, a domed cap and two clamp bolts.',
    vs: [['dome, small', 5.5, 5.5, 14, 0, { kind: 'dome' }], ['dome, large', 8.5, 8.5, 22, 0, { kind: 'dome' }], ['wall box', 9, 4, 12, 0, { kind: 'wall' }]],
    build: splice }),
  fam({ cat: 'computer/network', title: 'Generic IP desk phone',
    desc: (v) => `Wedge base with a 12-key pad, ${v.big ? 'a large' : 'a'} display, soft keys, the handset in its cradle with a coiled lead${v.exp ? ' and a side module of 12 line keys' : ''}.`,
    vs: [['basic', 8, 8.5, 4.8, 0, { big: 0, exp: 0 }], ['large display', 9, 9, 6, 0, { big: 1, exp: 0 }], ['with key module', 14, 8.5, 5, 0, { big: 0, exp: 1 }]],
    build: voip }),
  fam({ cat: 'computer/network', title: 'Generic conference speakerphone',
    desc: (v) => v.kind === 'puck' ? 'Round puck with a light band, a recessed top with a ring of six microphone holes, a speaker cap and three buttons.' : 'Three-arm star with a microphone hole on each arm tip, a central body with a light ring and buttons.',
    vs: [['round puck', 6.5, 6.5, 1.8, 0, { kind: 'puck' }], ['three-arm star', 11, 11, 1.5, 0, { kind: 'star' }]],
    build: spkphone }),
  fam({ cat: 'computer/network', title: 'Generic modular core switch',
    desc: (v) => `${v.u}U chassis with ${v.slots} horizontal slots carrying 24-port line cards${v.sup ? ' and two supervisor cards' : ''}, a fan column, four bottom power supplies and rack ears.`,
    vs: [['7U, 6 slots', 19, 20, uh(7), 0, { u: 7, slots: 6, sup: 0 }], ['10U, 8 slots', 19, 22, uh(10), 0, { u: 10, slots: 8, sup: 1 }], ['14U, 12 slots', 19, 24, uh(14), 0, { u: 14, slots: 12, sup: 1 }]],
    build: coresw }),
  fam({ cat: 'computer/network', title: 'Generic outdoor telecom enclosure',
    desc: (v) => `Wall-mount box with a gasketed door on two hinges, ${v.latch} latch${v.latch > 1 ? 'es' : ''} with a padlock tab, a sloped roof shield, four mounting tabs, a louvered vent and ${v.glands} cable glands underneath.`,
    vs: [['12 x 10 x 6 in', 14, 6.5, 12.5, 0, { latch: 1, glands: 2 }], ['16 x 14 x 8 in', 18, 8.5, 16.5, 0, { latch: 2, glands: 3 }], ['24 x 20 x 10 in', 24, 10.5, 24.5, 0, { latch: 2, glands: 4 }]],
    build: outdoor }),
  fam({ cat: 'computer/network', title: 'Generic powerline adapter',
    desc: (v) => `Rounded wall-plug body with two plug blades and an earth pin behind, a LAN port underneath, status lights${v.sock ? ', and a pass-through mains socket on the front' : ''}.`,
    vs: [['mini', 2.4, 2.4, 3.4, 0, { sock: 0, ant: 0 }], ['with pass-through socket', 2.9, 3.0, 4.6, 0, { sock: 1, ant: 0 }]],
    build: plug }),
  fam({ cat: 'computer/network', title: 'Generic Wi-Fi range extender',
    desc: (v) => `Rounded wall-plug body with two plug blades and an earth pin behind, a LAN port underneath, status lights${v.ant ? ' and two external antennas' : ''}.`,
    vs: [['plug-in, internal antennas', 2.6, 2.4, 3.8, 0, { sock: 0, ant: 0 }], ['plug-in, two antennas', 3.1, 2.6, 6.8, 0, { sock: 0, ant: 1 }]],
    build: plug }),
];
export default [...DESK, ...PER, ...SRV, ...NET];

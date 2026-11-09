/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, tech: 150 more gadgets, audio, smart-home and IoT devices, wearables. Original geometry; generic size classes, no makers or models. */
import { fam } from './r4-kit.mjs';
import { loft } from './com-core.mjs';

const IN = 25.4, m = Math;

// ------------------------------------------------------------------------------------------ helpers
/** rounded rectangle polygon (convex) in a 2D plane */
function rr(x0, z0, x1, z1, r, n = 4) {
  r = m.min(r, (x1 - x0) / 2 - 0.01, (z1 - z0) / 2 - 0.01); const p = [];
  for (const [cx, cz, a0] of [[x1 - r, z1 - r, 0], [x0 + r, z1 - r, 90], [x0 + r, z0 + r, 180], [x1 - r, z0 + r, 270]]) for (let i = 0; i <= n; i++) { const t = ((a0 + (90 * i) / n) * m.PI) / 180; p.push([cx + r * m.cos(t), cz + r * m.sin(t)]); }
  return p;
}
/** extrude a convex polygon given as [x, z] points between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** extrude a convex polygon given as [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** a rounded slab in plan (extruded in z) */
function slab(a, x0, y0, x1, y1, z0, z1, r = 20) { a.prism(rr(x0, y0, x1, y1, r), z0, z1); a.poly(rr(x0, y0, x1, y1, r)); }
/** a rounded plate seen from the front (extruded in y) */
function plate(a, x0, z0, x1, z1, y0, y1, r = 20) { prismY(a, rr(x0, z0, x1, z1, r), y0, y1); }
/** raised ribs (vent slots) on a front face: n ribs between the corners, horizontal or vertical */
function ribs(a, x0, z0, x1, z1, y, n, hor = true, t = 3, dy = 3) {
  for (let i = 0; i < n; i++) { const f = (i + 0.5) / n; if (hor) a.box(x0, y, z0 + (z1 - z0) * f - t / 2, x1, y + dy, z0 + (z1 - z0) * f + t / 2); else a.box(x0 + (x1 - x0) * f - t / 2, y, z0, x0 + (x1 - x0) * f + t / 2, y + dy, z1); }
}
/** a front-facing fan: ring, hub and four spokes */
function fan(a, x, z, r, y0, y1) { a.ycyl(y0, y1, x, z, r, 20); a.ycyl(y0 - 0, y1 + 0.5, x, z, r * 0.22, 10); for (const t of [0, 1]) a.box(x - (t ? r * 0.9 : 3), y0, z - (t ? 3 : r * 0.9), x + (t ? r * 0.9 : 3), y1 + 0.4, z + (t ? 3 : r * 0.9)); }
/** a grid of keys on a flat deck: cols x rows between x0..x1, y0..y1 at height z */
function keys(a, x0, y0, x1, y1, cols, rows, z, h = 5, gap = 1.6) {
  const cw = (x1 - x0) / cols, rh = (y1 - y0) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) a.box(x0 + c * cw + gap, y0 + r * rh + gap, z, x0 + (c + 1) * cw - gap, y0 + (r + 1) * rh - gap, z + h);
  a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
/** a dome (half ellipsoid with flat base) lofted from sections; rx, ry radii, height h; ox,oy centre */
function dome(a, ox, oy, z0, rx, ry, h, n = 9, shift = 0) { const secs = []; for (let i = 0; i <= n; i++) { const th = (i / n) * m.PI * 0.5 * 0.985, r = m.cos(th); secs.push({ z: z0 + h * m.sin(th), x: ox, y: oy + shift * m.sin(th) * ry, rx: rx * r + 0.01, ry: ry * r + 0.01 }); } a.add(loft(secs, 24)); }
/** a small round-footed stand of four feet under a body */
function feet(a, x0, x1, y0, y1, r = 12, h = 10) { for (const x of [x0, x1]) for (const y of [y0, y1]) a.cyl(x, y, a.Z0, a.Z0 + h, r, 8); }
/** a half-ring band in the X-Z plane (a headband): centre (cx, cz), mid radius R, band thickness rt (radial) between y0 and y1, from angle t0 to t1 */
function arcBand(a, cx, cz, R, rt, y0, y1, t0 = 0, t1 = m.PI, n = 18) { for (let i = 0; i < n; i++) { const p = (k, r) => { const th = t0 + (t1 - t0) * (k / n); return [cx + r * m.cos(th), cz + r * m.sin(th)]; }; prismY(a, [p(i, R - rt / 2), p(i + 1, R - rt / 2), p(i + 1, R + rt / 2), p(i, R + rt / 2)], y0, y1); } }
/** a torus-like ring in the X-Z plane: centre (cx, cz), ring radius R, tube radius t, at depth y */
function ringXZ(a, cx, cz, R, t, y, n = 20) { arcBand(a, cx, cz, R, 2 * t, y - t, y + t, 0, 2 * m.PI, n); }
/** a ring lying in the Y-Z plane (a loop worn round a wrist), cross-section a flat strap of width x0..x1, thickness t */
function loopYZ(a, x0, x1, cy, cz, ry, rz, t, n = 24) { for (let i = 0; i < n; i++) { const t0 = (i / n) * 2 * m.PI, t1 = ((i + 1) / n) * 2 * m.PI, p = (th, r) => [cy + (ry + r) * m.cos(th), cz + (rz + r) * m.sin(th)]; prismX(a, [p(t0, 0), p(t1, 0), p(t1, t), p(t0, t)], x0, x1); } }
/** a round-edged base plate for a standing device */
function base(a, x0, y0, x1, y1, z0, z1) { slab(a, x0, y0, x1, y1, z0, z1, m.min(20, (x1 - x0) / 3, (y1 - y0) / 3)); }

/** rotate the triangles added since index i0 about the X axis through (py, pz): a positive angle leans the top towards the back (+Y) */
function lean(a, i0, th, py, pz) {
  const c = m.cos(th), s = m.sin(th);
  for (let i = i0; i < a.t.length; i++) a.t[i] = a.t[i].map(([x, y, z]) => [x, py + (y - py) * c + (z - pz) * s, pz - (y - py) * s + (z - pz) * c]);
}
/** a closed loop in the X-Y plane (a strap round a head or arm): centre, radii, tube radius, height z */
function ringXY(a, cx, cy, rx, ry, t, z, n = 24) { for (let i = 0; i < n; i++) { const p = (k) => [cx + rx * m.cos((k / n) * 2 * m.PI), cy + ry * m.sin((k / n) * 2 * m.PI), z]; a.tube([p(i), p(i + 1)], [t, t], 6); } }
/** a wedge body (low at the front, high at the back) with a sloped top: returns the top height at y */
function wedge(a, x0, x1, y0, y1, z0, zf, zb, r = 0) { prismX(a, [[y0, z0], [y1, z0], [y1, zb], [y0, zf]], x0, x1); return (y) => zf + (zb - zf) * ((y - y0) / (y1 - y0)); }
/** a grid of keys on a sloped top given by height function zf(y) */
function skeys(a, x0, y0, x1, y1, cols, rows, zf, h = 3, gap = 1.6) {
  const cw = (x1 - x0) / cols, rh = (y1 - y0) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const ya = y0 + r * rh + gap, yb = y0 + (r + 1) * rh - gap; a.box(x0 + c * cw + gap, ya, m.min(zf(ya), zf(yb)), x0 + (c + 1) * cw - gap, yb, m.max(zf(ya), zf(yb)) + h); }
}

// ================================================================================================ GADGETS
/** a digital camera: body, lens barrel (one or two stages), grip, viewfinder hump, top dials and a rear screen */
function dcam(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, by0 = YB - v.bd, evh = v.evf ? H * 0.2 : 0, bz1 = Z1 - evh, zc = Z0 + (bz1 - Z0) * 0.52, lx = cx + (v.off || 0) * W;
  a.outline(); a.prism(rr(X0, by0, X1, YB, 10), Z0, bz1); a.poly(rr(X0, by0, X1, YB, 10), 'EQUIP-DETAIL');
  if (v.grip) { a.prism(rr(X1 - W * 0.2, by0 - 12, X1, by0 + 30, 8), Z0, bz1); }
  if (v.evf) { a.prism(rr(cx - W * 0.16, by0 + v.bd * 0.3, cx + W * 0.1, YB - 4, 6), bz1, Z1 - 2); a.box(cx - W * 0.1, YB - 12, bz1 + 2, cx + W * 0.06, YB, Z1 - 4); a.box(cx + W * 0.13, by0 + v.bd * 0.35, bz1, cx + W * 0.27, by0 + v.bd * 0.65, bz1 + 2.5); }
  if (v.flash) a.box(X0 + W * 0.1, by0 + 4, bz1, X0 + W * 0.3, by0 + v.bd * 0.5, bz1 + 7);
  a.cyl(X1 - W * 0.16, by0 + v.bd * 0.45, bz1, bz1 + 4, 6, 12); a.cyl(X1 - W * 0.16, by0 + v.bd * 0.45, bz1 + 4, bz1 + 5.5, 3, 8);
  a.cyl(X0 + W * 0.2, by0 + v.bd * 0.55, bz1, bz1 + 7, 11, 20); for (let i = 0; i < 10; i++) { const th = (i / 10) * 2 * m.PI; a.cyl(X0 + W * 0.2 + m.cos(th) * 11, by0 + v.bd * 0.55 + m.sin(th) * 11, bz1, bz1 + 7.2, 1.3, 4); }
  a.box(X0 + 8, YB - 3, Z0 + 8, X1 - 8, YB, bz1 - 6); a.rect(X0 + 8, YB - 3, X1 - 8, YB, 'EQUIP-DETAIL');
  const st = v.stages || [[1, 1]];
  const n = st.length; let yy = by0 + 4;
  for (let i = 0; i < n; i++) { const r = v.lr * st[i][0], len = (by0 + 4 - YF) * st[i][1]; a.ycyl(yy - len, yy, lx, zc, r, 30); yy -= len * 0.98; }
  const rf = v.lr * st[n - 1][0]; a.ycyl(YF, YF + 2, lx, zc, rf * 0.82, 26); ringXZ(a, lx, zc, rf * 0.97, 2.2, YF + 3, 28);
  if (v.hood) { a.ycyl(YF, YF + 14, lx, zc, rf * 1.12, 30); a.ycyl(YF, YF + 14, lx, zc, rf * 0.9, 30); }
  a.circ(lx, YF + (by0 - YF) / 2, v.lr, 'EQUIP-DETAIL');
  a.log(`Added the body with a grip${v.grip ? '' : ' edge'}, ${n > 1 ? 'a two-stage zoom lens barrel' : 'a lens barrel'} with a front ring${v.hood ? ' and a hood' : ''}, a shutter button, a mode dial${v.evf ? ', a viewfinder hump with a hot shoe' : ''}${v.flash ? ', a pop-up flash' : ''} and a rear screen (plan and 3D).`);
}
/** a portable Bluetooth speaker in five forms */
function pspeaker(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  if (v.kind === 'bottle') {
    const r = W / 2, top = Z1 - 8; a.cyl(cx, cy, Z0, Z0 + 6, r * 0.96, 30); a.cyl(cx, cy, Z0 + 6, top, r, 32); a.circ(cx, cy, r);
    for (let z = Z0 + 14; z < top - 12; z += 9) a.cyl(cx, cy, z, z + 3, r * 1.03, 32);
    a.cyl(cx, cy, top, Z1, r * 0.96, 32); for (let i = 0; i < 3; i++) a.cyl(cx - r * 0.45 + i * r * 0.45, cy - r * 0.4, Z1 - 1, Z1, 5, 8);
    a.tube([[cx - r * 0.5, cy, Z1 - 4], [cx - r * 0.55, cy, Z1 - 6]], [3, 3], 6); a.ycyl(YB - 4, YB, cx, Z0 + (top - Z0) * 0.7, 3, 6);
    a.log('Added the cylinder body with grille rings, a rubber base and top cap with three buttons and a charging cover (plan and 3D).');
  } else if (v.kind === 'brick') {
    a.outline(); feet(a, X0 + W * 0.15, X1 - W * 0.15, YF + D * 0.2, YB - D * 0.2, 8, 5);
    a.prism(rr(X0, YF, X1, YB, 14), Z0 + 5, Z1 - 20); a.poly(rr(X0, YF, X1, YB, 14), 'EQUIP-DETAIL');
    a.box(X0 + 10, YF - 0.0, Z0 + 12, X1 - 10, YF + 3, Z1 - 30); for (const s of [-1, 1]) { const x = cx + s * W * 0.28, z = Z0 + (Z1 - 20 - Z0) * 0.46; a.ycyl(YF - 1, YF + 3, x, z, W * 0.14, 24); ringXZ(a, x, z, W * 0.1, 2.5, YF - 0.5, 20); a.ycyl(YF - 2, YF, x, z, W * 0.035, 10); }
    a.ycyl(YF - 1, YF + 3, cx, Z0 + (Z1 - 20 - Z0) * 0.7, W * 0.04, 10);
    a.tube([[X0 + W * 0.12, cy, Z1 - 20], [X0 + W * 0.15, cy, Z1 - 6], [cx, cy, Z1 - 2], [X1 - W * 0.15, cy, Z1 - 6], [X1 - W * 0.12, cy, Z1 - 20]], [5, 5, 5, 5, 5], 8);
    for (let i = 0; i < 4; i++) a.cyl(cx - 24 + i * 16, cy + 20, Z1 - 20, Z1 - 16, 4, 8);
    a.log('Added the rounded body on rubber feet with a grille, two driver rings, a tweeter, a carry handle and four top buttons (plan and 3D).');
  } else if (v.kind === 'tower') {
    a.outline(); for (const s of [-1, 1]) { a.ycyl(YB - 40, YB - 20, cx + s * W * 0.4, Z0 + 28, 28, 18); a.box(cx + s * W * 0.4 - 6, YB - 40, Z0 + 8, cx + s * W * 0.4 + 6, YB - 18, Z0 + 28); }
    a.prism(rr(X0, YF, X1, YB, 20), Z0 + 14, Z1 - 16); a.poly(rr(X0, YF, X1, YB, 20), 'EQUIP-DETAIL');
    const hh = Z1 - 16 - Z0 - 14; for (const [zf, rf] of [[0.3, 0.3], [0.74, 0.2]]) { const z = Z0 + 14 + hh * zf; a.ycyl(YF - 2, YF + 5, cx, z, W * rf, 32); ringXZ(a, cx, z, W * rf * 0.8, 4, YF - 1, 28); a.ell(cx, YF - 2, z, W * rf * 0.3, 6, W * rf * 0.3, 14, 8); }
    a.box(cx - W * 0.35, YF - 1, Z0 + 14 + hh * 0.92, cx + W * 0.35, YF + 2, Z0 + 14 + hh * 0.97);
    a.tube([[cx - W * 0.3, cy, Z1 - 16], [cx - W * 0.3, cy, Z1 - 4], [cx + W * 0.3, cy, Z1 - 4], [cx + W * 0.3, cy, Z1 - 16]], [8, 8, 8, 8], 8);
    for (let i = 0; i < 5; i++) a.cyl(cx - 40 + i * 20, YF + D * 0.3, Z1 - 16, Z1 - 14, 5, 8);
    a.log('Added the tall body with a woofer and tweeter ring, a light strip, a top handle with buttons, and two small rear wheels (plan and 3D).');
  } else if (v.kind === 'cube') {
    a.outline(); a.prism(rr(X0, YF, X1, YB, 12), Z0, Z1); a.poly(rr(X0, YF, X1, YB, 12), 'EQUIP-DETAIL');
    a.box(X0 + 8, YF - 0, Z0 + 8, X1 - 8, YF + 3, Z1 - 8); for (let i = 0; i < 6; i++) ribs(a, X0 + 12, Z0 + 12, X1 - 12, Z1 - 12, YF - 1.5, 7, true, 1.2, 1.5);
    a.ycyl(YF - 3, YF + 2, cx, Z0 + H * 0.5, W * 0.2, 24); ringXZ(a, cx, Z0 + H * 0.5, W * 0.15, 2, YF - 2, 20);
    a.log('Added the rounded cube body with a ribbed grille on the front and a centre driver ring (plan and 3D).');
  } else {
    a.outline(); a.prism(rr(X0, YF, X1, YB, D * 0.45), Z0, Z1); a.poly(rr(X0, YF, X1, YB, D * 0.45), 'EQUIP-DETAIL');
    a.box(X0 + 10, YF - 0, Z0 + 8, X1 - 10, YF + 3, Z1 - 8); ribs(a, X0 + 16, Z0 + 11, X1 - 16, Z1 - 11, YF - 1.5, 5, true, 1.2, 1.5);
    ringXZ(a, X1 - 14, Z1 - 12, 8, 3, cy, 14); a.cyl(X1 - 14, cy, Z1 - 20, Z1 - 4, 2, 6);
    a.log('Added the oval clip speaker with a ribbed grille and a carabiner loop on its shoulder (plan and 3D).');
  }
}
/** a camera or phone tripod with a ball head and a phone clamp, optionally with a ring light */
function tripod(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, sp = m.min(W, D) / 2 - 8, top = Z0 + v.legh, hz = top + v.col;
  a.circ(cx, cy, sp, 'EQUIP-DETAIL');
  for (let i = 0; i < 3; i++) { const th = (-90 + i * 120) * m.PI / 180, fx = cx + m.cos(th) * sp, fy = cy + m.sin(th) * sp; a.tube([[cx, cy, top], [fx, fy, Z0 + 2]], [v.lr, v.lr * 0.72], 8); a.cyl(fx, fy, Z0, Z0 + 4, v.lr * 1.2, 8); a.line(cx, cy, fx, fy, 'EQUIP-DETAIL'); }
  a.cyl(cx, cy, top - 6, top + 10, v.lr * 2.2, 14); a.cyl(cx, cy, top + 10, hz, v.lr * 1.2, 12); if (v.col > 50) a.cyl(cx, cy, top + 10 + v.col * 0.5, top + 10 + v.col * 0.5 + 4, v.lr * 1.8, 12);
  a.ell(cx, cy, hz + 6, 14, 14, 12, 14, 8); a.cyl(cx, cy, hz + 12, hz + 20, 12, 12);
  const pz = hz + 20; a.box(cx - 40, cy - 8, pz, cx + 40, cy + 8, pz + 8);
  a.box(cx - 42, cy - 8, pz, cx - 36, cy + 8, pz + 34); a.box(cx + 36, cy - 8, pz, cx + 42, cy + 8, pz + 34);
  a.box(cx - 35, cy - 4, pz + 8, cx + 35, cy + 4, pz + 8 + 150 * (v.ph || 1)); a.ycyl(cy - 5, cy - 4, cx, pz + 8 + 140 * (v.ph || 1), 3, 8);
  if (v.ring) { ringXZ(a, cx, pz + 90, v.ring, 8, cy + 18, 36); ringXZ(a, cx, pz + 90, v.ring * 0.9, 4, cy + 18, 36); a.tube([[cx, cy + 12, pz + 20], [cx, cy + 18, pz + 90 - v.ring]], [4, 4], 6); }
  a.log(`Added the three legs with feet, a centre column, a ball head, and a phone clamp holding a phone${v.ring ? ', with a ring light on a support arm' : ''} (plan and 3D).`);
}
/** USB storage standing on a small foot: a capped stick, a slide stick, a portable SSD or a card reader */
function usbstore(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, fz = 6;
  a.outline(); base(a, X0 - 0, YF, X1, YB, Z0, Z0 + fz); const z0 = Z0 + fz;
  if (v.kind === 'stick') {
    a.prism(rr(X0 + 2, YF + 2, X1 - 2, YB - 2, 4), z0, z0 + (Z1 - z0) * 0.55); a.box(X0 + 4, cy - D * 0.18, z0 + (Z1 - z0) * 0.55, X1 - 4, cy + D * 0.18, Z1 - 5); for (let i = 0; i < 4; i++) a.box(X0 + 6 + i * ((W - 12) / 4), YF + 0.5, Z1 - 4.4, X0 + 6 + i * ((W - 12) / 4) + 2.2, YF + 2, Z1 - 1.2);
    a.ycyl(YF, YB, cx, z0 + 8, 2.4, 10); a.box(X0 + 1, YF + 1, z0 + (Z1 - z0) * 0.52, X1 - 1, YB - 1, z0 + (Z1 - z0) * 0.57);
    a.log('Added the stick body with a cap shoulder, the exposed connector with contacts and a lanyard hole, on a small foot (plan and 3D).');
  } else if (v.kind === 'ssd') {
    plate(a, X0, z0, X1, Z1, YF + 2, YB - 2, 8); a.box(X0 + 6, YF, z0 + 6, X1 - 6, YF + 2, Z1 - 6); for (let i = 0; i < 6; i++) a.box(X0 + 12, YF - 0.6, z0 + 14 + i * 4, X1 - 12, YF + 2, z0 + 15.6 + i * 4);
    a.box(cx - 5, YF + 3, Z1 - 1, cx + 5, YB - 3, Z1); a.ycyl(YF - 0.6, YF + 2, X1 - 12, z0 + 12, 1.2, 6);
    a.log('Added the rounded slab case with a ridged face, a port on the top edge and a status LED, on a small foot (plan and 3D).');
  } else if (v.kind === 'slide') {
    a.prism(rr(X0 + 2, YF + 2, X1 - 2, YB - 2, 4), z0, Z1 - 10); a.box(X0 + 1, YF + 1, z0 + (Z1 - z0) * 0.3, X1 - 1, YB - 1, z0 + (Z1 - z0) * 0.62); a.box(X0 + 5, cy - D * 0.18, Z1 - 10, X1 - 5, cy + D * 0.18, Z1 - 1); a.ycyl(YF, YB, cx, z0 + 7, 2, 8);
    a.log('Added the sleeve body with a sliding connector shroud and a lanyard hole, on a small foot (plan and 3D).');
  } else {
    plate(a, X0, z0, X1, Z1 - 12, YF + 2, YB - 2, 5); a.box(cx - 6, cy - D * 0.25, Z1 - 12, cx + 6, cy + D * 0.25, Z1 - 1); a.box(X0 + 6, YF - 0.5, Z1 - 12 - (Z1 - z0) * 0.3, cx - 3, YF + 2, Z1 - 20); a.box(cx + 3, YF - 0.5, Z1 - 12 - (Z1 - z0) * 0.3, X1 - 6, YF + 2, Z1 - 20);
    a.log('Added the reader body with two card slots and the plug connector on top, on a small foot (plan and 3D).');
  }
}
/** a desktop multi-device charging station: base, dividers for each device and a back panel with USB ports and LEDs */
function cstation(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, n = v.n, sw = (W - 24) / n;
  a.outline(); feet(a, X0 + 20, X1 - 20, YF + 14, YB - 14, 8, 4); slab(a, X0, YF, X1, YB, Z0 + 4, Z0 + 16, 14);
  a.box(X0 + 6, YB - 30, Z0 + 16, X1 - 6, YB, Z1 - 2); a.box(X0, YB - 34, Z1 - 8, X1, YB, Z1);
  for (let i = 0; i <= n; i++) a.box(X0 + 12 + i * sw - 2, YF + 24, Z0 + 16, X0 + 12 + i * sw + 2, YB - 30, Z0 + 16 + H * 0.5);
  for (let i = 0; i < n; i++) { const x = X0 + 12 + (i + 0.5) * sw; a.box(x - 7, YB - 31, Z0 + 28, x + 7, YB - 30, Z0 + 33); a.cyl(x, YB - 28, Z1 - 20, Z1 - 19, 1.6, 6); a.box(x - 7, YB - 30.8, Z0 + H * 0.55, x + 7, YB - 30, Z0 + H * 0.55 + 7); a.rect(x - sw / 2 + 4, YF + 24, x + sw / 2 - 4, YB - 30, 'EQUIP-DETAIL'); }
  a.tube([[X1 - 20, YB, Z0 + 14], [X1 - 10, YB, Z0 + 12]], [3, 3], 6);
  a.log(`Added the base with feet, ${n} device slots divided by rails, and a back panel with a USB port and an LED per slot (plan and 3D).`);
}
/** a calculator standing leaned back on a small foot: display window, optional solar strip, a key grid on the front */
function calc(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, th = 0.3, t = m.min(D * 0.22, 14), y0 = YF + 6, z0 = Z0 + 8;
  a.outline(); const i0 = a.t.length, hh = H - 14 - 0.0;
  plate(a, X0 + 2, z0, X1 - 2, Z0 + hh, y0, y0 + t, 8);
  const dz1 = Z0 + hh - 7, dz0 = dz1 - (hh - 8) * v.disp; a.box(X0 + 9, y0 - 1.2, dz0, X1 - 9, y0 + 0.3, dz1);
  if (v.solar) a.box(X1 - W * 0.38, y0 - 1, dz1 - 4, X1 - 9, y0 + 0.2, dz1);
  const kz0 = z0 + 8, kz1 = dz0 - 8, cw = (X1 - X0 - 18) / v.cols, rh = (kz1 - kz0) / v.rows;
  for (let r = 0; r < v.rows; r++) for (let c = 0; c < v.cols; c++) { const last = v.big && c === v.cols - 1; a.box(X0 + 9 + c * cw + 1.5, y0 - 2.4, kz0 + r * rh + 1.5, X0 + 9 + (c + 1) * cw - 1.5, y0 + 0.3, kz0 + (r + 1) * rh - 1.5); }
  lean(a, i0, th, y0, z0);
  a.box(X0 + W * 0.25, y0 + t, Z0 + 2, X1 - W * 0.25, YB - 2, Z0 + 16); a.box(X0 + W * 0.25, YB - 8, Z0, X1 - W * 0.25, YB - 2, Z0 + hh * 0.5);
  a.rect(X0 + 2, y0, X1 - 2, y0 + t, 'EQUIP-DETAIL');
  a.log(`Added the leaned body with a display window${v.solar ? ', a solar strip' : ''}, a grid of ${v.cols * v.rows} keys and a rear prop (plan and 3D).`);
}
/** a mini projector: rounded body, lens ring with a focus ring, vent slots, foot and optional handle */
function proj(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bz0 = Z0 + (v.foot ? 8 : 0), bz1 = Z1 - (v.handle ? 14 : 0), zc = bz0 + (bz1 - bz0) * 0.5, lx = cx + (v.off || 0) * W;
  a.outline(); a.prism(rr(X0, YF + 6, X1, YB, v.r), bz0, bz1); a.poly(rr(X0, YF, X1, YB, v.r), 'EQUIP-DETAIL');
  if (v.foot) for (const x of [X0 + W * 0.2, X1 - W * 0.2]) a.cyl(x, YB - D * 0.3, Z0, bz0, 6, 8);
  a.ycyl(YF, YF + 14, lx, zc, v.lens, 28); a.ycyl(YF + 2, YF + 12, lx, zc, v.lens * 1.18, 28); ringXZ(a, lx, zc, v.lens * 0.96, 2, YF + 1, 28); a.ell(lx, YF + 5, zc, v.lens * 0.7, 3, v.lens * 0.7, 14, 6);
  ribs(a, X1 - W * 0.34, bz0 + 8, X1 - 8, bz1 - 8, YF + 5, 5, true, 1.6, 1.5); ribs(a, X0 + 8, bz0 + 8, X0 + W * 0.25, bz1 - 8, YB - 1, 4, true, 1.6, 1.5);
  a.ycyl(YF + 5, YF + 7, X0 + 12, bz1 - 8, 2, 6);
  if (v.handle) { a.tube([[X0 + W * 0.2, cy, bz1 - 2], [X0 + W * 0.2, cy, Z1 - 3], [X1 - W * 0.2, cy, Z1 - 3], [X1 - W * 0.2, cy, bz1 - 2]], [5, 5, 5, 5], 8); }
  if (v.mirror) a.box(X0 + W * 0.3, YF + 10, bz1, X1 - W * 0.3, YF + D * 0.5, bz1 + 1);
  a.log(`Added the rounded body${v.foot ? ' on two adjustable feet' : ''} with a lens, a focus ring, vent slots and a status LED${v.handle ? ' and a carry handle' : ''} (plan and 3D).`);
}
/** a foldable phone open: book style (two panels with a hinge) or flip style (a base panel and a leaned top panel) */
function foldable(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, th = 0.22;
  if (v.flip) {
    a.outline(); slab(a, X0, YF, X1, YB, Z0, Z0 + 7, 14); a.box(X0 + 8, YF + 8, Z0 + 7, X1 - 8, YB - 8, Z0 + 7.8);
    a.box(X0 + 10, YB - 14, Z0 + 7, X1 - 10, YB - 8, Z0 + 14); const i0 = a.t.length; const hz = Z0 + 14;
    plate(a, X0, hz, X1, Z1, YB - 12, YB - 5, 14); plate(a, X0 + 5, hz + 5, X1 - 5, Z1 - 5, YB - 13, YB - 12, 8); a.box(X1 - 18, YB - 6, Z1 - 24, X1 - 8, YB - 5, Z1 - 8);
    lean(a, i0, 0.35, YB - 8, hz);
    a.cyl(X0 + 22, YB - 10, hz - 1, hz + 3, 2, 6);
    a.log('Added a flat lower panel with a keypad area, the hinge, and a leaned upper panel with a screen and a small outer window (plan and 3D).');
  } else {
    a.outline(); slab(a, X0 + W * 0.04, YF, X1 - W * 0.04, YB, Z0, Z0 + 8, 10); a.box(X0 + W * 0.04, YF, Z0 + 8, X1 - W * 0.04, YF + 6, Z0 + 22);
    const i0 = a.t.length, z0 = Z0 + 10, hz = Z1, y0 = YF + 8, t = 6, hw = (W * 0.92 - 6) / 2;
    for (const s of [-1, 1]) { const x0 = s < 0 ? cx - 3 - hw : cx + 3, x1 = s < 0 ? cx - 3 : cx + 3 + hw; plate(a, x0, z0, x1, hz, y0, y0 + t, 8); plate(a, x0 + 3, z0 + 3, x1 - 3, hz - 3, y0 - 0.8, y0 + 0.1, 4); }
    a.cyl(cx, y0 + t / 2, z0, hz, 2.5, 8); a.ycyl(y0 - 1.2, y0 - 0.2, cx, hz - 8, 2.4, 8);
    lean(a, i0, th, y0, z0);
    a.log('Added the desk cradle and two screen panels either side of a hinge, a flat inner screen with a camera hole (plan and 3D).');
  }
}
/** a USB-C hub: a flat body with a row of ports and a cable, or a vertical dock on a stand */
function usbhub(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline();
  if (v.vert) {
    base(a, X0, YF, X1, YB, Z0, Z0 + 6); plate(a, X0 + W * 0.12, Z0 + 6, X1 - W * 0.12, Z1, YF + 14, YB - 14, 12); a.box(X0 + W * 0.18, YF + 12, Z0 + 20, X1 - W * 0.18, YF + 14, Z1 - 16);
    for (let i = 0; i < v.p; i++) a.box(X0 + W * 0.22, YF + 12.6, Z0 + 24 + i * ((H - 50) / v.p), X1 - W * 0.22, YF + 14, Z0 + 24 + i * ((H - 50) / v.p) + (H - 50) / v.p - 4);
    ribs(a, X0 + W * 0.2, Z1 - 12, X1 - W * 0.2, Z1 - 4, YB - 14, 3, true, 1.2, 1); a.ycyl(YF + 13, YF + 15, cx, Z1 - 8, 2, 6);
  } else {
    plate(a, X0, Z0, X1, Z1, YF + 4, YB - (v.cable ? 18 : 4), 6); a.prism(rr(X0, YF + 4, X1, YB - 4, 5), Z0, Z1);
    const n = v.p, pw = (W - 16) / n; for (let i = 0; i < n; i++) a.box(X0 + 8 + i * pw + 1.5, YF + 0.5, Z0 + H * 0.28, X0 + 8 + (i + 1) * pw - 1.5, YF + 4, Z1 - H * 0.28);
    if (v.cable) { a.tube([[cx, YB - 4, Z0 + H * 0.5], [cx, YB + 0, Z0 + H * 0.5]], [3, 3], 6); }
    if (v.vents) ribs(a, X0 + 14, Z1 - 1, X1 - 14, Z1, YF + 10, 1, true, 1, 0);
  }
  a.log(`Added the ${v.vert ? 'vertical dock on a stand with ' + v.p + ' port slots' : 'hub body with ' + v.p + ' ports'} and status LED${v.cable ? ' and an attached cable' : ''} (plan and 3D).`);
}

const GAD = [
  fam({ cat: 'tech/gadgets', title: 'Generic digital camera',
    desc: (v) => `Digital camera with a body, a ${v.stages && v.stages.length > 1 ? 'two-stage zoom lens barrel' : 'lens barrel'} with a front ring, a grip, a shutter button, a mode dial and a rear screen${v.evf ? ', plus a viewfinder hump with a hot shoe' : ''}.`,
    vs: [['pocket compact, 3 in lens', 4.0, 1.5, 2.4, 0, { bd: 28, lr: 20, flash: 1, grip: 1, stages: [[1, 0.8]] }], ['rangefinder style, small lens', 5.5, 3.1, 3.1, 0, { bd: 40, lr: 24, evf: 1, off: -0.12, grip: 0, stages: [[1, 0.9]] }], ['mirrorless, short lens', 5.2, 3.7, 3.8, 0, { bd: 55, lr: 30, evf: 1, grip: 1, stages: [[1, 1]] }], ['mirrorless, zoom lens with hood', 5.4, 5.4, 3.9, 0, { bd: 55, lr: 31, evf: 1, grip: 1, hood: 1, stages: [[1, 0.5], [0.9, 0.5]] }], ['bridge camera, long zoom', 5.7, 6.0, 4.3, 0, { bd: 60, lr: 40, evf: 1, grip: 1, flash: 1, hood: 1, stages: [[1, 0.4], [0.88, 0.3], [0.76, 0.3]] }]],
    build: dcam }),
  fam({ cat: 'tech/gadgets', title: 'Generic portable Bluetooth speaker',
    desc: (v) => ({ bottle: 'Bottle-shaped portable speaker with grille rings, a rubber base and a top cap with three buttons.', brick: 'Portable speaker with a rounded body on feet, a grille with two driver rings and a tweeter, a carry handle and top buttons.', tower: 'Party speaker with a tall body, a woofer and tweeter ring, a light strip, a top handle and two rear wheels.', cube: 'Cube portable speaker with a rounded body, a ribbed grille and a centre driver ring.', clip: 'Oval clip speaker with a ribbed grille and a carabiner loop.' })[v.kind],
    vs: [['bottle, 3 in', 3.0, 3.0, 8.0, 0, { kind: 'bottle' }], ['brick with handle, 10 in', 10, 3.4, 4.6, 0, { kind: 'brick' }], ['party tower, 30 in', 12, 11, 30, 0, { kind: 'tower' }], ['cube, 4 in', 4, 4, 4, 0, { kind: 'cube' }], ['clip, mini oval', 3.3, 1.4, 2.5, 0, { kind: 'clip' }]],
    build: pspeaker }),
  fam({ cat: 'tech/gadgets', title: 'Generic phone tripod',
    desc: (v) => `Three-leg tripod with feet, a centre column, a ball head and a phone clamp holding a phone${v.ring ? ', with a ring light on a support arm' : ''}.`,
    vs: [['tabletop mini, 8 in', 6.2, 6.2, 11.6, 0, { legh: 90, col: 20, lr: 4, ph: 1 }], ['compact, 24 in', 14, 14, 26, 0, { legh: 280, col: 130, lr: 5, ph: 1 }], ['floor, 5 ft', 24, 24, 64, 0, { legh: 640, col: 520, lr: 8, ph: 1 }], ['floor, 5 ft with ring light', 24, 24, 68, 0, { legh: 640, col: 520, lr: 8, ph: 1, ring: 130 }]],
    build: tripod }),
  fam({ cat: 'tech/gadgets', title: 'Generic USB storage device',
    desc: (v) => ({ stick: 'USB stick with a cap shoulder, the exposed connector with contacts and a lanyard hole.', ssd: 'Portable SSD with a rounded slab case, a textured top, a port and a status LED.', slide: 'USB stick with a sliding connector shroud and a lanyard hole.', reader: 'Card reader with two card slots and the plug connector at the end.' })[v.kind],
    vs: [['flash drive, capped', 1.0, 0.6, 2.8, 0, { kind: 'stick' }], ['flash drive, slider', 1.0, 0.55, 2.6, 0, { kind: 'slide' }], ['portable SSD, 2 TB', 2.4, 1.0, 3.9, 0, { kind: 'ssd' }], ['dual card reader', 1.8, 0.8, 3.0, 0, { kind: 'reader' }]],
    build: usbstore }),
  fam({ cat: 'tech/gadgets', title: 'Generic desktop charging station',
    desc: (v) => `Desktop charging station with a base on feet, ${v.n} device slots divided by rails, and a back panel with a USB port and an LED per slot.`,
    vs: [['4 slot', 6.5, 4.6, 3.8, 0, { n: 4 }], ['6 slot', 9.4, 4.6, 3.8, 0, { n: 6 }], ['8 slot', 12.4, 4.6, 3.8, 0, { n: 8 }], ['10 slot', 15.4, 4.6, 3.8, 0, { n: 10 }]],
    build: cstation }),
  fam({ cat: 'tech/gadgets', title: 'Generic desk calculator',
    desc: (v) => `Calculator on a wedge body with a display window${v.solar ? ', a solar strip' : ''} and ${v.cols * v.rows} keys.`,
    vs: [['basic, 8 digit, solar', 4.0, 3.4, 5.6, 0, { disp: 0.14, solar: 1, cols: 4, rows: 5 }], ['12 digit, large keys', 5.6, 4.0, 7.0, 0, { disp: 0.15, solar: 1, cols: 4, rows: 6, big: 1 }], ['scientific', 3.4, 3.2, 7.0, 0, { disp: 0.2, cols: 5, rows: 8 }], ['graphing', 3.9, 3.6, 8.2, 0, { disp: 0.34, cols: 5, rows: 7 }]],
    build: calc }),
  fam({ cat: 'tech/gadgets', title: 'Generic mini projector',
    desc: (v) => `Mini projector with a rounded body${v.foot ? ' on two adjustable feet' : ''}, a lens with a focus ring, vent slots and a status LED${v.handle ? ', and a carry handle' : ''}.`,
    vs: [['pocket, 4 in', 4, 4, 1.2, 0, { r: 12, lens: 12, off: 0.15 }], ['cube, 6 in', 6, 6, 4.4, 0, { r: 14, lens: 16, off: -0.1, foot: 1 }], ['portable with handle', 8.5, 7.5, 3.8, 0, { r: 16, lens: 24, off: -0.2, foot: 1, handle: 1 }], ['short throw, 12 in', 12, 11, 4.6, 0, { r: 18, lens: 26, off: 0.1, foot: 1, mirror: 1 }]],
    build: proj }),
  fam({ cat: 'tech/gadgets', title: 'Generic foldable phone',
    desc: (v) => v.flip ? 'Clamshell phone half open: a flat lower panel with a keypad area, a hinge and a leaned upper panel with a screen and a small outer window.' : 'Folding phone opened like a book on a desk cradle: two screen panels either side of a hinge and a camera hole.',
    vs: [['book style, 7.6 in', 5.6, 3.2, 6.2, 0, {}], ['book style, 8 in large', 6.0, 3.3, 6.6, 0, {}], ['flip style, 6.7 in', 2.9, 5.4, 4.2, 0, { flip: 1 }]],
    build: foldable }),
  fam({ cat: 'tech/gadgets', title: 'Generic USB-C hub',
    desc: (v) => `${v.vert ? 'Vertical dock on a stand' : 'Hub body'} with ${v.p} ports and a status LED${v.cable ? ' and an attached cable' : ''}.`,
    vs: [['4 port, with cable', 3.4, 1.4, 0.55, 0, { p: 4, cable: 1 }], ['7 in 1, with cable', 4.4, 1.7, 0.6, 0, { p: 7, cable: 1 }], ['11 port dock, horizontal', 9, 3.2, 1.6, 0, { p: 11, vents: 1 }], ['vertical dock, 5 slot', 3.4, 3.4, 6.6, 0, { p: 5, vert: 1 }]],
    build: usbhub }),
];

// ================================================================================================ AUDIO
/** a keyboard instrument: a body on feet, white and black keys by count, a sloped control panel with display, knobs and buttons, pitch wheels */
function piano(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, hb = H * 0.56, cd = D * v.cd, ew = v.ew, kw = (W - 2 * ew) / v.whites, kb = YB - cd;
  a.outline(); feet(a, X0 + 30, X1 - 30, YF + 20, YB - 20, 12, 8);
  a.prism(rr(X0, YF, X1, kb + 4, 6), Z0 + 8, Z0 + hb); a.poly(rr(X0, YF, X1, YB, 6), 'EQUIP-DETAIL');
  for (const x0 of [X0, X1 - ew]) a.box(x0, YF, Z0 + 8, x0 + ew, YB, Z0 + hb + 12);
  const zs = (y) => Z0 + hb + 8 + (Z1 - Z0 - hb - 8) * m.max(0, (y - kb) / cd);
  prismX(a, [[kb, Z0 + 8], [YB, Z0 + 8], [YB, Z1], [kb, Z0 + hb + 8]], X0 + ew, X1 - ew);
  for (let i = 0; i < v.whites; i++) a.box(X0 + ew + i * kw + 0.5, YF + 3, Z0 + hb, X0 + ew + (i + 1) * kw - 0.5, kb, Z0 + hb + 9);
  for (let i = 0; i < v.whites - 1; i++) if ([0, 1, 3, 4, 5].includes((i + v.s) % 7)) a.box(X0 + ew + (i + 1) * kw - kw * 0.3, kb - (kb - YF) * 0.6, Z0 + hb + 9, X0 + ew + (i + 1) * kw + kw * 0.3, kb, Z0 + hb + 16);
  a.box(X0 + ew, YF + 1, Z0 + hb - 4, X1 - ew, YF + 3, Z0 + hb + 6);
  a.rect(X0 + ew, YF + 3, X1 - ew, kb, 'EQUIP-DETAIL'); a.line(X0 + ew, kb, X1 - ew, kb, 'EQUIP-DETAIL');
  const px0 = X0 + ew + 14, px1 = X1 - ew - 14, ky = kb + cd * 0.5;
  a.box(cx - W * 0.1, ky - cd * 0.22, zs(ky - cd * 0.22), cx + W * 0.1, ky + cd * 0.2, zs(ky + cd * 0.2) + 1.8);
  const nk = v.knobs; for (let i = 0; i < nk; i++) { const x = px0 + (i + 0.5) * ((cx - W * 0.1 - 20 - px0) / nk); const y = kb + cd * 0.3; a.cyl(x, y, zs(y), zs(y) + 6, 5.5, 12); const y2 = kb + cd * 0.7; a.cyl(x, y2, zs(y2), zs(y2) + 6, 5.5, 12); }
  for (let i = 0; i < v.btn; i++) { const x = cx + W * 0.13 + i * ((px1 - cx - W * 0.13) / v.btn), y = kb + cd * 0.5; a.box(x, y - 5, zs(y - 5), x + (px1 - cx - W * 0.13) / v.btn - 4, y + 5, zs(y + 5) + 2.2); }
  for (const dx of [0, 1]) { a.box(X0 + 4 + dx * 10, YF + 4 + 6, Z0 + hb + 6, X0 + 12 + dx * 10, kb - 6, Z0 + hb + 18); }
  a.log(`Added the body on feet with end cheeks, ${v.whites} white and ${m.round(v.whites * 5 / 7)} black keys in a ${v.keys}-key layout, a sloped panel with a display, ${v.knobs * 2} knobs and ${v.btn} buttons, and two wheels (plan and 3D).`);
}
/** a guitar combo amplifier: cabinet with corners and a handle, a grille with speaker rings, a front control strip of knobs */
function gamp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bt = Z1 - 18, cz0 = bt - 60, gz0 = Z0 + 24;
  a.outline(); for (const x of [X0 + 24, X1 - 24]) for (const y of [YF + 20, YB - 20]) a.cyl(x, y, Z0, Z0 + 8, 8, 8);
  a.prism(rr(X0, YF, X1, YB, 6), Z0 + 8, bt); a.poly(rr(X0, YF, X1, YB, 6), 'EQUIP-DETAIL');
  a.box(X0 + 8, YF - 2, gz0, X1 - 8, YF + 2, cz0 - 6); ribs(a, X0 + 14, gz0 + 4, X1 - 14, cz0 - 10, YF - 3, 28, false, 0.8, 1.2);
  const sr = v.sr, rows = v.rows || 1, cols = v.spk / rows, gh = cz0 - 6 - gz0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x = X0 + W * ((c + 0.5) / cols), z = gz0 + gh * ((r + 0.5) / rows); ringXZ(a, x, z, sr, 3.5, YF - 3.5, 30); ringXZ(a, x, z, sr * 0.3, 2.5, YF - 3.5, 14); }
  a.box(X0 + 6, YF - 8, cz0, X1 - 6, YF + 2, bt - 4); for (let i = 0; i < v.k; i++) { const x = X0 + 16 + (i + 0.5) * ((W - 32) / v.k); a.ycyl(YF - 14, YF - 4, x, cz0 + 26, 8, 16); a.ycyl(YF - 14.8, YF - 14, x, cz0 + 26, 5, 12); a.box(x - 1, YF - 15.2, cz0 + 28, x + 1, YF - 14.8, cz0 + 34); }
  a.ycyl(YF - 8, YF - 4, X1 - 28, cz0 + 40, 2, 8);
  for (const x of [X0, X1 - 14]) for (const z of [Z0 + 8, bt - 14]) a.box(x, YF, z, x + 14, YF + 14, z + 14);
  a.tube([[cx - W * 0.16, cy, bt - 2], [cx - W * 0.16, cy, Z1 - 4], [cx + W * 0.16, cy, Z1 - 4], [cx + W * 0.16, cy, bt - 2]], [5, 5, 5, 5], 8);
  a.log(`Added the cabinet on four feet with corner caps, a grille with ${v.spk} speaker ring${v.spk > 1 ? 's' : ''}, a front strip with ${v.k} knobs and a jack, and a top handle (plan and 3D).`);
}
/** a DJ controller: a slab with a raised rear, two jog wheels, a mixer with faders and knobs, pad grids and an optional screen */
function djc(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bz = Z0 + H * 0.45, wr = D * 0.34, jx = W * 0.22;
  a.outline(); feet(a, X0 + 14, X1 - 14, YF + 14, YB - 14, 6, 4); const zf = wedge(a, X0, X1, YF, YB, Z0 + 4, bz - 8, bz + 14);
  a.poly(rr(X0, YF, X1, YB, 8), 'EQUIP-DETAIL');
  for (const s of [-1, 1]) { const x = cx + s * (W * 0.5 - jx), y = YF + D * 0.45; a.cyl(x, y, zf(y), zf(y) + 8, wr, 36); a.cyl(x, y, zf(y) + 8, zf(y) + 11, wr * 0.82, 36); a.cyl(x, y, zf(y) + 11, zf(y) + 14, wr * 0.2, 14); a.circ(x, y, wr); a.circ(x, y, wr * 0.82, 'EQUIP-DETAIL');
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { const xx = x - wr * 0.7 + c * (wr * 1.4 / 4), yy = YB - 26 - r * 22; a.box(xx, yy, zf(yy), xx + wr * 1.4 / 4 - 3, yy + 17, zf(yy) + 4); }
    a.box(x - wr * 0.2, YF + 8, zf(YF + 8), x + wr * 0.2, YF + 24, zf(YF + 24) + 5); }
  const mw = W - 2 * (jx + wr + 20); const ch = v.ch;
  for (let i = 0; i < ch; i++) { const x = cx - mw / 2 + (i + 0.5) * (mw / ch); a.box(x - 1.5, YF + 40, zf(YF + 40), x + 1.5, YF + 40 + D * 0.3, zf(YF + 40) + 1); const fy = YF + 40 + D * 0.12; a.box(x - 5, fy, zf(fy), x + 5, fy + 14, zf(fy) + 10); for (let k = 0; k < 3; k++) { const y = YB - 30 - k * 20; a.cyl(x, y, zf(y), zf(y) + 8, 5.5, 10); } }
  a.box(cx - 34, YF + 10, zf(YF + 10), cx + 34, YF + 16, zf(YF + 16) + 1.5); a.box(cx - 6, YF + 8, zf(YF + 8), cx + 6, YF + 18, zf(YF + 8) + 9);
  if (v.screen) { const i0 = a.t.length; plate(a, cx - mw * 0.46, bz + 16, cx + mw * 0.46, Z1 - 3, YB - 30, YB - 14, 8); plate(a, cx - mw * 0.42, bz + 22, cx + mw * 0.42, Z1 - 9, YB - 31, YB - 30, 5); lean(a, i0, 0.25, YB - 22, bz + 16); }
  a.log(`Added the slab with a raised rear, two jog wheels with pad grids, ${ch} mixer channels with faders and knobs, a crossfader${v.screen ? ' and a leaned display' : ''} (plan and 3D).`);
}
/** a leaned pad controller panel: pad grid, knob row, optional mini keys or faders, on a foot */
function padc(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, y0 = YF + 8, t = 12, z0 = Z0 + 10;
  a.outline(); const i0 = a.t.length; plate(a, X0 + 2, z0, X1 - 2, Z1 - 2, y0, y0 + t, 10);
  const px0 = X0 + 14, px1 = X1 - 14, pw = px1 - px0;
  const kz = Z1 - 18; for (let i = 0; i < v.knobs; i++) a.ycyl(y0 - 5, y0 + 0.5, px0 + (i + 0.5) * (pw / v.knobs), kz - 4, 6, 14);
  let pz0 = z0 + 12;
  if (v.keys) { const wn = 15, kw = pw / wn; for (let i = 0; i < wn; i++) a.box(px0 + i * kw + 0.5, y0 - 3, z0 + 8, px0 + (i + 1) * kw - 0.5, y0 + 0.5, z0 + 8 + 70); for (let i = 0; i < wn - 1; i++) if ([0, 1, 3, 4, 5].includes((i) % 7)) a.box(px0 + (i + 1) * kw - kw * 0.3, y0 - 5, z0 + 8 + 28, px0 + (i + 1) * kw + kw * 0.3, y0 - 3, z0 + 78); pz0 = z0 + 90; }
  const pz1 = kz - 18; const rows = v.rows, cols = v.cols, cw = pw / cols, rh = (pz1 - pz0) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { a.box(px0 + c * cw + 2, y0 - 4.5, pz0 + r * rh + 2, px0 + (c + 1) * cw - 2, y0 + 0.5, pz0 + (r + 1) * rh - 2); }
  if (v.fad) for (let i = 0; i < v.fad; i++) { const x = px0 + (i + 0.5) * (pw / v.fad); a.box(x - 1.2, y0 - 1.4, pz0 - 4, x + 1.2, y0 + 0.4, pz0 + 40); a.box(x - 5, y0 - 4, pz0 + 10, x + 5, y0 - 1.4, pz0 + 24); }
  lean(a, i0, 0.32, y0, z0); a.box(X0 + W * 0.2, y0 + t, Z0, X1 - W * 0.2, YB - 4, Z0 + 14); a.box(X0 + W * 0.2, YB - 10, Z0, X1 - W * 0.2, YB - 4, Z0 + H * 0.55);
  a.rect(X0 + 2, y0, X1 - 2, y0 + t, 'EQUIP-DETAIL');
  a.log(`Added the leaned panel on a rear prop with a ${cols} by ${rows} grid of pads${v.keys ? ', a 25-key mini keyboard' : ''}${v.fad ? ' and ' + v.fad + ' faders' : ''} and a row of ${v.knobs} knobs (plan and 3D).`);
}
/** a ceiling speaker set in a ceiling tile: flange and grille below, a back can above, mounting dogs */
function ceilsp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, r = v.dia * 25.4 / 2, tz0 = Z0 + 12, tz1 = Z0 + 27, sq = v.square;
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.box(X0, YF, tz0, X1, YB, tz1);
  if (sq) { a.prism(rr(cx - r * 1.1, cy - r * 1.1, cx + r * 1.1, cy + r * 1.1, 6), Z0, tz0); a.prism(rr(cx - r * 0.95, cy - r * 0.95, cx + r * 0.95, cy + r * 0.95, 4), Z0 - 0.0 + 1, tz0 - 1); a.rect(cx - r * 1.1, cy - r * 1.1, cx + r * 1.1, cy + r * 1.1); a.prism(rr(cx - r * 0.9, cy - r * 0.9, cx + r * 0.9, cy + r * 0.9, 6), tz1, Z1); }
  else { a.cyl(cx, cy, Z0, tz0, r * 1.12, 40); a.cyl(cx, cy, Z0 + 1, tz0 - 1, r * 0.98, 40); a.circ(cx, cy, r * 1.12); a.cyl(cx, cy, tz1, Z1, r * 0.92, 36); }
  for (let k = 1; k <= 4; k++) a.circ(cx, cy, r * 0.2 * k, 'EQUIP-DETAIL');
  a.ell(cx, cy, Z0 + 2, r * 0.22, r * 0.22, 5, 14, 6); ribs(a, cx - r * 0.8, Z0 + 1, cx + r * 0.8, Z0 + 3, 0, 0);
  for (let i = 0; i < 4; i++) { const th = (i / 4) * 2 * m.PI + 0.78; a.box(cx + m.cos(th) * r * 1.0 - 5, cy + m.sin(th) * r * 1.0 - 5, tz1, cx + m.cos(th) * r * 1.0 + 5, cy + m.sin(th) * r * 1.0 + 5, tz1 + 12); }
  a.cyl(cx + r * 0.4, cy, Z1 - 1, Z1, 1, 4);
  a.box(cx - 10, cy + r * 0.6, Z1 - 20, cx + 10, cy + r * 0.6 + 14, Z1 - 4);
  a.log(`Added the ceiling tile, a ${sq ? 'square' : 'round'} flange and grille with a tweeter dome under it, a back can above and four mounting dogs (plan and 3D).`);
}
/** a column PA speaker: a stack of driver rings in a slim body on a base plate, optionally over a subwoofer cabinet */
function colsp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bw = v.sub ? W * 0.3 : W * 0.7, bd = v.sub ? D * 0.4 : D * 0.7;
  a.outline();
  let z0 = Z0; if (v.sub) { a.prism(rr(X0, YF + 8, X1, YB, 10), Z0 + 10, Z0 + v.sub); feet(a, X0 + 20, X1 - 20, YF + 20, YB - 20, 10, 10); a.ycyl(YF, YF + 11, cx, Z0 + 10 + v.sub * 0.5, W * 0.34, 28); ringXZ(a, cx, Z0 + 10 + v.sub * 0.5, W * 0.28, 4, YF + 1, 28); a.cyl(cx, cy, Z0 + v.sub, Z0 + v.sub + 60, 20, 12); z0 = Z0 + v.sub + 60; }
  else { slab(a, cx - W * 0.45, cy - D * 0.45, cx + W * 0.45, cy + D * 0.45, Z0, Z0 + 10, 10); z0 = Z0 + 10; }
  a.prism(rr(cx - bw / 2, cy - bd / 2, cx + bw / 2, cy + bd / 2, bd * 0.3), z0, Z1); a.poly(rr(cx - bw / 2, cy - bd / 2, cx + bw / 2, cy + bd / 2, bd * 0.3), 'EQUIP-DETAIL');
  const n = v.n, gh = Z1 - z0 - 30; a.box(cx - bw * 0.42, cy - bd / 2 - 1.5, z0 + 12, cx + bw * 0.42, cy - bd / 2 + 1, Z1 - 12);
  for (let i = 0; i < n; i++) { const z = z0 + 18 + (i + 0.5) * (gh / n); a.ycyl(cy - bd / 2 - 5, cy - bd / 2 + 1, cx, z, bw * 0.3, 20); ringXZ(a, cx, z, bw * 0.24, 2.4, cy - bd / 2 - 4.5, 18); a.ycyl(cy - bd / 2 - 7, cy - bd / 2 - 5, cx, z, bw * 0.06, 8); }
  a.box(cx - bw * 0.25, cy + bd / 2, Z1 - 60, cx + bw * 0.25, cy + bd / 2 + 6, Z1 - 20); a.cyl(cx, cy, Z1 - 10, Z1, bw * 0.12, 10);
  a.log(`Added the ${v.sub ? 'subwoofer cabinet with a pole spigot, ' : 'base plate, '}a slim column body with ${n} driver rings and a rear connector panel (plan and 3D).`);
}
/** a horizontal centre-channel speaker: two woofers either side of a tweeter, a port and feet */
function centresp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, fz = 8, wz = Z0 + fz + (H - fz) / 2, wr = (H - fz) * 0.34;
  a.outline(); feet(a, X0 + W * 0.1, X1 - W * 0.1, YF + D * 0.2, YB - D * 0.2, 10, fz);
  a.prism(rr(X0, YF + 12, X1, YB, 8), Z0 + fz, Z1); a.poly(rr(X0, YF, X1, YB, 8), 'EQUIP-DETAIL'); a.box(X0 + 5, YF + 6, Z0 + fz + 4, X1 - 5, YF + 13, Z1 - 4);
  for (const s of [-1, 1]) { const x = cx + s * W * 0.3; a.ycyl(YF, YF + 13, x, wz, wr, 28); ringXZ(a, x, wz, wr * 0.8, 3, YF + 1, 24); a.ell(x, YF + 4, wz, wr * 0.3, 5, wr * 0.3, 12, 6); }
  a.ycyl(YF, YF + 13, cx, wz, wr * 0.35, 20); a.ell(cx, YF + 2, wz, wr * 0.26, 4, wr * 0.26, 12, 6);
  for (const s of [-1, 1]) { const x = cx + s * W * 0.14; a.ycyl(YF, YF + 13, x, wz, wr * 0.25, 14); }
  a.box(cx - W * 0.1, YB - 2, Z0 + fz + 10, cx + W * 0.1, YB, Z0 + fz + 40);
  a.log(`Added the cabinet on four feet, two woofers with surrounds and caps either side of a tweeter, two small ports and rear terminals (plan and 3D).`);
}
/** a retro radio: a table set with a dial window, a portable with a handle and antenna, or a boombox with twin speakers and a cassette door */
function radio(a, v) {
  const { X0, X1, YB, Z0, Z1, cx, cy, W, D, H } = a, YF = a.YF + 12;
  a.rect(a.X0, a.YF, a.X1, a.YB); const bz1 = Z1 - (v.ant || 0) - (v.handle ? 14 : 0);
  feet(a, X0 + 20, X1 - 20, YF + 16, YB - 16, 8, 6); a.prism(rr(X0, YF, X1, YB, v.r), Z0 + 6, bz1); a.poly(rr(X0, YF, X1, YB, v.r), 'EQUIP-DETAIL');
  const bh = bz1 - Z0 - 6;
  if (v.kind === 'table') {
    a.box(X0 + 14, YF - 1.5, Z0 + 6 + bh * 0.55, X1 - 14, YF + 2, bz1 - 12); for (let i = 0; i <= 24; i++) a.box(X0 + 20 + i * ((W - 40) / 24), YF - 2.4, Z0 + 6 + bh * 0.62, X0 + 20.8 + i * ((W - 40) / 24), YF - 1.5, Z0 + 6 + bh * (i % 4 ? 0.7 : 0.78)); a.box(cx - 1, YF - 3, Z0 + 6 + bh * 0.58, cx + 1, YF - 1.5, bz1 - 16);
    for (const s of [-1, 1]) a.ycyl(YF - 8, YF + 1, cx + s * W * 0.38, Z0 + 6 + bh * 0.25, 10, 18);
    ribs(a, X0 + 20, Z0 + 14, X1 - W * 0.22 - 10, Z0 + 6 + bh * 0.42, YF - 1.5, 6, true, 2.4, 1.5);
  } else {
    for (const s of (v.kind === 'port' ? [-1] : [-1, 1])) { const x = cx + s * W * (v.kind === 'port' ? 0.22 : 0.3), z = Z0 + 6 + bh * (v.kind === 'boom' ? 0.4 : 0.38), r = m.min(W * 0.16, bh * 0.34); a.ycyl(YF - 6, YF + 3, x, z, r, 28); ringXZ(a, x, z, r * 0.8, 2.6, YF - 5, 24); a.ell(x, YF - 5, z, r * 0.3, 5, r * 0.3, 12, 6); }
    const wx0 = v.kind === 'port' ? cx + W * 0.02 : cx - W * 0.16, wx1 = v.kind === 'port' ? cx + W * 0.4 : cx + W * 0.16; a.box(wx0, YF - 1.2, Z0 + 6 + bh * 0.28, wx1, YF + 2, Z0 + 6 + bh * 0.82); if (v.kind === 'boom') { a.box(cx - W * 0.12, YF - 3, Z0 + 6 + bh * 0.2, cx + W * 0.12, YF - 1.2, Z0 + 6 + bh * 0.52); a.box(cx - W * 0.12, YF - 3, Z0 + 6 + bh * 0.6, cx + W * 0.12, YF - 1.2, Z0 + 6 + bh * 0.76); } else { a.box(wx0 + 4, YF - 3, Z0 + 6 + bh * 0.52, wx1 - 4, YF - 1.2, Z0 + 6 + bh * 0.76); }
    for (let i = 0; i < 4; i++) a.box(cx - W * 0.12 + i * W * 0.065, YF - 2.5, Z0 + 6 + bh * 0.1, cx - W * 0.12 + i * W * 0.065 + W * 0.05, YF - 1.2, Z0 + 6 + bh * 0.2);
  }
  for (let i = 0; i < 2; i++) a.ycyl(YF - 9, YF + 1, cx + (i ? 1 : -1) * W * (v.kind === 'table' ? 0.38 : 0.12) * (v.kind === 'table' ? 1 : 1), bz1 - 14, 5.5, 14);
  if (v.handle) a.tube([[X0 + W * 0.2, cy, bz1 - 2], [X0 + W * 0.2, cy, Z1 - (v.ant || 0) - 2], [X1 - W * 0.2, cy, Z1 - (v.ant || 0) - 2], [X1 - W * 0.2, cy, bz1 - 2]], [5, 5, 5, 5], 8);
  if (v.ant) { a.tube([[X1 - 14, YB - 14, bz1], [X1 - 14, YB - 14, Z1 - 4], [X1 - 30, YB - 14, Z1]], [3, 2, 1.5], 8); }
  a.log(`Added the ${v.kind === 'table' ? 'rounded cabinet with a dial window and tuning ticks, a needle, two knobs and a grille' : v.kind === 'boom' ? 'body with twin speaker rings, a cassette door, a display and transport keys' : 'body with a speaker ring, a tuner window and keys'}${v.handle ? ', a handle' : ''}${v.ant ? ' and a telescopic antenna' : ''} on feet (plan and 3D).`);
}
/** a rack-mount audio unit: a front panel with ears and screws, knobs, VU meters or outlets behind a rack-width body */
function rackunit(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, fh = H - 4, ew = 22, zc = Z0 + H / 2;
  a.outline(); a.box(X0 + ew, YF + 8, Z0 + 2, X1 - ew, YB, Z1 - 2); a.box(X0, YF, Z0, X1, YF + 8, Z1);
  for (const x of [X0 + 10, X1 - 10]) for (const z of [Z0 + 12, Z1 - 12]) { a.ycyl(YF - 3, YF, x, z, 5, 10); a.box(x - 1, YF - 3.2, z - 4, x + 1, YF - 2.8, z + 4); }
  if (v.kind === 'pre') { for (let i = 0; i < 8; i++) { const x = X0 + ew + 16 + i * ((W - 2 * ew - 32) / 7); a.ycyl(YF - 14, YF, x, zc, 9, 18); a.ycyl(YF - 15, YF - 14, x, zc, 6, 14); a.box(x - 1, YF - 15.4, zc + 1, x + 1, YF - 15, zc + 7); a.ycyl(YF - 1, YF + 0.2, x, zc + 16, 1.6, 6); } a.ycyl(YF - 6, YF, X0 + ew + 8, zc, 3, 8); }
  else if (v.kind === 'comp') { for (const s of [-1, 1]) { const x = cx + s * W * 0.18; a.box(x - 36, YF - 4, zc - 28, x + 36, YF, zc + 24); a.box(x - 30, YF - 4.6, zc - 22, x + 30, YF - 4, zc + 18); a.tube([[x - 4, YF - 5, zc - 20], [x + 20, YF - 5, zc + 12]], [0.6, 0.6], 4); a.ycyl(YF - 9, YF, x - 30, zc - 38, 7, 12); a.ycyl(YF - 9, YF, x, zc - 38, 7, 12); a.ycyl(YF - 9, YF, x + 30, zc - 38, 7, 12); } for (let i = 0; i < 4; i++) a.ycyl(YF - 3, YF, cx - 24 + i * 16, zc + 34, 2, 6); }
  else { a.box(X0 + ew + 10, YF - 4, zc - 22, X0 + ew + 44, YF, zc + 22); a.box(cx - 40, YF - 3, zc - 14, cx + 40, YF, zc + 14); for (let i = 0; i < 5; i++) a.ycyl(YF - 3, YF, cx - 32 + i * 16, zc, 3, 8); a.ycyl(YF - 4, YF, X1 - ew - 24, zc, 11, 14); for (let i = 0; i < 2; i++) a.box(X1 - ew - 70 + i * 16, YF - 2, zc - 8, X1 - ew - 58 + i * 16, YF, zc + 8);
    for (const s of [-1, 1]) a.tube([[X0 + 4, YF + 14, zc + s * 14], [X0 + 4, YF - 18, zc + s * 14], [X0 + 28, YF - 18, zc + s * 14]], [4, 4, 4], 6); }
  ribs(a, X0 + ew + 4, Z1 - 6, X1 - ew - 4, Z1 - 3, YF + 14, 1, true, 1.2, 0);
  a.log(`Added the rack-width body, the front panel with ears and four rack screws and ${v.kind === 'pre' ? 'eight knobs and a headphone jack' : v.kind === 'comp' ? 'two meter windows with needles, six knobs and LED dots' : 'a power switch, a volt window, indicator lamps and a socket row, with two handles'} (plan and 3D).`);
}
/** a gaming headset on a desk stand: a base, a stem with a hook, a headband, two cups with an optional boom microphone, light rings and a dongle */
function headset(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cr = W * v.cup, hr = W / 2 - cr * 0.6, cz = Z1 - 46 - hr;
  a.cyl(cx, cy, Z0, Z0 + 12, D * 0.36, 24); a.circ(cx, cy, D * 0.36); a.cyl(cx, cy, Z0 + 12, Z1 - 24, 12, 10); a.tube([[cx, cy, Z1 - 40], [cx, cy, Z1 - 20]], [14, 22], 12); a.ell(cx, cy, Z1 - 18, 56, 28, 10, 12, 6);
  arcBand(a, cx, cz, hr, 14, cy - 11, cy + 11, 0, m.PI, 20); a.box(cx - hr * 0.3, cy - 13, Z1 - 24, cx + hr * 0.3, cy + 13, Z1 - 12);
  for (const s of [-1, 1]) { const x = cx + s * (hr + 3), ez = cz - cr * 0.95; a.xcyl(s < 0 ? x - 30 : x - 4, s < 0 ? x + 4 : x + 30, cy, ez, cr, 24); a.xcyl(s < 0 ? x + 4 : x - 14, s < 0 ? x + 18 : x - 4, cy, ez, cr * 1.04, 24); a.tube([[x + s * 2, cy, ez + cr * 0.9], [x + s * 2, cy, cz]], [5, 5, 5], 6); a.circ(x + s * 14, cy, cr, 'EQUIP-DETAIL');
    if (v.ring) { const o = s < 0 ? x - 32 : x + 30; a.ycyl(cy - cr * 0.95, cy + cr * 0.95, o, ez, 2, 6); for (let k = 0; k < 12; k++) { const th = (k / 12) * 2 * m.PI; a.box(o - 1.4, cy + m.cos(th) * cr * 0.8 - 1.4, ez + m.sin(th) * cr * 0.8 - 1.4, o + 1.4, cy + m.cos(th) * cr * 0.8 + 1.4, ez + m.sin(th) * cr * 0.8 + 1.4); } } }
  if (v.boom) { const x = cx - (hr + 3) - 30, ez = cz - cr * 0.95; a.tube([[x, cy, ez - cr * 0.4], [x - 14, cy - D * 0.2, ez - cr * 0.9], [x + 10, cy - D * 0.38, ez - cr * 1.3]], [3, 3, 3], 6); a.ell(x + 12, cy - D * 0.4, ez - cr * 1.32, 8, 12, 7, 10, 6); }
  if (v.dongle) { a.box(cx + D * 0.15, cy + 4, Z0 + 12, cx + D * 0.15 + 30, cy + 28, Z0 + 20); a.box(cx + D * 0.15 + 30, cy + 8, Z0 + 14, cx + D * 0.15 + 40, cy + 24, Z0 + 18); }
  a.log(`Added the stand base, stem and hook, a padded headband, two closed cups${v.boom ? ' with a boom microphone' : ''}${v.ring ? ', a ring of light dots on each cup' : ''}${v.dongle ? ' and a USB dongle on the base' : ''} (plan and 3D).`);
}

const AUD = [
  fam({ cat: 'tech/audio', title: 'Generic electronic keyboard',
    desc: (v) => `Keyboard instrument with a body on feet, end cheeks, ${v.whites} white keys and the black keys of a ${v.keys}-key layout, a sloped panel with a display, knobs and buttons, and two wheels.`,
    vs: [['88 key, stage', 52.4, 11.6, 5.6, 0, { keys: 88, whites: 52, s: 5, cd: 0.3, ew: 66, knobs: 6, btn: 6 }], ['76 key', 46.2, 11.2, 5.4, 0, { keys: 76, whites: 45, s: 2, cd: 0.3, ew: 66, knobs: 5, btn: 6 }], ['61 key, arranger', 38.6, 11.5, 5.8, 0, { keys: 61, whites: 36, s: 0, cd: 0.35, ew: 60, knobs: 5, btn: 8 }], ['49 key', 31.6, 9.8, 4.5, 0, { keys: 49, whites: 29, s: 0, cd: 0.32, ew: 50, knobs: 4, btn: 5 }], ['37 key, mini', 25.2, 8.5, 3.8, 0, { keys: 37, whites: 22, s: 0, cd: 0.34, ew: 46, knobs: 3, btn: 3 }]],
    build: piano }),
  fam({ cat: 'tech/audio', title: 'Generic guitar combo amplifier',
    desc: (v) => `Guitar combo amplifier on four feet with corner caps, a grille with ${v.spk} speaker ring${v.spk > 1 ? 's' : ''}, a front strip with ${v.k} knobs and a jack, and a top handle.`,
    vs: [['1 by 8 in, practice', 10.5, 8, 11.5, 0, { spk: 1, sr: 90, k: 5 }], ['1 by 10 in', 15.5, 9, 15.5, 0, { spk: 1, sr: 118, k: 6 }], ['1 by 12 in', 23, 10, 19, 0, { spk: 1, sr: 140, k: 7 }], ['2 by 12 in', 26, 10.5, 24, 0, { spk: 2, sr: 130, k: 8 }], ['4 by 10 in', 28, 11, 28, 0, { spk: 4, rows: 2, sr: 108, k: 8 }]],
    build: gamp }),
  fam({ cat: 'tech/audio', title: 'Generic DJ controller',
    desc: (v) => `DJ controller with a raised rear, two jog wheels with pad grids, ${v.ch} mixer channels with faders and knobs, a crossfader${v.screen ? ' and a leaned display' : ''}.`,
    vs: [['2 channel, compact', 20, 11.5, 3.4, 0, { ch: 2 }], ['4 channel, standard', 26, 14.5, 4.2, 0, { ch: 4 }], ['4 channel, standalone with display', 28.5, 15.2, 7.8, 0, { ch: 4, screen: 1 }]],
    build: djc }),
  fam({ cat: 'tech/audio', title: 'Generic pad controller',
    desc: (v) => `Pad controller standing leaned back on a prop: a ${v.cols} by ${v.rows} grid of pads${v.keys ? ', a 25-key mini keyboard' : ''}${v.fad ? ' and ' + v.fad + ' faders' : ''} and a row of ${v.knobs} knobs.`,
    vs: [['16 pad', 9, 5.5, 9, 0, { cols: 4, rows: 4, knobs: 4 }], ['25 key with 8 pads', 14, 6, 11.5, 0, { cols: 4, rows: 2, knobs: 8, keys: 1 }], ['32 pad with faders', 14.5, 5.5, 10.5, 0, { cols: 8, rows: 4, knobs: 8, fad: 8 }]],
    build: padc }),
  fam({ cat: 'tech/audio', title: 'Generic ceiling speaker',
    desc: (v) => `Ceiling speaker set in a ceiling tile: a ${v.square ? 'square' : 'round'} flange and grille with a tweeter dome below, a back can above the tile and four mounting dogs.`,
    vs: [['round, 4 in, in tile', 12, 12, 4.4, 0, { dia: 4 }], ['round, 6.5 in, in tile', 12, 12, 5.6, 0, { dia: 6.5 }], ['round, 8 in, in tile', 14, 14, 6.8, 0, { dia: 8 }], ['round, 10 in, in tile', 16, 16, 8, 0, { dia: 10 }], ['square, 6.5 in, in tile', 12, 12, 5.6, 0, { dia: 6.5, square: 1 }]],
    build: ceilsp }),
  fam({ cat: 'tech/audio', title: 'Generic column PA speaker',
    desc: (v) => `Column PA speaker with ${v.sub ? 'a subwoofer cabinet with a pole spigot, ' : 'a base plate, '}a slim body with ${v.n} driver rings and a rear connector panel.`,
    vs: [['3 driver, 22 in', 6, 7, 22, 0, { n: 3 }], ['4 driver, 31 in', 6, 7, 31, 0, { n: 4 }], ['6 driver, 42 in', 6.5, 7.5, 42, 0, { n: 6 }], ['8 driver over 12 in sub', 15, 17, 68, 0, { n: 8, sub: 400 }]],
    build: colsp }),
  fam({ cat: 'tech/audio', title: 'Generic centre-channel speaker',
    desc: 'Centre-channel speaker on four feet with two woofers with surrounds and caps either side of a tweeter, two small ports and rear terminals.',
    vs: [['compact, 14 in', 14, 6, 5, 0, {}], ['standard, 20 in', 20, 8, 6, 0, {}], ['large, 26 in', 26, 9.5, 7.2, 0, {}]],
    build: centresp }),
  fam({ cat: 'tech/audio', title: 'Generic retro radio',
    desc: (v) => v.kind === 'table' ? 'Table radio with a rounded cabinet on feet, a dial window with tuning ticks and a needle, a grille and two knobs.' : v.kind === 'boom' ? 'Boombox with twin speaker rings, a cassette door, a display, transport keys, a handle and a telescopic antenna.' : 'Portable radio with a speaker ring, a tuner window and keys, a carry handle and a telescopic antenna.',
    vs: [['table set', 14, 6.5, 8.2, 0, { kind: 'table', r: 40 }], ['portable, with handle', 9, 3, 7.5, 0, { kind: 'port', r: 16, handle: 1, ant: 60 }], ['boombox, twin speakers', 20, 7, 10.5, 0, { kind: 'boom', r: 18, handle: 1, ant: 80 }]],
    build: radio }),
  fam({ cat: 'tech/audio', title: 'Generic rack audio unit',
    desc: (v) => `Rack-mount unit with a rack-width body, a front panel with ears and four screws, and ${v.kind === 'pre' ? 'eight knobs and a headphone jack' : v.kind === 'comp' ? 'two meter windows with needles, six knobs and LED dots' : 'a power switch, a volt window, indicator lamps, a socket row and two handles'}.`,
    vs: [['1U, microphone preamp', 19, 9, 1.75, 0, { kind: 'pre' }], ['2U, compressor with meters', 19, 11, 3.5, 0, { kind: 'comp' }], ['3U, power conditioner', 19, 10, 5.25, 0, { kind: 'pow' }]],
    build: rackunit }),
  fam({ cat: 'tech/audio', title: 'Generic gaming headset on stand',
    desc: (v) => `Headset on a desk stand: base, stem and hook, a padded headband and two closed cups${v.boom ? ' with a boom microphone' : ''}${v.ring ? ', a ring of light dots on each cup' : ''}${v.dongle ? ' and a USB dongle on the base' : ''}.`,
    vs: [['wired, boom mic', 8.6, 7.5, 10.8, 0, { cup: 0.2, boom: 1 }], ['wireless, dongle', 8.6, 7.5, 10.8, 0, { cup: 0.2, boom: 1, dongle: 1 }], ['light-ring cups', 9, 7.5, 10.8, 0, { cup: 0.22, boom: 1, ring: 1 }], ['large cups, no mic', 9.6, 7.5, 11, 0, { cup: 0.25 }]],
    build: headset }),
];

// ================================================================================================ IOT
/** a floodlight camera: wall plate, a centre housing with a camera and a motion window, arms to lamp heads with lens rings */
function floodcam(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, zc = Z0 + H * 0.45, lr = H * 0.26;
  a.outline(); a.box(cx - W * 0.1, YB - 12, zc - 80, cx + W * 0.1, YB, zc + 60); for (const z of [zc - 60, zc + 40]) a.ycyl(YB - 14, YB - 12, cx, z, 4, 8);
  a.prism(rr(cx - W * 0.1, YF + D * 0.42, cx + W * 0.1, YB - 12, 14), zc - 66, zc + 50); a.poly(rr(cx - W * 0.1, YF + D * 0.42, cx + W * 0.1, YB - 12, 14), 'EQUIP-DETAIL');
  a.ycyl(YF + D * 0.36, YF + D * 0.45, cx, zc, W * 0.045, 20); a.ycyl(YF + D * 0.33, YF + D * 0.38, cx, zc, W * 0.025, 12); a.ycyl(YF + D * 0.4, YF + D * 0.44, cx, zc + 40, 8, 10); a.box(cx - 24, YF + D * 0.4, zc - 56, cx + 24, YF + D * 0.45, zc - 44);
  for (const s of [-1, 1]) { const x = cx + s * W * 0.38; a.tube([[cx + s * W * 0.1, YB - 30, zc - 20], [cx + s * W * 0.24, YB - 36, zc - 20], [x, YB - 50, zc]], [8, 7, 7], 8); a.ycyl(YF + 6, YB - 56, x, zc, lr, 28); a.ycyl(YF + 2, YF + 8, x, zc, lr * 0.96, 28); ringXZ(a, x, zc, lr * 0.88, 3, YF + 1, 28); a.box(x - lr * 1.1, YF, zc + lr * 0.7, x + lr * 1.1, YB - 60, zc + lr * 1.25); a.ycyl(YF + 3, YF + 8, x, zc, lr * 0.6, 20); a.circ(x, YF + (YB - 56 - YF) / 2, lr, 'EQUIP-DETAIL'); }
  if (v.top) { a.tube([[cx, YB - 40, zc + 50], [cx, YB - 50, zc + H * 0.34]], [8, 7], 8); a.ycyl(YF + D * 0.3, YB - 60, cx, zc + H * 0.34, lr * 0.8, 24); a.ycyl(YF + D * 0.26, YF + D * 0.32, cx, zc + H * 0.34, lr * 0.7, 24); }
  if (v.siren) a.box(cx - W * 0.07, YF + D * 0.46, zc + 50, cx + W * 0.07, YB - 14, zc + 62);
  a.log(`Added the wall plate, a rounded centre housing with a camera lens, a motion window and a status LED, two arms to lamp heads with lens rings and shades${v.top ? ', a third lamp on a raised arm' : ''}${v.siren ? ' and a siren grille on top' : ''} (plan and 3D).`);
}
/** a smart wall switch plate: n gangs each with a rocker, status dots, a dimmer slider variant */
function sswitch(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, n = v.gangs, gw = (W - 22) / n;
  a.outline(); plate(a, X0, Z0, X1, Z1, YB - 6, YB, 8); a.prism(rr(X0 + 4, YF + 4, X1 - 4, YB - 6, 4), Z0 + 0, Z1); 
  for (const z of [Z0 + 12, Z1 - 12]) { a.ycyl(YF + 3, YB - 6, cx, z, 4, 8); a.box(cx - 3, YF + 2.6, z - 0.7, cx + 3, YF + 3.2, z + 0.7); }
  for (let g = 0; g < n; g++) {
    const x0 = X0 + 11 + g * gw + 5, x1 = X0 + 11 + (g + 1) * gw - 5, z0 = Z0 + 26, z1 = Z1 - 26;
    a.box(x0 - 3, YF, z0 - 3, x1 + 3, YF + 5, z1 + 3);
    if (v.dim && g === n - 1) { a.box(cx - 3, YF - 1.2, z0 + 8, cx + 3, YF + 1, z1 - 8); a.box(cx - 9, YF - 5, z0 + (z1 - z0) * 0.55, cx + 9, YF - 1, z0 + (z1 - z0) * 0.55 + 12); for (let k = 0; k < 7; k++) a.cyl(x1 - 5, YF - 1, z0 + 10 + k * ((z1 - z0 - 20) / 6), z0 + 10 + k * ((z1 - z0 - 20) / 6) + 1.4, 1.4, 6); }
    else { prismX(a, [[YB - 8, z0], [YB - 8, z1], [YF - 1, z1], [YF - 5, z0 + (z1 - z0) * 0.18]], x0, x1); a.cyl((x0 + x1) / 2, YF - 1, z1 - 8, z1 - 7, 2, 6); }
    a.cyl((x0 + x1) / 2, YF + 1, Z1 - 14, Z1 - 12, 1.8, 6);
  }
  a.log(`Added the wall plate with two screws and ${v.dim ? 'a dimmer slider with a knob and level dots' + (n > 1 ? ', beside ' + (n - 1) + ' rocker' + (n > 2 ? 's' : '') : '') : n + ' tilted rocker' + (n > 1 ? 's' : '')}, each with a status dot (plan and 3D).`);
}
/** a water-leak sensor: a puck with a status LED and probe feet, a puck with a probe on a cable, or a puck on a wall bracket */
function leaks(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, r = m.min(W, D) * (v.kind === 'cable' ? 0.2 : 0.46);
  if (v.kind === 'wall') { a.outline(); a.box(cx - W * 0.2, YB - 8, Z0, cx + W * 0.2, YB, Z1); a.box(cx - 10, YB - 24, Z0 + H * 0.35, cx + 10, YB - 8, Z0 + H * 0.65); a.ycyl(YB - 48, YB - 24, cx, Z0 + H * 0.5, r, 32); a.ycyl(YB - 52, YB - 48, cx, Z0 + H * 0.5, r * 0.8, 28); a.ycyl(YB - 53, YB - 52, cx, Z0 + H * 0.5, r * 0.2, 10); a.cyl(cx, YB - 40, Z0 + H * 0.5 + r - 4, Z0 + H * 0.5 + r - 2, 2, 6);
    a.log('Added the wall plate, a bracket arm and a round sensor with a ring face and a status LED (plan and 3D).'); return; }
  a.outline(); const bz = Z0 + 4;
  if (v.kind === 'puck') { a.cyl(cx, cy, bz, Z1, r, 36); a.cyl(cx, cy, Z1 - 1.5, Z1, r * 0.8, 36); a.cyl(cx, cy + r * 0.5, Z1, Z1 + 0.01, 2, 6); for (const dx of [-1, 1]) a.cyl(cx + dx * r * 0.5, cy, Z0, bz, 2.4, 8); a.cyl(cx, cy, Z1 - 4, Z1 - 3, r * 0.2, 10); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.2, 'EQUIP-DETAIL');
    a.log('Added the round puck body with a recessed top, a status LED and two probe feet underneath (plan and 3D).'); }
  else { a.cyl(cx - W * 0.28, cy, bz, Z1 - 6, r, 28); a.cyl(cx - W * 0.28, cy, Z1 - 6, Z1, r * 0.85, 28); a.circ(cx - W * 0.28, cy, r);
    a.tube([[cx - W * 0.28 + r, cy, Z0 + H * 0.3], [cx - W * 0.1, cy, Z0 + 6], [cx + W * 0.1, cy - D * 0.15, Z0 + 4], [cx + W * 0.2, cy, Z0 + 4]], [2.4, 2.4, 2.4, 2.4], 6);
    a.box(cx + W * 0.2, cy - D * 0.16, Z0, cx + W * 0.46, cy + D * 0.16, Z0 + 6); for (const dy of [-6, 6]) a.box(cx + W * 0.22, cy + dy - 1.5, Z0 + 6, cx + W * 0.44, cy + dy + 1.5, Z0 + 7.5); a.line(cx - W * 0.28 + r, cy, cx + W * 0.2, cy, 'EQUIP-DETAIL');
    a.log('Added the round sensor with a status LED, a cable and a flat probe plate with two contact strips (plan and 3D).'); }
}
/** a robot vacuum: round or D-shaped body with a lid, bumper window, buttons, an optional lidar turret and an optional charging dock behind */
function robovac(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = v.R, ry = YB - (v.dock ? D * 0.36 : 0), rcy = v.dock ? YF + R + 2 : cy, ycf = rcy - R * 0.85;
  const poly = (k) => { const p = []; for (let i = 0; i < 40; i++) { const t = (i / 40) * 2 * m.PI; p.push([cx + R * k * m.cos(t), m.max(rcy + R * k * m.sin(t), v.dshape ? ycf : -1e9)]); } return p; };
  a.outline(); a.prism(poly(1), Z0 + 4, Z0 + H * 0.62); a.prism(poly(0.96), Z0 + H * 0.62, v.turret ? Z0 + H - v.turret : Z1); a.poly(poly(1)); a.poly(poly(0.55), 'EQUIP-DETAIL');
  for (const s of [-1, 1]) a.box(cx + s * R * 0.9 - 7, rcy - 14, Z0, cx + s * R * 0.9 + 7, rcy + 14, Z0 + 14);
  const fy = v.dshape ? ycf : rcy - R; a.box(cx - R * 0.5, fy - 0.0, Z0 + H * 0.3, cx + R * 0.5, fy + 3, Z0 + H * 0.5);
  const tz = v.turret ? Z0 + H - v.turret : Z1; if (v.turret) { a.cyl(cx, rcy + R * 0.15, tz, Z1, R * 0.3, 24); a.cyl(cx, rcy + R * 0.15, Z1 - 3, Z1, R * 0.34, 24); a.ycyl(rcy - R * 0.15, rcy + R * 0.2, cx, Z1 - v.turret * 0.5, 3, 8); a.circ(cx, rcy + R * 0.15, R * 0.3, 'EQUIP-DETAIL'); }
  a.cyl(cx, rcy - R * 0.45, tz, tz + 1.4, R * 0.1, 16); for (const s of [-1, 1]) a.cyl(cx + s * R * 0.4, rcy - R * 0.2, tz, tz + 1, 3.5, 8); ringXY(a, cx, rcy, R * 0.8, R * 0.8, 1.4, tz + 0.3, 36);
  if (v.dock) { const dy0 = ry; prismX(a, [[dy0 + 4, Z0], [YB, Z0], [YB, Z0 + 48], [dy0 + 4, Z0 + 12]], cx - W * 0.2, cx + W * 0.2); a.box(cx - W * 0.2, dy0 + 10, Z0 + 12, cx + W * 0.2, YB, Z0 + 50); a.box(cx - W * 0.16, dy0 + 6, Z0 + 28, cx + W * 0.16, dy0 + 10, Z0 + 38); for (const dx of [-1, 1]) a.box(cx + dx * 20 - 6, dy0, Z0 + 4, cx + dx * 20 + 6, dy0 + 6, Z0 + 10); a.cyl(cx, YB - 14, Z0 + 50, Z0 + 52, 4, 6); }
  a.log(`Added the ${v.dshape ? 'D-shaped' : 'round'} body with a lid ring, front bumper window, buttons, a status ring and two drive wheels${v.turret ? ', a lidar turret' : ''}${v.dock ? ' and a charging dock behind with contacts' : ''} (plan and 3D).`);
}
/** an air purifier: a cylinder with mesh bands, a tower with a mesh face and display strip, or a boxy unit with a louvre door */
function purifier(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  if (v.kind === 'cyl') {
    const r = W / 2; a.cyl(cx, cy, Z0, Z0 + 12, r * 0.92, 36); a.cyl(cx, cy, Z0 + 12, Z1 - 14, r, 40); a.circ(cx, cy, r); for (let z = Z0 + 24; z < Z1 - 40; z += 7) a.cyl(cx, cy, z, z + 2.4, r * 1.02, 40);
    a.cyl(cx, cy, Z1 - 14, Z1 - 6, r * 0.96, 36); a.cyl(cx, cy, Z1 - 6, Z1, r * 0.8, 30); a.circ(cx, cy, r * 0.8, 'EQUIP-DETAIL'); a.cyl(cx, cy, Z1 - 7, Z1 - 5, r * 0.5, 24); a.ycyl(YF - 0, YF + 3, cx, Z1 - 30, 3, 8); a.log('Added the cylinder body on a base ring with horizontal intake bands, a top outlet ring with a centre cap and a display dot (plan and 3D).');
  } else if (v.kind === 'tower') {
    a.outline(); a.prism(rr(X0, YF, X1, YB, W * 0.22), Z0 + 8, Z1); a.cyl(cx, cy, Z0, Z0 + 8, W * 0.38, 28); a.poly(rr(X0, YF, X1, YB, W * 0.22), 'EQUIP-DETAIL');
    a.box(X0 + 10, YF - 2, Z0 + H * 0.12, X1 - 10, YF + 2, Z1 - H * 0.2); ribs(a, X0 + 14, Z0 + H * 0.14, X1 - 14, Z1 - H * 0.22, YF - 3.5, 22, false, 1.4, 2);
    a.box(cx - W * 0.28, YF - 3, Z1 - H * 0.16, cx + W * 0.28, YF + 1, Z1 - H * 0.08); for (let i = 0; i < 4; i++) a.ycyl(YF - 4.5, YF - 3, cx - W * 0.18 + i * W * 0.12, Z1 - H * 0.12, 2, 6); ribs(a, X0 + 14, Z1 - 1.5, X1 - 14, Z1, YF + 10, 1, true, 1, 0);
    a.log('Added the rounded tower on a base ring with a vertical mesh intake face, a display strip with four touch dots and a vented top (plan and 3D).');
  } else {
    a.outline(); feet(a, X0 + 24, X1 - 24, YF + 20, YB - 20, 10, 8); a.prism(rr(X0, YF, X1, YB, 12), Z0 + 8, Z1); a.poly(rr(X0, YF, X1, YB, 12), 'EQUIP-DETAIL');
    a.box(X0 + 12, YF - 3, Z0 + 20, X1 - 12, YF + 2, Z1 - 40); for (let i = 0; i < 8; i++) a.box(X0 + 18, YF - 5.5, Z0 + 26 + i * ((H - 100) / 8), X1 - 18, YF - 3, Z0 + 26 + i * ((H - 100) / 8) + 6);
    a.box(X0 + 12, YF - 3, Z1 - 34, X1 - 12, YF + 2, Z1 - 10); a.box(cx - W * 0.18, YF - 4.5, Z1 - 28, cx + W * 0.18, YF - 3, Z1 - 16); for (let i = 0; i < 3; i++) a.ycyl(YF - 5, YF - 3, cx + W * 0.28 + (i - 1) * 14, Z1 - 22, 4, 8);
    a.tube([[X0 + 30, YB, Z1 - 12], [X0 + 30, YB - 14, Z1 - 12], [X1 - 30, YB - 14, Z1 - 12], [X1 - 30, YB, Z1 - 12]], [5, 5, 5, 5], 8);
    a.log('Added the boxy unit on four feet with a louvre intake door, a display panel with a dial and keys, and a carry handle (plan and 3D).');
  }
}
/** a weather station: a pole with an anemometer, a wind vane, a rain gauge, a solar panel and a radiation shield, or an ultrasonic sensor head */
function wstation(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.cyl(cx, cy, Z0, Z0 + 14, W * 0.3, 20); a.circ(cx, cy, W * 0.3); a.cyl(cx, cy, Z0 + 14, Z1 - 60, 14, 12);
  if (v.kind === 'sonic') { a.cyl(cx, cy, Z1 - 110, Z1 - 60, 40, 28); a.cyl(cx, cy, Z1 - 60, Z1 - 20, 30, 28); for (let i = 0; i < 4; i++) { const th = (i / 4) * 2 * m.PI + 0.78; a.tube([[cx + m.cos(th) * 28, cy + m.sin(th) * 28, Z1 - 60], [cx + m.cos(th) * 70, cy + m.sin(th) * 70, Z1 - 20]], [4, 4], 8); a.cyl(cx + m.cos(th) * 70, cy + m.sin(th) * 70, Z1 - 20, Z1 - 10, 8, 10); } a.ell(cx, cy, Z1 - 20, 30, 30, 10, 14, 6);
    for (let k = 0; k < 4; k++) a.cyl(cx, cy, Z1 - 106 + k * 12, Z1 - 100 + k * 12, 42, 28); a.log('Added the base plate, a pole, a sensor body with louvre rings and four ultrasonic sensor posts on a top cap (plan and 3D).'); return; }
  const sz = Z0 + H * 0.52; if (v.shield) { for (let k = 0; k < 6; k++) { a.cone(cx, cy, sz + k * 12, sz + k * 12 + 9, 44, 54, 28); a.cyl(cx, cy, sz + k * 12 + 9, sz + k * 12 + 12, 30, 20); } a.cone(cx, cy, sz + 72, sz + 82, 56, 20, 28); }
  const az = Z1 - 36; a.cyl(cx, cy, Z1 - 60, az, 12, 12); a.cyl(cx, cy, az, az + 22, 14, 14);
  for (let i = 0; i < 3; i++) { const th = (i / 3) * 2 * m.PI; a.tube([[cx, cy, az + 14], [cx + m.cos(th) * 70, cy + m.sin(th) * 70, az + 14]], [3, 3], 6); a.cone(cx + m.cos(th) * 84, cy + m.sin(th) * 84, az + 4, az + 30, 14, 20, 12); }
  const vz = az + 62; a.tube([[cx, cy, az + 22], [cx, cy, vz + 24]], [4, 3], 6); a.tube([[cx - 60, cy, vz], [cx + 50, cy, vz]], [3, 3], 6); a.box(cx - 90, cy - 1.5, vz - 20, cx - 56, cy + 1.5, vz + 20); a.cone(cx + 50, cy, vz - 8, vz + 8, 1, 7, 8);
  if (v.rain) { const rz = Z0 + H * 0.3; a.tube([[cx, cy, rz + 16], [cx + 80, cy, rz + 16]], [5, 5], 8); a.cyl(cx + 100, cy, rz - 20, rz + 20, 24, 24); a.cone(cx + 100, cy, rz + 20, rz + 50, 24, 34, 24); a.circ(cx + 100, cy, 34, 'EQUIP-DETAIL'); }
  if (v.solar) { const i0 = a.t.length; plate(a, cx - 70, Z0 + H * 0.64, cx - 10, Z0 + H * 0.64 + 60, cy + 20, cy + 26, 3); lean(a, i0, 0.5, cy + 22, Z0 + H * 0.64); a.tube([[cx - 40, cy + 20, Z0 + H * 0.64], [cx - 12, cy + 4, Z0 + H * 0.64 - 10]], [2, 2], 6); }
  a.log(`Added the base plate and pole, a three-cup anemometer, a wind vane with a tail fin${v.rain ? ', a rain gauge funnel on a side arm' : ''}${v.shield ? ', a stack of louvre plates as a radiation shield' : ''}${v.solar ? ' and a leaned solar panel' : ''} (plan and 3D).`);
}
/** a pet feeder: a base with a bowl and control panel, a tall hopper with a lid, optional camera dome and a second bowl */
function feeder(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bh = H * 0.26, hw = W * 0.7, hy0 = cy - D * 0.1;
  a.outline(); a.prism(rr(X0, YF, X1, YB, 24), Z0, Z0 + bh); a.poly(rr(X0, YF, X1, YB, 24), 'EQUIP-DETAIL');
  a.prism(rr(cx - hw / 2, YB - D * 0.62, cx + hw / 2, YB - 6, 14), Z0 + bh, Z1 - 24); a.prism(rr(cx - hw / 2 + 4, YB - D * 0.62 + 4, cx + hw / 2 - 4, YB - 10, 12), Z1 - 24, Z1 - 12); a.cyl(cx, YB - D * 0.3, Z1 - 12, Z1 - 4, hw * 0.3, 20); a.ell(cx, YB - D * 0.3, Z1 - 4, hw * 0.25, hw * 0.25, 8, 14, 6);
  a.box(cx - hw * 0.4, YB - D * 0.62 - 1, Z0 + bh + 20, cx + hw * 0.4, YB - D * 0.62 + 1, Z1 - 40); a.rect(cx - hw / 2, YB - D * 0.62, cx + hw / 2, YB - 6, 'EQUIP-DETAIL');
  for (let b = 0; b < v.bowls; b++) { const bx = cx + (v.bowls === 1 ? 0 : (b ? 1 : -1) * W * 0.24); a.cone(bx, YF + D * 0.18, Z0 + bh, Z0 + bh + 32, W * 0.2, W * 0.26, 28); a.cyl(bx, YF + D * 0.18, Z0 + bh, Z0 + bh + 3, W * 0.2, 28); a.circ(bx, YF + D * 0.18, W * 0.2, 'EQUIP-DETAIL'); }
  a.box(cx - W * 0.2, YF - 0, Z0 + bh * 0.4, cx + W * 0.2, YF + 2, Z0 + bh * 0.8); for (let i = 0; i < 3; i++) a.ycyl(YF - 3, YF, cx - W * 0.1 + i * W * 0.1, Z0 + bh * 0.6, 4, 8);
  if (v.cam) { a.ycyl(YB - D * 0.62 - 8, YB - D * 0.62 + 2, cx, Z1 - 70, 14, 20); a.ell(cx, YB - D * 0.62 - 6, Z1 - 70, 10, 6, 10, 10, 6); }
  a.log(`Added the base with ${v.bowls} dish bowl${v.bowls > 1 ? 's' : ''} and a control panel with three buttons, a tall hopper with a viewing strip and a domed lid${v.cam ? ', and a camera dome' : ''} (plan and 3D).`);
}
/** a smart scale standing on its edge against a wall strip: a rounded glass platform with electrodes, a display window and feet */
function sscale(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, y0 = YB - 40, t = 28;
  a.outline(); a.box(cx - 70, YB - 12, Z0, cx + 70, YB, Z0 + H * 0.6); for (const x of [-1, 1]) a.box(cx + x * W * 0.3 - 18, YB - 60, Z0, cx + x * W * 0.3 + 18, YB - 36, Z0 + 12);
  const i0 = a.t.length, sw = W * 0.82, x0 = cx - sw / 2, x1 = cx + sw / 2, z0 = Z0 + 8, z1 = Z1 - 8;
  if (v.round) { a.ycyl(y0, y0 + t, cx, (z0 + z1) / 2, (z1 - z0) / 2, 40); a.ycyl(y0 - 2, y0, cx, (z0 + z1) / 2, (z1 - z0) / 2 - 8, 40); } else { plate(a, x0, z0, x1, z1, y0, y0 + t, v.r); plate(a, x0 + 6, z0 + 6, x1 - 6, z1 - 6, y0 - 2, y0, v.r * 0.6); }
  const ex = (x1 - x0) * 0.26, ez = (z1 - z0) * 0.24; for (const sx of [-1, 1]) for (const sz of [-1, 1]) a.box(cx + sx * ex - 14, y0 - 3.2, (z0 + z1) / 2 + sz * ez - 10, cx + sx * ex + 14, y0 - 2, (z0 + z1) / 2 + sz * ez + 10);
  a.box(cx - sw * 0.2, y0 - 3, z1 - (z1 - z0) * 0.2, cx + sw * 0.2, y0 - 2, z1 - (z1 - z0) * 0.08); for (let i = 0; i < 4; i++) a.ycyl(y0 - 3.6, y0 - 2, cx - sw * 0.12 + i * sw * 0.08, z1 - (z1 - z0) * 0.14, 1.6, 6);
  lean(a, i0, 0.1, y0, Z0 + 8);
  a.log(`Added the wall post, two feet and a ${v.round ? 'round' : 'rounded'} glass platform standing on its edge and leaned against it, with four electrode pads and a display window (plan and 3D).`);
}
/** a baby monitor: a camera head on a desk stand, a wall-mount camera arm, or a camera and a leaned parent unit */
function babymon(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  const head = (hx, hy, hz, r) => { a.ell(hx, hy, hz, r, r * 0.9, r, 20, 12); a.ycyl(hy - r * 1.1, hy - r * 0.5, hx, hz, r * 0.55, 20); a.ycyl(hy - r * 1.14, hy - r * 1.05, hx, hz, r * 0.3, 14); for (let i = 0; i < 8; i++) { const th = (i / 8) * 2 * m.PI; a.ycyl(hy - r * 1.05, hy - r * 0.9, hx + m.cos(th) * r * 0.78, hz + m.sin(th) * r * 0.78, 2.4, 6); } };
  a.outline();
  if (v.kind === 'wall') { a.box(cx - 40, YB - 8, Z0 + H * 0.2, cx + 40, YB, Z1 - 4); a.tube([[cx, YB - 8, Z0 + H * 0.5], [cx, YB - D * 0.4, Z0 + H * 0.5], [cx, YF + D * 0.45, Z0 + H * 0.55]], [8, 8, 8], 8); a.ell(cx, YB - 30, Z0 + H * 0.5, 10, 10, 10, 10, 6); head(cx, YF + D * 0.4, Z0 + H * 0.58, H * 0.2); }
  else { a.cyl(cx - (v.kind === 'pair' ? W * 0.22 : 0), cy, Z0, Z0 + 8, D * 0.3, 28); a.cyl(cx - (v.kind === 'pair' ? W * 0.22 : 0), cy, Z0 + 8, Z0 + H * 0.42, 9, 10); head(cx - (v.kind === 'pair' ? W * 0.22 : 0), cy, Z0 + H * 0.62, H * 0.2); }
  if (v.kind === 'pair') { const i0 = a.t.length, px = cx + W * 0.26; plate(a, px - W * 0.17, Z0 + 14, px + W * 0.17, Z0 + H * 0.78, YF + D * 0.4, YF + D * 0.4 + 18, 12); plate(a, px - W * 0.14, Z0 + 20, px + W * 0.14, Z0 + H * 0.7, YF + D * 0.4 - 1, YF + D * 0.4, 6); a.tube([[px + W * 0.12, YF + D * 0.4 + 14, Z0 + H * 0.78], [px + W * 0.12, YF + D * 0.4 + 14, Z1 - 4]], [3, 2], 6); lean(a, i0, 0.28, YF + D * 0.4, Z0 + 14); a.box(px - 40, YB - 50, Z0, px + 40, YB - 30, Z0 + 14); }
  a.log(`Added the ${v.kind === 'wall' ? 'wall plate, a ball joint and a bent arm' : 'round stand and a neck'}, a spherical camera head with a lens and a ring of infrared dots${v.kind === 'pair' ? ', and a leaned parent unit with a screen and an antenna' : ''} (plan and 3D).`);
}
/** a single-board computer or microcontroller board on a display clip: pcb, chips, headers and ports */
function sbc(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, y0 = cy - 3, pw = v.pw, ph = v.ph, px0 = cx - pw / 2, pz0 = Z0 + 14;
  a.outline(); base(a, X0, YF, X1, YB, Z0, Z0 + 6); for (const sx of [-1, 1]) a.box(cx + sx * pw * 0.3 - 5, y0 - 4, Z0 + 6, cx + sx * pw * 0.3 + 5, y0 + 10, pz0 + 6);
  plate(a, px0, pz0, px0 + pw, pz0 + ph, y0, y0 + 2, 5);
  for (const sx of [0.04, 0.96]) for (const sz of [0.08, 0.92]) a.ycyl(y0 - 0.4, y0 + 2.4, px0 + pw * sx + (sx < 0.5 ? 3 : -3), pz0 + ph * sz, 1.8, 8);
  if (v.kind === 'micro') { a.box(px0 + pw * 0.05, y0 - 3, pz0 + ph * 0.3, px0 + pw * 0.3, y0 - 0.1, pz0 + ph * 0.7); a.box(px0 + pw * 0.62, y0 - 4, pz0 + ph * 0.25, px0 + pw * 0.9, y0 - 0.1, pz0 + ph * 0.75); for (let i = 0; i < 16; i++) { a.cyl(px0 + 6 + i * ((pw - 12) / 15), y0 - 1, pz0 + 2, pz0 + 6, 0.9, 6); a.cyl(px0 + 6 + i * ((pw - 12) / 15), y0 - 1, pz0 + ph - 6, pz0 + ph - 2, 0.9, 6); } a.box(px0 - 3, y0 - 5, pz0 + ph * 0.3, px0 + 6, y0 + 0.2, pz0 + ph * 0.7); a.box(px0 + pw * 0.34, y0 - 1.2, pz0 + ph * 0.34, px0 + pw * 0.58, y0, pz0 + ph * 0.66); }
  else { for (let i = 0; i < 20; i++) for (const rz of [0.93, 0.86]) a.cyl(px0 + pw * 0.2 + i * (pw * 0.62 / 19), y0 - 2.5, pz0 + ph * rz - 0.6, pz0 + ph * rz + 0.6, 0.6, 5);
    a.box(px0 + pw * 0.34, y0 - 4, pz0 + ph * 0.3, px0 + pw * 0.56, y0 - 0.1, pz0 + ph * 0.7); if (v.fan) { a.box(px0 + pw * 0.3, y0 - 9, pz0 + ph * 0.25, px0 + pw * 0.62, y0 - 4, pz0 + ph * 0.75); fan(a, px0 + pw * 0.46, pz0 + ph * 0.5, ph * 0.2, y0 - 10, y0 - 9); } else { for (let k = 0; k < 6; k++) a.box(px0 + pw * 0.34 + k * 3.2, y0 - 7, pz0 + ph * 0.28, px0 + pw * 0.34 + k * 3.2 + 1.2, y0 - 4, pz0 + ph * 0.72); }
    a.box(px0 + pw * 0.64, y0 - 3, pz0 + ph * 0.3, px0 + pw * 0.74, y0 - 0.1, pz0 + ph * 0.6);
    if (!v.zero) { for (const k of [0.1, 0.42]) { a.box(px0 + pw * 0.9, y0 - 12, pz0 + ph * k, px0 + pw + 3, y0 - 0.1, pz0 + ph * (k + 0.28)); } a.box(px0 + pw * 0.9, y0 - 12, pz0 + ph * 0.7, px0 + pw + 3, y0 - 0.1, pz0 + ph * 0.9 - 2); a.box(px0 + pw * 0.06, y0 - 6, pz0 + ph * 0.02, px0 + pw * 0.2, y0 - 0.1, pz0 + ph * 0.18); a.box(px0 + pw * 0.34, y0 + 2, pz0 + ph * 0.0, px0 + pw * 0.54, y0 + 3.6, pz0 + ph * 0.14); }
    else { for (const k of [0.15, 0.55]) a.box(px0 + pw * 0.88, y0 - 3, pz0 + ph * k, px0 + pw + 2, y0 - 0.1, pz0 + ph * (k + 0.26)); } }
  a.rect(px0, y0 - 0.5, px0 + pw, y0 + 2, 'EQUIP-DETAIL');
  a.log(`Added the display base with two clips holding a ${v.kind === 'micro' ? 'microcontroller board with a USB socket, a radio module with an antenna trace and pin headers on both long edges' : 'single-board computer with a 40-pin header, a main chip with a ' + (v.fan ? 'fan and heatsink' : 'finned heatsink') + (v.zero ? ' and two small ports' : ', a card slot, stacked USB ports and a network port')}, and four mounting holes (plan and 3D).`);
}
/** a LoRa gateway: a box with antennas, cable glands, mounting ears or pole clamps and status LEDs */
function lora(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bz0 = Z0 + (v.pole ? 0 : 6), bz1 = Z0 + v.bh;
  a.outline(); if (!v.pole && !v.mast) feet(a, X0 + 20, X1 - 20, YF + 14, YB - 14, 7, 6);
  a.prism(rr(X0 + W * 0.04, YF, X1 - W * 0.04, YB, 8), bz0, bz1); a.poly(rr(X0 + W * 0.04, YF, X1 - W * 0.04, YB, 8), 'EQUIP-DETAIL'); a.box(X0 + W * 0.04 + 6, YF - 0.5, bz0 + 6, X1 - W * 0.04 - 6, YF + 2, bz1 - 6);
  for (let i = 0; i < 4; i++) a.ycyl(YF - 2, YF + 1, cx - W * 0.14 + i * W * 0.1, bz1 - 14, 3, 8);
  for (let i = 0; i < v.ant; i++) { const x = cx + (i - (v.ant - 1) / 2) * W * 0.28; a.cyl(x, YB - 24, bz1, bz1 + 8, 7, 10); a.cyl(x, YB - 24, bz1 + 8, Z1 - 3, 4.5, 12); a.ell(x, YB - 24, Z1 - 3, 4.5, 4.5, 3, 10, 6); }
  for (let i = 0; i < 3; i++) a.cyl(cx - W * 0.2 + i * W * 0.2, YB - 30, bz0 - 8, bz0, 6, 10);
  if (v.pole) { a.xcyl(X0, X1, YB + 0, 0, 0, 3); for (const z of [bz0 + 20, bz1 - 20]) a.box(X0 + W * 0.1, YB - 4, z - 7, X1 - W * 0.1, YB, z + 7); }
  if (v.mast) { a.box(X0, YB - 10, bz0 + 10, X1, YB, bz1 - 10); for (const z of [bz0 + 20, bz1 - 20]) for (const x of [X0 + 8, X1 - 8]) a.ycyl(YB - 16, YB - 10, x, z, 5, 8); }
  a.log(`Added the rounded enclosure with a labelled window and four LEDs, ${v.ant} antenna${v.ant > 1 ? 's' : ''} on top, three cable glands underneath${v.pole ? ' and two clamp bands at the back' : v.mast ? ' and mounting plates at the back' : ' and feet'} (plan and 3D).`);
}

const IOT = [
  fam({ cat: 'tech/iot', title: 'Generic floodlight camera',
    desc: (v) => `Floodlight camera with a wall plate, a rounded housing with a camera lens and a motion window, two arms to lamp heads with lens rings and shades${v.top ? ', a third lamp on a raised arm' : ''}${v.siren ? ' and a siren grille' : ''}.`,
    vs: [['two lamp, wall mount', 14, 6.5, 6, 0, {}], ['two lamp with siren', 14, 6.5, 6.4, 0, { siren: 1 }], ['three lamp, wide', 17, 7, 9, 0, { top: 1 }]],
    build: floodcam }),
  fam({ cat: 'tech/iot', title: 'Generic smart light switch',
    desc: (v) => `Smart wall switch plate with two screws and ${v.dim ? 'a dimmer slider with a knob and level dots' : v.gangs + ' tilted rocker' + (v.gangs > 1 ? 's' : '')} with a status dot.`,
    vs: [['1 gang, rocker', 2.9, 1.1, 4.7, 0, { gangs: 1 }], ['2 gang, rockers', 4.7, 1.1, 4.7, 0, { gangs: 2 }], ['3 gang, rockers', 6.5, 1.1, 4.7, 0, { gangs: 3 }], ['dimmer, slider', 2.9, 1.2, 4.7, 0, { gangs: 1, dim: 1 }]],
    build: sswitch }),
  fam({ cat: 'tech/iot', title: 'Generic water leak sensor',
    desc: (v) => ({ puck: 'Round puck leak sensor with a recessed top, a status LED and two probe feet underneath.', cable: 'Leak sensor with a round body, a status LED, a cable and a flat probe plate with two contact strips.', wall: 'Wall-mounted leak sensor: a wall plate, a bracket arm and a round sensor with a ring face and a status LED.' })[v.kind],
    vs: [['puck, 2.2 in', 2.2, 2.2, 0.9, 0, { kind: 'puck' }], ['with cable probe', 8, 2.6, 1.1, 0, { kind: 'cable' }], ['on wall bracket', 2.8, 2.2, 3.2, 0, { kind: 'wall' }]],
    build: leaks }),
  fam({ cat: 'tech/iot', title: 'Generic robot vacuum',
    desc: (v) => `Robot vacuum with a ${v.dshape ? 'D-shaped' : 'round'} body, a lid ring, a front bumper window, buttons, a status ring and two drive wheels${v.turret ? ', a lidar turret' : ''}${v.dock ? ' and a charging dock behind it with contacts' : ''}.`,
    vs: [['round, 13 in', 13.4, 13.4, 3.4, 0, { R: 166 }], ['round with lidar turret', 13.8, 13.8, 4.0, 0, { R: 172, turret: 25 }], ['D-shaped, 13 in', 13.4, 13.4, 3.6, 0, { R: 166, dshape: 1 }], ['round with charging dock', 13.4, 21.5, 3.4, 0, { R: 166, dock: 1 }]],
    build: robovac }),
  fam({ cat: 'tech/iot', title: 'Generic air purifier',
    desc: (v) => ({ cyl: 'Cylindrical air purifier on a base ring with intake bands, a top outlet ring with a centre cap and a display dot.', tower: 'Tower air purifier on a base ring with a vertical mesh intake face, a display strip with four touch dots and a vented top.', box: 'Boxy air purifier on four feet with a louvre intake door, a display panel with a dial and keys, and a carry handle.' })[v.kind],
    vs: [['desktop cylinder, 14 in', 7, 7, 14, 0, { kind: 'cyl' }], ['floor cylinder, 26 in', 10, 10, 26, 0, { kind: 'cyl' }], ['tower, 28 in', 8.5, 8.5, 28, 0, { kind: 'tower' }], ['boxy room unit, 24 in', 20, 9, 24, 0, { kind: 'box' }]],
    build: purifier }),
  fam({ cat: 'tech/iot', title: 'Generic weather station',
    desc: (v) => v.kind === 'sonic' ? 'Weather station with a base plate and pole, a sensor body with louvre rings and four ultrasonic posts on a top cap.' : `Weather station with a base plate and pole, a three-cup anemometer, a wind vane with a tail fin${v.rain ? ', a rain gauge funnel on a side arm' : ''}${v.shield ? ', a stack of louvre plates as a radiation shield' : ''}${v.solar ? ' and a leaned solar panel' : ''}.`,
    vs: [['wind and rain, 28 in', 12, 12, 28, 0, { rain: 1, solar: 1 }], ['full array with shield, 42 in', 14, 14, 42, 0, { rain: 1, shield: 1, solar: 1 }], ['ultrasonic, 19 in', 8, 8, 19, 0, { kind: 'sonic' }]],
    build: wstation }),
  fam({ cat: 'tech/iot', title: 'Generic smart pet feeder',
    desc: (v) => `Pet feeder with a base with ${v.bowls} dish bowl${v.bowls > 1 ? 's' : ''} and a control panel with three buttons, a tall hopper with a viewing strip and a domed lid${v.cam ? ', and a camera dome' : ''}.`,
    vs: [['single bowl, 4 L hopper', 9, 11, 17, 0, { bowls: 1 }], ['dual bowl, 6 L hopper', 15, 11, 19, 0, { bowls: 2 }], ['single bowl with camera', 9.5, 11, 20, 0, { bowls: 1, cam: 1 }]],
    build: feeder }),
  fam({ cat: 'tech/iot', title: 'Generic smart bathroom scale',
    desc: (v) => `Smart scale shown on its edge, leaned against a wall post: a ${v.round ? 'round' : 'rounded'} glass platform with four electrode pads, a display window and rounded edges.`,
    vs: [['square, 11.8 in', 12.4, 3, 13, 0, { r: 30 }], ['wide, 13.8 in', 14.6, 3, 12.4, 0, { r: 36 }], ['round, 12 in', 12.4, 3, 13, 0, { round: 1 }]],
    build: sscale }),
  fam({ cat: 'tech/iot', title: 'Generic baby monitor camera',
    desc: (v) => `Baby monitor camera with ${v.kind === 'wall' ? 'a wall plate, a ball joint and a bent arm' : 'a round stand and a neck'}, a spherical head with a lens and a ring of infrared dots${v.kind === 'pair' ? ', and a leaned parent unit with a screen and an antenna' : ''}.`,
    vs: [['on desk stand', 4.2, 4.2, 6.5, 0, { kind: 'stand' }], ['wall mount, bent arm', 3.4, 6.5, 5.2, 0, { kind: 'wall' }], ['with parent unit', 9, 5, 7, 0, { kind: 'pair' }]],
    build: babymon }),
  fam({ cat: 'tech/iot', title: 'Generic single-board computer',
    desc: (v) => `Display base with two clips holding a ${v.kind === 'micro' ? 'microcontroller board with a USB socket, a radio module with an antenna trace and pin headers on both long edges' : 'single-board computer with a 40-pin header, a main chip with a ' + (v.fan ? 'fan and heatsink' : 'finned heatsink') + (v.zero ? ' and two small ports' : ', a card slot, stacked USB ports and a network port')}, and four mounting holes.`,
    vs: [['credit-card size, 3.4 by 2.2 in', 4.1, 2, 3.4, 0, { pw: 86, ph: 56 }], ['mini, 2.6 by 1.2 in', 3.2, 2, 2.4, 0, { pw: 66, ph: 31, zero: 1 }], ['with fan and heatsink', 4.1, 2.2, 3.6, 0, { pw: 86, ph: 56, fan: 1 }], ['microcontroller with radio', 3.0, 2, 2.3, 0, { pw: 58, ph: 28, kind: 'micro' }]],
    build: sbc }),
  fam({ cat: 'tech/iot', title: 'Generic LoRa gateway',
    desc: (v) => `LoRa gateway with a rounded enclosure with a labelled window and four LEDs, ${v.ant} antenna${v.ant > 1 ? 's' : ''} on top, three cable glands underneath${v.pole ? ' and two clamp bands at the back' : v.mast ? ' and mounting plates at the back' : ' and feet'}.`,
    vs: [['desktop, two antennas', 6.5, 4.2, 6.2, 0, { ant: 2, bh: 55 }], ['outdoor box, 10 in', 10, 4.6, 12.6, 0, { ant: 1, bh: 200, mast: 1 }], ['pole mount with clamps', 8, 4.4, 11, 0, { ant: 2, bh: 160, pole: 1 }]],
    build: lora }),
];

// ================================================================================================ WEARABLES
/** a flat band in the X-Y plane following an ellipse, between z0 and z1 */
function bandXY(a, cx, cy, rx, ry, t, z0, z1, n = 28) {
  for (let i = 0; i < n; i++) { const p = (k, f) => { const th = (k / n) * 2 * m.PI; return [cx + (rx + f) * m.cos(th), cy + (ry + f) * m.sin(th)]; }; a.prism([p(i, 0), p(i + 1, 0), p(i + 1, t), p(i, t)], z0, z1); }
}
/** a headlamp on a plain head form on a stand: a head, a strap round it, an optional top strap, a lamp unit with a lens, and a rear battery or a hard hat */
function headlamp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, hz = Z0 + H * 0.6, rx = W * 0.3, ry = D * 0.36, rz = H * 0.3;
  a.cyl(cx, cy, Z0, Z0 + 10, D * 0.3, 28); a.circ(cx, cy, D * 0.3); a.cyl(cx, cy, Z0 + 10, hz - rz * 0.7, 16, 14);
  a.ell(cx, cy, hz, rx, ry, rz, 24, 14); a.circ(cx, cy, ry, 'EQUIP-DETAIL');
  const sz = hz + rz * 0.35, f = m.sqrt(1 - 0.35 * 0.35), ex = rx * f, ey = ry * f;
  if (v.hat) { a.ell(cx, cy, hz + rz * 0.1, rx * 1.12, ry * 1.12, rz * 1.0, 24, 12); a.ell(cx, cy - ry * 0.4, hz + rz * 0.12, rx * 1.2, ry * 1.5, 6, 22, 6); a.box(cx - 3, cy - ry * 1.12, hz + rz * 0.35, cx + 3, cy + ry * 1.0, hz + rz * 0.42); }
  else { bandXY(a, cx, cy, ex * 1.02, ey * 1.02, 6, sz - 12, sz + 12); if (v.top) a.tube([[cx, cy - ey * 1.04, sz + 4], [cx, cy - ey * 0.2, hz + rz * 1.03], [cx, cy + ey * 1.04, sz + 4]], [6, 6, 6], 8); }
  const lz = v.hat ? hz + rz * 0.35 : sz, ly = cy - (v.hat ? ry * 1.14 : ey * 1.07);
  a.prism(rr(cx - W * 0.14, ly - 26, cx + W * 0.14, ly + 2, 6), lz - 20, lz + 20); a.ycyl(ly - 32, ly - 24, cx, lz, 15, 24); ringXZ(a, cx, lz, 16, 2.4, ly - 31, 20); a.ycyl(ly - 33, ly - 31, cx, lz, 6, 10);
  for (const s of [-1, 1]) a.ycyl(ly - 28, ly - 24, cx + s * W * 0.1, lz, 3.2, 8);
  if (v.pack) { a.prism(rr(cx - W * 0.12, cy + ey * 1.0, cx + W * 0.12, cy + ey * 1.0 + 24, 5), sz - 22, sz + 18); a.cyl(cx + W * 0.06, cy + ey * 1.0 + 26, sz - 4, sz + 2, 4, 8); }
  a.rect(cx - W * 0.14, ly - 26, cx + W * 0.14, ly + 2); 
  a.log(`Added the stand, a plain head form with ${v.hat ? 'a hard hat' : 'a headband strap' + (v.top ? ' and a top strap' : '')}, a lamp unit with a lens ring and three LEDs${v.pack ? ' and a rear battery pack' : ''} (plan and 3D).`);
}
/** a chest-strap heart-rate monitor on a torso form: a band round the chest, a pod with snaps and optional electrode pads and a buckle */
function chestband(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, tz = Z0 + H * 0.45, rx = W * 0.4, ry = D * 0.34;
  a.cyl(cx, cy, Z0, Z0 + 10, D * 0.4, 28); a.circ(cx, cy, D * 0.4); a.cyl(cx, cy, Z0 + 10, Z0 + H * 0.2, 20, 14);
  a.ell(cx, cy, tz + H * 0.02, rx * 0.9, ry, H * 0.4, 28, 14); a.cyl(cx, cy, tz + H * 0.36, Z1 - 6, W * 0.09, 14); a.ell(cx, cy, Z1 - 14, W * 0.11, ry * 0.5, 14, 12, 6);
  const f = 1; bandXY(a, cx, cy, rx * 1.03, ry * 1.03, 5, tz - v.bh / 2, tz + v.bh / 2, 32);
  const fy = cy - ry * 1.03 - 5; a.prism(rr(cx - v.pw / 2, fy - 16, cx + v.pw / 2, fy + 8, 8), tz - 22, tz + 22); a.box(cx - v.pw * 0.35, fy - 18, tz - 12, cx + v.pw * 0.35, fy - 16, tz + 12); for (const s of [-1, 1]) a.ycyl(fy - 19, fy - 16, cx + s * v.pw * 0.28, tz, 3.4, 10);
  if (v.pads) for (const s of [-1, 1]) a.prism(rr(cx + s * (v.pw * 0.5 + 40) - 22, fy - 2, cx + s * (v.pw * 0.5 + 40) + 22, fy + 5, 4), tz - 18, tz + 18);
  if (v.buckle) a.box(cx + rx * 1.03 - 10, cy - 12, tz - 12, cx + rx * 1.03 + 14, cy + 12, tz + 12);
  a.log(`Added the stand, a plain torso form, an elastic chest band, a pod with two snaps${v.pads ? ' and two electrode pads on the band' : ''}${v.buckle ? ' and a buckle' : ''} (plan and 3D).`);
}
/** sport earbuds on a display base with a charging case: ear hook, wing tip or clip-on open-ear pods */
function earhook(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline(); base(a, X0, YF, X1, YB, Z0, Z0 + 6);
  const ccx = cx, cyb = YB - D * 0.3, cw = W * 0.46, ch = H * 0.42; a.prism(rr(ccx - cw / 2, cyb - D * 0.2, ccx + cw / 2, cyb + D * 0.2, 14), Z0 + 6, Z0 + 6 + ch * 0.62); a.prism(rr(ccx - cw / 2, cyb - D * 0.2, ccx + cw / 2, cyb + D * 0.2, 14), Z0 + 6 + ch * 0.62 + 2, Z0 + 6 + ch); a.box(ccx - cw * 0.3, cyb - D * 0.2 - 1, Z0 + 6 + ch * 0.2, ccx + cw * 0.3, cyb - D * 0.2, Z0 + 6 + ch * 0.4); a.ycyl(cyb - D * 0.2 - 1, cyb - D * 0.2, ccx, Z0 + 6 + ch * 0.3, 2.4, 8);
  for (const s of [-1, 1]) {
    const bx = cx + s * W * 0.2, by = YF + D * 0.3, bz = Z0 + 6 + 16;
    a.ell(bx, by, bz, 13, 12, 12, 14, 8);
    const arc = (r, t0, t1, ox, oz, n = 10) => { const pts = []; for (let k = 0; k <= n; k++) { const th = t0 + (t1 - t0) * (k / n); pts.push([ox + s * (r + r * m.cos(th)), by, oz + r * m.sin(th)]); } return pts; };
    if (v.kind === 'hook') { const pts = arc(22, m.PI, 0, bx, bz + 12); a.tube(pts, pts.map(() => 3.4), 8); a.ell(bx + s * 44, by, bz + 8, 7, 6, 9, 10, 6); }
    else if (v.kind === 'wing') { ringXZ(a, bx + s * 14, bz + 24, 13, 2.2, by, 16); const pts = arc(12, m.PI, m.PI * 0.2, bx, bz + 12, 8); a.tube(pts, pts.map(() => 3), 8); a.ell(bx, by - 2, bz, 8, 7, 8, 10, 6); }
    else { const pts = arc(17, m.PI, 0, bx, bz + 12); a.tube(pts, pts.map(() => 3), 8); a.ell(bx + s * 34, by, bz + 6, 9, 8, 12, 10, 6); }
    a.ycyl(by - 11, by - 6, bx, bz, 3.4, 8);
  }
  a.log(`Added the display base, a rounded charging case with a lit window, and a pair of buds on stems with ${v.kind === 'hook' ? 'ear hooks' : v.kind === 'wing' ? 'ring wing tips' : 'clip-on arms'} (plan and 3D).`);
}
/** a pair of VR controllers hung on pegs: a grip, a tracking ring or sphere, a thumbstick, buttons and a trigger */
function vrpads(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline(); base(a, X0, YF, X1, YB, Z0, Z0 + 8); a.box(cx - 8, YB - 24, Z0 + 8, cx + 8, YB - 8, Z0 + H * 0.4);
  for (const s of [-1, 1]) {
    const x = cx + s * W * 0.25, y = cy, z0 = Z0 + 14; a.tube([[x, y + 14, z0], [x, y, z0 + H * 0.38], [x, y - 8, z0 + H * 0.5]], [16, 18, 20], 14); a.tube([[x, y - 18, z0 + H * 0.28], [x, y - 26, z0 + H * 0.36]], [5, 5], 6);
    a.cyl(x, y, z0 - 6, z0, 20, 12);
    a.ycyl(y - 26, y - 14, x, z0 + H * 0.46, 8, 14);
    if (v.kind === 'ring') { ringXZ(a, x, z0 + H * 0.8, H * 0.26, 6, y - 8, 28); a.tube([[x, y - 8, z0 + H * 0.5], [x, y - 8, z0 + H * 0.56]], [10, 10], 8); for (let i = 0; i < 12; i++) { const th = (i / 12) * 2 * m.PI; a.ycyl(y - 14, y - 6, x + m.cos(th) * H * 0.26, z0 + H * 0.8 + m.sin(th) * H * 0.26, 2, 6); } }
    else if (v.kind === 'wand') { a.tube([[x, y - 8, z0 + H * 0.5], [x, y - 8, z0 + H * 0.72]], [14, 12], 10); a.ell(x, y - 8, z0 + H * 0.8, H * 0.12, H * 0.12, H * 0.12, 16, 10); for (let i = 0; i < 6; i++) { const th = (i / 6) * 2 * m.PI; a.ycyl(y - 8 - H * 0.12, y - 8 - H * 0.12 + 2, x + m.cos(th) * H * 0.07, z0 + H * 0.8 + m.sin(th) * H * 0.07, 2.4, 6); } }
    else { ringXZ(a, x, z0 + H * 0.74, H * 0.2, 7, y, 24); a.tube([[x, y, z0 + H * 0.5], [x, y, z0 + H * 0.55]], [10, 10], 8); a.ell(x + s * H * 0.2, y, z0 + H * 0.74, 7, 7, 7, 8, 6); }
  }
  a.log(`Added the stand base with a rear peg, and two controllers with a grip, a thumbstick, a trigger and ${v.kind === 'ring' ? 'a tracking ring with sensor dots' : v.kind === 'wand' ? 'a lit sphere head with sensor dots' : 'a flat tracking ring'} (plan and 3D).`);
}
/** a watch charging dock: a stand with a watch hung on it by its strap loop */
function wdock(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline(); base(a, X0, YF, X1, YB, Z0, Z0 + 10); const n = v.n || 1;
  for (let i = 0; i < n; i++) {
    const x = n === 1 ? cx : cx + (i ? 1 : -1) * W * 0.24, R = v.R, pz = Z0 + 10 + v.post;
    a.box(x - 20, cy - 8, Z0 + 10, x + 20, cy + 8, pz + 10); a.xcyl(x - 22, x + 22, cy, pz + 6, 8, 12);
    loopYZ(a, x - 12, x + 12, cy, pz + R * 0.6, R * 0.5, R, 3, 20);
    const fy = cy - R * 0.5 - 3; a.prism(rr(x - 22, fy - 12, x + 22, fy + 2, 7), pz + R * 0.6 - 24, pz + R * 0.6 + 24); a.ycyl(fy - 14, fy - 12, x, pz + R * 0.6, 17, 24); a.ycyl(fy - 14.4, fy - 14, x, pz + R * 0.6, 14, 24); a.box(x + 22, fy - 6, pz + R * 0.6 + 4, x + 25.5, fy - 1, pz + R * 0.6 + 12);
  }
  if (v.clock) { a.box(cx - W * 0.28, YB - 22, Z0 + 10, cx + W * 0.28, YB - 6, Z0 + H * 0.5); a.ycyl(YB - 24, YB - 22, cx, Z0 + H * 0.5 - 4, W * 0.1, 18); }
  a.log(`Added the stand base${v.clock ? ', a back column with a small light disc' : ''}, ${n > 1 ? 'two' : 'a'} cradle post${n > 1 ? 's' : ''} and ${n > 1 ? 'two watches' : 'a watch'} hung by the strap loop with a round face and a crown (plan and 3D).`);
}
/** a cycling computer on an out-front mount: a handlebar section, a clamp and arm, and a leaned computer with a screen and side buttons */
function bikecomp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, by = YB - 22, bz = Z0 + 14;
  a.outline(); a.xcyl(X0 + 4, X1 - 4, by, bz, 14, 16); a.xcyl(X0 + 4, X0 + W * 0.18, by, bz, 18, 16); a.xcyl(X1 - W * 0.18, X1 - 4, by, bz, 18, 16);
  a.box(cx - 24, by - 22, bz - 16, cx + 24, by + 22, bz + 16); a.box(cx - 8, by - 30, bz - 6, cx + 8, by - 22, bz + 6);
  a.tube([[cx, by - 22, bz], [cx, YF + D * 0.4, bz + 6]], [8, 8], 8); a.box(cx - 12, YF + D * 0.32, bz - 4, cx + 12, YF + D * 0.5, bz + 14);
  const i0 = a.t.length, y0 = YF + D * 0.36, z0 = bz + 14, cw = v.cw, ch = v.ch;
  plate(a, cx - cw / 2, z0, cx + cw / 2, z0 + ch, y0, y0 + 14, 8); plate(a, cx - cw / 2 + 4, z0 + 5, cx + cw / 2 - 4, z0 + ch - 5, y0 - 1.2, y0 + 0.1, 4);
  for (const s of [-1, 1]) for (let k = 0; k < (v.btn || 2); k++) a.box(s < 0 ? cx - cw / 2 - 2 : cx + cw / 2, y0 + 3, z0 + ch * (0.2 + k * 0.28), s < 0 ? cx - cw / 2 : cx + cw / 2 + 2, y0 + 10, z0 + ch * (0.2 + k * 0.28) + 12);
  if (v.light) { a.box(cx - cw * 0.3, y0 + 1, z0 + ch, cx + cw * 0.3, y0 + 13, z0 + ch + 10); a.ycyl(y0 - 1, y0 + 2, cx, z0 + ch + 5, 3, 8); }
  lean(a, i0, 0.12, y0, z0);
  a.log(`Added the handlebar section with a clamp, an out-front arm and a leaned computer with a framed screen and ${(v.btn || 2) * 2} side buttons${v.light ? ' and a top-mounted light' : ''} (plan and 3D).`);
}
/** a smart bike helmet on a stand: a lofted shell with vents, an optional visor, chin straps and a buckle, front and rear lights */
function bikehelmet(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, rx = W * 0.46, ry = D * 0.45, z0 = Z0 + H * 0.4, h = H * 0.56;
  a.cyl(cx, cy, Z0, Z0 + 10, D * 0.3, 28); a.cyl(cx, cy, Z0 + 10, z0, 14, 12); a.circ(cx, cy, ry, 'EQUIP-DETAIL'); a.circ(cx, cy, D * 0.3);
  dome(a, cx, cy, z0, rx, ry, h, 12, 0); a.cyl(cx, cy, z0 - 3, z0, 0.1, 3); a.ell(cx, cy, z0, rx, ry, 8, 24, 5);
  for (let i = -2; i <= 2; i++) { const x = cx + i * rx * 0.3, zt = z0 + h * m.sqrt(m.max(0, 1 - (i * 0.3) ** 2)) * 0.88; a.box(x - 5, cy - ry * 0.5, zt - 4, x + 5, cy + ry * 0.35, zt + 1.5); }
  if (v.visor) { a.box(cx - rx * 0.8, cy - ry * 1.02, z0 + h * 0.42, cx + rx * 0.8, cy - ry * 0.55, z0 + h * 0.48); a.box(cx - rx * 0.8, cy - ry * 1.02, z0 + h * 0.4, cx - rx * 0.78, cy - ry * 0.55, z0 + h * 0.5); }
  a.box(cx - rx * 0.4, cy - ry * 0.96, z0 + h * 0.18, cx + rx * 0.4, cy - ry * 0.9, z0 + h * 0.26); a.box(cx - 12, cy + ry * 0.9, z0 + h * 0.12, cx + 12, cy + ry * 1.0, z0 + h * 0.3); a.ycyl(cy + ry * 0.98, cy + ry * 1.0, cx, z0 + h * 0.2, 4, 8);
  for (const s of [-1, 1]) { a.tube([[cx + s * rx * 0.9, cy, z0 + 4], [cx + s * rx * 0.7, cy, z0 - H * 0.12], [cx + s * rx * 0.28, cy - ry * 0.1, Z0 + H * 0.2]], [3, 3, 3], 6); a.box(cx + s * rx * 0.22 - 8, cy - ry * 0.16, Z0 + H * 0.12, cx + s * rx * 0.22 + 8, cy - ry * 0.06, Z0 + H * 0.26); }
  a.log(`Added the stand, a lofted shell with five vent bars${v.visor ? ', a peak visor' : ''}, a front light bar, a rear light, and chin straps with buckle halves (plan and 3D).`);
}
/** a retro digital watch: a rounded case with an LCD or keys on a front face, side buttons and a strap loop on a display roll */
function digiwatch(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = D * 0.44, rz = Z0 + 4 + R, ry = YB - R - 6, cw = W * 0.82;
  a.outline(); a.xcyl(cx - cw * 0.55, cx + cw * 0.55, ry, rz, R - 4, 24); base(a, X0, YF, X1, YB, Z0, Z0 + 4);
  loopYZ(a, cx - cw * 0.3, cx + cw * 0.3, ry, rz, R, R, 3.2, 28);
  const fy = ry - R - 3.2, fh = v.ch; a.prism(rr(cx - cw / 2, fy - 8, cx + cw / 2, fy + 2, 7), rz - fh / 2, rz + fh / 2); a.poly(rr(cx - cw / 2, fy - 8, cx + cw / 2, fy + 2, 7), 'EQUIP-DETAIL');
  if (v.kind === 'calc') { const x0 = cx - cw * 0.4, x1 = cx + cw * 0.4; a.box(x0, fy - 9, rz + fh * 0.18, x1, fy - 8, rz + fh * 0.42); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) a.box(x0 + c * (x1 - x0) / 4 + 0.6, fy - 9.6, rz - fh * 0.42 + r * (fh * 0.5 / 4) + 0.5, x0 + (c + 1) * (x1 - x0) / 4 - 0.6, fy - 8, rz - fh * 0.42 + (r + 1) * (fh * 0.5 / 4) - 0.5); }
  else { a.box(cx - cw * 0.38, fy - 9, rz - fh * 0.18, cx + cw * 0.38, fy - 8, rz + fh * 0.3); a.box(cx - cw * 0.36, fy - 9.5, rz - fh * 0.12, cx - cw * 0.04, fy - 9, rz + fh * 0.12); for (const s of [-1, 1]) a.ycyl(fy - 9.4, fy - 8, cx + s * cw * 0.2, rz + fh * 0.36, 1.6, 8);
    if (v.kind === 'chrono') { ringXZ(a, cx, rz, fh * 0.46, 1.8, fy - 8.6, 32); for (const dx of [-1, 1]) ringXZ(a, cx + dx * cw * 0.2, rz - fh * 0.05, fh * 0.12, 1, fy - 9.6, 14); } }
  for (const s of [-1, 1]) for (const dz of [-1, 1]) a.box(s < 0 ? cx - cw / 2 - 2.5 : cx + cw / 2, fy - 4, rz + dz * fh * 0.26 - 3, s < 0 ? cx - cw / 2 : cx + cw / 2 + 2.5, fy, rz + dz * fh * 0.26 + 3);
  a.log(`Added the display roll and base, a strap loop, a rounded case with ${v.kind === 'calc' ? 'a display window and a 4 by 4 key grid' : v.kind === 'chrono' ? 'an LCD window, a bezel ring with two sub-dial circles' : 'an LCD window'} and four side buttons (plan and 3D).`);
}
/** goggles on a stand: a frame with a lens, foam rim, a strap loop behind, and optional vent holes or a display pod */
function goggles(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, fw = W * 0.9, fh = H * 0.82, zc = Z0 + 14 + (H - 14) * 0.5, fy = YF + 4, sy = YF + D * 0.58;
  a.outline(); a.cyl(cx, sy, Z0, Z0 + 8, D * 0.28, 28); a.circ(cx, sy, D * 0.28); a.cyl(cx, sy, Z0 + 8, zc - fh * 0.3, 8, 10); a.tube([[cx, sy, zc - fh * 0.3], [cx, YF + 36, zc - fh * 0.32]], [8, 7], 8);
  plate(a, cx - fw / 2, zc - fh / 2, cx + fw / 2, zc + fh / 2, fy, fy + 26, v.r); plate(a, cx - fw / 2 + 8, zc - fh / 2 + 8, cx + fw / 2 - 8, zc + fh / 2 - 8, fy - 3, fy, v.r * 0.7);
  a.frame(cx - fw / 2 + 4, zc - fh / 2 + 4, cx + fw / 2 - 4, zc + fh / 2 - 4, fy + 26, fy + 38, 10); a.box(cx - 20, fy, zc - fh * 0.5, cx + 20, fy + 26, zc - fh * 0.2);
  if (v.vents) for (let i = 0; i < 4; i++) for (const s of [-1, 1]) a.ycyl(fy - 3, fy, cx + s * (fw * 0.44 - i * 0), zc + (i - 1.5) * fh * 0.16, 2.2, 8);
  if (v.pod) { a.box(cx + fw * 0.3, fy - 8, zc + fh * 0.12, cx + fw * 0.46, fy - 3, zc + fh * 0.4); a.ycyl(fy - 10, fy - 8, cx + fw * 0.38, zc + fh * 0.26, 4, 10); }
  bandXY(a, cx, sy, fw * 0.5, D * 0.3, 5, zc - 20, zc + 20, 28); a.box(cx + fw * 0.5 - 8, sy - 10, zc - 10, cx + fw * 0.5 + 12, sy + 10, zc + 10);
  a.log(`Added the stand, a frame with a front lens, a foam rim, a nose notch, a head strap loop behind with a buckle${v.vents ? ' and four vent holes each side' : ''}${v.pod ? ' and a small display pod on the lens' : ''} (plan and 3D).`);
}
/** electronic earmuffs on a desk stand: a headband, two thick cups with foam rings, and a mic boom, a radio antenna or nothing */
function earmuffs(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cr = W * 0.24, hr = W / 2 - cr * 0.6, cz = Z1 - 46 - hr;
  a.cyl(cx, cy, Z0, Z0 + 12, D * 0.36, 24); a.circ(cx, cy, D * 0.36); a.cyl(cx, cy, Z0 + 12, Z1 - 24, 12, 10); a.tube([[cx, cy, Z1 - 40], [cx, cy, Z1 - 20]], [14, 22], 12); a.ell(cx, cy, Z1 - 18, 56, 28, 10, 12, 6);
  arcBand(a, cx, cz, hr, 14, cy - 12, cy + 12, 0, m.PI, 20); a.box(cx - hr * 0.3, cy - 14, Z1 - 24, cx + hr * 0.3, cy + 14, Z1 - 12);
  for (const s of [-1, 1]) { const x = cx + s * (hr + 3), ez = cz - cr * 1.0; a.xcyl(s < 0 ? x - 44 : x - 4, s < 0 ? x + 4 : x + 44, cy, ez, cr, 28); a.xcyl(s < 0 ? x + 4 : x - 20, s < 0 ? x + 20 : x - 4, cy, ez, cr * 1.1, 28); ringXZ(a, x + s * 18, ez, cr * 0.7, 3, cy, 24); a.tube([[x + s * 2, cy, ez + cr * 0.9], [x + s * 2, cy, cz]], [6, 6, 6], 6); a.circ(x + s * 14, cy, cr, 'EQUIP-DETAIL'); }
  const ez = cz - cr, lx = cx - (hr + 3);
  if (v.boom) { a.tube([[lx - 44, cy, ez], [lx - 52, cy - D * 0.25, ez - cr * 0.6], [lx - 30, cy - D * 0.4, ez - cr * 1.0]], [3, 3, 3], 6); a.ell(lx - 28, cy - D * 0.42, ez - cr * 1.02, 8, 12, 7, 10, 6); }
  if (v.radio) { const rx0 = cx + hr + 3 + 44; a.tube([[rx0 - 6, cy + cr * 0.4, ez + cr * 0.5], [rx0 - 6, cy + cr * 0.4, ez + cr * 1.5]], [3, 2], 6); a.ycyl(cy - cr, cy - cr + 6, cx + hr + 3 + 30, ez - cr * 0.2, 7, 12); a.ycyl(cy - cr, cy - cr + 6, cx + hr + 3 + 30, ez + cr * 0.4, 5, 10); }
  a.log(`Added the stand base, stem and hook, a padded headband and two thick cups with foam rings and sound-through grilles${v.boom ? ', a boom microphone' : ''}${v.radio ? ', a radio antenna and two knobs' : ''} (plan and 3D).`);
}
/** a phone armband on an arm form: a band round the arm, a window pocket with a phone inside and an optional key pocket */
function armband(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, ar = D * 0.34, bz = Z0 + H * 0.5, pw = v.pw, ph = v.ph, py = cy - ar - 4;
  a.cyl(cx, cy, Z0, Z0 + 10, D * 0.4, 28); a.circ(cx, cy, D * 0.4); a.cyl(cx, cy, Z0 + 10, Z1 - 4, ar, 30); a.cyl(cx, cy, Z1 - 4, Z1, ar * 0.8, 26);
  bandXY(a, cx, cy, ar + 1, ar + 1, 5, bz - v.bw / 2, bz + v.bw / 2, 30); a.box(cx + ar - 2, cy + 6, bz - v.bw * 0.4, cx + ar + 12, cy + 34, bz + v.bw * 0.4);
  a.prism(rr(cx - pw / 2 - 8, py - 14, cx + pw / 2 + 8, py + 6, 10), bz - ph / 2 - 8, bz + ph / 2 + 8); a.box(cx - pw / 2, py - 15, bz - ph / 2, cx + pw / 2, py - 14, bz + ph / 2); a.box(cx - pw / 2 + 6, py - 16.5, bz - ph / 2 + 6, cx + pw / 2 - 6, py - 15, bz + ph / 2 - 6);
  if (v.key) { a.prism(rr(cx + pw / 2 + 8, py - 10, cx + pw / 2 + 8 + 34, py + 4, 6), bz - 30, bz + 10); a.box(cx + pw / 2 + 8 + 6, py - 11, bz - 10, cx + pw / 2 + 8 + 28, py - 10, bz - 8); }
  a.ycyl(py - 18, py - 14, cx, bz + ph / 2 - 2, 3, 8);
  a.log(`Added the arm form on a base, an elastic band with a hook-and-loop tail, a window pocket with a phone inside${v.key ? ' and a small key pocket' : ''} (plan and 3D).`);
}
/** a VR base station: a cube housing with a front window and side vents on a desk stand, a wall arm or a tall pole */
function vrbase(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cs = v.cs;
  let zc = Z1 - cs / 2 - 4, i0;
  a.outline();
  if (v.kind === 'wall') { a.box(cx - 40, YB - 8, Z0 + H * 0.2, cx + 40, YB, Z1 - 4); a.tube([[cx, YB - 8, zc], [cx, YB - 28, zc]], [8, 8], 8); a.ell(cx, YB - 30, zc, 12, 12, 12, 10, 6); }
  else if (v.kind === 'pole') { a.cyl(cx, cy, Z0, Z0 + 20, D * 0.42, 30); a.circ(cx, cy, D * 0.42); a.cyl(cx, cy, Z0 + 20, zc - cs * 0.4, 12, 10); }
  else { a.cyl(cx, cy, Z0, Z0 + 8, D * 0.4, 28); a.circ(cx, cy, D * 0.4); a.cyl(cx, cy, Z0 + 8, zc - cs * 0.4, 14, 10); a.ell(cx, cy, zc - cs * 0.42, 22, 22, 12, 10, 6); }
  i0 = a.t.length; const y0 = v.kind === 'wall' ? YB - 30 - cs * 0.85 : cy - cs * 0.42;
  a.prism(rr(cx - cs / 2, y0, cx + cs / 2, y0 + cs * 0.84, 10), zc - cs / 2, zc + cs / 2); a.poly(rr(cx - cs / 2, y0, cx + cs / 2, y0 + cs * 0.84, 10), 'EQUIP-DETAIL');
  a.box(cx - cs * 0.4, y0 - 1.5, zc - cs * 0.28, cx + cs * 0.4, y0 + 1, zc + cs * 0.3); a.ycyl(y0 - 2.6, y0 - 1.5, cx - cs * 0.28, zc + cs * 0.38, 2.2, 8); ribs(a, cx - cs * 0.4, zc - cs * 0.46, cx + cs * 0.4, zc - cs * 0.36, y0 - 1.2, 3, true, 1.4, 1.2);
  lean(a, i0, v.tilt || 0, y0 + cs * 0.4, zc);
  a.log(`Added the ${v.kind === 'wall' ? 'wall plate and ball-joint arm' : v.kind === 'pole' ? 'weighted base and a tall pole' : 'stand base, a post and a ball joint'}, a rounded cube housing with a dark front window, an indicator and vent slots (plan and 3D).`);
}

const WEAR = [
  fam({ cat: 'tech/wearables', title: 'Generic headlamp',
    desc: (v) => `Headlamp on a stand with a plain head form with ${v.hat ? 'a hard hat' : 'a headband strap' + (v.top ? ' and a top strap' : '')}, a lamp unit with a lens ring and three LEDs${v.pack ? ' and a rear battery pack' : ''}.`,
    vs: [['basic, 300 lumen', 8, 9, 13, 0, {}], ['rechargeable with top strap', 8, 9, 13, 0, { top: 1 }], ['with rear battery pack', 8, 9.5, 13, 0, { top: 1, pack: 1 }], ['clip lamp on hard hat', 9, 10, 13, 0, { hat: 1 }]],
    build: headlamp }),
  fam({ cat: 'tech/wearables', title: 'Generic chest-strap heart monitor',
    desc: (v) => `Chest-strap monitor on a plain torso form: an elastic band, a pod with two snaps${v.pads ? ' and two electrode pads on the band' : ''}${v.buckle ? ' and a buckle' : ''}.`,
    vs: [['pod on textile strap', 14, 8.5, 14, 0, { bh: 40, pw: 70 }], ['wide strap with electrode pads', 14, 8.5, 14, 0, { bh: 56, pw: 70, pads: 1 }], ['narrow strap with buckle', 11, 7, 12, 0, { bh: 28, pw: 56, buckle: 1 }]],
    build: chestband }),
  fam({ cat: 'tech/wearables', title: 'Generic sport earbuds with case',
    desc: (v) => `Display base with a rounded charging case with a lit window and a pair of buds on stems with ${v.kind === 'hook' ? 'ear hooks' : v.kind === 'wing' ? 'ring wing tips' : 'clip-on arms'}.`,
    vs: [['ear-hook style', 5.2, 3.2, 4.2, 0, { kind: 'hook' }], ['wing-tip style', 5.2, 3.2, 3.8, 0, { kind: 'wing' }], ['open-ear clip style', 5.2, 3.2, 4.2, 0, { kind: 'clip' }]],
    build: earhook }),
  fam({ cat: 'tech/wearables', title: 'Generic VR controller pair',
    desc: (v) => `Stand base with a rear peg and two controllers with a grip, a thumbstick, a trigger and ${v.kind === 'ring' ? 'a tracking ring with sensor dots' : v.kind === 'wand' ? 'a lit sphere head with sensor dots' : 'a flat tracking ring'}.`,
    vs: [['tracking ring on top', 9.5, 5, 7.6, 0, { kind: 'ring' }], ['sphere wand', 8.2, 5, 7.6, 0, { kind: 'wand' }], ['flat ring', 9.5, 5, 7.2, 0, { kind: 'flat' }]],
    build: vrpads }),
  fam({ cat: 'tech/wearables', title: 'Generic smartwatch charging stand',
    desc: (v) => `Stand base${v.clock ? ', a back column with a small light disc' : ''}, ${v.n > 1 ? 'two cradle posts and two watches' : 'a cradle post and a watch'} hung by the strap loop with a round face and a crown.`,
    vs: [['single watch', 3.2, 3.2, 3.4, 0, { R: 36, post: 30, n: 1 }], ['bedside, with light disc', 4.2, 3.4, 4.2, 0, { R: 36, post: 30, n: 1, clock: 1 }], ['dual watch', 6.4, 3.4, 3.4, 0, { R: 36, post: 30, n: 2 }]],
    build: wdock }),
  fam({ cat: 'tech/wearables', title: 'Generic cycling computer',
    desc: (v) => `Handlebar section with a clamp and an out-front arm, and a leaned computer with a framed screen and ${(v.btn || 2) * 2} side buttons${v.light ? ' and a top-mounted light' : ''}.`,
    vs: [['compact, 2.3 in', 3.2, 3.2, 3.2, 0, { cw: 42, ch: 56 }], ['standard, 2.9 in', 3.8, 3.6, 3.8, 0, { cw: 52, ch: 70 }], ['large touch screen, 3.5 in', 4.4, 3.8, 4.4, 0, { cw: 62, ch: 84, btn: 1 }], ['with front light', 3.8, 3.8, 4.6, 0, { cw: 52, ch: 70, light: 1 }]],
    build: bikecomp }),
  fam({ cat: 'tech/wearables', title: 'Generic smart bike helmet',
    desc: (v) => `Helmet on a stand: a lofted shell with five vent bars${v.visor ? ', a peak visor' : ''}, a front light bar, a rear light, and chin straps with buckle halves.`,
    vs: [['urban, rear light', 8.2, 10.8, 11.5, 0, {}], ['mountain, with visor', 8.2, 11.8, 11.8, 0, { visor: 1 }], ['kids, small', 7, 9.2, 10, 0, {}]],
    build: bikehelmet }),
  fam({ cat: 'tech/wearables', title: 'Generic retro digital watch',
    desc: (v) => `Watch on a display roll with a strap loop and a rounded case with ${v.kind === 'calc' ? 'a display window and a 4 by 4 key grid' : v.kind === 'chrono' ? 'an LCD window, a bezel ring with two sub-dial circles' : 'an LCD window'} and four side buttons.`,
    vs: [['LCD classic', 1.9, 3, 2.9, 0, { kind: 'lcd', ch: 36 }], ['calculator keys', 2.2, 3, 3.0, 0, { kind: 'calc', ch: 44 }], ['chronograph, round bezel', 2.1, 3, 3.0, 0, { kind: 'chrono', ch: 40 }]],
    build: digiwatch }),
  fam({ cat: 'tech/wearables', title: 'Generic smart goggles',
    desc: (v) => `Goggles on a stand: a frame with a front lens, a foam rim, a nose notch, a head strap loop behind with a buckle${v.vents ? ' and four vent holes each side' : ''}${v.pod ? ' and a small display pod on the lens' : ''}.`,
    vs: [['ski, large lens', 7.8, 7.4, 4.4, 0, { r: 70 }], ['safety, with vents', 6.6, 6.8, 2.9, 0, { r: 24, vents: 1 }], ['sport, with display pod', 7.2, 7, 3.6, 0, { r: 50, pod: 1 }]],
    build: goggles }),
  fam({ cat: 'tech/wearables', title: 'Generic electronic earmuffs',
    desc: (v) => `Earmuffs on a desk stand: stem and hook, a padded headband and two thick cups with foam rings and grilles${v.boom ? ', a boom microphone' : ''}${v.radio ? ', a radio antenna and two knobs' : ''}.`,
    vs: [['low profile', 8.8, 7.5, 10.8, 0, {}], ['with boom microphone', 8.8, 7.5, 10.8, 0, { boom: 1 }], ['with radio and antenna', 9.2, 7.5, 11.8, 0, { radio: 1 }]],
    build: earmuffs }),
  fam({ cat: 'tech/wearables', title: 'Generic phone armband',
    desc: (v) => `Arm form on a base with an elastic band with a hook-and-loop tail, a window pocket with a phone inside${v.key ? ' and a small key pocket' : ''}.`,
    vs: [['for 6 in phone', 6.8, 5, 12, 0, { pw: 78, ph: 154, bw: 190 }], ['for 7 in phone, key pocket', 8, 5.6, 13, 0, { pw: 88, ph: 170, bw: 210, key: 1 }], ['compact, 5 in phone', 5.8, 4.8, 10.5, 0, { pw: 68, ph: 138, bw: 170 }]],
    build: armband }),
  fam({ cat: 'tech/wearables', title: 'Generic VR base station',
    desc: (v) => `Base station with a ${v.kind === 'wall' ? 'wall plate and a ball-joint arm' : v.kind === 'pole' ? 'weighted base and a tall pole' : 'stand base, a post and a ball joint'}, a rounded cube housing with a dark front window, an indicator and vent slots.`,
    vs: [['desk stand', 4.4, 4.4, 6.2, 0, { kind: 'desk', cs: 84, tilt: 0.1 }], ['wall mount arm', 4, 6.2, 5.6, 0, { kind: 'wall', cs: 84, tilt: 0.18 }], ['floor pole, 5 ft', 8, 8, 62, 0, { kind: 'pole', cs: 90, tilt: 0.2 }]],
    build: vrbase }),
];

export default [...GAD, ...AUD, ...IOT, ...WEAR];

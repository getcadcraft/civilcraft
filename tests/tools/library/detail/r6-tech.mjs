/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, tech: consumer gadgets, audio and video, smart-home and IoT devices, wearables. Original geometry; generic size classes, no makers or models. */
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

// ------------------------------------------------------------------------------------------ gadgets
/** a flat slate on a desk cradle: phone, tablet, e-reader, smart display or tablet with a keyboard folio. Built upright then leaned back 15 degrees */
function slate(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, th = 0.26, lip = 14;
  const deck = v.folio ? D * 0.46 : 0, by = YF + deck;
  a.outline();
  if (v.folio) {
    slab(a, X0, YF, X1, by + 6, Z0, Z0 + 10, 12);
    keys(a, X0 + W * 0.04, YF + 10, X1 - W * 0.04, by - 46, 12, 4, Z0 + 10, 3.5, 1.4);
    a.box(cx - W * 0.14, by - 40, Z0 + 10, cx + W * 0.14, by - 6, Z0 + 11.2); a.rect(cx - W * 0.14, by - 40, cx + W * 0.14, by - 6, 'EQUIP-DETAIL');
  } else {
    slab(a, X0 + W * 0.05, YF, X1 - W * 0.05, YB, Z0, Z0 + 10, 16); a.box(X0 + W * 0.05, YF, Z0 + 10, X1 - W * 0.05, YF + 8, Z0 + 10 + lip);
  }
  const i0 = a.t.length, z0 = Z0 + (v.folio ? 10 : 10 + 1), sh = v.speaker ? H * 0.2 : 0, t = v.t, hh = (H - (v.folio ? 10 : 12) - (v.folio ? 0 : 0)) / (v.folio ? 1.0 : 1.12);
  const y0 = (v.folio ? by + 8 : YF + 8) + 2;
  const x0 = X0 + W * 0.05 * (v.folio ? 0 : 1), x1 = X1 - W * 0.05 * (v.folio ? 0 : 1), hz = z0 + hh;
  plate(a, x0, z0 + sh, x1, hz, y0, y0 + t, v.r);                                                       // body
  plate(a, x0 + v.bez, z0 + sh + v.bez * (v.kind === 'reader' ? 1.2 : 1), x1 - v.bez, hz - v.bez * (v.kind === 'reader' ? 1.2 : 1), y0 - 0.9, y0 + 0.1, v.r * 0.55);   // screen glass
  if (v.sp) a.box(cx - (x1 - x0) * 0.06, y0 - 1.1, hz - v.bez * 0.62 - 1, cx + (x1 - x0) * 0.06, y0 - 0.2, hz - v.bez * 0.62 + 0.6);   // speaker slit
  if (v.punch) a.ycyl(y0 - 1.2, y0 - 0.2, cx, hz - v.bez - 7, 2.6, 10);
  if (v.notch) a.box(cx - (x1 - x0) * 0.17, y0 - 1.3, hz - v.bez - 7.5, cx + (x1 - x0) * 0.17, y0 - 0.1, hz - v.bez + 0.2);
  if (v.cam) { const rz = hz - v.bez * 1.4 - 6; a.box(x0 + 10, y0 + t, rz - (v.cam > 2 ? 40 : 28), x0 + (v.cam > 2 ? 48 : 36), y0 + t + 2.4, rz + 6); for (let i = 0; i < v.cam; i++) a.ycyl(y0 + t, y0 + t + 3.8, x0 + 22 + (i % 2) * 12, rz - 6 - m.floor(i / 2) * 16 + 4, 4.6, 12); }
  if (v.btn) { a.box(x1, y0 + t * 0.3, hz - (hz - z0) * 0.3, x1 + 1.2, y0 + t * 0.7, hz - (hz - z0) * 0.3 - 18); a.box(x1, y0 + t * 0.3, hz - (hz - z0) * 0.45, x1 + 1.2, y0 + t * 0.7, hz - (hz - z0) * 0.45 - 10); a.box(x0 - 1.2, y0 + t * 0.3, hz - (hz - z0) * 0.3, x0, y0 + t * 0.7, hz - (hz - z0) * 0.3 - 10); }
  if (v.rugged) { for (const [bx0, bx1] of [[x0 - 4, x0 + 12], [x1 - 12, x1 + 4]]) for (const zz of [z0 + sh, hz - 12]) a.box(bx0, y0 - 1, zz, bx1, y0 + t + 3, zz + 12); }
  if (v.pbtn) { for (const s of [0, 1]) a.box(s ? x1 - 30 : x0 + 10, y0 + t * 0.3, z0 + sh + (hz - z0 - sh) * 0.04, s ? x1 - 10 : x0 + 30, y0 + t * 0.8, z0 + sh + (hz - z0 - sh) * 0.04 + 10); }
  if (v.speaker) { plate(a, x0 + 8, z0, x1 - 8, z0 + sh, y0 + 6, y0 + t * 2 + 14, 20); ribs(a, x0 + 24, z0 + 10, x1 - 24, z0 + sh - 10, y0 + 2, 5, true, 1.4, 4); }
  const pz = z0 + (v.speaker ? 0 : 0), pyv = y0;
  lean(a, i0, th, pyv, pz);
  a.rect(x0, y0 - 0.9, x1, y0 + t + 3, 'EQUIP-DETAIL');
  a.log(`Added the ${v.folio ? 'keyboard folio deck with a ' : 'desk cradle with a '}rounded ${v.kind} body leaned back, a screen with bezel${v.punch ? ', a camera hole' : v.notch ? ' and a camera notch' : ''}, ${v.cam ? v.cam + '-lens rear camera bump, ' : ''}side buttons and the speaker slit (plan and 3D).`);
}

/** a handheld game console: wide body with grips, centre screen, left stick and cross pad, four face buttons, shoulder bumpers, on a stand */
function handheld(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, th = 0.2, t = v.t;
  a.outline(); base(a, X0 + W * 0.25, YF, X1 - W * 0.25, YB, Z0, Z0 + 10); a.box(X0 + W * 0.25, YF, Z0 + 10, X1 - W * 0.25, YF + 8, Z0 + 24);
  const i0 = a.t.length, z0 = Z0 + 12, hz = Z1 - 14, y0 = YF + 12, x0 = X0 + 2, x1 = X1 - 2, hh = hz - z0;
  plate(a, x0, z0, x1, hz, y0, y0 + t, hh * 0.32);
  for (const s of [-1, 1]) a.ell(s < 0 ? x0 + W * 0.1 : x1 - W * 0.1, y0 + t * 0.9, z0 + hh * 0.34, W * 0.07, t * 0.9, hh * 0.32, 14, 8);
  plate(a, cx - W * 0.2, z0 + hh * 0.14, cx + W * 0.2, hz - hh * 0.14, y0 - 1.2, y0 + 0.1, 6);
  const lx = x0 + W * 0.12, rx = x1 - W * 0.12;
  a.ycyl(y0 - 5, y0 + 0.5, lx, hz - hh * 0.28, hh * 0.1, 18); a.ycyl(y0 - 6.5, y0 - 4, lx, hz - hh * 0.28, hh * 0.075, 14);
  a.box(lx - hh * 0.1, y0 - 3, z0 + hh * 0.3 - 3, lx + hh * 0.1, y0, z0 + hh * 0.3 + 3); a.box(lx - 3, y0 - 3, z0 + hh * 0.3 - hh * 0.1, lx + 3, y0, z0 + hh * 0.3 + hh * 0.1);
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) a.ycyl(y0 - 3, y0 + 0.5, rx + dx * hh * 0.095, hz - hh * 0.28 + dz * hh * 0.095, 5.2, 10);
  a.ycyl(y0 - 5, y0 + 0.5, rx, z0 + hh * 0.3, hh * 0.075, 14);
  for (const s of [-1, 1]) a.box(s < 0 ? x0 + 14 : x1 - 62, y0 + t * 0.3, hz, s < 0 ? x0 + 62 : x1 - 14, y0 + t * 0.9, hz + 10);
  for (let i = 0; i < 2; i++) a.ycyl(y0 - 1.5, y0 + 0.3, cx - 12 + i * 24, z0 + hh * 0.08, 3.4, 8);
  a.box(cx - 12, y0 + t * 0.4, hz - 0.5, cx + 12, y0 + t * 0.8, hz + 3);
  lean(a, i0, th, y0, z0);
  a.log(`Added the wide body with two grips, centre screen, left stick and cross pad, four face buttons, a right stick, shoulder bumpers and a desk stand (plan and 3D).`);
}

/** a smart speaker: cylinder with fabric rings, top control ring and LEDs; or a smart display speaker on a fabric base */
function speaker(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  if (v.kind === 'cyl') {
    const r = W / 2, top = Z1 - 8;
    a.cyl(cx, cy, Z0, Z0 + 8, r * 0.96, 36); a.circ(cx, cy, r);
    a.cone(cx, cy, Z0 + 8, top, r, r * (v.taper ?? 1), 36);
    for (let z = Z0 + 14; z < top - 6; z += 8) a.cyl(cx, cy, z, z + 3, r * (1 + 0.025) * ((v.taper ?? 1) + (1 - (v.taper ?? 1)) * (1 - (z - Z0) / (top - Z0))), 36);
    a.cyl(cx, cy, top, Z1, r * (v.taper ? v.taper * 0.96 : 0.97), 36);
    a.cyl(cx, cy, Z1 - 3, Z1, r * 0.55, 24);
    for (let i = 0; i < 4; i++) { const ang = (i / 4) * m.PI * 2 + 0.78; a.cyl(cx + m.cos(ang) * r * 0.3, cy + m.sin(ang) * r * 0.3, Z1 - 1, Z1, 1.6, 5); }
    a.ycyl(YF + 0.5, YF + 4, cx, Z0 + (top - Z0) * 0.5, 1, 4);
    a.circ(cx, cy, r * 0.55, 'EQUIP-DETAIL');
    a.log(`Added the cylinder body with fabric rings, a plinth, a top control ring and microphone dots (plan and 3D).`);
  } else if (v.kind === 'puck') {
    dome(a, cx, cy, Z0 + 6, W / 2, D / 2, H - 6, 8, 0); a.cyl(cx, cy, Z0, Z0 + 6, W * 0.45, 36); a.circ(cx, cy, W / 2);
    for (const k of [-1, 0, 1]) a.cyl(cx + k * W * 0.18, cy, Z0 + H * 0.95, Z0 + H * 0.97, 5, 8);
    a.log('Added the domed puck body with a flat base ring and top touch buttons (plan and 3D).');
  } else {
    a.outline(); slab(a, X0 + W * 0.1, YF + D * 0.1, X1 - W * 0.1, YB - D * 0.05, Z0, Z0 + H * 0.2, 40);
    ribs(a, X0 + W * 0.16, Z0 + 10, X1 - W * 0.16, Z0 + H * 0.2 - 8, YF + D * 0.1 - 1, 5, true, 1.4, 3);
    const i0 = a.t.length; plate(a, X0, Z0 + H * 0.2, X1, Z1, YF + D * 0.35, YF + D * 0.35 + 26, 14); plate(a, X0 + 12, Z0 + H * 0.2 + 12, X1 - 12, Z1 - 12, YF + D * 0.35 - 1, YF + D * 0.35, 8);
    a.ell(cx, YF + D * 0.35 + 52, Z0 + H * 0.6, W * 0.4, 30, H * 0.28, 16, 8); a.ycyl(YF + D * 0.35 + 24, YF + D * 0.35 + 30, cx, Z1 - 7, 2.4, 8);
    lean(a, i0, 0.12, YF + D * 0.35, Z0 + H * 0.2);
    a.log('Added the fabric speaker base, a leaned display with a camera, and a domed rear housing (plan and 3D).');
  }
}

/** an action camera: boxy body, large lens, front and top screens, side buttons and a two-finger mount */
function actioncam(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline(); const bz = Z0 + H * 0.32;
  a.prism(rr(X0, YF + 4, X1, YB - 12, 12), bz, Z1); a.poly(rr(X0, YF, X1, YB, 12));
  a.ycyl(YF, YF + 10, cx - W * 0.1, bz + (Z1 - bz) * 0.5, W * 0.2, 20); a.ycyl(YF - 0, YF + 12, cx - W * 0.1, bz + (Z1 - bz) * 0.5, W * 0.12, 16);
  a.box(X1 - W * 0.28, YF, Z1 - (Z1 - bz) * 0.3, X1 - W * 0.06, YF + 5, Z1 - (Z1 - bz) * 0.08);
  a.box(X0 + W * 0.1, YF, bz + 10, X0 + W * 0.25, YF + 5, bz + 22);
  a.box(X0 + W * 0.1, YB - 24, Z1 - 3, X1 - W * 0.1, YB - 14, Z1 + 0.01);
  a.cyl(X0 + W * 0.2, cy + 20, Z1, Z1 + 0.01, 0.1, 3);
  for (const x of [cx - 14, cx + 4]) a.box(x, YF + D * 0.2, Z0 + 2, x + 10, YF + D * 0.78, bz + 2);
  a.box(cx - 22, YF + D * 0.2 + 14, Z0 + 4, cx + 18, YF + D * 0.2 + 28, Z0 + 10); a.cyl(cx - 2, YF + D * 0.2 + 21, Z0, Z0 + 4, 5, 8);
  a.log('Added the rounded body with a large lens, front status screen, top button, side latch and a two-finger mount with a thumbscrew (plan and 3D).');
}

/** a wall charger on an outlet plate: plug body with ports, prongs, and a duplex plate behind */
function charger(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, pt = 5;
  a.outline();
  slab(a, X0, YB - pt, X1, YB, Z0, Z1, 14); a.poly(rr(X0, YB - pt, X1, YB, 6));
  for (const zz of [Z0 + H * 0.24, Z0 + H * 0.76]) { a.ycyl(YB - pt - 0.5, YB - pt, cx, zz, W * 0.12, 16); for (const dx of [-W * 0.06, W * 0.06]) a.box(cx + dx - 1.5, YB - pt - 0.6, zz - 5, cx + dx + 1.5, YB - pt, zz + 5); }
  const bz = Z0 + H * 0.52, bh = H * 0.42, bw = v.bw, bd = D - pt - 8;
  for (const dx of [-7, 7]) a.box(cx + dx - 3, YB - pt - 8, bz + bh * 0.5 - 8, cx + dx + 3, YB - pt, bz + bh * 0.5 + 8);   // prongs through the plate
  a.prism(rr(cx - bw / 2, YF + 6, cx + bw / 2, YB - pt - 8, 6), bz, bz + bh); a.poly(rr(cx - bw / 2, YF, cx + bw / 2, YB - pt - 8, 6));
  const n = v.ports; for (let i = 0; i < n; i++) { const px = cx - bw / 2 + 6 + i * ((bw - 12) / n), pw = (bw - 12) / n - 4; a.box(px, YF, bz + bh * 0.3, px + pw, YF + 8, bz + bh * 0.3 + 8.5); if (v.usba && i === n - 1) a.box(px, YF, bz + bh * 0.3 + 10, px + pw, YF + 8, bz + bh * 0.3 + 14); }
  a.log(`Added the duplex outlet plate with two sockets, and the charger body with ${n} USB port${n > 1 ? 's' : ''} and two prongs through the plate (plan and 3D).`);
}

/** a power bank standing on its edge: rounded slab, LED level dots, button, a port row on top and a cable loop */
function bank(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline(); plate(a, X0, Z0 + 3, X1, Z1, YF + 4, YB, m.min(W, D) * 0.22 + 4); a.box(X0 + 6, YF, Z0 + H * 0.2, X1 - 6, YF + 5, Z1 - H * 0.2);
  for (let i = 0; i < 4; i++) a.ycyl(YF - 0, YF + 6, X0 + W * 0.22 + i * (W * 0.56 / 3), Z1 - H * 0.12, 2.2, 8);
  a.ycyl(YF, YF + 6, cx, Z0 + H * 0.12, W * 0.07, 12);
  for (let i = 0; i < v.ports; i++) a.box(X0 + W * 0.18 + i * (W * 0.66 / v.ports), cy_(a) - 3, Z1 - 3, X0 + W * 0.18 + i * (W * 0.66 / v.ports) + (W * 0.66 / v.ports) - 3, cy_(a) + 3, Z1 + 0.0);
  feet(a, X0 + W * 0.2, X1 - W * 0.2, YF + D * 0.3, YB - D * 0.3, 5, 3);
  a.log(`Added the rounded slab body with a face panel, four level LEDs, a power button, ${v.ports} top ports and feet (plan and 3D).`);
}
function cy_(a) { return a.cy; }

/** a wireless charging pad (a flat disc) or a stand (a disc face on a wedge) */
function wchg(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  if (v.kind === 'pad') {
    a.cyl(cx, cy, Z0, Z0 + H * 0.7, W / 2, 36); a.cyl(cx, cy, Z0 + H * 0.7, Z1, W / 2 - 3, 36); a.circ(cx, cy, W / 2); a.circ(cx, cy, W * 0.3, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.15, 'EQUIP-DETAIL');
    a.box(cx - 10, cy + W / 2 - 8, Z0 + 1, cx + 10, cy + W / 2, Z0 + H * 0.5); a.tube([[cx, YB - 3, Z0 + H * 0.3], [cx, YB, Z0 + H * 0.3]], [3, 3], 6);
    a.log('Added the round pad with a raised rubber face, coil rings in plan and a cable exit (plan and 3D).');
  } else {
    a.outline(); a.prism(rr(X0, YF, X1, YB, 12), Z0, Z0 + 12); a.poly(rr(X0, YF, X1, YB, 12));
    prismX(a, [[YB - 50, Z0 + 12], [YB, Z0 + 12], [YB, Z1 - 12], [YB - 26, Z1 - 12]], X0 + W * 0.12, X1 - W * 0.12);
    const i0 = a.t.length; plate(a, cx - W * 0.4, Z0 + 12, cx + W * 0.4, Z1 - 4, YB - 70, YB - 52, 20); a.ycyl(YB - 76, YB - 70, cx, Z0 + (Z1 - Z0) * 0.55, W * 0.28, 28); a.ycyl(YB - 78, YB - 76, cx, Z0 + (Z1 - Z0) * 0.55, W * 0.07, 10);
    a.box(cx - W * 0.3, YB - 90, Z0 + 12, cx + W * 0.3, YB - 60, Z0 + 28);
    lean(a, i0, 0.25, YB - 70, Z0 + 12);
    a.log('Added the base, a leaned face with a round charging coil and a lower phone ledge, and a rear support (plan and 3D).');
  }
}

const GAD = [
  fam({ cat: 'tech/gadgets', title: 'Generic smartphone',
    desc: (v) => `${v.kind === 'phone' ? 'Smartphone' : 'Rugged smartphone'} on a desk cradle: rounded body leaned back with a screen and bezel, ${v.punch ? 'a camera hole' : 'a camera notch'}, a ${v.cam}-lens rear camera bump, side buttons and a speaker slit.`,
    vs: [['compact, 5.4 in screen', 2.6, 3.0, 5.8, 0, { kind: 'phone', t: 7.5, r: 14, bez: 3.5, punch: 1, cam: 2, btn: 1, sp: 1 }], ['standard, 6.1 in screen', 2.85, 3.0, 6.1, 0, { kind: 'phone', t: 8, r: 16, bez: 3.2, punch: 1, cam: 3, btn: 1, sp: 1 }], ['large, 6.7 in screen', 3.1, 3.2, 6.6, 0, { kind: 'phone', t: 8.2, r: 17, bez: 3, notch: 1, cam: 3, btn: 1, sp: 1 }], ['rugged, 6.3 in screen', 3.3, 3.3, 6.7, 0, { kind: 'rugged', t: 13, r: 12, bez: 5.5, punch: 1, cam: 2, btn: 1, sp: 1, rugged: 1 }]],
    build: slate }),
  fam({ cat: 'tech/gadgets', title: 'Generic tablet',
    desc: (v) => v.folio ? `Tablet leaned back above a keyboard folio deck with ${v.cam} rear camera, a screen and bezel and side buttons.` : `Tablet on a desk cradle: rounded body leaned back with a screen and bezel, a rear camera, side buttons and a speaker slit.`,
    vs: [['8.3 in screen', 5.4, 3.6, 8.4, 0, { kind: 'tablet', t: 6.5, r: 18, bez: 11, cam: 1, btn: 1, sp: 1, punch: 1 }], ['10.9 in screen', 7.5, 4.4, 10, 0, { kind: 'tablet', t: 6.2, r: 18, bez: 10, cam: 2, btn: 1, sp: 1, punch: 1 }], ['12.9 in screen', 8.7, 5, 11.2, 0, { kind: 'tablet', t: 6.4, r: 18, bez: 10, cam: 2, btn: 1, sp: 1, punch: 1 }], ['10.9 in with keyboard folio', 9.8, 9.8, 7.2, 0, { kind: 'tablet', t: 6.2, r: 18, bez: 10, cam: 2, btn: 1, punch: 1, folio: 1 }]],
    build: slate }),
  fam({ cat: 'tech/gadgets', title: 'Generic e-reader',
    desc: 'E-reader on a desk cradle: rounded body leaned back with a wide-bezel paper-style screen, page-turn buttons on the side and a power button.',
    vs: [['6 in screen', 4.7, 3.1, 6.6, 0, { kind: 'reader', t: 8, r: 8, bez: 10, btn: 1, pbtn: 1 }], ['7 in screen', 5.5, 3.2, 7.4, 0, { kind: 'reader', t: 7.5, r: 8, bez: 9, btn: 1, pbtn: 1 }], ['8 in large, wide bezel', 6.4, 3.4, 8.3, 0, { kind: 'reader', t: 7, r: 8, bez: 13, btn: 1, pbtn: 1 }]],
    build: slate }),
  fam({ cat: 'tech/gadgets', title: 'Generic handheld game console',
    desc: 'Handheld game console on a desk stand: wide body with two grips, a centre screen, a left stick and cross pad, four face buttons, a right stick and shoulder bumpers.',
    vs: [['standard, 7 in', 10.2, 4, 4.4, 0, { t: 24 }], ['large, 8 in', 11.6, 4.5, 4.8, 0, { t: 28 }]],
    build: handheld }),
  fam({ cat: 'tech/gadgets', title: 'Generic smart speaker',
    desc: (v) => v.kind === 'cyl' ? 'Cylindrical smart speaker with fabric rings, a plinth, a top control ring and microphone dots.' : v.kind === 'puck' ? 'Domed puck smart speaker with a flat base ring and top touch buttons.' : 'Smart display speaker with a fabric base, a leaned screen with a camera and a domed rear housing.',
    vs: [['tall cylinder', 3.7, 3.7, 6.7, 0, { kind: 'cyl' }], ['puck, compact', 3.9, 3.9, 1.7, 0, { kind: 'puck' }], ['with 8 in display', 8.7, 4.7, 5.6, 0, { kind: 'display' }]],
    build: speaker }),
  fam({ cat: 'tech/gadgets', title: 'Generic action camera',
    desc: 'Action camera with a rounded body, a large lens, a front status screen, a top button, a side latch and a two-finger mount with a thumbscrew.',
    vs: [['compact', 2.3, 1.7, 2.2, 0, {}]],
    build: actioncam }),
  fam({ cat: 'tech/gadgets', title: 'Generic wall charger',
    desc: (v) => `Wall charger with ${v.ports} USB port${v.ports > 1 ? 's' : ''} on a duplex outlet plate, two prongs through the plate.`,
    vs: [['single port', 2.9, 2.5, 4.6, 0, { ports: 1, bw: 40 }], ['two port', 2.9, 2.7, 4.6, 0, { ports: 2, bw: 50 }], ['three port, large', 2.9, 3.0, 4.6, 0, { ports: 3, bw: 60, usba: 1 }]],
    build: charger }),
  fam({ cat: 'tech/gadgets', title: 'Generic power bank',
    desc: (v) => `Power bank standing on its edge: rounded slab with a face panel, four level LEDs, a power button, ${v.ports} top ports and feet.`,
    vs: [['10000 mAh', 2.7, 0.55, 4.7, 0, { ports: 2 }], ['20000 mAh', 2.9, 0.8, 5.9, 0, { ports: 3 }], ['26000 mAh, large', 3.5, 1.1, 6.5, 0, { ports: 4 }]],
    build: bank }),
  fam({ cat: 'tech/gadgets', title: 'Generic wireless charger',
    desc: (v) => v.kind === 'pad' ? 'Round wireless charging pad with a raised rubber face, coil rings and a cable exit.' : 'Wireless charging stand with a leaned face and a round coil, a lower phone ledge and a rear support.',
    vs: [['pad, 3.5 in', 3.5, 3.5, 0.4, 0, { kind: 'pad' }], ['stand, 3.5 in coil', 4.2, 4.5, 4.2, 0, { kind: 'stand' }]],
    build: wchg }),
];

// ------------------------------------------------------------------------------------------ audio
/** a headphone set on a desk stand: base, stem and hook, headband, cups with pads; open-back cups carry a grille of ribs */
function headphones(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cr = W * 0.2, hr = W / 2 - cr * 0.6, cz = Z1 - 44 - hr;
  a.cyl(cx, cy, Z0, Z0 + 12, D * 0.42, 24); a.circ(cx, cy, D * 0.42); a.cyl(cx, cy, Z0 + 12, Z1 - 24, 12, 10);
  a.tube([[cx, cy, Z1 - 40], [cx, cy, Z1 - 20]], [14, 22], 12); a.ell(cx, cy, Z1 - 18, 56, 28, 10, 12, 6);
  arcBand(a, cx, cz, hr, 14, cy - 11, cy + 11, 0, m.PI, 20);   // the band is a half ring; its top sits on the stand hook height
  a.box(cx - hr * 0.3, cy - 13, Z1 - 24, cx + hr * 0.3, cy + 13, Z1 - 12);
  for (const s of [-1, 1]) {
    const x = cx + s * (hr + 3), ez = cz - cr * 0.95;
    a.xcyl(s < 0 ? x - 30 : x - 4, s < 0 ? x + 4 : x + 30, cy, ez, cr, 24); a.xcyl(s < 0 ? x + 4 : x - 14, s < 0 ? x + 18 : x - 4, cy, ez, cr * 1.04, 24);
    if (v.open) for (let k = -3; k <= 3; k++) a.box(s < 0 ? x - 32 : x + 28, cy - cr * 0.8 + 0, ez + k * cr * 0.22 - 2, s < 0 ? x - 30 : x + 30, cy + cr * 0.8 - 0, ez + k * cr * 0.22 + 2);
    a.tube([[x + s * 2, cy, ez + cr * 0.9], [x + s * 2, cy, cz]], [5, 5], 6); a.circ(x + s * 14, cy, cr, 'EQUIP-DETAIL');
  }
  a.log(`Added the stand base, stem and hook, a padded headband with a slider, and two ${v.open ? 'open-back cups with grille slats' : 'closed cups with cushioned pads'} (plan and 3D).`);
}

/** a loudspeaker cabinet: rounded box, front baffle with drivers (tweeter dome, midrange, woofers with surrounds), a port, feet or plinth, rear terminals */
function loud(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, fz = v.plinth ? 38 : 10;
  a.rect(X0, YF, X1, YB);
  if (v.plinth) { a.box(X0 - 0, YF + 6, Z0, X1, YB, Z0 + fz); a.box(X0 + 8, YF, Z0, X1 - 8, YF + 8, Z0 + fz - 4); }
  else feet(a, X0 + W * 0.16, X1 - W * 0.16, YF + D * 0.18, YB - D * 0.18, 12, fz);
  a.prism(rr(X0 + 4, YF + 8, X1 - 4, YB, 10), Z0 + fz, Z1); a.poly(rr(X0, YF, X1, YB, 10));
  a.box(X0 + 2, YF + 6, Z0 + fz + 4, X1 - 2, YF + 11, Z1 - 4);                                   // baffle
  for (const [k, zf, rf] of v.drv) {
    const x = cx, z = Z0 + fz + (H - fz) * zf, r = W * rf;
    if (k === 't') { a.ycyl(YF + 1, YF + 11, x, z, r * 1.15, 22); a.ell(x, YF + 3, z, r * 0.85, 7, r * 0.85, 14, 8); }
    else { a.ycyl(YF + 1, YF + 11, x, z, r, 26); ringXZ(a, x, z, r * 0.78, 3.4, YF + 1.5, 24, 6); a.ell(x, YF + 6, z, r * 0.33, 6, r * 0.33, 12, 6); a.ycyl(YF + 4, YF + 8, x, z, r * 0.7, 20); }
  }
  if (v.port) { const z = Z0 + fz + (H - fz) * v.port[0], r = W * v.port[1]; ringXZ(a, cx, z, r, 5, YF + 2, 24, 6); a.ycyl(YF + 4, YF + 10, cx, z, r, 24); }
  if (v.knob) { a.ycyl(YF - 0.0, YF + 8, cx + W * 0.3, Z0 + fz + (H - fz) * 0.07, 9, 14); a.ycyl(YF, YF + 8, X0 + W * 0.18, Z0 + fz + (H - fz) * 0.07, 3, 8); }
  a.box(cx - W * 0.2, YB - 2, Z0 + fz + (H - fz) * 0.12, cx + W * 0.2, YB, Z0 + fz + (H - fz) * 0.12 + 30); for (let i = 0; i < 4; i++) a.cyl(cx - W * 0.15 + i * 18, YB, Z0 + fz + (H - fz) * 0.12 + 8, Z0 + fz + (H - fz) * 0.12 + 9, 5, 8);
  a.log(`Added the rounded cabinet with a raised baffle, ${v.drv.length} driver${v.drv.length > 1 ? 's' : ''} with surrounds and caps${v.port ? ', a front port ring' : ''}${v.knob ? ', a volume knob' : ''}, ${v.plinth ? 'a plinth' : 'feet'} and rear terminals (plan and 3D).`);
}

/** a stand microphone: base disc, stem, boom or direct mount, mic body with a mesh head, shock mount and pop filter */
function mic(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.cyl(cx, cy, Z0, Z0 + 12, W * 0.4, 28); a.circ(cx, cy, W * 0.4); a.cyl(cx, cy, Z0 + 12, Z0 + H * 0.55, 11, 10);
  if (v.kind === 'cond') {
    a.tube([[cx, cy, Z0 + H * 0.55], [cx, cy, Z0 + H * 0.66], [cx, cy - D * 0.2, Z0 + H * 0.7]], [9, 8, 8], 8);
    const zc = Z0 + H * 0.74, my = cy - D * 0.2;
    ringXZ(a, cx, zc, W * 0.3, 3.4, my, 28, 6); ringXZ(a, cx, zc, W * 0.31, 3, my + 24, 28, 6);
    for (let i = 0; i < 8; i++) { const th = (i / 8) * m.PI * 2; a.tube([[cx + W * 0.3 * m.cos(th), my, zc + W * 0.3 * m.sin(th)], [cx + W * 0.31 * m.cos(th) * 0.6, my + 12, zc + W * 0.31 * m.sin(th) * 0.6]], [1.2, 1.2], 4); }
    a.ycyl(my - 10, my + 30, cx, zc, W * 0.2, 24); a.ell(cx, my - 10, zc, W * 0.2, 24, W * 0.2, 20, 10); a.ycyl(my + 30, my + 52, cx, zc, W * 0.1, 14);
    ringXZ(a, cx, zc, W * 0.36, 4, my - 70, 28, 6); a.ycyl(my - 76, my - 72, cx, zc, W * 0.34, 28); a.circ(cx, my - 74, W * 0.34, 'EQUIP-DETAIL');
    a.log('Added the base and stem, a boom, a large-diaphragm microphone with a mesh head inside a shock mount, and a round pop filter (plan and 3D).');
  } else if (v.kind === 'dyn') {
    a.cone(cx, cy, Z0 + H * 0.55, Z0 + H * 0.62, 14, 9, 10); a.cone(cx, cy, Z0 + H * 0.62, Z1 - W * 0.32, 9, 14, 10); a.cyl(cx, cy, Z1 - W * 0.32, Z1 - W * 0.12, 15, 14); a.ell(cx, cy, Z1 - W * 0.12, W * 0.2, W * 0.2, W * 0.2, 18, 10);
    a.cyl(cx, cy, Z0 + H * 0.65, Z0 + H * 0.67, 17, 14); a.box(cx - 8, cy - 18, Z0 + H * 0.72, cx + 8, cy - 14, Z0 + H * 0.76);
    for (let k = 0; k < 3; k++) a.cyl(cx, cy, Z1 - W * 0.12 - 6 - k * 5, Z1 - W * 0.12 - 4 - k * 5, W * 0.2 + 1, 18);
    a.log('Added the base, stem, a handheld microphone with a ball grille, a clip and a switch on the body (plan and 3D).');
  } else {
    a.box(cx - 5, cy - 5, Z0 + 12, cx + 5, cy + 5, Z0 + H * 0.5);
    a.cyl(cx, cy, Z0 + H * 0.5, Z0 + H * 0.58, W * 0.2, 20);
    for (const s of [-1, 1]) a.tube([[cx + s * W * 0.18, cy, Z0 + H * 0.56], [cx + s * W * 0.34, cy, Z0 + H * 0.62], [cx + s * W * 0.34, cy, Z0 + H * 0.84]], [4, 4, 4], 6);
    a.box(cx - W * 0.28, cy - W * 0.12, Z0 + H * 0.5, cx + W * 0.28, cy + W * 0.12, Z0 + H * 0.54);
    a.ycyl(cy - W * 0.12, cy + W * 0.12, cx, Z0 + H * 0.86, W * 0.26, 24); a.xcyl(cx - W * 0.26, cx + W * 0.26, cy, Z0 + H * 0.86, W * 0.12, 18);
    a.cyl(cx, cy, Z0 + H * 0.74, Z0 + H * 0.98, W * 0.22, 24); a.ell(cx, cy, Z0 + H * 0.98, W * 0.22, W * 0.22, W * 0.12, 18, 8);
    a.cyl(cx, cy, Z0 + H * 0.76, Z0 + H * 0.78, W * 0.235, 24); a.ycyl(cy - W * 0.24, cy - W * 0.22, cx, Z0 + H * 0.86, 0.6, 3);
    a.log('Added the base and legs, a cradle, and a USB podcast microphone with a mesh capsule and a gain knob (plan and 3D).');
  }
}

/** a turntable: plinth with feet, platter with a record and label, spindle, tonearm on a pivot with a headshell and counterweight, speed controls */
function turntable(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, fz = 14, pr = D * 0.4;
  a.outline(); feet(a, X0 + 24, X1 - 24, YF + 24, YB - 24, 14, fz);
  a.prism(rr(X0, YF, X1, YB, 8), Z0 + fz, Z0 + H * 0.72); a.poly(rr(X0, YF, X1, YB, 8));
  const px = X0 + W * 0.42, py = cy;
  a.cyl(px, py, Z0 + H * 0.72, Z0 + H * 0.8, pr * 0.9, 40); a.circ(px, py, pr * 0.9);
  a.cyl(px, py, Z0 + H * 0.8, Z0 + H * 0.84, pr * 0.97, 40); a.circ(px, py, pr * 0.97, 'EQUIP-DETAIL');
  for (let k = 1; k <= 4; k++) a.circ(px, py, pr * (0.38 + 0.1 * k), 'EQUIP-DETAIL');
  a.cyl(px, py, Z0 + H * 0.84, Z0 + H * 0.88, pr * 0.34, 28); a.cyl(px, py, Z0 + H * 0.88, Z1 - 4, 2.6, 6);
  const ax = X1 - W * 0.12, ay = YF + D * 0.2;
  a.cyl(ax, ay, Z0 + H * 0.72, Z0 + H * 0.95, 13, 14); a.circ(ax, ay, 13);
  a.tube([[ax, ay + 30, Z0 + H * 0.95], [ax, ay, Z0 + H * 0.97], [ax - W * 0.1, ay + D * 0.25, Z0 + H * 0.96], [px + pr * 0.45, py - pr * 0.45 + 40, Z0 + H * 0.94]], [2.5, 3, 2.8, 2.6], 8);
  a.box(px + pr * 0.4, py - pr * 0.45 + 20, Z0 + H * 0.9, px + pr * 0.55, py - pr * 0.45 + 52, Z0 + H * 0.94); a.cyl(ax, ay + 44, Z0 + H * 0.93, Z0 + H * 0.97, 8, 10);
  a.line(ax, ay, px + pr * 0.45, py - pr * 0.45 + 40, 'EQUIP-DETAIL'); a.rect(px + pr * 0.4, py - pr * 0.45 + 20, px + pr * 0.55, py - pr * 0.45 + 52, 'EQUIP');
  a.ycyl(YF, YF + 8, X0 + W * 0.12, Z0 + H * 0.4, 11, 16); a.ycyl(YF, YF + 7, X0 + W * 0.25, Z0 + H * 0.4, 11, 16);
  if (v.dd) { a.box(X1 - W * 0.07, YF + D * 0.5, Z0 + H * 0.72, X1 - W * 0.03, YB - 22, Z0 + H * 0.76); a.box(X1 - W * 0.075, YF + D * 0.62, Z0 + H * 0.76, X1 - W * 0.025, YF + D * 0.68, Z0 + H * 0.82); }
  a.log(`Added the plinth with feet and front knobs, ${v.dd ? 'a direct-drive platter with strobe ring and a pitch slider' : 'a belt-drive platter'}, a record with a label, spindle and a tonearm on a pivot with headshell and counterweight (plan and 3D).`);
}

/** an audio amplifier: aluminium front panel, large knobs, a display window, small control knobs and buttons, heat-sink top and feet */
function amp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, fz = 12;
  a.outline(); feet(a, X0 + 30, X1 - 30, YF + 30, YB - 30, 14, fz);
  a.box(X0 + 8, YF + 10, Z0 + fz, X1 - 8, YB, Z1 - 3); a.box(X0, YF + 5, Z0 + fz, X1, YF + 12, Z1);
  a.box(X0, YF + 5, Z1 - 3, X1, YB, Z1); for (let i = 0; i < 18; i++) a.box(X0 + 14 + i * ((W - 28) / 18), YF + D * 0.3, Z1, X0 + 14 + i * ((W - 28) / 18) + 4, YB - 14, Z1 + 0.01);
  const fh = Z1 - Z0 - fz;
  for (const k of v.knobs) { const x = X0 + W * k[0], z = Z0 + fz + fh * k[1], r = fh * k[2]; a.ycyl(YF - 1, YF + 5, x, z, r, 22); a.ycyl(YF - 4, YF + 5, x, z, r * 0.82, 20); a.box(x - 1, YF - 4.5, z + r * 0.2, x + 1, YF - 3.5, z + r * 0.75); }
  if (v.disp) a.box(X0 + W * v.disp[0], YF + 1, Z0 + fz + fh * 0.62, X0 + W * v.disp[1], YF + 5.5, Z0 + fz + fh * 0.88);
  if (v.meters) for (const x of [0.32, 0.66]) { a.box(X0 + W * (x - 0.1), YF + 1, Z0 + fz + fh * 0.4, X0 + W * (x + 0.1), YF + 5.5, Z0 + fz + fh * 0.88); a.ycyl(YF + 0, YF + 1.5, X0 + W * x, Z0 + fz + fh * 0.4, 1, 4); }
  for (let i = 0; i < v.btn; i++) a.box(X0 + W * 0.3 + i * W * (0.4 / v.btn), YF, Z0 + fz + fh * 0.1, X0 + W * 0.3 + i * W * (0.4 / v.btn) + 10, YF + 5.5, Z0 + fz + fh * 0.1 + 6);
  a.ycyl(YF - 1, YF + 5, X0 + 24, Z0 + fz + fh * 0.2, 4, 10); a.ycyl(YF, YF + 5, X1 - 24, Z0 + fz + fh * 0.2, 5, 10);
  a.log(`Added the chassis with an aluminium front panel, ${v.knobs.length} knobs, ${v.disp ? 'a display window, ' : ''}${v.meters ? 'two level meters, ' : ''}${v.btn} buttons, a vented top and feet (plan and 3D).`);
}

/** a mixing desk: sloped console body with n channel strips (knobs, mute button, fader) and a master section with meters; side cheeks */
function mixer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, cheek = 22, lo = H * 0.42, hi = H * 0.7;
  a.outline(); const sl = (y) => Z0 + lo + (H * 0.72 - lo) * ((y - YF) / D);
  prismX(a, [[YF, Z0 + 2], [YB, Z0 + 2], [YB, Z0 + H * 0.72], [YF, Z0 + lo]], X0 + cheek, X1 - cheek);
  for (const x0 of [X0, X1 - cheek]) prismX(a, [[YF, Z0 + 2], [YB, Z0 + 2], [YB, Z1 - 4], [YF + D * 0.35, Z0 + H * 0.78], [YF, Z0 + lo + 12]], x0, x0 + cheek);
  const mw = v.master ? W * 0.18 : 0, cw = (W - 2 * cheek - mw - 16) / v.n, x0 = X0 + cheek + 8;
  for (let i = 0; i < v.n; i++) {
    const x = x0 + (i + 0.5) * cw;
    a.box(x - 1.5, YF + 14, sl(YF + 14), x + 1.5, YF + D * 0.28, sl(YF + D * 0.28) + 0.6); const fy = YF + D * 0.16; a.box(x - 6, fy, sl(fy), x + 6, fy + 18, sl(fy) + 12);
    for (let k = 0; k < 4; k++) { const y = YF + D * (0.4 + k * 0.13); a.cyl(x, y, sl(y), sl(y) + 8, cw * 0.22, 8); }
    a.box(x - cw * 0.2, YF + D * 0.32, sl(YF + D * 0.32), x + cw * 0.2, YF + D * 0.35, sl(YF + D * 0.32) + 3);
    a.box(x - cw * 0.34, YB - 14, sl(YB - 14), x + cw * 0.34, YB - 8, sl(YB - 14) + 2.5);
    a.line(x, YF + 14, x, YF + D * 0.28, 'EQUIP-DETAIL');
  }
  if (v.master) { const mx = X1 - cheek - 8 - mw; a.box(mx, YF + 8, sl(YF + 8), X1 - cheek - 8, YB - 8, sl(YB - 8) + 2); for (const dx of [0.28, 0.68]) { a.box(mx + mw * (dx - 0.1), YF + 20, sl(YF + 20), mx + mw * (dx + 0.1), YF + D * 0.3, sl(YF + D * 0.3) + 0.8); a.box(mx + mw * (dx - 0.15), YF + D * 0.14, sl(YF + D * 0.14), mx + mw * (dx + 0.15), YF + D * 0.14 + 20, sl(YF + D * 0.14) + 14); } for (let k = 0; k < 8; k++) a.box(mx + mw * 0.22, YF + D * 0.46 + k * 8, sl(YF + D * 0.46 + k * 8), mx + mw * 0.78, YF + D * 0.46 + k * 8 + 5, sl(YF + D * 0.46 + k * 8) + 1.5); a.rect(mx, YF + 8, X1 - cheek - 8, YB - 8, 'EQUIP-DETAIL'); }
  a.log(`Added the sloped console with two side cheeks, ${v.n} channel strips (fader, four knobs, mute button${v.master ? '' : ''}) and ${v.master ? 'a master section with two faders and a meter bridge' : 'no master section'} (plan and 3D).`);
}

/** a flat-screen TV: thin bezel panel, rear housing, and two legs (stand) with a camera or logo-free chin */
function tvset(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, ph = m.min(H - 60, W / 1.78), pz = Z1 - ph;
  a.outline(); a.rect(X0, YF, X1, YF + 30, 'EQUIP');
  plate(a, X0, pz, X1, Z1, YF + 4, YF + 28, 6); a.frame(X0, pz, X1, Z1, YF, YF + 5, 10); a.box(X0 + 10, YF + 5, pz + 10, X1 - 10, YF + 26, Z1 - 10);
  a.prism(rr(cx - W * 0.3, YF + 28, cx + W * 0.3, YF + 28 + D * 0.4, 20), pz + ph * 0.18, Z1 - ph * 0.28);
  for (const s of [-1, 1]) { const x = cx + s * W * 0.36; a.box(x - W * 0.05, YF + 6, Z0, x + W * 0.05, YF + 24 + D * 0.5, Z0 + 14); a.box(x - 12, YF + 8, Z0 + 14, x + 12, YF + 24, pz + 20); a.rect(x - W * 0.05, YF + 6, x + W * 0.05, YF + 24 + D * 0.5, 'EQUIP-DETAIL'); }
  a.box(cx - 40, YF + 4, pz + 2, cx + 40, YF + 8, pz + 8); a.box(cx + W * 0.4, YF + 4, pz + 2, cx + W * 0.4 + 10, YF + 8, pz + 4);
  a.log('Added the thin-bezel panel, a rear housing, two feet with uprights, a remote sensor strip and the power key (plan and 3D).');
}

/** a soundbar: a long low capsule with a grille, end caps, a LED strip and two feet */
function soundbar(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline(); for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 18, YF + D * 0.2, Z0, cx + s * W * 0.4 + 18, YB - D * 0.2, Z0 + 8);
  a.prism(rr(X0, YF, X1, YB, D * 0.3), Z0 + 8, Z1); a.poly(rr(X0, YF, X1, YB, D * 0.3));
  a.box(X0 + 14, YF - 0, Z0 + 12, X1 - 14, YF + 4, Z1 - 4); ribs(a, X0 + 20, Z0 + 12, X1 - 20, Z1 - 5, YF - 0, v.rows, true, 1.6, 4);
  for (let i = 0; i < 5; i++) a.ycyl(YF, YF + 5, X0 + 24 + i * 13, Z1 - 2, 1.2, 6);
  for (const s of [-1, 1]) a.ycyl(YF + 2, YF + 8, cx + s * W * 0.4, Z0 + (Z1 - Z0) * 0.5, D * 0.2, 16);
  a.log(`Added the capsule body with a ribbed front grille, end drivers, indicator LEDs and two feet (plan and 3D).`);
}

const AUD = [
  fam({ cat: 'tech/audio', title: 'Generic headphones on stand',
    desc: (v) => `Headphone set on a desk stand: base, stem and hook, a padded headband and two ${v.open ? 'open-back cups with grille slats' : 'closed cups with cushioned pads'}.`,
    vs: [['closed back', 8.4, 7.5, 10.5, 0, {}], ['open back, grille slats', 8.8, 7.5, 10.5, 0, { open: 1 }]],
    build: headphones }),
  fam({ cat: 'tech/audio', title: 'Generic loudspeaker',
    desc: (v) => `Loudspeaker with a rounded cabinet, raised baffle, ${v.drv.length} driver${v.drv.length > 1 ? 's' : ''} with surrounds and caps${v.port ? ', a front port ring' : ''}${v.knob ? ', a volume knob' : ''}, ${v.plinth ? 'a plinth' : 'feet'} and rear terminals.`,
    vs: [['bookshelf, 2-way, 5 in', 7, 9, 11.5, 0, { drv: [['t', 0.8, 0.09], ['w', 0.4, 0.28]], port: [0.1, 0.07] }], ['bookshelf, 2-way, 6.5 in', 8.3, 10.5, 14, 0, { drv: [['t', 0.82, 0.1], ['w', 0.46, 0.3]], port: [0.1, 0.07] }], ['floor tower, 3-way', 9, 13, 40, 0, { drv: [['t', 0.88, 0.09], ['m', 0.76, 0.17], ['w', 0.52, 0.26], ['w', 0.2, 0.26]], plinth: 1 }], ['subwoofer, 12 in', 15, 16, 16.5, 0, { drv: [['w', 0.55, 0.34]], port: [0.18, 0.1] }]],
    build: loud }),
  fam({ cat: 'tech/audio', title: 'Generic studio monitor',
    desc: (v) => `Active studio monitor with a rounded cabinet, ${v.drv.length} drivers, a front port ring, a volume knob, feet and rear terminals.`,
    vs: [['5 in woofer', 7.1, 9, 11.2, 0, { drv: [['t', 0.8, 0.1], ['w', 0.4, 0.3]], port: [0.1, 0.07], knob: 1 }], ['8 in woofer', 10.3, 13, 15.8, 0, { drv: [['t', 0.82, 0.08], ['w', 0.42, 0.34]], port: [0.1, 0.07], knob: 1 }]],
    build: loud }),
  fam({ cat: 'tech/audio', title: 'Generic microphone on stand',
    desc: (v) => v.kind === 'cond' ? 'Studio condenser microphone with a mesh head in a shock mount on a boom, with a round pop filter and a base.' : v.kind === 'dyn' ? 'Handheld dynamic microphone with a ball grille and a switch, in a clip on a stem and base.' : 'USB podcast microphone with a mesh capsule and a gain knob in a cradle on a stand.',
    vs: [['studio condenser, boom', 8, 12, 18, 0, { kind: 'cond' }], ['dynamic, desk stand', 6.5, 6.5, 14, 0, { kind: 'dyn' }], ['USB podcast, tabletop', 6.5, 6.5, 12, 0, { kind: 'usb' }]],
    build: mic }),
  fam({ cat: 'tech/audio', title: 'Generic turntable',
    desc: (v) => `Turntable with a plinth on feet, ${v.dd ? 'a direct-drive platter with a pitch slider' : 'a belt-drive platter'}, a record with a label, and a tonearm on a pivot with headshell and counterweight.`,
    vs: [['belt drive', 17, 14, 5, 0, {}], ['direct drive, with pitch slider', 18, 14.5, 5.5, 0, { dd: 1 }]],
    build: turntable }),
  fam({ cat: 'tech/audio', title: 'Generic audio amplifier',
    desc: (v) => `Amplifier with an aluminium front panel, ${v.knobs.length} knobs${v.disp ? ', a display window' : ''}${v.meters ? ', two level meters' : ''}, ${v.btn} buttons, a vented top and feet.`,
    vs: [['stereo integrated', 17, 13.5, 4.7, 0, { knobs: [[0.12, 0.45, 0.18], [0.88, 0.45, 0.28]], disp: [0.4, 0.62], btn: 5 }], ['surround receiver', 17.3, 15.5, 6.6, 0, { knobs: [[0.12, 0.5, 0.14], [0.82, 0.45, 0.3], [0.64, 0.4, 0.1]], disp: [0.25, 0.68], btn: 8 }], ['power amplifier, with meters', 17.3, 16, 6.3, 0, { knobs: [[0.1, 0.5, 0.14], [0.9, 0.5, 0.14]], meters: 1, btn: 3 }]],
    build: amp }),
  fam({ cat: 'tech/audio', title: 'Generic mixing desk',
    desc: (v) => `Sloped mixing desk with side cheeks, ${v.n} channel strips (fader, four knobs and a mute button) and ${v.master ? 'a master section with meters' : 'no master section'}.`,
    vs: [['8 channel', 14, 17, 5.5, 0, { n: 8, master: 1 }], ['16 channel', 24, 20, 7, 0, { n: 16, master: 1 }], ['24 channel, large', 36, 24, 9, 0, { n: 24, master: 1 }]],
    build: mixer }),
  fam({ cat: 'tech/audio', title: 'Generic flat-screen TV',
    desc: 'Flat-screen TV with a thin-bezel panel, a rear housing, two feet with uprights and a remote sensor strip.',
    vs: [32, 55, 65, 75].map((s) => { const w = m.round(((s * 1.78) / m.hypot(1.78, 1)) * 10) / 10; return [`${s} in`, w, m.round(w * 0.14 * 10) / 10 + 3, m.round((w / 1.78 + 3) * 10) / 10, 0, {}]; }),
    build: tvset }),
  fam({ cat: 'tech/audio', title: 'Generic soundbar',
    desc: 'Soundbar with a ribbed front grille, end drivers, indicator LEDs and two feet.',
    vs: [['small, 28 in', 28, 3.5, 2.4, 0, { rows: 8 }], ['large, 45 in', 45, 4.2, 2.9, 0, { rows: 10 }]],
    build: soundbar }),
];

// ------------------------------------------------------------------------------------------ iot
/** a security camera: indoor dome on a base, a bullet camera on a wall bracket with a sunshade and IR ring, or a pan-tilt camera on a stand */
function camera(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  if (v.kind === 'dome') {
    a.outline(); a.cyl(cx, cy, Z0, Z0 + H * 0.22, W * 0.5, 36); a.cyl(cx, cy, Z0 + H * 0.22, Z0 + H * 0.3, W * 0.42, 36); dome(a, cx, cy, Z0 + H * 0.3, W * 0.42, W * 0.42, H * 0.7, 9, 0);
    a.ell(cx, cy - W * 0.12, Z0 + H * 0.58, W * 0.14, W * 0.12, W * 0.14, 14, 8); a.ycyl(YF + W * 0.28, YF + W * 0.34, cx, Z0 + H * 0.58, W * 0.07, 12);
    a.cyl(cx + W * 0.3, cy - W * 0.3, Z0 + H * 0.22, Z0 + H * 0.24, 2.4, 6); a.circ(cx, cy, W * 0.42, 'EQUIP-DETAIL');
    a.log('Added the round base with a mounting ring, a clear dome, a ball lens inside and a status LED (plan and 3D).');
  } else if (v.kind === 'bullet') {
    a.outline(); const zc = Z0 + H * 0.58, r = H * 0.2;
    a.box(cx - 24, YB - 46, Z0, cx + 24, YB, Z0 + H * 0.3); a.box(cx - 40, YB - 10, Z0 + H * 0.2, cx + 40, YB, Z0 + H * 0.32);
    a.tube([[cx, YB - 30, Z0 + H * 0.3], [cx, YB - 40, zc - r * 0.4]], [14, 12], 10); a.ell(cx, YB - 44, zc - r * 1.0, 14, 14, 14, 10, 6);
    a.ycyl(YF + 40, YB - 60, cx, zc, r, 28); a.circ(cx, cy, r, 'EQUIP-DETAIL');
    a.box(cx - r * 1.15, YF + 0, zc + r * 0.5, cx + r * 1.15, YB - 70, zc + r * 1.2); a.box(cx - r * 1.15, YF, zc + r * 1.05, cx + r * 1.15, YF + 40, zc + r * 1.25);   // sunshade
    a.ycyl(YF + 6, YF + 44, cx, zc, r * 0.98, 28); a.ycyl(YF + 2, YF + 40, cx, zc, r * 0.78, 24); a.ycyl(YF, YF + 36, cx, zc, r * 0.34, 16);
    for (let i = 0; i < 10; i++) { const th = (i / 10) * m.PI * 2; a.ycyl(YF + 1, YF + 38, cx + m.cos(th) * r * 0.62, zc + m.sin(th) * r * 0.62, 2.8, 6); }
    a.cyl(cx, YB - 60, zc - r, zc - r - 6, 4, 6);
    a.log('Added the wall plate and ball joint, a cylindrical body, sunshade, lens ring with an IR LED ring, and a cable gland (plan and 3D).');
  } else {
    a.outline(); a.cyl(cx, cy, Z0, Z0 + H * 0.12, W * 0.46, 32); a.circ(cx, cy, W * 0.46);
    a.cone(cx, cy, Z0 + H * 0.12, Z0 + H * 0.3, W * 0.28, W * 0.2, 24); a.cyl(cx, cy, Z0 + H * 0.3, Z0 + H * 0.36, W * 0.3, 28);
    a.ell(cx, cy, Z0 + H * 0.64, W * 0.34, W * 0.34, W * 0.34, 20, 12); a.ycyl(cy - W * 0.38, cy - W * 0.24, cx, Z0 + H * 0.64, W * 0.17, 20); a.ycyl(cy - W * 0.4, cy - W * 0.34, cx, Z0 + H * 0.64, W * 0.09, 14);
    a.cyl(cx + W * 0.2, cy - W * 0.2, Z0 + H * 0.12, Z0 + H * 0.13, 3, 6);
    a.log('Added the round stand, a swivel neck, a spherical head with a large lens, and a status LED (plan and 3D).');
  }
}

/** a smart hub: a disc puck with an LED ring and base, or a bridge: slab with antennas and a port row */
function hubdev(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  if (v.kind === 'puck') {
    a.cyl(cx, cy, Z0, Z0 + H * 0.2, W * 0.5, 40); a.cyl(cx, cy, Z0 + H * 0.2, Z1 - 4, W * 0.46, 40); a.cone(cx, cy, Z1 - 4, Z1, W * 0.46, W * 0.4, 40); a.circ(cx, cy, W / 2); a.circ(cx, cy, W * 0.3, 'EQUIP-DETAIL');
    for (let i = 0; i < 24; i++) { const th = (i / 24) * m.PI * 2; a.cyl(cx + m.cos(th) * W * 0.36, cy + m.sin(th) * W * 0.36, Z1 - 0.8, Z1 + 0.1 > Z1 ? Z1 : Z1, 1.4, 5); }
    a.ycyl(YF + 0.5, YF + 4, cx, Z0 + H * 0.4, 1.6, 6);
    a.log('Added the round puck with a base band, a domed top with a ring of LEDs and a front indicator (plan and 3D).');
  } else {
    a.outline(); slab(a, X0 + 4, YF + 8, X1 - 4, YB - 6, Z0 + 3, Z0 + H * 0.5, 12);
    for (const s of [-1, 1]) { const x = cx + s * W * 0.34; a.box(x - 8, YB - 24, Z0 + H * 0.5 - 6, x + 8, YB - 8, Z0 + H * 0.5 + 12); a.tube([[x, YB - 16, Z0 + H * 0.5 + 12], [x, YB - 16, Z1 - 3], [x, YB - 16, Z1]], [5, 5, 3.6], 8); a.circ(x, YB - 16, 5, 'EQUIP-DETAIL'); }
    for (let i = 0; i < 4; i++) a.cyl(cx - W * 0.2 + i * 12, YF + 8, Z0 + H * 0.3, Z0 + H * 0.3 + 1, 2, 6);
    a.box(cx + W * 0.1, YF + 2, Z0 + H * 0.15, cx + W * 0.3, YF + 8, Z0 + H * 0.42); feet(a, X0 + 14, X1 - 14, YF + 22, YB - 18, 7, 3);
    a.log('Added the low body with front LEDs and a port, two hinged antennas and feet (plan and 3D).');
  }
}

/** a video doorbell or video intercom panel: back plate, rounded face plate, camera lens, a lit button, a speaker grille (and a keypad) */
function bell(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline(); plate(a, X0, Z0, X1, Z1, YB - 8, YB, 8); plate(a, X0 + 3, Z0 + 3, X1 - 3, Z1 - 3, YF + 8, YB - 8, W * 0.2); a.poly(rr(X0 + 3, YF + 8, X1 - 3, YB - 8, 4));
  a.box(X0 + 6, YF + 4, Z0 + 6, X1 - 6, YF + 10, Z1 - 6); a.box(X0 + 10, YF + 2, Z0 + H * 0.04, X1 - 10, YF + 7, Z0 + H * 0.07);
  const lz = Z1 - H * 0.16; a.ycyl(YF + 2, YF + 10, cx, lz, W * 0.2, 22); a.ycyl(YF, YF + 10, cx, lz, W * 0.12, 16); a.ycyl(YF - 1, YF + 10, cx, lz, W * 0.05, 10);
  if (v.motion) a.ycyl(YF + 2, YF + 8, cx, Z1 - H * 0.04, W * 0.06, 10);
  const bz = Z0 + H * 0.2; if (v.keys) { for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) a.box(cx - W * 0.28 + c * W * 0.2 + 1, YF, Z0 + H * 0.1 + r * H * 0.075, cx - W * 0.28 + (c + 1) * W * 0.2 - 3, YF + 8, Z0 + H * 0.1 + (r + 1) * H * 0.075 - 3); }
  else { a.ycyl(YF + 3, YF + 11, cx, bz, W * 0.18, 20); ringXZ(a, cx, bz, W * 0.23, 2.4, YF + 6, 24, 5); }
  ribs(a, cx - W * 0.22, Z0 + H * (v.keys ? 0.45 : 0.4), cx + W * 0.22, Z0 + H * (v.keys ? 0.6 : 0.52), YF + 2, 4, true, 1.8, 6);
  a.log(`Added the back plate, a rounded face with a camera lens${v.motion ? ' and a motion window' : ''}, a speaker grille${v.keys ? ' and a twelve-key keypad' : ' and a ringed call button'} (plan and 3D).`);
}

/** a smart thermostat: round (back plate, housing, glass face and a ticked ring) or rectangular (slab with a screen and three buttons) */
function thermo(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cz = Z0 + H / 2;
  if (v.kind === 'round') {
    a.outline(); a.ycyl(YB - 6, YB, cx, cz, W * 0.5, 36); a.ycyl(YF + 10, YB - 6, cx, cz, W * 0.46, 36); a.ycyl(YF + 3, YF + 11, cx, cz, W * 0.4, 36); a.ycyl(YF, YF + 4, cx, cz, W * 0.3, 32);
    for (let i = 0; i < 24; i++) { const th = (i / 24) * m.PI * 2; a.box(cx + m.cos(th) * W * 0.34 - 1, YF + 3, cz + m.sin(th) * W * 0.34 - 1, cx + m.cos(th) * W * 0.34 + 1, YF + 5, cz + m.sin(th) * W * 0.34 + 1); }
    ringXZ(a, cx, cz, W * 0.44, 2.5, YF + 8, 36, 6);
    a.circ(cx, cz, W * 0.3, 'EQUIP-DETAIL');
    a.log('Added the wall back plate, a round housing, a ticked ring around the glass face and the display disc (plan and 3D).');
  } else {
    a.outline(); plate(a, X0, Z0, X1, Z1, YB - 6, YB, 6); plate(a, X0 + 2, Z0 + 2, X1 - 2, Z1 - 2, YF + 10, YB - 6, 10); plate(a, X0 + 6, Z0 + 6, X1 - 6, Z1 - 6, YF + 3, YF + 11, 8); a.box(X0 + 12, YF, Z0 + 14 + (H - 28) * 0.2, X1 - 12, YF + 4, Z1 - 14);
    for (let i = 0; i < 3; i++) a.ycyl(YF + 1, YF + 6, cx - W * 0.22 + i * W * 0.22, Z0 + H * 0.12, 4, 8);
    a.log('Added the wall plate, a slim housing with a framed screen and three touch keys (plan and 3D).');
  }
}

/** a smart plug on an outlet plate: a plug body with a status LED, a button and a pass-through socket face, prongs through the plate */
function plug(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, pt = 5;
  a.outline(); plate(a, X0, Z0, X1, Z1, YB - pt, YB, 12);
  for (const zz of [Z0 + H * 0.26, Z0 + H * 0.74]) { a.ycyl(YB - pt - 0.5, YB - pt, cx, zz, W * 0.1, 14); }
  const bz = Z0 + H * 0.5, bh = H * 0.44, bw = W * v.bw, bd = YB - pt - 8;
  for (const dx of [-8, 8]) a.box(cx + dx - 3, bd, bz + bh * 0.5 - 8, cx + dx + 3, YB - pt, bz + bh * 0.5 + 8);
  a.prism(rr(cx - bw / 2, bd - v.dep, cx + bw / 2, bd, 8), bz, bz + bh); a.poly(rr(cx - bw / 2, bd - v.dep, cx + bw / 2, bd, 8));
  a.ycyl(bd - v.dep - 4, bd - v.dep, cx, bz + bh * 0.72, bw * 0.12, 14); a.ycyl(bd - v.dep - 1, bd - v.dep, cx, bz + bh * 0.72, 1.5, 6);
  a.box(cx - bw * 0.3, bd - v.dep - 3, bz + bh * 0.2, cx + bw * 0.3, bd - v.dep, bz + bh * 0.4);
  for (const dx of [-7, 7]) a.box(cx + dx - 1.5, bd - v.dep - 2, bz + bh * 0.46 - 4, cx + dx + 1.5, bd - v.dep, bz + bh * 0.46 + 4);
  if (v.cover) a.box(cx - bw / 2 - 3, bd - v.dep - 8, bz - 6, cx + bw / 2 + 3, bd - v.dep, bz);
  a.log(`Added the duplex outlet plate, a plug body with a status LED, a button and a pass-through socket face${v.cover ? ', and a weather hood' : ''}, and two prongs through the plate (plan and 3D).`);
}

/** a tracker: a round tag (disc with key ring, speaker dot) or a card tracker, standing on a display base */
function tracker(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline(); base(a, X0, YF, X1, YB, Z0, Z0 + 6); a.box(X0 + W * 0.1, YF, Z0 + 6, X1 - W * 0.1, YF + 6, Z0 + 14);
  if (v.kind === 'tag') {
    const r = W * 0.36, zc = Z0 + 14 + r; a.ycyl(YF + 12, YF + 12 + v.t, cx, zc, r, 32); a.ycyl(YF + 9, YF + 12, cx, zc, r * 0.82, 28); a.ycyl(YF + 8, YF + 10, cx, zc, r * 0.2, 12);
    ringXZ(a, cx, zc + r + W * 0.05, W * 0.08, 2.6, YF + 12 + v.t / 2, 16, 6); a.cyl(cx, cy, Z0 + 6, Z0 + 7, 0.1, 3);
    a.log('Added the display base, a round tag with a raised centre disc and a key-ring loop (plan and 3D).');
  } else {
    const zc = Z0 + 14; plate(a, X0 + 2, zc, X1 - 2, Z1 - 2, YF + 12, YF + 12 + v.t, 6); plate(a, X0 + 6, zc + 4, X1 - 6, Z1 - 6, YF + 10, YF + 12, 4); a.ycyl(YF + 8, YF + 12, cx, Z0 + H * 0.35, W * 0.1, 14);
    a.log('Added the display base and a card-shaped tracker with a recessed face and a speaker dot (plan and 3D).');
  }
}

/** a wall sensor: a PIR motion sensor (egg body with a lens window on a bracket), a door contact pair, or a desktop temperature sensor with a display */
function sensor(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline();
  if (v.kind === 'pir') {
    a.box(cx - 16, YB - 16, Z0 + 2, cx + 16, YB, Z0 + H * 0.5); a.tube([[cx, YB - 14, Z0 + H * 0.32], [cx, YB - 26, Z0 + H * 0.4]], [9, 8], 8);
    a.ell(cx, cy - 4, Z0 + H * 0.56, W * 0.42, D * 0.34, H * 0.4, 22, 12); a.box(cx - W * 0.22, YF + 3, Z0 + H * 0.35, cx + W * 0.22, YF + 11, Z0 + H * 0.78);
    ringXZ(a, cx, Z0 + H * 0.56, W * 0.26, 1.6, YF + 3, 24, 5); a.ycyl(YF + 3, YF + 8, cx + W * 0.3, Z0 + H * 0.22, 1.8, 6);
    a.log('Added the wall bracket and ball joint, an egg-shaped body, a framed lens window and a status LED (plan and 3D).');
  } else if (v.kind === 'contact') {
    a.box(X0, cy - 2, Z0, X1, YB, Z0 + 4);
    slab(a, X0 + 2, YF + D * 0.1, X0 + W * 0.58, YB - 2, Z0 + 4, Z1, 6); slab(a, X0 + W * 0.7, YF + D * 0.12, X1 - 2, YB - 2, Z0 + 4, Z0 + H * 0.8, 5);
    a.ycyl(YF + D * 0.1 - 1, YF + D * 0.1 + 1.5, X0 + W * 0.12, Z0 + H * 0.78, 1.3, 6);
    a.log('Added the sensor housing with a status LED and the smaller magnet piece with its gap, on a strip of door frame (plan and 3D).');
  } else if (v.kind === 'temp') {
    base(a, X0 + W * 0.15, YF + D * 0.1, X1 - W * 0.15, YB, Z0, Z0 + 5); const i0 = a.t.length;
    plate(a, X0, Z0 + 5, X1, Z1, YF + D * 0.2, YF + D * 0.2 + 12, 8); plate(a, X0 + 4, Z0 + 5 + H * 0.2, X1 - 4, Z1 - 4, YF + D * 0.2 - 1, YF + D * 0.2 + 0.5, 4); a.box(X0 + W * 0.2, YF + D * 0.2 - 1.4, Z0 + 5 + H * 0.3, X1 - W * 0.2, YF + D * 0.2, Z1 - H * 0.12);
    ribs(a, X0 + 8, Z0 + 8, X1 - 8, Z0 + 5 + H * 0.15, YF + D * 0.2 - 1.5, 3, true, 1.2, 2);
    lean(a, i0, 0.17, YF + D * 0.2, Z0 + 5);
    a.log('Added the stand, a leaned face with a framed display and vent slits (plan and 3D).');
  } else {   // smoke alarm: ceiling disc seen from the side
    const r = W / 2;
    a.cyl(cx, cy, Z1 - H * 0.12, Z1, r * 1.02, 40); a.cyl(cx, cy, Z0 + H * 0.12, Z1 - H * 0.12, r * 0.95, 40); a.cone(cx, cy, Z0 + 2, Z0 + H * 0.12, r * 0.7, r * 0.95, 40); a.cyl(cx, cy, Z0, Z0 + 2, r * 0.3, 20);
    for (let i = 0; i < 30; i++) { const th = (i / 30) * m.PI * 2; a.box(cx + m.cos(th) * r * 0.95 - 3, cy + m.sin(th) * r * 0.95 - 3, Z0 + H * 0.3, cx + m.cos(th) * r * 0.95 + 3, cy + m.sin(th) * r * 0.95 + 3, Z0 + H * 0.65); }
    a.cyl(cx, cy, Z0, Z0 + 3, r * 0.25, 18); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.3, 'EQUIP-DETAIL');
    a.log('Added the ceiling ring, a drum body with a ring of vent slots, a domed face with a test button and an indicator (plan and 3D).');
  }
}

/** a smart bulb: a threaded base, a collar, a lofted glass bulb with an LED disc */
function bulb(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, br = W / 2, bl = v.bl;
  a.cyl(cx, cy, Z0, Z0 + 3, br * 0.4, 18);
  for (let i = 0; i < 4; i++) a.cyl(cx, cy, Z0 + 3 + i * 4, Z0 + 5 + i * 4, br * (i % 2 ? 0.52 : 0.55), 20);
  a.cyl(cx, cy, Z0 + 19, Z0 + bl * 0.2, br * 0.55, 20);
  const secs = v.profile.map(([f, r]) => ({ z: Z0 + bl * 0.2 + (H - bl * 0.2) * f, x: cx, y: cy, rx: br * r + 0.01, ry: br * r + 0.01 })); a.add(loft(secs, 22));
  a.cyl(cx, cy, Z0 + bl * 0.2 + 4, Z0 + bl * 0.2 + 7, br * 0.5, 16); a.circ(cx, cy, br); a.circ(cx, cy, br * 0.5, 'EQUIP-DETAIL');
  a.log(`Added the threaded base, a collar and a lofted ${v.name} glass bulb with an LED disc inside (plan and 3D).`);
}

/** a smart lock: round back plate, a body with a key cylinder and a twelve-key pad, or an inside body with a thumb turn and a battery cover */
function lock(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline(); a.ycyl(YB - 6, YB, cx, Z0 + H * 0.5, W * 0.5, 36);
  if (v.kind === 'key') {
    plate(a, X0, Z0, X1, Z1, YF + 6, YB - 6, 12); plate(a, X0 + 4, Z0 + 4, X1 - 4, Z1 - 4, YF + 2, YF + 8, 10);
    a.ycyl(YF, YF + 6, cx, Z1 - H * 0.12, W * 0.16, 18); a.ycyl(YF - 1, YF + 6, cx, Z1 - H * 0.12, W * 0.06, 10);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) a.box(X0 + W * 0.17 + c * W * 0.22, YF, Z0 + H * 0.08 + r * H * 0.15, X0 + W * 0.17 + c * W * 0.22 + W * 0.18, YF + 7, Z0 + H * 0.08 + r * H * 0.15 + H * 0.12);
    a.log('Added the round back plate, a rounded body, a key cylinder at the top and a twelve-key keypad (plan and 3D).');
  } else {
    plate(a, X0 + 2, Z0 + H * 0.2, X1 - 2, Z1, YF + 10, YB - 6, 14); plate(a, X0 + W * 0.25, Z0, X1 - W * 0.25, Z0 + H * 0.3, YF + 14, YB - 6, 10);
    a.ycyl(YF + 4, YF + 12, cx, Z0 + H * 0.58, W * 0.34, 28); a.box(cx - W * 0.28, YF, Z0 + H * 0.58 - 5, cx + W * 0.28, YF + 8, Z0 + H * 0.58 + 5);
    a.box(X0 + W * 0.2, YF + 6, Z0 + H * 0.8, X1 - W * 0.2, YF + 12, Z1 - 6); a.ycyl(YF + 4, YF + 12, cx, Z0 + H * 0.85, 2, 6);
    a.log('Added the back plate, an inside body, a large round thumb turn with a lever, and a battery cover with a latch (plan and 3D).');
  }
}

/** a wall irrigation controller: housing with a hinged cover, an LCD, a dial and buttons, and a terminal strip under a lower flap */
function sprink(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline(); plate(a, X0, Z0, X1, Z1, YF + 6, YB, 10); plate(a, X0 + 4, Z0 + H * 0.3, X1 - 4, Z1 - 4, YF + 2, YF + 8, 8);
  a.box(X0 + W * 0.15, YF, Z0 + H * 0.58, X1 - W * 0.15, YF + 4, Z1 - H * 0.1); a.ycyl(YF, YF + 8, cx - W * 0.22, Z0 + H * 0.44, W * 0.1, 18); a.ycyl(YF - 1, YF + 8, cx - W * 0.22, Z0 + H * 0.44, W * 0.04, 8);
  for (let i = 0; i < 4; i++) a.ycyl(YF, YF + 8, cx + W * 0.05 + i * W * 0.12, Z0 + H * 0.44, 4, 8);
  plate(a, X0 + 4, Z0 + 4, X1 - 4, Z0 + H * 0.3, YF + 3, YF + 9, 8); for (let i = 0; i < v.z; i++) a.box(X0 + 12 + i * ((W - 24) / v.z), YF + 3, Z0 + 10, X0 + 12 + (i + 0.78) * ((W - 24) / v.z), YF + 6, Z0 + H * 0.2);
  a.box(cx - 6, YB - 6, Z0, cx + 6, YB, Z0 + 8);
  a.log(`Added the wall housing with a hinged cover, an LCD, a dial and ${4} buttons, and a lower flap over ${v.z} zone terminals (plan and 3D).`);
}

/** a desktop air-quality monitor: leaned slab with a round display, vent ribs and feet */
function airq(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline(); feet(a, X0 + 14, X1 - 14, YF + D * 0.2, YB - D * 0.2, 6, 5);
  const i0 = a.t.length; plate(a, X0, Z0 + 5, X1, Z1, YF + D * 0.2, YF + D * 0.2 + 22, 14);
  a.ycyl(YF + D * 0.2 - 3, YF + D * 0.2 + 1, cx, Z0 + 5 + (H - 5) * 0.58, W * 0.3, 28); a.ycyl(YF + D * 0.2 - 4.5, YF + D * 0.2 - 2, cx, Z0 + 5 + (H - 5) * 0.58, W * 0.24, 24);
  ribs(a, X0 + W * 0.16, Z0 + 12, X1 - W * 0.16, Z0 + 5 + (H - 5) * 0.22, YF + D * 0.2 - 2, 4, true, 1.6, 3);
  lean(a, i0, 0.17, YF + D * 0.2, Z0 + 5); a.rect(X0, YF + D * 0.2, X1, YF + D * 0.2 + 22, 'EQUIP-DETAIL');
  a.log('Added the feet, a leaned housing with a round display ring and vent slits (plan and 3D).');
}

const IOT = [
  fam({ cat: 'tech/iot', title: 'Generic security camera',
    desc: (v) => v.kind === 'dome' ? 'Indoor dome camera: a round base with a mounting ring, a clear dome with a ball lens inside and a status LED.' : v.kind === 'bullet' ? 'Bullet camera: a wall plate and ball joint, a cylindrical body with a sunshade, a lens ring with an IR LED ring and a cable gland.' : 'Pan-tilt camera on a round stand: a swivel neck, a spherical head with a large lens and a status LED.',
    vs: [['indoor dome', 4.2, 4.2, 3.4, 0, { kind: 'dome' }], ['outdoor bullet, on wall bracket', 3.4, 7.5, 4.6, 0, { kind: 'bullet' }], ['pan-tilt, desk stand', 3.8, 3.8, 5.2, 0, { kind: 'ptz' }]],
    build: camera }),
  fam({ cat: 'tech/iot', title: 'Generic smart hub',
    desc: (v) => v.kind === 'puck' ? 'Smart hub puck: a round body with a base band, a domed top with a ring of LEDs and a front indicator.' : 'Smart hub bridge: a low body with front LEDs and a port, two hinged antennas and feet.',
    vs: [['puck', 3.9, 3.9, 1.3, 0, { kind: 'puck' }], ['bridge, two antennas', 4.6, 3.6, 5.2, 0, { kind: 'bridge' }]],
    build: hubdev }),
  fam({ cat: 'tech/iot', title: 'Generic video doorbell',
    desc: (v) => `Video doorbell: a back plate and rounded face plate, a camera lens${v.motion ? ', a motion window' : ''}, a speaker grille and a ringed call button.`,
    vs: [['slim', 1.8, 1.0, 4.7, 0, { motion: 0 }], ['wide, with motion window', 2.5, 1.2, 5.6, 0, { motion: 1 }]],
    build: bell }),
  fam({ cat: 'tech/iot', title: 'Generic video intercom panel',
    desc: 'Video intercom panel: a back plate and rounded face plate, a camera lens, a speaker grille and a twelve-key keypad.',
    vs: [['flush, keypad', 3.2, 1.0, 7.4, 0, { keys: 1 }]],
    build: bell }),
  fam({ cat: 'tech/iot', title: 'Generic smart thermostat',
    desc: (v) => v.kind === 'round' ? 'Round thermostat: a wall back plate, a round housing, a ticked ring around the glass face and the display disc.' : 'Rectangular thermostat: a wall plate, a slim housing with a framed screen and three touch keys.',
    vs: [['round, 3.3 in', 3.3, 1.3, 3.3, 0, { kind: 'round' }], ['rectangular, touch screen', 3.1, 1.0, 4.4, 0, { kind: 'rect' }]],
    build: thermo }),
  fam({ cat: 'tech/iot', title: 'Generic smart plug',
    desc: (v) => `Smart plug on a duplex outlet plate: a plug body with a status LED, a button and a pass-through socket face${v.cover ? ' and a weather hood' : ''}, prongs through the plate.`,
    vs: [['mini', 2.9, 1.7, 4.6, 0, { bw: 0.5, dep: 24 }], ['outdoor, with weather hood', 3.1, 2.4, 4.6, 0, { bw: 0.6, dep: 36, cover: 1 }]],
    build: plug }),
  fam({ cat: 'tech/iot', title: 'Generic item tracker',
    desc: (v) => v.kind === 'tag' ? 'Item tracker tag on a display base: a round tag with a raised centre disc and a key-ring loop.' : 'Card tracker on a display base: a card-shaped body with a recessed face and a speaker dot.',
    vs: [['round tag', 1.6, 1.2, 2.5, 0, { kind: 'tag', t: 7 }], ['card, wallet size', 2.5, 1.2, 3.8, 0, { kind: 'card', t: 3 }]],
    build: tracker }),
  fam({ cat: 'tech/iot', title: 'Generic smart-home sensor',
    desc: (v) => ({ pir: 'Motion sensor: a wall bracket and ball joint, an egg-shaped body, a framed lens window and a status LED.', contact: 'Door and window contact sensor: a sensor housing with a status LED and a smaller magnet piece with its gap, on a strip of door frame.', temp: 'Desktop temperature and humidity sensor: a stand, a leaned face with a framed display and vent slits.', smoke: 'Smoke alarm: a ceiling ring, a drum body with a ring of vent slots, a domed face with a test button and an indicator.' })[v.kind],
    vs: [['motion, wall bracket', 2.2, 2.2, 3.1, 0, { kind: 'pir' }], ['door contact pair', 3.2, 0.8, 1.4, 0, { kind: 'contact' }], ['temperature, desktop', 2.2, 2.4, 2.6, 0, { kind: 'temp' }], ['smoke alarm, ceiling', 5.5, 5.5, 1.9, 0, { kind: 'smoke' }]],
    build: sensor }),
  fam({ cat: 'tech/iot', title: 'Generic smart bulb',
    desc: (v) => `Smart bulb: a threaded base, a collar and a lofted ${v.name} glass bulb with an LED disc inside.`,
    vs: [['A-shape, 4.4 in', 2.4, 2.4, 4.4, 0, { name: 'pear-shaped', bl: 36, profile: [[0, 0.42], [0.1, 0.55], [0.28, 0.85], [0.5, 1], [0.72, 0.96], [0.88, 0.76], [0.97, 0.4], [1, 0.12]] }], ['reflector, 5 in', 3.75, 3.75, 5, 0, { name: 'reflector', bl: 36, profile: [[0, 0.4], [0.1, 0.5], [0.4, 0.8], [0.75, 0.98], [0.95, 1], [1, 0.96]] }]],
    build: bulb }),
  fam({ cat: 'tech/iot', title: 'Generic smart door lock',
    desc: (v) => v.kind === 'key' ? 'Smart lock, outside unit: a round back plate, a rounded body, a key cylinder at the top and a twelve-key keypad.' : 'Smart lock, inside unit: a back plate, an inside body, a large round thumb turn with a lever, and a battery cover with a latch.',
    vs: [['keypad, outside', 2.6, 1.2, 5.6, 0, { kind: 'key' }], ['thumb turn, inside', 2.8, 1.4, 6, 0, { kind: 'turn' }]],
    build: lock }),
  fam({ cat: 'tech/iot', title: 'Generic irrigation controller',
    desc: (v) => `Wall irrigation controller: a housing with a hinged cover, an LCD, a dial and four buttons, and a lower flap over ${v.z} zone terminals.`,
    vs: [['6 zone', 6.2, 2, 7, 0, { z: 6 }]],
    build: sprink }),
  fam({ cat: 'tech/iot', title: 'Generic air quality monitor',
    desc: 'Desktop air quality monitor: feet, a leaned housing with a round display ring and vent slits.',
    vs: [['desktop, 3 in', 3.2, 2.2, 3.6, 0, {}], ['desktop, 4.5 in', 4.6, 2.6, 5, 0, {}]],
    build: airq }),
];

// ------------------------------------------------------------------------------------------ wearables
/** a smart watch standing on its strap: case, bezel, crystal, crown and buttons, lugs, two strap halves with a buckle and holes, and a foot */
function watch(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cz = Z0 + H * 0.5, cw = v.cw, ct = D * 0.62, y0 = YF + 2;
  a.outline(); a.box(cx - 8, YB - 8, Z0, cx + 8, YB, Z0 + 4);
  const sw = v.sw, sy0 = y0 + ct - 4;
  for (const dir of [1, -1]) { const zs = dir > 0 ? cz + cw / 2 - 2 : Z0 + 4, ze = dir > 0 ? Z1 - 3 : cz - cw / 2 + 2; a.box(cx - sw / 2, sy0, zs, cx + sw / 2, sy0 + 3.5, ze); a.box(cx - sw / 2 - 1, sy0 - 1, zs, cx + sw / 2 + 1, sy0, zs + 5); }
  if (v.round) { a.ycyl(y0, y0 + ct, cx, cz, cw / 2, 40); a.ycyl(y0 - 3, y0 + 1, cx, cz, cw / 2 - 1.5, 40); a.ycyl(y0 - 4.2, y0 - 2, cx, cz, cw / 2 - 4.5, 40); a.circ(cx, cz, cw / 2); }
  else { plate(a, cx - cw / 2, cz - cw * 0.58, cx + cw / 2, cz + cw * 0.58, y0, y0 + ct, cw * 0.22); plate(a, cx - cw / 2 + 1.5, cz - cw * 0.58 + 1.5, cx + cw / 2 - 1.5, cz + cw * 0.58 - 1.5, y0 - 3, y0 + 1, cw * 0.2); plate(a, cx - cw / 2 + 4, cz - cw * 0.58 + 4, cx + cw / 2 - 4, cz + cw * 0.58 - 4, y0 - 4.2, y0 - 2, cw * 0.16); }
  a.xcyl(cx + cw / 2, cx + cw / 2 + 4, y0 + ct * 0.42, cz + cw * 0.12, 3.8, 10); a.box(cx + cw / 2, y0 + ct * 0.5, cz - cw * 0.2, cx + cw / 2 + 2.6, y0 + ct * 0.78, cz - cw * 0.06);
  a.ycyl(y0 + ct, y0 + ct + 3, cx, cz, cw * 0.18, 16);
  const bk = Z1 - 3 - 14; a.frame(cx - sw / 2 - 2, bk, cx + sw / 2 + 2, Z1 - 3, sy0 + 3.5, sy0 + 6.5, 2.6); a.box(cx - 1, sy0 + 3.5, bk, cx + 1, sy0 + 6.5, Z1 - 3 - 2);
  for (let i = 0; i < 5; i++) a.ycyl(sy0 - 0.5, sy0 + 0.5, cx, Z0 + 12 + i * 7, 1.2, 6);
  a.log(`Added the ${v.round ? 'round' : 'square'} case with bezel and crystal, a crown and button, lugs, two strap halves with a buckle and size holes, and a back foot (plan and 3D).`);
}

/** a fitness band worn as a loop: a flat strap ring, a pill module on the top front, a clasp and a charging foot */
function band(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, rz = (H - 8) / 2, ry = (D - 6) / 2, zc = Z0 + 4 + rz, yc = cy;
  a.outline(); a.box(cx - W * 0.3, YB - 10, Z0, cx + W * 0.3, YB, Z0 + 4); a.box(cx - W * 0.3, YF + 2, Z0, cx + W * 0.3, YF + 6, Z0 + 4);
  loopYZ(a, cx - W * 0.42, cx + W * 0.42, yc, zc, ry, rz, 3.2, 28);
  const mw = v.mw, mh = v.mh;
  plate(a, cx - mw / 2, zc + rz - mh * 0.4, cx + mw / 2, zc + rz + mh * 0.6, yc - ry - 4, yc - ry + 2, 7); a.box(cx - mw / 2 + 3, yc - ry - 4.6, zc + rz - mh * 0.4 + 3, cx + mw / 2 - 3, yc - ry - 3.6, zc + rz + mh * 0.6 - 3);
  a.box(cx + mw / 2, yc - ry - 2.6, zc + rz + 2, cx + mw / 2 + 1.8, yc - ry - 0.4, zc + rz + 10);
  a.box(cx - W * 0.2, yc + ry - 4, zc - rz, cx + W * 0.2, yc + ry + 1, zc - rz + 8);
  a.log(`Added the strap as a flat loop, a ${v.mw > 20 ? 'wide ' : ''}display module on the top with a bezel and a side button, a clasp plate, and a charging foot (plan and 3D).`);
}

/** glasses: two lens rims (rounded or round), a bridge, two temples running back with hinge blocks, nose pads; smart versions add a camera and a thicker touch temple */
function glasses(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, lh = H - 4, lw = v.round ? lh : (W - v.br) / 2 - 3, lz = Z0 + 2 + lh / 2;
  a.outline();
  for (const s of [-1, 1]) {
    const lx = cx + s * (v.br / 2 + lw / 2 - 1);
    if (v.round) { ringXZ(a, lx, lz, lh / 2 - 2, 1.9, YF + 4, 28, 6); a.ycyl(YF + 3.5, YF + 4.5, lx, lz, lh / 2 - 3, 28); a.ycyl(YF + 3, YF + 4, lx, lz, lh / 2 - 3, 28); }
    else { plate(a, lx - lw / 2, lz - lh / 2, lx + lw / 2, lz + lh / 2, YF + 2, YF + 8, lh * 0.3); plate(a, lx - lw / 2 + 4, lz - lh / 2 + 4, lx + lw / 2 - 4, lz + lh / 2 - 4, YF, YF + 3, lh * 0.22); }
    const hx = lx + s * (lw / 2 + 1); a.box(hx - 2.5, YF + 4, lz + lh * 0.15, hx + 2.5, YF + 12, lz + lh * 0.4);
    const tz = lz + lh * 0.25; a.box(hx + s * 2 - (s > 0 ? 0 : 5), YF + 10, tz - (v.smart ? 4 : 2), hx + s * 2 + (s > 0 ? 5 : 0), YB - 18, tz + (v.smart ? 4 : 2)); a.tube([[hx + s * 4, YB - 18, tz], [hx + s * 3, YB - 6, tz - 6], [hx + s * 1, YB - 1, tz - 22]], [v.smart ? 3 : 2, 2, 2], 6);
    a.cyl(cx + s * (v.br / 2 - 1), YF + 6, lz - lh * 0.25, lz - lh * 0.05, 1.6, 6); a.line(lx - lw / 2, cy, lx + lw / 2, cy, 'EQUIP-DETAIL');
    if (v.smart) a.ycyl(YF + 3, YF + 11, hx - s * 5, lz + lh * 0.38, 3, 10);
  }
  a.tube([[cx - v.br / 2 - 4, YF + 5, lz + lh * 0.18], [cx, YF + 5, lz + lh * 0.3], [cx + v.br / 2 + 4, YF + 5, lz + lh * 0.18]], [2.2, 2.2, 2.2], 6);
  a.log(`Added the ${v.round ? 'round' : 'rounded-rectangle'} lens rims, a bridge, nose pads, hinge blocks and two temples${v.smart ? ' with thicker touch arms and a camera dot' : ''} (plan and 3D).`);
}

/** earbuds with a charging case: a rounded case, an open lid, two buds (stem, in-ear or hook style) seated in cups */
function buds(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, ch = H * 0.46;
  a.outline(); slab(a, X0, YF, X1, YB, Z0, Z0 + ch, W * 0.28);
  prismX(a, [[YB - 4, Z0 + ch], [YB, Z0 + ch], [YB, Z1], [YB - 6, Z1]], X0 + 4, X1 - 4); a.xcyl(X0 + 6, X1 - 6, YB - 2, Z0 + ch, 3, 8); a.box(cx - 4, YF + 2, Z0 + ch * 0.5, cx + 4, YF + 4, Z0 + ch * 0.5 + 4);
  a.cyl(cx, YF + 3, Z0 + ch - 6, Z0 + ch - 5, 0.1, 3); a.ycyl(YF, YF + 3, cx, Z0 + ch * 0.28, 1.4, 6);
  for (const s of [-1, 1]) {
    const bx = cx + s * W * 0.26, by = cy - 2;
    a.cyl(bx, by, Z0 + ch - 2, Z0 + ch, W * 0.17, 20);
    if (v.style === 'stem') { a.ell(bx, by, Z0 + ch + 16, 11, 11, 13, 14, 8); a.tube([[bx + s * 2, by, Z0 + ch + 12], [bx + s * 3, by, Z0 + ch + 6], [bx + s * 3, by, Z1 - 2]], [3.4, 3.2, 3], 8); a.ell(bx - s * 1, by - 6, Z0 + ch + 16, 5, 6, 6, 8, 5); }
    else if (v.style === 'in') { a.ell(bx, by, Z0 + ch + 12, 11, 11, 12, 14, 8); a.cyl(bx, by, Z0 + ch + 20, Z1 - 3, 4.4, 10); a.ell(bx, by, Z1 - 4, 5, 5, 4, 10, 5); }
    else { a.ell(bx, by, Z0 + ch + 12, 10, 10, 11, 12, 8); const pts = []; for (let i = 0; i <= 8; i++) { const th = (i / 8) * m.PI; pts.push([bx - s * 14 * (1 - m.cos(th)) * 0.9, by - 2, Z0 + ch + 12 + (Z1 - Z0 - ch - 18) * m.sin(th)]); } a.tube(pts, pts.map(() => 2.2), 6); }
  }
  a.log(`Added the rounded case with a hinged open lid and a status LED, two cups and two ${v.style === 'stem' ? 'stem' : v.style === 'in' ? 'in-ear' : 'ear-hook'} buds seated in them (plan and 3D).`);
}

/** a VR headset on a display stand: visor with lens bumps, face cushion, an elastic head strap loop and a top strap */
function vrset(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, vz0 = Z0 + H * 0.3, vh = H * 0.6, vd = v.vd, vy0 = YF + 6;
  a.outline(); base(a, cx - W * 0.3, cy - D * 0.2, cx + W * 0.3, cy + D * 0.2, Z0, Z0 + 10); a.cyl(cx, cy, Z0 + 10, vz0 + 8, 14, 10); a.box(cx - 40, vy0 + 6, vz0 - 2, cx + 40, vy0 + vd - 4, vz0 + 10);
  plate(a, cx - W * 0.44, vz0, cx + W * 0.44, vz0 + vh, vy0, vy0 + vd, vh * 0.3); a.box(cx - W * 0.38, vy0 - 2, vz0 + vh * 0.12, cx + W * 0.38, vy0, vz0 + vh * 0.88);
  for (const s of [-1, 1]) { a.ycyl(vy0 - 5, vy0 - 1, cx + s * W * 0.22, vz0 + vh * 0.52, vh * 0.13, 16); a.ycyl(vy0 - 5.5, vy0 - 4, cx + s * W * 0.34, vz0 + vh * 0.84, 3, 8); }
  a.ycyl(vy0 - 5, vy0 - 3, cx, vz0 + vh * 0.88, 3, 8); for (let i = 0; i < 3; i++) a.ycyl(vy0 - 4, vy0 - 2, cx - 12 + i * 12, vz0 + vh * 0.12, 1.4, 6);
  prismY(a, rr(cx - W * 0.36, vz0 + vh * 0.1, cx + W * 0.36, vz0 + vh * 0.9, vh * 0.28), vy0 + vd, vy0 + vd + 14); a.box(cx - 10, vy0 + vd + 14, vz0 + vh * 0.5, cx + 10, vy0 + vd + 22, vz0 + vh * 0.8);
  for (const s of [-1, 1]) { const x = cx + s * W * 0.44, ys = [[vy0 + vd * 0.6, vz0 + vh * 0.52], [YB - 70, vz0 + vh * 0.52], [YB - 26, vz0 + vh * 0.55]]; a.tube([[x, ys[0][0], ys[0][1]], [x + s * 2, ys[1][0], ys[1][1]], [x * 0.6, YB - 8, ys[2][1]]], [9, 8, 7], 8); }
  const tz = vz0 + vh; a.tube([[cx, vy0 + vd * 0.5, tz], [cx, vy0 + vd + 80, tz + 14], [cx, YB - 24, vz0 + vh * 0.7]], [8, 7, 6], 8); a.box(cx - W * 0.2, YB - 22, vz0 + vh * 0.35, cx + W * 0.2, YB - 6, vz0 + vh * 0.7);
  a.log('Added the display stand, a visor with two lens bumps and tracking dots, a face cushion with a nose cut, a side head strap joined at the back with a pad and a top strap (plan and 3D).');
}

/** a smart ring on a charging post: a thick ring band with a flat sensor bay, on a base with a post */
function ringcharge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, rr_ = v.rd / 2, zc = Z0 + 14 + rr_ + 2;
  a.outline(); base(a, X0, YF, X1, YB, Z0, Z0 + 8, 14); a.cyl(cx, cy, Z0 + 8, zc, 5, 10);
  arcBand(a, cx, zc, rr_, v.bt * 2.2, cy - 4 - v.bt, cy - 4 + v.bt, 0, 2 * m.PI, 28); a.ycyl(cy - 4 - v.bt - 1, cy - 4 - v.bt + 2, cx, zc + rr_, v.bt * 1.5, 12);
  a.box(cx - v.bt * 1.4, cy - 4 - v.bt * 1.6, zc + rr_ - v.bt * 1.4, cx + v.bt * 1.4, cy - 4 + v.bt * 1.6, zc + rr_ + v.bt * 1.4);
  a.ycyl(cy + 3, cy + 7, cx, zc - rr_ + 3, 3, 8);
  a.log('Added the charging base and a post, a thick ring band in a ring torus with a raised sensor bay, and a rear charging contact (plan and 3D).');
}

/** a neckband headset: a U-shaped band with a bulge at each end, a cable to two in-ear buds, and a stand */
function neckband(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, zt = Z1 - 14;
  a.outline(); a.cyl(cx, cy, Z0, Z0 + 8, W * 0.3, 24); a.cyl(cx, cy, Z0 + 8, zt - H * 0.55, 7, 10);
  const R = W * 0.42, pts = []; for (let i = 0; i <= 24; i++) { const th = m.PI + (i / 24) * m.PI; pts.push([cx + R * m.cos(th) * -1, cy, zt - H * 0.2 + R * m.sin(th) * -0.9 * 0 - R * 1.0 * (1 - m.sin((i / 24) * m.PI)) * -0 + 0]); }
  arcBand(a, cx, zt - H * 0.18, R, 12, cy - 9, cy + 9, m.PI, 2 * m.PI, 22);
  for (const s of [-1, 1]) { const x = cx + s * R; a.box(x - 11, cy - 12, zt - H * 0.18 - 3, x + 11, cy + 12, zt - H * 0.18 + 32); a.box(x - 11, cy - 11, zt - H * 0.18 + 6, x + 11, cy - 12.5, zt - H * 0.18 + 16); a.tube([[x, cy, zt - H * 0.18 + 32], [x + s * 6, cy, zt - H * 0.02]], [2.4, 2.4], 6); a.ell(x + s * 6, cy, zt, 6, 6, 7, 10, 6); }
  a.box(cx + R - 4, cy + 9, zt - H * 0.18 - 6, cx + R + 6, cy + 14, zt - H * 0.18 + 6);
  a.log('Added the stand, a half-ring neckband with two end modules carrying buttons, thin cables and two in-ear buds (plan and 3D).');
}

/** a clip-on wearable camera: a rounded body with a lens, an indicator, a record button, and a spring clip on the back */
function clipcam(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline(); base(a, X0, YF, X1, YB, Z0, Z0 + 5, 8);
  const i0 = a.t.length; plate(a, X0 + 2, Z0 + 5, X1 - 2, Z1, YF + 14, YF + 14 + v.t, 10);
  a.ycyl(YF + 8, YF + 16, cx - W * 0.12, Z0 + 5 + (H - 5) * 0.62, W * 0.2, 22); a.ycyl(YF + 6, YF + 16, cx - W * 0.12, Z0 + 5 + (H - 5) * 0.62, W * 0.12, 16);
  a.ycyl(YF + 12, YF + 16, X1 - W * 0.2, Z1 - (H - 5) * 0.14, 2.4, 8); a.ycyl(YF + 10, YF + 16, cx, Z0 + 5 + (H - 5) * 0.16, W * 0.12, 14);
  ribs(a, X1 - W * 0.4, Z0 + 12, X1 - W * 0.12, Z0 + 5 + (H - 5) * 0.28, YF + 12, 3, true, 1.2, 4);
  a.box(cx - 3, YF + 14 + v.t, Z0 + 14, cx + 3, YF + 14 + v.t + 14, Z1 - 8); a.box(cx - W * 0.28, YF + 14 + v.t + 8, Z0 + 14, cx + W * 0.28, YF + 14 + v.t + 18, Z0 + 26);
  lean(a, i0, 0.12, YF + 14, Z0 + 5);
  a.log('Added the display base, a leaned rounded body with a lens, a record button, a status light, a microphone grille and a spring clip on the back (plan and 3D).');
}

/** a pendant tracker or voice pendant: a capsule body on a short chain loop, on a display base */
function pendant(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline(); base(a, X0, YF, X1, YB, Z0, Z0 + 5, 8); a.cyl(cx, cy, Z0 + 5, Z1 - H * 0.42, 3, 8); a.cyl(cx, cy, Z1 - H * 0.42, Z1 - H * 0.4, 14, 14);
  const pr = W * 0.3, pz = Z1 - H * 0.4 - pr * 1.0 - 4;
  a.ycyl(cy - 5, cy + 5, cx, pz, pr, 28); a.ycyl(cy - 7.5, cy - 5, cx, pz, pr * 0.8, 24); a.ycyl(cy - 8.6, cy - 7, cx, pz, pr * 0.2, 10);
  ringXZ(a, cx, pz + pr + 2.2, 2.6, 1.3, cy, 14, 5);
  const ch = []; for (let i = 0; i <= 12; i++) { const th = (i / 12) * m.PI; ch.push([cx + (W * 0.42) * m.cos(th), cy, Z1 - 4 - (H * 0.42 - 8) * (1 - m.sin(th)) * 0 - (Z1 - (pz + pr + 6) - 4) * 0 + 0 * 0]); }
  a.log('Added the display base and a post, a round capsule pendant with a raised centre disc, a loop for the chain and an indicator (plan and 3D).');
}

const WEAR = [
  fam({ cat: 'tech/wearables', title: 'Generic smart watch',
    desc: (v) => `Smart watch standing on its strap: ${v.round ? 'round' : 'square'} case with bezel and crystal, a crown and button, lugs, two strap halves with a buckle and size holes, and a back foot.`,
    vs: [['round, 40 mm', 1.65, 0.7, 4.2, 0, { round: 1, cw: 40, sw: 18 }], ['round, 44 mm', 1.8, 0.75, 4.4, 0, { round: 1, cw: 44, sw: 20 }], ['round, 46 mm', 1.85, 0.75, 4.5, 0, { round: 1, cw: 46, sw: 22 }], ['square, 38 mm', 1.6, 0.7, 4.2, 0, { cw: 38, sw: 18 }], ['square, 45 mm', 1.85, 0.75, 4.6, 0, { cw: 45, sw: 22 }]],
    build: watch }),
  fam({ cat: 'tech/wearables', title: 'Generic fitness band',
    desc: (v) => `Fitness band worn as a flat strap loop with a ${v.mw > 20 ? 'wide ' : ''}display module on top, a side button, a clasp plate and a charging foot.`,
    vs: [['slim module', 1.1, 2.4, 2.8, 0, { mw: 14, mh: 34 }], ['wide module', 1.4, 2.5, 2.9, 0, { mw: 24, mh: 42 }], ['wide module, large loop', 1.5, 2.9, 3.3, 0, { mw: 26, mh: 46 }]],
    build: band }),
  fam({ cat: 'tech/wearables', title: 'Generic smart glasses',
    desc: (v) => `Glasses with ${v.round ? 'round' : 'rounded-rectangle'} lens rims, a bridge, nose pads, hinge blocks and two temples${v.smart ? ' with thicker touch arms and a camera dot' : ''}.`,
    vs: [['round lenses', 5.2, 5.5, 1.9, 0, { round: 1, br: 16, smart: 1 }], ['round lenses, large', 5.7, 5.7, 2.1, 0, { round: 1, br: 18, smart: 1 }], ['rounded, with camera arms', 5.8, 5.6, 1.9, 0, { br: 20, smart: 1 }], ['wide, with camera arms', 6.2, 5.8, 2.1, 0, { br: 22, smart: 1 }]],
    build: glasses }),
  fam({ cat: 'tech/wearables', title: 'Generic earbuds and case',
    desc: (v) => `Earbuds in an open charging case: a rounded case with a hinged lid and a status LED, two cups and two ${v.style === 'stem' ? 'stem' : v.style === 'in' ? 'in-ear' : 'ear-hook'} buds.`,
    vs: [['stem style', 2.3, 1.1, 3.0, 0, { style: 'stem' }], ['in-ear style', 2.2, 1.0, 2.8, 0, { style: 'in' }], ['ear-hook sport style', 2.6, 1.2, 3.1, 0, { style: 'hook' }]],
    build: buds }),
  fam({ cat: 'tech/wearables', title: 'Generic VR headset',
    desc: 'VR headset on a display stand: a visor with two lens bumps and tracking dots, a face cushion with a nose cut, a side head strap with a rear pad, and a top strap.',
    vs: [['standalone', 7.6, 9.6, 5.8, 0, { vd: 105 }], ['large visor', 8.4, 10.4, 6.4, 0, { vd: 125 }]],
    build: vrset }),
  fam({ cat: 'tech/wearables', title: 'Generic smart ring on charging post',
    desc: 'Smart ring on a charging post: a base and a post, a thick ring band with a raised sensor bay, and a rear contact.',
    vs: [['slim band, 0.7 in', 2.2, 2.2, 1.4, 0, { rd: 17.5, bt: 2.4 }], ['wide band, 0.8 in', 2.2, 2.2, 1.5, 0, { rd: 20, bt: 3 }]],
    build: ringcharge }),
  fam({ cat: 'tech/wearables', title: 'Generic neckband headset',
    desc: 'Neckband headset on a stand: a half-ring band with two end modules carrying buttons, thin cables and two in-ear buds.',
    vs: [['standard', 6.8, 3.2, 6.8, 0, {}], ['large', 7.6, 3.6, 7.4, 0, {}]],
    build: neckband }),
  fam({ cat: 'tech/wearables', title: 'Generic clip-on camera',
    desc: 'Clip-on wearable camera on a display base: a leaned rounded body with a lens, a record button, a status light, a microphone grille and a spring clip.',
    vs: [['compact', 2.4, 1.6, 2.6, 0, { t: 18 }], ['large', 3.0, 1.8, 3.1, 0, { t: 22 }]],
    build: clipcam }),
  fam({ cat: 'tech/wearables', title: 'Generic pendant tracker',
    desc: 'Pendant tracker on a display base and post: a round capsule pendant with a raised centre disc, a chain loop and an indicator.',
    vs: [['small', 2.2, 1.0, 3.6, 0, {}], ['large', 2.8, 1.1, 4.2, 0, {}]],
    build: pendant }),
];

export default [...GAD, ...AUD, ...IOT, ...WEAR];

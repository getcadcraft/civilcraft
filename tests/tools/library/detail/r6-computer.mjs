/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, computer: desktop computers and displays, peripherals, servers and racks, network equipment. Original geometry; generic size classes, no makers or models. */
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
/** a half-ring band in the X-Z plane (a headband): centre (cx, cz), mid radius R, band thickness rt (radial) between y0 and y1, from angle t0 to t1 */
function arcBand(a, cx, cz, R, rt, y0, y1, t0 = 0, t1 = m.PI, n = 18) { for (let i = 0; i < n; i++) { const p = (k, r) => { const th = t0 + (t1 - t0) * (k / n); return [cx + r * m.cos(th), cz + r * m.sin(th)]; }; prismY(a, [p(i, R - rt / 2), p(i + 1, R - rt / 2), p(i + 1, R + rt / 2), p(i, R + rt / 2)], y0, y1); } }
/** a small round-footed stand of four feet under a body */
function feet(a, x0, x1, y0, y1, r = 12, h = 10) { for (const x of [x0, x1]) for (const y of [y0, y1]) a.cyl(x, y, a.Z0, a.Z0 + h, r, 8); }
/** a rack ear pair on the face of a rack-mount unit: width W is the 19 in rail span */
function ears(a, u, y0 = null, holes = true) {
  const { X0, X1, YF, Z0, Z1 } = a, ear = (a.W - 17.75 * IN) / 2 > 12 ? (a.W - 17.75 * IN) / 2 : 14, y = y0 ?? YF;
  for (const [x0, x1] of [[X0, X0 + ear], [X1 - ear, X1]]) { a.box(x0, y, Z0 + 1, x1, y + 3, Z1 - 1); for (let i = 0; i < u; i++) for (const zz of [0.17, 0.83]) a.box(x0 + ear * 0.35, y - 0.0, Z0 + (i + zz) * 44.45 - 4, x1 - ear * 0.35, y + 3.6, Z0 + (i + zz) * 44.45 + 4); }
  return ear;
}

// ------------------------------------------------------------------------------------------ desktop
/** a tower PC: shell, mesh front with fans, drive bays, buttons, ports, glass side panel, rear plate and feet */
function tower(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, fz = 16;
  a.rect(X0, YF, X1, YB, 'EQUIP');
  feet(a, X0 + W * 0.14, X1 - W * 0.14, YF + D * 0.1, YB - D * 0.12, 14, fz);
  a.box(X0, YF + 24, Z0 + fz, X1, YB, Z1);                         // shell
  plate(a, X0 + 6, Z0 + fz + 6, X1 - 6, Z1 - 4, YF + 10, YF + 26, 14);  // front fascia
  let zt = Z1 - 24;
  for (let i = 0; i < v.bays; i++) { a.box(X0 + W * 0.15, YF + 3, zt - 40, X1 - W * 0.15, YF + 26.5, zt); a.box(X0 + W * 0.3, YF, zt - 22, X1 - W * 0.3, YF + 27, zt - 18); zt -= 52; }
  const nf = v.fans, zf0 = Z0 + fz + 40, fr = m.min(W * 0.4, (zt - zf0 - 20) / (nf * 2.15));
  for (let i = 0; i < nf; i++) { const zf = zf0 + fr + i * ((zt - zf0 - 20 - fr * 2) / m.max(1, nf - 1)); fan(a, cx, nf === 1 ? (zf0 + zt) / 2 : zf, fr, YF + 2, YF + 27); }
  a.ycyl(YF, YF + 29, cx - W * 0.28, Z1 - 28, 9, 12);                     // power button
  for (const i of [0, 1]) a.box(cx + W * 0.1 + i * 30, YF + 4, Z1 - 34, cx + W * 0.1 + i * 30 + 22, YF + 27, Z1 - 22);   // USB ports
  a.box(cx + W * 0.1 + 66, YF + 4, Z1 - 30, cx + W * 0.1 + 80, YF + 27, Z1 - 24);
  // side glass panel frame and internals hint
  a.frame(X1 - 4, Z0 + fz + 20, X1, Z1 - 20, YF + 60, YB - 30, 10);
  a.box(X1 - 3, YF + 64, Z0 + fz + 30, X1 - 1, YB - 34, Z1 - 30);
  // rear: power supply, fan, expansion slots, I/O
  a.box(X0 + 12, YB - 3, Z0 + fz + 10, X0 + W * 0.45, YB, Z0 + fz + 10 + 85); a.cyl(X0 + W * 0.45 * 0.5 + 6, YB - 3, Z0 + fz + 25, Z0 + fz + 30, 5, 6);
  for (let i = 0; i < v.slots; i++) a.box(X0 + 12 + i * 20, YB - 3, Z0 + fz + 120 + 70, X0 + 28 + i * 20, YB, Z0 + fz + 120 + 70 + 14 + 20);
  a.box(X1 - W * 0.4, YB - 3, Z1 - 120, X1 - 14, YB, Z1 - 40);
  a.rect(X1 - 4, YF + 60, X1, YB - 30, 'EQUIP-DETAIL'); a.line(X0, YF + 26, X1, YF + 26, 'EQUIP-DETAIL');
  for (let i = 0; i < v.slots; i++) a.rect(X0 + 12 + i * 20, YB - 3, X0 + 28 + i * 20, YB, 'EQUIP-DETAIL');
  a.log(`Added the shell, mesh front with ${nf} fan${nf > 1 ? 's' : ''} and ${v.bays} drive bay${v.bays === 1 ? '' : 's'}, power button and ports, glass side panel, rear power supply and ${v.slots} expansion slots (plan and 3D).`);
}

/** a monitor: bezel and panel (flat or curved), stand neck and foot, rear housing */
function monitor(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, ph = m.min(H - v.sh, W / v.ar), pz0 = Z1 - ph, hw = W / 2, sag = v.curve ? m.min(D * 0.3, W * 0.05) : 0, t = 22;
  const n = v.curve ? 12 : 1;
  const Y = (x) => YF + sag - sag * (x / hw) ** 2;   // edge x=±hw → YF
  for (let i = 0; i < n; i++) {
    const xa = -hw + (W * i) / n, xb = -hw + (W * (i + 1)) / n, o4 = v.curve ? 0 : 4, pts = [[cx + xa, Y(xa) + o4], [cx + xb, Y(xb) + o4], [cx + xb, Y(xb) + t], [cx + xa, Y(xa) + t]];
    a.prism(pts, pz0, Z1);
    if (!v.curve) break;
  }
  if (!v.curve) { a.frame(X0, pz0, X1, Z1, YF, YF + 5, 14); a.box(X0 + 14, YF + 5, pz0 + 14, X1 - 14, YF + t - 2, Z1 - 14); }
  else { a.frame(X0, pz0, X0 + 16, Z1, YF, YF + 5, 14); a.frame(X1 - 16, pz0, X1, Z1, YF, YF + 5, 14); a.box(X0, YF, pz0, X1, YF + 6, pz0 + 14); a.box(X0, YF, Z1 - 14, X1, YF + 6, Z1); }
  a.box(cx - 30, YF + sag + t - 4, pz0 + 4, cx + 30, YF + sag + t, pz0 + 10);                  // chin mark
  a.box(cx + hw * 0.55, YF + sag, pz0 + 1.5, cx + hw * 0.55 + 12, YF + sag + t + 2, pz0 + 4); // power button
  // rear housing and stand
  const hh = ph * 0.55, hwid = W * (v.curve ? 0.45 : 0.55);
  a.prism(rr(cx - hwid / 2, YF + sag + t, cx + hwid / 2, YF + sag + t + m.min(40, D * 0.12), 12), pz0 + ph * 0.22, pz0 + ph * 0.22 + hh);
  const ny = YB - D * 0.28, nw = v.arm ? 30 : 56;
  a.box(cx - nw / 2, ny - 16, Z0 + 18, cx + nw / 2, ny + 16, pz0 + ph * 0.6);
  a.box(cx - nw * 0.4, YF + sag + t + 4, pz0 + ph * 0.45, cx + nw * 0.4, ny + 14, pz0 + ph * 0.7);
  if (v.arm) { a.cyl(cx, YB - 40, Z0, Z0 + 14, 50, 20); a.cyl(cx, YB - 40, Z0 + 14, pz0 + ph * 0.3, 14, 10); }
  else slab(a, cx - W * 0.2, ny - D * 0.25, cx + W * 0.2, ny + D * 0.18 > YB ? YB : ny + D * 0.18, Z0, Z0 + 16, 40);
  a.rect(X0, Y(-hw), X1, Y(-hw) + t + 2, 'EQUIP');
  a.log(`Added the ${v.curve ? 'curved ' : ''}panel with bezel and chin, power button, rear housing, neck and ${v.arm ? 'round clamp foot' : 'flat foot'} (plan and 3D).`);
}

/** an open laptop: base with deck and key grid, trackpad, hinge barrels, tilted lid with screen and camera */
function laptop(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, bh = v.bh, tilt = (H - bh) * m.tan(((v.ang - 90) * m.PI) / 180), db = D - tilt, hy = YF + db, zb = Z0 + bh;
  slab(a, X0, YF, X1, hy, Z0 + 4, zb, 30);
  for (const x of [X0 + 40, X1 - 40]) for (const y of [YF + 40, hy - 40]) a.cyl(x, y, Z0, Z0 + 5, 12, 8);
  const kx0 = X0 + W * 0.05, kx1 = X1 - W * 0.05, ky0 = hy - db * 0.58, ky1 = hy - 20;
  keys(a, kx0, ky0, kx1, ky1, v.cols, v.rows, zb, 3.5, 1.4);
  a.box(cx - W * 0.16, YF + db * 0.08, zb, cx + W * 0.16, YF + db * 0.3, zb + 1.2); a.rect(cx - W * 0.16, YF + db * 0.08, cx + W * 0.16, YF + db * 0.3, 'EQUIP-DETAIL');
  for (const x of [cx - W * 0.3, cx + W * 0.3]) a.xcyl(x - W * 0.08, x + W * 0.08, hy - 3, zb + 3, 6, 8);
  const lid = [[hy - 6, zb], [hy + 2, zb], [YB, Z1], [YB - 9, Z1]];
  prismX(a, lid, X0 + 6, X1 - 6);
  // screen glass slightly proud of the lid face
  const f = (k) => [hy - 6 + (YB - 9 - (hy - 6)) * k, zb + (Z1 - zb) * k];
  const [p0, p1] = [f(0.08), f(0.93)];
  prismX(a, [[p0[0] - 1.5, p0[1]], [p0[0], p0[1]], [p1[0], p1[1]], [p1[0] - 1.5, p1[1]]], X0 + 20, X1 - 20);
  const [c] = [f(0.96)]; a.box(cx - 5, c[0] - 2.5, c[1] - 3, cx + 5, c[0] - 1, c[1]);
  a.rect(X0 + 6, hy - 6, X1 - 6, YB, 'EQUIP-HIDDEN');
  a.log(`Added the base with a ${v.cols} by ${v.rows} key deck and trackpad, hinge barrels and a lid tilted ${v.ang} degrees with screen and camera (plan and 3D).`);
}

/** an all-in-one: the monitor with a deep rear housing, a webcam and a speaker chin */
function aio(a, v) {
  monitor(a, { ...v, ar: 1.7, curve: false, arm: false, sh: v.sh });
  const { X0, X1, YF, Z1, cx, W, H } = a, ph = m.min(H - v.sh, W / 1.7), pz0 = Z1 - ph;
  a.prism(rr(cx - W * 0.4, YF + 22, cx + W * 0.4, YF + 22 + m.min(a.D * 0.45, 70), 30), pz0 + ph * 0.1, Z1 - ph * 0.1);
  a.box(cx - 6, YF, Z1 - 16, cx + 6, YF + 6, Z1 - 8);
  a.box(X0, YF, pz0, X1, YF + 7, pz0 + ph * 0.13);
  ribs(a, cx - W * 0.18, pz0 + ph * 0.045, cx + W * 0.18, pz0 + ph * 0.09, YF, 1, true, 3, 3);
  a.log('Added the thin display with a camera and speaker chin, a deep rear housing, neck and flat foot (plan and 3D).');
}

/** a mini PC: rounded block with a front port row, a ring button, vent ribs and rubber feet */
function mini(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  slab(a, X0, YF + 5, X1, YB, Z0 + 3, Z1, m.min(W, D) * 0.12);
  feet(a, X0 + W * 0.16, X1 - W * 0.16, YF + D * 0.16, YB - D * 0.16, 7, 3);
  a.ycyl(YF + 1, YF + 6, X0 + W * 0.18, Z0 + H * 0.58, H * 0.12, 16); a.ycyl(YF, YF + 7, X0 + W * 0.18, Z0 + H * 0.58, H * 0.05, 10);
  for (let i = 0; i < v.usb; i++) a.box(cx + W * 0.02 + i * (H * 0.3 + 4), YF, Z0 + H * 0.5, cx + W * 0.02 + i * (H * 0.3 + 4) + H * 0.25, YF + 6, Z0 + H * 0.5 + H * 0.12);
  a.box(X1 - W * 0.14, YF, Z0 + H * 0.4, X1 - W * 0.06, YF + 6, Z0 + H * 0.46);
  ribs(a, X0 + W * 0.2, Z1 - 1, X1 - W * 0.2, Z1 - 0.5, YF + D * 0.3, 1, true, 1, 1);
  for (let i = 0; i < 8; i++) a.box(X0 + W * 0.2 + i * ((W * 0.6) / 8) + 1, YF + D * 0.3, Z1, X0 + W * 0.2 + (i + 0.5) * ((W * 0.6) / 8), YB - D * 0.3, Z1 + 0.01);
  a.rect(X0 + W * 0.2, YF + D * 0.3, X1 - W * 0.2, YB - D * 0.3, 'EQUIP-DETAIL');
  if (v.vesa) { a.box(cx - 30, YB - 8, Z0 + H * 0.2, cx + 30, YB, Z0 + H * 0.8); }
  a.log(`Added the rounded body, ring power button, ${v.usb} front ports, top vent grille and feet (plan and 3D).`);
}

/** a docking station: stand (slot for a closed laptop) or flat hub with port row and cable */
function dock(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  if (v.kind === 'stand') {
    slab(a, X0, YF, X1, YB, Z0, Z0 + 22, 20);
    for (const x of [X0 + 8, X1 - 8 - 22]) a.box(x, YF + D * 0.3, Z0 + 22, x + 22, YF + D * 0.7, Z1);
    a.box(X0 + W * 0.3, YF + D * 0.28, Z0 + 22, X1 - W * 0.3, YF + D * 0.72, Z0 + 30);
    for (let i = 0; i < v.ports; i++) a.box(X0 + 20 + i * 26, YF, Z0 + 6, X0 + 20 + i * 26 + 18, YF + 6, Z0 + 14);
    a.box(X0, YF + 6, Z0, X1, YF + 8, Z0 + 22);
    a.cyl(cx, YB - 10, Z0 + 22, Z0 + 26, 4, 6);
    a.rect(X0 + 8, YF + D * 0.3, X0 + 30, YF + D * 0.7, 'EQUIP-DETAIL'); a.rect(X1 - 30, YF + D * 0.3, X1 - 8, YF + D * 0.7, 'EQUIP-DETAIL');
    a.log(`Added the base with ${v.ports} front ports, two side guides and a slot for a closed laptop (plan and 3D).`);
  } else {
    slab(a, X0, YF + 5, X1, YB, Z0, Z1, 14);
    for (let i = 0; i < v.ports; i++) a.box(X0 + 16 + i * ((W - 32) / v.ports), YF, Z0 + H * 0.3, X0 + 16 + i * ((W - 32) / v.ports) + (W - 32) / v.ports - 6, YF + 6, Z0 + H * 0.3 + H * 0.35);
    a.tube([[X1 - 22, YB - 10, Z0 + H / 2], [X1 - 22, YB + 0, Z0 + H / 2]], [4, 4], 6);
    ribs(a, X0 + 20, Z1 - 0.5, X1 - 20, Z1, YF + 6, 1, true, 1, 0.5);
    a.line(X0, YF + 8, X1, YF + 8, 'EQUIP-DETAIL');
    a.log(`Added the flat housing with ${v.ports} front ports and a rear cable (plan and 3D).`);
  }
}

/** a desk monitor arm: clamp, pole, jointed arms and one or two panels */
function arm(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, pw = (W - 30) / v.n, ph = m.min(H - 120, pw / v.ar), pz = Z1 - ph - 20;
  a.box(cx - 40, YB - 90, Z0, cx + 40, YB - 10, Z0 + 14); a.box(cx - 40, YB - 14, Z0 - 0, cx + 40, YB, Z0 + 90); a.cyl(cx, YB - 10, Z0 + 4, Z0 + 4.1, 1, 4);
  a.cyl(cx, YB - 48, Z0 + 14, pz + ph * 0.7, 18, 12);
  for (let i = 0; i < v.n; i++) {
    const px = v.n === 1 ? cx : cx + (i - (v.n - 1) / 2) * (pw + 6);
    a.tube([[cx, YB - 48, pz + ph * 0.7], [px, YB - 70 - D * 0.1, pz + ph * 0.55], [px, YF + 40, pz + ph * 0.5]], [11, 10, 9], 8);
    a.cyl(cx, YB - 48, pz + ph * 0.7 - 12, pz + ph * 0.7 + 12, 22, 12);
    a.box(px - 50, YF + 30, pz + ph * 0.5 - 50, px + 50, YF + 44, pz + ph * 0.5 + 50);
    plate(a, px - pw / 2, pz, px + pw / 2, pz + ph, YF, YF + 26, 8);
    a.frame(px - pw / 2, pz, px + pw / 2, pz + ph, YF - 0, YF + 1, 9);
    a.rect(px - pw / 2, YF, px + pw / 2, YF + 26);
  }
  a.rect(cx - 40, YB - 90, cx + 40, YB, 'EQUIP-DETAIL'); a.circ(cx, YB - 48, 18, 'EQUIP-DETAIL');
  a.log(`Added the desk clamp, pole, ${v.n === 1 ? 'one jointed arm' : v.n + ' jointed arms'} with swivel heads and ${v.n === 1 ? 'a panel' : v.n + ' panels'} (plan and 3D).`);
}

/** a slim horizontal desktop: low case with optical drive slot, ports, vent ribs and feet */
function slim(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  feet(a, X0 + 30, X1 - 30, YF + 30, YB - 30, 10, 6);
  a.prism(rr(X0, YF + 5, X1, YB, 12), Z0 + 6, Z1); a.poly(rr(X0, YF, X1, YB, 12));
  a.box(X0 + 10, YF, Z0 + 14, X0 + W * 0.52, YF + 6, Z0 + 14 + H * 0.38);   // optical drive door
  a.ycyl(YF, YF + 6, X1 - 40, Z0 + H * 0.55, 10, 14);
  for (let i = 0; i < v.usb; i++) a.box(X1 - 120 + i * 20, YF, Z0 + 14, X1 - 106 + i * 20, YF + 6, Z0 + 22);
  ribs(a, X0 + W * 0.58, Z0 + 12, X1 - 135, Z1 - 10, YF, 6, false, 3, 6);
  a.box(X0 + 20, YB - 3, Z0 + 10, X0 + 140, YB, Z1 - 6); a.cyl(X1 - 90, YB - 3, Z0 + 12, Z0 + 12.2, 1, 3);
  a.line(X0, YF + 6, X1, YF + 6, 'EQUIP-DETAIL');
  a.log(`Added the low case with an optical drive door, power button, ${v.usb} front ports, side vent ribs and rear panel (plan and 3D).`);
}

const DESK = [
  fam({ cat: 'computer/desktop', title: 'Generic tower PC',
    desc: (v) => `${v.k} computer tower with a mesh front carrying ${v.fans} fan${v.fans > 1 ? 's' : ''}, ${v.bays} drive bay${v.bays === 1 ? '' : 's'}, power button, front ports, glass side panel, rear power supply and ${v.slots} expansion slots.`,
    vs: [['small form factor', 8, 14, 15, 0, { k: 'Small-form-factor', fans: 1, bays: 0, slots: 2 }], ['mid tower', 8.5, 18, 18.5, 0, { k: 'Mid-size', fans: 3, bays: 2, slots: 7 }],
      ['full tower', 9.5, 21, 22.5, 0, { k: 'Full-size', fans: 3, bays: 3, slots: 8 }], ['server tower', 10.5, 26, 24, 0, { k: 'Server-size', fans: 2, bays: 4, slots: 8 }]],
    build: tower }),
  fam({ cat: 'computer/desktop', title: 'Generic desktop monitor',
    desc: (v) => `${v.s} in ${v.curve ? 'curved ' : ''}monitor with bezel, chin, power button, rear housing, neck and ${v.arm ? 'a round' : 'a flat'} foot.`,
    vs: [[21.5, 1.78, 0], [27, 1.78, 0], [34, 2.37, 1], [49, 3.55, 1]].map(([s, ar, curve]) => { const w = m.round(((s * ar) / m.hypot(ar, 1)) * 10) / 10, ph = w / ar; return [`${s} in${curve ? ' curved' : ''}`, w, curve ? 11 : 8.5, m.round((ph + 4.4) * 10) / 10, 0, { s, ar, curve, sh: 112, arm: s >= 34 }]; }),
    build: monitor }),
  fam({ cat: 'computer/desktop', title: 'Generic open laptop',
    desc: (v) => `Laptop open at ${v.ang} degrees: base with a ${v.cols} by ${v.rows} key deck and trackpad, hinge barrels, and a lid with screen and camera.`,
    vs: [[11.6, 11.2, 7.9, 8.2, 14, 12, 5, 105], [13.3, 12.0, 8.4, 8.6, 15, 14, 5, 108], [15.6, 14.2, 9.8, 10.0, 18, 15, 6, 112], [17.3, 15.8, 10.9, 11.0, 20, 17, 6, 112]].map(([s, w, d, h, bh, cols, rows, ang]) => [`${s} in screen`, w, d, h, 0, { cols, rows, bh, ang }]),
    build: laptop }),
  fam({ cat: 'computer/desktop', title: 'Generic all-in-one computer',
    desc: 'Thin display with a camera and speaker chin on a neck and flat foot, with a deep rear housing that holds the computer.',
    vs: [[21.5, 19.8, 7.5, 17.6], [24, 21.8, 8, 19.0], [27, 24.4, 8.6, 20.6]].map(([s, w, d, h]) => [`${s} in`, w, d, h, 0, { sh: 112 }]),
    build: aio }),
  fam({ cat: 'computer/desktop', title: 'Generic mini PC',
    desc: (v) => `Rounded mini computer with a ring power button, ${v.usb} front ports, a top vent grille and rubber feet${v.vesa ? ', and a rear mounting plate' : ''}.`,
    vs: [['palm size', 4.3, 4.3, 1.9, 0, { usb: 2 }], ['standard, 7 in', 7, 7, 2.6, 0, { usb: 3 }], ['with mounting plate', 7, 7, 2.6, 0, { usb: 3, vesa: 1 }], ['large, 8.5 in', 8.5, 8.5, 3.9, 0, { usb: 4 }]],
    build: mini }),
  fam({ cat: 'computer/desktop', title: 'Generic laptop docking',
    desc: (v) => v.kind === 'stand' ? `Docking base with ${v.ports} front ports, two side guides and a slot that holds a closed laptop upright.` : `Flat docking hub with ${v.ports} front ports and a rear cable.`,
    vs: [['stand, 4 ports', 5.5, 8, 6, 0, { kind: 'stand', ports: 4 }], ['stand, 6 ports', 8, 9, 6.5, 0, { kind: 'stand', ports: 6 }], ['hub, 12 ports', 11, 4.3, 1.4, 0, { kind: 'hub', ports: 12 }]],
    build: dock }),
  fam({ cat: 'computer/desktop', title: 'Generic monitor arm',
    desc: (v) => `Desk-clamp monitor arm with a pole, ${v.n === 1 ? 'one jointed arm' : v.n + ' jointed arms'} with swivel heads and ${v.n === 1 ? 'a panel' : v.n + ' panels'}.`,
    vs: [['single, 24 in panel', 21.5, 8, 21, 0, { n: 1, ar: 1.78 }], ['dual, 24 in panels', 44, 8, 21, 0, { n: 2, ar: 1.78 }], ['dual, 27 in panels', 49, 8, 22, 0, { n: 2, ar: 1.78 }]],
    build: arm }),
  fam({ cat: 'computer/desktop', title: 'Generic slim desktop',
    desc: (v) => `Low horizontal desktop case with an optical drive door, power button, ${v.usb} front ports, vent ribs and feet.`,
    vs: [['small, 14 in', 14, 12, 3, 0, { usb: 2 }], ['standard, 16.5 in', 16.5, 16, 4, 0, { usb: 3 }], ['wide, 17 in', 17, 17, 5.5, 0, { usb: 4 }]],
    build: slim }),
];

// ------------------------------------------------------------------------------------------ peripherals
/** a keyboard: wedge body, key blocks stepped up the slope, a spacebar, feet. v.lay: sections as [x0f, x1f, cols, rows, y0f, y1f] */
function keyboard(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, fh = 12, sl = (y) => Z0 + fh + (H * 0.45 - fh) * ((y - YF) / D);
  prismX(a, [[YF, Z0 + 2], [YB, Z0 + 2], [YB, Z0 + H * 0.5], [YF, Z0 + fh]], X0, X1); a.rect(X0, YF, X1, YB);
  a.box(X0 + 20, YB - 25, Z0, X0 + 50, YB - 5, Z0 + 4); a.box(X1 - 50, YB - 25, Z0, X1 - 20, YB - 5, Z0 + 4);
  const pad = v.rest ? D * 0.17 : 0, ky0 = YF + 10 + pad, ky1 = YB - 10;
  for (const [x0f, x1f, cols, rows, y0f, y1f] of v.lay) {
    const x0 = X0 + 10 + (W - 20) * x0f, x1 = X0 + 10 + (W - 20) * x1f, ya = ky0 + (ky1 - ky0) * y0f, yb = ky0 + (ky1 - ky0) * y1f, cw = (x1 - x0) / cols, rh = (yb - ya) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const yc = ya + rh * (r + 0.5), zb = sl(yc), last = v.space && r === 0 && x0f === 0 && c >= 3 && c <= 8;
      if (last) { if (c === 3) a.box(x0 + 3 * cw + 1.2, ya + 1.2, zb, x0 + 9 * cw - 1.2, ya + rh - 1.2, zb + 5); continue; }
      a.box(x0 + c * cw + 1.2, ya + r * rh + 1.2, zb, x0 + (c + 1) * cw - 1.2, ya + (r + 1) * rh - 1.2, zb + 5);
    }
    a.rect(x0, ya, x1, yb, 'EQUIP-DETAIL');
  }
  if (v.rest) a.line(X0, YF + pad, X1, YF + pad, 'EQUIP-DETAIL');
  a.log(`Added the wedge body with ${v.keys} stepped keys, a spacebar and rear feet (plan and 3D).`);
}

/** a mouse: rounded shell, split buttons, scroll wheel, optional side buttons and a tilted vertical grip */
function mouse(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  const zs = (dy) => Z0 + H * m.sqrt(m.max(0, 1 - (dy / (D / 2)) ** 2)) * (v.vert ? 0.82 : 1);
  if (v.vert) {
    dome(a, cx, cy, Z0 + H * 0.22, W / 2, D / 2, H * 0.78, 9, 0); a.cyl(cx, cy, Z0, Z0 + H * 0.24, m.min(W, D) * 0.4, 18); a.ellp(cx, cy, W / 2, D / 2);
    a.xcyl(cx - 4, cx + 4, YF + D * 0.28, Z1 - H * 0.12, 11, 10); a.tube([[cx, YF + D * 0.1, Z1 - H * 0.07], [cx, YF + D * 0.5, Z1 - H * 0.07]], [1.2, 1.2], 5);
    a.box(X1 - 14, YF + D * 0.3, Z0 + H * 0.4, X1 - 4, YF + D * 0.6, Z0 + H * 0.65);   // thumb rest
  } else {
    dome(a, cx, cy, Z0 + 1.5, W / 2, D / 2, H - 1.5, 10, 0.0); a.cyl(cx, cy, Z0, Z0 + 2, m.min(W, D) * 0.46, 18); a.ellp(cx, cy, W / 2, D / 2);
    const yb = cy, pts = []; for (let i = 0; i <= 8; i++) { const y = YF + D * 0.1 + (yb - (YF + D * 0.1)) * (i / 8); pts.push([cx, y, Z0 + 1.5 + (H - 1.5) * m.sqrt(m.max(0, 1 - ((y - cy) / (D / 2)) ** 2)) + 0.6]); }
    a.tube(pts, pts.map(() => 1.3), 5); a.line(X0 + W * 0.12, yb, X1 - W * 0.12, yb, 'EQUIP-DETAIL');
    a.xcyl(cx - 5, cx + 5, YF + D * 0.3, Z0 + 1.5 + (H - 1.5) * m.sqrt(1 - ((YF + D * 0.3 - cy) / (D / 2)) ** 2) - 0.5, 4.2, 10);
    if (v.side) for (let i = 0; i < v.side; i++) { const y0 = YF + D * (0.3 + i * 0.14), y1 = y0 + D * 0.1, xe = (y) => X0 + (W / 2) * (1 - m.sqrt(m.max(0, 1 - ((y - cy) / (D / 2)) ** 2))); a.box(xe(y0 + D * 0.05) - 0, y0, Z0 + H * 0.3, xe(y0 + D * 0.05) + 5, y1, Z0 + H * 0.5); }
    if (v.sensor) a.box(cx - 8, cy, Z0, cx + 8, cy + 14, Z0 + 1.5);
  }
  a.log(`Added the rounded shell${v.vert ? ' set on a tilted vertical grip with a thumb rest' : ' with split buttons'} and a scroll wheel${v.side ? ' and ' + v.side + ' side buttons' : ''} (plan and 3D).`);
}

/** a printer: ink (stepped body, scanner lid, sloped panel, output tray, rear paper support) or laser (tall body, cassette, top output stack) */
function printer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline();
  if (v.kind === 'ink') {
    const bh = H * (v.scan ? 0.52 : 0.7), fz = 6;
    slab(a, X0, YF + D * 0.18, X1, YB - D * 0.08, Z0 + fz, Z0 + bh, 24);
    a.box(X0 + W * 0.08, YF, Z0 + fz, X1 - W * 0.08, YF + D * 0.2, Z0 + fz + 14);            // output tray out
    a.prism([[X0 + W * 0.08, YF], [X1 - W * 0.08, YF], [X1 - W * 0.1, YF + D * 0.18], [X0 + W * 0.1, YF + D * 0.18]], Z0 + fz + 14, Z0 + fz + 16);
    a.box(X0 + W * 0.1, YF + D * 0.18, Z0 + bh * 0.3, X1 - W * 0.1, YF + D * 0.2, Z0 + bh - 12);      // front door
    if (v.scan) { a.prism(rr(X0 + 4, YF + D * 0.2, X1 - 4, YB - D * 0.08, 14), Z0 + bh, Z0 + bh + H * 0.14); a.box(X0 + 8, YF + D * 0.2, Z0 + bh + 2, X1 - 8, YF + D * 0.2 + 3, Z0 + bh + H * 0.14 - 2); a.rect(X0 + 12, YF + D * 0.25, X1 - 12, YB - D * 0.12, 'EQUIP-DETAIL'); }
    prismX(a, [[YF + D * 0.2, Z0 + bh], [YF + D * 0.2, Z0 + bh + 6], [YF + D * 0.38, Z0 + bh + 6 + (v.scan ? H * 0.14 : 0) + 22], [YF + D * 0.38, Z0 + bh + (v.scan ? H * 0.14 : 0)]], X0 + W * 0.18, X1 - W * 0.18);
    prismX(a, [[YF + D * 0.2, Z0 + bh + (v.scan ? H * 0.14 : 0) + 4], [YF + D * 0.38, Z0 + bh + (v.scan ? H * 0.14 : 0) + 26], [YF + D * 0.3, Z0 + bh + (v.scan ? H * 0.14 : 0) + 30], [YF + D * 0.2, Z0 + bh + (v.scan ? H * 0.14 : 0) + 8]], X0 + W * 0.2, X1 - W * 0.2);
    for (let i = 0; i < 4; i++) a.cyl(X0 + W * 0.22 + i * 18, YF + D * 0.26, Z0 + bh + (v.scan ? H * 0.14 : 0) + 9, Z0 + bh + (v.scan ? H * 0.14 : 0) + 14, 5, 8);
    a.tube([[cx - W * 0.3, YB - D * 0.1, Z0 + bh], [cx - W * 0.3, YB - 2, Z1 - 6]], [8, 8], 6); a.tube([[cx + W * 0.3, YB - D * 0.1, Z0 + bh], [cx + W * 0.3, YB - 2, Z1 - 6]], [8, 8], 6); a.box(cx - W * 0.3, YB - 8, Z1 - 12, cx + W * 0.3, YB - 2, Z1 - 4);
    a.line(X0, YF + D * 0.18, X1, YF + D * 0.18, 'EQUIP-DETAIL');
  } else {
    const hh = H * 0.62, fz = 8;
    a.prism(rr(X0, YF + 4, X1, YB, 14), Z0 + fz, Z0 + hh); a.poly(rr(X0, YF, X1, YB, 14));
    prismX(a, [[YF + 4, Z0 + hh], [YF + D * 0.5, Z0 + hh], [YB - D * 0.1, Z0 + hh + H * 0.12], [YB, Z0 + hh + H * 0.12], [YB, Z1 - 6], [YB - D * 0.3, Z1 - 6], [YF + D * 0.5, Z0 + hh + H * 0.04]], X0 + 6, X1 - 6);
    a.box(X0 + 6, YF + D * 0.5, Z0 + hh, X1 - 6, YB, Z0 + hh + H * 0.12);
    a.box(X0 + W * 0.12, YF, Z0 + fz + 8, X1 - W * 0.12, YF + 4, Z0 + fz + 8 + H * 0.2);                           // cassette front
    a.box(cx - W * 0.1, YF, Z0 + fz + 8 + H * 0.08, cx + W * 0.1, YF + 6, Z0 + fz + 8 + H * 0.1);
    if (v.cass > 1) { a.box(X0 + W * 0.12, YF, Z0 + fz + 16 + H * 0.2, X1 - W * 0.12, YF + 4, Z0 + fz + 16 + H * 0.38); a.box(cx - W * 0.1, YF, Z0 + fz + 16 + H * 0.28, cx + W * 0.1, YF + 6, Z0 + fz + 16 + H * 0.3); }
    a.box(X0 + 8, YF + 2, Z0 + hh - H * 0.18, X1 - 8, YF + 5, Z0 + hh - 4);                                        // front door
    prismX(a, [[YF + 4, Z0 + hh], [YF + 4, Z0 + hh + 5], [YF + D * 0.28, Z0 + hh + H * 0.11], [YF + D * 0.28, Z0 + hh + H * 0.07]], cx - W * 0.2, cx + W * 0.2);
    a.box(cx - W * 0.17, YF + 8, Z0 + hh + H * 0.06, cx + W * 0.17, YF + D * 0.24, Z0 + hh + H * 0.08);
    for (let i = 0; i < (v.scan ? 6 : 3); i++) a.cyl(cx - W * 0.14 + i * 14, YF + 22, Z0 + hh + H * 0.08, Z0 + hh + H * 0.1, 4.5, 8);
    if (v.scan) { a.box(X0 + 4, YF + D * 0.2, Z0 + hh + H * 0.2, X1 - 4, YB - D * 0.05, Z0 + hh + H * 0.2 + 10); }
    a.line(X0, YF + 4, X1, YF + 4, 'EQUIP-DETAIL'); a.rect(X0 + 12, YF + D * 0.5, X1 - 12, YB - 10, 'EQUIP-DETAIL');
  }
  a.log(v.kind === 'ink' ? `Added the stepped body${v.scan ? ' with a scanner lid' : ''}, pull-out output tray, sloped control panel with buttons and a rear paper support (plan and 3D).` : `Added the tall body, ${v.cass > 1 ? 'two paper cassettes' : 'a paper cassette'}, front door, top output stack, control panel${v.scan ? ' and a scanner lid' : ''} (plan and 3D).`);
}

/** a flatbed scanner (hinged lid, glass bezel, front buttons) or a sheet-fed document scanner (feed tray, exit tray) */
function scanner(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline();
  if (v.kind === 'flat') {
    slab(a, X0, YF, X1, YB, Z0 + 3, Z0 + H * 0.5, 16);
    prismX(a, [[YF + 4, Z0 + H * 0.5], [YB, Z0 + H * 0.5], [YB, Z1], [YF + 14, Z1 - H * 0.1]], X0 + 4, X1 - 4);
    for (const x of [X0 + W * 0.2, X1 - W * 0.2]) a.xcyl(x - W * 0.06, x + W * 0.06, YB - 3, Z0 + H * 0.5, 5, 8);
    for (let i = 0; i < v.btn; i++) a.cyl(X0 + 30 + i * 26, YF + 12, Z0 + H * 0.5 - 3, Z0 + H * 0.5, 7, 8);
    a.box(X0 + 4, YF + 2, Z0 + H * 0.5 - 3, X1 - 4, YF + 5, Z0 + H * 0.5 + 0.5);
    a.rect(X0 + 12, YF + 26, X1 - 12, YB - 10, 'EQUIP-DETAIL');
    a.log(`Added the base, hinged lid with a soft pad, glass bezel and ${v.btn} front buttons (plan and 3D).`);
  } else {
    a.prism(rr(X0, YF + D * 0.35, X1, YB, 16), Z0 + 3, Z1 - H * 0.12); a.poly(rr(X0, YF, X1, YB, 16));
    a.box(X0 + 14, YF + D * 0.35, Z1 - H * 0.12, X1 - 14, YB - 10, Z1 - 4);
    prismX(a, [[YB - 10, Z1 - 4], [YB - 10, Z1 - 4 - 6], [YB - 10 + 0.01, Z1 - 6]].slice(0, 3), cx - 1, cx + 1);
    prismX(a, [[YF + D * 0.35, Z0 + H * 0.35], [YF, Z0 + H * 0.28], [YF, Z0 + H * 0.33], [YF + D * 0.35, Z0 + H * 0.42]], X0 + 16, X1 - 16);   // exit tray
    prismX(a, [[YB - 20, Z1 - 4], [YB - 3, Z1 - 4], [YB - 3, Z1 - 1], [YB - 20, Z1 - 1]], X0 + 20, X1 - 20);
    prismX(a, [[YB - 30, Z1 - 4], [YB - 30 + D * 0.15, Z1 - 4], [YB - 30 + D * 0.15, Z1 - 3], [YB - 30, Z1 - 3]], X0 + 20, X1 - 20);
    a.box(X0 + 16, YB - 8, Z1 - 4, X1 - 16, YB - 3, Z1 + 0.01 - 0.0 > Z1 ? Z1 : Z1 - 0.5);
    a.cyl(X1 - 28, YF + D * 0.4, Z1 - H * 0.12, Z1 - H * 0.12 + 5, 6, 8);
    a.line(X0, YF + D * 0.35, X1, YF + D * 0.35, 'EQUIP-DETAIL'); a.rect(X0 + 20, YB - D * 0.55, X1 - 20, YB - 8, 'EQUIP-DETAIL');
    a.log('Added the compact body with a rear feed tray, front exit tray, power button and rollers cover (plan and 3D).');
  }
}

/** an external drive: portable (rounded slab, LED, port) or desktop enclosure with front vents and one or two bays */
function drive(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  if (v.kind === 'port') {
    plate(a, X0, Z0, X1, Z1, YF + 5, YB, m.min(W, H) * 0.1); a.prism(rr(X0, YF, X1, YB, 12), Z0 + 0.01, Z0 + 0.02); a.poly(rr(X0, YF, X1, YB, 12));
    a.box(X0 + 4, YF, Z0 + H * 0.18, X1 - 4, YF + 5.5, Z1 - H * 0.18);      // top panel inset
    a.box(cx - 14, YB - 1, Z0 + H * 0.3, cx + 14, YB + 0, Z1 - H * 0.3 > Z0 + H * 0.3 ? Z1 - H * 0.3 : Z1);
    a.ycyl(YF, YF + 6, X1 - W * 0.12, Z1 - H * 0.35, 2.5, 8);
    if (v.rugged) { for (const sx of [X0, X1]) a.box(sx - 0, YF + 2, Z0, sx + (sx < 0 ? 5 : -5), YB, Z1); }
    a.log('Added the rounded case with a top panel, status LED and a rear connector port (plan and 3D).');
  } else {
    a.prism(rr(X0, YF + 8, X1, YB, 14), Z0 + 4, Z1); a.poly(rr(X0, YF, X1, YB, 14));
    feet(a, X0 + 20, X1 - 20, YF + 30, YB - 30, 8, 4);
    const n = v.bays, bh = (H - 30) / n;
    for (let i = 0; i < n; i++) { const z = Z0 + 14 + i * bh; a.box(X0 + 10, YF, z, X1 - 10, YF + 9, z + bh - 6); ribs(a, X0 + 18, z + 6, X1 - 18, z + bh - 12, YF - 0, 5, true, 2, 10); a.ycyl(YF, YF + 10, X1 - 24, z + bh - 18, 2.5, 8); }
    a.box(cx - 30, YB - 3, Z0 + 12, cx + 30, YB, Z0 + 28);
    a.log(`Added the enclosure with ${n} drive bay${n > 1 ? 's' : ''} behind vented fronts, status LEDs, feet and a rear connector panel (plan and 3D).`);
  }
}

/** a webcam on a monitor clip: lens barrel with rings, body, hinge and a rear clip */
function webcam(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, r = m.min(W, H) * (v.ring ? 0.23 : 0.3);
  const bz = Z1 - H * 0.35;
  plate(a, X0, bz - H * 0.3, X1, bz + H * 0.3, YF + 8, YB - D * 0.45, m.min(W, H) * 0.14); a.poly(rr(X0, YF + 8, X1, YB - D * 0.45, 8));
  a.ycyl(YF, YF + 12, cx, bz, r, 20); a.ycyl(YF, YF + 14, cx, bz, r * 0.62, 16); a.ycyl(YF, YF + 15, cx, bz, r * 0.28, 12);
  if (v.ring) a.ycyl(YF + 6, YF + 11, cx, bz, r * 1.3, 24);
  a.ycyl(YF + 6, YF + 9, X0 + W * 0.14, bz + H * 0.1, 3, 6);
  a.xcyl(cx - W * 0.15, cx + W * 0.15, YB - D * 0.45, bz - H * 0.3 + 2, 7, 10);
  a.box(cx - W * 0.15, YB - D * 0.45 - 8, Z0 + H * 0.3, cx + W * 0.15, YB - D * 0.45 + 8, bz - H * 0.3);
  a.box(cx - W * 0.18, YB - D * 0.45 - 12, Z0 + H * 0.12, cx + W * 0.18, YB, Z0 + H * 0.3); a.box(cx - W * 0.18, YB - D * 0.25 - 12, Z0, cx + W * 0.18, YB, Z0 + H * 0.12);
  a.rect(cx - W * 0.18, YB - D * 0.45, cx + W * 0.18, YB, 'EQUIP-DETAIL');
  a.log(`Added the camera body with a ringed lens${v.ring ? ' and a light ring' : ''}, indicator, hinge and monitor clip (plan and 3D).`);
}

/** a headset on a desk stand: base, stem, arm, headband, ear cups with pads and a mic boom */
function headset(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, cr = W * 0.19, bt = 7;
  a.cyl(cx, cy, Z0, Z0 + 14, D * 0.42, 24); a.circ(cx, cy, D * 0.42);
  a.cyl(cx, cy, Z0 + 14, Z0 + H * 0.4, 14, 10);
  a.box(cx - 8, cy - 8, Z0 + H * 0.28, cx + 8, cy + 8, Z0 + H * 0.4);
  a.tube([[cx, cy, Z0 + H * 0.4], [cx, cy, Z1 - 30]], [14, 20], 12); a.ell(cx, cy, Z1 - 24, 60, 30, 12, 12, 6);
  const hr = W / 2 - cr * 0.55, hz = Z1 - 44 - hr, cz = hz;
  arcBand(a, cx, hz, hr, 14, cy - 10, cy + 10, 0, m.PI, 20);
  for (const s of [-1, 1]) {
    const x = cx + s * (hr + 6);
    a.xcyl(x - (s > 0 ? 0 : 0) + (s > 0 ? -2 : -26) + (s > 0 ? 0 : 0), x + (s > 0 ? 26 : 2), cy, hz - cr * 0.9, cr, 22);
    a.xcyl(x + (s > 0 ? -16 : 4), x + (s > 0 ? -4 : 16), cy, hz - cr * 0.9, cr * 1.06, 22);
    a.circ(x + s * 12, cy, cr, 'EQUIP-DETAIL');
    a.tube([[x + s * 4, cy, hz - cr * 0.9 + cr * 0.85], [x + s * 4, cy, hz]], [6, 6], 6);
  }
  if (v.mic) { const x = cx - (hr + 6) - 28; a.tube([[x, cy, hz - cr * 0.9 - 20], [x - 10, cy - 30, hz - cr * 1.9], [x + 30, cy - D * 0.28, hz - cr * 2.4]], [4, 4, 4], 6); a.ell(x + 30, cy - D * 0.28, hz - cr * 2.4, 9, 14, 9, 8, 5); }
  a.log(`Added the stand base and stem with a hook, a headband, two cushioned ear cups${v.mic ? ' and a boom microphone' : ''} (plan and 3D).`);
}

/** a drawing tablet: tilted slab with the active area, a column of keys, a ring dial and a pen on a holder */
function tablet(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, tw = W - 60, rise = 12;
  prismX(a, [[YF, Z0 + 2], [YB, Z0 + 2], [YB, Z0 + rise], [YF, Z0 + 4]], X0, X1 - 56);
  a.rect(X0, YF, X1 - 56, YB);
  const zt = (y) => Z0 + 4 + (rise - 4) * ((y - YF) / D);
  a.box(X0 + 48, YF + 14, zt(YF + 14), X1 - 70, YB - 14, zt(YB - 14) + 1);
  a.rect(X0 + 48, YF + 14, X1 - 70, YB - 14, 'EQUIP-DETAIL');
  for (let i = 0; i < v.keys; i++) a.box(X0 + 14, YF + 24 + i * ((D - 70) / v.keys), zt(YF + 24 + i * ((D - 70) / v.keys)), X0 + 34, YF + 24 + i * ((D - 70) / v.keys) + 14, zt(YF + 24 + i * ((D - 70) / v.keys)) + 4);
  if (v.dial) a.cyl(X0 + 24, YB - 28, zt(YB - 28), zt(YB - 28) + 4, 14, 14);
  // pen holder with a pen
  const px = X1 - 28, py = cy_(a);
  a.cyl(px, py, Z0, Z0 + H * 0.5, 26, 14); a.circ(px, py, 26);
  a.tube([[px + 2, py, Z0 + H * 0.5 - 30], [px + 2, py, Z1 - 12], [px + 2, py, Z1]], [4, 5.5, 3.5], 8);
  a.log(`Added the tilted pad with the active area, ${v.keys} express keys${v.dial ? ' and a ring dial' : ''}, and a pen standing in a holder (plan and 3D).`);
}
function cy_(a) { return a.cy; }

/** a powered USB hub: low body with a row of ports on the front and a short cable */
function hub(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  slab(a, X0, YF + 5, X1, YB, Z0, Z1, 10);
  for (let i = 0; i < v.ports; i++) { const w = (W - 30) / v.ports; a.box(X0 + 15 + i * w, YF, Z0 + H * 0.25, X0 + 15 + i * w + w - 5, YF + 6, Z0 + H * 0.65); }
  a.tube([[X1 - 6, YB - 4, Z0 + H / 2], [X1 - 6, YB, Z0 + H / 2]], [4, 4], 6);
  a.line(X0, YF + 8, X1, YF + 8, 'EQUIP-DETAIL');
  a.log(`Added the low body with ${v.ports} front ports and a rear power lead (plan and 3D).`);
}

const LAY_FULL = [[0, 0.66, 15, 5, 0, 0.78], [0, 0.66, 13, 1, 0.86, 1], [0.69, 0.81, 3, 2, 0.54, 0.78], [0.69, 0.81, 3, 1, 0, 0.2], [0.69, 0.81, 3, 1, 0.2, 0.4], [0.84, 1, 4, 5, 0, 0.78], [0.69, 0.81, 3, 1, 0.86, 1], [0.84, 1, 4, 1, 0.86, 1]];
const LAY_TKL = [[0, 0.79, 15, 5, 0, 0.78], [0, 0.79, 13, 1, 0.86, 1], [0.84, 1, 3, 2, 0.54, 0.78], [0.84, 1, 3, 1, 0, 0.4], [0.84, 1, 3, 1, 0.86, 1]];
const LAY_60 = [[0, 1, 15, 5, 0, 1]];
const LAY_SPLIT = [[0, 0.44, 7, 5, 0, 0.8], [0.56, 1, 7, 5, 0, 0.8], [0, 0.44, 7, 1, 0.86, 1], [0.56, 1, 7, 1, 0.86, 1], [0.46, 0.54, 1, 4, 0.2, 0.8]];
const PER = [
  fam({ cat: 'computer/peripherals', title: 'Generic computer keyboard',
    desc: (v) => `${v.k} keyboard: wedge body with ${v.keys} stepped keys, a spacebar and rear feet${v.rest ? ', and a palm rest in front' : ''}.`,
    vs: [['full size, numeric pad', 17.4, 5.5, 1.3, 0, { k: 'Full-size', lay: LAY_FULL, keys: 104, space: 1 }], ['tenkeyless', 14.2, 5.5, 1.3, 0, { k: 'Tenkeyless', lay: LAY_TKL, keys: 87, space: 1 }], ['compact 60 percent', 11.6, 4.2, 1.2, 0, { k: 'Compact', lay: LAY_60, keys: 61, space: 1 }],
      ['split ergonomic with palm rest', 17, 8.4, 1.7, 0, { k: 'Split ergonomic', lay: LAY_SPLIT, keys: 80, rest: 1 }]],
    build: keyboard }),
  fam({ cat: 'computer/peripherals', title: 'Generic computer mouse',
    desc: (v) => v.vert ? 'Vertical-grip mouse: rounded shell on a tilted grip with a thumb rest, split buttons and a scroll wheel.' : `Rounded mouse with split buttons, a scroll wheel${v.side ? ' and ' + v.side + ' side buttons' : ''}.`,
    vs: [['standard', 2.4, 4.2, 1.5, 0, { sensor: 1 }], ['gaming, two side buttons', 2.7, 4.8, 1.6, 0, { side: 2, sensor: 1 }], ['vertical grip', 3.1, 4.5, 3.6, 0, { vert: 1 }]],
    build: mouse }),
  fam({ cat: 'computer/peripherals', title: 'Generic inkjet printer',
    desc: (v) => `Inkjet printer with a stepped body${v.scan ? ' and scanner lid' : ''}, a pull-out output tray, sloped control panel with buttons and a rear paper support.`,
    vs: [['home, print only', 17.5, 13, 7.5, 0, { kind: 'ink' }], ['all-in-one with scanner', 17.5, 15, 10.5, 0, { kind: 'ink', scan: 1 }], ['wide format, scanner', 24, 19, 11.5, 0, { kind: 'ink', scan: 1 }]],
    build: printer }),
  fam({ cat: 'computer/peripherals', title: 'Generic laser printer',
    desc: (v) => `Laser printer with a tall body, ${v.cass > 1 ? 'two paper cassettes' : 'a paper cassette'}, front door, top output stack and control panel${v.scan ? ', with a scanner lid' : ''}.`,
    vs: [['mono, desktop', 14, 14, 10, 0, { kind: 'laser', cass: 1 }], ['colour, two cassettes', 16.5, 18, 15, 0, { kind: 'laser', cass: 2 }], ['colour all-in-one', 17.5, 19, 20, 0, { kind: 'laser', cass: 2, scan: 1 }]],
    build: printer }),
  fam({ cat: 'computer/peripherals', title: 'Generic document scanner',
    desc: (v) => v.kind === 'flat' ? `Flatbed scanner with a hinged lid and soft pad, a glass bezel and ${v.btn} front buttons.` : 'Sheet-fed scanner with a rear feed tray, front exit tray and power button.',
    vs: [['flatbed, letter size', 19, 12.5, 4, 0, { kind: 'flat', btn: 4 }], ['sheet-fed, compact', 11.6, 6, 4.2, 0, { kind: 'sheet' }]],
    build: scanner }),
  fam({ cat: 'computer/peripherals', title: 'Generic external drive',
    desc: (v) => v.kind === 'port' ? 'Portable external drive: rounded case with a top panel, status LED and a connector port.' : `Desktop drive enclosure with ${v.bays} bay${v.bays > 1 ? 's' : ''} behind vented fronts, LEDs and feet.`,
    vs: [['portable, solid state', 3.5, 2.2, 0.35, 0, { kind: 'port' }], ['portable, hard disk', 3.1, 4.5, 0.8, 0, { kind: 'port' }], ['desktop, one bay', 5.5, 7.5, 7.8, 0, { kind: 'desk', bays: 1 }], ['desktop, two bays', 7.2, 8, 9.5, 0, { kind: 'desk', bays: 2 }]],
    build: drive }),
  fam({ cat: 'computer/peripherals', title: 'Generic webcam',
    desc: (v) => `Webcam with a ringed lens${v.ring ? ' and a light ring' : ''}, an indicator, a hinge and a monitor clip.`,
    vs: [['clip-on, standard', 3.8, 2.6, 2.1, 0, {}], ['clip-on, with light ring', 4.6, 2.6, 2.6, 0, { ring: 1 }]],
    build: webcam }),
  fam({ cat: 'computer/peripherals', title: 'Generic desk headset',
    desc: (v) => `Headset on a desk stand: round base and stem with a hook, a headband, two cushioned ear cups${v.mic ? ' and a boom microphone' : ''}.`,
    vs: [['wired, with boom mic', 8.2, 7.5, 11, 0, { mic: 1 }], ['studio, closed back', 8.6, 7, 10, 0, {}]],
    build: headset }),
  fam({ cat: 'computer/peripherals', title: 'Generic drawing tablet',
    desc: (v) => `Drawing tablet: tilted pad with an active area, ${v.keys} express keys${v.dial ? ' and a ring dial' : ''}, and a pen standing in a holder.`,
    vs: [['small', 8.6, 6.2, 3, 0, { keys: 4 }], ['medium', 11.8, 8.2, 3, 0, { keys: 6 }], ['large, ring dial', 15.5, 10.4, 3, 0, { keys: 8, dial: 1 }]],
    build: tablet }),
];

// ------------------------------------------------------------------------------------------ servers and racks
const U = 44.45;
/** a rack server: chassis between rack ears, a face of drive trays in a grid, fan vents, power button and indicators, rear PSUs and fans */
function rackServer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, u = v.u, ear = 15, fx0 = X0 + ear + 4, fx1 = X1 - ear - 4;
  a.outline(); a.rect(X0 + ear, YF + 5, X1 - ear, YB, 'EQUIP-DETAIL');
  a.box(X0 + ear + 2, YF + 8, Z0 + 2, X1 - ear - 2, YB, Z1 - 1);
  for (const [x0, x1] of [[X0, X0 + ear], [X1 - ear, X1]]) { a.box(x0, YF + 2, Z0 + 0.5, x1, YF + 5, Z1 - 0.5); for (let i = 0; i < u; i++) for (const zz of [0.17, 0.83]) a.box(x0 + 3, YF, Z0 + (i + zz) * U - 4, x1 - 3, YF + 2.5, Z0 + (i + zz) * U + 4); }
  a.box(X0 + ear - 1, YF + 5, Z0 + 0.5, X0 + ear + 14, YF + 9, Z1 - 0.5);     // left control wing
  a.box(X1 - ear - 14, YF + 5, Z0 + 0.5, X1 - ear + 1, YF + 9, Z1 - 0.5);
  const bx0 = X0 + ear + 22, bx1 = X1 - ear - 22 - (v.fans ? 0 : 0), by0 = Z0 + 6, by1 = Z1 - 6;
  const gx0 = v.gpu ? bx0 : bx0 + 4, gx1 = v.cols ? (v.gpu ? bx1 : bx1) : bx1;
  if (v.gpu) { for (let i = 0; i < 4; i++) { const w = (bx1 - bx0) / 4; const fr = m.min(w * 0.46, (by1 - by0) * 0.4), fxx = bx0 + w * (i + 0.5), fzz = (by0 + by1) / 2; a.ycyl(YF + 3, YF + 10, fxx, fzz, fr, 22); a.ycyl(YF, YF + 10, fxx, fzz, fr * 0.2, 10); for (const t of [0, 1]) a.box(fxx - (t ? fr * 0.95 : 2), YF + 1, fzz - (t ? 2 : fr * 0.95), fxx + (t ? fr * 0.95 : 2), YF + 5, fzz + (t ? 2 : fr * 0.95)); } }
  else {
    const cw = (bx1 - bx0) / v.cols, rh = (by1 - by0) / v.rows;
    for (let r = 0; r < v.rows; r++) for (let c = 0; c < v.cols; c++) {
      const x0 = bx0 + c * cw + 1.2, x1 = bx0 + (c + 1) * cw - 1.2, z0 = by0 + r * rh + 1.2, z1 = by0 + (r + 1) * rh - 1.2;
      if (v.hole && c === v.cols - 1 && v.cols > 4 && r >= 0 && false) continue;
      a.box(x0, YF + 3, z0, x1, YF + 9, z1);
      if (v.lff) { a.box(x0 + 3, YF, z0 + (z1 - z0) * 0.2, x1 - 3, YF + 3, z0 + (z1 - z0) * 0.8); } else { a.box(x0 + (x1 - x0) * 0.15, YF + 1, z0 + 3, x1 - (x1 - x0) * 0.15, YF + 3.2, z1 - 3); }
    }
  }
  const lx = X0 + ear + 12;
  a.ycyl(YF + 3, YF + 11, lx + 4, Z0 + (Z1 - Z0) * 0.7, 5, 10); a.box(lx - 4, YF + 5, Z0 + (Z1 - Z0) * 0.3 - 3, lx + 12, YF + 11, Z0 + (Z1 - Z0) * 0.3 + 3);
  a.box(X1 - ear - 20, YF + 5, Z0 + (Z1 - Z0) * 0.35, X1 - ear - 4, YF + 11, Z0 + (Z1 - Z0) * 0.65);   // right panel: ports
  // rear: two PSUs, fan bank and ports
  const nP = v.u >= 2 ? 2 : 2, pw = m.min(70, (X1 - X0) * 0.14), ph = m.min(Z1 - Z0 - 6, 40 * m.min(u, 2));
  for (let i = 0; i < nP; i++) a.box(X0 + ear + 6 + i * (pw + 4), YB - 3, Z0 + 3, X0 + ear + 6 + i * (pw + 4) + pw, YB, Z0 + 3 + ph);
  a.box(cx - 30, YB - 3, Z0 + 3, X1 - ear - 6, YB, Z0 + 3 + ph * 0.5);
  if (u >= 2) a.box(cx - 30, YB - 3, Z0 + 3 + ph * 0.55, X1 - ear - 6, YB, Z1 - 4);
  a.rect(X0 + ear + 6, YB - 3, X0 + ear + 6 + 2 * pw + 4, YB, 'EQUIP-DETAIL');
  a.log(v.gpu ? `Added the chassis and rack ears, a face of four large fans with grilles, control wing, rear power supplies and ports (plan and 3D).` : `Added the chassis with rack ears, ${v.cols * v.rows} ${v.lff ? 'large' : 'small'}-form trays for drives on the face, power button and indicators, rear power supplies and ports (plan and 3D).`);
}

/** a blade chassis: front blade slots in a row, a top control strip, a bottom row of power supplies, rear fan and switch modules */
function blade(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, ear = 15, bx0 = X0 + ear + 12, bx1 = X1 - ear - 12;
  a.outline(); a.rect(X0 + ear, YF + 6, X1 - ear, YB, 'EQUIP-DETAIL');
  a.box(X0 + ear + 2, YF + 8, Z0 + 2, X1 - ear - 2, YB, Z1 - 1);
  for (const [x0, x1] of [[X0, X0 + ear], [X1 - ear, X1]]) { a.box(x0, YF + 2, Z0 + 0.5, x1, YF + 6, Z1 - 0.5); for (let i = 0; i < v.u; i++) for (const zz of [0.17, 0.83]) a.box(x0 + 3, YF, Z0 + (i + zz) * U - 4, x1 - 3, YF + 2.5, Z0 + (i + zz) * U + 4); }
  const top = Z1 - 28, bot = Z0 + 18 + (v.u > 6 ? 50 : 40);
  a.box(bx0, YF + 6, Z1 - 24, bx1, YF + 11, Z1 - 5);
  const cw = (bx1 - bx0) / v.n, rows = v.half ? 2 : 1, rh = (top - 24 - bot) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < v.n / rows; c++) {
    const w = (bx1 - bx0) / (v.n / rows), x0 = bx0 + c * w + 2, x1 = bx0 + (c + 1) * w - 2, z0 = bot + r * rh + 2, z1 = bot + (r + 1) * rh - 2;
    a.box(x0, YF + 6, z0, x1, YF + 12, z1); a.box(x0 + 3, YF + 2, z0 + 4, x1 - 3, YF + 6, z0 + 20); a.box(x0 + (x1 - x0) * 0.35, YF + 2, z1 - 18, x0 + (x1 - x0) * 0.65, YF + 6, z1 - 6);
    a.cyl(x0 + 6, YF + 12, z1 - 6, z1 - 4, 2.2, 6);
  }
  const np = v.psu; for (let i = 0; i < np; i++) { const w = (bx1 - bx0) / np; a.box(bx0 + i * w + 3, YF + 6, Z0 + 5, bx0 + (i + 1) * w - 3, YF + 14, bot - 5); a.box(bx0 + i * w + w * 0.3, YF + 3, Z0 + 8, bx0 + i * w + w * 0.7, YF + 14, Z0 + 14); }
  const fw = (bx1 - bx0) / 5; for (let i = 0; i < 5; i++) { a.box(bx0 + i * fw + 2, YB - 5, Z0 + (Z1 - Z0) * 0.55, bx0 + (i + 1) * fw - 2, YB, Z1 - 8); a.ycyl(YB - 5, YB, bx0 + (i + 0.5) * fw, Z0 + (Z1 - Z0) * 0.78, 22, 14); }
  for (let i = 0; i < 6; i++) a.box(bx0 + i * ((bx1 - bx0) / 6) + 2, YB - 5, Z0 + 8, bx0 + (i + 1) * ((bx1 - bx0) / 6) - 2, YB, Z0 + (Z1 - Z0) * 0.48);
  a.log(`Added the chassis with ${v.n} blade slots, a control strip, ${np} power supplies, and rear fan and switch module bays (plan and 3D).`);
}

/** a storage array: face of drive trays (2U) or a 4U top-loading drawer with a handle, LEDs and rack ears */
function storage(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, ear = 15;
  a.outline(); a.rect(X0 + ear, YF + 5, X1 - ear, YB, 'EQUIP-DETAIL');
  a.box(X0 + ear + 2, YF + 8, Z0 + 2, X1 - ear - 2, YB, Z1 - 1);
  for (const [x0, x1] of [[X0, X0 + ear], [X1 - ear, X1]]) { a.box(x0, YF + 2, Z0 + 0.5, x1, YF + 6, Z1 - 0.5); for (let i = 0; i < v.u; i++) for (const zz of [0.17, 0.83]) a.box(x0 + 3, YF, Z0 + (i + zz) * U - 4, x1 - 3, YF + 2.5, Z0 + (i + zz) * U + 4); }
  const bx0 = X0 + ear + 4, bx1 = X1 - ear - 4;
  if (v.top) {
    a.box(bx0, YF + 8, Z0 + 4, bx1, YF + 14, Z1 - 4);                              // drawer front
    a.box(cx - W * 0.2, YF, Z0 + (Z1 - Z0) * 0.55, cx + W * 0.2, YF + 14, Z0 + (Z1 - Z0) * 0.65); // handle
    for (let i = 0; i < 6; i++) a.cyl(bx0 + 16 + i * 14, YF + 14, Z1 - 22, Z1 - 20, 3.5, 8);
    ribs(a, bx0 + 20, Z0 + 16, bx1 - 20, Z0 + (Z1 - Z0) * 0.45, YF + 2, 5, true, 3, 6);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 12; c++) a.box(bx0 + 10 + c * ((bx1 - bx0 - 20) / 12) + 2, YF + 20 + r * ((D * 0.55) / 5), Z1, bx0 + 10 + (c + 1) * ((bx1 - bx0 - 20) / 12) - 2, YF + 20 + (r + 1) * ((D * 0.55) / 5) - 3, Z1 + 0.01);
    a.line(bx0, YF + D * 0.6, bx1, YF + D * 0.6, 'EQUIP-DETAIL');
  } else {
    const cols = 4, rows = 3, cw = (bx1 - bx0 - 100) / cols, rh = (Z1 - Z0 - 12) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x0 = bx0 + 100 + c * cw + 1.5, z0 = Z0 + 6 + r * rh + 1.5; a.box(x0, YF + 6, z0, x0 + cw - 3, YF + 11, z0 + rh - 3); a.box(x0 + 5, YF + 3, z0 + (rh - 3) * 0.3, x0 + cw - 8, YF + 6, z0 + (rh - 3) * 0.7); a.cyl(x0 + cw - 6, YF + 11, z0 + 4, z0 + 5, 1.6, 5); }
    a.box(bx0 + 4, YF + 6, Z0 + 6, bx0 + 90, YF + 11, Z1 - 6); a.box(bx0 + 20, YF + 3, Z0 + 20, bx0 + 70, YF + 11, Z0 + 34);
  }
  for (let i = 0; i < 2; i++) a.box(X0 + ear + 6 + i * 76, YB - 3, Z0 + 3, X0 + ear + 76 + i * 76 - 4, YB, Z1 - 6);
  a.box(cx + 10, YB - 3, Z0 + 3, X1 - ear - 6, YB, Z1 - 6);
  a.log(v.top ? 'Added the chassis, top-loading drive drawer with a handle and a drive grid on the lid, rack ears and rear controller bays (plan and 3D).' : 'Added the chassis with twelve 3.5 in drive trays and a controller panel, rack ears and rear controller bays (plan and 3D).');
}

/** rack-mounted device faces: fill = list of unit heights stacked from the top of the rail run */
function devices(a, x0, x1, y0, y1, ztop, fill, gap = 1) {
  let z = ztop;
  for (const u of fill) { if (u < 0) { z += u * U; continue; } z -= u * U; a.box(x0, y0, z + gap, x1, y1, z + u * U - gap); a.box(x0 - 18, y0 - 3, z + gap, x0, y0, z + u * U - gap); a.box(x1, y0 - 3, z + gap, x1 + 18, y0, z + u * U - gap); a.box(x0 + 12, y0 - 3, z + u * U * 0.3, x1 - 12, y0, z + u * U * 0.7); for (let k = 0; k < 4; k++) a.box(x0 + 24 + k * 20, y0 - 5, z + u * U * 0.42, x0 + 36 + k * 20, y0 - 3, z + u * U * 0.58); }
}
/** a 19 in cabinet: four corner posts, top and base, side panels, mounting rails with U holes, a mesh front door and rear door, casters or feet, cable entry */
function cabinet(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, p = 36, fz = 100, t = 3;
  a.outline(); a.rect(X0 + 5, YF + 5, X1 - 5, YB - 5, 'EQUIP-DETAIL');
  for (const x of [X0 + p / 2, X1 - p / 2]) for (const y of [YF + p / 2, YB - p / 2]) a.box(x - p / 2, y - p / 2, Z0 + fz, x + p / 2, y + p / 2, Z1 - 30);
  a.box(X0, YF, Z1 - 30, X1, YB, Z1); a.box(X0 + 20, YF + 40, Z1 - 36, X1 - 20, YB - 40, Z1 - 30);   // roof
  a.box(X0 + 20, YB * 0.5 + YF * 0.5 - 70, Z1, X1 - 20, YB * 0.5 + YF * 0.5 + 70, Z1);
  a.box(X0, YF, Z0 + fz - 30, X1, YB, Z0 + fz);                                                // base plinth
  for (const x of [X0 + 50, X1 - 50]) for (const y of [YF + 50, YB - 50]) { if (v.cast) { a.cyl(x, y, Z0 + 38, Z0 + fz - 30, 8, 8); a.xcyl(x - 8, x + 8, y, Z0 + 38, 38, 12); } else { a.cyl(x, y, Z0 + 10, Z0 + fz - 30, 14, 8); a.cyl(x, y, Z0, Z0 + 10, 28, 10); } }
  for (const s of [0, 1]) { const x = s ? X1 - t : X0; a.box(x, YF + 30, Z0 + fz, x + t, YB - 30, Z1 - 36); }
  if (v.vent) { ribs(a, X0 - 0, Z0 + fz + 20, X0 + 0.01, Z1 - 80, YF + 60, 1, true); }
  const rz0 = Z0 + fz + 20, rz1 = Z1 - 60;
  for (const y of [YF + D * 0.22, YB - D * 0.22]) for (const x of [X0 + 70, X1 - 70]) { a.box(x - 11, y - 1.5, rz0, x + 11, y + 1.5, rz1); for (let i = 0; i < v.u; i++) a.box(x - 9, y - 1.6, rz0 + i * U + 12, x + 9, y + 1.6, rz0 + i * U + 20); }
  if (v.fill) devices(a, X0 + 70 + 14, X1 - 70 - 14, YF + D * 0.22 - 2, YB - D * 0.3, rz1, v.fill);
  for (let i = 0; i < v.shelf; i++) { const z = rz0 + (rz1 - rz0) * ((i + 1) / (v.shelf + 1)); a.box(X0 + 70, YF + D * 0.2, z, X1 - 70, YB - D * 0.18, z + 3); a.box(X0 + 70, YF + D * 0.2, z, X1 - 70, YF + D * 0.2 + 3, z + 20); }
  if (v.pdu) for (const x of [X0 + 40, X1 - 40]) { a.box(x - 14, YB - 50, rz0 + (rz1 - rz0) * 0.15, x + 14, YB - 20, rz1 - (rz1 - rz0) * 0.15); for (let i = 0; i < 12; i++) a.box(x - 10, YB - 52, rz0 + (rz1 - rz0) * 0.17 + i * ((rz1 - rz0) * 0.66 / 12), x + 10, YB - 50, rz0 + (rz1 - rz0) * 0.17 + i * ((rz1 - rz0) * 0.66 / 12) + 18); }
  // front door: frame with vertical mesh bars, lock and handle; rear door the same, thinner
  const dz0 = Z0 + fz + 10, dz1 = Z1 - 38, df = 28;
  const door = (y) => { a.frame(X0 + 4, dz0, X1 - 4, dz1, y, y + 10, df); const n = v.glass ? 3 : m.round((X1 - X0) / 14); if (v.glass) { a.box(cx - 1.5, y + 2, dz0 + df, cx + 1.5, y + 5, dz1 - df); } else ribs(a, X0 + 4 + df, dz0 + df, X1 - 4 - df, dz1 - df, y + 3, n, false, 4, 4); };
  door(YF); door(YB - 12);
  a.box(X1 - 40, YF - 0.0, (dz0 + dz1) / 2 - 90, X1 - 22, YF + 2, (dz0 + dz1) / 2 + 90 > Z1 ? Z1 : (dz0 + dz1) / 2 + 90); a.cyl(X1 - 31, YF + 3, (dz0 + dz1) / 2 + 20, (dz0 + dz1) / 2 + 21, 9, 10);
  a.box(X0 + 20, YF + 6, Z0 + fz + 14 - 0, X0 + 40, YF + 10, Z0 + fz + 14 + 1) ;
  a.log(`Added the corner posts, roof with cable entry, side panels, ${v.u} U of mounting rails with U holes, ${v.shelf ? v.shelf + ' shelf' + (v.shelf > 1 ? 'ves' : '') + ', ' : ''}${v.pdu ? 'two vertical power strips, ' : ''}front and rear ${v.glass ? 'glazed' : 'mesh'} doors with a lock and ${v.cast ? 'casters' : 'levelling feet'} (plan and 3D).`);
}

/** an open-frame rack: two (relay) or four posts with U holes, base feet and a top bar, with optional cable management */
function openRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, pw = 45;
  a.outline(); for (const x of [X0 + 20, X1 - 20]) a.rect(x - 20, YF, x + 20, v.posts === 2 ? YF + 70 : YB, 'EQUIP-DETAIL');
  const ys = v.posts === 2 ? [cy - 6] : [YF + 40, YB - 40];
  for (const y of ys) for (const [x0, x1] of [[X0, X0 + pw], [X1 - pw, X1]]) { a.box(x0, y - 20, Z0 + 30, x1, y + 20, Z1 - 24); for (let i = 0; i < v.u; i++) for (const zz of [0.17, 0.5, 0.83]) a.box(x0 + 10, y - 21, Z0 + 60 + (i + zz) * U - 3, x1 - 10, y + 21, Z0 + 60 + (i + zz) * U + 3); }
  for (const y of v.posts === 2 ? [cy - 6] : [YF + 40, YB - 40]) { a.box(X0 - 0, y - 30, Z0, X1, y + 30, Z0 + 30); a.box(X0, y - 30, Z1 - 24, X1, y + 30, Z1); }
  if (v.fill) devices(a, X0 + pw + 18, X1 - pw - 18, ys[0] - 24, m.min(YB - 2, ys[0] - 24 + (v.posts === 2 ? 230 : 330)), Z0 + 60 + v.u * U, v.fill);
  if (v.posts === 4) { a.box(X0, YF + 40, Z0 + 30, X0 + 20, YB - 40, Z0 + 50); a.box(X1 - 20, YF + 40, Z0 + 30, X1, YB - 40, Z0 + 50); a.box(X0, YF + 40, Z1 - 40, X0 + 20, YB - 40, Z1 - 24); a.box(X1 - 20, YF + 40, Z1 - 40, X1, YB - 40, Z1 - 24); }
  if (v.mgr) for (const x of [X0 - 0 + pw, X1 - pw - 24]) { a.box(x, YF + 3, Z0 + 60, x + 24, YF + 60, Z1 - 60); for (let i = 0; i < 14; i++) a.box(x - 0, YF + 3, Z0 + 80 + i * ((Z1 - Z0 - 200) / 14), x + 24, YF + 6 + 40, Z0 + 86 + i * ((Z1 - Z0 - 200) / 14)); }
  a.log(`Added ${v.posts} posts with U-hole patterns, base and top ${v.posts === 2 ? 'bars' : 'frames'}${v.mgr ? ' and vertical cable managers with fingers' : ''} (plan and 3D).`);
}

/** a cable tray run: a ladder (side rails and rungs) or a wire basket (longitudinal and cross wires) laid flat, length along Y */
function tray(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.rect(X0, YF, X1, YB);
  if (v.kind === 'ladder') {
    for (const [x0, x1] of [[X0, X0 + 12], [X1 - 12, X1]]) { a.box(x0, YF, Z0, x1, YB, Z1); a.box(x0 - 0, YF, Z1 - 12, x0 === X0 ? x0 + 28 : x1 - 28, YB, Z1); a.box(x0, YF, Z0, x0 === X0 ? x0 + 28 : x1 - 28, YB, Z0 + 12); }
    const n = m.round(D / 300); for (let i = 0; i <= n; i++) { const y = YF + 20 + (D - 40) * (i / n); a.box(X0 + 12, y - 14, Z0 + 8, X1 - 12, y + 14, Z0 + 28); a.line(X0, y, X1, y, 'EQUIP-DETAIL'); }
    for (const f of [0.5]) { a.box(X0 - 14, YF + D * f - 20, Z0 - 0, X0, YF + D * f + 20, Z1); }
    a.log(`Added the two side rails with flanges and ${n + 1} rungs at 12 in centres, and a splice plate (plan and 3D).`);
  } else {
    const nl = m.round(W / 50), nc = m.round(D / 50);
    for (let i = 0; i <= nl; i++) a.box(X0 + (W - 5) * (i / nl), YF, Z0, X0 + (W - 5) * (i / nl) + 5, YB, Z0 + 5);
    for (const x of [X0, X1 - 5]) { a.box(x, YF, Z0, x + 5, YB, Z1); a.box(x - (x === X0 ? 0 : 8), YF, Z1 - 5, x + (x === X0 ? 13 : 5), YB, Z1); }
    for (let i = 0; i <= nc; i++) { const y = YF + (D - 5) * (i / nc); a.box(X0, y, Z0, X1, y + 5, Z0 + 5); a.line(X0, y, X1, y, 'EQUIP-DETAIL'); a.box(X0, y, Z0, X0 + 5, y + 5, Z1); a.box(X1 - 5, y, Z0, X1, y + 5, Z1); }
    a.log(`Added the longitudinal base wires, cross wires at 2 in centres and the stiffened side wires with a safe top edge (plan and 3D).`);
  }
}

/** a power distribution unit: vertical (zero-U strip with outlet pairs and a breaker) or a 1U horizontal strip */
function pdu(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  if (v.hor) {
    a.outline(); a.box(X0 + 16, YF + 4, Z0 + 1, X1 - 16, YB, Z1 - 1); for (const x of [X0, X1 - 15]) { a.box(x, YF + 2, Z0 + 0.5, x + 15, YF + 5, Z1 - 0.5); }
    const n = v.n, w = (W - 120) / n; for (let i = 0; i < n; i++) { a.box(X0 + 90 + i * w + 2, YF, Z0 + 8, X0 + 90 + (i + 1) * w - 2, YF + 6, Z1 - 8); a.box(X0 + 90 + i * w + w * 0.3, YF - 0, Z0 + 10, X0 + 90 + i * w + w * 0.7, YF + 6.5, Z0 + 14); }
    a.box(X0 + 24, YF, Z0 + 8, X0 + 70, YF + 7, Z1 - 8); a.cyl(X0 + 40, YF + 7, Z0 + 14, Z0 + 15, 4, 6); a.tube([[X1 - 8, YB, Z0 + 20], [X1 - 8, YB + 0, Z0 + 20]], [5, 5], 6);
    a.log(`Added the 1U housing with rack ears, ${n} outlets, a breaker and a meter (plan and 3D).`);
  } else {
    a.outline(); a.box(X0, YF, Z0 + 30, X1, YB, Z1 - 0);
    a.box(X0 - 0, YF, Z0 + 4, X1, YB, Z0 + 30); a.tube([[cx, cy_(a), Z0 + 14], [cx, cy_(a), Z0 + 4]], [12, 12], 8);
    const n = v.n; for (let i = 0; i < n; i++) { const z = Z0 + 90 + i * ((Z1 - Z0 - 180) / n); a.box(X0 + 4, YF - 0, z + 2, X1 - 4, YF + 3, z + (Z1 - Z0 - 180) / n - 6); }
    a.box(X0 + 2, YF, Z1 - 70, X1 - 2, YF + 4, Z1 - 18); a.log(`Added the strip housing, ${n} outlets in a column, a breaker panel and a bottom power lead (plan and 3D).`);
  }
}

const SRV = [
  fam({ cat: 'computer/servers', title: 'Generic rack server',
    desc: (v) => v.gpu ? `${v.u}U rack server with a face of four large fans behind grilles, rack ears, a control wing and rear power supplies.` : `${v.u}U rack server with rack ears and ${v.cols * v.rows} ${v.lff ? 'large' : 'small'}-form trays for drives on the face, power button, indicators and rear power supplies.`,
    vs: [['1U, 4 bays', 19, 28, 1.72, 0, { u: 1, cols: 4, rows: 1, lff: 1 }], ['1U, 10 bays', 19, 29, 1.72, 0, { u: 1, cols: 10, rows: 1 }], ['2U, 12 bays', 19, 30, 3.47, 0, { u: 2, cols: 4, rows: 3, lff: 1 }], ['2U, 24 bays', 19, 29, 3.47, 0, { u: 2, cols: 24, rows: 1 }],
      ['4U, 36 bays', 19, 31, 6.97, 0, { u: 4, cols: 12, rows: 3, lff: 1 }], ['4U, GPU fan face', 19, 33, 6.97, 0, { u: 4, gpu: 1 }]],
    build: rackServer }),
  fam({ cat: 'computer/servers', title: 'Generic blade chassis',
    desc: (v) => `${v.u}U blade enclosure with ${v.n} blade slots, a control strip, ${v.psu} power supplies and rear fan and switch module bays.`,
    vs: [['6U, 8 blade slots', 19, 29, 10.4, 0, { u: 6, n: 8, psu: 4 }], ['10U, 16 half-height blades', 19, 32, 17.4, 0, { u: 10, n: 16, half: 0, psu: 6 }]],
    build: blade }),
  fam({ cat: 'computer/servers', title: 'Generic storage array',
    desc: (v) => v.top ? `${v.u}U storage array with a top-loading drive drawer, handle, LEDs on the lid, rack ears and rear controller bays.` : `${v.u}U storage array with twelve drive trays and a controller panel, rack ears and rear controller bays.`,
    vs: [['2U, 12 bay', 19, 24, 3.47, 0, { u: 2 }], ['4U, 60 bay top-load', 19, 40, 6.97, 0, { u: 4, top: 1 }]],
    build: storage }),
  fam({ cat: 'computer/servers', title: 'Generic server rack cabinet',
    desc: (v) => `${v.u}U 19 in cabinet: corner posts, roof with cable entry, side panels, mounting rails with U holes${v.shelf ? ', ' + v.shelf + ' shelf' + (v.shelf > 1 ? 'ves' : '') : ''}${v.pdu ? ', two vertical power strips' : ''}, front and rear ${v.glass ? 'glazed' : 'mesh'} doors and ${v.cast ? 'casters' : 'levelling feet'}.`,
    vs: [['12U, glazed door, low', 24, 24, 31, 0, { u: 12, glass: 1, shelf: 1, cast: 1, fill: [1, 1, 2, 1] }], ['22U, glazed door', 24, 36, 50, 0, { u: 22, glass: 1, shelf: 2, cast: 1, fill: [1, 1, 1, 2, 2, 1] }], ['42U, mesh doors, 2 power strips', 24, 42, 82, 0, { u: 42, shelf: 2, pdu: 1, cast: 1, fill: [1, 1, 2, 2, -1, 1, 1, 4, -2, 2, 2] }], ['48U, deep, mesh doors', 31.5, 47, 93, 0, { u: 48, shelf: 3, pdu: 1, fill: [1, 2, 2, 4, 4, -1, 2, 2, 1, 1] }]],
    build: cabinet }),
  fam({ cat: 'computer/servers', title: 'Generic open-frame rack',
    desc: (v) => `${v.posts === 2 ? 'Two-post relay' : 'Four-post open'} rack, ${v.u}U, with U-hole posts, base feet and a top bar${v.mgr ? ' and vertical cable managers' : ''}.`,
    vs: [['two post, 24U', 22, 18, 46, 0, { posts: 2, u: 24, fill: [1, 1, 2, -1, 1, 1] }], ['two post, 45U, cable managers', 23, 18, 84, 0, { posts: 2, u: 42, mgr: 1 }], ['four post, 42U', 21, 32, 80, 0, { posts: 4, u: 42, fill: [1, 2, 2, -1, 4, 4, 1] }]],
    build: openRack }),
  fam({ cat: 'computer/servers', title: 'Generic cable tray',
    desc: (v) => v.kind === 'ladder' ? 'Ladder cable tray section: two flanged side rails with rungs at 12 in centres and a splice plate.' : 'Wire-basket cable tray section: base wires, cross wires and stiffened side wires.',
    vs: [['ladder, 12 in wide, 10 ft', 12, 120, 4, 96, { kind: 'ladder' }], ['ladder, 24 in wide, 10 ft', 24, 120, 6, 96, { kind: 'ladder' }], ['wire basket, 12 in wide, 6 ft', 12, 72, 4, 96, { kind: 'wire' }], ['wire basket, 18 in wide, 6 ft', 18, 72, 4, 96, { kind: 'wire' }]],
    build: tray }),
  fam({ cat: 'computer/servers', title: 'Generic rack power strip',
    desc: (v) => v.hor ? `1U horizontal power strip with rack ears, ${v.n} outlets, a breaker and a meter.` : `Vertical zero-U power strip with ${v.n} outlets in a column and a breaker panel.`,
    vs: [['1U, 8 outlets', 19, 3, 1.72, 0, { hor: 1, n: 8 }], ['vertical, 24 outlets', 1.8, 2.6, 62, 0, { n: 24 }]],
    build: pdu }),
];

// ------------------------------------------------------------------------------------------ network
/** an RJ45 jack on a face: a small box with a latch notch */
function jack(a, x, z, y, w = 13, h = 11) { a.box(x, y, z, x + w, y + 7, z + h); a.box(x + w * 0.25, y - 1.5, z + h * 0.2, x + w * 0.75, y, z + h * 0.62); }
/** a rack-mount network box: ears, chassis, ports grouped in two rows, LEDs, console port, rear fans; v.p ports, v.sfp uplinks */
function netRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, ear = 15, u = v.u;
  a.outline(); a.rect(X0 + ear, YF + 5, X1 - ear, YB, 'EQUIP-DETAIL');
  a.box(X0 + ear + 2, YF + 8, Z0 + 2, X1 - ear - 2, YB, Z1 - 1);
  for (const [x0, x1] of [[X0, X0 + ear], [X1 - ear, X1]]) { a.box(x0, YF + 2, Z0 + 0.5, x1, YF + 5, Z1 - 0.5); for (let i = 0; i < u; i++) for (const zz of [0.17, 0.83]) a.box(x0 + 3, YF, Z0 + (i + zz) * U - 4, x1 - 3, YF + 2.5, Z0 + (i + zz) * U + 4); }
  const rows = v.rows, gx0 = X0 + ear + 70, gx1 = X1 - ear - 12 - (v.sfp ? v.sfp * 15 + 10 : 0), per = v.p / rows, pw = (gx1 - gx0) / per, rh = (Z1 - Z0 - 10) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < per; c++) {
    const gap = m.floor(c / 4) * 3 * (per > 8 ? 1 : 0), x = gx0 + c * pw + 1;
    a.box(x, YF + 8, Z0 + 5 + r * rh + 2, x + pw - 2, YF + 11, Z0 + 5 + (r + 1) * rh - 2);
    a.box(x + pw * 0.15, YF + 5, Z0 + 5 + r * rh + rh * 0.2, x + pw - 2 - pw * 0.15, YF + 8, Z0 + 5 + r * rh + rh * 0.65);
    a.box(x + 2, YF + 8, Z0 + 5 + (r + 1) * rh - 5, x + 5, YF + 12, Z0 + 5 + (r + 1) * rh - 2);
  }
  if (v.sfp) for (let i = 0; i < v.sfp; i++) { const x = gx1 + 12 + i * 15; for (let r = 0; r < rows; r++) a.box(x, YF + 5, Z0 + 5 + r * rh + 3, x + 12, YF + 12, Z0 + 5 + (r + 1) * rh - 3); }
  a.box(X0 + ear + 8, YF + 8, Z0 + (Z1 - Z0) * 0.55, X0 + ear + 40, YF + 12, Z1 - 5);   // status panel
  for (let i = 0; i < 3; i++) a.cyl(X0 + ear + 16 + i * 10, YF + 12, Z1 - 11, Z1 - 10, 2.5, 6);
  a.box(X0 + ear + 8, YF + 4, Z0 + 5, X0 + ear + 28, YF + 8, Z0 + (Z1 - Z0) * 0.4);    // console port
  const nf = v.fan ?? 2; for (let i = 0; i < nf; i++) { const w = (X1 - X0 - 2 * ear - 140) / nf; a.box(X0 + ear + 120 + i * w, YB - 3, Z0 + 4, X0 + ear + 120 + (i + 1) * w - 4, YB, Z1 - 4); }
  a.box(X0 + ear + 6, YB - 3, Z0 + 4, X0 + ear + 106, YB, Z1 - 4);
  a.log(`Added the chassis with rack ears, ${v.p} RJ45 ports in ${rows} row${rows > 1 ? 's' : ''}${v.sfp ? ', ' + v.sfp + ' uplink cages' : ''}, status LEDs, console port, rear fans and a power supply bay (plan and 3D).`);
}

/** a small desktop network box with a front port row and LEDs (switch, firewall, modem) on rubber feet, optional wall-mount ears */
function netDesk(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  a.outline(); feet(a, X0 + 20, X1 - 20, YF + 20, YB - 20, 8, 3);
  a.prism(rr(X0, YF + 5, X1, YB, 8), Z0 + 3, Z1); a.poly(rr(X0, YF, X1, YB, 8));
  const pw = (W - 70) / v.p;
  for (let i = 0; i < v.p; i++) { a.box(X0 + 55 + i * pw, YF + 1, Z0 + H * 0.2, X0 + 55 + (i + 1) * pw - 3, YF + 6, Z0 + H * 0.62); a.box(X0 + 55 + i * pw + 2, YF, Z0 + H * 0.34, X0 + 55 + (i + 1) * pw - 5, YF + 1.6, Z0 + H * 0.5); }
  for (let i = 0; i < v.led; i++) a.cyl(X0 + 12 + (i % 3) * 9, YF + 6, Z0 + H * 0.75 - m.floor(i / 3) * 9, Z0 + H * 0.75 - m.floor(i / 3) * 9 + 1, 2.2, 6);
  ribs(a, X0 + W * 0.3, Z1 - 0.1, X1 - W * 0.3, Z1, YF + D * 0.3, 1, true, 1, 1);
  for (let i = 0; i < 8; i++) a.box(X0 + W * 0.25 + i * (W * 0.5 / 8), YF + D * 0.25, Z1, X0 + W * 0.25 + i * (W * 0.5 / 8) + 3, YB - D * 0.25, Z1 + 0.01);
  if (v.ears) for (const s of [-1, 1]) a.box(s < 0 ? X0 - 0 : X1 - 14, YB - 6, Z0 + 4, s < 0 ? X0 + 14 : X1, YB, Z1 - 4);
  a.log(`Added the housing with ${v.p} front ports, ${v.led} status LEDs, a top vent and rubber feet (plan and 3D).`);
}

/** a router with antennas: low body, an LED strip, rear port row and n antennas on hinged stalks */
function router(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, bh = v.bh;
  slab(a, X0 + 8, YF + 8, X1 - 8, YB - 8, Z0 + 4, Z0 + bh, 14); feet(a, X0 + 24, X1 - 24, YF + 24, YB - 24, 8, 4);
  for (let i = 0; i < 6; i++) a.cyl(X0 + W * 0.3 + i * 12, YF + 5, Z0 + bh * 0.55, Z0 + bh * 0.55 + 1.6, 2.4, 6);
  ribs(a, X0 + 20, Z0 + bh - 1, X1 - 20, Z0 + bh, YF + 20, 1, true, 1, 1);
  for (let i = 0; i < 12; i++) a.box(X0 + 26 + i * ((W - 52) / 12), YF + D * 0.3, Z0 + bh, X0 + 26 + i * ((W - 52) / 12) + 3, YB - D * 0.25, Z0 + bh + 0.01);
  for (let i = 0; i < 5; i++) a.box(X0 + 30 + i * 18, YB - 9, Z0 + 6, X0 + 30 + i * 18 + 15, YB - 8, Z0 + bh - 6);
  const n = v.ant; for (let i = 0; i < n; i++) { const x = n === 1 ? cx : X0 + 20 + (i * (W - 40)) / (n - 1), top = Z1; a.box(x - 7, YB - 22, Z0 + bh - 8, x + 7, YB - 8, Z0 + bh + 14); a.cyl(x, YB - 15, Z0 + bh + 14, Z0 + bh + 24, 6, 8); a.tube([[x, YB - 15, Z0 + bh + 24], [x, YB - 15, top - 2], [x, YB - 15, top]], [5.5, 5.5, 4], 8); a.circ(x, YB - 15, 6, 'EQUIP-DETAIL'); }
  a.log(`Added the low body with a status LED row, top vent and rear ports, and ${n} hinged antennas (plan and 3D).`);
}

/** a patch panel: 1U or 2U, ports in rows with labels, rear punch-down, optional cable manager bar */
function patch(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, ear = 15, u = v.u;
  a.outline();
  a.box(X0, YF + 3, Z0 + 0.5, X1, YF + 6, Z1 - 0.5); for (let i = 0; i < u; i++) for (const x of [X0 + 7, X1 - 22]) for (const zz of [0.17, 0.83]) a.box(x, YF, Z0 + (i + zz) * U - 4, x + 15, YF + 3.5, Z0 + (i + zz) * U + 4);
  const rows = v.rows, per = v.p / rows, gx0 = X0 + 30, gx1 = X1 - 30, pw = (gx1 - gx0) / per, rh = (Z1 - Z0 - 6) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < per; c++) { const x = gx0 + c * pw + (m.floor(c / 6) * 2.2); a.box(x + 1, YF, Z0 + 3 + r * rh + rh * 0.12, x + pw - 3.2, YF + 3, Z0 + 3 + (r + 1) * rh - rh * 0.3); a.box(x + 3, YF, Z0 + 3 + (r + 1) * rh - rh * 0.26, x + pw - 5, YF + 2, Z0 + 3 + (r + 1) * rh - rh * 0.1); }
  a.box(X0 + 30, YF + 6, Z0 + 3, X1 - 30, YB - D * 0.4, Z1 - 3);
  const nr = v.p; for (let i = 0; i < 6; i++) a.box(gx0 + i * ((gx1 - gx0) / 6) + 2, YB - D * 0.4, Z0 + 4, gx0 + (i + 1) * ((gx1 - gx0) / 6) - 2, YB, Z1 - 4);
  if (v.mgr) { a.box(X0, YB - 0, Z0, X0, YB, Z0); }
  a.line(X0 + 30, YF + 6, X1 - 30, YF + 6, 'EQUIP-DETAIL');
  a.log(`Added the ${u}U faceplate with ${v.p} ports in ${rows} row${rows > 1 ? 's' : ''} with label strips, rack ears and a rear punch-down bar with cable tie bars (plan and 3D).`);
}

/** a wireless access point: ceiling disc, wall plate, or outdoor housing with antennas */
function ap(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  if (v.kind === 'disc') {
    a.cyl(cx, cy, Z0 + H * 0.35, Z1, W * 0.5, 36); a.cone(cx, cy, Z0, Z0 + H * 0.35, W * 0.4, W * 0.5, 36); a.circ(cx, cy, W * 0.5); a.circ(cx, cy, W * 0.3, 'EQUIP-DETAIL');
    a.ell(cx, cy, Z0 + H * 0.05, W * 0.1, W * 0.1, H * 0.05, 10, 4);
    a.cyl(cx, cy, Z0, Z0 + 3, W * 0.3, 24); for (let i = 0; i < 12; i++) { const t = (i / 12) * 2 * m.PI; a.cyl(cx + m.cos(t) * W * 0.38, cy + m.sin(t) * W * 0.38, Z0 + H * 0.2, Z0 + H * 0.22, 3, 6); }
    a.log('Added the domed disc body with a ceiling mounting ring, LED, vent ring and a hidden port face (plan and 3D).');
  } else if (v.kind === 'wall') {
    a.outline(); slab(a, X0, YF + 3, X1, YB, Z0, Z1, 14); a.ycyl(YF, YF + 4, cx, Z0 + H * 0.78, 5, 10);
    for (let i = 0; i < 4; i++) { a.box(X0 + W * 0.15 + i * (W * 0.7 / 4), YF + 1, Z0 + H * 0.2, X0 + W * 0.15 + i * (W * 0.7 / 4) + W * 0.16, YF + 4, Z0 + H * 0.45); }
    a.box(X0 + 6, YF + 2, Z0 + 6, X1 - 6, YF + 3.5, Z0 + 10);
    a.log('Added the wall plate with an LED, four wired ports and a mounting frame (plan and 3D).');
  } else {
    a.outline(); slab(a, X0 + W * 0.18, YF + D * 0.1, X1 - W * 0.18, YB, Z0 + H * 0.1, Z1 - H * 0.28, 10); a.box(X0 + W * 0.2, YF, Z0 + H * 0.16, X1 - W * 0.2, YF + D * 0.12, Z0 + H * 0.16 + 18);
    ribs(a, X0 + W * 0.3, Z0 + H * 0.2, X1 - W * 0.3, Z1 - H * 0.35, YF + D * 0.1 - 0, 5, true, 2, 2);
    for (const s of [-1, 1]) { const x = cx + s * (W * 0.36); a.tube([[x, YB - 20, Z1 - H * 0.28], [x, YB - 20, Z1 - H * 0.1], [x, YB - 20, Z1 - 1]], [10, 10, 7], 10); a.box(x - 14, YB - 34, Z1 - H * 0.3, x + 14, YB - 6, Z1 - H * 0.28 + 6); }
    a.box(cx - 20, YB - 30, Z0, cx + 20, YB, Z1 - H * 0.28); a.rect(cx - 20, YB - 30, cx + 20, YB, 'EQUIP-DETAIL');
    a.log('Added the sealed housing with a lower cable gland, two antennas and a rear mounting bracket (plan and 3D).');
  }
}

/** a UPS: tower (display, outlets, vents), rack (ears, battery door, display) or a floor cabinet with double doors and casters */
function ups(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline();
  if (v.kind === 'tower') {
    a.prism(rr(X0, YF + 6, X1, YB, 14), Z0 + 10, Z1); a.poly(rr(X0, YF, X1, YB, 14)); feet(a, X0 + 20, X1 - 20, YF + 30, YB - 30, 10, 10);
    a.box(X0 + W * 0.2, YF + 1, Z0 + H * 0.78, X1 - W * 0.2, YF + 7, Z0 + H * 0.92);
    for (let i = 0; i < 3; i++) a.cyl(X0 + W * 0.25 + i * 16, YF + 2, Z0 + H * 0.68, Z0 + H * 0.68 + 1, 4, 8);
    a.cyl(X1 - W * 0.22, YF + 3, Z0 + H * 0.7, Z0 + H * 0.7 + 1, 8, 12);
    ribs(a, X0 + W * 0.18, Z0 + H * 0.12, X1 - W * 0.18, Z0 + H * 0.55, YF + 1, 8, true, 3, 5);
    for (let i = 0; i < 6; i++) a.box(X0 + 20 + i * ((W - 40) / 6), YB - 3, Z0 + H * 0.35, X0 + 20 + i * ((W - 40) / 6) + 22, YB, Z0 + H * 0.35 + 22);
    a.log('Added the tower housing with a display, status LEDs, power button, front vent slots, rear outlets and feet (plan and 3D).');
  } else if (v.kind === 'rack') {
    const ear = 15, u = v.u;
    a.box(X0 + ear + 2, YF + 8, Z0 + 2, X1 - ear - 2, YB, Z1 - 1);
    for (const [x0, x1] of [[X0, X0 + ear], [X1 - ear, X1]]) { a.box(x0, YF + 2, Z0 + 0.5, x1, YF + 5, Z1 - 0.5); for (let i = 0; i < u; i++) for (const zz of [0.17, 0.83]) a.box(x0 + 3, YF, Z0 + (i + zz) * U - 4, x1 - 3, YF + 2.5, Z0 + (i + zz) * U + 4); }
    a.box(X0 + ear + 6, YF + 5, Z0 + 6, X0 + ear + 96, YF + 12, Z1 - 6); a.box(X0 + ear + 14, YF + 3, Z0 + (Z1 - Z0) * 0.52, X0 + ear + 70, YF + 12, Z0 + (Z1 - Z0) * 0.8);
    a.box(cx - 60, YF + 8, Z0 + 5, X1 - ear - 14, YF + 12, Z1 - 5); ribs(a, cx - 40, Z0 + 12, X1 - ear - 30, Z1 - 12, YF + 4, u * 3, true, 3, 5);
    for (let i = 0; i < 4; i++) a.box(X0 + ear + 6 + i * 25, YB - 3, Z0 + 4, X0 + ear + 6 + i * 25 + 20, YB, Z0 + 4 + 20);
    a.rect(X0 + ear, YF + 8, X1 - ear, YB, 'EQUIP-DETAIL');
    a.log(`Added the ${u}U chassis with rack ears, battery door, display and LEDs, front vents and rear outlets (plan and 3D).`);
  } else {
    a.prism(rr(X0, YF + 8, X1, YB, 8), Z0 + 90, Z1); a.poly(rr(X0, YF, X1, YB, 8)); feet(a, X0 + 50, X1 - 50, YF + 50, YB - 50, 8, 0);
    for (const x of [X0 + 50, X1 - 50]) for (const y of [YF + 50, YB - 50]) { a.cyl(x, y, Z0 + 36, Z0 + 90, 8, 8); a.xcyl(x - 7, x + 7, y, Z0 + 36, 36, 12); }
    for (const s of [0, 1]) { const x0 = s ? cx + 2 : X0 + 14, x1 = s ? X1 - 14 : cx - 2; a.box(x0, YF + 1, Z0 + 110, x1, YF + 9, Z1 - 150); a.box(s ? x0 + 8 : x1 - 28, YF, Z0 + (Z1 - Z0) * 0.4, s ? x0 + 28 : x1 - 8, YF + 14, Z0 + (Z1 - Z0) * 0.5); }
    a.box(X0 + W * 0.15, YF + 2, Z1 - 120, X1 - W * 0.15, YF + 9, Z1 - 30); a.box(X0 + W * 0.22, YF, Z1 - 100, X1 - W * 0.22, YF + 8, Z1 - 60); for (let i = 0; i < 4; i++) a.cyl(X0 + W * 0.28 + i * 18, YF + 8, Z1 - 80, Z1 - 79, 4, 8);
    ribs(a, X0 + 14, Z0 + 94, X1 - 14, Z0 + 108, YF, 2, true, 3, 5);
    a.log('Added the floor cabinet with double battery doors and door handles, a control display with LEDs, lower vent slots, casters and levelling feet (plan and 3D).');
  }
}

/** a KVM: 1U switch with port rows and push buttons, or a 1U console drawer with handle and a closed lid */
function kvm(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, ear = 15;
  a.outline(); a.rect(X0 + ear, YF + 5, X1 - ear, YB, 'EQUIP-DETAIL');
  a.box(X0 + ear + 2, YF + 8, Z0 + 2, X1 - ear - 2, YB, Z1 - 1);
  for (const [x0, x1] of [[X0, X0 + ear], [X1 - ear, X1]]) { a.box(x0, YF + 2, Z0 + 0.5, x1, YF + 5, Z1 - 0.5); for (let i = 0; i < v.u; i++) for (const zz of [0.17, 0.83]) a.box(x0 + 3, YF, Z0 + (i + zz) * U - 4, x1 - 3, YF + 2.5, Z0 + (i + zz) * U + 4); }
  if (v.kind === 'switch') {
    const n = v.p, per = n / 2, gx0 = X0 + ear + 80, gx1 = X1 - ear - 12, pw = (gx1 - gx0) / per, rh = (Z1 - Z0 - 8) / 2;
    for (let r = 0; r < 2; r++) for (let c = 0; c < per; c++) { const x = gx0 + c * pw; a.box(x + 1, YF + 5, Z0 + 4 + r * rh + 4, x + pw - 5, YF + 10, Z0 + 4 + r * rh + rh * 0.55); a.cyl(x + pw - 2.5, YF + 10, Z0 + 4 + r * rh + rh * 0.4, Z0 + 4 + r * rh + rh * 0.4 + 1, 1.6, 6); }
    for (let i = 0; i < 4; i++) a.box(X0 + ear + 8 + i * 17, YF + 6, Z0 + 8, X0 + ear + 8 + i * 17 + 13, YF + 11, Z0 + 18);
    a.box(X0 + ear + 8, YF + 6, Z0 + 24, X0 + ear + 70, YF + 10, Z1 - 6);
    a.box(X0 + ear + 6, YB - 3, Z0 + 4, X1 - ear - 6, YB, Z1 - 4);
    a.log(`Added the 1U chassis with ${n} front ports in two rows with link lights, selector buttons, a display and rear ports (plan and 3D).`);
  } else {
    a.box(X0 + ear + 6, YF + 5, Z0 + 4, X1 - ear - 6, YF + 12, Z1 - 4); a.box(cx - W * 0.18, YF, Z0 + (Z1 - Z0) * 0.4, cx + W * 0.18, YF + 12, Z0 + (Z1 - Z0) * 0.62);
    for (const x of [X0 + ear + 14, X1 - ear - 20]) a.cyl(x, YF + 12, Z0 + 12, Z0 + 14, 3, 6);
    a.line(X0 + ear, YF + D * 0.5, X1 - ear, YF + D * 0.5, 'EQUIP-DETAIL');
    a.log('Added the slide-out drawer front with a pull handle, release latches and rack ears, with the closed lid line in plan (plan and 3D).');
  }
}

/** a wall-mount network cabinet: box shell, hinged glazed door with lock, vent slots, cable entries, rails */
function wallCab(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, t = 4;
  a.outline();
  a.box(X0, YF + 40, Z0, X1, YB, Z1); a.box(X0, YF + 40, Z0, X0 + t, YB, Z1);
  a.frame(X0, Z0, X1, Z1, YF, YF + 40, 24);
  a.frame(X0 + 24, Z0 + 24, X1 - 24, Z1 - 24, YF + 0, YF + 8, 14);
  a.box(X0 + 38, YF + 3, Z0 + 38, X1 - 38, YF + 6, Z1 - 38);
  a.box(X1 - 40, YF, (Z0 + Z1) / 2 - 20, X1 - 16, YF + 12, (Z0 + Z1) / 2 + 20); a.cyl(X1 - 28, YF + 12, (Z0 + Z1) / 2 - 1, (Z0 + Z1) / 2 + 1, 6, 8);
  for (const z of [Z0 + 80, Z1 - 80]) a.cyl(X0 + 10, YF + 6, z - 18, z + 18, 5, 6);
  ribs(a, X0 + 50, Z1 - 3, X1 - 50, Z1, YF + 90, 1, true, 1, 1);
  for (let i = 0; i < 9; i++) a.box(X0 + 50 + i * ((W - 100) / 9), YF + 70, Z1, X0 + 50 + i * ((W - 100) / 9) + 6, YB - 70, Z1 + 0.01);
  for (const x of [X0 + 70, X1 - 70]) { a.box(x - 10, YF + 70, Z0 + 28, x + 10, YF + 74, Z1 - 28); for (let i = 0; i < v.u; i++) a.box(x - 8, YF + 74, Z0 + 28 + i * U + 12, x + 8, YF + 76, Z0 + 28 + i * U + 20); }
  for (let i = 0; i < 3; i++) a.cyl(X0 + W * 0.3 + i * W * 0.2, YB - 15, Z0, Z0 + 3, 12, 10);
  a.log(`Added the shell with a hinged glazed door frame, lock and handle, ${v.u}U of rails with U holes, top vent slots and base cable entries (plan and 3D).`);
}

/** a broadband modem: an upright block with vertical vent ribs and an LED column, or a flat wall-mounted fibre terminal with a port cover */
function modem(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a;
  a.outline();
  if (v.kind === 'tall') {
    slab(a, X0, YF + 6, X1, YB, Z0 + 8, Z1, 16); slab(a, X0 - 0, YF + 6, X1, YB, Z0, Z0 + 8, 16);
    ribs(a, X0 + W * 0.14, Z0 + H * 0.12, X1 - W * 0.34, Z1 - H * 0.12, YF, 9, false, 3, 7);
    for (let i = 0; i < v.led; i++) a.cyl(X1 - W * 0.17, YF + 6, Z1 - H * 0.12 - i * ((H * 0.7) / v.led), Z1 - H * 0.12 - i * ((H * 0.7) / v.led) + 1, 4, 8);
    a.cyl(cx, YB - 4, Z0 + 14, Z0 + 20, 6, 8);
    a.log(`Added the upright housing with vertical vent ribs, a column of ${v.led} status LEDs, a base plinth and a rear connector (plan and 3D).`);
  } else {
    slab(a, X0, YF + 4, X1, YB, Z0, Z1, 14); a.box(X0 + W * 0.1, YF, Z0 + H * 0.15, X0 + W * 0.45, YF + 5, Z0 + H * 0.45);
    for (let i = 0; i < v.led; i++) a.cyl(X0 + W * 0.58 + (i % 4) * 11, YF + 4, Z0 + H * 0.78 - m.floor(i / 4) * 10, Z0 + H * 0.78 - m.floor(i / 4) * 10 + 1, 2.4, 6);
    a.box(X0 + W * 0.58, YF, Z0 + H * 0.15, X1 - W * 0.08, YF + 6, Z0 + H * 0.45); a.cyl(X1 - W * 0.2, YF + 6, Z0 + H * 0.3, Z0 + H * 0.3 + 1, 5, 10);
    a.log(`Added the flat housing with a hinged fibre port cover, ${v.led} status LEDs and wall mounting lugs (plan and 3D).`);
  }
}

const NET = [
  fam({ cat: 'computer/network', title: 'Generic network switch',
    desc: (v) => v.u ? `${v.u}U rack switch with ${v.p} RJ45 ports in ${v.rows} row${v.rows > 1 ? 's' : ''}${v.sfp ? ' and ' + v.sfp + ' uplink cages' : ''}, status LEDs, console port and rear fans.` : `Desktop switch with ${v.p} front ports, ${v.led} LEDs, a top vent and rubber feet.`,
    vs: [['desktop, 8 port', 6.5, 4.2, 1.1, 0, { p: 8, led: 6 }], ['rack, 24 port', 19, 10, 1.72, 0, { u: 1, p: 24, rows: 2, sfp: 2 }], ['rack, 48 port, 4 uplinks', 19, 12, 1.72, 0, { u: 1, p: 48, rows: 2, sfp: 4 }]].map(([l, w, d, h, z, p]) => [l, w, d, h, z, p]),
    build: (a, v) => v.u ? netRack(a, v) : netDesk(a, { ...v, ears: 0 }) }),
  fam({ cat: 'computer/network', title: 'Generic wireless router',
    desc: (v) => `Wireless router with a low body, status LED row, top vent, rear ports and ${v.ant} hinged antennas.`,
    vs: [['two antennas', 8, 6, 5.5, 0, { ant: 2, bh: 38 }], ['four antennas', 10, 7, 8, 0, { ant: 4, bh: 44 }]],
    build: router }),
  fam({ cat: 'computer/network', title: 'Generic patch panel',
    desc: (v) => `${v.u}U patch panel with ${v.p} ports in ${v.rows} row${v.rows > 1 ? 's' : ''} with label strips, rack ears and a rear punch-down bar.`,
    vs: [['24 port, 1U', 19, 3.5, 1.72, 0, { u: 1, p: 24, rows: 1 }], ['48 port, 2U', 19, 3.5, 3.47, 0, { u: 2, p: 48, rows: 2 }]],
    build: patch }),
  fam({ cat: 'computer/network', title: 'Generic wireless access point',
    desc: (v) => v.kind === 'disc' ? 'Ceiling access point: a domed disc with a mounting ring, LED and vent ring.' : v.kind === 'wall' ? 'Wall-plate access point with an LED, four wired ports and a mounting frame.' : 'Outdoor access point with a sealed housing, cable gland, two antennas and a rear bracket.',
    vs: [['ceiling disc', 8.5, 8.5, 1.8, 0, { kind: 'disc' }], ['wall plate', 6.5, 1.8, 4.2, 0, { kind: 'wall' }], ['outdoor, two antennas', 9, 4.5, 10.5, 0, { kind: 'out' }]],
    build: ap }),
  fam({ cat: 'computer/network', title: 'Generic firewall appliance',
    desc: (v) => v.u ? `${v.u}U rack firewall appliance with ${v.p} RJ45 ports, a status panel, rack ears and rear fans.` : `Desktop firewall appliance with ${v.p} front ports, ${v.led} LEDs and a top vent.`,
    vs: [['desktop, 6 port', 7.5, 5, 1.6, 0, { p: 6, led: 6 }], ['rack, 1U, 16 port', 19, 14, 1.72, 0, { u: 1, p: 16, rows: 2, sfp: 2 }]],
    build: (a, v) => v.u ? netRack(a, v) : netDesk(a, { ...v, ears: 0 }) }),
  fam({ cat: 'computer/network', title: 'Generic uninterruptible power supply',
    desc: (v) => v.kind === 'tower' ? 'Tower UPS with a display, LEDs, power button, front vent slots, rear outlets and feet.' : v.kind === 'rack' ? `${v.u}U rack UPS with rack ears, battery door, display, front vents and rear outlets.` : 'Floor-standing UPS cabinet with double battery doors, a control display, lower vents, casters and levelling feet.',
    vs: [['tower, 1500 VA', 5.5, 14, 8.5, 0, { kind: 'tower' }], ['rack, 2U, 3 kVA', 19, 22, 3.47, 0, { kind: 'rack', u: 2 }], ['rack, 3U, 6 kVA', 19, 26, 5.22, 0, { kind: 'rack', u: 3 }], ['floor cabinet, 10 kVA', 24, 31, 48, 0, { kind: 'floor' }]],
    build: ups }),
  fam({ cat: 'computer/network', title: 'Generic KVM switch',
    desc: (v) => v.kind === 'switch' ? `1U KVM switch with ${v.p} front ports in two rows with link lights, selector buttons, a display and rear ports.` : '1U console drawer front with a pull handle, release latches and rack ears.',
    vs: [['8 port, 1U', 19, 7, 1.72, 0, { kind: 'switch', p: 8, u: 1 }], ['16 port, 1U', 19, 9, 1.72, 0, { kind: 'switch', p: 16, u: 1 }], ['console drawer, 1U', 19, 26, 1.72, 0, { kind: 'drawer', u: 1 }]],
    build: kvm }),
  fam({ cat: 'computer/network', title: 'Generic wall-mount network cabinet',
    desc: (v) => `${v.u}U wall-mount cabinet with a glazed hinged door, lock, ${v.u}U of rails, top vent slots and base cable entries.`,
    vs: [['6U', 21, 18, 14, 0, { u: 6 }], ['9U', 21, 24, 20, 0, { u: 9 }]],
    build: wallCab }),
  fam({ cat: 'computer/network', title: 'Generic broadband modem',
    desc: (v) => v.kind === 'tall' ? `Upright modem with vertical vent ribs, a column of ${v.led} status LEDs, a base plinth and a rear connector.` : `Flat wall-mounted fibre terminal with a hinged port cover, ${v.led} status LEDs and mounting lugs.`,
    vs: [['upright, cable', 3.4, 6.5, 8, 0, { kind: 'tall', led: 5 }], ['fibre terminal, wall', 7, 1.6, 5, 0, { kind: 'flat', led: 8 }]],
    build: modem }),
];

export default [...DESK, ...PER, ...SRV, ...NET];

/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, hobby: more craft tools and studio gear, scale models, collecting and display, outdoor hobbies. Original geometry; generic shapes, no maker or model. */
import { fam, Acc } from './r4-kit.mjs';

const IN = 25.4, m = Math, TAU = m.PI * 2;

// ------------------------------------------------------------------------------------------ helpers (copied, not imported)
const MAP = { z: (u, v, w) => [u, v, w], y: (u, v, w) => [u, w, v], x: (u, v, w) => [w, u, v] };
/** a ring, arc ring or disc (ri = 0) about an axis through (c1, c2), between l0 and l1 */
function ring(a, ax, c1, c2, l0, l1, ri, ro, seg = 14, a0 = 0, a1 = TAU) {
  const M = MAP[ax], full = m.abs(a1 - a0 - TAU) < 1e-6, n = full ? seg : m.max(2, m.ceil((seg * (a1 - a0)) / TAU));
  const P = (r, k, w) => { const t = a0 + ((a1 - a0) * k) / n; return M(c1 + r * m.cos(t), c2 + r * m.sin(t), w); };
  for (let k = 0; k < n; k++) {
    a.t.push([P(ro, k, l0), P(ro, k + 1, l0), P(ro, k + 1, l1)], [P(ro, k, l0), P(ro, k + 1, l1), P(ro, k, l1)]);
    if (ri > 0) a.t.push([P(ri, k, l0), P(ri, k + 1, l1), P(ri, k + 1, l0)], [P(ri, k, l0), P(ri, k, l1), P(ri, k + 1, l1)]);
    a.t.push([P(ri, k, l1), P(ro, k, l1), P(ro, k + 1, l1)], [P(ri, k, l1), P(ro, k + 1, l1), P(ri, k + 1, l1)]);
    a.t.push([P(ri, k, l0), P(ro, k + 1, l0), P(ro, k, l0)], [P(ri, k, l0), P(ri, k + 1, l0), P(ro, k + 1, l0)]);
  }
  if (!full) for (const k of [0, n]) a.t.push([P(ri, k, l0), P(ro, k, l0), P(ro, k, l1)], [P(ri, k, l0), P(ro, k, l1), P(ri, k, l1)]);
}
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** a wheel on a lateral axle with hub */
const whl = (a, x, y, r, w, z = null) => { const zz = z ?? a.Z0 + r; a.xcyl(x - w / 2, x + w / 2, y, zz, r, 14); a.xcyl(x - w / 2 - 0.3, x + w / 2 + 0.3, y, zz, r * 0.4, 8); a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL'); };
/** a rail: tube from p to q */
const bar = (a, p, q, r, seg = 6) => a.tube([p, q], [r, r], seg);
/** a closed mesh: wound outward whatever the order the caller used */
function closed(a, tris) {
  let vol = 0;
  for (const [p, q, r] of tris) vol += p[0] * (q[1] * r[2] - q[2] * r[1]) - p[1] * (q[0] * r[2] - q[2] * r[0]) + p[2] * (q[0] * r[1] - q[1] * r[0]);
  for (const [p, q, r] of tris) a.t.push(vol < 0 ? [p, r, q] : [p, q, r]);
}
/** loft convex sections [{z, pts: [[x, y]…]}] (same point count each) into a closed solid */
function loftZ(a, secs) {
  const n = secs[0].pts.length, tris = [], P = (s, j) => [...secs[s].pts[j % n], secs[s].z];
  for (let s = 0; s < secs.length - 1; s++) for (let j = 0; j < n; j++) tris.push([P(s, j), P(s, j + 1), P(s + 1, j + 1)], [P(s, j), P(s + 1, j + 1), P(s + 1, j)]);
  for (const s of [0, secs.length - 1]) for (let j = 1; j < n - 1; j++) tris.push([P(s, 0), P(s, j), P(s, j + 1)]);
  closed(a, tris);
}
/** the same with sections along y: [{y, pts: [[x, z]…]}] */
function loftY(a, secs) {
  const n = secs[0].pts.length, tris = [], P = (s, j) => { const p = secs[s].pts[j % n]; return [p[0], secs[s].y, p[1]]; };
  for (let s = 0; s < secs.length - 1; s++) for (let j = 0; j < n; j++) tris.push([P(s, j), P(s, j + 1), P(s + 1, j + 1)], [P(s, j), P(s + 1, j + 1), P(s + 1, j)]);
  for (const s of [0, secs.length - 1]) for (let j = 1; j < n - 1; j++) tris.push([P(s, 0), P(s, j), P(s, j + 1)]);
  closed(a, tris);
}
/** build a long object lengthwise along x: the builder works with the length on y, this turns it so the front elevation is the side profile (nose to +x) */
function alongX(fn) {
  return (a, v) => {
    const b = a.b, W = b.w, D = b.d, inner = new Acc({ x: -D / 2, y: -W, z: b.z, w: D, d: W, h: b.h });
    fn(inner, v);
    const P = (x, y) => [-y - W / 2, x - D / 2];
    for (const t of inner.t) a.t.push(t.map(([x, y, z]) => [...P(x, y), z]));
    for (const q of inner.p) {
      if (q.kind === 'rect') { const p0 = P(q.x0, q.y0), p1 = P(q.x1, q.y1); a.p.push({ ...q, x0: m.min(p0[0], p1[0]), y0: m.min(p0[1], p1[1]), x1: m.max(p0[0], p1[0]), y1: m.max(p0[1], p1[1]) }); }
      else if (q.kind === 'circle') { const p = P(q.x, q.y); a.p.push({ ...q, x: p[0], y: p[1] }); }
      else if (q.kind === 'line') { const p = P(q.x1, q.y1), r = P(q.x2, q.y2); a.p.push({ ...q, x1: p[0], y1: p[1], x2: r[0], y2: r[1] }); }
      else if (q.kind === 'ellipse') { const p = P(q.x, q.y); a.p.push({ ...q, x: p[0], y: p[1], rx: q.ry, ry: q.rx }); }
      else if (q.kind === 'poly') a.p.push({ ...q, pts: q.pts.map(([x, y]) => P(x, y)) });
      else a.p.push(q);
    }
    a.msg = inner.msg;
  };
}
/** a window frame on a side wall: outer y0..y1, z0..z1, standing out x0..x1, bar width t */
function frameYZ(a, y0, z0, y1, z1, x0, x1, t) { a.box(x0, y0, z0, x1, y0 + t, z1); a.box(x0, y1 - t, z0, x1, y1, z1); a.box(x0, y0 + t, z1 - t, x1, y1 - t, z1); a.box(x0, y0 + t, z0, x1, y1 - t, z0 + t); }
const ellPts = (rx, ry, n = 14, cx = 0, cy = 0) => Array.from({ length: n }, (_, i) => [cx + rx * m.cos((i * TAU) / n), cy + ry * m.sin((i * TAU) / n)]);
const ngon = (cx, cy, r, n, rot = 0) => Array.from({ length: n }, (_, i) => [cx + r * m.cos(rot + (i * TAU) / n), cy + r * m.sin(rot + (i * TAU) / n)]);
const lerp = (a0, a1, t) => a0 + (a1 - a0) * t;
/** piecewise-linear lookup in [[t, value]…] */
function prof(pts, t) { for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [t0, v0] = pts[i - 1], [t1, v1] = pts[i]; return lerp(v0, v1, (t - t0) / (t1 - t0 || 1)); } return pts[pts.length - 1][1]; }
/** a pedestal or bowl turned about z: radii over z0..z1 */
function lathe(a, x, y, z0, z1, rads, seg = 14) { const n = rads.length; a.tube(rads.map((_, i) => [x, y, z0 + ((z1 - z0) * i) / (n - 1)]), rads, seg); }

// ------------------------------------------------------------------------------------------ craft
function spinWheel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H } = a, cy = (YF + YB) / 2, R = v.wd * IN / 2, castle = v.style === 'castle';
  a.outline();
  const wx = X1 - R - 25, wz = castle ? Z0 + R + 70 : Z0 + H * 0.56, zt = castle ? Z0 + 70 : Z0 + H * 0.5;
  // drive wheel: rim, hub, spokes and the crank on the axle
  ring(a, 'y', wx, wz, cy - 13, cy + 13, R - 16, R, 36); a.ycyl(cy - 48, cy + 48, wx, wz, 22, 12);
  for (let i = 0; i < 10; i++) { const g = (i * TAU) / 10; bar(a, [wx + 20 * m.cos(g), cy, wz + 20 * m.sin(g)], [wx + (R - 12) * m.cos(g), cy, wz + (R - 12) * m.sin(g)], 4.5, 5); }
  a.ycyl(cy - 62, cy - 48, wx, wz, 9, 8); const crx = wx + 34, crz = wz - 28; a.ycyl(cy - 70, cy - 52, crx, crz, 6, 6);
  // table or base, wheel uprights
  const tx0 = castle ? X0 + W * 0.06 : X0 + W * 0.02;
  a.box(tx0, cy - 40, zt - 30, wx + 60, cy + 40, zt);
  for (const s of [-1, 1]) a.box(wx - 24, cy + s * 46 - (s < 0 ? 14 : 0), zt, wx + 24, cy + s * 46 + (s > 0 ? 14 : 0), wz + 30);
  for (const [x, s] of [[tx0 + W * 0.1, -1], [tx0 + W * 0.1, 1], [wx, -1], [wx, 1]]) bar(a, [x, cy + s * 24, zt - 28], [x + (x > cx0(a) ? 22 : -22), cy + s * (D * 0.4), Z0 + 14], 15, 7);
  // flyer assembly on the table: two maidens, the spindle with U arms and a bobbin
  const fz = castle ? Z1 - 80 : zt + 85, fx0 = tx0 + W * 0.08, fx1 = tx0 + W * 0.32;
  if (castle) { for (const x of [fx0 + 40, fx1 - 20]) a.box(x - 22, cy - 22, zt, x + 22, cy + 22, fz - 10); a.box(fx0 + 20, cy - 24, fz - 40, fx1, cy + 24, fz - 10); }
  for (const x of [fx0 + 30, fx1 - 10]) a.box(x - 11, cy - 11, castle ? fz - 40 : zt, x + 11, cy + 11, fz + 22);
  a.xcyl(fx0 - 10, fx1 + 40, cy, fz, 6, 8); a.xcyl(fx0 + 44, fx1 - 30, cy, fz, 34, 12);
  for (const s of [-1, 1]) bar(a, [fx0 + 36, cy + s * 4, fz], [fx0 + 70, cy + s * 58, fz], 3, 5), bar(a, [fx0 + 70, cy + s * 58, fz], [fx1 - 30, cy + s * 58, fz], 3, 5);
  a.xcyl(fx1 + 14, fx1 + 30, cy, fz, 16, 10);
  // treadle with its footman rod to the crank
  const tx = wx - R * 0.55; a.box(tx - 150, YF + 8, Z0 + 55, tx + 150, cy - 70, Z0 + 75); a.ycyl(YF + 8, cy - 70, tx - 150, Z0 + 65, 12, 8);
  bar(a, [tx + 60, YF + 40, Z0 + 75], [crx, cy - 62, crz], 4.5, 5);
  a.rect(tx0, cy - 40, wx + 60, cy + 40, 'EQUIP-DETAIL'); a.rect(wx - R, cy - 13, wx + R, cy + 13, 'EQUIP-DETAIL'); a.rect(tx - 150, YF + 8, tx + 150, cy - 70, 'EQUIP-DETAIL'); a.line(fx0 - 10, cy, fx1 + 40, cy);
  a.log(`Added the ${v.wd} in main wheel with ten spokes and a crank, the table on splayed legs, two maidens carrying the flyer with its U arms and bobbin, a pulley whorl and a treadle with footman rod (plan and 3D).`);
}
const cx0 = (a) => a.cx;

function draftTable(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, tl = (v.tilt * m.PI) / 180, tt = 32, yF = YF + D * 0.08, yB = YB - D * 0.04, L = yB - yF;
  a.outline();
  const zb = Z1 - 40, zf = zb - L * m.tan(tl), sz = (y) => zf + (y - yF) * m.tan(tl);
  prismX(a, [[yF, zf - tt], [yB, zb - tt], [yB, zb], [yF, zf]], X0 + W * 0.02, X1 - W * 0.02);
  a.box(X0 + W * 0.04, YF, zf - 34, X1 - W * 0.04, yF + 12, zf - 6); a.box(X0 + W * 0.04, YF, zf - 34, X1 - W * 0.04, YF + 12, zf + 24);   // pencil ledge
  const ry = yF + L * 0.56; prismX(a, [[ry - 22, sz(ry - 22) + 2], [ry + 22, sz(ry + 22) + 2], [ry + 22, sz(ry + 22) + 16], [ry - 22, sz(ry - 22) + 16]], X0 + W * 0.05, X1 - W * 0.05);   // parallel rule
  for (const x of [X0 + W * 0.05, X1 - W * 0.05]) a.box(x - 12, ry - 30, sz(ry) - 4, x + 12, ry + 30, sz(ry) + 20);
  if (v.top) {
    for (const x of [X0 + 30, X1 - 30]) { a.box(x - 22, yF, Z0, x + 22, yF + 60, zf - tt); a.box(x - 22, yB - 60, Z0, x + 22, yB, zb - tt); }
    bar(a, [cx - W * 0.3, yB - 20, zb - tt], [cx - W * 0.3, yB - 140, Z0 + 4], 8, 6);
  } else {
    for (const sx of [-1, 1]) {
      const x = cx + sx * (W / 2 - W * 0.05), t = 26;
      a.box(x - t, yF + 10, Z0, x + t, yF + 10 + 56, zf - tt); a.box(x - t, yB - 66, Z0, x + t, yB - 10, zb - tt);
      a.box(x - t, yF + 10, Z0, x + t, yB - 10, Z0 + 40); a.box(x - t, yF + 10, Z0 + H * 0.36, x + t, yB - 10, Z0 + H * 0.36 + 28);
      a.xcyl(sx > 0 ? x + t : x - t - 20, sx > 0 ? x + t + 20 : x - t, yB - 38, zb - tt - 60, 12, 8);   // tilt knob
    }
    a.box(X0 + W * 0.05 + 26, yB - 52, Z0 + H * 0.36, X1 - W * 0.05 - 26, yB - 30, Z0 + H * 0.36 + 120);
    a.box(X0 + W * 0.05 + 26, yF + 10, Z0 + H * 0.2, X1 - W * 0.05 - 26, yB - 10, Z0 + H * 0.2 + 22);
  }
  a.rect(X0 + W * 0.02, yF, X1 - W * 0.02, yB, 'EQUIP-DETAIL'); a.rect(X0 + W * 0.04, YF, X1 - W * 0.04, yF + 12, 'EQUIP-DETAIL'); a.line(X0 + W * 0.05, ry, X1 - W * 0.05, ry);
  a.log(`Added the ${v.tilt} degree tilting board on ${v.top ? 'four feet with a rear prop strut' : 'two end frames with tilt knobs, a lower shelf and a back rail'}, the pencil ledge and a parallel rule bar riding on the board (plan and 3D).`);
}

function kiln(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, sh = H * (v.front ? 0.3 : 0.28);
  a.outline();
  if (v.front) {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * (W * 0.5 - 40) - 20, cy + sy * (D * 0.5 - 40) - 20, Z0, cx + sx * (W * 0.5 - 40) + 20, cy + sy * (D * 0.5 - 40) + 20, Z0 + sh);
    a.box(X0, YF, Z0 + sh, X1, YB, Z0 + sh + 40);
    a.box(X0 + 10, YF + 30, Z0 + sh + 40, X1 - 10, YB - 10, Z1 - 20);                               // chamber jacket
    a.box(X0, YF + 30, Z1 - 20, X1, YB, Z1);                                                          // top cap
    for (const z of [0.3, 0.6, 0.85]) a.box(X0 + 6, YF + 26, Z0 + sh + (Z1 - Z0 - sh) * z, X1 - 6, YF + 30, Z0 + sh + (Z1 - Z0 - sh) * z + 14);
    const dz0 = Z0 + sh + 70, dz1 = Z1 - 60, dw = W * 0.74;                                         // door with a ring frame and handle
    a.box(cx - dw / 2, YF + 6, dz0, cx + dw / 2, YF + 30, dz1); a.box(cx - dw / 2, YF, dz0, cx - dw / 2 + 24, YF + 6, dz1); a.box(cx + dw / 2 - 24, YF, dz0, cx + dw / 2, YF + 6, dz1);
    a.box(cx - dw / 2, YF, dz0, cx + dw / 2, YF + 6, dz0 + 24); a.box(cx - dw / 2, YF, dz1 - 24, cx + dw / 2, YF + 6, dz1);
    for (const z of [dz0 + 40, dz1 - 40]) a.ycyl(YF - 8, YF + 6, cx - dw / 2 - 8, z, 10, 8);
    bar(a, [cx + dw / 2 - 30, YF - 30, dz0 + 60], [cx + dw / 2 - 30, YF - 30, dz1 - 60], 7, 6); for (const z of [dz0 + 60, dz1 - 60]) bar(a, [cx + dw / 2 - 30, YF, z], [cx + dw / 2 - 30, YF - 30, z], 6, 6);
    a.box(X1 - W * 0.2, YF - 0, Z1 - 20 - 120, X1 - 10, YF + 30, Z1 - 20); a.ycyl(YF - 14, YF, X1 - W * 0.1, Z1 - 80, 22, 10);
    a.circ(cx, cy, 10, 'EQUIP-HIDDEN'); a.rect(cx - dw / 2, YF, cx + dw / 2, YF + 30, 'EQUIP-DETAIL');
    a.log('Added four steel legs, the stand frame, an insulated chamber jacket with bands, a front door with frame, two hinges and a pull handle, and a control panel with a dial (plan and 3D).');
    return;
  }
  const R = (W / 2 - 70) / m.cos(m.PI / 8), rot = m.PI / 8, bz = Z0 + sh, top = Z1 - H * 0.12;
  for (let i = 0; i < 4; i++) { const g = rot + (i * TAU) / 4 + m.PI / 4 - rot; const x = cx + R * 0.82 * m.cos(g + rot), y = cy + R * 0.82 * m.sin(g + rot); a.cyl(x, y, Z0, bz, 18, 8); a.circ(x, y, 18, 'EQUIP-HIDDEN'); }
  a.prism(ngon(cx, cy, R * 0.98, 8, rot), bz, bz + 36);
  a.prism(ngon(cx, cy, R, 8, rot), bz + 36, top);
  for (const f of [0.18, 0.5, 0.82]) a.prism(ngon(cx, cy, R * 1.025, 8, rot), bz + 36 + (top - bz - 36) * f - 8, bz + 36 + (top - bz - 36) * f + 8);
  for (const f of [0.3, 0.55, 0.8]) a.ycyl(YF + 70 - 14, YF + 70 + 18, cx, bz + 36 + (top - bz - 36) * f, 13, 8);
  a.prism(ngon(cx, cy, R * 1.04, 8, rot), top, top + H * 0.07); a.prism(ngon(cx, cy, R * 0.82, 8, rot), top + H * 0.07, Z1 - 10);
  for (const x of [cx - R * 0.35, cx + R * 0.35]) a.box(x - 9, cy - 9, Z1 - 10, x + 9, cy + 9, Z1 - 0.01); bar(a, [cx - R * 0.35, cy, Z1 - 10], [cx + R * 0.35, cy, Z1 - 10], 8, 6);
  a.box(X1 - 80, cy - 90, bz + 80, X1 - 0.5, cy + 90, bz + 260); a.xcyl(X1 - 30, X1 - 0.5, cy - 40, bz + 190, 18, 10); a.xcyl(X1 - 30, X1 - 0.5, cy + 40, bz + 190, 18, 10);
  a.poly(ngon(cx, cy, R, 8, rot), 'EQUIP-DETAIL'); a.poly(ngon(cx, cy, R * 0.82, 8, rot), 'EQUIP-DETAIL'); a.rect(X1 - 80, cy - 90, X1, cy + 90, 'EQUIP-DETAIL');
  a.log('Added four legs under a stand ring, the eight-sided steel jacket with three bands and three peephole plugs, the hinged lid with a stepped top and a bar handle, and a side control box with two dials (plan and 3D).');
}

function rollerPress(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, slab = v.kind === 'slab';
  a.outline();
  const hs = v.stand ? H * 0.52 : H * 0.14, bz = Z0 + hs, bt = slab ? 34 : 22, rb = slab ? 0 : H * 0.075, rt = slab ? H * 0.12 : H * 0.095;
  const by0 = YF + D * 0.12, by1 = YB - D * 0.12;
  a.box(X0, by0, bz, X1, by1, bz + bt);
  if (slab) { a.box(X0 + 20, by0 + 12, bz + bt, X1 - 20, by1 - 12, bz + bt + 5); a.box(X0 + 20, by0 + 12, bz + bt + 5, X1 - 20, by0 + 28, bz + bt + 16); a.box(X0 + 20, by1 - 28, bz + bt + 5, X1 - 20, by1 - 12, bz + bt + 16); }   // canvas on the bed with side guides
  const rz = bz + bt + (slab ? 16 : 0) + rt, cw = W * 0.13;
  if (!slab) a.ycyl(by0 - 20, by1 + 20, cx, bz - rb, rb, 18);
  a.ycyl(by0 + 4, by1 - 4, cx, rz, rt, 22);
  for (const [y0, y1] of [[YF + D * 0.03, by0], [by1, YB - D * 0.03]]) a.box(cx - cw, y0, bz - (slab ? 50 : rb * 2 + 30), cx + cw, y1, rz + rt + 40);
  a.box(cx - cw, YF + D * 0.03, rz + rt + 20, cx + cw, YB - D * 0.03, rz + rt + 60);
  a.ycyl(YF + D * 0.012, YF + D * 0.03, cx, rz, 22, 10); a.ycyl(YF, YF + D * 0.012, cx, rz, 14, 10);
  const spokes = slab ? 4 : 6, sr = H * (slab ? 0.17 : 0.15);
  if (slab) ring(a, 'y', cx, rz, YF, YF + 14, sr - 12, sr, 28);
  for (let i = 0; i < spokes; i++) { const g = (i * TAU) / spokes + 0.3; bar(a, [cx, YF + 8, rz], [cx + sr * m.cos(g), YF + 8, rz + sr * m.sin(g)], slab ? 5 : 6, 6); if (!slab) a.ycyl(YF, YF + 22, cx + sr * m.cos(g), rz + sr * m.sin(g), 11, 8); }
  if (slab) a.ycyl(YF, YF + 40, cx + sr * m.cos(0.3), rz + sr * m.sin(0.3), 13, 8);
  const lg = 34;
  if (v.stand) {
    for (const sx of [-1, 1]) { const x = cx + sx * (W / 2 - 50); a.box(x - lg / 2, by0 + 10, Z0, x + lg / 2, by0 + 10 + lg, bz); a.box(x - lg / 2, by1 - 10 - lg, Z0, x + lg / 2, by1 - 10, bz); a.box(x - lg / 2, by0 + 10, Z0 + 40, x + lg / 2, by1 - 10, Z0 + 40 + 24); }
    a.box(X0 + 50, by0 + 20, Z0 + H * 0.2, X1 - 50, by1 - 20, Z0 + H * 0.2 + 20);
  } else for (const sx of [-1, 1]) for (const y of [by0 + 20, by1 - 20 - 70]) a.box(cx + sx * (W / 2 - 60) - 30, y, Z0, cx + sx * (W / 2 - 60) + 30, y + 70, bz);
  a.rect(X0, by0, X1, by1, 'EQUIP-DETAIL'); a.rect(cx - cw, YF + D * 0.03, cx + cw, YB - D * 0.03, 'EQUIP-DETAIL'); a.line(cx, by0, cx, by1);
  a.log(slab ? 'Added the bed with a canvas and side guides, one large roller between two cheeks with a hand wheel and a crank handle, and the legs or feet (plan and 3D).' : 'Added the flat bed running between a top and a bottom roller, two heavy cheeks with a crossbar, the star wheel with six spokes and handle knobs, and a stand or feet (plan and 3D).');
}

function bookPress(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, n = v.screws;
  a.outline();
  const bh = H * (n === 1 ? 0.1 : 0.16);
  a.box(X0, YF, Z0, X1, YB, Z0 + bh);
  const pz = Z0 + bh + H * (n === 1 ? 0.3 : 0.26), pt = H * 0.07;
  a.box(X0 + W * 0.08, YF + D * 0.12, Z0 + bh, X1 - W * 0.08, YB - D * 0.12, Z0 + bh + H * 0.05);                           // lower platen
  for (let k = 0; k < 3; k++) a.box(cx - W * 0.28, cy - D * 0.26, Z0 + bh + H * 0.05 + k * H * 0.07, cx + W * 0.28, cy + D * 0.26, Z0 + bh + H * 0.05 + (k + 1) * H * 0.07 - 2);   // the book block
  a.box(X0 + W * 0.08, YF + D * 0.1, pz, X1 - W * 0.08, YB - D * 0.1, pz + pt);                                           // upper platen
  if (n === 1) {
    for (const s of [-1, 1]) a.box(cx + s * W * 0.4 - 18, YF + D * 0.16, Z0 + bh, cx + s * W * 0.4 + 18, YB - D * 0.16, Z1 - H * 0.1);
    a.box(X0 + W * 0.06, YF + D * 0.14, Z1 - H * 0.2, X1 - W * 0.06, YB - D * 0.14, Z1 - H * 0.1);
    a.cyl(cx, cy, pz + pt, Z1 - H * 0.18, 13, 10); a.cyl(cx, cy, Z1 - H * 0.2, Z1 - H * 0.06, 22, 12);
    bar(a, [X0 + W * 0.12, cy, Z1 - H * 0.03], [X1 - W * 0.12, cy, Z1 - H * 0.03], 7, 6); a.ell(X0 + W * 0.12, cy, Z1 - H * 0.03, 16, 16, 16, 8, 5); a.ell(X1 - W * 0.12, cy, Z1 - H * 0.03, 16, 16, 16, 8, 5);
    a.cyl(cx, cy, Z1 - H * 0.06, Z1 - H * 0.03 + 7, 8, 8);
  } else for (const s of [-1, 1]) {
    const x = cx + s * W * 0.4; a.cyl(x, cy, Z0 + bh, Z1 - H * 0.06, 12, 10); a.box(x - 22, cy - D * 0.2, pz - 6, x + 22, cy + D * 0.2, pz + pt + 6);
    a.cyl(x, cy, Z1 - H * 0.14, Z1 - H * 0.02, 24, 12); for (let i = 0; i < 2; i++) bar(a, [x - 28 * (i ? -1 : 1), cy, Z1 - H * 0.08], [x + 28 * (i ? -1 : 1), cy, Z1 - H * 0.08], 4, 5);
  }
  a.rect(X0 + W * 0.08, YF + D * 0.1, X1 - W * 0.08, YB - D * 0.1, 'EQUIP-DETAIL'); a.circ(cx, cy, 22, 'EQUIP-DETAIL');
  a.log(n === 1 ? 'Added the base with a lower platen, a book block, an upper platen, two cheeks with a crown beam, a central screw with a collar and a tommy bar with ball ends (plan and 3D).' : 'Added the base with a lower platen, a book block, an upper platen on two screws with wheel nuts and cross handles (plan and 3D).');
}

function dressForm(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, hip = v.hip * IN, bust = v.bust * IN;
  a.outline();
  const tz0 = Z0 + H * 0.5, tz1 = Z0 + H * 0.88, N = 12, rx = (t) => prof([[0, 0.8], [0.1, 1], [0.35, 0.74], [0.6, bust / hip], [0.8, bust / hip * 1.02], [0.9, bust / hip * 0.74], [0.96, 0.44], [1, 0.26]], t) * hip;
  const ryf = (t) => prof([[0, 0.55], [0.1, 0.62], [0.35, 0.5], [0.6, 0.6], [0.8, 0.5], [0.9, 0.34], [0.96, 0.24], [1, 0.2]], t) * hip * 1.3;
  loftZ(a, Array.from({ length: N + 1 }, (_, i) => { const t = i / N; return { z: lerp(tz0, tz1, t), pts: ellPts(rx(t), ryf(t), 16, cx, cy) }; }));
  lathe(a, cx, cy, tz1, Z1 - 4, [hip * 0.2, hip * 0.2, hip * 0.17, hip * 0.17], 10); a.ell(cx, cy, Z1 - 6, hip * 0.2, hip * 0.2, 14, 10, 4);
  a.cyl(cx, cy, Z0 + 60, tz0 + 20, 18, 10); a.cyl(cx, cy, Z0 + H * 0.28, Z0 + H * 0.3, 28, 10); a.ycyl(cy - 40, cy - 16, cx, Z0 + H * 0.29, 18, 8);
  for (let i = 0; i < 3; i++) { const g = -m.PI / 2 + (i * TAU) / 3, r = D * 0.45; bar(a, [cx, cy, Z0 + 70], [cx + r * m.cos(g), cy + r * m.sin(g), Z0 + 18], 12, 7); a.ell(cx + r * m.cos(g), cy + r * m.sin(g), Z0 + 18, 18, 18, 18, 8, 5); a.circ(cx + r * m.cos(g), cy + r * m.sin(g), 18, 'EQUIP-HIDDEN'); }
  a.cone(cx, cy, Z0 + 52, Z0 + 70, 40, 18, 10);
  a.poly(ellPts(hip, hip * 0.7, 20, cx, cy), 'EQUIP-DETAIL'); a.circ(cx, cy, 18, 'EQUIP-HIDDEN');
  a.log(`Added a torso lofted from hip to bust and shoulder with a neck cap, an adjustable column with a collar knob and a three-leg stand with ball feet (hip ${v.hip * 2} in across, plan and 3D).`);
}

function craftTable(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2;
  a.outline();
  if (v.kind === 'cut') {
    const ts = Z1 - 8, tt = 38, n = v.cols;
    a.box(X0, YF, ts - tt, X1, YB, ts); a.box(X0 + 14, YF + 14, ts, X1 - 14, YB - 14, ts + 3); a.box(X0 + W * 0.15, cy - 15, ts + 3, X0 + W * 0.15 + 520, cy + 15, ts + 7);
    const bz = Z0 + 60; for (const x of [X0 + 30, X1 - 30]) a.box(x - 16, YF + 20, Z0, x + 16, YB - 20, ts - tt); a.box(X0 + 14, YF + 20, Z0 + 30, X1 - 14, YB - 20, bz);
    for (let i = 1; i < n; i++) { const x = X0 + 30 + ((W - 60) * i) / n; a.box(x - 9, YF + 40, bz, x + 9, YB - 20, ts - tt); }
    a.box(X0 + 30, YF + 40, bz + (ts - tt - bz) / 2 - 9, X1 - 30, YB - 20, bz + (ts - tt - bz) / 2 + 9);
    a.box(X0 + 30, YB - 20, bz, X1 - 30, YB - 8, ts - tt);
    for (let i = 0; i < n; i += 2) { const x0 = X0 + 36 + ((W - 72) * i) / n + 10, x1 = X0 + 36 + ((W - 72) * (i + 1)) / n - 10; a.box(x0, YF + 50, bz, x1, YB - 40, bz + (ts - tt - bz) / 2 - 12); a.box((x0 + x1) / 2 - 40, YF + 44, bz + 80, (x0 + x1) / 2 + 40, YF + 50, bz + 94); }
    a.rect(X0 + 14, YF + 14, X1 - 14, YB - 14, 'EQUIP-DETAIL'); a.rect(X0 + W * 0.15, cy - 15, X0 + W * 0.15 + 520, cy + 15, 'EQUIP-DETAIL');
    a.log(`Added the thick top with a cutting mat and a long ruler, two end panels, ${n} open cube bays split by a mid shelf, a back rail and fabric bins in alternate bays (plan and 3D).`);
    return;
  }
  const tz = Z1 - 195, tt = 30, leaf = v.leaf, bodyW = leaf ? W * 0.68 : W, bx1 = X0 + bodyW;
  a.box(X0, YF, tz - 4, X0 + bodyW * 0.18, YB, tz); a.box(X0 + bodyW * 0.18, YF, tz - 4, bx1, YF + D * 0.2, tz); a.box(X0 + bodyW * 0.18, YB - D * 0.2, tz - 4, bx1, YB, tz); a.box(X0 + bodyW * 0.62, YF + D * 0.2, tz - 4, bx1, YB - D * 0.2, tz);
  a.box(X0, YF, tz - tt, bx1, YB, tz - 4); a.box(X0 + bodyW * 0.18, YF + D * 0.2, tz - 4 - 2, X0 + bodyW * 0.62, YB - D * 0.2, tz - 4);
  const mw = bodyW * 0.36; a.box(X0 + bodyW * 0.2, cy - D * 0.15, tz, X0 + bodyW * 0.2 + mw, cy + D * 0.15, tz + 40);   // machine bed in the well
  a.box(X0 + bodyW * 0.2 + mw * 0.7, cy - D * 0.12, tz + 40, X0 + bodyW * 0.2 + mw, cy + D * 0.12, tz + 190); a.box(X0 + bodyW * 0.2, cy - D * 0.12, tz + 150, X0 + bodyW * 0.2 + mw, cy + D * 0.12, tz + 190);
  a.cyl(X0 + bodyW * 0.2 + mw * 0.12, cy, tz + 150, tz + 175, 11, 8); a.xcyl(X0 + bodyW * 0.2 + mw, X0 + bodyW * 0.2 + mw + 26, cy, tz + 130, 34, 14);
  if (leaf) a.box(bx1, YF, tz - 4, X1, YB, tz); else a.box(bx1 - 12, YF + 8, tz - 330, bx1 - 4, YB - 8, tz - tt);
  if (leaf) { bar(a, [bx1 + 20, cy, tz - tt], [bx1 + 160, cy, tz - 4], 7, 6); }
  for (const [x, y] of [[X0 + 36, YF + 36], [bx1 - 36, YF + 36], [X0 + 36, YB - 36], [bx1 - 36, YB - 36]]) { a.tube([[x, y, Z0], [x, y, tz - tt]], [10, 17], 8); a.circ(x, y, 17, 'EQUIP-HIDDEN'); }
  a.box(X0 + 36, YF + 36, tz - tt - 70, bx1 - 36, YB - 36, tz - tt); a.box(X0 + 70, YF + 20, tz - tt - 60, X0 + bodyW * 0.42, YF + 36, tz - tt - 10); a.ell(X0 + bodyW * 0.21, YF + 14, tz - tt - 35, 10, 8, 10, 8, 4);
  a.box(X0 + 40, YF + 40, Z0 + H * 0.24, bx1 - 40, YB - 40, Z0 + H * 0.24 + 18);
  a.rect(X0 + bodyW * 0.18, YF + D * 0.2, X0 + bodyW * 0.62, YB - D * 0.2, 'EQUIP-DETAIL'); if (leaf) a.line(bx1, YF, bx1, YB);
  a.log(`Added the top with a machine well and drop-in machine, tapered legs with an apron, a drawer with a knob, a lower shelf${leaf ? ' and a drop leaf lifted on a swing bracket' : ' and a hinged leaf hanging down on the right'} (plan and 3D).`);
}

function hoopStand(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2;
  a.outline();
  if (v.rect) {
    const t = 22, fw = W * 0.8, fz0 = Z0 + H * 0.42, fz1 = Z1 - 30;
    for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 40); a.box(x - 20, cy - D * 0.4, Z0, x + 20, cy + D * 0.4, Z0 + 34); a.box(x - 14, cy - 14, Z0 + 34, x + 14, cy + 14, fz1 - 10); a.cyl(x, cy, fz0 - 90, fz0 - 60, 24, 8); }
    a.box(cx - fw / 2, cy - 12, fz0, cx + fw / 2, cy + 12, fz1); a.box(cx - fw / 2 + t, cy - 18, fz0 + t, cx + fw / 2 - t, cy + 18, fz1 - t);
    a.xcyl(cx - fw / 2 - 12, cx + fw / 2 + 12, cy, fz0 + 12, 12, 10); a.xcyl(cx - fw / 2 - 12, cx + fw / 2 + 12, cy, fz1 - 12, 12, 10);
    a.box(cx - fw / 2 + t + 4, cy - 6, fz0 + t + 4, cx + fw / 2 - t - 4, cy + 6, fz1 - t - 4);
    a.rect(cx - fw / 2, cy - 12, cx + fw / 2, cy + 12, 'EQUIP-DETAIL');
    a.log('Added two foot bases with posts and height clamps, a rectangular scroll frame with two cloth rollers, an inner frame and a stretched cloth panel (plan and 3D).');
    return;
  }
  const hr = v.hoop * IN / 2, hz = Z1 - hr - 40, bt = 28;
  if (v.table) { a.box(X0, YF, Z0, X1, YB, Z0 + 30); a.box(X0 + W * 0.3, YF + D * 0.3, Z0 + 30, X1 - W * 0.3, YB - D * 0.3, Z0 + 80); bar(a, [cx, cy, Z0 + 80], [cx, cy, hz - hr * 0.7], 12, 8); }
  else { for (let i = 0; i < 3; i++) { const g = -m.PI / 2 + (i * TAU) / 3, r = m.min(W, D) * 0.46; bar(a, [cx, cy, Z0 + 150], [cx + r * m.cos(g), cy + r * m.sin(g), Z0 + 16], 12, 7); a.ell(cx + r * m.cos(g), cy + r * m.sin(g), Z0 + 16, 22, 22, 16, 8, 5); } a.cyl(cx, cy, Z0 + 120, hz - hr * 0.6, 20, 10); a.cyl(cx, cy, Z0 + H * 0.45, Z0 + H * 0.45 + 40, 30, 10); }
  bar(a, [cx, cy, hz - hr * 0.6], [cx, cy, hz - hr], 11, 8);
  ring(a, 'y', cx, hz, cy - bt / 2, cy + bt / 2, hr - 14, hr, 36); ring(a, 'y', cx, hz, cy - 4, cy + 4, 0, hr - 12, 36);
  a.box(cx - 18, cy - bt / 2 - 8, hz + hr - 10, cx + 18, cy + bt / 2 + 8, hz + hr + 10); a.xcyl(cx - 7, cx + 7, cy + bt / 2 + 6, hz + hr + 18, 6, 6);
  a.rect(cx - hr, cy - bt / 2, cx + hr, cy + bt / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, 20, 'EQUIP-HIDDEN');
  a.log(`Added a ${v.hoop} in two-ring hoop with a stretched cloth and tightening screw on ${v.table ? 'a clamp-down desk base' : 'a floor stand with a three-leg foot and collar'}, joined by a swivel stem (plan and 3D).`);
}

// ------------------------------------------------------------------------------------------ models
/** a rail truck bogie: frame, two axles with wheels */
function bogie(a, cy, w, r, wb, z0) { for (const dy of [-wb / 2, wb / 2]) { whl(a, a.cx - w * 0.32, cy + dy, r, w * 0.09, z0 + r); whl(a, a.cx + w * 0.32, cy + dy, r, w * 0.09, z0 + r); a.xcyl(a.cx - w * 0.32, a.cx + w * 0.32, cy + dy, z0 + r, r * 0.12, 6); } a.box(a.cx - w * 0.36, cy - wb / 2 - r * 0.3, z0 + r * 1.6, a.cx + w * 0.36, cy + wb / 2 + r * 0.3, z0 + r * 2.05); }

function railVehicle(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, kind = v.kind, tram = kind === 'tram', rr = H * (tram ? 0.1 : 0.085), fz = Z0 + rr * 2.15, y0 = YF + D * 0.012, y1 = YB - D * 0.012;
  a.outline();
  a.box(cx - W * 0.44, YF + D * 0.01, fz - H * 0.035, cx + W * 0.44, YB - D * 0.01, fz);
  for (const y of [YF + D * (tram ? 0.2 : 0.17), YB - D * (tram ? 0.2 : 0.17)]) bogie(a, y, W, rr, D * (tram ? 0.1 : 0.085), Z0);
  const zw = fz + (Z1 - fz) * (tram ? 0.74 : 0.8), hr = Z1 - zw;
  a.box(cx - W * 0.46, y0, fz, cx + W * 0.46, y1, zw);
  const roof = [[cx - W * 0.46, zw], [cx + W * 0.46, zw], [cx + W * 0.41, zw + hr * 0.5], [cx + W * 0.22, zw + hr * 0.88], [cx - W * 0.22, zw + hr * 0.88], [cx - W * 0.41, zw + hr * 0.5]];
  prismY(a, roof, y0, y1);
  // side windows and doors, proud of the wall
  const nw = v.win, wz0 = fz + (zw - fz) * 0.38, wz1 = fz + (zw - fz) * 0.82, span = (y1 - y0) * (tram ? 0.8 : 0.84), s0 = y0 + (y1 - y0) * (tram ? 0.1 : 0.08);
  for (const s of [-1, 1]) {
    for (let i = 0; i < nw; i++) { const y = s0 + (span * i) / nw; frameYZ(a, y + span / nw * 0.1, wz0, y + span / nw * 0.9, wz1, s > 0 ? cx + W * 0.46 : cx - W * 0.46 - W * 0.04, s > 0 ? cx + W * 0.46 + W * 0.04 : cx - W * 0.46, W * 0.045); }
    a.box(s > 0 ? cx + W * 0.46 : cx - W * 0.46 - W * 0.01, y0 + (y1 - y0) * 0.02, wz0 - (wz0 - fz) * 0.5, s > 0 ? cx + W * 0.46 + W * 0.01 : cx - W * 0.46, y1 - (y1 - y0) * 0.02, wz0 - (wz0 - fz) * 0.5 + (zw - fz) * 0.05);
  }
  // end details at the front (-Y): door or windscreen, lamps, buffer beam
  const ez0 = fz + (zw - fz) * 0.2, ez1 = fz + (zw - fz) * 0.9;
  if (kind === 'coach') { a.frame(cx - W * 0.17, ez0, cx + W * 0.17, ez1, YF, y0, W * 0.025); a.box(cx - W * 0.15, YF + D * 0.004, ez0 + W * 0.025, cx + W * 0.15, y0, ez1 - W * 0.025); a.box(cx - W * 0.2, YF, fz - H * 0.02, cx + W * 0.2, y0, fz + H * 0.03); }
  else { a.frame(cx - W * 0.4, wz0 - (wz0 - fz) * 0.2, cx + W * 0.4, ez1, YF, y0, W * 0.03); a.box(cx - W * 0.38, YF + D * 0.004, wz0 - (wz0 - fz) * 0.2 + W * 0.03, cx - W * 0.02, y0, ez1 - W * 0.03); a.box(cx + W * 0.02, YF + D * 0.004, wz0 - (wz0 - fz) * 0.2 + W * 0.03, cx + W * 0.38, y0, ez1 - W * 0.03); for (const s of [-1, 1]) a.ycyl(YF, y0, cx + s * W * 0.34, fz + (zw - fz) * 0.1, W * 0.045, 8); a.box(cx - W * 0.46, YF, fz - H * 0.02, cx + W * 0.46, y0, fz + H * 0.03); }
  if (tram) {
    a.box(cx - W * 0.1, y0 + D * 0.3, Z1, cx + W * 0.1, y0 + D * 0.5, Z1 + 0.01);
  }
  // roof gear: vents, or a pantograph on a tram
  if (tram) {
    const py = (y0 + y1) / 2, ph = H * 0.14; a.box(cx - W * 0.25, py - D * 0.07, zw + hr * 0.88 - 0.5, cx + W * 0.25, py + D * 0.07, zw + hr * 0.88 + H * 0.015);
    for (const s of [-1, 1]) bar(a, [cx + s * W * 0.18, py - D * 0.05, zw + hr * 0.88 + H * 0.015], [cx + s * W * 0.04, py, zw + hr * 0.88 + ph - 0.01 * H], 0.012 * W, 5);
  } else for (let i = 0; i < 3; i++) a.cyl(cx, y0 + (y1 - y0) * (0.25 + i * 0.25), zw + hr * 0.88, zw + hr * 0.88 + H * 0.02, W * 0.08, 8);
  a.rect(cx - W * 0.46, y0, cx + W * 0.46, y1, 'EQUIP-DETAIL');
  a.log(`Added the underframe with two bogies, the body with ${nw} windows a side, a belt rail and the arched roof, ${tram ? 'a windscreen end with lamps, a fender and a roof pantograph' : kind === 'dmu' ? 'a cab end with a windscreen, lamps and a buffer beam, and roof vents' : 'an end door with gangway frame, a buffer beam and roof vents'} (plan and 3D).`);
}

/** a thin base plate under a model building */
function plinth(a, t) { a.box(a.X0, a.YF, a.Z0, a.X1, a.YB, a.Z0 + t); }
function railBuilding(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, bt = H * 0.04, k = v.kind;
  a.outline(); plinth(a, bt);
  const g = Z0 + bt;
  if (k === 'cottage') {
    const bx0 = cx - W * 0.38, bx1 = cx + W * 0.38, by0 = YF + D * 0.2, by1 = YB - D * 0.1, zw = g + (Z1 - g) * 0.58;
    a.box(bx0, by0, g, bx1, by1, zw);
    prismX(a, [[by0 - D * 0.04, zw], [by1 + D * 0.04, zw], [(by0 + by1) / 2, Z1 - H * 0.03]], bx0 - W * 0.04, bx1 + W * 0.04);
    a.box(bx1 - W * 0.16, by1 - D * 0.28, zw, bx1 - W * 0.06, by1 - D * 0.18, Z1);                                              // chimney
    a.frame(cx - W * 0.07, g, cx + W * 0.07, g + (zw - g) * 0.72, by0 - D * 0.012, by0, W * 0.012); a.box(cx - W * 0.055, by0 - D * 0.008, g + W * 0.012, cx + W * 0.055, by0, g + (zw - g) * 0.72 - W * 0.012);
    for (const x of [cx - W * 0.24, cx + W * 0.24]) { a.frame(x - W * 0.06, g + (zw - g) * 0.35, x + W * 0.06, g + (zw - g) * 0.8, by0 - D * 0.012, by0, W * 0.012); }
    a.box(cx - W * 0.14, YF + D * 0.1, g, cx + W * 0.14, by0 - D * 0.012, g + (zw - g) * 0.08);                                // step
    for (const x of [-1, 1]) a.box(cx + x * W * 0.43, YF + D * 0.05, g, cx + x * W * 0.45, YB - D * 0.03, g + H * 0.12);        // garden fence
    a.rect(bx0, by0, bx1, by1, 'EQUIP-DETAIL');
    a.log('Added the base plate, a walled cottage with a gabled roof and eaves, a chimney, a framed front door with step, two framed windows and garden fences (plan and 3D).');
  } else if (k === 'station') {
    const pz = g + (Z1 - g) * 0.1, bz = (Z1 - g);
    a.box(X0, YF, g, X1, YF + D * 0.42, pz);                                                                          // platform
    a.box(X0, YF + D * 0.42 - D * 0.02, g, X1, YF + D * 0.42, pz + H * 0.01);
    const by0 = YF + D * 0.52, by1 = YB - D * 0.04, zw = pz + bz * 0.6;
    a.box(X0 + W * 0.06, by0, pz, X1 - W * 0.06, by1, zw);
    prismX(a, [[by0 - D * 0.04, zw], [by1 + D * 0.02, zw], [(by0 + by1) / 2, Z1]], X0 + W * 0.04, X1 - W * 0.04);
    for (let i = 0; i < 5; i++) a.frame(X0 + W * (0.12 + i * 0.17), pz + bz * 0.18, X0 + W * (0.12 + i * 0.17) + W * 0.09, pz + bz * 0.5, by0 - D * 0.008, by0, W * 0.008);
    a.box(cx - W * 0.2, by0 - D * 0.012, zw - bz * 0.1, cx + W * 0.2, by0, zw - bz * 0.02); a.ycyl(by0 - D * 0.03, by0 - D * 0.012, cx + W * 0.28, zw - bz * 0.04, bz * 0.08, 12);
    for (const x of [X0 + W * 0.2, cx, X1 - W * 0.2]) a.box(x - W * 0.008, YF + D * 0.12, pz, x + W * 0.008, YF + D * 0.14, pz + bz * 0.5);     // canopy posts
    a.box(X0 + W * 0.18, YF + D * 0.08, pz + bz * 0.5, X1 - W * 0.18, YF + D * 0.42, pz + bz * 0.54);
    a.rect(X0, YF, X1, YF + D * 0.42, 'EQUIP-DETAIL'); a.rect(X0 + W * 0.06, by0, X1 - W * 0.06, by1, 'EQUIP-DETAIL');
    a.log('Added the base plate, a platform with edge, a station building with a gabled roof, framed windows, a name board, a clock and a canopy on three posts over the platform (plan and 3D).');
  } else if (k === 'factory') {
    const by0 = YF + D * 0.1, by1 = YB - D * 0.06, zw = g + (Z1 - g) * 0.55, nt = 4, tw = (X1 - X0 - W * 0.16) / nt;
    a.box(X0 + W * 0.08, by0, g, X1 - W * 0.08, by1, zw);
    for (let i = 0; i < nt; i++) { const x0 = X0 + W * 0.08 + i * tw; prismY(a, [[x0, zw], [x0 + tw, zw], [x0 + tw, zw + (Z1 - zw) * 0.7], [x0 + tw * 0.15, zw + (Z1 - zw) * 0.7 * 0.3]], by0, by1); a.box(x0 + tw * 0.15, by0, zw + (Z1 - zw) * 0.25, x0 + tw * 0.15 + 0.01 * W, by1, zw + (Z1 - zw) * 0.6); }
    a.cyl(X1 - W * 0.16, by1 - D * 0.18, zw, Z1 - 0.002, W * 0.035, 10);
    a.frame(cx - W * 0.16, g, cx + W * 0.1, g + (zw - g) * 0.7, by0 - D * 0.012, by0, W * 0.012); a.box(cx - W * 0.15, by0 - D * 0.008, g, cx + W * 0.09, by0, g + (zw - g) * 0.7 - W * 0.012);
    a.box(X0, by0 - D * 0.08, g, X0 + W * 0.2, by0, g + (zw - g) * 0.25);                                              // loading dock
    for (const x of [cx + W * 0.22, cx + W * 0.34]) a.frame(x - W * 0.04, g + (zw - g) * 0.4, x + W * 0.04, g + (zw - g) * 0.8, by0 - D * 0.012, by0, W * 0.01);
    a.rect(X0 + W * 0.08, by0, X1 - W * 0.08, by1, 'EQUIP-DETAIL');
    a.log('Added the base plate, a walled hall with a four-bay sawtooth roof and glazed risers, a chimney stack, a large door, windows and a loading dock (plan and 3D).');
  } else {
    const bx0 = cx - W * 0.3, bx1 = cx + W * 0.3, by0 = YF + D * 0.28, by1 = YB - D * 0.12, z1 = g + (Z1 - g) * 0.38, z2 = g + (Z1 - g) * 0.7;
    a.box(bx0, by0, g, bx1, by1, z1);
    a.box(bx0 - W * 0.03, by0 - D * 0.03, z1, bx1 + W * 0.03, by1 + D * 0.03, z1 + H * 0.02);
    for (let i = 0; i < 3; i++) a.frame(bx0 + W * (0.04 + i * 0.19), z1 + H * 0.02, bx0 + W * (0.04 + i * 0.19) + W * 0.17, z2, by0 - D * 0.012, by0, W * 0.012);
    a.box(bx0, by0, z1 + H * 0.02, bx1, by1, z2);
    a.prism([[bx0 - W * 0.04, by0 - D * 0.04], [bx1 + W * 0.04, by0 - D * 0.04], [bx1 + W * 0.04, by1 + D * 0.04], [bx0 - W * 0.04, by1 + D * 0.04]], z2, z2 + H * 0.025);
    a.prism([[bx0 - W * 0.01, by0], [bx1 + W * 0.01, by0], [bx1 - W * 0.12, by1 - D * 0.04], [bx0 + W * 0.12, by1 - D * 0.04]], z2 + H * 0.025, Z1);
    for (let i = 0; i < 6; i++) a.box(bx1 + W * 0.02 - 0.0, YF + D * (0.08 + i * 0.03) + 0, g + (z1 - g) * (i / 6), bx1 + W * 0.2, YF + D * (0.11 + i * 0.03), g + (z1 - g) * ((i + 1) / 6));
    a.rect(bx0, by0, bx1, by1, 'EQUIP-DETAIL');
    a.log('Added the base plate, a brick lower storey, an overhanging glazed upper storey with a framed window run, a hipped roof and an external stair of six steps (plan and 3D).');
  }
}

function landmark(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, bt = H * 0.03, k = v.kind;
  a.outline();
  a.prism(ngon(cx, cy, W * 0.5, 12), Z0, Z0 + bt); const g = Z0 + bt;
  if (k === 'lighthouse') {
    const r0 = W * 0.2, r1 = W * 0.12, tz1 = g + (Z1 - g) * 0.72;
    lathe(a, cx, cy, g, tz1, [r0, r0 * 0.9, r1 * 1.15, r1], 16);
    for (const f of [0.2, 0.46, 0.72]) a.tube([[cx, cy, g + (tz1 - g) * f], [cx, cy, g + (tz1 - g) * (f + 0.1)]], [prof([[0, r0], [1, r1]], f) * 1.04, prof([[0, r0], [1, r1]], f + 0.1) * 1.04], 16);
    a.cyl(cx, cy, tz1, tz1 + H * 0.025, r1 * 1.8, 16); ring(a, 'z', cx, cy, tz1 + H * 0.025, tz1 + H * 0.05, r1 * 1.7, r1 * 1.8, 16);
    const lz1 = tz1 + H * 0.15; a.cyl(cx, cy, tz1 + H * 0.025, lz1, r1 * 0.95, 12); for (let i = 0; i < 8; i++) { const g2 = (i * TAU) / 8; bar(a, [cx + r1 * 0.97 * m.cos(g2), cy + r1 * 0.97 * m.sin(g2), tz1 + H * 0.03], [cx + r1 * 0.97 * m.cos(g2), cy + r1 * 0.97 * m.sin(g2), lz1], 0.01 * W, 4); }
    a.cone(cx, cy, lz1, Z1 - H * 0.03, r1 * 1.3, r1 * 0.3, 14); a.cyl(cx, cy, Z1 - H * 0.03, Z1, W * 0.012, 6);
    a.box(cx + W * 0.2, cy - D * 0.18, g, cx + W * 0.46, cy + D * 0.08, g + H * 0.12); prismX(a, [[cy - D * 0.19, g + H * 0.12], [cy + D * 0.09, g + H * 0.12], [cy - D * 0.05, g + H * 0.2]], cx + W * 0.19, cx + W * 0.47);
    a.circ(cx, cy, r0, 'EQUIP-DETAIL'); a.rect(cx + W * 0.2, cy - D * 0.18, cx + W * 0.46, cy + D * 0.08, 'EQUIP-DETAIL');
    a.log('Added the round base, a tapered tower with three painted bands, a gallery with a rail ring, a lantern room with eight glazing bars, a conical roof with a finial and a keeper\'s cottage (plan and 3D).');
  } else if (k === 'windmill') {
    const r0 = W * 0.22, r1 = W * 0.15, tz = g + (Z1 - g) * 0.62;
    a.prism(ngon(cx, cy, r0, 8, m.PI / 8), g, g + H * 0.04); lathe(a, cx, cy, g + H * 0.04, tz, [r0 * 0.95, r0 * 0.8, r1 * 1.0, r1], 8);
    a.tube([[cx, cy, tz], [cx, cy, tz + H * 0.1], [cx, cy, tz + H * 0.14]], [r1 * 1.15, r1 * 1.0, r1 * 0.2], 10);
    a.frame(cx - r0 * 0.3, g + H * 0.04, cx + r0 * 0.3, g + H * 0.04 + H * 0.12, YF + D * 0.5 - r0 - 4, YF + D * 0.5 - r0 + 2, 2);
    const hz = tz + H * 0.07, hy = cy - r1 * 1.1; a.ycyl(hy - 0.06 * D, hy + 4, cx, hz, W * 0.025, 8);
    for (let i = 0; i < 4; i++) { const g2 = m.PI / 4 + (i * m.PI) / 2, L = m.min(H * 0.34, W * 0.45), ca = m.cos(g2), sa = m.sin(g2), nx = -sa, nz = ca, w = W * 0.05; const p = (r, o) => [cx + r * ca + o * nx, hz + r * sa + o * nz];
      prismY(a, [p(W * 0.04, -w * 0.2), p(L, -w * 0.2), p(L, w * 0.2), p(W * 0.04, w * 0.2)], hy - 0.07 * D, hy - 0.06 * D + 1);
      prismY(a, [p(L * 0.3, w * 0.2), p(L, w * 0.2), p(L, w * 2.1), p(L * 0.3, w * 2.1)], hy - 0.06 * D, hy - 0.05 * D); }
    a.circ(cx, cy, r0, 'EQUIP-DETAIL'); a.circ(cx, cy, r1, 'EQUIP-DETAIL');
    a.log('Added the base, a tapered eight-sided tower with a door frame, a domed cap, a hub shaft and four sails with frames on bars (plan and 3D).');
  } else {
    const lz0 = g + (Z1 - g) * 0.5, tr = W * 0.24;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { bar(a, [cx + sx * W * 0.34, cy + sy * D * 0.34, g], [cx + sx * W * 0.2, cy + sy * D * 0.2, lz0], W * 0.015, 6); }
    for (const z of [0.2, 0.38]) { const f = (lz0 - g) * z; const e = 0.34 - 0.14 * (z * (lz0 - g) / (lz0 - g)) * 0.9; bar(a, [cx - W * e, cy - D * e, g + f], [cx + W * e, cy - D * e, g + f], W * 0.008, 4); bar(a, [cx - W * e, cy + D * e, g + f], [cx + W * e, cy + D * e, g + f], W * 0.008, 4); bar(a, [cx - W * e, cy - D * e, g + f], [cx - W * e, cy + D * e, g + f], W * 0.008, 4); bar(a, [cx + W * e, cy - D * e, g + f], [cx + W * e, cy + D * e, g + f], W * 0.008, 4); }
    a.cyl(cx, cy, lz0, lz0 + 4, tr * 1.05, 16); a.cyl(cx, cy, lz0 + 4, Z1 - H * 0.12, tr, 20); a.cone(cx, cy, Z1 - H * 0.12, Z1 - H * 0.02, tr * 1.05, tr * 0.3, 20); a.cyl(cx, cy, Z1 - H * 0.02, Z1, W * 0.015, 6);
    bar(a, [cx, cy - tr, lz0 + 4], [cx, cy - tr - W * 0.04, g + H * 0.03], W * 0.01, 5);
    a.circ(cx, cy, tr, 'EQUIP-DETAIL'); for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.circ(cx + sx * W * 0.34, cy + sy * D * 0.34, W * 0.015, 'EQUIP-DETAIL');
    a.log('Added the base, four braced legs with two tiers of ties, a round tank with a flat floor ring, a conical roof with a finial and a down pipe (plan and 3D).');
  }
}

function modelHeli(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, fy = YF + D * 0.3, sk = Z0 + H * 0.06, fz = Z0 + H * 0.4, fr = H * 0.22;
  a.outline();
  a.ell(cx, fy, fz, W * 0.075, D * 0.2, fr, 14, 8);                                                   // fuselage pod
  a.ell(cx, fy - D * 0.09, fz + fr * 0.2, W * 0.065, D * 0.1, fr * 0.72, 12, 6);                       // canopy
  a.tube([[cx, fy + D * 0.1, fz + fr * 0.1], [cx, YB - D * 0.06, fz + fr * 0.4]], [W * 0.032, W * 0.014], 8);   // tail boom
  prismX(a, [[YB - D * 0.11, fz + fr * 0.35], [YB - D * 0.015, fz + fr * 0.35], [YB - D * 0.025, Z0 + H * 0.86], [YB - D * 0.07, Z0 + H * 0.7]], cx - 1.8, cx + 1.8);   // fin
  a.box(cx - W * 0.09, YB - D * 0.1, fz + fr * 0.3, cx + W * 0.09, YB - D * 0.07, fz + fr * 0.36);
  ring(a, 'x', YB - D * 0.03, Z0 + H * 0.7, cx + 3, cx + 5, 0, H * 0.14, 14); bar(a, [cx + 3, YB - D * 0.03, Z0 + H * 0.7], [cx + 5, YB - D * 0.03, Z0 + H * 0.7], 4, 5);
  const mz = fz + fr * 0.95; a.cyl(cx, fy, fz + fr * 0.5, mz + H * 0.07, W * 0.012, 8); a.cyl(cx, fy, mz + H * 0.02, mz + H * 0.06, W * 0.03, 10);
  for (const s of [-1, 1]) prismY(a, [[cx + s * W * 0.03, mz + H * 0.06], [cx + s * W * 0.49, mz + H * 0.065], [cx + s * W * 0.49, mz + H * 0.09], [cx + s * W * 0.03, mz + H * 0.095]], fy - D * 0.035, fy + D * 0.035);
  a.xcyl(cx - W * 0.17, cx + W * 0.17, fy, mz + H * 0.075, 3, 6);                                      // flybar
  for (const s of [-1, 1]) { bar(a, [cx + s * W * 0.1, fy - D * 0.2, sk], [cx + s * W * 0.1, fy + D * 0.2, sk], H * 0.016, 7); for (const y of [fy - D * 0.1, fy + D * 0.1]) bar(a, [cx + s * W * 0.07, y, fz - fr * 0.7], [cx + s * W * 0.1, y, sk], H * 0.012, 6); }
  a.poly([[cx - W * 0.08, fy - D * 0.2], [cx + W * 0.08, fy - D * 0.2], [cx + W * 0.07, fy + D * 0.2], [cx - W * 0.07, fy + D * 0.2]]); a.line(cx, fy + D * 0.2, cx, YB - D * 0.03); a.line(cx - W / 2, fy, cx + W / 2, fy); a.circ(cx, fy, W * 0.03, 'EQUIP-DETAIL');
  a.log('Added the fuselage pod with a canopy, a tail boom with a fin, a stabiliser and a tail rotor, the main mast with a hub and two blades with a flybar, and two skids on four struts (plan and 3D).');
}

/** a hull lofted from sections along y; shape(f) gives {b: half beam factor, zb: keel z, zd: deck z} */
function hull(a, cx, y0, y1, B, shape, n = 14) {
  const secs = [];
  for (let i = 0; i <= n; i++) { const f = i / n, s = shape(f), b = m.max(0.6, s.b * B), zb = s.zb, zd = s.zd, zm = lerp(zb, zd, 0.42); secs.push({ y: lerp(y0, y1, f), pts: [[cx - b * 0.34, zb], [cx + b * 0.34, zb], [cx + b * 0.86, zm], [cx + b, zd], [cx - b, zd], [cx - b * 0.86, zm]] }); }
  loftY(a, secs);
}
function modelBoat(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, y0 = YF + D * 0.04, y1 = YB - D * 0.04, L = y1 - y0, B = W * 0.45, yacht = v.kind === 'yacht', bt = H * 0.03;
  a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + bt);
  if (yacht) {
    const zk = Z0 + H * 0.17, zd0 = zk + H * 0.07;
    hull(a, cx, y0, y1, B, (f) => ({ b: prof([[0, 0.02], [0.12, 0.5], [0.4, 0.92], [0.65, 1], [0.9, 0.86], [1, 0.7]], f), zb: zk + (zd0 - zk) * 0.2 * (1 - m.sin(f * m.PI)) , zd: zd0 + H * 0.02 * (1 - f) }));
    a.box(cx - 2.5, y0 + L * 0.4, Z0 + bt, cx + 2.5, y0 + L * 0.58, zk + 4); a.ell(cx, y0 + L * 0.5, Z0 + bt + H * 0.04, 6, L * 0.07, H * 0.03, 10, 5);
    for (const f of [0.28, 0.74]) a.box(cx - B * 0.8, y0 + L * f - 8, Z0 + bt, cx - B * 0.45, y0 + L * f + 8, zk + 4), a.box(cx + B * 0.45, y0 + L * f - 8, Z0 + bt, cx + B * 0.8, y0 + L * f + 8, zk + 4);
    const my = y0 + L * 0.42, mz1 = Z1 - 4; a.cyl(cx, my, zd0, mz1, W * 0.012 + 1.5, 8);
    bar(a, [cx, my, zd0 + H * 0.2], [cx, y1 - L * 0.04, zd0 + H * 0.2], 1.8, 5);
    prismX(a, [[my + 3, zd0 + H * 0.22], [y1 - L * 0.05, zd0 + H * 0.21], [my + 3, mz1 - 6]], cx - 0.9, cx + 0.9);
    prismX(a, [[y0 + L * 0.03, zd0 + H * 0.03], [my - 3, zd0 + H * 0.03], [my - 3, mz1 - 12]], cx - 0.9, cx + 0.9);
    bar(a, [cx, y1 - L * 0.04, zd0], [cx, y1 - L * 0.04, zd0 + H * 0.28], 1.4, 4); a.ell(cx, y0 + L * 0.7, zd0 + H * 0.02, W * 0.04, L * 0.06, H * 0.025, 8, 4);
    a.line(cx, y0, cx, y1); a.poly([[cx - B * 0.02, y0], [cx - B * 0.5, y0 + L * 0.2], [cx - B, y0 + L * 0.5], [cx - B * 0.7, y1], [cx + B * 0.7, y1], [cx + B, y0 + L * 0.5], [cx + B * 0.5, y0 + L * 0.2], [cx + B * 0.02, y0]], 'EQUIP-DETAIL');
    a.log('Added the base board with two cradle blocks, a lofted hull with a fin keel and ballast bulb, the mast, boom, mainsail and jib, a cockpit hatch and a tiller (plan and 3D).');
  } else {
    const zk = Z0 + H * 0.08, zd0 = zk + H * 0.3;
    hull(a, cx, y0, y1, B, (f) => ({ b: prof([[0, 0.25], [0.08, 0.7], [0.25, 1], [0.85, 1], [1, 0.82]], f), zb: zk + H * 0.06 * (1 - f) * 0.5, zd: zd0 + H * 0.05 * (1 - 2 * f) * 0.6 }));
    for (const f of [0.28, 0.74]) a.box(cx - B * 0.55, y0 + L * f - 8, Z0 + bt, cx + B * 0.55, y0 + L * f + 8, zk + 4);
    const hy0 = y0 + L * 0.36, hy1 = y0 + L * 0.7, hz = zd0 + H * 0.01;
    a.box(cx - B * 0.72, hy0, hz, cx + B * 0.72, hy1, hz + H * 0.2); a.box(cx - B * 0.6, hy0 + (hy1 - hy0) * 0.12, hz + H * 0.2, cx + B * 0.6, hy1 - (hy1 - hy0) * 0.2, hz + H * 0.38);
    a.box(cx - B * 0.66, hy0 + (hy1 - hy0) * 0.08, hz + H * 0.38, cx + B * 0.66, hy1 - (hy1 - hy0) * 0.16, hz + H * 0.4);
    a.cyl(cx, hy1 - (hy1 - hy0) * 0.16, hz + H * 0.2, hz + H * 0.62, B * 0.22, 14); a.cyl(cx, hy1 - (hy1 - hy0) * 0.16, hz + H * 0.62, hz + H * 0.66, B * 0.25, 14);
    a.cyl(cx, hy0 + (hy1 - hy0) * 0.35, hz + H * 0.4, Z1 - 6, 2, 6); bar(a, [cx - B * 0.14, hy0 + (hy1 - hy0) * 0.35, Z1 - H * 0.16], [cx + B * 0.14, hy0 + (hy1 - hy0) * 0.35, Z1 - H * 0.16], 1.6, 4);
    for (const s of [-1, 1]) a.ell(cx + s * B * 0.6, y0 + L * 0.04, zk + H * 0.12, B * 0.08, B * 0.08, B * 0.08, 8, 5);
    for (const s of [-1, 1]) a.box(cx + s * B * 0.93 - 2, y0 + L * 0.12, zd0 - H * 0.01, cx + s * B * 0.93 + 2, y1 - L * 0.05, zd0 + H * 0.05);
    a.box(cx - B * 0.9, y0 + L * 0.12 - 4, zd0 - H * 0.01, cx + B * 0.9, y0 + L * 0.12, zd0 + H * 0.05); a.box(cx - B * 0.8, y1 - L * 0.05, zd0 - H * 0.01, cx + B * 0.8, y1 - L * 0.05 + 4, zd0 + H * 0.05);
    a.xcyl(cx - B * 0.8, cx + B * 0.8, y0 + L * 0.1, zd0 + H * 0.03, B * 0.05, 8); a.box(cx - B * 0.12, y1 - L * 0.1, hz, cx + B * 0.12, y1 - L * 0.04, hz + H * 0.07);
    a.poly([[cx - B * 0.25, y0], [cx - B, y0 + L * 0.25], [cx - B, y1 - L * 0.1], [cx - B * 0.8, y1], [cx + B * 0.8, y1], [cx + B, y1 - L * 0.1], [cx + B, y0 + L * 0.25], [cx + B * 0.25, y0]], 'EQUIP-DETAIL'); a.rect(cx - B * 0.72, hy0, cx + B * 0.72, hy1, 'EQUIP-DETAIL');
    a.log('Added the base board with two cradle blocks, a lofted blunt-bowed hull, a two-tier deckhouse with a roof, a funnel with a cap, a mast with a yard, bow fenders, a towing bitt and a stern rail (plan and 3D).');
  }
}

/** a car at scale: lower body, cabin, wheels with tyres, lamps and bumpers; front at y0 (−Y) */
function drawCar(a, cx, y0, y1, z0, Wd, Hh) {
  const L = y1 - y0, wr = Hh * 0.2, tw = Wd * 0.12, bz0 = z0 + wr * 0.85, bz1 = z0 + Hh * 0.52, wx = Wd / 2 - tw / 2;
  a.box(cx - Wd * 0.48, y0 + L * 0.015, bz0, cx + Wd * 0.48, y1 - L * 0.015, bz1);
  a.box(cx - Wd * 0.47, y0, bz0 + Hh * 0.03, cx + Wd * 0.47, y0 + L * 0.03, bz0 + Hh * 0.13); a.box(cx - Wd * 0.47, y1 - L * 0.03, bz0 + Hh * 0.03, cx + Wd * 0.47, y1, bz0 + Hh * 0.13);
  prismX(a, [[y0 + L * 0.3, bz1], [y1 - L * 0.22, bz1], [y1 - L * 0.32, z0 + Hh], [y0 + L * 0.44, z0 + Hh]], cx - Wd * 0.43, cx + Wd * 0.43);
  for (const s of [-1, 1]) { for (const [f0, f1] of [[0.4, 0.545], [0.565, 0.69]]) frameYZ(a, y0 + L * f0, bz1 + Hh * 0.05, y0 + L * f1, z0 + Hh * 0.9, s > 0 ? cx + Wd * 0.43 : cx - Wd * 0.43 - Wd * 0.014, s > 0 ? cx + Wd * 0.43 + Wd * 0.014 : cx - Wd * 0.43, Wd * 0.02); a.box(cx + s * Wd * 0.49 - (s < 0 ? Wd * 0.03 : 0), y0 + L * 0.36, bz1 - Hh * 0.04, cx + s * Wd * 0.49 + (s > 0 ? Wd * 0.03 : 0), y0 + L * 0.39, bz1 + Hh * 0.02); }
  for (const s of [-1, 1]) { a.ycyl(y0 - 0, y0 + L * 0.02, cx + s * Wd * 0.34, bz1 - Hh * 0.08, Hh * 0.045, 8); a.box(cx + s * Wd * 0.34 - Wd * 0.05, y1 - L * 0.012, bz1 - Hh * 0.1, cx + s * Wd * 0.34 + Wd * 0.05, y1, bz1 - Hh * 0.04); }
  a.box(cx - Wd * 0.14, y0, bz0 + Hh * 0.01, cx + Wd * 0.14, y0 + L * 0.012, bz0 + Hh * 0.09);
  for (const y of [y0 + L * 0.21, y1 - L * 0.2]) for (const s of [-1, 1]) { const x = cx + s * wx; ring(a, 'x', y, z0 + wr, x - tw / 2, x + tw / 2, wr * 0.6, wr, 14); a.xcyl(x - tw / 2, x + tw / 2, y, z0 + wr, wr * 0.62, 10); a.xcyl(x - tw / 2 - (s < 0 ? 0.3 : 0), x + tw / 2 + (s > 0 ? 0.3 : 0), y, z0 + wr, wr * 0.28, 8); }
  a.rect(cx - Wd * 0.48, y0, cx + Wd * 0.48, y1, 'EQUIP-DETAIL'); a.rect(cx - Wd * 0.43, y0 + L * 0.3, cx + Wd * 0.43, y1 - L * 0.22, 'EQUIP-DETAIL');
}
function roadModel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a;
  a.outline();
  if (v.kind === 'car') { drawCar(a, cx, YF, YB, Z0, W, H); a.log('Added the lower body with bumpers, a cabin with glazing bars, mirrors, lamps and a grille, and four wheels with tyres and hubs (plan and 3D).'); return; }
  const wr = H * 0.17, tw = W * 0.12, wx = W / 2 - tw / 2, rz = Z0 + H * 0.28, ch = Z0 + H * 0.25;
  for (const s of [-1, 1]) bar(a, [cx + s * W * 0.22, YF + D * 0.02, rz], [cx + s * W * 0.22, YB - D * 0.02, rz], W * 0.04, 6);
  a.box(cx - W * 0.46, YF + D * 0.01, rz - H * 0.02, cx + W * 0.46, YF + D * 0.1, rz + H * 0.1);                       // front bumper
  const ey = YF + D * 0.14; a.box(cx - W * 0.4, YF + D * 0.1, rz, cx + W * 0.4, ey + D * 0.2, Z0 + H * 0.5);          // hood
  a.box(cx - W * 0.44, ey + D * 0.2, rz, cx + W * 0.44, ey + D * 0.38, Z1 - H * 0.28);                                 // cab
  a.box(cx - W * 0.46, ey + D * 0.18, Z1 - H * 0.34, cx + W * 0.46, ey + D * 0.4, Z1 - H * 0.26);
  a.frame(cx - W * 0.38, Z0 + H * 0.5, cx + W * 0.38, Z1 - H * 0.3, ey + D * 0.2 - D * 0.008, ey + D * 0.2, W * 0.03);
  for (const s of [-1, 1]) a.ycyl(YF + D * 0.005, YF + D * 0.01, cx + s * W * 0.36, rz + H * 0.07, H * 0.03, 8);
  // the dump body, tipped on its rear hinge
  const hp = [YB - D * 0.06, rz + H * 0.14], an = 0.34, ca = m.cos(an), sa = m.sin(an);
  const rot = (y, z) => { const dy = y - hp[0], dz = z - hp[1]; return [hp[0] + dy * ca + dz * sa, hp[1] - dy * sa + dz * ca]; };
  const by0 = ey + D * 0.42, bz0 = rz + H * 0.14, bz1 = bz0 + H * 0.3, t = W * 0.035;
  prismX(a, [rot(by0, bz0), rot(hp[0], bz0), rot(hp[0], bz0 + t), rot(by0, bz0 + t)], cx - W * 0.45, cx + W * 0.45);
  prismX(a, [rot(by0, bz0), rot(by0 + t, bz0), rot(by0 + t, bz1 + H * 0.08), rot(by0, bz1 + H * 0.08)], cx - W * 0.45, cx + W * 0.45);
  for (const s of [-1, 1]) prismX(a, [rot(by0, bz0), rot(hp[0], bz0), rot(hp[0], bz1), rot(by0, bz1)], s > 0 ? cx + W * 0.45 - t : cx - W * 0.45, s > 0 ? cx + W * 0.45 : cx - W * 0.45 + t);
  bar(a, [cx, ...rot(by0 + (hp[0] - by0) * 0.3, bz0)], [cx, by0 + (hp[0] - by0) * 0.05, rz + H * 0.04], W * 0.03, 6);
  const ax = [YF + D * 0.2, YB - D * 0.34, YB - D * 0.14];
  for (const y of ax) for (const s of [-1, 1]) { const x = cx + s * wx; ring(a, 'x', y, Z0 + wr, x - tw / 2, x + tw / 2, wr * 0.55, wr, 14); a.xcyl(x - tw / 2, x + tw / 2, y, Z0 + wr, wr * 0.58, 10); a.xcyl(x - tw / 2 - (s < 0 ? 0.3 : 0), x + tw / 2 + (s > 0 ? 0.3 : 0), y, Z0 + wr, wr * 0.26, 8); }
  for (const y of ax) a.xcyl(cx - wx, cx + wx, y, Z0 + wr, wr * 0.1, 6);
  a.rect(cx - W * 0.44, ey + D * 0.2, cx + W * 0.44, ey + D * 0.38, 'EQUIP-DETAIL'); a.rect(cx - W * 0.45, by0, cx + W * 0.45, YB - D * 0.06, 'EQUIP-DETAIL');
  a.log('Added two chassis rails, a front bumper, hood and cab with windscreen frame, lamps, a dump body tipped on its rear hinge with a hoist ram, and three axles with tyres and hubs (plan and 3D).');
}

function modelRocket(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, br = v.dia * IN / 2, bt = 14, g = Z0 + bt, two = v.stages === 2;
  a.outline(); a.prism(ngon(cx, cy, W * 0.5, 16), Z0, g);
  a.cyl(cx, cy, g, Z1, 1.4, 6);                                                                                    // launch rod
  const zs = g + 70, noseL = br * 4.6, zn = Z1 - noseL, bodyTop = zn;
  a.cone(cx, cy, g + 2, zs, br * 4, br * 0.9, 12);                                                                 // blast deflector
  a.cyl(cx, cy, zs, bodyTop, br, 18); ring(a, 'z', cx, cy, zs, zs + br * 0.8, br * 0.55, br * 1.05, 18);              // body tube and engine hook ring
  a.tube([[cx, cy, zn], [cx, cy, zn + noseL * 0.3], [cx, cy, zn + noseL * 0.62], [cx, cy, zn + noseL * 0.86], [cx, cy, Z1 - 1]], [br, br * 0.82, br * 0.56, br * 0.26, 1], 14);
  const nf = v.fins, fh = (bodyTop - zs) * (two ? 0.2 : 0.3), span = m.min(W / 2 - 4, br * 3.1);
  const finsAt = (z0) => { for (let i = 0; i < nf; i++) { const g2 = (i * TAU) / nf + (nf === 3 ? m.PI / 2 : m.PI / 4), ca = m.cos(g2), sa = m.sin(g2), nx = -sa, ny = ca, th = 1.4;
    const P = (r, z, o) => [cx + r * ca + o * nx, cy + r * sa + o * ny, z]; const pts = [[br * 0.95, z0], [br * 0.95, z0 + fh], [br + span * 0.75, z0 + fh * 0.18], [br + span, z0]];
    const tris = []; const A = pts.map(([r, z]) => P(r, z, th)), B = pts.map(([r, z]) => P(r, z, -th));
    for (let k = 1; k < 3; k++) tris.push([A[0], A[k], A[k + 1]], [B[0], B[k + 1], B[k]]); for (let k = 0; k < 4; k++) { const k2 = (k + 1) % 4; tris.push([A[k], B[k], B[k2]], [A[k], B[k2], A[k2]]); } closed(a, tris); } };
  finsAt(zs + 6); if (two) { const zj = zs + (bodyTop - zs) * 0.5; ring(a, 'z', cx, cy, zj - 6, zj + br * 1.4, br * 0.98, br * 1.07, 18); finsAt(zj + br * 1.4 + 6); }
  a.box(cx + br - 0.5, cy - 1.5, zs + (bodyTop - zs) * 0.4, cx + br + 6, cy + 1.5, zs + (bodyTop - zs) * 0.4 + 14);   // launch lug
  a.circ(cx, cy, br, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.5, 'EQUIP-DETAIL'); for (let i = 0; i < nf; i++) { const g2 = (i * TAU) / nf + (nf === 3 ? m.PI / 2 : m.PI / 4); a.line(cx + br * m.cos(g2), cy + br * m.sin(g2), cx + (br + span) * m.cos(g2), cy + (br + span) * m.sin(g2), 'EQUIP-DETAIL'); }
  a.log(`Added the round launch pad with a rod and blast deflector, a ${v.dia} in body tube with an engine ring, a tapered nose cone, ${nf} fins${two ? ' on each of two stages joined by a coupler' : ''} and a launch lug (plan and 3D).`);
}

function paintRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, pr = 14, ph = 38;
  a.outline();
  const pot = (x, y, z) => { a.cyl(x, y, z, z + ph, pr, 10); a.cyl(x, y, z + ph, z + ph + 9, pr * 0.72, 8); a.circ(x, y, pr, 'EQUIP-DETAIL'); };
  if (v.kind === 'carousel') {
    a.cyl(cx, cy, Z0, Z0 + 12, W * 0.42, 24); a.cyl(cx, cy, Z0 + 12, Z1 - 14, 18, 10);
    for (let k = 0; k < v.tiers; k++) { const z = Z0 + 24 + k * (H - 60) / v.tiers * 0.95; ring(a, 'z', cx, cy, z, z + 8, 0, W * (0.42 - k * 0.06), 28); ring(a, 'z', cx, cy, z + 8, z + 22, W * (0.42 - k * 0.06) - 8, W * (0.42 - k * 0.06), 28); const r = W * (0.42 - k * 0.06) - 4 - pr * 1.2, n = m.floor((TAU * r) / (pr * 2.4)); for (let i = 0; i < n; i++) pot(cx + r * m.cos((i * TAU) / n), cy + r * m.sin((i * TAU) / n), z + 8); }
    a.cyl(cx, cy, Z1 - 14, Z1, 40, 14);
    a.circ(cx, cy, W * 0.42, 'EQUIP-DETAIL'); a.circ(cx, cy, 18, 'EQUIP-DETAIL');
    a.log(`Added a base disc, a central spindle, ${v.tiers} turntable tiers with rim lips, paint pots with caps around each tier and a knob on top (plan and 3D).`);
    return;
  }
  const n = v.rows, per = m.floor((W - 20) / (pr * 2.5));
  if (v.kind === 'steps') {
    const sd = (D - 20) / n, sh = (H - ph - 12) / n;
    for (let r = 0; r < n; r++) { const y0 = YB - 10 - (r + 1) * sd, z1 = Z0 + sh * (n - r); a.box(X0, y0, Z0, X1, YB - 10 - r * sd, z1 - 0 * sh); a.box(X0, y0, z1, X1, y0 + 4, z1 + 6);
      for (let i = 0; i < per; i++) pot(X0 + 12 + ((W - 24) * (i + 0.5)) / per, y0 + sd / 2, z1); a.line(X0, y0, X1, y0, 'EQUIP-DETAIL'); }
    a.box(X0, YB - 10, Z0, X1, YB, Z1 - 4);
    a.log(`Added ${n} stepped tiers, each with a front lip and a row of ${per} paint pots with caps, and a back panel (plan and 3D).`);
    return;
  }
  a.box(X0, YB - 14, Z0, X1, YB, Z1);
  const sh = (H - 20) / n;
  for (let r = 0; r < n; r++) { const z = Z0 + 10 + r * sh; a.box(X0, YF, z, X1, YB - 14, z + 10); a.box(X0, YF, z + 10, X1, YF + 5, z + 22);
    for (let c = 0; c < per; c++) for (const yy of [YF + 8 + pr + 2, YF + 8 + pr * 3 + 6]) if (yy < YB - 20) pot(X0 + 12 + ((W - 24) * (c + 0.5)) / per, yy, z + 10); }
  a.rect(X0, YB - 14, X1, YB, 'EQUIP-DETAIL');
  a.log(`Added a back board with ${n} shelves, each with a front lip and two ranks of ${per} paint pots with caps (plan and 3D).`);
}

// ------------------------------------------------------------------------------------------ collecting
const hash = (i) => { const s = m.sin(i * 12.9898 + 4.1) * 43758.5453; return s - m.floor(s); };

function medalFrame(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, bw = 30, pz = Z0 + 26;
  a.outline();
  a.box(X0 + W * 0.04, YF, Z0, X1 - W * 0.04, YB, pz);                                                       // base tray
  a.box(X0, YB - 12, pz, X1, YB, Z1);                                                                         // back plate
  a.box(X0, YF + 6, pz, X0 + bw, YB, Z1); a.box(X1 - bw, YF + 6, pz, X1, YB, Z1); a.box(X0 + bw, YF + 6, pz, X1 - bw, YB, pz + bw); a.box(X0 + bw, YF + 6, Z1 - bw, X1 - bw, YB, Z1);
  a.frame(X0, pz, X1, Z1, YF, YF + 12, bw + 10);                                                              // front bezel
  const ix0 = X0 + bw, ix1 = X1 - bw, iz0 = pz + bw, iz1 = Z1 - bw;
  a.box(ix0 + 3, YB - 24, iz0 + 3, ix1 - 3, YB - 12, iz1 - 3);                                                // lined back panel
  const n = v.n, cols = m.min(n, 5), rws = m.ceil(n / cols), cw = (ix1 - ix0) / cols, ch = (iz1 - iz0 - 70) / rws;
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = m.floor(i / cols), x = ix0 + cw * (c + 0.5), zt = iz1 - 8 - r * ch;
    a.box(x - 13, YB - 28, zt - ch * 0.55, x + 13, YB - 24, zt);                                              // ribbon
    a.ycyl(YB - 36, YB - 28, x, zt - ch * 0.55 - 24, 22, 14); a.ycyl(YB - 39, YB - 36, x, zt - ch * 0.55 - 24, 11, 10);
    if (i % 2) a.ycyl(YB - 32, YB - 28, x, zt - ch * 0.55 - 24, 26, 8);
  }
  a.box(cx - 50, YB - 30, iz0 + 8, cx + 50, YB - 24, iz0 + 24);                                              // name plate
  a.rect(ix0, YF + 12, ix1, YB - 12, 'EQUIP-DETAIL');
  a.log(`Added the base tray, a deep box with a front bezel, a lined back panel, ${n} ribbon and medal pairs in rows and a name plate (plan and 3D).`);
}

function barrister(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, n = v.stack, t = 18, bh = H * 0.07, th = H * 0.035, sh = (H - bh - th) / n;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bh); a.box(X0 + 20, YF, Z0 + bh * 0.4, X1 - 20, YF + 14, Z0 + bh * 0.9);
  for (let k = 0; k < n; k++) {
    const z0 = Z0 + bh + k * sh, z1 = z0 + sh;
    a.box(X0 + 10, YF + 24, z0, X0 + 10 + t, YB, z1); a.box(X1 - 10 - t, YF + 24, z0, X1 - 10, YB, z1); a.box(X0 + 10, YB - t, z0, X1 - 10, YB, z1);
    a.box(X0 + 10, YF + 24, z0, X1 - 10, YB, z0 + t * 0.7); a.box(X0 + 10, YF + 24, z0 + sh * 0.5, X1 - 10, YB - t, z0 + sh * 0.5 + 12);
    const bk = (zb, zh) => { const nb = m.floor((W - 90) / 22); for (let i = 0; i < nb; i++) { const x0 = X0 + 40 + ((W - 80) * i) / nb, hh = zh * (0.62 + 0.36 * hash(i + k * 31 + zb)); a.box(x0, YF + 50, zb, x0 + (W - 80) / nb - 2, YB - t - 10, zb + hh); } };
    bk(z0 + t * 0.7, sh * 0.38); bk(z0 + sh * 0.5 + 12, sh * 0.34);
    const fz0 = z0 + sh * 0.06 + t * 0.4, fz1 = z1 - 8; a.frame(X0 + 6, fz0, X1 - 6, fz1, YF + 4, YF + 24, 22);                    // glazed door frame lifted on tracks
    a.box(X0 + 6, YF + 4, (fz0 + fz1) / 2 - 2, X1 - 6, YF + 14, (fz0 + fz1) / 2 + 3);
    a.ycyl(YF - 8, YF + 4, cx, fz0 + 14, 9, 8); a.box(X0 + 4, YF + 14, z0 + 20, X0 + 10, YB - 24, z0 + 40);
  }
  a.box(X0 - 8, YF - 6, Z1 - th, X1 + 8 - 0.5, YB, Z1);
  a.rect(X0 + 10, YF + 24, X1 - 10, YB, 'EQUIP-DETAIL'); a.circ(cx, YF - 2, 9, 'EQUIP-DETAIL');
  a.log(`Added the plinth, a cornice and ${n} stacked sections, each with side panels, a back, a mid shelf with rows of books, a lifting glazed door frame with a knob and slide tracks (plan and 3D).`);
}

function planChest(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, sh = v.stand * IN, ct = H - sh, n = v.rows, t = 19;
  a.outline();
  if (sh > 0) { for (const [x, y] of [[X0 + 30, YF + 30], [X1 - 30, YF + 30], [X0 + 30, YB - 30], [X1 - 30, YB - 30]]) { a.tube([[x, y, Z0], [x, y, Z0 + sh]], [14, 22], 8); a.circ(x, y, 22, 'EQUIP-HIDDEN'); } a.box(X0 + 30, YF + 30, Z0 + sh * 0.35, X1 - 30, YB - 30, Z0 + sh * 0.35 + 22); }
  a.box(X0, YF + t, Z0 + sh, X1, YB, Z1 - 28); a.box(X0 - 10, YF, Z1 - 28, X1 + 10 - 0.5, YB, Z1);
  const dz = (ct - 28 - 20) / n;
  for (let i = 0; i < n; i++) {
    const z0 = Z0 + sh + 10 + i * dz, z1 = z0 + dz - 4; a.box(X0 + 6, YF, z0, X1 - 6, YF + t, z1);
    a.box(cx - 55, YF - 18, z0 + dz * 0.52, cx + 55, YF - 6, z0 + dz * 0.52 + 12); a.box(cx - 55, YF - 8, z0 + dz * 0.52 - 4, cx - 49, YF, z0 + dz * 0.52 + 14); a.box(cx + 49, YF - 8, z0 + dz * 0.52 - 4, cx + 55, YF, z0 + dz * 0.52 + 14);
    a.box(cx - 70, YF - 3, z1 - dz * 0.3 - 8, cx + 70, YF + 1, z1 - dz * 0.3 + 14); if (i % 2 === 0) { a.line(X0 + 6, YF, X1 - 6, YF, 'EQUIP-DETAIL'); }
  }
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.rect(cx - 55, YF - 18, cx + 55, YF - 6, 'EQUIP-DETAIL');
  a.log(`Added ${sh > 0 ? 'a stand with four tapered legs and a stretcher, ' : ''}a chest with ${n} wide shallow drawers, each with a bar pull and a label card holder, and an overhanging top (plan and 3D).`);
}

function watchWinder(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cols = v.cols, rows = v.rows, t = 14, bh = H * 0.46, lidT = 16;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 20); a.box(X0, YF, Z0, X0 + t, YB - lidT, Z0 + bh); a.box(X1 - t, YF, Z0, X1, YB - lidT, Z0 + bh); a.box(X0, YF, Z0, X1, YF + t, Z0 + bh * 0.66); a.box(X0, YB - lidT - t, Z0, X1, YB - lidT, Z0 + bh);
  const iw = (W - 2 * t) / cols, id = (D - lidT - 2 * t) / rows;
  for (let c = 1; c < cols; c++) a.box(X0 + t + iw * c - 4, YF + t, Z0 + 20, X0 + t + iw * c + 4, YB - lidT - t, Z0 + bh * 0.92);
  for (let r = 1; r < rows; r++) a.box(X0 + t, YF + t + id * r - 4, Z0 + 20, X1 - t, YF + t + id * r + 4, Z0 + bh * 0.92);
  const cr = m.min(iw, id) * 0.3;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const x = X0 + t + iw * (c + 0.5), y = YF + t + id * (r + 0.5), z = Z0 + 20 + cr + 14;
    a.xcyl(x - iw * 0.32, x + iw * 0.32, y, z, cr, 12); ring(a, 'y', x, z, y - 9, y + 9, cr * 0.9, cr * 1.4, 16); a.box(x - cr * 0.5, y - 5, z + cr * 1.2, x + cr * 0.5, y + 5, z + cr * 1.6);
    a.circ(x, y, cr * 1.2, 'EQUIP-DETAIL');
  }
  a.frame(X0, Z0 + bh, X1, Z1, YB - lidT, YB, 26); a.box(X0 + 26, YB - lidT + 5, Z0 + bh + 26, X1 - 26, YB - 5, Z1 - 26); a.box(X0 + t, YB - lidT, Z0 + bh - 6, X1 - t, YB - lidT + 6, Z0 + bh);   // lid opened upright at the back
  for (const s of [-1, 1]) a.xcyl(s > 0 ? X1 - 40 : X0 + 30, s > 0 ? X1 - 30 : X0 + 40, YB - lidT / 2, Z0 + bh, 7, 8);
  a.rect(X0 + t, YF + t, X1 - t, YB - lidT - t, 'EQUIP-DETAIL');
  a.log(`Added the tray base with a low front wall, ${cols * rows} winder cells split by dividers, a cushion drum with a watch head in each cell and a back lid opened upright with a frame and panel (plan and 3D).`);
}

function wineRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cols = v.cols, rows = v.rows, t = 14, fh = v.feet ? 70 : 0, cw = (W - t) / cols, rh = (H - fh - t) / rows;
  a.outline();
  for (let r = 0; r <= rows; r++) a.box(X0, YF, Z0 + fh + r * rh, X1, YB, Z0 + fh + r * rh + t);
  for (let c = 0; c <= cols; c++) a.box(X0 + c * cw, YF, Z0 + fh, X0 + c * cw + t, YB, Z1);
  if (v.feet) { a.box(X0, YF, Z0, X0 + 40, YB, Z0 + fh); a.box(X1 - 40, YF, Z0, X1, YB, Z0 + fh); }
  const br = m.min(cw, rh) * 0.34;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = X0 + t / 2 + cw * (c + 0.5), z = Z0 + fh + t + rh * r + (rh - t) / 2, yb1 = YB - 12, yb0 = yb1 - (D - 110);
    a.tube([[x, yb1, z], [x, yb0, z]], [br, br], 9); a.tube([[x, yb0, z], [x, yb0 - 28, z], [x, yb0 - 76, z]], [br, br * 0.38, br * 0.34], 8); a.ycyl(yb0 - 82, yb0 - 76, x, z, br * 0.4, 8);
  }
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); for (let c = 1; c < cols; c++) a.line(X0 + c * cw + t / 2, YF, X0 + c * cw + t / 2, YB, 'EQUIP-DETAIL');
  a.log(`Added ${rows + 1} shelves and ${cols + 1} uprights forming ${cols * rows} cells${v.feet ? ' on two feet' : ''}, with a bottle lying in each cell: body, shoulder, neck and lip (plan and 3D).`);
}

function riser(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, n = v.steps, sd = D / n, sh = (H * 0.6) / n;
  a.outline();
  for (let k = 0; k < n; k++) {
    const y0 = YF + k * sd, y1 = YB, z1 = Z0 + sh * (k + 1);
    a.box(X0, y0, Z0, X1, y0 + sd, z1);
    a.box(X0, y0, z1 - 1, X1, y0 + 4, z1 + 4); a.box(X0 + 6, y0 + 4, Z0, X1 - 6, y1, Z0 + sh * 0.0 + 0.01);
    const per = v.items; for (let i = 0; i < per; i++) { const x = X0 + ((W) * (i + 0.5)) / per, y = y0 + sd / 2; const hh = H * 0.3 * (0.75 + 0.35 * hash(i + k * 7)); a.cone(x, y, z1 + 4, z1 + 4 + hh * 0.7, sd * 0.2, sd * 0.08, 10); a.ell(x, y, z1 + 4 + hh * 0.82, sd * 0.11, sd * 0.11, sd * 0.11, 8, 5); a.circ(x, y, sd * 0.2, 'EQUIP-DETAIL'); }
    a.line(X0, y0, X1, y0, 'EQUIP-DETAIL');
  }
  a.log(`Added ${n} stepped tiers with a raised front lip on each and ${v.items} turned figurines (cone body and round head) standing on every step (plan and 3D).`);
}

function ballCube(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, br = v.ball * IN / 2, bt = H * 0.12, e = 3.5;
  a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + bt); a.box(X0 + 6, YF + 6, Z0 + bt, X1 - 6, YB - 6, Z0 + bt + 5);
  const cz0 = Z0 + bt + 5, cz1 = Z1 - 8, ix0 = X0 + 12, ix1 = X1 - 12, iy0 = YF + 12, iy1 = YB - 12;
  for (const x of [ix0, ix1]) for (const y of [iy0, iy1]) a.box(x - e, y - e, cz0, x + e, y + e, cz1);
  for (const z of [cz0, cz1 - e]) { a.box(ix0, iy0 - e, z, ix1, iy0 + e, z + e); a.box(ix0, iy1 - e, z, ix1, iy1 + e, z + e); a.box(ix0 - e, iy0, z, ix0 + e, iy1, z + e); a.box(ix1 - e, iy0, z, ix1 + e, iy1, z + e); }
  a.box(X0 + 3, YF + 3, cz1, X1 - 3, YB - 3, Z1);
  const zc = cz0 + br * 0.55 + 12; ring(a, 'z', cx, cy, cz0, cz0 + 14, br * 0.45, br * 0.75, 20); a.cyl(cx, cy, cz0, cz0 + 4, br * 0.78, 20);
  a.ell(cx, cy, zc + br * 0.45, br, br, br, 20, 12); ring(a, 'x', cy, zc + br * 0.45, cx - 0.7, cx + 0.7, br * 0.985, br * 1.012, 24); ring(a, 'z', cx, cy, zc + br * 0.45 - 0.7, zc + br * 0.45 + 0.7, br * 0.985, br * 1.012, 24);
  a.box(cx - 40, YF, Z0 + bt * 0.3, cx + 40, YF + 3, Z0 + bt * 0.7);
  a.circ(cx, cy, br, 'EQUIP-DETAIL'); a.rect(ix0, iy0, ix1, iy1, 'EQUIP-DETAIL');
  a.log(`Added a plinth with a name plate, an acrylic cube drawn as twelve edge bars and a top plate, a ring cup and a ${v.ball} in ball with seams (plan and 3D).`);
}

function specimenCabinet(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, n = v.rows, cols = v.cols, t = 19, ph = H * 0.07, th = 28;
  a.outline();
  a.box(X0, YF + 10, Z0, X1, YB, Z0 + ph); a.box(X0 - 6, YF, Z1 - th, X1 + 6 - 0.5, YB, Z1);
  a.box(X0 + 6, YF + 14, Z0 + ph, X1 - 6, YB, Z1 - th);
  const dz = (H - ph - th - 12) / n, cw = (W - 12) / cols;
  for (let c = 0; c < cols; c++) {
    if (c > 0) a.box(X0 + 6 + cw * c - 4, YF + 8, Z0 + ph, X0 + 6 + cw * c + 4, YF + 20, Z1 - th);
    for (let i = 0; i < n; i++) {
      const x0 = X0 + 8 + cw * c + 3, x1 = X0 + 6 + cw * (c + 1) - 3, z0 = Z0 + ph + 6 + i * dz, z1 = z0 + dz - 4;
      a.box(x0, YF, z0, x1, YF + t, z1); a.frame(x0 + 8, z0 + 6, x1 - 8, z1 - 6, YF - 4, YF, 7);
      a.ycyl(YF - 12, YF - 3, (x0 + x1) / 2, z0 + 11 > z1 - 20 ? z0 + 10 : z1 - 20, 8, 8); a.box((x0 + x1) / 2 - 24, YF - 4, z0 + 6, (x0 + x1) / 2 + 24, YF - 0.5, z0 + 6 + 8);
    }
  }
  a.rect(X0, YF + 10, X1, YB, 'EQUIP-DETAIL'); a.rect(X0 - 6, YF, X1 + 6, YB, 'EQUIP-DETAIL');
  a.log(`Added a plinth, an overhanging top and ${n * cols} shallow drawers in ${cols} column${cols > 1 ? 's' : ''}, each with a glazed frame, a brass knob and a label slot (plan and 3D).`);
}

function comicRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cols = v.cols, rows = v.rows, t = 19, bh = 90, cw = (W - t) / cols, rh = (H - bh - t) / rows;
  a.outline();
  a.box(X0, YF + 20, Z0, X1, YB, Z0 + bh);
  for (let r = 0; r <= rows; r++) a.box(X0, YF, Z0 + bh + r * rh, X1, YB, Z0 + bh + r * rh + t);
  for (let c = 0; c <= cols; c++) a.box(X0 + c * cw, YF, Z0 + bh, X0 + c * cw + t, YB, Z1);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x0 = X0 + t + c * cw + 8, x1 = X0 + (c + 1) * cw - 8 + t / 2 - 1, z0 = Z0 + bh + t + r * rh, z1 = z0 + rh - t - 30, y0 = YF + 24;
    a.box(x0, y0, z0, x1, YB - 6, z1); a.box(x0 - 3, y0 - 6, z1 - 18, x1 + 3, YB - 6, z1); a.box(x0 + (x1 - x0) * 0.3, y0 - 12, z1 - 16, x1 - (x1 - x0) * 0.3, y0 - 6, z1 - 4);   // lid ridge and label tab
    a.ycyl(y0 - 6, y0, (x0 + x1) / 2, z0 + (z1 - z0) * 0.4, 18, 10); a.circ((x0 + x1) / 2, y0 - 3, 18, 'EQUIP-DETAIL');
  }
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.log(`Added the plinth, ${rows + 1} shelves and ${cols + 1} uprights making ${cols * rows} cells, each holding a long storage box with a lid ridge, a label tab and a finger hole (plan and 3D).`);
}

function roomBox(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 16, st = v.storeys, rh = (H - 20 - t) / st, fz = Z0 + 20;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 20);
  a.box(X0, YB - t, fz, X1, YB, Z1); a.box(X0, YF, fz, X0 + t, YB, Z1); a.box(X1 - t, YF, fz, X1, YB, Z1);
  for (let s = 0; s < st; s++) {
    const z0 = fz + s * rh + (s ? t : 0), z1 = fz + (s + 1) * rh;
    if (s) a.box(X0 + t, YF + 10, fz + s * rh, X1 - t, YB - t, fz + s * rh + t);
    a.box(X0 + t, YB - t - 7, z0, X1 - t, YB - t, z0 + 24); a.box(X0 + t, YB - t - 4, z0 + 24, X1 - t, YB - t, z0 + 30);   // skirting and dado rail
    const wx = cx - W * 0.1, ww = W * 0.22, wz0 = z0 + rh * 0.3, wz1 = z1 - rh * 0.14;
    a.frame(wx - ww / 2, wz0, wx + ww / 2, wz1, YB - t - 12, YB - t, 12); a.box(wx - 3, YB - t - 9, wz0, wx + 3, YB - t - 3, wz1); a.box(wx - ww / 2, YB - t - 9, (wz0 + wz1) / 2 - 3, wx + ww / 2, YB - t - 3, (wz0 + wz1) / 2 + 3);
    a.box(wx - ww / 2 - 14, YB - t - 20, wz0 - 10, wx + ww / 2 + 14, YB - t, wz0);
    if (s === 0) {
      const fx = X1 - t - 8, fw = W * 0.16; a.box(fx - 26, YB - t - fw - 20, z0, fx, YB - t - 20, z0 + rh * 0.42); a.box(fx - 36, YB - t - fw - 30, z0 + rh * 0.42, fx, YB - t - 10, z0 + rh * 0.46);   // fireplace hearth surround and mantel
      a.box(fx - 12, YB - t - fw - 5, z0 + 8, fx - 0.5, YB - t - 35, z0 + rh * 0.3);
      const tx = cx - W * 0.1, ty = YF + D * 0.5; a.box(tx - 60, ty - 45, z0 + rh * 0.36, tx + 60, ty + 45, z0 + rh * 0.4); for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(tx + sx * 52 - 4, ty + sy * 37 - 4, z0, tx + sx * 52 + 4, ty + sy * 37 + 4, z0 + rh * 0.36);
      const chx = tx - 105, cyy = ty; a.box(chx - 22, cyy - 22, z0 + rh * 0.2, chx + 22, cyy + 22, z0 + rh * 0.24); a.box(chx - 22, cyy - 22, z0 + rh * 0.24, chx - 17, cyy + 22, z0 + rh * 0.48); for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(chx + sx * 18 - 2, cyy + sy * 18 - 2, z0, chx + sx * 18 + 2, cyy + sy * 18 + 2, z0 + rh * 0.2);
      a.box(tx - 120, ty - 95, z0, tx + 120, ty + 95, z0 + 2);
      a.rect(tx - 60, ty - 45, tx + 60, ty + 45, 'EQUIP-DETAIL'); a.rect(fx - 36, YB - t - fw - 30, fx, YB - t - 10, 'EQUIP-DETAIL');
    } else { bar(a, [cx + W * 0.2, YF + D * 0.5, z1 - 4], [cx + W * 0.2, YF + D * 0.5, z1 - rh * 0.22], 2, 5); a.cone(cx + W * 0.2, YF + D * 0.5, z1 - rh * 0.22, z1 - rh * 0.1, 3, 22, 12); }
  }
  a.rect(X0 + t, YF, X1 - t, YB - t, 'EQUIP-DETAIL');
  a.log(`Added the base board, three walls, ${st > 1 ? 'two storeys split by a floor slab, ' : ''}a framed window with glazing bars, skirting and a dado rail, a fireplace with a mantel, a table, a chair and a rug (plan and 3D).`);
}

function carCase(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, bt = H * 0.1, e = 2.8, cl = v.cl * IN, cw = v.cw * IN, ch = v.ch * IN;
  a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + bt); a.box(X0 + 5, YF + 5, Z0 + bt, X1 - 5, YB - 5, Z0 + bt + 4);
  a.box(cx - 3, YF + 8, Z0 + bt + 4, cx + 3, YB - 8, Z0 + bt + 4.6);
  const z0 = Z0 + bt + 4, z1 = Z1 - 8; for (const x of [X0 + 9, X1 - 9]) for (const y of [YF + 9, YB - 9]) a.box(x - e, y - e, z0, x + e, y + e, z1);
  for (const z of [z0, z1 - e]) { a.box(X0 + 9, YF + 9 - e, z, X1 - 9, YF + 9 + e, z + e); a.box(X0 + 9, YB - 9 - e, z, X1 - 9, YB - 9 + e, z + e); a.box(X0 + 9 - e, YF + 9, z, X0 + 9 + e, YB - 9, z + e); a.box(X1 - 9 - e, YF + 9, z, X1 - 9 + e, YB - 9, z + e); }
  a.box(X0 + 3, YF + 3, z1, X1 - 3, YB - 3, Z1);
  const cyc = (YF + YB) / 2; drawCar(a, cx, cyc - cl / 2, cyc + cl / 2, z0 + 0.6, cw, ch);
  a.box(cx - 40, YF, Z0 + bt * 0.3, cx + 40, YF + 2.5, Z0 + bt * 0.7);
  a.rect(X0 + 9, YF + 9, X1 - 9, YB - 9, 'EQUIP-DETAIL');
  a.log('Added a plinth with a name plate and road stripe, an acrylic cover drawn as twelve edge bars and a top plate, and a scale car inside with body, cabin, lamps and four wheels (plan and 3D).');
}

function mediaTower(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, n = v.shelves, t = 14, bh = H * 0.04, sh = (H - bh - t) / n;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bh); a.box(X0, YF, Z0 + bh, X0 + t, YB, Z1); a.box(X1 - t, YF, Z0 + bh, X1, YB, Z1); a.box(X0, YB - 6, Z0 + bh, X1, YB, Z1); a.box(X0 - 4, YF - 4, Z1 - t, X1 + 4 - 0.5, YB, Z1);
  for (let k = 0; k < n; k++) {
    const z = Z0 + bh + k * sh; a.box(X0 + t, YF + 6, z, X1 - t, YB - 6, z + t * 0.6); a.box(X0 + t, YF, z + t * 0.6, X1 - t, YF + 6, z + 30);
    const cw = 15, nc = m.floor((W - 2 * t - 8) / (cw + 0.5));
    for (let i = 0; i < nc; i++) { const x0 = X0 + t + 4 + i * (cw + 0.5), hh = 150 + hash(i + k * 17) * 22; if (z + t * 0.6 + hh > z + sh - 8) continue; a.box(x0, YB - 147, z + t * 0.6, x0 + cw, YB - 12, z + t * 0.6 + hh); a.box(x0 + 2, YB - 151, z + t * 0.6 + hh * 0.25, x0 + cw - 2, YB - 147, z + t * 0.6 + hh * 0.7); }
  }
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.log(`Added a base, two sides, a back and a top with ${n} shelves, each with a front lip and a row of slim cased discs with spine labels (plan and 3D).`);
}

// ------------------------------------------------------------------------------------------ outdoor
function gazebo(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, ze = Z0 + H * 0.64, px = W / 2 - 55, py = D / 2 - 55;
  a.outline();
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const x = cx + sx * px, y = cy + sy * py;
    a.cyl(x, y, Z0 + 12, ze, 22, 10); a.cyl(x, y, Z0 + H * 0.3, Z0 + H * 0.3 + 40, 28, 10); a.box(x - 60, y - 60, Z0, x + 60, y + 60, Z0 + 12); a.circ(x, y, 22, 'EQUIP-HIDDEN');
  }
  for (const sy of [-1, 1]) bar(a, [cx - px, cy + sy * py, ze - 6], [cx + px, cy + sy * py, ze - 6], 14, 7);
  for (const sx of [-1, 1]) bar(a, [cx + sx * px, cy - py, ze - 6], [cx + sx * px, cy + py, ze - 6], 14, 7);
  const nx = m.max(1, m.round(W / 1500)), ny = m.max(1, m.round(D / 1500));        // scissor trusses under the eaves
  const truss = (p0, p1, fix, ax) => { const n = ax === 'x' ? nx : ny; for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, z0 = ze - H * 0.2, z1 = ze - 6;
    const P = (t, z) => ax === 'x' ? [lerp(p0, p1, t), fix, z] : [fix, lerp(p0, p1, t), z]; bar(a, P(t0, z0), P(t1, z1), 9, 6); bar(a, P(t0, z1), P(t1, z0), 9, 6); } };
  for (const sy of [-1, 1]) truss(cx - px, cx + px, cy + sy * py, 'x'); for (const sx of [-1, 1]) truss(cy - py, cy + py, cx + sx * px, 'y');
  const ov = 50, vz = Z1 - H * 0.08;
  loftZ(a, [{ z: ze - 4, pts: [[cx - px - ov, cy - py - ov], [cx + px + ov, cy - py - ov], [cx + px + ov, cy + py + ov], [cx - px - ov, cy + py + ov]] },
    { z: ze + (vz - ze) * 0.5, pts: [[cx - px * 0.6, cy - py * 0.6], [cx + px * 0.6, cy - py * 0.6], [cx + px * 0.6, cy + py * 0.6], [cx - px * 0.6, cy + py * 0.6]] },
    { z: vz, pts: [[cx - px * 0.2, cy - py * 0.2], [cx + px * 0.2, cy - py * 0.2], [cx + px * 0.2, cy + py * 0.2], [cx - px * 0.2, cy + py * 0.2]] }]);
  loftZ(a, [{ z: vz, pts: [[cx - px * 0.28, cy - py * 0.28], [cx + px * 0.28, cy - py * 0.28], [cx + px * 0.28, cy + py * 0.28], [cx - px * 0.28, cy + py * 0.28]] }, { z: Z1, pts: [[cx - px * 0.1, cy - py * 0.1], [cx + px * 0.1, cy - py * 0.1], [cx + px * 0.1, cy + py * 0.1], [cx - px * 0.1, cy + py * 0.1]] }]);
  const vh = 150, vo = ov;
  a.box(cx - px - vo, cy - py - vo, ze - vh, cx + px + vo, cy - py - vo + 2.5, ze - 4); a.box(cx - px - vo, cy + py + vo - 2.5, ze - vh, cx + px + vo, cy + py + vo, ze - 4);
  a.box(cx - px - vo, cy - py - vo, ze - vh, cx - px - vo + 2.5, cy + py + vo, ze - 4); a.box(cx + px + vo - 2.5, cy - py - vo, ze - vh, cx + px + vo, cy + py + vo, ze - 4);
  a.rect(cx - px - ov, cy - py - ov, cx + px + ov, cy + py + ov, 'EQUIP-DETAIL'); a.rect(cx - px * 0.28, cy - py * 0.28, cx + px * 0.28, cy + py * 0.28, 'EQUIP-DETAIL');
  a.log('Added four telescoping legs with height collars and foot plates, eave rails, scissor trusses on every side, a pyramid canopy with a raised vent cap and a hanging valance on all four sides (plan and 3D).');
}

function bellTent(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, R = W * 0.37, wh = H * 0.3, rp = W * 0.48;
  a.outline();
  a.tube([[cx, cy, Z0], [cx, cy, Z0 + wh * 0.1]], [R * 1.02, R * 1.02], 28);                                     // sod cloth
  a.tube([[cx, cy, Z0 + wh * 0.1], [cx, cy, Z0 + wh], [cx, cy, Z0 + wh + (Z1 - Z0 - wh) * 0.5], [cx, cy, Z1 - H * 0.07]], [R, R, R * 0.55, R * 0.12], 28);
  a.cyl(cx, cy, Z1 - H * 0.07, Z1, R * 0.07, 10); a.ell(cx, cy, Z1, R * 0.08, R * 0.08, R * 0.05, 8, 4);
  const dw = R * 0.34; a.frame(cx - dw, Z0 + 4, cx + dw, Z0 + wh + (Z1 - Z0 - wh) * 0.2, cy - R - 6, cy - R + 8, 8);                           // door opening
  for (const s of [-1, 1]) { prismY(a, [[cx + s * dw * 0.95, Z0 + 4], [cx + s * dw * 1.9, Z0 + 4], [cx + s * dw * 1.5, Z0 + wh * 1.1], [cx + s * dw * 0.95, Z0 + wh * 1.25]], cy - R - 10, cy - R - 4); }
  for (let i = 0; i < 10; i++) {
    const g = (i * TAU) / 10 + TAU / 20, ca = m.cos(g), sa = m.sin(g), px = cx + rp * ca, py = cy + rp * sa;
    bar(a, [cx + R * 0.9 * ca, cy + R * 0.9 * sa, Z0 + wh * 1.0], [px, py, Z0 + 8], 2.2, 4); a.cyl(px, py, Z0, Z0 + 26, 4, 5); a.box(px - 7, py - 7, Z0 + 20, px + 7, py + 7, Z0 + 28);
  }
  a.circ(cx, cy, R, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.55, 'EQUIP-DETAIL'); a.circ(cx, cy, rp, 'EQUIP-HIDDEN');
  a.log(`Added the sod cloth, a round wall rising to a conical roof with a centre pole finial, a front door opening with two tied-back flaps and ten guy lines to pegs (box includes the pegs; tent ${v.dia} in across, plan and 3D).`);
}

function campCot(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, t = 22, ex = W / 2 - 26;
  a.outline();
  a.box(cx - ex - 4, YF + 12, Z1 - 24, cx + ex + 4, YB - 12, Z1 - 8);
  for (const s of [-1, 1]) bar(a, [cx + s * ex, YF + 8, Z1 - 24], [cx + s * ex, YB - 8, Z1 - 24], 13, 8);
  for (const y of [YF + 12, YB - 12]) bar(a, [cx - ex, y, Z1 - 24], [cx + ex, y, Z1 - 24], 13, 8);
  for (const y of [YF + D * 0.16, YB - D * 0.16]) {
    bar(a, [cx - ex, y, Z1 - 24], [cx + ex, y, Z0 + 14], 12, 7); bar(a, [cx + ex, y, Z1 - 24], [cx - ex, y, Z0 + 14], 12, 7); a.ycyl(y - 14, y + 14, cx, (Z1 + Z0) / 2 - 5, 9, 8);
    bar(a, [cx - ex - 20, y, Z0 + 12], [cx + ex + 20, y, Z0 + 12], 10, 6); for (const s of [-1, 1]) a.box(cx + s * (ex + 20) - 14, y - 22, Z0, cx + s * (ex + 20) + 14, y + 22, Z0 + 14);
  }
  for (const s of [-1, 1]) for (const y of [YF + D * 0.16, YB - D * 0.16]) a.box(cx + s * ex - 10, y - 10, Z1 - 40, cx + s * ex + 10, y + 10, Z1 - 24);
  a.rect(cx - ex - 4, YF + 12, cx + ex + 4, YB - 12, 'EQUIP-DETAIL'); a.line(cx - ex, YF + D * 0.16, cx + ex, YF + D * 0.16); a.line(cx - ex, YB - D * 0.16, cx + ex, YB - D * 0.16);
  a.log('Added the fabric bed on two side rails and two end bars, and two pairs of crossed legs on hinge bolts with foot rails and pads (plan and 3D).');
}

function campChair(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, sz = Z0 + H * 0.4, sx0 = W / 2 - 30;
  a.outline();
  for (const s of [-1, 1]) {
    const x = cx + s * sx0;
    bar(a, [x, YF + D * 0.18, sz], [x, YB - D * 0.34, Z0 + 14], 10, 6); bar(a, [x, YB - D * 0.34, sz], [x, YF + D * 0.18, Z0 + 14], 10, 6); a.xcyl(x - 8, x + 8, (YF + YB) / 2 - D * 0.08, (sz + Z0) / 2 + 7, 8, 7);
    bar(a, [x, YF + D * 0.18, sz], [x, YF + D * 0.18, Z0 + H * 0.62], 11, 7); bar(a, [x, YF + D * 0.18, Z0 + H * 0.62], [x, YB - D * 0.4, Z0 + H * 0.62], 11, 7);
    a.box(x - 22, YF + D * 0.1, Z0 + H * 0.62, x + 22, YF + D * 0.18 + 90, Z0 + H * 0.62 + 20);
    bar(a, [x, YB - D * 0.34, sz], [x, YB - D * 0.08, Z1 - 12], 11, 7);
    a.box(x - 24, YF + D * 0.12, Z0, x + 24, YF + D * 0.2, 6 + Z0); a.box(x - 24, YB - D * 0.4, Z0, x + 24, YB - D * 0.3, 6 + Z0);
  }
  a.box(cx - sx0 + 8, YF + D * 0.12, sz - 6, cx + sx0 - 8, YB - D * 0.34, sz + 6);
  const bx = YB - D * 0.34, tz = Z1 - 40; prismX(a, [[bx, sz + 8], [bx + 14, sz + 8], [YB - D * 0.08 + 14, tz], [YB - D * 0.08, tz]], cx - sx0 + 8, cx + sx0 - 8);
  a.box(cx - sx0 + 8, YB - D * 0.08 - 12, tz - 4, cx + sx0 - 8, YB - D * 0.08 + 12, Z1 - 8);
  ring(a, 'z', cx + sx0 - 40, YF + D * 0.3, Z0 + H * 0.62 + 20, Z0 + H * 0.62 + 90, 36, 44, 14); a.cyl(cx + sx0 - 40, YF + D * 0.3, Z0 + H * 0.62 + 20, Z0 + H * 0.62 + 24, 44, 14);
  a.rect(cx - sx0 + 8, YF + D * 0.12, cx + sx0 - 8, YB - D * 0.34, 'EQUIP-DETAIL'); a.circ(cx + sx0 - 40, YF + D * 0.3, 40, 'EQUIP-DETAIL');
  a.log('Added two crossed-leg side frames with a pivot bolt and foot pads, a sling seat, a tilted back sling with a head bar, two arms on front posts and a cup holder (plan and 3D).');
}

function campTable(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, fish = v.kind === 'fish', tz = fish ? Z1 - 255 : Z1 - 4, tt = fish ? 24 : 12, ex = W / 2 - W * 0.1;
  a.outline();
  const legX = (x) => { bar(a, [x, YF + 46, tz - tt], [x, YB - 46, Z0 + 12], 13, 7); bar(a, [x, YB - 46, tz - tt], [x, YF + 46, Z0 + 12], 13, 7); a.xcyl(x - 14, x + 14, cy, (tz - tt + Z0) / 2 + 6, 9, 7); bar(a, [x, YF + 46, Z0 + 12], [x, YB - 46, Z0 + 12], 10, 6); for (const y of [YF + 46, YB - 46]) a.box(x - 24, y - 24, Z0, x + 24, y + 24, Z0 + 12); };
  legX(cx - ex); legX(cx + ex); if (fish) legX(cx);
  if (!fish) {
    const nsl = m.floor((W - 60) / 32); for (let i = 0; i < nsl; i++) { const x0 = X0 + 30 + ((W - 60) * i) / nsl; a.box(x0, YF + 12, tz - tt, x0 + (W - 60) / nsl - 2.2, YB - 12, tz); a.box(x0, YF + 12, tz - tt - 8, x0 + (W - 60) / nsl - 2.2, YF + 24, tz - tt); }
    for (const y of [YF + 12, YB - 12]) a.box(X0 + 24, y - (y < cy ? 0 : 12), tz - tt - 14, X1 - 24, y + (y < cy ? 12 : 0), tz - tt); for (const x of [X0 + 24, X1 - 24]) a.box(x - 8, YF + 12, tz - tt - 14, x + 8, YB - 12, tz);
    a.rect(X0 + 24, YF + 12, X1 - 24, YB - 12, 'EQUIP-DETAIL');
    a.log('Added a top of long aluminium slats with end caps and two edge rails, and two crossed-leg frames with pivot bolts, foot rails and pads (plan and 3D).');
    return;
  }
  const sx0 = X0 + W * 0.26, sx1 = X0 + W * 0.5, sy0 = YF + D * 0.2, sy1 = YB - D * 0.2;
  a.box(X0, YF, tz - tt, sx0, YB, tz); a.box(sx1, YF, tz - tt, X1, YB, tz); a.box(sx0, YF, tz - tt, sx1, sy0, tz); a.box(sx0, sy1, tz - tt, sx1, YB, tz);
  a.box(sx0, sy0, tz - tt - 100, sx1, sy0 + 10, tz - 4); a.box(sx0, sy1 - 10, tz - tt - 100, sx1, sy1, tz - 4); a.box(sx0, sy0, tz - tt - 100, sx0 + 10, sy1, tz - 4); a.box(sx1 - 10, sy0, tz - tt - 100, sx1, sy1, tz - 4); a.box(sx0, sy0, tz - tt - 106, sx1, sy1, tz - tt - 96);
  const fxx = (sx0 + sx1) / 2; bar(a, [fxx, sy1 + 4, tz], [fxx, sy1 + 4, tz + 220], 8, 7); bar(a, [fxx, sy1 + 4, tz + 220], [fxx, sy1 - 60, tz + 250], 8, 7); a.cyl(fxx, sy1 - 60, tz + 210, tz + 250, 9, 7); a.cyl(fxx + 30, sy1 + 4, tz, tz + 36, 12, 8);
  a.box(X0 + 20, sy0 + 10, tz, sx0 - 30, sy1 - 10, tz + 6);                                                           // fillet board
  const nr = v.rods; for (let i = 0; i < nr; i++) { const x = X1 - 40 - i * 55; a.cyl(x, YF + 32, tz - tt - 4, tz + 130, 18, 8); a.cyl(x, YF + 32, tz + 130, tz + 134, 22, 8); a.circ(x, YF + 32, 18, 'EQUIP-DETAIL'); }
  if (v.bucket) { const bx = X1 - W * 0.14, by = cy + D * 0.1; a.cone(bx, by, Z0, Z0 + 270, 110, 135, 14); ring(a, 'z', bx, by, Z0 + 266, Z0 + 276, 118, 138, 14); bar(a, [fxx, sy0 + 20, tz - tt - 100], [bx - 100, by, Z0 + 250], 14, 7); }
  a.rect(sx0, sy0, sx1, sy1, 'EQUIP-DETAIL'); a.rect(X0 + 20, sy0 + 10, sx0 - 30, sy1 - 10, 'EQUIP-DETAIL');
  a.log(`Added a solid top with a deep rinse basin and drain, a swan-neck tap, a fillet board, ${nr} vertical rod holders, three crossed-leg frames${v.bucket ? ' and a waste bucket under the drain hose' : ''} (plan and 3D).`);
}

function cooler(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, wh = v.wheels, ry = wh ? YB - 95 : YB, fp = 14, lh = H * 0.2, bz0 = Z0 + (wh ? 40 : 18);
  a.outline();
  for (const [x, y] of [[X0 + 50, YF + 40], [X1 - 50, YF + 40], [X0 + 50, ry - 40], [X1 - 50, ry - 40]]) if (!wh || y < cy) a.box(x - 26, y - 20, Z0, x + 26, y + 20, bz0);
  const hz = Z1 - lh;
  a.box(X0 + 3, YF + 3, bz0, X1 - 3, ry - 3, hz); a.box(X0, YF, hz - H * 0.03, X1, ry, hz);
  a.box(X0, YF, hz, X1, ry, hz + lh * 0.3); a.box(X0 + 22, YF + 22, hz + lh * 0.3, X1 - 22, ry - 22, hz + lh);
  for (const s of [-1, 1]) { const x = s > 0 ? X1 : X0; bar(a, [x + -s * 12, cy - 70, hz + lh * 0.25], [x + s * 22 - s * 14, cy - 70, hz - H * 0.12], 8, 6); bar(a, [x + -s * 12, cy + 70, hz + lh * 0.25], [x + s * 22 - s * 14, cy + 70, hz - H * 0.12], 8, 6); bar(a, [x + s * 8 - s * 14, cy - 70, hz - H * 0.12], [x + s * 8 - s * 14, cy + 70, hz - H * 0.12], 8, 6); }
  for (const s of [-1, 1]) { a.box(cx + s * W * 0.28 - 30, YF - 8, hz - H * 0.08, cx + s * W * 0.28 + 30, YF, hz + lh * 0.1); a.box(cx + s * W * 0.28 - 22, YF - 12, hz - H * 0.04, cx + s * W * 0.28 + 22, YF - 6, hz + lh * 0.05); }
  a.xcyl(X1, X1 + 0.01, cy, bz0 + 40, 0.01, 3); a.ycyl(YF - 6, YF, X0 + W * 0.1, bz0 + 50, 14, 8);
  if (wh) {
    whl(a, X0 + 70, YB - 55, 55, 34, Z0 + 55); whl(a, X1 - 70, YB - 55, 55, 34, Z0 + 55);
    for (const s of [-1, 1]) bar(a, [cx + s * W * 0.3, ry - 10, hz + lh * 0.2], [cx + s * W * 0.3, YB - 8, Z1 - 6], 9, 6); bar(a, [cx - W * 0.3, YB - 8, Z1 - 6], [cx + W * 0.3, YB - 8, Z1 - 6], 11, 7);
    a.box(X0 + 20, ry, Z0 + 36, X1 - 20, ry + 20, Z0 + 56);
  }
  a.rect(X0 + 22, YF + 22, X1 - 22, ry - 22, 'EQUIP-DETAIL'); a.rect(X0, YF, X1, ry, 'EQUIP');
  a.log(`Added the insulated body on foot pads, an overhanging lid with a raised top, rope handles on both ends, two front latches, a drain plug${wh ? ', two wheels and a telescoping pull handle' : ''} (plan and 3D).`);
}

function hammockStand(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, py = D / 2 - 40, hz = Z0 + H * 0.78;
  a.outline();
  bar(a, [cx, cy - py, Z0 + 24], [cx, cy + py, Z0 + 24], 24, 8);
  for (const s of [-1, 1]) {
    const y = cy + s * py; bar(a, [cx - W * 0.46, y, Z0 + 18], [cx + W * 0.46, y, Z0 + 18], 22, 8); for (const x of [cx - W * 0.46, cx + W * 0.46]) a.box(x - 22, y - 30, Z0, x + 22, y + 30, 10);
    a.tube([[cx, y, Z0 + 24], [cx, y - s * 6, Z0 + H * 0.4], [cx, y - s * 20, Z0 + H * 0.68], [cx, y - s * 70, hz], [cx, y - s * 120, hz + H * 0.06]], [22, 20, 19, 18, 17], 9);
    a.ell(cx, y - s * 120, hz + H * 0.06 + 4, 30, 30, 18, 8, 5);
  }
  const y0 = cy - (py - 290), y1 = cy + (py - 290), n = 14, sag = H * 0.34, secs = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 2 * t - 1, zc = hz - 34 - sag * (1 - u * u), rx = W * 0.3 * prof([[0, 0.12], [0.12, 0.7], [0.5, 1], [0.88, 0.7], [1, 0.12]], t), rz = 26 * prof([[0, 0.3], [0.5, 1], [1, 0.3]], t); secs.push({ y: lerp(y0, y1, t), pts: ellPts(rx, rz, 12, cx, zc) }); }
  loftY(a, secs);
  for (const s of [-1, 1]) { const ye = s < 0 ? y0 : y1, yh = cy + s * (py - 120), yb = cy + s * (py - 120 - 170); bar(a, [cx, yh, hz + H * 0.06], [cx, yb, hz - 34], 3, 4); for (const dx of [-W * 0.15, W * 0.15]) bar(a, [cx, yh, hz + H * 0.06], [cx + dx, yb, hz - 38], 2.4, 4); void ye; }
  a.rect(cx - W * 0.3, y0, cx + W * 0.3, y1, 'EQUIP-DETAIL'); a.line(cx, cy - py, cx, cy + py);
  a.log('Added a central spine rail, two end cross feet with pads, two arched uprights ending in hooks and a hammock sagging between them on gathered end ropes (plan and 3D).');
}

function beehive(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2;
  a.outline();
  if (v.top) {
    const ly = H * 0.34, bw = W * 0.94, bx0 = cx - bw / 2, bx1 = cx + bw / 2, zb = Z0 + ly, zt = Z0 + ly + H * 0.36;
    for (const [x, y] of [[bx0 + 40, YF + 30], [bx1 - 40, YF + 30], [bx0 + 40, YB - 30], [bx1 - 40, YB - 30]]) { a.box(x - 22, y - 22, Z0, x + 22, y + 22, zb); a.circ(x, y, 22, 'EQUIP-HIDDEN'); }
    a.box(bx0 + 30, YF + 30, zb - 36, bx1 - 30, YB - 30, zb - 8);
    prismX(a, [[cy - D * 0.2, zb], [cy + D * 0.2, zb], [YB - D * 0.04, zt], [YF + D * 0.04, zt]], bx0, bx1);
    const nb = m.floor(bw / 36); for (let i = 0; i < nb; i++) { const x0 = bx0 + 6 + ((bw - 12) * i) / nb; a.box(x0, YF + D * 0.03, zt, x0 + (bw - 12) / nb - 1.5, YB - D * 0.03, zt + 8); }
    prismX(a, [[YF, zt + 8], [YB, zt + 8], [cy, Z1]], bx0 - 6, bx1 + 6);
    for (let i = 0; i < 3; i++) { a.ycyl(YF + D * 0.04 - 12, YF + D * 0.08, bx0 + bw * (0.12 + i * 0.07), zb + (zt - zb) * 0.35, 12, 8); } a.box(bx0 + bw * 0.08, YF + D * 0.06 - 8, zb + 20, bx0 + bw * 0.35, YF + D * 0.06 + 6, zb + 40);
    a.rect(bx0, YF + D * 0.04, bx1, YB - D * 0.04, 'EQUIP-DETAIL'); a.rect(bx0 - 6, YF, bx1 + 6, YB, 'EQUIP-DETAIL');
    a.log('Added four legs with a rail, a long hive body with sloped sides, top bars along the length, three entrance holes with a landing strip and a gabled roof (plan and 3D).');
    return;
  }
  const sz = H * 0.3, bt = 30, bw = W - 70, bd = D - 150, bx0 = cx - bw / 2, bx1 = cx + bw / 2, by0 = cy - bd / 2, by1 = cy + bd / 2;
  for (const [x, y] of [[bx0 + 30, by0 + 30], [bx1 - 30, by0 + 30], [bx0 + 30, by1 - 30], [bx1 - 30, by1 - 30]]) { a.box(x - 22, y - 22, Z0, x + 22, y + 22, Z0 + sz); a.circ(x, y, 22, 'EQUIP-HIDDEN'); }
  a.box(bx0 + 10, by0 + 10, Z0 + sz - 28, bx1 - 10, by1 - 10, Z0 + sz); a.box(bx0 + 10, by0 + 10, Z0 + sz - 28, bx1 - 10, by0 + 40, Z0 + sz);
  const bz0 = Z0 + sz; a.box(bx0 - 6, by0 - 4, bz0, bx1 + 6, by1 + 6, bz0 + bt);
  prismX(a, [[by0 - 70, bz0 - 6], [by0 - 4, bz0 + 22], [by0 - 4, bz0], [by0 - 70, bz0 - 6]], bx0 + W * 0.2, bx1 - W * 0.2);                                       // landing board
  a.box(bx0 + 40, by0, bz0 + bt, bx0 + 40 + bw * 0.45, by0 + 6, bz0 + bt + 14); a.box(bx0 + 40, by0 - 5, bz0 + bt - 4, bx0 + 40 + bw * 0.3, by0, bz0 + bt + 12);
  const bh = [244, 244, 146], n = v.boxes; let z = bz0 + bt;
  for (let k = 0; k < n; k++) {
    const h = v.supers && k === n - 1 ? 146 : 244; a.box(bx0, by0, z, bx1, by1, z + h);
    for (const s of [-1, 1]) a.box(s > 0 ? bx1 : bx0 - 7, cy - 70, z + h * 0.62, s > 0 ? bx1 + 7 : bx0, cy + 70, z + h * 0.62 + 24);
    a.box(bx0 - 3, by0 - 4, z + h - 8, bx1 + 3, by1 + 4, z + h); a.line(bx0, by0, bx1, by0, 'EQUIP-DETAIL'); z += h;
  }
  a.box(bx0 + 20, by0 + 20, z, bx1 - 20, by1 - 20, z + 22); a.cyl(cx, cy, z + 22, z + 30, 36, 12);
  const rt = Z1 - z - 22; a.box(X0, YF, z + 22, X1, YB, z + 22 + rt * 0.72); a.box(X0 + 40, YF + 40, z + 22 + rt * 0.72, X1 - 40, YB - 40, Z1);
  a.box(cx - 90, cy - 90, Z1, cx + 90, cy + 90, Z1 + 0.01);
  a.rect(bx0, by0, bx1, by1, 'EQUIP-DETAIL'); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-DETAIL'); void bh;
  a.log(`Added a four-legged stand, a bottom board with a landing board and entrance reducer, ${n} stacked hive box${n > 1 ? 'es' : ''} with handholds and rim ledges, an inner cover with a vent hole and a deep telescoping roof (plan and 3D).`);
}

function birdBath(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, br = W * 0.5, bz = Z1 - H * 0.2;
  a.outline();
  a.cyl(cx, cy, Z0, Z0 + H * 0.05, br * 0.42, 24); a.cone(cx, cy, Z0 + H * 0.05, Z0 + H * 0.09, br * 0.42, br * 0.3, 24);
  lathe(a, cx, cy, Z0 + H * 0.09, bz, [br * 0.2, br * 0.13, br * 0.1, br * 0.15, br * 0.1, br * 0.12, br * 0.2], 18);
  a.tube([[cx, cy, bz - H * 0.02], [cx, cy, bz + H * 0.04], [cx, cy, Z1 - H * 0.07]], [br * 0.3, br * 0.8, br], 28);
  ring(a, 'z', cx, cy, Z1 - H * 0.07, Z1, br * 0.86, br, 28); a.cyl(cx, cy, Z1 - H * 0.07, Z1 - H * 0.035, br * 0.88, 28);
  for (const g of [0.5, 2.0, 3.9]) a.ell(cx + br * 0.45 * m.cos(g), cy + br * 0.45 * m.sin(g), Z1 - H * 0.035, br * 0.1, br * 0.1, br * 0.05, 8, 4);
  a.circ(cx, cy, br, 'EQUIP-DETAIL'); a.circ(cx, cy, br * 0.2, 'EQUIP-DETAIL');
  a.log(`Added a round foot with a collar, a turned pedestal with two bulbs, a dished ${v.bowl} in bowl with a raised rim, a water surface and three pebbles (plan and 3D).`);
}

function birdFeeder(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, px = cx - W * 0.2, fx = cx + W * 0.2, hk = Z1 - H * 0.04, k = v.kind;
  a.outline();
  for (let i = 0; i < 4; i++) { const g = (i * TAU) / 4 + m.PI / 4, r = W * 0.22; bar(a, [px, cy, Z0 + 40], [px + r * m.cos(g) * 1.3, cy + r * m.sin(g) * 1.3, Z0 + 6], 9, 6); a.box(px + r * m.cos(g) * 1.3 - 14, cy + r * m.sin(g) * 1.3 - 14, Z0, px + r * m.cos(g) * 1.3 + 14, cy + r * m.sin(g) * 1.3 + 14, Z0 + 8); }
  a.cyl(px, cy, Z0 + 40, Z0 + 70, 18, 8); a.cyl(px, cy, Z0 + 30, hk - H * 0.05, 9, 8);
  a.tube([[px, cy, hk - H * 0.05], [px, cy, hk - H * 0.02], [px + (fx - px) * 0.35, cy, hk + 2], [px + (fx - px) * 0.8, cy, hk - H * 0.015], [fx, cy, hk - H * 0.05]], [9, 8, 8, 8, 8], 8);
  const top = hk - H * 0.07; bar(a, [fx, cy, top], [fx, cy, top + H * 0.025], 3, 4);
  if (k === 'tube') {
    const th = H * 0.2, tr = 34, z1 = top - 8, z0 = z1 - th; a.cone(fx, cy, z1 - 8, z1 + 2, tr * 1.3, tr * 0.5, 14); a.cyl(fx, cy, z0, z1 - 8, tr, 14); a.cyl(fx, cy, z0 - 12, z0, tr * 1.45, 14); ring(a, 'z', fx, cy, z0 - 18, z0 - 12, tr * 1.3, tr * 1.5, 14);
    for (let i = 0; i < 4; i++) { const zz = z0 + th * (0.15 + 0.2 * i), g = (i * m.PI) / 2 + 0.3 + (i % 2) * 0.8; a.ycyl(cy - tr * 1.0, cy - tr * 1.0 - 36 * m.cos(g * 0.2) , fx + tr * 0.6 * m.sin(g), zz, 3, 5); a.box(fx - 12, cy - tr - 8, zz - 6, fx + 12, cy - tr, zz + 6); }
    a.circ(fx, cy, tr * 1.45, 'EQUIP-DETAIL');
    a.log('Added the star foot with a collar, a hook pole with a curved crook, a hanging tube feeder with a cap, four feeding ports with perches and a seed tray (plan and 3D).');
  } else if (k === 'hopper') {
    const hw = W * 0.2, hd = D * 0.2, hh = H * 0.14, z0 = top - hh - 40;
    a.box(fx - hw / 2, cy - hd / 2, z0 + 20, fx + hw / 2, cy + hd / 2, z0 + 20 + hh); a.box(fx - hw * 0.62, cy - hd * 0.62, z0, fx + hw * 0.62, cy + hd * 0.62, z0 + 20);
    prismX(a, [[cy - hd * 0.7, z0 + 20 + hh], [cy + hd * 0.7, z0 + 20 + hh], [cy, top]], fx - hw * 0.62, fx + hw * 0.62);
    a.box(fx - hw * 0.62, cy - hd * 0.62, z0 - 6, fx + hw * 0.62, cy - hd * 0.62 + 6, z0 + 24);
    for (const s of [-1, 1]) a.box(fx + s * hw * 0.62 - 3, cy - hd * 0.62, z0, fx + s * hw * 0.62 + 3, cy + hd * 0.62, z0 + 36);
    a.rect(fx - hw * 0.62, cy - hd * 0.62, fx + hw * 0.62, cy + hd * 0.62, 'EQUIP-DETAIL');
    a.log('Added the star foot with a collar, a hook pole with a curved crook, a hanging hopper with a gabled roof, a seed tray with a lip and a rail and side perches (plan and 3D).');
  } else {
    const hw = W * 0.26, z0 = top - H * 0.16;
    a.box(fx - hw / 2, cy - hw / 2, z0, fx + hw / 2, cy + hw / 2, z0 + 14); for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { a.box(fx + sx * hw / 2 - 5, cy + sy * hw / 2 - 5, z0 + 14, fx + sx * hw / 2 + 5, cy + sy * hw / 2 + 12, z0 + 14 + 10); }
    for (const s of [-1, 1]) { a.box(fx - hw / 2, cy + s * hw / 2 - 3, z0 + 14, fx + hw / 2, cy + s * hw / 2 + 3, z0 + 34); a.box(fx + s * hw / 2 - 3, cy - hw / 2, z0 + 14, fx + s * hw / 2 + 3, cy + hw / 2, z0 + 34); }
    for (const [sx, sy] of [[-1, -1], [1, 1]]) bar(a, [fx + sx * hw * 0.4, cy + sy * hw * 0.4, z0 + 14], [fx + sx * hw * 0.4, cy + sy * hw * 0.4, top - 30], 4, 5);
    prismX(a, [[cy - hw * 0.62, top - 30], [cy + hw * 0.62, top - 30], [cy, top]], fx - hw * 0.62, fx + hw * 0.62); a.rect(fx - hw / 2, cy - hw / 2, fx + hw / 2, cy + hw / 2, 'EQUIP-DETAIL');
    a.log('Added the star foot with a collar, a hook pole with a curved crook, and a hanging platform tray with a low rim and corner drain holes under a small gabled roof on two posts (plan and 3D).');
  }
}

function metalDetector(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cr = v.coil * IN / 2, cy0 = YF + cr + 20, lean = D - cr * 2 - 70, ct = 30;
  a.outline();
  ring(a, 'z', cx, cy0, Z0, Z0 + ct * 0.5, 0, cr, 28); a.ell(cx, cy0, Z0 + ct * 0.5, cr * 0.97, cr * 0.97, ct * 0.5, 28, 5);                    // search coil: skirt and dome
  ring(a, 'z', cx, cy0, Z0 + ct * 0.5, Z0 + ct, cr * 0.72, cr * 0.8, 28); a.cyl(cx, cy0, Z0 + ct, Z0 + ct + 18, cr * 0.1, 10);
  const s0 = [cx, cy0 + cr * 0.15, Z0 + ct + 12], s1 = [cx, cy0 + cr * 0.15 + lean * 0.5, Z0 + H * 0.52], s2 = [cx, cy0 + cr * 0.15 + lean, Z1 - H * 0.12];
  bar(a, s0, s1, 11, 8); bar(a, s1, s2, 9, 8); a.tube([[cx, s1[1] - 2, s1[2] - 20], [cx, s1[1] + 2, s1[2] + 20]], [15, 15], 8);
  a.box(cx - 16, s0[1] - 14, s0[2] - 8, cx + 16, s0[1] + 14, s0[2] + 14);
  const bx = s2[1];
  a.box(cx - 40, bx - 70, s2[2], cx + 40, bx + 50, Z1);                                                          // control housing
  a.box(cx - 30, bx - 76, Z1 - 64, cx + 30, bx - 70, Z1 - 18); for (const s of [-1, 1]) a.ycyl(bx - 86, bx - 70, cx + s * 22, Z1 - 80 > s2[2] ? s2[2] + 18 : s2[2] + 10, 8, 8);
  bar(a, [cx, bx - 70, s2[2] + 16], [cx, bx - 170, s2[2] - 10], 11, 7); bar(a, [cx, bx - 170, s2[2] - 10], [cx, bx - 190, s2[2] - 120], 11, 7);     // handle grip
  ring(a, 'x', bx - 60, s2[2] - 100, cx - 28, cx + 28, 56, 66, 14);                                                                                // armrest cuff
  a.tube([[cx + 14, s0[1] + 12, s0[2] + 6], [cx + 14, s1[1], s1[2] - 40], [cx + 14, s2[1] - 10, s2[2] + 10]], [2.5, 2.5, 2.5], 4);
  a.circ(cx, cy0, cr, 'EQUIP-DETAIL'); a.circ(cx, cy0, cr * 0.75, 'EQUIP-DETAIL'); a.line(cx, cy0 + cr * 0.15, cx, bx, 'EQUIP-DETAIL');
  a.log(`Added the ${v.coil} in search coil with a skirt and dome standing on the floor, a lean lower shaft with a cam lock collar and an upper shaft, a control housing with display and two knobs, a handle grip, an armrest cuff and a cable (plan and 3D).`);
}

// ------------------------------------------------------------------------------------------ families
const rows = (list) => list.map(([l, w, d, h, p = {}]) => [l, w, d, h, 0, p]);
/** long objects drawn lengthwise on x: the rows below give beam first, length second */
const rowsX = (list) => list.map(([l, w, d, h, p = {}]) => [l, d, w, h, 0, p]);
const FAMS = [
  // ---------------------------------------------------------------- craft
  fam({ cat: 'hobby/craft', title: 'Generic spinning wheel',
    desc: (v) => `${v.style === 'castle' ? 'Castle-style' : 'Saxony-style'} spinning wheel with a ${v.wd} in ten-spoke main wheel and crank, ${v.style === 'castle' ? 'a low base and a flyer carried on a frame above the wheel' : 'a table on splayed legs and two maidens carrying the flyer'}, a bobbin, a pulley whorl and a treadle with footman rod.`,
    vs: rows([['saxony, 18 in wheel', 36, 20, 36, { wd: 18, style: 'saxony' }], ['saxony, 24 in wheel', 44, 24, 42, { wd: 24, style: 'saxony' }], ['castle, 12 in wheel', 30, 18, 36, { wd: 12, style: 'castle' }], ['castle, 18 in wheel', 38, 22, 40, { wd: 18, style: 'castle' }]]),
    build: spinWheel }),
  fam({ cat: 'hobby/craft', title: 'Generic tilting drafting table',
    desc: (v) => `Drawing table with a ${v.tilt} degree tilting board, a pencil ledge and a parallel rule bar, ${v.top ? 'on four feet with a rear prop strut' : 'on two end frames with tilt knobs, a lower shelf and a back rail'}.`,
    vs: rows([['A2 board, 36 in wide', 36, 26, 44, { tilt: 12 }], ['A1 board, 48 in wide', 48, 32, 45, { tilt: 15 }], ['A0 board, 60 in wide', 60, 38, 46, { tilt: 15 }], ['tabletop board, 28 in wide', 28, 22, 14, { tilt: 20, top: true }]]),
    build: draftTable }),
  fam({ cat: 'hobby/craft', title: 'Generic pottery kiln',
    desc: (v) => v.front ? 'Front-loading electric kiln: steel legs and stand frame, an insulated chamber jacket with bands, a front door with frame, two hinges and a pull handle, and a control panel with a dial.' : 'Top-loading electric kiln: eight-sided steel jacket with three bands and peephole plugs on four legs, a hinged lid with a bar handle and a side control box with two dials.',
    vs: rows([['top loading, 18 in chamber', 23, 23, 38, {}], ['top loading, 27 in chamber', 32, 32, 44, {}], ['front loading, 2 ft cube', 30, 28, 40, { front: true }], ['front loading, 3 ft cube', 40, 34, 52, { front: true }]]),
    build: kiln }),
  fam({ cat: 'hobby/craft', title: 'Generic etching press',
    desc: (v) => `Printmaking press with a flat bed running between a top and a bottom roller, two heavy cheeks with a crossbar, a six-spoke star wheel with handle knobs and ${v.stand ? 'a leg stand with a lower shelf' : 'four low feet for a bench'}.`,
    vs: rows([['bench model, 24 in bed', 36, 18, 22, { kind: 'etch' }], ['floor model, 30 in bed', 44, 22, 38, { kind: 'etch', stand: true }], ['floor model, 36 in bed', 52, 24, 40, { kind: 'etch', stand: true }]]),
    build: rollerPress }),
  fam({ cat: 'hobby/craft', title: 'Generic clay slab roller',
    desc: (v) => `Slab roller with a bed carrying a canvas and side guides, one large roller between two cheeks, a four-spoke hand wheel with a crank knob and ${v.stand ? 'a leg stand with a lower shelf' : 'four low feet for a bench'}.`,
    vs: rows([['bench model, 18 in bed', 30, 22, 20, { kind: 'slab' }], ['floor model, 24 in bed', 40, 26, 34, { kind: 'slab', stand: true }], ['floor model, 30 in bed', 46, 32, 36, { kind: 'slab', stand: true }]]),
    build: rollerPress }),
  fam({ cat: 'hobby/craft', title: 'Generic bookbinding press',
    desc: (v) => v.screws === 1 ? 'Standing book press with a base, a lower platen with a book block, an upper platen, two cheeks and a crown beam, a central screw with a collar and a tommy bar with ball ends.' : 'Finishing book press with a base, a lower platen with a book block, an upper platen riding on two screws with wheel nuts and cross handles.',
    vs: rows([['bench, two-screw, 12 in platen', 15, 9, 12, { screws: 2 }], ['bench, two-screw, 20 in platen', 24, 12, 14, { screws: 2 }], ['standing, single-screw, 14 in platen', 20, 14, 30, { screws: 1 }]]),
    build: bookPress }),
  fam({ cat: 'hobby/craft', title: 'Generic tailor\'s dress form',
    desc: (v) => `Adjustable dress form torso lofted from hip to shoulder (hips ${v.hip * 2} in across) with a neck cap, a column with a collar knob and a three-leg stand with ball feet.`,
    vs: rows([['size 4', 22, 22, 62, { hip: 6.6, bust: 6.4 }], ['size 8', 22, 22, 63, { hip: 7, bust: 6.9 }], ['size 12', 23, 23, 64, { hip: 7.6, bust: 7.5 }], ['size 16', 24, 24, 65, { hip: 8.4, bust: 8.3 }]]),
    build: dressForm }),
  fam({ cat: 'hobby/craft', title: 'Generic fabric cutting table',
    desc: (v) => `Standing cutting table with a thick top carrying a cutting mat and a long ruler, two end panels and ${v.cols} open cube bays split by a mid shelf, with fabric bins in alternate bays.`,
    vs: rows([['36 in, 2 bays', 36, 24, 36, { kind: 'cut', cols: 2 }], ['48 in, 3 bays', 48, 24, 36, { kind: 'cut', cols: 3 }], ['60 in, 4 bays', 60, 30, 36, { kind: 'cut', cols: 4 }], ['72 in, 5 bays', 72, 36, 36, { kind: 'cut', cols: 5 }]]),
    build: craftTable }),
  fam({ cat: 'hobby/craft', title: 'Generic sewing machine table',
    desc: (v) => `Sewing table with a machine well holding a drop-in machine, tapered legs with an apron, a drawer with a knob, a lower shelf and a drop leaf ${v.leaf ? 'lifted on a swing bracket' : 'hanging down at the right'}.`,
    vs: rows([['compact, 30 in, leaf down', 30, 18, 36, { kind: 'sew', leaf: false }], ['standard, 36 in, leaf down', 36, 20, 36, { kind: 'sew', leaf: false }], ['standard, 48 in, leaf up', 48, 20, 36, { kind: 'sew', leaf: true }], ['wide, 54 in, leaf up', 54, 22, 37, { kind: 'sew', leaf: true }]]),
    build: craftTable }),
  fam({ cat: 'hobby/craft', title: 'Generic embroidery hoop stand',
    desc: (v) => v.rect ? 'Scroll frame stand with two footed posts and height clamps, a rectangular frame with two cloth rollers and a stretched cloth panel.' : `${v.hoop} in two-ring hoop with a stretched cloth and tightening screw on ${v.table ? 'a clamp-down desk base' : 'a floor stand with a three-leg foot and collar'}, joined by a swivel stem.`,
    vs: rows([['tabletop hoop, 10 in', 14, 10, 20, { hoop: 10, table: true }], ['floor stand hoop, 16 in', 24, 24, 42, { hoop: 16 }], ['floor stand hoop, 22 in', 28, 28, 46, { hoop: 22 }], ['scroll frame, 24 in', 34, 20, 40, { rect: true }]]),
    build: hoopStand }),

  // ---------------------------------------------------------------- models
  fam({ cat: 'hobby/models', title: 'Generic model passenger rail vehicle',
    desc: (v) => `${v.scale} model ${v.kind === 'coach' ? 'passenger coach' : v.kind === 'tram' ? 'tram car' : 'diesel railcar'} on two bogies with ${v.win} windows a side and an arched roof, ${v.kind === 'tram' ? 'a windscreen end with lamps, a fender and a roof pantograph' : v.kind === 'dmu' ? 'a cab end with a windscreen, lamps and a buffer beam and roof vents' : 'an end door with gangway frame, a buffer beam and roof vents'}.`,
    vs: rowsX([['coach, HO scale', 1.4, 11.7, 2.0, { kind: 'coach', win: 8, scale: 'HO scale' }], ['coach, N scale', 0.8, 6.5, 1.1, { kind: 'coach', win: 8, scale: 'N scale' }], ['coach, O scale', 2.6, 21.5, 3.8, { kind: 'coach', win: 8, scale: 'O scale' }], ['tram, HO scale', 1.3, 6.4, 2.4, { kind: 'tram', win: 5, scale: 'HO scale' }], ['tram, O scale', 2.5, 12.5, 4.6, { kind: 'tram', win: 5, scale: 'O scale' }], ['railcar, HO scale', 1.35, 8.5, 1.9, { kind: 'dmu', win: 6, scale: 'HO scale' }]]),
    build: alongX(railVehicle) }),
  fam({ cat: 'hobby/models', title: 'Generic model railway building',
    desc: (v) => `${v.scale} ${{ cottage: 'cottage with a gabled roof, chimney, framed door and windows and garden fences', station: 'station with a platform, a gabled building, a name board, a clock and a canopy on posts', factory: 'factory with a sawtooth roof, a chimney stack, a large door, windows and a loading dock', signal: 'signal box with a brick lower storey, a glazed upper storey, a hipped roof and an external stair' }[v.kind]} on a base plate.`,
    vs: rows([['cottage, HO scale', 4.2, 3.6, 3.4, { kind: 'cottage', scale: 'HO scale' }], ['cottage, O scale', 7.5, 6.5, 6.2, { kind: 'cottage', scale: 'O scale' }], ['station, HO scale', 11, 4, 3, { kind: 'station', scale: 'HO scale' }], ['factory, HO scale', 7, 5, 4.2, { kind: 'factory', scale: 'HO scale' }], ['signal box, O scale', 4.5, 5, 6.6, { kind: 'signal', scale: 'O scale' }]]),
    build: railBuilding }),
  fam({ cat: 'hobby/models', title: 'Generic model scenery landmark',
    desc: (v) => ({ lighthouse: `${v.scale} lighthouse with a tapered banded tower, a gallery with a rail ring, a glazed lantern room with a conical roof and a keeper's cottage on a round base.`, windmill: `${v.scale} tower windmill with an eight-sided tapered tower, a door frame, a domed cap, a hub and four framed sails on a round base.`, water: `${v.scale} water tower with four braced legs, a round tank with a conical roof and a down pipe on a round base.` }[v.kind]),
    vs: rows([['lighthouse, HO scale', 4, 4, 9, { kind: 'lighthouse', scale: 'HO scale' }], ['windmill, HO scale', 5, 5, 8, { kind: 'windmill', scale: 'HO scale' }], ['water tower, O scale', 8, 8, 14, { kind: 'water', scale: 'O scale' }]]),
    build: landmark }),
  fam({ cat: 'hobby/models', title: 'Generic radio-control model helicopter',
    desc: 'Model helicopter with a fuselage pod and canopy, a tail boom with fin, stabiliser and tail rotor, a mast with hub, two main blades and a flybar, and two skids on struts.',
    vs: rowsX([['mini, 12 in rotor', 12, 11.5, 4.2, {}], ['450 class, 28 in rotor', 28, 26, 8.5, {}], ['600 class, 52 in rotor', 52, 48, 15.5, {}]]),
    build: alongX(modelHeli) }),
  fam({ cat: 'hobby/models', title: 'Generic model pond yacht',
    desc: 'Pond yacht on a base board with two cradle blocks: a lofted hull with a fin keel and ballast bulb, a mast, boom, mainsail and jib, a cockpit hatch and a tiller.',
    vs: rowsX([['24 in hull', 9, 26, 36, { kind: 'yacht' }], ['36 in hull', 12, 38, 52, { kind: 'yacht' }], ['48 in hull', 14, 50, 68, { kind: 'yacht' }]]),
    build: alongX(modelBoat) }),
  fam({ cat: 'hobby/models', title: 'Generic model harbour tug',
    desc: 'Harbour tug on a base board with two cradle blocks: a lofted blunt-bowed hull, a two-tier deckhouse with a roof, a funnel with a cap, a mast with a yard, bow fenders, a towing bitt and a stern rail.',
    vs: rowsX([['18 in hull', 6, 19, 11, { kind: 'tug' }], ['30 in hull', 9, 31, 18, { kind: 'tug' }], ['44 in hull', 13, 45, 25, { kind: 'tug' }]]),
    build: alongX(modelBoat) }),
  fam({ cat: 'hobby/models', title: 'Generic scale model sedan',
    desc: (v) => `${v.scale} scale model sedan: lower body with bumpers, a cabin with glazing bars, mirrors, lamps and a grille, and four wheels with tyres and hubs.`,
    vs: rowsX([['1:43 scale', 1.7, 4.2, 1.35, { kind: 'car', scale: '1:43' }], ['1:24 scale', 3, 7.5, 2.4, { kind: 'car', scale: '1:24' }], ['1:18 scale', 4, 10, 3.2, { kind: 'car', scale: '1:18' }], ['1:12 scale', 6, 15, 4.8, { kind: 'car', scale: '1:12' }]]),
    build: alongX(roadModel) }),
  fam({ cat: 'hobby/models', title: 'Generic scale model dump truck',
    desc: (v) => `${v.scale} scale model rigid dump truck: two chassis rails, a front bumper, hood and cab with a windscreen frame and lamps, a dump body tipped on its rear hinge with a hoist ram, and three axles with tyres and hubs.`,
    vs: rowsX([['1:50 scale', 1.9, 7.5, 3.6, { kind: 'dump', scale: '1:50' }], ['1:32 scale', 3, 11.5, 5.6, { kind: 'dump', scale: '1:32' }], ['1:25 scale', 3.8, 14.5, 7, { kind: 'dump', scale: '1:25' }]]),
    build: alongX(roadModel) }),
  fam({ cat: 'hobby/models', title: 'Generic hobby rocket on launch pad',
    desc: (v) => `Hobby rocket on a round pad with a rod and blast deflector: ${v.dia} in body tube with an engine ring, a tapered nose cone, ${v.fins} fins${v.stages === 2 ? ' on each of two stages joined by a coupler' : ''} and a launch lug.`,
    vs: rows([['mini, 0.7 in body', 5, 5, 14, { dia: 0.7, fins: 3, stages: 1 }], ['1.6 in body, four fins', 8, 8, 30, { dia: 1.6, fins: 4, stages: 1 }], ['2.6 in body, three fins', 12, 12, 46, { dia: 2.6, fins: 3, stages: 1 }], ['two-stage, 1.6 in body', 8, 8, 44, { dia: 1.6, fins: 4, stages: 2 }]]),
    build: modelRocket }),
  fam({ cat: 'hobby/models', title: 'Generic hobby paint rack',
    desc: (v) => v.kind === 'carousel' ? `Turntable paint rack with a base disc, a central spindle, ${v.tiers} tiers with rim lips, capped paint pots around each tier and a knob on top.` : v.kind === 'steps' ? `Stepped desktop paint rack with ${v.rows} tiers, each with a front lip and a row of capped paint pots, and a back panel.` : `Wall paint rack with a back board and ${v.rows} shelves, each with a front lip and two ranks of capped paint pots.`,
    vs: rows([['stepped desktop rack, 3 tiers', 12, 8, 6, { kind: 'steps', rows: 3 }], ['wall rack, 4 shelves', 24, 4.5, 24, { kind: 'wall', rows: 4 }], ['turntable, 2 tiers', 12, 12, 9, { kind: 'carousel', tiers: 2 }]]),
    build: paintRack }),

  // ---------------------------------------------------------------- collecting
  fam({ cat: 'hobby/collecting', title: 'Generic medal shadow box',
    desc: (v) => `Deep display frame on a base tray with a front bezel, a lined back panel, ${v.n} ribbon and medal pairs in rows and a name plate.`,
    vs: rows([['10 x 12 in, 3 medals', 10, 3, 12, { n: 3 }], ['12 x 16 in, 6 medals', 12, 3, 16, { n: 6 }], ['16 x 20 in, 9 medals', 16, 3.5, 20, { n: 9 }]]),
    build: medalFrame }),
  fam({ cat: 'hobby/collecting', title: 'Generic stacking barrister bookcase',
    desc: (v) => `Bookcase of ${v.stack} stacked sections on a plinth under a cornice, each with side panels, a back, a mid shelf with rows of books and a lifting glazed door frame with a knob and slide tracks.`,
    vs: rows([['stack of 3', 34, 11, 43, { stack: 3 }], ['stack of 4', 34, 11, 54, { stack: 4 }], ['stack of 5', 34, 11, 65, { stack: 5 }]]),
    build: barrister }),
  fam({ cat: 'hobby/collecting', title: 'Generic map and plan chest',
    desc: (v) => `Wide shallow-drawer chest with ${v.rows} drawers, each with a bar pull and a label card holder, an overhanging top and ${v.stand ? 'a stand with tapered legs and a stretcher' : 'a low base'}.`,
    vs: rows([['5 drawers on stand, 42 in', 42, 30, 36, { rows: 5, stand: 20 }], ['8 drawers on stand, 42 in', 42, 30, 40, { rows: 8, stand: 14 }], ['10 drawers on low base, 46 in', 46, 34, 42, { rows: 10, stand: 0 }]]),
    build: planChest }),
  fam({ cat: 'hobby/collecting', title: 'Generic watch winder case',
    desc: (v) => `Watch winder case with a tray base and low front wall, ${v.cols * v.rows} winder cells split by dividers with a cushion drum and watch head in each, and a back lid opened upright with a frame and panel.`,
    vs: rows([['4 winders', 8.5, 8, 9, { cols: 2, rows: 2 }], ['8 winders', 15.5, 8, 9, { cols: 4, rows: 2 }], ['12 winders', 15.5, 11.5, 9, { cols: 4, rows: 3 }]]),
    build: watchWinder }),
  fam({ cat: 'hobby/collecting', title: 'Generic wine bottle storage rack',
    desc: (v) => `Rack of ${v.cols + 1} uprights and ${v.rows + 1} shelves forming ${v.cols * v.rows} cells${v.feet ? ' on two feet' : ''}, with a bottle lying in each cell: body, shoulder, neck and lip.`,
    vs: rows([['wall grid, 12 bottles', 15.5, 12, 20.4, { cols: 3, rows: 4 }], ['floor, 24 bottles', 20.4, 12, 33.1, { cols: 4, rows: 6, feet: true }], ['floor, 36 bottles', 30.3, 12, 33.1, { cols: 6, rows: 6, feet: true }], ['floor, 48 bottles', 30.3, 12, 43, { cols: 6, rows: 8, feet: true }], ['countertop cube, 9 bottles', 15.5, 12, 15.5, { cols: 3, rows: 3 }]]),
    build: wineRack }),
  fam({ cat: 'hobby/collecting', title: 'Generic stepped display riser',
    desc: (v) => `Display riser with ${v.steps} stepped tiers, a raised front lip on each and ${v.items} turned figurines (cone body and round head) standing on every step.`,
    vs: rows([['3 steps, 16 in', 16, 9, 7, { steps: 3, items: 3 }], ['4 steps, 24 in', 24, 12, 10, { steps: 4, items: 4 }], ['5 steps, 30 in', 30, 15, 13, { steps: 5, items: 5 }]]),
    build: riser }),
  fam({ cat: 'hobby/collecting', title: 'Generic sports ball display cube',
    desc: (v) => `Display cube with a plinth and name plate, an acrylic cover drawn as twelve edge bars and a top plate, and a ${v.ball} in ball with seams on a ring cup.`,
    vs: rows([['baseball, 4.5 in', 4.5, 4.5, 5.5, { ball: 2.9 }], ['soccer ball, 11 in', 11, 11, 12.5, { ball: 8.7 }], ['basketball, 12 in', 12, 12, 13.5, { ball: 9.4 }]]),
    build: ballCube }),
  fam({ cat: 'hobby/collecting', title: 'Generic specimen drawer cabinet',
    desc: (v) => `Cabinet for a collection, on a plinth with an overhanging top and ${v.rows * v.cols} shallow drawers in ${v.cols} column${v.cols > 1 ? 's' : ''}, each with a glazed frame, a brass knob and a label slot.`,
    vs: rows([['12 drawers, 20 in wide', 20, 22, 44, { rows: 12, cols: 1 }], ['20 drawers, 20 in wide', 20, 22, 60, { rows: 20, cols: 1 }], ['24 drawers, two columns, 36 in', 36, 22, 46, { rows: 12, cols: 2 }]]),
    build: specimenCabinet }),
  fam({ cat: 'hobby/collecting', title: 'Generic comic long box rack',
    desc: (v) => `Floor rack on a plinth with ${v.rows + 1} shelves and ${v.cols + 1} uprights making ${v.cols * v.rows} cells, each holding a long storage box with a lid ridge, a label tab and a finger hole.`,
    vs: rows([['tower, 1 x 3 boxes', 9.5, 17.5, 46, { cols: 1, rows: 3 }], ['2 x 3 boxes', 18.5, 17.5, 46, { cols: 2, rows: 3 }], ['low, 3 x 2 boxes', 27.5, 17.5, 32.5, { cols: 3, rows: 2 }]]),
    build: comicRack }),
  fam({ cat: 'hobby/collecting', title: 'Generic miniature room box',
    desc: (v) => `One-twelfth scale room box on a base board with three walls, ${v.storeys > 1 ? 'two storeys split by a floor slab, ' : ''}a framed window with glazing bars, skirting and a dado rail, a fireplace with a mantel, a table, a chair and a rug.`,
    vs: rows([['one room, 12 in wide', 12, 10, 11, { storeys: 1 }], ['wide room, 20 in wide', 20, 12, 12, { storeys: 1 }], ['two storeys, 14 in wide', 14, 10, 22, { storeys: 2 }]]),
    build: roomBox }),
  fam({ cat: 'hobby/collecting', title: 'Generic scale car display case',
    desc: (v) => `${v.scale} car display case: a plinth with a name plate and road stripe, an acrylic cover drawn as twelve edge bars and a top plate, and a scale car inside with body, cabin, lamps and four wheels.`,
    vs: rowsX([['1:43 car', 3.3, 6.1, 3.4, { cl: 4.1, cw: 1.65, ch: 1.3, scale: '1:43' }], ['1:24 car', 4.6, 9.5, 4.4, { cl: 7.5, cw: 3, ch: 2.4, scale: '1:24' }], ['1:18 car', 5.9, 12.2, 5.3, { cl: 9.8, cw: 3.9, ch: 3.1, scale: '1:18' }]]),
    build: alongX(carCase) }),
  fam({ cat: 'hobby/collecting', title: 'Generic cased disc media tower',
    desc: (v) => `Tower with a base, two sides, a back and a top, ${v.shelves} shelves with front lips and a row of slim cased discs with spine labels on each.`,
    vs: rows([['5 shelves, 12 in wide', 12, 7, 44, { shelves: 5 }], ['8 shelves, 12 in wide', 12, 7, 68, { shelves: 8 }], ['6 shelves, 24 in wide', 24, 7, 52, { shelves: 6 }]]),
    build: mediaTower }),

  // ---------------------------------------------------------------- outdoor
  fam({ cat: 'hobby/outdoor', title: 'Generic pop-up canopy',
    desc: 'Folding event canopy with four telescoping legs with height collars and foot plates, eave rails, scissor trusses on every side, a pyramid canopy with a raised vent cap and a hanging valance on all four sides.',
    vs: rows([['10 x 10 ft', 120, 120, 126, {}], ['10 x 15 ft', 180, 120, 126, {}], ['13 x 13 ft', 156, 156, 132, {}], ['10 x 20 ft', 240, 120, 132, {}]]),
    build: gazebo }),
  fam({ cat: 'hobby/outdoor', title: 'Generic canvas bell tent',
    desc: (v) => `Round tent ${v.dia} in across with a sod cloth, a round wall rising to a conical roof with a centre pole finial, a front door opening with two tied-back flaps and ten guy lines to pegs (the box includes the pegs).`,
    vs: rows([['3 m, with guy lines', 160, 160, 100, { dia: 118 }], ['4 m, with guy lines', 212, 212, 118, { dia: 157 }], ['5 m, with guy lines', 266, 266, 134, { dia: 197 }]]),
    build: bellTent }),
  fam({ cat: 'hobby/outdoor', title: 'Generic folding camp cot',
    desc: 'Camp cot with a fabric bed on two side rails and two end bars, and two pairs of crossed legs on hinge bolts with foot rails and pads.',
    vs: rows([['standard, 26 x 76 in', 26, 76, 17, {}], ['wide, 32 x 76 in', 32, 76, 18, {}], ['compact, 24 x 70 in', 24, 70, 12.5, {}]]),
    build: campCot }),
  fam({ cat: 'hobby/outdoor', title: 'Generic folding camp chair',
    desc: 'Camp chair with two crossed-leg side frames on pivot bolts and foot pads, a sling seat, a tilted back sling with a head bar, two arms on front posts and a cup holder.',
    vs: rowsX([['standard, 23 in wide', 23, 22, 36, {}], ['oversize, 29 in wide', 29, 25, 40, {}], ['low beach, 21 in wide', 21, 24, 30, {}]]),
    build: alongX(campChair) }),
  fam({ cat: 'hobby/outdoor', title: 'Generic roll-top camp table',
    desc: 'Folding camp table with a top of long aluminium slats with end caps and two edge rails, and two crossed-leg frames with pivot bolts, foot rails and pads.',
    vs: rows([['24 x 48 in, 28 in high', 48, 24, 28, { kind: 'roll' }], ['28 x 56 in, 28 in high', 56, 28, 28, { kind: 'roll' }], ['24 x 36 in, 16 in high', 36, 24, 16, { kind: 'roll' }]]),
    build: campTable }),
  fam({ cat: 'hobby/outdoor', title: 'Generic folding fish cleaning table',
    desc: (v) => `Fish table with a solid top, a deep rinse basin and drain, a swan-neck tap, a fillet board, ${v.rods} vertical rod holders and three crossed-leg frames${v.bucket ? ', with a waste bucket under the drain hose' : ''}.`,
    vs: rows([['48 in, one rod holder', 48, 24, 44, { kind: 'fish', rods: 1 }], ['60 in, two rod holders', 60, 26, 44, { kind: 'fish', rods: 2 }], ['72 in, two rod holders and bucket', 72, 28, 46, { kind: 'fish', rods: 2, bucket: true }]]),
    build: campTable }),
  fam({ cat: 'hobby/outdoor', title: 'Generic insulated cooler box',
    desc: (v) => `Insulated cooler with the body on foot pads, an overhanging lid with a raised top, rope handles on both ends, two front latches and a drain plug${v.wheels ? ', two wheels and a telescoping pull handle' : ''}.`,
    vs: rows([['30 quart, 22 in', 22, 14, 15, { wheels: false }], ['50 quart, 28 in', 28, 16, 17, { wheels: false }], ['75 quart wheeled, 34 in', 34, 20, 24, { wheels: true }]]),
    build: cooler }),
  fam({ cat: 'hobby/outdoor', title: 'Generic hammock stand',
    desc: 'Arc hammock stand with a central spine rail, two end cross feet with pads, two arched uprights ending in hooks and a hammock sagging between them on gathered end ropes.',
    vs: rowsX([['single, 9 ft', 36, 108, 42, {}], ['double, 11 ft', 46, 134, 48, {}], ['folding, 8 ft', 32, 96, 36, {}]]),
    build: alongX(hammockStand) }),
  fam({ cat: 'hobby/outdoor', title: 'Generic beekeeping hive',
    desc: (v) => v.top ? 'Horizontal top-bar hive on four legs with a rail, a long body with sloped sides, top bars along the length, three entrance holes with a landing strip and a gabled roof.' : `Ten-frame hive on a four-legged stand: a bottom board with a landing board and entrance reducer, ${v.boxes} stacked box${v.boxes > 1 ? 'es' : ''} with handholds and rim ledges, an inner cover with a vent hole and a deep telescoping roof.`,
    vs: rows([['one deep box', 22, 18, 28, { boxes: 1 }], ['two deep boxes', 22, 18, 37.6, { boxes: 2 }], ['two deep boxes and a super', 22, 18, 44, { boxes: 3, supers: true }], ['horizontal top-bar, 44 in', 46, 20, 34, { top: true }]]),
    build: beehive }),
  fam({ cat: 'hobby/outdoor', title: 'Generic pedestal bird bath',
    desc: (v) => `Bird bath with a round foot and collar, a turned pedestal with two bulbs, a dished ${v.bowl} in bowl with a raised rim, a water surface and three pebbles.`,
    vs: rows([['14 in bowl, 22 in tall', 14, 14, 22, { bowl: 14 }], ['16 in bowl, 28 in tall', 16, 16, 28, { bowl: 16 }], ['20 in bowl, 34 in tall', 20, 20, 34, { bowl: 20 }]]),
    build: birdBath }),
  fam({ cat: 'hobby/outdoor', title: 'Generic bird feeder on hook pole',
    desc: (v) => `Star-footed hook pole with a curved crook and a hanging ${v.kind === 'tube' ? 'tube feeder with a cap, four feeding ports with perches and a seed tray' : v.kind === 'hopper' ? 'hopper feeder with a gabled roof, a seed tray with a lip and a rail and side perches' : 'platform tray with a low rim and corner drain holes under a small gabled roof on two posts'}.`,
    vs: rows([['tube feeder, 72 in pole', 24, 24, 72, { kind: 'tube' }], ['hopper feeder, 80 in pole', 24, 24, 80, { kind: 'hopper' }], ['platform feeder, 64 in pole', 24, 24, 64, { kind: 'platform' }]]),
    build: birdFeeder }),
  fam({ cat: 'hobby/outdoor', title: 'Generic metal detector',
    desc: (v) => `Hobby metal detector standing on its ${v.coil} in search coil (skirt and dome), with a lean lower shaft with a cam lock collar and an upper shaft, a control housing with display and two knobs, a handle grip, an armrest cuff and a cable.`,
    vs: rowsX([['6 in coil', 7, 22, 44, { coil: 6 }], ['10 in coil', 11, 26, 46, { coil: 10 }], ['15 in coil', 16, 32, 48, { coil: 15 }]]),
    build: alongX(metalDetector) }),
];

export default FAMS;

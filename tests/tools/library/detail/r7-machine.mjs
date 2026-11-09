/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, machine: 150 more fasteners, transmission parts, frames and mounts, mechanisms. Original geometry, generic sizes by nominal dimension. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, TAU = Math.PI * 2, m = Math;
const R3 = (n) => m.round(n * 1000) / 1000;
const mi = (mm) => R3(mm / IN);
// ------------------------------------------------------------------ geometry helpers
function prismX(a, poly, x0, x1) {   // poly of [y, z]
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
function prismY(a, poly, y0, y1) {   // poly of [x, z]
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
const ptsC = (cx, cy, r, n, rot = 0) => Array.from({ length: n }, (_, i) => [cx + r * m.cos(rot + (i * TAU) / n), cy + r * m.sin(rot + (i * TAU) / n)]);
/** A ring (annulus) around an axis. ax 'z' (c1,c2 = x,y), 'y' (x,z) or 'x' (y,z); p0..p1 along the axis; ri number or (sliceIndex)=>r; ro number or (angle)=>r. */
function ring(a, ax, c1, c2, p0, p1, ri, ro, n = 24, rot = 0, span = TAU) {
  const rif = typeof ri === 'function' ? ri : () => ri, rof = typeof ro === 'function' ? ro : () => ro;
  for (let i = 0; i < n; i++) {
    const t0 = rot + (i * span) / n, t1 = rot + ((i + 1) * span) / n, r0 = rif(i);
    const P = (t, r) => [c1 + r * m.cos(t), c2 + r * m.sin(t)];
    const poly = r0 > 0.01 ? [P(t0, r0), P(t0, rof(t0, i)), P(t1, rof(t1, i)), P(t1, r0)] : [[c1, c2], P(t0, rof(t0, i)), P(t1, rof(t1, i))];
    if (ax === 'z') a.prism(poly, p0, p1); else if (ax === 'y') prismY(a, poly, p0, p1); else prismX(a, poly, p0, p1);
  }
  return a;
}
const hexRo = (ap) => (t) => { const d = (((t % (TAU / 6)) + TAU / 6) % (TAU / 6)) - TAU / 12; return ap / m.cos(d); };
const sqRo = (h) => (t) => h / m.max(m.abs(m.cos(t)), m.abs(m.sin(t)));
/** a thread drawn as a zigzag of rings between rMin and rMaj */
function thread(a, cx, cy, z0, z1, rMaj, rMin, p, maxN = 14, seg = 12) {
  const n = m.max(1, m.min(maxN, m.floor((z1 - z0) / p))), st = (z1 - z0) / n, pts = [], rd = [];
  for (let i = 0; i <= 2 * n; i++) { pts.push([cx, cy, z0 + (i * st) / 2]); rd.push(i % 2 ? rMaj : rMin); }
  a.tube(pts, rd, seg);
}
/** a rod (bar) between two points in a plane. pl 'z' (xy plane, extruded z0..z1), 'x' (yz plane, extruded between x0..x1), 'y' (xz plane) */
function bar(a, pl, p, q, w, e0, e1, round = true) {
  const dx = q[0] - p[0], dy = q[1] - p[1], L = m.hypot(dx, dy) || 1, nx = (-dy / L) * (w / 2), ny = (dx / L) * (w / 2);
  const poly = [[p[0] + nx, p[1] + ny], [q[0] + nx, q[1] + ny], [q[0] - nx, q[1] - ny], [p[0] - nx, p[1] - ny]];
  if (pl === 'z') a.prism(poly, e0, e1); else if (pl === 'x') prismX(a, poly, e0, e1); else prismY(a, poly, e0, e1);
  if (round) for (const c of [p, q]) { if (pl === 'z') a.cyl(c[0], c[1], e0, e1, w / 2, 10); else if (pl === 'x') a.xcyl(e0, e1, c[0], c[1], w / 2, 10); else a.ycyl(e0, e1, c[0], c[1], w / 2, 10); }
}
/** a flat plate x0..x1, y0..y1, z0..z1 with round or slotted holes cut through: holes [{x,y,rx,ry}] (rx > ry gives a slot with round ends) */
function plateHoles(a, x0, y0, x1, y1, z0, z1, holes, bands = 4, pl = 'z') {
  const bx = (xa, ya, xb, yb) => (pl === 'z' ? a.box(xa, ya, z0, xb, yb, z1) : a.box(xa, z0, ya, xb, z1, yb));
  const ys = new Set([y0, y1]);
  for (const h of holes) for (let i = 0; i <= bands; i++) ys.add(m.round((h.y - h.ry + (2 * h.ry * i) / bands) * 10) / 10);
  const yl = [...ys].filter((y) => y >= y0 && y <= y1).sort((p, q) => p - q);
  for (let k = 0; k < yl.length - 1; k++) {
    const ya = yl[k], yb = yl[k + 1]; if (yb - ya < 0.3) continue; const ym = (ya + yb) / 2, iv = [];
    for (const h of holes) { const dy = m.abs(ym - h.y); if (dy >= h.ry) continue; const s = m.sqrt(1 - (dy / h.ry) ** 2); iv.push([h.x - (h.rx - h.ry) - h.ry * s, h.x + (h.rx - h.ry) + h.ry * s]); }
    iv.sort((p, q) => p[0] - q[0]);
    let cur = x0;
    for (const [s0, s1] of iv) { if (s0 > cur) bx(cur, ya, m.min(s0, x1), yb); cur = m.max(cur, s1); }
    if (cur < x1) bx(cur, ya, x1, yb);
  }
  if (pl === 'z') for (const h of holes) { if (h.rx > h.ry) { a.line(h.x - (h.rx - h.ry), h.y - h.ry, h.x + (h.rx - h.ry), h.y - h.ry, 'EQUIP-DETAIL'); a.line(h.x - (h.rx - h.ry), h.y + h.ry, h.x + (h.rx - h.ry), h.y + h.ry, 'EQUIP-DETAIL'); a.arc(h.x - (h.rx - h.ry), h.y, h.ry, 90, 270, 'EQUIP-DETAIL'); a.arc(h.x + (h.rx - h.ry), h.y, h.ry, -90, 90, 'EQUIP-DETAIL'); } else a.circ(h.x, h.y, h.ry, 'EQUIP-DETAIL'); }
}
/** gear or sprocket teeth around a z axis */
function teeth(a, cx, cy, z0, z1, N, rb, rt, hb, ht, rot = 0) {
  for (let i = 0; i < N; i++) { const th = (TAU * i) / N + 0.0001 + rot; const P = (r, d) => [cx + r * m.cos(th + d), cy + r * m.sin(th + d)]; a.prism([P(rb, -hb), P(rt, -ht), P(rt, ht), P(rb, hb)], z0, z1); }
}
/** spokes from a hub to a rim in the XY plane */
function spokes(a, cx, cy, z0, z1, rIn, rOut, n, w) { for (let i = 0; i < n; i++) { const th = (TAU * i) / n + 0.3; bar(a, 'z', [cx + rIn * m.cos(th), cy + rIn * m.sin(th)], [cx + rOut * m.cos(th), cy + rOut * m.sin(th)], w, z0, z1, false); } }

/** extrude a convex polygon [[u,v],...] through a mapper map(u, v, t) between t0 and t1 */
function extrude(a, map, poly, t0, t1) {
  const n = poly.length, M = (p, t) => map(p[0], p[1], t);
  for (let i = 1; i < n - 1; i++) a.t.push([M(poly[0], t0), M(poly[i + 1], t0), M(poly[i], t0)], [M(poly[0], t1), M(poly[i], t1), M(poly[i + 1], t1)]);
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([M(p, t0), M(q, t0), M(q, t1)], [M(p, t0), M(q, t1), M(p, t1)]); }
}
/** a T-slot aluminium profile of size S (mm) along axis ax between p0 and p1, centred on (c1, c2). Slot opening s. */
function extrusion(a, ax, c1, c2, p0, p1, S, s) {
  const map = ax === 'y' ? (u, v, t) => [c1 + u, t, c2 + v] : ax === 'x' ? (u, v, t) => [t, c1 + u, c2 + v] : (u, v, t) => [c1 + u, c2 + v, t];
  const h = S / 2, c = S * 0.2, dC = S * 0.3, t = S * 0.1;
  const rot = (u, v, f) => { for (let i = 0; i < f; i++) [u, v] = [-v, u]; return [u, v]; };
  const FP = (poly, f) => poly.map(([u, d]) => rot(u, h - d, f));
  for (let f = 0; f < 4; f++) {
    extrude(a, map, FP([[s / 2, 0], [h, 0], [h, t], [s / 2, t]], f), p0, p1); extrude(a, map, FP([[-h, 0], [-s / 2, 0], [-s / 2, t], [-h, t]], f), p0, p1);
    extrude(a, map, FP([[h - c, t], [h, t], [h, c], [h - c, c]], f), p0, p1);
    const A = [S * 0.34, h - S * 0.34], B = [h - dC, dC], dx = B[0] - A[0], dy = B[1] - A[1], L = m.hypot(dx, dy), nx = (-dy / L) * t * 0.45, ny = (dx / L) * t * 0.45;
    extrude(a, map, FP([[A[0] + nx, A[1] + ny], [B[0] + nx, B[1] + ny], [B[0] - nx, B[1] - ny], [A[0] - nx, A[1] - ny]], f), p0, p1);
  }
  ring(a, ax, c1, c2, p0, p1, S * 0.085, sqRo(h - dC), 16, 0.0);
  const w = S * 0.0; 
}

const ISO = { 4: { p: 0.7, af: 7, k: 2.8 }, 5: { p: 0.8, af: 8, k: 3.5 }, 6: { p: 1, af: 10, k: 4 }, 8: { p: 1.25, af: 13, k: 5.3 }, 10: { p: 1.5, af: 16, k: 6.4 }, 12: { p: 1.75, af: 18, k: 7.5 }, 16: { p: 2, af: 24, k: 10 }, 20: { p: 2.5, af: 30, k: 12.5 } };
ISO[24] = { p: 3, af: 36, k: 15 };
const AC = (af) => af / m.cos(m.PI / 6);
const hexPts = (cx, cy, af) => ptsC(cx, cy, AC(af) / 2, 6, 0);
/** a round wire swept along an arc in the XZ plane (centre cx,cz; path radius R, wire radius r) from angle t0 to t1; whole ring when span is TAU */
function sweepArc(a, cx, cy, cz, R, r, t0, t1, nu = 18, nv = 8) {
  const P = (u, v) => [cx + (R + r * m.cos(v)) * m.cos(u), cy + r * m.sin(v), cz + (R + r * m.cos(v)) * m.sin(u)];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = t0 + ((t1 - t0) * i) / nu, u1 = t0 + ((t1 - t0) * (i + 1)) / nu, v0 = (TAU * j) / nv, v1 = (TAU * (j + 1)) / nv;
    a.t.push([P(u0, v0), P(u1, v0), P(u1, v1)], [P(u0, v0), P(u1, v1), P(u0, v1)]);
  }
}
const V = (l, w, d, h, p) => [l, mi(w), mi(d), mi(h), 0, p];
/** a plain hex nut ring around a vertical rod */
const nutAt = (a, cx, cy, z0, z1, d, af) => ring(a, 'z', cx, cy, z0, z1, d / 2 * 0.9, hexRo(af / 2), 18, 0);
/** a round-headed rod end: socket as a ring with a round recess, drawn on top of a cylinder body */
const slotTop = (a, cx, cy, z, R, w, th = 1) => { const sa = m.asin(m.min(0.9, w / 2 / R)); for (let q = 0; q < 2; q++) ring(a, 'z', cx, cy, z - th, z, 0, R, 8, sa + q * m.PI, m.PI - 2 * sa); };
const crossTop = (a, cx, cy, z, R, w, th = 0.8) => { const sa = m.asin(m.min(0.9, w / 2 / (R * 0.45))); ring(a, 'z', cx, cy, z - th, z, R * 0.45, R, 24); for (let q = 0; q < 4; q++) ring(a, 'z', cx, cy, z - th, z, 0, R * 0.45, 3, sa + (q * m.PI) / 2, m.PI / 2 - 2 * sa); };
/** the threaded part of a vertical rod: core plus ring thread */
const rodThread = (a, cx, cy, z0, z1, r, p, maxN = 22) => { a.cyl(cx, cy, z0, z1, r * 0.84, 14); thread(a, cx, cy, z0, z1, r, r * 0.84, p, maxN); };

// ============================================================================================= FASTENERS
const fasteners = [
  fam({ cat: 'machine/fasteners', title: 'Generic hex flange bolt',
    desc: (v) => `Hex flange bolt, ${v.d} mm thread by ${v.len} mm under the head: a hex head on a round tapered flange, a plain grip and a rolled thread drawn as rings.`,
    vs: [[6, 20], [8, 30], [10, 40], [12, 50]].map(([d, len]) => V(`${d} mm x ${len} mm`, d * 1.9, d * 1.9, len + ISO[d].k + d * 0.3, { d, len })),
    build: (a, v) => {
      const { d, len } = v, I = ISO[d], cx = a.cx, cy = a.cy, fl = d * 0.95, ft = d * 0.3, hb = a.Z1 - I.k, r = d / 2, zf = hb - ft;
      a.prism(hexPts(cx, cy, I.af), hb, a.Z1); a.cone(cx, cy, hb - ft * 0.5, hb, fl, AC(I.af) / 2 * 0.98, 28); a.cyl(cx, cy, zf, hb - ft * 0.5, fl, 28); a.cone(cx, cy, a.Z1 - 1, a.Z1, AC(I.af) / 2 * 0.86, AC(I.af) / 2 * 0.7, 6);
      const tl = m.min(len, 2 * d + 6); a.cyl(cx, cy, a.Z0 + tl, zf, r, 14); rodThread(a, cx, cy, a.Z0 + 1, a.Z0 + tl, r, I.p); a.cone(cx, cy, a.Z0, a.Z0 + 1.2, r * 0.7, r * 0.84, 14);
      a.circ(cx, cy, fl); a.poly(hexPts(cx, cy, I.af)); a.circ(cx, cy, r, 'EQUIP-HIDDEN');
      a.log('Added the hex head, the round flange, the plain grip and the rolled thread as rings (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic carriage bolt',
    desc: (v) => `Carriage bolt, ${v.d} mm thread by ${v.len} mm: a low domed head, a square neck under it, a plain grip and a rolled thread drawn as rings.`,
    vs: [[6, 40], [8, 60], [10, 80]].map(([d, len]) => V(`${d} mm x ${len} mm`, d * 2.1, d * 2.1, len + d * 0.6, { d, len })),
    build: (a, v) => {
      const { d, len } = v, I = ISO[d], cx = a.cx, cy = a.cy, hd = d * 2.1, k = d * 0.6, r = d / 2, hb = a.Z1 - k, nk = d * 0.55;
      a.tube([[cx, cy, hb], [cx, cy, hb + k * 0.35], [cx, cy, hb + k * 0.7], [cx, cy, a.Z1]], [hd / 2, hd / 2 * 0.94, hd / 2 * 0.7, hd / 2 * 0.2], 24);
      a.box(cx - d / 2, cy - d / 2, hb - nk, cx + d / 2, cy + d / 2, hb);
      const tl = m.min(len - nk, 2 * d + 8); a.cyl(cx, cy, a.Z0 + tl, hb - nk, r, 14); rodThread(a, cx, cy, a.Z0 + 1, a.Z0 + tl, r, I.p); a.cone(cx, cy, a.Z0, a.Z0 + 1.2, r * 0.7, r * 0.84, 14);
      a.circ(cx, cy, hd / 2); a.rect(cx - d / 2, cy - d / 2, cx + d / 2, cy + d / 2, 'EQUIP-HIDDEN'); a.circ(cx, cy, r, 'EQUIP-HIDDEN');
      a.log('Added the domed head, the square neck, the plain grip and the rolled thread as rings (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic lifting eye bolt',
    desc: (v) => `Lifting eye bolt with collar, ${v.d} mm thread, ${v.l} mm of thread under the collar: a round forged eye, a flat collar and a rolled thread drawn as rings.`,
    vs: [[8, 13, 36, 20, 36, 6], [12, 22, 54, 30, 53, 10], [16, 27, 63, 35, 62, 12], [20, 30, 72, 40, 71, 14]].map(([d, l, d2, d3, hh, k]) => V(`M${d}, ${d2} mm eye`, d2, d3, l + hh, { d, l, d2, d3, hh, k })),
    build: (a, v) => {
      const { d, l, d2, d3, k } = v, cx = a.cx, cy = a.cy, r = d / 2, rc = (d2 + d3) / 4, rt = (d2 - d3) / 4, ze = a.Z1 - d2 / 2, zl = a.Z0 + l;
      rodThread(a, cx, cy, a.Z0 + 1, zl, r, ISO[d].p, 18); a.cone(cx, cy, a.Z0, a.Z0 + 1.2, r * 0.7, r * 0.84, 14);
      a.cyl(cx, cy, zl, zl + k, d3 / 2, 20); a.cone(cx, cy, zl + k, zl + k + d3 * 0.25, d3 / 2, rt * 1.1, 14);
      sweepArc(a, cx, cy, ze, rc, rt, 0, TAU, 28, 8);
      a.circ(cx, cy, d3 / 2); a.circ(cx, cy, r, 'EQUIP-HIDDEN'); a.rect(cx - d2 / 2, cy - rt, cx + d2 / 2, cy + rt, 'EQUIP-DETAIL');
      a.log('Added the thread, the flat collar and the forged eye ring (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic U-bolt with saddle plate',
    desc: (v) => `U-bolt for a ${v.pipe} nominal pipe: a ${v.d} mm round bar bent to a half circle, two threaded legs, a flat saddle plate with two holes and a nut on each leg.`,
    vs: [['1/2 in pipe, M6', 21.3, 6, 70], ['1 in pipe, M8', 33.4, 8, 90], ['2 in pipe, M10', 60.3, 10, 130]].map(([l, OD, d, leg]) => V(l, OD + 4 * d, 3 * d, d / 2 + (OD + d) / 2 + leg, { pipe: l.split(' pipe')[0], OD, d, leg })),
    build: (a, v) => {
      const { OD, d, leg } = v, I = ISO[d], cx = a.cx, cy = a.cy, R = (OD + d) / 2, zc = a.Z0 + d / 2 + R, r = d / 2, mh = d * 0.8, pt = d * 0.4, zp = a.Z1 - 2.6 * mh - pt;
      sweepArc(a, cx, cy, zc, R, r, m.PI, TAU, 18, 10);
      for (const s of [-1, 1]) { const x = cx + s * R; a.cyl(x, cy, zc, zp, r, 12); rodThread(a, x, cy, zp - 2, a.Z1, r, I.p, 16); a.cone(x, cy, a.Z1 - 0.8, a.Z1, r * 0.84, r * 0.6, 10); nutAt(a, x, cy, zp + pt, zp + pt + mh, d, I.af); }
      plateHoles(a, cx - R - 1.5 * d, cy - 1.5 * d, cx + R + 1.5 * d, cy + 1.5 * d, zp, zp + pt, [{ x: cx - R, y: cy, rx: r + 0.4, ry: r + 0.4 }, { x: cx + R, y: cy, rx: r + 0.4, ry: r + 0.4 }], 6);
      a.rect(cx - R - 1.5 * d, cy - 1.5 * d, cx + R + 1.5 * d, cy + 1.5 * d); for (const s of [-1, 1]) a.poly(hexPts(cx + s * R, cy, I.af));
      a.log('Added the bent bar, the two threaded legs, the saddle plate and the nuts (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic specialty nut',
    desc: (v) => ({ wing: `Wing nut for a ${v.d} mm thread: a round hub with a bore and two slanted flat wings for hand tightening.`, dome: `Domed cap nut for a ${v.d} mm thread: a hex body with a blind bore under a rounded dome.`, castle: `Castle nut for a ${v.d} mm thread: a hex lower body and a round crown with six slots for a split pin.`, flange: `Flange nut for a ${v.d} mm thread: a hex body on a round tapered flange with a bore.` })[v.t],
    vs: [
      V('wing, 8 mm', 34, 14, 22, { t: 'wing', d: 8 }), V('domed cap, 10 mm', AC(ISO[10].af), AC(ISO[10].af), 20, { t: 'dome', d: 10 }),
      V('castle, 12 mm', AC(ISO[12].af), AC(ISO[12].af), 13.5, { t: 'castle', d: 12 }), V('flange, 10 mm', 25.8, 25.8, 11, { t: 'flange', d: 10 })],
    build: (a, v) => {
      const { t, d } = v, I = ISO[d], cx = a.cx, cy = a.cy, ap = I.af / 2, H = a.H, z0 = a.Z0, bo = d / 2 * 0.9;
      if (t === 'wing') {
        const hr = 5.6, S = a.W / 2, th = 3.2;
        ring(a, 'z', cx, cy, z0, z0 + H * 0.16, bo, hr * 1.25, 24); ring(a, 'z', cx, cy, z0 + H * 0.16, z0 + H * 0.62, bo, hr, 24);
        for (const s of [-1, 1]) prismY(a, [[cx + s * hr * 0.9, z0 + H * 0.12], [cx + s * S, z0 + H * 0.5], [cx + s * S, z0 + H], [cx + s * hr * 0.9, z0 + H * 0.62]].map((p, i, arr) => p), cy - th / 2, cy + th / 2);
        a.rect(cx - S, cy - th / 2, cx + S, cy + th / 2); a.circ(cx, cy, hr * 1.25, 'EQUIP-DETAIL'); a.circ(cx, cy, bo, 'EQUIP-DETAIL');
      } else if (t === 'dome') {
        ring(a, 'z', cx, cy, z0, z0 + H * 0.55, bo, hexRo(ap), 18, 0);
        a.tube([0.55, 0.64, 0.78, 0.9, 1].map((f) => [cx, cy, z0 + H * f]), [ap * 0.98, ap * 0.95, ap * 0.8, ap * 0.5, ap * 0.1], 20);
        a.poly(hexPts(cx, cy, I.af)); a.circ(cx, cy, ap * 0.8, 'EQUIP-DETAIL'); a.circ(cx, cy, bo, 'EQUIP-HIDDEN');
      } else if (t === 'castle') {
        ring(a, 'z', cx, cy, z0, z0 + H * 0.52, bo, hexRo(ap), 18, 0);
        for (let i = 0; i < 6; i++) ring(a, 'z', cx, cy, z0 + H * 0.52, z0 + H, bo, ap * 0.97, 3, (TAU * i) / 6 + 0.12, (TAU / 6) * 0.62);
        a.poly(hexPts(cx, cy, I.af)); a.circ(cx, cy, ap * 0.97, 'EQUIP-DETAIL'); a.circ(cx, cy, bo, 'EQUIP-DETAIL');
      } else {
        const fl = a.W / 2, ft = H * 0.2;
        ring(a, 'z', cx, cy, z0, z0 + ft * 0.6, bo, fl, 28); ring(a, 'z', cx, cy, z0 + ft * 0.6, z0 + ft * 1.1, bo, fl * 0.88, 28); ring(a, 'z', cx, cy, z0 + ft, z0 + H, bo, hexRo(ap), 18, 0);
        a.circ(cx, cy, fl); a.poly(hexPts(cx, cy, I.af)); a.circ(cx, cy, bo, 'EQUIP-DETAIL');
      }
      a.log('Added the ' + t + ' nut body with its bore (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic socket set screw',
    desc: (v) => `Socket set screw, ${v.d} mm by ${v.len} mm with a ${v.pt} point: a headless threaded body, a hex socket in the drive end and ${v.pt === 'cup' ? 'a chamfered cup point' : v.pt === 'flat' ? 'a flat chamfered point' : 'a short plain dog point'}.`,
    vs: [[6, 10, 'cup', 3], [8, 16, 'flat', 4], [10, 20, 'dog', 5]].map(([d, len, pt, s]) => V(`${d} mm x ${len} mm, ${pt} point`, d, d, len, { d, len, pt, s })),
    build: (a, v) => {
      const { d, pt, s } = v, r = d / 2, cx = a.cx, cy = a.cy, sd = d * 0.55, nose = pt === 'dog' ? d * 0.4 : 0, p = ISO[d].p;
      a.cyl(cx, cy, a.Z0 + nose, a.Z1 - sd, r * 0.84, 14); thread(a, cx, cy, a.Z0 + nose, a.Z1 - sd, r, r * 0.84, p, 14);
      if (pt === 'dog') a.cyl(cx, cy, a.Z0, a.Z0 + nose + 0.5, r * 0.6, 12); else a.cone(cx, cy, a.Z0, a.Z0 + 0.9, r * (pt === 'cup' ? 0.55 : 0.7), r * 0.84, 14);
      ring(a, 'z', cx, cy, a.Z1 - sd, a.Z1, s / 2 * 1.1, r * 0.96, 16);
      a.circ(cx, cy, r); a.poly(ptsC(cx, cy, s / 2 / m.cos(m.PI / 6), 6, 0), 'EQUIP-DETAIL');
      a.log('Added the threaded body, the hex socket and the ' + pt + ' point (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic anchor bolt with nut and washer',
    desc: (v) => `L-shaped anchor bolt, ${v.d} mm by ${v.L} mm overall: a threaded top with a washer and a hex nut, a plain shank and a bent foot for embedding in concrete.`,
    vs: [[12, 250], [16, 300], [20, 400]].map(([d, L]) => { const I = ISO[d], xr = m.max(d * 1.25, AC(I.af) / 2), Rb = 2.5 * d, f = 4 * d; return V(`M${d} x ${L} mm`, xr + Rb + f + d / 2, 2 * xr, L, { d, L, xr, Rb, f }); }),
    build: (a, v) => {
      const { d, L, xr, Rb, f } = v, I = ISO[d], cy = a.cy, r = d / 2, x = a.X0 + xr, zc = a.Z0 + r + Rb, Lt = 7 * d, wt = 0.3 * d, mh = 0.8 * d;
      a.cyl(x, cy, zc, a.Z1 - Lt, r, 10); sweepArc(a, x + Rb, cy, zc, Rb, r, m.PI, 1.5 * m.PI, 8, 10); a.xcyl(x + Rb, x + Rb + f, cy, a.Z0 + r, r, 10);
      rodThread(a, x, cy, a.Z1 - Lt, a.Z1, r, I.p, 24); a.cone(x, cy, a.Z1 - 1, a.Z1, r * 0.84, r * 0.6, 12);
      const zw = a.Z1 - Lt + 2.5 * d; ring(a, 'z', x, cy, zw, zw + wt, r + 0.4, 1.25 * d, 24); nutAt(a, x, cy, zw + wt, zw + wt + mh, d, I.af);
      a.circ(x, cy, 1.25 * d); a.poly(hexPts(x, cy, I.af)); a.rect(x - r, cy - r, x + Rb + f, cy + r, 'EQUIP-HIDDEN');
      a.log('Added the threaded top with washer and nut, the shank and the bent foot (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic self-tapping screw',
    desc: (v) => ({ wood: `Countersunk wood screw, ${v.d} mm by ${v.len} mm: a conical head with a straight slot, a smooth shank, a coarse thread and a sharp point.`, roof: `Self-drilling roofing screw, ${v.d} mm by ${v.len} mm: a hex washer head over a rubber sealing washer, a coarse thread and a drill point.`, bugle: `Bugle head drywall screw, ${v.d} mm by ${v.len} mm: a flared head with a cross recess, a coarse thread and a sharp point.`, pan: `Pan head self-tapping screw, ${v.d} mm by ${v.len} mm: a rounded head with a cross recess and a coarse thread to a sharp point.` })[v.t],
    vs: [['countersunk wood, 4 mm x 40 mm', 'wood', 4, 40, 8, 2.4], ['hex roofing, 6.3 mm x 50 mm', 'roof', 6.3, 50, 14.5, 8], ['bugle drywall, 3.5 mm x 35 mm', 'bugle', 3.5, 35, 7, 2.6], ['pan head, 4.8 mm x 25 mm', 'pan', 4.8, 25, 9, 3.4]].map(([l, t, d, len, hd, k]) => V(l, t === 'roof' ? 16 : hd, t === 'roof' ? 16 : hd, len + k, { t, d, len, hd, k })),
    build: (a, v) => {
      const { t, d, len, hd, k } = v, r = d / 2, cx = a.cx, cy = a.cy, hb = a.Z1 - k, p = d * 0.45, tl = t === 'wood' ? len * 0.66 : len - 2;
      a.cyl(cx, cy, a.Z0 + 4, hb, r * 0.84, 12); thread(a, cx, cy, a.Z0 + 4, a.Z0 + tl, r, r * 0.6, p, 26); a.cone(cx, cy, a.Z0, a.Z0 + 4.2, r * 0.12, r * 0.84, 12);
      if (t === 'wood') { a.cyl(cx, cy, a.Z0 + tl, hb, r * 0.84, 12); a.cone(cx, cy, hb, a.Z1 - 1, r * 0.84, hd / 2, 22); a.cyl(cx, cy, a.Z1 - 1, a.Z1 - 0.8, hd / 2, 22); slotTop(a, cx, cy, a.Z1, hd / 2, hd * 0.14, 0.8); a.circ(cx, cy, hd / 2); a.line(cx - hd / 2, cy, cx + hd / 2, cy, 'EQUIP-DETAIL'); }
      else if (t === 'roof') {
        a.cyl(cx, cy, hb, hb + 2, 8, 24); ring(a, 'z', cx, cy, hb + 2, hb + 3.4, r, 7, 24); a.prism(hexPts(cx, cy, 8), hb + 3.4, a.Z1); a.cone(cx, cy, a.Z1 - 0.8, a.Z1, AC(8) / 2 * 0.9, AC(8) / 2 * 0.75, 6);
        a.circ(cx, cy, 8); a.poly(hexPts(cx, cy, 8)); a.circ(cx, cy, 7, 'EQUIP-DETAIL');
      } else if (t === 'bugle') {
        a.tube([[cx, cy, hb], [cx, cy, hb + k * 0.25], [cx, cy, hb + k * 0.6], [cx, cy, a.Z1 - 0.8]], [r * 0.9, hd / 2 * 0.42, hd / 2 * 0.8, hd / 2], 20); a.cyl(cx, cy, a.Z1 - 0.8, a.Z1 - 0.01, hd / 2, 20); crossTop(a, cx, cy, a.Z1, hd / 2, hd * 0.12, 0.8);
        a.circ(cx, cy, hd / 2); a.line(cx - hd * 0.3, cy, cx + hd * 0.3, cy, 'EQUIP-DETAIL'); a.line(cx, cy - hd * 0.3, cx, cy + hd * 0.3, 'EQUIP-DETAIL');
      } else {
        a.cyl(cx, cy, hb, hb + k * 0.55, hd / 2, 22); a.cone(cx, cy, hb + k * 0.55, a.Z1 - 0.8, hd / 2 * 0.97, hd / 2 * 0.8, 22); a.cyl(cx, cy, a.Z1 - 0.8, a.Z1 - 0.01, hd / 2 * 0.8, 22); crossTop(a, cx, cy, a.Z1, hd / 2 * 0.8, hd * 0.1, 0.8);
        a.circ(cx, cy, hd / 2); a.line(cx - hd * 0.28, cy, cx + hd * 0.28, cy, 'EQUIP-DETAIL'); a.line(cx, cy - hd * 0.28, cx, cy + hd * 0.28, 'EQUIP-DETAIL');
      }
      a.log('Added the head, the coarse thread and the point (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic T-slot hammer head bolt',
    desc: (v) => `Hammer head bolt for a ${v.slot} mm slot of an aluminium profile: a rectangular tapered head, a short neck, a ${v.d} mm thread drawn as rings and a flange nut on top.`,
    vs: [['M5 x 16 mm, 6 mm slot', 5, 16, 6], ['M6 x 20 mm, 8 mm slot', 6, 20, 8], ['M8 x 25 mm, 10 mm slot', 8, 25, 10]].map(([l, d, len, slot]) => V(l, d * 3.4, d * 2.1, len + d * 0.6 + 2, { d, len, slot })),
    build: (a, v) => {
      const { d, len } = v, I = ISO[d], cx = a.cx, cy = a.cy, r = d / 2, hl = d * 3.4, hw = d * 2.1, ht = d * 0.6, hz = a.Z0 + ht, mh = d * 0.8;
      prismY(a, [[cx - hl / 2, a.Z0], [cx + hl / 2, a.Z0], [cx + hl / 2 * 0.86, hz], [cx - hl / 2 * 0.86, hz]], cy - hw / 2 * 0.86, cy + hw / 2 * 0.86); a.box(cx - hl / 2 * 0.86, cy - hw / 2, a.Z0 + ht * 0.4, cx + hl / 2 * 0.86, cy + hw / 2, hz);
      a.cyl(cx, cy, hz, hz + 1.5, r * 1.1, 12); rodThread(a, cx, cy, hz + 1.5, a.Z1 - mh + 1, r, I.p, 14);
      ring(a, 'z', cx, cy, a.Z1 - mh, a.Z1, r * 0.9, hexRo(I.af / 2), 18, 0);
      a.rect(cx - hl / 2, cy - hw / 2, cx + hl / 2, cy + hw / 2, 'EQUIP-HIDDEN'); a.poly(hexPts(cx, cy, I.af)); a.circ(cx, cy, r, 'EQUIP-DETAIL');
      a.log('Added the hammer head, the neck, the rolled thread and the nut (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic shoulder bolt',
    desc: (v) => `Shoulder bolt with a ${v.d} mm ground shoulder, ${v.l} mm long, and an M${v.t} thread: a round socket head, a smooth shoulder and a smaller threaded tip drawn as rings.`,
    vs: [[8, 20, 6, 10, 13, 6.5, 5], [10, 25, 8, 12, 16, 8, 6], [12, 30, 10, 14, 18, 10, 8]].map(([d, l, t, tl, hd, k, s]) => V(`${d} mm shoulder x ${l} mm, M${t}`, hd, hd, k + l + tl + 2, { d, l, t, tl, hd, k, s })),
    build: (a, v) => {
      const { d, l, t, tl, hd, k, s } = v, cx = a.cx, cy = a.cy, r = t / 2, hb = a.Z1 - k, zs = a.Z0 + tl + 2;
      a.cyl(cx, cy, hb, a.Z1 - k * 0.55, hd / 2, 28); ring(a, 'z', cx, cy, a.Z1 - k * 0.55, a.Z1, s / 2 * 1.12, hd / 2, 28); a.cone(cx, cy, a.Z1 - 0.7, a.Z1, hd / 2, hd / 2 * 0.94, 24);
      a.cyl(cx, cy, zs, hb, d / 2, 20); a.cyl(cx, cy, zs - 1.2, zs, r * 1.05, 14);
      rodThread(a, cx, cy, a.Z0 + 1, zs - 1, r, ISO[t].p, 14); a.cone(cx, cy, a.Z0, a.Z0 + 1.2, r * 0.7, r * 0.84, 14);
      a.circ(cx, cy, hd / 2); a.circ(cx, cy, d / 2, 'EQUIP-HIDDEN'); a.poly(ptsC(cx, cy, s / 2 / m.cos(m.PI / 6), 6, 0), 'EQUIP-DETAIL');
      a.log('Added the socket head, the ground shoulder and the threaded tip (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic knurled thumb screw',
    desc: (v) => `Knurled thumb screw, ${v.d} mm by ${v.len} mm: a cylindrical head with a ring of knurl ridges and a slot across the top, a collar under the head and a rolled thread drawn as rings.`,
    vs: [[5, 20, 14, 8], [6, 25, 18, 12], [8, 30, 24, 14]].map(([d, len, hd, k]) => V(`${d} mm x ${len} mm`, hd + 1.4, hd + 1.4, len + k, { d, len, hd, k })),
    build: (a, v) => {
      const { d, len, hd, k } = v, cx = a.cx, cy = a.cy, r = d / 2, hb = a.Z1 - k, N = 24, rb = hd / 2;
      a.cyl(cx, cy, hb, a.Z1, rb, 28); teeth(a, cx, cy, hb + 1, a.Z1 - 0.5, N, rb * 0.98, rb + 0.7, (m.PI / N) * 0.5, (m.PI / N) * 0.22);
      slotTop(a, cx, cy, a.Z1 + 0.0, rb * 0.98, 2, 0.01);
      a.cyl(cx, cy, hb - 1.6, hb, r * 1.5, 16); a.cyl(cx, cy, a.Z0 + 2, hb - 1.6, r, 14); rodThread(a, cx, cy, a.Z0 + 1, hb - 1.6, r, ISO[d].p, 20); a.cone(cx, cy, a.Z0, a.Z0 + 1.2, r * 0.7, r * 0.84, 14);
      a.circ(cx, cy, rb + 0.7); a.circ(cx, cy, rb * 0.98, 'EQUIP-DETAIL'); a.line(cx - rb * 0.8, cy, cx + rb * 0.8, cy, 'EQUIP-DETAIL');
      a.log('Added the knurled head, the collar and the rolled thread as rings (plan and 3D).');
    } }),
];

// ============================================================================================= TRANSMISSION
const keyIn = (r) => (i) => (i === 7 || i === 8 ? r + r * 0.34 : r);
/** a thread drawn as a zigzag of rings along x */
function threadX(a, y, z, x0, x1, rMaj, rMin, p, maxN = 14, seg = 12) {
  const n = m.max(1, m.min(maxN, m.floor((x1 - x0) / p))), st = (x1 - x0) / n, pts = [], rd = [];
  for (let i = 0; i <= 2 * n; i++) { pts.push([x0 + (i * st) / 2, y, z]); rd.push(i % 2 ? rMaj : rMin); }
  a.tube(pts, rd, seg);
}
/** polygon of a tooth on a wheel in the XZ plane (axis along y): centre (cx, cz), angle th, base/tip radius and half angles */
const toothXZ = (cx, cz, th, rb, rt, hb, ht) => { const P = (r, d) => [cx + r * m.cos(th + d), cz + r * m.sin(th + d)]; return [P(rb, -hb), P(rt, -ht), P(rt, ht), P(rb, hb)]; };
const transmission = [
  fam({ cat: 'machine/transmission', title: 'Generic helical gear',
    desc: (v) => `${v.hand === 'right' ? 'Right' : 'Left'}-hand helical gear, ${v.N} teeth, ${v.mod} mm normal module, ${v.beta} degree helix, ${v.face} mm face width: a rim with slanted teeth cut in slices, a hub standing proud on one side and a bore with a keyway.`,
    vs: [[2, 20, 25, 14, 30, 12, 15, 'right'], [2.5, 30, 35, 20, 42, 16, 20, 'left'], [3, 40, 45, 28, 56, 20, 15, 'right']].map(([mod, N, face, bore, hubD, hubL, beta, hand]) => { const mt = mod / m.cos((beta * m.PI) / 180), rt = (N * mt) / 2 + mod; return V(`${N} teeth, ${bore} mm bore, ${hand}-hand ${beta} deg`, rt * 2, rt * 2, face + hubL, { mod, N, face, bore, hubD, hubL, beta, hand, mt, rt }); }),
    build: (a, v) => {
      const { mod, N, face, bore, hubD, hubL, beta, hand, mt, rt } = v, cx = a.cx, cy = a.cy, rp = (N * mt) / 2, rr = rp - 1.25 * mod, z0 = a.Z0, z1 = z0 + face, K = 8, tw = m.tan((beta * m.PI) / 180) / rp * (hand === 'right' ? 1 : -1);
      for (let k = 0; k < K; k++) { const za = z0 + (face * k) / K, zb = z0 + (face * (k + 1)) / K, rot = tw * (za + zb) / 2 - tw * z0; teeth(a, cx, cy, za, zb, N, rr * 0.985, rt, (m.PI / N) * 0.62, (m.PI / N) * 0.28, rot); }
      ring(a, 'z', cx, cy, z0, z1, keyIn(bore / 2), rr / m.cos(m.PI / 32), 32); ring(a, 'z', cx, cy, z1, a.Z1, keyIn(bore / 2), hubD / 2, 32);
      a.circ(cx, cy, rt); a.circ(cx, cy, rr, 'EQUIP-DETAIL'); a.circ(cx, cy, rp, 'EQUIP-HIDDEN'); a.circ(cx, cy, hubD / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, bore / 2, 'EQUIP-DETAIL'); a.rect(cx - bore * 0.14, cy + bore / 2, cx + bore * 0.14, cy + bore * 0.7, 'EQUIP-DETAIL');
      a.log('Added the rim with slanted teeth cut in slices, the hub and the bore with its keyway (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic worm and worm wheel set',
    desc: (v) => `Worm drive set, ${v.N} tooth wheel at ${v.mod} mm module: a threaded worm on a shaft with plain stubs lying below a toothed wheel with a hub and bore, standing on its edge.`,
    vs: [[20, 3, 28, 70, 22], [30, 2.5, 24, 60, 18], [40, 2, 20, 50, 14]].map(([N, mod, dw, wl, face]) => { const C = (N * mod + dw) / 2, tip = ((N + 2) * mod) / 2, zw = dw / 2 + mod, stub = 14; return V(`${N} tooth wheel, ${mod} mm module`, m.max(wl + 2 * stub, 2 * tip), m.max(face + 16, dw + 2 * mod), zw + C + tip, { N, mod, dw, wl, face, C, tip, zw, stub }); }),
    build: (a, v) => {
      const { N, mod, dw, wl, face, C, tip, zw, stub } = v, cx = a.cx, cy = a.cy, z = a.Z0 + zw, ze = z + C, rr = (N * mod) / 2 - 1.25 * mod, bore = dw * 0.5, hubD = bore * 1.8;
      const x0 = cx - wl / 2 - stub, x1 = cx + wl / 2 + stub, rc = dw / 2 - 1.25 * mod;
      a.xcyl(x0, x1, cy, z, dw * 0.2, 14); a.xcyl(cx - wl / 2, cx + wl / 2, cy, z, rc, 20); threadX(a, cy, z, cx - wl / 2, cx + wl / 2, dw / 2 + mod, rc, m.PI * mod, 14, 20);
      for (let i = 0; i < N; i++) prismY(a, toothXZ(cx, ze, (TAU * i) / N + 0.0001, rr * 0.985, tip, (m.PI / N) * 0.62, (m.PI / N) * 0.28), cy - face / 2, cy + face / 2);
      ring(a, 'y', cx, ze, cy - face / 2, cy + face / 2, hubD / 2, rr / m.cos(m.PI / 32), 32); ring(a, 'y', cx, ze, cy - face / 2 - 8, cy + face / 2 + 8, bore / 2, hubD / 2, 24);
      a.rect(x0, cy - dw * 0.2, x1, cy + dw * 0.2); a.rect(cx - wl / 2, cy - dw / 2 - mod, cx + wl / 2, cy + dw / 2 + mod, 'EQUIP-DETAIL'); a.rect(cx - tip, cy - face / 2, cx + tip, cy + face / 2, 'EQUIP-DETAIL'); a.rect(cx - hubD / 2, cy - face / 2 - 8, cx + hubD / 2, cy + face / 2 + 8, 'EQUIP-DETAIL');
      a.log('Added the threaded worm with its stubs and the toothed wheel with hub and bore (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic rack and pinion',
    desc: (v) => `Gear rack ${v.L} mm long at ${v.mod} mm module with a ${v.N} tooth pinion meshing on top: a bar with straight teeth and four mounting holes under a toothed pinion with hub and bore.`,
    vs: [[2, 20, 300, 20], [3, 18, 480, 26], [4, 22, 800, 36]].map(([mod, N, L, face]) => { const hb = 3 * mod + 6, tipR = ((N + 2) * mod) / 2, zt = hb, pl = zt + 1.25 * mod, zc = pl + (N * mod) / 2; return V(`${mod} mm module, ${L} mm rack, ${N} tooth pinion`, L, face + 16, zc + tipR, { mod, N, L, face, hb, zc, tipR }); }),
    build: (a, v) => {
      const { mod, N, L, face, hb, zc, tipR } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, pc = m.PI * mod, n = m.floor(L / pc) - 1, rr = (N * mod) / 2 - 1.25 * mod, bore = mod * 6, hubD = bore * 1.8;
      const holes = [0.12, 0.38, 0.62, 0.88].map((f) => ({ x: a.X0 + L * f, y: cy, rx: mod * 1.2, ry: mod * 1.2 }));
      plateHoles(a, a.X0, cy - face / 2, a.X1, cy + face / 2, z0, z0 + hb, holes, 6);
      for (let i = 0; i < n; i++) { const x = a.X0 + pc * (i + 1); prismY(a, [[x - pc * 0.28, z0 + hb], [x + pc * 0.28, z0 + hb], [x + pc * 0.11, z0 + hb + 2.25 * mod], [x - pc * 0.11, z0 + hb + 2.25 * mod]], cy - face / 2, cy + face / 2); }
      const zp = z0 + zc;
      for (let i = 0; i < N; i++) prismY(a, toothXZ(cx, zp, (TAU * i) / N + 0.0001 + m.PI / N * 0.5, rr * 0.985, ((N + 2) * mod) / 2, (m.PI / N) * 0.62, (m.PI / N) * 0.28), cy - face / 2, cy + face / 2);
      ring(a, 'y', cx, zp, cy - face / 2, cy + face / 2, hubD / 2, rr / m.cos(m.PI / 32), 32); ring(a, 'y', cx, zp, cy - face / 2 - 8, cy + face / 2 + 8, bore / 2, hubD / 2, 24);
      a.rect(a.X0, cy - face / 2, a.X1, cy + face / 2); a.rect(cx - tipR, cy - face / 2, cx + tipR, cy + face / 2, 'EQUIP-DETAIL'); a.rect(cx - hubD / 2, cy - face / 2 - 8, cx + hubD / 2, cy + face / 2 + 8, 'EQUIP-DETAIL');
      a.log('Added the toothed rack bar with its mounting holes and the pinion with hub and bore meshing on top (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic flat belt crowned pulley',
    desc: (v) => `Flat belt pulley, ${v.D} mm across and ${v.face} mm wide with a crowned rim: a rim with a raised middle, ${v.n} spokes, a hub standing proud on one side and a bore with a keyway.`,
    vs: [[160, 60, 24, 4], [250, 90, 35, 5], [400, 120, 50, 6]].map(([D, face, bore, n]) => V(`${D} mm, ${face} mm face, ${n} spokes`, D, D, face + 12, { D, face, bore, n })),
    build: (a, v) => {
      const { D, face, bore, n } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, cr = D * 0.012, R0 = D / 2 - cr, rimT = D * 0.04 + 2, hubD = bore * 2, K = 6;
      for (let k = 0; k < K; k++) { const u = ((k + 0.5) / K) * 2 - 1; ring(a, 'z', cx, cy, z0 + (face * k) / K, z0 + (face * (k + 1)) / K, R0 - rimT, R0 + cr * (1 - u * u), 36); }
      ring(a, 'z', cx, cy, z0, a.Z1, keyIn(bore / 2), hubD / 2, 32); spokes(a, cx, cy, z0 + face * 0.3, z0 + face * 0.7, hubD / 2 - 1, R0 - rimT + 1, n, D * 0.045);
      a.circ(cx, cy, D / 2); a.circ(cx, cy, R0 - rimT, 'EQUIP-DETAIL'); a.circ(cx, cy, hubD / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, bore / 2, 'EQUIP-DETAIL');
      for (let i = 0; i < n; i++) { const th = (TAU * i) / n + 0.3; a.line(cx + (hubD / 2) * m.cos(th), cy + (hubD / 2) * m.sin(th), cx + (R0 - rimT) * m.cos(th), cy + (R0 - rimT) * m.sin(th), 'EQUIP-DETAIL'); }
      a.log('Added the crowned rim, the spokes, the hub and the bore with its keyway (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic roller chain length',
    desc: (v) => `Roller chain, ${v.P} mm pitch, ${v.n} pitches long, lying flat: alternating inner and outer plate pairs with round ends, a roller on every pin and pins standing proud of the outer plates.`,
    vs: [[12.7, 7.75, 8.51, 12.07, 1.6, 8], [19.05, 11.68, 12.07, 18.1, 2.4, 7], [25.4, 17.02, 15.88, 24.1, 3.2, 6]].map(([P, b1, d1, h2, t, n]) => V(`${P} mm pitch, ${n} pitches`, n * P + h2, b1 + 4 * t + 2.4, h2, { P, b1, d1, h2, t, n })),
    build: (a, v) => {
      const { P, b1, d1, h2, t, n } = v, y = a.cy, zc = a.Z0 + h2 / 2, xs = (i) => a.X0 + h2 / 2 + i * P, ye = b1 / 2 + 2 * t + 1.2;
      for (let i = 0; i <= n; i++) { a.ycyl(y - ye, y + ye, xs(i), zc, d1 * 0.24, 10); a.ycyl(y - b1 / 2, y + b1 / 2, xs(i), zc, d1 / 2, 16); }
      for (let k = 0; k < n; k++) { const inner = k % 2 === 0, o0 = inner ? b1 / 2 : b1 / 2 + t, o1 = o0 + t; for (const s of [-1, 1]) bar(a, 'y', [xs(k), zc], [xs(k + 1), zc], h2 * 0.86, s > 0 ? y + o0 : y - o1, s > 0 ? y + o1 : y - o0, true); a.rect(xs(k) - h2 * 0.43, y - o1, xs(k + 1) + h2 * 0.43, y + o1, 'EQUIP-DETAIL'); }
      a.rect(a.X0 + h2 / 2 - h2 * 0.43, y - b1 / 2 - 2 * t, xs(n) + h2 * 0.43, y + b1 / 2 + 2 * t);
      a.log('Added the inner and outer plate pairs, a roller and a pin on every joint (plan and 3D).');
    } }),

];
transmission.push(
  fam({ cat: 'machine/transmission', title: 'Generic shaft collar',
    desc: (v) => ({ set: `One-piece set screw shaft collar for a ${v.bore} mm shaft, axis to the front: a ring with a bore and a raised boss on top carrying a socket set screw.`, clamp: `One-piece clamping shaft collar for a ${v.bore} mm shaft, axis to the front: a ring with a bore, a slit across the top and a socket cap screw clamping the slit.`, two: `Two-piece clamping shaft collar for a ${v.bore} mm shaft, axis to the front: two half rings with a bore, split on the horizontal plane and held by two socket cap screws.` })[v.t],
    vs: [['set screw, 20 mm bore', 'set', 20, 40, 14], ['clamp, 25 mm bore', 'clamp', 25, 45, 16], ['two-piece, 30 mm bore', 'two', 30, 56, 16], ['two-piece, 50 mm bore', 'two', 50, 82, 20]].map(([l, t, bore, OD, w]) => V(l, OD, w, OD, { t, bore, OD, w })),
    build: (a, v) => {
      const { t, bore, OD, w } = v, cx = a.cx, y = a.cy, zc = a.Z0 + OD / 2, y0 = y - w / 2, y1 = y + w / 2, R = OD / 2;
      if (t === 'set') {
        const Rm = R * 0.88, ss = bore * 0.12; ring(a, 'y', cx, zc, y0, y1, bore / 2, Rm, 32); a.cyl(cx, y, zc + Rm - 2, zc + R, ss * 1.7, 14); a.cyl(cx, y, zc + R - 0.5, zc + R, ss, 8);
        a.rect(cx - Rm, y0, cx + Rm, y1); a.circ(cx, y, ss * 1.7, 'EQUIP-DETAIL'); a.line(cx - bore / 2, y0, cx - bore / 2, y1, 'EQUIP-HIDDEN'); a.line(cx + bore / 2, y0, cx + bore / 2, y1, 'EQUIP-HIDDEN');
      } else if (t === 'clamp') {
        const gap = 0.07; ring(a, 'y', cx, zc, y0, y1, bore / 2, R, 32, m.PI / 2 + gap, TAU - 2 * gap); a.xcyl(cx - R * 0.55, cx + R * 0.55, y, zc + R * 0.8, bore * 0.09, 10); a.xcyl(cx - R * 0.68, cx - R * 0.55, y, zc + R * 0.8, bore * 0.17, 12);
        a.rect(cx - R, y0, cx + R, y1); a.line(cx - R * 0.1, y0, cx - R * 0.1, y1, 'EQUIP-DETAIL'); a.line(cx + R * 0.1, y0, cx + R * 0.1, y1, 'EQUIP-DETAIL');
      } else {
        const g = 0.5 / R; ring(a, 'y', cx, zc, y0, y1, bore / 2, R, 20, g, m.PI - 2 * g); ring(a, 'y', cx, zc, y0, y1, bore / 2, R, 20, m.PI + g, m.PI - 2 * g);
        const xo = (bore / 2 + R) / 2, zt = zc + m.sqrt(R * R - xo * xo);
        for (const s of [-1, 1]) { const xx = cx + s * xo; a.cyl(xx, y, zc - R * 0.5, zt + 0.01, bore * 0.09, 10); a.cyl(xx, y, zt - 2, zt + 1.5, bore * 0.16, 12); a.circ(xx, y, bore * 0.16, 'EQUIP-DETAIL'); }
        a.rect(cx - R, y0, cx + R, y1); a.line(cx - R, y, cx + R, y, 'EQUIP-DETAIL');
      }
      a.log('Added the ring with its bore and ' + (t === 'set' ? 'the set screw boss' : t === 'clamp' ? 'the slit and clamp screw' : 'the two halves and their screws') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic universal joint',
    desc: (v) => `Cardan universal joint for ${v.d} mm shafts, lying on its side: two hubs with bores, two forks with their ears at right angles, a cross of four arms and a bearing cup on each arm.`,
    vs: [[10], [16], [25]].map(([d]) => { const K = 1.7 * d, E = 0.88 * K; return V(`${d} mm bore`, 4 * K, 2 * E, 2 * E, { d, K, E }); }),
    build: (a, v) => {
      const { d, K, E } = v, y = a.cy, zc = a.Z0 + E, xc = a.cx, hubL = K, q = 0.55 * K, eT = 0.18 * K, x0 = a.X0, x1 = a.X1, rt = K * 0.45;
      ring(a, 'x', y, zc, x0, x0 + hubL, d / 2, K / 2, 24); ring(a, 'x', y, zc, x0 + hubL, x0 + hubL + 0.3 * K, 0, K * 0.5, 24);
      ring(a, 'x', y, zc, x1 - hubL, x1, d / 2, K / 2, 24); ring(a, 'x', y, zc, x1 - hubL - 0.3 * K, x1 - hubL, 0, K * 0.5, 24);
      for (const s of [-1, 1]) { const ya = s > 0 ? y + q : y - q - eT; a.box(x0 + hubL + 0.3 * K, ya, zc - rt, xc, ya + eT, zc + rt); a.ycyl(ya, ya + eT, xc, zc, rt, 16); a.ycyl(s > 0 ? y + q + eT : y - q - eT - 0.15 * K, s > 0 ? y + q + eT + 0.15 * K : y - q - eT, xc, zc, K * 0.26, 14); }
      for (const s of [-1, 1]) { const za = s > 0 ? zc + q : zc - q - eT; a.box(xc, y - rt, za, x1 - hubL - 0.3 * K, y + rt, za + eT); a.cyl(xc, y, za, za + eT, rt, 16); a.cyl(xc, y, s > 0 ? zc + q + eT : zc - q - eT - 0.15 * K, s > 0 ? zc + q + eT + 0.15 * K : zc - q - eT, K * 0.26, 14); }
      a.ycyl(y - q - eT, y + q + eT, xc, zc, K * 0.13, 10); a.cyl(xc, y, zc - q - eT, zc + q + eT, K * 0.13, 10);
      a.rect(x0, y - K / 2, x0 + hubL, y + K / 2); a.rect(x1 - hubL, y - K / 2, x1, y + K / 2); a.rect(x0 + hubL, y - q - eT, xc, y + q + eT, 'EQUIP-DETAIL'); a.rect(xc, y - rt, x1 - hubL, y + rt, 'EQUIP-DETAIL'); a.circ(xc, y, K * 0.26, 'EQUIP-DETAIL');
      a.log('Added the two hubs, the two forks at right angles, the cross and the bearing cups (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic bellows servo coupling',
    desc: (v) => `Bellows coupling, ${v.OD} mm across for ${v.b1} mm and ${v.b2} mm shafts, lying on its side: two clamp hubs with a clamp screw on top each and a corrugated metal bellows between them.`,
    vs: [[19, 6, 8, 25], [25, 8, 10, 31], [40, 14, 16, 50]].map(([OD, b1, b2, L]) => V(`${OD} mm across, ${b1} to ${b2} mm bores`, L, OD, OD, { OD, b1, b2, L })),
    build: (a, v) => {
      const { OD, b1, b2, L } = v, y = a.cy, zc = a.Z0 + OD / 2, x0 = a.X0, x1 = a.X1, hl = L * 0.3, R = OD / 2 * 0.9, bl = L - 2 * hl;
      ring(a, 'x', y, zc, x0, x0 + hl, b1 / 2, R, 24); ring(a, 'x', y, zc, x1 - hl, x1, b2 / 2, R, 24);
      const n = m.max(5, m.round(bl / (OD * 0.12))), pts = [], rd = []; for (let i = 0; i <= 2 * n; i++) { pts.push([x0 + hl + (bl * i) / (2 * n), y, zc]); rd.push(i % 2 ? OD / 2 * 0.62 : OD / 2 * 0.8); } a.tube(pts, rd, 20);
      for (const [xa, xb] of [[x0, x0 + hl], [x1 - hl, x1]]) { const xm = (xa + xb) / 2; a.cyl(xm, y, zc + R * 0.7, zc + OD / 2, OD * 0.1, 10); a.rect(xa, y - R, xb, y + R); a.circ(xm, y, OD * 0.1, 'EQUIP-DETAIL'); }
      a.rect(x0 + hl, y - OD / 2 * 0.8, x1 - hl, y + OD / 2 * 0.8, 'EQUIP-DETAIL');
      a.log('Added the two clamp hubs with their screws and the corrugated bellows (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic thrust ball bearing',
    desc: (v) => `Single direction thrust ball bearing for a ${v.B} mm shaft, ${v.D} mm outside diameter: a shaft washer and a housing washer with ${v.n} balls held by a cage ring between them.`,
    vs: [[20, 40, 14, 10], [35, 62, 18, 12], [50, 78, 22, 14]].map(([B, D, H, n]) => V(`${B} mm bore, ${D} mm outside, ${n} balls`, D, D, H, { B, D, H, n })),
    build: (a, v) => {
      const { B, D, H, n } = v, cx = a.cx, cy = a.cy, tw = H * 0.28, rb = H * 0.22, rp = (B + D) / 4, zm = a.Z0 + H / 2;
      ring(a, 'z', cx, cy, a.Z0, a.Z0 + tw, B / 2, D / 2 - 1, 32); ring(a, 'z', cx, cy, a.Z1 - tw, a.Z1, B / 2 + 2, D / 2, 32);
      ring(a, 'z', cx, cy, zm - rb * 0.35, zm + rb * 0.35, rp - rb * 1.3, rp + rb * 1.3, 32);
      for (let i = 0; i < n; i++) { const t = (TAU * i) / n; a.ell(cx + rp * m.cos(t), cy + rp * m.sin(t), zm, rb, rb, rb, 10, 6); }
      a.circ(cx, cy, D / 2); a.circ(cx, cy, B / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, rp, 'EQUIP-HIDDEN'); for (let i = 0; i < n; i++) { const t = (TAU * i) / n; a.circ(cx + rp * m.cos(t), cy + rp * m.sin(t), rb, 'EQUIP-HIDDEN'); }
      a.log('Added the shaft washer, the housing washer, the cage ring and the balls (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic tapered roller bearing',
    desc: (v) => `Tapered roller bearing, ${v.B} mm bore, ${v.D} mm outside diameter, ${v.W} mm wide: an inner cone with a tapered track, an outer cup with a cutaway window on the front and ${v.n} tapered rollers between them.`,
    vs: [[25, 52, 16, 12], [40, 80, 20, 14], [60, 110, 25, 16]].map(([B, D, W, n]) => V(`${B} mm bore, ${D} mm outside`, D, D, W, { B, D, W, n })),
    build: (a, v) => {
      const { B, D, W, n } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, rm = (B + D) / 4, tn = m.tan((13 * m.PI) / 180), rr0 = (D - B) / 2 * 0.2, K = 6, zm = z0 + W / 2;
      const rc = (z) => rm + (z - zm) * tn, rrad = (z) => rr0 + (z - zm) * 0.045;
      for (let k = 0; k < K; k++) { const za = z0 + (W * k) / K, zb = z0 + (W * (k + 1)) / K, zk = (za + zb) / 2; ring(a, 'z', cx, cy, za, zb, B / 2, m.min(rc(zk) - rrad(zk) - 0.2, D / 2 - 3), 32); ring(a, 'z', cx, cy, za, zb, m.max(rc(zk) + rrad(zk) + 0.2, B / 2 + 4), D / 2, 28, -m.PI / 2 + 0.75, TAU - 1.5); }
      ring(a, 'z', cx, cy, z0 + W * 0.84, z0 + W, B / 2, rc(z0 + W) - rrad(z0 + W) + 2.2, 32);
      for (let i = 0; i < n; i++) { const t = (TAU * i) / n, za = z0 + W * 0.12, zb = z0 + W * 0.84; a.tube([[cx + rc(za) * m.cos(t), cy + rc(za) * m.sin(t), za], [cx + rc(zb) * m.cos(t), cy + rc(zb) * m.sin(t), zb]], [rrad(za), rrad(zb)], 8); }
      a.circ(cx, cy, D / 2); a.circ(cx, cy, B / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, rm, 'EQUIP-HIDDEN');
      a.log('Added the inner cone, the outer cup and the tapered rollers (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic rod end bearing',
    desc: (v) => `${v.fem ? 'Female' : 'Male'} rod end with a ${v.bore} mm bore, standing on its shank: a round head with a spherical ball ring and a bore, a hex section on the neck and ${v.fem ? 'a threaded socket in the shank' : 'an M' + v.d + ' thread drawn as rings'}.`,
    vs: [['male, M6, 6 mm bore', 6, 6, 22, 7, 9, 18, 8, false], ['male, M8, 8 mm bore', 8, 8, 26, 9, 12, 22, 10, false], ['female, M10, 10 mm bore', 10, 10, 32, 10.5, 14, 24, 12, true], ['female, M12, 12 mm bore', 12, 12, 38, 12, 16, 28, 14, true]].map(([l, d, bore, OD, hw, bw, sl, nl, fem]) => { const hex = d * 1.5; return V(l, OD, m.max(bw, hex * 1.16), sl + nl + OD, { d, bore, OD, hw, bw, sl, nl, fem, hex }); }),
    build: (a, v) => {
      const { d, bore, OD, hw, bw, sl, nl, fem, hex } = v, cx = a.cx, cy = a.cy, zc = a.Z1 - OD / 2, zh = a.Z0 + sl, rb = OD * 0.31;
      if (fem) { ring(a, 'z', cx, cy, a.Z0, zh, d * 0.45, hex * 0.58, 20); ring(a, 'z', cx, cy, a.Z0, zh * 0.0 + 1, d * 0.45, hex * 0.62, 20); } else { a.cyl(cx, cy, a.Z0 + 1, zh, d / 2 * 0.84, 14); thread(a, cx, cy, a.Z0 + 1, zh, d / 2, d / 2 * 0.84, ISO[d]?.p ?? 1.25, 20); a.cone(cx, cy, a.Z0, a.Z0 + 1.2, d / 2 * 0.7, d / 2 * 0.84, 14); }
      ring(a, 'z', cx, cy, zh, zh + nl * 0.55, 0, hexRo(hex / 2), 18, 0); a.cone(cx, cy, zh + nl * 0.55, zc - OD / 2 + 2, hex * 0.5, hw * 0.55, 18);
      ring(a, 'y', cx, zc, cy - hw / 2, cy + hw / 2, rb, OD / 2, 32); ring(a, 'y', cx, zc, cy - bw / 2, cy + bw / 2, bore / 2, rb + 0.4, 28);
      a.rect(cx - OD / 2, cy - hw / 2, cx + OD / 2, cy + hw / 2); a.rect(cx - rb, cy - bw / 2, cx + rb, cy + bw / 2, 'EQUIP-DETAIL'); a.poly(hexPts(cx, cy, hex), 'EQUIP-DETAIL'); a.circ(cx, cy, d / 2, 'EQUIP-HIDDEN');
      a.log('Added the ' + (fem ? 'threaded socket shank' : 'threaded shank') + ', the hex section, the head and the ball ring with its bore (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic splined shaft',
    desc: (v) => `Splined shaft with ${v.N} straight splines, ${v.D} mm across the splines and ${v.L} mm long, lying on its side: a splined section with ${v.N} straight teeth, a plain shoulder, a smaller journal with a groove for a ring and chamfered ends.`,
    vs: [[6, 28, 140], [8, 36, 180], [10, 52, 220]].map(([N, D, L]) => V(`${N} splines, ${D} mm, ${L} mm long`, L, D, D, { N, D, L })),
    build: (a, v) => {
      const { N, D, L } = v, y = a.cy, zc = a.Z0 + D / 2, x0 = a.X0, R = D / 2, rm = R * 0.86, ls = L * 0.55, tw = (m.PI * D) / N * 0.26;
      a.xcyl(x0 + 2, x0 + ls, y, zc, rm, 24); for (let i = 0; i < N; i++) { const th = (TAU * i) / N, c = m.cos(th), s = m.sin(th), P = (r, w) => [y + r * c - w * s, zc + r * s + w * c]; prismX(a, [P(rm - 0.5, -tw / 2), P(R, -tw / 2), P(R, tw / 2), P(rm - 0.5, tw / 2)], x0 + 2, x0 + ls); }
      a.tube([[x0, y, zc], [x0 + 2, y, zc]], [rm * 0.8, rm], 24);
      a.xcyl(x0 + ls, x0 + ls + 5, y, zc, R, 28); const rj = R * 0.74; a.xcyl(x0 + ls + 5, a.X1 - 2, y, zc, rj, 24); a.xcyl(a.X1 - 2, a.X1 - 0.01, y, zc, rj * 0.85, 24);
      a.xcyl(a.X1 - L * 0.12 - 3, a.X1 - L * 0.12, y, zc, rj * 0.9, 24);
      a.rect(x0, y - R, x0 + ls, y + R); a.line(x0, y - rm, x0 + ls, y - rm, 'EQUIP-DETAIL'); a.line(x0, y + rm, x0 + ls, y + rm, 'EQUIP-DETAIL'); a.rect(x0 + ls, y - rj, a.X1, y + rj); a.line(x0 + ls + 5, y - R, x0 + ls + 5, y + R, 'EQUIP-DETAIL');
      a.log('Added the straight splines, the plain shoulder, the journal with its ring groove and the chamfers (plan and 3D).');
    } }),
);

// ============================================================================================= FRAMES
const frames = [
  fam({ cat: 'machine/frames', title: 'Generic welded pedestal riser',
    desc: (v) => `Welded riser pedestal, ${v.H} mm high: a base plate with four bolt holes, a smaller top plate with four holes and two side walls, each with a slotted lightening window.`,
    vs: [[200, 150, 100, 16], [250, 180, 200, 20], [300, 220, 300, 25]].map(([TW, TD, H, t]) => V(`${H} mm high, ${TW} x ${TD} mm top`, TW + 70, TD + 70, H, { TW, TD, H, t })),
    build: (a, v) => {
      const { TW, TD, H, t } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, BW = TW + 70, BD = TD + 70, wt = t * 0.55;
      plateHoles(a, cx - BW / 2, cy - BD / 2, cx + BW / 2, cy + BD / 2, z0, z0 + t, [-1, 1].flatMap((sx) => [-1, 1].map((sy) => ({ x: cx + sx * (BW / 2 - 20), y: cy + sy * (BD / 2 - 20), rx: 9, ry: 9 }))), 6);
      plateHoles(a, cx - TW / 2, cy - TD / 2, cx + TW / 2, cy + TD / 2, z0 + H - t, z0 + H, [-1, 1].flatMap((sx) => [-1, 1].map((sy) => ({ x: cx + sx * (TW / 2 - 25), y: cy + sy * (TD / 2 - 25), rx: 7, ry: 7 }))), 6);
      for (const s of [-1, 1]) { const ya = s > 0 ? cy + TD / 2 - wt - 10 : cy - TD / 2 + 10; plateHoles(a, cx - TW / 2 + 10, z0 + t, cx + TW / 2 - 10, z0 + H - t, ya, ya + wt, [{ x: cx, y: z0 + H / 2, rx: TW / 2 - 40, ry: (H - 2 * t) / 2 - 16 }], 20, 'y'); }
      a.rect(cx - BW / 2, cy - BD / 2, cx + BW / 2, cy + BD / 2); a.rect(cx - TW / 2, cy - TD / 2, cx + TW / 2, cy + TD / 2, 'EQUIP-DETAIL');
      a.log('Added the base plate, the top plate with their holes and the two windowed side walls (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic steel section length',
    desc: (v) => `${v.name} steel section, ${v.Ln} mm long, standing on end so the profile shows from the front: ${v.t === 'I' ? 'a web between two flanges' : v.t === 'C' ? 'a web with two flanges turned to the front' : v.t === 'L' ? 'two legs of equal length' : v.t === 'T' ? 'a flange over a stem' : v.t === 'R' ? 'a hollow rectangular section with a wall all round' : 'a round hollow section with a wall all round'}.`,
    vs: [['I-beam 120 x 64', 'I', 'I-beam', 64, 120, 600], ['channel 100 x 50', 'C', 'Channel', 50, 100, 600], ['equal angle 75 x 75 x 8', 'L', 'Equal angle', 75, 75, 600], ['rectangular tube 80 x 40 x 4', 'R', 'Rectangular hollow', 40, 80, 600], ['round tube 60.3 x 4', 'O', 'Round hollow', 60.3, 60.3, 600], ['T-bar 60 x 60 x 7', 'T', 'T-bar', 60, 60, 600]].map(([l, t, name, b, h, Ln]) => V(`${l}, ${Ln} mm`, b, Ln, h, { t, name, b, h, Ln })),
    build: (a, v) => {
      const { t, b, h } = v, cx = a.cx, y0 = a.YF, y1 = a.YB, z0 = a.Z0, x0 = cx - b / 2, x1 = cx + b / 2, bx = (xa, za, xb, zb) => a.box(xa, y0, za, xb, y1, zb);
      if (t === 'I') { const tf = 7.3, tw = 4.4; bx(x0, z0, x1, z0 + tf); bx(x0, z0 + h - tf, x1, z0 + h); bx(cx - tw / 2, z0 + tf, cx + tw / 2, z0 + h - tf); }
      else if (t === 'C') { const tf = 7.5, tw = 5; bx(x0, z0, x0 + tw, z0 + h); bx(x0, z0, x1, z0 + tf); bx(x0, z0 + h - tf, x1, z0 + h); }
      else if (t === 'L') { const th = 8; bx(x0, z0, x1, z0 + th); bx(x0, z0, x0 + th, z0 + h); }
      else if (t === 'T') { const th = 7; bx(x0, z0 + h - th, x1, z0 + h); bx(cx - th / 2, z0, cx + th / 2, z0 + h - th); }
      else if (t === 'R') { const th = 4; bx(x0, z0, x1, z0 + th); bx(x0, z0 + h - th, x1, z0 + h); bx(x0, z0 + th, x0 + th, z0 + h - th); bx(x1 - th, z0 + th, x1, z0 + h - th); }
      else ring(a, 'y', cx, z0 + h / 2, y0, y1, h / 2 - 4, h / 2, 32);
      a.rect(x0, y0, x1, y1); a.line(cx, y0, cx, y1, 'EQUIP-DETAIL');
      a.log('Added the ' + v.name.toLowerCase() + ' section along its length (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic machine guard mesh panel',
    desc: (v) => `Machine guard panel, ${v.W} mm wide and ${v.H} mm high: two posts on base plates, a square tube frame holding a woven mesh of wires on a 30 mm grid${v.door ? ', a hinged door leaf with two hinges, a handle bar and a latch' : ''}.`,
    vs: [['fixed panel, 600 x 900 mm', 600, 900, false], ['fixed panel, 1000 x 1200 mm', 1000, 1200, false], ['panel with hinged door, 1000 x 1200 mm', 1000, 1200, true]].map(([l, W, H, door]) => V(l, W + 100, 150, H, { W, H, door })),
    build: (a, v) => {
      const { W, H, door } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, pw = 40, fw = 25, bp = 150, x0 = cx - W / 2 - 0, x1 = cx + W / 2, zb = z0 + 100;
      for (const s of [-1, 1]) { const xp = s < 0 ? x0 - pw : x1; a.box(xp, cy - pw / 2, z0 + 8, xp + pw, cy + pw / 2, z0 + H); plateHoles(a, xp + pw / 2 - bp / 2 + 0, cy - bp / 2 + 0, xp + pw / 2 + bp / 2 - 0, cy + bp / 2, z0, z0 + 8, [{ x: xp + pw / 2 - 45, y: cy, rx: 7, ry: 7 }, { x: xp + pw / 2 + 45, y: cy, rx: 7, ry: 7 }], 6); }
      const panel = (xa, xb, za, zb2) => {
        a.frame(xa, za, xb, zb2, cy - fw / 2, cy + fw / 2, fw * 0.8);
        for (let x = xa + fw * 0.8 + 15; x < xb - fw * 0.8; x += 30) a.box(x - 1, cy - 1.5, za + fw * 0.8, x + 1, cy + 1.5, zb2 - fw * 0.8);
        for (let z = za + fw * 0.8 + 15; z < zb2 - fw * 0.8; z += 30) a.box(xa + fw * 0.8, cy - 1.5, z - 1, xb - fw * 0.8, cy + 1.5, z + 1);
      };
      if (!door) { panel(x0, x1, zb, z0 + H); a.rect(x0, cy - fw / 2, x1, cy + fw / 2, 'EQUIP-DETAIL'); }
      else {
        const dw = W * 0.55; panel(x0, x1 - dw, zb, z0 + H); panel(x1 - dw + 4, x1, zb + 8, z0 + H - 8);
        for (const zh of [zb + 160, z0 + H - 160]) { a.cyl(x1 - dw + 2, cy - fw / 2 - 5, zh - 25, zh + 25, 7, 10); a.box(x1 - dw + 2, cy - fw / 2 - 10, zh - 25, x1 - dw + 30, cy - fw / 2, zh + 25); }
        a.xcyl(x1 - fw * 1.6, x1 - fw * 1.6 + 130, cy - fw / 2 - 12, zb + (H - 100) / 2 + 120 - 0, 8, 10); a.box(x1 - fw * 1.6 - 5, cy - fw / 2 - 12, zb + (H - 100) / 2 + 105, x1 - fw * 1.6 + 5, cy - fw / 2 - 1, zb + (H - 100) / 2 + 135);
        a.box(x1 - 60, cy - fw / 2 - 10, zb + (H - 100) / 2 - 20, x1 - 15, cy + fw / 2, zb + (H - 100) / 2 + 20);
        a.rect(x0, cy - fw / 2, x1 - dw, cy + fw / 2, 'EQUIP-DETAIL'); a.rect(x1 - dw + 4, cy - fw / 2 - 12, x1, cy + fw / 2, 'EQUIP-DETAIL');
      }
      a.rect(x0 - pw, cy - pw / 2, x0, cy + pw / 2); a.rect(x1, cy - pw / 2, x1 + pw, cy + pw / 2); a.rect(x0 - pw, cy - bp / 2, x0 + 110, cy + bp / 2, 'EQUIP-HIDDEN'); a.rect(x1 - 70, cy - bp / 2, x1 + pw, cy + bp / 2, 'EQUIP-HIDDEN');
      a.log('Added the posts on base plates, the tube frame with its woven mesh' + (door ? ', the door leaf with hinges, handle and latch' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic worm gearbox housing',
    desc: (v) => `Cast right-angle worm gearbox housing, ${v.C} mm centre distance: a foot plate with four bolt holes, a chamfered body, a keyed input shaft stub on the right with a plain cover on the left, a round output boss with a hollow bore and four cap screws on the front and back, a fill plug and a drain plug.`,
    vs: [[40], [63], [100]].map(([C]) => { const hx = 1.7 * C, fx = hx + 0.5 * C, left = m.max(hx / 2 + 0.08 * C, fx / 2), right = hx / 2 + 0.63 * C, ft = 0.1 * C + 3; return V(`${C} mm centre distance`, left + right, 1.8 * C, ft + 2.25 * C, { C, hx, fx, left, ft }); }),
    build: (a, v) => {
      const { C, hx, fx, left, ft } = v, cy = a.cy, z0 = a.Z0, xh = a.X0 + left, hy = 1.5 * C, fy = hy + 0.3 * C, zw = z0 + ft + 0.5 * C, zo = zw + C, ztop = z0 + ft + 2.1 * C, ch = 0.12 * C;
      plateHoles(a, xh - fx / 2, cy - fy / 2, xh + fx / 2, cy + fy / 2, z0, z0 + ft, [-1, 1].flatMap((sx) => [-1, 1].map((sy) => ({ x: xh + sx * (fx / 2 - 0.12 * C), y: cy + sy * (fy / 2 - 0.12 * C), rx: 0.065 * C, ry: 0.065 * C }))), 6);
      const oct = [[-hx / 2 + ch, -hy / 2], [hx / 2 - ch, -hy / 2], [hx / 2, -hy / 2 + ch], [hx / 2, hy / 2 - ch], [hx / 2 - ch, hy / 2], [-hx / 2 + ch, hy / 2], [-hx / 2, hy / 2 - ch], [-hx / 2, -hy / 2 + ch]].map(([x, y]) => [xh + x, cy + y]);
      a.prism(oct, z0 + ft, ztop); a.box(xh - hx / 2 + 0.1 * C, cy - hy / 2 + 0.1 * C, ztop, xh + hx / 2 - 0.1 * C, cy + hy / 2 - 0.1 * C, ztop + 0.04 * C);
      ring(a, 'x', cy, zw, xh + hx / 2, xh + hx / 2 + 0.08 * C, 0.16 * C, 0.42 * C, 28); ring(a, 'x', cy, zw, xh - hx / 2 - 0.08 * C, xh - hx / 2, 0, 0.42 * C, 28);
      a.xcyl(xh + hx / 2 + 0.08 * C, xh + hx / 2 + 0.63 * C, cy, zw, 0.16 * C, 18); a.box(xh + hx / 2 + 0.25 * C, cy - 0.025 * C, zw + 0.15 * C, xh + hx / 2 + 0.58 * C, cy + 0.025 * C, zw + 0.19 * C);
      for (const s of [-1, 1]) { const y0 = s > 0 ? cy + hy / 2 : cy - hy / 2 - 0.1 * C, y1 = y0 + 0.1 * C; ring(a, 'y', xh, zo, y0, y1, 0.28 * C, 0.58 * C, 32); for (let i = 0; i < 4; i++) { const th = (TAU * i) / 4 + m.PI / 4; a.ycyl(y0, y1 + 0.02 * C, xh + 0.43 * C * m.cos(th), zo + 0.43 * C * m.sin(th), 0.035 * C, 8); } }
      ring(a, 'y', xh, zo, cy - hy / 2, cy + hy / 2, 0.28 * C, 0.3 * C, 28);
      a.cyl(xh - hx * 0.25, cy, ztop + 0.04 * C, ztop + 0.1 * C + 0.04 * C, 0.07 * C, 6); a.cyl(xh + hx * 0.25, cy, ztop + 0.04 * C, ztop + 0.15 * C, 0.05 * C, 10); a.xcyl(xh - hx / 2 - 0.05 * C, xh - hx / 2, cy, z0 + ft + 0.09 * C, 0.04 * C, 8);
      a.rect(xh - fx / 2, cy - fy / 2, xh + fx / 2, cy + fy / 2); a.poly(oct, 'EQUIP-DETAIL'); a.rect(xh + hx / 2, cy - 0.16 * C, xh + hx / 2 + 0.63 * C, cy + 0.16 * C, 'EQUIP-DETAIL'); a.rect(xh - 0.58 * C, cy - hy / 2 - 0.1 * C, xh + 0.58 * C, cy + hy / 2 + 0.1 * C, 'EQUIP-DETAIL');
      a.log('Added the foot plate, the chamfered body, the keyed input stub and cover, the output bosses with their bore and screws, and the plugs (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic motor flange adapter plate',
    desc: (v) => `Square motor adapter plate, ${v.S} mm across and ${v.t} mm thick: a through bore, a raised round spigot ring around it of ${v.pilot} mm, four bolt holes spaced on a ${v.BC} mm pitch diameter and four socket cap screws standing in them.`,
    vs: [[120, 80, 100, 7, 12], [160, 110, 130, 9, 14], [200, 130, 165, 11, 16]].map(([S, pilot, BC, hd, t]) => V(`${S} mm square, ${pilot} mm spigot`, S, S, t + 8, { S, pilot, BC, hd, t })),
    build: (a, v) => {
      const { S, pilot, BC, hd, t } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, rb = BC / 2 / m.SQRT2, bore = pilot * 0.7;
      const pts = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([sx, sy]) => ({ x: cx + sx * rb, y: cy + sy * rb, rx: hd / 2 + 0.3, ry: hd / 2 + 0.3 }));
      plateHoles(a, cx - S / 2, cy - S / 2, cx + S / 2, cy + S / 2, z0, z0 + t, [{ x: cx, y: cy, rx: bore / 2, ry: bore / 2 }, ...pts], 12);
      ring(a, 'z', cx, cy, z0 + t, z0 + t + 6, bore / 2, pilot / 2, 32);
      for (const p of pts) { a.cyl(p.x, p.y, z0 + t - 2, z0 + t + 8, hd * 0.5 * 0.96, 10); a.circ(p.x, p.y, hd * 0.9, 'EQUIP-DETAIL'); }
      a.rect(cx - S / 2, cy - S / 2, cx + S / 2, cy + S / 2); a.circ(cx, cy, pilot / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, BC / 2, 'EQUIP-HIDDEN');
      a.log('Added the plate with its bore and holes, the raised spigot ring and the four cap screws (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic two-bolt flange bearing unit',
    desc: (v) => `Two-bolt flange bearing unit for a ${v.B} mm shaft, standing with the shaft to the front: an obround flange plate with two bolt holes, a round boss, a bearing insert with a bore, a set screw and a grease nipple.`,
    vs: [[20, 100, 38, 12, 14], [30, 130, 48, 14, 18], [40, 160, 56, 16, 22]].map(([B, L, W, t, bh]) => V(`${B} mm bore, ${L} mm flange`, L, t + bh + 6, W, { B, L, W, t, bh })),
    build: (a, v) => {
      const { B, L, W, t, bh } = v, cx = a.cx, zc = a.Z0 + W / 2, yF = a.YF, yP0 = yF + 3 + bh, yP1 = yP0 + t, R = W / 2, lx = L / 2 - R, hr = W * 0.12, Rb = W * 0.42;
      for (const s of [-1, 1]) ring(a, 'y', cx + s * lx, zc, yP0, yP1, hr, R, 24); a.box(cx - lx, yP0, zc - R, cx + lx, yP1, zc + R);
      ring(a, 'y', cx, zc, yF + 3, yP0 + 0.5, B / 2 * 1.4, Rb, 32); ring(a, 'y', cx, zc, yF, yP1 + 3, B / 2, Rb * 0.78, 32);
      a.cyl(cx, yF + 3 + bh * 0.5, zc + Rb - 2, zc + Rb + 2.5, W * 0.07, 8); a.cyl(cx + Rb * 0.55, yF + 3 + bh * 0.5, zc + Rb * 0.84, zc + Rb * 0.84 + 4, W * 0.04, 6);
      a.rect(cx - L / 2, yP0, cx + L / 2, yP1); a.rect(cx - Rb, yF + 3, cx + Rb, yP0, 'EQUIP-DETAIL'); a.rect(cx - Rb * 0.78, yF, cx + Rb * 0.78, yP1 + 3, 'EQUIP-DETAIL');
      a.log('Added the obround flange with two holes, the boss, the bearing insert with its bore, the set screw and the grease nipple (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic anchor base plate with column',
    desc: (v) => `Steel column base, ${v.S} mm square plate on a grout pad with ${v.nb} anchor bolts, nuts and washers, a ${v.col} column ${v.Hc} mm high and ${v.nb === 4 ? 'four' : 'eight'} triangular stiffeners.`,
    vs: [['4 bolts, square tube column', 250, 20, 4, 'square tube', 250, 100, 16], ['4 bolts, I-section column', 350, 25, 4, 'I-section', 300, 150, 24], ['8 bolts, round pipe column', 450, 28, 8, 'round pipe', 350, 168, 24]].map(([l, S, t, nb, col, Hc, cw, bd]) => V(l, S, S, 25 + t + Hc, { S, t, nb, col, Hc, cw, bd })),
    build: (a, v) => {
      const { S, t, nb, col, Hc, cw, bd } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, gz = 25, zp = z0 + gz, zt = zp + t, r = bd / 2, e = S / 2 - 40, I = ISO[bd], mh = 0.8 * bd;
      a.box(cx - S / 2 + 4, cy - S / 2 + 4, z0, cx + S / 2 - 4, cy + S / 2 - 4, zp);
      const bp = nb === 4 ? [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([sx, sy]) => [sx * e, sy * e]) : [[1, 1], [-1, 1], [-1, -1], [1, -1], [0, 1], [0, -1], [1, 0], [-1, 0]].map(([sx, sy]) => [sx * e, sy * e]);
      plateHoles(a, cx - S / 2, cy - S / 2, cx + S / 2, cy + S / 2, zp, zt, bp.map(([x, y]) => ({ x: cx + x, y: cy + y, rx: r + 2, ry: r + 2 })), 6);
      for (const [x, y] of bp) { a.cyl(cx + x, cy + y, z0 + 4, zt + 2.8 * bd, r * 0.84, 12); thread(a, cx + x, cy + y, zt + 0.4 * bd, zt + 2.8 * bd, r, r * 0.84, I.p, 12); ring(a, 'z', cx + x, cy + y, zt, zt + 0.2 * bd, r + 0.5, bd * 1.2, 16); nutAt(a, cx + x, cy + y, zt + 0.2 * bd, zt + 0.2 * bd + mh, bd, I.af); a.circ(cx + x, cy + y, bd * 1.2, 'EQUIP-DETAIL'); }
      if (col === 'square tube') { const th = 6; a.box(cx - cw / 2, cy - cw / 2, zt, cx + cw / 2, cy - cw / 2 + th, zt + Hc); a.box(cx - cw / 2, cy + cw / 2 - th, zt, cx + cw / 2, cy + cw / 2, zt + Hc); a.box(cx - cw / 2, cy - cw / 2 + th, zt, cx - cw / 2 + th, cy + cw / 2 - th, zt + Hc); a.box(cx + cw / 2 - th, cy - cw / 2 + th, zt, cx + cw / 2, cy + cw / 2 - th, zt + Hc); a.rect(cx - cw / 2, cy - cw / 2, cx + cw / 2, cy + cw / 2, 'EQUIP-DETAIL'); }
      else if (col === 'I-section') { a.box(cx - cw / 2, cy - cw / 2, zt, cx + cw / 2, cy - cw / 2 + 10, zt + Hc); a.box(cx - cw / 2, cy + cw / 2 - 10, zt, cx + cw / 2, cy + cw / 2, zt + Hc); a.box(cx - 3.5, cy - cw / 2 + 10, zt, cx + 3.5, cy + cw / 2 - 10, zt + Hc); a.rect(cx - cw / 2, cy - cw / 2, cx + cw / 2, cy + cw / 2, 'EQUIP-DETAIL'); }
      else { ring(a, 'z', cx, cy, zt, zt + Hc, r - 7 > 0 ? cw / 2 - 7 : 0, cw / 2, 32); a.circ(cx, cy, cw / 2, 'EQUIP-DETAIL'); }
      const g = 70; for (const s of [-1, 1]) { prismY(a, [[cx + s * cw / 2, zt], [cx + s * (cw / 2 + g), zt], [cx + s * cw / 2, zt + g * 1.5]], cy - 5, cy + 5); prismX(a, [[cy + s * cw / 2, zt], [cy + s * (cw / 2 + g), zt], [cy + s * cw / 2, zt + g * 1.5]], cx - 5, cx + 5); }
      a.rect(cx - S / 2, cy - S / 2, cx + S / 2, cy + S / 2);
      a.log('Added the grout pad, the base plate, the anchor bolts with washers and nuts, the column and the stiffeners (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic machine stand with shelf',
    desc: (v) => `Welded machine stand, ${v.W} x ${v.D} mm and ${v.H} mm high: four square tube legs on leveling feet, a top rail frame under a top plate with an overhang, a lower rail frame carrying a shelf${v.brace ? ' and diagonal flat bar braces on the back and both ends' : ''}.`,
    vs: [['800 x 500, 800 mm high', 800, 500, 800, false], ['1200 x 700, 850 mm high', 1200, 700, 850, false], ['1600 x 800, 900 mm high', 1600, 800, 900, true]].map(([l, W, D, H, brace]) => V(l, W, D, H, { W, D, H, brace })),
    build: (a, v) => {
      const { W, D, H, brace } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, lw = 50, ov = 25, tt = 12, fh = 40, lx = W / 2 - ov - 5, ly = D / 2 - ov - 5, zr0 = z0 + H - tt - 60, zs = z0 + fh + 150;
      a.box(cx - W / 2, cy - D / 2, z0 + H - tt, cx + W / 2, cy + D / 2, z0 + H);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const x = cx + sx * lx, y = cy + sy * ly; a.box(x - lw / 2, y - lw / 2, z0 + fh, x + lw / 2, y + lw / 2, zr0 + 60); a.cyl(x, y, z0, z0 + 8, 30, 14); a.cyl(x, y, z0 + 8, z0 + fh, 8, 8); a.cyl(x, y, z0 + fh - 4, z0 + fh, 14, 8); }
      for (const [zz, hh] of [[zr0, 40], [zs - 40, 40]]) { a.box(cx - lx, cy - ly + lw / 2 - 0, zz, cx + lx, cy - ly + lw / 2 + 0 + 30, zz + hh); a.box(cx - lx, cy + ly - lw / 2 - 30, zz, cx + lx, cy + ly - lw / 2, zz + hh); a.box(cx - lx + lw / 2, cy - ly + lw / 2, zz, cx - lx + lw / 2 + 30, cy + ly - lw / 2, zz + hh); a.box(cx + lx - lw / 2 - 30, cy - ly + lw / 2, zz, cx + lx - lw / 2, cy + ly - lw / 2, zz + hh); }
      a.box(cx - lx + 10, cy - ly + 10, zs, cx + lx - 10, cy + ly - 10, zs + 8);
      if (brace) { for (const s of [-1, 1]) { bar(a, 'y', [cx + s * (lx - 40), zs - 10], [cx - s * (lx - 40), zr0 + 60], 30, cy + ly - 8, cy + ly - 3, false); } for (const s of [-1, 1]) bar(a, 'x', [cy + s * (ly - 40), zs - 10], [cy - s * (ly - 40), zr0 + 60], 30, cx + lx - 8, cx + lx - 3, false); }
      a.rect(cx - W / 2, cy - D / 2, cx + W / 2, cy + D / 2); a.rect(cx - lx - lw / 2, cy - ly - lw / 2, cx + lx + lw / 2, cy + ly + lw / 2, 'EQUIP-HIDDEN'); for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.circ(cx + sx * lx, cy + sy * ly, 30, 'EQUIP-HIDDEN');
      a.log('Added the top plate, the tube legs with leveling feet, the rail frames and the shelf' + (brace ? ', and the diagonal braces' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic bolt-down pad eye',
    desc: (v) => `Bolt-down lifting pad eye, ${v.cls} class: a square base plate with four bolt holes and a flat lug standing on it with a round top and a ${v.hole} mm lifting hole.`,
    vs: [['light, 24 mm hole', 80, 10, 14, 24, 36], ['medium, 32 mm hole', 100, 12, 16, 32, 45], ['heavy, 44 mm hole', 140, 16, 22, 44, 60], ['extra heavy, 56 mm hole', 180, 20, 28, 56, 78]].map(([l, B, bt, lt, hole, R]) => V(l, B, B, bt + R * 1.1 + R, { cls: l.split(',')[0], B, bt, lt, hole, R })),
    build: (a, v) => {
      const { B, bt, lt, hole, R } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, zt = z0 + bt, zc = zt + R * 1.1, hh = zc - zt, e = B / 2 - B * 0.14;
      plateHoles(a, cx - B / 2, cy - B / 2, cx + B / 2, cy + B / 2, z0, zt, [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([sx, sy]) => ({ x: cx + sx * e, y: cy + sy * e, rx: B * 0.05, ry: B * 0.05 })), 6);
      ring(a, 'y', cx, zc, cy - lt / 2, cy + lt / 2, hole / 2, (t) => (m.sin(t) < 0 ? m.min(R / m.max(m.abs(m.cos(t)), 1e-4), hh / m.max(m.abs(m.sin(t)), 1e-4)) : R), 48);
      a.rect(cx - B / 2, cy - B / 2, cx + B / 2, cy + B / 2); a.rect(cx - R, cy - lt / 2, cx + R, cy + lt / 2, 'EQUIP-DETAIL');
      a.log('Added the base plate with four holes and the lug with its round top and lifting hole (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic rubber vibration mount',
    desc: (v) => `Cylindrical rubber vibration mount, ${v.d} mm across and ${v.H} mm high: a base plate with two slotted holes, a rubber body between two plates, a threaded stud on top with a washer and a hex nut.`,
    vs: [[40, 30], [60, 45], [80, 55]].map(([d, H]) => { const sd = d * 0.2, stud = d * 0.7; return V(`${d} mm, ${H} mm high`, d * 1.5, d * 1.1, H + stud, { d, H, sd, stud }); }),
    build: (a, v) => {
      const { d, H, sd, stud } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, bt = 4, ru = H - 2 * bt, W = d * 1.5, D = d * 1.1, r = sd / 2, I = ISO[sd >= 12 ? 12 : sd >= 10 ? 10 : sd >= 8 ? 8 : 6];
      plateHoles(a, cx - W / 2, cy - D / 2, cx + W / 2, cy + D / 2, z0, z0 + bt, [{ x: cx - W * 0.38, y: cy, rx: d * 0.1, ry: d * 0.05 }, { x: cx + W * 0.38, y: cy, rx: d * 0.1, ry: d * 0.05 }], 6);
      a.cyl(cx, cy, z0 + bt, z0 + bt + ru * 0.3, d / 2 * 0.92, 28); a.cone(cx, cy, z0 + bt + ru * 0.3, z0 + bt + ru * 0.7, d / 2 * 0.98, d / 2 * 0.98, 28); a.cone(cx, cy, z0 + bt + ru * 0.7, z0 + bt + ru, d / 2 * 0.98, d / 2 * 0.92, 28);
      a.cyl(cx, cy, z0 + bt + ru, z0 + H, d / 2 * 0.9, 28); a.cyl(cx, cy, z0 + H, z0 + H + stud * 0.2, r * 1.15, 12); rodThread(a, cx, cy, z0 + H + stud * 0.2, a.Z1, r, I.p, 12);
      ring(a, 'z', cx, cy, a.Z1 - 0.5 * sd - 2, a.Z1 - 2, r * 0.9, hexRo(I.af / 2), 18, 0);
      a.rect(cx - W / 2, cy - D / 2, cx + W / 2, cy + D / 2); a.circ(cx, cy, d / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, r, 'EQUIP-DETAIL');
      a.log('Added the base plate with slotted holes, the rubber body, the top plate and the threaded stud with its nut (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic motor saddle mount',
    desc: (v) => `Motor saddle mount for a ${v.Dm} mm round motor body: a base plate with four slotted holes, two cradle blocks cut to the motor radius, a hold-down strap over the middle bolted at both ends, and the plain motor body with a shaft stub lying in it.`,
    vs: [[80, 200, 120], [120, 260, 170], [180, 340, 230]].map(([Dm, Lm, bd]) => { const Rm = Dm / 2, bt = 10, zc = bt + 22 + Rm; return V(`${Dm} mm motor, ${Lm} mm long`, Lm + Dm * 0.3, bd, zc + Rm, { Dm, Lm, bd, bt, zc }); }),
    build: (a, v) => {
      const { Dm, Lm, bd, bt, zc } = v, cy = a.cy, z0 = a.Z0, Rm = Dm / 2, zm = z0 + zc, x0 = a.X0, W = a.W, yh = bd / 2 - 22, xl = a.X0 + 0, xm0 = x0 + W / 2 - Lm / 2, xm1 = xm0 + Lm;
      plateHoles(a, x0, cy - bd / 2, x0 + W, cy + bd / 2, z0, z0 + bt, [0.12, 0.88].flatMap((f) => [-1, 1].map((sy) => ({ x: x0 + W * f, y: cy + sy * yh, rx: Dm * 0.12, ry: Dm * 0.06 }))), 6);
      for (const f of [0.22, 0.78]) { const xs = x0 + W * f - 12; ring(a, 'x', cy, zm, xs, xs + 24, Rm, (t) => (m.sin(t) < 0 ? m.min((Rm + 24) / m.max(m.abs(m.cos(t)), 1e-4), (zm - z0 - bt) / m.max(m.abs(m.sin(t)), 1e-4)) : Rm + 24), 28, m.PI, m.PI); }
      a.xcyl(xm0, xm1, cy, zm, Rm * 0.98, 28); a.xcyl(xm0 - 6, xm0, cy, zm, Rm * 0.9, 24); a.xcyl(xm1, xm1 + 6, cy, zm, Rm * 0.9, 24); a.xcyl(xm1 + 6, a.X1 - 0, cy, zm, Rm * 0.18, 12);
      const xs = x0 + W * 0.5 - 12; ring(a, 'x', cy, zm, xs, xs + 24, Rm * 0.98 + 0.2, Rm + 4, 20, 0, m.PI);
      for (const s of [-1, 1]) { a.box(xs, cy + s * (Rm + 4) - (s > 0 ? 0 : 18), zm, xs + 24, cy + s * (Rm + 4) + (s > 0 ? 18 : 0), zm + 4); a.cyl(xs + 12, cy + s * (Rm + 13), zm + 4, zm + 11, 7, 8); }
      a.rect(x0, cy - bd / 2, x0 + W, cy + bd / 2); a.rect(xm0, cy - Rm, xm1, cy + Rm, 'EQUIP-DETAIL'); a.rect(xs, cy - Rm - 22, xs + 24, cy + Rm + 22, 'EQUIP-DETAIL');
      a.log('Added the base plate, the cradle blocks, the hold-down strap and the motor body with its shaft stub (plan and 3D).');
    } }),
];

// ============================================================================================= MECHANISMS
const mechanisms = [
  fam({ cat: 'machine/mechanisms', title: 'Generic gas spring',
    desc: (v) => `Gas spring, ${v.st} mm stroke, ${v.rod} mm rod, lying on its side: a pressure tube with two crimp beads, a polished rod and a threaded stud with an eyelet fitting at each end.`,
    vs: [[100, 8, 18], [200, 10, 22], [300, 14, 28]].map(([st, rod, tube]) => { const re = tube * 0.55, Lt = st + 40, tot = 2 * (2 * re + 12) + Lt + st + 6; return V(`${st} mm stroke, ${tube} mm tube`, tot, m.max(tube, re * 0.9), m.max(tube, 2 * re), { st, rod, tube, re, Lt }); }),
    build: (a, v) => {
      const { st, rod, tube, re, Lt } = v, y = a.cy, zc = a.Z0 + a.H / 2, x0 = a.X0, ew = tube * 0.4, hole = re * 0.5;
      let x = x0; ring(a, 'y', x + re, zc, y - ew / 2, y + ew / 2, hole, re, 24); x += 2 * re; a.xcyl(x - 2, x + 12, y, zc, rod * 0.45, 10); x += 12;
      a.xcyl(x, x + Lt, y, zc, tube / 2, 28); for (const f of [0.12, 0.2]) a.xcyl(x + Lt * f, x + Lt * f + 3, y, zc, tube / 2 + 0.8, 28); a.xcyl(x + Lt - 6, x + Lt, y, zc, tube / 2 * 1.04, 28); x += Lt;
      a.xcyl(x, x + st + 6, y, zc, rod / 2, 16); x += st + 6; a.xcyl(x, x + 12, y, zc, rod * 0.45, 10); x += 12; ring(a, 'y', x + re - 2, zc, y - ew / 2, y + ew / 2, hole, re, 24);
      a.rect(x0, y - re * 0.9 > y - tube / 2 ? y - tube / 2 : y - ew / 2, a.X1, y + (re * 0.9 > tube / 2 ? ew / 2 : tube / 2), 'EQUIP-DETAIL'); a.rect(x0 + 2 * re + 12, y - tube / 2, x0 + 2 * re + 12 + Lt, y + tube / 2); a.line(x0, y, a.X1, y, 'EQUIP-HIDDEN');
      a.log('Added the pressure tube with crimp beads, the rod, the two studs and the eyelet fittings (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic disc spring stack',
    desc: (v) => `Disc spring (conical washer) stack of ${v.n} discs, ${v.D} mm across, ${v.mode}: conical discs drawn as stepped cones on a guide pin with a head and a base ring.`,
    vs: [['4 discs in series, 20 mm', 20, 10.2, 1, 0.55, [1, 1, 1, 1], 'alternating discs'], ['6 discs in series, 31.5 mm', 31.5, 16.3, 1.75, 1, [1, 1, 1, 1, 1, 1], 'alternating discs'], ['3 pairs, 2 in parallel, 40 mm', 40, 20.4, 2.5, 1.2, [2, 2, 2], 'pairs nested the same way and the pairs alternating']].map(([l, D, d, t, c, grp, mode]) => { const n = grp.reduce((x, y) => x + y, 0), uh = grp.length * c + t + (grp.reduce((x, y) => x + y - 1, 0)) * t; return V(l, D, D, uh + 6, { D, d, t, c, grp, mode, n, uh }); }),
    build: (a, v) => {
      const { D, d, t, c, grp } = v, cx = a.cx, cy = a.cy, z0 = a.Z0 + 3, S = 4; let zin = z0, up = 1;
      a.cyl(cx, cy, a.Z0, a.Z1, d / 2 - 0.5, 14); ring(a, 'z', cx, cy, a.Z0, a.Z0 + 1.5, d / 2, D / 2, 24); a.cyl(cx, cy, a.Z1 - 2, a.Z1, d / 2 + 1.5, 14);
      for (const g of grp) {
        for (let k = 0; k < g; k++) for (let s = 0; s < S; s++) { const r0 = d / 2 + 0.3 + ((D - d) / 2 - 0.3) * (s / S), r1 = d / 2 + 0.3 + ((D - d) / 2 - 0.3) * ((s + 1) / S), fz = (s + 0.5) / S, zb = (up > 0 ? zin + c * fz : zin + c * (1 - fz)) + k * t - (up > 0 ? 0 : 0); ring(a, 'z', cx, cy, zb, zb + t, r0, r1 + 0.1, 20); }
        zin += c + (up > 0 ? 0 : 0) + 0.0; up = -up; if (false) zin += 0;
      }
      a.circ(cx, cy, D / 2); a.circ(cx, cy, d / 2, 'EQUIP-DETAIL');
      a.log('Added the guide pin with head and base ring and the stack of stepped conical discs (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic torsion spring',
    desc: (v) => `Torsion spring, ${v.wire} mm wire on a ${v.ID} mm inside diameter, ${v.coils} coils, standing on end: a close wound helix with a straight tangent leg at each end pointing in opposite directions.`,
    vs: [[2, 20, 10, 40], [3, 30, 12, 60], [4.5, 45, 10, 80]].map(([wire, ID, coils, leg]) => { const R = ID / 2 + wire / 2, pitch = wire * 1.15; return V(`${wire} mm wire, ${ID} mm inside, ${coils} coils`, 2 * R + wire, 2 * m.max(leg, R + wire), coils * pitch + wire, { wire, ID, coils, leg, R, pitch }); }),
    build: (a, v) => {
      const { wire, coils, leg, R, pitch } = v, cx = a.cx, cy = a.cy, z0 = a.Z0 + wire / 2, n = coils * 24, pts = [[cx + R, cy - leg, z0]];
      for (let i = 0; i <= n; i++) { const th = (TAU * i) / 24; pts.push([cx + R * m.cos(th), cy + R * m.sin(th), z0 + (pitch * i) / 24]); } pts.push([cx + R, cy + leg, z0 + pitch * coils]);
      for (let i = 0; i < pts.length - 1; i++) a.tube([pts[i], pts[i + 1]], [wire / 2, wire / 2], 6);
      a.circ(cx, cy, R + wire / 2); a.circ(cx, cy, R - wire / 2, 'EQUIP-DETAIL'); a.line(cx + R, cy - leg, cx + R, cy + leg, 'EQUIP-DETAIL');
      a.log('Added the close wound coils and the two tangent legs (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic round barrel pneumatic cylinder',
    desc: (v) => `Round barrel pneumatic cylinder, ${v.bore} mm bore and ${v.stroke} mm stroke, lying on its side: a round barrel with two end caps, two ports on top, a piston rod half out with a threaded fork end and a rear clevis with its pin.`,
    vs: [[32, 100], [50, 150], [80, 200]].map(([bore, stroke]) => { const OD = bore + 10, Lb = stroke + 40, cl = bore * 0.6, rv = stroke * 0.5 + 40, fl = bore * 0.7; return V(`${bore} mm bore, ${stroke} mm stroke`, cl + 16 + Lb + 16 + rv + fl, OD, OD + 8, { bore, stroke, OD, Lb, cl, rv, fl }); }),
    build: (a, v) => {
      const { bore, OD, Lb, cl, rv, fl } = v, y = a.cy, zc = a.Z0 + OD / 2, R = OD / 2; let x = a.X0, ear = bore * 0.12;
      for (const s of [-1, 1]) a.box(x, y + s * (bore * 0.3) - (s > 0 ? 0 : ear), zc - bore * 0.3, x + cl, y + s * (bore * 0.3) + (s > 0 ? ear : 0), zc + bore * 0.3);
      a.ycyl(y - bore * 0.3 - ear - 3, y + bore * 0.3 + ear + 3, x + cl * 0.45, zc, bore * 0.09, 12); a.ycyl(y - bore * 0.3, y + bore * 0.3, x + cl * 0.45, zc, bore * 0.13, 12); x += cl;
      a.xcyl(x, x + 16, y, zc, R * 0.96, 28); x += 16; a.xcyl(x, x + Lb, y, zc, R * 0.9, 32); const xb = x; x += Lb; a.xcyl(x, x + 16, y, zc, R * 0.96, 28); x += 16;
      a.xcyl(x, x + rv, y, zc, bore * 0.2, 16); a.xcyl(x - 6, x + 6, y, zc, bore * 0.28, 16); x += rv;
      for (const s of [-1, 1]) a.box(x, y + s * (bore * 0.22) - (s > 0 ? 0 : ear * 0.7), zc - bore * 0.3, x + fl, y + s * (bore * 0.22) + (s > 0 ? ear * 0.7 : 0), zc + bore * 0.3);
      a.ycyl(y - bore * 0.3, y + bore * 0.3, x + fl * 0.55, zc, bore * 0.09, 12);
      for (const f of [0.15, 0.85]) { a.cyl(xb + Lb * f, y, zc + R * 0.9 - 1, a.Z1, bore * 0.1, 10); a.circ(xb + Lb * f, y, bore * 0.1, 'EQUIP-DETAIL'); }
      a.rect(a.X0 + cl, y - R, a.X0 + cl + Lb + 32, y + R); a.line(xb, y - R, xb, y + R, 'EQUIP-DETAIL'); a.line(xb + Lb, y - R, xb + Lb, y + R, 'EQUIP-DETAIL'); a.rect(a.X0 + cl + Lb + 32, y - bore * 0.2, a.X1 - fl, y + bore * 0.2); a.rect(a.X0, y - bore * 0.3 - ear, a.X0 + cl, y + bore * 0.3 + ear, 'EQUIP-DETAIL'); a.rect(a.X1 - fl, y - bore * 0.22 - ear * 0.7, a.X1, y + bore * 0.22 + ear * 0.7, 'EQUIP-DETAIL');
      a.log('Added the barrel, the end caps, the ports, the piston rod with its fork end and the rear clevis with pin (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic welded hydraulic cylinder',
    desc: (v) => `Welded hydraulic cylinder, ${v.bore} mm bore and ${v.stroke} mm stroke, lying on its side: a thick barrel with a welded base cap and eye, a rod gland, two square-flange ports on top and a chrome rod partly out ending in a rod eye.`,
    vs: [[50, 300], [80, 500], [125, 800]].map(([bore, stroke]) => { const OD = bore + 16, rodD = bore * 0.55, Lb = stroke + bore * 0.9, ew = bore * 0.5, eR = rodD * 0.85; return V(`${bore} mm bore, ${stroke} mm stroke`, 2 * eR + Lb + bore * 0.3 + stroke * 0.6 + 2 * eR + 40, m.max(OD, ew), OD + bore * 0.3, { bore, stroke, OD, rodD, Lb, ew, eR }); }),
    build: (a, v) => {
      const { bore, stroke, OD, rodD, Lb, ew, eR } = v, y = a.cy, zc = a.Z0 + OD / 2, R = OD / 2; let x = a.X0;
      ring(a, 'y', x + eR, zc, y - ew / 2, y + ew / 2, eR * 0.5, eR, 24); x += 2 * eR - 4; a.xcyl(x, x + bore * 0.3, y, zc, R * 0.8, 24); x += bore * 0.3;
      a.xcyl(x, x + Lb, y, zc, R, 32); const xb = x; x += Lb; a.xcyl(x, x + bore * 0.3, y, zc, R * 0.86, 28); a.xcyl(x + bore * 0.3 - 8, x + bore * 0.3, y, zc, R * 0.96, 28); x += bore * 0.3;
      a.xcyl(x, x + stroke * 0.6 + 40, y, zc, rodD / 2, 20); x += stroke * 0.6 + 40 - 2; a.xcyl(x, x + eR, y, zc, rodD * 0.45, 14); ring(a, 'y', x + eR * 1.6, zc, y - ew / 2, y + ew / 2, eR * 0.5, eR, 24);
      for (const f of [bore * 0.35, Lb - bore * 0.35]) { const xp = xb + f; a.box(xp - bore * 0.22, y - bore * 0.22, zc + R - 4, xp + bore * 0.22, y + bore * 0.22, zc + R + bore * 0.08); a.cyl(xp, y, zc + R + bore * 0.08, a.Z1, bore * 0.12, 12); a.circ(xp, y, bore * 0.12, 'EQUIP-DETAIL'); a.rect(xp - bore * 0.22, y - bore * 0.22, xp + bore * 0.22, y + bore * 0.22, 'EQUIP-DETAIL'); }
      a.rect(xb, y - R, xb + Lb, y + R); a.rect(a.X0, y - ew / 2, a.X0 + 2 * eR, y + ew / 2, 'EQUIP-DETAIL'); a.rect(a.X1 - 2 * eR - 2, y - ew / 2, a.X1, y + ew / 2, 'EQUIP-DETAIL'); a.line(xb + Lb, y - R, xb + Lb, y + R, 'EQUIP-DETAIL');
      a.log('Added the barrel, the welded base cap and eye, the gland, the flanged ports, the rod and the rod eye (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic ball screw slide unit',
    desc: (v) => `Ball screw unit, ${v.D} mm screw by ${v.L} mm: a bed plate carrying a fixed end block and a floating end block, a threaded screw with a keyed drive stub, and a flanged nut with four cap screws on the screw.`,
    vs: [[16, 5, 400], [25, 10, 600], [40, 10, 900]].map(([D, p, L]) => { const bs = 3 * D, bt = 1.2 * D, stub = 1.5 * D; return V(`${D} mm screw, ${L} mm`, L + stub + 0.4 * D, bs, 0.3 * D + bs, { D, p, L, bs, bt, stub }); }),
    build: (a, v) => {
      const { D, p, L, bs, bt, stub } = v, y = a.cy, x0 = a.X0, bed = 0.3 * D, zc = a.Z0 + bed + bs / 2, r = D / 2;
      a.box(x0, y - bs / 2, a.Z0, a.X1, y + bs / 2, a.Z0 + bed);
      const xl = x0 + stub + 0.2 * D, xr = xl + L - bt; a.box(xl, y - bs / 2, a.Z0 + bed, xl + bt, y + bs / 2, a.Z0 + bed + bs); a.box(xr, y - bs * 0.4, a.Z0 + bed, xr + bt, y + bs * 0.4, a.Z0 + bed + bs * 0.8);
      ring(a, 'x', y, zc, xl - 0.2 * D, xl, r * 0.8, r * 1.5, 24); ring(a, 'x', y, zc, xr + bt, xr + bt + 0.15 * D, r * 0.8, r * 1.4, 24);
      a.xcyl(x0, xl, y, zc, r * 0.7, 16); a.box(x0 + 0.3 * D, y - 0.08 * D, zc + r * 0.5, x0 + stub - 0.2 * D, y + 0.08 * D, zc + r * 0.7 + 1.5);
      const xa = xl + bt, xb = xr; a.xcyl(xa, xb, y, zc, r * 0.82, 20); threadX(a, y, zc, xa, xb, r, r * 0.82, p, 44, 14); a.xcyl(xb, xr + bt + 0.1 * D, y, zc, r * 0.7, 16);
      const xn = (xa + xb) / 2 - 0.9 * D; a.xcyl(xn, xn + 1.8 * D, y, zc, r * 1.45, 24); a.box(xn, y - 1.2 * D, zc - 1.2 * D, xn + 0.35 * D, y + 1.2 * D, zc + 1.2 * D);
      for (const sy of [-1, 1]) for (const sz of [-1, 1]) a.xcyl(xn - 0.1 * D, xn, y + sy * 0.85 * D, zc + sz * 0.85 * D, 0.12 * D, 8);
      a.rect(x0, y - bs / 2, a.X1, y + bs / 2); a.rect(xl, y - bs / 2, xl + bt, y + bs / 2, 'EQUIP-DETAIL'); a.rect(xr, y - bs * 0.4, xr + bt, y + bs * 0.4, 'EQUIP-DETAIL'); a.rect(xn, y - 1.2 * D, xn + 1.8 * D, y + 1.2 * D, 'EQUIP-DETAIL'); a.line(x0, y, a.X1, y, 'EQUIP-HIDDEN');
      a.log('Added the bed plate, the two end blocks, the threaded screw with its stub, and the flanged nut (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic ratchet wheel and pawl',
    desc: (v) => `Ratchet mechanism with a ${v.N} tooth wheel, ${v.D} mm across: a back plate carrying a saw-tooth wheel on a hub and a pawl lever on a pivot post with a return spring tube.`,
    vs: [[12, 80], [24, 120]].map(([N, D]) => V(`${N} teeth, ${D} mm`, 1.5 * D, 0.32 * D + 22, 1.4 * D, { N, D })),
    build: (a, v) => {
      const { N, D } = v, R = D / 2, cx = a.cx - 0.1 * D, zc = a.Z0 + 0.7 * D, yb = a.YB, pt = 8, face = 12, yw0 = yb - pt - 4 - face, yw1 = yb - pt - 4, yc = (yw0 + yw1) / 2;
      a.box(a.X0, yb - pt, a.Z0, a.X1, yb, a.Z1);
      const rr = R * 0.86; ring(a, 'y', cx, zc, yw0, yw1, R * 0.2, rr, 32); for (let i = 0; i < N; i++) { const th = (TAU * i) / N, w = TAU / N; prismY(a, [[cx + rr * 0.99 * m.cos(th), zc + rr * 0.99 * m.sin(th)], [cx + R * m.cos(th), zc + R * m.sin(th)], [cx + rr * 0.99 * m.cos(th + w), zc + rr * 0.99 * m.sin(th + w)]], yw0, yw1); }
      ring(a, 'y', cx, zc, yw0 - 4, yw1 + 4, R * 0.1, R * 0.3, 24);
      const T = [cx + 0.95 * R * m.cos(1.4), zc + 0.95 * R * m.sin(1.4)], P = [T[0] + 0.9 * R, T[1] + 0.15 * R], yp0 = yw0 + 1, yp1 = yw1 - 1;
      a.ycyl(yb - pt, yp1 + 2, P[0], P[1], R * 0.07, 12); bar(a, 'y', P, T, R * 0.12, yp0, yp1, true);
      const Q = [P[0] + 0.05 * R, P[1] - 0.45 * R]; a.ycyl(yb - pt, yp1, Q[0], Q[1], R * 0.05, 10); a.tube([[P[0] - 0.3 * R, yc, P[1] - 0.02 * R], [Q[0], yc, Q[1]]], [R * 0.025, R * 0.025], 6);
      a.rect(a.X0, yb - pt, a.X1, yb); a.rect(cx - R, yw0 - 4, cx + R, yw1 + 4, 'EQUIP-DETAIL'); a.rect(P[0] - R * 0.1, yp0, T[0], yp1, 'EQUIP-DETAIL');
      a.log('Added the back plate, the saw-tooth wheel with its hub, the pawl on its pivot post and the return spring (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic handwheel with revolving handle',
    desc: (v) => `Cast handwheel, ${v.D} mm across with ${v.n} spokes, standing on its hub: a flat rim, spokes, a hub with a bore and keyway above and below, and a revolving grip on a post at the rim.`,
    vs: [[100, 3, 12], [160, 4, 16], [250, 5, 20]].map(([D, n, bore]) => V(`${D} mm, ${n} spokes`, D, D, 0.28 * D + 0.26 * D, { D, n, bore })),
    build: (a, v) => {
      const { D, n, bore } = v, cx = a.cx, cy = a.cy, z0 = a.Z0, R = D / 2, hubH = 0.28 * D, rt = 0.07 * D, hubD = bore * 2.2, zr = z0 + hubH * 0.5 - rt / 2;
      ring(a, 'z', cx, cy, zr, zr + rt, R - 0.09 * D, R, 36); ring(a, 'z', cx, cy, z0, z0 + hubH, keyIn(bore / 2), hubD / 2, 32);
      spokes(a, cx, cy, z0 + hubH * 0.3, z0 + hubH * 0.7, hubD / 2 - 1, R - 0.09 * D + 1, n, 0.045 * D);
      const hx = cx + R * 0.82; a.cyl(hx, cy, zr + rt, zr + rt + 0.05 * D, 0.07 * D, 14); a.cyl(hx, cy, zr + rt + 0.05 * D, a.Z1, 0.028 * D, 10); a.cyl(hx, cy, zr + rt + 0.1 * D, a.Z1 - 0.02 * D, 0.06 * D, 16); a.cyl(hx, cy, a.Z1 - 0.02 * D, a.Z1, 0.03 * D, 10);
      a.circ(cx, cy, R); a.circ(cx, cy, R - 0.09 * D, 'EQUIP-DETAIL'); a.circ(cx, cy, hubD / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, bore / 2, 'EQUIP-DETAIL'); a.circ(hx, cy, 0.06 * D, 'EQUIP-DETAIL');
      for (let i = 0; i < n; i++) { const th = (TAU * i) / n + 0.3; a.line(cx + (hubD / 2) * m.cos(th), cy + (hubD / 2) * m.sin(th), cx + (R - 0.09 * D) * m.cos(th), cy + (R - 0.09 * D) * m.sin(th), 'EQUIP-DETAIL'); }
      a.log('Added the rim, the spokes, the hub with its bore and the revolving handle on its post (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic industrial caster',
    desc: (v) => `${v.kind === 'rigid' ? 'Rigid' : 'Swivel'} caster with a ${v.Dw} mm wheel${v.kind === 'brake' ? ' and a foot brake lever' : ''}: a top plate with four bolt holes, ${v.kind === 'rigid' ? 'a welded fork' : 'a swivel head with a raceway and a kingpin on a fork'}, a tyre on a hub, an axle with a nut${v.kind === 'brake' ? ' and a brake lever with a pad on the tyre' : ''}.`,
    vs: [['75 mm wheel, swivel', 75, 'swivel'], ['125 mm wheel, swivel with brake', 125, 'brake'], ['150 mm wheel, rigid', 150, 'rigid']].map(([l, Dw, kind]) => V(l, 1.3 * Dw, 1.05 * Dw, 1.3 * Dw + 4, { Dw, kind })),
    build: (a, v) => {
      const { Dw, kind } = v, cx = a.cx, y = a.cy, z0 = a.Z0, zc = z0 + Dw / 2, ww = 0.3 * Dw, zp = z0 + 1.3 * Dw, PW = 1.3 * Dw, PD = 1.05 * Dw, ft = 4;
      plateHoles(a, cx - PW / 2, y - PD / 2, cx + PW / 2, y + PD / 2, zp, zp + ft, [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([sx, sy]) => ({ x: cx + sx * PW * 0.38, y: y + sy * PD * 0.37, rx: Dw * 0.05, ry: Dw * 0.05 })), 6);
      if (kind === 'rigid') a.box(cx - 0.35 * Dw, y - ww / 2 - 7, zp - 0.12 * Dw, cx + 0.35 * Dw, y + ww / 2 + 7, zp); else { ring(a, 'z', cx, y, zp - 0.1 * Dw, zp, 0.05 * Dw, 0.3 * Dw, 28); ring(a, 'z', cx, y, zp - 0.15 * Dw, zp - 0.1 * Dw, 0.05 * Dw, 0.26 * Dw, 28); a.cyl(cx, y, zp - 0.2 * Dw, zp, 0.04 * Dw, 10); a.box(cx - 0.3 * Dw, y - ww / 2 - 7, zp - 0.2 * Dw, cx + 0.3 * Dw, y + ww / 2 + 7, zp - 0.15 * Dw); }
      for (const s of [-1, 1]) { const y0 = s > 0 ? y + ww / 2 + 3 : y - ww / 2 - 7; bar(a, 'y', [cx, zp - 0.15 * Dw], [cx, zc], 0.26 * Dw, y0, y0 + 4, true); }
      a.ycyl(y - ww / 2, y + ww / 2, cx, zc, Dw / 2, 32); a.ycyl(y - ww / 2 - 2, y + ww / 2 + 2, cx, zc, Dw * 0.3, 20); a.ycyl(y - ww / 2 - 8, y + ww / 2 + 8, cx, zc, Dw * 0.05, 10); a.ycyl(y + ww / 2 + 7, y + ww / 2 + 7 + Dw * 0.05, cx, zc, Dw * 0.09, 6);
      if (kind === 'brake') { bar(a, 'y', [cx + 0.38 * Dw, zc + 0.48 * Dw], [cx + 0.05 * Dw, zc + Dw * 0.56], 0.05 * Dw, y + ww / 2 + 8, y + ww / 2 + 12, true); a.ycyl(y + ww / 2 + 7, y + ww / 2 + 12, cx + 0.38 * Dw, zc + 0.48 * Dw, 0.03 * Dw, 8); a.box(cx - 0.1 * Dw, y - ww / 2, zc + Dw * 0.5 - 2, cx + 0.12 * Dw, y + ww / 2 + 12, zc + Dw * 0.56); }
      a.rect(cx - PW / 2, y - PD / 2, cx + PW / 2, y + PD / 2); a.rect(cx - Dw / 2, y - ww / 2, cx + Dw / 2, y + ww / 2, 'EQUIP-HIDDEN'); if (kind !== 'rigid') a.circ(cx, y, 0.3 * Dw, 'EQUIP-DETAIL');
      a.log('Added the top plate, the ' + (kind === 'rigid' ? 'welded fork' : 'swivel head and fork') + ', the tyre on its hub and the axle' + (kind === 'brake' ? ' with the brake lever' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic open body turnbuckle',
    desc: (v) => `Open body turnbuckle for ${v.d} mm rod, ${v.Lb} mm body: two end blocks joined by two side rails, two threaded rods running into the blocks with a jam nut on each, and a forged eye on the end of each rod.`,
    vs: [[8, 100], [12, 150], [16, 200]].map(([d, Lb]) => { const eo = d * 1.7, shank = d * 4; return V(`M${d}, ${Lb} mm body`, 2 * (2 * eo + shank) + Lb + 0.5 * d, m.max(d * 1.9, d * 0.9), d * 3.4, { d, Lb, eo, shank }); }),
    build: (a, v) => {
      const { d, Lb, eo, shank } = v, y = a.cy, zc = a.Z0 + a.H / 2, r = d / 2, bl = Lb * 0.24, I = ISO[d];
      const xb0 = a.cx - Lb / 2, xb1 = a.cx + Lb / 2;
      for (const [xa, xb] of [[xb0, xb0 + bl], [xb1 - bl, xb1]]) { ring(a, 'x', y, zc, xa, xb, r * 0.8, d * 0.95, 24); }
      for (const s of [-1, 1]) { a.box(xb0 + bl, y + s * d * 0.5 - (s > 0 ? 0 : 0) - (s > 0 ? 0 : d * 0.1), zc + (s > 0 ? 0 : 0) - d * 0.6, xb1 - bl, y + s * d * 0.5 + (s > 0 ? d * 0.1 : 0), zc + d * 0.6); }
      for (const s of [-1, 1]) { const xe = s < 0 ? xb0 : xb1, xo = xe + s * (d * 0.15 + shank); rodThreadX(a, y, zc, s < 0 ? xo : xe - bl * 0.5, s < 0 ? xe + bl * 0.5 : xo, r, I.p); const xn = s < 0 ? xb0 - d * 0.9 : xb1 + 0.1 * d; ring(a, 'x', y, zc, xn, xn + 0.8 * d, r * 0.9, hexRo(I.af / 2), 18, 0); const xs = s < 0 ? xo : xo; a.xcyl(s < 0 ? xo - eo : xo, s < 0 ? xo : xo + eo, y, zc, r * 1.1, 14); ring(a, 'y', s < 0 ? xo - eo * 2 + 0.2 * d : xo + eo * 2 - 0.2 * d, zc, y - d * 0.35, y + d * 0.35, d * 0.55, eo, 24); }
      a.rect(xb0, y - d * 0.5, xb1, y + d * 0.5); a.rect(xb0, y - d * 0.95 / 1, xb0 + bl, y + d * 0.95, 'EQUIP-DETAIL'); a.rect(xb1 - bl, y - d * 0.95, xb1, y + d * 0.95, 'EQUIP-DETAIL'); a.line(a.X0, y, a.X1, y, 'EQUIP-HIDDEN');
      a.log('Added the two end blocks, the side rails, the threaded rods with jam nuts and the eye ends (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic cable carrier chain',
    desc: (v) => `Cable carrier chain, ${v.iw} mm inside width and ${v.ih} mm inside height, ${v.n} links, lying straight: two rows of side plates with round ends, a crossbar across every second link on top and bottom, and a mounting bracket at each end.`,
    vs: [[25, 20, 10], [50, 30, 12], [75, 45, 12]].map(([iw, ih, n]) => { const P = ih * 1.5, st = 5, H = ih + 2 * 4 + 2, bw = iw + 2 * st; return V(`${iw} x ${ih} mm, ${n} links`, n * P + H + 2 * (ih * 0.8), bw + 6, H, { iw, ih, n, P, st, H }); }),
    build: (a, v) => {
      const { iw, ih, n, P, st, H } = v, y = a.cy, zc = a.Z0 + H / 2, xb = a.X0 + ih * 0.8, ys = iw / 2;
      for (let k = 0; k < n; k++) { const inner = k % 2 === 0, o0 = inner ? ys : ys + st * 0.0; const yo = inner ? 0 : st * 0.5; for (const s of [-1, 1]) { const ya = s > 0 ? y + ys + yo : y - ys - yo - st; bar(a, 'y', [xb + k * P + H / 2, zc], [xb + (k + 1) * P + H / 2, zc], H * 0.9, ya, ya + st, true); }
        if (k % 2 === 1) { a.box(xb + k * P + H / 2 + P * 0.35, y - ys, zc + ih / 2, xb + k * P + H / 2 + P * 0.65, y + ys, zc + ih / 2 + 3); a.box(xb + k * P + H / 2 + P * 0.35, y - ys, zc - ih / 2 - 3, xb + k * P + H / 2 + P * 0.65, y + ys, zc - ih / 2); a.rect(xb + k * P + H / 2 + P * 0.35, y - ys, xb + k * P + H / 2 + P * 0.65, y + ys, 'EQUIP-DETAIL'); } }
      for (const s of [0, 1]) { const x0 = s ? a.X1 - ih * 0.8 : a.X0; a.box(x0, y - ys - st, a.Z0 + H * 0.15, x0 + ih * 0.8, y + ys + st, a.Z0 + H * 0.85); }
      a.rect(a.X0, y - ys - st, a.X1, y + ys + st); a.line(xb, y - ys, xb + n * P + H, y - ys, 'EQUIP-DETAIL'); a.line(xb, y + ys, xb + n * P + H, y + ys, 'EQUIP-DETAIL');
      a.log('Added the side plates, the crossbars on every second link and the two end brackets (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic C-clamp',
    desc: (v) => `Cast C-clamp, ${v.O} mm opening, standing upright: a C-shaped frame with a threaded boss in the top arm, a screw with a cross handle bar and a swivel pad on a ball, and a flat anvil on the lower arm.`,
    vs: [[75], [150], [250]].map(([O]) => { const t = m.max(8, 0.12 * O), Dd = 0.8 * O; return V(`${O} mm opening`, 1.3 * t + Dd, m.max(0.28 * O, 0.85 * O), 2 * t + O + 0.45 * O + 0.07 * O, { O, t, Dd }); }),
    build: (a, v) => {
      const { O, t, Dd } = v, y = a.cy, z0 = a.Z0, fw = 0.28 * O, x0 = a.X0, sx = x0 + 1.3 * t + Dd - 0.22 * O, zl = z0 + t, zu = z0 + t + O, r = 0.07 * O;
      a.box(x0, y - fw / 2, z0, x0 + 1.3 * t, y + fw / 2, zu + t); a.box(x0, y - fw / 2, z0, x0 + 1.3 * t + Dd, y + fw / 2, zl); a.box(x0, y - fw / 2, zu, x0 + 1.3 * t + Dd, y + fw / 2, zu + t);
      prismY(a, [[x0 + 1.3 * t, zl], [x0 + 1.3 * t + 0.5 * t, zl], [x0 + 1.3 * t, zl + 0.8 * t]], y - fw * 0.3, y + fw * 0.3); prismY(a, [[x0 + 1.3 * t, zu], [x0 + 1.3 * t + 0.5 * t, zu], [x0 + 1.3 * t, zu - 0.8 * t]], y - fw * 0.3, y + fw * 0.3);
      a.cyl(sx, y, zu - 0.01, zu + t + 0.08 * O, 0.2 * O, 20); a.cyl(sx, y, zl, zl + 0.04 * O, 0.19 * O, 20);
      a.cyl(sx, y, zl + 0.45 * O, a.Z1 - 0.05 * O, r, 14); thread(a, sx, y, zl + 0.5 * O, zu + t + 0.3 * O, r, r * 0.84, 0.12 * r * 10 / 10 + 2, 24); a.cyl(sx, y, zl + 0.38 * O, zl + 0.45 * O, r * 0.45, 8); a.ell(sx, y, zl + 0.37 * O, 0.1 * O * 0.6, 0.1 * O * 0.6, 0.05 * O, 12, 6); a.cyl(sx, y, zl + 0.26 * O, zl + 0.33 * O, 0.12 * O, 18);
      a.ycyl(y - 0.42 * O, y + 0.42 * O, sx, a.Z1 - 0.035 * O, 0.028 * O, 10); a.ell(sx, y - 0.42 * O, a.Z1 - 0.035 * O, 0.04 * O, 0.04 * O, 0.04 * O, 8, 6); a.ell(sx, y + 0.42 * O, a.Z1 - 0.035 * O, 0.04 * O, 0.04 * O, 0.04 * O, 8, 6);
      a.rect(x0, y - fw / 2, x0 + 1.3 * t + Dd, y + fw / 2); a.circ(sx, y, 0.2 * O, 'EQUIP-DETAIL'); a.line(sx, y - 0.42 * O, sx, y + 0.42 * O, 'EQUIP-DETAIL');
      a.log('Added the C frame, the threaded boss, the screw with its cross handle, the swivel pad and the anvil (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic worm drive hose clamp',
    desc: (v) => `Worm drive hose clamp for a ${v.Dn} mm hose, ${v.bw} mm band, with the axis to the front: a thin round band, an overlapping tail, a housing with a worm screw and a hex head with a slot.`,
    vs: [[28, 9], [55, 12], [100, 12]].map(([Dn, bw]) => { const R = Dn / 2, hh = 9 + Dn * 0.05; return V(`${Dn} mm hose, ${bw} mm band`, Dn + 3, bw, Dn + 3 + hh, { Dn, bw, R, hh }); }),
    build: (a, v) => {
      const { Dn, bw, R, hh } = v, cx = a.cx, y = a.cy, zc = a.Z0 + R + 1.5, t = 0.6, y0 = y - bw / 2, y1 = y + bw / 2, hl = 14 + Dn * 0.1;
      ring(a, 'y', cx, zc, y0, y1, R, R + t, 40); ring(a, 'y', cx, zc, y0, y1, R + t, R + 2 * t, 12, m.PI / 2 + hl / (R + t) * 0.5, 0.9);
      a.box(cx - hl / 2, y0 + 0.3, zc + R - 1, cx + hl / 2, y1 - 0.3, zc + R + hh); a.xcyl(cx - hl / 2 - 3, cx + hl / 2 + 3, y, zc + R + hh * 0.6, bw * 0.2, 12);
      ring(a, 'x', y, zc + R + hh * 0.6, cx + hl / 2 + 3, cx + hl / 2 + 8, 0, hexRo(bw * 0.3), 18, 0); a.box(cx + hl / 2 + 7.9, y - 0.5, zc + R + hh * 0.6 - bw * 0.3, cx + hl / 2 + 8.2, y + 0.5, zc + R + hh * 0.6 + bw * 0.3);
      a.rect(cx - R - 1.5, y0, cx + R + 1.5, y1); a.rect(cx - hl / 2, y0 + 0.3, cx + hl / 2, y1 - 0.3, 'EQUIP-DETAIL');
      a.log('Added the round band, the overlapping tail, the housing with its worm screw and the slotted hex head (plan and 3D).');
    } }),
];
function rodThreadX(a, y, z, x0, x1, r, p) { a.xcyl(x0, x1, y, z, r * 0.84, 14); threadX(a, y, z, x0, x1, r, r * 0.84, p, 18); }
export default [...fasteners, ...transmission, ...frames, ...mechanisms];

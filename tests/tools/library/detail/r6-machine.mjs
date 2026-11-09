/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, machine: fasteners, transmission, frames and housings, mechanisms and actuators. Original geometry, generic sizes by nominal dimension. */
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
function teeth(a, cx, cy, z0, z1, N, rb, rt, hb, ht) {
  for (let i = 0; i < N; i++) { const th = (TAU * i) / N + 0.0001; const P = (r, d) => [cx + r * m.cos(th + d), cy + r * m.sin(th + d)]; a.prism([P(rb, -hb), P(rt, -ht), P(rt, ht), P(rb, hb)], z0, z1); }
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
const AC = (af) => af / m.cos(m.PI / 6);
const hexPts = (cx, cy, af) => ptsC(cx, cy, AC(af) / 2, 6, 0);

// ============================================================================================= FASTENERS
const fasteners = [
  fam({ cat: 'machine/fasteners', title: 'Generic hex head bolt',
    desc: (v) => `Hex head bolt, ${v.d} mm thread by ${v.len} mm long: a hex head with a washer face and a shank with a plain grip and a rolled thread drawn as rings.`,
    vs: [[6, 25], [8, 40], [12, 70], [16, 100]].map(([d, len]) => [`${d} mm x ${len} mm`, mi(AC(ISO[d].af)), mi(AC(ISO[d].af)), mi(ISO[d].k + len), 0, { d, len }]),
    build: (a, v) => {
      const { d, len } = v, I = ISO[d], cx = a.cx, cy = a.cy, top = a.Z1, hb = top - I.k;
      a.prism(hexPts(cx, cy, I.af), hb, top); a.cyl(cx, cy, hb - 0.8, hb, I.af * 0.46, 16); a.cone(cx, cy, top - 1.2, top, AC(I.af) / 2 * 0.86, AC(I.af) / 2 * 0.7, 6);
      const tl = m.min(len, len > 125 ? 2 * d + 12 : 2 * d + 6), r = d / 2;
      a.cyl(cx, cy, a.Z0 + tl, hb, r, 14); a.cyl(cx, cy, a.Z0 + 1, a.Z0 + tl, r * 0.84, 14); thread(a, cx, cy, a.Z0 + 1, a.Z0 + tl, r, r * 0.84, I.p, 22); a.cone(cx, cy, a.Z0, a.Z0 + 1.2, r * 0.7, r * 0.84, 14);
      a.poly(hexPts(cx, cy, I.af)); a.circ(cx, cy, I.af * 0.46, 'EQUIP-DETAIL'); a.circ(cx, cy, r, 'EQUIP-DETAIL');
      a.log('Added the hex head with washer face, the plain grip and the rolled thread as rings (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic hex nut',
    desc: (v) => `${v.nyloc ? 'Hex lock nut with a round collar' : 'Plain hex nut'} for a ${v.d} mm thread: a hex ring with a bore and chamfered faces${v.nyloc ? ' and a domed collar on top' : ''}.`,
    vs: [[8, 0, 'plain'], [12, 0, 'plain'], [20, 0, 'plain'], [12, 1, 'lock, with collar']].map(([d, nyloc, t]) => { const I = ISO[d], hh = nyloc ? d * 1.3 : d * 0.8; return [`${d} mm, ${t}`, mi(AC(I.af)), mi(AC(I.af)), mi(hh), 0, { d, nyloc }]; }),
    build: (a, v) => {
      const I = ISO[v.d], cx = a.cx, cy = a.cy, hh = v.nyloc ? v.d * 0.8 : a.H, ap = I.af / 2;
      ring(a, 'z', cx, cy, a.Z0, a.Z0 + hh, v.d / 2 * 0.9, hexRo(ap), 24, 0);
      ring(a, 'z', cx, cy, a.Z0, a.Z0 + 0.8, v.d / 2 * 0.9, AC(I.af) / 2 * 0.0 + ap * 0.97, 24, 0); 
      if (v.nyloc) { ring(a, 'z', cx, cy, a.Z0 + hh, a.Z1 - 1, v.d / 2 * 0.9, ap * 0.78, 20); ring(a, 'z', cx, cy, a.Z1 - 1, a.Z1, v.d / 2 * 0.9, ap * 0.66, 20); }
      a.poly(hexPts(cx, cy, I.af)); a.circ(cx, cy, v.d / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, v.d / 2 * 0.8, 'EQUIP-DETAIL');
      a.log('Added the hex ring with a bore' + (v.nyloc ? ' and the round lock collar' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic washer',
    desc: (v) => v.spring ? `Split spring lock washer for a ${v.d} mm bolt: one helical turn with a gap and raised ends.` : `Flat washer for a ${v.d} mm bolt, ${v.od} mm across with a ${v.id} mm hole.`,
    vs: [['10 mm bolt, flat', mi(20), mi(20), mi(2), 0, { d: 10, id: 10.5, od: 20, t: 2 }], ['16 mm bolt, flat', mi(30), mi(30), mi(3), 0, { d: 16, id: 17, od: 30, t: 3 }], ['10 mm bolt, split spring', mi(18.1), mi(18.1), mi(4.6), 0, { d: 10, id: 10.2, od: 18.1, t: 2.3, spring: true }]],
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, ri = v.id / 2, ro = v.od / 2;
      if (!v.spring) ring(a, 'z', cx, cy, a.Z0, a.Z1, ri, ro, 28);
      else { const n = 28; for (let i = 1; i < n; i++) { const z = a.Z0 + (v.t * 1.0 * i) / n; ring(a, 'z', cx, cy, z, z + v.t, ri, ro, 1, (i * TAU) / n, TAU / n); } }
      a.circ(cx, cy, ro); a.circ(cx, cy, ri, 'EQUIP-DETAIL'); if (v.spring) a.line(cx + ri, cy, cx + ro, cy, 'EQUIP-DETAIL');
      a.log('Added the washer ring with its hole' + (v.spring ? ', the helical rise and the gap' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic socket head cap screw',
    desc: (v) => `Socket head cap screw, ${v.d} mm thread by ${v.len} mm: a round head with a hex socket recess, a plain grip and a rolled thread drawn as rings.`,
    vs: [[5, 20, 8.5, 4], [8, 35, 13, 6], [12, 55, 18, 10]].map(([d, len, hd, af]) => [`${d} mm x ${len} mm`, mi(hd), mi(hd), mi(d + len), 0, { d, len, hd, af }]),
    build: (a, v) => {
      const { d, len, hd, af } = v, cx = a.cx, cy = a.cy, hb = a.Z1 - d, r = d / 2, sd = d * 0.55;
      a.cyl(cx, cy, hb, a.Z1 - sd, hd / 2, 24); ring(a, 'z', cx, cy, a.Z1 - sd, a.Z1, af / 2 / m.cos(m.PI / 6) * 0.99, (t) => hd / 2, 12, 0.0);
      a.cone(cx, cy, a.Z1 - 0.8, a.Z1, hd / 2, hd / 2 * 0.93, 20);
      const tl = m.min(len, 2 * d + 8); a.cyl(cx, cy, a.Z0 + tl, hb, r, 14); a.cyl(cx, cy, a.Z0 + 1, a.Z0 + tl, r * 0.84, 14); thread(a, cx, cy, a.Z0 + 1, a.Z0 + tl, r, r * 0.84, ISO[d].p, 22); a.cone(cx, cy, a.Z0, a.Z0 + 1.2, r * 0.7, r * 0.84, 14);
      a.circ(cx, cy, hd / 2); a.poly(ptsC(cx, cy, af / 2 / m.cos(m.PI / 6), 6, 0).map((p) => p), 'EQUIP-DETAIL'); a.circ(cx, cy, r, 'EQUIP-HIDDEN');
      a.log('Added the round head with a hex socket, the plain grip and the rolled thread as rings (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic machine screw',
    desc: (v) => `${v.style} machine screw, ${v.d} mm thread by ${v.len} mm: ${v.style === 'Countersunk' ? 'a conical flat head' : v.style === 'Button' ? 'a low domed head' : 'a cylindrical pan head with a rounded rim'}, a cross recess and a rolled thread drawn as rings.`,
    vs: [['pan head, 5 mm x 16 mm', 5, 16, 'Pan', 9.5, 3.5], ['countersunk, 6 mm x 20 mm', 6, 20, 'Countersunk', 12, 3.6], ['button head, 8 mm x 20 mm', 8, 20, 'Button', 14.5, 4.4]].map(([l, d, len, style, hd, k]) => [l, mi(hd), mi(hd), mi(k + len), 0, { d, len, style, hd, k }]),
    build: (a, v) => {
      const { d, len, hd, k, style } = v, cx = a.cx, cy = a.cy, hb = a.Z1 - v.k, r = d / 2, g = d * 0.14;
      if (style === 'Countersunk') { a.cone(cx, cy, hb, a.Z1 - 0.6, r, hd / 2, 20); a.cyl(cx, cy, a.Z1 - 0.6, a.Z1, hd / 2, 20); }
      else if (style === 'Button') { a.tube([[cx, cy, hb], [cx, cy, hb + k * 0.35], [cx, cy, hb + k * 0.7], [cx, cy, a.Z1]], [hd / 2, hd / 2 * 0.95, hd / 2 * 0.72, hd / 2 * 0.4], 20); }
      else { a.cyl(cx, cy, hb, hb + k * 0.55, hd / 2, 22); a.cone(cx, cy, hb + k * 0.55, a.Z1, hd / 2 * 0.97, hd / 2 * 0.86, 22); }
      for (const [sx, sy] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) { const R = hd / 2 * 0.4, pts = []; pts.push([cx + sx * g, cy + sy * g]); for (let i = 0; i <= 4; i++) { const t = m.asin(g / R) + ((m.acos(g / R) - m.asin(g / R)) * i) / 4; pts.push([cx + sx * R * m.cos(t), cy + sy * R * m.sin(t)]); } if (sx * sy < 0) pts.reverse(); a.prism(pts, a.Z1 - 0.01, a.Z1 + 0.01); }
      const tl = m.min(len, 14 + d); a.tube([[cx, cy, a.Z0 + 1.2], [cx, cy, a.Z0 + tl], [cx, cy, a.Z0 + tl + 0.2], [cx, cy, hb]], [r * 0.84, r * 0.84, r, r], 14); thread(a, cx, cy, a.Z0 + 1, a.Z0 + tl, r, r * 0.84, ISO[d].p, 22); a.cone(cx, cy, a.Z0, a.Z0 + 1.2, r * 0.7, r * 0.84, 14);
      a.circ(cx, cy, hd / 2); a.line(cx - hd * 0.25, cy, cx + hd * 0.25, cy, 'EQUIP-DETAIL'); a.line(cx, cy - hd * 0.25, cx, cy + hd * 0.25, 'EQUIP-DETAIL');
      a.log('Added the head, the cross recess and the rolled thread as rings (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic threaded stud',
    desc: (v) => v.rod ? `Fully threaded rod, ${v.d} mm by ${v.len} mm, drawn as a core with a ring thread along its length, with chamfered ends.` : `Double-ended stud, ${v.d} mm by ${v.len} mm: a thread at each end and a plain waist between, with chamfered ends.`,
    vs: [['double ended, 10 mm x 60 mm', 10, 60, false], ['threaded rod, 6 mm x 100 mm', 6, 100, true]].map(([l, d, len, rod]) => [l, mi(d), mi(d), mi(len), 0, { d, len, rod }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, r = v.d / 2, p = ISO[v.d]?.p ?? 1, L = v.len;
      if (v.rod) { a.cyl(cx, cy, a.Z0, a.Z1, r * 0.84, 12); thread(a, cx, cy, a.Z0, a.Z1, r, r * 0.84, p, 40); }
      else { const tl = L * 0.3; a.cyl(cx, cy, a.Z0, a.Z1, r * 0.9, 14); thread(a, cx, cy, a.Z0 + 1, a.Z0 + tl, r, r * 0.84, p, 14); thread(a, cx, cy, a.Z1 - tl, a.Z1 - 1, r, r * 0.84, p, 14); }
      a.cone(cx, cy, a.Z0, a.Z0 + 1, r * 0.75, r, 14); a.cone(cx, cy, a.Z1 - 1, a.Z1, r, r * 0.75, 14);
      a.circ(cx, cy, r); a.circ(cx, cy, r * 0.84, 'EQUIP-DETAIL');
      a.log('Added the core and the ring thread' + (v.rod ? '' : ' at both ends with a plain waist') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic rivet',
    desc: (v) => v.pop ? `Blind pop rivet, ${v.d} mm by ${v.len} mm before setting: a flanged head, a hollow body and the mandrel stem standing out of the head.` : `Solid round head rivet, ${v.d} mm by ${v.len} mm: a domed head and a plain shank ready to be formed.`,
    vs: [['pop, 4.8 mm x 12 mm', 4.8, 12, true, 9.5], ['solid round head, 8 mm x 20 mm', 8, 20, false, 14.5]].map(([l, d, len, pop, hd]) => [l, mi(hd), mi(hd), mi(len + (pop ? 11 : d * 0.65)), 0, { d, len, pop, hd }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, r = v.d / 2, hb = a.Z0 + v.len;
      a.cyl(cx, cy, a.Z0, hb, r, 14);
      if (v.pop) { a.cyl(cx, cy, hb, hb + 1.1, v.hd / 2, 20); a.cone(cx, cy, hb + 1.1, hb + 1.8, v.hd / 2, r * 0.8, 20); a.cyl(cx, cy, hb + 1.8, a.Z1, 1.3, 8); a.cone(cx, cy, a.Z1 - 0.8, a.Z1, 1.3, 1.9, 8); a.cone(cx, cy, a.Z0, a.Z0 + 0.5, r * 0.85, r, 14); }
      else { a.tube([[cx, cy, hb], [cx, cy, hb + v.d * 0.2], [cx, cy, hb + v.d * 0.45], [cx, cy, a.Z1]], [v.hd / 2, v.hd / 2 * 0.95, v.hd / 2 * 0.7, v.hd / 2 * 0.3], 20); }
      a.circ(cx, cy, v.hd / 2); a.circ(cx, cy, r, 'EQUIP-DETAIL');
      a.log('Added the head, the shank' + (v.pop ? ' and the mandrel stem' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic pin',
    desc: (v) => v.cot ? `Clevis pin, ${v.d} mm by ${v.len} mm: a head, a plain shank, a cross hole with a split cotter pin through it and bent legs.` : `Straight grooved pin, ${v.d} mm by ${v.len} mm: a plain cylinder with three pressed grooves along its length and chamfered ends.`,
    vs: [['clevis pin with cotter, 10 mm x 40 mm', 10, 40, true], ['grooved, 6 mm x 30 mm', 6, 30, false]].map(([l, d, len, cot]) => [l, mi(cot ? 22 : d), mi(cot ? 16 : d), mi(cot ? len + 6 : len), 0, { d, len, cot }]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, r = v.d / 2;
      if (v.cot) {
        a.cyl(cx, cy, a.Z0, a.Z1 - 6, r, 16); a.cyl(cx, cy, a.Z1 - 6, a.Z1, 8, 20);
        const zc = a.Z0 + 7; a.xcyl(cx - 8.5, cx + 8.5, cy, zc, 1.8, 6);
        a.tube([[cx - 11, cy - 2, zc - 3], [cx - 11, cy, zc], [cx - 8.5, cy, zc]], [1.2, 1.2, 1.2], 5); a.tube([[cx + 8.5, cy + 1, zc], [cx + 13, cy + 3, zc + 2], [cx + 15, cy + 3, zc - 4]], [1.5, 1.5, 1.2], 5);
        a.tube([[cx - 8.5, cy - 1, zc - 1], [cx - 12, cy - 4, zc - 3]], [1.2, 1.2], 5);
        a.circ(cx, cy, 8); a.circ(cx, cy, r, 'EQUIP-DETAIL'); a.line(cx - 10, cy, cx + 14, cy, 'EQUIP-DETAIL');
      } else {
        a.cyl(cx, cy, a.Z0 + 0.8, a.Z1 - 0.8, r * 0.96, 18); a.cone(cx, cy, a.Z0, a.Z0 + 0.8, r * 0.75, r * 0.96, 18); a.cone(cx, cy, a.Z1 - 0.8, a.Z1, r * 0.96, r * 0.75, 18);
        for (let i = 0; i < 3; i++) { const t = (i * TAU) / 3 + 0.5; a.tube([[cx + r * 0.99 * m.cos(t), cy + r * 0.99 * m.sin(t), a.Z0 + 1.5], [cx + r * 0.99 * m.cos(t), cy + r * 0.99 * m.sin(t), a.Z1 - 1.5]], [r * 0.12, r * 0.12], 4); }
        a.circ(cx, cy, r); for (let i = 0; i < 3; i++) { const t = (i * TAU) / 3 + 0.5; a.circ(cx + r * m.cos(t), cy + r * m.sin(t), r * 0.14, 'EQUIP-DETAIL'); }
      }
      a.log('Added ' + (v.cot ? 'the head, shank, cross hole and cotter pin' : 'the pin body, the grooves and the chamfers') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/fasteners', title: 'Generic circlip',
    desc: (v) => v.ext ? `External retaining ring, ${v.d} mm shaft, shown sitting in the groove of a short shaft stub: an open ring with a gap and two lugs.` : `Internal retaining ring, ${v.d} mm bore, shown in the groove of a housing ring: an open ring with a gap and two lugs.`,
    vs: [['external, 20 mm shaft', mi(26), mi(26), mi(26), 0, { d: 20, ext: true }], ['internal, 32 mm bore', mi(46), mi(46), mi(22), 0, { d: 32, ext: false }]],
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, z = a.Z0;
      const clip = (zz, ri, ro, tw) => { const n = 24; for (let i = 1; i < n - 1; i++) ring(a, 'z', cx, cy, zz, zz + tw, ri, ro, 1, (i * TAU) / n + 0.3, TAU / n); const g = [0.3, 0.3 - TAU / n]; for (const t of g) { const p = [cx + (ri - 1) * m.cos(t), cy + (ri - 1) * m.sin(t)]; a.cyl(p[0] + 0, p[1] + 0, zz, zz + tw, 2.1, 8); } };
      if (v.ext) {
        a.cyl(cx, cy, z, z + 12, 10, 24); a.cyl(cx, cy, z + 12, z + 14.2, 9, 24); a.cyl(cx, cy, z + 14.2, z + 26, 10, 24);
        clip(z + 12.1, 8.9, 13, 1.2); a.circ(cx, cy, 13); a.circ(cx, cy, 10, 'EQUIP-DETAIL');
      } else {
        ring(a, 'z', cx, cy, z, z + 9, 16, 23, 28); ring(a, 'z', cx, cy, z + 9, z + 10.4, 16, 23, 28); ring(a, 'z', cx, cy, z + 10.4, z + 22, 16, 23, 28);
        clip(z + 9.1, 14.4, 17.9, 1.2); a.circ(cx, cy, 23); a.circ(cx, cy, 16, 'EQUIP-DETAIL');
      }
      a.log('Added the ' + (v.ext ? 'shaft stub with its groove' : 'housing ring with its groove') + ' and the open ring with lugs (plan and 3D).');
    } }),
];

// ============================================================================================= TRANSMISSION
const keyIn = (r, n = 32) => (i) => (i === 7 || i === 8 ? r + r * 0.34 : r);
const transmission = [
  fam({ cat: 'machine/transmission', title: 'Generic spur gear',
    desc: (v) => `Spur gear, ${v.N} teeth, ${v.mod} mm module, ${v.face} mm face width: a toothed rim, ${v.web ? 'a web with spokes, ' : ''}a hub, a bore with a keyway and ${v.hubL ? 'a hub standing proud of the face' : 'no hub'}.`,
    vs: [[1, 20, 10, 6, 12, 6, 0], [2, 24, 20, 14, 28, 10, 0], [2.5, 32, 25, 20, 40, 15, 0], [3, 48, 30, 28, 56, 20, 1], [4, 60, 40, 38, 76, 24, 1]].map(([mod, N, face, bore, hubD, hubL, web]) => [`${N} teeth, ${bore} mm bore, ${mod} mm module`, mi((N + 2) * mod), mi((N + 2) * mod), mi(face + hubL), 0, { mod, N, face, bore, hubD, hubL, web }]),
    build: (a, v) => {
      const { mod, N, face, bore, hubD, hubL, web } = v, cx = a.cx, cy = a.cy, rt = ((N + 2) * mod) / 2, rr = ((N - 2.5) * mod) / 2, z0 = a.Z0, z1 = z0 + face, ZH = a.Z1;
      teeth(a, cx, cy, z0, z1, N, rr * 0.985, rt, (m.PI / N) * 0.62, (m.PI / N) * 0.28);
      if (web) {
        ring(a, 'z', cx, cy, z0, z1, rr - mod * 3.2, rr / m.cos(m.PI / 28), 28); ring(a, 'z', cx, cy, z0, ZH, keyIn(bore / 2), hubD / 2, 32);
        spokes(a, cx, cy, z0 + face * 0.15, z1 - face * 0.15, hubD / 2 - 1, rr - mod * 3, 5, mod * 3.6);
      } else { ring(a, 'z', cx, cy, z0, z1, keyIn(bore / 2), rr / m.cos(m.PI / 32), 32); ring(a, 'z', cx, cy, z1, ZH, keyIn(bore / 2), hubD / 2, 32); }
      a.circ(cx, cy, rt); a.circ(cx, cy, rr, 'EQUIP-DETAIL'); a.circ(cx, cy, (N * mod) / 2, 'EQUIP-HIDDEN'); a.circ(cx, cy, hubD / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, bore / 2, 'EQUIP-DETAIL');
      a.rect(cx - bore * 0.14, cy + bore / 2, cx + bore * 0.14, cy + bore * 0.7, 'EQUIP-DETAIL');
      a.log('Added the toothed rim' + (web ? ', web and spokes' : '') + ', the hub, the bore with its keyway (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic bevel gear',
    desc: (v) => `Straight bevel gear, ${v.N} teeth, ${v.mod} mm module: a conical toothed face on a back plate, a hub with a bore standing below it and teeth drawn as tapered ridges.`,
    vs: [[20, 3, 12, 26], [30, 3.5, 18, 36], [40, 4, 25, 50]].map(([N, mod, bore, hubD]) => { const Ro = (N * mod) / 2 + mod, r = Ro * 0.62, hubL = hubD * 0.5; return [`${N} teeth, ${bore} mm bore`, mi(Ro * 2), mi(Ro * 2), mi(hubL + 3 + (Ro - r)), 0, { N, mod, bore, hubD, hubL, Ro, r }]; }),
    build: (a, v) => {
      const { N, bore, hubD, hubL, Ro, r } = v, cx = a.cx, cy = a.cy, zb = a.Z0 + hubL, hc = a.Z1 - zb - 3;
      ring(a, 'z', cx, cy, a.Z0, zb, keyIn(bore / 2), hubD / 2, 32); a.cyl(cx, cy, zb, zb + 3, Ro * 0.98, 32);
      a.tube([[cx, cy, zb + 3], [cx, cy, zb + 3 + hc]], [Ro * 0.9, r * 0.92], 32);
      const tw = (m.PI * Ro) / N * 0.3;
      for (let i = 0; i < N; i++) { const t = (TAU * i) / N; a.tube([[cx + Ro * 0.97 * m.cos(t), cy + Ro * 0.97 * m.sin(t), zb + 3], [cx + r * m.cos(t), cy + r * m.sin(t), zb + 3 + hc]], [tw, tw * 0.55], 4); }
      a.circ(cx, cy, Ro); a.circ(cx, cy, r, 'EQUIP-DETAIL'); a.circ(cx, cy, hubD / 2, 'EQUIP-HIDDEN'); a.circ(cx, cy, bore / 2, 'EQUIP-DETAIL');
      a.log('Added the back plate, the conical face with tapered tooth ridges, the hub and the bore (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic pulley',
    desc: (v) => v.timing ? `Timing belt pulley, ${v.N} teeth, with a toothed rim, two flanges, a hub and a bore.` : `V-belt pulley with ${v.g} groove${v.g > 1 ? 's' : ''}, ${v.D} mm across: a grooved rim, a hub standing out each side and a bore.`,
    vs: [['V-belt, 1 groove, 100 mm', 100, 24, 1], ['V-belt, 2 grooves, 160 mm', 160, 28, 2], ['V-belt, 3 grooves, 224 mm', 224, 38, 3]].map(([l, D, bore, g]) => { const rw = 8 + g * 14, hubD = bore * 1.9; return [l, mi(D), mi(D), mi(rw + 16), 0, { D, bore, g, rw, hubD }]; })
      .concat([['timing belt, 32 teeth, flanged', mi(60), mi(60), mi(17 + 14), 0, { timing: true, N: 32, D: 60, bore: 12, hubD: 26 }]]),
    build: (a, v) => {
      const cx = a.cx, cy = a.cy, bore = v.bore, hubD = v.hubD, R = v.D / 2;
      if (!v.timing) {
        const z0 = a.Z0 + 8, pts = [[z0, R * 0.9], [z0 + 1.2, R]], z = [z0 + 1.2]; let zc = z0 + 4.5; pts.push([z0 + 4.5, R]);
        for (let i = 0; i < v.g; i++) { pts.push([zc + 1.5, R - 3], [zc + 6, R - 11], [zc + 10.5, R - 3], [zc + 12, R]); zc += 14; }
        pts.push([zc + 0.5, R], [zc + 3.5, R * 0.9]);
        const ze = zc + 3.5; a.tube(pts.map(([zz, r]) => [cx, cy, zz]), pts.map(([, r]) => r), 40);
        ring(a, 'z', cx, cy, a.Z0, a.Z1, keyIn(bore / 2), hubD / 2, 32); a.circ(cx, cy, R); a.circ(cx, cy, R - 11, 'EQUIP-DETAIL');
      } else {
        const N = v.N, rr = 24.5, rl = 26.2;
        ring(a, 'z', cx, cy, a.Z0 + 7, a.Z0 + 17, hubD / 2, rr, 2 * N, 0.0); ring(a, 'z', cx, cy, a.Z0 + 7, a.Z0 + 17, rr - 0.1, (t, i) => (i % 2 ? rl : rr), 2 * N);
        ring(a, 'z', cx, cy, a.Z0 + 4, a.Z0 + 7, bore / 2, 30, 32); ring(a, 'z', cx, cy, a.Z0 + 17, a.Z0 + 20, bore / 2, 30, 32); ring(a, 'z', cx, cy, a.Z0, a.Z1, keyIn(bore / 2), hubD / 2, 32);
        a.circ(cx, cy, 30); a.circ(cx, cy, rl, 'EQUIP-DETAIL');
      }
      a.circ(cx, cy, hubD / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, bore / 2, 'EQUIP-DETAIL');
      a.log('Added the ' + (v.timing ? 'toothed rim, flanges' : 'grooved rim') + ', the hub and the bore (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic roller chain sprocket',
    desc: (v) => `Roller chain sprocket, ${v.N} teeth for ${v.p} mm pitch chain${v.strands === 2 ? ', two strands' : ''}: a toothed plate, a hub standing proud and a bore with a keyway${v.sp ? ', with spokes in the plate' : ''}.`,
    vs: [[12.7, 15, 7, 12, 28, 12, 1, 0], [12.7, 25, 7, 20, 40, 15, 1, 0], [12.7, 40, 7, 25, 50, 18, 1, 1], [19.05, 22, 25, 25, 55, 22, 2, 0]].map(([p, N, t, bore, hubD, hubL, strands, sp]) => { const pd = p / m.sin(m.PI / N), rt = pd / 2 + 0.3 * p; return [`${N} teeth, ${p} mm pitch${strands === 2 ? ', double' : ''}`, mi(rt * 2), mi(rt * 2), mi(t + hubL), 0, { p, N, t, bore, hubD, hubL, strands, sp, pd, rt }]; }),
    build: (a, v) => {
      const { p, N, t, bore, hubD, hubL, strands, sp, pd, rt } = v, cx = a.cx, cy = a.cy, rr = pd / 2 - 0.25 * p;
      const plate = (z0, z1) => { teeth(a, cx, cy, z0, z1, N, rr * 1.0, rt, (m.PI / N) * 0.95, (m.PI / N) * 0.18); if (sp) { ring(a, 'z', cx, cy, z0, z1, rr - 8, rr / m.cos(m.PI / 36), 36); } else ring(a, 'z', cx, cy, z0, z1, keyIn(bore / 2), rr / m.cos(m.PI / 36), 36); };
      if (strands === 2) { plate(a.Z0, a.Z0 + 11); plate(a.Z0 + 14, a.Z0 + 25); ring(a, 'z', cx, cy, a.Z0 + 10, a.Z0 + 15, keyIn(bore / 2), rr * 0.6, 32); }
      else plate(a.Z0, a.Z0 + t);
      ring(a, 'z', cx, cy, a.Z0, a.Z1, keyIn(bore / 2), hubD / 2, 32);
      if (sp) spokes(a, cx, cy, a.Z0, a.Z0 + t, hubD / 2 - 1, rr - 7, 5, 11);
      a.circ(cx, cy, rt); a.circ(cx, cy, pd / 2, 'EQUIP-HIDDEN'); a.circ(cx, cy, hubD / 2, 'EQUIP-DETAIL'); a.circ(cx, cy, bore / 2, 'EQUIP-DETAIL');
      a.log('Added the toothed plate' + (strands === 2 ? 's' : '') + ', the hub and the keyed bore (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic stepped shaft with key',
    desc: (v) => `Stepped drive shaft, ${v.D} mm main diameter and ${v.L} mm long, lying on its side: bearing seats, a circlip groove, a keyed seat with the key standing in it and a threaded end drawn as rings.`,
    vs: [[20, 250], [30, 400], [50, 600]].map(([D, L]) => [`${D} mm x ${L} mm`, mi(L), mi(D), mi(D * 1.12), 0, { D, L }]),
    build: (a, v) => {
      const { D, L } = v, zc = a.Z0 + D / 2, y = a.cy, x0 = a.X0, X = (f) => x0 + f * L, seg = [[0, 0.1, 0.76], [0.1, 0.2, 0.9], [0.2, 0.225, 0.8], [0.225, 0.3, 0.9], [0.3, 0.6, 1.0], [0.6, 0.8, 0.9], [0.8, 0.9, 0.86], [0.9, 1.0, 0.7]];
      for (const [f0, f1, k] of seg) a.xcyl(X(f0), X(f1), y, zc, (D / 2) * k, 20);
      a.xcyl(X(0.995), X(1.0), y, zc, (D / 2) * 0.62, 12); a.xcyl(X(0.9), X(1.0), y, zc, (D / 2) * 0.64, 12);
      const tl = X(0.9), pitch = D < 25 ? 1.5 : D < 40 ? 2 : 3; { const pts = [], rd = [], n = m.min(16, m.floor((L * 0.1) / pitch)); for (let i = 0; i <= 2 * n; i++) { pts.push([X(0.9) + (i * L * 0.1) / (2 * n), y, zc]); rd.push(i % 2 ? (D / 2) * 0.7 : (D / 2) * 0.6); } a.tube(pts, rd, 12); }
      a.box(X(0.64), y - D * 0.1, zc + (D / 2) * 0.9 - D * 0.04, X(0.78), y + D * 0.1, a.Z1);
      a.xcyl(X(0.3), X(0.302), y, zc, (D / 2) * 1.04, 20); a.xcyl(X(0.6), X(0.602), y, zc, (D / 2) * 1.04, 20);
      a.rect(X(0), y - D / 2 * 0.76, X(0.1), y + D / 2 * 0.76, 'EQUIP'); for (const [f0, f1, k] of seg.slice(1)) a.rect(X(f0), y - (D / 2) * k, X(f1), y + (D / 2) * k, 'EQUIP');
      a.rect(X(0.64), y - D * 0.1, X(0.78), y + D * 0.1, 'EQUIP-DETAIL'); a.line(X(0), y, X(1), y, 'EQUIP-HIDDEN');
      a.log('Added the stepped journals, circlip groove, the key in its seat and the ring thread at the end (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic shaft coupling',
    desc: (v) => v.sleeve ? `Rigid sleeve coupling, ${v.OD} mm across with a ${v.bore} mm bore, lying on its side with a split slot and two set screws on top.` : `Jaw coupling, ${v.OD} mm across for ${v.bore} mm shafts, lying on its side: two hubs with set screws, interlocking jaws and a soft spider between them.`,
    vs: [['jaw type, 14 mm bore', 50, 40, 14, false], ['jaw type, 28 mm bore', 100, 82, 28, false], ['rigid sleeve, 25 mm bore', 70, 45, 25, true]].map(([l, L, OD, bore, sleeve]) => [l, mi(L), mi(OD), mi(OD), 0, { L, OD, bore, sleeve }]),
    build: (a, v) => {
      const { L, OD, bore, sleeve } = v, zc = a.Z0 + OD / 2, y = a.cy, x0 = a.X0, hr = OD * 0.4;
      const setScrew = (x) => { a.cyl(x, y, zc + hr - 1, zc + hr + 3, bore * 0.18, 8); };
      if (sleeve) {
        ring(a, 'x', y, zc, x0, x0 + L, bore / 2, OD / 2, 28); setScrew(x0 + L * 0.2); setScrew(x0 + L * 0.8); a.box(x0 + L * 0.46, y - 1.5, zc + OD / 2 - 1, x0 + L * 0.54, y + 1.5, zc + OD / 2 + 0.1);
        a.rect(x0, y - OD / 2, x0 + L, y + OD / 2); a.line(x0 + L / 2, y - OD / 2, x0 + L / 2, y + OD / 2, 'EQUIP-DETAIL'); a.line(x0, y - bore / 2, x0 + L, y - bore / 2, 'EQUIP-HIDDEN'); a.line(x0, y + bore / 2, x0 + L, y + bore / 2, 'EQUIP-HIDDEN');
      } else {
        const hl = L * 0.38, jl = L * 0.24, sp = L - 2 * hl - 2 * 0; 
        for (const s of [0, 1]) {
          const xa = s ? x0 + L - hl : x0, xb = s ? x0 + L : x0 + hl, xj = s ? xa : xb;   // hub body outside, jaw ring inside
          ring(a, 'x', y, zc, s ? xa + jl : xa, s ? xb : xb - jl, bore / 2, hr, 24); ring(a, 'x', y, zc, s ? xa : xb - jl, s ? xa + jl : xb, bore / 2, OD / 2, 24);
          setScrew(s ? xa + (hl - jl) * 0.5 + jl : xa + (hl - jl) * 0.5);
          for (let j = 0; j < 3; j++) { const t0 = (TAU * j) / 3 + 0.2 + s * 0.0, t1 = t0 + 0.8, r1 = bore / 2 * 1.5, r2 = OD / 2 * 0.98, pts = [[y + r1 * m.cos(t0), zc + r1 * m.sin(t0)], [y + r2 * m.cos(t0), zc + r2 * m.sin(t0)], [y + r2 * m.cos(t1), zc + r2 * m.sin(t1)], [y + r1 * m.cos(t1), zc + r1 * m.sin(t1)]]; if (s) prismX(a, pts, xa - 0.6 + 0, xa + jl * 0.9 - 0.6 + 0.6 * 0); else prismX(a, pts, xb - jl * 0.9, xb + 0.6); }
        }
        const xs = x0 + hl - jl * 0.9 + 0, xe = x0 + L - hl + jl * 0.9;
        ring(a, 'x', y, zc, x0 + hl, x0 + L - hl, bore / 2 * 1.4, OD / 2 * 0.86, 24);
        a.rect(x0, y - hr, x0 + hl, y + hr); a.rect(x0 + L - hl, y - hr, x0 + L, y + hr); a.rect(x0 + hl, y - OD / 2 * 0.86, x0 + L - hl, y + OD / 2 * 0.86, 'EQUIP-DETAIL'); a.line(x0, y, x0 + L, y, 'EQUIP-HIDDEN');
      }
      a.log('Added the hubs, the bore, ' + (sleeve ? 'the split slot' : 'the jaws and the spider') + ' and the set screws (plan and 3D).');
    } }),
  fam({ cat: 'machine/transmission', title: 'Generic ball bearing',
    desc: (v) => `Deep groove ball bearing, ${v.B} mm bore and ${v.Dd} mm outside diameter, ${v.Wd} mm wide: an inner and an outer race${v.shield ? ' with a flat shield on the visible side' : ' with the balls and cage showing'}.`,
    vs: [[8, 22, 7, 7, false], [25, 52, 15, 9, true], [50, 90, 20, 11, false]].map(([B, Dd, Wd, nb, shield]) => [`${B} mm bore, ${shield ? 'shielded' : 'open'}`, mi(Dd), mi(Dd), mi(Wd), 0, { B, Dd, Wd, nb, shield }]),
    build: (a, v) => {
      const { B, Dd, Wd, nb, shield } = v, cx = a.cx, cy = a.cy, pr = (B + Dd) / 4, br = ((Dd - B) / 2) * 0.285, z0 = a.Z0, zm = z0 + Wd / 2, bt = (Dd - B) / 2;
      ring(a, 'z', cx, cy, z0, a.Z1, B / 2, pr - br * 0.55, 32); ring(a, 'z', cx, cy, z0, a.Z1, pr + br * 0.55, Dd / 2, 40);
      if (shield) { ring(a, 'z', cx, cy, a.Z1 - Wd * 0.14, a.Z1 - Wd * 0.06, pr - br * 0.55 - 0.1, pr + br * 0.55 + 0.1, 40); }
      else { for (let i = 0; i < nb; i++) { const t = (TAU * i) / nb; a.ell(cx + pr * m.cos(t), cy + pr * m.sin(t), zm, br, br, br, 10, 6); } ring(a, 'z', cx, cy, zm - br * 0.25, zm + br * 0.25, pr - br * 0.6, pr + br * 0.6, 36); }
      a.circ(cx, cy, Dd / 2); a.circ(cx, cy, pr + br * 0.55, 'EQUIP-DETAIL'); a.circ(cx, cy, pr - br * 0.55, 'EQUIP-DETAIL'); a.circ(cx, cy, B / 2, 'EQUIP-DETAIL');
      a.log('Added the inner and outer race, ' + (shield ? 'the shield' : 'the balls and the cage') + ' and the bore (plan and 3D).');
    } }),
];

// ============================================================================================= FRAMES
const boltHead = (a, x, y, z, r, h) => { a.prism(ptsC(x, y, r, 6, 0.3), z, z + h); };
const boltHeadX = (a, x, y, z, r, h, dir = 1) => { prismX(a, ptsC(y, z, r, 6, 0.3), x, x + dir * h); };
const boltHeadY = (a, x, y, z, r, h, dir = 1) => { prismY(a, ptsC(x, z, r, 6, 0.3), y, y + dir * h); };

const frames = [
  fam({ cat: 'machine/frames', title: 'Generic gearbox housing',
    desc: (v) => `Cast inline gearbox housing, ${v.Lb} mm body: a foot plate with four mounting holes, a chamfered body with ribs, an inspection cover with bolts, a breather, an oil sight glass and drain plug, bearing caps with bolts and an input and output shaft with keys.`,
    vs: [['small, 150 mm body', 150, 110, 130], ['medium, 220 mm body', 220, 170, 190], ['large, 340 mm body', 340, 250, 290]].map(([l, Lb, Db, Hb]) => { const sl = Lb * 0.2, ft = Db * 0.16; return [l, mi(Lb + 2 * sl), mi(Db + 2 * ft), mi(Hb), 0, { Lb, Db, Hb, sl, ft }]; }),
    build: (a, v) => {
      const { Lb, Db, Hb, sl, ft } = v, H = a.H, bx0 = a.X0 + sl, bx1 = a.X1 - sl, y0 = a.YF + ft, y1 = a.YB - ft, tb = H * 0.09, top = a.Z0 + H * 0.86, zc = a.Z0 + H * 0.5, cx = a.cx;
      plateHoles(a, bx0 - 6, a.YF, bx1 + 6, a.YB, a.Z0, a.Z0 + tb, [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => ({ x: sx > 0 ? bx1 - Lb * 0.06 : bx0 + Lb * 0.06, y: sy < 0 ? a.YF + ft * 0.5 : a.YB - ft * 0.5, rx: Lb * 0.03, ry: Lb * 0.03 })), 4);
      const ch = H * 0.12; prismX(a, [[y0, a.Z0 + tb], [y1, a.Z0 + tb], [y1, top - ch], [y1 - ch, top], [y0 + ch, top], [y0, top - ch]], bx0, bx1);
      for (const k of [0.2, 0.5, 0.8]) { a.box(bx0 + (bx1 - bx0) * k - 5, y0 - 5, a.Z0 + tb, bx0 + (bx1 - bx0) * k + 5, y0, top - ch); a.box(bx0 + (bx1 - bx0) * k - 5, y1, a.Z0 + tb, bx0 + (bx1 - bx0) * k + 5, y1 + 5, top - ch); }
      const br = H * 0.3, capL = Lb * 0.05;
      for (const s of [-1, 1]) {
        const xe = s < 0 ? bx0 : bx1;
        a.xcyl(s < 0 ? xe - capL : xe, s < 0 ? xe : xe + capL, a.cy, zc, br, 24);
        for (let i = 0; i < 6; i++) { const t = (TAU * i) / 6; boltHeadX(a, s < 0 ? xe - capL : xe + capL, a.cy + (br * 0.8) * m.cos(t), zc + br * 0.8 * m.sin(t), H * 0.022, H * 0.025, s < 0 ? -1 : 1); }
        const sr = H * 0.095; a.xcyl(s < 0 ? a.X0 : xe + capL, s < 0 ? xe - capL : a.X1, a.cy, zc, sr, 16);
        const kx0 = s < 0 ? a.X0 + sl * 0.15 : xe + capL + sl * 0.25, kx1 = kx0 + sl * 0.6; a.box(kx0, a.cy - sr * 0.22, zc + sr * 0.85, kx1, a.cy + sr * 0.22, zc + sr * 1.18);
        a.rect(s < 0 ? a.X0 : xe + capL, a.cy - sr, s < 0 ? xe - capL : a.X1, a.cy + sr, 'EQUIP-DETAIL');
      }
      a.box(cx - Lb * 0.2, a.cy - Db * 0.22, top, cx + Lb * 0.2, a.cy + Db * 0.22, top + H * 0.025);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) boltHead(a, cx + sx * Lb * 0.17, a.cy + sy * Db * 0.19, top + H * 0.025, H * 0.02, H * 0.02);
      a.cyl(cx, a.cy, top + H * 0.025, a.Z1 - H * 0.02, H * 0.035, 10); a.prism(ptsC(cx, a.cy, H * 0.05, 6), a.Z1 - H * 0.025, a.Z1);
      a.ycyl(y0 - H * 0.03, y0 + 2, cx - Lb * 0.18, zc - H * 0.12, H * 0.07, 16); a.ycyl(y0 - H * 0.045, y0 - H * 0.02, cx - Lb * 0.18, zc - H * 0.12, H * 0.045, 12);
      a.ycyl(y0 - H * 0.04, y0 + 2, cx + Lb * 0.2, a.Z0 + H * 0.25, H * 0.04, 8); boltHeadY(a, cx + Lb * 0.2, y0 - H * 0.04, a.Z0 + H * 0.25, H * 0.05, H * 0.03, -1);
      a.rect(bx0, y0, bx1, y1); a.rect(cx - Lb * 0.2, a.cy - Db * 0.22, cx + Lb * 0.2, a.cy + Db * 0.22, 'EQUIP-DETAIL'); a.circ(cx, a.cy, H * 0.05, 'EQUIP-DETAIL'); a.rect(bx0 - 6, a.YF, bx1 + 6, a.YB, 'EQUIP-DETAIL');
      a.log('Added the foot plate with mounting holes, the chamfered ribbed body, the cover, breather, sight glass, drain plug, bearing caps and the keyed shafts (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic motor on adjustable slide base',
    desc: (v) => `Electric motor, ${v.Dm} mm frame, on an adjustable slide base: a foundation plate, two slotted rails, motor feet bolted down, a finned body, fan cover, terminal box, keyed shaft and a jack screw at each end.`,
    vs: [['small, 140 mm frame', 140, 460, 260, 300], ['large, 220 mm frame', 220, 720, 400, 460]].map(([l, Dm, W, D, H]) => [l, mi(W), mi(D), mi(H), 0, { Dm }]),
    build: (a, v) => {
      const Dm = v.Dm, r = Dm / 2, cx = a.cx, y = a.cy, tp = Dm * 0.06, rl = Dm * 0.09, ex = Dm * 0.3;
      plateHoles(a, a.X0, a.YF, a.X1, a.YB, a.Z0, a.Z0 + tp, [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => ({ x: cx + sx * (a.W / 2 - Dm * 0.14), y: y + sy * (a.D / 2 - Dm * 0.14), rx: Dm * 0.05, ry: Dm * 0.05 })), 4);
      const rx0 = a.X0 + ex, rx1 = a.X1 - ex;
      for (const sy of [-1, 1]) {
        const yc = y + sy * Dm * 0.58;
        plateHoles(a, rx0, yc - Dm * 0.15, rx1, yc + Dm * 0.15, a.Z0 + tp, a.Z0 + tp + rl, [-1, 1].map((sx) => ({ x: cx + sx * (rx1 - rx0) * 0.22, y: yc, rx: Dm * 0.13, ry: Dm * 0.045 })), 4);
      }
      const zb = a.Z0 + tp + rl, zc = zb + Dm * 0.06 + r * 1.0 + 0, L = (rx1 - rx0) * 0.78, mx0 = cx - L / 2 - Dm * 0.15;
      const mx1 = mx0 + L;
      for (const sy of [-1, 1]) for (const sx of [0.18, 0.72]) a.box(mx0 + L * sx, y + sy * Dm * 0.58 - Dm * 0.15, zb, mx0 + L * sx + Dm * 0.3, y + sy * Dm * 0.58 + Dm * 0.15, zb + Dm * 0.06);
      a.box(mx0 + L * 0.15, y - Dm * 0.58 - Dm * 0.15 + Dm * 0.0, zb + Dm * 0.06, mx0 + L * 0.88, y + Dm * 0.58 + Dm * 0.15, zb + Dm * 0.06 + 1);
      { const pts = [], rd = [], n = 14; for (let i = 0; i <= 2 * n; i++) { pts.push([mx0 + L * 0.1 + (i * L * 0.75) / (2 * n), y, zc]); rd.push(i % 2 ? r : r * 1.06); } a.tube(pts, rd, 22); }
      a.tube([[mx0, y, zc], [mx0 + L * 0.1, y, zc]], [r * 0.9, r], 22); a.tube([[mx0 + L * 0.85, y, zc], [mx0 + L, y, zc]], [r * 0.95, r * 0.9], 22);
      a.xcyl(mx1 - L * 0.02, mx1 + Dm * 0.0, y, zc, r * 0.7, 18);
      a.xcyl(mx0 - ex * 0.8, mx0, y, zc, r * 0.2, 14); a.box(mx0 - ex * 0.6, y - r * 0.07, zc + r * 0.16, mx0 - ex * 0.15, y + r * 0.07, zc + r * 0.3);
      a.box(cx - Dm * 0.2, y - Dm * 0.16, zc + r * 0.95, cx + Dm * 0.2, y + Dm * 0.16, zc + r * 0.95 + Dm * 0.16); boltHead(a, cx, y, zc + r * 0.95 + Dm * 0.16, Dm * 0.05, Dm * 0.02); a.cyl(cx - Dm * 0.2 - Dm * 0.03, y, zc + r * 0.95 + Dm * 0.06, zc + r * 0.95 + Dm * 0.1, Dm * 0.04, 8);
      for (const sx of [rx0 + 4, rx1 - 4 - Dm * 0.12]) { a.box(sx, y - Dm * 0.1, zb, sx + Dm * 0.12, y + Dm * 0.1, zb + Dm * 0.18); a.xcyl(sx + (sx < cx ? Dm * 0.12 : -Dm * 0.12), sx + (sx < cx ? Dm * 0.3 : -Dm * 0.3), y, zb + Dm * 0.09, Dm * 0.025, 8); }
      a.rect(a.X0, a.YF, a.X1, a.YB); a.rect(mx0 + L * 0.1, y - r, mx1, y + r, 'EQUIP-DETAIL'); a.rect(cx - Dm * 0.2, y - Dm * 0.16, cx + Dm * 0.2, y + Dm * 0.16, 'EQUIP-DETAIL'); a.rect(mx0 - ex * 0.8, y - r * 0.2, mx0, y + r * 0.2, 'EQUIP-DETAIL');
      a.log('Added the foundation plate, the slotted rails, the finned motor with fan cover, terminal box and keyed shaft, and the jack screws (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic pillow block bearing housing',
    desc: (v) => `Cast pillow block for a ${v.B} mm shaft, ${v.L} mm long: a base with two slotted bolt holes, a rounded housing around a bearing insert with a bore, a set screw and a grease nipple on top.`,
    vs: [[20, 127, 62, 34], [30, 167, 84, 40], [50, 233, 120, 54]].map(([B, L, H, D]) => [`${B} mm bore`, mi(L), mi(D), mi(H), 0, { B, L, H, D }]),
    build: (a, v) => {
      const { B, L, H } = v, cx = a.cx, zc = a.Z0 + H * 0.5, yb = a.YB, yf = a.YF, tb = H * 0.2, ho = H * 0.38;
      plateHoles(a, a.X0, yf + 1, a.X1, yb - 1, a.Z0, a.Z0 + tb, [-1, 1].map((sx) => ({ x: cx + sx * L * 0.4, y: a.cy, rx: L * 0.06, ry: L * 0.032 })), 4);
      a.box(cx - L * 0.2, yf + 3, a.Z0 + tb, cx + L * 0.2, yb - 3, zc - ho * 0.62);
      const ins = B / 2 + (ho - B / 2) * 0.35;
      ring(a, 'y', cx, zc, yf + 3, yb - 3, ins, sqRo(ho), 16, 0); ring(a, 'y', cx, zc, yf, yb, B / 2, ins, 24);
      boltHeadY(a, cx + ins * 0.9 * 0, yb - 3, zc + ho * 0.78, H * 0.04, H * 0.03, 0.0 + 1); a.cyl(cx, a.cy, zc + ho, a.Z1 - H * 0.02, H * 0.028, 8); a.ell(cx, a.cy, a.Z1 - H * 0.03, H * 0.04, H * 0.04, H * 0.03, 8, 5);
      a.cyl(cx + ho * 0.9, a.cy, zc - 2, zc + 2 + H * 0.0, 1.5, 6);
      a.rect(a.X0, yf + 1, a.X1, yb - 1); a.rect(cx - ho, yf + 3, cx + ho, yb - 3, 'EQUIP-DETAIL'); a.circ(cx, a.cy, H * 0.028, 'EQUIP-DETAIL');
      a.log('Added the base with slotted holes, the rounded housing, the bearing insert and bore, the set screw and the grease nipple (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic square flange bearing block',
    desc: (v) => `Square flange bearing block for a ${v.B} mm shaft: a ${v.S} mm square flange with four bolt holes, a raised round boss and a bearing insert with a bore and grease nipple.`,
    vs: [[20, 86, 33], [30, 112, 42]].map(([B, S, D]) => [`${B} mm bore`, mi(S), mi(D), mi(S), 0, { B, S, D }]),
    build: (a, v) => {
      const { B, S, D } = v, cx = a.cx, zc = a.Z0 + S / 2, fy = D * 0.34, ho = S * 0.28, e = S * 0.16, bx = S / 2 - e;
      plateHoles(a, a.X0, a.Z0, a.X1, a.Z1, a.YB - fy, a.YB, [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => ({ x: cx + sx * bx, y: zc + sz * bx, rx: S * 0.065, ry: S * 0.065 })), 4, 'y');
      a.rect(a.X0, a.YB - fy, a.X1, a.YB);
      const ins = B / 2 + (ho - B / 2) * 0.4; ring(a, 'y', cx, zc, a.YF + 4, a.YB - fy, ins, ho, 24); ring(a, 'y', cx, zc, a.YF, a.YB - fy * 0.6, B / 2, ins, 24);
      a.cyl(cx, a.YF + (D - fy) * 0.5, zc + ho, a.Z1 - 1, S * 0.03, 8); a.ell(cx, a.YF + (D - fy) * 0.5, a.Z1 - 2.5, S * 0.04, S * 0.04, S * 0.03, 8, 5);
      a.circ(cx, a.YF + 10, 1, 'EQUIP-HIDDEN'); a.rect(cx - ho, a.YF + 4, cx + ho, a.YB - fy, 'EQUIP-DETAIL'); a.rect(cx - B / 2, a.YF, cx + B / 2, a.YB - fy * 0.6, 'EQUIP-DETAIL');
      a.log('Added the square flange with four bolt holes, the round boss, the bearing insert with its bore and the grease nipple (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic angle bracket',
    desc: (v) => `Steel angle bracket, ${v.A} x ${v.Bw} x ${v.Wd} in: a vertical leg and a base leg with ${v.nh} bolt holes each${v.g ? ` and ${v.g} triangular gusset${v.g > 1 ? 's' : ''}` : ''}, with a filled bend.`,
    vs: [['3 x 3 in, 2 in wide', 3, 3, 2, 0.125, 2, 0], ['4 x 6 in, 3 in wide, one gusset', 4, 6, 3, 0.1875, 2, 1], ['6 x 6 in, 4 in wide, two gussets', 6, 6, 4, 0.25, 3, 2]].map(([l, A, Bw, Wd, t, nh, g]) => [l, Wd, A, Bw, 0, { A, Bw, Wd, t, nh, g }]),
    build: (a, v) => {
      const t = v.t * IN, hr = t * 1.6, cx = a.cx, ya = a.YF, yb = a.YB, d = a.D, nh = v.nh;
      const hl = (len, ax) => Array.from({ length: nh }, (_, i) => { const f = (i + 1) / (nh + 1); return { x: a.X0 + a.W * (nh === 1 ? 0.5 : (i + 0.5) / nh), y: 0, rx: t * 1.5, ry: t * 1.5 }; });
      plateHoles(a, a.X0, ya, a.X1, yb, a.Z0, a.Z0 + t, Array.from({ length: nh }, (_, i) => ({ x: a.X0 + (a.W * (i + 0.5)) / nh, y: ya + d * 0.62, rx: t * 1.6, ry: t * 1.6 })), 4);
      plateHoles(a, a.X0, a.Z0 + t, a.X1, a.Z1, yb - t, yb, Array.from({ length: nh }, (_, i) => ({ x: a.X0 + (a.W * (i + 0.5)) / nh, y: a.Z0 + (a.H - t) * 0.62 + t, rx: t * 1.6, ry: t * 1.6 })), 4, 'y');
      prismX(a, [[yb - t - hr, a.Z0 + t], [yb - t, a.Z0 + t], [yb - t, a.Z0 + t + hr]], a.X0, a.X1);
      for (let i = 0; i < v.g; i++) { const gx = a.X0 + (a.W * (i + 1)) / (v.g + 1); prismX(a, [[yb - t, a.Z0 + t], [ya + d * 0.12, a.Z0 + t], [yb - t, a.Z0 + a.H * 0.8]], gx - t * 0.6, gx + t * 0.6); a.line(gx, ya + d * 0.12, gx, yb - t, 'EQUIP-DETAIL'); }
      a.rect(a.X0, ya, a.X1, yb); a.line(a.X0, yb - t, a.X1, yb - t, 'EQUIP-DETAIL');
      a.log('Added the base and vertical legs with their bolt holes, the filled bend' + (v.g ? ' and the gusset' + (v.g > 1 ? 's' : '') : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic welded base frame',
    desc: (v) => `Welded rectangular tube skid frame, ${v.L} x ${v.Wf} in: two side beams, end rails, ${v.nc} cross members, a leveling foot under each corner${v.lugs ? ' and four lifting lugs with holes' : ''}.`,
    vs: [['36 x 24 in, two cross members', 36, 24, 8, 2, false], ['60 x 30 in, three cross members', 60, 30, 10, 3, false], ['96 x 36 in, five cross members, lifting lugs', 96, 36, 12, 5, true]].map(([l, L, Wf, H, nc, lugs]) => [l, L, Wf, H, 0, { L, Wf, nc, lugs }]),
    build: (a, v) => {
      const tw = 2 * IN, th = a.H > 9 * IN ? 4 * IN : 3 * IN, fz = a.Z0 + a.H * 0.2, zt = fz + th, yf = a.YF, yb = a.YB, xs = [a.X0, a.X1];
      const sb = (x0, y0, x1, y1) => { a.box(x0, y0, fz, x1, y1, zt); a.rect(x0, y0, x1, y1); a.line((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, 'EQUIP-DETAIL'); };
      a.box(a.X0, yf, fz, a.X1, yf + tw, zt); a.box(a.X0, yb - tw, fz, a.X1, yb, zt); a.rect(a.X0, yf, a.X1, yf + tw); a.rect(a.X0, yb - tw, a.X1, yb);
      a.box(a.X0, yf + tw, fz, a.X0 + tw, yb - tw, zt); a.box(a.X1 - tw, yf + tw, fz, a.X1, yb - tw, zt); a.rect(a.X0, yf + tw, a.X0 + tw, yb - tw); a.rect(a.X1 - tw, yf + tw, a.X1, yb - tw);
      for (let i = 1; i <= v.nc; i++) { const x = a.X0 + (a.W * i) / (v.nc + 1); a.box(x - tw / 2, yf + tw, fz + th * 0.15, x + tw / 2, yb - tw, zt - th * 0.15); a.rect(x - tw / 2, yf + tw, x + tw / 2, yb - tw, 'EQUIP-DETAIL'); }
      const fr = 22; for (const x of [a.X0 + tw * 0.9 + 20, a.X1 - tw * 0.9 - 20]) for (const y of [yf + tw / 2, yb - tw / 2]) {
        a.cyl(x, y, a.Z0 + 10, fz, 8, 8); a.cyl(x, y, a.Z0 + 4, a.Z0 + 10, 20, 14); boltHead(a, x, y, a.Z0 + 28, 14, 10); a.cyl(x, y, a.Z0, a.Z0 + 4, 28, 14); a.circ(x, y, 28, 'EQUIP-DETAIL'); }
      if (v.lugs) for (const x of [a.X0 + a.W * 0.12, a.X1 - a.W * 0.12]) { plateHoles(a, x - 40, zt, x + 40, zt + 80, yf + tw / 2 - 6, yf + tw / 2 + 6, [{ x, y: zt + 48, rx: 17, ry: 17 }], 4, 'y'); plateHoles(a, x - 40, zt, x + 40, zt + 80, yb - tw / 2 - 6, yb - tw / 2 + 6, [{ x, y: zt + 48, rx: 17, ry: 17 }], 4, 'y'); a.circ(x, yf + tw / 2, 17, 'EQUIP-DETAIL'); }
      a.log('Added the side beams, end rails and cross members, the leveling foot at each corner' + (v.lugs ? ' and the lifting lugs with holes' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic aluminium T-slot profile',
    desc: (v) => `Aluminium T-slot extrusion, ${v.S} x ${v.S} mm with a ${v.s} mm slot on each face, ${v.Ln} in long${v.dbl ? ', two profiles side by side' : ''}: lipped slots, corner blocks, diagonal webs and a centre bore, lying along the depth.`,
    vs: [['20 x 20 mm, 12 in', 20, 6, 12, false], ['30 x 30 mm, 12 in', 30, 8, 12, false], ['40 x 40 mm, 12 in', 40, 10, 12, false], ['40 x 80 mm, 24 in', 40, 10, 24, true]].map(([l, S, s, Ln, dbl]) => [l, mi(dbl ? S * 2 : S), Ln, mi(S), 0, { S, s, Ln, dbl }]),
    build: (a, v) => {
      const n = v.dbl ? 2 : 1, zc = a.Z0 + v.S / 2;
      for (let i = 0; i < n; i++) extrusion(a, 'y', a.X0 + v.S * (i + 0.5), zc, a.YF, a.YB, v.S, v.s);
      a.rect(a.X0, a.YF, a.X1, a.YB); for (let i = 0; i < n; i++) { const xc = a.X0 + v.S * (i + 0.5); a.line(xc - v.s / 2, a.YF, xc - v.s / 2, a.YB, 'EQUIP-DETAIL'); a.line(xc + v.s / 2, a.YF, xc + v.s / 2, a.YB, 'EQUIP-DETAIL'); }
      a.log('Added the lipped T-slots, corner blocks, diagonal webs and centre bore along the length (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic T-slot profile joint',
    desc: (v) => `Two ${v.S} mm aluminium profiles ${v.tee ? 'in a T joint' : 'in a 90 degree corner'}, each ${v.arm} mm long, joined by ${v.tee ? 'two triangular gusset plates' : 'a triangular gusset plate'} with four bolts on the front.`,
    vs: [['90 degree corner, 30 mm', 30, 8, 0], ['90 degree corner, 40 mm', 40, 10, 0], ['T joint with two gussets, 40 mm', 40, 10, 1]].map(([l, S, s, tee]) => { const arm = S * 6; return [l, mi(arm + S), mi(S + 6), mi(arm + S), 0, { S, s, tee, arm }]; }),
    build: (a, v) => {
      const { S, s, tee, arm } = v, ya = a.YB - S / 2, xa = tee ? a.cx : a.X0 + S / 2;
      extrusion(a, 'x', ya, a.Z1 - S / 2, a.X0, a.X1, S, s);
      extrusion(a, 'z', xa, ya, a.Z0, a.Z1 - S, S, s);
      const gs = S * 1.9, gt = 5, yf = a.YF + 0;
      const gus = (x0, dir) => { const pts = [[x0, a.Z1 - S - 0], [x0 + dir * gs, a.Z1 - S], [x0, a.Z1 - S - gs]]; prismY(a, pts, a.YB - S - gt + 0, a.YB - S); for (const [bx, bz] of [[x0 + dir * 0.12 * gs, a.Z1 - S - 0.12 * gs], [x0 + dir * 0.55 * gs, a.Z1 - S - 0.1 * gs]]) boltHeadY(a, bx, a.YB - S - gt, bz, 5, 3, -1); boltHeadY(a, x0 + dir * 0.1 * gs, a.YB - S - gt, a.Z1 - S - 0.55 * gs, 5, 3, -1); };
      if (tee) { gus(xa - S / 2, -1); gus(xa + S / 2, 1); } else gus(xa + S / 2, 1);
      a.rect(a.X0, ya - S / 2, a.X1, ya + S / 2); a.rect(xa - S / 2, ya - S / 2, xa + S / 2, ya + S / 2, 'EQUIP-DETAIL');
      a.log('Added the two profiles with their slots and webs, the gusset plate' + (tee ? 's' : '') + ' and the bolts (plan and 3D).');
    } }),
  fam({ cat: 'machine/frames', title: 'Generic machine leveling foot',
    desc: (v) => `Machine leveling foot, ${v.d} mm stud and ${v.Pd} mm pad: a round base pad, a ball seat, a threaded stud drawn as rings with a hex adjusting section and a lock nut.`,
    vs: [['12 mm stud, 60 mm pad', 12, 60, 90], ['20 mm stud, 100 mm pad', 20, 100, 150]].map(([l, d, Pd, H]) => [l, mi(Pd), mi(Pd), mi(H), 0, { d, Pd, H }]),
    build: (a, v) => {
      const { d, Pd, H } = v, cx = a.cx, cy = a.cy, r = d / 2, p = ISO[d].p;
      a.cyl(cx, cy, a.Z0, a.Z0 + H * 0.08, Pd / 2, 24); a.cyl(cx, cy, a.Z0 + H * 0.08, a.Z0 + H * 0.12, Pd * 0.45, 24);
      a.ell(cx, cy, a.Z0 + H * 0.16, d * 0.9, d * 0.9, d * 0.6, 14, 8);
      thread(a, cx, cy, a.Z0 + H * 0.2, a.Z1 - H * 0.02, r, r * 0.84, p, 24); a.cyl(cx, cy, a.Z0 + H * 0.2, a.Z1 - H * 0.02, r * 0.84, 12);
      a.prism(ptsC(cx, cy, d * 1.0, 6, 0), a.Z0 + H * 0.4, a.Z0 + H * 0.4 + d * 0.8); a.prism(ptsC(cx, cy, d * 1.0, 6, 0), a.Z0 + H * 0.4 + d * 0.9, a.Z0 + H * 0.4 + d * 1.7);
      a.circ(cx, cy, Pd / 2); a.circ(cx, cy, Pd * 0.45, 'EQUIP-DETAIL'); a.poly(ptsC(cx, cy, d * 1.0, 6, 0), 'EQUIP-DETAIL'); a.circ(cx, cy, r, 'EQUIP-DETAIL');
      a.log('Added the base pad, the ball seat, the ring thread, the adjusting hex and the lock nut (plan and 3D).');
    } }),
];

// ============================================================================================= MECHANISMS
/** a coil spring along an axis: kind 'x' along x between x0..x1 at (y,z), or 'z' vertical */
function coil(a, ax, c1, c2, p0, p1, R, wr, turns, seg = 6, per = 10) {
  const pts = [], rd = [], n = turns * per;
  for (let i = 0; i <= n; i++) { const f = i / n, t = f * turns * TAU, p = p0 + (p1 - p0) * f; pts.push(ax === 'z' ? [c1 + R * m.cos(t), c2 + R * m.sin(t), p] : ax === 'x' ? [p, c1 + R * m.cos(t), c2 + R * m.sin(t)] : [c1 + R * m.cos(t), p, c2 + R * m.sin(t)]); rd.push(wr); }
  a.tube(pts, rd, seg);
}
const mechanisms = [
  fam({ cat: 'machine/mechanisms', title: 'Generic electric linear actuator',
    desc: (v) => `Electric linear actuator with ${v.st} in stroke, lying on its side: an extruded housing with a folded-back motor, a rod with a clevis end, a rear clevis mount and a cable gland.`,
    vs: [4, 8, 12, 20].map((st) => { const L = 11.5 + st * 2, W = L * IN * 1.0; return [`${st} in stroke`, R3(L + 1), 3.2, 6, 0, { st }]; }),
    build: (a, v) => {
      const hr = 28, zc = a.Z0 + 62, y = a.cy, x0 = a.X0, L = a.W, st = v.st * IN, hl = L - st - 60;
      a.xcyl(x0 + 30, x0 + 30 + hl * 0.9, y, zc, hr, 18); a.box(x0 + 30, y - 31, zc - 31, x0 + 30 + hl * 0.9, y + 31, zc + 31);
      a.xcyl(x0 + 30 + hl * 0.9, x0 + 30 + hl, y, zc, hr * 0.9, 18); a.xcyl(x0 + 30 + hl, L + x0 - 30, y, zc, 9, 12);
      a.box(x0, y - 22, zc - 28, x0 + 30, y + 22, zc + 28); a.ycyl(y - 28, y + 28, x0 + 12, zc, 8, 10);
      for (const s of [-1, 1]) a.box(x0 + 30 + hl * 0.06, y + s * 33, zc - 20, x0 + 30 + hl * 0.8, y + s * 36, zc + 20);
      a.xcyl(x0 + 30 + hl * 0.2, x0 + 30 + hl * 0.2 + 52, y, zc + 62 - 62 + 0, 1, 4);
      const mx = x0 + 30 + hl * 0.18; a.cyl(mx, y, zc + 24, zc + 24 + 55, 25, 16); a.cyl(mx, y, zc + 24 + 55, zc + 24 + 60, 22, 16); a.ycyl(y - 31, y - 44, x0 + 30 + hl * 0.78, zc + 4, 7, 8);
      a.box(x0 + L - 30, y - 7, zc - 14, x0 + L, y + 7, zc + 14); a.box(x0 + L - 30, y - 22, zc - 14, x0 + L - 14, y + 22, zc + 14); a.ycyl(y - 22, y + 22, x0 + L - 12, zc, 7, 8);
      a.rect(x0, y - 22, x0 + 30, y + 22); a.rect(x0 + 30, y - 31, x0 + 30 + hl, y + 31); a.rect(x0 + 30 + hl, y - 9, x0 + L - 30, y + 9, 'EQUIP-DETAIL'); a.rect(x0 + L - 30, y - 22, x0 + L, y + 22, 'EQUIP-DETAIL'); a.circ(mx, y, 25, 'EQUIP-DETAIL');
      a.log('Added the housing with side rails, the motor, the rod, the clevis ends and the cable gland (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic tie-rod fluid cylinder',
    desc: (v) => `Tie-rod fluid cylinder, ${v.bore} in bore and ${v.stroke} in stroke, lying on its side: a barrel, square end caps held by four tie rods with nuts, a piston rod with a rod eye, two ports and a rear clevis.`,
    vs: [[1.5, 6], [2.5, 8], [3.25, 10], [4, 12]].map(([bore, stroke]) => { const sq = bore * 1.42 + 0.4; return [`${bore} in bore, ${stroke} in stroke`, R3(stroke * 2 + 5.5 + bore * 0.6), R3(sq + 0.5), R3(sq + 0.5), 0, { bore, stroke, sq }]; }),
    build: (a, v) => {
      const sq = v.sq * IN, br = (v.bore * IN) / 2, zc = a.Z0 + a.H / 2, y = a.cy, L = a.W, x0 = a.X0, rr = br * 0.4, cap = sq * 0.3, bl = (v.stroke + 1.4) * IN;
      const bx0 = x0 + L * 0.1 + cap * 0.3 + 15, bx1 = bx0 + cap + bl + cap;
      a.box(bx0, y - sq / 2, zc - sq / 2, bx0 + cap, y + sq / 2, zc + sq / 2); a.box(bx0 + cap + bl, y - sq / 2, zc - sq / 2, bx0 + cap * 2 + bl, y + sq / 2, zc + sq / 2);
      a.xcyl(bx0 + cap, bx0 + cap + bl, y, zc, br, 24);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) { a.xcyl(bx0 - 14, bx1 + 14, y + sx * sq * 0.4, zc + sz * sq * 0.4, br * 0.1, 8); boltHeadX(a, bx0 - 14, y + sx * sq * 0.4, zc + sz * sq * 0.4, br * 0.16, 12, -1); boltHeadX(a, bx1 + 14, y + sx * sq * 0.4, zc + sz * sq * 0.4, br * 0.16, 12, 1); }
      a.xcyl(bx1 - cap * 0.5, bx1 + (a.X1 - bx1) - 40, y, zc, rr, 16); a.xcyl(bx1, bx1 + cap * 0.35, y, zc, rr * 1.9, 16);
      const re = a.X1 - 40; a.box(re - 4, y - rr * 0.8, zc - rr * 1.4, re + 40, y + rr * 0.8, zc + rr * 1.4); a.ycyl(y - rr * 0.8, y + rr * 0.8, re + 22, zc, rr * 0.9, 12);
      a.cyl(bx0 + cap + bl * 0.1, y, zc + br, zc + br + 22, 14, 10); a.cyl(bx0 + cap + bl * 0.1 + 0, y, zc + br + 22, zc + br + 30, 11, 6); a.cyl(bx0 + cap + bl * 0.9, y, zc + br, zc + br + 22, 14, 10);
      a.box(x0, y - sq * 0.35, zc - sq * 0.3, bx0, y + sq * 0.35, zc + sq * 0.3); a.ycyl(y - sq * 0.5, y + sq * 0.5, x0 + (bx0 - x0) * 0.3, zc, sq * 0.14, 14);
      a.rect(bx0, y - sq / 2, bx0 + cap, y + sq / 2); a.rect(bx0 + cap + bl, y - sq / 2, bx1, y + sq / 2); a.rect(bx0 + cap, y - br, bx0 + cap + bl, y + br); a.rect(bx1, y - rr, a.X1 - 40, y + rr, 'EQUIP-DETAIL'); a.rect(x0, y - sq * 0.35, bx0, y + sq * 0.35); a.rect(re, y - rr * 0.8, re + 40, y + rr * 0.8);
      a.log('Added the barrel, the end caps with tie rods and nuts, the piston rod and eye, the ports and the rear clevis (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic cam mechanism',
    desc: (v) => v.k === 0 ? `Eccentric disc cam, ${v.D} mm across, on a base plate: a keyed hub on a shaft, a pushrod follower with a roller, a guide bush and a return spring.` : v.k === 1 ? `Plate cam, ${v.D} mm across, on a base plate with a pivoting roller arm, a pivot post and a return spring.` : `Camshaft with four lobes and three journals on two bearing blocks, ${v.D} mm lobe diameter.`,
    vs: [['eccentric disc with pushrod follower', mi(220), mi(160), mi(250), 0, { k: 0, D: 100 }], ['plate cam with roller arm', mi(260), mi(220), mi(60), 0, { k: 1, D: 120 }], ['camshaft with four lobes', mi(420), mi(120), mi(130), 0, { k: 2, D: 70 }]],
    build: (a, v) => {
      const cx = a.cx, y = a.cy, x0 = a.X0, z0 = a.Z0;
      if (v.k === 0) {
        a.box(x0, a.YF, z0, a.X1, a.YB, z0 + 15); const zc = z0 + 15 + 55;
        a.box(cx - 70, y - 32, z0 + 15, cx + 70, y + 32, z0 + 15 + 12); for (const sx of [-1, 1]) a.box(cx + sx * 70 - 8, y - 30, z0 + 15, cx + sx * 70 + 8, y + 30, zc);
        a.ycyl(y - 50, y + 50, cx, zc, 11, 12); a.ycyl(y - 14, y + 14, cx, zc, 20, 14);
        const e = 18, n = 28, poly = Array.from({ length: n }, (_, i) => [cx + 50 * m.cos((TAU * i) / n), zc + e + 50 * m.sin((TAU * i) / n)]); prismY(a, poly, y - 12, y + 12);
        // eccentric disc: radius 50 centred 18 above the shaft: lowest point at shaft - 32, highest at +68
        a.cyl(cx + 0, y, zc + 62, zc + 62 + 1, 1, 4); a.cyl(cx, y, zc + 68 + 14, zc + 68 + 14 + 100, 8, 12); a.cyl(cx, y, zc + 68 + 14 + 100, zc + 68 + 14 + 102, 8, 8);
        a.ycyl(y - 7, y + 7, cx, zc + 68 + 14, 14, 14); coil(a, 'z', cx, y, zc + 68 + 28, zc + 68 + 70, 18, 2.4, 4, 6); a.box(cx - 24, y - 24, zc + 68 + 70, cx + 24, y + 24, zc + 68 + 82); 
        a.rect(x0, a.YF, a.X1, a.YB); a.circ(cx, y, 50, 'EQUIP-DETAIL'); a.circ(cx, y, 24, 'EQUIP-DETAIL');
      } else if (v.k === 1) {
        a.box(x0, a.YF, z0, a.X1, a.YB, z0 + 12);
        const R = 50, e = 24; const poly = Array.from({ length: 36 }, (_, i) => { const t = (TAU * i) / 36; const r = R + e * 0.9 * m.cos(t) * (1 + 0.1 * m.cos(2 * t)); return [cx + r * m.cos(t) * 1.0, y + r * m.sin(t)]; }); a.prism(poly, z0 + 12, z0 + 12 + 14);
        a.cyl(cx, y, z0 + 12, z0 + 12 + 40, 12, 12); a.cyl(cx, y, z0 + 12 + 26, z0 + 12 + 33, 18, 14);
        const pv = [cx + 95, y + 60]; a.cyl(pv[0], pv[1], z0 + 12, z0 + 12 + 48, 8, 10); bar(a, 'z', pv, [cx + 78, y - 8], 16, z0 + 12 + 30, z0 + 12 + 40); a.cyl(cx + 78, y - 8, z0 + 12 + 12, z0 + 12 + 42, 12, 14); a.cyl(cx + 78, y - 8, z0 + 12 + 42, z0 + 12 + 46, 5, 8);
        coil(a, 'z', cx + 100, y - 30, z0 + 12 + 24, z0 + 12 + 30, 9, 1.8, 3, 5); a.cyl(cx + 110, y - 70, z0 + 12, z0 + 12 + 30, 7, 8);
        a.rect(x0, a.YF, a.X1, a.YB); a.poly(poly, 'EQUIP-DETAIL'); a.circ(cx + 78, y - 8, 12, 'EQUIP-DETAIL'); a.circ(pv[0], pv[1], 8, 'EQUIP-DETAIL');
      } else {
        const L = a.W, zc = z0 + 62, ro = 35;
        a.xcyl(x0 + 10, x0 + L - 10, y, zc, 14, 16);
        for (const f of [0.1, 0.9]) { const bx = x0 + L * f; a.box(bx - 22, y - 40, z0, bx + 22, y + 40, zc - 14); ring(a, 'y', bx, zc, y - 22, y + 22, 14, 36, 16); a.xcyl(bx - 24, bx + 24, y, zc, 20, 14); }
        a.xcyl(x0 + L * 0.5 - 22, x0 + L * 0.5 + 22, y, zc, 18, 14);
        for (let i = 0; i < 4; i++) { const bx = x0 + L * (0.22 + 0.17 * i), ang = i * (TAU / 4) + 0.5, poly = Array.from({ length: 20 }, (_, k) => { const t = (TAU * k) / 20; const r = 24 + 11 * m.max(0, m.cos(t - ang)) ** 2 * 1.2; return [y + r * m.cos(t), zc + r * m.sin(t)]; }); prismX(a, poly, bx - 14, bx + 14); a.rect(bx - 14, y - 36, bx + 14, y + 36, 'EQUIP-DETAIL'); }
        a.rect(x0 + 10, y - 14, x0 + L - 10, y + 14); for (const f of [0.1, 0.9]) a.rect(x0 + L * f - 22, y - 40, x0 + L * f + 22, y + 40);
      }
      a.log('Added ' + (v.k === 0 ? 'the base plate, bearing posts, shaft and eccentric disc, the pushrod, roller guide and spring' : v.k === 1 ? 'the base plate, the plate cam with hub, the pivot post and roller arm and the spring' : 'the shaft, two bearing blocks and four lobes') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic linkage mechanism',
    desc: (v) => v.k === 0 ? 'Four-bar linkage on a base plate: a driven crank, a coupler and a rocker, each a flat bar with pin joints and washers, and two pivot posts.' : 'Crank and slider on a base plate: a crank disc with pin, a connecting rod, a slider block running between two guide rails with a piston pad.',
    vs: [['four-bar, 14 in', mi(360), mi(200), mi(60), 0, { k: 0 }], ['crank and slider, 16 in', mi(420), mi(160), mi(55), 0, { k: 1 }]],
    build: (a, v) => {
      const x0 = a.X0, y = a.cy, z0 = a.Z0;
      a.box(x0, a.YF, z0, a.X1, a.YB, z0 + 8); a.rect(x0, a.YF, a.X1, a.YB);
      const pin = (px, py, zz, r = 8, h = 10) => { a.cyl(px, py, zz, zz + h, r, 10); a.circ(px, py, r, 'EQUIP-DETAIL'); };
      if (v.k === 0) {
        const A = [x0 + 60, y + 50], B = [x0 + 120, y + 5 - 20], C = [x0 + 260, y - 20], D = [x0 + 300, y - 62];
        const Bp = [A[0] + 55, A[1] + 55 * 0.7], Cp = [D[0] - 30, D[1] + 100];
        a.cyl(A[0], A[1], z0 + 8, z0 + 8 + 30, 14, 12); a.cyl(D[0], D[1], z0 + 8, z0 + 8 + 30, 14, 12);
        bar(a, 'z', A, Bp, 22, z0 + 8 + 30, z0 + 8 + 38); bar(a, 'z', Bp, Cp, 20, z0 + 8 + 44, z0 + 8 + 50); bar(a, 'z', D, Cp, 22, z0 + 8 + 30, z0 + 8 + 38);
        pin(Bp[0], Bp[1], z0 + 8 + 30, 7, 24); pin(Cp[0], Cp[1], z0 + 8 + 30, 7, 24); a.cyl(A[0], A[1], z0 + 8 + 38, z0 + 8 + 46, 10, 10); a.cyl(D[0], D[1], z0 + 8 + 38, z0 + 8 + 46, 10, 10);
        a.line(A[0], A[1], Bp[0], Bp[1], 'EQUIP-DETAIL'); a.line(Bp[0], Bp[1], Cp[0], Cp[1], 'EQUIP-DETAIL'); a.line(D[0], D[1], Cp[0], Cp[1], 'EQUIP-DETAIL');
      } else {
        const cr = [x0 + 80, y]; a.cyl(cr[0], cr[1], z0 + 8, z0 + 8 + 12, 48, 24); const cp = [cr[0] + 30, cr[1] + 25]; pin(cp[0], cp[1], z0 + 8 + 12, 7, 20);
        const sl = [x0 + 330, y]; for (const s of [-1, 1]) a.box(x0 + 200, y + s * 30 - 5, z0 + 8, a.X1 - 10, y + s * 30 + 5, z0 + 8 + 24);
        a.box(sl[0] - 28, y - 22, z0 + 8 + 4, sl[0] + 28, y + 22, z0 + 8 + 30); a.box(sl[0] + 28, y - 8, z0 + 8 + 10, sl[0] + 58, y + 8, z0 + 8 + 24);
        bar(a, 'z', cp, [sl[0], sl[1]], 18, z0 + 8 + 32, z0 + 8 + 40); pin(sl[0], sl[1], z0 + 8 + 30, 7, 14); a.cyl(cr[0], cr[1], z0 + 8 + 12, z0 + 8 + 28, 13, 12);
        a.circ(cr[0], cr[1], 48); a.line(cp[0], cp[1], sl[0], sl[1], 'EQUIP-DETAIL'); a.rect(sl[0] - 28, y - 22, sl[0] + 28, y + 22, 'EQUIP-DETAIL');
      }
      a.log('Added the base plate, the ' + (v.k === 0 ? 'crank, coupler and rocker bars with pin joints and pivot posts' : 'crank disc, connecting rod and the slider in its guide rails') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic spring',
    desc: (v) => v.k === 0 ? `Compression coil spring, ${v.OD} mm outside diameter, ${v.Lf} mm free length with closed and ground ends, standing on end.` : v.k === 1 ? `Extension coil spring, ${v.OD} mm outside diameter and ${v.Lf} mm long including two end loops, standing on end.` : `Leaf spring pack of five leaves, ${v.Lf} mm long: a curved master leaf with eyes, four shorter leaves, a centre bolt and two clips.`,
    vs: [['compression, 25 mm x 75 mm', 25, 75, 0, 3, 7.5], ['compression, 40 mm x 150 mm', 40, 150, 0, 5, 9], ['extension, 20 mm x 90 mm', 20, 90, 1, 3.2, 14], ['leaf spring pack, 600 mm', 0, 600, 2, 0, 0]].map(([l, OD, Lf, k, wd, turns]) => k === 2 ? [l, mi(Lf), mi(60), mi(150), 0, { OD, Lf, k }] : [l, mi(OD), mi(OD), mi(Lf), 0, { OD, Lf, k, wd, turns }]),
    build: (a, v) => {
      const cx = a.cx, y = a.cy;
      if (v.k === 0) { const R = (v.OD - v.wd) / 2; a.cyl(cx, y, a.Z0, a.Z0 + v.wd * 0.9, R + v.wd / 2, 22); coil(a, 'z', cx, y, a.Z0 + v.wd / 2, a.Z1 - v.wd / 2, R, v.wd / 2, v.turns, 8, 12); a.cyl(cx, y, a.Z1 - v.wd * 0.9, a.Z1, R + v.wd / 2, 22); a.circ(cx, y, v.OD / 2); a.circ(cx, y, v.OD / 2 - v.wd, 'EQUIP-DETAIL'); }
      else if (v.k === 1) { const R = (v.OD - v.wd) / 2, L = v.Lf - 2 * v.OD * 0.5; coil(a, 'z', cx, y, a.Z0 + v.OD * 0.55, a.Z1 - v.OD * 0.55, R, v.wd / 2, 13, 8, 10);
        for (const s of [0, 1]) { const zz = s ? a.Z1 : a.Z0, dir = s ? -1 : 1; a.tube([[cx + R, y, zz + dir * v.OD * 0.55], [cx + R * 0.4, y, zz + dir * v.OD * 0.9], [cx - R * 0.3, y, zz + dir * v.OD * 0.95], [cx - R * 0.6, y, zz + dir * v.OD * 0.6], [cx - R * 0.2, y, zz + dir * v.OD * 0.15]], [v.wd / 2, v.wd / 2, v.wd / 2, v.wd / 2, v.wd / 2], 6); } 
        a.circ(cx, y, v.OD / 2); a.circ(cx, y, v.OD / 2 - v.wd, 'EQUIP-DETAIL'); }
      else {
        const L = a.W, lw = 55, ys = y, n = 5, t = 9, rise = 70, zTop = a.Z0 + 70 + n * t + 10;
        for (let i = 0; i < n; i++) {
          const half = (L * (1 - i * 0.17)) / 2, nseg = 14;
          const zf = (xr) => zTop - i * t - rise * (xr / (L / 2)) ** 2;
          for (let k = 0; k < nseg; k++) { const xa = -half + (2 * half * k) / nseg, xb = -half + (2 * half * (k + 1)) / nseg; prismY(a, [[cx + xa, zf(xa) - t], [cx + xb, zf(xb) - t], [cx + xb, zf(xb)], [cx + xa, zf(xa)]], ys - lw / 2, ys + lw / 2); }
        }
        for (const s of [-1, 1]) { const ex = s * (L / 2 - 12), ez = zTop - rise * ((L / 2 - 12) / (L / 2)) ** 2 - t * 0.5; a.ycyl(ys - lw / 2, ys + lw / 2, cx + s * (L / 2 - 14), ez, 13, 14); }
        a.cyl(cx, ys, zTop - 3 * t - 20, zTop + 14, 6, 10); a.box(cx - 24, ys - lw / 2 - 3, zTop + 0, cx + 24, ys + lw / 2 + 3, zTop + 8); a.prism(ptsC(cx, ys, 11, 6), zTop + 8, zTop + 14);
        for (const s of [-1, 1]) { const xr = s * L * 0.2, zz = zTop - rise * (xr / (L / 2)) ** 2; a.box(cx + xr - 5, ys - lw / 2 - 3, zz - n * t + 0, cx + xr + 5, ys + lw / 2 + 3, zz + 7); }
        a.rect(a.X0, ys - lw / 2, a.X1, ys + lw / 2); for (let i = 1; i < n; i++) a.line(cx - (L * (1 - i * 0.17)) / 2, ys, cx + (L * (1 - i * 0.17)) / 2, ys, 'EQUIP-DETAIL'); a.circ(cx, ys, 7, 'EQUIP-DETAIL');
      }
      a.log('Added ' + (v.k === 2 ? 'the five leaves, the centre bolt, the clips and the end eyes' : 'the coil with its end turns') + ' (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic vice',
    desc: (v) => v.mill ? `Machine vice, ${v.jaw} in jaws: a flat base with two clamp slots, a fixed jaw, a sliding jaw on a guide, a lead screw with a handle socket and hardened jaw plates.` : `Bench vice, ${v.jaw} in jaws: a base with a mounting foot, a fixed jaw with an anvil, a sliding jaw on a guide bar, a lead screw and a handle with ball ends.`,
    vs: [['bench, 4 in jaws', mi(330), mi(130), mi(150), 0, { jaw: 4, mill: false, Wd: 140 }], ['bench, 6 in jaws', mi(480), mi(190), mi(210), 0, { jaw: 6, mill: false, Wd: 200 }], ['machine, 5 in jaws', mi(200), mi(380), mi(95), 0, { jaw: 5, mill: true, Wd: 200 }]],
    build: (a, v) => {
      const cx = a.cx, y = a.cy, W = a.W, H = a.H, yb = a.YB, yf = a.YF, D = a.D, mill = v.mill, z0 = a.Z0;
      if (mill) {
        const bw = W * 0.8; plateHoles(a, a.X0, yf + D * 0.05, a.X1, yb - D * 0.05, z0, z0 + H * 0.3, [[-1], [1]].map(([sx]) => ({ x: cx + sx * W * 0.4, y: yb - D * 0.5, rx: W * 0.045, ry: W * 0.045 })).concat([{ x: cx + 0, y: yb - D * 0.5, rx: 0, ry: 0 }].slice(0, 0)), 4);
        a.box(cx - W * 0.28, yf + D * 0.05, z0 + H * 0.3, cx + W * 0.28, yb - D * 0.05, z0 + H * 0.5); a.box(a.X0 + W * 0.05, yb - D * 0.34, z0 + H * 0.3, a.X1 - W * 0.05, yb - D * 0.05, z0 + H);
        a.box(a.X0 + W * 0.05, yb - D * 0.36, z0 + H * 0.45, a.X1 - W * 0.05, yb - D * 0.34, z0 + H * 0.95);
        const jy = yb - D * 0.34 - D * 0.1 - 20; a.box(a.X0 + W * 0.05, jy - D * 0.06, z0 + H * 0.5, a.X1 - W * 0.05, jy + D * 0.06, z0 + H * 0.95); a.box(a.X0 + W * 0.05, jy + D * 0.06, z0 + H * 0.5, a.X1 - W * 0.05, yb - D * 0.36, z0 + H * 0.52);
        a.ycyl(yf + D * 0.04, jy - D * 0.06, cx, z0 + H * 0.4, W * 0.04, 12); a.ycyl(yf + D * 0.02, yf + D * 0.04, cx, z0 + H * 0.4, W * 0.07, 12); a.xcyl(cx - W * 0.2, cx + W * 0.2, yf + D * 0.015, z0 + H * 0.4, W * 0.018, 8);
        a.rect(a.X0, yf + D * 0.05, a.X1, yb - D * 0.05); a.rect(a.X0 + W * 0.05, yb - D * 0.34, a.X1 - W * 0.05, yb - D * 0.05, 'EQUIP-DETAIL'); a.rect(a.X0 + W * 0.05, jy - D * 0.06, a.X1 - W * 0.05, jy + D * 0.06, 'EQUIP-DETAIL'); a.circ(cx, yf + D * 0.03, W * 0.06, 'EQUIP-DETAIL');
      } else {
        const X0 = a.X0, X1 = a.X1, fj = W * 0.18, gap = W * 0.2, mj = W * 0.1, jxR = X1 - fj, jxL = jxR - gap, zg = z0 + H * 0.3;
        plateHoles(a, X0 + W * 0.36, yf, X1, yb, z0, z0 + H * 0.09, [{ x: X0 + W * 0.43, y: y, rx: D * 0.08, ry: D * 0.08 }, { x: X1 - W * 0.06, y: y, rx: D * 0.08, ry: D * 0.08 }], 4);
        a.box(X0 + W * 0.38, yf + D * 0.12, z0 + H * 0.09, X1 - W * 0.02, yb - D * 0.12, z0 + H * 0.3);
        a.box(jxR, yf, z0 + H * 0.09, X1, yb, z0 + H); a.box(jxR - 4, yf + 2, z0 + H * 0.5, jxR, yb - 2, z0 + H * 0.95);
        a.box(X1 - W * 0.14, yf + D * 0.2, z0 + H, X1 - W * 0.02, yb - D * 0.2, z0 + H * 1.0 + 0);
        a.box(jxL - mj, yf, z0 + H * 0.3, jxL, yb, z0 + H * 0.98); a.box(jxL, yf + 2, z0 + H * 0.5, jxL + 4, yb - 2, z0 + H * 0.95);
        a.box(X0 + W * 0.38, y - D * 0.18, z0 + H * 0.18, jxL, y + D * 0.18, zg + 4);
        const zs = z0 + H * 0.4; a.xcyl(X0 + W * 0.04, jxR - 6, y, zs, D * 0.045, 12); a.box(X0 + W * 0.3, y - D * 0.06, zs - D * 0.06, X0 + W * 0.36, y + D * 0.06, zs + D * 0.06);
        a.ycyl(yf + 2, yb - 2, X0 + W * 0.04, zs, D * 0.03, 10); a.ell(X0 + W * 0.04, yf + 4, zs, D * 0.07, D * 0.07, D * 0.07, 10, 6); a.ell(X0 + W * 0.04, yb - 4, zs, D * 0.07, D * 0.07, D * 0.07, 10, 6);
        a.rect(X0 + W * 0.38, yf, X1, yb); a.rect(jxL - mj, yf, jxL, yb, 'EQUIP-DETAIL'); a.rect(jxR, yf, X1, yb, 'EQUIP-DETAIL'); a.line(X0 + W * 0.04, y, jxR, y, 'EQUIP-DETAIL'); a.line(X0 + W * 0.04, yf + 4, X0 + W * 0.04, yb - 4, 'EQUIP-DETAIL');
      }
      a.log('Added the base, fixed and sliding jaws, the lead screw with handle and the guide (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic toggle clamp',
    desc: (v) => `Toggle clamp, ${v.cap} lb holding force class: two side plates with a pivoting handle, a link, a clamp arm and a threaded spindle with a rubber tip on a flat base with two mounting holes.`,
    vs: [['light, 100 lb class', 100, 110, 50, 60], ['heavy, 600 lb class', 600, 190, 80, 105]].map(([l, cap, L, Wd, H]) => [l, mi(Wd), mi(L), mi(H), 0, { cap, L }]),
    build: (a, v) => {
      const W = a.W, x0 = a.X0, cx = a.cx, yb = a.YB, yf = a.YF, H = a.H, z0 = a.Z0, th = W * 0.08, pw = W * 0.28;
      plateHoles(a, x0, yf, a.X1, yb, z0, z0 + th, [{ x: x0 + W * 0.15, y: yf + a.D * 0.2, rx: W * 0.045, ry: W * 0.045 }, { x: a.X1 - W * 0.15, y: yf + a.D * 0.2, rx: W * 0.045, ry: W * 0.045 }, { x: x0 + W * 0.15, y: yb - a.D * 0.2, rx: W * 0.045, ry: W * 0.045 }, { x: a.X1 - W * 0.15, y: yb - a.D * 0.2, rx: W * 0.045, ry: W * 0.045 }], 4);
      for (const s of [-1, 1]) { const xs = cx + s * pw * 0.65; prismX(a, [[yb - a.D * 0.15, z0 + th], [yb - a.D * 0.5, z0 + th], [yb - a.D * 0.4, z0 + H * 0.5], [yb - a.D * 0.2, z0 + H * 0.5]], xs - 3, xs + 3); a.rect(xs - 3, yb - a.D * 0.5, xs + 3, yb - a.D * 0.15, 'EQUIP-DETAIL'); }
      const pv = [yb - a.D * 0.32, z0 + H * 0.45], hd = [yb - a.D * 0.12, z0 + H * 0.9], lk = [yb - a.D * 0.28, z0 + H * 0.6], arm = [yf + a.D * 0.2, z0 + H * 0.85];
      bar(a, 'x', pv, arm, W * 0.2, cx - pw * 0.4, cx + pw * 0.4); bar(a, 'x', pv, hd, W * 0.16, cx + pw * 0.45, cx + pw * 0.7, true); bar(a, 'x', pv, hd, W * 0.16, cx - pw * 0.7, cx - pw * 0.45, true);
      a.ycyl(yb - a.D * 0.04, yb - a.D * 0.02, cx, z0 + H * 0.94, 1, 4); a.xcyl(cx - pw * 0.9, cx + pw * 0.9, hd[0], hd[1] + 0, W * 0.07, 12);
      a.cyl(cx, arm[0], z0 + H * 0.52, z0 + H * 0.85, W * 0.045, 10); a.cyl(cx, arm[0], z0 + th, z0 + H * 0.52, W * 0.06, 12); a.prism(ptsC(cx, arm[0], W * 0.09, 6), z0 + H * 0.73, z0 + H * 0.78);
      a.rect(x0, yf, a.X1, yb); a.rect(cx - pw * 0.9, yb - a.D * 0.55, cx + pw * 0.9, yb - a.D * 0.1, 'EQUIP-DETAIL'); a.circ(cx, arm[0], W * 0.06, 'EQUIP-DETAIL');
      a.log('Added the base with mounting holes, the side plates, the pivoting handle and link, the clamp arm and the spindle with its tip (plan and 3D).');
    } }),
  fam({ cat: 'machine/mechanisms', title: 'Generic linear guide rail with carriage',
    desc: (v) => `Profile rail linear guide, ${v.rail} mm rail on ${v.L} in length: a rail with counterbored holes every ${v.pitch} mm and a carriage block with end caps, wipers, four mounting holes and a grease nipple.`,
    vs: [[15, 12, 60, 28, 16], [25, 20, 100, 48, 30], [35, 32, 80, 70, 40]].map(([rail, L, pitch, cw, ch]) => [`${rail} mm rail, ${L} in`, L, mi(cw + 4), mi(ch + 20), 0, { rail, L, pitch, cw, ch }]),
    build: (a, v) => {
      const { rail, pitch, cw, ch } = v, y = a.cy, zr = a.Z0, rh = rail * 0.72, rw = rail;
      const n = m.floor((a.W - 30) / pitch) + 1, hx = a.X0 + (a.W - (n - 1) * pitch) / 2;
      plateHoles(a, a.X0, y - rw / 2, a.X1, y + rw / 2, zr, zr + rh, Array.from({ length: n }, (_, i) => ({ x: hx + i * pitch, y, rx: rw * 0.17, ry: rw * 0.17 })), 4);
      const cl = cw * 1.6, cx0 = a.cx - cl / 2, zc0 = zr + rh * 0.4, bz0 = zr + rh * 0.35;
      a.box(cx0 + 6, y - cw / 2, bz0 + 4, cx0 + cl - 6, y + cw / 2, bz0 + ch + 4 - 0); a.box(cx0 + 6, y - rw / 2 - 3, bz0 + 4, cx0 + cl - 6, y + rw / 2 + 3, bz0 + 4);
      for (const s of [0, 1]) { a.box(s ? cx0 + cl - 6 : cx0, y - cw / 2 + 2, bz0 + 6, s ? cx0 + cl : cx0 + 6, y + cw / 2 - 2, bz0 + ch + 2); }
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) { a.cyl(a.cx + sx * cl * 0.28, y + sy * cw * 0.34, bz0 + ch + 4, bz0 + ch + 4.8, rw * 0.12, 8); a.circ(a.cx + sx * cl * 0.28, y + sy * cw * 0.34, rw * 0.12, 'EQUIP-DETAIL'); }
      a.cyl(cx0 + cl + 0, y, 0, 0.01, 0.001, 3); a.cyl(a.cx, y - cw / 2 - 3, bz0 + ch * 0.5, bz0 + ch * 0.5 + 0.01, 0.01, 3);
      a.ycyl(y - cw / 2 - 5, y - cw / 2, cx0 + 3, bz0 + ch * 0.55, rw * 0.07, 8);
      a.rect(a.X0, y - rw / 2, a.X1, y + rw / 2); a.rect(cx0, y - cw / 2, cx0 + cl, y + cw / 2); a.line(cx0 + 6, y - cw / 2, cx0 + 6, y + cw / 2, 'EQUIP-DETAIL'); a.line(cx0 + cl - 6, y - cw / 2, cx0 + cl - 6, y + cw / 2, 'EQUIP-DETAIL');
      a.log('Added the rail with its holes, the carriage block with end caps, wipers, mounting holes and the grease nipple (plan and 3D).');
    } }),
];
export default [...fasteners, ...transmission, ...frames, ...mechanisms];

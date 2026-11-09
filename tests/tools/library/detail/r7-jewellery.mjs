/* SPDX-License-Identifier: Apache-2.0 */
/** Round 7, jewellery: 150 more objects. Cluster, cocktail, channel, twisted, bypass, spinner, tension, marquise, two-stone, pearl, grooved,
 *  split-shank and flush-set rings; heart, key, star, crescent, infinity, cabochon, tag, cord, lariat, choker and fringe necklaces; earrings on
 *  display cards; beaded, bar-link, twisted, ID and stacked bracelets; more stone cuts, crystals, watch boxes and stands, display trees,
 *  ring towers, trays and a chest of drawers. Original geometry, millimetres inside the builders, a ring is about 0.8 in across.
 *  Every body box is measured from the geometry itself; band-type pieces lean on their rim and earrings stand on a card so the front view reads. */
import { fam } from './r4-kit.mjs';
import { box as BOX, tube as TUBE, ellipsoid as ELL, loft as LOFT } from './com-core.mjs';

const m = Math, TAU = m.PI * 2, IN = 25.4;
const up = (mm) => m.ceil((mm / IN) * 100) / 100;           // mm -> inches, rounded up so geometry stays inside the box
/** one variant row from millimetre sizes */
const V = (label, wmm, dmm, hmm, p = {}) => [label, up(wmm), up(dmm), up(hmm), 0, p];

// ------------------------------------------------------------------------------------------ mesh helpers (all return triangle lists)
const rotX = (t, g) => { const c = m.cos(g), s = m.sin(g); return t.map((q) => q.map(([x, y, z]) => [x, y * c - z * s, y * s + z * c])); };
const rotY = (t, g) => { const c = m.cos(g), s = m.sin(g); return t.map((q) => q.map(([x, y, z]) => [x * c + z * s, y, -x * s + z * c])); };
const mv = (t, dx, dy, dz) => t.map((q) => q.map(([x, y, z]) => [x + dx, y + dy, z + dz]));
/** rotate about X then Y, then move */
const put = (t, ax, ay, dx, dy, dz) => mv(ay ? rotY(ax ? rotX(t, ax) : t, ay) : (ax ? rotX(t, ax) : t), dx, dy, dz);

/** torus around the local z axis (in the XY plane), optional arc */
function torus(R, r, n = 20, seg = 6, a0 = 0, a1 = TAU) {
  const pts = [], rads = [];
  for (let i = 0; i <= n; i++) { const g = a0 + ((a1 - a0) * i) / n; pts.push([R * m.cos(g), R * m.sin(g), 0]); rads.push(r); }
  return TUBE(pts, rads, seg);
}
/** sweep a closed [y, r] profile around the Y axis through (cx, cy, cz) in the XZ plane; prof(theta) may change with the angle */
function sweepY(prof, cx, cy, cz, n = 36, a0 = 0, a1 = TAU, sx = 1, sz = 1) {
  const tris = [], full = m.abs(a1 - a0 - TAU) < 1e-6;
  const P = (g, [y, r]) => [cx + sx * r * m.cos(g), cy + y, cz + sz * r * m.sin(g)];
  const prs = [];
  for (let i = 0; i <= n; i++) prs.push(typeof prof === 'function' ? prof(a0 + ((a1 - a0) * i) / n) : prof);
  for (let i = 0; i < n; i++) {
    const g0 = a0 + ((a1 - a0) * i) / n, g1 = a0 + ((a1 - a0) * (i + 1)) / n, A = prs[i], B = prs[i + 1], k = A.length;
    for (let j = 0; j < k; j++) { const j2 = (j + 1) % k; tris.push([P(g0, A[j]), P(g0, A[j2]), P(g1, B[j2])], [P(g0, A[j]), P(g1, B[j2]), P(g1, B[j])]); }
  }
  if (!full) for (const [g, pr] of [[a0, prs[0]], [a1, prs[n]]]) {
    const cy0 = pr.reduce((s, p) => s + p[0], 0) / pr.length, cr = pr.reduce((s, p) => s + p[1], 0) / pr.length, c = P(g, [cy0, cr]);
    for (let j = 0; j < pr.length; j++) tris.push([c, P(g, pr[j]), P(g, pr[(j + 1) % pr.length])]);
  }
  return tris;
}
/** frustum between two polygons with the same point count: [x, y] at height zA and zB, both capped */
function frustum(pa, za, pb, zb) {
  const t = [], n = pa.length;
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; t.push([[...pa[i], za], [...pa[j], za], [...pb[j], zb]], [[...pa[i], za], [...pb[j], zb], [...pb[i], zb]]); }
  for (const [p, z] of [[pa, za], [pb, zb]]) { const c = [p.reduce((s, q) => s + q[0], 0) / n, p.reduce((s, q) => s + q[1], 0) / n, z]; for (let i = 0; i < n; i++) t.push([c, [...p[i], z], [...p[(i + 1) % n], z]]); }
  return t;
}
const scl = (p, sx, sy = sx) => p.map(([x, y]) => [x * sx, y * sy]);
/** extrude a convex [x, z] polygon along Y between y0 and y1 */
function prismY(poly, y0, y1) {
  const t = [], n = poly.length;
  for (let i = 1; i < n - 1; i++) t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]);
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return t;
}
const ellPoly = (rx, ry, n = 24) => Array.from({ length: n }, (_, i) => [rx * m.cos((i / n) * TAU), ry * m.sin((i / n) * TAU)]);
const octa = (L, W, c) => [[L / 2 - c, W / 2], [L / 2, W / 2 - c], [L / 2, -W / 2 + c], [L / 2 - c, -W / 2], [-L / 2 + c, -W / 2], [-L / 2, -W / 2 + c], [-L / 2, W / 2 - c], [-L / 2 + c, W / 2]];
const pearPoly = (L, W, n = 22) => {
  let pts = Array.from({ length: n }, (_, i) => { const g = (i / n) * TAU; return [(W / 2) * m.sin(g) * (0.82 - 0.46 * m.cos(g)), (L / 2) * m.cos(g)]; });
  const mx = m.max(...pts.map((p) => m.abs(p[0]))); return pts.map(([x, y]) => [(x * W) / 2 / mx, y]);
};

// ------------------------------------------------------------------------------------------ stones (local: girdle at z=0, table up)
function gemRound(r, seg = 14) { return TUBE([[0, 0, -0.62 * r], [0, 0, 0], [0, 0, 0.05 * r], [0, 0, 0.34 * r]], [0.03 * r, r, r, 0.57 * r], seg); }
/** a step or brilliant cut on a convex girdle outline: crown steps (scale, height) and a pavilion to a small keel */
function gemPoly(poly, depth, crown, keel = [0.06, 0.06]) {
  let t = [], z = 0;
  t = t.concat(frustum(poly, 0, poly, 0.05 * depth * 0.5));
  z = 0.05 * depth * 0.5;
  let cur = poly;
  for (const [s, h] of crown) { const nx = scl(poly, s); t = t.concat(frustum(cur, z, nx, z + h)); cur = nx; z += h; }
  t = t.concat(frustum(poly, 0, scl(poly, keel[0], keel[1]), -depth));
  return t;
}
/** claws, a gallery ring and a base under a stone: clawPts = [x, y] positions at the girdle, bh = base height below the girdle */
function head(gem, clawPts, bh, cr = 0.5, rg = 3, tipH = 0.6) {
  let t = gem.slice();
  for (const [x, y] of clawPts) {
    t = t.concat(TUBE([[x * 0.55, y * 0.55, -bh], [x, y, 0], [x * 0.9, y * 0.9, tipH]], [cr * 1.1, cr, cr * 0.8], 5));
    t = t.concat(ELL(x * 0.88, y * 0.88, tipH + cr * 0.5, cr * 1.15, cr * 1.15, cr * 0.9, 6, 4));
  }
  t = t.concat(torus(rg * 0.8, cr * 0.8, 16, 4).map((q) => q.map(([x, y, z]) => [x, y, z - bh * 0.55])));
  t = t.concat(TUBE([[0, 0, -bh], [0, 0, -bh * 0.45]], [rg * 0.3, rg * 0.55], 8));
  return t;
}
const roundClaws = (r, n, off = m.PI / n) => Array.from({ length: n }, (_, k) => [r * 0.98 * m.cos(off + (k * TAU) / n), r * 0.98 * m.sin(off + (k * TAU) / n)]);

// ------------------------------------------------------------------------------------------ chain along a path
/** arc-length samples of a polyline of [x, z] points */
function arcs(pts) { const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + m.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return c; }
function atLen(pts, cum, s) {
  s = m.max(0, m.min(cum[cum.length - 1], s)); let i = 1; while (i < cum.length - 1 && cum[i] < s) i++;
  const f = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f, pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]];
}
/** the displayed loop of a necklace: a teardrop-shaped closed path whose length is L; returns the dimensions and a sampler */
function loopOf(L, ratio = 1.55) {
  const P = (g, W, H) => [(W / 2) * m.sin(g) * (0.45 + 0.55 * (1 - m.cos(g)) / 2), (H / 2) * m.cos(g)];
  const pts = Array.from({ length: 241 }, (_, i) => P((i / 240) * TAU, 1, ratio)); const len = arcs(pts)[240], k = L / len;
  const W = k, H = k * ratio, path = Array.from({ length: 241 }, (_, i) => P((i / 240) * TAU, W, H));
  return { W, H, path };
}
const LK = { pitch: 8, a: 7, b: 3, r: 0.9 };
function linkTris(cx, cy, cz, tx, tz, flat, lk) {
  const tl = m.hypot(tx, tz) || 1, T = [tx / tl, 0, tz / tl], N = flat ? [0, 1, 0] : [-T[2], 0, T[0]], pts = [];
  for (let i = 0; i <= 8; i++) { const g = (i / 8) * TAU, u = lk.a * m.cos(g), w = lk.b * m.sin(g); pts.push([cx + T[0] * u + N[0] * w, cy + T[1] * u + N[1] * w, cz + T[2] * u + N[2] * w]); }
  return TUBE(pts, pts.map(() => lk.r), 4);
}
/** links along a path (array of [x, z] points relative to origin, shifted by ox, oz) */
function chainAlong(path, ox, cy, oz, lk, n0 = 0, count = null) {
  const cum = arcs(path), tot = cum[cum.length - 1], n = count ?? m.round(tot / lk.pitch); let t = [];
  for (let i = 0; i < n; i++) { const [x, z, dx, dz] = atLen(path, cum, ((i + 0.5) * tot) / n); t = t.concat(linkTris(ox + x, cy, oz + z, dx, dz, (i + n0) % 2 === 0, lk)); }
  return t;
}
const lobster = () => ELL(0, 0, 0, 5.5, 2.2, 2.0, 10, 6).concat(TUBE([[4, 0, 0], [8.5, 0, 0]], [1.0, 1.0], 6), torus(2.5, 0.7, 12, 4).map((q) => q.map(([x, y, z]) => [x + 9.5, z, y])));

// ------------------------------------------------------------------------------------------ round 7 infrastructure
// every family has a pure geom(p) returning triangles in a local frame; the body box is measured from them, so nothing floats or leaves the box
const bbox = (t) => { const a = [1e9, 1e9, 1e9], b = [-1e9, -1e9, -1e9]; for (const q of t) for (const p of q) for (let i = 0; i < 3; i++) { if (p[i] < a[i]) a[i] = p[i]; if (p[i] > b[i]) b[i] = p[i]; } return { x0: a[0], y0: a[1], z0: a[2], x1: b[0], y1: b[1], z1: b[2] }; };
const rotZ = (t, g) => { const c = m.cos(g), s = m.sin(g); return t.map((q) => q.map(([x, y, z]) => [x * c - y * s, x * s + y * c, z])); };
const rotP = (g, [x, y, z]) => { const c = m.cos(g), s = m.sin(g); return [x, y * c - z * s, y * s + z * c]; };
const scaleT = (t, sx, sy, sz) => t.map((q) => q.map(([x, y, z]) => [x * sx, y * sy, z * sz]));
const cat = (...l) => [].concat(...l);
function hull2d(pts) {
  const s = [...new Map(pts.map((p) => [p[0].toFixed(2) + ',' + p[1].toFixed(2), p])).values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (s.length < 3) return s;
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = []; for (const p of s) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  const hi = []; for (const p of [...s].reverse()) { while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}
/** extrude a convex [x, y] polygon along Z */
function prismZ(poly, z0, z1) {
  const t = [], n = poly.length;
  for (let i = 1; i < n - 1; i++) t.push([[...poly[0], z0], [...poly[i + 1], z0], [...poly[i], z0]], [[...poly[0], z1], [...poly[i], z1], [...poly[i + 1], z1]]);
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; t.push([[...p, z0], [...q, z0], [...q, z1]], [[...p, z0], [...q, z1], [...p, z1]]); }
  return t;
}
/** extrude a convex [y, z] polygon along X */
function prismX(poly, x0, x1) {
  const t = [], n = poly.length;
  for (let i = 1; i < n - 1; i++) t.push([[x0, ...poly[0]], [x0, ...poly[i]], [x0, ...poly[i + 1]]], [[x1, ...poly[0]], [x1, ...poly[i + 1]], [x1, ...poly[i]]]);
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return t;
}
/** half dome of base radius R and height h standing on z = 0 */
function domeG(R, h, seg = 24, nz = 7) {
  const pts = [], rad = [];
  for (let i = 0; i <= nz; i++) { const u = i / nz; pts.push([0, 0, h * u]); rad.push(m.max(0.04 * R, R * m.sqrt(1 - u * u))); }
  return TUBE(pts, rad, seg);
}
const torusXZ = (R, r, n = 16, seg = 4) => rotX(torus(R, r, n, seg), m.PI / 2);   // ring lying in the XZ plane
const torusYZ = (R, r, n = 16, seg = 4) => rotY(torus(R, r, n, seg), m.PI / 2);   // ring lying in the YZ plane
const frontGem = (r, seg = 12) => rotX(gemRound(r, seg), m.PI / 2);                // round stone facing -Y
const rowOf = (geom, label, p = {}) => { let t = geom(p); if (p.phi) t = rotX(t, p.phi); const b = bbox(t); return V(label, b.x1 - b.x0 + 0.2, b.y1 - b.y0 + 0.2, b.z1 - b.z0 + 0.2, p); };
const rowsOf = (geom, defs) => defs.map(([label, p]) => rowOf(geom, label, p));
/** build() from a geometry function: tilt, measure, centre in the box, rest on the bottom; plan = hull silhouette + the family's own detail */
const gbuild = (geom, note, plan) => (a, v) => {
  let t = geom(v); if (v.phi) t = rotX(t, v.phi);
  const b = bbox(t), dx = a.cx - (b.x0 + b.x1) / 2, dy = a.cy - (b.y0 + b.y1) / 2, dz = a.Z0 - b.z0;
  a.add(mv(t, dx, dy, dz));
  const P = (p) => { const q = v.phi ? rotP(v.phi, p) : p; return [q[0] + dx, q[1] + dy, q[2] + dz]; };
  a.outline();
  const pts = []; for (const q of t) for (const p of q) pts.push([p[0] + dx, p[1] + dy]);
  const h = hull2d(pts); if (h.length > 2) a.poly(h, 'EQUIP-DETAIL');
  if (plan) plan(a, v, P);
  a.log(note(v));
};
const pline = (a, P, pts, layer = 'EQUIP-DETAIL', closed = true) => { const q = pts.map((p) => P(p)); for (let i = 0; i < q.length - (closed ? 0 : 1); i++) { const c = q[i], d = q[(i + 1) % q.length]; a.line(c[0], c[1], d[0], d[1], layer); } };
const circXZ = (R, n = 36) => Array.from({ length: n }, (_, i) => [R * m.cos((i / n) * TAU), 0, R * m.sin((i / n) * TAU)]);
const ringPlan = (a, v, P) => { pline(a, P, circXZ(v.ri), 'EQUIP-HIDDEN'); };

// ------------------------------------------------------------------------------------------ rings (local: centre at the origin, finger axis Y, top +Z)
const topW = (wTop, wBot) => (g) => { const s = m.max(0, m.sin(g)); return wBot + (wTop - wBot) * s * s * s; };
function shankT(ri, t, wTop, wBot, n = 44, a0 = 0, a1 = TAU) {
  const wf = topW(wTop, wBot);
  return sweepY((g) => { const w = wf(g) / 2, h = w * 0.8; return [[-w, ri], [w, ri], [w, ri + t * 0.78], [h, ri + t], [-h, ri + t], [-w, ri + t * 0.78]]; }, 0, 0, 0, n, a0, a1);
}
/** ridged outside: grooves across the width */
function ridgeProf(ri, ro, w, ng) {
  const o = [[w / 2, ro - 0.3], [w / 2 - 0.3, ro]];
  for (let j = 0; j < ng; j++) { const yj = w / 2 - ((j + 1) * w) / (ng + 1); o.push([yj + 0.38, ro], [yj + 0.26, ro - 0.55], [yj - 0.26, ro - 0.55], [yj - 0.38, ro]); }
  o.push([-w / 2 + 0.3, ro], [-w / 2, ro - 0.3]);
  return [[-w / 2, ri], [w / 2, ri], ...o];
}

function clusterG(p) {
  const ro = p.ri + 1.7, R = m.max(p.r0 + p.r1 + 0.25, p.r1 / m.sin(m.PI / p.np) + 0.12), rp = R + p.r1 + 0.55, depth = p.r0 * 0.62 + 0.3, zp = ro + 1.2 + depth;
  let t = shankT(p.ri, 1.7, 5, 1.8);
  t = t.concat(TUBE([[0, 0, ro - 0.4], [0, 0, zp - depth]], [3, rp * 0.75], 14), TUBE([[0, 0, zp - depth], [0, 0, zp]], [rp * 0.8, rp], 28), mv(gemRound(p.r0, 16), 0, 0, zp));
  for (let i = 0; i < p.np; i++) {
    const g = (i / p.np) * TAU, g2 = ((i + 0.5) / p.np) * TAU;
    t = t.concat(mv(gemRound(p.r1, 10), R * m.cos(g), R * m.sin(g), zp), ELL((rp - 0.1) * m.cos(g2), (rp - 0.1) * m.sin(g2), zp + 0.1, 0.42, 0.42, 0.42, 5, 4));
  }
  return t;
}
const clusterRows = rowsOf(clusterG, [['flower of seven, 4 mm centre and 3 mm petals', { ri: 8.8, r0: 2, r1: 1.5, np: 6, phi: 0.95 }], ['flower of seven, 6 mm centre and 4 mm petals', { ri: 8.9, r0: 3, r1: 2, np: 6, phi: 0.95 }], ['round cluster of nine, 4.8 mm centre and 2.4 mm stones', { ri: 8.8, r0: 2.4, r1: 1.2, np: 8, phi: 0.95 }]]);

function cocktailG(p) {
  const ro = p.ri + 2.0, rx = p.b / 2, ry = p.a / 2, zr = ro + 3.0;
  let t = shankT(p.ri, 2.0, p.a * 0.5 + 2, 3.4);
  t = t.concat(prismZ(ellPoly(rx + 1.0, ry + 1.0, 28), ro - 0.6, zr), mv(scaleT(domeG(1, p.hz, 28, 8), rx, ry, 1), 0, 0, zr));
  if (p.beads) { const n = m.round((TAU * m.sqrt((rx * rx + ry * ry) / 2)) / 1.25); for (let i = 0; i < n; i++) { const g = (i / n) * TAU; t = t.concat(ELL((rx + 0.9) * m.cos(g), (ry + 0.9) * m.sin(g), zr + 0.05, 0.5, 0.5, 0.5, 5, 4)); } }
  return t;
}
const cocktailRows = rowsOf(cocktailG, [['round dome, 12 mm', { ri: 8.9, a: 12, b: 12, hz: 5, phi: 0.95 }], ['round dome, 16 mm, beaded rim', { ri: 9.0, a: 16, b: 16, hz: 7, beads: true, phi: 0.95 }], ['oval dome, 20 x 14 mm', { ri: 9.0, a: 20, b: 14, hz: 6.5, phi: 0.95 }]]);

function channelG(p) {
  const ri = p.ri, ro = ri + 2.5, w = p.bw, sq = w - 1.3, rs = ro - 1.0;
  let t = sweepY([[-w / 2, ri], [w / 2, ri], [w / 2, ro], [w / 2 - 0.55, ro], [w / 2 - 0.55, ro - 1.3], [-w / 2 + 0.55, ro - 1.3], [-w / 2 + 0.55, ro], [-w / 2, ro]], 0, 0, 0, 56);
  const g = gemPoly(octa(sq, sq, 0.01), sq * 0.5, [[0.7, 0.2 * sq]], [0.05, 0.05]), dth = (sq + 0.12) / rs;
  const n = p.full ? m.floor(TAU / dth) : m.floor((0.82 * m.PI) / dth) + 1;
  for (let i = 0; i < n; i++) { const th = p.full ? (i / n) * TAU : m.PI / 2 + (i - (n - 1) / 2) * dth; t = t.concat(put(g, 0, m.PI / 2 - th, rs * m.cos(th), 0, rs * m.sin(th))); }
  return t;
}
const channelRows = rowsOf(channelG, [['half set, 2 mm square stones', { ri: 8.8, bw: 3.3, phi: 0.5 }], ['half set, 3 mm square stones', { ri: 9.0, bw: 4.3, phi: 0.5 }], ['fully set, 2 mm square stones', { ri: 8.9, bw: 3.3, full: true, phi: 0.5 }]]);

function twistG(p) {
  const Rc = p.ri + p.ho + p.sr; let t = [];
  for (let k = 0; k < p.n; k++) {
    const pts = [], rads = [], N = p.N || 120;
    for (let i = 0; i <= N; i++) { const th = (i / N) * TAU, ph = p.tw * th + (k * TAU) / p.n, rr = Rc + p.ho * m.cos(ph); pts.push([rr * m.cos(th), p.ho * m.sin(ph), rr * m.sin(th)]); rads.push(p.sr); }
    t = t.concat(TUBE(pts, rads, 5));
  }
  return t;
}
const twistRows = rowsOf(twistG, [['two-wire twist, 1.7 mm wire', { ri: 8.6, n: 2, tw: 7, ho: 0.9, sr: 0.85, phi: 0.5 }], ['three-wire rope, 1.5 mm wire', { ri: 8.6, n: 3, tw: 6, ho: 1.2, sr: 0.75, phi: 0.5 }], ['thick two-wire rope, 2.6 mm wire', { ri: 8.9, n: 2, tw: 5, ho: 1.5, sr: 1.3, phi: 0.5 }]]);

function bypassG(p) {
  const R = p.ri + p.sr, D = 2 * p.sr + 0.3, ov = 1.0, N = 90; const pts = [], rads = [];
  for (let i = 0; i <= N; i++) { const u = i / N, th = m.PI / 2 + 0.3 + u * (TAU + ov); pts.push([R * m.cos(th), -D / 2 + D * u, R * m.sin(th)]); rads.push(p.sr); }
  let t = TUBE(pts, rads, 6);
  for (const [i, s] of [[0, p.tr], [N, p.tr * (p.term === 'stone' ? 0.8 : 1)]]) {
    const [x, y, z] = pts[i], th = m.PI / 2 + 0.3 + (i / N) * (TAU + ov);
    t = t.concat(p.term === 'stone' ? put(head(gemRound(s, 12), roundClaws(s, 4), s * 0.7, 0.3, s, s * 0.2), 0, m.PI / 2 - th, x + (s * 0.7 + p.sr) * m.cos(th), y, z + (s * 0.7 + p.sr) * m.sin(th)) : ELL(x, y, z, s, s, s, 10, 6));
  }
  return t;
}
const bypassRows = rowsOf(bypassG, [['ball ends, 2.2 mm wire', { ri: 8.6, sr: 1.1, term: 'ball', tr: 2.2, phi: 0.5 }], ['round stone ends, 2.4 mm wire', { ri: 8.7, sr: 1.2, term: 'stone', tr: 2.2, phi: 0.5 }], ['heavy wire, 3.4 mm, with large ball ends', { ri: 9.0, sr: 1.7, term: 'ball', tr: 3.2, phi: 0.5 }]]);

function spinnerG(p) {
  const ri = p.ri, r1 = ri + 1.0, w = p.w, ro = r1 + 1.5;
  let t = sweepY([[-w / 2 - 0.7, ri], [w / 2 + 0.7, ri], [w / 2 + 0.7, r1 + 0.9], [w / 2 + 0.1, r1 + 0.9], [w / 2 + 0.1, r1], [-w / 2 - 0.1, r1], [-w / 2 - 0.1, r1 + 0.9], [-w / 2 - 0.7, r1 + 0.9]], 0, 0, 0, 56);
  t = t.concat(sweepY(ridgeProf(r1 + 0.05, ro, w, p.ng), 0, 0, 0, 56));
  return t;
}
const spinnerRows = rowsOf(spinnerG, [['5 mm outer band, two grooves', { ri: 8.8, w: 5, ng: 2, phi: 0.5 }], ['8 mm outer band, three grooves', { ri: 8.9, w: 8, ng: 3, phi: 0.5 }], ['10 mm outer band, one centre groove', { ri: 9.0, w: 10, ng: 1, phi: 0.5 }]]);

function tensionG(p) {
  const ri = p.ri, t0 = 2.4, ro = ri + t0, rs = p.rs, ga = m.asin(m.min(0.9, (rs * 0.97) / ro));
  let t = shankT(ri, t0, p.bw, p.bw, 48, m.PI / 2 + ga, m.PI / 2 + TAU - ga);
  t = t.concat(mv(gemRound(rs, 16), 0, 0, ro * m.cos(ga) - 0.25));
  return t;
}
const tensionRows = rowsOf(tensionG, [['round 4.4 mm stone, 3.4 mm band', { ri: 8.8, rs: 2.2, bw: 3.4, phi: 0.95 }], ['round 5.5 mm stone, 3.8 mm band', { ri: 8.9, rs: 2.75, bw: 3.8, phi: 0.95 }], ['round 7 mm stone, 4.4 mm band', { ri: 9.1, rs: 3.5, bw: 4.4, phi: 0.95 }]]);

const lensPoly = (L, W, n = 10) => { const r = [], l = []; for (let i = 0; i <= n; i++) { const u = -1 + (2 * i) / n, y = (u * L) / 2, x = (W / 2) * m.pow(1 - u * u, 0.8); r.push([x, y]); if (i > 0 && i < n) l.unshift([-x, y]); } return r.concat(l); };
function marquiseG(p) {
  const ro = p.ri + 1.7, L = p.L, W = p.W, bh = W * 0.6 + 0.5;
  let t = shankT(p.ri, 1.7, 3.4, 1.6);
  const gem = gemPoly(lensPoly(L, W), W * 0.55, [[0.84, 0.1 * W], [0.6, 0.14 * W]], [0.05, 0.05]);
  const claws = [[0, L / 2 * 0.97], [0, -L / 2 * 0.97], [W * 0.42, L * 0.2], [-W * 0.42, L * 0.2], [W * 0.42, -L * 0.2], [-W * 0.42, -L * 0.2]];
  return t.concat(mv(head(gem, claws, bh, 0.4, W * 0.5, 0.4), 0, 0, ro - 0.3 + bh));
}
const marquiseRows = rowsOf(marquiseG, [['stone 10 x 5 mm, six claws', { ri: 8.8, L: 10, W: 5, phi: 0.95 }], ['stone 14 x 7 mm, six claws', { ri: 9.0, L: 14, W: 7, phi: 0.95 }]]);

function stoneHead(s, flip) {
  if (s.k === 'pear') {
    let poly = pearPoly(s.L, s.W), sg = flip ? -1 : 1; if (flip) poly = poly.map(([x, y]) => [x, -y]);
    const gem = gemPoly(poly, s.W * 0.62, [[0.82, s.W * 0.1], [0.6, s.W * 0.12]], [0.05, 0.05]);
    return { gem, claws: [[0, sg * s.L / 2 * 0.96], [-s.W * 0.42, -sg * s.L * 0.3], [s.W * 0.42, -sg * s.L * 0.3]], bh: s.W * 0.55 + 0.4, ext: s.L / 2, rg: s.W * 0.3 };
  }
  return { gem: gemRound(s.r, 14), claws: roundClaws(s.r, 4), bh: s.r * 0.9 + 0.3, ext: s.r, rg: s.r };
}
function toiG(p) {
  const ro = p.ri + 1.7, A = stoneHead(p.a, false), B = stoneHead(p.b, true);
  let t = shankT(p.ri, 1.7, 4.2, 1.6);
  t = t.concat(mv(head(A.gem, A.claws, A.bh, 0.35, A.rg, 0.5), 0, -(A.ext + 0.35), ro - 0.3 + A.bh), mv(head(B.gem, B.claws, B.bh, 0.35, B.rg, 0.5), 0, B.ext + 0.35, ro - 0.3 + B.bh));
  return t;
}
const toiRows = rowsOf(toiG, [['two round stones, 4 mm each', { ri: 8.8, a: { k: 'round', r: 2 }, b: { k: 'round', r: 2 }, phi: 0.95 }], ['round 5 mm and pear 8 x 5 mm stone', { ri: 8.9, a: { k: 'round', r: 2.5 }, b: { k: 'pear', L: 8, W: 5 }, phi: 0.95 }], ['two pear stones, 8 x 5 mm each', { ri: 8.9, a: { k: 'pear', L: 8, W: 5 }, b: { k: 'pear', L: 8, W: 5 }, phi: 0.95 }]]);

function pearlRingG(p) {
  const ro = p.ri + 1.7, r = p.r;
  let t = shankT(p.ri, 1.7, 3.2, 1.6);
  t = t.concat(TUBE([[0, 0, ro - 0.3], [0, 0, ro + 1.4]], [1.4, r * 0.85], 16), ELL(0, 0, ro + 1.4 + r * 0.8, r, r, r * 0.97, 18, 12), torus(r * 0.85, 0.35, 18, 4).map((q) => q.map(([x, y, z]) => [x, y, z + ro + 1.4])));
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { const th = m.PI / 2 + s * (0.3 + 0.24 * k) + 0.0; t = t.concat(put(gemRound(0.95, 6), 0, m.PI / 2 - th, (ro + 0.1) * m.cos(th), 0, (ro + 0.1) * m.sin(th))); }
  return t;
}
const pearlRingRows = rowsOf(pearlRingG, [['pearl 6 mm with four shoulder stones', { ri: 8.8, r: 3, phi: 0.95 }], ['pearl 8 mm with four shoulder stones', { ri: 8.9, r: 4, phi: 0.95 }], ['pearl 10 mm with four shoulder stones', { ri: 9.0, r: 5, phi: 0.95 }]]);

function groovedG(p) { return sweepY(ridgeProf(p.ri, p.ri + 2.0, p.w, p.ng), 0, 0, 0, 56); }
const groovedRows = rowsOf(groovedG, [['8 mm wide, two grooves', { ri: 9.0, w: 8, ng: 2, phi: 0.5 }], ['10 mm wide, three grooves', { ri: 9.0, w: 10, ng: 3, phi: 0.5 }], ['12 mm wide, four grooves', { ri: 9.2, w: 12, ng: 4, phi: 0.5 }]]);

function splitG(p) {
  const ri = p.ri, t0 = 1.7, ro = ri + t0, rs = p.rs, bh = rs * 0.95, c = 0.62;
  let t = shankT(ri, t0, 2.6, 2.6, 40, m.PI / 2 + c, m.PI / 2 + TAU - c);
  for (const s of [-1, 1]) for (const yy of [-1.4, 1.4]) t = t.concat(sweepY([[yy - 0.6, ri], [yy + 0.6, ri], [yy + 0.6, ro], [yy - 0.6, ro]], 0, 0, 0, 8, m.PI / 2 + s * 0.16, m.PI / 2 + s * c));
  return t.concat(mv(head(gemRound(rs, 16), roundClaws(rs, p.claws), bh, m.max(0.38, rs * 0.11), rs, rs * 0.22), 0, 0, ro + 0.3 + bh));
}
const splitRows = rowsOf(splitG, [['four claws, 5 mm round stone', { ri: 8.7, rs: 2.5, claws: 4, phi: 0.95 }], ['four claws, 6.5 mm round stone', { ri: 8.8, rs: 3.25, claws: 4, phi: 0.95 }], ['six claws, 8 mm round stone', { ri: 9.0, rs: 4, claws: 6, phi: 0.95 }]]);

function gypsyG(p) {
  const ro = p.ri + 2.0, rp = p.rp, poly = p.n ? Array.from({ length: p.n }, (_, i) => [rp * m.cos((i / p.n) * TAU + m.PI / p.n), rp * m.sin((i / p.n) * TAU + m.PI / p.n)]) : ellPoly(rp, rp, 28), zt = ro + 1.5;
  let t = shankT(p.ri, 2.0, m.max(3.2, rp * 0.7), 3.0);
  t = t.concat(prismZ(poly, ro - 0.5, zt), mv(gemRound(p.rs, 16), 0, 0, zt - 0.2), torus(p.rs + 0.25, 0.3, 24, 4).map((q) => q.map(([x, y, z]) => [x, y, z + zt])));
  return t;
}
const gypsyRows = rowsOf(gypsyG, [['round plate 12 mm, 6 mm stone', { ri: 8.9, rp: 6, rs: 3, n: 0, phi: 0.95 }], ['hexagonal plate 12 mm, 5 mm stone', { ri: 9.0, rp: 6, rs: 2.5, n: 6, phi: 0.95 }], ['octagonal plate 14 mm, 7 mm stone', { ri: 9.1, rp: 7, rs: 3.5, n: 8, phi: 0.95 }]]);

// ------------------------------------------------------------------------------------------ necklaces (hang in the XZ plane, loop top at z = 0)
const ballChain = (path, r, pitch) => { const cum = arcs(path), tot = cum[cum.length - 1], n = m.round(tot / pitch); let t = []; for (let i = 0; i < n; i++) { const [x, z] = atLen(path, cum, ((i + 0.5) * tot) / n); t = t.concat(ELL(x, 0, z, r, r, r, 6, 4)); } return t; };
const loopTube = (path, r, step = 3) => { const pts = [], rads = []; for (let i = 0; i < path.length; i += step) { pts.push([path[i][0], 0, path[i][1]]); rads.push(r); } return TUBE(pts, rads, 5); };
const eyeT = (z) => mv(torusXZ(1.0, 0.4, 12, 4), 0, 0, z);          // the pendant's own eye, linked into the bail
const plateXZ = (poly, y0, y1, zc = 0) => prismY(poly.map(([x, z]) => [x, z + zc]), y0, y1);

// each pendant: tris with its eye at z = 0 and the body hanging below
function pendantG(p) {
  if (p.kind === 'heart') {
    const w = p.w, h = w * 0.95, zc = -2.2 - h / 2, th = w * 0.22;
    let t = eyeT(-0.9).concat(ELL(-w * 0.25, 0, zc + h * 0.2, w * 0.27, th, w * 0.27, 14, 8), ELL(w * 0.25, 0, zc + h * 0.2, w * 0.27, th, w * 0.27, 14, 8),
      prismY([[-w * 0.5, zc + h * 0.18], [w * 0.5, zc + h * 0.18], [0, zc - h * 0.5]], -th * 0.85, th * 0.85));
    if (p.stone) t = t.concat(mv(frontGem(w * 0.15, 12), 0, -th * 0.95, zc + h * 0.1));
    return t;
  }
  if (p.kind === 'key') {
    const L = p.len, R = L * 0.13, rr = L * 0.04, top = -2.2, zc = top - R - rr, zb = top - L, sr = L * 0.03;
    let t = eyeT(-0.9).concat(torusXZ(R, rr, 24, 5).map((q) => q.map(([x, y, z]) => [x, y, z + zc])), TUBE([[0, 0, zc - R], [0, 0, zb]], [sr, sr], 8), TUBE([[0, 0, zc - R - 1], [0, 0, zc - R - 1 - L * 0.06]], [sr * 2.2, sr * 2.2], 10));
    t = t.concat(BOX(0, -sr, zb, L * 0.2, sr, zb + L * 0.09), BOX(0, -sr, zb + L * 0.15, L * 0.14, sr, zb + L * 0.24));
    return t;
  }
  if (p.kind === 'star') {
    const R = p.R, ri = R * 0.42, zc = -2.2 - R, vt = (k, rr, off) => [rr * m.cos(m.PI / 2 + off + (k * TAU) / 5), rr * m.sin(m.PI / 2 + off + (k * TAU) / 5) + zc];
    let t = eyeT(-0.9).concat(prismY(Array.from({ length: 5 }, (_, k) => vt(k, ri, m.PI / 5)), -0.8, 0.8));
    for (let k = 0; k < 5; k++) t = t.concat(prismY([vt(k - 1, ri, m.PI / 5), vt(k, R, 0), vt(k, ri, m.PI / 5)], -0.8, 0.8));
    return t.concat(p.stone ? mv(frontGem(R * 0.2, 12), 0, -0.8, zc) : ELL(0, -0.7, zc, R * 0.24, 0.9, R * 0.24, 12, 6));
  }
  if (p.kind === 'moon') {
    const R = p.R, rm = R * 0.3, zc = -2.1 - R - rm, pts = [], rads = [], N = 30;
    for (let i = 0; i <= N; i++) { const u = i / N, th = m.PI / 2 - 1.75 + u * 3.5; pts.push([R * m.cos(th), 0, zc + R * m.sin(th)]); rads.push(rm * (0.16 + 0.84 * m.pow(m.sin(m.PI * u), 0.7))); }
    return eyeT(-0.9).concat(TUBE(pts, rads, 8));
  }
  if (p.kind === 'inf') {
    const a = p.w / 2, pts = [], rads = [], N = 56, zc = -2.2 - a * 0.36;
    for (let i = 0; i <= N; i++) { const th = -m.PI / 2 + (i / N) * TAU, d = 1 + m.sin(th) * m.sin(th); pts.push([(a * m.cos(th)) / d, 0.55 * m.cos(2 * th), zc + (a * m.sin(th) * m.cos(th)) / d]); rads.push(p.r); }
    return eyeT(-0.9).concat(TUBE(pts, rads, 6), TUBE([[0, 0, -1.5], [0, 0, zc]], [0.5, 0.5], 6));
  }
  if (p.kind === 'cab') {
    const rx = p.w / 2, rz = p.h / 2, zc = -2.4 - rz - 0.9;
    return eyeT(-0.9).concat(plateXZ(ellPoly(rx + 0.9, rz + 0.9, 28), -1.6, 1.6, zc), mv(rotX(scaleT(domeG(1, p.hz, 28, 8), rx, rz, 1), m.PI / 2), 0, -1.6, zc));
  }
  if (p.kind === 'tag') {
    const L = p.tl, W = p.tw, zc = -2.4 - L / 2 - 0.9, poly = p.round ? ellPoly(L / 2, L / 2, 28) : octa(W, L, W * 0.38);
    const bd = scl(poly, 0.88).map(([x, z]) => [x, z + zc]);
    let t = eyeT(-0.9).concat(plateXZ(poly, -0.6, 0.6, zc));
    t = t.concat(TUBE([...bd, bd[0]].map(([x, z]) => [x, -0.75, z]), Array(bd.length + 1).fill(0.3), 4));
    return t;
  }
  if (p.kind === 'bead') {
    const r = p.r;
    return eyeT(-0.9).concat(ELL(0, 0, -2.2 - r, r, r, r, 16, 10), TUBE([[0, 0, -1.6], [0, 0, -2.6]], [1.8, r * 0.6], 12));
  }
  if (p.kind === 'crystal') {
    const r = p.r, h = p.len - r * 1.9, g = rotX(crystalBody(r, h, r * 0.9), m.PI);
    return eyeT(-0.9).concat(mv(g, 0, 0, -2.6), mv(torus(r * 0.95, 0.4, 14, 4), 0, 0, -3.1), TUBE([[0, 0, -1.5], [0, 0, -2.6]], [0.5, 0.5], 5));
  }
  if (p.kind === 'toggle') {
    const L = p.len;
    return eyeT(-0.9).concat(TUBE([[-L / 2, 0, -3.6], [L / 2, 0, -3.6]], [1.9, 1.9], 10), ELL(-L / 2, 0, -3.6, 1.9, 1.9, 1.9, 8, 5), ELL(L / 2, 0, -3.6, 1.9, 1.9, 1.9, 8, 5), TUBE([[0, 0, -2], [0, 0, -3.6]], [0.5, 0.5], 5));
  }
  return [];
}
function neckG(p) {
  const pr = { ratio: 1.55, ...p }, { H, path } = loopOf(p.L, pr.ratio), zc = -H / 2;
  let t;
  if (p.chain === 'ball') t = ballChain(path.map(([x, z]) => [x, z + zc]), 1.3, 3.5);
  else if (p.chain === 'cord') t = loopTube(path.map(([x, z]) => [x, z + zc]), 0.9, 3).concat(TUBE([[-2.4, 0, 0.2], [2.4, 0, 0.2]], [1.1, 1.1], 8), ELL(0, 0, 0.2, 2.2, 1.4, 1.5, 10, 6));
  else t = chainAlong(path, 0, 0, zc, LK, 0);
  if (p.chain !== 'cord') t = t.concat(put(lobster(), 0, 0, 0, 0, 0.5));
  t = t.concat(mv(torusYZ(2.4, 0.5, 14, 4), 0, 0, -H - 0.8), mv(pendantG(p), 0, 0, -H - 3.0));
  return t;
}
const nrow = (label, inches, p) => ({ label, p: { ...p, L: inches * IN } });
const neckRows = (defs) => defs.map(({ label, p }) => rowOf(neckG, label, p));
const heartRows = neckRows([nrow('puffed heart 12 mm, 16 in chain', 16, { kind: 'heart', w: 12 }), nrow('puffed heart 16 mm, 18 in chain', 18, { kind: 'heart', w: 16 }), nrow('puffed heart 22 mm, 20 in chain', 20, { kind: 'heart', w: 22 }), nrow('puffed heart 20 mm with a centre stone, 18 in chain', 18, { kind: 'heart', w: 20, stone: true })]);
const keyRows = neckRows([nrow('key 30 mm, 18 in chain', 18, { kind: 'key', len: 30 }), nrow('key 40 mm, 20 in chain', 20, { kind: 'key', len: 40 }), nrow('key 52 mm, 24 in chain', 24, { kind: 'key', len: 52 })]);
const starRows = neckRows([nrow('five-point star 16 mm, 16 in chain', 16, { kind: 'star', R: 8 }), nrow('five-point star 24 mm, 18 in chain', 18, { kind: 'star', R: 12 }), nrow('five-point star 32 mm with a centre stone, 20 in chain', 20, { kind: 'star', R: 16, stone: true })]);
const moonRows = neckRows([nrow('crescent 16 mm, 16 in chain', 16, { kind: 'moon', R: 8 }), nrow('crescent 22 mm, 18 in chain', 18, { kind: 'moon', R: 11 }), nrow('crescent 30 mm, 20 in chain', 20, { kind: 'moon', R: 15 })]);
const infRows = neckRows([nrow('loop 20 mm, 16 in chain', 16, { kind: 'inf', w: 20, r: 0.8 }), nrow('loop 28 mm, 18 in chain', 18, { kind: 'inf', w: 28, r: 1.0 }), nrow('loop 38 mm, 20 in chain', 20, { kind: 'inf', w: 38, r: 1.2 })]);
const cabRows = neckRows([nrow('oval stone 12 x 16 mm, 16 in chain', 16, { kind: 'cab', w: 12, h: 16, hz: 4 }), nrow('oval stone 16 x 22 mm, 18 in chain', 18, { kind: 'cab', w: 16, h: 22, hz: 5.5 }), nrow('oval stone 22 x 30 mm, 20 in chain', 20, { kind: 'cab', w: 22, h: 30, hz: 7 }), nrow('round stone 24 mm, 18 in chain', 18, { kind: 'cab', w: 24, h: 24, hz: 6.5 })]);
const tagRows = neckRows([nrow('rectangular tag 25 x 13 mm, 16 in ball chain', 16, { kind: 'tag', tl: 25, tw: 13, chain: 'ball' }), nrow('rectangular tag 30 x 16 mm, 18 in ball chain', 18, { kind: 'tag', tl: 30, tw: 16, chain: 'ball' }), nrow('rectangular tag 38 x 20 mm, 20 in ball chain', 20, { kind: 'tag', tl: 38, tw: 20, chain: 'ball' }), nrow('round tag 24 mm, 18 in ball chain', 18, { kind: 'tag', tl: 24, tw: 24, round: true, chain: 'ball' })]);
const cordRows = neckRows([nrow('round bead 12 mm, 18 in cord', 18, { kind: 'bead', r: 6, chain: 'cord' }), nrow('round bead 18 mm, 20 in cord', 20, { kind: 'bead', r: 9, chain: 'cord' }), nrow('crystal point 30 mm, 24 in cord', 24, { kind: 'crystal', r: 4.5, len: 30, chain: 'cord' }), nrow('toggle bar 40 mm, 18 in cord', 18, { kind: 'toggle', len: 40, chain: 'cord' })]);

function lariatG(p) {
  const { H, path } = loopOf(p.L, 1.3), LK2 = { pitch: 6, a: 4.4, b: 1.8, r: 0.6 };
  let t = chainAlong(path, 0, 0, -H / 2, LK, 0).concat(mv(torusXZ(4, 0.8, 18, 5), 0, 0, -0.5));
  t = t.concat(chainAlong([[0, 0], [0, -p.tail]], 0, 0, -0.5, LK2, 1), ELL(0, 0, -0.5 - p.tail - 3, 2.6, 2.6, 3.6, 12, 8), TUBE([[0, 0, -0.5 - p.tail], [0, 0, -0.5 - p.tail - 1]], [0.6, 0.6], 6));
  return t;
}
const lariatRows = [['tail 2 in, 17 in loop', 17, 50], ['tail 3 in, 20 in loop', 20, 76], ['tail 4.5 in, 24 in loop', 24, 114]].map(([l, i, tail]) => rowOf(lariatG, l, { L: i * IN, tail }));

function ribbon(path, w, t) {
  const n = path.length, ring = (i) => { const [x, z] = path[i], [x1, z1] = path[m.min(n - 1, i + 1)], [x0, z0] = path[m.max(0, i - 1)], tx = x1 - x0, tz = z1 - z0, l = m.hypot(tx, tz) || 1, nx = -tz / l, nz = tx / l;
    return [[x + (nx * t) / 2, w / 2, z + (nz * t) / 2], [x + (nx * t) / 2, -w / 2, z + (nz * t) / 2], [x - (nx * t) / 2, -w / 2, z - (nz * t) / 2], [x - (nx * t) / 2, w / 2, z - (nz * t) / 2]]; };
  const out = []; let A = ring(0);
  for (let i = 1; i < n; i++) { const B = ring(i); for (let k = 0; k < 4; k++) { const k2 = (k + 1) % 4; out.push([A[k], A[k2], B[k2]], [A[k], B[k2], B[k]]); } A = B; }
  const E0 = ring(0), E1 = ring(n - 1); out.push([E0[0], E0[1], E0[2]], [E0[0], E0[2], E0[3]], [E1[0], E1[2], E1[1]], [E1[0], E1[3], E1[2]]);
  return out;
}
function chokerG(p) {
  const R0 = p.L / TAU, pp = Array.from({ length: 225 }, (_, i) => { const g = ((i + 8) / 240) * TAU; return [R0 * m.sin(g), R0 * 0.93 * m.cos(g) - R0 * 0.93]; });
  let t = ribbon(pp, p.w, 1.4);
  const e0 = pp[0], e1 = pp[pp.length - 1], bot = pp[m.floor(pp.length / 2)];
  t = t.concat(mv(torusXZ(2.4, 0.6, 12, 4), e0[0] - 1.6, 0, e0[1] + 1.2), BOX(e1[0] - 0.4, -p.w / 2, e1[1] - 0.4, e1[0] + 4, p.w / 2, e1[1] + 0.4));
  if (p.center === 'ring') t = t.concat(mv(torusXZ(4.2, 0.9, 20, 5), bot[0], 0, bot[1] - 0.4));
  else if (p.center === 'bar') t = t.concat(BOX(bot[0] - 7, -1.7, bot[1] - 2.2, bot[0] + 7, -0.7, bot[1] + 2.2));
  else t = t.concat(TUBE([[bot[0], -0.7, bot[1]], [bot[0], -1.9, bot[1]]], [p.w * 0.45, p.w * 0.45], 20), mv(frontGem(p.w * 0.32, 14), bot[0], -1.9, bot[1]));
  return t;
}
const chokerRows = [['ribbon 6 mm with a centre ring, 14 in', 14, 6, 'ring'], ['ribbon 10 mm with a centre bar, 15 in', 15, 10, 'bar'], ['ribbon 16 mm with a collet stone, 16 in', 16, 16, 'stone']].map(([l, i, w, center]) => rowOf(chokerG, l, { L: i * IN, w, center, phi: 0.6 }));

function fringeG(p) {
  const { H, path } = loopOf(p.L, 1.55), cum = arcs(path), tot = cum[cum.length - 1];
  let t = chainAlong(path, 0, 0, -H / 2, LK, 0).concat(put(lobster(), 0, 0, 0, 0, 0.5));
  for (let i = 0; i < p.n; i++) {
    const s = tot / 2 + (i - (p.n - 1) / 2) * p.pitch, [x, z] = atLen(path, cum, s), c = m.abs(i - (p.n - 1) / 2) / ((p.n - 1) / 2), len = p.lc - (p.lc - p.le) * c, zz = z - H / 2;
    t = t.concat(mv(torusYZ(1.5, 0.4, 10, 4), x, 0, zz - 0.8), TUBE([[x, 0, zz - 2.2], [x, 0, zz - 4]], [0.5, 0.5], 5), ELL(x, 0, zz - 4 - len / 2, 2.3, 2.3, len / 2, 12, 8));
  }
  return t;
}
const fringeRows = [['five drops, 16 in chain', 16, 5, 14, 16, 9], ['seven drops, 16 in chain', 16, 7, 12, 14, 8], ['nine drops, 18 in chain', 18, 9, 11, 13, 7]].map(([l, i, n, pitch, lc, le]) => rowOf(fringeG, l, { L: i * IN, n, pitch, lc, le }));

// ------------------------------------------------------------------------------------------ earrings on a display card (card front at y = 0, earrings in front of it, posts through to the back)
const LK3 = { pitch: 5, a: 3.2, b: 1.4, r: 0.5 };
function backing(x) { return TUBE([[x, 0.3, 0], [x, 2.6, 0]], [0.55, 0.55], 8).concat(BOX(x - 3, 1.5, -0.5, x + 3, 2.6, 0.5), BOX(x - 0.5, 1.5, -3, x + 0.5, 2.6, 3)); }
function earG(p) {
  const k = p.kind;
  if (k === 'chandelier') {
    const w = p.w, n = p.lens.length, zb = -7.5;
    let t = ELL(0, -1.5, 0, 2.4, 1.2, 2.4, 10, 6).concat(TUBE([[0, -1.5, 0], [0, 2.4, 0]], [0.55, 0.55], 8), backing(0), TUBE([[0, -1.5, -2], [0, -1.5, -3.6]], [0.6, 0.6], 6));
    t = t.concat(prismY([[-w * 0.3, -3.5], [w * 0.3, -3.5], [w / 2, zb], [-w / 2, zb]], -2.1, -0.9));
    for (let i = 0; i < n; i++) { const x = n === 1 ? 0 : -w / 2 + 1.6 + (i * (w - 3.2)) / (n - 1); t = t.concat(mv(frontGem(0.95, 8), x, -2.1, -5.2), TUBE([[x, -1.5, zb], [x, -1.5, zb - 2.2]], [0.4, 0.4], 5), ELL(x, -1.5, zb - 2.2 - p.lens[i] / 2, 1.9, 1.2, p.lens[i] / 2, 10, 6)); }
    return t;
  }
  if (k === 'bar') {
    const L = p.len, ch = p.ch;
    return ELL(0, -1.5, 0, 2.0, 1.2, 2.0, 10, 6).concat(TUBE([[0, -1.5, 0], [0, 2.4, 0]], [0.55, 0.55], 8), backing(0), chainAlong([[0, 0], [0, -ch]], 0, -1.5, -2.2, LK3, 0),
      BOX(-0.9, -2.2, -2.2 - ch - L, 0.9, -0.8, -2.2 - ch), ELL(0, -1.5, -2.2 - ch, 1.3, 0.9, 1.3, 8, 5), ELL(0, -1.5, -2.2 - ch - L, 1.5, 1.0, 1.5, 8, 5));
  }
  if (k === 'pearl') {
    const r = p.r;
    return ELL(0, -r * 0.9 - 0.9, 0, r, r, r, 18, 12).concat(TUBE([[0, -1.4, 0], [0, 0, 0]], [r * 0.7, r * 0.8], 20), torus(r * 0.72, 0.3, 16, 4).map((q) => q.map(([x, y, z]) => [x, y, z])).map((q) => q.map(([x, y, z]) => [x, -1.4, y])), TUBE([[0, 0, 0], [0, 2.4, 0]], [0.55, 0.55], 8), backing(0));
  }
  if (k === 'flower') {
    const r0 = p.r0, r1 = p.r1, R = m.max(r0 + r1 + 0.2, r1 / m.sin(m.PI / p.np) + 0.1), rp = R + r1 + 0.5;
    let t = TUBE([[0, -0.9, 0], [0, 0, 0]], [rp, rp], 24).concat(mv(frontGem(r0, 14), 0, -0.9, 0), TUBE([[0, 0, 0], [0, 2.4, 0]], [0.55, 0.55], 8), backing(0));
    for (let i = 0; i < p.np; i++) { const g = (i / p.np) * TAU; t = t.concat(mv(frontGem(r1, 10), R * m.cos(g), -0.9, R * m.sin(g))); }
    return t;
  }
  if (k === 'threader') {
    const len = p.len, pts = [[0, -0.9, -3], [0, -0.9, 1], [0, 0.4, 2.4], [0, 1.9, 1], [0, 1.9, -1]];
    return TUBE(pts, [0.5, 0.5, 0.5, 0.5, 0.5], 6).concat(ELL(0, -0.9, -3.4, 1.5, 1.5, 1.5, 8, 5), chainAlong([[0, 0], [0, -len]], 0, -0.9, -4.6, { pitch: 4.5, a: 2.8, b: 1.2, r: 0.42 }, 0),
      TUBE([[0, -0.9, -4.6 - len], [0, -0.9, -4.6 - len - 3.2]], [0.55, 1.4], 8), ELL(0, -0.9, -4.6 - len - 4.4, 1.4, 1.4, 1.4, 8, 5));
  }
  if (k === 'geo') {
    const s = p.s, z0 = -2.6, poly = p.shape === 'tri' ? [[-s / 2, z0], [s / 2, z0], [0, z0 - s * 0.9]] : p.shape === 'dia' ? [[0, z0], [s / 2, z0 - s * 0.6], [0, z0 - s * 1.2], [-s / 2, z0 - s * 0.6]] : [[-s * 0.3, z0], [s * 0.3, z0], [s * 0.5, z0 - s * 0.6], [s * 0.3, z0 - s * 1.2], [-s * 0.3, z0 - s * 1.2], [-s * 0.5, z0 - s * 0.6]];
    const cx = 0, cz = poly.reduce((q, r) => q + r[1], 0) / poly.length, inner = poly.map(([x, z]) => [x * 0.62, cz + (z - cz) * 0.62]);
    return ELL(0, -1.5, 0, 2.0, 1.2, 2.0, 10, 6).concat(TUBE([[0, -1.5, 0], [0, 2.4, 0]], [0.55, 0.55], 8), backing(0), TUBE([[0, -1.5, -1], [0, -1.5, z0 - 0.4]], [0.55, 0.55], 6),
      prismY(poly, -2.1, -0.9), prismY(inner, -2.7, -2.1));
  }
  if (k === 'tassel') {
    const L = p.len, n = 9; let t = ELL(0, -1.5, 0, 2.2, 1.3, 2.2, 10, 6).concat(TUBE([[0, -1.5, 0], [0, 2.4, 0]], [0.55, 0.55], 8), backing(0), TUBE([[0, -1.5, -2.2], [0, -1.5, -4.6]], [0.5, 1.9], 10), torus(2.0, 0.4, 14, 4).map((q) => q.map(([x, y, z]) => [x, y - 1.5, z - 4.6])));
    for (let i = 0; i < n; i++) { const f = (i - (n - 1) / 2) / ((n - 1) / 2), len = L * (1 - 0.22 * m.abs(f)); t = t.concat(TUBE([[f * 1.6, -1.5, -4.8], [f * (1.6 + L / 28), -1.5 - m.abs(f) * 0.6, -4.8 - len]], [0.3, 0.3], 4), ELL(f * (1.6 + L / 28), -1.5 - m.abs(f) * 0.6, -4.8 - len, 0.55, 0.55, 0.55, 5, 4)); }
    return t;
  }
  return [];
}
function earCardG(p) {
  const e = earG(p), sp = p.sp, one = bbox(e);
  let t = cat(mv(e, -sp / 2, 0, 0), mv(e, sp / 2, 0, 0));
  const x1 = sp / 2 + one.x1 + 7, zTop = p.top ?? one.z1 + 6, zBot = one.z0 - 6, h = zTop - zBot;
  t = t.concat(BOX(-x1, 0, zBot, x1, 1.2, zTop), TUBE([[0, 1.2, zTop - h * 0.3], [0, 1.2 + h * 0.34, zBot + 0.6]], [0.7, 0.7], 6), BOX(-5, 1.2, zBot, 5, 1.2 + h * 0.34 + 0.7, zBot + 0.6));
  return t;
}
const earRows = (defs) => defs.map(([l, p]) => rowOf(earCardG, l, { sp: 44, ...p }));
const chandRows = earRows([['three drops, 1.5 in, pair on a card', { kind: 'chandelier', w: 14, lens: [8, 12, 8] }], ['five drops, 1.9 in, pair on a card', { kind: 'chandelier', w: 22, lens: [8, 11, 14, 11, 8] }], ['five long drops, 2.4 in, pair on a card', { kind: 'chandelier', w: 24, lens: [15, 21, 27, 21, 15], sp: 52 }]]);
const barERows = earRows([['bar drop 1 in, pair on a card', { kind: 'bar', len: 20, ch: 8 }], ['bar drop 1.6 in, pair on a card', { kind: 'bar', len: 32, ch: 10 }], ['bar drop 2.2 in, pair on a card', { kind: 'bar', len: 46, ch: 12 }]]);
const pearlERows = earRows([['5 mm pearls, pair on a card', { kind: 'pearl', r: 2.5, sp: 36 }], ['6 mm pearls, pair on a card', { kind: 'pearl', r: 3, sp: 36 }], ['8 mm pearls, pair on a card', { kind: 'pearl', r: 4, sp: 38 }], ['10 mm pearls, pair on a card', { kind: 'pearl', r: 5, sp: 40 }]]);
const flowERows = earRows([['five petals, 8 mm, pair on a card', { kind: 'flower', r0: 1.5, r1: 1.2, np: 5, sp: 36 }], ['six petals, 11 mm, pair on a card', { kind: 'flower', r0: 2, r1: 1.6, np: 6, sp: 38 }], ['eight petals, 14 mm, pair on a card', { kind: 'flower', r0: 2.6, r1: 1.9, np: 8, sp: 42 }]]);
const thrERows = earRows([['threader chain 1.6 in, pair on a card', { kind: 'threader', len: 40, top: 1.0 }], ['threader chain 2.4 in, pair on a card', { kind: 'threader', len: 60, top: 1.0 }], ['threader chain 3.5 in, pair on a card', { kind: 'threader', len: 90, top: 1.0 }]]);
const geoERows = earRows([['triangle plate 18 mm, pair on a card', { kind: 'geo', shape: 'tri', s: 18 }], ['diamond plate 16 mm, pair on a card', { kind: 'geo', shape: 'dia', s: 16 }], ['tall hexagon plate 14 mm, pair on a card', { kind: 'geo', shape: 'hex', s: 14 }]]);
const tasERows = earRows([['tassel 1.6 in, pair on a card', { kind: 'tassel', len: 40 }], ['tassel 2.4 in, pair on a card', { kind: 'tassel', len: 60 }], ['tassel 3.2 in, pair on a card', { kind: 'tassel', len: 80, sp: 50 }]]);

// ------------------------------------------------------------------------------------------ bracelets (loops in the XZ plane, wrist circle about 170 mm)
function beadedG(p) {
  const R = 27, r = p.r, n = p.sp ? m.round((TAU * R) / (2 * r + 2.6)) : m.round((TAU * R) / (2 * r + 0.1)); let t = torus(R, 0.4, 40, 4).map((q) => q.map(([x, y, z]) => [x, z, y]));
  for (let i = 0; i < n; i++) {
    const g = (i / n) * TAU; t = t.concat(ELL(R * m.cos(g), 0, R * m.sin(g), r, r, r, 10, 6));
    if (p.sp) { const g2 = ((i + 0.5) / n) * TAU; t = t.concat(ELL(R * m.cos(g2), 0, R * m.sin(g2), 1.2, 1.6, 1.2, 6, 4)); }
  }
  return t;
}
const beadedRows = rowsOf(beadedG, [['6 mm beads on elastic', { r: 3, phi: 0.5 }], ['8 mm beads with ball spacers', { r: 4, sp: true, phi: 0.5 }], ['10 mm beads on elastic', { r: 5, phi: 0.5 }]]);

function barLinkG(p) {
  const R = 28, len = p.len, gap = 0.22, th0 = m.PI / 2 + gap, th1 = m.PI / 2 + TAU - gap, n = m.round(((th1 - th0) * R) / (len + 2.2)); let t = [];
  for (let i = 0; i < n; i++) {
    const th = th0 + ((i + 0.5) / n) * (th1 - th0), x = R * m.cos(th), z = R * m.sin(th), al = -(th + m.PI / 2);
    t = t.concat(put(BOX(-len / 2, -2.6, -1.2, len / 2, 2.6, 1.2), 0, al, x, 0, z), put(BOX(-len / 2 + 0.8, -2.6, 1.2, len / 2 - 0.8, 2.6, 1.7), 0, al, x, 0, z));
    const thj = th0 + ((i + 1) / n) * (th1 - th0); if (i < n - 1) t = t.concat(TUBE([[R * m.cos(thj), -3.1, R * m.sin(thj)], [R * m.cos(thj), 3.1, R * m.sin(thj)]], [0.8, 0.8], 8));
  }
  t = t.concat(mv(torusXZ(4.2, 0.8, 16, 5), -1.0, 0, R), TUBE([[3.2, -3, R], [3.2, 3, R]], [1.0, 1.0], 8), ELL(3.2, -3, R, 1.5, 1.5, 1.5, 8, 5), ELL(3.2, 3, R, 1.5, 1.5, 1.5, 8, 5));
  return t;
}
const barLinkRows = rowsOf(barLinkG, [['short bar links 8 mm, toggle clasp', { len: 8, phi: 0.5 }], ['bar links 12 mm, toggle clasp', { len: 12, phi: 0.5 }], ['long bar links 16 mm, toggle clasp', { len: 16, phi: 0.5 }]]);

const twBangleRows = rowsOf(twistG, [['two-wire, 3 mm wire', { ri: 29, n: 2, tw: 12, ho: 1.5, sr: 1.5, N: 150, phi: 0.5 }], ['three-wire, 2.4 mm wire', { ri: 29, n: 3, tw: 11, ho: 2.0, sr: 1.2, N: 150, phi: 0.5 }], ['thick two-wire, 5 mm wire', { ri: 30, n: 2, tw: 9, ho: 2.5, sr: 2.5, N: 130, phi: 0.5 }]]);

function idBraceletG(p) {
  const R = 28, lp = p.lp, wp = p.wp, ang = (lp / 2 + 2.8) / R, lk = { pitch: 6, a: 5, b: 3, r: 1.0 };
  const path = Array.from({ length: 121 }, (_, i) => { const th = m.PI / 2 + ang + (i / 120) * (TAU - 2 * ang); return [R * m.cos(th), R * m.sin(th)]; });
  let t = chainAlong(path, 0, 0, 0, lk, 0);
  t = t.concat(BOX(-lp / 2, -wp / 2, R - 0.8, lp / 2, wp / 2, R + 0.8), BOX(-lp / 2, -wp / 2, R + 0.8, lp / 2, -wp / 2 + 0.8, R + 1.3), BOX(-lp / 2, wp / 2 - 0.8, R + 0.8, lp / 2, wp / 2, R + 1.3), BOX(-lp / 2, -wp / 2, R + 0.8, -lp / 2 + 0.8, wp / 2, R + 1.3), BOX(lp / 2 - 0.8, -wp / 2, R + 0.8, lp / 2, wp / 2, R + 1.3));
  for (const s of [-1, 1]) t = t.concat(mv(torusXZ(1.9, 0.5, 10, 4), s * (lp / 2 + 1.6), 0, R));
  return t;
}
const idRows = rowsOf(idBraceletG, [['curb links with a 25 x 6 mm plate', { lp: 25, wp: 6, phi: 0.5 }], ['curb links with a 32 x 8 mm plate', { lp: 32, wp: 8, phi: 0.5 }], ['curb links with a 40 x 10 mm plate', { lp: 40, wp: 10, phi: 0.5 }]]);

function stackSetG(p) {
  const R = 30, sp = { p: [2.4, 1.6], b: [2.4, 1.4], s: [3.0, 1.6], f: [5.0, 1.4] }; let y = 0, t = [];
  for (const k of p.set) {
    const [w, th] = sp[k], yc = y + w / 2, ro = R + th;
    t = t.concat(sweepY([[-w / 2, R], [w / 2, R], [w / 2, ro], [-w / 2, ro]], 0, yc, 0, 48));
    if (k === 'b') { const n = m.round((m.PI * ro) / 2.7); for (let i = 0; i < n; i++) { const g = ((i + 0.5) / n) * m.PI; t = t.concat(ELL((ro + 0.2) * m.cos(g), yc, (ro + 0.2) * m.sin(g), 1.0, 1.0, 1.0, 5, 4)); } }
    if (k === 's') { const n = m.round((m.PI * ro) / 2.4); for (let i = 0; i < n; i++) { const g = ((i + 0.5) / n) * m.PI; t = t.concat(put(gemRound(1.1, 6), 0, m.PI / 2 - g, (ro + 0.1) * m.cos(g), yc, (ro + 0.1) * m.sin(g))); } }
    y += w + 0.4;
  }
  return t;
}
const stackRows = rowsOf(stackSetG, [['three bangles, plain, stone row, beaded', { set: ['p', 's', 'b'], phi: 0.5 }], ['four bangles, plain, wide, stone row, plain', { set: ['p', 'f', 's', 'p'], phi: 0.5 }], ['five bangles, beaded, plain, stone row, plain, beaded', { set: ['b', 'p', 's', 'p', 'b'], phi: 0.5 }]]);

// ------------------------------------------------------------------------------------------ loose stones (on a thin pad), crystals, display pieces
const heartPoly = (L, W, n = 28) => { const pts = Array.from({ length: n }, (_, i) => { const t = (i / n) * TAU; return [16 * m.pow(m.sin(t), 3), 13 * m.cos(t) - 5 * m.cos(2 * t) - 2 * m.cos(3 * t) - m.cos(4 * t)]; }); const b = pts.reduce((q, [x, y]) => [m.min(q[0], y), m.max(q[1], y), m.max(q[2], m.abs(x))], [1e9, -1e9, 0]); return pts.map(([x, y]) => [(x / b[2]) * (W / 2), ((y - (b[0] + b[1]) / 2) / (b[1] - b[0])) * L]); };
const cushionPoly = (L, W, n = 28) => Array.from({ length: n }, (_, i) => { const t = (i / n) * TAU, c = m.cos(t), s = m.sin(t); return [(W / 2) * m.sign(c) * m.pow(m.abs(c), 0.4), (L / 2) * m.sign(s) * m.pow(m.abs(s), 0.4)]; });
const trillionPoly = (R, n = 30) => Array.from({ length: n }, (_, i) => { const t = (i / n) * TAU + m.PI / 2, ph = ((((t - m.PI / 2) % (TAU / 3)) + TAU / 3) % (TAU / 3)) - TAU / 6, r = R * m.pow(0.5 / m.cos(ph), 0.9); return [r * m.cos(t), r * m.sin(t)]; });
function stoneOnPad(p) {
  let poly, depth, steps, keel = [0.06, 0.06];
  const L = p.L, W = p.W;
  if (p.cut === 'cab') { const g = scaleT(domeG(1, p.hz, 28, 8), W / 2, L / 2, 1), g2 = prismZ(ellPoly(W / 2, L / 2, 28), 0, 1.0); const pad = TUBE([[0, 0, 0], [0, 0, 0.8]], [m.max(L, W) / 2 + 2, m.max(L, W) / 2 + 2], 28); return pad.concat(mv(g2, 0, 0, 0.8), mv(g, 0, 0, 1.8)); }
  if (p.cut === 'baguette') { poly = octa(L, W, W * 0.1).map(([x, y]) => [y, x]); depth = W * 0.7; steps = [[0.86, 0.1 * W], [0.66, 0.12 * W], [0.46, 0.1 * W]]; keel = [0.5, 0.05]; }
  else if (p.cut === 'marquise') { poly = lensPoly(L, W); depth = W * 0.55; steps = [[0.84, 0.08 * W], [0.62, 0.1 * W], [0.5, 0.06 * W]]; }
  else if (p.cut === 'heart') { poly = heartPoly(L, W); depth = W * 0.6; steps = [[0.84, 0.08 * W], [0.62, 0.1 * W], [0.5, 0.06 * W]]; }
  else if (p.cut === 'cushion') { poly = cushionPoly(L, W); depth = W * 0.62; steps = [[0.86, 0.08 * W], [0.64, 0.1 * W], [0.5, 0.06 * W]]; }
  else { poly = trillionPoly(L / 2); depth = L * 0.4; steps = [[0.84, 0.08 * L], [0.6, 0.1 * L]]; }
  let g = gemPoly(poly, depth, steps, keel); const b = bbox(g);
  const pr = m.max(b.x1 - b.x0, b.y1 - b.y0) / 2 + 2;
  return TUBE([[0, 0, 0], [0, 0, 0.8]], [pr, pr], 28).concat(mv(g, 0, 0, 0.8 - b.z0));
}
const stoneDims = (cut, L, W, hz) => ({ cut, L, W, hz });
const stRowsOf = (defs) => defs.map(([l, p]) => rowOf(stoneOnPad, l, p));
const cabRowsS = stRowsOf([['oval cabochon, 10 x 8 mm', stoneDims('cab', 10, 8, 2.5)], ['oval cabochon, 14 x 10 mm', stoneDims('cab', 14, 10, 3.5)], ['oval cabochon, 18 x 13 mm', stoneDims('cab', 18, 13, 4.5)]]);
const bagRows = stRowsOf([['baguette, 6 x 2.5 mm', stoneDims('baguette', 6, 2.5)], ['baguette, 9 x 3 mm', stoneDims('baguette', 9, 3)], ['baguette, 12 x 4 mm', stoneDims('baguette', 12, 4)]]);
const marqRows = stRowsOf([['marquise, 8 x 4 mm', stoneDims('marquise', 8, 4)], ['marquise, 12 x 6 mm', stoneDims('marquise', 12, 6)], ['marquise, 16 x 8 mm', stoneDims('marquise', 16, 8)]]);
const heartRowsS = stRowsOf([['heart-shaped, 5 mm', stoneDims('heart', 5, 5)], ['heart-shaped, 7 mm', stoneDims('heart', 7, 7)], ['heart-shaped, 10 mm', stoneDims('heart', 10, 10)]]);
const cushRows = stRowsOf([['cushion-shaped, 5 mm', stoneDims('cushion', 5, 5)], ['cushion-shaped, 7 x 5 mm', stoneDims('cushion', 7, 5)], ['cushion-shaped, 9 mm', stoneDims('cushion', 9, 9)]]);
const triRowsS = stRowsOf([['triangular, 6 mm', stoneDims('trillion', 6, 6)], ['triangular, 9 mm', stoneDims('trillion', 9, 9)]]);

function crystalBody(r, h, ht, seg = 6) {
  const hex = Array.from({ length: seg }, (_, i) => [r * m.cos((i / seg) * TAU), r * m.sin((i / seg) * TAU)]);
  return prismZ(hex, 0, h).concat(frustum(hex, h, scl(hex, 0.05), h + ht));
}
function crystalG(p) {
  const pad = 0.8, parts = p.parts.map(([r, h, ht, tx, ty, x, y]) => { let c = crystalBody(r, h, ht); if (tx) c = rotX(c, tx); if (ty) c = rotY(c, ty); const b = bbox(c); return mv(c, x, y, pad - b.z0); });
  const all = cat(...parts), b = bbox(all), pr = m.max(m.abs(b.x0), m.abs(b.x1), m.abs(b.y0), m.abs(b.y1)) + 2;
  return TUBE([[0, 0, 0], [0, 0, pad]], [pr, pr], 28).concat(all);
}
const crystalRows = rowsOf(crystalG, [['single point, 20 mm', { parts: [[4.5, 12, 8, 0, 0, 0, 0]] }], ['single point, 32 mm', { parts: [[6, 20, 12, 0, 0, 0, 0]] }], ['cluster of three points, 28 mm', { parts: [[5, 16, 9, 0, 0, 0, 0], [3.8, 11, 7, 0.22, 0.0, -9, 4], [3.2, 9, 6, -0.2, 0.25, 8, -5]] }]]);

// ---- display pieces
function watchBoxG(p) {
  const n = p.n, W = 62 * n + 8, D = 82, H = 42, wl = 4, lh = 18; let t = [];
  t = t.concat(BOX(-W / 2, -D / 2, 0, W / 2, D / 2, 6), BOX(-W / 2, -D / 2, 6, -W / 2 + wl, D / 2, H), BOX(W / 2 - wl, -D / 2, 6, W / 2, D / 2, H), BOX(-W / 2 + wl, -D / 2, 6, W / 2 - wl, -D / 2 + wl, H), BOX(-W / 2 + wl, D / 2 - wl, 6, W / 2 - wl, D / 2, H));
  for (let i = 0; i < n; i++) { const x = -W / 2 + 4 + 31 + i * 62; t = t.concat(ELL(x, 0, 6 + 10, 21, 28, 11, 16, 10), BOX(x - 5, -28, 6 + 17, x + 5, 28, 6 + 21.5)); }
  const lid = cat(BOX(-W / 2, -D, 0, W / 2, 0, 3), BOX(-W / 2, -D, 3, -W / 2 + wl, 0, lh), BOX(W / 2 - wl, -D, 3, W / 2, 0, lh), BOX(-W / 2 + wl, -D, 3, W / 2 - wl, -D + wl, lh), BOX(-W / 2 + wl, -wl, 3, W / 2 - wl, 0, lh), BOX(-W / 2 + wl + 2, -D + wl + 2, 3, W / 2 - wl - 2, -wl - 2, 6));
  const g = -(m.PI / 2 + 0.3);
  t = t.concat(mv(rotX(mv(lid, 0, 0, -3), g), 0, D / 2, H + 3), TUBE([[-W / 2 + 6, D / 2, H], [W / 2 - 6, D / 2, H]], [2.4, 2.4], 10), BOX(-3, -D / 2 - 1.2, H - 7, 3, -D / 2, H - 2));
  return t;
}
const watchBoxRows = rowsOf(watchBoxG, [['one watch pillow, lid open', { n: 1 }], ['two watch pillows, lid open', { n: 2 }], ['four watch pillows, lid open', { n: 4 }]]);

function watchStandG(p) {
  let t = TUBE([[0, 0, 0], [0, 0, 4]], [32, 32], 32).concat(TUBE([[0, 0, 4], [0, 0, 5.5]], [30, 28], 32), TUBE([[0, 0, 5.5], [0, 0, p.hs]], [4, 4], 14));
  if (p.arms === 1) t = t.concat(ELL(0, 0, p.hs + 10, 22, 14, 14, 18, 10), TUBE([[0, 0, p.hs], [0, 0, p.hs + 6]], [5.5, 5.5], 12));
  else t = t.concat(TUBE([[-54, 0, p.hs], [54, 0, p.hs]], [3.4, 3.4], 12), ELL(-54, 0, p.hs + 11, 20, 13, 13, 16, 10), ELL(54, 0, p.hs + 11, 20, 13, 13, 16, 10), ELL(0, 0, p.hs, 6, 6, 6, 8, 6), TUBE([[-54, 0, p.hs], [-54, 0, p.hs + 4]], [5, 5], 10), TUBE([[54, 0, p.hs], [54, 0, p.hs + 4]], [5, 5], 10));
  return t;
}
const watchStandRows = rowsOf(watchStandG, [['single pillow, low, 2.8 in', { arms: 1, hs: 40 }], ['single pillow, tall, 5.5 in', { arms: 1, hs: 112 }], ['two pillows on a cross arm, 5.9 in', { arms: 2, hs: 124 }]]);

function necklaceTreeG(p) {
  const H = p.H, n = p.n; let t = TUBE([[0, 0, 0], [0, 0, 5]], [55, 55], 36).concat(TUBE([[0, 0, 5], [0, 0, H]], [4.5, 4.5], 14), ELL(0, 0, H + 2, 6, 6, 6, 10, 6));
  for (let k = 0; k < n; k++) {
    const z = 30 + (k * (H - 50)) / (n - 1), g = (k * TAU * 0.382) + 0.4, L = p.arm, ex = L * m.cos(g), ey = L * m.sin(g);
    t = t.concat(TUBE([[0, 0, z], [ex, ey, z + 10]], [2.2, 2.2], 8), ELL(ex, ey, z + 10, 3.4, 3.4, 3.4, 8, 5), TUBE([[ex, ey, z + 10], [ex, ey, z + 19]], [1.6, 2.4], 8));
  }
  return t;
}
const treeRows = rowsOf(necklaceTreeG, [['four hooks, 7 in', { n: 4, H: 178, arm: 50 }], ['six hooks, 10 in', { n: 6, H: 254, arm: 55 }], ['eight hooks, 13 in', { n: 8, H: 330, arm: 62 }]]);

function ringTowerG(p) {
  const n = p.n, top = 34 + (n - 1) * 30 + 12; let t = TUBE([[0, 0, 0], [0, 0, 4]], [38, 38], 32).concat(TUBE([[0, 0, 4], [0, 0, top]], [4, 4], 14), ELL(0, 0, top + 2, 5.5, 5.5, 5.5, 10, 6));
  const ring = rotZ(sweepY([[-1.25, 8.8], [1.25, 8.8], [1.25, 10.3], [-1.25, 10.3]], 0, 0, 0, 24), m.PI / 2);
  for (let k = 0; k < n; k++) {
    const z = 34 + k * 30, s = k % 2 ? -1 : 1;
    t = t.concat(TUBE([[0, 0, z], [s * 30, 0, z]], [1.7, 1.7], 8), ELL(s * 30, 0, z, 2.6, 2.6, 2.6, 8, 5), mv(ring, s * 18, 0, z - 7.6));
  }
  return t;
}
const towerRows = rowsOf(ringTowerG, [['three pegs with rings, 6 in', { n: 3 }], ['four pegs with rings, 7.5 in', { n: 4 }], ['six pegs with rings, 10.5 in', { n: 6 }]]);

function trayG(p) {
  const W = p.W, D = p.D, H = 28, wl = 4; let t = BOX(-W / 2, -D / 2, 0, W / 2, D / 2, 5).concat(BOX(-W / 2, -D / 2, 5, -W / 2 + wl, D / 2, H), BOX(W / 2 - wl, -D / 2, 5, W / 2, D / 2, H), BOX(-W / 2 + wl, -D / 2, 5, W / 2 - wl, -D / 2 + wl, H), BOX(-W / 2 + wl, D / 2 - wl, 5, W / 2 - wl, D / 2, H));
  const iw = W - 2 * wl, id = D - 2 * wl;
  if (p.tier) t = t.concat(BOX(-iw / 2, 0, 5, iw / 2, id / 2, 5 + 16), BOX(-W / 2, D / 2 - wl, H, W / 2, D / 2, H + 14));
  if (p.rolls) {
    for (let k = 0; k < p.rolls; k++) { const y = -id / 2 + ((k + 0.5) * id) / p.rolls; t = t.concat(TUBE([[-iw / 2, y, 5 + 7], [iw / 2, y, 5 + 7]], [7, 7], 14)); for (let j = 0; j < 3; j++) t = t.concat(mv(sweepY([[-1.1, 8.8], [1.1, 8.8], [1.1, 10.2], [-1.1, 10.2]], 0, 0, 0, 24), -iw / 2 + (iw * (j + 0.5)) / 3, y, 5 + 7 + 7 + 6)); }
  } else {
    for (let i = 1; i < p.cols; i++) t = t.concat(BOX(-iw / 2 + (i * iw) / p.cols - 1.2, -id / 2, 5, -iw / 2 + (i * iw) / p.cols + 1.2, id / 2, H - 4));
    for (let j = 1; j < p.rows; j++) t = t.concat(BOX(-iw / 2, -id / 2 + (j * id) / p.rows - 1.2, 5, iw / 2, -id / 2 + (j * id) / p.rows + 1.2, H - 4));
    for (let i = 0; i < p.cols; i++) for (let j = 0; j < p.rows; j++) if ((i + j) % 3 === 0) t = t.concat(ELL(-iw / 2 + ((i + 0.5) * iw) / p.cols, -id / 2 + ((j + 0.5) * id) / p.rows, 5 + 3, 8, 8, 3, 10, 5));
  }
  return t;
}
const trayRows = rowsOf(trayG, [['eight compartments, 11 x 7 in', { W: 280, D: 178, cols: 4, rows: 2, tier: true }], ['twelve compartments, 14 x 9 in', { W: 356, D: 229, cols: 4, rows: 3, tier: true }], ['three ring rolls with rings, 9 x 7 in', { W: 229, D: 178, rolls: 3 }]]);

function chestG(p) {
  const n = p.n, W = 200, D = 140, dh = 36, bh = n * (dh + 3) + 6, z0 = 10; let t = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) t = t.concat(TUBE([[sx * (W / 2 - 14), sy * (D / 2 - 14), 0], [sx * (W / 2 - 14), sy * (D / 2 - 14), z0 + 2]], [6, 8], 10));
  t = t.concat(BOX(-W / 2, -D / 2, z0, W / 2, D / 2, z0 + bh));
  for (let i = 0; i < n; i++) {
    const zb = z0 + 3 + i * (dh + 3), top = i === n - 1;
    if (top) {
      const out = 62, fy = -D / 2 - out;
      t = t.concat(BOX(-W / 2 + 4, fy - 1.5, zb, W / 2 - 4, fy + 1.5, zb + dh), BOX(-W / 2 + 6, fy + 1.5, zb, -W / 2 + 9, fy + out + 6, zb + dh - 4), BOX(W / 2 - 9, fy + 1.5, zb, W / 2 - 6, fy + out + 6, zb + dh - 4), BOX(-W / 2 + 9, fy + 1.5, zb, W / 2 - 9, fy + out + 6, zb + 3), BOX(-0.1 * W, fy + 1.5, zb + 3, -0.1 * W + 2, fy + out, zb + dh - 6), ELL(0, fy - 1.5, zb + dh / 2, 3.6, 3.6, 3.6, 10, 6), ELL(W * 0.22, fy + 22, zb + 8, 14, 14, 5, 12, 6));
    } else t = t.concat(BOX(-W / 2 + 4, -D / 2 - 1.5, zb, W / 2 - 4, -D / 2 + 1, zb + dh), ELL(0, -D / 2 - 1.5, zb + dh / 2, 3.6, 3.6, 3.6, 10, 6));
  }
  const lz = z0 + bh, poly = Array.from({ length: 17 }, (_, i) => { const g = (i / 16) * m.PI; return [(D / 2 + 3) * m.cos(g), 30 * m.sin(g)]; });
  t = t.concat(BOX(-W / 2 - 2, -D / 2 - 2, lz, W / 2 + 2, D / 2 + 2, lz + 4), prismX(poly.map(([y, z]) => [y, lz + 4 + z]), -W / 2 - 2, W / 2 + 2), BOX(-5, -D / 2 - 4, lz - 6, 5, -D / 2 - 1, lz + 5));
  return t;
}
const chestRows = rowsOf(chestG, [['one drawer, lid closed, drawer pulled out', { n: 1 }], ['two drawers, top one pulled out', { n: 2 }], ['three drawers, top one pulled out', { n: 3 }]]);

// ------------------------------------------------------------------------------------------ families
const N = (s) => () => s;
export default [
  // ---- rings (round 7: band-type rings lean back 30 degrees on their rim, face-type rings 55 degrees so the stone side reads from the front)
  fam({ cat: 'jewellery/rings', title: 'Generic cluster ring',
    desc: (v) => `Cluster ring leaning on its rim: a tapering band, a short stem and a round plate carrying one centre stone and ${v.np} surrounding faceted stones with a small bead between each pair.`,
    vs: clusterRows, build: gbuild(clusterG, N('Added the tapered band, stem, plate, centre stone, surrounding stones and beads (plan and 3D).'), ringPlan) }),
  fam({ cat: 'jewellery/rings', title: 'Generic cocktail dome ring',
    desc: (v) => `Cocktail ring leaning on its rim: a wide tapering band under a ${v.a === v.b ? 'round' : 'oval'} collar holding a smooth domed stone${v.beads ? ', with a ring of small beads round the rim' : ''}.`,
    vs: cocktailRows, build: gbuild(cocktailG, N('Added the wide band, the collar and the domed cabochon-style stone (plan and 3D).'), ringPlan) }),
  fam({ cat: 'jewellery/rings', title: 'Generic channel-set band ring',
    desc: (v) => `Band ring leaning on its rim with a groove between two raised rails, ${v.full ? 'filled all the way round' : 'filled round the upper half'} with square faceted stones.`,
    vs: channelRows, build: gbuild(channelG, N('Added the grooved band and the row of square stones set in the channel (plan and 3D).'), ringPlan) }),
  fam({ cat: 'jewellery/rings', title: 'Generic twisted wire ring',
    desc: (v) => `Ring leaning on its rim made of ${v.n} round wires twisted together round the finger circle (${v.tw} turns).`,
    vs: twistRows, build: gbuild(twistG, (v) => `Added ${v.n} wires wound as a helix round the ring (plan and 3D).`, ringPlan) }),
  fam({ cat: 'jewellery/rings', title: 'Generic bypass ring',
    desc: (v) => `Ring leaning on its rim: one round wire coiled a little more than once round so the two ends pass side by side, each ending in a ${v.term === 'stone' ? 'claw-set round stone' : 'ball'}.`,
    vs: bypassRows, build: gbuild(bypassG, N('Added the coiled wire with overlapping ends and the two terminals (plan and 3D).'), ringPlan) }),
  fam({ cat: 'jewellery/rings', title: 'Generic spinner ring',
    desc: (v) => `Two-part ring leaning on its rim: an inner band with a lip each side and a ${v.w} mm outer band carrying ${v.ng} groove${v.ng > 1 ? 's' : ''} that turns on it.`,
    vs: spinnerRows, build: gbuild(spinnerG, N('Added the flanged inner band and the grooved outer band (plan and 3D).'), ringPlan) }),
  fam({ cat: 'jewellery/rings', title: 'Generic tension-set ring',
    desc: (v) => `Ring leaning on its rim: an open band whose two ends rise to hold one ${v.rs * 2} mm round stone between them, with no claws.`,
    vs: tensionRows, build: gbuild(tensionG, N('Added the open band and the round stone held between its ends (plan and 3D).'), ringPlan) }),
  fam({ cat: 'jewellery/rings', title: 'Generic marquise solitaire ring',
    desc: (v) => `Solitaire ring leaning on its rim: a tapering band under a six-claw head holding a pointed-oval faceted stone, ${v.L} x ${v.W} mm.`,
    vs: marquiseRows, build: gbuild(marquiseG, N('Added the band, the six-claw head with gallery ring and the pointed-oval stone (plan and 3D).'), ringPlan) }),
  fam({ cat: 'jewellery/rings', title: 'Generic two-stone ring',
    desc: () => 'Two-stone ring leaning on its rim: a band carrying two claw-set faceted stones side by side along the finger, pear shapes pointing at each other.',
    vs: toiRows, build: gbuild(toiG, N('Added the band and two claw-set heads facing each other (plan and 3D).'), ringPlan) }),
  fam({ cat: 'jewellery/rings', title: 'Generic pearl ring',
    desc: (v) => `Pearl ring leaning on its rim: a tapering band, a cup and one ${v.r * 2} mm round pearl with two small stones on each shoulder.`,
    vs: pearlRingRows, build: gbuild(pearlRingG, N('Added the band, the cup, the pearl and the shoulder stones (plan and 3D).'), ringPlan) }),
  fam({ cat: 'jewellery/rings', title: 'Generic wide grooved band ring',
    desc: (v) => `Wide plain band ring leaning on its rim, ${v.w} mm across with ${v.ng} grooves cut across the outside and bevelled edges.`,
    vs: groovedRows, build: gbuild(groovedG, N('Added the wide band with its grooves (plan and 3D).'), ringPlan) }),
  fam({ cat: 'jewellery/rings', title: 'Generic split-shank solitaire ring',
    desc: (v) => `Solitaire ring leaning on its rim: a band that divides into two strands each side near the top, under a ${v.claws}-claw head with a ${v.rs * 2} mm round stone.`,
    vs: splitRows, build: gbuild(splitG, N('Added the band, the four split strands and the claw-set head (plan and 3D).'), ringPlan) }),
  fam({ cat: 'jewellery/rings', title: 'Generic flush-set plate ring',
    desc: (v) => `Ring leaning on its rim: a band widening into a ${v.n === 6 ? 'hexagonal' : v.n === 8 ? 'octagonal' : 'round'} flat plate with one round stone set into it and a rim round the stone.`,
    vs: gypsyRows, build: gbuild(gypsyG, N('Added the band, the flat plate and the flush-set round stone with its collar (plan and 3D).'), ringPlan) }),

  // ---- pendants and chains (hung from the clasp, as worn)
  fam({ cat: 'jewellery/necklaces', title: 'Generic puffed heart pendant necklace',
    desc: (v) => `Necklace of ${m.round(v.L / IN)} in alternating chain links with a lobster clasp, a bail ring and a puffed heart pendant${v.stone ? ' with a round stone on the front' : ''}.`,
    vs: heartRows, build: gbuild(neckG, N('Added the chain links, clasp, bail and puffed heart pendant (plan and 3D).')) }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic key pendant necklace',
    desc: (v) => `Necklace of ${m.round(v.L / IN)} in chain links with a lobster clasp and a key pendant: a ring bow, a shaft with a collar and a notched bit.`,
    vs: keyRows, build: gbuild(neckG, N('Added the chain, clasp, bail and key pendant (plan and 3D).')) }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic star pendant necklace',
    desc: (v) => `Necklace of ${m.round(v.L / IN)} in chain links with a lobster clasp and a five-point star pendant with ${v.stone ? 'a centre stone' : 'a domed centre'}.`,
    vs: starRows, build: gbuild(neckG, N('Added the chain, clasp, bail and five-point star (plan and 3D).')) }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic crescent pendant necklace',
    desc: (v) => `Necklace of ${m.round(v.L / IN)} in chain links with a lobster clasp and a crescent pendant hanging by its thick centre with the points down.`,
    vs: moonRows, build: gbuild(neckG, N('Added the chain, clasp, bail and tapered crescent (plan and 3D).')) }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic infinity loop pendant necklace',
    desc: (v) => `Necklace of ${m.round(v.L / IN)} in chain links with a lobster clasp and a figure-eight wire pendant ${v.w} mm wide.`,
    vs: infRows, build: gbuild(neckG, N('Added the chain, clasp, bail and figure-eight loop (plan and 3D).')) }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic cabochon pendant necklace',
    desc: (v) => `Necklace of ${m.round(v.L / IN)} in chain links with a lobster clasp and a pendant of one smooth domed stone in a plain collar${v.w === v.h ? '' : ' (oval)'}.`,
    vs: cabRows, build: gbuild(neckG, N('Added the chain, clasp, bail and the collared dome stone (plan and 3D).')) }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic tag pendant ball chain necklace',
    desc: (v) => `Necklace of a ${m.round(v.L / IN)} in ball chain with a clasp and a flat ${v.round ? 'round' : 'rectangular'} tag with a raised border.`,
    vs: tagRows, build: gbuild(neckG, N('Added the ball chain, clasp, bail and the bordered tag (plan and 3D).')) }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic cord necklace with stone or bar pendant',
    desc: (v) => `Round cord necklace, ${m.round(v.L / IN)} in, with a metal slide at the top and ${v.kind === 'bead' ? 'a round bead with metal caps' : v.kind === 'crystal' ? 'a point-down crystal in a wire ring' : 'a horizontal toggle bar'} hanging from a bail ring.`,
    vs: cordRows, build: gbuild(neckG, N('Added the cord loop, slide, bail and the pendant (plan and 3D).')) }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic lariat chain necklace',
    desc: (v) => `Lariat: a ${m.round(v.L / IN)} in chain loop closed through a ring, with a ${m.round(v.tail / IN * 10) / 10} in tail of chain ending in a drop.`,
    vs: lariatRows, build: gbuild(lariatG, N('Added the chain loop, ring, hanging tail and end drop (plan and 3D).')) }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic ribbon choker necklace',
    desc: (v) => `Flat ribbon choker, ${m.round(v.L / IN)} in, ${v.w} mm wide, with a clasp ring and bar and ${v.center === 'ring' ? 'a ring' : v.center === 'bar' ? 'a bar' : 'a round collet stone'} at the front, leaning back.`,
    vs: chokerRows, build: gbuild(chokerG, N('Added the ribbon band, clasp ring and bar and the front piece (plan and 3D).')) }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic fringe drop necklace',
    desc: (v) => `Necklace of ${m.round(v.L / IN)} in chain links with a lobster clasp and ${v.n} drop beads, each on its own ring, longest at the centre.`,
    vs: fringeRows, build: gbuild(fringeG, N('Added the chain, clasp and the row of drops (plan and 3D).')) }),

  // ---- earrings (pairs on a standing display card) and bracelets
  fam({ cat: 'jewellery/earrings', title: 'Generic chandelier earrings on a display card',
    desc: (v) => `Pair of chandelier earrings with ${v.lens.length} drops each, hung from a trapezoid bar studded with small stones, with posts and butterfly backs, on a standing card with a prop leg.`,
    vs: chandRows, build: gbuild(earCardG, N('Added the pair, their posts and backs and the display card with prop leg (plan and 3D).')) }),
  fam({ cat: 'jewellery/earrings', title: 'Generic bar drop earrings on a display card',
    desc: (v) => `Pair of earrings, each a ball stud, a short chain and a vertical bar ${v.len} mm long with a ball at each end, on a standing card with a prop leg.`,
    vs: barERows, build: gbuild(earCardG, N('Added the pair on the display card (plan and 3D).')) }),
  fam({ cat: 'jewellery/earrings', title: 'Generic pearl stud earrings on a display card',
    desc: (v) => `Pair of ${v.r * 2} mm round pearl studs in cups with posts and butterfly backs, on a standing card with a prop leg.`,
    vs: pearlERows, build: gbuild(earCardG, N('Added the pearls, posts, backs and the card (plan and 3D).')) }),
  fam({ cat: 'jewellery/earrings', title: 'Generic flower cluster earrings on a display card',
    desc: (v) => `Pair of flower cluster studs, each a back plate with one centre stone and ${v.np} petal stones, on a standing card with a prop leg.`,
    vs: flowERows, build: gbuild(earCardG, N('Added the two cluster studs and the card (plan and 3D).')) }),
  fam({ cat: 'jewellery/earrings', title: 'Generic threader earrings on a display card',
    desc: (v) => `Pair of threader earrings: a fine chain ${v.len} mm long with a ball at the top and a weighted end, hooked over the top of a standing card.`,
    vs: thrERows, build: gbuild(earCardG, N('Added the two threaders and the card (plan and 3D).')) }),
  fam({ cat: 'jewellery/earrings', title: 'Generic geometric plate earrings on a display card',
    desc: (v) => `Pair of earrings, each a ball stud above a flat ${v.shape === 'tri' ? 'triangular' : v.shape === 'dia' ? 'diamond-shaped' : 'tall hexagonal'} plate with a raised inner panel, on a standing card.`,
    vs: geoERows, build: gbuild(earCardG, N('Added the two plates and the card (plan and 3D).')) }),
  fam({ cat: 'jewellery/earrings', title: 'Generic tassel earrings on a display card',
    desc: (v) => `Pair of earrings, each a ball stud, a cone cap and nine hanging strands about ${v.len} mm long that fan out, on a standing card.`,
    vs: tasERows, build: gbuild(earCardG, N('Added the two tassels and the card (plan and 3D).')) }),
  fam({ cat: 'jewellery/earrings', title: 'Generic beaded stretch bracelet',
    desc: (v) => `Bracelet of ${v.r * 2} mm round beads${v.sp ? ' alternating with small metal balls' : ''} on a thin elastic loop, leaning on its edge.`,
    vs: beadedRows, build: gbuild(beadedG, N('Added the elastic loop and the beads (plan and 3D).')) }),
  fam({ cat: 'jewellery/earrings', title: 'Generic bar link bracelet',
    desc: (v) => `Bracelet of flat rectangular links ${v.len} mm long joined by pins, closed with a ring and a toggle bar, leaning on its edge.`,
    vs: barLinkRows, build: gbuild(barLinkG, N('Added the links with their pins and the toggle clasp (plan and 3D).')) }),
  fam({ cat: 'jewellery/earrings', title: 'Generic twisted wire bangle',
    desc: (v) => `Bangle of ${v.n} round wires twisted round the wrist circle, leaning on its edge.`,
    vs: twBangleRows, build: gbuild(twistG, (v) => `Added ${v.n} wires wound as a helix round the bangle (plan and 3D).`) }),
  fam({ cat: 'jewellery/earrings', title: 'Generic ID plate bracelet',
    desc: (v) => `Curb-link bracelet with a flat ${v.lp} x ${v.wp} mm plate with a raised border, joined by a ring at each end, leaning on its edge.`,
    vs: idRows, build: gbuild(idBraceletG, N('Added the curb links, plate, border and end rings (plan and 3D).')) }),
  fam({ cat: 'jewellery/earrings', title: 'Generic stacked bangle set',
    desc: (v) => `Set of ${v.set.length} thin bangles side by side on the wrist circle: ${v.set.map((k) => ({ p: 'plain', b: 'beaded', s: 'stone-row', f: 'wide flat' }[k])).join(', ')}, leaning on their edge.`,
    vs: stackRows, build: gbuild(stackSetG, (v) => `Added ${v.set.length} bangles with their beads and stones (plan and 3D).`) }),

  // ---- settings, stones and cases
  fam({ cat: 'jewellery/settings', title: 'Generic oval cabochon stone',
    desc: (v) => `Loose smooth domed oval stone, ${v.L} x ${v.W} mm, with a short straight girdle, on a thin pad.`,
    vs: cabRowsS, build: gbuild(stoneOnPad, N('Added the pad, girdle and domed top (plan and 3D).')) }),
  fam({ cat: 'jewellery/settings', title: 'Generic baguette stone',
    desc: (v) => `Loose long rectangular step-cut stone, ${v.L} x ${v.W} mm, with three crown steps, on a thin pad.`,
    vs: bagRows, build: gbuild(stoneOnPad, N('Added the stepped crown, girdle and pavilion on a pad (plan and 3D).')) }),
  fam({ cat: 'jewellery/settings', title: 'Generic marquise stone',
    desc: (v) => `Loose pointed-oval stone, ${v.L} x ${v.W} mm, with stepped crown and pavilion, on a thin pad.`,
    vs: marqRows, build: gbuild(stoneOnPad, N('Added the pointed-oval crown, girdle and pavilion on a pad (plan and 3D).')) }),
  fam({ cat: 'jewellery/settings', title: 'Generic heart-shaped stone',
    desc: (v) => `Loose heart-shaped stone, ${v.L} mm across, with stepped crown and pavilion, on a thin pad.`,
    vs: heartRowsS, build: gbuild(stoneOnPad, N('Added the heart crown, girdle and pavilion on a pad (plan and 3D).')) }),
  fam({ cat: 'jewellery/settings', title: 'Generic cushion-shaped stone',
    desc: (v) => `Loose rounded-square stone, ${v.L} x ${v.W} mm, with stepped crown and pavilion, on a thin pad.`,
    vs: cushRows, build: gbuild(stoneOnPad, N('Added the cushion crown, girdle and pavilion on a pad (plan and 3D).')) }),
  fam({ cat: 'jewellery/settings', title: 'Generic triangular stone',
    desc: (v) => `Loose triangular stone with curved sides, ${v.L} mm across, with stepped crown and pavilion, on a thin pad.`,
    vs: triRowsS, build: gbuild(stoneOnPad, N('Added the triangular crown, girdle and pavilion on a pad (plan and 3D).')) }),
  fam({ cat: 'jewellery/settings', title: 'Generic crystal point',
    desc: (v) => `Natural-style six-sided crystal ${v.parts.length === 1 ? 'standing on a pad with a pointed termination' : 'cluster of three points of different heights and tilts on one pad'}.`,
    vs: crystalRows, build: gbuild(crystalG, N('Added the pad and the hexagonal crystal bodies with pointed tops (plan and 3D).')) }),
  fam({ cat: 'jewellery/settings', title: 'Generic hinged watch box',
    desc: (v) => `Watch box with the lid hinged open behind: four walls and a floor, ${v.n} oval watch pillow${v.n > 1 ? 's' : ''} with a strap bar, a lined lid, a hinge barrel and a front catch.`,
    vs: watchBoxRows, build: gbuild(watchBoxG, N('Added the box, pillows, hinged lid, hinge and catch (plan and 3D).')) }),
  fam({ cat: 'jewellery/settings', title: 'Generic watch display stand',
    desc: (v) => `Watch stand: a round base with a step, a stem and ${v.arms === 1 ? 'one' : 'two'} rounded watch pillow${v.arms === 1 ? '' : 's on a cross arm'}.`,
    vs: watchStandRows, build: gbuild(watchStandG, N('Added the base, stem and watch pillows (plan and 3D).')) }),
  fam({ cat: 'jewellery/settings', title: 'Generic necklace display tree',
    desc: (v) => `Necklace tree: a round base, a stem with a finial and ${v.n} angled arms at different heights, each with a ball and an upturned hook end.`,
    vs: treeRows, build: gbuild(necklaceTreeG, N('Added the base, stem and hooked arms (plan and 3D).')) }),
  fam({ cat: 'jewellery/settings', title: 'Generic ring display tower',
    desc: (v) => `Ring tower: a round base, a stem and ${v.n} horizontal pegs on alternate sides, each hung with a ring.`,
    vs: towerRows, build: gbuild(ringTowerG, N('Added the base, stem, pegs and hung rings (plan and 3D).')) }),
  fam({ cat: 'jewellery/settings', title: 'Generic jewellery display tray',
    desc: (v) => v.rolls ? `Shallow tray with four walls and ${v.rolls} padded rolls, three rings standing on each.` : `Tray with four walls, a raised rear half under a taller back wall and dividers making ${v.cols * v.rows} compartments, some holding a round pad.`,
    vs: trayRows, build: gbuild(trayG, N('Added the tray walls and the dividers or rolls (plan and 3D).')) }),
  fam({ cat: 'jewellery/settings', title: 'Generic jewellery chest of drawers',
    desc: (v) => `Jewellery chest on four feet with ${v.n} drawer front${v.n > 1 ? 's' : ''} with ball knobs, a domed lid and a catch; the top drawer is pulled out with dividers and a pad.`,
    vs: chestRows, build: gbuild(chestG, N('Added the feet, body, drawers, domed lid and the open drawer (plan and 3D).')) }),
];

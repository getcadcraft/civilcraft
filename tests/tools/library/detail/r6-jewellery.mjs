/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, jewellery: rings, pendants and chains, earrings and bracelets, stones, settings, watch cases, ring boxes and display busts.
 *  Original geometry; real sizes (a ring is about 0.8 in across). Units inside build(): millimetres, z up, plan front at -Y. */
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

// ------------------------------------------------------------------------------------------ plan helper for small things
function planRing(a, ri, ro, stones = []) {
  a.outline(); a.line(a.cx - ri, a.YF, a.cx - ri, a.YB, 'EQUIP-HIDDEN'); a.line(a.cx + ri, a.YF, a.cx + ri, a.YB, 'EQUIP-HIDDEN');
  for (const [x, y, r] of stones) a.circ(x, y, r, 'EQUIP-DETAIL');
}

// ------------------------------------------------------------------------------------------ ring builders
const bandProf = (ri, ro, h, kind) => kind === 'court'
  ? [[-h, ri], [h, ri], [h, ro - 0.4], [h * 0.5, ro - 0.08], [0, ro], [-h * 0.5, ro - 0.08], [-h, ro - 0.4]]
  : [[-h, ri], [h, ri], [h, ro - 0.3], [h - 0.3, ro], [-h + 0.3, ro], [-h, ro - 0.3]];

function ringBand(a, v) {
  const ro = v.ri + v.t, zc = a.Z0 + ro;
  a.add(sweepY(bandProf(v.ri, ro, v.bw / 2, v.prof), a.cx, a.cy, zc, 48));
  planRing(a, v.ri, ro);
  a.line(a.cx - ro, a.cy, a.cx + ro, a.cy, 'EQUIP-DETAIL');
  a.log('Added the band swept round with its profile (chamfered or domed outside, flat inside) and the plan outline with the bore lines (plan and 3D).');
}
const bandRows = [['slim 2 mm band', 8.5, 2, 1.3, 'flat'], ['court 4 mm band', 8.9, 4, 1.6, 'court'], ['court 6 mm band', 9.3, 6, 1.9, 'court'], ['flat 8 mm wide band', 9.7, 8, 2.2, 'flat']]
  .map(([l, ri, bw, t, prof]) => V(l, 2 * (ri + t) + 0.2, bw + 0.2, 2 * (ri + t) + 0.2, { ri, bw, t, prof }));

function solitaire(a, v) {
  const ro = v.ri + 1.6, zc = a.Z0 + ro, rs = v.rs, bh = rs * 0.95;
  a.add(sweepY([[-1.1, v.ri], [1.1, v.ri], [1.1, ro - 0.2], [0.7, ro], [-0.7, ro], [-1.1, ro - 0.2]], a.cx, a.cy, zc, 44));
  const top = zc + ro;
  for (const s of [-1, 1]) {                                   // cathedral shoulders rise from the band to the basket
    const g = m.PI / 2 + s * 0.62, p0 = [a.cx + (ro - 0.3) * m.cos(g), a.cy, zc + (ro - 0.3) * m.sin(g)];
    a.tube([p0, [a.cx + s * rs * 0.45, a.cy, top + bh * 0.25], [a.cx + s * rs * 0.5, a.cy, top + bh * 0.7]], [1.0, 0.85, 0.55], 6);
  }
  a.add(mv(head(gemRound(rs, 16), roundClaws(rs, v.claws), bh, m.max(0.38, rs * 0.11), rs, rs * 0.22), a.cx, a.cy, top + bh));
  planRing(a, v.ri, ro, [[a.cx, a.cy, rs], [a.cx, a.cy, rs * 0.55]]);
  a.log(`Added the band with cathedral shoulders, a ${v.claws}-claw basket with gallery ring and a round faceted stone (plan and 3D).`);
}
const solRows = [['four claw, 5 mm round stone', 8.6, 2.5, 4], ['four claw, 6.5 mm round stone', 8.8, 3.25, 4], ['six claw, 6.5 mm round stone', 8.8, 3.3, 6], ['six claw, 8 mm round stone', 9.2, 4.0, 6]]
  .map(([l, ri, rs, claws]) => V(l, 2 * (ri + 1.6) + 0.2, m.max(2.4, 2 * rs + 1.6), 2 * (ri + 1.6) + rs * 0.95 + rs * 0.5 + 0.8, { ri, rs, claws }));

function signet(a, v) {
  const ri = v.ri, rb = ri + 1.5, zc = a.Z0 + rb, S = (g) => m.max(0, m.sin(g));
  a.add(sweepY((g) => { const s = S(g), t = 1.5 + 1.9 * s * s, w = 1.6 + (v.fh * 0.36 - 1.6) * s * s * s; return [[-w, ri], [w, ri], [w, ri + t], [-w, ri + t]]; }, a.cx, a.cy, zc, 48));
  const zt = zc + ri + 3.4 - 0.3;
  const base = v.face === 'oval' ? ellPoly(v.fw / 2, v.fh / 2, 24) : v.face === 'round' ? ellPoly(v.fw / 2, v.fh / 2, 24) : octa(v.fw, v.fh, v.face === 'square' ? 2.2 : 1.4);
  a.add(frustum(base.map(([x, y]) => [a.cx + x, a.cy + y]), zt, base.map(([x, y]) => [a.cx + x * 0.96, a.cy + y * 0.96]), zt + 0.9));
  a.add(frustum(base.map(([x, y]) => [a.cx + x * 0.86, a.cy + y * 0.86]), zt + 0.9, base.map(([x, y]) => [a.cx + x * 0.8, a.cy + y * 0.8]), zt + 1.2));
  planRing(a, ri, rb, []);
  a.poly(base.map(([x, y]) => [a.cx + x, a.cy + y]), 'EQUIP-DETAIL'); a.poly(base.map(([x, y]) => [a.cx + x * 0.8, a.cy + y * 0.8]), 'EQUIP-DETAIL');
  a.log('Added the tapering band that widens into the shoulders, the flat face plate with a bevelled edge and a raised inner panel (plan and 3D).');
}
const sigRows = [['oval face 10 x 12 mm', 'oval', 10, 12, 8.8], ['round face 12 mm', 'round', 12, 12, 8.8], ['cushion face 11 mm square', 'square', 11, 11, 9.0], ['rectangular face 9 x 14 mm', 'rect', 9, 14, 8.8]]
  .map(([l, face, fw, fh, ri]) => V(l, 2 * (ri + 1.5) + 0.4, m.max(fh, 5) + 0.4, ri * 2 + 1.5 + ri + 3.4 + 1.6, { face, fw, fh, ri }));

function eternity(a, v) {
  const ro = v.ri + 1.6, zc = a.Z0 + ro, rs = v.rs, hw = rs + 0.6;
  a.add(sweepY([[-hw, v.ri], [hw, v.ri], [hw, ro], [-hw, ro]], a.cx, a.cy, zc, 48));
  const arcSpan = v.half ? m.PI : TAU, a0 = v.half ? 0 : 0, n = v.half ? m.round(m.PI * ro / (2 * rs + 0.05)) : m.round(TAU * ro / (2 * rs + 0.05)), g = gemRound(rs, 8);
  const stones = [];
  for (let i = 0; i < n; i++) {
    const th = v.half ? (i + 0.5) * (m.PI / n) : (i / n) * TAU, al = m.PI / 2 - th;
    a.add(put(g, 0, al, a.cx + ro * m.cos(th), a.cy, zc + ro * m.sin(th)));
    if (th < m.PI) stones.push([a.cx + ro * m.cos(th), a.cy, rs]);
  }
  planRing(a, v.ri, ro, [[a.cx, a.cy, rs]]);
  a.log(`Added the band and ${n} small round stones set around ${v.half ? 'the upper half' : 'the full circle'} (plan and 3D).`);
}
const etRows = [['full, 2 mm stones', 8.7, 1.0, false], ['full, 3 mm stones', 8.9, 1.5, false], ['half, 3.5 mm stones', 8.9, 1.75, true]]
  .map(([l, ri, rs, half]) => V(l, 2 * (ri + 1.6 + rs * 0.4) + 0.4, 2 * rs + 1.5, 2 * (ri + 1.6 + rs * 0.4) + 0.4, { ri, rs, half }));

function stacking(a, v) {
  const ri = v.ri, specs = { p: { w: 2, t: 1.4 }, g: { w: 2.2, t: 1.4, rs: 0.9 }, b: { w: 2, t: 1.2, rb: 1.0 }, w: { w: 3.6, t: 1.8 } };
  const ro0 = ri + 1.8, zc = a.Z0 + ro0;
  let y = a.YF + 0.2; const segs = [];
  for (const k of v.set) {
    const s = specs[k], yc = y + s.w / 2, ro = ri + s.t; segs.push([yc, s.w]);
    a.add(sweepY(k === 'w' ? bandProf(ri, ro, s.w / 2, 'court') : [[-s.w / 2, ri], [s.w / 2, ri], [s.w / 2, ro], [-s.w / 2, ro]], a.cx, yc, zc, 40));
    if (k === 'g') { const g = gemRound(s.rs, 8), n = 22; for (let i = 0; i < n; i++) { const th = (i / n) * TAU; a.add(put(g, 0, m.PI / 2 - th, a.cx + ro * m.cos(th), yc, zc + ro * m.sin(th))); } }
    if (k === 'b') { const n = 20; for (let i = 0; i < n; i++) { const th = (i / n) * TAU; a.add(ELL(a.cx + (ro + 0.3) * m.cos(th), yc, zc + (ro + 0.3) * m.sin(th), s.rb, s.rb, s.rb, 6, 4)); } }
    y += s.w + 0.2;
  }
  a.outline(); for (const [yc, w] of segs) a.line(a.cx - ri - 1.5, yc + w / 2, a.cx + ri + 1.5, yc + w / 2, 'EQUIP-DETAIL');
  a.log(`Added ${v.set.length} thin bands side by side (plain, stone-set, beaded or wide) with their joints shown in plan and 3D.`);
}
const stRows = [['two bands, plain and stone row', ['p', 'g']], ['three bands, plain, beaded, plain', ['p', 'b', 'p']], ['four bands, plain, stone row, beaded, wide', ['p', 'g', 'b', 'w']]]
  .map(([l, set]) => { const sp = { p: 2, g: 2.2, b: 2, w: 3.6 }; const d = set.reduce((s, k) => s + sp[k] + 0.2, 0.4); return V(l, 2 * (8.6 + 2.2) + 0.8, d, 2 * (8.6 + 2.2) + 0.8, { ri: 8.6, set }); });

function threeStone(a, v) {
  const ro = v.ri + 1.7, zc = a.Z0 + ro;
  a.add(sweepY([[-1.4, v.ri], [1.4, v.ri], [1.4, ro - 0.2], [0.9, ro], [-0.9, ro], [-1.4, ro - 0.2]], a.cx, a.cy, zc, 44));
  const heads = [[0, v.rc, v.cut], [-1, v.rs, 'round'], [1, v.rs, 'round']];
  const Rc = ro + 0.9 + v.rc * 0.8;
  for (const [s, r, cut] of heads) {
    const dl = s === 0 ? 0 : (v.rc + r + 0.5) / Rc, th = m.PI / 2 - s * dl, bh = r * 0.8 + 0.4;
    let gem, claws;
    if (cut === 'emerald') { const L = r * 2.8, W = r * 2.0; gem = gemPoly(octa(L, W, W * 0.2), W * 0.6, [[0.82, 0.12 * W], [0.6, 0.12 * W]], [0.9, 0.05]); claws = octa(L, W, W * 0.2).filter((_, i) => i % 2 === 0).map(([x, y]) => [x * 0.9, y * 0.9]); }
    else { gem = gemRound(r, 12); claws = roundClaws(r, 4); }
    const Rg = ro + bh;
    a.add(put(head(gem, claws, bh, 0.35, r, r * 0.2), 0, m.PI / 2 - th, a.cx + Rg * m.cos(th), a.cy, zc + Rg * m.sin(th)));
  }
  planRing(a, v.ri, ro, [[a.cx, a.cy, v.rc]]);
  a.log(`Added the band and three claw-set stones in a row (${v.cut === 'emerald' ? 'step-cut centre' : 'round centre'}, a smaller round stone each side) (plan and 3D).`);
}
const triRows = [['three round stones, 4.4 mm centre', 8.8, 2.2, 1.6, 'round'], ['three round stones, 5.5 mm centre', 9.0, 2.75, 1.9, 'round'], ['step-cut centre with two round stones', 9.0, 2.5, 1.7, 'emerald']]
  .map(([l, ri, rc, rs, cut]) => V(l, 2 * (ri + 1.7) + 0.4, m.max(3, rc * 2.2) + 1.4, ri + 1.7 + ri + 1.7 + 0.9 + rc * 0.8 + rc * 0.9 + 1.5, { ri, rc, rs, cut }));

function halo(a, v) {
  const ro = v.ri + 1.7, zc = a.Z0 + ro, top = zc + ro, rc = v.rc, rh = v.rh, R = rc + rh + 0.2, n = m.round((TAU * R) / (2 * rh + 0.05));
  a.add(sweepY([[-1.2, v.ri], [1.2, v.ri], [1.2, ro - 0.2], [0.8, ro], [-0.8, ro], [-1.2, ro - 0.2]], a.cx, a.cy, zc, 44));
  const bh = rc * 0.9;
  a.add(mv(head(gemRound(rc, 14), roundClaws(rc, 4), bh, 0.4, rc, rc * 0.2), a.cx, a.cy, top + bh));
  a.add(TUBE([[a.cx, a.cy, top + bh - 0.9], [a.cx, a.cy, top + bh - 0.1]], [R + rh + 0.5, R + rh + 0.5], 22));
  a.add(TUBE([[a.cx, a.cy, top], [a.cx, a.cy, top + bh - 0.9]], [rc * 0.5, R * 0.8], 12));
  const g = gemRound(rh, 7);
  for (let i = 0; i < n; i++) { const th = (i / n) * TAU; a.add(mv(g, a.cx + R * m.cos(th), a.cy + R * m.sin(th), top + bh)); }
  planRing(a, v.ri, ro, [[a.cx, a.cy, rc], [a.cx, a.cy, R + rh]]);
  for (let i = 0; i < n; i++) { const th = (i / n) * TAU; a.circ(a.cx + R * m.cos(th), a.cy + R * m.sin(th), rh, 'EQUIP-DETAIL'); }
  a.log(`Added the band, a claw-set centre stone and a ring of ${n} small stones on a shallow plate (plan and 3D).`);
}
const haloRows = [['round halo, 6 mm centre', 8.9, 3.0, 0.8], ['round halo, 8 mm centre', 9.3, 4.0, 1.0]]
  .map(([l, ri, rc, rh]) => V(l, 2 * (rc + 2 * rh + 0.4 + 0.5) + 2.5, 2 * (rc + 2 * rh + 0.4 + 0.5) + 0.4, 2 * (ri + 1.7) + rc * 0.9 + rc * 0.5 + 1.2, { ri, rc, rh }));

function bezel(a, v) {
  const ro = v.ri + 1.7, zc = a.Z0 + ro, top = zc + ro, bh = 2.4;
  a.add(sweepY([[-1.3, v.ri], [1.3, v.ri], [1.3, ro - 0.2], [0.8, ro], [-0.8, ro], [-1.3, ro - 0.2]], a.cx, a.cy, zc, 44));
  if (v.oval) {
    const g = gemPoly(ellPoly(v.rx, v.ry, 20), v.ry * 1.1, [[0.8, v.ry * 0.12], [0.6, v.ry * 0.14]], [0.1, 0.06]);
    a.add(mv(g, a.cx, a.cy, top + bh));
    const ring = ellPoly(v.rx + 0.7, v.ry + 0.7, 20);
    a.add(frustum(ring.map(([x, y]) => [a.cx + x, a.cy + y]), top, ring.map(([x, y]) => [a.cx + x, a.cy + y]), top + bh + 0.35));
    a.ellp(a.cx, a.cy, v.rx + 0.7, v.ry + 0.7); a.ellp(a.cx, a.cy, v.rx, v.ry, 'EQUIP-DETAIL');
  } else {
    a.add(mv(gemRound(v.rs, 16), a.cx, a.cy, top + bh));
    a.add(TUBE([[a.cx, a.cy, top - 0.4], [a.cx, a.cy, top + bh + 0.35]], [v.rs + 0.7, v.rs + 0.7], 20));
    a.add(mv(torus(v.rs + 0.4, 0.3, 20, 4), a.cx, a.cy, top + bh + 0.35));
    a.circ(a.cx, a.cy, v.rs + 0.7); a.circ(a.cx, a.cy, v.rs, 'EQUIP-DETAIL');
  }
  a.rect(a.cx - ro, a.YF, a.cx + ro, a.YB, 'EQUIP-HIDDEN');
  a.log('Added the band, a smooth metal collar with a rim and a faceted stone seated in it (plan and 3D).');
}
const bezRows = [V('round stone, 5 mm', 2 * (8.8 + 1.7) + 0.4, 5 + 3, 2 * (8.8 + 1.7) + 2.4 + 5 * 0.4 + 1.5, { ri: 8.8, rs: 2.5 }),
  V('oval stone, 8 x 6 mm', 2 * (8.8 + 1.7) + 0.4, 8 + 3, 2 * (8.8 + 1.7) + 2.4 + 3.2 + 1.5, { ri: 8.8, rx: 3, ry: 4, oval: true })];
// the oval collar's long side runs along the finger (y)

// ------------------------------------------------------------------------------------------ pendants (hang from the chain bottom)
/** each returns { w, d, h, draw(a, cx, cy, ztop) } with ztop the top of the pendant */
function pendant(kind, p) {
  if (kind === 'disc') return { w: p.dia, d: 2.8, h: p.dia, draw(a, cx, cy, zt) {
    const zc = zt - p.dia / 2, r = p.dia / 2;
    a.ycyl(cy - 1.0, cy + 1.0, cx, zc, r, 28);
    a.add(put(torus(r - 0.8, 0.7, 28, 5), m.PI / 2, 0, cx, cy - 1.1, zc));
    a.ycyl(cy - 1.5, cy - 1.0, cx, zc, r * 0.45, 20); a.add(put(torus(r * 0.45, 0.35, 20, 4), m.PI / 2, 0, cx, cy - 1.5, zc));
    a.circ(cx, cy, r, 'EQUIP-DETAIL');
  } };
  if (kind === 'tear') { const L = p.L, W = p.Wd, rr = W / 2;
    return { w: W + 1.4, d: W * 0.65 + 2, h: L + 2.4, draw(a, cx, cy, zt) {
      const poly = pearPoly(L, W), zc = zt - 1.2 - L / 2;
      const g = gemPoly(poly, W * 0.62, [[0.82, W * 0.1], [0.6, W * 0.12]], [0.05, 0.05]);
      const claws = [[0, L / 2 * 0.96], [-W * 0.42, -L * 0.3], [W * 0.42, -L * 0.3]];
      const hd = head(g, claws, 1.0, 0.45, W * 0.3, 0.3);
      a.add(put(hd, m.PI / 2, 0, cx, cy + 1.0 - 0.0, zc));
      a.circ(cx, cy, 0.3, 'EQUIP-DETAIL');
    } }; }
  if (kind === 'bar') { const len = p.len, flat = p.flat;
    return { w: len + 4, d: flat ? 3 : 4.2, h: flat ? 6.4 : 4.2, draw(a, cx, cy, zt) {
      const hh = flat ? 6.4 : 4.2, zc = zt - hh / 2;
      if (flat) { a.box(cx - len / 2, cy - 0.9, zc - 3.2 + 0.2, cx + len / 2, cy + 0.9, zc + 3.2 - 0.2); a.box(cx - len / 2 + 0.3, cy - 1.2, zc - 2.9, cx + len / 2 - 0.3, cy - 0.9, zc + 2.9);
        if (p.stones) { const g = rotX(gemRound(1.1, 8), m.PI / 2), n = m.floor((len - 6) / 3.0); for (let i = 0; i < n; i++) a.add(mv(g, cx - ((n - 1) * 3.0) / 2 + i * 3.0, cy - 1.2, zc)); } }
      else { a.xcyl(cx - len / 2 + 2, cx + len / 2 - 2, cy, zc, 2.1, 12); a.ell(cx - len / 2 + 2, cy, zc, 2.1, 2.1, 2.1, 10, 6); a.ell(cx + len / 2 - 2, cy, zc, 2.1, 2.1, 2.1, 10, 6); }
      a.line(cx - len / 2, cy, cx + len / 2, cy, 'EQUIP-DETAIL');
    } }; }
  if (kind === 'locket') { const w = p.w, h = p.h;
    return { w: w + 1, d: 7, h: h + 1, draw(a, cx, cy, zt) {
      const zc = zt - h / 2 - 0.5;
      if (p.shape === 'heart') {
        a.ell(cx - w * 0.25, cy, zc + h * 0.2, w * 0.27, 3.2, w * 0.27, 14, 8); a.ell(cx + w * 0.25, cy, zc + h * 0.2, w * 0.27, 3.2, w * 0.27, 14, 8);
        a.add(prismY([[-w * 0.5, zc + h * 0.18 - zc], [w * 0.5, zc + h * 0.18 - zc], [0, -h * 0.5]].map(([x, z]) => [cx + x, zc + z]), cy - 3.0, cy + 3.0));
        a.add(prismY([[-w * 0.5 + 1.2, h * 0.1], [w * 0.5 - 1.2, h * 0.1], [0, -h * 0.5 + 1.0]].map(([x, z]) => [cx + x, zc + z]), cy - 3.4, cy + 3.4));
      } else {
        a.ell(cx, cy, zc, w / 2, 3.4, h / 2, 24, 10);
        a.add(put(ellPoly(w / 2 - 1.2, h / 2 - 1.2, 24).length ? torus(1, 0.5, 4, 3) : [], 0, 0, 0, 0, 0));
        a.add(sweepY([[-0.6, 0], [0.6, 0], [0.6, 0.0], [-0.6, 0.0]], cx, cy, zc, 3));  // keeps the file free of empty adds
        a.add(mv(rotX(frustum(ellPoly(w / 2 - 0.9, h / 2 - 0.9, 28), 0, ellPoly(w / 2 - 1.5, h / 2 - 1.5, 28), 0.7), -m.PI / 2), cx, cy - 3.2, zc));
      }
      a.box(cx + w / 2 - 0.2, cy - 0.8, zc - 1.5, cx + w / 2 + 0.8, cy + 0.8, zc + 1.5);     // catch
      a.ycyl(cy - 1.2, cy + 1.2, cx - w / 2 + 0.2, zc, 0.8, 8);                                // hinge
      a.ell(cx, cy - 2.6, zc, w * 0.1, 0.8, w * 0.1, 8, 5);
      a.ellp(cx, cy, w / 2, 3.4, 'EQUIP-DETAIL');
    } }; }
  if (kind === 'cross') { const s = p.s, t = p.t;
    return { w: s * 0.64 + 1, d: 3.2, h: s + 1, draw(a, cx, cy, zt) {
      const top = zt - 0.5, bot = top - s, ay = top - s * 0.3, hw = s * 0.32;
      if (p.flare) {
        a.add(prismY([[-t / 2, bot], [t / 2, bot], [t * 0.9, ay], [t / 2, top], [-t / 2, top], [-t * 0.9, ay]].map(([x, z]) => [cx + x, z]), cy - 1.2, cy + 1.2));
        a.add(prismY([[-hw, ay - t * 0.9], [hw, ay - t * 0.9], [hw, ay + t * 0.9], [-hw, ay + t * 0.9]].map(([x, z]) => [cx + x, z]), cy - 1.2, cy + 1.2));
        a.add(prismY([[-hw, ay - t * 0.55], [-t * 0.5, ay - t * 0.5], [-t * 0.5, ay + t * 0.5], [-hw, ay + t * 0.55]].map(([x, z]) => [cx + x, z]), cy - 1.2, cy + 1.2));
      } else { a.box(cx - t / 2, cy - 1.2, bot, cx + t / 2, cy + 1.2, top); a.box(cx - hw, cy - 1.2, ay - t / 2, cx + hw, cy + 1.2, ay + t / 2); }
      if (p.gem) a.add(mv(rotX(gemRound(t * 0.55, 12), m.PI / 2), cx, cy - 1.2, ay));
      else a.box(cx - 0.2, cy - 1.4, bot + 1, cx + 0.2, cy - 1.2, top - 1);
      a.line(cx - hw, cy, cx + hw, cy, 'EQUIP-DETAIL');
    } }; }
}
function necklaceDims(L, pend) {
  const { W, H } = loopOf(L), pad = LK.b + LK.r + 1.5;
  return { w: W + 2 * pad + 2, d: m.max(2 * (LK.b + LK.r) + 0.6, pend ? pend.d + 0.6 : 0), h: H + 2 * pad + (pend ? 5.4 + pend.h : 0), pad, W, H };
}
function necklace(a, v) {
  const p = pendant(v.kind, v.pp), dm = necklaceDims(v.L, p), { W, H, path } = loopOf(v.L);
  const zA = a.Z1 - dm.pad, zc = zA - H / 2, zB = zA - H;
  a.add(chainAlong(path, a.cx, a.cy, zc, LK, 0));
  a.add(put(lobster(), 0, 0, a.cx, a.cy, zA + 0.5));
  a.add(put(torus(2.8, 0.7, 14, 4), m.PI / 2, m.PI / 2, a.cx, a.cy, zB - 0.5));              // bail ring around the bottom link
  p.draw(a, a.cx, a.cy, zB - 5.2);
  a.ellp(a.cx, a.cy, W / 2, 4.5); a.line(a.cx - W / 2, a.cy, a.cx + W / 2, a.cy, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
  a.log(`Added ${m.round(v.L / LK.pitch)} chain links alternating flat and edge-on, a lobster clasp, a bail ring and the ${v.what} (plan and 3D).`);
}
const inchRow = (label, inchesL, kind, pp, what) => { const L = inchesL * IN, p = pendant(kind, pp), d = necklaceDims(L, p); return V(label, d.w, d.d, d.h, { L, kind, pp, what }); };

// ------------------------------------------------------------------------------------------ beads and torques
function beads(a, v) {
  const L = v.L, rb = (i, n) => (v.grad ? v.r0 + (v.r1 - v.r0) * (1 - m.abs(i / n - 0.5) * 2) : v.r), rmax = v.grad ? v.r1 : v.r;
  const { W, H, path } = loopOf(L, 1.3), zA = a.Z1 - rmax - 1.2, zc = zA - H / 2, cum = arcs(path), tot = cum[cum.length - 1];
  const nb = v.grad ? v.n : m.round(tot / (2 * v.r));
  for (let i = 0; i < nb; i++) { const [x, z] = atLen(path, cum, ((i + 0.5) * tot) / nb), r = rb(i + 0.5, nb); a.ell(a.cx + x, a.cy, zc + z, r, r, r, 8, 5); }
  a.add(put(lobster(), 0, 0, a.cx, a.cy, zA + rmax + 0.2 - 0.0).map((q) => q));
  a.ellp(a.cx, a.cy, W / 2, rmax); a.outline('EQUIP-HIDDEN');
  a.log(`Added ${nb} ${v.grad ? 'graduated ' : ''}round beads strung on a ${m.round(L / IN)} in strand with a clasp at the top (plan and 3D).`);
}
const beadRow = (label, lin, r, grad = false, r0 = 0, r1 = 0, n = 0) => { const L = lin * IN, { W, H } = loopOf(L, 1.3), rm = grad ? r1 : r; return V(label, W + 2 * rm + 2, 2 * rm + 1.2, H + 2 * rm + 2 + 4, { L, r, grad, r0, r1, n }); };
const beadRows = [beadRow('6 mm beads, 16 in strand', 16, 3), beadRow('8 mm beads, 18 in strand', 18, 4), beadRow('graduated 4 to 9 mm beads, 18 in strand', 18, 0, true, 2.0, 4.5, 48)];

function torque(a, v) {
  const R = v.R, r = v.r, zc = a.Z0 + R + r + 0.2, gap = 0.34;
  if (v.flat) {
    a.add(sweepY([[-v.bw / 2, R - 0.9], [v.bw / 2, R - 0.9], [v.bw / 2, R + 0.9], [-v.bw / 2, R + 0.9]], a.cx, a.cy, zc, 52, m.PI / 2 + gap, m.PI / 2 + TAU - gap));
    a.add(mv(rotX(gemRound(v.bw * 0.38, 12), -m.PI / 2), a.cx, a.cy + 0.9 + 0.0, zc - R - 0.9 - 0.0).map((q) => q));
  } else {
    a.add(put(torus(R, r, 56, 8, m.PI / 2 + gap, m.PI / 2 + TAU - gap), m.PI / 2, 0, a.cx, a.cy, zc));
  }
  for (const s of [-1, 1]) { const g = m.PI / 2 + s * gap; a.ell(a.cx + R * m.cos(g), a.cy, zc + R * m.sin(g), v.ball, v.ball, v.ball, 10, 6); }
  a.rect(a.cx - R - r, a.YF, a.cx + R + r, a.YB, 'EQUIP'); a.line(a.cx - R, a.cy, a.cx + R, a.cy, 'EQUIP-DETAIL');
  a.log(`Added the rigid open collar ${v.flat ? 'as a flat band with a centre stone' : 'as a round tube'} with a ball at each end of the gap (plan and 3D).`);
}
const torRows = [V('plain round tube, 4.7 in', 2 * (59.7 + 2.6) + 2, 2 * 2.6 + 0.6, 2 * (59.7 + 2.6) + 2, { R: 59.7, r: 2.2, ball: 3.2 }),
  V('thick round tube with large end balls, 5.3 in', 2 * (67.3 + 3.8) + 2, 2 * 5 + 0.6, 2 * (67.3 + 3.8) + 2, { R: 67.3, r: 3.2, ball: 5 }),
  V('flat band with centre stone, 5 in', 2 * (63 + 1.4) + 2, 10, 2 * (63 + 1.4) + 6, { R: 63, r: 1, ball: 2.6, flat: true, bw: 8 })];
// the flat collar's centre stone sits at the lowest point of the circle, facing front

// ------------------------------------------------------------------------------------------ earrings
const pairX = (gapMm, wEach) => [-(gapMm / 2 + wEach / 2), gapMm / 2 + wEach / 2];
function stud(a, v) {
  const r = v.rs, bh = 1.0;
  for (const s of [-1, 1]) {
    const cx = a.cx + s * v.sp / 2, zc = a.Z0 + r + 1.0;
    const hd = head(gemRound(r, 14), roundClaws(r, 4), bh, 0.3, r, r * 0.2);
    a.add(put(hd, m.PI / 2, 0, cx, a.YF + r * 0.95 + 0.8, zc));                                 // stone faces front
    a.ycyl(a.YF + r * 0.95 + 0.8, a.YB - 1.2, cx, zc, 0.55, 8);                                   // post through the ear
    a.add(TUBE([[cx, a.YB - 1.4, zc], [cx, a.YB - 0.2, zc]], [1.0, 1.0], 8));
    { const w = m.min(3.2, r * 0.9); a.box(cx - w, a.YB - 1.4, zc - 0.5, cx + w, a.YB - 0.2, zc + 0.5); a.box(cx - 0.5, a.YB - 1.4, zc - w, cx + 0.5, a.YB - 0.2, zc + w); }
    a.circ(cx, a.cy, r, 'EQUIP-DETAIL'); a.rect(cx - 0.55, a.YF + r * 0.95 + 0.8, cx + 0.55, a.YB - 1, 'EQUIP-DETAIL');
  }
  a.outline(); a.log(`Added a pair of ${m.round(v.rs * 2)} mm stone studs: four-claw head, post and a butterfly back on each (plan and 3D).`);
}
const studRows = [4, 6, 8].map((d) => V(`${d} mm round stones, pair`, d + 2 * 0.0 + 12 + d + 2, d * 0.95 + 0.8 + d * 0.3 + 14, d + 4, { rs: d / 2, sp: 12 + d }));
function hoop(a, v) {
  const R = v.R, r = v.r;
  for (const s of [-1, 1]) {
    const cx = a.cx + s * (R + r + 3), zc = a.Z0 + R + r + 0.5;
    a.add(put(torus(R, r, 40, 7), m.PI / 2, 0, cx, a.cy, zc));
    a.box(cx - 1.2, a.cy - r * 1.4, zc + R - 1.2, cx + 1.2, a.cy + r * 1.4, zc + R + 1.2);          // hinge block
    a.ycyl(a.cy - 3, a.cy + 3, cx + R * 0.0, zc - R, r * 0.55, 8);                                       // latch pin
    a.ycyl(a.cy - r * 1.4, a.YB - 0.1, cx, zc + R, 0.5, 8);
    a.ellp(cx, a.cy, R + r, r, 'EQUIP'); a.circ(cx, a.cy, r, 'EQUIP-DETAIL');
  }
  a.log(`Added a pair of round hoops with a hinge block and latch pin on each (plan and 3D).`);
}
const hoopRows = [['huggie, 0.6 in', 7.0, 1.3], ['medium, 1 in', 11.5, 1.5], ['large chunky, 1.8 in', 20, 3.0]].map(([l, R, r]) => V(`${l}, pair`, 2 * (2 * (R + r) + 3) , 2 * r * 1.4 + 4, 2 * (R + r) + 1.2, { R, r }));
function drop(a, v) {
  for (const s of [-1, 1]) {
    const cx = a.cx + s * v.sp / 2, y = a.cy, zt = a.Z1 - 1.5;
    if (v.kind === 'ball') {
      a.ell(cx, y, zt - 2.2, 2.2, 2.2, 2.2, 10, 6); a.tube([[cx, y, zt - 4], [cx, y, zt - 14]], [0.6, 0.6], 6);
      a.ell(cx, y, zt - 14 - 5, 5, 5, 5, 14, 8); a.ell(cx, y, zt - 14 - 5, 5.6, 1.0, 5.6, 14, 4);
    } else if (v.kind === 'wire') {
      a.tube([[cx, y + 3, zt - 1], [cx, y + 3, zt - 5], [cx + s * 1.5, y + 1.5, zt - 9], [cx + s * 1.5, y - 1, zt - 11]], [0.5, 0.5, 0.5, 0.5], 6);
      a.add(put(head(gemPoly(pearPoly(11, 7), 4.2, [[0.82, 0.8], [0.6, 0.9]], [0.05, 0.05]), [[0, 5.3], [-3, -3], [3, -3]], 0.8, 0.35, 3, 0.3), m.PI / 2, 0, cx + s * 1.5, y - 1.8, zt - 11 - 5.8));
    } else {
      a.ell(cx, y, zt - 2.2, 2.2, 2.2, 2.2, 10, 6);
      const path = [[0, 0], [0, -v.chain]]; a.add(chainAlong(path, cx, y, zt - 4, { pitch: 6, a: 4.4, b: 1.8, r: 0.55 }, 0));
      a.ell(cx, y, zt - 4 - v.chain - 4, 3.6, 3.6, 3.6, 12, 8);
      a.add(mv(rotX(gemRound(2.0, 10), m.PI / 2), cx, y - 3.6 + 0.0, zt - 4 - v.chain - 4));
    }
    a.circ(cx, a.cy, 2.2, 'EQUIP-DETAIL');
  }
  a.outline(); a.log(`Added a pair of ${v.kind === 'ball' ? 'ball-drop' : v.kind === 'wire' ? 'ear-wire teardrop' : 'chain-drop'} earrings, each with its top stud and drop (plan and 3D).`);
}
const dropRows = [V('ball drop, 1.2 in, pair', 11 + 12, 12, 31, { kind: 'ball', sp: 16 }), V('teardrop stone on ear wire, 1.6 in, pair', 8 + 16, 10, 40, { kind: 'wire', sp: 16 }), V('chain drop with stone, 2.6 in, pair', 8 + 16, 10, 4 + 6 * 8 + 12 + 12, { kind: 'chain', sp: 16, chain: 48 })];
function earCuff(a, v) {
  const R = v.R, zc = a.Z0 + R + 1.5;
  a.add(put(torus(R, 0.9, 30, 6, 0.5, TAU * 0.75), m.PI / 2, 0, a.cx, a.cy, zc));
  if (v.bands === 2) a.add(put(torus(R * 0.88, 0.8, 26, 6, 1.0, TAU * 0.7), m.PI / 2, 0, a.cx + 0, a.cy + 2.2, zc));
  for (let i = 0; i < v.stones; i++) { const g = 0.9 + (i * 4.0) / m.max(1, v.stones); a.add(put(gemRound(1.1, 8), m.PI / 2 - 0, 0, a.cx, a.cy, 0).map((q) => q.map(([x, y, z]) => [x + a.cx + R * m.cos(g), y + a.cy - 1.0, z + zc + R * m.sin(g)]))); }
  a.rect(a.cx - R - 1, a.YF, a.cx + R + 1, a.YB, 'EQUIP'); a.log('Added the open wrap cuff arc' + (v.bands === 2 ? ' with a second inner band' : '') + (v.stones ? ` and ${v.stones} small stones` : '') + ' (plan and 3D).');
}
const cuffRows = [V('wrap cuff with three stones, 0.7 in', 20, 6.5, 20, { R: 8, stones: 3, bands: 1 }), V('double-band wrap cuff, 0.9 in', 25, 8, 25, { R: 10.5, stones: 0, bands: 2 })];

// ------------------------------------------------------------------------------------------ bangles and bracelets
function bangle(a, v) {
  const ro = v.ri + v.t, zc = a.Z0 + ro * (v.ez ?? 1), sx = 1, sz = v.ez ?? 1;
  if (v.hinged) {
    a.add(sweepY([[-v.bw / 2, v.ri], [v.bw / 2, v.ri], [v.bw / 2, ro], [-v.bw / 2, ro]], a.cx, a.cy, zc, 48, 0, TAU, 1, sz));
    const g = gemRound(1.7, 8); for (let i = 0; i < 17; i++) { const th = 0.55 + (i * (TAU * 0.5 - 1.1)) / 16 + 0.0; const al = m.PI / 2 - th; a.add(put(g, 0, al, a.cx + ro * m.cos(th) * 1, a.cy, zc + ro * m.sin(th) * sz)); }
    a.box(a.cx - 4.5, a.cy - 4.5, zc - ro * sz - 1.8, a.cx + 4.5, a.cy + 4.5, zc - ro * sz + 1.4);           // clasp box
    a.box(a.cx + ro - 2, a.cy - 3.5, zc - 2, a.cx + ro + 1.2, a.cy + 3.5, zc + 2);                          // hinge barrel
  } else {
    a.add(sweepY(v.flat ? [[-v.bw / 2, v.ri], [v.bw / 2, v.ri], [v.bw / 2, ro], [-v.bw / 2, ro]] : bandProf(v.ri, ro, v.bw / 2, 'court').length ? [[-v.bw / 2, v.ri], [-v.bw * 0.25, v.ri - 0.0], [v.bw / 2, v.ri]].length ? ellPoly(v.t / 2, v.t / 2, 8).map(([y, r]) => [y, v.ri + v.t / 2 + r]) : [] : [], a.cx, a.cy, zc, 56, 0, TAU, 1, sz));
  }
  a.outline(); a.line(a.cx - v.ri, a.YF, a.cx - v.ri, a.YB, 'EQUIP-HIDDEN'); a.line(a.cx + v.ri, a.YF, a.cx + v.ri, a.YB, 'EQUIP-HIDDEN');
  a.log(v.hinged ? 'Added the oval hinged bangle with a row of small stones, a hinge barrel and a box clasp (plan and 3D).' : `Added the ${v.flat ? 'flat wide' : 'round-wire'} bangle swept round its profile (plan and 3D).`);
}
const bgRows = [V('round wire, 2.4 in inner', 2 * (30.5 + 4) + 0.6, 4.4, 2 * (30.5 + 4) + 0.6, { ri: 30.5, t: 4, bw: 4, flat: false }), V('wide flat band, 2.5 in inner', 2 * (31.8 + 2) + 0.6, 12.4, 2 * (31.8 + 2) + 0.6, { ri: 31.8, t: 2, bw: 12, flat: true }),
  V('hinged oval with stone row, 2.3 x 2 in', 2 * (29 + 3.2) + 8.6, 9.6, 2 * (24 + 3.2) * 1 + 4, { ri: 29, t: 3.2, bw: 9, hinged: true, ez: 24 / 29 })];
function tennis(a, v) {
  const rs = v.rs, R = 29, ro = R + 0.8, zc = a.Z0 + (R + 3) * 0.86 + rs, sz = 0.86;
  a.add(sweepY([[-rs, R - 0.6], [rs, R - 0.6], [rs, R + 0.6], [-rs, R + 0.6]], a.cx, a.cy, zc, 56, 0, TAU, 1, sz));
  const n = m.round((TAU * R * 0.93) / (2 * rs + 0.25));
  const g = v.step ? gemPoly(octa(2 * rs, 1.6 * rs, rs * 0.35), rs * 1.1, [[0.82, rs * 0.2]], [0.9, 0.05]) : gemRound(rs, 8);
  for (let i = 0; i < n; i++) { const th = ((i + 0.5) / n) * (TAU * 0.93) + TAU * 0.035 + m.PI / 2 * 0; const al = m.PI / 2 - th; a.add(put(g, 0, al, a.cx + (R + 0.6) * m.cos(th), a.cy, zc + (R + 0.6) * m.sin(th) * sz)); }
  a.box(a.cx - 5, a.cy - rs - 0.4, zc - (R + 0.6) * sz - rs, a.cx + 5, a.cy + rs + 0.4, zc - (R + 0.6) * sz + 0.8);   // clasp
  a.outline(); a.rect(a.cx - 5, a.YF, a.cx + 5, a.YB, 'EQUIP-DETAIL');
  a.log(`Added the oval line of ${n} ${v.step ? 'step-cut' : 'round'} stones in a thin channel, with a box clasp (plan and 3D).`);
}
const tenRows = [['round 2.5 mm stones, 7 in', 1.25, false], ['round 3.5 mm stones, 7 in', 1.75, false], ['step-cut 4 mm stones, 7 in', 2, true]].map(([l, rs, step]) => V(l, 2 * (29.8 + rs) + 2, 2 * rs + 1.6, 2 * (29.8 * 0.86 + rs * 1.2) + 3 + 14, { rs, step }));
function chainBracelet(a, v) {
  const R = 28, sz = 0.88, cum = (() => { const pts = Array.from({ length: 121 }, (_, i) => [R * m.sin((i / 120) * TAU * 0.96), R * sz * m.cos((i / 120) * TAU * 0.96)]); return pts; })();
  const zc = a.Z0 + R * sz + v.lk.b + v.lk.r + 1;
  a.add(chainAlong(cum, a.cx, a.cy, zc, v.lk, 0));
  a.add(put(lobster(), 0, 0, a.cx, a.cy, zc + R * sz - 0.0).map((q) => q));
  a.ellp(a.cx, a.cy, R + 5, 4); a.outline('EQUIP-HIDDEN');
  if (v.charms) for (let i = 0; i < v.charms; i++) {
    const th = TAU * 0.18 + (i * TAU * 0.64) / m.max(1, v.charms - 1), x = a.cx + R * m.sin(th), z = zc + R * sz * m.cos(th), k = i % 3;
    a.tube([[x, a.cy, z], [x, a.cy, z - 3]], [0.5, 0.5], 5);
    if (k === 0) a.ycyl(a.cy - 0.8, a.cy + 0.8, x, z - 8, 4.5, 14); else if (k === 1) a.ell(x, a.cy, z - 8, 3.8, 3.8, 3.8, 10, 6); else a.add(prismY([[-3.5, -3.5], [3.5, -3.5], [3.5, 3.5], [-3.5, 3.5]].map(([dx, dz]) => [x + dx, z - 7.5 + dz]), a.cy - 0.9, a.cy + 0.9));
  }
  a.log(`Added ${m.round((TAU * R * 0.96) / v.lk.pitch)} alternating chain links, a lobster clasp` + (v.charms ? ` and ${v.charms} charms (disc, ball, square)` : '') + ' (plan and 3D).');
}
const cbRows = (() => { const mk = (l, lk, charms = 0) => V(l, 2 * (28 + lk.b + lk.r) + 12, 2 * (lk.b + lk.r) + 1 + (charms ? 2 : 0), 2 * 28 * 0.88 + 2 * (lk.b + lk.r) + 4 + (charms ? 14 : 0), { lk, charms }); return [mk('cable links, 7 in', { pitch: 7, a: 6, b: 2.6, r: 0.8 }), mk('wide links, 7.5 in', { pitch: 9, a: 8, b: 4, r: 1.1 }), mk('fine links, 6.5 in', { pitch: 5, a: 4.2, b: 1.8, r: 0.55 })]; })();
const charmRows = (() => { const lk = { pitch: 7, a: 6, b: 2.6, r: 0.8 }; return [3, 5].map((c) => V(`${c} charms, 7 in`, 2 * (28 + 4) + 12, 8, 2 * 28 * 0.88 + 2 * 3.4 + 4 + 16, { lk, charms: c })); })();
function cuffBracelet(a, v) {
  const ri = v.ri, t = v.t, zc = a.Z0 + (ri + t) * 0.9, g0 = m.PI / 2 + 0.42, g1 = m.PI / 2 + TAU - 0.42;
  a.add(sweepY((g) => { const e = m.min(1, m.min(g - g0, g1 - g) / 0.5), w = v.bw * (v.taper ? 0.45 + 0.55 * e : 1) / 2; return [[-w, ri], [w, ri], [w, ri + t], [-w, ri + t]]; }, a.cx, a.cy, zc, 56, g0, g1, 1, 0.9));
  if (v.stone) { a.add(mv(rotX(head(gemRound(4.5, 14), roundClaws(4.5, 6), 1.6, 0.45, 4.5, 1.2), -m.PI / 2), a.cx, a.cy - 0.0, 0).map((q) => q.map(([x, y, z]) => [x, y - 0.0, z]))
    .map((q) => q.map(([x, y, z]) => [x, y + 0.0, z + zc + (ri + t) * 0.9 * -1 + 0.0]))); }
  a.outline(); a.line(a.cx - ri, a.YF, a.cx - ri, a.YB, 'EQUIP-HIDDEN'); a.line(a.cx + ri, a.YF, a.cx + ri, a.YB, 'EQUIP-HIDDEN');
  a.log(`Added the open ${v.taper ? 'tapering ' : ''}cuff band with its gap at the top` + (v.stone ? ' and a claw-set stone at the front' : '') + ' (plan and 3D).');
}
const cfRows = [V('plain open cuff, 0.6 in wide', 2 * (28 + 2) + 1, 15.6, 2 * (28 + 2) * 0.9 + 1, { ri: 28, t: 2, bw: 15 }), V('wide tapering cuff, 1.2 in', 2 * (29 + 2.4) + 1, 31, 2 * (29 + 2.4) * 0.9 + 1, { ri: 29, t: 2.4, bw: 30, taper: true }),
  V('narrow cuff with centre stone', 2 * (28 + 2.2) + 1, 12, 2 * (28 + 2.2) * 0.9 + 1, { ri: 28, t: 2.2, bw: 8, stone: true })];

// ------------------------------------------------------------------------------------------ loose stones and settings
/** a loose stone on a thin felt pad; the girdle sits at pad + depth */
function looseStone(a, v) {
  const pad = 0.8, z0 = a.Z0, L = v.L, W = v.W;
  let g, depth;
  if (v.cut === 'round') { depth = L * 0.31; g = gemRound(L / 2, 18); }
  else {
    const poly = v.cut === 'emerald' ? octa(L, W, W * 0.2) : v.cut === 'princess' ? octa(L, L, 0.01) : v.cut === 'oval' ? ellPoly(L / 2, W / 2, 22) : pearPoly(L, W);
    depth = W * 0.6;
    g = gemPoly(poly, depth, v.cut === 'emerald' ? [[0.82, 0.1 * W], [0.62, 0.12 * W]] : v.cut === 'princess' ? [[0.7, 0.18 * L]] : [[0.84, 0.08 * W], [0.62, 0.1 * W], [0.5, 0.06 * W]], v.cut === 'emerald' ? [0.55, 0.05] : v.cut === 'princess' ? [0.04, 0.04] : [0.06, 0.06]);
    a.poly(poly.map(([x, y]) => [a.cx + x, a.cy + y]), 'EQUIP'); a.poly(scl(poly, 0.6).map(([x, y]) => [a.cx + x, a.cy + y]), 'EQUIP-DETAIL');
  }
  if (v.cut === 'round') { a.circ(a.cx, a.cy, L / 2); a.circ(a.cx, a.cy, L * 0.29, 'EQUIP-DETAIL'); }
  a.add(mv(g, a.cx, a.cy, z0 + pad + (v.cut === 'round' ? L * 0.62 / 2 : depth)));
  a.add(ELL(a.cx, a.cy, z0 + pad / 2, 1, 1, 1, 3, 2).slice(0, 0));
  const pr = m.max(L, W) / 2 + 2; a.cyl(a.cx, a.cy, z0, z0 + pad, pr, 28);
  a.rect(a.cx - pr, a.cy - pr, a.cx + pr, a.cy + pr, 'EQUIP-HIDDEN');
  a.log(`Added the ${v.cut}-cut faceted stone (crown, girdle and pavilion) resting point-down on a thin pad (plan and 3D).`);
}
const stoneRow = (cut, L, W, extra) => { const depthU = cut === 'round' ? L * 0.62 / 2 + L * 0.34 / 2 : (cut === 'oval' || cut === 'pear' || cut === 'emerald' ? W * 0.6 + W * 0.3 : L * 0.6 + L * 0.2); const pr = m.max(L, W) / 2 + 2; return V(`${L}${W && W !== L ? ' x ' + W : ''} mm ${extra || ''}`.trim().replace(/ $/, ''), 2 * pr, 2 * pr, depthU + 1.2 + 0.8, { cut, L, W }); };
const roundStones = [4, 6.5, 8, 10].map((d) => stoneRow('round', d, d, 'round stone'));
const emStones = [[7, 5], [10, 7.5]].map(([L, W]) => stoneRow('emerald', L, W, 'emerald cut'));
const prStones = [[5, 5], [6.5, 6.5]].map(([L, W]) => stoneRow('princess', L, W, 'princess cut'));
const ovStones = [[7, 5], [9, 7], [11, 8.5]].map(([L, W]) => stoneRow('oval', L, W, 'oval'));
const pearStones = [[8, 5], [11, 7]].map(([L, W]) => stoneRow('pear', L, W, 'pear'));

function clawSetting(a, v) {
  const r = v.rs, bh = r * 1.1, z0 = a.Z0;
  a.add(mv(head(gemRound(r, 16), roundClaws(r, v.claws), bh, r * 0.12, r, r * 0.25), a.cx, a.cy, z0 + bh + 0.6 * 0));
  a.add(TUBE([[a.cx, a.cy, z0], [a.cx, a.cy, z0 + bh * 0.4]], [r * 0.25, r * 0.45], 10));
  a.circ(a.cx, a.cy, r); a.circ(a.cx, a.cy, r * 0.6, 'EQUIP-DETAIL');
  for (const [x, y] of roundClaws(r, v.claws)) a.circ(a.cx + x, a.cy + y, r * 0.13, 'EQUIP-DETAIL');
  a.log(`Added a ${v.claws}-claw head with a gallery ring and stem and the round stone it holds (plan and 3D).`);
}
const clRows = [['four claw head, 6 mm stone', 3, 4], ['six claw head, 8 mm stone', 4, 6]].map(([l, rs, claws]) => V(l, 2 * rs + 3, 2 * rs + 3, rs * 1.1 + rs * 0.34 + rs * 0.3 + 1.5, { rs, claws }));

// ------------------------------------------------------------------------------------------ watch cases, boxes, busts
function watch(a, v) {
  const D = v.dia, hh = D / 2, th = v.th, cz = a.Z0 + a.H / 2, y0 = a.YB - 0.5 - th, y1 = a.YB - 0.5, cx = a.cx;
  const sq = v.rect, W = sq ? v.rw : D, Hh = sq ? v.rh : D;
  // strap pieces and lugs
  const sw = (sq ? W : D) * 0.58;
  for (const s of [-1, 1]) {
    const zE = cz + s * (Hh / 2 + v.strap), zS = cz + s * (Hh / 2 - 1);
    a.add(prismY([[cx - sw / 2 - 0.5, zS], [cx + sw / 2 + 0.5, zS], [cx + sw * 0.4, zE], [cx - sw * 0.4, zE]], y1 - 3.2, y1 - 1.6));
    for (const q of [-1, 1]) a.box(cx + q * (sw / 2 + 0.3) - 1.0, y1 - th * 0.8, cz + s * (Hh / 2 - 3.5) - 2.5, cx + q * (sw / 2 + 0.3) + 1.0, y1 - 1.2, cz + s * (Hh / 2 + 3.2) + 2.5 * 0);
    for (let k = 0; k < 4; k++) a.ycyl(y1 - 3.0, y1 - 1.5, cx, zS + s * (4 + k * 5.5), 0.6, 6);
  }
  a.box(cx - sw * 0.28, y1 - 3.6, cz - (Hh / 2 + v.strap) - 1.0, cx + sw * 0.28, y1 - 1.0, cz - (Hh / 2 + v.strap) + 2.4);   // buckle
  if (sq) {
    a.add(prismY(octa(W, Hh, 2.6).map(([x, z]) => [cx + x, cz + z]), y0, y1));
    a.add(prismY(octa(W - 3, Hh - 3, 2).map(([x, z]) => [cx + x, cz + z]), y0 - 1.0, y0));
    a.add(prismY(octa(W - 5.5, Hh - 5.5, 1.6).map(([x, z]) => [cx + x, cz + z]), y0 - 1.4, y0 - 1.0));
  } else {
    a.ycyl(y0, y1, cx, cz, hh, 36); a.ycyl(y0 - 1.0, y0, cx, cz, hh - 1.3, 36); a.add(put(torus(hh - 1.3, 0.6, 36, 5), m.PI / 2, 0, cx, y0 - 1.0, cz));
    a.add(TUBE([[cx, y0 - 1.0, cz], [cx, y0 - 1.5, cz]], [hh - 2.4, hh - 2.4], 32));
    a.add(put(ELL(0, 0, 0, hh - 2.4, 0.9, hh - 2.4, 28, 6), 0, 0, cx, y0 - 1.3, cz));    // domed crystal
  }
  // dial
  const dr = (sq ? m.min(W, Hh) / 2 : hh) - 3.4;
  for (let i = 0; i < 12; i++) { const g = (i / 12) * TAU, x = cx + (dr - 1.2) * m.sin(g) * (sq ? W / m.min(W, Hh) : 1), z = cz + (dr - 1.2) * m.cos(g) * (sq ? Hh / m.min(W, Hh) : 1); a.box(x - 0.45, y0 - 2.3, z - (i % 3 === 0 ? 1.6 : 0.9), x + 0.45, y0 - 1.9, z + (i % 3 === 0 ? 1.6 : 0.9)); }
  a.box(cx - 0.5, y0 - 2.9, cz, cx + 0.5, y0 - 2.4, cz + dr * 0.85); a.box(cx - 0.45, y0 - 2.7, cz, cx + 1.6 + dr * 0.55 - 1.6 + 0.45 - 0.45 + 0.0, y0 - 2.4, cz + 0.9);
  a.ycyl(y0 - 3.1, y0 - 2.4, cx, cz, 1.0, 8);
  a.xcyl(cx + W / 2, cx + W / 2 + 2.6, y0 + th * 0.45, cz + (sq ? Hh * 0.0 : 0), 1.6, 10);                                    // crown
  a.ycyl(y1, y1 + 0.0 + 0.01, cx, cz, hh * 0.9, 20);
  a.rect(cx - W / 2, a.YF, cx + W / 2, a.YB, 'EQUIP'); if (!sq) a.circ(cx, a.cy, hh * 0.9, 'EQUIP-DETAIL'); a.rect(cx + W / 2, y0 + th * 0.2, cx + W / 2 + 2.6, y0 + th * 0.7, 'EQUIP-DETAIL');
  a.log(`Added the ${sq ? 'rectangular' : 'round'} case with bezel, domed crystal, dial markers and hands, winding crown, lugs and strap stubs with a buckle (plan and 3D).`);
}
const wRow = (l, D, th, strap) => V(l, D + 2.6 + 0.4, th + 4.0, D + 2 * (strap + 4), { dia: D, th, strap });
const wcRows = [wRow('round case, 34 mm', 34, 9, 18), wRow('round case, 38 mm', 38, 10.5, 20), wRow('round case, 42 mm', 42, 12, 22),
  (() => { const w = 27, h = 34, s = 17; return V('rectangular case, 27 x 34 mm', w + 3.2, 9 + 4, h + 2 * (s + 4), { dia: 30, th: 8, strap: s, rect: true, rw: w, rh: h }); })(),
  (() => { const w = 32, h = 40, s = 20; return V('rectangular case, 32 x 40 mm', w + 3.2, 10 + 4, h + 2 * (s + 4), { dia: 36, th: 9, strap: s, rect: true, rw: w, rh: h }); })()];
// (the plan of a watch lies on its back: the face looks to -Y)

function ringBox(a, v) {
  const W = v.w, D = v.dd, H = v.h, cx = a.cx, wall = 2.2, yb = a.YB;
  if (v.round) {
    const R = W / 2 - 0.2, cy = a.cy;
    a.add(TUBE([[cx, cy, a.Z0], [cx, cy, a.Z0 + H]], [R, R], 36));
    a.cyl(cx, cy, a.Z0 + H, a.Z0 + H + 0.2, R - wall, 36);
    a.add(TUBE([[cx, cy, a.Z0 + H - 0.1], [cx, cy, a.Z0 + H + 0.3]], [R - wall, R - wall], 36));
    a.add(TUBE([[cx, cy, a.Z0 + H + 0.3], [cx, cy, a.Z0 + H + 0.7]], [R - wall - 0.3, R - wall - 0.3], 36));
    a.circ(cx, cy, R); a.circ(cx, cy, R - wall, 'EQUIP-DETAIL');
  } else {
    a.box(cx - W / 2, a.YF + (D > 0 ? 0 : 0), a.Z0, cx + W / 2, yb, a.Z0 + H);
    a.box(cx - W / 2 + wall, a.YF + wall, a.Z0 + H, cx + W / 2 - wall, yb - wall, a.Z0 + H + 0.8);
    a.rect(cx - W / 2, a.YF, cx + W / 2, yb); a.rect(cx - W / 2 + wall, a.YF + wall, cx + W / 2 - wall, yb - wall, 'EQUIP-DETAIL');
  }
  // slotted cushion roll and a ring standing in it
  const cz = a.Z0 + H + 0.9;
  a.add(mv(rotY(TUBE([[-v.cl / 2, 0, 0], [v.cl / 2, 0, 0]], [4.2, 4.2], 14), 0), a.cx, a.cy, cz + 4.2 - 0.4)); a.box(cx - 3.2, a.cy - 4.4, cz + 4.0, cx + 3.2, a.cy + 4.4, cz + 4.6 - 0.3);
  const ro = 9.2, zc = cz + 5 + ro - 3.0, g = gemRound(2.8, 12);
  a.add(sweepY([[-1.1, 7.8], [1.1, 7.8], [1.1, ro - 0.2], [0.7, ro], [-0.7, ro], [-1.1, ro - 0.2]], cx, a.cy, zc, 36));
  a.add(mv(head(g, roundClaws(2.8, 4), 2.2, 0.35, 2.8, 0.6), cx, a.cy, zc + ro + 2.2));
  // hinged lid standing open behind
  const lz0 = a.Z0 + H + 0.8, lh = v.lh, ln = 1.2;
  if (v.round) { a.add(TUBE([[cx, yb - 8, lz0 + 6], [cx, yb - 4, lz0 + 6 + lh]], [W / 2 - 0.2, W / 2 - 0.2], 28).slice(0, 0)); a.add(prismY(ellPoly(W / 2 - 0.4, lh / 2, 24).map(([x, z]) => [cx + x, lz0 + 1 + lh / 2 + z]), yb - 5.5, yb - 5.5 + 5.0)); }
  else { a.box(cx - W / 2, yb - 3.0, lz0, cx + W / 2, yb, lz0 + lh); a.box(cx - W / 2 + wall, yb - 3.0 - ln, lz0 + wall, cx + W / 2 - wall, yb - 3.0, lz0 + lh - wall); }
  a.log(`Added the ${v.round ? 'cylindrical' : 'square'} box body, its inner cushion with a slotted roll holding a stone ring, and the lid hinged open at the back (plan and 3D).`);
}
const rbRows = [V('square, lid open, 2.2 in', 56, 56, 40 + 0.8 + 4.2 + 24 + 12 + 6, { w: 56, dd: 56, h: 40, lh: 40, cl: 36 }), V('round, lid open, 2.4 in', 61, 61, 36 + 0.8 + 4.2 + 24 + 12 + 6, { w: 61, dd: 61, h: 36, lh: 52, cl: 36, round: true }),
  V('long wide box, lid open, 3 in', 76, 40, 30 + 0.8 + 4.2 + 24 + 12 + 6, { w: 76, dd: 40, h: 30, lh: 34, cl: 52 })];

function bust(a, v) {
  const cx = a.cx, cy = a.cy, h = v.bh, bw = v.bw;
  a.box(cx - bw * 0.55, cy - bw * 0.42, a.Z0, cx + bw * 0.55, cy + bw * 0.42, a.Z0 + 12);
  const S = (z, r, ry = 0.3) => ({ z: m.round(z * 10) / 10, x: 0, y: 0, rx: bw * r, ry: bw * ry });
  a.add(mv(LOFT([S(12, 0.44), S(h * 0.3, 0.5), S(h * 0.6, 0.52, 0.32), S(h * 0.7, 0.47, 0.3), S(h * 0.76, 0.34, 0.24), S(h * 0.8, 0.19, 0.17), S(h * 0.83, 0.12, 0.12), S(h * 0.97, 0.105, 0.105), S(h * 1.0, 0.07, 0.07)], 24), cx, cy, a.Z0));
  a.ellp(cx, cy, bw * 0.52, bw * 0.38); a.circ(cx, cy, bw * 0.11, 'EQUIP-DETAIL'); a.rect(cx - bw * 0.55, cy - bw * 0.42, cx + bw * 0.55, cy + bw * 0.42, 'EQUIP-HIDDEN');
  a.log('Added the flat base plate and a rounded shoulder form narrowing to a neck, with a necklace tapering line for display (plan and 3D).');
}
const bustRows = [V('short shoulder form, 9 in', 160, 130, 229, { bh: 229, bw: 156 }), V('tall shoulder form, 13 in', 190, 150, 330, { bh: 330, bw: 184 })];

// ------------------------------------------------------------------------------------------ families
export default [
  fam({ cat: 'jewellery/rings', title: 'Generic plain band ring',
    desc: (v) => `Plain finger ring: a ${v.bw} mm wide band with a ${v.prof === 'court' ? 'domed (comfort-fit)' : 'flat, chamfered'} outside, ${m.round((v.ri * 2) * 10) / 10} mm bore, standing upright.`,
    vs: bandRows, build: ringBand }),
  fam({ cat: 'jewellery/rings', title: 'Generic solitaire ring',
    desc: (v) => `Solitaire ring: a slim band with cathedral shoulders, a ${v.claws}-claw basket with gallery ring and one ${v.rs * 2} mm round faceted stone.`,
    vs: solRows, build: solitaire }),
  fam({ cat: 'jewellery/rings', title: 'Generic signet ring',
    desc: (v) => `Signet ring: a band that widens into the shoulders, with a flat bevelled ${v.face === 'round' ? 'round' : v.face === 'oval' ? 'oval' : v.face === 'square' ? 'cushion-shaped' : 'rectangular'} face plate and a raised inner panel.`,
    vs: sigRows, build: signet }),
  fam({ cat: 'jewellery/rings', title: 'Generic eternity ring',
    desc: (v) => `Eternity ring: a ${v.half ? 'half' : 'full'}-set band with small round faceted stones touching around ${v.half ? 'the upper half' : 'the whole circle'}.`,
    vs: etRows, build: eternity }),
  fam({ cat: 'jewellery/rings', title: 'Generic stacking ring set',
    desc: (v) => `Stack of ${v.set.length} thin finger rings side by side, mixing plain, stone-set, beaded and wide bands.`,
    vs: stRows, build: stacking }),
  fam({ cat: 'jewellery/rings', title: 'Generic three-stone ring',
    desc: (v) => `Three-stone ring: a slim band carrying a ${v.cut === 'emerald' ? 'step-cut' : 'round'} centre stone with a smaller round stone on each side, each in four claws.`,
    vs: triRows, build: threeStone }),
  fam({ cat: 'jewellery/rings', title: 'Generic halo ring',
    desc: (v) => `Halo ring: a slim band with a claw-set ${v.rc * 2} mm centre stone surrounded by a ring of small stones on a shallow plate.`,
    vs: haloRows, build: halo }),
  fam({ cat: 'jewellery/rings', title: 'Generic bezel-set ring',
    desc: (v) => `Bezel-set ring: a slim band with a smooth metal collar and rim holding one ${v.oval ? 'oval' : 'round'} faceted stone.`,
    vs: bezRows, build: bezel }),

  fam({ cat: 'jewellery/necklaces', title: 'Generic disc pendant necklace',
    desc: (v) => `Pendant necklace: ${m.round(v.L / 25.4)} in chain of alternating links with a lobster clasp, and a ${v.what}.`,
    vs: [inchRow('15 mm disc, 16 in chain', 16, 'disc', { dia: 15 }, 'round disc pendant with a raised rim and a boss'), inchRow('20 mm disc, 18 in chain', 18, 'disc', { dia: 20 }, 'round disc pendant with a raised rim and a boss'), inchRow('28 mm disc, 20 in chain', 20, 'disc', { dia: 28 }, 'round disc pendant with a raised rim and a boss')],
    build: necklace }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic teardrop stone pendant necklace',
    desc: (v) => `Pendant necklace: ${m.round(v.L / 25.4)} in chain of alternating links with a lobster clasp, and a ${v.what}.`,
    vs: [inchRow('8 x 5 mm stone, 16 in chain', 16, 'tear', { L: 8, Wd: 5 }, 'pear-shaped faceted stone in a three-claw head'), inchRow('12 x 8 mm stone, 18 in chain', 18, 'tear', { L: 12, Wd: 8 }, 'pear-shaped faceted stone in a three-claw head'), inchRow('16 x 10 mm stone, 20 in chain', 20, 'tear', { L: 16, Wd: 10 }, 'pear-shaped faceted stone in a three-claw head')],
    build: necklace }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic bar pendant necklace',
    desc: (v) => `Pendant necklace: ${m.round(v.L / 25.4)} in chain of alternating links with a lobster clasp, and a ${v.what}.`,
    vs: [inchRow('round bar 1 in, 16 in chain', 16, 'bar', { len: 25.4, flat: false }, 'horizontal round bar with ball ends'), inchRow('flat bar with stone row 1.5 in, 18 in chain', 18, 'bar', { len: 38, flat: true, stones: true }, 'flat horizontal bar with a row of small stones'), inchRow('long flat bar 2 in, 20 in chain', 20, 'bar', { len: 50.8, flat: true }, 'long flat horizontal bar')],
    build: necklace }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic locket necklace',
    desc: (v) => `Locket necklace: ${m.round(v.L / 25.4)} in chain of alternating links with a lobster clasp, and a ${v.what}.`,
    vs: [inchRow('round locket 25 mm, 18 in chain', 18, 'locket', { shape: 'round', w: 25, h: 25 }, 'domed locket with a hinge, a catch and a raised front boss'), inchRow('oval locket 30 x 38 mm, 20 in chain', 20, 'locket', { shape: 'oval', w: 30, h: 38 }, 'domed locket with a hinge, a catch and a raised front boss'), inchRow('heart locket 30 mm, 18 in chain', 18, 'locket', { shape: 'heart', w: 30, h: 30 }, 'heart-shaped locket with a hinge, a catch and a front boss')],
    build: necklace }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic cross pendant necklace',
    desc: (v) => `Pendant necklace: ${m.round(v.L / 25.4)} in chain of alternating links with a lobster clasp, and a ${v.what}.`,
    vs: [inchRow('plain cross 1.2 in, 18 in chain', 18, 'cross', { s: 30, t: 4.5 }, 'plain latin cross pendant'), inchRow('cross with centre stone 1.6 in, 20 in chain', 20, 'cross', { s: 40, t: 6, gem: true }, 'latin cross pendant with a centre stone'), inchRow('flared-arm cross 2 in, 24 in chain', 24, 'cross', { s: 50, t: 6, flare: true }, 'cross pendant with flared arms')],
    build: necklace }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic chain necklace',
    desc: (v) => `Plain chain necklace: ${m.round(v.L / 25.4)} in of alternating flat and edge-on links with a lobster clasp, hung in a loop.`,
    vs: [16, 18, 20, 24].map((i) => inchRow(`${i} in links only`, i, 'bar', { len: 0.01, flat: false }, 'chain').map((x, k) => (k === 5 ? { ...x, nopend: true } : x))).map((r) => r), build: (a, v) => necklaceChain(a, v) }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic bead strand necklace',
    desc: (v) => `Beaded necklace with ${v.grad ? 'graduated' : 'uniform'} round beads on a ${m.round(v.L / 25.4)} in strand and a clasp at the top.`,
    vs: beadRows, build: beads }),
  fam({ cat: 'jewellery/necklaces', title: 'Generic rigid torque collar',
    desc: (v) => `Rigid open collar necklace as a ${v.flat ? 'flat band with a centre stone' : 'round tube'} with a ball terminal at each end of the gap.`,
    vs: torRows, build: torque }),

  fam({ cat: 'jewellery/earrings', title: 'Generic stone stud earrings',
    desc: (v) => `Pair of stud earrings with ${v.rs * 2} mm round faceted stones in four-claw heads, posts and butterfly backs.`,
    vs: studRows, build: stud }),
  fam({ cat: 'jewellery/earrings', title: 'Generic hoop earrings',
    desc: () => 'Pair of round hoop earrings, each with a hinge block, a latch pin and an ear post.',
    vs: hoopRows, build: hoop }),
  fam({ cat: 'jewellery/earrings', title: 'Generic drop earrings',
    desc: (v) => `Pair of drop earrings with a top ball and ${v.kind === 'ball' ? 'a hanging ball drop' : v.kind === 'wire' ? 'an ear wire and a teardrop faceted stone' : 'a short chain ending in a ball with a stone'}.`,
    vs: dropRows, build: drop }),
  fam({ cat: 'jewellery/earrings', title: 'Generic ear cuff',
    desc: (v) => `Single open ear cuff: a wrapped wire arc${v.bands === 2 ? ' with a second inner band' : ''}${v.stones ? ` and ${v.stones} small stones` : ''}.`,
    vs: cuffRows, build: earCuff }),
  fam({ cat: 'jewellery/earrings', title: 'Generic bangle bracelet',
    desc: (v) => v.hinged ? 'Oval hinged bangle with a row of small stones, a hinge barrel and a box clasp.' : `Rigid ${v.flat ? 'flat wide' : 'round-wire'} bangle bracelet, worn on the wrist.`,
    vs: bgRows, build: bangle }),
  fam({ cat: 'jewellery/earrings', title: 'Generic tennis bracelet',
    desc: (v) => `Line bracelet: an oval band set with a continuous row of ${v.step ? 'step-cut' : 'round'} stones and a box clasp.`,
    vs: tenRows, build: tennis }),
  fam({ cat: 'jewellery/earrings', title: 'Generic chain bracelet',
    desc: () => 'Link chain bracelet of alternating links in a loop, closed with a lobster clasp.',
    vs: cbRows, build: chainBracelet }),
  fam({ cat: 'jewellery/earrings', title: 'Generic charm bracelet',
    desc: (v) => `Link chain bracelet with a lobster clasp and ${v.charms} hanging charms (discs, balls and squares).`,
    vs: charmRows, build: chainBracelet }),
  fam({ cat: 'jewellery/earrings', title: 'Generic cuff bracelet',
    desc: (v) => `Open cuff bracelet: a ${v.taper ? 'tapering ' : ''}band with a gap at the top${v.stone ? ' and a claw-set stone at the front' : ''}.`,
    vs: cfRows, build: cuffBracelet }),

  fam({ cat: 'jewellery/settings', title: 'Generic round faceted stone',
    desc: (v) => `Loose round brilliant-style stone, ${v.L} mm across, with a table, crown, girdle and pavilion, on a thin pad.`,
    vs: roundStones, build: looseStone }),
  fam({ cat: 'jewellery/settings', title: 'Generic emerald-cut stone',
    desc: (v) => `Loose step-cut stone with clipped corners, ${v.L} x ${v.W} mm, with stepped crown and pavilion, on a thin pad.`,
    vs: emStones, build: looseStone }),
  fam({ cat: 'jewellery/settings', title: 'Generic princess-cut stone',
    desc: (v) => `Loose square stone, ${v.L} mm across, with a pyramid crown and pavilion, on a thin pad.`,
    vs: prStones, build: looseStone }),
  fam({ cat: 'jewellery/settings', title: 'Generic oval faceted stone',
    desc: (v) => `Loose oval stone, ${v.L} x ${v.W} mm, with stepped crown and pointed pavilion, on a thin pad.`,
    vs: ovStones, build: looseStone }),
  fam({ cat: 'jewellery/settings', title: 'Generic pear-shaped stone',
    desc: (v) => `Loose pear-shaped stone, ${v.L} x ${v.W} mm, with stepped crown and pointed pavilion, on a thin pad.`,
    vs: pearStones, build: looseStone }),
  fam({ cat: 'jewellery/settings', title: 'Generic claw-set stone head',
    desc: (v) => `Loose ${v.claws}-claw setting with a gallery ring and a stem, holding a round stone.`,
    vs: clRows, build: clawSetting }),
  fam({ cat: 'jewellery/settings', title: 'Generic wristwatch case',
    desc: (v) => `Wristwatch ${v.rect ? 'rectangular' : 'round'} case lying face forward: bezel, domed crystal, dial markers and hands, crown, lugs and strap stubs with a buckle.`,
    vs: wcRows, build: watch }),
  fam({ cat: 'jewellery/settings', title: 'Generic hinged ring box',
    desc: (v) => `${v.round ? 'Cylindrical' : 'Square'} ring box with the lid hinged open, an inner cushion and a stone ring standing in the slot.`,
    vs: rbRows, build: ringBox }),
  fam({ cat: 'jewellery/settings', title: 'Generic necklace display bust',
    desc: () => 'Display bust: a flat base plate and a rounded shoulder form narrowing to a neck, for showing necklaces.',
    vs: bustRows, build: bust }),
];

/** necklace without a pendant (chain only) */
function necklaceChain(a, v) {
  const { W, H, path } = loopOf(v.L), pad = LK.b + LK.r + 1.5, zA = a.Z1 - pad, zc = zA - H / 2;
  a.add(chainAlong(path, a.cx, a.cy, zc, LK, 0)); a.add(put(lobster(), 0, 0, a.cx, a.cy, zA + 0.5));
  a.ellp(a.cx, a.cy, W / 2, 4.5); a.line(a.cx - W / 2, a.cy, a.cx + W / 2, a.cy, 'EQUIP-DETAIL'); a.outline('EQUIP-HIDDEN');
  a.log(`Added ${m.round(v.L / LK.pitch)} chain links alternating flat and edge-on, hung in a loop with a lobster clasp (plan and 3D).`);
}

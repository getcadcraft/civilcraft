/* SPDX-License-Identifier: Apache-2.0 */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = m.PI;
// ------------------------------------------------------------------------------------------ helpers (copied patterns; mm, z up, front -Y)
/** extrude a convex polygon of [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** extrude a convex polygon of [x, z] points between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** a crowned tyre with a rim, a hub and tread lugs; axle along X at (x, y), radius r, width w; lugs = 0 for a smooth tyre */
function tyre(a, x, y, r, w, lugs = 16, zc = null, rim = 0.58) {
  const z = zc ?? a.Z0 + r, rb = lugs ? r * 0.95 : r;
  a.tube([[x - w / 2, y, z], [x - w * 0.36, y, z], [x + w * 0.36, y, z], [x + w / 2, y, z]], [rb * 0.9, rb, rb, rb * 0.9], 22);
  a.xcyl(x - w * 0.52, x + w * 0.52, y, z, r * rim, 14);
  a.xcyl(x - w * 0.6, x + w * 0.6, y, z, r * 0.2, 10);
  for (let k = 0; k < lugs; k++) for (const h of [0, 1]) {
    const th = ((k + h * 0.5) / lugs) * 2 * PI, c = m.cos(th), s = m.sin(th), tw = PI * rb / lugs * 0.32;
    const P = (rad, off) => [y + c * rad - s * off, z + s * rad + c * off];
    const xa = h ? x : x - w * 0.46, xb = h ? x + w * 0.46 : x;
    prismX(a, [P(rb * 0.98, -tw), P(r, -tw * 0.8), P(r, tw * 0.8), P(rb * 0.98, tw)], xa, xb);
  }
  a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL');
}
/** a smooth wheel pair on an axle at y: left and right, centres at +-gx */
function pair(a, gx, y, r, w, lugs = 0, zc = null) { for (const s of [-1, 1]) tyre(a, a.cx + s * gx, y, r, w, lugs, zc); a.xcyl(a.cx - gx, a.cx + gx, y, zc ?? a.Z0 + r, r * 0.12, 8); }
/** a post-and-rail line */
function rail(a, x0, y0, x1, y1, z0, z1, t = 14, posts = 3) {
  a.tube([[x0, y0, z1], [x1, y1, z1]], [t, t], 6);
  for (let i = 0; i < posts; i++) { const f = posts === 1 ? 0 : i / (posts - 1); a.tube([[x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z0], [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z1]], [t * 0.8, t * 0.8], 6); }
  a.line(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
/** cross braces on an X-Z plane at y */
function xbrace(a, x0, x1, y, z0, z1, t = 10) { a.tube([[x0, y, z0], [x1, y, z1]], [t, t], 5); a.tube([[x1, y, z0], [x0, y, z1]], [t, t], 5); }
/** a ladder in the Y-Z plane at x from (y0,z0) to (y1,z1) */
function ladder(a, x, y0, z0, y1, z1, w = 400, rungs = 6) {
  for (const s of [-1, 1]) a.tube([[x + s * w / 2, y0, z0], [x + s * w / 2, y1, z1]], [12, 12], 5);
  for (let i = 0; i <= rungs; i++) { const f = i / rungs; a.box(x - w / 2, y0 + (y1 - y0) * f - 10, z0 + (z1 - z0) * f - 8, x + w / 2, y0 + (y1 - y0) * f + 10, z0 + (z1 - z0) * f + 8); }
  a.line(x - w / 2, y0, x - w / 2, y1, 'EQUIP-DETAIL'); a.line(x + w / 2, y0, x + w / 2, y1, 'EQUIP-DETAIL');
}
/** a tube-and-axle mesh of vertical corrugation rings on a vertical cylinder */
function rings(a, cx, cy, z0, z1, r, n, seg = 28) { for (let i = 1; i < n; i++) { const z = z0 + ((z1 - z0) * i) / n; a.cyl(cx, cy, z - 6, z + 6, r + 7, seg); } }

// ------------------------------------------------------------------------------------------ nature helpers
/** a small deterministic random generator */
function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
/** an irregular lump: an ellipsoid whose radius is displaced by smooth noise; flat cut at zmin (a buried base) */
function lump(a, cx, cy, cz, rx, ry, rz, seed = 1, amp = 0.16, nu = 16, nv = 9, zmin = null) {
  const R = rng(seed), ph = [R() * 6, R() * 6, R() * 6, R() * 6], f1 = 2 + m.floor(R() * 2), f2 = 3 + m.floor(R() * 3);
  const P = (u, v) => {
    const sx = m.sin(v) * m.cos(u), sy = m.sin(v) * m.sin(u), sz = m.cos(v);
    const n = m.sin(2.3 * sx + ph[0]) * m.cos(2.1 * sy + ph[1]) * 0.6 + m.sin(3.1 * sz + ph[2]) * 0.35 + m.sin(4.7 * sx + 3.3 * sy + ph[3]) * 0.4, k = 1 + amp * n;
    let z = cz + rz * k * sz; if (zmin !== null && z < zmin) z = zmin;
    return [cx + rx * k * sx, cy + ry * k * sy, z];
  };
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = i / nu * 2 * PI, u1 = (i + 1) / nu * 2 * PI, v0 = j / nv * PI, v1 = (j + 1) / nv * PI;
    const A = P(u0, v0), B = P(u1, v0), C = P(u1, v1), D = P(u0, v1);
    a.t.push([A, B, C], [A, C, D]);
  }
  return a;
}
/** a heightfield solid: top surface z = f(x, y) over [x0,x1] x [y0,y1] on an nx by ny grid, skirt down to zb */
function field(a, x0, x1, y0, y1, nx, ny, f, zb) {
  const X = (i) => x0 + (x1 - x0) * i / nx, Y = (j) => y0 + (y1 - y0) * j / ny, Pt = (i, j) => [X(i), Y(j), m.max(zb + 1, f(X(i), Y(j)))];
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const A = Pt(i, j), B = Pt(i + 1, j), C = Pt(i + 1, j + 1), D = Pt(i, j + 1); a.t.push([A, B, C], [A, C, D]); }
  for (let i = 0; i < nx; i++) { for (const j of [0, ny]) { const A = Pt(i, j), B = Pt(i + 1, j); a.t.push([A, B, [B[0], B[1], zb]], [A, [B[0], B[1], zb], [A[0], A[1], zb]]); } }
  for (let j = 0; j < ny; j++) { for (const i of [0, nx]) { const A = Pt(i, j), B = Pt(i, j + 1); a.t.push([A, B, [B[0], B[1], zb]], [A, [B[0], B[1], zb], [A[0], A[1], zb]]); } }
  a.t.push([[x0, y0, zb], [x1, y0, zb], [x1, y1, zb]], [[x0, y0, zb], [x1, y1, zb], [x0, y1, zb]]);
  return a;
}
/** an irregular outline polygon (for plan) around (cx, cy) with radii rx, ry and noise */
function blobPoly(cx, cy, rx, ry, seed = 1, n = 20, amp = 0.12) { const R = rng(seed), ph = [R() * 6, R() * 6]; return Array.from({ length: n }, (_, i) => { const u = i / n * 2 * PI, k = 1 + amp * (m.sin(3 * u + ph[0]) * 0.6 + m.sin(5 * u + ph[1]) * 0.4); return [cx + rx * k * m.cos(u), cy + ry * k * m.sin(u)]; }); }

// ------------------------------------------------------------------------------------------ rocks
/** A boulder: a noisy lump set into the ground with two or three smaller stones against its base. */
function boulder(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, sd = v.seed;
  lump(a, cx, cy, Z0 + H * 0.34, W * 0.34, D * 0.34, H * 0.66, sd, 0.2, 14, 8, Z0);
  const R = rng(sd + 7);
  for (let i = 0; i < v.pups; i++) { const th = R() * 6.28, rr = 0.3 + R() * 0.06; const px = cx + m.cos(th) * W * rr, py = cy + m.sin(th) * D * rr, s = 0.1 + R() * 0.07; lump(a, px, py, Z0 + H * s * 0.5, W * s, D * s, H * s * 0.8, sd + i * 3, 0.2, 10, 6, Z0); a.poly(blobPoly(px, py, W * s, D * s, sd + i, 10, 0.2), 'EQUIP-DETAIL'); }
  a.poly(blobPoly(cx, cy, W * 0.38, D * 0.38, sd, 22, 0.1), 'EQUIP'); a.poly(blobPoly(cx - W * 0.04, cy + D * 0.03, W * 0.2, D * 0.2, sd + 2, 14, 0.15), 'EQUIP-DETAIL');
  a.log('Added the irregular boulder body set into the ground with ' + v.pups + ' smaller stones at its base (plan and 3D).');
}
const boulders = fam({ cat: 'nature/rocks', title: 'Generic boulder', desc: (v) => `Rounded ${v.sz} boulder, irregular and partly buried, with ${v.pups} smaller stones resting against its base.`, build: boulder, vs: [
  ['small, 18 in', 22, 20, 15, 0, { sz: 'small', seed: 3, pups: 2 }], ['medium, 30 in', 36, 32, 24, 0, { sz: 'medium', seed: 11, pups: 2 }], ['large, 48 in', 56, 50, 38, 0, { sz: 'large', seed: 5, pups: 3 }], ['very large, 72 in', 84, 76, 56, 0, { sz: 'very large', seed: 17, pups: 3 }], ['monolith, 120 in', 140, 120, 108, 0, { sz: 'monolith', seed: 23, pups: 4 }] ] });

/** A faceted outcrop: tilted angular slabs leaning against each other, with a ground apron. */
function outcrop(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed);
  for (let i = 0; i < v.slabs; i++) {
    const f = i / (v.slabs - 1 || 1), x = X0 + W * 0.2 + f * W * 0.6 + (R() - 0.5) * W * 0.04, y = cy + (R() - 0.5) * D * 0.3, w = W * (0.09 + R() * 0.05), d = D * (0.2 + R() * 0.12), h = H * (0.45 + 0.5 * m.sin(f * PI) * (0.7 + R() * 0.3)), lean = (R() - 0.5) * w * 0.7;
    const poly = [[x - w, y - d * 0.8], [x + w * 0.9, y - d], [x + w, y + d * 0.7], [x - w * 0.8, y + d]];
    const top = poly.map(([px, py]) => [px * 0.55 + x * 0.45 + lean, py * 0.55 + y * 0.45]);
    const z0 = Z0, z1 = Z0 + h * 0.7, z2 = Z0 + h, zt = (k) => z2 + (k === 0 ? -0.18 : k === 1 ? 0.04 : k === 2 ? 0.14 : -0.06) * h;
    for (let k = 0; k < 4; k++) { const p = poly[k], q = poly[(k + 1) % 4], tp = top[k], tq = top[(k + 1) % 4]; a.t.push([[p[0], p[1], z0], [q[0], q[1], z0], [q[0], q[1], z1]], [[p[0], p[1], z0], [q[0], q[1], z1], [p[0], p[1], z1]], [[p[0], p[1], z1], [q[0], q[1], z1], [tq[0], tq[1], zt((k + 1) % 4)]], [[p[0], p[1], z1], [tq[0], tq[1], zt((k + 1) % 4)], [tp[0], tp[1], zt(k)]]); }
    a.t.push([[top[0][0], top[0][1], zt(0)], [top[1][0], top[1][1], zt(1)], [top[2][0], top[2][1], zt(2)]], [[top[0][0], top[0][1], zt(0)], [top[2][0], top[2][1], zt(2)], [top[3][0], top[3][1], zt(3)]]);
    a.poly(poly, 'EQUIP'); a.poly(top, 'EQUIP-DETAIL');
  }
  for (let i = 0; i < 4; i++) { const x = X0 + W * (0.1 + R() * 0.8), y = cy + (R() - 0.5) * D * 0.8, s = 0.05 + R() * 0.05; lump(a, x, y, Z0 + H * s * 0.4, W * s, D * s, H * s, v.seed + i, 0.25, 8, 5, Z0); a.circ(x, y, W * s, 'EQUIP-DETAIL'); }
  a.log('Added ' + v.slabs + ' angular leaning slabs with tilted tops and a scatter of loose stones around them (plan and 3D).');
}
const outcrops = fam({ cat: 'nature/rocks', title: 'Generic rock outcrop', desc: (v) => `Rock outcrop of ${v.slabs} angular leaning slabs with tilted tops and loose stones around the foot.`, build: outcrop, vs: [
  ['3 slabs, 4 ft', 56, 40, 40, 0, { seed: 2, slabs: 3 }], ['5 slabs, 8 ft', 108, 72, 66, 0, { seed: 8, slabs: 5 }], ['7 slabs, 14 ft', 180, 120, 100, 0, { seed: 14, slabs: 7 }], ['9 slabs, 24 ft', 300, 180, 150, 0, { seed: 20, slabs: 9 }] ] });

/** A cairn: a stack of flat stones getting smaller towards the top. */
function cairn(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), n = v.n;
  let z = Z0;
  for (let i = 0; i < n; i++) {
    const f = i / n, rr = 0.5 * (1 - 0.82 * f) * (0.88 + R() * 0.2), th = (H - 10) / n * (1.2 - f * 0.6), ox = (R() - 0.5) * W * 0.05 * (1 + f), oy = (R() - 0.5) * D * 0.05 * (1 + f);
    lump(a, cx + ox, cy + oy, z + th * 0.5, W * rr, D * rr, th * 0.62, v.seed + i * 5, 0.12, 14, 6, z - 6);
    a.poly(blobPoly(cx + ox, cy + oy, W * rr, D * rr, v.seed + i, 14, 0.1), i === 0 ? 'EQUIP' : 'EQUIP-DETAIL');
    z += th * 0.78;
  }
  a.log('Added ' + n + ' stacked flat stones, each smaller and slightly off centre, the lowest set into the ground (plan and 3D).');
}
const cairns = fam({ cat: 'nature/rocks', title: 'Generic stone cairn', desc: (v) => `Stacked-stone cairn of ${v.n} flat stones tapering to a small cap stone.`, build: cairn, vs: [
  ['5 stones, 36 in', 24, 24, 36, 0, { seed: 4, n: 5 }], ['8 stones, 60 in', 36, 36, 60, 0, { seed: 9, n: 8 }], ['12 stones, 90 in', 52, 52, 90, 0, { seed: 15, n: 12 }] ] });

/** Stepping stones: a row of flat irregular stones. */
function stepping(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), n = v.n;
  for (let i = 0; i < n; i++) { const f = (i + 0.5) / n, x = cx + (f - 0.5) * W * 0.86, y = cy + m.sin(f * 5 + v.seed) * D * 0.22, rr = 0.075 + R() * 0.03; lump(a, x, y, Z0 + H * 0.4, D * 0.32 + R() * D * 0.05, D * 0.3, H * 0.6, v.seed + i, 0.1, 12, 5, Z0); a.poly(blobPoly(x, y, D * 0.32, D * 0.3, v.seed + i, 12, 0.12), 'EQUIP'); }
  a.log('Added ' + n + ' flat irregular stepping stones in a gently curving line (plan and 3D).');
}
const steps = fam({ cat: 'nature/rocks', title: 'Generic stepping stones', desc: (v) => `Line of ${v.n} flat stepping stones, irregular in outline, set in a gentle curve.`, build: stepping, vs: [
  ['4 stones', 90, 24, 6, 0, { seed: 3, n: 4 }], ['7 stones', 160, 26, 6, 0, { seed: 6, n: 7 }], ['10 stones', 230, 26, 6, 0, { seed: 9, n: 10 }] ] });

/** A rock face: a stratified cliff with ledges, vertical cracks, a talus pile at the foot. */
function cliff(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), ph = [R() * 6, R() * 6, R() * 6];
  const f = (x, y) => { const u = (x - X0) / W, t = (YB - y) / D;  // t=0 at the back wall, 1 at the foot
    const face = H * (1 - t * t * 0.9 - 0.06 * m.sin(u * 9 + ph[0]) - 0.04 * m.sin(u * 23 + ph[1])), steps = H * 0.07 * m.floor(face / (H * 0.07));
    return m.max(0, steps + H * 0.012 * m.sin(u * 40 + ph[2])) * (0.96 + 0.04 * m.sin(u * 5)) + 0; };
  field(a, X0, X1, YF, YB, 44, 14, f, Z0);
  for (let i = 0; i < 5; i++) { const x = X0 + W * (0.1 + 0.8 * R()); a.line(x, YB, x + 20, YF + D * 0.4, 'EQUIP-DETAIL'); }
  for (let i = 0; i < v.talus; i++) { const x = X0 + W * (0.05 + 0.9 * R()), y = YF + D * (0.05 + 0.2 * R()), s = 0.025 + R() * 0.03; lump(a, x, y, Z0 + H * s * 0.4, W * s * 0.5, W * s * 0.5, H * s, v.seed + i, 0.25, 8, 5, Z0); }
  a.poly([[X0, YB], [X1, YB], [X1, YF + D * 0.35], [cx + W * 0.2, YF + D * 0.05], [cx - W * 0.25, YF + D * 0.2], [X0, YF + D * 0.3]], 'EQUIP');
  for (const t of [0.25, 0.5, 0.75]) a.line(X0, YB - D * t * 0.7, X1, YB - D * t * 0.7, 'EQUIP-DETAIL');
  a.log('Added the stratified cliff body with stepped ledges and a leaning profile, crack lines on the plan and a talus scatter at the foot (plan and 3D).');
}
const cliffs = fam({ cat: 'nature/rocks', title: 'Generic cliff face', desc: (v) => `Rock cliff face, ${v.hf} ft high: stepped strata ledges, a leaning face and loose talus at the foot.`, build: cliff, vs: [
  ['10 ft high, 20 ft wide', 240, 96, 120, 0, { seed: 3, hf: 10, talus: 6 }], ['20 ft high, 40 ft wide', 480, 168, 240, 0, { seed: 7, hf: 20, talus: 10 }], ['40 ft high, 70 ft wide', 840, 300, 480, 0, { seed: 12, hf: 40, talus: 14 }] ] });

/** A sand dune: a smooth crescent ridge, with a sharp crest line and ripple lines. */
function dune(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), ph = R() * 6;
  const f = (x, y) => { const u = (x - cx) / (W / 2), t = (cy - y) / (D / 2);   // crescent: crest arcs back at the ends
    const crest = -D * 0.12 * u * u + D * 0.05, d = (y - cy - crest) / (D * 0.5);
    const along = m.max(0, 1 - u * u), prof = d < 0 ? m.exp(-(d * d) * 5) : m.exp(-(d * d) * 16);   // gentle windward, steep lee
    return H * along * prof * (1 + 0.04 * m.sin(u * 13 + ph) ) + 6 * m.sin(y * 0.03 + u * 3 + ph) * along; };
  field(a, X0, X1, YF, YB, 40, 20, f, Z0);
  a.poly(blobPoly(cx, cy, W * 0.5, D * 0.48, v.seed, 30, 0.06), 'EQUIP'); a.arc(cx, cy + D * 0.6, D * 0.58, 200, 340, 'EQUIP-DETAIL');
  for (let i = 1; i < 5; i++) a.arc(cx, cy + D * 0.6, D * (0.58 - i * 0.08), 215, 325, 'EQUIP-DETAIL');
  a.log('Added the crescent dune body with a gentle windward slope, a steeper lee side and a fading tail, with crest and ripple arcs on the plan (plan and 3D).');
}
const dunes = fam({ cat: 'nature/rocks', title: 'Generic sand dune', desc: (v) => `Crescent sand dune, ${v.hf} ft high: a smooth ridge with a gentle windward face, a steeper lee face and ripples.`, build: dune, vs: [
  ['6 ft high, 40 ft long', 480, 200, 72, 0, { seed: 1, hf: 6 }], ['12 ft high, 80 ft long', 960, 380, 144, 0, { seed: 2, hf: 12 }], ['20 ft high, 120 ft long', 1440, 560, 240, 0, { seed: 3, hf: 20 }] ] });

/** A dry stone wall run: courses of irregular blocks with staggered joints and small face offsets, coping stones along the top, a tapering section. */
function wall(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), rows = v.rows, rh = (H - 36) / rows;
  for (let r = 0; r < rows; r++) {
    const inset = (r / rows) * D * 0.16, z = Z0 + r * rh;
    let x = X0 + (r % 2 ? rh * 0.6 : 0);
    if (r % 2) a.box(X0, YF + inset + R() * 8, z, x - 3, YB - inset - R() * 8, z + rh - 3);
    while (x < X1 - 4) {
      const sw = rh * (1.1 + R() * 1.3), x1 = m.min(X1, x + sw), eo = R() * 10;
      a.box(x, YF + inset + R() * 10, z + R() * 4, x1 - 3, YB - inset - eo, z + rh - 3 - R() * 6);
      x = x1;
    }
  }
  let x = X0;
  while (x < X1 - 6) { const sw = rh * (1.4 + R() * 1.0), x1 = m.min(X1, x + sw); a.box(x, YF + D * 0.1, Z1 - 36, x1 - 3, YB - D * 0.1, Z1 - 4 - R() * 10); x = x1; }
  a.rect(X0, YF, X1, YB, 'EQUIP'); a.rect(X0, YF + D * 0.16, X1, YB - D * 0.16, 'EQUIP-DETAIL');
  const nj = m.round(W / (30 * IN)); for (let k = 1; k < nj; k++) a.line(X0 + k * W / nj, YF, X0 + k * W / nj, YB, 'EQUIP-DETAIL');
  a.log('Added ' + rows + ' courses of irregular dry-laid blocks with staggered joints and small face offsets, a tapering section and coping stones along the top (plan and 3D).');
}
const walls = fam({ cat: 'nature/rocks', title: 'Generic dry stone wall', desc: (v) => `Dry stone wall, ${v.lf} ft long, ${v.hf} ft high: ${v.rows} courses of irregular stones with staggered joints, a tapering section and coping stones.`, build: wall, vs: [
  ['10 ft long, 3 ft high', 120, 18, 36, 0, { seed: 1, rows: 5, lf: 10, hf: 3 }], ['20 ft long, 3 ft high', 240, 18, 36, 0, { seed: 2, rows: 5, lf: 20, hf: 3 }], ['10 ft long, 4 ft high', 120, 22, 48, 0, { seed: 3, rows: 7, lf: 10, hf: 4 }], ['20 ft long, 5 ft high', 240, 24, 60, 0, { seed: 4, rows: 9, lf: 20, hf: 5 }] ] });

// ------------------------------------------------------------------------------------------ trees
/** a tapering trunk with a root flare and bark rings: base radius r0, top radius r1 */
function trunk(a, x, y, z0, z1, r0, r1, lean = [0, 0], seg = 12) {
  a.tube([[x, y, z0], [x, y, z0 + (z1 - z0) * 0.08], [x + lean[0] * 0.4, y + lean[1] * 0.4, z0 + (z1 - z0) * 0.5], [x + lean[0], y + lean[1], z1]], [r0 * 1.5, r0, (r0 + r1) / 2, r1], seg);
}
/** Conifer: a trunk, many drooping tiers of cones, a leader and a few cones. v: tiers */
function conifer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, H } = a, R = rng(v.seed), n = v.tiers, r0 = W / 2 * 0.98, zb = Z0 + H * v.bare, zt = Z1 - H * 0.03;
  trunk(a, cx, cy, Z0, zt - H * 0.04, W * 0.035, W * 0.012, [0, 0], 10);
  for (let i = 0; i < n; i++) {
    const th = (zt - zb) / n * 2.2, f = i / (n - 1 || 1), z = zb + (zt - zb - th * 1.05) * f, rr = r0 * (1 - f * 0.88) * (0.88 + R() * 0.12);
    a.cone(cx, cy, z, z + th, rr, rr * 0.08, 14);   // a drooping tier with its widest edge at the bottom
    a.cone(cx, cy, z - th * 0.12, z, rr * 0.92, rr, 14);   // skirt drop
  }
  a.cone(cx, cy, zt - H * 0.06, Z1, W * 0.025, 0.5, 6);
  for (let k = 0; k < 3; k++) { const th = k / 3 * 6.28 + 1, rr = r0 * 0.5; a.ell(cx + m.cos(th) * rr, cy + m.sin(th) * rr, zb + H * 0.12 + k * H * 0.08, W * 0.012, W * 0.012, W * 0.022, 6, 4); }
  a.circ(cx, cy, r0, 'EQUIP'); a.circ(cx, cy, r0 * 0.62, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.035, 'EQUIP-DETAIL'); a.circ(cx, cy, r0 * 0.3, 'EQUIP-DETAIL');
  a.log('Added the trunk, ' + n + ' overlapping drooping tiers of conifer foliage narrowing to a leader, and a few cones (plan and 3D).');
}
const conifers = fam({ cat: 'nature/trees', title: 'Generic layered conifer', desc: (v) => `Evergreen conifer, ${v.hf} ft: trunk, ${v.tiers} overlapping drooping foliage tiers narrowing to a leader, and a few cones.`, build: conifer, vs: [
  ['8 ft, narrow', 60, 60, 96, 0, { seed: 1, tiers: 6, bare: 0.1, hf: 8 }], ['15 ft', 108, 108, 180, 0, { seed: 2, tiers: 8, bare: 0.1, hf: 15 }], ['25 ft', 156, 156, 300, 0, { seed: 3, tiers: 10, bare: 0.12, hf: 25 }], ['40 ft, high crown', 216, 216, 480, 0, { seed: 4, tiers: 12, bare: 0.22, hf: 40 }], ['60 ft, forest', 276, 276, 720, 0, { seed: 5, tiers: 14, bare: 0.3, hf: 60 }] ] });

/** Broadleaf tree: a flared trunk, forking limbs and a crown of many leaf masses. v: crown */
function broadleaf(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, H } = a, R = rng(v.seed), zc = Z0 + H * v.bare, cr = W / 2 * 0.96;
  trunk(a, cx, cy, Z0, zc + H * 0.12, W * 0.04, W * 0.026, [W * 0.015, 0], 12);
  for (let i = 0; i < 4; i++) { const th = i / 4 * 6.28 + 0.6; a.tube([[cx, cy, Z0 + H * 0.03], [cx + m.cos(th) * W * 0.06, cy + m.sin(th) * W * 0.06, Z0 + 4]], [W * 0.014, W * 0.008], 6); }   // roots
  const nl = v.limbs;
  for (let i = 0; i < nl; i++) {
    const th = i / nl * 6.28 + R(), up = 0.55 + R() * 0.3, reach = cr * (0.4 + R() * 0.35), zz = zc + H * (0.04 + 0.12 * R());
    a.tube([[cx, cy, zz], [cx + m.cos(th) * reach * 0.5, cy + m.sin(th) * reach * 0.5, zz + (Z1 - zz) * up * 0.35], [cx + m.cos(th) * reach, cy + m.sin(th) * reach, zz + (Z1 - zz) * up * 0.6]], [W * 0.018, W * 0.012, W * 0.006], 6);
  }
  const nb = v.blobs, zm = zc + (Z1 - zc) * 0.52, vr = (Z1 - zc) * 0.3;
  for (let i = 0; i < nb; i++) {
    const th = i < 1 ? 0 : R() * 6.28, f = i < 1 ? 0 : m.sqrt(R()) * 1.15, hz = (R() - 0.5) * 2;
    const bx = cx + m.cos(th) * cr * 0.58 * f, by = cy + m.sin(th) * cr * 0.58 * f, bz = zm + hz * vr * m.sqrt(m.max(0, 1 - f * f)) * 0.9, s = cr * (0.38 + R() * 0.1);
    lump(a, bx, by, bz, s, s, s * 0.82, v.seed + i * 7, 0.16, 12, 7, Z0 + H * 0.2);
  }
  a.poly(blobPoly(cx, cy, cr, cr, v.seed, 28, 0.1), 'EQUIP'); a.poly(blobPoly(cx, cy, cr * 0.7, cr * 0.7, v.seed + 3, 20, 0.14), 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.04, 'EQUIP-DETAIL');
  a.log('Added the flared trunk with surface roots, ' + nl + ' forking limbs and a crown of ' + nb + ' clustered leaf masses (plan and 3D).');
}
const broadleaves = fam({ cat: 'nature/trees', title: 'Generic broadleaf tree', desc: (v) => `Broadleaf shade tree, ${v.hf} ft: flared trunk with surface roots, ${v.limbs} forking limbs and a rounded crown built from ${v.blobs} leaf masses.`, build: broadleaf, vs: [
  ['12 ft, young', 96, 96, 144, 0, { seed: 1, bare: 0.28, limbs: 4, blobs: 7, hf: 12 }], ['20 ft', 168, 168, 240, 0, { seed: 2, bare: 0.3, limbs: 5, blobs: 9, hf: 20 }], ['30 ft', 252, 252, 360, 0, { seed: 3, bare: 0.3, limbs: 6, blobs: 11, hf: 30 }], ['45 ft, spreading', 420, 420, 540, 0, { seed: 4, bare: 0.28, limbs: 7, blobs: 13, hf: 45 }], ['60 ft, mature', 540, 540, 720, 0, { seed: 5, bare: 0.3, limbs: 8, blobs: 15, hf: 60 }] ] });

/** Palm: a curved ringed trunk, a crown of arching fronds with leaflets, and a cluster of fruit. v: fronds, lean */
function palm(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, H } = a, R = rng(v.seed), n = v.fronds, th0 = v.lean, lx = m.cos(th0) * W * 0.12, ly = m.sin(th0) * W * 0.12, zt = Z1 - H * 0.12;
  const pts = Array.from({ length: 7 }, (_, i) => { const f = i / 6; return [cx - lx * 0.5 + lx * f * f * 1.0, cy - ly * 0.5 + ly * f * f * 1.0, Z0 + (zt - Z0) * f]; });
  a.tube(pts, pts.map((p, i) => W * (0.034 - i * 0.0025)), 10);
  a.cone(cx - lx * 0.5, cy - ly * 0.5, Z0, Z0 + H * 0.06, W * 0.06, W * 0.034, 10);
  for (let i = 1; i < 14; i++) { const f = i / 14, k = f * 6, j = m.min(5, m.floor(k)), t = k - j, p = [pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t, pts[j][2] + (pts[j + 1][2] - pts[j][2]) * t]; a.cyl(p[0], p[1], p[2] - 6, p[2] + 6, W * (0.036 - f * 0.012), 10); }   // trunk rings
  const top = pts[6], tx = top[0], ty = top[1];
  a.ell(tx, ty, zt - 20, W * 0.045, W * 0.045, H * 0.05, 10, 6);   // crown shaft bulge
  for (let i = 0; i < n; i++) {
    const th = i / n * 6.28 + R() * 0.4, len = W * (0.4 + R() * 0.07), dz = H * (0.1 + R() * 0.06), up = H * (0.05 + R() * 0.05);
    const c = [[tx, ty, zt], [tx + m.cos(th) * len * 0.4, ty + m.sin(th) * len * 0.4, zt + up], [tx + m.cos(th) * len * 0.75, ty + m.sin(th) * len * 0.75, zt + up * 0.6], [tx + m.cos(th) * len, ty + m.sin(th) * len, zt - dz]];
    a.tube(c, [W * 0.008, W * 0.006, W * 0.004, W * 0.002], 5);
    const bl = [c[0], c[1], c[2], c[3]].map((p, q) => [p[0], p[1], p[2] - (q ? H * 0.012 : 0)]);
    a.tube([bl[1], [(c[1][0] + c[2][0]) / 2, (c[1][1] + c[2][1]) / 2, (c[1][2] + c[2][2]) / 2 - H * 0.02], c[2], c[3]], [W * 0.012, W * 0.028, W * 0.022, W * 0.003], 6);   // leaf blade
  }
  for (let k = 0; k < 4; k++) { const th = k / 4 * 6.28; a.ell(tx + m.cos(th) * W * 0.04, ty + m.sin(th) * W * 0.04, zt - H * 0.05, W * 0.018, W * 0.018, W * 0.022, 6, 4); }
  a.circ(cx - lx * 0.5, cy - ly * 0.5, W * 0.034, 'EQUIP-DETAIL'); a.circ(tx, ty, W * 0.5, 'EQUIP'); a.circ(tx, ty, W * 0.25, 'EQUIP-DETAIL'); a.line(cx - lx * 0.5, cy - ly * 0.5, tx, ty, 'EQUIP-DETAIL');
  for (let i = 0; i < n; i++) a.line(tx, ty, tx + m.cos(i / n * 6.28) * W * 0.46, ty + m.sin(i / n * 6.28) * W * 0.46, 'EQUIP-DETAIL');
  a.log('Added the curved ringed trunk with a flared base, ' + n + ' arching fronds with paired leaflets, the crown bulge and a fruit cluster (plan and 3D).');
}
const palms = fam({ cat: 'nature/trees', title: 'Generic curved-trunk palm', desc: (v) => `Palm tree, ${v.hf} ft: gently curved ringed trunk with a flared base, ${v.fronds} arching fronds with leaflets and a fruit cluster under the crown.`, build: palm, vs: [
  ['8 ft, young', 108, 108, 96, 0, { seed: 1, fronds: 9, lean: 0.6, hf: 8 }], ['15 ft', 168, 168, 180, 0, { seed: 2, fronds: 11, lean: 2.1, hf: 15 }], ['25 ft', 216, 216, 300, 0, { seed: 3, fronds: 13, lean: 3.4, hf: 25 }], ['40 ft, tall', 264, 264, 480, 0, { seed: 4, fronds: 15, lean: 5, hf: 40 }] ] });

/** Shrub: many lumpy masses over a few stems, with a mulch pad. */
function shrub(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed);
  a.cyl(cx, cy, Z0, Z0 + 5, W * 0.46, 20);
  for (let i = 0; i < 5; i++) { const th = i / 5 * 6.28; a.tube([[cx, cy, Z0 + 4], [cx + m.cos(th) * W * 0.12, cy + m.sin(th) * D * 0.12, Z0 + H * 0.3]], [W * 0.018, W * 0.008], 5); }
  for (let i = 0; i < v.n; i++) { const th = R() * 6.28, f = m.sqrt(R()) * 0.55, s = 0.26 + R() * 0.12; lump(a, cx + m.cos(th) * W * f * 0.5, cy + m.sin(th) * D * f * 0.5, Z0 + H * (0.38 + (1 - f) * 0.2 + R() * 0.12), W * s, D * s, H * s * 1.05, v.seed + i, 0.18, 10, 6, Z0 + 4); }
  a.poly(blobPoly(cx, cy, W * 0.46, D * 0.46, v.seed, 24, 0.12), 'EQUIP'); a.poly(blobPoly(cx, cy, W * 0.3, D * 0.3, v.seed + 2, 16, 0.14), 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.03, 'EQUIP-DETAIL');
  a.log('Added a mulch pad, five stems and ' + v.n + ' overlapping leafy masses forming a rounded shrub (plan and 3D).');
}
const shrubs = fam({ cat: 'nature/trees', title: 'Generic round shrub', desc: (v) => `Rounded shrub, ${v.hf} ft: mulch pad, five stems and ${v.n} overlapping leafy masses.`, build: shrub, vs: [
  ['2 ft', 28, 28, 26, 0, { seed: 1, n: 5, hf: 2 }], ['4 ft', 54, 54, 50, 0, { seed: 2, n: 7, hf: 4 }], ['6 ft, tall', 72, 72, 76, 0, { seed: 3, n: 9, hf: 6 }] ] });

/** Hedge: a clipped rounded-top run, with a visible stem base, in a trimmed profile and a few leaf bands. */
function hedge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, hw = D / 2, wl = H * 0.88;
  // the profile above is in (y, z); extrude along x using prismX
  prismX(a, [[-hw * 0.8, Z0 + 6], [hw * 0.8, Z0 + 6], [hw, Z0 + H * 0.3], [hw, wl], [hw * 0.5, Z1 - 2], [-hw * 0.5, Z1 - 2], [-hw, wl], [-hw, Z0 + H * 0.3]].map(([y, z]) => [cy + y, z]), X0 + 4, X1 - 4);
  const nb = m.round(W / 18 / IN); for (let i = 0; i < nb; i++) { const x = X0 + 4 + (i + 0.5) * (W - 8) / nb; a.cyl(x, cy, Z0, Z0 + H * 0.2, 14, 6); }
  for (let k = 1; k < 4; k++) a.box(X0 + 2, cy - hw - 3, Z0 + H * k * 0.24, X1 - 2, cy - hw + 3 + 0, Z0 + H * k * 0.24 + 8);
  a.rect(X0 + 4, YF, X1 - 4, YB, 'EQUIP'); a.line(X0 + 4, cy, X1 - 4, cy, 'EQUIP-DETAIL');
  a.log('Added the clipped hedge body with a tapering profile and rounded top, stem bases along the foot and trimmed leaf bands (plan and 3D).');
}
const hedges = fam({ cat: 'nature/trees', title: 'Generic clipped hedge', desc: (v) => `Clipped hedge run, ${v.lf} ft long and ${v.hf} ft high: tapering sides with a rounded top, stem bases at the foot and trimmed bands.`, build: hedge, vs: [
  ['6 ft long, 3 ft high', 72, 24, 36, 0, { lf: 6, hf: 3 }], ['10 ft long, 5 ft high', 120, 30, 60, 0, { lf: 10, hf: 5 }], ['16 ft long, 8 ft high, screen', 192, 40, 96, 0, { lf: 16, hf: 8 }] ] });

/** Stump: a cut trunk with root flare, growth rings on top, bark ridges and a bevelled edge. */
function stump(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, r = W / 2 * 0.74;
  a.tube([[cx, cy, Z0], [cx, cy, Z0 + H * 0.2], [cx, cy, Z1 - 6]], [r * 1.34, r * 1.02, r], 18);
  for (let i = 0; i < 6; i++) { const th = i / 6 * 6.28 + 0.4; a.tube([[cx + m.cos(th) * r * 0.5, cy + m.sin(th) * r * 0.5, Z0 + H * 0.25], [cx + m.cos(th) * W * 0.49, cy + m.sin(th) * W * 0.49, Z0 + 4]], [r * 0.2, r * 0.12], 6); }   // roots
  for (let i = 0; i < 16; i++) { const th = i / 16 * 6.28; a.box(cx + m.cos(th) * r - 5, cy + m.sin(th) * r - 5, Z0 + H * 0.28, cx + m.cos(th) * r + 5, cy + m.sin(th) * r + 5, Z1 - 8); }
  a.cyl(cx, cy, Z1 - 6, Z1, r * 0.98, 18); for (const f of [0.3, 0.55, 0.78]) a.cyl(cx, cy, Z1 - 7, Z1 + 0.01, r * f, 24);
  if (v.hollow) { a.cyl(cx + r * 0.15, cy, Z1 - 4, Z1 - 4.5, 1, 3); }
  a.circ(cx, cy, W * 0.49, 'EQUIP-DETAIL'); a.circ(cx, cy, r, 'EQUIP'); for (const f of [0.3, 0.55, 0.78]) a.circ(cx, cy, r * f, 'EQUIP-DETAIL');
  a.log('Added the cut trunk with a flared base, six surface roots, bark ridges and the sawn top with growth rings (plan and 3D).');
}
const stumps = fam({ cat: 'nature/trees', title: 'Generic tree stump', desc: (v) => `Tree stump, ${v.df} in across: flared base, six surface roots, bark ridges and a sawn top showing growth rings.`, build: stump, vs: [
  ['16 in across, 14 in high', 22, 22, 14, 0, { df: 16 }], ['36 in across, 24 in high', 46, 46, 24, 0, { df: 36 }] ] });

/** A fallen log: a bark cylinder with end rings, knots and a broken branch stub; or a stacked pile of logs. v.pile = rows (0 for a single log) */
function logs(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed);
  const one = (y, z, r, x0, x1) => {
    a.xcyl(x0, x1, y, z, r, 14);
    for (const x of [x0, x1]) { a.xcyl(x - 0, x + (x === x0 ? 4 : -4), y, z, r * 0.98, 14); for (const f of [0.35, 0.65]) a.xcyl(x, x + (x === x0 ? 5 : -5), y, z, r * f, 14); }
    const nk = m.max(1, m.round((x1 - x0) / (r * 5))); for (let i = 0; i < nk; i++) { const x = x0 + (x1 - x0) * (i + R()) / nk; a.cyl(x, y, z + r * 0.9, z + r * 1.12, r * 0.12, 6); }
    a.rect(x0, y - r, x1, y + r, 'EQUIP'); a.line(x0, y, x1, y, 'EQUIP-DETAIL'); a.circ(x0 + 4, y, r * 0.5, 'EQUIP-DETAIL');
  };
  if (!v.pile) { const r = D * 0.45; one(cy, Z0 + r, r, X0 + 4, X1 - 4); a.tube([[cx + W * 0.1, cy, Z0 + r * 1.6], [cx + W * 0.13, cy - r * 1.2, Z0 + r * 2.1]], [r * 0.12, r * 0.07], 6); }
  else {
    const rows = v.pile, r = H / (rows * 1.8 + 0.2) / 1.0 * 0.95 * 1.0; const rr = D / (rows * 2 + 0) * 0.9 > 0 ? m.min(D / (rows * 2), H / (1 + 1.732 * (rows - 1) + 0) / 1) : 0;
    const rad = m.min(D / (2 * rows), H / (2 + 1.732 * (rows - 1)));
    for (let row = 0; row < rows; row++) for (let k = 0; k < rows - row; k++) { const y = cy + (k - (rows - row - 1) / 2) * rad * 2.04, z = Z0 + rad + row * rad * 1.78; one(y, z, rad, X0 + 4 + R() * 40, X1 - 4 - R() * 40); }
    a.rect(X0 + 4, YF, X1 - 4, YB, 'EQUIP-DETAIL');
  }
  a.log(v.pile ? 'Added a triangular pile of ' + (v.pile * (v.pile + 1) / 2) + ' logs with end grain rings and bark knots (plan and 3D).' : 'Added the bark cylinder with end grain rings, knots and a broken branch stub (plan and 3D).');
}
const logsF = fam({ cat: 'nature/trees', title: 'Generic fallen log', desc: (v) => v.pile ? `Triangular pile of ${v.pile * (v.pile + 1) / 2} logs, ${v.lf} ft long, each with end grain rings and bark knots.` : `Fallen log, ${v.lf} ft long: bark cylinder with end grain rings, knots and a broken branch stub.`, build: logs, vs: [
  ['single, 8 ft', 96, 20, 20, 0, { seed: 1, pile: 0, lf: 8 }], ['pile of 6, 6 ft', 72, 40, 34, 0, { seed: 3, pile: 3, lf: 6 }], ['pile of 15, 8 ft', 96, 66, 56, 0, { seed: 4, pile: 5, lf: 8 }] ] });

// ------------------------------------------------------------------------------------------ water
/** A garden pond: a heightfield with a bank rim, a sunken water surface, rocks and lily pads around and on it. */
function pond(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), pl = Z0 + H * 0.45, ph = [R() * 6, R() * 6];
  const sh = (x, y) => { const u = (x - cx) / (W / 2), t = (y - cy) / (D / 2), r = m.sqrt(u * u + t * t) * (1 + 0.1 * m.sin(3 * m.atan2(t, u) + ph[0]) + 0.06 * m.sin(5 * m.atan2(t, u) + ph[1])); return r; };
  field(a, X0, X1, YF, YB, 36, 28, (x, y) => { const r = sh(x, y); return r < 0.62 ? Z0 + H * 0.12 + (r / 0.62) * (r / 0.62) * H * 0.3 : r < 0.84 ? Z0 + H * 0.42 + (r - 0.62) / 0.22 * H * 0.5 : Z0 + H * (0.92 + 0.08 * m.sin(x * 0.01 + y * 0.013 + ph[0])) - (r > 0.97 ? (r - 0.97) * H * 3 : 0); }, Z0);
  field(a, cx - W * 0.44, cx + W * 0.44, cy - D * 0.44, cy + D * 0.44, 22, 18, (x, y) => (sh(x, y) < 0.64 ? pl : Z0 - 50), Z0 + H * 0.3);   // the water sheet (only inside the pool)
  for (let i = 0; i < v.rocks; i++) { const th = i / v.rocks * 6.28 + R() * 0.3, rr = 0.64 + R() * 0.05, x = cx + m.cos(th) * W * rr * 0.5, y = cy + m.sin(th) * D * rr * 0.5, s = 0.035 + R() * 0.03; lump(a, x, y, Z0 + H * 0.55, W * s, W * s, H * 0.22, v.seed + i, 0.25, 8, 5, Z0 + H * 0.4); }
  for (let i = 0; i < v.pads; i++) { const th = R() * 6.28, f = m.sqrt(R()) * 0.5, x = cx + m.cos(th) * W * 0.5 * f * 0.9, y = cy + m.sin(th) * D * 0.5 * f * 0.9; a.cyl(x, y, pl, pl + 5, W * 0.03, 10); a.circ(x, y, W * 0.03, 'EQUIP-DETAIL'); }
  a.poly(blobPoly(cx, cy, W * 0.5, D * 0.5, v.seed, 34, 0.06), 'EQUIP'); a.poly(blobPoly(cx, cy, W * 0.31, D * 0.31, v.seed + 1, 26, 0.1), 'EQUIP-DETAIL');
  a.log('Added the sloping bank rim, the sunken pool with a water sheet, ' + v.rocks + ' edge rocks and ' + v.pads + ' lily pads (plan and 3D).');
}
const ponds = fam({ cat: 'nature/water', title: 'Generic garden pond', desc: (v) => `Garden pond, ${v.wf} by ${v.lf} ft: bank rim sloping into a sunken pool with a water sheet, ${v.rocks} edge rocks and ${v.pads} lily pads.`, build: pond, vs: [
  ['8 x 6 ft', 96, 72, 20, 0, { seed: 1, rocks: 8, pads: 4, wf: 8, lf: 6 }], ['14 x 10 ft', 168, 120, 28, 0, { seed: 2, rocks: 12, pads: 7, wf: 14, lf: 10 }], ['24 x 16 ft', 288, 192, 36, 0, { seed: 3, rocks: 16, pads: 10, wf: 24, lf: 16 }] ] });

/** A stream section: a winding channel cut into banks, with a water sheet, pebbles and edge stones. Flow runs along X. */
function stream(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), ph = R() * 6, wl = Z0 + H * 0.3;
  const ctr = (x) => cy + m.sin((x - X0) / W * 6.28 * v.bends + ph) * D * 0.18, hw = (x) => D * (0.13 + 0.025 * m.sin((x - X0) / W * 19 + ph));
  field(a, X0, X1, YF, YB, 56, 18, (x, y) => { const d = m.abs(y - ctr(x)) / hw(x); const bank = Z0 + H * (0.6 + 0.32 * m.min(1, (d - 1) / 1.5)) + 0.04 * H * m.sin(x * 0.02 + y * 0.03); return d < 1 ? Z0 + H * 0.12 + (d * d) * H * 0.2 : d < 1.35 ? Z0 + H * 0.32 + (d - 1) / 0.35 * H * 0.28 : bank; }, Z0);
  field(a, X0, X1, YF, YB, 56, 18, (x, y) => (m.abs(y - ctr(x)) < hw(x) * 0.96 ? wl : Z0 - 60), Z0 + H * 0.2);   // the water sheet
  for (let i = 0; i < v.stones; i++) { const x = X0 + W * (0.04 + 0.92 * R()), side = R() < 0.5 ? -1 : 1, y = ctr(x) + side * hw(x) * (0.85 + R() * 0.3), s = 0.012 + R() * 0.012; lump(a, x, y, wl + H * 0.08, W * s, W * s * 0.8, H * 0.18, v.seed + i, 0.25, 8, 5, wl - 4); }
  const pts = Array.from({ length: 41 }, (_, i) => [X0 + W * i / 40, ctr(X0 + W * i / 40)]);
  a.poly([...pts.map(([x, y]) => [x, y - hw(x)]), ...pts.slice().reverse().map(([x, y]) => [x, y + hw(x)])], 'EQUIP'); for (let i = 0; i < 40; i += 1) a.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 'EQUIP-DETAIL');
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.log('Added the banks with a winding cut channel, the water sheet along the channel and ' + v.stones + ' edge stones, with the flow line on the plan (plan and 3D).');
}
const streams = fam({ cat: 'nature/water', title: 'Generic stream section', desc: (v) => `Winding stream section, ${v.lf} ft long: banks with a cut channel, a water sheet down the channel and ${v.stones} edge stones. Flow runs along the length.`, build: stream, vs: [
  ['10 ft long', 120, 60, 14, 0, { seed: 1, bends: 1, stones: 8, lf: 10 }], ['20 ft long', 240, 84, 18, 0, { seed: 2, bends: 1.6, stones: 14, lf: 20 }], ['40 ft long', 480, 120, 24, 0, { seed: 3, bends: 2.4, stones: 24, lf: 40 }] ] });

/** A stepped waterfall: a rock face cut into tiers, falling water sheets, a plunge pool at the foot with rocks. */
function waterfall(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), n = v.tiers, ph = R() * 6;
  const tierH = H * 0.9 / n;
  const stepAt = (t) => m.floor(t * n * 0.999);   // t = 0 at the pool, 1 at the top
  field(a, X0, X1, YF, YB, 40, 22, (x, y) => { const u = (x - X0) / W, t = (YB - y) / D * 1.0; const tt = 1 - t; const face = tt * tt * 0 + (m.max(0, 1 - tt)) ; const level = m.max(0, m.min(0.999, (tt - 0.25) / 0.7)); const s = m.floor(level * n); return Z0 + H * 0.12 + s * tierH + 0.03 * H * m.sin(u * 17 + ph + s) + (tt > 0.95 ? H * 0.02 : 0); }, Z0);
  // water sheets down each riser, in the middle third, and a thin stream across each tier top
  const yk = (k) => -D * (1 - (0.25 + 0.7 * k / n));
  for (let k = 0; k < n - 1; k++) { const yb = yk(k + 1), zt = Z0 + H * 0.12 + (k + 1) * tierH, ye = k + 2 <= n - 1 ? yk(k + 2) : -2; a.box(cx - W * 0.12, yb - 16, zt - tierH, cx + W * 0.12, yb, zt + 6); a.box(cx - W * 0.12, yb, zt, cx + W * 0.12, ye, zt + 8); }
  a.box(cx - W * 0.12, -4 - D * 0.05, Z0 + H * 0.12 + (n - 1) * tierH, cx + W * 0.12, -2, Z0 + H * 0.12 + (n - 1) * tierH + 14);
  field(a, X0 + W * 0.1, X1 - W * 0.1, YF + 4, YF + D * 0.28, 20, 8, (x, y) => (m.abs(x - cx) < W * 0.34 ? Z0 + H * 0.13 : Z0 - 50), Z0 + H * 0.05);   // plunge pool
  for (let i = 0; i < v.rocks; i++) { const th = R() * 3.14, x = cx + m.cos(th) * W * 0.36, y = YF + D * (0.05 + R() * 0.22), s = 0.03 + R() * 0.035; lump(a, x, y, Z0 + H * 0.2, W * s, W * s, H * 0.14, v.seed + i, 0.25, 8, 5, Z0 + H * 0.1); }
  a.rect(X0, YF, X1, YB, 'EQUIP'); a.rect(cx - W * 0.12, yk(1) - 16, cx + W * 0.12, 0, 'EQUIP-DETAIL'); a.ellp(cx, YF + D * 0.16, W * 0.34, D * 0.12, 'EQUIP-DETAIL');
  for (let s = 1; s < n; s++) a.line(X0, yk(s), X1, yk(s), 'EQUIP-DETAIL');
  a.log('Added the stepped rock face with ' + n + ' tiers, a falling water sheet on every tier, the plunge pool and foot rocks (plan and 3D).');
}
const falls = fam({ cat: 'nature/water', title: 'Generic stepped waterfall', desc: (v) => `Stepped rock waterfall, ${v.hf} ft high: ${v.tiers} rock tiers each with a falling water sheet, a plunge pool and rocks at the foot.`, build: waterfall, vs: [
  ['3 ft, 3 tiers', 72, 60, 40, 0, { seed: 1, tiers: 3, rocks: 6, hf: 3 }], ['5 ft, 4 tiers', 108, 84, 64, 0, { seed: 2, tiers: 4, rocks: 9, hf: 5 }], ['8 ft, 6 tiers', 168, 120, 100, 0, { seed: 3, tiers: 6, rocks: 12, hf: 8 }] ] });

/** A tiered fountain: a basin, a pedestal, stacked bowls getting smaller, a finial, jets arcing from the top bowl and rim spouts. */
function fountain(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R0 = W / 2 - 6, n = v.tiers;
  a.cyl(cx, cy, Z0, Z0 + H * 0.07, R0, 32); a.tube([[cx, cy, Z0 + H * 0.07], [cx, cy, Z0 + H * 0.1], [cx, cy, Z0 + H * 0.2]], [R0 * 0.99, R0 * 0.99, R0 * 0.9], 32);   // base and basin wall
  a.tube([[cx, cy, Z0 + H * 0.2], [cx, cy, Z0 + H * 0.23]], [R0 * 0.99, R0 * 1.02], 32);   // coping
  a.cyl(cx, cy, Z0 + H * 0.07, Z0 + H * 0.17, R0 * 0.86, 32);   // water
  let z = Z0 + H * 0.17;
  for (let i = 0; i < n; i++) {
    const f = (i + 1) / (n + 1), rb = R0 * (0.58 - i * (0.42 / n)), zs = Z0 + H * (0.2 + f * 0.6 * (1 - 0.0 * f)), pz0 = i === 0 ? Z0 + H * 0.17 : Z0 + H * (0.2 + (i / (n + 0.0)) * 0.6 * 0.9), pz1 = zs;
    const zp0 = Z0 + H * (0.17 + i * 0.57 / n), zp1 = Z0 + H * (0.17 + (i + 0.65) * 0.57 / n);
    a.tube([[cx, cy, zp0], [cx, cy, zp1]], [rb * 0.2, rb * 0.16], 12);   // stem
    a.tube([[cx, cy, zp1], [cx, cy, zp1 + H * 0.02], [cx, cy, zp1 + H * 0.045]], [rb * 0.3, rb, rb * 1.0], 28);   // bowl lower
    a.tube([[cx, cy, zp1 + H * 0.045], [cx, cy, zp1 + H * 0.06]], [rb * 1.0, rb * 1.06], 28);   // lip
    a.cyl(cx, cy, zp1 + H * 0.045, zp1 + H * 0.052, rb * 0.92, 28);   // water in the bowl
    const ns = 4 + i * 2; for (let k = 0; k < ns; k++) { const th = k / ns * 6.28; a.tube([[cx + m.cos(th) * rb * 1.02, cy + m.sin(th) * rb * 1.02, zp1 + H * 0.03], [cx + m.cos(th) * rb * 1.14, cy + m.sin(th) * rb * 1.14, zp1 + H * 0.01], [cx + m.cos(th) * rb * 1.22, cy + m.sin(th) * rb * 1.22, zp1 - H * 0.04]], [4, 3, 2], 4); }   // water sheets from the lip
    a.circ(cx, cy, rb, i === 0 ? 'EQUIP-DETAIL' : 'EQUIP-DETAIL');
    z = zp1 + H * 0.06;
  }
  a.tube([[cx, cy, z], [cx, cy, z + H * 0.06], [cx, cy, z + H * 0.14]], [R0 * 0.05, R0 * 0.04, R0 * 0.012], 10);   // finial and a central jet
  for (let k = 0; k < 8; k++) { const th = k / 8 * 6.28; a.box(cx + m.cos(th) * R0 - 6, cy + m.sin(th) * R0 - 6, Z0 + H * 0.2, cx + m.cos(th) * R0 + 6, cy + m.sin(th) * R0 + 6, Z0 + H * 0.26); }   // coping studs
  a.circ(cx, cy, R0, 'EQUIP'); a.circ(cx, cy, R0 * 0.86, 'EQUIP-DETAIL'); a.circ(cx, cy, R0 * 0.05, 'EQUIP-DETAIL');
  a.log('Added the round basin with coping and water, ' + n + ' stacked bowls on stems with water sheets over the lips, the finial and the top jets (plan and 3D).');
}
const fountains = fam({ cat: 'nature/water', title: 'Generic tiered fountain', desc: (v) => `Tiered garden fountain, ${v.df} in basin: round basin with coping, ${v.tiers} stacked bowls on stems with water over the lips, a finial and top jets.`, build: fountain, vs: [
  ['2 tier, 36 in basin', 36, 36, 48, 0, { tiers: 2, df: 36 }], ['3 tier, 60 in basin', 60, 60, 84, 0, { tiers: 3, df: 60 }], ['3 tier, 96 in basin', 96, 96, 120, 0, { tiers: 3, df: 96 }], ['4 tier, 144 in basin', 144, 144, 180, 0, { tiers: 4, df: 144 }] ] });

/** A well: a round stone curb, two posts with a crossbeam and winch crank, a gabled roof, a bucket on a rope. v.cover: closed wooden lid instead of the roof/bucket */
function well(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), r = D / 2 * 0.62, ch = H * 0.3, rows = 4;
  for (let k = 0; k < rows; k++) { const n = 14, z = Z0 + k * ch / rows; for (let i = 0; i < n; i++) { const th0 = (i + (k % 2) * 0.5) / n * 6.28, th1 = th0 + 5.8 / n; const x0 = cx + m.cos(th0) * r, y0 = cy + m.sin(th0) * r, x1 = cx + m.cos(th1) * r, y1 = cy + m.sin(th1) * r, xi0 = cx + m.cos(th0) * r * 0.7, yi0 = cy + m.sin(th0) * r * 0.7, xi1 = cx + m.cos(th1) * r * 0.7, yi1 = cy + m.sin(th1) * r * 0.7; a.prism([[x0, y0], [x1, y1], [xi1, yi1], [xi0, yi0]], z, z + ch / rows - 3); } }
  a.tube([[cx, cy, Z0 + ch], [cx, cy, Z0 + ch + 6]], [r * 1.12, r * 1.12], 20);   // cap ring (solid), then the dark bore is represented by a recess ring
  if (!v.cover) {
    for (const s of [-1, 1]) a.tube([[cx + s * r * 1.0, cy, Z0 + ch], [cx + s * r * 1.0, cy, Z1 - H * 0.12]], [W * 0.018, W * 0.018], 8);
    a.tube([[cx - r * 1.1, cy, Z0 + H * 0.62], [cx + r * 1.1, cy, Z0 + H * 0.62]], [W * 0.02, W * 0.02], 8);   // windlass roller
    a.xcyl(cx - r * 1.1, cx + r * 1.1, cy, Z0 + H * 0.62, W * 0.035, 12);
    a.tube([[cx + r * 1.1, cy, Z0 + H * 0.62], [cx + r * 1.5, cy, Z0 + H * 0.62], [cx + r * 1.5, cy - r * 0.4, Z0 + H * 0.62 - r * 0.3]], [10, 10, 10], 5);   // crank
    a.tube([[cx, cy, Z0 + H * 0.62 - W * 0.035], [cx, cy, Z0 + ch + H * 0.18]], [3, 3], 4);   // rope
    a.tube([[cx - r * 0.18, cy, Z0 + ch + H * 0.18], [cx - r * 0.18, cy, Z0 + ch + H * 0.06], [cx + r * 0.18, cy, Z0 + ch + H * 0.06], [cx + r * 0.18, cy, Z0 + ch + H * 0.18]], [3, 3, 3, 3], 4);   // bucket handle
    a.cone(cx, cy, Z0 + ch + H * 0.08, Z0 + ch + H * 0.2, r * 0.22, r * 0.28, 14);   // bucket
    a.tube([[cx - r * 1.2, cy, Z1 - H * 0.12], [cx, cy, Z1 - 4]], [8, 8], 5); a.tube([[cx + r * 1.2, cy, Z1 - H * 0.12], [cx, cy, Z1 - 4]], [8, 8], 5);
    prismY(a, [[cx - r * 1.5, Z1 - H * 0.14], [cx, Z1], [cx + r * 1.5, Z1 - H * 0.14], [cx + r * 1.5, Z1 - H * 0.14 + 6], [cx, Z1 + 0.001 - 12 + 12]].slice(0, 3), cy - r * 0.9, cy + r * 0.9);
    a.box(cx - r * 1.5, cy - r * 0.9, Z1 - H * 0.14 - 6, cx + r * 1.5, cy + r * 0.9, Z1 - H * 0.14);
  } else {
    a.cyl(cx, cy, Z0 + ch + 6, Z0 + ch + 20, r * 0.86, 20); for (let k = 0; k < 5; k++) a.box(cx - r * 0.86, cy - r * 0.8 + k * r * 0.4 - 6, Z0 + ch + 20, cx + r * 0.86, cy - r * 0.8 + k * r * 0.4 + r * 0.4 - 8, Z0 + ch + 28);
    a.cyl(cx + r * 0.5, cy, Z0 + ch + 28, Z0 + ch + 60, 24, 8);
  }
  a.circ(cx, cy, r, 'EQUIP'); a.circ(cx, cy, r * 0.7, 'EQUIP-DETAIL'); if (!v.cover) { a.rect(cx - r * 1.5, cy - r * 0.9, cx + r * 1.5, cy + r * 0.9, 'EQUIP-DETAIL'); a.line(cx - r * 1.1, cy, cx + r * 1.5, cy, 'EQUIP-DETAIL'); }
  a.log(v.cover ? 'Added the round stone curb with a wooden board lid and a small handle (plan and 3D).' : 'Added the stone curb in staggered blocks, two posts with a windlass roller and crank, a gabled roof, the rope and a bucket (plan and 3D).');
}
const wells = fam({ cat: 'nature/water', title: 'Generic stone well', desc: (v) => v.cover ? `Stone well, ${v.df} in curb: round stone curb in staggered blocks with a wooden board lid and a handle.` : `Stone well, ${v.df} in curb: round curb in staggered blocks, two posts with a windlass roller and crank, a gabled roof, a rope and a bucket.`, build: well, vs: [
  ['covered, 36 in curb', 44, 44, 38, 0, { seed: 1, cover: true, df: 36 }], ['with roof, 42 in curb', 76, 50, 110, 0, { seed: 2, cover: false, df: 42 }], ['with roof, 60 in curb', 108, 72, 150, 0, { seed: 3, cover: false, df: 60 }] ] });

/** A clump of reeds: tall tapering blades arching outwards, with cattail-style seed heads on some stems. */
function reeds(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed);
  a.poly(blobPoly(cx, cy, W * 0.48, D * 0.48, v.seed, 18, 0.15), 'EQUIP');
  a.cyl(cx, cy, Z0, Z0 + 20, W * 0.46, 16);   // mud pad
  for (let i = 0; i < v.n; i++) {
    const th = R() * 6.28, f = m.sqrt(R()) * 0.6, x = cx + m.cos(th) * W * 0.5 * f, y = cy + m.sin(th) * D * 0.5 * f, h = H * (0.62 + R() * 0.36), lean = (0.05 + R() * 0.12) * W, ph = R() * 6.28;
    const tip = [x + m.cos(ph) * lean, y + m.sin(ph) * lean, Z0 + h];
    a.tube([[x, y, Z0 + 15], [x + m.cos(ph) * lean * 0.2, y + m.sin(ph) * lean * 0.2, Z0 + h * 0.5], tip], [W * 0.007, W * 0.005, W * 0.0012], 4);
    a.circ(x, y, W * 0.007, 'EQUIP-DETAIL');
    if (i % 5 === 2) { const hz = Z0 + h * 0.84; a.tube([[x + m.cos(ph) * lean * 0.7, y + m.sin(ph) * lean * 0.7, hz - H * 0.06], [x + m.cos(ph) * lean * 0.8, y + m.sin(ph) * lean * 0.8, hz + H * 0.06]], [W * 0.011, W * 0.011], 6); }
  }
  a.log('Added a mud pad and ' + v.n + ' tapering reed stems arching outwards, with seed heads on some stems (plan and 3D).');
}
const reedsF = fam({ cat: 'nature/water', title: 'Generic reed clump', desc: (v) => `Reed clump, ${v.hf} ft tall: ${v.n} tapering stems arching outwards from a mud pad, some with cattail seed heads.`, build: reeds, vs: [
  ['3 ft tall', 24, 24, 36, 0, { seed: 1, n: 30, hf: 3 }], ['5 ft tall', 40, 40, 60, 0, { seed: 2, n: 48, hf: 5 }], ['7 ft tall, large', 60, 60, 84, 0, { seed: 3, n: 70, hf: 7 }] ] });

/** A bird bath: a stone pedestal with a plinth base, a shaped column, a shallow bowl with water and a rim. */
function birdbath(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, br = W / 2 - 4;
  a.cyl(cx, cy, Z0, Z0 + H * 0.08, br * 0.5, 20); a.cone(cx, cy, Z0 + H * 0.08, Z0 + H * 0.16, br * 0.45, br * 0.2, 16);
  a.tube([[cx, cy, Z0 + H * 0.16], [cx, cy, Z0 + H * 0.35], [cx, cy, Z0 + H * 0.6], [cx, cy, Z0 + H * 0.78]], [br * 0.2, br * 0.13, br * 0.17, br * 0.3], 16);
  a.tube([[cx, cy, Z0 + H * 0.78], [cx, cy, Z0 + H * 0.86], [cx, cy, Z0 + H * 0.95], [cx, cy, Z1]], [br * 0.3, br * 0.9, br, br * 1.02], 28);   // bowl
  a.cyl(cx, cy, Z1 - 20, Z1 - 12, br * 0.9, 28);   // water
  for (let k = 0; k < 8; k++) { const th = k / 8 * 6.28; a.ell(cx + m.cos(th) * br * 0.98, cy + m.sin(th) * br * 0.98, Z1, br * 0.05, br * 0.05, br * 0.04, 6, 4); }
  a.circ(cx, cy, br, 'EQUIP'); a.circ(cx, cy, br * 0.9, 'EQUIP-DETAIL'); a.circ(cx, cy, br * 0.5, 'EQUIP-DETAIL');
  a.log('Added the plinth, the turned pedestal column, the shallow bowl with a water surface and rim studs (plan and 3D).');
}
const baths = fam({ cat: 'nature/water', title: 'Generic bird bath', desc: (v) => `Bird bath, ${v.hf} in tall: plinth, turned pedestal column and a shallow bowl with water and a studded rim.`, build: birdbath, vs: [
  ['24 in tall, 18 in bowl', 20, 20, 24, 0, { hf: 24 }], ['34 in tall, 24 in bowl', 26, 26, 34, 0, { hf: 34 }] ] });

/** A pond dock: a decking platform on posts with rails, a ladder and a mooring cleat, projecting over the water. */
function dock(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, dz = Z0 + H * 0.5, nb = m.round(D / (6 * IN)), np = m.max(2, m.round(D / (96 * IN)) + 1);
  for (let i = 0; i < nb; i++) a.box(X0, YF + 4 + i * (D - 8) / nb, dz, X1, YF + 4 + (i + 1) * (D - 8) / nb - 6, dz + 36);   // deck boards across the width... running along Y
  for (const x of [X0 + 30, X1 - 30]) a.box(x - 30, YF, dz - 120, x + 30, YB, dz);   // bearers
  for (let i = 0; i < np; i++) for (const x of [X0 + 30, X1 - 30]) { const y = YF + 40 + i * (D - 80) / (np - 1); a.tube([[x, y, Z0], [x, y, dz]], [34, 34], 8); a.circ(x, y, 34, 'EQUIP-DETAIL'); }
  if (v.rails) for (const x of [X0 + 20, X1 - 20]) { a.tube([[x, YF + 20, dz + H * 0.4], [x, YB - 20, dz + H * 0.4]], [14, 14], 6); for (let i = 0; i < np * 2 - 1; i++) { const y = YF + 40 + i * (D - 80) / (np * 2 - 2); a.tube([[x, y, dz + 36], [x, y, dz + H * 0.4]], [14, 14], 6); } a.tube([[x, YF + 20, dz + H * 0.2], [x, YB - 20, dz + H * 0.2]], [8, 8], 4); }
  const ladX = X1 - 20; a.tube([[ladX, YF + 120, dz + 36], [ladX, YF + 120, Z0 + 4]], [10, 10], 5); a.tube([[ladX - 260, YF + 120, dz + 36], [ladX - 260, YF + 120, Z0 + 4]], [10, 10], 5); for (let i = 0; i < 4; i++) a.box(ladX - 260, YF + 112, dz - i * H * 0.1 - 20, ladX, YF + 128, dz - i * H * 0.1 - 8);
  a.cyl(cx, YB - 100, dz + 36, dz + 76, 24, 8); a.box(cx - 70, YB - 120, dz + 76, cx + 70, YB - 80, dz + 100);   // cleat
  a.rect(X0, YF, X1, YB, 'EQUIP'); for (let i = 1; i < 12; i++) a.line(X0, YF + i * D / 12, X1, YF + i * D / 12, 'EQUIP-DETAIL');
  a.log('Added the plank deck on bearers and round posts' + (v.rails ? ', side rails with a mid rail' : '') + ', a hand ladder into the water and a mooring cleat (plan and 3D).');
}
const docks = fam({ cat: 'nature/water', title: 'Generic pond dock', desc: (v) => `Small pond dock, ${v.lf} ft long: plank deck on bearers and round posts${v.rails ? ', side rails' : ''}, a hand ladder into the water and a mooring cleat.`, build: dock, vs: [
  ['6 x 12 ft, open', 72, 144, 30, 0, { rails: false, lf: 12 }], ['6 x 20 ft, with rails', 72, 240, 60, 0, { rails: true, lf: 20 }] ] });

/** A rock bubbler: a natural boulder with a drilled bore, a basin of pebbles around, a spout and water streaming down. */
function bubbler(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed);
  a.cyl(cx, cy, Z0, Z0 + H * 0.06, W * 0.5, 28);
  for (let i = 0; i < v.peb; i++) { const th = R() * 6.28, f = 0.5 + R() * 0.45, x = cx + m.cos(th) * W * 0.5 * f, y = cy + m.sin(th) * D * 0.5 * f; lump(a, x, y, Z0 + H * 0.1, W * 0.035, W * 0.035, H * 0.05, v.seed + i, 0.2, 8, 4, Z0 + H * 0.06); }
  lump(a, cx, cy, Z0 + H * 0.42, W * 0.22, D * 0.22, H * 0.4, v.seed, 0.16, 14, 8, Z0 + H * 0.06);
  a.cyl(cx, cy, Z1 - H * 0.04, Z1 + 0.001, W * 0.03, 8); a.tube([[cx, cy, Z1 - H * 0.04], [cx + W * 0.05, cy - W * 0.04, Z1 - H * 0.02], [cx + W * 0.11, cy - W * 0.08, Z0 + H * 0.5]], [3, 3, 3], 4);
  for (let k = 0; k < 3; k++) a.box(cx + W * 0.03 + k * 6, cy - W * 0.2 - k * 5, Z0 + H * 0.12, cx + W * 0.03 + k * 6 + 3, cy - W * 0.02, Z0 + H * 0.46);
  a.circ(cx, cy, W * 0.5, 'EQUIP'); a.poly(blobPoly(cx, cy, W * 0.22, D * 0.22, v.seed, 14, 0.15), 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.03, 'EQUIP-DETAIL');
  a.log('Added the round basin with a pebble bed, a drilled boulder with a spout and the streaming water sheet (plan and 3D).');
}
const bubblers = fam({ cat: 'nature/water', title: 'Generic rock bubbler fountain', desc: (v) => `Rock bubbler fountain: a drilled boulder with a spout, water streaming down it, and a round basin of ${v.peb} pebbles around it.`, build: bubbler, vs: [
  ['small, 30 in basin', 30, 30, 28, 0, { seed: 1, peb: 14 }], ['large, 54 in basin', 54, 54, 44, 0, { seed: 2, peb: 24 }] ] });

// ------------------------------------------------------------------------------------------ wildlife
/**
 * A four-legged animal facing -Y. s: leg (frac of H under the belly), by (body centre as frac of D from the front), bl (half body length frac of D), bw (half width frac of W), bh (half depth frac of H),
 * hy, hz (head centre), hl hw hh (head radii), snout, neck (radius frac of W), lx (leg spread), lr (leg radius frac of W), ear ('pt'|'long'|'flop'|'none'), tail ('short'|'long'|'bushy'|'curl'|'none'),
 * plus feature flags: antlers, horns, hump, mane, udder, wool, bigfoot.
 */
function quad(a, s) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, by = YF + D * s.by, ry = D * s.bl, rx = W * s.bw, rz = H * s.bh * 1.12, bz = Z0 + H * s.leg + rz * 0.92;
  const hl = D * s.hl, hw = W * s.hw, hh = H * s.hh, hy = YF + m.max(D * s.hy, hl * (0.9 + s.snout) + hw * 0.3 + 4), hz = Z0 + H * s.hz, ex = (k) => m.min(hw * k, W * 0.47);
  // legs: front pair under the chest, rear pair under the haunch with a bent hock
  const lr = W * s.lr * 1.7, lx = W * s.lx, fy = by - ry * 0.55, ryy = by + ry * 0.58;
  for (const sx of [-1, 1]) {
    const x = cx + sx * lx;
    a.tube([[x, fy, bz - rz * 0.2], [x, fy + D * 0.005, Z0 + H * s.leg * 0.5], [x, fy - D * 0.004, Z0 + H * 0.05], [x, fy - D * 0.004, Z0 + 3]], [lr * 1.5, lr * 1.1, lr * 0.8, lr * 0.9], 8);
    a.tube([[x, ryy, bz - rz * 0.1], [x, ryy - D * 0.025, Z0 + H * s.leg * 0.55], [x, ryy + D * 0.025, Z0 + H * s.leg * 0.28], [x, ryy + D * 0.02, Z0 + H * 0.05], [x, ryy + D * 0.02, Z0 + 3]], [lr * 1.7, lr * 1.1, lr * 0.8, lr * 0.75, lr * 0.85], 8);
    a.box(x - lr * (s.bigfoot ? 1.5 : 1), fy - D * 0.004 - lr * (s.bigfoot ? 2.4 : 1.6), Z0, x + lr * (s.bigfoot ? 1.5 : 1), fy - D * 0.004 + lr * 1.2, Z0 + H * 0.025); a.box(x - lr * (s.bigfoot ? 1.5 : 1), ryy + D * 0.02 - lr * 1.4, Z0, x + lr * (s.bigfoot ? 1.5 : 1), ryy + D * 0.02 + lr * (s.bigfoot ? 2.2 : 1.6), Z0 + H * 0.025);
    a.circ(x, fy, lr, 'EQUIP-DETAIL'); a.circ(x, ryy, lr, 'EQUIP-DETAIL');
  }
  // body, chest and haunch
  a.ell(cx, by, bz, rx, ry, rz, 16, 9);
  a.ell(cx, by - ry * 0.55, bz + rz * 0.06, rx * 0.98, ry * 0.5, rz * 1.02, 12, 8);
  a.ell(cx, by + ry * 0.6, bz + rz * 0.05, rx * 1.02, ry * 0.45, rz * 1.0, 12, 8);
  if (s.hump) a.ell(cx, by - ry * 0.4, bz + rz * 0.85, rx * 0.8, ry * 0.4, rz * 0.5, 10, 6);
  if (s.udder) a.ell(cx, by + ry * 0.55, bz - rz * 0.95, rx * 0.4, ry * 0.22, rz * 0.4, 8, 5);
  if (s.wool) for (let k = 0; k < 5; k++) for (const [ox, oz, q] of [[0, 0.55, 0.55], [-0.55, 0.25, 0.5], [0.55, 0.25, 0.5]]) a.ell(cx + ox * rx, by + (k - 2) * ry * 0.34, bz + rz * oz, rx * q, ry * 0.2, rz * q * 0.95, 8, 5);
  // neck and head
  a.tube([[cx, by - ry * 0.75, bz + rz * 0.35], [cx, (by - ry * 0.75 + hy) / 2, (bz + rz * 0.35 + hz) / 2 + hh * 0.2], [cx, hy + hl * 0.5, hz - hh * 0.1]], [W * s.neck, W * s.neck * 0.85, W * s.neck * 0.62], 10);
  a.ell(cx, hy, hz, hw, hl, hh, 12, 8);
  if (s.snout) a.ell(cx, hy - hl * 0.8, hz - hh * 0.25, hw * 0.72, hl * s.snout, hh * 0.62, 10, 6);
  a.ell(cx, hy - hl * (0.8 + s.snout * 1.0) * (s.snout ? 1 : 0.3), hz - hh * 0.2, hw * 0.28, hw * 0.2, hh * 0.22, 6, 4);   // nose
  for (const sx of [-1, 1]) { a.ell(cx + sx * hw * 0.78, hy - hl * 0.28, hz + hh * 0.35, hw * 0.12, hl * 0.12, hh * 0.15, 6, 4); }   // eyes
  for (const sx of [-1, 1]) {
    if (s.ear === 'pt') a.cone(cx + sx * hw * 0.65, hy + hl * 0.35, hz + hh * 0.75, hz + hh * 1.75, hw * 0.3, hw * 0.05, 6);
    else if (s.ear === 'long') a.tube([[cx + sx * hw * 0.55, hy + hl * 0.5, hz + hh * 0.8], [cx + sx * ex(1.9), hy + hl * 0.6, hz + hh * 1.3], [cx + sx * ex(2.7), hy + hl * 0.8, hz + hh * 1.05]], [hw * 0.34, hw * 0.3, hw * 0.1], 6);
    else if (s.ear === 'flop') a.tube([[cx + sx * hw * 0.7, hy + hl * 0.4, hz + hh * 0.7], [cx + sx * hw * 1.2, hy + hl * 0.5, hz + hh * 0.2], [cx + sx * hw * 1.3, hy + hl * 0.55, hz - hh * 0.5]], [hw * 0.3, hw * 0.35, hw * 0.12], 6);
    if (s.horns) a.tube([[cx + sx * hw * 0.7, hy + hl * 0.4, hz + hh * 0.8], [cx + sx * ex(1.7), hy + hl * 0.4, hz + hh * 1.3], [cx + sx * ex(1.9), hy + hl * 0.4, hz + hh * 2.1]], [hw * 0.18, hw * 0.13, hw * 0.04], 6);
    if (s.antlers) { const ah = H * 0.26; a.tube([[cx + sx * hw * 0.5, hy + hl * 0.4, hz + hh * 0.9], [cx + sx * W * 0.2, hy + hl * 0.1, hz + hh + ah * 0.5], [cx + sx * W * 0.28, hy - hl * 0.2, hz + hh + ah]], [hw * 0.14, hw * 0.11, hw * 0.05], 6); for (let k = 1; k <= 3; k++) { const f = k / 4; a.tube([[cx + sx * (hw * 0.5 + (W * 0.28 - hw * 0.5) * f), hy + hl * 0.4 - hl * 0.6 * f, hz + hh * 0.9 + (ah + hh * 0.1) * f], [cx + sx * (hw * 0.5 + (W * 0.28 - hw * 0.5) * f) + sx * W * 0.04, hy + hl * 0.4 - hl * 0.6 * f - hl * 0.4, hz + hh * 0.9 + (ah + hh * 0.1) * f + ah * 0.28]], [hw * 0.07, hw * 0.025], 5); } }
  }
  if (s.mane) for (let i = 0; i < 9; i++) { const f = i / 8, y = hy + hl * 0.8 + (by - ry * 0.6 - hy - hl * 0.8) * f, z = hz + hh * 0.5 + (bz + rz * 0.95 - hz - hh * 0.5) * f; a.box(cx - W * 0.015, y - D * 0.012, z - H * 0.03, cx + W * 0.015, y + D * 0.012, z + H * 0.05); }
  // tail
  const ty = by + ry * 0.98, tz = bz + rz * 0.3;
  if (s.tail === 'long') a.tube([[cx, ty - D * 0.01, tz], [cx, ty + D * 0.03, tz - H * 0.08], [cx, YB - D * 0.01, tz - H * 0.32]], [W * 0.03, W * 0.05, W * 0.035], 6);
  else if (s.tail === 'bushy') a.tube([[cx, ty - D * 0.01, tz], [cx, ty + D * 0.04, tz - H * 0.02], [cx, YB - D * 0.01, tz - H * 0.18]], [W * 0.05, W * 0.11, W * 0.07], 8);
  else if (s.tail === 'curl') a.tube([[cx, ty - D * 0.01, tz], [cx, ty + D * 0.03, tz + H * 0.1], [cx, ty + D * 0.05, tz + H * 0.03]], [W * 0.04, W * 0.03, W * 0.02], 6);
  else if (s.tail === 'short') a.tube([[cx, ty - D * 0.01, tz], [cx, YB - D * 0.015, tz - H * 0.07]], [W * 0.05, W * 0.035], 6);
  a.ellp(cx, by, rx, ry); a.ellp(cx, hy, hw, hl, 'EQUIP-DETAIL'); a.line(cx, hy + hl, cx, by - ry, 'EQUIP-DETAIL'); a.line(cx, ty, cx, YB - 2, 'EQUIP-DETAIL');
  a.log('Added the body with chest and haunch masses, four jointed legs with feet, the neck, the head with snout, eyes and ears' + (s.antlers ? ', branched antlers' : '') + (s.horns ? ', horns' : '') + (s.mane ? ', a mane' : '') + (s.udder ? ', an udder' : '') + (s.wool ? ', a wool coat' : '') + ' and a tail (plan and 3D).');
}
const base = { leg: 0.5, by: 0.52, bl: 0.28, bw: 0.4, bh: 0.2, hy: 0.09, hz: 0.88, hl: 0.08, hw: 0.2, hh: 0.075, snout: 0.8, neck: 0.15, lx: 0.26, lr: 0.05, ear: 'pt', tail: 'short' };
const QV = (label, w, d, h, o) => [label, w, d, h, 0, { s: { ...base, ...o } }];
const deer = fam({ cat: 'nature/wildlife', title: 'Generic deer', desc: (v) => `Deer scale shape, ${v.sx}: slender body, four jointed legs with hooves, a long neck, head with ears and a short tail${v.s.antlers ? ', and branched antlers' : ''}.`, build: (a, v) => quad(a, v.s), vs: [
  ['doe, 36 in at the shoulder', 15, 66, 56, 0, { sx: 'doe', s: { ...base, leg: 0.52, bl: 0.27, bw: 0.4, bh: 0.13, hy: 0.07, hz: 0.9, hl: 0.07, hw: 0.17, hh: 0.06, snout: 1.0, neck: 0.12, lx: 0.26, lr: 0.035, ear: 'long', tail: 'short' } }],
  ['stag with antlers, 44 in', 22, 80, 96, 0, { sx: 'stag', s: { ...base, leg: 0.38, bl: 0.28, bw: 0.4, bh: 0.12, hy: 0.07, hz: 0.62, hl: 0.07, hw: 0.17, hh: 0.055, snout: 1.0, neck: 0.15, lx: 0.26, lr: 0.035, ear: 'long', tail: 'short', antlers: true } }] ] });
const bears = fam({ cat: 'nature/wildlife', title: 'Generic bear', desc: (v) => `Bear scale shape, ${v.sx}: heavy body with a shoulder hump, four thick legs with broad paws, a broad head with small round ears and a short tail.`, build: (a, v) => quad(a, v.s), vs: [
  ['black bear, 34 in at the shoulder', 26, 66, 40, 0, { sx: 'black bear', s: { ...base, leg: 0.34, by: 0.52, bl: 0.3, bw: 0.42, bh: 0.28, hy: 0.09, hz: 0.66, hl: 0.09, hw: 0.2, hh: 0.14, snout: 0.7, neck: 0.2, lx: 0.3, lr: 0.075, ear: 'pt', tail: 'short', hump: true, bigfoot: true } }],
  ['large brown bear, 48 in', 36, 90, 56, 0, { sx: 'brown bear', s: { ...base, leg: 0.34, by: 0.52, bl: 0.3, bw: 0.42, bh: 0.28, hy: 0.09, hz: 0.66, hl: 0.09, hw: 0.2, hh: 0.14, snout: 0.7, neck: 0.22, lx: 0.3, lr: 0.08, ear: 'pt', tail: 'short', hump: true, bigfoot: true } }] ] });
const dogs = fam({ cat: 'nature/wildlife', title: 'Generic dog', desc: (v) => `Dog scale shape, ${v.sx}: body with chest and haunch, four legs with paws, a neck and head with a snout and ears, and a curved tail.`, build: (a, v) => quad(a, v.s), vs: [
  ['small, 12 in at the shoulder', 8, 24, 17, 0, { sx: 'small', s: { ...base, leg: 0.4, bl: 0.28, bw: 0.4, bh: 0.2, hy: 0.09, hz: 0.82, hl: 0.1, hw: 0.28, hh: 0.12, snout: 0.7, neck: 0.2, lx: 0.26, lr: 0.06, ear: 'flop', tail: 'curl' } }],
  ['large, 28 in at the shoulder', 14, 48, 36, 0, { sx: 'large', s: { ...base, leg: 0.46, bl: 0.28, bw: 0.4, bh: 0.2, hy: 0.09, hz: 0.82, hl: 0.1, hw: 0.2, hh: 0.095, snout: 0.9, neck: 0.15, lx: 0.26, lr: 0.05, ear: 'flop', tail: 'long' } }] ] });
const horses = fam({ cat: 'nature/wildlife', title: 'Generic horse', desc: (v) => `Horse scale shape, ${v.sx}: deep body, long jointed legs with hooves, an arched neck with a mane, a long head with upright ears, and a long tail.`, build: (a, v) => quad(a, v.s), vs: [
  ['pony, 12 hands', 18, 72, 62, 0, { sx: 'pony', s: { ...base, leg: 0.46, bl: 0.28, bw: 0.4, bh: 0.15, hy: 0.09, hz: 0.9, hl: 0.1, hw: 0.2, hh: 0.075, snout: 1.0, neck: 0.15, lx: 0.26, lr: 0.04, ear: 'pt', tail: 'long', mane: true } }],
  ['horse, 16 hands', 24, 100, 90, 0, { sx: 'horse', s: { ...base, leg: 0.5, bl: 0.28, bw: 0.4, bh: 0.14, hy: 0.09, hz: 0.92, hl: 0.1, hw: 0.19, hh: 0.07, snout: 1.0, neck: 0.145, lx: 0.26, lr: 0.035, ear: 'pt', tail: 'long', mane: true } }] ] });
const cows = fam({ cat: 'nature/wildlife', title: 'Generic cow', desc: (v) => `Cow scale shape, ${v.sx}: barrel body, four legs with hooves, a head with a broad muzzle and ears${v.s.horns ? ' and short horns' : ''}, ${v.s.udder ? 'an udder, ' : ''}and a long tail.`, build: (a, v) => quad(a, v.s), vs: [
  ['calf, 30 in at the shoulder', 14, 50, 36, 0, { sx: 'calf', s: { ...base, leg: 0.4, bl: 0.3, bw: 0.42, bh: 0.25, hy: 0.09, hz: 0.78, hl: 0.11, hw: 0.25, hh: 0.12, snout: 0.7, neck: 0.18, lx: 0.28, lr: 0.05, ear: 'long', tail: 'long' } }],
  ['dairy cow, 54 in', 28, 100, 60, 0, { sx: 'dairy cow', s: { ...base, leg: 0.34, bl: 0.3, bw: 0.42, bh: 0.3, hy: 0.09, hz: 0.76, hl: 0.1, hw: 0.21, hh: 0.1, snout: 0.8, neck: 0.18, lx: 0.28, lr: 0.04, ear: 'long', tail: 'long', horns: true, udder: true } }] ] });
const sheeps = fam({ cat: 'nature/wildlife', title: 'Generic sheep', desc: (v) => `Sheep scale shape, ${v.sx}: round woolly body made of overlapping masses, four short legs, a small head with ears and a short tail.`, build: (a, v) => quad(a, v.s), vs: [
  ['lamb, 18 in at the shoulder', 11, 32, 24, 0, { sx: 'lamb', s: { ...base, leg: 0.36, bl: 0.3, bw: 0.42, bh: 0.24, hy: 0.09, hz: 0.82, hl: 0.11, hw: 0.2, hh: 0.1, snout: 0.7, neck: 0.15, lx: 0.26, lr: 0.04, ear: 'long', tail: 'short', wool: true } }],
  ['ewe, 30 in', 18, 50, 38, 0, { sx: 'ewe', s: { ...base, leg: 0.34, bl: 0.3, bw: 0.42, bh: 0.26, hy: 0.09, hz: 0.8, hl: 0.1, hw: 0.17, hh: 0.085, snout: 0.7, neck: 0.15, lx: 0.26, lr: 0.035, ear: 'long', tail: 'short', wool: true } }] ] });

/** A standing bird: a body ellipsoid, breast, folded wing, tail wedge, neck and head with beak, and legs with feet. s: leg, neck, beak, body size, wade */
function bird(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, s = v.s, by = YF + D * s.by, bz = Z0 + H * s.leg + H * s.bh, rx = W * 0.4, ry = D * s.bl, rz = H * s.bh;
  const hr = H * s.hr, hy = YF + m.max(D * s.hy, hr * 2.2 + H * s.beak + 2), hz = Z0 + H * s.hz;
  a.ell(cx, by, bz, rx, ry, rz, 14, 8); a.ell(cx, by - ry * 0.6, bz + rz * 0.1, rx * 0.95, ry * 0.5, rz * 1.0, 10, 7);
  for (const sx of [-1, 1]) a.ell(cx + sx * rx * 0.78, by + ry * 0.1, bz + rz * 0.1, rx * 0.28, ry * 0.7, rz * 0.7, 8, 5);   // folded wings
  prismX(a, [[by + ry * 0.7, bz + rz * 0.3], [YB - 2, bz - rz * 0.5], [YB - 2, bz - rz * 0.8], [by + ry * 0.7, bz - rz * 0.3]], cx - W * 0.1, cx + W * 0.1);   // tail
  a.tube([[cx, by - ry * 0.7, bz + rz * 0.4], [cx, (by - ry * 0.7 + hy) / 2, (bz + hz) / 2 + (s.neck > 0.3 ? H * 0.04 : 0)], [cx, hy + hr * 0.6, hz - hr * 0.3]], [W * s.nr, W * s.nr * 0.75, W * s.nr * 0.6], 8);
  a.ell(cx, hy, hz, W * 0.17, hr * 1.1, hr, 10, 7);
  a.cone(cx, hy, hz, hz + 0.01, 1, 1, 3);
  a.tube([[cx, hy - hr, hz - hr * 0.1], [cx, hy - hr - H * s.beak, hz - hr * 0.3]], [hr * 0.55, hr * 0.12], 6);
  for (const sx of [-1, 1]) a.ell(cx + sx * W * 0.14, hy - hr * 0.3, hz + hr * 0.2, W * 0.025, hr * 0.2, hr * 0.2, 5, 4);
  for (const sx of [-1, 1]) { const x = cx + sx * W * 0.14, ly = by + ry * 0.1; a.tube([[x, ly, bz - rz * 0.6], [x, ly + 4, Z0 + H * s.leg * 0.5], [x, ly - 2, Z0 + 3]], [W * 0.035, W * 0.022, W * 0.02], 6); for (const f of [-1, 0, 1]) a.tube([[x, ly - 2, Z0 + 3], [x + f * W * 0.07, ly - W * 0.18, Z0 + 1.5]], [W * 0.012, W * 0.008], 4); }
  a.ellp(cx, by, rx, ry); a.ellp(cx, hy, W * 0.17, hr * 1.1, 'EQUIP-DETAIL'); a.line(cx, hy - hr, cx, hy - hr - H * s.beak, 'EQUIP-DETAIL'); a.poly([[cx - W * 0.1, by + ry * 0.7], [cx + W * 0.1, by + ry * 0.7], [cx, YB - 2]], 'EQUIP-DETAIL');
  a.log('Added the body with breast, folded wings and a tail, the neck, head with beak and eyes, and two legs with toes (plan and 3D).');
}
const birds = fam({ cat: 'nature/wildlife', title: 'Generic bird', desc: (v) => `Standing ${v.sx} scale shape: rounded body with folded wings and a tail, neck, head with beak and eyes, and two legs with toes.`, build: bird, vs: [
  ['songbird, 6 in', 3.2, 6.5, 5.2, 0, { sx: 'songbird', s: { leg: 0.16, bh: 0.28, by: 0.5, bl: 0.3, hy: 0.13, hz: 0.7, hr: 0.14, beak: 0.1, nr: 0.08 } }],
  ['duck, 20 in', 9, 20, 14, 0, { sx: 'duck', s: { leg: 0.16, bh: 0.26, by: 0.55, bl: 0.28, hy: 0.14, hz: 0.78, hr: 0.1, beak: 0.12, nr: 0.1 } }],
  ['heron, 40 in tall', 8, 34, 46, 0, { sx: 'heron', s: { leg: 0.5, bh: 0.1, by: 0.5, bl: 0.28, hy: 0.14, hz: 0.88, hr: 0.04, beak: 0.2, nr: 0.07, neck: 0.5 } }] ] });

/** A fish: a spindle body tube with a profile, tail fin, dorsal and pectoral fins, an eye and gill line. Head at -Y. */
function fish(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, zc = Z0 + H * 0.5, bl = D * 0.8, y0 = YF + 4, rad = [0.28, 0.5, 0.8, 0.95, 1.0, 0.9, 0.72, 0.5, 0.3, 0.15];
  const pts = rad.map((_, i) => [cx, y0 + bl * i / (rad.length - 1), zc]);
  a.tube(pts, rad.map((r, i) => (i < 4 ? H * 0.34 * r : H * 0.34 * r) * (1 - 0.05 * (v.slim ? 1 : 0))), 12);
  const ty = y0 + bl;
  prismX(a, [[ty - 4, zc + H * 0.05], [YB - 2, zc + H * 0.48], [YB - 2 - D * 0.04, zc], [YB - 2, zc - H * 0.48], [ty - 4, zc - H * 0.05]].map(([y, z]) => [y, z]), cx - W * 0.03, cx + W * 0.03);   // tail
  prismX(a, [[y0 + bl * 0.3, zc + H * 0.28], [y0 + bl * 0.5, zc + H * 0.46], [y0 + bl * 0.66, zc + H * 0.28]], cx - W * 0.02, cx + W * 0.02);   // dorsal fin
  prismX(a, [[y0 + bl * 0.55, zc - H * 0.26], [y0 + bl * 0.66, zc - H * 0.42], [y0 + bl * 0.72, zc - H * 0.2]], cx - W * 0.02, cx + W * 0.02);   // anal fin
  for (const sx of [-1, 1]) { a.tube([[cx + sx * W * 0.3, y0 + bl * 0.26, zc - H * 0.12], [cx + sx * W * 0.46, y0 + bl * 0.36, zc - H * 0.26]], [H * 0.04, H * 0.01], 5); a.ell(cx + sx * W * 0.32, y0 + bl * 0.1, zc + H * 0.05, W * 0.03, bl * 0.025, H * 0.04, 6, 4); }
  for (let k = 0; k < 3; k++) a.box(cx - W * 0.2, y0 + bl * (0.22 + k * 0.03) , zc - H * 0.2, cx + W * 0.2, y0 + bl * (0.22 + k * 0.03) + 2, zc + H * 0.2);
  a.ellp(cx, y0 + bl * 0.45, W * 0.34, bl * 0.5); a.poly([[cx - W * 0.03, ty - 4], [cx, YB - 2 - D * 0.04], [cx + W * 0.03, ty - 4]], 'EQUIP-DETAIL'); a.line(cx, y0, cx, ty, 'EQUIP-DETAIL');
  a.log('Added the spindle body, tail fin, dorsal and anal fins, paired pectoral fins, gill line and eyes (plan and 3D).');
}
const fishes = fam({ cat: 'nature/wildlife', title: 'Generic fish', desc: (v) => `Fish scale shape, ${v.sx}: spindle body, forked tail, dorsal and anal fins, paired pectoral fins, gill line and eyes.`, build: fish, vs: [
  ['trout, 12 in', 3, 12, 4, 6, { sx: 'trout', slim: false }], ['pike, 30 in', 5, 30, 8, 12, { sx: 'pike', slim: true }] ] });

/** A butterfly with four wings on a slender body; or a dragonfly with a long abdomen. */
function insect(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, zc = Z0 + H * 0.5;
  if (v.dragon) {
    a.tube([[cx, YF + D * 0.2, zc], [cx, YF + D * 0.35, zc], [cx, YB - 1, zc - H * 0.02]], [W * 0.035, W * 0.03, W * 0.014], 6); a.ell(cx, YF + D * 0.12, zc, W * 0.06, D * 0.08, H * 0.35, 8, 5);   // abdomen and head
    a.ell(cx, YF + D * 0.28, zc + H * 0.1, W * 0.045, D * 0.08, H * 0.3, 8, 5);
    for (const sx of [-1, 1]) for (const [f0, f1] of [[0.22, 0.3], [0.31, 0.39]]) a.prism(sx > 0 ? [[cx + W * 0.04, YF + D * f0], [cx + W * 0.5, YF + D * (f0 - 0.04)], [cx + W * 0.5, YF + D * (f1 - 0.02)], [cx + W * 0.04, YF + D * f1]] : [[cx - W * 0.04, YF + D * f0], [cx - W * 0.04, YF + D * f1], [cx - W * 0.5, YF + D * (f1 - 0.02)], [cx - W * 0.5, YF + D * (f0 - 0.04)]], zc + H * 0.28, zc + H * 0.4);
    a.ellp(cx, YF + D * 0.5, W * 0.04, D * 0.48); for (const sx of [-1, 1]) a.poly([[cx + sx * W * 0.04, YF + D * 0.22], [cx + sx * W * 0.5, YF + D * 0.18], [cx + sx * W * 0.5, YF + D * 0.36], [cx + sx * W * 0.04, YF + D * 0.4]], 'EQUIP-DETAIL');
    a.log('Added the head, thorax, long abdomen and two pairs of wings (plan and 3D).');
  } else {
    a.tube([[cx, YF + D * 0.12, zc], [cx, YF + D * 0.5, zc], [cx, YB - D * 0.08, zc]], [W * 0.025, W * 0.03, W * 0.01], 6); a.ell(cx, YF + D * 0.1, zc, W * 0.03, D * 0.05, H * 0.3, 8, 5);
    for (const sx of [-1, 1]) { const w = (pts) => pts.map(([x, y]) => [cx + sx * x, YF + y]); const up = w([[W * 0.03, D * 0.25], [W * 0.5, D * 0.02], [W * 0.5, D * 0.42], [W * 0.03, D * 0.5]]), lo = w([[W * 0.03, D * 0.5], [W * 0.38, D * 0.42], [W * 0.34, D * 0.9], [W * 0.03, D * 0.75]]); a.prism(sx > 0 ? up : up.slice().reverse(), zc + H * 0.15, zc + H * 0.3); a.prism(sx > 0 ? lo : lo.slice().reverse(), zc + H * 0.1, zc + H * 0.22); a.poly(up, 'EQUIP-DETAIL'); a.poly(lo, 'EQUIP-DETAIL'); }
    for (const sx of [-1, 1]) a.tube([[cx + sx * W * 0.01, YF + D * 0.09, zc + H * 0.2], [cx + sx * W * 0.1, YF + D * 0.0 + 1, zc + H * 0.9]], [W * 0.004, W * 0.003], 4);
    a.line(cx, YF + D * 0.1, cx, YB - D * 0.08, 'EQUIP');
    a.log('Added the body, head with antennae and two pairs of wings (plan and 3D).');
  }
}
const insects = fam({ cat: 'nature/wildlife', title: 'Generic insect', desc: (v) => v.dragon ? 'Dragonfly scale shape, 3 in: head, thorax, long abdomen and two pairs of wings.' : 'Butterfly scale shape, 3 in wingspan: slender body, head with antennae and two pairs of wings.', build: insect, vs: [
  ['butterfly, 3 in wingspan', 3, 2.2, 1, 0, { dragon: false }], ['dragonfly, 3 in', 3, 3.2, 0.8, 0, { dragon: true }] ] });

/** A beehive: a stand, a bottom board with an entrance and alighting board, a stack of boxes with handholds and frame ends, an inner cover and a telescoping roof. v.boxes: [heights in in] */
function hive(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, st = 14 * IN * 0.5 * 2 * 0.5, bw = W - 110, bd = D - 270, t = 18;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * (bw / 2 - 30) - 28, cy + sy * (bd / 2 - 30) - 28, Z0, cx + sx * (bw / 2 - 30) + 28, cy + sy * (bd / 2 - 30) + 28, Z0 + st);
  a.box(cx - bw / 2 - 20, cy - bd / 2 - 20, Z0 + st - 30, cx + bw / 2 + 20, cy + bd / 2 + 20, Z0 + st);   // stand rails
  let z = Z0 + st;
  a.box(cx - bw / 2 - 12, cy - bd / 2 - 70, z, cx + bw / 2 + 12, cy + bd / 2 + 12, z + 26);   // bottom board
  a.box(cx - bw * 0.24, cy - bd / 2 - 70 - 90, z - 10, cx + bw * 0.24, cy - bd / 2 - 70, z + 14);   // alighting board
  z += 26;
  a.box(cx - bw * 0.3, cy - bd / 2 - 4, z, cx + bw * 0.3, cy - bd / 2 + 2, z + 10);   // entrance slot band
  for (let k = 0; k < v.boxes.length; k++) {
    const h = v.boxes[k] * IN;
    a.box(cx - bw / 2, cy - bd / 2, z, cx + bw / 2, cy + bd / 2, z + h);
    for (const sy of [-1, 1]) a.box(cx - bw * 0.2, sy < 0 ? cy - bd / 2 - 8 : cy + bd / 2, z + h * 0.62, cx + bw * 0.2, sy < 0 ? cy - bd / 2 : cy + bd / 2 + 8, z + h * 0.62 + 26);   // handholds
    for (const sx of [-1, 1]) a.box(sx < 0 ? cx - bw / 2 - 8 : cx + bw / 2, cy - bd / 2 + 10, z + h - 10, sx < 0 ? cx - bw / 2 : cx + bw / 2 + 8, cy + bd / 2 - 10, z + h);   // frame rest rebates
    a.line(cx - bw / 2, cy - bd / 2, cx + bw / 2, cy - bd / 2, 'EQUIP-DETAIL');
    z += h + 3;
  }
  a.box(cx - bw / 2, cy - bd / 2, z, cx + bw / 2, cy + bd / 2, z + 18);   // inner cover
  a.cyl(cx, cy, z + 18, z + 26, 36, 10);   // vent hole boss
  prismX(a, [[cy - bd / 2 - 40, z + 18], [cy + bd / 2 + 40, z + 18], [cy + bd / 2 + 40, Z1 - 20], [cy - bd / 2 - 40, Z1 - 4], [cy - bd / 2 - 40, Z1 - 20]].slice(0, 4), cx - bw / 2 - 30, cx + bw / 2 + 30);   // roof (flat-sloped)
  a.box(cx - bw / 2 - 30, cy - bd / 2 - 40, z + 18, cx + bw / 2 + 30, cy + bd / 2 + 40, Z1 - 6);
  a.box(cx - bw / 2 - 34, cy - bd / 2 - 44, Z1 - 24, cx + bw / 2 + 34, cy + bd / 2 + 44, Z1);
  a.rect(cx - bw / 2 - 34, cy - bd / 2 - 44, cx + bw / 2 + 34, cy + bd / 2 + 44, 'EQUIP'); a.rect(cx - bw / 2, cy - bd / 2, cx + bw / 2, cy + bd / 2, 'EQUIP-DETAIL'); a.rect(cx - bw * 0.24, cy - bd / 2 - 160, cx + bw * 0.24, cy - bd / 2 - 70, 'EQUIP-DETAIL');
  a.log('Added the four-legged stand, bottom board with an entrance slot and alighting board, ' + v.boxes.length + ' stacked boxes with handholds and frame rebates, the inner cover with a vent boss and the telescoping roof (plan and 3D).');
}
const hives = fam({ cat: 'nature/wildlife', title: 'Generic beehive', desc: (v) => `Beehive with ${v.boxes.length} stacked box${v.boxes.length > 1 ? 'es' : ''}: stand, bottom board with an entrance and alighting board, handholds, an inner cover and a telescoping roof. Frames are not drawn.`, build: hive, vs: [
  ['1 deep box, 10 frame', 20, 30, 25, 0, { boxes: [9.6] }], ['2 deep boxes, 10 frame', 20, 30, 35, 0, { boxes: [9.6, 9.6] }], ['2 deep boxes and 2 supers', 20, 30, 48, 0, { boxes: [9.6, 9.6, 6.6, 6.6] }] ] });

/** A bat box: a tall narrow wooden box on a pole with a landing plate and groove lines, a sloped roof and a vent gap. */
function batbox(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bw = W * 0.86, bd = D * 0.5, bz = Z0 + H * 0.45;
  a.tube([[cx, YB - 30, Z0], [cx, YB - 30, Z1 - 40]], [34, 34], 8); a.box(cx - 60, YB - 60, Z0, cx + 60, YB, Z0 + 12);
  a.box(cx - bw / 2, YB - 60 - bd, bz, cx + bw / 2, YB - 60, Z1 - 60);   // box
  for (let k = 0; k < 14; k++) a.box(cx - bw / 2 + 8, YB - 60 - bd - 5, bz + 60 + k * (Z1 - 120 - bz) / 14, cx + bw / 2 - 8, YB - 60 - bd, bz + 60 + k * (Z1 - 120 - bz) / 14 + 8);   // grooves/rungs
  a.box(cx - bw / 2 + 6, YB - 60 - bd - 70, bz - 8, cx + bw / 2 - 6, YB - 60 - bd, bz + 24);   // landing plate
  a.box(cx - bw / 2 + 10, YB - 60 - bd - 30, bz - 80, cx + bw / 2 - 10, YB - 60 - bd, bz - 8);   // bottom lip
  prismX(a, [[YB - 60 - bd - 40, Z1 - 50], [YB - 20, Z1 - 70], [YB - 20, Z1 - 4], [YB - 60 - bd - 40, Z1 - 30]], cx - bw / 2 - 20, cx + bw / 2 + 20);   // sloped roof
  a.rect(cx - bw / 2, YB - 60 - bd, cx + bw / 2, YB - 60, 'EQUIP'); a.circ(cx, YB - 30, 34, 'EQUIP-DETAIL'); a.rect(cx - bw / 2 + 6, YB - 60 - bd - 70, cx + bw / 2 - 6, YB - 60 - bd, 'EQUIP-DETAIL');
  a.log('Added the mounting pole with a foot plate, the tall box with rungs, a landing plate, a bottom lip and a sloped roof (plan and 3D).');
}
const batboxes = fam({ cat: 'nature/wildlife', title: 'Generic bat box', desc: () => 'Pole-mounted bat box: a tall narrow wooden box with horizontal roost grooves, a landing plate, a bottom lip and a sloped roof, on a round pole with a foot plate.', build: batbox, vs: [
  ['2 chamber, on pole', 18, 14, 96, 0, {}] ] });

/** A bird nest box: a post with a box, a round entry hole, a perch, a hinged pitched roof and a front board. */
function nestbox(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, bw = W * 0.9, bd = D * 0.8, bz = Z0 + H * 0.55, bt = Z1 - H * 0.1;
  a.tube([[cx, YB - 24, Z0], [cx, YB - 24, bz]], [30, 30], 8); a.box(cx - 70, YB - 90, Z0, cx + 70, YB - 8, Z0 + 10);
  a.box(cx - bw / 2, YF + (D - bd) * 0.5, bz, cx + bw / 2, YF + (D - bd) * 0.5 + bd, bt);
  a.box(cx - bw / 2 - 4, YF + (D - bd) * 0.5 - 6, bz + 10, cx + bw / 2 + 4, YF + (D - bd) * 0.5, bt - 4);   // front board
  const hy = YF + (D - bd) * 0.5 - 6, hz = bz + (bt - bz) * 0.62, hr = m.min(W, D) * 0.14;
  a.ycyl(hy - 16, hy + 10, cx, hz, hr * 1.35, 14); a.ycyl(hy - 18, hy - 14, cx, hz, hr * 0.5, 10);   // entry hole surround and a dark plug (shallow)
  a.ycyl(hy - 52, hy, cx, hz - hr * 2.0, 6, 6); a.ycyl(hy - 10, hy, cx, hz - hr * 1.3, 4, 4);   // perch
  prismX(a, [[YF + (D - bd) * 0.5 - 40, bt - 4], [YF + (D - bd) * 0.5 + bd + 20, bt + H * 0.1], [YF + (D - bd) * 0.5 + bd + 20, bt + H * 0.1 + 18], [YF + (D - bd) * 0.5 - 40, bt + 14]].slice(0, 4).map(([y, z]) => [y, z]), cx - bw / 2 - 20, cx + bw / 2 + 20);
  a.box(cx - bw / 2 - 20, YF + (D - bd) * 0.5 - 40, bt - 4, cx + bw / 2 + 20, YF + (D - bd) * 0.5 + bd + 20, bt);
  a.rect(cx - bw / 2 - 20, YF + (D - bd) * 0.5 - 40, cx + bw / 2 + 20, YF + (D - bd) * 0.5 + bd + 20, 'EQUIP'); a.rect(cx - bw / 2, YF + (D - bd) * 0.5, cx + bw / 2, YF + (D - bd) * 0.5 + bd, 'EQUIP-DETAIL'); a.circ(cx, YB - 24, 30, 'EQUIP-DETAIL'); a.circ(cx, hy - 20, hr, 'EQUIP-DETAIL');
  a.log('Added the mounting post with a foot plate, the box with a front board, a round entry hole with a perch and a sloped overhanging roof (plan and 3D).');
}
const nestboxes = fam({ cat: 'nature/wildlife', title: 'Generic bird nest box', desc: () => 'Garden bird nest box on a post: box with a front board, a round entry hole with a short perch, and an overhanging sloped roof.', build: nestbox, vs: [
  ['small birds, on post', 8, 9, 60, 0, {}] ] });

/** A burrow: a low earth mound with a round entrance hole, spoil heap in front, scattered stones and a short tunnel throat. */
function burrow(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D, H } = a, R = rng(v.seed), hr = H * 0.34;
  field(a, X0, X1, YF, YB, 28, 24, (x, y) => { const u = (x - cx) / (W / 2), t = (y - cy) / (D / 2), r = m.sqrt(u * u + t * t), mound = H * m.max(0, 1 - r * r) * (1 + 0.08 * m.sin(5 * u + 3 * t)); const sx = (x - cx) / (W * 0.18), sy = (y - (YF + D * 0.22)) / (D * 0.14), apron = H * 0.32 * m.exp(-(sx * sx + sy * sy)); return Z0 + 4 + m.max(mound, apron); }, Z0);
  const hy = YF + D * 0.3, hx = cx;   // entrance on the front slope
  a.xcyl(hx - hr * 1.3, hx + hr * 1.3, hy + 4, Z0 + H * 0.36, hr * 1.1, 14);   // a doorway surround proud of the slope
  a.xcyl(hx - hr * 0.85, hx + hr * 0.85, hy - 8, Z0 + H * 0.36, hr * 0.8, 14);   // darker bore (recess ring)
  a.ycyl(hy - 30, hy + 6, hx, Z0 + H * 0.36, hr * 0.62, 12);
  for (let i = 0; i < v.stones; i++) { const x = cx + (R() - 0.5) * W * 0.8, y = cy + (R() - 0.5) * D * 0.8, s = 0.025 + R() * 0.025; lump(a, x, y, Z0 + H * 0.05, W * s, W * s, H * 0.1, v.seed + i, 0.25, 7, 4, Z0 + 2); a.circ(x, y, W * s, 'EQUIP-DETAIL'); }
  a.poly(blobPoly(cx, cy, W * 0.5, D * 0.5, v.seed, 28, 0.08), 'EQUIP'); a.circ(hx, hy, hr, 'EQUIP-DETAIL'); a.ellp(cx, YF + D * 0.22, W * 0.18, D * 0.14, 'EQUIP-DETAIL');
  a.log('Added the earth mound with a spoil apron in front, the round entrance hole with a surround and bore, and ' + v.stones + ' scattered stones (plan and 3D).');
}
const burrows = fam({ cat: 'nature/wildlife', title: 'Generic animal burrow', desc: () => 'Animal burrow entrance: a low earth mound with a spoil apron in front, a round entrance hole with a surround, and a few scattered stones.', build: burrow, vs: [
  ['mound with entrance, 3 ft', 36, 36, 14, 0, { seed: 2, stones: 8 }] ] });
export default [boulders, outcrops, cairns, steps, cliffs, dunes, walls, conifers, broadleaves, palms, shrubs, hedges, stumps, logsF, ponds, streams, falls, fountains, wells, reedsF, baths, docks, bubblers, deer, bears, dogs, horses, cows, sheeps, birds, fishes, insects, hives, batboxes, nestboxes, burrows];

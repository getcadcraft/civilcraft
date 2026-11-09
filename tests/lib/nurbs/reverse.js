/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors and labels are codes and keys (the app words them). */
/**
 * reverse.js — cc-nurbs (0.9 SU.1082, session `reverse-nurbs-09`): REVERSE ENGINEERING, a first honest cut. A scanned triangle mesh
 * goes in; trimmed NURBS faces come out, each with its fit error MEASURED against the mesh. DOM-free, no dependencies beyond cc-nurbs.
 * Written from the published ideas only (RANSAC shape detection, Schnabel et al. 2007, as a method; Kasa's algebraic circle fit;
 * least-squares B-spline surface approximation, Piegl & Tiller ch. 9); no code of any program or library was read or copied.
 *
 * What it does (and the limits, which are the report's words too):
 *   1. weld the mesh (vertices closer than 1e-7 of its size), drop degenerate triangles, take triangle normals and areas;
 *   2. detect PLANES, CYLINDERS, SPHERES and CONES by random sampling (seeded, area-weighted: the same mesh gives the same faces), keeping
 *      the model that covers the largest connected area, refined by least squares (PCA plane; cylinder axis from the normals, circle by Kasa,
 *      then Gauss-Newton on the vertex distances; sphere algebraic + Gauss-Newton; cone axis from the plane the normals lie on, apex from the
 *      tangent planes). 0.9 round 2: a second pass over what is left looks for small round features (cylinders and spheres up to
 *      `blendMax`) at a tighter tolerance, leftover triangles within the tolerance of a neighbouring primitive join it, and a small
 *      cylinder or sphere that runs tangent into two or more other faces is reported as a FILLET with its radius (`report.fillets`);
 *   3. what remains is cut into connected pieces; a piece that is a height field over its own best plane is fitted by ONE tensor
 *      B-spline patch (least squares, control net grown until the deviation is within the tolerance or a cap is reached); a piece that
 *      folds back on itself is reported as NOT fitted, never forced;
 *   4. every face is built as an exact NURBS surface (planar patch; revolved line = exact rational cylinder) or the fitted patch, and
 *      trimmed to the piece's boundary loops (an exact bounding rectangle is left untrimmed);
 *   5. (round 2) full-turn cylinders are trimmed around holes (the seam is put where no hole is); the rational circle's parameter is mapped
 *      to angle exactly, so trims sit where the mesh outline is;
 *   6. the deviation is measured: each mesh vertex AND each triangle's middle point of the piece to the CLOSEST POINT of the built NURBS face
 *      (rms, max, 95th percentile, share within the tolerance; at most 4000 sampled per piece). This is mesh-to-surface only; the other direction (surface to mesh) is not measured.
 *
 *   fit(mesh, opts) → { patches, unfitted, report }   report.fillets = [{ name, kind, radius, between [face names], rms, max }]; report.map = Float32Array x, y, z, distance (the deviation map)
 *       mesh = { positions (x,y,z flat, mm), indices (3 per triangle) }
 *       opts = { tol: 0.2 (mm: inlier distance and the free-form target), minShare: 0.01 (smallest piece, share of the surface area),
 *                cylShare: 0.05 (smallest cylinder, share of the surface area: smaller curved strips are left to the free-form fit),
 *                maxPatches: 48, angle: 12 (degrees: how far a triangle's normal may turn away from the model), seed: 1, cylinders: true,
 *                freeform: true, maxTriangles: 300000, maxCvs: 20 (per direction, free-form),
 *                spheres/cones/blends: true, blendMax: 0 (mm; 0 = 12 % of the scan size), blendTol: 0 (0 = tol / 2), blendShare: 0.0002, mapPoints: 6000, budgetMs: 20000 }
 *       patch = { kind: 'plane' | 'cylinder' | 'sphere' | 'cone' | 'freeform', blend? { radius, between, tangent }, surface, trim (trim.js shape or null), name, tris, area, stats, model, note? }
 *       stats = { n, rms, max, p95, within (share 0–1 of vertices within tol), tol }
 *       unfitted = [{ tris, area, reason: 'folded' | 'small' | 'trim' }]
 *   NurbsError nurbs.err.scan_empty | scan_big | scan_flat
 */
import * as C from './curve.js';
import * as S from './surface.js';
import * as K from './construct.js';
import * as T from './trim.js';
import * as V from './vec.js';
import * as BA from './basis.js';

const { fail } = C;
const RAD = Math.PI / 180;

function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ------------------------------------------------------------------------------------------------ the mesh

function prepare(mesh, maxTriangles) {
  const P0 = mesh && mesh.positions, I0 = mesh && mesh.indices;
  if (!P0 || !I0 || I0.length < 3 || P0.length < 9) fail('nurbs.err.scan_empty');
  if (I0.length / 3 > maxTriangles) fail('nurbs.err.scan_big', { max: maxTriangles });
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P0.length; i += 3) for (let k = 0; k < 3; k++) { const x = P0[i + k]; if (!Number.isFinite(x)) fail('nurbs.err.scan_empty'); if (x < lo[k]) lo[k] = x; if (x > hi[k]) hi[k] = x; }
  const size = Math.max(1e-9, Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]));
  const q = size * 1e-7, map = new Map(), remap = new Int32Array(P0.length / 3), P = [];
  for (let i = 0; i < P0.length / 3; i++) {
    const key = Math.round((P0[i * 3] - lo[0]) / q) + ',' + Math.round((P0[i * 3 + 1] - lo[1]) / q) + ',' + Math.round((P0[i * 3 + 2] - lo[2]) / q);
    let id = map.get(key);
    if (id === undefined) { id = P.length / 3; map.set(key, id); P.push(P0[i * 3], P0[i * 3 + 1], P0[i * 3 + 2]); }
    remap[i] = id;
  }
  const tri = [], nrm = [], area = [], cen = [];
  for (let i = 0; i < I0.length; i += 3) {
    const a = remap[I0[i]], b = remap[I0[i + 1]], c = remap[I0[i + 2]];
    if (a === b || b === c || a === c) continue;
    const pa = [P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], pb = [P[b * 3], P[b * 3 + 1], P[b * 3 + 2]], pc = [P[c * 3], P[c * 3 + 1], P[c * 3 + 2]];
    const n = V.cross(V.sub(pb, pa), V.sub(pc, pa)), l = V.len(n);
    if (l < 1e-12 * size * size) continue;
    tri.push(a, b, c); nrm.push(n[0] / l, n[1] / l, n[2] / l); area.push(l / 2);
    cen.push((pa[0] + pb[0] + pc[0]) / 3, (pa[1] + pb[1] + pc[1]) / 3, (pa[2] + pb[2] + pc[2]) / 3);
  }
  const nt = tri.length / 3;
  if (nt < 1) fail('nurbs.err.scan_empty');
  const edge = new Map();
  for (let t = 0; t < nt; t++) for (let k = 0; k < 3; k++) {
    const a = tri[t * 3 + k], b = tri[t * 3 + (k + 1) % 3], key = Math.min(a, b) * 4294967296 + Math.max(a, b);
    const e = edge.get(key); if (e) e.push(t); else edge.set(key, [t]);
  }
  const nb = Array.from({ length: nt }, () => []);
  for (const e of edge.values()) if (e.length === 2) { nb[e[0]].push(e[1]); nb[e[1]].push(e[0]); }
  let total = 0; for (const a of area) total += a;
  return { P, tri, nrm, area, cen, nt, nb, size, total, lo, hi };
}
const pt = (M, i) => [M.P[i * 3], M.P[i * 3 + 1], M.P[i * 3 + 2]];
const nv = (M, t) => [M.nrm[t * 3], M.nrm[t * 3 + 1], M.nrm[t * 3 + 2]];
const cn = (M, t) => [M.cen[t * 3], M.cen[t * 3 + 1], M.cen[t * 3 + 2]];

/** Connected pieces of the triangle set `inSet` (a Uint8Array flag per triangle), by shared edges; largest area first. */
function components(M, inSet) {
  const seen = new Uint8Array(M.nt), out = [];
  for (let s = 0; s < M.nt; s++) {
    if (!inSet[s] || seen[s]) continue;
    const list = [s]; seen[s] = 1;
    for (let h = 0; h < list.length; h++) for (const n of M.nb[list[h]]) if (inSet[n] && !seen[n]) { seen[n] = 1; list.push(n); }
    let a = 0; for (const t of list) a += M.area[t];
    out.push({ tris: list, area: a });
  }
  return out.sort((x, y) => y.area - x.area);
}

// ------------------------------------------------------------------------------------------------ small linear algebra

/** Eigenvectors of a symmetric 3x3 (Jacobi): { values (ascending), vectors (columns as arrays, same order) }. */
function eigen3(A) {
  const a = A.map((r) => r.slice()), v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 30; sweep++) {
    const off = Math.abs(a[0][1]) + Math.abs(a[0][2]) + Math.abs(a[1][2]);
    if (off < 1e-300) break;
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      if (Math.abs(a[p][q]) < 1e-300) continue;
      const th = (a[q][q] - a[p][p]) / (2 * a[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < 3; k++) { const x = a[k][p], y = a[k][q]; a[k][p] = c * x - s * y; a[k][q] = s * x + c * y; }
      for (let k = 0; k < 3; k++) { const x = a[p][k], y = a[q][k]; a[p][k] = c * x - s * y; a[q][k] = s * x + c * y; }
      for (let k = 0; k < 3; k++) { const x = v[k][p], y = v[k][q]; v[k][p] = c * x - s * y; v[k][q] = s * x + c * y; }
    }
  }
  const idx = [0, 1, 2].sort((i, j) => a[i][i] - a[j][j]);
  return { values: idx.map((i) => a[i][i]), vectors: idx.map((i) => [v[0][i], v[1][i], v[2][i]]) };
}
const outer3 = (acc, x, w = 1) => { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) acc[i][j] += w * x[i] * x[j]; };
const zero3 = () => [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

function vertsOf(M, tris) {
  const seen = new Set(), out = [];
  for (const t of tris) for (let k = 0; k < 3; k++) { const v = M.tri[t * 3 + k]; if (!seen.has(v)) { seen.add(v); out.push(v); } }
  return out;
}

// ------------------------------------------------------------------------------------------------ plane and cylinder models

function planeFrom(pts) {
  const c = [0, 0, 0]; for (const p of pts) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }
  c[0] /= pts.length; c[1] /= pts.length; c[2] /= pts.length;
  const cov = zero3(); for (const p of pts) outer3(cov, V.sub(p, c));
  const e = eigen3(cov);
  return { kind: 'plane', o: c, n: e.vectors[0], e1: e.vectors[2], e2: e.vectors[1] };
}
function planeFit(M, tris) { return planeFrom(vertsOf(M, tris).map((i) => pt(M, i))); }

function planeInliers(M, m, tol, cosA, inSet, out) {
  for (let t = 0; t < M.nt; t++) {
    if (!inSet[t]) continue;
    if (Math.abs(V.dot(nv(M, t), m.n)) < cosA) continue;
    let ok = true;
    for (let k = 0; k < 3 && ok; k++) ok = Math.abs(V.dot(V.sub(pt(M, M.tri[t * 3 + k]), m.o), m.n)) <= tol;
    if (ok) out[t] = 1;
  }
}

function cylFrame(a) { const e1 = V.perp(a); return { e1, e2: V.cross(a, e1) }; }

/** Circle in the plane perpendicular to the axis through the projected points (Kasa): { c (3-D point on the axis), r } or null. */
function circleFit(pts, a, origin) {
  const { e1, e2 } = cylFrame(a), X = [];
  for (const p of pts) { const d = V.sub(p, origin); X.push([V.dot(d, e1), V.dot(d, e2)]); }
  // x^2 + y^2 = 2 cx x + 2 cy y + k
  const AtA = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], Atb = [0, 0, 0];
  for (const [x, y] of X) { const r = [2 * x, 2 * y, 1], b = x * x + y * y; for (let i = 0; i < 3; i++) { Atb[i] += r[i] * b; for (let j = 0; j < 3; j++) AtA[i][j] += r[i] * r[j]; } }
  const s = V.solve(AtA, Atb.map((x) => [x]));
  if (!s) return null;
  const cx = s[0][0], cy = s[1][0], r2 = s[2][0] + cx * cx + cy * cy;
  if (!(r2 > 0)) return null;
  return { c: V.add(origin, V.add(V.mul(e1, cx), V.mul(e2, cy))), r: Math.sqrt(r2) };
}

function cylFromTwo(M, t1, t2, size, tol) {
  const n1 = nv(M, t1), n2 = nv(M, t2), a = V.cross(n1, n2), l = V.len(a);
  if (l < Math.sin(10 * RAD)) return null;
  const ax = V.mul(a, 1 / l), { e1, e2 } = cylFrame(ax), p1 = cn(M, t1), p2 = cn(M, t2);
  const f = (p) => [V.dot(p, e1), V.dot(p, e2)];
  const q1 = f(p1), q2 = f(p2), d1 = f(n1), d2 = f(n2);
  // q1 + s d1 = q2 + u d2
  const det = d1[0] * -d2[1] - (-d2[0]) * d1[1];
  if (Math.abs(det) < 1e-9) return null;
  const rx = q2[0] - q1[0], ry = q2[1] - q1[1];
  const s = (rx * -d2[1] - (-d2[0]) * ry) / det;
  const cx = q1[0] + s * d1[0], cy = q1[1] + s * d1[1], r = Math.hypot(q1[0] - cx, q1[1] - cy);
  if (!(r > 3 * tol) || r > 10 * size) return null;
  return { kind: 'cylinder', a: ax, c: V.add(V.mul(e1, cx), V.mul(e2, cy)), r };
}
function cylDist(m, p) { const d = V.sub(p, m.c), z = V.dot(d, m.a); return Math.abs(V.len(V.sub(d, V.mul(m.a, z))) - m.r); }
function cylInliers(M, m, tol, cosA, inSet, out) {
  const sinA = Math.sqrt(1 - cosA * cosA);
  for (let t = 0; t < M.nt; t++) {
    if (!inSet[t]) continue;
    const n = nv(M, t);
    if (Math.abs(V.dot(n, m.a)) > sinA) continue;
    let ok = true;
    for (let k = 0; k < 3 && ok; k++) ok = cylDist(m, pt(M, M.tri[t * 3 + k])) <= tol;
    if (!ok) continue;
    const d = V.sub(cn(M, t), m.c), rad = V.norm(V.sub(d, V.mul(m.a, V.dot(d, m.a))));
    if (Math.abs(V.dot(n, rad)) >= cosA) out[t] = 1;
  }
}
function cylRefine(M, tris, m) {
  const cov = zero3(); for (const t of tris) outer3(cov, nv(M, t), M.area[t]);
  const ax = eigen3(cov).vectors[0];
  const pts = vertsOf(M, tris).map((i) => pt(M, i));
  const o = m.c, a = V.dot(ax, m.a) < 0 ? V.mul(ax, -1) : ax;
  const ci = circleFit(pts, a, o);
  if (!ci) return null;
  return cylPolish(pts, { kind: 'cylinder', a, c: ci.c, r: ci.r });
}
/** Gauss-Newton on the true distances from the vertices to the cylinder (axis tilt, axis position, radius): the normals of long skinny
 *  triangles are noisy, the vertices are not. Falls back to the start when it does not improve. */
function cylPolish(pts, m0) {
  let a = m0.a, c = m0.c, r = m0.r;
  const rms = (a2, c2, r2) => { let s = 0; for (const p of pts) { const d = V.sub(p, c2), z = V.dot(d, a2), e = V.len(V.sub(d, V.mul(a2, z))) - r2; s += e * e; } return Math.sqrt(s / pts.length); };
  let best = rms(a, c, r);
  for (let it = 0; it < 6; it++) {
    const { e1, e2 } = cylFrame(a), H = Array.from({ length: 5 }, () => [0, 0, 0, 0, 0]), g = [0, 0, 0, 0, 0];
    for (const p of pts) {
      const d = V.sub(p, c), z = V.dot(d, a), q = V.sub(d, V.mul(a, z)), rho = V.len(q); if (rho < 1e-12) continue;
      const u = V.mul(q, 1 / rho), u1 = V.dot(u, e1), u2 = V.dot(u, e2), J = [-z * u1, -z * u2, -u1, -u2, -1], res = rho - r;
      for (let i = 0; i < 5; i++) { g[i] += J[i] * res; for (let j = 0; j < 5; j++) H[i][j] += J[i] * J[j]; }
    }
    const dx = V.solve(H, g.map((x) => [-x]));
    if (!dx) break;
    const a2 = V.norm(V.add(a, V.add(V.mul(e1, dx[0][0]), V.mul(e2, dx[1][0]))));
    const c2 = V.add(c, V.add(V.mul(e1, dx[2][0]), V.mul(e2, dx[3][0]))), r2 = r + dx[4][0];
    if (!(r2 > 0) || !Number.isFinite(r2)) break;
    const nr = rms(a2, c2, r2);
    if (!(nr <= best)) break;
    a = a2; c = c2; r = r2; best = nr;
  }
  return { kind: 'cylinder', a, c, r };
}

// ------------------------------------------------------------------------------------------------ sphere and cone models (0.9 round 2)

/** Midpoint of the closest points of two lines (point + direction), or null when they run parallel. */
function lineMid(p1, d1, p2, d2) {
  const w = V.sub(p1, p2), a = V.dot(d1, d1), b = V.dot(d1, d2), c = V.dot(d2, d2), d = V.dot(d1, w), e = V.dot(d2, w), den = a * c - b * b;
  if (Math.abs(den) < 1e-12) return null;
  const s = (b * e - c * d) / den, t = (a * e - b * d) / den;
  return V.mul(V.add(V.add(p1, V.mul(d1, s)), V.add(p2, V.mul(d2, t))), 0.5);
}
/** A sphere from two triangles: the centre is where their normal lines (nearly) meet. */
function sphFromTwo(M, t1, t2, size, tol) {
  const n1 = nv(M, t1), n2 = nv(M, t2);
  if (V.len(V.cross(n1, n2)) < Math.sin(10 * RAD)) return null;
  const p1 = cn(M, t1), p2 = cn(M, t2), c = lineMid(p1, n1, p2, n2);
  if (!c) return null;
  const r1 = V.dist(c, p1), r2 = V.dist(c, p2), r = (r1 + r2) / 2;
  if (!(r > 3 * tol) || r > 10 * size || Math.abs(r1 - r2) > Math.max(2 * tol, 0.02 * r)) return null;
  return { kind: 'sphere', c, r };
}
const sphDist = (m, p) => Math.abs(V.dist(p, m.c) - m.r);
function sphInliers(M, m, tol, cosA, inSet, out) {
  for (let t = 0; t < M.nt; t++) {
    if (!inSet[t]) continue;
    let ok = true;
    for (let k = 0; k < 3 && ok; k++) ok = sphDist(m, pt(M, M.tri[t * 3 + k])) <= tol;
    if (!ok || sphDist(m, cn(M, t)) > 2 * tol) continue;   // the facet's middle too: three corners on a sphere do not make a sphere facet
    const rad = V.norm(V.sub(cn(M, t), m.c));
    if (Math.abs(V.dot(nv(M, t), rad)) >= cosA) out[t] = 1;
  }
}
/** Algebraic sphere fit on centred points, then three Gauss-Newton steps on the true distances. */
function sphRefine(M, tris, m) {
  const pts = vertsOf(M, tris).map((i) => pt(M, i));
  if (pts.length < 6) return null;
  const o = [0, 0, 0]; for (const p of pts) { o[0] += p[0]; o[1] += p[1]; o[2] += p[2]; }
  o[0] /= pts.length; o[1] /= pts.length; o[2] /= pts.length;
  const AtA = Array.from({ length: 4 }, () => [0, 0, 0, 0]), Atb = [0, 0, 0, 0];
  for (const p of pts) { const q = V.sub(p, o), r = [2 * q[0], 2 * q[1], 2 * q[2], 1], b = V.dot(q, q); for (let i = 0; i < 4; i++) { Atb[i] += r[i] * b; for (let j = 0; j < 4; j++) AtA[i][j] += r[i] * r[j]; } }
  const s = V.solve(AtA, Atb.map((x) => [x]));
  if (!s) return null;
  let c = V.add(o, [s[0][0], s[1][0], s[2][0]]), r = Math.sqrt(Math.max(0, s[3][0] + s[0][0] ** 2 + s[1][0] ** 2 + s[2][0] ** 2));
  if (!(r > 0)) return null;
  for (let it = 0; it < 3; it++) {
    const H = Array.from({ length: 4 }, () => [0, 0, 0, 0]), g = [0, 0, 0, 0];
    for (const p of pts) {
      const d = V.sub(p, c), l = V.len(d); if (l < 1e-12) continue;
      const u = V.mul(d, 1 / l), res = l - r, J = [-u[0], -u[1], -u[2], -1];
      for (let i = 0; i < 4; i++) { g[i] += J[i] * res; for (let j = 0; j < 4; j++) H[i][j] += J[i] * J[j]; }
    }
    const dx = V.solve(H, g.map((x) => [-x]));
    if (!dx) break;
    c = V.add(c, [dx[0][0], dx[1][0], dx[2][0]]); r += dx[3][0];
  }
  if (!(r > 0) || !Number.isFinite(r) || c.some((x) => !Number.isFinite(x))) return null;
  return { kind: 'sphere', c, r };
}

/** A cone from three triangles: the axis is the direction every normal makes the same angle with, the apex where the three tangent planes meet. */
function coneFromThree(M, t1, t2, t3, size, tol) {
  const n = [nv(M, t1), nv(M, t2), nv(M, t3)], p = [cn(M, t1), cn(M, t2), cn(M, t3)];
  const a0 = V.cross(V.sub(n[0], n[1]), V.sub(n[1], n[2])), l = V.len(a0);
  if (l < 1e-3) return null;
  return coneBuild(n, p, V.mul(a0, 1 / l), [1, 1, 1], size, tol);
}
/** Shared by the three-triangle seed and the refinement: axis `a0` and weighted normals/points → { apex, a, alpha } or null. */
function coneBuild(n, p, a0, w, size, tol) {
  let k = 0, ws = 0; for (let i = 0; i < n.length; i++) { k += w[i] * V.dot(n[i], a0); ws += w[i]; }
  k /= ws;
  const a = k > 0 ? V.mul(a0, -1) : a0, sinA = Math.abs(k);
  if (sinA < Math.sin(3 * RAD) || sinA > Math.sin(80 * RAD)) return null;
  const A = zero3(), b = [0, 0, 0];
  for (let i = 0; i < n.length; i++) { outer3(A, n[i], w[i]); const d = V.dot(n[i], p[i]) * w[i]; b[0] += n[i][0] * d; b[1] += n[i][1] * d; b[2] += n[i][2] * d; }
  const x = V.solve(A, b.map((q) => [q]));
  if (!x) return null;
  const apex = [x[0][0], x[1][0], x[2][0]];
  if (apex.some((q) => !Number.isFinite(q)) || V.dist(apex, p[0]) > 10 * size) return null;
  return { kind: 'cone', apex, a, alpha: Math.asin(sinA) };
}
function coneDist(m, p) {
  const d = V.sub(p, m.apex), z = V.dot(d, m.a), rho = V.len(V.sub(d, V.mul(m.a, z)));
  return z < 0 ? V.len(d) : Math.abs(rho * Math.cos(m.alpha) - z * Math.sin(m.alpha));
}
function coneInliers(M, m, tol, cosA, inSet, out) {
  const ca = Math.cos(m.alpha), sa = Math.sin(m.alpha);
  for (let t = 0; t < M.nt; t++) {
    if (!inSet[t]) continue;
    let ok = true;
    for (let k = 0; k < 3 && ok; k++) ok = coneDist(m, pt(M, M.tri[t * 3 + k])) <= tol;
    if (!ok || coneDist(m, cn(M, t)) > 2 * tol) continue;
    const d = V.sub(cn(M, t), m.apex), rad = V.norm(V.sub(d, V.mul(m.a, V.dot(d, m.a))));
    if (V.dot(nv(M, t), V.sub(V.mul(rad, ca), V.mul(m.a, sa))) >= cosA) out[t] = 1;
  }
}
/** Cone refinement: the normals of a cone lie on one plane (n . a = const), the best such plane gives the axis and angle; the apex is the least-squares meeting of the tangent planes. */
function coneRefine(M, tris, m) {
  let mu = [0, 0, 0], ws = 0;
  for (const t of tris) { mu = V.add(mu, V.mul(nv(M, t), M.area[t])); ws += M.area[t]; }
  mu = V.mul(mu, 1 / ws);
  const cov = zero3(); for (const t of tris) outer3(cov, V.sub(nv(M, t), mu), M.area[t]);
  const a0 = eigen3(cov).vectors[0];
  const n = [], p = [], w = [];
  for (const t of tris) { n.push(nv(M, t)); p.push(cn(M, t)); w.push(M.area[t]); }
  return coneBuild(n, p, a0, w, M.size, 0);
}

// ------------------------------------------------------------------------------------------------ torus model (0.9 engineer-09: rim fillets)

/** Meridian coordinates about an axis { c, a }: rho (distance from the axis), h (height along it), the radial unit. */
function meridian(m, p) { const d = V.sub(p, m.c), h = V.dot(d, m.a), q = V.sub(d, V.mul(m.a, h)), rho = V.len(q); return { rho, h, er: rho > 1e-12 ? V.mul(q, 1 / rho) : V.perp(m.a) }; }
/** Signed distance to a torus { c, a, R, r } (c = the tube-centre circle's middle, a = axis, R = major, r = tube radius). */
const torSigned = (m, p) => { const q = meridian(m, p); return Math.hypot(q.rho - m.R, q.h) - m.r; };
const torDist = (m, p) => Math.abs(torSigned(m, p));
function torInliers(M, m, tol, cosA, inSet, out) {
  for (let t = 0; t < M.nt; t++) {
    if (!inSet[t]) continue;
    let ok = true;
    for (let k = 0; k < 3 && ok; k++) ok = torDist(m, pt(M, M.tri[t * 3 + k])) <= tol;
    if (!ok || torDist(m, cn(M, t)) > 2 * tol) continue;
    const p = cn(M, t), q = meridian(m, p), tube = V.add(m.c, V.mul(q.er, m.R)), rad = V.norm(V.sub(p, tube));
    if (Math.abs(V.dot(nv(M, t), rad)) >= cosA) out[t] = 1;
  }
}
/** A torus about a known axis from two triangles: in the meridian plane their normal lines meet at the tube centre. Rim fillets only:
 *  the axis comes from a cylinder or cone already found (a free torus with no coaxial neighbour is not looked for). */
function torFromTwo(M, ax, t1, t2, tol, rmax) {
  const mer = (t) => {
    const p = cn(M, t), q = meridian(ax, p), n = nv(M, t), n2 = [V.dot(n, q.er), V.dot(n, ax.a), 0], l = Math.hypot(n2[0], n2[1]);
    return l < 0.95 ? null : { q: [q.rho, q.h, 0], n: [n2[0] / l, n2[1] / l, 0] };   // a normal that leaves the meridian plane: not of revolution about this axis
  };
  const A = mer(t1), B = mer(t2); if (!A || !B) return null;
  if (Math.abs(A.n[0] * B.n[1] - A.n[1] * B.n[0]) < Math.sin(8 * RAD)) return null;
  const c2 = lineMid(A.q, A.n, B.q, B.n); if (!c2) return null;
  const r1 = Math.hypot(A.q[0] - c2[0], A.q[1] - c2[1]), r2 = Math.hypot(B.q[0] - c2[0], B.q[1] - c2[1]), r = (r1 + r2) / 2;
  if (!(r > 3 * tol) || r > rmax || Math.abs(r1 - r2) > Math.max(2 * tol, 0.03 * r) || !(c2[0] > r)) return null;   // a ring torus (R > r) only
  return { kind: 'torus', c: V.add(ax.c, V.mul(ax.a, c2[1])), a: ax.a, R: c2[0], r };
}
/** Levenberg-Marquardt on the vertex distances: axis tilt (2), centre (3), R, r. Falls back to the start when it does not improve. */
function torRefine(M, tris, m0) {
  let pts = vertsOf(M, tris).map((i) => pt(M, i));
  if (pts.length < 8) return null;
  if (pts.length > 2500) { const k = Math.ceil(pts.length / 2500); pts = pts.filter((_, i) => i % k === 0); }
  const apply = (m, x) => { const { e1, e2 } = cylFrame(m.a); return { kind: 'torus', a: V.norm(V.add(m.a, V.add(V.mul(e1, x[0]), V.mul(e2, x[1])))), c: V.add(m.c, [x[2], x[3], x[4]]), R: m.R + x[5], r: m.r + x[6] }; };
  const cost = (m) => { let s = 0; for (const p of pts) { const e = torSigned(m, p); s += e * e; } return s; };
  let m = { ...m0 }, best = cost(m), lam = 1e-3;
  const hs = [1e-6, 1e-6, 1e-6 * (m.R + m.r), 1e-6 * (m.R + m.r), 1e-6 * (m.R + m.r), 1e-6 * (m.R + m.r), 1e-6 * (m.R + m.r)];
  for (let it = 0; it < 12; it++) {
    const res = pts.map((p) => torSigned(m, p)), J = pts.map(() => new Array(7));
    for (let j = 0; j < 7; j++) { const x = [0, 0, 0, 0, 0, 0, 0]; x[j] = hs[j]; const mj = apply(m, x); pts.forEach((p, i) => { J[i][j] = (torSigned(mj, p) - res[i]) / hs[j]; }); }
    const H = Array.from({ length: 7 }, () => new Array(7).fill(0)), g = new Array(7).fill(0);
    pts.forEach((_, i) => { for (let a = 0; a < 7; a++) { g[a] += J[i][a] * res[i]; for (let b = 0; b < 7; b++) H[a][b] += J[i][a] * J[i][b]; } });
    let improved = false;
    for (let tries = 0; tries < 6 && !improved; tries++) {
      const A = H.map((row, a) => row.map((v, b) => (a === b ? v * (1 + lam) + 1e-18 : v)));
      const dx = V.solve(A, g.map((v) => [-v])); if (!dx) { lam *= 10; continue; }
      const m2 = apply(m, dx.map((r) => r[0]));
      if (!(m2.r > 0) || !(m2.R > m2.r) || !Number.isFinite(m2.R)) { lam *= 10; continue; }
      const c2 = cost(m2);
      if (c2 < best) { m = m2; best = c2; lam = Math.max(1e-9, lam / 10); improved = true; } else lam *= 10;
    }
    if (!improved) break;
  }
  return m;
}

// ------------------------------------------------------------------------------------------------ boundary loops and (u, v)

function boundaryLoops(M, tris, inSet) {
  const edges = new Map();   // vertex -> [neighbour vertices] over boundary edges (undirected)
  const add = (a, b) => { (edges.get(a) || edges.set(a, []).get(a)).push(b); };
  for (const t of tris) for (let k = 0; k < 3; k++) {
    const a = M.tri[t * 3 + k], b = M.tri[t * 3 + (k + 1) % 3];
    // boundary: no other triangle in the set shares this edge
    let shared = false;
    for (const n of M.nb[t]) if (inSet[n]) { let c = 0; for (let j = 0; j < 3; j++) { const v = M.tri[n * 3 + j]; if (v === a || v === b) c++; } if (c === 2) { shared = true; break; } }
    if (!shared) { add(a, b); add(b, a); }
  }
  const loops = [];
  const used = new Set();
  const ek = (a, b) => Math.min(a, b) * 4294967296 + Math.max(a, b);
  for (const [start, nbs] of edges) {
    for (const first of nbs) {
      if (used.has(ek(start, first))) continue;
      const loop = [start]; let prev = start, cur = first; used.add(ek(start, first));
      let guard = 0;
      while (cur !== start && guard++ < 1e6) {
        loop.push(cur);
        const next = (edges.get(cur) || []).find((x) => !used.has(ek(cur, x)));
        if (next === undefined) break;
        used.add(ek(cur, next)); prev = cur; cur = next;
      }
      if (cur === start && loop.length >= 3) loops.push(loop);
    }
  }
  return loops;
}
const shoelace = (L) => { let a = 0; for (let i = 0; i < L.length; i++) { const p = L[i], q = L[(i + 1) % L.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
const inPoly = (L, x, y) => { let c = false; for (let i = 0, j = L.length - 1; i < L.length; j = i++) if ((L[i][1] > y) !== (L[j][1] > y) && x < (L[j][0] - L[i][0]) * (y - L[i][1]) / (L[j][1] - L[i][1]) + L[i][0]) c = !c; return c; };

/** Trim from the piece's boundary loops in (u, v): null when the outer loop fills the patch (nothing to cut) or cannot be used. */
function trimFrom(M, s, tris, inSet, uvOf, fill = 0.999) {
  const loops = boundaryLoops(M, tris, inSet).map((L) => L.map((v) => uvOf(v)));
  if (!loops.length) return { trim: null, note: 'no_boundary' };
  const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
  const dec = (L) => { const k = Math.ceil(L.length / 3500); return k > 1 ? L.filter((_, i) => i % k === 0) : L; };
  const ranked = loops.map((L) => ({ L: dec(L), a: Math.abs(shoelace(dec(L))) })).sort((x, y) => y.a - x.a);
  const outer = ranked[0];
  if (outer.a >= fill * (ub - ua) * (vb - va) && ranked.length === 1) return { trim: null };
  let trim = null;
  try { trim = T.addLoop(s, null, outer.L, { hole: false }); } catch { return { trim: null, note: 'trim_failed' }; }
  let skipped = 0;
  for (const h of ranked.slice(1)) {
    if (!inPoly(outer.L, h.L[0][0], h.L[0][1])) { skipped++; continue; }
    try { trim = T.addLoop(s, trim, h.L, { hole: true }); } catch { skipped++; }
  }
  return { trim, note: skipped ? 'holes_skipped' : undefined, skipped };
}

// ------------------------------------------------------------------------------------------------ building the faces

function planePatch(M, tris, m, inSet) {
  const vs = vertsOf(M, tris);
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  const xy = new Map();
  for (const i of vs) { const d = V.sub(pt(M, i), m.o), x = V.dot(d, m.e1), y = V.dot(d, m.e2); xy.set(i, [x, y]); if (x < u0) u0 = x; if (x > u1) u1 = x; if (y < v0) v0 = y; if (y > v1) v1 = y; }
  if (!(u1 - u0 > 1e-9) || !(v1 - v0 > 1e-9)) return null;
  const at = (x, y) => V.add(m.o, V.add(V.mul(m.e1, x), V.mul(m.e2, y)));
  const s = K.planarPatch([at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)]);
  const uvOf = (i) => { const q = xy.get(i); return [(q[0] - u0) / (u1 - u0), (q[1] - v0) / (v1 - v0)]; };
  const tr = trimFrom(M, s, tris, inSet, uvOf);
  return { surface: s, trim: tr.trim, note: tr.note, uvOf, model: { o: m.o, n: m.n } };
}

/** The rational circle's parameter is not uniform in angle: a table (half a degree apart) from an angle past the start to the fraction of the v range. */
function angleToV(span) {
  const arc = C.arc([0, 0, 0], [1, 0, 0], [0, 1, 0], 1, 0, span), [ta, tb] = C.domain(arc), n = Math.max(64, Math.ceil(span / RAD * 2)), ang = [];
  let prev = 0, wrap = 0;
  for (let k = 0; k <= n; k++) {
    const q = C.point(arc, ta + (tb - ta) * k / n); let a = Math.atan2(q[1], q[0]) + wrap;
    if (k && a < prev - Math.PI) { wrap += 2 * Math.PI; a += 2 * Math.PI; }
    ang.push(k === n && Math.abs(a - span) < 1e-6 ? span : a); prev = a;
  }
  return (d) => {
    if (d <= 0) return 0; if (d >= span) return 1;
    let lo = 0, hi = n; while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (ang[mid] <= d) lo = mid; else hi = mid; }
    const f = ang[hi] > ang[lo] ? (d - ang[lo]) / (ang[hi] - ang[lo]) : 0;
    return (lo + Math.max(0, Math.min(1, f))) / n;
  };
}
const wrapPi = (x) => { x %= 2 * Math.PI; return x > Math.PI ? x - 2 * Math.PI : x < -Math.PI ? x + 2 * Math.PI : x; };

/** Where to cut a full turn so that no hole crosses the cut: the middle of the widest angular gap between hole vertices, or null (no holes / no room). */
function seamAngle(holeAngles) {
  if (!holeAngles.length) return null;
  const a = holeAngles.slice().sort((x, y) => x - y);
  let gap = 2 * Math.PI - (a[a.length - 1] - a[0]), at = a[a.length - 1] + gap / 2;
  for (let i = 0; i + 1 < a.length; i++) if (a[i + 1] - a[i] > gap) { gap = a[i + 1] - a[i]; at = a[i] + gap / 2; }
  return gap > 4 * RAD ? at : null;
}
/** Trim of a full-turn face: the whole domain with the holes cut out (a hole must not cross the seam: the seam is put where none does). */
function fullTrim(s, holeLoops, uvOf) {
  const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
  let trim = null;
  try { trim = T.addLoop(s, null, [[ua, va], [ub, va], [ub, vb], [ua, vb]], { hole: false }); } catch { return { trim: null, note: 'trim_failed' }; }
  let skipped = 0;
  for (const L of holeLoops) {
    const k = Math.ceil(L.length / 3500), uv = (k > 1 ? L.filter((_, i) => i % k === 0) : L).map((v) => uvOf(v));
    try { trim = T.addLoop(s, trim, uv, { hole: true }); } catch { skipped++; }
  }
  return { trim, note: skipped ? 'holes_skipped' : undefined };
}

/** A cylinder or a cone: a line revolved about the axis, exact and rational. `radiusAt(z)` is the distance from the axis at height z above `o`. */
function revolvedPatch(M, tris, m, inSet, o, radiusAt, model) {
  const vs = vertsOf(M, tris), { e1, e2 } = cylFrame(m.a);
  const th = new Map(); let z0 = Infinity, z1 = -Infinity;
  for (const i of vs) {
    const d = V.sub(pt(M, i), o), z = V.dot(d, m.a);
    th.set(i, [Math.atan2(V.dot(d, e2), V.dot(d, e1)), z]);
    if (z < z0) z0 = z; if (z > z1) z1 = z;
  }
  if (!(z1 - z0 > 1e-9)) return null;
  const angs = [...th.values()].map((q) => q[0]).sort((x, y) => x - y);
  let gap = 2 * Math.PI - (angs[angs.length - 1] - angs[0]), gi = -1;
  for (let i = 0; i + 1 < angs.length; i++) if (angs[i + 1] - angs[i] > gap) { gap = angs[i + 1] - angs[i]; gi = i; }
  let th0 = gi < 0 ? angs[0] : angs[gi + 1];
  const full = gap < 12 * RAD;
  // a full turn: boundary loops that do not go round the axis are holes; the seam goes where none of them is
  let holes = [];
  if (full) {
    for (const L of boundaryLoops(M, tris, inSet)) {
      let acc = 0; for (let i = 0; i < L.length; i++) acc += wrapPi(th.get(L[(i + 1) % L.length])[0] - th.get(L[i])[0]);
      if (Math.abs(acc) < Math.PI) holes.push(L);
    }
    if (holes.length) { const sa = seamAngle(holes.flatMap((L) => L.map((v) => th.get(v)[0]))); if (sa === null) holes = []; else th0 = sa; }
  }
  const span = full ? 2 * Math.PI : 2 * Math.PI - gap;
  if (!(span > 1e-3)) return null;
  const rad = (a) => V.add(V.mul(e1, Math.cos(a)), V.mul(e2, Math.sin(a)));
  const R0 = Math.max(0, radiusAt(z0)), R1 = Math.max(0, radiusAt(z1));
  const P0 = V.add(V.add(o, V.mul(m.a, z0)), V.mul(rad(th0), R0)), P1 = V.add(V.add(o, V.mul(m.a, z1)), V.mul(rad(th0), R1));
  const profile = { deg: 1, knots: [0, 0, 1, 1], cvs: [P0, P1], w: null };
  const s = K.revolve(profile, o, m.a, span).surface;
  const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
  const vOf = angleToV(span);
  const uvOf = (i) => {
    const q = th.get(i); let d = (q[0] - th0) % (2 * Math.PI); if (d < 0) d += 2 * Math.PI;
    if (full && d > span - 1e-12) d = span;
    return [ua + (ub - ua) * (q[1] - z0) / (z1 - z0), va + (vb - va) * vOf(d)];
  };
  const tr = full ? (holes.length ? fullTrim(s, holes, uvOf) : { trim: null, note: 'seam_untrimmed' }) : trimFrom(M, s, tris, inSet, uvOf);
  return { surface: s, trim: tr.trim, note: tr.note, uvOf, model: { ...model, full, spanDeg: span / RAD, z0, z1 } };
}
const cylinderPatch = (M, tris, m, inSet) => revolvedPatch(M, tris, m, inSet, m.c, () => m.r, { c: m.c, a: m.a, r: m.r });
const conePatch = (M, tris, m, inSet) => {
  const tn = Math.tan(m.alpha);
  return revolvedPatch(M, tris, m, inSet, m.apex, (z) => z * tn, { apex: m.apex, a: m.a, halfAngle: m.alpha / RAD });
};

/** A sphere: a half circle revolved about an axis through the centre that is square to the piece's middle direction, so a patch keeps away from the poles. */
function spherePatch(M, tris, m, inSet) {
  const vs = vertsOf(M, tris);
  let mean = [0, 0, 0]; for (const i of vs) mean = V.add(mean, V.norm(V.sub(pt(M, i), m.c)));
  const ml = V.len(mean) / vs.length;
  const Z = ml > 0.2 ? V.perp(V.mul(mean, 1 / V.len(mean))) : V.norm([0.3719, 0.5233, 0.7673]), { e1, e2 } = cylFrame(Z);   // a whole sphere: poles at a direction no scan is built along
  const th = new Map();
  for (const i of vs) { const d = V.sub(pt(M, i), m.c); th.set(i, [Math.atan2(V.dot(d, e2), V.dot(d, e1)), Math.asin(Math.max(-1, Math.min(1, V.dot(d, Z) / V.len(d))))]); }
  const angs = [...th.values()].map((q) => q[0]).sort((x, y) => x - y);
  let gap = 2 * Math.PI - (angs[angs.length - 1] - angs[0]), gi = -1;
  for (let i = 0; i + 1 < angs.length; i++) if (angs[i + 1] - angs[i] > gap) { gap = angs[i + 1] - angs[i]; gi = i; }
  const th0 = gi < 0 ? angs[0] : angs[gi + 1];
  const full = gap < 12 * RAD, span = full ? 2 * Math.PI : 2 * Math.PI - gap;
  if (!(span > 1e-3)) return null;
  const X = V.add(V.mul(e1, Math.cos(th0)), V.mul(e2, Math.sin(th0)));
  const prof = C.arc(m.c, X, Z, m.r, -Math.PI / 2, Math.PI / 2);
  const s = K.revolve(prof, m.c, Z, span).surface;
  const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s), [pa, pb] = C.domain(prof);
  const N = 256, lat = [];   // latitude along the profile (the rational arc is not uniform in angle): a table to invert
  for (let k = 0; k <= N; k++) { const q = C.point(prof, pa + (pb - pa) * k / N); lat.push(Math.asin(Math.max(-1, Math.min(1, V.dot(V.sub(q, m.c), Z) / m.r)))); }
  const uOf = (phi) => {
    let lo = 0, hi = N; while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (lat[mid] <= phi) lo = mid; else hi = mid; }
    const f = lat[hi] > lat[lo] ? Math.max(0, Math.min(1, (phi - lat[lo]) / (lat[hi] - lat[lo]))) : 0;
    return ua + (ub - ua) * (lo + f) / N;
  };
  const vOf = angleToV(span);
  const uvOf = (i) => {
    const q = th.get(i); let d = (q[0] - th0) % (2 * Math.PI); if (d < 0) d += 2 * Math.PI;
    if (full && d > span - 1e-12) d = span;
    return [uOf(q[1]), va + (vb - va) * vOf(d)];
  };
  const tr = full ? { trim: null, note: 'seam_untrimmed' } : trimFrom(M, s, tris, inSet, uvOf);
  return { surface: s, trim: tr.trim, note: tr.note, uvOf, model: { c: m.c, r: m.r, full, spanDeg: span / RAD } };
}

/** Largest gap of a set of angles on the circle: { start (first angle after the gap), span (the rest), full (gap under 12 degrees) }. */
function angularSpan(list) {
  const angs = list.slice().sort((x, y) => x - y);
  let gap = 2 * Math.PI - (angs[angs.length - 1] - angs[0]), gi = -1;
  for (let i = 0; i + 1 < angs.length; i++) if (angs[i + 1] - angs[i] > gap) { gap = angs[i + 1] - angs[i]; gi = i; }
  const full = gap < 12 * RAD;
  return { start: gi < 0 ? angs[0] : angs[gi + 1], span: full ? 2 * Math.PI : 2 * Math.PI - gap, full };
}
const offsetOf = (a, a0) => { let d = (a - a0) % (2 * Math.PI); if (d < 0) d += 2 * Math.PI; return d; };

/** A torus face: the tube's circular arc (only over the angles the piece covers) revolved about the axis, exact and rational. */
function torusPatch(M, tris, m, inSet) {
  const vs = vertsOf(M, tris), { e1, e2 } = cylFrame(m.a), q = new Map();
  for (const i of vs) {
    const d = V.sub(pt(M, i), m.c), h = V.dot(d, m.a), rho = V.len(V.sub(d, V.mul(m.a, h)));
    q.set(i, [Math.atan2(V.dot(d, e2), V.dot(d, e1)), Math.atan2(h, rho - m.R)]);   // [around the axis, around the tube]
  }
  const ar = angularSpan([...q.values()].map((x) => x[0])), tu = angularSpan([...q.values()].map((x) => x[1]));
  if (!(ar.span > 1e-3) || !(tu.span > 1e-3)) return null;
  const X = V.add(V.mul(e1, Math.cos(ar.start)), V.mul(e2, Math.sin(ar.start)));
  const prof = C.arc(V.add(m.c, V.mul(X, m.R)), X, m.a, m.r, tu.start, tu.start + tu.span);
  const s = K.revolve(prof, m.c, m.a, ar.span).surface;
  const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s), uOf = angleToV(tu.span), vOf = angleToV(ar.span);
  const uvOf = (i) => {
    const x = q.get(i); let du = offsetOf(x[1], tu.start), dv = offsetOf(x[0], ar.start);
    if (tu.full && du > tu.span - 1e-12) du = tu.span; if (ar.full && dv > ar.span - 1e-12) dv = ar.span;
    return [ua + (ub - ua) * uOf(du), va + (vb - va) * vOf(dv)];
  };
  const tr = ar.full || tu.full ? { trim: null, note: 'seam_untrimmed' } : trimFrom(M, s, tris, inSet, uvOf);
  return { surface: s, trim: tr.trim, note: tr.note, uvOf, model: { c: m.c, a: m.a, R: m.R, r: m.r, full: ar.full, spanDeg: ar.span / RAD, tubeDeg: tu.span / RAD } };
}

/** A VARIABLE-RADIUS fillet (0.9 engineer-09): a strip whose cross-sections square to its main direction are circular arcs whose radius
 *  changes along it. Sections are cut every few mm, each fitted by Kasa's circle; centre and radius are smoothed by a least-squares
 *  polynomial in the station (degree up to 3), and the face is lofted through exact rational arcs at those stations. A straight-ish spine
 *  only (the sections are planes square to ONE direction); a strip that is a constant radius or whose sections are not circles → null. */
function varFilletPatch(M, tris, inSet, tol) {
  const vs = vertsOf(M, tris), pts = vs.map((i) => pt(M, i));
  if (pts.length < 40) return null;
  // the spine direction: the one every normal of a blend is (nearly) square to = the normals' least-spread direction (as a cylinder's axis)
  const cov = zero3(); for (const t of tris) outer3(cov, nv(M, t), M.area[t]);
  // (of the normals' three principal directions, the one nearest the strip's long axis: a short arc of normals can spread less across than along)
  const pf = planeFrom(pts), evs = eigen3(cov).vectors, d = evs.reduce((a, v) => (Math.abs(V.dot(v, pf.e1)) > Math.abs(V.dot(a, pf.e1)) ? v : a), evs[0]), o = pf.o, { e1, e2 } = cylFrame(d);
  const sOf = pts.map((p) => V.dot(V.sub(p, o), d));
  let s0 = Infinity, s1 = -Infinity; for (const s of sOf) { if (s < s0) s0 = s; if (s > s1) s1 = s; }
  const L = s1 - s0; if (!(L > 1e-6)) return null;
  const K0 = Math.max(6, Math.min(40, Math.floor(pts.length / 14))), half = L / K0;
  const deg = Math.min(3, K0 - 3), tt = (s) => 2 * (s - s0) / L - 1;
  const polyFit = (st, ys) => {
    const n = deg + 1, A = Array.from({ length: n }, () => new Array(n).fill(0)), b = new Array(n).fill(0);
    st.forEach((x, i) => { const t = tt(x.s), row = Array.from({ length: n }, (_, j) => t ** j); for (let a = 0; a < n; a++) { b[a] += row[a] * ys[i]; for (let c = 0; c < n; c++) A[a][c] += row[a] * row[c]; } });
    const sol = V.solve(A, b.map((v) => [v])); return sol ? sol.map((r) => r[0]) : null;
  };
  const ev = (co, s) => co.reduce((a, c, j) => a + c * tt(s) ** j, 0);
  // pass 0 fits each slab as it is; passes 1-2 first move every point of a slab to its station along the law of the pass before (its offset
  // from its own centre, scaled by the radius ratio), so a radius that changes inside a slab does not bias the section's circle
  let law = null, st = [];
  for (let pass = 0; pass < 3; pass++) {
    st = [];
    for (let k = 0; k < K0; k++) {
      const sk0 = s0 + (k + 0.5) * L / K0, idx = []; let sm = 0;
      for (let i = 0; i < pts.length; i++) if (Math.abs(sOf[i] - sk0) <= half) { idx.push(i); sm += sOf[i]; }
      if (idx.length < 6) return null;
      const sk = sm / idx.length;                                     // the station is where its points are (the end slabs are one-sided)
      const sel = idx.map((i) => {
        if (!law) return pts[i];
        const w = V.sub(pts[i], law.centre(sOf[i])), wp = V.sub(w, V.mul(d, V.dot(w, d)));
        return V.add(law.centre(sk), V.mul(wp, law.radius(sk) / law.radius(sOf[i])));
      });
      const ci = circleFit(sel, d, V.add(o, V.mul(d, sk))); if (!ci) return null;
      let worst = 0; for (const p of sel) { const q = V.sub(p, ci.c); worst = Math.max(worst, Math.abs(V.len(V.sub(q, V.mul(d, V.dot(q, d)))) - ci.r)); }
      if (worst > tol) return null;                                   // a section that is not a circle: not a rolling-ball blend
      st.push({ s: sk, c: ci.c, r: ci.r });
    }
    // least-squares polynomial law in t in [-1, 1] for the centre (in the section plane) and the radius
    const cx = polyFit(st, st.map((x) => V.dot(V.sub(x.c, o), e1))), cy = polyFit(st, st.map((x) => V.dot(V.sub(x.c, o), e2))), cr = polyFit(st, st.map((x) => x.r));
    if (!cx || !cy || !cr) return null;
    law = { centre: (s) => V.add(o, V.add(V.mul(d, s), V.add(V.mul(e1, ev(cx, s)), V.mul(e2, ev(cy, s))))), radius: (s) => ev(cr, s) };
    if (!(law.radius(s0) > 0) || !(law.radius(s1) > 0)) return null;
  }
  const centre = law.centre, radius = law.radius;
  let rmin = Infinity, rmax = -Infinity; for (let k = 0; k <= 32; k++) { const r = radius(s0 + L * k / 32); if (r < rmin) rmin = r; if (r > rmax) rmax = r; }
  if (!(rmin > 2 * tol) || rmax - rmin <= tol) return null;           // constant radius: a cylinder's job (and reported as one)
  // the arc's angles: every vertex about its own station's centre, one span for all sections
  const ang = pts.map((p, i) => { const q = V.sub(p, centre(sOf[i])); return Math.atan2(V.dot(q, e2), V.dot(q, e1)); });
  const sp = angularSpan(ang); if (sp.full || !(sp.span > 5 * RAD)) return null;
  const pad = 0.02 * L, NS = Math.max(4, Math.min(24, st.length)), sections = [];
  for (let k = 0; k <= NS; k++) { const s = s0 - pad + (L + 2 * pad) * k / NS; sections.push(C.arc(centre(s), e1, e2, radius(s), sp.start - 0.02, sp.start + sp.span + 0.02)); }
  let surface; try { surface = K.loft(sections, { degree: Math.min(3, NS) }).surface; } catch { return null; }
  const uvMap = new Map(); vs.forEach((vi, k) => { const r = S.closestPoint(surface, pts[k]); uvMap.set(vi, [r.u, r.v]); });
  const uvOf = (i) => uvMap.get(i);
  const tr = trimFrom(M, surface, tris, inSet, uvOf);
  const lawPts = [0, 0.25, 0.5, 0.75, 1].map((f) => { const sx = s0 + f * L; return { at: V.add(o, V.mul(d, sx)), f, r: radius(sx) }; });   // the radius along the spine
  return { surface, trim: tr.trim, note: tr.note, uvOf, vs, model: { r: (rmin + rmax) / 2, rFrom: radius(s0), rTo: radius(s1), rMin: rmin, rMax: rmax, length: L, dir: d, sections: st.length, law: lawPts, lawDeg: deg } };
}

/** One tensor B-spline patch through a piece that is a height field over its best plane; null when it folds. */
function freeformPatch(M, tris, inSet, tol, maxCvs) {
  const vs = vertsOf(M, tris), pts = vs.map((i) => pt(M, i));
  const m = planeFrom(pts);
  let nsum = [0, 0, 0]; for (const t of tris) nsum = V.add(nsum, V.mul(nv(M, t), M.area[t]));
  const nz = V.dot(nsum, m.n) < 0 ? V.mul(m.n, -1) : m.n;
  let flat = 0, atot = 0;
  for (const t of tris) { atot += M.area[t]; if (V.dot(nv(M, t), nz) > 0.3) flat += M.area[t]; }
  if (flat < 0.98 * atot) return { folded: true };
  const e1 = m.e1, e2 = V.cross(nz, e1);
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  const xy = pts.map((p) => { const d = V.sub(p, m.o), x = V.dot(d, e1), y = V.dot(d, e2); if (x < u0) u0 = x; if (x > u1) u1 = x; if (y < v0) v0 = y; if (y > v1) v1 = y; return [x, y]; });
  if (!(u1 - u0 > 1e-9) || !(v1 - v0 > 1e-9)) return { folded: true };
  const uv = xy.map(([x, y]) => [(x - u0) / (u1 - u0), (y - v0) / (v1 - v0)]);
  const stride = Math.max(1, Math.ceil(pts.length / 20000)), idx = []; for (let i = 0; i < pts.length; i += stride) idx.push(i);
  const hmean = pts.reduce((a, p) => a + V.dot(V.sub(p, m.o), nz), 0) / pts.length;
  let nu = 4, nvv = 4, best = null;
  for (;;) {
    const du = Math.min(3, nu - 1), dv = Math.min(3, nvv - 1);
    const Ku = BA.clampedUniform(nu, du), Kv = BA.clampedUniform(nvv, dv), nc = nu * nvv;
    const AtA = Array.from({ length: nc }, () => new Float64Array(nc)), Atb = [new Float64Array(nc), new Float64Array(nc), new Float64Array(nc)];
    for (const i of idx) {
      const [u, v] = uv[i], ku = BA.findSpan(nu - 1, du, u, Ku), kv = BA.findSpan(nvv - 1, dv, v, Kv);
      const Nu = BA.basisFuns(ku, u, du, Ku), Nv = BA.basisFuns(kv, v, dv, Kv), cols = [], w = [];
      for (let a = 0; a <= du; a++) for (let b = 0; b <= dv; b++) { cols.push((ku - du + a) * nvv + (kv - dv + b)); w.push(Nu[a] * Nv[b]); }
      for (let a = 0; a < cols.length; a++) {
        for (let b = 0; b < cols.length; b++) AtA[cols[a]][cols[b]] += w[a] * w[b];
        for (let k = 0; k < 3; k++) Atb[k][cols[a]] += w[a] * pts[i][k];
      }
    }
    // a small pull toward the flat net keeps control points that no data reaches from running away
    const gu = BA.greville(Ku, du, nu), gv = BA.greville(Kv, dv, nvv);
    let tr = 0; for (let i = 0; i < nc; i++) tr += AtA[i][i];
    const lam = 1e-6 * tr / nc + 1e-12, X0 = [];
    for (let a = 0; a < nu; a++) for (let b = 0; b < nvv; b++) X0.push(V.add(V.add(m.o, V.mul(nz, hmean)), V.add(V.mul(e1, u0 + gu[a] * (u1 - u0)), V.mul(e2, v0 + gv[b] * (v1 - v0)))));
    const A = AtA.map((r, i) => { const o = Array.from(r); o[i] += lam; return o; });
    const B = X0.map((x, i) => [Atb[0][i] + lam * x[0], Atb[1][i] + lam * x[1], Atb[2][i] + lam * x[2]]);
    const sol = V.solve(A, B);
    if (!sol) return { folded: true };
    const cvs = Array.from({ length: nu }, (_, a) => Array.from({ length: nvv }, (_, b) => sol[a * nvv + b].slice(0, 3)));
    const s = { degU: du, degV: dv, knotsU: Ku, knotsV: Kv, cvs, w: null };
    // conservative stop test: distance from each sample to the surface at ITS OWN (u, v) (>= the true closest distance)
    let worst = 0;
    for (const i of idx) { const q = S.point(s, uv[i][0], uv[i][1]); worst = Math.max(worst, V.dist(q, pts[i])); }
    best = { s, worst, nu, nvv };
    if (worst <= tol * 0.8 || (nu >= maxCvs && nvv >= maxCvs)) break;
    const nu2 = Math.min(maxCvs, Math.ceil(nu * 1.4) + 1), nv2 = Math.min(maxCvs, Math.ceil(nvv * 1.4) + 1);
    if (nu2 * nvv * 4 > idx.length * 1 && nv2 * nu2 * 4 > idx.length) break;   // more control points than a quarter of the samples: stop growing
    nu = nu2; nvv = nv2;
  }
  const uvMap = new Map(); vs.forEach((vi, k) => uvMap.set(vi, uv[k]));
  const uvOf = (i) => uvMap.get(i);
  const tr = trimFrom(M, best.s, tris, inSet, uvOf);
  return { surface: best.s, trim: tr.trim, note: tr.note, uvOf, model: { nu: best.nu, nv: best.nvv, fitMax: best.worst }, uvMap, vs };
}

// ------------------------------------------------------------------------------------------------ measuring

function measure(M, surface, vs, uvOf, tol, cap = 3000, tris = null) {
  // the vertices AND the middle of every triangle: a facet of a coarse mesh can sag between its corners, which vertices alone never show
  const items = vs.map((i) => ({ p: pt(M, i), uv: uvOf ? uvOf(i) : null }));
  if (tris) for (const t of tris) {
    const a = M.tri[t * 3], b = M.tri[t * 3 + 1], c = M.tri[t * 3 + 2];
    const ua = uvOf && uvOf(a), ub = uvOf && uvOf(b), uc = uvOf && uvOf(c);
    let uv = null;
    if (ua && ub && uc) {
      const [u0, u1] = S.domainU(surface), [v0, v1] = S.domainV(surface);
      const near = (x, y, w) => Math.abs(x - y) < 0.5 * w;
      uv = near(ua[0], ub[0], u1 - u0) && near(ua[0], uc[0], u1 - u0) && near(ua[1], ub[1], v1 - v0) && near(ua[1], uc[1], v1 - v0)
        ? [(ua[0] + ub[0] + uc[0]) / 3, (ua[1] + ub[1] + uc[1]) / 3] : ua;
    }
    items.push({ p: cn(M, t), uv });
  }
  const stride = Math.max(1, Math.ceil(items.length / cap)), d = [], smp = [];
  for (let k = 0; k < items.length; k += stride) {
    const it = items[k], r = S.closestPoint(surface, it.p, it.uv ? { uv0: it.uv } : {});
    d.push(r.d); smp.push(it.p[0], it.p[1], it.p[2], r.d);
  }
  const all = d.slice();
  d.sort((x, y) => x - y);
  const n = d.length; let ss = 0, within = 0; for (const x of d) { ss += x * x; if (x <= tol) within++; }
  const out = { n, rms: Math.sqrt(ss / n), max: d[n - 1], p95: d[Math.min(n - 1, Math.floor(0.95 * n))], within: within / n, tol };
  Object.defineProperty(out, 'samples', { value: smp, writable: true, configurable: true, enumerable: false });   // x, y, z, distance per measured point: for the deviation map
  void all;
  return out;
}

// ------------------------------------------------------------------------------------------------ the whole fit

export function fit(mesh, opts = {}) {
  const o = { tol: 0.2, minShare: 0.01, cylShare: 0.05, maxPatches: 48, angle: 12, seed: 1, cylinders: true, spheres: true, cones: true, tori: true, varFillets: true, blends: true, blendMax: 0, blendTol: 0, blendShare: 0.0002,
    freeform: true, maxTriangles: 300000, maxCvs: 20, mapPoints: 6000, budgetMs: 20000, ...opts };
  const t0 = Date.now();
  const M = prepare(mesh, o.maxTriangles);
  if (!(M.total > 0)) fail('nurbs.err.scan_empty');
  const cosA = Math.cos(o.angle * RAD), minArea = o.minShare * M.total, rand = rng(o.seed);
  const rmax = o.blendMax > 0 ? o.blendMax : 0.12 * M.size;
  const free = new Uint8Array(M.nt).fill(1);
  const patches = [], unfitted = [];
  const pool = () => { const l = []; for (let t = 0; t < M.nt; t++) if (free[t]) l.push(t); return l; };
  const sub = (list, k) => { if (list.length <= k) return list; const out = []; for (let i = 0; i < k; i++) out.push(list[Math.floor(rand() * list.length)]); return out; };
  const take = (tris) => { for (const t of tris) free[t] = 0; };
  const smoothTried = new Set();
  const freeFlags = () => free;
  const counters = { plane: 0, cylinder: 0, sphere: 0, cone: 0, torus: 0, varfillet: 0, freeform: 0 };
  const name = (k) => 'Scan ' + k + ' ' + (++counters[k]);
  const INL = { plane: planeInliers, cylinder: cylInliers, sphere: sphInliers, cone: coneInliers, torus: torInliers };
  const flags = new Uint8Array(M.nt);

  /** Random sampling on the free triangles: the best model of each allowed kind, refined on all free triangles, its largest connected piece. */
  const candidates = (P, kinds, rcap, tolU = o.tol, axes = []) => {
    const trials = 150, test = sub(P, 3000), testSet = new Uint8Array(M.nt); for (const t of test) testSet[t] = 1;
    const score = (inl) => { let a = 0; for (const t of test) if (inl[t]) a += M.area[t]; return a; };
    // area-weighted draws: a big flat face made of two triangles is as likely to be tried as a dense strip of equal area
    const cum = new Float64Array(P.length); let tot = 0; for (let i = 0; i < P.length; i++) { tot += M.area[P[i]]; cum[i] = tot; }
    const pick1 = () => { const x = rand() * tot; let lo = 0, hi = P.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < x) lo = mid + 1; else hi = mid; } return P[lo]; };
    const best = {};
    const tryModel = (kind, m) => {
      if (!m) return;
      flags.fill(0); INL[kind](M, m, tolU, cosA, testSet, flags);
      const sc = score(flags);
      if (!best[kind] || sc > best[kind].sc) best[kind] = { m, sc };
    };
    if (kinds.includes('plane')) for (let i = 0; i < trials; i++) { const t = pick1(); tryModel('plane', { kind: 'plane', o: cn(M, t), n: nv(M, t) }); }
    if (kinds.includes('cylinder')) for (let i = 0; i < trials * 3; i++) tryModel('cylinder', cylFromTwo(M, pick1(), pick1(), M.size, tolU));
    if (kinds.includes('sphere')) for (let i = 0; i < trials * 3; i++) tryModel('sphere', sphFromTwo(M, pick1(), pick1(), M.size, tolU));
    if (kinds.includes('cone')) for (let i = 0; i < trials * 3; i++) tryModel('cone', coneFromThree(M, pick1(), pick1(), pick1(), M.size, tolU));
    if (kinds.includes('torus')) for (const ax of axes) for (let i = 0; i < trials * 2; i++) tryModel('torus', torFromTwo(M, ax, pick1(), pick1(), tolU, rcap || rmax));
    const refine = { plane: (tris) => planeFit(M, tris), cylinder: (tris, m) => cylRefine(M, tris, m), sphere: (tris, m) => sphRefine(M, tris, m), cone: (tris, m) => coneRefine(M, tris, m), torus: (tris, m) => torRefine(M, tris, m) };
    const full = (kind, m0) => {
      let m = m0;
      for (let it = 0; it < 3; it++) {
        flags.fill(0); INL[kind](M, m, tolU, cosA, free, flags);
        const comps = components(M, flags); if (!comps.length) return null;
        const r = refine[kind](comps[0].tris, m);
        if (!r) return null; m = r;
      }
      if (rcap && (kind === 'cylinder' || kind === 'sphere' || kind === 'torus')) {
        // small round features: triangles of the neighbouring face that happen to lie within the tolerance skew a small radius, so refit on the
        // triangles that agree with the model (robust spread of the residuals), twice, before the radius is taken
        const dist = kind === 'cylinder' ? cylDist : kind === 'sphere' ? sphDist : torDist;
        for (let k = 0; k < 2; k++) {
          flags.fill(0); INL[kind](M, m, tolU, cosA, free, flags);
          const comp = components(M, flags)[0]; if (!comp) return null;
          const res = vertsOf(M, comp.tris).map((i) => dist(m, pt(M, i))).sort((x, y) => x - y);
          const cut = Math.max(2.5 * 1.4826 * res[Math.floor(res.length / 2)], 0.05 * tolU);
          const keep = comp.tris.filter((t) => { for (let q = 0; q < 3; q++) if (dist(m, pt(M, M.tri[t * 3 + q])) > cut) return false; return true; });
          if (keep.length < 8) break;
          const r2 = refine[kind](keep, m); if (!r2) break; m = r2;
        }
        if (m.r > rcap) return null;
      }
      flags.fill(0); INL[kind](M, m, tolU, cosA, free, flags);
      const comps = components(M, flags); if (!comps.length) return null;
      const set = new Uint8Array(M.nt); for (const t of comps[0].tris) set[t] = 1;
      return { kind, m, piece: comps[0], set };
    };
    const out = [];
    for (const kind of ['plane', 'cylinder', 'sphere', 'cone', 'torus']) if (best[kind] && best[kind].sc > 0) { const c = full(kind, best[kind].m); if (c) out.push(c); }
    return out;
  };
  const build = (pick) => pick.kind === 'plane' ? planePatch(M, pick.piece.tris, pick.m, pick.set)
    : pick.kind === 'cylinder' ? cylinderPatch(M, pick.piece.tris, pick.m, pick.set)
    : pick.kind === 'sphere' ? spherePatch(M, pick.piece.tris, pick.m, pick.set) : pick.kind === 'torus' ? torusPatch(M, pick.piece.tris, pick.m, pick.set)
    : conePatch(M, pick.piece.tris, pick.m, pick.set);
  const pieces = [];   // primitives found, built after the leftovers next to them are joined in
  const count = () => patches.length + pieces.length;
  const add = (pick, blend) => { take(pick.piece.tris); pieces.push({ kind: pick.kind, m: pick.m, tris: pick.piece.tris.slice(), blend }); };
  const finish = (pc) => {
    const set = new Uint8Array(M.nt); let area = 0; for (const t of pc.tris) { set[t] = 1; area += M.area[t]; }
    const pick = { kind: pc.kind, m: pc.m, piece: { tris: pc.tris, area }, set };
    const built = build(pick);
    if (!built) { unfitted.push({ tris: pc.tris.length, area, reason: 'small' }); return; }
    const vs = vertsOf(M, pc.tris);
    patches.push({ kind: pc.kind, name: name(pc.kind), surface: built.surface, trim: built.trim, tris: pc.tris.length, area, model: built.model, note: built.note, stats: measure(M, built.surface, vs, built.uvOf, o.tol, 4000, pc.tris), triList: pc.tris, fromBlendPass: pc.blend });
  };
  const primDist = (m, p) => m.kind === 'plane' ? Math.abs(V.dot(V.sub(p, m.o), m.n)) : m.kind === 'cylinder' ? cylDist(m, p) : m.kind === 'sphere' ? sphDist(m, p) : m.kind === 'torus' ? torDist(m, p) : coneDist(m, p);
  /** Left-over triangles that sit within the tolerance of a neighbouring primitive join it: the rows a plane and a fillet each declined are not a gap between them. */
  const grow = () => {
    const own = new Int32Array(M.nt); pieces.forEach((pc, i) => { for (const t of pc.tris) own[t] = i + 1; });
    for (let pass = 0; pass < 8; pass++) {
      let moved = 0;
      for (let t = 0; t < M.nt; t++) {
        if (!free[t]) continue;
        let best = -1, bd = Infinity;
        for (const n of M.nb[t]) {
          const ow = own[n] - 1; if (ow < 0) continue;
          const m = pieces[ow].m; let d = 0;
          for (let k = 0; k < 3; k++) d = Math.max(d, primDist(m, pt(M, M.tri[t * 3 + k])));
          if (d <= o.tol && d < bd) { bd = d; best = ow; }
        }
        if (best >= 0) { own[t] = best + 1; free[t] = 0; pieces[best].tris.push(t); moved++; }
      }
      if (!moved) break;
    }
  };

  /** Triangles of found faces next to a strip whose corners lie on `surface` (within the tolerance, and under half their distance to their own face). */
  const winBack = (strip, inSet, surface) => {
    const own = new Int32Array(M.nt); pieces.forEach((pc, i) => { for (const t of pc.tris) own[t] = i + 1; });
    const mine = new Uint8Array(M.nt); for (const t of strip) mine[t] = 1;
    const won = [], dCache = new Map(), dS = (v) => { if (!dCache.has(v)) dCache.set(v, S.closestPoint(surface, pt(M, v)).d); return dCache.get(v); };
    for (let pass = 0; pass < 4; pass++) {
      let moved = 0;
      for (let t = 0; t < M.nt; t++) {
        if (mine[t] || !own[t]) continue;
        if (!M.nb[t].some((n) => mine[n])) continue;
        const m = pieces[own[t] - 1].m; let dp = 0, df = 0;
        for (let k = 0; k < 3; k++) { const v = M.tri[t * 3 + k]; dp = Math.max(dp, primDist(m, pt(M, v))); df = Math.max(df, dS(v)); }
        if (df <= o.tol && df < 0.5 * dp) { mine[t] = 1; won.push(t); moved++; }
      }
      if (!moved) break;
    }
    void inSet; return won;
  };
  const tangentToPieces = (tris) => {
    const own = new Int32Array(M.nt); pieces.forEach((pc, i) => { for (const t of pc.tris) own[t] = i + 1; });
    const inC = new Uint8Array(M.nt); for (const t of tris) inC[t] = 1;
    let edges = 0, tangent = 0; const nbr = new Set();
    for (const t of tris) for (const n of M.nb[t]) { if (inC[n]) continue; edges++; if (own[n] > 0 && V.dot(nv(M, t), nv(M, n)) >= Math.cos(35 * RAD)) { tangent++; nbr.add(own[n]); } }
    return edges > 0 && tangent / edges >= 0.6 && nbr.size >= 2;
  };
  for (let round = 0; round < o.maxPatches * 3 && count() < o.maxPatches; round++) {
    const P = pool(); if (P.length < 1) break;
    // a smooth sheet is ONE face: if the largest free piece is a height field that one patch fits within the tolerance (and a plane does
    // not), take it whole instead of cutting it into plane and cylinder strips
    if (o.freeform && !smoothTried.has(round)) {
      const comp = components(M, freeFlags())[0];
      if (comp && comp.area >= minArea && comp.tris.length >= 8) {
        const set = new Uint8Array(M.nt); for (const t of comp.tris) set[t] = 1;
        const pf = planeFit(M, comp.tris);
        let planar = true; for (const i of vertsOf(M, comp.tris)) if (Math.abs(V.dot(V.sub(pt(M, i), pf.o), pf.n)) > o.tol) { planar = false; break; }
        // a strip that runs tangent into two faces already found is tried as a variable-radius fillet first (0.9 engineer-09)
        if (!planar && o.varFillets && pieces.length >= 2 && Date.now() - t0 <= o.budgetMs && tangentToPieces(comp.tris)) {
          let vf = varFilletPatch(M, comp.tris, set, o.tol), strip = comp.tris;
          if (vf) {
            // a plane takes the first facet rows of a fillet that lie within the tolerance of it; win back the neighbouring triangles that
            // sit on the fillet (much closer to it than to their own face), so the two faces meet where the surfaces do, then build again
            const won = winBack(strip, set, vf.surface);
            if (won.length) {
              const set2 = new Uint8Array(M.nt); const s2 = strip.concat(won); for (const t of s2) set2[t] = 1;
              const vf2 = varFilletPatch(M, s2, set2, o.tol);
              if (vf2) { for (const pc of pieces) pc.tris = pc.tris.filter((t) => !set2[t]); vf = vf2; strip = s2; for (const t of won) set[t] = 1; }
            }
          }
          const st = vf ? measure(M, vf.surface, vf.vs, vf.uvOf, o.tol, 4000, strip) : null;
          if (st && st.max <= 1.5 * o.tol) {
            take(strip); let area = 0; for (const t of strip) area += M.area[t];
            patches.push({ kind: 'varfillet', name: name('varfillet'), surface: vf.surface, trim: vf.trim, tris: strip.length, area, model: vf.model, note: vf.note, stats: st, triList: strip });
            continue;
          }
        }
        if (!planar) {
          const f = freeformPatch(M, comp.tris, set, o.tol, o.maxCvs);
          if (!f.folded && f.model.fitMax <= o.tol) {
            take(comp.tris);
            patches.push({ kind: 'freeform', name: name('freeform'), surface: f.surface, trim: f.trim, tris: comp.tris.length, area: comp.area, model: f.model, note: f.note, stats: measure(M, f.surface, f.vs, f.uvOf, o.tol, 4000, comp.tris), triList: comp.tris });
            continue;
          }
        }
      }
    }
    const kinds = ['plane']; if (o.cylinders) kinds.push('cylinder'); if (o.spheres) kinds.push('sphere'); if (o.cones) kinds.push('cone');
    const cs = candidates(P, kinds, 0);
    let pick = cs.find((c) => c.kind === 'plane') || null;
    // a curved primitive must cover a real share of the surface (a gently curved free-form sheet is otherwise cut into dozens of strips)
    // and beat the simpler model by a margin
    for (const c of cs) if (c.kind !== 'plane' && c.piece.area >= Math.max(minArea, o.cylShare * M.total) && (!pick || c.piece.area > 1.05 * pick.piece.area)) pick = c;
    if (!pick || pick.piece.area < minArea) break;
    add(pick, false);
  }

  // blends and small round features (0.9 round 2): cylinders and spheres of a small radius, kept to the few triangles that are left over
  if (o.blends && (o.cylinders || o.spheres)) {
    const bArea = Math.max(o.blendShare * M.total, 1e-9);
    for (let round = 0; round < 40 && count() < o.maxPatches; round++) {
      const P = pool(); if (P.length < 8 || Date.now() - t0 > o.budgetMs) break;   // time-boxed: this pass only looks at what is left over
      const kinds = []; if (o.cylinders) kinds.push('cylinder'); if (o.spheres) kinds.push('sphere');
      // rim fillets (0.9 engineer-09): a torus about the axis of a cylinder or cone already found
      const axes = o.tori ? pieces.filter((pc) => pc.kind === 'cylinder' || (pc.kind === 'cone' && pc.m.apex)).map((pc) => ({ c: pc.kind === 'cone' ? pc.m.apex : pc.m.c, a: pc.m.a })) : [];
      if (axes.length) kinds.push('torus');
      const cs = candidates(P, kinds, rmax, o.blendTol > 0 ? o.blendTol : o.tol / 2, axes).filter((c) => c.piece.tris.length >= 8 && c.piece.area >= bArea);
      let pick = null; for (const c of cs) if (!pick || c.piece.area > pick.piece.area * (c.kind === 'cylinder' ? 1 : 1.05)) pick = c;
      if (!pick) break;
      add(pick, true);
    }
  }

  grow();
  for (const pc of pieces) finish(pc);

  // what is left: connected pieces as free-form patches; a piece that runs tangent into two or more fitted faces is first tried as a
  // variable-radius fillet (0.9 engineer-09)
  const own0 = new Int32Array(M.nt); patches.forEach((p, i) => { for (const t of p.triList) own0[t] = i + 1; });
  const tangentInto = (tris) => {
    const inC = new Uint8Array(M.nt); for (const t of tris) inC[t] = 1;
    let edges = 0, tangent = 0; const nbr = new Set();
    for (const t of tris) for (const n of M.nb[t]) {
      if (inC[n]) continue; edges++;
      if (own0[n] > 0 && V.dot(nv(M, t), nv(M, n)) >= Math.cos(35 * RAD)) { tangent++; nbr.add(own0[n] - 1); }
    }
    return edges && tangent / edges >= 0.7 && nbr.size >= 2;
  };
  const rest = components(M, free);
  let ignoredArea = 0, ignoredTris = 0;
  for (const c of rest) {
    if (c.area < minArea || c.tris.length < 8) { ignoredArea += c.area; ignoredTris += c.tris.length; if (c.area >= minArea * 0.25) unfitted.push({ tris: c.tris.length, area: c.area, reason: 'small' }); continue; }
    if (!o.freeform || count() >= o.maxPatches) { unfitted.push({ tris: c.tris.length, area: c.area, reason: 'small' }); continue; }
    const set = new Uint8Array(M.nt); for (const t of c.tris) set[t] = 1;
    if (o.varFillets && Date.now() - t0 <= o.budgetMs && tangentInto(c.tris)) {
      const vf = varFilletPatch(M, c.tris, set, o.tol);
      if (vf) {
        const st = measure(M, vf.surface, vf.vs, vf.uvOf, o.tol, 4000, c.tris);
        if (st.max <= 1.5 * o.tol) { patches.push({ kind: 'varfillet', name: name('varfillet'), surface: vf.surface, trim: vf.trim, tris: c.tris.length, area: c.area, model: vf.model, note: vf.note, stats: st, triList: c.tris }); continue; }
      }
    }
    const f = freeformPatch(M, c.tris, set, o.tol, o.maxCvs);
    if (f.folded) { unfitted.push({ tris: c.tris.length, area: c.area, reason: 'folded' }); continue; }
    patches.push({ kind: 'freeform', name: name('freeform'), surface: f.surface, trim: f.trim, tris: c.tris.length, area: c.area, model: f.model, note: f.note, stats: measure(M, f.surface, f.vs, f.uvOf, o.tol, 4000, c.tris), triList: c.tris });
  }

  // fillets: a cylinder or sphere of small radius that runs tangent into two or more other fitted faces (a constant-radius rolling ball)
  const owner = new Int32Array(M.nt);
  patches.forEach((p, i) => { for (const t of p.triList) owner[t] = i + 1; });
  const fillets = [];
  patches.forEach((p, i) => {
    if ((p.kind !== 'cylinder' && p.kind !== 'sphere' && p.kind !== 'torus' && p.kind !== 'varfillet') || !(p.model.r <= rmax)) return;
    let edges = 0, tangent = 0; const nbr = new Map();
    for (const t of p.triList) for (const n of M.nb[t]) {
      const ow = owner[n]; if (ow === i + 1) continue;
      edges++;
      if (ow > 0 && V.dot(nv(M, t), nv(M, n)) >= Math.cos(35 * RAD)) { tangent++; nbr.set(ow - 1, (nbr.get(ow - 1) || 0) + 1); }
    }
    if (edges && tangent / edges >= 0.7 && nbr.size >= 2) {
      p.blend = { radius: p.model.r, between: [...nbr.keys()].map((k) => patches[k].name), tangent: tangent / edges };
      const f = { name: p.name, kind: p.kind, radius: p.model.r, between: p.blend.between, rms: p.stats.rms, max: p.stats.max };
      if (p.kind === 'torus') f.major = p.blend.major = p.model.R;                                     // rim fillet: tube radius + the ring's radius
      if (p.kind === 'varfillet') { f.from = p.blend.from = p.model.rFrom; f.to = p.blend.to = p.model.rTo; f.rMin = p.model.rMin; f.rMax = p.model.rMax; }   // radius law along it
      fillets.push(f);
    }
  });

  let covered = 0, nAll = 0, ss = 0, mx = 0, within = 0, nSmp = 0;
  for (const p of patches) { covered += p.area; nAll += p.stats.n; ss += p.stats.rms * p.stats.rms * p.stats.n; within += p.stats.within * p.stats.n; mx = Math.max(mx, p.stats.max); nSmp += p.stats.samples.length / 4; }
  // the deviation map: measured points with their distance to the face they were fitted to (thinned to mapPoints in all)
  const map = new Float32Array(Math.min(nSmp, o.mapPoints) * 4), step = nSmp > o.mapPoints ? nSmp / o.mapPoints : 1;
  { let k = 0, acc = 0; for (const p of patches) { const a = p.stats.samples; for (let j = 0; j < a.length; j += 4) { acc += 1; if (acc >= step && k < map.length) { acc -= step; map[k++] = a[j]; map[k++] = a[j + 1]; map[k++] = a[j + 2]; map[k++] = a[j + 3]; } } } }
  const report = {
    tol: o.tol, triangles: M.nt, vertices: M.P.length / 3, area: M.total, size: M.size,
    patches: patches.length, covered: covered / M.total, ignored: ignoredArea / M.total, ignoredTris,
    rms: nAll ? Math.sqrt(ss / nAll) : null, max: patches.length ? mx : null, within: nAll ? within / nAll : null, samples: nAll,
    direction: 'mesh-to-surface', unfitted: unfitted.length, ms: Date.now() - t0, seed: o.seed, fillets, map,
  };
  for (const p of patches) { delete p.triList; p.stats.samples = null; }
  return { patches, unfitted, report };
}

/** Add the fitted faces to a patch set (doc.js); returns { doc, ids }. The caller passes doc.js's add and setTrim (no import cycle). */
export function intoDoc(D, doc, result) {
  let d = doc; const ids = [];
  for (const p of result.patches) {
    const r = D.add(d, 'surface', p.surface, { name: p.name }); d = r.doc; ids.push(r.id);
    if (p.trim) d = D.setTrim(d, r.id, p.trim);
  }
  return { doc: d, ids };
}

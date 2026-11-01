/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * surface.js — cc-nurbs (0.8 SU.747b, session `nurbs`): untrimmed tensor-product NURBS surfaces. DOM-free.
 *
 * A surface is plain data: { degU, degV, knotsU, knotsV, cvs: cvs[i][j] = [x, y, z] (i along u, j along v), w: w[i][j] | null }.
 * Edges are named 'u0' (u = start, a curve in v), 'u1', 'v0' (v = start, a curve in u), 'v1'.
 *
 * The NURBS Book (2nd ed.), by number: point (A4.3), derivs (A3.6 on the homogeneous net, then A4.4), knot insertion and
 * degree elevation row by row (§ 5.2, § 5.5: a surface operation in one direction is the curve operation on every row of the
 * net with the same knots), iso-curves exactly (§ 3.4: a row of the net blended by the other direction's basis), closest point
 * (§ 6.1, Newton on (S − P)·Su = (S − P)·Sv = 0). Curvature from the first and second fundamental forms (do Carmo, Differential
 * Geometry of Curves and Surfaces, § 3.3).
 *
 *   cleanSurface(x, { maxCvs, maxDeg }) → surface or throws NurbsError · domainU(s) · domainV(s) · hgrid(s) · fromHGrid(…)
 *   point(s, u, v) · derivs(s, u, v, d) → SKL[k][l] = ∂^(k+l) S / ∂u^k ∂v^l · normal(s, u, v) → unit (degenerate corners handled)
 *   forms(s, u, v) → { E, F, G, L, M, N, n, Su, Sv } · curvature(s, u, v) → { K, H, k1, k2, d1, d2 } (principal, 3-D directions)
 *   normalCurvature(s, u, v, t) → the normal curvature in the 3-D tangent direction t (signed against normal(s, u, v))
 *   isoCurve(s, 'u' | 'v', t) → curve (u = t: a curve in v) · edgeCurve(s, edge) · edgeParams(s, edge) → { fixed, dir, a, b }
 *   insertKnot(s, dir, t, r) · refine(s, dir, [t…]) · elevate(s, dir, t) · reverse(s, dir) · swap(s) · split(s, dir, t)
 *   reparam(s, [a, b], [c, d]) · transform(s, m4) · bbox(s) · area(s)
 *   closestPoint(s, p, { uv0 }) → { u, v, point, d }
 *   tessellate(s, { tol = 0.01, maxPerSpan = 64, uParams, vParams, curvature }) → { positions, normals, uvs, indices, nu, nv,
 *     uParams, vParams, K?, H? } — a grid (no cracks inside the surface) whose parameter lines are placed per knot span from a
 *     second-derivative bound (n ≥ h·sqrt(M / 8 tol)); normals are the surface's own (analytic), never averaged facets.
 */
import { findSpan, basisFuns, dersBasisFuns, knotProblem, binomial, distinctKnots } from './basis.js';
import * as C from './curve.js';
import * as V from './vec.js';

const { fail } = C;
export const EDGES = ['u0', 'u1', 'v0', 'v1'];

const finite3 = (p) => Array.isArray(p) && p.length >= 2 && p.length <= 3 && p.every((x) => typeof x === 'number' && Number.isFinite(x));

export function cleanSurface(x, { maxCvs = C.MAX_CVS, maxDeg = C.MAX_DEG } = {}) {
  if (!x || typeof x !== 'object') fail('nurbs.err.not_surface');
  const { degU, degV } = x;
  for (const d of [degU, degV]) if (!Number.isInteger(d) || d < 1 || d > maxDeg) fail('nurbs.err.degree', { max: maxDeg });
  if (!Array.isArray(x.cvs) || x.cvs.length < degU + 1) fail('nurbs.err.cv_count', { min: degU + 1 });
  const nv = Array.isArray(x.cvs[0]) ? x.cvs[0].length : 0;
  if (nv < degV + 1) fail('nurbs.err.cv_count', { min: degV + 1 });
  if (x.cvs.length * nv > maxCvs) fail('nurbs.err.too_many', { max: maxCvs });
  const cvs = x.cvs.map((row) => {
    if (!Array.isArray(row) || row.length !== nv) fail('nurbs.err.cv_grid');
    return row.map((p) => { if (!finite3(p)) fail('nurbs.err.cv_value'); return [p[0], p[1], p.length > 2 ? p[2] : 0]; });
  });
  const ku = knotProblem(x.knotsU, degU, cvs.length); if (ku) fail(ku, { dir: 'u' });
  const kv = knotProblem(x.knotsV, degV, nv); if (kv) fail(kv, { dir: 'v' });
  let w = null;
  if (x.w != null) {
    if (!Array.isArray(x.w) || x.w.length !== cvs.length) fail('nurbs.err.weights');
    let all1 = true;
    w = x.w.map((row) => {
      if (!Array.isArray(row) || row.length !== nv) fail('nurbs.err.weights');
      return row.map((v) => { if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) fail('nurbs.err.weights'); if (v !== 1) all1 = false; return v; });
    });
    if (all1) w = null;
  }
  return { degU, degV, knotsU: x.knotsU.slice(), knotsV: x.knotsV.slice(), cvs, w };
}

export const domainU = (s) => [s.knotsU[s.degU], s.knotsU[s.cvs.length]];
export const domainV = (s) => [s.knotsV[s.degV], s.knotsV[s.cvs[0].length]];
export const hgrid = (s) => s.cvs.map((row, i) => row.map((p, j) => { const w = s.w ? s.w[i][j] : 1; return [p[0] * w, p[1] * w, p[2] * w, w]; }));

export function fromHGrid(degU, degV, knotsU, knotsV, Pw) {
  const rational = Pw.some((row) => row.some((q) => Math.abs(q[3] - 1) > 1e-14));
  return {
    degU, degV, knotsU: knotsU.slice(), knotsV: knotsV.slice(),
    cvs: Pw.map((row) => row.map((q) => [q[0] / q[3], q[1] / q[3], q[2] / q[3]])),
    w: rational ? Pw.map((row) => row.map((q) => q[3])) : null,
  };
}

const clamp = (x, [a, b]) => (x < a ? a : x > b ? b : x);

// ------------------------------------------------------------------------------------------------ evaluation

export function point(s, u, v) {
  u = clamp(u, domainU(s)); v = clamp(v, domainV(s));
  const nu = s.cvs.length - 1, nv = s.cvs[0].length - 1;
  const ku = findSpan(nu, s.degU, u, s.knotsU), kv = findSpan(nv, s.degV, v, s.knotsV);
  const Nu = basisFuns(ku, u, s.degU, s.knotsU), Nv = basisFuns(kv, v, s.degV, s.knotsV);
  let x = 0, y = 0, z = 0, w = 0;
  for (let a = 0; a <= s.degU; a++) {
    const i = ku - s.degU + a;
    for (let b = 0; b <= s.degV; b++) {
      const j = kv - s.degV + b, q = s.cvs[i][j], wij = s.w ? s.w[i][j] : 1, f = Nu[a] * Nv[b] * wij;
      x += f * q[0]; y += f * q[1]; z += f * q[2]; w += f;
    }
  }
  return [x / w, y / w, z / w];
}

export function derivs(s, u, v, d = 2) {
  u = clamp(u, domainU(s)); v = clamp(v, domainV(s));
  const pu = s.degU, pv = s.degV, nu = s.cvs.length - 1, nv = s.cvs[0].length - 1;
  const du = Math.min(d, pu), dv = Math.min(d, pv);
  const ku = findSpan(nu, pu, u, s.knotsU), kv = findSpan(nv, pv, v, s.knotsV);
  const Nu = dersBasisFuns(ku, u, pu, du, s.knotsU), Nv = dersBasisFuns(kv, v, pv, dv, s.knotsV);
  const A = [], W = [];
  for (let k = 0; k <= d; k++) {
    A.push([]); W.push([]);
    for (let l = 0; l <= d - k; l++) {
      let x = 0, y = 0, z = 0, w = 0;
      if (k <= du && l <= dv) for (let a = 0; a <= pu; a++) {
        const i = ku - pu + a;
        for (let b = 0; b <= pv; b++) {
          const j = kv - pv + b, q = s.cvs[i][j], wij = s.w ? s.w[i][j] : 1, f = Nu[k][a] * Nv[l][b] * wij;
          x += f * q[0]; y += f * q[1]; z += f * q[2]; w += f;
        }
      }
      A[k].push([x, y, z]); W[k].push(w);
    }
  }
  const S = [];
  for (let k = 0; k <= d; k++) {
    S.push([]);
    for (let l = 0; l <= d - k; l++) {
      let p = A[k][l].slice();
      for (let j = 1; j <= l; j++) p = V.sub(p, V.mul(S[k][l - j], binomial(l, j) * W[0][j]));
      for (let i = 1; i <= k; i++) {
        p = V.sub(p, V.mul(S[k - i][l], binomial(k, i) * W[i][0]));
        let p2 = [0, 0, 0];
        for (let j = 1; j <= l; j++) p2 = V.add(p2, V.mul(S[k - i][l - j], binomial(l, j) * W[i][j]));
        p = V.sub(p, V.mul(p2, binomial(k, i)));
      }
      S[k].push(V.mul(p, 1 / W[0][0]));
    }
  }
  return S;
}

/** Unit normal Su × Sv. Where it vanishes (a pole or a collapsed edge) the normal is the limit from inside the domain. */
export function normal(s, u, v) {
  const D = derivs(s, u, v, 1), l1 = V.len(D[1][0]), l2 = V.len(D[0][1]);
  let n = V.cross(D[1][0], D[0][1]);
  // a derivative a billion times shorter than the other is rounding noise on a collapsed edge, not a direction
  const degenerate = l1 <= 1e-9 * l2 || l2 <= 1e-9 * l1;
  if (!degenerate && V.len(n) > 1e-10 * l1 * l2) return V.norm(n);
  const [ua, ub] = domainU(s), [va, vb] = domainV(s);
  // a collapsed edge: near v = v0 with Sv → 0, Sv ≈ (v − v0)·Svu… — the limit of Su × Sv is ±Su × Suv (and Suv × Sv when Su
  // vanishes), the sign set by which side of the domain the point is on
  const D2 = derivs(s, u, v, 2), lu = V.len(D2[1][0]), lv = V.len(D2[0][1]);
  if (lv <= 1e-9 * Math.max(lu, 1e-300) && lu > 1e-300) {
    const m = V.cross(D2[1][0], D2[1][1]), sg = u - ua <= ub - u ? 1 : -1;
    if (V.len(m) > 1e-12 * lu * V.len(D2[1][1])) return V.norm(V.mul(m, sg));
  }
  if (lu <= 1e-9 * Math.max(lv, 1e-300) && lv > 1e-300) {
    const m = V.cross(D2[1][1], D2[0][1]), sg = v - va <= vb - v ? 1 : -1;
    if (V.len(m) > 1e-12 * lv * V.len(D2[1][1])) return V.norm(V.mul(m, sg));
  }
  for (const h of [1e-7, 1e-5, 1e-3]) {
    const uu = u + (u - ua < (ub - ua) / 2 ? 1 : -1) * h * (ub - ua), vv = v + (v - va < (vb - va) / 2 ? 1 : -1) * h * (vb - va);
    const E = derivs(s, uu, vv, 1);
    n = V.cross(E[1][0], E[0][1]);
    if (V.len(n) > 1e-300) return V.norm(n);
  }
  return [0, 0, 1];
}

/** On a collapsed edge (one first derivative vanishes) the curvatures are the limits from just inside the domain. */
function inside(s, u, v) {
  const D = derivs(s, u, v, 1), l1 = V.len(D[1][0]), l2 = V.len(D[0][1]);
  if (!(l1 <= 1e-6 * l2 || l2 <= 1e-6 * l1)) return [u, v];
  const [ua, ub] = domainU(s), [va, vb] = domainV(s), h = 1e-5;
  const uu = l1 <= 1e-6 * l2 ? u : u + (u - ua <= ub - u ? 1 : -1) * h * (ub - ua);
  const vv = l2 <= 1e-6 * l1 ? v : v + (v - va <= vb - v ? 1 : -1) * h * (vb - va);
  return [uu, vv];
}

export function forms(s, u, v) {
  [u, v] = inside(s, u, v);
  const D = derivs(s, u, v, 2), Su = D[1][0], Sv = D[0][1];
  const n = normal(s, u, v);
  return { E: V.dot(Su, Su), F: V.dot(Su, Sv), G: V.dot(Sv, Sv), L: V.dot(D[2][0], n), M: V.dot(D[1][1], n), N: V.dot(D[0][2], n), n, Su, Sv };
}

export function curvature(s, u, v) {
  const f = forms(s, u, v), det = f.E * f.G - f.F * f.F;
  if (!(det > 1e-300)) return { K: 0, H: 0, k1: 0, k2: 0, d1: f.Su, d2: f.Sv };
  const K = (f.L * f.N - f.M * f.M) / det;
  const H = (f.E * f.N - 2 * f.F * f.M + f.G * f.L) / (2 * det);
  const disc = Math.sqrt(Math.max(0, H * H - K));
  const k1 = H + disc, k2 = H - disc;
  // principal direction for k: (L − kE) a + (M − kF) b = 0  (or the second row when the first vanishes)
  const dirFor = (k) => {
    let a = -(f.M - k * f.F), b = f.L - k * f.E;
    if (Math.abs(a) + Math.abs(b) < 1e-12 * (Math.abs(f.L) + Math.abs(f.M) + Math.abs(k) * (f.E + f.G) + 1e-300)) { a = -(f.N - k * f.G); b = f.M - k * f.F; }
    if (Math.abs(a) + Math.abs(b) < 1e-300) return V.norm(f.Su);
    return V.norm(V.add(V.mul(f.Su, a), V.mul(f.Sv, b)));
  };
  let d1 = dirFor(k1), d2 = dirFor(k2);
  if (disc < 1e-12 * (Math.abs(H) + 1e-300)) { d1 = V.norm(f.Su); d2 = V.norm(V.cross(f.n, d1)); }
  return { K, H, k1, k2, d1, d2 };
}

export function normalCurvature(s, u, v, t) {
  const f = forms(s, u, v), det = f.E * f.G - f.F * f.F;
  if (!(det > 1e-300)) return 0;
  const p = V.dot(t, f.Su), q = V.dot(t, f.Sv);
  const a = (f.G * p - f.F * q) / det, b = (f.E * q - f.F * p) / det;
  const I = f.E * a * a + 2 * f.F * a * b + f.G * b * b;
  return I > 1e-300 ? (f.L * a * a + 2 * f.M * a * b + f.N * b * b) / I : 0;
}

// ------------------------------------------------------------------------------------------------ iso-curves and rows

export function isoCurve(s, dir, t) {
  const Pw = hgrid(s);
  if (dir === 'u') {
    // u fixed: blend the rows i by N_i(u); the result runs in v
    const nu = s.cvs.length - 1, u = clamp(t, domainU(s)), k = findSpan(nu, s.degU, u, s.knotsU), N = basisFuns(k, u, s.degU, s.knotsU);
    const row = Pw[0].map((_, j) => { let q = [0, 0, 0, 0]; for (let a = 0; a <= s.degU; a++) q = V.add(q, V.mul(Pw[k - s.degU + a][j], N[a])); return q; });
    return C.fromH(s.degV, s.knotsV, row);
  }
  const nv = s.cvs[0].length - 1, v = clamp(t, domainV(s)), k = findSpan(nv, s.degV, v, s.knotsV), N = basisFuns(k, v, s.degV, s.knotsV);
  const col = Pw.map((r) => { let q = [0, 0, 0, 0]; for (let b = 0; b <= s.degV; b++) q = V.add(q, V.mul(r[k - s.degV + b], N[b])); return q; });
  return C.fromH(s.degU, s.knotsU, col);
}

export function edgeParams(s, edge) {
  const [ua, ub] = domainU(s), [va, vb] = domainV(s);
  switch (edge) {
    case 'u0': return { dir: 'u', fixed: ua, a: va, b: vb, inward: 1 };
    case 'u1': return { dir: 'u', fixed: ub, a: va, b: vb, inward: -1 };
    case 'v0': return { dir: 'v', fixed: va, a: ua, b: ub, inward: 1 };
    case 'v1': return { dir: 'v', fixed: vb, a: ua, b: ub, inward: -1 };
    default: fail('nurbs.err.edge');
  }
}

/** The (u, v) of the point at parameter t along an edge. */
export function edgeUV(s, edge, t) { const e = edgeParams(s, edge); return e.dir === 'u' ? [e.fixed, t] : [t, e.fixed]; }

export const edgeCurve = (s, edge) => { const e = edgeParams(s, edge); return isoCurve(s, e.dir, e.fixed); };

/** Rows of the net as homogeneous curves along `dir` ('u': each column j is a curve in u; 'v': each row i is a curve in v). */
function rowsOf(s, dir) {
  const Pw = hgrid(s);
  if (dir === 'v') return Pw.map((row) => C.fromH(s.degV, s.knotsV, row));
  return Pw[0].map((_, j) => C.fromH(s.degU, s.knotsU, Pw.map((r) => r[j])));
}

function fromRows(s, dir, rows) {
  const H = rows.map((c) => C.hcvs(c)), K = rows[0].knots;
  for (const c of rows) if (c.knots.length !== K.length || c.knots.some((x, i) => Math.abs(x - K[i]) > 1e-12 * (1 + Math.abs(K[i])))) return null;
  if (dir === 'v') return fromHGrid(s.degU, rows[0].deg, s.knotsU, K, H);
  const Pw = H[0].map((_, i) => H.map((col) => col[i]));
  return fromHGrid(rows[0].deg, s.degV, K, s.knotsV, Pw);
}

const checkDir = (dir) => { if (dir !== 'u' && dir !== 'v') fail('nurbs.err.dir'); };

export function insertKnot(s, dir, t, r = 1) { checkDir(dir); return fromRows(s, dir, rowsOf(s, dir).map((c) => C.insertKnot(c, t, r))); }
export function refine(s, dir, X) { let out = s; for (const t of X) out = insertKnot(out, dir, t, 1); return out; }

export function elevate(s, dir, t = 1) {
  checkDir(dir);
  const rows = rowsOf(s, dir);
  return fromRows(s, dir, rows.map((c) => C.elevate(c, t))) || fromRows(s, dir, rows.map((c) => C.elevate(c, t, { removeKnots: false })));
}

export function reverse(s, dir) {
  checkDir(dir);
  return fromRows(s, dir, rowsOf(s, dir).map((c) => C.reverse(c)));
}

export function swap(s) {
  const nu = s.cvs.length, nv = s.cvs[0].length;
  const cvs = [], w = s.w ? [] : null;
  for (let j = 0; j < nv; j++) { cvs.push([]); if (w) w.push([]); for (let i = 0; i < nu; i++) { cvs[j].push(s.cvs[i][j].slice()); if (w) w[j].push(s.w[i][j]); } }
  return { degU: s.degV, degV: s.degU, knotsU: s.knotsV.slice(), knotsV: s.knotsU.slice(), cvs, w };
}

export function split(s, dir, t) {
  checkDir(dir);
  const parts = rowsOf(s, dir).map((c) => C.split(c, t));
  return [fromRows(s, dir, parts.map((p) => p[0])), fromRows(s, dir, parts.map((p) => p[1]))];
}

function mapKnots(K, p, n, a, b) {
  const ka = K[p], kb = K[n], f = (b - a) / (kb - ka), out = K.map((x) => a + (x - ka) * f);
  for (let i = 0; i <= p; i++) { out[i] = a; out[out.length - 1 - i] = b; }
  return out;
}

export function reparam(s, [a, b] = [0, 1], [c, d] = [0, 1]) {
  const ru = mapKnots(s.knotsU, s.degU, s.cvs.length, a, b), rv = mapKnots(s.knotsV, s.degV, s.cvs[0].length, c, d);
  return { degU: s.degU, degV: s.degV, knotsU: ru, knotsV: rv, cvs: s.cvs.map((r) => r.map((q) => q.slice())), w: s.w ? s.w.map((r) => r.slice()) : null };
}

export function transform(s, m) {
  return { degU: s.degU, degV: s.degV, knotsU: s.knotsU.slice(), knotsV: s.knotsV.slice(), cvs: s.cvs.map((r) => r.map((q) => V.xform(m, q))), w: s.w ? s.w.map((r) => r.slice()) : null };
}

export function bbox(s) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const r of s.cvs) for (const q of r) for (let i = 0; i < 3; i++) { if (q[i] < min[i]) min[i] = q[i]; if (q[i] > max[i]) max[i] = q[i]; }
  return { min, max };
}

export const size = (s) => { const b = bbox(s); return Math.max(1e-9, V.dist(b.min, b.max)); };

// ------------------------------------------------------------------------------------------------ measures

const GX = [-0.9061798459386640, -0.5384693101056831, 0, 0.5384693101056831, 0.9061798459386640];
const GW = [0.2369268850561891, 0.4786286704993665, 0.5688888888888889, 0.4786286704993665, 0.2369268850561891];

/** Area by 5 × 5 Gauss–Legendre on 2 × 2 pieces of every knot-span cell. */
export function area(s) {
  const us = distinctKnots(s.knotsU).map((k) => k.u), vs = distinctKnots(s.knotsV).map((k) => k.u);
  let A = 0;
  const sub = (lst) => { const o = []; for (let i = 0; i + 1 < lst.length; i++) o.push([lst[i], (lst[i] + lst[i + 1]) / 2], [(lst[i] + lst[i + 1]) / 2, lst[i + 1]]); return o; };
  for (const [u0, u1] of sub(us)) for (const [v0, v1] of sub(vs)) {
    const hu = (u1 - u0) / 2, hv = (v1 - v0) / 2;
    for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) {
      const D = derivs(s, u0 + hu * (1 + GX[a]), v0 + hv * (1 + GX[b]), 1);
      A += GW[a] * GW[b] * hu * hv * V.len(V.cross(D[1][0], D[0][1]));
    }
  }
  return A;
}

export function closestPoint(s, p, { uv0 = null } = {}) {
  const [ua, ub] = domainU(s), [va, vb] = domainV(s);
  let bu, bv, bd = Infinity;
  if (uv0) { [bu, bv] = uv0; bd = V.dist(point(s, bu, bv), p); }
  else {
    const us = distinctKnots(s.knotsU).map((k) => k.u), vs = distinctKnots(s.knotsV).map((k) => k.u);
    const pu = s.degU + 2, pv = s.degV + 2;
    // an iso-curve that is one point (a pole: a revolved profile on its axis) gives the same point for every value along it, so as
    // a first guess it says nothing about that parameter and Newton then settles on the wrong side; such samples only count when
    // they are the point itself
    const size = Math.max(1e-300, V.dist(point(s, ua, va), point(s, ub, vb)), V.dist(point(s, ua, vb), point(s, ub, va)));
    const one = (q0, q1, q2) => V.dist(q0, q1) < 1e-12 * size && V.dist(q0, q2) < 1e-12 * size;
    const poleU = (u) => one(point(s, u, va), point(s, u, (va + vb) / 2), point(s, u, vb));
    const poleV = (v) => one(point(s, ua, v), point(s, (ua + ub) / 2, v), point(s, ub, v));
    const atPole = new Map();
    const isPole = (u, v) => { const k = u + ',' + v; if (!atPole.has(k)) atPole.set(k, ((u === ua || u === ub) && poleU(u)) || ((v === va || v === vb) && poleV(v))); return atPole.get(k); };
    for (let a = 0; a + 1 < us.length; a++) for (let i = 0; i <= pu; i++) {
      const u = us[a] + (us[a + 1] - us[a]) * i / pu;
      for (let b = 0; b + 1 < vs.length; b++) for (let j = 0; j <= pv; j++) {
        const v = vs[b] + (vs[b + 1] - vs[b]) * j / pv, d = V.dist(point(s, u, v), p);
        if (d < bd && (d < 1e-12 * size || !isPole(u, v))) { bd = d; bu = u; bv = v; }
      }
    }
    if (bu === undefined) { bu = (ua + ub) / 2; bv = (va + vb) / 2; bd = V.dist(point(s, bu, bv), p); }
  }
  // a direction whose two ends are the same curve (a full revolution's seam) wraps instead of stopping at the end: a point just
  // across the seam is reached by going round, not by sticking at the edge
  const scale = Math.max(1e-300, V.dist(point(s, ua, va), point(s, ub, vb)), V.dist(point(s, ua, vb), point(s, ub, va)), V.dist(point(s, (ua + ub) / 2, va), point(s, (ua + ub) / 2, vb)));
  const meets = (f) => [0, 0.37, 0.71, 1].every((x) => f(x) < 1e-9 * scale);
  const wrapU = meets((x) => V.dist(point(s, ua, va + (vb - va) * x), point(s, ub, va + (vb - va) * x)));
  const wrapV = meets((x) => V.dist(point(s, ua + (ub - ua) * x, va), point(s, ua + (ub - ua) * x, vb)));
  const stepU = (x) => (wrapU ? ua + ((((x - ua) % (ub - ua)) + (ub - ua)) % (ub - ua)) : clamp(x, [ua, ub]));
  const stepV = (x) => (wrapV ? va + ((((x - va) % (vb - va)) + (vb - va)) % (vb - va)) : clamp(x, [va, vb]));
  let u = bu, v = bv;
  for (let it = 0; it < 40; it++) {
    const D = derivs(s, u, v, 2), r = V.sub(D[0][0], p), Su = D[1][0], Sv = D[0][1];
    const f = V.dot(r, Su), g = V.dot(r, Sv);
    const J00 = V.dot(Su, Su) + V.dot(r, D[2][0]), J01 = V.dot(Su, Sv) + V.dot(r, D[1][1]), J11 = V.dot(Sv, Sv) + V.dot(r, D[0][2]);
    const det = J00 * J11 - J01 * J01;
    if (Math.abs(det) < 1e-300) break;
    let du = -(J11 * f - J01 * g) / det, dv = -(J00 * g - J01 * f) / det;
    let un = stepU(u + du), vn = stepV(v + dv);
    // keep the step only when it does not make things worse (Newton can wander near the edges)
    if (V.dist(point(s, un, vn), p) > V.len(r) * (1 + 1e-12)) { un = stepU(u + du / 2); vn = stepV(v + dv / 2); }
    const moved = Math.min(Math.abs(un - u), wrapU ? (ub - ua) - Math.abs(un - u) : Infinity) / (ub - ua) + Math.min(Math.abs(vn - v), wrapV ? (vb - va) - Math.abs(vn - v) : Infinity) / (vb - va);
    u = un; v = vn;
    if (moved < 1e-15) break;
  }
  const q = point(s, u, v), d = V.dist(q, p);
  return d <= bd ? { u, v, point: q, d } : { u: bu, v: bv, point: point(s, bu, bv), d: bd };
}

// ------------------------------------------------------------------------------------------------ tessellation

function spanParams(s, dir, tol, maxPerSpan) {
  const knots = dir === 'u' ? s.knotsU : s.knotsV, ks = distinctKnots(knots).map((k) => k.u);
  const [oa, ob] = dir === 'u' ? domainV(s) : domainU(s);
  const deg = dir === 'u' ? s.degU : s.degV;
  const out = [ks[0]];
  for (let k = 0; k + 1 < ks.length; k++) {
    const a = ks[k], b = ks[k + 1], h = b - a;
    let M = 0;
    if (deg > 1) for (let i = 0; i <= 4; i++) for (let j = 0; j <= 6; j++) {
      const t = a + h * i / 4, o = oa + (ob - oa) * j / 6;
      const D = dir === 'u' ? derivs(s, t, o, 2)[2][0] : derivs(s, o, t, 2)[0][2];
      M = Math.max(M, V.len(D));
    }
    // a chord over parameter step h deviates from the curve by at most h²·M/8; half the tolerance each way, so a cell's
    // middle (both directions at once) stays within it
    const n = deg > 1 ? Math.min(maxPerSpan, Math.max(2, Math.ceil(h * Math.sqrt(M / (4 * tol))))) : 1;
    for (let i = 1; i <= n; i++) out.push(a + h * i / n);
  }
  return out;
}

export function tessellate(s, { tol = 0.01, maxPerSpan = 64, uParams = null, vParams = null, curvature: withK = false } = {}) {
  const up = uParams || spanParams(s, 'u', tol, maxPerSpan), vp = vParams || spanParams(s, 'v', tol, maxPerSpan);
  const nu = up.length, nv = vp.length;
  const positions = new Float64Array(nu * nv * 3), normals = new Float64Array(nu * nv * 3), uvs = new Float64Array(nu * nv * 2);
  const K = withK ? new Float64Array(nu * nv) : null, H = withK ? new Float64Array(nu * nv) : null;
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const k = i * nv + j, q = point(s, up[i], vp[j]), n = normal(s, up[i], vp[j]);
    positions.set(q, k * 3); normals.set(n, k * 3); uvs[k * 2] = up[i]; uvs[k * 2 + 1] = vp[j];
    if (withK) { const c = curvature(s, up[i], vp[j]); K[k] = c.K; H[k] = c.H; }
  }
  const indices = new Uint32Array((nu - 1) * (nv - 1) * 6);
  let t = 0;
  for (let i = 0; i + 1 < nu; i++) for (let j = 0; j + 1 < nv; j++) {
    const a = i * nv + j, b = a + nv, c = b + 1, d = a + 1;
    indices[t++] = a; indices[t++] = b; indices[t++] = c;
    indices[t++] = a; indices[t++] = c; indices[t++] = d;
  }
  const out = { positions, normals, uvs, indices, nu, nv, uParams: up, vParams: vp };
  if (withK) { out.K = K; out.H = H; }
  return out;
}

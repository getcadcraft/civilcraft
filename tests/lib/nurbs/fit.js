/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * fit.js — cc-nurbs (0.8 SU.747b): curves through or near points. DOM-free.
 *
 * The NURBS Book (Piegl & Tiller, 2nd ed.) § 9.2: parameters by chord length (eq. 9.5) or centripetal (9.6), knots by
 * averaging (9.8), global interpolation (A9.1) with end derivatives (§ 9.2.2: each derivative condition adds one control point
 * and one row; its parameter is counted twice in the averaging, which keeps the system solvable); § 9.4.1 least-squares
 * approximation with the ends fixed (knots eq. 9.68–9.69, normal equations 9.66–9.67).
 *
 *   params(Q, kind = 'chord' | 'centripetal' | 'uniform') → [0 … 1]
 *   averagedKnots(t, p, count) → clamped knots for `count` control points from parameters t (repeated where a derivative is given)
 *   interpolate(Q, p, { kind, params, d0, d1 }) → curve through every point (d0 / d1: the first derivative at the ends, as vectors)
 *   approximate(Q, p, count, { kind, params, knots }) → curve with `count` control points, ends on Q[0] and Q[last], least squares
 *   fitFixedKnots(Q, t, p, knots, { fixEnds = true, weights }) → curve with the given knots (least squares)
 *   deviation(c, Q) → { max, mean, at } (closest-point distance of each point to the curve)
 *   rebuild(c, count, p = c.deg, { samples }) → { curve, deviation } (same parameterisation, new control points)
 *   interpolateMany(lists, t, p, { d0, d1 }) → { deg, knots, rows }: one interpolation matrix, many point lists of any dimension
 *     (the columns of a net: skinning, Gordon) — rows[k] are list k's control points; d0 / d1 are per-list end derivatives
 *   fitSurfaceGrid(Q, tu, tv, du, dv, Ku, Kv) → surface fitted to a grid of points Q[i][j] at (tu[i], tv[j]) (tensor least squares,
 *     rows then columns: exact for a grid, NURBS Book § 9.4.1 applied twice), corners on the grid's corners
 *   fitSurfaceTo(f, du, dv, tol, { maxCvs, samples }) → { surface, deviation } for f(u, v) on [0, 1]², refined until within tol
 *   fitTo(f, p, tol, { maxCvs, samples, start }) → { curve, deviation } for a parametric function f(t), t in [0, 1], refining
 *     the control-point count until the sampled deviation (at points between the fitting samples) is within tol
 */
import { findSpan, basisFuns, dersBasisFuns, clampedUniform } from './basis.js';
import * as C from './curve.js';
import * as V from './vec.js';

const { fail } = C;

export function params(Q, kind = 'chord') {
  const n = Q.length;
  if (n < 2) return [0];
  const d = [0];
  for (let i = 1; i < n; i++) {
    const l = V.dist(Q[i], Q[i - 1]);
    d.push(d[i - 1] + (kind === 'uniform' ? 1 : kind === 'centripetal' ? Math.sqrt(l) : l));
  }
  const total = d[n - 1];
  if (!(total > 0)) return Q.map((_, i) => i / (n - 1));
  return d.map((x) => x / total);
}

export function averagedKnots(t, p, count) {
  const U = new Array(p + 1).fill(0);
  const inner = count - p - 1;
  // A9.1 / eq. 9.8 generalised to a parameter list whose length may exceed `count` (approximation) or equal it
  if (t.length === count) {
    for (let j = 1; j <= inner; j++) { let s = 0; for (let i = j; i < j + p; i++) s += t[i]; U.push(s / p); }
  } else {
    const d = t.length / (count - p);
    for (let j = 1; j <= inner; j++) { const i = Math.floor(j * d), a = j * d - i; U.push((1 - a) * t[i - 1] + a * t[i]); }
  }
  for (let i = 0; i <= p; i++) U.push(1);
  return U;
}

function rowAt(p, U, n, u, der = 0) {
  const row = new Array(n + 1).fill(0), k = findSpan(n, p, u, U);
  const N = der ? dersBasisFuns(k, u, p, der, U)[der] : basisFuns(k, u, p, U);
  for (let j = 0; j <= p; j++) row[k - p + j] = N[j];
  return row;
}

export function interpolate(Q, p, { kind = 'chord', params: t0 = null, d0 = null, d1 = null } = {}) {
  const m = Q.length;
  if (m < 2) fail('nurbs.err.cv_count', { min: 2 });
  const t = t0 ? t0.slice() : params(Q, kind);
  const count = m + (d0 ? 1 : 0) + (d1 ? 1 : 0);
  const deg = Math.min(p, count - 1);
  const tk = [...(d0 ? [t[0]] : []), ...t, ...(d1 ? [t[m - 1]] : [])];
  const U = averagedKnots(tk, deg, count), n = count - 1;
  const A = [], B = [];
  Q.forEach((q, i) => {
    A.push(rowAt(deg, U, n, t[i]));
    B.push([q[0], q[1], q.length > 2 ? q[2] : 0]);
    if (i === 0 && d0) { A.push(rowAt(deg, U, n, t[0], 1)); B.push(d0.slice(0, 3)); }
    if (i === m - 1 && d1) { A.push(rowAt(deg, U, n, t[m - 1], 1)); B.push(d1.slice(0, 3)); }
  });
  const P = V.solve(A, B);
  if (!P) fail('nurbs.err.fit_singular');
  return { deg, knots: U, cvs: P, w: null };
}

export function fitFixedKnots(Q, t, p, U, { fixEnds = true, weights = null } = {}) {
  const n = U.length - p - 2, m = Q.length - 1;
  const P = new Array(n + 1);
  if (fixEnds) { P[0] = Q[0].slice(0, 3); P[n] = Q[m].slice(0, 3); }
  const lo = fixEnds ? 1 : 0, hi = fixEnds ? n - 1 : n, k = hi - lo + 1;
  if (k <= 0) return { deg: p, knots: U.slice(), cvs: P.map((q, i) => q || Q[Math.round(i * m / n)].slice(0, 3)), w: null };
  const NtN = Array.from({ length: k }, () => new Array(k).fill(0)), NtR = Array.from({ length: k }, () => [0, 0, 0]);
  for (let i = 0; i <= m; i++) {
    if (fixEnds && (i === 0 || i === m)) continue;
    const row = rowAt(p, U, n, t[i]), wt = weights ? weights[i] : 1;
    let r = Q[i].slice(0, 3);
    if (fixEnds) r = V.sub(V.sub(r, V.mul(P[0], row[0])), V.mul(P[n], row[n]));
    for (let a = lo; a <= hi; a++) {
      if (!row[a]) continue;
      for (let b = lo; b <= hi; b++) if (row[b]) NtN[a - lo][b - lo] += wt * row[a] * row[b];
      for (let d = 0; d < 3; d++) NtR[a - lo][d] += wt * row[a] * r[d];
    }
  }
  // a control point no sample reaches would leave the system singular: tie it lightly to its neighbours (smoothing)
  for (let a = 0; a < k; a++) if (NtN[a][a] < 1e-12) {
    NtN[a][a] += 2e-6;
    if (a > 0) NtN[a][a - 1] -= 1e-6;
    if (a + 1 < k) NtN[a][a + 1] -= 1e-6;
  }
  const X = V.solve(NtN, NtR);
  if (!X) fail('nurbs.err.fit_singular');
  for (let a = lo; a <= hi; a++) P[a] = X[a - lo];
  return { deg: p, knots: U.slice(), cvs: P, w: null };
}

export function approximate(Q, p, count, { kind = 'chord', params: t0 = null, knots = null } = {}) {
  if (count > Q.length) fail('nurbs.err.cv_count', { min: count });
  const deg = Math.min(p, count - 1);
  const t = t0 ? t0.slice() : params(Q, kind);
  const U = knots ? knots.slice() : count === Q.length ? averagedKnots(t, deg, count) : averagedKnots(t, deg, count);
  return fitFixedKnots(Q, t, deg, U);
}

export function deviation(c, Q) {
  let max = 0, sum = 0, at = 0;
  Q.forEach((q, i) => { const d = C.closestParam(c, q).d; sum += d; if (d > max) { max = d; at = i; } });
  return { max, mean: Q.length ? sum / Q.length : 0, at };
}

export function rebuild(c, count, p = c.deg, { samples = null } = {}) {
  const [a, b] = C.domain(c), S = Math.max(samples || 0, count * 4, 32);
  const Q = [], t = [];
  for (let i = 0; i <= S; i++) { const u = a + (b - a) * i / S; Q.push(C.point(c, u)); t.push(i / S); }
  const deg = Math.min(p, count - 1);
  const out = approximate(Q, deg, count, { params: t, knots: clampedUniform(count, deg) });
  // measure between the fitting samples
  const M = [];
  for (let i = 0; i < S; i++) M.push(C.point(c, a + (b - a) * (i + 0.5) / S));
  return { curve: out, deviation: deviation(out, M) };
}

export function fitTo(f, p, tol, { maxCvs = 400, samples = 6, start = null } = {}) {
  let count = Math.max(p + 1, start || p + 1);
  let best = null;
  for (;;) {
    const S = Math.max(count * samples, 24), t = [], Q = [];
    for (let i = 0; i <= S; i++) { t.push(i / S); Q.push(f(i / S)); }
    const c = fitFixedKnots(Q, t, p, clampedUniform(count, p));
    let max = 0;
    for (let i = 0; i < S; i++) { const s = (i + 0.5) / S, d = V.dist(C.point(c, s), f(s)); if (d > max) max = d; }
    best = { curve: c, deviation: max };
    if (max <= tol || count >= maxCvs) return best;
    count = Math.min(maxCvs, Math.ceil(count * 1.5) + 1);
  }
}

export function interpolateMany(lists, t, p, { d0 = null, d1 = null } = {}) {
  const m = t.length, count = m + (d0 ? 1 : 0) + (d1 ? 1 : 0), deg = Math.min(p, count - 1);
  const tk = [...(d0 ? [t[0]] : []), ...t, ...(d1 ? [t[m - 1]] : [])];
  const U = averagedKnots(tk, deg, count), n = count - 1, dim = lists[0][0].length;
  const A = [], B = [];
  for (let i = 0; i < m; i++) {
    A.push(rowAt(deg, U, n, t[i])); B.push(lists.flatMap((L) => L[i]));
    if (i === 0 && d0) { A.push(rowAt(deg, U, n, t[0], 1)); B.push(lists.flatMap((_, k) => d0[k])); }
    if (i === m - 1 && d1) { A.push(rowAt(deg, U, n, t[m - 1], 1)); B.push(lists.flatMap((_, k) => d1[k])); }
  }
  const X = V.solve(A, B);
  if (!X) fail('nurbs.err.fit_singular');
  const rows = lists.map((_, k) => X.map((r) => r.slice(k * dim, k * dim + dim)));
  return { deg, knots: U, rows };
}

function lsqMany(lists, t, p, U) {
  // least squares with fixed knots and ends, many lists of points (any dimension) sharing one matrix
  const n = U.length - p - 2, m = t.length - 1, dim = lists[0][0].length;
  if (n === m) {
    const A = t.map((u) => rowAt(p, U, n, u)), X = V.solve(A, t.map((_, i) => lists.flatMap((L) => L[i])));
    if (!X) fail('nurbs.err.fit_singular');
    return lists.map((_, k) => X.map((r) => r.slice(k * dim, k * dim + dim)));
  }
  const k = n - 1, rows = [];
  for (let i = 1; i < m; i++) rows.push(rowAt(p, U, n, t[i]));
  const NtN = Array.from({ length: k }, (_, a) => Array.from({ length: k }, (_, b) => { let s = 0; for (const r of rows) s += r[a + 1] * r[b + 1]; return s; }));
  for (let a = 0; a < k; a++) if (NtN[a][a] < 1e-12) NtN[a][a] = 1e-12;
  const R = Array.from({ length: k }, () => new Array(lists.length * dim).fill(0));
  rows.forEach((r, ii) => {
    const i = ii + 1;
    lists.forEach((L, li) => {
      for (let d = 0; d < dim; d++) {
        const rv = L[i][d] - r[0] * L[0][d] - r[n] * L[m][d];
        for (let a = 0; a < k; a++) if (r[a + 1]) R[a][li * dim + d] += r[a + 1] * rv;
      }
    });
  });
  const X = V.solve(NtN, R);
  if (!X) fail('nurbs.err.fit_singular');
  return lists.map((L, li) => [L[0].slice(), ...X.map((r) => r.slice(li * dim, li * dim + dim)), L[m].slice()]);
}

export function fitSurfaceGrid(Q, tu, tv, du, dv, Ku, Kv) {
  // rows: each Q[i] (along v) → control points in v; then columns of those → control points in u
  const rowsV = lsqMany(Q, tv, dv, Kv);                 // rowsV[i][j'] (i over the grid's u samples)
  const nvc = rowsV[0].length;
  const cols = Array.from({ length: nvc }, (_, j) => rowsV.map((r) => r[j]));
  const colsU = lsqMany(cols, tu, du, Ku);              // colsU[j'][i']
  const nuc = colsU[0].length;
  const cvs = Array.from({ length: nuc }, (_, i) => Array.from({ length: nvc }, (_, j) => colsU[j][i].slice(0, 3)));
  return { degU: du, degV: dv, knotsU: Ku.slice(), knotsV: Kv.slice(), cvs, w: null };
}

export function fitSurfaceTo(f, du, dv, tol, { maxCvs = 60, samples = 4, start = null } = {}) {
  let nu = Math.max(du + 1, start ? start[0] : du + 1), nv = Math.max(dv + 1, start ? start[1] : dv + 1);
  const evalS = (s, u, v) => {
    // inline tensor evaluation (polynomial surface) to keep fit.js free of surface.js
    const ku = findSpan(s.cvs.length - 1, s.degU, u, s.knotsU), kv = findSpan(s.cvs[0].length - 1, s.degV, v, s.knotsV);
    const Nu = basisFuns(ku, u, s.degU, s.knotsU), Nv = basisFuns(kv, v, s.degV, s.knotsV), o = [0, 0, 0];
    for (let a = 0; a <= s.degU; a++) for (let b = 0; b <= s.degV; b++) { const q = s.cvs[ku - s.degU + a][kv - s.degV + b], g = Nu[a] * Nv[b]; o[0] += g * q[0]; o[1] += g * q[1]; o[2] += g * q[2]; }
    return o;
  };
  for (;;) {
    const Su = Math.max(nu * samples, 12), Sv = Math.max(nv * samples, 12);
    const tu = Array.from({ length: Su + 1 }, (_, i) => i / Su), tv = Array.from({ length: Sv + 1 }, (_, j) => j / Sv);
    const Q = tu.map((u) => tv.map((v) => f(u, v)));
    const s = fitSurfaceGrid(Q, tu, tv, du, dv, clampedUniform(nu, du), clampedUniform(nv, dv));
    let maxU = 0, maxV = 0;
    for (let i = 0; i < Su; i++) for (let j = 0; j <= Sv; j += Math.max(1, Sv >> 3)) { const u = (i + 0.5) / Su; maxU = Math.max(maxU, V.dist(evalS(s, u, tv[j]), f(u, tv[j]))); }
    for (let j = 0; j < Sv; j++) for (let i = 0; i <= Su; i += Math.max(1, Su >> 3)) { const v = (j + 0.5) / Sv; maxV = Math.max(maxV, V.dist(evalS(s, tu[i], v), f(tu[i], v))); }
    let mid = 0;
    for (let i = 0; i < Su; i += Math.max(1, Su >> 3)) for (let j = 0; j < Sv; j += Math.max(1, Sv >> 3)) { const u = (i + 0.5) / Su, v = (j + 0.5) / Sv; mid = Math.max(mid, V.dist(evalS(s, u, v), f(u, v))); }
    const dev = Math.max(maxU, maxV, mid);
    if (dev <= tol || (nu >= maxCvs && nv >= maxCvs)) return { surface: s, deviation: dev };
    const nu0 = nu, nv0 = nv;
    if (maxU >= maxV * 0.5 && nu < maxCvs) nu = Math.min(maxCvs, Math.ceil(nu * 1.5) + 1);
    if (maxV >= maxU * 0.5 && nv < maxCvs) nv = Math.min(maxCvs, Math.ceil(nv * 1.5) + 1);
    if (nu === nu0 && nv === nv0) { if (nu < maxCvs) nu = Math.min(maxCvs, Math.ceil(nu * 1.5) + 1); else nv = Math.min(maxCvs, Math.ceil(nv * 1.5) + 1); }
  }
}

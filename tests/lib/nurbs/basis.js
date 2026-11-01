/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * basis.js — cc-nurbs (0.8 SU.747b, session `nurbs`): B-spline basis functions and knot vectors. DOM-free, import-free.
 * Canonical in lib/nurbs; ModelCraft and PartCraft carry byte-identical copies (`node tools/nurbs/sync.mjs [--check]`).
 *
 * Written from the published algorithms only: Piegl & Tiller, The NURBS Book (2nd ed., 1997), A2.1 FindSpan, A2.2 BasisFuns,
 * A2.3 DersBasisFuns (cited by number; no code copied from any library).
 *
 * Conventions (the book's): p = degree, U = knot vector (m + 1 values), n + 1 = number of control points, m = n + p + 1.
 * Every curve and surface in cc-nurbs is clamped (open): the first and last knots have multiplicity p + 1. Spans are
 * half-open [U[i], U[i+1]), except that u = U[n+1] (the end of the domain) belongs to the last non-empty span.
 *
 *   findSpan(n, p, u, U) → i with U[i] <= u < U[i+1] (A2.1)
 *   basisFuns(i, u, p, U) → [N(i-p,p) … N(i,p)] at u (A2.2)
 *   dersBasisFuns(i, u, p, d, U) → ders[k][j] = k-th derivative of N(i-p+j, p) at u, k = 0…d (A2.3)
 *   multiplicity(U, u, tol) · distinctKnots(U, tol) → [{ u, m }] · clampedUniform(count, p, a = 0, b = 1)
 *   knotProblem(U, p, count) → null, or a code: 'nurbs.err.knots_count' | 'nurbs.err.knots_order' | 'nurbs.err.knots_clamp'
 *     | 'nurbs.err.knots_mult' | 'nurbs.err.knots_value' (the reader's checks on untrusted data)
 *   greville(U, p, count) → the Greville abscissae (knot averages), one per control point
 *   binomial(n, k) · KTOL (two knots closer than this are one knot, relative to the domain length)
 */

export const KTOL = 1e-12;

export function findSpan(n, p, u, U) {
  if (u >= U[n + 1]) return n;
  if (u <= U[p]) return p;
  let lo = p, hi = n + 1, mid = (lo + hi) >> 1;
  while (u < U[mid] || u >= U[mid + 1]) {
    if (u < U[mid]) hi = mid; else lo = mid;
    mid = (lo + hi) >> 1;
  }
  return mid;
}

export function basisFuns(i, u, p, U) {
  const N = new Array(p + 1), left = new Array(p + 1), right = new Array(p + 1);
  N[0] = 1;
  for (let j = 1; j <= p; j++) {
    left[j] = u - U[i + 1 - j];
    right[j] = U[i + j] - u;
    let saved = 0;
    for (let r = 0; r < j; r++) {
      const temp = N[r] / (right[r + 1] + left[j - r]);
      N[r] = saved + right[r + 1] * temp;
      saved = left[j - r] * temp;
    }
    N[j] = saved;
  }
  return N;
}

export function dersBasisFuns(i, u, p, d, U) {
  const ndu = Array.from({ length: p + 1 }, () => new Array(p + 1).fill(0));
  const left = new Array(p + 1), right = new Array(p + 1);
  ndu[0][0] = 1;
  for (let j = 1; j <= p; j++) {
    left[j] = u - U[i + 1 - j];
    right[j] = U[i + j] - u;
    let saved = 0;
    for (let r = 0; r < j; r++) {
      ndu[j][r] = right[r + 1] + left[j - r];          // lower triangle: knot differences
      const temp = ndu[r][j - 1] / ndu[j][r];
      ndu[r][j] = saved + right[r + 1] * temp;         // upper triangle: basis functions
      saved = left[j - r] * temp;
    }
    ndu[j][j] = saved;
  }
  const ders = Array.from({ length: d + 1 }, () => new Array(p + 1).fill(0));
  for (let j = 0; j <= p; j++) ders[0][j] = ndu[j][p];
  const a = [new Array(p + 1).fill(0), new Array(p + 1).fill(0)];
  for (let r = 0; r <= p; r++) {
    let s1 = 0, s2 = 1;
    a[0][0] = 1;
    for (let k = 1; k <= d; k++) {
      let dd = 0;
      const rk = r - k, pk = p - k;
      if (r >= k) { a[s2][0] = a[s1][0] / ndu[pk + 1][rk]; dd = a[s2][0] * ndu[rk][pk]; }
      const j1 = rk >= -1 ? 1 : -rk;
      const j2 = r - 1 <= pk ? k - 1 : p - r;
      for (let j = j1; j <= j2; j++) { a[s2][j] = (a[s1][j] - a[s1][j - 1]) / ndu[pk + 1][rk + j]; dd += a[s2][j] * ndu[rk + j][pk]; }
      if (r <= pk) { a[s2][k] = -a[s1][k - 1] / ndu[pk + 1][r]; dd += a[s2][k] * ndu[r][pk]; }
      ders[k][r] = dd;
      const t = s1; s1 = s2; s2 = t;
    }
  }
  let f = p;
  for (let k = 1; k <= d; k++) { for (let j = 0; j <= p; j++) ders[k][j] *= f; f *= p - k; }
  return ders;
}

export function multiplicity(U, u, tol = KTOL) {
  const span = Math.max(1e-300, U[U.length - 1] - U[0]);
  let m = 0;
  for (const x of U) if (Math.abs(x - u) <= tol * span) m++;
  return m;
}

export function distinctKnots(U, tol = KTOL) {
  const span = Math.max(1e-300, U[U.length - 1] - U[0]);
  const out = [];
  for (const x of U) {
    const last = out[out.length - 1];
    if (last && Math.abs(x - last.u) <= tol * span) last.m++;
    else out.push({ u: x, m: 1 });
  }
  return out;
}

/** A clamped knot vector with uniform interior knots for `count` control points of degree p on [a, b]. */
export function clampedUniform(count, p, a = 0, b = 1) {
  const U = [];
  for (let i = 0; i <= p; i++) U.push(a);
  const inner = count - p - 1;
  for (let i = 1; i <= inner; i++) U.push(a + (b - a) * i / (inner + 1));
  for (let i = 0; i <= p; i++) U.push(b);
  return U;
}

export function knotProblem(U, p, count) {
  if (!Array.isArray(U) || U.length !== count + p + 1) return 'nurbs.err.knots_count';
  for (const x of U) if (typeof x !== 'number' || !Number.isFinite(x)) return 'nurbs.err.knots_value';
  for (let i = 1; i < U.length; i++) if (U[i] < U[i - 1]) return 'nurbs.err.knots_order';
  const a = U[0], b = U[U.length - 1];
  if (!(b > a)) return 'nurbs.err.knots_value';
  for (let i = 0; i <= p; i++) if (U[i] !== a || U[U.length - 1 - i] !== b) return 'nurbs.err.knots_clamp';
  // an interior knot may repeat at most p times (p + 1 would break the curve in two)
  for (const k of distinctKnots(U)) if (k.u !== a && k.u !== b && k.m > p) return 'nurbs.err.knots_mult';
  return null;
}

export function greville(U, p, count) {
  const out = new Array(count);
  for (let i = 0; i < count; i++) { let s = 0; for (let k = 1; k <= p; k++) s += U[i + k]; out[i] = p ? s / p : (U[i] + U[i + 1]) / 2; }
  return out;
}

const BIN = [[1]];
export function binomial(n, k) {
  for (let r = BIN.length; r <= n; r++) {
    const row = [1];
    for (let j = 1; j < r; j++) row.push(BIN[r - 1][j - 1] + BIN[r - 1][j]);
    row.push(1);
    BIN.push(row);
  }
  return k < 0 || k > n ? 0 : BIN[n][k];
}

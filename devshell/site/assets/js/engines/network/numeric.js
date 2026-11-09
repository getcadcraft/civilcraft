/* SPDX-License-Identifier: Apache-2.0 */
/**
 * numeric.js — small deterministic helpers for cc-network (DOM-free, no imports): a real dense solve and complex arithmetic on [re, im] pairs.
 * Methods are plain Gaussian elimination with partial pivoting (any numerical-analysis text).
 */

/** Solve A x = b (A: n×n row arrays). Returns null when singular (pivot below `tiny` of the matrix scale). */
export function solveLinear(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  let scale = 0; for (const r of A) for (const v of r) scale = Math.max(scale, Math.abs(v));
  const tiny = Math.max(scale, 1e-300) * 1e-14;
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) <= tiny) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let k = i + 1; k < n; k++) s -= M[i][k] * x[k]; x[i] = s / M[i][i]; }
  return x;
}

export const C = (re = 0, im = 0) => [re, im];
export const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const csub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
export const cabs = (a) => Math.hypot(a[0], a[1]);
export const carg = (a) => Math.atan2(a[1], a[0]);
export const cconj = (a) => [a[0], -a[1]];
export const cscale = (a, k) => [a[0] * k, a[1] * k];
export const cpolar = (m, ang) => [m * Math.cos(ang), m * Math.sin(ang)];

/** Invert a complex n×n matrix (rows of [re, im] pairs) by Gauss–Jordan; returns null when singular. */
export function cinvert(A) {
  const n = A.length, M = A.map((r, i) => [...r.map((v) => [v[0], v[1]]), ...Array.from({ length: n }, (_, j) => (i === j ? [1, 0] : [0, 0]))]);
  let scale = 0; for (const r of A) for (const v of r) scale = Math.max(scale, cabs(v));
  const tiny = Math.max(scale, 1e-300) * 1e-14;
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (cabs(M[r][c]) > cabs(M[p][c])) p = r;
    if (cabs(M[p][c]) <= tiny) return null;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c]; for (let k = 0; k < 2 * n; k++) M[c][k] = cdiv(M[c][k], d);
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c]; if (f[0] || f[1]) for (let k = 0; k < 2 * n; k++) M[r][k] = csub(M[r][k], cmul(f, M[c][k])); }
  }
  return M.map((r) => r.slice(n));
}

/** Plain-data problem in the shared shape (docs/0.8-PROBLEMS-SPEC.md § 1; rule 29): the host registers it with the shell. */
export function problem(code, severity, text, about = [], extra = {}) {
  return { id: 'network:' + code + ':' + about.map((a) => a.id).join(','), code, severity, text, about, source: { kind: 'engine', name: 'cc-network' }, ...extra };
}

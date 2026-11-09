/* SPDX-License-Identifier: Apache-2.0 */
/** Shared bits of cc-risk: the problem shape (docs/0.8-PROBLEMS-SPEC.md, rule 29), the method/limits record, and a small dense solver. */

export function problem(code, severity, text, about = [], extra = {}) {
  return { id: 'risk:' + code + ':' + about.map((a) => a.id).join(','), code, severity, text, about, source: { kind: 'engine', name: 'cc-risk' }, ...extra };
}
/** Every result says how it was computed and what it does not do. */
export function method(name, ref, limits) { return { name, ref, limits }; }

/** Solve A x = b by Gaussian elimination with partial pivoting; null when singular. A is an array of rows. */
export function solve(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-300) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k]; x[r] = s / M[r][r]; }
  return x;
}

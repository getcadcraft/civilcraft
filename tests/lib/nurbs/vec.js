/* SPDX-License-Identifier: Apache-2.0 */
/**
 * vec.js — cc-nurbs (0.8 SU.747b): the few vector helpers the library needs, on plain arrays of any length. DOM-free.
 */
export const add = (a, b) => a.map((x, i) => x + b[i]);
export const sub = (a, b) => a.map((x, i) => x - b[i]);
export const mul = (a, s) => a.map((x) => x * s);
export const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
export const len = (a) => Math.sqrt(dot(a, a));
export const dist = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; s += d * d; } return Math.sqrt(s); };
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a) => { const l = len(a); return l > 1e-300 ? mul(a, 1 / l) : a.map(() => 0); };
export const lerp = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
/** a·s + b·t (both arrays the same length). */
export const comb = (a, s, b, t) => a.map((x, i) => x * s + b[i] * t);
/** Angle between two vectors in radians (0…π); 0 when either is zero. */
export function angle(a, b) {
  const la = len(a), lb = len(b);
  if (la < 1e-300 || lb < 1e-300) return 0;
  // atan2 of |a×b| and a·b stays accurate for tiny angles (acos does not)
  const c = a.length === 3 ? len(cross(a, b)) : Math.sqrt(Math.max(0, la * la * lb * lb - dot(a, b) ** 2));
  return Math.atan2(c, dot(a, b));
}
/** Any unit vector perpendicular to a 3-vector. */
export function perp(a) {
  const ax = Math.abs(a[0]), ay = Math.abs(a[1]), az = Math.abs(a[2]);
  const o = ax <= ay && ax <= az ? [1, 0, 0] : ay <= az ? [0, 1, 0] : [0, 0, 1];
  return norm(cross(a, o));
}
/** Apply a 4×4 affine matrix (row-major, 16 numbers; the last row is ignored) to a point or (w = 0) a direction. */
export const xform = (m, p, w = 1) => [
  m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + m[3] * w,
  m[4] * p[0] + m[5] * p[1] + m[6] * p[2] + m[7] * w,
  m[8] * p[0] + m[9] * p[1] + m[10] * p[2] + m[11] * w,
];

/** Solve A x = B (A n×n, B n×k, both arrays of rows) by Gaussian elimination with partial pivoting; null when singular. */
export function solve(A, B) {
  const n = A.length, k = B[0].length;
  const M = A.map((r, i) => r.slice().concat(B[i].slice()));
  for (let c = 0; c < n; c++) {
    let piv = c, best = Math.abs(M[c][c]);
    for (let r = c + 1; r < n; r++) { const v = Math.abs(M[r][c]); if (v > best) { best = v; piv = r; } }
    if (best < 1e-14) return null;
    if (piv !== c) { const t = M[c]; M[c] = M[piv]; M[piv] = t; }
    const row = M[c], inv = 1 / row[c];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] * inv;
      if (f === 0) continue;
      const rr = M[r];
      for (let j = c; j < n + k; j++) rr[j] -= f * row[j];
    }
  }
  const X = Array.from({ length: n }, () => new Array(k).fill(0));
  for (let r = n - 1; r >= 0; r--) {
    for (let j = 0; j < k; j++) {
      let s = M[r][n + j];
      for (let c = r + 1; c < n; c++) s -= M[r][c] * X[c][j];
      X[r][j] = s / M[r][r];
    }
  }
  return X;
}

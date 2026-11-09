/* SPDX-License-Identifier: Apache-2.0 */
/**
 * linalg.js — the sparse and small dense linear algebra of lib/fem (0.9 SU.908). DOM-free, imports nothing, own code.
 *
 *   Coo            growable triplet list (row, col, value) → toCsr() sums duplicates
 *   Csr            symmetric-pattern compressed rows { n, ptr: Int32Array, col: Int32Array, val: Float64Array }; csrMul(A, x, y)
 *   ic0(A)         incomplete Cholesky with the pattern of A's lower triangle (Meijerink & van der Vorst 1977); a pivot that would
 *                  not be positive is lifted (diagonal shift, "modified" IC) so the factor always exists; icSolve(L, r, z)
 *   pcg(A, b, { tol, maxIter, prec: 'ic0' | 'jacobi' | 'none', x0 }) → { x, iter, rel, ok, bytes }   preconditioned conjugate gradient
 *                  (Hestenes & Stiefel 1952; Saad, Iterative Methods for Sparse Linear Systems, 2nd ed., Alg. 9.1)
 *   jacobiEig(S, n) → { values, vectors }   dense symmetric eigenproblem by cyclic Jacobi rotations (small matrices: the Ritz step)
 *   solveDense(A, b, n)   Gaussian elimination with partial pivoting
 *
 * Memory: one stored matrix is 12 bytes per entry (Float64 value + Int32 column) plus 4 bytes per row; IC(0) adds the lower half again.
 * Nothing here is dense above the n×n of the Ritz step (n = a handful of modes).
 */

export class Coo {
  constructor(n, cap = 1 << 16) { this.n = n; this.len = 0; this.r = new Int32Array(cap); this.c = new Int32Array(cap); this.v = new Float64Array(cap); }
  add(i, j, x) {
    if (this.len === this.r.length) {
      const g = (a, T) => { const b = new T(a.length * 2); b.set(a); return b; };
      this.r = g(this.r, Int32Array); this.c = g(this.c, Int32Array); this.v = g(this.v, Float64Array);
    }
    this.r[this.len] = i; this.c[this.len] = j; this.v[this.len++] = x;
  }
  /** Sort by row then column, add duplicates. */
  toCsr() {
    const n = this.n, m = this.len, cnt = new Int32Array(n + 1);
    for (let k = 0; k < m; k++) cnt[this.r[k] + 1]++;
    for (let i = 0; i < n; i++) cnt[i + 1] += cnt[i];
    const pos = cnt.slice(0, n), col = new Int32Array(m), val = new Float64Array(m);
    for (let k = 0; k < m; k++) { const p = pos[this.r[k]]++; col[p] = this.c[k]; val[p] = this.v[k]; }
    const ptr = new Int32Array(n + 1), oc = new Int32Array(m), ov = new Float64Array(m);
    let w = 0;
    for (let i = 0; i < n; i++) {
      const a = cnt[i], b = cnt[i + 1];
      // insertion sort by column (rows are short: a few dozen entries), then merge
      for (let p = a + 1; p < b; p++) {
        const cc = col[p], vv = val[p]; let q = p - 1;
        while (q >= a && col[q] > cc) { col[q + 1] = col[q]; val[q + 1] = val[q]; q--; }
        col[q + 1] = cc; val[q + 1] = vv;
      }
      ptr[i] = w;
      for (let p = a; p < b; p++) {
        if (w > ptr[i] && oc[w - 1] === col[p]) ov[w - 1] += val[p];
        else { oc[w] = col[p]; ov[w++] = val[p]; }
      }
    }
    ptr[n] = w;
    return { n, ptr, col: oc.slice(0, w), val: ov.slice(0, w) };
  }
}

export function csrMul(A, x, y) {
  const { n, ptr, col, val } = A;
  for (let i = 0; i < n; i++) { let s = 0; for (let p = ptr[i]; p < ptr[i + 1]; p++) s += val[p] * x[col[p]]; y[i] = s; }
  return y;
}
export function csrDiag(A) {
  const d = new Float64Array(A.n);
  for (let i = 0; i < A.n; i++) for (let p = A.ptr[i]; p < A.ptr[i + 1]; p++) if (A.col[p] === i) d[i] = A.val[p];
  return d;
}
export const csrBytes = (A) => A.ptr.byteLength + A.col.byteLength + A.val.byteLength;

/** IC(0): L with the pattern of the lower triangle of A (diagonal last in each row). */
export function ic0(A) {
  const n = A.n, ptr = new Int32Array(n + 1);
  for (let i = 0; i < n; i++) { let c = 0; for (let p = A.ptr[i]; p < A.ptr[i + 1]; p++) if (A.col[p] <= i) c++; ptr[i + 1] = ptr[i] + c; }
  const col = new Int32Array(ptr[n]), val = new Float64Array(ptr[n]), a = new Float64Array(ptr[n]);
  for (let i = 0; i < n; i++) { let w = ptr[i]; for (let p = A.ptr[i]; p < A.ptr[i + 1]; p++) if (A.col[p] <= i) { col[w] = A.col[p]; a[w++] = A.val[p]; } }
  const dA = csrDiag(A);
  for (let shift = 0; ; shift = shift ? shift * 4 : 1e-4) {
    const work = new Float64Array(n);
    let broke = false;
    for (let i = 0; i < n && !broke; i++) {
      const s0 = ptr[i], s1 = ptr[i + 1] - 1;                       // s1 = the diagonal
      for (let p = s0; p < s1; p++) work[col[p]] = 0;
      for (let p = s0; p < s1; p++) {
        const j = col[p];
        let s = a[p];
        for (let q = ptr[j]; q < ptr[j + 1] - 1; q++) s -= val[q] * work[col[q]];   // work holds L_ik of this row, 0 elsewhere
        const l = s / val[ptr[j + 1] - 1];
        work[j] = l; val[p] = l;
      }
      let d = a[s1] * (1 + shift);
      for (let p = s0; p < s1; p++) d -= val[p] * val[p];
      if (!(d > 1e-12 * Math.abs(dA[i]) && d > 0)) { broke = true; break; }
      val[s1] = Math.sqrt(d);
      for (let p = s0; p < s1; p++) work[col[p]] = 0;
    }
    if (!broke) return { n, ptr, col, val, shift };
    if (shift > 10) throw new Error('ic0: matrix is not positive definite');
  }
}
/** z = (L Lᵀ)⁻¹ r */
export function icSolve(L, r, z) {
  const { n, ptr, col, val } = L;
  for (let i = 0; i < n; i++) {
    let s = r[i];
    for (let p = ptr[i]; p < ptr[i + 1] - 1; p++) s -= val[p] * z[col[p]];
    z[i] = s / val[ptr[i + 1] - 1];
  }
  for (let i = n - 1; i >= 0; i--) {
    const zi = z[i] / val[ptr[i + 1] - 1]; z[i] = zi;
    for (let p = ptr[i]; p < ptr[i + 1] - 1; p++) z[col[p]] -= val[p] * zi;
  }
  return z;
}

export function pcg(A, b, { tol = 1e-10, maxIter = 0, prec = 'ic0', x0 = null, factor = null } = {}) {
  const n = A.n, x = x0 ? Float64Array.from(x0) : new Float64Array(n);
  const r = new Float64Array(n), z = new Float64Array(n), p = new Float64Array(n), q = new Float64Array(n);
  const bn = Math.sqrt(b.reduce((s, v) => s + v * v, 0)) || 1;
  let L = null, dg = null, bytes = csrBytes(A);
  if (prec === 'ic0') { L = factor || ic0(A); bytes += L.col.byteLength + L.val.byteLength + L.ptr.byteLength; }
  else if (prec === 'jacobi') { dg = csrDiag(A); for (let i = 0; i < n; i++) dg[i] = dg[i] > 0 ? 1 / dg[i] : 1; }
  const M = (src, dst) => { if (L) icSolve(L, src, dst); else if (dg) for (let i = 0; i < n; i++) dst[i] = src[i] * dg[i]; else dst.set(src); };
  csrMul(A, x, q);
  for (let i = 0; i < n; i++) r[i] = b[i] - q[i];
  M(r, z); p.set(z);
  let rz = 0; for (let i = 0; i < n; i++) rz += r[i] * z[i];
  maxIter = maxIter || Math.max(200, 4 * n);
  let iter = 0, rel = Math.sqrt(r.reduce((s, v) => s + v * v, 0)) / bn;
  while (rel > tol && iter < maxIter) {
    csrMul(A, p, q);
    let pq = 0; for (let i = 0; i < n; i++) pq += p[i] * q[i];
    if (!(pq > 0)) break;                                           // not positive definite: a mechanism
    const al = rz / pq;
    let rr = 0;
    for (let i = 0; i < n; i++) { x[i] += al * p[i]; r[i] -= al * q[i]; rr += r[i] * r[i]; }
    rel = Math.sqrt(rr) / bn; iter++;
    if (rel <= tol) break;
    M(r, z);
    let rz2 = 0; for (let i = 0; i < n; i++) rz2 += r[i] * z[i];
    const be = rz2 / rz; rz = rz2;
    for (let i = 0; i < n; i++) p[i] = z[i] + be * p[i];
  }
  return { x, iter, rel, ok: rel <= tol, bytes, factor: L };
}

/** Cyclic Jacobi for a symmetric n×n (row-major Float64Array, copied). Values ascending. */
export function jacobiEig(S, n) {
  const A = Float64Array.from(S), V = new Float64Array(n * n);
  for (let i = 0; i < n; i++) V[i * n + i] = 1;
  for (let sweep = 0; sweep < 80; sweep++) {
    let off = 0, dn = 0;
    for (let i = 0; i < n; i++) { dn += A[i * n + i] ** 2; for (let j = i + 1; j < n; j++) off += A[i * n + j] ** 2; }
    if (off <= 1e-30 * (dn + off) || off === 0) break;
    for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
      const apq = A[p * n + q];
      if (Math.abs(apq) < 1e-300) continue;
      const th = (A[q * n + q] - A[p * n + p]) / (2 * apq);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const akp = A[k * n + p], akq = A[k * n + q]; A[k * n + p] = c * akp - s * akq; A[k * n + q] = s * akp + c * akq; }
      for (let k = 0; k < n; k++) { const apk = A[p * n + k], aqk = A[q * n + k]; A[p * n + k] = c * apk - s * aqk; A[q * n + k] = s * apk + c * aqk; }
      for (let k = 0; k < n; k++) { const vkp = V[k * n + p], vkq = V[k * n + q]; V[k * n + p] = c * vkp - s * vkq; V[k * n + q] = s * vkp + c * vkq; }
    }
  }
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => A[a * n + a] - A[b * n + b]);
  return { values: order.map((i) => A[i * n + i]), vectors: order.map((i) => Float64Array.from({ length: n }, (_, k) => V[k * n + i])) };
}

/** Solves A x = b (A n×n row-major, copied). Returns null when singular. */
export function solveDense(A0, b0, n) {
  const A = Float64Array.from(A0), b = Float64Array.from(b0);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r * n + c]) > Math.abs(A[p * n + c])) p = r;
    if (Math.abs(A[p * n + c]) < 1e-300) return null;
    if (p !== c) { for (let k = 0; k < n; k++) { const t = A[c * n + k]; A[c * n + k] = A[p * n + k]; A[p * n + k] = t; } const t = b[c]; b[c] = b[p]; b[p] = t; }
    for (let r = c + 1; r < n; r++) {
      const f = A[r * n + c] / A[c * n + c]; if (!f) continue;
      for (let k = c; k < n; k++) A[r * n + k] -= f * A[c * n + k];
      b[r] -= f * b[c];
    }
  }
  const x = new Float64Array(n);
  for (let r = n - 1; r >= 0; r--) { let s = b[r]; for (let k = r + 1; k < n; k++) s -= A[r * n + k] * x[k]; x[r] = s / A[r * n + r]; }
  return x;
}

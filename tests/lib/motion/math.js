/* SPDX-License-Identifier: Apache-2.0 */
/**
 * math.js — small 3-D and dense linear algebra for cc-motion (0.8 XE.4; DOM-free, no imports).
 * Vectors are [x, y, z]; a 3×3 matrix is 9 numbers, row-major; a transform is {R, p} (R rotates child coordinates into parent coordinates).
 */
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a) => Math.hypot(a[0], a[1], a[2]);
export const unit = (a) => { const n = norm(a); return n > 0 ? scale(a, 1 / n) : [0, 0, 0]; };

export const I3 = () => [1, 0, 0, 0, 1, 0, 0, 0, 1];
export const mmul = (A, B) => {
  const C = new Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j];
  return C;
};
export const mvec = (A, v) => [A[0] * v[0] + A[1] * v[1] + A[2] * v[2], A[3] * v[0] + A[4] * v[1] + A[5] * v[2], A[6] * v[0] + A[7] * v[1] + A[8] * v[2]];
export const mT = (A) => [A[0], A[3], A[6], A[1], A[4], A[7], A[2], A[5], A[8]];
export const mTvec = (A, v) => mvec(mT(A), v);
export const skew = (v) => [0, -v[2], v[1], v[2], 0, -v[0], -v[1], v[0], 0];

/** Rotation by `angle` about unit-ised `axis` (Rodrigues). */
export function axisAngle(axis, angle) {
  const a = unit(axis), c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
  return [t * a[0] * a[0] + c, t * a[0] * a[1] - s * a[2], t * a[0] * a[2] + s * a[1],
    t * a[0] * a[1] + s * a[2], t * a[1] * a[1] + c, t * a[1] * a[2] - s * a[0],
    t * a[0] * a[2] - s * a[1], t * a[1] * a[2] + s * a[0], t * a[2] * a[2] + c];
}
export const rotX = (a) => axisAngle([1, 0, 0], a);
export const rotY = (a) => axisAngle([0, 1, 0], a);
export const rotZ = (a) => axisAngle([0, 0, 1], a);
/** URDF fixed-axis roll-pitch-yaw: R = Rz(yaw) Ry(pitch) Rx(roll). */
export const rpy = (r, p, y) => mmul(rotZ(y), mmul(rotY(p), rotX(r)));
/** Inverse of rpy() for |pitch| < 90°; at the gimbal lock roll is set to 0. */
export function toRpy(R) {
  const sp = -R[6], pitch = Math.asin(Math.max(-1, Math.min(1, sp)));
  if (Math.abs(sp) > 1 - 1e-9) return [0, pitch, Math.atan2(-R[1], R[4])];
  return [Math.atan2(R[7], R[8]), pitch, Math.atan2(R[3], R[0])];
}
/** Rotation vector (axis × angle) of R, angle in [0, π]. */
export function rotvec(R) {
  const tr = R[0] + R[4] + R[8], c = Math.max(-1, Math.min(1, (tr - 1) / 2)), ang = Math.acos(c);
  const w = [R[7] - R[5], R[2] - R[6], R[3] - R[1]];
  if (ang < 1e-9) return scale(w, 0.5);
  if (Math.PI - ang < 1e-6) { // near 180°: axis from the symmetric part
    const d = [Math.sqrt(Math.max(0, (R[0] + 1) / 2)), Math.sqrt(Math.max(0, (R[4] + 1) / 2)), Math.sqrt(Math.max(0, (R[8] + 1) / 2))];
    if (R[1] + R[3] < 0) d[1] = -d[1]; if (R[2] + R[6] < 0) d[2] = -d[2];
    return scale(unit(d), ang);
  }
  return scale(w, ang / (2 * Math.sin(ang)));
}

export const T_ident = () => ({ R: I3(), p: [0, 0, 0] });
export const T_mul = (A, B) => ({ R: mmul(A.R, B.R), p: add(A.p, mvec(A.R, B.p)) });
export const T_inv = (A) => { const Rt = mT(A.R); return { R: Rt, p: scale(mvec(Rt, A.p), -1) }; };
export const T_apply = (A, v) => add(A.p, mvec(A.R, v));

/** Dense helpers on arrays of rows. */
export const zeros = (n, m) => Array.from({ length: n }, () => new Array(m).fill(0));
export const transpose = (A) => A.length ? A[0].map((_, j) => A.map((r) => r[j])) : [];
export const matmul = (A, B) => { const n = A.length, m = B[0].length, k = B.length, C = zeros(n, m); for (let i = 0; i < n; i++) for (let l = 0; l < k; l++) { const a = A[i][l]; if (a) for (let j = 0; j < m; j++) C[i][j] += a * B[l][j]; } return C; };
export const matvec = (A, x) => A.map((r) => r.reduce((s, v, j) => s + v * x[j], 0));

/** Solve A x = b (Gaussian elimination, partial pivoting). Returns null when singular. */
export function solve(A, b) {
  const n = A.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-14) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
  return x;
}
/** Cholesky test for a symmetric positive-definite matrix. */
export function isSPD(A) {
  const n = A.length, L = zeros(n, n);
  for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
    let s = A[i][j]; for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
    if (i === j) { if (s <= 1e-14) return false; L[i][i] = Math.sqrt(s); } else L[i][j] = s / L[j][j];
  }
  return true;
}
/** Singular values of an m×n matrix by the eigenvalues of the Gram matrix (Jacobi), descending. Fine for 6×n Jacobians. */
export function singularValues(J) {
  const m = J.length, n = m ? J[0].length : 0;
  const G = m <= n ? matmul(J, transpose(J)) : matmul(transpose(J), J), k = G.length;
  const A = G.map((r) => r.slice());
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0; for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) off += A[i][j] * A[i][j];
    if (off < 1e-26) break;
    for (let p = 0; p < k; p++) for (let q = p + 1; q < k; q++) {
      if (Math.abs(A[p][q]) < 1e-30) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let r = 0; r < k; r++) { const x = A[r][p], y = A[r][q]; A[r][p] = c * x - s * y; A[r][q] = s * x + c * y; }
      for (let r = 0; r < k; r++) { const x = A[p][r], y = A[q][r]; A[p][r] = c * x - s * y; A[q][r] = s * x + c * y; }
    }
  }
  return A.map((r, i) => Math.sqrt(Math.max(0, r[i]))).sort((a, b) => b - a);
}
export function problem(code, severity, text, about = [], extra = {}) {
  return { id: 'motion:' + code + ':' + about.map((a) => a.id).join(','), code, severity, text, about, source: { kind: 'engine', name: 'cc-motion' }, ...extra };
}

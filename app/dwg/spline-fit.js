/* SPDX-License-Identifier: Apache-2.0 */
// spline-fit.js — the control points of a spline stored by fit points (moved out of read.js 0.7 D7.10, so CadCraft's SPLINE command can use
// the same curve without loading the reader). No dependencies.

/**
 * Control points of a spline the file stores by fit points only (scenario 2, 20.4.40): the DWG holds the fit
 * points, end tangents and knot parameterization; programs compute the curve. Spec gap: the spec does not say
 * how. Found by matching the ODA File Converter's DXF to 1e-9: clamped cubic (degree p) B-spline through the
 * fit points at parameters = cumulative chord length (knotParam 0; square root of it for 1, uniform for 2), with
 * the end derivatives equal to the given unit tangents, or a zero second derivative (natural end) when a
 * tangent is (0,0,0); knots [0×(p+1), the inner parameters, total×(p+1)]. Only for a fit tolerance of 0 (with a
 * tolerance the program approximates). Returns null when it cannot.
 */
export function fitSplineControl(fit, degree, t0, t1, knotParam = 0) {
  const n = fit.length, p = degree || 3;
  if (p !== 3 || n < 2 || n > 2000) return null;
  const u = [0];
  for (let i = 1; i < n; i++) {
    const a = fit[i - 1], b = fit[i];
    let d = Math.hypot(b.x - a.x, b.y - a.y, (b.z || 0) - (a.z || 0));
    if (knotParam === 1) d = Math.sqrt(d); else if (knotParam === 2) d = 1;
    u.push(u[i - 1] + d);
  }
  const L = u[n - 1];
  if (!(L > 0)) return null;
  const knots = [0, 0, 0, 0, ...u.slice(1, n - 1), L, L, L, L];
  const m = n + 2;   // control points
  // basis functions of degree 3 at parameter t (span search on the knot vector)
  const basis = (t) => {
    let span = 3;
    while (span < m - 1 && t >= knots[span + 1]) span++;
    const N = [1, 0, 0, 0], left = [], right = [];
    for (let j = 1; j <= 3; j++) {
      left[j] = t - knots[span + 1 - j]; right[j] = knots[span + j] - t;
      let saved = 0;
      for (let r = 0; r < j; r++) {
        const tmp = N[r] / (right[r + 1] + left[j - r]);
        N[r] = saved + right[r + 1] * tmp;
        saved = left[j - r] * tmp;
      }
      N[j] = saved;
    }
    return { span, N };
  };
  // linear system A·P = B, rows: start end condition, n interpolation rows, end condition
  const A = Array.from({ length: m }, () => new Float64Array(m));
  const B = Array.from({ length: m }, () => [0, 0, 0]);
  const has = (t) => t && (t.x || t.y || t.z);
  // row 0: P0 = Q0
  A[0][0] = 1; B[0] = [fit[0].x, fit[0].y, fit[0].z || 0];
  // row 1: start condition on P1
  const u4 = knots[4], u5 = knots[5];
  if (has(t0)) { A[1][0] = -1; A[1][1] = 1; B[1] = [t0.x * u4 / 3, t0.y * u4 / 3, (t0.z || 0) * u4 / 3]; }
  else { A[1][0] = 1 / u4; A[1][1] = -1 / u4 - 1 / (u5 - knots[1] || u5); A[1][2] = 1 / (u5 - knots[1] || u5); }
  // interior interpolation rows
  for (let k = 1; k < n - 1; k++) {
    const { span, N } = basis(u[k]);
    for (let j = 0; j <= 3; j++) A[k + 1][span - 3 + j] = N[j];
    B[k + 1] = [fit[k].x, fit[k].y, fit[k].z || 0];
  }
  // end condition on P(m-2), then P(m-1) = Q(n-1)
  const ua = knots[m - 1], ub = knots[m - 2];   // u_{m-1} and u_{m-2} (inner knots next to the end)
  const e1 = L - ua, e2 = L - ub;
  if (has(t1)) { A[m - 2][m - 2] = -1; A[m - 2][m - 1] = 1; B[m - 2] = [t1.x * e1 / 3, t1.y * e1 / 3, (t1.z || 0) * e1 / 3]; }
  else { A[m - 2][m - 1] = 1 / e1; A[m - 2][m - 2] = -1 / e1 - 1 / e2; A[m - 2][m - 3] = 1 / e2; }
  A[m - 1][m - 1] = 1; B[m - 1] = [fit[n - 1].x, fit[n - 1].y, fit[n - 1].z || 0];
  // Gaussian elimination with partial pivoting (the matrix is banded; m is small)
  for (let c = 0; c < m; c++) {
    let piv = c;
    for (let r = c + 1; r < Math.min(m, c + 5); r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    if (!A[piv][c]) return null;
    if (piv !== c) { [A[piv], A[c]] = [A[c], A[piv]]; [B[piv], B[c]] = [B[c], B[piv]]; }
    for (let r = c + 1; r < Math.min(m, c + 5); r++) {
      const f = A[r][c] / A[c][c];
      if (!f) continue;
      for (let k = c; k < Math.min(m, c + 6); k++) A[r][k] -= f * A[c][k];
      for (let k = 0; k < 3; k++) B[r][k] -= f * B[c][k];
    }
  }
  const P = new Array(m);
  for (let r = m - 1; r >= 0; r--) {
    const v = B[r].slice();
    for (let k = r + 1; k < Math.min(m, r + 6); k++) if (A[r][k]) for (let q = 0; q < 3; q++) v[q] -= A[r][k] * P[k][q];
    P[r] = v.map((x) => x / A[r][r]);
  }
  return { knots, control: P.map(([x, y, z]) => ({ x, y, z })) };
}

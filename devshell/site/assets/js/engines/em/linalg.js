/* SPDX-License-Identifier: Apache-2.0 */
/** Dense linear algebra for lib/em: real and complex LU with partial pivoting. Complex numbers are {re, im} pairs held in two Float64Arrays. */

/** Solve A x = b (A: n×n array of Float64Array rows or flat), in place on copies. Returns x or null when singular. */
export function solveReal(A, b, tiny = 1e-300) {
  const n = b.length, a = A.map((r) => Float64Array.from(r)), x = Float64Array.from(b);
  for (let k = 0; k < n; k++) {
    let p = k, mx = Math.abs(a[k][k]);
    for (let i = k + 1; i < n; i++) if (Math.abs(a[i][k]) > mx) { mx = Math.abs(a[i][k]); p = i; }
    if (!(mx > tiny)) return null;
    if (p !== k) { [a[p], a[k]] = [a[k], a[p]]; [x[p], x[k]] = [x[k], x[p]]; }
    for (let i = k + 1; i < n; i++) {
      const f = a[i][k] / a[k][k]; if (f === 0) continue;
      for (let j = k; j < n; j++) a[i][j] -= f * a[k][j];
      x[i] -= f * x[k];
    }
  }
  for (let i = n - 1; i >= 0; i--) { let s = x[i]; for (let j = i + 1; j < n; j++) s -= a[i][j] * x[j]; x[i] = s / a[i][i]; }
  return x;
}

/** Complex solve: Ar, Ai are arrays of Float64Array rows; br, bi vectors. Returns {re, im} or null when singular. */
export function solveComplex(Ar, Ai, br, bi, tiny = 1e-300) {
  const n = br.length, ar = Ar.map((r) => Float64Array.from(r)), ai = Ai.map((r) => Float64Array.from(r)), xr = Float64Array.from(br), xi = Float64Array.from(bi);
  for (let k = 0; k < n; k++) {
    let p = k, mx = Math.hypot(ar[k][k], ai[k][k]);
    for (let i = k + 1; i < n; i++) { const m = Math.hypot(ar[i][k], ai[i][k]); if (m > mx) { mx = m; p = i; } }
    if (!(mx > tiny)) return null;
    if (p !== k) { [ar[p], ar[k]] = [ar[k], ar[p]]; [ai[p], ai[k]] = [ai[k], ai[p]]; [xr[p], xr[k]] = [xr[k], xr[p]]; [xi[p], xi[k]] = [xi[k], xi[p]]; }
    const d = ar[k][k] * ar[k][k] + ai[k][k] * ai[k][k];
    for (let i = k + 1; i < n; i++) {
      // f = a[i][k] / a[k][k]
      const fr = (ar[i][k] * ar[k][k] + ai[i][k] * ai[k][k]) / d, fi = (ai[i][k] * ar[k][k] - ar[i][k] * ai[k][k]) / d;
      if (fr === 0 && fi === 0) continue;
      for (let j = k; j < n; j++) { ar[i][j] -= fr * ar[k][j] - fi * ai[k][j]; ai[i][j] -= fr * ai[k][j] + fi * ar[k][j]; }
      xr[i] -= fr * xr[k] - fi * xi[k]; xi[i] -= fr * xi[k] + fi * xr[k];
    }
  }
  for (let i = n - 1; i >= 0; i--) {
    let sr = xr[i], si = xi[i];
    for (let j = i + 1; j < n; j++) { sr -= ar[i][j] * xr[j] - ai[i][j] * xi[j]; si -= ar[i][j] * xi[j] + ai[i][j] * xr[j]; }
    const d = ar[i][i] * ar[i][i] + ai[i][i] * ai[i][i];
    xr[i] = (sr * ar[i][i] + si * ai[i][i]) / d; xi[i] = (si * ar[i][i] - sr * ai[i][i]) / d;
  }
  return { re: xr, im: xi };
}

/** Conjugate-gradient for symmetric positive definite sparse systems given as a row-list matrix [[ [col, val], … ], …]. */
export function cgSolve(rows, b, { tol = 1e-10, maxIter = 20000, x0 } = {}) {
  const n = b.length, x = x0 ? Float64Array.from(x0) : new Float64Array(n);
  const mul = (v, out) => { for (let i = 0; i < n; i++) { let s = 0; const r = rows[i]; for (let k = 0; k < r.length; k++) s += r[k][1] * v[r[k][0]]; out[i] = s; } };
  const dg = new Float64Array(n); for (let i = 0; i < n; i++) for (const [c, v] of rows[i]) if (c === i) dg[i] += v;
  const r = new Float64Array(n), z = new Float64Array(n), p = new Float64Array(n), ap = new Float64Array(n);
  mul(x, ap); for (let i = 0; i < n; i++) r[i] = b[i] - ap[i];
  const bn = Math.sqrt(b.reduce((s, v) => s + v * v, 0)) || 1;
  for (let i = 0; i < n; i++) { z[i] = dg[i] > 0 ? r[i] / dg[i] : r[i]; p[i] = z[i]; }
  let rz = 0; for (let i = 0; i < n; i++) rz += r[i] * z[i];
  let it = 0;
  for (; it < maxIter; it++) {
    let rn = 0; for (let i = 0; i < n; i++) rn += r[i] * r[i];
    if (Math.sqrt(rn) <= tol * bn) break;
    mul(p, ap); let pap = 0; for (let i = 0; i < n; i++) pap += p[i] * ap[i];
    if (!(pap > 0)) return { x, iterations: it, ok: false };
    const al = rz / pap; for (let i = 0; i < n; i++) { x[i] += al * p[i]; r[i] -= al * ap[i]; }
    for (let i = 0; i < n; i++) z[i] = dg[i] > 0 ? r[i] / dg[i] : r[i];
    let rz2 = 0; for (let i = 0; i < n; i++) rz2 += r[i] * z[i];
    const be = rz2 / rz; rz = rz2; for (let i = 0; i < n; i++) p[i] = z[i] + be * p[i];
  }
  return { x, iterations: it, ok: it < maxIter };
}

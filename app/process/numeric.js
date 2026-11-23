/* SPDX-License-Identifier: Apache-2.0 */
/** numeric.js — small deterministic helpers shared by the process engine (linear solve, Newton with a finite-difference Jacobian, RK45). */

/** Solve A x = b (A n×n row arrays) by Gaussian elimination with partial pivoting; returns null if singular. */
export function solveLinear(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-300) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let k = i + 1; k < n; k++) s -= M[i][k] * x[k]; x[i] = s / M[i][i]; }
  return x;
}
/** Newton on F(x)=0 with a forward-difference Jacobian, damping and an optional feasibility test. → { x, ok, iter, norm } */
export function newtonFD(F, x0, { tol = 1e-10, maxIter = 100, feasible = null, rel = 1e-7 } = {}) {
  let x = x0.slice(), f = F(x), nrm = Math.hypot(...f);
  for (let it = 0; it < maxIter; it++) {
    if (nrm < tol) return { x, ok: true, iter: it, norm: nrm };
    const n = x.length, J = Array.from({ length: f.length }, () => new Array(n));
    for (let j = 0; j < n; j++) { const h = rel * Math.max(Math.abs(x[j]), 1e-6), xp = x.slice(); xp[j] += h; const fp = F(xp); for (let i = 0; i < f.length; i++) J[i][j] = (fp[i] - f[i]) / h; }
    const dx = solveLinear(J, f.map((v) => -v)); if (!dx) return { x, ok: false, iter: it, norm: nrm };
    let lam = 1, moved = false;
    for (let k = 0; k < 40; k++) {
      const xn = x.map((v, i) => v + lam * dx[i]);
      if (!feasible || feasible(xn)) { const fn = F(xn), nn = Math.hypot(...fn); if (nn < nrm || nn < tol) { x = xn; f = fn; nrm = nn; moved = true; break; } }
      lam *= 0.5;
    }
    if (!moved) return { x, ok: nrm < tol * 1e3, iter: it, norm: nrm };
  }
  return { x, ok: nrm < tol * 1e3, iter: maxIter, norm: nrm };
}
/** Dormand–Prince RK45, adaptive; f(x, y) → dy. Returns { y, steps, points[] } with the accepted points (x, y). */
export function rk45(f, y0, x0, x1, { rtol = 1e-9, atol = 1e-12, h0 = null, maxSteps = 200000 } = {}) {
  const c = [0, 1 / 5, 3 / 10, 4 / 5, 8 / 9, 1, 1];
  const a = [[], [1 / 5], [3 / 40, 9 / 40], [44 / 45, -56 / 15, 32 / 9], [19372 / 6561, -25360 / 2187, 64448 / 6561, -212 / 729], [9017 / 3168, -355 / 33, 46732 / 5247, 49 / 176, -5103 / 18656], [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84]];
  const b5 = [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84, 0], b4 = [5179 / 57600, 0, 7571 / 16695, 393 / 640, -92097 / 339200, 187 / 2100, 1 / 40];
  let x = x0, y = y0.slice(), h = h0 || (x1 - x0) / 100, steps = 0; const points = [[x, y.slice()]];
  while (x < x1 && steps < maxSteps) {
    if (x + h > x1) h = x1 - x;
    const k = []; for (let s = 0; s < 7; s++) { const ys = y.map((v, i) => { let t = 0; for (let j = 0; j < s; j++) t += a[s][j] * k[j][i]; return v + h * t; }); k.push(f(x + c[s] * h, ys)); }
    let err = 0; const yn = y.map((v, i) => { let t = 0, e = 0; for (let s = 0; s < 7; s++) { t += b5[s] * k[s][i]; e += (b5[s] - b4[s]) * k[s][i]; } const sc = atol + rtol * Math.max(Math.abs(v), Math.abs(v + h * t)); err = Math.max(err, Math.abs(h * e) / sc); return v + h * t; });
    if (err <= 1 || h < 1e-14 * Math.max(1, Math.abs(x1))) { x += h; y = yn; points.push([x, y.slice()]); }
    h *= Math.min(5, Math.max(0.2, 0.9 * Math.pow(err || 1e-10, -0.2))); steps++;
  }
  return { y, steps, points };
}
/** Bracketed root find on [a,b] (f(a), f(b) of opposite sign) by bisection+secant (Illinois); deterministic. */
export function illinois(f, a, b, { tol = 1e-12, maxIter = 200 } = {}) {
  let fa = f(a), fb = f(b), side = 0; if (fa === 0) return a; if (fb === 0) return b; if (fa * fb > 0) return null;
  let c = a;
  for (let i = 0; i < maxIter; i++) {
    c = (fa * b - fb * a) / (fa - fb); const fc = f(c);
    if (Math.abs(fc) < tol || Math.abs(b - a) < tol * (1 + Math.abs(c))) return c;
    if (fc * fb > 0) { b = c; fb = fc; if (side === -1) fa /= 2; side = -1; } else { a = c; fa = fc; if (side === 1) fb /= 2; side = 1; }
  }
  return c;
}

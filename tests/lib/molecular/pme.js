/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pme.js — smooth particle-mesh Ewald (SPME) reciprocal sum and SHAKE bond constraints (0.8 Track CH, CH.25; DOM-free, no imports).
 * Clean room from the published papers: Essmann, Perera, Berkowitz, Darden, Lee and Pedersen (1995) J. Chem. Phys. 103, 8577 for SPME (cardinal B-splines,
 * charge spreading on a grid, FFT convolution with the B-spline moduli, forces from the spline derivatives), Ryckaert, Ciccotti and Berendsen (1977) for SHAKE.
 *   pmeRecip({ x, q, box, alpha, grid: [Kx, Ky, Kz] (powers of two), order = 4, ke }) → { E, F (Float64Array 3N, force = -dE/dr), W (virial term, = E as for the plain sum) }
 *   shake(sys, constraints [[i, j, d]], dt, xOld, tol) adjusts positions after an unconstrained step so each |r_i - r_j| = d, and the velocities with them.
 * Not built: RATTLE velocity constraints separately (the velocity correction is the SHAKE displacement over dt), triclinic cells, non-power-of-two grids.
 */
function fft1(re, im, inv) {                      // in place radix-2, unnormalised; inv = +1 for exp(+i), -1 for exp(-i)
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = inv * 2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) {
      const a = i + k, b = i + k + len / 2, tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
      re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } }
  }
}
function fft3(re, im, K, inv) {
  const [nx, ny, nz] = K, bx = new Float64Array(nx), by = new Float64Array(nx);
  for (let y = 0; y < ny; y++) for (let z = 0; z < nz; z++) { for (let x = 0; x < nx; x++) { const i = (x * ny + y) * nz + z; bx[x] = re[i]; by[x] = im[i]; } fft1(bx, by, inv); for (let x = 0; x < nx; x++) { const i = (x * ny + y) * nz + z; re[i] = bx[x]; im[i] = by[x]; } }
  const cy = new Float64Array(ny), dy = new Float64Array(ny);
  for (let x = 0; x < nx; x++) for (let z = 0; z < nz; z++) { for (let y = 0; y < ny; y++) { const i = (x * ny + y) * nz + z; cy[y] = re[i]; dy[y] = im[i]; } fft1(cy, dy, inv); for (let y = 0; y < ny; y++) { const i = (x * ny + y) * nz + z; re[i] = cy[y]; im[i] = dy[y]; } }
  const cz = new Float64Array(nz), dz = new Float64Array(nz);
  for (let x = 0; x < nx; x++) for (let y = 0; y < ny; y++) { const o = (x * ny + y) * nz; for (let z = 0; z < nz; z++) { cz[z] = re[o + z]; dz[z] = im[o + z]; } fft1(cz, dz, inv); for (let z = 0; z < nz; z++) { re[o + z] = cz[z]; im[o + z] = dz[z]; } }
}
/** Cardinal B-spline M_n(u) (Essmann eq. 4.1). */
export function bspline(n, u) {
  if (u <= 0 || u >= n) return 0;
  if (n === 2) return 1 - Math.abs(u - 1);
  return u / (n - 1) * bspline(n - 1, u) + (n - u) / (n - 1) * bspline(n - 1, u - 1);
}
const dbspline = (n, u) => bspline(n - 1, u) - bspline(n - 1, u - 1);
function modulus2(K, n) {                          // |b(m)|^2 for m = 0..K-1
  const out = new Float64Array(K);
  for (let m = 0; m < K; m++) { let re = 0, im = 0; for (let k = 0; k <= n - 2; k++) { const M = bspline(n, k + 1), a = 2 * Math.PI * m * k / K; re += M * Math.cos(a); im += M * Math.sin(a); } const d = re * re + im * im; out[m] = d > 1e-12 ? 1 / d : 0; }
  // an interior zero (odd order at K/2) is patched by its neighbours, the usual practice
  for (let m = 0; m < K; m++) if (out[m] === 0) out[m] = 0.5 * (out[(m + K - 1) % K] + out[(m + 1) % K]);
  return out;
}
export function pmeRecip({ x, q, box, alpha, grid, order = 4, ke = 1 }) {
  const N = q.length, K = grid, n = order, V = box[0] * box[1] * box[2], tot = K[0] * K[1] * K[2];
  if (K.some((k) => (k & (k - 1)) !== 0 || k < 2 * n)) throw new Error('PME grid sizes must be powers of two, at least twice the spline order');
  const Qr = new Float64Array(tot), Qi = new Float64Array(tot), idx = [], wt = [], dwt = [];
  for (let i = 0; i < N; i++) {
    const I = [], W = [], DW = [];
    for (let d = 0; d < 3; d++) {
      let w = x[3 * i + d] / box[d]; w -= Math.floor(w); const u = w * K[d], fl = Math.floor(u), fr = u - fl, ii = new Int32Array(n), ww = new Float64Array(n), dd = new Float64Array(n);
      for (let j = 0; j < n; j++) { ii[j] = ((fl - j) % K[d] + K[d]) % K[d]; ww[j] = bspline(n, fr + j); dd[j] = dbspline(n, fr + j); }
      I.push(ii); W.push(ww); DW.push(dd);
    }
    idx.push(I); wt.push(W); dwt.push(DW);
    if (!q[i]) continue;
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) Qr[(I[0][a] * K[1] + I[1][b]) * K[2] + I[2][c]] += q[i] * wt[i][0][a] * wt[i][1][b] * wt[i][2][c];
  }
  const Q0 = Float64Array.from(Qr);
  fft3(Qr, Qi, K, -1);                              // Q^(m) = sum_k Q(k) exp(-2 pi i m k / K)
  const B = [modulus2(K[0], n), modulus2(K[1], n), modulus2(K[2], n)], pi2a = Math.PI * Math.PI / (alpha * alpha);
  let E = 0;
  for (let a = 0; a < K[0]; a++) { const ma = (a <= K[0] / 2 ? a : a - K[0]) / box[0];
    for (let b = 0; b < K[1]; b++) { const mb = (b <= K[1] / 2 ? b : b - K[1]) / box[1];
      for (let c = 0; c < K[2]; c++) {
        const i = (a * K[1] + b) * K[2] + c, mc = (c <= K[2] / 2 ? c : c - K[2]) / box[2], m2 = ma * ma + mb * mb + mc * mc;
        if (m2 === 0) { Qr[i] = 0; Qi[i] = 0; continue; }
        const G = ke / (Math.PI * V) * Math.exp(-pi2a * m2) / m2 * B[0][a] * B[1][b] * B[2][c];
        E += 0.5 * G * (Qr[i] * Qr[i] + Qi[i] * Qi[i]); Qr[i] *= G; Qi[i] *= G;
      } } }
  fft3(Qr, Qi, K, +1);                              // theta(k) = sum_m G Q^(m) exp(+2 pi i m k / K)
  const F = new Float64Array(3 * N);
  for (let i = 0; i < N; i++) {
    if (!q[i]) continue; const I = idx[i], W = wt[i], D = dwt[i];
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) {
      const th = Qr[(I[0][a] * K[1] + I[1][b]) * K[2] + I[2][c]];
      F[3 * i] -= q[i] * th * D[0][a] * W[1][b] * W[2][c] * K[0] / box[0];
      F[3 * i + 1] -= q[i] * th * W[0][a] * D[1][b] * W[2][c] * K[1] / box[1];
      F[3 * i + 2] -= q[i] * th * W[0][a] * W[1][b] * D[2][c] * K[2] / box[2];
    }
  }
  void Q0; return { E, F, W: E };
}

/** SHAKE. sys { N, box, x, v, mass } (typed arrays), constraints [[i, j, d]], xOld = positions before the step (the reference bond directions), dt. Corrects x and v in place. */
export function shake(sys, constraints, dt, xOld, tol = 1e-10, maxIter = 500) {
  const { x, v, mass, box } = sys, mi = (d, L) => d - L * Math.round(d / L); let worst = 0, iters = 0;
  for (let it = 0; it < maxIter; it++) {
    let done = true; iters = it + 1;
    for (const [i, j, d] of constraints) {
      const rx = mi(x[3 * i] - x[3 * j], box[0]), ry = mi(x[3 * i + 1] - x[3 * j + 1], box[1]), rz = mi(x[3 * i + 2] - x[3 * j + 2], box[2]);
      const diff = d * d - (rx * rx + ry * ry + rz * rz); if (Math.abs(diff) <= 2 * tol * d * d) continue; done = false;
      const sx = mi(xOld[3 * i] - xOld[3 * j], box[0]), sy = mi(xOld[3 * i + 1] - xOld[3 * j + 1], box[1]), sz = mi(xOld[3 * i + 2] - xOld[3 * j + 2], box[2]);
      const mu = 1 / mass[i] + 1 / mass[j], g = diff / (2 * mu * (rx * sx + ry * sy + rz * sz));
      const c = [g * sx, g * sy, g * sz];
      for (let k = 0; k < 3; k++) { x[3 * i + k] += c[k] / mass[i]; x[3 * j + k] -= c[k] / mass[j]; v[3 * i + k] += c[k] / mass[i] / dt; v[3 * j + k] -= c[k] / mass[j] / dt; }
    }
    if (done) break;
  }
  for (const [i, j, d] of constraints) { const r = Math.hypot(mi(x[3 * i] - x[3 * j], box[0]), mi(x[3 * i + 1] - x[3 * j + 1], box[1]), mi(x[3 * i + 2] - x[3 * j + 2], box[2])); worst = Math.max(worst, Math.abs(r - d) / d); }
  return { iterations: iters, worst };
}

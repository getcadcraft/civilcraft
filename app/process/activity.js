/* SPDX-License-Identifier: Apache-2.0 */
/**
 * activity.js — liquid activity-coefficient models NRTL, UNIQUAC and Wilson, and Henry's law (0.8 Track CH, CH.1; DOM-free).
 * Equations as published: NRTL Renon & Prausnitz, AIChE J. 14 (1968) 135; UNIQUAC Abrams & Prausnitz, AIChE J. 21 (1975) 116;
 * Wilson, J. Am. Chem. Soc. 86 (1964) 127 (all three in SVN7 ch. 12 and Reid–Prausnitz–Poling ch. 8).
 *
 * Parameters are the person's (or a pack's) with their own source; none are shipped as "the" parameters of a pair. Each parameter matrix
 * is given as { a: [[..]], b: [[..]] } with the temperature form  p_ij = a_ij + b_ij / T  (T in K). Diagonals are ignored.
 *   NRTL    tau_ij = a_ij + b_ij/T, G_ij = exp(-alpha_ij tau_ij); alpha is a matrix or one number (default 0.3).
 *   Wilson  ln Lambda_ij = a_ij + b_ij/T   (Lambda_ii = 1).
 *   UNIQUAC ln tau_ij = a_ij + b_ij/T (tau_ii = 1); pure-component r (volume) and q (area) are given; coordination number z = 10.
 * Every model returns ln gamma for a mole-fraction vector x.
 */
const mat = (p, n, T) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : (p?.a?.[i]?.[j] || 0) + (p?.b?.[i]?.[j] || 0) / T)));

export function lnGammaNRTL(x, T, par) {
  const n = x.length, tau = mat(par, n, T), al = (i, j) => (Array.isArray(par.alpha) ? par.alpha[i][j] : (par.alpha ?? 0.3));
  const G = tau.map((row, i) => row.map((t, j) => (i === j ? 1 : Math.exp(-al(i, j) * t))));
  const S = new Array(n).fill(0), C = new Array(n).fill(0);          // S_j = sum_k x_k G_kj, C_j = sum_m x_m tau_mj G_mj
  for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) { S[j] += x[k] * G[k][j]; C[j] += x[k] * tau[k][j] * G[k][j]; }
  const out = [];
  for (let i = 0; i < n; i++) {
    let s = C[i] / S[i];
    for (let j = 0; j < n; j++) s += x[j] * G[i][j] / S[j] * (tau[i][j] - C[j] / S[j]);
    out.push(s);
  }
  return out;
}
export function lnGammaWilson(x, T, par) {
  const n = x.length, ln = mat(par, n, T), L = ln.map((row, i) => row.map((v, j) => (i === j ? 1 : Math.exp(v))));
  const S = new Array(n).fill(0); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) S[i] += x[j] * L[i][j];
  const out = [];
  for (let i = 0; i < n; i++) { let t = 0; for (let k = 0; k < n; k++) t += x[k] * L[k][i] / S[k]; out.push(1 - Math.log(S[i]) - t); }
  return out;
}
export function lnGammaUNIQUAC(x, T, par) {
  const n = x.length, ln = mat(par, n, T), tau = ln.map((row, i) => row.map((v, j) => (i === j ? 1 : Math.exp(v)))), z = par.z || 10;
  const r = par.r, q = par.q; let sr = 0, sq = 0;
  for (let i = 0; i < n; i++) { sr += x[i] * r[i]; sq += x[i] * q[i]; }
  const phi = x.map((xi, i) => xi * r[i] / sr), th = x.map((xi, i) => xi * q[i] / sq), l = r.map((ri, i) => z / 2 * (ri - q[i]) - (ri - 1));
  let sl = 0; for (let j = 0; j < n; j++) sl += x[j] * l[j];
  const Sj = new Array(n).fill(0); for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) Sj[j] += th[k] * tau[k][j];
  const out = [];
  for (let i = 0; i < n; i++) {
    const comb = (x[i] > 0 ? Math.log(phi[i] / x[i]) + z / 2 * q[i] * Math.log(th[i] / phi[i]) : 0) + l[i] - (x[i] > 0 ? phi[i] / x[i] : r[i] / sr) * sl;
    let res = 0; for (let j = 0; j < n; j++) res += th[j] * tau[i][j] / Sj[j];
    out.push(comb + q[i] * (1 - Math.log(Sj[i]) - res));
  }
  return out;
}
export const GAMMA = { nrtl: lnGammaNRTL, wilson: lnGammaWilson, uniquac: lnGammaUNIQUAC };

/** Closed-form infinite-dilution limits (published), used by the tests: ln gamma_1^inf for a binary, species 1 dilute in 2. */
export function lnGammaInfinity(model, T, par) {
  const t = mat(par, 2, T);
  if (model === 'nrtl') { const al = Array.isArray(par.alpha) ? par.alpha[0][1] : (par.alpha ?? 0.3); return [t[1][0] + t[0][1] * Math.exp(-al * t[0][1]), t[0][1] + t[1][0] * Math.exp(-al * t[1][0])]; }
  if (model === 'wilson') { const L12 = Math.exp(t[0][1]), L21 = Math.exp(t[1][0]); return [-Math.log(L12) + 1 - L21, -Math.log(L21) + 1 - L12]; }
  throw new Error('no closed form for ' + model);
}

/**
 * Henry's law  f_i = x_i H_i  (mole-fraction basis, H in Pa). Temperature form  ln H = a + b/T + c ln T (a van't Hoff line when only a, b).
 * `HENRY_WATER_298` are widely tabulated solubilities of gases in water at 25 C (mole-fraction H in bar; Perry's Chemical Engineers'
 * Handbook, "Solubility of inorganic gases in water", and Sander, Atmos. Chem. Phys. 15 (2015) 4399, converted): approximate to about 5 %,
 * to be replaced by the person's own data.
 */
export const HENRY_WATER_298 = { oxygen: 4.4e4, nitrogen: 8.6e4, hydrogen: 7.1e4, methane: 4.1e4, co2: 1.67e3, co: 5.8e4, h2s: 5.5e2, ethane: 3.0e4, ethylene: 1.2e4 };
export function henry(H298bar, T, dlnHdInvT = 0) { return H298bar * 1e5 * Math.exp(dlnHdInvT * (1 / T - 1 / 298.15)); }

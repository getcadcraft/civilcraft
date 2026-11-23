/* SPDX-License-Identifier: Apache-2.0 */
/**
 * column.js — distillation columns (0.8 Track CH, CH.3; DOM-free, deterministic).
 *   shortcut()  Fenske minimum stages (Fenske 1932), Underwood minimum reflux (Underwood 1948), Gilliland by Eduljee (1959) or Molokanov
 *               et al. (1972), Kirkbride feed stage (Kirkbride 1944); duties from the property package. Two adjacent keys.
 *   mesh()      rigorous equilibrium-stage column: the Wang–Henke bubble-point method (Wang & Henke 1966; Seader, Henley & Roper ch. 10),
 *               total condenser, partial reboiler, any number of feeds, stage pressures, energy balance on every stage.
 *               The inside-out acceleration and absorbers/strippers with heat effects are not built; kremser() covers absorbers by shortcut.
 *   kremser()   fraction absorbed/stripped by Kremser's equation (1930).
 */
import { fromFlash, emptyStream, isZero } from './stream.js';

const sum = (a) => a.reduce((s, v) => s + v, 0);
const normed = (a) => { const s = sum(a); return a.map((v) => v / s); };

export function fenske(alpha, dLK, dHK, bLK, bHK) { return Math.log((dLK / dHK) * (bHK / bLK)) / Math.log(alpha); }
export function eduljee(X) { return 0.75 * (1 - Math.pow(X, 0.5668)); }
export function molokanov(X) { return X <= 0 ? 1 : X >= 1 ? 0 : 1 - Math.exp((1 + 54.4 * X) / (11 + 117.2 * X) * (X - 1) / Math.sqrt(X)); }
/** Stages N from Nmin, R, Rmin by the chosen correlation. */
export function gilliland(Nmin, R, Rmin, kind = 'eduljee') {
  const X = (R - Rmin) / (R + 1), Y = kind === 'molokanov' ? molokanov(X) : eduljee(X); return (Nmin + Y) / (1 - Y);
}
/** Underwood: alphas (relative to the heavy key = 1), feed mole fractions zF, thermal condition q, distillate fractions xD → { theta, Rmin }.
 * The root searched is the one between alpha_HK and alpha_LK (two adjacent keys; light components only in D, heavy only in B). */
export function underwood(alpha, zF, q, xD, iLK, iHK) {
  const f = (th) => { let s = 0; for (let i = 0; i < alpha.length; i++) s += alpha[i] * zF[i] / (alpha[i] - th); return s - (1 - q); };
  let lo = alpha[iHK] + 1e-9 * Math.abs(alpha[iHK] || 1), hi = alpha[iLK] - 1e-9 * Math.abs(alpha[iLK]);
  if (!(f(lo) * f(hi) < 0)) return null;
  for (let i = 0; i < 300; i++) { const m = 0.5 * (lo + hi); if (f(lo) * f(m) <= 0) hi = m; else lo = m; if (hi - lo < 1e-15) break; }
  const theta = 0.5 * (lo + hi); let s = 0; for (let i = 0; i < alpha.length; i++) s += alpha[i] * xD[i] / (alpha[i] - theta);
  return { theta, Rmin: s - 1 };
}
export function kremser(A, N, mode = 'absorb') {          // absorption factor A = L/(K V) (stripping factor S = K V/L)
  if (Math.abs(A - 1) < 1e-12) return N / (N + 1);
  return (Math.pow(A, N + 1) - A) / (Math.pow(A, N + 1) - 1);
}
/** Thermal condition of the feed q = (H_sat vapour - H_feed)/(H_sat vapour - H_sat liquid) at the feed pressure. */
export function feedQ(th, s) {
  const v = th.flashPVF(s.P, 1, s.z), l = th.flashPVF(s.P, 0, s.z); if (!v || !l) return 1;
  return (v.H - s.H) / (v.H - l.H);
}

/** Shortcut column on a feed stream. p: { lightKey, heavyKey, recLK (to D), recHK (to B), P, Rmult (default 1.2), gilliland } */
export function shortcut(th, [s], p) {
  const n = th.n, iLK = th.index(p.lightKey), iHK = th.index(p.heavyKey), P = p.P || s.P, f = s.z.map((z) => z * s.F);
  const q = feedQ(th, s);
  const Kat = (T, x, y) => th.lnK(T, P, x, y).lnK.map(Math.exp);
  // volatilities at the feed bubble point first, then at the geometric mean of the top and bottom temperatures
  let bub = th.bubbleT(s.z, P); if (!bub) throw new Error('shortcut: no bubble point for the feed');
  let Kf = Kat(bub.T, s.z, bub.y), alpha = Kf.map((k) => k / Kf[iHK]), Nmin = 0, d = null, b = null, und = null;
  for (let pass = 0; pass < 3; pass++) {
    Nmin = 0; const dHK = f[iHK] * (1 - p.recHK), bHK = f[iHK] * p.recHK, dLK = f[iLK] * p.recLK, bLK = f[iLK] * (1 - p.recLK);
    Nmin = fenske(alpha[iLK], dLK, dHK, bLK, bHK);
    d = new Array(n); b = new Array(n);
    for (let i = 0; i < n; i++) {
      if (i === iLK) { d[i] = dLK; b[i] = bLK; } else if (i === iHK) { d[i] = dHK; b[i] = bHK; }
      else { const r = (dHK / bHK) * Math.pow(alpha[i], Nmin); d[i] = f[i] * r / (1 + r); b[i] = f[i] - d[i]; }
    }
    const D = sum(d), B = sum(b), xD = d.map((v) => v / D), xB = b.map((v) => v / B);
    const dew = th.dewT(xD, P, bub.T), bot = th.bubbleT(xB, P, bub.T);
    if (dew && bot) {
      const Kt = Kat(dew.T, dew.x, xD), Kb = Kat(bot.T, xB, bot.y);
      alpha = Kt.map((k, i) => Math.sqrt((k / Kt[iHK]) * (Kb[i] / Kb[iHK])));
    }
  }
  const D = sum(d), B = sum(b), xD = d.map((v) => v / D), xB = b.map((v) => v / B), zF = s.z;
  und = underwood(alpha, zF, q, xD, iLK, iHK);
  const Rmin = und ? und.Rmin : null, Rm = p.Rmult || 1.2, R = p.R != null ? p.R : (Rmin != null ? Rm * Rmin : null);
  const N = R != null && Rmin != null ? gilliland(Nmin, R, Rmin, p.gilliland || 'eduljee') : null;
  const NR = (zF[iHK] / zF[iLK]) * (B / D) * Math.pow(xB[iLK] / xD[iHK], 2); const ratio = Math.pow(NR, 0.206);
  const Nfeed = N != null ? { rectifying: N * ratio / (1 + ratio), stripping: N / (1 + ratio) } : null;
  const dist = th.flashPVF(P, 0, xD), vapD = th.flashPVF(P, 1, xD), bot = th.flashPVF(P, 0, xB);
  const outD = fromFlash(D, dist), outB = fromFlash(B, bot);
  const Qc = R != null ? (R + 1) * D * (dist.H - vapD.H) : null, Qr = Qc != null ? D * dist.H + B * bot.H - s.F * s.H - Qc : null;
  return { outs: [outD, outB], Q: Qc != null ? Qc + Qr : 0, W: 0, notes: und ? [] : ['Underwood root not bracketed: the keys may not be adjacent or the feed may be at its bubble or dew point'],
    alpha, Nmin, Rmin, R, N, Nfeed, q, theta: und && und.theta, condenserDuty: Qc, reboilerDuty: Qr, D, B, distribution: { d, b } };
}

/** Rigorous column. feeds: [{ stage (1 = top), stream }]; p: { N, P (top, Pa), dP (per stage), R (reflux ratio), D (mol/s) | B (mol/s), maxIter, tol } */
export function mesh(th, feeds, p) {
  const n = th.n, N = p.N, dPst = p.dP || 0, Pj = Array.from({ length: N }, (_, j) => p.P + j * dPst), maxIter = p.maxIter || 300, tol = p.tol || 1e-8;
  const live = feeds.filter((f) => !isZero(f.stream)); if (!live.length) throw new Error('column has no feed');
  const f = Array.from({ length: N }, () => new Array(n).fill(0)), Fj = new Array(N).fill(0), HF = new Array(N).fill(0);
  for (const { stage, stream: s } of live) { const j = stage - 1; for (let i = 0; i < n; i++) f[j][i] += s.F * s.z[i]; Fj[j] += s.F; HF[j] += s.F * s.H; }
  const Ftot = sum(Fj), zF = normed(f.reduce((a, row) => a.map((v, i) => v + row[i]), new Array(n).fill(0)));
  const R = p.R, D = p.D != null ? p.D : Ftot - p.B;
  if (!(D > 0 && D < Ftot)) throw new Error('column: distillate rate must lie between 0 and the feed');
  const Pf = Pj[Math.max(0, Math.min(N - 1, live[0].stage - 1))];
  const bubF = th.bubbleT(zF, Pf), dewF = th.dewT(zF, Pf); if (!bubF || !dewF) throw new Error('column: feed bubble/dew point failed');
  const T = Array.from({ length: N }, (_, j) => th.bubbleT(zF, Pj[j])?.T + (dewF.T - bubF.T) * 0.4 * (0.5 - (j) / Math.max(1, N - 1)));
  const V = new Array(N).fill((R + 1) * D), L = new Array(N);
  { let acc = R * D; for (let j = 0; j < N; j++) { acc += Fj[j]; L[j] = j < N - 1 ? acc - (j + 1 < N ? 0 : 0) : Ftot - D; } for (let j = 0; j < N - 1; j++) L[j] = R * D + sum(Fj.slice(0, j + 1)); }
  let x = Array.from({ length: N }, () => zF.slice()), y = x.map((r) => r.slice()), hL = new Array(N), HV = new Array(N), h0 = 0, iter = 0, dT = Infinity, dV = Infinity, lij = null, Tc = null;
  for (iter = 1; iter <= maxIter; iter++) {
    // K-values from the current x, y, T
    const K = x.map((xj, j) => th.lnK(T[j], Pj[j], xj, y[j]).lnK.map(Math.exp));
    lij = Array.from({ length: n }, () => new Array(N).fill(0));
    for (let i = 0; i < n; i++) {                                    // tridiagonal for component i (Thomas)
      const a = new Array(N).fill(0), b = new Array(N), c = new Array(N).fill(0), r = new Array(N);
      for (let j = 0; j < N; j++) {
        const S = K[j][i] * V[j] / (j === N - 1 ? Math.max(Ftot - D, 1e-30) : L[j]);
        b[j] = j === 0 ? -(1 + S / (R + 1)) : -(1 + S); r[j] = -f[j][i];
        if (j > 0) a[j] = 1;
        if (j < N - 1) c[j] = K[j + 1][i] * V[j + 1] / (j + 1 === N - 1 ? Math.max(Ftot - D, 1e-30) : L[j + 1]);
      }
      for (let j = 1; j < N; j++) { const m = a[j] / b[j - 1]; b[j] -= m * c[j - 1]; r[j] -= m * r[j - 1]; }
      const sol = new Array(N); sol[N - 1] = r[N - 1] / b[N - 1]; for (let j = N - 2; j >= 0; j--) sol[j] = (r[j] - c[j] * sol[j + 1]) / b[j];
      for (let j = 0; j < N; j++) lij[i][j] = Math.max(sol[j], 0);
    }
    const Tn = new Array(N), xn = [], yn = [];
    for (let j = 0; j < N; j++) {
      const lj = lij.map((row) => row[j]), xj = normed(lj.map((v) => v + 1e-300)); xn.push(xj);
      const sat = th.bubbleT(xj, Pj[j], T[j]); if (!sat) throw new Error('column: bubble point failed on stage ' + (j + 1));
      Tn[j] = sat.T; yn.push(sat.y);
    }
    dT = 0; for (let j = 0; j < N; j++) dT = Math.max(dT, Math.abs(Tn[j] - T[j]));
    for (let j = 0; j < N; j++) { T[j] = Tn[j]; x[j] = xn[j]; y[j] = yn[j]; }
    // enthalpies, then V and L from the energy and material balances
    for (let j = 0; j < N; j++) { hL[j] = th.phase(T[j], Pj[j], x[j], 'L').H; HV[j] = th.phase(T[j], Pj[j], y[j], 'V').H; }
    const cond = th.bubbleT(y[0], Pj[0]); Tc = cond.T; h0 = th.phase(Tc, Pj[0], y[0], 'L').H;
    const Vn = new Array(N), Ln = new Array(N); Vn[0] = (R + 1) * D; let Lprev = R * D, hprev = h0;
    for (let j = 0; j < N - 1; j++) {
      const rhs = Vn[j] * (HV[j] - hL[j]) - Lprev * (hprev - hL[j]) - (HF[j] - Fj[j] * hL[j]);
      let vnext = rhs / (HV[j + 1] - hL[j]); if (!(vnext > 1e-12)) vnext = 1e-12 * Ftot; Vn[j + 1] = vnext;
      Ln[j] = Lprev + vnext - Vn[j] + Fj[j]; if (!(Ln[j] > 1e-12)) Ln[j] = 1e-12 * Ftot; Lprev = Ln[j]; hprev = hL[j];
    }
    Ln[N - 1] = Ftot - D;
    dV = 0; for (let j = 0; j < N; j++) dV = Math.max(dV, Math.abs(Vn[j] - V[j]) / (Math.abs(V[j]) + 1e-12)); for (let j = 0; j < N; j++) { V[j] = Vn[j]; L[j] = Ln[j]; }
    if (dT < tol && dV < 1e-9 && iter > 1) break;
  }
  const converged = dT < tol * 10 && dV < 1e-7;
  const QcDuty = V[0] * (HV[0] - h0);                                // heat removed (W, positive)
  const Hbot = hL[N - 1], Qr = (Ftot - D) * Hbot + V[N - 1] * HV[N - 1] - (N > 1 ? L[N - 2] * hL[N - 2] : 0) - HF[N - 1];   // heat added to the reboiler stage
  const dist = fromFlash(D, th.flashPT(Tc, Pj[0], y[0])), bot = fromFlash(Ftot - D, th.flashPT(T[N - 1], Pj[N - 1], x[N - 1]));
  const dFlow = lij ? y[0].map((v) => v * D) : null, bFlow = x[N - 1].map((v) => v * (Ftot - D));
  let comp = 0; for (let i = 0; i < n; i++) comp = Math.max(comp, Math.abs(f.reduce((s, r) => s + r[i], 0) - dFlow[i] - bFlow[i]) / Ftot);
  // energy closure: feeds + Qr = D h0 + B hB + Qc (condenser removes QcDuty from the vapour V1 to saturated liquid)
  const eIn = sum(HF) + Qr, eOut = D * h0 + (Ftot - D) * Hbot + QcDuty - (R + 1) * D * 0 ;
  return { outs: [dist, bot], Q: Qr - QcDuty, W: 0, notes: converged ? [] : ['column did not converge in ' + iter + ' iterations'], converged, iterations: iter,
    condenserDuty: -QcDuty, reboilerDuty: Qr, T, V, L, x, y, stagePressure: Pj, refluxTemperature: Tc, componentClosure: comp, energyClosure: Math.abs(eIn - eOut) / (Math.abs(eIn) + 1) };
}

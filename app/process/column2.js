/* SPDX-License-Identifier: Apache-2.0 */
/**
 * column2.js — inside-out distillation and rigorous absorbers/strippers (0.8 Track CH, CH.3; DOM-free, deterministic).
 *
 *   insideOut(th, feeds, p)   the same column as column.js mesh() (total condenser, partial reboiler, R and D|B), solved with the inside-out
 *                             structure of Boston and Britt (1978): an OUTER loop evaluates the rigorous K-values and enthalpies and fits the simple
 *                             models   ln Kb_j = A_j + B_j/T_j,   alpha_ij = K_ij/Kb_j,   h_j, H_j linear in T   (slopes by two-point difference);
 *                             an INNER loop (no property calls) solves the tridiagonal component balances, the bubble-point sum on Kb, the energy
 *                             balances for V and the stage temperatures with those models. The rigorous property calls are counted so the gain
 *                             over mesh() is a number, not a claim. The inner loop here is successive substitution (Boston's own inner loop is a
 *                             Newton on the specifications); it reaches the same fixed point as mesh().
 *   absorber(th, feeds, p)    rigorous equilibrium-stage absorber or stripper without condenser and reboiler: sum-rates method (Burningham and Otto
 *                             1967; Seader, Henley and Roper ch. 10): component balances (tridiagonal in l_ij), V_j from the sum of the vapour
 *                             component flows, L_j from the total balance, T_j from the stage energy balances by Newton on the tridiagonal system,
 *                             with heat effects. Optional stage duties p.Q[j] (W, + added to the fluid).
 * feeds: [{ stage (1 = top), stream }]. Streams are the plain data of stream.js. Results carry `problems` in the shared shape (rule 29).
 */
import { fromFlash, isZero } from './stream.js';
import { problem } from './report.js';
import { solveLinear } from './numeric.js';

const sum = (a) => a.reduce((s, v) => s + v, 0);
const normed = (a) => { const s = sum(a); return s > 0 ? a.map((v) => v / s) : a.slice(); };

function thomas(a, b, c, r) {
  const N = b.length, bb = b.slice(), rr = r.slice();
  for (let j = 1; j < N; j++) { const m = a[j] / bb[j - 1]; bb[j] -= m * c[j - 1]; rr[j] -= m * rr[j - 1]; }
  const x = new Array(N); x[N - 1] = rr[N - 1] / bb[N - 1]; for (let j = N - 2; j >= 0; j--) x[j] = (rr[j] - c[j] * x[j + 1]) / bb[j];
  return x;
}
function counted(th) {                                   // wrap the three rigorous property calls to count them
  const calls = { lnK: 0, phase: 0, saturation: 0 };
  return { calls, lnK: (...a) => { calls.lnK++; return th.lnK(...a); }, phase: (...a) => { calls.phase++; return th.phase(...a); },
    bubbleT: (...a) => { calls.saturation++; return th.bubbleT(...a); } };
}

export function insideOut(th, feeds, p) {
  const cth = counted(th), n = th.n, N = p.N, dPst = p.dP || 0, Pj = Array.from({ length: N }, (_, j) => p.P + j * dPst);
  const maxOuter = p.maxIter || 60, tol = p.tol || 1e-8, dTfd = 0.5;
  const live = feeds.filter((f) => !isZero(f.stream)); if (!live.length) throw new Error('column has no feed');
  const f = Array.from({ length: N }, () => new Array(n).fill(0)), Fj = new Array(N).fill(0), HF = new Array(N).fill(0);
  for (const { stage, stream: s } of live) { const j = stage - 1; for (let i = 0; i < n; i++) f[j][i] += s.F * s.z[i]; Fj[j] += s.F; HF[j] += s.F * s.H; }
  const Ftot = sum(Fj), zF = normed(f.reduce((a, row) => a.map((v, i) => v + row[i]), new Array(n).fill(0)));
  const R = p.R, D = p.D != null ? p.D : Ftot - p.B;
  if (!(D > 0 && D < Ftot)) throw new Error('column: distillate rate must lie between 0 and the feed');
  const bubF = cth.bubbleT(zF, Pj[Math.max(0, Math.min(N - 1, live[0].stage - 1))]), dewF = th.dewT(zF, Pj[Math.max(0, Math.min(N - 1, live[0].stage - 1))]);
  if (!bubF || !dewF) throw new Error('column: feed bubble/dew point failed');
  const T = Array.from({ length: N }, (_, j) => bubF.T + (dewF.T - bubF.T) * 0.4 * (0.5 - j / Math.max(1, N - 1)));
  const V = new Array(N).fill((R + 1) * D), L = new Array(N);
  for (let j = 0; j < N - 1; j++) L[j] = R * D + sum(Fj.slice(0, j + 1)); L[N - 1] = Ftot - D;
  const x = Array.from({ length: N }, () => zF.slice()), y = x.map((r) => r.slice());
  let outer = 0, innerTotal = 0, dTouter = Infinity, dVouter = Infinity, hL = new Array(N), HV = new Array(N), h0 = 0, Tc = 0;
  for (outer = 1; outer <= maxOuter; outer++) {
    // ---- OUTER: rigorous properties at the current state, then the simple models ---------------------------------------------------------
    const lnK0 = [], alpha = [], A = new Array(N), B = new Array(N), ha = new Array(N), hb = new Array(N), Ha = new Array(N), Hb = new Array(N);
    for (let j = 0; j < N; j++) {
      const k0 = cth.lnK(T[j], Pj[j], x[j], y[j]).lnK, k1 = cth.lnK(T[j] + dTfd, Pj[j], x[j], y[j]).lnK;
      const w = normed(y[j].map((v) => v + 1e-300));
      let lkb = 0, lkb1 = 0; for (let i = 0; i < n; i++) { lkb += w[i] * k0[i]; lkb1 += w[i] * k1[i]; }
      B[j] = (lkb1 - lkb) / (1 / (T[j] + dTfd) - 1 / T[j]); A[j] = lkb - B[j] / T[j];
      lnK0.push(k0); alpha.push(k0.map((v) => Math.exp(v - lkb)));
      const l0 = cth.phase(T[j], Pj[j], x[j], 'L').H, l1 = cth.phase(T[j] + dTfd, Pj[j], x[j], 'L').H, v0 = cth.phase(T[j], Pj[j], y[j], 'V').H, v1 = cth.phase(T[j] + dTfd, Pj[j], y[j], 'V').H;
      hb[j] = (l1 - l0) / dTfd; ha[j] = l0 - hb[j] * T[j]; Hb[j] = (v1 - v0) / dTfd; Ha[j] = v0 - Hb[j] * T[j]; hL[j] = l0; HV[j] = v0;
    }
    const Tcond = cth.bubbleT(y[0], Pj[0]); Tc = Tcond.T; h0 = cth.phase(Tc, Pj[0], y[0], 'L').H;
    const hcB = (th.phase(Tc + dTfd, Pj[0], y[0], 'L').H - h0) / dTfd;                // condenser liquid enthalpy slope (the reflux is at Tc)
    const Told = T.slice(), Vold = V.slice();
    // ---- INNER: no property calls ---------------------------------------------------------------------------------------------------------
    for (let it = 0; it < 200; it++) {
      innerTotal++;
      const Kb = T.map((t, j) => Math.exp(A[j] + B[j] / t)), lij = Array.from({ length: n }, () => new Array(N).fill(0));
      for (let i = 0; i < n; i++) {
        const a = new Array(N).fill(0), b = new Array(N), c = new Array(N).fill(0), r = new Array(N);
        for (let j = 0; j < N; j++) {
          const Sj = alpha[j][i] * Kb[j] * V[j] / (j === N - 1 ? Math.max(Ftot - D, 1e-30) : L[j]);
          b[j] = j === 0 ? -(1 + Sj / (R + 1)) : -(1 + Sj); r[j] = -f[j][i];
          if (j > 0) a[j] = 1;
          if (j < N - 1) c[j] = alpha[j + 1][i] * Kb[j + 1] * V[j + 1] / (j + 1 === N - 1 ? Math.max(Ftot - D, 1e-30) : L[j + 1]);
        }
        const sol = thomas(a, b, c, r); for (let j = 0; j < N; j++) lij[i][j] = Math.max(sol[j], 0);
      }
      let dT = 0;
      for (let j = 0; j < N; j++) {
        const xj = normed(lij.map((row) => row[j] + 1e-300)); x[j] = xj;
        let s = 0; for (let i = 0; i < n; i++) s += alpha[j][i] * xj[i];              // bubble point on the simple model: Kb = 1 / sum(alpha x)
        const lkb = -Math.log(s), tn = B[j] / (lkb - A[j]); dT = Math.max(dT, Math.abs(tn - T[j])); T[j] = tn;
        y[j] = normed(alpha[j].map((al, i) => al * xj[i]));
      }
      // energy balance with the linear enthalpy models
      const hh = T.map((t, j) => ha[j] + hb[j] * t), HH = T.map((t, j) => Ha[j] + Hb[j] * t);
      const Tcl = (() => { let s = 0; for (let i = 0; i < n; i++) s += alpha[0][i] * x[0][i]; return s; })(); void Tcl;
      const hRef = h0 + hcB * 0;                                                           // reflux enthalpy stays at the rigorous value of the outer step
      const Vn = new Array(N), Ln = new Array(N); Vn[0] = (R + 1) * D; let Lprev = R * D, hprev = hRef;
      for (let j = 0; j < N - 1; j++) {
        const rhs = Vn[j] * (HH[j] - hh[j]) - Lprev * (hprev - hh[j]) - (HF[j] - Fj[j] * hh[j]);
        let vn = rhs / (HH[j + 1] - hh[j]); if (!(vn > 1e-12)) vn = 1e-12 * Ftot; Vn[j + 1] = vn;
        Ln[j] = Lprev + vn - Vn[j] + Fj[j]; if (!(Ln[j] > 1e-12)) Ln[j] = 1e-12 * Ftot; Lprev = Ln[j]; hprev = hh[j];
      }
      Ln[N - 1] = Ftot - D;
      let dV = 0; for (let j = 0; j < N; j++) { dV = Math.max(dV, Math.abs(Vn[j] - V[j]) / (Math.abs(V[j]) + 1e-12)); V[j] = Vn[j]; L[j] = Ln[j]; }
      if (dT < 1e-10 && dV < 1e-11) break;
    }
    dTouter = 0; dVouter = 0;
    for (let j = 0; j < N; j++) { dTouter = Math.max(dTouter, Math.abs(T[j] - Told[j])); dVouter = Math.max(dVouter, Math.abs(V[j] - Vold[j]) / (Math.abs(Vold[j]) + 1e-12)); }
    if (dTouter < tol && dVouter < 1e-8 && outer > 1) break;
  }
  // final rigorous evaluation of the converged state (enthalpies for the duties and the closure)
  for (let j = 0; j < N; j++) { hL[j] = cth.phase(T[j], Pj[j], x[j], 'L').H; HV[j] = cth.phase(T[j], Pj[j], y[j], 'V').H; }
  const cond = cth.bubbleT(y[0], Pj[0]); Tc = cond.T; h0 = cth.phase(Tc, Pj[0], y[0], 'L').H;
  const converged = dTouter < tol * 10 && dVouter < 1e-6;
  const QcDuty = V[0] * (HV[0] - h0), Hbot = hL[N - 1];
  const Qr = (Ftot - D) * Hbot + V[N - 1] * HV[N - 1] - (N > 1 ? L[N - 2] * hL[N - 2] : 0) - HF[N - 1];
  const dist = fromFlash(D, th.flashPT(Tc, Pj[0], y[0])), bot = fromFlash(Ftot - D, th.flashPT(T[N - 1], Pj[N - 1], x[N - 1]));
  const dFlow = y[0].map((v) => v * D), bFlow = x[N - 1].map((v) => v * (Ftot - D));
  let comp = 0; for (let i = 0; i < n; i++) comp = Math.max(comp, Math.abs(f.reduce((s, r) => s + r[i], 0) - dFlow[i] - bFlow[i]) / Ftot);
  const eIn = sum(HF) + Qr, eOut = D * h0 + (Ftot - D) * Hbot + QcDuty;
  const problems = converged ? [] : [problem('column.noconverge', 'error', `The inside-out column did not converge in ${outer} outer iterations.`, [{ id: 'column' }])];
  return { outs: [dist, bot], Q: Qr - QcDuty, W: 0, notes: converged ? [] : ['column did not converge in ' + outer + ' outer iterations'], problems, converged,
    iterations: outer, innerIterations: innerTotal, rigorousCalls: { ...cth.calls }, T, V, L, x, y, stagePressure: Pj, refluxTemperature: Tc,
    condenserDuty: -QcDuty, reboilerDuty: Qr, componentClosure: comp, energyClosure: Math.abs(eIn - eOut) / (Math.abs(eIn) + 1), method: 'inside-out' };
}

/** Rigorous absorber or stripper. p: { N, P (top, Pa), dP, Q? [W per stage], maxIter, tol }. Liquid fed at the top gets to stage 1; vapour fed at the bottom to stage N (feeds say where). */
export function absorber(th, feeds, p) {
  const n = th.n, N = p.N, dPst = p.dP || 0, Pj = Array.from({ length: N }, (_, j) => p.P + j * dPst), maxIter = p.maxIter || 200, tol = p.tol || 1e-8;
  const Qs = p.Q || new Array(N).fill(0);
  const live = feeds.filter((q) => !isZero(q.stream)); if (!live.length) throw new Error('absorber has no feed');
  const f = Array.from({ length: N }, () => new Array(n).fill(0)), Fj = new Array(N).fill(0), HF = new Array(N).fill(0);
  let Fliq = 0, Fvap = 0, Tl = 0, Tv = 0;
  for (const { stage, stream: s } of live) {
    const j = stage - 1; for (let i = 0; i < n; i++) f[j][i] += s.F * s.z[i]; Fj[j] += s.F; HF[j] += s.F * s.H;
    if (stage === 1) { Fliq += s.F; Tl = s.T; } if (stage === N) { Fvap += s.F; Tv = s.T; }
  }
  const Ftot = sum(Fj);
  if (!(Fliq > 0 && Fvap > 0)) throw new Error('an absorber needs a feed at the top stage and a feed at the bottom stage');
  const T = Array.from({ length: N }, (_, j) => Tl + (Tv - Tl) * (N > 1 ? j / (N - 1) : 0));
  const V = new Array(N).fill(Fvap), L = new Array(N).fill(Fliq); L[N - 1] = Ftot - Fvap;
  const zAll = normed(f.reduce((a, row) => a.map((v, i) => v + row[i]), new Array(n).fill(0)));
  let x = Array.from({ length: N }, () => zAll.slice()), y = x.map((r) => r.slice()), iter = 0, dT = Infinity, dV = Infinity, hL = new Array(N), HV = new Array(N);
  for (iter = 1; iter <= maxIter; iter++) {
    const K = x.map((xj, j) => th.lnK(T[j], Pj[j], xj, y[j]).lnK.map(Math.exp)), lij = Array.from({ length: n }, () => new Array(N).fill(0));
    for (let i = 0; i < n; i++) {
      const a = new Array(N).fill(0), b = new Array(N), c = new Array(N).fill(0), r = new Array(N);
      for (let j = 0; j < N; j++) {
        b[j] = -(1 + K[j][i] * V[j] / L[j]); r[j] = -f[j][i]; if (j > 0) a[j] = 1; if (j < N - 1) c[j] = K[j + 1][i] * V[j + 1] / L[j + 1];
      }
      const sol = thomas(a, b, c, r); for (let j = 0; j < N; j++) lij[i][j] = Math.max(sol[j], 0);
    }
    const Vn = new Array(N), xn = [], yn = [];
    for (let j = 0; j < N; j++) {
      const lj = lij.map((row) => row[j]); xn.push(normed(lj.map((v) => v + 1e-300)));
      const vj = lj.map((l, i) => l * K[j][i] * V[j] / L[j]); Vn[j] = Math.max(sum(vj), 1e-12 * Ftot); yn.push(normed(vj.map((v) => v + 1e-300)));
    }
    // total balance gives L; V is the sum of the vapour component flows (sum-rates)
    const Ln = new Array(N); let acc = 0; for (let j = 0; j < N; j++) { acc += Fj[j]; Ln[j] = Math.max(acc - Vn[0] - (j > 0 ? 0 : 0) + (j > 0 ? 0 : 0), 1e-12 * Ftot); }
    for (let j = 0; j < N - 1; j++) Ln[j] = Math.max(sum(Fj.slice(0, j + 1)) - Vn[0] + Vn[j + 1] + 0, 1e-12 * Ftot);   // L_j = F(1..j) - V_1 + V_{j+1}
    Ln[N - 1] = Math.max(Ftot - Vn[0], 1e-12 * Ftot);
    const dampV = iter < 4 ? 1 : 0.7; dV = 0;
    for (let j = 0; j < N; j++) { const v = V[j] + dampV * (Vn[j] - V[j]); dV = Math.max(dV, Math.abs(v - V[j]) / (Math.abs(V[j]) + 1e-12)); V[j] = v; L[j] = L[j] + dampV * (Ln[j] - L[j]); }
    x = xn; y = yn;
    // stage temperatures from the energy balances: Newton on the tridiagonal system, enthalpies from the property package
    const hh = (j, t) => th.phase(t, Pj[j], x[j], 'L').H, HH = (j, t) => th.phase(t, Pj[j], y[j], 'V').H;
    const E = new Array(N), Jm = Array.from({ length: N }, () => new Array(N).fill(0)), dd = 0.5;
    for (let j = 0; j < N; j++) {
      hL[j] = hh(j, T[j]); HV[j] = HH(j, T[j]);
      const cpl = (hh(j, T[j] + dd) - hL[j]) / dd, cpv = (HH(j, T[j] + dd) - HV[j]) / dd;
      const inL = j > 0 ? L[j - 1] * (hh(j - 1, T[j - 1])) : 0, inV = j < N - 1 ? V[j + 1] * HH(j + 1, T[j + 1]) : 0;
      E[j] = inL + inV + HF[j] + Qs[j] - L[j] * hL[j] - V[j] * HV[j];
      Jm[j][j] = -(L[j] * cpl + V[j] * cpv);
      if (j > 0) Jm[j][j - 1] = L[j - 1] * ((hh(j - 1, T[j - 1] + dd) - hh(j - 1, T[j - 1])) / dd);
      if (j < N - 1) Jm[j][j + 1] = V[j + 1] * ((HH(j + 1, T[j + 1] + dd) - HH(j + 1, T[j + 1])) / dd);
    }
    const dTv = solveLinear(Jm, E.map((v) => -v)); dT = 0;
    if (dTv) for (let j = 0; j < N; j++) { const s = Math.max(-30, Math.min(30, dTv[j])) * (iter < 6 ? 0.5 : 1); T[j] += s; dT = Math.max(dT, Math.abs(s)); }
    else dT = Infinity;
    if (dT < tol * 100 && dV < 1e-8 && iter > 2) break;
  }
  const converged = dT < tol * 1000 && dV < 1e-6;
  for (let j = 0; j < N; j++) { hL[j] = th.phase(T[j], Pj[j], x[j], 'L').H; HV[j] = th.phase(T[j], Pj[j], y[j], 'V').H; }
  const vap = V[0], liq = L[N - 1];
  const outV = fromFlash(vap, th.flashPT(T[0], Pj[0], y[0])), outL = fromFlash(liq, th.flashPT(T[N - 1], Pj[N - 1], x[N - 1]));
  const vFlow = y[0].map((v) => v * vap), lFlow = x[N - 1].map((v) => v * liq);
  let comp = 0; for (let i = 0; i < n; i++) comp = Math.max(comp, Math.abs(f.reduce((s, r) => s + r[i], 0) - vFlow[i] - lFlow[i]) / Ftot);
  const eIn = sum(HF) + sum(Qs), eOut = vap * HV[0] + liq * hL[N - 1];
  const problems = converged ? [] : [problem('column.noconverge', 'error', `The absorber did not converge in ${iter} iterations.`, [{ id: 'absorber' }])];
  return { outs: [outV, outL], Q: sum(Qs), W: 0, notes: converged ? [] : ['absorber did not converge in ' + iter + ' iterations'], problems, converged, iterations: iter,
    T, V, L, x, y, stagePressure: Pj, componentClosure: comp, energyClosure: Math.abs(eIn - eOut) / (Math.abs(eIn) + 1), method: 'sum-rates' };
}

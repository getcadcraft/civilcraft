/* SPDX-License-Identifier: Apache-2.0 */
/**
 * power.js — AC load flow by Newton–Raphson in polar form (0.8 XE.2; DOM-free; per unit on a system base).
 * Method: the textbook formulation (Tinney & Hart 1967; any power-systems text, e.g. Grainger & Stevenson ch. 9, Saadat ch. 6). The branch
 * model is the usual π with an off-nominal tap and phase shifter on the "from" side:
 *     Yff = (y + j b/2) / |a|²   Yft = −y / conj(a)   Ytf = −y / a   Ytt = y + j b/2        y = 1/(r + j x),  a = tap ∠ shift
 * Q limits of PV buses are enforced by switching the bus to PQ at the violated limit and solving again.
 *
 *   buses:    [{ id, type: 'slack'|'pv'|'pq', V?, theta? (deg), Pg?, Qg?, Pd?, Qd?, Qmin?, Qmax?, Gs?, Bs? }]     (pu on baseMVA; Gs/Bs: shunt pu)
 *   branches: [{ id, from, to, r, x, b?, tap?, shift? (deg), rating? (MVA) }]
 *   loadFlow(sys, opts) → { ok, iterations, buses: { id: { V, theta (deg), Vc, P, Q } }, branches: { id: { Pf, Qf, Pt, Qt, Sf, loss } },
 *                           slack: { P, Q }, loss: { P, Q }, mismatch, problems, switched[] }
 */
import { solveLinear, problem, cabs } from './numeric.js';

const DEG = Math.PI / 180;

/** Bus admittance matrix as real parts G, B (n×n) for the given system; also the per-branch four-element admittances. */
export function buildYbus(sys) {
  const n = sys.buses.length, idx = new Map(sys.buses.map((b, i) => [b.id, i]));
  const G = Array.from({ length: n }, () => new Array(n).fill(0)), B = Array.from({ length: n }, () => new Array(n).fill(0));
  const br = [];
  sys.buses.forEach((b, i) => { G[i][i] += b.Gs || 0; B[i][i] += b.Bs || 0; });
  for (const l of sys.branches) {
    const f = idx.get(l.from), t = idx.get(l.to);
    if (f == null || t == null) throw new Error(`branch ${l.id}: unknown bus`);
    const den = l.r * l.r + l.x * l.x; if (!(den > 0)) throw new Error(`branch ${l.id}: zero impedance`);
    const y = [l.r / den, -l.x / den], bc = (l.b || 0) / 2, tap = l.tap || 1, ph = (l.shift || 0) * DEG;
    const a = [tap * Math.cos(ph), tap * Math.sin(ph)], a2 = tap * tap;
    const yff = [y[0] / a2, (y[1] + bc) / a2], ytt = [y[0], y[1] + bc];
    const yA = [(y[0] * a[0] - y[1] * a[1]) / a2, (y[0] * a[1] + y[1] * a[0]) / a2];   // y·a/|a|² = y / conj(a)
    const yB = [(y[0] * a[0] + y[1] * a[1]) / a2, (y[1] * a[0] - y[0] * a[1]) / a2];   // y·conj(a)/|a|² = y / a
    const Yft = [-yA[0], -yA[1]], Ytf = [-yB[0], -yB[1]];
    G[f][f] += yff[0]; B[f][f] += yff[1]; G[t][t] += ytt[0]; B[t][t] += ytt[1];
    G[f][t] += Yft[0]; B[f][t] += Yft[1]; G[t][f] += Ytf[0]; B[t][f] += Ytf[1];
    br.push({ id: l.id, f, t, Yff: yff, Yft, Ytf, Ytt: ytt, rating: l.rating });
  }
  return { G, B, branches: br, idx };
}

function inject(G, B, V, th) {
  const n = V.length, P = new Array(n).fill(0), Q = new Array(n).fill(0);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (!G[i][j] && !B[i][j]) continue;
    const d = th[i] - th[j], c = Math.cos(d), s = Math.sin(d);
    P[i] += V[i] * V[j] * (G[i][j] * c + B[i][j] * s); Q[i] += V[i] * V[j] * (G[i][j] * s - B[i][j] * c);
  }
  return { P, Q };
}

export function loadFlow(sys, opts = {}) {
  const tol = opts.tol || 1e-9, maxIter = opts.maxIter || 30, problems = [], switched = [];
  const { G, B, branches, idx } = buildYbus(sys);
  const n = sys.buses.length, base = sys.baseMVA || 100;
  const type = sys.buses.map((b) => b.type || 'pq');
  if (!type.includes('slack')) { problems.push(problem('slack.none', 'error', 'The system has no slack bus.', [{ kind: 'system', id: 'all' }])); return { ok: false, problems, buses: {}, branches: {}, iterations: 0 }; }
  const V = sys.buses.map((b) => (b.type === 'pq' || !b.type ? (b.V0 || 1) : (b.V || 1))), th = sys.buses.map((b) => (b.theta || 0) * DEG);
  const Psp = sys.buses.map((b) => (b.Pg || 0) - (b.Pd || 0)), Qsp = sys.buses.map((b) => (b.Qg || 0) - (b.Qd || 0));
  let iterations = 0, ok = false, mismatch = Infinity;
  for (let outer = 0; outer < 12; outer++) {
    const ang = [], mag = [];
    type.forEach((t, i) => { if (t !== 'slack') ang.push(i); if (t === 'pq') mag.push(i); });
    ok = false;
    for (let it = 0; it <= maxIter; it++) {
      const { P, Q } = inject(G, B, V, th);
      const f = [...ang.map((i) => Psp[i] - P[i]), ...mag.map((i) => Qsp[i] - Q[i])];
      mismatch = f.length ? Math.max(...f.map(Math.abs)) : 0;
      if (mismatch < tol) { ok = true; iterations += it; break; }
      if (it === maxIter) { iterations += it; break; }
      const m = f.length, J = Array.from({ length: m }, () => new Array(m).fill(0));
      const row = (i, isQ) => (isQ ? ang.length + mag.indexOf(i) : ang.indexOf(i));
      for (const i of ang) for (const j of ang) {
        const d = th[i] - th[j], c = Math.cos(d), s = Math.sin(d);
        J[row(i, false)][ang.indexOf(j)] = i === j ? -Q[i] - B[i][i] * V[i] * V[i] : V[i] * V[j] * (G[i][j] * s - B[i][j] * c);
      }
      for (const i of ang) for (const j of mag) {
        const d = th[i] - th[j], c = Math.cos(d), s = Math.sin(d);
        J[row(i, false)][ang.length + mag.indexOf(j)] = i === j ? P[i] / V[i] + G[i][i] * V[i] : V[i] * (G[i][j] * c + B[i][j] * s);
      }
      for (const i of mag) for (const j of ang) {
        const d = th[i] - th[j], c = Math.cos(d), s = Math.sin(d);
        J[row(i, true)][ang.indexOf(j)] = i === j ? P[i] - G[i][i] * V[i] * V[i] : -V[i] * V[j] * (G[i][j] * c + B[i][j] * s);
      }
      for (const i of mag) for (const j of mag) {
        const d = th[i] - th[j], c = Math.cos(d), s = Math.sin(d);
        J[row(i, true)][ang.length + mag.indexOf(j)] = i === j ? Q[i] / V[i] - B[i][i] * V[i] : V[i] * (G[i][j] * s - B[i][j] * c);
      }
      const dx = solveLinear(J, f);
      if (!dx) { problems.push(problem('loadflow.singular', 'error', 'The load-flow Jacobian is singular: the network is islanded or has a zero-impedance loop.', [{ kind: 'system', id: 'all' }])); return { ok: false, problems, buses: {}, branches: {}, iterations, mismatch }; }
      ang.forEach((i, k) => { th[i] += dx[k]; }); mag.forEach((i, k) => { V[i] += dx[ang.length + k]; });
      if (V.some((v) => !(v > 0.05 && v < 5))) { problems.push(problem('loadflow.collapse', 'error', 'Voltage collapse: the load is beyond what the network can deliver (no real solution).', [{ kind: 'system', id: 'all' }])); return { ok: false, problems, buses: {}, branches: {}, iterations: iterations + it, mismatch }; }
    }
    if (!ok) break;
    // Q limits on PV buses
    const { Q } = inject(G, B, V, th); let changed = false;
    sys.buses.forEach((b, i) => {
      if (type[i] !== 'pv' || opts.noQLimits) return;
      const Qg = Q[i] + (b.Qd || 0);
      if (b.Qmax != null && Qg > b.Qmax + 1e-9) { type[i] = 'pq'; Qsp[i] = b.Qmax - (b.Qd || 0); changed = true; switched.push({ bus: b.id, limit: 'Qmax' }); }
      else if (b.Qmin != null && Qg < b.Qmin - 1e-9) { type[i] = 'pq'; Qsp[i] = b.Qmin - (b.Qd || 0); changed = true; switched.push({ bus: b.id, limit: 'Qmin' }); }
    });
    if (!changed) break;
  }
  if (!ok) problems.push(problem('loadflow.noconverge', 'error', `The load flow did not converge (mismatch ${mismatch.toExponential(2)} pu after ${iterations} iterations).`, [{ kind: 'system', id: 'all' }]));
  const { P, Q } = inject(G, B, V, th);
  const outB = {}, outL = {}; let lossP = 0, lossQ = 0;
  sys.buses.forEach((b, i) => { outB[b.id] = { V: V[i], theta: th[i] / DEG, Vc: [V[i] * Math.cos(th[i]), V[i] * Math.sin(th[i])], P: P[i], Q: Q[i], type: type[i] }; });
  const Vc = V.map((v, i) => [v * Math.cos(th[i]), v * Math.sin(th[i])]);
  for (const k of branches) {
    const cm = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
    const If = [cm(k.Yff, Vc[k.f])[0] + cm(k.Yft, Vc[k.t])[0], cm(k.Yff, Vc[k.f])[1] + cm(k.Yft, Vc[k.t])[1]];
    const It = [cm(k.Ytf, Vc[k.f])[0] + cm(k.Ytt, Vc[k.t])[0], cm(k.Ytf, Vc[k.f])[1] + cm(k.Ytt, Vc[k.t])[1]];
    const Sf = cm(Vc[k.f], [If[0], -If[1]]), St = cm(Vc[k.t], [It[0], -It[1]]);
    outL[k.id] = { Pf: Sf[0], Qf: Sf[1], Pt: St[0], Qt: St[1], Sf: cabs(Sf) * base, St: cabs(St) * base, loss: Sf[0] + St[0], If: cabs(If) };
    lossP += Sf[0] + St[0]; lossQ += Sf[1] + St[1];
    if (k.rating && Math.max(outL[k.id].Sf, outL[k.id].St) > k.rating) problems.push(problem('branch.overload', 'warning', `Branch ${k.id} carries ${Math.max(outL[k.id].Sf, outL[k.id].St).toFixed(1)} MVA, over its ${k.rating} MVA rating.`, [{ kind: 'branch', id: k.id }], { req: { op: '<=', value: k.rating, unit: 'MVA' }, found: { value: Math.max(outL[k.id].Sf, outL[k.id].St), unit: 'MVA' } }));
  }
  const lo = opts.vMin ?? 0.95, hi = opts.vMax ?? 1.05;
  sys.buses.forEach((b, i) => { if (V[i] < lo || V[i] > hi) problems.push(problem('voltage.limit', 'warning', `Bus ${b.id}: voltage ${V[i].toFixed(3)} pu is outside ${lo}–${hi} pu.`, [{ kind: 'bus', id: b.id }], { req: { op: 'between', value: [lo, hi], unit: 'pu' }, found: { value: V[i], unit: 'pu' } })); });
  const sl = sys.buses.findIndex((b) => b.type === 'slack');
  return { ok, iterations, buses: outB, branches: outL, slack: { P: P[sl] + (sys.buses[sl].Pd || 0), Q: Q[sl] + (sys.buses[sl].Qd || 0) }, loss: { P: lossP, Q: lossQ }, mismatch, problems, switched, base };
}

/** Per-unit helpers: ohms → pu on (kVbase, MVAbase), pu → ohms, and the three-phase voltage drop of a feeder (exact and the usual approximation). */
export const zBase = (kV, MVA) => (kV * kV) / MVA;
export const ohmToPu = (z, kV, MVA) => z / zBase(kV, MVA);
export function voltageDrop({ R, X, I, pf, kV }) {
  const phi = Math.acos(pf), approx = Math.sqrt(3) * I * (R * pf + X * Math.sin(phi));
  return { approx, percent: kV ? 100 * approx / (kV * 1000) : null };
}

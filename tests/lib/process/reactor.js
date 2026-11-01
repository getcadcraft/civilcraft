/* SPDX-License-Identifier: Apache-2.0 */
/**
 * reactor.js — reactors (0.8 Track CH, CH.3; DOM-free, deterministic).
 *   conversion   a reaction with a given conversion of a key component; heat from the formation enthalpies (the enthalpy basis includes them)
 *   equilibrium  gas-phase chemical equilibrium for the listed independent reactions: the extent formulation of Gibbs-energy minimisation
 *                (SVN7 ch. 13; K(T) from Gf, Hf and the Cp polynomials, eq. 13.18); the element-potential form is not built
 *   cstr / pfr   power-law/Arrhenius kinetics, isothermal or adiabatic (Fogler, Elements of Chemical Reaction Engineering; Levenspiel ch. 5)
 * Reaction: { stoich: { id: nu }, key?, X?, k0?, Ea?, orders?: { id: alpha } } with nu < 0 for reactants.
 */
import { R, T0, P0 } from './data.js';
import { newtonFD, rk45, illinois } from './numeric.js';
import { fromFlash, emptyStream, isZero, atEnthalpy } from './stream.js';

const sum = (a) => a.reduce((s, v) => s + v, 0);

export function nuVector(th, rxn) { return th.ids.map((id) => rxn.stoich[id] || 0); }
/** Reaction enthalpy J per mol of extent at T (ideal-gas formation basis). */
export function reactionDH(th, rxn, T) { const nu = nuVector(th, rxn); let h = 0; for (let i = 0; i < th.n; i++) if (nu[i]) h += nu[i] * th.hIg(i, T); return h; }
/** Reaction enthalpy with every species in the phase the reactor works in (pure-species enthalpies of that phase at T, P). */
export function reactionDHPhase(th, rxn, T, P, type) { const nu = nuVector(th, rxn); let h = 0; for (let i = 0; i < th.n; i++) if (nu[i]) h += nu[i] * th.phase(T, P, th.ids.map((_, k) => (k === i ? 1 : 0)), type).H; return h; }
/** ln K(T) of the reaction (ideal-gas standard state, 1 bar): SVN7 eq. 13.18 with the Cp polynomial integrated analytically. */
export function lnKeq(th, rxn, T) {
  const nu = nuVector(th, rxn); let dA = 0, dB = 0, dC = 0, dD = 0, dH0 = 0, dG0 = 0;
  for (let i = 0; i < th.n; i++) {
    if (!nu[i]) continue; const c = th.c[i]; if (c.gf == null) throw new Error('no Gibbs energy of formation for ' + th.ids[i]);
    dA += nu[i] * c.cp.A; dB += nu[i] * c.cp.B; dC += nu[i] * c.cp.C; dD += nu[i] * c.cp.D; dH0 += nu[i] * c.hf; dG0 += nu[i] * c.gf;
  }
  const J = dH0 / R - dA * T0 - dB / 2 * T0 * T0 - dC / 3 * T0 ** 3 + dD / T0;
  const gT = (t) => J - dA * t * Math.log(t) - dB / 2 * t * t - dC / 6 * t ** 3 - dD / (2 * t);       // (dG/R) without the integration-constant term
  const Ic = (dG0 / R - gT(T0)) / T0;
  return -(gT(T) + Ic * T) / T;
}
function applyExtents(n0, nus, xi) { const n = n0.slice(); for (let j = 0; j < nus.length; j++) for (let i = 0; i < n.length; i++) n[i] += nus[j][i] * xi[j]; return n; }
function outFrom(th, s, n, T, P) { const F = sum(n); if (F <= 0) return emptyStream(th); return fromFlash(F, th.flashPT(T, P, n.map((v) => v / F))); }

export const REACTORS = {
  conversion(th, [s], p) {
    if (isZero(s)) return { outs: [emptyStream(th)], Q: 0, W: 0, notes: [] };
    let n = s.z.map((z) => z * s.F); const extents = [], notes = [];
    for (const r of p.reactions) {
      const nu = nuVector(th, r), k = th.index(r.key), xi = r.X * n[k] / Math.abs(nu[k]); extents.push(xi); n = applyExtents(n, [nu], [xi]);
    }
    if (n.some((v) => v < -1e-9 * s.F)) notes.push('a conversion asked for more of a reactant than there is');
    n = n.map((v) => Math.max(v, 0)); const F = sum(n), z = n.map((v) => v / F), P = s.P - (p.dP || 0);
    let out;
    if (p.Tout != null) out = fromFlash(F, th.flashPT(p.Tout, P, z));
    else if (p.duty != null) out = atEnthalpy(th, F, z, P, s.F * s.H + p.duty, s.T);
    else out = atEnthalpy(th, F, z, P, s.F * s.H, s.T);     // adiabatic
    return { outs: [out], Q: F * out.H - s.F * s.H, W: 0, notes, extents, reactsAtoms: true };
  },
  equilibrium(th, [s], p) {
    if (isZero(s)) return { outs: [emptyStream(th)], Q: 0, W: 0, notes: [] };
    const P = s.P - (p.dP || 0), nus = p.reactions.map((r) => nuVector(th, r)), n0 = s.z.map((z) => z * s.F), Ftot0 = s.F;
    const solveAt = (T) => {
      const lnK = p.reactions.map((r) => lnKeq(th, r, T)), floor = 1e-14 * Ftot0;
      const lnphi = (n) => { const F = sum(n), y = n.map((v) => v / F); if (!p.nonideal || !th.eos) return y.map(() => 0); const r = th.eos.roots(T, P, y); return th.eos.lnphi(T, P, y, r.z[r.z.length - 1], r); };
      const res = (xi) => {
        const n = applyExtents(n0, nus, xi), F = sum(n), lp = lnphi(n.map((v) => Math.max(v, floor))), out = [];
        for (let j = 0; j < nus.length; j++) { let s2 = 0; for (let i = 0; i < n.length; i++) if (nus[j][i]) s2 += nus[j][i] * (Math.log(Math.max(n[i], floor) / F) + lp[i] + Math.log(P / P0)); out.push(s2 - lnK[j]); }
        return out;
      };
      let xi;
      if (nus.length === 1) {
        const nu = nus[0]; let lo = -Infinity, hi = Infinity;
        for (let i = 0; i < nu.length; i++) { if (nu[i] > 0) lo = Math.max(lo, -n0[i] / nu[i]); else if (nu[i] < 0) hi = Math.min(hi, -n0[i] / nu[i]); }
        const eps = 1e-12 * Math.max(1, Ftot0); lo = lo === -Infinity ? -1e6 * Ftot0 : lo + eps * Math.abs(lo > -Infinity ? 1 : 1); hi = hi === Infinity ? 1e6 * Ftot0 : hi - eps;
        const f = (x) => res([x])[0]; const r0 = illinois(f, lo, hi, { tol: 1e-13 }); xi = [r0 == null ? (f(lo) > 0 ? lo : hi) : r0];
      } else {
        const feasible = (x) => applyExtents(n0, nus, x).every((v) => v > 0);
        const sol = newtonFD(res, nus.map(() => 0.01 * Ftot0), { feasible: (x) => feasible(x) || true, tol: 1e-10, maxIter: 200 }); xi = sol.x;
        if (!feasible(xi)) throw new Error('equilibrium reactor: the extents left the feasible region (no solution found)');
      }
      return xi;
    };
    let T = p.Tout != null ? p.Tout : s.T, xi, n;
    if (p.Tout != null || p.duty != null) {
      if (p.Tout == null) {            // duty given: find T with H(T) = Hin + duty
        const target = s.F * s.H + p.duty;
        const hOut = (t) => { const x = solveAt(t), nn = applyExtents(n0, nus, x); const F = sum(nn); return F * th.flashPT(t, P, nn.map((v) => v / F)).H - target; };
        let a = Math.max(200, s.T - 800), b = s.T + 2500; T = illinois(hOut, a, b, { tol: 1e-9 }); if (T == null) throw new Error('equilibrium reactor: no temperature gives that duty');
      }
    } else {                                // adiabatic
      const target = s.F * s.H, hOut = (t) => { const x = solveAt(t), nn = applyExtents(n0, nus, x); const F = sum(nn); return F * th.flashPT(t, P, nn.map((v) => v / F)).H - target; };
      T = illinois(hOut, 250, 3500, { tol: 1e-9 }); if (T == null) throw new Error('equilibrium reactor: adiabatic temperature not bracketed');
    }
    xi = solveAt(T); n = applyExtents(n0, nus, xi);
    const out = outFrom(th, s, n, T, P);
    return { outs: [out], Q: out.F * out.H - s.F * s.H, W: 0, notes: [], extents: xi, lnK: p.reactions.map((r) => lnKeq(th, r, T)), reactsAtoms: true };
  },
  pfr(th, [s], p) { return kinetic(th, s, p, 'pfr'); },
  cstr(th, [s], p) { return kinetic(th, s, p, 'cstr'); },
};

function rates(th, p, n, T, P, vol) {
  // mol/(m3 s) of each reaction; concentrations from the ideal gas (phase 'gas') or the inlet volumetric flow (phase 'liquid', constant density)
  const F = sum(n), out = [];
  for (const r of p.reactions) {
    let rate = r.k0 * Math.exp(-(r.Ea || 0) / (R * T));
    for (const [id, a] of Object.entries(r.orders || Object.fromEntries(Object.entries(r.stoich).filter(([, v]) => v < 0).map(([k, v]) => [k, -v])))) {
      const i = th.index(id), C = p.phase === 'gas' ? (n[i] / F) * P / (R * T) : n[i] / vol;
      rate *= Math.pow(Math.max(C, 0), a);
    }
    out.push(rate);
  }
  return out;
}
function cpMix(th, n, T, P, phase) {
  const F = sum(n), x = n.map((v) => v / F);
  if (phase === 'gas') return F * th.cpIgMix(x, T);
  const d = 1e-3 * T; return F * (th.phase(T + d, P, x, 'L').H - th.phase(T - d, P, x, 'L').H) / (2 * d);
}
function kinetic(th, s, p, kind) {
  if (isZero(s)) return { outs: [emptyStream(th)], Q: 0, W: 0, notes: [] };
  const P = s.P - (p.dP || 0), n0 = s.z.map((z) => z * s.F), nus = p.reactions.map((r) => nuVector(th, r)), phase = p.phase || 'liquid', adiabatic = !!p.adiabatic;
  const isoT = p.T != null ? p.T : s.T;
  let vol0 = 0; for (const q of s.phases) vol0 += s.F * q.frac * th.phase(s.T, P, q.x, phase === 'gas' ? 'V' : 'L').V;     // m3/s
  const phs = phase === 'gas' ? 'V' : 'L';
  const H = (n, T) => { const F = sum(n); return F * th.phase(T, P, n.map((v) => v / F), phs).H; };
  let nEnd, TEnd, profile = null;
  if (kind === 'pfr') {
    const f = (v, y) => {
      const n = y.slice(0, th.n), T = adiabatic ? y[th.n] : isoT, rt = rates(th, p, n, T, P, vol0), dn = new Array(th.n).fill(0); let q = 0;
      for (let j = 0; j < nus.length; j++) { for (let i = 0; i < th.n; i++) dn[i] += nus[j][i] * rt[j]; q += -reactionDHPhase(th, p.reactions[j], T, P, phs) * rt[j]; }
      return adiabatic ? [...dn, q / cpMix(th, n, T, P, phase)] : dn;
    };
    const y0 = adiabatic ? [...n0, s.T] : n0, sol = rk45(f, y0, 0, p.V, { rtol: 1e-10, atol: 1e-14 * s.F });
    nEnd = sol.y.slice(0, th.n); TEnd = adiabatic ? sol.y[th.n] : isoT; profile = sol.points.map(([v, y]) => ({ V: v, T: adiabatic ? y[th.n] : isoT, n: y.slice(0, th.n) }));
  } else {
    const Fin = H(n0, s.T), solveV = (V, guess) => {
      const res = (x) => {
        const n = x.slice(0, th.n), T = adiabatic ? x[th.n] : isoT, rt = rates(th, p, n, T, P, vol0), r = [];
        for (let i = 0; i < th.n; i++) { let g = 0; for (let j = 0; j < nus.length; j++) g += nus[j][i] * rt[j]; r.push((n[i] - n0[i] - V * g) / (s.F)); }
        if (adiabatic) r.push((H(n, T) - Fin) / (s.F * 1e5));
        return r;
      };
      return newtonFD(res, guess, { feasible: (x) => x.slice(0, th.n).every((v) => v >= -1e-12 * s.F) && (!adiabatic || (x[th.n] > 100 && x[th.n] < 5000)), tol: 1e-12, maxIter: 80 });
    };
    let g = adiabatic ? [...n0, s.T] : n0.slice(), ok = true;
    const steps = 24; for (let k = 1; k <= steps; k++) { const sol = solveV(p.V * (k / steps) ** 2, g); g = sol.x; ok = sol.ok; }
    if (!ok) return { outs: [fromFlash(s.F, th.flashPT(s.T, P, s.z))], Q: 0, W: 0, notes: ['CSTR: the solver did not converge'], failed: true };
    nEnd = g.slice(0, th.n); TEnd = adiabatic ? g[th.n] : isoT;
  }
  nEnd = nEnd.map((v) => Math.max(v, 0));
  const out = outFrom(th, s, nEnd, TEnd, P);
  return { outs: [out], Q: out.F * out.H - s.F * s.H, W: 0, notes: [], profile, reactsAtoms: true, Tout: TEnd, tau: p.V / vol0 };
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * vlle.js — three-phase flash: a vapour and two liquids at T, P (0.8 Track CH, CH.1; DOM-free). Gamma–phi: activity-coefficient liquids (NRTL, Wilson, UNIQUAC
 * through `Thermo`), ideal-gas vapour, Antoine / Wilson vapour pressures. For one reference liquid L1 the K-values are
 *   vapour  K_v,i = gamma_i(x1) Psat_i / P          liquid 2  K_l,i = gamma_i(x1) / gamma_i(x2)
 * and the phase fractions solve the multiphase Rachford–Rice equations  sum_i z_i (K_ji - 1) / (1 + sum_k beta_k (K_ki - 1)) = 0  by a damped Newton step that
 * keeps every denominator positive (Gibbs-energy convexity of the objective: Michelsen & Mollerup, Thermodynamic Models, ch. 11; Li & Johns 2006 for the form).
 * Compositions are updated by successive substitution on the K-values. Starting values: the liquid–liquid split from `Thermo.flashLL`, the vapour from ideal K.
 * Result: { state: 'vapor-liquid-liquid' | 'vapor-liquid' | 'liquid-liquid' | 'liquid' | 'vapor', phases[{ type, frac, x }], V, converged, iter, notes[] }.
 * It is the same Thermo the rest of CH.1 uses; nothing here replaces flashPT (it adds a flash for the case flashPT does not do).
 */
const sum = (a) => a.reduce((s, v) => s + v, 0);
const norm = (a) => { const s = sum(a); return s > 0 ? a.map((v) => v / s) : a.slice(); };
const solve2 = (a, b, c, d, r1, r2) => { const det = a * d - b * c; return Math.abs(det) < 1e-300 ? null : [(r1 * d - b * r2) / det, (a * r2 - c * r1) / det]; };

/** @param {import('./thermo.js').Thermo} th an activity-coefficient package (model nrtl|wilson|uniquac) */
export function flashVLLE(th, T, P, z0, opts = {}) {
  if (th.eos || th.model === 'ideal') throw new Error('The three-phase flash needs an activity-coefficient model (nrtl, wilson or uniquac).');
  const n = th.n, z = norm(z0), notes = [], maxIter = opts.maxIter || 400, tol = opts.tol || 1e-11;
  const psat = z.map((_, i) => th.psatIdeal(i, T));
  const ll = th.flashLL(T, P, z), split = ll.state === 'liquid-liquid';
  let x1 = split ? ll.phases[0].x.slice() : z.slice(), x2 = split ? ll.phases[1].x.slice() : z.slice();
  let beta = split ? [0, ll.phases[1].frac] : [0, 0];                         // [vapour, liquid 2]; liquid 1 is the reference
  let converged = false, iter = 0;
  const kv = (xa) => { const g = th.lnGamma(xa, T); return z.map((_, i) => Math.exp(g[i]) * psat[i] / P); };
  const kl = (xa, xb) => { const ga = th.lnGamma(xa, T), gb = th.lnGamma(xb, T); return z.map((_, i) => Math.exp(ga[i] - gb[i])); };
  let Kv = kv(x1), Kl = split ? kl(x1, x2) : z.map(() => 1);
  for (; iter < maxIter; iter++) {
    let bv = Math.max(beta[0], 0), bl = Math.max(beta[1], 0);
    const den = (a, b) => z.map((_, i) => 1 + a * (Kv[i] - 1) + b * (Kl[i] - 1));
    for (let k = 0; k < 200; k++) {
      const D = den(bv, bl);
      let g1 = 0, g2 = 0, h11 = 0, h12 = 0, h22 = 0;
      for (let i = 0; i < n; i++) {
        const a = Kv[i] - 1, b = Kl[i] - 1, q = z[i] / (D[i] * D[i]);
        g1 += z[i] * a / D[i]; g2 += z[i] * b / D[i]; h11 -= q * a * a; h12 -= q * a * b; h22 -= q * b * b;
      }
      const stuckV = bv <= 1e-14 && g1 <= 0, stuckL = bl <= 1e-14 && g2 <= 0;
      let dv = 0, dl = 0;
      if (stuckV && stuckL) break;
      if (stuckV) dl = h22 ? -g2 / h22 : 0; else if (stuckL) dv = h11 ? -g1 / h11 : 0; else { const s = solve2(h11, h12, h12, h22, -g1, -g2); if (!s) break; [dv, dl] = s; }
      let t = 1, moved = false;
      for (let j = 0; j < 60; j++) {
        const nv = Math.max(bv + t * dv, 0), nl = Math.max(bl + t * dl, 0), Dn = den(nv, nl);
        if (nv + nl <= 1 && Dn.every((v) => v > 1e-12)) { bv = nv; bl = nl; moved = true; break; }
        t *= 0.5;
      }
      if (!moved || (Math.abs(g1) < 1e-14 && Math.abs(g2) < 1e-14) || Math.abs(t * dv) + Math.abs(t * dl) < 1e-16) break;
    }
    beta = [bv, bl];
    const D = den(bv, bl), nx1 = norm(z.map((v, i) => v / D[i])), nx2 = norm(nx1.map((v, i) => v * Kl[i]));
    const nKv = kv(nx1), nKl = bl > 1e-12 ? kl(nx1, nx2) : Kl;
    let err = 0; for (let i = 0; i < n; i++) err = Math.max(err, Math.abs(Math.log(nKv[i] / Kv[i])), bl > 1e-12 ? Math.abs(Math.log(nKl[i] / Kl[i])) : 0);
    x1 = nx1; x2 = nx2; Kv = nKv; Kl = nKl;
    if (err < tol) { converged = true; break; }
  }
  const bv = beta[0], bl = beta[1], b1 = 1 - bv - bl, eps = 1e-9;
  const D = z.map((_, i) => 1 + bv * (Kv[i] - 1) + bl * (Kl[i] - 1));
  const X1 = norm(z.map((v, i) => v / D[i])), X2 = norm(X1.map((v, i) => v * Kl[i])), Y = norm(X1.map((v, i) => v * Kv[i]));
  const phases = [];
  if (bv > eps) phases.push({ type: 'vapor', frac: bv, x: Y });
  if (b1 > eps) phases.push({ type: 'liquid', frac: b1, x: X1 });
  if (bl > eps) phases.push({ type: 'liquid2', frac: bl, x: X2 });
  if (!converged) notes.push('The three-phase iteration did not meet its tolerance in ' + maxIter + ' passes; treat the split as an estimate.');
  const nliq = phases.filter((p) => p.type.startsWith('liquid')).length, hasV = bv > eps;
  const state = hasV && nliq === 2 ? 'vapor-liquid-liquid' : hasV && nliq === 1 ? 'vapor-liquid' : !hasV && nliq === 2 ? 'liquid-liquid' : hasV ? 'vapor' : 'liquid';
  if (!phases.length) phases.push({ type: 'liquid', frac: 1, x: z.slice() });
  return { T, P, z, state, phases, V: bv, converged, iter, notes };
}

/** Iso-fugacity across the phases that exist (max |ln| difference) and the component balances: what tests and the calculator report. */
export function vlleResiduals(th, r) {
  const g = (x) => th.lnGamma(x, r.T), liq = r.phases.filter((p) => p.type.startsWith('liquid')), v = r.phases.find((p) => p.type === 'vapor');
  let iso = 0, bal = 0;
  if (liq.length === 2) { const a = g(liq[0].x), b = g(liq[1].x); for (let i = 0; i < th.n; i++) iso = Math.max(iso, Math.abs(Math.log(liq[0].x[i]) + a[i] - Math.log(liq[1].x[i]) - b[i])); }
  if (v && liq.length) { const a = g(liq[0].x); for (let i = 0; i < th.n; i++) iso = Math.max(iso, Math.abs(Math.log(v.x[i] * r.P) - Math.log(liq[0].x[i]) - a[i] - Math.log(th.psatIdeal(i, r.T)))); }
  for (let i = 0; i < th.n; i++) bal = Math.max(bal, Math.abs(r.phases.reduce((s, p) => s + p.frac * p.x[i], 0) - r.z[i]));
  return { iso, bal };
}

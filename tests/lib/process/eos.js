/* SPDX-License-Identifier: Apache-2.0 */
/**
 * eos.js — cubic equations of state, Peng–Robinson (1976, with the 1978 extension for omega > 0.49) and Soave–Redlich–Kwong (1972)
 * (0.8 Track CH, CH.1; DOM-free). The generic form of Smith/Van Ness/Abbott (7th ed., eq. 3.41 and Table 3.1):
 *   P = RT/(v - b) - a(T) / ((v + eps b)(v + sigma b)),  a = sum_i sum_j y_i y_j sqrt(a_i a_j)(1 - k_ij),  b = sum y_i b_i.
 * Fugacity coefficients, enthalpy and entropy departures are the standard closed forms of that same model (SVN7 section 14.x,
 * Reid–Prausnitz–Poling 5th ed. ch. 5, Peng–Robinson 1976 Table). Pure arithmetic, deterministic.
 */
import { R } from './data.js';

export const MODELS = {
  pr:  { name: 'Peng–Robinson', sigma: 1 + Math.SQRT2, eps: 1 - Math.SQRT2, oa: 0.45724, ob: 0.07780, zc: 0.3074,
         kappa: (w) => (w <= 0.49 ? 0.37464 + 1.54226 * w - 0.26992 * w * w : 0.379642 + 1.48503 * w - 0.164423 * w * w + 0.016666 * w * w * w) },
  srk: { name: 'Soave–Redlich–Kwong', sigma: 1, eps: 0, oa: 0.42748, ob: 0.08664, zc: 1 / 3, kappa: (w) => 0.480 + 1.574 * w - 0.176 * w * w },
};

/** Real roots of z^3 + c2 z^2 + c1 z + c0 = 0, ascending (trigonometric/Cardano, no iteration). */
export function cubicRoots(c2, c1, c0) {
  const p = c1 - c2 * c2 / 3, q = 2 * c2 * c2 * c2 / 27 - c2 * c1 / 3 + c0, sh = -c2 / 3;
  const disc = q * q / 4 + p * p * p / 27;
  let roots;
  if (disc > 1e-30) {                                   // one real root
    const s = Math.sqrt(disc), u = Math.cbrt(-q / 2 + s), v = Math.cbrt(-q / 2 - s);
    roots = [u + v + sh];
  } else if (p === 0 && q === 0) roots = [sh];
  else {
    const m = 2 * Math.sqrt(-p / 3), arg = Math.max(-1, Math.min(1, (3 * q) / (p * m))), th = Math.acos(arg) / 3;
    roots = [m * Math.cos(th) + sh, m * Math.cos(th - 2 * Math.PI / 3) + sh, m * Math.cos(th - 4 * Math.PI / 3) + sh].sort((a, b) => a - b);
    if (disc > -1e-30 && Math.abs(roots[0] - roots[1]) < 1e-9) roots = [roots[0], roots[2]];
  }
  // one Newton polish each, so a result is the same on every engine
  const f = (z) => ((z + c2) * z + c1) * z + c0, d = (z) => (3 * z + 2 * c2) * z + c1;
  return roots.map((z) => { for (let i = 0; i < 3; i++) { const dd = d(z); if (dd === 0) break; const zn = z - f(z) / dd; if (!Number.isFinite(zn)) break; z = zn; } return z; }).sort((a, b) => a - b);
}

export class Cubic {
  /** comps: normalised components; model 'pr'|'srk'; kij: symmetric matrix (rows of numbers) or null. */
  constructor(comps, model = 'pr', kij = null) {
    this.m = MODELS[model]; if (!this.m) throw new Error('unknown EOS ' + model);
    this.model = model; this.comps = comps; this.n = comps.length;
    this.kij = kij || comps.map(() => comps.map(() => 0));
    this.ac = comps.map((c) => this.m.oa * R * R * c.Tc * c.Tc / c.Pc);
    this.b = comps.map((c) => this.m.ob * R * c.Tc / c.Pc);
    this.kap = comps.map((c) => this.m.kappa(c.omega));
  }
  /** pure-component a_i(T), da_i/dT */
  pure(T) {
    const a = [], da = [];
    for (let i = 0; i < this.n; i++) {
      const c = this.comps[i], sq = 1 + this.kap[i] * (1 - Math.sqrt(T / c.Tc)), al = sq * sq;
      a.push(this.ac[i] * al);
      da.push(-this.ac[i] * this.kap[i] * sq / Math.sqrt(T * c.Tc));
    }
    return { a, da };
  }
  mix(T, y) {
    const { a, da } = this.pure(T), n = this.n; let am = 0, dam = 0, bm = 0; const aij = Array.from({ length: n }, () => new Array(n));
    for (let i = 0; i < n; i++) {
      bm += y[i] * this.b[i];
      for (let j = 0; j < n; j++) {
        const s = Math.sqrt(a[i] * a[j]), k = 1 - this.kij[i][j]; aij[i][j] = s * k;
        am += y[i] * y[j] * s * k;
        if (s > 0) dam += y[i] * y[j] * k * 0.5 * s * (da[i] / a[i] + da[j] / a[j]);
      }
    }
    return { a: am, da: dam, b: bm, aij };
  }
  /** All real compressibility roots above beta (physical), ascending, for the composition y. */
  roots(T, P, y) {
    const mx = this.mix(T, y), beta = mx.b * P / (R * T);
    const A = mx.a * P / (R * T * R * T), u = this.m.eps + this.m.sigma, w = this.m.eps * this.m.sigma;
    const c2 = u * beta - 1 - beta, c1 = w * beta * beta - (1 + beta) * u * beta + A, c0 = -(1 + beta) * w * beta * beta - A * beta;
    const zs = cubicRoots(c2, c1, c0).filter((z) => z > beta * (1 + 1e-12));
    return { z: zs, beta, A, mx };
  }
  /** ln of the fugacity coefficients of every component for root Z. */
  lnphi(T, P, y, Z, r = null) {
    r = r || this.roots(T, P, y); const { beta, mx } = r, s = this.m.sigma, e = this.m.eps;
    const I = Math.log((Z + s * beta) / (Z + e * beta)) / (s - e), qv = mx.a / (mx.b * R * T), out = [];
    for (let i = 0; i < this.n; i++) {
      let sum = 0; for (let j = 0; j < this.n; j++) sum += y[j] * mx.aij[i][j];
      out.push(this.b[i] / mx.b * (Z - 1) - Math.log(Z - beta) - qv * (2 * sum / mx.a - this.b[i] / mx.b) * I);
    }
    return out;
  }
  /** departures at (T,P) for root Z: { H, S } in J/mol and J/(mol K) (H - Hig, S - Sig at the same T and P). */
  departure(T, P, y, Z, r = null) {
    r = r || this.roots(T, P, y); const { beta, mx } = r, s = this.m.sigma, e = this.m.eps;
    const I = Math.log((Z + s * beta) / (Z + e * beta)) / (s - e);
    return { H: R * T * (Z - 1) + (T * mx.da - mx.a) / mx.b * I, S: R * Math.log(Z - beta) + mx.da / mx.b * I };
  }
  /** Is root Z liquid-like? Density above the critical-density line b/v = Omega_b/Z_c of the model. */
  liquidLike(Z, beta) { return beta / Z > this.m.ob / this.m.zc; }
  /** Gibbs-energy proxy sum y ln(phi y) for picking the stable root of one composition. */
  gibbs(T, P, y, Z, r) { const lp = this.lnphi(T, P, y, Z, r); let g = 0; for (let i = 0; i < this.n; i++) if (y[i] > 0) g += y[i] * (Math.log(y[i]) + lp[i]); return g; }
  /** Pure-component vapour pressure at T (Pa) from equal fugacity of the two roots (i = component index), or null above Tc. */
  psat(i, T, guess = null) {
    const c = this.comps[i]; if (T >= c.Tc) return null;
    const sub = new Cubic([c], this.model), y = [1];
    let P = guess || c.Pc * Math.exp(5.373 * (1 + c.omega) * (1 - c.Tc / T));
    for (let it = 0; it < 100; it++) {
      const r = sub.roots(T, P, y);
      if (r.z.length < 2) { P *= r.z.length && sub.liquidLike(r.z[0], r.beta) ? 0.9 : 1.1; continue; }
      const zl = r.z[0], zv = r.z[r.z.length - 1], lf = sub.lnphi(T, P, y, zl, r)[0], vf = sub.lnphi(T, P, y, zv, r)[0];
      const d = lf - vf; if (Math.abs(d) < 1e-12) return P;
      P *= Math.exp(d * (zv > 0 ? 1 : 1));            // phi_L/phi_V > 1 means P is too low
    }
    return P;
  }
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * thermo.js — the property package (0.8 Track CH, CH.1; DOM-free, deterministic). One class, `Thermo`, for a list of components and a model:
 *   'pr' | 'srk'                    equation of state for both phases (kij matrix),
 *   'ideal'                         Raoult's law with Antoine vapour pressures, ideal gas,
 *   'nrtl' | 'wilson' | 'uniquac'   gamma–phi: activity-coefficient liquid, ideal-gas vapour (+ optional Henry's-law solutes).
 * Flashes: PT (vapour–liquid, with a stability test for the EOS models), PH, PS, liquid–liquid for the activity models, and bubble and
 * dew points at a given T or P. Units are SI: T K, P Pa, energies J/mol, flows are the caller's. Enthalpy has the elements-at-298.15-K
 * reference (formation enthalpies are in), so reactors close their energy balance; entropy is relative (ideal gas, 298.15 K, 1 bar = 0).
 * Pure-fluid reference properties from an outside engine plug in with `registerPureFluidBackend` (CoolProp is not bundled: see the log).
 */
import { R, T0, P0, COMPONENTS, normalise } from './data.js';
import { Cubic } from './eos.js';
import { GAMMA } from './activity.js';

let pureBackend = null;
/** backend: { name, supports(id), props(id, T, P) → { H, S, phase } } — optional; used only by pureProps(). */
export function registerPureFluidBackend(b) { pureBackend = b; }

const sum = (a) => { let s = 0; for (const v of a) s += v; return s; };
const normed = (a) => { const s = sum(a); return s > 0 ? a.map((v) => v / s) : a.slice(); };
const maxAbs = (a, b) => { let m = 0; for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - b[i])); return m; };

export class Thermo {
  /** opts: { components: [id | component], model, kij, params (activity), henry: { id: { H298bar, dlnHdInvT } }, name } */
  constructor(opts) {
    this.ids = []; this.c = [];
    for (const c of opts.components) {
      const raw = typeof c === 'string' ? COMPONENTS[c] : c; if (!raw) throw new Error('unknown component ' + c);
      this.ids.push(raw.id); this.c.push(raw.antoineSI || raw.Pc < 1e4 ? raw : normalise(raw));
      if (this.c[this.c.length - 1].Pc < 1e4) this.c[this.c.length - 1] = normalise(raw);
    }
    this.n = this.c.length; this.model = opts.model || 'pr'; this.params = opts.params || null; this.henryData = opts.henry || {};
    this.eos = (this.model === 'pr' || this.model === 'srk') ? new Cubic(this.c, this.model, opts.kij) : null;
    if (!this.eos && this.model !== 'ideal' && !GAMMA[this.model]) throw new Error('unknown model ' + this.model);
    this.tolSS = 1e-13;
  }
  index(id) { const i = this.ids.indexOf(id); if (i < 0) throw new Error('component not in this package: ' + id); return i; }
  get MW() { return this.c.map((c) => c.MWkg); }
  mwMix(z) { let s = 0; for (let i = 0; i < this.n; i++) s += z[i] * this.c[i].MWkg; return s; }

  // ---- ideal-gas part --------------------------------------------------------------------------------------------------------
  cpIg(i, T) { const k = this.c[i].cp; return R * (k.A + k.B * T + k.C * T * T + k.D / (T * T)); }
  hIg(i, T) { const k = this.c[i].cp; return (this.c[i].hf || 0) + R * (k.A * (T - T0) + k.B / 2 * (T * T - T0 * T0) + k.C / 3 * (T ** 3 - T0 ** 3) - k.D * (1 / T - 1 / T0)); }
  sIg(i, T) { const k = this.c[i].cp; return R * (k.A * Math.log(T / T0) + k.B * (T - T0) + k.C / 2 * (T * T - T0 * T0) - k.D / 2 * (1 / (T * T) - 1 / (T0 * T0))); }
  /** Ideal-gas mixture heat capacity J/(mol K). */
  cpIgMix(z, T) { let s = 0; for (let i = 0; i < this.n; i++) s += z[i] * this.cpIg(i, T); return s; }
  psatIdeal(i, T) {
    const c = this.c[i];
    if (c.antoineSI) return Math.exp(c.antoineSI.A - c.antoineSI.B / (T + c.antoineSI.C));
    return c.Pc * Math.exp(5.373 * (1 + c.omega) * (1 - c.Tc / T));      // Wilson's estimate when there is no Antoine fit
  }
  /** Heat of vaporisation J/mol at T: Watson scaling from the value at Tb (Chen's estimate when Tb or the value is missing). */
  dHvap(i, T) {
    const c = this.c[i]; if (T >= c.Tc) return 0;
    const Tb = c.Tb || 0.65 * c.Tc, Tbr = Tb / c.Tc;
    const h = c.dHvapTb || R * c.Tc * Tbr * (3.978 * Tbr - 3.958 + 1.555 * Math.log(c.Pc / 1e5)) / (1.07 - Tbr);
    return h * Math.pow((1 - T / c.Tc) / (1 - Tbr), 0.38);
  }
  /** Saturated liquid molar volume m3/mol, Rackett with the Yamada–Gunn Zra. */
  vLiq(i, T) { const c = this.c[i], Zra = 0.29056 - 0.08775 * c.omega, Tr = Math.min(T / c.Tc, 1); return R * c.Tc / c.Pc * Math.pow(Zra, 1 + Math.pow(1 - Tr, 2 / 7)); }

  // ---- phase properties -----------------------------------------------------------------------------------------------------
  /** Henry-law solutes (component index → H in Pa at T). */
  henryAt(i, T) { const h = this.henryData[this.ids[i]]; return h ? h.H298bar * 1e5 * Math.exp((h.dlnHdInvT || 0) * (1 / T - 1 / T0)) : null; }
  lnGamma(x, T) { return this.model === 'ideal' || this.eos ? x.map(() => 0) : GAMMA[this.model](x, T, this.params); }
  /** Enthalpy, entropy, volume of one phase. type 'V' | 'L'. EOS phases take the root of that type (or the only root). */
  phase(T, P, x, type) {
    const n = this.n; let H = 0, S = 0, V, Z = null;
    if (this.eos) {
      const r = this.eos.roots(T, P, x), zs = r.z; if (!zs.length) throw new Error('no EOS root');
      Z = type === 'L' ? zs[0] : zs[zs.length - 1];
      const d = this.eos.departure(T, P, x, Z, r);
      for (let i = 0; i < n; i++) { H += x[i] * this.hIg(i, T); S += x[i] * this.sIg(i, T); if (x[i] > 0) S -= R * x[i] * Math.log(x[i]); }
      H += d.H; S += d.S - R * Math.log(P / P0); V = Z * R * T / P;
      return { H, S, V, Z, liquidLike: this.eos.liquidLike(Z, r.beta) };
    }
    for (let i = 0; i < n; i++) { H += x[i] * this.hIg(i, T); S += x[i] * this.sIg(i, T); if (x[i] > 0) S -= R * x[i] * Math.log(x[i]); }
    if (type === 'V') { S -= R * Math.log(P / P0); return { H, S, V: R * T / P, Z: 1, liquidLike: false }; }
    // activity / ideal liquid: ideal-gas enthalpy minus the heat of vaporisation, plus the excess terms
    let vol = 0, lg = null;
    for (let i = 0; i < n; i++) { H -= x[i] * this.dHvap(i, T); S -= x[i] * (this.dHvap(i, T) / T + R * Math.log(this.psatIdeal(i, T) / P0)); vol += x[i] * this.vLiq(i, T); }
    if (this.model !== 'ideal') {
      lg = this.lnGamma(x, T); const dT = 1e-3 * T, a = this.lnGamma(x, T + dT), b = this.lnGamma(x, T - dT);
      let HE = 0, GE = 0; for (let i = 0; i < n; i++) { HE += -R * T * T * x[i] * (a[i] - b[i]) / (2 * dT); GE += R * T * x[i] * lg[i]; }
      H += HE; S += (HE - GE) / T;
    }
    return { H, S, V: vol, Z: P * vol / (R * T), liquidLike: true };
  }
  /** Pure-fluid reference properties: the registered backend if it knows the fluid, else the EOS package value. */
  pureProps(id, T, P) {
    if (pureBackend && pureBackend.supports(id)) return { ...pureBackend.props(id, T, P), source: pureBackend.name };
    const t = new Thermo({ components: [id], model: this.eos ? this.model : 'pr' }), f = t.flashPT(T, P, [1]);
    return { H: f.H, S: f.S, phase: f.phases[0].type, source: 'cubic EOS' };
  }

  // ---- K-values --------------------------------------------------------------------------------------------------------------
  wilsonK(T, P) { return this.c.map((c) => (c.Pc / P) * Math.exp(5.373 * (1 + c.omega) * (1 - c.Tc / T))); }
  /** ln K = ln(x-phase fugacity ratio): liquid x against vapour y. Returns { lnK, trivial } where trivial = ± 1 when the roots say
   * "this is a single dense/dilute fluid" (see saturation()). */
  lnK(T, P, x, y) {
    const n = this.n, out = new Array(n);
    if (this.eos) {
      const rl = this.eos.roots(T, P, x), rv = this.eos.roots(T, P, y);
      const zl = rl.z[0], zv = rv.z[rv.z.length - 1];
      const ll = this.eos.lnphi(T, P, x, zl, rl), lv = this.eos.lnphi(T, P, y, zv, rv);
      for (let i = 0; i < n; i++) out[i] = ll[i] - lv[i];
      let trivial = 0;
      if (rv.z.length === 1 && this.eos.liquidLike(zv, rv.beta)) trivial = -1;
      else if (rl.z.length === 1 && !this.eos.liquidLike(zl, rl.beta)) trivial = 1;
      return { lnK: out, trivial };
    }
    const lg = this.lnGamma(x, T);
    for (let i = 0; i < n; i++) {
      const H = this.henryAt(i, T);
      out[i] = H != null ? Math.log(H / P) : lg[i] + Math.log(this.psatIdeal(i, T) / P);
    }
    return { lnK: out, trivial: 0 };
  }

  // ---- Rachford–Rice ---------------------------------------------------------------------------------------------------------
  /** Vapour fraction in [0,1] for feed z and K; returns { V, state: 'two'|'liquid'|'vapor' }. */
  rachfordRice(z, K) {
    const n = z.length; let s1 = 0, s2 = 0;
    for (let i = 0; i < n; i++) { s1 += z[i] * K[i]; s2 += z[i] / K[i]; }
    if (s1 <= 1) return { V: 0, state: 'liquid' };
    if (s2 <= 1) return { V: 1, state: 'vapor' };
    const f = (V) => { let s = 0; for (let i = 0; i < n; i++) s += z[i] * (K[i] - 1) / (1 + V * (K[i] - 1)); return s; };
    let lo = 0, hi = 1, V = 0.5;                       // f(0) > 0 and f(1) < 0 here, f decreasing
    for (let it = 0; it < 300; it++) {
      const fv = f(V);
      if (fv > 0) lo = V; else hi = V;
      if (Math.abs(fv) < 1e-15 || hi - lo < 1e-16) break;
      let d = 0; for (let i = 0; i < n; i++) { const a = K[i] - 1; d -= z[i] * a * a / ((1 + V * a) ** 2); }
      const Vn = V - fv / d; V = (Vn > lo && Vn < hi) ? Vn : 0.5 * (lo + hi);
    }
    return { V, state: 'two' };
  }

  // ---- stability (Michelsen) for the EOS models ------------------------------------------------------------------------------
  /** → { stable, trials[] }; if unstable, `trial` is the composition of the incipient phase and `kind` 'V' or 'L'. */
  stability(T, P, z) {
    const e = this.eos, n = this.n, r = e.roots(T, P, z);
    let best = r.z[0], bg = Infinity;
    for (const Z of r.z) { const g = e.gibbs(T, P, z, Z, r); if (g < bg) { bg = g; best = Z; } }
    const lz = e.lnphi(T, P, z, best, r), d = z.map((v, i) => (v > 0 ? Math.log(v) + lz[i] : -Infinity));
    const K = this.wilsonK(T, P);
    for (const kind of ['V', 'L']) {
      let Y = z.map((v, i) => (kind === 'V' ? v * K[i] : v / K[i]));
      let y = normed(Y), conv = false;
      for (let it = 0; it < 500; it++) {
        y = normed(Y); const ry = e.roots(T, P, y), Zy = kind === 'V' ? ry.z[ry.z.length - 1] : ry.z[0], ly = e.lnphi(T, P, y, Zy, ry);
        const Yn = z.map((v, i) => (v > 0 ? Math.exp(d[i] - ly[i]) : 0)); let err = 0;
        for (let i = 0; i < n; i++) err = Math.max(err, Math.abs(Math.log((Yn[i] + 1e-300) / (Y[i] + 1e-300))));
        Y = Yn; if (err < 1e-10) { conv = true; break; }
      }
      const S = sum(Y), yy = normed(Y);
      if (maxAbs(yy, z) < 1e-4 && conv) continue;                       // trivial solution (the feed itself)
      if (S > 1 + 1e-8) return { stable: false, trial: yy, kind };
    }
    return { stable: true, root: best };
  }

  // ---- flashes ---------------------------------------------------------------------------------------------------------------
  /** Successive substitution VLE from initial K; returns { V, x, y, K, iter, trivial }. */
  _ss(T, P, z, K) {
    const n = this.n; let V = 0.5, x = z.slice(), y = z.slice(), it = 0;
    for (it = 0; it < 2000; it++) {
      const rr = this.rachfordRice(z, K); V = rr.V;
      x = normed(z.map((v, i) => v / (1 + V * (K[i] - 1)))); y = normed(x.map((v, i) => K[i] * v));
      if (rr.state === 'liquid') { x = z.slice(); y = normed(z.map((v, i) => K[i] * v)); }
      if (rr.state === 'vapor') { y = z.slice(); x = normed(z.map((v, i) => v / K[i])); }
      const { lnK } = this.lnK(T, P, x, y); let err = 0; const Kn = new Array(n);
      for (let i = 0; i < n; i++) { Kn[i] = Math.exp(lnK[i]); err = Math.max(err, Math.abs(lnK[i] - Math.log(K[i]))); }
      K = Kn;
      if (err < this.tolSS) break;
    }
    let tr = 0; for (let i = 0; i < n; i++) tr = Math.max(tr, Math.abs(Math.log(K[i])));
    return { V, x, y, K, iter: it, trivial: tr < 1e-6 };
  }
  _single(T, P, z, type) {
    const p = this.phase(T, P, z, type), t = type === 'V' ? 'vapor' : 'liquid';
    return { T, P, z: z.slice(), V: type === 'V' ? 1 : 0, phases: [{ type: t, frac: 1, x: z.slice(), H: p.H, S: p.S, v: p.V, Z: p.Z }], H: p.H, S: p.S, v: p.V, state: t };
  }
  _assemble(T, P, z, V, x, y, extra = {}) {
    const pv = this.phase(T, P, y, 'V'), pl = this.phase(T, P, x, 'L');
    const H = V * pv.H + (1 - V) * pl.H, S = V * pv.S + (1 - V) * pl.S, v = V * pv.V + (1 - V) * pl.V;
    return { T, P, z: z.slice(), V, phases: [{ type: 'vapor', frac: V, x: y, H: pv.H, S: pv.S, v: pv.V, Z: pv.Z }, { type: 'liquid', frac: 1 - V, x, H: pl.H, S: pl.S, v: pl.V, Z: pl.Z }], H, S, v, state: 'two-phase', ...extra };
  }
  /** PT flash. opts.phases: 'VLE' (default) | 'LLE' (activity models: two liquids). Result: { T, P, z, V, phases[], H, S, v, state }. */
  flashPT(T, P, z, opts = {}) {
    z = normed(z);
    if (opts.phases === 'LLE') return this.flashLL(T, P, z);
    if (this.n === 1) {
      if (this.eos) {
        const ps = this.eos.psat(0, T);
        if (ps == null || P > ps * (1 + 1e-9)) { const r = this.eos.roots(T, P, z); return this._single(T, P, z, r.z.length > 1 || this.eos.liquidLike(r.z[0], r.beta) ? 'L' : 'V'); }
        if (P < ps * (1 - 1e-9)) return this._single(T, P, z, 'V');
        return this._assemble(T, P, z, 0.5, [1], [1]);
      }
      const ps = this.psatIdeal(0, T); return this._single(T, P, z, P > ps ? 'L' : 'V');
    }
    if (this.eos) {
      const st = this.stability(T, P, z);
      if (st.stable) { const r = this.eos.roots(T, P, z); return this._single(T, P, z, this.eos.liquidLike(st.root, r.beta) ? 'L' : 'V'); }
      let K = this.wilsonK(T, P), res = this._ss(T, P, z, K);
      if (res.trivial) {                                              // restart from the stability trial
        K = st.kind === 'V' ? st.trial.map((v, i) => v / z[i]) : z.map((v, i) => v / st.trial[i]); res = this._ss(T, P, z, K);
      }
      if (res.trivial) { const r = this.eos.roots(T, P, z); return this._single(T, P, z, this.eos.liquidLike(st.root, r.beta) ? 'L' : 'V'); }
      return this._finish(T, P, z, res);
    }
    const K0 = z.map((_, i) => { const H = this.henryAt(i, T); return H != null ? H / P : this.psatIdeal(i, T) / P; });
    const res = this._ss(T, P, z, K0);
    return this._finish(T, P, z, res);
  }
  _finish(T, P, z, res) {
    if (res.V <= 0) return this._single(T, P, z, 'L');
    if (res.V >= 1) return this._single(T, P, z, 'V');
    return this._assemble(T, P, z, res.V, res.x, res.y, { iter: res.iter });
  }
  /** Liquid–liquid split (activity models). Phase 'liquid' = the one richer in the first seed key, 'liquid2' the other. */
  flashLL(T, P, z) {
    if (this.eos || this.model === 'ideal') throw new Error('liquid–liquid flash needs an activity model');
    z = normed(z); const n = this.n, lz = this.lnGamma(z, T);
    let best = null; const trials = [];
    for (let k = 0; k < n; k++) {
      let w = z.map((_, i) => (i === k ? 0.9 : 0.1 / (n - 1)));
      for (let it = 0; it < 500; it++) {
        const lw = this.lnGamma(w, T), Y = z.map((v, i) => Math.exp(Math.log(v) + lz[i] - lw[i])), wn = normed(Y);
        const e = maxAbs(wn, w); w = wn; if (e < 1e-12) break;
      }
      const lw = this.lnGamma(w, T); let tpd = 0; for (let i = 0; i < n; i++) if (w[i] > 0) tpd += w[i] * (Math.log(w[i]) + lw[i] - Math.log(z[i]) - lz[i]);
      if (maxAbs(w, z) > 1e-4) { trials.push({ w, tpd }); if (!best || tpd < best.tpd) best = { w, tpd }; }
    }
    if (!best || best.tpd > -1e-9) return this._single(T, P, z, 'L');
    // successive substitution on K_i = x1_i / x2_i with x1 the seed-rich phase
    let other = z.slice(), dmax = 0; for (const t of trials) { const d = maxAbs(t.w, best.w); if (d > dmax && d > 1e-3) { dmax = d; other = t.w; } }
    let K = best.w.map((v, i) => v / other[i]), V = 0.5, x1 = best.w, x2 = z.slice();
    for (let it = 0; it < 3000; it++) {
      const f = (v) => { let s = 0; for (let i = 0; i < n; i++) s += z[i] * (K[i] - 1) / (1 + v * (K[i] - 1)); return s; };
      let lo = 0, hi = 1; if (f(0) <= 0) { V = 0; break; } if (f(1) >= 0) { V = 1; break; }
      for (let j = 0; j < 200; j++) { V = 0.5 * (lo + hi); if (f(V) > 0) lo = V; else hi = V; }
      x2 = normed(z.map((v, i) => v / (1 + V * (K[i] - 1)))); x1 = normed(x2.map((v, i) => K[i] * v));
      const g1 = this.lnGamma(x1, T), g2 = this.lnGamma(x2, T); let err = 0; const Kn = K.slice();
      for (let i = 0; i < n; i++) { const kn = Math.exp(g2[i] - g1[i]); err = Math.max(err, Math.abs(Math.log(kn / K[i]))); Kn[i] = kn; }
      K = Kn; if (err < 1e-12) break;
    }
    if (V <= 1e-12 || V >= 1 - 1e-12 || maxAbs(x1, x2) < 1e-6) return this._single(T, P, z, 'L');
    const p1 = this.phase(T, P, x1, 'L'), p2 = this.phase(T, P, x2, 'L');
    return { T, P, z, V: 0, phases: [{ type: 'liquid', frac: V, x: x1, H: p1.H, S: p1.S, v: p1.V }, { type: 'liquid2', frac: 1 - V, x: x2, H: p2.H, S: p2.S, v: p2.V }],
      H: V * p1.H + (1 - V) * p2.H, S: V * p1.S + (1 - V) * p2.S, v: V * p1.V + (1 - V) * p2.V, state: 'liquid-liquid' };
  }

  // ---- saturation ------------------------------------------------------------------------------------------------------------
  /** r > 0 means the mixture is "more vapour" than saturated (T above / P below the saturation point). */
  _satResidual(kind, T, P, z, st) {
    const n = this.n;
    let x, y;
    if (kind === 'bubble') { x = z; y = st.y || normed(this.wilsonK(T, P).map((k, i) => k * z[i])); }
    else { y = z; x = st.x || normed(this.wilsonK(T, P).map((k, i) => z[i] / k)); }
    let s = 0, tr = 0;
    for (let it = 0; it < 300; it++) {
      const { lnK, trivial } = this.lnK(T, P, x, y); tr = trivial;
      const K = lnK.map(Math.exp);
      if (kind === 'bubble') { const t = z.map((v, i) => K[i] * v); s = sum(t); const yn = normed(t); const e = maxAbs(yn, y); y = yn; if (e < 1e-13) break; }
      else { const t = z.map((v, i) => v / K[i]); s = sum(t); const xn = normed(t); const e = maxAbs(xn, x); x = xn; if (e < 1e-13) break; }
    }
    st.x = x; st.y = y;
    if (tr !== 0 && (kind === 'bubble' || kind === 'dew')) { st.trivial = true; return tr; }
    st.trivial = false;
    return kind === 'bubble' ? s - 1 : 1 - s;
  }
  /** Bubble or dew point. kind 'bubble'|'dew'; fixed 'T' (value K → returns P) or 'P' (value Pa → returns T). → { T, P, x, y } */
  saturation(kind, fixed, value, z, guess = null) {
    z = normed(z); const st = {}, isT = fixed === 'P';       // solving for T when P is fixed
    const res = (v) => { const T = isT ? v : value, P = isT ? value : v; return { r: this._satResidual(kind, T, P, z, st), T, P }; };
    const sgn = isT ? 1 : -1;                                // r increases with T, decreases with P
    let lo = null, hi = null;                                // lo: r*sgn<0 side, hi: r*sgn>0
    const grid = [];
    if (guess) { for (let k = 0; k < 40; k++) { grid.push(guess * Math.pow(1.08, k)); grid.push(guess / Math.pow(1.08, k + 1)); } }
    else { const a = isT ? 30 : 1, b = isT ? 2500 : 1e10, f = isT ? 1.04 : 1.12; for (let v = a; v < b; v *= f) grid.push(v); }
    if (guess) {
      for (const v of grid) { const q = res(v).r * sgn; if (q < 0) { if (lo == null || Math.abs(Math.log(v / guess)) < Math.abs(Math.log(lo / guess))) lo = v; } else if (hi == null || Math.abs(Math.log(v / guess)) < Math.abs(Math.log(hi / guess))) hi = v; if (lo && hi) break; }
    } else {
      let prev = null;
      for (const v of grid) { const q = res(v).r * sgn; if (prev !== null && prev < 0 && q >= 0) { lo = prev_v(grid, v); hi = v; break; } prev = q; }
    }
    if (lo == null || hi == null) return null;
    if (lo > hi) [lo, hi] = [hi, lo];
    // bisect in the log of the variable, keeping the side signs
    const sLo = res(lo).r * sgn; let a = lo, b = hi, sa = sLo;
    for (let it = 0; it < 200; it++) {
      const m = Math.sqrt(a * b), sm = res(m).r * sgn;
      if (sm < 0) { a = m; sa = sm; } else b = m;
      if (b / a - 1 < 1e-13) break;
    }
    const v = Math.sqrt(a * b), q = res(v);
    return { T: q.T, P: q.P, x: st.x, y: st.y, kind };
  }
  bubbleT(z, P, guess) { return this.saturation('bubble', 'P', P, z, guess); }
  dewT(z, P, guess) { return this.saturation('dew', 'P', P, z, guess); }
  bubbleP(z, T, guess) { return this.saturation('bubble', 'T', T, z, guess); }
  dewP(z, T, guess) { return this.saturation('dew', 'T', T, z, guess); }

  // ---- PH, PS, and a general enthalpy helper -----------------------------------------------------------------------------------
  _solveT(P, z, target, prop, T0g, opts = {}) {
    const f = (T) => this.flashPT(T, P, z)[prop] - target;
    let a = opts.Tmin || 20, b = opts.Tmax || 3500, g = T0g && T0g > a && T0g < b ? T0g : 300;
    // bracket around the guess first (cheap), then fall back to the full range
    let fa = null, fb = null;
    for (const step of [5, 25, 100, 400, 1500]) {
      const lo = Math.max(opts.Tmin || 20, g - step), hi = Math.min(opts.Tmax || 3500, g + step), flo = f(lo), fhi = f(hi);
      if (flo <= 0 && fhi >= 0) { a = lo; b = hi; fa = flo; fb = fhi; break; }
      if (step === 1500) { a = opts.Tmin || 20; b = opts.Tmax || 3500; fa = f(a); fb = f(b); }
    }
    if (fa > 0 || fb < 0) return null;
    for (let it = 0; it < 200; it++) {
      const m = 0.5 * (a + b), fm = f(m);
      if (fm === 0) { a = b = m; break; }
      // regula falsi proposal kept inside the bracket
      let t = a - fa * (b - a) / (fb - fa); if (!(t > a && t < b)) t = m;
      const ft = f(t);
      if (ft < 0) { a = t; fa = ft; } else { b = t; fb = ft; }
      if (b - a < 1e-10 || Math.abs(ft) < 1e-9 * (Math.abs(target) + 1)) { a = b = t; break; }
    }
    return 0.5 * (a + b);
  }
  /** A pure component inside its two-phase dome has one temperature for many enthalpies: handle it as a lever rule. */
  _pureDome(P, prop, value) {
    const Ts = this._pureTsat(P); if (Ts == null) return null;
    const l = this.phase(Ts, P, [1], 'L'), v = this.phase(Ts, P, [1], 'V'), a = l[prop], b = v[prop];
    if (!(value > a && value < b)) return null;
    const V = (value - a) / (b - a);
    return { T: Ts, P, z: [1], V, phases: [{ type: 'vapor', frac: V, x: [1], H: v.H, S: v.S, v: v.V, Z: v.Z }, { type: 'liquid', frac: 1 - V, x: [1], H: l.H, S: l.S, v: l.V, Z: l.Z }],
      H: V * v.H + (1 - V) * l.H, S: V * v.S + (1 - V) * l.S, v: V * v.V + (1 - V) * l.V, state: 'two-phase' };
  }
  flashPH(P, H, z, guessT = 300, opts) { z = normed(z); if (this.n === 1) { const d = this._pureDome(P, 'H', H); if (d) return d; } const T = this._solveT(P, z, H, 'H', guessT, opts); return T == null ? null : this.flashPT(T, P, z); }
  flashPS(P, S, z, guessT = 300, opts) { z = normed(z); if (this.n === 1) { const d = this._pureDome(P, 'S', S); if (d) return d; } const T = this._solveT(P, z, S, 'S', guessT, opts); return T == null ? null : this.flashPT(T, P, z); }
  _pureDomeVF(P, vf) {
    const sat = this._pureTsat(P); if (sat == null) return null; const l = this.phase(sat, P, [1], 'L'), v = this.phase(sat, P, [1], 'V'), V = Math.max(0, Math.min(1, vf));
    return { T: sat, P, z: [1], V, phases: [{ type: 'vapor', frac: V, x: [1], H: v.H, S: v.S, v: v.V, Z: v.Z }, { type: 'liquid', frac: 1 - V, x: [1], H: l.H, S: l.S, v: l.V, Z: l.Z }], H: V * v.H + (1 - V) * l.H, S: V * v.S + (1 - V) * l.S, v: V * v.V + (1 - V) * l.V, state: V <= 0 ? 'liquid' : V >= 1 ? 'vapor' : 'two-phase' };
  }
  _pureTsat(P) { const f = this.eos ? (T) => this.eos.psat(0, T) : (T) => this.psatIdeal(0, T); let lo = 20, hi = this.c[0].Tc - 1e-6; if (f(hi) < P || f(lo) > P) return null; for (let i = 0; i < 200; i++) { const m = 0.5 * (lo + hi); if (f(m) < P) lo = m; else hi = m; if (hi - lo < 1e-11) break; } return 0.5 * (lo + hi); }
  /** Flash with a vapour fraction specified (0 = bubble, 1 = dew) at P. */
  flashPVF(P, vf, z) {
    z = normed(z); if (this.n === 1) { const pd = this._pureDomeVF(P, vf); if (pd) return pd; }
    const b = this.bubbleT(z, P), d = this.dewT(z, P); if (!b || !d) return null;
    if (vf <= 0) return this.flashPT(b.T, P, z); if (vf >= 1) return this.flashPT(d.T, P, z);
    let lo = b.T, hi = d.T;
    for (let i = 0; i < 100; i++) { const m = 0.5 * (lo + hi), f = this.flashPT(m, P, z); if (f.V < vf) lo = m; else hi = m; if (hi - lo < 1e-9) break; }
    return this.flashPT(0.5 * (lo + hi), P, z);
  }
}
function prev_v(grid, v) { const i = grid.indexOf(v); return grid[i - 1]; }

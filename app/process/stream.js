/* SPDX-License-Identifier: Apache-2.0 */
/**
 * stream.js — material streams and the unit operations that act on them (0.8 Track CH, CH.2; DOM-free, deterministic).
 * A stream is plain data (it is saved in the file, sent to a worker):
 *   { id, F (mol/s), z[] (mole fractions in the package's component order), T (K), P (Pa), H (J/mol), S (J/mol/K), vf, state, phases[{type, frac, x[]}] }
 * Every unit takes (th, ins[], params) and returns { outs[], Q (W added to the fluid), W (W of shaft work added), notes[], ... }.
 * Heat and work are signed as the fluid sees them: a heater has Q > 0, a compressor W > 0, a turbine W < 0.
 */
import { R } from './data.js';

const sum = (a) => a.reduce((s, v) => s + v, 0);
export const isZero = (s) => !(s.F > 0);

export function emptyStream(th, id = '') {
  const n = th.n; return { id, F: 0, z: new Array(n).fill(1 / n), T: 298.15, P: 1e5, H: 0, S: 0, vf: 0, state: 'empty', phases: [] };
}
export function fromFlash(F, fl, id = '') {
  return { id, F, z: fl.z.slice(), T: fl.T, P: fl.P, H: fl.H, S: fl.S, vf: fl.V, state: fl.state, phases: fl.phases.map((p) => ({ type: p.type, frac: p.frac, x: p.x.slice() })) };
}
/** A feed from flows { id: mol/s } (or F and z) at T and P. */
export function feedStream(th, spec, id = '') {
  let F, z;
  if (spec.flows) { z = th.ids.map((c) => spec.flows[c] || 0); F = sum(z); z = z.map((v) => v / F); }
  else if (spec.massFlows) { const m = th.ids.map((c, i) => (spec.massFlows[c] || 0) / th.c[i].MWkg); F = sum(m); z = m.map((v) => v / F); }
  else { F = spec.F; z = spec.z.slice(); const s = sum(z); z = z.map((v) => v / s); }
  const fl = spec.vf != null ? th.flashPVF(spec.P, spec.vf, z) : th.flashPT(spec.T, spec.P, z);
  return fromFlash(F, fl, id);
}
export const compFlows = (s) => s.z.map((v) => v * s.F);
export const enthalpyFlow = (s) => s.F * s.H;                      // W
export const massFlow = (th, s) => s.F * th.mwMix(s.z);             // kg/s
export const volFlow = (th, s) => { let v = 0; for (const p of s.phases) { const ph = th.phase(s.T, s.P, p.x, p.type === 'vapor' ? 'V' : 'L'); v += s.F * p.frac * ph.V; } return v; };   // m3/s
/** Stream from a total enthalpy flow (W) at P, guess T. */
export function atEnthalpy(th, F, z, P, Hflow, Tg, id = '') {
  const fl = th.flashPH(P, Hflow / F, z, Tg); if (!fl) throw new Error('enthalpy flash did not bracket a temperature (H = ' + (Hflow / F).toFixed(1) + ' J/mol at ' + P + ' Pa)');
  return fromFlash(F, fl, id);
}
const withId = (s, id) => ({ ...s, id });

// ---- unit operations ------------------------------------------------------------------------------------------------------------
export const UNITS = {
  mixer(th, ins, p = {}) {
    const live = ins.filter((s) => !isZero(s)), n = th.n;
    if (!live.length) return { outs: [emptyStream(th)], Q: 0, W: 0, notes: [] };
    const nf = new Array(n).fill(0); let Hf = 0, Tg = 0, Fsum = 0;
    for (const s of live) { for (let i = 0; i < n; i++) nf[i] += s.F * s.z[i]; Hf += s.F * s.H; Tg += s.F * s.T; Fsum += s.F; }
    const F = sum(nf), z = nf.map((v) => v / F), P = p.P != null ? p.P : Math.min(...live.map((s) => s.P));
    return { outs: [atEnthalpy(th, F, z, P, Hf, Tg / Fsum)], Q: 0, W: 0, notes: [] };
  },
  splitter(th, [s], p) {
    const fr = p.fractions; if (!fr) throw new Error('splitter needs fractions');
    const tot = sum(fr), outs = fr.map((f) => (isZero(s) ? emptyStream(th) : { ...s, F: s.F * f / tot, z: s.z.slice(), phases: s.phases.map((q) => ({ ...q, x: q.x.slice() })) }));
    return { outs, Q: 0, W: 0, notes: Math.abs(tot - 1) > 1e-9 ? ['split fractions summed to ' + tot + ' and were normalised'] : [] };
  },
  heater(th, [s], p) {
    if (isZero(s)) return { outs: [emptyStream(th)], Q: 0, W: 0, notes: [] };
    const P = s.P - (p.dP || 0); let out;
    if (p.Tout != null) out = fromFlash(s.F, th.flashPT(p.Tout, P, s.z));
    else if (p.dT != null) out = fromFlash(s.F, th.flashPT(s.T + p.dT, P, s.z));
    else if (p.vf != null) out = fromFlash(s.F, th.flashPVF(P, p.vf, s.z));
    else if (p.duty != null) out = atEnthalpy(th, s.F, s.z, P, s.F * s.H + p.duty, s.T);
    else throw new Error('heater needs Tout, dT, vf or duty');
    return { outs: [out], Q: s.F * (out.H - s.H), W: 0, notes: [] };
  },
  pump(th, [s], p) {
    if (isZero(s)) return { outs: [emptyStream(th)], Q: 0, W: 0, notes: [] };
    const eff = p.eff || 0.75, notes = [];
    if (s.vf > 0) notes.push('pump inlet has vapour (vapour fraction ' + s.vf.toFixed(3) + ')');
    let v = 0; for (const q of s.phases) v += q.frac * th.phase(s.T, s.P, q.x, 'L').V;
    const w = v * (p.Pout - s.P) / eff;                                     // J/mol
    const out = atEnthalpy(th, s.F, s.z, p.Pout, s.F * (s.H + w), s.T);
    return { outs: [out], Q: 0, W: s.F * w, notes, eff, idealW: s.F * v * (p.Pout - s.P) };
  },
  compressor(th, [s], p) {
    if (isZero(s)) return { outs: [emptyStream(th)], Q: 0, W: 0, notes: [] };
    const eff = p.eff || 0.75, sf = th.flashPS(p.Pout, s.S, s.z, s.T); if (!sf) throw new Error('isentropic flash failed');
    const hs = sf.H, expander = p.Pout < s.P, h = expander ? s.H + eff * (hs - s.H) : s.H + (hs - s.H) / eff;
    const out = atEnthalpy(th, s.F, s.z, p.Pout, s.F * h, sf.T);
    return { outs: [out], Q: 0, W: s.F * (h - s.H), notes: [], eff, isentropicT: sf.T, idealW: s.F * (hs - s.H) };
  },
  valve(th, [s], p) {
    if (isZero(s)) return { outs: [emptyStream(th)], Q: 0, W: 0, notes: [] };
    const P = p.Pout != null ? p.Pout : s.P - p.dP; return { outs: [atEnthalpy(th, s.F, s.z, P, s.F * s.H, s.T)], Q: 0, W: 0, notes: [] };
  },
  /** Two-phase separator. Specs: {T,P} | {P, duty (default 0 = adiabatic)} | {P, vf}. Outs: vapour, liquid. */
  flash(th, [s], p) {
    if (isZero(s)) return { outs: [emptyStream(th), emptyStream(th)], Q: 0, W: 0, notes: [] };
    const P = p.P != null ? p.P : s.P - (p.dP || 0); let fl;
    if (p.T != null) fl = th.flashPT(p.T, P, s.z);
    else if (p.vf != null) fl = th.flashPVF(P, p.vf, s.z);
    else fl = th.flashPH(P, s.H + (p.duty || 0) / s.F, s.z, s.T);
    if (!fl) throw new Error('flash drum: no solution');
    const vap = fl.phases.find((q) => q.type === 'vapor'), liq = fl.phases.filter((q) => q.type !== 'vapor');
    const mk = (q, F) => { if (!q || F <= 0) return emptyStream(th); const f = th.flashPT(fl.T, P, q.x); return fromFlash(F, f); };
    const Fv = fl.state === 'two-phase' || fl.state === 'vapor' ? s.F * fl.V : 0, Fl = s.F - Fv;
    const l = liq.length ? mk({ x: liq.length === 1 ? liq[0].x : liq[0].x }, Fl) : emptyStream(th);
    const outs = [mk(vap && Fv > 0 ? vap : null, Fv), l];
    return { outs, Q: s.F * (fl.H - s.H), W: 0, notes: fl.state === 'liquid-liquid' ? ['two liquid phases: the second is in the liquid outlet'] : [], T: fl.T, vf: fl.V };
  },
  /** Component splitter: split { id: fraction to outlet 1 }, the rest to outlet 2; both leave at T, P (or Tout1/Tout2, P). */
  compsplit(th, [s], p) {
    if (isZero(s)) return { outs: [emptyStream(th), emptyStream(th)], Q: 0, W: 0, notes: [] };
    const n = th.n, a = new Array(n).fill(0), b = new Array(n).fill(0);
    for (let i = 0; i < n; i++) { const f = p.split[th.ids[i]] ?? 0, m = s.F * s.z[i]; a[i] = m * f; b[i] = m * (1 - f); }
    const mk = (m, T) => { const F = sum(m); if (F <= 0) return emptyStream(th); const z = m.map((v) => v / F); return fromFlash(F, th.flashPT(T, p.P != null ? p.P : s.P, z)); };
    const o1 = mk(a, p.T1 != null ? p.T1 : s.T), o2 = mk(b, p.T2 != null ? p.T2 : s.T);
    return { outs: [o1, o2], Q: o1.F * o1.H + o2.F * o2.H - s.F * s.H, W: 0, notes: [] };
  },
  /** Two-stream heat exchanger. ins [hot, cold]; spec one of { hotOutT, coldOutT, duty, approach (hot out - cold in... min) } plus dPhot, dPcold. */
  hx(th, [hot, cold], p) {
    if (isZero(hot) || isZero(cold)) return { outs: [hot, cold].map((s) => (isZero(s) ? emptyStream(th) : s)), Q: 0, W: 0, notes: [] };
    const Ph = hot.P - (p.dPhot || 0), Pc = cold.P - (p.dPcold || 0);
    let ho, co, duty;
    if (p.hotOutT != null) { ho = fromFlash(hot.F, th.flashPT(p.hotOutT, Ph, hot.z)); duty = hot.F * (hot.H - ho.H); co = atEnthalpy(th, cold.F, cold.z, Pc, cold.F * cold.H + duty, cold.T); }
    else if (p.coldOutT != null) { co = fromFlash(cold.F, th.flashPT(p.coldOutT, Pc, cold.z)); duty = cold.F * (co.H - cold.H); ho = atEnthalpy(th, hot.F, hot.z, Ph, hot.F * hot.H - duty, hot.T); }
    else if (p.duty != null) { duty = p.duty; ho = atEnthalpy(th, hot.F, hot.z, Ph, hot.F * hot.H - duty, hot.T); co = atEnthalpy(th, cold.F, cold.z, Pc, cold.F * cold.H + duty, cold.T); }
    else throw new Error('heat exchanger needs hotOutT, coldOutT or duty');
    // profile check: temperatures along the duty, counter-current
    const N = 40, prof = []; let minDT = Infinity;
    for (let k = 0; k <= N; k++) {
      const q = duty * k / N, h = atEnthalpy(th, hot.F, hot.z, Ph, hot.F * hot.H - duty + q, ho.T), c = atEnthalpy(th, cold.F, cold.z, Pc, cold.F * cold.H + q, cold.T);
      prof.push([q, h.T, c.T]); minDT = Math.min(minDT, h.T - c.T);
    }
    let lm = 0, cnt = 0; const dT1 = ho.T - cold.T, dT2 = hot.T - co.T;
    lm = Math.abs(dT1 - dT2) < 1e-9 ? dT1 : (dT1 - dT2) / Math.log(dT1 / dT2);
    const notes = []; if (minDT < 0) notes.push('temperature cross: the hot side is colder than the cold side (minimum difference ' + minDT.toFixed(2) + ' K)');
    return { outs: [ho, co], Q: 0, W: 0, notes, duty, lmtd: lm, minApproach: minDT, UA: lm > 0 ? duty / lm : null, profile: prof, internalQ: duty };
  },
};
export const UNIT_TYPES = Object.keys(UNITS);

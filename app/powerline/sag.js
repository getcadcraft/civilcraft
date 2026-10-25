/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/sag.js — sag and tension of an overhead conductor (0.7 PL.3). SI throughout: m, N, kg, Pa, °C. No DOM.
 * A design aid: the method is the usual one (catenary per span, change of state on the ruling span); the load cases and
 * limits are the user's. An engineer checks the result against the standard that applies.
 *
 *   conductorLoad(c, lc)            → { wv, wh, w, iceN, dWind }   per metre: vertical (weight + ice), horizontal (wind), resultant
 *       c  = library conductor { diameter_mm, mass_kg_m, area_mm2, e_GPa, alpha_e6, rts_N }
 *       lc = load case { temp, wind_Pa (pressure on the projected diameter), ice_mm (radial), iceDensity (kg/m³, 900), windIce (bool:
 *            wind on the iced diameter, default true) }
 *   rulingSpan(spans)               √(ΣL³ / ΣL) over horizontal span lengths
 *   changeOfState(c, L, from, to)   the horizontal tension H in state `to` = { w, temp } from state `from` = { H, w, temp }
 *       (on the ruling span L: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24, solved by Newton)
 *   catenary(span, H, w)            a span { L, dz } (dz = right end − left end) → { a, x0, sag, xLow, length, Tleft, Tright, yAt(x) }
 *       a = H / w; y measured up from the left attachment; sag = the largest vertical distance from the chord
 *   solveSection(c, spans, cases, limits) → { ok, Lr, governing, ref, cases: { id → { H, w, wv, wh, spans: [catenary…], Tmax, pctRts } }, notes }
 *       limits = [{ caseId, kind: 'H' | 'T', pct (of rts) | N (a force) }]   kind H = horizontal tension, T = the largest support tension
 *       or { fixed: { caseId, H } } inside the array: the tension in that case is given (stringing to a set tension)
 *       The reference is the most restrictive limit: every limit is turned into H in the first case, the smallest wins.
 *   stringingTable(c, spans, ref, temps) → [{ temp, H, Tmax, length, spans: [{ L, sag, length }] }]   still air, no ice
 *   unbalancedIce(c, spans, ref, iceCase, bareCase) → [{ support (index between spans), dT }]   the longitudinal unbalance at each
 *       suspension support when one side is iced and the other bare (each span on its own, conservative)
 */

import { G } from './units.js';

const sq = (x) => x * x;

export function conductorLoad(c, lc) {
  const D = (c.diameter_mm || 0) / 1000;
  const t = Math.max(0, (lc?.ice_mm || 0) / 1000);
  const rhoI = lc?.iceDensity > 0 ? lc.iceDensity : 900;
  const iceArea = Math.PI * (sq(D / 2 + t) - sq(D / 2));
  const iceN = iceArea * rhoI * G;
  const wv = (c.mass_kg_m || 0) * G + iceN;
  const dWind = D + (lc?.windIce === false ? 0 : 2 * t);
  const wh = Math.max(0, lc?.wind_Pa || 0) * dWind;
  return { wv, wh, w: Math.hypot(wv, wh), iceN, dWind };
}

export function rulingSpan(spans) {
  let s3 = 0, s1 = 0;
  for (const s of spans) { const L = Math.abs(s.L); s3 += L * L * L; s1 += L; }
  return s1 > 0 ? Math.sqrt(s3 / s1) : 0;
}

const EA = (c) => (c.e_GPa || 0) * 1e9 * (c.area_mm2 || 0) * 1e-6;
const ALPHA = (c) => (c.alpha_e6 || 0) * 1e-6;

export function changeOfState(c, L, from, to) {
  const ea = EA(c), al = ALPHA(c);
  if (!(ea > 0) || !(from.H > 0) || !(L > 0)) return NaN;
  const K = ea * (sq(from.w * L) / (24 * sq(from.H)) + al * (to.temp - from.temp)) - from.H;
  const M = ea * sq(to.w * L) / 24;
  // f(H) = H³ + K·H² − M has exactly one positive root when M > 0
  const f = (H) => H * H * H + K * H * H - M;
  let H = Math.max(from.H, 1);
  for (let i = 0; i < 100; i++) {
    const fx = f(H), d = 3 * H * H + 2 * K * H;
    if (!(d > 0)) { H *= 2; continue; }
    const n = H - fx / d;
    if (!(n > 0)) { H /= 2; continue; }
    if (Math.abs(n - H) < 1e-9 * Math.max(1, H)) return n;
    H = n;
  }
  // bisection fallback
  let lo = 1e-6, hi = Math.max(1, from.H);
  while (f(hi) < 0) hi *= 2;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; }
  return (lo + hi) / 2;
}

export function catenary(span, H, w) {
  const L = Math.abs(span.L), dz = span.dz || 0;
  const a = H / w;
  // the lowest point's x (from the left end): dz = a·(cosh((L − x0)/a) − cosh(x0/a))
  const x0 = L / 2 - a * Math.asinh(dz / (2 * a * Math.sinh(L / (2 * a))));
  const y0 = -a * (Math.cosh(x0 / a) - 1);   // the lowest point's height below the left end
  const yAt = (x) => y0 + a * (Math.cosh((x - x0) / a) - 1);
  const xs = x0 + a * Math.asinh(dz / L);   // where the curve runs parallel to the chord
  const xm = Math.min(L, Math.max(0, xs));
  const sag = (dz * xm / L) - yAt(xm);
  const length = a * (Math.sinh((L - x0) / a) + Math.sinh(x0 / a));
  const Tleft = H * Math.cosh(x0 / a), Tright = H * Math.cosh((L - x0) / a);
  return { L, dz, a, x0, y0, xLow: x0, sag, length, Tleft, Tright, yAt };
}

/** Horizontal tension that gives a largest support tension T in the ruling span (level), by bisection on H. */
function hForT(T, w, Lr) {
  if (!(T > 0)) return NaN;
  let lo = 1e-6, hi = T;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (m * Math.cosh(Lr / (2 * (m / w))) > T) hi = m; else lo = m; }
  return lo;
}

export function solveSection(c, spans, cases, limits) {
  const notes = [];
  const ok = spans.length > 0 && spans.every((s) => s.L > 0) && cases.length > 0 && EA(c) > 0 && c.mass_kg_m > 0;
  if (!ok) return { ok: false, notes: [{ why: 'input' }], cases: {} };
  const Lr = rulingSpan(spans);
  const loads = new Map(cases.map((lc) => [lc.id, conductorLoad(c, lc)]));
  const caseOf = new Map(cases.map((lc) => [lc.id, lc]));
  const first = cases[0];
  const toFirst = (H, lc) => changeOfState(c, Lr, { H, w: loads.get(lc.id).w, temp: lc.temp }, { w: loads.get(first.id).w, temp: first.temp });
  const cands = [];
  for (const lim of limits || []) {
    const lc = caseOf.get(lim.caseId);
    if (!lc) { notes.push({ why: 'case', caseId: lim.caseId }); continue; }
    const w = loads.get(lc.id).w;
    let H;
    if (lim.fixed > 0) H = lim.fixed;
    else {
      const N = lim.N > 0 ? lim.N : lim.pct > 0 ? lim.pct / 100 * (c.rts_N || 0) : 0;
      if (!(N > 0)) { notes.push({ why: 'limit', caseId: lc.id }); continue; }
      H = lim.kind === 'T' ? hForT(N, w, Lr) : N;
      // T limits: the steepest span of the section decides, not the ruling span — tightened below once the cases are known
    }
    cands.push({ lim, lc, H, Hfirst: toFirst(H, lc) });
  }
  if (!cands.length) return { ok: false, Lr, notes: [...notes, { why: 'nolimit' }], cases: {} };
  const fixed = cands.find((x) => x.lim.fixed > 0);
  let gov = fixed || cands.reduce((m, x) => (x.Hfirst < m.Hfirst ? x : m));
  const build = (Hfirst) => {
    const out = {};
    for (const lc of cases) {
      const L0 = loads.get(lc.id);
      const H = lc.id === first.id ? Hfirst : changeOfState(c, Lr, { H: Hfirst, w: loads.get(first.id).w, temp: first.temp }, { w: L0.w, temp: lc.temp });
      const sp = spans.map((s) => catenary(s, H, L0.w));
      const Tmax = Math.max(...sp.map((x) => Math.max(x.Tleft, x.Tright)));
      out[lc.id] = { H, w: L0.w, wv: L0.wv, wh: L0.wh, iceN: L0.iceN, spans: sp, Tmax, pctRts: c.rts_N > 0 ? (100 * Tmax) / c.rts_N : null };
    }
    return out;
  };
  let res = build(gov.Hfirst);
  // a T limit is about the worst support of the real spans: scale down until every T limit holds (a few passes)
  if (!fixed) {
    for (let pass = 0; pass < 20; pass++) {
      let worst = 1;
      for (const x of cands) {
        if (x.lim.kind !== 'T') continue;
        const N = x.lim.N > 0 ? x.lim.N : x.lim.pct / 100 * (c.rts_N || 0);
        const r = res[x.lc.id].Tmax / N;
        if (r > worst + 1e-9) { worst = r; gov = x; }
      }
      if (worst <= 1 + 1e-9) break;
      res = build(res[first.id].H / worst);
    }
  }
  // which limits hold
  const checks = cands.map((x) => {
    const r = res[x.lc.id];
    const N = x.lim.fixed > 0 ? x.lim.fixed : x.lim.N > 0 ? x.lim.N : x.lim.pct / 100 * (c.rts_N || 0);
    const v = x.lim.kind === 'T' ? r.Tmax : r.H;
    return { caseId: x.lc.id, kind: x.lim.kind || 'H', limit: N, value: v, ok: x.lim.fixed > 0 || v <= N * (1 + 1e-6) };
  });
  return { ok: true, Lr, governing: gov.lc.id, ref: { caseId: first.id, H: res[first.id].H, w: loads.get(first.id).w, temp: first.temp }, cases: res, checks, notes };
}

export function stringingTable(c, spans, ref, temps) {
  const Lr = rulingSpan(spans);
  const w = conductorLoad(c, {}).w;
  return temps.map((temp) => {
    const H = changeOfState(c, Lr, ref, { w, temp });
    const sp = spans.map((s) => catenary(s, H, w));
    return { temp, H, Tmax: Math.max(...sp.map((x) => Math.max(x.Tleft, x.Tright))), length: sp.reduce((t, x) => t + x.length, 0),
      spans: sp.map((x) => ({ L: x.L, dz: x.dz, sag: x.sag, length: x.length, Tleft: x.Tleft, Tright: x.Tright })) };
  });
}

/** Each span on its own from the section's reference: tension with ice vs bare, at the ice case's temperature. */
export function unbalancedIce(c, spans, ref, iceCase, bareCase) {
  const wi = conductorLoad(c, iceCase).w, wb = conductorLoad(c, bareCase || { temp: iceCase.temp }).w;
  const per = spans.map((s) => {
    const Hi = changeOfState(c, Math.abs(s.L), ref, { w: wi, temp: iceCase.temp });
    const Hb = changeOfState(c, Math.abs(s.L), ref, { w: wb, temp: (bareCase || iceCase).temp });
    return { Hi, Hb };
  });
  const out = [];
  for (let i = 1; i < spans.length; i++) {
    const a = per[i - 1], b = per[i];
    out.push({ support: i, dT: Math.max(Math.abs(a.Hi - b.Hb), Math.abs(b.Hi - a.Hb)) });
  }
  return out;
}

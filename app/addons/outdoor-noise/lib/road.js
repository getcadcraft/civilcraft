/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys; the host's panels pass t() and show the language files' words. */
/**
 * road.js — road traffic sound power by CNOSSOS-EU (0.11 XE.3 phase S4, sound-11). DOM-free; lib/acoustics is canonical.
 * Method: Directive (EU) 2015/996 Annex § 2.2 (OJ L 168/5–12) as amended by Delegated Directive (EU) 2021/1226; values in cnossos-road.js. Equation numbers are the directive's.
 *
 *   roadEmission({ traffic, surface, temperature, gradient, studded, junction }) → { ok, lwPerMetre: [8], sourceHeight, perCategory, notes } | { ok: false, reason, notes }
 *     traffic      { 1: { Q, v }, 2: …, 3: …, '4a': …, '4b': … }   Q vehicles per hour (yearly average for the period), v km/h (§ 2.2.1 "Traffic flow")
 *     surface      a key of cnossos-road.js F4 (default 'reference')
 *     temperature  yearly average air temperature, °C (default 20 = τref)
 *     gradient     road slope s in % along the direction of travel (+ uphill; § 2.2.4). For a two-way flow the text asks to split it: give each direction its own call.
 *     studded      { share: Qstud,ratio, months: Ts } (eq. 2.2.7), category 1 only
 *     junction     { type: 'crossing'|'roundabout', distance: x m to the nearest intersection } (eq. 2.2.17–2.2.18)
 *   lwPerMetre  LW′,eq,line,i — the sum over categories of eq. 2.2.1, dB re 1 pW per metre, octaves 63 … 8 000 Hz
 *   perCategory { cat: { lw: [8] single vehicle LW,i,m, lwLine: [8], rolling: [8], propulsion: [8] } }
 *
 *   Parts for tests: rolling (2.2.4), propulsion (2.2.11), vehicleLw (2.2.2–2.2.3), lineLw (2.2.1), studdedCorrection (2.2.6–2.2.8), tempCorrection (2.2.10),
 *   gradientCorrection (2.2.13–2.2.16), accCorrection (2.2.17–2.2.18), surfaceRolling (2.2.19), surfacePropulsion (2.2.20).
 * Notes the result carries: a speed under 20 km/h (evaluated at 20, text under 2.2.2), a speed outside the surface's validity range (Table F-4 columns; the text gives
 * the range but no rule for outside it, so the value is used as it is and said), category 5 (no coefficients in Appendix F: refused).
 */
import { OCTAVES } from './cnossos.js';
import { CATEGORIES, REF, V_MIN, SOURCE_HEIGHT, K_TEMP, F1, F2, F3, F4 } from './cnossos-road.js';

const lg = Math.log10;
const sum = (a, b) => 10 * lg(Math.pow(10, a / 10) + Math.pow(10, b / 10));

/** eq. 2.2.6–2.2.8: studded-tyre correction per band for category 1. */
export function studdedCorrection(v, { share = 0, months = 0 } = {}) {
  const vv = Math.min(90, Math.max(50, v)), ps = share * months / 12;                                   // 2.2.6 ranges, 2.2.7
  return OCTAVES.map((_, i) => { const d = F2.a[i] + F2.b[i] * lg(vv / REF.vref); return 10 * lg((1 - ps) + ps * Math.pow(10, d / 10)); });   // 2.2.8
}
/** eq. 2.2.10: ΔLW,temp = Km (τref − τ), categories 1–3 (Km per K_TEMP), every band. */
export const tempCorrection = (m, tau) => (K_TEMP[m] ? K_TEMP[m] * (REF.tref - tau) : 0);
/** eq. 2.2.13–2.2.16: propulsion correction for slope s (%) at speed v (km/h), every band. */
export function gradientCorrection(m, s, v) {
  m = String(m);
  if (m === '1') { if (s < -6) return (Math.min(12, -s) - 6) / 1; if (s <= 2) return 0; return (Math.min(12, s) - 2) / 1.5 * v / 100; }
  if (m === '2') { if (s < -4) return (Math.min(12, -s) - 4) / 0.7 * (v - 20) / 100; if (s <= 0) return 0; return Math.min(12, s) / 1 * v / 100; }
  if (m === '3') { if (s < -4) return (Math.min(12, -s) - 4) / 0.5 * (v - 10) / 100; if (s <= 0) return 0; return Math.min(12, s) / 0.8 * v / 100; }
  return 0;                                                                                              // 2.2.16, category 4
}
/** eq. 2.2.17–2.2.18 with Table F-3: { R, P } corrections at distance x (m) from a crossing or roundabout. */
export function accCorrection(m, type, x) {
  const c = F3[String(m)]?.[type]; if (!c) return { R: 0, P: 0 };
  const f = Math.max(1 - Math.abs(x) / 100, 0);
  return { R: c.CR * f, P: c.CP * f };
}
/** eq. 2.2.19: rolling-noise surface correction per band. */
export function surfaceRolling(m, surface, v) { const s = F4[surface]; return OCTAVES.map((_, i) => s.alpha[m][i] + s.beta[m] * lg(v / REF.vref)); }
/** eq. 2.2.20: propulsion-noise surface correction per band, min(α, 0). */
export function surfacePropulsion(m, surface) { const s = F4[surface]; return OCTAVES.map((_, i) => Math.min(s.alpha[m][i], 0)); }
/** eq. 2.2.4: rolling noise per band, delta = ΔLWR per band (2.2.5). Category 4 has none (AR = BR = 0 and 2.2.3). */
export const rolling = (m, v, delta = OCTAVES.map(() => 0)) => OCTAVES.map((_, i) => F1[m].AR[i] + F1[m].BR[i] * lg(v / REF.vref) + delta[i]);
/** eq. 2.2.11: propulsion noise per band, delta = ΔLWP per band (2.2.12). */
export const propulsion = (m, v, delta = OCTAVES.map(() => 0)) => OCTAVES.map((_, i) => F1[m].AP[i] + F1[m].BP[i] * (v - REF.vref) / REF.vref + delta[i]);
/** eq. 2.2.2 (categories 1–3) and 2.2.3 (category 4: propulsion only). */
export const vehicleLw = (m, R, P) => (String(m).startsWith('4') ? P.slice() : R.map((r, i) => sum(r, P[i])));
/** eq. 2.2.1: LW′,eq,line,i,m = LW,i,m + 10 lg(Qm / (1000 vm)). */
export const lineLw = (lw, Q, v) => lw.map((L) => L + 10 * lg(Q / (1000 * v)));

export function roadEmission({ traffic = {}, surface = 'reference', temperature = REF.tref, gradient = 0, studded = null, junction = null } = {}) {
  const notes = [];
  if (!F4[surface]) return { ok: false, reason: 'surface', notes };
  const perCategory = {}, lines = [];
  for (const [key, flow] of Object.entries(traffic)) {
    const m = String(key);
    if (!CATEGORIES[m]) return { ok: false, reason: 'category', category: m, notes };
    const Q = Number(flow?.Q), v = Number(flow?.v);
    if (!(Q > 0)) continue;
    if (m === '5') return { ok: false, reason: 'category5', notes: [{ key: 'ac.road.note.cat5' }] };
    if (!(v > 0)) return { ok: false, reason: 'speed', category: m, notes };
    const ve = Math.max(V_MIN, v);                                                                         // under 20 km/h: the level of 20 km/h (text under 2.2.2, 2.2.3)
    if (v < V_MIN) notes.push({ key: 'ac.road.note.slow', category: m, v });
    const s = F4[surface];
    if (surface !== 'reference' && (v < s.vmin || v > s.vmax)) notes.push({ key: 'ac.road.note.surfacerange', category: m, v, vmin: s.vmin, vmax: s.vmax });
    const acc = junction && junction.type ? accCorrection(m, junction.type, Number(junction.distance) || 0) : { R: 0, P: 0 };
    const roadR = surfaceRolling(m, surface, ve), roadP = surfacePropulsion(m, surface);
    const stud = m === '1' && studded ? studdedCorrection(ve, studded) : OCTAVES.map(() => 0);
    const dT = tempCorrection(m, Number(temperature)), dG = gradientCorrection(m, Number(gradient) || 0, ve);
    const dR = OCTAVES.map((_, i) => roadR[i] + stud[i] + acc.R + dT);                                     // 2.2.5
    const dP = OCTAVES.map((_, i) => roadP[i] + dG + acc.P);                                               // 2.2.12
    const R = rolling(m, ve, dR), P = propulsion(m, ve, dP), lw = vehicleLw(m, R, P);
    const lwLine = lineLw(lw, Q, v);
    perCategory[m] = { Q, v, lw, lwLine, rolling: m.startsWith('4') ? null : R, propulsion: P };
    lines.push(lwLine);
  }
  if (!lines.length) return { ok: false, reason: 'notraffic', notes };
  const lwPerMetre = OCTAVES.map((_, i) => 10 * lg(lines.reduce((a, L) => a + Math.pow(10, L[i] / 10), 0)));
  return { ok: true, lwPerMetre, sourceHeight: SOURCE_HEIGHT, perCategory, notes };
}

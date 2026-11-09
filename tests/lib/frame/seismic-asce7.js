/* SPDX-License-Identifier: Apache-2.0 */
/**
 * seismic-asce7.js — the seismic design values of ASCE 7 that come before the equivalent lateral force of loads-asce7.js (0.9 SU.1056b):
 * site coefficients Fa and Fv (ASCE 7-16 Tables 11.4-1 and 11.4-2, site classes A to D), SMS, SM1, SDS, SD1, the importance factor, the response
 * modification coefficients R, Ω0 and Cd of the common systems, and the optional USGS design-maps lookup. DOM-free, imports nothing. An aid until
 * an engineer has reviewed it; not a code check. Every number is printed by at least two independent public pages (loads-sources.js: URLs and
 * the date read); what could not be confirmed is left out (UNCONFIRMED there). The standard itself is not held here.
 *
 * ASCE 7-22 has NO Fa / Fv tables (two FEMA/SEAU sources and the USGS service agree): for 7-22 give SMS and SM1 (from the USGS service
 * or a site-specific study); SDS = 2/3 SMS, SD1 = 2/3 SM1 are the same in both editions.
 *
 *   faOf(Ss, siteClass) · fvOf(S1, siteClass) → Fa, Fv (straight lines between the printed columns, flat outside them)
 *   designValues({ edition: '7-16', Ss, S1, siteClass, d1exception }) → { Fa, Fv, SMS, SM1, SDS, SD1, warnings[] } | { error }
 *   designValues({ edition: '7-22', SMS, SM1 }) → { SMS, SM1, SDS, SD1 }
 *   SYSTEMS → [{ id, label, period (key of loads-asce7 PERIOD_SYSTEMS), R, Omega0, Cd, edition }]    IE → { II: 1, IV: 1.5 } (I and III: type Ie)
 *   usgsUrl({ edition, latitude, longitude, riskCategory, siteClass, title }) → the GET address · parseUsgs(json) → { Ss, S1, SMS, SM1, SDS, SD1, TL, periods?, ordinates? } | { error }
 */
export const EDITIONS = ['7-16', '7-22'];
const SS_COLS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5];
const S1_COLS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
export const FA = Object.freeze({
  A: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8], B: [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
  C: [1.3, 1.3, 1.2, 1.2, 1.2, 1.2], D: [1.6, 1.4, 1.2, 1.1, 1.0, 1.0],
});
export const FV = Object.freeze({
  A: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8], B: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
  C: [1.5, 1.5, 1.5, 1.5, 1.5, 1.4], D: [2.4, 2.2, 2.0, 1.9, 1.8, 1.7],
});
export const SITE_CLASSES = Object.keys(FA);
export const IE = Object.freeze({ II: 1.0, IV: 1.5 });

function lerp(cols, row, x) {
  if (x <= cols[0]) return row[0];
  if (x >= cols[cols.length - 1]) return row[row.length - 1];
  for (let k = 1; k < cols.length; k++) if (x <= cols[k]) return row[k - 1] + (row[k] - row[k - 1]) * (x - cols[k - 1]) / (cols[k] - cols[k - 1]);
  return row[row.length - 1];
}
export function faOf(Ss, siteClass) { const r = FA[siteClass]; if (!r) throw new Error('site class ' + siteClass); return lerp(SS_COLS, r, Ss); }
export function fvOf(S1, siteClass) { const r = FV[siteClass]; if (!r) throw new Error('site class ' + siteClass); return lerp(S1_COLS, r, S1); }

export function designValues(p) {
  if (p.edition === '7-22') {
    if (!(p.SMS > 0) || !(p.SM1 >= 0)) return { error: 'values' };
    return { SMS: p.SMS, SM1: p.SM1, SDS: 2 / 3 * p.SMS, SD1: 2 / 3 * p.SM1, warnings: [] };
  }
  const { Ss, S1, siteClass = 'D' } = p;
  if (!SITE_CLASSES.includes(siteClass)) return { error: 'site-class' };
  if (!(Ss >= 0) || !(S1 >= 0)) return { error: 'values' };
  const warnings = [];
  const Fa = faOf(Ss, siteClass), Fv = fvOf(S1, siteClass);
  const SMS = Fa * Ss;
  let SM1 = Fv * S1;
  if (siteClass === 'D' && S1 >= 0.2) {          // 11.4.8: a site-specific study, unless SM1 is raised 50 % for every use
    if (!p.d1exception) return { error: 'site-specific', Fa, Fv, SMS };
    SM1 *= 1.5; warnings.push({ code: 'd-exception' });
  }
  return { Fa, Fv, SMS, SM1, SDS: 2 / 3 * SMS, SD1: 2 / 3 * SM1, warnings };
}

/** Systems of Table 12.2-1 with two pages for R, Ω0, Cd. `period` picks the Ct row of Table 12.8-2. */
export const SYSTEMS = Object.freeze([
  { id: 'steel-smf', label: 'Steel special moment frame', period: 'steel-mf', R: 8, Omega0: 3, Cd: 5.5, edition: '7-16' },
  { id: 'steel-omf', label: 'Steel ordinary moment frame', period: 'steel-mf', R: 3.5, Omega0: 3, Cd: 3, edition: '7-16' },
  { id: 'steel-scbf', label: 'Steel special concentrically braced frame (building frame)', period: 'other', R: 6, Omega0: 2, Cd: 5, edition: '7-16' },
  { id: 'steel-ocbf', label: 'Steel ordinary concentrically braced frame', period: 'other', R: 3.25, Omega0: 2, Cd: 3.25, edition: '7-16' },
  { id: 'steel-nd', label: 'Steel systems not specifically detailed for seismic', period: 'other', R: 3, Omega0: 3, Cd: 3, edition: '7-16' },
  { id: 'rc-smf', label: 'Reinforced concrete special moment frame', period: 'concrete-mf', R: 8, Omega0: 3, Cd: 5.5, edition: '7-16' },
  { id: 'rc-coupled-walls', label: 'Ductile coupled reinforced concrete walls', period: 'other', R: 8, Omega0: 2.5, Cd: 8, edition: '7-22' },
]);
export const systemById = (id) => SYSTEMS.find((s) => s.id === id) || null;

export function usgsUrl({ edition = '7-16', latitude, longitude, riskCategory = 'II', siteClass = 'D', title = 'CadCraft' }) {
  const q = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), riskCategory, siteClass, title });
  return 'https://earthquake.usgs.gov/ws/building-codes/asce7-' + (edition === '7-22' ? '22' : '16') + '/calculate?' + q.toString();
}

/** The answer of the service (`{ response: { data } }`) → the values the panel uses, or { error }. Null values (7-16, class D, S1 ≥ 0.2) stay null. */
export function parseUsgs(json) {
  const d = json?.response?.data;
  if (!d || typeof d !== 'object') return { error: 'usgs' };
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  const out = { Ss: num(d.ss), S1: num(d.s1), SMS: num(d.sms), SM1: num(d.sm1), SDS: num(d.sds), SD1: num(d.sd1), TL: num(d.tl) };
  const mp = d.multiPeriodDesignSpectrum;
  if (mp && Array.isArray(mp.periods) && Array.isArray(mp.ordinates) && mp.periods.length === mp.ordinates.length && mp.periods.every(Number.isFinite) && mp.ordinates.every(Number.isFinite)) { out.periods = mp.periods; out.ordinates = mp.ordinates; }
  if (out.Ss === null || out.S1 === null) return { error: 'usgs' };
  return out;
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/units.js — the power-line engine works in SI (m, N, kg, Pa, °C); the project is in feet or metres and people read
 * forces in daN / kN (metric projects) or lbf (feet projects). No DOM.
 *
 *   G                 9.80665 m/s²
 *   unitM(units)      metres per project unit (ft → 0.3048, m → 1)
 *   forceUnit(units)  'daN' | 'lbf'      toForce(N, units) → number in that unit      fromForce(v, units) → N
 */

export const G = 9.80665;
export const N_PER_DAN = 10;
export const N_PER_LBF = 4.4482216152605;
export const FT = 0.3048;

export const unitM = (units) => (units === 'm' ? 1 : FT);
export const forceUnit = (units) => (units === 'm' ? 'daN' : 'lbf');
export const toForce = (N, units) => N / (units === 'm' ? N_PER_DAN : N_PER_LBF);
export const fromForce = (v, units) => v * (units === 'm' ? N_PER_DAN : N_PER_LBF);
export const fin = (v) => typeof v === 'number' && Number.isFinite(v);
export const round = (v, d = 2) => { const p = 10 ** d; return Math.round(v * p) / p; };

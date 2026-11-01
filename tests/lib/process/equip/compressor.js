/* SPDX-License-Identifier: Apache-2.0 */
/**
 * compressor.js — compressor head, power and outlet temperature from the textbook ideal-gas relations (0.8 CH.10, chem-mount_PART_5). DOM-free, our own code from published maths; no table, no
 * outside constant (R is the gas constant of ../data.js). A calculation aid, "to be checked by an engineer", not a vendor's performance.
 *
 * Assumptions, stated in every result: an ideal gas with constant k = cp/cv and a constant compressibility Z (the value you give; 1 is the ideal gas), adiabatic compression, no inter-cooling.
 *   r = P2/P1
 *   isentropic head   Hs = Z R T1/M · k/(k−1) · ( r^((k−1)/k) − 1 )                               [J/kg]
 *   polytropic        (n−1)/n = (k−1)/(k ηp),  m = (n−1)/n,   Hp = Z R T1/M · (1/m) · ( r^m − 1 ),  T2 = T1 r^m
 *   efficiencies      ηs = ( r^((k−1)/k) − 1 ) / ( r^m − 1 )      (the ideal-gas link between the two)
 *   shaft work        w = Hs/ηs = Hp/ηp  [J/kg];   power = mdot · w
 *
 *   compressorHead({ P1, P2, T1, M, k, Z = 1, eta, kind = 'polytropic' | 'isentropic', mdot? }) → { r, m, n, etaS, etaP, Hs, Hp, work, T2, headM, power?, notes }
 *   surgeMargin(line, Q, H) is compressorPoint of network.js; `compressorSurge` here wraps it with the head converted to the map's unit.
 */
import { R } from '../data.js';
import { compressorPoint, G } from './network.js';

export function compressorHead({ P1, P2, T1, M, k, Z = 1, eta, kind = 'polytropic', mdot = null } = {}) {
  const bad = (what) => { throw new Error(what); };
  if (!(P1 > 0 && P2 > 0)) bad('P1 and P2 are absolute pressures in Pa');
  if (!(P2 > P1)) bad('this is a compressor: the discharge pressure must be above the suction pressure');
  if (!(T1 > 0)) bad('T1 is the suction temperature in K');
  if (!(M > 0)) bad('M is the molar mass in kg/mol (air 0.02897)');
  if (!(k > 1)) bad('k = cp/cv must be above 1');
  if (!(Z > 0)) bad('Z must be positive');
  if (!(eta > 0 && eta <= 1)) bad('give the efficiency as a number above 0 and up to 1');
  if (kind !== 'polytropic' && kind !== 'isentropic') bad('kind is polytropic or isentropic');
  const r = P2 / P1, a = (k - 1) / k, RT = Z * R * T1 / M, rs = Math.pow(r, a);
  const Hs = RT / a * (rs - 1);
  let etaP, etaS, m;
  if (kind === 'polytropic') { etaP = eta; m = a / etaP; etaS = (rs - 1) / (Math.pow(r, m) - 1); }
  else { etaS = eta; m = Math.log(1 + (rs - 1) / etaS) / Math.log(r); etaP = a / m; }
  const Hp = RT / m * (Math.pow(r, m) - 1), work = kind === 'polytropic' ? Hp / etaP : Hs / etaS, n = 1 / (1 - m), T2 = T1 * Math.pow(r, m);
  const notes = ['Ideal gas with constant k and Z, adiabatic, no inter-cooling. A real gas near its critical point, or a multistage machine with inter-coolers, needs an equation of state and a stage-by-stage calculation.'];
  if (Z !== 1) notes.push(`Z = ${Z} is used as given and held constant from suction to discharge.`);
  const out = { r, m, n, etaS, etaP, Hs, Hp, work, T2, headM: Hp / G, notes };
  if (mdot != null) { if (!(mdot >= 0)) bad('mdot is a mass flow in kg/s'); out.power = mdot * work; }
  return out;
}

/** The compressor's operating point against a surge line [[Q, H], …] drawn in the unit of `headUnit` ('J/kg' or 'm'); the polytropic head of the run is converted to that unit. */
export function compressorSurge(line, Q, run, headUnit = 'J/kg') {
  const H = headUnit === 'm' ? run.Hp / G : run.Hp;
  return { ...compressorPoint(line, Q, H), H, headUnit };
}

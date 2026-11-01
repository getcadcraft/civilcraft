/* SPDX-License-Identifier: Apache-2.0 */
/**
 * relief.js — relief scenarios, valve sizing and flare radiation (0.8 Track CH, CH.12; DOM-free). Gas and liquid orifice areas are derived from the ideal
 * nozzle equations (the basis of API 520 Part I); fire heat input is the published API 521 relation with its US constants converted here; the two-phase
 * omega method is Leung's published formulation (Leung 1986/1996, the method of API 520 Annex C). A drafting and study aid, "to be checked by an engineer" (O7):
 * NOT an engineering approval; the valve maker's certified Kd rules. The flare header is the gas network of ./network.js (one solver, rule 39).
 *
 *   gasArea({W, k, M, T, Z, P1, P2?, Kd, Kb, Kc})   liquidArea({Q, rho, mu?, dP, Kd, Kw, Kc})   omegaFrom(v0, v9)   twoPhaseFlux({P0, rho0, omega, Pa})   twoPhaseArea(…)
 *   fireHeat({A, F, drainage})   wettedArea(vessel)   vapourRate(Q, lambda)   thermalExpansion({Phi, beta, rho, cp})   tubeRupture(…)   orificeLetter(area)
 *   inletLoss(…)   flareRadiation({Q, tau, F, K})   flareHeader(net)
 */
import { solveNetwork } from './network.js';
import { lineDrop, friction } from '../hydraulics.js';
import { R } from '../data.js';

export const SOURCES = {
  gas: 'API 520 Part I: gas/vapour orifice area from the ideal-gas nozzle; critical-flow coefficient (2/(k+1))^((k+1)/(2(k−1))); subcritical flux by the isentropic expansion',
  liquid: 'API 520 Part I: A = Q/(Kd Kw Kc Kv) sqrt(rho/(2 dP)); Kv = (0.9935 + 2.878/Re^0.5 + 342.75/Re^1.5)^-1 (typed without the standard open: check)',
  omega: 'Leung, J. C. (1986) "A generalized correlation for one-component homogeneous equilibrium flashing choked flow", AIChE J. 32; API 520 Annex C',
  fire: 'API 521 pool-fire heat input Q = C F A^0.82 (C = 21 000 Btu/h per ft^1.64 adequate drainage and fire fighting, 34 500 otherwise) converted to SI',
  radiation: 'API 521 point-source flare radiation D = sqrt(tau F Q / (4 pi K))',
  orifices: 'API 526 standard effective orifice areas (in²) D to T',
};

const BTU_H = 0.29307107, FT = 0.3048;
const FIRE_C = (c) => c * BTU_H * Math.pow(1 / (FT * FT), 0.82);      // W per m^1.64
export const FIRE_COEFF = { adequate: FIRE_C(21000), poor: FIRE_C(34500) };

/** Gas/vapour required area (m²). W kg/s, P1 relieving pressure Pa absolute (set + overpressure + atmosphere), P2 total back pressure Pa abs (default: critical flow assumed). */
export function gasArea({ W, k, M, T, Z = 1, P1, P2 = 0, Kd = 0.975, Kb = 1, Kc = 1 }) {
  const rc = Math.pow(2 / (k + 1), k / (k - 1)), r = P2 / P1, critical = !(r > rc), notes = [];
  let flux;
  if (critical) flux = P1 * Math.sqrt(k * M / (Z * R * T)) * Math.pow(2 / (k + 1), (k + 1) / (2 * (k - 1)));
  else { flux = P1 * Math.sqrt(M / (Z * R * T)) * Math.sqrt(2 * k / (k - 1) * Math.pow(r, 2 / k) * (1 - Math.pow(r, (k - 1) / k))); notes.push('subcritical flow: the sizing used the isentropic expansion; check the valve maker\'s subcritical method (conventional valves are often limited)'); }
  const A = W / (Kd * Kb * Kc * flux); return { A, flux, critical, rc, notes, source: SOURCES.gas };
}
/** Liquid relief area (m²). Q m³/s, dP = set pressure + overpressure − back pressure (Pa). Iterates the viscosity correction. */
export function liquidArea({ Q, rho, mu = null, dP, Kd = 0.65, Kw = 1, Kc = 1 }) {
  let A = Q / (Kd * Kw * Kc) * Math.sqrt(rho / (2 * dP)), Kv = 1, Re = null;
  if (mu != null) for (let i = 0; i < 40; i++) { const Do = Math.sqrt(4 * A / Math.PI); Re = 4 * rho * Q / (Math.PI * mu * Do); Kv = 1 / (0.9935 + 2.878 / Math.sqrt(Re) + 342.75 / Math.pow(Re, 1.5)); const An = Q / (Kd * Kw * Kc * Kv) * Math.sqrt(rho / (2 * dP)); if (Math.abs(An - A) < 1e-12 * A) { A = An; break; } A = An; }
  return { A, Kv, Re, source: SOURCES.liquid };
}

/** ω from two specific volumes (m³/kg) at P0 and 0.9 P0 at constant entropy/enthalpy as the caller flashes them: ω = 9 (v9/v0 − 1). */
export const omegaFrom = (v0, v9) => 9 * (v9 / v0 - 1);
/** Critical pressure ratio ηc of the (flashing) omega method: ηc² + (ω² − 2ω)(1 − ηc)² + 2ω² ln ηc + 2ω²(1 − ηc) = 0. */
export function omegaCritical(omega) {
  const f = (e) => e * e + (omega * omega - 2 * omega) * (1 - e) ** 2 + 2 * omega * omega * Math.log(e) + 2 * omega * omega * (1 - e);
  let lo = 1e-9, hi = 1 - 1e-12; if (f(lo) * f(hi) > 0) return null;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; } return (lo + hi) / 2;
}
/** Mass flux (kg/m²/s) of a flashing two-phase mixture through a nozzle: P0 Pa, rho0 kg/m³ at P0, back pressure Pa. */
export function twoPhaseFlux({ P0, rho0, omega, Pa }) {
  const ec = omegaCritical(omega), eta = Math.max(Pa / P0, ec ?? 0), choked = ec != null && Pa / P0 <= ec;
  const G = Math.sqrt(P0 * rho0) * Math.sqrt(2 * (omega * Math.log(1 / eta) - (omega - 1) * (1 - eta))) / (omega * (1 / eta - 1) + 1);
  return { G, etaC: ec, eta, choked, source: SOURCES.omega };
}
export function twoPhaseArea({ W, P0, rho0, omega, Pa, Kd = 0.85, Kb = 1, Kc = 1 }) { const f = twoPhaseFlux({ P0, rho0, omega, Pa }); return { A: W / (Kd * Kb * Kc * f.G), ...f }; }

/** Heat absorbed by a wetted vessel in a pool fire: W. F the environment factor (1 bare vessel; <1 with credit-worthy insulation). */
export function fireHeat({ A, F = 1, drainage = 'adequate' }) {
  const c = FIRE_COEFF[drainage]; if (!c) throw new Error("drainage: 'adequate' (drainage and prompt fire fighting) or 'poor'");
  const notes = []; if (A > 260) notes.push('wetted area above about 260 m²: API 521 gives other coefficients for large areas (not applied)');
  return { Q: c * F * Math.pow(A, 0.82), coeff: c, notes, source: SOURCES.fire };
}
/** Wetted surface (m²) of a vessel to a given height above the fire source (default 7.6 m = 25 ft), liquid level included. cyl: { type: 'vertical'|'horizontal', D, L (tan-tan), liquidLevel (m from the bottom tangent), headFactor (area/D², 2:1 ellipsoidal 1.084) } */
export function wettedArea({ type, D, L, liquidLevel, headFactor = 1.084, fireHeight = 7.6 }) {
  const top = Math.min(liquidLevel, fireHeight);
  if (type === 'vertical') { const cyl = Math.PI * D * Math.max(0, Math.min(top, L)); return cyl + headFactor * D * D; }
  const r = D / 2, h = Math.min(top, D), th = 2 * Math.acos(1 - h / r);       // horizontal: segment of the circumference wetted
  return r * th * L + 2 * headFactor * D * D * (h / D);                       // heads wetted in proportion to the level (approximation)
}
export const vapourRate = (Q, lambda) => Q / lambda;
/** Trapped liquid, thermal expansion: volumetric relief rate q = beta Phi / (rho cp), m³/s (beta 1/K, Phi W). */
export const thermalExpansion = ({ Phi, beta, rho, cp }) => beta * Phi / (rho * cp);
/** Tube rupture: liquid or gas through two tube ends (double-ended), orifice flow with discharge coefficient Cd. High pressure side Ph, low Pl (Pa). → m³/s (liquid) */
export function tubeRupture({ di, nEnds = 2, Ph, Pl, rho, Cd = 0.61 }) { const A = nEnds * Math.PI * di * di / 4; return { Q: Cd * A * Math.sqrt(2 * (Ph - Pl) / rho), A }; }
/** API 526 effective orifice areas. */
export const ORIFICES = { D: 0.110, E: 0.196, F: 0.307, G: 0.503, H: 0.785, J: 1.287, K: 1.838, L: 2.853, M: 3.60, N: 4.34, P: 6.38, Q: 11.05, R: 16.0, T: 26.0 };   // in²
export function orificeLetter(areaM2) { const a = areaM2 / (0.0254 * 0.0254); for (const [k, v] of Object.entries(ORIFICES)) if (v >= a) return { letter: k, area: v * 0.0254 * 0.0254, source: SOURCES.orifices }; return { letter: null, area: null, notes: ['larger than orifice T: use more than one valve'] }; }
/** The inlet line loss to a valve must stay under 3 % of the set pressure (API 520 Part II). */
export function inletLoss({ fluid, line, Pset }) { const r = lineDrop(fluid, line); return { dp: r.dp, fraction: r.dp / Pset, ok: r.dp <= 0.03 * Pset, v: r.v }; }

/** Radiation distance: D = sqrt(tau F Q / (4 pi K)); Q heat release W, F radiant fraction (0.1–0.4 by gas; the caller's), tau transmissivity (≤ 1), K allowable W/m². */
export const flareRadiation = ({ Q, tau = 1, F = 0.2, K = 4730 }) => ({ D: Math.sqrt(tau * F * Q / (4 * Math.PI * K)), source: SOURCES.radiation });
/** Radiation at distance d from the flame centre (W/m²). */
export const radiationAt = ({ Q, tau = 1, F = 0.2, d }) => tau * F * Q / (4 * Math.PI * d * d);
export const FLARE_K = { 'continuous': 1580, 'few-minutes': 4730, 'one-minute-ish': 6310, 'short-emergency': 9460 };    // W/m², API 521 table values (typed without the standard open: check)

/**
 * Flare header: a gas network where the relief valves put mass flow in (demand negative) and the flare tip is a fixed-pressure node.
 * net = same as solveNetwork with fluid.kind 'gas'. Returns the network solution plus, for each node named in `valves`, the back pressure and its fraction of the set pressure.
 */
export function flareHeader(net, valves = []) {
  const r = solveNetwork(net), problems = r.problems.slice();
  const bp = valves.map((v) => { const Pb = r.nodes[v.node].P, f = (Pb - 101325) / v.set; if (f > (v.limit ?? 0.1)) problems.push({ id: 'process:relief.backpressure:' + v.node, code: 'relief.backpressure', severity: 'error', text: `Valve at ${v.node}: back pressure ${(Pb / 1e3).toFixed(0)} kPa abs is ${(100 * f).toFixed(0)} % of the set pressure (limit ${(100 * (v.limit ?? 0.1)).toFixed(0)} % for a conventional valve).`, about: [{ id: v.node }], source: { kind: 'engine', name: 'process' } }); return { node: v.node, Pback: Pb, fraction: f }; });
  return { ...r, backPressures: bp, problems };
}


// ---- 0.8 CH.12 (owner 2026-10-29: ship in /lab marked "not engineer-reviewed"): steam, rupture discs, the outlet line and the thrust ------------------------------------
const LB = 0.45359237, PSI = 6894.757293, IN2 = 0.00064516;
/**
 * Steam relief area (m²), API 520 Part I steam equation in US units converted: A[in²] = W[lb/h] / (51.5 P1[psia] Kd Kb Kc Kn Ksh).
 * Kn corrects the Napier equation above 1515 psia: Kn = (0.1906 P1 − 1000) / (0.2292 P1 − 1061) up to 3200 psia (typed without the standard open: check). Ksh, the superheat correction,
 * is read from the standard's table by the person (1 for saturated steam). W kg/s, P1 Pa absolute relieving pressure.
 */
export function steamArea({ W, P1, Kd = 0.975, Kb = 1, Kc = 1, Ksh = 1 }) {
  const Wl = W * 3600 / LB, P = P1 / PSI, notes = [];
  let Kn = 1;
  if (P > 1500) { if (P > 3200) throw new Error('steam above 3200 psia (22 MPa) is outside the equation'); Kn = (0.1906 * P - 1000) / (0.2292 * P - 1061); notes.push('Napier correction Kn = ' + Kn.toFixed(4) + ' applied above 1500 psia'); }
  if (Ksh === 1) notes.push('Ksh = 1: right for saturated steam; for superheated steam read Ksh from the standard\'s table and give it');
  const Ain = Wl / (51.5 * P * Kd * Kb * Kc * Kn * Ksh);
  return { A: Ain * IN2, Kn, Ksh, notes, source: 'API 520 Part I steam: A = W / (51.5 P1 Kd Kb Kc Kn Ksh), US units converted' };
}
/**
 * Rupture disc in series with the valve (disc upstream): the combination capacity factor Kc is 0.9 unless the maker's certified combination gives another (1.0 when there is no disc).
 * combination: 'none' (no disc) | 'uncertified' (0.9) | { certified: value } (the maker's number, 0.5 to 1).
 */
export function discKc(combination = 'none') {
  if (combination === 'none') return { Kc: 1, notes: [] };
  if (combination === 'uncertified') return { Kc: 0.9, notes: ['0.9 is the combination factor when the valve and disc combination is not certified (API 520 Part I): a certified pair may justify a higher value'] };
  if (combination && typeof combination === 'object' && combination.certified > 0.5 && combination.certified <= 1) return { Kc: combination.certified, notes: ['Kc is the maker\'s certified combination value'] };
  throw new Error("combination: 'none' | 'uncertified' | { certified: 0.5…1 }");
}
/** Reaction force (N) on the outlet of a valve discharging a sonic gas jet to the atmosphere: F = W v + (Pe − Pa) A, v the sonic velocity at the exit temperature 2T/(k+1). */
export function reactionForce({ W, k, M, T, Z = 1, P1, Ae, Pa = 101325 }) {
  const v = Math.sqrt(2 * k * Z * R * T / ((k + 1) * M)), Pe = P1 * Math.pow(2 / (k + 1), k / (k - 1)), F = W * v + (Pe - Pa) * Ae;
  return { F, v, Pe, notes: ['open discharge to atmosphere with sonic flow at the exit area; a closed discharge header has a different thrust (API 520 Part II, 4.2.2)'], source: 'momentum balance on the discharge: F = W v + (Pe − Pa) Ae' };
}
/**
 * Outlet line back pressure: gas of mass flow W through a pipe (inside diameter D m, length L m, fittings K) to a downstream pressure Pdown (Pa abs), isothermal compressible flow:
 * P1² − P2² = (G² Z R T / M) (f L/D + K + 2 ln(P1/P2)). Returns the pressure at the valve outlet, its fraction of the set pressure, and the exit Mach number.
 */
export function outletLine({ W, k = 1.4, M, T, Z = 1, D, L, K = 0, Pdown, Pset = null, rough = 4.6e-5, mu = 1.5e-5 }) {
  const A = Math.PI * D * D / 4, G = W / A, Re = G * D / mu, f = friction(Re, rough / D);
  let P1 = Pdown * 1.05, notes = [];
  for (let i = 0; i < 200; i++) {
    const rhs = G * G * Z * R * T / M * (f * L / D + K + 2 * Math.log(P1 / Pdown)), Pn = Math.sqrt(Pdown * Pdown + rhs);
    if (Math.abs(Pn - P1) < 1e-6 * P1) { P1 = Pn; break; } P1 = Pn;
  }
  const rho2 = Pdown * M / (Z * R * T), v2 = G / rho2, c = Math.sqrt(k * Z * R * T / M), mach = v2 / c;
  if (mach >= 1) notes.push('the exit would be sonic: the downstream pressure is not what the pipe can deliver (choked outlet); enlarge the pipe or lower the flow');
  const frac = Pset ? (P1 - 101325) / Pset : null;
  return { P1, mach, f, Re, v2, fractionOfSet: frac, ok: mach < 1 && (frac == null || frac <= 0.1), notes, source: 'isothermal compressible pipe flow (Darcy), friction by Colebrook as hydraulics.js' };
}

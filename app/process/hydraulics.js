/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hydraulics.js — single-line pressure drop, velocity and erosion screening, and the `pipe` flowsheet unit (0.8 Track CH, CH.4; DOM-free).
 * This is what reruns when a pipe size changes in 3D: the P&ID's line data and the stream table take the numbers from here.
 *
 *   friction(Re, relRough)       Darcy friction factor: laminar 64/Re (Re < 2300), turbulent Swamee–Jain (1976, explicit), blended between 2300 and 4000
 *   colebrook(Re, relRough)      the implicit Colebrook–White equation by fixed-point iteration (to check Swamee–Jain against)
 *   NPS_SCH40                    ASME B36.10M schedule 40 outside diameter and wall for NPS 1/2 … 24 (inches; typed from the table, flagged `check`)
 *   insideDiameter(nps|mm)       inside diameter in metres from a nominal size ("4", "1-1/2", "4in", "100mm") or a plain number of millimetres
 *   K_FITTINGS                   typical loss coefficients for common fittings (screening values: a person's own spec overrides them)
 *   lineDrop(fluid, line)        → { v, Re, f, dp, dpFriction, dpFittings, dpStatic, rhoV2, erosional, ... } for one line
 *   erosionalVelocity(rho)       API RP 14E: v_e = C / sqrt(rho) with C = 100 (continuous service), rho in lb/ft3, v_e in ft/s; SI here
 *   pipeUnit(th, [s], p)         the flowsheet unit `pipe`: p = { D (m) | nps, L (m), eps?, K?, fittings?, dz?, mu? } → outlet at P − dp, same T (no heat exchange)
 *
 * Viscosity is not in the component data. Every result says when it used the assumed default (liquid 1 mPa s, gas 15 µPa s): give `mu` on the
 * line or the unit for a real figure. Two-phase flow is treated with the homogeneous mixture as a screening estimate and says so.
 */
import { UNITS, volFlow, massFlow, isZero, fromFlash, emptyStream } from './stream.js';

const G = 9.80665;
export const MU_ASSUMED = { liquid: 1e-3, gas: 1.5e-5 };
export const EPS_COMMERCIAL_STEEL = 4.6e-5;   // m, the usual commercial-steel roughness of the Moody chart

/** Inches: outside diameter and schedule 40 wall, ASME B36.10M. Typed without the standard open: `check` stays true until an engineer compares them. */
export const NPS_SCH40 = {
  '1/2': [0.840, 0.109], '3/4': [1.050, 0.113], '1': [1.315, 0.133], '1-1/4': [1.660, 0.140], '1-1/2': [1.900, 0.145], '2': [2.375, 0.154],
  '2-1/2': [2.875, 0.203], '3': [3.500, 0.216], '4': [4.500, 0.237], '6': [6.625, 0.280], '8': [8.625, 0.322], '10': [10.750, 0.365],
  '12': [12.750, 0.406], '14': [14.000, 0.437], '16': [16.000, 0.500], '18': [18.000, 0.562], '20': [20.000, 0.593], '24': [24.000, 0.687],
};
export const NPS_CHECK = true;
export const NPS_LIST = Object.keys(NPS_SCH40);

/** Typical K (velocity heads) of fittings: rules of thumb for a screening estimate, not a vendor's data. */
export const K_FITTINGS = { elbow90: 0.75, elbow45: 0.35, tee_run: 0.4, tee_branch: 1.0, gate_open: 0.2, globe_open: 6.0, ball_open: 0.1, check_swing: 2.0, butterfly_open: 0.5, entrance: 0.5, exit: 1.0, strainer: 2.0, orifice_meter: 1.5 };

/** Nominal size text → key in NPS_SCH40 or null. Accepts "4", '4"', "4in", "1-1/2", "1 1/2", 'NPS 4'. */
export function npsKey(text) {
  const s = String(text ?? '').toLowerCase().replace(/nps|inch(es)?|in\b|"|”/g, '').replace(/\s+/g, ' ').trim().replace(/^(\d+) (\d\/\d)$/, '$1-$2');
  return Object.prototype.hasOwnProperty.call(NPS_SCH40, s) ? s : null;
}
/** Inside diameter in metres: { nps } / "4" / '100mm' / a number of millimetres. null when it cannot be read. */
export function insideDiameter(size) {
  if (size == null || size === '') return null;
  if (typeof size === 'number') return Number.isFinite(size) && size > 0 ? size / 1000 : null;
  const mm = /^\s*(\d+(?:\.\d+)?)\s*mm\s*$/i.exec(String(size)); if (mm) return Number(mm[1]) / 1000;
  const k = npsKey(size); if (!k) return null;
  const [od, w] = NPS_SCH40[k]; return (od - 2 * w) * 0.0254;
}
export const nominalOf = (size) => npsKey(size) || (insideDiameter(size) ? String(size).trim() : null);

/** Colebrook–White: 1/√f = −2 log10( ε/(3.7 D) + 2.51/(Re √f) ). */
export function colebrook(Re, rr) {
  let x = 1 / Math.sqrt(0.02);
  for (let i = 0; i < 100; i++) { const xn = -2 * Math.log10(rr / 3.7 + 2.51 * x / Re); if (Math.abs(xn - x) < 1e-13) { x = xn; break; } x = xn; }
  return 1 / (x * x);
}
/** Swamee–Jain: f = 0.25 / [log10( ε/(3.7 D) + 5.74/Re^0.9 )]². */
export const swameeJain = (Re, rr) => 0.25 / Math.pow(Math.log10(rr / 3.7 + 5.74 / Math.pow(Re, 0.9)), 2);
export function friction(Re, rr = 0) {
  if (!(Re > 0)) return 0;
  const lam = 64 / Re;
  if (Re < 2300) return lam;
  const turb = (r) => swameeJain(r, rr);
  if (Re >= 4000) return turb(Re);
  const w = (Re - 2300) / 1700; return (1 - w) * 64 / 2300 + w * turb(4000);
}

/** v_e in m/s, API RP 14E with C = 100 (rho in kg/m3). */
export const erosionalVelocity = (rho, C = 100) => (C * 0.3048) / Math.sqrt(rho * 0.062427961);

/**
 * One line. fluid = { rho (kg/m3), mu? (Pa s), mdot (kg/s), phase: 'liquid'|'gas'|'two-phase' }.
 * line = { D (m), L (m), eps?, K?, fittings?: { name: count }, dz? (m rise, + up) }.
 */
export function lineDrop(fluid, line) {
  const D = line.D, A = Math.PI * D * D / 4, notes = [];
  const rho = fluid.rho, Q = fluid.mdot / rho, v = Q / A;
  let mu = fluid.mu;
  if (!(mu > 0)) { mu = fluid.phase === 'gas' ? MU_ASSUMED.gas : MU_ASSUMED.liquid; notes.push('viscosity assumed: ' + (mu * 1000).toPrecision(2) + ' mPa s'); }
  if (fluid.phase === 'two-phase') notes.push('two-phase: homogeneous mixture, screening estimate only');
  const Re = rho * v * D / mu, eps = line.eps ?? EPS_COMMERCIAL_STEEL, f = friction(Re, eps / D);
  let K = line.K || 0;
  for (const [name, n] of Object.entries(line.fittings || {})) { const k = K_FITTINGS[name]; if (k == null) notes.push('unknown fitting ' + name + ' ignored'); else K += k * n; }
  const dpFriction = f * (line.L || 0) / D * rho * v * v / 2, dpFittings = K * rho * v * v / 2, dpStatic = rho * G * (line.dz || 0);
  return { v, Q, Re, f, K, dp: dpFriction + dpFittings + dpStatic, dpFriction, dpFittings, dpStatic, rhoV2: rho * v * v, erosional: erosionalVelocity(rho), mu, notes };
}

/** The fluid of a solved stream, in the terms lineDrop wants. */
export function fluidOf(th, s, mu) {
  const mdot = massFlow(th, s), q = volFlow(th, s), rho = q > 0 ? mdot / q : 0;
  return { rho, mdot, mu, phase: s.vf >= 0.999 ? 'gas' : s.vf <= 0.001 ? 'liquid' : 'two-phase' };
}

/** The `pipe` unit. Gas is solved with the density at the mean pressure (ideal-gas scaling, isothermal), so a long gas line gets its density right. */
export function pipeUnit(th, [s], p = {}) {
  if (isZero(s)) return { outs: [emptyStream(th)], Q: 0, W: 0, notes: [] };
  const D = p.D ?? insideDiameter(p.nps ?? p.size);
  if (!(D > 0)) throw new Error('pipe needs D (m) or a nominal size nps');
  const base = fluidOf(th, s, p.mu), line = { D, L: p.L ?? 0, eps: p.eps, K: p.K, fittings: p.fittings, dz: p.dz };
  let r = lineDrop(base, line), Pout = s.P - r.dp;
  if (base.phase !== 'liquid') {
    for (let i = 0; i < 40; i++) {
      const Pm = Math.max(1e3, (s.P + Pout) / 2), rho = base.rho * Pm / s.P, rr = lineDrop({ ...base, rho }, line), Pn = s.P - rr.dp;
      r = rr; if (Math.abs(Pn - Pout) < 1e-6 * s.P) { Pout = Pn; break; } Pout = Pn;
    }
  }
  const notes = [...r.notes];
  if (!(Pout > 0)) { notes.push('the line cannot pass this flow: the drop is larger than the inlet pressure'); throw new Error(notes[notes.length - 1]); }
  const out = fromFlash(s.F, th.flashPT(s.T, Pout, s.z));
  return { outs: [out], Q: 0, W: 0, notes, dP: s.P - Pout, v: r.v, Re: r.Re, f: r.f, erosional: r.erosional, D };
}
UNITS.pipe = pipeUnit;

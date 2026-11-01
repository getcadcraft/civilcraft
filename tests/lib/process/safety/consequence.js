/* SPDX-License-Identifier: Apache-2.0 */
/**
 * consequence.js — screening consequence models (0.8 Track CH, CH.16; DOM-free). Published equations only, each listed in SOURCES with `check: 'not confirmed'`:
 * they were typed from public secondary sources WITHOUT the book open. A screening aid for drawing zones on a site plan; NOT a substitute for a consequence-modelling
 * study, and not an engineering approval. Nothing here claims what a person would be harmed by: endpoints and probit constants are the person's inputs.
 *
 *   Source terms   liquidRelease · gasRelease · flashFraction · poolArea · poolEvaporation
 *   Dispersion     sigma · plumeConc · plumeReach · plumeFootprint · isDense   (the ONE plume core lives in ../env/plume.js, re-exported here)
 *   Fire           jetFire · poolFire (Thomas flame height, point-source radiation) · radiationDistance
 *   Explosion      tntEquivalent · blastOverpressure (Kinney-Graham) · blastDistance
 *   Toxic          probit · probitToProbability · toxicReach
 *   Cases          runCase(case) → { results, zones, problems }   cleanCases(raw)
 *
 * NOT built (listed so nobody assumes): heavy-gas dispersion (Britter-McQuaid charts), multi-energy and Baker-Strehlow blast curves (need the printed charts), BLEVE and fireball,
 * two-phase source terms with rainout, instantaneous puffs, obstacles and terrain, indoor releases.
 */
import { str, num, pos, oneOf, problem, DISCLAIMER } from './common.js';
import { R } from '../data.js';
import { SOURCES as PLUME_SOURCES } from '../env/plume.js';

export const SOURCES = {
  liquid: 'Bernoulli orifice: m = Cd A rho sqrt(2 dP/rho + 2 g h)',
  gas: 'Isentropic orifice: choked when P0/Pa >= ((k+1)/2)^(k/(k-1)), m = Cd A P0 sqrt(k M/(Z R T) (2/(k+1))^((k+1)/(k-1))); else the subsonic form',
  flash: 'Adiabatic flash fraction F = 1 - exp(-cp (T - Tb)/hfg) (CCPS Guidelines for Consequence Analysis form)',
  evaporation: 'Mackay and Matsugu (1973): kg = 0.004786 U^0.78 d^-0.11 Sc^-0.67 (m/s), E = kg A M Pv/(R T)',
  briggs: PLUME_SOURCES.briggs,
  plume: PLUME_SOURCES.plume,
  thomas: 'Thomas (1963) flame height H/D = 42 (m\'\'/(rho_a sqrt(g D)))^0.61',
  point: 'Point-source radiation q = tau chi Q/(4 pi r^2)',
  kinney: 'Kinney and Graham (1985): Ps/Pa = 808 (1+(Z/4.5)^2) / sqrt((1+(Z/0.048)^2)(1+(Z/0.32)^2)(1+(Z/1.35)^2)), Z = R/W^(1/3) in m/kg^(1/3)',
  tnt: 'TNT equivalence W = eta M dHc / E_TNT (eta and E_TNT are inputs; 4.184e6 J/kg is the usual convention)',
  probit: 'Probit Pr = a + b ln(C^n t); probability = Phi(Pr - 5) (a, b, n are the person\'s)',
};
export const REVIEW = { state: 'not confirmed', note: 'Typed without the sources open. Each equation is exercised against a closed form in tools/process-test/test-safety.mjs, not against a printed worked example.' };
export const STABILITY = ['A', 'B', 'C', 'D', 'E', 'F'];
const G = 9.80665, P_ATM = 101325, M_AIR = 0.028964;

// ---- source terms -------------------------------------------------------------------------------------------------------------------
/** Liquid through a hole. dP gauge Pa over the outside, h liquid head above the hole (m). → { mdot kg/s, v m/s } */
export function liquidRelease({ A, d, Cd = 0.61, rho, dP = 0, h = 0 }) {
  const a = A ?? (d ? Math.PI * d * d / 4 : 0); if (!(a > 0) || !(rho > 0)) throw new Error('Liquid release needs a hole area (or diameter) and a density.');
  const v = Math.sqrt(Math.max(0, 2 * dP / rho + 2 * G * h)); return { mdot: Cd * a * rho * v, v, A: a };
}
/** Gas through a hole, P0 and Pa absolute (Pa). Cd defaults to 1 (the conservative value; a person may lower it). */
export function gasRelease({ A, d, Cd = 1, P0, Pa = P_ATM, T, M, k = 1.4, Z = 1 }) {
  const a = A ?? (d ? Math.PI * d * d / 4 : 0); if (!(a > 0) || !(P0 > 0) || !(T > 0) || !(M > 0) || !(k > 1)) throw new Error('Gas release needs area (or diameter), P0, T, M and k > 1.');
  if (P0 <= Pa) return { mdot: 0, choked: false, ratio: Pa / P0 };
  const crit = Math.pow((k + 1) / 2, k / (k - 1)), choked = P0 / Pa >= crit;
  if (choked) return { mdot: Cd * a * P0 * Math.sqrt(k * M / (Z * R * T) * Math.pow(2 / (k + 1), (k + 1) / (k - 1))), choked, ratio: Pa / P0 };
  const r = Pa / P0; return { mdot: Cd * a * P0 * Math.sqrt(2 * M / (Z * R * T) * k / (k - 1) * (Math.pow(r, 2 / k) - Math.pow(r, (k + 1) / k))), choked, ratio: r };
}
/** Fraction of a pressurised liquid that flashes to vapour on release to atmosphere (0 if T <= Tb). cp J/kg K, hfg J/kg. */
export function flashFraction({ cp, T, Tb, hfg }) { if (!(cp > 0 && hfg > 0)) throw new Error('Flash needs cp and the heat of vaporisation.'); return T <= Tb ? 0 : 1 - Math.exp(-cp * (T - Tb) / hfg); }
/** Pool area (m²) from a volume spilt: thin-layer limit hMin (m, the person's), capped by a bund area when given. */
export function poolArea({ volume, hMin, bund }) { if (!(volume > 0) || !(hMin > 0)) throw new Error('A pool needs a volume and a minimum depth.'); const a = volume / hMin; return bund > 0 ? Math.min(a, bund) : a; }
/** Evaporation from a pool, kg/s. U wind m/s at about 10 m, Pv Pa, Sc the vapour's Schmidt number in air (the person's). */
export function poolEvaporation({ area, U, Pv, M, T, Sc }) {
  if (!(area > 0 && U >= 0 && Pv >= 0 && M > 0 && T > 0 && Sc > 0)) throw new Error('Evaporation needs area, wind, vapour pressure, M, T and Sc.');
  const d = Math.sqrt(4 * area / Math.PI), kg = 0.004786 * Math.pow(Math.max(U, 0.1), 0.78) * Math.pow(d, -0.11) * Math.pow(Sc, -0.67);
  return { mdot: kg * area * M * Pv / (R * T), kg, d };
}

// ---- dispersion ---------------------------------------------------------------------------------------------------------------------
// One copy: lib/process/env/plume.js (moved there by chem-env_PART_3 so CH.19 shares it). Re-exported under the same names.
import { sigma, plumeConc, plumeReach, plumeFootprint, isDense } from '../env/plume.js';
export { sigma, plumeConc, plumeReach, plumeFootprint, isDense };

// ---- fire ---------------------------------------------------------------------------------------------------------------------------
/** Heat release W of a burning rate mdot kg/s with heat of combustion dHc J/kg. */
export const heatRelease = (mdot, dHc) => mdot * dHc;
/** Radiation distance (m) from the point source to the flux level q (W/m²): r = sqrt(tau chi Q/(4 pi q)). chi (radiative fraction) and tau (transmissivity) are the person's. */
export function radiationDistance({ Q, chi, tau = 1, q }) { if (!(Q > 0 && chi > 0 && q > 0)) throw new Error('Radiation distance needs Q, the radiative fraction chi and the flux level q.'); return Math.sqrt(tau * chi * Q / (4 * Math.PI * q)); }
export const fluxAt = ({ Q, chi, tau = 1, r }) => tau * chi * Q / (4 * Math.PI * r * r);
/** Jet fire: heat release and the distance to each flux level (m, from the release point). */
export function jetFire({ mdot, dHc, chi, tau = 1, levels }) { const Q = heatRelease(mdot, dHc); return { Q, distances: levels.map((q) => ({ q, r: radiationDistance({ Q, chi, tau, q }) })) }; }
/** Pool fire: D pool diameter (m), mPrime burning flux kg/(m² s) (the person's, from the fuel), flame height by Thomas, point source at mid-height; ground distances to each level. */
export function poolFire({ D, mPrime, dHc, chi, tau = 1, levels, rhoAir = 1.2 }) {
  if (!(D > 0 && mPrime > 0)) throw new Error('A pool fire needs a diameter and a burning flux.');
  const H = 42 * D * Math.pow(mPrime / (rhoAir * Math.sqrt(G * D)), 0.61), area = Math.PI * D * D / 4, Q = mPrime * area * dHc;
  return { H, Q, mdot: mPrime * area, distances: levels.map((q) => { const r = radiationDistance({ Q, chi, tau, q }), h = H / 2; return { q, r, ground: r > h ? Math.sqrt(r * r - h * h) : 0 }; }) };
}

// ---- explosion ----------------------------------------------------------------------------------------------------------------------
/** TNT-equivalent mass (kg). eta is the yield fraction the person justifies; no default is given. */
export function tntEquivalent({ m, dHc, eta, eTNT = 4.184e6 }) { if (!(m > 0 && dHc > 0 && eta > 0 && eta <= 1)) throw new Error('TNT equivalence needs mass, dHc and an explicit yield eta between 0 and 1.'); return eta * m * dHc / eTNT; }
/** Side-on overpressure (Pa) at R metres from W kg TNT (Kinney-Graham). */
export function blastOverpressure(W, Rm, Pa = P_ATM) { if (!(W > 0 && Rm > 0)) return 0; const Z = Rm / Math.cbrt(W); return Pa * 808 * (1 + (Z / 4.5) ** 2) / Math.sqrt((1 + (Z / 0.048) ** 2) * (1 + (Z / 0.32) ** 2) * (1 + (Z / 1.35) ** 2)); }
/** Distance (m) at which the overpressure falls to P (Pa); monotone, found by bisection. */
export function blastDistance(W, P, Pa = P_ATM) { if (!(W > 0 && P > 0)) return 0; let lo = 0.01, hi = 1e5; if (blastOverpressure(W, lo, Pa) < P) return 0; for (let i = 0; i < 80; i++) { const m = Math.sqrt(lo * hi); if (blastOverpressure(W, m, Pa) >= P) lo = m; else hi = m; } return lo; }

// ---- toxic --------------------------------------------------------------------------------------------------------------------------
export const probit = ({ a, b, n, C, t }) => a + b * Math.log(Math.pow(C, n) * t);
const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
export const probitToProbability = (pr) => 0.5 * (1 + erf((pr - 5) / Math.SQRT2));
/** Distance to a toxic endpoint concentration (kg/m³) for the plume. */
export const toxicReach = (plume, Cend) => plumeReach(plume, Cend);

// ---- cases --------------------------------------------------------------------------------------------------------------------------
const KINDS = ['jetfire', 'poolfire', 'vce', 'toxic', 'flammable'];
export function cleanCases(raw) {
  return (Array.isArray(raw) ? raw : []).slice(0, 300).filter((c) => c && typeof c === 'object').map((c, i) => {
    const o = { id: str(c.id, 16) || 'C' + (i + 1), name: str(c.name, 120), kind: oneOf(c.kind, KINDS, 'jetfire'), at: { x: num(c.at?.x) ?? 0, y: num(c.at?.y) ?? 0, z: num(c.at?.z) ?? 0 }, node: str(c.node, 16), source: str(c.source, 24) };
    o.params = {}; for (const [k, v] of Object.entries(c.params && typeof c.params === 'object' ? c.params : {}).slice(0, 40)) if (typeof v === 'number' && Number.isFinite(v)) o.params[str(k, 20)] = v; else if (typeof v === 'string') o.params[str(k, 20)] = str(v, 40); else if (Array.isArray(v) && v.length <= 12 && v.every((x) => typeof x === 'number' && Number.isFinite(x))) o.params[str(k, 20)] = v;
    return o;
  });
}
const need = (p, ...ks) => ks.filter((k) => !(p[k] > 0)); // every key that is missing

/**
 * Run one case. params by kind (SI): jetfire { mdot, dHc, chi, tau?, levels:[W/m²] }; poolfire { D, mPrime, dHc, chi, tau?, levels };
 * vce { m, dHc, eta, levels:[Pa] }; toxic { Q, u, H?, stab, levels:[kg/m³], toDeg? }; flammable { Q, u, H?, stab, levels:[kg/m³] (e.g. LFL, half LFL), toDeg? }.
 * → { id, kind, results: [{ level, distance, label }], zones: [shape…], problems, notes }.  A shape is { id, level, label, type: 'circle'|'plume', cx, cy, r | polygon, zMax, unit: 'm' }.
 * Missing inputs make a Problem and no zone: nothing is assumed.
 */
export function runCase(c) {
  const p = c.params || {}, at = c.at || { x: 0, y: 0, z: 0 }, about = [{ kind: 'consequence-case', id: c.id, label: c.name }], problems = [], zones = [], results = [];
  const notes = [DISCLAIMER, 'Screening equations (' + REVIEW.state + '): ' + REVIEW.note];
  const lv = Array.isArray(p.levels) ? p.levels.filter((x) => x > 0) : [];
  const fail = (what) => { problems.push(problem('consequence.inputs', 'warning', `Case ${c.id} needs ${what}; no zone is drawn.`, about)); return { id: c.id, kind: c.kind, results, zones, problems, notes }; };
  if (!lv.length) return fail('the levels to draw (the person\'s criteria)');
  const circle = (level, label, r) => { results.push({ level, distance: r, label }); if (r > 0) zones.push({ id: c.id + ':' + level, level, label, type: 'circle', cx: at.x, cy: at.y, r, zMax: r, unit: 'm' }); };
  if (c.kind === 'jetfire') {
    const m = need(p, 'mdot', 'dHc', 'chi'); if (m.length) return fail(m.join(', '));
    for (const d of jetFire({ ...p, levels: lv }).distances) circle(d.q, d.q / 1000 + ' kW/m²', d.r);
    notes.push('Point-source model: the flame is treated as a point at the release; the real flame is long, so near-field fluxes are not shown.');
  } else if (c.kind === 'poolfire') {
    const m = need(p, 'D', 'mPrime', 'dHc', 'chi'); if (m.length) return fail(m.join(', '));
    const f = poolFire({ ...p, levels: lv }); for (const d of f.distances) circle(d.q, d.q / 1000 + ' kW/m²', d.ground);
    results.push({ flameHeight: f.H, heat: f.Q });
  } else if (c.kind === 'vce') {
    const m = need(p, 'm', 'dHc', 'eta'); if (m.length) return fail(m.join(', '));
    const W = tntEquivalent(p); for (const q of lv) circle(q, q / 1000 + ' kPa', blastDistance(W, q));
    results.push({ tntKg: W }); notes.push('TNT equivalence ignores confinement and congestion: a vapour cloud explosion needs a multi-energy or similar method, which is not built.');
  } else {
    const m = need(p, 'Q', 'u'); if (m.length) return fail(m.join(', '));
    const pl = { Q: p.Q, u: p.u, H: p.H || 0, stab: STABILITY.includes(p.stab) ? p.stab : 'D' };
    if (!STABILITY.includes(p.stab)) problems.push(problem('consequence.stability', 'note', `Case ${c.id}: no stability class given, D assumed (neutral).`, about));
    if (p.M > 0 && p.T > 0) { const d = isDense({ M: p.M, T: p.T }); if (d.dense) problems.push(problem('consequence.dense', 'warning', `Case ${c.id}: the release is ${d.ratio.toFixed(2)} times as dense as air; a heavy gas spreads along the ground and a Gaussian screening result under-predicts the near-ground reach.`, about)); }
    for (const q of lv) {
      const f = plumeFootprint(pl, q, { cx: at.x, cy: at.y, toDeg: p.toDeg ?? 0 }); results.push({ level: q, distance: f.reach, label: q + ' kg/m³' });
      if (f.reach) zones.push({ id: c.id + ':' + q, level: q, label: q + ' kg/m³', type: 'plume', polygon: f.polygon, zMax: f.height, cx: at.x, cy: at.y, r: f.reach, unit: 'm' });
    }
    notes.push('Gaussian plume, continuous release, flat open ground, one wind direction; the contour shown is for the averaging time of the dispersion coefficients (about ten minutes).');
  }
  if (!zones.length) problems.push(problem('consequence.none', 'note', `Case ${c.id}: no level is reached.`, about));
  return { id: c.id, kind: c.kind, results, zones, problems, notes };
}
/** Zones for a site plan (CivilCraft) and for 3D (BimCraft): plan shapes and extruded volumes in metres. The host maps metres to its own units. */
export function toPlan(zones) { return zones.map((z) => ({ id: z.id, label: z.label, shape: z.type === 'circle' ? { type: 'circle', cx: z.cx, cy: z.cy, r: z.r } : { type: 'polygon', points: z.polygon } })); }
export function to3D(zones, z0 = 0) { return zones.map((z) => z.type === 'circle' ? { id: z.id, label: z.label, shape: 'hemisphere', cx: z.cx, cy: z.cy, z: z0, r: z.r } : { id: z.id, label: z.label, shape: 'extrusion', polygon: z.polygon, z0, height: z.zMax }); }

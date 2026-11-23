/* SPDX-License-Identifier: Apache-2.0 */
/**
 * coolprop.js — pure-fluid reference properties from CoolProp (MIT, WebAssembly) as an ON-DEMAND add-on (0.8 Track CH, CH.1; owner 2026-10-29: "CoolProp as an on-demand
 * add-on", rule 44). Nothing here loads at page start: `loadCoolProp()` fetches the 6.5 MB module the first time a person asks for a pure fluid. DOM-free except that
 * the loader needs a way to import a module (a browser `import()` of the vendored URL, or a path in Node).
 *
 *   loadCoolProp({ url? , importer? })  → cp   (the Emscripten module; PropsSI(out, in1, v1, in2, v2, fluid))
 *   FLUIDS                              CH.1 component id → CoolProp fluid name
 *   props(cp, id, T, P)                 → { H, S, Cp, rho, phase, mu?, k? }  in the package's reference state (H: elements at 298.15 K + formation, S: ideal gas 298.15 K, 1 bar = 0)
 *   saturation(cp, id, T)               → { P, rhoL, rhoV, hvap }
 *   backend(cp)                         → for registerPureFluidBackend (Thermo.pureProps uses it for the fluids CoolProp knows)
 *   componentFromFluid(cp, id, opts)    → a component spec for defineComponent: critical constants, acentric factor, MW, Tb, heat of vaporisation at Tb, an ideal-gas Cp fit.
 * CoolProp has no formation enthalpies: `hf` is taken from the CH.1 databank when the id is there, else 0 and said so. Every number is CoolProp's own correlation (its
 * references are listed in its documentation); it is not re-checked here beyond the tests against NIST figures printed in textbooks.
 */
import { COMPONENTS, R, T0 } from './data.js';

export const FLUIDS = {
  methane: 'Methane', ethane: 'Ethane', propane: 'Propane', nbutane: 'n-Butane', npentane: 'n-Pentane', nhexane: 'n-Hexane', ethylene: 'Ethylene', propylene: 'Propylene',
  benzene: 'Benzene', toluene: 'Toluene', water: 'Water', methanol: 'Methanol', ethanol: 'Ethanol', acetone: 'Acetone', ammonia: 'Ammonia', nitrogen: 'Nitrogen',
  oxygen: 'Oxygen', hydrogen: 'Hydrogen', co: 'CarbonMonoxide', co2: 'CO2', h2s: 'HydrogenSulfide',
};
export const DEFAULT_URL = '/assets/vendor/coolprop/current/coolprop.js';

let loading = null;
/** In Node (tests, the CLI) there is no site to fetch from: walk up from this file to the vendored folder. A browser always uses DEFAULT_URL. */
export async function nodeUrl(rel = 'assets/vendor/coolprop/current/coolprop.js') {
  if (typeof document !== 'undefined' || typeof process === 'undefined' || !process.versions?.node) return null;
  const { existsSync } = await import(/* @vite-ignore */ 'node:fs'), { fileURLToPath, pathToFileURL } = await import(/* @vite-ignore */ 'node:url'), path = await import(/* @vite-ignore */ 'node:path');
  let d = path.dirname(fileURLToPath(import.meta.url));
  for (let k = 0; k < 8; k++, d = path.dirname(d)) for (const base of ['public_html', '']) { const f = path.join(d, base, rel); if (existsSync(f)) return pathToFileURL(f).href; }
  return null;
}
/** The module, loaded once. In a browser: `await loadCoolProp()`; in Node pass { url: 'file:///…/coolprop.js' }. `importer` is for tests. */
export function loadCoolProp({ url, importer = (u) => import(/* @vite-ignore */ u) } = {}) {
  loading ||= Promise.resolve(url || nodeUrl().then((u) => u || DEFAULT_URL)).then((u) => importer(u)).then((m) => (m.default || m)()).catch((e) => { loading = null; throw new Error('CoolProp could not be loaded (' + (e && e.message ? e.message : e) + '). It is an add-on that loads the first time a pure fluid is asked for.'); });
  return loading;
}
export const forget = () => { loading = null; };

const fluidOf = (id) => { const f = FLUIDS[id]; if (!f) throw new Error('CoolProp: no fluid is mapped for "' + id + '" (known: ' + Object.keys(FLUIDS).join(', ') + ').'); return f; };
const g = (cp, k, f) => cp.PropsSI(k, '', 0, '', 0, f);
const refs = new Map();           // id → the offsets that move CoolProp's reference state onto the package's
function reference(cp, id) {
  if (refs.has(id)) return refs.get(id);
  const f = fluidOf(id), H0 = cp.PropsSI('Hmolar', 'T', T0, 'Dmolar', 1e-4, f), S0 = cp.PropsSI('Smolar', 'T', T0, 'Dmolar', 1e-4, f);
  const o = { dH: (COMPONENTS[id]?.hf ?? 0) - H0, dS: -(S0 - R * Math.log(1e5 / (1e-4 * R * T0))), hasHf: COMPONENTS[id]?.hf != null };   // 1e-4 mol/m3 at T0 is 1e-4 R T0 Pa
  refs.set(id, o); return o;
}

export function props(cp, id, T, P) {
  const f = fluidOf(id), o = reference(cp, id), q = (k) => cp.PropsSI(k, 'T', T, 'P', P, f);
  const H = q('Hmolar'), S = q('Smolar');
  if (!Number.isFinite(H) || !Number.isFinite(S)) throw new Error('CoolProp has no state for ' + f + ' at ' + T + ' K and ' + P + ' Pa.');
  const out = { H: H + o.dH, S: S + o.dS, Cp: q('Cpmolar'), rho: q('Dmolar'), MW: g(cp, 'molar_mass', f) * 1000, phase: phaseOf(cp, f, T, P) };
  for (const [k, key] of [['mu', 'viscosity'], ['k', 'conductivity']]) { const v = q(key); if (Number.isFinite(v)) out[k] = v; }
  return out;
}
/** 'vapor' (gas, or supercritical hotter than Tc) or 'liquid' — from the saturation temperature at P (CoolProp's own phase string is not in this build). */
function phaseOf(cp, f, T, P) {
  const Tc = g(cp, 'Tcrit', f), Pc = g(cp, 'pcrit', f);
  if (P >= Pc) return T > Tc ? 'vapor' : 'liquid';
  const Ts = cp.PropsSI('T', 'P', P, 'Q', 0, f);
  return Number.isFinite(Ts) && T <= Ts ? 'liquid' : 'vapor';
}
export function saturation(cp, id, T) {
  const f = fluidOf(id), q = (k, Q) => cp.PropsSI(k, 'T', T, 'Q', Q, f);
  const P = q('P', 0); if (!Number.isFinite(P)) throw new Error('CoolProp: ' + f + ' has no saturation state at ' + T + ' K (above the critical point or below the triple point).');
  return { T, P, rhoL: q('Dmolar', 0), rhoV: q('Dmolar', 1), hvap: q('Hmolar', 1) - q('Hmolar', 0) };
}
export function backend(cp) {
  return { name: 'CoolProp', supports: (id) => !!FLUIDS[id], props: (id, T, P) => { const p = props(cp, id, T, P); return { H: p.H, S: p.S, phase: p.phase }; } };
}

/** Ideal-gas Cp/R = A + B T + C T^2 fitted (least squares) to the dilute-gas enthalpy slope of CoolProp over `range` K. */
export function fitCp(cp, id, range = [250, 700]) {
  const f = fluidOf(id), pts = [];
  for (let i = 0; i <= 12; i++) { const T = range[0] + (range[1] - range[0]) * i / 12, h = cp.PropsSI('Hmolar', 'T', T + 0.5, 'Dmolar', 1e-4, f) - cp.PropsSI('Hmolar', 'T', T - 0.5, 'Dmolar', 1e-4, f); if (Number.isFinite(h)) pts.push([T, h / R]); }
  if (pts.length < 4) throw new Error('CoolProp: no ideal-gas heat capacity for ' + f);
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], v = [0, 0, 0];
  for (const [T, c] of pts) { const b = [1, T, T * T]; for (let i = 0; i < 3; i++) { v[i] += b[i] * c; for (let j = 0; j < 3; j++) M[i][j] += b[i] * b[j]; } }
  // 3x3 solve by Cramer's rule (well-conditioned after scaling T)
  const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const d = det(M), s = [0, 1, 2].map((k) => det(M.map((row, i) => row.map((x, j) => (j === k ? v[i] : x)))) / d);
  let worst = 0; for (const [T, c] of pts) worst = Math.max(worst, Math.abs(s[0] + s[1] * T + s[2] * T * T - c) / c);
  return { A: s[0], B: s[1], C: s[2], D: 0, worst };
}

/** A component for defineComponent() from CoolProp's own constants. `id` is the CH.1 id (a new id may be given with opts.fluid naming the CoolProp fluid). */
export function componentFromFluid(cp, id, { fluid, newId } = {}) {
  const f = fluid || fluidOf(id);
  const Tc = g(cp, 'Tcrit', f), Pc = g(cp, 'pcrit', f), omega = g(cp, 'acentric', f), MW = g(cp, 'molar_mass', f) * 1000;
  if (![Tc, Pc, omega, MW].every(Number.isFinite)) throw new Error('CoolProp does not know "' + f + '".');
  const Tb = cp.PropsSI('T', 'P', 101325, 'Q', 0, f), dH = Number.isFinite(Tb) ? cp.PropsSI('Hmolar', 'P', 101325, 'Q', 1, f) - cp.PropsSI('Hmolar', 'P', 101325, 'Q', 0, f) : null;
  const known = COMPONENTS[id], fit = fitFluid(cp, f);
  const notes = ['Constants and the heat-capacity fit are CoolProp ' + (cp.get_global_param_string ? String(cp.get_global_param_string('version') || '') : '') + '; the heat-capacity fit is a quadratic over 250–700 K (worst error ' + (fit.worst * 100).toFixed(2) + ' %).'];
  if (!known || known.hf == null) notes.push('Formation enthalpy is not in CoolProp: hf = 0, so reaction energy balances with this component are wrong until a value is typed.');
  return { id: newId || id, name: f, formula: known?.formula || '', MW, Tc, Pc: Pc / 1e5, omega, Tb: Number.isFinite(Tb) ? Tb : null, dHvapTb: dH,
    antoine: null, cp: { A: fit.A, B: fit.B, C: fit.C, D: 0 }, hf: known?.hf ?? 0, gf: known?.gf ?? null, src: 'CoolProp (MIT); see the add-on notes', notes };
}
function fitFluid(cp, f) {
  const key = '__fluid:' + f; FLUIDS[key] = f; try { return fitCp(cp, key); } finally { delete FLUIDS[key]; }
}

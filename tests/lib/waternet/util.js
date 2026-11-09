/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine; problem codes are words in the host's strings (wn.* keys) */
/** util.js — shared by the WaterCraft engine (0.9 WN.1): unit factors and the small guards every analysis uses. DOM-free, no imports. */
export const FT = 0.3048, INCH = 0.0254, GPM = 6.30902e-5, LS = 1e-3, MM = 1e-3;
/** SI factors for project units 'm' (m, mm, L/s, kPa) or 'ft' (ft, in, gpm, psi): len, dia, q → metres, metres, m³/s. */
export const si = (units) => (units === 'm' ? { len: 1, dia: MM, q: LS } : { len: FT, dia: INCH, q: GPM });
export const num = (v, d = null) => { const x = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN); return Number.isFinite(x) ? x : d; };
export const pos = (v, d = null) => { const x = num(v); return x != null && x > 0 ? x : d; };
export const LIMITS = { loads: 50000, rows: 20000, steps: 20000 };
/** An error that carries a code (the host turns the code into words). */
export function problem(code, extra = {}) { return Object.assign(new Error(code), { code }, extra); }
/** The host's hydraulic solver is handed in once: { solve, extended, fireFlow } (CivilCraft's water.js). The engine owns no second solver. */
let hyd = null;
export const configure = (h) => { hyd = h; };
export function hydraulics() {
  if (!hyd || typeof hyd.solve !== 'function') throw problem('not_configured');
  return hyd;
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * core.js — words, numbers and units for the CabinetCraft add-on (DOM-free).
 *
 *   setT(fn) · t(key, vars) · lookupFrom(strings)    the add-on's words (api.t in the app; a table in the tests)
 *   num(v, d) · clamp(v, lo, hi) · r6(v) · r2(v)      number helpers (untrusted input becomes a number or the default)
 *   conv(mm, unit) → a millimetre figure in the rule unit ('mm' or 'in'; inches rounded to 1/16)
 *   fmtLen(v, unit) → a length without trailing zeros
 *   uid(prefix, taken) → an id not in `taken`
 */
let impl = null;
export function setT(fn) { impl = typeof fn === 'function' ? fn : null; }
export function t(key, vars = {}) { return impl ? impl(key, vars) : key; }
export function lookupFrom(strings) {
  return (key, vars = {}) => {
    let s = Object.prototype.hasOwnProperty.call(strings, key) ? strings[key] : key;
    if (s && typeof s === 'object') s = (vars.n !== undefined && s['=' + vars.n]) || (Number(vars.n) === 1 && s.one) || s.other || key;
    return String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m));
  };
}
export const num = (v, d) => { const n = typeof v === 'string' && v.trim() === '' ? NaN : Number(v); return Number.isFinite(n) ? n : d; };
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const r6 = (v) => { const r = Math.round(v * 1e6) / 1e6; return Object.is(r, -0) ? 0 : r; };
export const r2 = (v) => Math.round(v * 100) / 100;
export const conv = (mm, unit) => (unit === 'in' ? Math.round((mm / 25.4) * 16) / 16 : mm);
export function fmtLen(v, unit) {
  if (!Number.isFinite(v)) return '—';
  return v.toFixed(unit === 'in' ? 3 : 1).replace(/\.?0+$/, '');
}
export function uid(prefix, taken) {
  const set = taken instanceof Set ? taken : new Set(taken || []);
  for (let i = 1; i < 10000; i++) { const id = prefix + i; if (!set.has(id)) return id; }
  return prefix + Date.now();
}

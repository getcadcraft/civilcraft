/* SPDX-License-Identifier: Apache-2.0 */
/**
 * core.js — words for the TrussCraft add-on (DOM-free). setT(fn) · t(key, vars) · lookupFrom(strings) · csv(rows).
 * The same small helpers the Plant add-on has; an add-on may not import another add-on's files.
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
export function csv(rows) {
  const q = (v) => {
    let s = v === null || v === undefined ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s) && typeof v !== 'number') s = "'" + s;
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return rows.map((r) => r.map(q).join(',')).join('\r\n') + '\r\n';
}

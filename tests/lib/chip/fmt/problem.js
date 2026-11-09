/* SPDX-License-Identifier: Apache-2.0 */
/**
 * problem.js — one shape for every reader's findings, ready for the shared Problems panel (docs/0.8-PROBLEMS-SPEC.md):
 * { id, code, severity: 'error' | 'warning' | 'note', text, about?, where? }. Add-on words are not in the page catalog, so `text` is always given.
 * The id is stable between runs and languages: chip.fmt:<code>[:<file>][:<line>].
 */
export function prob(code, text, { severity = 'error', line, file, about, where } = {}) {
  const p = { id: 'chip.fmt:' + code + (file ? ':' + file : '') + (line != null ? ':' + line : ''), code: 'chip.fmt.' + code, severity, text: (line != null ? 'Line ' + line + ': ' : '') + text };
  if (about) p.about = about; if (where) p.where = where; return p;
}

/** Deep equality for plain data and typed arrays (used by the round-trip tests and by the readers' self-checks). */
export function same(a, b) {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') return Number.isNaN(a) && Number.isNaN(b);
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (ArrayBuffer.isView(a) || ArrayBuffer.isView(b)) { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (!same(a[i], b[i])) return false; return true; }
  const ka = Object.keys(a).filter((k) => a[k] !== undefined), kb = Object.keys(b).filter((k) => b[k] !== undefined); if (ka.length !== kb.length) return false;
  for (const k of ka) if (!same(a[k], b[k])) return false; return true;
}

/** First difference between two plain values, as a path string (null when equal) — so a failing round trip says where. */
export function diff(a, b, at = '') {
  if (same(a, b)) return null;
  if (a && b && typeof a === 'object' && typeof b === 'object' && !ArrayBuffer.isView(a)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) { const d = diff(a[k], b[k], at + '/' + k); if (d) return d; }
  }
  return at + ': ' + JSON.stringify(a)?.slice(0, 80) + ' vs ' + JSON.stringify(b)?.slice(0, 80);
}

/** Number to text without float noise: 0.1 + 0.2 → "0.3"; integers stay integers. */
export function num(v) { if (!Number.isFinite(v)) return String(v); if (Number.isInteger(v)) return String(v); return String(+v.toPrecision(12)); }

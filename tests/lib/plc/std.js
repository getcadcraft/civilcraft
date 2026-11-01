/* SPDX-License-Identifier: Apache-2.0 */
/** Standard function blocks and functions of IEC 61131-3 clause 6.6.3 / 6.6.2, written from the standard's timing diagrams and truth tables. Times are milliseconds. */
import { INT_TYPES, REAL_TYPES } from './st.js';

export const kindOf = (t) => !t ? null : t === 'BOOL' ? 'bool' : t in INT_TYPES || t === 'ANY_INT' ? 'int' : REAL_TYPES.includes(t) || t === 'ANY_REAL' ? 'real' : t === 'TIME' ? 'time' : t === 'STRING' || t === 'WSTRING' ? 'str' : 'other';
export const defaultOf = (t) => { const k = kindOf(t); return k === 'bool' ? false : k === 'str' ? '' : 0; };

/** Wrap a number into an integer type (two's complement). 64-bit types are held as doubles: exact to 2^53, said in the docs. */
export function wrapInt(type, v) {
  const spec = INT_TYPES[type]; v = Math.trunc(v);
  if (!spec || !Number.isFinite(v)) return Number.isFinite(v) ? v : 0;
  const [bits, signed] = spec; if (bits >= 53) return v;
  const mod = 2 ** bits; v = ((v % mod) + mod) % mod;
  return signed && v >= mod / 2 ? v - mod : v;
}
export const intMax = (type) => { const [bits, signed] = INT_TYPES[type] || [16, true]; return bits >= 53 ? Number.MAX_SAFE_INTEGER : signed ? 2 ** (bits - 1) - 1 : 2 ** bits - 1; };

/** Interface of each standard FB: inputs and outputs with types (the static check and PLCopen read use this). */
export const STD_FB = {
  TON: { in: { IN: 'BOOL', PT: 'TIME' }, out: { Q: 'BOOL', ET: 'TIME' } },
  TOF: { in: { IN: 'BOOL', PT: 'TIME' }, out: { Q: 'BOOL', ET: 'TIME' } },
  TP: { in: { IN: 'BOOL', PT: 'TIME' }, out: { Q: 'BOOL', ET: 'TIME' } },
  CTU: { in: { CU: 'BOOL', R: 'BOOL', PV: 'INT' }, out: { Q: 'BOOL', CV: 'INT' } },
  CTD: { in: { CD: 'BOOL', LD: 'BOOL', PV: 'INT' }, out: { Q: 'BOOL', CV: 'INT' } },
  CTUD: { in: { CU: 'BOOL', CD: 'BOOL', R: 'BOOL', LD: 'BOOL', PV: 'INT' }, out: { QU: 'BOOL', QD: 'BOOL', CV: 'INT' } },
  R_TRIG: { in: { CLK: 'BOOL' }, out: { Q: 'BOOL' } },
  F_TRIG: { in: { CLK: 'BOOL' }, out: { Q: 'BOOL' } },
  RS: { in: { SET: 'BOOL', RESET1: 'BOOL' }, out: { Q1: 'BOOL' } },
  SR: { in: { SET1: 'BOOL', RESET: 'BOOL' }, out: { Q1: 'BOOL' } },
};

/** Execute one call of a standard FB on its instance `s` (a Map name→value plus s.st, private state). `now` is the scan time. */
export function runStdFb(type, v, st, now) {
  const g = (k) => v.get(k);
  switch (type) {
    case 'TON': {
      if (g('IN')) { if (!st.run) { st.run = true; st.t0 = now; } const et = Math.min(now - st.t0, g('PT')); v.set('ET', et); v.set('Q', et >= g('PT')); }
      else { st.run = false; v.set('ET', 0); v.set('Q', false); }
      break;
    }
    case 'TOF': {
      if (g('IN')) { st.run = false; v.set('Q', true); v.set('ET', 0); }
      else {
        if (!st.run && st.was) { st.run = true; st.t0 = now; }
        if (st.run) { const et = Math.min(now - st.t0, g('PT')); v.set('ET', et); if (et >= g('PT')) { v.set('Q', false); st.run = false; } }
        else if (!g('Q')) v.set('ET', 0);
      }
      st.was = g('IN'); break;
    }
    case 'TP': {
      if (st.run) { const et = Math.min(now - st.t0, g('PT')); v.set('ET', et); if (et >= g('PT')) { st.run = false; v.set('Q', false); } }
      else if (g('IN') && !st.was) { st.run = true; st.t0 = now; v.set('Q', true); v.set('ET', 0); }
      else if (!g('IN')) { v.set('ET', 0); v.set('Q', false); }
      st.was = g('IN'); break;
    }
    case 'CTU': {
      const max = intMax('INT');
      if (g('R')) v.set('CV', 0); else if (g('CU') && !st.cu && g('CV') < max) v.set('CV', g('CV') + 1);
      st.cu = g('CU'); v.set('Q', g('CV') >= g('PV')); break;
    }
    case 'CTD': {
      if (g('LD')) v.set('CV', g('PV')); else if (g('CD') && !st.cd && g('CV') > -intMax('INT') - 1) v.set('CV', g('CV') - 1);
      st.cd = g('CD'); v.set('Q', g('CV') <= 0); break;
    }
    case 'CTUD': {
      if (g('R')) v.set('CV', 0); else if (g('LD')) v.set('CV', g('PV'));
      else { const up = g('CU') && !st.cu, dn = g('CD') && !st.cd; if (up && !dn && g('CV') < intMax('INT')) v.set('CV', g('CV') + 1); else if (dn && !up && g('CV') > -intMax('INT') - 1) v.set('CV', g('CV') - 1); }
      st.cu = g('CU'); st.cd = g('CD'); v.set('QU', g('CV') >= g('PV')); v.set('QD', g('CV') <= 0); break;
    }
    case 'R_TRIG': v.set('Q', g('CLK') && !st.m); st.m = g('CLK'); break;
    case 'F_TRIG': v.set('Q', !g('CLK') && !!st.m); st.m = g('CLK'); break;
    case 'RS': v.set('Q1', !g('RESET1') && (g('SET') || g('Q1'))); break;       // reset dominant
    case 'SR': v.set('Q1', g('SET1') || (!g('RESET') && g('Q1'))); break;       // set dominant
    default: throw new Error('not a standard FB: ' + type);
  }
}

const roundEven = (x) => { const r = Math.round(x); return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r; };
const num = (x) => (typeof x === 'boolean' ? (x ? 1 : 0) : x);
/** Standard functions: name → {arity [min,max], type(argKinds) → result type, fn}. */
export const STD_FN = {
  ABS: { n: [1, 1], t: (a) => a[0], f: (x) => Math.abs(x) },
  SQRT: { n: [1, 1], t: () => 'REAL', f: (x) => Math.sqrt(x) },
  LN: { n: [1, 1], t: () => 'REAL', f: (x) => Math.log(x) },
  LOG: { n: [1, 1], t: () => 'REAL', f: (x) => Math.log10(x) },
  EXP: { n: [1, 1], t: () => 'REAL', f: (x) => Math.exp(x) },
  SIN: { n: [1, 1], t: () => 'REAL', f: Math.sin }, COS: { n: [1, 1], t: () => 'REAL', f: Math.cos }, TAN: { n: [1, 1], t: () => 'REAL', f: Math.tan },
  ASIN: { n: [1, 1], t: () => 'REAL', f: Math.asin }, ACOS: { n: [1, 1], t: () => 'REAL', f: Math.acos }, ATAN: { n: [1, 1], t: () => 'REAL', f: Math.atan },
  MIN: { n: [2, 8], t: (a) => a.includes('REAL') ? 'REAL' : a[0], f: (...x) => Math.min(...x) },
  MAX: { n: [2, 8], t: (a) => a.includes('REAL') ? 'REAL' : a[0], f: (...x) => Math.max(...x) },
  LIMIT: { n: [3, 3], t: (a) => a[1], f: (mn, x, mx) => Math.min(Math.max(x, mn), mx) },
  SEL: { n: [3, 3], t: (a) => a[1], f: (g, a, b) => (g ? b : a) },
  TRUNC: { n: [1, 1], t: () => 'DINT', f: (x) => Math.trunc(x) },
  SHL: { n: [2, 2], t: (a) => a[0], f: (x, n) => x * 2 ** n },
  SHR: { n: [2, 2], t: (a) => a[0], f: (x, n) => Math.floor(x / 2 ** n) },
  LEN: { n: [1, 1], t: () => 'INT', f: (s) => String(s).length },
  CONCAT: { n: [2, 8], t: () => 'STRING', f: (...s) => s.join('') },
};
/** `A_TO_B` conversions, e.g. REAL_TO_INT (nearest, ties to even — the standard leaves the tie rule to the implementer), INT_TO_REAL, BOOL_TO_INT, TIME_TO_REAL (milliseconds). */
export function conversion(name) {
  const m = /^([A-Z_0-9]+?)_TO_([A-Z_0-9]+)$/.exec(name); if (!m) return null;
  const [, from, to] = m, ok = (t) => t === 'BOOL' || t in INT_TYPES || REAL_TYPES.includes(t) || t === 'TIME' || t === 'STRING';
  if (!ok(from) || !ok(to)) return null;
  return { from, to, f: (x) => {
    if (to === 'BOOL') return !!x;
    if (to === 'STRING') return String(x);
    if (to in INT_TYPES) return wrapInt(to, from in INT_TYPES || from === 'BOOL' ? num(x) : roundEven(num(x)));
    return num(x);
  } };
}

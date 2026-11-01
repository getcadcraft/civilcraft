/* SPDX-License-Identifier: Apache-2.0 */
/**
 * eng-units.js — units with dimensions, for the engineering library (0.8 CE.4; DOM-free). A unit is a factor to SI and a
 * vector of exponents of (m, kg, s, K, A, mol); two units are the same kind of thing exactly when the vectors match. That is
 * all "units-checked" means here: a conversion that mixes kinds (a pressure typed as a length) is refused with the two
 * kinds named. Temperatures as points (°C, °F) have their own functions (they have an offset); everywhere else K is a difference.
 *
 *   parseUnit('W/(m^2 K)') → { f, d: [m, kg, s, K, A, mol] }       products with * · or a space, / and ( ), exponents m2 m^2 s-1
 *   toSI(v, unit, kind?) · fromSI(v, unit, kind?) · convert(v, from, to)      kind = a unit text with the dimension expected ('Pa')
 *   kindName(d) → 'pressure' | 'mass flow' | … | 'L M^-1 T^-2' …           describe(d) → the exponent text
 *   cToK · kToC · fToK · kToF
 * Sources of the factors: SI Brochure (9th ed., 2019); NIST Special Publication 811 (2008) for the inch / pound / foot-based
 * units (exact by definition: 1 in = 0.0254 m, 1 lb = 0.45359237 kg, g_n = 9.80665 m/s²), the US gallon (231 in³), the IT British
 * thermal unit (1055.05585262 J), the thermochemical calorie (4.184 J), the standard atmosphere (101325 Pa), the conventional
 * millimetre of mercury (13595.1 kg/m³ · g_n · 1 mm). Prefixes n µ m c d k M G apply to the units marked in PREFIXABLE.
 */
/* i18n-ignore-file: unit marks, kind names and developer errors; the script layer words the errors for the user (cs-lib-eng.js) */
const D0 = [0, 0, 0, 0, 0, 0];
const dim = (m = 0, kg = 0, s = 0, K = 0, A = 0, mol = 0) => [m, kg, s, K, A, mol];
const LBM = 0.45359237, GN = 9.80665, IN = 0.0254, FT = 0.3048;
const LBF = LBM * GN, GAL = 231 * IN ** 3, BTU = 1055.05585262;

// symbol → [factor to SI, dimension]. Derived units are written from their definitions.
const U = {
  // length
  m: [1, dim(1)], in: [IN, dim(1)], ft: [FT, dim(1)], yd: [3 * FT, dim(1)], mi: [5280 * FT, dim(1)], mil: [IN / 1000, dim(1)], um: [1e-6, dim(1)],
  // mass, time, temperature difference, current, amount
  g: [1e-3, dim(0, 1)], kg: [1, dim(0, 1)], t: [1000, dim(0, 1)], lb: [LBM, dim(0, 1)], lbm: [LBM, dim(0, 1)], oz: [LBM / 16, dim(0, 1)], slug: [LBF / FT, dim(0, 1)],
  s: [1, dim(0, 0, 1)], min: [60, dim(0, 0, 1)], h: [3600, dim(0, 0, 1)], d: [86400, dim(0, 0, 1)],
  K: [1, dim(0, 0, 0, 1)], R: [5 / 9, dim(0, 0, 0, 1)], A: [1, dim(0, 0, 0, 0, 1)], mol: [1, dim(0, 0, 0, 0, 0, 1)],
  // derived
  Hz: [1, dim(0, 0, -1)], N: [1, dim(1, 1, -2)], lbf: [LBF, dim(1, 1, -2)], kgf: [GN, dim(1, 1, -2)],
  Pa: [1, dim(-1, 1, -2)], bar: [1e5, dim(-1, 1, -2)], psi: [LBF / IN ** 2, dim(-1, 1, -2)], atm: [101325, dim(-1, 1, -2)], mmHg: [13595.1 * GN * 1e-3, dim(-1, 1, -2)], torr: [101325 / 760, dim(-1, 1, -2)],
  J: [1, dim(2, 1, -2)], Wh: [3600, dim(2, 1, -2)], BTU: [BTU, dim(2, 1, -2)], cal: [4.184, dim(2, 1, -2)], eV: [1.602176634e-19, dim(2, 1, -2)],
  W: [1, dim(2, 1, -3)], hp: [550 * FT * LBF, dim(2, 1, -3)],
  L: [1e-3, dim(3)], gal: [GAL, dim(3)], qt: [GAL / 4, dim(3)], floz: [GAL / 128, dim(3)],
  gpm: [GAL / 60, dim(3, 0, -1)], cfm: [FT ** 3 / 60, dim(3, 0, -1)],
  P: [0.1, dim(-1, 1, -1)], cP: [1e-3, dim(-1, 1, -1)], St: [1e-4, dim(2, 0, -1)], cSt: [1e-6, dim(2, 0, -1)],
  rad: [1, D0], deg: [Math.PI / 180, D0], rev: [2 * Math.PI, D0], rpm: [2 * Math.PI / 60, dim(0, 0, -1)],
  '%': [0.01, D0], ppm: [1e-6, D0],
};
// prefixable symbols (SI prefix + symbol): the SI units, not the customary ones
const PREFIXABLE = new Set(['m', 'g', 's', 'K', 'A', 'mol', 'Hz', 'N', 'Pa', 'bar', 'J', 'Wh', 'W', 'L', 'cal', 'eV', 'P', 'St', 'rad']);
const PREFIX = { n: 1e-9, µ: 1e-6, μ: 1e-6, u: 1e-6, m: 1e-3, c: 1e-2, d: 1e-1, da: 10, h: 100, k: 1e3, M: 1e6, G: 1e9 };
// kg is the base: "kg" is in the table, and prefixes on g give mg, µg; "kg" never goes through the prefix on "g" (it is found first).
const KINDS = [
  [dim(1), 'length'], [dim(0, 1), 'mass'], [dim(0, 0, 1), 'time'], [dim(0, 0, 0, 1), 'temperature difference'], [dim(2), 'area'], [dim(3), 'volume'],
  [dim(1, 0, -1), 'speed'], [dim(1, 0, -2), 'acceleration'], [dim(0, 0, -1), 'frequency'], [dim(1, 1, -2), 'force'], [dim(-1, 1, -2), 'pressure'],
  [dim(2, 1, -2), 'energy'], [dim(2, 1, -3), 'power'], [dim(3, 0, -1), 'volume flow'], [dim(0, 1, -1), 'mass flow'], [dim(-3, 1), 'density'],
  [dim(-1, 1, -1), 'dynamic viscosity'], [dim(2, 0, -1), 'kinematic viscosity'], [dim(1, 1, -3, -1), 'thermal conductivity'], [dim(0, 1, -3, -1), 'heat transfer coefficient'],
  [dim(2, 0, -2, -1), 'specific heat'], [dim(2, 0, -2), 'specific energy'], [dim(0, 1, -3), 'heat flux'], [dim(2, 1, -3, -1), 'heat capacity rate'],
  [dim(0, 0, 0, -1), 'expansion per kelvin'], [D0, 'a plain number'], [dim(-3, 1, -1), 'mass flux'], [dim(2, 1, -3, -1).map((x, i) => (i === 0 ? 2 : x)), 'heat capacity rate'],
];
const same = (a, b) => a.every((x, i) => x === b[i]);
export function kindName(d) { const k = KINDS.find(([v]) => same(v, d)); return k ? k[1] : describe(d); }
export function describe(d) {
  const names = ['L', 'M', 'T', 'Θ', 'I', 'N'], parts = [];
  d.forEach((e, i) => { if (e) parts.push(names[i] + (e === 1 ? '' : '^' + e)); });
  return parts.join(' ') || '1';
}

// ---- parsing ---------------------------------------------------------------------------------------------------------------
function symbol(sym) {
  if (U[sym]) return U[sym];
  for (const p of Object.keys(PREFIX).sort((a, b) => b.length - a.length)) {
    if (sym.startsWith(p) && sym.length > p.length) { const rest = sym.slice(p.length); if (PREFIXABLE.has(rest) && U[rest]) return [PREFIX[p] * U[rest][0], U[rest][1]]; }
  }
  return null;
}
const mul = (a, b, e = 1) => ({ f: a.f * b.f ** e, d: a.d.map((x, i) => x + e * b.d[i]) });
const pow = (a, e) => ({ f: a.f ** e, d: a.d.map((x) => x * e) });

export function parseUnit(text) {
  const src = String(text).trim().replace(/[·⋅*]/g, ' ').replace(/\s*\^\s*/g, '^').replace(/²/g, '^2').replace(/³/g, '^3').replace(/°/g, '');
  if (!src) return { f: 1, d: D0.slice() };
  let i = 0;
  const peek = () => src[i];
  const skip = () => { while (src[i] === ' ') i++; };
  function atom() {
    skip();
    if (peek() === '(') { i++; const v = expr(); skip(); if (peek() !== ')') throw new Error('unit: missing )'); i++; return withExp(v); }
    const m = /^[A-Za-zµμ%]+/.exec(src.slice(i));
    if (!m) { const one = /^1(?![\d.])/.exec(src.slice(i)); if (one) { i++; return { f: 1, d: D0.slice() }; } throw new Error('unit: cannot read "' + src.slice(i) + '"'); }
    i += m[0].length;
    const s = symbol(m[0]);
    if (!s) throw new Error('unit: unknown unit "' + m[0] + '"');
    return withExp({ f: s[0], d: s[1].slice() });
  }
  function withExp(v) {
    const m = /^\^?(-?\d+)/.exec(src.slice(i));
    if (m && (src[i] === '^' || /[\d-]/.test(src[i]))) { i += m[0].length; return pow(v, +m[1]); }
    return v;
  }
  function product() {                                              // atom atom … (a space is a product); stops at / or )
    let v = atom();
    for (;;) { skip(); const c = peek(); if (c === undefined || c === '/' || c === ')') return v; v = mul(v, atom()); }
  }
  function expr() {                                                 // product (/ product)* — left to right, as written
    let v = product();
    for (;;) { skip(); if (peek() !== '/') return v; i++; v = mul(v, product(), -1); }
  }
  const out = expr();
  skip();
  if (i < src.length) throw new Error('unit: cannot read "' + src.slice(i) + '"');
  return out;
}

const check = (u, kind) => {
  if (kind === undefined || kind === null || kind === '') return;
  const want = parseUnit(kind);
  if (!same(u.d, want.d)) throw new UnitError('kind', { have: kindName(u.d), want: kindName(want.d) });
};
export class UnitError extends Error { constructor(code, vars = {}) { super('unit: ' + code + ' ' + JSON.stringify(vars)); this.code = code; this.vars = vars; } }
export function toSI(v, unit, kind) { let u; try { u = parseUnit(unit); } catch (e) { throw new UnitError('unknown', { unit: String(unit), why: e.message }); } check(u, kind); return v * u.f; }
export function fromSI(v, unit, kind) { let u; try { u = parseUnit(unit); } catch (e) { throw new UnitError('unknown', { unit: String(unit), why: e.message }); } check(u, kind); return v / u.f; }
export function convert(v, from, to) {
  let a, b; try { a = parseUnit(from); b = parseUnit(to); } catch (e) { throw new UnitError('unknown', { unit: from + ' → ' + to, why: e.message }); }
  if (!same(a.d, b.d)) throw new UnitError('kind', { have: kindName(a.d), want: kindName(b.d) });
  return v * a.f / b.f;
}
export const dimOf = (unit) => parseUnit(unit).d;
export const cToK = (c) => c + 273.15, kToC = (k) => k - 273.15, fToK = (f) => (f - 32) * 5 / 9 + 273.15, kToF = (k) => (k - 273.15) * 9 / 5 + 32;
export const UNIT_SYMBOLS = Object.keys(U);

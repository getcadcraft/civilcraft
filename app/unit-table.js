/* SPDX-License-Identifier: Apache-2.0 */
/**
 * unit-table.js — the one table of units every CadCraft app uses (0.7 UNITS; canonical in lib/units/, copied byte for
 * byte into each app's dev/ by `node tools/units/sync.mjs`; never edit a copy). No DOM, no imports.
 *
 * Kinds and their base unit (every value is held in the base unit):
 *   length  metre        area  square metre        volume  cubic metre        angle  radian        slope  grade (rise / run)
 *
 * Exact factors: each unit's size is a fraction n / d of the base (× π for degrees and gons), written from its legal
 * definition (the source is on each row; bin/test-units.mjs re-derives every fraction from the definitions in exact
 * arithmetic). The international foot (0.3048 m, 1959) and the US survey foot (1200/3937 m) stay two different units;
 * rod, link, chain and furlong are the international-foot ones (NIST Handbook 44 2023 Appendix C, after the survey foot
 * was retired on 2023-01-01) and the US survey mile keeps its own row. The acre, rood and square mile are the
 * international-foot ones too (an acre in survey feet is 2 ppm bigger: type it as 43560 sq US ft if it matters).
 *
 * Marks (what can be typed after a number). Case matters where it has to: "nm" is the nanometre and the nautical mile is
 * "nmi" (or "NM"); "Nm" is refused (it reads as either). A mark is matched exactly first; otherwise without case, and only
 * when that finds one unit. Feet and inches (12'6", 12' 6 1/2", 12'-6", 3 ft 6 in), degrees-minutes-seconds (45°30'15",
 * 45d30m15s), percent (2%), H:V (3:1 in an H:V field, or 3H:1V anywhere) and rise:run (1:3, 6/12) have their own forms.
 *
 *   UNITS                       every unit, in list order (each kind in its own run)
 *   unit(id) · unitsOf(kind)    a row · the rows of a kind
 *   factor(id)                  base units in one (Number); exact(id) → { n, d, pi } (the fraction)
 *   convert(v, from, to)        a value from one unit to another of the same kind (angles ↔ slopes: angleToSlope …)
 *   parse(text, kind, { unit }) → { ok: true, value (base), unit (id of what was typed), amount, per } | { ok: false, code }
 *                               a bare number is in `unit` (for 'ft-in' a bare number is inches, as on a drawing);
 *                               amount = the number in unit `per` (12'6" → 150, 'in')
 *   parseTo(text, kind, to)     the same with value in unit `to`, converted with one rounding (3 yd → 9 ft exactly)
 *   format(value, id, { dec, den, mark })  a base value as text in a unit (ft-in to 1/den", dms to whole seconds)
 *   unitName(id, tr)            the unit's name in the page's language: tr('shell.units.' + id) (the shell's words),
 *                               else the mark
 *   byInsunits(code) · insunitsOf(id)   DWG / DXF $INSUNITS ↔ a length unit
 */

export const KINDS = Object.freeze(['length', 'area', 'volume', 'angle', 'slope']);
export const BASE = Object.freeze({ length: 'm', area: 'm2', volume: 'm3', angle: 'rad', slope: 'riserun' });

// Rows: [id, kind, mark (shown), n, d, extra]. extra: on (in the dropdowns until Settings turns it off: every unit an app
// already listed before 0.7 is on, so nothing went missing from a dropdown, plus the common ones), dec (decimals
// shown), pi (× π), ins ($INSUNITS), marks (more marks typed), sys ('metric' | 'imperial' | 'us' | 'nautical' | 'any'),
// src (the definition). Big fractions stay below 2^53 so n / d is exact in the table.
/* i18n-ignore-start (unit marks and the definitions' sources; names are the shell's words, shell.units.*) */
const ROWS = [
  // ---- length (metre) ----
  ['nm', 'length', 'nm', 1, 1e9, { dec: 0, ins: 12, sys: 'metric', marks: ['nanometre', 'nanometres', 'nanometer', 'nanometers'], src: 'SI prefix nano 10^-9 (SI Brochure, 9th ed.)' }],
  ['um', 'length', 'µm', 1, 1e6, { on: true, dec: 1, ins: 13, sys: 'metric', marks: ['μm', 'um', 'micron', 'microns', 'micrometre', 'micrometres', 'micrometer', 'micrometers'], src: 'SI prefix micro 10^-6' }],
  ['mm', 'length', 'mm', 1, 1e3, { on: true, dec: 1, ins: 4, sys: 'metric', marks: ['millimetre', 'millimetres', 'millimeter', 'millimeters'], src: 'SI prefix milli 10^-3' }],
  ['cm', 'length', 'cm', 1, 1e2, { on: true, dec: 2, ins: 5, sys: 'metric', marks: ['centimetre', 'centimetres', 'centimeter', 'centimeters'], src: 'SI prefix centi 10^-2' }],
  ['dm', 'length', 'dm', 1, 10, { dec: 2, ins: 14, sys: 'metric', marks: ['decimetre', 'decimetres', 'decimeter', 'decimeters'], src: 'SI prefix deci 10^-1' }],
  ['m', 'length', 'm', 1, 1, { on: true, dec: 3, ins: 6, sys: 'metric', marks: ['metre', 'metres', 'meter', 'meters'], src: 'SI base unit' }],
  ['dam', 'length', 'dam', 10, 1, { dec: 3, ins: 15, sys: 'metric', marks: ['decametre', 'decametres', 'decameter', 'decameters'], src: 'SI prefix deca 10^1' }],
  ['hm', 'length', 'hm', 100, 1, { dec: 3, ins: 16, sys: 'metric', marks: ['hectometre', 'hectometres', 'hectometer', 'hectometers'], src: 'SI prefix hecto 10^2' }],
  ['km', 'length', 'km', 1000, 1, { on: true, dec: 3, ins: 7, sys: 'metric', marks: ['kilometre', 'kilometres', 'kilometer', 'kilometers'], src: 'SI prefix kilo 10^3' }],
  ['mil', 'length', 'mil', 254, 1e7, { on: true, dec: 1, ins: 9, sys: 'imperial', marks: ['mils', 'thou'], src: '1/1000 in' }],
  ['in', 'length', 'in', 254, 1e4, { on: true, dec: 3, ins: 1, sys: 'imperial', marks: ['"', 'inch', 'inches'], src: '25.4 mm exactly (International Yard and Pound Agreement, 1959)' }],
  ['ft', 'length', 'ft', 3048, 1e4, { on: true, dec: 2, ins: 2, sys: 'imperial', marks: ["'", 'foot', 'feet'], src: '12 in = 0.3048 m (1959)' }],
  ['ft-in', 'length', 'ft-in', 3048, 1e4, { on: true, dec: 0, sys: 'imperial', bare: 'in', src: 'feet and inches (the international foot): 12\'-6 1/2"' }],
  ['usft', 'length', 'US ft', 1200, 3937, { on: true, dec: 2, ins: 21, sys: 'us', marks: ['usft', 'ftUS', 'ft US', 'sft', 'US survey ft', 'US survey foot', 'US survey feet', 'survey ft', 'survey foot', 'survey feet'], src: '1200/3937 m (Mendenhall Order, 1893; kept for surveys, Federal Register 85 FR 62698)' }],
  ['yd', 'length', 'yd', 9144, 1e4, { on: true, dec: 2, ins: 10, sys: 'imperial', marks: ['yard', 'yards'], src: '0.9144 m exactly (1959) = 3 ft' }],
  ['rod', 'length', 'rd', 50292, 1e4, { dec: 2, sys: 'imperial', marks: ['rod', 'rods', 'pole', 'perch'], src: '16.5 ft (NIST Handbook 44, 2023, App. C)' }],
  ['link', 'length', 'li', 201168, 1e6, { dec: 2, sys: 'imperial', marks: ['lk', 'link', 'links'], src: '0.66 ft = 1/100 chain (NIST HB 44 App. C)' }],
  ['chain', 'length', 'ch', 201168, 1e4, { dec: 2, sys: 'imperial', marks: ['chain', 'chains'], src: '66 ft = 4 rods (NIST HB 44 App. C)' }],
  ['fur', 'length', 'fur', 201168, 1e3, { dec: 3, sys: 'imperial', marks: ['furlong', 'furlongs'], src: '660 ft = 10 chains (NIST HB 44 App. C)' }],
  ['mi', 'length', 'mi', 1609344, 1e3, { on: true, dec: 3, ins: 3, sys: 'imperial', marks: ['mile', 'miles'], src: '5280 ft = 1609.344 m' }],
  ['usmi', 'length', 'US mi', 6336000, 3937, { dec: 3, ins: 24, sys: 'us', marks: ['usmi', 'mi US', 'US survey mi', 'US survey mile', 'US survey miles', 'survey mi', 'survey mile', 'survey miles'], src: '5280 US survey ft' }],
  ['nmi', 'length', 'nmi', 1852, 1, { dec: 3, sys: 'nautical', marks: ['NM', 'n mile', 'nautical mile', 'nautical miles'], cs: true, src: '1852 m exactly (International Hydrographic Conference, 1929; NIST SP 811)' }],
  ['fathom', 'length', 'ftm', 18288, 1e4, { dec: 2, sys: 'imperial', marks: ['fathom', 'fathoms'], src: '6 ft = 2 yd (NIST HB 44 App. C)' }],
  ['pt', 'length', 'pt', 254, 72e4, { dec: 1, sys: 'any', marks: ['point', 'points'], src: '1/72 in (the desktop / PDF point)' }],
  ['pc', 'length', 'pc', 254, 6e4, { dec: 2, sys: 'any', marks: ['pica', 'picas'], src: '12 points = 1/6 in' }],
  // ---- area (square metre) ----
  ['mm2', 'area', 'mm²', 1, 1e6, { dec: 0, sys: 'metric', sq: 'mm', src: '(10^-3 m)^2' }],
  ['cm2', 'area', 'cm²', 1, 1e4, { dec: 1, sys: 'metric', sq: 'cm', src: '(10^-2 m)^2' }],
  ['m2', 'area', 'm²', 1, 1, { on: true, dec: 2, sys: 'metric', sq: 'm', marks: ['sqm'], src: 'SI derived unit' }],
  ['are', 'area', 'a', 100, 1, { dec: 2, sys: 'metric', marks: ['are', 'ares'], src: '100 m² (SI Brochure, Table 8)' }],
  ['ha', 'area', 'ha', 1e4, 1, { on: true, dec: 3, sys: 'metric', marks: ['hectare', 'hectares'], src: '100 a = 10^4 m² (SI Brochure, Table 8)' }],
  ['km2', 'area', 'km²', 1e6, 1, { dec: 4, sys: 'metric', sq: 'km', src: '(10^3 m)^2' }],
  ['in2', 'area', 'in²', 16129, 25e6, { dec: 1, sys: 'imperial', sq: 'in', marks: ['sqin'], src: '(0.0254 m)^2 = 0.00064516 m²' }],
  ['ft2', 'area', 'ft²', 9290304, 1e8, { on: true, dec: 1, sys: 'imperial', sq: 'ft', marks: ['sqft', 'SF', 'sf'], src: '(0.3048 m)^2 = 0.09290304 m²' }],
  ['yd2', 'area', 'yd²', 52257960, 625e5, { on: true, dec: 2, sys: 'imperial', sq: 'yd', marks: ['sqyd', 'SY', 'sy'], src: '9 ft² = 0.83612736 m²' }],
  ['square', 'area', 'sq', 9290304, 1e6, { on: true, dec: 2, sys: 'imperial', marks: ['SQ', 'square', 'squares'], src: '100 ft² (roofing)' }],
  ['rood', 'area', 'ro', 10117141056, 1e7, { dec: 3, sys: 'imperial', marks: ['rood', 'roods'], src: '1/4 acre = 1210 yd²' }],
  ['acre', 'area', 'ac', 40468564224, 1e7, { on: true, dec: 3, sys: 'imperial', marks: ['acre', 'acres'], src: '43 560 ft² = 10 square chains (international foot)' }],
  ['mi2', 'area', 'mi²', 2589988110336, 1e6, { dec: 4, sys: 'imperial', sq: 'mi', marks: ['sqmi'], src: '640 acres = (1609.344 m)^2' }],
  // ---- volume (cubic metre) ----
  ['mm3', 'volume', 'mm³', 1, 1e9, { dec: 0, sys: 'metric', cu: 'mm', src: '(10^-3 m)^3' }],
  ['cm3', 'volume', 'cm³', 1, 1e6, { dec: 1, sys: 'metric', cu: 'cm', marks: ['cc', 'ccm'], src: '(10^-2 m)^3' }],
  ['ml', 'volume', 'mL', 1, 1e6, { dec: 0, sys: 'metric', marks: ['ml', 'millilitre', 'millilitres', 'milliliter', 'milliliters'], src: '1 cm³ (CGPM 1964)' }],
  ['l', 'volume', 'L', 1, 1e3, { on: true, dec: 2, sys: 'metric', marks: ['l', 'litre', 'litres', 'liter', 'liters'], src: '1 dm³ (CGPM 1964)' }],
  ['m3', 'volume', 'm³', 1, 1, { on: true, dec: 3, sys: 'metric', cu: 'm', src: 'SI derived unit' }],
  ['in3', 'volume', 'in³', 2048383, 125e9, { dec: 1, sys: 'imperial', cu: 'in', src: '(0.0254 m)^3 = 16.387064 cm³' }],
  ['ft3', 'volume', 'ft³', 3539605824, 125e9, { on: true, dec: 2, sys: 'imperial', cu: 'ft', marks: ['CF', 'cf'], src: '(0.3048 m)^3 = 0.028316846592 m³' }],
  ['yd3', 'volume', 'yd³', 95569357248, 125e9, { on: true, dec: 2, sys: 'imperial', cu: 'yd', marks: ['CY', 'cy', 'cubic yards'], src: '27 ft³ = 0.764554857984 m³' }],
  ['gal', 'volume', 'US gal', 473176473, 125e9, { on: true, dec: 2, sys: 'us', marks: ['gal', 'USgal', 'gallon', 'gallons', 'US gallon', 'US gallons'], src: '231 in³ (US liquid gallon) = 3.785411784 L' }],
  ['impgal', 'volume', 'imp gal', 454609, 1e8, { dec: 2, sys: 'imperial', marks: ['impgal', 'UK gal', 'imperial gallon', 'imperial gallons'], src: '4.54609 L exactly (UK Weights and Measures Act 1985)' }],
  ['bf', 'volume', 'FBM', 294967152, 125e9, { dec: 1, sys: 'us', marks: ['fbm', 'BF', 'bf', 'bd ft', 'bdft', 'board foot', 'board feet'], src: '144 in³ (1 ft × 1 ft × 1 in)' }],
  ['acft', 'volume', 'ac-ft', 15418522969344, 125e8, { dec: 3, sys: 'us', marks: ['ac ft', 'acre-ft', 'acre-foot', 'acre-feet', 'AF', 'af'], src: '43 560 ft³ (an acre one foot deep)' }],
  // ---- angle (radian) ----
  ['deg', 'angle', '°', 1, 180, { on: true, pi: true, dec: 2, sys: 'any', marks: ['deg', 'degree', 'degrees'], src: 'π/180 rad' }],
  ['dms', 'angle', "°'\"", 1, 180, { on: true, pi: true, dec: 0, sys: 'any', bare: 'deg', src: 'degrees, minutes (1/60°) and seconds (1/3600°)' }],
  ['gon', 'angle', 'gon', 1, 200, { pi: true, dec: 3, sys: 'any', marks: ['gons', 'grad', 'grads', 'g', 'ᵍ'], src: 'π/200 rad (ISO 80000-3)' }],
  ['rad', 'angle', 'rad', 1, 1, { on: true, dec: 4, sys: 'any', marks: ['radian', 'radians'], src: 'SI derived unit' }],
  // ---- slope (rise / run; H:V and rise:run read and write a ratio) ----
  ['pct', 'slope', '%', 1, 100, { on: true, dec: 2, sys: 'any', src: 'rise / run × 100' }],
  ['hv', 'slope', 'H:V', 1, 1, { on: true, dec: 2, sys: 'any', src: 'run : rise (3:1 = 3 across for 1 up)' }],
  ['riserun', 'slope', 'rise:run', 1, 1, { dec: 2, sys: 'any', src: 'rise : run (1:3, 2:1, a roof pitch 6:12)' }],
];
/* i18n-ignore-end */

export const UNITS = Object.freeze(ROWS.map(([id, kind, mark, n, d, x]) => Object.freeze({
  id, kind, mark, n, d, pi: !!x.pi, factor: (x.pi ? Math.PI : 1) * n / d, on: !!x.on, dec: x.dec ?? 2, ins: x.ins ?? null,
  sys: x.sys || 'any', bare: x.bare || null, src: x.src || '', cs: !!x.cs,
  marks: Object.freeze([mark, ...(x.marks || []), ...(x.sq ? [x.sq + '2', x.sq + '^2', 'sq ' + x.sq, 'sq. ' + x.sq, 'square ' + x.sq] : []),
    ...(x.cu ? [x.cu + '3', x.cu + '^3', 'cu ' + x.cu, 'cu. ' + x.cu, 'cubic ' + x.cu] : [])]),
})));
const BY_ID = new Map(UNITS.map((u) => [u.id, u]));
export const unit = (id) => BY_ID.get(id) || null;
export const unitsOf = (kind) => UNITS.filter((u) => u.kind === kind);
export const factor = (id) => { const u = BY_ID.get(id); return u ? u.factor : NaN; };
export const exact = (id) => { const u = BY_ID.get(id); return u ? { n: u.n, d: u.d, pi: u.pi } : null; };

/** A value from one unit to another of the same kind (slopes: through the grade). NaN when they do not go together. */
export function convert(v, from, to) {
  const a = BY_ID.get(from), b = BY_ID.get(to);
  if (!a || !b || a.kind !== b.kind || !Number.isFinite(v)) return NaN;
  if (a.kind === 'slope') return fromBase(toBase(v, from), to);
  if (a === b || a.factor === b.factor) return v;
  if (a.pi === b.pi) return v * (a.n * b.d) / (a.d * b.n);   // one rounding: the fraction first
  return v * a.factor / b.factor;
}
/** A number in a unit → the base (slopes: H:V 3 → 1/3, percent 2 → 0.02). */
export function toBase(v, id) {
  const u = BY_ID.get(id);
  if (!u || !Number.isFinite(v)) return NaN;
  if (u.id === 'hv') return v === 0 ? Infinity : 1 / v;
  return u.pi ? v * Math.PI * u.n / u.d : v * u.n / u.d;
}
/** The base → a number in a unit. */
export function fromBase(v, id) {
  const u = BY_ID.get(id);
  if (!u || Number.isNaN(v)) return NaN;
  if (u.id === 'hv') return v === 0 ? Infinity : 1 / v;
  return u.pi ? v / Math.PI * u.d / u.n : v * u.d / u.n;
}
/** An angle (radians) ↔ a slope (grade). */
export const angleToSlope = (rad) => Math.tan(rad);
export const slopeToAngle = (grade) => Math.atan(grade);

// ---- marks ----
const EXACT = new Map(), LOWER = new Map();
for (const u of UNITS) {
  for (const m of u.marks) {
    const k = u.kind + '|' + norm(m);
    if (!EXACT.has(k)) EXACT.set(k, u.id);
    const lk = k.toLowerCase();
    if (!LOWER.has(lk)) LOWER.set(lk, new Set());
    LOWER.get(lk).add(u.id);
  }
}
function norm(m) { return String(m).replace(/\s+/g, ' ').replace(/\s*\.$/, '').trim(); }
/** The unit a mark names in a kind, or null ("nm" → nm, "NM" → nmi, "Nm" → null: it could be either). */
export function unitOfMark(mark, kind) {
  const k = kind + '|' + norm(mark);
  if (EXACT.has(k)) return EXACT.get(k);
  const set = LOWER.get(k.toLowerCase());
  if (!set || set.size !== 1) return null;
  const id = [...set][0];
  return BY_ID.get(id).cs ? null : id;   // a case-sensitive unit only by its exact mark
}

// ---- parse ----
const NUM = '(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][-+]?\\d+)?';
const MIXED = new RegExp('^(' + NUM + ')(?:(?:\\s+|\\s*-\\s*)(\\d+)\\s*/\\s*(\\d+))?$|^(\\d+)\\s*/\\s*(\\d+)$');
/** "6", "6.5", "6 1/2", "6-1/2", "1/2" → a number, else null. */
export function readNumber(s) {
  const m = MIXED.exec(String(s).trim());
  if (!m) return null;
  if (m[4] !== undefined) return +m[5] ? m[4] / m[5] : null;
  if (m[2] !== undefined) return +m[3] && !/[.eE]/.test(m[1]) ? +m[1] + m[2] / m[3] : null;
  return +m[1];
}
function clean(text) {
  return String(text ?? '').replace(/[′’‘`´]/g, "'").replace(/[″“”]/g, '"').replace(/''/g, '"').replace(/[−–—]/g, '-').replace(/\s+/g, ' ').trim();
}
const fail = (code) => ({ ok: false, code });
// amount / per: the number typed and the unit it is in (12'6" → 150 in), so parseTo converts with one rounding
const done = (value, id, amount = null, per = null) => (Number.isFinite(value) ? { ok: true, value, unit: id, amount: amount ?? fromBase(value, id), per: per || id } : fail('number'));

/**
 * A typed value of a kind → { ok: true, value (in the base unit), unit (the id of what was typed) } | { ok: false, code }
 * (code: 'empty' | 'unit' (a mark this kind does not have) | 'number' | 'bare' (a bare number and no unit to read it in)).
 * A leading - or + is kept. Never arithmetic: the apps' own lencalc.js does that over this.
 */
export function parse(text, kind, { unit: bareUnit = null } = {}) {
  let s = clean(text);
  if (!s) return fail('empty');
  let sign = 1;
  if (s[0] === '-' || s[0] === '+') { if (s[0] === '-') sign = -1; s = s.slice(1).trim(); }
  if (!s) return fail('number');
  const r = parseAbs(s, kind, bareUnit);
  if (r.ok && sign < 0) { r.value = -r.value; r.amount = -r.amount; }
  return r;
}
/** parse(), with the value in unit `to` (same kind) and one rounding: parseTo('3 yd', 'length', 'ft') → value 9 exactly. */
export function parseTo(text, kind, to, opts) {
  const r = parse(text, kind, opts);
  if (!r.ok) return r;
  return { ...r, value: kind === 'slope' ? fromBase(r.value, to) : convert(r.amount, r.per, to) };
}
function parseAbs(s, kind, bareUnit) {
  if (kind === 'length' && /['"]/.test(s)) { const v = feetInches(s); if (v !== null) return done(toBase(v, 'in'), 'ft-in', v, 'in'); }
  if (kind === 'length') { const m = /^(.+?)\s*(?:ft|foot|feet)\s*(.+?)\s*(?:in|inch|inches)$/i.exec(s); if (m) { const f = readNumber(m[1]), i = readNumber(m[2]); if (f !== null && i !== null) return done(toBase(f * 12 + i, 'in'), 'ft-in', f * 12 + i, 'in'); } }
  if (kind === 'angle' && /['"]|°\s*\d|\d\s*d\s*\d|\d\s*d$/i.test(s)) { const v = dms(s); if (v !== null) return done(toBase(v, 'deg'), 'dms', v, 'deg'); }
  if (kind === 'slope') { const v = slope(s, bareUnit); if (v) return v; }
  // a number and a mark
  const m = new RegExp('^(' + NUM + '(?:(?:\\s+|\\s*-\\s*)\\d+\\s*/\\s*\\d+)?|\\d+\\s*/\\s*\\d+)\\s*(.*)$').exec(s);
  if (!m) return fail('number');
  const n = readNumber(m[1]);
  if (n === null) return fail('number');
  const mark = m[2].trim();
  if (!mark) {
    if (!bareUnit || !BY_ID.has(bareUnit) || BY_ID.get(bareUnit).kind !== kind) return fail('bare');
    const b = BY_ID.get(bareUnit).bare || bareUnit;
    return done(toBase(n, b), bareUnit, n, b);
  }
  const id = unitOfMark(mark, kind);
  if (!id) return fail('unit');
  return done(toBase(n, id), id, n, id);
}
/** 12'  12'6"  12' 6 1/2"  12'-6-1/2"  12'-6  6"  6 1/2"  1/2" → inches, else null. */
function feetInches(s) {
  if (!/\d/.test(s)) return null;
  const m = /^(?:([\d./ ]+?)\s*')?\s*(?:-?\s*([\d./ -]+?)\s*"?)?$/.exec(s.replace(/\s*-\s*(?=\d+\s*\/)/g, ' '));
  if (!m || (m[1] === undefined && m[2] === undefined)) return null;
  if (m[1] === undefined && !/"$/.test(s)) return null;   // 6 alone is not feet-and-inches
  const ft = m[1] !== undefined ? readNumber(m[1]) : 0, inch = m[2] !== undefined && m[2].trim() !== '' ? readNumber(m[2].replace(/-/g, ' ')) : 0;
  if (ft === null || inch === null) return null;
  return ft * 12 + inch;
}
/** 45°30'15"  45° 30'  45d30m15s  45°  → degrees, else null. */
function dms(s) {
  const m = /^(\d+(?:\.\d+)?)\s*(?:°|d)\s*(?:(\d+(?:\.\d+)?)\s*(?:'|m))?\s*(?:(\d+(?:\.\d+)?)\s*(?:"|s))?$/i.exec(s);
  if (!m) return null;
  const mi = m[2] === undefined ? 0 : +m[2], se = m[3] === undefined ? 0 : +m[3];
  if (mi >= 60 || se >= 60) return null;
  return +m[1] + mi / 60 + se / 3600;
}
/** 2%  3H:1V  1V:3H  3:1 (H:V field) / 1:3 (rise:run)  6/12  6 in 12 → { ok, value (grade), unit }, else null. */
function slope(s, bareUnit) {
  let m = new RegExp('^(' + NUM + ')\\s*%$').exec(s);
  if (m) return done(+m[1] / 100, 'pct');
  m = new RegExp('^(' + NUM + ')\\s*H\\s*:\\s*(' + NUM + ')\\s*V$', 'i').exec(s);
  if (m) return done(+m[2] / +m[1], 'hv');
  m = new RegExp('^(' + NUM + ')\\s*V\\s*:\\s*(' + NUM + ')\\s*H$', 'i').exec(s);
  if (m) return done(+m[1] / +m[2], 'riserun');
  m = new RegExp('^(' + NUM + ')\\s*(:|/|in)\\s*(' + NUM + ')$', 'i').exec(s);
  if (m) {
    if (m[2] === ':' && bareUnit === 'hv') return done(+m[3] / +m[1], 'hv');
    return +m[3] ? done(+m[1] / +m[3], 'riserun') : fail('number');
  }
  return null;
}

// ---- format ----
function num(v, dec, trim) {
  const r = Number(v.toFixed(dec));
  let s = (Object.is(r, -0) ? 0 : r).toFixed(dec);
  if (trim && s.includes('.')) s = s.replace(/\.?0+$/, '');
  return s;
}
function reduce(n, d) { while (n && n % 2 === 0 && d % 2 === 0) { n /= 2; d /= 2; } return [n, d]; }
/**
 * A value in the base unit as text in unit `id`: { dec (decimals; the unit's own by default), den (ft-in: inches to
 * 1/den, 16), mark (true: with the mark), trim (true: drop trailing zeros) }.
 *   format(3.81, 'ft-in') → 12'-6"     format(0.785398, 'dms') → 45°00'00"     format(1/3, 'hv') → 3:1
 */
export function format(value, id, { dec, den = 16, mark = true, trim = true } = {}) {
  const u = BY_ID.get(id);
  if (!u || !Number.isFinite(value)) return '';
  const d = dec ?? u.dec;
  if (id === 'ft-in') {
    const neg = value < 0;
    let n = Math.round(Math.abs(fromBase(value, 'in')) * den);
    const ft = Math.floor(n / (12 * den)); n -= ft * 12 * den;
    const inch = Math.floor(n / den), [fn, fd] = reduce(n - inch * den, den);
    const zero = !ft && !inch && !fn;
    return (neg && !zero ? '-' : '') + ft + "'-" + inch + (fn ? ' ' + fn + '/' + fd : '') + '"';
  }
  if (id === 'dms') {
    const neg = value < 0;
    const p = Math.pow(10, d);
    let t = Math.round(Math.abs(fromBase(value, 'deg')) * 3600 * p);
    const dg = Math.floor(t / (3600 * p)); t -= dg * 3600 * p;
    const mi = Math.floor(t / (60 * p)); t -= mi * 60 * p;
    const sec = (t / p).toFixed(d);
    return (neg && (dg || mi || +sec) ? '-' : '') + dg + '°' + String(mi).padStart(2, '0') + "'" + sec.padStart(d ? 3 + d : 2, '0') + '"';
  }
  if (id === 'hv') return value === 0 ? '∞:1' : num(1 / value, d, trim) + ':1';
  if (id === 'riserun') return Math.abs(value) >= 1 || value === 0 ? num(value, d, trim) + ':1' : '1:' + num(1 / value, d, trim);   // 2:1 steep, 1:3 shallow
  const v = fromBase(value, id), s = num(v, d, trim);
  if (!mark) return s;
  return id === 'pct' || id === 'deg' ? s + u.mark : s + ' ' + u.mark;
}

/** The unit's name in the page's language: tr('shell.units.<id>') when the words are there, else the mark. */
export function unitName(id, tr = typeof globalThis !== 'undefined' && globalThis.ccShellT ? globalThis.ccShellT : null) {
  const u = BY_ID.get(id);
  if (!u) return String(id);
  const key = 'shell.units.' + id;
  if (tr) { const w = tr(key); if (w && w !== key) return w; }
  return u.mark;
}

/** DWG / DXF $INSUNITS ↔ length units (codes from the DXF reference: 1 in, 2 ft, 4 mm, 6 m, 21 US survey ft …). */
export const byInsunits = (code) => UNITS.find((u) => u.ins === (code | 0) && u.kind === 'length')?.id || null;
export const insunitsOf = (id) => BY_ID.get(id)?.ins ?? 0;

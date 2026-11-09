/* SPDX-License-Identifier: Apache-2.0 */
/**
 * display-units.js — one display unit everywhere (0.8 GH.3-A; rule 39: moved out of BimCraft's model-units.js). No DOM, no
 * imports. Everything inside an app is millimetres (or SI for calculations); these helpers only turn a number into text in
 * the unit a person picked. The pick is one of six: 'ftin' (feet-inches), 'in', 'ftdec' (decimal feet), 'mm', 'cm', 'm'.
 *
 *   fmtLen(mm, u, {unit}) / lenMark(mm, u)     a length (feet-inches marks itself; the others get the unit after the number)
 *   fmtAreaMm2(mm2, u) / fmtVolMm3(mm3, u)     an area or volume in the matching square or cubic unit (feet-inches → ft², ft³)
 *   fmtM(m, u) / fmtM2(m2, u) / fmtM3(m3, u)  the same from metres, square metres, cubic metres (what calculations give)
 *   localizeQuantities(text, u)                "4.2 m", "12 mm", "24 m²", "60 m³" inside a sentence → the pick (never W/m², kg/m³, m/s)
 *   fmtPaper(wmm, hmm, u) / paperLabel(name, key, u)   a paper size's dimensions ("297 × 420 mm", "11.69 × 16.54 in"); the paper's name stays
 *   crsUnitNote(u, crsUnit)                    null, or the CRS's own unit id ('ft', 'us-ft', 'm') when it differs from the pick's family
 *   unitMark, coordNumber, fmtCoord, fmtFine, localizeLengths   see below
 *   smallNumber(mm, u) / smallMark(u) / pointText([x, y, z], u)   a deflection or drift (feet → decimal inches) and a point (0.9 GH.3-A, frame tab)
 * A copy sits in each host's dev/ folder: tools/units/sync-display.mjs <app> (scoped, names its target); nobody edits a copy.
 */
export const UNITS = ['ftin', 'in', 'ftdec', 'mm', 'cm', 'm'];
/** A host's unit → the shared table's id (unit-table.js). */
export const TABLE_ID = Object.freeze({ ftin: 'ft-in', in: 'in', ftdec: 'ft', mm: 'mm', cm: 'cm', m: 'm' });
export const INCH = 25.4;
export const FACTOR = { mm: 1, cm: 10, m: 1000, in: INCH, ftdec: 12 * INCH };
export const isMetric = (unit) => ['mm', 'cm', 'm'].includes(unit);

/** Millimetres as text. `ftin`: feet-inches to 1/16" (fractions reduced); `mm`: whole millimetres (0.1 below 10). */
export function fmtLen(mm, units = 'ftin', { unit = false } = {}) {
  if (!Number.isFinite(mm)) return '';
  if (units !== 'ftin' && FACTOR[units]) {
    const value = mm / FACTOR[units];
    const digits = units === 'mm' ? (Math.abs(value) < 10 ? 1 : 0) : units === 'in' ? 3 : 2;
    const rounded = Number(value.toFixed(digits));
    return (Object.is(rounded, -0) ? 0 : rounded) + (unit ? ' ' + (units === 'ftdec' ? 'ft' : units) : '');
  }
  const neg = mm < 0;
  let sixteenths = Math.round(Math.abs(mm) / INCH * 16);
  const ft = Math.floor(sixteenths / 192);
  sixteenths -= ft * 192;
  const inch = Math.floor(sixteenths / 16);
  let frac = sixteenths - inch * 16, den = 16;
  while (frac && frac % 2 === 0) { frac /= 2; den /= 2; }
  const whole = ft || inch || !frac;   // 10'-0 1/4", but 1/4" alone
  const inText = (whole ? String(inch) : '') + (frac ? (whole ? ' ' : '') + frac + '/' + den : '') + '"';
  const s = ft ? ft + "'-" + inText : inText;
  return (neg && sixteenths + ft ? '-' : '') + s;
}

/** The unit beside a number: 'mm', 'ft'…; feet-inches has none (its values carry ' and "). */
export const unitMark = (units) => (units === 'ftin' ? '' : units === 'ftdec' ? 'ft' : units);
export const lenMark = (mm, units = 'ftin') => fmtLen(mm, units, { unit: units !== 'ftin' });
/** The number of fmtCoord alone (the unit goes beside it): decimal feet for feet-inches. */
export function coordNumber(mm, units = 'ftin') {
  if (!Number.isFinite(mm)) return '';
  const u = units === 'ftin' ? 'ftdec' : units;
  const digits = { mm: 1, cm: 2, m: 3, in: 2, ftdec: 3 }[u] ?? 3;
  const rounded = Number(((mm) / (FACTOR[u] || 1)).toFixed(digits));
  return (Object.is(rounded, -0) ? 0 : rounded).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false });
}
export const fmtCoord = (mm, units = 'ftin') => (Number.isFinite(mm) ? coordNumber(mm, units) + ' ' + unitMark(units === 'ftin' ? 'ftdec' : units) : '');

/** 0.9 GH.3-A: a small length (a deflection, a drift) as a number alone; its unit is smallMark (feet-inches and decimal feet → decimal inches). */
export const smallMark = (units) => (units === 'ftin' || units === 'ftdec' ? 'in' : FACTOR[units] ? units : 'mm');
export function smallNumber(mm, units = 'ftin') {
  if (!Number.isFinite(mm)) return '';
  const u = smallMark(units);
  const v = mm / FACTOR[u];
  const digits = { mm: 2, cm: 3, m: 5, in: 3 }[u];
  return (Math.abs(v) < 0.5 * 10 ** -digits ? 0 : v).toFixed(digits);   // no -0.00
}
/** A point [x, y, z] in mm as "(x, y, z) unit", each number as coordNumber (feet-inches → decimal feet). */
export const pointText = (p, units = 'ftin') => '(' + p.map((v) => coordNumber(v, units)).join(', ') + ') ' + unitMark(units === 'ftin' ? 'ftdec' : units);

/** A small length (a scale in length per pixel, a tolerance) with three significant figures and its unit: feet-inches shows decimal inches. */
export function fmtFine(mm, units = 'ftin') {
  if (!Number.isFinite(mm)) return '';
  const u = units === 'ftin' ? 'in' : units;
  const v = Number((mm / (FACTOR[u] || 1)).toPrecision(3));
  return (Object.is(v, -0) ? 0 : v) + ' ' + unitMark(u);
}

/* Areas and volumes: the square and cubic unit of the pick (feet-inches and decimal feet → ft², ft³). */
const AREA = { mm: ['mm²', 1, 0], cm: ['cm²', 100, 1], m: ['m²', 1e6, 2], in: ['in²', INCH * INCH, 1], ftdec: ['ft²', (12 * INCH) ** 2, 1] };
const VOL = { mm: ['mm³', 1, 0], cm: ['cm³', 1000, 0], m: ['m³', 1e9, 2], in: ['in³', INCH ** 3, 0], ftdec: ['ft³', (12 * INCH) ** 3, 1] };
const base = (units) => (units === 'ftin' ? 'ftdec' : AREA[units] ? units : 'mm');
const group = (v, digits) => v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: Math.abs(v) >= 10000 });
const fmtPow = (table, v, units, withUnit) => {
  if (!Number.isFinite(v)) return '';
  const [mark, f, digits] = table[base(units)];
  const r = Number((v / f).toFixed(digits));
  return group(Object.is(r, -0) ? 0 : r, digits) + (withUnit === false ? '' : ' ' + mark);
};
export const areaMark = (units) => AREA[base(units)][0];
export const volMark = (units) => VOL[base(units)][0];
export const fmtAreaMm2 = (mm2, units = 'ftin', unit) => fmtPow(AREA, mm2, units, unit);
export const fmtVolMm3 = (mm3, units = 'ftin', unit) => fmtPow(VOL, mm3, units, unit);
/** Metres, square metres and cubic metres (what calculations give) as text in the pick. */
export const fmtM = (m, units = 'ftin') => lenMark(m * 1000, units);
export const fmtM2 = (m2, units = 'ftin', unit) => fmtAreaMm2(m2 * 1e6, units, unit);
export const fmtM3 = (m3, units = 'ftin', unit) => fmtVolMm3(m3 * 1e9, units, unit);

/**
 * A refusal's limits ("at least 10 mm thick", "up to 12 m") in the display unit. Only plain "N mm" / "N m" are rewritten
 * (never m² m³ m/s), and a message that already gives feet-inches or inches (3'-4", 4") is left as written.
 */
export function localizeLengths(text, units = 'ftin') {
  const s = String(text ?? '');
  if (/\d\s?['"]/.test(s)) return s;
  return s.replace(/(\d+(?:\.\d+)?) ?(mm|m)\b(?![²³\/])/g, (all, n, u) => lenMark(Number(n) * (u === 'm' ? 1000 : 1), units));
}

/**
 * A calculation's sentence in the pick: lengths ("4.2 m", "300 mm"), areas ("24 m²") and volumes ("60 m³") after a number.
 * A rate or density ("W/m²", "kg/m³", "m/s", "kN/m", "mm²/m") has no number straight before its unit and is left alone. A
 * sentence that already carries feet-inches marks is left as written.
 */
export function localizeQuantities(text, units = 'ftin') {
  const s = String(text ?? '');
  if (/\d\s?['"]/.test(s)) return s;
  return s.replace(/(-?\d+(?:\.\d+)?) ?(mm|m)(²|³)?(?![A-Za-z\/²³])/g, (all, n, u, pow) => {
    const v = Number(n);
    if (!pow) return lenMark(v * (u === 'm' ? 1000 : 1), units);
    if (u === 'mm') return all;   // mm² / mm³ are the calculation's own (bar areas), not a room's
    return pow === '²' ? fmtM2(v, units) : fmtM3(v, units);
  });
}

/** A paper size's dimensions in the pick (the paper's name, A3 or Letter, stays as it is). Feet-inches → decimal inches. */
export function fmtPaper(wMm, hMm, units = 'ftin') {
  if (!Number.isFinite(wMm) || !Number.isFinite(hMm)) return '';
  const u = units === 'ftin' ? 'in' : units;
  const d = { mm: 1, cm: 1, m: 3, in: 2, ftdec: 3 }[u] ?? 1;
  const n = (v) => String(Number((v / FACTOR[u]).toFixed(d)));
  return n(wMm) + ' × ' + n(hMm) + ' ' + unitMark(u);
}

/** The standard papers, portrait, width × height in millimetres (the sheets and PDFs themselves are landscape). */
export const PAPER_MM = Object.freeze({ letter: [215.9, 279.4], a4: [210, 297], tabloid: [279.4, 431.8], archd: [609.6, 914.4], a3: [297, 420], a1: [594, 841], a2: [420, 594], a0: [841, 1189], archc: [457.2, 609.6], arche: [914.4, 1219.2] });   // 0.9 SU.1123: A2, A0, Arch C, Arch E
/** "Letter · 8.5 × 11 in": the paper's name stays, the dimensions follow the pick. An unknown paper is just its name. */
export const paperLabel = (name, key, units = 'ftin') => (PAPER_MM[key] ? name + ' · ' + fmtPaper(PAPER_MM[key][0], PAPER_MM[key][1], units) : name);

/**
 * Map E/N and the CRS's own unit: null when the pick's family is the CRS's (metres ↔ m, feet ↔ ft), else the CRS unit id
 * ('m', 'ft', 'us-ft') so a surveyor sees what the system itself is written in. `crsUnit` as a CRS says it ('m', 'ft', 'us-ft', 'ftUS').
 */
export function crsUnitNote(units, crsUnit) {
  if (!crsUnit) return null;
  const c = /us/i.test(String(crsUnit)) ? 'us-ft' : /^(ft|foot|feet)/i.test(String(crsUnit)) ? 'ft' : /^(m|metre|meter)/i.test(String(crsUnit)) ? 'm' : String(crsUnit);
  const mine = units === 'm' ? 'm' : units === 'ftin' || units === 'ftdec' ? 'ft' : units;
  return c === mine ? null : c;
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * units.js — the same pool typed and read in metric or in feet and inches (0.11 POOL.8). Host-free. The engine works in millimetres, m³, m³/h
 * throughout; this only turns what a person types into those and what is shown back out of them. Exact by definition: 1 in = 25.4 mm,
 * 1 ft = 12 in, 1 US gallon = 231 in³ = 3.785411784 L, 1 lb = 0.45359237 kg.
 *
 * US system: a long figure (length, width, depths, …) is typed in feet and inches — 26'-3", 26' 3 1/2", 26'3, 26.25 (feet), 315" or
 * 315 in — and shown as 26'-3 1/2" (to the nearest 1/16"); a short figure (thicknesses, tiles, covers) in inches (9.84, 9 7/8", 1'-2").
 * Either system also takes "8 m", "8000 mm", "800 cm".
 */
const IN = 25.4, FT = 304.8, GAL = 3.785411784e-3, LB = 0.45359237;

export const FIELD_KIND = {
  length: 'long', width: 'long', depthShallow: 'long', depthDeep: 'long', stepWidth: 'long', pavingWidth: 'long', roomGap: 'long', roomHeight: 'long',
  notchL: 'long', notchW: 'long', stepsAt: 'long', gateWidth: 'long', barrierHeight: 'long', atX: 'long', atY: 'long',
  freeboard: 'short', finish: 'short', riser: 'short', tread: 'short', tileL: 'short', tileW: 'short', joint: 'short', copingWidth: 'short', copingThickness: 'short',
  pavingThickness: 'short', paverL: 'short', paverW: 'short', gutterWidth: 'short', gutterDepth: 'short', gutterWall: 'short', roomWall: 'short',
  wall: 'short', floor: 'short', coverWater: 'short', coverEarth: 'short', benchSeat: 'short', benchDepth: 'short', barDia: 'short', barSpacing: 'short',
};
export const imperial = (system) => system === 'imperial';
/** The unit a field is typed in: 'mm' | 'ft-in' | 'in' | '' (not a length). */
export const fieldUnit = (field, system) => (FIELD_KIND[field] ? (imperial(system) ? (FIELD_KIND[field] === 'long' ? 'ft-in' : 'in') : 'mm') : '');

const FRAC = /^(\d+(?:\.\d+)?)?\s*(?:(\d+)\s*\/\s*(\d+))?$/;
const num = (s) => { const m = FRAC.exec(String(s).trim()); if (!m || (m[1] === undefined && m[2] === undefined)) return NaN; return (m[1] !== undefined ? Number(m[1]) : 0) + (m[2] !== undefined ? Number(m[2]) / Number(m[3]) : 0); };

/**
 * A typed length → millimetres (NaN when it is not one). kind 'long' | 'short' says what a bare number means in the US system (feet | inches);
 * in metric a bare number is millimetres.
 */
export function parseLength(text, kind = 'long', system = 'metric') {
  let s = String(text ?? '').trim().toLowerCase().replace(/[′’]/g, "'").replace(/[″”]/g, '"').replace(/''/g, '"');
  if (!s) return NaN;
  let sign = 1;
  if (s.startsWith('-')) { sign = -1; s = s.slice(1).trim(); }
  let m = /^([\d.\s/]+)\s*(mm|cm|m)$/.exec(s);
  if (m) { const v = num(m[1]); return sign * v * (m[2] === 'mm' ? 1 : m[2] === 'cm' ? 10 : 1000); }
  m = /^([\d.]+)\s*(?:'|ft|feet)\s*-?\s*([\d.\s/]*)\s*(?:"|in|inch|inches)?$/.exec(s);
  if (m) { const ft = Number(m[1]), inch = m[2].trim() ? num(m[2]) : 0; return Number.isFinite(ft) && Number.isFinite(inch) ? sign * (ft * FT + inch * IN) : NaN; }
  m = /^([\d.\s/]+)\s*(?:"|in|inch|inches)$/.exec(s);
  if (m) { const v = num(m[1]); return sign * v * IN; }
  const v = num(s);
  if (!Number.isFinite(v)) return NaN;
  if (!imperial(system)) return sign * v;
  return sign * v * (kind === 'long' ? FT : IN);
}
/** Inches as a whole number and sixteenths: 3.5 → '3 1/2'. */
function inches(x) {
  let whole = Math.floor(x + 1e-9), six = Math.round((x - whole) * 16);
  if (six === 16) { whole++; six = 0; }
  if (!six) return String(whole);
  let n = six, dd = 16; while (n % 2 === 0) { n /= 2; dd /= 2; }
  return (whole ? whole + ' ' : '') + n + '/' + dd;
}
/** Millimetres as feet and inches: 8000 → 26'-2 15/16". */
export function formatFtIn(mm) {
  if (!Number.isFinite(mm)) return '';
  const neg = mm < 0, t = Math.round((Math.abs(mm) / IN) * 16) / 16;
  let ft = Math.floor(t / 12 + 1e-9), rest = t - ft * 12;
  if (rest >= 12 - 1e-9) { ft++; rest = 0; }
  return (neg ? '-' : '') + ft + "'-" + inches(rest) + '"';
}
/** Millimetres as inches for a short figure: 250 → 9 7/8". */
export const formatIn = (mm) => (Number.isFinite(mm) ? (mm < 0 ? '-' : '') + inches(Math.round((Math.abs(mm) / IN) * 16) / 16) + '"' : '');
/** A stored (mm) field value as the text a box shows. */
export function showField(field, mm, system) {
  if (mm === null || mm === undefined || mm === '') return '';
  if (!FIELD_KIND[field] || !imperial(system)) return String(mm);
  return FIELD_KIND[field] === 'long' ? formatFtIn(Number(mm)) : formatIn(Number(mm));
}
/** What a person typed in a field → the millimetres to store (NaN when it is not a length). */
export const readField = (field, text, system) => parseLength(text, FIELD_KIND[field] || 'long', system);

/** Corners "x,y; x,y" typed in either system → the same text in millimetres; { text, bad }. */
export function cornersToMm(text, system) {
  const out = [], bad = [];
  for (const raw of String(text || '').split(/[;\n]+/)) {
    const s = raw.trim(); if (!s) continue;
    const m = s.split(/\s*,\s*/), x = m.length === 2 ? parseLength(m[0], 'long', system) : NaN, y = m.length === 2 ? parseLength(m[1], 'long', system) : NaN;
    if (Number.isFinite(x) && Number.isFinite(y)) out.push(Math.round(x * 1000) / 1000 + ',' + Math.round(y * 1000) / 1000); else bad.push(s);
  }
  return { text: out.join('; '), bad };
}
/** Corners in millimetres → as the person's system shows them. */
export function cornersShown(text, system) {
  if (!imperial(system)) return String(text || '');
  return String(text || '').split(/[;\n]+/).map((r) => r.trim()).filter(Boolean).map((r) => r.split(/\s*,\s*/).map((v) => formatFtIn(Number(v))).join(', ')).join('; ');
}
/** Benches "side, from, length" with lengths in either system → millimetres. */
export function benchesToMm(text, system) {
  const out = [], bad = [];
  for (const raw of String(text || '').split(/[;\n]+/)) {
    const s = raw.trim(); if (!s) continue;
    const m = s.split(/\s*,\s*/), side = Number(m[0]), a = parseLength(m[1], 'long', system), b = parseLength(m[2], 'long', system);
    if (m.length === 3 && Number.isInteger(side) && Number.isFinite(a) && Number.isFinite(b)) out.push(side + ',' + Math.round(a) + ',' + Math.round(b)); else bad.push(s);
  }
  return { text: out.join('; '), bad };
}
export function benchesShown(text, system) {
  if (!imperial(system)) return String(text || '');
  return String(text || '').split(/[;\n]+/).map((r) => r.trim()).filter(Boolean).map((r) => { const m = r.split(/\s*,\s*/); return [m[0], formatFtIn(Number(m[1])), formatFtIn(Number(m[2]))].join(', '); }).join('; ');
}

/** Output units: SI unit → [US unit, SI units per US unit]. */
const OUT = { mm: ['in', IN], m: ['ft', FT / 1000], m2: ['ft²', (FT / 1000) ** 2], m3: ['gal', GAL], 'm3/h': ['gpm', GAL * 60], 'm/h': ['gpm/ft²', (GAL * 60) / ((FT / 1000) ** 2)], 'm/s': ['ft/s', FT / 1000], kg: ['lb', LB] };
const PRETTY = { m2: 'm²', m3: 'm³', 'm3/h': 'm³/h' };
/** A result in an SI unit as { value, unit } in the system asked. */
export function shown(value, unit, system) {
  const o = OUT[unit];
  if (!imperial(system) || !o) return { value, unit: PRETTY[unit] || unit };
  return { value: value / o[1], unit: o[0] };
}

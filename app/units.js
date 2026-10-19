/* SPDX-License-Identifier: Apache-2.0 */
/**
 * units.js — drawing units, stations and number formatting for CivilCraft. No DOM.
 *
 * A project is in US feet ('ft') or metres ('m'); every coordinate, elevation and length is in
 * that unit. Stations: feet use 100 ft stations ("12+34.56"), metres 1000 m ("1+234.567").
 * Grades are stored as fractions (0.02) and shown in percent; side slopes as H:V (3 = 3:1).
 *
 * Typed lengths (0.6 DF.3): readLength(text, unit) → { ok, value } | { ok: false, error } — a plain number (project units),
 * or a length with its own marks (12'6", 12' 6 1/2", 6", 3 ft 6 in, 4 7/16, 450 mm, 1.2 m, 90 cm), or arithmetic over them
 * (4+7/16, 12'6" + 3/4", (24'-0")/3, 2*450mm) through lencalc.js. Feet and inches are international feet in a metre
 * project and project feet in a feet project (US survey feet: the 2 ppm is not a typing matter). Never for stations:
 * "10+00" is a station (parseStation).
 */

import { t } from "./i18n.js";
import { calc, hasArithmetic } from './lencalc.js';   // 0.6 DF.3: + - * / and brackets (a copy: tools/lencalc/sync.mjs; never edit it)

export const UNITS = {
  ft: { key: 'ft', get name() { return t('units.ft'); }, short: 'ft', area: 'sq ft', vol: 'cu yd', volPer: 27, staLen: 100, staDec: 2, dec: 2, landxml: 'USSurveyFoot' },   // i18n-ignore: unit symbols and the LandXML unit name
  m: { key: 'm', get name() { return t('units.m'); }, short: 'm', area: 'sq m', vol: 'cu m', volPer: 1, staLen: 1000, staDec: 3, dec: 3, landxml: 'meter' },   // i18n-ignore: unit symbols and the LandXML unit name
};
export const unitOf = (u) => UNITS[u] || UNITS.ft;

/** Metres per unit for linear units found in files (LandXML linearUnit names). */
export const METRES_PER = { USSurveyFoot: 1200 / 3937, foot: 0.3048, ft: 0.3048, meter: 1, m: 1, metre: 1, millimeter: 0.001, centimeter: 0.01, kilometer: 1000 };

/** "12+34.56" (ft) or "1+234.567" (m). Negative stations keep their sign in front: "-0+50.00". */
export function formatStation(sta, unit = 'ft', dec) {
  if (!Number.isFinite(sta)) return '';
  const u = unitOf(unit), d = dec ?? u.staDec;
  const neg = sta < 0;
  const r = Number(Math.abs(sta).toFixed(d));
  const big = Math.floor(r / u.staLen + 1e-9);
  let rest = r - big * u.staLen;
  if (rest < 0) rest = 0;
  const w = String(u.staLen).length - 1;   // digits before the point: 2 for ft, 3 for m
  const restStr = rest.toFixed(d).padStart(w + (d ? d + 1 : 0), '0');
  return (neg ? '-' : '') + big + '+' + restStr;
}

/** Parses "12+34.56", "1234.56", "-0+50" → number (in the project unit), or null. */
export function parseStation(s, unit = 'ft') {
  const t = String(s ?? '').trim().replace(/\s+/g, '');
  if (!t) return null;
  const m = t.match(/^([+-]?)(\d+)\+(\d+(?:\.\d*)?)$/);
  if (m) {
    const v = Number(m[2]) * unitOf(unit).staLen + Number(m[3]);
    return m[1] === '-' ? -v : v;
  }
  return isNum(t) ? Number(t) : null;
}

const M_PER_IN = 0.0254;
/** One length as CivilCraft reads it → its value in project units (null when it is not one). */
function oneLength(x, unit) {
  let s = String(x).trim().toLowerCase().replace(/\s+/g, ' ');
  if (isNum(s)) return Number(s);
  const toUnit = (metres) => (unit === 'm' ? metres : metres / M_PER_IN / 12);   // feet project: inches to feet as 12 to 1
  const m = s.match(/^(\d+(?:\.\d*)?|\.\d+) ?(mm|cm|m)$/);
  if (m) return toUnit(Number(m[1]) * (m[2] === 'mm' ? 0.001 : m[2] === 'cm' ? 0.01 : 1));
  // a number with a fraction: 4 7/16, 4-7/16, 7/16 (in the unit it stands in)
  const frac = (q) => { const f = q.trim().match(/^(?:(\d+)[ -])?(\d+)\/(\d+)$/); if (f) return f[3] === '0' ? null : (Number(f[1] || 0) + Number(f[2]) / Number(f[3])); return isNum(q.trim()) ? Number(q) : null; };
  const bare = frac(s);
  if (bare !== null) return bare;
  // feet and inches: 12'6", 12' 6 1/2", 12'-6", 6", 3 ft 6 in, 3ft, 6 in
  s = s.replace(/\b(feet|foot|ft)\b\.?/g, "'").replace(/\b(inches|inch|in)\b\.?/g, '"').replace(/''/g, '"');
  const fi = s.match(/^(?:([\d./ -]+?) ?')?(?: ?-? ?([\d./ -]+?) ?")?$/);
  if (!fi || (!fi[1] && !fi[2])) return null;
  const ft = fi[1] ? frac(fi[1]) : 0, inch = fi[2] ? frac(fi[2]) : 0;
  if (ft === null || inch === null) return null;
  const feet = ft + inch / 12;
  return unit === 'm' ? feet * 12 * M_PER_IN : feet;
}
/** A typed length or sum of lengths (see the header) → { ok, value } | { ok: false, error }. */
export function readLength(text, unit = 'ft') {
  const s = String(text ?? '').trim().replace(/[′’‘`]/g, "'").replace(/[″“”]/g, '"').replace(/[−–—]/g, '-').replace(/,/g, '');
  if (!s) return { ok: false, error: t('cv.len.bad', { text: '' }) };
  if (hasArithmetic(s)) {
    // a bare number is a plain factor until it is used as a length: then it is in project units (plain 1)
    const r = calc(s, (x) => { const bare = /^[\d.\s/-]+$/.test(x), v = oneLength(x, unit); return v === null ? null : { value: v, unit: !bare }; }, { plain: 1 });
    return r.ok ? { ok: true, value: r.value } : { ok: false, error: t('calc.err.' + r.code, { pos: r.pos + 1, text: r.text }) };
  }
  // a leading sign stays a sign (-5, -6"); hasArithmetic leaves those to us
  const sign = s.startsWith('-') ? -1 : 1, v = oneLength(s.replace(/^[+-]/, ''), unit);
  return v === null ? { ok: false, error: t('cv.len.bad', { text: s }) } : { ok: true, value: sign * v };
}

export function isNum(s) { return typeof s === 'number' ? Number.isFinite(s) : /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(String(s).trim()); }

/** A fixed-decimals number with thousands separators off (coordinates read better without). */
export function fixed(n, d = 2) {
  if (!Number.isFinite(n)) return '';
  const v = Math.abs(n) < 0.5 * Math.pow(10, -d) ? 0 : n;
  return v.toFixed(d);
}
/** Grouped number for areas/volumes: 12,345.6 */
export function grouped(n, d = 0) {
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
export const pct = (g, d = 2) => (Number.isFinite(g) ? (g * 100 >= 0 ? '+' : '') + fixed(g * 100, d) + '%' : '');

/** A volume in the unit's report unit (cu yd for feet, cu m for metres). */
export function volumeText(v, unit = 'ft', d = 1) { const u = unitOf(unit); return grouped(v / u.volPer, d) + ' ' + u.vol; }
export function areaText(a, unit = 'ft', d = 0) { return grouped(a, d) + ' ' + unitOf(unit).area; }

/** Bearing text for a direction angle (radians, math convention: 0 = east, CCW) → N 45°12'30" E. */
export function bearing(a) {
  let az = (90 - a * 180 / Math.PI) % 360;   // azimuth from north, clockwise
  if (az < 0) az += 360;
  let q, ang;
  if (az <= 90) { q = ['N', 'E']; ang = az; } else if (az <= 180) { q = ['S', 'E']; ang = 180 - az; } else if (az <= 270) { q = ['S', 'W']; ang = az - 180; } else { q = ['N', 'W']; ang = 360 - az; }
  return q[0] + ' ' + dms(ang) + ' ' + q[1];
}
export function dms(deg) {
  let s = Math.round(Math.abs(deg) * 3600);
  const d = Math.floor(s / 3600); s -= d * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  return d + '°' + String(m).padStart(2, '0') + "'" + String(s).padStart(2, '0') + '"';
}

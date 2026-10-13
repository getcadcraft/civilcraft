/* SPDX-License-Identifier: Apache-2.0 */
/**
 * points.js — survey point files (CSV / TXT) and point groups. No DOM.
 *
 *   parsePoints(text, { format = 'auto', prefer }) → { points, format, formatFrom, delimiter, header, bad, skipped, duplicates }
 *   groupKey(desc) → 'GRD'      first word of the description, upper case ('' → '(no description)')
 *   pointGroups(points) → [{ key, count }]   sorted by key
 *   lassoPoints(points, path, mode, r) → the points a lasso picks (0.4 W2.7; lasso-core.js): path = [{x, y}] in project
 *     coordinates, mode 'window' | 'crossing' | 'fence'; each point counts as a small cross of half-size r (the pick
 *     tolerance in project units), so a fence picks the points its path passes over
 *
 * Point: { n (point number/name, string), x (easting), y (northing), z (elevation | null), d (description) }.
 * Formats name the column order: P point, N northing, E easting, Z elevation, D description.
 * Delimiters: comma, tab, semicolon or runs of spaces (detected from the first data lines). A header
 * row is recognised when its coordinate columns are not numbers; when it names its columns
 * (Northing/Easting/Elevation/X/Y/Z/Point/Desc…) the order comes from it. Lines starting with
 * # ; or // are comments. `prefer` 'PENZD' makes a guess from the column count read easting first (P E N Z D);
 * the default guess is PNEZD (a header row, or a chosen format, always wins). Every row that cannot be read is reported with its line number and why.
 * GIS: a header naming latitude and longitude columns (lat, latitude / lon, long, longitude) sets `latlon: true` —
 * then y = latitude and x = longitude in degrees (rows outside ±90 / ±180 are refused); the page converts them to
 * project coordinates through the project's coordinate system (or asks for one), never loading degrees as feet.
 */

import { t } from "./i18n.js";
import { isNum } from './units.js';
import { lassoSelect } from './lasso-core.js';

export const FORMATS = ['PNEZD', 'PENZD', 'PNEZ', 'PENZ', 'NEZD', 'ENZD', 'NEZ', 'ENZ'];
const MAX_BAD = 200;

export function parsePoints(text, { format = 'auto', prefer = 'PNEZD' } = {}) {
  const raw = String(text ?? '').replace(/^﻿/, '').split(/\r\n|\r|\n/);
  const rows = [];
  raw.forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith(';') || t.startsWith('//')) return;
    rows.push({ line: i + 1, text: line });
  });
  const out = { points: [], format: null, formatFrom: '', delimiter: null, header: null, bad: [], badCount: 0, duplicates: 0 };
  if (!rows.length) return out;

  const delim = detectDelimiter(rows.slice(0, 20).map((r) => r.text));
  out.delimiter = delim;
  const split = (s) => splitRow(s, delim);

  // header?
  let start = 0, fmt = null;
  const first = split(rows[0].text);
  const numericCols = first.filter((c) => isNum(c)).length;
  if (numericCols < 2) {
    out.header = first;
    start = 1;
    fmt = formatFromHeader(first);
    if (fmt) out.formatFrom = 'header';
    // GIS: columns named latitude / longitude hold degrees, not northing / easting (docs/GIS-SPEC.md §2)
    const names = first.map((c) => c.toLowerCase().replace(/[\s._()-]/g, ''));
    if (fmt && names.some((c) => /^(lat|latitude)$/.test(c)) && names.some((c) => /^(lon|long|longitude)$/.test(c))) out.latlon = true;
  }
  if (format !== 'auto' && FORMATS.includes(format)) { fmt = format; out.formatFrom = 'chosen'; }
  if (!fmt) {
    // by column count: 5 or more → PNEZD (the most common), 4 → PNEZ when the first column is a whole
    // number, NEZD otherwise, 3 → NEZ. PNEZD and PENZD cannot be told apart from numbers alone.
    const sample = rows.slice(start, start + 20).map((r) => split(r.text));
    const n = mode(sample.map((c) => c.length));
    if (n >= 5) fmt = 'PNEZD';
    else if (n === 4) fmt = sample.every((c) => /^\d+$/.test(c[0]) && isNum(c[3] ?? '')) ? 'PNEZ' : 'NEZD';
    else fmt = 'NEZ';
    if (prefer === 'PENZD') fmt = { PNEZD: 'PENZD', PNEZ: 'PENZ', NEZD: 'ENZD', NEZ: 'ENZ' }[fmt];
    out.formatFrom = 'columns';
  }
  out.format = fmt;

  const cols = fmt.split('');
  const iP = cols.indexOf('P'), iN = cols.indexOf('N'), iE = cols.indexOf('E'), iZ = cols.indexOf('Z'), iD = cols.indexOf('D');
  const seen = new Set();
  let auto = 0;
  const bad = (r, why) => { out.badCount++; if (out.bad.length < MAX_BAD) out.bad.push({ line: r.line, text: r.text.slice(0, 160), why }); };
  for (let k = start; k < rows.length; k++) {
    const r = rows[k];
    let c = split(r.text);
    // whitespace-separated descriptions may contain spaces: glue the tail back on
    if (iD === cols.length - 1 && c.length > cols.length) c = [...c.slice(0, iD), c.slice(iD).join(delim === 'ws' ? ' ' : delim === ',' ? ',' : ' ')];
    if (c.length < cols.length - (iD >= 0 ? 1 : 0)) { bad(r, t('pts.bad.cols', { n: c.length, want: cols.length, format: fmt })); continue; }
    const N = c[iN], E = c[iE], Z = c[iZ];
    if (!isNum(N) || !isNum(E)) { bad(r, t('pts.bad.ne')); continue; }
    if (Z !== undefined && Z !== '' && !isNum(Z)) { bad(r, t('pts.bad.z')); continue; }
    if (out.latlon && (Math.abs(Number(N)) > 90 || Math.abs(Number(E)) > 180)) { bad(r, t('pts.bad.latlon')); continue; }
    let n = iP >= 0 ? String(c[iP] ?? '').trim() : '';
    if (iP >= 0 && !n) { bad(r, t('pts.bad.nonum')); continue; }
    if (iP < 0) { do n = String(++auto); while (seen.has(n)); }
    if (seen.has(n)) { out.duplicates++; bad(r, t('pts.bad.twice', { num: n })); continue; }
    seen.add(n);
    const z = Z === undefined || Z === '' ? null : Number(Z);
    out.points.push({ n, x: Number(E), y: Number(N), z, d: iD >= 0 ? cleanText(c[iD] ?? '') : '' });
  }
  return out;
}

function cleanText(s) { return String(s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200); }

function detectDelimiter(lines) {
  const score = (re) => lines.filter((l) => re.test(l)).length;
  if (score(/,/) >= Math.ceil(lines.length * 0.6)) return ',';
  if (score(/\t/) >= Math.ceil(lines.length * 0.6)) return '\t';
  if (score(/;/) >= Math.ceil(lines.length * 0.6)) return ';';
  return 'ws';
}

/** One row split on the delimiter; "quoted, fields" kept whole (CSV quoting with "" escapes). */
export function splitRow(s, delim) {
  if (delim === 'ws') return s.trim().split(/\s+/);
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) {
      if (ch === '"') { if (s[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch;
    } else if (ch === '"' && cur.trim() === '') { q = true; cur = ''; }
    else if (ch === delim) { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

const HEAD = [
  ['P', /^(pt|pnt|point|pointno|pointnumber|number|no|id|name|pt#|point#|#)$/],
  ['N', /^(n|north|northing|y|ycoord|lat|latitude)$/],
  ['E', /^(e|east|easting|x|xcoord|lon|long|longitude)$/],
  ['Z', /^(z|elev|elevation|el|height|h|zcoord|rl)$/],
  ['D', /^(d|desc|description|code|rawdescription|fullDescription|note|notes|feature)$/i],
];
function formatFromHeader(cells) {
  const letters = cells.map((c) => {
    const k = c.toLowerCase().replace(/[\s._()-]/g, '');
    for (const [L, re] of HEAD) if (re.test(k)) return L;
    return null;
  });
  if (!letters.includes('N') || !letters.includes('E')) return null;
  // keep only the recognised columns in order; unrecognised columns break the mapping
  if (letters.some((l) => l === null)) return null;
  const f = letters.join('');
  return FORMATS.includes(f) ? f : null;
}

function mode(arr) {
  const m = new Map();
  for (const v of arr) m.set(v, (m.get(v) || 0) + 1);
  let best = 0, bv = 0;
  for (const [v, c] of m) if (c > best) { best = c; bv = v; }
  return bv;
}

export function groupKey(desc) {
  const w = String(desc || '').trim().split(/\s+/)[0];
  return w ? w.toUpperCase() : '(no description)';   // i18n-ignore: a group key, stored in the project's surface.groups (data)
}

export function pointGroups(points, keyOf = null) {   // keyOf(point) → group (0.4 V16: description keys); default the first word
  const m = new Map();
  for (const p of points) { const k = keyOf ? keyOf(p) : groupKey(p.d); m.set(k, (m.get(k) || 0) + 1); }
  return [...m].map(([key, count]) => ({ key, count })).sort((a, b) => a.key.localeCompare(b.key));
}

export function lassoPoints(points, path, mode, r) {
  return lassoSelect(points, path, mode, {
    box: (p) => ({ minX: p.x - r, minY: p.y - r, maxX: p.x + r, maxY: p.y + r }),
    segs: (p) => [[p.x - r, p.y, p.x + r, p.y], [p.x, p.y - r, p.x, p.y + r]],
  });
}

/** Points of a group in point-number order (numbers compare numerically when both are numbers). */
export function groupPoints(points, key, keyOf = null) {
  return points.filter((p) => (keyOf ? keyOf(p) : groupKey(p.d)) === key).sort(byNumber);
}
export function byNumber(a, b) {
  const na = Number(a.n), nb = Number(b.n);
  if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  return String(a.n).localeCompare(String(b.n), 'en', { numeric: true });
}

/** A PNEZD comma file of the points (descriptions quoted when they hold a comma or quote). */
export function writePoints(points, dec = 3) {
  const q = (s) => (/[",]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s);
  return points.map((p) => [q(String(p.n)), p.y.toFixed(dec), p.x.toFixed(dec), p.z === null ? '' : p.z.toFixed(dec), q(p.d || '')].join(',')).join('\r\n') + '\r\n';
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-table.js — the attribute table of a GIS layer (0.9 SU.1080 round 2): sorting, filtering, cell edits, field changes, the field
 * calculator and CSV, as pure functions on { name, geom, fields: [{name, type}], features: [{ g, p }] }. No DOM. The only import is
 * gis-analysis.js (the expression language: no eval, a fixed function table). Canonical in lib/gis/; byte-identical copies by
 * tools/gis/sync.mjs --to civilcraft. Nothing here changes its input: every function returns new arrays; features that did not
 * change are the same objects (so a few thousand rows cost a copy of one array, not of the rows).
 *
 *   TYPES · MAX_FIELDS · MAX_NAME
 *   coerce(raw, type) → { ok, value }                 text (kept as typed, ≤ 10,000), number (finite), date (YYYY-MM-DD, a real day), bool; '' → null
 *   compareValues(a, b, type) → −1|0|1                nulls last; numbers numerically, text without regard to case then by code
 *   sortIndices(layer, field, dir, indices?) → [i]    stable
 *   filterIndices(layer, text) → { indices, mode: 'all'|'expression'|'value', error? }   an expression when it parses, else a value
 *     search over every column (all words must appear)
 *   fieldProblem(fields, name, except?) → null | 'empty' | 'long' | 'dup' | 'chars'
 *   setCell(features, i, field, value) → features'     value already coerced
 *   addField(layer, name, type) → { fields, features } | { error }        new field empty (null) in every feature
 *   renameField(layer, from, to) → { fields, features, label?, symbology? } | { error }
 *   removeField(layer, name) → { fields, features }
 *   calculate(layer, target, expression, indices?) → { features, changed, nulls } | { error }     target is an existing field
 *   toCsv(layer, indices?) → text                     RFC 4180, CRLF; a text cell that starts with = + - @ gets a leading apostrophe
 */

import { parseQuery } from './gis-analysis.js';

export const TYPES = ['text', 'number', 'date', 'bool'];
export const MAX_FIELDS = 500;
export const MAX_NAME = 64;
export const MAX_TEXT = 10000;
const isNull = (v) => v === null || v === undefined || v === '';
const copy = (p) => { const o = Object.create(null); for (const k of Object.keys(p || {})) o[k] = p[k]; return o; };

function validDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (mo < 1 || mo > 12 || d < 1) return false;
  const dim = [31, y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
  return d <= dim;
}
/** A typed or calculated value as the field's type. '' and null are "no value". */
export function coerce(raw, type) {
  if (isNull(raw)) return { ok: true, value: null };
  if (type === 'number') {
    const x = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw.trim().replace(/,/g, '')) : typeof raw === 'boolean' ? NaN : NaN;
    return Number.isFinite(x) ? { ok: true, value: x } : { ok: false };
  }
  if (type === 'bool') {
    if (typeof raw === 'boolean') return { ok: true, value: raw };
    if (typeof raw === 'number') return raw === 1 || raw === 0 ? { ok: true, value: raw === 1 } : { ok: false };
    const s = String(raw).trim().toLowerCase();
    if (['true', 'yes', 'y', '1', 't'].includes(s)) return { ok: true, value: true };
    if (['false', 'no', 'n', '0', 'f'].includes(s)) return { ok: true, value: false };
    return { ok: false };
  }
  if (type === 'date') {
    const s = String(raw).trim().slice(0, 10);
    return validDate(s) ? { ok: true, value: s } : { ok: false };
  }
  const s = String(typeof raw === 'number' ? +raw.toFixed(10) : raw).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ').slice(0, MAX_TEXT);
  return { ok: true, value: s };
}

export function compareValues(a, b, type) {
  const na = isNull(a), nb = isNull(b);
  if (na || nb) return na && nb ? 0 : na ? 1 : -1;   // nulls last (the caller flips only the non-null order)
  if (type === 'number' || (typeof a === 'number' && typeof b === 'number')) { const x = Number(a), y = Number(b); return x < y ? -1 : x > y ? 1 : 0; }
  if (typeof a === 'boolean' || typeof b === 'boolean') return Number(!!a) - Number(!!b);
  const s = String(a), t = String(b), sl = s.toLowerCase(), tl = t.toLowerCase();
  return sl < tl ? -1 : sl > tl ? 1 : s < t ? -1 : s > t ? 1 : 0;
}
export function sortIndices(layer, field, dir = 'asc', indices = null) {
  const idx = indices ? indices.slice() : layer.features.map((_, i) => i);
  const f = layer.fields.find((x) => x.name === field);
  if (!f) return idx;
  const sign = dir === 'desc' ? -1 : 1, fs = layer.features;
  return idx.map((i, k) => [i, k]).sort((a, b) => {
    const x = fs[a[0]]?.p?.[field], y = fs[b[0]]?.p?.[field];
    const nx = isNull(x), ny = isNull(y);
    if (nx || ny) return nx && ny ? a[1] - b[1] : nx ? 1 : -1;   // nulls stay last in both directions
    return sign * compareValues(x, y, f.type) || a[1] - b[1];
  }).map((p) => p[0]);
}

export function filterIndices(layer, text) {
  const q = String(text ?? '').trim().slice(0, 2000);
  const all = layer.features.map((_, i) => i);
  if (!q) return { indices: all, mode: 'all' };
  const parsed = parseQuery(q, layer.fields);
  if (!parsed.error) {
    const out = [];
    layer.features.forEach((f, i) => { if (parsed.test(f)) out.push(i); });
    return { indices: out, mode: 'expression' };
  }
  // not an expression (a word that is no field, a stray quote): look for the words in every column
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const out = [];
  layer.features.forEach((f, i) => {
    const hay = layer.fields.map((fl) => (isNull(f.p?.[fl.name]) ? '' : String(f.p[fl.name]))).join('\u0001').toLowerCase();
    if (words.every((w) => hay.includes(w))) out.push(i);
  });
  return { indices: out, mode: 'value', error: parsed.error };
}

export function fieldProblem(fields, name, except = null) {
  const n = String(name ?? '').trim();
  if (!n) return 'empty';
  if (n.length > MAX_NAME) return 'long';
  if (/[\u0000-\u001f\u007f"\[\]]/.test(n)) return 'chars';
  if (fields.some((f) => f.name.toLowerCase() === n.toLowerCase() && f.name !== except)) return 'dup';
  return null;
}

export function setCell(features, i, field, value) {
  if (!features[i]) return features;
  const out = features.slice();
  const p = copy(features[i].p);
  p[field] = value;
  out[i] = { g: features[i].g, p };
  return out;
}

export function addField(layer, name, type) {
  const n = String(name ?? '').trim();
  const bad = fieldProblem(layer.fields, n);
  if (bad) return { error: bad };
  if (!TYPES.includes(type)) return { error: 'type' };
  if (layer.fields.length >= MAX_FIELDS) return { error: 'many' };
  return { fields: [...layer.fields.map((f) => ({ name: f.name, type: f.type })), { name: n, type }], features: layer.features.map((f) => { const p = copy(f.p); p[n] = null; return { g: f.g, p }; }), name: n };
}
export function renameField(layer, from, to) {
  const n = String(to ?? '').trim();
  if (!layer.fields.some((f) => f.name === from)) return { error: 'nofield' };
  const bad = fieldProblem(layer.fields, n, from);
  if (bad) return { error: bad };
  const fields = layer.fields.map((f) => ({ name: f.name === from ? n : f.name, type: f.type }));
  const features = layer.features.map((f) => {
    if (!f.p || !(from in f.p)) return f;
    const p = Object.create(null);
    for (const k of Object.keys(f.p)) p[k === from ? n : k] = f.p[k];
    return { g: f.g, p };
  });
  return { fields, features, name: n };
}
export function removeField(layer, name) {
  if (!layer.fields.some((f) => f.name === name)) return { error: 'nofield' };
  return { fields: layer.fields.filter((f) => f.name !== name).map((f) => ({ name: f.name, type: f.type })), features: layer.features.map((f) => { if (!f.p || !(name in f.p)) return f; const p = copy(f.p); delete p[name]; return { g: f.g, p }; }) };
}

/** Writes the expression's value into `target` for the given features (default all). A value the field's type cannot hold
 *  becomes empty and is counted in `nulls`. */
export function calculate(layer, target, expression, indices = null) {
  const fld = layer.fields.find((f) => f.name === target);
  if (!fld) return { error: { code: 'nofield' } };
  const text = String(expression ?? '').slice(0, 4000);
  const q = parseQuery(text, layer.fields);
  if (q.error) return { error: q.error };
  const which = indices ? new Set(indices) : null;
  let changed = 0, nulls = 0;
  const features = layer.features.map((f, i) => {
    if (which && !which.has(i)) return f;
    let v;
    try { v = q.value(f); } catch { v = null; }
    const c = coerce(v, fld.type);
    if (!c.ok) { nulls++; v = null; } else v = c.value;
    const old = f.p?.[target];
    if (v === old || (isNull(v) && isNull(old))) return f;
    changed++;
    const p = copy(f.p); p[target] = v;
    return { g: f.g, p };
  });
  return { features, changed, nulls };
}

const cell = (v, type) => {
  if (isNull(v)) return '';
  let s = typeof v === 'boolean' ? (v ? 'true' : 'false') : typeof v === 'number' ? String(v) : String(v);
  if (type !== 'number' && typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
export function toCsv(layer, indices = null) {
  const head = layer.fields.map((f) => cell(f.name, 'text')).join(',');
  const rows = (indices || layer.features.map((_, i) => i)).map((i) => layer.fields.map((f) => cell(layer.features[i]?.p?.[f.name], f.type)).join(','));
  return [head, ...rows].join('\r\n') + '\r\n';
}

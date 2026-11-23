/* SPDX-License-Identifier: Apache-2.0 */
/**
 * book.js — the land book of a project: one record per parcel (what the register, the deed or the plan says about it), the walks taken on
 * the ground, the proposals (subdivide, consolidate, move a boundary, change a designation) and the person's own tolerances and lot rules
 * (0.11 LR.3). DOM-free; Node-tested (bin/test-landrecords.mjs). A copy of this one file is CivilCraft's dev/landbook.js, so the project
 * file reads its `land` key with the add-on switched off (tools/landrecords/sync.mjs makes the copy; nobody edits it).
 *
 * book = { v: 1, seq, records: [record], walks: [walk], proposals: [proposal], rules: [rule], settings, applicant }
 *   record   { id 'lr<n>', parcel: the drawing's parcel id | null, ref (lot, plan, title or parcel number), holder, tenure, use (land-use
 *              designation), zone, recordArea: number | null, areaUnit: 'm2' | 'ha' | 'ft2' | 'ac', source (the document the figures come from),
 *              status: 'draft' | 'walked' | 'surveyed' | 'agreed' | 'disputed' | 'registered', notes, parent: [ref] (what it was cut from or made of) }
 *   proposal { id 'lp<n>', kind: 'subdivision' | 'consolidation' | 'boundary' | 'designation', title, parents: [parcel id], children: [{ name,
 *              pts: [{ x, y }], use, zone }], from: { use, zone }, to: { use, zone }, reason, status: 'draft' | 'applied', made (ms) }
 *   rule     { id 'lu<n>', use (the designation it is for; '' = every lot), minArea (m², 0 = none), minFrontage (m, 0 = none) }   typed by the person
 *   settings { areaTolPct, gapTol (m), maxAcc (m), averageS (seconds of fixes averaged per point) }                             the person's own
 *   applicant { name, agent, address, contact, authority, site }   what the documents need and no drawing knows
 *
 * NOTHING HERE IS A RULE OF ANY PLACE. The add-on ships no authority's lot sizes, tolerances or forms: a figure is one the person typed, and a
 * holder's name is personal data that stays in the project file.
 *
 *   emptyBook() · cleanBook(o) → book (untrusted: the project file; never throws, drops what it cannot read)
 *   AREA_UNITS { m2, ha, ft2, ac } (square metres each; the acre is the international one, 43,560 international square feet) · toM2(v, unit) · fromM2
 *   STATUSES · TENURES (free text is kept; these are only the list offered) · KINDS
 *   addRecord(book, fields) → record · setRecord(book, id, fields) → record | null · removeRecord(book, id) · recordOf(book, parcelId)
 *   recordsCsv(book, parcelName) → text · parseRecordsCsv(text) → { rows: [fields], errors: [{ line, why }] }
 *   recordsFromFeatures(features, map) → [{ fields, ring }]   GIS polygons ([{ ring, props }]) with the fields named by map { ref, holder, use, zone, area, areaUnit }
 *   landUse(book, parcels) → [{ use, zone, lots, area (m²), share }]   the takeoff of land by designation (parcels: [{ id, areaM2 }])
 */
import { fin } from './geo.js';
import { csvRows } from './walk.js';
import { BOOK_VERSION, AREA_UNITS, STATUSES, KINDS, MAX, DEFAULT_SETTINGS, emptyBook, cleanBook, bookEmpty, cleanRecord, ringOf } from './clean.js';
export { BOOK_VERSION, AREA_UNITS, STATUSES, KINDS, MAX, DEFAULT_SETTINGS, emptyBook, cleanBook, bookEmpty };

const str = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
export const toM2 = (v, unit) => v * (AREA_UNITS[unit] || 1);
export const fromM2 = (v, unit) => v / (AREA_UNITS[unit] || 1);
export const TENURES = ['', 'freehold', 'leasehold', 'customary', 'public', 'common', 'other'];

export const recordOf = (book, parcelId) => book.records.find((r) => r.parcel === parcelId) || null;
export function addRecord(book, fields = {}) {
  if (book.records.length >= MAX.records) return null;
  const r = cleanRecord(fields, 'lr' + book.seq++);
  if (r.parcel && recordOf(book, r.parcel)) r.parcel = null;
  book.records.push(r); return r;
}
export function setRecord(book, id, fields) {
  const i = book.records.findIndex((r) => r.id === id); if (i < 0) return null;
  const r = cleanRecord({ ...book.records[i], ...fields }, id);
  if (r.parcel && book.records.some((x, k) => k !== i && x.parcel === r.parcel)) r.parcel = book.records[i].parcel;
  book.records[i] = r; return r;
}
export function removeRecord(book, id) { const n = book.records.length; book.records = book.records.filter((r) => r.id !== id); return book.records.length < n; }

const COLS = ['ref', 'parcel_name', 'holder', 'tenure', 'use', 'zone', 'record_area', 'area_unit', 'source', 'status', 'notes'];
export function recordsCsv(book, parcelName = () => '') {
  return csvRows([COLS, ...book.records.map((r) => [r.ref, r.parcel ? parcelName(r.parcel) : '', r.holder, r.tenure, r.use, r.zone, r.recordArea === null ? '' : r.recordArea, r.areaUnit, r.source, r.status, r.notes])]);
}
function splitCsv(line, delim = ',') {
  const out = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true; else if (c === delim) { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur); return out.map((s) => s.trim());
}
const HEAD = { ref: /^(ref|lot|parcel(_?(no|number|id))?|title|plan|apn|pin|id)$/i, parcel_name: /^(parcel_?name|name)$/i, holder: /^(holder|owner|proprietor)$/i, tenure: /^tenure$/i, use: /^(use|land_?use|designation)$/i,
  zone: /^(zone|zoning)$/i, record_area: /^(record_?area|area|deed_?area)$/i, area_unit: /^(area_?unit|unit)$/i, source: /^(source|document|deed)$/i, status: /^status$/i, notes: /^(notes?|remarks?)$/i };
export function parseRecordsCsv(input) {
  const lines = String(input ?? '').replace(/^﻿/, '').split(/\r?\n/).slice(0, MAX.records + 1), rows = [], errors = [];
  if (!lines.length || !lines[0].trim()) return { rows, errors: [{ line: 1, why: 'empty' }] };
  const delim = [',', ';', '\t'].map((d) => [d, lines[0].split(d).length]).sort((a, b) => b[1] - a[1])[0][0];   // the separator the heading row uses most
  const head = splitCsv(lines[0], delim).map((h) => h.replace(/\s+/g, '_'));
  const col = {}; for (const [k, re] of Object.entries(HEAD)) { const i = head.findIndex((h) => re.test(h)); if (i >= 0) col[k] = i; }
  if (col.ref === undefined) return { rows, errors: [{ line: 1, why: 'noref' }] };
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const c = splitCsv(lines[i], delim), get = (k) => (col[k] === undefined ? '' : (c[col[k]] ?? '').replace(/^'(?=[=+\-@])/, ''));
    if (!get('ref')) { errors.push({ line: i + 1, why: 'noref' }); continue; }
    const areaTxt = get('record_area').replace(/[\s,](?=\d{3}\b)/g, ''), a = areaTxt === '' ? null : Number(areaTxt);
    if (a !== null && !(fin(a) && a > 0)) { errors.push({ line: i + 1, why: 'area' }); continue; }
    const unit = get('area_unit').toLowerCase().replace('²', '2').replace(/^sq\.?\s?m.*$/, 'm2').replace(/^sq\.?\s?f.*$/, 'ft2').replace(/^acres?$/, 'ac').replace(/^hectares?$/, 'ha');
    rows.push({ ref: get('ref'), parcelName: get('parcel_name'), holder: get('holder'), tenure: get('tenure'), use: get('use'), zone: get('zone'), recordArea: a, areaUnit: AREA_UNITS[unit] ? unit : 'm2', source: get('source'), status: get('status').toLowerCase(), notes: get('notes') });
  }
  return { rows, errors };
}

export function recordsFromFeatures(features, map = {}) {
  const out = [];
  for (const f of (Array.isArray(features) ? features : []).slice(0, MAX.records)) {
    const ring = ringOf(f?.ring); if (ring.length < 3) continue;
    const p = f.props || {}, pick = (k) => (map[k] && p[map[k]] !== undefined && p[map[k]] !== null ? p[map[k]] : '');
    const a = Number(pick('area'));
    out.push({ ring, fields: { ref: str(pick('ref'), 80), holder: str(pick('holder'), 160), use: str(pick('use'), 80), zone: str(pick('zone'), 80), recordArea: fin(a) && a > 0 ? a : null, areaUnit: AREA_UNITS[map.areaUnit] ? map.areaUnit : 'm2' } });
  }
  return out;
}

export function landUse(book, parcels) {
  const rows = new Map(); let total = 0;
  for (const p of parcels) {
    const r = recordOf(book, p.id), key = (r?.use || '') + '\u0001' + (r?.zone || '');
    const row = rows.get(key) || { use: r?.use || '', zone: r?.zone || '', lots: 0, area: 0 };
    row.lots++; row.area += p.areaM2; total += p.areaM2; rows.set(key, row);
  }
  return [...rows.values()].map((r) => ({ ...r, share: total > 0 ? r.area / total : 0 })).sort((a, b) => b.area - a.area);
}

// SPDX-License-Identifier: Apache-2.0
/* i18n-ignore-file: the sentences here are the English fallback for a host with no catalog (keys audit.*, iface.*, verify.* in the host language file say the same) and file-format values */
/**
 * verify.js: the ONE verification state of a model element, host-free (0.10 booklet rows BK.64 and BK.49, session bk-r3-checks-10).
 * No imports, no DOM. Synced byte-identical into <app>/dev/modelaudit/ by tools/modelaudit/sync.mjs.
 *
 * An element that a program recognised (from a PDF, a scan, a traced drawing) is UNVERIFIED until a person looks at it; a person marks
 * it CHECKED (it agrees with the source it was read from); a person who measured it on site marks it FIELD-VERIFIED (LOD 500: who, when
 * and how). An element with no record was drawn by a person and carries no claim either way.
 *
 *   unverified  →  checked  →  field-verified          (any step back is allowed too: a record is what a person says now)
 *
 * THE STORED RECORD (a host keeps it on the element; BimCraft: property set VERIFY_PSET on the IFC element, every value a plain text
 * property other programs can read):
 *   State        'unverified' | 'checked' | 'field-verified'
 *   By           who checked or measured it ('' for unverified)
 *   On           'YYYY-MM-DD' ('' for unverified)
 *   Method       field-verified only: one of METHODS (tape, laser, scan, survey, other)
 *   Source       where an unverified element came from: one of SOURCES (pdf, scan, drawing, pointcloud) or ''
 *   Note         free text (the scan's name and tolerance, a remark)
 *   LevelOfDevelopment   'LOD 500' while field-verified, '' otherwise (a mirror for other programs; State is what is read back)
 *
 *   cleanRecord(raw) → record | null                 untrusted (a file is): unknown state → null, fields bounded
 *   makeRecord(state, { by, on, method, source, note }, prev?) → record     throws { key } when a field-verified record lacks who,
 *                                                     when or how, or a checked one lacks who or when
 *   recordRows(record) → [[name, ifcType, value]]    the property rows (every row written, '' clears a value)
 *   fromRows(pset) → record | null                   pset = { State, By, On, Method, Source, Note } as a host reads it
 *   isFieldVerified(rec) · isUnverified(rec) · effectiveLod(lod, rec) → 500 while field-verified, else `lod`
 *   summary(records) → { total, none, unverified, checked, fieldVerified }
 *   statementRows(summary, { by, on, note }) → rows for the as-built statement on the project (ASBUILT_PSET)
 *   verifiedCsv(list, head) → CSV of [{ guid, cls, name, level, record }]
 */
export const VERIFY_PSET = 'CadCraft_Verification';
export const ASBUILT_PSET = 'CadCraft_AsBuilt';
export const ASBUILT_FORMAT = 'cadcraft-as-built 1';
export const STATES = ['unverified', 'checked', 'field-verified'];
export const METHODS = ['tape', 'laser', 'scan', 'survey', 'other'];
export const SOURCES = ['pdf', 'scan', 'drawing', 'pointcloud'];
export const FIELD_LOD = 500;
export const LIMITS = { by: 120, note: 300 };

const CTRL = new RegExp('[\\u0000-\\u001f\\u007f\\u2028\\u2029\\u202a-\\u202e\\u2066-\\u2069]', 'g');
const text = (v, n) => (typeof v === 'string' || typeof v === 'number' ? String(v).replace(CTRL, ' ').replace(/\s+/g, ' ').trim().slice(0, n) : '');
export const isDay = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z')) && new Date(s + 'T00:00:00Z').toISOString().slice(0, 10) === s;
const refuse = (key) => { throw Object.assign(new Error(key), { key }); };

export function cleanRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const state = text(raw.state ?? raw.State, 20);
  if (!STATES.includes(state)) return null;
  const on = text(raw.on ?? raw.On, 10), method = text(raw.method ?? raw.Method, 20), source = text(raw.source ?? raw.Source, 20);
  return { state, by: text(raw.by ?? raw.By, LIMITS.by), on: isDay(on) ? on : '', method: state === 'field-verified' && METHODS.includes(method) ? method : '',
    source: SOURCES.includes(source) ? source : '', note: text(raw.note ?? raw.Note, LIMITS.note) };
}

export function makeRecord(state, { by = '', on = '', method = '', source = '', note = '' } = {}, prev = null) {
  if (!STATES.includes(state)) refuse('verify.err.state');
  const who = text(by, LIMITS.by), day = text(on, 10);
  const p = cleanRecord(prev);
  const src = SOURCES.includes(source) ? source : p?.source || '';   // where it came from stays with the element through every state
  if (state === 'unverified') return { state, by: '', on: '', method: '', source: src, note: text(note, LIMITS.note) };
  if (!who) refuse('verify.err.by');
  if (!isDay(day)) refuse('verify.err.on');
  if (state === 'field-verified' && !METHODS.includes(method)) refuse('verify.err.method');
  return { state, by: who, on: day, method: state === 'field-verified' ? method : '', source: src, note: text(note, LIMITS.note) };
}

export const isFieldVerified = (rec) => rec?.state === 'field-verified';
export const isUnverified = (rec) => rec?.state === 'unverified';
export const effectiveLod = (lod, rec) => (isFieldVerified(rec) ? FIELD_LOD : (typeof lod === 'number' ? lod : null));

export function recordRows(rec) {
  const r = cleanRecord(rec);
  if (!r) return [];
  return [['State', 'IFCLABEL', r.state], ['By', 'IFCLABEL', r.by], ['On', 'IFCLABEL', r.on], ['Method', 'IFCLABEL', r.method], ['Source', 'IFCLABEL', r.source],
    ['Note', 'IFCTEXT', r.note], ['LevelOfDevelopment', 'IFCLABEL', r.state === 'field-verified' ? 'LOD ' + FIELD_LOD : '']];
}
export const fromRows = (pset) => cleanRecord(pset);

export function summary(records) {
  const s = { total: 0, none: 0, unverified: 0, checked: 0, fieldVerified: 0 };
  for (const r of records || []) {
    s.total++;
    const c = cleanRecord(r);
    if (!c) s.none++; else if (c.state === 'unverified') s.unverified++; else if (c.state === 'checked') s.checked++; else s.fieldVerified++;
  }
  return s;
}

/** The as-built statement a host writes on the project when it exports an as-built model. */
export function statementRows(sum, { by = '', on = '', note = '' } = {}) {
  return [['Format', 'IFCLABEL', ASBUILT_FORMAT], ['Status', 'IFCLABEL', 'As built'], ['Date', 'IFCLABEL', isDay(on) ? on : ''], ['By', 'IFCLABEL', text(by, LIMITS.by)],
    ['Elements', 'IFCINTEGER', sum.total | 0], ['FieldVerified', 'IFCINTEGER', sum.fieldVerified | 0], ['Checked', 'IFCINTEGER', sum.checked | 0],
    ['Unverified', 'IFCINTEGER', sum.unverified | 0], ['NotStated', 'IFCINTEGER', sum.none | 0],
    ['Statement', 'IFCTEXT', 'Each element measured on site carries the property set ' + VERIFY_PSET + ' with State field-verified, who, when and how. An element without that set, or with another State, was not measured on site.'],
    ['Note', 'IFCTEXT', text(note, LIMITS.note)]];
}

const cell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
export function verifiedCsv(list, head = ['GlobalId', 'Class', 'Name', 'Level', 'State', 'By', 'On', 'Method', 'Source', 'Note']) {
  const rows = [head, ...(list || []).map((x) => { const r = cleanRecord(x.record) || { state: '', by: '', on: '', method: '', source: '', note: '' }; return [x.guid, x.cls, x.name, x.level, r.state, r.by, r.on, r.method, r.source, r.note]; })];
  return rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}

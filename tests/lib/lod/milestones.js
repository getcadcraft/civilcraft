// SPDX-License-Identifier: Apache-2.0
/* i18n-ignore-file: the sentences here are the English fallback for a host with no catalog (keys lod.* in the host language file say the same) and file-format values */
/**
 * milestones.js: the milestone check, host-free (0.10 booklet row BK.17, session bim-lod-10). No DOM. ADVISORY ONLY: nothing here
 * blocks anything (BK.73); a finding is a Problem the person can accept with a reason.
 *
 * A MILESTONE TABLE is data, per country, client or firm ("Part II-style": the LOD Specification's Part II lists model elements
 * classified by Uniformat, OmniClass and Uniclass with the LOD each needs at SD, DD, CD, cost estimate and bid). The table says WHICH
 * level a milestone needs per element kind; it never says what a level means (scale.js, fixed). CadCraft does NOT ship the
 * specification's Part II (it is the BIMForum's to publish and a person loads their project's copy): STARTER_TABLE is CadCraft's own
 * small starting set, keyed by IFC class, and its `note` says it is not a standard.
 *
 *   table = { format: 'cadcraft-lod-milestones', version: 1, id, name, source, note?, milestones: [{ id, name }], rows: [row] }
 *   row   = { name, ifc?: ['IfcWall', …], codes?: [{ system, code }], required: { <milestone id>: 100…500 | null } }
 *           null / missing = this milestone asks nothing of this kind. A code row matches an element whose code in that system starts
 *           with the row's code (so a row for 'B20' covers 'B2010'); the longest code wins, then an IFC class.
 *
 *   MILESTONES                     [{ id, name }] sd, dd, cd, estimate, bid
 *   STARTER_TABLE                  the starting table (frozen)
 *   cleanTable(raw) → { table, problems }          untrusted JSON; bad rows dropped and said; scale redefinitions refused (scale.js)
 *   parseTable(text) → { table, problems }         JSON, or CSV (header: name, ifc, system, code, then one column per milestone id)
 *   tableCsv(table) → CSV text                     round-trips with parseTable
 *   matchRow(element, table) → row | null
 *   milestoneCheck(elements, table, milestoneId) → { milestone, table: id, results, totals, byRow }
 *       elements = [{ id, label, cls, codes: [{ system, code }], lod (effective; null = no tag), level?, parts?: { geometry, information, documentation } }]
 *       result   = { id, label, state: 'reached' | 'not-reached' | 'untagged' | 'no-row' | 'asks-nothing', required, lod, row (index), partsBelow: [part] }
 *   milestoneProblems(check, { t, stage }) → [problem]      the shared Problems shape, severity warning / note, source name 'lod'
 *   words(key, vars)
 */
import { isLod, parseLod } from '../walls/lod.js';
import { checkContent, levelOf } from './scale.js';
import { PARTS } from './record.js';

export const TABLE_FORMAT = 'cadcraft-lod-milestones';
export const MILESTONES = Object.freeze([
  Object.freeze({ id: 'sd', name: 'Schematic design (SD)' }),
  Object.freeze({ id: 'dd', name: 'Design development (DD)' }),
  Object.freeze({ id: 'cd', name: 'Construction documents (CD)' }),
  Object.freeze({ id: 'estimate', name: 'Cost estimate' }),
  Object.freeze({ id: 'bid', name: 'Bid' }),
]);
export const MILESTONE_IDS = MILESTONES.map((m) => m.id);
const LIMITS = { rows: 5000, name: 120, code: 40, text: 400 };
const CTRL = new RegExp('[\\u0000-\\u001f\\u007f\\u2028\\u2029\\u202a-\\u202e\\u2066-\\u2069]', 'g');
const text = (v, n) => (typeof v === 'string' || typeof v === 'number' ? String(v).replace(CTRL, ' ').replace(/\s+/g, ' ').trim().slice(0, n) : '');
const SYSTEMS = ['uniformat', 'omniclass', 'uniclass'];

const row = (name, ifc, req) => Object.freeze({ name, ifc: Object.freeze(ifc), codes: Object.freeze([]), required: Object.freeze({ sd: req[0], dd: req[1], cd: req[2], estimate: req[3], bid: req[4] }) });
/** CadCraft's own starting values by IFC class: NOT the LOD Specification's Part II and not a standard. An office loads its own. */
export const STARTER_TABLE = Object.freeze({
  format: TABLE_FORMAT, version: 1, id: 'cadcraft-starter', name: 'CadCraft starting table',
  source: 'CadCraft starting values, written for this program',
  note: 'Not the LOD Specification\'s Part II and not a standard: starting values by IFC class. Load your project\'s own table (Part II or your firm\'s) over it.',
  milestones: MILESTONES,
  rows: Object.freeze([
    row('Walls', ['IfcWall'], [200, 300, 300, 300, 300]),
    row('Floors and slabs', ['IfcSlab'], [200, 300, 300, 300, 300]),
    row('Roofs', ['IfcRoof'], [200, 300, 300, 300, 300]),
    row('Ceilings and coverings', ['IfcCovering'], [100, 200, 300, 300, 300]),
    row('Doors', ['IfcDoor'], [200, 300, 350, 300, 350]),
    row('Windows', ['IfcWindow'], [200, 300, 350, 300, 350]),
    row('Columns and beams', ['IfcColumn', 'IfcBeam'], [200, 300, 350, 300, 350]),
    row('Stairs and railings', ['IfcStair', 'IfcRailing', 'IfcRamp'], [100, 200, 300, 300, 300]),
    row('Furniture and fittings', ['IfcFurnishingElement', 'IfcFurniture'], [100, 200, 300, 300, 300]),
    row('Services (ducts, pipes, trays)', ['IfcFlowSegment', 'IfcFlowFitting', 'IfcFlowTerminal', 'IfcDistributionElement'], [100, 200, 300, 300, 350]),
  ]),
});

const reqOf = (raw, problems, where) => {
  const out = {};
  for (const id of MILESTONE_IDS) {
    const v = raw && typeof raw === 'object' ? raw[id] : undefined;
    if (v === undefined || v === null || v === '' || v === '-' || v === 'none') { out[id] = null; continue; }
    const n = parseLod(v);
    if (n === null) { problems.push({ code: 'lod.table.level', where, text: words('lod.table.level', { where, milestone: id, value: String(v).slice(0, 20) }) }); out[id] = null; } else out[id] = n;
  }
  return out;
};

export function cleanTable(raw) {
  const problems = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { table: null, problems: [{ code: 'lod.table.shape', where: '', text: words('lod.table.shape') }] };
  for (const p of checkContent(raw)) problems.push({ code: p.code, where: p.path, text: p.text });
  const ms = [];
  for (const m of Array.isArray(raw.milestones) ? raw.milestones : MILESTONES) {
    const id = text(typeof m === 'string' ? m : m?.id, 20).toLowerCase();
    if (!/^[a-z][a-z0-9-]{0,19}$/.test(id) || ms.some((x) => x.id === id)) continue;
    ms.push({ id, name: text(typeof m === 'object' ? m.name : '', LIMITS.name) || (MILESTONES.find((x) => x.id === id)?.name ?? id) });
  }
  const mids = ms.length ? ms.map((m) => m.id) : MILESTONE_IDS;
  const rows = [];
  (Array.isArray(raw.rows) ? raw.rows : []).slice(0, LIMITS.rows).forEach((r, i) => {
    if (!r || typeof r !== 'object') return;
    const ifc = (Array.isArray(r.ifc) ? r.ifc : typeof r.ifc === 'string' && r.ifc ? r.ifc.split(/[;,|]\s*/) : []).map((x) => text(x, 60)).filter((x) => /^Ifc[A-Za-z0-9]+$/.test(x)).slice(0, 20);
    const codes = (Array.isArray(r.codes) ? r.codes : r.code ? [{ system: r.system, code: r.code }] : []).map((c) => ({ system: text(c?.system, 20).toLowerCase(), code: text(c?.code, LIMITS.code) }))
      .filter((c) => SYSTEMS.includes(c.system) && c.code).slice(0, 12);
    if (!ifc.length && !codes.length) { problems.push({ code: 'lod.table.norow', where: 'rows[' + i + ']', text: words('lod.table.norow', { n: i + 1 }) }); return; }
    const req = reqOf(r.required ?? r, problems, 'rows[' + i + ']');
    const fixed = {};
    for (const id of mids) fixed[id] = req[id] ?? null;
    rows.push({ name: text(r.name, LIMITS.name) || ifc[0] || codes[0].code, ifc, codes, required: fixed });
  });
  const table = { format: TABLE_FORMAT, version: 1, id: text(raw.id, 60) || 'table', name: text(raw.name, LIMITS.name) || 'Milestone table', source: text(raw.source, LIMITS.text), milestones: ms.length ? ms : [...MILESTONES], rows };
  if (raw.note) table.note = text(raw.note, LIMITS.text);
  return { table, problems };
}

// ---------------------------------------------------------------------------------------------------- CSV
function csvRows(src) {
  const rows = []; let cur = [], f = '', q = false;
  const s = String(src).replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { cur.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; cur.push(f); f = ''; if (cur.some((x) => x !== '')) rows.push(cur); cur = []; }
    else f += c;
  }
  cur.push(f); if (cur.some((x) => x !== '')) rows.push(cur);
  return rows;
}
export function parseTable(src) {
  const raw = String(src ?? '');
  if (raw.length > 2_000_000) return { table: null, problems: [{ code: 'lod.table.big', where: '', text: words('lod.table.big') }] };
  const t = raw.trim();
  if (t.startsWith('{')) { try { return cleanTable(JSON.parse(t)); } catch (e) { return { table: null, problems: [{ code: 'lod.table.json', where: '', text: words('lod.table.json') }] }; } }
  const all = csvRows(raw);
  if (all.length < 2) return { table: null, problems: [{ code: 'lod.table.empty', where: '', text: words('lod.table.empty') }] };
  const head = all[0].map((h) => h.trim().toLowerCase());
  const col = (n) => head.indexOf(n);
  const mids = head.filter((h) => !['name', 'ifc', 'system', 'code', 'source'].includes(h) && /^[a-z][a-z0-9-]{0,19}$/.test(h));
  if (!mids.length) return { table: null, problems: [{ code: 'lod.table.nocols', where: '', text: words('lod.table.nocols') }] };
  const rows = all.slice(1).map((c) => ({ name: c[col('name')] || '', ifc: col('ifc') >= 0 ? c[col('ifc')] || '' : '', system: col('system') >= 0 ? c[col('system')] || '' : '', code: col('code') >= 0 ? c[col('code')] || '' : '', required: Object.fromEntries(mids.map((m) => [m, c[col(m)] ?? ''])) }));
  return cleanTable({ id: 'csv', name: 'Milestone table', source: 'loaded from a CSV file', milestones: mids, rows });
}
const q = (v) => (/[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
const safe = (v) => (/^[=+\-@\t\r]/.test(v) ? "'" + v : v);   // a cell that looks like a formula stays text in a spreadsheet
export function tableCsv(table) {
  const mids = table.milestones.map((m) => m.id);
  const out = [['name', 'ifc', 'system', 'code', ...mids].join(',')];
  for (const r of table.rows) {
    const c = r.codes[0] || { system: '', code: '' };
    out.push([q(safe(r.name)), q(r.ifc.join(';')), c.system, q(safe(c.code)), ...mids.map((m) => (r.required[m] === null || r.required[m] === undefined ? '' : String(r.required[m])))].join(','));
  }
  return out.join('\n') + '\n';
}

// ---------------------------------------------------------------------------------------------------- the check
const norm = (c) => String(c || '').replace(/\s+/g, '').toLowerCase();
export function matchRow(el, table) {
  let best = -1, bestLen = -1;
  const codes = (el.codes || []).map((c) => ({ system: String(c.system || '').toLowerCase(), code: norm(c.code) })).filter((c) => c.code);
  table.rows.forEach((r, i) => {
    for (const rc of r.codes || []) {
      const rcode = norm(rc.code);
      for (const ec of codes) if (ec.system === rc.system && ec.code.startsWith(rcode) && rcode.length > bestLen) { best = i; bestLen = rcode.length; }
    }
  });
  if (best >= 0) return best;
  const cls = String(el.cls || '').toLowerCase();
  if (!cls) return -1;
  let hit = -1, hl = -1;
  table.rows.forEach((r, i) => { for (const k of r.ifc || []) { const kk = k.toLowerCase(); if ((cls === kk || cls.startsWith(kk)) && kk.length > hl) { hit = i; hl = kk.length; } } });
  return hit;
}

export function milestoneCheck(elements, table, milestoneId) {
  const results = [];
  const totals = { checked: 0, reached: 0, notReached: 0, untagged: 0, noRow: 0, asksNothing: 0 };
  const byRow = table.rows.map((r) => ({ name: r.name, required: r.required[milestoneId] ?? null, reached: 0, notReached: 0, untagged: 0 }));
  for (const el of elements || []) {
    const i = matchRow(el, table);
    const res = { id: el.id, label: el.label || '', cls: el.cls || '', row: i, required: null, lod: isLod(el.lod) ? el.lod : null, state: '', partsBelow: [] };
    if (i < 0) { res.state = 'no-row'; totals.noRow++; results.push(res); continue; }
    const need = table.rows[i].required[milestoneId] ?? null;
    res.required = need;
    if (!isLod(need)) { res.state = 'asks-nothing'; totals.asksNothing++; results.push(res); continue; }
    totals.checked++;
    if (res.lod === null) { res.state = 'untagged'; totals.untagged++; byRow[i].untagged++; }
    else if (res.lod >= need) {
      res.state = 'reached'; totals.reached++; byRow[i].reached++;
      for (const p of PARTS) { const v = el.parts?.[p]; if (isLod(v) && v < need) res.partsBelow.push(p); }
    } else { res.state = 'not-reached'; totals.notReached++; byRow[i].notReached++; }
    results.push(res);
  }
  return { milestone: milestoneId, table: table.id, results, totals, byRow };
}

export function milestoneProblems(check, { t = null, stage = '', cap = 400 } = {}) {
  const say = (key, vars) => { if (t) { const s = t(key, vars); if (s && s !== key) return s; } return words(key, vars); };
  const out = [];
  const name = MILESTONES.find((m) => m.id === check.milestone)?.name || check.milestone;
  const ref = (r) => ({ kind: 'element', id: String(r.id), label: String(r.label || r.id) });
  const mk = (code, severity, vars, about, extra = {}) => ({ code, severity, msg: { key: code, vars }, text: say(code, vars), about, source: { name: 'lod' }, ...extra });
  const un = [];
  for (const r of check.results) {
    if (r.state === 'not-reached' && out.length < cap) out.push(mk('lod.below', 'warning', { label: r.label, found: r.lod, required: r.required, milestone: name }, [ref(r)], { req: { op: '>=', value: r.required, unit: 'LOD' }, found: { value: r.lod, unit: 'LOD' } }));
    else if (r.state === 'untagged') un.push(r);
  }
  if (un.length) out.push(mk('lod.untagged', 'note', { n: un.length, milestone: name }, un.slice(0, 50).map(ref), { part: 'untagged' }));
  return out;
}

const EN = {
  'lod.below': '{label} is at LOD {found}; {milestone} asks for LOD {required}.',
  'lod.untagged': '{n} elements have no LOD, so they cannot be checked against {milestone}.',
  'lod.table.shape': 'The milestone table is not a table (an object with rows).',
  'lod.table.json': 'The milestone table is not valid JSON.',
  'lod.table.big': 'The milestone table file is too big (2 MB at most).',
  'lod.table.empty': 'The milestone table has a header and no rows.',
  'lod.table.nocols': 'The milestone table has no milestone columns (name, ifc, system, code, then one column per milestone).',
  'lod.table.norow': 'Row {n} names neither an IFC class nor a classification code, so it was left out.',
  'lod.table.level': '{where}: "{value}" is not a level of the scale for milestone {milestone}; this milestone asks nothing of that row.',
};
export function words(key, vars = {}) { return String(EN[key] ?? key).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m)); }
export { levelOf };

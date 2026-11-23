/* SPDX-License-Identifier: Apache-2.0 */
/**
 * documents.js — the papers a proposal needs, filled from the drawing (0.11 LR.6): an application, the wording of an amendment, a schedule
 * of parcels before and after. DOM-free; Node-tested.
 *
 * A document is DATA: a template pack names its headings, paragraphs, tables and checklist, and the fields a paragraph may use. The add-on
 * ships one pack of plain outlines that belong to no authority; an authority's own form is another pack (a side add-on, or a file the
 * person opens). THE FILLER NEVER INVENTS: a field nobody stated prints as "[not stated: <its label>]" and is listed as missing.
 *
 *   PACK_FORMAT 'cadcraft-land-templates' · cleanPack(o) → { ok, pack, problems } | { ok: false, why }      (untrusted: a file)
 *     pack = { format, version: 1, id, name, note, documents: [{ id, title, for: [proposal kind] ([] = any), fields: [{ key, label, required }],
 *              body: [{ h: text } | { p: text } | { list: [text] } | { check: [text] } | { table: 'before' | 'after' | 'landuse' | 'checks' | 'buildings' | 'takeoff' | 'notes' | 'rules' | 'thresholds' }] }] }
 *     text may hold {key}: a field of the document, or one of the built-in ones the drawing gives (BUILT_IN)
 *   fill(doc, { fields, tables }) → { title, blocks: [{ h } | { p } | { list } | { check } | { table: { head, rows } }], missing: [label] }
 *   toMarkdown(filled) → text · toHtml(filled, { lang }) → a whole page, every value escaped, that prints on paper
 *   dataFor(proposal, sched, { book, project, date, unit, lotChecks, landuse, extra: { table name: { head, rows } }, words }) → { fields, tables }   the built-in fields and tables
 */
import { fromM2 } from './book.js';

export const PACK_FORMAT = 'cadcraft-land-templates';
export const BUILT_IN = ['date', 'project', 'title', 'kind', 'reason', 'parents', 'children', 'lots_before', 'lots_after', 'area_before', 'area_after', 'balance', 'from_use', 'from_zone', 'to_use', 'to_zone',
  'applicant', 'agent', 'address', 'contact', 'authority', 'site'];
const str = (v, n) => String(v ?? '').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, ' ').trim().slice(0, n);
const TABLES = ['before', 'after', 'landuse', 'checks', 'buildings', 'takeoff', 'notes', 'rules', 'thresholds'];   // the last five come from the panel (site.js, the host's notes, rules.js) through dataFor's `extra`

export function cleanPack(o) {
  if (!o || typeof o !== 'object' || o.format !== PACK_FORMAT) return { ok: false, why: 'format' };
  if (o.version !== 1) return { ok: false, why: 'newer' };
  const problems = [], documents = [];
  for (const d of (Array.isArray(o.documents) ? o.documents : []).slice(0, 50)) {
    if (!d || typeof d !== 'object' || !/^[a-z][a-z0-9-]{1,40}$/.test(String(d.id))) { problems.push('a document without a usable id was left out'); continue; }
    const fields = (Array.isArray(d.fields) ? d.fields : []).slice(0, 80).filter((f) => f && /^[a-z][a-z0-9_]{0,40}$/.test(String(f.key))).map((f) => ({ key: f.key, label: str(f.label, 120) || f.key, required: f.required === true }));
    const body = [];
    for (const b of (Array.isArray(d.body) ? d.body : []).slice(0, 400)) {
      if (!b || typeof b !== 'object') continue;
      if (typeof b.h === 'string') body.push({ h: str(b.h, 200) });
      else if (typeof b.p === 'string') body.push({ p: str(b.p, 4000) });
      else if (Array.isArray(b.list)) body.push({ list: b.list.slice(0, 100).map((x) => str(x, 600)).filter(Boolean) });
      else if (Array.isArray(b.check)) body.push({ check: b.check.slice(0, 100).map((x) => str(x, 600)).filter(Boolean) });
      else if (TABLES.includes(b.table)) body.push({ table: b.table });
      else problems.push(d.id + ': a block that is not a heading, paragraph, list, checklist or known table was left out');
    }
    if (!body.length) { problems.push(d.id + ': no body'); continue; }
    documents.push({ id: d.id, title: str(d.title, 160) || d.id, for: (Array.isArray(d.for) ? d.for : []).map(String).slice(0, 8), fields, body });
  }
  if (!documents.length) return { ok: false, why: 'empty', problems };
  return { ok: true, pack: { format: PACK_FORMAT, version: 1, id: /^[a-z][a-z0-9-]{1,40}$/.test(String(o.id)) ? o.id : 'pack', name: str(o.name, 120) || 'Templates', note: str(o.note, 600), documents }, problems };
}

export function fill(doc, { fields = {}, tables = {} } = {}) {
  const labels = new Map(doc.fields.map((f) => [f.key, f.label])), missing = new Set();
  const put = (text) => String(text).replace(/\{([a-z][a-z0-9_]{0,40})\}/g, (m, k) => {
    const v = fields[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
    if (!labels.has(k) && !BUILT_IN.includes(k)) return m;   // not a field: leave the braces as written
    const label = labels.get(k) || k.replace(/_/g, ' '); missing.add(label);
    return '[not stated: ' + label + ']';
  });
  for (const f of doc.fields) if (f.required && (fields[f.key] === undefined || String(fields[f.key]).trim() === '')) missing.add(f.label);
  const blocks = [];
  for (const b of doc.body) {
    if (b.h !== undefined) blocks.push({ h: put(b.h) });
    else if (b.p !== undefined) blocks.push({ p: put(b.p) });
    else if (b.list) blocks.push({ list: b.list.map(put) });
    else if (b.check) blocks.push({ check: b.check.map(put) });
    else if (b.table) { const t = tables[b.table]; if (t && t.rows.length) blocks.push({ table: { head: t.head.map(String), rows: t.rows.map((r) => r.map((c) => (c === null || c === undefined ? '' : String(c)))) } }); }
  }
  return { title: put(doc.title), blocks, missing: [...missing] };
}

const mdCell = (s) => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
export function toMarkdown(filled) {
  const L = ['# ' + filled.title, ''];
  for (const b of filled.blocks) {
    if (b.h !== undefined) L.push('## ' + b.h, '');
    else if (b.p !== undefined) L.push(b.p, '');
    else if (b.list) { for (const x of b.list) L.push('- ' + x); L.push(''); }
    else if (b.check) { for (const x of b.check) L.push('- [ ] ' + x); L.push(''); }
    else if (b.table) { L.push('| ' + b.table.head.map(mdCell).join(' | ') + ' |', '|' + b.table.head.map(() => ' --- ').join('|') + '|'); for (const r of b.table.rows) L.push('| ' + r.map(mdCell).join(' | ') + ' |'); L.push(''); }
  }
  return L.join('\n');
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function toHtml(filled, { lang = 'en' } = {}) {
  const H = ['<!doctype html>', '<html lang="' + esc(lang) + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">', '<title>' + esc(filled.title) + '</title>',
    '<style>body{font:12pt/1.45 Georgia,serif;color:#111;background:#fff;max-width:48em;margin:2em auto;padding:0 1em}h1{font-size:18pt}h2{font-size:13pt;margin-top:1.4em}table{border-collapse:collapse;width:100%;margin:.6em 0}th,td{border:1px solid #777;padding:.25em .5em;text-align:left;font-size:10.5pt}th{background:#eee}.missing{background:#fff3b0}ul.check{list-style:none;padding-left:0}ul.check li::before{content:"\\2610  "}@media print{body{margin:0;max-width:none}}</style>', '</head><body>', '<h1>' + mark(filled.title) + '</h1>'];
  for (const b of filled.blocks) {
    if (b.h !== undefined) H.push('<h2>' + mark(b.h) + '</h2>');
    else if (b.p !== undefined) H.push('<p>' + mark(b.p) + '</p>');
    else if (b.list) H.push('<ul>' + b.list.map((x) => '<li>' + mark(x) + '</li>').join('') + '</ul>');
    else if (b.check) H.push('<ul class="check">' + b.check.map((x) => '<li>' + mark(x) + '</li>').join('') + '</ul>');
    else if (b.table) H.push('<table><thead><tr>' + b.table.head.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' + b.table.rows.map((r) => '<tr>' + r.map((c) => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>');
  }
  H.push('</body></html>');
  return H.join('\n') + '\n';
}
/** Escaped text with every "[not stated: …]" marked so it cannot be missed on paper. */
function mark(s) { return esc(s).replace(/\[not stated: [^\]]{1,160}\]/g, (m) => '<span class="missing">' + m + '</span>'); }

const fmtArea = (m2, unit) => { const v = fromM2(m2, unit), d = unit === 'ha' || unit === 'ac' ? 4 : 1; return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); };
export const UNIT_WORDS = { m2: 'm²', ha: 'ha', ft2: 'sq ft', ac: 'acres' };

export function dataFor(proposal, sched, { book = null, project = '', date = '', unit = 'm2', lotChecks = [], landuse = [], extra = {}, words = (k) => k } = {}) {
  const u = UNIT_WORDS[unit] || unit, a = (v) => fmtArea(v, unit) + ' ' + u, ap = (book && book.applicant) || {};
  const fields = {
    ...((book && book.fields) || {}),   // what a pack's own fields asked for and the person typed; the drawing's own values below win
    date, project, title: proposal.title, kind: words('kind.' + proposal.kind), reason: proposal.reason,
    parents: sched.before.map((r) => r.name).join(', '), children: sched.after.map((r) => r.name).join(', '),
    lots_before: String(sched.before.length), lots_after: String(sched.after.length), area_before: a(sched.beforeM2), area_after: a(sched.afterM2),
    balance: Math.abs(sched.balanceM2) < 0.005 ? words('balance.none') : a(sched.balanceM2),
    from_use: proposal.from.use, from_zone: proposal.from.zone, to_use: proposal.to.use, to_zone: proposal.to.zone,
    applicant: ap.name, agent: ap.agent, address: ap.address, contact: ap.contact, authority: ap.authority, site: ap.site,
  };
  const head = [words('col.lot'), words('col.ref'), words('col.area', { unit: u }), words('col.use'), words('col.zone')];
  const tables = {
    before: { head, rows: [...sched.before.map((r) => [r.name, r.ref || '', fmtArea(r.areaM2, unit), r.use, r.zone]), [words('col.total'), '', fmtArea(sched.beforeM2, unit), '', '']] },
    after: { head: head.filter((_, i) => i !== 1), rows: [...sched.after.map((r) => [r.name, fmtArea(r.areaM2, unit), r.use, r.zone]), [words('col.total'), fmtArea(sched.afterM2, unit), '', '']] },
    landuse: { head: [words('col.use'), words('col.zone'), words('col.lots'), words('col.area', { unit: u }), words('col.share')], rows: landuse.map((r) => [r.use || words('none'), r.zone || words('none'), String(r.lots), fmtArea(r.area, unit), (r.share * 100).toFixed(1) + ' %']) },
    checks: { head: [words('col.lot'), words('col.check'), words('col.value'), words('col.limit')], rows: lotChecks.map((c) => [c.lot, words('check.' + c.code), c.code === 'minarea' ? fmtArea(c.value, 'm2') + ' m²' : c.value.toFixed(2) + ' m', c.code === 'minarea' ? fmtArea(c.limit, 'm2') + ' m²' : c.limit.toFixed(2) + ' m']) },
  };
  for (const [k, v] of Object.entries(extra || {})) if (TABLES.includes(k) && v && Array.isArray(v.head) && Array.isArray(v.rows)) tables[k] = v;
  return { fields, tables };
}

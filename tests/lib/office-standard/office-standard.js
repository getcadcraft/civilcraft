// SPDX-License-Identifier: Apache-2.0
/**
 * office-standard.js — THE OFFICE STANDARD (booklet BK.165 / BK.36 / BK.171 / BK.181; sessions bk-r4-office-10, office-std-10). Canonical in lib/office-standard/; copied byte for byte by
 * `node tools/office-standard/sync.mjs` (Super: dev/super-office.js; CadCraft and BimCraft: dev/office-standard.js); never edit a copy. DOM-free, no imports but annoscale.js; tested in Node
 * (bin/test-super-office.mjs). ONE record per office, format `cc-office-standard`:
 *
 *   { format: 'cc-office-standard', version: 1, name,
 *     annotation: { format: 'cc-annotation-standard', version: 1, heights: { text, dimension, tag, room, grid, title, schedule: paper mm } },   // lib/annoscale, INCLUDED as it is
 *     titleBlock: { paper: 'iso-a1' | '', fields: [{ key, label, value }] },
 *     drawingLayers: [{ name, color: '#rrggbb' | '', purpose }],                      // the office's drawing layer names (NOT the four model layers of super-layers.js)
 *     templates: [{ name, kind: 'project' | 'drawing' | 'sheet' | 'schedule', version }],   // by reference: the template itself is kept where templates are kept
 *     schedules: { policy: { group, totals, title, headings }, layouts: [{ name, ref }] } }  // the office standard of lib/tables (Default Policies all.schedule.*) + layouts by reference
 *
 * It lives in two tables of the SuperCad file format: acct_office_standard (the account's record, what the office keeps) and proj_office_standard (the project's copy,
 * taken when a project starts). The apps read the project's record through what already exists: Default Policies (all.anno.<kind>, all.schedule.*; defaults-hook.js).
 * A number in a standard is the office's own: this file invents none (an empty standard means "the app's own sizes", as before).
 *
 *   emptyOffice(name?) · cleanOffice(raw) → { standard, ignored: ['annotation.text', …] }
 *   isEmpty(standard) · sameOffice(a, b) · diffOffice(a, b) → [{ section, key, from, to }]
 *   toPolicies(standard) → { 'all.anno.text': 2.5, 'all.schedule.group': 'level', … }   what the apps are told
 *   fromPolicies(policyDoc) → a standard made of the policies that are set (the account's first record can start from the person's Default Policies)
 *   canSee(item, me, teams) · canChange(item, me, teams) → bool      BK.171: only the owner or a team owner/admin changes a shared item
 *   officeRow(...) · projectRow(...)                                   the rows of the two tables
 */
import { KINDS, cleanStandard, emptyStandard, FORMAT as ANNO_FORMAT, VERSION as ANNO_VERSION } from './annoscale.js';

export const FORMAT = 'cc-office-standard';
export const VERSION = 1;
export const LIMITS = { name: 120, fields: 24, label: 60, value: 200, layers: 200, layerName: 60, purpose: 80, templates: 50, templateName: 80, layouts: 30, title: 120, bytes: 256 * 1024 };
export const TEMPLATE_KINDS = ['project', 'drawing', 'sheet', 'schedule'];
export const SCHEDULE_GROUPS = ['none', 'level', 'type', 'room'];
export const SCHEDULE_TOTALS = ['none', 'grand', 'groups'];
export const SCHEDULE_HEADINGS = ['asis', 'upper', 'title'];
export const SECTIONS = ['annotation', 'titleBlock', 'drawingLayers', 'templates', 'schedules'];
export const TABLES = { account: 'acct_office_standard', project: 'proj_office_standard', shared: 'team_shared_item' };
export const TEAM_ADMIN_ROLES = ['owner', 'admin'];

const text = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const plain = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const KEY_RE = /^[a-z][a-z0-9_]{0,31}$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const PAPER_RE = /^[a-z0-9][a-z0-9-]{0,19}$/;

export const emptyOffice = (name = '') => ({
  format: FORMAT, version: VERSION, name: text(name, LIMITS.name), annotation: emptyStandard(),
  titleBlock: { paper: '', fields: [] }, drawingLayers: [], templates: [], schedules: { policy: {}, layouts: [] },
});

/** Untrusted → { standard, ignored }. Only what is well-formed is kept; what was dropped is named ('annotation.text', 'drawingLayers[3]' …). */
export function cleanOffice(raw) {
  const out = emptyOffice(), ignored = [];
  const r = plain(raw) ? raw : {};
  out.name = text(r.name, LIMITS.name);
  // annotation: the existing format, as it is (lib/annoscale decides what a height may be)
  const a = cleanStandard(plain(r.annotation) ? r.annotation : null);
  out.annotation = a.standard; for (const k of a.ignored) ignored.push('annotation.' + k);
  // title block
  const tb = plain(r.titleBlock) ? r.titleBlock : {};
  out.titleBlock.paper = PAPER_RE.test(String(tb.paper || '')) ? String(tb.paper) : '';
  if (tb.paper && !out.titleBlock.paper) ignored.push('titleBlock.paper');
  const seen = new Set();
  for (const [i, f] of (Array.isArray(tb.fields) ? tb.fields : []).entries()) {
    const key = plain(f) ? String(f.key || '') : '';
    // i18n-ignore: code, not words (a class name, path or pattern)
    if (!KEY_RE.test(key) || seen.has(key) || out.titleBlock.fields.length >= LIMITS.fields) { ignored.push(`titleBlock.fields[${i}]`); continue; }
    seen.add(key);
    out.titleBlock.fields.push({ key, label: text(f.label, LIMITS.label) || key, value: text(f.value, LIMITS.value) });
  }
  // drawing layers
  const names = new Set();
  for (const [i, l] of (Array.isArray(r.drawingLayers) ? r.drawingLayers : []).entries()) {
    const name = plain(l) ? text(l.name, LIMITS.layerName) : '';
    // i18n-ignore: code, not words (a class name, path or pattern)
    if (!name || names.has(name.toLowerCase()) || out.drawingLayers.length >= LIMITS.layers) { ignored.push(`drawingLayers[${i}]`); continue; }
    names.add(name.toLowerCase());
    out.drawingLayers.push({ name, color: COLOR_RE.test(String(l.color || '')) ? String(l.color).toLowerCase() : '', purpose: text(l.purpose, LIMITS.purpose) });
  }
  // templates, by reference
  const tpl = new Set();
  for (const [i, t] of (Array.isArray(r.templates) ? r.templates : []).entries()) {
    const name = plain(t) ? text(t.name, LIMITS.templateName) : '', kind = plain(t) && TEMPLATE_KINDS.includes(t.kind) ? t.kind : '';
    // i18n-ignore: code, not words (a class name, path or pattern)
    if (!name || !kind || tpl.has(kind + '\u0000' + name.toLowerCase()) || out.templates.length >= LIMITS.templates) { ignored.push(`templates[${i}]`); continue; }
    tpl.add(kind + '\u0000' + name.toLowerCase());
    const v = Math.round(Number(t.version)); out.templates.push({ name, kind, version: v >= 1 && v <= 9999 ? v : 1 });
  }
  // schedules: the office policy of lib/tables + layouts by reference
  const sc = plain(r.schedules) ? r.schedules : {}, po = plain(sc.policy) ? sc.policy : {};
  if (SCHEDULE_GROUPS.includes(po.group)) out.schedules.policy.group = po.group; else if (po.group !== undefined) ignored.push('schedules.group');
  if (SCHEDULE_TOTALS.includes(po.totals)) out.schedules.policy.totals = po.totals; else if (po.totals !== undefined) ignored.push('schedules.totals');
  if (SCHEDULE_HEADINGS.includes(po.headings)) out.schedules.policy.headings = po.headings; else if (po.headings !== undefined) ignored.push('schedules.headings');
  if (typeof po.title === 'string' && text(po.title, LIMITS.title)) out.schedules.policy.title = text(po.title, LIMITS.title);
  const lay = new Set();
  for (const [i, l] of (Array.isArray(sc.layouts) ? sc.layouts : []).entries()) {
    const name = plain(l) ? text(l.name, LIMITS.templateName) : '';
    // i18n-ignore: code, not words (a class name, path or pattern)
    if (!name || lay.has(name.toLowerCase()) || out.schedules.layouts.length >= LIMITS.layouts) { ignored.push(`schedules.layouts[${i}]`); continue; }
    lay.add(name.toLowerCase()); out.schedules.layouts.push({ name, ref: text(l.ref, LIMITS.templateName) || name });
  }
  return { standard: out, ignored };
}

export function isEmpty(s) {
  const c = cleanOffice(s).standard;
  return !Object.keys(c.annotation.heights).length && !c.titleBlock.paper && !c.titleBlock.fields.length && !c.drawingLayers.length && !c.templates.length
    && !Object.keys(c.schedules.policy).length && !c.schedules.layouts.length;
}

/** Same content (the name and the record bookkeeping do not count). */
export const sameOffice = (a, b) => diffOffice(a, b).length === 0;

/** What differs between two standards, one entry per item: [{ section, key, from, to }] (from/to are plain text; '' = not set). */
export function diffOffice(a, b) {
  const x = cleanOffice(a).standard, y = cleanOffice(b).standard, out = [];
  const add = (section, key, from, to) => { if (String(from) !== String(to)) out.push({ section, key, from: String(from), to: String(to) }); };
  for (const k of KINDS) add('annotation', k, x.annotation.heights[k] ?? '', y.annotation.heights[k] ?? '');
  add('titleBlock', 'paper', x.titleBlock.paper, y.titleBlock.paper);
  const fx = new Map(x.titleBlock.fields.map(f => [f.key, f])), fy = new Map(y.titleBlock.fields.map(f => [f.key, f]));
  for (const k of new Set([...fx.keys(), ...fy.keys()])) add('titleBlock', k, fx.has(k) ? fx.get(k).label + ': ' + fx.get(k).value : '', fy.has(k) ? fy.get(k).label + ': ' + fy.get(k).value : '');
  const lx = new Map(x.drawingLayers.map(l => [l.name.toLowerCase(), l])), ly = new Map(y.drawingLayers.map(l => [l.name.toLowerCase(), l]));
  for (const k of new Set([...lx.keys(), ...ly.keys()])) { const f = lx.get(k), t = ly.get(k); add('drawingLayers', (f || t).name, f ? `${f.color} ${f.purpose}`.trim() || '-' : '', t ? `${t.color} ${t.purpose}`.trim() || '-' : ''); }
  const tx = new Map(x.templates.map(t => [t.kind + ':' + t.name.toLowerCase(), t])), ty = new Map(y.templates.map(t => [t.kind + ':' + t.name.toLowerCase(), t]));
  for (const k of new Set([...tx.keys(), ...ty.keys()])) { const f = tx.get(k), t = ty.get(k); add('templates', (f || t).kind + ': ' + (f || t).name, f ? 'v' + f.version : '', t ? 'v' + t.version : ''); }
  for (const k of ['group', 'totals', 'title', 'headings']) add('schedules', k, x.schedules.policy[k] ?? '', y.schedules.policy[k] ?? '');
  const sx = new Map(x.schedules.layouts.map(l => [l.name.toLowerCase(), l])), sy = new Map(y.schedules.layouts.map(l => [l.name.toLowerCase(), l]));
  for (const k of new Set([...sx.keys(), ...sy.keys()])) { const f = sx.get(k), t = sy.get(k); add('schedules', 'layout: ' + (f || t).name, f ? f.ref : '', t ? t.ref : ''); }
  return out;
}

/** What the apps are told: one Default Policies value per thing the standard states. A thing it does not state is left out (the app keeps its own). */
export function toPolicies(standard) {
  const s = cleanOffice(standard).standard, out = {};
  for (const k of KINDS) if (typeof s.annotation.heights[k] === 'number') out['all.anno.' + k] = s.annotation.heights[k];
  for (const k of ['group', 'totals', 'title', 'headings']) if (s.schedules.policy[k] !== undefined) out['all.schedule.' + k] = s.schedules.policy[k];
  return out;
}

/** The standard the person's own Default Policies document describes (policies it does not set stay empty). */
export function fromPolicies(doc, name = '') {
  const p = doc && plain(doc.policies) ? doc.policies : {}, raw = { name, annotation: { heights: {} }, schedules: { policy: {} } };
  for (const k of KINDS) if (typeof p['all.anno.' + k] === 'number') raw.annotation.heights[k] = p['all.anno.' + k];
  for (const k of ['group', 'totals', 'title', 'headings']) if (p['all.schedule.' + k] !== undefined) raw.schedules.policy[k] = p['all.schedule.' + k];
  return cleanOffice(raw).standard;
}

/* ---- who may see and change a shared item (BK.171). `me` = { email }, `teams` = the Teams plug-in's topic: [{ uuid, members: [{ email, role }] }] ---- */
const norm = e => String(e ?? '').trim().toLowerCase();
const roleIn = (teams, uuid, me) => {
  const t = (Array.isArray(teams) ? teams : []).find(x => x && x.uuid === uuid);
  const m = t && (t.members || []).find(x => norm(x.email) === norm(me && me.email));
  return m ? String(m.role) : '';
};
export function canSee(item, me, teams) {
  if (!item || !me || !norm(me.email)) return false;
  if (norm(item.owner) === norm(me.email)) return true;
  return !!item.team_uuid && roleIn(teams, item.team_uuid, me) !== '';
}
export function canChange(item, me, teams) {
  if (!item || !me || !norm(me.email)) return false;
  if (norm(item.owner) === norm(me.email)) return true;
  return !!item.team_uuid && TEAM_ADMIN_ROLES.includes(roleIn(teams, item.team_uuid, me));
}

/** The row of acct_office_standard (and team_shared_item kind office-standard shares its body). The body is cleaned; a record over LIMITS.bytes is refused. */
export function officeRow({ id, name, owner, team_uuid = '', body, record_version = 1, created_at, now }) {
  const std = cleanOffice({ ...(body || {}), name: name ?? body?.name }).standard;
  if (JSON.stringify(std).length > LIMITS.bytes) return null;
  return { id, name: std.name, record_version: Math.max(1, Math.round(record_version)), owner: norm(owner), team_uuid: String(team_uuid || ''), body: std, created_at: created_at ?? now, updated_at: now, deleted_at: null };
}
export function projectRow({ body, source = null, now, by = '' }) {
  const std = cleanOffice(body).standard;
  return { id: 'project', source_id: source ? String(source.id || '') : '', source_version: source ? Math.round(source.record_version) || 0 : 0, source_name: source ? text(source.name, LIMITS.name) : '',
    body: std, copied_at: source ? now : 0, updated_at: now, updated_by: text(by, 80), deleted_at: null };
}

/** The shape a UI shows: counts per section, in one line each (the numbers are counts of what the record holds, nothing more). */
export function summary(standard) {
  const s = cleanOffice(standard).standard;
  return { annotation: Object.keys(s.annotation.heights).length, titleBlockFields: s.titleBlock.fields.length, drawingLayers: s.drawingLayers.length, templates: s.templates.length,
    schedules: Object.keys(s.schedules.policy).length + s.schedules.layouts.length };
}
export { ANNO_FORMAT, ANNO_VERSION };

// SPDX-License-Identifier: Apache-2.0
/**
 * classify.js — classification codes on elements and types (0.10 BK.94, session bk-content-10). Host-free: no DOM, no IFC, no imports.
 * BimCraft carries a byte-identical copy in bimcraft/dev/classify/ (tools/classify/sync.mjs); any other host does the same.
 *
 * Three systems are known by name: Uniclass, OmniClass and UniFormat. A code is text the person types or picks; the code lists come as
 * DATA PACKS, never as code. A pack is either bundled (only where the publisher's licence allows passing the table on) or loaded by the
 * office from its own licensed copy (CSV). With no pack a field still takes any typed code.
 *
 *   SYSTEMS                                   [{ id, name, ifcName, publisher, url, bundled, licence, note }]
 *   systemById(id) · systemOf(name)           a system by id; the system an IFC file's classification name means ('Uniclass 2015' → 'uniclass'), else null
 *   cleanCode(s) · cleanTitle(s)              what is stored: trimmed, control characters out, at most 60 / 255 characters
 *   codeLooksRight(system, code)              true | false: a soft check for a hint in the page (a code is never refused for its shape)
 *   effective(own, type, fallback)            { [system]: { code, title, from: 'element' | 'type' | 'default' } }   the element's own code wins, then its type's, then the default
 *   PACK_FORMAT 'cadcraft-classification-pack' v1:
 *     { format, version: 1, system, id, name, edition, publisher, table?, source { name, url, licence, licence_url?, fetched, … }, attribution?,
 *       redistributable: bool, verified: bool, rows: [[code, title], …] }     rows are text only; parents follow from the order and the codes
 *   readPack(objOrText) → { ok, pack, error }          checked and cleaned (at most 60 000 rows, no markup, no duplicate codes)
 *   packFromCsv(text, { system, name, edition, source, licence }) → { ok, pack, error, columns { code, title }, skipped }
 *                                              an office's own table: a header row is looked for (Code / Number / Identifier and Title / Name / Description);
 *                                              without one the first two columns are code and title. redistributable: false (it stays in this browser).
 *   packToCsv(pack) → text                     code,title rows (BOM, CRLF; a cell that looks like a formula gets a leading ')
 *   packIndex(packs) → { find(system, code) → { code, title, pack } | null, search(system, text, limit) → [{ code, title, pack }], has(system) }
 *   DEFAULTS_FORMAT 'cadcraft-classification-defaults' v1: { format, version, system, pack, verified, note, classes: { IfcWall: code, 'IfcSlab.ROOF': code, … } }
 *   defaultFor(defaults, cls, predefined) → code | null
 */

/* i18n-ignore-start: publishers' names and licence statements are data (proper names, recorded as stated), the same in every language */
export const SYSTEMS = Object.freeze([
  Object.freeze({
    id: 'uniclass', name: 'Uniclass', ifcName: 'Uniclass 2015', publisher: 'NBS', url: 'https://uniclass.thenbs.com/', bundled: true,
    licence: 'CC BY-ND 4.0', pattern: '^[A-Z][A-Za-z](_\\d{2}){0,4}$', example: 'EF_25_10',
  }),
  Object.freeze({
    id: 'omniclass', name: 'OmniClass', ifcName: 'OmniClass', publisher: 'Construction Specifications Institute (CSI)', url: 'https://www.csiresources.org/standards/omniclass', bundled: false,
    licence: 'All rights reserved; a licence from the publisher is needed to pass the tables on', pattern: '^\\d{2}-\\d{2}( \\d{2}){1,5}$', example: '21-02 20 10',
  }),
  Object.freeze({
    id: 'uniformat', name: 'UniFormat', ifcName: 'UniFormat', publisher: 'Construction Specifications Institute (CSI) and Construction Specifications Canada (CSC)', url: 'https://www.csiresources.org/standards/uniformat', bundled: false,
    licence: 'All rights reserved; a licence from the publisher is needed to pass the table on', pattern: '^[A-Z](\\d{2}|\\d{4}|\\d{4}[.\\d]{0,6})?$', example: 'B2010',
  }),
]);
/* i18n-ignore-end */
export const SYSTEM_IDS = Object.freeze(SYSTEMS.map((s) => s.id));
export const systemById = (id) => SYSTEMS.find((s) => s.id === id) || null;

/** The system a classification's name in a file means: 'Uniclass 2015', 'Uniclass2015 Ss', 'OmniClass Table 21', 'Uniformat II', 'UNIFORMAT 2010' … */
export function systemOf(name) {
  const n = String(name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!n) return null;
  if (n.includes('uniclass')) return 'uniclass';
  if (n.includes('omniclass') || /^occs/.test(n)) return 'omniclass';
  if (n.includes('uniformat')) return 'uniformat';
  return null;
}

const strip = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
export const cleanCode = (s) => strip(s, 60);
export const cleanTitle = (s) => strip(s, 255);
export function codeLooksRight(system, code) {
  const s = systemById(system);
  if (!s || !code) return true;
  try { return new RegExp(s.pattern).test(code); } catch (e) { return true; }
}

/** own / type / fallback: { [system]: { code, title } }. The element's own code wins, then its type's, then the default. */
export function effective(own = {}, type = {}, fallback = {}) {
  const out = {};
  for (const sys of new Set([...Object.keys(fallback || {}), ...Object.keys(type || {}), ...Object.keys(own || {})])) {
    const pick = own?.[sys]?.code ? ['element', own[sys]] : type?.[sys]?.code ? ['type', type[sys]] : fallback?.[sys]?.code ? ['default', fallback[sys]] : null;
    if (pick) out[sys] = { code: pick[1].code, title: pick[1].title || '', from: pick[0] };
  }
  return out;
}

// ------------------------------------------------------------------------------------------------ packs
export const PACK_FORMAT = 'cadcraft-classification-pack';
export const PACK_LIMITS = Object.freeze({ rows: 60000, bytes: 6 * 1024 * 1024 });
const MARKUP = /<\s*\/?\s*[a-z!]/i;
const slug = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

export function readPack(input) {
  let j = input;
  if (typeof input === 'string') {
    if (input.length > PACK_LIMITS.bytes) return { ok: false, error: 'big' };
    try { j = JSON.parse(input.replace(/^﻿/, '')); } catch (e) { return { ok: false, error: 'json' }; }
  }
  if (!j || typeof j !== 'object' || Array.isArray(j) || j.format !== PACK_FORMAT || j.version !== 1) return { ok: false, error: 'format' };
  if (!SYSTEM_IDS.includes(j.system)) return { ok: false, error: 'system' };
  if (!Array.isArray(j.rows)) return { ok: false, error: 'rows' };
  if (j.rows.length > PACK_LIMITS.rows) return { ok: false, error: 'many' };
  const src = j.source && typeof j.source === 'object' ? j.source : {};
  const source = {};
  for (const k of ['name', 'url', 'api', 'licence', 'licence_name', 'licence_url', 'published', 'fetched', 'changes', 'newer']) if (src[k] != null && src[k] !== '') source[k] = strip(src[k], 400);
  if (!source.name && !source.url) return { ok: false, error: 'source' };   // a pack says where its table comes from
  const rows = [], seen = new Set();
  for (const r of j.rows) {
    if (!Array.isArray(r) || r.length < 2) return { ok: false, error: 'row' };
    const code = cleanCode(r[0]), title = cleanTitle(r[1]);
    if (!code || MARKUP.test(code) || MARKUP.test(title)) return { ok: false, error: 'row' };
    if (seen.has(code)) return { ok: false, error: 'twice', code };
    seen.add(code); rows.push([code, title]);
  }
  if (!rows.length) return { ok: false, error: 'rows' };
  const name = strip(j.name, 160) || systemById(j.system).name;
  const pack = {
    format: PACK_FORMAT, version: 1, system: j.system, id: slug(j.id || name) || 'pack', name, edition: strip(j.edition, 80), publisher: strip(j.publisher, 160),
    ...(j.table ? { table: strip(j.table, 20) } : {}), source, ...(j.attribution ? { attribution: strip(j.attribution, 400) } : {}),
    redistributable: j.redistributable === true, verified: j.verified === true, rows,
  };
  return { ok: true, pack };
}

/** RFC 4180 rows; a quoted cell may hold commas, quotes ("") and line breaks. Separator: comma, semicolon or tab (the one the first line uses most). */
export function csvRows(text) {
  const s = String(text ?? '').replace(/^﻿/, '');
  const first = s.slice(0, s.search(/\r|\n|$/));
  const count = (ch) => first.split(ch).length - 1;
  const sep = count('\t') > count(',') && count('\t') >= count(';') ? '\t' : count(';') > count(',') ? ';' : ',';
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; continue; }
    if (c === '"' && cell === '') { q = true; continue; }
    if (c === sep) { row.push(cell); cell = ''; continue; }
    if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; row.push(cell); cell = ''; if (row.some((x) => x.trim() !== '')) rows.push(row); row = []; continue; }
    cell += c;
  }
  row.push(cell); if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}
const CODE_HEAD = /^(code|number|no\.?|identifier|id|item ?reference|classification ?code|omniclass ?number|uniformat ?code)$/i;
const TITLE_HEAD = /^(title|name|description|omniclass ?title|uniformat ?title|level \d+ title)$/i;
const unguard = (s) => (/^'[=+\-@]/.test(s) ? s.slice(1) : s);

export function packFromCsv(text, { system, name = '', edition = '', source = '', licence = '' } = {}) {
  if (!SYSTEM_IDS.includes(system)) return { ok: false, error: 'system' };
  if (String(text ?? '').length > PACK_LIMITS.bytes) return { ok: false, error: 'big' };
  const all = csvRows(text);
  if (!all.length) return { ok: false, error: 'rows' };
  // a header within the first 12 rows (published tables often open with a title and a date)
  let head = -1, ci = 0, ti = 1;
  for (let i = 0; i < Math.min(12, all.length) && head < 0; i++) {
    const c = all[i].findIndex((x) => CODE_HEAD.test(x.trim())), t = all[i].findIndex((x, k) => k !== c && TITLE_HEAD.test(x.trim()));
    if (c >= 0 && t >= 0) { head = i; ci = c; ti = t; }
  }
  const rows = [], seen = new Set();
  let skipped = 0;
  for (const r of all.slice(head + 1)) {
    const code = cleanCode(unguard(String(r[ci] ?? '').trim())), title = cleanTitle(unguard(String(r[ti] ?? '').trim()));
    if (!code || seen.has(code) || MARKUP.test(code) || MARKUP.test(title)) { skipped++; continue; }
    seen.add(code); rows.push([code, title]);
    if (rows.length > PACK_LIMITS.rows) return { ok: false, error: 'many' };
  }
  if (!rows.length) return { ok: false, error: 'rows' };
  const sys = systemById(system);
  /* i18n-ignore-start: fall-back words stored in the pack when the host gives no name or source (BimCraft always gives both) */
  const r = readPack({
    format: PACK_FORMAT, version: 1, system, id: 'own-' + system + '-' + (slug(name) || 'table'), name: strip(name, 160) || sys.name + ' (your table)', edition, publisher: sys.publisher,
    source: { name: strip(source, 200) || 'Your own file', licence: strip(licence, 200) || 'Your own licence from the publisher' }, redistributable: false, verified: false, rows,
  });
  /* i18n-ignore-end */
  return r.ok ? { ok: true, pack: r.pack, columns: { code: ci, title: ti, header: head >= 0 }, skipped } : r;
}
export function packToCsv(pack) {
  const cell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return '﻿' + [['Code', 'Title'], ...pack.rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}

/** Look codes up across the loaded packs (several packs of one system are read as one list; the first pack that has a code names it). */
export function packIndex(packs = []) {
  const bySys = new Map();
  for (const p of packs) {
    if (!p || !Array.isArray(p.rows)) continue;
    if (!bySys.has(p.system)) bySys.set(p.system, { map: new Map(), list: [] });
    const S = bySys.get(p.system);
    for (const [code, title] of p.rows) { const k = code.toLowerCase(); if (!S.map.has(k)) { const row = { code, title, pack: p.id }; S.map.set(k, row); S.list.push(row); } }
  }
  return {
    has: (system) => bySys.has(system),
    count: (system) => bySys.get(system)?.list.length || 0,
    find: (system, code) => bySys.get(system)?.map.get(String(code ?? '').trim().toLowerCase()) || null,
    search(system, text, limit = 30) {
      const S = bySys.get(system), q = String(text ?? '').trim().toLowerCase();
      if (!S || !q) return [];
      const words = q.split(/\s+/), starts = [], rest = [];
      for (const r of S.list) {
        const c = r.code.toLowerCase();
        if (c.startsWith(q)) starts.push(r);
        else { const hay = c + ' ' + r.title.toLowerCase(); if (words.every((w) => hay.includes(w))) rest.push(r); }
        if (starts.length >= limit) break;
      }
      return starts.concat(rest).slice(0, limit);
    },
  };
}

// ------------------------------------------------------------------------------------------------ default codes by class
export const DEFAULTS_FORMAT = 'cadcraft-classification-defaults';
export function readDefaults(j) {
  if (!j || j.format !== DEFAULTS_FORMAT || j.version !== 1 || !SYSTEM_IDS.includes(j.system) || !j.classes || typeof j.classes !== 'object') return null;
  const classes = {};
  for (const [k, v] of Object.entries(j.classes)) if (/^Ifc[A-Za-z]+(\.[A-Z_]+)?$/.test(k) && cleanCode(v)) classes[k] = cleanCode(v);
  return { format: DEFAULTS_FORMAT, version: 1, system: j.system, pack: strip(j.pack, 60), verified: j.verified === true, note: strip(j.note, 400), classes };
}
/** 'IfcSlab' + 'ROOF' → the code for 'IfcSlab.ROOF', else for 'IfcSlab' (a StandardCase reads as its class), else null. */
export function defaultFor(defaults, cls, predefined = '') {
  if (!defaults?.classes) return null;
  const c = String(cls || '').replace(/StandardCase$|ElementedCase$/, '');
  return defaults.classes[c + '.' + String(predefined || '').toUpperCase()] || defaults.classes[c] || null;
}

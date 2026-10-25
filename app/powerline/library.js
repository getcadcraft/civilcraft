/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/library.js — the power-line libraries people make themselves (0.7 PL.1): overhead conductors and bundled cables,
 * underground cables, supports (poles, towers), equipment (crossarms, insulators, fittings, transformers, cabinets, joints,
 * arresters, switches) and trench types. Categories and sub-categories are the person's own: a free path "Overhead/LV/Bundled".
 * Nothing is tied to one country or one maker. No DOM.
 *
 *   KINDS                         ['conductor', 'cable', 'support', 'equipment', 'trench']
 *   FIELDS[kind]                  [{ k, type: 'num'|'text'|'enum'|'bool', req, unit, min, max, opts }]  (SI units: m, mm, kg, N, Ω/km, A, kV)
 *   readLibrary(json)             untrusted file or saved list → { items, notes[] }   (format 'cadcraft-lines' v1, or a bare array)
 *   libraryToJson(items, meta)    → the file object (stringify it)
 *   libraryFromCsv(text, kind)    a spreadsheet of one kind, columns in any order (header = field keys or their labels) → { items, notes }
 *   libraryToCsv(items, kind)     → text (formula-looking cells quoted)
 *   categoryTree(items)           → { name: '', path: '', children: [...], items: [...] }   (sorted, paths split on "/")
 *   missingFields(item)           → required field keys that are empty
 *   mergeLibraries(base, own)     own items win by key; → items
 *   itemKey(item)                 the item's stable key ('u…' made here, or what the file gave)
 *   newItem(kind, values)         → a clean item with a fresh key
 *   starterLibrary()              the generic items we ship (numbers computed from material properties and stranding; each says
 *                                 "example: check against your supplier's data"): no maker's catalogue is copied
 *
 * Numbers in a CSV may use a decimal comma when the separator is ";" (common in French and Spanish spreadsheets).
 */

import { fin } from './units.js';
import { t } from '../i18n.js';

export const LINES_FORMAT = 'cadcraft-lines';
export const LINES_VERSION = 1;
export const KINDS = ['conductor', 'cable', 'support', 'equipment', 'trench'];
export const EQUIP_TYPES = ['crossarm', 'insulator', 'fitting', 'stay', 'transformer', 'cabinet', 'joint', 'arrester', 'switch', 'other'];
export const SUPPORT_MATERIALS = ['wood', 'concrete', 'steel', 'composite', 'lattice', 'other'];
export const CONDUCTOR_MATERIALS = ['aluminium', 'aluminium-alloy', 'aluminium-steel', 'copper', 'steel', 'bundled', 'other'];
export const LIMITS = { items: 20000, text: 200, note: 1000 };

const f = (k, type, opts = {}) => ({ k, type, req: false, ...opts });
const COMMON = [f('name', 'text', { req: true }), f('category', 'text'), f('maker', 'text'), f('ref', 'text'), f('note', 'text')];

/** The fields of each kind, in the order a form and a CSV show them. Units are the field's unit, shown beside it. */
export const FIELDS = {
  conductor: [...COMMON,
    f('material', 'enum', { opts: CONDUCTOR_MATERIALS }),
    f('area_mm2', 'num', { req: true, unit: 'mm²', min: 1, max: 3000 }),
    f('diameter_mm', 'num', { req: true, unit: 'mm', min: 1, max: 200 }),
    f('mass_kg_m', 'num', { req: true, unit: 'kg/m', min: 0.01, max: 50 }),
    f('rts_N', 'num', { req: true, unit: 'N', min: 100, max: 2e6 }),
    f('e_GPa', 'num', { req: true, unit: 'GPa', min: 1, max: 250 }),
    f('alpha_e6', 'num', { req: true, unit: '10⁻⁶/°C', min: 1, max: 40 }),
    f('r20_ohm_km', 'num', { unit: 'Ω/km', min: 0, max: 100 }),
    f('x_ohm_km', 'num', { unit: 'Ω/km', min: 0, max: 10 }),
    f('ampacity_A', 'num', { unit: 'A', min: 0, max: 10000 }),
    f('voltage_kV', 'num', { unit: 'kV', min: 0, max: 1200 }),
    f('cores', 'num', { min: 1, max: 12 }),
  ],
  cable: [...COMMON,
    f('material', 'enum', { opts: ['aluminium', 'copper', 'other'] }),
    f('cores', 'num', { req: true, min: 1, max: 12 }),
    f('area_mm2', 'num', { req: true, unit: 'mm²', min: 1, max: 3000 }),
    f('voltage_kV', 'num', { req: true, unit: 'kV', min: 0, max: 1200 }),
    f('diameter_mm', 'num', { req: true, unit: 'mm', min: 1, max: 300 }),
    f('mass_kg_m', 'num', { unit: 'kg/m', min: 0.01, max: 100 }),
    f('r20_ohm_km', 'num', { req: true, unit: 'Ω/km', min: 0, max: 100 }),
    f('x_ohm_km', 'num', { unit: 'Ω/km', min: 0, max: 10 }),
    f('ampacity_A', 'num', { req: true, unit: 'A', min: 0, max: 10000 }),
    f('bend_m', 'num', { unit: 'm', min: 0, max: 20 }),
    f('drum_m', 'num', { unit: 'm', min: 1, max: 20000 }),
  ],
  support: [...COMMON,
    f('material', 'enum', { opts: SUPPORT_MATERIALS }),
    f('height_m', 'num', { req: true, unit: 'm', min: 2, max: 150 }),
    f('nominal_N', 'num', { req: true, unit: 'N', min: 100, max: 1e7 }),
    f('loadDrop_m', 'num', { unit: 'm', min: 0, max: 10 }),
    f('embed_m', 'num', { unit: 'm', min: 0, max: 20 }),
    f('mass_kg', 'num', { unit: 'kg', min: 0, max: 1e6 }),
    f('topDiam_mm', 'num', { unit: 'mm', min: 0, max: 5000 }),
    f('footDiam_mm', 'num', { unit: 'mm', min: 0, max: 5000 }),
    f('roles', 'text'),
  ],
  equipment: [...COMMON,
    f('type', 'enum', { req: true, opts: EQUIP_TYPES }),
    f('rated_N', 'num', { unit: 'N', min: 0, max: 1e7 }),
    f('drop_m', 'num', { unit: 'm', min: 0, max: 20 }),
    f('spacing_m', 'num', { unit: 'm', min: 0, max: 30 }),
    f('length_m', 'num', { unit: 'm', min: 0, max: 20 }),
    f('angle_deg', 'num', { unit: '°', min: 10, max: 80 }),
    f('mass_kg', 'num', { unit: 'kg', min: 0, max: 1e6 }),
    f('kVA', 'num', { unit: 'kVA', min: 0, max: 1e6 }),
    f('voltage_kV', 'num', { unit: 'kV', min: 0, max: 1200 }),
  ],
  trench: [...COMMON,
    f('depth_m', 'num', { req: true, unit: 'm', min: 0.1, max: 10 }),
    f('width_m', 'num', { req: true, unit: 'm', min: 0.05, max: 10 }),
    f('cover_m', 'num', { req: true, unit: 'm', min: 0, max: 10 }),
    f('bedding_m', 'num', { unit: 'm', min: 0, max: 2 }),
    f('ducts', 'num', { min: 0, max: 64 }),
    f('ductDiam_mm', 'num', { unit: 'mm', min: 0, max: 2000 }),
    f('clearance_m', 'num', { unit: 'm', min: 0, max: 10 }),
  ],
};

const str = (v, max = LIMITS.text) => (v == null ? '' : String(v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max));
const num = (v) => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string' || v.trim() === '') return null;
  const n = Number(v.trim().replace(/\s/g, ''));
  return Number.isFinite(n) ? n : null;
};
let seq = 0;
const freshKey = () => 'u' + Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 6);
const okKey = (k) => typeof k === 'string' && /^[A-Za-z0-9_.:-]{1,64}$/.test(k);

/** One item from untrusted data → a clean item or null (with why in `notes`). */
export function cleanItem(raw, notes = [], forceKind = null) {
  if (!raw || typeof raw !== 'object') return null;
  const kind = forceKind || raw.kind;
  if (!KINDS.includes(kind)) { notes.push({ why: 'kind', name: str(raw.name) }); return null; }
  const it = { key: okKey(raw.key) ? raw.key : freshKey(), kind };
  for (const fd of FIELDS[kind]) {
    const v = raw[fd.k];
    if (fd.type === 'text') { const s = str(v, fd.k === 'note' ? LIMITS.note : LIMITS.text); if (s) it[fd.k] = fd.k === 'category' ? cleanPath(s) : s; }
    else if (fd.type === 'enum') { const s = str(v).toLowerCase(); if (fd.opts.includes(s)) it[fd.k] = s; }
    else if (fd.type === 'bool') { if (typeof v === 'boolean') it[fd.k] = v; }
    else {
      const n = num(v);
      if (n === null) continue;
      if ((fd.min != null && n < fd.min) || (fd.max != null && n > fd.max)) { notes.push({ why: 'range', name: str(raw.name), field: fd.k, value: n }); continue; }
      it[fd.k] = n;
    }
  }
  if (!it.name) { notes.push({ why: 'name' }); return null; }
  if (raw.source === 'starter') it.source = 'starter';
  return it;
}
export const cleanPath = (s) => str(s).split('/').map((p) => p.trim()).filter(Boolean).join('/');

/** A library file or list (untrusted) → { items, notes }. */
export function readLibrary(obj) {
  const notes = [];
  let list = null;
  if (Array.isArray(obj)) list = obj;
  else if (obj && typeof obj === 'object' && obj.format === LINES_FORMAT) {
    if (obj.version !== LINES_VERSION) notes.push({ why: 'version', value: obj.version });
    list = Array.isArray(obj.items) ? obj.items : [];
  } else return { items: [], notes: [{ why: 'format' }] };
  const items = [], seen = new Set();
  for (const raw of list.slice(0, LIMITS.items)) {
    const it = cleanItem(raw, notes);
    if (!it) continue;
    if (seen.has(it.key)) it.key = freshKey();
    seen.add(it.key);
    items.push(it);
  }
  if (list.length > LIMITS.items) notes.push({ why: 'limit', value: LIMITS.items });
  return { items, notes };
}

export function libraryToJson(items, meta = {}) {
  return { format: LINES_FORMAT, version: LINES_VERSION, name: str(meta.name) || t('pl.lib.own.name'), description: str(meta.description, LIMITS.note),
    items: items.map((it) => { const o = { key: it.key, kind: it.kind }; for (const fd of FIELDS[it.kind]) if (it[fd.k] !== undefined) o[fd.k] = it[fd.k]; return o; }) };
}

// ---- CSV ----
const csvCell = (v) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d/.test(s)) s = "'" + s;   // a spreadsheet would run it as a formula
  return /[",;\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
export function libraryToCsv(items, kind) {
  const head = FIELDS[kind].map((fd) => fd.k);
  return [head.join(','), ...items.filter((it) => it.kind === kind).map((it) => head.map((k) => csvCell(it[k])).join(','))].join('\r\n') + '\r\n';
}
export function parseCsv(text, maxRows = LIMITS.items + 1) {
  const rows = [];
  let row = [], cell = '', q = false;
  const s = String(text).replace(/^﻿/, '');
  const first = s.split(/\r?\n/, 1)[0] || '';
  const c = (first.match(/,/g) || []).length, sc = (first.match(/;/g) || []).length, tb = (first.match(/\t/g) || []).length;
  const sep = tb > c && tb > sc ? '\t' : sc > c ? ';' : ',';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) { if (ch === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; continue; }
    if (ch === '"' && cell === '') q = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && s[i + 1] === '\n') i++; row.push(cell); cell = ''; if (row.some((x) => x !== '')) rows.push(row); row = []; if (rows.length > maxRows) break; }
    else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); if (row.some((x) => x !== '')) rows.push(row); }
  return { rows, sep };
}
const norm = (h) => String(h).toLowerCase().replace(/^'/, '').replace(/[^a-z0-9]/g, '');
/** A CSV of one kind → { items, notes }. The header names the fields (our keys; spaces, case and units in the header ignored). */
export function libraryFromCsv(text, kind) {
  if (!KINDS.includes(kind)) return { items: [], notes: [{ why: 'kind' }] };
  const { rows, sep } = parseCsv(text);
  if (rows.length < 2) return { items: [], notes: [{ why: 'empty' }] };
  const fields = FIELDS[kind];
  const byNorm = new Map(fields.map((fd) => [norm(fd.k), fd]));
  for (const fd of fields) byNorm.set(norm(fd.k.replace(/_.*$/, '')), byNorm.get(norm(fd.k.replace(/_.*$/, ''))) || fd);   // "area" for area_mm2
  const cols = rows[0].map((h) => byNorm.get(norm(h)) || byNorm.get(norm(String(h).replace(/\(.*\)|\[.*\]/g, ''))) || null);
  const notes = [];
  if (!cols.some((fd) => fd && fd.k === 'name')) return { items: [], notes: [{ why: 'noname' }] };
  const unknown = rows[0].filter((h, i) => !cols[i] && String(h).trim());
  if (unknown.length) notes.push({ why: 'columns', value: unknown.slice(0, 10).join(', ') });
  const items = [];
  for (const r of rows.slice(1, LIMITS.items + 1)) {
    const raw = { kind };
    cols.forEach((fd, i) => {
      if (!fd || r[i] === undefined) return;
      let v = r[i].replace(/^'(?=[=+\-@])/, '');
      if (fd.type === 'num' && sep === ';') v = v.replace(',', '.');
      raw[fd.k] = v;
    });
    const it = cleanItem(raw, notes, kind);
    if (it) items.push(it);
  }
  return { items, notes };
}

// ---- categories ----
export function categoryTree(items) {
  const root = { name: '', path: '', children: [], items: [] };
  const at = new Map([['', root]]);
  const node = (path) => {
    if (at.has(path)) return at.get(path);
    const i = path.lastIndexOf('/'), parent = node(i < 0 ? '' : path.slice(0, i));
    const n = { name: i < 0 ? path : path.slice(i + 1), path, children: [], items: [] };
    parent.children.push(n); at.set(path, n);
    return n;
  };
  for (const it of items) node(it.category || '').items.push(it);
  const sort = (n) => { n.children.sort((a, b) => a.name.localeCompare(b.name)); n.items.sort((a, b) => a.name.localeCompare(b.name)); n.children.forEach(sort); };
  sort(root);
  return root;
}

export const itemKey = (it) => it.key;
export function missingFields(it) {
  if (!it || !FIELDS[it.kind]) return [];
  return FIELDS[it.kind].filter((fd) => fd.req && (it[fd.k] === undefined || it[fd.k] === '' || it[fd.k] === null)).map((fd) => fd.k);
}
export function mergeLibraries(base, own) {
  const m = new Map();
  for (const it of base || []) m.set(it.key, it);
  for (const it of own || []) m.set(it.key, it);
  return [...m.values()];
}
export function newItem(kind, values = {}) {
  const it = cleanItem({ ...values, kind, key: undefined, name: values.name || kind }, [], kind);
  return it;
}

// ---- the starter library: generic, computed here ----
// Material properties (textbook values, rounded): aluminium 1350 density 2703 kg/m³, resistivity 0.028264 Ω·mm²/m at 20 °C,
// strand strength ~170 MPa, E 55–60 GPa stranded, α 23 × 10⁻⁶/°C; aluminium alloy (6201-type) 2690 kg/m³, 0.0328 Ω·mm²/m,
// ~300 MPa; galvanised steel 7780 kg/m³, ~1300 MPa, 200 GPa, 11.5 × 10⁻⁶/°C; copper 8890 kg/m³, 0.017241 Ω·mm²/m.
// Stranding: layers of 6, 12, 18 … round wires; a lay factor of 1.02 on length and mass; a stranding loss of 10 % on strength.
// Names, categories and notes are words (pl.st.*); the keys never change with the language, so a project and the defaults find them.
const PI = Math.PI;
const cat = (...k) => k.map((x) => t('pl.st.cat.' + x)).join('/');
function stranded({ key, name, category, wires, d, steelWires = 0, ds = 0, mat = 'al' }) {
  const M = { al: { rho: 2703, res: 0.028264, uts: 170e6, e: 59, a: 23 }, alloy: { rho: 2690, res: 0.0328, uts: 300e6, e: 59, a: 23 }, cu: { rho: 8890, res: 0.017241, uts: 400e6, e: 105, a: 17 } }[mat];
  const aA = wires * PI * d * d / 4, aS = steelWires * PI * ds * ds / 4;   // mm²
  const layers = (n) => (n <= 1 ? 1 : n <= 7 ? 3 : n <= 19 ? 5 : n <= 37 ? 7 : 9);
  const D = steelWires ? ds * layers(steelWires) + 2 * d * ((layers(wires + steelWires) - layers(steelWires)) / 2) : d * layers(wires);
  const mass = 1.02 * (aA * 1e-6 * M.rho + aS * 1e-6 * 7780);
  const rts = 0.9 * (aA * 1e-6 * M.uts + aS * 1e-6 * 1300e6);
  const e = steelWires ? (M.e * aA + 200 * aS) / (aA + aS) : M.e;
  const alpha = steelWires ? (M.a * M.e * aA + 11.5 * 200 * aS) / (M.e * aA + 200 * aS) : M.a;
  const r = 1.02 * M.res / aA * 1000;
  return { key, kind: 'conductor', source: 'starter', name, category, note: t('pl.st.note'),
    material: steelWires ? 'aluminium-steel' : mat === 'alloy' ? 'aluminium-alloy' : mat === 'cu' ? 'copper' : 'aluminium',
    area_mm2: +(aA + aS).toFixed(1), diameter_mm: +D.toFixed(2), mass_kg_m: +mass.toFixed(4), rts_N: Math.round(rts), e_GPa: +e.toFixed(1),
    alpha_e6: +alpha.toFixed(1), r20_ohm_km: +r.toFixed(4) };
}
export function starterLibrary() {
  const al = (n, d) => t('pl.st.al', { n, d }), alloy = (n, d) => t('pl.st.alloy', { n, d });
  const items = [
    stranded({ key: 's-aluminium-7-3-0-mm', name: al(7, '3.0'), category: cat('overhead', 'bare', 'al'), wires: 7, d: 3.0 }),
    stranded({ key: 's-aluminium-19-3-0-mm', name: al(19, '3.0'), category: cat('overhead', 'bare', 'al'), wires: 19, d: 3.0 }),
    stranded({ key: 's-aluminium-alloy-7-3-15-mm', name: alloy(7, '3.15'), category: cat('overhead', 'bare', 'alloy'), wires: 7, d: 3.15, mat: 'alloy' }),
    stranded({ key: 's-aluminium-alloy-19-3-15-mm', name: alloy(19, '3.15'), category: cat('overhead', 'bare', 'alloy'), wires: 19, d: 3.15, mat: 'alloy' }),
    stranded({ key: 's-aluminium-steel-6-1-3-0-mm', name: t('pl.st.acs', { a: 6, s: 1, d: '3.0' }), category: cat('overhead', 'bare', 'acs'), wires: 6, d: 3.0, steelWires: 1, ds: 3.0 }),
    stranded({ key: 's-aluminium-steel-26-7-3-0-mm', name: t('pl.st.acs', { a: 26, s: 7, d: '3.0' }), category: cat('overhead', 'bare', 'acs'), wires: 26, d: 3.0, steelWires: 7, ds: 2.3 }),
  ];
  // a bundled low-voltage cable: three phases + an alloy messenger that carries the span, insulation on top (estimated)
  const msg = stranded({ key: 'm', name: 'm', category: '', wires: 7, d: 3.15, mat: 'alloy' });   // i18n-ignore: an internal part, never shown
  items.push({ key: 's-bundled-3x70-54', kind: 'conductor', source: 'starter', name: t('pl.st.bundled'), category: cat('overhead', 'bundled', 'lv'), note: t('pl.st.note') + ' ' + t('pl.st.note.messenger'),
    material: 'bundled', area_mm2: 54.6, diameter_mm: 40, mass_kg_m: +(3 * 70e-6 * 2703 * 1.02 + msg.mass_kg_m + 4 * 0.12).toFixed(3), rts_N: msg.rts_N, e_GPa: 59, alpha_e6: 23,
    r20_ohm_km: +(1.02 * 0.028264 / 70 * 1000).toFixed(4), cores: 4, voltage_kV: 1 });
  const ug = (key, name, category, cores, area, kV, D, mat = 'aluminium') => ({ key, kind: 'cable', source: 'starter', name, category, note: t('pl.st.note') + ' ' + t('pl.st.note.ampacity'),
    material: mat, cores, area_mm2: area, voltage_kV: kV, diameter_mm: D, r20_ohm_km: +((mat === 'copper' ? 0.017241 : 0.028264) * 1.02 / area * 1000).toFixed(4) });
  items.push(ug('s-aluminium-4-150-mm-lv', t('pl.st.ug.lv', { n: 4, a: 150 }), cat('underground', 'lv'), 4, 150, 1, 50), ug('s-aluminium-4-240-mm-lv', t('pl.st.ug.lv', { n: 4, a: 240 }), cat('underground', 'lv'), 4, 240, 1, 62),
    ug('s-aluminium-3-1-150-mm-mv', t('pl.st.ug.mv', { a: 150 }), cat('underground', 'mv'), 3, 150, 20, 75), ug('s-aluminium-3-1-240-mm-mv', t('pl.st.ug.mv', { a: 240 }), cat('underground', 'mv'), 3, 240, 20, 85));
  const pole = (mat, h, nominal) => ({ key: `s-pole-${mat}-${h}-${nominal}`, kind: 'support', source: 'starter',   // i18n-ignore: a key
    name: t(mat === 'wood' ? 'pl.st.pole.wood' : 'pl.st.pole.concrete', { h, daN: nominal / 10 }),
    category: cat('supports', mat), note: t('pl.st.note'), material: mat, height_m: h, nominal_N: nominal, loadDrop_m: 0.25, embed_m: +(h / 10 + 0.5).toFixed(2), roles: 'suspension,angle,deadend' });   // i18n-ignore: role names (data)
  for (const h of [9, 10, 11, 12]) for (const n of [2500, 4000, 6500]) items.push(pole('wood', h, n));
  for (const h of [10, 12, 14]) for (const n of [4000, 6500, 10000, 16000]) items.push(pole('concrete', h, n));
  const eq = (key, nameKey, category, values) => ({ key, kind: 'equipment', source: 'starter', name: t('pl.st.eq.' + nameKey), category, note: t('pl.st.note'), ...values });
  items.push(eq('s-crossarm-1-5-m-3-phases', 'arm15', cat('equipment', 'arms'), { type: 'crossarm', spacing_m: 0.7, drop_m: 0.3, rated_N: 8000, mass_kg: 25 }),
    eq('s-crossarm-2-0-m-3-phases', 'arm20', cat('equipment', 'arms'), { type: 'crossarm', spacing_m: 0.95, drop_m: 0.3, rated_N: 12000, mass_kg: 35 }),
    eq('s-suspension-clamp-bundled-lv', 'susp', cat('equipment', 'fittings'), { type: 'fitting', rated_N: 12000, drop_m: 0.2, mass_kg: 0.5 }),
    eq('s-anchor-clamp-bundled-lv', 'anchor', cat('equipment', 'fittings'), { type: 'fitting', rated_N: 15000, drop_m: 0.2, mass_kg: 0.8 }),
    eq('s-suspension-insulator-mv', 'ins_s', cat('equipment', 'insulators'), { type: 'insulator', length_m: 0.45, rated_N: 70000, mass_kg: 4, voltage_kV: 20 }),
    eq('s-tension-insulator-mv', 'ins_t', cat('equipment', 'insulators'), { type: 'insulator', length_m: 0.5, rated_N: 70000, mass_kg: 5, voltage_kV: 20 }),
    eq('s-pole-mounted-transformer-100-kva', 'tx', cat('equipment', 'tx'), { type: 'transformer', kVA: 100, voltage_kV: 20, mass_kg: 500 }),
    eq('s-street-cabinet', 'cabinet', cat('equipment', 'cabinets'), { type: 'cabinet' }),
    eq('s-straight-joint', 'joint', cat('equipment', 'joints'), { type: 'joint' }),
    eq('s-surge-arrester-mv', 'arrester', cat('equipment', 'arresters'), { type: 'arrester', voltage_kV: 20, mass_kg: 3 }),
    eq('s-stay-45-30kn', 'stay30', cat('equipment', 'stays'), { type: 'stay', rated_N: 30000, angle_deg: 45, mass_kg: 15 }),
    eq('s-stay-45-60kn', 'stay60', cat('equipment', 'stays'), { type: 'stay', rated_N: 60000, angle_deg: 45, mass_kg: 25 }));
  const tr = (key, nameKey, depth, width, cover, ducts, ductDiam) => ({ key, kind: 'trench', source: 'starter', name: t('pl.st.tr.' + nameKey), category: cat('trenches'), note: t('pl.st.note') + ' ' + t('pl.st.note.trench'),
    depth_m: depth, width_m: width, cover_m: cover, bedding_m: 0.1, ducts, ductDiam_mm: ductDiam, clearance_m: 0.2 });
  items.push(tr('s-trench-footway-direct-burial', 'footway', 0.7, 0.4, 0.6, 0, 0), tr('s-trench-road-crossing-2-ducts', 'road', 1.0, 0.5, 0.8, 2, 160), tr('s-trench-field-direct-burial', 'field', 0.9, 0.4, 0.8, 0, 0));
  return items;
}

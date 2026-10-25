/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the only words here are data field names and English fallbacks the apps replace with their own
   translated words (codes in notes are translated by each app: plants.note.*). */
/**
 * plants.js — the `plants` library: one species table that CivilCraft (the Landscape workspace), BimCraft and ModelCraft all
 * place from (0.7 LD.1, session `landscape`). No DOM, no imports. Canonical here (lib/plants/); byte-identical copies in
 * civilcraft/dev/landscape/, bimcraft/dev/plants/ and modelcraft/dev/plants/ by `node tools/plants/sync.mjs [--check]`.
 *
 * The file (format `cadcraft-plants`, version 1; JSON; lengths in METRES, a landscape habit — the library item format is mm
 * and libraryItem() converts):
 *   { format, version, name, description, license: {id, holder, attribution, url}, sources: [{id, text, url}],
 *     species: [species…] }
 *   species = { key (a-z0-9-, unique), botanical, names: {en, es, pt, …} (language code → common name),
 *     type (TYPES), form (FORMS), foliage (FOLIAGE),
 *     size: { plant: {h, s} | null, mature: {h, s} }  (height and spread, m; plant = the size it goes in at),
 *     growth (GROWTH), light: [LIGHT…], water (WATER), soil: [SOILS…], zone: {min, max} | null (USDA hardiness 1–13),
 *     spacing (m, centre to centre in a bed or a hedge row; null = from the spread), container ('' or e.g. '10 L'),
 *     region: [REGIONS…], notes, symbol (SYMBOLS | '' = from the form), model ('' | 'entourage:<slug>' | 'library:<uuid>'),
 *     source (an id from sources[]) }
 *
 *   readPlants(obj) → { library, notes: [{code, n?, key?}] }   untrusted: every field checked, sizes capped, junk dropped
 *   writePlants(library) → plain object (stable key order)      what readPlants accepts
 *   plantsToCsv(species, {langs}) → text                        one row per species; formula-looking text gets a leading '
 *   plantsFromCsv(text) → { species, notes }                    the same columns (header names any order), then readPlants rules
 *   search(species, query, filters) → species[]                 any field; filters {type, form, foliage, water, light, zone, region, maxHeight}
 *   displayName(sp, lang) · sizeOf(sp, 'plant'|'mature') → {h, s} · spacingOf(sp) · symbolOf(sp) · modelOf(sp)
 *   mergeLists(base, own) → species[]                          own rows (the project's list) replace base rows with the same key
 *   symbolPlan(sp, {which, scale}) → {layers, entities}         a 2D planting symbol drawn from numbers, at the plant's spread
 *   libraryItem(sp, {which, body}) → a CadCraft library item, format 1, without uuid/version/license/provenance
 *   defaultsFor(type, form, mature) → {plant, container, spacing}   the defaults the seed list uses (and the CSV import offers)
 */

export const PLANTS_FORMAT = 'cadcraft-plants';
export const PLANTS_VERSION = 1;
export const TYPES = ['tree', 'shrub', 'hedge', 'grass', 'perennial', 'groundcover', 'climber'];
export const FORMS = ['broadleaf', 'conifer', 'columnar', 'palm', 'weeping', 'multistem', 'rounded', 'upright', 'spreading', 'mounded', 'clumping', 'turf', 'mat', 'vine', 'fern', 'succulent'];
export const FOLIAGE = ['evergreen', 'deciduous', 'semi'];
export const GROWTH = ['slow', 'medium', 'fast'];
export const LIGHT = ['sun', 'part', 'shade'];
export const WATER = ['low', 'medium', 'high'];
export const SOILS = ['any', 'well-drained', 'moist', 'wet', 'dry', 'sandy', 'loam', 'clay', 'chalk', 'acid', 'neutral', 'alkaline', 'saline'];
export const REGIONS = ['temperate', 'mediterranean', 'subtropical', 'coastal'];
export const SYMBOLS = ['canopy', 'canopy-scallop', 'conifer', 'palm', 'shrub', 'grass', 'groundcover', 'climber', 'hedge'];
export const LIMITS = { species: 20000, text: 200, notes: 1000, height: 150, spread: 60, spacing: 50, bytes: 16 * 1024 * 1024 };
export const CSV_COLUMNS = ['key', 'botanical', 'type', 'form', 'foliage', 'height_m', 'spread_m', 'plant_height_m', 'plant_spread_m', 'growth', 'light', 'water',
  'soil', 'zone_min', 'zone_max', 'spacing_m', 'container', 'region', 'symbol', 'model', 'notes', 'source'];
const LICENSE_IDS = ['CC0-1.0', 'CC-BY-4.0', 'CC-BY-3.0', 'CC-BY-SA-4.0', 'MAKER-TERMS', 'TEAM-ONLY', 'OWN'];

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const clean = (v, n = LIMITS.text) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const r3 = (v) => Math.round(v * 1000) / 1000;
const slug = (s) => clean(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/×/g, 'x').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const num = (v) => (typeof v === 'string' && v.trim() !== '' ? Number(v.trim().replace(',', '.')) : v);
const len = (v, max, min = 0) => { const x = num(v); return fin(x) && x > min && x <= max ? r3(x) : null; };
const pickList = (v, allowed) => {
  const raw = Array.isArray(v) ? v : typeof v === 'string' ? v.split(/[;|/]+/) : [];
  const out = [];
  for (const x of raw) { const k = clean(x, 30).toLowerCase(); if (allowed.includes(k) && !out.includes(k)) out.push(k); }
  return out;
};
const pick = (v, allowed, dflt = '') => { const k = clean(v, 30).toLowerCase(); return allowed.includes(k) ? k : dflt; };

/** The defaults the seed list fills in (said in its source note), and the CSV import uses for empty planting sizes. */
export function defaultsFor(type, form, mature) {
  const M = mature && fin(mature.h) && fin(mature.s) ? mature : { h: 1, s: 1 };
  const cap = (h, s) => ({ h: r3(Math.min(h, M.h)), s: r3(Math.min(s, M.s)) });
  const step = (v, q) => Math.max(q, Math.round(v / q) * q);
  let plant, container, spacing;
  switch (type) {
    case 'tree':
      if (form === 'palm') { plant = cap(2, 1.5); container = '100 L'; }
      else if (form === 'conifer' || form === 'columnar') { plant = cap(1.75, 0.6); container = '45 L'; }
      else { plant = cap(2.75, 1); container = '45 L'; }
      spacing = step(M.s, 0.5);
      break;
    case 'hedge': plant = cap(0.6, 0.3); container = '5 L'; spacing = M.s >= 1.5 ? 0.6 : M.s >= 0.8 ? 0.4 : 0.3; break;
    case 'shrub': plant = cap(0.5, 0.4); container = '10 L'; spacing = step(M.s * 0.75, 0.05); break;
    case 'grass': if (form === 'turf') { plant = cap(0.05, 0.05); container = 'seed or turf'; spacing = 0; } else { plant = cap(0.3, 0.3); container = '3 L'; spacing = step(M.s * 0.7, 0.05); } break;
    case 'perennial': plant = cap(0.25, 0.25); container = '2 L'; spacing = step(M.s * 0.6, 0.05); break;
    case 'groundcover': plant = cap(0.1, 0.15); container = '9 cm pot'; spacing = step(M.s * 0.5, 0.05); break;
    case 'climber': plant = cap(1, 0.3); container = '5 L'; spacing = step(Math.min(M.s, 3) * 0.6, 0.1); break;
    default: plant = cap(0.3, 0.3); container = ''; spacing = step(M.s * 0.7, 0.05);
  }
  return { plant, container, spacing: r3(spacing) };
}

function cleanNames(v) {
  const out = {};
  if (!v || typeof v !== 'object' || Array.isArray(v)) return out;
  for (const [k, val] of Object.entries(v).slice(0, 40)) {
    if (!/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(k)) continue;
    const s = clean(val);
    if (s) out[k] = s;
  }
  return out;
}
function cleanSize(v) {
  if (!v || typeof v !== 'object') return null;
  const h = len(v.h, LIMITS.height), s = len(v.s, LIMITS.spread);
  return h != null && s != null ? { h, s } : null;
}

/** One species row (untrusted) → a clean row, or null (with why). */
export function cleanSpecies(raw, sourceIds = null) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { sp: null, why: 'shape' };
  const botanical = clean(raw.botanical);
  if (!botanical) return { sp: null, why: 'botanical' };
  const type = pick(raw.type, TYPES);
  if (!type) return { sp: null, why: 'type' };
  const mature = cleanSize(raw.size?.mature);
  if (!mature) return { sp: null, why: 'size' };
  let plant = cleanSize(raw.size?.plant);
  if (plant) plant = { h: Math.min(plant.h, mature.h), s: Math.min(plant.s, mature.s) };
  const zmin = Number.isInteger(num(raw.zone?.min)) ? num(raw.zone.min) : null, zmax = Number.isInteger(num(raw.zone?.max)) ? num(raw.zone.max) : null;
  const zone = zmin != null && zmax != null && zmin >= 1 && zmax <= 13 && zmin <= zmax ? { min: zmin, max: zmax } : null;
  const spacing = raw.spacing === 0 || raw.spacing === '0' ? 0 : len(raw.spacing, LIMITS.spacing, 0.0499);
  const model = clean(raw.model, 120);
  const source = clean(raw.source, 40);
  return {
    sp: {
      key: slug(raw.key) || slug(botanical), botanical, names: cleanNames(raw.names), type, form: pick(raw.form, FORMS), foliage: pick(raw.foliage, FOLIAGE),
      size: { plant, mature }, growth: pick(raw.growth, GROWTH), light: pickList(raw.light, LIGHT), water: pick(raw.water, WATER), soil: pickList(raw.soil, SOILS),
      zone, spacing, container: clean(raw.container, 40), region: pickList(raw.region, REGIONS), notes: clean(raw.notes, LIMITS.notes),
      symbol: pick(raw.symbol, SYMBOLS), model: /^(entourage:[a-z0-9-]{1,60}|library:[0-9a-f-]{36})$/.test(model) ? model : '',
      source: !source || !sourceIds || sourceIds.has(source) ? source : '',
    },
    why: null,
  };
}

/** A `plants` file (untrusted) → { library, notes }. Throws only when it is not a plants file at all. */
export function readPlants(obj) {
  if (!obj || typeof obj !== 'object' || obj.format !== PLANTS_FORMAT) throw new Error('not-plants');
  if (obj.version !== PLANTS_VERSION) throw new Error('newer');
  const notes = [];
  const lic = obj.license && typeof obj.license === 'object' ? obj.license : {};
  const license = { id: LICENSE_IDS.includes(lic.id) ? lic.id : 'OWN', holder: clean(lic.holder), attribution: clean(lic.attribution, 500), url: /^https:\/\//.test(lic.url || '') ? clean(lic.url, 500) : '' };
  const sources = (Array.isArray(obj.sources) ? obj.sources.slice(0, 200) : [])
    .map((s) => (s && typeof s === 'object' && /^[a-z0-9-]{1,40}$/.test(s.id) ? { id: s.id, text: clean(s.text, LIMITS.notes), url: /^https:\/\//.test(s.url || '') ? clean(s.url, 500) : '' } : null)).filter(Boolean);
  const ids = new Set(sources.map((s) => s.id));
  const raw = Array.isArray(obj.species) ? obj.species : [];
  if (raw.length > LIMITS.species) notes.push({ code: 'capped', n: raw.length - LIMITS.species });
  const species = [], seen = new Set(), why = {};
  for (const r of raw.slice(0, LIMITS.species)) {
    const { sp, why: w } = cleanSpecies(r, ids);
    if (!sp) { why[w] = (why[w] || 0) + 1; continue; }
    let k = sp.key, i = 2;
    while (seen.has(k)) k = `${sp.key.slice(0, 56)}-${i++}`;
    if (k !== sp.key) notes.push({ code: 'renamed', key: sp.key });
    sp.key = k; seen.add(k); species.push(sp);
  }
  for (const [w, n] of Object.entries(why)) notes.push({ code: 'dropped-' + w, n });
  return { library: { format: PLANTS_FORMAT, version: PLANTS_VERSION, name: clean(obj.name) || 'Plants', description: clean(obj.description, LIMITS.notes), license, sources, species }, notes };
}

export function writePlants(lib) {
  const sp = (s) => ({ key: s.key, botanical: s.botanical, names: s.names, type: s.type, form: s.form, foliage: s.foliage, size: s.size, growth: s.growth,
    light: s.light, water: s.water, soil: s.soil, zone: s.zone, spacing: s.spacing, container: s.container, region: s.region, notes: s.notes, symbol: s.symbol,
    model: s.model, source: s.source });
  return { format: PLANTS_FORMAT, version: PLANTS_VERSION, name: lib.name, description: lib.description || '', license: lib.license, sources: lib.sources || [], species: (lib.species || []).map(sp) };
}

// ---- CSV ----
const csvCell = (v) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d/.test(s)) s = "'" + s;   // a spreadsheet would run it as a formula
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
export function plantsToCsv(species, { langs = null } = {}) {
  const L = langs || [...new Set(species.flatMap((s) => Object.keys(s.names || {})))].sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : a.localeCompare(b)));
  const head = [...CSV_COLUMNS.slice(0, 2), ...L.map((l) => 'name_' + l), ...CSV_COLUMNS.slice(2)];
  const rows = [head.join(',')];
  for (const s of species) {
    const v = { key: s.key, botanical: s.botanical, type: s.type, form: s.form, foliage: s.foliage, height_m: s.size.mature.h, spread_m: s.size.mature.s,
      plant_height_m: s.size.plant?.h ?? '', plant_spread_m: s.size.plant?.s ?? '', growth: s.growth, light: s.light.join(';'), water: s.water, soil: s.soil.join(';'),
      zone_min: s.zone?.min ?? '', zone_max: s.zone?.max ?? '', spacing_m: s.spacing ?? '', container: s.container, region: s.region.join(';'), symbol: s.symbol,
      model: s.model, notes: s.notes, source: s.source };
    for (const l of L) v['name_' + l] = s.names?.[l] || '';
    rows.push(head.map((h) => csvCell(v[h])).join(','));
  }
  return rows.join('\r\n') + '\r\n';
}
export function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  const s = String(text).replace(/^﻿/, '');
  const sep = (() => { const first = s.split(/\r?\n/, 1)[0] || ''; const c = (first.match(/,/g) || []).length, sc = (first.match(/;/g) || []).length, tb = (first.match(/\t/g) || []).length; return tb > c && tb > sc ? '\t' : sc > c ? ';' : ','; })();
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) { if (ch === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; continue; }
    if (ch === '"' && cell === '') q = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && s[i + 1] === '\n') i++; row.push(cell); cell = ''; if (row.some((c) => c !== '')) rows.push(row); row = []; if (rows.length > LIMITS.species + 1) break; }
    else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); if (row.some((c) => c !== '')) rows.push(row); }
  return rows;
}
/** CSV (ours, or a person's own palette with at least botanical, type, height and spread columns) → { species, notes }. */
export function plantsFromCsv(text, { fillDefaults = true } = {}) {
  const rows = parseCsv(text);
  if (!rows.length) return { species: [], notes: [{ code: 'empty' }] };
  const norm = (h) => clean(h, 40).toLowerCase().replace(/[\s()]+/g, '_').replace(/_+$/, '');
  const alias = { name: 'name_en', common: 'name_en', common_name: 'name_en', height: 'height_m', spread: 'spread_m', width: 'spread_m', spacing: 'spacing_m', zone: 'zone_min', light_need: 'light', water_need: 'water', species: 'botanical', latin: 'botanical', botanical_name: 'botanical' };
  const head = rows[0].map((h) => { const n = norm(h).replace(/^'/, ''); return alias[n] || n; });
  if (!head.includes('botanical')) return { species: [], notes: [{ code: 'no-botanical' }] };
  const raw = [];
  for (const r of rows.slice(1)) {
    const v = {};
    head.forEach((h, i) => { let c = r[i] ?? ''; if (c.startsWith("'") && /^'[=+\-@]/.test(c)) c = c.slice(1); v[h] = c; });
    const names = {};
    for (const h of head) if (h.startsWith('name_')) names[h.slice(5)] = v[h];
    const mature = { h: num(v.height_m), s: num(v.spread_m) };
    const plant = v.plant_height_m !== undefined && v.plant_height_m !== '' ? { h: num(v.plant_height_m), s: num(v.plant_spread_m) } : null;
    const zmin = v.zone_min !== '' && v.zone_min != null ? parseInt(v.zone_min, 10) : null;
    const zmax = v.zone_max !== '' && v.zone_max != null ? parseInt(v.zone_max, 10) : zmin;
    raw.push({ key: v.key, botanical: v.botanical, names, type: v.type, form: v.form, foliage: v.foliage, size: { plant, mature }, growth: v.growth,
      light: v.light, water: v.water, soil: v.soil, zone: zmin != null ? { min: zmin, max: zmax } : null, spacing: v.spacing_m === '' ? null : v.spacing_m,
      container: v.container, region: v.region, notes: v.notes, symbol: v.symbol, model: v.model, source: v.source });
  }
  const { library, notes } = readPlants({ format: PLANTS_FORMAT, version: PLANTS_VERSION, name: 'csv', species: raw, sources: [{ id: 'csv', text: '' }] });
  if (fillDefaults) for (const s of library.species) {
    const d = defaultsFor(s.type, s.form, s.size.mature);
    if (!s.size.plant) s.size.plant = d.plant;
    if (s.spacing == null) s.spacing = d.spacing;
    if (!s.container) s.container = d.container;
  }
  return { species: library.species, notes };
}

// ---- reading the table ----
export function displayName(sp, lang = 'en') {
  const n = sp.names || {};
  return n[lang] || n[String(lang).split('-')[0]] || n.en || sp.botanical;
}
export function sizeOf(sp, which = 'mature') { return (which === 'plant' && sp.size.plant) || sp.size.mature; }
export function spacingOf(sp) { return sp.spacing != null ? sp.spacing : defaultsFor(sp.type, sp.form, sp.size.mature).spacing; }
export function symbolOf(sp) {
  if (sp.symbol) return sp.symbol;
  if (sp.type === 'hedge') return 'hedge';
  if (sp.form === 'palm') return 'palm';
  if (sp.form === 'conifer' || sp.form === 'columnar') return 'conifer';
  if (sp.type === 'tree') return sp.foliage === 'evergreen' ? 'canopy-scallop' : 'canopy';
  return { shrub: 'shrub', grass: 'grass', perennial: 'shrub', groundcover: 'groundcover', climber: 'climber' }[sp.type] || 'shrub';
}
/** The 3D model to place (scaled to the plant's size by the app): its own, else the entourage item nearest its form. */
export function modelOf(sp) {
  if (sp.model) return sp.model;
  const f = sp.form, t = sp.type;
  if (t === 'tree') {
    if (f === 'palm') return 'entourage:tree-palm-8m';
    if (f === 'conifer') return 'entourage:tree-conifer-8m';
    if (f === 'columnar') return 'entourage:tree-columnar-7m';
    if (/^betula/i.test(sp.botanical)) return 'entourage:tree-birch-9m';
    return sp.size.mature.h <= 6 ? 'entourage:tree-ornamental-4m' : sp.size.mature.h <= 12 ? 'entourage:tree-deciduous-6m' : 'entourage:tree-deciduous-10m';
  }
  if (t === 'hedge') return 'entourage:hedge-2000';
  if (t === 'grass') return f === 'turf' ? '' : 'entourage:grass-tuft';
  if (t === 'groundcover' || t === 'perennial') return sp.size.mature.h <= 0.4 ? 'entourage:flowers-purple' : 'entourage:shrub-small-600';
  if (t === 'shrub') return f === 'palm' ? 'entourage:tree-palm-8m' : sp.size.mature.h <= 0.8 ? 'entourage:shrub-small-600' : 'entourage:shrub-round-1200';
  return '';
}

export function mergeLists(base, own) {
  const byKey = new Map(base.map((s) => [s.key, s]));
  for (const s of own || []) byKey.set(s.key, s);
  return [...byKey.values()];
}

const fold = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
/** Search: every word of `query` must appear in some field (names in every language, botanical, key, type, form, notes…). */
export function search(species, query = '', filters = {}) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  const f = filters || {};
  return species.filter((s) => {
    if (f.type && s.type !== f.type) return false;
    if (f.form && s.form !== f.form) return false;
    if (f.foliage && s.foliage !== f.foliage) return false;
    if (f.water && s.water && s.water !== f.water) return false;
    if (f.light && s.light.length && !s.light.includes(f.light)) return false;
    if (f.region && s.region.length && !s.region.includes(f.region)) return false;
    if (fin(f.zone) && s.zone && (f.zone < s.zone.min || f.zone > s.zone.max)) return false;
    if (fin(f.maxHeight) && s.size.mature.h > f.maxHeight) return false;
    if (!words.length) return true;
    const hay = fold([s.key, s.botanical, ...Object.values(s.names || {}), s.type, s.form, s.foliage, s.growth, s.water, ...s.light, ...s.soil, ...s.region, s.notes, s.container].join(' '));
    return words.every((w) => hay.includes(w));
  });
}

// ---- symbols (drawn from numbers; ours, CC0) ----
/** A 2D planting symbol centred on (0,0), radius = half the spread, in `scale` units per metre (1000 → mm). Entities in the
 *  CadCraft Doc subset the library item format uses: circle {x,y,r}, arc {x,y,r,a0,a1}, line, poly {pts, closed}. */
export function symbolPlan(sp, { which = 'mature', scale = 1000, sym = null } = {}) {
  const R = (sizeOf(sp, which).s / 2) * scale, kind = sym || symbolOf(sp);
  const L = 'PLANT', D = 'PLANT-DETAIL';
  const E = [], ln = (x1, y1, x2, y2, layer = D) => E.push({ type: 'line', layer, color: null, x1: r3(x1), y1: r3(y1), x2: r3(x2), y2: r3(y2) });
  const circle = (r, layer = L) => E.push({ type: 'circle', layer, color: null, x: 0, y: 0, r: r3(r) });
  const P = (a, r) => [r3(r * Math.cos(a)), r3(r * Math.sin(a))];
  switch (kind) {
    case 'canopy': circle(R); circle(R * 0.06, D); for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; ln(R * 0.12 * Math.cos(a), R * 0.12 * Math.sin(a), R * 0.55 * Math.cos(a), R * 0.55 * Math.sin(a)); } break;
    case 'canopy-scallop': {   // a scalloped outline: arcs bulging outwards between points on the circle
      const n = Math.max(8, Math.min(18, Math.round(R / (0.35 * scale)) + 8)), pts = [];
      for (let i = 0; i < n; i++) { const a = (2 * Math.PI * i) / n; pts.push([...P(a, R * 0.92), 0.35]); }
      E.push({ type: 'poly', layer: L, color: null, pts, closed: true });
      circle(R * 0.06, D);
      break;
    }
    case 'conifer': circle(R); for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; const [x, y] = P(a, R * (i % 2 ? 0.7 : 0.95)); ln(0, 0, x, y); } break;
    case 'palm': for (let i = 0; i < 9; i++) { const a = (2 * Math.PI * i) / 9; const [x, y] = P(a, R); const [mx, my] = P(a + 0.12, R * 0.6); E.push({ type: 'poly', layer: L, color: null, pts: [[0, 0], [mx, my], [x, y]], closed: false }); } circle(R * 0.08, D); break;
    case 'shrub': {
      const n = 7, pts = [];
      for (let i = 0; i < n; i++) { const a = (2 * Math.PI * i) / n + 0.2; pts.push([...P(a, R * (i % 2 ? 0.86 : 0.97)), 0.5]); }
      E.push({ type: 'poly', layer: L, color: null, pts, closed: true });
      break;
    }
    case 'grass': circle(R, D); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + ((i - 4.5) / 4.5) * 1.2; const [x, y] = P(a + Math.PI, R * 0.9); ln(0, -R * 0.2, x, -y, L); } break;
    case 'groundcover': circle(R, D); for (let i = 0; i < 5; i++) { const [x, y] = P((2 * Math.PI * i) / 5, R * 0.45); E.push({ type: 'circle', layer: L, color: null, x, y, r: r3(R * 0.12) }); } break;
    case 'climber': circle(R * 0.15); for (let i = 0; i < 3; i++) { const a = (2 * Math.PI * i) / 3; const [x, y] = P(a, R); E.push({ type: 'arc', layer: L, color: null, x: r3(x / 2), y: r3(y / 2), r: r3(R / 2), a0: r3((a * 180) / Math.PI), a1: r3((a * 180) / Math.PI + 180) }); } break;
    case 'hedge': { const w = R * 0.85, h = R * 0.5; /* a piece of hedge, inside the spread circle */ E.push({ type: 'poly', layer: L, color: null, pts: [[-w, -h, 0.25], [w, -h, 0.25], [w, h, 0.25], [-w, h, 0.25]], closed: true }); break; }
    default: circle(R);
  }
  return { layers: [{ name: L, color: 3 }, { name: D, color: 8 }], entities: E };
}

/** A library item (format 1, partial: no uuid/version/license/provenance) — what BimCraft and ModelCraft place. `body` = an
 *  optional mesh in mm (the app passes the entourage model scaled to this plant), else null (2D only). */
export function libraryItem(sp, { which = 'mature', body = null, lang = 'en' } = {}) {
  const sz = sizeOf(sp, which), mm = (v) => Math.round(v * 1000);
  return {
    format: 'cadcraft-library-item', format_version: 1,
    name: `${displayName(sp, lang)} (${sp.botanical})`.slice(0, 200), kind: 'symbol', category: 'site/landscape',
    description: clean(`${sp.type}${sp.foliage ? ', ' + sp.foliage : ''}; ${which === 'plant' ? 'at planting' : 'at maturity'} ${sz.h} m high, ${sz.s} m across`, 500),
    maker: '', model: '', ifc: { class: 'IfcGeographicElement', predefined: 'USERDEFINED' },
    plan: symbolPlan(sp, { which, scale: 1000 }), body,
    params: { width: mm(sz.s), depth: mm(sz.s), height: mm(sz.h), remarks: clean(sp.notes, 500) },
    source_attrs: { 'CC-PLANT-KEY': sp.key, 'CC-PLANT-BOTANICAL': sp.botanical, 'CC-PLANT-TYPE': sp.type, 'CC-PLANT-SIZE': which, 'CC-PLANT-HEIGHT-M': String(sz.h), 'CC-PLANT-SPREAD-M': String(sz.s) },
  };
}

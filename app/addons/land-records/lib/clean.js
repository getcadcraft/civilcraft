/* SPDX-License-Identifier: Apache-2.0 */
/**
 * clean.js — everything the Land records add-on reads from outside, cleaned (0.11 Track LR): a device's fix, a walk file, and the land book a
 * project file carries. No imports and no DOM, so one copy of THIS file is CivilCraft's dev/landbook.js and the project file keeps its `land`
 * key with the add-on switched off (tools/landrecords/sync.mjs makes the copy; nobody edits it). Never throws: what cannot be read is dropped.
 *
 *   cleanFix(f) → fix | null · newWalk({ name, t, device }) → walk · cleanWalk(o) → { ok, walk, dropped } | { ok: false, why: 'format' | 'newer' }
 *   emptyBook() · cleanBook(o) → book · bookEmpty(book) (nothing worth writing into a file)
 *   The shapes are described in walk.js and book.js, which re-export these.
 */
const fin = Number.isFinite;

// ---------------------------------------------------------------- walks
export const WALK_FORMAT = 'cadcraft-fieldwalk';
export const WALK_VERSION = 1;
export const LIMITS = { points: 2000, track: 50000, fixes: 600, name: 120, code: 24, maxAcc: 10000 };

const str = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

export function cleanFix(f) {
  if (!f || typeof f !== 'object') return null;
  const lat = Number(f.lat), lon = Number(f.lon);
  if (!fin(lat) || !fin(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  const acc = f.acc === null || f.acc === undefined ? null : Number(f.acc);
  const alt = f.alt === null || f.alt === undefined ? null : Number(f.alt);
  const t = Number(f.t);
  return { lat, lon, acc: fin(acc) && acc > 0 && acc <= LIMITS.maxAcc ? acc : null, alt: fin(alt) && Math.abs(alt) < 1e5 ? alt : null, t: fin(t) && t > 0 ? t : 0 };
}

export function newWalk({ name = '', t = 0, device = '' } = {}) {
  return { format: WALK_FORMAT, version: WALK_VERSION, name: str(name, LIMITS.name) || 'Walk', started: fin(t) && t > 0 ? t : 0, device: str(device, 80), points: [], track: [], closed: false, notes: '' };
}

function cleanPoint(p, n) {
  const f = cleanFix(p); if (!f) return null;
  const spread = Number(p.spread), fixes = Number(p.fixes);
  return { n, lat: f.lat, lon: f.lon, alt: f.alt, acc: f.acc, spread: fin(spread) && spread >= 0 ? spread : null, fixes: Number.isInteger(fixes) && fixes > 0 ? Math.min(fixes, LIMITS.fixes) : 1, t: f.t, code: str(p.code, LIMITS.code) || 'C' };
}

export function cleanWalk(o) {
  if (!o || typeof o !== 'object' || o.format !== WALK_FORMAT) return { ok: false, why: 'format' };
  if (o.version !== WALK_VERSION) return { ok: false, why: 'newer' };
  const w = newWalk({ name: o.name, t: Number(o.started), device: o.device });
  let dropped = 0;
  for (const p of Array.isArray(o.points) ? o.points.slice(0, LIMITS.points) : []) { const c = cleanPoint(p, w.points.length + 1); if (c) w.points.push(c); else dropped++; }
  for (const f of Array.isArray(o.track) ? o.track.slice(0, LIMITS.track) : []) { const c = cleanFix(f); if (c) w.track.push(c); else dropped++; }
  w.closed = o.closed === true; w.notes = str(o.notes, 2000);
  return { ok: true, walk: w, dropped };
}


// ---------------------------------------------------------------- the land book
export const BOOK_VERSION = 1;
export const AREA_UNITS = { m2: 1, ha: 10000, ft2: 0.09290304, ac: 4046.8564224 };
export const STATUSES = ['draft', 'walked', 'surveyed', 'agreed', 'disputed', 'registered'];
export const KINDS = ['subdivision', 'consolidation', 'boundary', 'designation'];
export const MAX = { records: 5000, walks: 100, proposals: 500, rules: 200, children: 200, ring: 5000, models: 20, modelBuildings: 500 };
export const DEFAULT_SETTINGS = Object.freeze({ areaTolPct: 1, gapTol: 0.5, maxAcc: 15, averageS: 5 });

const text = (v, n = 4000) => String(v ?? '').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, ' ').slice(0, n);
const num = (v, lo, hi, d) => { const x = Number(v); return v !== null && v !== '' && fin(x) && x >= lo && x <= hi ? x : d; };

export const emptyBook = () => ({ v: BOOK_VERSION, seq: 1, records: [], walks: [], proposals: [], rules: [], settings: { ...DEFAULT_SETTINGS }, applicant: {}, fields: {}, place: '', models: [], sheet: null });

export function cleanRecord(o, id) {
  if (!o || typeof o !== 'object') return null;
  const ra = num(o.recordArea, 0, 1e15, null);
  return {
    id, parcel: /^r\d{1,16}$/.test(String(o.parcel)) ? String(o.parcel) : null, ref: str(o.ref, 80), holder: str(o.holder, 160), tenure: str(o.tenure, 40),
    use: str(o.use, 80), zone: str(o.zone, 80), recordArea: ra !== null && ra > 0 ? ra : null, areaUnit: AREA_UNITS[o.areaUnit] ? o.areaUnit : 'm2',
    source: str(o.source, 200), status: STATUSES.includes(o.status) ? o.status : 'draft', notes: text(o.notes, 2000),
    parent: (Array.isArray(o.parent) ? o.parent : []).slice(0, 50).map((x) => str(x, 80)).filter(Boolean),
  };
}
export const ringOf = (pts) => (Array.isArray(pts) ? pts : []).slice(0, MAX.ring).filter((p) => p && fin(p.x) && fin(p.y) && Math.abs(p.x) < 1e9 && Math.abs(p.y) < 1e9).map((p) => ({ x: p.x, y: p.y }));
const desig = (o) => ({ use: str(o?.use, 80), zone: str(o?.zone, 80) });
function cleanProposal(o, id) {
  if (!o || typeof o !== 'object' || !KINDS.includes(o.kind)) return null;
  const children = (Array.isArray(o.children) ? o.children : []).slice(0, MAX.children).map((c) => ({ name: str(c?.name, 120) || 'Lot', pts: ringOf(c?.pts), ...desig(c) })).filter((c) => c.pts.length >= 3);
  return {
    id, kind: o.kind, title: str(o.title, 160), parents: (Array.isArray(o.parents) ? o.parents : []).slice(0, 200).map(String).filter((x) => /^r\d{1,16}$/.test(x)),
    children, from: desig(o.from), to: desig(o.to), reason: text(o.reason, 4000), status: o.status === 'applied' ? 'applied' : 'draft', made: num(o.made, 1, 1e14, 0),
    ...(Array.isArray(o.parentNames) ? { parentNames: o.parentNames.slice(0, 200).map((x) => str(x, 120)) } : {}),
    ...(Array.isArray(o.parentAreas) ? { parentAreas: o.parentAreas.slice(0, 200).map((x) => num(x, 0, 1e15, 0)) } : {}),
  };
}

/** Buildings read from an IFC model (ifcfoot.js), kept as outlines in the drawing's own coordinates: { id 'lm<n>', name, cell (m), georef, buildings }. */
function cleanModel(o, id) {
  if (!o || typeof o !== 'object') return null;
  const buildings = (Array.isArray(o.buildings) ? o.buildings : []).slice(0, MAX.modelBuildings).map((b) => ({ name: str(b?.name, 120) || 'Building', pts: ringOf(b?.pts), floors: Math.round(num(b?.floors, 1, 500, 1)), height: num(b?.height, 0, 1e5, 0), gfa: num(b?.gfa, 0, 1e12, 0),
    gfaFrom: ['stated', 'slabs', 'footprint'].includes(b?.gfaFrom) ? b.gfaFrom : 'footprint' })).filter((b) => b.pts.length >= 3);
  return buildings.length ? { id, name: str(o.name, 160) || 'Model', cell: num(o.cell, 0, 1000, 0), georef: o.georef === true, added: num(o.added, 1, 1e14, 0), buildings } : null;
}

export function cleanBook(o) {
  const b = emptyBook();
  if (!o || typeof o !== 'object' || Array.isArray(o) || o.v !== BOOK_VERSION) return b;
  const ids = new Set();
  const idOf = (raw, prefix) => { let id = new RegExp('^' + prefix + '\\d{1,16}$').test(String(raw)) && !ids.has(String(raw)) ? String(raw) : null; if (!id) { do { id = prefix + b.seq++; } while (ids.has(id)); } ids.add(id); return id; };
  b.seq = Number.isInteger(o.seq) && o.seq > 0 && o.seq < 1e9 ? o.seq : 1;
  const seen = new Set();
  for (const r of Array.isArray(o.records) ? o.records.slice(0, MAX.records) : []) {
    const c = cleanRecord(r, idOf(r?.id, 'lr')); if (!c) continue;
    if (c.parcel) { if (seen.has(c.parcel)) c.parcel = null; else seen.add(c.parcel); }   // one record per parcel
    b.records.push(c);
  }
  for (const w of Array.isArray(o.walks) ? o.walks.slice(0, MAX.walks) : []) { const c = cleanWalk(w); if (c.ok) { c.walk.id = idOf(w?.id, 'lw'); b.walks.push(c.walk); } }
  for (const p of Array.isArray(o.proposals) ? o.proposals.slice(0, MAX.proposals) : []) { const c = cleanProposal(p, idOf(p?.id, 'lp')); if (c) b.proposals.push(c); }
  for (const r of Array.isArray(o.rules) ? o.rules.slice(0, MAX.rules) : []) { if (r && typeof r === 'object') b.rules.push({ id: idOf(r.id, 'lu'), use: str(r.use, 80), minArea: num(r.minArea, 0, 1e12, 0), minFrontage: num(r.minFrontage, 0, 1e6, 0) }); }
  const s = o.settings || {};
  b.settings = { areaTolPct: num(s.areaTolPct, 0, 100, DEFAULT_SETTINGS.areaTolPct), gapTol: num(s.gapTol, 0, 1000, DEFAULT_SETTINGS.gapTol), maxAcc: num(s.maxAcc, 0.01, 10000, DEFAULT_SETTINGS.maxAcc), averageS: num(s.averageS, 1, 120, DEFAULT_SETTINGS.averageS) };
  const a = o.applicant && typeof o.applicant === 'object' ? o.applicant : {};
  for (const k of ['name', 'agent', 'address', 'contact', 'authority', 'site']) { const v = str(a[k], 300); if (v) b.applicant[k] = v; }
  // what a document asks for and the person typed (documents.js: a pack's own fields)
  if (o.fields && typeof o.fields === 'object' && !Array.isArray(o.fields)) for (const [k, v] of Object.entries(o.fields).slice(0, 100)) { const val = str(v, 600); if (/^[a-z][a-z0-9_]{0,40}$/.test(k) && val) b.fields[k] = val; }
  for (const m of Array.isArray(o.models) ? o.models.slice(0, MAX.models) : []) { const c = cleanModel(m, idOf(m?.id, 'lm')); if (c) b.models.push(c); }
  // the sheet the notes last went out on for marking up (plansheet.js): its file name and the way from the drawing to its paper
  { const s = o.sheet; if (s && typeof s === 'object' && fin(Number(s.a)) && Number(s.a) > 0 && fin(Number(s.bx)) && fin(Number(s.by))) b.sheet = { file: str(s.file, 160), a: Number(s.a), bx: Number(s.bx), by: Number(s.by) }; }
  if (/^[a-z][a-z0-9-]{1,40}$/.test(String(o.place))) b.place = String(o.place);   // the rule pack the person chose for this land (rules.js); only its id
  for (const id of ids) { const m = /(\d+)$/.exec(id); if (m && Number(m[1]) >= b.seq) b.seq = Number(m[1]) + 1; }
  return b;
}

/** True when a book holds nothing worth writing into a project file. */
export const bookEmpty = (b) => !b || (!b.records.length && !b.walks.length && !b.proposals.length && !b.rules.length && !Object.keys(b.applicant || {}).length && !Object.keys(b.fields || {}).length && !b.place && !(b.models || []).length && !b.sheet
  && Object.keys(DEFAULT_SETTINGS).every((k) => (b.settings || {})[k] === DEFAULT_SETTINGS[k]));


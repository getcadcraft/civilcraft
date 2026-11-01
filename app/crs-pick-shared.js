/* SPDX-License-Identifier: Apache-2.0 */
/**
 * crs-pick.js — choose a coordinate system by EPSG number, UTM zone, words, or your own definition (0.8 D8.9, session
 * `d89_PART_3`). DOM-free. It stands on crs.js (CivilCraft's catalog + proj4, docs/GIS-SPEC.md § 1) and adds no second
 * projection library. lib/crs-pick is canonical: `node tools/crs-pick/sync.mjs [--check] [target …]` copies it, byte for byte,
 * next to the crs.js of each app that offers the picker (today BimCraft). Nobody edits a copy.
 *
 *   await loadCatalog() first (crs.js); in Node tests crs.setCatalog(json).
 *   parse(text, { near:[lon,lat], limit }) → { kind, crs?, entry?, matched?, hits?, notes[], error? }
 *       text may be   32633 · EPSG:32633 · "UTM 33N" · "WGS 84 / UTM zone 33 south" · "NAD83 UTM 15N"      kind 'code' | 'utm'
 *                     words of a name ("lambert 93", "mga zone 56")                                        kind 'words' (hits[])
 *                     a proj4 definition ('+proj=tmerc +lat_0=0 …', optional "name = +proj…")             kind 'proj4'
 *                     OGC / ESRI WKT 1 (the text of a .prj)                                                kind 'wkt'
 *       `crs` is a crs.js state.crs ({ code, name, proj4, unit, local:null }); `matched` = the catalog entry that gives the same
 *       coordinates (a custom definition that is really EPSG:n says so, and takes its code); `error` = a words key + text.
 *   utmCode(text) → EPSG number | null      "UTM 33N" → 32633, "UTM 20 S" → 32720, "NAD83 UTM 15N" → 26915, "ETRS89 UTM 32N" → 25832
 *   readMine(storage) → [{ id, name, proj4, unit }]     the person's own list ("My projections"; localStorage cadcraft.projections)
 *   addMine(storage, crs, name?) → entry · removeMine(storage, id) · mineCrs(entry) → crs
 *   systemFor(value, storage) → entry | crs | null      '4326' / '32633' → catalog; 'my:<id>' → the own list; 'file' → null
 *   toRecord(crs) → { Name, Code, Unit, Proj4 }         what a model keeps (BimCraft: property set CadCraft_CRS on IfcProject)
 *   fromRecord(rec) → crs | null                        checked: a record that does not build a projection gives null
 *   sameCoordinates(crsA, crsB) → boolean               the two give the same easting / northing (to 1 mm) at probe points
 */
import proj4 from 'proj4';
import { byCode, search, crsFromPrj, crsFromEntry, catalogLoaded, METRES_PER, transformer } from './crs.js';
import { t } from './i18n.js';

export const MINE_KEY = 'cadcraft.projections';
const MAX_DEF = 20000;
const UNIT_OF = { m: 'm', ft: 'ft', 'us-ft': 'ftUS' };

/** "UTM 33N" etc. → EPSG number (WGS 84 unless a datum is named), or null. */
export function utmCode(text) {
  const s = String(text ?? '').trim();
  const m = /^(?:(wgs\s*-?\s*84|nad\s*-?\s*83|etrs\s*-?\s*89|gda\s*-?\s*94|gda\s*-?\s*2020)\s*[/ ]?\s*)?(?:utm\s*(?:zone)?\s*)(\d{1,2})\s*(n|s|north|south)?\s*$/i.exec(s);
  if (!m) return null;
  const zone = Number(m[2]);
  if (zone < 1 || zone > 60) return null;
  const south = /^s/i.test(m[3] || '');
  const d = (m[1] || 'wgs84').toLowerCase().replace(/[\s-]/g, '');
  if (d === 'wgs84') return (south ? 32700 : 32600) + zone;
  if (d === 'nad83') return !south && zone >= 1 && zone <= 23 ? 26900 + zone : null;
  if (d === 'etrs89') return !south && zone >= 28 && zone <= 38 ? 25800 + zone : null;
  if (d === 'gda94') return south && zone >= 48 && zone <= 58 ? 28300 + zone : null;
  if (d === 'gda2020') return south && zone >= 46 && zone <= 59 ? 7800 + zone : null;
  return null;
}

// ------------------------------------------------------------------ parsing
function unitOfProj4(def, text) {
  if (/\+proj=longlat|\+proj=latlong/i.test(text)) return 'deg';
  const u = /\+units=(\S+)/i.exec(text);
  if (u) return UNIT_OF[u[1].toLowerCase()] || null;
  const k = /\+to_meter=([\d.eE+-]+)/i.exec(text);
  const m = k ? Number(k[1]) : 1;
  if (Math.abs(m - 1) < 1e-12) return 'm';
  if (Math.abs(m - 0.3048) < 1e-10) return 'ft';
  if (Math.abs(m - 1200 / 3937) < 1e-10) return 'ftUS';
  return null;
}
// points on the zone's central meridian and a little off it, as crs.js does for a .prj
function probes(def) {
  const deg = 180 / Math.PI;
  const lon0 = def.zone ? def.zone * 6 - 183 : (def.long0 || 0) * deg;
  let lat = def.lat1 != null && def.lat2 != null ? (def.lat1 + def.lat2) / 2 * deg : (def.lat0 || 0) * deg;
  if (def.zone) lat = def.utmSouth ? -45 : 45;
  lat = Math.max(-80, Math.min(80, lat));
  return [[lon0, lat], [lon0 + 0.5, lat + 0.5], [lon0 - 0.5, lat + 0.25]];
}
const fwd = (P, [lon, lat]) => { const r = P.forward({ x: lon * Math.PI / 180, y: lat * Math.PI / 180 }), k = P.to_meter || 1; return [r.x / k, r.y / k]; };

/** The catalog system that gives the same easting / northing as this definition (own ellipsoid, 1 mm), or null. */
function matchCatalog(proj, unit, hint = '') {
  if (!catalogLoaded() || unit === 'deg') return null;
  let def;
  try { def = proj4.Proj(proj); } catch { return null; }
  const pts = probes(def);
  let want;
  try { want = pts.map((p) => fwd(def, p)); } catch { return null; }
  if (!want.every((w) => w.every(Number.isFinite))) return null;
  const family = (text) => { const k = /\+proj=(\w+)/.exec(text)?.[1]; return k === 'utm' || k === 'etmerc' || k === 'tmerc' ? 'tm' : k; };   // UTM is a transverse Mercator
  const kind = family(proj), mine = datumTokens(proj);
  const all = [];
  for (const e of catalogEntries()) {
    if (e.unit !== unit || e.geographic) continue;
    if (kind && family(e.proj4) !== kind) continue;
    try {
      const P = proj4.Proj(e.proj4);
      if (Math.abs(P.a - def.a) > 1e-3 || Math.abs((P.es || 0) - (def.es || 0)) > 1e-9) continue;
      if (pts.every((p, i) => { const g = fwd(P, p); return Math.hypot(g[0] - want[i][0], g[1] - want[i][1]) < 1e-3; })) all.push(e);
    } catch { /* a definition proj4js can't build is not a match */ }
  }
  if (!all.length) return null;
  all.sort((a, b) => rankOf(a, mine, hint) - rankOf(b, mine, hint));
  return { best: all[0], others: all.slice(1) };
}
let ALL = null;
function catalogEntries() {
  // crs.js keeps its catalog private; search() with an empty query matches nothing, so the entries come from byCode over the code ranges
  if (ALL) return ALL;
  ALL = [];
  const seen = new Set();
  const take = (q) => { for (const e of search(q, { limit: 100000 })) if (!seen.has(e.code)) { seen.add(e.code); ALL.push(e); } };
  take('1'); take('2'); take('3'); take('4'); take('5'); take('6'); take('7'); take('8'); take('9'); take('0');
  return ALL;
}
// among systems giving the same numbers: the one that names the same ellipsoid / datum as the definition, then WGS 84 UTM, NAD83, the rest
const datumTokens = (text) => (String(text).match(/\+(?:ellps|datum)=\S+/gi) || []).map((x) => x.toLowerCase());
const words = (x) => new Set(String(x).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1));
const rankOf = (e, mine = [], hint = '') => -3 * [...words(hint)].filter((w) => words(e.name).has(w)).length + (datumTokens(e.proj4).some((x) => mine.includes(x)) ? 0 : 10) + (/^WGS 84 \/ UTM/.test(e.name) ? 0 : /^NAD83 \//.test(e.name) ? 1 : 3) + e.code / 1e7;

function fromProj4(text, nameIn) {
  const notes = [];
  let s = String(text).trim(), name = nameIn || '';
  const eq = /^([^+=]{1,120})=\s*(\+.*)$/s.exec(s);   // "My grid = +proj=…"
  if (eq) { name = name || eq[1].trim(); s = eq[2].trim(); }
  if (s.length > MAX_DEF) return { kind: 'proj4', notes, error: t('crs.pick.long') };
  if (!/\+proj=/.test(s)) return { kind: 'proj4', notes, error: t('crs.pick.noproj') };
  let def;
  try { def = proj4.Proj(s); } catch { return { kind: 'proj4', notes, error: t('crs.pick.bad') }; }
  const unit = unitOfProj4(def, s);
  if (!unit) return { kind: 'proj4', notes, error: t('crs.pick.unit') };
  try {
    if (unit !== 'deg') {
      const [lon, lat] = probes(def)[0], fw = proj4('EPSG:4326', s), q = fw.forward([lon, lat]), b = fw.inverse(q);
      if (!q.every(Number.isFinite) || !(Math.abs(b[0] - lon) < 1e-6 && Math.abs(b[1] - lat) < 1e-6)) throw new Error('roundtrip');
    }
  } catch { return { kind: 'proj4', notes, error: t('crs.pick.use') }; }
  const crs = { code: null, name: name || t('crs.pick.name'), proj4: s.replace(/\s+/g, ' '), unit, local: null };
  const m = matchCatalog(crs.proj4, unit, name);
  if (m) {
    const matched = m.best;
    notes.push(t('crs.pick.matched', { code: matched.code, name: matched.name }));
    if (m.others.length) notes.push(t('crs.pick.same', { list: m.others.slice(0, 4).map((e) => 'EPSG:' + e.code).join(', ') }));
    return { kind: 'proj4', crs: { ...crsFromEntry(matched), name: name && name !== matched.name ? name : matched.name }, matched, others: m.others, notes };
  }
  return { kind: 'proj4', crs, matched: null, notes };
}

export function parse(text, { near = null, limit = 30 } = {}) {
  if (!catalogLoaded()) return { kind: 'none', notes: [], error: t('crs.notloaded') };
  const s = String(text ?? '').trim();
  if (!s) return { kind: 'none', notes: [] };
  if (/^\+|^[^+=]{1,120}=\s*\+/.test(s)) return fromProj4(s);
  if (/^(PROJCS|GEOGCS|PROJCRS|GEOGCRS|GEODCRS|BOUNDCRS)\[/i.test(s)) {
    try { const r = crsFromPrj(s); return { kind: 'wkt', crs: r.crs, matched: r.matched, notes: r.notes }; } catch (e) { return { kind: 'wkt', notes: [], error: e.message }; }
  }
  const code = /^(?:epsg\s*[:/ ]?\s*)?(\d{4,6})$/i.exec(s);
  if (code) { const e = byCode(Number(code[1])); return e ? { kind: 'code', crs: crsFromEntry(e), entry: e, matched: e, notes: [] } : { kind: 'code', notes: [], error: t('crs.pick.nocode', { code: code[1] }) }; }
  const u = utmCode(s);
  if (u) { const e = byCode(u); if (e) return { kind: 'utm', crs: crsFromEntry(e), entry: e, matched: e, notes: [] }; }
  const hits = search(s, { near, limit });
  return hits.length ? { kind: 'words', hits, notes: [] } : { kind: 'words', hits: [], notes: [], error: t('crs.pick.none', { text: s.slice(0, 60) }) };
}

// ------------------------------------------------------------------ the person's own list
const store = (storage) => storage || (typeof localStorage !== 'undefined' ? localStorage : null);
export function readMine(storage) {
  try {
    const a = JSON.parse(store(storage)?.getItem(MINE_KEY) || '[]');
    return (Array.isArray(a) ? a : []).filter((e) => e && typeof e.id === 'string' && typeof e.proj4 === 'string' && typeof e.name === 'string' && (e.unit === 'deg' || METRES_PER[e.unit]));
  } catch { return []; }
}
const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); };
export function addMine(storage, crs, name) {
  const list = readMine(storage);
  const nm = String(name || crs.name || t('crs.pick.name')).trim().slice(0, 120);
  const id = hash(crs.proj4.replace(/\s+/g, ' '));
  const e = { id, name: nm, proj4: crs.proj4, unit: crs.unit };
  const i = list.findIndex((x) => x.id === id);
  if (i >= 0) list[i] = e; else list.push(e);
  try { store(storage)?.setItem(MINE_KEY, JSON.stringify(list.slice(-200))); } catch { /* private window: this page only */ }
  return e;
}
export function removeMine(storage, id) {
  const list = readMine(storage).filter((x) => x.id !== id);
  try { store(storage)?.setItem(MINE_KEY, JSON.stringify(list)); } catch { /* private window */ }
  return list;
}
export const mineCrs = (e) => ({ code: null, name: e.name, proj4: e.proj4, unit: e.unit, local: null });

export function systemFor(value, storage) {
  const v = String(value ?? '');
  if (v === 'file' || v === '') return null;
  if (v.startsWith('my:')) { const e = readMine(storage).find((x) => x.id === v.slice(3)); return e ? mineCrs(e) : null; }
  if (/^\d+$/.test(v) && catalogLoaded()) return byCode(Number(v));
  return null;
}

// ------------------------------------------------------------------ what a model keeps
export function toRecord(crs) {
  return { Name: String(crs.name || '').slice(0, 255), Code: crs.code == null ? null : Number(crs.code), Unit: crs.unit, Proj4: String(crs.proj4 || '') };
}
export function fromRecord(rec) {
  if (!rec || typeof rec.Proj4 !== 'string' || rec.Proj4.length > MAX_DEF) return null;
  const unit = rec.Unit === 'deg' || METRES_PER[rec.Unit] ? rec.Unit : null;
  if (!unit) return null;
  try { proj4.Proj(rec.Proj4); } catch { return null; }
  const code = Number(rec.Code);
  return { code: Number.isInteger(code) && code > 0 ? code : null, name: String(rec.Name || t('crs.pick.name')), proj4: rec.Proj4, unit, local: null };
}

export function sameCoordinates(a, b) {
  if (!a || !b || a.unit !== b.unit) return false;
  try {
    const A = proj4.Proj(a.proj4), B = proj4.Proj(b.proj4);
    const pts = probes(A);
    return pts.every((p) => { const x = fwd(A, p), y = fwd(B, p); return Math.hypot(x[0] - y[0], x[1] - y[1]) < 1e-3; });
  } catch { return false; }
}
export { transformer };

/**
 * The system a model's coordinates are in, from what readGeoref found (`c` = its `crs`: name, code, and `record` = the
 * CadCraft_CRS set when the model carries one). The person's choice saved in the model wins over a code read from a name.
 * → { crs (state.crs shape), entry (catalog entry | undefined), source: 'model' | 'file' } | null
 */
export function modelSystem(c) {
  if (!c) return null;
  const own = fromRecord(c.record);
  if (own) { const entry = own.code ? byCode(own.code) || undefined : undefined; return { crs: own, entry, source: 'model' }; }
  if (c.code && catalogLoaded()) { const e = byCode(c.code); if (e) return { crs: crsFromEntry(e), entry: e, source: 'file' }; }
  return null;
}

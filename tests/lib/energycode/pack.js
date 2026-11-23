/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pack.js — an ENERGY CODE PACK: the numbers of one energy code as data (0.11 Track T24, T24.1). Host-free.
 *
 * The engine holds no code value. A pack (format `cadcraft-energy-code` v1) carries, for one code edition: the climate zones and how a place
 * finds its zone, the prescriptive table by zone, the mandatory minimums, the code's own tables of assembly U-factors, the definitions the checks
 * need as numbers, and what the performance path requires. Packs are MADE from the authority's documents by a script (the first:
 * tools/energy-ca/make-pack.mjs from the California Energy Commission's PDFs); nobody types one. Numbers, units and section numbers only:
 * never the code's text.
 *
 *   cleanPack(raw) → { ok, errors, pack }            refuses what it does not understand
 *   zoneOf(pack, postcode) → zone number | null       by postal code (the way California defines its zones)
 *   need(pack, row, zone) → number | true | false | null | undefined      undefined = the pack has no such row; null = no requirement there
 *   wallU(pack, { spacing, framing, cavity, continuous }) → { ok, u, column, table, page } | { ok: false, why }
 *   atticU(pack, { spacing, attic, continuous })          → the same
 *   floorU(pack, { crawl, spacing, framing, cavity, continuous }) → the same, from the raised-floor table over a vented crawl space (crawl true)
 *                                                           or the one for a floor with outside air under it (crawl false)   (T24.6)
 *   slabF(pack, { heated, r, edge }) → { ok, f (Btu/h·ft·°F per foot of slab edge), column, table, page } | { ok: false, why }
 *       edge = 'none' | 'h12' … 'h48' (horizontal, inches in from the edge) | 'v12' … 'v48' (vertical, inches down) | 'full'; r = the
 *       insulation's rated R-value, which must be a row the table prints (no rounding to a row; NA cells are refused)
 *       Lookups in the code's own tables, the way the code says to use them by hand: the row must be one the table prints, and continuous
 *       insulation counts as the largest printed column that is not more than what is installed. Nothing is interpolated.
 */
export const FORMAT = 'cadcraft-energy-code';
const fin = (x) => typeof x === 'number' && Number.isFinite(x);
const str = (x, max) => (typeof x === 'string' ? x.trim().slice(0, max) : '');

function cleanTable(t, key, n) {
  if (!t || typeof t !== 'object' || !t.spacing) return null;
  const out = { table: str(t.table, 60), page: str(t.page, 30), spacing: {} };
  for (const [sp, v] of Object.entries(t.spacing)) {
    if (!/^(12|16|24)$/.test(sp) || !Array.isArray(v?.continuous) || v.continuous.length !== n || !v.continuous.every(fin) || !Array.isArray(v.rows)) return null;
    const rows = [];
    for (const r of v.rows) {
      if (!fin(r?.[key]) || !Array.isArray(r.u) || r.u.length !== n || !r.u.every((x) => fin(x) && x > 0 && x < 2)) return null;
      rows.push({ [key]: r[key], framing: r.framing ? str(r.framing, 10) : null, dense: r.dense === true, u: r.u.slice() });
    }
    out.spacing[sp] = { continuous: v.continuous.slice(), rows };
  }
  return Object.keys(out.spacing).length ? out : null;
}
const SLAB_COLS = ['none', 'h12', 'h24', 'h36', 'h48', 'v12', 'v24', 'v36', 'v48', 'full'];
function cleanSlab(t) {
  if (!t || typeof t !== 'object' || !Array.isArray(t.columns) || t.columns.join() !== SLAB_COLS.join() || !Array.isArray(t.rows)) return null;
  const rows = [];
  for (const r of t.rows) {
    if (!fin(r?.r) || r.r < 0 || !Array.isArray(r.f) || r.f.length !== SLAB_COLS.length || !r.f.every((x) => x === null || (fin(x) && x > 0 && x < 3))) return null;
    rows.push({ r: r.r, f: r.f.slice() });
  }
  return rows.length ? { table: str(t.table, 60), page: str(t.page, 30), columns: SLAB_COLS.slice(), rows } : null;
}

export function cleanPack(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object' || raw.format !== FORMAT || raw.version !== 1) return { ok: false, errors: ['format'], pack: null };
  if (!/^[a-z0-9][a-z0-9._-]{1,79}$/.test(String(raw.id || ''))) errors.push('id');
  const z = raw.zones || {};
  const zips = {};
  if (z.by !== 'postcode' || !(z.count >= 1 && z.count <= 99) || !z.codes || typeof z.codes !== 'object') errors.push('zones');
  else for (const [k, v] of Object.entries(z.codes)) { if (!/^[A-Za-z0-9 -]{3,10}$/.test(k) || !Number.isInteger(v) || v < 1 || v > z.count) { errors.push('zones: ' + k); break; } zips[k] = v; }
  const rows = {};
  for (const [id, by] of Object.entries(raw.prescriptive?.rows || {})) {
    if (!/^[a-z0-9._]{2,60}$/.test(id) || !by || typeof by !== 'object') { errors.push('row ' + id); continue; }
    const one = {};
    for (let n = 1; n <= (z.count || 0); n++) { const v = by[String(n)]; if (!(v === null || v === true || v === false || fin(v))) { errors.push('row ' + id + ' zone ' + n); break; } one[n] = v; }
    rows[id] = one;
  }
  if (!Object.keys(rows).length) errors.push('prescriptive');
  const mandatory = {};
  for (const [id, m] of Object.entries(raw.mandatory || {})) { if (!fin(m?.value)) { errors.push('mandatory ' + id); continue; } mandatory[id] = { value: m.value, section: str(m.section, 40) }; }
  const src = raw.source || {};
  if (!str(src.name, 200) || !Array.isArray(src.documents) || !src.documents.length || !src.documents.every((d) => /^https:\/\//.test(String(d?.url || '')) && /^[0-9a-f]{64}$/.test(String(d?.sha256 || '')))) errors.push('source');
  const walls = raw.assemblies?.walls ? cleanTable(raw.assemblies.walls, 'cavity', 10) : null, attic = raw.assemblies?.attic ? cleanTable(raw.assemblies.attic, 'attic', 8) : null;
  if (raw.assemblies?.walls && !walls) errors.push('assemblies.walls');
  if (raw.assemblies?.attic && !attic) errors.push('assemblies.attic');
  const A = raw.assemblies || {}, more = {};
  for (const k of ['floor_crawl', 'floor_exposed']) if (A[k]) { more[k] = cleanTable(A[k], 'cavity', 8); if (!more[k]) errors.push('assemblies.' + k); else if (A[k].note) more[k].note = str(A[k].note, 400); }
  for (const k of ['slab_unheated', 'slab_heated']) if (A[k]) { more[k] = cleanSlab(A[k]); if (!more[k]) errors.push('assemblies.' + k); }
  const wf = raw.definitions?.west_facing;
  if (wf && !(fin(wf.from_excl) && fin(wf.to_incl))) errors.push('definitions.west_facing');
  if (errors.length) return { ok: false, errors, pack: null };
  return { ok: true, errors, pack: {
    format: FORMAT, version: 1, id: raw.id, name: str(raw.name, 160), edition: str(raw.edition, 60), in_force: str(raw.in_force, 12), scope: str(raw.scope, 200), units: raw.units === 'si' ? 'si' : 'ip',
    jurisdiction: { country: str(raw.jurisdiction?.country, 4), region: str(raw.jurisdiction?.region, 12), name: str(raw.jurisdiction?.name, 80) },
    source: { name: str(src.name, 200), checked: str(src.checked, 12), documents: src.documents.map((d) => ({ number: str(d.number, 40), title: str(d.title, 200), url: d.url, sha256: d.sha256 })) },
    review: { state: str(raw.review?.state, 20), note: str(raw.review?.note, 600) },
    zones: { by: 'postcode', count: z.count, codes: zips, names: z.names && typeof z.names === 'object' ? Object.fromEntries(Object.entries(z.names).filter(([k, v]) => /^\d+$/.test(k) && typeof v === 'string').map(([k, v]) => [k, v.slice(0, 60)])) : {}, source: str(z.source, 300) },
    prescriptive: { table: str(raw.prescriptive.table, 40), section: str(raw.prescriptive.section, 40), pages: Array.isArray(raw.prescriptive.pages) ? raw.prescriptive.pages.filter(fin) : [], rows },
    mandatory, assemblies: { walls, attic, ...more },
    definitions: { west_facing: wf ? { from_excl: wf.from_excl, to_incl: wf.to_incl, section: str(wf.section, 40) } : null },
    performance: raw.performance && typeof raw.performance === 'object' ? { section: str(raw.performance.section, 40), budgets: (raw.performance.budgets || []).map((b) => str(b, 80)).filter(Boolean).slice(0, 8), software: (raw.performance.software || []).map((s) => ({ name: str(s?.name, 80), approved: str(s?.approved, 12) })).filter((s) => s.name).slice(0, 12), list: /^https:\/\//.test(String(raw.performance.list || '')) ? String(raw.performance.list).slice(0, 300) : '', software_section: str(raw.performance.software_section, 60) } : null,
  } };
}

export function zoneOf(pack, postcode) {
  const k = String(postcode ?? '').trim().toUpperCase().replace(/^(\d{5})-\d{4}$/, '$1');
  return Object.prototype.hasOwnProperty.call(pack.zones.codes, k) ? pack.zones.codes[k] : null;
}
export function need(pack, row, zone) {
  const r = pack.prescriptive.rows[row];
  return r ? r[zone] : undefined;
}

function lookup(table, spacing, pick, continuous) {
  if (!table) return { ok: false, why: 'no-table' };
  const t = table.spacing[String(spacing)];
  if (!t) return { ok: false, why: 'spacing' };
  const row = t.rows.find(pick);
  if (!row) return { ok: false, why: 'row' };
  const c = Number(continuous) || 0;
  let col = 0;
  for (let i = 0; i < t.continuous.length; i++) if (t.continuous[i] <= c + 1e-9) col = i;
  return { ok: true, u: row.u[col], column: t.continuous[col], dense: row.dense, table: table.table, page: table.page };
}
export function wallU(pack, { spacing = 16, framing = null, cavity = 0, continuous = 0 } = {}) {
  const cav = Number(cavity) || 0;
  return lookup(pack.assemblies.walls, spacing, (r) => r.cavity === cav && (cav === 0 || r.framing === framing), continuous);
}
export function atticU(pack, { spacing = 24, attic = 0, continuous = 0 } = {}) {
  const a = Number(attic) || 0;
  return lookup(pack.assemblies.attic, spacing, (r) => r.attic === a, continuous);
}
export function floorU(pack, { crawl = true, spacing = 16, framing = null, cavity = 0, continuous = 0 } = {}) {
  const cav = Number(cavity) || 0, fr = framing ? String(framing).replace(/\s+/g, '') : null;
  return lookup(crawl ? pack.assemblies.floor_crawl : pack.assemblies.floor_exposed, spacing, (r) => r.cavity === cav && (cav === 0 || r.framing === fr), continuous);
}
export function slabF(pack, { heated = false, r = 0, edge = 'none' } = {}) {
  const t = heated ? pack.assemblies.slab_heated : pack.assemblies.slab_unheated;
  if (!t) return { ok: false, why: 'no-table' };
  const k = t.columns.indexOf(edge);
  if (k < 0) return { ok: false, why: 'edge' };
  const row = t.rows.find((x) => Math.abs(x.r - (Number(r) || 0)) < 1e-9);
  if (!row) return { ok: false, why: 'row' };
  if (row.f[k] === null) return { ok: false, why: 'na' };
  return { ok: true, f: row.f[k], column: edge, table: t.table, page: t.page };
}
/** The raised-floor rows a person can pick for a framing size: [{ cavity, framing }] as the table prints them. */
export function floorChoices(pack, crawl, spacing) {
  const t = (crawl ? pack.assemblies.floor_crawl : pack.assemblies.floor_exposed)?.spacing[String(spacing)];
  return t ? t.rows.map((r) => ({ cavity: r.cavity, framing: r.framing })) : [];
}
export const floorColumns = (pack, crawl, spacing) => (crawl ? pack.assemblies.floor_crawl : pack.assemblies.floor_exposed)?.spacing[String(spacing)]?.continuous.slice() || [];
/** The slab rows (rated R) the table prints for an edge kind, NA cells left out. */
export function slabChoices(pack, heated, edge) {
  const t = heated ? pack.assemblies.slab_heated : pack.assemblies.slab_unheated, k = t ? t.columns.indexOf(edge) : -1;
  return k < 0 ? [] : t.rows.filter((x) => x.f[k] !== null).map((x) => x.r);
}
/** The wall rows a person can pick for a framing size and spacing: [{ cavity, dense }] as the table prints them. */
export function wallChoices(pack, spacing, framing) {
  const t = pack.assemblies.walls?.spacing[String(spacing)];
  return t ? t.rows.filter((r) => r.cavity === 0 || r.framing === framing).map((r) => ({ cavity: r.cavity, dense: r.dense })) : [];
}
export const wallColumns = (pack, spacing) => pack.assemblies.walls?.spacing[String(spacing)]?.continuous.slice() || [];
export const atticChoices = (pack, spacing) => (pack.assemblies.attic?.spacing[String(spacing)]?.rows || []).map((r) => r.attic);

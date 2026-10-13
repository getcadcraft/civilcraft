/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gpkg.js — OGC GeoPackage feature tables read and written through sql.js (SQLite in WebAssembly; docs/GIS-SPEC.md §2).
 * No DOM. sql.js loads on the first call only (import map "sql.js" → assets/vendor/sql.js/current/sql-wasm.esm.js; the
 * wasm next to it is fetched by this module — or read from disk under Node — and handed over as wasmBinary).
 *
 *   await openGpkg(bytes) → { tables: [{ name, identifier, column, geomType, geom, srsId, z, count, srs }], read, close }
 *     every feature table in gpkg_contents (data_type 'features') with its gpkg_geometry_columns row; srs = { org, code,
 *     definition } from gpkg_spatial_ref_sys (srs_id −1 / 0 = undefined). Untrusted: the file must be SQLite with
 *     gpkg_contents; table and column names are only ever used quoted; counts are checked.
 *   await gp.read(tableName, { maxFeatures, tick }) → layer { name, geom, hasZ, fields, features, notes }
 *     standard GeoPackage binary geometry (magic "GP", version 0, flags: byte order, envelope 0–4, empty) + WKB incl. Z;
 *     a generic GEOMETRY table holding several kinds gives one layer per kind; extended (non-standard) geometry refused.
 *   await writeGpkg(groups, { srs }) → Uint8Array   one table per group ({ table, label, geom, hasZ, fields, features });
 *     srs = { id, org, code, name, definition } (the project's system: EPSG org + code, its WKT) or null → −1
 *     ("undefined Cartesian"); GeoPackage 1.4 (application_id GPKG, user_version 10400); POINT / MULTILINESTRING /
 *     MULTIPOLYGON (+ Z) columns; an envelope on every geometry; gpkg_contents extents.
 */

import { readWkb, writeWkb, bounds, geomKind } from './gis-geom.js';
import { t } from "./i18n.js";

export class GpkgError extends Error {}

let SQL = null;
export async function loadSql() {
  if (!SQL) {
    SQL = (async () => {
      const { default: init } = await import('sql.js');
      const url = new URL('./sql-wasm.wasm', import.meta.resolve('sql.js'));
      let wasmBinary;
      if (url.protocol === 'file:') { const fs = await import('node:fs/promises'); wasmBinary = await fs.readFile(url); }
      else {
        const r = await fetch(url);
        if (!r.ok) throw new GpkgError(t('gpkg.load', { status: r.status }));
        wasmBinary = await r.arrayBuffer();
      }
      return init({ wasmBinary });
    })().catch((e) => { SQL = null; throw e; });
  }
  return SQL;
}

const q = (id) => '"' + String(id).replace(/"/g, '""') + '"';
const WGS84_WKT = 'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AXIS["Latitude",NORTH],AXIS["Longitude",EAST],AUTHORITY["EPSG","4326"]]';

function rows(db, sql, params = []) {
  const st = db.prepare(sql);
  try { st.bind(params); const out = []; while (st.step()) out.push(st.getAsObject()); return out; } finally { st.free(); }
}

export async function openGpkg(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (b.length < 100 || new TextDecoder().decode(b.subarray(0, 15)) !== 'SQLite format 3') throw new GpkgError(t('gpkg.notsqlite'));   // i18n-ignore: SQLite file signature
  const S = await loadSql();
  let db;
  try { db = new S.Database(b); rows(db, 'SELECT count(*) AS n FROM sqlite_master'); } catch { db?.close(); throw new GpkgError(t('gpkg.damaged')); }   // i18n-ignore: SQL
  const close = () => { try { db.close(); } catch { /* closed */ } };
  let tables;
  try {
    const has = (t) => rows(db, "SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name = ?", [t]).length > 0;
    if (!has('gpkg_contents') || !has('gpkg_geometry_columns')) throw new GpkgError(t('gpkg.notgpkg'));
    const srs = new Map();
    if (has('gpkg_spatial_ref_sys')) for (const r of rows(db, 'SELECT srs_id, organization, organization_coordsys_id, definition FROM gpkg_spatial_ref_sys LIMIT 1000')) srs.set(Number(r.srs_id), { org: String(r.organization ?? ''), code: Number(r.organization_coordsys_id), definition: String(r.definition ?? '').slice(0, 20000) });
    const cols = new Map(rows(db, 'SELECT table_name, column_name, geometry_type_name, srs_id, z FROM gpkg_geometry_columns LIMIT 1000').map((r) => [String(r.table_name), r]));
    tables = [];
    for (const c of rows(db, "SELECT table_name, identifier, srs_id FROM gpkg_contents WHERE data_type = 'features' LIMIT 1000")) {
      const name = String(c.table_name), g = cols.get(name);
      if (!g || !has(name)) continue;
      let count = 0;
      try { count = Number(rows(db, 'SELECT count(*) AS n FROM ' + q(name))[0].n); } catch { continue; }   // i18n-ignore: SQL
      const srsId = Number(g.srs_id ?? c.srs_id);
      tables.push({ name, identifier: String(c.identifier || name).slice(0, 120), column: String(g.column_name), geomType: String(g.geometry_type_name || 'GEOMETRY').toUpperCase(), geom: geomKind(g.geometry_type_name), srsId, z: Number(g.z) || 0, count, srs: srsId > 0 ? srs.get(srsId) || null : null });
    }
  } catch (e) { close(); throw e instanceof GpkgError ? e : new GpkgError(t('gpkg.unreadable', { why: e.message })); }
  return { tables, close, read: (name, opts) => readTable(db, tables.find((t) => t.name === name), opts) };
}

const NUM = /INT|REAL|FLOAT|DOUBLE|NUMERIC|DECIMAL/i;
async function readTable(db, tb, { maxFeatures = 500000, tick = null } = {}) {
  if (!tb) throw new GpkgError(t('gpkg.notable'));
  const notes = [];
  const info = rows(db, 'PRAGMA table_info(' + q(tb.name) + ')');
  const fields = [];
  for (const c of info) {
    const n = String(c.name), ty = String(c.type || '').toUpperCase();
    if (n === tb.column || (c.pk && /INT/.test(ty))) continue;
    if (/BLOB/.test(ty)) continue;
    fields.push({ name: n.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 64) || 'field', col: n, type: /BOOL/.test(ty) ? 'bool' : /^DATE$/.test(ty) ? 'date' : NUM.test(ty) ? 'number' : 'text' });
  }
  const by = { pt: [], ln: [], pg: [] };
  let n = 0, bad = 0, ext = 0, multi = false;
  const st = db.prepare('SELECT ' + [q(tb.column), ...fields.map((f) => q(f.col))].join(', ') + ' FROM ' + q(tb.name));
  try {
    while (st.step()) {
      if (n >= maxFeatures) { notes.push(t('gpkg.max', { table: tb.identifier, n: maxFeatures })); break; }
      const r = st.get();
      const p = Object.create(null);
      fields.forEach((f, i) => {
        let v = r[i + 1];
        if (v instanceof Uint8Array) v = null;
        if (f.type === 'bool' && v !== null) v = !!v;
        else if (f.type === 'number' && v !== null) v = Number.isFinite(Number(v)) ? Number(v) : null;
        else if (v !== null && typeof v !== 'string') v = String(v);
        if (typeof v === 'string') v = v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ').slice(0, 10000);
        p[f.name] = v;
      });
      n++;
      const blob = r[0];
      // an empty / missing geometry stays a feature (null) in a table of one declared kind
      if (!(blob instanceof Uint8Array)) { if (tb.geom) by[tb.geom].push({ g: null, p }); continue; }
      let gs;
      try { const res = parseGpb(blob); if (res === 'ext') { ext++; continue; } gs = res.geoms; if (res.multipoint) multi = true; } catch { bad++; continue; }
      for (const g of gs) { if (g) by[g.t].push({ g, p }); else if (tb.geom) by[tb.geom].push({ g: null, p }); }
      if (tick && n % 10000 === 0) await tick(n);
    }
  } finally { st.free(); }
  if (bad) notes.push(t('gpkg.bad', { table: tb.identifier, n: bad }));
  if (ext) notes.push(t('gpkg.ext', { table: tb.identifier, n: ext }));
  if (multi) notes.push(t('gpkg.multi', { table: tb.identifier }));
  const kinds = Object.keys(by).filter((k) => by[k].length);
  return kinds.map((k) => ({ name: kinds.length > 1 ? t({ pt: 'gpkg.layer.pt', ln: 'gpkg.layer.ln', pg: 'gpkg.layer.pg' }[k], { table: tb.identifier }) : tb.identifier, geom: k, hasZ: tb.z > 0 || by[k].some((f) => hasZ(f.g)), fields: fields.map(({ name, type }) => ({ name, type })), features: by[k], notes }));
}
function hasZ(g) {
  if (g.t === 'pt') return g.c.length > 2;
  if (g.t === 'ln') return g.c.some((p) => p.some((x) => x.length > 2));
  return g.c.some((poly) => poly.some((r) => r.some((x) => x.length > 2)));
}

/** GeoPackage binary geometry → { geoms } | 'ext'. */
export function parseGpb(b) {
  if (b.length < 8 || b[0] !== 0x47 || b[1] !== 0x50) throw new GpkgError(t('gpkg.geom.not'));
  const flags = b[3];
  if (flags & 0x20) return 'ext';
  const env = (flags >> 1) & 7;
  if (env > 4) throw new GpkgError(t('gpkg.geom.env'));
  const size = [0, 32, 48, 48, 64][env];
  const empty = (flags >> 4) & 1;
  const start = 8 + size;
  if (start > b.length) throw new GpkgError(t('gpkg.geom.short'));
  if (empty && start >= b.length) return { geoms: [null] };
  const r = readWkb(b, start);
  return { geoms: empty ? [null] : r.geoms, multipoint: r.multipoint };
}

export function gpb(g, hasZ, srsId) {
  const w = writeWkb(g, hasZ), bx = bounds(g);
  const out = new Uint8Array(8 + 32 + w.length), dv = new DataView(out.buffer);
  out[0] = 0x47; out[1] = 0x50; out[2] = 0; out[3] = 0x01 | (1 << 1);   // little endian, xy envelope
  dv.setInt32(4, srsId, true);
  dv.setFloat64(8, bx.minX, true); dv.setFloat64(16, bx.maxX, true); dv.setFloat64(24, bx.minY, true); dv.setFloat64(32, bx.maxY, true);
  out.set(w, 40);
  return out;
}

export async function writeGpkg(groups, { srs = null } = {}) {
  const S = await loadSql();
  const db = new S.Database();
  try {
    db.run('PRAGMA application_id = 1196444487'); db.run('PRAGMA user_version = 10400');
    db.run(`CREATE TABLE gpkg_spatial_ref_sys (srs_name TEXT NOT NULL, srs_id INTEGER PRIMARY KEY, organization TEXT NOT NULL, organization_coordsys_id INTEGER NOT NULL, definition TEXT NOT NULL, description TEXT)`);
    db.run(`CREATE TABLE gpkg_contents (table_name TEXT NOT NULL PRIMARY KEY, data_type TEXT NOT NULL, identifier TEXT UNIQUE, description TEXT DEFAULT '', last_change DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), min_x DOUBLE, min_y DOUBLE, max_x DOUBLE, max_y DOUBLE, srs_id INTEGER, CONSTRAINT fk_gc_r_srs_id FOREIGN KEY (srs_id) REFERENCES gpkg_spatial_ref_sys(srs_id))`);
    db.run(`CREATE TABLE gpkg_geometry_columns (table_name TEXT NOT NULL, column_name TEXT NOT NULL, geometry_type_name TEXT NOT NULL, srs_id INTEGER NOT NULL, z TINYINT NOT NULL, m TINYINT NOT NULL, CONSTRAINT pk_geom_cols PRIMARY KEY (table_name, column_name), CONSTRAINT uk_gc_table_name UNIQUE (table_name), CONSTRAINT fk_gc_tn FOREIGN KEY (table_name) REFERENCES gpkg_contents(table_name), CONSTRAINT fk_gc_srs FOREIGN KEY (srs_id) REFERENCES gpkg_spatial_ref_sys (srs_id))`);
    const ins = 'INSERT INTO gpkg_spatial_ref_sys (srs_name, srs_id, organization, organization_coordsys_id, definition, description) VALUES (?, ?, ?, ?, ?, ?)';
    // i18n-ignore-start: gpkg_spatial_ref_sys rows written into the file (GeoPackage content)
    db.run(ins, ['Undefined cartesian SRS', -1, 'NONE', -1, 'undefined', 'undefined cartesian coordinate reference system']);
    db.run(ins, ['Undefined geographic SRS', 0, 'NONE', 0, 'undefined', 'undefined geographic coordinate reference system']);
    db.run(ins, ['WGS 84 geodetic', 4326, 'EPSG', 4326, WGS84_WKT, 'longitude/latitude coordinates in decimal degrees on the WGS 84 spheroid']);
    let srsId = -1;
    if (srs) {
      srsId = srs.id;
      if (srsId !== 4326) db.run(ins, [String(srs.name || 'Project system').slice(0, 200), srsId, srs.org || 'NONE', srs.code ?? srsId, srs.definition || 'undefined', 'the CivilCraft project’s coordinate system']);
    }
    // i18n-ignore-end
    const used = new Set();
    for (const g of groups) {
      const T = g.table;
      const type = { pt: 'POINT', ln: 'MULTILINESTRING', pg: 'MULTIPOLYGON' }[g.geom];
      const cols = [];
      const colNames = new Set(['fid', 'geom']);
      const fieldCols = g.fields.map((f) => { let c = String(f.name).replace(/[\u0000-\u001f\u007f]/g, '') || 'field', k = c, j = 2; while (colNames.has(k.toLowerCase())) k = c + '_' + j++; colNames.add(k.toLowerCase()); return { ...f, col: k }; });
      for (const f of fieldCols) cols.push(q(f.col) + ' ' + ({ number: 'REAL', bool: 'BOOLEAN', date: 'DATE', text: 'TEXT' }[f.type] || 'TEXT'));
      db.run('CREATE TABLE ' + q(T) + ' (fid INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, geom ' + type + (cols.length ? ', ' + cols.join(', ') : '') + ')');
      const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
      const st = db.prepare('INSERT INTO ' + q(T) + ' (geom' + fieldCols.map((f) => ', ' + q(f.col)).join('') + ') VALUES (?' + ', ?'.repeat(fieldCols.length) + ')');
      db.run('BEGIN');
      try {
        for (const f of g.features) {
          const geo = f.g && f.g.t === g.geom ? f.g : null;
          if (geo) bounds(geo, box);
          st.run([geo ? gpb(geo, g.hasZ, srsId) : null, ...fieldCols.map((fc) => { const v = f.p[fc.name]; return v === undefined || v === null ? null : fc.type === 'bool' ? (v ? 1 : 0) : fc.type === 'number' ? (Number.isFinite(v) ? v : null) : String(v); })]);
        }
      } finally { st.free(); }
      db.run('COMMIT');
      let ident = String(g.label || T).slice(0, 120), j = 2;
      while (used.has(ident)) ident = String(g.label || T).slice(0, 110) + ' ' + j++;
      used.add(ident);
      const ok = Number.isFinite(box.minX);
      // i18n-ignore: gpkg_contents row written into the file (GeoPackage content)
      db.run('INSERT INTO gpkg_contents (table_name, data_type, identifier, description, min_x, min_y, max_x, max_y, srs_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [T, 'features', ident, 'Exported from CivilCraft', ok ? box.minX : null, ok ? box.minY : null, ok ? box.maxX : null, ok ? box.maxY : null, srsId]);
      db.run('INSERT INTO gpkg_geometry_columns (table_name, column_name, geometry_type_name, srs_id, z, m) VALUES (?, ?, ?, ?, ?, ?)', [T, 'geom', type, srsId, g.hasZ ? 1 : 0, 0]);
    }
    return db.export();
  } finally { db.close(); }
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * shapefile.js — ESRI shapefiles (.shp + .shx + .dbf + .prj + .cpg) read and written (docs/GIS-SPEC.md §2). No DOM.
 *
 *   await readShapefile({ name, shp, dbf?, prj?, cpg? }, { maxFeatures, tick }) → layer
 *     layer = { name, geom: 'pt'|'ln'|'pg', hasZ, fields, features: [{ g, p }], prj: text | null, notes, shapeType }
 *     Types Point, MultiPoint, PolyLine, Polygon and their Z and M variants (M dropped; a multipoint becomes one feature
 *     per point); MultiPatch is refused. Polygon rings by the shapefile rule (clockwise outer, counter-clockwise holes).
 *     Every count and offset is checked against the file; a bad record stops the read with a plain message naming it.
 *     `tick` (optional, async) is awaited every 10,000 records so a page can show progress and cancel.
 *   shapefileSets(files) → [{ name, shp, shx, dbf, prj, cpg }]   group files by name (case-blind; .SHP and .shp alike)
 *   writeShapefile({ geom, hasZ, fields, features }) → { shp, shx, dbf, names }   names = the .dbf field names written
 *     (Point/PolyLine/Polygon, + Z when hasZ; polygons written outer clockwise, holes counter-clockwise; empty
 *     geometries as null shapes). The caller adds the .prj (crs.js prjFor) and a .cpg ("UTF-8").
 */

import { readDbf, writeDbf } from './dbf.js';
import { polygonsFromRings, orient, closeRing } from './gis-geom.js';
import { t } from "./i18n.js";

export class ShpError extends Error {}
const TYPE = { 0: 'null', 1: 'pt', 3: 'ln', 5: 'pg', 8: 'pt', 11: 'pt', 13: 'ln', 15: 'pg', 18: 'pt', 21: 'pt', 23: 'ln', 25: 'pg', 28: 'pt', 31: 'patch' };
const Z_TYPES = new Set([11, 13, 15, 18]);
const NODATA = -1e38;

export function shapefileSets(files) {
  const sets = new Map();
  for (const f of files) {
    const m = String(f.name).match(/^(.*)\.(shp|shx|dbf|prj|cpg)$/i);
    if (!m) continue;
    const base = m[1].replace(/^.*\//, ''), key = m[1].toLowerCase();
    let s = sets.get(key); if (!s) sets.set(key, (s = { name: base }));
    s[m[2].toLowerCase()] = f.data ?? f;
  }
  return [...sets.values()];
}

export async function readShapefile(set, { maxFeatures = 500000, tick = null } = {}) {
  const name = set.name || 'shapefile';
  if (!set.shp) throw new ShpError(t('shp.noshp', { name }));
  const b = set.shp instanceof Uint8Array ? set.shp : new Uint8Array(set.shp);
  const notes = [];
  if (b.length < 100) throw new ShpError(t('shp.short', { name }));
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (dv.getInt32(0, false) !== 9994 || dv.getInt32(28, true) !== 1000) throw new ShpError(t('shp.header', { name }));
  const declared = dv.getInt32(24, false) * 2;
  if (declared > b.length) notes.push(t('shp.declared', { name }));
  const end = Math.min(b.length, declared > 100 ? declared : b.length);
  let type = dv.getInt32(32, true);
  if (type === 31 || !(type in TYPE)) throw new ShpError(type === 31 ? t('shp.patch', { name }) : t('shp.type', { name, type }));
  const shapes = [];
  let p = 100, multi = false, mDropped = false, rec = 0, guessed = TYPE[type] === 'null' ? null : type;
  while (p + 8 <= end) {
    const len = dv.getInt32(p + 4, false) * 2;
    const s = p + 8, e = s + len;
    rec++;
    if (len < 4 || e > end) {
      if (e > end && len >= 4) { notes.push(t('shp.cut', { name, rec })); break; }
      throw new ShpError(t('shp.len', { name, rec }));
    }
    const st = dv.getInt32(s, true);
    if (st !== 0 && st !== type && type !== 0 && TYPE[st] !== TYPE[type]) throw new ShpError(t('shp.other', { name, rec }));
    if (st !== 0 && !guessed) guessed = st;
    if ([21, 23, 25, 28].includes(st) || (Z_TYPES.has(st))) mDropped ||= [21, 23, 25, 28].includes(st);
    shapes.push(readShape(dv, s, e, st, name, rec));
    if (st === 8 || st === 18 || st === 28) multi = true;
    p = e;
    if (shapes.length > maxFeatures) break;
    if (tick && rec % 10000 === 0) await tick(rec);
  }
  const st0 = guessed ?? type;
  const geom = TYPE[st0] === 'null' ? 'pt' : TYPE[st0];
  // attributes
  let fields = [], records = [];
  if (set.dbf) {
    const cpg = set.cpg ? (set.cpg instanceof Uint8Array ? new TextDecoder().decode(set.cpg) : String(set.cpg)) : null;
    const d = readDbf(set.dbf, { cpg, max: maxFeatures + 1 });
    fields = d.fields.map(({ name: n, type: ty }) => ({ name: n, type: ty }));
    records = d.records;
    notes.push(...d.notes.map((x) => t('shp.note', { name, note: x })));
    if (records.length !== shapes.length) notes.push(t('shp.dbf.count', { name, records: records.length, shapes: shapes.length }));
  } else notes.push(t('shp.nodbf', { name }));
  const features = [];
  for (let i = 0; i < shapes.length && features.length < maxFeatures; i++) {
    const p0 = records[i] || Object.create(null);
    const g = shapes[i];
    if (Array.isArray(g)) { for (const q of g) features.push({ g: q, p: p0 }); }
    else features.push({ g, p: p0 });
  }
  if (features.length >= maxFeatures && shapes.length > features.length) notes.push(t('shp.max', { name, n: maxFeatures }));
  if (multi) notes.push(t('shp.multi', { name }));
  if (mDropped) notes.push(t('shp.m', { name }));
  const prj = set.prj ? (set.prj instanceof Uint8Array ? new TextDecoder().decode(set.prj) : String(set.prj)).trim() || null : null;
  return { name, geom, hasZ: Z_TYPES.has(st0), fields, features, prj, notes, shapeType: st0 };
}

function readShape(dv, s, e, st, name, rec) {
  if (st === 0) return null;
  const bad = () => new ShpError(t('shp.bad', { name, rec }));
  const z = Z_TYPES.has(st);
  const f = (o) => dv.getFloat64(o, true);
  const zOk = (v) => Number.isFinite(v) && v > NODATA;
  if (st === 1 || st === 11 || st === 21) {
    if (s + 20 > e) throw bad();
    const x = f(s + 4), y = f(s + 12);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    if (z && s + 28 <= e && zOk(f(s + 20))) return { t: 'pt', c: [x, y, f(s + 20)] };
    return { t: 'pt', c: [x, y] };
  }
  if (st === 8 || st === 18 || st === 28) {
    if (s + 40 > e) throw bad();
    const n = dv.getInt32(s + 36, true);
    if (n < 0 || s + 40 + n * 16 > e) throw bad();
    const zs = s + 40 + n * 16 + 16;
    const hz = z && zs + n * 8 <= e;
    const out = [];
    for (let i = 0; i < n; i++) {
      const x = f(s + 40 + i * 16), y = f(s + 48 + i * 16);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const zz = hz ? f(zs + i * 8) : null;
      out.push({ t: 'pt', c: hz && zOk(zz) ? [x, y, zz] : [x, y] });
    }
    return out.length ? out : null;
  }
  // PolyLine / Polygon (+Z/M)
  if (s + 44 > e) throw bad();
  const np = dv.getInt32(s + 36, true), n = dv.getInt32(s + 40, true);
  if (np < 0 || n < 0 || np > n + 1 || s + 44 + np * 4 + n * 16 > e) throw bad();
  const ps = s + 44, pts = ps + np * 4, zs = pts + n * 16 + 16;
  const hz = z && zs + n * 8 <= e;
  const starts = [];
  for (let i = 0; i < np; i++) { const k = dv.getInt32(ps + i * 4, true); if (k < 0 || k > n || (i && k < starts[i - 1])) throw bad(); starts.push(k); }
  const parts = [];
  for (let i = 0; i < np; i++) {
    const a = starts[i], bEnd = i + 1 < np ? starts[i + 1] : n, part = [];
    for (let k = a; k < bEnd; k++) {
      const x = f(pts + k * 16), y = f(pts + k * 16 + 8);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const zz = hz ? f(zs + k * 8) : null;
      part.push(hz && zOk(zz) ? [x, y, zz] : [x, y]);
    }
    parts.push(part);
  }
  if (st === 3 || st === 13 || st === 23) { const c = parts.filter((q) => q.length >= 2); return c.length ? { t: 'ln', c } : null; }
  const rings = parts.map((r) => closeRing(r)).filter((r) => r.length >= 4);
  const polys = polygonsFromRings(rings);
  return polys.length ? { t: 'pg', c: polys } : null;
}

// ---------------------------------------------------------------- writing
export function writeShapefile({ geom, hasZ = false, fields = [], features = [] }) {
  const type = { pt: 1, ln: 3, pg: 5 }[geom] + (hasZ ? 10 : 0);
  const recs = [];
  const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity, z0: Infinity, z1: -Infinity };
  const grow = (p) => { if (p[0] < box.x0) box.x0 = p[0]; if (p[0] > box.x1) box.x1 = p[0]; if (p[1] < box.y0) box.y0 = p[1]; if (p[1] > box.y1) box.y1 = p[1]; const z = p.length > 2 ? p[2] : 0; if (z < box.z0) box.z0 = z; if (z > box.z1) box.z1 = z; };
  for (const ft of features) {
    let g = ft.g;
    if (!g || g.t !== geom) { recs.push(new Uint8Array(4)); continue; }   // null shape (type 0)
    if (g.t === 'pg') g = orient(g, false);
    if (g.t === 'pt') {
      grow(g.c);
      const r = new DataView(new ArrayBuffer(hasZ ? 36 : 20));
      r.setInt32(0, type, true); r.setFloat64(4, g.c[0], true); r.setFloat64(12, g.c[1], true);
      if (hasZ) { r.setFloat64(20, g.c.length > 2 ? g.c[2] : 0, true); r.setFloat64(28, -1e39, true); }   // M: no data
      recs.push(new Uint8Array(r.buffer));
      continue;
    }
    const parts = g.t === 'ln' ? g.c : g.c.flat();
    const n = parts.reduce((s, q) => s + q.length, 0);
    const size = 44 + parts.length * 4 + n * 16 + (hasZ ? 16 + n * 8 : 0);
    const r = new DataView(new ArrayBuffer(size));
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    r.setInt32(0, type, true); r.setInt32(36, parts.length, true); r.setInt32(40, n, true);
    let k = 0;
    const pts = 44 + parts.length * 4, zs = pts + n * 16 + 16;
    parts.forEach((q, i) => {
      r.setInt32(44 + i * 4, k, true);
      for (const pt of q) {
        grow(pt);
        r.setFloat64(pts + k * 16, pt[0], true); r.setFloat64(pts + k * 16 + 8, pt[1], true);
        bx0 = Math.min(bx0, pt[0]); bx1 = Math.max(bx1, pt[0]); by0 = Math.min(by0, pt[1]); by1 = Math.max(by1, pt[1]);
        if (hasZ) { const z = pt.length > 2 ? pt[2] : 0; r.setFloat64(zs + k * 8, z, true); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
        k++;
      }
    });
    r.setFloat64(4, bx0, true); r.setFloat64(12, by0, true); r.setFloat64(20, bx1, true); r.setFloat64(28, by1, true);
    if (hasZ) { r.setFloat64(pts + n * 16, z0, true); r.setFloat64(pts + n * 16 + 8, z1, true); }
    recs.push(new Uint8Array(r.buffer));
  }
  if (!Number.isFinite(box.x0)) Object.assign(box, { x0: 0, y0: 0, x1: 0, y1: 0, z0: 0, z1: 0 });
  const header = (len) => {
    const h = new DataView(new ArrayBuffer(100));
    h.setInt32(0, 9994, false); h.setInt32(24, len / 2, false); h.setInt32(28, 1000, true); h.setInt32(32, type, true);
    h.setFloat64(36, box.x0, true); h.setFloat64(44, box.y0, true); h.setFloat64(52, box.x1, true); h.setFloat64(60, box.y1, true);
    h.setFloat64(68, hasZ ? box.z0 : 0, true); h.setFloat64(76, hasZ ? box.z1 : 0, true);
    return new Uint8Array(h.buffer);
  };
  const shpLen = 100 + recs.reduce((s, r) => s + 8 + r.length, 0);
  const shp = new Uint8Array(shpLen), shx = new Uint8Array(100 + 8 * recs.length);
  shp.set(header(shpLen)); shx.set(header(shx.length));
  const sv = new DataView(shp.buffer), xv = new DataView(shx.buffer);
  let o = 100;
  recs.forEach((r, i) => {
    sv.setInt32(o, i + 1, false); sv.setInt32(o + 4, r.length / 2, false); shp.set(r, o + 8);
    xv.setInt32(100 + i * 8, o / 2, false); xv.setInt32(104 + i * 8, r.length / 2, false);
    o += 8 + r.length;
  });
  const { bytes: dbf, names } = writeDbf(fields, features.map((f) => f.p || {}));
  return { shp, shx, dbf, names };
}

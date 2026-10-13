/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geojson.js — GeoJSON (RFC 7946) read and written (docs/GIS-SPEC.md §2). No DOM.
 *
 *   readGeoJSON(text, name, { maxFeatures }) → { layers, crsCode, notes }
 *     A FeatureCollection, a Feature, a bare geometry or a GeometryCollection (flattened, said in notes). Features are
 *     split into one layer per kind (points, lines, polygons): layer = { name, geom, hasZ, fields, features, notes }.
 *     Coordinates are WGS 84 longitude/latitude (RFC 7946); the old (2008) `crs` member naming an EPSG code is honoured
 *     (crsCode; CRS84 / EPSG:4326 → null = WGS 84). Positions must be arrays of finite numbers; others drop that
 *     feature's geometry (counted). Properties: strings, numbers, true/false and null are kept as they are; objects and
 *     arrays as JSON text. Field types are found from the values (number, bool, date "YYYY-MM-DD", else text).
 *     A z value is height in metres (RFC 7946) — the caller converts it to project units.
 *   writeGeoJSON(groups, { toLonLat, zToMetres, name }) → text   one FeatureCollection; each feature's properties
 *     start with "kind" (the group's kind, e.g. "pipes"); groups [{ kind, geom, hasZ, fields, features }] in any
 *     coordinates, `toLonLat(x, y)` → [lon, lat]; positions rounded to 1e-9° (≈ 0.1 mm), polygons wound by the right-
 *     hand rule (outer counter-clockwise, holes clockwise), no `crs` member (RFC 7946 §4), z (when a group has it) in
 *     metres through zToMetres.
 */

import { orient, mapXY } from './gis-geom.js';
import { t } from "./i18n.js";

export class GeoJsonError extends Error {}

const isPos = (p) => Array.isArray(p) && p.length >= 2 && p.length <= 4 && Number.isFinite(p[0]) && Number.isFinite(p[1]) && (p.length < 3 || Number.isFinite(p[2]) || p[2] === null);
const pos = (p) => (p.length >= 3 && Number.isFinite(p[2]) ? [p[0], p[1], p[2]] : [p[0], p[1]]);

function crsFromMember(c, notes) {
  if (!c || typeof c !== 'object') return undefined;
  const name = String(c.properties?.name ?? (c.type === 'EPSG' ? 'EPSG:' + c.properties?.code : '') ?? '');
  if (/CRS84$|CRS:84$/i.test(name)) return null;
  const m = name.match(/EPSG:{1,2}(?:[\d.]*:)?(\d{3,6})$/i);
  if (m) { const code = Number(m[1]); return code === 4326 ? null : code; }
  notes.push(t('geojson.crs.member', { crs: name.slice(0, 60) }));
  return undefined;
}

export function readGeoJSON(text, name = 'GeoJSON', { maxFeatures = 500000 } = {}) {
  let obj;
  try { obj = typeof text === 'string' ? JSON.parse(text.replace(/^﻿/, '')) : text; } catch { throw new GeoJsonError(t('geojson.json', { name })); }
  if (!obj || typeof obj !== 'object') throw new GeoJsonError(t('geojson.not', { name }));
  const notes = [];
  let crsCode = crsFromMember(obj.crs, notes);
  if (crsCode === undefined) crsCode = null;
  let feats;
  if (obj.type === 'FeatureCollection') { if (!Array.isArray(obj.features)) throw new GeoJsonError(t('geojson.nolist', { name })); feats = obj.features; }
  else if (obj.type === 'Feature') feats = [obj];
  else if (typeof obj.type === 'string' && (obj.coordinates || obj.geometries)) feats = [{ type: 'Feature', geometry: obj, properties: null }];
  else throw new GeoJsonError(t('geojson.none', { name }));
  const by = { pt: [], ln: [], pg: [] };
  let bad = 0, flattened = false, split = false, empty = 0, n = 0;
  const geoms = (g, depth = 0) => {
    if (!g || typeof g !== 'object') return [null];
    const c = g.coordinates;
    switch (g.type) {
      case 'Point': return isPos(c) ? [{ t: 'pt', c: pos(c) }] : (bad++, [null]);
      case 'MultiPoint': if (!Array.isArray(c)) return (bad++, [null]); split = true; return c.filter(isPos).map((p) => ({ t: 'pt', c: pos(p) }));
      case 'LineString': return Array.isArray(c) && c.length >= 2 && c.every(isPos) ? [{ t: 'ln', c: [c.map(pos)] }] : (bad++, [null]);
      case 'MultiLineString': { if (!Array.isArray(c)) return (bad++, [null]); const parts = c.filter((l) => Array.isArray(l) && l.length >= 2 && l.every(isPos)).map((l) => l.map(pos)); return parts.length ? [{ t: 'ln', c: parts }] : (c.length ? bad++ : empty++, [null]); }
      case 'Polygon': { const r = rings(c); return r ? [{ t: 'pg', c: [r] }] : (bad++, [null]); }
      case 'MultiPolygon': { if (!Array.isArray(c)) return (bad++, [null]); const polys = c.map(rings).filter(Boolean); return polys.length ? [{ t: 'pg', c: polys }] : (c.length ? bad++ : empty++, [null]); }
      case 'GeometryCollection': if (depth > 4 || !Array.isArray(g.geometries)) return (bad++, [null]); flattened = true; return g.geometries.flatMap((x) => geoms(x, depth + 1));
      default: bad++; return [null];
    }
  };
  const rings = (c) => {
    if (!Array.isArray(c) || !c.length) return null;
    const out = [];
    for (const r of c) {
      if (!Array.isArray(r) || r.length < 4 || !r.every(isPos)) { if (!out.length) return null; continue; }
      const q = r.map(pos);
      if (q[0][0] !== q[q.length - 1][0] || q[0][1] !== q[q.length - 1][1]) q.push(q[0].slice());
      out.push(q);
    }
    return out.length ? out : null;
  };
  for (const f of feats) {
    if (n >= maxFeatures) { notes.push(t('geojson.max', { name, n: maxFeatures })); break; }
    if (!f || typeof f !== 'object') { bad++; continue; }
    const props = Object.create(null);
    if (f.properties && typeof f.properties === 'object' && !Array.isArray(f.properties)) {
      for (const k of Object.keys(f.properties).slice(0, 500)) {
        const v = f.properties[k], key = String(k).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 64);
        if (!key) continue;
        props[key] = v === null || typeof v === 'number' || typeof v === 'boolean' ? (typeof v === 'number' && !Number.isFinite(v) ? null : v) : typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ').slice(0, 10000) : JSON.stringify(v).slice(0, 10000);
      }
    }
    const gs = f.geometry === null || f.geometry === undefined ? (empty++, []) : geoms(f.geometry);
    for (const g of gs) { if (g) { by[g.t].push({ g, p: props }); n++; } }
  }
  if (bad) notes.push(t('geojson.bad', { name, n: bad }));
  if (empty) notes.push(t('geojson.empty', { name, n: empty }));
  if (flattened) notes.push(t('geojson.flat', { name }));
  if (split) notes.push(t('geojson.multi', { name }));
  const kinds = Object.keys(by).filter((k) => by[k].length);
  const layers = kinds.map((k) => {
    const features = by[k];
    return { name: kinds.length > 1 ? t({ pt: 'geojson.layer.pt', ln: 'geojson.layer.ln', pg: 'geojson.layer.pg' }[k], { name }) : name, geom: k, hasZ: features.some((f) => hasZ(f.g)), fields: fieldsOf(features), features, notes: [] };
  });
  return { layers, crsCode, notes };
}

function hasZ(g) {
  if (g.t === 'pt') return g.c.length > 2;
  if (g.t === 'ln') return g.c.some((p) => p.some((q) => q.length > 2));
  return g.c.some((poly) => poly.some((r) => r.some((q) => q.length > 2)));
}

/** Field list from the values: number, bool, date (YYYY-MM-DD) or text; in first-seen order. */
export function fieldsOf(features) {
  const order = [], types = new Map();
  for (const f of features) {
    for (const k of Object.keys(f.p)) {
      if (!types.has(k)) { types.set(k, null); order.push(k); }
      const v = f.p[k];
      if (v === null || v === undefined || v === '') continue;
      const t = typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'bool' : /^\d{4}-\d{2}-\d{2}$/.test(v) ? 'date' : 'text';
      const was = types.get(k);
      types.set(k, was === null || was === t ? t : 'text');
    }
  }
  return order.map((k) => ({ name: k, type: types.get(k) || 'text' }));
}

const r9 = (v) => Math.round(v * 1e9) / 1e9;
const r4 = (v) => Math.round(v * 1e4) / 1e4;

export function writeGeoJSON(groups, { toLonLat, zToMetres = (z) => z, name = null } = {}) {
  const features = [];
  for (const gr of groups) {
    for (const f of gr.features) {
      if (!f.g) { const properties = Object.create(null); properties.kind = gr.kind; for (const fd of gr.fields) { const v = f.p[fd.name]; properties[fd.name === 'kind' ? 'kind_' : fd.name] = v === undefined ? null : v; } features.push({ type: 'Feature', properties, geometry: null }); continue; }   // RFC 7946 §3.2: an unlocated feature
      let g = mapXY(f.g, toLonLat);
      if (g.t === 'pg') g = orient(g, true);
      const P = (p) => (gr.hasZ && p.length > 2 ? [r9(p[0]), r9(p[1]), r4(zToMetres(p[2]))] : [r9(p[0]), r9(p[1])]);
      const geometry = g.t === 'pt' ? { type: 'Point', coordinates: P(g.c) }
        : g.t === 'ln' ? (g.c.length === 1 ? { type: 'LineString', coordinates: g.c[0].map(P) } : { type: 'MultiLineString', coordinates: g.c.map((l) => l.map(P)) })
          : g.c.length === 1 ? { type: 'Polygon', coordinates: g.c[0].map((r) => r.map(P)) } : { type: 'MultiPolygon', coordinates: g.c.map((poly) => poly.map((r) => r.map(P))) };
      const properties = Object.create(null);   // a field may be called "__proto__"
      properties.kind = gr.kind;
      for (const fd of gr.fields) { const v = f.p[fd.name]; properties[fd.name === 'kind' ? 'kind_' : fd.name] = v === undefined ? null : v; }
      features.push({ type: 'Feature', properties, geometry });
    }
  }
  const out = { type: 'FeatureCollection' };
  if (name) out.name = name;
  out.features = features;
  return JSON.stringify(out);
}

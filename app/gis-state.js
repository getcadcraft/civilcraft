/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-state.js — the GIS layers' part of the CivilCraft project file (docs/GIS-SPEC.md §2). No DOM, imports only i18n.js: project.js
 * loads it at start (the project file format), while everything else GIS loads on first use (gis-ui.js).
 *
 *   readGisState(gis, gisFeatures, notes) → { gis, features }  state.gis + the features Map, from a project file
 *     (untrusted: layer ids /^g\d+$/, kinds, field names and types, colours, geometry shapes and finite numbers checked;
 *     sizes capped — 200 layers, 2 million features, 20 million vertices; "__proto__" is a plain field name)
 *   gisFeaturesJSON(map) → { id: [[geometry, props], …] }
 *   LAYER_TOKENS — the colours a layer can take (plan view tokens) · MAX_LAYERS · clean(text, max)
 */

import { t } from "./i18n.js";

export const LAYER_TOKENS = ['blue', 'orange', 'magenta', 'cyan', 'ochre', 'green', 'red'];
export const MAX_LAYERS = 200;
export const clean = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const MAX_FILE_FEATURES = 2e6, MAX_VERTS = 2e7;

export function gisFeaturesJSON(map) {
  const out = {};
  for (const [id, fs] of map) out[id] = fs.map((f) => [f.g, f.p]);
  return out;
}

/** Read state.gis + gisFeatures from a project file (both untrusted): shapes checked, sizes capped, bad parts dropped. */
export function readGisState(gis, gisFeatures, notes = []) {
  const out = { layers: [], maps: [] }, features = new Map();
  if (gis == null) return { gis: out, features };
  if (typeof gis !== 'object') { notes.push(t('gstate.unreadable')); return { gis: out, features }; }
  let budget = MAX_VERTS, total = 0, dropped = 0;
  const pos = (p) => Array.isArray(p) && (p.length === 2 || p.length === 3) && p.every(fin) && Math.abs(p[0]) < 1e10 && Math.abs(p[1]) < 1e10;
  const P = (p) => { budget--; return p.length === 3 ? [p[0], p[1], p[2]] : [p[0], p[1]]; };
  const geom = (g, kind) => {
    if (g === null) return null;
    if (!g || typeof g !== 'object' || g.t !== kind || !Array.isArray(g.c)) return undefined;
    if (kind === 'pt') return pos(g.c) ? { t: 'pt', c: P(g.c) } : undefined;
    if (kind === 'ln') { const parts = g.c.filter((q) => Array.isArray(q) && q.length >= 2 && q.length <= budget && q.every(pos)).map((q) => q.map(P)); return parts.length ? { t: 'ln', c: parts } : undefined; }
    const polys = g.c.filter((poly) => Array.isArray(poly) && poly.length >= 1).map((poly) => poly.filter((r) => Array.isArray(r) && r.length >= 4 && r.length <= budget && r.every(pos)).map((r) => r.map(P))).filter((poly) => poly.length);
    return polys.length ? { t: 'pg', c: polys } : undefined;
  };
  const src = gisFeatures && typeof gisFeatures === 'object' ? gisFeatures : {};
  const seen = new Set();
  for (const l of Array.isArray(gis.layers) ? gis.layers.slice(0, MAX_LAYERS) : []) {
    if (!l || typeof l !== 'object' || !/^g\d{1,9}$/.test(String(l.id)) || seen.has(l.id) || !['pt', 'ln', 'pg'].includes(l.geom)) { dropped++; continue; }
    seen.add(l.id);
    const fieldNames = new Set();
    const fields = (Array.isArray(l.fields) ? l.fields.slice(0, 500) : []).map((f) => ({ name: clean(f?.name, 64), type: ['text', 'number', 'date', 'bool'].includes(f?.type) ? f.type : 'text' })).filter((f) => f.name && !fieldNames.has(f.name) && fieldNames.add(f.name));
    const layer = { id: l.id, name: clean(l.name, 120) || t('layers.default'), geom: l.geom, hasZ: l.hasZ === true, fields, visible: l.visible !== false, color: LAYER_TOKENS.includes(l.color) ? l.color : 'blue', source: { file: clean(l.source?.file, 200), format: clean(l.source?.format, 40), crs: l.source?.crs ? clean(l.source.crs, 200) : null } };
    if (l.label && typeof l.label === 'object' && fieldNames.has(clean(l.label.field, 64))) layer.label = { field: clean(l.label.field, 64) };   // 0.4 V7: label field
    const rows = Object.prototype.hasOwnProperty.call(src, l.id) && Array.isArray(src[l.id]) ? src[l.id] : [];
    const fs = [];
    let bad = 0;
    for (const r of rows) {
      if (total >= MAX_FILE_FEATURES || budget <= 0) { bad++; continue; }
      if (!Array.isArray(r) || r.length !== 2) { bad++; continue; }
      const g = geom(r[0], l.geom);
      if (g === undefined) { bad++; continue; }
      const p = Object.create(null);
      if (r[1] && typeof r[1] === 'object' && !Array.isArray(r[1])) for (const f of fields) { const v = r[1][f.name]; if (!Object.prototype.hasOwnProperty.call(r[1], f.name)) continue; p[f.name] = v === null || (typeof v === 'number' && Number.isFinite(v)) || typeof v === 'boolean' ? v : typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ').slice(0, 10000) : null; }
      fs.push({ g, p }); total++;
    }
    if (bad) notes.push(t('gstate.bad.features', { n: bad, layer: layer.name }));
    out.layers.push(layer);
    features.set(l.id, fs);
  }
  if (dropped) notes.push(t('gstate.bad.layers', { n: dropped }));
  // map layers belong to builder C (gis-map-ui.js / basemap.js validate what they use); here only their shape:
  // plain objects of strings, finite numbers and true/false, at most 100
  if (Array.isArray(gis.maps)) {
    for (const m of gis.maps.slice(0, 100)) {
      if (!m || typeof m !== 'object' || Array.isArray(m)) continue;
      const o = {};
      for (const [k, v] of Object.entries(m).slice(0, 50)) {
        if (k === '__proto__' || k.length > 40) continue;
        if (typeof v === 'string') o[k] = v.length > 40e6 ? '' : v; else if (typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v)) || v === null) o[k] = v;
      }
      out.maps.push(o);
    }
  }
  return { gis: out, features };
}

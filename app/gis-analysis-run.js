/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-analysis-run.js — CivilCraft's side of the GIS analysis tools (0.9 SU.1080): the engine (gis-analysis.js, gis-poly.js — copies
 * of lib/gis/) run on the project's own GIS layers. No DOM; the Node test drives it and gis-analysis-ui.js (the panel) calls it.
 * Every tool that makes something adds ONE new layer in ONE undo step and never changes the layers it read.
 *
 *   engineLayer(project, id) → { name, geom, fields, features }       the project's layer in the engine's shape (no copies of features)
 *   buffer(project, id, { dist, field, dissolve, quarter, name })      → { ok, id, notes } | { ok: false, error }
 *   overlay(project, aId, bId, op, { name })                           op intersect | union | erase
 *   dissolve(project, id, field, { name }) · join(project, targetId, sourceId, opts) · select(project, id, text)
 *   fromSelection(project, id, indices, { name })                      the selected features as a new layer
 *   calcGeometry(project, id)                                          AREA / PERIMETER / LENGTH / X, Y fields written into the layer (one undo step)
 *   stats(project, id, field, by) · measureSelection(project, id, indices)
 *   describe(error) → a sentence (language file keys gisa.err.*)
 */

import { addLayers, layerOf, featuresOf, gisOf } from './gis-layers.js';
import * as A from './gis-analysis.js';
import { t } from './i18n.js';

export function engineLayer(project, id) {
  const l = layerOf(project, id);
  if (!l) return null;
  return { name: l.name, geom: l.geom, fields: l.fields, features: featuresOf(project, id) };
}

function describe(e) {
  if (!e) return '';
  const key = 'gisa.err.' + e.code;
  return t(key, { name: e.name ?? '', pos: e.pos ?? 0, which: e.which ?? '' });
}
export { describe };

function put(project, res, name, label) {
  if (res.error) return { ok: false, error: res.error };
  if (res.features.length === 0) return { ok: false, error: { code: 'nothing' }, notes: res.notes };
  const src = res.source;
  const ids = addLayers(project, [{ name, geom: res.geom, hasZ: false, fields: res.fields, features: res.features, source: { file: '', format: t('gisa.source'), crs: null } }], { label });
  return ids.length ? { ok: true, id: ids[0], notes: res.notes, count: res.features.length } : { ok: false, error: { code: 'full' } };
}

const pair = (project, aId, bId) => { const a = engineLayer(project, aId), b = engineLayer(project, bId); return a && b ? [a, b] : null; };

export function buffer(project, id, { dist = 0, field = null, dissolve = false, quarter = 8, name = '' } = {}) {
  const l = engineLayer(project, id);
  if (!l) return { ok: false, error: { code: 'nolayer' } };
  const res = A.bufferLayer(l, dist, { quarter, dissolve, field });
  const nm = name || t('gisa.name.buffer', { layer: l.name, dist: field ? field : String(dist) });
  return put(project, res, nm, t('gisa.undo.buffer', { layer: l.name }));
}
export function overlay(project, aId, bId, op, { name = '' } = {}) {
  const p = pair(project, aId, bId);
  if (!p) return { ok: false, error: { code: 'nolayer' } };
  const res = A.overlay(p[0], p[1], op);
  const nm = name || t('gisa.name.' + op, { a: p[0].name, b: p[1].name });
  return put(project, res, nm, t('gisa.undo.' + op, { a: p[0].name, b: p[1].name }));
}
export function dissolve(project, id, field = null, { name = '' } = {}) {
  const l = engineLayer(project, id);
  if (!l) return { ok: false, error: { code: 'nolayer' } };
  const res = A.dissolve(l, field);
  return put(project, res, name || t('gisa.name.dissolve', { layer: l.name }), t('gisa.undo.dissolve', { layer: l.name }));
}
export function join(project, targetId, sourceId, opts = {}) {
  const p = pair(project, targetId, sourceId);
  if (!p) return { ok: false, error: { code: 'nolayer' } };
  const res = A.spatialJoin(p[0], p[1], opts);
  return put(project, res, opts.name || t('gisa.name.join', { a: p[0].name, b: p[1].name }), t('gisa.undo.join', { a: p[0].name, b: p[1].name }));
}
export function select(project, id, text) {
  const l = engineLayer(project, id);
  if (!l) return { ok: false, error: { code: 'nolayer' } };
  const r = A.selectWhere(l, text);
  return r.error ? { ok: false, error: r.error } : { ok: true, indices: r.indices, total: l.features.length };
}
export function fromSelection(project, id, indices, { name = '' } = {}) {
  const l = engineLayer(project, id);
  if (!l) return { ok: false, error: { code: 'nolayer' } };
  const res = A.subset(l, indices);
  return put(project, res, name || t('gisa.name.selection', { layer: l.name }), t('gisa.undo.selection', { layer: l.name }));
}
export function stats(project, id, field, by) {
  const l = engineLayer(project, id);
  if (!l) return { error: { code: 'nolayer' } };
  return A.statistics(l, field || null, by || null);
}
export function measureSelection(project, id, indices) {
  const l = engineLayer(project, id);
  if (!l) return null;
  let area = 0, perimeter = 0, length = 0;
  for (const i of indices) { const m = A.measureFeature(l.features[i]?.g); area += m.area || 0; perimeter += m.perimeter || 0; length += m.length || 0; }
  return { count: indices.length, geom: l.geom, area, perimeter, length };
}
/** Writes AREA / PERIMETER (polygons), LENGTH (lines) or X, Y (points) into the layer as number fields — one undo step. */
export function calcGeometry(project, id) {
  const l = layerOf(project, id), eng = engineLayer(project, id);
  if (!l || !eng) return { ok: false, error: { code: 'nolayer' } };
  const res = A.addMeasure(eng);
  const added = res.fields.slice(eng.fields.length);
  const ok = project.editGis(t('gisa.undo.calc', { layer: l.name }), (map, s) => {
    const x = s.gis.layers.find((q) => q.id === id);
    x.fields = res.fields.map((f) => ({ name: f.name, type: f.type }));
    map.set(id, res.features);
    return map;
  });
  return ok ? { ok: true, fields: added.map((f) => f.name) } : { ok: false, error: { code: 'full' } };
}
export { gisOf };

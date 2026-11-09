/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-table-run.js — CivilCraft's side of the attribute table (0.9 SU.1080 round 2): gis-table.js (a copy of lib/gis/) run on the
 * project's GIS layers. No DOM; the Node test drives it and gis-table-ui.js (the panel) calls it. Every change is ONE undo step
 * (project.editGis) that replaces the layer's feature array and keeps the geometry objects.
 *
 *   editCell(project, id, i, field, raw)        → { ok } | { ok: false, error: { code: 'nofield'|'norow'|'type', type } }
 *   addField(project, id, name, type)           → { ok, name } | { ok: false, error: { code } }
 *   renameField(project, id, from, to) · removeField(project, id, name)
 *   calc(project, id, target, expression, { indices, create: { name, type } }) → { ok, changed, nulls } | { ok: false, error }
 *   csv(project, id, indices)                   → text
 *   describe(error) → a sentence (language file keys gist.err.*)
 * Fields that other settings name follow a rename (the label field, the symbology's field and size field) and are dropped with a removed field.
 */

import { layerOf, featuresOf } from './gis-layers.js';
import { cleanSymbology } from './gis-symbology.js';
import * as T from './gis-table.js';
import { t } from './i18n.js';

const eng = (project, id) => { const l = layerOf(project, id); return l ? { name: l.name, geom: l.geom, fields: l.fields, features: featuresOf(project, id) } : null; };
export const describe = (e) => (e ? t('gist.err.' + (e.code || 'syntax'), { name: e.name ?? '', pos: e.pos ?? 0, type: e.type ?? '' }) : '');

function apply(project, id, label, fields, features, fix = null) {
  return project.editGis(label, (map, s) => {
    const x = s.gis.layers.find((q) => q.id === id);
    if (fields) x.fields = fields.map((f) => ({ name: f.name, type: f.type }));
    fix?.(x);
    map.set(id, features);
    return map;
  });
}

export function editCell(project, id, i, field, raw) {
  const L = eng(project, id);
  if (!L) return { ok: false, error: { code: 'nolayer' } };
  const f = L.fields.find((x) => x.name === field);
  if (!f) return { ok: false, error: { code: 'nofield', name: field } };
  if (!L.features[i]) return { ok: false, error: { code: 'norow' } };
  const c = T.coerce(raw, f.type);
  if (!c.ok) return { ok: false, error: { code: 'type', type: f.type } };
  const old = L.features[i].p?.[field];
  if (c.value === old || (c.value === null && (old === null || old === undefined || old === ''))) return { ok: true, same: true };
  return apply(project, id, t('gist.undo.cell', { layer: L.name, field }), null, T.setCell(L.features, i, field, c.value)) ? { ok: true } : { ok: false, error: { code: 'full' } };
}
export function addField(project, id, name, type) {
  const L = eng(project, id);
  if (!L) return { ok: false, error: { code: 'nolayer' } };
  const r = T.addField(L, name, type);
  if (r.error) return { ok: false, error: { code: r.error } };
  apply(project, id, t('gist.undo.add', { layer: L.name, field: r.name }), r.fields, r.features);
  return { ok: true, name: r.name };
}
export function renameField(project, id, from, to) {
  const L = eng(project, id);
  if (!L) return { ok: false, error: { code: 'nolayer' } };
  const r = T.renameField(L, from, to);
  if (r.error) return { ok: false, error: { code: r.error } };
  apply(project, id, t('gist.undo.rename', { layer: L.name, from, to: r.name }), r.fields, r.features, (x) => {
    if (x.label?.field === from) x.label = { field: r.name };
    if (x.symbology) { const s = { ...x.symbology }; if (s.field === from) s.field = r.name; if (s.sizeField === from) s.sizeField = r.name; x.symbology = s; }
  });
  return { ok: true, name: r.name };
}
export function removeField(project, id, name) {
  const L = eng(project, id);
  if (!L) return { ok: false, error: { code: 'nolayer' } };
  const r = T.removeField(L, name);
  if (r.error) return { ok: false, error: { code: r.error } };
  apply(project, id, t('gist.undo.remove', { layer: L.name, field: name }), r.fields, r.features, (x) => {
    if (x.label?.field === name) delete x.label;
    if (x.symbology) { const s = cleanSymbology(x.symbology, r.fields); if (s) x.symbology = s; else delete x.symbology; }
  });
  return { ok: true };
}
export function calc(project, id, target, expression, { indices = null, create = null } = {}) {
  let L = eng(project, id);
  if (!L) return { ok: false, error: { code: 'nolayer' } };
  let fields = null;
  if (create) {
    const a = T.addField(L, create.name, create.type);
    if (a.error) return { ok: false, error: { code: a.error } };
    L = { ...L, fields: a.fields, features: a.features };
    fields = a.fields; target = a.name;
  }
  const r = T.calculate(L, target, expression, indices);
  if (r.error) return { ok: false, error: r.error };
  apply(project, id, t('gist.undo.calc', { layer: L.name, field: target }), fields, r.features);
  return { ok: true, changed: r.changed, nulls: r.nulls, target };
}
export function csv(project, id, indices = null) {
  const L = eng(project, id);
  return L ? T.toCsv(L, indices) : '';
}
export { eng as tableLayer };

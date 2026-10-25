/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the English source of cc-acis' messages; tools/acis/sync.mjs copies the keys into each app's lang files. */
/**
 * messages.js — every sentence cc-acis says to a person, keys `ccacis.*` (docs/LANG.md § Shared libraries).
 *
 *   msg('ccacis.nd.surface', { n: 2, what: 'torus-surface' })   → "2 faces on torus-surface: a surface not drawn yet"
 *
 * cc-acis runs on pages, in workers and in Node, so it loads no language file of its own: msg() asks the page's catalog
 * through globalThis.ccI18n (set by the app's i18n.js) when it has the key, else it uses the English below. Fills are
 * {name}. Imports nothing. After changing this table: node tools/acis/sync.mjs (copies the files and the words).
 * `what` is always an ACIS record name (torus-surface, intcurve-curve …): the same in every language.
 */

export const MESSAGES = {
  // why a solid's data could not be read at all
  'ccacis.why.no_data': 'there is no ACIS data',
  'ccacis.why.not_acis': 'it is not ACIS data',
  'ccacis.why.too_big': 'it is larger than CadCraft reads (64 MB)',
  'ccacis.why.cut_off': 'it is cut off',
  'ccacis.why.unknown_data': 'it holds data CadCraft does not read',
  'ccacis.why.too_many_records': 'it has more than 2 million records',
  'ccacis.why.too_many_fields': 'one of its records is too long',
  'ccacis.why.too_deep': 'its data is nested too deeply',
  // the report: "Not drawn yet" lines (each one starts with a count)
  'ccacis.not_drawn': 'Not drawn yet (3D solids): {list}.',
  'ccacis.nd.solid': '{n} solids whose ACIS data could not be read ({why})',
  'ccacis.nd.surface': '{n} faces on {what}, a surface not drawn yet',
  'ccacis.nd.curve': '{n} faces edged by {what}, a curve not drawn yet',
  'ccacis.nd.off_surface': '{n} faces on {what} whose edges are not on it',
  'ccacis.nd.off_curve': '{n} faces with an edge off its {what}',
  'ccacis.nd.layout': '{n} faces on {what} that could not be laid out',
  'ccacis.nd.loop_open': '{n} faces whose edges do not close',
  'ccacis.nd.cut_off': '{n} faces with a missing {what} (cut off or damaged data)',
  'ccacis.nd.too_many': '{n} faces past the limit of 2 million triangles',
  'ccacis.nd.wire_body': '{n} bodies with no faces',
  'ccacis.note.history': '{n} solids carry a history of earlier shapes; only the shape they have now is drawn.',
  'ccacis.note.read': '{n} 3D solids drawn from their ACIS data ({faces} faces); they show as they are and cannot be edited.',
  // the apps (CadCraft's 3D tab and Save, ModelCraft's import)
  'ccacis.app.kept': '{n} 3D solids (ACIS) in this drawing: the 3D tab shows them as they are (they cannot be edited), and saving as DWG keeps them unchanged.',
  'ccacis.app.blocks': '{n} 3D solids inside blocks are not shown yet.',
  'ccacis.app.drawn': '3D solids: {solids} drawn, {faces} faces.',
  'ccacis.app.dxf': '{n} 3D solids are not in this DXF: CadCraft writes them into DWG only. Save as DWG to keep them.',
  'ccacis.app.import': '{n} 3D solids came in ({closed} closed, as solids).',
};

export function msg(key, fill = {}) {
  let s;
  try { s = globalThis.ccI18n?.has?.(key) ? globalThis.ccI18n.t(key, fill) : undefined; } catch { s = undefined; }
  if (typeof s === 'string') return s;
  s = MESSAGES[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in fill ? String(fill[k]) : m));
}

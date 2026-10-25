/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the English source of cc-3dm's messages; tools/3dm/sync.mjs copies the keys into each app's lang files. */
/**
 * messages.js — every sentence cc-3dm says to a person (errors, notes), keys `ccdm.*` (docs/LANG.md § Shared libraries).
 *
 * cc-3dm runs on pages, in workers and in Node, so it loads no language file of its own: msg() asks the page's catalog
 * through globalThis.ccI18n (set by the app's i18n.js) when it has the key, else it uses the English below. Fills are
 * {name}. Imports nothing. After changing this table: node tools/3dm/sync.mjs (copies the files and the words).
 */

export const MESSAGES = {
  'ccdm.not_3dm': 'This is not a 3D model file in the .3dm format.',
  'ccdm.damaged': 'This .3dm file is damaged: {reason}.',
  'ccdm.too_big': 'This .3dm file is larger than CadCraft reads ({what}).',
  'ccdm.unsupported': 'This .3dm file uses something CadCraft does not read yet: {what}.',

  'ccdm.damaged.header': 'its first line does not name a version',
  'ccdm.damaged.short': 'it ends in the middle of a record',
  'ccdm.damaged.count': 'a count is larger than the file',
  'ccdm.damaged.chunk': 'a record ({tc}) is longer than the part of the file around it',
  'ccdm.damaged.layout': 'a record ({tc}) is not where it should be',
  'ccdm.damaged.index': 'a {what} number points past its list',
  'ccdm.damaged.zip': 'a compressed block does not unpack',
  'ccdm.damaged.object': 'object {n} cannot be read',
  'ccdm.unsupported.version': 'file version {version}',
  'ccdm.too_big.count': '{n} items in one list',
  'ccdm.too_big.objects': '{n} objects',
  'ccdm.too_big.triangles': 'more than {n} triangles',

  // notes: what was read differently or left out
  'ccdm.note.no_objects': 'The file has no objects.',
  'ccdm.note.skipped': '{n} objects of a kind CadCraft does not read yet were left out ({kinds}).',
  'ccdm.note.unreadable': '{n} objects could not be read and were left out.',
  'ccdm.note.subd': '{n} SubD objects were left out: turn them into meshes or polysurfaces in the program that made the file first.',
  'ccdm.note.points': '{n} points and point clouds were left out.',
  'ccdm.note.surfaces': '{n} faces lie on a kind of surface CadCraft does not read yet and were left out ({kinds}).',
  'ccdm.note.mitered': '{n} extrusions have mitered ends; they came in with square ends.',
  'ccdm.note.render_mesh': '{n} faces came in from the render mesh saved in the file.',
  'ccdm.note.missing_block': '{n} block placements name a block that is not in the file.',
  'ccdm.note.linked_block': '{n} blocks are linked from other files, which were not read.',
  'ccdm.note.capped': '{n} faces reached the triangle limit and came in coarser.',

  // kinds of objects and surfaces, in the notes above
  'ccdm.kind.text_dot': 'text dots',
  'ccdm.kind.text': 'texts',
  'ccdm.kind.leader': 'leaders',
  'ccdm.kind.dimension': 'dimensions',
  'ccdm.kind.hatch': 'hatches',
  'ccdm.kind.light': 'lights',
  'ccdm.kind.detail': 'layout details',
  'ccdm.kind.curve_proxy': 'curve copies',
  'ccdm.kind.curve_on_surface': 'curves on surfaces',
  'ccdm.kind.surface_proxy': 'surface copies',
  'ccdm.kind.offset_surface': 'offset surfaces',
  'ccdm.kind.clipping_plane': 'clipping planes',
  'ccdm.kind.point_grid': 'point grids',
  'ccdm.kind.morph_control': 'cage edits',
  'ccdm.kind.old_brep': 'polysurfaces in an old layout',
  'ccdm.kind.instance_definition': 'block definitions',
  'ccdm.kind.layer': 'layers',
  'ccdm.kind.material': 'materials',
  'ccdm.kind.other': 'other objects',
  'ccdm.surface.nurbs_surface': 'NURBS surfaces',
  'ccdm.surface.plane_surface': 'planes',
  'ccdm.surface.rev_surface': 'surfaces of revolution',
  'ccdm.surface.sum_surface': 'extruded curves',
  'ccdm.surface.surface_proxy': 'surface copies',
  'ccdm.surface.offset_surface': 'offset surfaces',
  'ccdm.surface.clipping_plane': 'clipping planes',
  'ccdm.surface.extrusion': 'extrusions',
  'ccdm.surface.other': 'other surfaces',
  'ccdm.surface.trims': '{kind} with trims CadCraft could not follow',
};

const FILL = /\{\{|\}\}|\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

export function msg(key, fills = {}) {
  const i18n = globalThis.ccI18n;
  if (i18n && typeof i18n.has === 'function' && i18n.has(key)) return i18n.t(key, fills);
  const s = MESSAGES[key];
  if (s === undefined) return key;
  return s.replace(FILL, (m, k) => (m === '{{' ? '{' : m === '}}' ? '}' : fills[k] !== undefined && fills[k] !== null ? String(fills[k]) : m));
}

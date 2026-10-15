/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the English source of cc-skp's messages; tools/lang/lib-keys.mjs copies it into each app's lang/en.json. */
/**
 * messages.js — every sentence cc-skp says to a person (errors, notes), keys `ccskp.*` (docs/LANG.md § Shared libraries).
 *
 *   msg('ccskp.damaged', { reason: msg('ccskp.damaged.no_version') })   → "This SketchUp file is damaged: its version is missing."
 *
 * cc-skp runs on pages and in Node (tests, the CLI), so it loads no language file of its own: msg() asks the page's
 * catalog through globalThis.ccI18n (set by the app's i18n.js) when it has the key, else it uses the English below. So
 * Node reads exactly this English, and an app in another language shows its own translation. Fills are {name}; a plural
 * is {one, other} chosen by the fill n (English rules here; the page's catalog brings its own language's forms).
 * Imports nothing. After changing this table: node tools/skp-test/sync.mjs, then node tools/lang/lib-keys.mjs cc-skp.
 */

export const MESSAGES = {
  // errors (SkpError messages: read.js, vff.js, zip.js, legacy.js)
  'ccskp.not_skp': 'This is not a SketchUp file.',
  'ccskp.damaged': 'This SketchUp file is damaged: {reason}.',
  'ccskp.too_new': 'This file was saved by SketchUp {version}, newer than cc-skp reads (up to {newest}).',
  'ccskp.unsupported.pre2021': 'SketchUp {version} files (saved before SketchUp 2021) cannot be read yet.',
  'ccskp.unsupported.no_decompress': 'This browser cannot unpack SketchUp 2021+ files (no DecompressionStream).',
  'ccskp.unsupported.zip64': 'This SketchUp file uses a ZIP64 archive, which cc-skp does not read.',
  'ccskp.unsupported.multipart': 'This SketchUp file is a multi-part archive, which cc-skp does not read.',
  'ccskp.unsupported.encrypted': 'This SketchUp file is encrypted, which cc-skp does not read.',
  'ccskp.unsupported.method': 'This SketchUp file packs "{name}" with a method cc-skp does not read ({method}).',
  'ccskp.too_big.file': 'This SketchUp file is larger than cc-skp reads ({size}).',
  'ccskp.too_big.part': 'A part of this SketchUp file is larger than cc-skp reads ({mb} MB).',
  'ccskp.too_big.part_unpacks': 'This SketchUp file unpacks to more than cc-skp reads ({mb} MB in one part).',
  'ccskp.too_big.unpacked': 'This SketchUp file unpacks to more than cc-skp reads.',
  'ccskp.too_big.nesting': 'Components in this SketchUp file nest deeper than cc-skp reads ({levels} levels).',
  'ccskp.too_big.points': 'This SketchUp file has more points than cc-skp reads ({max}).',
  'ccskp.too_big.objects': 'This SketchUp file has more objects than cc-skp reads.',
  'ccskp.too_big.object_depth': 'This SketchUp file nests objects deeper than cc-skp reads ({levels} levels).',
  'ccskp.too_big.vertices': 'This SketchUp file has more than {max} vertices.',
  'ccskp.too_big.stack': 'This SketchUp file nests too deeply to read.',
  'ccskp.legacy.no_version': 'This file has no SketchUp version in its header.',
  'ccskp.legacy.too_old': 'SketchUp {major} files are older than cc-skp reads (SketchUp 3 and later).',
  'ccskp.legacy.unknown_major': 'A SketchUp {major} file in the classic layout is not something cc-skp knows.',
  'ccskp.legacy.failed': 'This SketchUp file could not be read: {reason}.',
  'ccskp.legacy.failed_internal': 'This SketchUp file could not be read ({reason}).',

  // what is damaged: the {reason} of ccskp.damaged
  'ccskp.damaged.past_end': 'a record runs past the end of the file',
  'ccskp.damaged.header_cut': 'it ends inside its header',
  'ccskp.damaged.no_version': 'its version is missing',
  'ccskp.damaged.no_version_map': 'its class list (version map) is missing',
  'ccskp.damaged.record_header': 'a record header is cut short',
  'ccskp.damaged.record_past': 'a record runs past its container',
  'ccskp.damaged.id_size': 'an id has an impossible size',
  'ccskp.damaged.no_archive': 'the model archive is missing',
  'ccskp.damaged.no_model_dat': 'model.dat is missing from the archive',
  'ccskp.damaged.no_geometry': 'the model has no geometry list',
  'ccskp.damaged.def_id_twice': 'two definitions share one id',
  'ccskp.damaged.self_nested': 'a component contains itself',
  'ccskp.damaged.placement_short': 'an instance placement is cut short',
  'ccskp.damaged.placement_scale': 'an instance placement has no scale',
  'ccskp.damaged.placement_numbers': 'an instance placement has impossible numbers',
  'ccskp.damaged.vertex_position': 'a vertex has no position',
  'ccskp.damaged.vertex_coords': 'a vertex has impossible coordinates',
  'ccskp.damaged.face_edge': 'a face edge reference is incomplete',
  'ccskp.damaged.inflate': 'a compressed part does not unpack',
  'ccskp.damaged.no_end': 'the end of the archive is missing (the file may be cut off)',
  'ccskp.damaged.dir_outside': 'the archive directory points outside the file',
  'ccskp.damaged.dir_broken': 'the archive directory is broken',
  'ccskp.damaged.entry_missing': '"{name}" is missing from the archive',
  'ccskp.damaged.entry_outside': '"{name}" points outside the archive',
  'ccskp.damaged.entry_past_end': '"{name}" runs past the end of the file',
  'ccskp.damaged.entry_size': '"{name}" has the wrong size',
  'ccskp.damaged.entry_unpacked': '"{name}" unpacks to the wrong size',
  'ccskp.damaged.entry_crc': '"{name}" fails its checksum',

  // classic files (legacy.js): the {reason} of ccskp.legacy.failed
  'ccskp.legacy.text_record': 'expected a text record at byte {at}',
  'ccskp.legacy.text_long': 'text record longer than the file at byte {at}',
  'ccskp.legacy.class_name': 'implausible class name length at byte {at}',
  'ccskp.legacy.class_unknown': 'reference to an unknown class at byte {at}',
  'ccskp.legacy.ref_as_class': 'object reference used as a class at byte {at}',
  'ccskp.legacy.type_unknown': 'unknown object type {type} at byte {at}',
  'ccskp.legacy.ref_unread': 'reference to an object not read yet at byte {at}',
  'ccskp.legacy.ref_class_record': 'reference to a class record at byte {at}',
  'ccskp.legacy.vertex_range': 'vertex coordinates out of range at byte {at}',
  'ccskp.legacy.edge_curve': 'edge curve pointer is a {type} at byte {at}',
  'ccskp.legacy.edgeuse_parent': 'edge use parent is a new object at byte {at}',
  'ccskp.legacy.edgeuse_loop': 'edge use does not belong to its loop at byte {at}',
  'ccskp.legacy.loop_count': 'implausible loop count at byte {at}',
  'ccskp.legacy.attr_array': 'implausible attribute array at byte {at}',
  'ccskp.legacy.attr_type': 'unknown attribute value type {type} at byte {at}',
  'ccskp.legacy.texture_image': 'texture without an image at byte {at}',
  'ccskp.legacy.texture_size': 'texture size block misaligned at byte {at}',
  'ccskp.legacy.image_long': 'image longer than the file at byte {at}',
  'ccskp.legacy.texture_pins': 'implausible texture pin count at byte {at}',
  'ccskp.legacy.entity_ref': 'entity reference is a new object at byte {at}',
  'ccskp.legacy.dim_path': 'implausible dimension path at byte {at}',
  'ccskp.legacy.text_label': 'text label layout not recognised at byte {at}',
  'ccskp.legacy.def_layers': 'implausible definition layer count at byte {at}',
  'ccskp.legacy.def_entities': 'implausible definition entity count at byte {at}',
  'ccskp.legacy.def_misaligned': 'definition record misaligned at byte {at}',
  'ccskp.legacy.def_end': 'definition record end not found at byte {at}',
  'ccskp.legacy.inst_not_def': 'instance of something that is not a definition at byte {at}',
  'ccskp.legacy.material_count': 'implausible material count',
  'ccskp.legacy.no_lists': 'no materials or layers found',
  'ccskp.legacy.numbering': 'cannot find where the model data is numbered from',
  'ccskp.legacy.layer_count': 'implausible layer count',
  'ccskp.legacy.layer_end': 'the layer list did not end where expected',
  'ccskp.legacy.def_list': 'the definition list does not start where expected',
  'ccskp.legacy.def_count': 'implausible definition count',
  'ccskp.legacy.entity_count': 'implausible model entity count',
  'ccskp.legacy.no_numbering': 'no way to number the model data was found',

  // notes: SketchUp 2021+ files (vff.js)
  'ccskp.note.material_xml': { one: '{n} material description could not be read', other: '{n} material descriptions could not be read' },
  'ccskp.note.material_no_xml': { one: '{n} material without a description (shown with no color)', other: '{n} materials without a description (shown with no color)' },
  'ccskp.note.texture_missing': { one: '{n} texture missing from the file (its material keeps its color)', other: '{n} textures missing from the file (their materials keep their color)' },
  'ccskp.note.texture_no_size': { one: '{n} texture without a tile size skipped (its material keeps its color)', other: '{n} textures without a tile size skipped (their materials keep their color)' },
  'ccskp.note.unit_unknown': 'Display unit "{unit}" not recognised',
  'ccskp.note.styles': { one: '{n} style not read', other: '{n} styles not read' },
  'ccskp.note.material_no_id': { one: '{n} material without an id skipped', other: '{n} materials without an id skipped' },
  'ccskp.note.tag_no_id': { one: '{n} tag without an id skipped', other: '{n} tags without an id skipped' },
  'ccskp.note.scenes': { one: '{n} scene not read', other: '{n} scenes not read' },
  'ccskp.note.def_no_geometry': { one: '{n} definition without geometry skipped', other: '{n} definitions without geometry skipped' },
  'ccskp.note.def_no_id': { one: '{n} definition without an id skipped', other: '{n} definitions without an id skipped' },
  'ccskp.note.inst_missing_def': { one: '{n} instance of a missing definition skipped', other: '{n} instances of a missing definition skipped' },
  'ccskp.note.material_ref': { one: '{n} reference to a missing material ignored', other: '{n} references to a missing material ignored' },
  'ccskp.note.tag_ref': { one: '{n} reference to a missing tag ignored', other: '{n} references to a missing tag ignored' },
  'ccskp.note.inst_no_def': { one: '{n} instance without a definition skipped', other: '{n} instances without a definition skipped' },
  'ccskp.note.inst_no_place': { one: '{n} instance without a placement put at the origin', other: '{n} instances without a placement put at the origin' },
  'ccskp.note.edge_no_ends': { one: '{n} edge with missing ends skipped', other: '{n} edges with missing ends skipped' },
  'ccskp.note.guide_lines': { one: '{n} guide line not read', other: '{n} guide lines not read' },
  'ccskp.note.guide_points': { one: '{n} guide point not read', other: '{n} guide points not read' },
  'ccskp.note.annotations': { one: '{n} dimension or text not read', other: '{n} dimensions and texts not read' },
  'ccskp.note.other_lists': { one: '{n} list of other drawing elements (record {record}) not read', other: '{n} lists of other drawing elements (record {record}) not read' },
  'ccskp.note.face_open': { one: '{n} face whose outline does not close skipped', other: '{n} faces whose outline does not close skipped' },
  'ccskp.note.face_turned': { one: '{n} face outline turned to face its front side', other: '{n} face outlines turned to face their front side' },
  'ccskp.note.edge_missing_end': { one: '{n} edge with a missing end point skipped', other: '{n} edges with a missing end point skipped' },

  // notes: classic files (legacy.js)
  'ccskp.note.text_labels': { one: '{n} text label not read.', other: '{n} text labels not read.' },
  'ccskp.note.dimensions': { one: '{n} dimension not read.', other: '{n} dimensions not read.' },
  'ccskp.note.section_planes': { one: '{n} section plane not read.', other: '{n} section planes not read.' },
  'ccskp.note.guides': { one: '{n} guide line or point not read.', other: '{n} guide lines and points not read.' },
  'ccskp.note.face_corners': { one: '{n} face with fewer than three corners left out.', other: '{n} faces with fewer than three corners left out.' },
  'ccskp.note.inst_broken': { one: '{n} instance with an unknown definition or a broken transform left out.', other: '{n} instances with an unknown definition or a broken transform left out.' },
  'ccskp.note.material_unknown': { one: '{n} material reference to a material not in the file read as default.', other: '{n} material references to a material not in the file read as default.' },
  'ccskp.note.texture_format': { one: '{n} texture stored in a format browsers can\'t show (e.g. Photoshop): use the material color.', other: '{n} textures stored in a format browsers can\'t show (e.g. Photoshop): use the material color.' },
  'ccskp.note.texture_projected': { one: '{n} face with a projected texture: texture coordinates are approximate.', other: '{n} faces with a projected texture: texture coordinates are approximate.' },
  'ccskp.note.face_flipped': { one: '{n} face whose outline runs against its stored front side (kept as stored).', other: '{n} faces whose outline runs against its stored front side (kept as stored).' },
  'ccskp.note.root_cut': { one: 'The model\'s entity list declared {n} more entry than could be read; reading stopped at the first one it could not.', other: 'The model\'s entity list declared {n} more entries than could be read; reading stopped at the first one it could not.' },
  'ccskp.note.v3': 'SketchUp 3 file: edge flags (soft, smooth, hidden) and entity materials other than the front face color are not stored in a way cc-skp can read.',
  'ccskp.note.not_read': 'Scenes, styles and the camera are not read.',
};

const FILL = /\{\{|\}\}|\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

/** The text for `key` with its fills: the page's language when its catalog has the key, else the English above. */
export function msg(key, fills = {}) {
  const i18n = globalThis.ccI18n;
  if (i18n && typeof i18n.has === 'function' && i18n.has(key)) return i18n.t(key, fills);
  let s = MESSAGES[key];
  if (s === undefined) return key;
  if (typeof s === 'object') s = s['=' + fills.n] ?? (Number(fills.n) === 1 ? s.one : s.other) ?? s.other;
  return s.replace(FILL, (m, k) => (m === '{{' ? '{' : m === '}}' ? '}' : fills[k] !== undefined && fills[k] !== null ? String(fills[k]) : m));
}

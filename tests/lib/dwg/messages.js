/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the English source of cc-dwg's messages; tools/lang/lib-keys.mjs copies it into each app's lang/en.json. */
/**
 * messages.js — every sentence cc-dwg says to a person (errors, report notes), keys `ccdwg.*` (docs/LANG.md § Shared libraries).
 *
 *   msg('ccdwg.read.section_failed', { name, reason })   → "Section AcDb:Header could not be read: …"
 *
 * cc-dwg runs on pages, in a worker (read-async.js) and in Node (tests, the site's library converter), so it loads no
 * language file of its own: msg() asks the page's catalog through globalThis.ccI18n (set by the app's i18n.js) when it has
 * the key, else it uses the English below. So Node and the converter read exactly this English, and an app in another
 * language shows its own translation. Fills are {name}; a plural is {one, other} chosen by the fill n (English rules here;
 * the page's catalog brings its own language's forms). Imports nothing: read.js's import graph must stay a tree.
 * After changing this table: node tools/lang/lib-keys.mjs (copies it into the apps' en.json) and tools/dwg-test/writer-sync.mjs.
 */

export const MESSAGES = {
  // opening (container-read.js, r2007.js, read.js)
  'ccdwg.open.failed': 'Could not open the file: {reason}',
  'ccdwg.open.too_short': { one: 'too short to be a DWG file ({n} byte)', other: 'too short to be a DWG file ({n} bytes)' },
  'ccdwg.open.version': 'DWG version {version} is not supported (only R13 to R2018: AC1012–AC1032)',
  'ccdwg.open.not_dwg': 'not a DWG file (it starts "{start}")',
  'ccdwg.open.r13_header': 'damaged R13–R15 file header ({n} section locators)',
  'ccdwg.open.r13_locators': 'damaged R13–R15 file: section locators point outside the file',
  'ccdwg.open.no_id': 'damaged {version} file header (no AcFssFcAJMB id)',
  'ccdwg.open.no_section_map': 'damaged {version} file: section map page {id} is not in the page map',
  'ccdwg.open.past_end': 'damaged file: the {what} lies past the end of the file',
  'ccdwg.open.page_type': 'damaged file: the {what} page has type 0x{type}',
  'ccdwg.open.runs_past': 'damaged file: the {what} runs past the end of the file',
  'ccdwg.open.r2007_short': 'R2007 file too short',
  'ccdwg.open.r2007_no_section_map': 'damaged R2007 file: no section map page',
  'ccdwg.open.r2007_past_end': 'damaged R2007 file: the {what} lies past the end',
  'ccdwg.part.page_map': 'page map',
  'ccdwg.part.section_map': 'section map',

  // reading: report notes
  'ccdwg.read.password': 'The drawing is password-protected (encrypted data); its sections cannot be read.',
  'ccdwg.read.codepage': 'Code page {num} ({name}) is decoded as ANSI_1252.',
  'ccdwg.read.file_header_crc': 'File header CRC does not match (file may be damaged).',
  'ccdwg.read.file_header_crc32': 'File header CRC-32 does not match.',
  'ccdwg.read.r2007_header_bad': 'The R2007 file header has uncorrectable errors.',
  'ccdwg.read.r2007_corrected': { one: 'Corrected {n} damaged byte in the file header.', other: 'Corrected {n} damaged bytes in the file header.' },
  'ccdwg.read.uncorrectable': 'The {what} has uncorrectable errors.',
  'ccdwg.read.section_map_damaged': 'The section map is damaged ({n} pages for one section).',
  'ccdwg.read.section_encrypted': 'Section {name} is encrypted and was skipped.',
  'ccdwg.read.section_failed': 'Section {name} could not be read: {reason}',
  'ccdwg.read.system_checksum': 'Checksum of the {what} does not match.',
  'ccdwg.read.page_checksum': 'Checksum of a page of {name} does not match.',
  'ccdwg.read.pages_bad': { one: '{n} page of {name} could not be found or decoded.', other: '{n} pages of {name} could not be found or decoded.' },
  'ccdwg.read.pages_missing': { one: '{n} page of {name} could not be found.', other: '{n} pages of {name} could not be found.' },
  'ccdwg.read.header_failed': 'Header variables could not be read: {reason}',
  'ccdwg.read.header_sentinel': 'Header section sentinel is missing.',
  'ccdwg.read.header_crc': 'Header section CRC does not match.',
  'ccdwg.read.header_early': 'Header variables stop early: {reason}',
  'ccdwg.read.classes_failed': 'Classes could not be read: {reason}',
  'ccdwg.read.classes_sentinel': 'Classes section sentinel is missing.',
  'ccdwg.read.classes_crc': 'Classes section CRC does not match.',
  'ccdwg.read.class_number': 'Class list stops at an unexpected class number {num}.',
  'ccdwg.read.map_failed': 'Object map could not be read: {reason}',
  'ccdwg.read.map_short': 'Object map is cut short.',
  'ccdwg.read.map_crc': { one: '{n} object map page failed the CRC check.', other: '{n} object map pages failed the CRC check.' },
  'ccdwg.read.map_entry': 'Object map entry {handle} points at object {other}.',
  'ccdwg.read.object_failed': 'Object {handle} could not be read: {reason}',
  'ccdwg.read.no_objects': 'The file has no objects section.',
  'ccdwg.read.more_failed': { one: '… {n} more object could not be read.', other: '… {n} more objects could not be read.' },
  'ccdwg.read.crc_failed': { one: '{n} object failed the CRC check (read anyway).', other: '{n} objects failed the CRC check (read anyway).' },
  'ccdwg.read.partial_type': { one: '{n} {type} object could only be read in part.', other: '{n} {type} objects could only be read in part.' },
  'ccdwg.read.assembled_part': 'The drawing could only be assembled in part: {reason}',
  'ccdwg.read.kept_common': { one: '{n} damaged object kept with only its common data.', other: '{n} damaged objects kept with only their common data.' },
  'ccdwg.read.orphans': {
    one: '{n} entity was not linked from its block and was added at its end.',
    other: '{n} entities were not linked from their block and were added at its end.',
  },
  'ccdwg.read.acds_empty': 'The data storage section is empty.',
  'ccdwg.read.acds_no_sig': 'The data storage section has no "jard" signature.',
  'ccdwg.read.acds_entry': 'Data storage entry points at a "{name}" segment.',
  'ccdwg.read.acds_record_large': 'Data storage record of {handle} is larger than its segment.',
  'ccdwg.read.acds_partial': 'The data storage section could only be read in part: {reason}',
  'ccdwg.read.acis_no_storage': {
    one: '{n} ACIS entity says its data is in the data storage section, which the file does not have.',
    other: '{n} ACIS entities say their data is in the data storage section, which the file does not have.',
  },
  'ccdwg.read.acis_no_record': {
    one: '{n} ACIS entity has no record in the data storage section (kept empty).',
    other: '{n} ACIS entities have no record in the data storage section (kept empty).',
  },

  // reading: why one part could not be read (the {reason} of the notes above)
  'ccdwg.err.no_header': 'no AcDb:Header section',
  'ccdwg.err.no_classes': 'no AcDb:Classes section',
  'ccdwg.err.no_handles': 'no AcDb:Handles section',
  'ccdwg.err.read_past_end': 'read past the end ({at} > {end} bits)',
  'ccdwg.err.bitlong': 'bad BITLONG code 11',
  'ccdwg.err.bitdouble': 'bad BITDOUBLE code 11',
  'ccdwg.err.lz_before_start': 'LZ back-reference before the start of the page',
  'ccdwg.err.lz_opcode': 'LZ opcode 0x{op} is not used',
  'ccdwg.err.r2007_lz': 'R2007 LZ back-reference before the start',
  'ccdwg.err.header_type': 'unknown header type {type}',
  'ccdwg.err.offset_outside': 'object offset outside the section',
  'ccdwg.err.object_past_end': 'object of {n} bytes runs past the section end',
  'ccdwg.err.size_fields': 'object size fields do not agree (damaged object)',
  'ccdwg.err.eed_code': 'EED code {code}',
  'ccdwg.err.handle_count': 'handle count {n} is larger than the handle stream',
  'ccdwg.err.count_large': 'count {n} is larger than the data',
  'ccdwg.err.dictionary_size': 'dictionary of {n} entries',
  'ccdwg.err.hatch_edge': 'hatch edge type {type}',
  'ccdwg.err.xrecord_code': 'XRECORD group code {code}',
  'ccdwg.err.value_type': 'value data type {type}',
  'ccdwg.err.surface_code': 'surface field code {code}',
  'ccdwg.err.acds_no_segment': 'no file segment at {offset}',
  'ccdwg.err.acds_index': 'the segment index is a "{name}" segment',
  'ccdwg.err.acds_segment': 'segment {n} is not in the index',
  'ccdwg.err.acis_block': 'ACIS block of {n} bytes is larger than the data',
  'ccdwg.err.acis_no_end': 'ACIS data (version 2) has no end mark',
  'ccdwg.err.acis_version': 'ACIS data version {version}',
  'ccdwg.err.wire_large': 'wire of {n} points is larger than the data',
  'ccdwg.err.wires_large': '{n} wires are more than the data holds',
  'ccdwg.err.silhouettes_large': '{n} silhouettes are more than the data holds',

  // writing: report notes (write.js, nongraphic-write.js, solid-write.js, surface-write.js, table-write.js)
  'ccdwg.write.eed_dropped': {
    one: '{n} extended-data block referring to objects this writer does not copy (materials, groups, …) was left out.',
    other: '{n} extended-data blocks referring to objects this writer does not copy (materials, groups, …) were left out.',
  },
  'ccdwg.write.true_colours': {
    one: '{n} true colour became the nearest AutoCAD colour index (R2000 stores colour indexes only).',
    other: '{n} true colours became the nearest AutoCAD colour index (R2000 stores colour indexes only).',
  },
  'ccdwg.write.chars_lost': {
    one: '{n} character outside the Basic Multilingual Plane (emoji and the like) became "?".',
    other: '{n} characters outside the Basic Multilingual Plane (emoji and the like) became "?".',
  },
  'ccdwg.write.nongraphic': {
    one: '{n} non-graphical object was copied from the source ({raw} bit for bit in the drawing\'s own version, {fields} from their fields).',
    other: '{n} non-graphical objects were copied from the source ({raw} bit for bit in the drawing\'s own version, {fields} from their fields).',
  },
  'ccdwg.write.not_copied': 'Not copied (cc-dwg cannot write them in this version, or they depend on them): {list}.',
  'ccdwg.write.entities_dropped': {
    one: '{n} {type} entity was left out: undecoded data can only be written back in the drawing\'s own version.',
    other: '{n} {type} entities were left out: undecoded data can only be written back in the drawing\'s own version.',
  },
  'ccdwg.write.proxied': 'Written as proxies of their own class (undecoded data in another version, as AutoCAD saves them down): {list}.',
  'ccdwg.write.raw': 'Copied bit for bit (custom or proxy entities): {list}.',
  'ccdwg.write.acis_empty': { one: '{n} ACIS entity has no ACIS data (written empty).', other: '{n} ACIS entities have no ACIS data (written empty).' },
  'ccdwg.write.acis_sat': {
    one: '{n} ACIS entity keeps its SAT text (as the data storage record; R2013+ files normally hold SAB there — SAT is not converted).',
    other: '{n} ACIS entities keep their SAT text (as the data storage record; R2013+ files normally hold SAB there — SAT is not converted).',
  },
  'ccdwg.write.acis_sab': {
    one: '{n} ACIS entity keeps its SAB data as ACIS version 2 in an R2000 file (AutoCAD 2000 itself writes SAT).',
    other: '{n} ACIS entities keep their SAB data as ACIS version 2 in an R2000 file (AutoCAD 2000 itself writes SAT).',
  },
  'ccdwg.write.nurbs_down': {
    one: '{n} NURBS surface was written as plain SURFACE ({version} has no NURBSURFACE; as AutoCAD and the ODA File Converter save it down, with the ACAD_XREC_ROUNDTRIP marker that turns it back into a NURBS surface in R2013+).',
    other: '{n} NURBS surfaces were written as plain SURFACE ({version} has no NURBSURFACE; as AutoCAD and the ODA File Converter save it down, with the ACAD_XREC_ROUNDTRIP marker that turns it back into a NURBS surface in R2013+).',
  },
  'ccdwg.write.nurbs_up': {
    one: '{n} surface saved down from NURBSURFACE was written as NURBSURFACE again (its NURBS fields were not kept by the save-down).',
    other: '{n} surfaces saved down from NURBSURFACE were written as NURBSURFACE again (their NURBS fields were not kept by the save-down).',
  },
  'ccdwg.write.embedded': {
    one: '{n} embedded profile/path entity of a surface (an encoding cc-dwg does not know) was left out: it is kept only in the drawing\'s own version.',
    other: '{n} embedded profile/path entities of a surface (an encoding cc-dwg does not know) were left out: they are kept only in the drawing\'s own version.',
  },
  'ccdwg.write.table_fields': {
    one: '{n} table cell field could not be written and kept its text.',
    other: '{n} table cell fields could not be written and kept their text.',
  },
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

/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the English source of cc-exr's messages; tools/exr/sync.mjs copies the keys into each app's lang files. */
/**
 * messages.js — every sentence cc-exr says to a person (errors, notes), keys `ccexr.*` (docs/LANG.md § Shared libraries).
 *
 *   msg('ccexr.damaged', { reason: msg('ccexr.damaged.no_end') })   → "This EXR image is damaged: its header has no end."
 *
 * cc-exr runs on pages, in workers and in Node, so it loads no language file of its own: msg() asks the page's catalog
 * through globalThis.ccI18n (set by the app's i18n.js) when it has the key, else it uses the English below. Fills are
 * {name}. Imports nothing. After changing this table: node tools/exr/sync.mjs (copies the files and the words).
 */

export const MESSAGES = {
  // EXR (exr.js)
  'ccexr.not_exr': 'This is not an OpenEXR image.',
  'ccexr.damaged': 'This EXR image is damaged: {reason}.',
  'ccexr.too_big': 'This EXR image is larger than CadCraft reads ({what}).',
  'ccexr.unsupported': 'This EXR image uses something CadCraft does not read yet: {what}.',
  'ccexr.unsupported.version': 'file format version {version}',
  'ccexr.unsupported.deep': 'deep data',
  'ccexr.unsupported.compression': '{name} compression',
  'ccexr.unsupported.tiled_sampling': 'subsampled channels in a tiled image',
  'ccexr.damaged.header_end': 'its header has no end',
  'ccexr.damaged.attribute': 'the attribute "{name}" is cut short or has the wrong size',
  'ccexr.damaged.required': 'the required attribute "{name}" is missing',
  'ccexr.damaged.window': 'its data window is impossible',
  'ccexr.damaged.channels': 'its channel list is broken',
  'ccexr.damaged.no_channels': 'it has no channels',
  'ccexr.damaged.offsets': 'its chunk table runs past the end of the file',
  'ccexr.damaged.chunk': 'a block of pixels does not unpack ({why})',
  'ccexr.damaged.parts': 'its list of parts is broken',
  'ccexr.too_big.pixels': '{n} million pixels',
  'ccexr.too_big.channels': '{n} channels',
  'ccexr.too_big.attributes': 'more than {n} attributes',
  'ccexr.note.missing_chunks': '{n} blocks of pixels are missing or damaged; they are left black.',
  'ccexr.note.rebuilt_offsets': 'The chunk table was damaged; the blocks were found by reading through the file.',
  'ccexr.note.levels': 'Only the full-size level of this {kind} image is read.',
  'ccexr.write.bad_image': 'This picture cannot be saved as EXR: {why}.',

  // Radiance .hdr (hdr.js)
  'ccexr.hdr.not_hdr': 'This is not a Radiance HDR (.hdr) image.',
  'ccexr.hdr.damaged': 'This HDR image is damaged: {reason}.',
  'ccexr.hdr.format': 'it is not in the RGBE format (it says {format})',
  'ccexr.hdr.size': 'its size line is missing or impossible',
  'ccexr.hdr.short': 'it ends before the last row of pixels',
  'ccexr.hdr.run': 'a row of pixels does not unpack',
  'ccexr.hdr.too_big': 'This HDR image is larger than CadCraft reads ({n} million pixels).',

  // .cube LUTs (cube.js)
  'ccexr.cube.damaged': 'This .cube colour table is damaged: {reason}.',
  'ccexr.cube.no_size': 'it names no table size (LUT_1D_SIZE or LUT_3D_SIZE)',
  'ccexr.cube.size': 'its table size {n} is outside what the format allows',
  'ccexr.cube.count': 'it has {have} rows where its size needs {want}',
  'ccexr.cube.line': 'line {line} is not three numbers',
  'ccexr.cube.domain': 'its domain is impossible',
  'ccexr.cube.keyword': 'line {line} has a keyword after the table rows ({word})',
  'ccexr.cube.skipped': 'Keywords the Cube specification does not define were skipped: {words}.',
};

const FILL = /\{\{|\}\}|\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

export function msg(key, fills = {}) {
  const i18n = globalThis.ccI18n;
  if (i18n && typeof i18n.has === 'function' && i18n.has(key)) return i18n.t(key, fills);
  const s = MESSAGES[key];
  if (s === undefined) return key;
  return s.replace(FILL, (m, k) => (m === '{{' ? '{' : m === '}}' ? '}' : fills[k] !== undefined && fills[k] !== null ? String(fills[k]) : m));
}

/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the English source of cc-usd's messages; tools/usd/sync.mjs copies the keys into each app's lang files. */
/**
 * messages.js — every sentence cc-usd says to a person (errors, notes), keys `ccusd.*` (docs/LANG.md § Shared libraries).
 *
 *   msg('ccusd.damaged', { reason: msg('ccusd.damaged.toc') })   → "This USD file is damaged: its table of contents …"
 *
 * cc-usd runs on pages, in workers and in Node, so it loads no language file of its own: msg() asks the page's catalog
 * through globalThis.ccI18n (set by the app's i18n.js) when it has the key, else it uses the English below. Fills are
 * {name}. Imports nothing. After changing this table: node tools/usd/sync.mjs (copies the files and the words).
 */

export const MESSAGES = {
  'ccusd.not_usd': 'This is not a USD file.',
  'ccusd.damaged': 'This USD file is damaged: {reason}.',
  'ccusd.too_big': 'This USD file is larger than CadCraft reads ({what}).',
  'ccusd.unsupported': 'This USD file uses something CadCraft does not read yet: {what}.',
  'ccusd.missing': 'This USD file needs another file that is not here: {name}.',
  'ccusd.bad_scene': 'This scene cannot be written as USD: {why}.',

  // binary (.usdc)
  'ccusd.damaged.short': 'it ends before its header',
  'ccusd.damaged.toc': 'its table of contents points outside the file',
  'ccusd.damaged.section': 'its {name} section is broken',
  'ccusd.damaged.index': 'a {what} number points past its table',
  'ccusd.damaged.value': 'a value points outside the file',
  'ccusd.damaged.lz4': 'a compressed block does not unpack',
  'ccusd.damaged.loop': 'a value contains itself',
  'ccusd.damaged.paths': 'its tree of names is broken',
  'ccusd.unsupported.version': 'binary version {version}',
  'ccusd.unsupported.type': 'value type {type}',
  'ccusd.unsupported.array_edit': 'array edits',
  'ccusd.unsupported.spline': 'spline animation curves',
  'ccusd.too_big.count': '{n} items in one table',
  'ccusd.too_big.bytes': '{n} MB in one value',

  // text (.usda)
  'ccusd.damaged.syntax': 'line {line}: {what}',
  'ccusd.syntax.expected': 'expected {want}, found {got}',
  'ccusd.syntax.end': 'the file ends in the middle of {what}',
  // the parts {want}, {got} and {what} are made of in the two messages above (0.7 closing fixes: no English inside a translated sentence)
  'ccusd.part.end': 'the end',
  'ccusd.part.string': 'a string',
  'ccusd.part.path': 'a path',
  'ccusd.part.asset': 'an asset path',
  'ccusd.part.specifier': 'def, over or class',
  'ccusd.part.prim_name': 'a prim name',
  'ccusd.part.new_prim': 'a new prim',
  'ccusd.part.number': 'a number',
  'ccusd.part.no_value': 'no value',
  'ccusd.part.bool': 'true or false',
  'ccusd.part.value': 'a value',
  'ccusd.syntax.header': 'it does not start with #usda',
  'ccusd.syntax.type': 'unknown value type "{type}"',
  'ccusd.syntax.value': 'a value does not fit its type {type}',
  'ccusd.syntax.depth': 'it is nested too deeply',

  // packages (.usdz)
  'ccusd.damaged.zip': 'its package (zip) is broken',
  'ccusd.unsupported.zip': 'a compressed or encrypted package entry ({name})',
  'ccusd.missing.layer': 'the package has no USD layer',

  // composition
  'ccusd.note.missing_layer': 'A file it refers to is missing and was left out: {name}.',
  'ccusd.note.unread_layer': 'A file it refers to could not be read and was left out: {name} ({why}).',
  'ccusd.note.loop': 'A reference that leads back to itself was left out: {name}.',
  'ccusd.note.skipped_payloads': '{n} payloads were not loaded.',
};

const FILL = /\{\{|\}\}|\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

export function msg(key, fills = {}) {
  const i18n = globalThis.ccI18n;
  if (i18n && typeof i18n.has === 'function' && i18n.has(key)) return i18n.t(key, fills);
  const s = MESSAGES[key];
  if (s === undefined) return key;
  return s.replace(FILL, (m, k) => (m === '{{' ? '{' : m === '}}' ? '}' : fills[k] !== undefined && fills[k] !== null ? String(fills[k]) : m));
}

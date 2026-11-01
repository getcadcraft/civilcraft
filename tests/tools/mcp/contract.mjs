/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/**
 * contract.mjs — the AI tool contract (docs/AI-CONNECT-SPEC.md § 1.1 and § 2, rule 34), DOM-free (imports only core.mjs).
 *
 *   APP_KEYS                       app slug → the key that prefixes its tools on the Studio hub
 *   publicName(app, local)         'cadcraft', 'command_run' → 'cad_command_run' (a name that already starts with 'cad_' stays)
 *   localName(publicName)          → { app, name } | null
 *   checkTool(def, { app })        → { errors: [..], warnings: [..], preview: 'native'|'rollback'|'validate'|'own'|'none'|'n/a' }
 *   UNTRUSTED_NAME                 tool names that return text from a file (must declare untrusted: true)
 */
import { APP_KEYS, publicName } from './core.mjs';
export { APP_KEYS, publicName };
const KEY_APP = Object.fromEntries(Object.entries(APP_KEYS).map(([a, k]) => [k, a]));

/** The app a hub name belongs to and its local name. A name that is already `<key>_x` is ambiguous with a local `x` (see tools/mcp/contract.mjs tests): both are tried by the hub. */
export function localName(pub) {
  const i = pub.indexOf('_');
  if (i < 1) return null;
  const app = KEY_APP[pub.slice(0, i)];
  return app ? { app, name: pub.slice(i + 1), alsoLocal: pub } : null;
}

export const VERBS = ['list', 'get', 'describe', 'find', 'add', 'set', 'move', 'delete', 'run', 'open', 'save', 'export', 'check', 'undo', 'info', 'status', 'result', 'start', 'select', 'insert', 'change', 'accept', 'fix', 'show', 'report', 'make', 'sample', 'query', 'quantities', 'estimate', 'screenshot', 'isolate', 'erase', 'paint', 'reply', 'close', 'convert', 'plot', 'new', 'count', 'elevation', 'station', 'volume', 'unaccept', 'properties', 'new', 'reset', 'clear', 'apply', 'update', 'import'];
/** Names that return text from a file (drawing text, names, attributes, markups): they must say untrusted: true (rule 36). */
export const UNTRUSTED_NAME = /(^|_)(list|get|describe|find|query|properties|markups|quantities|estimate|info|report|screenshot|show)(_|$)/;
/** Tools that provably return only numbers, ids and fixed words: exempt from the untrusted flag. */
export const NUMBERS_ONLY = new Set(['app_info', 'undo', 'selection_get', 'selection_set', 'view_describe', 'mass_properties', 'surface_volume', 'surface_elevation', 'alignment_station', 'profile_sample', 'windows_list', 'view_screenshot', 'doc_close', 'problems_show', 'problems_fix', 'problems_accept', 'problems_unaccept', 'autocomplete_list', 'faces_list']);

/** Tools whose text is the person's own words or the firm's own rules, not text from a file: the Ask box queue, the pending suggestions and the firm's standards (ai-trust_PART_2; allow-listed by ai_PART_3). */
export const OWN_TEXT = new Set(['ask_list', 'ask_reply', 'suggestions_list', 'standards_get']);

const walk = (schema, fn, where = 'arguments') => {
  if (!schema || typeof schema !== 'object') return;
  fn(schema, where);
  for (const [k, v] of Object.entries(schema.properties || {})) walk(v, fn, where + '.' + k);
  if (schema.items) walk(schema.items, fn, where + '[]');
  for (const alt of schema.anyOf || schema.oneOf || []) walk(alt, fn, where + '|alt');
};

export function checkTool(def, { app = null } = {}) {
  const errors = [], warnings = [];
  const E = (m) => errors.push(m), W = (m) => warnings.push(m);
  if (!def || typeof def !== 'object') return { errors: ['not a tool'], warnings, preview: 'n/a' };
  const name = String(def.name || '');
  if (!/^[a-z][a-z0-9_]{0,63}$/.test(name)) E('name must match ^[a-z][a-z0-9_]{0,63}$');
  if (app && APP_KEYS[app] && publicName(app, name).length > 64) E('the hub name ' + publicName(app, name) + ' is over 64 characters');
  const parts = name.split('_');
  if (parts.length < 2 && name !== 'undo') W('name should be <area>_<verb>');
  else if (parts.length >= 2 && !VERBS.includes(parts[parts.length - 1]) && !VERBS.includes(parts[0])) W('the last part of the name is not a known verb (' + parts[parts.length - 1] + ')');
  if (!['read', 'edit', 'save', 'export'].includes(def.group)) E('group must be read, edit, save or export');

  const title = String(def.title || '');
  if (!title) E('no title'); else if (title.length > 40) W('title is over 40 characters');
  const desc = String(def.description || '');
  if (desc.length < 40) E('description under 40 characters (say what it does, what it returns, the limit)');
  else if (desc.length > 600) W('description over 600 characters (' + desc.length + ')');
  if (desc && !/^[A-Z“"(]/.test(desc)) W('description should start with a capital verb');
  if (/\bTODO\b|\bAI\b/.test(desc)) W('description mentions TODO or "AI"');

  const sc = def.inputSchema || { type: 'object', properties: {}, additionalProperties: false };   // the dispatcher's default for a tool without arguments
  if (sc.type !== 'object') E('inputSchema must be an object schema');
  else {
    if (sc.additionalProperties !== false) E('inputSchema needs additionalProperties: false');
    walk(sc, (s, where) => {
      if (s.$ref || s.$defs) E(where + ': $ref and $defs are not used');
      if (where !== 'arguments' && s.type !== undefined && !s.description && !(s.properties && Object.keys(s.properties).length === 0) && where.split('.').length === 2 && !where.endsWith('[]') && !where.endsWith('|alt')) E(where + ': no description');
      if (s.type === 'string' && s.maxLength === undefined && !s.enum && s.const === undefined && !s.pattern) E(where + ': string without maxLength');
      if (s.type === 'array' && s.maxItems === undefined) E(where + ': array without maxItems');
      if ((s.type === 'integer' || s.type === 'number') && s.maximum === undefined && s.minimum === undefined && /limit|count|top|max/i.test(where.split('.').pop())) W(where + ': a count without a maximum');
    });
    for (const [k, v] of Object.entries(sc.properties || {})) if (/^(limit)$/.test(k) && v.maximum === undefined) E('arguments.limit needs a maximum');
    if (/_(list|find)$/.test(name) && !(sc.properties && sc.properties.limit && (sc.properties.offset || sc.properties.cursor)) && def.paged !== false) W('a list tool should take limit and offset');
  }

  const bare = name;
  if (UNTRUSTED_NAME.test(bare) && !NUMBERS_ONLY.has(bare) && !OWN_TEXT.has(bare) && def.group === 'read' && !def.untrusted) W('may return text from a file: declare untrusted: true (rule 36)');

  let preview = 'n/a';
  if (def.group && def.group !== 'read') {
    const own = !!(sc && sc.properties && sc.properties.preview);
    preview = def.preview ? 'native' : own ? 'own' : def.dryRun ? 'dryrun' : def.rollbackPreview ? 'rollback' : def.previewTarget ? 'validate' : def.group === 'save' || def.group === 'export' ? 'validate-default' : 'none';
    if (preview === 'none') E(def.group + ' tool has no preview (preview(), rollbackPreview, previewTarget or its own preview argument)');
  }
  if (def.group === 'edit' && def.outputSchema === undefined) W('no outputSchema');
  return { errors, warnings, preview };
}

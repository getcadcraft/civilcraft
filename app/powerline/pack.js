/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/pack.js — rule set + library packs (0.7 PL.14; the requester of Track PL asked for "a per country set of rules and
 * libraries"). No DOM. A pack is one JSON file (`.cclinepack.json`): a rule set (load cases, limits, clearances, spacing) and a
 * library (conductors, cables, supports, equipment, trench types) that people make for their country, their network operator or
 * their company and share — by file, or as a data-only add-on listed on /addons?kind=linepack. Nothing tied to one country is
 * built into CivilCraft: a pack is the user's, and every pack says it is to be checked against the standard that applies.
 *
 *   PACK_FORMAT = 'cadcraft-line-pack', PACK_VERSION = 1
 *   writePack({ name, region, description, author, license, rules, items }) → the file's object (rules cleaned, items as cadcraft-lines)
 *   readPack(obj) (untrusted) → { ok, name, region, description, author, license, rules (cleanRules), items (readLibrary items), notes }
 *     ok = false (with notes[0].why) when it is not a pack; a plain rule set file (cadcraft-line-rules) or a plain library
 *     (cadcraft-lines) is read too: the part it lacks comes back empty (rules null / items [])
 *
 * file = { format, version, name, region (free text: a country, an operator, a company), description, author, license (SPDX id,
 *          default CC0-1.0), checkAgainst: the line every pack carries, rules, library: { format: 'cadcraft-lines', … } }
 */

import { cleanRules } from './model.js';
import { readLibrary, libraryToJson } from './library.js';
import { t } from '../i18n.js';

export const PACK_FORMAT = 'cadcraft-line-pack';
export const PACK_VERSION = 1;
const str = (v, max = 200) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '');
const spdx = (v) => (typeof v === 'string' && /^[A-Za-z0-9.+-]{1,40}$/.test(v) ? v : 'CC0-1.0');

export function writePack({ name, region, description, author, license, rules, items } = {}) {
  return {
    format: PACK_FORMAT, version: PACK_VERSION, name: str(name, 80) || t('pl.pack.unnamed'), region: str(region, 80), description: str(description, 1000),
    author: str(author, 80), license: spdx(license), checkAgainst: t('pl.pack.check'),
    rules: cleanRules(rules), library: libraryToJson(Array.isArray(items) ? items : [], { name: str(name, 80) }),
  };
}

export function readPack(obj) {
  const notes = [];
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, notes: [{ why: t('pl.pack.notpack') }] };
  if (obj.format === PACK_FORMAT) {
    if (obj.version !== PACK_VERSION) return { ok: false, notes: [{ why: t('pl.pack.version', { v: String(obj.version) }) }] };
    const lib = obj.library ? readLibrary(obj.library) : { items: [], notes: [] };
    notes.push(...(lib.notes || []));
    return { ok: true, name: str(obj.name, 80) || t('pl.pack.unnamed'), region: str(obj.region, 80), description: str(obj.description, 1000),
      author: str(obj.author, 80), license: spdx(obj.license), rules: obj.rules ? cleanRules(obj.rules) : null, items: lib.items || [], notes };
  }
  if (obj.format === 'cadcraft-line-rules' || (obj.cases && obj.clearances)) {
    const rules = cleanRules(obj.rules || obj);
    return { ok: true, name: rules.name, region: '', description: '', author: '', license: 'CC0-1.0', rules, items: [], notes };
  }
  if (obj.format === 'cadcraft-lines') {
    const lib = readLibrary(obj);
    return { ok: true, name: str(obj.name, 80) || t('pl.pack.unnamed'), region: '', description: str(obj.description, 1000), author: '', license: 'CC0-1.0', rules: null, items: lib.items || [], notes: lib.notes || [] };
  }
  return { ok: false, notes: [{ why: t('pl.pack.notpack') }] };
}

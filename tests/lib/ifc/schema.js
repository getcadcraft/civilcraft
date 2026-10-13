/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library. */
/**
 * schema.js — the IFC schemas cc-ifc knows (tables generated from buildingSMART's EXPRESS files by
 * tools/ifc-test/gen-schema.mjs) as lookups: entity → every explicit attribute in file order (supertypes first),
 * subtype tests, and the numeric type codes the apps use as constants.
 *
 *   const s = schemaFor('IFC4')            IFC2X3 | IFC4 | IFC4X3 (any IFC4X3_* name) → Schema; unknown → IFC4 with s.guessed
 *   s.entity('IFCWALL')                     → { name 'IfcWall', upper, code, parent, abstract, attrs [{ name, t }], derived Set }
 *   s.isA('IFCWALLSTANDARDCASE', 'IFCWALL') → true
 *   s.subtypes('IFCWALL')                   → ['IFCWALL', 'IFCWALLELEMENTEDCASE', 'IFCWALLSTANDARDCASE']
 *   s.typeCode('IFCLENGTHMEASURE')          → 'r'  (attribute type codes: see gen-schema.mjs)
 *   typeCode(name) / nameOfCode(code)       → CRC-32 of the upper-case name (the same numbers as the web-ifc API uses for
 *                                              its constants, so code written against it keeps working) and back
 *   CONSTANTS                               → { IFCWALL: 2391406946, …, FILE_NAME: …, … } for every name in any schema
 *
 * Attribute codes are parsed once into { agg (levels), base (E S e s r i n b l x), tname (defined type or null), opt }.
 */

import IFC2X3 from './schema-ifc2x3.js';
import IFC4 from './schema-ifc4.js';
import IFC4X3 from './schema-ifc4x3.js';

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
export function crc32(str) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < str.length; i++) c = CRC[(c ^ str.charCodeAt(i)) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

const CODE_NAME = new Map();
export function typeCode(name) {
  const up = String(name).toUpperCase();
  const c = crc32(up);
  if (!CODE_NAME.has(c)) CODE_NAME.set(c, up);
  return c;
}
export function nameOfCode(code) { return CODE_NAME.get(code) ?? null; }

export function parseAttrCode(t) {
  let agg = 0, i = 0;
  while (t[i] === '[') { agg++; i++; }
  const opt = t.endsWith('?');
  const body = t.slice(i, opt ? -1 : undefined);
  const k = body.indexOf(':');
  return { agg, base: k < 0 ? body : body.slice(0, k), tname: k < 0 ? null : body.slice(k + 1), opt };
}

class Schema {
  constructor(table, name) {
    this.name = name;
    this.source = table.source;
    this.table = table;
    this.ents = new Map();
    this.children = new Map();
    for (const [up, e] of Object.entries(table.ent)) {
      if (e[1]) { if (!this.children.has(e[1])) this.children.set(e[1], []); this.children.get(e[1]).push(up); }
      typeCode(up);
    }
    for (const up of Object.keys(table.typ)) typeCode(up);
    this.subCache = new Map();
  }

  has(up) { return up in this.table.ent; }

  entity(up) {
    let e = this.ents.get(up);
    if (e !== undefined) return e;
    const row = this.table.ent[up];
    if (!row) { this.ents.set(up, null); return null; }
    const parent = row[1] ? this.entity(row[1]) : null;
    const own = row[3] ? row[3].split(';').map((s) => { const [n, t] = s.split('|'); return { name: n, t: parseAttrCode(t) }; }) : [];
    const derived = new Set([...(parent ? parent.derived : []), ...(row[4] ? row[4].split(';') : [])]);
    e = { name: row[0], upper: up, code: typeCode(up), parent: row[1] || null, abstract: !!row[2], attrs: [...(parent ? parent.attrs : []), ...own], derived };
    e.index = new Map(e.attrs.map((a, k) => [a.name, k]));
    this.ents.set(up, e);
    return e;
  }

  /** Is `up` the entity `ancestor` or one of its subtypes? */
  isA(up, ancestor) {
    let row = this.table.ent[up];
    while (row) {
      if (up === ancestor) return true;
      up = row[1];
      row = up ? this.table.ent[up] : null;
    }
    return false;
  }

  /** `up` and every entity under it. */
  subtypes(up) {
    let s = this.subCache.get(up);
    if (s) return s;
    s = [];
    const walk = (n) => { s.push(n); for (const c of this.children.get(n) || []) walk(c); };
    if (this.has(up)) walk(up);
    this.subCache.set(up, s);
    return s;
  }

  /** A defined type's underlying code ('r', 's', '[r', 'e', 'S', …) or null. */
  typeCode(up) { const t = this.table.typ[up]; return t ? t[1] : null; }
  typeName(up) { const t = this.table.typ[up]; return t ? t[0] : null; }
  selectMembers(up) { const t = this.table.typ[up]; return t && t[1] === 'S' ? t[2].split(';') : []; }
  /** Is a value of defined type `up` written as a REAL? */
  isRealType(up) { const c = this.typeCode(up); return c ? /^\[*[rn]$/.test(c) : false; }

  /** "IfcWall" for "IFCWALL" (entities and types); null when unknown. */
  pretty(up) { const e = this.table.ent[up]; if (e) return e[0]; const t = this.table.typ[up]; return t ? t[0] : null; }
}

const SCHEMAS = new Map();

export function schemaFor(fileSchema) {
  const raw = String(fileSchema || '').toUpperCase().trim();
  let key = 'IFC4', guessed = false;
  if (/^IFC2X3/.test(raw)) key = 'IFC2X3';
  else if (/^IFC4X3/.test(raw)) key = 'IFC4X3';
  else if (/^IFC4/.test(raw)) key = 'IFC4';
  else guessed = true;
  let s = SCHEMAS.get(key);
  if (!s) {
    s = new Schema(key === 'IFC2X3' ? IFC2X3 : key === 'IFC4X3' ? IFC4X3 : IFC4, key);
    SCHEMAS.set(key, s);
  }
  return guessed ? Object.assign(Object.create(s), { guessed: true }) : s;
}

/** Every entity and type name of every schema → its code, plus the header entities (web-ifc's constants shape). */
export const CONSTANTS = (() => {
  const out = {};
  for (const t of [IFC2X3, IFC4, IFC4X3]) {
    for (const up of Object.keys(t.ent)) out[up] = typeCode(up);
    for (const up of Object.keys(t.typ)) out[up] = typeCode(up);
  }
  for (const h of ['FILE_DESCRIPTION', 'FILE_NAME', 'FILE_SCHEMA']) out[h] = typeCode(h);
  return out;
})();

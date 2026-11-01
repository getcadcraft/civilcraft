/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ids is a standalone library; its issues are codes + English text (an app translates what it shows). */
/**
 * ids.js — reads a buildingSMART IDS 1.0 file (Information Delivery Specification, http://standards.buildingsmart.org/IDS)
 * into plain data and audits what the checker relies on. DOM-free; the only import is cc-ifc's schema tables (../ifc/,
 * beside this folder in every app that has cc-ids), for the class, attribute and data type names.
 *
 *   readIds(text) → ids   (throws IdsError when it is not an IDS file at all; smaller faults are ids.issues)
 *   ids = {
 *     info: { title, copyright, version, description, author, date, purpose, milestone },
 *     specs: [{ index, name, identifier, description, instructions, ifcVersion: ['IFC4', …],
 *               cardinality: 'required' | 'optional' | 'prohibited'   (applicability minOccurs / maxOccurs: 1/∞, 0/∞, 0/0),
 *               applicability: [facet], requirements: [facet] }],
 *     issues: [{ code, spec (index or -1), vars, text }] what an IDS audit would refuse (the check still runs; such a
 *   }                                                    specification simply fails, as the IDS test cases expect)
 *   facet = { kind: 'entity' | 'attribute' | 'property' | 'classification' | 'material' | 'partOf', cardinality, instructions, … }
 *     entity:          name, predefinedType                        (parameters: values.js shapes)
 *     attribute:       name, value
 *     property:        propertySet, baseName, value, dataType (upper case text), uri
 *     classification:  system, value, uri
 *     material:        value, uri
 *     partOf:          relation ('IFCRELAGGREGATES' | 'IFCRELASSIGNSTOGROUP' | 'IFCRELCONTAINEDINSPATIALSTRUCTURE' | 'IFCRELNESTS' |
 *                      'IFCRELVOIDSELEMENT IFCRELFILLSELEMENT' | ''), entity: { name, predefinedType }
 *   Older 0.9 files (minOccurs / maxOccurs on facets and on <specification>, use="…") are read too.
 *
 *   facetText(facet) → a short notation of what a facet asks: 'IFCWALL [SOLIDWALL]', 'Pset_WallCommon.FireRating (IFCLABEL) = 2HR'
 *   idsHash(text) → 'cc53-…' a stable 53-bit hash of the file's text (the apps remember which IDS a project was checked with)
 */

import { parseXml, kid, kids } from './xml.js';
import { xsdRegExp } from './xsd-regex.js';
import { paramText, parseDouble, parseInteger } from './values.js';
import { schemaFor } from '../ifc/schema.js';

export class IdsError extends Error { constructor(message) { super(message); this.name = 'IdsError'; } }

export const IFC_VERSIONS = ['IFC2X3', 'IFC4', 'IFC4X3_ADD2'];
export const RELATIONS = ['IFCRELAGGREGATES', 'IFCRELASSIGNSTOGROUP', 'IFCRELCONTAINEDINSPATIALSTRUCTURE', 'IFCRELNESTS', 'IFCRELVOIDSELEMENT IFCRELFILLSELEMENT'];
const BASES = { string: 'string', normalizedString: 'string', token: 'string', boolean: 'boolean', double: 'double', decimal: 'double', float: 'double',
  integer: 'integer', int: 'integer', long: 'integer', nonNegativeInteger: 'integer', positiveInteger: 'integer', date: 'date', dateTime: 'dateTime', time: 'time', duration: 'duration', anyURI: 'string' };

const textOf = (el) => (el ? el.text.trim() : '');

/** <x><simpleValue>…</simpleValue></x> or <x><xs:restriction …/></x> → a parameter (values.js), or null when the element is absent. */
export function readParam(el, issues, spec) {
  if (!el) return null;
  const sv = kid(el, 'simpleValue');
  const rs = kids(el, 'restriction');
  if (sv && !rs.length) return { simple: sv.text };   // simpleValue text is kept exactly (IDS compares case and spaces)
  if (!rs.length) {
    if (el.children.length === 0 && el.text.trim()) return { simple: el.text };   // lenient: bare text
    issues.push({ code: 'param.empty', spec, vars: { el: el.local }, text: '<' + el.local + '> has no simpleValue or restriction' });
    return { error: 'empty' };
  }
  const p = { base: 'string', enumeration: [], patterns: [] };
  for (const r of rs) {
    const b = String(r.attrs.base || 'xs:string').replace(/^[A-Za-z]+:/, '');
    p.base = BASES[b] || 'string';
    for (const c of r.children) {
      const v = c.attrs.value;
      if (v === undefined) continue;
      switch (c.local) {
        case 'enumeration': p.enumeration.push(v); break;
        case 'pattern': {
          const x = { source: v, rx: null, error: '' };
          try { x.rx = xsdRegExp(v); } catch (e) { x.error = e.message; p.error = 'pattern'; issues.push({ code: 'pattern', spec, vars: { p: v, why: e.message }, text: 'The pattern "' + v + '" is not a valid XSD pattern: ' + e.message }); }
          p.patterns.push(x);
          break;
        }
        case 'minInclusive': case 'maxInclusive': case 'minExclusive': case 'maxExclusive':
          if (parseDouble(v) === null && !/^(date|dateTime|time|duration)$/.test(p.base)) issues.push({ code: 'bound', spec, vars: { k: c.local, v }, text: 'The bound ' + c.local + '="' + v + '" is not a number' });
          p[c.local] = v; break;
        case 'length': case 'minLength': case 'maxLength': {
          const n = parseInteger(v);
          if (n === null || n < 0) { issues.push({ code: 'length', spec, vars: { k: c.local, v }, text: c.local + '="' + v + '" is not a whole number' }); p.error = 'length'; } else p[c.local] = n;
          break;
        }
        case 'annotation': break;
        default: issues.push({ code: 'restriction', spec, vars: { k: c.local }, text: 'xs:' + c.local + ' is not supported in IDS' });
      }
    }
  }
  return p;
}

function cardinalityOf(el) {
  const c = el.attrs.cardinality;
  if (c === 'required' || c === 'optional' || c === 'prohibited') return c;
  // IDS 0.9: minOccurs / maxOccurs (or use="…") on the facet
  if (el.attrs.use) return el.attrs.use === 'prohibited' ? 'prohibited' : el.attrs.use === 'optional' ? 'optional' : 'required';
  if (el.attrs.maxOccurs === '0') return 'prohibited';
  if (el.attrs.minOccurs === '0') return 'optional';
  return 'required';
}

function readFacet(el, issues, spec, inRequirements) {
  const base = { kind: el.local, cardinality: inRequirements ? cardinalityOf(el) : 'required', instructions: el.attrs.instructions || '' };
  switch (el.local) {
    case 'entity':
      return { ...base, cardinality: 'required', name: readParam(kid(el, 'name'), issues, spec), predefinedType: readParam(kid(el, 'predefinedType'), issues, spec) };
    case 'attribute':
      return { ...base, name: readParam(kid(el, 'name'), issues, spec), value: readParam(kid(el, 'value'), issues, spec) };
    case 'property':
      return { ...base, propertySet: readParam(kid(el, 'propertySet'), issues, spec), baseName: readParam(kid(el, 'baseName') || kid(el, 'name'), issues, spec),
        value: readParam(kid(el, 'value'), issues, spec), dataType: el.attrs.dataType || el.attrs.datatype || '', uri: el.attrs.uri || '' };
    case 'classification':
      return { ...base, system: readParam(kid(el, 'system'), issues, spec), value: readParam(kid(el, 'value'), issues, spec), uri: el.attrs.uri || '' };
    case 'material':
      return { ...base, value: readParam(kid(el, 'value'), issues, spec), uri: el.attrs.uri || '' };
    case 'partOf': {
      const e = kid(el, 'entity');
      return { ...base, relation: el.attrs.relation || '', entity: e ? { name: readParam(kid(e, 'name'), issues, spec), predefinedType: readParam(kid(e, 'predefinedType'), issues, spec) } : null };
    }
    default:
      issues.push({ code: 'facet', spec, vars: { k: el.local }, text: 'Unknown facet <' + el.local + '>' });
      return null;
  }
}

/** The IDS file's text → ids (see the header). */
export function readIds(text) {
  let root;
  try { root = parseXml(text); } catch (e) { throw new IdsError('This is not an XML file: ' + e.message); }
  if (root.local !== 'ids') throw new IdsError('This is not an IDS file (its root element is <' + root.name + '>, not <ids>)');
  const issues = [];
  const infoEl = kid(root, 'info');
  const info = {};
  for (const k of ['title', 'copyright', 'version', 'description', 'author', 'date', 'purpose', 'milestone']) info[k] = textOf(kid(infoEl, k));
  if (!info.title) issues.push({ code: 'info.title', spec: -1, text: 'The IDS has no title' });
  const specs = [];
  for (const sEl of kids(kid(root, 'specifications'), 'specification')) {
    const index = specs.length;
    const app = kid(sEl, 'applicability');
    const req = kid(sEl, 'requirements');
    // applicability minOccurs / maxOccurs (IDS 1.0); IDS 0.9 put them on <specification> (or use="…")
    const holder = app && (app.attrs.minOccurs !== undefined || app.attrs.maxOccurs !== undefined) ? app : sEl;
    const min = holder.attrs.minOccurs ?? (sEl.attrs.use === 'optional' ? '0' : sEl.attrs.use === 'prohibited' ? '0' : '1');
    const max = holder.attrs.maxOccurs ?? (sEl.attrs.use === 'prohibited' ? '0' : 'unbounded');
    const cardinality = max === '0' ? 'prohibited' : min === '0' ? 'optional' : 'required';
    if (!(min === '0' || min === '1') || !(max === '0' || max === 'unbounded') || (min === '1' && max === '0')) issues.push({ code: 'occurs', spec: index, vars: { min, max }, text: 'minOccurs="' + min + '" maxOccurs="' + max + '" is not one of the three allowed pairs' });
    const ifcVersion = String(sEl.attrs.ifcVersion || '').split(/\s+/).filter(Boolean).map((v) => v.toUpperCase());
    const spec = {
      index, name: sEl.attrs.name || '', identifier: sEl.attrs.identifier || '', description: sEl.attrs.description || '', instructions: sEl.attrs.instructions || '',
      ifcVersion, cardinality,
      applicability: app ? app.children.map((f) => readFacet(f, issues, index, false)).filter(Boolean) : [],
      requirements: req ? req.children.map((f) => readFacet(f, issues, index, true)).filter(Boolean) : [],
      requirementsDescription: req ? req.attrs.description || '' : '',
    };
    audit(spec, issues);
    specs.push(spec);
  }
  if (!specs.length) issues.push({ code: 'specs', spec: -1, text: 'The IDS has no specifications' });
  return { info, specs, issues };
}

/** What the IDS audit tool would refuse in one specification (names checked against the schemas the specification names). */
function audit(spec, issues) {
  const i = spec.index;
  if (!spec.ifcVersion.length) issues.push({ code: 'version', spec: i, text: 'The specification names no IFC version' });
  for (const v of spec.ifcVersion) if (!IFC_VERSIONS.includes(v) && v !== 'IFC4X3') issues.push({ code: 'version.unknown', spec: i, vars: { v }, text: 'Unknown IFC version ' + v });
  if (!spec.applicability.length) issues.push({ code: 'applicability', spec: i, text: 'The specification has no applicability' });
  if (spec.cardinality === 'prohibited' && spec.requirements.length) issues.push({ code: 'prohibited.requirements', spec: i, text: 'A prohibited specification cannot have requirements' });
  const schemas = (spec.ifcVersion.length ? spec.ifcVersion : ['IFC4']).map((v) => schemaFor(v));
  const known = (n) => schemas.some((s) => s.has(n) || s.has(n + 'TYPE') || s.has(n + 'STYLE'));
  const checkEntity = (e) => {
    if (!e || !e.name) { issues.push({ code: 'entity.name', spec: i, text: 'An entity facet has no name' }); return; }
    if (e.name.simple !== undefined) {
      const n = e.name.simple;
      if (n !== n.toUpperCase()) issues.push({ code: 'entity.case', spec: i, vars: { n }, text: 'IFC classes are written in upper case: ' + n });
      else if (!known(n)) issues.push({ code: 'entity.unknown', spec: i, vars: { n, v: spec.ifcVersion.join(', ') }, text: n + ' is not an IFC class in ' + spec.ifcVersion.join(', ') });
    }
  };
  const ent = spec.applicability.find((f) => f.kind === 'entity');
  for (const f of [...spec.applicability, ...spec.requirements]) {
    if (f.kind === 'entity') checkEntity(f);
    else if (f.kind === 'partOf') {
      if (f.relation && !RELATIONS.includes(f.relation)) issues.push({ code: 'partof.relation', spec: i, vars: { n: f.relation }, text: 'Unknown partOf relation ' + f.relation });
      checkEntity(f.entity);
    } else if (f.kind === 'property') {
      if (!f.propertySet || !f.baseName) issues.push({ code: 'property.names', spec: i, text: 'A property facet needs a propertySet and a baseName' });
      if (f.value && !f.dataType) issues.push({ code: 'property.datatype.missing', spec: i, text: 'A property value needs a dataType' });
      if (f.dataType && !schemas.some((s) => s.typeCode(f.dataType) !== null || s.has(f.dataType))) issues.push({ code: 'property.datatype', spec: i, vars: { n: f.dataType, v: spec.ifcVersion.join(', ') }, text: f.dataType + ' is not an IFC data type in ' + spec.ifcVersion.join(', ') });
    } else if (f.kind === 'attribute') {
      if (!f.name) issues.push({ code: 'attribute.name', spec: i, text: 'An attribute facet has no name' });
      else if (f.name.simple !== undefined && ent?.name?.simple !== undefined) {
        const cls = ent.name.simple, att = f.name.simple;
        const has = schemas.some((s) => { const e = s.entity(cls) || s.entity(cls + 'TYPE'); return e && e.index.has(att) && !e.derived.has(att); });
        if (!has && known(cls)) issues.push({ code: 'attribute.unknown', spec: i, vars: { n: att, cls }, text: att + ' is not an attribute of ' + cls });
      }
    } else if (f.kind === 'classification') {
      if (f.cardinality === 'optional' && !f.value && !f.system) issues.push({ code: 'facet.optional', spec: i, text: 'An optional classification facet needs a value' });
    }
  }
}

const nameOf = (p) => paramText(p);

/** What a facet asks for, in notation (the file's own names and values; no words). */
export function facetText(f) {
  if (!f) return '';
  switch (f.kind) {
    case 'entity': return nameOf(f.name) + (f.predefinedType ? ' [' + nameOf(f.predefinedType) + ']' : '');
    case 'attribute': return nameOf(f.name) + (f.value ? ' = ' + nameOf(f.value) : '');
    case 'property': return nameOf(f.propertySet) + '.' + nameOf(f.baseName) + (f.dataType ? ' (' + f.dataType + ')' : '') + (f.value ? ' = ' + nameOf(f.value) : '');
    case 'classification': return (f.system ? nameOf(f.system) : '*') + (f.value ? ' ' + nameOf(f.value) : '');
    case 'material': return f.value ? nameOf(f.value) : '*';
    case 'partOf': return (f.relation ? f.relation + ' ' : '') + (f.entity ? facetText({ kind: 'entity', ...f.entity }) : '');
    default: return '';
  }
}

/** A stable 53-bit hash of the text (record.js): 'cc53-' + 14 hex digits. */
export { idsHash } from './record.js';

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * validate.js — checks attribute values against the schemas a file imports or carries (SU.882). The rules are the ones the
 * schema source states (IfcxValueDescription): dataType Real / Boolean / Integer / String / DateTime / Enum / Array / Object /
 * Reference / Blob; enumRestrictions.options; arrayRestrictions { min, max, value }; objectRestrictions.values; optional.
 *
 *   validateValue(value, description, where?) → issues      description = a schema's `value`
 *   validateNode(attributes, schemas, path?) → issues       schemas = Map or object: attribute name → { value }
 *
 * Issues: { level: 'error' | 'warning', code, path, attribute, where, vars }. `where` is the way down inside the value
 * ("segments[2].ref"). Codes: ifcx.val.type, enum, min, max, missing, extra, null, unknown (an attribute no schema describes —
 * a warning, never a reason to drop it).
 * Our reading where the source is silent: min / max bound an array's LENGTH; a Real accepts any finite number; DateTime is a
 * string Date.parse understands; Reference and Blob are strings; `inherits` in a description is kept, not applied.
 */
import { isObj } from './util.js';

const TYPES = ['Real', 'Boolean', 'Integer', 'String', 'DateTime', 'Enum', 'Array', 'Object', 'Reference', 'Blob'];
const kind = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);

export function validateValue(value, desc, where = '', out = [], base = {}) {
  const push = (level, code, vars = {}) => out.push({ level, code, ...base, where, vars });
  if (!isObj(desc) || !TYPES.includes(desc.dataType)) { push('warning', 'ifcx.val.bad-schema', { type: String(desc && desc.dataType) }); return out; }
  const bad = (expected) => push('error', 'ifcx.val.type', { expected, got: kind(value) });
  switch (desc.dataType) {
    case 'Real': if (typeof value !== 'number' || !Number.isFinite(value)) bad('Real'); break;
    case 'Integer': if (!Number.isInteger(value)) bad('Integer'); break;
    case 'Boolean': if (typeof value !== 'boolean') bad('Boolean'); break;
    case 'String': case 'Reference': case 'Blob': if (typeof value !== 'string') bad(desc.dataType); break;
    case 'DateTime': if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) bad('DateTime'); break;
    case 'Enum': {
      if (typeof value !== 'string') { bad('Enum'); break; }
      const opts = desc.enumRestrictions && Array.isArray(desc.enumRestrictions.options) ? desc.enumRestrictions.options : null;
      if (opts && !opts.includes(value)) push('error', 'ifcx.val.enum', { value: value.slice(0, 60), options: opts.slice(0, 12).join(', ') });
      break;
    }
    case 'Array': {
      if (!Array.isArray(value)) { bad('Array'); break; }
      const r = desc.arrayRestrictions || {};
      if (typeof r.min === 'number' && value.length < r.min) push('error', 'ifcx.val.min', { min: r.min, n: value.length });
      if (typeof r.max === 'number' && value.length > r.max) push('error', 'ifcx.val.max', { max: r.max, n: value.length });
      if (isObj(r.value)) {
        // a long numeric array: the first bad element is enough, one issue per array
        const before = out.length;
        for (let i = 0; i < value.length && out.length === before; i++) validateValue(value[i], r.value, `${where}[${i}]`, out, base);
      }
      break;
    }
    case 'Object': {
      if (!isObj(value)) { bad('Object'); break; }
      const vals = desc.objectRestrictions && isObj(desc.objectRestrictions.values) ? desc.objectRestrictions.values : null;
      if (!vals) break;
      for (const [k, d] of Object.entries(vals)) {
        const w = where ? `${where}.${k}` : k;
        if (!(k in value)) { if (!(isObj(d) && d.optional === true)) push('error', 'ifcx.val.missing', { key: w }); continue; }
        if (value[k] === null && isObj(d) && d.optional === true) continue;
        validateValue(value[k], d, w, out, base);
      }
      for (const k of Object.keys(value)) if (!(k in vals)) out.push({ level: 'warning', code: 'ifcx.val.extra', ...base, where, vars: { key: where ? `${where}.${k}` : k } });
      break;
    }
    default: break;
  }
  return out;
}

export function validateNode(attributes, schemas, path = '') {
  const out = [];
  if (!attributes) return out;
  const get = (n) => (schemas instanceof Map ? schemas.get(n) : schemas[n]);
  for (const [name, value] of Object.entries(attributes)) {
    const s = get(name);
    const base = { path, attribute: name };
    if (!s) { out.push({ level: 'warning', code: 'ifcx.val.unknown', ...base, where: '', vars: {} }); continue; }
    const desc = s.value || s;
    if (value === null) { out.push({ level: 'error', code: 'ifcx.val.null', ...base, where: '', vars: {} }); continue; }
    validateValue(value, desc, '', out, base);
    if (desc.quantityKind && !(typeof value === 'number')) { /* the type error above says it */ }
  }
  return out;
}

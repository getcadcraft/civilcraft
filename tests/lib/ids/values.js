/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ids is a standalone library; notation only (symbols and the file's own values), no sentences. */
/**
 * values.js — IDS facet parameters (simpleValue or xs:restriction) and how an IFC value is compared with one (IDS 1.0:
 * Documentation/ImplementersDocumentation/DataTypes.md and tolerance.md, UserManual/restrictions.md). DOM-free.
 *
 *   A parameter:  { simple: 'text' }   or   { base: 'string'|'double'|…, enumeration: [text], patterns: [{ source, rx, error }],
 *                 minInclusive, maxInclusive, minExclusive, maxExclusive (text), length, minLength, maxLength (whole numbers) }
 *   An IFC value: { kind: 'string'|'enum'|'real'|'integer'|'boolean'|'logical'|'list'|'ref'|'select'|'binary', v, type }
 *                 (type = the IFC defined type in upper case when the file names one: 'IFCLABEL', 'IFCLENGTHMEASURE')
 *
 *   matchValue(param, value) → bool        the IDS comparison: strings case-sensitively; numbers cast from the IDS text
 *                                           (xs:double / xs:integer syntax) and compared with the 1e-6 tolerance; bounds exact;
 *                                           booleans only "true" / "false" (and XSD's 1 / 0); patterns only on text
 *   matchName(param, text) → bool          the same for names (entity, attribute, property set, property, system, material)
 *   restrictionHasBounds(param) · paramText(param) → '2HR', 'A | B', '/WT[0-9]{2}/', '> 0, ≤ 10', '|x| = 2'   (notation)
 *   valueText(value) → the value as written (numbers as JS writes them)
 *   parseDouble(text) · parseInteger(text) → number | null   (IDS lexical rules)
 */

export const EPS = 1e-6;
const DOUBLE = /^([-+]?(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:[eE][-+]?[0-9]+)?|NaN|\+?INF|-INF)$/;
const INTEGER = /^[+-]?[0-9]+$/;

/** IDS text → number by xs:double rules ("42", "42.", "1.2345e3"; never "42,3"); null when it is not one. */
export function parseDouble(s) {
  const t = String(s ?? '').trim();
  if (!DOUBLE.test(t)) return null;
  if (t === 'NaN') return NaN;
  if (t === 'INF' || t === '+INF') return Infinity;
  if (t === '-INF') return -Infinity;
  const x = Number(t);
  return Number.isNaN(x) ? null : x;
}
/** IDS text → whole number by xs:integer rules ("42"; never "42.0"); null when it is not one. */
export function parseInteger(s) {
  const t = String(s ?? '').trim();
  return INTEGER.test(t) ? Number(t) : null;
}

/** x equals v within the IDS tolerance: (v − |v|·ε − ε) ≤ x ≤ (v + |v|·ε + ε), ε = 1e-6 (tolerance.md; the edges kept). */
export function nearlyEqual(x, v) {
  if (!Number.isFinite(v) || !Number.isFinite(x)) return x === v;
  const d = Math.abs(v) * EPS + EPS;
  const lo = v - d, hi = v + d;
  // compare with a hair of slack in the last bits, so a value written exactly on the edge (0.999998 for 1) counts as inside
  const slack = Math.max(Math.abs(lo), Math.abs(hi)) * 4 * Number.EPSILON;
  return x >= lo - slack && x <= hi + slack;
}

const isText = (val) => val && (val.kind === 'string' || val.kind === 'enum');
const isNum = (val) => val && (val.kind === 'real' || val.kind === 'integer');

/** One IDS text against one IFC value, cast to the value's own type (simpleValue and xs:enumeration items). */
function equalsText(text, val) {
  if (!val) return false;
  const s = String(text);
  switch (val.kind) {
    case 'string': case 'enum': return val.v === s;
    case 'real': { const x = parseDouble(s); return x !== null && nearlyEqual(val.v, x); }
    case 'integer': { const x = parseInteger(s); return x !== null && val.v === x; }
    case 'boolean': return (s === 'true' || s === '1') ? val.v === true : (s === 'false' || s === '0') ? val.v === false : false;
    case 'logical': return val.v === 'unknown' ? false : (s === 'true' || s === '1') ? val.v === true : (s === 'false' || s === '0') ? val.v === false : false;
    default: return false;   // lists, references, selects: a value check always fails (IDS: "value checks always fail for …")
  }
}

export const restrictionHasBounds = (p) => !!p && !p.simple && ['minInclusive', 'maxInclusive', 'minExclusive', 'maxExclusive'].some((k) => p[k] !== undefined);
const hasLength = (p) => ['length', 'minLength', 'maxLength'].some((k) => p[k] !== undefined);

/** Does the IFC value meet the IDS parameter? A missing parameter is met by anything. */
export function matchValue(p, val) {
  if (!p) return true;
  if (p.simple !== undefined) return equalsText(p.simple, val);
  if (p.error) return false;   // a restriction that could not be read never matches
  if (p.enumeration && p.enumeration.length && !p.enumeration.some((e) => equalsText(e, val))) return false;
  if (p.patterns && p.patterns.length) {
    if (!isText(val)) return false;   // patterns only work on text (IDS: "patterns always fail on any number")
    if (!p.patterns.some((x) => x.rx && x.rx.test(String(val.v)))) return false;
  }
  if (restrictionHasBounds(p)) {
    if (!isNum(val)) return false;
    const x = val.v;
    const b = (k) => { const n = parseDouble(p[k]); return n === null ? NaN : n; };
    if (p.minInclusive !== undefined && !(x >= b('minInclusive'))) return false;   // tolerance never applies to ranges
    if (p.maxInclusive !== undefined && !(x <= b('maxInclusive'))) return false;
    if (p.minExclusive !== undefined && !(x > b('minExclusive'))) return false;
    if (p.maxExclusive !== undefined && !(x < b('maxExclusive'))) return false;
  }
  if (hasLength(p)) {
    if (!isText(val)) return false;
    const n = [...String(val.v)].length;
    if (p.length !== undefined && n !== p.length) return false;
    if (p.minLength !== undefined && n < p.minLength) return false;
    if (p.maxLength !== undefined && n > p.maxLength) return false;
  }
  return true;
}

/** A name (class, attribute, property set, property, system, material) against the parameter. */
export const matchName = (p, text) => (p ? text !== null && text !== undefined && matchValue(p, { kind: 'string', v: String(text) }) : true);

/** The parameter in notation (no words): what the IDS asks for. */
export function paramText(p) {
  if (!p) return '';
  if (p.simple !== undefined) return p.simple;
  const parts = [];
  if (p.enumeration && p.enumeration.length) parts.push(p.enumeration.join(' | '));
  if (p.patterns && p.patterns.length) parts.push(p.patterns.map((x) => '/' + x.source + '/').join(' | '));
  const bounds = [];
  if (p.minExclusive !== undefined) bounds.push('> ' + p.minExclusive);
  if (p.minInclusive !== undefined) bounds.push('≥ ' + p.minInclusive);
  if (p.maxExclusive !== undefined) bounds.push('< ' + p.maxExclusive);
  if (p.maxInclusive !== undefined) bounds.push('≤ ' + p.maxInclusive);
  if (bounds.length) parts.push(bounds.join(', '));
  if (p.length !== undefined) parts.push('|x| = ' + p.length);
  if (p.minLength !== undefined || p.maxLength !== undefined) parts.push([p.minLength !== undefined ? p.minLength + ' ≤' : '', '|x|', p.maxLength !== undefined ? '≤ ' + p.maxLength : ''].filter(Boolean).join(' '));
  return parts.join('; ');
}

/** An IFC value as text for the report ("2HR", "0.25", "true", "unknown", "[3 items]" never: lists are joined). */
export function valueText(val) {
  if (!val) return '';
  switch (val.kind) {
    case 'string': case 'enum': return String(val.v);
    case 'real': case 'integer': return String(Math.round(val.v * 1e9) / 1e9);
    case 'boolean': return val.v ? 'true' : 'false';
    case 'logical': return val.v === 'unknown' ? 'unknown' : val.v ? 'true' : 'false';
    case 'list': return '(' + (val.v || []).map(valueText).join(', ') + ')';
    case 'ref': return '#' + val.v;
    default: return val.v === undefined || val.v === null ? '' : String(val.v);
  }
}

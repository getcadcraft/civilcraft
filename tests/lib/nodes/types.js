/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nodes is a standalone library; its errors are codes (the app words them, see words.js). */
/**
 * types.js — cc-nodes (0.8 round 3, nodes_PART_3; DC.54): the value types a node port can carry, the unit rule, and how a value is
 * recognised at run time. DOM-free.
 *
 * A VALUE is one of: a JS number · boolean · string · a point or vector (Float64Array(3), millimetres) · a curve and a surface (cc-nurbs
 * objects, millimetres) · a mesh ({ positions: Float64Array, indices: Uint32Array }) · a LIST (a plain Array of values). A point is a
 * typed array so a list of numbers and a point never get mixed up.
 *
 * PORT TYPES (a port says which): number, bool, text, point, vector, curve, surface, mesh, geometry (point | vector | curve | surface |
 * mesh), any. A port may also be a list (`list: true`), and an input may take several wires (`multi: true`, their values join in wire order).
 * UNITS: '' (a plain number), 'length' (millimetres), 'angle' (degrees), '*' (an input that takes any unit). A length never feeds an angle.
 */
export class NodeError extends Error { constructor(code, vars = {}) { super(code); this.code = code; this.vars = vars; } }
export const fail = (code, vars) => { throw new NodeError(code, vars); };

export const TYPES = Object.freeze(['number', 'bool', 'text', 'point', 'vector', 'curve', 'surface', 'mesh', 'geometry', 'any']);
export const UNITS = Object.freeze(['', 'length', 'angle', '*']);
const GEOM = new Set(['point', 'vector', 'curve', 'surface', 'mesh']);

export const vec = (x = 0, y = 0, z = 0) => Float64Array.of(x, y, z);
export const isVec = (v) => v instanceof Float64Array && v.length === 3;
export const isCurve = (v) => !!v && typeof v === 'object' && !Array.isArray(v) && Array.isArray(v.knots) && Array.isArray(v.cvs) && typeof v.deg === 'number';
export const isSurface = (v) => !!v && typeof v === 'object' && !Array.isArray(v) && Array.isArray(v.knotsU) && typeof v.degU === 'number';
export const isMesh = (v) => !!v && typeof v === 'object' && v.positions instanceof Float64Array && v.indices instanceof Uint32Array;

/** The type name of a run-time value ('list' for an Array). */
export function typeOf(v) {
  if (Array.isArray(v)) return 'list';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'boolean') return 'bool';
  if (typeof v === 'string') return 'text';
  if (isVec(v)) return 'point';
  if (isCurve(v)) return 'curve';
  if (isSurface(v)) return 'surface';
  if (isMesh(v)) return 'mesh';
  return 'unknown';
}

/** Can a port of type `from` feed a port of type `to`? (static; a point may feed a vector and back.) */
export function typeFits(from, to) {
  if (from === to || to === 'any' || from === 'any') return true;
  if (to === 'geometry') return GEOM.has(from);
  if (from === 'geometry') return GEOM.has(to);
  if ((from === 'point' && to === 'vector') || (from === 'vector' && to === 'point')) return true;
  if (from === 'number' && to === 'bool') return false;
  return false;
}

/** Does a run-time value (not a list) fit a port type? */
export function valueFits(v, type) {
  const t = typeOf(v);
  if (type === 'any') return t !== 'unknown';
  if (type === 'geometry') return GEOM.has(t);
  if (type === 'vector') return t === 'point';
  return t === type;
}

/** Can a unit feed a unit? A plain number feeds anything; '*' takes anything; otherwise they must be equal. */
export const unitFits = (from, to) => from === '' || to === '*' || from === to || from === '*';

/** The unit a node's output has, from the units wired into it. Throws on a mix that has no meaning (a length plus an angle). */
export function resolveUnit(rule, inUnits) {
  if (rule === undefined || rule === '') return '';
  if (rule === 'length' || rule === 'angle') return rule;
  const real = inUnits.filter((u) => u && u !== '*');
  if (rule === '=') {   // the common unit of all inputs
    const set = [...new Set(real)];
    if (set.length > 1) fail('nodes.err.units', { a: set[0], b: set[1] });
    return set[0] || '';
  }
  if (rule === 'mul') {   // a unit times a plain number keeps its unit; two units would be an area, which nothing here handles
    if (real.length > 1) fail('nodes.err.units_mul', { a: real[0], b: real[1] });
    return real[0] || '';
  }
  if (rule === 'div') {   // length / length is a plain number; length / number is a length
    if (real.length === 2) { if (real[0] !== real[1]) fail('nodes.err.units', { a: real[0], b: real[1] }); return ''; }
    return real.length === 1 && inUnits[0] ? real[0] : '';
  }
  return '';
}

/** A deep copy of a value that is safe to keep (typed arrays kept as typed arrays). */
export function clone(v) {
  if (Array.isArray(v)) return v.map(clone);
  if (v instanceof Float64Array || v instanceof Uint32Array) return v.slice();
  if (v && typeof v === 'object') return JSON.parse(JSON.stringify(v));
  return v;
}

/** A short, deterministic text of a value for the node's read-out and for tests. */
export function brief(v) {
  const t = typeOf(v);
  const f = (x) => String(+(+x).toPrecision(6));
  if (t === 'number') return f(v);
  if (t === 'bool' || t === 'text') return String(v);
  if (t === 'point') return '(' + [...v].map(f).join(', ') + ')';
  if (t === 'curve') return 'curve ' + v.cvs.length + ' cv, degree ' + v.deg;
  if (t === 'surface') return 'surface ' + v.cvs.length + '×' + v.cvs[0].length + ' cv';
  if (t === 'mesh') return 'mesh ' + (v.indices.length / 3) + ' triangles';
  if (t === 'list') return 'list of ' + v.length;
  return '?';
}

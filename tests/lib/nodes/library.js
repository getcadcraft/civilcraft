/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nodes is a standalone library; node labels are `en` fields that words.js turns into keys. */
/**
 * library.js — cc-nodes (0.8 round 3, nodes_PART_3; DC.54): the nodes. Each node is ONE pure function over typed ports, and each is also a
 * CraftScript function `nd_<id>` (script.js registers them), so a graph and a script are the same thing written two ways.
 *
 *   def.id · cat · en (label) · ins [{ name, type, def, unit, list, multi, min, max, step, en, opt }] · outs [{ name, type, unit, list }]
 *   def.unit  the output unit rule ('' | 'length' | 'angle' | '=' | 'mul' | 'div'; see types.resolveUnit)
 *   def.run(a, ctx) → the value (one output) or { outName: value } (several). `a` holds the inputs by name; ctx = { N } (cc-nurbs).
 * Maths: textbook formulas only; geometry is cc-nurbs (The NURBS Book constructions). Angles are degrees at the ports.
 */
import * as N from '../nurbs/index.js';
import * as V from '../nurbs/vec.js';
import { vec, isVec, isCurve, isSurface, isMesh, typeOf, fail } from './types.js';
import { SOLID_NODES } from '../nurbs/nodes-solid.js';

const RAD = Math.PI / 180;
const arr = (p) => [p[0], p[1], p[2]];
const need = (cond, code, vars) => { if (!cond) fail(code, vars); };
const finite = (x, what) => { need(Number.isFinite(x), 'nodes.err.not_finite', { what }); return x; };

// ---- helpers ------------------------------------------------------------------------------------------------------------------
const i = (name, type, def, o = {}) => ({ name, type, def, unit: '', ...o });
const o = (name, type, unit = '', extra = {}) => ({ name, type, unit, ...extra });
export const LIBRARY = [];
const node = (id, cat, en, ins, outs, run, unit = '', extra = {}) => LIBRARY.push({ id, cat, en, ins, outs, run, unit, ...extra });
const one = (id, cat, en, ins, out, run, unit = '', extra = {}) => node(id, cat, en, ins, [out], run, unit, extra);
const L = 'length', A = 'angle';

/** 4×4 row-major matrices (what cc-nurbs transform takes). */
const mTranslate = (v) => [1, 0, 0, v[0], 0, 1, 0, v[1], 0, 0, 1, v[2], 0, 0, 0, 1];
function mRotate(angleDeg, p, axis) {
  const l = Math.hypot(axis[0], axis[1], axis[2]);
  need(l > 1e-12, 'nodes.err.axis');
  const [x, y, z] = [axis[0] / l, axis[1] / l, axis[2] / l], c = Math.cos(angleDeg * RAD), s = Math.sin(angleDeg * RAD), k = 1 - c;
  const R = [c + x * x * k, x * y * k - z * s, x * z * k + y * s, y * x * k + z * s, c + y * y * k, y * z * k - x * s, z * x * k - y * s, z * y * k + x * s, c + z * z * k];
  const t = [p[0] - (R[0] * p[0] + R[1] * p[1] + R[2] * p[2]), p[1] - (R[3] * p[0] + R[4] * p[1] + R[5] * p[2]), p[2] - (R[6] * p[0] + R[7] * p[1] + R[8] * p[2])];
  return [R[0], R[1], R[2], t[0], R[3], R[4], R[5], t[1], R[6], R[7], R[8], t[2], 0, 0, 0, 1];
}
function mScale(f, c) { return [f, 0, 0, c[0] * (1 - f), 0, f, 0, c[1] * (1 - f), 0, 0, f, c[2] * (1 - f), 0, 0, 0, 1]; }
const xp = (m, p) => Float64Array.from(V.xform(m, p));
/** Apply a matrix to any geometry (a list of geometry maps over it). */
export function applyMatrix(g, m) {
  if (Array.isArray(g)) return g.map((x) => applyMatrix(x, m));
  if (isVec(g)) return xp(m, g);
  if (isCurve(g)) return N.curve.transform(g, m);
  if (isSurface(g)) return N.surface.transform(g, m);
  if (isMesh(g)) {
    const p = new Float64Array(g.positions.length);
    for (let k = 0; k < p.length; k += 3) p.set(V.xform(m, [g.positions[k], g.positions[k + 1], g.positions[k + 2]]), k);
    return { positions: p, indices: g.indices.slice() };
  }
  return fail('nodes.err.not_geometry');
}

// ---- input -------------------------------------------------------------------------------------------------------------------
one('number', 'input', 'Number', [i('value', 'number', 0, { unit: '*' })], o('out', 'number'), (a) => finite(a.value, 'value'), '=');
one('length', 'input', 'Length', [i('value', 'number', 10, { unit: L })], o('out', 'number', L), (a) => finite(a.value, 'value'), L);
one('angle', 'input', 'Angle', [i('degrees', 'number', 90, { unit: A })], o('out', 'number', A), (a) => finite(a.degrees, 'degrees'), A);
one('slider', 'input', 'Slider', [i('value', 'number', 5, { unit: '*' }), i('min', 'number', 0, { unit: '*' }), i('max', 'number', 10, { unit: '*' })], o('out', 'number'),
  (a) => { need(a.min <= a.max, 'nodes.err.range', { min: a.min, max: a.max }); return Math.min(a.max, Math.max(a.min, finite(a.value, 'value'))); }, '=');
one('boolean', 'input', 'Yes / no', [i('value', 'bool', true)], o('out', 'bool'), (a) => !!a.value);
one('point', 'input', 'Point', [i('x', 'number', 0, { unit: L }), i('y', 'number', 0, { unit: L }), i('z', 'number', 0, { unit: L })], o('out', 'point', L),
  (a) => vec(finite(a.x, 'x'), finite(a.y, 'y'), finite(a.z, 'z')), L);
one('vector', 'input', 'Vector', [i('x', 'number', 0, { unit: L }), i('y', 'number', 0, { unit: L }), i('z', 'number', 1, { unit: L })], o('out', 'vector', L),
  (a) => vec(finite(a.x, 'x'), finite(a.y, 'y'), finite(a.z, 'z')), L);
node('xyz', 'input', 'Point parts', [i('point', 'point', vec(), { unit: L })], [o('x', 'number', L), o('y', 'number', L), o('z', 'number', L)], (a) => ({ x: a.point[0], y: a.point[1], z: a.point[2] }), L);

// ---- maths -------------------------------------------------------------------------------------------------------------------
const bin = (id, en, f, unit = '=') => one(id, 'math', en, [i('a', 'number', 0, { unit: '*' }), i('b', 'number', 0, { unit: '*' })], o('out', 'number'), (a) => finite(f(a.a, a.b), id), unit);
bin('add', 'Add', (x, y) => x + y);
bin('subtract', 'Subtract', (x, y) => x - y);
bin('multiply', 'Multiply', (x, y) => x * y, 'mul');
one('divide', 'math', 'Divide', [i('a', 'number', 1, { unit: '*' }), i('b', 'number', 1, { unit: '*' })], o('out', 'number'),
  (a) => { need(Math.abs(a.b) > 1e-300, 'nodes.err.divide_zero'); return a.a / a.b; }, 'div');
bin('power', 'Power', (x, y) => Math.pow(x, y), 'mul');
bin('minimum', 'Smaller', Math.min);
bin('maximum', 'Larger', Math.max);
one('modulo', 'math', 'Remainder', [i('a', 'number', 7, { unit: '*' }), i('b', 'number', 3, { unit: '*' })], o('out', 'number'), (a) => { need(Math.abs(a.b) > 1e-300, 'nodes.err.divide_zero'); return a.a - a.b * Math.floor(a.a / a.b); }, '=');
const un = (id, en, f, unit = '') => one(id, 'math', en, [i('value', 'number', 0, { unit: unit === '=' ? '*' : unit === 'in-angle' ? A : '*' })], o('out', 'number'), (a) => finite(f(a.value), id), unit === 'in-angle' ? '' : unit);
un('negate', 'Negate', (x) => -x, '=');
un('absolute', 'Absolute', Math.abs, '=');
un('round', 'Round', Math.round, '=');
un('floor', 'Round down', Math.floor, '=');
un('sqrt', 'Square root', (x) => { need(x >= 0, 'nodes.err.sqrt'); return Math.sqrt(x); });
un('sin', 'Sine', (x) => Math.sin(x * RAD), 'in-angle');
un('cos', 'Cosine', (x) => Math.cos(x * RAD), 'in-angle');
un('tan', 'Tangent', (x) => Math.tan(x * RAD), 'in-angle');
one('atan2', 'math', 'Angle of (x, y)', [i('y', 'number', 0, { unit: '*' }), i('x', 'number', 1, { unit: '*' })], o('out', 'number', A), (a) => Math.atan2(a.y, a.x) / RAD, A);
one('mix', 'math', 'Mix', [i('a', 'number', 0, { unit: '*' }), i('b', 'number', 10, { unit: '*' }), i('t', 'number', 0.5)], o('out', 'number'), (a) => a.a + (a.b - a.a) * a.t, '=');
one('clamp', 'math', 'Clamp', [i('value', 'number', 0, { unit: '*' }), i('min', 'number', 0, { unit: '*' }), i('max', 'number', 1, { unit: '*' })], o('out', 'number'),
  (a) => { need(a.min <= a.max, 'nodes.err.range', { min: a.min, max: a.max }); return Math.min(a.max, Math.max(a.min, a.value)); }, '=');

// ---- lists -------------------------------------------------------------------------------------------------------------------
const MAXLIST = 100000;
const count = (n) => { need(Number.isInteger(n) && n >= 0 && n <= MAXLIST, 'nodes.err.count', { max: MAXLIST }); return n; };
one('series', 'list', 'Series', [i('start', 'number', 0, { unit: '*' }), i('step', 'number', 1, { unit: '*' }), i('count', 'number', 5, { step: 1, min: 0 })], o('out', 'number', '', { list: true }),
  (a) => Array.from({ length: count(a.count) }, (_, k) => a.start + k * a.step), '=');
one('range', 'list', 'Range', [i('start', 'number', 0, { unit: '*' }), i('end', 'number', 1, { unit: '*' }), i('count', 'number', 5, { step: 1, min: 2 })], o('out', 'number', '', { list: true }),
  (a) => { const n = count(a.count); need(n >= 2, 'nodes.err.count_min', { min: 2 }); return Array.from({ length: n }, (_, k) => a.start + (a.end - a.start) * k / (n - 1)); }, '=');
one('random', 'list', 'Random numbers', [i('seed', 'number', 1, { step: 1 }), i('count', 'number', 5, { step: 1, min: 0 }), i('min', 'number', 0, { unit: '*' }), i('max', 'number', 1, { unit: '*' })], o('out', 'number', '', { list: true }),
  (a) => {   // mulberry32: the same seed gives the same numbers on every machine
    let s = (a.seed >>> 0) || 1;
    const next = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    return Array.from({ length: count(a.count) }, () => a.min + (a.max - a.min) * next());
  }, '=');
one('repeat', 'list', 'Repeat', [i('value', 'any', 0), i('count', 'number', 3, { step: 1, min: 0 })], o('out', 'any', '', { list: true }), (a) => Array.from({ length: count(a.count) }, () => a.value), '=');
one('list', 'list', 'List', [i('items', 'any', null, { list: true, multi: true })], o('out', 'any', '', { list: true }), (a) => a.items.slice(), '=');
one('item', 'list', 'Item', [i('list', 'any', null, { list: true }), i('index', 'number', 0, { step: 1 })], o('out', 'any'),
  (a) => { const n = a.list.length; need(n > 0, 'nodes.err.empty'); const k = ((Math.trunc(a.index) % n) + n) % n; return a.list[k]; }, '=');
one('length_of', 'list', 'List length', [i('list', 'any', null, { list: true })], o('out', 'number'), (a) => a.list.length);
one('reverse_list', 'list', 'Reverse list', [i('list', 'any', null, { list: true })], o('out', 'any', '', { list: true }), (a) => a.list.slice().reverse(), '=');
one('sum', 'list', 'Sum', [i('numbers', 'number', null, { list: true, unit: '*' })], o('out', 'number'), (a) => a.numbers.reduce((s, x) => s + x, 0), '=');
one('sort', 'list', 'Sort numbers', [i('numbers', 'number', null, { list: true, unit: '*' })], o('out', 'number', '', { list: true }), (a) => a.numbers.slice().sort((x, y) => x - y), '=');

// ---- points and vectors ------------------------------------------------------------------------------------------------------
const P = (name, def = vec()) => i(name, 'point', def, { unit: L });
one('point_add', 'vector', 'Point + vector', [P('point'), i('vector', 'vector', vec(), { unit: L })], o('out', 'point', L), (a) => vec(a.point[0] + a.vector[0], a.point[1] + a.vector[1], a.point[2] + a.vector[2]), L);
one('vector_between', 'vector', 'Vector between', [P('from'), P('to', vec(10, 0, 0))], o('out', 'vector', L), (a) => vec(a.to[0] - a.from[0], a.to[1] - a.from[1], a.to[2] - a.from[2]), L);
one('vector_scale', 'vector', 'Scale vector', [i('vector', 'vector', vec(0, 0, 1), { unit: L }), i('factor', 'number', 2)], o('out', 'vector', L), (a) => vec(a.vector[0] * a.factor, a.vector[1] * a.factor, a.vector[2] * a.factor), L);
one('vector_unit', 'vector', 'Unit vector', [i('vector', 'vector', vec(0, 0, 1), { unit: L })], o('out', 'vector'), (a) => { const l = Math.hypot(...a.vector); need(l > 1e-12, 'nodes.err.zero_vector'); return vec(a.vector[0] / l, a.vector[1] / l, a.vector[2] / l); });
one('vector_length', 'vector', 'Vector length', [i('vector', 'vector', vec(0, 0, 1), { unit: L })], o('out', 'number', L), (a) => Math.hypot(...a.vector), L);
one('distance', 'vector', 'Distance', [P('a'), P('b', vec(10, 0, 0))], o('out', 'number', L), (a) => Math.hypot(a.a[0] - a.b[0], a.a[1] - a.b[1], a.a[2] - a.b[2]), L);
one('dot', 'vector', 'Dot product', [i('a', 'vector', vec(1, 0, 0), { unit: L }), i('b', 'vector', vec(0, 1, 0), { unit: L })], o('out', 'number'), (a) => a.a[0] * a.b[0] + a.a[1] * a.b[1] + a.a[2] * a.b[2]);
one('cross', 'vector', 'Cross product', [i('a', 'vector', vec(1, 0, 0), { unit: L }), i('b', 'vector', vec(0, 1, 0), { unit: L })], o('out', 'vector'), (a) => Float64Array.from(V.cross(arr(a.a), arr(a.b))));
one('midpoint', 'vector', 'Point between', [P('a'), P('b', vec(10, 0, 0)), i('t', 'number', 0.5)], o('out', 'point', L), (a) => vec(a.a[0] + (a.b[0] - a.a[0]) * a.t, a.a[1] + (a.b[1] - a.a[1]) * a.t, a.a[2] + (a.b[2] - a.a[2]) * a.t), L);
one('polar', 'vector', 'Point on a circle', [P('center'), i('radius', 'number', 10, { unit: L }), i('angle', 'number', 0, { unit: A })], o('out', 'point', L),
  (a) => vec(a.center[0] + a.radius * Math.cos(a.angle * RAD), a.center[1] + a.radius * Math.sin(a.angle * RAD), a.center[2]), L);

// ---- curves ------------------------------------------------------------------------------------------------------------------
const Cv = (name) => i(name, 'curve', null);
one('line', 'curve', 'Line', [P('from'), P('to', vec(10, 0, 0))], o('out', 'curve', L), (a) => { need(Math.hypot(...V.sub(arr(a.from), arr(a.to))) > 1e-9, 'nodes.err.same_point'); return N.curve.line(arr(a.from), arr(a.to)); }, L);
one('polyline', 'curve', 'Polyline', [i('points', 'point', null, { list: true, multi: true, unit: L })], o('out', 'curve', L), (a) => N.curve.polyline(a.points.map(arr)), L);
one('arc', 'curve', 'Arc', [P('center'), i('radius', 'number', 10, { unit: L }), i('from', 'number', 0, { unit: A }), i('to', 'number', 90, { unit: A })], o('out', 'curve', L),
  (a) => { need(a.radius > 0, 'nodes.err.radius'); return N.curve.arc(arr(a.center), [1, 0, 0], [0, 1, 0], a.radius, a.from * RAD, a.to * RAD); }, L);
one('circle', 'curve', 'Circle', [P('center'), i('radius', 'number', 10, { unit: L }), i('normal', 'vector', vec(0, 0, 1), { unit: '*' })], o('out', 'curve', L),
  (a) => { need(a.radius > 0, 'nodes.err.radius'); need(Math.hypot(...a.normal) > 1e-12, 'nodes.err.zero_vector'); return N.curve.circle(arr(a.center), arr(a.normal), a.radius); }, L);
one('through_points', 'curve', 'Curve through points', [i('points', 'point', null, { list: true, multi: true, unit: L }), i('degree', 'number', 3, { step: 1, min: 1, max: 5 })], o('out', 'curve', L),
  (a) => { need(a.points.length >= 2, 'nodes.err.count_min', { min: 2 }); const p = Math.max(1, Math.min(Math.trunc(a.degree), a.points.length - 1)); return N.fit.interpolate(a.points.map(arr), p); }, L);
one('curve_point', 'curve', 'Point on curve', [Cv('curve'), i('t', 'number', 0.5, { min: 0, max: 1 })], o('out', 'point', L),
  (a) => { const [u0, u1] = N.curve.domain(a.curve); return Float64Array.from(N.curve.point(a.curve, u0 + (u1 - u0) * Math.min(1, Math.max(0, a.t)))); }, L);
one('curve_length', 'curve', 'Curve length', [Cv('curve')], o('out', 'number', L), (a) => N.curve.arcLength(a.curve), L);
one('divide_curve', 'curve', 'Divide curve', [Cv('curve'), i('count', 'number', 8, { step: 1, min: 1 })], o('out', 'point', L, { list: true }),
  (a) => { const n = count(a.count); need(n >= 1, 'nodes.err.count_min', { min: 1 }); const [u0, u1] = N.curve.domain(a.curve); return Array.from({ length: n + 1 }, (_, k) => Float64Array.from(N.curve.point(a.curve, u0 + (u1 - u0) * k / n))); }, L);
one('reverse_curve', 'curve', 'Reverse curve', [Cv('curve')], o('out', 'curve', L), (a) => N.curve.reverse(a.curve), L);
one('join_curves', 'curve', 'Join curves', [i('curves', 'curve', null, { list: true, multi: true })], o('out', 'curve', L), (a) => N.curve.join(a.curves), L);

// ---- transforms --------------------------------------------------------------------------------------------------------------
one('move', 'transform', 'Move', [i('geometry', 'geometry', null), i('by', 'vector', vec(10, 0, 0), { unit: L })], o('out', 'geometry', L), (a) => applyMatrix(a.geometry, mTranslate(a.by)), L);
one('rotate', 'transform', 'Rotate', [i('geometry', 'geometry', null), i('angle', 'number', 90, { unit: A }), P('about'), i('axis', 'vector', vec(0, 0, 1), { unit: '*' })], o('out', 'geometry', L), (a) => applyMatrix(a.geometry, mRotate(a.angle, a.about, a.axis)), L);
one('scale', 'transform', 'Scale', [i('geometry', 'geometry', null), i('factor', 'number', 2), P('center')], o('out', 'geometry', L), (a) => { need(Math.abs(a.factor) > 1e-12, 'nodes.err.scale'); return applyMatrix(a.geometry, mScale(a.factor, a.center)); }, L);
one('array_linear', 'transform', 'Array in a line', [i('geometry', 'geometry', null), i('step', 'vector', vec(10, 0, 0), { unit: L }), i('count', 'number', 4, { step: 1, min: 1 })], o('out', 'geometry', L, { list: true }),
  (a) => Array.from({ length: count(a.count) }, (_, k) => applyMatrix(a.geometry, mTranslate([a.step[0] * k, a.step[1] * k, a.step[2] * k]))), L);
one('array_polar', 'transform', 'Array around an axis', [i('geometry', 'geometry', null), P('about'), i('axis', 'vector', vec(0, 0, 1), { unit: '*' }), i('count', 'number', 6, { step: 1, min: 1 })], o('out', 'geometry', L, { list: true }),
  (a) => { const n = count(a.count); return Array.from({ length: n }, (_, k) => applyMatrix(a.geometry, mRotate(360 * k / n, a.about, a.axis))); }, L);

// ---- surfaces and free-form --------------------------------------------------------------------------------------------------
const S = (name) => i(name, 'surface', null);
one('extrude', 'surface', 'Extrude', [Cv('curve'), i('direction', 'vector', vec(0, 0, 10), { unit: L })], o('out', 'surface', L), (a) => { need(Math.hypot(...a.direction) > 1e-9, 'nodes.err.zero_vector'); return N.construct.extrude(a.curve, arr(a.direction)).surface; }, L);
one('ruled', 'surface', 'Ruled surface', [Cv('a'), Cv('b')], o('out', 'surface', L), (a) => N.construct.ruled(a.a, a.b).surface, L);
one('revolve', 'surface', 'Revolve', [Cv('profile'), P('axis_point'), i('axis', 'vector', vec(0, 0, 1), { unit: '*' }), i('angle', 'number', 360, { unit: A })], o('out', 'surface', L),
  (a) => { need(Math.abs(a.angle) > 1e-9, 'nodes.err.angle'); return N.construct.revolve(a.profile, arr(a.axis_point), arr(a.axis), a.angle * RAD).surface; }, L);
one('loft', 'surface', 'Loft', [i('sections', 'curve', null, { list: true, multi: true }), i('degree', 'number', 3, { step: 1, min: 1, max: 5 })], o('out', 'surface', L),
  (a) => { need(a.sections.length >= 2, 'nodes.err.sections', { min: 2 }); return N.construct.loft(a.sections, { degree: Math.max(1, Math.min(Math.trunc(a.degree), a.sections.length - 1)) }).surface; }, L);
one('sweep', 'surface', 'Sweep along a rail', [Cv('profile'), Cv('rail')], o('out', 'surface', L), (a) => N.construct.sweep1(a.profile, a.rail).surface, L);
one('patch', 'surface', 'Flat patch', [P('p00'), P('p10', vec(10, 0, 0)), P('p11', vec(10, 10, 0)), P('p01', vec(0, 10, 0))], o('out', 'surface', L), (a) => N.construct.planarPatch([arr(a.p00), arr(a.p10), arr(a.p11), arr(a.p01)]), L);
one('surface_point', 'surface', 'Point on surface', [S('surface'), i('u', 'number', 0.5, { min: 0, max: 1 }), i('v', 'number', 0.5, { min: 0, max: 1 })], o('out', 'point', L),
  (a) => { const [u0, u1] = N.surface.domainU(a.surface), [v0, v1] = N.surface.domainV(a.surface); return Float64Array.from(N.surface.point(a.surface, u0 + (u1 - u0) * Math.min(1, Math.max(0, a.u)), v0 + (v1 - v0) * Math.min(1, Math.max(0, a.v)))); }, L);
one('surface_area', 'surface', 'Surface area', [S('surface')], o('out', 'number'), (a) => N.surface.area(a.surface));
one('offset_surface', 'surface', 'Offset surface', [S('surface'), i('distance', 'number', 2, { unit: L })], o('out', 'surface', L), (a) => N.construct.offset(a.surface, a.distance).surface, L);
one('to_mesh', 'surface', 'Surface to mesh', [S('surface'), i('tolerance', 'number', 0.1, { unit: L, min: 0.001 })], o('out', 'mesh', L),
  (a) => { need(a.tolerance > 0, 'nodes.err.tolerance'); const t = N.surface.tessellate(a.surface, { tol: a.tolerance }); return { positions: Float64Array.from(t.positions), indices: Uint32Array.from(t.indices) }; }, L);

for (const d of SOLID_NODES) LIBRARY.push(d);   // solids and Booleans (0.9 SU.747c): cc-nurbs' own node definitions
export const BY_ID = Object.freeze(Object.fromEntries(LIBRARY.map((d) => [d.id, d])));
export const CATEGORIES = Object.freeze(['input', 'math', 'list', 'vector', 'curve', 'transform', 'surface', 'solid']);
export { typeOf };

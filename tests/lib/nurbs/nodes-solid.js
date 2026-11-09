/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; node labels are `en` fields that cc-nodes' words.js turns into keys. */
/**
 * nodes-solid.js — cc-nurbs (0.9 SU.747c, session `nurbs-s3-09`): SOLIDS AND BOOLEANS AS NODES for the node editor (cc-nodes, lib/nodes).
 * The node definitions are written here in cc-nodes' shape (library.js: id · cat · en · ins · outs · run · unit) so the node editor's
 * library can take them with one line (`for (const d of SOLID_NODES) LIBRARY.push(d)`) and a `solid` port type; that mount is the
 * node editor owner's (docs/0.9-sessions/nurbs-s3-09.md § Inbox). Every node is a pure function over cc-nurbs (solid.js, blend.js):
 * the same Booleans, measured the same way, as the Surfaces panel's.
 *
 * A `solid` value is a cc-nurbs patch set holding exactly ONE solid (doc.js shape, `solids: [{ id, name, faces }]`), so it can be
 * cloned, saved and baked like any other value: isSolid(v). The mesh engine (manifold-3d) is handed in once by the host with
 * setEngine(M) (ModelCraft and PartCraft already load it); without it the Boolean nodes say so (`nurbs.err.bool_engine`).
 *
 *   SOLID_NODES  [{ id: 'solid_box' | 'solid_cylinder' | 'solid_sphere' | 'solid_union' | 'solid_subtract' | 'solid_intersect' |
 *                 'solid_fillet' | 'solid_volume' | 'solid_mesh', … }]
 *   isSolid(v) · setEngine(M) · engine() · solidValue(doc, id) (one solid of a patch set as a value) · merge(a, b) → { doc, a, b }
 */
import * as C from './curve.js';
import * as D from './doc.js';
import * as B from './solid.js';
import * as BL from './blend.js';

let M = null;
export const setEngine = (m) => { M = m || null; };
export const engine = () => M;
const { fail } = C;

export const isSolid = (v) => !!v && typeof v === 'object' && !Array.isArray(v) && v.format === D.FORMAT && Array.isArray(v.items) && Array.isArray(v.solids) && v.solids.length === 1;

/** One solid of a patch set as a value: only its faces, the solid's id kept. */
export function solidValue(doc, id) {
  const b = B.solid(doc, id);
  if (!b) fail('nurbs.err.no_solid', { id });
  const keep = new Set(b.faces);
  return { ...D.newDoc(), items: doc.items.filter((i) => keep.has(i.id)), solids: [{ ...b }] };
}

/** Two solid values in one patch set (b's ids renamed where they clash) → { doc, a, b } with the two solids' ids. */
export function merge(va, vb) {
  if (!isSolid(va) || !isSolid(vb)) fail('nurbs.err.no_solid', { id: '' });
  const used = new Set([...va.items.map((i) => i.id), ...va.solids.map((s) => s.id)]);
  const fresh = (pre, n = 1) => { while (used.has(pre + n)) n++; used.add(pre + n); return pre + n; };
  const map = new Map();
  const items = vb.items.map((it) => { const id = used.has(it.id) ? fresh('s') : (used.add(it.id), it.id); map.set(it.id, id); return { ...it, id }; });
  const sb = vb.solids[0], bid = used.has(sb.id) ? fresh('b') : sb.id;
  const doc = { ...D.newDoc(), items: [...va.items, ...items], solids: [va.solids[0], { ...sb, id: bid, faces: sb.faces.map((f) => map.get(f)) }] };
  return { doc, a: va.solids[0].id, b: bid };
}

// cc-nodes' port helpers, written out (this file does not import lib/nodes)
const L = 'length';
const pt = (name, def = [0, 0, 0]) => ({ name, type: 'point', def: Float64Array.from(def), unit: L });
const vc = (name, def) => ({ name, type: 'vector', def: Float64Array.from(def), unit: L });
const num = (name, def, extra = {}) => ({ name, type: 'number', def, unit: L, ...extra });
const sol = (name) => ({ name, type: 'solid', def: null, unit: '' });
const out = (name, type, unit = '') => ({ name, type, unit });
const arr = (p) => [p[0], p[1], p[2]];
const finite = (x, what) => { if (!Number.isFinite(x)) fail('nodes.err.not_finite', { what }); return x; };

const made = (r) => solidValue(r.doc, r.id);
const bool = (op) => (a) => {
  if (!M) fail('nurbs.err.bool_engine');
  const m = merge(a.a, a.b);
  const r = B.boolean(M, m.doc, m.a, m.b, op, { tol: a.tolerance > 0 ? a.tolerance : B.TOL });
  return made(r);
};

export const SOLID_NODES = [
  { id: 'solid_box', cat: 'solid', en: 'Box solid', ins: [pt('corner'), vc('size', [100, 60, 40])], outs: [out('out', 'solid')], unit: '',
    run: (a) => made(B.box(D.newDoc(), { corner: arr(a.corner).map((x) => finite(x, 'corner')), size: arr(a.size).map((x) => finite(x, 'size')) })) },
  { id: 'solid_cylinder', cat: 'solid', en: 'Cylinder solid', ins: [pt('base'), vc('axis', [0, 0, 1]), num('radius', 20, { min: 0.001 }), num('height', 50, { min: 0.001 })], outs: [out('out', 'solid')], unit: '',
    run: (a) => made(B.cylinder(D.newDoc(), { base: arr(a.base), axis: arr(a.axis), radius: finite(a.radius, 'radius'), height: finite(a.height, 'height') })) },
  { id: 'solid_sphere', cat: 'solid', en: 'Sphere solid', ins: [pt('center'), num('radius', 25, { min: 0.001 })], outs: [out('out', 'solid')], unit: '',
    run: (a) => made(B.sphere(D.newDoc(), { center: arr(a.center), radius: finite(a.radius, 'radius') })) },
  { id: 'solid_union', cat: 'solid', en: 'Union', ins: [sol('a'), sol('b'), num('tolerance', B.TOL, { min: 0.001 })], outs: [out('out', 'solid')], unit: '', run: bool('union') },
  { id: 'solid_subtract', cat: 'solid', en: 'Subtract', ins: [sol('a'), sol('b'), num('tolerance', B.TOL, { min: 0.001 })], outs: [out('out', 'solid')], unit: '', run: bool('subtract') },
  { id: 'solid_intersect', cat: 'solid', en: 'Intersect', ins: [sol('a'), sol('b'), num('tolerance', B.TOL, { min: 0.001 })], outs: [out('out', 'solid')], unit: '', run: bool('intersect') },
  { id: 'solid_fillet', cat: 'solid', en: 'Fillet between faces', ins: [sol('solid'), { name: 'face_a', type: 'number', def: 1, unit: '', step: 1, min: 1 }, { name: 'face_b', type: 'number', def: 2, unit: '', step: 1, min: 1 }, num('radius', 5, { min: 0.001 }), num('radius2', 0, { min: 0 })], outs: [out('out', 'solid')], unit: '',
    // faces by their number in the solid (1 = its first face), the way a graph names them without picking
    run: (a) => {
      if (!M) fail('nurbs.err.bool_engine');
      const s = a.solid, f = s.solids[0].faces, ia = Math.trunc(a.face_a) - 1, ib = Math.trunc(a.face_b) - 1;
      if (!f[ia]) fail('nurbs.err.fillet_face', { id: String(a.face_a), solid: s.solids[0].name || s.solids[0].id });
      if (!f[ib]) fail('nurbs.err.fillet_face', { id: String(a.face_b), solid: s.solids[0].name || s.solids[0].id });
      return made(BL.fillet(M, s, s.solids[0].id, f[ia], f[ib], { radius: a.radius, radius2: a.radius2 > 0 ? a.radius2 : null }));
    } },
  { id: 'solid_volume', cat: 'solid', en: 'Solid volume', ins: [sol('solid')], outs: [out('out', 'number')], unit: '',
    run: (a) => B.mesh(a.solid, a.solid.solids[0].id).report.volume },
  { id: 'solid_mesh', cat: 'solid', en: 'Solid to mesh', ins: [sol('solid'), num('tolerance', B.TOL, { min: 0.001 })], outs: [out('out', 'mesh', L)], unit: L,
    run: (a) => { const m = B.mesh(a.solid, a.solid.solids[0].id, { tol: a.tolerance > 0 ? a.tolerance : B.TOL }); return { positions: m.positions, indices: m.indices }; } },
];

/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * doc.js — cc-nurbs (0.8 SU.747b, session `nurbs`): a patch set — the curves and untrimmed surfaces S1 makes, and the edges
 * whose continuity the person asked for — as plain JSON. DOM-free. A host keeps it in its own file (ModelCraft's .modelcraft,
 * PartCraft's part file) under one key, or saves it alone as `.ccnurbs` (the same JSON).
 *
 *   { format: 'cadcraft-nurbs', version: 1, unit: 'mm',
 *     items: [{ id, name, kind: 'curve' | 'surface', curve | surface, trim? (surface only: { outer, holes }, trim.js), hidden? }],
 *     links: [{ a, edgeA, b, edgeB, want: 'G0' | 'G1' | 'G2' }],      (a, b = item ids; edge names as in surface.js)
 *     solids?: [{ id, name, faces: [surface ids] }] }                    (0.9 DC.54: solids bounded by the faces, solid.js; the key is
 *                                                                         left out when there are none, so older readers open it)
 *
 *   newDoc() · cleanDoc(x, caps) → doc (untrusted input: every field checked; NurbsError nurbs.err.* when it cannot be read) ·
 *   toJSON(doc) → text · fromJSON(text, caps) → doc · add(doc, kind, geom, { name, id }) → { doc, id } · replace(doc, id, geom) ·
 *   remove(doc, id) (also drops its links) · link(doc, a, edgeA, b, edgeB, want) · item(doc, id) · surfaces(doc) · curves(doc) ·
 *   continuity(doc, { tol, samples }) → { report, problems } — every link measured (want as set) plus every other shared edge
 *     found (want G0), as Problems (continuity.js) keyed by item id
 *   CAPS = { items: 5000, cvs: 2 000 000 (all items together), name: 200, bytes: 64 MB }
 */
import * as C from './curve.js';
import * as S from './surface.js';
import * as G from './continuity.js';
import * as T from './trim.js';
import * as B from './solid.js';

const { fail } = C;
export const FORMAT = 'cadcraft-nurbs';
export const VERSION = 1;
export const CAPS = Object.freeze({ items: 5000, cvs: 2000000, name: 200, bytes: 64 * 1024 * 1024 });
const WANTS = ['G0', 'G1', 'G2'];

export const newDoc = () => ({ format: FORMAT, version: VERSION, unit: 'mm', items: [], links: [] });

const cleanId = (x) => (typeof x === 'string' && /^[A-Za-z0-9_.-]{1,64}$/.test(x) ? x : null);
// control characters and bidirectional overrides out (names are shown in panels and written into STEP/IGES)
const cleanName = (x, max) => (typeof x === 'string' ? x.replace(/[\u0000-\u001f\u007f-\u009f‎‏‪-‮⁦-⁩]/g, '').slice(0, max) : '');

export function cleanDoc(x, caps = CAPS) {
  if (!x || typeof x !== 'object' || x.format !== FORMAT) fail('nurbs.err.not_doc');
  if (!Number.isInteger(x.version) || x.version < 1) fail('nurbs.err.doc_version');
  if (x.version > VERSION) fail('nurbs.err.doc_newer', { version: x.version });
  if (!Array.isArray(x.items) || x.items.length > caps.items) fail('nurbs.err.too_many', { max: caps.items });
  const out = newDoc();
  if (typeof x.unit === 'string' && x.unit === 'mm') out.unit = 'mm';
  const seen = new Set();
  let total = 0;
  x.items.forEach((it, k) => {
    if (!it || typeof it !== 'object') fail('nurbs.err.item', { index: k });
    let id = cleanId(it.id);
    if (!id || seen.has(id)) id = 'n' + (k + 1);
    while (seen.has(id)) id += '_';
    seen.add(id);
    const name = cleanName(it.name, caps.name);
    const left = caps.cvs - total;
    if (it.kind === 'curve') {
      const c = C.cleanCurve(it.curve, { maxCvs: Math.max(0, left) });
      total += c.cvs.length;
      out.items.push({ id, name, kind: 'curve', curve: c, ...(it.hidden === true ? { hidden: true } : {}) });
    } else if (it.kind === 'surface') {
      const s = S.cleanSurface(it.surface, { maxCvs: Math.max(0, left) });
      total += s.cvs.length * s.cvs[0].length;
      const trim = it.trim == null ? null : T.cleanTrim(it.trim, s);   // 0.8 DC.54 S2: the part of the patch that is shown
      out.items.push({ id, name, kind: 'surface', surface: s, ...(trim ? { trim } : {}), ...(it.hidden === true ? { hidden: true } : {}) });
    } else fail('nurbs.err.item', { index: k });
    if (total > caps.cvs) fail('nurbs.err.too_many', { max: caps.cvs });
  });
  const ids = new Map(out.items.map((i) => [i.id, i]));
  for (const l of Array.isArray(x.links) ? x.links.slice(0, caps.items * 4) : []) {
    if (!l || typeof l !== 'object') continue;
    const a = ids.get(l.a), b = ids.get(l.b);
    if (!a || !b || a.kind !== 'surface' || b.kind !== 'surface' || l.a === l.b) continue;
    if (!S.EDGES.includes(l.edgeA) || !S.EDGES.includes(l.edgeB)) continue;
    out.links.push({ a: l.a, edgeA: l.edgeA, b: l.b, edgeB: l.edgeB, want: WANTS.includes(l.want) ? l.want : 'G0' });
  }
  const sol = B.cleanSolids(x.solids, out.items);
  if (sol.length) out.solids = sol;
  return out;
}

export const toJSON = (doc) => JSON.stringify(doc);
export function fromJSON(text, caps = CAPS) {
  if (typeof text !== 'string' || text.length > caps.bytes) fail('nurbs.err.too_big');
  let x;
  try { x = JSON.parse(text); } catch { fail('nurbs.err.not_doc'); }
  return cleanDoc(x, caps);
}

export const item = (doc, id) => doc.items.find((i) => i.id === id) || null;
export const surfaces = (doc) => doc.items.filter((i) => i.kind === 'surface');
export const curves = (doc) => doc.items.filter((i) => i.kind === 'curve');

function nextId(doc, kind) {
  const pre = kind === 'curve' ? 'c' : 's';
  let n = doc.items.length + 1;
  while (doc.items.some((i) => i.id === pre + n)) n++;
  return pre + n;
}

export function add(doc, kind, geom, { name = '', id = null } = {}) {
  const nid = cleanId(id) && !item(doc, id) ? id : nextId(doc, kind);
  const g = kind === 'curve' ? C.cleanCurve(geom) : S.cleanSurface(geom);
  const it = { id: nid, name: cleanName(name, CAPS.name), kind, [kind]: g };
  return { doc: { ...doc, items: [...doc.items, it] }, id: nid };
}

export function replace(doc, id, geom) {
  const it = item(doc, id);
  if (!it) fail('nurbs.err.no_item');
  const g = it.kind === 'curve' ? C.cleanCurve(geom) : S.cleanSurface(geom);
  return { ...doc, items: doc.items.map((i) => (i.id === id ? { ...i, [i.kind]: g } : i)) };
}

/** Set (or with null clear) a surface's trim: { outer, holes } of [u, v] loops (trim.js). */
export function setTrim(doc, id, trim) {
  const it = item(doc, id);
  if (!it || it.kind !== 'surface') fail('nurbs.err.no_item');
  const t = trim == null ? null : T.cleanTrim(trim, it.surface);
  return { ...doc, items: doc.items.map((i) => { if (i.id !== id) return i; const c = { ...i }; if (t) c.trim = t; else delete c.trim; return c; }) };
}

export function remove(doc, id) {
  const out = { ...doc, items: doc.items.filter((i) => i.id !== id), links: doc.links.filter((l) => l.a !== id && l.b !== id) };
  if (Array.isArray(doc.solids)) {   // a face taken out of a solid leaves it open: the solid group goes, its other faces stay
    const sol = doc.solids.filter((b) => !b.faces.includes(id));
    if (sol.length) out.solids = sol; else delete out.solids;
  }
  return out;
}

export function link(doc, a, edgeA, b, edgeB, want = 'G1') {
  if (!WANTS.includes(want)) fail('nurbs.err.continuity');
  const ia = item(doc, a), ib = item(doc, b);
  if (!ia || !ib || ia.kind !== 'surface' || ib.kind !== 'surface' || a === b) fail('nurbs.err.no_item');
  if (!S.EDGES.includes(edgeA) || !S.EDGES.includes(edgeB)) fail('nurbs.err.edge');
  const same = (l) => (l.a === a && l.edgeA === edgeA && l.b === b && l.edgeB === edgeB) || (l.a === b && l.edgeA === edgeB && l.b === a && l.edgeB === edgeA);
  return { ...doc, links: [...doc.links.filter((l) => !same(l)), { a, edgeA, b, edgeB, want }] };
}

export function continuity(doc, { tol = G.TOL, samples = 33 } = {}) {
  const list = surfaces(doc), idx = new Map(list.map((it, i) => [it.id, i])), geo = list.map((it) => it.surface);
  const edges = doc.links.filter((l) => idx.has(l.a) && idx.has(l.b)).map((l) => ({ a: idx.get(l.a), edgeA: l.edgeA, b: idx.get(l.b), edgeB: l.edgeB, want: l.want }));
  const key = (e) => [e.a + e.edgeA, e.b + e.edgeB].sort().join('|');
  const have = new Set(edges.map(key));
  for (const e of G.sharedEdges(geo, { tol: Math.max(tol.g0 * 10, 1e-6) })) if (!have.has(key(e))) { edges.push({ ...e, want: 'G0' }); have.add(key(e)); }
  const report = G.patchReport(geo, { tol, samples, edges });
  return { report, problems: G.problems(report, { ids: list.map((it) => it.id) }) };
}

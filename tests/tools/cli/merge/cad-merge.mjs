/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cad-merge.mjs — the three-way merge of two edits of one CadCraft drawing (DWG 2000–2018, DXF R12 or DXF 2000), 0.8 DC.27 (H4).
 *
 *   mergeCad(baseBytes, oursBytes, theirsBytes) → { code, bytes, ext, format, conflicts, notes }   (code 0 clean, 1 conflicts, 2 could not run)
 *
 * The three files are opened by CadCraft's own readers (the headless core). Objects are matched by their stable key (`key`, file-keys.js:
 * CADCRAFT xdata "CCKEY:<key>"; an object of a file written before keys gets "f<place in the file>", the same for everyone who opens it),
 * never by handle. Then the rules are json-merge.mjs's, the ones Live uses in three-way form:
 *   - an object (or a layer, block, style, layout, named view) changed on one side only is taken; changed the same way on both is taken;
 *   - a property changed differently on both sides is a conflict: ours is kept and the report lists both;
 *   - added on one side is kept; removed on one side and untouched on the other is removed; removed on one side and changed on the other is
 *     removed and reported;
 *   - the order of objects (draw order) is ours, then the objects only theirs added;
 *   - constraints and parameters are compared by object key (ids differ between sessions) and written back with the merged ids;
 *   - the 3D model is taken from the side that changed it; both sides changing it differently is a conflict (ours kept).
 * The merged drawing is written in OUR file's format and version. Never a second drawing format: DWG stays the file people exchange.
 */
import { mergeJson, same } from './json-merge.mjs';
import { CadSession, cadModules } from '../headless/cad.mjs';

const VOLATILE_META = ['name', 'source', 'size', 'format', 'version', 'saved'];
const plain = (v) => JSON.parse(JSON.stringify(v ?? null));

/** What kind of file → { kind: 'dwg' | 'dxf', tag }. */
export function sniff(bytes) {
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 8));
  if (/^AC10\d\d/.test(head)) return { kind: 'dwg', tag: head.slice(0, 6) };
  const text = new TextDecoder('latin1').decode(bytes.subarray(0, 200000));
  if (/^AutoCAD Binary DXF/.test(text)) return { kind: 'binary' };
  const m = /\$ACADVER\s*\r?\n\s*1\s*\r?\n\s*(AC\d{4})/.exec(text);
  return { kind: 'dxf', tag: m ? m[1] : 'AC1009' };
}

const rowsOf = (map) => Object.fromEntries([...map.entries()].map(([k, v]) => [k, plain(v)]));

/** The parts of a drawing worth merging, as plain JSON (objects keyed by their stable key, ids left out). */
export function mergeable(doc) {
  const idKey = new Map();
  const ents = (map) => {
    const out = {};
    for (const e of map.values()) { const { id, ...rest } = e; idKey.set(id, e.key); out[e.key] = plain(rest); }
    return out;
  };
  const model = ents(doc.model);
  const layouts = Object.fromEntries(doc.layouts.map((l) => [l.name, { paper: plain(l.paper), plotStyle: l.plotStyle || '', entities: ents(l.entities) }]));
  const meta = plain(doc.meta); for (const k of VOLATILE_META) delete meta[k];
  const cons = plain(doc.constraints).map((c) => ({ ...c, refs: (c.refs || []).map((r) => ({ ...r, e: 'key:' + idKey.get(r.e) })) }));
  return {
    model, layouts,
    layers: rowsOf(doc.layers), linetypes: rowsOf(doc.linetypes), textStyles: rowsOf(doc.textStyles), dimStyles: rowsOf(doc.dimStyles),
    blocks: rowsOf(doc.blocks),
    views: Object.fromEntries(doc.views.map((v) => [v.name + (v.layout ? '@' + v.layout : ''), plain(v)])),
    ucsNamed: Object.fromEntries(doc.ucsNamed.map((u) => [u.name, plain(u)])),
    meta, ole: plain(doc.ole), solids: plain(doc.solids),
    constraints: Object.fromEntries(cons.map((c) => [c.id, c])), params: plain(doc.params),
    model3d: plain(doc.model3d?.toJSON?.() ?? null),
  };
}

function applyTo(O, M, T) {
  const m = M.merged;
  // ids: ours keep theirs; everything new takes the next one
  const ids = new Map();   // key → id
  const take = (e) => { if (e.key) ids.set(e.key, e.id); };
  const oursById = new Map();
  for (const e of O.model.values()) { take(e); oursById.set(e.key, e); }
  const lay = new Map();
  for (const l of O.layouts) { const mm = new Map(); for (const e of l.entities.values()) mm.set(e.key, e); lay.set(l.name, mm); }
  const orderKeys = (merged, oursMap, theirsMap) => {   // ours first (draw order), then theirs' new ones in theirs' order
    const ks = Object.keys(merged), has = new Set(ks), out = [];
    for (const k of (oursMap ? [...oursMap.keys()] : [])) if (has.delete(k)) out.push(k);
    for (const k of theirsMap) if (has.delete(k)) out.push(k);
    for (const k of has) out.push(k);
    return out;
  };
  const build = (mergedEnts, oursMap, theirsKeys) => {
    const map = new Map();
    for (const k of orderKeys(mergedEnts, oursMap, theirsKeys)) {
      const base = mergedEnts[k];
      const id = oursMap?.get(k)?.id ?? O.nextId++;
      ids.set(k, id);
      map.set(id, { ...base, id });
    }
    return map;
  };
  const tModelKeys = [...T.model.values()].map((e) => e.key);
  O.model = build(m.model, oursById, tModelKeys); O.space = O.model;
  const oldLayouts = new Map(O.layouts.map((l) => [l.name, l]));
  const tLayouts = new Map(T.layouts.map((l) => [l.name, l]));
  const names = [...O.layouts.map((l) => l.name), ...T.layouts.map((l) => l.name).filter((n) => !oldLayouts.has(n))].filter((n) => n in m.layouts);
  O.layouts = names.map((n) => {
    const src = oldLayouts.get(n) || tLayouts.get(n), ml = m.layouts[n];
    const entities = build(ml.entities, lay.get(n), [...(tLayouts.get(n)?.entities.values() || [])].map((e) => e.key));
    const out = { ...src, name: n, paper: ml.paper, entities };
    if (ml.plotStyle) out.plotStyle = ml.plotStyle; else delete out.plotStyle;
    return out;
  });
  const asMap = (o) => new Map(Object.entries(o));
  O.layers = asMap(m.layers); O.linetypes = asMap(m.linetypes); O.textStyles = asMap(m.textStyles); O.dimStyles = asMap(m.dimStyles);
  O.blocks = asMap(m.blocks);
  O.views = Object.values(m.views); O.ucsNamed = Object.values(m.ucsNamed);
  const keep = {}; for (const k of VOLATILE_META) if (k in O.meta) keep[k] = O.meta[k];
  O.meta = { ...m.meta, ...keep };
  O.ole = m.ole; O.solids = m.solids;
  O.constraints = Object.values(m.constraints)
    .map((c) => ({ ...c, refs: (c.refs || []).map((r) => ({ ...r, e: ids.get(String(r.e).slice(4)) })) }))
    .filter((c) => c.refs.every((r) => r.e !== undefined));
  O.params = m.params;
  if (m.model3d && !same(m.model3d, plain(O.model3d?.toJSON?.() ?? null))) O.model3d.load(m.model3d);
  for (const e of [...O.model.values(), ...O.layouts.flatMap((l) => [...l.entities.values()])]) O.layer(e.layer || '0');
  for (const [k, p] of T.pictures || []) { if (!(O.pictures instanceof Map)) O.pictures = new Map(); if (!O.pictures.has(k)) O.pictures.set(k, p); }
}

export async function mergeCad(baseBytes, oursBytes, theirsBytes) {
  const sb = sniff(baseBytes), so = sniff(oursBytes), st = sniff(theirsBytes);
  if ([sb, so, st].some((s) => s.kind === 'binary')) return { code: 2, error: 'Binary DXF is not read; save it as ASCII DXF.' };
  if (so.kind !== st.kind || (baseBytes.length && sb.kind !== so.kind)) return { code: 2, error: 'The three files are not the same kind of drawing (DWG and DXF cannot be mixed).' };
  const name = (s) => 'x.' + s.kind;
  let B, O, T;
  try {
    [B, O, T] = await Promise.all([
      baseBytes.length ? CadSession.open(baseBytes, name(sb)) : null,
      CadSession.open(oursBytes, name(so)),
      CadSession.open(theirsBytes, name(st)),
    ]);
  } catch (e) { return { code: 2, error: 'A drawing could not be read: ' + (e.message || e) }; }
  const m = await cadModules();
  const jb = B ? mergeable(B.doc) : mergeable(new m.Doc()), jo = mergeable(O.doc), jt = mergeable(T.doc);
  if (!B) { jb.model = {}; jb.layouts = {}; }   // no common ancestor: everything either side has is "added"
  const M = mergeJson(jb, jo, jt, {});
  const notes = [...M.notes];
  const conflicts = M.conflicts.slice();
  applyTo(O.doc, M, T.doc);
  // write it in OUR format and version
  let out;
  if (so.kind === 'dwg') out = O.save('dwg', { version: m.dwgVersionKey(so.tag) || '2018' });
  else out = O.save(so.tag === 'AC1009' ? 'dxf' : 'dxf2000');
  // the result must open again with every object that was merged
  try {
    const back = await CadSession.open(out.bytes, name(so));
    const want = Object.keys(M.merged.model).length + Object.values(M.merged.layouts).reduce((n, l) => n + Object.keys(l.entities).length, 0);
    const got = back.doc.model.size + back.doc.layouts.reduce((n, l) => n + l.entities.size, 0);
    if (got < want) notes.push(`The merged file reopens with ${got} of ${want} objects: the format cannot hold the rest (the writer's notes: ${out.notes.slice(0, 3).join('; ') || 'none'}).`);
  } catch (e) { conflicts.push({ path: '(whole file)', kind: 'invalid', ours: null, theirs: null, base: null, why: 'The merged drawing does not open again: ' + (e.message || e) }); }
  return { code: conflicts.length ? 1 : 0, bytes: out.bytes, ext: out.ext, format: out.format, conflicts, notes };
}

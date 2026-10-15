/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dynblock-read.js — dynamic blocks (0.5 DB.2): what a definition's parameters are and what each reference is set to.
 * cc-dwg, Apache-2.0. Not in the ODA spec: every layout here is a `Spec gap:` found by experiment on AutoCAD's own
 * files (docs/DWG-DYNAMIC-BLOCKS.md; probes in tools/dwg-test/dyn/). LibreDWG's source was never read.
 *
 * `readDynamic(model)` runs after the model is built (read.js) and works on the model only — the objects cc-dwg keeps
 * raw (passthrough.js `raw`), the dictionaries, XRECORDs, extension dictionaries and xdata — so the same pass serves any
 * model that carries those. It adds, validated (file data is untrusted: counts, sizes and handles checked):
 *
 *   block.dynamic = { graph (handle), params: [{ node, kind, handle, name, label?, description?, point?, grip?,
 *                     all? [entity handles], states? [{ name, entities [handles], elements [handles] }] }],
 *                     actions: [{ node, kind, handle, name }] }                         on a definition
 *   block.dynamicOf = definition block record (handle)                                    on a reference's copy
 *   insert.dyn = { def (definition block record handle), values: [{ node, kind, xrecord (its handle), data (the XRECORD's
 *                  groups), …decoded }],
 *                  state? (visibility state name) }                                       on a reference
 *
 * kind: visibility | linear | polar | xy | rotation | alignment | flip | point | basepoint | lookup | other (parameters),
 * move | stretch | scale | rotate | flip | array | polarstretch | lookup | other (actions). Only the visibility parameter
 * is decoded in full; the others carry their name (and, on references, their values).
 */
import { BitReader } from './bits-read.js';
import { unb64 } from './bits-util.js';
import { stringStreamStart } from './objects-read.js';

const hexKey = (h) => (h === undefined || h === null ? '' : String(h).toUpperCase().replace(/^0+(?=.)/, ''));
const LIMIT = { nodes: 10000, list: 100000, states: 1000, name: 255 };

const PARAMS = {
  BLOCKVISIBILITYPARAMETER: 'visibility', BLOCKLINEARPARAMETER: 'linear', BLOCKPOLARPARAMETER: 'polar', BLOCKXYPARAMETER: 'xy',
  BLOCKROTATIONPARAMETER: 'rotation', BLOCKALIGNMENTPARAMETER: 'alignment', BLOCKFLIPPARAMETER: 'flip', BLOCKPOINTPARAMETER: 'point',
  BLOCKBASEPOINTPARAMETER: 'basepoint', BLOCKLOOKUPPARAMETER: 'lookup',
};
const ACTIONS = {
  BLOCKMOVEACTION: 'move', BLOCKSTRETCHACTION: 'stretch', BLOCKSCALEACTION: 'scale', BLOCKROTATEACTION: 'rotate',
  BLOCKFLIPACTION: 'flip', BLOCKARRAYACTION: 'array', BLOCKPOLARSTRETCHACTION: 'polarstretch', BLOCKLOOKUPACTION: 'lookup',
};
const isParam = (t) => /^BLOCK.*PARAMETER$/.test(t);
const isAction = (t) => /^BLOCK.*ACTION$/.test(t);

/** A reader on a raw object's data bits; R2007+ strings come from the string stream at the end (ODA spec 20.1). */
function reader(raw) {
  const buf = unb64(raw.data);
  const r = new BitReader(buf, { version: raw.ver, endBit: raw.n });
  if (raw.ver >= 21) {
    const ss = stringStreamStart(buf, raw.n, 0);
    const s = new BitReader(buf, { version: raw.ver, startBit: raw.n, endBit: raw.n });
    if (ss !== -1) { s.pos = ss.start; s.end = ss.end; r.end = ss.start; } else r.end = raw.n - 1;
    r.str = s;
  }
  return r;
}
const cleanName = (s) => String(s ?? '').replace(/[\x00-\x1f]/g, '').slice(0, LIMIT.name);
const count = (n, max) => { if (!Number.isInteger(n) || n < 0 || n > max) throw new Error('count ' + n); return n; };

/**
 * Spec gap: the element header every dynamic-block object starts with — BL −1, BL release (27 = the AutoCAD 2007
 * format), BL maintenance, BL a 32-bit value (meaning unknown), and its name as the first string.
 */
function header(r) { r.BL(); r.BL(); r.BL(); r.BL(); return cleanName(r.TV()); }

/** Spec gap: an element's name (the first string) without decoding the rest. */
function elementName(o) {
  try { return header(reader(o.raw)); } catch { return ''; }
}

/**
 * Spec gap: ACAD_EVALUATION_GRAPH — BL, BL, BL node count, then per node BL index into the graph's handle list, BL flags,
 * BL node id, BL ×4 edge indices; the edges follow (not read). Same bits in AutoCAD 2000–2018.
 * → [{ node, handle }]
 */
export function graphNodes(o) {
  if (!o || !o.raw) return [];
  const r = reader(o.raw), refs = o.raw.h || [], out = [];
  r.BL(); r.BL();
  const n = count(r.BL(), LIMIT.nodes);
  for (let i = 0; i < n; i++) {
    const idx = r.BL(); r.BL(); const node = r.BL(); r.BL(); r.BL(); r.BL(); r.BL();
    const h = refs[idx] && refs[idx][1];
    if (Number.isInteger(node) && node >= 0 && h) out.push({ node, handle: hexKey(h) });
  }
  return out;
}

/**
 * Spec gap: BLOCKVISIBILITYPARAMETER — header · B B (show properties, chain actions) · BS ×4 · BD3 grip point · BS BS ·
 * BL node id of its grip · TV label · TV description · B B · BL n + n handles (every entity of the block) · BL states,
 * each: TV name · BL a + a handles (entities shown) · BL b + b handles (parameters and grips shown). Exact (no bit,
 * handle or string left) on every visibility parameter of the samples.
 */
export function visibilityOf(o) {
  const r = reader(o.raw), refs = (o.raw.h || []).map(([, x]) => hexKey(x));
  let k = 0;
  const take = (n) => { if (k + n > refs.length) throw new Error('handles'); const l = refs.slice(k, k + n); k += n; return l; };
  const name = header(r);
  r.B(); r.B(); r.BS(); r.BS(); r.BS(); r.BS();
  const point = r.BD3();
  r.BS(); r.BS();
  const grip = r.BL();
  const label = cleanName(r.TV()), description = cleanName(r.TV());
  r.B(); r.B();
  const all = take(count(r.BL(), LIMIT.list));
  const states = [];
  const ns = count(r.BL(), LIMIT.states);
  for (let i = 0; i < ns; i++) {
    const sname = cleanName(r.TV());
    const entities = take(count(r.BL(), LIMIT.list)), elements = take(count(r.BL(), LIMIT.list));
    states.push({ name: sname, entities, elements });
  }
  if (r.end - r.pos !== 0 || k !== refs.length) throw new Error('layout');
  if (![point.x, point.y, point.z].every(Number.isFinite)) throw new Error('point');
  return { name, label, description, point, grip, all, states };
}

/** A reference's values (an XRECORD's groups) for a parameter kind → the decoded fields. Unknown shapes stay raw. */
function valueOf(kind, data) {
  const list = Array.isArray(data) ? data : [];
  // later AutoCAD writes a header (1071, 1071, 70, 70) before the values (docs/DWG-DYNAMIC-BLOCKS.md)
  const v = list.length >= 4 && list[0][0] === 1071 && list[1][0] === 1071 && list[2][0] === 70 && list[3][0] === 70 ? list.slice(4) : list;
  const pts = v.filter(([c]) => c === 10).map(([, p]) => p).filter((p) => p && Number.isFinite(p.x) && Number.isFinite(p.y));
  const out = {};
  if (kind === 'visibility') { const s = v.find(([c]) => c === 1); if (s && typeof s[1] === 'string') out.state = cleanName(s[1]); if (pts[0]) out.point = pts[0]; }
  else if (kind === 'linear' || kind === 'alignment') { if (pts.length >= 2) { out.p1 = pts[0]; out.p2 = pts[1]; if (kind === 'linear') out.distance = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y); else out.angle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x); } }
  else if (kind === 'point' || kind === 'basepoint') { if (pts[0]) out.point = pts[0]; }
  else if (kind === 'flip') { if (pts.length >= 2) { out.p1 = pts[0]; out.p2 = pts[1]; } const f = v.find(([c]) => c === 70); if (f) out.flipped = f[1] === 1; }
  return out;
}

/**
 * The visibility state a block shows: its entities line up with the definition's (a copy holds them all, in order, the
 * hidden ones flagged invisible); the state whose list is exactly the shown ones. → name | null
 */
export function stateShown(vis, def, blk) {
  if (!blk || !def || (blk.entities || []).length !== (def.entities || []).length) return null;
  const shown = new Set();
  blk.entities.forEach((x, i) => { if (!x.invisible) shown.add(hexKey(def.entities[i].handle)); });
  const st = vis.states.find((s) => s.entities.length === shown.size && s.entities.every((h) => shown.has(hexKey(h))));
  return st ? st.name : null;
}

/** Add block.dynamic, block.dynamicOf and insert.dyn to a model (see the header). Never throws: what fails is left out. */
export function readDynamic(model) {
  const objs = new Map();
  for (const o of model.objects || []) objs.set(hexKey(o.handle), o);
  const dict = (h) => { const o = objs.get(hexKey(h)); return o && o.entries && typeof o.entries === 'object' ? o.entries : {}; };
  const recs = new Map((model.tables?.blockRecords || []).map((r) => [hexKey(r.handle), r]));
  const defs = new Map();   // definition record → its dynamic description
  let n = 0, failed = 0;
  for (const b of model.blocks || []) {
    const rr = recs.get(hexKey(b.record));
    if (!rr) continue;
    const btag = rr.xdata?.AcDbBlockRepBTag;
    const tag = Array.isArray(btag) ? btag.find(([c]) => c === 1005) : null;
    if (tag && recs.has(hexKey(tag[1]))) b.dynamicOf = hexKey(tag[1]);
    const g = rr.extDict ? objs.get(hexKey(dict(rr.extDict).ACAD_ENHANCEDBLOCK)) : null;
    if (!g || g.type !== 'ACAD_EVALUATION_GRAPH' || !g.raw) continue;
    try {
      const params = [], actions = [];
      for (const { node, handle } of graphNodes(g)) {
        const o = objs.get(handle);
        if (!o) continue;
        if (isParam(o.type)) {
          const kind = PARAMS[o.type] || 'other';
          let p = { node, kind, handle, name: elementName(o) };
          if (kind === 'visibility') { try { p = { ...p, ...visibilityOf(o) }; } catch { p.undecoded = true; } }
          params.push(p);
        } else if (isAction(o.type)) actions.push({ node, kind: ACTIONS[o.type] || 'other', handle, name: elementName(o) });
      }
      b.dynamic = { graph: hexKey(g.handle), params, actions };
      defs.set(hexKey(b.record), b);
      n++;
    } catch { failed++; }
  }
  // references: INSERT xdict → AcDbBlockRepresentation → AcDbRepData (→ definition) + AppDataCache → ACAD_ENHANCEDBLOCKDATA
  let refs = 0;
  for (const b of model.blocks || []) for (const e of b.entities || []) {
    if (e.type !== 'INSERT') continue;
    const rep = e.extDict ? dict(dict(e.extDict).AcDbBlockRepresentation) : {};
    const rd = objs.get(hexKey(rep.AcDbRepData));
    let def = rd && rd.raw && rd.raw.h && rd.raw.h[0] ? hexKey(rd.raw.h[0][1]) : '';
    if (!defs.has(def)) {   // a reference straight to the definition (no representation data)
      const own = (model.blocks || []).find((x) => x.name === e.block);
      def = own && defs.has(hexKey(own.record)) ? hexKey(own.record) : '';
    }
    const d = defs.get(def);
    if (!d) continue;
    const byNode = new Map(d.dynamic.params.map((p) => [p.node, p]));
    const values = [];
    for (const [key, xh] of Object.entries(dict(dict(rep.AppDataCache).ACAD_ENHANCEDBLOCKDATA))) {
      const node = Number(key), x = objs.get(hexKey(xh));
      if (!Number.isInteger(node) || !x || x.type !== 'XRECORD') continue;
      const p = byNode.get(node);
      if (!p) continue;   // grips and actions keep values too: left as they are in the file
      values.push({ node, kind: p.kind, xrecord: hexKey(xh), data: x.data || [], ...valueOf(p.kind, x.data) });
    }
    const vis = d.dynamic.params.find((p) => p.kind === 'visibility' && p.states);
    const vv = vis && values.find((v) => v.node === vis.node);
    const shown = vis && !(vv && vv.state !== undefined) ? stateShown(vis, d, (model.blocks || []).find((x) => x.name === e.block)) : null;
    e.dyn = { def, values, ...(vv && vv.state !== undefined ? { state: vv.state } : shown ? { state: shown } : {}) };
    refs++;
  }
  if (model.report && (n || failed)) { model.report.dynamicBlocks = n; model.report.dynamicReferences = refs; if (failed) model.report.dynamicFailed = failed; }
  return model;
}

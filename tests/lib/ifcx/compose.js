/* SPDX-License-Identifier: Apache-2.0 */
/**
 * compose.js — layers into one node tree (SU.882). What the examples' own notes say, and nothing more: a file is a list of
 * node entries; several entries (in one file or in many) can carry the same `path`; an implementation "composes the scene from
 * the available data"; a file added as a new layer provides new values.
 *
 * Our rules (the alpha text gives no more; each is a choice, kept in one place so a spec change touches only here):
 *   1. LAYER ORDER: a file's imports first (depth first, in listed order, each address once), then the file, then extra layers
 *      in the order given. Later layers override earlier ones.
 *   2. SAME PATH: entries are merged. `attributes` replaces per attribute NAME (the whole value; objects are not merged deep);
 *      `children` and `inherits` per entry NAME; a null target removes that name.
 *   3. INHERITS: a node first takes everything its inherits targets have (in listed order, later target wins), then its own
 *      attributes and children are laid over that; an own null child removes an inherited one.
 *   4. ROOTS: nodes that are no one's child and no one's inherits target.
 *   5. TRANSFORM: the attribute `usd::xformop` { transform } is the node's matrix in the row-vector form (translation in the
 *      last row); a node's world matrix is its own · its parent's.
 *
 *   loadLayers(file, { resolve, extra }) → Promise<{ layers, issues }>    resolve(uri) → text | object | null (never fetched here)
 *   composeLayers(layers) → composed
 *   resolveNode(composed, path) → { path, attributes, children } | null       inherits applied
 *   buildTree(composed) → { roots, issues }     occurrences { path, name, node, parent, children, world }
 *   validateComposed(composed) → issues         every attribute against the schemas of all layers
 */
import { parseIfcx } from './parse.js';
import { validateNode } from './validate.js';
import { IDENT, isMatrix, mulRow, isObj } from './util.js';

export const XFORM = 'usd::xformop';
export const MAX_OCCURRENCES = 2_000_000;

export async function loadLayers(file, { resolve = null, extra = [], maxDepth = 8 } = {}) {
  const layers = [];
  const issues = [];
  const seen = new Set();
  const visit = async (f, uri, depth) => {
    for (const im of f.imports || []) {
      if (seen.has(im.uri)) continue;
      seen.add(im.uri);
      if (im.integrity) issues.push({ level: 'info', code: 'ifcx.imp.integrity', vars: { uri: im.uri } });
      if (depth >= maxDepth) { issues.push({ level: 'warning', code: 'ifcx.imp.deep', vars: { uri: im.uri } }); continue; }
      let got = null;
      try { got = resolve ? await resolve(im.uri) : null; } catch (e) { got = null; }
      if (got === null || got === undefined) { issues.push({ level: 'warning', code: 'ifcx.imp.missing', vars: { uri: im.uri } }); continue; }
      let p;
      try { p = parseIfcx(got); } catch (e) { issues.push({ level: 'warning', code: 'ifcx.imp.bad', vars: { uri: im.uri, why: e.code || String(e.message) } }); continue; }
      await visit(p.file, im.uri, depth + 1);
    }
    layers.push({ uri, file: f });
  };
  await visit(file, null, 0);
  for (const e of extra) {
    const p = parseIfcx(e.file || e);
    await visit(p.file, e.uri || null, 0);
  }
  return { layers, issues };
}

export function composeLayers(layers) {
  const schemas = new Map();
  const nodes = new Map();
  const order = [];
  const issues = [];
  layers.forEach((layer, li) => {
    for (const [name, s] of Object.entries(layer.file.schemas || {})) {
      if (schemas.has(name) && JSON.stringify(schemas.get(name).value) !== JSON.stringify(s.value)) issues.push({ level: 'warning', code: 'ifcx.cmp.schema-clash', vars: { name } });
      schemas.set(name, { value: s.value, layer: li });
    }
    for (const n of layer.file.data || []) {
      let node = nodes.get(n.path);
      if (!node) { node = { path: n.path, attributes: {}, children: {}, inherits: {}, from: {}, layers: [] }; nodes.set(n.path, node); order.push(n.path); }
      if (!node.layers.includes(li)) node.layers.push(li);
      if (n.attributes) for (const [k, v] of Object.entries(n.attributes)) { node.attributes[k] = v; node.from[k] = li; }
      if (n.children) for (const [k, v] of Object.entries(n.children)) node.children[k] = v;
      if (n.inherits) for (const [k, v] of Object.entries(n.inherits)) node.inherits[k] = v;
    }
  });
  const header = layers.length ? layers[layers.length - 1].file.header : null;
  return { header, layers, schemas, nodes, order, issues, cache: new Map() };
}

export function resolveNode(composed, path, stack = []) {
  const hit = composed.cache.get(path);
  if (hit) return hit;
  const own = composed.nodes.get(path);
  if (!own) return null;
  if (stack.includes(path)) { composed.issues.push({ level: 'warning', code: 'ifcx.cmp.inherit-cycle', vars: { path } }); return { path, attributes: { ...own.attributes }, children: {} }; }
  const attributes = {};
  const children = {};
  for (const target of Object.values(own.inherits)) {
    if (target === null) continue;
    const r = resolveNode(composed, target, [...stack, path]);
    if (!r) { composed.issues.push({ level: 'warning', code: 'ifcx.cmp.inherit-missing', vars: { path, target } }); continue; }
    Object.assign(attributes, r.attributes);
    Object.assign(children, r.children);
  }
  Object.assign(attributes, own.attributes);
  for (const [name, target] of Object.entries(own.children)) { if (target === null) delete children[name]; else children[name] = target; }
  const out = { path, attributes, children, own };
  composed.cache.set(path, out);
  return out;
}

const localMatrix = (attrs) => {
  const x = attrs[XFORM];
  return isObj(x) && isMatrix(x.transform) ? x.transform : null;
};

export function buildTree(composed) {
  const issues = [];
  const isChild = new Set();
  const isTarget = new Set();
  for (const n of composed.nodes.values()) {
    for (const t of Object.values(n.children)) if (t) isChild.add(t);
    for (const t of Object.values(n.inherits)) if (t) isTarget.add(t);
  }
  let count = 0;
  const make = (path, name, parent, stack) => {
    const node = resolveNode(composed, path);
    if (!node) { issues.push({ level: 'warning', code: 'ifcx.tree.missing', vars: { path, name } }); return null; }
    if (stack.has(path)) { issues.push({ level: 'warning', code: 'ifcx.tree.cycle', vars: { path } }); return null; }
    if (++count > MAX_OCCURRENCES) return null;
    const lm = localMatrix(node.attributes);
    const local = lm || IDENT();
    const occ = { path, name, node, parent, local, world: parent ? mulRow(local, parent.world) : local, children: [] };
    stack.add(path);
    for (const [cname, cpath] of Object.entries(node.children)) {
      const c = make(cpath, cname, occ, stack);
      if (c) occ.children.push(c);
    }
    stack.delete(path);
    return occ;
  };
  const roots = [];
  for (const path of composed.order) {
    if (isChild.has(path) || isTarget.has(path)) continue;
    const r = make(path, path, null, new Set());
    if (r) roots.push(r);
  }
  if (count > MAX_OCCURRENCES) issues.push({ level: 'warning', code: 'ifcx.tree.big', vars: { n: MAX_OCCURRENCES } });
  return { roots, issues };
}

export function validateComposed(composed) {
  const out = [];
  for (const n of composed.nodes.values()) for (const i of validateNode(n.attributes, composed.schemas, n.path)) out.push(i);
  return out;
}

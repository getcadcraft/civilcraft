/* SPDX-License-Identifier: Apache-2.0 */
/**
 * stage.js — composes layers into one scene ("stage"), following the composition rules the published USD documentation
 * describes: sublayers (stronger first), and per prim, in strength order, local opinions › inherits › variants ›
 * references › payloads › specializes (LIVRPS). Values: the strongest opinion; time samples before a default in the
 * same spec; dictionaries merged key by key; list ops (apiSchemas, targets, connections) applied weakest → strongest.
 * Relationship targets and connections authored inside a reference are mapped onto the stage's names. Every prim is
 * composed on its own (instances are flattened). A reference that leads back to itself, or a missing file, is left out
 * with a note. DOM-free.
 *
 *   openStage(rootName, { read(name) → Uint8Array | null, loadPayloads = true, variants: {'/Path': {set: choice}}, limits })
 *   stageFromLayer(layer, opts)        one layer already read (no outside files unless opts.read is given)
 *   → Stage { meta, root, notes, layers, prim(path), *walk() }
 *
 * CPrim { path, name, typeName, specifier, defined, active, meta: Map<field, Value>, props: Map<name, CProp>,
 *         children: CPrim[], parent, variantSelection: Map }
 * CProp { name, kind: 'attribute' | 'relationship', typeName, custom, variability, value: Value | null,
 *         timeSamples: [[t, Value|null]] | null, connections: string[], targets: string[], meta: Map }
 */
import { UsdError, limitsOf } from './util.js';
import { path as P, applyListOp } from './sdf.js';
import { readUsdc, isUsdc } from './usdc-read.js';
import { readUsda } from './usda-read.js';
import { readUsdz, isZip } from './usdz.js';
import { msg } from './messages.js';

/** Read one file's bytes as a layer (text, binary, or the root layer of a package). → { layer, package } */
export function parseLayer(bytes, opts = {}) {
  if (isZip(bytes)) {
    const pkg = readUsdz(bytes, opts);
    const inner = pkg.files.get(pkg.root);
    return { layer: isUsdc(inner) ? readUsdc(inner, opts) : readUsda(inner, opts), package: pkg };
  }
  return { layer: isUsdc(bytes) ? readUsdc(bytes, opts) : readUsda(bytes, opts), package: null };
}

/** POSIX-style join of an asset path to the name of the layer that wrote it. */
export function resolveName(asset, anchor) {
  if (!asset) return anchor;
  if (/^[a-z][a-z0-9+.-]*:/i.test(asset) || asset.startsWith('/')) return asset;
  const dir = anchor.includes('/') ? anchor.slice(0, anchor.lastIndexOf('/') + 1) : '';
  const joined = dir + asset;
  const out = [];
  for (const s of joined.split('/')) { if (s === '.' || s === '') continue; if (s === '..') out.pop(); else out.push(s); }
  return (joined.startsWith('/') ? '/' : '') + out.join('/');
}

const META_SKIP = new Set(['specifier', 'typeName', 'primChildren', 'properties', 'variantSetNames', 'variantSelection',
  'variantSetChildren', 'references', 'payload', 'inheritPaths', 'specializes', 'primOrder', 'propertyOrder']);
const MERGE_DICT = new Set(['customData', 'assetInfo']);

export function openStage(rootName, opts = {}) {
  const st = new Composer(opts);
  return st.open(rootName);
}
export function stageFromLayer(layer, opts = {}) {
  const st = new Composer(opts);
  st.cache.set(opts.name || 'root.usda', { layer, error: null });
  return st.open(opts.name || 'root.usda');
}

class Composer {
  constructor(opts) {
    this.opts = opts;
    this.limits = limitsOf(opts);
    this.read = opts.read || (() => null);
    this.cache = new Map();      // name → {layer, error}
    this.packages = new Map();   // package name → files
    this.stacks = new Map();     // root layer name → stack
    this.notes = [];
    this.noted = new Set();
    this.skippedPayloads = 0;
    this.count = 0;
  }
  note(key, fills) { const s = msg(key, fills); if (!this.noted.has(s)) { this.noted.add(s); this.notes.push(s); } }

  /** A layer by resolved name; null (with a note) when it can't be read. */
  layer(name) {
    if (this.cache.has(name)) return this.cache.get(name).layer;
    if (this.cache.size >= this.limits.layers) throw new UsdError('too_big', msg('ccusd.too_big', { what: this.cache.size + ' layers' }));
    let bytes = null;
    // inside a package: 'pkg.usdz[inner/path.usda]'
    const m = /^(.*)\[(.+)\]$/.exec(name);
    if (m) bytes = this.packageFile(m[1], m[2]);
    else bytes = this.read(name);
    if (!bytes) { this.cache.set(name, { layer: null }); this.note('ccusd.note.missing_layer', { name: name.replace(/^.*\[/, '').replace(/\]$/, '') }); return null; }
    let layer;
    if (isZip(bytes)) {
      const pkg = readUsdz(bytes, this.opts);
      this.packages.set(name, pkg.files);
      layer = this.layer(name + '[' + pkg.root + ']');
      this.cache.set(name, { layer });
      return layer;
    }
    try {
      layer = isUsdc(bytes) ? readUsdc(bytes, this.opts) : readUsda(bytes, this.opts);
    } catch (e) {
      // the root must read; a file it refers to that can't be read (a MaterialX document, a damaged layer) is left out
      if (!this.cache.size || !(e instanceof UsdError) || e.code === 'too_big') throw e;
      this.cache.set(name, { layer: null });
      this.note('ccusd.note.unread_layer', { name: name.replace(/^.*\//, ''), why: e.message });
      return null;
    }
    layer.name = name;
    this.cache.set(name, { layer });
    return layer;
  }
  packageFile(pkgName, inner) {
    if (!this.packages.has(pkgName)) { if (!this.layer(pkgName)) return null; }
    const files = this.packages.get(pkgName);
    return files ? files.get(inner) || null : null;
  }
  /** Asset path → resolved layer name, anchored at a layer (inside a package, relative to the package). */
  resolve(asset, anchor) {
    const m = /^(.*)\[(.+)\]$/.exec(anchor);
    if (m) {
      const inner = resolveName(asset, m[2]);
      if (this.packages.get(m[1])?.has(inner)) return m[1] + '[' + inner + ']';
      return resolveName(asset, m[1]);
    }
    return resolveName(asset, anchor);
  }
  /** Root layer + sublayers, strongest first, each once. */
  stack(name) {
    if (this.stacks.has(name)) return this.stacks.get(name);
    const layers = [];
    const seen = new Set();
    const add = (n, depth) => {
      if (seen.has(n) || depth > this.limits.depth) return;
      seen.add(n);
      const L = this.layer(n);
      if (!L) return;
      layers.push(L);
      for (const sub of L.meta('subLayers', [])) add(this.resolve(sub, n), depth + 1);
    };
    add(name, 0);
    const s = { id: this.stacks.size, name, layers };
    this.stacks.set(name, s);
    return s;
  }

  open(rootName) {
    const stack = this.stack(rootName);
    const rootLayer = stack.layers[0];
    if (!rootLayer) throw new UsdError('missing', msg('ccusd.missing', { name: rootName }));
    const metaOf = (k, d) => { for (const L of stack.layers) { const v = L.meta(k); if (v !== null) return v; } return d; };
    const meta = {
      // the fallbacks the published schema gives when a layer says nothing
      metersPerUnit: metaOf('metersPerUnit', 0.01), upAxis: metaOf('upAxis', 'Y'), defaultPrim: rootLayer.meta('defaultPrim', ''),
      startTimeCode: metaOf('startTimeCode', null), endTimeCode: metaOf('endTimeCode', null),
      timeCodesPerSecond: metaOf('timeCodesPerSecond', 24), doc: rootLayer.meta('documentation', ''),
      customLayerData: rootLayer.meta('customLayerData', null),
    };
    const root = { path: '/', name: '', children: [], props: new Map(), meta: new Map(), parent: null, defined: true, active: true };
    const names = [];
    for (const L of stack.layers) for (const n of L.get('/', 'primChildren', [])) if (!names.includes(n)) names.push(n);
    for (const n of names) {
      const src = [{ stack, path: '/' + n, from: '/', to: '/', layer: null }];
      const c = this.compose('/' + n, n, src, root);
      if (c) root.children.push(c);
    }
    if (this.skippedPayloads) this.note('ccusd.note.skipped_payloads', { n: this.skippedPayloads });
    const byPath = new Map();
    const walk = function* (p) { for (const c of p.children) { yield c; yield* walk(c); } };
    for (const p of walk(root)) byPath.set(p.path, p);
    return {
      meta, root, notes: this.notes, layers: [...this.cache.values()].map((x) => x.layer).filter(Boolean),
      prim: (p) => byPath.get(p) || null,
      *walk() { yield* walk(root); },
    };
  }

  /** Expand sources (each {stack, path, from, to}) with their arcs, in strength order. */
  expand(sources, stagePath, sel) {
    const out = [];
    const visit = (src, chain, depth) => {
      if (depth > this.limits.depth) return;
      const key = src.stack.id + '|' + src.path;
      if (chain.has(key)) { this.note('ccusd.note.loop', { name: src.path }); return; }
      const specs = src.stack.layers.map((L) => [L, L.specs.get(src.path)]).filter(([, s]) => s);
      if (!specs.length) return;
      out.push(src);
      const next = new Set(chain).add(key);
      // variant selections authored here (a stronger one, already in `sel`, wins)
      for (const [, s] of specs) {
        const vs = s.fields.get('variantSelection');
        if (vs) for (const [k, v] of vs.v) if (!sel.has(k)) sel.set(k, v);
      }
      const listOf = (field) => {
        let items = [];
        for (let i = specs.length - 1; i >= 0; i--) { const f = specs[i][1].fields.get(field); if (f) items = applyListOp(f.v, items); }
        return items;
      };
      // a class (inherits / specializes) maps its own names onto this prim; a variant keeps this source's mapping
      const classArc = (c) => ({ stack: src.stack, path: c, from: c, to: stagePath });
      for (const c of listOf('inheritPaths')) visit(classArc(c), next, depth + 1);
      const sets = listOf('variantSetNames');
      const forced = this.opts.variants && this.opts.variants[stagePath];
      for (const set of sets) {
        const choice = (forced && forced[set]) || sel.get(set);
        if (choice) visit({ stack: src.stack, path: src.path + '{' + set + '=' + choice + '}', from: src.from, to: src.to }, next, depth + 1);
      }
      for (const r of listOf('references')) this.arc(r, src, specs, visit, next, depth, stagePath);
      for (const r of listOf('payload')) {
        if (this.opts.loadPayloads === false) { this.skippedPayloads++; continue; }
        this.arc(r, src, specs, visit, next, depth, stagePath);
      }
      for (const c of listOf('specializes')) visit(classArc(c), next, depth + 1);
    };
    for (const s of sources) visit(s, new Set(), 0);
    return out;
  }
  arc(r, src, specs, visit, next, depth, stagePath) {
    // the layer that authored the arc anchors its asset path
    const authored = specs.find(([, s]) => s.fields.get('references') || s.fields.get('payload'));
    const anchor = authored ? authored[0].name || src.stack.name : src.stack.name;
    let stack = src.stack;
    if (r.asset) {
      const name = this.resolve(r.asset, anchor);
      stack = this.stack(name);
      if (!stack.layers.length) return;
    }
    let target = r.prim;
    if (!target) {
      const dp = stack.layers[0].meta('defaultPrim', '');
      if (!dp) return;
      target = dp.startsWith('/') ? dp : '/' + dp;
    }
    // names inside the referenced prim land under the prim that holds the reference
    visit({ stack, path: target, from: target, to: stagePath }, next, depth + 1);
  }

  compose(stagePath, name, sources, parent) {
    if (++this.count > this.limits.specs) throw new UsdError('too_big', msg('ccusd.too_big', { what: this.count + ' prims' }));
    const sel = new Map();
    const srcs = this.expand(sources, stagePath, sel);
    if (!srcs.length) return null;
    // every spec of the prim, strongest first, with the source it came from
    const specs = [];
    for (const s of srcs) for (const L of s.stack.layers) { const sp = L.specs.get(s.path); if (sp) specs.push({ L, sp, s }); }
    const field = (k) => { for (const x of specs) { const f = x.sp.fields.get(k); if (f) return f; } return null; };
    let specifier = 'over';
    for (const x of specs) { const v = x.sp.fields.get('specifier')?.v; if (v && v !== 'over') { specifier = v; break; } }
    const meta = new Map();
    for (let i = specs.length - 1; i >= 0; i--) {
      for (const [k, v] of specs[i].sp.fields) {
        if (META_SKIP.has(k)) continue;
        if (MERGE_DICT.has(k) && meta.has(k)) meta.set(k, { t: 'dictionary', v: mergeDict(meta.get(k).v, v.v) });
        else if (k === 'apiSchemas') meta.set(k, { t: 'tokens', v: applyListOp(v.v, meta.get(k)?.v || []) });
        else meta.set(k, v);
      }
    }
    const active = meta.get('active')?.v !== false;
    // an instance: the strongest reference/payload/inherit target is its prototype (the same key = the same geometry)
    let instanceKey = null;
    if (meta.get('instanceable')?.v === true) {
      const arc = srcs.find((s) => s.path !== sources[0].path || s.stack !== sources[0].stack);
      if (arc) instanceKey = arc.stack.name + '|' + arc.path;
    }
    const prim = {
      path: stagePath, name, typeName: field('typeName')?.v || '', specifier, defined: specifier === 'def' && parent.defined !== false,
      active, meta, props: new Map(), children: [], parent, variantSelection: sel, instanceKey,
    };
    // properties
    const propNames = [];
    for (const x of specs) for (const n of x.sp.fields.get('properties')?.v || []) if (!propNames.includes(n)) propNames.push(n);
    for (const n of propNames) {
      const ps = [];
      for (const x of specs) { const s = x.L.specs.get(x.s.path + '.' + n); if (s) ps.push({ L: x.L, sp: s, s: x.s }); }
      if (ps.length) prim.props.set(n, composeProp(n, ps, stagePath));
    }
    if (!active) return prim;
    // children: strongest order first, then names only weaker specs have
    const names = [];
    for (const x of specs) for (const n of x.sp.fields.get('primChildren')?.v || []) if (!names.includes(n)) names.push(n);
    const order = field('primOrder')?.v;
    if (order) names.sort((a, b) => (order.includes(a) ? order.indexOf(a) : 1e9) - (order.includes(b) ? order.indexOf(b) : 1e9));
    for (const n of names) {
      const childSources = srcs.map((s) => ({ stack: s.stack, path: P.child(s.path, n), from: s.from, to: s.to }));
      const c = this.compose(stagePath === '/' ? '/' + n : stagePath + '/' + n, n, childSources, prim);
      if (c) prim.children.push(c);
    }
    return prim;
  }
}

function composeProp(name, ps, stagePath) {
  const first = ps[0].sp;
  const kind = first.type === 'relationship' ? 'relationship' : 'attribute';
  const f = (k) => { for (const x of ps) { const v = x.sp.fields.get(k); if (v) return v; } return null; };
  const map = (x) => (t) => mapTarget(t, x.s, stagePath);
  let value = null, timeSamples = null;
  for (const x of ps) {
    const ts = x.sp.fields.get('timeSamples'), d = x.sp.fields.get('default');
    if (ts) { timeSamples = ts.v; value = d || null; break; }
    if (d) { value = d.t === 'block' ? null : d; break; }
  }
  let targets = [], connections = [];
  for (let i = ps.length - 1; i >= 0; i--) {
    const t = ps[i].sp.fields.get('targetPaths'), c = ps[i].sp.fields.get('connectionPaths');
    if (t) targets = applyListOp({ ...t.v, ...mapOp(t.v, map(ps[i])) }, targets);
    if (c) connections = applyListOp({ ...c.v, ...mapOp(c.v, map(ps[i])) }, connections);
  }
  const meta = new Map();
  const STRUCT = new Set(['typeName', 'custom', 'variability', 'default', 'timeSamples', 'targetPaths', 'connectionPaths']);
  for (let i = ps.length - 1; i >= 0; i--) for (const [k, v] of ps[i].sp.fields) if (!STRUCT.has(k)) meta.set(k, MERGE_DICT.has(k) && meta.has(k) ? { t: 'dictionary', v: mergeDict(meta.get(k).v, v.v) } : v);
  return {
    name, kind, typeName: f('typeName')?.v || '', custom: !!f('custom')?.v, variability: f('variability')?.v || (kind === 'relationship' ? 'uniform' : 'varying'),
    value, timeSamples, targets, connections, meta,
  };
}
function mapOp(op, fn) {
  const out = {};
  for (const k of ['explicitItems', 'addedItems', 'prependedItems', 'appendedItems', 'deletedItems', 'orderedItems']) if (op[k]) out[k] = op[k].map(fn);
  return out;
}
/** A target authored in a source's namespace → the stage's (paths outside the arc's prim stay as written). */
function mapTarget(t, src, stagePath) {
  if (!t || !t.startsWith('/')) return t;
  const strip = (p) => p.replace(/\{[^}]*\}/g, '/').replace(/\/\/+/g, '/').replace(/\/$/, '');
  const from = strip(src.from) || '/', to = src.to;
  if (from === to) return t;
  if (t === from) return to;
  if (t.startsWith(from + '/') || t.startsWith(from + '.')) return to + t.slice(from.length);
  void stagePath;
  return t;
}
function mergeDict(weak, strong) {
  const out = new Map(weak);
  for (const [k, v] of strong) {
    if (v.t === 'dictionary' && out.get(k)?.t === 'dictionary') out.set(k, { t: 'dictionary', v: mergeDict(out.get(k).v, v.v) });
    else out.set(k, v);
  }
  return out;
}

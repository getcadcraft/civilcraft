/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nodes is a standalone library; its errors are codes (the app words them, see words.js). */
/**
 * graph.js — cc-nodes (0.8 round 3, nodes_PART_3; DC.54): the node graph and its evaluator. DOM-free, no randomness, no clock: the same
 * graph gives the same values on every machine, in Node, the page and a worker (the tests compare them byte for byte).
 *
 *   const g = new Graph();   g.add('point', { params: { x: 1 } }) → 'n1' · g.connect({ node, port }, { node, port }) · g.setParam(id, name, v)
 *   g.remove(id) · g.disconnect(to) · g.move(id, [x, y]) · g.setShow(id, bool) · g.toJSON() / Graph.fromJSON(raw)  (format 'cadcraft-nodes' v1)
 *   g.canConnect(from, to) → null | { code, vars }    typed ports, units (a length never feeds an angle), no cycles, one wire per single input
 *   g.units() → { 'n1.out': 'length', … }             the unit each output carries, from the wires
 *   const ev = new Evaluator(g);  ev.run() → { values: { id: { port: value } }, errors: { id: { code, vars } }, shown: [{ id, port, value }], order }
 *     unchanged nodes are not recomputed (a signature of the node's settings and of its inputs' versions); a node whose input failed says so
 *     and its own outputs are left out; an error never stops the rest of the graph.
 * Lists: a value that arrives as a list at a single-value port runs the node once per item ("longest list", the last item repeats);
 * its outputs become lists. A list port given a single value takes it as a list of one. A `multi` list port joins its wires in order.
 */
import { LIBRARY, BY_ID } from './library.js';
import { NodeError, fail, typeOf, typeFits, valueFits, unitFits, resolveUnit, vec } from './types.js';
import * as N from '../nurbs/index.js';

export const FORMAT = 'cadcraft-nodes';
export const VERSION = 1;
export const CAPS = Object.freeze({ nodes: 2000, wires: 8000, list: 100000, text: 200, depthWarn: 256 });
const portIn = (def, name) => def.ins.find((p) => p.name === name);
const portOut = (def, name) => def.outs.find((p) => p.name === name);
const key = (r) => r.node + '.' + r.port;

export class Graph {
  constructor() { this.nodes = []; this.wires = []; this.next = 1; this.dropped = []; }

  node(id) { return this.nodes.find((n) => n.id === id) || null; }
  def(id) { const n = this.node(id); return n ? BY_ID[n.type] : null; }

  // ---- editing --------------------------------------------------------------------------------------------------------------
  add(type, { params = {}, pos = null, id = null, show = false } = {}) {
    const def = BY_ID[type];
    if (!def) fail('nodes.err.unknown_type', { type });
    if (this.nodes.length >= CAPS.nodes) fail('nodes.err.too_many', { max: CAPS.nodes });
    if (!id) id = 'n' + this.next;
    if (this.node(id)) fail('nodes.err.duplicate', { id });
    const m = /^n(\d+)$/.exec(id);
    this.next = Math.max(this.next, m ? +m[1] + 1 : this.next);
    const clean = {};
    for (const [k, v] of Object.entries(params)) { const p = portIn(def, k); if (p) { const x = literal(p, v); if (JSON.stringify(x) !== JSON.stringify(defaultOf(p))) clean[k] = x; } }
    this.nodes.push({ id, type, params: clean, pos: pos ? [+pos[0] || 0, +pos[1] || 0] : [0, 0], show: !!show });
    return id;
  }
  remove(id) {
    if (!this.node(id)) return false;
    this.nodes = this.nodes.filter((n) => n.id !== id);
    this.wires = this.wires.filter((w) => w.from.node !== id && w.to.node !== id);
    return true;
  }
  setParam(id, name, value) {
    const n = this.node(id), p = n && portIn(BY_ID[n.type], name);
    if (!p) fail('nodes.err.no_port', { id, port: name });
    const v = literal(p, value);
    if (JSON.stringify(v) === JSON.stringify(defaultOf(p))) delete n.params[name]; else n.params[name] = v;   // a setting equal to the default is not kept: one form per graph
  }
  move(id, pos) { const n = this.node(id); if (n) n.pos = [+pos[0] || 0, +pos[1] || 0]; }
  setShow(id, on) { const n = this.node(id); if (n) n.show = !!on; }

  /** null when `from` (an output) may feed `to` (an input), else { code, vars }. */
  canConnect(from, to) {
    const fd = this.def(from.node), td = this.def(to.node);
    if (!fd || !td) return { code: 'nodes.err.no_node', vars: {} };
    const po = portOut(fd, from.port), pi = portIn(td, to.port);
    if (!po || !pi) return { code: 'nodes.err.no_port', vars: { id: !po ? from.node : to.node, port: !po ? from.port : to.port } };
    if (from.node === to.node) return { code: 'nodes.err.cycle', vars: {} };
    if (!typeFits(po.type, pi.type)) return { code: 'nodes.err.type', vars: { from: po.type, to: pi.type } };
    let u;
    try { u = this.units()[key(from)] ?? ''; } catch { u = po.unit || ''; }
    const numeric = (t) => t === 'number' || t === 'point' || t === 'vector';
    if (numeric(po.type) && numeric(pi.type) && !unitFits(u, pi.unit)) return { code: 'nodes.err.unit', vars: { from: u, to: pi.unit } };
    if (this.reaches(to.node, from.node)) return { code: 'nodes.err.cycle', vars: {} };
    if (pi.unit === '*' || td.unit) {   // would the units this node now sees still agree?
      const keep = this.wires;
      this.wires = keep.filter((w) => pi.multi || !(w.to.node === to.node && w.to.port === to.port)).concat([{ from, to }]);
      let clash = false;
      try { clash = this.units()[to.node + '.' + td.outs[0].name] === undefined; } catch { clash = true; } finally { this.wires = keep; }
      if (clash) return { code: 'nodes.err.units', vars: { a: u || '', b: '' } };
    }
    if (this.wires.length >= CAPS.wires) return { code: 'nodes.err.too_many', vars: { max: CAPS.wires } };
    return null;
  }
  /** Does a wire path lead from node `a` to node `b`? */
  reaches(a, b) {
    const seen = new Set(), stack = [a];
    while (stack.length) {
      const x = stack.pop();
      if (x === b) return true;
      if (seen.has(x)) continue;
      seen.add(x);
      for (const w of this.wires) if (w.from.node === x) stack.push(w.to.node);
    }
    return false;
  }
  connect(from, to) {
    const bad = this.canConnect(from, to);
    if (bad) fail(bad.code, bad.vars);
    const pi = portIn(this.def(to.node), to.port);
    if (!pi.multi) this.wires = this.wires.filter((w) => !(w.to.node === to.node && w.to.port === to.port));
    else if (this.wires.some((w) => key(w.from) === key(from) && key(w.to) === key(to))) return;
    this.wires.push({ from: { node: from.node, port: from.port }, to: { node: to.node, port: to.port } });
  }
  /** Remove the wire(s) into an input; `from` narrows it to one source (for multi inputs). */
  disconnect(to, from = null) {
    const n = this.wires.length;
    this.wires = this.wires.filter((w) => !(w.to.node === to.node && w.to.port === to.port && (!from || key(w.from) === key(from))));
    return this.wires.length !== n;
  }
  wiresInto(id, port) { return this.wires.filter((w) => w.to.node === id && w.to.port === port); }

  // ---- order and units ------------------------------------------------------------------------------------------------------
  /** Topological order; among nodes that could go in any order, the one added first goes first. */
  order() {
    const idx = new Map(this.nodes.map((n, k) => [n.id, k])), indeg = new Map(this.nodes.map((n) => [n.id, 0]));
    for (const w of this.wires) indeg.set(w.to.node, indeg.get(w.to.node) + 1);
    const ready = this.nodes.filter((n) => indeg.get(n.id) === 0).map((n) => n.id), out = [];
    while (ready.length) {
      ready.sort((a, b) => idx.get(a) - idx.get(b));
      const id = ready.shift();
      out.push(id);
      for (const w of this.wires) if (w.from.node === id) { const d = indeg.get(w.to.node) - 1; indeg.set(w.to.node, d); if (d === 0) ready.push(w.to.node); }
    }
    if (out.length !== this.nodes.length) fail('nodes.err.cycle');
    return out;
  }
  /** The unit each output carries ('length', 'angle' or ''), by wires; a node whose units clash is left out of the map. */
  units() {
    const map = {};
    for (const id of this.order()) {
      const def = this.def(id);
      const ins = def.ins.map((p) => { const ws = this.wiresInto(id, p.name); return ws.length ? (map[key(ws[0].from)] ?? '') : (p.unit === '*' ? '' : p.unit); });
      let u = '';
      try { u = resolveUnit(def.unit, ins); } catch { u = null; }
      if (u === null) continue;
      for (const o of def.outs) map[id + '.' + o.name] = def.unit === '' || def.unit === undefined ? (o.unit || '') : u;
    }
    return map;
  }

  /** Lay the nodes out in columns by depth (a quick tidy; the person's own positions are kept by `move`). */
  layout({ dx = 230, dy = 150 } = {}) {
    const depth = new Map();
    for (const id of this.order()) depth.set(id, Math.max(-1, ...this.wires.filter((w) => w.to.node === id).map((w) => depth.get(w.from.node))) + 1);
    const rows = new Map();
    for (const n of this.nodes) { const d = depth.get(n.id), r = rows.get(d) || 0; rows.set(d, r + 1); n.pos = [d * dx, r * dy]; }
  }

  // ---- file -----------------------------------------------------------------------------------------------------------------
  /** Wires by target node (creation order), then target port (declaration order); a multi input keeps its wires' order. */
  sortedWires() {
    const ni = new Map(this.nodes.map((n, k) => [n.id, k]));
    const pi = (w) => BY_ID[this.node(w.to.node).type].ins.findIndex((p) => p.name === w.to.port);
    return this.wires.map((w, k) => ({ w, k })).sort((a, b) => ni.get(a.w.to.node) - ni.get(b.w.to.node) || pi(a.w) - pi(b.w) || a.k - b.k).map((x) => x.w);
  }
  toJSON() {
    return {
      format: FORMAT, version: VERSION,
      nodes: this.nodes.map((n) => ({ id: n.id, type: n.type, params: sortedParams(n.params), pos: n.pos.map((x) => +x.toFixed(2)), show: n.show || undefined })),
      wires: this.sortedWires().map((w) => ({ from: [w.from.node, w.from.port], to: [w.to.node, w.to.port] })),
    };
  }
  /** Read a graph from a file's data (untrusted): whatever is wrong is left out and listed in `dropped`, never thrown. */
  static fromJSON(raw) {
    const g = new Graph();
    if (!raw || typeof raw !== 'object' || raw.format !== FORMAT) { if (raw) g.dropped.push({ code: 'nodes.err.format' }); return g; }
    for (const n of Array.isArray(raw.nodes) ? raw.nodes : []) {
      try {
        if (!n || typeof n.id !== 'string' || !/^[A-Za-z][A-Za-z0-9_]{0,30}$/.test(n.id)) throw new NodeError('nodes.err.no_node');
        g.add(String(n.type), { id: n.id, params: n.params && typeof n.params === 'object' ? n.params : {}, pos: Array.isArray(n.pos) ? n.pos : null, show: n.show });
      } catch (e) { g.dropped.push({ code: e.code || 'nodes.err.bad', vars: e.vars || {}, id: n && n.id }); }
    }
    for (const w of Array.isArray(raw.wires) ? raw.wires : []) {
      try { g.connect({ node: String(w.from[0]), port: String(w.from[1]) }, { node: String(w.to[0]), port: String(w.to[1]) }); }
      catch (e) { g.dropped.push({ code: e.code || 'nodes.err.bad', vars: e.vars || {}, wire: w }); }
    }
    return g;
  }
  clone() { return Graph.fromJSON(JSON.parse(JSON.stringify(this.toJSON()))); }
}

function sortedParams(p) { const o = {}; for (const k of Object.keys(p).sort()) o[k] = p[k]; return o; }

/** Keep a typed-in setting in a form that is saved and compared: numbers, yes/no, text, [x, y, z]. */
function literal(port, v) {
  if (port.type === 'point' || port.type === 'vector') {
    const a = Array.isArray(v) || ArrayBuffer.isView(v) ? [...v] : null;
    if (!a || a.length !== 3 || a.some((x) => !Number.isFinite(+x))) fail('nodes.err.bad_value', { port: port.name });
    return a.map(Number);
  }
  if (port.type === 'number') { const x = typeof v === 'string' && v.trim() !== '' ? Number(v) : v; if (typeof x !== 'number' || !Number.isFinite(x)) fail('nodes.err.bad_value', { port: port.name }); return x; }
  if (port.type === 'bool') return !!v;
  if (port.type === 'text') return String(v).slice(0, CAPS.text);
  return v;
}

const defaultOf = (p) => (p.def instanceof Float64Array ? [...p.def] : p.def);

/** The value a port starts with, as a run-time value (a point's [x, y, z] becomes a Float64Array). */
function literalValue(p, v) { return (p.type === 'point' || p.type === 'vector') && Array.isArray(v) && v.length === 3 && v.every((x) => typeof x === 'number') ? Float64Array.from(v) : v; }

export class Evaluator {
  constructor(graph) { this.g = graph; this.cache = new Map(); this.clock = 0; this.stats = { run: 0, reused: 0 }; }

  run() {
    const g = this.g, values = {}, errors = {}, ver = {};
    this.stats = { run: 0, reused: 0 };
    let order;
    try { order = g.order(); } catch (e) { return { values, errors: { '': { code: e.code, vars: e.vars || {} } }, shown: [], order: [] }; }
    const alive = new Set(g.nodes.map((n) => n.id));
    for (const id of [...this.cache.keys()]) if (!alive.has(id)) this.cache.delete(id);
    for (const id of order) {
      const node = g.node(id), def = BY_ID[node.type];
      const into = {};   // port → [{ value, from }]
      let upstream = null;
      for (const p of def.ins) {
        const ws = g.wiresInto(id, p.name);
        into[p.name] = ws;
        for (const w of ws) if (errors[w.from.node] || !values[w.from.node]) upstream = upstream || w.from.node;
      }
      if (upstream) { errors[id] = { code: 'nodes.err.upstream', vars: { id: upstream }, upstream: true }; this.cache.delete(id); ver[id] = ++this.clock; continue; }
      const sig = JSON.stringify([node.type, def.ins.map((p) => into[p.name].length ? into[p.name].map((w) => [w.from.node, w.from.port, ver[w.from.node]]) : node.params[p.name] ?? null)]);
      const hit = this.cache.get(id);
      if (hit && hit.sig === sig) {
        this.stats.reused++; ver[id] = hit.version;
        if (hit.err) errors[id] = hit.err; else values[id] = hit.outs;
        continue;
      }
      this.stats.run++;
      let outs = null, err = null;
      try { outs = evalNode(def, node, into, values); } catch (e) { err = toErr(e); }
      const version = ++this.clock;
      this.cache.set(id, { sig, version, outs, err });
      ver[id] = version;
      if (err) errors[id] = err; else values[id] = outs;
    }
    const shown = [];
    for (const id of order) { const n = g.node(id); if (n.show && values[id]) for (const o of BY_ID[n.type].outs) shown.push({ id, port: o.name, value: values[id][o.name] }); }
    return { values, errors, shown, order };
  }
}

function toErr(e) {
  if (e instanceof NodeError) return { code: e.code, vars: e.vars };
  if (e && typeof e.code === 'string' && e.code.startsWith('nurbs.')) return { code: e.code, vars: e.vars || {} };   // cc-nurbs words its own errors
  return { code: 'nodes.err.failed', vars: { message: String(e && e.message || e) } };
}

function evalNode(def, node, into, values) {
  const a = {}, lists = [];
  for (const p of def.ins) {
    const ws = into[p.name];
    let v;
    if (ws.length) {
      const parts = ws.map((w) => values[w.from.node][w.from.port]);
      if (p.multi) v = parts.flatMap((x) => (Array.isArray(x) ? x : [x]));
      else v = parts[0];
    } else if (node.params[p.name] !== undefined) v = literalValue(p, node.params[p.name]);
    else if (p.multi) v = [];
    else if (p.def !== null && p.def !== undefined) v = literalValue(p, defaultOf(p));
    else fail('nodes.err.missing', { port: p.name });
    if (p.list && !Array.isArray(v)) v = [v];
    if (p.multi && !ws.length) v = v.flatMap((x) => (Array.isArray(x) ? x : [x]));   // {a, b} in a script joins like several wires
    if (p.list) { for (const x of v) checkType(p, x); }
    else if (Array.isArray(v)) { for (const x of flat(v)) checkType(p, x); lists.push(p.name); }
    else checkType(p, v);
    a[p.name] = v;
  }
  if (!lists.length) return pack(def, def.run(a, { N }));
  const lens = lists.map((k) => a[k].length), n = Math.max(...lens);
  if (n > CAPS.list) fail('nodes.err.count', { max: CAPS.list });
  if (lens.includes(0)) return Object.fromEntries(def.outs.map((o) => [o.name, []]));
  const outs = Object.fromEntries(def.outs.map((o) => [o.name, []]));
  for (let k = 0; k < n; k++) {
    const b = { ...a };
    for (const name of lists) b[name] = a[name][Math.min(k, a[name].length - 1)];
    const r = pack(def, def.run(b, { N }));
    for (const o of def.outs) outs[o.name].push(r[o.name]);
  }
  return outs;
}
function flat(v) { return v.flatMap((x) => (Array.isArray(x) ? flat(x) : [x])); }
function checkType(p, x) {
  if (!valueFits(x, p.type)) fail('nodes.err.value_type', { port: p.name, want: p.type, got: typeOf(x) });
}
function pack(def, r) {
  if (def.outs.length === 1) {
    const o = def.outs[0];
    if (o.list && !Array.isArray(r)) fail('nodes.err.failed', { message: 'list expected' });
    return { [o.name]: r };
  }
  return r;
}



/** Run one node on plain arguments (by port name): what a CraftScript call `nd_<id>(…)` does. Lists broadcast exactly as in a graph. */
export function callNode(type, args) {
  const def = BY_ID[type];
  if (!def) fail('nodes.err.unknown_type', { type });
  const into = Object.fromEntries(def.ins.map((p) => [p.name, []]));
  return evalNode(def, { id: '_', type, params: args }, into, {});
}

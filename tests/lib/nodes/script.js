/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nodes is a standalone library; its errors are codes (the app words them, see words.js). */
/**
 * script.js — cc-nodes (0.8 round 3, nodes_PART_3; DC.54): a node graph and a CraftScript are the same thing written two ways.
 *
 *   toScript(graph) → text      one statement per node, in evaluation order:   n3 = nd_circle(n1, 10, [0 0 1]);
 *   fromScript(text) → Graph    reads that same text back (the subset toScript writes: calls of nd_<node>, names, numbers, 'text',
 *                               true/false, [x y z], {a, b}); a node's place is kept in a `% at n3 120 40` comment, `% show n3` shows it
 *   register(registerBuiltin, H)  makes every node the CraftScript builtin `nd_<id>` (H = the host runtime's value helpers, see below)
 * A node with several outputs is written `[n2_x, n2_y, n2_z] = nd_xyz(n1);` (names are <id>_<port>). Geometry crosses into script as
 * struct(kind, json): scripts pass it between nd_ calls, they do not edit it.
 */
import { BY_ID } from './library.js';
import { Graph, callNode } from './graph.js';
import { NodeError, fail, typeOf, vec } from './types.js';

export const PREFIX = 'nd_';
const num = (x) => (Object.is(x, -0) ? '0' : String(+x));

function lit(p, v) {
  const t = typeOf(v);
  if (t === 'number') return num(v);
  if (t === 'bool') return v ? 'true' : 'false';
  if (t === 'text') return "'" + v.replace(/'/g, "''") + "'";
  if (Array.isArray(v) && (p.type === 'point' || p.type === 'vector') && v.length === 3) return '[' + v.map(num).join(' ') + ']';
  if (v === null || v === undefined) return '[]';
  return '[]';
}

export function toScript(graph) {
  const out = [];
  for (const id of graph.order()) {
    const n = graph.node(id), def = BY_ID[n.type];
    const args = def.ins.map((p) => {
      const ws = graph.wiresInto(id, p.name);
      const ref = (w) => (BY_ID[graph.node(w.from.node).type].outs.length === 1 ? w.from.node : w.from.node + '_' + w.from.port);
      if (ws.length) return p.multi || ws.length > 1 ? '{' + ws.map(ref).join(', ') + '}' : ref(ws[0]);
      if (n.params[p.name] !== undefined) return lit(p, n.params[p.name]);
      if (p.multi) return '{}';
      return lit(p, p.def instanceof Float64Array ? [...p.def] : p.def);
    });
    // trailing arguments equal to their defaults are written anyway: a line says everything it does
    const lhs = def.outs.length === 1 ? id : '[' + def.outs.map((o) => id + '_' + o.name).join(', ') + ']';
    out.push(`${lhs} = ${PREFIX}${n.type}(${args.join(', ')});`);
  }
  const extra = [];
  for (const n of graph.nodes) {
    extra.push(`% at ${n.id} ${Math.round(n.pos[0])} ${Math.round(n.pos[1])}`);
    if (n.show) extra.push(`% show ${n.id}`);
  }
  return out.join('\n') + (out.length ? '\n' : '') + extra.join('\n') + (extra.length ? '\n' : '');
}

const sameAsDefault = (p, v) => { const d = p.def instanceof Float64Array ? [...p.def] : p.def; return JSON.stringify(d) === JSON.stringify(v) || (p.multi && Array.isArray(v) && !v.length); };

// ---- reading it back --------------------------------------------------------------------------------------------------------
function tokens(src, line) {
  const t = [];
  let k = 0;
  const bad = (m) => fail('nodes.err.script', { line, message: m });
  while (k < src.length) {
    const c = src[k];
    if (/\s/.test(c)) { k++; continue; }
    if (c === "'") {
      let s = ''; k++;
      for (;;) {
        if (k >= src.length) bad('text is not closed');
        if (src[k] === "'") { if (src[k + 1] === "'") { s += "'"; k += 2; continue; } k++; break; }
        s += src[k++];
      }
      t.push({ k: 'str', v: s }); continue;
    }
    const m = /^(-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/.exec(src.slice(k));
    if (m && (c !== '-' || !t.length || t[t.length - 1].k === 'p' || t[t.length - 1].k === 'op') && !(t.length && t[t.length - 1].k === 'num' && c === '-')) { t.push({ k: 'num', v: +m[1] }); k += m[1].length; continue; }
    const id = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(k));
    if (id) { t.push({ k: 'id', v: id[0] }); k += id[0].length; continue; }
    if ('()[]{},=;'.includes(c)) { t.push({ k: 'p', v: c }); k++; continue; }
    bad("I do not understand '" + c + "'");
  }
  return t;
}

/** Read a script written by toScript into a graph. Throws NodeError('nodes.err.script', { line, message }) at the first line it cannot read. */
export function fromScript(text) {
  const g = new Graph(), names = new Map(), at = new Map(), show = new Set();
  const lines = String(text).split(/\r?\n/);
  const pending = [];
  lines.forEach((raw, li) => {
    const line = li + 1, s = raw.trim();
    if (!s) return;
    if (s[0] === '%') {
      const a = /^%\s*at\s+(\S+)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/.exec(s), b = /^%\s*show\s+(\S+)/.exec(s);
      if (a) at.set(a[1], [+a[2], +a[3]]); else if (b) show.add(b[1]);
      return;
    }
    const t = tokens(s.replace(/;\s*$/, ''), line), bad = (m) => fail('nodes.err.script', { line, message: m });
    let k = 0;
    const peek = () => t[k], eat = (v) => { const x = t[k]; if (!x || x.v !== v || x.k !== 'p') bad("expected '" + v + "'"); k++; };
    const lhs = [];
    if (peek() && peek().v === '[' && peek().k === 'p') { k++; while (peek() && peek().k === 'id') { lhs.push(t[k++].v); if (peek() && peek().v === ',') k++; } eat(']'); }
    else if (peek() && peek().k === 'id') lhs.push(t[k++].v); else bad('a statement starts with a name');
    eat('=');
    const fn = peek();
    if (!fn || fn.k !== 'id' || !fn.v.startsWith(PREFIX)) bad('only calls of ' + PREFIX + '<node> can be read back');
    k++;
    const type = fn.v.slice(PREFIX.length), def = BY_ID[type];
    if (!def) bad('there is no node ' + type);
    eat('(');
    const args = [];
    const value = () => {
      const x = peek();
      if (!x) bad('an argument is missing');
      if (x.k === 'num') { k++; return { v: x.v }; }
      if (x.k === 'str') { k++; return { v: x.v }; }
      if (x.k === 'id') {
        k++;
        if (x.v === 'true' || x.v === 'false') return { v: x.v === 'true' };
        return { ref: [x.v] };
      }
      if (x.v === '[') {
        k++; const vals = [];
        while (peek() && peek().k === 'num') { vals.push(t[k++].v); if (peek() && peek().v === ',') k++; }
        eat(']'); return { v: vals };
      }
      if (x.v === '{') {
        k++; const refs = [];
        while (peek() && peek().k === 'id') { refs.push(t[k++].v); if (peek() && peek().v === ',') k++; }
        eat('}'); return { ref: refs, many: true };
      }
      return bad("I do not understand '" + x.v + "'");
    };
    while (peek() && !(peek().k === 'p' && peek().v === ')')) { args.push(value()); if (peek() && peek().k === 'p' && peek().v === ',') k++; }
    eat(')');
    if (args.length > def.ins.length) bad(PREFIX + type + ' takes ' + def.ins.length + ' arguments');
    const id = def.outs.length === 1 ? lhs[0] : lhs[0] && lhs[0].slice(0, lhs[0].length - def.outs[0].name.length - 1);
    if (!id || (def.outs.length > 1 && lhs.join() !== def.outs.map((o) => id + '_' + o.name).join())) bad('name the results ' + (def.outs.length === 1 ? 'with one name' : 'like <name>_' + def.outs[0].name));
    if (g.node(id)) bad(id + ' is already used');
    try { g.add(type, { id }); } catch (e) { bad(e.code); }
    for (const o of def.outs) names.set(def.outs.length === 1 ? id : id + '_' + o.name, { node: id, port: o.name });
    pending.push({ id, def, args, line });
  });
  for (const { id, def, args, line } of pending) {
    args.forEach((a, ix) => {
      const p = def.ins[ix];
      try {
        if (a.ref) {
          for (const r of a.ref) { const src = names.get(r); if (!src) fail('nodes.err.script', { line, message: r + ' is not defined above' }); g.connect(src, { node: id, port: p.name }); }
        } else if (!sameAsDefault(p, a.v)) g.setParam(id, p.name, a.v);
      } catch (e) { if (e instanceof NodeError && e.code === 'nodes.err.script') throw e; fail('nodes.err.script', { line, message: e.code + (e.vars && Object.keys(e.vars).length ? ' ' + JSON.stringify(e.vars) : '') }); }
    });
  }
  for (const [id, pos] of at) if (g.node(id)) g.move(id, pos);
  for (const id of show) g.setShow(id, true);
  if (!at.size) g.layout();
  return g;
}

// ---- CraftScript builtins ---------------------------------------------------------------------------------------------------
/**
 * Make every node a builtin. `H` is what the host runtime hands over (PartCraft: cs-values.js and cs-runtime.js):
 *   { tensor(shape, Float64Array), struct(fields), cell(items), isTensor(v) }
 * so this library imports nothing of the host. Returns the names registered.
 */
export function register(registerBuiltin, H) {
  const names = [];
  const geom = (v) => ({ kind: typeOf(v), json: JSON.stringify(v, (k, x) => (ArrayBuffer.isView(x) ? { $a: x.constructor.name, d: [...x] } : x)) });
  const ungeom = (s) => JSON.parse(s.fields.json, (k, x) => (x && x.$a ? (x.$a === 'Uint32Array' ? Uint32Array : Float64Array).from(x.d) : x));
  const toScriptValue = (v) => {
    const t = typeOf(v);
    if (t === 'number') return v;
    if (t === 'bool') return v;
    if (t === 'text') return v;
    if (t === 'point') return H.tensor([1, 3], Float64Array.from(v));
    if (t === 'list') return v.every((x) => typeof x === 'number') ? H.tensor([1, v.length], Float64Array.from(v)) : H.cell(v.map(toScriptValue));
    const g = geom(v);
    return H.struct({ kind: g.kind, json: g.json });
  };
  const toNodeValue = (x, p) => {
    if (typeof x === 'number' || typeof x === 'boolean' || typeof x === 'string') return x;
    if (x && x.t === 'tensor') {
      const d = x.data;
      if ((p.type === 'point' || p.type === 'vector') && !p.list) { if (d.length !== 3) fail('nodes.err.script_value', { port: p.name, want: 'three numbers' }); return Float64Array.from(d); }
      if ((p.type === 'point' || p.type === 'vector') && p.list) { const out = []; for (let k = 0; k + 2 < d.length; k += 3) out.push(Float64Array.of(d[k], d[k + 1], d[k + 2])); return out; }
      if (d.length === 1 && !p.list) return x.dtype === 'u8' ? !!d[0] : d[0];
      return Array.from(d);
    }
    if (x && x.t === 'cell') return x.items.map((y) => toNodeValue(y, { ...p, list: false }));
    if (x && x.t === 'struct' && x.fields && typeof x.fields.json === 'string') return ungeom(x);
    return fail('nodes.err.script_value', { port: p.name, want: p.type });
  };
  for (const def of Object.values(BY_ID)) {
    const name = PREFIX + def.id;
    registerBuiltin(name, (args) => {
      const a = {};
      def.ins.forEach((p, ix) => { if (ix < args.length) a[p.name] = toNodeValue(args[ix], p); });
      const r = callNode(def.id, a);
      return def.outs.length === 1 ? toScriptValue(r[def.outs[0].name]) : def.outs.map((o) => toScriptValue(r[o.name]));
    }, { args: def.ins.map((p) => p.name).join(', '), doc: def.en + ' (a node)', module: 'nodes' });
    names.push(name);
  }
  return names;
}
export { vec };

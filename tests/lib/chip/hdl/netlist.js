/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Netlist graph from structural Verilog (0.9 HD.2): one module elaborated to bit level — ports, nets, cells and pins, with buses
 * bit-blasted (a[3] … a[0]), `assign` wiring merged into nets, constants as tie cells, and anything behavioural (expressions, always
 * blocks) kept as one box per statement so nothing is silently dropped. DOM-free.
 *
 *   buildNetlist(modules, name, {cells: {type: {pins: {pin: 'in'|'out'|'inout'}}}, params: [{name, expr}]}) → netlist
 *   netlist = { format:'cc-chip-netlist', version:1, module, ports[{name, dir, bits[netId]}], nets[{id, name, names[], pins[cell.pin]}],
 *               cells[{id, name, type, kind, pins[{id, name, dir, net}], file, line, col}], problems[] }
 *   kind: 'cell' (a library or tool cell), 'module' (a module of the project), 'gate' (a Verilog primitive), 'tie' (constant 0/1/x),
 *         'expr' (an assign with operators), 'always' (a procedural block), 'flop' marks are on cell.seq
 * Not supported: generate unrolling (instances inside generate are listed in a note and left out), instance arrays (one cell),
 * hierarchical references, flattening (submodule instances stay one cell; open the submodule to see inside).
 */
import { evalConst, paramEnv, rangeBits, collectIds, GATES } from './verilog.js';
import { row, sortRows } from './problems.js';

export const FORMAT = 'cc-chip-netlist', VERSION = 1;
const OUT_GUESS = new Set(['Y', 'Q', 'QN', 'Q_N', 'Z', 'ZN', 'X', 'O', 'OUT', 'CO', 'COUT', 'SUM', 'Y0', 'Y1', 'HI', 'LO', 'GCLK']);
const SEQ_RE = /(^|_)(dff|df|dffr|dffe|sdff|adff|dlatch|latch|ff|sr)(_|$)|DFF|LATCH|FF/i;

class DSU {
  constructor() { this.p = new Map(); }
  find(x) { if (!this.p.has(x)) this.p.set(x, x); let r = x; while (this.p.get(r) !== r) r = this.p.get(r); while (this.p.get(x) !== r) { const n = this.p.get(x); this.p.set(x, r); x = n; } return r; }
  union(a, b) { const ra = this.find(a), rb = this.find(b); if (ra !== rb) this.p.set(ra, rb); }
}

/** Direction of pin `pin` on a cell of `type` that is not a project module: library, tool cell rules, then a guess. */
export function pinDir(type, pin, cells = {}) {
  const lib = cells[type] && cells[type].pins;
  if (lib && lib[pin]) return { dir: lib[pin], sure: true };
  const base = String(pin).replace(/\[\d+\]$/, '');
  if (String(type).startsWith('$')) return { dir: ['Y', 'Q', 'QN'].includes(base) ? 'out' : 'in', sure: true };
  return { dir: OUT_GUESS.has(base.toUpperCase()) ? 'out' : 'in', sure: false };
}

export function buildNetlist(modules, name, opts = {}) {
  const problems = [];
  const byName = new Map(modules.filter((m) => m.lang !== 'vhdl').map((m) => [m.name, m]));
  const m = byName.get(name);
  if (!m) return { format: FORMAT, version: VERSION, module: name, ports: [], nets: [], cells: [], problems: [row('net.nomodule', 'error', { name }, {})] };
  const at = (x) => ({ file: m.file, line: (x && x.line) || m.line, col: (x && x.col) || m.col });
  const env = paramEnv(m, opts.params || []);
  const dsu = new DSU();
  const signals = new Map();                                    // name → {bits: [node], dir?}
  const sigBits = (n, w) => {
    const r = rangeBits(w, env);
    if (!r || r.scalar) return [n];
    const out = [], step = r.msb >= r.lsb ? -1 : 1;
    for (let i = r.msb; ; i += step) { out.push(n + '[' + i + ']'); if (i === r.lsb) break; }
    return out;
  };
  for (const [n, d] of Object.entries(m.nets)) { if (d.kind === 'genvar') continue; signals.set(n, { bits: sigBits(n, d.width), range: rangeBits(d.width, env) }); }
  for (const b of [].concat(...[...signals.values()].map((s) => s.bits))) dsu.find(b);
  const unknownSeen = new Set();
  const bitIndex = (sig, i) => { const s = signals.get(sig); if (!s) return null; if (!s.range || s.range.scalar) return i === 0 ? s.bits[0] : null; const k = s.range.msb >= s.range.lsb ? s.range.msb - i : i - s.range.msb; return k >= 0 && k < s.bits.length ? s.bits[k] : null; };

  /** Bits (MSB first) of a wiring expression, or null when it is not pure wiring. width: wanted width for unsized constants. */
  const bitsOf = (e, width = null) => {
    if (!e) return [];
    switch (e.k) {
      case 'id': {
        if (e.hier) return null;
        const s = signals.get(e.name);
        if (!s) {
          if (Object.prototype.hasOwnProperty.call(env, e.name) && typeof env[e.name] === 'number') return constBits(env[e.name].toString(2), width || 32);
          if (!unknownSeen.has(e.name)) { unknownSeen.add(e.name); problems.push(row('net.unknown', 'error', { name: e.name, scope: m.name }, at(e))); }
          signals.set(e.name, { bits: [e.name], range: { width: 1, msb: 0, lsb: 0, scalar: true } }); dsu.find(e.name); return [e.name];
        }
        return s.bits;
      }
      case 'idx': {
        if (e.base.k !== 'id') return null;
        const i = evalConst(e.index, env); if (i === null) return null;
        const b = bitIndex(e.base.name, i); return b ? [b] : null;
      }
      case 'sel': {
        if (e.base.k !== 'id') return null;
        let msb, lsb;
        if (e.start) { const s0 = evalConst(e.start, env), w = evalConst(e.width, env); if (s0 === null || w === null) return null; if (e.dir === '+:') { lsb = s0; msb = s0 + w - 1; } else { msb = s0; lsb = s0 - w + 1; } }
        else { msb = evalConst(e.msb, env); lsb = evalConst(e.lsb, env); if (msb === null || lsb === null) return null; }
        const out = [], step = msb >= lsb ? -1 : 1;
        for (let i = msb; ; i += step) { const b = bitIndex(e.base.name, i); if (!b) return null; out.push(b); if (i === lsb) break; }
        const s = signals.get(e.base.name);
        if (s && s.range && !s.range.scalar && (s.range.msb >= s.range.lsb) !== (msb >= lsb)) out.reverse();
        return out;
      }
      case 'cat': { const out = []; for (const p of e.parts) { const b = bitsOf(p); if (!b) return null; out.push(...b); } return out; }
      case 'rep': { const n = evalConst(e.count, env); if (n === null || n < 0 || n > 4096) return null; const inner = []; for (const p of e.parts) { const b = bitsOf(p); if (!b) return null; inner.push(...b); } const out = []; for (let k = 0; k < n; k++) out.push(...inner); return out; }
      case 'num': { if (!e.bits) return null; const bits = e.unsized && width ? e.bits.slice(-Math.min(width, e.bits.length)).padStart(width, '0') : e.bits; return constBits(bits, bits.length); }
      case 'fill': return constBits((e.v === '1' ? '1' : e.v === 'z' ? 'z' : e.v === 'x' ? 'x' : '0').repeat(width || 1), width || 1);
      default: return null;
    }
  };
  function constBits(bits, width) { const s = String(bits).padStart(width, '0').slice(-width); return [...s].map((c) => '$const:' + (c === '1' ? '1' : c === '0' ? '0' : 'x')); }

  const cells = [];
  let seq = 0;
  const cellId = (n) => 'C' + (++seq) + (n ? '' : '');
  const fit = (bits, width, where, label) => {
    if (bits.length === width) return bits;
    problems.push(row('net.width', 'warning', { pin: label.pin, inst: label.inst, want: width, got: bits.length }, where));
    return bits.length > width ? bits.slice(bits.length - width) : [...new Array(width - bits.length).fill(null), ...bits];
  };
  const pinNames = (base, width, range) => {
    if (width === 1 && (!range || range.scalar)) return [base];
    const out = []; const msb = range ? range.msb : width - 1, lsb = range ? range.lsb : 0, step = msb >= lsb ? -1 : 1;
    for (let i = msb; ; i += step) { out.push(base + '[' + i + ']'); if (i === lsb) break; }
    return out;
  };

  // ---- instances (modules, library cells, gates)
  const genInst = m.instances.filter((i) => i.inGenerate);
  if (genInst.length) problems.push(row('net.generate', 'note', { name: m.name, n: genInst.length }, at(genInst[0])));
  const guessed = new Set();
  for (const inst of m.instances) {
    if (inst.inGenerate) continue;
    const where = at(inst);
    const cell = { id: cellId(), name: inst.name || inst.type + '_' + seq, type: inst.type, kind: inst.gate ? 'gate' : byName.has(inst.type) ? 'module' : 'cell', pins: [], file: m.file, line: inst.line, col: inst.col };
    if (inst.gate) {
      const n = inst.conns.length, outs = ['not', 'buf'].includes(inst.type) ? n - 1 : 1;
      inst.conns.forEach((c, k) => {
        const dir = k < outs ? 'out' : 'in', pn = k < outs ? (outs > 1 ? 'Y' + k : 'Y') : String.fromCharCode(65 + k - outs);
        const b = bitsOf(c.expr, 1);
        cell.pins.push({ id: pn, name: pn, dir, bit: b && b.length ? b[b.length - 1] : null });
        if (!b) problems.push(row('net.behavioural', 'note', { n: 1, name: inst.type + ' terminal ' + (k + 1) }, where));
      });
      cells.push(cell); continue;
    }
    const def = byName.get(inst.type);
    const denv = def ? paramEnv(def, inst.params, env) : null;
    const defPorts = def ? def.ports.filter((p) => p.name) : null;
    const conns = inst.conns.filter((c) => c.port !== '*');
    const wild = inst.conns.some((c) => c.port === '*');
    const list = [];
    if (inst.named || wild) {
      for (const c of conns) list.push({ port: c.port, expr: c.expr, line: c.line, col: c.col });
      if (wild && defPorts) for (const p of defPorts) if (!conns.some((c) => c.port === p.name)) list.push({ port: p.name, expr: { k: 'id', name: p.name } });
    } else conns.forEach((c, k) => list.push({ port: defPorts ? (defPorts[k] && defPorts[k].name) : String(k + 1), expr: c.expr, positional: !defPorts }));
    if (!inst.named && !defPorts && conns.length) problems.push(row('net.positional', 'note', { inst: cell.name, type: inst.type }, where));
    const listed = new Set();
    for (const c of list) {
      if (!c.port) continue;
      listed.add(c.port);
      const dp = defPorts && defPorts.find((p) => p.name === c.port);
      let dir, width, range = null;
      if (dp) { dir = dp.dir === 'output' ? 'out' : dp.dir === 'inout' ? 'inout' : 'in'; range = rangeBits(dp.width, denv); width = range ? range.width : null; }
      else if (def) continue;                                  // reported by the hierarchy check (hier.portmissing)
      const b = bitsOf(c.expr, width);
      if (!dp) {
        const g = c.positional ? { dir: 'inout', sure: false } : pinDir(inst.type, c.port, opts.cells);
        dir = g.dir === 'output' ? 'out' : g.dir === 'input' ? 'in' : g.dir;
        if (!g.sure && !guessed.has(inst.type + '.' + c.port) && !c.positional) { guessed.add(inst.type + '.' + c.port); problems.push(row('net.dir', 'note', { pin: c.port, type: inst.type, dir }, where)); }
        width = b ? b.length || 1 : 1;
      }
      if (width === null) width = b ? b.length : 1;
      if (!b) {                                                // an expression on a port: a box drives (or reads) it
        const names = pinNames(c.port, width, range);
        const ex = exprCell(c.expr, names.length, c.port + ' of ' + cell.name, where);
        names.forEach((pn, k) => cell.pins.push({ id: pn, name: pn, dir, bit: ex[k] }));
        continue;
      }
      const fb = c.expr === null ? new Array(width).fill(null) : fit(b, width, { file: m.file, line: c.line || inst.line, col: c.col || inst.col }, { pin: c.port, inst: cell.name });
      pinNames(c.port, width, range).forEach((pn, k) => cell.pins.push({ id: pn, name: pn, dir, bit: fb[k] }));
    }
    if (defPorts) for (const p of defPorts) if (!listed.has(p.name)) {                 // unconnected ports still get pins
      const r = rangeBits(p.width, denv) || { width: 1, scalar: true };
      for (const pn of pinNames(p.name, r.width, r)) cell.pins.push({ id: pn, name: pn, dir: p.dir === 'output' ? 'out' : p.dir === 'inout' ? 'inout' : 'in', bit: null });
    }
    cell.seq = SEQ_RE.test(inst.type);
    cells.push(cell);
  }

  // ---- assign: wiring merges nets; anything else becomes an expression box
  function exprCell(rhs, width, label, where) {
    const ids = collectIds(rhs, [], false).filter((x) => !x.hier && signals.has(x.name));
    const ins = [], seen = new Set();
    for (const x of ids) for (const b of signals.get(x.name).bits) if (!seen.has(b)) { seen.add(b); ins.push(b); }
    const outs = []; for (let k = 0; k < width; k++) outs.push('$expr' + (seq + 1) + ':' + k);
    const c = { id: cellId(), name: label, type: '$expr', kind: 'expr', op: exprLabel(rhs), pins: [], file: m.file, line: where.line, col: where.col };
    for (const b of ins) c.pins.push({ id: 'i:' + b, name: b, dir: 'in', bit: b });
    outs.forEach((b, k) => { dsu.find(b); c.pins.push({ id: 'o:' + k, name: width > 1 ? 'y[' + (width - 1 - k) + ']' : 'y', dir: 'out', bit: b }); });
    cells.push(c);
    return outs;
  }
  for (const a of m.assigns) {
    const where = at(a);
    const lhs = bitsOf(a.lhs);
    if (!lhs) { problems.push(row('net.behavioural', 'note', { n: 1, name: m.name }, where)); continue; }
    const rhs = bitsOf(a.rhs, lhs.length);
    if (rhs) {
      const r = rhs.length === lhs.length ? rhs : rhs.length > lhs.length ? rhs.slice(rhs.length - lhs.length) : [...new Array(lhs.length - rhs.length).fill('$const:0'), ...rhs];
      if (rhs.length !== lhs.length && !(a.rhs.k === 'num' && a.rhs.unsized)) problems.push(row('net.width', 'warning', { pin: 'assign', inst: exprText(a.lhs), want: lhs.length, got: rhs.length }, where));
      lhs.forEach((b, k) => dsu.union(b, r[k]));
      continue;
    }
    const outs = exprCell(a.rhs, lhs.length, 'assign ' + exprText(a.lhs), where);
    lhs.forEach((b, k) => dsu.union(b, outs[k]));
  }
  // ---- procedural blocks: one box each, reads in, writes out
  const beh = m.blocks.filter((b) => b.kind !== 'initial');
  if (beh.length) problems.push(row('net.behavioural', 'note', { n: beh.length, name: m.name }, at(beh[0])));
  for (const b of beh) {
    const c = { id: cellId(), name: b.kind + '@' + b.line, type: b.edges.length ? '$always_ff' : '$always', kind: 'always', seq: b.edges.length > 0, pins: [], file: m.file, line: b.line, col: b.col };
    for (const n of b.reads) if (signals.has(n)) for (const bit of signals.get(n).bits) c.pins.push({ id: 'i:' + bit, name: bit, dir: 'in', bit });
    for (const n of b.writes) if (signals.has(n)) for (const bit of signals.get(n).bits) c.pins.push({ id: 'o:' + bit, name: bit, dir: 'out', bit });
    cells.push(c);
  }

  // ---- nets
  const ports = m.ports.filter((p) => p.name).map((p) => ({ name: p.name, dir: p.dir === 'output' ? 'out' : p.dir === 'inout' ? 'inout' : 'in', bits: (signals.get(p.name) || { bits: [p.name] }).bits }));
  const groups = new Map();
  const touch = (bit) => { if (bit === null || bit === undefined) return null; const r = dsu.find(bit); if (!groups.has(r)) groups.set(r, { members: new Set(), pins: [] }); groups.get(r).members.add(bit); return r; };
  for (const s of signals.values()) for (const b of s.bits) touch(b);
  for (const b of [...dsu.p.keys()]) if (b.startsWith('$const:')) touch(b);
  for (const c of cells) for (const p of c.pins) { const r = touch(p.bit); p.root = r; if (r) groups.get(r).pins.push(c.id + '.' + p.id); }
  for (const p of ports) p.roots = p.bits.map((b) => touch(b));
  const portBits = new Set(ports.flatMap((p) => p.bits));
  const nameScore = (n) => [portBits.has(n) ? 0 : 1, n.startsWith('$') ? 2 : /^_|^\$|^n\d+$/.test(n) ? 1 : 0, n.length, n];
  const better = (a, b) => { const x = nameScore(a), y = nameScore(b); for (let k = 0; k < 4; k++) if (x[k] !== y[k]) return x[k] < y[k]; return false; };
  const nets = [], netOfRoot = new Map();
  const roots = [...groups.keys()].sort((a, b) => { const na = [...groups.get(a).members].reduce((x, y) => (better(y, x) ? y : x)); const nb = [...groups.get(b).members].reduce((x, y) => (better(y, x) ? y : x)); return na < nb ? -1 : na > nb ? 1 : 0; });
  for (const r of roots) {
    const g = groups.get(r), names = [...g.members].filter((n) => !n.startsWith('$expr') && !n.startsWith('$const:')).sort();
    const consts = [...g.members].filter((n) => n.startsWith('$const:')).map((n) => n.slice(7));
    const best = [...g.members].reduce((x, y) => (better(y, x) ? y : x));
    const net = { id: 'N' + (nets.length + 1), name: best.startsWith('$const:') ? (names[0] || "1'b" + best.slice(7)) : best.startsWith('$expr') ? (names[0] || 'n' + (nets.length + 1)) : best, names, pins: [...g.pins].sort(), ...(consts.length ? { const: [...new Set(consts)].sort().join('') } : {}) };
    nets.push(net); netOfRoot.set(r, net);
  }
  // tie cells for constants
  for (const n of nets) if (n.const) {
    const c = { id: cellId(), name: "1'b" + n.const, type: '$tie' + n.const, kind: 'tie', pins: [{ id: 'Y', name: 'Y', dir: 'out', net: n.id }], file: m.file, line: m.line, col: m.col };
    cells.push(c); n.pins.push(c.id + '.Y'); n.pins.sort();
  }
  for (const c of cells) for (const p of c.pins) { if (p.root !== undefined) p.net = p.root ? netOfRoot.get(p.root).id : null; delete p.root; delete p.bit; }
  for (const p of ports) { p.bits = p.roots.map((r) => netOfRoot.get(r).id); delete p.roots; }
  const nl = { format: FORMAT, version: VERSION, module: m.name, file: m.file, ports, nets, cells, problems: [] };
  nl.problems = sortRows([...problems, ...checkNetlist(nl)]);
  return nl;
}

/** Driver checks on the netlist itself: nets with no driver that feed inputs, nets with more than one driver, input pins left open. */
export function checkNetlist(nl) {
  const out = [], drivers = new Map(), loads = new Map();
  const portIn = new Map(), inName = new Map();                // net → how many input port bits drive it
  for (const p of nl.ports) p.bits.forEach((n, k) => { if (p.dir === 'out') return; portIn.set(n, (portIn.get(n) || 0) + 1); if (!inName.has(n)) inName.set(n, []); inName.get(n).push(p.bits.length > 1 ? p.name + '[' + (p.bits.length - 1 - k) + ']' : p.name); });
  const cellBy = new Map(nl.cells.map((c) => [c.id, c]));
  for (const c of nl.cells) for (const p of c.pins) {
    if (!p.net) { if (p.dir === 'in' && c.kind !== 'always' && c.kind !== 'expr') out.push(row('net.floating', 'warning', { pin: p.name, inst: c.name }, { file: c.file, line: c.line, col: c.col }, { idPart: c.id + '.' + p.id })); continue; }
    const map = p.dir === 'out' ? drivers : p.dir === 'in' ? loads : null;
    if (map) { if (!map.has(p.net)) map.set(p.net, []); map.get(p.net).push({ c, p }); }
  }
  for (const n of nl.nets) {
    const d = drivers.get(n.id) || [], l = loads.get(n.id) || [];
    const count = d.length + (portIn.get(n.id) || 0);
    if (count > 1) { const first = d[0] ? d[0].c : null; out.push(row('net.multi', 'error', { net: n.name, n: count, drivers: [...(inName.get(n.id) || []), ...d.map((x) => x.c.name + '.' + x.p.name)].slice(0, 6).join(', ') }, first ? { file: first.file, line: first.line, col: first.col } : { file: nl.file }, { idPart: n.id })); }
    if (count === 0 && l.length && !n.pins.some((r) => { const [cid, pid] = splitPin(r); const c = cellBy.get(cid); const p = c && c.pins.find((x) => x.id === pid); return p && p.dir === 'inout'; })) {
      const x = l[0]; out.push(row('net.undriven', 'warning', { net: n.name, inst: x.c.name, pin: x.p.name }, { file: x.c.file, line: x.c.line, col: x.c.col }, { idPart: n.id }));
    }
  }
  return out;
}
const splitPin = (r) => { const i = r.indexOf('.'); return [r.slice(0, i), r.slice(i + 1)]; };

function exprText(e) {
  if (!e) return '';
  switch (e.k) {
    case 'id': return e.name;
    case 'idx': return exprText(e.base) + '[' + exprText(e.index) + ']';
    case 'sel': return exprText(e.base) + (e.start ? '[' + exprText(e.start) + e.dir + exprText(e.width) + ']' : '[' + exprText(e.msb) + ':' + exprText(e.lsb) + ']');
    case 'num': return e.text || String(e.value);
    case 'cat': return '{' + e.parts.map(exprText).join(',') + '}';
    case 'rep': return '{' + exprText(e.count) + '{…}}';
    default: return '…';
  }
}
/** A short label for an expression box: its operators, e.g. "+", "&", "?:", "==". */
export function exprLabel(e) {
  const ops = new Set();
  const walk = (x) => { if (!x || typeof x !== 'object') return; if (x.k === 'bin' || x.k === 'un') ops.add(x.op); if (x.k === 'cond') ops.add('?:'); if (x.k === 'call' || x.k === 'sys') ops.add(x.name + '()'); for (const k of ['a', 'b', 'c', 'base']) walk(x[k]); for (const k of ['args', 'parts']) if (x[k]) x[k].forEach(walk); };
  walk(e);
  return [...ops].slice(0, 4).join(' ') || '=';
}

/** Small summary for lists: counts by kind. */
export function netlistStats(nl) {
  const kinds = {};
  for (const c of nl.cells) kinds[c.kind] = (kinds[c.kind] || 0) + 1;
  return { cells: nl.cells.length, nets: nl.nets.length, ports: nl.ports.length, bits: nl.ports.reduce((a, p) => a + p.bits.length, 0), kinds };
}

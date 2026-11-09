/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Schematic view of a chip netlist (0.9 HD.2), on the shared schematic engine lib/schematic (XE.1, cc-schematic):
 *   toSchematic(netlist, S)  → a cc-schematic `Schematic` (cells and port bits as symbols, one wire from each net's driver to every other pin)
 *   checkWithEngine(netlist, S) → Problems rows from the engine's own rules (driver conflicts, inputs with no source, open inputs)
 *   layoutNetlist(netlist, S?) → drawing model: auto-placement by levelization (longest path from the inputs, feedback edges broken),
 *                                columns ordered by the mean height of their drivers, orthogonal wires with one track per net in each channel
 *   renderSvg(layout, {highlight, title}) → SVG text (no DOM; colours from CSS variables with fallbacks so it follows the page theme)
 * `S` is the cc-schematic module namespace (import * as S from '<path>/schematic/index.js'). It is passed in, not imported, so this file
 * works wherever the add-on's sync script puts the two libraries. When S is given, the layout takes its connectivity from S.buildNets,
 * so the drawing shows what the engine sees. DOM-free.
 */
import { row } from './problems.js';

export const LIMITS = { cells: 4000 };
const dirKind = (d) => (d === 'out' ? 'out' : d === 'inout' ? 'io' : 'in');

export function toSchematic(nl, S) {
  const sch = new S.Schematic(nl.module, 'other');
  sch.addSheet(nl.module || 'netlist', 's1');
  for (const p of nl.ports) p.bits.forEach((net, k) => {
    const bitName = p.bits.length > 1 ? p.name + '[' + (p.bits.length - 1 - k) + ']' : p.name;
    // an input port drives its net (pin kind out); an output port reads it
    sch.addSymbol({ id: 'P:' + bitName, tag: bitName, type: 'port-' + p.dir, sheet: 's1', col: 0, pins: [{ id: 'p', name: bitName, kind: p.dir === 'in' ? 'out' : p.dir === 'out' ? 'in' : 'io' }], attrs: { net } });
  });
  for (const c of nl.cells) sch.addSymbol({ id: c.id, tag: c.name, type: c.type, sheet: 's1', col: 0, pins: c.pins.map((p) => ({ id: p.id, name: p.name, kind: dirKind(p.dir), ...(p.dir === 'out' || c.kind === 'always' || c.kind === 'expr' ? { optional: true } : {}) })), attrs: { kind: c.kind } });
  const pinsOf = new Map();
  for (const n of nl.nets) pinsOf.set(n.id, []);
  for (const p of nl.ports) p.bits.forEach((net, k) => { const bitName = p.bits.length > 1 ? p.name + '[' + (p.bits.length - 1 - k) + ']' : p.name; pinsOf.get(net).push({ ref: 'P:' + bitName + '.p', out: p.dir === 'in' }); });
  for (const c of nl.cells) for (const p of c.pins) if (p.net) pinsOf.get(p.net).push({ ref: c.id + '.' + p.id, out: p.dir === 'out' });
  for (const n of nl.nets) {
    const ps = pinsOf.get(n.id); if (ps.length < 2) continue;
    const drv = ps.find((x) => x.out) || ps[0];
    for (const x of ps) if (x !== drv) sch.addWire(drv.ref, x.ref, { number: n.name });
  }
  return sch;
}

/** The engine's rule checks, as chip Problems rows (rules that mean nothing for a netlist — wire numbers, cables, BOM — are off). */
export function checkWithEngine(nl, S) {
  const sch = toSchematic(nl, S);
  const off = Object.keys(S.RULES).filter((r) => !['driver-conflict', 'undriven'].includes(r));
  const raw = S.checkSchematic(sch, { off });
  const cellBy = new Map(nl.cells.map((c) => [c.id, c])), netName = new Map(nl.nets.map((n) => [n.id, n.name]));
  const ourNet = (ref) => {
    const i = ref.lastIndexOf('.'), sym = ref.slice(0, i), pin = ref.slice(i + 1);
    const s = sch.symbol(sym); if (s && s.attrs && s.attrs.net) return s.attrs.net;
    const c = cellBy.get(sym), p = c && c.pins.find((x) => x.id === pin); return p ? p.net : null;
  };
  const out = [];
  for (const p of raw) {
    const ref = p.ref || '';
    const i = ref.lastIndexOf('.'), symId = ref.slice(0, i), pin = ref.slice(i + 1);
    const c = cellBy.get(symId), net = ourNet(ref), name = netName.get(net) || '?';
    const where = c ? { file: c.file, line: c.line, col: c.col } : { file: nl.file };
    const pinName = c ? (c.pins.find((x) => x.id === pin) || { name: pin }).name : pin;
    if (p.rule === 'driver-conflict') out.push(row('net.multi', 'error', { net: name, n: Number((p.message.match(/by (\d+)/) || [])[1] || 2), drivers: (p.message.split(': ')[1] || '').replace(/P:/g, '') }, where, { idPart: 'engine:' + net }));
    else if (p.rule === 'undriven') out.push(row('net.undriven', 'warning', { net: name, inst: c ? c.name : symId.replace(/^P:/, ''), pin: pinName }, where, { idPart: 'engine:' + ref }));
  }
  return { schematic: sch, problems: out, engineRaw: raw };
}

const G = { pin: 14, pad: 8, cellW: 96, gap: 110, portW: 72, portH: 18, track: 6, top: 24, left: 24 };

/** Connectivity: nets → {driver: endpoint, loads: [endpoint]}. Endpoint = {node, pin}. From S.buildNets when S is given. */
function connectivity(nl, S) {
  const ends = new Map();                                       // net id → [{node, pin, out}]
  const add = (net, e) => { if (!ends.has(net)) ends.set(net, []); ends.get(net).push(e); };
  if (S) {
    const sch = toSchematic(nl, S), built = S.buildNets(sch);
    const netOfSym = new Map();
    for (const n of built.nets) {
      // map the engine's net back to ours by any member pin
      let ours = null;
      for (const r of n.pins) { const i = r.lastIndexOf('.'), sym = r.slice(0, i), pin = r.slice(i + 1); const s = sch.symbol(sym); if (s.attrs && s.attrs.net) { ours = s.attrs.net; break; } const c = nl.cells.find((x) => x.id === sym); const p = c && c.pins.find((x) => x.id === pin); if (p && p.net) { ours = p.net; break; } }
      if (!ours) continue;
      for (const r of n.pins) { const i = r.lastIndexOf('.'), sym = r.slice(0, i), pin = r.slice(i + 1); const s = sch.symbol(sym); const k = s.pins.find((x) => x.id === pin).kind; add(ours, { node: sym, pin, out: k === 'out' }); }
      netOfSym.set(n.id, ours);
    }
    return ends;
  }
  for (const p of nl.ports) p.bits.forEach((net, k) => add(net, { node: 'P:' + (p.bits.length > 1 ? p.name + '[' + (p.bits.length - 1 - k) + ']' : p.name), pin: 'p', out: p.dir === 'in' }));
  for (const c of nl.cells) for (const p of c.pins) if (p.net) add(p.net, { node: c.id, pin: p.id, out: p.dir === 'out' });
  return ends;
}

export function layoutNetlist(nl, S = null) {
  if (nl.cells.length > LIMITS.cells) return { tooBig: true, cells: nl.cells.length, nodes: [], wires: [], width: 0, height: 0 };
  const nodes = new Map();
  for (const p of nl.ports) p.bits.forEach((net, k) => {
    const bitName = p.bits.length > 1 ? p.name + '[' + (p.bits.length - 1 - k) + ']' : p.name;
    nodes.set('P:' + bitName, { id: 'P:' + bitName, kind: 'port', dir: p.dir, label: bitName, type: 'port', pins: [{ id: 'p', name: '', dir: p.dir === 'in' ? 'out' : 'in', net }] });
  });
  for (const c of nl.cells) nodes.set(c.id, { id: c.id, kind: c.kind, label: c.name, type: c.kind === 'expr' ? c.op : c.type, seq: !!c.seq, file: c.file, line: c.line, col: c.col, pins: c.pins.map((p) => ({ id: p.id, name: p.name, dir: p.dir === 'inout' ? 'in' : p.dir, net: p.net })) });
  const ends = connectivity(nl, S);
  const nameOf = new Map(nl.nets.map((n) => [n.id, n.name]));
  // graph: driver node → load nodes
  const succ = new Map([...nodes.keys()].map((k) => [k, new Set()]));
  const pred = new Map([...nodes.keys()].map((k) => [k, new Set()]));
  for (const [, es] of ends) { const d = es.filter((e) => e.out); for (const a of d) for (const b of es) if (!b.out && a.node !== b.node) { succ.get(a.node).add(b.node); pred.get(b.node).add(a.node); } }
  // break feedback: DFS from sources (inputs, ties, flops, nodes with no drivers) in a fixed order, drop back edges
  const order = [...nodes.keys()].sort((a, b) => rankNode(nodes.get(a)) - rankNode(nodes.get(b)) || (a < b ? -1 : 1));
  const state = new Map(), back = new Set();
  for (const s of order) {
    if (state.has(s)) continue;
    const stack = [[s, [...succ.get(s)].sort()[Symbol.iterator]()]]; state.set(s, 1);
    while (stack.length) {
      const [n, it] = stack[stack.length - 1], nx = it.next();
      if (nx.done) { state.set(n, 2); stack.pop(); continue; }
      const v = nx.value;
      if (state.get(v) === 1) { back.add(n + '>' + v); continue; }
      if (!state.has(v)) { state.set(v, 1); stack.push([v, [...succ.get(v)].sort()[Symbol.iterator]()]); }
    }
  }
  // longest path levels on what is left; output ports go after everything
  const level = new Map(), indeg = new Map();
  for (const k of nodes.keys()) indeg.set(k, [...pred.get(k)].filter((p) => !back.has(p + '>' + k)).length);
  const q = order.filter((k) => indeg.get(k) === 0);
  for (const k of q) level.set(k, nodes.get(k).kind === 'port' && nodes.get(k).dir === 'in' ? 0 : 1);
  while (q.length) {
    const n = q.shift();
    for (const v of [...succ.get(n)].sort()) {
      if (back.has(n + '>' + v)) continue;
      level.set(v, Math.max(level.get(v) || 1, level.get(n) + 1));
      indeg.set(v, indeg.get(v) - 1); if (indeg.get(v) === 0) q.push(v);
    }
  }
  let maxL = 1;
  for (const [k, l] of level) if (nodes.get(k).kind !== 'port' || nodes.get(k).dir === 'in') maxL = Math.max(maxL, l);
  for (const n of nodes.values()) {
    if (!level.has(n.id)) level.set(n.id, 1);
    if (n.kind === 'port' && n.dir === 'in') level.set(n.id, 0);
    if (n.kind === 'port' && n.dir !== 'in') level.set(n.id, maxL + 1);
    n.level = level.get(n.id);
  }
  // sizes
  for (const n of nodes.values()) {
    if (n.kind === 'port') { n.w = G.portW; n.h = G.portH; continue; }
    const ins = n.pins.filter((p) => p.dir !== 'out').length, outs = n.pins.length - ins;
    n.w = G.cellW; n.h = Math.max(ins, outs, 1) * G.pin + G.pad * 2 + 12;
  }
  // columns, ordered by barycenter of drivers (two sweeps)
  const cols = [];
  for (const n of nodes.values()) (cols[n.level] ||= []).push(n);
  for (const c of cols) if (c) c.sort((a, b) => (a.id < b.id ? -1 : 1));
  const place = () => {
    let x = G.left;
    cols.forEach((c, i) => {
      if (!c) return;
      let y = G.top;
      const w = Math.max(...c.map((n) => n.w));
      for (const n of c) { n.x = x + (w - n.w) / 2; n.y = y; y += n.h + 14; }
      cols[i].x = x; cols[i].w = w;
      x += w + G.gap;
    });
  };
  place();
  for (let sweep = 0; sweep < 2; sweep++) {
    for (const c of cols) {
      if (!c) continue;
      const bc = (n) => { const ps = [...pred.get(n.id)].map((k) => nodes.get(k)).filter((p) => p.level < n.level); return ps.length ? ps.reduce((a, p) => a + p.y + p.h / 2, 0) / ps.length : n.y; };
      const keys = new Map(c.map((n) => [n.id, bc(n)]));
      c.sort((a, b) => keys.get(a.id) - keys.get(b.id) || (a.id < b.id ? -1 : 1));
    }
    place();
  }
  // pin positions
  for (const n of nodes.values()) {
    const ins = n.pins.filter((p) => p.dir !== 'out'), outs = n.pins.filter((p) => p.dir === 'out');
    if (n.kind === 'port') { for (const p of n.pins) { p.x = p.dir === 'out' ? n.x + n.w : n.x; p.y = n.y + n.h / 2; p.side = p.dir === 'out' ? 'right' : 'left'; } continue; }
    ins.forEach((p, k) => { p.side = 'left'; p.x = n.x; p.y = n.y + G.pad + 12 + k * G.pin + G.pin / 2; });
    outs.forEach((p, k) => { p.side = 'right'; p.x = n.x + n.w; p.y = n.y + G.pad + 12 + k * G.pin + G.pin / 2; });
  }
  const height = Math.max(G.top * 2, ...[...nodes.values()].map((n) => n.y + n.h)) + 20;
  const width = Math.max(...cols.filter(Boolean).map((c) => c.x + c.w)) + G.left;
  // wires: driver → each load, orthogonal; each net has its own track in the channel right of the driver's column
  const pinAt = (e) => { const n = nodes.get(e.node); return n && n.pins.find((p) => p.id === e.pin); };
  const wires = [], tracks = new Map();
  let below = height, selfLoops = 0;
  const netIds = [...ends.keys()].sort();
  for (const net of netIds) {
    const es = ends.get(net), drv = es.find((e) => e.out) || es[0];
    const a = pinAt(drv); if (!a) continue;
    const lvl = nodes.get(drv.node).level;
    const t = tracks.get(lvl) || 0; tracks.set(lvl, t + 1);
    const col = cols[lvl], chan = col ? col.x + col.w + 10 + (t % Math.max(1, Math.floor((G.gap - 20) / G.track))) * G.track : a.x + 10;
    const segs = [];
    for (const e of es) {
      if (e === drv) continue;
      if (e.node === drv.node) { selfLoops++; continue; }          // a box that reads its own output (count <= count + 1): no wire round the box
      const b = pinAt(e); if (!b) continue;
      if (b.x > a.x + 4) segs.push([[a.x, a.y], [chan, a.y], [chan, b.y], [b.x, b.y]]);
      else { const yb = below + 8; below += G.track; segs.push([[a.x, a.y], [a.x + 8, a.y], [a.x + 8, yb], [b.x - 8, yb], [b.x - 8, b.y], [b.x, b.y]]); }
    }
    wires.push({ net, name: nameOf.get(net) || net, segs, fanout: segs.length });
  }
  return { nodes: [...nodes.values()], wires, width, height: Math.max(height, below + 16), levels: maxL + 2, selfLoops };
}
function rankNode(n) { return n.kind === 'port' && n.dir === 'in' ? 0 : n.kind === 'tie' ? 1 : n.seq ? 2 : 3; }

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** SVG text for a layout. opts: {highlight: net id, title}. Every cell carries data-cell, every wire data-net, for the panel's clicks. */
export function renderSvg(lay, opts = {}) {
  if (lay.tooBig) return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 40"><text x="10" y="24" font-size="13" fill="currentColor">' + esc(opts.tooBigText || ('Too many cells to draw (' + lay.cells + ')')) + '</text></svg>';
  const W = Math.ceil(lay.width), H = Math.ceil(lay.height);
  const o = [];
  o.push('<svg xmlns="http://www.w3.org/2000/svg" class="chip-schem" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10">');
  if (opts.title) o.push('<title>' + esc(opts.title) + '</title>');
  o.push('<style>.chip-schem text{pointer-events:none}.chip-schem .w{fill:none;stroke:#4a6fa5;stroke:var(--chip-wire,#4a6fa5);stroke-width:1}.chip-schem .w.hl{stroke:#d9480f;stroke:var(--chip-hl,#d9480f);stroke-width:2.2}' +
    '.chip-schem .c{fill:#fff;fill:var(--chip-cell,#fff);stroke:#333;stroke:var(--chip-line,#333);stroke-width:1}.chip-schem .c.seq{fill:#eef4ff;fill:var(--chip-seq,#eef4ff)}.chip-schem .c.beh{fill:#fff8e6;fill:var(--chip-beh,#fff8e6);stroke-dasharray:4 2}' +
    '.chip-schem .p{fill:#e8f5e9;fill:var(--chip-port,#e8f5e9);stroke:#333;stroke:var(--chip-line,#333)}.chip-schem text{fill:#222;fill:var(--chip-text,#222)}.chip-schem .pn{font-size:8px;fill:#666;fill:var(--chip-muted,#666)}.chip-schem .dot{fill:#4a6fa5;fill:var(--chip-wire,#4a6fa5)}</style>');
  for (const w of lay.wires) {
    const d = w.segs.map((s) => 'M' + s.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L')).join('');
    if (!d) continue;
    o.push('<path class="w' + (opts.highlight === w.net ? ' hl' : '') + '" data-net="' + esc(w.net) + '" d="' + d + '"><title>' + esc(w.name) + '</title></path>');
    if (w.segs.length > 1) { const s = w.segs[0]; o.push('<circle class="dot" cx="' + s[1][0].toFixed(1) + '" cy="' + s[1][1].toFixed(1) + '" r="1.8"/>'); }
  }
  for (const n of lay.nodes) {
    if (n.kind === 'port') {
      const pts = n.dir === 'in' ? [[n.x, n.y], [n.x + n.w - 8, n.y], [n.x + n.w, n.y + n.h / 2], [n.x + n.w - 8, n.y + n.h], [n.x, n.y + n.h]] : [[n.x + 8, n.y], [n.x + n.w, n.y], [n.x + n.w, n.y + n.h], [n.x + 8, n.y + n.h], [n.x, n.y + n.h / 2]];
      o.push('<g data-cell="' + esc(n.id) + '"><polygon class="p" points="' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + '"/><text x="' + (n.x + (n.dir === 'in' ? 4 : 12)) + '" y="' + (n.y + n.h / 2 + 3.5) + '">' + esc(clip(n.label, 11)) + '</text></g>');
      continue;
    }
    const cls = 'c' + (n.seq ? ' seq' : '') + (n.kind === 'always' || n.kind === 'expr' ? ' beh' : '');
    o.push('<g data-cell="' + esc(n.id) + '"><rect class="' + cls + '" x="' + n.x + '" y="' + n.y + '" width="' + n.w + '" height="' + n.h + '" rx="3"/>');
    o.push('<text x="' + (n.x + n.w / 2) + '" y="' + (n.y + 11) + '" text-anchor="middle" font-weight="600">' + esc(clip(String(n.type).replace(/^\$_?|_$/g, ''), 14)) + '</text>');
    o.push('<text x="' + (n.x + n.w / 2) + '" y="' + (n.y + n.h + 10) + '" text-anchor="middle" class="pn">' + esc(clip(n.label, 18)) + '</text>');
    for (const p of n.pins) o.push('<text class="pn" x="' + (p.side === 'left' ? p.x + 3 : p.x - 3) + '" y="' + (p.y + 3) + '"' + (p.side === 'right' ? ' text-anchor="end"' : '') + '>' + esc(clip(p.name, 8)) + '</text>');
    o.push('</g>');
  }
  o.push('</svg>');
  return o.join('');
}
const clip = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));

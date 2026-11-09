/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Module / entity hierarchy for the Chip design add-on (0.9 HD.1): reads every source file of a project (Verilog and VHDL, mixed),
 * finds the top, builds the instance tree, and reports missing and unused modules, recursion and bad port connections as Problems rows.
 * DOM-free.
 *
 *   langOf(name) → 'verilog' | 'vhdl' | null
 *   parseSource(name, text, opts) → {lang, modules, problems}
 *   analyzeProject(files [{name, text}], {top, known: [cell names], defines}) → {modules, hier, problems, byFile}
 *   buildHierarchy(modules, {top, known}) → {top, tops, testbenches, tree, trees, missing[], unused[], cycles[], problems[]}
 */
import { parseVerilog, GATES } from './verilog.js';
import { parseVhdl } from './vhdl.js';
import { row, sortRows } from './problems.js';

export const VERILOG_EXT = ['.v', '.vh', '.sv', '.svh', '.vlg', '.verilog'];
export const VHDL_EXT = ['.vhd', '.vhdl', '.vho'];
const LIMITS = { depth: 64, nodes: 20000 };

export function langOf(name) {
  const n = String(name || '').toLowerCase(), dot = n.lastIndexOf('.');
  const ext = dot < 0 ? '' : n.slice(dot);
  return VERILOG_EXT.includes(ext) ? 'verilog' : VHDL_EXT.includes(ext) ? 'vhdl' : null;
}

export function parseSource(name, text, opts = {}) {
  const lang = opts.lang || langOf(name);
  if (lang === 'vhdl') { const r = parseVhdl(text, { file: name }); return { lang, modules: r.modules, orphanArchs: r.orphanArchs, problems: r.problems }; }
  if (lang === 'verilog') { const r = parseVerilog(text, { file: name, include: opts.include, defines: opts.defines }); return { lang, modules: r.modules, orphanArchs: [], problems: r.problems }; }
  return { lang: null, modules: [], orphanArchs: [], problems: [] };
}

/** Is `type` something we never expect a definition for: a gate primitive or a synthesis tool's internal cell ($_AND_, $dff …). */
export const isBuiltin = (type) => GATES.has(type) || String(type).startsWith('$');

export function buildHierarchy(modules, opts = {}) {
  const problems = [], byName = new Map(), byLower = new Map();
  const known = new Set((opts.known || []).map(String));
  for (const m of modules) {
    if (byName.has(m.name)) { const o = byName.get(m.name); problems.push(row('sem.dupmodule', 'error', { name: m.name, other: o.file + ':' + o.line }, m)); continue; }
    byName.set(m.name, m);
    const lo = m.name.toLowerCase(); if (!byLower.has(lo)) byLower.set(lo, m);
  }
  const find = (type, lang) => byName.get(type) || (lang === 'vhdl' || !byName.has(type) ? byLower.get(String(type).toLowerCase()) : null) || null;
  const used = new Set(), missing = [];
  for (const m of byName.values()) for (const inst of m.instances || []) {
    if (inst.gate) continue;
    const def = find(inst.type, m.lang);
    if (def) { used.add(def.name); checkPorts(m, inst, def, problems); continue; }
    if (isBuiltin(inst.type) || known.has(inst.type)) continue;
    missing.push({ type: inst.type, parent: m.name, inst: inst.name, file: m.file, line: inst.typeLine || inst.line, col: inst.typeCol || inst.col });
    problems.push(row('hier.missing', 'error', { type: inst.type, parent: m.name, inst: inst.name }, { file: m.file, line: inst.typeLine || inst.line, col: inst.typeCol || inst.col }));
  }
  const roots = [...byName.values()].filter((m) => !used.has(m.name));
  const sizeOf = new Map();
  const size = (m, seen = new Set()) => {
    if (sizeOf.has(m.name)) return sizeOf.get(m.name);
    if (seen.has(m.name)) return 0;
    seen.add(m.name);
    let n = 1;
    for (const i of m.instances || []) { const d = !i.gate && find(i.type, m.lang); if (d) n += size(d, seen); }
    seen.delete(m.name); sizeOf.set(m.name, n); return n;
  };
  const isTb = (m) => !(m.ports || []).some((p) => p.name);
  let top = null;
  if (opts.top) top = find(opts.top, 'vhdl');
  const designRoots = roots.filter((m) => !isTb(m)), testbenches = roots.filter(isTb);
  const rank = (a, b) => size(b) - size(a) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  if (!top) {
    // the design top: among the roots with ports and the modules a test bench instantiates, the one with the biggest tree
    const tbKids = [];
    for (const tb of testbenches) for (const i of tb.instances || []) { const d = !i.gate && find(i.type, tb.lang); if (d && !tbKids.includes(d)) tbKids.push(d); }
    const cands = [...new Set([...designRoots, ...tbKids])].sort(rank);
    if (cands.length) top = cands[0];
    else if (testbenches.length) top = [...testbenches].sort(rank)[0];
    const big = designRoots.filter((m) => size(m) > 1);
    if (big.length > 1) problems.push(row('hier.manytops', 'note', { names: big.map((m) => m.name).join(', '), top: top.name }, { file: top.file, line: top.line, col: top.col }));
  }
  if (!top && byName.size) problems.push(row('hier.notop', 'warning', {}, {}));
  const unused = [];
  // a library cell's simulation model (its name is a known cell, HD.3 Liberty) is not "unused": it is there for gate-level simulation (chip-runners-09, HD.10)
  for (const m of designRoots) if (top && m.name !== top.name && !known.has(m.name)) { unused.push(m.name); problems.push(row('hier.unused', 'warning', { name: m.name }, m)); }

  // instance trees, with recursion found once per module pair
  const cycles = [], cycleSeen = new Set();
  let count = 0;
  const tree = (m, instName, stack, at) => {
    const node = { module: m.name, inst: instName, lang: m.lang, file: at && at.file ? at.file : m.file, defFile: m.file, line: at ? at.line : m.line, col: at ? at.col : m.col, children: [] };
    if (++count > LIMITS.nodes || stack.length > LIMITS.depth) { node.cut = true; return node; }
    for (const i of m.instances || []) {
      if (i.gate) continue;
      const d = find(i.type, m.lang);
      const where = { line: i.line, col: i.col };
      if (!d) { node.children.push({ module: i.type, inst: i.name, file: m.file, ...where, children: [], missing: !isBuiltin(i.type) && !known.has(i.type), builtin: isBuiltin(i.type) || known.has(i.type) }); continue; }
      if (stack.includes(d.name)) {
        const key = m.name + '>' + d.name;
        if (!cycleSeen.has(key)) { cycleSeen.add(key); const path = [...stack.slice(stack.indexOf(d.name)), d.name].join(' > '); cycles.push(path); problems.push(row('hier.cycle', 'error', { name: d.name, path }, { file: m.file, ...where })); }
        node.children.push({ module: d.name, inst: i.name, file: m.file, ...where, children: [], cycle: true });
        continue;
      }
      node.children.push(tree(d, i.name, [...stack, d.name], { line: i.line, col: i.col, file: m.file }));
    }
    return node;
  };
  const trees = [];
  if (top) trees.push({ role: 'top', ...tree(top, '', [top.name]) });
  for (const tb of testbenches) if (!top || tb.name !== top.name) trees.push({ role: 'testbench', ...tree(tb, '', [tb.name]) });
  for (const name of unused) trees.push({ role: 'unused', ...tree(byName.get(name), '', [name]) });
  return { top: top ? top.name : null, tops: designRoots.map((m) => m.name), testbenches: testbenches.map((m) => m.name), tree: trees[0] || null, trees, missing, unused, cycles, problems };
}

function checkPorts(parent, inst, def, problems) {
  const where = { file: parent.file, line: inst.line, col: inst.col };
  const ports = (def.ports || []).filter((p) => p.name);
  const lower = def.lang === 'vhdl' || parent.lang === 'vhdl';
  const has = (n) => ports.some((p) => (lower ? p.name.toLowerCase() === String(n).toLowerCase() : p.name === n));
  const named = inst.conns.filter((c) => c.port && c.port !== '*');
  for (const c of named) if (!has(c.port)) problems.push(row('hier.portmissing', 'error', { type: def.name, port: c.port, inst: inst.name, parent: parent.name }, { file: parent.file, line: c.line || inst.line, col: c.col || inst.col }));
  const positional = inst.conns.filter((c) => !c.port);
  if (!named.length && positional.length > ports.length && !(positional.length === 1 && !positional[0].expr && !ports.length))
    problems.push(row('hier.portcount', 'error', { inst: inst.name, type: def.name, got: positional.length, want: ports.length }, where));
}

/** Parse every HDL file of a project, then the hierarchy. files: [{name, text}]. VHDL architectures of unknown entities are reported. */
export function analyzeProject(files, opts = {}) {
  const byFile = {}, modules = [], problems = [];
  const texts = new Map(files.map((f) => [f.name, f.text]));
  const include = (n) => { if (texts.has(n)) return texts.get(n); for (const [k, v] of texts) if (k.endsWith('/' + n)) return v; return null; };
  const vhdlEntities = new Set(), orphans = [];
  for (const f of files) {
    const r = parseSource(f.name, f.text, { include, defines: opts.defines });
    if (!r.lang) continue;
    byFile[f.name] = { lang: r.lang, modules: r.modules.map((m) => m.name), problems: r.problems.length };
    modules.push(...r.modules); problems.push(...r.problems);
    if (r.lang === 'vhdl') { for (const m of r.modules) vhdlEntities.add(m.name); orphans.push(...r.orphanArchs); }
  }
  // an architecture in one file may belong to an entity in another
  for (const a of orphans) {
    const e = modules.find((m) => m.lang === 'vhdl' && m.name === a.of);
    if (e) { e.archs.push(a); e.arch = a.name; e.instances = a.instances.map((i) => ({ ...i, gate: false })); e.blocks = a.processes; e.nets = a.signals; }
    else problems.push(row('sem.archnoentity', 'error', { arch: a.name, name: a.rawOf || a.of }, { file: a.file, line: a.line, col: a.col }));
  }
  for (const m of modules) if (m.lang === 'vhdl' && !m.arch) problems.push(row('sem.noarch', 'warning', { name: m.raw || m.name }, m));
  const hier = buildHierarchy(modules, opts);
  problems.push(...hier.problems);
  return { modules, hier, problems: sortRows(problems), byFile };
}

/** Flat list of rows for a tree view: [{depth, module, inst, file, line, col, flags[]}], in display order. */
export function flattenTree(node, depth = 0, out = []) {
  if (!node) return out;
  const flags = [];
  for (const k of ['missing', 'cycle', 'builtin', 'cut']) if (node[k]) flags.push(k);
  if (depth === 0 && node.role) flags.push(node.role);
  out.push({ depth, module: node.module, inst: node.inst, lang: node.lang, file: node.file, line: node.line, col: node.col, flags });
  for (const c of node.children || []) flattenTree(c, depth + 1, out);
  return out;
}

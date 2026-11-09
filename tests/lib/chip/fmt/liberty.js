/* SPDX-License-Identifier: Apache-2.0 */
/**
 * liberty.js — Liberty (.lib) cell libraries: reader, writer, a model view (cells, pins, timing arcs, NLDM tables, power, area) and table lookup.
 * Written from the public description of the format (groups `name (args) { … }`, simple attributes `name : value ;`, complex attributes
 * `name (a, b) ;`, `define (…) ;`, comments, backslash line joins). Our own code, Apache-2.0.
 *
 *   readLiberty(text)          → { tree, problems }            tree = [{ type: 'group'|'simple'|'complex', name, … }]  (lossless enough to write back)
 *   writeLiberty(tree)         → text
 *   libertyModel(tree)         → { name, units, templates, cells: [{ name, area, leakage, leakagePower, pins: [...], ff, latch }] }
 *   buildLiberty(model)        → tree (writes a model made in memory)
 *   lookup(table, x, y)        → number (bilinear inside, linear extrapolation outside, as timing tools use NLDM tables)
 */
import { prob } from './problem.js';

// ---------------------------------------------------------------- tokens
function lex(text, problems) {
  const toks = []; let i = 0, line = 1; const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r' || c === '\f') { i++; continue; }
    if (c === '\\' && (text[i + 1] === '\n' || (text[i + 1] === '\r' && text[i + 2] === '\n'))) { i += text[i + 1] === '\r' ? 3 : 2; line++; continue; }
    if (c === '/' && text[i + 1] === '*') { const e = text.indexOf('*/', i + 2); const stop = e < 0 ? n : e + 2; for (let k = i; k < stop; k++) if (text[k] === '\n') line++; if (e < 0) problems.push(prob('lib.comment', 'A comment is never closed.', { line })); i = stop; continue; }
    if (c === '/' && text[i + 1] === '/') { while (i < n && text[i] !== '\n') i++; continue; }
    if (c === '"') {
      let j = i + 1, s = ''; const l0 = line;
      while (j < n && text[j] !== '"') { if (text[j] === '\\' && (text[j + 1] === '\n' || text[j + 1] === '\r')) { j += text[j + 1] === '\r' ? 3 : 2; line++; continue; } if (text[j] === '\\' && text[j + 1] === '"') { s += '"'; j += 2; continue; } if (text[j] === '\n') line++; s += text[j++]; }
      if (j >= n) problems.push(prob('lib.string', 'A quoted string is never closed.', { line: l0 }));
      toks.push({ k: 's', v: s, line: l0 }); i = j + 1; continue;
    }
    if ('(){}:;,'.includes(c)) { toks.push({ k: c, line }); i++; continue; }
    let j = i; while (j < n && !' \t\r\n\f(){}:;,"'.includes(text[j]) && !(text[j] === '\\' && text[j + 1] === '\n')) j++;
    toks.push({ k: 'w', v: text.slice(i, j), line }); i = j;
  }
  return toks;
}

/** Parse Liberty text into a statement tree. Values keep whether they were quoted, so the writer gives the same text back. */
export function readLiberty(text) {
  const problems = [], t = lex(String(text), problems); let p = 0;
  const peek = (o = 0) => t[p + o];
  const val = (tok) => ({ v: tok.v, q: tok.k === 's' });
  const body = (depth) => {
    const out = [];
    while (p < t.length) {
      const a = peek();
      if (a.k === '}') { if (depth === 0) { problems.push(prob('lib.brace', 'An extra closing brace.', { line: a.line })); p++; continue; } return out; }
      if (a.k === ';') { p++; continue; }
      if (a.k !== 'w' && a.k !== 's') { problems.push(prob('lib.unexpected', 'Unexpected "' + a.k + '".', { line: a.line })); p++; continue; }
      const name = a.v, line = a.line; p++;
      const b = peek();
      if (!b) { problems.push(prob('lib.eof', 'The file ends inside "' + name + '".', { line })); break; }
      if (b.k === ':') {
        p++; const vals = [];
        while (p < t.length && peek().k !== ';' && peek().k !== '}' && peek().line === line) { const x = peek(); if (x.k === 'w' || x.k === 's') vals.push(val(x)); else if (x.k === ',') vals.push({ v: ',', q: false }); else break; p++; }
        if (peek()?.k === ';') p++;
        const v = vals.length === 1 ? vals[0] : { v: vals.map((x) => (x.q ? '"' + x.v + '"' : x.v)).join(' '), q: false, raw: true };
        out.push({ type: 'simple', name, value: v.v, quoted: v.q, line });
      } else if (b.k === '(') {
        p++; const args = []; let closed = false;
        while (p < t.length) { const x = peek(); if (x.k === ')') { p++; closed = true; break; } if (x.k === 'w' || x.k === 's') args.push(val(x)); else if (x.k !== ',') { problems.push(prob('lib.args', 'Unexpected "' + x.k + '" in the arguments of ' + name + '.', { line: x.line })); if (x.k === '{' || x.k === ';' || x.k === '}') break; } p++; }
        if (!closed) problems.push(prob('lib.paren', 'The arguments of ' + name + ' are never closed.', { line }));
        if (peek()?.k === '{') { p++; const kids = body(depth + 1); if (peek()?.k === '}') p++; else problems.push(prob('lib.group', 'Group ' + name + ' is never closed.', { line })); out.push({ type: 'group', name, args, body: kids, line }); }
        else { if (peek()?.k === ';') p++; out.push({ type: 'complex', name, args, line }); }
      } else { problems.push(prob('lib.statement', '"' + name + '" is not followed by ":" or "(".', { line, severity: 'warning' })); }
    }
    return out;
  };
  const tree = body(0);
  if (!tree.some((s) => s.type === 'group' && s.name === 'library')) problems.push(prob('lib.no-library', 'No library group was found.'));
  return { tree, problems };
}

const q = (a) => (a.q ? '"' + String(a.v).replace(/"/g, '\\"') + '"' : a.v);
/** Write a statement tree as Liberty text (2-space indent; long table rows split with backslash line joins). */
export function writeLiberty(tree) {
  const lines = [];
  const w = (st, ind) => {
    const pad = '  '.repeat(ind);
    for (const s of st) {
      if (s.type === 'simple') lines.push(pad + s.name + ' : ' + (s.quoted ? '"' + String(s.value).replace(/"/g, '\\"') + '"' : s.value) + ' ;');
      else if (s.type === 'complex') {
        if (s.args.length > 1 && s.args.every((a) => a.q) && s.args.join && (s.name === 'values' || s.name.startsWith('index'))) lines.push(pad + s.name + ' ( \\\n' + s.args.map((a) => pad + '  ' + q(a)).join(', \\\n') + ' \\\n' + pad + ') ;');
        else lines.push(pad + s.name + ' (' + s.args.map(q).join(', ') + ') ;');
      } else { lines.push(pad + s.name + ' (' + s.args.map(q).join(', ') + ') {'); w(s.body, ind + 1); lines.push(pad + '}'); }
    }
  };
  w(tree, 0); return lines.join('\n') + '\n';
}

/** The tree without line numbers (what a round trip must keep). */
export function plainTree(tree) { return tree.map((s) => (s.type === 'group' ? { type: s.type, name: s.name, args: s.args.map((a) => ({ v: a.v, q: a.q })), body: plainTree(s.body) } : s.type === 'complex' ? { type: s.type, name: s.name, args: s.args.map((a) => ({ v: a.v, q: a.q })) } : { type: s.type, name: s.name, value: s.value, quoted: s.quoted })); }

// ---------------------------------------------------------------- model
const nums = (s) => String(s).split(/[\s,]+/).filter(Boolean).map(Number);
const first = (b, name) => b.find((s) => s.name === name);
const sv = (b, name) => { const s = first(b, name); return s && s.type === 'simple' ? s.value : undefined; };
const nv = (b, name) => { const v = sv(b, name); return v === undefined ? undefined : Number(v); };
export const TABLE_KINDS = ['cell_rise', 'cell_fall', 'rise_transition', 'fall_transition', 'rise_constraint', 'fall_constraint', 'rise_power', 'fall_power', 'power'];

function table(g, templates) {
  const tpl = g.args[0]?.v; const t = { template: tpl };
  const T = templates[tpl] || {};
  for (const k of ['index_1', 'index_2', 'index_3']) { const s = first(g.body, k); if (s && s.type === 'complex') t[k.replace('_', '')] = nums(s.args.map((a) => a.v).join(',')); else if (T[k.replace('_', '')]) t[k.replace('_', '')] = T[k.replace('_', '')]; }
  const vs = first(g.body, 'values'); t.values = vs ? vs.args.map((a) => nums(a.v)) : [];
  if (tpl === 'scalar') t.values = t.values.length ? t.values : [[0]];
  if (T.var1) t.var1 = T.var1; if (T.var2) t.var2 = T.var2;
  return t;
}
function timing(g, templates) {
  const r = { relatedPin: sv(g.body, 'related_pin'), sense: sv(g.body, 'timing_sense'), type: sv(g.body, 'timing_type') || 'combinational', when: sv(g.body, 'when'), tables: {} };
  for (const s of g.body) if (s.type === 'group' && TABLE_KINDS.includes(s.name)) r.tables[s.name] = table(s, templates);
  return r;
}
function pin(g, templates) {
  const p = { name: g.args.map((a) => a.v).join(','), direction: sv(g.body, 'direction'), capacitance: nv(g.body, 'capacitance'), riseCapacitance: nv(g.body, 'rise_capacitance'), fallCapacitance: nv(g.body, 'fall_capacitance'),
    function: sv(g.body, 'function'), maxTransition: nv(g.body, 'max_transition'), maxCapacitance: nv(g.body, 'max_capacitance'), clock: sv(g.body, 'clock') === 'true' ? true : undefined, timing: [], internalPower: [] };
  for (const s of g.body) {
    if (s.type !== 'group') continue;
    if (s.name === 'timing') p.timing.push(timing(s, templates));
    else if (s.name === 'internal_power') { const ip = { relatedPin: sv(s.body, 'related_pin'), when: sv(s.body, 'when'), tables: {} }; for (const k of s.body) if (k.type === 'group' && TABLE_KINDS.includes(k.name)) ip.tables[k.name] = table(k, templates); p.internalPower.push(ip); }
  }
  return p;
}

/** A plain model of a parsed library: what the timing, power and floorplan views read. */
export function libertyModel(tree) {
  const lib = tree.find((s) => s.type === 'group' && s.name === 'library'); if (!lib) return null;
  const b = lib.body, units = {};
  for (const [k, n] of [['time', 'time_unit'], ['voltage', 'voltage_unit'], ['current', 'current_unit'], ['resistance', 'pulling_resistance_unit'], ['leakage', 'leakage_power_unit']]) { const v = sv(b, n); if (v !== undefined) units[k] = v; }
  const cl = first(b, 'capacitive_load_unit'); if (cl && cl.type === 'complex') units.cap = cl.args.map((a) => a.v).join('');
  const templates = {};
  for (const s of b) if (s.type === 'group' && /_template$|^lu_table_template$|^power_lut_template$/.test(s.name)) {
    const t = { kind: s.name, var1: sv(s.body, 'variable_1'), var2: sv(s.body, 'variable_2'), var3: sv(s.body, 'variable_3') };
    for (const k of ['index_1', 'index_2', 'index_3']) { const x = first(s.body, k); if (x && x.type === 'complex') t[k.replace('_', '')] = nums(x.args.map((a) => a.v).join(',')); }
    templates[s.args[0]?.v] = t;
  }
  const cells = [];
  for (const s of b) if (s.type === 'group' && s.name === 'cell') {
    const c = { name: s.args[0]?.v, area: nv(s.body, 'area'), leakage: nv(s.body, 'cell_leakage_power'), footprint: sv(s.body, 'cell_footprint'), dontUse: sv(s.body, 'dont_use') === 'true' ? true : undefined, leakagePower: [], pins: [] };
    for (const k of s.body) {
      if (k.type !== 'group') continue;
      if (k.name === 'pin') c.pins.push(pin(k, templates));
      else if (k.name === 'bus' || k.name === 'bundle') { const bus = pin(k, templates); bus.bus = true; bus.pins = k.body.filter((x) => x.type === 'group' && x.name === 'pin').map((x) => pin(x, templates)); c.pins.push(bus); }
      else if (k.name === 'leakage_power') c.leakagePower.push({ when: sv(k.body, 'when'), value: nv(k.body, 'value') });
      else if (k.name === 'ff' || k.name === 'latch') c[k.name] = { names: k.args.map((a) => a.v), clockedOn: sv(k.body, 'clocked_on'), nextState: sv(k.body, 'next_state'), enable: sv(k.body, 'enable'), dataIn: sv(k.body, 'data_in'), clear: sv(k.body, 'clear'), preset: sv(k.body, 'preset') };
    }
    cells.push(c);
  }
  return { name: lib.args[0]?.v, delayModel: sv(b, 'delay_model'), units, nom: { voltage: nv(b, 'nom_voltage'), temperature: nv(b, 'nom_temperature'), process: nv(b, 'nom_process') }, templates, cells };
}

// ---------------------------------------------------------------- model → tree
const S = (name, value, quoted = false) => ({ type: 'simple', name, value: String(value), quoted });
const C = (name, args) => ({ type: 'complex', name, args });
const G = (name, args, body) => ({ type: 'group', name, args: args.map((v) => ({ v: String(v), q: false })), body });
const list = (a) => ({ v: a.join(', '), q: true });
function tableTree(name, t) {
  const body = [];
  if (t.template !== 'scalar') { if (t.index1) body.push(C('index_1', [list(t.index1)])); if (t.index2) body.push(C('index_2', [list(t.index2)])); if (t.index3) body.push(C('index_3', [list(t.index3)])); }
  body.push(C('values', t.values.map(list))); return G(name, [t.template], body);
}
function pinTree(p) {
  const b = [];
  if (p.direction) b.push(S('direction', p.direction));
  for (const [k, n] of [['capacitance', 'capacitance'], ['riseCapacitance', 'rise_capacitance'], ['fallCapacitance', 'fall_capacitance'], ['maxTransition', 'max_transition'], ['maxCapacitance', 'max_capacitance']]) if (p[k] !== undefined) b.push(S(n, p[k]));
  if (p.clock) b.push(S('clock', 'true'));
  if (p.function) b.push(S('function', p.function, true));
  for (const ip of p.internalPower || []) { const x = []; if (ip.relatedPin) x.push(S('related_pin', ip.relatedPin, true)); if (ip.when) x.push(S('when', ip.when, true)); for (const [k, t] of Object.entries(ip.tables)) x.push(tableTree(k, t)); b.push(G('internal_power', [], x)); }
  for (const tm of p.timing || []) {
    const x = []; if (tm.relatedPin) x.push(S('related_pin', tm.relatedPin, true)); if (tm.sense) x.push(S('timing_sense', tm.sense)); if (tm.type && tm.type !== 'combinational') x.push(S('timing_type', tm.type)); if (tm.when) x.push(S('when', tm.when, true));
    for (const [k, t] of Object.entries(tm.tables)) x.push(tableTree(k, t)); b.push(G('timing', [], x));
  }
  if (p.bus) for (const k of p.pins || []) b.push(pinTree(k));
  return G(p.bus ? 'bus' : 'pin', [p.name], b);
}
/** Build a statement tree from a model (as libertyModel returns, or made by hand). */
export function buildLiberty(m) {
  const b = [S('delay_model', m.delayModel || 'table_lookup')];
  const U = m.units || {}; for (const [k, n] of [['time', 'time_unit'], ['voltage', 'voltage_unit'], ['current', 'current_unit'], ['resistance', 'pulling_resistance_unit'], ['leakage', 'leakage_power_unit']]) if (U[k]) b.push(S(n, U[k], true));
  if (U.cap) { const mm = /^([\d.]+)(.*)$/.exec(U.cap); b.push(C('capacitive_load_unit', mm ? [{ v: mm[1], q: false }, { v: mm[2], q: false }] : [{ v: U.cap, q: false }])); }
  if (m.nom) for (const [k, n] of [['process', 'nom_process'], ['temperature', 'nom_temperature'], ['voltage', 'nom_voltage']]) if (m.nom[k] !== undefined) b.push(S(n, m.nom[k]));
  for (const [name, t] of Object.entries(m.templates || {})) { const x = []; if (t.var1) x.push(S('variable_1', t.var1)); if (t.var2) x.push(S('variable_2', t.var2)); if (t.var3) x.push(S('variable_3', t.var3)); for (const k of ['index1', 'index2', 'index3']) if (t[k]) x.push(C(k.replace('x', 'x_'), [list(t[k])])); b.push(G(t.kind || 'lu_table_template', [name], x)); }
  for (const c of m.cells || []) {
    const x = []; if (c.area !== undefined) x.push(S('area', c.area)); if (c.footprint) x.push(S('cell_footprint', c.footprint, true)); if (c.dontUse) x.push(S('dont_use', 'true')); if (c.leakage !== undefined) x.push(S('cell_leakage_power', c.leakage));
    for (const lp of c.leakagePower || []) { const y = []; if (lp.when) y.push(S('when', lp.when, true)); y.push(S('value', lp.value)); x.push(G('leakage_power', [], y)); }
    for (const k of ['ff', 'latch']) if (c[k]) { const f = c[k], y = []; for (const [a, n] of [['clockedOn', 'clocked_on'], ['nextState', 'next_state'], ['enable', 'enable'], ['dataIn', 'data_in'], ['clear', 'clear'], ['preset', 'preset']]) if (f[a]) y.push(S(n, f[a], true)); x.push(G(k, f.names, y)); }
    for (const p of c.pins) x.push(pinTree(p));
    b.push(G('cell', [c.name], x));
  }
  return [G('library', [m.name], b)];
}

// ---------------------------------------------------------------- lookup
function seg(ix, v) { if (ix.length < 2) return [0, 0]; let i = 0; while (i < ix.length - 2 && v > ix[i + 1]) i++; return [i, (v - ix[i]) / (ix[i + 1] - ix[i])]; }
/** Value of an NLDM table at (x = index_1 variable, y = index_2 variable): bilinear inside the grid, linear extrapolation outside. */
export function lookup(t, x, y = 0) {
  const V = t.values; if (!V.length) return NaN;
  const i1 = t.index1 || [], i2 = t.index2;
  if (!i2) { const row = V.length === 1 ? V[0] : V.map((r) => r[0]); if (row.length === 1) return row[0]; const [i, f] = seg(i1, x); return row[i] + (row[i + 1] - row[i]) * f; }
  if (V.length === 1) { const [j, g] = seg(i2, y); return V[0][j] + (V[0][j + 1] - V[0][j]) * g; }
  const [i, f] = seg(i1, x), [j, g] = seg(i2, y);
  const a = V[i][j], b = V[i][j + 1] ?? a, c = V[i + 1][j], d = V[i + 1][j + 1] ?? c;
  return a * (1 - f) * (1 - g) + b * (1 - f) * g + c * f * (1 - g) + d * f * g;
}

/** Findings worth a look in a model: cells without area, output pins without timing, tables whose size does not match their indexes. */
export function checkLiberty(m) {
  const out = [];
  for (const c of m.cells) {
    if (c.area === undefined) out.push(prob('lib.no-area', 'Cell ' + c.name + ' has no area.', { severity: 'warning', about: [{ kind: 'cell', id: c.name }] }));
    for (const p of c.pins) {
      if (p.direction === 'output' && !p.timing.length && !c.ff && !c.latch) out.push(prob('lib.no-timing', 'Output ' + c.name + '/' + p.name + ' has no timing arc.', { severity: 'note', about: [{ kind: 'pin', id: c.name + '/' + p.name }] }));
      for (const tm of p.timing) for (const [k, t] of Object.entries(tm.tables)) {
        if (t.template === 'scalar') continue;
        const r = (t.index1 || []).length, cc = (t.index2 || []).length;
        const bad = t.index2 ? (t.values.length !== r || t.values.some((row) => row.length !== cc)) : !(t.values.length === 1 && t.values[0].length === r);
        if (bad) out.push(prob('lib.table-size', c.name + '/' + p.name + ' ' + k + ' has ' + t.values.length + ' × ' + (t.values[0]?.length || 0) + ' values; its indexes say ' + (t.index2 ? r + ' × ' + cc : '1 × ' + r) + '.', { about: [{ kind: 'pin', id: c.name + '/' + p.name }] }));
        for (const ix of [t.index1, t.index2]) if (ix && ix.some((v, i) => i && v <= ix[i - 1])) out.push(prob('lib.index-order', c.name + '/' + p.name + ' ' + k + ' has an index that does not increase.', { severity: 'warning' }));
      }
    }
  }
  return out;
}
